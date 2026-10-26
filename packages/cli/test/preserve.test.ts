/**
 * `seek-fw preserve`, stepwise: the checkpointing, the resume and the gates.
 *
 * Every test here runs the REAL command against core's fake camera wired as a
 * v1 locked-line part — blank boot-config record, factory plaintext in bank A,
 * the selector map the pipeline arms, mode 2 widened to the whole part. That
 * is the same shape the emulator suite proves end to end; what the CLI tests
 * add is the run directory: a checkpoint after every step, a resume from a run
 * the drain killed, a `--from-step` that refuses on a torn directory, and a
 * `--print-state` that says which checkpoint files still match.
 *
 * THE RUN SELF-SOURCES: no test passes an image. The command takes no
 * positional at all — the backup step derives each bank's factory plaintext
 * from the bank itself (two agreeing reads), writes it into the run directory
 * as `preserve_bank_<bank>_plain.bin`, and every later step loads it from
 * there. Which banks the run writes is `--bank` (default: the bank the next
 * start enters); the plan says which bank that is, and why, before the first
 * write. An older run directory (schema 1 or 2) is refused with the remedy.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { OP } from '@seek-fw/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  FLASH_SIZE,
  PRESERVE_BACKUP_FILE,
  PRESERVE_DUMP_ORIGINAL_FILE,
  PRESERVE_DUMP_POSTWRITE_FILE,
  PRESERVE_RUN_STATE_FILE,
  preserveCaptureFile,
  preservePatchedFile,
  preservePlainFile,
  REBALANCE_WORD_OFFSET,
  V1_2014_PATCH_SITES,
  sha256hex,
  wordSum,
  type PreserveRunState,
  type UsbBackend,
} from '@seek-fw/core';
import { FakeCamera, type FakeWindowSpec } from '../../core/test/fake-transport.js';
import {
  boardPatched,
  cp1030Camera,
  rootsReply,
} from '../../core/test/preservation/fixtures-2016.js';
import type { StallPoint } from '../../core/test/fake-transport.js';
import { run } from '../src/cli.js';
import { EXIT_CANCELLED, EXIT_FAILED, EXIT_OK, EXIT_USAGE } from '../src/errors.js';
import { fixedBackend, tempDir, testIo } from './helpers.js';
import type { BackendOptions } from '../src/backend.js';

let dir = '';
let cleanup: () => Promise<void> = (): Promise<void> => Promise.resolve();

beforeEach(async () => {
  const temp = await tempDir();
  dir = temp.path;
  cleanup = temp.cleanup;
});
afterEach(async () => {
  await cleanup();
});

function signal(): AbortSignal {
  return new AbortController().signal;
}

/* ---- the synthetic factory plaintext (the patch sites included) --------- */

const IMAGE_LENGTH = 0x4000;
const VERSION_WORD = 0x0000_0301; /* -> "1.3.0.0" */
const EXPECTED_VERSION = '1.3.0.0';
const BANK_A_OFFSET = 0x50000;

function syntheticPlain(): Uint8Array {
  const bytes = new Uint8Array(IMAGE_LENGTH);
  let state = 0x12345678;
  for (let i = 0; i < bytes.length; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    bytes[i] = state & 0xff;
  }
  for (const site of V1_2014_PATCH_SITES) bytes.set(site.before, site.offset);
  const dv = new DataView(bytes.buffer);
  bytes[REBALANCE_WORD_OFFSET] = 0;
  bytes[REBALANCE_WORD_OFFSET + 1] = 0;
  bytes[REBALANCE_WORD_OFFSET + 2] = 0;
  bytes[REBALANCE_WORD_OFFSET + 3] = 0;
  dv.setUint32(0x200, 0xa1b2c3d4, true);
  dv.setUint32(0x204, IMAGE_LENGTH, true);
  dv.setUint32(0x20c, VERSION_WORD, true);
  const scratch = 0x3ff0;
  dv.setUint32(scratch, 0, true);
  dv.setUint32(scratch, (0 - wordSum(bytes)) >>> 0, true);
  if (wordSum(bytes) !== 0) throw new Error('fixture is not balanced');
  return bytes;
}

/* ---- the fake v1 camera -------------------------------------------------- */

function v1WindowMap(): FakeWindowSpec[] {
  const windows: FakeWindowSpec[] = [{ subcmd: 2, offset: 0, size: FLASH_SIZE }];
  for (let mode = 3; mode <= 9; mode++) {
    windows.push({ subcmd: mode, offset: (mode - 2) * 0x10000 });
  }
  for (let mode = 0x0a; mode <= 0x21; mode++) {
    windows.push({ subcmd: mode, offset: 0x80000 + (mode - 0x0a) * 0x10000 });
  }
  return windows;
}

function v1Camera(
  plain: Uint8Array,
  options: {
    readonly flash?: Uint8Array;
    readonly stallDrain?: boolean;
    readonly stallAt?: readonly StallPoint[];
    /** The bank the camera reports it entered (GetFirmwareInfo selector 10); undefined: no answer. */
    readonly entered?: number;
  } = {},
): FakeCamera {
  const flash =
    options.flash ??
    (() => {
      const bytes = new Uint8Array(FLASH_SIZE).fill(0xff);
      new DataView(bytes.buffer).setUint32(0x10000, 0xffffffff, true); /* blank cfg -> bank A */
      bytes.set(plain, BANK_A_OFFSET);
      return bytes;
    })();
  const stallAt: readonly StallPoint[] | undefined =
    /* the widened window never answers, for the stallDrain shape */
    options.stallAt ?? (options.stallDrain === true ? [{ subcmd: 2, offset: 0 }] : undefined);
  return new FakeCamera({
    flash,
    windows: v1WindowMap(),
    authBanks: [3, 4, 5, 6, 7, 8, 9],
    fwInfo: new Map([
      [0, Uint8Array.from([1, 3, 0, 0, 0, 0, 0, 0])],
      ...(options.entered === undefined ? [] : [[10, rootsReply(options.entered)] as const]),
    ]),
    ...(stallAt === undefined ? {} : { stallAt }),
  });
}

