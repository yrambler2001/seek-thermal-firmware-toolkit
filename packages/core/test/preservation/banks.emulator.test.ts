/* ==================================================================== *
 * The banks a preservation run writes, end to end on the FW-V1 emulator
 * (TESTING.md 42.92): parts whose boot-config word makes the next start
 * enter recovery R, run with the default choice (the bank the next start
 * enters) and with every bank; and a run that patches a bank the next
 * start does not enter, whose drain must stop before it arms anything.
 *
 *   1.3.0.0 — the vendored 101310HSNEA2 dump (A and R hold the image, B is
 *             erased) with cfg[0] = 2; and the same part as the bootloader's
 *             warm-boot path leaves it (FW-V1 docs/HARDWARE_BRINGUP.md
 *             sec. 19, the camera's own `4.bin`): cfg[0] = 2 and slot A's
 *             header word overwritten with the 0xAA55FF01 mark.
 *   1.0.3.0 — the native 0C21A1M5KP15 dump (A, B and R hold the image under
 *             the device stream) with cfg[0] = 2, and as dumped (word blank).
 *
 * Every run follows the families suite's choreography: SERVER A takes
 * backup + patch + commit with --flash-out (its `.final` is the post-commit
 * ground truth); the DRAIN runs on a server booted from that truth (the
 * reset, then a fresh server on the ladder); the RESTORE on its own server;
 * VERIFY on a fresh boot. Offline proofs: the commit moved exactly each
 * chosen bank's patch bytes, raw == post-commit, delivered == as-booted,
 * restored == as-booted.
 * ==================================================================== */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { silentReporter, type Reporter } from '../../src/events.js';
import { SeekError } from '../../src/errors.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { WebUsbTransport } from '../../src/protocol/webusb.js';
import { FLASH_SIZE } from '../../src/profiles/modern-4x.js';
import {
  PRESERVE_DUMP_ORIGINAL_FILE,
  PRESERVE_DUMP_PATCHED_FILE,
  buildV1Patch,
  createPreserveRun,
  preservePlainFile,
  readVersion,
  recordStepFailure,
  runPreserveStep,
  type BankKey,
  type PreserveArtifactLoader,
  type PreserveBankChoice,
  type PreserveRunState,
  type SessionOpener,
} from '../../src/preservation/index.js';
import { RowEmulators, liveEmulatorCount, type Emulator } from '../emulator/harness.js';
import { EMU_DIR, announceSkip, scratchFile, URB_TIMEOUT_MS } from '../emulator/suite.js';

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
const REBOOT_WAIT_MS = 15_000;
const JEDEC = '010215';
const OFFSET: Readonly<Record<BankKey, number>> = { a: 0x50000, b: 0x60000, r: 0x70000 };

function corpusFile(...parts: readonly string[]): string | null {
  if (EMU_DIR === null) return null;
  const file = path.join(EMU_DIR, 'data', 'corpus', ...parts);
  return existsSync(file) ? file : null;
}

const DUMP_1300 = corpusFile(
  'compact',
  '2014.10.21-14.58.29-1.3.0.0',
  '101310HSNEA2',
  'compact_101310hsnea2_4mb.bin',
);
const DUMP_1030 = corpusFile(
  'compact_pro',
  '2016.07.06-17.04.49-1.0.3.0',
  '0C21A1M5KP15',
  'compact_pro_android_uq-aaa.bin',
);

function unsupported(): string | null {
  if (EMU_DIR === null) return 'no emulator found (SEEK_EMU_DIR)';
  const cli = path.join(EMU_DIR, 'seekemu', 'cli.py');
  if (!existsSync(cli)) return `${EMU_DIR} has no seekemu/cli.py`;
  const text = readFileSync(cli, 'utf8');
  for (const flag of ['--jedec', '--flash', '--flash-out', '--usbip-clock']) {
    if (!text.includes(flag)) return `the emulator at ${EMU_DIR} does not support ${flag}`;
  }
  return null;
}

const UNSUPPORTED = unsupported();
if (UNSUPPORTED !== null) announceSkip(`preservation banks (${UNSUPPORTED})`);

