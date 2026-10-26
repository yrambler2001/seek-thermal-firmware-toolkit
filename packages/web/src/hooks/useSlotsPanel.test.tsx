/**
 * The slot page's state machine, against a fake backend.
 *
 * What is pinned here: a build the plan does not support is never read; a
 * report belongs to one camera; a bank the camera boots, and recovery, are not
 * written without the acknowledgement; every write saves its bank first, as one
 * zip download; a commit drops the read it was made from, and a write that
 * stops before its commit keeps it; and the file names a dump is saved under.
 * No camera is touched: the backend answers every question, and the transport
 * is never opened on a real device.
 */

import { act } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import {
  CancelledError,
  SeekError,
  WebUsbTransport,
  copySourceRefusal,
  slotDumpNames,
  type DeviceState,
  type DumpedSlot,
  type FlashSlotResult,
  type FpsEveryBankResult,
  type FpsPatchOptions,
  type SlotFlashPlan,
  type SlotInputKind,
  type SlotKey,
  type SlotPlan,
  type SlotRestorePlan,
  type SlotView,
  type SlotsReport,
  type WriteAction,
  type WriteBackup,
} from '@seek-fw/core';
import type { FpsPatchResult, FpsPlan } from '@seek-fw/core';
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
import { UnlockSeat } from '../lib/unlock-seat';
import {
  cancelledStatus,
  copyLabel,
  everyPatchedStatus,
  needsRiskAck,
  patchedStatus,
  replugRecord,
  slotActionGate,
  slotCopyGate,
  useSlotsPanel,
  writeRisk,
  writtenStatus,
  type SlotsBackend,
} from './useSlotsPanel';
import { useRunner } from './useRunner';

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
  /** Runs inside the write, after the save and before the commit is announced: a throw here stops a write before its commit. */
  beforeCommit: Mock;
  restore: Mock;
}

/** A backup zip as core builds one, for the bank and the write given. */
function backupOf(keys: readonly SlotKey[], action: WriteAction): WriteBackup {
  const label =
    action.kind === 'copy'
      ? `before-copy-from-${action.from.toUpperCase()}`
      : action.kind === 'restore'
        ? 'before-restore'
        : action.kind === 'flash'
          ? action.input === 'raw'
            ? 'before-flash-raw'
            : 'before-flash'
          : action.kind === 'fps-patch'
            ? 'before-fps-patch'
            : 'before-fps-patch-every-bank';
  const name = `seek_backup_2026-10-26T12-00-00Z_SN-1_v4.9.1.5_bank-${keys.map((key) => key.toUpperCase()).join('-')}_${label}`;
  return {
    name,
    fileName: `${name}.zip`,
    savedAt: '2026-10-26T12:00:00.000Z',
    serial: 'SN-1',
    firmware: '4.9.1.5',
    action,
    follows: 'the write',
    banks: [],
    textName: 'README.txt',
    text: '',
    zip: new Uint8Array(1234),
  };
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
    beforeCommit: vi.fn(),
    restore: vi.fn(),
  };
  const backend: SlotsBackend = {
    identify: (device, log) => mocks.identify(device, log) as Promise<ActingProfile>,
    plan: (profile, version) => mocks.plan(profile, version) as SlotPlan,
    inspect: (ctx, firmware) => mocks.inspect(ctx, firmware) as Promise<SlotsReport>,
    dump: (ctx, report, key) => mocks.dump(ctx, report, key) as Promise<DumpedSlot>,
    prepare: (report, key, input) => mocks.prepare(report, key, input) as SlotFlashPlan,
    /* Core's flashSlotWithBackup, as the hook sees it: the save first (the page's own, a download), then the
     * commit announced, then the write. `flash` gets the two options a write always had. */
    write: async (ctx, report, plan, opts) => {
      const backup = backupOf([plan.key], opts.action);
      if (!(await opts.saveBackup(backup))) {
        throw new SeekError('slots/refused', `the backup ${backup.fileName} was not saved`);
      }
      mocks.beforeCommit(plan.key);
      opts.onCommit?.(plan.key);
      const written = (await mocks.flash(ctx, report, plan, {
        verify: opts.verify,
        acknowledgeRisk: opts.acknowledgeRisk,
      })) as FlashSlotResult;
      return { written, backup };
    },
    /* Core's planSlotCopy, as the hook sees it: core's own source refusal, then the target prepared. */
    copy: (report, from, to) => {
      const why = copySourceRefusal(report, from);
      if (why !== null) throw new SeekError('slots/refused', `${why}. Nothing was written.`);
      const plain = report.slots.find((view) => view.entry.key === from)?.state?.plain ?? null;
      const fileName = `seek-slot-${from}-4.9.1.5-eeeeeeee-decrypted.bin`;
      return {
        from,
        to,
        fileName,
        source: `slot ${from.toUpperCase()} at 0x14030000, firmware 4.9.1.5, as the slots read decrypted it`,
        plan: mocks.prepare(report, to, { kind: 'plain', bytes: plain, fileName }) as SlotFlashPlan,
      };
    },
    restore: (report, key, picked) =>
      mocks.restore(report, key, picked) as Promise<SlotRestorePlan>,
  };
  return { backend, mocks };
}

