/**
 * The slot page's state machine, against a fake backend.
 *
 * What is pinned here: a build the plan does not support is never read; a
 * report belongs to one camera; a bank the camera boots, and recovery, are not
 * written without the acknowledgement; a commit drops the read it was made
 * from; and the file names a dump is saved under. No camera is touched: the
 * backend answers every question, and the transport is never opened on a real
 * device.
 */

import { act } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import {
  SeekError,
  WebUsbTransport,
  type DeviceState,
  type DumpedSlot,
  type FlashSlotResult,
  type SlotFlashPlan,
  type SlotInputKind,
  type SlotKey,
  type SlotPlan,
  type SlotView,
  type SlotsReport,
} from '@seek-fw/core';
import { downloadBytes } from '../lib/download';
import { DEFAULT_OPTIONS_FORM } from '../lib/options';
import type { ActingProfile } from '../lib/identify';
import {
  actingProfile,
  dumpedSlot,
  flashedSlot,
  preparedSlot,
  slotEntry,
  slotPlan,
  slotReport,
  slotView,
} from '../test-slots';
import { fakeCamera, fakeDeviceState } from '../test-fixtures';
import { renderHook } from '../test-helpers';
import type { DeviceHandle } from './useDevice';
import {
  needsRiskAck,
  slotActionGate,
  slotDumpFileName,
  useSlotsPanel,
  writeRisk,
  type SlotsBackend,
} from './useSlotsPanel';
import { useRunner } from './useRunner';
import { keyPairToName } from './useSlotsPanel';

vi.mock('../lib/download', () => ({
  downloadBytes: vi.fn(),
}));

let base: DeviceState;

beforeAll(async () => {
  base = await fakeDeviceState();
});

beforeEach(() => {
  vi.mocked(downloadBytes).mockReset();
});

/* ---- the fake backend ------------------------------------------------ */

interface Mocks {
  identify: Mock;
  plan: Mock;
  inspect: Mock;
  dump: Mock;
  prepare: Mock;
  flash: Mock;
}

function makeBackend(
  options: { supported?: boolean; report?: SlotsReport; identify?: Mock } = {},
): { backend: SlotsBackend; mocks: Mocks } {
  const report = options.report ?? slotReport(base);
  const mocks: Mocks = {
    identify: options.identify ?? vi.fn(() => Promise.resolve(actingProfile())),
    plan: vi.fn(() => slotPlan(options.supported ?? true)),
    inspect: vi.fn(() => Promise.resolve(report)),
    dump: vi.fn((_ctx: unknown, _report: unknown, key: SlotKey) =>
      Promise.resolve(dumpedSlot(key)),
    ),
    prepare: vi.fn(
      (_report: unknown, key: SlotKey, input: { kind: SlotInputKind; bytes: Uint8Array }) =>
        preparedSlot(key, input.kind, input.bytes),
    ),
    flash: vi.fn((_ctx: unknown, _report: unknown, plan: SlotFlashPlan) =>
      Promise.resolve(flashedSlot(plan.key)),
    ),
  };
  const backend: SlotsBackend = {
    identify: (device, log) => mocks.identify(device, log) as Promise<ActingProfile>,
    plan: (profile, version) => mocks.plan(profile, version) as SlotPlan,
    inspect: (ctx) => mocks.inspect(ctx) as Promise<SlotsReport>,
    dump: (ctx, report, key) => mocks.dump(ctx, report, key) as Promise<DumpedSlot>,
    prepare: (report, key, input) => mocks.prepare(report, key, input) as SlotFlashPlan,
    flash: (ctx, report, plan, opts) =>
      mocks.flash(ctx, report, plan, opts) as Promise<FlashSlotResult>,
  };
  return { backend, mocks };
}

function deviceHandle(generation: number): DeviceHandle {
  const camera = fakeCamera();
  return {
    device: null,
    description: 'Fake PIR324',
    generation,
    canForgetDevice: false,
    connect: () => Promise.resolve({ kind: 'cancelled' }),
    forget: () => Promise.resolve({ kind: 'cancelled' }),
    makeTransport: () => new WebUsbTransport(camera, { recipient: 'interface' }),
    reattach: () => Promise.resolve(false),
  };
}

