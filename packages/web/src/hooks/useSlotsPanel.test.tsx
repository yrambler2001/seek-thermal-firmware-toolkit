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
import type { FpsPatchResult, FpsPlan, FpsPreDump } from '@seek-fw/core';
import { downloadBytes } from '../lib/download';
import { DEFAULT_OPTIONS_FORM } from '../lib/options';
import type { ActingProfile } from '../lib/identify';
import {
  SLOT_PLAIN,
  actingProfile,
  dumpedEmptySlot,
  dumpedSlot,
  emptySlotView,
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
  bankImageSource,
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
    inspect: (ctx, firmware) => mocks.inspect(ctx, firmware) as Promise<SlotsReport>,
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
    /* The build identify read is handed to the reader, so it is not asked for again. */
    expect(mocks.inspect).toHaveBeenCalledWith(expect.anything(), { version: '0.8.0.0' });
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
    /* The banks are read again after the write, so the table is not left empty. */
    expect(result.current.panel.report).not.toBeNull();
    expect(mocks.inspect).toHaveBeenCalledTimes(2);
    expect(
      lineIncludes(result.current.panel.reporter.lines, 'NOW UNPLUG AND REPLUG THE CAMERA.'),
    ).toBe(true);
    unmount();
  });

  it('after a successful write the table shows the banks read again, not the read from before', async () => {
    const { backend, mocks } = makeBackend();
    const before = slotReport(base);
    const after = slotReport(base);
    mocks.inspect
      .mockImplementationOnce(() => Promise.resolve(before))
      .mockImplementationOnce(() => Promise.resolve(after));
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    expect(result.current.panel.report).toBe(before);
    await act(async () => {
      await result.current.panel.pickFile('b', 'plain', file('fw.bin', new Uint8Array(16)));
    });

    await act(async () => {
      await result.current.panel.write(false);
    });

    expect(mocks.flash).toHaveBeenCalledTimes(1);
    /* The re-read takes no identify probe (the probe arms windows): only Read slots asked the camera. */
    expect(mocks.identify).toHaveBeenCalledTimes(1);
    expect(mocks.inspect).toHaveBeenLastCalledWith(expect.anything(), {
      version: before.state.version,
    });
    expect(result.current.panel.report).toBe(after);
    expect(result.current.panel.outcome?.result.verified).toBe(true);
    expect(
      lineIncludes(result.current.panel.reporter.lines, 'banks read again after the write'),
    ).toBe(true);
    expect(result.current.panel.reporter.progress.text).toContain('Unplug and replug');
    unmount();
  });

  it('after a write that does not read back as written, the table shows the bank as the camera holds it, and says so', async () => {
    const { backend, mocks } = makeBackend();
    mocks.flash.mockImplementation((_ctx: unknown, _report: unknown, plan: SlotFlashPlan) =>
      Promise.resolve(flashedSlot(plan.key, false)),
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

    expect(result.current.panel.outcome?.result.verified).toBe(false);
    expect(result.current.panel.report).not.toBeNull();
    expect(result.current.panel.reporter.progress.text).toContain('does not match');
    unmount();
  });

  it('when the read after a successful write fails, the outcome stays and no bank is shown as read', async () => {
    const { backend, mocks } = makeBackend();
    mocks.inspect
      .mockImplementationOnce(() => Promise.resolve(slotReport(base)))
      .mockImplementationOnce(() =>
        Promise.reject(new SeekError('slots/refused', 'the camera stopped answering')),
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

    expect(result.current.panel.outcome?.result.verified).toBe(true);
    expect(result.current.panel.report).toBeNull();
    expect(result.current.panel.pending).toBeNull();
    expect(
      lineIncludes(
        result.current.panel.reporter.lines,
        'the banks were not read again after the write',
      ),
    ).toBe(true);
    expect(result.current.panel.reporter.progress.text).toContain('Unplug and replug');
    unmount();
  });

  it('a write refused before anything is sent keeps the read it was made from', async () => {
    const { backend, mocks } = makeBackend();
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    const read = result.current.panel.report;
    await act(async () => {
      await result.current.panel.pickFile('a', 'plain', file('fw.bin', new Uint8Array(16)));
    });

    await act(async () => {
      await result.current.panel.write(false);
    });

    expect(mocks.flash).not.toHaveBeenCalled();
    expect(result.current.panel.report).toBe(read);
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

  it('prepares the 1.3.0.8 FF image for recovery, asks for the acknowledgement, and writes it with one', async () => {
    const { backend, mocks } = makeBackend();
    /* The core builds this plan for the FF image: the vendor staging, the Key B image stored. */
    mocks.prepare.mockImplementation((_report: unknown, key: SlotKey) => ({
      ...preparedSlot(key, 'plain', new Uint8Array(16)),
      staging: 'key-a-keystream',
      storedForm: 'key-b-ciphertext',
      expectedStored: new Uint8Array(0x10000),
    }));
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.pickFile('r', 'plain', file('ff.bin', new Uint8Array(16)));
    });
    expect(result.current.panel.pending?.key).toBe('r');
    expect(result.current.panel.pending?.plan.staging).toBe('key-a-keystream');
    expect(lineIncludes(result.current.panel.reporter.lines, 'staging key-a-keystream')).toBe(
      false,
    );

    await act(async () => {
      await result.current.panel.write(false);
    });
    expect(mocks.flash).not.toHaveBeenCalled();
    expect(lineIncludes(result.current.panel.reporter.lines, 'risk acknowledgement')).toBe(true);

    await act(async () => {
      await result.current.panel.write(true);
    });
    expect(mocks.flash).toHaveBeenCalledTimes(1);
    expect(mocks.flash.mock.calls[0]?.[3]).toEqual({ verify: true, acknowledgeRisk: true });
    expect(lineIncludes(result.current.panel.reporter.lines, 'staging key-a-keystream')).toBe(true);
    unmount();
  });

  it('shows the core refusal of the FF image for bank A and prepares nothing', async () => {
    const { backend, mocks } = makeBackend();
    mocks.prepare.mockImplementation(() => {
      throw new SeekError(
        'slots/refused',
        'this is the 1.3.0.8 FF (16 Hz) image: it can be written to R only, not to bank A. Nothing was written.',
      );
    });
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.pickFile('a', 'plain', file('ff.bin', new Uint8Array(16)));
    });
    expect(result.current.panel.pending).toBeNull();
    expect(
      lineIncludes(
        result.current.panel.reporter.lines,
        'cannot use this file: this is the 1.3.0.8 FF',
      ),
    ).toBe(true);
    expect(lineIncludes(result.current.panel.reporter.lines, 'R only, not to bank A')).toBe(true);
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
    expect(writeRisk(report, 'a')).toEqual({ booted: true, recovery: false, bootUnnamed: false });
    expect(writeRisk(report, 'b')).toEqual({ booted: false, recovery: false, bootUnnamed: false });
    expect(writeRisk(report, 'r')).toEqual({ booted: false, recovery: true, bootUnnamed: false });
    expect(needsRiskAck(writeRisk(report, 'b'))).toBe(false);
    expect(needsRiskAck(writeRisk(report, 'a'))).toBe(true);
  });

  it('asks for the acknowledgement on every bank when the camera names no booted bank', () => {
    /* The core refuses such a write without acknowledgeRisk (write.ts ackNeeded), so the
     * page must offer the tick for each bank, not only the one it would call booted. */
    const report = slotReport({ ...base, boot: null });
    for (const key of ['a', 'b', 'r'] as const) {
      const risk = writeRisk(report, key);
      expect(risk.bootUnnamed).toBe(true);
      expect(needsRiskAck(risk)).toBe(true);
    }
    expect(writeRisk(report, 'b')).toEqual({ booted: false, recovery: false, bootUnnamed: true });
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

/* ==================================================================== *
 * An empty bank
 * ==================================================================== */

/** A backend whose prepare says the target was empty, as core's does for an erased bank. */
function emptyBackend(report: SlotsReport): ReturnType<typeof makeBackend> {
  const made = makeBackend({ report });
  made.mocks.prepare.mockImplementation(
    (_report: unknown, key: SlotKey, input: { kind: SlotInputKind; bytes: Uint8Array }) =>
      preparedSlot(key, input.kind, input.bytes, true),
  );
  made.mocks.dump.mockImplementation((_ctx: unknown, _report: unknown, key: SlotKey) =>
    Promise.resolve(
      report.slots.find((v) => v.entry.key === key)?.content === 'empty'
        ? dumpedEmptySlot(key)
        : dumpedSlot(key),
    ),
  );
  return made;
}

describe('useSlotsPanel: dumping an empty bank', () => {
  it('saves the raw 64 KiB of 0xFF under a name that says empty, and no decrypted file', async () => {
    const { backend, mocks } = emptyBackend(slotReport(base, null, ['b']));
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });

    await act(async () => {
      await result.current.panel.dump('b');
    });

    expect(mocks.dump).toHaveBeenCalledTimes(1);
    expect(downloadBytes).toHaveBeenCalledTimes(1);
    const [bytes, name] = vi.mocked(downloadBytes).mock.calls[0] ?? [];
    expect(name).toBe('seek-slot-B-empty-raw-ffffffff.bin');
    expect(bytes).toHaveLength(0x10000);
    const lines = result.current.panel.reporter.lines;
    expect(lineIncludes(lines, 'slot B is empty — nothing to decrypt')).toBe(true);
    expect(lineIncludes(lines, 'no decrypted image')).toBe(false);
    expect(lineIncludes(lines, 'no key this page recovered')).toBe(false);
    unmount();
  });

  it('still saves both files for a bank that holds an image', async () => {
    const { backend } = emptyBackend(slotReport(base, null, ['b']));
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });

    await act(async () => {
      await result.current.panel.dump('a');
    });
    expect(downloadBytes).toHaveBeenCalledTimes(2);
    unmount();
  });
});

