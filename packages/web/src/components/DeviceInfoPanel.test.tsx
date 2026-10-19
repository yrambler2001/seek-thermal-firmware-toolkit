/**
 * The device info's upgrade target, when it is the bank the camera booted from (TESTING.md 42.50):
 * the row names it, and a warning sits under it. The warning is a warning: the panel offers no gate.
 */

import { describe, expect, it } from 'vitest';
import type { DeviceState } from '@seek-fw/core';
import { render } from '@/test-helpers';
import { fakeDeviceState } from '../test-fixtures';
import { DeviceInfoPanel } from './DeviceInfoPanel';

const WARNING = 'nothing here stops an upgrade';

describe('DeviceInfoPanel: the upgrade target that is the booted bank', () => {
  it('shows the warning under the upgrade target, naming the bank with the page label', async () => {
    const state = await fakeDeviceState();
    const sameBank = { ...state, boot: { booted: 'b', target: 'b' } } as DeviceState;
    const { container, unmount } = render(<DeviceInfoPanel state={sameBank} />);
    expect(container.textContent).toContain('Booted from');
    expect(container.textContent).toContain('Upgrade target (its own upgrade)');
    expect(container.textContent).toContain('Bank B is both the bank the camera booted from');
    expect(container.textContent).toContain(WARNING);
    unmount();
  });

  it('shows no warning when the upgrade target is the other bank', async () => {
    const state = await fakeDeviceState();
    const otherBank = { ...state, boot: { booted: 'a', target: 'b' } } as DeviceState;
    const { container, unmount } = render(<DeviceInfoPanel state={otherBank} />);
    expect(container.textContent).not.toContain(WARNING);
    unmount();
  });
});
