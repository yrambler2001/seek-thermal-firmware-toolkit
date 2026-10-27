/**
 * The light and dark themes.
 *
 * The page follows the system's light or dark setting until someone uses the
 * switch in the header. A choice made there is kept in localStorage under
 * `THEME_KEY`, and choosing the theme the system already uses removes it, so the
 * page follows the system again: the switch has two positions, and "follow the
 * system" is the one that matches the system.
 *
 * The theme in use is set on `<html>` as `data-theme="light"` or `"dark"`;
 * styles.css keys every dark token and the `dark:` variant on it, and the
 * `color-scheme` meta tag says the same. index.html runs the same rule in an
 * inline script before anything paints (theme.test.ts runs that script).
 *
 * Storage can throw (a private window, blocked site data). Every read and write
 * is wrapped: without storage the switch still works until the page closes.
 */

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export const THEME_KEY = 'seek-fw:theme';
export const DARK_QUERY = '(prefers-color-scheme: dark)';

export function parseTheme(value: string | null | undefined): Theme | null {
  return value === 'light' || value === 'dark' ? value : null;
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** The theme chosen with the switch, or null when the page follows the system. */
export function readThemeChoice(): Theme | null {
  try {
    return parseTheme(storage()?.getItem(THEME_KEY));
  } catch {
    return null;
  }
}

/** Keeps the choice, or forgets it (null). A store that throws keeps nothing. */
export function writeThemeChoice(choice: Theme | null): void {
  try {
    const store = storage();
    if (store === null) return;
    if (choice === null) store.removeItem(THEME_KEY);
    else store.setItem(THEME_KEY, choice);
  } catch {
    /* Blocked storage: the theme still changes, for this visit only. */
  }
}

function darkQuery(): MediaQueryList | null {
  return typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null;
}

/** The system's setting; light when the browser cannot say. */
export function systemTheme(): Theme {
  return darkQuery()?.matches === true ? 'dark' : 'light';
}

/** Puts `theme` on `<html>` and on the color-scheme meta tag. */
export function applyTheme(theme: Theme, doc: Document = document): void {
  doc.documentElement.dataset.theme = theme;
  doc.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme);
}

/** The switch's tooltip: where the theme in use comes from. */
export function themeHint(choice: Theme | null, system: Theme): string {
  if (choice === null) return "Follows your system's light or dark setting";
  if (choice !== system) return "Chosen here. Switch back to follow your system's setting.";
  return "Chosen here, the same as your system's setting now";
}

export interface ThemeState {
  /** The theme in use. */
  readonly theme: Theme;
  /** The choice kept from the switch, or null when the page follows the system. */
  readonly choice: Theme | null;
  /** The system's setting, kept up to date while the page is open. */
  readonly system: Theme;
  /** Switches to the other theme; landing on the system's theme forgets the choice. */
  readonly toggle: () => void;
}

export function useTheme(): ThemeState {
  const [choice, setChoice] = useState<Theme | null>(readThemeChoice);
  const [system, setSystem] = useState<Theme>(systemTheme);
  const theme = choice ?? system;

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /* The system's setting can change while the page is open (a sunset schedule). */
  useEffect(() => {
    const query = darkQuery();
    if (query === null) return undefined;
    const onChange = (): void => {
      setSystem(query.matches ? 'dark' : 'light');
    };
    query.addEventListener('change', onChange);
    return () => {
      query.removeEventListener('change', onChange);
    };
  }, []);

  /* A choice made in another tab of the page applies here too. */
  useEffect(() => {
    const onStorage = (event: StorageEvent): void => {
      if (event.key === THEME_KEY || event.key === null) setChoice(parseTheme(event.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const kept = next === system ? null : next;
    writeThemeChoice(kept);
    setChoice(kept);
  }, [theme, system]);

  return { theme, choice, system, toggle };
}