function setup(backend: SlotsBackend) {
  const state = { generation: 1 };
  const handle = renderHook(() => {
    const runner = useRunner();
    const panel = useSlotsPanel({
      runner,
      device: deviceHandle(state.generation),
      form: DEFAULT_OPTIONS_FORM,
      onOptionsFailure: () => undefined,
      backend,
    });
    return { panel, runner };
  });
  return { ...handle, state };
}

function file(name: string, bytes: Uint8Array): File {
  return new File([bytes as BlobPart], name, { type: 'application/octet-stream' });
}

function lineIncludes(lines: readonly { readonly text: string }[], text: string): boolean {
  return lines.some((line) => line.text.includes(text));
}

/* ---- the hook -------------------------------------------------------- */

describe('useSlotsPanel: reading the banks', () => {
  it('asks the camera which build it runs, then reads the three banks', async () => {
    const { backend, mocks } = makeBackend();
    const { result, unmount } = setup(backend);

    await act(async () => {
      await result.current.panel.readSlots();
    });

    expect(mocks.identify).toHaveBeenCalledTimes(1);
    expect(mocks.plan).toHaveBeenCalledWith(actingProfile().profile, '0.8.0.0');
    expect(mocks.inspect).toHaveBeenCalledTimes(1);
    expect(result.current.panel.plan?.supportedBuild.supported).toBe(true);
    expect(result.current.panel.report?.slots.map((slot) => slot.entry.key)).toEqual([
      'a',
      'b',
      'r',
    ]);
    unmount();
  });

  it('never reads the banks of a build the plan does not support, and says why', async () => {
    const { backend, mocks } = makeBackend({ supported: false });
    const { result, unmount } = setup(backend);

    await act(async () => {
      await result.current.panel.readSlots();
    });

    expect(mocks.inspect).not.toHaveBeenCalled();
    expect(result.current.panel.report).toBeNull();
    expect(result.current.panel.plan?.supportedBuild.supported).toBe(false);
    expect(lineIncludes(result.current.panel.reporter.lines, 'predates the slot workflows')).toBe(
      true,
    );
    unmount();
  });

  it('shows the refusal and reads nothing when the camera will not name its build', async () => {
    const { backend, mocks } = makeBackend({
      identify: vi.fn(() =>
        Promise.reject(
          new SeekError('device/version-unknown', 'the camera did not report its firmware version'),
        ),
      ),
    });
    const { result, unmount } = setup(backend);

    await act(async () => {
      await result.current.panel.readSlots();
    });

    expect(result.current.panel.refusal?.code).toBe('device/version-unknown');
    expect(result.current.panel.plan).toBeNull();
    expect(mocks.inspect).not.toHaveBeenCalled();
    unmount();
  });

  it('drops the read and the plan when the camera changes', async () => {
    const { backend } = makeBackend();
    const { result, rerender, state, unmount } = setup(backend);

    await act(async () => {
      await result.current.panel.readSlots();
    });
    expect(result.current.panel.report).not.toBeNull();

    act(() => {
      state.generation = 2;
      rerender();
    });

    expect(result.current.panel.report).toBeNull();
    expect(result.current.panel.plan).toBeNull();
    expect(result.current.panel.reporter.progress.text).toContain('read the slots again');
    unmount();
  });
});

describe('useSlotsPanel: dumping a bank', () => {
  it('saves the raw bank and the decrypted image, named by slot, version and short hash', async () => {
    const { backend, mocks } = makeBackend();
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });

    await act(async () => {
      await result.current.panel.dump('a');
    });

    expect(mocks.dump).toHaveBeenCalledTimes(1);
    expect(mocks.dump.mock.calls[0]?.[2]).toBe('a');
    expect(downloadBytes).toHaveBeenCalledTimes(2);
    const names = vi.mocked(downloadBytes).mock.calls.map((call) => call[1]);
    expect(names).toEqual([
      'seek-slot-A-v4.9.1.5-raw-abababab.bin',
      'seek-slot-A-v4.9.1.5-decrypted-cdcdcdcd.bin',
    ]);
    unmount();
  });

  it('does not dump before the banks were read', async () => {
    const { backend, mocks } = makeBackend();
    const { result, unmount } = setup(backend);

    await act(async () => {
      await result.current.panel.dump('b');
    });

    expect(mocks.dump).not.toHaveBeenCalled();
    expect(downloadBytes).not.toHaveBeenCalled();
    expect(lineIncludes(result.current.panel.reporter.lines, 'read the slots first')).toBe(true);
    unmount();
  });
});

