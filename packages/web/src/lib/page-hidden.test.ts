/**
 * The core sentences the page leaves out (owner, 2026-10-31): each is found by its code, every code still
 * names a sentence core gives, and nothing else is dropped.
 */

import { describe, expect, it } from 'vitest';
import {
  bankParam,
  capabilityNoteMessage,
  capabilityNotes,
  coreMessage,
  upgradeTargetBootedWarning,
  upgradeWhileRecoveryWarning,
} from '@seek-fw/core';
import {
  PAGE_HIDDEN_NOTE_CODES,
  pageDumpNotes,
  pageShowsNote,
  pageUpgradeWarning,
} from './page-hidden';

const codeOf = (note: string): string | null => {
  const message = capabilityNoteMessage(note);
  return typeof message === 'string' ? null : message.code;
};

describe('page-hidden', () => {
  it('leaves out exactly the listed capability notes, each of which core still gives', () => {
    const codes = capabilityNotes().map(codeOf);
    for (const code of PAGE_HIDDEN_NOTE_CODES) expect(codes, code).toContain(code);
    for (const note of capabilityNotes()) {
      expect(pageShowsNote(note), codeOf(note) ?? note).toBe(
        !PAGE_HIDDEN_NOTE_CODES.has(codeOf(note) ?? ''),
      );
    }
    expect(pageShowsNote('a note core does not know')).toBe(true);
  });

  it('drops the warning that the upgrade target is the booted bank, and keeps the recovery one', () => {
    const name = bankParam('b', 'name');
    expect(pageUpgradeWarning(upgradeTargetBootedWarning(name))).toBeNull();
    const recovery = upgradeWhileRecoveryWarning(name, coreMessage('x', {}, 'a verdict'));
    expect(pageUpgradeWarning(recovery)).toBe(recovery);
    expect(pageUpgradeWarning(null)).toBeNull();
  });

  it("drops a slot dump's empty-bank note from the log, and keeps the others", () => {
    const empty =
      'empty, nothing to decrypt: all 65536 B of Slot B read as 0xFF (an erased bank). The raw dump is ' +
      'those bytes; there is no decrypted image';
    const erased = 'erased: the header window is all 0xFF, so the bank holds no image';
    expect(pageDumpNotes([empty, erased])).toEqual([erased]);
  });
});
