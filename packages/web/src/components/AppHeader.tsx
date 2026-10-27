/**
 * The masthead (the name, the camera status, the light/dark switch) and the tab switch.
 *
 * The five tabs are real URLs (`#/`, `#/preserve`, `#/v4`, `#/decrypt`,
 * `#/slots`), so the switch is five real links carrying `aria-current="page"` —
 * not a tab widget, which would make a tab impossible to link to.
 */

import type { ReactElement } from 'react';
import { Archive, FileKey2, Info, Layers, Radar, Thermometer } from 'lucide-react';
import { ROUTE_HREF, ROUTE_LABEL, ROUTES, type Route } from '@/lib/routing';
import { cn } from '@/lib/utils';
import { ThemeSwitch } from './ThemeSwitch';

export interface AppHeaderProps {
  readonly route: Route;
  readonly connected: boolean;
  readonly canUseUsb: boolean;
}

interface NavItem {
  readonly route: Route;
  readonly icon: ReactElement;
  /** The tab writes to the camera, so it reads as the flasher it is. */
  readonly danger: boolean;
}

const ICONS: Readonly<Record<Route, ReactElement>> = {
  info: <Info className="size-4" />,
  preserve: <Archive className="size-4" />,
  v4: <Radar className="size-4" />,
  decrypt: <FileKey2 className="size-4" />,
  slots: <Layers className="size-4" />,
};

/* Only the slots tab writes without a guided run: its writes ask first, one bank
 * at a time. The 0.x/1.x tab writes too, but as a guided run that asks before
 * each write and puts the camera back, so it reads like the dump tabs. */
const NAV: readonly NavItem[] = ROUTES.map((route) => ({
  route,
  icon: ICONS[route],
  danger: route === 'slots',
}));

export function AppHeader({ route, connected, canUseUsb }: AppHeaderProps): ReactElement {
  return (
    <header className="relative isolate border-b border-border/70 bg-card/60">
      <div aria-hidden="true" className="bezel-grid pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 h-0.5',
          route === 'slots' ? 'bg-destructive' : 'bg-primary/70',
        )}
      />
      <div className="mx-auto w-full max-w-[64rem] px-4 pt-5 pb-0 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary"
          >
            <Thermometer className="size-5" />
          </span>
          <h1 className="text-[1.15rem] leading-tight font-semibold tracking-tight">
            Seek Thermal Firmware Toolkit
          </h1>
          <div className="ms-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[0.72rem] font-medium text-muted-foreground">
              <span
                aria-hidden="true"
                className={cn(
                  'size-1.5 rounded-full',
                  connected ? 'bg-ok' : canUseUsb ? 'bg-muted-foreground/60' : 'bg-warn',
                )}
              />
              {connected ? 'Camera selected' : canUseUsb ? 'No camera selected' : 'USB unavailable'}
            </span>
            <ThemeSwitch />
          </div>
        </div>

        <nav aria-label="Tabs" className="-mb-px flex flex-wrap gap-1 pt-4">
          {NAV.map((item) => {
            const current = route === item.route;
            return (
              <a
                key={item.route}
                href={ROUTE_HREF[item.route]}
                {...(current ? { 'aria-current': 'page' as const } : {})}
                className={cn(
                  'inline-flex items-center gap-2 rounded-t-lg border border-transparent border-b-transparent px-3 py-2 text-[0.85rem] font-semibold transition-colors',
                  current
                    ? 'border-border border-b-background bg-background text-foreground'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                  current && item.danger && 'text-destructive',
                  item.danger && !current && 'hover:text-destructive',
                )}
              >
                <span aria-hidden="true" className="[&_svg]:size-4">
                  {item.icon}
                </span>
                {ROUTE_LABEL[item.route]}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
