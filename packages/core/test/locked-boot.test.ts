/* ==================================================================== *
 * The locked line's boot rule, profiles/locked-boot.ts: boot_select_image in the 2014 bootloader (image.c)
 * and in the 2016 one (FW-V1 targets/compact_pro_9hz_1_0_3_0_bootloader/src/image.c:1076-1109), the same
 * rule over one verdict per bank. Pure, no camera. The callers (slots/boot-choice.ts, device-info.ts
 * `checkKeyOf`) are tested in slots/boot-choice.test.ts and check-key.test.ts (TESTING.md 42.84).
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import {
  bankOfActiveSlotWord,
  bankWordsOf,
  enteredChecked,
  lockedBootOrder,
  lockedBootRule,
  selectLockedBoot,
  type BootVerdict,
} from '../src/profiles/locked-boot.js';
import type { SlotKey } from '../src/profiles/types.js';

const ALL_PASS: Readonly<Record<SlotKey, BootVerdict>> = { a: true, b: true, r: true };

describe('lockedBootOrder: the order boot_select_image tries the banks in', () => {
  it('0 and 0xFFFFFFFF (an erased record) try A, then B, then R', () => {
    expect(lockedBootOrder(0)).toEqual(['a', 'b', 'r']);
    expect(lockedBootOrder(0xffffffff)).toEqual(['a', 'b', 'r']);
    /* The word is read as unsigned: -1 is the erased record too. */
    expect(lockedBootOrder(-1)).toEqual(['a', 'b', 'r']);
  });

  it('1 tries B, then A, then R', () => {
    expect(lockedBootOrder(1)).toEqual(['b', 'a', 'r']);
  });

  it('any other word tries R, then A, then B', () => {
    for (const word of [2, 3, 0x100, 0x12345678, 0xfffffffe]) {
      expect(lockedBootOrder(word), String(word)).toEqual(['r', 'a', 'b']);
    }
  });

  it('says each rule in the words the page and the CLI print', () => {
    expect(lockedBootRule(0)).toBe('slot A first, then B, then recovery R');
    expect(lockedBootRule(0xffffffff)).toBe('slot A first, then B, then recovery R');
    expect(lockedBootRule(1)).toBe('slot B first, then A, then recovery R');
    expect(lockedBootRule(2)).toBe('recovery R first, then A, then B');
  });
});

describe('selectLockedBoot: the bank a start runs', () => {
  it('runs the first bank of the order when its check passes', () => {
    expect(selectLockedBoot(0xffffffff, ALL_PASS)).toEqual({
      runs: 'a',
      why: 'the boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, and it holds an image the bootloader accepts',
    });
    expect(selectLockedBoot(2, ALL_PASS).runs).toBe('r');
    /* A stray record reads in hex, as it is stored; the rule's own small words in decimal. */
    expect(selectLockedBoot(0xa5a5a5a5, ALL_PASS).why).toBe(
      'the boot-config word is 0xA5A5A5A5, so the bootloader tries recovery R first, and it holds an image the bootloader accepts',
    );
  });

  it('takes the second bank when the first is refused', () => {
    const choice = selectLockedBoot(1, { a: true, b: false, r: true });
    expect(choice.runs).toBe('a');
    expect(choice.why).toBe(
      'the boot-config word is 1, so the bootloader tries slot B first; slot B holds no image the bootloader accepts, so it takes slot A',
    );
  });

  it('enters the last bank, unchecked, when the first two are refused, whatever it holds', () => {
    const recovery = selectLockedBoot(0, { a: false, b: false, r: false });
    expect(recovery.runs).toBe('r');
    expect(recovery.why).toBe(
      'the boot-config word is 0, so the bootloader tries slot A first; neither slot A nor slot B holds an image the bootloader accepts, so it boots recovery R, which it does not check',
    );
    /* An unread last bank does not matter: it is never checked. */
    expect(selectLockedBoot(0, { a: false, b: false, r: null }).runs).toBe('r');
    const slotB = selectLockedBoot(2, { a: false, b: null, r: false });
    expect(slotB.runs).toBe('b');
    expect(slotB.why).toContain('so it takes slot B, which it does not check');
  });

  it('names no bank when a bank the order reaches has no verdict, and says which and why', () => {
    const first = selectLockedBoot(0, { a: null, b: true, r: true });
    expect(first.runs).toBeNull();
    expect(first.why).toBe(
      'the boot-config word is 0, so the bootloader tries slot A first, but slot A was not read, so the bank that runs is not known',
    );
    const second = selectLockedBoot(1, { a: null, b: false, r: true }, 'could not be checked');
    expect(second.runs).toBeNull();
    expect(second.why).toBe(
      'the boot-config word is 1, so the bootloader tries slot B first, but slot A could not be checked, so the bank that runs is not known',
    );
  });
});

describe('enteredChecked: whether the bootloader checked a bank before it entered it', () => {
  it('is every bank but the last of the word’s order', () => {
    expect(enteredChecked(0xffffffff, 'a')).toBe(true);
    expect(enteredChecked(0xffffffff, 'b')).toBe(true);
    expect(enteredChecked(0xffffffff, 'r')).toBe(false);
    expect(enteredChecked(1, 'b')).toBe(true);
    expect(enteredChecked(1, 'a')).toBe(true);
    expect(enteredChecked(1, 'r')).toBe(false);
    expect(enteredChecked(2, 'r')).toBe(true);
    expect(enteredChecked(2, 'a')).toBe(true);
    expect(enteredChecked(2, 'b')).toBe(false);
  });
});

describe('the active-slot word and the bank names', () => {
  it('maps the bootloader’s record to a bank: 0 A, 1 B, 2 R, and nothing else', () => {
    expect(bankOfActiveSlotWord(0)).toBe('a');
    expect(bankOfActiveSlotWord(1)).toBe('b');
    expect(bankOfActiveSlotWord(2)).toBe('r');
    expect(bankOfActiveSlotWord(3)).toBeNull();
    expect(bankOfActiveSlotWord(0xffffffff)).toBeNull();
    expect(bankOfActiveSlotWord(null)).toBeNull();
  });

  it('names a bank as the page and the CLI do', () => {
    expect(bankWordsOf('a')).toBe('slot A');
    expect(bankWordsOf('b')).toBe('slot B');
    expect(bankWordsOf('r')).toBe('recovery R');
  });
});
