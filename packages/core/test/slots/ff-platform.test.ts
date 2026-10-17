/* ==================================================================== *
 * The FF (16 Hz) image's bank rule, from the camera's bootloader (ff-platform.ts).
 * Pure: a bootloader version in, a rule and a refusal out. The measured facts are
 * TESTING.md 42.10 (0.9.0.0: R only) and 42.12 (2.0.2.3: no bank boots the page's form).
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import {
  FF_PLATFORM_BOOTLOADER,
  LEGACY_2014_BOOTLOADER,
  ffBankRuleOf,
  ffWriteRefusal,
} from '../../src/slots/ff-platform.js';
import type { SlotKey } from '../../src/profiles/types.js';

const keys: readonly SlotKey[] = ['a', 'b', 'r'];

describe("ffBankRuleOf: the rule follows the camera's bootloader", () => {
  it('the 2014 bootloader (0.9.0.0) takes the FF image in recovery R only (42.10)', () => {
    const rule = ffBankRuleOf({ bootloaderVersion: LEGACY_2014_BOOTLOADER });
    expect(rule.kind).toBe('recovery-only');
    expect(rule.bootloader).toBe('0.9.0.0');
  });

  it('the FF platform bootloader (2.0.2.3) refuses the page form for every bank (42.12)', () => {
    const rule = ffBankRuleOf({ bootloaderVersion: FF_PLATFORM_BOOTLOADER });
    expect(rule.kind).toBe('refused');
    expect(rule.bootloader).toBe('2.0.2.3');
    expect(rule.why).toMatch(/42\.12/);
    expect(rule.why).toMatch(/none booted alone/);
  });

  it('a bootloader nobody measured is refused, and the reason says it is unknown', () => {
    const rule = ffBankRuleOf({ bootloaderVersion: '1.2.0.0' });
    expect(rule.kind).toBe('refused');
    expect(rule.why).toMatch(/1\.2\.0\.0 is not one the FF image was measured on/);
  });

  it('a camera that reports no bootloader version is refused (conservative)', () => {
    const rule = ffBankRuleOf({ bootloaderVersion: null });
    expect(rule.kind).toBe('refused');
    expect(rule.bootloader).toBeNull();
    expect(rule.why).toMatch(/did not report its bootloader version/);
  });
});

describe('ffWriteRefusal: which bank the FF image may take', () => {
  it('on 0.9.0.0, R is allowed and A and B are refused with the existing text', () => {
    const state = { bootloaderVersion: LEGACY_2014_BOOTLOADER };
    expect(ffWriteRefusal(state, 'r')).toBeNull();
    for (const key of ['a', 'b'] as const) {
      const refusal = ffWriteRefusal(state, key);
      expect(refusal?.message).toMatch(/can be written to R only/);
      expect(refusal?.message).toContain(`bank ${key.toUpperCase()}`);
    }
  });

  it('on 2.0.2.3, every bank is refused, and nothing is written', () => {
    const state = { bootloaderVersion: FF_PLATFORM_BOOTLOADER };
    for (const key of keys) {
      const refusal = ffWriteRefusal(state, key);
      expect(refusal, `bank ${key}`).not.toBeNull();
      expect(refusal?.message).toMatch(/Nothing was written\./);
      expect(refusal?.message).toMatch(/2\.0\.2\.3/);
      expect(refusal?.detail).toMatchObject({ key, bootloader: '2.0.2.3' });
    }
  });

  it('with no bootloader version, every bank is refused', () => {
    for (const key of keys) {
      expect(ffWriteRefusal({ bootloaderVersion: null }, key), `bank ${key}`).not.toBeNull();
    }
  });
});
