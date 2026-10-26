/**
 * The key recovery's verdict in words (TESTING.md 42.88): one map, a phrase per `KeyConfidence` value, and
 * the note form that carries the acceptance sum. Everything a person reads takes its words from here; the
 * JSON keeps the code.
 */

import { describe, expect, it } from 'vitest';
import { keyCheckText, keyConfidencePhrase } from '../src/crypto/confidence-words.js';
import type { KeyConfidence } from '../src/crypto/recover.js';

const ALL: readonly KeyConfidence[] = ['VERIFIED(profile)', 'VERIFIED(structural)', 'UNVERIFIED'];

describe('keyConfidencePhrase', () => {
  it('gives each verdict a short phrase, none of them the code name', () => {
    expect(ALL.map(keyConfidencePhrase)).toEqual([
      'verified by the acceptance sum',
      'verified by the vector table only',
      'not verified',
    ]);
    for (const confidence of ALL) {
      const phrase = keyConfidencePhrase(confidence);
      expect(phrase).not.toMatch(/VERIFIED|\(|\)/);
      expect(phrase).toBe(phrase.toLowerCase());
    }
  });
});

describe('keyCheckText', () => {
  it('reads the sum after "acceptance sum" when the sum is what verified the key', () => {
    expect(keyCheckText('VERIFIED(profile)', 0)).toBe(
      'key verified by the acceptance sum 0x00000000',
    );
  });

  it('names the sum apart when it did not verify the key', () => {
    expect(keyCheckText('VERIFIED(structural)', 0x1234abcd)).toBe(
      'key verified by the vector table only; acceptance sum 0x1234ABCD',
    );
    expect(keyCheckText('UNVERIFIED', 0xffff)).toBe('key not verified; acceptance sum 0x0000FFFF');
  });
});
