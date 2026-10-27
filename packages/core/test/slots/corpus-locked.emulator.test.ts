/* ====================================================================
 * The slot workflows on every locked-line firmware in the emulator corpus,
 * at or above 0.8.0.0: the 2014 plaintext chain and the Compact PRO 2016
 * keystream line, each with its FF variant. One emulator boot per firmware.
 *
 * FOR EACH FIRMWARE the suite asserts (corpus-locked-run.ts records the steps):
 *   - the offline plan (buildSlotPlan): supported, the locked family, the staging
 *     form the page writes with;
 *   - the analysis (inspectSlots): the profile it is judged under, the banks read;
 *   - each dump (dumpSlot A, B, R) byte-identical to the emulator's own flash, and
 *     each bank holding the corpus image (image-only entries);
 *   - a write to the booted bank without acknowledgeRisk is refused, and no request
 *     reaches the camera;
 *   - the image flashed into the non-booted bank commits with status 0 and reads back
 *     as that image; the same into recovery R, acknowledged; a RAW payload into R
 *     reads back as sent. The 1.3.0.8 FF image (word sum 0xFFFF) goes to A, B and R in its
 *     vendor form (the image XOR Key A, stored under Key B, TESTING.md 42.12): each commits with
 *     status 0 and reads back as the image XOR Key B; its staged payload sent raw does the same;
 *     and R's original stored bytes sent raw are rejected by the camera (0x00070100) before any
 *     erase, leaving R as the FF write made it;
 *   - the boot-config block (and the bootloader, where the build exposes it) reads
 *     back unchanged after every write;
 *   - ResetDevice is never sent, and the write path never arms subcommand 0.
 *
 * WHAT IS PINNED, NOT SKIPPED. Where a build's own tables cannot show a fact (the
 * booted bank of 0.8.0.0 and the FF build, the 1.0.3.x boot prediction, the bootloader
 * window of 0.8.0.0, 1.3.0.8 and the 1.0.3.x line), the suite asserts the absence with
 * its reason (corpus-locked-subjects.ts). A pin that starts to fail means the build's
 * limit moved: promote it, do not relax it.
 *
 * FINDING, THE 2016 LINE ON THE EMULATOR'S DEFAULT PART. The Compact PRO 1.0.3.x
 * builds refuse every slot commit with status 0x00040005 / 6 / 7 on the emulator's
 * default SPI-NOR part (EF 40 16, a Winbond W25Q32FV), and commit on a Spansion part
 * (01 02 15, the subjects' `--jedec`). The status is the 2016 image's flash-erase
 * failure, BYTE2(bank address) | 0x40000: 0x14050000 -> 05 (A), 0x14060000 -> 06 (B),
 * 0x14070000 -> 07 (R) (codegen/fn/cmd_CompleteMemoryUpgrade.c, the 2016 variant, the
 * erase-failure return). MEASURED HERE: the same commit lands on a Spansion part and
 * refuses on the default one, with no other change. THE MECHANISM, as FW-V1 measured it
 * on the 1.3.0.8 build (docs/EMULATOR_CORPUS.md sec.35.2): the ROM-style SPI-NOR driver
 * takes a real family routine only for manufacturer byte 0x01 (Spansion), and a Winbond
 * part leaves the device size unset, so spifi_erase refuses before any command. The same
 * driver scan puts the 1.0.3.x application images on a Spansion-only table (sec.35.2),
 * which is why the same failure applies here; this suite did not re-measure the driver
 * on 1.0.3.x itself. The PRO boards' real part is not on record; the bench Compact's
 * measured 01 02 15 is the configuration the preservation suites run them on. The last
 * `describe` reproduces the refusal on the default part and pins its codes.
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR, like every emulator suite (suite.ts).
 * ==================================================================== */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { SeekError } from '../../src/errors.js';
