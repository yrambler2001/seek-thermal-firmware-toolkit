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
 * staged payload is the image XOR Key A and which stores the image XOR Key B
 * (`storedAs: 'key-b-ciphertext'`, ff-form.ts). The plan predicts those bytes too,
 * so the compare is the same byte comparison with its own words.
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
import { keyCheckMessage } from '../crypto/confidence-words.js';
import { errorCoreMessage } from '../errors.js';
import { coreMessage, paramText, type CoreMessage, type CoreParam } from '../message.js';
import { recoverKeyInfo } from '../crypto/recover.js';
import { HEADER_OFFSET, HEADER_SIZE, IMAGE_MAGIC, parseImageHeader } from '../image/header.js';
import type { CipherProfile } from '../profiles/types.js';

/** The verdict on one read-back, with the notes a person reads beside it. */
export interface ReadBackVerdict {
  /** True on equality, false on any mismatch, null when no comparison was possible. */
  readonly verified: boolean | null;
  readonly notes: readonly string[];
  /** `notes` as messages, for the page. */
  readonly noteMessages: readonly CoreMessage[];
}

/**
 * The note on a read-back decrypted under its own keystream: it decrypts to the expected image, or, with
 * `differsAt` (hex), where it first differs. `check` is how the keystream was confirmed (`keyCheckMessage`).
 */
export function decryptedNote(
  differsAt: string | null,
  said: { readonly length: string; readonly check: CoreMessage },
): CoreMessage {
  const recovered = coreMessage(
    'readBack.recovered',
    { check: said.check },
    `keystream recovered from the read-back (${said.check.text})`,
  );
  return differsAt === null
    ? coreMessage(
        'readBack.decrypts',
        { length: said.length, recovered },
        `the bank decrypts to the expected image (${said.length} B) under the ${recovered.text}`,
      )
    : coreMessage(
        'readBack.decryptDiffers',
        { offset: differsAt, recovered },
        `the bank does NOT decrypt to the expected image: first difference at image offset ` +
          `${differsAt} under the ${recovered.text}`,
      );
}

function verdictOf(verified: boolean | null, note: CoreMessage): ReadBackVerdict {
  return { verified, notes: [note.text], noteMessages: [note] };
}

/* ---- a bank write's own notes (flashSlot), as messages; the CLI prints their text ---- */

export const NO_READ_WINDOW_NOTE: CoreMessage = coreMessage(
  'written.noReadWindow',
  {},
  'this build names no read window for the bank, so nothing was read back',
);

export const VERIFY_OFF_NOTE: CoreMessage = coreMessage(
  'written.verifyOff',
  {},
  'verify is off: the bank was not read back',
);

/** The first note of a write: what was committed where, how it was staged, the commit status. */
export function writtenCommittedNote(said: {
  readonly size: string;
  readonly name: CoreParam;
  readonly address: string;
  readonly staged: CoreMessage;
  readonly status: string;
}): CoreMessage {
  return coreMessage(
    'written.committed',
    said,
    `committed ${said.size} B to ${paramText(said.name)} at ${said.address}, ` +
      `${said.staged.text}; commit status ${said.status}`,
  );
}

/** The read-back failed: the error's own message (a code where core's error carries one). */
export function readBackFailedNote(error: unknown): CoreMessage {
  const said: CoreParam =
    errorCoreMessage(error) ?? (error instanceof Error ? error.message : String(error));
  return coreMessage(
    'written.readBackFailed',
    { error: said },
    `the read-back failed: ${paramText(said)}`,
  );
}

export function readBackNote(size: string, sha256: string): CoreMessage {
  return coreMessage(
    'written.readBack',
    { size, sha256 },
    `read back ${size} B, SHA-256 ${sha256}`,
  );
}

/** What the plan says the bank must hold: the exact bytes, or the plain image, or neither. */
export interface ReadBackExpectation {
  /** The exact bank bytes, when they are predictable (the 2014 plain chain, FF build included). */
  readonly stored: Uint8Array | null;
  /** The plain image the bank must decrypt to, after stamping and balancing. */
  readonly plain: Uint8Array | null;
  /**
   * How `stored` relates to what was sent. 'as-sent' (the default) is the plain chain
   * programming the payload; 'key-b-ciphertext' is the FF build re-keying the payload and
   * storing the image under Key B. Only the words of the verdict differ.
   */
  readonly storedAs?: 'as-sent' | 'key-b-ciphertext';
}

/**
 * Which of the plan's predictions a read-back is compared with, in people's words. The bank's bytes when the
 * plan predicts them: as they were sent (the 2014 plain chain, and an FF payload a camera writes as sent), or
 * the image as the 16 Hz build stores it under its own key (`storedForm` 'key-b-ciphertext'). Else the image
 * the bank must decode to. Null when the plan predicts neither. The verdict's notes and each front end's
 * read-back line name it, so a mismatch says what it was compared with (TESTING.md 42.110).
 */
