/**
 * The dump path against a fake camera, with an eye on one behaviour in
 * particular: cancelling must still hand the user an archive.
 *
 * Core stops the selector loop on abort and returns a complete result — the
 * partial image, a manifest that records which windows ran, and a README — so
 * the web layer must package and download it rather than treating the cancel
 * as a failure. That is the promise the Cancel button's own label makes.
 */

import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  OP,
  SAFE_BEFORE_IDENTITY,
  WINDOW_SIZE,
  WebUsbTransport,
  hex,
  type Artifact,
  type Opcode,
  type WebUsbDevice,
} from '@seek-fw/core';
import { renderHook } from '../test-helpers';
import { deferred, installLocks, removeLocks } from '../test-locks';
import { IN_USE_ELSEWHERE_LOG, IN_USE_ELSEWHERE_STATUS, withCameraLock } from '../lib/camera-lock';
import { FIRMWARE_TOO_OLD_HINT, permissionHint } from '../lib/hints';
import { DEFAULT_OPTIONS_FORM, type OptionsFailure } from '../lib/options';
import { scriptedCamera, type CameraCall } from '../test-fixtures';
import { useDumpPanel, type DumpMode } from './useDumpPanel';
import { useRunner } from './useRunner';
import type { DeviceHandle } from './useDevice';
import { UnlockSeat } from '../lib/unlock-seat';

const downloads: { dirName: string; artifacts: readonly Artifact[] }[] = [];

vi.mock('../lib/download', () => ({
  downloadArchive: (dirName: string, artifacts: readonly Artifact[]) => {
    downloads.push({ dirName, artifacts });
    return {
      fileName: `${dirName}.zip`,
      fileCount: artifacts.length,
      bytes: 4096,
      dataBytes: 2048,
    };
  },
  mib: (bytes: number, digits = 1) => (bytes / (1024 * 1024)).toFixed(digits),
}));

/**
 * The smallest camera that answers the five read-only opcodes. Every window
 * reads back as a single 0xA5-filled block, so no firmware image is found and
 * the decrypt stage stays out of the way. It reports firmware 4.18.2.0: a
 * dump refuses a camera that does not say which build it runs (core
 * identity-gate.test.ts), and this fake used to answer GetFirmwareInfo empty.
 */
function fakeCamera(onWindowRead?: (count: number) => void): WebUsbDevice {
  let opened = false;
  let windowsRead = 0;
  return {
    vendorId: 0x289d,
    productId: 0x0011,
    manufacturerName: 'Seek Thermal',
    productName: 'Fake PIR324',
    serialNumber: '0E1CA0Z16D19',
    configuration: { configurationValue: 1 },
    get opened(): boolean {
      return opened;
    },
    open: () => {
      opened = true;
      return Promise.resolve();
    },
    close: () => {
      opened = false;
      return Promise.resolve();
    },
    selectConfiguration: () => Promise.resolve(),
    claimInterface: () => Promise.resolve(),
    releaseInterface: () => Promise.resolve(),
    controlTransferIn: (setup, length) => {
      if (setup.request === OP.GET_ERROR_CODE) {
        return Promise.resolve({ status: 'ok', data: new DataView(new ArrayBuffer(4)) });
      }
      if (setup.request === OP.GET_OPERATION_MODE) {
        return Promise.resolve({ status: 'ok', data: new DataView(new ArrayBuffer(2)) });
      }
      if (setup.request === OP.GET_FIRMWARE_INFO) {
        const build = new Uint8Array(36);
        build.set([4, 18, 2, 0], 0);
        return Promise.resolve({ status: 'ok', data: new DataView(build.buffer) });
      }
      if (setup.request === OP.GET_FEATURED_FIRMWARE_DATA) {
        windowsRead += 1;
        onWindowRead?.(windowsRead);
        const block = new Uint8Array(length).fill(0xa5);
        return Promise.resolve({ status: 'ok', data: new DataView(block.buffer) });
      }
      return Promise.resolve({ status: 'ok', data: new DataView(new ArrayBuffer(0)) });
    },
    controlTransferOut: () => Promise.resolve({ status: 'ok', bytesWritten: 2 }),
  };
}

