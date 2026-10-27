/**
 * The masthead (the name, the camera status, the light/dark switch, the link to the repository) and the
 * tab switch.
 *
 * The five tabs are real URLs (`#/`, `#/preserve`, `#/v4`, `#/decrypt`,
 * `#/slots`), so the switch is five real links carrying `aria-current="page"` —
 * not a tab widget, which would make a tab impossible to link to.
 */

import type { ReactElement } from 'react';
import { Archive, FileKey2, Info, Layers, Radar, Thermometer } from 'lucide-react';
import { REPO_URL } from '@seek-fw/core';
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

/* GitHub's own mark (Octicons `mark-github`, MIT): lucide dropped its brand icons. */
function GitHubMark({ className }: { readonly className?: string }): ReactElement {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
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
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="The toolkit on GitHub"
              className="flex size-7 shrink-0 items-center justify-center rounded-full border border-input bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <GitHubMark className="size-4" />
              <span className="sr-only">The toolkit on GitHub</span>
            </a>
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
