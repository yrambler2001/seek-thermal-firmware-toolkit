/* ====================================================================
 * An EMPTY bank on the emulated camera: read, dumped and written like any other.
 *
 * "Empty" is a bank whose image-header window reads as all 0xFF. Many corpus dumps
 * of the 2014 line carry one (bank B), and a camera can be left with one after an
 * erase. The product treats it as a state, not an error; this suite holds that to
 * the real firmware, one boot per scenario:
 *
 *   - the analysis reports the bank as `empty` (not unread, not foreign), with no
 *     decryption attempted and no error;
 *   - dumping it returns the raw 64 KiB of 0xFF, equal to the emulator's own flash,
 *     with `empty` set, no decrypted image and the note "empty, nothing to decrypt";
 *   - a decrypted image written into it commits with status 0 and verifies, and the
 *     plan says the target was empty; the acknowledgement rule is the same as for a
 *     used bank (needed for the booted bank and R, and for every bank where the camera
 *     names no booted bank): an unticked write to such a bank sends nothing;
 *   - a bank that is still empty afterwards dumps as empty again, unchanged;
 *   - a RAW payload into an empty recovery bank reads back as sent;
 *   - the boot-config block is unchanged and ResetDevice is never sent.
 *
 * THE SCENARIOS. A scenario either boots a corpus entry as it is (whose donor
 * already carries an empty bank B: the 2014 line) or boots a corpus DUMP with named
 * banks erased, through the emulator's `--flash` override (the other families, whose
 * dumps hold an image in every bank). The 2016 scenario is the one that settles
 * whether that family needs the target bank's own keystream to write it: its stage
 * key is key block 0 of the image's own pair, and the device erases the block
 * without reading it.
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR, like every emulator suite.
 * ==================================================================== */

import { readFileSync, writeFileSync } from 'node:fs';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { equalBytes } from '../../src/bytes.js';
import { keyFilenameSuffix } from '../../src/crypto/keys.js';
import { errorMessage, SeekError } from '../../src/errors.js';
import { silentReporter } from '../../src/events.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { WebUsbTransport } from '../../src/protocol/webusb.js';
import { detectProfile } from '../../src/profiles/registry.js';
import type { FirmwareProfile } from '../../src/profiles/types.js';
import { dumpSlot } from '../../src/slots/dump.js';
import { inspectSlots } from '../../src/slots/inspect.js';
import type {
  DumpedSlot,
  SlotContent,
  SlotFlashInput,
  SlotKey,
  SlotsReport,
  StagingForm,
} from '../../src/slots/types.js';
import { flashSlot, prepareSlotFlash } from '../../src/slots/write.js';
import { evidenceFromChannelProbe, probeSelectorChannel } from '../../src/workflows/capability.js';
import type { WorkflowContext } from '../../src/workflows/types.js';
import { liveEmulatorCount, RowEmulators } from '../emulator/harness.js';
import {
  announceSkip,
  BOOT_TIMEOUT_MS,
  EMU_DIR,
  ENTRIES,
  scratchFile,
  URB_TIMEOUT_MS,
} from '../emulator/suite.js';
import {
  BANK_BYTES,
  CFG_ADDRESS,
  decryptedReadBack,
  recordTransport,
  type Sent,
} from './corpus-locked-run.js';
import { corpusEntries, SPANSION_4MB_JEDEC, vendoredBytes } from './corpus-locked-subjects.js';
import { windowAt } from './write-fixtures.js';

const TIMEOUT_MS = Number(process.env.SEEK_EMU_SLOTS_TIMEOUT_MS ?? '1800000');
const OP_RESET_DEVICE = 0x59;
const FLASH_BYTES = 4 * 1024 * 1024;

