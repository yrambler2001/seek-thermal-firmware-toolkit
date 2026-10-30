/* ====================================================================
 * The page finds a capability note's message by its English (`capabilityNoteMessage`), and a key's name
 * by its English (`keyNameParam`). A note or a name added without an entry there would show in English on
 * a translated page with no test failing, so every note the note functions give, and the placeholder key
 * name a slot can carry, must have one. The same for a refusal (`Support`): every one a slot plan or a
 * family gives must carry its message, or be a constant `supportReasonMessage` finds by its English.
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { UNNAMED_KEY } from '../../src/crypto/keys.js';
import { listProfiles } from '../../src/profiles/registry.js';
import { parseVersion } from '../../src/profiles/version.js';
import type { SlotKey, Support } from '../../src/profiles/types.js';
import { buildSlotPlan, supportReasonMessage } from '../../src/slots/capability.js';
import {
  bankNotes,
  capabilityNoteMessage,
  emptyBankWhy,
  planNotes,
  stagingNote,
} from '../../src/slots/capability-notes.js';
import { keyNameParam } from '../../src/slots/write-keys-words.js';

type Family = Parameters<typeof emptyBankWhy>[0];

const FAMILIES: readonly Family[] = [
  'modern',
  'locked-plain',
  'locked-2016',
  'unverified-locked',
  'pre-0.8',
  'unidentified',
];
const KEYS: readonly SlotKey[] = ['a', 'b', 'r'];
/* Every version a note names, and one none names. */
const VERSIONS = [
  '0.8.0.0',
  '1.0.3.0',
  '1.0.3.2',
  '1.3.0.8',
  '4.8.2.1',
  '10.9.1.31',
  '2.27.1.33',
  '42.32.3.10',
  '44.27.3.10',
  '9.9.9.9',
];

describe('constant sentences found by their English', () => {
  it('gives every capability note a message', () => {
    const notes = new Set<string>();
    for (const family of FAMILIES) {
      const empty = emptyBankWhy(family);
      if (empty !== null) notes.add(empty);
      const staging = stagingNote(family);
      if (staging !== null) notes.add(staging);
      for (const text of VERSIONS) {
        const version = parseVersion(text);
        if (version !== null) planNotes(family, version).forEach((note) => notes.add(note));
        for (const key of KEYS) {
          bankNotes(family, key, text).forEach((note) => notes.add(note));
          bankNotes(family, key).forEach((note) => notes.add(note));
        }
      }
    }
    expect(notes.size).toBeGreaterThan(10);
    expect([...notes].filter((note) => typeof capabilityNoteMessage(note) === 'string')).toEqual(
      [],
    );
  });

  it('gives every refusal of a slot plan and of a family a message', () => {
    const supports: Support[] = [];
    for (const profile of listProfiles()) {
      supports.push(...(Object.values(profile.capabilities) as Support[]));
      for (const version of [null, 'v4', '0.7.0.7', '1.5.0.0', ...VERSIONS]) {
        const plan = buildSlotPlan(profile, version);
        supports.push(plan.supportedBuild);
        for (const slot of plan.slots) {
          supports.push(slot.dump, slot.flashPlain, slot.flashRaw, slot.emptyBank.writable);
        }
      }
    }
    const reasons = supports.flatMap((support) => (support.supported ? [] : [support]));
    expect(reasons.length).toBeGreaterThan(10);
    expect(
      reasons
        .filter((support) => typeof supportReasonMessage(support) === 'string')
        .map((support) => support.reason),
    ).toEqual([]);
  });

  it('gives the placeholder key name a message', () => {
    expect(typeof keyNameParam(UNNAMED_KEY)).not.toBe('string');
  });
});
