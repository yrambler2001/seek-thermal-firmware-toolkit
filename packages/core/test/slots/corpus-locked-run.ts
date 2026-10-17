/* ==================================================================== *
 * One locked-line firmware on the emulator, run through every slot workflow,
 * and recorded step by step. The suite asserts on the record; the matrix
 * prints it. Nothing here asserts: a step that fails records its reason.
 *
 * THE ORDER, ONE BOOT PER FIRMWARE:
 *   1. the camera's own probe picks a profile; the offline plan is built;
 *   2. inspectSlots reads the three banks; dumpSlot reads each one, and each
 *      dump is compared with the emulator's own flash at the bank's address;
 *   3. a write to the BOOTED bank is refused without acknowledgeRisk, and no
 *      request reaches the camera;
 *   4. a decrypted image is flashed into the NON-booted bank (no acknowledgement
 *      needed); the read-back decrypts to that image (or equals it, 2014);
 *   5. the same image is flashed into recovery R with acknowledgeRisk;
 *   6. the staged payload is sent as RAW bytes into R with acknowledgeRisk;
 *   7. the boot-config block and the bootloader are read after every write.
 *
 * THE 1.3.0.8 FF IMAGE differs in three steps: it is refused for the non-booted bank (the 2014
 * bootloader rejects its sum at A and B), the booted-bank refusal is taken on R (the only bank it
 * goes to), and a fourth step sends R's original stored bytes raw, which the camera rejects before
 * erasing. What it leaves in R is the plain image with the adjust word at 0x238 solved, so the
 * read-back is compared with that (`expectedFFStored`), not with the corpus image.
 *
 * Nothing here is a real camera: every boot is the FW-V1 emulator.
 * ==================================================================== */

import { readFileSync } from 'node:fs';

import { equalBytes, viewOf } from '../../src/bytes.js';
import { decryptImage } from '../../src/crypto/cipher.js';
import { recoverKeyInfo } from '../../src/crypto/recover.js';
import { SeekError, errorMessage } from '../../src/errors.js';
import { silentReporter } from '../../src/events.js';
import { wordSum32 } from '../../src/image/bank.js';
import {
  KEY_PAIRS,
  keystream,
  keyWordsOf,
  REBALANCE_WORD_OFFSET,
  xorWindowVerbatim,
} from '../../src/preservation/patch.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { WebUsbTransport } from '../../src/protocol/webusb.js';
import { detectProfile } from '../../src/profiles/registry.js';
import type { FirmwareProfile, SlotKey } from '../../src/profiles/types.js';
import { buildSlotPlan } from '../../src/slots/capability.js';
import { classifyBuild } from '../../src/slots/capability-family.js';
import { dumpSlot } from '../../src/slots/dump.js';
import { inspectSlots } from '../../src/slots/inspect.js';
import { flashSlot, prepareSlotFlash } from '../../src/slots/write.js';
import type {
  DumpedSlot,
  FlashSlotResult,
  PlanStaging,
  SlotFlashInput,
  SlotFlashPlan,
  SlotInputKind,
  SlotPlan,
  SlotsReport,
} from '../../src/slots/types.js';
import {
  evidenceFromChannelProbe,
  probeSelectorChannel,
  readRunningFirmware,
} from '../../src/workflows/capability.js';
import type { DeviceState, WorkflowContext } from '../../src/workflows/types.js';
import type { RowEmulators, Emulator } from '../emulator/harness.js';
import { BOOT_TIMEOUT_MS, EMU_DIR, URB_TIMEOUT_MS } from '../emulator/suite.js';
import { windowAt } from './write-fixtures.js';
import {
  isFFImage,
  vendoredBytes,
  type CorpusEntry,
  type LockedSubject,
} from './corpus-locked-subjects.js';

/** The flash base the emulator maps the part at, and the bank size. */
export const FLASH_BASE = 0x14000000;
export const BANK_BYTES = 0x10000;
/** The boot-config block and the bootloader, read through the build's own windows. */
export const CFG_ADDRESS = 0x14010000;
export const BOOTLOADER_ADDRESS = 0x14000000;
/** The write opcodes: SetFeaturedFirmwareData (0x50) and CompleteMemoryUpgrade (0x51), and ResetDevice (0x59). */
const OP_BEGIN_FIRMWARE_UPGRADE = 0x52;
const OP_RESET_DEVICE = 0x59;