describe('useSlotsPanel: filling an empty bank with the booted bank’s image', () => {
  it('prepares bank A’s decrypted image into the empty B, says where it came from, and sends nothing', async () => {
    const report = slotReport(base, null, ['b']);
    const { backend, mocks } = emptyBackend(report);
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });

    await act(async () => {
      await result.current.panel.fillWithBankImage('b');
    });

    expect(mocks.prepare).toHaveBeenCalledTimes(1);
    const [, key, input] = mocks.prepare.mock.calls[0] as [
      unknown,
      SlotKey,
      { kind: SlotInputKind; bytes: Uint8Array; fileName: string },
    ];
    expect(key).toBe('b');
    expect(input.kind).toBe('plain');
    /* The bytes are bank A's decrypted image from the read already made. */
    expect(input.bytes).toBe(SLOT_PLAIN);
    expect(input.fileName).toMatch(/^seek-slot-A-v4\.9\.1\.5-decrypted-eeeeeeee.*\.bin$/);
    const pending = result.current.panel.pending;
    expect(pending?.key).toBe('b');
    expect(pending?.kind).toBe('plain');
    expect(pending?.source).toBe('slot A, the bank the camera boots now (4.9.1.5)');
    expect(pending?.plan.targetEmpty).toBe(true);
    expect(mocks.flash).not.toHaveBeenCalled();
    expect(mocks.dump).not.toHaveBeenCalled();
    expect(lineIncludes(result.current.panel.reporter.lines, 'image taken from slot A')).toBe(true);
    unmount();
  });

  it('writes it after the confirmation like any file, and the outcome says the bank was empty', async () => {
    const { backend, mocks } = emptyBackend(slotReport(base, null, ['b']));
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.fillWithBankImage('b');
    });

    await act(async () => {
      await result.current.panel.write(false);
    });

    expect(mocks.flash).toHaveBeenCalledTimes(1);
    expect(mocks.flash.mock.calls[0]?.[3]).toEqual({ verify: true, acknowledgeRisk: false });
    expect(result.current.panel.outcome).toMatchObject({ key: 'b', targetEmpty: true });
    expect(
      lineIncludes(result.current.panel.reporter.lines, '(an empty bank: nothing is overwritten)'),
    ).toBe(true);
    unmount();
  });

  it('keeps the acknowledgement rule: with no booted bank named, the write is refused without the tick', async () => {
    const report = slotReport({ ...base, boot: null }, null, ['b']);
    const { backend, mocks } = emptyBackend(report);
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.fillWithBankImage('b');
    });

    await act(async () => {
      await result.current.panel.write(false);
    });
    expect(mocks.flash).not.toHaveBeenCalled();
    expect(lineIncludes(result.current.panel.reporter.lines, 'risk acknowledgement')).toBe(true);

    await act(async () => {
      await result.current.panel.write(true);
    });
    expect(mocks.flash).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('refuses a bank that is not empty, and prepares nothing', async () => {
    const { backend, mocks } = emptyBackend(slotReport(base, null, ['b']));
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });

    await act(async () => {
      await result.current.panel.fillWithBankImage('r');
    });

    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(result.current.panel.pending).toBeNull();
    expect(lineIncludes(result.current.panel.reporter.lines, 'is not empty')).toBe(true);
    unmount();
  });

  it('says so when no other bank holds a decrypted image, and prepares nothing', async () => {
    const { backend, mocks } = emptyBackend(slotReport(base, null, ['a', 'b', 'r']));
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });

    await act(async () => {
      await result.current.panel.fillWithBankImage('b');
    });

    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(
      lineIncludes(
        result.current.panel.reporter.lines,
        'no other bank holds a decrypted image to copy',
      ),
    ).toBe(true);
    unmount();
  });

  it('does nothing before the banks were read', async () => {
    const { backend, mocks } = emptyBackend(slotReport(base, null, ['b']));
    const { result, unmount } = setup(backend);

    await act(async () => {
      await result.current.panel.fillWithBankImage('b');
    });

    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(lineIncludes(result.current.panel.reporter.lines, 'read the slots first')).toBe(true);
    unmount();
  });

  it('shows core’s own refusal when the image cannot be written (nothing hidden behind the button)', async () => {
    const { backend, mocks } = emptyBackend(slotReport(base, null, ['b']));
    mocks.prepare.mockImplementation(() => {
      throw new SeekError('slots/refused', 'this is the 16 Hz FF image (word sum 0xFFFF)');
    });
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });

    await act(async () => {
      await result.current.panel.fillWithBankImage('b');
    });

    expect(result.current.panel.pending).toBeNull();
    expect(lineIncludes(result.current.panel.reporter.lines, '16 Hz FF image')).toBe(true);
    unmount();
  });
});