/** A device handle over one fake camera, with the device's unlock flag held in `seat` (TESTING.md 42.59). */
function deviceHandle(generation: number, seat: UnlockSeat): DeviceHandle {
  const camera = fakeCamera();
  return {
    device: null,
    description: 'Fake PIR324',
    generation,
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

function setup(backend: SlotsBackend) {
  const state = { generation: 1, seat: new UnlockSeat() };
  const handle = renderHook(() => {
    const runner = useRunner();
    const panel = useSlotsPanel({
      runner,
      device: deviceHandle(state.generation, state.seat),
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

/** The log lines that ask for the replug: there must be exactly one, and not the capitalised prompt. */
function replugLines(lines: readonly { readonly text: string }[]): string[] {
  return lines.map((line) => line.text).filter((text) => /unplug and replug/i.test(text));
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

describe('useSlotsPanel: the unlock note (information only)', () => {
  /** An identify that sends the unlock token: the accepted authenticated arm is what the core records. */
  function tokenSentIdentify(): Mock {
    return vi.fn((device: { noteBeginAccepted(payload: Uint8Array): void }) => {
      device.noteBeginAccepted(new Uint8Array(18));
      return Promise.resolve(actingProfile());
    });
  }

  it('is shown after a read that sent the unlock token', async () => {
    const { backend } = makeBackend({ identify: tokenSentIdentify() });
    const { result, unmount } = setup(backend);
    expect(result.current.panel.unlockNote).toBe(false);

    await act(async () => {
      await result.current.panel.readSlots();
    });

    expect(result.current.panel.unlockNote).toBe(true);
    unmount();
  });

  it('is not shown after a read that sent no token, and the banks are still read', async () => {
    const { backend, mocks } = makeBackend();
    const { result, unmount } = setup(backend);

    await act(async () => {
      await result.current.panel.readSlots();
    });

    expect(result.current.panel.unlockNote).toBe(false);
    expect(mocks.inspect).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('is the device’s flag: a re-enumeration alone keeps it, and a swap clears it (the device clears it, not this panel)', async () => {
    const { backend } = makeBackend({ identify: tokenSentIdentify() });
    const { result, rerender, state, unmount } = setup(backend);

    await act(async () => {
      await result.current.panel.readSlots();
    });
    expect(result.current.panel.unlockNote).toBe(true);

    /* A new device object with no swap: the device's seat keeps its flag. */
    act(() => {
      state.generation = 2;
      rerender();
    });
    expect(result.current.panel.unlockNote).toBe(true);

    /* A swap: the seat clears, and the new camera shows no note. */
    act(() => {
      state.seat.changed();
      state.generation = 3;
      rerender();
    });
    expect(result.current.panel.unlockNote).toBe(false);
    unmount();
  });
});

describe('useSlotsPanel: dumping a bank', () => {
  it('saves the raw bank and the decrypted image, named by slot, version and the stored bank’s short hash', async () => {
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
      'seek-slot-a-4.9.1.5-abababab.bin',
      'seek-slot-a-4.9.1.5-abababab-decrypted.bin',
    ]);
    unmount();
  });

  it('names the files exactly as core names them for the CLI, with the camera key pair when the image holds it', async () => {
    const keyA = Uint8Array.from({ length: 16 }, (_, i) => 0x11 + i);
    const keyB = Uint8Array.from({ length: 16 }, (_, i) => 0x81 + i);
    const table = { keyA, keyB, offset: 0, matchA: true, matchB: true };
    const plain = new Uint8Array(0x100).fill(0x5a);
    plain.set(keyA, 0x20);
    plain.set(keyB, 0x40);
    const dumped: DumpedSlot = { ...dumpedSlot('a'), plain, plainSha256: 'cd'.repeat(32) };
    const report = slotReport({ ...base, keyTable: table });
    const { backend, mocks } = makeBackend({ report });
    mocks.dump.mockImplementationOnce(() => Promise.resolve(dumped));
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });

    await act(async () => {
      await result.current.panel.dump('a');
    });

    const expected = slotDumpNames(dumped, '4.9.1.5', table);
    const names = vi.mocked(downloadBytes).mock.calls.map((call) => call[1]);
    expect(names).toEqual([expected.raw, expected.decrypted]);
    expect(expected.decrypted).toBe(
      'seek-slot-a-4.9.1.5-abababab-decrypted' +
        '-KeyA-1112131415161718191a1b1c1d1e1f20-KeyB-8182838485868788898a8b8c8d8e8f90.bin',
    );
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
    /* The log keeps one record of the replug; the capitalised prompt is the result panel's alone, and the
     * status says how the write ended without asking again (TESTING.md 42.85 O1, 42.86). */
    expect(replugLines(result.current.panel.reporter.lines)).toEqual([replugRecord('write')]);
    expect(lineIncludes(result.current.panel.reporter.lines, 'NOW UNPLUG')).toBe(false);
    expect(result.current.panel.reporter.progress.text).toBe(
      'Written. The bank reads back as written.',
    );
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
    expect(result.current.panel.reporter.progress.text).toBe(writtenStatus(true));
    expect(result.current.panel.reporter.progress.text).not.toMatch(/replug/i);
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
    expect(result.current.panel.reporter.progress.text).toBe(writtenStatus(true));
    expect(replugLines(result.current.panel.reporter.lines)).toHaveLength(1);
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
    expect(lineIncludes(result.current.panel.reporter.lines, 'staged as the vendor app')).toBe(
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
    /* The staging form in words, from core's map; the code name is the JSON's (TESTING.md 42.87). */
    expect(
      lineIncludes(
        result.current.panel.reporter.lines,
        'B payload, staged as the vendor app stages the FF image (XOR Key A), transfer checksum',
      ),
    ).toBe(true);
    expect(lineIncludes(result.current.panel.reporter.lines, 'key-a-keystream')).toBe(false);
    unmount();
  });

  /* The fake stands for a refusal core does make (write.ts ffRunningRefusal). Before 42.82 it said the FF
   * image goes to R only, which core stopped saying in 42.12 (A, B and R take it). */
  it('shows a core refusal of the FF image (the camera runs the 8 Hz build) and prepares nothing', async () => {
    const { backend, mocks } = makeBackend();
    mocks.prepare.mockImplementation(() => {
      throw new SeekError(
        'slots/refused',
        'this is the 1.3.0.8 FF (16 Hz) image, but the camera runs the 8 Hz 1.3.0.8 application. Nothing was sent.',
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
    expect(
      lineIncludes(
        result.current.panel.reporter.lines,
        'the camera runs the 8 Hz 1.3.0.8 application',
      ),
    ).toBe(true);
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
    expect(name).toBe('seek-slot-b-empty-ffffffff.bin');
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

describe('useSlotsPanel: every write saves its bank first, as one zip download (TESTING.md 42.91)', () => {
  it('downloads the zip before the write, named as core names it, and says what to check', async () => {
    const { backend, mocks } = makeBackend();
    const order: string[] = [];
    vi.mocked(downloadBytes).mockImplementation(() => {
      order.push('download');
    });
    mocks.flash.mockImplementation((_ctx: unknown, _report: unknown, plan: SlotFlashPlan) => {
      order.push('write');
      return Promise.resolve(flashedSlot(plan.key));
    });
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.pickFile('b', 'plain', file('fw.bin', new Uint8Array(16)));
    });
    expect(result.current.panel.pending?.action).toEqual({
      kind: 'flash',
      input: 'plain',
      fileName: 'fw.bin',
    });
    await act(async () => {
      await result.current.panel.write(false);
    });
    expect(order).toEqual(['download', 'write']);
    const name = 'seek_backup_2026-10-26T12-00-00Z_SN-1_v4.9.1.5_bank-B_before-flash.zip';
    expect(vi.mocked(downloadBytes).mock.calls[0]?.slice(1)).toEqual([name, 'application/zip']);
    expect(result.current.panel.outcome?.backup.fileName).toBe(name);
    expect(
      lineIncludes(result.current.panel.reporter.lines, `saved first, as a download: ${name}`),
    ).toBe(true);
    unmount();
  });

  it('names raw bytes as such', async () => {
    const { backend } = makeBackend();
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.pickFile('b', 'raw', file('raw.bin', new Uint8Array(16)));
    });
    await act(async () => {
      await result.current.panel.write(false);
    });
    expect(result.current.panel.outcome?.backup.fileName).toMatch(/_bank-B_before-flash-raw\.zip$/);
    unmount();
  });

  it('a backup that was not saved writes nothing, keeps the read, and says so', async () => {
    const { backend, mocks } = makeBackend();
    const { result, unmount } = setup({ ...backend, saveBackup: () => Promise.resolve(false) });
    await act(async () => {
      await result.current.panel.readSlots();
    });
    const read = result.current.panel.report;
    await act(async () => {
      await result.current.panel.pickFile('b', 'plain', file('fw.bin', new Uint8Array(16)));
    });
    await act(async () => {
      await result.current.panel.write(false);
    });
    expect(mocks.flash).not.toHaveBeenCalled();
    expect(result.current.panel.outcome).toBeNull();
    expect(result.current.panel.report).toBe(read);
    expect(lineIncludes(result.current.panel.reporter.lines, 'was not saved')).toBe(true);
    unmount();
  });
});

describe('useSlotsPanel: a cancel says "partly written" only once a commit was sent (TESTING.md 42.82, 42.91 C)', () => {
  it('a cancel before the commit says nothing was written, and the read stays', async () => {
    const { backend, mocks } = makeBackend();
    mocks.beforeCommit.mockImplementation(() => {
      throw new CancelledError('cancelled before commit — nothing was written to flash');
    });
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    const read = result.current.panel.report;
    await act(async () => {
      await result.current.panel.pickFile('b', 'plain', file('fw.bin', new Uint8Array(16)));
    });
    await act(async () => {
      await result.current.panel.write(false);
    });
    expect(mocks.flash).not.toHaveBeenCalled();
    expect(result.current.panel.reporter.progress.text).toBe('Cancelled — nothing was written.');
    expect(result.current.panel.report).toBe(read);
    unmount();
  });

  it('a cancel after the commit was sent says the bank may be partly written, and drops the read', async () => {
    const { backend, mocks } = makeBackend();
    mocks.flash.mockImplementation(() => Promise.reject(new CancelledError('cancelled')));
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
    expect(result.current.panel.reporter.progress.text).toBe(
      'Cancelled after the commit to slot B was sent — the bank may be partly written. Read it before relying on it.',
    );
    expect(result.current.panel.report).toBeNull();
    unmount();
  });

  it('the patch says the same: nothing written before its commit', async () => {
    const patchFps = vi.fn(() =>
      Promise.reject(new CancelledError('cancelled before commit — nothing was written to flash')),
    );
    const { backend } = makeBackend();
    const { result, unmount } = setup({ ...backend, patchFps });
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.patchFps('b', false);
    });
    expect(result.current.panel.reporter.progress.text).toBe('Cancelled — nothing was written.');
    expect(result.current.panel.report).not.toBeNull();
    unmount();
  });

  it('cancelledStatus names every bank whose commit was sent', () => {
    const report = slotReport(base);
    expect(cancelledStatus([], report)).toBe('Cancelled — nothing was written.');
    expect(cancelledStatus(['b', 'r'], report)).toBe(
      'Cancelled after the commits to slot B and recovery R were sent — each may be partly written. Read them before relying on them.',
    );
  });
});

describe('useSlotsPanel: copying a bank into another', () => {
  it('prepares bank A’s decrypted image for bank B, says where it came from, and sends nothing', async () => {
    const report = slotReport(base, null, ['b']);
    const { backend, mocks } = emptyBackend(report);
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });

    await act(async () => {
      await result.current.panel.copyBank('a', 'b');
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
    const pending = result.current.panel.pending;
    expect(pending?.key).toBe('b');
    expect(pending?.action).toEqual({ kind: 'copy', from: 'a' });
    expect(pending?.source).toContain('slot A');
    /* TESTING.md 42.93: the dialog and the result name the source bank, not a made-up file name. */
    expect(pending?.what).toMatch(/A's image$/);
    expect(pending?.what).not.toContain('.bin');
    expect(pending?.plan.targetEmpty).toBe(true);
    expect(mocks.flash).not.toHaveBeenCalled();
    expect(mocks.dump).not.toHaveBeenCalled();
    expect(lineIncludes(result.current.panel.reporter.lines, 'image taken from slot A')).toBe(true);
    unmount();
  });

  it('writes it after the confirmation like any file; the zip is named for the copy', async () => {
    const { backend, mocks } = emptyBackend(slotReport(base));
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.copyBank('r', 'b');
    });
    await act(async () => {
      await result.current.panel.write(false);
    });
    expect(mocks.flash).toHaveBeenCalledTimes(1);
    expect(result.current.panel.outcome?.backup.fileName).toMatch(
      /_bank-B_before-copy-from-R\.zip$/,
    );
    unmount();
  });

  it('keeps the acknowledgement rule: a copy into the booted bank is refused without the tick', async () => {
    const { backend, mocks } = emptyBackend(slotReport(base));
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.copyBank('b', 'a');
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

  it('refuses a source with no image to copy, with core’s reason, and prepares nothing', async () => {
    const { backend, mocks } = emptyBackend(slotReport(base, null, ['b']));
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.copyBank('b', 'a');
    });
    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(result.current.panel.pending).toBeNull();
    expect(
      lineIncludes(
        result.current.panel.reporter.lines,
        'slot B is empty: there is no image to copy',
      ),
    ).toBe(true);
    unmount();
  });

  it('does nothing before the banks were read', async () => {
    const { backend, mocks } = emptyBackend(slotReport(base, null, ['b']));
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.copyBank('a', 'b');
    });
    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(lineIncludes(result.current.panel.reporter.lines, 'read the slots first')).toBe(true);
    unmount();
  });
});

/** A restore plan as core makes one: bank `key` of a full flash backup, staged as a decrypted image. */
function restorePlanOf(key: SlotKey, stored: Uint8Array): SlotRestorePlan {
  return {
    key,
    backup: {
      fileName: 'whole.bin',
      flash: new Uint8Array(0),
      sha256: 'ff'.repeat(32),
      from: 'flash-file',
      entry: null,
      identity: { serial: 'SN-1', chipId: '090BE9B6D4E4' },
    },
    stored,
    storedSha256: 'aa'.repeat(32),
    sameAsNow: false,
    sameCamera: true,
    version: '4.9.1.5',
    decryption: { plain: SLOT_PLAIN } as unknown as SlotRestorePlan['decryption'],
    fileName: `seek-slot-${key}-4.9.1.5-aaaaaaaa-decrypted.bin`,
    source: `the backup's slot ${key.toUpperCase()} in the full flash backup whole.bin, firmware 4.9.1.5`,
    plan: preparedSlot(key, 'plain', SLOT_PLAIN),
  };
}

describe('useSlotsPanel: restoring a bank from a full flash backup', () => {
  it('prepares the bank cut from the file, writes it, and compares the read-back with the backup’s bytes', async () => {
    const stored = new Uint8Array(0x10000).fill(0x42);
    const { backend, mocks } = makeBackend();
    mocks.restore.mockImplementation((_report: unknown, key: SlotKey) =>
      Promise.resolve(restorePlanOf(key, stored)),
    );
    mocks.flash.mockImplementation((_ctx: unknown, _report: unknown, plan: SlotFlashPlan) =>
      Promise.resolve({ ...flashedSlot(plan.key), after: stored.slice() }),
    );
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.pickRestore('b', file('whole.bin', new Uint8Array(32)));
    });
    expect(mocks.restore).toHaveBeenCalledTimes(1);
    const [, key, picked] = mocks.restore.mock.calls[0] as [
      unknown,
      SlotKey,
      { bytes: Uint8Array; name: string },
    ];
    expect(key).toBe('b');
    expect(picked.name).toBe('whole.bin');
    expect(result.current.panel.pending?.action).toEqual({
      kind: 'restore',
      fileName: 'whole.bin',
    });
    expect(result.current.panel.pending?.source).toContain('full flash backup whole.bin');
    /* TESTING.md 42.93: the backup's bank and the file the person picked, not the decrypted file's name. */
    expect(result.current.panel.pending?.what).toMatch(/B of whole\.bin$/);
    expect(mocks.flash).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.panel.write(false);
    });
    expect(result.current.panel.outcome?.restore).toEqual({
      compared: true,
      equal: true,
      differing: 0,
      firstDiffering: null,
    });
    expect(result.current.panel.outcome?.backup.fileName).toMatch(/_bank-B_before-restore\.zip$/);
    expect(
      lineIncludes(
        result.current.panel.reporter.lines,
        'slot B reads back byte for byte as the backup stores it',
      ),
    ).toBe(true);
    unmount();
  });

  it('shows core’s refusal (an empty bank in the backup) and prepares nothing', async () => {
    const { backend, mocks } = makeBackend();
    mocks.restore.mockImplementation(() =>
      Promise.reject(
        new SeekError(
          'slots/refused',
          "the backup's slot B is empty: every byte is 0xFF. A write programs an image and cannot leave a bank erased, so an empty bank cannot be restored by a write. Nothing was written.",
        ),
      ),
    );
    const { result, unmount } = setup(backend);
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.pickRestore('b', file('whole.bin', new Uint8Array(32)));
    });
    expect(result.current.panel.pending).toBeNull();
    expect(lineIncludes(result.current.panel.reporter.lines, 'cannot be restored by a write')).toBe(
      true,
    );
    unmount();
  });
});

