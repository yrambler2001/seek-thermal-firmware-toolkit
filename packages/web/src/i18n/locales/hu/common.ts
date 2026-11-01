/**
 * Namespace `common`, magyar (hu), translated from the English source: words several areas use.
 *
 * Owner: phase 1 (the i18n core). Agents run one at a time, so any agent may
 * add a word that several areas need. Never rename, reword or remove a key:
 * other areas use it. (The pre-translation audit removed the stock words no
 * page used; i18n/key-usage.test.ts fails on a key nothing names.)
 */

import type { Translation } from '../../types';

export default {
  cancel: 'Mégse',

  /* Counts. */
  'count.files': { one: '{count} fájl', other: '{count} fájl' },

  /* Lists: two names (or a list and one more name) joined by "and". listAnd() uses it. */
  'list.and': '{first} és {second}',
  /* Two names in the order they happen ("slot A, then recovery R"). listThen() uses it. */
  'list.then': '{first}, majd {second}',
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
  'bank.slot': '{letter}-slot',
  'bank.slot:nom': 'az {letter}-slot',
  'bank.slot:nom#B': 'a {letter}-slot',
  'bank.slot:acc': 'az {letter}-slotot',
  'bank.slot:acc#B': 'a {letter}-slotot',
  'bank.slot:dat': 'az {letter}-slotnak',
  'bank.slot:dat#B': 'a {letter}-slotnak',
  'bank.slot:ins': 'az {letter}-slottal',
  'bank.slot:ins#B': 'a {letter}-slottal',
  'bank.slot:ine': 'az {letter}-slotban',
  'bank.slot:ine#B': 'a {letter}-slotban',
  'bank.slot:ill': 'az {letter}-slotba',
  'bank.slot:ill#B': 'a {letter}-slotba',
  'bank.slot:ela': 'az {letter}-slotból',
  'bank.slot:ela#B': 'a {letter}-slotból',
  'bank.slot:sup': 'az {letter}-sloton',
  'bank.slot:sup#B': 'a {letter}-sloton',
  'bank.slot:sub': 'az {letter}-slotra',
  'bank.slot:sub#B': 'a {letter}-slotra',
  'bank.slot:del': 'az {letter}-slotról',
  'bank.slot:del#B': 'a {letter}-slotról',
  'bank.slot:ade': 'az {letter}-slotnál',
  'bank.slot:ade#B': 'a {letter}-slotnál',
  'bank.slot:all': 'az {letter}-slothoz',
  'bank.slot:all#B': 'a {letter}-slothoz',
  'bank.slot:abl': 'az {letter}-slottól',
  'bank.slot:abl#B': 'a {letter}-slottól',
  'bank.slot:tra': 'az {letter}-slottá',
  'bank.slot:tra#B': 'a {letter}-slottá',
  'bank.slot:ter': 'az {letter}-slotig',
  'bank.slot:ter#B': 'a {letter}-slotig',
  'bank.slot:ess': 'az {letter}-slotként',
  'bank.slot:ess#B': 'a {letter}-slotként',
  'bank.slot:cau': 'az {letter}-slotért',
  'bank.slot:cau#B': 'a {letter}-slotért',
  'bank.recovery': 'Helyreállító {letter}-slot',
  'bank.recovery:nom': 'a helyreállító {letter}-slot',
  'bank.recovery:acc': 'a helyreállító {letter}-slotot',
  'bank.recovery:dat': 'a helyreállító {letter}-slotnak',
  'bank.recovery:ins': 'a helyreállító {letter}-slottal',
  'bank.recovery:ine': 'a helyreállító {letter}-slotban',
  'bank.recovery:ill': 'a helyreállító {letter}-slotba',
  'bank.recovery:ela': 'a helyreállító {letter}-slotból',
  'bank.recovery:sup': 'a helyreállító {letter}-sloton',
  'bank.recovery:sub': 'a helyreállító {letter}-slotra',
  'bank.recovery:del': 'a helyreállító {letter}-slotról',
  'bank.recovery:ade': 'a helyreállító {letter}-slotnál',
  'bank.recovery:all': 'a helyreállító {letter}-slothoz',
  'bank.recovery:abl': 'a helyreállító {letter}-slottól',
  'bank.recovery:tra': 'a helyreállító {letter}-slottá',
  'bank.recovery:ter': 'a helyreállító {letter}-slotig',
  'bank.recovery:ess': 'a helyreállító {letter}-slotként',
  'bank.recovery:cau': 'a helyreállító {letter}-slotért',
  /* The same names inside a sentence (English writes them in lower case there). */
  'bank.slotInSentence': '{letter}-slot',
  'bank.slotInSentence:nom': 'az {letter}-slot',
  'bank.slotInSentence:nom#B': 'a {letter}-slot',
  'bank.slotInSentence:acc': 'az {letter}-slotot',
  'bank.slotInSentence:acc#B': 'a {letter}-slotot',
  'bank.slotInSentence:dat': 'az {letter}-slotnak',
  'bank.slotInSentence:dat#B': 'a {letter}-slotnak',
  'bank.slotInSentence:ins': 'az {letter}-slottal',
  'bank.slotInSentence:ins#B': 'a {letter}-slottal',
  'bank.slotInSentence:ine': 'az {letter}-slotban',
  'bank.slotInSentence:ine#B': 'a {letter}-slotban',
  'bank.slotInSentence:ill': 'az {letter}-slotba',
  'bank.slotInSentence:ill#B': 'a {letter}-slotba',
  'bank.slotInSentence:ela': 'az {letter}-slotból',
  'bank.slotInSentence:ela#B': 'a {letter}-slotból',
  'bank.slotInSentence:sup': 'az {letter}-sloton',
  'bank.slotInSentence:sup#B': 'a {letter}-sloton',
  'bank.slotInSentence:sub': 'az {letter}-slotra',
  'bank.slotInSentence:sub#B': 'a {letter}-slotra',
  'bank.slotInSentence:del': 'az {letter}-slotról',
  'bank.slotInSentence:del#B': 'a {letter}-slotról',
  'bank.slotInSentence:ade': 'az {letter}-slotnál',
  'bank.slotInSentence:ade#B': 'a {letter}-slotnál',
  'bank.slotInSentence:all': 'az {letter}-slothoz',
  'bank.slotInSentence:all#B': 'a {letter}-slothoz',
  'bank.slotInSentence:abl': 'az {letter}-slottól',
  'bank.slotInSentence:abl#B': 'a {letter}-slottól',
  'bank.slotInSentence:tra': 'az {letter}-slottá',
  'bank.slotInSentence:tra#B': 'a {letter}-slottá',
  'bank.slotInSentence:ter': 'az {letter}-slotig',
  'bank.slotInSentence:ter#B': 'a {letter}-slotig',
  'bank.slotInSentence:ess': 'az {letter}-slotként',
  'bank.slotInSentence:ess#B': 'a {letter}-slotként',
  'bank.slotInSentence:cau': 'az {letter}-slotért',
  'bank.slotInSentence:cau#B': 'a {letter}-slotért',
  'bank.recoveryInSentence': 'helyreállító {letter}-slot',
  'bank.recoveryInSentence:nom': 'a helyreállító {letter}-slot',
  'bank.recoveryInSentence:acc': 'a helyreállító {letter}-slotot',
  'bank.recoveryInSentence:dat': 'a helyreállító {letter}-slotnak',
  'bank.recoveryInSentence:ins': 'a helyreállító {letter}-slottal',
  'bank.recoveryInSentence:ine': 'a helyreállító {letter}-slotban',
  'bank.recoveryInSentence:ill': 'a helyreállító {letter}-slotba',
  'bank.recoveryInSentence:ela': 'a helyreállító {letter}-slotból',
  'bank.recoveryInSentence:sup': 'a helyreállító {letter}-sloton',
  'bank.recoveryInSentence:sub': 'a helyreállító {letter}-slotra',
  'bank.recoveryInSentence:del': 'a helyreállító {letter}-slotról',
  'bank.recoveryInSentence:ade': 'a helyreállító {letter}-slotnál',
  'bank.recoveryInSentence:all': 'a helyreállító {letter}-slothoz',
  'bank.recoveryInSentence:abl': 'a helyreállító {letter}-slottól',
  'bank.recoveryInSentence:tra': 'a helyreállító {letter}-slottá',
  'bank.recoveryInSentence:ter': 'a helyreállító {letter}-slotig',
  'bank.recoveryInSentence:ess': 'a helyreállító {letter}-slotként',
  'bank.recoveryInSentence:cau': 'a helyreállító {letter}-slotért',
} satisfies Translation<'common', 'hu'>;
