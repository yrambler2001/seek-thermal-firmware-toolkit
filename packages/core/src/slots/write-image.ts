/* ==================================================================== *
 * Turning a decrypted image into the bytes one slot's staging form needs.
 *
 * Everything here is pure: bytes in, bytes out, no device. It is the
 * per-bank counterpart of `prepareImage` in workflows/flash.ts, which carries
 * the same guards for the one bank the existing page writes (the upgrade
 * target). The copies below are deliberate: flash.ts is not touched by this
 * page, and its behaviour is pinned by its own tests. Keep the two in step by
 * hand when either one changes a guard.
 *
 * The three staging forms (see types.ts):
 *   'key-a-ciphertext'           the image, retargeted to this camera's keys,
 *                                stamped, padded and footered, then encrypted
 *                                under Key A (`buildBankPayload`);
 *   'slot-keystream-ciphertext'  the image, stamped so its decrypted word sum
 *                                is the acceptance target, XORed with the
 *                                keystream the bank already carries;
 *   'plain'                      the image, stamped so its stored word sum is
 *                                0 (the 2014 plaintext chain).
 * ==================================================================== */

import { bytesToHex, equalBytes, hex, hexUp, viewOf } from '../bytes.js';
import { SeekError } from '../errors.js';
import { cryptBytes } from '../crypto/cipher.js';
import {
  describeKeyTableMismatch,
  findEmbeddedKeyTable,
  parseKeyFilenameSuffix,
  stateFromKey,
  type KeyPair,
} from '../crypto/keys.js';
import {
  assertBankPayload,
  assertPlainChainPayload,
  buildBankPayload,
  PLAIN_CHAIN_STAGE_MAX,
  setAcceptSum,
  wordSum32,
  type AcceptSumResult,
} from '../image/bank.js';
import {
  FOOTER_SIZE,
  FOOTER_TAG,
  footerOffsetFor,
  HEADER_OFFSET,
  HEADER_SIZE,
  IMAGE_MAGIC,
  LENGTH_OFFSET,
  parseImageHeader,
  TRY_KEYS_MAX_LEN,
  type ImageHeader,
} from '../image/header.js';
import type { CipherProfile } from '../profiles/types.js';
import type { SlotState } from '../workflows/types.js';
import type { StagingForm } from './types.js';
import { sha256Sync } from './write-sha.js';

/** Every refusal of this page is one code, so a front end can tell "nothing was sent" apart. */
export function slotRefused(message: string, detail?: Readonly<Record<string, unknown>>): SeekError {
  return new SeekError('slots/refused', message, detail === undefined ? {} : { detail });
}

/** Re-throw a helper's refusal under this page's code, keeping its message and cause. */
export function asSlotRefusal(error: unknown): SeekError {
  if (error instanceof SeekError && error.code === 'slots/refused') return error;
  if (error instanceof SeekError) {
    return new SeekError(
      'slots/refused',
      error.message,
      error.detail === undefined ? { cause: error } : { cause: error, detail: error.detail },
    );
  }
  throw error;
}

/* ---- the image itself --------------------------------------------------- */

/**
 * The shape checks `prepareImage` makes before it touches an image: size,
 * header magic, the stack pointer and reset vector of a decrypted image. Each
 * one stops a file that would never boot from reaching a payload.
 */