const backendOf = (camera: FakeCamera): ((options: BackendOptions) => UsbBackend) =>
  fixedBackend([camera]);

function runDir(name = 'run'): string {
  return join(dir, name);
}

async function loadState(name = 'run'): Promise<PreserveRunState> {
  return JSON.parse(
    await readFile(join(runDir(name), PRESERVE_RUN_STATE_FILE), 'utf8'),
  ) as PreserveRunState;
}

async function saveState(name: string, state: PreserveRunState): Promise<void> {
  await writeFile(
    join(runDir(name), PRESERVE_RUN_STATE_FILE),
    `${JSON.stringify(state, null, 2)}\n`,
  );
}

/** A 2014 part: the boot word, and what each bank holds (absent: erased). */
function v1Flash(
  word: number,
  banks: { a?: Uint8Array; b?: Uint8Array; r?: Uint8Array },
): Uint8Array {
  const flash = new Uint8Array(FLASH_SIZE).fill(0xff);
  new DataView(flash.buffer).setUint32(0x10000, word >>> 0, true);
  if (banks.a !== undefined) flash.set(banks.a, 0x50000);
  if (banks.b !== undefined) flash.set(banks.b, 0x60000);
  if (banks.r !== undefined) flash.set(banks.r, 0x70000);
  return flash;
}

/* ==================================================================== *
 * a fresh run, checkpointed
 * ==================================================================== */

