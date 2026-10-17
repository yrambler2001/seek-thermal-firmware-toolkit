/* ==================================================================== *
 * The 1.3.0.8 FF (16 Hz) image on the bench: which subject it is, and what the camera
 * keeps once the page has written it to recovery bank R (TESTING 42.6).
 *
 * The page writes the FF image to bank R only, in its two-stream staged form. The camera
 * folds the payload back and programs the plain image, so the bank holds that image with
 * its adjust word (0x238) re-solved, and nothing else. `predictedFFStored` works that out
 * from the image and its key pair alone, by the same formula the core test
 * `expectedFFStored` uses (corpus-locked-run.ts), and NOT by the page's own builder. So a
 * read-back is checked against a prediction, not against the code that made the write.
 * ==================================================================== */

import { wordSum32 } from '../../../packages/core/src/image/bank.js';
import { viewOf } from '../../../packages/core/src/bytes.js';
import { LENGTH_OFFSET } from '../../../packages/core/src/image/header.js';
import {
  KEY_PAIRS,
  REBALANCE_WORD_OFFSET,
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

/**
 * The bank the camera holds after the page's FF write of `image`: the image with its length
 * stamped, its adjust word solved so sum(image ^ ksD) is 0xFFFF, the rest of the bank erased.
 * Throws when `image` is not a whole number of words past the adjust word, or does not fit.
 */
export function predictedFFStored(image: Uint8Array, bankBytes = FF_BANK_BYTES): Uint8Array {
  if (image.length > bankBytes || (image.length & 3) !== 0) {
    throw new Error(
      `an FF image is ${String(image.length)} B: not a whole number of words in one bank`,
    );
  }
  if (image.length < REBALANCE_WORD_OFFSET + 4) {
    throw new Error(`an FF image is ${String(image.length)} B: shorter than its adjust word`);
  }
  const words = image.length >>> 2;
  const ksD = keystream(keyWordsOf(KEY_PAIRS.ff1308.block1), words);
  const stored = image.slice();
  const view = viewOf(stored);
  if (view.getUint32(LENGTH_OFFSET, true) !== stored.length) {
    view.setUint32(LENGTH_OFFSET, stored.length >>> 0, true);
  }
  view.setUint32(REBALANCE_WORD_OFFSET, 0, true);
  const base = wordSum32(xorWindowVerbatim(stored, ksD), stored.length);
  view.setUint32(REBALANCE_WORD_OFFSET, (0xffff - base) >>> 0, true);
  const out = new Uint8Array(bankBytes).fill(0xff);
  out.set(stored, 0);
  return out;
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
