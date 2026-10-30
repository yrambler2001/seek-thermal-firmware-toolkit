/**
 * Namespace `common`, English source: words several areas use.
 *
 * Owner: phase 1 (the i18n core). Phase-2 agents read it and do not edit it:
 * a word missing here goes into the agent's own namespace, so two agents never
 * edit this file at once. It can be hoisted here when the branches are merged.
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

  /* Sizes: the number comes first, then a no-break space. */
  'size.bytes': { one: '{count} byte', other: '{count} bytes' },
  'size.kib': '{value} KiB',
  'size.mib': '{value} MiB',
  'size.kb': '{value} KB',
  'size.mb': '{value} MB',

  /* Counts. */
  'count.files': { one: '{count} file', other: '{count} files' },
  'count.blocks': { one: '{count} block', other: '{count} blocks' },
  'count.seconds': { one: '{count} second', other: '{count} seconds' },
} as const satisfies NamespaceMessages;
