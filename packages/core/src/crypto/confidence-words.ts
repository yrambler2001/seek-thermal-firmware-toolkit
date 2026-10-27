/* ==================================================================== *
 * The words for a key recovery's verdict. `KeyConfidence` is a code name
 * ('VERIFIED(family)', ...): the JSON outputs (the archive manifest, the CLI's
 * decrypt JSON, the slot-file decryption's `key.confidence`) keep it for scripts,
 * and everything a person reads says the verdict in words, from this one map: the
 * read-back and dump notes, the slot-file decryptor and its report, the offline
 * decrypt report and log, and the CLI's decrypt table (TESTING.md 42.88).
 * ==================================================================== */

import { hexUp } from '../bytes.js';
import type { KeyConfidence } from './recover.js';

const CONFIDENCE_PHRASE: Readonly<Record<KeyConfidence, string>> = {
  /* The decrypted image sums to the line's acceptance target: the check the bootloader itself makes. */
  'VERIFIED(family)': 'verified by the acceptance sum',
  /* No known target matched, but the reserved vector decrypts to 0 and the reset vector is a Cortex-M entry. */
  'VERIFIED(structural)': 'verified by the vector table only',
  /* Neither: the bytes are decrypted all the same, and nothing confirms the key. */
  UNVERIFIED: 'not verified',
};

/** The verdict in words: "verified by the acceptance sum", "verified by the vector table only", "not verified". */
export function keyConfidencePhrase(confidence: KeyConfidence): string {
  return CONFIDENCE_PHRASE[confidence];
}

/**
 * The verdict and the acceptance sum, for a note: "key verified by the acceptance sum 0x00000000", or
 * "key verified by the vector table only; acceptance sum 0x1234ABCD" when the sum is not what verified it.
 */
export function keyCheckText(confidence: KeyConfidence, acceptanceSum: number): string {
  const phrase = keyConfidencePhrase(confidence);
  return confidence === 'VERIFIED(family)'
    ? `key ${phrase} ${hexUp(acceptanceSum)}`
    : `key ${phrase}; acceptance sum ${hexUp(acceptanceSum)}`;
}
