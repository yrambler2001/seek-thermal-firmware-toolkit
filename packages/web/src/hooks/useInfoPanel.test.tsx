/**
 * The Info tab's read: the same read `seek-fw info` makes (TESTING.md 42.64). The camera is a scripted fake
 * that answers like one firmware line; every request it receives is recorded, so the test can say what was
 * sent, in what order.
 */

import { act } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { OP, READ_ONLY_OPS, WebUsbTransport, type WebUsbDevice } from '@seek-fw/core';
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

/** The opcode names, for a readable sequence. */
const NAMES = new Map<number, string>(Object.entries(OP).map(([name, code]) => [code, name]));

function hexOf(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** One request as the wire shows it: an IN by name; an OUT by name, its first two bytes, and any payload beyond. */
function stepOf(call: CameraCall): string {
  const name = NAMES.get(call.request) ?? `0x${call.request.toString(16)}`;
  if (call.dir === 'in' || call.data === null) return `in ${name}`;
  const head = hexOf(call.data.subarray(0, 2));
  return `out ${name} ${head}${call.data.length > 2 ? ` +${String(call.data.length - 2)}B` : ''}`;
}

/** The requests in order, with a run of the same request written once and counted. */
function sequenceOf(calls: readonly CameraCall[]): string[] {
  const runs: { step: string; count: number }[] = [];
  for (const call of calls) {
    const step = stepOf(call);
    const last = runs[runs.length - 1];
    if (last?.step === step) last.count += 1;
    else runs.push({ step, count: 1 });
  }
  return runs.map(({ step, count }) => (count === 1 ? step : `${step} x${String(count)}`));
}

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

const BEGIN = OP.BEGIN_FIRMWARE_UPGRADE;

/**
 * The wire `seek-fw info` sends to a 4.18.2.0 camera, as this read sends it (TESTING.md 42.64). The identify
 * probe first: the version, a plain arm of a protected bank (subcommand 5, refused on the locked line only),
 * the 18-byte arm of the same bank with the unlock token, and a read of a bank open on every line (subcommand
 * 1). Then `readDeviceInfo`: the version again, the four GetFirmwareInfo selectors (1, 20, 17, 10) latched by
 * SetFirmwareInfoFeatures, the serial by SetRamDataFeatures, the boot config (3), the bootloader block (2), the
 * three banks (5, 8, 9) and the upgrade target (0). The fake answers every window with the same bytes, so each
 * bank is read in full only where the analysis needs it.
 */
const INFO_WIRE_4X: readonly string[] = [
  'in GET_FIRMWARE_INFO x2',
  'in GET_OPERATION_MODE',
  'out BEGIN_FIRMWARE_UPGRADE 0500',
  'in GET_ERROR_CODE',
  'in GET_OPERATION_MODE',
  'out BEGIN_FIRMWARE_UPGRADE 0500 +16B',
  'in GET_ERROR_CODE',
  'in GET_OPERATION_MODE',
  'out BEGIN_FIRMWARE_UPGRADE 0100',
  'in GET_ERROR_CODE',
  'in GET_FEATURED_FIRMWARE_DATA',
  'in GET_FIRMWARE_INFO x2',
  'out SET_FIRMWARE_INFO_FEATURES 0100',
  'out SET_FIRMWARE_INFO_FEATURES 1400',
  'out SET_FIRMWARE_INFO_FEATURES 1100',
  'out SET_FIRMWARE_INFO_FEATURES 0a00',
  'out SET_RAM_DATA_FEATURES 0000 +4B',
  'in GET_OPERATION_MODE',
  'out BEGIN_FIRMWARE_UPGRADE 0300',
  'in GET_ERROR_CODE',
  'in GET_FEATURED_FIRMWARE_DATA x5',
  'in GET_OPERATION_MODE',
  'out BEGIN_FIRMWARE_UPGRADE 0200',
  'in GET_ERROR_CODE',
  'in GET_FEATURED_FIRMWARE_DATA x512',
  'in GET_OPERATION_MODE',
  'out BEGIN_FIRMWARE_UPGRADE 0500',
  'in GET_ERROR_CODE',
  'in GET_FEATURED_FIRMWARE_DATA x9',
  'in GET_OPERATION_MODE',
  'out BEGIN_FIRMWARE_UPGRADE 0800',
  'in GET_ERROR_CODE',
  'in GET_FEATURED_FIRMWARE_DATA x9',
  'in GET_OPERATION_MODE',
  'out BEGIN_FIRMWARE_UPGRADE 0900',
  'in GET_ERROR_CODE',
  'in GET_FEATURED_FIRMWARE_DATA x9',
  'in GET_OPERATION_MODE',
  'out BEGIN_FIRMWARE_UPGRADE 0000',
  'in GET_ERROR_CODE',
  'in GET_FEATURED_FIRMWARE_DATA x9',
];

describe('useInfoPanel: the camera read', () => {
  it('reports the version and its build, and the camera analysis with it', async () => {
    const { panel, unmount } = await readOn([4, 18, 2, 0]);
    expect(panel.result?.version).toBe('4.18.2.0');
    expect(panel.result?.gate.permitsArming).toBe(true);
    expect(panel.result?.state?.profile.id).toBe('modern-4x');
    expect(panel.reporter.lines.some((line) => line.text.startsWith('firmware 4.18.2.0'))).toBe(
      true,
    );
    /* The probe's score is labelled as the probe's, before any bank is read; the Profile panel's is the
     * one taken after the read (TESTING.md 42.85 O5, 42.86). No bare "confidence". */
    const probe = panel.reporter.lines.filter((line) => line.text.startsWith('probe: '));
    expect(probe.map((line) => line.text)).toEqual([
      expect.stringMatching(
        /^probe: .+ \(modern-4x\), score \d\.\d\d from the answers above, before any bank is read$/,
      ),
    ]);
    expect(panel.reporter.lines.some((line) => line.text.includes('confidence'))).toBe(false);
    unmount();
  });

  it('sends the wire seek-fw info sends, in the same order, and no write to flash', async () => {
    const { calls, unmount } = await readOn([4, 18, 2, 0]);
    expect(sequenceOf(calls)).toEqual(INFO_WIRE_4X);
    /* Nothing that writes flash: the upgrade commit and the featured-data write never go out. */
    const sent = new Set(calls.map((call) => call.request));
    expect(sent.has(OP.COMPLETE_MEMORY_UPGRADE)).toBe(false);
    expect(sent.has(OP.SET_FEATURED_FIRMWARE_DATA)).toBe(false);
    /* Every other request is a read, or one of the two RAM latches the device-info read sets (TESTING.md 42.44). */
    for (const call of calls) {
      const latch =
        call.request === OP.SET_FIRMWARE_INFO_FEATURES || call.request === OP.SET_RAM_DATA_FEATURES;
      expect(READ_ONLY_OPS.has(call.request as never) || latch, stepOf(call)).toBe(true);
    }
    unmount();
  });

  it('sends the unlock token with the identify probe, so the note shows after the read', async () => {
    const { panel, calls, unmount } = await readOn([4, 18, 2, 0]);
    const tokenArms = calls.filter((call) => call.request === BEGIN && call.length === 18);
    expect(tokenArms).toHaveLength(1);
    expect(panel.unlockNote).toBe(true);
    unmount();
  });

  it('shows the note when another panel’s session sent the token, and this read leaves it showing', async () => {
    const { camera } = scriptedCamera({ version: [4, 18, 2, 0] });
    const handle = renderHook(() => useHarness(camera));
    expect(handle.result.current.panel.unlockNote).toBe(false);

    /* A session on this camera's connection, from another panel, sends the token. */
    seat.markUnlocked(deviceHandle(camera).makeTransport({ recipient: 'interface' }));
    handle.rerender();
    expect(handle.result.current.panel.unlockNote).toBe(true);

    await act(async () => {
      await handle.result.current.panel.read();
    });
    expect(handle.result.current.panel.unlockNote).toBe(true);
    handle.unmount();
  });

  it('says a build older than 0.8.0.0 is read by no tab, reads nothing further, and keeps the version', async () => {
    const { panel, calls, unmount } = await readOn([0, 3, 0, 1], true);
    expect(panel.result?.version).toBe('0.3.0.1');
    expect(panel.result?.gate.permitsArming).toBe(false);
    expect(panel.result?.state).toBeNull();
    expect(panel.reporter.progress.text).toContain('older than 0.8.0.0');
    /* The gate refuses before any window is armed: no probe arm, no bank read. */
    expect(calls.some((call) => call.request === BEGIN)).toBe(false);
    expect(calls.some((call) => call.request === OP.GET_FEATURED_FIRMWARE_DATA)).toBe(false);
    unmount();
  });

  it('says so, and reads nothing further, when the camera does not report a version', async () => {
    const { panel, calls, unmount } = await readOn(null);
    expect(panel.result?.version).toBeNull();
    expect(panel.result?.gate.permitsArming).toBe(false);
    expect(panel.result?.state).toBeNull();
    expect(panel.reporter.progress.text).toBe('No version reported.');
    expect(calls.some((call) => call.request === BEGIN)).toBe(false);
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