describe('bankImageSource', () => {
  const holdsKeys = (): { plain: Uint8Array; table: { keyA: Uint8Array; keyB: Uint8Array } } => {
    const keyA = new Uint8Array(16).fill(0x11);
    const keyB = new Uint8Array(16).fill(0x22);
    const plain = new Uint8Array(256).fill(0x5a);
    plain.set(keyA, 32);
    plain.set(keyB, 96);
    return { plain, table: { keyA, keyB } };
  };

  it('prefers the bank the camera boots, never the target, and says it is booted', () => {
    const report = slotReport(base, null, ['b']);
    const source = bankImageSource(report, 'b');
    expect(source).toMatchObject({ key: 'a', name: 'slot A', version: '4.9.1.5', booted: true });
    expect(source?.bytes).toBe(SLOT_PLAIN);
    expect(source?.fileName).toBe('seek-slot-A-v4.9.1.5-decrypted-eeeeeeee.bin');
    /* The target is never its own source. */
    expect(bankImageSource(report, 'a')?.key).not.toBe('a');
  });

  it('falls back to a bank the bootloader can key, then to any bank holding an image', () => {
    const report = slotReport({ ...base, boot: null }, null, ['b']);
    const unnamed: SlotsReport = {
      ...report,
      slots: report.slots.map((candidate) => ({ ...candidate, active: false })),
    };
    const first = bankImageSource(unnamed, 'b');
    expect(first).toMatchObject({ key: 'a', booted: false });

    const notBootable: SlotsReport = {
      ...unnamed,
      slots: unnamed.slots.map((candidate) =>
        candidate.entry.key === 'r' && candidate.state !== null
          ? { ...candidate, state: { ...candidate.state, bootable: true } }
          : candidate.entry.key === 'a' && candidate.state !== null
            ? { ...candidate, state: { ...candidate.state, bootable: false } }
            : candidate,
      ),
    };
    expect(bankImageSource(notBootable, 'b')?.key).toBe('r');
    const noneBootable: SlotsReport = {
      ...notBootable,
      slots: notBootable.slots.map((candidate) =>
        candidate.state === null
          ? candidate
          : { ...candidate, state: { ...candidate.state, bootable: false } },
      ),
    };
    expect(bankImageSource(noneBootable, 'b')?.key).toBe('a');
  });

  it('is null when no other bank holds a decrypted image', () => {
    expect(bankImageSource(slotReport(base, null, ['a', 'b', 'r']), 'b')).toBeNull();
    const undecrypted = slotReport(base, null, ['b']);
    const stripped: SlotsReport = {
      ...undecrypted,
      slots: undecrypted.slots.map((candidate) =>
        candidate.state === null || candidate.content !== 'image'
          ? candidate
          : { ...candidate, state: { ...candidate.state, plain: null } },
      ),
    };
    expect(bankImageSource(stripped, 'b')).toBeNull();
    /* An unread bank is no source either. */
    expect(bankImageSource(slotReport(base, 'a', ['b']), 'b')?.key).toBe('r');
  });

  it('names the image with the camera key pair when the image holds both keys, as a dump does', () => {
    const { plain, table } = holdsKeys();
    const report = slotReport(
      { ...base, keyTable: { ...table, offset: 0, matchA: true, matchB: true } },
      null,
      ['b'],
    );
    const withPlain: SlotsReport = {
      ...report,
      slots: report.slots.map((candidate) =>
        candidate.state === null || candidate.content !== 'image'
          ? candidate
          : { ...candidate, state: { ...candidate.state, plain } },
      ),
    };
    const source = bankImageSource(withPlain, 'b');
    expect(source?.fileName).toBe(
      `seek-slot-A-v4.9.1.5-decrypted-eeeeeeee-KeyA-${'11'.repeat(16)}-KeyB-${'22'.repeat(16)}.bin`,
    );
  });
});

