/* ==================================================================== *
 * The bank actions of TESTING.md 42.91 on the emulated cameras, through the functions the page and the
 * CLI call: "Copy to slot X" (`planSlotCopy` + `flashSlotWithBackup`), "Restore from full flash backup"
 * (`fullFlashOf` + `planSlotRestore` + `flashSlotWithBackup`), and "Make N FPS in every bank"
 * (`patchEveryBankFps`). One boot per firmware: the 2014 plain chain (Compact 1.3.0.0), the 2016
 * keystream line (Compact PRO 1.0.3.0) and the Key A line (Compact PRO 4.9.2.0).
 *
 * FOR EACH FIRMWARE, in order, on one emulator:
 *   1. the full flash the emulator booted (its `--flash-out`) is kept as the "full flash backup";
 *   2. COPY the booted bank into another bank: the backup zip is saved before anything is staged and holds
 *      the target as the flash held it; the write commits and reads back as written; the slots read
 *      afterwards shows the target holding the source's image;
 *   3. RESTORE that bank from the full flash backup (bank B; or recovery R when the backup's B is empty,
 *      which the restore refuses as it must): the write commits and reads back as written, and the
 *      read-back is compared with the backup's stored bank bytes (recorded: equal or not, per line).
 *      The same flash as a Dump & decrypt 4.x/Nano zip (every block the dump cannot reach gap-filled and
 *      listed in its manifest.json) plans every bank as the flash file does, and refuses a bank in a gap;
 *      on 4.x the one gap, 0x14060000, holds no bank, so A, B and R all plan as from the flash file;
 *   4. EVERY BANK: the frame-rate patch of every bank that offers it, one zip saved first holding every one
 *      of them, each written in turn (booted bank last) and read back as planned;
 *   5. ResetDevice is never sent, and each commit was announced once (`onCommit`) before it went out.
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR (SEEK_EMU_DIR), like every emulator suite.
 * ==================================================================== */

import { readFileSync } from 'node:fs';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildGapRecord } from '../../src/archive/manifest.js';
import { buildZip } from '../../src/archive/zip.js';
import { sha256hex, utf8 } from '../../src/bytes.js';
import { silentReporter } from '../../src/events.js';
import { errorMessage } from '../../src/errors.js';
import { getProfile } from '../../src/profiles/registry.js';
import type { FirmwareProfile } from '../../src/profiles/types.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { WebUsbTransport } from '../../src/protocol/webusb.js';
import type { WriteBackup } from '../../src/slots/backup.js';
import { planSlotCopy } from '../../src/slots/copy.js';
import { fpsEveryBankPlan, patchEveryBankFps } from '../../src/slots/fps-patch.js';
import { inspectSlots } from '../../src/slots/inspect.js';
import {
  FLASH_BASE,
  fullFlashOf,
  planSlotRestore,
  restoreReadBack,
} from '../../src/slots/restore.js';
import type { SlotKey, SlotsReport } from '../../src/slots/types.js';
import { flashSlotWithBackup } from '../../src/slots/write.js';
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
import { backupBankFiles } from './backup-files.js';

const TIMEOUT_MS = Number(process.env.SEEK_EMU_SLOTS_TIMEOUT_MS ?? '1800000');
const OP_RESET_DEVICE = 0x59;
const BANK_BYTES = 0x10000;

interface Subject {
  readonly label: string;
  readonly entryId: string;
  readonly profile: FirmwareProfile;
  readonly version: string;
  /** The 2016 app's SPI-NOR driver knows only the Spansion part (write.emulator.test.ts). */
  readonly jedec?: string;
}

