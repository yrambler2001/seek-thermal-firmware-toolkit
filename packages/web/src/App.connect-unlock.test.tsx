/**
 * The Connect section reads the page's one unlock flag (TESTING.md 42.67): App passes `device.unlocked` to it.
 * The flag is the one thing replaced here. `useDevice` is the real hook, and no camera is attached.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UNLOCK_POWER_CYCLE_NOTE } from '@seek-fw/core';
import type * as DeviceModule from './hooks/useDevice';
import { App } from './App';
import { detectSupport, type BrowserEnvironment } from './lib/support';
import { render } from './test-helpers';

const flag = vi.hoisted(() => ({ unlocked: false }));

vi.mock('./hooks/useDevice', async (importOriginal) => {
  const actual = await importOriginal<typeof DeviceModule>();
  return {
    ...actual,
    useDevice: () => ({ ...actual.useDevice(), unlocked: flag.unlocked }),
  };
});

const READY = detectSupport({
  hasWebUsb: true,
  userAgent: 'Chrome',
  platform: 'MacIntel',
  maxTouchPoints: 0,
  isSecureContext: true,
  protocol: 'https:',
} satisfies BrowserEnvironment);

/** The Connect section: the `<section>` its heading labels (Section names the heading `connect-heading`). */
function connectSection(container: HTMLElement): string {
  return container.querySelector('section[aria-labelledby="connect-heading"]')?.textContent ?? '';
}

beforeEach(() => {
  window.location.hash = '#/';
});

describe('App: the Connect section and the unlock flag', () => {
  it('shows the unlock note in the Connect section when the camera is unlocked', () => {
    flag.unlocked = true;
    const { container, unmount } = render(<App support={READY} />);
    expect(connectSection(container)).toContain(UNLOCK_POWER_CYCLE_NOTE);
    unmount();
  });

  it('shows no unlock note in the Connect section while the camera is not unlocked', () => {
    flag.unlocked = false;
    const { container, unmount } = render(<App support={READY} />);
    expect(connectSection(container)).not.toContain(UNLOCK_POWER_CYCLE_NOTE);
    unmount();
  });
});
