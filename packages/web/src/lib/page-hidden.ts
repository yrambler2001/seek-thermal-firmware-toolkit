/**
 * Core sentences the page leaves out (owner, 2026-10-31). Core keeps them and the CLI still prints them; the
 * page drops them by their message code, so a note core rewords is still found.
 */

import { capabilityNoteMessage, type CoreMessage } from '@seek-fw/core';

/**
 * Capability notes (core's `planNotes`, `stagingNote`, `bankNotes`, `emptyBankWhy`) the page does not show.
 * Of a supported build's notes only `notes.unverified` stays (why writes are off). notes.ffBootUntested is not
 * a note here: the page still says it, inside the FF write warning (write.ff.untested).
 */
export const PAGE_HIDDEN_NOTE_CODES: ReadonlySet<string> = new Set([
  /* the first set (owner, 2026-10-31) */
  'notes.token',
  'notes.lockedBootWord',
  'notes.modernGap',
  'notes.modernNamedWrite',
  'notes.keyPairs2016',
  'notes.board1030',
  'notes.bank.modernA',
  /* the second set (owner, 2026-10-31): the 1.3.0.8 FF and 2016 boot notes, how a write is staged, empty
   * banks, the per-model notes and the read limits */
  'notes.ff1308',
  'notes.locked2016BootWord',
  'notes.staging.lockedPlain',
  'notes.staging.locked2016',
  'notes.staging.modern',
  'notes.empty.plain',
  'notes.empty.modern',
  'notes.empty.locked2016',
  'notes.product.4_8_2_1',
  'notes.product.10_9_1_31',
  'notes.product.2_27_1_33',
  'notes.product.42_32_3_10',
  'notes.product.44_27_3_10',
  'notes.ep0of1032',
  'notes.mode2of080',
  'notes.bank.ff1308A',
  'notes.bank.ff1308B',
  'notes.bank.ff1308R',
  'notes.bank.recovery2016',
]);

/** Whether the page shows this capability note (a plan's or a bank's). A note core does not know is shown. */
export function pageShowsNote(note: string): boolean {
  const message = capabilityNoteMessage(note);
  return typeof message === 'string' || !PAGE_HIDDEN_NOTE_CODES.has(message.code);
}

/**
 * The upgrade-target warning the page shows (core's `upgradeTargetWarningMessage`): the case where the
 * upgrade target is the booted bank is left out; the recovery case stays.
 */
export function pageUpgradeWarning(message: CoreMessage | null): CoreMessage | null {
  return message?.code === 'upgrade.targetBooted' ? null : message;
}

/** A slot dump's notes the page logs: the empty-bank note is left out. */
export function pageDumpNotes(notes: readonly string[]): string[] {
  return notes.filter((note) => !note.startsWith('empty, nothing to decrypt:'));
}