export function assertImageShape(bytes: Uint8Array): void {
  if (bytes.length < HEADER_OFFSET + HEADER_SIZE) {
    throw slotRefused('file is too small to hold an image header');
  }
  if (bytes.length & 3) {
    throw slotRefused(`image size must be a multiple of 4 (got ${String(bytes.length)} B)`);
  }
  if (bytes.length >= TRY_KEYS_MAX_LEN) {
    throw slotRefused(
      `image is ${String(bytes.length)} B; the bootloader rejects any header.length >= ` +
        `${hexUp(TRY_KEYS_MAX_LEN)}, so it would never boot`,
    );
  }
  const dv = viewOf(bytes);
  const magic = dv.getUint32(HEADER_OFFSET, true);
  if (magic !== IMAGE_MAGIC) {
    throw slotRefused(
      `no image header at ${hexUp(HEADER_OFFSET)} (magic ${hexUp(magic)}, expected ` +
        `${hexUp(IMAGE_MAGIC)}) — this must be a decrypted Seek firmware image, not an ` +
        'encrypted slot or a flash dump',
    );
  }
  const sp = dv.getUint32(0, true);
  const entry = dv.getUint32(4, true);
  if (sp >>> 24 !== 0x10 && sp >>> 24 !== 0x20) {
    throw slotRefused(
      `initial stack pointer ${hexUp(sp)} is not in LPC43xx SRAM — this does not look decrypted`,
    );
  }
  if (sp & 3) throw slotRefused(`initial stack pointer ${hexUp(sp)} is not word-aligned`);
  if (!(entry & 1)) throw slotRefused(`reset vector ${hexUp(entry)} is not a Thumb address`);
}

/**
 * Retarget the image's own Key A / Key B to this camera's pair, exactly as
 * `prepareImage` does. The keys the image carries are named by its file name
 * (the dump view puts them there); without that name nothing says which pair
 * the image was built for, so the file is refused. Returns the image with this
 * camera's pair in it.
 */
export function retargetImageKeys(bytes: Uint8Array, fileName: string, mine: KeyPair): Uint8Array {
  const named = parseKeyFilenameSuffix(fileName);
  if (named === null) {
    throw slotRefused(
      "this file's name does not carry its key pair, so there is no telling which keys the " +
        'image was built for. Decrypted files come out named with the keys they contain.',
    );
  }
  const at = findEmbeddedKeyTable(bytes, named.keyA, named.keyB);
  if (at === null) {
    throw slotRefused(
      `the filename claims Key A ${bytesToHex(named.keyA)} and Key B ${bytesToHex(named.keyB)}, ` +
        `but ${describeKeyTableMismatch(bytes, named.keyA, named.keyB)}. Both keys must be ` +
        'present, exactly once each.',
      { keyA: bytesToHex(named.keyA), keyB: bytesToHex(named.keyB) },
    );
  }
  for (const offset of [at.offsetA, at.offsetB]) {
    if (offset < HEADER_OFFSET + HEADER_SIZE && offset + 16 > HEADER_OFFSET) {
      /* Those bytes are stored verbatim so the bootloader can read the length
       * before it has a key; rewriting them would change what it reads. */
      throw slotRefused(
        `this image keeps a key at ${hexUp(offset)}, inside the cleartext header window — ` +
          'refusing to patch it',
      );
    }
  }
  /* Two distinct 16-byte values: the same key named twice would leave Key A
   * nowhere in the image (the same check as flash.ts). */
  if (at.offsetA < at.offsetB + 16 && at.offsetB < at.offsetA + 16) {
    throw slotRefused(
      `the filename's Key A and Key B resolve to overlapping bytes at ${hexUp(at.offsetA)} and ` +
        `${hexUp(at.offsetB)} — they must be two distinct 16-byte values`,
    );
  }
  const alreadyMine = equalBytes(named.keyA, mine.keyA) && equalBytes(named.keyB, mine.keyB);
  let image = bytes;
  if (!alreadyMine) {
    image = bytes.slice();
    image.set(mine.keyA, at.offsetA);
    image.set(mine.keyB, at.offsetB);
  }
  if (findEmbeddedKeyTable(image, mine.keyA, mine.keyB) === null) {
    throw slotRefused(
      "after retargeting, the image does not carry this camera's key pair exactly once — " +
        'refusing to build a payload whose later upgrades the bootloader could not key',
    );
  }
  return image;
}

/* ---- the three staging forms ------------------------------------------- */

/** A staged payload and the stamped plaintext image it carries. */
export interface StagedBytes {
  /** The bytes that go through SetFeaturedFirmwareData, in order. */
  readonly payload: Uint8Array;
  /** The plaintext image as stamped (what the bank decrypts to, where it decrypts). */
  readonly stamped: Uint8Array;
}