/* ---- sessions -------------------------------------------------------------- */

interface Attached {
  readonly seek: SeekDevice;
  close(): Promise<void>;
}

async function attach(emu: Emulator): Promise<Attached> {
  const device = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
  const transport = new WebUsbTransport(device, {
    recipient: 'auto',
    api: 'usbip (emulator)',
    host: 'vitest preservation banks',
    clock: device.deadlineClock,
  });
  await transport.open();
  return {
    seek: new SeekDevice(transport, { reporter: silentReporter }),
    close: async () => {
      await device.close().catch(() => undefined);
    },
  };
}

function boot(row: RowEmulators, flash: string, flashOut?: string): Promise<Emulator> {
  return row.start(EMU_DIR!, {
    entryId: `flash:${path.basename(flash)}`,
    readyTimeoutMs: 180_000,
    jedec: JEDEC,
    flashOverride: flash,
    ...(flashOut === undefined ? {} : { flashOut }),
  });
}

/** The doc 35.4 first-session shape: a freshly booted server's first session can stall its first vendor
 *  INs; a touched second session is the one that works. */
async function warm(emu: Emulator): Promise<void> {
  try {
    const session = await attach(emu);
    try {
      await session.seek.getErrorCode();
      await session.seek.getErrorCode();
      await readVersion(session.seek);
    } finally {
      await session.close();
    }
  } catch {
    /* the step's own gates decide */
  }
}

function singleServerOpener(emu: Emulator): SessionOpener {
  let current: Attached | null = null;
  return {
    open: async () => {
      current = await attach(emu);
      return current.seek;
    },
    close: async () => {
      const session = current;
      current = null;
      await session?.close();
    },
  };
}

/** The drain's ladder: the reset's own session, back to the reset server after the reboot wait, then a
 *  fresh server booted from the committed part. */
function drainOpener(row: RowEmulators, flash: string): SessionOpener {
  let resetServer: Emulator | null = null;
  let visits = 0;
  let current: Attached | null = null;
  return {
    open: async () => {
      if (resetServer === null) {
        resetServer = await boot(row, flash);
        await warm(resetServer);
        current = await attach(resetServer);
        return current.seek;
      }
      if (visits < 1) {
        visits += 1;
        await new Promise((resolve) => setTimeout(resolve, REBOOT_WAIT_MS));
        current = await attach(resetServer);
        return current.seek;
      }
      const fresh = await boot(row, flash);
      await warm(fresh);
      current = await attach(fresh);
      return current.seek;
    },
    close: async () => {
      const session = current;
      current = null;
      await session?.close();
    },
  };
}

function memoryStore(): {
  load: PreserveArtifactLoader;
  keep: (outcome: { readonly artifacts: readonly { name: string; data: Uint8Array }[] }) => void;
} {
  const map = new Map<string, Uint8Array>();
  return {
    load: (name) => Promise.resolve(map.get(name) ?? null),
    keep: (outcome) => {
      for (const artifact of outcome.artifacts) map.set(artifact.name, artifact.data);
    },
  };
}

function logReporter(label: string): Reporter {
  return {
    log: (message, level) => {
      if (level === 'warn' || level === 'error') {
        process.stderr.write(`[banks ${label}] ${level}: ${message}\n`);
      }
    },
    progress: () => undefined,
    artifact: () => undefined,
  };
}

function diffOffsets(a: Uint8Array, b: Uint8Array): number[] {
  const out: number[] = [];
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) out.push(i);
  return out;
}

/** A copy of `dump` with cfg[0] = `word`, and optional edits, written to the scratch folder. */
function partOf(
  dump: string,
  label: string,
  word: number | null,
  edit?: (part: Uint8Array) => void,
): string {
  const part = new Uint8Array(readFileSync(dump));
  if (word !== null) new DataView(part.buffer).setUint32(0x10000, word >>> 0, true);
  edit?.(part);
  const file = scratchFile(`banks_${label}_part.bin`);
  writeFileSync(file, part);
  return file;
}