describe('slotCopyGate', () => {
  it('is on for an image into any other bank, filled or empty, and names the button by the target', () => {
    const report = slotReport(base, null, ['b']);
    expect(slotCopyGate({ report, from: 'a', to: 'b', connected: true, busy: false }).enabled).toBe(
      true,
    );
    expect(slotCopyGate({ report, from: 'a', to: 'r', connected: true, busy: false }).enabled).toBe(
      true,
    );
    expect(copyLabel('a')).toBe('Copy to slot A');
    expect(copyLabel('b')).toBe('Copy to slot B');
    expect(copyLabel('r')).toBe('Copy to recovery slot R');
  });

  it('is off, with the reason, for a source with no image, and for a target the write rules turn off', () => {
    const report = slotReport(base, 'r', ['b']);
    expect(slotCopyGate({ report, from: 'b', to: 'a', connected: true, busy: false })).toEqual({
      enabled: false,
      reason: 'Slot B is empty: there is no image to copy.',
    });
    expect(
      slotCopyGate({ report, from: 'a', to: 'r', connected: true, busy: false }).reason,
    ).toMatch(/^Not read: the window would not arm/);
    expect(slotCopyGate({ report, from: 'a', to: 'b', connected: false, busy: false })).toEqual({
      enabled: false,
      reason: 'Connect the camera first.',
    });
  });
});