/** Key A ciphertext for one bank: stamped, footered and padded (`buildBankPayload`). */
export function buildKeyAPayload(
  image: Uint8Array,
  keyA: Uint8Array,
  footerTemplate: Uint8Array | null,
  profile: { readonly cipher: CipherProfile; readonly memory: { readonly windowSize: number } },
): StagedBytes {
  try {
    const built = buildBankPayload(
      image,
      keyA,
      footerTemplate,
      profile.cipher,
      profile.memory.windowSize,
    );
    assertBankPayload(built.payload);
    return { payload: built.payload, stamped: built.image };
  } catch (error) {
    throw asSlotRefusal(error);
  }
}

/**
 * The image XOR the bank's own keystream, acceptance balanced through the
 * cleartext adjust word at 0x238 (the 2016 line's staged form, as
 * preservation/patch.ts stages it). The keystream is the generator the bank was
 * recovered under, so the bootloader decrypts the staged bytes back to the
 * stamped image word for word; the header window passes verbatim through the
 * cipher, which is why the adjust word can carry the balance.
 */
export function buildSlotKeystreamPayload(
  image: Uint8Array,
  slot: SlotState,
  cipher: CipherProfile,
): StagedBytes {
  if (slot.recovered === null) {
    throw slotRefused('the bank keystream is not known — the bank was not read under a key');
  }
  let stamped: AcceptSumResult;
  try {
    stamped = setAcceptSum(image, cipher);
  } catch (error) {
    throw asSlotRefusal(error);
  }
  if (stamped.sum !== cipher.acceptanceSum) {
    throw slotRefused('could not balance the decrypted word sum to the bootloader target');
  }
  const payload = cryptBytes(stamped.image, slot.recovered.state, cipher);
  return { payload, stamped: stamped.image };
}

/**
 * The 2014 plaintext chain's form: the image itself, length-stamped, the stored
 * word sum balanced to 0, and the chain's own three acceptance checks.
 */
export function buildPlainPayload(image: Uint8Array, cipher: CipherProfile): StagedBytes {
  try {
    const stamped = setAcceptSum(image, { ...cipher, acceptanceSum: 0 });
    if (stamped.sum !== 0) throw slotRefused('could not balance the stored word sum to 0');
    assertPlainChainPayload(stamped.image);
    return { payload: stamped.image, stamped: stamped.image };
  } catch (error) {
    throw asSlotRefusal(error);
  }
}

/* ---- what the bootloader will check, stated without refusing ----------- */

/**
 * The bootloader's own acceptance checks for a staged payload, as the list of
 * the ones it would FAIL. A raw payload is sent as given, so the page does not
 * refuse it for these; it says them. An empty list means the checks this page
 * knows about pass. It is not a claim that the image runs.
 */
