/* ==================================================================== *
 * The 1.3.0.8 FF (16 Hz) image on the bench: which subject it is, what the page sends for it,
 * and what the camera keeps (TESTING 42.12).
 *
 * The page stages the FF image as the vendor app does: the image XOR Key A (key block 0), header
 * window 0x200..0x23F verbatim. The camera re-keys that with Key B (key block 1) and programs the
 * result, so the bank holds the image XOR Key B, header verbatim, and nothing else.
 * `predictedFFVendorPayload` and `predictedFFStored` work both out from the plain image and the key
 * pair alone, by the formulas in preservation/patch.ts (`keystream`, `xorWindowVerbatim`), NOT by
 * the page's own builder, so a read-back is checked against a prediction. The vendor app's own file
 * (32K_43X0_1.3.0.8_COMPACT-16HZ_Public.bin, sha256 fd9da63b...) is the byte-for-byte oracle for
 * the payload.
 * ==================================================================== */

import { viewOf } from '../../../packages/core/src/bytes.js';
import { wordSum32 } from '../../../packages/core/src/image/bank.js';
import { LENGTH_OFFSET } from '../../../packages/core/src/image/header.js';
import {
  KEY_PAIRS,
  keyWordsOf,
  keystream,
  locateFFKeys,
  xorWindowVerbatim,
} from '../../../packages/core/src/preservation/patch.js';
import type { BenchSubject } from './types.js';

/** One bank, as the page dumps and writes it. */
export const FF_BANK_BYTES = 0x10000;

/** The FF build's version, as the camera reports it and the tree names it. */
export const FF_VERSION = '1.3.0.8';

/** The plain corpus FF image (sha256 b97ced91...), the decrypted Compact FF Jan 6 2017 bank. */
export const PLAIN_FF_SHA256 = 'b97ced91fff9f0949a02f35fceab697634cc109a0fe2a2fbbfe6ccfadb7d4d16';
/** The vendor app's file for it, 32K_43X0_1.3.0.8_COMPACT-16HZ_Public.bin: the staged payload. */
export const VENDOR_FF_SHA256 = 'fd9da63b22c9b03ef1b93ef1c62e27128c90c40b04780c726064f14aeb99d133';
/** The bank the camera keeps after the vendor write: the plain image XOR Key B, header verbatim. */
export const STORED_FF_SHA256 = 'fdc8be406ea5387b65cf32b20463eb28a1168e7a54a2c47cbb575a9c4c5d318d';

/**
 * Whether a subject is the 1.3.0.8 FF build. The tree's variant is 'ff' for the 16 Hz image;
 * the 8 Hz build of the same version is 'std', and the other FF rows are other versions.
 */
export function isFF1308Subject(subject: Pick<BenchSubject, 'version' | 'variant'>): boolean {
  return subject.version === FF_VERSION && subject.variant === 'ff';
}

/**
 * The FF image's own length: the header's length word, when it is a whole number of words
 * that fits the bank. Null when the bank does not hold an image of that size.
 */
export function ffImageLength(bank: Uint8Array): number | null {
  if (bank.length < LENGTH_OFFSET + 4) return null;
  const length = viewOf(bank).getUint32(LENGTH_OFFSET, true);
  if (length === 0 || length > bank.length || (length & 3) !== 0) return null;
  return length;
}

/** The plain FF image, with its length stamped, as a whole number of words that fits one bank. */
function stampedImage(image: Uint8Array, bankBytes: number): Uint8Array {
  if (image.length > bankBytes || (image.length & 3) !== 0) {
    throw new Error(
      `an FF image is ${String(image.length)} B: not a whole number of words in one bank`,
    );
  }
  const stamped = image.slice();
  const view = viewOf(stamped);
  if (view.getUint32(LENGTH_OFFSET, true) !== stamped.length) {
    view.setUint32(LENGTH_OFFSET, stamped.length >>> 0, true);
  }
  return stamped;
}

/**
 * The staged payload the vendor app sends for the FF image: the image XOR Key A (key block 0),
 * header window verbatim, padded to the bank size with 0xFF. The vendor file is this payload
 * (sha256 fd9da63b...) for the corpus image, byte for byte. Not solved, not two-stream.
 */
export function predictedFFVendorPayload(image: Uint8Array, bankBytes = FF_BANK_BYTES): Uint8Array {
  const stamped = stampedImage(image, bankBytes);
  const keys = locateFFKeys(stamped);
  if (keys === null || keys.block1Hex === null) {
    throw new Error('the FF image does not carry the 1.3.0.8-FF key pair, each half once');
  }
  const ksA = keystream(keyWordsOf(keys.block0Hex), stamped.length >>> 2);
  const out = new Uint8Array(bankBytes).fill(0xff);
  out.set(xorWindowVerbatim(stamped, ksA), 0);
  return out;
}

/**
 * The bank the camera holds after the vendor write of `image`: the plain image XOR Key B (key
 * block 1), header window verbatim, the rest of the bank erased. Worked out from the image and the
 * key pair here, not by the page's builder.
 */
export function predictedFFStored(image: Uint8Array, bankBytes = FF_BANK_BYTES): Uint8Array {
  const stamped = stampedImage(image, bankBytes);
  const keys = locateFFKeys(stamped);
  if (keys === null || keys.block1Hex === null) {
    throw new Error('the FF image does not carry the 1.3.0.8-FF key pair, each half once');
  }
  const ksB = keystream(keyWordsOf(keys.block1Hex), stamped.length >>> 2);
  const out = new Uint8Array(bankBytes).fill(0xff);
  out.set(xorWindowVerbatim(stamped, ksB), 0);
  return out;
}

/** The word sum the FF app accepts on the staged payload: sum(payload XOR Key A) == 0xFFFF. */
export function vendorGateSum(image: Uint8Array): number {
  const payload = predictedFFVendorPayload(image, image.length);
  const ksA = keystream(keyWordsOf(KEY_PAIRS.ff1308.block0), payload.length >>> 2);
  return wordSum32(xorWindowVerbatim(payload, ksA), payload.length);
}

/** Whether `image` carries the 1.3.0.8-FF key pair, each half exactly once (what the page checks). */
export function carriesFFKeyPair(image: Uint8Array): boolean {
  return locateFFKeys(image) !== null;
}

/** The first byte where two equal-length byte arrays differ, and how many differ, for a failure message. */
export function describeDifference(a: Uint8Array, b: Uint8Array): string {
  if (a.length !== b.length) return `${String(a.length)} B, not ${String(b.length)} B`;
  let first = -1;
  let count = 0;
  for (let at = 0; at < a.length; at++) {
    if (a[at] !== b[at]) {
      if (first < 0) first = at;
      count += 1;
    }
  }
  if (first < 0) return 'identical';
  return `${String(count)} byte(s) differ, first at 0x${first.toString(16).padStart(6, '0')}`;
}
