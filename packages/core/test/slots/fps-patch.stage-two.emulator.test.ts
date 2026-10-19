/* ====================================================================
 * The frame-rate patch on the 4.x line (stage two), in the emulator: the 4.8.1.9 image (the image
 * on its 4.8.2.1 donor bootloader, as corpus-modern-run runs it), and the Compact PRO 4.9.x full
 * dumps (booted as they are, no donor; 18 Hz). The bank is staged under the camera's Key A and
 * stored under the bank's own key, so the read-back is checked on the image it DECRYPTS to, not on
 * the stored bytes.
 *
 * ONE BOOT OF THE STOCK FLASH, THEN ONE BOOT OF THE PATCHED FLASH:
 *   1. the analysis offers the patch on bank A, at the table's top rate for the build;
 *   2. THE SAVE GATE: a save that does not happen refuses the write, and no SetFeaturedFirmwareData
 *      (0x50) or CompleteMemoryUpgrade (0x51) is sent;
 *   3. the patch: the pre-patch dump is handed to the save FIRST, holding bank A exactly as the emulator
 *      served it; the write commits with status 0 and the writer's own read-back decrypts to the patched
 *      image; the decrypted read-back differs from the stock image only at the planned bytes; ResetDevice
 *      is never sent;
 *   4. the patched flash, booted on its own: the camera enumerates on its build, bank A decrypts to the
 *      patched image, and the analysis says the bank is already patched.
 *
 * THE FRAME RATE is not measured here (the bench does that, TESTING.md 42.22).
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
  ENTRIES,
  FILL_SCOPE,
  FILL_SEED,
  scratchFile,
  URB_TIMEOUT_MS,
} from '../emulator/suite.js';
import { recordTransport, type Sent } from './corpus-locked-run.js';
import {
  CHIMERA_JEDEC,
  MODERN_SUBJECTS,
  entryFor,
  type ModernSubject,
} from './corpus-modern-run.js';

const TIMEOUT_MS = Number(process.env.SEEK_EMU_SLOTS_TIMEOUT_MS ?? '1800000');
const available = EMU_DIR !== null;
if (!available) announceSkip('the frame-rate patch on the 4.x Compact line (stage two)');

const FLASH_BASE = 0x14000000;
const FLASH_BYTES = 4 * 1024 * 1024;
const BANK_BYTES = 0x10000;
const OP_SET_FEATURED_FIRMWARE_DATA = 0x50;
const OP_COMPLETE_MEMORY_UPGRADE = 0x51;
const OP_RESET_DEVICE = 0x59;

const sha = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

/**
 * The stage-two subjects: the 4.8.1.x Compact builds (32 Hz) and the Compact PRO 4.9.x builds (18 Hz), with
 * the table's top rate the page offers for each.
 */
const STAGE_TWO: readonly { readonly label: string; readonly top: number }[] = [
  { label: 'Compact 4.8.1.7 image (on 4.8.2.1)', top: 32 },
  { label: 'Compact 4.8.1.9 image (on 4.8.2.1)', top: 32 },
  { label: 'Compact PRO 4.9.1.15 dump', top: 18 },
  { label: 'Compact PRO 4.9.2.0 dump (1215A0YZ9AA8)', top: 18 },
];

function modernSubjectNamed(label: string): ModernSubject {
  const subject = MODERN_SUBJECTS.find((candidate) => candidate.label === label);
  if (subject === undefined) throw new Error(`no modern subject ${label}`);
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

for (const { label, top } of STAGE_TWO) {
  const subject = modernSubjectNamed(label);
  const entry = available ? entryFor(subject, ENTRIES) : null;
  /* An image-only entry boots as a chimera on its donor's bootloader; a full dump boots as it is. */
  const donorId = entry?.kind === 'image-only' ? (entry.donor?.id ?? null) : null;
  /* Skipped while the offer is withheld: the flow below needs the planner to offer the patch. */
  describe.skipIf(
    entry === null || (entry.kind === 'image-only' && donorId === null) || FPS_OFFER_WITHHELD,
  )(`the frame-rate patch on ${label} (stage two, emulator)`, () => {
    const row = new RowEmulators(entry?.id ?? '');
    const bootRow = new RowEmulators(`${entry?.id ?? ''}#patched`);

    afterAll(async () => {
      await row.finish();
      await bootRow.finish();
      expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
    });

    it(
      `offers ${String(top)} Hz on bank A, refuses an unsaved patch, patches A under Key A, reads it back decrypted, and boots the patched flash`,
      async () => {
        if (entry === null) return;
        const truthPath = scratchFile(
          `fps-patch-s2_${entry.id.replace(/[^\w.-]+/g, '_')}_stock.bin`,
        );
        const emu = await row.start(String(EMU_DIR), {
          entryId: entry.id,
          fillSeed: FILL_SEED,
          fillScope: FILL_SCOPE,
          readyTimeoutMs: BOOT_TIMEOUT_MS,
          flashOut: truthPath,
          ...(donorId === null ? {} : { donor: donorId, jedec: CHIMERA_JEDEC }),
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
          expect(offer.status, `${label}: ${offer.status === 'refused' ? offer.reason : ''}`).toBe(
            'offer',
          );
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
          expect(result.plan.staging, 'the write is staged under Key A').toBe('key-a-ciphertext');
          expect(result.toHz).toBe(top);
          expect(result.written.commitStatus, 'commit status').toBe(0);
          expect(result.written.verified).toBe(true);
          expect(result.readBack.checked).toBe(true);
          expect(result.readBack.ok, JSON.stringify(result.readBack)).toBe(true);
          expect(result.readBack.differing).toEqual(result.changed);
          /* the image the patch programmed: the stock image with the planned bytes, and nothing else */
          const stockPlain = pre.plain;
          const differs: number[] = [];
          for (let o = 0; o < stockPlain.length; o++) {
            if (stockPlain[o] !== result.patched[o]) differs.push(o);
          }
          expect(differs).toEqual(result.changed);
          const writeOps = opsAfter(sent, beforePatch);
          expect(writeOps).toContain(OP_SET_FEATURED_FIRMWARE_DATA);
          expect(writeOps).toContain(OP_COMPLETE_MEMORY_UPGRADE);
          expect(writeOps).not.toContain(OP_RESET_DEVICE);

          /* 4. the patched flash, booted on its own */
          const after = result.written.after;
          expect(after, 'the read-back was taken').not.toBeNull();
          if (after === null) return;
          const patchedPath = scratchFile(
            `fps-patch-s2_${entry.id.replace(/[^\w.-]+/g, '_')}_patched.bin`,
          );
          writeFileSync(patchedPath, partWithBankA(truth, bankA.entry.address, after));
          await emu.stop();
          const bootEmu = await bootRow.start(String(EMU_DIR), {
            entryId: `${entry.id}#patched`,
            fillSeed: FILL_SEED,
            fillScope: FILL_SCOPE,
            readyTimeoutMs: BOOT_TIMEOUT_MS,
            flashOut: scratchFile(`fps-patch-s2_${entry.id.replace(/[^\w.-]+/g, '_')}_booted.bin`),
            flashOverride: patchedPath,
            ...(donorId === null ? {} : { donor: donorId, jedec: CHIMERA_JEDEC }),
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
          } finally {
            await bootTransport.close();
          }
        } finally {
          await transport.close();
        }
      },
      TIMEOUT_MS,
    );
  });
}
