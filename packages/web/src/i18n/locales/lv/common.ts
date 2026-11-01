/**
 * Namespace `common`, latviešu (lv), translated from the English source: words several areas use.
 *
 * Owner: phase 1 (the i18n core). Agents run one at a time, so any agent may
 * add a word that several areas need. Never rename, reword or remove a key:
 * other areas use it. (The pre-translation audit removed the stock words no
 * page used; i18n/key-usage.test.ts fails on a key nothing names.)
 */

import type { Translation } from '../../types';

export default {
  cancel: 'Atcelt',

  /* Counts. */
  'count.files': { zero: '{count} failu', one: '{count} fails', other: '{count} faili' },

  /* Lists: two names (or a list and one more name) joined by "and". listAnd() uses it. */
  'list.and': '{first} un {second}',
  /* Two names in the order they happen ("slot A, then recovery R"). listThen() uses it. */
  'list.then': '{first}, pēc tam {second}',
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
  'bank.slot': 'Slots {letter}',
  'bank.slot:nom': 'slots {letter}',
  'bank.slot:gen': 'slota {letter}',
  'bank.slot:dat': 'slotam {letter}',
  'bank.slot:acc': 'slotu {letter}',
  'bank.slot:ins': 'ar slotu {letter}',
  'bank.slot:loc': 'slotā {letter}',
  'bank.recovery': 'Atkopšanas slots {letter}',
  'bank.recovery:nom': 'atkopšanas slots {letter}',
  'bank.recovery:gen': 'atkopšanas slota {letter}',
  'bank.recovery:dat': 'atkopšanas slotam {letter}',
  'bank.recovery:acc': 'atkopšanas slotu {letter}',
  'bank.recovery:ins': 'ar atkopšanas slotu {letter}',
  'bank.recovery:loc': 'atkopšanas slotā {letter}',
  /* The same names inside a sentence (English writes them in lower case there). */
  'bank.slotInSentence': 'slots {letter}',
  'bank.slotInSentence:gen': 'slota {letter}',
  'bank.slotInSentence:dat': 'slotam {letter}',
  'bank.slotInSentence:acc': 'slotu {letter}',
  'bank.slotInSentence:ins': 'ar slotu {letter}',
  'bank.slotInSentence:loc': 'slotā {letter}',
  'bank.recoveryInSentence': 'atkopšanas slots {letter}',
  'bank.recoveryInSentence:gen': 'atkopšanas slota {letter}',
  'bank.recoveryInSentence:dat': 'atkopšanas slotam {letter}',
  'bank.recoveryInSentence:acc': 'atkopšanas slotu {letter}',
  'bank.recoveryInSentence:ins': 'ar atkopšanas slotu {letter}',
  'bank.recoveryInSentence:loc': 'atkopšanas slotā {letter}',
} satisfies Translation<'common', 'lv'>;
