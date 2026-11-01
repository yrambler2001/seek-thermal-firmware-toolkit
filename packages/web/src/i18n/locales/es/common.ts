/**
 * Namespace `common`, español (es), translated from the English source: words several areas use.
 *
 * Owner: phase 1 (the i18n core). Agents run one at a time, so any agent may
 * add a word that several areas need. Never rename, reword or remove a key:
 * other areas use it. (The pre-translation audit removed the stock words no
 * page used; i18n/key-usage.test.ts fails on a key nothing names.)
 */

import type { Translation } from '../../types';

export default {
  cancel: 'Cancelar',

  /* Counts. */
  'count.files': { one: '{count} archivo', many: '{count} de archivos', other: '{count} archivos' },

  /* Lists: two names (or a list and one more name) joined by "and". listAnd() uses it. */
  'list.and': '{first} y {second}',
  /* Two names in the order they happen ("slot A, then recovery R"). listThen() uses it. */
  'list.then': '{first}, luego {second}',
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
  'bank.slot': 'Ranura {letter}',
  'bank.slot:acc': 'la ranura {letter}',
  'bank.slot:gen': 'de la ranura {letter}',
  'bank.slot:dat': 'a la ranura {letter}',
  'bank.slot:loc': 'en la ranura {letter}',
  'bank.slot:ins': 'La ranura {letter}',
  'bank.recovery': 'Ranura de recuperación {letter}',
  'bank.recovery:acc': 'la ranura de recuperación {letter}',
  'bank.recovery:gen': 'de la ranura de recuperación {letter}',
  'bank.recovery:dat': 'a la ranura de recuperación {letter}',
  'bank.recovery:loc': 'en la ranura de recuperación {letter}',
  'bank.recovery:ins': 'La ranura de recuperación {letter}',
  /* The same names inside a sentence (English writes them in lower case there). */
  'bank.slotInSentence': 'ranura {letter}',
  'bank.slotInSentence:acc': 'la ranura {letter}',
  'bank.slotInSentence:gen': 'de la ranura {letter}',
  'bank.slotInSentence:dat': 'a la ranura {letter}',
  'bank.slotInSentence:loc': 'en la ranura {letter}',
  'bank.slotInSentence:ins': 'La ranura {letter}',
  'bank.recoveryInSentence': 'ranura de recuperación {letter}',
  'bank.recoveryInSentence:acc': 'la ranura de recuperación {letter}',
  'bank.recoveryInSentence:gen': 'de la ranura de recuperación {letter}',
  'bank.recoveryInSentence:dat': 'a la ranura de recuperación {letter}',
  'bank.recoveryInSentence:loc': 'en la ranura de recuperación {letter}',
  'bank.recoveryInSentence:ins': 'La ranura de recuperación {letter}',
} satisfies Translation<'common', 'es'>;
