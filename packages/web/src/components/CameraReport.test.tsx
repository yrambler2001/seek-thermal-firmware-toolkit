/**
 * The Info tab's report shows the upgrade target warning under the upgrade target row, for both warned cases
 * (TESTING.md 42.50 and 42.67). The warning is information only: the report offers no gate.
 */

import { describe, expect, it } from 'vitest';
import type { DeviceState } from '@seek-fw/core';
import { render } from '@/test-helpers';
import { fakeDeviceState } from '../test-fixtures';
import { CameraReport } from './CameraReport';

const WARNING = 'nothing here stops an upgrade';

describe('CameraReport: the upgrade target warning', () => {
  it('shows the recovery warning when the camera runs recovery and its own upgrade writes B', async () => {
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
    const { container, unmount } = render(<CameraReport state={recovery} />);
    expect(container.textContent).toContain('The camera is running its recovery bank');
    expect(container.textContent).toContain(
      'its own upgrade writes Slot B, which it is not running',
    );
    expect(container.textContent).toContain(WARNING);
    unmount();
  });

  it('shows no warning when the upgrade target is the other bank', async () => {
    const state = await fakeDeviceState();
    const otherBank = { ...state, boot: { booted: 'a', target: 'b' } } as DeviceState;
    const { container, unmount } = render(<CameraReport state={otherBank} />);
    expect(container.textContent).not.toContain(WARNING);
    unmount();
  });
});
