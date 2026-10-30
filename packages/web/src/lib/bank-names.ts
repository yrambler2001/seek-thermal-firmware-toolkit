/**
 * The camera's three firmware banks by name, in the language in use: "Slot A", "Slot B", "Recovery R"
 * (`bankName`), and inside a sentence "slot A", "slot B", "recovery R" (`bankWords`). The English is
 * core's (`bankNameOf`, `bankWordsOf`), which the run log and the CLI keep using; the page shows these.
 * The letter stays A, B or R in every language (`common:bank.*`).
 */

import type { SlotKey } from '@seek-fw/core';
import { listComma, t, type Translate } from '@/i18n';

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
