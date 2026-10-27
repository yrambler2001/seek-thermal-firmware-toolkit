/* ==================================================================== *
 * Decrypting ONE firmware bank from a file, with no camera.
 *
 * The file is a bank as a slot read stores it: 64 KiB, the image at offset 0,
 * the bank's own pad and footer after it. This is the offline counterpart of
 * the decrypt step inside `dumpSlot` (dump.ts), with the same answers to the
 * same questions:
 *
 *   - an erased bank (every byte 0xFF) is empty, and there is nothing to decrypt;
 *   - no image header, or a header.length outside the image range, is not decrypted;
 *   - the 1.3.0.8 FF image under Key B is decoded with its own keystream (ff-form.ts);
 *   - otherwise the key is recovered from the bank's own ciphertext (the GF(2)
 *     solve in crypto/recover.ts, no key search), and the image is decrypted only
 *     when its reset vector looks like a Cortex-M entry. Nothing is guessed.
 *
 * What a bank does NOT have is the bootloader's key table, so the key is named
 * only when it matches one of the application key pairs this build knows
 * (application-pairs.ts). A key that matches none is reported as what it is: a
 * key the file holds, under the whitening constant the image's own plaintext
 * decided (resolveWhitening), with no name.
 *
 * Pure, and it touches no device. The CLI's `decrypt slot` and the web's
 * "Decrypt a firmware slot" both call it.
 * ==================================================================== */

import { hexToBytes, hexUp, sha256hex, viewOf } from '../bytes.js';
import { SeekError } from '../errors.js';
import { decryptImage } from '../crypto/cipher.js';
import { keyCheckText, keyConfidencePhrase } from '../crypto/confidence-words.js';
import { identifyKey, resolveWhitening, type KeyPair } from '../crypto/keys.js';
import { CANDIDATE_K, recoverKeyInfo, slotChainOf, type KeyConfidence } from '../crypto/recover.js';
import type { Xorshift128State } from '../crypto/xorshift128.js';
import {
  HEADER_OFFSET,
  HEADER_SIZE,
  IMAGE_MAGIC,
  TRY_KEYS_MAX_LEN,
  parseImageHeader,
  type ImageHeader,
} from '../image/header.js';
import { detectProfile } from '../profiles/registry.js';
import type { FirmwareProfile } from '../profiles/types.js';
import { evidenceFromDump } from '../workflows/decrypt.js';
import { APPLICATION_KEY_PAIRS } from './application-pairs.js';
import { ffKeyBPlainOf } from './ff-form.js';
import { SLOT_BYTES } from './types.js';

/**
 * What the file holds.
 *  - 'decrypted'      the image decrypted (under a recovered key, under Key B, or stored plain);
 *  - 'empty'          every byte is 0xFF: an erased bank, nothing to decrypt;
 *  - 'no-image'       no image header at offset 0 (or an erased header with other bytes after it);
 *  - 'bad-header'     the header is there but its length is outside the image range;
 *  - 'not-decrypted'  an image header, but the key does not recover to a Cortex-M entry.
 */
export type SlotFileStatus = 'decrypted' | 'empty' | 'no-image' | 'bad-header' | 'not-decrypted';

/**
 * How the image's key was obtained. 'cryptanalytic' is the xorshift128 solve; 'ff-key-b' is the
 * 1.3.0.8 FF form (its own keystream, no solve); 'stored-plain' is the 2014 plaintext chain, whose
 * banks hold the image as it runs and have no key at all.
 */
export type SlotFileKeyMethod = 'cryptanalytic' | 'ff-key-b' | 'stored-plain';

export interface SlotFileKey {
  readonly method: SlotFileKeyMethod;
  /** The recovered xorshift128 state, four words in hex (cryptanalytic only). */
  readonly state: readonly string[] | null;
  /** The whitening constant the key is written under (cryptanalytic only). */
  readonly whiteningK: number | null;
  /** What decided `whiteningK`: a key form that occurs once in the plaintext, or the profile's default. */
  readonly whiteningEvidence: 'plaintext' | 'family-default' | null;
  /** The 16-byte key in the form the image holds, in hex (cryptanalytic only). */
  readonly key: string | null;
  /** The key recovery's verdict, as a code for scripts (cryptanalytic only); people read `keyConfidencePhrase`. */
  readonly confidence: KeyConfidence | null;
  /** The acceptance sum of the decrypted image (cryptanalytic only). */
  readonly acceptanceSum: number | null;
  /** Whether that sum is the profile's acceptance target (cryptanalytic only). */
  readonly matchesFamily: boolean | null;
  /**
   * The application key this is, as "Key A of <builds>" or "Key B of <builds>", when it matches
   * a pair this build knows. Null otherwise: the key is real, it just has no name here.
   */
  readonly named: string | null;
}

export interface SlotFileHeader {
  readonly version: string;
  /** header.length in bytes. */
  readonly length: number;
  readonly imageId: number;
  readonly sp: number;
  readonly entry: number;
}

