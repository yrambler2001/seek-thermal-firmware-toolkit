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
} as const satisfies NamespaceMessages;