/** The device's unlock flag for the test (TESTING.md 42.59); reset per test in `beforeEach`. */
let seat = new UnlockSeat();

function deviceHandle(camera: WebUsbDevice): DeviceHandle {
  return {
    device: null,
    description: 'Fake PIR324',
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

const failures: (OptionsFailure | null)[] = [];

function useHarness(
  camera: WebUsbDevice,
  overrides: Partial<typeof DEFAULT_OPTIONS_FORM> = {},
  profileId = 'modern-4x',
) {
  const runner = useRunner();
  const panel = useDumpPanel({
    id: 'dump',
    runner,
    device: deviceHandle(camera),
    /* One control-IN per window keeps the fake protocol chatter down. */
    form: { ...DEFAULT_OPTIONS_FORM, chunk: String(WINDOW_SIZE), ...overrides },
    profileId,
    dirPrefix: 'seek_flash4m_',
    sweepPrefix: 'seek_selectors_',
    onOptionsFailure: (failure) => failures.push(failure),
  });
  return { panel, runner };
}

beforeEach(() => {
  seat = new UnlockSeat();
  downloads.length = 0;
  failures.length = 0;
});

describe('useDumpPanel', () => {
  it('packages a finished dump into one archive with a manifest and a README', async () => {
    const camera = fakeCamera();
    const { result, unmount } = renderHook(() => useHarness(camera));

    await act(async () => {
      await result.current.panel.start('dump');
    });

    expect(downloads).toHaveLength(1);
    const archive = downloads[0];
    if (archive === undefined) throw new Error('no archive');
    expect(archive.dirName).toMatch(/^seek_flash4m_\d{4}-\d{2}-\d{2}T/);

    const names = archive.artifacts.map((file) => file.name);
    expect(names).toContain('manifest.json');
    expect(names).toContain('README.md');
    expect(names).toContain('flash_4m_usb_partial_gap_ff.bin');
    expect(names.filter((name) => name.startsWith('windows/')).length).toBeGreaterThan(50);

    const status = result.current.panel.reporter.progress.text;
    expect(status).toMatch(/^Done — \d+\/\d+ windows read\. Check your downloads\.$/);
    expect(status).not.toContain('(cancelled)');
    unmount();
  }, 30_000);

  it('still downloads what it read when the run is cancelled', async () => {
    let cancel: (() => void) | null = null;
    const camera = fakeCamera((count) => {
      /* Pull the plug a few windows in, the way the Cancel button does. */
      if (count === 3) cancel?.();
    });
    const { result, unmount } = renderHook(() => useHarness(camera));
    cancel = () => {
      result.current.panel.cancel();
    };

    await act(async () => {
      await result.current.panel.start('dump');
    });

    /* The archive is the point: a cancel is a partial capture, not a failure. */
    expect(downloads).toHaveLength(1);
    const archive = downloads[0];
    if (archive === undefined) throw new Error('no archive');
    const names = archive.artifacts.map((file) => file.name);
    expect(names).toContain('manifest.json');
    expect(names).toContain('flash_4m_usb_partial_gap_ff.bin');

    const manifest = archive.artifacts.find((file) => file.name === 'manifest.json');
    if (manifest === undefined) throw new Error('no manifest');
    const parsed = JSON.parse(new TextDecoder().decode(manifest.data)) as {
      cancelled: boolean;
      usbReadableWindows: number;
      expectedReadableWindows: number;
    };
    expect(parsed.cancelled).toBe(true);
    expect(parsed.usbReadableWindows).toBeLessThan(parsed.expectedReadableWindows);

    expect(result.current.panel.reporter.progress.text).toContain('(cancelled)');
    expect(result.current.panel.reporter.progress.text).toContain('Check your downloads.');
    unmount();
  }, 30_000);

  it('tells the user how to get the camera back when the claim fails', async () => {
    /* The browser's commonest failure, and the one whose remedy is off the
     * page entirely: a udev rule, Zadig, or quitting whatever holds it. */
    const camera = fakeCamera();
    const denied: WebUsbDevice = {
      ...camera,
      claimInterface: () => Promise.reject(new Error('Access denied.')),
    };
    const { result, unmount } = renderHook(() => useHarness(denied));

    await act(async () => {
      await result.current.panel.start('dump');
    });

    expect(downloads).toHaveLength(0);
    const lines = result.current.panel.reporter.lines;
    /* Which remedy is right depends on the machine, so compare against the
     * one this test run's own user agent earns. */
    expect(lines.map((line) => line.text)).toContain(permissionHint(navigator.userAgent));
    expect(lines.at(-1)?.level).toBe('warn');
    unmount();
  });

  it('rejects an out-of-range option with the original message and packages nothing', async () => {
    const camera = fakeCamera();
    const { result, unmount } = renderHook(() => useHarness(camera, { gapFill: '0x1ff' }));

    await act(async () => {
      await result.current.panel.start('dump');
    });

    expect(downloads).toHaveLength(0);
    expect(failures.at(-1)).toEqual({
      field: 'gapFill',
      message: 'gap-fill must be a single byte, got 0x1ff',
    });
    expect(result.current.panel.reporter.lines.map((line) => line.text)).toContain(
      'ERROR: gap-fill must be a single byte, got 0x1ff',
    );
    expect(result.current.panel.reporter.progress.text).toBe('Failed — see the log above.');
    unmount();
  });
});

/* ---- another tab, and a dump that missed windows ----------------------- */

/** `camera`, with every call that would reach the device recorded. */
function watched(camera: WebUsbDevice, sent: string[]): WebUsbDevice {
  return {
    ...camera,
    open: () => {
      sent.push('open');
      return camera.open();
    },
    claimInterface: (n) => {
      sent.push('claimInterface');
      return camera.claimInterface(n);
    },
    selectConfiguration: (value) => {
      sent.push('selectConfiguration');
      return camera.selectConfiguration(value);
    },
    controlTransferIn: (setup, length, timeoutMs) => {
      sent.push(`in ${hex(setup.request)}`);
      return camera.controlTransferIn(setup, length, timeoutMs);
    },
    controlTransferOut: (setup, data, timeoutMs) => {
      sent.push(`out ${hex(setup.request)}`);
      return camera.controlTransferOut(setup, data, timeoutMs);
    },
  };
}

describe('useDumpPanel and another tab', () => {
  afterEach(() => {
    removeLocks();
  });

  it('sends the camera nothing while another tab holds it, and says so calmly', async () => {
    const locks = installLocks();
    const sent: string[] = [];
    const { result, unmount } = renderHook(() => useHarness(watched(fakeCamera(), sent)));

    /* The other tab's dump, holding the camera lock until it finishes. */
    const otherTab = deferred();
    const other = withCameraLock(() => otherTab.promise);
    await vi.waitFor(() => {
      expect(locks.isHeld()).toBe(true);
    });

    await act(async () => {
      await result.current.panel.start('dump');
    });
    expect(sent).toEqual([]);
    expect(downloads).toHaveLength(0);
    expect(result.current.runner.busy).toBe(false);
    expect(result.current.panel.reporter.progress.text).toBe(IN_USE_ELSEWHERE_STATUS);
    const last = result.current.panel.reporter.lines.at(-1);
    expect(last?.text).toBe(IN_USE_ELSEWHERE_LOG);
    expect(last?.level).toBe('info');

    /* The other tab finishes; this one can now read. */
    otherTab.resolve();
    await other;
    await act(async () => {
      await result.current.panel.start('dump');
    });
    expect(sent[0]).toBe('open');
    expect(downloads).toHaveLength(1);
    expect(result.current.panel.reporter.progress.text).toMatch(/^Done — (\d+)\/\1 windows read\./);
    unmount();
  }, 30_000);
});

describe('a dump that read fewer windows than its plan', () => {
  it('ends "Done", with the archive, but says it is incomplete', async () => {
    /* The first few arms (the identity questions, then the first windows)
     * read; after them every read stalls. */
    const camera = fakeCamera();
    let arms = 0;
    const flaky: WebUsbDevice = {
      ...camera,
      controlTransferOut: (setup, data, timeoutMs) => {
        if (setup.request === OP.BEGIN_FIRMWARE_UPGRADE) arms += 1;
        return camera.controlTransferOut(setup, data, timeoutMs);
      },
      controlTransferIn: (setup, length, timeoutMs) =>
        setup.request === OP.GET_FEATURED_FIRMWARE_DATA && arms > 5
          ? Promise.resolve({ status: 'stall' })
          : camera.controlTransferIn(setup, length, timeoutMs),
    };
    const { result, unmount } = renderHook(() =>
      useHarness(flaky, { retries: '0', retryDelay: '0' }),
    );

    await act(async () => {
      await result.current.panel.start('dump');
    });

    expect(downloads).toHaveLength(1);
    const status = result.current.panel.reporter.progress.text;
    const counts =
      /^Done — (\d+)\/(\d+) windows read \(incomplete — see the log\)\. Check your downloads\.$/.exec(
        status,
      );
    expect(counts, status).not.toBeNull();
    expect(Number(counts?.[1])).toBeGreaterThan(0);
    expect(Number(counts?.[1])).toBeLessThan(Number(counts?.[2]));
    const warning = result.current.panel.reporter.lines.find((line) =>
      line.text.startsWith('incomplete: '),
    );
    expect(warning?.level).toBe('warn');
    expect(warning?.text).toContain('run the dump again');
    unmount();
  }, 30_000);
});

/* ---- the camera says which family it is ------------------------------- */

/** Only control INs of `SAFE_BEFORE_IDENTITY` went out, and never an arm. */
function expectOnlySafeReads(calls: readonly CameraCall[], what: string): void {
  expect(calls.length, `${what}: something was asked`).toBeGreaterThan(0);
  for (const call of calls) {
    const label = `${what}: ${call.dir.toUpperCase()} ${hex(call.request)}`;
    expect(call.dir, label).toBe('in');
    expect(SAFE_BEFORE_IDENTITY.has(call.request as Opcode), label).toBe(true);
  }
  expect(calls.some((call) => call.request === OP.BEGIN_FIRMWARE_UPGRADE)).toBe(false);
}

async function run(camera: WebUsbDevice, profileId = 'modern-4x', mode: DumpMode = 'dump') {
  const handle = renderHook(() => useHarness(camera, {}, profileId));
  await act(async () => {
    await handle.result.current.panel.start(mode);
  });
  return handle;
}

describe('useDumpPanel detects the camera instead of asking', () => {
  it('dumps a post-2018 camera under modern-4x, having asked it', async () => {
    const { camera, calls } = scriptedCamera({ version: [4, 18, 2, 0] });
    const { result, unmount } = await run(camera);

    expect(result.current.panel.refusal).toBeNull();
    const acting = result.current.panel.acting;
    expect(acting?.profile.id).toBe('modern-4x');
    expect(acting?.firmwareVersion).toBe('4.18.2.0');
    expect(acting?.detection.best.profile.id).toBe('modern-4x');

    /* The first request is the version read, and it is the only thing sent
     * before the camera named its build. */
    expect(calls[0]?.request).toBe(OP.GET_FIRMWARE_INFO);
    expect(calls[0]?.dir).toBe('in');
    /* The probe asked the channel question: a plain arm of subcommand 5. */
    expect(
      calls.some(
        (call) =>
          call.request === OP.BEGIN_FIRMWARE_UPGRADE && call.length === 2 && call.data?.[0] === 5,
      ),
    ).toBe(true);
    expect(downloads).toHaveLength(1);
    const lines = result.current.panel.reporter.lines.map((line) => line.text);
    expect(lines).toContain('asking the camera which firmware it runs ...');
    expect(lines.some((line) => line.startsWith("the camera's first answers point to "))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes('(modern-4x)'))).toBe(false);
    unmount();
  }, 30_000);

  it('says why, and reads nothing, when the camera does not report its version', async () => {
    const { camera, calls } = scriptedCamera({ version: null });
    const { result, unmount } = await run(camera);

    const refusal = result.current.panel.refusal;
    expect(refusal?.code).toBe('device/version-unknown');
    expect(refusal?.message).toContain('refusing to dump');
    expect(refusal?.message).toContain('did not report its firmware version');
    expect(refusal?.hint).toContain('let it finish starting up');
    expect(result.current.panel.acting).toBeNull();
    expect(result.current.panel.reporter.progress.text).toBe(
      'Refused — nothing was read. See the message above the log.',
    );
    expect(downloads).toHaveLength(0);
    expectOnlySafeReads(calls, 'dump of a versionless camera');
    unmount();
  });

  it('says why, and sends no arm, when the build predates the dump protocol', async () => {
    /* On 0.3.0.1 wire id 0x52 is EnterBootloaderMode. */
    const { camera, calls } = scriptedCamera({ version: [0, 3, 0, 1], legacy: true });
    const { result, unmount } = await run(camera);

    const refusal = result.current.panel.refusal;
    expect(refusal?.code).toBe('family/unsupported');
    expect(refusal?.message).toContain('firmware 0.3.0.1 predates the dump protocol');
    expect(refusal?.hint).toBe(FIRMWARE_TOO_OLD_HINT);
    expect(downloads).toHaveLength(0);
    /* The version read — two unarmed reads — and not one request after it. */
    /* Only version reads (the tab's own, then the identity's): nothing armed, no window read. */
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every((call) => call.request === OP.GET_FIRMWARE_INFO)).toBe(true);
    unmount();
  });

  it('refuses the sweep the same way', async () => {
    const { camera, calls } = scriptedCamera({ version: null });
    const { result, unmount } = await run(camera, 'modern-4x', 'sweep');
    expect(result.current.panel.refusal?.message).toContain('refusing to dump all selectors');
    expectOnlySafeReads(calls, 'sweep of a versionless camera');
    unmount();
  });
});