describe('preserve — a fresh run, checkpointed after every step', () => {
  it(
    'runs all six steps self-sourced and leaves a complete run directory',
    { timeout: 180_000 },
    async () => {
      const plain = syntheticPlain();
      const camera = v1Camera(plain);
      const asBooted = new Uint8Array(camera.flash);
      const test = testIo({ backend: backendOf(camera) });
      const code = await run(['preserve', '--out', runDir(), '--yes', '--json'], test.io, signal());
      expect(code).toBe(EXIT_OK);

      const state = await loadState();
      expect(state.version).toBe(3);
      expect(state.nextStep).toBe('done');
      expect(state.expectedVersion).toBe(EXPECTED_VERSION);
      expect(state.banks?.a.imageSha256).toBe(await sha256hex(plain));
      expect(state.choice).toBe('next-start');
      expect(state.targets).toEqual(['a']);
      /* The double read: both shas recorded, and agreeing — the shas are of
       * the whole 64 KiB slot capture (the image plus its erased tail). */
      const bankWindow = new Uint8Array(0x10000).fill(0xff);
      bankWindow.set(plain, 0);
      const captureSha = await sha256hex(bankWindow);
      expect(state.banks?.a.slotReadShas).toEqual([captureSha, captureSha]);
      for (const step of ['backup', 'patch', 'commit', 'drain', 'restore', 'verify'] as const) {
        expect(state.steps[step]?.status, `${step} done`).toBe('done');
      }
      expect(state.steps.commit?.notes).toMatch(/no reset sent in this session/);
      expect(state.verify).toEqual({ diffBytes: 0, windowsRead: 31, badWindows: [] });

      /* The checkpoint files are all there — the derived factory plaintext
       * among them — and the shas are as recorded. */
      for (const name of [
        PRESERVE_BACKUP_FILE,
        preserveCaptureFile('a'),
        preservePlainFile('a'),
        preservePatchedFile('a'),
        PRESERVE_DUMP_POSTWRITE_FILE,
        PRESERVE_DUMP_ORIGINAL_FILE,
        'manifest.json',
        'README.md',
      ]) {
        const bytes = await readFile(join(runDir(), name));
        const recorded = Object.values(state.steps)
          .flatMap((record) => Object.entries(record.artifactShas ?? {}))
          .filter(([entryName]) => entryName === name)
          .map(([, sha]) => sha)
          .at(-1);
        expect(recorded, `${name} recorded`).toBeDefined();
        expect(await sha256hex(new Uint8Array(bytes)), name).toBe(recorded);
      }
      /* The derived plaintext artifact IS the camera's slot A content. */
      const derived = await readFile(join(runDir(), preservePlainFile('a')));
      expect(await sha256hex(new Uint8Array(derived))).toBe(await sha256hex(plain));
      /* The dump archive's decrypted slots came along. */
      const decrypted = (await readdir(join(runDir(), 'decrypted'))).length;
      expect(decrypted).toBeGreaterThan(0);

      /* The delivered dump is the camera's original content; the part was
       * restored underneath the run. */
      const delivered = await readFile(join(runDir(), PRESERVE_DUMP_ORIGINAL_FILE));
      expect(await sha256hex(new Uint8Array(delivered))).toBe(await sha256hex(asBooted));
      expect(await sha256hex(camera.flash)).toBe(await sha256hex(asBooted));

      /* The --json document names the run, the boot facts, the choice and the
       * banks in code names, and the double read's shas per bank. */
      const document = JSON.parse(test.stdout.text) as {
        version: string;
        run: { nextStep: string; id: string };
        boot: { word: number; nextStart: string; why: string };
        choice: string;
        targets: string[];
        choices: { choice: string; banks: string[] | null }[];
        banks: Record<
          string,
          { slotReadShas?: string[]; imageSha256?: string; refused: string | null }
        >;
        sha256: { deliveredDump: string };
      };
      expect(document.run.nextStep).toBe('done');
      expect(document.version).toBe(EXPECTED_VERSION);
      expect(document.boot.word).toBe(0xffffffff);
      expect(document.boot.nextStart).toBe('a');
      expect(document.choice).toBe('next-start');
      expect(document.targets).toEqual(['a']);
      expect(document.choices.map((c) => [c.choice, c.banks])).toEqual([
        ['next-start', ['a']],
        ['a', ['a']],
        ['b', null],
        ['r', null],
        ['all', ['a']],
      ]);
      expect(document.banks.a?.slotReadShas).toEqual([captureSha, captureSha]);
      expect(document.banks.a?.imageSha256).toBe(await sha256hex(plain));
      expect(document.banks.b?.refused).toBe('it is erased');
      expect(document.sha256.deliveredDump).toBe(await sha256hex(asBooted));

      /* The plan prints twice — on the human stream (stderr under --json):
       * the generic one before the camera is touched, and the derived one
       * after the patch step, before the first write: the next start and
       * why, the banks, the choices, the banks to write. */
      expect(test.stderr.text).toMatch(/read from each bank of the camera, two agreeing reads/);
      expect(test.stderr.text).toMatch(/derived from the camera/);
      expect(test.stderr.text).toMatch(/v1 2014 chain/);
      expect(test.stderr.text).toMatch(
        /boot-config word\s+0xFFFFFFFF — slot A first, then B, then recovery R/,
      );
      expect(test.stderr.text).toMatch(
        /next start\s+slot A — the boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, and it holds an image the bootloader accepts/,
      );
      expect(test.stderr.text).toMatch(/B {2}0x14060000 {2}not written — it is erased/);
      expect(test.stderr.text).toMatch(/banks to write\s+slot A \(--bank next-start\)/);
      expect(test.stderr.text).toMatch(/bytes that move\s+slot A: 13, all inside that bank/);
    },
  );

  it(
    'writes no temporary files behind: every checkpoint write is a rename',
    { timeout: 180_000 },
    async () => {
      const camera = v1Camera(syntheticPlain());
      await run(
        ['preserve', '--out', runDir(), '--yes'],
        testIo({ backend: backendOf(camera) }).io,
        signal(),
      );
      const names = await readdir(runDir());
      expect(names.filter((name) => name.includes('.tmp-'))).toEqual([]);
    },
  );

  it(
    'refuses a second fresh run into a directory that already holds one',
    { timeout: 180_000 },
    async () => {
      const camera = v1Camera(syntheticPlain());
      const args = ['preserve', '--out', runDir(), '--yes'];
      expect(await run(args, testIo({ backend: backendOf(camera) }).io, signal())).toBe(EXIT_OK);
      const second = testIo({ backend: backendOf(camera) });
      expect(await run(args, second.io, signal())).toBe(EXIT_FAILED);
      expect(second.stderr.text).toMatch(/already holds a preserve_run\.json .* --resume/);
    },
  );

  it(
    'an interactive run confirms twice — before the camera, and at the derived plan, before the first write',
    { timeout: 180_000 },
    async () => {
      const plain = syntheticPlain();
      const camera = v1Camera(plain);
      const asBooted = new Uint8Array(camera.flash);
      /* Decline at the first prompt: nothing runs, nothing exists. */
      const declined = testIo({ backend: backendOf(camera), answer: false, stdinIsTty: true });
      expect(await run(['preserve', '--out', runDir()], declined.io, signal())).toBe(EXIT_FAILED);
      expect(declined.stderr.text).toMatch(
        /aborted at the confirmation prompt — nothing was written/,
      );
      expect(declined.questions).toHaveLength(1);

      /* Accept both: the run completes, and the second question is the one at
       * the derived plan, naming the write it gates. */
      const accepted = testIo({ backend: backendOf(camera), answer: true, stdinIsTty: true });
      expect(await run(['preserve', '--out', runDir()], accepted.io, signal())).toBe(EXIT_OK);
      expect(accepted.questions).toHaveLength(2);
      expect(accepted.questions[1]).toMatch(/Proceed to the commit — the first write, into slot A/);
      expect((await loadState()).nextStep).toBe('done');
      const delivered = await readFile(join(runDir(), PRESERVE_DUMP_ORIGINAL_FILE));
      expect(await sha256hex(new Uint8Array(delivered))).toBe(await sha256hex(asBooted));

      /* Decline at the SECOND prompt instead: the backup and the derived plan
       * are checkpointed, the camera is untouched (the commit is the first
       * write, and it never ran), and a --resume finishes the run. */
      const midCamera = v1Camera(plain);
      const midRun = runDir('midrun');
      const partial = testIo({
        backend: backendOf(midCamera),
        answers: [true, false],
        stdinIsTty: true,
      });
      expect(await run(['preserve', '--out', midRun], partial.io, signal())).toBe(EXIT_FAILED);
      expect(partial.stderr.text).toMatch(/aborted at the plan prompt — nothing was written/);
      const torn: PreserveRunState = JSON.parse(
        await readFile(join(midRun, PRESERVE_RUN_STATE_FILE), 'utf8'),
      ) as PreserveRunState;
      expect(torn.nextStep).toBe('commit');
      expect(await sha256hex(midCamera.flash)).toBe(await sha256hex(asBooted));
      const resumed = testIo({ backend: backendOf(midCamera) });
      expect(await run(['preserve', '--resume', midRun, '--yes'], resumed.io, signal())).toBe(
        EXIT_OK,
      );
      expect((await loadState('midrun')).nextStep).toBe('done');
    },
  );

  it(
    'writes the initial checkpoint before the first step, so an early abort is resumable',
    { timeout: 180_000 },
    async () => {
      const camera = v1Camera(syntheticPlain());
      const controller = new AbortController();
      controller.abort(); /* the run is dead before it starts */
      const code = await run(
        ['preserve', '--out', runDir(), '--yes'],
        testIo({ backend: backendOf(camera) }).io,
        controller.signal,
      );
      expect(code).toBe(EXIT_CANCELLED);
      /* The initial checkpoint stands: a resume re-runs the whole run. */
      const state = await loadState();
      expect(state.version).toBe(3);
      expect(state.nextStep).toBe('backup');
      expect(Object.keys(state.steps)).toEqual([]);
    },
  );

  it('refuses a positional argument — there is no image input anywhere', async () => {
    const camera = v1Camera(syntheticPlain());
    const refused = testIo({ backend: backendOf(camera) });
    const code = await run(
      ['preserve', join(dir, 'plain-1.3.0.0.bin'), '--out', runDir(), '--yes'],
      refused.io,
      signal(),
    );
    expect(code).toBe(EXIT_USAGE);
    expect(refused.stderr.text).toMatch(/unexpected argument/);
  });
});

