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
 *  - 'key-a-ciphertext'        bank image + 0xFF pad + "CODE" footer, encrypted
 *                              under the camera's KEY A. The device decrypts it
 *                              and re-encrypts it under the store key itself
 *                              (`fw_validate_decrypt_program`). The 2017+ line.
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
 *  - 'two-stream'  the 1.3.0.8 FF (16 Hz) image on the 2014 chain: the image XOR the
 *                  keystream of key block 0 XOR the keystream of key block 1
 *                  (preservation/patch.ts `xor-ks0-ksD`), with its adjust word solved
 *                  so the app's collapsed acceptance sum is 0xFFFF. The camera folds
 *                  it back and stores the plain image, so the payload is not the stored
 *                  bytes. It exists because the plan cannot tell the 8 Hz build from the
 *                  FF build (one version string): the IMAGE decides, at write time.
 */
export type PlanStaging = StagingForm | 'verbatim' | 'two-stream';

/**
 * How the bank's stored bytes relate to the payload when the plan predicts them:
 * 'as-sent' (the 2014 plain chain programs the payload) or 'two-stream-fold' (the
 * 1.3.0.8 FF build folds the payload through its two key streams and programs the
 * image it folds to).
 */
export type StoredForm = 'as-sent' | 'two-stream-fold';

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
   * the payload as sent, 'two-stream-fold' when it stores the image the payload folds to
   * (the 1.3.0.8 FF build, whose payload is `expectedStored` XOR two keystreams). Only the
   * wording of the read-back verdict reads it; the comparison is the same byte compare.
   * Optional so plans built before it still type-check.
   */
  readonly storedForm?: StoredForm;
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
  /** Human-readable rows: field, what the slot has now, what it will have. */
  readonly compare: readonly { field: string; before: string; after: string }[];
  /**
   * The target bank held no image when the plan was built (its header window read
   * as all 0xFF), so the write overwrites no firmware. Optional so a plan built
   * before the field existed reads as false.
   */
  readonly targetEmpty?: boolean;
  /** Things to say loudly (writing the booted slot, writing recovery, a raw payload). */
  readonly warnings: readonly string[];
  /** The device analysis this plan was built from. `flashSlot` re-checks it. */
  readonly serial: string | null;
  readonly firmwareVersion: string | null;
}

export interface FlashSlotOptions {
  /** Take a read-back of the slot after the commit and compare. Default true. */
  readonly verify?: boolean;
  /** Must be true for a write to a slot the camera boots now, or to recovery. */
  readonly acknowledgeRisk: boolean;
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