/** One step on a fresh server booted from `flash`, retried once on a fresh server when the version gate
 *  stalls before anything was written (the doc 35.4 first-session shape). */
async function stepOnFreshServer(
  label: string,
  step: 'restore' | 'verify',
  flash: string,
  state: PreserveRunState,
  store: ReturnType<typeof memoryStore>,
  flashOut?: string,
): Promise<{ state: PreserveRunState; server: Emulator | null; row: RowEmulators }> {
  const row = new RowEmulators(`${label} ${step}`);
  for (let attempt = 0; attempt < 2; attempt++) {
    const emu = await boot(row, flash, flashOut);
    try {
      await warm(emu);
      const outcome = await runPreserveStep(
        step,
        singleServerOpener(emu),
        state,
        store.load,
        logReporter(`${label} ${step}`),
      );
      store.keep(outcome);
      return { state: outcome.state, server: emu, row };
    } catch (error) {
      await emu.stop(120_000);
      const stalled = error instanceof Error && error.message.includes('control IN 0x4e -> stall');
      if (!stalled || attempt === 1) {
        process.stderr.write(`--- ${label} ${step} log ---\n${row.lastLog(80)}\n`);
        throw error;
      }
    }
  }
  return { state, server: null, row };
}

interface RunSpec {
  readonly label: string;
  readonly part: string;
  readonly banks?: PreserveBankChoice;
  /** The bank the backup must name as the next start. */
  readonly nextStart: BankKey;
  /** The banks the run must write. */
  readonly targets: readonly BankKey[];
  /** The bank the drain's start must enter, or 'refused' when the run patches a bank it does not. */
  readonly drain: BankKey | 'refused';
  /** Extra checks on the backup's state. */
  readonly afterBackup?: (state: PreserveRunState) => void;
}

