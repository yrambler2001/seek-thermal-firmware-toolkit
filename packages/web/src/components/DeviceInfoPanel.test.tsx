/**
 * The device info's upgrade target, when it is the bank the camera booted from (TESTING.md 42.50):
 * the row names it, and a warning sits under it. The warning is a warning: the panel offers no gate.
 */

import { describe, expect, it } from 'vitest';
import type { DeviceState } from '@seek-fw/core';
import { render } from '@/test-helpers';
import { fakeDeviceState } from '../test-fixtures';
import { deviceState2016 } from '../test-slots';
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

  it('shows the recovery warning when the camera runs recovery and its own upgrade writes B (TESTING.md 42.67)', async () => {
    const state = await fakeDeviceState();
    /* 4.8.2.1 under boot word 2: R runs, and B holds the same bootable image as R. */
    const same = 'f96ac57eda75bca2';
    const byKey = new Map(state.byKey);
    byKey.set('b', {
      ...state.byKey.get('b')!,
      present: true,
      blank: false,
      bootability: 'bootable',
      sha256: same,
    });
    byKey.set('r', {
      ...state.byKey.get('r')!,
      present: true,
      blank: false,
      bootability: 'bootable',
      sha256: same,
    });
    const recovery = { ...state, byKey, boot: { booted: 'r', target: 'b' } } as DeviceState;
    const { container, unmount } = render(<DeviceInfoPanel state={recovery} />);
    expect(container.textContent).toContain('The camera is running its recovery bank');
    expect(container.textContent).toContain(
      'its own upgrade writes Bank B, which it is not running',
    );
    expect(container.textContent).toContain(
      'Bank B holds the same bootable image as the bank it runs',
    );
    expect(container.textContent).toContain(WARNING);
    expect(container.textContent).not.toContain('is both the bank the camera booted from');
    unmount();
  });
});

describe('DeviceInfoPanel on the locked line: the booted bank and the next start (TESTING.md 42.84)', () => {
  it('names the bank the 2016 camera entered, and the bank its next start runs, with the page labels', async () => {
    const state = deviceState2016(await fakeDeviceState());
    const { container, unmount } = render(<DeviceInfoPanel state={state} />);
    const text = container.textContent;
    expect(text).toMatch(/Booted from\W*Bank A/);
    expect(text).toContain(
      'Bank A — the boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, and it holds an image the bootloader accepts',
    );
    expect(text).not.toContain('Named booted');
    unmount();
  });

  it('shows no next start where the boot rule is not decoded (the modern line)', async () => {
    const state = await fakeDeviceState();
    const { container, unmount } = render(<DeviceInfoPanel state={state} />);
    expect(container.textContent).not.toContain('Next start');
    unmount();
  });
});