const SUBJECTS: readonly Subject[] = [
  {
    label: 'Compact 1.3.0.0 (the 2014 plain chain)',
    entryId: 'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump',
    profile: getProfile('legacy-auth'),
    version: '1.3.0.0',
  },
  {
    label: 'Compact PRO 1.0.3.0 (the 2016 keystream line)',
    entryId: 'compact_pro/2016.07.06-17.04.49-1.0.3.0/0C21A1M5KP15/dump',
    profile: getProfile('compact-2016'),
    version: '1.0.3.0',
    jedec: '010215',
  },
  {
    label: 'Compact PRO 4.9.2.0 (the Key A line)',
    entryId: 'compact_pro/2020.02.13-15.26.01-4.9.2.0/1215A0YZ9AA8/dump',
    profile: getProfile('modern-4x'),
    version: '4.9.2.0',
  },
];

const available = EMU_DIR !== null;
if (!available) announceSkip('the bank copy, restore and every-bank patch on the emulated cameras');

interface Run {
  setup: string | null;
  version: string | null;
  booted: SlotKey | null;
  copy: {
    from: SlotKey | null;
    to: SlotKey | null;
    error: string | null;
    savedBeforeStage: boolean | null;
    backupHoldsTarget: boolean | null;
    backupName: string | null;
    commitStatus: number | null;
    verified: boolean | null;
    targetHoldsSource: boolean | null;
    notes: string[];
  };
  restore: {
    key: SlotKey | null;
    emptyRefusal: string | null;
    error: string | null;
    sameCamera: boolean | null;
    warnings: string[];
    commitStatus: number | null;
    verified: boolean | null;
    equalToBackup: boolean | null;
    differing: number | null;
    imageBack: boolean | null;
    notes: string[];
  };
  /** Each bank's restore plan from the flash file and from the same flash as a dump zip: planned or refused. */
  dumpZip: {
    from: string | null;
    gapBanks: SlotKey[];
    outcomes: Partial<Record<SlotKey, { file: string; zip: string }>>;
  };
  every: {
    offered: SlotKey[];
    error: string | null;
    zipBanks: SlotKey[];
    written: SlotKey[];
    readBacksOk: boolean[];
    stopped: string | null;
    notes: string[];
  };
  commits: number;
  commitsAnnounced: number;
  resetSent: boolean;
}

function blankRun(): Run {
  return {
    setup: null,
    version: null,
    booted: null,
    copy: {
      from: null,
      to: null,
      error: null,
      savedBeforeStage: null,
      backupHoldsTarget: null,
      backupName: null,
      commitStatus: null,
      verified: null,
      targetHoldsSource: null,
      notes: [],
    },
    restore: {
      key: null,
      emptyRefusal: null,
      error: null,
      sameCamera: null,
      warnings: [],
      commitStatus: null,
      verified: null,
      equalToBackup: null,
      differing: null,
      imageBack: null,
      notes: [],
    },
    dumpZip: { from: null, gapBanks: [], outcomes: {} },
    every: {
      offered: [],
      error: null,
      zipBanks: [],
      written: [],
      readBacksOk: [],
      stopped: null,
      notes: [],
    },
    commits: 0,
    commitsAnnounced: 0,
    resetSent: false,
  };
}

function bankOf(flash: Uint8Array, report: SlotsReport, key: SlotKey): Uint8Array {
  const address = report.plan.slots.find((slot) => slot.key === key)?.address ?? 0;
  const at = address - FLASH_BASE;
  return flash.subarray(at, at + BANK_BYTES);
}

function same(a: Uint8Array | null | undefined, b: Uint8Array | null | undefined): boolean {
  if (a == null || b == null) return false;
  return a.length === b.length && a.every((byte, i) => byte === b[i]);
}

