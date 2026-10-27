/* ==================================================================== *
 * The slot workflows: identify a camera's firmware slots, dump one, flash
 * one from a decrypted image, flash one from raw bytes.
 *
 * ONE CONTRACT, FIVE OWNERS. This file is the shared surface the capability
 * matrix, the reader, the writer, the web view and the CLI are all written
 * against. Change it only in a commit of its own, and say so in the message.
 *
 * SCOPE (decided with the owner of the toolkit):
 *   - builds 0.8.0.0 and newer only. Everything older has no read handler
 *     (or one that is a hazard) and is reported `unsupported`, never tried;
 *   - there is NO "select the active slot" operation: the protocol has no
 *     boot-config write, only the side effect of a mode-0 upgrade;
 *   - all three banks are addressable: A, B and the recovery bank R (0x14070000),
 *     both for reading and for writing. Addresses differ by generation and come
 *     from the build's plan: the locked line is 0x14050000/0x14060000/0x14070000,
 *     the modern line 0x14030000/0x14050000/0x14070000.
 *     The bootloader at 0x14000000 and the boot-config block are NOT slots
 *     and are never written here.
 * ==================================================================== */

import type { Support } from '../profiles/types.js';
import type { SlotKey, WindowEntry } from '../profiles/types.js';
import type { DeviceState, SlotState } from '../workflows/types.js';

export type { SlotKey, Support };

/** One bank is one 64 KiB flash block. */
export const SLOT_BYTES = 0x10000;

/**
 * What the bytes sent through SetFeaturedFirmwareData (0x50) have to be for
 * the camera to end up with a bootable image in the bank. It differs by
 * generation, and the page must say which one it is building.
 *
 *  - 'key-a-ciphertext'        bank image + 0xFF pad + "CODE" footer. The image is XORed
 *                              with the keystreams that make the device's own two passes
 *                              (its Key A, then its store key: `fw_validate_decrypt_program`)
 *                              store it under the key the booted bank holds, derived from
 *                              the camera (`write-keys.ts`). The 2017+ line.
 *  - 'slot-keystream-ciphertext' plain image XOR the stage key's keystream (key
 *                              block 0 of the IMAGE's own pair, not a key read from
 *                              the target bank). The 2016 Compact PRO line;
 *                              measured on a real camera: the device re-encrypts
 *                              the payload into the bank's own store key, so the
 *                              stored bytes are NOT the staged bytes.
 *  - 'plain'                   the image bytes themselves: the 2014 plaintext
 *                              chain, no cipher, no footer.
 */
export type StagingForm = 'key-a-ciphertext' | 'slot-keystream-ciphertext' | 'plain';

/**
 * What a prepared write actually stages with. A bank's `SlotEntry.staging` is a
 * `StagingForm`; a plan adds two cases a bank cannot name in advance:
 *
 *  - 'verbatim'    raw bytes, sent exactly as given;
 *  - 'key-a-keystream'  the 1.3.0.8 FF (16 Hz) image on the 2014 chain, as the vendor app
 *                  stages it: the image XOR the keystream of key block 0 (Key A), header
 *                  window verbatim (ff-form.ts). The camera re-keys it with key block 1 and
 *                  stores the image under Key B, so the payload is not the stored bytes.
 *                  The plan cannot tell the 8 Hz build from the FF build (one version
 *                  string): the IMAGE decides, at write time.
 */
export type PlanStaging = StagingForm | 'verbatim' | 'key-a-keystream';

/**
 * How the bank's stored bytes relate to the payload when the plan predicts them:
 * 'as-sent' (the 2014 plain chain programs the payload) or 'key-b-ciphertext' (the
 * 1.3.0.8 FF build re-keys the payload with key block 1 and stores the image under
 * Key B: the stored bank is the image XOR Key B, header window verbatim).
 */
export type StoredForm = 'as-sent' | 'key-b-ciphertext';