export function readBackReferenceOf(plan: {
  readonly expectedStored: Uint8Array | null;
  readonly storedForm?: 'as-sent' | 'key-b-ciphertext';
  readonly expectedPlain?: Uint8Array | null;
}): string | null {
  if (plan.expectedStored !== null) return storedReference(plan.storedForm ?? 'as-sent');
  return (plan.expectedPlain ?? null) === null ? null : PLAIN_REFERENCE;
}

function storedReference(storedAs: 'as-sent' | 'key-b-ciphertext'): string {
  return storedReferenceMessage(storedAs).text;
}

function storedReferenceMessage(storedAs: 'as-sent' | 'key-b-ciphertext'): CoreMessage {
  return storedAs === 'key-b-ciphertext'
    ? coreMessage(
        'readBack.reference.folded',
        {},
        'the bytes the plan predicted the bank would hold (the image as the 16 Hz build stores it, ' +
          'not the bytes sent)',
      )
    : coreMessage(
        'readBack.reference.asSent',
        {},
        'the bytes the plan predicted the bank would hold (the bytes as they were sent)',
      );
}

const PLAIN_REFERENCE = 'the image the plan predicted the bank would decode to';

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
    /* The FF build stores the image under Key B, not the payload: say so. */
    const folded = expected.storedAs === 'key-b-ciphertext';
    const predicted = storedReferenceMessage(expected.storedAs ?? 'as-sent');
    if (after.length !== stored.length) {
      const [size, predictedSize] = [String(after.length), String(stored.length)];
      return verdictOf(
        false,
        coreMessage(
          'readBack.sizeDiffers',
          { size, predictedSize, reference: predicted },
          `the read-back is ${size} B, the plan predicted ${predictedSize} B: ` +
            `the bank does NOT match ${predicted.text}`,
        ),
      );
    }
    if (equalBytes(after, stored)) {
      return verdictOf(
        true,
        folded
          ? coreMessage(
              'readBack.matchesFolded',
              {},
              'the bank holds the image as the 16 Hz build stores it (not the bytes sent), and the ' +
                'rest of the bank is erased',
            )
          : coreMessage(
              'readBack.matches',
              {},
              'the bank matches the bytes the plan predicted (the 2014 plain chain programs exactly ' +
                'what it is sent)',
            ),
      );
    }
    const at = hex(firstDifference(after, stored));
    return verdictOf(
      false,
      coreMessage(
        'readBack.differs',
        { reference: predicted, offset: at },
        `the bank does NOT match ${predicted.text} (first difference at ${at})`,
      ),
    );
  }

  if (expected.plain !== null) {
    const plain = expected.plain;
    const header = parseImageHeader(after);
    if (header?.magic !== IMAGE_MAGIC) {
      const [offset, magic] = [hex(HEADER_OFFSET), hexUp(header?.magic ?? 0)];
      return verdictOf(
        false,
        coreMessage(
          'readBack.noHeader',
          { offset, magic },
          `the read-back holds no image header at ${offset} (magic ` +
            `${magic}), so the bank does NOT decrypt to the expected image`,
        ),
      );
    }
    /* The bank's own cleartext length is what its bootloader reads: it must be the
     * length the plan's image has, and the bytes must be there to decrypt. */
    const length = header.length;
    if (length !== plain.length) {
      return verdictOf(
        false,
        coreMessage(
          'readBack.lengthDiffers',
          { length: hex(length), imageLength: hex(plain.length) },
          `the read-back's header says ${hex(length)} B, the plan's image is ` +
            `${hex(plain.length)} B: the bank does NOT decrypt to the expected image`,
        ),
      );
    }
    if (length < HEADER_OFFSET + HEADER_SIZE || length > after.length) {
      return verdictOf(
        false,
        coreMessage(
          'readBack.tooShort',
          { size: String(after.length), length: hex(length) },
          `the read-back is ${String(after.length)} B, too short for a ${hex(length)} B image: ` +
            'the bank does NOT decrypt to the expected image',
        ),
      );
    }
    /* The keystream comes from the read-back itself: its own reserved vectors
     * (known zero plaintext) solve for the state, as device-info does. */
    const view = viewOf(after);
    const recovered = recoverKeyInfo(view, 0, length, cipher);
    const decrypted = decryptImage(view, 0, length, recovered.state, cipher);
    /* The verdict in words (TESTING.md 42.88): "key verified by the acceptance sum 0x00000000". */
    const equal = equalBytes(decrypted, plain);
    return verdictOf(
      equal,
      decryptedNote(equal ? null : hex(firstDifference(decrypted, plain)), {
        length: hex(length),
        check: keyCheckMessage(recovered.confidence, recovered.checksum),
      }),
    );
  }

  return verdictOf(
    null,
    kind === 'raw'
      ? coreMessage(
          'readBack.rawNotCompared',
          {},
          'raw bytes: read-back reported, not compared (the bytes do not decrypt to a plain image ' +
            'that can be predicted on this form, and the device re-encrypts what it keeps)',
        )
      : coreMessage(
          'readBack.notCompared',
          {},
          'no comparison was possible: the plan predicts neither the stored bytes nor the plain image',
        ),
  );
}
