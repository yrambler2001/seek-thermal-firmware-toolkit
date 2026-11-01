/**
 * Namespace `common`, slovenščina (sl), translated from the English source: words several areas use.
 *
 * Owner: phase 1 (the i18n core). Agents run one at a time, so any agent may
 * add a word that several areas need. Never rename, reword or remove a key:
 * other areas use it. (The pre-translation audit removed the stock words no
 * page used; i18n/key-usage.test.ts fails on a key nothing names.)
 */

import type { Translation } from '../../types';

export default {
  cancel: 'Prekliči',

  /* Counts. */
  'count.files': {
    one: '{count} datoteka',
    two: '{count} datoteki',
    few: '{count} datoteke',
    other: '{count} datotek',
  },

  /* Lists: two names (or a list and one more name) joined by "and". listAnd() uses it. */
  'list.and': '{first} in {second}',
  /* Two names in the order they happen ("slot A, then recovery R"). listThen() uses it. */
  'list.then': '{first}, nato {second}',
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
  'bank.slot': 'Reža {letter}',
  'bank.slot:nom': 'reža {letter}',
  'bank.slot:gen': 'reže {letter}',
  'bank.slot:dat': 'reži {letter}',
  'bank.slot:acc': 'režo {letter}',
  'bank.slot:ins': 'režo {letter}',
  'bank.slot:loc': 'reži {letter}',
  'bank.recovery': 'Obnovitvena reža {letter}',
  'bank.recovery:nom': 'obnovitvena reža {letter}',
  'bank.recovery:gen': 'obnovitvene reže {letter}',
  'bank.recovery:dat': 'obnovitveni reži {letter}',
  'bank.recovery:acc': 'obnovitveno režo {letter}',
  'bank.recovery:ins': 'obnovitveno režo {letter}',
  'bank.recovery:loc': 'obnovitveni reži {letter}',
  /* The same names inside a sentence (English writes them in lower case there). */
  'bank.slotInSentence': 'reža {letter}',
  'bank.slotInSentence:nom': 'reža {letter}',
  'bank.slotInSentence:gen': 'reže {letter}',
  'bank.slotInSentence:dat': 'reži {letter}',
  'bank.slotInSentence:acc': 'režo {letter}',
  'bank.slotInSentence:ins': 'režo {letter}',
  'bank.slotInSentence:loc': 'reži {letter}',
  'bank.recoveryInSentence': 'obnovitvena reža {letter}',
  'bank.recoveryInSentence:nom': 'obnovitvena reža {letter}',
  'bank.recoveryInSentence:gen': 'obnovitvene reže {letter}',
  'bank.recoveryInSentence:dat': 'obnovitveni reži {letter}',
  'bank.recoveryInSentence:acc': 'obnovitveno režo {letter}',
  'bank.recoveryInSentence:ins': 'obnovitveno režo {letter}',
  'bank.recoveryInSentence:loc': 'obnovitveni reži {letter}',
} satisfies Translation<'common', 'sl'>;