/**
 * What the camera is expected to do at commit with a 1.3.0.8 FF image's payload (write.ts `ffCommitOf`). Each
 * case is written all the same, and the plan's warnings say it before the confirm (owner: warn, never gate):
 *  - 'takes': the camera's own answers name the 16 Hz FF build, whose commit check this form passes.
 *  - 'refuses': the camera runs the 8 Hz 1.3.0.8 build, whose commit of a bank arm checks the payload's plain
 *    word sum (`image_sum_ok`), and this payload fails it: it refuses at commit with 0x00070100 before it
 *    erases or writes anything. Measured on that build for the earlier staged form (TESTING.md 42.10).
 *  - 'programs-as-sent': the camera programs the bytes as they are: a 2014-chain application before 1.3.0.8,
 *    which checks no image on a bank arm (FW-V1 cmd_CompleteMemoryUpgrade, 0.5.0.2 to 1.3.0.0; measured on
 *    the 1.3.0.0 Compact, TESTING.md 42.109), or the 8 Hz 1.3.0.8 build with a payload that passes its check.
 *    The plan predicts the payload as the bank's bytes.
 *  - 'build-unknown': the camera runs 1.3.0.8 and its own answers cannot say which build: 'takes' on the
 *    16 Hz build, the 8 Hz build's outcome ('refuses' or 'programs-as-sent') otherwise.
 */
export type FFCommitExpectation = 'takes' | 'refuses' | 'programs-as-sent' | 'build-unknown';

/**
 * The key a derived write stores under, the booted bank it was derived from, and the key that bank
 * holds (null when the bootloader's store key is not the one the bank holds).
 */
export interface DerivedKey {
  readonly bank: SlotKey;
  readonly key: string;
  readonly holds: string | null;
}

/** What committing to this slot does besides programming the bank. */
export type CommitEffect =
  /** Arming 7/8/9 and committing programs the bank and nothing else. */
  | 'bank-only'
  /** Arming 0 (the upgrade-target selector) also rewrites cfg[0]. Not offered here. */
  | 'bank-and-boot-config';

/**
 * What writing a bank means while it holds no image (its header window reads as
 * all 0xFF). An empty bank is a first-class state, not an error: every staging
 * form here builds its payload from the IMAGE and the camera's own keys, and the
 * commit erases the block before programming it, so nothing is read from the
 * target bank to write it. The plan says so per bank, with the reason.
 */
export interface EmptyBankPolicy {
  /** Whether an empty bank may be written, with the reason when it may not. */
  readonly writable: Support;
  /** One sentence for the page and the CLI: why an empty bank can (or cannot) be written. */
  readonly why: string;
}

export interface SlotEntry {
  readonly key: SlotKey;
  readonly name: string;
  readonly address: number;
  readonly length: number;
  /** The BeginFirmwareUpgrade window that READS this bank on this build, or null. */
  readonly read: WindowEntry | null;
  /** The window armed before staging, to WRITE this bank, or null. */
  readonly write: WindowEntry | null;
  readonly dump: Support;
  readonly flashPlain: Support;
  readonly flashRaw: Support;
  readonly staging: StagingForm | null;
  readonly commitEffect: CommitEffect;
  /** What an empty (all 0xFF) bank means for a write on this build. */
  readonly emptyBank: EmptyBankPolicy;
  /** Facts the UI shows next to the slot (e.g. "boots only from recovery"). */
  readonly notes: readonly string[];
}

/**
 * What this build can do with its slots. Built from the profile and the
 * reported firmware version alone, so it exists offline and is unit-testable
 * over the whole corpus without a device.
 */
export interface SlotPlan {
  readonly profileId: string;
  readonly firmwareVersion: string | null;
  /** False for every build older than 0.8.0.0, or whose version is unknown. */
  readonly supportedBuild: Support;
  readonly slots: readonly SlotEntry[];
  /** Build-level facts (e.g. "1.3.0.8-FF boots its patch from recovery only"). */
  readonly notes: readonly string[];
}