export function bootloaderFailures(
  staging: StagingForm | null,
  payload: Uint8Array,
  cipher: CipherProfile,
  keys: { readonly keyA: Uint8Array | null; readonly slot: SlotState | null },
): string[] {
  if (payload.length < HEADER_OFFSET + HEADER_SIZE) {
    return [`the payload is ${String(payload.length)} B, too short to hold a header at 0x200`];
  }
  const failures: string[] = [];
  const dv = viewOf(payload);
  const magic = dv.getUint32(HEADER_OFFSET, true);
  if (magic !== IMAGE_MAGIC) {
    failures.push(
      `no image magic at 0x200 (found ${hexUp(magic)}, the bootloader needs ${hexUp(IMAGE_MAGIC)})`,
    );
  }
  const length = dv.getUint32(LENGTH_OFFSET, true);
  if (length === 0 || length > payload.length) {
    failures.push(
      `header.length ${hexUp(length)} is outside the ${hexUp(payload.length)} B payload`,
    );
    return failures;
  }

  if (staging === 'plain') {
    if (length !== payload.length) {
      failures.push(
        `header.length ${hexUp(length)} is not the payload length ${hexUp(payload.length)}`,
      );
    }
    if (payload.length > PLAIN_CHAIN_STAGE_MAX) {
      failures.push(
        `${hexUp(payload.length)} B is over the ${hexUp(PLAIN_CHAIN_STAGE_MAX)} B stage`,
      );
    }
    const sum = wordSum32(payload, payload.length);
    if (sum !== 0) failures.push(`stored word sum ${hexUp(sum)}, the 2014 bootloader needs 0`);
  } else if (staging === 'key-a-ciphertext') {
    const foff = footerOffsetFor(length);
    if (foff + FOOTER_SIZE > payload.length) {
      failures.push(`no footer at ${hexUp(foff)}: the payload ends at ${hexUp(payload.length)}`);
    } else {
      if (dv.getUint32(foff, true) !== FOOTER_TAG) {
        failures.push(
          `footer at ${hexUp(foff)} is not "CODE" — the bootloader takes its segmented loader`,
        );
      }
      if (dv.getUint32(foff + 4, true) !== length) {
        failures.push(`footer length does not equal header.length ${hexUp(length)}`);
      }
    }
    if (keys.keyA !== null) {
      const plain = cryptBytes(
        payload.subarray(0, length),
        stateFromKey(keys.keyA, cipher.whiteningK),
        cipher,
      );
      const sum = wordSum32(plain, length);
      if (sum !== cipher.acceptanceSum) {
        failures.push(
          `decrypted under this camera's Key A the word sum is ${hexUp(sum)}, the bootloader ` +
            `needs ${hexUp(cipher.acceptanceSum)}`,
        );
      }
    }
  } else if (staging === 'slot-keystream-ciphertext') {
    if (keys.slot?.recovered == null) {
      failures.push('the bank keystream is not known, so the decrypted word sum cannot be checked');
    } else {
      const plain = cryptBytes(payload.subarray(0, length), keys.slot.recovered.state, cipher);
      const sum = wordSum32(plain, length);
      if (sum !== cipher.acceptanceSum) {
        failures.push(
          `decrypted with the bank's keystream the word sum is ${hexUp(sum)}, the bootloader ` +
            `needs ${hexUp(cipher.acceptanceSum)}`,
        );
      }
    }
  }
  return failures;
}

/* ---- compare rows ------------------------------------------------------- */

/**
 * The rows a person reads before a write: what the bank holds now, and what it
 * will hold. Every row is shown, equal or not, so the plan is a complete
 * statement of the change.
 */
export function compareRows(
  before: {
    readonly header: ImageHeader | null;
    readonly sha256: string | null;
    readonly keyName: string | null;
  },
  after: {
    /** Null when the bytes do not parse as an image (a raw payload may not). */
    readonly header: ImageHeader | null;
    readonly image: Uint8Array;
    readonly keyName: string;
  },
): { field: string; before: string; after: string }[] {
  const none = '(no image)';
  const notImage = '(not an image)';
  const b = before.header;
  const a = after.header;
  const row = (
    field: string,
    onCamera: string,
    inImage: string | null,
  ): { field: string; before: string; after: string } => ({
    field,
    before: onCamera,
    after: inImage ?? notImage,
  });
  return [
    row('Firmware version', b?.versionStr ?? none, a?.versionStr ?? null),
    row('Image id', b ? hexUp(b.imageId) : none, a ? hexUp(a.imageId) : null),
    row('Initial SP', b ? hexUp(b.sp) : none, a ? hexUp(a.sp) : null),
    row('Reset vector', b ? hexUp(b.entry) : none, a ? hexUp(a.entry) : null),
    row('Size', b ? `${hex(b.length)} B` : none, a ? `${hex(a.length)} B` : null),
    { field: 'SHA-256 of the image', before: before.sha256 ?? none, after: sha256Sync(after.image) },
    { field: 'Key', before: before.keyName ?? none, after: after.keyName },
  ];
}

/** The header of a stamped image, or a refusal when it no longer parses as one. */
export function headerOf(image: Uint8Array): ImageHeader {
  const header = parseImageHeader(image);
  if (header === null) throw slotRefused('the stamped image no longer parses as an image');
  return header;
}

/** A bank-sized buffer holding `payload` at its start, the rest erased (0xFF). */
export function bankImageOf(payload: Uint8Array, bankBytes: number): Uint8Array {
  const out = new Uint8Array(bankBytes).fill(0xff);
  out.set(payload.subarray(0, bankBytes), 0);
  return out;
}