describe('useSlotsPanel: Make N FPS in every bank', () => {
  const offer = (key: SlotKey): FpsPlan =>
    ({
      status: 'offer',
      patch: { id: 'compact_32k-1.3.0.0-to32', version: '1.3.0.0' },
      fromHz: 8,
      toHz: 32,
      sites: [{ offset: 0xb964, before: 0x24, after: 0x22 }],
      sumWord: { offset: 0x238, before: 0 },
      key,
    }) as unknown as FpsPlan;

  function everyResult(order: readonly SlotKey[]): FpsEveryBankResult {
    return {
      backup: backupOf(['a', 'b', 'r'], { kind: 'fps-patch-every-bank' }),
      order,
      results: order.map((key) => fpsResultOf(key)),
      stopped: null,
      unwritten: [],
    };
  }

  it('plans every bank that offers it, the booted bank last', async () => {
    const { backend } = makeBackend();
    const { result, unmount } = setup({ ...backend, fpsPlan: (_report, key) => offer(key) });
    expect(result.current.panel.planEveryFps()).toBeNull();
    await act(async () => {
      await result.current.panel.readSlots();
    });
    expect(result.current.panel.planEveryFps()?.order).toEqual(['b', 'r', 'a']);
    unmount();
  });

  it('asks for the tick when the booted bank or R is among them, then patches them all in one run', async () => {
    const patchEveryFps = vi.fn(
      async (_ctx: unknown, _report: unknown, options: FpsPatchOptions) => {
        expect(
          await options.saveBackup(backupOf(['a', 'b', 'r'], { kind: 'fps-patch-every-bank' })),
        ).toBe(true);
        for (const key of ['b', 'r', 'a'] as const) options.onCommit?.(key);
        return everyResult(['b', 'r', 'a']);
      },
    );
    const { backend, mocks } = makeBackend();
    const { result, unmount } = setup({
      ...backend,
      fpsPlan: (_report, key) => offer(key),
      patchEveryFps,
    });
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.patchEveryFps(false);
    });
    expect(patchEveryFps).not.toHaveBeenCalled();
    expect(lineIncludes(result.current.panel.reporter.lines, 'risk acknowledgement')).toBe(true);

    await act(async () => {
      await result.current.panel.patchEveryFps(true);
    });
    expect(patchEveryFps).toHaveBeenCalledTimes(1);
    expect(downloadBytes).toHaveBeenCalledTimes(1);
    expect(vi.mocked(downloadBytes).mock.calls[0]?.[1]).toMatch(
      /_bank-A-B-R_before-fps-patch-every-bank\.zip$/,
    );
    expect(result.current.panel.fpsEveryOutcome?.results).toHaveLength(3);
    expect(result.current.panel.reporter.progress.text).toBe(
      'Patched 3 banks. Each reads back as planned.',
    );
    expect(replugLines(result.current.panel.reporter.lines)).toEqual([replugRecord('patch')]);
    /* The banks are read again once, after the last write. */
    expect(mocks.inspect).toHaveBeenCalledTimes(2);
    unmount();
  });

  it('a cancel after one commit names that bank, and only that one', async () => {
    const patchEveryFps = vi.fn((_ctx: unknown, _report: unknown, options: FpsPatchOptions) => {
      options.onCommit?.('b');
      return Promise.reject(new CancelledError('cancelled'));
    });
    const { backend } = makeBackend();
    const { result, unmount } = setup({
      ...backend,
      fpsPlan: (_report, key) => offer(key),
      patchEveryFps,
    });
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.patchEveryFps(true);
    });
    expect(result.current.panel.reporter.progress.text).toBe(
      'Cancelled after the commit to slot B was sent — the bank may be partly written. Read it before relying on it.',
    );
    unmount();
  });

  it('says where it stopped', () => {
    const stopped: FpsEveryBankResult = {
      ...everyResult(['b']),
      order: ['b', 'r', 'a'],
      stopped: { key: 'r', reason: 'slot R: CompleteMemoryUpgrade returned 0x00040005' },
      unwritten: ['a'],
    };
    expect(everyPatchedStatus(stopped)).toBe('Stopped at slot R — 1 bank patched; see the result.');
  });
});