export interface Sent {
  readonly op: number;
  readonly data: Uint8Array;
}

/** What the emulator delivered for one bank, read back as a dump. */
export interface DumpRow {
  readonly key: SlotKey;
  readonly address: number;
  /** The dump equals the emulator's own flash at the bank's address, byte for byte. */
  identical: boolean | null;
  /** The decrypted image's length, when the bank decrypts under a recovered key. */
  plainLength: number | null;
  /** Every byte of the bank is 0xFF (the bank holds nothing). */
  erased: boolean | null;
  /**
   * The bank holds the vendored corpus image (image-only entries; a prefix match). On the 2014
   * plaintext chain the image is stored verbatim, so this compares the stored bytes ('stored');
   * on the 2016 line the bank is keystream-stored, so it compares the decrypted image ('decrypted').
   */
  matchesVendored: boolean | null;
  matchedAs: 'stored' | 'decrypted' | null;
  notes: string[];
  error: string | null;
}

/** One write, and what the read-back of its bank says about it. */
export interface WriteRow {
  readonly step: string;
  readonly key: SlotKey;
  readonly kind: SlotInputKind;
  readonly acknowledged: boolean;
  /** Set when the write threw before or during the commit. */
  error: string | null;
  /** The SeekError code, when there was one. */
  code: string | null;
  /** The camera's own status word, when the commit reported one. */
  deviceCode: number | null;
  commitStatus: number | null;
  /** The writer's own verdict against the bytes it predicted (null when it predicts none). */
  verified: boolean | null;
  /** Raw writes: the read-back starts with the payload sent, byte for byte. */
  identical: boolean | null;
  /** Raw writes: every byte past the payload is still erased. */
  tailErased: boolean | null;
  /** The read-back decrypts to the image sent (plain chain: equals it). */
  decrypts: boolean | null;
  /** The decrypted read-back hits the profile's acceptance sum. */
  accepts: boolean | null;
  /** Requests the camera received during this write, from the first one sent. */
  requests: number;
  /**
   * After a write that threw: the bank read back, against the bytes it held before the write.
   * 'unchanged' is the case a refused payload must leave; 'CHANGED' and 'unreadable' are said
   * as they are. Null when the write did not throw, or the bank was not read.
   */
  bankAfterError: string | null;
  notes: string[];
}

export interface RefusalRow {
  readonly key: SlotKey;
  readonly code: string | null;
  readonly message: string | null;
  /** The requests the camera received during the refused call. Must be none. */
  readonly requests: number;
}

export interface BlockRow {
  readonly step: string;
  readonly cfg: boolean | null;
  readonly bootloader: boolean | null;
}

/** Everything one firmware's run recorded. */
export interface LockedRun {
  readonly subject: LockedSubject;
  readonly entryId: string;
  /** Why the run could not get as far as the checks, or null. */
  setup: string | null;
  version: string | null;
  /** The profile the camera's own probe picked (the first read's). */
  probedProfile: string | null;
  /** The profile the analysis was judged under: the probe's, or the one the banks name. */
  analysisProfile: string | null;
  /** The plan, built offline from the profile and the version alone. */
  planProfile: string | null;
  planSupported: boolean | null;
  planFamily: string | null;
  planStaging: string | null;
  planDumpable: Record<SlotKey, boolean> | null;
  planFlashable: Record<SlotKey, boolean> | null;
  planNotes: readonly string[];
  /** The analysis: which bank the camera boots, and which banks it read. */
  inspectError: string | null;
  booted: SlotKey | null;
  /** Why the analysis could not name what it could not: the page's own reasons (flashBlockedBy). */
  blockedBy: string[];
  /** Facts about the run the matrix prints: where the image came from, what raw payload was sent. */
  notes: string[];
  inspected: Record<SlotKey, boolean> | null;
  /** The bank the emulator boots the image from, for the step list. */
  dumps: DumpRow[];
  refusal: RefusalRow | null;
  /** The non-booted bank the plain and raw steps wrote. */
  nonBooted: SlotKey | null;
  writes: WriteRow[];
  blocks: BlockRow[];
  cfgReadable: boolean;
  bootloaderReadable: boolean;
  /** Each request the camera received, in order, from the first one. */
  sentCount: number;
  resetSent: boolean;
  subcmd0Armed: boolean;
  /** The image the plain and raw steps wrote, for the matrix. */
  imageLength: number | null;
  /** The emulator's own flash, for the card: where each bank is. */
  truthRead: boolean;
}

