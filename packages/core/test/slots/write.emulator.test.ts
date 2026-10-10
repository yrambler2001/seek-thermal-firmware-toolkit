/* ==================================================================== *
 * The slot writer on the emulated camera, one boot per firmware.
 *
 * FOR EACH FIRMWARE the suite boots the emulator, reads the device info with
 * the profile that build reads under, and then runs four checks in order:
 *
 *   (3) a write to the booted bank with acknowledgeRisk left off is refused,
 *       and no request at all went to the camera;
 *   (1) bank B is rewritten with its OWN decrypted plaintext, and the bank
 *       read back decrypts to that same image and is accepted (for the Key A
 *       line, the bootloader keys it, too);
 *   (2) the raw bytes of bank A are written verbatim to recovery R, and R
 *       reads back identical;
 *   (4) the boot configuration block (0x14010000) and the bootloader block
 *       (0x14000000) read back byte for byte as they were, after each write.
 *
 * The four checks are separate `it`s. A check that could not run (a failed
 * step, a block the build does not expose) fails its own `it` with the reason.
 * Nothing here runs against a real camera: the emulator only.
 * ==================================================================== */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { equalBytes, viewOf } from '../../src/bytes.js';
import { wordSum32 } from '../../src/image/bank.js';
import { SeekError } from '../../src/errors.js';
import { silentReporter } from '../../src/events.js';
import { decryptImage } from '../../src/crypto/cipher.js';
import { recoverKeyInfo } from '../../src/crypto/recover.js';
import { identifyKey, keyFilenameSuffix } from '../../src/crypto/keys.js';
import { getProfile } from '../../src/profiles/registry.js';
import type { FirmwareProfile } from '../../src/profiles/types.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { WebUsbTransport } from '../../src/protocol/webusb.js';
import { readDeviceInfo } from '../../src/workflows/device-info.js';
import { commitToBank } from '../../src/preservation/pipeline.js';
import type { DeviceState, WorkflowContext } from '../../src/workflows/types.js';
import { flashSlot, prepareSlotFlash } from '../../src/slots/write.js';
import type { FlashSlotResult, SlotFlashPlan, SlotKey, SlotsReport, StagingForm } from '../../src/slots/types.js';
import { liveEmulatorCount, RowEmulators } from '../emulator/harness.js';
import {
  announceSkip,
  BOOT_TIMEOUT_MS,
  EMU_DIR,
  ENTRIES,
  URB_TIMEOUT_MS,
} from '../emulator/suite.js';
import { reportFor, windowAt } from './write-fixtures.js';
import { buildSlotPlan } from '../../src/slots/capability.js';

const TIMEOUT_MS = Number(process.env.SEEK_EMU_SLOTS_TIMEOUT_MS ?? '1800000');

/** The FW-V1 emulator's JEDEC id for the chimeras (the same id the preservation suites boot with). */
const JEDEC = '010215';

/** Boot-config block and bootloader block, read through the build's own windows. */
const CFG_ADDRESS = 0x14010000;
const BOOTLOADER_ADDRESS = 0x14000000;

const modern = getProfile('modern-4x');
const legacy = getProfile('legacy-auth');
const compact2016 = getProfile('compact-2016');

interface Subject {
  readonly label: string;
  readonly entryId: string;
  /** The corpus entry an image-only firmware boots on (the manifest's own donor). */
  readonly donor?: string;
  readonly profile: FirmwareProfile;
  readonly staging: StagingForm;
  readonly version: string;
}