/**
 * What a bank holds, as far as one read can say. Four distinct facts, never merged:
 *  - 'image'    a firmware image header was read;
 *  - 'empty'    the header window reads as all 0xFF: an erased bank, no image, no error;
 *  - 'foreign'  read cleanly, not erased, and not an image header this page recognises;
 *  - 'unread'   the bank was not read (no window, the read failed, or a spent reader).
 */
export type SlotContent = 'image' | 'empty' | 'foreign' | 'unread';

/** A slot as the page shows it: the plan's entry joined to what was read. */
export interface SlotView {
  readonly entry: SlotEntry;
  /** What the read found; null when the slot was not read (see `unreadReason`). */
  readonly state: SlotState | null;
  readonly unreadReason: string | null;
  /** What the bank holds. 'unread' exactly when `state` is null. */
  readonly content: SlotContent;
  /** The bootloader boots this slot now. */
  readonly active: boolean;
}

export interface SlotsReport {
  /** The camera analysis everything below was derived from. Never reuse across cameras. */
  readonly state: DeviceState;
  readonly plan: SlotPlan;
  readonly slots: readonly SlotView[];
}

export interface DumpedSlot {
  readonly key: SlotKey;
  readonly address: number;
  /** The 64 KiB exactly as stored in flash. */
  readonly raw: Uint8Array;
  readonly sha256: string;
  /**
   * The whole bank was read and every byte is 0xFF: an empty bank. Then `raw` is
   * the 64 KiB of 0xFF, `plain` is null, and there is nothing to decrypt. False for
   * a short read, whatever the bytes that did come back hold.
   */
  readonly empty: boolean;
  /** The decrypted image, when the slot decrypts under a recovered key. */
  readonly plain: Uint8Array | null;
  readonly plainSha256: string | null;
  readonly notes: readonly string[];
}

export type SlotInputKind = 'plain' | 'raw';

export interface SlotFlashInput {
  readonly kind: SlotInputKind;
  readonly bytes: Uint8Array;
  readonly fileName: string;
}

/**
 * Where a write plan's note comes from:
 *  - 'write'  this write's own: how it is staged or checked, or what the bank will hold;
 *  - 'bank'   the bank's own notes (`SlotEntry.notes`), the same for every write to it;
 *  - 'camera' the camera's notes (`SlotPlan.notes`), the same for every bank.
 */
export type PlanNoteSource = 'write' | 'bank' | 'camera';

/** One note beside a write plan. */
export interface PlanNote {
  readonly source: PlanNoteSource;
  readonly text: string;
}

/**
 * Why the image a write takes may not be the build the camera runs (`image-build.ts`), for JSON only:
 *  - 'other-version'          the image's header names another firmware version than the camera reports;
 *  - 'no-version'             the image's header names no version (its version word is blank);
 *  - 'other-build'            the 8 Hz 1.3.0.8 image, while the camera runs the 16 Hz 1.3.0.8 FF build;
 *  - 'running-build-unknown'  the 8 Hz 1.3.0.8 image, and the camera's own answers do not say which
 *                             of the two 1.3.0.8 builds it runs.
 */
export type ImageBuildCode =
  'other-version' | 'no-version' | 'other-build' | 'running-build-unknown';

/** The warning a plan carries when its image may not be the build the camera runs. It never refuses. */
export interface ImageBuildWarning {
  readonly code: ImageBuildCode;
  /** The image's build in short form ('1.2.0.0', '1.3.0.8 8 Hz'), or null when its header names none. */
  readonly image: string | null;
  /** The camera's build in short form ('1.3.0.0', '1.3.0.8 16 Hz FF'), or its version when the build is not told. */
  readonly camera: string | null;
  /** The warning in people's words; the plan's `warnings` carry the same text. */
  readonly text: string;
}