/** A whole run, with the offline proofs. Returns the final state. */
async function runOnEmulator(spec: RunSpec): Promise<PreserveRunState> {
  const t0 = Date.now();
  const store = memoryStore();
  let state = (
    await createPreserveRun({
      runId: `banks-${spec.label}`,
      drainChunk: 64,
      ...(spec.banks === undefined ? {} : { banks: spec.banks }),
    })
  ).state;

  /* ---- SERVER A: backup, patch, commit ------------------------------------ */
  const asbootedPath = scratchFile(`banks_${spec.label}_asbooted.bin`);
  const rowA = new RowEmulators(`${spec.label} A`);
  const emuA = await boot(rowA, spec.part, asbootedPath);
  try {
    await warm(emuA);
    for (const id of ['backup', 'patch', 'commit'] as const) {
      const outcome = await rowA.guard(emuA, () =>
        runPreserveStep(id, singleServerOpener(emuA), state, store.load, logReporter(spec.label)),
      );
      store.keep(outcome);
      state = outcome.state;
      if (id === 'backup') {
        process.stderr.write(
          `[banks ${spec.label}] backup: word ${String(state.boot?.word)}, entered ` +
            `${String(state.boot?.entered)}, next start ${String(state.boot?.nextStart)} — ` +
            `${state.boot?.why ?? ''}; targets ${String(state.targets)}\n`,
        );
        expect(state.boot?.nextStart).toBe(spec.nextStart);
        expect(state.targets).toEqual(spec.targets);
        spec.afterBackup?.(state);
      }
    }
  } catch (error) {
    process.stderr.write(`--- ${spec.label} A log ---\n${rowA.lastLog(80)}\n`);
    throw error;
  } finally {
    await emuA.stop(120_000);
  }
  await rowA.finish();
  process.stderr.write(
    `[banks ${spec.label}] commit: ${state.steps.commit?.notes ?? ''} (${((Date.now() - t0) / 1000).toFixed(1)} s)\n`,
  );

  const asbooted = new Uint8Array(readFileSync(asbootedPath));
  const truthPath = `${asbootedPath}.final`;
  const truth = new Uint8Array(readFileSync(truthPath));
  expect(truth.length).toBe(FLASH_SIZE);
  /* The commit moved EXACTLY each chosen bank's patch bytes, inside those banks. */
  const expected: number[] = [];
  for (const key of spec.targets) {
    const plain = (await store.load(preservePlainFile(key)))!;
    for (const offset of buildV1Patch(plain).diffOffsets) expected.push(OFFSET[key] + offset);
  }
  expect(diffOffsets(asbooted, truth)).toEqual(expected.sort((a, b) => a - b));

  /* ---- SERVERS B: the drain ---------------------------------------------- */
  const t1 = Date.now();
  const rowB = new RowEmulators(`${spec.label} B`);
  const drained = await runPreserveStep(
    'drain',
    drainOpener(rowB, truthPath),
    state,
    store.load,
    logReporter(`${spec.label} drain`),
  ).then(
    (outcome) => ({ ok: true as const, outcome }),
    (error: unknown) => ({ ok: false as const, error }),
  );
  await rowB.finish();
  if (spec.drain === 'refused') {
    expect(drained.ok, 'the drain must stop on a start that entered an unpatched bank').toBe(false);
    if (drained.ok) throw new Error('unreachable');
    const error = drained.error;
    expect(error).toBeInstanceOf(SeekError);
    expect((error as Error).message).toMatch(/which this run did not patch/);
    process.stderr.write(
      `[banks ${spec.label}] drain refused after ${((Date.now() - t1) / 1000).toFixed(1)} s: ` +
        `${(error as Error).message}\n`,
    );
    state = recordStepFailure(state, 'drain', error);
  } else {
    if (!drained.ok) throw drained.error;
    store.keep(drained.outcome);
    state = drained.outcome.state;
    expect(state.drainEntered).toBe(spec.drain);
    const raw = (await store.load(PRESERVE_DUMP_PATCHED_FILE))!;
    const delivered = (await store.load(PRESERVE_DUMP_ORIGINAL_FILE))!;
    expect(diffOffsets(raw, truth), 'raw dump vs the post-commit part').toEqual([]);
    expect(diffOffsets(delivered, asbooted), 'delivered dump vs the as-booted part').toEqual([]);
    process.stderr.write(
      `[banks ${spec.label}] drain ${((Date.now() - t1) / 1000).toFixed(1)} s: entered ` +
        `${String(state.drainEntered)}; raw ${sha256(raw)}; delivered ${sha256(delivered)}; ` +
        `as-booted ${sha256(asbooted)}\n`,
    );
  }

  /* ---- SERVER C: the restore; SERVER D: the verify ------------------------ */
  const restoredPath = scratchFile(`banks_${spec.label}_restored.bin`);
  const restored = await stepOnFreshServer(
    spec.label,
    'restore',
    truthPath,
    state,
    store,
    restoredPath,
  );
  state = restored.state;
  process.stderr.write(`[banks ${spec.label}] restore: ${state.steps.restore?.notes ?? ''}\n`);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await restored.server?.stop(120_000);
  await restored.row.finish();
  const restoredFinal = `${restoredPath}.final`;
  const verifySource = existsSync(restoredFinal) ? restoredFinal : asbootedPath;
  if (existsSync(restoredFinal)) {
    const restoredPart = new Uint8Array(readFileSync(restoredFinal));
    expect(diffOffsets(restoredPart, asbooted), 'restored part vs the as-booted part').toEqual([]);
  }
  const verified = await stepOnFreshServer(spec.label, 'verify', verifySource, state, store);
  state = verified.state;
  await verified.server?.stop(120_000);
  await verified.row.finish();
  expect(state.nextStep).toBe('done');
  expect(state.verify).toEqual({ diffBytes: 0, windowsRead: 31, badWindows: [] });
  process.stderr.write(
    `[banks ${spec.label}] DONE in ${((Date.now() - t0) / 1000).toFixed(1)} s; as-booted ` +
      `${sha256(asbooted)}; restored ${existsSync(restoredFinal) ? sha256(readFileSync(restoredFinal)) : '(no .final)'}\n`,
  );
  return state;
}

/* ==================================================================== *
 * 1.3.0.0, the 2014 chain
 * ==================================================================== */

