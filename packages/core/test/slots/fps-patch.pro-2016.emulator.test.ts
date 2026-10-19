/* ====================================================================
 * The frame-rate patch on the Compact PRO 2016 keystream line, in the emulator: the 1.0.3.0 9 Hz native
 * dump, and the 1.0.3.0 and 1.0.3.2 9 Hz images as chimeras on their donors. Bank A of each holds the table's
 * stock image (checked below from the decrypted bank, not assumed). The FF builds already run at 18 Hz and
 * are not subjects here.
 *
 * FOR EACH SUBJECT, one boot of the stock flash, then one boot of the patched flash:
 *   1. the bank's decrypted image is the table's stock image of the subject's entry; the offer is still refused
 *      by the stage gate (the planner names the 2016 keystream reason). This file proves the write path with the
 *      offer closed: the write is `writeFpsPatch`, which takes the table's entry for the bank;
 *   2. THE SAVE GATE: a save that does not happen refuses the write, and no SetFeaturedFirmwareData (0x50) or
 *      CompleteMemoryUpgrade (0x51) is sent;
 *   3. the patch: the pre-patch dump is handed to the save FIRST, holding bank A exactly as the emulator served
 *      it; the write is staged under the image's own stage key (slot-keystream-ciphertext), commits with status 0,
 *      and the writer's own read-back verifies; the read-back, decrypted, differs from the stock image only at
 *      the planned bytes; ResetDevice is never sent;
 *   4. the patched flash, booted on its own: the camera enumerates on its build, bank A decrypts to the patched
 *      image, and the analysis says the bank is already patched.
 *
 * THE FRAME RATE is not measured here (the bench does that, TESTING.md 42.27 and the bench matrix).
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR (SEEK_EMU_DIR), like every emulator suite.
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { afterAll, describe, expect, it } from 'vitest';

import { silentReporter } from '../../src/events.js';
import { FPS_PATCHES, identifyFpsImage, type FpsPatch } from '../../src/preservation/fps-patch.js';
import { detectProfile } from '../../src/profiles/registry.js';
import type { FirmwareProfile } from '../../src/profiles/types.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { WebUsbTransport } from '../../src/protocol/webusb.js';
import { dumpSlot } from '../../src/slots/dump.js';
import { inspectSlots } from '../../src/slots/inspect.js';
import {
  fpsPlanOfBank,
  writeFpsPatch,
  type FpsPatchResult,
  type FpsPreDump,
} from '../../src/slots/fps-patch.js';
import type { DumpedSlot, SlotsReport } from '../../src/slots/types.js';
import {
  evidenceFromChannelProbe,
  probeSelectorChannel,
  readRunningFirmware,
} from '../../src/workflows/capability.js';
import type { WorkflowContext } from '../../src/workflows/types.js';
import { liveEmulatorCount, RowEmulators } from '../emulator/harness.js';
import {
  announceSkip,
  BOOT_TIMEOUT_MS,
  EMU_DIR,
  scratchFile,
  URB_TIMEOUT_MS,
} from '../emulator/suite.js';
import { recordTransport, type Sent } from './corpus-locked-run.js';
import {
  corpusEntries,
  entryFor,
  LOCKED_SUBJECTS,
  type CorpusEntry,
  type LockedSubject,
} from './corpus-locked-subjects.js';

const TIMEOUT_MS = Number(process.env.SEEK_EMU_SLOTS_TIMEOUT_MS ?? '1800000');
const available = EMU_DIR !== null;
if (!available) announceSkip('the frame-rate patch on the Compact PRO 2016 keystream line');

const ENTRIES: readonly CorpusEntry[] = corpusEntries();
const FLASH_BASE = 0x14000000;
const FLASH_BYTES = 4 * 1024 * 1024;
const BANK_BYTES = 0x10000;
const OP_SET_FEATURED_FIRMWARE_DATA = 0x50;
const OP_COMPLETE_MEMORY_UPGRADE = 0x51;
const OP_RESET_DEVICE = 0x59;

const sha = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

/** The 9 Hz 2016-line subjects, and the table entry whose stock image each bank A must hold. */
const PRO_2016: readonly { readonly label: string; readonly table: string }[] = [
  { label: 'Compact PRO 1.0.3.0 (9 Hz, native dump)', table: 'compact_pro-1.0.3.0' },
  { label: 'Compact PRO 1.0.3.0 (9 Hz, chimera)', table: 'compact_pro-1.0.3.0' },
  { label: 'Compact PRO 1.0.3.2 (9 Hz, chimera)', table: 'compact_pro-1.0.3.2' },
];

function subjectNamed(label: string): LockedSubject {
  const subject = LOCKED_SUBJECTS.find((candidate) => candidate.label === label);
  if (subject === undefined) throw new Error(`no locked subject ${label}`);
  return subject;
}

