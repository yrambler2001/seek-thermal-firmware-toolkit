/* ==================================================================== *
 * The parts of the camera report that `seek-fw info` prints and the page's Info tab shows (TESTING.md
 * 42.64) and that differ by line: the booted and next-start rows, the key rows, and how banks are written.
 * One definition, so the two front ends say the same thing. Each row is [label, value]; the CLI prints the
 * label as it is and the page capitalises its first letter. Pure: it reads what `readDeviceInfo` returned.
 *
 * THE LOCKED LINE (TESTING.md 42.84). The 2014 plaintext chain and the 2016 Compact PRO name the bank the
 * camera entered from the bootloader's own record (the active-slot word, TESTING.md 42.53, 42.56) and the
 * bank the next start runs from the boot-config word and each bank's check (slots/boot-choice.ts). On the
 * 2016 line the bootloader block is refused on every channel, so the key rows name the key its bootloader
 * checks a bank under (device-info.ts `checkKeyOf`) instead of a key table. On every line the banks are
 * written one at a time by the slot writer (`bankWritingOf`).
 * ==================================================================== */

import { bytesToHex, hexUp } from '../bytes.js';
import { bankWordsOf } from '../profiles/locked-boot.js';
import type { DetectionResult, SlotKey } from '../profiles/types.js';
import { bootChoiceOf, bootRuleKnown } from '../slots/boot-choice.js';
import {
  classifyBuild,
  stagingFor,
  UNVERIFIED_STAGING_REASON,
} from '../slots/capability-family.js';
import type { StagingForm } from '../slots/types.js';
import { deriveWriteKeys, slotWriteRefusals } from '../slots/write-keys.js';
import { storeKeyDescription } from './device-info.js';
import type { CheckKey, DeviceState } from './types.js';

/** One row of the report: the label (lower case, as the CLI prints it) and its value. */
export type ReportRow = readonly [label: string, value: string];

/**
 * The detected row's value: the profile the read's own evidence names, and its score. The page's Info log
 * also prints the probe's score, taken before any bank is read (1.0.3.x: 0.85 from the version line); this
 * one is scored again once the banks are read (0.98 with the bank evidence on the bench 1.0.3.0 camera), so
 * the row says which it is (TESTING.md 42.86).
 */
export function detectedReportOf(detection: DetectionResult): string {
  const best = detection.best;
  return (
    `${best.profile.id} (score ${best.score.toFixed(2)} after the read, from the evidence below` +
    `${detection.ambiguous ? '; ambiguous' : ''})`
  );
}

/**
 * The booted row's value, or null when the read names no booted bank. On the locked line where the bank
 * comes from the active-slot word, the row says it is the bootloader's record of this start: 42.56 measured
 * the word as the bank that ran on 1.3.0.0 and 1.0.3.0, for boot words 0, 1 and 2.
 */
export function bootedReportOf(
  state: DeviceState,
  nameOf: (key: SlotKey) => string,
): string | null {
  if (state.boot === null) return null;
  const name = nameOf(state.boot.booted);
  if (!bootRuleKnown(state) || state.activeSlotWord === null) return name;
  return (
    `${name} — the bank the bootloader entered at this start, as it records it (active-slot word ` +
    `${String(state.activeSlotWord)})`
  );
}

/**
 * The next-start row's value on a line whose boot rule is decoded (`bootRuleKnown`), else null: the bank the
 * next start runs and why (`bootChoiceOf`), or "not known" and why.
 */
export function nextStartReportOf(
  state: DeviceState,
  nameOf: (key: SlotKey) => string,
): string | null {
  if (!bootRuleKnown(state)) return null;
  const choice = bootChoiceOf(state);
  return choice.runs === null
    ? `not known — ${choice.why}`
    : `${nameOf(choice.runs)} — ${choice.why}`;
}

