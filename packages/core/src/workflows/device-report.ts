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
 * checks a bank under (device-info.ts `checkKeyOf`) instead of a key table, and the banks are written one at
 * a time by the slot writer, never as a whole image.
 * ==================================================================== */

import { bytesToHex, hexUp } from '../bytes.js';
import { bankWordsOf } from '../profiles/locked-boot.js';
import type { SlotKey } from '../profiles/types.js';
import { bootChoiceOf, bootRuleKnown } from '../slots/boot-choice.js';
import { cameraWideBlocks, storeKeyDescription } from './device-info.js';
import type { CheckKey, DeviceState } from './types.js';

/** One row of the report: the label (lower case, as the CLI prints it) and its value. */
export type ReportRow = readonly [label: string, value: string];

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
 * How the banks of a 2016 camera are written, or null on any other line. The slot writer writes them one at
 * a time, each staged under its image's own key block 0; no whole-image write exists on this line.
 * `refusals` are the reasons that refuse every bank for the slot writer (device-info.ts `cameraWideBlocks`,
 * the slot page's own gate), empty when none does.
 */
export interface BankWriting {
  readonly refusals: readonly string[];
}

export function bankWritingOf(state: DeviceState): BankWriting | null {
  if (state.checkKey == null) return null;
  return { refusals: cameraWideBlocks(state, true) };
}