/** Everything a person is shown, and a write is checked against, before a send. */
export interface SlotFlashPlan {
  readonly key: SlotKey;
  readonly address: number;
  readonly kind: SlotInputKind;
  readonly staging: PlanStaging;
  /** The bytes that will go through 0x50, in 64-byte chunks. */
  readonly payload: Uint8Array;
  readonly sum16: number;
  /** What the slot will hold afterwards, when it can be predicted (else null). */
  readonly expectedStored: Uint8Array | null;
  /**
   * How `expectedStored` relates to `payload`: absent or 'as-sent' when the device programs
   * the payload as sent, 'key-b-ciphertext' when it re-keys the payload with key block 1 and
   * stores the image under Key B (the 1.3.0.8 FF build). Only the wording of the read-back
   * verdict reads it; the comparison is the same byte compare. Optional so plans built before
   * it still type-check.
   */
  readonly storedForm?: StoredForm;
  /** For an FF image's plan: what the camera is expected to do with it at commit (see FFCommitExpectation). */
  readonly ffCommit?: FFCommitExpectation;
  /**
   * The plain image the bank must decrypt to after the write: the image as its
   * staging builder stamped and balanced it (length, acceptance adjust word, key
   * pair), or, for raw bytes, what the payload decrypts to under the staging key
   * when that can be said. Null when no plain image can be predicted. The read-back
   * is decrypted under the keystream it carries and compared with this, which is the
   * check on the forms whose device re-encrypts the bank. Optional (added in wave 2)
   * so plans built before it still type-check; an absent field reads as null.
   */
  readonly expectedPlain?: Uint8Array | null;
  /**
   * The booted bank and the key it holds, when this bank is written under a key derived from the
   * camera (`write-keys.ts`); null for raw bytes and for the forms that take no derived key.
   */
  readonly derivedFrom?: DerivedKey | null;
  /** Human-readable rows: field, what the slot has now, what it will have. */
  readonly compare: readonly { field: string; before: string; after: string }[];
  /**
   * The target bank held no image when the plan was built (its header window read
   * as all 0xFF), so the write overwrites no firmware. Optional so a plan built
   * before the field existed reads as false.
   */
  readonly targetEmpty?: boolean;
  /**
   * Things to say loudly: a risk the write takes, or a check that is not made (writing the booted slot,
   * writing recovery, a raw payload, a payload the bootloader would reject). Notes are not here: see `notes`.
   */
  readonly warnings: readonly string[];
  /**
   * The image may not be the build the camera runs: its header names another version (or none), or, on
   * 1.3.0.8, it is the 8 Hz build and the camera runs the 16 Hz one or does not say. Null when the image is
   * the camera's build, and for raw bytes with no image header. Its text is also in `warnings`; this field is
   * for a front end that shows it again beside the confirmation, and for JSON (its `code`).
   */
  readonly imageBuild: ImageBuildWarning | null;
  /**
   * What is worth knowing beside the plan and is not a risk, each with where it comes from: this write's own
   * notes first, then the bank's, then the camera's. A front end that already shows the camera's notes and the
   * bank's row need not repeat those two here (TESTING.md 42.88).
   */
  readonly notes: readonly PlanNote[];
  /** The device analysis this plan was built from. `flashSlot` re-checks it. */
  readonly serial: string | null;
  readonly firmwareVersion: string | null;
}

export interface FlashSlotOptions {
  /** Take a read-back of the slot after the commit and compare. Default true. */
  readonly verify?: boolean;
  /** Must be true for a write to a slot the camera boots now, or to recovery. */
  readonly acknowledgeRisk: boolean;
  /**
   * Called once, just before the commit (CompleteMemoryUpgrade) is sent for this bank. Before it, nothing
   * the write sent can have changed the bank (arming and staging do not touch flash); from it on, the bank
   * may be partly written. A front end that reports a cancel tells the two apart by it (TESTING.md 42.82).
   */
  readonly onCommit?: (key: SlotKey) => void;
}

export interface FlashSlotResult {
  readonly key: SlotKey;
  readonly commitStatus: number;
  /** Null when verify was off. */
  readonly verified: boolean | null;
  /** Read-back of the slot after the write, when it was taken. */
  readonly after: Uint8Array | null;
  readonly notes: readonly string[];
}