describe('the 4.x/Nano tab reads only its own family', () => {
  it('refuses a locked 2016 camera on its version, before any family question or window read', async () => {
    const { camera, calls } = scriptedCamera({ version: [1, 0, 3, 0], legacy: true });
    const { result, unmount } = await run(camera);

    const refusal = result.current.panel.refusal;
    expect(refusal?.code).toBe('family/unsupported');
    expect(refusal?.message).toContain('The camera runs 1.0.3.0, a 0.x or 1.x build');
    expect(refusal?.message).toContain('Dump & decrypt 0.x/1.x 2014/2016');
    expect(refusal?.message).toContain('Nothing was read but the version');
    expect(downloads).toHaveLength(0);
    /* The version read (two unarmed reads), and not one request after it: no probe, no arm, no window. */
    /* Only version reads (the tab's own, then the identity's): nothing armed, no window read. */
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every((call) => call.request === OP.GET_FIRMWARE_INFO)).toBe(true);
    unmount();
  }, 30_000);

  it('refuses the sweep the same way', async () => {
    const { camera, calls } = scriptedCamera({ version: [1, 0, 3, 0], legacy: true });
    const { result, unmount } = await run(camera, 'modern-4x', 'sweep');
    expect(result.current.panel.refusal?.code).toBe('family/unsupported');
    expect(result.current.panel.refusal?.message).toContain('The camera runs 1.0.3.0');
    expect(downloads).toHaveLength(0);
    /* Only version reads (the tab's own, then the identity's): nothing armed, no window read. */
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every((call) => call.request === OP.GET_FIRMWARE_INFO)).toBe(true);
    unmount();
  }, 30_000);

  it('cannot dump a camera that does not report its version', async () => {
    const { camera, calls } = scriptedCamera({ version: null });
    const { result, unmount } = await run(camera);
    expect(result.current.panel.refusal?.code).toBe('device/version-unknown');
    expect(downloads).toHaveLength(0);
    expectOnlySafeReads(calls, 'the 4.x/Nano tab on a versionless camera');
    unmount();
  });

  it('cannot send an arm to 0.3.0.1', async () => {
    const { camera, calls } = scriptedCamera({ version: [0, 3, 0, 1], legacy: true });
    const { result, unmount } = await run(camera);
    expect(result.current.panel.refusal?.code).toBe('family/unsupported');
    expect(result.current.panel.refusal?.message).toContain('predates');
    /* Only version reads (the tab's own, then the identity's): nothing armed, no window read. */
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every((call) => call.request === OP.GET_FIRMWARE_INFO)).toBe(true);
    unmount();
  });
});

