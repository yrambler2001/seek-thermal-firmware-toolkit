/* ==================================================================== *
 * Reading what a camera is actually running.
 *
 * This is the analysis the write path is built from: this camera's Key A, the
 * slot an upgrade would land in, and a footer template taken off the device.
 * Every one of those is a property of ONE camera, which is why the result is
 * RETURNED rather than stashed in a module global the way the original page's
 * `deviceState` was — carrying it across a device swap is how a payload built
 * for one unit gets sent to another.
 *
 * The careful distinction this file exists to preserve: "this slot decrypts
 * under its own key" and "the bootloader can key this slot" are different
 * questions. The GF(2) solve recovers whatever keystream a slot was written
 * with, so every slot decrypts and can pass the acceptance sum;
 * `image_try_keys()` only ever tries the store key and Key A. `identifyKey`
 * keeps those apart, and nothing here re-conflates them.
 * ==================================================================== */

import {
  asciiz,
  bytesToHex,
  findAll,
  hex,
  hexToBytes,
  hexUp,
  sha256hex,
  viewOf,
} from '../bytes.js';
import { CancelledError, errorMessage } from '../errors.js';
import { decryptImage } from '../crypto/cipher.js';
import {
  findKeyCandidates,
  identifyKey,
  keyFromState,
  pickKeyTable,
  stateFromKey,
  storeKeyOf,
  UNNAMED_KEY,
  type KeyIdentity,
  type PickedKeyTable,
  type StoreKey,
} from '../crypto/keys.js';
import { CANDIDATE_K, recoverKeyInfo, slotChainOf } from '../crypto/recover.js';
import { sameState, type Xorshift128State } from '../crypto/xorshift128.js';
import {
  bankPayloadSize,
  footerOffsetFor,
  FOOTER_TAG,
  HEADER_OFFSET,
  HEADER_SIZE,
  IMAGE_MAGIC,
  parseFooter,
  parseImageHeader,
  TRY_KEYS_MAX_LEN,
  type ImageFooter,
  type ImageHeader,
} from '../image/header.js';
import { WINDOW_SIZE } from '../protocol/ops.js';
import type { SeekDevice } from '../protocol/client.js';
import { wordSum32 } from '../image/bank.js';
import { FPS_MEASURED_HZ, identifyFpsImage } from '../preservation/fps-patch.js';
import { KEY_PAIRS, locateFFKeys } from '../preservation/patch.js';
/* boot-choice.ts imports nothing that writes (the frame-rate warning built on it is fps-boot-warning.ts),
 * so this read names the next start through the function the page and the CLI call, with no cycle. */
import { bootChoiceOf, bootRuleKnown } from '../slots/boot-choice.js';
import { FF_1308_VERSION } from '../slots/capability-family.js';
import { ffKeyBPlainOf } from '../slots/ff-form.js';
import { onCompactPro2016Line } from '../slots/running.js';
/* The stale-descriptor predicate, shared with the preservation pipeline's
 * boot-config check rather than re-worded: a spent reader serves the same
 * shape into any window. `preservation/windows.ts` imports nothing from
 * `workflows/`, so this edge is acyclic. Its `spentReaderRefusal` TEXT is not
 * reused — that remedy names `preserve --resume`, which is wrong advice here. */
import { isStaleDescriptorWord } from '../preservation/windows.js';
import { LEGACY_BOOT, legacyUpgradeTargetBuild } from '../profiles/legacy-auth.js';
import { bankOfActiveSlotWord, bankWordsOf, enteredChecked } from '../profiles/locked-boot.js';
import { detectProfile, requireCapability } from '../profiles/registry.js';
import type {
  BootPrediction,
  DeviceEvidence,
  FirmwareProfile,
  SlotDescriptor,
  SlotKey,
  WindowEntry,
  WindowPlan,
} from '../profiles/types.js';
import {
  entryForAddress,
  resolveDumpOptions,
  type BankVerdicts,
  type CheckKey,
  type DeviceState,
  type DumpOptions,
  type SlotState,
  type WorkflowContext,
  warnIfRecipientFellBack,
} from './types.js';
import { channelEvidenceOf } from './capability.js';
import { planForDevice } from './window-plan.js';

/** Bytes of the bootloader block scanned for the key table. */
const BOOT_BLOCK_BYTES = 0x8000;
/** Bytes of the boot-config block read: cfg[0..3] plus room for the slot table. */
const BOOT_CONFIG_BYTES = 0x120;

/* ---- one slot ------------------------------------------------------- */

interface RawSlot {
  readonly present: boolean;
  readonly reason: string | null;
  /**
   * True when the slot was not read: the read threw, or the plan has no window
   * for it and nothing was armed. A clean read of an empty slot is false.
   */
  readonly unread?: boolean;
  /**
   * The window came back blank — every byte of the capture's header window is
   * 0xFF. An erased bank reads exactly this, so on its own it is NOT an unread
   * slot; `readDeviceInfo` reclassifies only when every window served blank.
   */
  readonly blank?: boolean;
  /**
   * The window served a spent reader's stale descriptor — the previous arm's
   * head, not this bank's content. Unlike a blank capture this is unambiguous
   * (an erased bank holds 0xFF, not a vector table), so the slot is unread.
   */
  readonly spent?: boolean;
  readonly header: ImageHeader | null;
  readonly raw: Uint8Array | null;
  readonly footer: ImageFooter | null;
}

/* ---- what a spent window reader serves -------------------------------- */

/**
 * The remedy every spent-reader diagnosis here names. Worded for the info and
 * dump paths: `preservation/windows.ts`' `spentReaderRefusal` sends the user to
 * `preserve --resume`, which is the wrong instruction after `seek-fw info`.
 */
export const SPENT_READER_REMEDY =
  'the window reader may be spent for this boot; power-cycle the camera and retry';

/** The whole-read refusal, when no window served bank content. */
export function spentReaderDiagnosis(): string {
  return `the camera's slots could not be read — ${SPENT_READER_REMEDY}`;
}

/**
 * True when the header window of a slot capture is blank — every byte 0xFF.
 *
 * `head` is the capture's first `HEADER_OFFSET + HEADER_SIZE` bytes, the part
 * every later stage parses, so a capture blank there has no image to analyse
 * whatever followed. An all-0xFF capture is this case read wide.
 */
export function blankSlotCapture(head: Uint8Array): boolean {
  return head.every((byte) => byte === 0xff);
}

/**
 * Why a slot capture reads as a spent reader's stale descriptor rather than as
 * the bank's content, or null when it does not.
 *
 * THE SIGNATURE IS MEASURED, on the 2026-10-02 incident. A spent reader re-serves
 * its staged buffer from offset 0, so the next window's read gets the PREVIOUS
 * window's head — on that run, the bootloader block's vector table: word 0 an
 * SRAM address (0x10018000, the bootloader's initial SP) and word 1 a reset
 * vector pointing into the bootloader block itself (0x1400xxxx). A real bank's
 * capture never carries that pair: its word 0 is an SRAM stack pointer too, but
 * its reset vector points into its OWN bank (0x1405xxxx and up), never at
 * 0x14000000's block. The SRAM half is `isStaleDescriptorWord`, the same stale
 * descriptor the boot-config check catches.
 *
 * WHY IT IS CHECKED BEFORE THE HEADER PARSE: wrong bytes solve to a keystream
 * that sums to anything, and on that run a profile probe scored the camera
 * `compact-2016` (0.9, "a slot decrypts to the 0x00000000 acceptance sum") on
 * bytes no bank ever held. A capture with this signature never reaches the
 * cipher analysis that feeds family scoring.
 */
export function staleDescriptorCapture(head: Uint8Array): string | null {
  if (head.length < 8) return null;
  const dv = viewOf(head);
  const word0 = dv.getUint32(0, true);
  const reset = dv.getUint32(4, true);
  if (!isStaleDescriptorWord(word0)) return null;
  if (reset >>> 16 !== 0x1400) return null;
  return (
    `the window served a stale reader descriptor's bytes — word 0 ${hexUp(word0)} with reset ` +
    `${hexUp(reset)} is 0x14000000's vector table, not this bank's content, so nothing was ` +
    `analysed from it: ${SPENT_READER_REMEDY}`
  );
}

/**
 * Read one slot: enough for the header, then out to the end of its bank so the
 * "CODE" footer comes along too. Reads are sequential from the armed window, so
 * this is a single arm and two continuing reads.
 */
async function readSlot(
  device: SeekDevice,
  entry: WindowEntry,
  chunk: number,
  onChunk: (n: number) => void,
): Promise<RawSlot> {
  const none = (reason: string, header: ImageHeader | null): RawSlot => ({
    present: false,
    reason,
    header,
    raw: null,
    footer: null,
  });

  await device.armWindow(entry);
  const probeLen = HEADER_OFFSET + HEADER_SIZE;
  const head = await device.readArmed(chunk, probeLen, onChunk);
  if (head.data.length < probeLen) {
    return none(`short read (${String(head.data.length)} B)`, null);
  }

  /* A spent reader's bytes parse into no honest header, and they must never
   * reach the cipher analysis that feeds family scoring — so both signatures
   * are checked before `parseImageHeader`, which will happily build a header
   * out of 0xFFFFFFFF or out of a stale descriptor's tail. See the helpers
   * above for the measured signatures. */
  const stale = staleDescriptorCapture(head.data);
  if (stale !== null) {
    return {
      present: false,
      reason: stale,
      unread: true,
      spent: true,
      header: null,
      raw: null,
      footer: null,
    };
  }
  if (blankSlotCapture(head.data)) {
    /* A blank window is an erased bank as often as a spent reader — a stock
     * camera legitimately carries an erased bank — so this keeps today's
     * classification (a clean read that holds no image, NOT an unread slot);
     * `readDeviceInfo` reclassifies only when EVERY window served blank. The
     * reason is the same line a blank capture has always reported. */
    return {
      present: false,
      reason: `no image header (magic ${hexUp(0xffffffff)})`,
      blank: true,
      header: null,
      raw: null,
      footer: null,
    };
  }

  const header = parseImageHeader(head.data);
  if (header === null) return none('could not parse an image header', null);
  if (header.magic !== IMAGE_MAGIC) {
    return none(`no image header (magic ${hexUp(header.magic)})`, header);
  }
  if (header.length < HEADER_OFFSET || header.length >= TRY_KEYS_MAX_LEN || header.length & 3) {
    return none(`header.length ${hexUp(header.length)} is out of range`, header);
  }

  const total = bankPayloadSize(header.length);
  const rest = await device.readArmed(chunk, total - head.data.length, onChunk);
  const raw = new Uint8Array(head.data.length + rest.data.length);
  raw.set(head.data, 0);
  raw.set(rest.data, head.data.length);
  if (raw.length < total) {
    return none(`bank read stopped at ${String(raw.length)}/${String(total)} B`, header);
  }

  return {
    present: true,
    reason: null,
    header,
    raw,
    footer: parseFooter(raw, footerOffsetFor(header.length)),
  };
}

