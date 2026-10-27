/**
 * The light/dark switch in the header's top right corner.
 *
 * One real button: its name is "Dark theme" and `aria-pressed` says whether
 * the dark theme is on, so a screen reader hears "Dark theme, toggle button,
 * pressed". The sun and the moon both show, with a knob behind the theme in
 * use. The tooltip says whether the page follows the system or a choice made
 * here; lib/theme.ts has the rule.
 */

import type { ReactElement } from 'react';
import { Moon, Sun } from 'lucide-react';
import { themeHint, useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export function ThemeSwitch(): ReactElement {
  const { theme, choice, system, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      aria-pressed={dark}
      title={themeHint(choice, system)}
      onClick={toggle}
      className="relative grid h-7 w-[3.125rem] shrink-0 cursor-pointer grid-cols-2 place-items-center rounded-full border border-input bg-card p-0.5 transition-colors hover:bg-accent"
    >
      <span className="sr-only">Dark theme</span>
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-0.5 left-0.5 size-[1.375rem] rounded-full border border-primary/40 bg-primary/15 transition-transform motion-reduce:transition-none',
          dark && 'translate-x-[1.375rem]',
        )}
      />
      <Sun
        aria-hidden="true"
        className={cn('relative size-3.5', dark ? 'text-muted-foreground' : 'text-primary')}
      />
      <Moon
        aria-hidden="true"
        className={cn('relative size-3.5', dark ? 'text-primary' : 'text-muted-foreground')}
      />
    </button>
  );
}