describe('useDumpPanel: the unlock note (information only)', () => {
  it('is shown after a dump whose identify probe sent the unlock token, and the dump still packages', async () => {
    /* The probe's authenticated arm (18 bytes) is accepted by this fake, so the
     * camera is unlocked by the run and the page says so after it. */
    const { camera, calls } = scriptedCamera({ version: [4, 18, 2, 0] });
    const { result, unmount } = await run(camera);

    expect(
      calls.some((call) => call.request === OP.BEGIN_FIRMWARE_UPGRADE && call.length === 18),
    ).toBe(true);
    expect(result.current.panel.unlockNote).toBe(true);
    /* Information only: the run was not refused and its archive was packaged. */
    expect(result.current.panel.refusal).toBeNull();
    expect(downloads).toHaveLength(1);
    unmount();
  }, 30_000);

  it('is not shown when the run was refused before the identify probe sent anything', async () => {
    const { camera, calls } = scriptedCamera({ version: [0, 3, 0, 1], legacy: true });
    const { result, unmount } = await run(camera);

    expect(result.current.panel.refusal?.code).toBe('family/unsupported');
    expect(calls.some((call) => call.request === OP.BEGIN_FIRMWARE_UPGRADE)).toBe(false);
    expect(result.current.panel.unlockNote).toBe(false);
    unmount();
  });

  it('is the device’s flag: a generation change alone keeps it, and a swap clears it', async () => {
    const { camera } = scriptedCamera({ version: [4, 18, 2, 0] });
    const generation = { value: 1 };
    const { result, rerender, unmount } = renderHook(() => {
      const runner = useRunner();
      const device: DeviceHandle = { ...deviceHandle(camera), generation: generation.value };
      const panel = useDumpPanel({
        id: 'dump',
        runner,
        device,
        form: { ...DEFAULT_OPTIONS_FORM, chunk: String(WINDOW_SIZE) },
        profileId: 'modern-4x',
        dirPrefix: 'seek_flash4m_',
        sweepPrefix: 'seek_selectors_',
        onOptionsFailure: (failure) => failures.push(failure),
      });
      return { panel };
    });

    await act(async () => {
      await result.current.panel.start('dump');
    });
    expect(result.current.panel.unlockNote).toBe(true);

    /* A new device object with no swap: the device's seat keeps its flag. */
    generation.value = 2;
    rerender();
    expect(result.current.panel.unlockNote).toBe(true);

    /* A swap: the seat clears, and the new camera shows no note. */
    seat.changed();
    generation.value = 3;
    rerender();
    expect(result.current.panel.unlockNote).toBe(false);
    unmount();
  }, 30_000);
});
