/** Step 1, shared by both views. Presentational: every action is a prop. */

import type { ReactElement } from 'react';
import { Plug, PlugZap, Unplug, Waypoints } from 'lucide-react';
import { Prose } from './Prose';
import { Section } from './Section';
import { UnlockNote } from './UnlockNote';
import { Button } from './ui/button';
import { Toolbar } from './ui/toolbar';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils';

export interface ConnectSectionProps {
  readonly description: string;
  readonly connected: boolean;
  readonly canUseUsb: boolean;
  readonly canForget: boolean;
  readonly busy: boolean;
  readonly testing: boolean;
  /** The page's one unlock flag for this camera (TESTING.md 42.59). The section only reads it. */
  readonly unlocked: boolean;
  readonly onConnect: () => void;
  readonly onTest: () => void;
  readonly onForget: () => void;
}

export function ConnectSection({
  description,
  connected,
  canUseUsb,
  canForget,
  busy,
  testing,
  unlocked,
  onConnect,
  onTest,
  onForget,
}: ConnectSectionProps): ReactElement {
  const { t, rich } = useT();
  return (
    <Section id="connect" step="1" title={t('app:connect.title')} icon={<PlugZap />}>
      <Toolbar label={t('app:connect.actions')}>
        {/* CONNECT STAYS LIVE DURING A RUN: the preserve pipeline reboots the
         * camera by command, and this camera has no USB serial number, so
         * Chrome cannot re-recognise it afterwards — the re-confirm gesture
         * IS the recovery. Everything else still locks while busy. */}
        <Button variant="default" onClick={onConnect} disabled={!canUseUsb}>
          <Plug />
          {connected ? t('app:connect.change') : t('app:connect.connect')}
        </Button>
        <Button onClick={onTest} disabled={!connected || busy || testing}>
          <Waypoints />
          {t('app:connect.test')}
        </Button>
        <Button onClick={onForget} disabled={!connected || !canForget || busy}>
          <Unplug />
          {t('app:connect.forget')}
        </Button>
      </Toolbar>

      <p
        id="device-description"
        aria-live="polite"
        className="flex items-center gap-2 rounded-md border border-border/80 bg-sunken/60 px-3 py-2 font-mono text-[0.82rem]"
      >
        <span
          aria-hidden="true"
          className={cn(
            'size-1.5 shrink-0 rounded-full',
            connected ? 'bg-ok' : 'bg-muted-foreground/50',
          )}
        />
        <span className="min-w-0 [overflow-wrap:anywhere]">{description}</span>
      </p>

      {unlocked && <UnlockNote />}

      <Prose>
        <p>{rich('app:connect.vendorNote', { params: { vendor: '0x289d' } })}</p>
      </Prose>
    </Section>
  );
}
