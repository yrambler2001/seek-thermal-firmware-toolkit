/**
 * The Connect section shows the page's unlock note from the one flag for the camera (TESTING.md 42.67). The
 * section only reads the flag: it sends no token, and nothing in it sets the flag.
 */

import { describe, expect, it } from 'vitest';
import { UNLOCK_POWER_CYCLE_NOTE } from '@seek-fw/core';
import { render } from '@/test-helpers';
import { ConnectSection, type ConnectSectionProps } from './ConnectSection';

const NOTE = `Note: ${UNLOCK_POWER_CYCLE_NOTE}.`;

const BASE: ConnectSectionProps = {
  description: 'Seek Thermal Compact (serial 1013CE098ACA)',
  connected: true,
  canUseUsb: true,
  canForget: true,
  busy: false,
  testing: false,
  unlocked: false,
  onConnect: () => undefined,
  onTest: () => undefined,
  onForget: () => undefined,
};

describe('ConnectSection: the unlock note', () => {
  it('shows the note inside the Connect section when the camera is unlocked', () => {
    const { container, unmount } = render(<ConnectSection {...BASE} unlocked />);
    const section = container.querySelector('section[aria-labelledby="connect-heading"]');
    expect(section?.textContent).toContain(NOTE);
    unmount();
  });

  it('shows no note while the camera is not unlocked', () => {
    const { container, unmount } = render(<ConnectSection {...BASE} unlocked={false} />);
    expect(container.textContent).not.toContain(UNLOCK_POWER_CYCLE_NOTE);
    unmount();
  });

  it('keeps the note when the camera is busy or under test, since it reads the flag only', () => {
    const { container, unmount } = render(<ConnectSection {...BASE} unlocked busy testing />);
    expect(container.textContent).toContain(NOTE);
    unmount();
  });
});