async function runFirmware(subject: Subject, row: RowEmulators, run: Run): Promise<void> {
  const flashOut = scratchFile(`copy-restore_${subject.entryId}.bin`);
  const emu = await row.start(EMU_DIR!, {
    entryId: subject.entryId,
    readyTimeoutMs: BOOT_TIMEOUT_MS,
    flashOut,
    ...(subject.jedec === undefined ? {} : { jedec: subject.jedec }),
  });
  await row.guard(emu, async () => {
    const adapter = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
    const transport = new WebUsbTransport(adapter, {
      recipient: 'auto',
      api: 'usbip (emulator)',
      host: 'vitest',
      clock: adapter.deadlineClock,
    });
    const sent: number[] = [];
    const controlOut = transport.controlOut.bind(transport);
    transport.controlOut = (request, data, timeoutMs): Promise<void> => {
      sent.push(request);
      return controlOut(request, data, timeoutMs);
    };
    await transport.open();
    try {
      const device = new SeekDevice(transport);
      const ctx: WorkflowContext = {
        device,
        profile: subject.profile,
        detection: null,
        reporter: silentReporter,
      };
      const flash = new Uint8Array(readFileSync(flashOut));
      const announced = (): void => {
        run.commitsAnnounced += 1;
      };

      /* ---- 2. copy ---- */
      let report = await inspectSlots(ctx);
      run.version = report.state.version;
      if (report.state.version !== subject.version) {
        run.setup = `the camera reports ${String(report.state.version)}, not ${subject.version}`;
        return;
      }
      const booted: SlotKey = report.state.boot?.booted ?? 'a';
      run.booted = report.state.boot?.booted ?? null;
      const from = booted;
      const to: SlotKey = from === 'b' ? 'a' : 'b';
      run.copy.from = from;
      run.copy.to = to;
      try {
        const copy = planSlotCopy(report, from, to);
        const at = { stagedAtSave: -1 };
        const saved: WriteBackup[] = [];
        const done = await flashSlotWithBackup(ctx, report, copy.plan, {
          acknowledgeRisk: true,
          action: { kind: 'copy', from },
          saveBackup: (backup) => {
            at.stagedAtSave = sent.filter((op) => op === 0x50 || op === 0x51).length;
            saved.push(backup);
            return Promise.resolve(true);
          },
          onCommit: announced,
        });
        run.commits += 1;
        run.copy.savedBeforeStage = at.stagedAtSave === 0;
        const backup = saved[0];
        run.copy.backupName = backup?.fileName ?? null;
        run.copy.backupHoldsTarget =
          backup === undefined
            ? false
            : same(backupBankFiles(backup, to).raw, bankOf(flash, report, to));
        run.copy.commitStatus = done.written.commitStatus;
        run.copy.verified = done.written.verified;
        run.copy.notes.push(...done.written.notes);
        const sourcePlain = report.slots.find((v) => v.entry.key === from)?.state?.plain ?? null;
        report = await inspectSlots(ctx);
        run.copy.targetHoldsSource = same(
          report.slots.find((v) => v.entry.key === to)?.state?.plain,
          sourcePlain,
        );
      } catch (error) {
        run.copy.error = errorMessage(error);
        report = await inspectSlots(ctx);
      }

      /* ---- 3. restore ---- */
      const backupFile = await fullFlashOf(flash, 'emulator-flash-out.bin');
      /* The same flash as a dump zip: what the dump cannot reach is gap fill, listed in manifest.json. */
      const dumped = flash.slice();
      const gaps = subject.profile.memory.unreachable.map((range) => {
        dumped.fill(0xff, range.address - FLASH_BASE, range.address - FLASH_BASE + range.length);
        return buildGapRecord({
          address: range.address,
          flashBase: FLASH_BASE,
          length: range.length,
          fill: 0xff,
          reason: range.reason,
        });
      });
      const fromZip = await fullFlashOf(
        buildZip([
          { name: 'dump/flash_dump_original.bin', data: dumped },
          { name: 'dump/manifest.json', data: utf8(JSON.stringify({ gapFill: '0xff', gaps })) },
        ]),
        'dump.zip',
      );
      run.dumpZip.from = fromZip.from;
      const outcome = async (backup: typeof backupFile, bank: SlotKey): Promise<string> => {
        try {
          return `planned ${(await planSlotRestore(report, bank, backup)).storedSha256}`;
        } catch (error) {
          return `refused: ${errorMessage(error)}`;
        }
      };
      for (const bank of ['a', 'b', 'r'] as const) {
        const address = report.plan.slots.find((slot) => slot.key === bank)?.address ?? 0;
        if (
          subject.profile.memory.unreachable.some(
            (range) =>
              range.address < address + BANK_BYTES && address < range.address + range.length,
          )
        ) {
          run.dumpZip.gapBanks.push(bank);
        }
        run.dumpZip.outcomes[bank] = {
          file: await outcome(backupFile, bank),
          zip: await outcome(fromZip, bank),
        };
      }
      let key: SlotKey = to;
      let restore = null;
      try {
        restore = await planSlotRestore(report, key, backupFile);
      } catch (error) {
        run.restore.emptyRefusal = errorMessage(error);
        key = 'r';
        restore = await planSlotRestore(report, key, backupFile);
      }
      run.restore.key = key;
      run.restore.sameCamera = restore.sameCamera;
      run.restore.warnings = [...restore.plan.warnings];
      try {
        const done = await flashSlotWithBackup(ctx, report, restore.plan, {
          acknowledgeRisk: true,
          action: { kind: 'restore', fileName: backupFile.fileName },
          saveBackup: () => Promise.resolve(true),
          onCommit: announced,
        });
        run.commits += 1;
        run.restore.commitStatus = done.written.commitStatus;
        run.restore.verified = done.written.verified;
        run.restore.notes.push(...done.written.notes);
        const check = restoreReadBack(restore.stored, done.written.after);
        run.restore.equalToBackup = check.equal;
        run.restore.differing = check.differing;
        report = await inspectSlots(ctx);
        const plain = report.slots.find((v) => v.entry.key === key)?.state?.plain ?? null;
        run.restore.imageBack =
          plain !== null &&
          (await sha256hex(plain)) ===
            (await sha256hex(restore.decryption.plain ?? new Uint8Array()));
      } catch (error) {
        run.restore.error = errorMessage(error);
        report = await inspectSlots(ctx);
      }

      /* ---- 4. every bank ---- */
      const every = fpsEveryBankPlan(report);
      run.every.offered = [...every.order];
      if (every.order.length > 0) {
        try {
          const done = await patchEveryBankFps(ctx, report, {
            acknowledgeRisk: true,
            saveBackup: (backup) => {
              run.every.zipBanks = backup.banks.map((bank) => bank.key);
              return Promise.resolve(true);
            },
            onCommit: announced,
          });
          run.commits += done.results.length;
          run.every.written = done.results.map((result) => result.key);
          run.every.readBacksOk = done.results.map((result) => result.readBack.ok === true);
          run.every.stopped = done.stopped === null ? null : done.stopped.reason;
          for (const result of done.results) run.every.notes.push(...result.notes);
        } catch (error) {
          run.every.error = errorMessage(error);
        }
      }
      run.resetSent = sent.includes(OP_RESET_DEVICE);
    } catch (error) {
      run.setup = run.setup ?? errorMessage(error);
    } finally {
      await transport.close();
    }
  });
}