interface Scenario {
  readonly label: string;
  /** The corpus entry that is booted (a full dump when `erase` is set). */
  readonly entryId: string;
  readonly version: string;
  readonly staging: StagingForm;
  readonly jedec: string | null;
  /** Banks erased in the dump before it boots; empty when the entry's donor already carries one. */
  readonly erase: readonly SlotKey[];
  /** Offsets of the banks in the 4 MiB part (the plan's addresses minus the flash base). */
  readonly offsets: Readonly<Record<SlotKey, number>>;
  /** The banks the scenario expects to read as empty before anything is written. */
  readonly empty: readonly SlotKey[];
  /**
   * Banks that read cleanly, are not erased, and are not an image (their header magic is gone):
   * 'foreign', which is not 'empty'. Everything else is expected to be an image.
   */
  readonly foreign?: readonly SlotKey[];
  /**
   * The bank the camera names as booted (then a write to a non-booted application bank needs no tick,
   * and the booted one does), or null where it names none (then every bank needs the tick). The 2014
   * chain and, since TESTING.md 42.84, the 2016 line name it from the camera's active-slot word.
   */
  readonly booted: SlotKey | null;
  /** The bank the empty write targets, and the bank whose image is written into it. */
  readonly target: SlotKey;
  readonly source: SlotKey;
}

const LOCKED_OFFSETS = { a: 0x50000, b: 0x60000, r: 0x70000 } as const;
const MODERN_OFFSETS = { a: 0x30000, b: 0x50000, r: 0x70000 } as const;

const SCENARIOS: readonly Scenario[] = [
  {
    label: 'Compact 1.3.0.0, the 2014 plaintext chain: B and R erased',
    entryId: 'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump',
    version: '1.3.0.0',
    staging: 'plain',
    jedec: null,
    erase: ['b', 'r'],
    offsets: LOCKED_OFFSETS,
    empty: ['b', 'r'],
    booted: 'a',
    target: 'b',
    source: 'a',
  },
  {
    label: 'Compact 0.8.0.0 (image-only on the 2014 donor): B empty, no booted bank named',
    entryId:
      'compact/2014.09.17-09.17.37-0.8.0.0/no-serial/subi_lpc43xx_lpcopen_0.8.0.0_compact_sep_17_2014_09-17-37_99.28_yrambler2001_firmware',
    version: '0.8.0.0',
    staging: 'plain',
    jedec: null,
    erase: [],
    offsets: LOCKED_OFFSETS,
    empty: ['b'],
    booted: null,
    target: 'b',
    source: 'a',
  },
  {
    label: 'Compact 4.8.2.1, the Key A line: B erased',
    entryId: 'compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/dump',
    version: '4.8.2.1',
    staging: 'key-a-ciphertext',
    jedec: null,
    erase: ['b'],
    offsets: MODERN_OFFSETS,
    empty: ['b'],
    booted: 'a',
    target: 'b',
    source: 'a',
  },
  {
    label: 'Compact PRO 1.0.3.0, the 2016 keystream line: B erased',
    entryId: 'compact_pro/2016.07.06-17.04.49-1.0.3.0/0C21A1M5KP15/dump',
    version: '1.0.3.0',
    staging: 'slot-keystream-ciphertext',
    jedec: SPANSION_4MB_JEDEC,
    erase: ['b'],
    offsets: LOCKED_OFFSETS,
    empty: ['b'],
    booted: 'a',
    target: 'b',
    source: 'a',
  },
  {
    /* A REAL camera's dump, not an erased one. This Compact PRO FF has its bank A erased (all
     * 65,536 bytes 0xFF), bank B's image with the header magic at 0x200 wiped to 0xFFFFFFFF (so B
     * is 'foreign', not 'empty': its header window is not all 0xFF), and recovery R intact.
     * Nothing is erased here; the emulator boots the dump as it is. */
    label: 'Compact PRO FF 1.0.3.0 (corpus dump 1C1AB1CBC8A3): A erased and B magic-less as dumped',
    entryId: 'compact_pro/2016.07.06-17.05.32-1.0.3.0-FF/1C1AB1CBC8A3/dump',
    version: '1.0.3.0',
    staging: 'slot-keystream-ciphertext',
    jedec: SPANSION_4MB_JEDEC,
    erase: [],
    offsets: LOCKED_OFFSETS,
    empty: ['a'],
    foreign: ['b'],
    booted: 'r',
    target: 'a',
    source: 'r',
  },
];

