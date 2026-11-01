/**
 * Namespace `common`, lietuvių (lt), translated from the English source: words several areas use.
 *
 * Owner: phase 1 (the i18n core). Agents run one at a time, so any agent may
 * add a word that several areas need. Never rename, reword or remove a key:
 * other areas use it. (The pre-translation audit removed the stock words no
 * page used; i18n/key-usage.test.ts fails on a key nothing names.)
 */

import type { Translation } from '../../types';

export default {
  cancel: 'Atšaukti',

  /* Counts. */
  'count.files': {
    one: '{count} failas',
    few: '{count} failai',
    many: '{count} failo',
    other: '{count} failų',
  },

  /* Lists: two names (or a list and one more name) joined by "and". listAnd() uses it. */
  'list.and': '{first} ir {second}',
  /* Two names in the order they happen ("slot A, then recovery R"). listThen() uses it. */
  'list.then': '{first}, tada {second}',
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
  'bank.slot': 'Lizdas {letter}',
  'bank.slot:nom': 'lizdas {letter}',
  'bank.slot:gen': 'lizdo {letter}',
  'bank.slot:dat': 'lizdui {letter}',
  'bank.slot:acc': 'lizdą {letter}',
  'bank.slot:ins': 'lizdu {letter}',
  'bank.slot:loc': 'lizde {letter}',
  'bank.recovery': 'Atkūrimo lizdas {letter}',
  'bank.recovery:nom': 'atkūrimo lizdas {letter}',
  'bank.recovery:gen': 'atkūrimo lizdo {letter}',
  'bank.recovery:dat': 'atkūrimo lizdui {letter}',
  'bank.recovery:acc': 'atkūrimo lizdą {letter}',
  'bank.recovery:ins': 'atkūrimo lizdu {letter}',
  'bank.recovery:loc': 'atkūrimo lizde {letter}',
  /* The same names inside a sentence (English writes them in lower case there). */
  'bank.slotInSentence': 'lizdas {letter}',
  'bank.slotInSentence:gen': 'lizdo {letter}',
  'bank.slotInSentence:dat': 'lizdui {letter}',
  'bank.slotInSentence:acc': 'lizdą {letter}',
  'bank.slotInSentence:ins': 'lizdu {letter}',
  'bank.slotInSentence:loc': 'lizde {letter}',
  'bank.recoveryInSentence': 'atkūrimo lizdas {letter}',
  'bank.recoveryInSentence:gen': 'atkūrimo lizdo {letter}',
  'bank.recoveryInSentence:dat': 'atkūrimo lizdui {letter}',
  'bank.recoveryInSentence:acc': 'atkūrimo lizdą {letter}',
  'bank.recoveryInSentence:ins': 'atkūrimo lizdu {letter}',
  'bank.recoveryInSentence:loc': 'atkūrimo lizde {letter}',
} satisfies Translation<'common', 'lt'>;
