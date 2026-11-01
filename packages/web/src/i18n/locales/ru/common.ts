/**
 * Namespace `common`, русский (ru), translated from the English source: words several areas use.
 *
 * Owner: phase 1 (the i18n core). Agents run one at a time, so any agent may
 * add a word that several areas need. Never rename, reword or remove a key:
 * other areas use it. (The pre-translation audit removed the stock words no
 * page used; i18n/key-usage.test.ts fails on a key nothing names.)
 */

import type { Translation } from '../../types';

export default {
  cancel: 'Отмена',

  /* Counts. */
  'count.files': {
    one: '{count} файл',
    few: '{count} файла',
    many: '{count} файлов',
    other: '{count} файла',
  },

  /* Lists: two names (or a list and one more name) joined by "and". listAnd() uses it. */
  'list.and': '{first} и {second}',
  /* Two names in the order they happen ("slot A, then recovery R"). listThen() uses it. */
  'list.then': '{first}, затем {second}',
  /* Two names in a plain list ("slot A, slot B"). listComma() uses it. */
  'list.comma': '{first}, {second}',
  /* Clauses in a list, where English uses a semicolon ("the flash backup; the patch step"). listSemicolon() uses it. */
  'list.semicolon': '{first}; {second}',

  /*
   * Firmware banks. A bank is one of the camera's three firmware slots, A, B and R; R is the recovery
   * slot, the last-resort copy the bootloader falls back to. {letter} is A, B or R: keep the Latin
   * letter. lib/bank-names.ts builds them (bankName, bankWords).
   * The name on its own (a table cell, a row label, the start of a line):
   */
  'bank.slot': 'Слот {letter}',
  'bank.slot:gen': 'слота {letter}',
  'bank.slot:dat': 'слоту {letter}',
  'bank.slot:acc': 'слот {letter}',
  'bank.slot:ins': 'слотом {letter}',
  'bank.slot:loc': 'слоте {letter}',
  'bank.recovery': 'Слот восстановления {letter}',
  'bank.recovery:gen': 'слота восстановления {letter}',
  'bank.recovery:dat': 'слоту восстановления {letter}',
  'bank.recovery:acc': 'слот восстановления {letter}',
  'bank.recovery:ins': 'слотом восстановления {letter}',
  'bank.recovery:loc': 'слоте восстановления {letter}',
  /* The same names inside a sentence (English writes them in lower case there). */
  'bank.slotInSentence': 'слот {letter}',
  'bank.slotInSentence:gen': 'слота {letter}',
  'bank.slotInSentence:dat': 'слоту {letter}',
  'bank.slotInSentence:acc': 'слот {letter}',
  'bank.slotInSentence:ins': 'слотом {letter}',
  'bank.slotInSentence:loc': 'слоте {letter}',
  'bank.recoveryInSentence': 'слот восстановления {letter}',
  'bank.recoveryInSentence:gen': 'слота восстановления {letter}',
  'bank.recoveryInSentence:dat': 'слоту восстановления {letter}',
  'bank.recoveryInSentence:acc': 'слот восстановления {letter}',
  'bank.recoveryInSentence:ins': 'слотом восстановления {letter}',
  'bank.recoveryInSentence:loc': 'слоте восстановления {letter}',
} satisfies Translation<'common', 'ru'>;
