/* OWNER: writer agent. See ./types.ts. */
/* ==================================================================== *
 * Deciding, after a commit, whether the bank holds what was written.
 *
 * THE DEVICE DECIDES WHAT IT STORES on the forms that encrypt. A payload
 * staged under Key A (2017+) or under the 2016 stage key is decrypted by the
 * bootloader and re-encrypted under the bank's own store key, so the bytes the
 * bank keeps are not the bytes that were sent, and nothing about them can be
 * predicted from the plan. The 2014 plain chain stores plain, so there the stored
 * bytes are compared: exactly what was sent, except on the 1.3.0.8 FF build, whose
 * staged payload is the image XOR two keystreams and which stores the image the
 * payload folds to (`storedAs: 'two-stream-fold'`, measured on the emulator). The
 * plan predicts those bytes too, so the compare is the same byte comparison with
 * its own words.
 *
 * What survives every form is the IMAGE the bank decrypts to. So the check
 * reads the bank back, recovers its keystream from the read-back ITSELF (the
 * same cryptanalytic solve the analysis and the dump use, nothing supplied by
 * the writer), decrypts the first header.length bytes, and compares them with
 * the plain image the plan says the bank must decrypt to. Equality is the only
 * way to say `verified: true`; a mismatch is `false`; `null` is reserved for a
 * plan that predicts neither the stored bytes nor the plain image.
 * ==================================================================== */

import { equalBytes, hex, hexUp, viewOf } from '../bytes.js';
import { decryptImage } from '../crypto/cipher.js';
import { recoverKeyInfo } from '../crypto/recover.js';
import { HEADER_OFFSET, HEADER_SIZE, IMAGE_MAGIC, parseImageHeader } from '../image/header.js';
import type { CipherProfile } from '../profiles/types.js';

/** The verdict on one read-back, with the notes a person reads beside it. */
export interface ReadBackVerdict {
  /** True on equality, false on any mismatch, null when no comparison was possible. */
  readonly verified: boolean | null;
  readonly notes: readonly string[];
}

/** What the plan says the bank must hold: the exact bytes, or the plain image, or neither. */
export interface ReadBackExpectation {
  /** The exact bank bytes, when they are predictable (the 2014 plain chain, FF build included). */
  readonly stored: Uint8Array | null;
  /** The plain image the bank must decrypt to, after stamping and balancing. */
  readonly plain: Uint8Array | null;
  /**
   * How `stored` relates to what was sent. 'as-sent' (the default) is the plain chain
   * programming the payload; 'two-stream-fold' is the FF build programming the image its
   * payload folds to. Only the words of the verdict differ.
   */
  readonly storedAs?: 'as-sent' | 'two-stream-fold';
}

/** The first offset at which two equal-length or longer arrays differ, or -1. */
function firstDifference(a: Uint8Array, b: Uint8Array): number {
  const span = Math.min(a.length, b.length);
  for (let i = 0; i < span; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : span;
}

/**
 * Compare a bank read back after a commit with what the plan predicted.
 *
 * Byte comparison when the stored bytes are predictable (the plan's `stored`);
 * otherwise the read-back's own keystream decrypts it and the first `plain.length`
 * bytes are compared with the plan's plain image. `kind` only changes the words
 * used when nothing can be compared, so a raw write says what it is.
 */
export function compareReadBack(
  after: Uint8Array,
  expected: ReadBackExpectation,
  cipher: CipherProfile,
  kind: 'plain' | 'raw',
): ReadBackVerdict {
  if (expected.stored !== null) {
    const stored = expected.stored;
    /* The FF build stores the image its payload folds to, not the payload: say so. */
    const folded = expected.storedAs === 'two-stream-fold';
    const predicted = folded
      ? 'the plain image the two-stream payload folds to'
      : 'the bytes the plan predicted';
    if (after.length !== stored.length) {
      return {
        verified: false,
        notes: [
          `the read-back is ${String(after.length)} B, the plan predicted ${String(stored.length)} B: ` +
            `the bank does NOT match ${predicted}`,
        ],
      };
    }
    if (equalBytes(after, stored)) {
      return {
        verified: true,
        notes: [
          folded
            ? 'the bank holds the plain image the two-stream payload folds to (the FF build stores ' +
              'the image, not the staged bytes), and the rest of the bank is erased'
            : 'the bank matches the bytes the plan predicted (the 2014 plain chain programs exactly ' +
              'what it is sent)',
        ],
      };
    }
    const at = firstDifference(after, stored);
    return {
      verified: false,
      notes: [`the bank does NOT match ${predicted} (first difference at ${hex(at)})`],
    };
  }

  if (expected.plain !== null) {
    const plain = expected.plain;
    const header = parseImageHeader(after);
    if (header?.magic !== IMAGE_MAGIC) {
      return {
        verified: false,
        notes: [
          `the read-back holds no image header at ${hex(HEADER_OFFSET)} (magic ` +
            `${hexUp(header?.magic ?? 0)}), so the bank does NOT decrypt to the expected image`,
        ],
      };
    }
    /* The bank's own cleartext length is what its bootloader reads: it must be the
     * length the plan's image has, and the bytes must be there to decrypt. */
    const length = header.length;
    if (length !== plain.length) {
      return {
        verified: false,
        notes: [
          `the read-back's header says ${hex(length)} B, the plan's image is ` +
            `${hex(plain.length)} B: the bank does NOT decrypt to the expected image`,
        ],
      };
    }
    if (length < HEADER_OFFSET + HEADER_SIZE || length > after.length) {
      return {
        verified: false,
        notes: [
          `the read-back is ${String(after.length)} B, too short for a ${hex(length)} B image: ` +
            'the bank does NOT decrypt to the expected image',
        ],
      };
    }
    /* The keystream comes from the read-back itself: its own reserved vectors
     * (known zero plaintext) solve for the state, as device-info does. */
    const view = viewOf(after);
    const recovered = recoverKeyInfo(view, 0, length, cipher);
    const decrypted = decryptImage(view, 0, length, recovered.state, cipher);
    const recoveredNote =
      `keystream recovered from the read-back (confidence ${recovered.confidence}, acceptance sum ` +
      `${hexUp(recovered.checksum)})`;
    if (equalBytes(decrypted, plain)) {
      return {
        verified: true,
        notes: [
          `the bank decrypts to the expected image (${hex(length)} B) under the ${recoveredNote}`,
        ],
      };
    }
    const at = firstDifference(decrypted, plain);
    return {
      verified: false,
      notes: [
        `the bank does NOT decrypt to the expected image: first difference at image offset ` +
          `${hex(at)} under the ${recoveredNote}`,
      ],
    };
  }

  return {
    verified: null,
    notes: [
      kind === 'raw'
        ? 'raw bytes: read-back reported, not compared (the bytes do not decrypt to a plain image ' +
          'this page can predict on this form, and the device re-encrypts what it keeps)'
        : 'no comparison was possible: the plan predicts neither the stored bytes nor the plain image',
    ],
  };
}
