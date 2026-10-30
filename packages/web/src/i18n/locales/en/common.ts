/**
 * Namespace `common`, English source: words several areas use.
 *
 * Owner: phase 1 (the i18n core). Agents run one at a time, so any agent may
 * add a word that several areas need. Never rename, reword or remove a key:
 * other areas use it.
 */

import type { NamespaceMessages } from '../../types';

export default {
  yes: 'Yes',
  no: 'No',
  cancel: 'Cancel',
  close: 'Close',
  continue: 'Continue',
  back: 'Back',
  retry: 'Retry',
  copy: 'Copy',
  copied: 'Copied',
  download: 'Download',
  save: 'Save',
  show: 'Show',
  hide: 'Hide',
  unknown: 'unknown',
  none: 'none',
  optional: 'Optional',
  loading: 'Loading…',

  /* Sizes: the number first, then a plain space; format the number yourself. */
  'size.bytes': { one: '{count} byte', other: '{count} bytes' },
  'size.kib': '{value} KiB',
  'size.mib': '{value} MiB',
  'size.kb': '{value} KB',
  'size.mb': '{value} MB',

  /* Counts. */
  'count.files': { one: '{count} file', other: '{count} files' },
  'count.blocks': { one: '{count} block', other: '{count} blocks' },
  'count.seconds': { one: '{count} second', other: '{count} seconds' },

  /* Lists: two names (or a list and one more name) joined by "and". listAnd() uses it. */
  'list.and': '{first} and {second}',
  /* Two names in the order they happen ("slot A, then recovery R"). listThen() uses it. */
  'list.then': '{first}, then {second}',
  /* Two names in a plain list ("slot A, slot B"). listComma() uses it. */
  'list.comma': '{first}, {second}',

  /*
   * Firmware banks. A bank is one of the camera's three firmware slots, A, B and R; R is the recovery
   * slot, the last-resort copy the bootloader falls back to. {letter} is A, B or R: keep the Latin
   * letter. lib/bank-names.ts builds them (bankName, bankWords).
   * The name on its own (a table cell, a row label, the start of a line):
   */
  'bank.slot': 'Slot {letter}',
  'bank.recovery': 'Recovery {letter}',
  /* The same names inside a sentence (English writes them in lower case there). */
  'bank.slotInSentence': 'slot {letter}',
  'bank.recoveryInSentence': 'recovery {letter}',
} as const satisfies NamespaceMessages;
