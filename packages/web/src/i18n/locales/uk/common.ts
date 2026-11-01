/**
 * Namespace `common`, українська (uk), translated from the English source: words several areas use.
 *
 * Owner: phase 1 (the i18n core). Agents run one at a time, so any agent may
 * add a word that several areas need. Never rename, reword or remove a key:
 * other areas use it. (The pre-translation audit removed the stock words no
 * page used; i18n/key-usage.test.ts fails on a key nothing names.)
 */

import type { Translation } from '../../types';

export default {
  cancel: 'Скасувати',

  /* Counts. */
  'count.files': {
    one: '{count} файл',
    few: '{count} файли',
    many: '{count} файлів',
    other: '{count} файлу',
  },

  /* Lists: two names (or a list and one more name) joined by "and". listAnd() uses it. */
  'list.and': '{first} і {second}',
  /* Two names in the order they happen ("slot A, then recovery R"). listThen() uses it. */
  'list.then': '{first}, потім {second}',
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
  'bank.slot:loc': 'слоті {letter}',
  'bank.recovery': 'Слот відновлення {letter}',
  'bank.recovery:gen': 'слота відновлення {letter}',
  'bank.recovery:dat': 'слоту відновлення {letter}',
  'bank.recovery:acc': 'слот відновлення {letter}',
  'bank.recovery:ins': 'слотом відновлення {letter}',
  'bank.recovery:loc': 'слоті відновлення {letter}',
  /* The same names inside a sentence (English writes them in lower case there). */
  'bank.slotInSentence': 'слот {letter}',
  'bank.slotInSentence:gen': 'слота {letter}',
  'bank.slotInSentence:dat': 'слоту {letter}',
  'bank.slotInSentence:acc': 'слот {letter}',
  'bank.slotInSentence:ins': 'слотом {letter}',
  'bank.slotInSentence:loc': 'слоті {letter}',
  'bank.recoveryInSentence': 'слот відновлення {letter}',
  'bank.recoveryInSentence:gen': 'слота відновлення {letter}',
  'bank.recoveryInSentence:dat': 'слоту відновлення {letter}',
  'bank.recoveryInSentence:acc': 'слот відновлення {letter}',
  'bank.recoveryInSentence:ins': 'слотом відновлення {letter}',
  'bank.recoveryInSentence:loc': 'слоті відновлення {letter}',
} satisfies Translation<'common', 'uk'>;