describe('slot helpers: empty banks', () => {
  it('names an empty dump by what it is, with no decrypted file, as core does for the CLI', () => {
    expect(slotDumpNames(dumpedEmptySlot('b'), null, null)).toEqual({
      raw: 'seek-slot-b-empty-ffffffff.bin',
      decrypted: null,
    });
    /* A bank that holds an image is named by its version. */
    expect(slotDumpNames(dumpedSlot('b'), '4.9.1.5', null).raw).toBe(
      'seek-slot-b-4.9.1.5-abababab.bin',
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

function fpsResultOf(key: SlotKey): FpsPatchResult {
  return {
    key,
    patch: { id: 'compact_32k-1.3.0.0-to32', version: '1.3.0.0' },
    fromHz: 8,
    toHz: 32,
    backup: backupOf([key], { kind: 'fps-patch' }),
    changed: [0xb964, 0x238],
    written: { verified: true, commitStatus: 0, after: null, notes: [] },
    readBack: { checked: true, ok: true, differing: [0xb964, 0x238], missing: [], unexpected: [] },
    notes: ['committed 47768 B to slot B at 0x14050000, staged plain; commit status 0x0'],
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

  it('saves the bank first, as one zip download, then writes the patch, and keeps the outcome until the next run', async () => {
    const order: string[] = [];
    const patchFps = vi.fn(
      async (_ctx: unknown, _report: unknown, key: SlotKey, options: FpsPatchOptions) => {
        order.push('patch');
        expect(await options.saveBackup(backupOf([key], { kind: 'fps-patch' }))).toBe(true);
        order.push('saved');
        options.onCommit?.(key);
        order.push('written');
        return fpsResultOf(key);
      },
    );
    const { backend } = makeBackend();
    const { result } = setup({ ...backend, patchFps });
    await act(async () => {
      await result.current.panel.readSlots();
    });
    await act(async () => {
      await result.current.panel.patchFps('b', false);
    });
    expect(order).toEqual(['patch', 'saved', 'written']);
    /* One automatic download, the zip, named as core names it: no save dialog. */
    expect(downloadBytes).toHaveBeenCalledTimes(1);
    expect(vi.mocked(downloadBytes).mock.calls[0]?.slice(1)).toEqual([
      'seek_backup_2026-10-26T12-00-00Z_SN-1_v4.9.1.5_bank-B_before-fps-patch.zip',
      'application/zip',
    ]);
    expect(
      lineIncludes(
        result.current.panel.reporter.lines,
        'saved first, as a download: seek_backup_2026-10-26T12-00-00Z_SN-1_v4.9.1.5_bank-B_before-fps-patch.zip',
      ),
    ).toBe(true);
    expect(
      lineIncludes(result.current.panel.reporter.lines, 'check your downloads folder for it'),
    ).toBe(true);
    expect(result.current.panel.fpsOutcome?.key).toBe('b');
    expect(result.current.panel.writing).toBe(false);
  });

  it('a backup that was not saved refuses the patch: no outcome, the read stays, and the run says so', async () => {
    const saveBackup = vi.fn(() => Promise.resolve(false));
    const patchFps = vi.fn(
      async (_ctx: unknown, _report: unknown, key: SlotKey, options: FpsPatchOptions) => {
        if (!(await options.saveBackup(backupOf([key], { kind: 'fps-patch' })))) {
          throw new SeekError(
            'slots/refused',
            'the backup x.zip was not saved, so nothing was written.',
          );
        }
        return fpsResultOf(key);
      },
    );
    const { backend } = makeBackend();
    const { result } = setup({ ...backend, saveBackup, patchFps });
    await act(async () => {
      await result.current.panel.readSlots();
    });
    const read = result.current.panel.report;
    await act(async () => {
      await result.current.panel.patchFps('b', false);
    });
    expect(saveBackup).toHaveBeenCalledTimes(1);
    expect(result.current.panel.fpsOutcome).toBeNull();
    expect(result.current.panel.report).toBe(read);
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

  it('after a patch the table shows the banks read again, not the read from before, with no identify probe', async () => {
    const { backend, mocks } = makeBackend();
    const before = slotReport(base);
    const after = slotReport(base);
    mocks.inspect
      .mockImplementationOnce(() => Promise.resolve(before))
      .mockImplementationOnce(() => Promise.resolve(after));
    const patchFps = vi.fn((_ctx: unknown, _report: unknown, key: SlotKey) =>
      Promise.resolve(fpsResultOf(key)),
    );
    const { result, unmount } = setup({ ...backend, patchFps });
    await act(async () => {
      await result.current.panel.readSlots();
    });
    expect(result.current.panel.report).toBe(before);

    await act(async () => {
      await result.current.panel.patchFps('b', false);
    });

    expect(patchFps).toHaveBeenCalledTimes(1);
    /* The re-read takes no identify probe (the probe arms windows): only Read slots asked the camera. */
    expect(mocks.identify).toHaveBeenCalledTimes(1);
    expect(mocks.inspect).toHaveBeenCalledTimes(2);
    expect(mocks.inspect).toHaveBeenLastCalledWith(expect.anything(), {
      version: before.state.version,
    });
    expect(result.current.panel.report).toBe(after);
    expect(result.current.panel.fpsOutcome?.key).toBe('b');
    expect(
      lineIncludes(result.current.panel.reporter.lines, 'banks read again after the patch'),
    ).toBe(true);
    /* One replug record in the log, none in the status, and the capitalised prompt only in the panel. */
    expect(result.current.panel.reporter.progress.text).toBe(
      'Patched. The bank reads back as planned.',
    );
    expect(replugLines(result.current.panel.reporter.lines)).toEqual([replugRecord('patch')]);
    expect(lineIncludes(result.current.panel.reporter.lines, 'NOW UNPLUG')).toBe(false);
    /* The patch is named by its firmware, not by the table's internal id. */
    expect(result.current.panel.reporter.lines.map((line) => line.text)).toContain(
      'slot B: patched from 8 Hz to 32 Hz (firmware 1.3.0.0)',
    );
    /* The patch line names the firmware, not the zip: the zip is named once, by the save's own line. */
    expect(lineIncludes(result.current.panel.reporter.lines, 'seek_backup_')).toBe(false);
    expect(lineIncludes(result.current.panel.reporter.lines, 'compact_32k-')).toBe(false);
    unmount();
  });

  it('after a patch whose read-back does not match the plan, the table stays and the outcome says so', async () => {
    const { backend, mocks } = makeBackend();
    const patchFps = vi.fn((_ctx: unknown, _report: unknown, key: SlotKey) =>
      Promise.resolve({
        ...fpsResultOf(key),
        readBack: { checked: true, ok: false, differing: [], missing: [0xb964], unexpected: [] },
      } as unknown as FpsPatchResult),
    );
    const { result, unmount } = setup({ ...backend, patchFps });
    await act(async () => {
      await result.current.panel.readSlots();
    });

    await act(async () => {
      await result.current.panel.patchFps('b', false);
    });

    expect(mocks.inspect).toHaveBeenCalledTimes(2);
    expect(result.current.panel.report).not.toBeNull();
    expect(result.current.panel.fpsOutcome?.readBack.ok).toBe(false);
    expect(result.current.panel.reporter.progress.text).toContain(
      'does not differ only as planned',
    );
    unmount();
  });

  it('when the read after a patch fails, the patch result stays and no bank is shown as read', async () => {
    const { backend, mocks } = makeBackend();
    mocks.inspect
      .mockImplementationOnce(() => Promise.resolve(slotReport(base)))
      .mockImplementationOnce(() =>
        Promise.reject(new SeekError('slots/refused', 'the camera stopped answering')),
      );
    const patchFps = vi.fn((_ctx: unknown, _report: unknown, key: SlotKey) =>
      Promise.resolve(fpsResultOf(key)),
    );
    const { result, unmount } = setup({ ...backend, patchFps });
    await act(async () => {
      await result.current.panel.readSlots();
    });

    await act(async () => {
      await result.current.panel.patchFps('b', false);
    });

    expect(result.current.panel.fpsOutcome?.key).toBe('b');
    expect(result.current.panel.report).toBeNull();
    expect(
      lineIncludes(
        result.current.panel.reporter.lines,
        'the banks were not read again after the patch (the camera stopped answering)',
      ),
    ).toBe(true);
    expect(result.current.panel.reporter.progress.text).toBe(patchedStatus(true));
    expect(replugLines(result.current.panel.reporter.lines)).toHaveLength(1);
    unmount();
  });

  it('when the read after a patch is cancelled, the patch result stays and the cancel is logged', async () => {
    const { backend, mocks } = makeBackend();
    mocks.inspect
      .mockImplementationOnce(() => Promise.resolve(slotReport(base)))
      .mockImplementationOnce(() => Promise.reject(new CancelledError('cancelled by the user')));
    const patchFps = vi.fn((_ctx: unknown, _report: unknown, key: SlotKey) =>
      Promise.resolve(fpsResultOf(key)),
    );
    const { result, unmount } = setup({ ...backend, patchFps });
    await act(async () => {
      await result.current.panel.readSlots();
    });

    await act(async () => {
      await result.current.panel.patchFps('b', false);
    });

    expect(result.current.panel.fpsOutcome?.key).toBe('b');
    expect(result.current.panel.report).toBeNull();
    expect(
      lineIncludes(
        result.current.panel.reporter.lines,
        'the banks were not read again after the patch (cancelled)',
      ),
    ).toBe(true);
    unmount();
  });

  it('a patch refused before anything is sent keeps the read it was made from', async () => {
    const { backend, mocks } = makeBackend();
    const patchFps = vi.fn((_ctx: unknown, _report: unknown, key: SlotKey) =>
      Promise.resolve(fpsResultOf(key)),
    );
    const { result, unmount } = setup({ ...backend, patchFps });
    await act(async () => {
      await result.current.panel.readSlots();
    });
    const read = result.current.panel.report;

    await act(async () => {
      await result.current.panel.patchFps('a', false);
    });

    expect(patchFps).not.toHaveBeenCalled();
    expect(
      lineIncludes(result.current.panel.reporter.lines, 'needs the risk acknowledgement'),
    ).toBe(true);
    expect(result.current.panel.report).toBe(read);
    expect(mocks.inspect).toHaveBeenCalledTimes(1);
    unmount();
  });
});

describe('useSlotsPanel: the words after a write (TESTING.md 42.85 O1, 42.86)', () => {
  it('the status says how the write or the patch ended, and never asks for the replug', () => {
    const statuses = [
      writtenStatus(true),
      writtenStatus(false),
      writtenStatus(null),
      patchedStatus(true),
      patchedStatus(false),
      patchedStatus(null),
    ];
    for (const status of statuses) expect(status).not.toMatch(/replug|unplug/i);
    expect(statuses.filter((status) => status.startsWith('Written'))).toHaveLength(3);
    expect(statuses.filter((status) => status.startsWith('Patched'))).toHaveLength(3);
    expect(writtenStatus(null)).toBe('Written. The read-back was not compared — see the result.');
    expect(patchedStatus(null)).toBe('Patched. The read-back was not checked — see the result.');
  });

  it('the log record of the replug is one plain sentence, not the capitalised prompt', () => {
    for (const what of ['write', 'patch'] as const) {
      const record = replugRecord(what);
      expect(record).toMatch(/^Unplug and replug the camera: no reset was sent/);
      expect(record).toContain(`so the ${what} takes effect only at the next start`);
      expect(record).not.toContain('NOW UNPLUG');
      expect(record.match(/unplug and replug/gi)).toHaveLength(1);
    }
  });
});