const available = EMU_DIR !== null;
if (!available) announceSkip('the empty-bank workflows on the emulated cameras');

/* ---- what one scenario recorded ------------------------------------------ */

interface DumpRecord {
  readonly empty: boolean;
  readonly allFF: boolean;
  readonly plainNull: boolean;
  readonly identicalToFlash: boolean;
  readonly sha256: string;
  readonly notes: string;
}

interface WriteRecord {
  error: string | null;
  code: string | null;
  requests: number;
  targetEmpty: boolean | null;
  commitStatus: number | null;
  verified: boolean | null;
  decryptsToSource: boolean | null;
  accepts: boolean | null;
  identical: boolean | null;
  tailErased: boolean | null;
}

function blankWrite(): WriteRecord {
  return {
    error: null,
    code: null,
    requests: 0,
    targetEmpty: null,
    commitStatus: null,
    verified: null,
    decryptsToSource: null,
    accepts: null,
    identical: null,
    tailErased: null,
  };
}

interface Run {
  setup: string | null;
  version: string | null;
  profile: string | null;
  planWritable: Record<SlotKey, boolean> | null;
  planWhy: Record<SlotKey, string> | null;
  contents: Record<SlotKey, SlotContent> | null;
  booted: SlotKey | null;
  dumpsBefore: Partial<Record<SlotKey, DumpRecord>>;
  /** The write without the tick into the booted bank, or into the empty target when no booted bank is named. */
  untickedWrite: WriteRecord | null;
  write: WriteRecord;
  dumpAfterTarget: { empty: boolean; decryptsToSource: boolean | null } | null;
  /** The banks that were empty and were not written: still empty afterwards. */
  stillEmpty: Partial<Record<SlotKey, DumpRecord>>;
  /** A raw payload into an empty recovery bank. */
  rawIntoR: WriteRecord | null;
  cfgUnchanged: boolean | null;
  resetSent: boolean;
}

function blankRun(): Run {
  return {
    setup: null,
    version: null,
    profile: null,
    planWritable: null,
    planWhy: null,
    contents: null,
    booted: null,
    dumpsBefore: {},
    untickedWrite: null,
    write: blankWrite(),
    dumpAfterTarget: null,
    stillEmpty: {},
    rawIntoR: null,
    cfgUnchanged: null,
    resetSent: false,
  };
}

/* ---- the run ------------------------------------------------------------- */

function allFF(bytes: Uint8Array): boolean {
  for (const byte of bytes) if (byte !== 0xff) return false;
  return true;
}

function recordDump(dumped: DumpedSlot, flash: Uint8Array, offset: number): DumpRecord {
  return {
    empty: dumped.empty,
    allFF: allFF(dumped.raw),
    plainNull: dumped.plain === null && dumped.plainSha256 === null,
    identicalToFlash: equalBytes(dumped.raw, flash.subarray(offset, offset + BANK_BYTES)),
    sha256: dumped.sha256,
    notes: dumped.notes.join(' | '),
  };
}

/** The 4 MiB part of a full dump with the named banks erased, written where the emulator can boot it. */
function erasedPart(scenario: Scenario, source: Uint8Array): string {
  if (source.length !== FLASH_BYTES) {
    throw new Error(`${scenario.label}: the corpus dump is ${String(source.length)} B, not 4 MiB`);
  }
  const part = source.slice();
  for (const key of scenario.erase) {
    part.fill(0xff, scenario.offsets[key], scenario.offsets[key] + BANK_BYTES);
  }
  const file = scratchFile(`empty-bank_${scenario.version}_${scenario.erase.join('')}.part`);
  writeFileSync(file, part);
  return file;
}