const SUBJECTS: readonly Subject[] = [
  {
    label: 'Compact 4.8.1.9 (image-only, on the 4.8.2.1 ciphertext donor)',
    entryId:
      'compact/2018.10.11-16.36.37-4.8.1.9/no-serial/32k_43x0_8hz_4.8.1.9_compact_oct_11_2018_16-36-37_99.28_yrambler2001_firmware',
    donor: 'compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/dump',
    profile: modern,
    staging: 'key-a-ciphertext',
    version: '4.8.1.9',
  },
  {
    label: 'Compact PRO 4.9.2.0',
    entryId: 'compact_pro/2020.02.13-15.26.01-4.9.2.0/1215A0YZ9AA8/dump',
    profile: modern,
    staging: 'key-a-ciphertext',
    version: '4.9.2.0',
  },
  {
    label: 'Compact PRO 1.0.3.0 (the 2016 keystream line)',
    entryId: 'compact_pro/2016.07.06-17.04.49-1.0.3.0/0C21A1M5KP15/dump',
    profile: compact2016,
    staging: 'slot-keystream-ciphertext',
    version: '1.0.3.0',
  },
  {
    label: 'Compact 1.3.0.0 (the 2014 plaintext chain)',
    entryId: 'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump',
    profile: legacy,
    staging: 'plain',
    version: '1.3.0.0',
  },
  {
    label: 'Compact 1.3.0.8 (image-only, on the 2014 plaintext donor)',
    entryId:
      'compact/2017.01.06-11.16.17-1.3.0.8/no-serial/32k_43x0_1.3.0.8_compact-insecure-8hz_public_-_compact_jan_6_2017_11-16-17_99.28_gabiz_ro_firmware',
    donor: 'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump',
    profile: legacy,
    staging: 'plain',
    version: '1.3.0.8',
  },
  {
    label: 'Compact XR 4.8.2.1',
    entryId: 'compact_xr/2020.02.26-11.23.26-4.8.2.1/1F1660P7U967/dump',
    profile: modern,
    staging: 'key-a-ciphertext',
    version: '4.8.2.1',
  },
  {
    label: 'Nano 300 44.27.3.10',
    entryId: 'nano_300/2024.11.21-11.55.00-44.27.3.10/1713A171RJB9/dump',
    profile: modern,
    staging: 'key-a-ciphertext',
    version: '44.27.3.10',
  },
];

const available = EMU_DIR !== null;
if (!available) announceSkip('the slot writer on the emulated cameras');

/** What one firmware's run recorded, step by step. Each `it` reads its own part. */
interface Run {
  version: string | null;
  /** The staging form the capability plan names for bank B on this build. */
  staging: string | null;
  /** (3): the refused write. */
  refusal: { code: string | null; message: string | null; requestsSent: number[]; error: string | null };
  /** (1): bank B from its own plaintext. */
  bWrite: {
    error: string | null;
    booted: SlotKey | null;
    /** The bank the image was taken from: B, or A where B holds no image. */
    source: SlotKey | null;
    /** The read-back decrypts to the image the bank held before (under the key it now carries). */
    decryptsToSameImage: boolean | null;
    accepts: boolean | null;
    /** For the Key A line: the bootloader identifies the key the bank now carries. */
    bootable: boolean | null;
    /** After a failed commit: the bank's bytes as read afterwards. */
    afterError: string | null;
    /** The read-back equals the bank's previous bytes. Recorded, not required. */
    byteRoundTrip: boolean | null;
    verified: boolean | null;
    notes: string[];
  };
  /** (2): raw A into R. */
  rWrite: {
    error: string | null;
    /** The first bytes of the bank equal the raw bytes sent. */
    identical: boolean | null;
    /** Length of the raw bytes sent, and what the bank holds past them. */
    sentLength: number | null;
    tailErased: boolean | null;
    tailNonErased: number | null;
    firstDiff: number | null;
    afterError: string | null;
    /** The read-back decrypts to bank A's image (under the key it now carries). */
    decryptsToSameImage: boolean | null;
    verified: boolean | null;
    notes: string[];
  };
  /** (4): the boot-config and bootloader blocks, before and after each write. */
  blocks: {
    cfgReadable: boolean;
    bootloaderReadable: boolean;
    afterB: { cfg: boolean | null; bootloader: boolean | null };
    afterR: { cfg: boolean | null; bootloader: boolean | null };
    afterBooted: { cfg: boolean | null; bootloader: boolean | null };
  };
  /** (5): the booted bank rewritten with acknowledgeRisk; `key` is null when check (1) covers it. */
  bootedWrite: {
    key: SlotKey | null;
    error: string | null;
    afterError: string | null;
    decryptsToSameImage: boolean | null;
    accepts: boolean | null;
    verified: boolean | null;
    notes: string[];
  };
  resetSent: boolean;
  setup: string | null;
}