export function blankLockedRun(subject: LockedSubject, entryId: string): LockedRun {
  return {
    subject,
    entryId,
    setup: null,
    version: null,
    probedProfile: null,
    analysisProfile: null,
    planProfile: null,
    planSupported: null,
    planFamily: null,
    planStaging: null,
    planDumpable: null,
    planFlashable: null,
    planNotes: [],
    inspectError: null,
    booted: null,
    blockedBy: [],
    notes: [],
    inspected: null,
    dumps: [],
    refusal: null,
    nonBooted: null,
    writes: [],
    blocks: [],
    cfgReadable: false,
    bootloaderReadable: false,
    sentCount: 0,
    resetSent: false,
    subcmd0Armed: false,
    imageLength: null,
    truthRead: false,
  };
}

export function reasonOf(error: unknown): string {
  return errorMessage(error);
}

/** Records every request the camera receives, with its data, from the first one on. */
export function recordTransport(transport: WebUsbTransport, sent: Sent[]): void {
  const controlOut = transport.controlOut.bind(transport);
  transport.controlOut = (request: number, data: Uint8Array, timeoutMs?: number): Promise<void> => {
    sent.push({ op: request, data: data.slice() });
    return controlOut(request, data, timeoutMs);
  };
}

/**
 * The image the 1.3.0.8 FF write leaves in its bank, worked out here from the corpus image and the
 * key pair, NOT by the writer's builder: the image with the adjust word at 0x238 set to
 * 0xFFFF - sum(image ^ ksD) (word 0x238 taken as 0, header window verbatim), the one word the
 * app's collapsed acceptance needs. The camera stores the plain image, so this is the bank's content.
 */
export function expectedFFStored(image: Uint8Array): Uint8Array {
  const words = image.length >>> 2;
  const ksD = keystream(keyWordsOf(KEY_PAIRS.ff1308.block1), words);
  const out = image.slice();
  const view = viewOf(out);
  view.setUint32(REBALANCE_WORD_OFFSET, 0, true);
  const base = wordSum32(xorWindowVerbatim(out, ksD), out.length);
  view.setUint32(REBALANCE_WORD_OFFSET, (0xffff - base) >>> 0, true);
  return out;
}

/**
 * The decrypted image a bank now holds, read back. The 2014 plain chain stores the
 * image itself: its acceptance is the stored word sum 0 and nothing is recovered.
 * The FF build stores the plain image too, but its acceptance is the app's collapsed gate,
 * sum(image ^ ksD) == 0xFFFF, which is what makes the stored image stageable again.
 * The 2016 line recovers the bank's own keystream from its vector table, as the
 * device-info read does.
 */
export function decryptedReadBack(
  after: Uint8Array,
  length: number,
  state: DeviceState,
  staging: PlanStaging,
): { plain: Uint8Array; accepts: boolean } {
  if (staging === 'plain') {
    const plain = after.slice(0, length);
    return { plain, accepts: wordSum32(plain, length) === 0 };
  }
  if (staging === 'two-stream') {
    const plain = after.slice(0, length);
    const ksD = keystream(keyWordsOf(KEY_PAIRS.ff1308.block1), length >>> 2);
    return { plain, accepts: wordSum32(xorWindowVerbatim(plain, ksD), length) === 0xffff };
  }
  const view = viewOf(after);
  const recovered = recoverKeyInfo(view, 0, length, state.profile.cipher);
  const plain = decryptImage(view, 0, length, recovered.state, state.profile.cipher);
  return { plain, accepts: recovered.checksum === state.profile.cipher.acceptanceSum };
}