/** The corpus dump a scenario erases banks of: the entry's vendored 4 MiB part. */
function dumpOf(entryId: string): Uint8Array {
  const entry = corpusEntries().find((e) => e.id === entryId);
  if (entry === undefined) throw new Error(`no corpus entry ${entryId}`);
  return vendoredBytes(entry);
}

async function runScenario(scenario: Scenario, row: RowEmulators, run: Run): Promise<void> {
  const truthPath = scratchFile(`empty-bank_truth_${scenario.version}.bin`);
  const override = scenario.erase.length > 0;
  const emu = await row.start(EMU_DIR!, {
    entryId: override ? `flash:empty-bank-${scenario.version}` : scenario.entryId,
    readyTimeoutMs: BOOT_TIMEOUT_MS,
    flashOut: truthPath,
    ...(scenario.jedec === null ? {} : { jedec: scenario.jedec }),
    ...(override ? { flashOverride: erasedPart(scenario, dumpOf(scenario.entryId)) } : {}),
  });

  await row.guard(emu, async () => {
    const adapter = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
    const transport = new WebUsbTransport(adapter, {
      recipient: 'auto',
      api: 'usbip (emulator)',
      host: 'vitest',
      clock: adapter.deadlineClock,
    });
    const sent: Sent[] = [];
    recordTransport(transport, sent);
    await transport.open();
    try {
      const device = new SeekDevice(transport, { reporter: silentReporter });
      const flash = new Uint8Array(readFileSync(truthPath));
      const probed: FirmwareProfile = detectProfile(
        evidenceFromChannelProbe(await probeSelectorChannel(device)),
      ).best.profile;
      const ctx: WorkflowContext = {
        device,
        profile: probed,
        detection: null,
        reporter: silentReporter,
      };
      const report: SlotsReport = await inspectSlots(ctx);
      const state = report.state;
      run.version = state.version;
      run.profile = state.profile.id;
      run.booted = state.boot?.booted ?? null;
      run.planWritable = Object.fromEntries(
        report.plan.slots.map((s) => [s.key, s.emptyBank.writable.supported]),
      ) as Record<SlotKey, boolean>;
      run.planWhy = Object.fromEntries(
        report.plan.slots.map((s) => [s.key, s.emptyBank.why]),
      ) as Record<SlotKey, string>;
      run.contents = Object.fromEntries(
        report.slots.map((v) => [v.entry.key, v.content]),
      ) as Record<SlotKey, SlotContent>;

      const cfgEntry = windowAt(state.profile, state.version ?? '', CFG_ADDRESS);
      const cfgBefore = cfgEntry === null ? null : (await device.readWindow(cfgEntry)).data;

      /* ---- the empty banks, dumped ---- */
      for (const key of scenario.empty) {
        const dumped = await dumpSlot(ctx, report, key);
        run.dumpsBefore[key] = recordDump(dumped, flash, scenario.offsets[key]);
      }

      /* ---- the image to write: the source bank's decrypted image ---- */
      const sourceSlot = state.byKey.get(scenario.source) ?? null;
      const image = sourceSlot?.plain ?? null;
      if (image === null) {
        run.setup = `bank ${scenario.source} holds no decrypted image to write`;
        return;
      }
      const keyTable = state.keyTable;
      const fileName =
        keyTable === null
          ? 'image.bin'
          : `image${keyFilenameSuffix(keyTable.keyA, keyTable.keyB)}.bin`;
      const input: SlotFlashInput = { kind: 'plain', bytes: image, fileName };
      const bankOf = (key: SlotKey): number => scenario.offsets[key];

      /* ---- the write into the empty target ---- */
      const write = async (
        into: SlotKey,
        what: SlotFlashInput,
        acknowledgeRisk: boolean,
        record: WriteRecord,
      ): Promise<{ payload: Uint8Array | null }> => {
        const mark = sent.length;
        let payload: Uint8Array | null = null;
        try {
          const plan = prepareSlotFlash(report, into, what);
          payload = plan.payload;
          record.targetEmpty = plan.targetEmpty ?? false;
          const result = await flashSlot(ctx, report, plan, { acknowledgeRisk });
          record.commitStatus = result.commitStatus;
          record.verified = result.verified;
          const after = result.after;
          if (after !== null) {
            if (what.kind === 'raw') {
              record.identical = equalBytes(after.subarray(0, plan.payload.length), plan.payload);
              record.tailErased = allFF(after.subarray(plan.payload.length));
            }
            const wanted = plan.expectedPlain ?? null;
            if (wanted !== null) {
              const back = decryptedReadBack(after, wanted.length, state, scenario.staging);
              record.decryptsToSource = equalBytes(back.plain, wanted);
              record.accepts = back.accepts;
            }
          }
        } catch (error) {
          record.error = errorMessage(error);
          record.code = error instanceof SeekError ? error.code : null;
        }
        record.requests = sent.length - mark;
        return { payload };
      };

      /* The tick guards the booted bank and R; where the camera names no booted bank it guards every
       * bank, an empty one too. The unticked write goes to the bank it guards and must send nothing. */
      run.untickedWrite = blankWrite();
      await write(scenario.booted ?? scenario.target, input, false, run.untickedWrite);
      const ticked = scenario.booted === null;
      const done = await write(scenario.target, input, ticked, run.write);

      /* ---- the target now holds the image; the other empty banks are untouched ---- */
      const afterDump = await dumpSlot(ctx, report, scenario.target);
      let decrypts: boolean | null = null;
      if (run.write.commitStatus === 0) {
        const wanted = prepareSlotFlash(report, scenario.target, input).expectedPlain ?? null;
        if (wanted !== null) {
          decrypts = equalBytes(
            decryptedReadBack(afterDump.raw, wanted.length, state, scenario.staging).plain,
            wanted,
          );
        }
      }
      run.dumpAfterTarget = { empty: afterDump.empty, decryptsToSource: decrypts };

      for (const key of scenario.empty) {
        if (key === scenario.target) continue;
        const again = await dumpSlot(ctx, report, key);
        run.stillEmpty[key] = recordDump(again, flash, bankOf(key));
      }

      /* ---- a RAW payload into an empty recovery bank (the plain chain: stored as sent) ---- */
      if (scenario.empty.includes('r') && done.payload !== null) {
        run.rawIntoR = blankWrite();
        await write(
          'r',
          { kind: 'raw', bytes: done.payload, fileName: 'raw.bin' },
          true,
          run.rawIntoR,
        );
      }

      const cfgAfter = cfgEntry === null ? null : (await device.readWindow(cfgEntry)).data;
      run.cfgUnchanged =
        cfgBefore === null || cfgAfter === null ? null : equalBytes(cfgBefore, cfgAfter);
      run.resetSent = sent.some((s) => s.op === OP_RESET_DEVICE);
    } finally {
      await transport.close();
    }
  });
}

