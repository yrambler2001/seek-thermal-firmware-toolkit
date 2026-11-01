/**
 * Namespace `common`, português europeu (pt), translated from the English source: words several areas use.
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
  'count.files': {
    one: '{count} ficheiro',
    many: '{count} de ficheiros',
    other: '{count} ficheiros',
  },

  /* Lists: two names (or a list and one more name) joined by "and". listAnd() uses it. */
  'list.and': '{first} e {second}',
  /* Two names in the order they happen ("slot A, then recovery R"). listThen() uses it. */
  'list.then': '{first}, depois {second}',
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
  'bank.slot': 'Ranhura {letter}',
  'bank.slot:acc': 'a ranhura {letter}',
  'bank.slot:gen': 'da ranhura {letter}',
  'bank.slot:dat': 'à ranhura {letter}',
  'bank.slot:loc': 'na ranhura {letter}',
  'bank.slot:ins': 'A ranhura {letter}',
  'bank.recovery': 'Ranhura de recuperação {letter}',
  'bank.recovery:acc': 'a ranhura de recuperação {letter}',
  'bank.recovery:gen': 'da ranhura de recuperação {letter}',
  'bank.recovery:dat': 'à ranhura de recuperação {letter}',
  'bank.recovery:loc': 'na ranhura de recuperação {letter}',
  'bank.recovery:ins': 'A ranhura de recuperação {letter}',
  /* The same names inside a sentence (English writes them in lower case there). */
  'bank.slotInSentence': 'ranhura {letter}',
  'bank.slotInSentence:acc': 'a ranhura {letter}',
  'bank.slotInSentence:gen': 'da ranhura {letter}',
  'bank.slotInSentence:dat': 'à ranhura {letter}',
  'bank.slotInSentence:loc': 'na ranhura {letter}',
  'bank.slotInSentence:ins': 'A ranhura {letter}',
  'bank.recoveryInSentence': 'ranhura de recuperação {letter}',
  'bank.recoveryInSentence:acc': 'a ranhura de recuperação {letter}',
  'bank.recoveryInSentence:gen': 'da ranhura de recuperação {letter}',
  'bank.recoveryInSentence:dat': 'à ranhura de recuperação {letter}',
  'bank.recoveryInSentence:loc': 'na ranhura de recuperação {letter}',
  'bank.recoveryInSentence:ins': 'A ranhura de recuperação {letter}',
} satisfies Translation<'common', 'pt'>;