describe('useSlotsPanel: writing a bank', () => {
  it('prepares a file without sending anything, and writes it only after the confirmation', async () => {
    const { backend, mocks } = makeBackend();
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });

    await act(async () => {
      await result.current.panel.pickFile('b', 'plain', file('fw.bin', new Uint8Array(16)));
    });

    expect(mocks.prepare).toHaveBeenCalledTimes(1);
    expect(result.current.panel.pending?.key).toBe('b');
    expect(result.current.panel.pending?.kind).toBe('plain');
    expect(mocks.flash).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.panel.write(false);
    });

    expect(mocks.flash).toHaveBeenCalledTimes(1);
    expect(mocks.flash.mock.calls[0]?.[3]).toEqual({ verify: true, acknowledgeRisk: false });
    expect(result.current.panel.outcome?.result.verified).toBe(true);
    expect(result.current.panel.pending).toBeNull();
    /* The bank has changed, so the read it came from is no longer true. */
    expect(result.current.panel.report).toBeNull();
    expect(
      lineIncludes(result.current.panel.reporter.lines, 'NOW UNPLUG AND REPLUG THE CAMERA.'),
    ).toBe(true);
    unmount();
  });

  it('refuses to write the booted bank without the acknowledgement, and writes it with one', async () => {
    const { backend, mocks } = makeBackend();
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.pickFile('a', 'plain', file('fw.bin', new Uint8Array(16)));
    });

    await act(async () => {
      await result.current.panel.write(false);
    });
    expect(mocks.flash).not.toHaveBeenCalled();
    expect(lineIncludes(result.current.panel.reporter.lines, 'risk acknowledgement')).toBe(true);
    /* Nothing was sent, so the prepared write is still there to be confirmed. */
    expect(result.current.panel.pending?.key).toBe('a');

    await act(async () => {
      await result.current.panel.write(true);
    });
    expect(mocks.flash).toHaveBeenCalledTimes(1);
    expect(mocks.flash.mock.calls[0]?.[3]).toEqual({ verify: true, acknowledgeRisk: true });
    unmount();
  });

  it('asks the same acknowledgement for recovery', async () => {
    const { backend, mocks } = makeBackend();
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.pickFile('r', 'raw', file('raw.bin', new Uint8Array(16)));
    });

    await act(async () => {
      await result.current.panel.write(false);
    });
    expect(mocks.flash).not.toHaveBeenCalled();
    unmount();
  });

  it('drops a prepared write when the camera changes, so it cannot reach another unit', async () => {
    const { backend, mocks } = makeBackend();
    const { result, rerender, state, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.pickFile('b', 'plain', file('fw.bin', new Uint8Array(16)));
    });
    expect(result.current.panel.pending).not.toBeNull();

    act(() => {
      state.generation = 2;
      rerender();
    });
    expect(result.current.panel.pending).toBeNull();

    await act(async () => {
      await result.current.panel.write(false);
    });
    expect(mocks.flash).not.toHaveBeenCalled();
    unmount();
  });

  it('will not prepare a write to a bank the camera did not read', async () => {
    const { backend, mocks } = makeBackend({ report: slotReport(base, 'r') });
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });

    await act(async () => {
      await result.current.panel.pickFile('r', 'raw', file('raw.bin', new Uint8Array(16)));
    });

    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(result.current.panel.pending).toBeNull();
    unmount();
  });

  it('drops the read even when the commit fails, because the bank may already have changed', async () => {
    const { backend, mocks } = makeBackend();
    mocks.flash.mockImplementation(() =>
      Promise.reject(new SeekError('slots/refused', 'the commit was refused')),
    );
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.pickFile('b', 'plain', file('fw.bin', new Uint8Array(16)));
    });

    await act(async () => {
      await result.current.panel.write(false);
    });

    expect(mocks.flash).toHaveBeenCalledTimes(1);
    expect(result.current.panel.report).toBeNull();
    expect(result.current.panel.outcome).toBeNull();
    unmount();
  });
});

