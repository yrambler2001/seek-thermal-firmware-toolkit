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
import {
  bankParam,
  coreMessage,
  paramText,
  recordedParam,
  type CoreMessage,
  type CoreParam,
} from '../message.js';
import { bankOfActiveSlotWord, bankWordsOf } from '../profiles/locked-boot.js';
import type { DetectionResult, SlotKey } from '../profiles/types.js';
import { bootChoiceOf, bootRuleKnown, reportsActiveSlotWord } from '../slots/boot-choice.js';
import {
  classifyBuild,
  stagingFor,
  UNVERIFIED_STAGING_MESSAGE,
  UNVERIFIED_STAGING_REASON,
} from '../slots/capability-family.js';
import type { StagingForm } from '../slots/types.js';
import {
  deriveWriteKeys,
  slotWriteRefusalMessages,
  slotWriteRefusals,
} from '../slots/write-keys.js';
import { bootableDescription, storeKeyDescriptionMessage } from './device-info.js';
import { keyNameParam } from '../slots/write-keys-words.js';
import type { CheckKey, DeviceState, SlotState } from './types.js';

/** One row of the report: the label (lower case, as the CLI prints it) and its value. */
export type ReportRow = readonly [label: string, value: string];

/** A row as messages, for the page: `ReportRow` is their English. */
export type ReportMessageRow = readonly [label: CoreMessage, value: CoreMessage | string];

/**
 * The probe's line in a read's log, on both front ends: the family the camera's first answers point to, and
 * that answer's score, taken before any bank is read (so it is not the score of the detected row, which is
 * taken again after the read). No profile id: that is in the JSON (TESTING.md 42.85 O5, 42.108).
 */
export function probeLineOf(detection: DetectionResult): string {
  const best = detection.best;
  return (
    `the camera's first answers point to ${best.profile.name} (score ${best.score.toFixed(2)}), ` +
    'before any bank is read' +
    (detection.ambiguous ? ' — they did not settle it, so this is a guess' : '')
  );
}

/**
 * The detected row's value: the profile the read's own evidence names, and its score. The page's Info log
 * also prints the probe's score, taken before any bank is read (1.0.3.x: 0.85 from the version line); this
 * one is scored again once the banks are read (0.98 with the bank evidence on the bench 1.0.3.0 camera), so
 * the row says which it is (TESTING.md 42.86).
 */
export function detectedReportOf(detection: DetectionResult): string {
  return detectedReportMessage(detection).text;
}

/** `detectedReportOf` as a message, for the page. */
export function detectedReportMessage(detection: DetectionResult): CoreMessage {
  const best = detection.best;
  const text =
    `${best.profile.name} (score ${best.score.toFixed(2)} after the read, from the evidence below` +
    `${detection.ambiguous ? '; ambiguous' : ''})`;
  const params = { family: best.profile.name, score: best.score.toFixed(2) };
  return detection.ambiguous
    ? coreMessage('report.detectedAmbiguous', params, text)
    : coreMessage('report.detected', params, text);
}

/**
 * The booted row's value, or null when the read names no booted bank. On the locked line where the bank
 * comes from the active-slot word, the row says it is the bootloader's record of this start: 42.56 measured
 * the word as the bank that ran on 1.3.0.0 and 1.0.3.0, for boot words 0, 1 and 2. The word itself is the
 * last-start row's (`lastStartReportOf`), so it is said once.
 */
export function bootedReportOf(
  state: DeviceState,
  nameOf: (key: SlotKey) => string,
): string | null {
  return bootedReportMessage(state, nameOf)?.text ?? null;
}

/** `bootedReportOf` as a message; `nameOf` names the bank (a bank param, or the caller's text). */
export function bootedReportMessage(
  state: DeviceState,
  nameOf: (key: SlotKey) => CoreParam,
): CoreMessage | null {
  if (state.boot === null) return null;
  const bank = nameOf(state.boot.booted);
  const name = paramText(bank);
  if (!bootRuleKnown(state) || state.activeSlotWord === null) {
    return coreMessage('report.booted.name', { bank }, name);
  }
  return coreMessage(
    'report.booted.entered',
    { bank },
    `${name} — the bank the bootloader entered at this start, as it records it`,
  );
}