function blankRun(): Run {
  return {
    version: null,
    staging: null,
    refusal: { code: null, message: null, requestsSent: [], error: null },
    bWrite: {
      error: null,
      booted: null,
      source: null,
      decryptsToSameImage: null,
      accepts: null,
      bootable: null,
      byteRoundTrip: null,
      afterError: null,
      verified: null,
      notes: [],
    },
    rWrite: {
      error: null,
      identical: null,
      sentLength: null,
      tailErased: null,
      tailNonErased: null,
      firstDiff: null,
      afterError: null,
      decryptsToSameImage: null,
      verified: null,
      notes: [],
    },
    blocks: {
      cfgReadable: false,
      bootloaderReadable: false,
      afterB: { cfg: null, bootloader: null },
      afterR: { cfg: null, bootloader: null },
      afterBooted: { cfg: null, bootloader: null },
    },
    bootedWrite: {
      key: null,
      error: null,
      afterError: null,
      decryptsToSameImage: null,
      accepts: null,
      verified: null,
      notes: [],
    },
    resetSent: false,
    setup: null,
  };
}

function reasonOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * After a refused or failed commit: is the bank still the bytes it held? Read
 * through the plan's own read window. Recorded because a commit that reports an
 * error may already have erased part of the bank.
 */
async function bankAfterFailure(
  device: SeekDevice,
  report: SlotsReport,
  key: SlotKey,
  before: Uint8Array | null,
): Promise<string> {
  const read = report.plan.slots.find((slot) => slot.key === key)?.read ?? null;
  if (read === null) return 'no read window on this build';
  try {
    const got = (await device.readWindow(read)).data;
    if (before === null) return `read ${String(got.length)} B (no earlier bytes to compare)`;
    return equalBytes(got.subarray(0, before.length), before) ? 'prefix unchanged' : 'prefix CHANGED';
  } catch (error) {
    return `unreadable: ${reasonOf(error)}`;
  }
}

/**
 * The decrypted image a bank now holds, read back: the bank's own key state is
 * recovered from its vector table (the same solve the device-info read does).
 */
function decryptedReadBack(
  after: Uint8Array,
  length: number,
  state: DeviceState,
  staging: string | null,
): { plain: Uint8Array; accepts: boolean; bootable: boolean | null } {
  /* The 2014 plaintext chain stores the image itself: nothing to recover, and its
   * acceptance is the stored word sum 0. Recovering a keystream here would be a
   * guess (the image's own vector table need not hold the zero words the solve reads). */
  if (staging === 'plain') {
    const plain = after.slice(0, length);
    return { plain, accepts: wordSum32(plain, length) === 0, bootable: null };
  }
  const view = viewOf(after);
  const recovered = recoverKeyInfo(view, 0, length, state.profile.cipher);
  const plain = decryptImage(view, 0, length, recovered.state, state.profile.cipher);
  const accepts = recovered.checksum === state.profile.cipher.acceptanceSum;
  let bootable: boolean | null = null;
  if (state.keyTable !== null) {
    bootable = identifyKey(
      { state: recovered.state, accepts },
      state.keyTable,
      state.storeKey,
      state.keyWhiteningK,
    ).bootable;
  }
  return { plain, accepts, bootable };
}

