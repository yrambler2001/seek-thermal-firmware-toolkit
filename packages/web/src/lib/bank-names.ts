/**
 * The camera's three firmware banks by name, in the language in use: "Slot A", "Slot B", "Recovery R"
 * (`bankName`), and inside a sentence "slot A", "slot B", "recovery R" (`bankWords`). The English is
 * core's (`bankNameOf`, `bankWordsOf`), which the run log and the CLI keep using; the page shows these.
 * The letter stays A, B or R in every language (`common:bank.*`).
 *
 * A bank that goes into a sentence as a param is passed as a name (`bankWordsRef`, `bankNameRef`,
 * `bankListRef`), not as text, so the language can say it in the case the sentence needs
 * (`{bank:loc}`, i18n/README.md, "Cases").
 */

import type { SlotKey } from '@seek-fw/core';
import { listComma, t, type NameList, type NameRef, type Translate } from '@/i18n';

function letterOf(key: SlotKey): string {
  return key.toUpperCase();
}

/** A bank's name on its own: a table cell, a row label, the start of a line. */
export function bankName(key: SlotKey, translate: Translate = t): string {
  return key === 'r'
    ? translate('common:bank.recovery', { letter: letterOf(key) })
    : translate('common:bank.slot', { letter: letterOf(key) });
}

/**
 * Banks inside a sentence, as one list: "slot A", "slot A and slot B", "slot A, slot B and recovery R"
 * (common:list.comma, then common:list.and before the last name; core's `bankListWords` in English).
 */
export function bankList(keys: readonly SlotKey[], translate: Translate = t): string {
  const words = keys.map((key) => bankWords(key, translate));
  const last = words.at(-1);
  if (last === undefined) return '';
  if (words.length === 1) return last;
  return translate('common:list.and', {
    first: listComma(words.slice(0, -1), translate),
    second: last,
  });
}

/** A bank's name inside a sentence. */
export function bankWords(key: SlotKey, translate: Translate = t): string {
  return key === 'r'
    ? translate('common:bank.recoveryInSentence', { letter: letterOf(key) })
    : translate('common:bank.slotInSentence', { letter: letterOf(key) });
}

/** `bankName` as a param: "Slot A", "Recovery R". */
export function bankNameRef(key: SlotKey): NameRef {
  return {
    name: key === 'r' ? 'common:bank.recovery' : 'common:bank.slot',
    params: { letter: letterOf(key) },
  };
}

/** `bankWords` as a param: "slot A", "recovery R" inside a sentence. */
export function bankWordsRef(key: SlotKey): NameRef {
  return {
    name: key === 'r' ? 'common:bank.recoveryInSentence' : 'common:bank.slotInSentence',
    params: { letter: letterOf(key) },
  };
}

/**
 * Banks as one list param, each named inside a sentence: `bankList` ("slot A, slot B and recovery R")
 * by default, or joined by `join` alone (`'comma'`: "slot B, recovery R").
 */
export function bankListRef(
  keys: readonly SlotKey[],
  join: NameList['join'] = 'commaAnd',
  name: (key: SlotKey) => NameRef = bankWordsRef,
): NameList {
  return { names: keys.map(name), join };
}