/**
 * The last-start row's value: the bank the camera reports it entered at this start, from the active-slot word
 * (GetFirmwareInfo selector 10, the roots record's +8), on every line core reports that word for
 * (slots/boot-choice.ts `reportsActiveSlotWord`: the 2014 plaintext chain, the 2016 Compact PRO and the 4.9.x
 * Compact PRO, TESTING.md 42.56); null on the others (4.8.x, whose word is 0 whatever runs). The same words
 * on every line, in `seek-fw info`, the Info tab and `seek-fw slots list` (TESTING.md 42.89).
 */
export function lastStartReportOf(
  state: Pick<DeviceState, 'activeSlotWord' | 'profile' | 'version'>,
): string | null {
  return lastStartReportMessage(state)?.text ?? null;
}

/** `lastStartReportOf` as a message, for the page. */
export function lastStartReportMessage(
  state: Pick<DeviceState, 'activeSlotWord' | 'profile' | 'version'>,
): CoreMessage | null {
  if (!reportsActiveSlotWord(state.profile, state.version)) return null;
  const word = state.activeSlotWord;
  if (word === null) return coreMessage('report.lastStart.notRead', {}, 'not read');
  const bank = bankOfActiveSlotWord(word);
  return bank === null
    ? coreMessage(
        'report.lastStart.noBank',
        { word: String(word) },
        `the camera reports ${String(word)}, which names no bank`,
      )
    : coreMessage(
        'report.lastStart.entered',
        { bank: bankParam(bank), word: String(word) },
        `the camera reports it entered ${bankWordsOf(bank)} (active-slot word ${String(word)})`,
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
  return nextStartReportMessage(state, nameOf)?.text ?? null;
}

/** `nextStartReportOf` as a message; `nameOf` names the bank (a bank param, or the caller's text). */
export function nextStartReportMessage(
  state: DeviceState,
  nameOf: (key: SlotKey) => CoreParam,
): CoreMessage | null {
  if (!bootRuleKnown(state)) return null;
  const choice = bootChoiceOf(state);
  const why: CoreParam = choice.whyMessage ?? choice.why;
  if (choice.runs === null) {
    return coreMessage('report.nextStart.unknown', { why }, `not known — ${choice.why}`);
  }
  const bank = nameOf(choice.runs);
  return coreMessage('report.nextStart.runs', { bank, why }, `${paramText(bank)} — ${choice.why}`);
}

/**
 * The check key, as its row says it: the key, the pair it belongs to, and the bank that named it. A key named
 * from a bank the bootloader entered without its check says it is inferred, and why (TESTING.md 42.89).
 */
export function checkKeyReportOf(checkKey: CheckKey): string {
  return checkKeyReportMessage(checkKey).text;
}

/**
 * `checkKeyReportOf` as a message, for the page. The image pair is a clause of its own (`pair`, with its
 * leading space, or ''), so each of the three wordings (no bank, named from a bank, inferred from one) is
 * one template.
 */
export function checkKeyReportMessage(checkKey: CheckKey): CoreMessage {
  if (checkKey.name === null || checkKey.key === null) {
    const why: CoreParam =
      checkKey.unnamedWhy === null
        ? coreMessage('report.checkKey.couldNotName', {}, 'the read could not name it')
        : recordedParam(checkKey.unnamedWhyMessage, checkKey.unnamedWhy);
    return coreMessage('report.checkKey.notNamed', { why }, `not named — ${paramText(why)}`);
  }
  const pair: CoreParam =
    checkKey.pair === null
      ? ''
      : coreMessage(
          'report.checkKey.pair',
          { pair: checkKey.pair },
          ` (${checkKey.pair}'s block 1)`,
        );
  const bank = checkKey.from === null ? null : bankWordsOf(checkKey.from);
  const from =
    bank === null
      ? ''
      : checkKey.inferred
        ? `, inferred from ${bank}, the bank the camera reports it entered: the bootloader enters that ` +
          'bank without its check, and runs it under the key it checks the other banks under'
        : `, named from ${bank}, the bank the camera reports it entered after the bootloader's check`;
  const text = `${checkKey.name} ${bytesToHex(checkKey.key)}${paramText(pair)}${from}`;
  const params = { key: keyNameParam(checkKey.name), hex: bytesToHex(checkKey.key), pair };
  if (checkKey.from === null) return coreMessage('report.checkKey.named', params, text);
  const fromBank = { ...params, bank: bankParam(checkKey.from) };
  return checkKey.inferred
    ? coreMessage('report.checkKey.inferredFrom', fromBank, text)
    : coreMessage('report.checkKey.namedFrom', fromBank, text);
}

/**
 * The accepts cell for one bank, the same in `seek-fw info` and the Info tab: whether the decrypted image hits
 * the keyed acceptance sum. A bank stored plain is not checked that way (its words sum to 0, which the bootable
 * cell says), so its cell is "n/a" rather than a "no" next to "bootable yes" (TESTING.md 42.103).
 */
export function acceptsDescription(slot: SlotState): string {
  if (!slot.present) return '—';
  if (slot.keyName === null && slot.plain !== null) return 'n/a';
  return slot.accepts ? 'yes' : 'no';
}

/** The words of the accepts and bootable cells, as messages for the page. */
const CELL_CODE: Readonly<Record<string, string>> = {
  yes: 'report.cell.yes',
  no: 'report.cell.no',
  'n/a': 'report.cell.notApplicable',
  unknown: 'report.cell.unknown',
  'recovery only': 'report.cell.recoveryOnly',
};

function cellMessage(text: string): CoreMessage | string {
  const code = CELL_CODE[text];
  return code === undefined ? text : coreMessage(code, {}, text);
}

/** `acceptsDescription` as a message, for the page ('—' stays as it is). */
export function acceptsDescriptionMessage(slot: SlotState): CoreMessage | string {
  return cellMessage(acceptsDescription(slot));
}

/** `bootableDescription` (device-info.ts) as a message, for the page. */
export function bootableDescriptionMessage(slot: SlotState): CoreMessage | string {
  return cellMessage(bootableDescription(slot));
}

/** The one key row on the 2014 plaintext chain, where the banks are stored plain and no key is used. */
export const PLAIN_CHAIN_KEYS =
  'none needed: the banks are stored as plain firmware, so a bank is read and written as it is';

/** What the key-table row says on the 2016 line, where no selector reaches the bootloader block. */
export const KEY_TABLE_REFUSED_2016 =
  'not read — the bootloader block (0x14000000) is refused on every channel on this line';

const PLAIN_CHAIN_KEYS_MESSAGE = coreMessage('report.key.plainChain', {}, PLAIN_CHAIN_KEYS);
const KEY_TABLE_REFUSED_2016_MESSAGE = coreMessage(
  'report.key.tableRefused2016',
  {},
  KEY_TABLE_REFUSED_2016,
);

/** A key row's label (lower case, as the CLI prints it). */
function rowLabel(code: string, text: string): CoreMessage {
  return coreMessage(`report.keyRow.${code}`, {}, text);
}

/**
 * The key rows. On the 2016 line (`checkKey` set): the key its bootloader checks a bank under, that no key
 * table is read, the whitening constant and the key the application stores under. Elsewhere: the bootloader's
 * key table as the read confirmed it, or did not.
 */
export function keyReportRows(state: DeviceState): ReportRow[] {
  return keyReportMessageRows(state).map(([label, value]) => [label.text, paramText(value)]);
}

/** `keyReportRows` as messages, for the page. */
export function keyReportMessageRows(state: DeviceState): ReportMessageRow[] {
  const whitening: ReportMessageRow = [
    rowLabel('whitening', 'whitening K'),
    hexUp(state.keyWhiteningK),
  ];
  const store: ReportMessageRow = [
    rowLabel('store', 'store key'),
    storeKeyDescriptionMessage(state),
  ];
  const checkKey = state.checkKey ?? null;
  if (checkKey !== null) {
    return [
      [rowLabel('check', 'check key'), checkKeyReportMessage(checkKey)],
      [rowLabel('table', 'key table'), KEY_TABLE_REFUSED_2016_MESSAGE],
      whitening,
      store,
    ];
  }
  /* The 2014 plaintext chain: a bank is read and written as it is, so no key is needed and none is shown
   * (the key-table fields stay in --json). Rows for keys the camera does not use would contradict that
   * (TESTING.md 42.102 O4, 42.103). */
  if (state.plainChain && state.keyTable === null) {
    return [[rowLabel('keys', 'keys'), PLAIN_CHAIN_KEYS_MESSAGE]];
  }
  const table = state.keyTable;
  const notIdentified = coreMessage('report.key.notIdentified', {}, '(not identified)');
  return [
    [rowLabel('a', 'key A'), table === null ? notIdentified : bytesToHex(table.keyA)],
    [rowLabel('b', 'key B'), table === null ? notIdentified : bytesToHex(table.keyB)],
    [
      rowLabel('tableAt', 'table at'),
      table === null
        ? coreMessage(
            'report.key.candidates',
            { count: String(state.keyTableCandidates) },
            `${String(state.keyTableCandidates)} candidate(s), none confirmed`,
          )
        : coreMessage(
            'report.key.tableAt',
            { offset: hexUp(table.offset) },
            `${hexUp(table.offset)} in the bootloader block, confirmed against a slot`,
          ),
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
  /** `staged` as a message, for the page. */
  readonly stagedMessage: CoreMessage | null;
  /** `refusals` as messages, for the page (a reason with no message is its English). */
  readonly refusalMessages: readonly (CoreMessage | string)[];
}

/** The staging clause of each form the slot writer stages a bank in, in words (TESTING.md 42.89). */
const STAGED_CLAUSE: Readonly<Record<StagingForm, CoreMessage>> = {
  plain: coreMessage('report.staged.plain', {}, 'staged plain (the image as it is, with no key)'),
  'slot-keystream-ciphertext': coreMessage(
    'report.staged.slotKeystream',
    {},
    "staged under its image's own key block 0",
  ),
  'key-a-ciphertext': coreMessage(
    'report.staged.keyA',
    {},
    'staged under keys derived from the booted bank and the running application',
  ),
};

/** The staging clause on a 1.3.0.8 FF camera with no bank stored plain (write-keys.ts `FF_VENDOR_STAGED`). */
const FF_VENDOR_CLAUSE = coreMessage(
  'report.staged.ffVendor',
  {},
  'staged as the vendor app stages the 16 Hz FF image (the image XOR its own key block 0), stored by the ' +
    'camera under Key B',
);

/** The staging clause of a form (or the 1.3.0.8 FF vendor form), as a message. */
export function stagedClauseMessage(form: StagingForm | 'ff-vendor'): CoreMessage {
  return form === 'ff-vendor' ? FF_VENDOR_CLAUSE : STAGED_CLAUSE[form];
}

export function bankWritingOf(state: DeviceState): BankWriting {
  const verdict = classifyBuild(state.profile, state.version);
  const staging = stagingFor(verdict.family);
  const refusals = slotWriteRefusals(state);
  const refusalMessages = slotWriteRefusalMessages(state);
  if (verdict.refusal !== null || staging === null) {
    const why = verdict.refusalMessage ?? UNVERIFIED_STAGING_MESSAGE;
    return {
      staged: null,
      refusals: [verdict.refusal ?? UNVERIFIED_STAGING_REASON, ...refusals],
      stagedMessage: null,
      refusalMessages: [why, ...refusalMessages],
    };
  }
  /* The 1.3.0.8 FF build with no bank stored plain stages the FF image in the vendor's form. */
  const clause = stagedClauseMessage(
    deriveWriteKeys(state).form === 'ff-vendor' ? 'ff-vendor' : staging,
  );
  return { staged: clause.text, refusals, stagedMessage: clause, refusalMessages };
}
