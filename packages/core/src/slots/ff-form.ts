/* ==================================================================== *
 * The 1.3.0.8 16 Hz (FF) image on the 2014 chain, in the form the vendor app stages it
 * and the form a bank keeps (TESTING.md 42.12).
 *
 *   staged payload  = image XOR key block 0 (Key A), header window 0x200..0x23F verbatim
 *   stored bank     = image XOR key block 1 (Key B), header window verbatim
 *
 * The FF app's commit gates the staged payload on sum(payload XOR Key A) == 0xFFFF, then
 * re-keys it (payload XOR Key A XOR Key B) outside the header window and programs the
 * result, so the bank keeps the image under Key B. The vendor's own shipped file
 * (firmware_extracted/32K_43X0_1.3.0.8_COMPACT-16HZ_Public.bin) is exactly the staged
 * payload of the corpus image, byte for byte; the test reads that file when it is present.
 *
 * Pure: bytes in, bytes out. Each key pair is found BY VALUE (`locateFFKeys`), and every
 * keystream is the device's own xorshift128 walk (`keystream`, raw seed, no whitening).
 * The 2014 bootloader takes a bank only when its stored word sum is 0, so the stored bank
 * is not taken at A or B; recovery R runs unchecked (TESTING.md 42.10). Whether the stored
 * form boots is not measured for this build (no genuine bootloader for it is in the corpus).
 * ==================================================================== */

import { viewOf } from '../bytes.js';
import { SeekError } from '../errors.js';
import { PLAIN_CHAIN_STAGE_MAX, wordSum32 } from '../image/bank.js';
import {
  HEADER_OFFSET,
  HEADER_SIZE,
  IMAGE_MAGIC,
  LENGTH_OFFSET,
} from '../image/header.js';
import {
  KEY_PAIRS,
  keystream,
  keyWordsOf,
  locateFFKeys,
  xorWindowVerbatim,
} from '../preservation/patch.js';

/** The FF app's acceptance sum on the Key A staged form, and on the Key B stored bank. */
export const FF_ACCEPT_SUM = 0xffff;

function ffRefused(message: string, detail?: Readonly<Record<string, unknown>>): SeekError {
  return new SeekError('slots/refused', message, detail === undefined ? {} : { detail });
}

/** The header length of a bank that holds an image (magic at 0x200, length under 64 KiB), or null. */
function bankHeaderLength(bank: Uint8Array): number | null {
  if (bank.length < HEADER_OFFSET + HEADER_SIZE) return null;
  const dv = viewOf(bank);
  if (dv.getUint32(HEADER_OFFSET, true) !== IMAGE_MAGIC) return null;
  const len = dv.getUint32(LENGTH_OFFSET, true);
  if (len < HEADER_OFFSET + HEADER_SIZE || len >= 0x10000 || (len & 3) !== 0) return null;
  return len <= bank.length ? len : null;
}

/** The FF image as it is staged for the camera, and the bank bytes the camera keeps from it. */
export interface FFVendorStaging {
  /** The image with its header length stamped: the plain image the bank decrypts to. */
  readonly stamped: Uint8Array;
  /** The payload that goes through SetFeaturedFirmwareData: the image XOR Key A, header verbatim. */
  readonly staged: Uint8Array;
  /** The bank bytes after the camera's re-key: the image XOR Key B, header verbatim. */
  readonly stored: Uint8Array;
}

/**
 * The 1.3.0.8 FF image in the vendor's staged form. Refused, with nothing built, unless the
 * image is a whole number of words inside the staging buffer, carries the 1.3.0.8-FF key pair
 * exactly once per half, and has the word sum 0xFFFF the FF app accepts.
 */
export function stageFFVendor(image: Uint8Array): FFVendorStaging {
  if (image.length > PLAIN_CHAIN_STAGE_MAX) {
    throw ffRefused(
      `image is ${String(image.length)} B; the staging buffer holds ${String(PLAIN_CHAIN_STAGE_MAX)} B, ` +
        'so the stream would stop part-way. Nothing was written.',
    );
  }
  if (image.length < HEADER_OFFSET + HEADER_SIZE || (image.length & 3) !== 0) {
    throw ffRefused(`the FF image is ${String(image.length)} B, which is not a whole image. Nothing was written.`);
  }
  const stamped = image.slice();
  const dv = viewOf(stamped);
  if (dv.getUint32(LENGTH_OFFSET, true) !== stamped.length) {
    dv.setUint32(LENGTH_OFFSET, stamped.length >>> 0, true);
  }
  const keys = locateFFKeys(stamped);
  if (keys === null || keys.block1Hex === null) {
    throw ffRefused(
      'the image does not carry the 1.3.0.8-FF key pair (each half exactly once), so its keys ' +
        'cannot be named. Nothing was written.',
    );
  }
  const sum = wordSum32(stamped, stamped.length);
  if (sum !== FF_ACCEPT_SUM) {
    throw ffRefused(
      `the FF image's word sum is ${sum.toString(16).toUpperCase().padStart(8, '0')}, not 0xFFFF, so the ` +
        'camera would refuse its staged form. Nothing was written.',
      { sum },
    );
  }
  const words = stamped.length >> 2;
  const staged = xorWindowVerbatim(stamped, keystream(keyWordsOf(keys.block0Hex), words));
  const stored = xorWindowVerbatim(stamped, keystream(keyWordsOf(keys.block1Hex), words));
  return { stamped, staged, stored };
}

/**
 * The plain image a RAW payload is, when it is the vendor's staged form: its image XOR Key A
 * has the word sum 0xFFFF and carries the 1.3.0.8-FF key pair. Null otherwise, so any other
 * raw payload is sent as given and not described as this image.
 */
export function ffPlainOfStaged(payload: Uint8Array): Uint8Array | null {
  if (payload.length < HEADER_OFFSET + HEADER_SIZE || (payload.length & 3) !== 0) return null;
  const plain = xorWindowVerbatim(
    payload,
    keystream(keyWordsOf(KEY_PAIRS.ff1308.block0), payload.length >> 2),
  );
  if (wordSum32(plain, plain.length) !== FF_ACCEPT_SUM) return null;
  return locateFFKeys(plain) === null ? null : plain;
}

/**
 * The bank bytes the camera keeps from a plain 1.3.0.8 FF image: the image XOR the Key B
 * keystream, header window verbatim. The same bytes `stageFFVendor` predicts as `stored`.
 */
export function ffKeyBStoredOf(plain: Uint8Array): Uint8Array {
  return xorWindowVerbatim(
    plain,
    keystream(keyWordsOf(KEY_PAIRS.ff1308.block1), plain.length >> 2),
  );
}

/**
 * The plain FF image a bank holds under Key B, or null. The bank qualifies only when the image
 * its header describes, decrypted with Key B (header window verbatim), has the word sum 0xFFFF
 * and carries the 1.3.0.8-FF key pair. That is the FF app's own acceptance on the stored bank
 * (`ffBankVerdict` in running.ts), plus the pair, so the old plain form (the image in the clear)
 * is not taken for this one.
 */
export function ffKeyBPlainOf(bank: Uint8Array): Uint8Array | null {
  const len = bankHeaderLength(bank);
  if (len === null) return null;
  const plain = xorWindowVerbatim(
    bank.subarray(0, len),
    keystream(keyWordsOf(KEY_PAIRS.ff1308.block1), len >> 2),
  );
  if (wordSum32(plain, len) !== FF_ACCEPT_SUM) return null;
  return locateFFKeys(plain) === null ? null : plain;
}