/* ==================================================================== *
 * the bench camera's firmware: Compact PRO 1.0.3.0 with the Compact board
 * patch (TESTING.md sec. 38) — an erased boot-config record, the 2016 cipher
 * chain, and an adjust word the board patch already balances through
 * ==================================================================== */

describe('preserve — Compact PRO 1.0.3.0 with the board patch', () => {
  it(
    'runs all six steps: no reboot to read the erased record, the plan names the edit, the part comes back as it was',
    { timeout: 180_000 },
    async () => {
      const camera = cp1030Camera();
      const asBooted = new Uint8Array(camera.flash);
      const test = testIo({ backend: backendOf(camera) });
      const code = await run(['preserve', '--out', runDir(), '--yes'], test.io, signal());
      expect(code, test.stderr.text).toBe(EXIT_OK);

      const state = await loadState();
      expect(state.nextStep).toBe('done');
      expect(state.buildId).toBe('compact-pro-1.0.3.0');
      expect(state.banks?.a.imageDerivation?.id).toBe('compact-pro-1.0.3.0-accept-pn297');
      expect(state.targets).toEqual(['a']);
      expect(state.verify).toEqual({ diffBytes: 0, windowsRead: 31, badWindows: [] });
      /* The derived image is the slot's own, the board patch in it. */
      const derived = await readFile(join(runDir(), preservePlainFile('a')));
      expect(await sha256hex(new Uint8Array(derived))).toBe(await sha256hex(boardPatched()));
      /* The part is the as-booted part again, and the delivered dump is it. */
      expect(await sha256hex(camera.flash)).toBe(await sha256hex(asBooted));
      const delivered = await readFile(join(runDir(), PRESERVE_DUMP_ORIGINAL_FILE));
      expect(await sha256hex(new Uint8Array(delivered))).toBe(await sha256hex(asBooted));
      /* Two resets, the drain's and the restore's: the erased record cost none. */
      expect(camera.calls.filter((c) => c.direction === 'out' && c.op === 0x59)).toHaveLength(2);

      /* The derived plan names the edit and the word it shares. */
      expect(test.stdout.text).toMatch(/Compact Pro 1\.0\.3\.0 \(9 Hz\)/);
      expect(test.stdout.text).toMatch(
        /image edit\s+slot A: the Compact \(PN297\) board patch \(compact-pro-1\.0\.3\.0-accept-pn297\)/,
      );
      expect(test.stdout.text).toMatch(/its balance 0x6322E32A is in the/);
      expect(test.stdout.text).toMatch(
        /rebalance word\s+slot A: 0x5423132A at 0x00000238 \(was 0x6322E32A, the edit's balance\)/,
      );
      /* The 2016 check key is named from slot A, so the next start is known. */
      expect(test.stdout.text).toMatch(/last start\s+slot A, as the camera records it/);
      expect(test.stdout.text).toMatch(/next start\s+slot A — /);

      /* --print-state names it too. */
      const printed = testIo({ backend: backendOf(camera) });
      expect(await run(['preserve', '--print-state', runDir()], printed.io, signal())).toBe(
        EXIT_OK,
      );
      expect(printed.stderr.text + printed.stdout.text).toMatch(
        /image edit\s+slot A: the Compact \(PN297\) board patch/,
      );
    },
  );
});

/* ==================================================================== *
 * the spent-reader retry gate: a failed backup re-runs only past the
 * power-cycle acknowledgement (the 2026-10-02 incident: a backup attempt +
 * retry back-to-back with no reset served stale and blank descriptor bytes)
 * ==================================================================== */

describe('preserve — the power-cycle retry gate on a failed backup', () => {
  it(
    'the fresh run suggests the power cycle on a stall; the retry asks, and --yes asserts',
    { timeout: 180_000 },
    async () => {
      const plain = syntheticPlain();
      /* The second sweep window never answers — the stall-at-offset-0 shape
       * of the incident (the fake's stand-in for a spent reader). */
      const wedged = v1Camera(plain, { stallAt: [{ subcmd: 4, offset: 0 }] });

      /* THE FIRST ATTEMPT of the fresh run: the failure line is preceded by
       * the one-line remedy — say the power cycle before any retry. (Under a
       * plain run the reporter's lines are on stdout; stderr carries the
       * top-level error line.) */
      const first = testIo({ backend: backendOf(wedged) });
      expect(await run(['preserve', '--out', runDir(), '--yes'], first.io, signal())).toBe(
        EXIT_FAILED,
      );
      expect(first.stdout.text).toMatch(
        /window reader is spent for this boot — power-cycle the camera .* before any retry/,
      );
      expect(first.stderr.text).toMatch(/error: P1: backup window 0x14020000 .* did not answer/);
      expect(first.stdout.text).toMatch(/backup failed: .*0x14020000/);
      const torn = await loadState();
      expect(torn.nextStep).toBe('backup');
      expect(torn.steps.backup?.status).toBe('failed');

      /* THE RETRY on a terminal: the instruction prints, the prompt gates,
       * and a decline re-reads nothing. */
      const declined = testIo({ backend: backendOf(wedged), stdinIsTty: true, answers: [false] });
      expect(await run(['preserve', '--resume', runDir()], declined.io, signal())).toBe(
        EXIT_FAILED,
      );
      expect(declined.stdout.text).toMatch(
        /power-cycle the camera first \(unplug and replug it, or use its power switch\)/,
      );
      expect(declined.questions).toHaveLength(1);
      expect(declined.questions[0]).toMatch(/power-cycled the camera since that failed backup/);
      expect(declined.stderr.text).toMatch(/aborted at the power-cycle prompt/);

      /* Accepting the prompt asserts the power cycle into core: the gate
       * opens, the camera is still wedged, and the backup fails again — the
       * failure is recorded and the gate stands for the next attempt. */
      const retry = testIo({ backend: backendOf(wedged), stdinIsTty: true, answers: [true] });
      expect(await run(['preserve', '--resume', runDir()], retry.io, signal())).toBe(EXIT_FAILED);
      expect(retry.questions).toHaveLength(1);
      expect(retry.stdout.text).toMatch(/backup failed:/);
      expect((await loadState()).steps.backup?.status).toBe('failed');

      /* --yes asserts the power cycle without a prompt. */
      const asserted = testIo({ backend: backendOf(wedged) });
      expect(await run(['preserve', '--resume', runDir(), '--yes'], asserted.io, signal())).toBe(
        EXIT_FAILED,
      );
      expect(asserted.stdout.text).toMatch(/--yes given: asserting the camera was power-cycled/);
      expect(asserted.questions).toHaveLength(0);
    },
  );

  it(
    'recovers end to end once the camera answers again: no prompt on a clean camera, prompt still asked for the failed record',
    { timeout: 180_000 },
    async () => {
      const plain = syntheticPlain();
      const asBooted = new Uint8Array(v1Camera(plain).flash);
      const wedged = v1Camera(plain, { stallAt: [{ subcmd: 4, offset: 0 }] });
      expect(
        await run(
          ['preserve', '--out', runDir(), '--yes'],
          testIo({ backend: backendOf(wedged) }).io,
          signal(),
        ),
      ).toBe(EXIT_FAILED);

      /* The power cycle that revives the camera — the same part, reading now.
       * The retry (tty) is asked once, answers yes, and the whole run lands:
       * the gate exists to make the operator say the camera was cycled, not
       * to keep a healthy run from finishing. The resume reaches the first
       * write, so it prints the plan and asks there too, as a fresh run does. */
      const revived = v1Camera(plain, { flash: wedged.flash });
      const recovered = testIo({
        backend: backendOf(revived),
        stdinIsTty: true,
        answers: [true, true],
      });
      expect(await run(['preserve', '--resume', runDir()], recovered.io, signal())).toBe(EXIT_OK);
      expect(recovered.questions).toHaveLength(2);
      expect(recovered.questions[1]).toMatch(
        /Proceed to the commit — the first write, into slot A/,
      );
      expect((await loadState()).nextStep).toBe('done');
      const delivered = await readFile(join(runDir(), PRESERVE_DUMP_ORIGINAL_FILE));
      expect(await sha256hex(new Uint8Array(delivered))).toBe(await sha256hex(asBooted));
    },
  );
});

/* ==================================================================== *
 * resume, from-step, print-state
 * ==================================================================== */

describe('preserve — resume from a run the drain killed', () => {
  it(
    'checkpoints the failure, then finishes on a healthy camera — with no file but the run directory',
    { timeout: 180_000 },
    async () => {
      const plain = syntheticPlain();
      const asBooted = new Uint8Array(
        v1Camera(plain).flash,
      ); /* the pre-commit part, for the final compare */
      const wedged = v1Camera(plain, { stallDrain: true });
      const first = await run(
        ['preserve', '--out', runDir(), '--yes'],
        testIo({ backend: backendOf(wedged) }).io,
        signal(),
      );
      expect(first).toBe(EXIT_FAILED);

      const torn = await loadState();
      expect(torn.nextStep).toBe('drain');
      expect(torn.steps.backup?.status).toBe('done');
      expect(torn.steps.patch?.status).toBe('done');
      expect(torn.steps.commit?.status).toBe('done');
      expect(torn.steps.drain?.status).toBe('failed');
      expect(torn.steps.drain?.error).toMatch(/post-reset read window never came up/);
      /* The failure is recorded, the previous checkpoint stands, and the run
       * directory holds the restore source AND the derived plaintext. */
      expect(await readFile(join(runDir(), preserveCaptureFile('a')))).toBeTruthy();
      expect(await readFile(join(runDir(), preservePlainFile('a')))).toBeTruthy();

      /* RESUME on the same part, healthy now: the drain runs, then restore and
       * verify, and the run reaches done — the commit is NOT replayed, and no
       * image is asked for. */
      const samePart = v1Camera(plain, { flash: wedged.flash });
      const second = await run(
        ['preserve', '--resume', runDir(), '--yes'],
        testIo({ backend: backendOf(samePart) }).io,
        signal(),
      );
      expect(second).toBe(EXIT_OK);
      const state = await loadState();
      expect(state.nextStep).toBe('done');
      expect(state.steps.commit?.finishedAt).toBe(torn.steps.commit?.finishedAt);
      const delivered = await readFile(join(runDir(), PRESERVE_DUMP_ORIGINAL_FILE));
      expect(await sha256hex(new Uint8Array(delivered))).toBe(await sha256hex(asBooted));
    },
  );

  it(
    'resuming a run directory that lost the derived plaintext refuses, with the remedy',
    { timeout: 180_000 },
    async () => {
      const plain = syntheticPlain();
      const camera = v1Camera(plain);
      await run(
        ['preserve', '--out', runDir(), '--yes'],
        testIo({ backend: backendOf(camera) }).io,
        signal(),
      );
      /* Rewind the state to just before the commit AND take the derived
       * plaintext out of the run directory. */
      const state = await loadState();
      const rewound: PreserveRunState = { ...state, nextStep: 'commit' };
      delete rewound.steps.commit;
      delete rewound.steps.drain;
      delete rewound.steps.restore;
      delete rewound.steps.verify;
      await saveState('run', rewound);
      const plainFile = await readFile(join(runDir(), preservePlainFile('a')));
      const { rm } = await import('node:fs/promises');
      await rm(join(runDir(), preservePlainFile('a')));

      const probe = testIo({ backend: backendOf(camera) });
      const code = await run(['preserve', '--resume', runDir(), '--yes'], probe.io, signal());
      expect(code).toBe(EXIT_FAILED);
      expect(probe.stderr.text).toMatch(/preserve_bank_a_plain\.bin/);

      /* The file goes back under its artifact name (from the run zip) and the
       * same resume just works. */
      await writeFile(join(runDir(), preservePlainFile('a')), plainFile);
      const retry = testIo({ backend: backendOf(camera) });
      expect(await run(['preserve', '--resume', runDir(), '--yes'], retry.io, signal())).toBe(
        EXIT_OK,
      );
      expect((await loadState()).nextStep).toBe('done');
    },
  );

  it(
    'a run directory of an older schema is refused, with the remedy',
    { timeout: 180_000 },
    async () => {
      const camera = v1Camera(syntheticPlain());
      await run(
        ['preserve', '--backup-only', '--out', runDir(), '--yes'],
        testIo({ backend: backendOf(camera) }).io,
        signal(),
      );
      const older = { ...(await loadState()), version: 2 } as unknown as PreserveRunState;
      await saveState('run', older);
      for (const args of [
        ['preserve', '--print-state', runDir()],
        ['preserve', '--resume', runDir(), '--yes'],
      ]) {
        const test = testIo({ backend: backendOf(camera) });
        expect(await run(args, test.io, signal())).toBe(EXIT_FAILED);
        expect(test.stderr.text).toMatch(
          /schema version 2, written before the run chose its banks/,
        );
        expect(test.stderr.text).toMatch(/start a new run to continue/);
      }
    },
  );

  it(
    '--from-step past an incomplete commit warns loudly, and the run recovers safely',
    { timeout: 180_000 },
    async () => {
      const plain = syntheticPlain();
      const camera = v1Camera(plain);
      await run(
        ['preserve', '--out', runDir(), '--yes'],
        testIo({ backend: backendOf(camera) }).io,
        signal(),
      );
      /* Rewind the on-disk state to just after the backup: patch/commit not
       * on record, while the camera is fact RESTORED (the full run above put
       * it back). Exactly the ambiguous state a lost checkpoint can leave. */
      const state = await loadState();
      const rewound: PreserveRunState = { ...state, nextStep: 'patch' };
      delete rewound.steps.patch;
      delete rewound.steps.commit;
      delete rewound.steps.drain;
      delete rewound.steps.restore;
      delete rewound.steps.verify;
      await saveState('run', rewound);

      const jumped = testIo({ backend: backendOf(camera) });
      const code = await run(
        ['preserve', '--resume', runDir(), '--from-step', 'drain', '--yes'],
        jumped.io,
        signal(),
      );
      expect(code).toBe(EXIT_OK);
      expect(jumped.stdout.text).toMatch(
        /WARNING: jumping from patch to drain, skipping: patch, commit/,
      );
      expect(jumped.stdout.text).toMatch(/past an INCOMPLETE commit .* expected to be in the/);
      /* The wire-side protections held: the drain read the (original) part,
       * the restore detected an already-original bank, the verify proved
       * 0 diffs — and the camera was never written. */
      const after = await loadState();
      expect(after.nextStep).toBe('done');
      expect(after.steps.restore?.notes).toMatch(/slot A: already held its original content/);
      expect(after.verify).toEqual({ diffBytes: 0, windowsRead: 31, badWindows: [] });
      const expectedFlash = new Uint8Array(v1Camera(plain).flash);
      expect(await sha256hex(camera.flash)).toBe(await sha256hex(expectedFlash));
    },
  );

  it(
    '--from-step restore recovers a drain-abandoned run: warn, restore, verify, done',
    { timeout: 180_000 },
    async () => {
      const plain = syntheticPlain();
      const asBooted = new Uint8Array(v1Camera(plain).flash);
      const wedged = v1Camera(plain, { stallDrain: true });
      const first = await run(
        ['preserve', '--out', runDir(), '--yes'],
        testIo({ backend: backendOf(wedged) }).io,
        signal(),
      );
      expect(first).toBe(EXIT_FAILED);
      const torn = await loadState();
      expect(torn.nextStep).toBe('drain');

      /* The dump is not worth another drain: restore and verify, skipping it. */
      const camera = v1Camera(plain, { flash: wedged.flash });
      const recovered = testIo({ backend: backendOf(camera) });
      const code = await run(
        ['preserve', '--resume', runDir(), '--from-step', 'restore', '--yes'],
        recovered.io,
        signal(),
      );
      expect(code).toBe(EXIT_OK);
      /* The warn rides the log stream (stdout unless --json). */
      expect(recovered.stdout.text).toMatch(
        /WARNING: jumping from drain to restore, skipping: drain/,
      );
      expect(recovered.stderr.text).not.toMatch(/no COMPLETED commit/); /* commit IS done */
      const after = await loadState();
      expect(after.nextStep).toBe('done');
      expect(after.steps.drain?.status).toBe('failed'); /* the skip is on the record */
      expect(after.steps.restore?.status).toBe('done');
      expect(after.verify?.diffBytes).toBe(0);
      /* The camera was put back even though the dump never happened. */
      expect(await sha256hex(camera.flash)).toBe(await sha256hex(asBooted));
    },
  );

  it(
    '--resume on a run that is already done says so and touches no camera',
    { timeout: 180_000 } /* it runs a whole run first, like its siblings */,
    async () => {
      const camera = v1Camera(syntheticPlain());
      await run(
        ['preserve', '--out', runDir(), '--yes'],
        testIo({ backend: backendOf(camera) }).io,
        signal(),
      );
      /* No backend injected: if anything reached for a camera, the run would
       * fail on the missing device instead of exiting cleanly. */
      const done = testIo();
      const code = await run(['preserve', '--resume', runDir(), '--yes'], done.io, signal());
      expect(code).toBe(EXIT_OK);
      expect(done.stdout.text).toMatch(/run .* is already done — nothing to resume/);
      /* The state is untouched. */
      expect((await loadState()).nextStep).toBe('done');
    },
  );

  it('--from-step needs --resume, and a bogus step id is a usage error', async () => {
    const usage = testIo();
    expect(await run(['preserve', '--from-step', 'drain', '--yes'], usage.io, signal())).toBe(
      EXIT_USAGE,
    );
    expect(usage.stderr.text).toMatch(/--from-step needs --resume/);

    const bogus = testIo();
    expect(
      await run(
        ['preserve', '--resume', runDir(), '--from-step', 'middle', '--yes'],
        bogus.io,
        signal(),
      ),
    ).toBe(EXIT_USAGE); /* the step id is checked before the run directory is read */
    expect(bogus.stderr.text).toMatch(/'middle' is not a step/);
  });

  it(
    '--print-state reports the run, its next step, and the checkpoint files',
    { timeout: 180_000 },
    async () => {
      const camera = v1Camera(syntheticPlain());
      await run(
        ['preserve', '--out', runDir(), '--yes'],
        testIo({ backend: backendOf(camera) }).io,
        signal(),
      );
      const printed = testIo();
      const code = await run(
        ['preserve', '--print-state', runDir(), '--json'],
        printed.io,
        signal(),
      );
      expect(code).toBe(EXIT_OK);
      /* No camera was needed: no backend was even injected. */
      const document = JSON.parse(printed.stdout.text) as {
        state: PreserveRunState;
        run: { nextStep: string; id: string };
        inventory: { name: string; present: boolean; shaMatches: boolean | null }[];
      };
      expect(document.run.nextStep).toBe('done');
      expect(document.state.version).toBe(3);
      expect(document.state.targets).toEqual(['a']);
      const files = document.inventory.map((entry) => entry.name);
      expect(files).toContain(PRESERVE_BACKUP_FILE);
      expect(files).toContain(preservePlainFile('a'));
      expect(files).toContain(PRESERVE_DUMP_ORIGINAL_FILE);
      for (const entry of document.inventory) {
        expect(entry.present, entry.name).toBe(true);
        expect(entry.shaMatches, entry.name).toBe(true);
      }

      /* A tampered checkpoint file is reported CHANGED, not silently ok. */
      const patched = await readFile(join(runDir(), preservePatchedFile('a')));
      patched[9] = (patched[9] ?? 0) ^ 0xff;
      await writeFile(join(runDir(), preservePatchedFile('a')), patched);
      const after = testIo();
      await run(['preserve', '--print-state', runDir()], after.io, signal());
      expect(after.stdout.text).toMatch(/CHANGED\s+preserve_bank_a_patched\.bin/);
      /* The printed state names the boot facts and the banks in words. */
      expect(after.stdout.text).toMatch(/next start\s+slot A — /);
      expect(after.stdout.text).toMatch(/banks to write\s+slot A \(--bank next-start\)/);
    },
  );
});

describe('preserve — the read-only first step, and the zip of a run', () => {
  it(
    '--backup-only stops after the backup: checkpointed, and nothing is written to the camera',
    { timeout: 180_000 },
    async () => {
      const camera = v1Camera(syntheticPlain());
      const asBooted = new Uint8Array(camera.flash);
      const test = testIo({ backend: backendOf(camera) });
      const code = await run(
        ['preserve', '--backup-only', '--out', runDir(), '--yes', '--json'],
        test.io,
        signal(),
      );
      expect(code).toBe(EXIT_OK);

      const state = await loadState();
      expect(state.steps.backup?.status).toBe('done');
      expect(state.steps.patch).toBeUndefined();
      expect(state.nextStep).toBe('patch');
      await expect(readFile(join(runDir(), preservePatchedFile('a')))).rejects.toThrow();

      const sent = new Set(camera.calls.map((call) => call.op));
      expect(sent.has(OP.SET_FEATURED_FIRMWARE_DATA)).toBe(false);
      expect(sent.has(OP.COMPLETE_MEMORY_UPGRADE)).toBe(false);
      expect(await sha256hex(camera.flash)).toBe(await sha256hex(asBooted));

      expect(JSON.parse(test.stdout.text)).toMatchObject({
        backupOnly: true,
        run: { nextStep: 'patch' },
        output: { zip: null },
      });
      expect(test.stderr.text).toContain('stopping after backup');
    },
  );

  it(
    '--zip writes the run file: preserve_run.json and the backup checkpoints, and no later step',
    { timeout: 180_000 },
    async () => {
      const camera = v1Camera(syntheticPlain());
      const zip = join(dir, 'backup.zip');
      const test = testIo({ backend: backendOf(camera) });
      const code = await run(
        ['preserve', '--backup-only', '--out', runDir(), '--zip', zip, '--yes'],
        test.io,
        signal(),
      );
      expect(code).toBe(EXIT_OK);

      const bytes = await readFile(zip);
      expect(bytes.subarray(0, 2).toString()).toBe('PK');
      const text = bytes.toString('latin1');
      expect(text).toContain(PRESERVE_RUN_STATE_FILE);
      expect(text).toContain(PRESERVE_BACKUP_FILE);
      expect(text).toContain('manifest.json');
      expect(text).not.toContain(preservePatchedFile('a'));
      expect(test.stdout.text).toContain(`wrote ${zip}`);
    },
  );

  it('--backup-only refuses a --from-step past the backup, before the run is read', async () => {
    const test = testIo({ backend: backendOf(v1Camera(syntheticPlain())) });
    const code = await run(
      ['preserve', '--backup-only', '--resume', runDir(), '--from-step', 'commit', '--yes'],
      test.io,
      signal(),
    );
    expect(code).toBe(EXIT_USAGE);
    expect(test.stderr.text).toContain('--backup-only runs the first step only');
  });

  it('--print-state takes neither --backup-only, --zip nor --bank: none of them writes a run', async () => {
    const test = testIo();
    expect(
      await run(['preserve', '--print-state', runDir(), '--backup-only'], test.io, signal()),
    ).toBe(EXIT_USAGE);
    expect(
      await run(['preserve', '--print-state', runDir(), '--bank', 'a'], test.io, signal()),
    ).toBe(EXIT_USAGE);
    expect(
      await run(
        ['preserve', '--print-state', runDir(), '--zip', join(dir, 'x.zip')],
        test.io,
        signal(),
      ),
    ).toBe(EXIT_USAGE);
  });

  it('--backup-only asks before it opens the camera, and reads nothing when the answer is no', async () => {
    const camera = v1Camera(syntheticPlain());
    const test = testIo({ backend: backendOf(camera), stdinIsTty: true, answer: false });
    expect(await run(['preserve', '--backup-only', '--out', runDir()], test.io, signal())).toBe(
      EXIT_FAILED,
    );
    expect(test.questions[0]).toContain('Nothing is written to the camera');
    expect(camera.calls).toHaveLength(0);
  });
});

/* ==================================================================== *
 * --bank: which banks the run writes (TESTING.md 42.92)
 * ==================================================================== */

describe('preserve — --bank: the bank the next start enters, one bank, every bank', () => {
  it(
    '--bank all on a word-2 part writes A and R, and puts both back',
    { timeout: 180_000 },
    async () => {
      const plain = syntheticPlain();
      const camera = v1Camera(plain, { flash: v1Flash(2, { a: plain, r: plain }), entered: 2 });
      const asBooted = new Uint8Array(camera.flash);
      const test = testIo({ backend: backendOf(camera) });
      expect(
        await run(['preserve', '--out', runDir(), '--bank', 'all', '--yes'], test.io, signal()),
      ).toBe(EXIT_OK);
      const state = await loadState();
      expect(state.choice).toBe('all');
      expect(state.targets).toEqual(['a', 'r']);
      expect(state.steps.commit?.notes).toMatch(/slot A: .*; recovery R: /);
      expect(await sha256hex(camera.flash)).toBe(await sha256hex(asBooted));
      expect(test.stdout.text).toMatch(/banks to write\s+every bank/);
      expect(test.stdout.text).toMatch(
        /next start\s+recovery R — the boot-config word is 2, so the bootloader tries recovery R first, and it holds an image the bootloader accepts/,
      );
      expect(test.stdout.text).toMatch(/last start\s+recovery R, as the camera records it/);
      expect(test.stdout.text).toMatch(/banks to write\s+slot A and recovery R \(--bank all\)/);
      expect(test.stdout.text).toMatch(/banks written: slot A and recovery R \(--bank all\)/);
    },
  );

  it(
    '--bank r while the next start enters A: the plan warns, the drain stops before it reads, and --from-step restore puts R back',
    { timeout: 180_000 },
    async () => {
      const plain = syntheticPlain();
      const camera = v1Camera(plain, { flash: v1Flash(0, { a: plain, r: plain }), entered: 0 });
      const asBooted = new Uint8Array(camera.flash);
      const first = testIo({ backend: backendOf(camera) });
      expect(
        await run(['preserve', '--out', runDir(), '--bank', 'r', '--yes'], first.io, signal()),
      ).toBe(EXIT_FAILED);
      expect(first.stdout.text).toMatch(
        /! The next start enters slot A \(.*\), and this choice does not patch it/,
      );
      expect(first.stderr.text).toMatch(
        /the camera reports it entered slot A \(active-slot word 0\), which this run did not patch \(it patched recovery R\)/,
      );
      expect(first.stdout.text).toMatch(/--resume .* --from-step restore/);
      const torn = await loadState();
      expect(torn.steps.commit?.status).toBe('done');
      expect(torn.steps.drain?.status).toBe('failed');

      const restored = testIo({ backend: backendOf(camera) });
      expect(
        await run(
          ['preserve', '--resume', runDir(), '--from-step', 'restore', '--yes'],
          restored.io,
          signal(),
        ),
      ).toBe(EXIT_OK);
      expect((await loadState()).verify?.diffBytes).toBe(0);
      expect(await sha256hex(camera.flash)).toBe(await sha256hex(asBooted));
    },
  );

  it(
    'a default the run cannot write stops before the commit; --resume --bank chooses, and is refused once the commit has run',
    { timeout: 180_000 },
    async () => {
      /* Word 1 tries B first, and B holds a 1.2.0.0 image while the camera runs 1.3.0.0. */
      const plain = syntheticPlain();
      const other = syntheticPlain();
      const dv = new DataView(other.buffer);
      dv.setUint32(0x20c, 0x0000_0201, true);
      dv.setUint32(0x3ff0, 0, true);
      dv.setUint32(0x3ff0, (0 - wordSum(other)) >>> 0, true);
      const camera = v1Camera(plain, { flash: v1Flash(1, { a: plain, b: other }), entered: 0 });
      const first = testIo({ backend: backendOf(camera) });
      expect(await run(['preserve', '--out', runDir(), '--yes'], first.io, signal())).toBe(
        EXIT_FAILED,
      );
      expect(first.stdout.text).toMatch(/banks to write\s+none — the next start enters slot B/);
      expect(first.stderr.text).toMatch(/no banks to write: the next start enters slot B/);
      expect(first.stderr.text).toMatch(/--bank <a\|b\|r\|all>/);
      expect((await loadState()).nextStep).toBe('commit');

      const refusedB = testIo({ backend: backendOf(camera) });
      expect(
        await run(
          ['preserve', '--resume', runDir(), '--bank', 'b', '--yes'],
          refusedB.io,
          signal(),
        ),
      ).toBe(EXIT_FAILED);
      expect(refusedB.stderr.text).toMatch(
        /--bank b: slot B cannot be written: it holds firmware 1\.2\.0\.0, not the 1\.3\.0\.0 the camera runs/,
      );

      const chosen = testIo({ backend: backendOf(camera) });
      expect(
        await run(['preserve', '--resume', runDir(), '--bank', 'a', '--yes'], chosen.io, signal()),
      ).toBe(EXIT_OK); /* the fake keeps answering that it entered A, so its drain reads */
      expect(chosen.stdout.text).toMatch(/banks to write: slot A \(--bank a\)/);
      expect(chosen.stdout.text).toMatch(/! The next start enters slot B/);
      const state = await loadState();
      expect(state.choice).toBe('a');
      expect(state.targets).toEqual(['a']);
      expect(state.nextStep).toBe('done');

      const late = testIo({ backend: backendOf(camera) });
      expect(
        await run(['preserve', '--resume', runDir(), '--bank', 'r', '--yes'], late.io, signal()),
      ).toBe(EXIT_FAILED);
      expect(late.stderr.text).toMatch(/cannot change once the commit has run/);
    },
  );

  it('--bank takes next-start, a, b, r or all', async () => {
    const test = testIo();
    expect(
      await run(['preserve', '--out', runDir(), '--bank', 'both', '--yes'], test.io, signal()),
    ).toBe(EXIT_USAGE);
    expect(test.stderr.text).toMatch(/--bank takes next-start, a, b, r, all, got 'both'/);
  });
});