interface AnalysedSlot extends RawSlot {
  readonly recovered: ReturnType<typeof recoverKeyInfo> | null;
  readonly plain: Uint8Array | null;
  readonly plainHeader: ImageHeader | null;
  readonly accepts: boolean;
  readonly footerOk: boolean;
  readonly sha256: string | null;
  /** The bank holds the 1.3.0.8 FF image under Key B (ff-form.ts): `plain` is that image, decoded. */
  readonly ffKeyB?: boolean;
}

/**
 * Recover the slot's keystream state from its own ciphertext (the same GF(2)
 * solve the dump view uses), decrypt it, and check the bootloader's acceptance
 * sum.
 */
async function analyseSlot(slot: RawSlot, profile: FirmwareProfile): Promise<AnalysedSlot> {
  if (!slot.present || slot.raw === null || slot.header === null) {
    return {
      ...slot,
      recovered: null,
      plain: null,
      plainHeader: null,
      accepts: false,
      footerOk: false,
      sha256: null,
    };
  }
  /* The 1.3.0.8 FF image under Key B (ff-form.ts): its keystream is the image's own key block 1, which
   * the solve below does not reach (its header window is verbatim, so the solve reads it wrongly). */
  const keyB = ffKeyBPlainOf(slot.raw);
  if (keyB !== null) {
    return {
      ...slot,
      recovered: null,
      plain: keyB,
      plainHeader: parseImageHeader(keyB),
      accepts: false,
      footerOk: false,
      sha256: await sha256hex(keyB),
      ffKeyB: true,
    };
  }
  const view = viewOf(slot.raw);
  const recovered = recoverKeyInfo(view, 0, slot.header.length, profile.cipher);
  const plain = decryptImage(view, 0, slot.header.length, recovered.state, profile.cipher);
  return {
    ...slot,
    recovered,
    plain,
    plainHeader: parseImageHeader(plain),
    accepts: recovered.checksum === profile.cipher.acceptanceSum,
    footerOk:
      slot.footer !== null &&
      slot.footer.tag === FOOTER_TAG &&
      slot.footer.length === slot.header.length,
    sha256: await sha256hex(plain),
  };
}

/* ---- the 2014 plaintext chain ----------------------------------------- */

/**
 * The identity keystream. A slot whose GF(2) solve comes back in this state
 * decrypts to itself: the stored bytes ARE the image, word for word.
 */
const IDENTITY_STATE: Xorshift128State = Uint32Array.of(0, 0, 0, 0);

/**
 * Is this slot stored PLAIN — the 2014 chain's at-rest form?
 *
 * The test is the identity keystream, NOT the acceptance sum: the solve reads
 * the slot's own reserved vectors, so an all-zero state means the stored words
 * there really are zero, i.e. nothing was XORed into the image. A cipher-chain
 * slot can also produce a zero acceptance sum (the 1.0.3.x builds decrypt to
 * 0) but its recovered state is a real key's, and staging its bytes verbatim
 * would write ciphertext where the chain wants an image. The sum condition on
 * top is the chain bootloader's own acceptance: stored words sum 0.
 */
function storedPlain(slot: AnalysedSlot): boolean {
  return (
    slot.present &&
    slot.recovered !== null &&
    slot.plainHeader !== null &&
    slot.recovered.sane &&
    sameState(slot.recovered.state, IDENTITY_STATE) &&
    slot.recovered.checksum === 0
  );
}

/**
 * The locked line's write path for an image staged plain needs the 2014 plaintext chain, and a read
 * with no bank stored plain is not proven to be on it. The flash gate carries this among the classic
 * writer's reasons (`classicWriterBlockedBy`); the slot writer refuses a plain-staged image with it
 * (slots/write.ts), because the slot page's camera-wide gate drops the classic reasons on that line.
 */
export const PLAIN_CHAIN_ONLY_REASON =
  'the write path on this line is implemented only for the 2014 plaintext chain — banks ' +
  'stored plain, word sum 0, no key material — and no bank this read opened is stored ' +
  'that way';

/** The 2014 bootloader (the original Compact and the 8 Hz 1.3.0.8 build run on it; TESTING.md 42.10). */
const LEGACY_2014_BOOTLOADER = '0.9.0.0';

/**
 * Is this bank the 1.3.0.8 FF (16 Hz) image in recovery R, on the 2014 bootloader? Its stored word
 * sum is not 0 and it carries the FF key pair, so the 2014 bootloader takes no bank with it and
 * recovery runs it only when A and B hold nothing the bootloader takes (TESTING.md 42.10: steps 4,
 * 2c and 7 ran it from R with A and B empty; steps 6a and 6c passed over the same form at A and B).
 * On the FF platform's bootloader (2.0.2.3) that was not measured for this form, and the two-stream
 * form in R booted from no bank alone (TESTING.md 42.11b), so the label is not given there.
 */
function ffFormInRecovery(
  key: SlotKey,
  slot: AnalysedSlot,
  bootloaderVersion: string | null,
): boolean {
  if (bootloaderVersion !== LEGACY_2014_BOOTLOADER) return false;
  if (key !== 'r' || !slot.present || slot.raw === null || slot.header === null) return false;
  const image = slot.raw.subarray(0, slot.header.length);
  return (
    wordSum32(image, image.length) !== 0 && (slot.ffKeyB === true || locateFFKeys(image) !== null)
  );
}

/**
 * The camera's own per-bank answers on 1.3.0.8: GetFirmwareInfo selectors 6, 7, 8, one byte each,
 * 1 when the application that answers takes the bank at 0x14050000 / 0x14060000 / 0x14070000.
 * SetFirmwareInfoFeatures latches the selector and the GetFirmwareInfo read returns the byte and
 * clears it; nothing is armed and nothing is written (FW-V1 compact_8hz and compact_ff_16hz
 * cmd_GetFirmwareInfo cases 6 to 8, TESTING.md 42.12). Read only on 1.3.0.8, where two builds share the
 * version string.
 */
async function readBankVerdicts(
  device: SeekDevice,
  reporter: WorkflowContext['reporter'],
): Promise<BankVerdicts> {
  const answerOf = async (selector: number, label: string): Promise<number | null> => {
    const got = await device.tryFwInfo(selector, 1, label);
    return got !== null && got.length >= 1 ? (got[0] ?? null) : null;
  };
  const verdicts: BankVerdicts = {
    a: await answerOf(6, 'bank A verdict'),
    b: await answerOf(7, 'bank B verdict'),
    r: await answerOf(8, 'bank R verdict'),
  };
  reporter.log(
    `  bank verdicts (selectors 6, 7, 8): A ${String(verdicts.a)}, B ${String(verdicts.b)}, R ${String(verdicts.r)}`,
    'detail',
  );
  return verdicts;
}

/**
 * Why a slot the running firmware's plan does not reach was not read.
 *
 * NO SUBCOMMAND IS GUESSED IN ITS PLACE. The slot descriptor carries one, but
 * that number is the profile's label for the slot on the builds it was decoded
 * from. On the camera in front of us only the plan says what arms what, and a
 * plan with no window at this address (`compact-2014` plans none at all, for
 * any version) is that firmware's answer. This read used to fall back to the
 * descriptor's subcommand, so a `compact-2014` read of a camera past the
 * identity gate armed 7, 8 and 9 under a profile whose plan reads nothing.
 */
function notInPlan(plan: WindowPlan, version: string | null, address: number): string {
  return (
    `not readable on firmware ${version ?? 'of unknown version'}: its plan (${plan.table}) has ` +
    `no window at ${hex(address, 8)}, so nothing was armed for it`
  );
}

/**
 * The upgrade-target selector, if the running firmware's own table has it.
 *
 * The profile's boot policy names the subcommand an upgrade arms (0 on the
 * post-2018 line, none on the legacy line); whether THIS build switches on it
 * is its table's to say. The camera computes the block, so the row carries no
 * address, but it has to be there, and plain, because the read-back here sends
 * the plain 2-byte payload.
 */
function upgradeSelectorIn(plan: WindowPlan, profile: FirmwareProfile): number | null {
  const subcmd = profile.boot.updateTargetSubcmd;
  if (subcmd < 0) return null;
  return plan.selectors.some((row) => row.subcmd === subcmd && row.channel === 'plain')
    ? subcmd
    : null;
}

/* ---- upgrade-target confirmation ------------------------------------ */

/**
 * Arm the selector an upgrade uses and read its first bytes back, then see
 * which slot those bytes came from. This is a plain read — the write only ever
 * happens at CompleteMemoryUpgrade — and it turns "which slot would be written"
 * from an inference into an observation. Returns null when it cannot tell,
 * which is the normal case on a camera whose slots hold identical images.
 */
async function confirmUpgradeTarget(
  ctx: WorkflowContext,
  chunk: number,
  subcmd: number,
  address: number,
  byKey: ReadonlyMap<SlotKey, AnalysedSlot>,
): Promise<SlotKey | null> {
  const probeLen = HEADER_OFFSET + HEADER_SIZE;
  let head;
  try {
    await ctx.device.armWindow({ subcmd, address, note: 'upgrade target' });
    head = await ctx.device.readArmed(chunk, probeLen);
  } catch (error) {
    if (error instanceof CancelledError) throw error;
    ctx.reporter.log(`  could not probe the upgrade window: ${errorMessage(error)}`, 'detail');
    return null;
  }
  if (head.data.length < probeLen) return null;

  const matches = (['a', 'b'] as const).filter((key) => {
    const slot = byKey.get(key);
    if (!slot?.raw || slot.raw.length < probeLen) return false;
    for (let i = 0; i < probeLen; i++) if (slot.raw[i] !== head.data[i]) return false;
    return true;
  });
  if (matches.length !== 1) {
    ctx.reporter.log(
      `  selector ${hex(subcmd)}'s window matches ${matches.length ? 'both slots' : 'neither slot'}` +
        ' — the slots are identical, so the target cannot be read off the wire',
      'detail',
    );
    return null;
  }
  return matches[0] ?? null;
}

