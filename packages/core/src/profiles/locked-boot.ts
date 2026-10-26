/* ==================================================================== *
 * Which bank a locked-line bootloader enters, from the boot-config word and each bank's check. Pure.
 *
 * THE RULE, decoded from both bootloaders of the line and measured on the emulator against the bank
 * that ran (TESTING.md 42.53, 42.56):
 *   2014 (Compact 1.3.0.0, bootloader 0.9.0.0): bootloader src/image.c, boot_select_image.
 *   2016 (Compact PRO 1.0.3.x, bootloader 1.2.0.0, Jun 26 2016): FW-V1
 *     targets/compact_pro_9hz_1_0_3_0_bootloader/src/image.c:1076-1109, boot_select_image.
 *   0 or 0xFFFFFFFF: A if it passes the check, else B if it does, else R, which is not checked.
 *   1:               B if it passes, else A if it does, else R, which is not checked.
 *   any other word:  R if it passes, else A if it does, else B, which is not checked.
 *
 * THE CHECK differs by line, and the caller supplies it as one verdict per bank:
 *   2014: image_sum_ok on the stored bytes (the magic at +0x200, a length under 0x10000, and the word
 *         sum over that length is 0); the banks are stored plain.
 *   2016: image_sum_ok_device_seeded (src/hand_spifi.c:35-44): the same guards, and the word sum of the
 *         bank decrypted under the device-seeded stream is 0. On a bootloader whose version word is above
 *         1.1.0.0 (the 1.0.3.0 9 Hz and FF bootloaders are 1.2.0.0), that stream is seeded from the
 *         bootloader's own key block 1 (src/crypto.c:233-249, prng_seed_device_or_key). The read names
 *         that key from the bank the camera entered (workflows/device-info.ts `checkKeyOf`).
 * ==================================================================== */

import { hexUp } from '../bytes.js';
import type { SlotKey } from './types.js';

/** true: the bootloader's check passes. false: it refuses. null: not known (the bank was not read). */
export type BootVerdict = boolean | null;

/**
 * The bank the active-slot word names: 0 slot A, 1 slot B, 2 recovery R (the bootloader's store before it
 * enters the image, TESTING.md 42.53, 42.56). Null for any other value, or when unread.
 */
export function bankOfActiveSlotWord(activeSlotWord: number | null): SlotKey | null {
  if (activeSlotWord === 0) return 'a';
  if (activeSlotWord === 1) return 'b';
  if (activeSlotWord === 2) return 'r';
  return null;
}

/** A bank as the page and the CLI name it, lower case: "slot A", "slot B", "recovery R". */
export function bankWordsOf(key: SlotKey): string {
  if (key === 'a') return 'slot A';
  if (key === 'b') return 'slot B';
  return 'recovery R';
}

/**
 * The order the bootloader tries the banks in for one boot-config word. The last bank is entered
 * without its check when the first two fail.
 */
export function lockedBootOrder(word: number): readonly [SlotKey, SlotKey, SlotKey] {
  const w = word >>> 0;
  if (w === 0 || w === 0xffffffff) return ['a', 'b', 'r'];
  if (w === 1) return ['b', 'a', 'r'];
  return ['r', 'a', 'b'];
}

/** The boot-config word's rule, as the page and the CLI print it. */
export function lockedBootRule(word: number): string {
  const [first, second, last] = lockedBootOrder(word);
  const name = (key: SlotKey): string => (key === 'r' ? 'recovery R' : key.toUpperCase());
  return `${bankWordsOf(first)} first, then ${name(second)}, then ${name(last)}`;
}

/**
 * The word as a sentence names it: the small values the rule is written in (0, 1, 2 …) in decimal, as the
 * bootloader source compares them, and anything else in hex, which is how a stray or erased record reads
 * (0xFFFFFFFF, or 0xA5A5A5A5 rather than 2779096485).
 */
function wordText(word: number): string {
  const w = word >>> 0;
  return w < 0x10 ? String(w) : hexUp(w);
}

export interface LockedBootSelection {
  /** The bank the start runs, or null when a bank the rule needs has no verdict. */
  readonly runs: SlotKey | null;
  /** One sentence: the word's rule and the bank it gives, or what could not be checked. */
  readonly why: string;
}

/**
 * boot_select_image(), over the word and each bank's verdict. `unknown` says why a bank has no verdict
 * (by default it was not read).
 */
export function selectLockedBoot(
  word: number,
  accepts: Readonly<Record<SlotKey, BootVerdict>>,
  unknown = 'was not read',
): LockedBootSelection {
  const [first, second, last] = lockedBootOrder(word);
  const head = `the boot-config word is ${wordText(word)}, so the bootloader tries ${bankWordsOf(first)} first`;
  const unchecked = (key: SlotKey): LockedBootSelection => ({
    runs: null,
    why: `${head}, but ${bankWordsOf(key)} ${unknown}, so the bank that runs is not known`,
  });
  const firstOk = accepts[first];
  if (firstOk === null) return unchecked(first);
  if (firstOk) return { runs: first, why: `${head}, and it holds an image the bootloader accepts` };
  const secondOk = accepts[second];
  if (secondOk === null) return unchecked(second);
  if (secondOk) {
    return {
      runs: second,
      why: `${head}; ${bankWordsOf(first)} holds no image the bootloader accepts, so it takes ${bankWordsOf(second)}`,
    };
  }
  return {
    runs: last,
    why:
      `${head}; neither ${bankWordsOf(first)} nor ${bankWordsOf(second)} holds an image the ` +
      `bootloader accepts, so it ${last === 'r' ? 'boots' : 'takes'} ${bankWordsOf(last)}, which it does not check`,
  };
}

/**
 * Whether the bootloader checked `entered` before it entered it under this word: every bank but the last
 * of the order. A bank entered unchecked proves nothing about the check.
 */
export function enteredChecked(word: number, entered: SlotKey): boolean {
  return lockedBootOrder(word)[2] !== entered;
}