describe.skipIf(UNSUPPORTED !== null || DUMP_1300 === null)(
  'Compact 1.3.0.0 with the boot word at recovery R first (emulator)',
  () => {
    it(
      'the default writes R, the start enters R, and R is put back',
      { timeout: 3_600_000 },
      async () => {
        await runOnEmulator({
          label: '1300-word2-default',
          part: partOf(DUMP_1300!, '1300-word2', 2),
          nextStart: 'r',
          targets: ['r'],
          drain: 'r',
          afterBackup: (state) => {
            expect(state.boot?.entered).toBe('r');
            expect(state.boot?.verdicts).toEqual({ a: true, b: false, r: true });
            expect(state.banks?.a.refused).toBeNull();
            expect(state.banks?.b.refused).toBe('it is erased');
          },
        });
        expect(liveEmulatorCount()).toBe(0);
      },
    );

    it(
      'every bank writes A and R (B is erased), and both are put back',
      { timeout: 3_600_000 },
      async () => {
        await runOnEmulator({
          label: '1300-word2-all',
          part: partOf(DUMP_1300!, '1300-word2', 2),
          banks: 'all',
          nextStart: 'r',
          targets: ['a', 'r'],
          drain: 'r',
        });
        expect(liveEmulatorCount()).toBe(0);
      },
    );

    it(
      'the warm-boot state (cfg[0] = 2, slot A marked 0xAA55FF01): A is not written, the default writes R',
      { timeout: 3_600_000 },
      async () => {
        await runOnEmulator({
          label: '1300-warm',
          part: partOf(DUMP_1300!, '1300-warm', 2, (part) => {
            new DataView(part.buffer).setUint32(0x50200, 0xaa55ff01, true);
          }),
          nextStart: 'r',
          targets: ['r'],
          drain: 'r',
          afterBackup: (state) => {
            expect(state.banks?.a.holds).toBe('other');
            expect(state.banks?.a.refused).toMatch(/0xAA55FF01, the mark the bootloader writes/);
            expect(state.boot?.verdicts.a).toBe(false);
          },
        });
        expect(liveEmulatorCount()).toBe(0);
      },
    );
  },
);

/* ==================================================================== *
 * 1.0.3.0, the 2016 line
 * ==================================================================== */

describe.skipIf(UNSUPPORTED !== null || DUMP_1030 === null)(
  'Compact PRO 1.0.3.0 with the boot word at recovery R first, and a bank the start does not enter (emulator)',
  () => {
    it(
      'the default writes R, the start enters R, and R is put back',
      { timeout: 3_600_000 },
      async () => {
        await runOnEmulator({
          label: '1030-word2-default',
          part: partOf(DUMP_1030!, '1030-word2', 2),
          nextStart: 'r',
          targets: ['r'],
          drain: 'r',
          afterBackup: (state) => {
            expect(state.boot?.entered).toBe('r');
            expect(state.boot?.checkKeyUnnamed).toBeNull();
            expect(state.boot?.verdicts).toEqual({ a: true, b: true, r: true });
          },
        });
        expect(liveEmulatorCount()).toBe(0);
      },
    );

    it(
      'every bank writes A, B and R, and all three are put back',
      { timeout: 3_600_000 },
      async () => {
        await runOnEmulator({
          label: '1030-word2-all',
          part: partOf(DUMP_1030!, '1030-word2', 2),
          banks: 'all',
          nextStart: 'r',
          targets: ['a', 'b', 'r'],
          drain: 'r',
        });
        expect(liveEmulatorCount()).toBe(0);
      },
    );

    it(
      'the word at slot A first and the choice recovery R: the drain stops before it arms anything, and the restore puts R back',
      { timeout: 3_600_000 },
      async () => {
        await runOnEmulator({
          label: '1030-blank-r-only',
          part: partOf(DUMP_1030!, '1030-blank', null),
          banks: 'r',
          nextStart: 'a',
          targets: ['r'],
          drain: 'refused',
        });
        expect(liveEmulatorCount()).toBe(0);
      },
    );
  },
);
