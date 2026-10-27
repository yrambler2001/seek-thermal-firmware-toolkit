/* ==================================================================== *
 * The words for a staging form. `StagingForm` and `PlanStaging` are code names
 * ('slot-keystream-ciphertext', ...): the JSON outputs keep them for scripts, and
 * everything a person reads says the form in words, from this one map. The page's
 * write log, its prepared-write panel, the CLI's flash plan and core's own write
 * log all take their words from here (TESTING.md 42.87).
 * ==================================================================== */

import type { PlanStaging } from './types.js';

export interface StagingWords {
  /** A short phrase for a log line: "staged under the image's own key". */
  readonly phrase: string;
  /** What the form means, for a plan's "staging" row. */
  readonly detail: string;
}

const STAGING_WORDS: Readonly<Record<PlanStaging, StagingWords>> = {
  'key-a-ciphertext': {
    phrase: "staged under the camera's own keys",
    detail: 'encrypted so the device stores it under the key the booted bank holds',
  },
  'slot-keystream-ciphertext': {
    phrase: "staged under the image's own key",
    detail:
      "encrypted under the image's own stage key (key block 0); the camera stores it under the bank's own key",
  },
  plain: {
    phrase: 'staged plain',
    detail: 'plaintext, no cipher',
  },
  'key-a-keystream': {
    phrase: 'staged as the vendor app stages the FF image (XOR Key A)',
    detail:
      'the 1.3.0.8 FF image as the vendor app stages it (XOR Key A) — the 16 Hz build stores it under Key B, not these bytes',
  },
  verbatim: {
    phrase: 'sent as given',
    detail: 'verbatim — the bytes exactly as given',
  },
};

/** The short phrase for a staging form, for a log line. */
export function stagingPhrase(staging: PlanStaging): string {
  return STAGING_WORDS[staging].phrase;
}

/** What a staging form means, for a plan's "staging" row. */
export function stagingDetail(staging: PlanStaging): string {
  return STAGING_WORDS[staging].detail;
}
