/* ====================================================================
 * The frame-rate patch on the three plain 2014-chain Compacts (stage one), in the emulator:
 * 1.2.0.0, 1.3.0.0 (the native dump) and 1.3.0.8 8 Hz (the chimera on the 2014 donor).
 *
 * FOR EACH FIRMWARE, one boot of the stock flash, then a second boot of the patched flash:
 *   1. the analysis offers the patch on bank A, at the build's top rate (16 Hz; 32 Hz for 1.3.0.8);
 *   2. THE SAVE GATE: a save that does not happen refuses the write, and no SetFeaturedFirmwareData
 *      (0x50) or CompleteMemoryUpgrade (0x51) is sent;
 *   3. the patch: the pre-patch dump is handed to the save FIRST, holding bank A exactly as the
 *      emulator served it; the write commits with status 0; the read-back differs from the pre-patch
 *      bank only at the planned bytes (the edit sites and the adjust word), neither more nor fewer;
 *      ResetDevice is never sent;
 *   4. the patched flash, booted: the camera enumerates on its own build, bank A reads as the patched
 *      image, and the analysis now says the bank is already patched (no second patch is offered).
 *
 * The FRAME RATE itself is not measured here: that is the FW-V1 framerate method
 * (emu/fps_patch_tests.py), which boots the same patched bytes. Nothing here says what a real camera
 * does; the bench run does that.
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR (SEEK_EMU_DIR), like every emulator suite.
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { afterAll, describe, expect, it } from 'vitest';

import { silentReporter } from '../../src/events.js';
import { FPS_OFFER_WITHHELD } from '../../src/preservation/fps-patch.js';
import { detectProfile } from '../../src/profiles/registry.js';
import type { FirmwareProfile } from '../../src/profiles/types.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { WebUsbTransport } from '../../src/protocol/webusb.js';
import { inspectSlots } from '../../src/slots/inspect.js';
import {
  fpsPlanOfBank,
  patchBankFps,
  type FpsPatchResult,
  type FpsPreDump,
} from '../../src/slots/fps-patch.js';
import type { SlotsReport } from '../../src/slots/types.js';
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
if (!available) announceSkip('the frame-rate patch on the plain 2014-chain Compacts');

const ENTRIES: readonly CorpusEntry[] = corpusEntries();
const FLASH_BASE = 0x14000000;
const FLASH_BYTES = 4 * 1024 * 1024;
const BANK_BYTES = 0x10000;
const OP_SET_FEATURED_FIRMWARE_DATA = 0x50;
const OP_COMPLETE_MEMORY_UPGRADE = 0x51;
const OP_RESET_DEVICE = 0x59;

const sha = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

/** The stage-one subjects, by the label the locked-line suite gives them. */
const STAGE_ONE: readonly { readonly label: string; readonly top: number }[] = [
  { label: 'Compact 1.2.0.0', top: 16 },
  { label: 'Compact 1.3.0.0 (native dump)', top: 16 },
  { label: 'Compact 1.3.0.8 (8 Hz)', top: 32 },
];

function subjectNamed(label: string): LockedSubject {
  const subject = LOCKED_SUBJECTS.find((candidate) => candidate.label === label);
  if (subject === undefined) throw new Error(`no locked subject ${label}`);
  return subject;
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

for (const { label, top } of STAGE_ONE) {
  const subject = subjectNamed(label);
  const entry = available ? entryFor(subject, ENTRIES) : null;
  /* Skipped while the offer is withheld: the flow below needs the planner to offer the patch (TESTING.md 42.14). */
  describe.skipIf(entry === null || FPS_OFFER_WITHHELD)(
    `the frame-rate patch on ${label} (emulator)`,
    () => {
      const row = new RowEmulators(entry?.id ?? '');
      const bootRow = new RowEmulators(`${entry?.id ?? ''}#patched`);

      afterAll(async () => {
        await row.finish();
        await bootRow.finish();
        expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
      });

      it(
        `offers ${String(top)} Hz on bank A, refuses an unsaved patch, patches A, reads it back, and boots the patched flash`,
        async () => {
          if (entry === null) return;
          const truthPath = scratchFile(
            `fps-patch_${entry.id.replace(/[^\w.-]+/g, '_')}_stock.bin`,
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

            /* 1. the offer, from bank A's own image */
            const offer = fpsPlanOfBank(report, 'a');
            expect(
              offer.status,
              `${label}: ${offer.status === 'refused' ? offer.reason : ''}`,
            ).toBe('offer');
            if (offer.status !== 'offer') return;
            expect(offer.toHz).toBe(top);

            /* 2. the save gate: nothing is written when the dump is not saved */
            const beforeGate = sent.length;
            await expect(
              patchBankFps(ctx, report, 'a', {
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
            const result: FpsPatchResult = await patchBankFps(ctx, report, 'a', {
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
            expect(result.toHz).toBe(top);
            expect(result.written.commitStatus, 'commit status').toBe(0);
            expect(result.written.verified).toBe(true);
            expect(result.readBack.checked).toBe(true);
            expect(result.readBack.ok, JSON.stringify(result.readBack)).toBe(true);
            expect(result.readBack.differing).toEqual(result.changed);
            const writeOps = opsAfter(sent, beforePatch);
            expect(writeOps).toContain(OP_SET_FEATURED_FIRMWARE_DATA);
            expect(writeOps).toContain(OP_COMPLETE_MEMORY_UPGRADE);
            expect(writeOps).not.toContain(OP_RESET_DEVICE);

            /* 4. the patched flash, booted on its own */
            const after = result.written.after;
            expect(after, 'the read-back was taken').not.toBeNull();
            if (after === null) return;
            const patchedPath = scratchFile(
              `fps-patch_${entry.id.replace(/[^\w.-]+/g, '_')}_patched.bin`,
            );
            writeFileSync(patchedPath, partWithBankA(truth, bankA.entry.address, after));
            await emu.stop();
            const bootEmu = await bootRow.start(String(EMU_DIR), {
              entryId: `${entry.id}#patched`,
              readyTimeoutMs: BOOT_TIMEOUT_MS,
              flashOut: scratchFile(`fps-patch_${entry.id.replace(/[^\w.-]+/g, '_')}_booted.bin`),
              flashOverride: patchedPath,
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
                expect(sha(plain)).toBe(sha(after.subarray(0, plain.length)));
              }
              const again = fpsPlanOfBank(bootReport, 'a');
              expect(again.status, 'the patched bank is recognised as already patched').toBe(
                'patched',
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