function isErased(bytes: Uint8Array): boolean {
  for (const byte of bytes) if (byte !== 0xff) return false;
  return true;
}

/** The boot-config block and the bootloader, read now. Null for a block the build does not expose. */
async function readBlocks(
  device: SeekDevice,
  profile: FirmwareProfile,
  version: string,
): Promise<{ cfg: Uint8Array | null; bootloader: Uint8Array | null }> {
  const cfgEntry = windowAt(profile, version, CFG_ADDRESS);
  const bootEntry = windowAt(profile, version, BOOTLOADER_ADDRESS);
  return {
    cfg: cfgEntry === null ? null : (await device.readWindow(cfgEntry)).data,
    bootloader: bootEntry === null ? null : (await device.readWindow(bootEntry)).data,
  };
}

/** One write, end to end: prepare (pure), commit, and read the bank back. Never throws. */
async function writeStep(
  ctx: WorkflowContext,
  report: SlotsReport,
  step: string,
  key: SlotKey,
  input: SlotFlashInput,
  acknowledgeRisk: boolean,
  image: Uint8Array | null,
  staging: PlanStaging,
  before: Uint8Array | null,
  sent: Sent[],
): Promise<WriteRow> {
  const row: WriteRow = {
    step,
    key,
    kind: input.kind,
    acknowledged: acknowledgeRisk,
    error: null,
    code: null,
    deviceCode: null,
    commitStatus: null,
    verified: null,
    identical: null,
    tailErased: null,
    decrypts: null,
    accepts: null,
    requests: 0,
    bankAfterError: null,
    notes: [],
  };
  const mark = sent.length;
  try {
    const plan: SlotFlashPlan = prepareSlotFlash(report, key, input);
    row.notes.push(...plan.warnings.filter((w) => !w.startsWith('Note:')));
    const result: FlashSlotResult = await flashSlot(ctx, report, plan, { acknowledgeRisk });
    row.commitStatus = result.commitStatus;
    row.verified = result.verified;
    row.notes.push(...result.notes.filter((n) => !n.startsWith('committed')));
    const after = result.after;
    if (after === null) {
      row.error = 'the bank was not read back';
    } else {
      if (input.kind === 'raw') {
        /* The bank starts with the bytes the plan says it will hold. Where the camera programs the
         * payload as sent that is the payload; the FF build stores the image the payload folds to. */
        const stored = plan.expectedStored?.subarray(0, plan.payload.length) ?? plan.payload;
        row.identical = equalBytes(after.subarray(0, plan.payload.length), stored);
        row.tailErased = isErased(after.subarray(plan.payload.length));
      }
      /* The bank decrypts under the form the LINE stores it in, whatever the input kind. A
       * write with no image to compare with (a raw payload with no staged form) is checked
       * byte for byte above, and not decrypted here. */
      if (image !== null) {
        const back = decryptedReadBack(after, image.length, report.state, staging);
        row.decrypts = equalBytes(back.plain, image);
        row.accepts = back.accepts;
      }
    }
  } catch (error) {
    row.error = reasonOf(error);
    if (error instanceof SeekError) {
      row.code = error.code;
      row.deviceCode = error.deviceCode ?? null;
    }
  }
  /* The request count is taken before any read-back, so a read after a failure is not counted
   * as part of the write (and a write refused before anything was sent reads nothing). */
  row.requests = sent.length - mark;
  if (row.error !== null && row.requests > 0) {
    row.bankAfterError = await bankAfterFailure(ctx, report, key, before);
  }
  return row;
}

/** The bank read back after a write threw, against the bytes it held before it. Never throws. */
async function bankAfterFailure(
  ctx: WorkflowContext,
  report: SlotsReport,
  key: SlotKey,
  before: Uint8Array | null,
): Promise<string | null> {
  const read = report.plan.slots.find((s) => s.key === key)?.read ?? null;
  if (read === null || before === null) return null;
  try {
    const now = (await ctx.device.readWindow(read)).data;
    const same = now.length >= before.length && equalBytes(now.subarray(0, before.length), before);
    return same ? 'unchanged' : 'CHANGED';
  } catch (error) {
    return `unreadable: ${reasonOf(error)}`;
  }
}