async function runFirmware(subject: Subject, row: RowEmulators, run: Run): Promise<void> {
  const start = {
    entryId: subject.entryId,
    readyTimeoutMs: BOOT_TIMEOUT_MS,
    ...(subject.donor === undefined ? {} : { donor: subject.donor, jedec: JEDEC }),
  };
  const emu = await row.start(EMU_DIR!, start);
  await row.guard(emu, async () => {
    const adapter = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
    const transport = new WebUsbTransport(adapter, {
      recipient: 'auto',
      api: 'usbip (emulator)',
      host: 'vitest',
      clock: adapter.deadlineClock,
    });
    /* Every request the camera receives, in order, from the first read on. */
    const sent: number[] = [];
    const controlOut = transport.controlOut.bind(transport);
    transport.controlOut = (request, data, timeoutMs): Promise<void> => {
      sent.push(request);
      return controlOut(request, data, timeoutMs);
    };
    await transport.open();
    try {
      const device = new SeekDevice(transport);
      const ctxFor = (profile: FirmwareProfile): WorkflowContext => ({
        device,
        profile,
        detection: null,
        reporter: silentReporter,
      });
      const state = await readDeviceInfo(ctxFor(subject.profile));
      run.version = state.version;
      if (state.version === null) {
        run.setup = 'the device info did not name a firmware version';
        return;
      }
      if (state.version !== subject.version) {
        run.setup = `the camera reports ${state.version}, not ${subject.version}`;
      }
      const plan = buildSlotPlan(subject.profile, state.version);
      run.staging = plan.slots.find((slot) => slot.key === 'b')?.staging ?? null;
      if (run.staging !== subject.staging) {
        run.setup = `the capability plan names ${String(run.staging)}, not ${subject.staging}`;
      }
      const report: SlotsReport = reportFor(state, plan);
      const ctx = ctxFor(subject.profile);
      const cfgEntry = windowAt(subject.profile, state.version, CFG_ADDRESS);
      const bootloaderEntry = windowAt(subject.profile, state.version, BOOTLOADER_ADDRESS);
      run.blocks.cfgReadable = cfgEntry !== null;
      run.blocks.bootloaderReadable = bootloaderEntry !== null;

      /* The camera's own image names its keys by the camera's own pair. */
      const keyTable = state.keyTable;
      const nameFor = (): string =>
        keyTable === null ? 'image.bin' : `image${keyFilenameSuffix(keyTable.keyA, keyTable.keyB)}.bin`;
      const booted: SlotKey | null = state.boot?.booted ?? null;
      run.bWrite.booted = booted;

      const blocks = async (): Promise<{ cfg: Uint8Array | null; bootloader: Uint8Array | null }> => ({
        cfg: cfgEntry === null ? null : (await device.readWindow(cfgEntry)).data,
        bootloader:
          bootloaderEntry === null ? null : (await device.readWindow(bootloaderEntry)).data,
      });
      const before = await blocks();

      /* ---- (3) the booted bank, without acknowledgeRisk ---- */
      {
        const mark = sent.length;
        try {
          const bootedKey: SlotKey = booted ?? 'a';
          const bytes = state.byKey.get(bootedKey)?.plain;
          if (!bytes) throw new Error(`the booted bank ${bootedKey} did not decrypt`);
          const planBooted = prepareSlotFlash(report, bootedKey, {
            kind: 'plain',
            bytes,
            fileName: nameFor(),
          });
          await flashSlot(ctx, report, planBooted, { acknowledgeRisk: false });
          run.refusal.error = 'the write went through without acknowledgeRisk';
        } catch (error) {
          run.refusal.code = error instanceof SeekError ? error.code : null;
          run.refusal.message = reasonOf(error);
        }
        run.refusal.requestsSent = sent.slice(mark);
      }

      /* ---- (1) bank B from its own decrypted plaintext (bank A's, where B holds no image) ---- */
      const bSlot = state.byKey.get('b') ?? null;
      const source: SlotKey = bSlot?.plain && bSlot.plainHeader ? 'b' : 'a';
      const srcSlot = state.byKey.get(source) ?? null;
      run.bWrite.source = source;
      try {
        if (!srcSlot?.plain || !srcSlot.plainHeader) {
          throw new Error('no bank decrypts to an image, so there is nothing to write back');
        }
        const planB: SlotFlashPlan = prepareSlotFlash(report, 'b', {
          kind: 'plain',
          bytes: srcSlot.plain,
          fileName: nameFor(),
        });
        run.bWrite.notes.push(...planB.warnings);
        const result: FlashSlotResult = await flashSlot(ctx, report, planB, {
          acknowledgeRisk: booted === 'b' || booted === null,
        });
        run.bWrite.notes.push(...result.notes);
        run.bWrite.verified = result.verified;
        const after = result.after;
        if (after === null) {
          run.bWrite.error = 'the bank was not read back';
        } else {
          const back = decryptedReadBack(after, srcSlot.plainHeader.length, state, subject.staging);
          run.bWrite.decryptsToSameImage = equalBytes(back.plain, srcSlot.plain);
          run.bWrite.accepts = back.accepts;
          run.bWrite.bootable = back.bootable;
          run.bWrite.byteRoundTrip = source === 'b' && bSlot?.raw != null && equalBytes(after, bSlot.raw);
        }
      } catch (error) {
        run.bWrite.error = reasonOf(error);
        run.bWrite.afterError = await bankAfterFailure(device, report, 'b', bSlot?.raw ?? null);
        run.bWrite.notes.push(`after the failure, bank B: ${run.bWrite.afterError}`);
      }
      const afterB = await blocks();
      run.blocks.afterB = {
        cfg: cfgEntry === null ? null : equalBytes(afterB.cfg!, before.cfg!),
        bootloader:
          bootloaderEntry === null ? null : equalBytes(afterB.bootloader!, before.bootloader!),
      };

      /* ---- (2) a staged payload, sent as raw bytes, into recovery R ----
       * The raw bytes are the staged form of bank A's image (what the capability
       * plan's own staging produces), so a payload the bootloader accepts is what
       * is being checked. Sending bank A's stored bytes instead is not a valid
       * payload on the 2016 line (its stage key is key block 0, and the device
       * answers 0x70100 "Invalid image"); that attempt is part of the run's notes. */
      const aSlot = state.byKey.get('a') ?? null;
      try {
        if (!aSlot?.plain || !aSlot.plainHeader) {
          throw new Error('bank A does not decrypt, so there is no image to stage for recovery');
        }
        const stagedA = prepareSlotFlash(report, 'r', {
          kind: 'plain',
          bytes: aSlot.plain,
          fileName: nameFor(),
        });
        const planR = prepareSlotFlash(report, 'r', {
          kind: 'raw',
          bytes: stagedA.payload,
          fileName: 'raw.bin',
        });
        run.rWrite.notes.push(...planR.warnings);
        run.rWrite.sentLength = planR.payload.length;
        const result = await flashSlot(ctx, report, planR, { acknowledgeRisk: true });
        run.rWrite.notes.push(...result.notes);
        run.rWrite.verified = result.verified;
        if (result.after === null) {
          run.rWrite.error = 'recovery was not read back';
        } else {
          const got = result.after;
          const sent = planR.payload;
          run.rWrite.identical = equalBytes(got.subarray(0, sent.length), sent);
          let firstDiff: number | null = null;
          for (let i = 0; i < sent.length; i++) {
            if (got[i] !== sent[i]) {
              firstDiff = i;
              break;
            }
          }
          run.rWrite.firstDiff = firstDiff;
          let nonErased = 0;
          for (const byte of got.subarray(sent.length)) if (byte !== 0xff) nonErased++;
          run.rWrite.tailNonErased = nonErased;
          run.rWrite.tailErased = nonErased === 0;
          const back = decryptedReadBack(got, aSlot.plainHeader.length, state, subject.staging);
          run.rWrite.decryptsToSameImage = equalBytes(back.plain, aSlot.plain);
        }
      } catch (error) {
        run.rWrite.error = reasonOf(error);
        run.rWrite.afterError = await bankAfterFailure(device, report, 'r', state.byKey.get('r')?.raw ?? null);
        run.rWrite.notes.push(`after the failure, recovery R: ${run.rWrite.afterError}`);
      }
      const afterR = await blocks();
      run.blocks.afterR = {
        cfg: cfgEntry === null ? null : equalBytes(afterR.cfg!, before.cfg!),
        bootloader:
          bootloaderEntry === null ? null : equalBytes(afterR.bootloader!, before.bootloader!),
      };

      /* ---- (5) the booted bank, rewritten from its own plaintext with acknowledgeRisk ----
       * Bank B is the booted one here only when the camera boots it; then (1) has already
       * done this write, and this check says so. */
      const bootedKey: SlotKey = booted ?? 'a';
      if (booted === null) run.bootedWrite.notes.push('the camera names no booted bank: A is assumed booted');
      if (bootedKey === 'b') {
        run.bootedWrite.key = null;
        run.bootedWrite.notes.push('the booted bank is B: covered by check (1)');
      } else {
        run.bootedWrite.key = bootedKey;
        const bootedSlot = state.byKey.get(bootedKey) ?? null;
        let plannedPayload: Uint8Array | null = null;
        try {
          if (!bootedSlot?.plain || !bootedSlot.plainHeader) {
            throw new Error(`the booted bank ${bootedKey} does not decrypt, so it has no image to write back`);
          }
          const planBooted = prepareSlotFlash(report, bootedKey, {
            kind: 'plain',
            bytes: bootedSlot.plain,
            fileName: nameFor(),
          });
          run.bootedWrite.notes.push(...planBooted.warnings);
          plannedPayload = planBooted.payload;
          const result = await flashSlot(ctx, report, planBooted, { acknowledgeRisk: true });
          run.bootedWrite.notes.push(...result.notes);
          run.bootedWrite.verified = result.verified;
          if (result.after === null) {
            run.bootedWrite.error = 'the booted bank was not read back';
          } else {
            const back = decryptedReadBack(result.after, bootedSlot.plainHeader.length, state, subject.staging);
            run.bootedWrite.decryptsToSameImage = equalBytes(back.plain, bootedSlot.plain);
            run.bootedWrite.accepts = back.accepts;
          }
        } catch (error) {
          run.bootedWrite.error = reasonOf(error);
          run.bootedWrite.afterError = await bankAfterFailure(device, report, bootedKey, bootedSlot?.raw ?? null);
          /* Diagnostic: the same payload through the preservation pipeline's own commit. */
          if (plannedPayload !== null) {
            try {
              const done = await commitToBank(device, bootedKey, plannedPayload, {
                label: 'diagnostic',
                reporter: silentReporter,
              });
              run.bootedWrite.notes.push(`the preservation commitToBank on the same payload: status ${String(done.status)}`);
            } catch (commitError) {
              run.bootedWrite.notes.push(`the preservation commitToBank on the same payload: ${reasonOf(commitError)}`);
            }
          }
          run.bootedWrite.notes.push(`after the failure, the booted bank: ${run.bootedWrite.afterError}`);
        }
      }
      const afterBooted = await blocks();
      run.blocks.afterBooted = {
        cfg: cfgEntry === null ? null : equalBytes(afterBooted.cfg!, before.cfg!),
        bootloader:
          bootloaderEntry === null ? null : equalBytes(afterBooted.bootloader!, before.bootloader!),
      };

      run.resetSent = sent.includes(0x59);
    } catch (error) {
      run.setup = run.setup ?? reasonOf(error);
    } finally {
      await transport.close();
    }
  });
}

