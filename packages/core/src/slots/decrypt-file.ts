/* ==================================================================== *
 * Decrypting ONE firmware slot from a file, with no camera.
 *
 * The file is one bank (64 KiB) exactly as the bank stores it: what a slot dump
 * wrote, or the 64 KiB at a bank's offset in a whole-flash dump. The decryption
 * is the one `dumpSlot` runs on a bank it has read, so the two cannot disagree:
 *
 *  - the 1.3.0.8 FF image under Key B is tried first (`ffKeyBPlainOf`): its bank
 *    keeps the image under a keystream of a known key pair, not a recovered key;
 *  - otherwise the key is SOLVED out of the bank's own ciphertext
 *    (`recoverKeyInfo`, the cryptanalytic solve: no key search, no device key),
 *    and the image is decrypted under it (`decryptImage`).
 *
 * The cipher profile only names the key form; the plaintext does not depend on
 * it (`cryptImage` is self-inverse under the state alone). So the file is not
 * assigned a family to decrypt it: the family is named from the acceptance sum
 * the decrypted image produces, and a sum no family accepts is reported, not
 * hidden.
 *
 * NOTHING IS GUESSED. A file that is not 64 KiB, holds no image header, or whose
 * key does not recover to a reset vector a Cortex-M can start from is REFUSED,
 * with the reason. An erased bank is reported as empty, with nothing to decrypt.
 * Nothing here talks to a device.
 * ==================================================================== */

import { hexUp, sha256hex, viewOf } from '../bytes.js';
import { decryptImage } from '../crypto/cipher.js';
import { resolveWhitening } from '../crypto/keys.js';
import { CANDIDATE_K, recoverKeyInfo, slotChainOf } from '../crypto/recover.js';
import {
  HEADER_OFFSET,
  IMAGE_MAGIC,
  TRY_KEYS_MAX_LEN,
  parseImageHeader,
  type ImageHeader,
} from '../image/header.js';
import { KEY_PAIRS } from '../preservation/patch.js';
import { getProfile, listProfiles } from '../profiles/registry.js';
import { ffKeyBPlainOf, FF_ACCEPT_SUM } from './ff-form.js';
import { SLOT_BYTES } from './types.js';

/** How the key of a decrypted slot was obtained. */
export type SlotFileKeyMethod =
  /** Solved out of the bank's own ciphertext (the cryptanalytic solve). */
  | 'solved'
  /** The 1.3.0.8 FF image under its Key B keystream (the known pair). */
  | 'ff-key-b'
  /** The bank holds the image in the clear (the 2014 plaintext chain): no key. */
  | 'stored-plain';

export interface SlotFileKey {
  readonly method: SlotFileKeyMethod;
  /**
   * The 16-byte key in the form the decrypted image itself holds it, as hex, or
   * null when there is no key (a stored-plain bank).
   */
  readonly keyHex: string | null;
  /** The whitening constant that form uses (K), or null when there is no key. */
  readonly whiteningK: number | null;
  /**
   * 'plaintext': that key form occurs exactly once in the decrypted image, which
   * is the evidence that names it. 'profile-default': no form was found, so the
   * family's own K is reported and the difference is said.
   */
  readonly evidence: 'plaintext' | 'profile-default' | null;
}

export interface DecryptedSlotFile {
  readonly kind: 'decrypted';
  readonly plain: Uint8Array;
  readonly plainSha256: string;
  /** The image header the decrypted bytes carry (version, length, entry). */
  readonly header: ImageHeader;
  /** The decrypted word sum over `header.length`: the bootloader's acceptance sum. */
  readonly acceptanceSum: number;
  /** The registered families whose acceptance sum this image produces (names). */
  readonly families: readonly string[];
  readonly key: SlotFileKey;
  readonly notes: readonly string[];
}

/** A bank that is erased: all 0xFF, so there is no image in it to decrypt. */
export interface SlotFileEmpty {
  readonly kind: 'empty';
  readonly reason: string;
}

/** A file that cannot be decrypted, and why. Never a crash, never a guess. */
export interface SlotFileRefused {
  readonly kind: 'refused';
  readonly reason: string;
}

export type SlotFileResult = DecryptedSlotFile | SlotFileEmpty | SlotFileRefused;

/** The FF build's Key B pair, the key its bank holds the image under. */
const FF_KEY_B_HEX = KEY_PAIRS.ff1308.block1;

/** Families (by registered name) whose acceptance target the given sum is. */
function familiesAccepting(sum: number): readonly string[] {
  return listProfiles()
    .filter((profile) => profile.id !== 'generic' && profile.cipher.acceptanceSum === sum)
    .map((profile) => profile.name);
}

/** The whitening constant a family's key form uses first (the generic fallback's when none names it). */
function firstKFor(sum: number): number {
  const named = listProfiles().find(
    (profile) => profile.id !== 'generic' && profile.cipher.acceptanceSum === sum,
  );
  return (named ?? getProfile('generic')).cipher.whiteningK;
}