/** Dump one bank and compare it with the emulator's flash. Never throws. */
async function dumpStep(
  ctx: WorkflowContext,
  report: SlotsReport,
  key: SlotKey,
  truth: Uint8Array | null,
  vendored: Uint8Array | null,
  imageOnly: boolean,
  staging: PlanStaging,
): Promise<DumpRow> {
  const entry = report.plan.slots.find((s) => s.key === key);
  const address = entry?.address ?? 0;
  const row: DumpRow = {
    key,
    address,
    identical: null,
    plainLength: null,
    erased: null,
    matchesVendored: null,
    matchedAs: null,
    notes: [],
    error: null,
  };
  try {
    const dumped: DumpedSlot = await dumpSlot(ctx, report, key);
    row.notes.push(...dumped.notes.filter((n) => !n.startsWith('decrypted')));
    if (truth !== null) {
      const at = address - FLASH_BASE;
      row.identical = equalBytes(dumped.raw, truth.subarray(at, at + BANK_BYTES));
    }
    row.erased = dumped.raw.every((b) => b === 0xff);
    if (dumped.plain !== null) row.plainLength = dumped.plain.length;
    if (imageOnly && vendored !== null) {
      /* The 2014 chain stores the image itself. Its stored bytes are compared as they are: the
       * stronger check, since the plain image dumpSlot also reports is the same bytes under a
       * recovered keystream of zero (checked on the 0.8.0.0 bank A: sane, checksum 0). */
      if (staging === 'plain') {
        const n = Math.min(vendored.length, dumped.raw.length);
        row.matchesVendored = equalBytes(dumped.raw.subarray(0, n), vendored.subarray(0, n));
        row.matchedAs = 'stored';
      } else if (dumped.plain !== null) {
        const n = Math.min(dumped.plain.length, vendored.length);
        row.matchesVendored = equalBytes(dumped.plain.subarray(0, n), vendored.subarray(0, n));
        row.matchedAs = 'decrypted';
      }
    }
  } catch (error) {
    row.error = reasonOf(error);
  }
  return row;
}

/**
 * The whole run for one firmware, on the emulator `row` boots. The emulator is
 * started here and stopped by the caller's `row.finish()`.
 */