describe.skipIf(!available)(
  'copy, restore and the every-bank patch on the emulated cameras',
  () => {
    for (const subject of SUBJECTS) {
      const present = ENTRIES.some((entry) => entry.id === subject.entryId);
      describe.skipIf(!present)(subject.label, () => {
        const run = blankRun();
        const row = new RowEmulators(subject.entryId);

        beforeAll(async () => {
          try {
            await runFirmware(subject, row, run);
          } catch (error) {
            run.setup = run.setup ?? errorMessage(error);
          }
          process.stderr.write(
            `[copy-restore] ${subject.label}: ${JSON.stringify(run, null, 1)}\n`,
          );
        }, TIMEOUT_MS);

        afterAll(async () => {
          await row.finish();
          expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
        });

        it(`boots ${subject.version} and reads its slots (setup)`, () => {
          expect(run.setup).toBeNull();
          expect(run.version).toBe(subject.version);
        });

        it('copy: the target is saved in the zip before anything is staged, written, read back, and holds the source image', () => {
          const detail = `${run.copy.error ?? ''}\n${run.copy.notes.join('\n')}`;
          expect(run.copy.error, detail).toBeNull();
          expect(run.copy.savedBeforeStage, 'nothing staged before the save').toBe(true);
          expect(run.copy.backupHoldsTarget, 'the zip holds the target as the flash held it').toBe(
            true,
          );
          expect(run.copy.backupName).toMatch(
            new RegExp(
              `_bank-${String(run.copy.to).toUpperCase()}_before-copy-from-${String(run.copy.from).toUpperCase()}\\.zip$`,
            ),
          );
          expect(run.copy.commitStatus).toBe(0);
          expect(run.copy.verified, detail).toBe(true);
          expect(run.copy.targetHoldsSource, 'the slots read shows the copied image').toBe(true);
        });

        it('restore: the bank from the full flash backup is written, read back as written, and its image is back', () => {
          const detail = `${run.restore.error ?? ''}\n${run.restore.notes.join('\n')}`;
          expect(run.restore.error, detail).toBeNull();
          expect(run.restore.commitStatus).toBe(0);
          expect(run.restore.verified, detail).toBe(true);
          expect(run.restore.imageBack, 'the slots read shows the backup image again').toBe(true);
          /* Recorded, not required: whether the stored bytes come back equal is per line (TESTING.md 42.91). */
          process.stderr.write(
            `[copy-restore] ${subject.label}: restore of ${String(run.restore.key)}: read-back equal to the ` +
              `backup's stored bytes: ${String(run.restore.equalToBackup)} (${String(run.restore.differing)} B differ); ` +
              `empty-bank refusal: ${String(run.restore.emptyRefusal)}; same camera: ${String(run.restore.sameCamera)}; ` +
              `warnings: ${JSON.stringify(run.restore.warnings)}\n`,
          );
        });

        it('a dump zip of the same flash: a bank in a gap is refused, every other bank plans as from the flash file', () => {
          const detail = JSON.stringify(run.dumpZip, null, 1);
          expect(run.dumpZip.from, detail).toBe('dump');
          if (subject.version.startsWith('4.')) {
            expect(run.dumpZip.gapBanks, '4.x: the gap 0x14060000 holds no bank').toEqual([]);
          }
          for (const bank of ['a', 'b', 'r'] as const) {
            const seen = run.dumpZip.outcomes[bank];
            expect(seen, detail).toBeDefined();
            if (run.dumpZip.gapBanks.includes(bank)) {
              expect(seen?.zip, detail).toMatch(/^refused: .*was not read by the dump/);
            } else {
              expect(seen?.zip, detail).toBe(seen?.file);
            }
          }
          process.stderr.write(`[copy-restore] ${subject.label}: dump zip: ${detail}\n`);
        });

        it('every bank: one zip of every offered bank, each written in turn and read back as planned', () => {
          if (run.every.offered.length === 0) {
            process.stderr.write(`[copy-restore] ${subject.label}: no bank offers the patch\n`);
            return;
          }
          expect(run.every.error, run.every.notes.join('\n')).toBeNull();
          expect([...run.every.zipBanks].sort()).toEqual([...run.every.offered].sort());
          expect(run.every.written).toEqual(run.every.offered);
          expect(run.every.readBacksOk.every(Boolean), run.every.notes.join('\n')).toBe(true);
          expect(run.every.stopped).toBeNull();
          if (run.booted !== null && run.every.offered.includes(run.booted)) {
            expect(run.every.offered.at(-1), 'the booted bank is written last').toBe(run.booted);
          }
        });

        it('no ResetDevice; every commit announced once before it went out', () => {
          expect(run.resetSent).toBe(false);
          expect(run.commitsAnnounced).toBe(run.commits);
        });

        it('the emulator delivered every reply it sent (no infrastructure defect)', async () => {
          await row.assertDelivery();
        });
      });
    }
  },
);
