/**
 * A stand-in for the system's light/dark setting (jsdom has no matchMedia),
 * and the `<html>` state the theme code writes, for the theme tests.
 */

import { act } from 'react';
import { vi } from 'vitest';
import { DARK_QUERY } from './lib/theme';

export interface FakeSystem {
  /** Flips the system's setting and tells every listener, as the browser would. */
  setDark: (dark: boolean) => void;
}

/** Installs `window.matchMedia` answering DARK_QUERY with `dark`; undo with vi.unstubAllGlobals(). */
export function fakeSystem(dark: boolean): FakeSystem {
  let matches = dark;
  const listeners = new Set<() => void>();
  const query = {
    media: DARK_QUERY,
    get matches(): boolean {
      return matches;
    },
    addEventListener: (_type: 'change', listener: () => void): void => {
      listeners.add(listener);
    },
    removeEventListener: (_type: 'change', listener: () => void): void => {
      listeners.delete(listener);
    },
  };
  vi.stubGlobal('matchMedia', (media: string) => {
    if (media !== DARK_QUERY) throw new Error(`unexpected media query ${media}`);
    return query;
  });
  return {
    setDark: (next) => {
      matches = next;
      act(() => {
        for (const listener of listeners) listener();
      });
    },
  };
}

/** Puts index.html's color-scheme meta tag in the head and clears `data-theme`. */
export function resetThemeDom(): HTMLMetaElement {
  document.querySelector('meta[name="color-scheme"]')?.remove();
  const meta = document.createElement('meta');
  meta.name = 'color-scheme';
  meta.content = 'light dark';
  document.head.append(meta);
  delete document.documentElement.dataset.theme;
  return meta;
}

/** A storage error as a private window or blocked site data raises it. */
export function denied(): never {
  throw new DOMException('The operation is insecure.', 'SecurityError');
}
