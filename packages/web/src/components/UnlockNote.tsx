/**
 * The note a page panel shows once one of its runs sent the unlock token: the
 * camera stays unlocked until its next power cycle, and other tools may misread
 * it until then. Information only. Nothing is refused or gated on it (TESTING.md
 * 42.55, 42.57). Every panel that sends the token shows this same line.
 */

import type { ReactElement } from 'react';
import { UNLOCK_POWER_CYCLE_NOTE } from '@seek-fw/core';
import { Alert } from '@/components/ui/alert';

export function UnlockNote(): ReactElement {
  return (
    <Alert tone="warn" className="mt-3">
      <p>{`Note: ${UNLOCK_POWER_CYCLE_NOTE}.`}</p>
    </Alert>
  );
}
