/**
 * The Info tab's read: the version the camera reports, judged by the gate, and
 * nothing else. The camera is a scripted fake that answers like one firmware
 * line; every request it receives is recorded, so the test can say what was sent.
 */

import { act } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { OP, WebUsbTransport, type WebUsbDevice } from '@seek-fw/core';
import { renderHook } from '../test-helpers';
import { scriptedCamera, type CameraCall } from '../test-fixtures';
import { DEFAULT_OPTIONS_FORM } from '../lib/options';
import { UnlockSeat } from '../lib/unlock-seat';
import type { DeviceHandle } from './useDevice';
import { useInfoPanel } from './useInfoPanel';
import { useRunner } from './useRunner';

/** The device's unlock flag for the test (TESTING.md 42.59); reset per test in `beforeEach`. */
let seat = new UnlockSeat();

beforeEach(() => {
  seat = new UnlockSeat();
});

function deviceHandle(camera: WebUsbDevice): DeviceHandle {
  return {
    device: null,
    description: 'Fake camera',
    generation: 1,
    canForgetDevice: false,
    connect: () => Promise.resolve({ kind: 'cancelled' }),
    forget: () => Promise.resolve({ kind: 'cancelled' }),
    makeTransport: () => {
      const transport = new WebUsbTransport(camera, { recipient: 'interface' });
      seat.opened(transport);
      return transport;
    },
    reattach: () => Promise.resolve(false),
    unlocked: seat.unlocked,
    markUnlocked: (transport) => {
      seat.markUnlocked(transport);
    },
    setResetWindow: (open) => {
      seat.setResetWindow(open);
    },
  };
}

function useHarness(camera: WebUsbDevice) {
  const runner = useRunner();
  const panel = useInfoPanel({ runner, device: deviceHandle(camera), form: DEFAULT_OPTIONS_FORM });
  return { panel, runner };
}

async function readOn(
  version: readonly [number, number, number, number] | null,
  legacy = false,
): Promise<{
  readonly panel: ReturnType<typeof useHarness>['panel'];
  readonly calls: CameraCall[];
  readonly unmount: () => void;
}> {
  const { camera, calls } = scriptedCamera({ version, legacy });
  const handle = renderHook(() => useHarness(camera));
  await act(async () => {
    await handle.result.current.panel.read();
  });
  return {
    panel: handle.result.current.panel,
    calls,
    unmount: handle.unmount,
  };
}

describe('useInfoPanel: the version read', () => {
  it('reports the version and its build, and that a 4.x build may be read', async () => {
    const { panel, unmount } = await readOn([4, 18, 2, 0]);
    expect(panel.result?.version).toBe('4.18.2.0');
    expect(panel.result?.gate.permitsArming).toBe(true);
    expect(panel.reporter.lines.some((line) => line.text.startsWith('firmware 4.18.2.0'))).toBe(
      true,
    );
    unmount();
  });

  it('sends only the identity read: no window is armed and no slot is read', async () => {
    const { calls, unmount } = await readOn([1, 0, 3, 0], true);
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      /* GetFirmwareInfo, and the operation-mode and error-code reads that go before it. */
      const allowed: readonly number[] = [
        OP.GET_FIRMWARE_INFO,
        OP.GET_OPERATION_MODE,
        OP.GET_ERROR_CODE,
      ];
      expect(allowed.includes(call.request), `request ${call.request.toString(16)}`).toBe(true);
      expect(call.dir).toBe('in');
    }
    expect(calls.some((call) => call.request === OP.BEGIN_FIRMWARE_UPGRADE)).toBe(false);
    expect(calls.some((call) => call.request === OP.GET_FEATURED_FIRMWARE_DATA)).toBe(false);
    unmount();
  });

  it('sends no unlock token on a 4.x build, the build the identify probe would arm on', async () => {
    /* The Info tab does not run the identify probe, so no 18-byte arm goes out and
     * the page has no unlock note to show here (TESTING.md 42.57). */
    const { panel, calls, unmount } = await readOn([4, 18, 2, 0]);
    expect(panel.result?.gate.permitsArming).toBe(true);
    expect(calls.some((call) => call.request === OP.BEGIN_FIRMWARE_UPGRADE)).toBe(false);
    unmount();
  });

  it('shows the note when another panel’s session sent the token: the camera is unlocked, though this tab sends nothing (TESTING.md 42.59)', async () => {
    const { camera, calls } = scriptedCamera({ version: [4, 18, 2, 0] });
    const handle = renderHook(() => useHarness(camera));
    expect(handle.result.current.panel.unlockNote).toBe(false);

    /* A session on this camera's connection, from another panel, sends the token. */
    seat.markUnlocked(deviceHandle(camera).makeTransport({ recipient: 'interface' }));
    handle.rerender();
    expect(handle.result.current.panel.unlockNote).toBe(true);

    /* This tab's own read sends nothing that unlocks. */
    await act(async () => {
      await handle.result.current.panel.read();
    });
    expect(calls.some((call) => call.request === OP.BEGIN_FIRMWARE_UPGRADE)).toBe(false);
    handle.unmount();
  });

  it('says a build older than 0.8.0.0 is read by no tab, and keeps the version it found', async () => {
    const { panel, unmount } = await readOn([0, 3, 0, 1], true);
    expect(panel.result?.version).toBe('0.3.0.1');
    expect(panel.result?.gate.permitsArming).toBe(false);
    expect(panel.reporter.progress.text).toContain('older than 0.8.0.0');
    unmount();
  });

  it('says so, and reads nothing further, when the camera does not report a version', async () => {
    const { panel, calls, unmount } = await readOn(null);
    expect(panel.result?.version).toBeNull();
    expect(panel.result?.gate.permitsArming).toBe(false);
    expect(panel.reporter.progress.text).toBe('No version reported.');
    expect(calls.some((call) => call.request === OP.BEGIN_FIRMWARE_UPGRADE)).toBe(false);
    unmount();
  });

  it('starts with nothing to show', () => {
    const { camera } = scriptedCamera({ version: [4, 18, 2, 0] });
    const { result, unmount } = renderHook(() => useHarness(camera));
    expect(result.current.panel.result).toBeNull();
    expect(result.current.panel.reading).toBe(false);
    unmount();
  });
});