/** The check key, as its row says it: the key, the pair it belongs to, and the bank that named it. */
export function checkKeyReportOf(checkKey: CheckKey): string {
  if (checkKey.name === null || checkKey.key === null) {
    return `not named — ${checkKey.unnamedWhy ?? 'the read could not name it'}`;
  }
  const pair = checkKey.pair === null ? '' : ` (${checkKey.pair}'s block 1)`;
  const from =
    checkKey.from === null
      ? ''
      : `, named from ${bankWordsOf(checkKey.from)}, the bank the camera reports it entered after ` +
        "the bootloader's check";
  return `${checkKey.name} ${bytesToHex(checkKey.key)}${pair}${from}`;
}

/** What the key-table row says on the 2016 line, where no selector reaches the bootloader block. */
export const KEY_TABLE_REFUSED_2016 =
  'not read — the bootloader block (0x14000000) is refused on every channel on this line';

/**
 * The key rows. On the 2016 line (`checkKey` set): the key its bootloader checks a bank under, that no key
 * table is read, the whitening constant and the key the application stores under. Elsewhere: the bootloader's
 * key table as the read confirmed it, or did not.
 */
export function keyReportRows(state: DeviceState): ReportRow[] {
  const whitening: ReportRow = ['whitening K', hexUp(state.keyWhiteningK)];
  const store: ReportRow = ['store key', storeKeyDescription(state)];
  const checkKey = state.checkKey ?? null;
  if (checkKey !== null) {
    return [
      ['check key', checkKeyReportOf(checkKey)],
      ['key table', KEY_TABLE_REFUSED_2016],
      whitening,
      store,
    ];
  }
  const table = state.keyTable;
  return [
    ['key A', table === null ? '(not identified)' : bytesToHex(table.keyA)],
    ['key B', table === null ? '(not identified)' : bytesToHex(table.keyB)],
    [
      'table at',
      table === null
        ? `${String(state.keyTableCandidates)} candidate(s), none confirmed`
        : `${hexUp(table.offset)} in the bootloader block, confirmed against a slot`,
    ],
    whitening,
    store,
  ];
}

/**
 * How this camera's banks are written, for the Writing section the Info tab and `seek-fw info` both show: the
 * slot writer writes one bank at a time on every line (no whole-image write exists), each staged in the form
 * its line takes (`staged`), and `refusals` are the reasons it refuses every bank of this camera
 * (slots/write-keys.ts `slotWriteRefusals`: the read's camera-wide refusals, and on the Key A line the
 * upload-key derivation's), the reasons behind the Slots tab's banner. On a build the slot writer has no
 * staging form for, `staged` is null and `refusals` starts with why.
 */
export interface BankWriting {
  /** How each bank is staged, as a clause after "each bank" ("staged under its image's own key block 0"), or null. */
  readonly staged: string | null;
  /** What refuses every bank of this camera; empty when a bank can be written. */
  readonly refusals: readonly string[];
}

/** The staging clause of each form the slot writer stages a bank in, in words (TESTING.md 42.89). */
const STAGED_CLAUSE: Readonly<Record<StagingForm, string>> = {
  plain: 'staged plain (the image as it is, with no key)',
  'slot-keystream-ciphertext': "staged under its image's own key block 0",
  'key-a-ciphertext': 'staged under keys derived from the booted bank and the running application',
};

/** The staging clause on a 1.3.0.8 FF camera with no bank stored plain (write-keys.ts `FF_VENDOR_STAGED`). */
const FF_VENDOR_CLAUSE =
  'staged as the vendor app stages the 16 Hz FF image (the image XOR its own key block 0), stored by the ' +
  'camera under Key B';

export function bankWritingOf(state: DeviceState): BankWriting {
  const verdict = classifyBuild(state.profile, state.version);
  const staging = stagingFor(verdict.family);
  const refusals = slotWriteRefusals(state);
  if (verdict.refusal !== null || staging === null) {
    return { staged: null, refusals: [verdict.refusal ?? UNVERIFIED_STAGING_REASON, ...refusals] };
  }
  /* The 1.3.0.8 FF build with no bank stored plain stages the FF image in the vendor's form. */
  if (deriveWriteKeys(state).form === 'ff-vendor') {
    return { staged: FF_VENDOR_CLAUSE, refusals };
  }
  return { staged: STAGED_CLAUSE[staging], refusals };
}