import { silentReporter } from '../../src/events.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { WebUsbTransport } from '../../src/protocol/webusb.js';
import { detectProfile } from '../../src/profiles/registry.js';
import { inspectSlots } from '../../src/slots/inspect.js';
import { flashSlot, prepareSlotFlash } from '../../src/slots/write.js';
import type { SlotKey } from '../../src/slots/types.js';
import { evidenceFromChannelProbe, probeSelectorChannel } from '../../src/workflows/capability.js';
import type { WorkflowContext } from '../../src/workflows/types.js';
import { liveEmulatorCount, RowEmulators } from '../emulator/harness.js';
import {
  announceSkip,
  BOOT_TIMEOUT_MS,
  EMU_DIR,
  scratchFile,
  URB_TIMEOUT_MS,
} from '../emulator/suite.js';
import {
  blankLockedRun,
  FLASH_BASE,
  recordTransport,
  reasonOf,
  runLockedFirmware,
  type LockedRun,
  type Sent,
  type WriteRow,
} from './corpus-locked-run.js';
import {
  bootedIsNamed,
  bootloaderIsRead,
  corpusEntries,
  entryFor,
  LOCKED_SUBJECTS,
  type CorpusEntry,
  isFFImage,
  vendoredBytes,
} from './corpus-locked-subjects.js';

const TIMEOUT_MS = Number(process.env.SEEK_EMU_SLOTS_TIMEOUT_MS ?? '1800000');
const available = EMU_DIR !== null;
if (!available) announceSkip('the slot workflows on every locked-line corpus firmware');

const ENTRIES: readonly CorpusEntry[] = corpusEntries();

/* The 16 Hz FF image as the corpus holds it: prepared for R on every 1.3.0.8 camera below, so the
 * page's verdict on it is checked against the build each camera runs (TESTING.md 42.10). */
const FF_1308_SUBJECT = LOCKED_SUBJECTS.find((s) => s.version === '1.3.0.8' && s.variant === 'ff');
const FF_1308_ENTRY = FF_1308_SUBJECT === undefined ? null : entryFor(FF_1308_SUBJECT, ENTRIES);
const FF_1308_BYTES = FF_1308_ENTRY === null ? null : vendoredBytes(FF_1308_ENTRY);

/* The matrix: every run's record, printed once at the end. A run lists itself only once it
 * has started, so a filtered run prints what it ran. */
const runs: LockedRun[] = [];
const defaultPartLines: string[] = [];

/* ---- the matrix ---------------------------------------------------------- */

function yn(value: boolean | null): string {
  return value === null ? '-' : value ? 'yes' : 'NO';
}

function hex(value: number): string {
  return `0x${value.toString(16).toUpperCase().padStart(8, '0')}`;
}

function writeOf(run: LockedRun, step: string): WriteRow | undefined {
  return run.writes.find((w) => w.step.startsWith(step));
}

/** A write's matrix cell: its commit status, or the refusal or error it stopped at. */
function writeCell(row: WriteRow | undefined): string {
  if (row === undefined) return 'not run';
  if (row.commitStatus === null) {
    const dev = row.deviceCode === null ? '' : ` ${hex(row.deviceCode)}`;
    return `${row.code ?? 'error'}${dev}, ${String(row.requests)} req`;
  }
  const decrypt =
    row.decrypts === null ? 'checked byte for byte' : row.decrypts ? 'reads back' : 'MISMATCH';
  /* The writer's own verdict against the bytes it predicted: a separate fact from the read-back. */
  const verdict = row.verified === null ? '' : `; writer verify ${row.verified ? 'yes' : 'NO'}`;
  return `status ${hex(row.commitStatus)}, ${decrypt}${verdict}`;
}

function dumpCell(run: LockedRun): string {
  return run.dumps.map((d) => `${d.key.toUpperCase()}:${yn(d.identical)}`).join(' ') || '-';
}

/** Whether the image was written into `w`, and read back as the image (or as sent, raw). */
function wrote(w: WriteRow | undefined): boolean {
  return w?.error === null && w.commitStatus === 0 && w.decrypts !== false;
}

/** The camera rejected the FF build's plain stored bytes as a payload, and R was left as the FF write made it. */
function rejectedFFRaw(w: WriteRow | undefined): boolean {
  return w?.code === 'flash/commit' && w.deviceCode === 0x70100 && w.bankAfterError === 'unchanged';
}

