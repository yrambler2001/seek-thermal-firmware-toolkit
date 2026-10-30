/**
 * Namespace `core`, English source: sentences that `@seek-fw/core` exports and
 * the page shows. Each English entry is the core's string, word for word
 * (locales.test.ts checks the ones listed there), so the CLI and the page keep
 * saying the same thing in English.
 *
 * Owner: phase 3 (core messages). Phase 1 put the unlock note here as the
 * first entry.
 */

import type { NamespaceMessages } from '../../types';

export default {
  /** `UNLOCK_POWER_CYCLE_NOTE`; the page shows it as "Note: …." (app:unlockNote). */
  'unlock.powerCycleNote':
    'the camera stays unlocked until a power cycle, and other tools may misread it until then; power-cycle it before you use them',
} as const satisfies NamespaceMessages;