/* ---- the locked line's boot, and the 2016 line's check key ------------- */

/**
 * What the read says about writing a 2016 camera. The slot writer stages each bank under its image's own
 * key block 0 (slots/write.ts, `buildSlotKeystreamPayload`) and the camera re-keys it, so none of the
 * whole-image writer's reasons (its key table, its 2014-only staging, the profile's flash capability, the
 * upgrade target) applies to it; this one line says so in their place.
 */
export const BANKS_ONLY_WRITING =
  "writing: the Slots tab (`seek-fw slots`) writes this camera's banks one at a time, each staged " +
  "under its image's own key block 0; a whole-image write is not available on the 2016 line";

/** The known 2016 image pairs whose block 1 a check key can be, by name (preservation/patch.ts KEY_PAIRS). */
const PAIRS_2016: readonly (readonly [string, string])[] = [
  ['the Compact PRO 1.0.3.x 9 Hz pair', KEY_PAIRS.cp103.block1],
  ['the Compact PRO 1.0.3.x FF pair', KEY_PAIRS.cp1032ff.block1],
];

/**
 * The version word above which a 2016 bootloader seeds its device-seeded stream from its own key block 1,
 * and at or below which from the four device words at 0x40045000 XOR key block 0 (FW-V1
 * targets/compact_pro_9hz_1_0_3_0_bootloader/src/crypto.c:233-249, `prng_seed_device_or_key`, the test
 * `v <= 0x01010000`; the FF bootloader's crypto.c:238 is the same). Both 2016 bootloaders FW-V1
 * reconstructs (the 1.0.3.0 9 Hz and FF targets) are 1.2.0.0, as is the one the bench Compact PRO reports,
 * so the cameras measured so far are on the block-1 side.
 */
const DEVICE_WORDS_LAST_VERSION = 0x01010000;

/** What `checkKeyOf` reads of a bank: whether it was read, whether it decrypts to a zero sum, and its keystream. */
export type CheckKeyBank = Pick<AnalysedSlot, 'present' | 'accepts' | 'recovered'>;

/** The name the read gives the key a 2016 bootloader checks a bank under, from its own version. */
export function checkKeyNameOf(bootloaderVersion: string | null): string {
  const parts = (bootloaderVersion ?? '').split('.').map((part) => Number.parseInt(part, 10));
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return 'the device-seeded key';
  }
  const [a = 0, b = 0, c = 0, d = 0] = parts;
  const word = ((a << 24) | (b << 16) | (c << 8) | d) >>> 0;
  return word > DEVICE_WORDS_LAST_VERSION ? 'key block 1' : 'the device key';
}

/**
 * The key a 2016 bootloader checks a bank under, named from the bank the camera reports it entered.
 *
 * THE CHECK. boot_select_image (FW-V1 targets/compact_pro_9hz_1_0_3_0_bootloader/src/image.c:1076-1109)
 * enters a bank only after `image_sum_ok_device_seeded` passes on it (hand_spifi.c:35-44: the magic, a
 * length under 0x10000, and a zero word sum of the bank decrypted under the device-seeded stream), except
 * the last bank of the word's order, which it enters unchecked (profiles/locked-boot.ts).
 *
 * WHY IT IS READ FROM A BANK. The key sits in the bootloader block, which 1.0.3.x refuses on every channel,
 * so no key table is read on this line. But the bootloader records the bank it entered (startup.c:187-195,
 * handoff->slot; selector 10's word, TESTING.md 42.53, 42.56). When the word's rule checked that bank
 * before entering it, the bank decrypts to a zero sum under the device-seeded stream, and the keystream
 * the read recovers from that bank's own bytes (the GF(2) solve) IS that stream. A bank entered last,
 * unchecked, proves nothing about the check, so it names no key here.
 *
 * WHY IT STAYS TRUE AFTER A WRITE. The application seeds the same stream from the bootloader's record
 * (targets/compact_pro_9hz_1_0_3_0/src/crypto.c:291-329 reads the version through the boot record's first
 * word, which the bootloader sets to its own build record, startup.c:187), and stores every bank it writes
 * under it (rpc_cmds.c:1786-1812, modes 7 to 9: block-0 check, `stream_xor_key_and_device_seeded`, then
 * `image_sum_ok_device_seeded` before erasing). So a bank the camera wrote since its last start is under the
 * same key. [inferred] The warm-boot path (image.c:1081-1089) records word 2 and enters R unchecked; R then
 * still runs decrypted under the device-seeded stream (startup.c:168-185), so the key it names is the same.
 *
 * Pure: `slotOf` hands it each bank as the read analysed it. Exported for the tests.
 */