export async function runLockedFirmware(
  subject: LockedSubject,
  entry: CorpusEntry,
  row: RowEmulators,
  truthPath: string,
  run: LockedRun,
): Promise<void> {
  if (EMU_DIR === null) throw new Error('corpus-locked: no emulator directory');
  const imageOnly = entry.kind === 'image-only';
  const vendored = imageOnly ? vendoredBytes(entry) : null;
  const emu: Emulator = await row.start(EMU_DIR, {
    entryId: entry.id,
    readyTimeoutMs: BOOT_TIMEOUT_MS,
    flashOut: truthPath,
    ...(subject.jedec === null ? {} : { jedec: subject.jedec }),
    ...(subject.donor === undefined ? {} : { donor: subject.donor }),
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

      /* The truth is the flash the emulator served: written before the READY line. */
      const truth = new Uint8Array(readFileSync(truthPath));
      run.truthRead = truth.length === 4 * 1024 * 1024;

      /* ---- 1. the camera's own probe, and the offline plan ---- */
      const probe = await probeSelectorChannel(device);
      const probed: FirmwareProfile = detectProfile(evidenceFromChannelProbe(probe)).best.profile;
      run.probedProfile = probed.id;
      const firmware = await readRunningFirmware(device);
      run.version = firmware.version;
      if (firmware.version === null) {
        run.setup = 'the camera reported no firmware version';
        return;
      }
      const plan: SlotPlan = buildSlotPlan(probed, firmware.version);
      run.planProfile = plan.profileId;
      run.planSupported = plan.supportedBuild.supported;
      run.planFamily = classifyBuild(probed, firmware.version).family;
      run.planStaging = plan.slots.find((s) => s.key === 'b')?.staging ?? null;
      run.planNotes = plan.notes;
      run.planDumpable = Object.fromEntries(
        plan.slots.map((s) => [s.key, s.dump.supported]),
      ) as Record<SlotKey, boolean>;
      run.planFlashable = Object.fromEntries(
        plan.slots.map((s) => [s.key, s.flashPlain.supported]),
      ) as Record<SlotKey, boolean>;

      const ctx: WorkflowContext = {
        device,
        profile: probed,
        detection: null,
        reporter: silentReporter,
      };

      /* ---- 2. the analysis, and each bank dumped against the flash ---- */
      let report: SlotsReport;
      try {
        report = await inspectSlots(ctx);
      } catch (error) {
        run.inspectError = reasonOf(error);
        return;
      }
      const state = report.state;
      run.analysisProfile = state.profile.id;
      run.booted = state.boot?.booted ?? null;
      run.blockedBy = [...state.flashBlockedBy];
      run.inspected = {
        a: state.byKey.get('a') !== undefined && state.byKey.get('a')?.unread === false,
        b: state.byKey.get('b') !== undefined && state.byKey.get('b')?.unread === false,
        r: state.byKey.get('r') !== undefined && state.byKey.get('r')?.unread === false,
      };
      const profile = state.profile;
      const version = firmware.version;

      /* The block bytes as the camera serves them before any write: the baseline every later read is compared with. */
      const baseline = await readBlocks(device, profile, version);
      run.cfgReadable = windowAt(profile, version, CFG_ADDRESS) !== null;
      run.bootloaderReadable = windowAt(profile, version, BOOTLOADER_ADDRESS) !== null;
      const blockStep = async (step: string): Promise<void> => {
        const now = await readBlocks(device, profile, version);
        run.blocks.push({
          step,
          cfg: baseline.cfg === null || now.cfg === null ? null : equalBytes(now.cfg, baseline.cfg),
          bootloader:
            baseline.bootloader === null || now.bootloader === null
              ? null
              : equalBytes(now.bootloader, baseline.bootloader),
        });
      };

      for (const key of ['a', 'b', 'r'] as const) {
        run.dumps.push(
          await dumpStep(ctx, report, key, truth, vendored, imageOnly, subject.staging),
        );
      }

      /* The image every write sends: the vendored corpus image for an image-only
       * entry (the chimera splices exactly it), else the booted bank's own plain. */
      const bootedKey: SlotKey = run.booted ?? 'a';
      const bootedPlain = state.byKey.get(bootedKey)?.plain ?? null;
      const image: Uint8Array | null = vendored ?? bootedPlain;
      if (image === null) {
        run.setup = `the booted bank ${bootedKey} holds no decrypted image, so there is nothing to write`;
        return;
      }
      run.imageLength = image.length;

      /* The 1.3.0.8 FF image goes to R only and leaves the plain image with its adjust word solved
       * (computed here, not by the writer's builder); every other image is left as it was written. */
      const ffImage = isFFImage(subject);
      const expectedImage: Uint8Array = ffImage ? expectedFFStored(image) : image;
      const writeStaging: PlanStaging = ffImage ? 'two-stream' : subject.staging;

      /* ---- 3. the booted bank, without acknowledgeRisk ----
       * The FF image has no bank but R to go to, so the acknowledgement is asked of R. */
      /* Every request from here on is the write path's; the analysis above was reads. */
      const writeFrom = sent.length;
      const refusalKey: SlotKey = ffImage ? 'r' : bootedKey;
      {
        const mark = sent.length;
        const refusal: RefusalRow = { key: refusalKey, code: null, message: null, requests: 0 };
        try {
          const planBooted = prepareSlotFlash(report, refusalKey, {
            kind: 'plain',
            bytes: image,
            fileName: 'image.bin',
          });
          await flashSlot(ctx, report, planBooted, { acknowledgeRisk: false });
          run.refusal = {
            ...refusal,
            message: 'the write went through without acknowledgeRisk',
            requests: sent.length - mark,
          };
        } catch (error) {
          run.refusal = {
            key: refusalKey,
            code: error instanceof SeekError ? error.code : null,
            message: reasonOf(error),
            requests: sent.length - mark,
          };
        }
      }

      /* ---- 4. a decrypted image into the NON-booted bank A/B ---- */
      const nonBooted: SlotKey = bootedKey === 'a' ? 'b' : 'a';
      run.nonBooted = nonBooted;
      /* With no booted bank named, every bank counts as booted, so the write is acknowledged
       * and the step says so: the label must not claim a bank the page could not name. */
      const ackAB = run.booted === null;
      const plainNB = await writeStep(
        ctx,
        report,
        ackAB
          ? `plain image -> ${nonBooted.toUpperCase()} (boot unknown, acknowledged)`
          : `plain image -> ${nonBooted.toUpperCase()} (not booted)`,
        nonBooted,
        { kind: 'plain', bytes: image, fileName: 'image.bin' },
        ackAB,
        expectedImage,
        writeStaging,
        state.byKey.get(nonBooted)?.raw ?? null,
        sent,
      );
      run.writes.push(plainNB);
      await blockStep(`after plain -> ${nonBooted.toUpperCase()}`);

      /* ---- 5. the same image into recovery R, acknowledged ---- */
      const plainR = await writeStep(
        ctx,
        report,
        'plain image -> R (acknowledged)',
        'r',
        { kind: 'plain', bytes: image, fileName: 'image.bin' },
        true,
        expectedImage,
        writeStaging,
        state.byKey.get('r')?.raw ?? null,
        sent,
      );
      run.writes.push(plainR);
      await blockStep('after plain -> R');

      /* ---- 6. a RAW payload into R, acknowledged ----
       * The staged payload of the image: the plain build's image itself, the 2016 stage-key form,
       * or the FF build's two-stream form (what the camera folds back to the plain image). */
      let staged: Uint8Array | null = null;
      try {
        staged = prepareSlotFlash(report, 'r', {
          kind: 'plain',
          bytes: image,
          fileName: 'image.bin',
        }).payload;
      } catch (error) {
        run.setup = run.setup ?? `no staged payload for the raw step: ${reasonOf(error)}`;
      }
      if (staged !== null) {
        const rawR = await writeStep(
          ctx,
          report,
          'raw staged payload -> R (acknowledged)',
          'r',
          { kind: 'raw', bytes: staged, fileName: 'raw.bin' },
          true,
          expectedImage,
          writeStaging,
          null,
          sent,
        );
        run.writes.push(rawR);
        await blockStep('after raw -> R');
      }

      /* ---- 7. the FF build only: R's original stored bytes, sent raw ----
       * They are the plain image, not the two-stream form, so the app's collapsed gate rejects
       * them (0x00070100) after the whole stage and before any erase, and R is left as the FF
       * write made it. A dump of an FF bank written back raw lands here. */
      if (ffImage) {
        const storedR = state.byKey.get('r')?.raw ?? null;
        if (storedR === null) {
          run.setup = run.setup ?? 'recovery holds no stored bytes to send raw';
        } else {
          const rawR = await writeStep(
            ctx,
            report,
            'raw stored bytes -> R (acknowledged, not a staged form)',
            'r',
            { kind: 'raw', bytes: storedR, fileName: 'raw.bin' },
            true,
            null,
            writeStaging,
            expectedImage,
            sent,
          );
          run.writes.push(rawR);
          await blockStep('after raw -> R');
        }
      }

      /* ---- the whole session: what the camera was asked to do ---- */
      run.sentCount = sent.length;
      run.resetSent = sent.some((s) => s.op === OP_RESET_DEVICE);
      /* BeginFirmwareUpgrade with subcommand 0 is the write path's forbidden selector. The
       * reader arms mode 0 on the 2014 chain to read the active-slot word, a read, so only the
       * requests from the refusal on (the write path's) are checked. A payload opens with its
       * subcommand, a little-endian u16. */
      run.subcmd0Armed = sent
        .slice(writeFrom)
        .some(
          (s) =>
            s.op === OP_BEGIN_FIRMWARE_UPGRADE &&
            s.data.length >= 2 &&
            viewOf(s.data).getUint16(0, true) === 0,
        );
    } finally {
      await transport.close();
    }
  });
}