describe('slot helpers', () => {
  it('derives the risk of a write from the active bank and from recovery', () => {
    const report = slotReport(base);
    expect(writeRisk(report, 'a')).toEqual({ booted: true, recovery: false });
    expect(writeRisk(report, 'b')).toEqual({ booted: false, recovery: false });
    expect(writeRisk(report, 'r')).toEqual({ booted: false, recovery: true });
    expect(needsRiskAck(writeRisk(report, 'b'))).toBe(false);
    expect(needsRiskAck(writeRisk(report, 'a'))).toBe(true);
  });

  it('names a dump by slot, version and a short hash, with the version made file-safe', () => {
    expect(slotDumpFileName('a', '4.9.1.5', 'raw', 'ab'.repeat(32))).toBe(
      'seek-slot-A-v4.9.1.5-raw-abababab.bin',
    );
    expect(slotDumpFileName('r', '1.2.3.4/x y', 'decrypted', '0f'.repeat(32))).toBe(
      'seek-slot-R-v1.2.3.4-x-y-decrypted-0f0f0f0f.bin',
    );
    expect(slotDumpFileName('b', null, 'raw', '12345678aa')).toBe(
      'seek-slot-B-vunknown-raw-12345678.bin',
    );
  });

  it('ends a decrypted dump with its key pair, so the flash path can read the keys back', () => {
    const keyA = new Uint8Array(16).fill(0x11);
    const keyB = new Uint8Array(16).fill(0x22);
    expect(slotDumpFileName('a', '4.8.2.1', 'decrypted', 'ab'.repeat(32), { keyA, keyB })).toBe(
      `seek-slot-A-v4.8.2.1-decrypted-abababab-KeyA-${'11'.repeat(16)}-KeyB-${'22'.repeat(16)}.bin`,
    );
    /* A raw bank never carries a pair: its bytes are not decrypted. */
    expect(slotDumpFileName('a', '4.8.2.1', 'raw', 'ab'.repeat(32), { keyA, keyB })).toBe(
      `seek-slot-A-v4.8.2.1-raw-abababab-KeyA-${'11'.repeat(16)}-KeyB-${'22'.repeat(16)}.bin`,
    );
  });

  it('names a decrypted dump with the camera key pair only when the image holds both keys', () => {
    const keyA = new Uint8Array(16).fill(0x11);
    const keyB = new Uint8Array(16).fill(0x22);
    const table = { keyA, keyB, offset: 0, matchA: true, matchB: true };
    const withKeys = new Uint8Array(256);
    withKeys.set(keyA, 32);
    withKeys.set(keyB, 96);
    expect(keyPairToName(withKeys, table)).toMatchObject({ keyA, keyB });
    /* A key missing from the image is not claimed: the name stays bare. */
    const without = new Uint8Array(256);
    without.set(keyA, 32);
    expect(keyPairToName(without, table)).toBeNull();
    /* No camera table at all: nothing to claim. */
    expect(keyPairToName(withKeys, null)).toBeNull();
  });

  it('explains every disabled action in words, and the support comes first', () => {
    const view: SlotView = slotView(base, 'b');
    const gate = (
      overrides: Partial<Parameters<typeof slotActionGate>[0]> = {},
    ): ReturnType<typeof slotActionGate> =>
      slotActionGate({
        entry: slotEntry('b'),
        view,
        action: 'flash-plain',
        connected: true,
        busy: false,
        ...overrides,
      });

    expect(gate()).toEqual({ enabled: true, reason: null });
    expect(gate({ connected: false }).reason).toBe('Connect the camera first.');
    expect(gate({ busy: true }).reason).toContain('Another operation');
    expect(gate({ view: null }).reason).toBe('Read the slots first.');
    const unread = slotView(base, 'b', { state: null, unreadReason: 'no window' });
    expect(gate({ view: unread }).reason).toContain('Not read: no window');
    /* Dumping an unread bank is still a read, so it stays allowed. */
    expect(gate({ action: 'dump', view: unread }).enabled).toBe(true);
    expect(
      slotActionGate({
        entry: slotEntry('b', {
          flashRaw: { supported: false, reason: 'raw staging is not offered on this build' },
        }),
        view,
        action: 'flash-raw',
        connected: false,
        busy: true,
      }),
    ).toEqual({ enabled: false, reason: 'raw staging is not offered on this build' });
  });
});