export function checkKeyOf(input: {
  readonly cfg0: number | null;
  readonly activeSlotWord: number | null;
  readonly bootloaderVersion: string | null;
  readonly whiteningK: number;
  readonly slotOf: (key: SlotKey) => CheckKeyBank | undefined;
}): CheckKey {
  const unnamed = (reason: string): CheckKey => ({
    name: null,
    key: null,
    from: null,
    pair: null,
    unnamedWhy: reason,
    why: `check key not named: ${reason}, so whether the bootloader takes each bank is not known`,
  });
  if (input.activeSlotWord === null) {
    return unnamed("the camera's active-slot word (fw info roots, selector 10) could not be read");
  }
  const entered = bankOfActiveSlotWord(input.activeSlotWord);
  if (entered === null) {
    return unnamed(
      `the camera's active-slot word is ${String(input.activeSlotWord)}, which names no bank`,
    );
  }
  const bank = bankWordsOf(entered);
  if (input.cfg0 === null) {
    return unnamed(
      `the boot-config word was not read, so whether the bootloader checked ${bank} before it ` +
        'entered it is not known',
    );
  }
  if (!enteredChecked(input.cfg0, entered)) {
    return unnamed(
      `the camera entered ${bank}, which the boot-config word ${hexUp(input.cfg0)} leaves to last, ` +
        'and the bootloader enters that bank without its check',
    );
  }
  const slot = input.slotOf(entered);
  const state = slot?.recovered?.state ?? null;
  if (slot === undefined || !slot.present || state === null || !slot.accepts) {
    return unnamed(
      `the camera reports it entered ${bank}, but ${bank} does not decrypt to a zero word sum on ` +
        'this read',
    );
  }
  const key = keyFromState(state, input.whiteningK);
  const pair =
    PAIRS_2016.find(([, block1]) =>
      sameState(state, stateFromKey(hexToBytes(block1), input.whiteningK)),
    )?.[0] ?? null;
  const name = checkKeyNameOf(input.bootloaderVersion);
  return {
    name,
    key,
    from: entered,
    pair,
    unnamedWhy: null,
    why:
      `check key: ${name} ${bytesToHex(key)}${pair === null ? '' : ` (${pair}'s block 1)`}, named ` +
      `from ${bank}: the 2016 bootloader enters a bank only after it decrypts to a zero word sum under ` +
      `this key, and the camera reports it entered ${bank} after that check`,
  };
}

/** Which key a 2016 bank is stored under, against the check key, and whether the bootloader takes it. */
function checkKeyIdentity(slot: AnalysedSlot, checkKey: CheckKey, whiteningK: number): KeyIdentity {
  const state = slot.recovered?.state ?? null;
  if (state === null) return { name: null, bootable: false };
  if (checkKey.key === null || checkKey.name === null) {
    return { name: UNNAMED_KEY, bootable: false };
  }
  const same = sameState(state, stateFromKey(checkKey.key, whiteningK));
  return { name: same ? checkKey.name : UNNAMED_KEY, bootable: same && slot.accepts };
}

/**
 * Why a bank's bootability is unknown, in the words the read, the page and the CLI use: on the 2016 line
 * the key its bootloader checks a bank under was not named (`checkKeyOf`); elsewhere the bootloader's key
 * table was not read, so the keys it tries cannot be named.
 */
export function unknownBootabilityWhy(state: Pick<DeviceState, 'checkKey'>): string {
  return state.checkKey != null
    ? 'the key its bootloader checks a bank under was not named on this read'
    : "the bootloader's key table was not read, so the keys it tries cannot be named";
}

/**
 * The frame rate a decrypted image carries, for its bank's line: a patched table entry (at its measured
 * rate where one is recorded, as fps-boot-warning.ts `fpsPatchHeldBy` gives it) or a corpus build of a
 * known rate.
 */
export function frameRateNote(plain: Uint8Array | null): string {
  if (plain === null) return '';
  const identity = identifyFpsImage(plain);
  const patched = identity.patchedEntries[0];
  if (patched !== undefined) {
    return `, frame-rate patch ${String(FPS_MEASURED_HZ.get(patched.id) ?? patched.targetHz)} Hz`;
  }
  /* A corpus build of a known rate, said without its table name (compact_pro-1.0.3.0-FF is an id, not a
   * name a person reads; TESTING.md 42.86). */
  if (identity.known !== null) return `, runs at ${String(identity.known.hz)} Hz`;
  return '';
}

/**
 * The locked line's two boot lines: the bank the camera reports it entered at this start, and the bank
 * the next start runs, from the boot-config word and each bank's check (slots/boot-choice.ts
 * `bootChoiceOf`, the function the page and the CLI call). Only the lines whose bank check is decoded name
 * them (`bootRuleKnown`); the line's other builds get one line saying why.
 */
function lockedBootLines(
  state: Pick<
    DeviceState,
    'cfg0' | 'activeSlotWord' | 'byKey' | 'profile' | 'version' | 'checkKey' | 'plainChain'
  >,
): (readonly [string, 'detail' | 'warn'])[] {
  if (!bootRuleKnown(state)) {
    return [
      [
        `boot prediction unavailable on firmware ${state.version ?? '(unread)'} read under ` +
          `${state.profile.id}: the bank a start runs is named only where the bootloader's bank ` +
          'check is decoded, the 2014 plaintext chain (a bank stored plain) and the 2016 Compact PRO ' +
          'read under compact-2016',
        'warn',
      ],
    ];
  }
  const lines: (readonly [string, 'detail' | 'warn'])[] = [];
  const choice = bootChoiceOf(state);
  if (state.activeSlotWord === null) {
    lines.push([
      "last start: not known — the camera's active-slot word (fw info roots, selector 10) could not be read",
      'warn',
    ]);
  } else if (choice.reportedBooted === null) {
    lines.push([
      `last start: not known — the camera's active-slot word is ${String(state.activeSlotWord)}, which names no bank`,
      'warn',
    ]);
  } else {
    lines.push([
      `last start: the camera reports it entered ${bankWordsOf(choice.reportedBooted)} (active-slot ` +
        `word ${String(state.activeSlotWord)}, the bootloader's record)`,
      'detail',
    ]);
  }
  lines.push(
    choice.runs === null
      ? [`next start: not known — ${choice.why}`, 'warn']
      : [`next start: ${bankWordsOf(choice.runs)} — ${choice.why}`, 'detail'],
  );
  return lines;
}

/**
 * The flash gate's reasons that refuse every bank of the camera for the slot writer, from the gate's own
 * lists. Dropped: the running application's missing pair (`appKeysBlock`, which the write-key derivation
 * replaces), an unread bank (its row says so, and only that bank is refused), the upgrade flow's reasons
 * (the slot writer names its bank and arms that bank's own window), and, when `dropClassic`, the classic
 * whole-image writer's reasons (`classicWriterBlockedBy`: its key table, its 2014-only staging, the
 * profile's flash capability), which do not apply to a build that stages each image under its own keys.
 * The slot page's banner (slots/write-keys.ts `gateWithoutAppKeys`) and the read's own log both use it.
 */
export function cameraWideBlocks(
  state: Pick<
    DeviceState,
    'flashBlockedBy' | 'upgradeBlockedBy' | 'classicWriterBlockedBy' | 'appKeysBlock' | 'slots'
  >,
  dropClassic: boolean,
): string[] {
  const unread = new Set(state.slots.filter((slot) => slot.unread).map(unreadSlotBlock));
  const upgrade = new Set(state.upgradeBlockedBy ?? []);
  const classic = new Set(dropClassic ? (state.classicWriterBlockedBy ?? []) : []);
  return state.flashBlockedBy.filter(
    (why) =>
      why !== (state.appKeysBlock ?? null) &&
      !unread.has(why) &&
      !upgrade.has(why) &&
      !classic.has(why),
  );
}

/* ---- the read -------------------------------------------------------- */

/**
 * Read and analyse everything the flash path depends on.
 *
 * NEW versus the original: the evidence gathered along the way is fed to
 * `detectProfile`, so the returned state carries what the camera looks like as
 * well as what it was read as. `canFlash` additionally requires the acting
 * profile to declare `flash` supported — a read-only profile cannot be talked
 * into a write by a camera that happens to look right.
 */
export async function readDeviceInfo(
  ctx: WorkflowContext,
  options: Partial<DumpOptions> = {},
): Promise<DeviceState> {
  requireCapability(ctx.profile, 'deviceInfo');
  const args: DumpOptions = resolveDumpOptions(options);
  const { device, profile, reporter } = ctx;
  const chunk = args.chunk;
  const readAt = new Date().toISOString();

  /* Which channel each bank actually armed on, which falls out of doing the
   * reads anyway. Only SUCCESSES land here — `armWindow` throws on a refusal
   * rather than returning — so nothing built from this list can say a channel
   * was refused, only that one worked. The banks that reach it are the ones the
   * legacy firmware locks behind the authenticated channel (boot config, the
   * image slots) plus the bootloader block at flashBase, which the 2016-2017
   * builds refuse on every channel and the 2014 builds from 0.9.0.2 arm with
   * the token. */
  const armedBanks: WindowEntry[] = [];
  const noteArmed = (entry: WindowEntry): void => {
    armedBanks.push(entry);
  };

  /* THE BUILD FIRST, AND NOTHING ELSE UNTIL IT IS KNOWN. This read used to
   * open with `tryFwInfo(0)` — SetFirmwareInfoFeatures, a SETTER — and to arm
   * the boot config, the bootloader block and the slots whatever the version
   * said, or whether it said anything: on 0.3.0.1 every one of those arms is
   * `EnterBootloaderMode`. It now goes through the dump's own gate: one
   * unarmed GetFirmwareInfo (in `SAFE_BEFORE_IDENTITY`), a refusal for no
   * version or a build that predates the dump protocol, and otherwise THIS
   * build's own table for every arm below. Selector 0 of GetFirmwareInfo is
   * the build block, so the unarmed read is the same bytes `tryFwInfo(0)` got. */
  const { firmware, plan } = await planForDevice(ctx, 'read the device info');
  const version = firmware.version;
  const buildString = firmware.buildString;
  /* EVERY ARM BELOW COMES FROM THIS PLAN, and a block it has no window for is
   * reported as not readable on this firmware rather than armed some other
   * way: the boot config, the bootloader block, each slot, and the upgrade
   * target, which must be a row of this build's table too. `let` because the
   * 2014 plaintext chain sets it from the build's own decoded mode-0 row once
   * the chain has been identified from the slots. */
  const entries = plan.windows;
  let updateTargetSubcmd = upgradeSelectorIn(plan, profile);
  /* The 2016 Compact PRO line, read under its own profile: its bootloader's check and its boot record are
   * decoded (profiles/locked-boot.ts, `checkKeyOf`), so this read names the key the banks are checked under
   * and both starts. Under legacy-auth its banks are compared against the 2014 line's target, and the
   * detection below says so instead. */
  const line2016 = onCompactPro2016Line(profile, version);
  warnIfRecipientFellBack(ctx);

  reporter.log('firmware info selectors ...', 'detail');
  const boot = await device.tryFwInfo(1, 36, 'bootloader info');
  const bootloaderVersion =
    boot && boot.length >= 4 ? [boot[0], boot[1], boot[2], boot[3]].join('.') : null;
  const bootloaderString = boot && boot.length >= 4 ? asciiz(boot.subarray(4)) : null;

  const platformRaw = await device.tryFwInfo(20, 64, 'platform string');
  const platform = platformRaw ? asciiz(platformRaw) : null;

  const speed = await device.tryFwInfo(17, 2, 'USB port speed');
  let usbSpeed: string | null = null;
  if (speed && speed.length >= 2) {
    const bits = viewOf(speed).getUint16(0, true);
    usbSpeed =
      bits === 2 ? 'high (480 Mbit/s)' : bits === 0 ? 'full (12 Mbit/s)' : `code ${String(bits)}`;
  }

  const roots = await device.tryFwInfo(10, 64, 'firmware info roots');
  const activeSlotWord = roots && roots.length >= 12 ? viewOf(roots).getUint32(8, true) : null;

  const serial = await device.readSerial();
  if (version !== null) {
    reporter.log(`  running firmware ${version}${buildString ? `  ${buildString}` : ''}`, 'ok');
  }
  if (bootloaderString) reporter.log(`  bootloader ${bootloaderString}`, 'detail');
  if (serial !== null) reporter.log(`  serial ${serial}`, 'detail');

  /* ---- boot config ------------------------------------------------- */
  let cfg0: number | null = null;
  let cfgSlots: readonly number[] | null = null;
  const cfgEntry = entryForAddress(entries, profile.memory.bootConfigBase);
  reporter.log('');
  if (cfgEntry === null) {
    reporter.log(
      `no selector reaches the boot config at ${hex(profile.memory.bootConfigBase, 8)} on ` +
        `${profile.name} — boot prediction will be unavailable`,
      'warn',
    );
  } else {
    reporter.log(`boot config at ${hex(cfgEntry.address, 8)} ...`, 'detail');
    await device.armWindow(cfgEntry);
    noteArmed(cfgEntry);
    const cfg = await device.readArmed(chunk, BOOT_CONFIG_BYTES);
    if (cfg.data.length >= 16) {
      const cv = viewOf(cfg.data);
      cfg0 = cv.getUint32(0, true);
      cfgSlots = [1, 2, 3].map((i) => cv.getUint32(i * 4, true));
      reporter.log(`  cfg[0] = ${hexUp(cfg0)} — ${profile.boot.describeCfg0(cfg0)}`, 'detail');
    }
  }

  /* ---- bootloader block / key material ----------------------------- */
  let deviceKeySlot: Uint8Array | null = null;
  let candidates: ReturnType<typeof findKeyCandidates> = [];
  const bootEntry = entryForAddress(entries, profile.memory.flashBase);
  reporter.log('');
  if (bootEntry === null && line2016) {
    reporter.log(
      `the bootloader block at ${hex(profile.memory.flashBase, 8)} is refused on every channel on ` +
        'the 2016 builds, so no key table is read; the bank the camera entered names the key its ' +
        'bootloader checks a bank under instead (below)',
      'detail',
    );
  } else if (bootEntry === null) {
    reporter.log(
      `no selector reaches the bootloader block at ${hex(profile.memory.flashBase, 8)} on ` +
        `${profile.name} — this camera's key table cannot be confirmed`,
      'warn',
    );
  } else {
    reporter.log(`bootloader block at ${hex(bootEntry.address, 8)} (key material) ...`, 'detail');
    await device.armWindow(bootEntry);
    /* Counts as evidence like the other two arms do. No shipped profile puts
     * this block on a different channel from its boot config, so today it can
     * only confirm what the boot-config arm already said; a family that splits
     * them is exactly the case this was silently missing. */
    noteArmed(bootEntry);
    const bootBlock = await device.readArmed(chunk, BOOT_BLOCK_BYTES);
    const keyAt = profile.memory.deviceKeySlotOffset;
    const keyLen = profile.memory.deviceKeySlotLength;
    deviceKeySlot =
      bootBlock.data.length >= keyAt + keyLen ? bootBlock.data.slice(keyAt, keyAt + keyLen) : null;
    candidates = findKeyCandidates(bootBlock.data, profile.memory.bootConfigBase);
    reporter.log(`  ${String(candidates.length)} key-table candidate(s)`, 'detail');
  }

  /* ---- the slots ---------------------------------------------------- */
  reporter.log('');
  const analysed: AnalysedSlot[] = [];
  /* The selector each slot was armed with, from the plan, or null for none. */
  const armedWith: (number | null)[] = [];
  const descriptors: readonly SlotDescriptor[] = profile.slots;
  const budget = descriptors.length * WINDOW_SIZE; /* upper bound; slots are usually 0xc000 */
  let done = 0;
  for (const descriptor of descriptors) {
    reporter.progress(done, budget, `Reading ${descriptor.name} ...`);
    /* The plan's entry or nothing: see `notInPlan`. */
    const entry = entryForAddress(entries, descriptor.address);
    armedWith.push(entry?.subcmd ?? null);
    let read: RawSlot;
    if (entry === null) {
      read = {
        present: false,
        reason: notInPlan(plan, version, descriptor.address),
        unread: true,
        header: null,
        raw: null,
        footer: null,
      };
    } else {
      reporter.log(`reading ${descriptor.name} at ${hex(descriptor.address, 8)} ...`, 'detail');
      try {
        read = await readSlot(device, entry, chunk, (n) => {
          done += n;
          reporter.progress(done, budget);
        });
        noteArmed(entry);
      } catch (error) {
        if (error instanceof CancelledError) throw error;
        read = {
          present: false,
          reason: errorMessage(error),
          unread: true,
          header: null,
          raw: null,
          footer: null,
        };
      }
    }
    analysed.push(await analyseSlot(read, profile));
  }
  reporter.progress(1, 1, 'Analysing ...');
  /* The camera's own answers for A, B and R, where two builds share the version (see readBankVerdicts). */
  const bankVerdicts: BankVerdicts | null =
    version === FF_1308_VERSION ? await readBankVerdicts(device, reporter) : null;

  /* ---- the spent-reader verdict over the whole read ------------------- */
  /* One blank capture is an erased bank. Blank or stale captures at EVERY slot
   * the plan reached are a reader that served no bank content at all — the
   * 2026-10-02 incident's shape (two backup reads of blank/stale bytes that
   * only a power cycle cleared). Those captures are reclassified as unread, so
   * they report as spent rather than as empty banks and the flash gate refuses
   * on them, and the refusal names the remedy once. A read that got bank
   * content from any slot keeps every other slot's own reading: an empty bank
   * beside a read one is the truth about that bank, not a spent reader, and
   * scoring draws only on the captures that actually read. */
  const served = analysed.filter((s) => s.present || s.blank === true || s.spent === true);
  if (served.length > 0 && served.every((s) => s.blank === true || s.spent === true)) {
    for (let i = 0; i < analysed.length; i++) {
      const slot = analysed[i];
      if (slot?.blank === true) {
        analysed[i] = { ...slot, unread: true, reason: spentReaderDiagnosis() };
      }
    }
    reporter.log('');
    reporter.log(spentReaderDiagnosis(), 'error');
  }

  /* ---- the 2014 plaintext chain -------------------------------------- */
  const plainChain = analysed.some(storedPlain);
  if (plainChain) {
    reporter.log('');
    reporter.log(
      '2014 plaintext chain: a bank is stored plain — the keystream solve returns the ' +
        'identity state and the stored words sum to 0 — so an upgrade stages the image ' +
        'bytes verbatim and needs no key material',
      'ok',
    );
  }

  /* ---- key table ---------------------------------------------------- */
  const states = analysed
    .map((slot) => slot.recovered?.state)
    .filter((state): state is Uint32Array => state !== undefined);

  /* K and the acceptance TARGET are independent axes, so the table is tried
   * under each candidate K rather than only the profile's. The K that matches
   * is remembered: it, not the profile's, is the one an encrypt would have to
   * use, and a disagreement is a reason to refuse to write. */
  let keyTable: PickedKeyTable | null = null;
  let keyWhiteningK = profile.cipher.whiteningK;
  for (const K of [profile.cipher.whiteningK, ...CANDIDATE_K]) {
    const picked = pickKeyTable(candidates, states, K);
    if (picked) {
      keyTable = picked;
      keyWhiteningK = K;
      break;
    }
  }

  if (keyTable) {
    reporter.log('');
    reporter.log(
      `key table at dump offset ${hexUp(keyTable.offset, 6)} — confirmed against a slot's ` +
        'recovered keystream state',
      'ok',
    );
    reporter.log(`  Key A ${bytesToHex(keyTable.keyA)}`, 'detail');
    reporter.log(`  Key B ${bytesToHex(keyTable.keyB)}`, 'detail');
    if (keyWhiteningK !== profile.cipher.whiteningK) {
      reporter.log(
        `  it matches under K=${hexUp(keyWhiteningK)}, not ${profile.name}'s ` +
          `K=${hexUp(profile.cipher.whiteningK)} — writing under the wrong K would produce an ` +
          'image this camera cannot decrypt, so flashing stays disabled',
        'error',
      );
    }
  } else if (plainChain) {
    /* Nothing to confirm: nothing on this chain is encrypted, so no step of an
     * upgrade reads a key — not the arm, not the staging, not the commit. */
    reporter.log('');
    reporter.log('no key table — none is involved on the plaintext chain', 'detail');
  } else if (!line2016) {
    reporter.log('');
    reporter.log("could not confirm this camera's key table — flashing is disabled", 'error');
  }

  /* ---- the 2016 line: the key its bootloader checks a bank under -------- */
  const checkKey: CheckKey | null = line2016
    ? checkKeyOf({
        cfg0,
        activeSlotWord,
        bootloaderVersion,
        whiteningK: profile.cipher.whiteningK,
        slotOf: (key) => analysed[descriptors.findIndex((d) => d.key === key)],
      })
    : null;
  if (checkKey !== null) {
    reporter.log('');
    reporter.log(checkKey.why, checkKey.key === null ? 'warn' : 'ok');
  }

  /* The key the camera stores a bank under. On the 2016 line that is the check key itself: the application
   * re-keys every bank it writes into the stream its bootloader checks (`storeKeyDescription`), and no
   * per-device key slot or Key B is read there, so `storeKeyOf`'s "Key B" would name a key this line does
   * not use. */
  const storeKey: StoreKey =
    checkKey === null
      ? storeKeyOf(deviceKeySlot, keyTable)
      : {
          name: checkKey.name ?? 'the key its bootloader checks a bank under',
          key: checkKey.key,
          programmed: false,
        };

  /* ---- per-slot identification -------------------------------------- */
  const byKeyAnalysed = new Map<SlotKey, AnalysedSlot>();
  const slots: SlotState[] = [];
  const byKey = new Map<SlotKey, SlotState>();
  for (let i = 0; i < descriptors.length; i++) {
    const descriptor = descriptors[i];
    const slot = analysed[i];
    if (descriptor === undefined || slot === undefined) continue;
    byKeyAnalysed.set(descriptor.key, slot);

    /* The FF image under Key B is named by the key it is stored under (ff-form.ts), not by a recovered state. */
    const identity: KeyIdentity =
      slot.ffKeyB === true
        ? { name: 'Key B', bootable: false }
        : checkKey !== null
          ? checkKeyIdentity(slot, checkKey, profile.cipher.whiteningK)
          : identifyKey(
              { state: slot.recovered?.state ?? null, accepts: slot.accepts },
              keyTable,
              storeKey,
              keyWhiteningK,
            );
    /* The 2016 check key, when named, settles a bank either way: the bootloader tries no other. */
    const keyKnown = keyTable !== null || checkKey?.key != null;
    /* THE FOOTER IS THE BOOTLOADER'S QUESTION, NOT EVERY ONE'S. This used to
     * require a "CODE" footer of every slot, and so called a 2016 part's
     * running bank "NOT bootable": that bootloader checks none, and the bank
     * has none (see `BootPolicy.checksFooter`). */
    const footerPasses = !profile.boot.checksFooter || slot.footerOk;
    const bootability: SlotState['bootability'] = storedPlain(slot)
      ? /* the chain's own model: see the verdict below */ 'bootable'
      : identity.bootable && footerPasses
        ? 'bootable'
        : ffFormInRecovery(descriptor.key, slot, bootloaderVersion)
          ? /* recovery runs it when A and B hold nothing the bootloader takes: not a skipped slot */
            'recovery-only'
          : slot.present && slot.accepts && footerPasses && !keyKnown
            ? /* everything but the key checks out, and the key cannot be named */ 'unknown'
            : 'not-bootable';
    const bootable = bootability === 'bootable';

    const state: SlotState = {
      key: descriptor.key,
      name: descriptor.name,
      subcmd: armedWith[i] ?? null,
      address: descriptor.address,
      present: slot.present,
      reason: slot.reason,
      blank: slot.blank === true && slot.unread !== true,
      unread: slot.unread === true,
      header: slot.header,
      raw: slot.raw,
      footer: slot.footer,
      recovered: slot.recovered,
      plain: slot.plain,
      plainHeader: slot.plainHeader,
      accepts: slot.accepts,
      footerOk: slot.footerOk,
      sha256: slot.sha256,
      /* A bank stored plain has no key, so it is not named: identifyKey would call its identity
       * keystream UNNAMED_KEY, which reads as "encrypted under a key nobody knows" (TESTING.md 42.13). */
      keyName: storedPlain(slot) ? null : identity.name,
      bootable,
      bootability,
    };
    slots.push(state);
    byKey.set(descriptor.key, state);

    if (!slot.present) {
      reporter.log(`${descriptor.name}: ${slot.reason ?? 'not readable'}`, 'warn');
    } else if (storedPlain(slot)) {
      /* THE CHAIN'S OWN VERDICT. The clauses below are a keystream bank's
       * questions — which key decrypts it, does it hit the cipher's target,
       * does it carry a footer — and this bank answers none of them: the slot
       * bytes ARE the image, the bootloader's acceptance is the stored word
       * sum, and this bootloader generation has no footer. The camera boots
       * this exact slot, so the verdict comes from the chain's model, not
       * from a cipher's. */
      reporter.log(
        `${descriptor.name}: firmware ${slot.plainHeader?.versionStr ?? '?'}, ` +
          `${String(slot.header?.length ?? 0)} B${frameRateNote(slot.plain)}, plaintext chain, ` +
          `stored word sum ${String(slot.recovered?.checksum ?? 0)} — valid`,
        'ok',
      );
    } else {
      const footer = profile.boot.checksFooter
        ? `footer ${slot.footerOk ? 'ok' : 'BAD'}`
        : 'no footer check (this bootloader generation reads none)';
      const verdict =
        bootability === 'bootable'
          ? 'bootable'
          : bootability === 'unknown'
            ? `bootable unknown: ${unknownBootabilityWhy({ checkKey })}`
            : bootability === 'recovery-only'
              ? 'recovery only: R runs when A and B hold nothing the bootloader takes'
              : 'NOT bootable';
      reporter.log(
        `${descriptor.name}: firmware ${slot.plainHeader?.versionStr ?? '?'}, ` +
          `${String(slot.header?.length ?? 0)} B${frameRateNote(slot.plain)}, ` +
          `${identity.name ?? UNNAMED_KEY}, ` +
          `acceptance ${slot.accepts ? 'ok' : 'FAILS'}, ${footer} -> ${verdict}`,
        bootable
          ? 'ok'
          : bootability === 'unknown' || bootability === 'recovery-only'
            ? 'detail'
            : 'warn',
      );
      if (bootability === 'not-bootable' && slot.accepts && footerPasses) {
        reporter.log(
          checkKey?.name != null
            ? '    it decrypts and checksums under its own key, but the 2016 bootloader checks a ' +
                `bank only under ${checkKey.name} — so it will be skipped at boot`
            : '    it decrypts and checksums under its own key, but the bootloader only tries ' +
                `${storeKey.name} and Key A — so it will be skipped at boot`,
          'error',
        );
      }
    }
  }

  /* ---- boot prediction ---------------------------------------------- */
  let prediction: BootPrediction | null = null;
  let targetConfirmed: SlotKey | null = null;
  /* THE LOCKED LINE is not replayed through `selectBootSlot`. Its rule is decoded
   * (profiles/locked-boot.ts), but the bank its bootloader ENTERED is the camera's own
   * answer, the active-slot word (the bootloader's record, TESTING.md 42.56), and the
   * bank the next start runs needs each bank's check, which is decoded on the 2014
   * plaintext chain and the 2016 line only. Those two name both starts here
   * (`bootChoiceOf`, the function the page and the CLI call); the line's other builds
   * say why they cannot. */
  const lockedLine = profile.boot === LEGACY_BOOT;
  if (lockedLine) {
    reporter.log('');
    for (const [text, level] of lockedBootLines({
      cfg0,
      activeSlotWord,
      byKey,
      profile,
      version,
      checkKey,
      plainChain,
    })) {
      reporter.log(text, level);
    }
  }
  if (cfg0 !== null && !lockedLine) {
    try {
      prediction = profile.boot.selectBootSlot(cfg0, (key) => byKey.get(key)?.bootable === true);
    } catch (error) {
      /* A profile whose bootloader was never decoded refuses to predict rather
       * than fabricating "booted A, would write B". That is not a failure of
       * this read: everything else it found is still reported. */
      if (error instanceof CancelledError) throw error;
      prediction = null;
      reporter.log('');
      reporter.log(
        `boot prediction unavailable under ${profile.name}: ${errorMessage(error)}`,
        'warn',
      );
    }
  }

  /* The 2014 plaintext chain has no replayable boot policy — and needs none.
   * Its upgrade selector is mode 0, `fw_update_slot_address()`: the function
   * reads the roots' active-slot word this read already carries and arms the
   * OTHER bank. The camera's own word is therefore both halves of the
   * prediction, and the write targets exactly what it names. Held to the
   * builds whose own decoded table makes mode 0 that function, and refused
   * with the reason on the rest. */
  let chainReplay = false;
  const chainBlocked: string[] = [];
  if (plainChain && prediction === null) {
    const chainBuild = legacyUpgradeTargetBuild(version);
    const mode0Row = plan.selectors.find((row) => row.subcmd === 0);
    if (chainBuild === null || mode0Row?.channel !== 'plain') {
      chainBlocked.push(
        `the 2014 plaintext chain's write is decoded only for builds whose own mode-0 row is ` +
          `fw_update_slot_address() — ${version ?? 'the version did not read back'} is not one ` +
          'of them, so the selector that arms the upgrade target is not known on this build',
      );
    } else if (activeSlotWord === null) {
      chainBlocked.push(
        "the camera's active-slot word (fw info roots, selector 10) could not be read — on " +
          'the plaintext chain that word, not a boot-config replay, names the slot an ' +
          'upgrade writes',
      );
    } else {
      /* fw_update_slot_address(): active_slot 0 -> slot B, anything else ->
       * slot A — the same mapping the modern replay trusts the word for. The
       * BOOTED slot is the one the word records: the bootloader writes it at
       * every start (bootloader startup.c, handoff->slot: 0 slot A, 1 slot B,
       * 2 recovery R). A recovery start is not "the other A/B bank", so 2 is
       * not read as slot B. */
      const target: SlotKey = activeSlotWord === 0 ? 'b' : 'a';
      const booted: SlotKey = activeSlotWord === 2 ? 'r' : activeSlotWord === 0 ? 'a' : 'b';
      prediction = { booted, target };
      chainReplay = true;
      updateTargetSubcmd = 0;
      reporter.log('');
      reporter.log(
        `2014 plaintext chain: no boot replay — the camera's own active-slot word names ` +
          `${byKey.get(target)?.name ?? target} as the slot an upgrade writes (mode 0, ` +
          'fw_update_slot_address()); the booted bank stays untouched',
        'detail',
      );
    }
  }

  /* The 2016 line: the same camera answer names both ends. The bootloader records the bank it entered
   * (the active-slot word, TESTING.md 42.56), and this build's mode 0 reads that same word: FW-V1
   * targets/compact_pro_9hz_1_0_3_0/src/rpc_cmds.c:2523-2528 inlines fw_update_slot_address() as a load of
   * 0x10000208 that arms 0x14060000 when it is 0 and 0x14050000 otherwise, as on the 2014 chain
   * (`legacyUpgradeTargetBuild`). Nothing is armed to confirm the target: the camera's own upgrade is the
   * only thing that writes it, and the slot page writes the bank it names through that bank's own window. */
  if (line2016 && prediction === null) {
    const booted = bankOfActiveSlotWord(activeSlotWord);
    if (booted !== null && legacyUpgradeTargetBuild(version) !== null) {
      prediction = { booted, target: activeSlotWord === 0 ? 'b' : 'a' };
      reporter.log(
        `the camera's own upgrade (mode 0) writes ${byKey.get(prediction.target)?.name ?? prediction.target}, ` +
          'the bank its active-slot word does not name; the Slots tab writes the bank it is given, through ' +
          "that bank's own window",
        'detail',
      );
    }
  }

  if (prediction !== null) {
    /* The replay's target is a prediction, and the camera's own answers below can overrule it (on
     * 4.8.2.1 with cfg[0] 1 or 2 they do: TESTING.md 42.50). So the line says it is predicted, and
     * the "an upgrade writes" line after the checks is the one that states the target. */
    if (!chainReplay && !lockedLine) {
      reporter.log('');
      reporter.log(
        `boot config replay: booted ${byKey.get(prediction.booted)?.name ?? prediction.booted}, ` +
          `predicting ${byKey.get(prediction.target)?.name ?? prediction.target} as the upgrade ` +
          'target (checked against the camera below)',
        'detail',
      );
    }

    /* The replay above is inference. These two are the camera's own answer:
     * active_slot is the word fw_update_slot_address() reads, and the upgrade
     * selector arms the very window a write would land in — so reading it back
     * and matching it against the slots names the target from evidence. */
    if (activeSlotWord !== null) {
      const fromDevice: SlotKey = activeSlotWord === 0 ? 'b' : 'a';
      if (fromDevice !== prediction.target) {
        reporter.log(
          `  the camera's active-slot word says ${byKey.get(fromDevice)?.name ?? fromDevice}` +
            ' instead — trusting the camera',
          'warn',
        );
        prediction = { booted: prediction.booted, target: fromDevice };
      }
    }

    /* The selector comes from this build's table (`upgradeSelectorIn`), not
     * from the profile alone: a profile's number is armed only where the
     * running firmware's own switch has that row. */
    if (updateTargetSubcmd !== null) {
      const targetAddress = byKey.get(prediction.target)?.address ?? profile.memory.flashBase;
      targetConfirmed = await confirmUpgradeTarget(
        ctx,
        chunk,
        updateTargetSubcmd,
        targetAddress,
        byKeyAnalysed,
      );
      if (targetConfirmed !== null && targetConfirmed !== prediction.target) {
        reporter.log(
          `  the window selector ${hex(updateTargetSubcmd)} arms is ` +
            `${byKey.get(targetConfirmed)?.name ?? targetConfirmed} — trusting that over the ` +
            'boot-config replay',
          'warn',
        );
        prediction = { booted: prediction.booted, target: targetConfirmed };
      }
    } else if (profile.boot.updateTargetSubcmd >= 0) {
      reporter.log(
        `  this firmware's own table (${plan.table}) has no upgrade-target selector ` +
          `${hex(profile.boot.updateTargetSubcmd)}, so nothing was armed to confirm the target`,
        'warn',
      );
    }

    const targetSlot = byKey.get(prediction.target);
    /* The 2016 line said it above, as the camera's own upgrade: it has no whole-image write of its own. */
    if (targetSlot && !line2016) {
      reporter.log(
        `an upgrade writes ${targetSlot.name} at ${hex(targetSlot.address, 8)}` +
          (targetConfirmed !== null
            ? ' (confirmed by reading the window the upgrade selector arms)'
            : ''),
        'detail',
      );
    }
  }

  /* ---- the running application's own keys ---------------------------- */
  const keysBlock = runningApplicationKeyBlock(
    prediction === null ? null : (byKey.get(prediction.booted) ?? null),
    keyTable,
    storeKey,
  );
  if (keysBlock !== null) {
    reporter.log('');
    reporter.log(keysBlock, 'error');
  }

  /* ---- family check and detection ------------------------------------ */
  const familyOk = slots.some((slot) => slot.accepts);
  if (!familyOk && !plainChain) {
    reporter.log('');
    reporter.log(
      `no slot on this camera decrypts to the ${hexUp(profile.cipher.acceptanceSum)} acceptance ` +
        `sum ${profile.name} expects — this is probably a different firmware family. ` +
        'Flashing is disabled.',
      'error',
    );
  }

  const evidence: DeviceEvidence = {
    /* THE PROBE'S MEASUREMENTS, KEPT. This read arms each protected bank on
     * the channel its profile names and never tries the other, so it cannot
     * see a plain arm refused; the probe that chose the profile did. That
     * answer used to be dropped here, and detection after the read scored
     * the camera on less than detection before it. Kept first, so whatever
     * this read observes itself takes precedence. */
    ...channelEvidenceOf(ctx.detection?.evidence),
    ...(version !== null ? { firmwareVersion: version } : {}),
    ...(bootloaderVersion !== null ? { bootloaderVersion } : {}),
    ...(bootloaderString !== null && bootloaderString !== '' ? { bootloaderString } : {}),
    ...(platform !== null && platform !== '' ? { platform } : {}),
    ...(device.transport.description.productName !== null
      ? { productName: device.transport.description.productName }
      : {}),
    vendorId: device.transport.description.vendorId,
    productId: device.transport.description.productId,
    observedAcceptanceSums: slots
      .map((slot) => slot.recovered?.checksum)
      .filter((sum): sum is number => sum !== undefined),
    /* The same slots with their chain: a sum of 0 is the 2014 chain stored
     * plain or the 2016 cipher, and only the recovered state tells which. */
    observedSlots: slots.flatMap((slot) =>
      slot.recovered === null
        ? []
        : [{ acceptanceSum: slot.recovered.checksum, chain: slotChainOf(slot.recovered.state) }],
    ),
    imageVersions: slots
      .map((slot) => slot.plainHeader?.versionStr)
      .filter((v): v is string => v !== undefined),
    /* Both flags say which channel WORKED; neither says the other was refused.
     * Every arm above used the channel this profile's own map names for that
     * bank, and the other channel is never tried.
     *
     * `plainSelectorWorks` survives that as an observation about the camera:
     * the legacy firmware refuses the plain 2-byte channel on these banks, so a
     * plain arm of one rules that family out.
     *
     * `authSelectorWorks` does not, and is named for what it is. Under
     * `legacy-auth` every protected bank carries `auth: true`, so it is set on
     * every run and describes the map we chose more than the camera — which is
     * why no profile treats it as decisive. The stronger claim, "the
     * authenticated channel is REQUIRED", needs the one measurement nothing
     * here takes: arm a protected bank with the plain 2-byte payload and see it
     * refused. `runSweep` under a profile whose map carries no token already
     * probes precisely that (every selector, plain channel, armed or stalled);
     * its table is simply not fed back into evidence. */
    ...(armedBanks.some((entry) => entry.auth !== true) ? { plainSelectorWorks: true } : {}),
    ...(armedBanks.some((entry) => entry.auth === true) ? { authSelectorWorks: true } : {}),
  };
  const detection = detectProfile(evidence);

  /* ---- the flash gate ------------------------------------------------ */
  const blocked: string[] = [];
  /* The reasons only the classic writer needs: its key table, and its 2014-only line. A key-A line's
   * writes are checked by the upload-key derivation (write-keys.ts); a 2016 or FF write stages from its
   * own image, so neither reason applies to it. Kept apart as `classicWriterBlockedBy`. */
  const classicWriter: string[] = [];
  /* The key table and the acceptance sum are the cipher chain's questions. On
   * the 2014 plaintext chain nothing is encrypted — the arm, the staging and
   * the commit read no key and sum no decrypted words — so the chain's own
   * measurements (identity keystream, stored word sum 0) stand in for both. */
  if (!keyTable && !plainChain) {
    classicWriter.push("this camera's key table could not be confirmed");
  }
  if (!familyOk && !plainChain) {
    blocked.push(
      `no slot decrypts to ${profile.name}'s ${hexUp(profile.cipher.acceptanceSum)} acceptance sum`,
    );
  }
  /* And the refusal that replaced the profile-level one: the line's write path
   * is the plain chain's. Any other camera on the same protocol — the cipher
   * chains and the builds whose mode 0 is not the upgrade target — is told
   * exactly that, rather than being waved through a cipher-shaped staging. */
  if (!plainChain && plan.selectors.some((row) => row.channel === 'auth')) {
    classicWriter.push(PLAIN_CHAIN_ONLY_REASON);
  }
  blocked.push(...classicWriter);
  /* The reasons that only the classic upgrade flow (`flash`, selector 0) needs: which bank an
   * upgrade would write. The slot page writes the bank it names, through that bank's own window,
   * and treats an unnamed boot with the acknowledgement (`writeRisk.bootUnnamed`), so these reach
   * `blocked` for the classic gate and are kept apart as `upgradeBlockedBy` for the slot page. */
  const upgradeOnly: string[] = [];
  upgradeOnly.push(...chainBlocked);
  if (prediction === null) {
    upgradeOnly.push('the slot an upgrade would write could not be determined');
  }
  if (keysBlock !== null) blocked.push(keysBlock);
  /* The original threw out of readDeviceInfo the moment any slot's window
   * refused to arm, so a partial picture could never reach the write path at
   * all. Reporting the rest of the read is more useful than throwing it away,
   * but the refusal has to survive: a slot that was never read could be the
   * one an upgrade overwrites, and `confirmUpgradeTarget` cannot match a
   * window against bytes it does not have. */
  for (const slot of slots) {
    if (slot.unread) blocked.push(unreadSlotBlock(slot));
  }
  const flashSupport = profile.capabilities.flash;
  if (!flashSupport.supported) {
    /* The classic writer's own capability (its staging forms). The slot page stages a line by its own
     * form (slots/write-keys.ts, capability-family.ts), so this reason refuses the classic flow only. */
    const reason = `${profile.name} does not support flashing: ${flashSupport.reason}`;
    blocked.push(reason);
    classicWriter.push(reason);
  }
  /* A profile that writes through a selector this build's table does not have
   * has no window to write; saying so here keeps the gate honest. A profile
   * that names no selector at all is already blocked by its capability, or by
   * the write. */
  if (profile.boot.updateTargetSubcmd >= 0 && updateTargetSubcmd === null) {
    upgradeOnly.push(
      `there is no upgrade-target selector ${hex(profile.boot.updateTargetSubcmd)} in this ` +
        `firmware's own table (${plan.table}), so there is no window to write`,
    );
  }
  blocked.push(...upgradeOnly);
  if (keyWhiteningK !== profile.cipher.whiteningK) {
    blocked.push(
      `this camera's key table resolves under K=${hexUp(keyWhiteningK)} but ${profile.name} ` +
        `encrypts under K=${hexUp(profile.cipher.whiteningK)}`,
    );
  }
  if (!detection.ambiguous && detection.best.profile.id !== profile.id) {
    /* The evidence names a different family than the one we are acting under.
     * Key A would be this camera's, but the selector map, the cipher and the
     * boot policy would not — so refuse and let the user pick deliberately.
     *
     * Honestly: with the families that ship here this refusal cannot be the
     * first one to fire, and is kept as defence in depth rather than as
     * protection anyone relies on. `modern-4x` is the only profile that
     * declares `flash` supported, and every entry in `buildModernWindowMap()`
     * is plain — so any arm at all sets `plainSelectorWorks`, which zeroes
     * `legacy-auth`; the only other family that can then win is `compact-2016`,
     * and it wins only on a slot summing to 0 with none summing to 0xFFFF,
     * which is `familyOk === false` and therefore already in `blocked`. Under
     * every other profile `capabilities.flash` is unsupported and blocks above.
     * It stays because that chain is a property of today's four profiles, not
     * of the design: a family added later can win on evidence the family check
     * cannot see, and this is the only check that would catch it.
     *
     * This is deliberately NOT an auto-adopt. Detection needs the slots, and
     * which addresses the slots live at is itself a property of the profile,
     * so a read always commits to one family before it can judge the family.
     * Switching silently at this point would make this very refusal vacuous
     * and would change what the tool acts under without the user asking. A
     * caller that wants the detected family re-reads under it explicitly —
     * one extra read is a cheap price for the adoption being a decision
     * somebody made rather than one the code made quietly. */
    blocked.push(
      `the evidence says this camera is ${detection.best.profile.name}, not ${profile.name} ` +
        `(${detection.best.reasons.join('; ')})`,
    );
  }

  /* THE 2016 LINE IS WRITTEN BANK BY BANK. The slot page stages each bank under its image's own key
   * block 0 (slots/write.ts), so the whole-image writer's reasons (its key table, its 2014-only staging,
   * this profile's flash capability, the upgrade target) are said once, as BANKS_ONLY_WRITING, and only
   * the reasons that refuse every bank for the slot writer print (`cameraWideBlocks`, the slot page's own
   * gate). They all stay in `flashBlockedBy` for the whole-image gate, which the JSON keeps. */
  const bankBlocks = line2016
    ? cameraWideBlocks(
        {
          flashBlockedBy: blocked,
          upgradeBlockedBy: upgradeOnly,
          classicWriterBlockedBy: classicWriter,
          appKeysBlock: keysBlock,
          slots,
        },
        true,
      )
    : blocked;
  if (line2016) {
    reporter.log('');
    reporter.log(BANKS_ONLY_WRITING, 'detail');
  }
  if (bankBlocks.length > 0) {
    if (!line2016) reporter.log('');
    for (const reason of bankBlocks) reporter.log(`flashing disabled: ${reason}`, 'error');
  }

  const state: DeviceState = {
    readAt,
    profile,
    detection,
    evidence,
    description: device.transport.description,
    version,
    buildString,
    bootloaderVersion,
    bootloaderString,
    platform,
    usbSpeed,
    activeSlotWord,
    bankVerdicts,
    serial,
    cfg0,
    cfgSlots,
    deviceKeySlot,
    keyTableCandidates: candidates.length,
    keyTable,
    keyWhiteningK,
    storeKey,
    slots,
    byKey,
    boot: prediction,
    updateTargetSubcmd,
    targetConfirmed,
    familyOk,
    plainChain,
    canFlash: blocked.length === 0,
    flashBlockedBy: blocked,
    upgradeBlockedBy: upgradeOnly,
    classicWriterBlockedBy: classicWriter,
    appKeysBlock: keysBlock,
    checkKey,
  };

  reporter.progress(
    1,
    1,
    state.canFlash || (line2016 && bankBlocks.length === 0)
      ? `Read. ${String(slots.filter((s) => s.present).length)}/${String(descriptors.length)} slots readable.`
      : 'Read, but this camera cannot be flashed from here — see the log.',
  );
  return state;
}

/**
 * Why the RUNNING application cannot take an upload for this camera, or null.
 *
 * THE UPLOAD IS DECRYPTED BY THE APPLICATION, NOT BY THE BOOTLOADER. The flash
 * path encrypts the image under this camera's Key A - the bootloader's, from its
 * key table, confirmed against a slot - and `CompleteMemoryUpgrade` in the
 * running application decrypts it with the `g_keyA` built into THAT image and
 * re-encrypts it under the per-device key, or its own `g_keyB` when none is
 * programmed (`fw_validate_decrypt_program`, FW-V1 `targets/compact_pro_ff/src/
 * update.c`). Its checksum is over the staged bytes, so a wrong key is not
 * noticed: the commit answers OK, the new slot fails the bootloader's acceptance
 * test under both of its keys, and the camera boots the old slot again.
 *
 * That is not hypothetical. The Mosaic 10.9.1.31 dump's bootloader holds
 * 874dfcf6... / b23b0d20..., its application embeds f32ad771... / 997ed6e5...
 * (the Compact PRO FF 4.18.2.0 pilot's pair) and its per-device key slot is
 * erased; the emulated upload of a retargeted image committed and booted slot A
 * (FW-V1 Phase 51). Nothing here reads an address: the booted slot is already
 * decrypted, and the keys are looked for BY VALUE, the way the slot writer finds
 * the pair it retargets (`locateOwnKeyPair`; `findEmbeddedKeyTable` explains
 * why an anchor is not trusted). Only an ABSENT key refuses - that is the case the firmware
 * cannot survive, and it needs no guess about which copy the code loads.
 */
export function runningApplicationKeyBlock(
  running: SlotState | null,
  keyTable: PickedKeyTable | null,
  storeKey: StoreKey,
): string | null {
  const plain = running?.plain ?? null;
  if (running === null || plain === null || keyTable === null) return null;
  const what =
    `the running application (${running.name}, firmware ` +
    `${running.plainHeader?.versionStr ?? '?'})`;
  if (findAll(plain, keyTable.keyA).length === 0) {
    return (
      `${what} does not carry this camera's Key A ${bytesToHex(keyTable.keyA)}: it decrypts ` +
      "an upload with the Key A built into it, not with the bootloader's, so a flash would " +
      'commit, the bootloader would refuse the new slot, and the camera would keep running ' +
      'its old firmware'
    );
  }
  if (!storeKey.programmed && findAll(plain, keyTable.keyB).length === 0) {
    return (
      `${what} carries this camera's Key A but not its Key B ${bytesToHex(keyTable.keyB)}: ` +
      'with no per-device key programmed it re-encrypts an upload under the Key B built ' +
      'into it, which this bootloader does not try, so the new slot would never boot'
    );
  }
  return null;
}

/**
 * The profile a device read should be redone under, or null.
 *
 * A read commits to one family before it can judge the family (see the
 * "evidence says" refusal above), so a slot's verdict is its ACTING profile's.
 * When detection after the read confidently names another family whose cipher
 * differs, "does this slot pass acceptance?" has a different answer under it,
 * and reporting the acting one's is reporting the wrong one. The caller re-reads
 * under this profile, explicitly; a family named by hand (`forced`) is never
 * second-guessed. The CLI's `info` has applied this rule since it existed; the
 * web's device-info read applies it through here.
 */
export function profileToRereadUnder(state: DeviceState, forced: boolean): FirmwareProfile | null {
  if (forced || state.detection.ambiguous) return null;
  const best = state.detection.best.profile;
  if (best.id === state.profile.id) return null;
  const a = state.profile.cipher;
  const b = best.cipher;
  const differs =
    a.whiteningK !== b.whiteningK ||
    a.acceptanceSum !== b.acceptanceSum ||
    a.clearWords[0] !== b.clearWords[0] ||
    a.clearWords[1] !== b.clearWords[1];
  return differs ? best : null;
}

/**
 * The flash-gate reason for a bank the read could not read. It names one bank: the slot page refuses
 * that bank (its row says "Not read", and `prepareSlotFlash` refuses it) and no other.
 */
export function unreadSlotBlock(slot: SlotState): string {
  return `${slot.name} could not be read (${slot.reason ?? 'unknown error'})`;
}

/** The slot the camera booted from, when the boot policy could name one. */
export function bootedSlot(state: DeviceState): SlotState | null {
  return state.boot === null ? null : (state.byKey.get(state.boot.booted) ?? null);
}

/** The slot an upgrade would overwrite, when the boot policy could name one. */
export function targetSlot(state: DeviceState): SlotState | null {
  return state.boot === null ? null : (state.byKey.get(state.boot.target) ?? null);
}

/**
 * True when the upgrade target is the bank the camera booted from. On 4.8.2.1 with cfg[0] 1 the
 * replay boots B and the camera's own answer names B as the target (TESTING.md 42.50). An upgrade
 * from such a camera overwrites the image it is running from. A warning only: nothing gates on it.
 */
export function upgradeTargetIsBooted(state: DeviceState): boolean {
  return state.boot !== null && state.boot.target === state.boot.booted;
}

/**
 * True when the camera runs its recovery bank and its own upgrade writes B: on 4.8.2.1 with cfg[0] 2 the
 * replay boots R and the camera's own answer names B (TESTING.md 42.50). The bank written is not the one
 * running, so the warning says what B holds, not that the running image is overwritten (TESTING.md 42.67).
 */
export function upgradeTargetWhileRecovery(state: DeviceState): boolean {
  return state.boot !== null && state.boot.booted === 'r' && state.boot.target === 'b';
}

/**
 * The sentence the page and `seek-fw info` show under the upgrade target, or null. Two cases: the target is
 * the booted bank, so an upgrade overwrites the running image; or the camera runs its recovery bank and its
 * own upgrade writes B. `nameOf` names the bank; the page passes its own label ("Bank B") so the same bank
 * carries the same name on the page, and the CLI keeps the profile's name.
 */
export function upgradeTargetWarning(
  state: DeviceState,
  nameOf: (slot: SlotState | undefined, key: SlotKey) => string = (slot, key) => slot?.name ?? key,
): string | null {
  if (state.boot === null) return null;
  const target = state.boot.target;
  const name = nameOf(state.byKey.get(target), target);
  if (upgradeTargetIsBooted(state)) {
    return (
      `${name} is both the bank the camera booted from and the bank its own upgrade writes. ` +
      'An upgrade run from this camera would overwrite the image it is running. ' +
      'This is a warning only: nothing here stops an upgrade.'
    );
  }
  if (upgradeTargetWhileRecovery(state)) {
    return (
      'The camera is running its recovery bank, and its own upgrade writes ' +
      `${name}, which it is not running. ` +
      `${recoveryTargetVerdict(state.byKey.get(target), state.byKey.get(state.boot.booted), name)} ` +
      'This is a warning only: nothing here stops an upgrade.'
    );
  }
  return null;
}

/**
 * What the recovery-case warning says about the bank its upgrade writes, from that bank's own verdict on
 * this read. A bootable bank holds an image the upgrade replaces; on 4.8.2.1 that image is the same as the
 * recovery bank's (TESTING.md 42.50, measured on the emulator: A, B and R identical and bootable), so the
 * text says so. An interrupted write leaves the bank unbootable, which is the one risk named.
 */
function recoveryTargetVerdict(
  slot: SlotState | undefined,
  running: SlotState | undefined,
  name: string,
): string {
  if (!slot?.present) {
    return `${name} could not be read on this check, so what it holds is not known.`;
  }
  if (slot.blank) return `${name} is blank, so the upgrade writes into an empty bank.`;
  if (slot.bootability === 'bootable') {
    const same = slot.sha256 !== null && slot.sha256 === (running?.sha256 ?? null);
    const holds = same ? 'the same bootable image as the bank it runs' : 'a bootable image';
    return (
      `${name} holds ${holds}, which the upgrade replaces; ` +
      `if the upgrade stops partway, ${name} is left unbootable.`
    );
  }
  if (slot.bootability === 'unknown') {
    return (
      `${name}'s bootability is unknown on this read, so the upgrade may replace an image ` +
      'the camera would boot.'
    );
  }
  return `${name} is not shown as bootable on this read, so the upgrade replaces no image the camera would boot.`;
}

/**
 * Which key the bootloader stores an upgrade under, said only as far as the read knows it. Shared by the
 * CLI's `info` and the page's Info tab, so both say the same (TESTING.md 42.64). A bootloader block that was
 * never read is named unknown, not "Key B (no per-device key programmed)", which would claim a read that did
 * not happen.
 *
 * On the 2016 line (`checkKey` set) the application stores every bank it writes under the key its
 * bootloader checks: both seed the device-seeded stream from the bootloader's own record, and a commit of
 * modes 7 to 9 re-keys the staged image into it and checks it there before erasing (FW-V1
 * targets/compact_pro_9hz_1_0_3_0/src/crypto.c:291-329, rpc_cmds.c:1786-1812; `checkKeyOf`).
 */
export function storeKeyDescription(state: DeviceState): string {
  const checkKey = state.checkKey ?? null;
  if (checkKey !== null) {
    return checkKey.name === null
      ? 'the key its bootloader checks a bank under (not named on this read): the application ' +
          'stores every bank it writes under that key'
      : `${checkKey.name}: the application stores every bank it writes under the key its ` +
          'bootloader checks';
  }
  if (state.storeKey.programmed) return state.storeKey.name;
  if (state.deviceKeySlot === null) {
    return 'unknown — the bootloader block holding the per-device key slot was not read';
  }
  return state.keyTable === null
    ? 'Key B (no per-device key programmed; Key B itself not identified)'
    : 'Key B (no per-device key programmed)';
}

/** The bootable cell for one bank: an FF image in recovery is a recovery-only image, not a verdict of 'no'. */
export function bootableDescription(slot: SlotState): string {
  if (slot.bootability === 'unknown') return 'unknown';
  if (slot.bootability === 'recovery-only') return 'recovery only';
  return slot.bootable ? 'yes' : 'no';
}
