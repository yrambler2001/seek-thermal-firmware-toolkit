/**
 * Namespace `common`, italiano (it), translated from the English source: words several areas use.
 *
 * Owner: phase 1 (the i18n core). Agents run one at a time, so any agent may
 * add a word that several areas need. Never rename, reword or remove a key:
 * other areas use it. (The pre-translation audit removed the stock words no
 * page used; i18n/key-usage.test.ts fails on a key nothing names.)
 */

import type { Translation } from '../../types';

export default {
  cancel: 'Annulla',

  /* Counts. */
  'count.files': { one: '{count} file', many: '{count} di file', other: '{count} file' },

  /* Lists: two names (or a list and one more name) joined by "and". listAnd() uses it. */
  'list.and': '{first} e {second}',
  /* Two names in the order they happen ("slot A, then recovery R"). listThen() uses it. */
  'list.then': '{first}, poi {second}',
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
  'bank.slot:acc': 'lo slot {letter}',
  'bank.slot:gen': 'dello slot {letter}',
  'bank.slot:dat': 'allo slot {letter}',
  'bank.slot:loc': 'nello slot {letter}',
  'bank.slot:ins': 'Lo slot {letter}',
  'bank.recovery': 'Slot di recupero {letter}',
  'bank.recovery:acc': 'lo slot di recupero {letter}',
  'bank.recovery:gen': 'dello slot di recupero {letter}',
  'bank.recovery:dat': 'allo slot di recupero {letter}',
  'bank.recovery:loc': 'nello slot di recupero {letter}',
  'bank.recovery:ins': 'Lo slot di recupero {letter}',
  /* The same names inside a sentence (English writes them in lower case there). */
  'bank.slotInSentence': 'slot {letter}',
  'bank.slotInSentence:acc': 'lo slot {letter}',
  'bank.slotInSentence:gen': 'dello slot {letter}',
  'bank.slotInSentence:dat': 'allo slot {letter}',
  'bank.slotInSentence:loc': 'nello slot {letter}',
  'bank.slotInSentence:ins': 'Lo slot {letter}',
  'bank.recoveryInSentence': 'slot di recupero {letter}',
  'bank.recoveryInSentence:acc': 'lo slot di recupero {letter}',
  'bank.recoveryInSentence:gen': 'dello slot di recupero {letter}',
  'bank.recoveryInSentence:dat': 'allo slot di recupero {letter}',
  'bank.recoveryInSentence:loc': 'nello slot di recupero {letter}',
  'bank.recoveryInSentence:ins': 'Lo slot di recupero {letter}',
} satisfies Translation<'common', 'it'>;
