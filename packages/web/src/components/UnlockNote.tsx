/**
 * The note a page panel shows once one of its runs sent the unlock token: the
 * camera stays unlocked until its next power cycle, and other tools may misread
 * it until then. Information only. Nothing is refused or gated on it (TESTING.md
 * 42.55, 42.57). Every panel that sends the token shows this same line.
 */

import type { ReactElement } from 'react';
import { Alert } from '@/components/ui/alert';
import { useT } from '@/i18n';

export function UnlockNote(): ReactElement {
  const { t } = useT();
  return (
    <Alert tone="warn" className="mt-3">
      <p>{t('app:unlockNote', { note: t('core:unlock.powerCycleNote') })}</p>
    </Alert>
  );
}