export interface SlotFileDecryption {
  readonly status: SlotFileStatus;
  /** The file's size in bytes: always SLOT_BYTES, since anything else is refused. */
  readonly size: number;
  /** SHA-256 of the file as given. */
  readonly sha256: string;
  readonly profile: { readonly id: string; readonly name: string; readonly detected: boolean };
  readonly header: SlotFileHeader | null;
  readonly key: SlotFileKey | null;
  /** The decrypted image, header.length bytes. Null unless `status` is 'decrypted'. */
  readonly plain: Uint8Array | null;
  readonly plainSha256: string | null;
  /** What happened, in the order it happened, in plain words. */
  readonly notes: readonly string[];
}

export interface DecryptSlotFileOptions {
  /**
   * The family to decrypt under. Omitted: the family is detected from the bank's own image, the
   * same evidence `decrypt` uses for a dump (`evidenceFromDump`).
   */
  readonly profile?: FirmwareProfile;
}

function headerOf(header: ImageHeader): SlotFileHeader {
  return {
    version: header.versionStr,
    length: header.length,
    imageId: header.imageId,
    sp: header.sp,
    entry: header.entry,
  };
}

/** The application key pair (of this build's known ones) the recovered key is, or null. */
function applicationKeyName(
  state: Xorshift128State,
  accepts: boolean,
  whiteningK: number,
): string | null {
  for (const pair of APPLICATION_KEY_PAIRS) {
    const table: KeyPair = { keyA: hexToBytes(pair.keyA), keyB: hexToBytes(pair.keyB) };
    const identity = identifyKey({ state, accepts }, table, null, whiteningK);
    if (identity.name === 'Key A' || identity.name === 'Key B') {
      return `${identity.name} of ${pair.builds}`;
    }
  }
  return null;
}

/**
 * Decrypts one 64 KiB firmware bank. Refuses, before anything is decided, any file that is not
 * exactly one bank: a shorter file may be a truncated read and a longer one is not a bank.
 */
export async function decryptSlotFile(
  bytes: Uint8Array,
  options: DecryptSlotFileOptions = {},
): Promise<SlotFileDecryption> {
  if (bytes.length !== SLOT_BYTES) {
    throw new SeekError(
      'slots/refused',
      `a firmware bank is ${String(SLOT_BYTES)} B (64 KiB); this file is ${String(bytes.length)} B`,
      { detail: { size: bytes.length } },
    );
  }
  const sha256 = await sha256hex(bytes);
  const detected = options.profile === undefined;
  const profile = options.profile ?? detectProfile(evidenceFromDump(bytes)).best.profile;
  const notes: string[] = [];

  const finish = async (
    status: SlotFileStatus,
    header: SlotFileHeader | null,
    key: SlotFileKey | null,
    plain: Uint8Array | null,
  ): Promise<SlotFileDecryption> => ({
    status,
    size: bytes.length,
    sha256,
    profile: { id: profile.id, name: profile.name, detected },
    header,
    key,
    plain,
    plainSha256: plain === null ? null : await sha256hex(plain),
    notes,
  });

  if (bytes.every((byte) => byte === 0xff)) {
    notes.push(
      `empty, nothing to decrypt: all ${String(bytes.length)} B read as 0xFF (an erased bank)`,
    );
    return finish('empty', null, null, null);
  }

  const headWindow = bytes.subarray(0, HEADER_OFFSET + HEADER_SIZE);
  const header = parseImageHeader(bytes);
  if (header?.magic !== IMAGE_MAGIC) {
    if (headWindow.every((byte) => byte === 0xff)) {
      notes.push(
        'erased: the header window is all 0xFF, so the bank holds no image; nothing is decrypted',
      );
    } else {
      notes.push(
        `no image header (magic ${hexUp(header?.magic ?? 0)}), so there is no image to decrypt`,
      );
    }
    return finish('no-image', null, null, null);
  }

  const length = header.length;
  if (length < HEADER_OFFSET || length >= TRY_KEYS_MAX_LEN || (length & 3) !== 0) {
    notes.push(`header.length ${hexUp(length)} is out of range; no image to decrypt`);
    return finish('bad-header', headerOf(header), null, null);
  }

  /* The 1.3.0.8 FF image under Key B first, as dumpSlot does: its keystream is known, so it is
   * decoded, not solved. */
  const keyBPlain = ffKeyBPlainOf(bytes);
  if (keyBPlain !== null) {
    notes.push(
      `decrypted ${String(keyBPlain.length)} B under FF 1.3.0.8 Key B: the image is stored as the ` +
        'image XOR its key block 1 keystream, header window verbatim',
    );
    return finish(
      'decrypted',
      headerOf(header),
      {
        method: 'ff-key-b',
        state: null,
        whiteningK: null,
        whiteningEvidence: null,
        key: null,
        confidence: null,
        acceptanceSum: null,
        matchesFamily: null,
        named: 'FF 1.3.0.8 Key B',
      },
      keyBPlain,
    );
  }

  const cipher = profile.cipher;
  const view = viewOf(bytes);
  const own = cipher.whiteningK >>> 0;
  const candidateKs = [own, ...CANDIDATE_K.filter((k) => k >>> 0 !== own)];
  const recovered = recoverKeyInfo(view, 0, length, cipher, candidateKs);
  if (!recovered.sane) {
    notes.push(
      'key not recovered: the image decrypts to a reset vector that is not a Cortex-M entry ' +
        `(key ${keyConfidencePhrase(recovered.confidence)}); nothing is decrypted`,
    );
    return finish('not-decrypted', headerOf(header), null, null);
  }

  const plain = decryptImage(view, 0, length, recovered.state, cipher);

  if (slotChainOf(recovered.state) === 'plain') {
    notes.push(
      'stored plain: the bank holds the image as it runs (the 2014 plaintext chain, an identity ' +
        'keystream), so there is no key and the decrypted image is the image itself',
    );
    return finish(
      'decrypted',
      headerOf(header),
      {
        method: 'stored-plain',
        state: null,
        whiteningK: null,
        whiteningEvidence: null,
        key: null,
        confidence: null,
        acceptanceSum: null,
        matchesFamily: null,
        named: null,
      },
      plain,
    );
  }

  const whitening = resolveWhitening(plain, recovered.state, candidateKs);
  const named = applicationKeyName(recovered.state, recovered.matchesFamily, whitening.whiteningK);
  notes.push(
    `decrypted ${String(plain.length)} B under the key recovered from this bank ` +
      `(${keyCheckText(recovered.confidence, recovered.checksum)}` +
      (named === null ? '' : `; it is ${named}`) +
      ')',
  );
  return finish(
    'decrypted',
    headerOf(header),
    {
      method: 'cryptanalytic',
      state: Array.from(recovered.state, (word) => hexUp(word)),
      whiteningK: whitening.whiteningK,
      whiteningEvidence: whitening.evidence,
      key: whitening.keyHex,
      confidence: recovered.confidence,
      acceptanceSum: recovered.checksum >>> 0,
      matchesFamily: recovered.matchesFamily,
      named,
    },
    plain,
  );
}