/**
 * Decrypts one 64 KiB bank file. Pure apart from the hash; the file is read by the
 * caller and nothing is sent anywhere.
 */
export async function decryptSlotFile(bytes: Uint8Array): Promise<SlotFileResult> {
  if (bytes.length !== SLOT_BYTES) {
    return {
      kind: 'refused',
      reason:
        `a firmware slot is exactly ${String(SLOT_BYTES)} bytes (64 KiB, one bank); ` +
        `this file is ${String(bytes.length)} bytes`,
    };
  }
  if (bytes.every((byte) => byte === 0xff)) {
    return {
      kind: 'empty',
      reason:
        'all 65,536 bytes are 0xFF: this is an erased bank, so there is no image in it and nothing to decrypt',
    };
  }

  /* The 1.3.0.8 FF image is the one bank whose image is not under a solved key:
   * it is tried first, as dumpSlot does, and the notes say so. */
  const ffPlain = ffKeyBPlainOf(bytes);
  if (ffPlain !== null) {
    const header = parseImageHeader(ffPlain);
    if (header === null) {
      return { kind: 'refused', reason: 'the FF image under Key B has no readable header' };
    }
    return {
      kind: 'decrypted',
      plain: ffPlain,
      plainSha256: await sha256hex(ffPlain),
      header,
      acceptanceSum: FF_ACCEPT_SUM,
      families: familiesAccepting(FF_ACCEPT_SUM),
      key: {
        method: 'ff-key-b',
        keyHex: FF_KEY_B_HEX,
        whiteningK: null,
        evidence: 'plaintext',
      },
      notes: [
        `decrypted ${String(ffPlain.length)} B under Key B of the 1.3.0.8 FF pair: the image is stored ` +
          'as its key block 1 keystream XOR, header window verbatim (TESTING.md 42.12)',
      ],
    };
  }

  const header = parseImageHeader(bytes);
  if (header?.magic !== IMAGE_MAGIC) {
    return {
      kind: 'refused',
      reason:
        `no firmware image header at 0x200 (magic ${hexUp(header?.magic ?? 0)}), so this file ` +
        'does not hold a firmware image this page can decrypt',
    };
  }
  if (header.length < HEADER_OFFSET || header.length >= TRY_KEYS_MAX_LEN || header.length & 3) {
    return {
      kind: 'refused',
      reason: `the image header's length ${hexUp(header.length)} is out of range, so there is no image to decrypt`,
    };
  }

  const view = viewOf(bytes);
  /* The state does not depend on the cipher profile (only the clear window does, and
   * every family shares it), so the generic profile's cipher solves it for all. */
  const recovered = recoverKeyInfo(
    view,
    0,
    header.length,
    getProfile('generic').cipher,
    CANDIDATE_K,
  );
  if (!recovered.sane) {
    return {
      kind: 'refused',
      reason:
        "the key does not recover: under the key this bank's ciphertext implies, the image starts " +
        'with a reset vector no Cortex-M core can start from, so the file is not a bank this ' +
        `page can decrypt (confidence ${recovered.confidence})`,
    };
  }

  const plain = decryptImage(view, 0, header.length, recovered.state, getProfile('generic').cipher);
  const plainHeader = parseImageHeader(plain) ?? header;
  const sum = recovered.checksum >>> 0;
  const families = familiesAccepting(sum);
  const notes: string[] = [];
  notes.push(
    `decrypted ${String(plain.length)} B under the key solved from this bank's ciphertext ` +
      `(confidence ${recovered.confidence}, acceptance sum ${hexUp(sum)})`,
  );
  if (families.length === 0) {
    notes.push(
      `the acceptance sum ${hexUp(sum)} is the target of no registered family, so the bootloader ` +
        'would not take this image as it stands; it is decrypted all the same',
    );
  }

  if (slotChainOf(recovered.state) === 'plain' && sum === 0) {
    notes.push('the bank holds the image in the clear (the 2014 plaintext chain): there is no key');
    return {
      kind: 'decrypted',
      plain,
      plainSha256: await sha256hex(plain),
      header: plainHeader,
      acceptanceSum: sum,
      families,
      key: { method: 'stored-plain', keyHex: null, whiteningK: null, evidence: null },
      notes,
    };
  }

  const primary = firstKFor(sum);
  const whitening = resolveWhitening(plain, recovered.state, [
    primary,
    ...CANDIDATE_K.filter((k) => k >>> 0 !== primary >>> 0),
  ]);
  notes.push(
    whitening.evidence === 'plaintext'
      ? `the key is named in the image itself, in the form K=${hexUp(whitening.whiteningK)}`
      : `no key form occurs once in the image, so the family default K=${hexUp(whitening.whiteningK)} is shown`,
  );
  return {
    kind: 'decrypted',
    plain,
    plainSha256: await sha256hex(plain),
    header: plainHeader,
    acceptanceSum: sum,
    families,
    key: {
      method: 'solved',
      keyHex: whitening.keyHex,
      whiteningK: whitening.whiteningK,
      evidence: whitening.evidence,
    },
    notes,
  };
}