describe('slot helpers: empty banks', () => {
  it('names an empty dump by what it is, and only the raw file carries the word', () => {
    expect(slotDumpFileName('b', null, 'raw', 'ff'.repeat(32), null, true)).toBe(
      'seek-slot-B-empty-raw-ffffffff.bin',
    );
    /* A bank that holds an image is named as before. */
    expect(slotDumpFileName('b', '4.9.1.5', 'raw', 'ab'.repeat(32), null, false)).toBe(
      'seek-slot-B-v4.9.1.5-raw-abababab.bin',
    );
  });

  it('turns the flash actions off for an empty bank the plan says cannot be written, with the plan’s reason', () => {
    const empty = emptySlotView(base, 'b');
    const unwritable = slotEntry('b', {
      emptyBank: {
        writable: { supported: false, reason: 'no staging form for an empty bank' },
        why: 'x',
      },
    });
    const gate = (action: 'dump' | 'flash-plain' | 'flash-raw') =>
      slotActionGate({
        entry: unwritable,
        view: { ...empty, entry: unwritable },
        action,
        connected: true,
        busy: false,
      });
    expect(gate('flash-plain')).toEqual({
      enabled: false,
      reason:
        'This bank is empty and cannot be written on this build: no staging form for an empty bank',
    });
    expect(gate('flash-raw').enabled).toBe(false);
    /* A dump is a read and stays allowed. */
    expect(gate('dump').enabled).toBe(true);
    /* The same bank under a plan that allows it is writable. */
    expect(
      slotActionGate({
        entry: slotEntry('b'),
        view: empty,
        action: 'flash-plain',
        connected: true,
        busy: false,
      }),
    ).toEqual({ enabled: true, reason: null });
  });
});