/**
 * The plain-text report of one decryption, as the CLI and the web write it beside the image. It
 * says what the file was, which family and why, the key's identity, and the sizes and digests a
 * reader needs to check the image against another copy.
 */
export function slotFileReport(result: SlotFileDecryption, fileName: string): string {
  const lines: string[] = [
    'Firmware bank decryption report',
    '===============================',
    `Source      : ${fileName} (${String(result.size)} bytes)`,
    `sha256      : ${result.sha256}`,
    `Family      : ${result.profile.name} [${result.profile.id}] (${
      result.profile.detected ? 'detected from the bank' : 'given by the caller'
    })`,
    `Status      : ${statusText(result.status)}`,
  ];
  if (result.header !== null) {
    lines.push(
      `Image       : version ${result.header.version}, length ${String(result.header.length)} B ` +
        `(${hexUp(result.header.length)}), image id ${hexUp(result.header.imageId)}`,
    );
  }
  const key = result.key;
  if (key !== null) {
    lines.push('Key');
    if (key.method === 'stored-plain') {
      lines.push('  method      : stored plain (2014 plaintext chain; no key)');
    } else if (key.method === 'ff-key-b') {
      lines.push('  method      : FF 1.3.0.8 Key B (the image XOR its key block 1 keystream)');
    } else {
      lines.push(
        '  method      : cryptanalytic (xorshift128 solve from the ciphertext; no key search)',
      );
      lines.push(`  state       : ${(key.state ?? []).join(' ')}`);
      lines.push(
        `  key         : ${key.key ?? '(none)'}  (K=${hexUp(key.whiteningK ?? 0)}, ` +
          `${key.whiteningEvidence === 'plaintext' ? 'the key occurs once in the plaintext' : "the family's default K"})`,
      );
      lines.push(
        `  acceptance  : ${hexUp(key.acceptanceSum ?? 0)} (${
          key.matchesFamily === true ? 'the family target' : 'not the family target'
        })`,
      );
      /* The verdict in words; the JSON's `key.confidence` keeps the code (TESTING.md 42.88). */
      lines.push(
        `  check       : ${key.confidence === null ? 'not made' : `key ${keyConfidencePhrase(key.confidence)}`}`,
      );
    }
    lines.push(
      `  named       : ${key.named ?? 'no name: it matches no application key pair this build knows'}`,
    );
  }
  if (result.plain !== null) {
    lines.push(
      `Decrypted   : ${String(result.plain.length)} B, sha256 ${result.plainSha256 ?? '(none)'}`,
    );
  }
  if (result.notes.length > 0) {
    lines.push('Notes');
    for (const note of result.notes) lines.push(`  - ${note}`);
  }
  return `${lines.join('\n')}\n`;
}

function statusText(status: SlotFileStatus): string {
  switch (status) {
    case 'decrypted':
      return 'decrypted';
    case 'empty':
      return 'empty (erased bank, nothing to decrypt)';
    case 'no-image':
      return 'no firmware image in this bank';
    case 'bad-header':
      return 'header out of range, not decrypted';
    case 'not-decrypted':
      return 'an image header, but its key does not recover, not decrypted';
  }
}
