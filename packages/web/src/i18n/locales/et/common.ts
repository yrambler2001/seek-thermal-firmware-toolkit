/**
 * Namespace `common`, eesti (et), translated from the English source: words several areas use.
 *
 * Owner: phase 1 (the i18n core). Agents run one at a time, so any agent may
 * add a word that several areas need. Never rename, reword or remove a key:
 * other areas use it. (The pre-translation audit removed the stock words no
 * page used; i18n/key-usage.test.ts fails on a key nothing names.)
 */

import type { Translation } from '../../types';

export default {
  cancel: 'Loobu',

  /* Counts. */
  'count.files': { one: '{count} fail', other: '{count} faili' },

  /* Lists: two names (or a list and one more name) joined by "and". listAnd() uses it. */
  'list.and': '{first} ja {second}',
  /* Two names in the order they happen ("slot A, then recovery R"). listThen() uses it. */
  'list.then': '{first}, seejärel {second}',
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
  'bank.slot': 'Pesa {letter}',
  'bank.slot:nom': 'pesa {letter}',
  'bank.slot:gen': 'pesa {letter}',
  'bank.slot:par': 'pesa {letter}',
  'bank.slot:ill': 'pesasse {letter}',
  'bank.slot:ine': 'pesas {letter}',
  'bank.slot:ela': 'pesast {letter}',
  'bank.slot:all': 'pesale {letter}',
  'bank.slot:ade': 'pesal {letter}',
  'bank.slot:abl': 'pesalt {letter}',
  'bank.slot:tra': 'pesaks {letter}',
  'bank.slot:ter': 'pesani {letter}',
  'bank.slot:ess': 'pesana {letter}',
  'bank.slot:abe': 'pesata {letter}',
  'bank.slot:com': 'pesaga {letter}',
  'bank.recovery': 'Taastepesa {letter}',
  'bank.recovery:nom': 'taastepesa {letter}',
  'bank.recovery:gen': 'taastepesa {letter}',
  'bank.recovery:par': 'taastepesa {letter}',
  'bank.recovery:ill': 'taastepesasse {letter}',
  'bank.recovery:ine': 'taastepesas {letter}',
  'bank.recovery:ela': 'taastepesast {letter}',
  'bank.recovery:all': 'taastepesale {letter}',
  'bank.recovery:ade': 'taastepesal {letter}',
  'bank.recovery:abl': 'taastepesalt {letter}',
  'bank.recovery:tra': 'taastepesaks {letter}',
  'bank.recovery:ter': 'taastepesani {letter}',
  'bank.recovery:ess': 'taastepesana {letter}',
  'bank.recovery:abe': 'taastepesata {letter}',
  'bank.recovery:com': 'taastepesaga {letter}',
  /* The same names inside a sentence (English writes them in lower case there). */
  'bank.slotInSentence': 'pesa {letter}',
  'bank.slotInSentence:gen': 'pesa {letter}',
  'bank.slotInSentence:par': 'pesa {letter}',
  'bank.slotInSentence:ill': 'pesasse {letter}',
  'bank.slotInSentence:ine': 'pesas {letter}',
  'bank.slotInSentence:ela': 'pesast {letter}',
  'bank.slotInSentence:all': 'pesale {letter}',
  'bank.slotInSentence:ade': 'pesal {letter}',
  'bank.slotInSentence:abl': 'pesalt {letter}',
  'bank.slotInSentence:tra': 'pesaks {letter}',
  'bank.slotInSentence:ter': 'pesani {letter}',
  'bank.slotInSentence:ess': 'pesana {letter}',
  'bank.slotInSentence:abe': 'pesata {letter}',
  'bank.slotInSentence:com': 'pesaga {letter}',
  'bank.recoveryInSentence': 'taastepesa {letter}',
  'bank.recoveryInSentence:gen': 'taastepesa {letter}',
  'bank.recoveryInSentence:par': 'taastepesa {letter}',
  'bank.recoveryInSentence:ill': 'taastepesasse {letter}',
  'bank.recoveryInSentence:ine': 'taastepesas {letter}',
  'bank.recoveryInSentence:ela': 'taastepesast {letter}',
  'bank.recoveryInSentence:all': 'taastepesale {letter}',
  'bank.recoveryInSentence:ade': 'taastepesal {letter}',
  'bank.recoveryInSentence:abl': 'taastepesalt {letter}',
  'bank.recoveryInSentence:tra': 'taastepesaks {letter}',
  'bank.recoveryInSentence:ter': 'taastepesani {letter}',
  'bank.recoveryInSentence:ess': 'taastepesana {letter}',
  'bank.recoveryInSentence:abe': 'taastepesata {letter}',
  'bank.recoveryInSentence:com': 'taastepesaga {letter}',
} satisfies Translation<'common', 'et'>;
