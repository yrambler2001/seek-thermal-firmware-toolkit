/**
 * Core sentences the page leaves out (owner, 2026-10-31). Core keeps them and the CLI still prints them; the
 * page drops them by their message code, so a note core rewords is still found.
 */

import { capabilityNoteMessage, type CoreMessage } from '@seek-fw/core';

/** Capability notes (core's `planNotes`, `bankNotes`) the page does not show. */
export const PAGE_HIDDEN_NOTE_CODES: ReadonlySet<string> = new Set([
  'notes.token',
  'notes.lockedBootWord',
  'notes.modernGap',
  'notes.modernNamedWrite',
  'notes.keyPairs2016',
  'notes.board1030',
  'notes.bank.modernA',
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