/* ---- the suite ------------------------------------------------------------ */

describe.skipIf(!available)('an empty bank on the emulated cameras', () => {
  for (const scenario of SCENARIOS) {
    const present = ENTRIES.some((e) => e.id === scenario.entryId);
    describe.skipIf(!present)(scenario.label, () => {
      const run = blankRun();
      const row = new RowEmulators(scenario.entryId);

      beforeAll(async () => {
        try {
          await runScenario(scenario, row, run);
        } catch (error) {
          run.setup = run.setup ?? errorMessage(error);
        }
      }, TIMEOUT_MS);

      afterAll(async () => {
        await row.finish();
        expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
      });

      it('boots, and the plan says an empty bank can be written (with its reason)', () => {
        expect(run.setup).toBeNull();
        expect(run.version).toBe(scenario.version);
        for (const key of ['a', 'b', 'r'] as const) {
          expect(run.planWritable?.[key], `bank ${key} writable while empty`).toBe(true);
          expect(run.planWhy?.[key].length ?? 0, `bank ${key} says why`).toBeGreaterThan(40);
        }
      });

      it('reports exactly the erased banks as empty, the magic-less ones as foreign, and the others as images', () => {
        for (const key of ['a', 'b', 'r'] as const) {
          expect(run.contents?.[key], `bank ${key}`).toBe(
            scenario.empty.includes(key)
              ? 'empty'
              : scenario.foreign?.includes(key) === true
                ? 'foreign'
                : 'image',
          );
        }
      });

      it('dumps each empty bank as the raw 64 KiB of 0xFF: equal to the flash, nothing decrypted', () => {
        for (const key of scenario.empty) {
          const d = run.dumpsBefore[key];
          expect(d, `bank ${key} dumped`).toBeDefined();
          expect(d?.empty, `bank ${key} empty`).toBe(true);
          expect(d?.allFF).toBe(true);
          expect(d?.plainNull, 'no decrypted image').toBe(true);
          expect(d?.identicalToFlash, 'the dump equals the emulator flash').toBe(true);
          expect(d?.notes).toMatch(/empty, nothing to decrypt/);
        }
      });

      it(`names the booted bank the camera reports: ${scenario.booted?.toUpperCase() ?? 'none'}`, () => {
        expect(run.booted).toBe(scenario.booted);
      });

      it(
        scenario.booted === null
          ? 'with no booted bank named, an empty bank still needs the tick: refused, nothing sent'
          : `the booted bank ${scenario.booted.toUpperCase()} needs the tick: refused, nothing sent`,
        () => {
          const w = run.untickedWrite;
          expect(w?.code, w?.error ?? 'the write went through').toBe('slots/refused');
          expect(w?.error).toMatch(/acknowledgeRisk/);
          expect(w?.requests, 'requests the camera received').toBe(0);
        },
      );

      it('writes the source bank image into the empty target: plan says empty, commit 0, verified', () => {
        const w = run.write;
        expect(w.error, 'the write').toBeNull();
        expect(w.targetEmpty, 'the plan says the target was empty').toBe(true);
        expect(w.commitStatus).toBe(0);
        expect(w.verified, 'the read-back is verified').toBe(true);
        expect(w.decryptsToSource, 'the read-back decrypts to the staged image').toBe(true);
        expect(w.accepts).toBe(true);
      });

      it('the target no longer dumps as empty, and decrypts to the image written', () => {
        expect(run.dumpAfterTarget?.empty).toBe(false);
        expect(run.dumpAfterTarget?.decryptsToSource).toBe(true);
      });

      const others = scenario.empty.filter((key) => key !== scenario.target);
      if (others.length > 0) {
        it(`${others.map((k) => k.toUpperCase()).join(' and ')} stays empty, byte for byte, after the other bank was written`, () => {
          for (const key of others) {
            const again = run.stillEmpty[key];
            expect(again?.empty, `bank ${key}`).toBe(true);
            expect(again?.sha256, `bank ${key} unchanged`).toBe(run.dumpsBefore[key]?.sha256);
            expect(again?.identicalToFlash).toBe(true);
          }
        });

        it('a RAW payload into the empty recovery bank R (ticked) reads back as sent, tail erased', () => {
          const w = run.rawIntoR;
          expect(w?.error, 'the raw write').toBeNull();
          expect(w?.targetEmpty).toBe(true);
          expect(w?.commitStatus).toBe(0);
          expect(w?.identical, 'the 2014 chain stores the payload as sent').toBe(true);
          expect(w?.tailErased).toBe(true);
        });
      }

      it('leaves the boot-config block unchanged and never sends ResetDevice', () => {
        expect(run.cfgUnchanged).toBe(true);
        expect(run.resetSent).toBe(false);
      });

      it('the emulator delivered every reply it sent (no infrastructure defect)', async () => {
        await row.assertDelivery();
      });
    });
  }
});
