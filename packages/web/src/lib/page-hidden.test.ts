/**
 * The core sentences the page leaves out (owner, 2026-10-31): each is found by its code, every code still
 * names a sentence core gives, and nothing else is dropped.
 */

import { describe, expect, it } from 'vitest';
import {
  bankParam,
  buildSlotPlan,
  capabilityNoteMessage,
  capabilityNotes,
  coreMessage,
  getProfile,
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

  it('leaves out the second set too, and still shows why a build cannot be written (notes.unverified)', () => {
    const second = [
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
    ];
    for (const code of second) expect([...PAGE_HIDDEN_NOTE_CODES], code).toContain(code);
    /* Of every note core knows, the page shows only the read-only one. */
    expect(capabilityNotes().filter(pageShowsNote).map(codeOf)).toEqual(['notes.unverified']);
    /* notes.ffBootUntested is the FF write warning's own part (write.ff.untested), not a note to hide. */
    expect(PAGE_HIDDEN_NOTE_CODES.has('notes.ffBootUntested')).toBe(false);
  });

  it("shows none of a supported build's plan, staging, bank or empty-bank notes, and the read-only note of an unverified one", () => {
    const shown = (profile: string, version: string) => {
      const plan = buildSlotPlan(getProfile(profile), version);
      return [
        ...plan.notes,
        ...plan.slots.flatMap((entry) => [
          ...entry.notes,
          ...(entry.emptyBank.writable.supported ? [entry.emptyBank.why] : []),
        ]),
      ]
        .filter(pageShowsNote)
        .map((note) => codeOf(note) ?? note);
    };
    for (const [profile, version] of [
      ['modern-4x', '4.8.2.1'],
      ['legacy-auth', '0.8.0.0'],
      ['legacy-auth', '1.3.0.8'],
      ['compact-2016', '1.0.3.0'],
      ['compact-2016', '1.0.3.2'],
    ] as const) {
      expect(shown(profile, version), `${profile} ${version}`).toEqual([]);
    }
    expect(shown('legacy-auth', '0.9.0.0')).toEqual(['notes.unverified']);
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