/* Every subject is its own emulator, so the firmwares run side by side. */
describe.skipIf(!available)('the slot writer on the emulated cameras', () => {
  for (const subject of SUBJECTS) {
    const present = ENTRIES.some((entry) => entry.id === subject.entryId);
    const donorPresent =
      subject.donor === undefined || ENTRIES.some((entry) => entry.id === subject.donor);
    describe.skipIf(!present || !donorPresent)(subject.label, () => {
      const run = blankRun();
      const row = new RowEmulators(subject.entryId);

      beforeAll(async () => {
        try {
          await runFirmware(subject, row, run);
        } catch (error) {
          run.setup = run.setup ?? reasonOf(error);
        }
      }, TIMEOUT_MS);

      afterAll(async () => {
        await row.finish();
        expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
      });

      it(`boots ${subject.version} and reads its device info (setup)`, () => {
        expect(run.setup).toBeNull();
        expect(run.version).toBe(subject.version);
        expect(run.staging, 'the staging the capability plan names for bank B').toBe(subject.staging);
      });

      it('(3) a write to the booted bank without acknowledgeRisk is refused, nothing sent', () => {
        expect(run.refusal.code, run.refusal.message ?? '').toBe('slots/refused');
        expect(run.refusal.requestsSent, 'requests the camera received').toEqual([]);
      });

      it('(1) bank B rewritten from its own plaintext reads back as the same image, accepted', () => {
        expect(run.bWrite.error, run.bWrite.notes.join('\n')).toBeNull();
        expect(run.bWrite.decryptsToSameImage, run.bWrite.notes.join('\n')).toBe(true);
        expect(run.bWrite.accepts).toBe(true);
        if (subject.staging === 'key-a-ciphertext') expect(run.bWrite.bootable).toBe(true);
        if (run.bWrite.verified !== null) expect(run.bWrite.verified).toBe(true);
      });

      it('(2) a staged payload sent as raw bytes into recovery R reads back as sent', () => {
        expect(run.rWrite.error, run.rWrite.notes.join('\n')).toBeNull();
        const detail =
          `sent ${String(run.rWrite.sentLength)} B, first difference at ` +
          `${run.rWrite.firstDiff === null ? 'none' : String(run.rWrite.firstDiff)}, ` +
          `bytes past the payload not erased: ${String(run.rWrite.tailNonErased)}`;
        expect(run.rWrite.tailErased, detail).toBe(true);
        if (subject.staging === 'key-a-ciphertext') {
          /* The Key A line: the commit decrypts the staged bytes under Key A and stores the
           * image under the store key, so the bytes are not kept verbatim; the bank must
           * still decrypt to the same image. Measured, and reported as such. */
          expect(run.rWrite.identical, `not verbatim on the Key A line (${detail})`).toBe(false);
          expect(run.rWrite.decryptsToSameImage, detail).toBe(true);
        } else {
          expect(run.rWrite.identical, detail).toBe(true);
        }
      });

      it('(5) the booted bank, rewritten from its own plaintext with acknowledgeRisk, decrypts to the same image', () => {
        const bw = run.bootedWrite;
        if (bw.key === null) {
          expect(bw.notes.join('\n')).toContain('covered by check (1)');
          return;
        }
        expect(bw.error, `${bw.notes.join('\n')}\n${String(bw.afterError)}`).toBeNull();
        expect(bw.decryptsToSameImage, bw.notes.join('\n')).toBe(true);
        expect(bw.accepts).toBe(true);
        if (bw.verified !== null) expect(bw.verified).toBe(true);
      });

      it('(4) the boot-config block and the bootloader are unchanged after every write, byte for byte', () => {
        expect(run.resetSent, 'ResetDevice was never sent').toBe(false);
        expect(run.blocks.cfgReadable, 'the build exposes the boot-config window').toBe(true);
        expect(run.blocks.afterB.cfg).toBe(true);
        expect(run.blocks.afterR.cfg).toBe(true);
        expect(run.blocks.bootloaderReadable, 'the build exposes the bootloader window').toBe(true);
        expect(run.blocks.afterB.bootloader).toBe(true);
        expect(run.blocks.afterR.bootloader).toBe(true);
        expect(run.blocks.afterBooted.cfg).toBe(true);
        expect(run.blocks.afterBooted.bootloader).toBe(true);
      });

      it('the emulator delivered every reply it sent (no infrastructure defect)', async () => {
        await row.assertDelivery();
      });
    });
  }
});
