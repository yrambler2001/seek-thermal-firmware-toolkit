/* ==================================================================== *
 * The words for the bank the camera boots now, the same on every line (TESTING.md 42.89).
 *
 * Where the bank comes from differs by line: on the 2014 plaintext chain and the 2016 Compact PRO the read
 * names it from the active-slot word, the bootloader's own record of the bank it entered, which TESTING.md
 * 42.56 measured as the bank that ran (1.3.0.0 and 1.0.3.0, boot words 0, 1 and 2); on 4.x from the
 * boot-config replay, checked against the camera. The 2014 chain used to hedge ("named booted by the
 * active-slot word … recovery R can run instead", the 42.10 words, written before 42.56 measured the word),
 * while the 2016 line said "boots now" (42.84). Both locked lines now say "boots now", from here: the write
 * plan's warning, the CLI's acknowledgement reason, the page's dialogs, its bank table and its badges.
 * ==================================================================== */

/** "<bank> is the bank the camera boots now": the head of every risk sentence about the booted bank. */
export function bootsNowOf(bank: string): string {
  return `${bank} is the bank the camera boots now`;
}

/** The booted bank's badge and note word ("booted now"), and every other bank's badge ("not booted"). */
export const BOOTED_NOW = 'booted now';
export const NOT_BOOTED = 'not booted';