/** Every check the suite makes on this firmware passed. */
function passed(run: LockedRun): boolean {
  const s = run.subject;
  if (run.setup !== null || run.inspectError !== null) return false;
  if (run.version !== s.version || run.analysisProfile !== s.profileId) return false;
  if (!run.planSupported || run.planStaging !== s.staging) return false;
  if (run.dumps.length !== 3 || run.dumps.some((d) => d.identical !== true || d.error !== null))
    return false;
  if (run.refusal?.code !== 'slots/refused' || run.refusal.requests !== 0) return false;
  if (run.writes.length !== (isFFImage(s) ? 4 : 3)) return false;
  const [nonBooted, recovery, raw, rejected] = run.writes;
  if (isFFImage(s)) {
    /* A, B and R take it in its vendor form, verified by the writer; its staged payload sent raw does
     * the same; and the plain stored bytes are rejected. */
    if (!wrote(nonBooted) || !wrote(recovery)) return false;
    if (recovery?.verified !== true || recovery.accepts !== true) return false;
    if (raw?.commitStatus !== 0 || raw.verified !== true) return false;
    if (raw.identical !== true || raw.tailErased !== true || raw.decrypts !== true) return false;
    if (!rejectedFFRaw(rejected)) return false;
  } else {
    if (!wrote(nonBooted) || !wrote(recovery)) return false;
    if (raw?.commitStatus !== 0) return false;
    if (
      s.staging === 'plain'
        ? raw.identical !== true || raw.tailErased !== true
        : raw.decrypts !== true
    )
      return false;
  }
  if (!run.cfgReadable) return false;
  if (run.blocks.some((b) => b.cfg !== true)) return false;
  if (
    bootloaderIsRead(s) &&
    (!run.bootloaderReadable || run.blocks.some((b) => b.bootloader !== true))
  )
    return false;
  if (bootedIsNamed(s) && run.booted === null) return false;
  return !run.resetSent && !run.subcmd0Armed;
}

function matrixLine(run: LockedRun): string {
  const s = run.subject;
  const family = run.planFamily ?? '-';
  const booted = run.booted === null ? 'unknown' : run.booted.toUpperCase();
  const refusal =
    run.refusal === null
      ? '-'
      : `${run.refusal.code ?? 'none'}, ${String(run.refusal.requests)} req`;
  const blocks =
    run.blocks.length === 0
      ? 'not read'
      : run.blocks.some((b) => b.cfg === false || b.bootloader === false)
        ? 'CHANGED'
        : `cfg unchanged, ${bootloaderIsRead(s) ? 'bootloader unchanged' : 'no bootloader window'}`;
  const lines = [
    `${s.label.padEnd(38)} ${(run.version ?? '?').padEnd(8)} ${(run.analysisProfile ?? '?').padEnd(12)} ${family.padEnd(14)} ` +
      `booted ${booted.padEnd(7)} dump ${dumpCell(run)}`,
    `${' '.repeat(38)} refuse booted: ${refusal}`,
    `${' '.repeat(38)} ${writeOf(run, 'plain image -> ')?.step ?? 'plain -> non-booted'}: ${writeCell(run.writes[0])}`,
    `${' '.repeat(38)} plain -> R (ack): ${writeCell(writeOf(run, 'plain image -> R'))}`,
    `${' '.repeat(38)} ${run.writes[2]?.step ?? 'raw -> R'}: ${writeCell(run.writes[2])}`,
    ...(run.writes[3] === undefined
      ? []
      : [`${' '.repeat(38)} ${run.writes[3].step}: ${writeCell(run.writes[3])}`]),
    `${' '.repeat(38)} ${blocks}; ${passed(run) ? 'PASS' : 'FAIL'}` +
      (run.setup === null ? '' : ` [setup: ${run.setup}]`) +
      (run.inspectError === null ? '' : ` [inspect: ${run.inspectError}]`),
  ];
  if (run.booted === null && run.bootUnnamedWhy.length > 0) {
    lines.push(`${' '.repeat(38)} booted unknown because: ${run.bootUnnamedWhy.join(' | ')}`);
  }
  for (const note of run.notes) lines.push(`${' '.repeat(38)} note: ${note}`);
  return lines.join('\n');
}

/* ---- the suite ----------------------------------------------------------- */