/* ---- the frame-rate patch --------------------------------------------- */

function fpsPreDumpOf(key: SlotKey): FpsPreDump {
  return {
    key,
    bank: `slot ${key.toUpperCase()}`,
    version: '1.3.0.0',
    address: 0x14050000,
    raw: new Uint8Array(0x10000).fill(0x11),
    rawSha256: 'aa',
    rawName: `seek-slot-${key.toUpperCase()}-v1.3.0.0-before-fps-patch-raw-aa.bin`,
    plain: new Uint8Array(0xbaa8).fill(0x22),
    plainSha256: 'bb',
    plainName: `seek-slot-${key.toUpperCase()}-v1.3.0.0-before-fps-patch-decrypted-bb.bin`,
  };
}

function fpsResultOf(key: SlotKey): FpsPatchResult {
  return {
    key,
    patch: { id: 'compact_32k-1.3.0.0-to32' },
    fromHz: 8,
    toHz: 32,
    pre: fpsPreDumpOf(key),
    changed: [0xb964, 0x238],
    written: { verified: true, commitStatus: 0, after: null, notes: [] },
    readBack: { checked: true, ok: true, differing: [0xb964, 0x238], missing: [], unexpected: [] },
    notes: [],
  } as unknown as FpsPatchResult;
}

describe('useSlotsPanel: the frame-rate patch', () => {
  it('plans from the bank the analysis read, and refuses before there is one', async () => {
    const fpsPlan = vi.fn((): FpsPlan => ({ status: 'refused', reason: 'stage two: not yet' }));
    const { backend } = makeBackend();
    const { result } = setup({ ...backend, fpsPlan });
    expect(result.current.panel.planFps('a')).toMatchObject({ status: 'refused' });
    expect(fpsPlan).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.panel.readSlots();
    });
    expect(result.current.panel.planFps('a')).toMatchObject({
      status: 'refused',
      reason: 'stage two: not yet',
    });
    expect(fpsPlan).toHaveBeenCalledTimes(1);
  });

  it('saves the bank first, then writes the patch, and keeps the outcome until the next run', async () => {
    const order: string[] = [];
    const saveDump = vi.fn(() => {
      order.push('saved');
      return Promise.resolve(true);
    });
    const patchFps = vi.fn(
      async (
        _ctx: unknown,
        _report: unknown,
        key: SlotKey,
        options: { saveDump: (dump: FpsPreDump) => Promise<boolean> },
      ) => {
        order.push('patch');
        expect(await options.saveDump(fpsPreDumpOf(key))).toBe(true);
        order.push('written');
        return fpsResultOf(key);
      },
    );
    const { backend } = makeBackend();
    const { result } = setup({ ...backend, saveDump, patchFps });
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.patchFps('b', false);
    });
    expect(order).toEqual(['patch', 'saved', 'written']);
    expect(result.current.panel.fpsOutcome?.key).toBe('b');
    expect(result.current.panel.writing).toBe(false);
  });

  it('a dump that was not saved refuses the patch: no outcome, and the run says so', async () => {
    const saveDump = vi.fn(() => Promise.resolve(false));
    const patchFps = vi.fn(
      async (
        _ctx: unknown,
        _report: unknown,
        key: SlotKey,
        options: { saveDump: (dump: FpsPreDump) => Promise<boolean> },
      ) => {
        if (!(await options.saveDump(fpsPreDumpOf(key)))) {
          throw new SeekError(
            'slots/refused',
            'The pre-patch dump of slot B was not saved, so the patch was not written.',
          );
        }
        return fpsResultOf(key);
      },
    );
    const { backend } = makeBackend();
    const { result } = setup({ ...backend, saveDump, patchFps });
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.patchFps('b', false);
    });
    expect(saveDump).toHaveBeenCalledTimes(1);
    expect(result.current.panel.fpsOutcome).toBeNull();
    expect(lineIncludes(result.current.panel.reporter.lines, 'was not saved')).toBe(true);
  });

  it('asks for the risk tick on the booted bank before anything is run', async () => {
    const patchFps = vi.fn(() => Promise.resolve(fpsResultOf('a')));
    const { backend } = makeBackend();
    const { result } = setup({ ...backend, patchFps });
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.patchFps('a', false);
    });
    expect(patchFps).not.toHaveBeenCalled();
    expect(result.current.panel.fpsOutcome).toBeNull();
  });
});