function tableEntry(id: string): FpsPatch {
  const patch = FPS_PATCHES.find((candidate) => candidate.id === id);
  if (patch === undefined) throw new Error(`the table has no ${id} entry`);
  return patch;
}

/** A 4 MiB part with bank A replaced by `bank`: the flash the patched camera boots. */
function partWithBankA(truth: Uint8Array, bankAddress: number, bank: Uint8Array): Uint8Array {
  const part = truth.slice();
  part.set(bank.subarray(0, BANK_BYTES), bankAddress - FLASH_BASE);
  return part;
}

function workflowOf(device: SeekDevice, profile: FirmwareProfile): WorkflowContext {
  return { device, profile, detection: null, reporter: silentReporter };
}

function opsAfter(sent: readonly Sent[], from: number): number[] {
  return sent.slice(from).map((entry) => entry.op);
}

/** One line per fact the run measured, for the record of the run. */
function diagnose(name: string, text: string): void {
  if (process.env.SEEK_EMU_FPS_DIAG === '0') return;
  process.stdout.write(`[fps-2016] ${name}: ${text}\n`);
}

for (const { label, table } of PRO_2016) {
  const subject = subjectNamed(label);
  const entry = available ? entryFor(subject, ENTRIES) : null;
  describe.skipIf(entry === null)(
    `the frame-rate patch on ${label} (2016 keystream, emulator)`,
    () => {
      const row = new RowEmulators(entry?.id ?? '');
      const bootRow = new RowEmulators(`${entry?.id ?? ''}#patched`);

      afterAll(async () => {
        await row.finish();
        await bootRow.finish();
        expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
      });

      it(
        'holds the stock image, refuses an unsaved patch, patches bank A under the 2016 stage key, reads it back decrypted, and boots the patched flash',
        async () => {
          if (entry === null) return;
          const patch = tableEntry(table);
          const truthPath = scratchFile(
            `fps-patch-2016_${entry.id.replace(/[^\w.-]+/g, '_')}_stock.bin`,
          );
          const emu = await row.start(String(EMU_DIR), {
            entryId: entry.id,
            readyTimeoutMs: BOOT_TIMEOUT_MS,
            flashOut: truthPath,
            ...(subject.jedec === null ? {} : { jedec: subject.jedec }),
            ...(subject.donor === undefined ? {} : { donor: subject.donor }),
          });
          const truth = new Uint8Array(readFileSync(truthPath));
          expect(truth.length).toBe(FLASH_BYTES);

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
            const probe = await probeSelectorChannel(device);
            const profile = detectProfile(evidenceFromChannelProbe(probe)).best.profile;
            const firmware = await readRunningFirmware(device);
            expect(firmware.version).toBe(subject.version);
            const ctx = workflowOf(device, profile);
            const report: SlotsReport = await inspectSlots(ctx);
            const bankA = report.slots.find((view) => view.entry.key === 'a');
            expect(bankA, 'bank A is in the plan').toBeDefined();
            if (bankA === undefined) return;
            const bankOffset = bankA.entry.address - FLASH_BASE;
            const stockBankA = truth.subarray(bankOffset, bankOffset + BANK_BYTES);

            /* 1. bank A's own image is the table's stock image; the offer is still closed by the stage gate */
            const dumpedA: DumpedSlot = await dumpSlot(ctx, report, 'a');
            expect(dumpedA.plain, `${label}: bank A decrypts to an image`).not.toBeNull();
            if (dumpedA.plain === null) return;
            expect(sha(dumpedA.plain), `${label}: bank A holds the table's stock image`).toBe(
              patch.stockSha256,
            );
            expect(identifyFpsImage(dumpedA.plain).stockEntries.map((hit) => hit.id)).toEqual([
              table,
            ]);
            const offer = fpsPlanOfBank(report, 'a');
            expect(offer.status, `${label}: the stage gate is closed`).toBe('refused');
            if (offer.status === 'refused') expect(offer.reason).toMatch(/2016 keystream/);

            /* 2. the save gate: nothing is written when the dump is not saved */
            const beforeGate = sent.length;
            await expect(
              writeFpsPatch(ctx, report, 'a', dumpedA, patch, {
                acknowledgeRisk: true,
                saveDump: () => Promise.resolve(false),
              }),
            ).rejects.toThrow(/was not saved/);
            const gateOps = opsAfter(sent, beforeGate);
            expect(gateOps).not.toContain(OP_SET_FEATURED_FIRMWARE_DATA);
            expect(gateOps).not.toContain(OP_COMPLETE_MEMORY_UPGRADE);

            /* 3. the patch, with the pre-patch save first */
            const saved: FpsPreDump[] = [];
            const beforePatch = sent.length;
            const result: FpsPatchResult = await writeFpsPatch(ctx, report, 'a', dumpedA, patch, {
              acknowledgeRisk: true,
              saveDump: (dump) => {
                saved.push(dump);
                return Promise.resolve(true);
              },
            });
            expect(saved).toHaveLength(1);
            const pre = saved[0];
            if (pre === undefined) return;
            expect(pre.key).toBe('a');
            expect(pre.version).toBe(subject.version);
            expect(pre.raw).toEqual(stockBankA);
            expect(pre.rawName).toMatch(
              new RegExp(
                `^seek-slot-A-v${subject.version.replace(/\./g, '\\.')}-before-fps-patch-raw-`,
              ),
            );
            expect(pre.plainName).toMatch(/-decrypted-/);
            expect(result.plan.staging, 'the write is staged under the 2016 stage key').toBe(
              'slot-keystream-ciphertext',
            );
            expect(result.toHz).toBe(18);
            expect(result.written.commitStatus, 'commit status').toBe(0);
            expect(result.written.verified).toBe(true);
            expect(result.readBack.checked).toBe(true);
            expect(result.readBack.ok, JSON.stringify(result.readBack)).toBe(true);
            expect(result.readBack.differing).toEqual(result.changed);
            expect(result.readBack.missing).toEqual([]);
            expect(result.readBack.unexpected).toEqual([]);
            /* the image the patch programmed: the stock image with the planned bytes, and nothing else */
            const differs: number[] = [];
            for (let o = 0; o < dumpedA.plain.length; o++) {
              if (dumpedA.plain[o] !== result.patched[o]) differs.push(o);
            }
            expect(differs).toEqual(result.changed);
            const writeOps = opsAfter(sent, beforePatch);
            expect(writeOps).toContain(OP_SET_FEATURED_FIRMWARE_DATA);
            expect(writeOps).toContain(OP_COMPLETE_MEMORY_UPGRADE);
            expect(writeOps).not.toContain(OP_RESET_DEVICE);
            diagnose(
              label,
              `staging ${result.plan.staging}; commit ${String(result.written.commitStatus)}; ` +
                `read-back ${String(result.readBack.differing.length)} differing byte(s) at ` +
                result.readBack.differing.map((o) => `0x${o.toString(16)}`).join(', '),
            );

            /* 4. the patched flash, booted on its own */
            const after = result.written.after;
            expect(after, 'the read-back was taken').not.toBeNull();
            if (after === null) return;
            const patchedPath = scratchFile(
              `fps-patch-2016_${entry.id.replace(/[^\w.-]+/g, '_')}_patched.bin`,
            );
            writeFileSync(patchedPath, partWithBankA(truth, bankA.entry.address, after));
            await emu.stop();
            const bootEmu = await bootRow.start(String(EMU_DIR), {
              entryId: `${entry.id}#patched`,
              readyTimeoutMs: BOOT_TIMEOUT_MS,
              flashOut: scratchFile(
                `fps-patch-2016_${entry.id.replace(/[^\w.-]+/g, '_')}_booted.bin`,
              ),
              flashOverride: patchedPath,
              ...(subject.jedec === null ? {} : { jedec: subject.jedec }),
              ...(subject.donor === undefined ? {} : { donor: subject.donor }),
            });
            const bootAdapter = await bootEmu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
            const bootTransport = new WebUsbTransport(bootAdapter, {
              recipient: 'auto',
              api: 'usbip (emulator)',
              host: 'vitest',
              clock: bootAdapter.deadlineClock,
            });
            await bootTransport.open();
            try {
              const bootDevice = new SeekDevice(bootTransport, { reporter: silentReporter });
              const bootFirmware = await readRunningFirmware(bootDevice);
              expect(bootFirmware.version, 'the patched camera enumerates on its own build').toBe(
                subject.version,
              );
              const bootProbe = await probeSelectorChannel(bootDevice);
              const bootProfile = detectProfile(evidenceFromChannelProbe(bootProbe)).best.profile;
              const bootReport = await inspectSlots(workflowOf(bootDevice, bootProfile));
              const bootA = bootReport.slots.find((view) => view.entry.key === 'a');
              const plain = bootA?.state?.plain ?? null;
              expect(plain, 'bank A decrypts to an image after the patch').not.toBeNull();
              if (plain !== null) {
                /* the booted bank decrypts to the patched image the write programmed */
                expect(sha(plain)).toBe(sha(result.patched));
              }
              const again = fpsPlanOfBank(bootReport, 'a');
              expect(again.status, 'the patched bank is recognised as already patched').toBe(
                'patched',
              );
              diagnose(
                label,
                `patched flash boots ${bootFirmware.version ?? '(no version)'}; bank A ${again.status}`,
              );
            } finally {
              await bootTransport.close();
            }
          } finally {
            await transport.close();
          }
        },
        TIMEOUT_MS,
      );
    },
  );
}
