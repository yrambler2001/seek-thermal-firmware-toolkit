/**
 * Namespace `common`, română (ro), translated from the English source: words several areas use.
 *
 * Owner: phase 1 (the i18n core). Agents run one at a time, so any agent may
 * add a word that several areas need. Never rename, reword or remove a key:
 * other areas use it. (The pre-translation audit removed the stock words no
 * page used; i18n/key-usage.test.ts fails on a key nothing names.)
 */

import type { Translation } from '../../types';

export default {
  cancel: 'Anulare',

  /* Counts. */
  'count.files': { one: '{count} fișier', few: '{count} fișiere', other: '{count} de fișiere' },

  /* Lists: two names (or a list and one more name) joined by "and". listAnd() uses it. */
  'list.and': '{first} și {second}',
  /* Two names in the order they happen ("slot A, then recovery R"). listThen() uses it. */
  'list.then': '{first}, apoi {second}',
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
  'bank.slot': 'Slot {letter}',
  'bank.slot:acc': 'slotul {letter}',
  'bank.slot:gen': 'slotului {letter}',
  'bank.slot:dat': 'slotului {letter}',
  'bank.slot:loc': 'în slotul {letter}',
  'bank.slot:ins': 'Slotul {letter}',
  'bank.recovery': 'Recuperare {letter}',
  'bank.recovery:acc': 'slotul de recuperare {letter}',
  'bank.recovery:gen': 'slotului de recuperare {letter}',
  'bank.recovery:dat': 'slotului de recuperare {letter}',
  'bank.recovery:loc': 'în slotul de recuperare {letter}',
  'bank.recovery:ins': 'Slotul de recuperare {letter}',
  /* The same names inside a sentence (English writes them in lower case there). */
  'bank.slotInSentence': 'slotul {letter}',
  'bank.slotInSentence:acc': 'slotul {letter}',
  'bank.slotInSentence:gen': 'slotului {letter}',
  'bank.slotInSentence:dat': 'slotului {letter}',
  'bank.slotInSentence:loc': 'în slotul {letter}',
  'bank.slotInSentence:ins': 'Slotul {letter}',
  'bank.recoveryInSentence': 'slotul de recuperare {letter}',
  'bank.recoveryInSentence:acc': 'slotul de recuperare {letter}',
  'bank.recoveryInSentence:gen': 'slotului de recuperare {letter}',
  'bank.recoveryInSentence:dat': 'slotului de recuperare {letter}',
  'bank.recoveryInSentence:loc': 'în slotul de recuperare {letter}',
  'bank.recoveryInSentence:ins': 'Slotul de recuperare {letter}',
} satisfies Translation<'common', 'ro'>;
