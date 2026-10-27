/**
 * The light/dark switch: it follows the system until used, a choice made with
 * it is kept and wins over the system, choosing the system's own theme goes
 * back to following the system, and storage that throws changes none of that
 * for the visit. index-html.test.ts runs the script that applies a kept
 * choice before the page paints.
 */

import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { THEME_KEY } from '@/lib/theme';
import { render } from '@/test-helpers';
import { denied, fakeSystem, resetThemeDom } from '@/test-theme';
import { ThemeSwitch } from './ThemeSwitch';

let meta: HTMLMetaElement;

beforeEach(() => {
  localStorage.clear();
  meta = resetThemeDom();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
  meta.remove();
});

function theSwitch(container: HTMLElement): HTMLButtonElement {
  const button = container.querySelector<HTMLButtonElement>('button[aria-pressed]');
  if (button === null) throw new Error('no switch on the page');
  return button;
}

function click(button: HTMLButtonElement): void {
  act(() => {
    button.click();
  });
}

/** What the page shows: the theme on <html>, the meta tag, and the switch's state. */
function shown(button: HTMLButtonElement): {
  theme: string | undefined;
  meta: string;
  pressed: string | null;
} {
  return {
    theme: document.documentElement.dataset.theme,
    meta: meta.content,
    pressed: button.getAttribute('aria-pressed'),
  };
}

describe('ThemeSwitch', () => {
  it('is a real button named "Dark theme"', () => {
    fakeSystem(false);
    const { container, unmount } = render(<ThemeSwitch />);
    const button = theSwitch(container);
    expect(button.tagName).toBe('BUTTON');
    expect(button.type).toBe('button');
    expect(button.textContent.trim()).toBe('Dark theme');
    unmount();
  });

  it('follows the system by default and keeps nothing', () => {
    const system = fakeSystem(true);
    const { container, unmount } = render(<ThemeSwitch />);
    const button = theSwitch(container);
    expect(shown(button)).toEqual({ theme: 'dark', meta: 'dark', pressed: 'true' });
    expect(button.title).toBe("Follows your system's light or dark setting");

    /* The system's setting changes while the page is open. */
    system.setDark(false);
    expect(shown(button)).toEqual({ theme: 'light', meta: 'light', pressed: 'false' });
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
    unmount();
  });

  it('is light when the browser cannot say what the system uses', () => {
    const { container, unmount } = render(<ThemeSwitch />);
    expect(shown(theSwitch(container))).toEqual({
      theme: 'light',
      meta: 'light',
      pressed: 'false',
    });
    unmount();
  });

  it('sets and keeps the other theme, and goes back to the system on the second press', () => {
    fakeSystem(false);
    const { container, unmount } = render(<ThemeSwitch />);
    const button = theSwitch(container);

    click(button);
    expect(shown(button)).toEqual({ theme: 'dark', meta: 'dark', pressed: 'true' });
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    expect(button.title).toBe("Chosen here. Switch back to follow your system's setting.");

    click(button);
    expect(shown(button)).toEqual({ theme: 'light', meta: 'light', pressed: 'false' });
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
    expect(button.title).toBe("Follows your system's light or dark setting");
    unmount();
  });

  it('keeps a choice when the system changes under it', () => {
    localStorage.setItem(THEME_KEY, 'light');
    const system = fakeSystem(true);
    const { container, unmount } = render(<ThemeSwitch />);
    const button = theSwitch(container);
    expect(shown(button)).toEqual({ theme: 'light', meta: 'light', pressed: 'false' });

    system.setDark(false);
    expect(shown(button)).toEqual({ theme: 'light', meta: 'light', pressed: 'false' });
    expect(button.title).toBe("Chosen here, the same as your system's setting now");

    /* Now the other theme differs from the system, so it is kept in turn. */
    click(button);
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    expect(shown(button)).toEqual({ theme: 'dark', meta: 'dark', pressed: 'true' });
    unmount();
  });

  it('ignores a stored value that is not a theme', () => {
    localStorage.setItem(THEME_KEY, 'sepia');
    fakeSystem(true);
    const { container, unmount } = render(<ThemeSwitch />);
    expect(shown(theSwitch(container)).theme).toBe('dark');
    unmount();
  });

  it('still switches when every storage call throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(denied);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(denied);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(denied);
    fakeSystem(true);
    const { container, unmount } = render(<ThemeSwitch />);
    const button = theSwitch(container);
    expect(shown(button)).toEqual({ theme: 'dark', meta: 'dark', pressed: 'true' });

    click(button);
    expect(shown(button)).toEqual({ theme: 'light', meta: 'light', pressed: 'false' });
    click(button);
    expect(shown(button)).toEqual({ theme: 'dark', meta: 'dark', pressed: 'true' });
    unmount();
  });

  it('still switches when reaching localStorage at all throws', () => {
    vi.spyOn(globalThis, 'localStorage', 'get').mockImplementation(denied);
    fakeSystem(false);
    const { container, unmount } = render(<ThemeSwitch />);
    const button = theSwitch(container);
    expect(shown(button).theme).toBe('light');

    click(button);
    expect(shown(button)).toEqual({ theme: 'dark', meta: 'dark', pressed: 'true' });
    unmount();
  });

  it('takes a choice made in another tab of the page', () => {
    fakeSystem(false);
    const { container, unmount } = render(<ThemeSwitch />);
    const button = theSwitch(container);

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: THEME_KEY, newValue: 'dark' }));
    });
    expect(shown(button).theme).toBe('dark');

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: THEME_KEY, newValue: null }));
    });
    expect(shown(button).theme).toBe('light');
    unmount();
  });
});