describe.skipIf(!available)(
  'the slot workflows on every locked-line corpus firmware (emulator)',
  () => {
    afterAll(() => {
      if (runs.length === 0) return;
      const out = [
        '',
        '--- corpus-locked matrix: slot workflows, locked line >= 0.8.0.0 (emulator; Spansion part for the 2016 line) ---',
        `${'firmware'.padEnd(38)} ${'version'.padEnd(8)} ${'profile'.padEnd(12)} ${'family'.padEnd(14)} booted`,
        ...runs.map(matrixLine),
        `${String(runs.filter(passed).length)} of ${String(runs.length)} firmwares pass every check`,
      ];
      process.stderr.write(`${out.join('\n')}\n`);
    });

    for (const subject of LOCKED_SUBJECTS) {
      const entry = available ? entryFor(subject, ENTRIES) : null;
      describe.skipIf(entry === null)(subject.label, () => {
        const run = blankLockedRun(subject, entry?.id ?? '');
        const row = new RowEmulators(entry?.id ?? '');
        /* The 1.3.0.8 16 Hz image: written to R only, in its own staged form, so its tests differ. */
        const ffImage = isFFImage(subject);
        const bootloaderRead = bootloaderIsRead(subject);
        const named = bootedIsNamed(subject);

        beforeAll(async () => {
          if (entry === null) return;
          runs.push(run);
          const truthPath = scratchFile(`corpus-locked_${entry.id.replace(/[^\w.-]+/g, '_')}.bin`);
          try {
            await runLockedFirmware(
              subject,
              entry,
              row,
              truthPath,
              run,
              subject.version === '1.3.0.8' ? FF_1308_BYTES : null,
            );
          } catch (error) {
            run.setup = run.setup ?? reasonOf(error);
          }
        }, TIMEOUT_MS);

        afterAll(async () => {
          await row.finish();
          expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
        });

        it('builds the offline plan: supported, a locked-line family, the staging the page writes with', () => {
          expect(run.planSupported, run.planNotes.join('\n')).toBe(true);
          expect(run.planFamily).toBe(subject.staging === 'plain' ? 'locked-plain' : 'locked-2016');
          expect(run.planStaging).toBe(subject.staging);
        });

        it(`boots ${subject.version} and reads it under ${subject.profileId}`, () => {
          expect(run.setup).toBeNull();
          expect(run.version).toBe(subject.version);
          expect(
            run.analysisProfile,
            `the camera's own probe picked ${String(run.probedProfile)}`,
          ).toBe(subject.profileId);
          expect(run.truthRead, 'the emulator wrote its 4 MiB as-booted image').toBe(true);
        });

        it('inspects the analysis: A, B and R all read', () => {
          expect(run.inspectError).toBeNull();
          expect(run.inspected).toEqual({ a: true, b: true, r: true });
        });

        it('the page shows no "cannot be written" banner wherever the plan allows a write', () => {
          expect(run.analysisProfile, 'the analysis ran').not.toBeNull();
          expect(run.planAllowsWrite, 'the plan says whether a bank takes a write').not.toBeNull();
          if (run.planAllowsWrite === true) {
            expect(run.bannerRefusal, 'the banner the page would show').toBeNull();
          }
        });

        if (subject.staging === 'plain') {
          /* The 2014 plaintext chain stores every bank plain, so there is no key to derive an upload
           * under. The page must not say that no bank can be written (TESTING.md 42.13). */
          it('the write verdict is the page gate alone: no upload key is derived on the chain, so no bank is refused for a key', () => {
            expect(run.analysisProfile, 'the analysis ran').not.toBeNull();
            /* A refusal the page gives is its own reason (the build, the selector, the key table); the key
             * derivation's sentences never appear on this chain. */
            expect(run.writeKeysRefusal ?? '', 'the verdict names a key').not.toMatch(
              /decrypts under|does not carry that key|carries none of the key pairs|checks an upload under|could not be named/,
            );
            if (run.bankWriteRefusals.length === 0) expect(run.writeKeysRefusal).toBeNull();
          });
        }

        if (subject.version === '1.3.0.8') {
          /* The FF image is prepared for R on this camera, and nothing is sent. What the plan expects follows
           * the build the camera runs: the 8 Hz build is expected to refuse it at commit, the FF build takes it
           * (TESTING.md 42.10). Neither is refused here (owner, 2026-10-27: warn, never gate). */
          if (ffImage) {
            it('prepares the FF image for R on the FF build, unrefused, and sends nothing', () => {
              expect(run.ffPrepare, 'the FF image was prepared').not.toBeNull();
              expect(run.ffPrepare?.refused, run.ffPrepare?.message ?? '').toBe(false);
              /* On this emulator donor the camera's answers do not decide the build (the old flow needed the
               * person's word here), so the plan says each build's outcome. */
              expect(run.ffPrepare?.ffCommit).toBe('build-unknown');
              expect(run.ffPrepare?.sent, 'requests sent while preparing').toBe(0);
            });
            it('labels the FF image in R recovery only, and does not call the FF image in A bootable', () => {
              expect(run.bootability?.r).toBe('recovery-only');
              /* A reads 'unknown' on this emulator donor: the plain chain has no key table, and the
               * image's checksum passes acceptance. The label is not changed here (see the report). */
              expect(run.bootability?.a).not.toBe('bootable');
            });
          } else {
            it('plans the FF image for R on the 8 Hz build, warning of the refusal at commit, and sends nothing', () => {
              expect(run.ffPrepare, 'the FF image was prepared').not.toBeNull();
              expect(run.ffPrepare?.refused, run.ffPrepare?.message ?? '').toBe(false);
              expect(run.ffPrepare?.ffCommit).toBe('refuses');
              const text = run.ffPrepare?.warnings.join('\n') ?? '';
              expect(text).toContain('The camera runs the 8 Hz 1.3.0.8 build: the camera answers');
              expect(text).toContain('expected to refuse this write at commit with 0x00070100');
              expect(run.ffPrepare?.sent, 'requests sent while preparing').toBe(0);
            });
          }
        }

        if (named) {
          it('names the booted bank from the active-slot word', () => {
            expect(run.booted, run.bootUnnamedWhy.join(' | ')).not.toBeNull();
          });
        } else {
          const why = ffImage
            ? "the 16 Hz image has word sum 0xFFFF, so no bank is the 2014 chain's plain form and its active-slot replay does not apply"
            : "0.8.0.0's mode 1 is boot-config, so the mode-0 row that arms the upgrade target is not decoded on this build";
          it(`PINNED GAP: the booted bank is not named on this build, so every bank needs acknowledgement (${why})`, () => {
            expect(run.booted, 'the booted bank').toBeNull();
            expect(run.bootUnnamedWhy.length, 'the read gives its reason').toBeGreaterThan(0);
          });
        }

        it('dumps A, B and R byte-identical to the emulator flash, each at its bank address', () => {
          expect(run.dumps.map((d) => d.key)).toEqual(['a', 'b', 'r']);
          for (const d of run.dumps) {
            expect(d.error, `dump ${d.key}`).toBeNull();
            expect(
              d.identical,
              `dump ${d.key.toUpperCase()} at ${hex(d.address)} against the flash`,
            ).toBe(true);
            expect(d.address).toBe(
              FLASH_BASE + (d.key === 'a' ? 0x50000 : d.key === 'b' ? 0x60000 : 0x70000),
            );
          }
        });

        /* What the donor's own banks hold, as the emulator serves them. The 2014 donor keeps B
         * erased (65536 of 65536 bytes, measured on the 1.3.0.0 dump), so only A and R hold the
         * image there; the 2016 donors hold it in all three banks, keystream-stored. */
        if (subject.staging === 'plain' && entry?.kind === 'image-only') {
          it('A and R hold the corpus image as stored; B is erased, as the 2014 donor carries it', () => {
            const byKey = Object.fromEntries(run.dumps.map((d) => [d.key, d]));
            expect(
              byKey.a?.matchesVendored,
              `bank A holds the image (${byKey.a?.matchedAs ?? 'not compared'})`,
            ).toBe(true);
            expect(
              byKey.r?.matchesVendored,
              `bank R holds the image (${byKey.r?.matchedAs ?? 'not compared'})`,
            ).toBe(true);
            expect(byKey.b?.erased, 'bank B is erased on the donor').toBe(true);
          });

          /* An erased bank is a state of its own: the analysis calls it empty (not unread, not
           * foreign), and its dump says so and decrypts nothing. */
          it('names the erased bank B as empty in the analysis and in its dump; A and R are images', () => {
            expect(run.contents).toEqual({ a: 'image', b: 'empty', r: 'image' });
            const byKey = Object.fromEntries(run.dumps.map((d) => [d.key, d]));
            expect(byKey.b?.empty, 'dumpSlot calls the erased bank empty').toBe(true);
            expect(byKey.b?.plainLength, 'nothing is decrypted from it').toBeNull();
            expect(byKey.a?.empty).toBe(false);
            expect(byKey.r?.empty).toBe(false);
          });
        } else if (!ffImage && subject.staging !== 'plain' && entry?.kind === 'image-only') {
          it('each bank holds the corpus image, keystream-stored and decrypted to it', () => {
            for (const d of run.dumps) {
              expect(
                d.matchesVendored,
                `bank ${d.key.toUpperCase()} decrypts to the vendored image (${d.matchedAs ?? 'not compared'})`,
              ).toBe(true);
            }
          });
        } else if (!ffImage && entry?.kind === 'full-dump') {
          it('the native dump holds an image in each bank that decrypts (B erased on the 2014 line)', () => {
            const byKey = Object.fromEntries(run.dumps.map((d) => [d.key, d]));
            if (subject.staging === 'plain') {
              expect(run.contents?.b, 'the analysis calls bank B empty').toBe('empty');
              expect(byKey.b?.empty, 'dumpSlot calls bank B empty').toBe(true);
              expect(byKey.b?.erased, 'bank B is erased').toBe(true);
              expect(byKey.a?.erased, 'bank A holds the image').toBe(false);
              expect(byKey.r?.erased, 'bank R holds the image').toBe(false);
            } else {
              for (const d of run.dumps)
                expect(d.plainLength, `bank ${d.key.toUpperCase()} decrypts`).not.toBeNull();
            }
          });
        }

        it('refuses a write to the booted bank without acknowledgeRisk, and sends nothing', () => {
          expect(run.refusal, 'a refusal was recorded').not.toBeNull();
          expect(run.refusal?.message).not.toBe('the write went through without acknowledgeRisk');
          expect(run.refusal?.code, run.refusal?.message ?? '').toBe('slots/refused');
          expect(run.refusal?.requests, 'requests the camera received for the refused call').toBe(
            0,
          );
          expect(run.refusal?.message, 'the refusal names the acknowledgement').toMatch(
            /acknowledgeRisk/,
          );
        });

        if (ffImage) {
          it('writes the 1.3.0.8-FF image into the non-booted bank in its vendor form: commit status 0, the bank holds the image XOR Key B, the writer verifies it', () => {
            const nb = run.writes[0];
            expect(nb?.error, nb?.notes.join('\n')).toBeNull();
            expect(nb?.commitStatus).toBe(0);
            expect(nb?.identical, 'the stored bytes are the image XOR Key B, not the payload').toBe(
              true,
            );
            expect(nb?.verified, 'the writer compares the stored bytes').toBe(true);
            expect(nb?.accepts, 'the stored image passes the FF app’s Key B gate').toBe(true);
          });

          it('the booted-bank refusal is taken on R, the only bank the FF image goes to: it names the acknowledgement and sends nothing', () => {
            expect(run.refusal?.key).toBe('r');
          });

          it('writes the FF image into recovery R, acknowledged: commit status 0, the bank holds the image XOR Key B, and the writer verifies it', () => {
            const w = writeOf(run, 'plain image -> R');
            expect(w?.error, w?.notes.join('\n')).toBeNull();
            expect(w?.commitStatus).toBe(0);
            expect(w?.requests, 'the payload was staged and committed').toBeGreaterThan(0);
            expect(w?.decrypts, w?.notes.join('\n')).toBe(true);
            /* The stored image passes the app's Key B gate: it can be staged again. */
            expect(w?.accepts).toBe(true);
            expect(w?.verified, 'the writer compares the stored bytes').toBe(true);
          });

          it('sends the staged payload as RAW bytes into R: commit status 0; the bank holds the image XOR Key B, the tail erased, the writer verifies it', () => {
            const w = writeOf(run, 'raw staged');
            expect(w?.error, w?.notes.join('\n')).toBeNull();
            expect(w?.commitStatus).toBe(0);
            expect(w?.identical, 'the stored bytes are the folded image, not the payload').toBe(
              true,
            );
            expect(w?.tailErased, 'bytes past the image are erased').toBe(true);
            expect(w?.decrypts, w?.notes.join('\n')).toBe(true);
            expect(w?.verified).toBe(true);
          });

          /* The raw path is not refused by the page: the camera refuses the payload itself. R's original
           * stored bytes are the plain image, not the two-stream form, so the app's collapsed gate
           * rejects them (0x00070100, the rejected-image status, raised before anything is erased). */
          it("PINNED GAP: the camera rejects recovery's original stored bytes as a raw payload (0x00070100), and R is left as the FF write made it", () => {
            const raw = writeOf(run, 'raw stored bytes');
            expect(raw?.code, raw?.error ?? 'the raw write ran').toBe('flash/commit');
            expect(raw?.deviceCode, raw?.error ?? '').toBe(0x70100);
            expect(raw?.bankAfterError, 'recovery read back after the refusal').toBe('unchanged');
          });
        } else {
          it('flashes the image into the non-booted bank: commit status 0, the read-back decrypts to it', () => {
            const w = run.writes[0];
            expect(w, 'the non-booted write ran').toBeDefined();
            expect(w?.error, w?.notes.join('\n')).toBeNull();
            expect(w?.commitStatus).toBe(0);
            expect(w?.decrypts, w?.notes.join('\n')).toBe(true);
            expect(w?.accepts).toBe(true);
            /* The writer's verdict decrypts the read-back on every line: true wherever it is given. */
            if (w?.verified !== null)
              expect(w?.verified, 'the writer verifies the read-back').toBe(true);
          });

          it('flashes the image into recovery R, acknowledged: commit status 0, the read-back decrypts to it', () => {
            const w = writeOf(run, 'plain image -> R');
            expect(w?.error, w?.notes.join('\n')).toBeNull();
            expect(w?.commitStatus).toBe(0);
            expect(w?.decrypts, w?.notes.join('\n')).toBe(true);
            expect(w?.accepts).toBe(true);
          });

          it('sends a staged payload as RAW bytes into R: commit status 0; reads back as sent (2014) or as the image (2016)', () => {
            const w = writeOf(run, 'raw staged');
            expect(w?.error, w?.notes.join('\n')).toBeNull();
            expect(w?.commitStatus).toBe(0);
            expect(w?.decrypts, w?.notes.join('\n')).toBe(true);
            if (subject.staging === 'plain') {
              expect(w?.identical, 'the 2014 chain stores the payload verbatim').toBe(true);
              expect(w?.tailErased, 'bytes past the payload are erased').toBe(true);
            }
          });
        }

        it('leaves the boot-config block unchanged after every write, byte for byte', () => {
          expect(run.cfgReadable, 'the build exposes the boot-config window').toBe(true);
          expect(run.blocks.length).toBeGreaterThan(0);
          for (const b of run.blocks) expect(b.cfg, `boot-config after ${b.step}`).toBe(true);
        });

        if (bootloaderRead) {
          it('leaves the bootloader unchanged after every write, byte for byte', () => {
            expect(run.bootloaderReadable, 'the build exposes the bootloader window').toBe(true);
            for (const b of run.blocks)
              expect(b.bootloader, `bootloader after ${b.step}`).toBe(true);
          });
        } else {
          it(`PINNED GAP: this build exposes no bootloader window, so the bootloader is not read back (${subject.version === '1.3.0.8' ? 'mode 2 differs between the 8 Hz and 16 Hz builds of 1.3.0.8' : subject.version === '0.8.0.0' ? "0.8.0.0's mode 2 arms the word stored at 0x14000000, not a window" : '1.0.3.x refuses mode 2 outright'})`, () => {
            expect(run.bootloaderReadable).toBe(false);
          });
        }

        it('never sends ResetDevice, and the write path never arms subcommand 0 (the boot-config selector)', () => {
          expect(run.resetSent, 'ResetDevice was sent').toBe(false);
          expect(run.subcmd0Armed, 'BeginFirmwareUpgrade with subcommand 0 on the write path').toBe(
            false,
          );
        });

        it('the emulator delivered every reply it sent (no infrastructure defect)', async () => {
          await row.assertDelivery();
        });
      });
    }
  },
);

/* ---- THE 2016 ROOT CAUSE, REPRODUCED ON THE DEFAULT PART ------------------
 *
 * The Compact PRO 1.0.3.0 chimera on the model's default part (no --jedec, so
 * EF 40 16). A plain image is flashed into a non-booted bank: the commit's erase of
 * that bank fails, and this asserts the exact status the camera reports, not "a
 * failure". The same entry on the Spansion part commits (the suite above).
 */
describe.skipIf(!available)('the 2016 commit on the emulator default part (the known gap)', () => {
  const subject = LOCKED_SUBJECTS.find((s) => s.label === 'Compact PRO 1.0.3.0 (9 Hz, chimera)');
  const entry = subject === undefined ? null : entryFor(subject, ENTRIES);
  const row = new RowEmulators(entry?.id ?? '');
  const seen: {
    probed: string | null;
    booted: SlotKey | null;
    target: SlotKey | null;
    committed: boolean;
    code: string | null;
    deviceCode: number | null;
    error: string | null;
    sentStagingOrCommit: boolean;
  } = {
    probed: null,
    booted: null,
    target: null,
    committed: false,
    code: null,
    deviceCode: null,
    error: null,
    sentStagingOrCommit: false,
  };

  beforeAll(async () => {
    if (subject === undefined || entry === null) return;
    try {
      const truthPath = scratchFile('corpus-locked_default-part.bin');
      /* No --jedec: the model's default part answers, as for any dump with no measured id. */
      const emu = await row.start(EMU_DIR!, {
        entryId: entry.id,
        readyTimeoutMs: BOOT_TIMEOUT_MS,
        flashOut: truthPath,
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
          const probed = detectProfile(evidenceFromChannelProbe(await probeSelectorChannel(device)))
            .best.profile;
          seen.probed = probed.id;
          const ctx: WorkflowContext = {
            device,
            profile: probed,
            detection: null,
            reporter: silentReporter,
          };
          const report = await inspectSlots(ctx);
          seen.booted = report.state.boot?.booted ?? null;
          const target: SlotKey = seen.booted === 'a' ? 'b' : 'a';
          seen.target = target;
          const plan = prepareSlotFlash(report, target, {
            kind: 'plain',
            bytes: vendoredBytes(entry),
            fileName: 'image.bin',
          });
          const mark = sent.length;
          try {
            await flashSlot(ctx, report, plan, { acknowledgeRisk: true });
            seen.committed = true;
          } catch (error) {
            seen.error = reasonOf(error);
            if (error instanceof SeekError) {
              seen.code = error.code;
              seen.deviceCode = error.deviceCode ?? null;
            }
          }
          seen.sentStagingOrCommit = sent.slice(mark).some((s) => s.op === 0x50 || s.op === 0x51);
        } finally {
          await transport.close();
        }
      });
    } catch (error) {
      seen.error = seen.error ?? reasonOf(error);
    }
  }, TIMEOUT_MS);

  afterAll(async () => {
    await row.finish();
    expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
    const outcome = seen.committed
      ? 'committed'
      : `${seen.code ?? 'error'} with device status ${seen.deviceCode === null ? 'none' : hex(seen.deviceCode)}`;
    defaultPartLines.push(
      `Compact PRO 1.0.3.0 (9 Hz, chimera) on the default part EF 40 16: probed ${seen.probed ?? '?'}, ` +
        `booted ${seen.booted ?? 'unknown'}, commit to ${seen.target?.toUpperCase() ?? '?'}: ${outcome}` +
        (seen.error === null ? '' : `\n  page message: ${seen.error}`),
    );
    process.stderr.write(
      `\n--- corpus-locked: the 2016 commit on the default part ---\n${defaultPartLines.join('\n')}\n`,
    );
  });

  it('the commit is refused by the camera with the erase-failure status for the bank (0x40005 A, 0x40006 B)', () => {
    expect(seen.committed, 'the default part must not commit').toBe(false);
    expect(seen.code, seen.error ?? '').toBe('flash/commit');
    /* 0x40000 | BYTE2(0x14050000) = 0x40005 for A; 0x40000 | BYTE2(0x14060000) = 0x40006 for B. */
    const expected = seen.target === 'a' ? 0x40005 : seen.target === 'b' ? 0x40006 : -1;
    expect(seen.deviceCode, `the commit status for bank ${seen.target?.toUpperCase() ?? '?'}`).toBe(
      expected,
    );
    expect(seen.sentStagingOrCommit, 'the data was staged and the commit was sent').toBe(true);
  });
});
