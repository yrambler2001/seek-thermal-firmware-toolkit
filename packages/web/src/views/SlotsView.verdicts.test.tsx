/**
 * The slots page's verdicts, row by row, against the banner. What is pinned here:
 *   - a camera-wide refusal (the banner) turns every flash control off in every row, with the reason in
 *     words beside it, and Dump stays on (reading changes nothing);
 *   - a bank the read could not read puts no banner on the camera: the other banks keep their controls;
 *   - a bank that is not offered the frame-rate patch says why, an empty bank included.
 * The state is core's real read (`fakeDeviceState`), changed in the one field each test is about.
 */

import { beforeAll, describe, expect, it, vi } from 'vitest';
import { useReporter, type ReporterHandle } from '../hooks/useReporter';
import type { SlotsPanelApi } from '../hooks/useSlotsPanel';
import { fakeDeviceState } from '../test-fixtures';
import { render, renderHook } from '../test-helpers';
import { slotPlan, slotReport } from '../test-slots';
import { getProfile, type DeviceState, type FpsPlan, type SlotKey } from '@seek-fw/core';
import { SlotsView } from './SlotsView';

let base: DeviceState;

beforeAll(async () => {
  base = await fakeDeviceState();
});

function reporterHandle(): ReporterHandle {
  const { result } = renderHook(() => useReporter('Idle.'));
  return result.current;
}

function panel(over: Partial<SlotsPanelApi> = {}): SlotsPanelApi {
  return {
    reporter: reporterHandle(),
    plan: null,
    report: null,
    refusal: null,
    pending: null,
    outcome: null,
    reading: false,
    writing: false,
    readSlots: () => Promise.resolve(),
    dump: vi.fn((_key: SlotKey) => Promise.resolve()),
    pickFile: vi.fn((_key: SlotKey, _kind, _file: File) => Promise.resolve()),
    copyBank: vi.fn((_from: SlotKey, _to: SlotKey) => Promise.resolve()),
    pickRestore: vi.fn((_key: SlotKey, _file: File) => Promise.resolve()),
    write: vi.fn((_acknowledged: boolean) => Promise.resolve()),
    discardPending: vi.fn(),
    cancel: vi.fn(),
    unlockNote: false,
    fpsOutcome: null,
    fpsEveryOutcome: null,
    planEveryFps: () => null,
    patchEveryFps: vi.fn((_acknowledged: boolean) => Promise.resolve()),
    planFps: vi.fn((): FpsPlan => ({ status: 'refused', reason: 'no read yet' })),
    patchFps: vi.fn((_key: SlotKey, _acknowledged: boolean) => Promise.resolve()),
    ...over,
  };
}

function view(element: ReturnType<typeof panel>): ReturnType<typeof render> {
  return render(<SlotsView slots={element} connected busy={false} />);
}

function bankRows(container: HTMLElement): HTMLTableRowElement[] {
  return [...container.querySelectorAll<HTMLTableRowElement>('tbody tr')];
}

/** The buttons of one row, by their text and whether they are enabled. */
function buttonsOf(row: HTMLElement): { text: string; enabled: boolean }[] {
  return [...row.querySelectorAll('button')].map((button) => ({
    text: button.textContent.trim(),
    enabled: !button.disabled,
  }));
}

/** The file pickers of one row (the flash controls are labels of file inputs' buttons). */
function flashControlsOf(row: HTMLElement): { text: string; enabled: boolean }[] {
  return buttonsOf(row).filter((button) => button.text.startsWith('Flash'));
}

/** A copy of the real read with the camera-wide refusal the banner shows. */
function refusedCamera(reason: string): DeviceState {
  return { ...base, bankWriteRefusals: [reason] };
}

/**
 * A camera the page allows to write (the 2014 plaintext chain: no key is derived, and no camera-wide reason
 * is set), as the bench's 1.3.0.0 reads it. The fake camera's own read is refused by the key derivation (its
 * booted bank decrypts under no key), so a test about one bank's controls needs this one.
 */
function writableCamera(): DeviceState {
  return {
    ...base,
    version: '1.3.0.0',
    plainChain: true,
    keyTable: null,
    deviceKeySlot: null,
    storeKey: { name: 'Key B', key: null, programmed: false },
    bankWriteRefusals: [],
  };
}

/** The writable camera with bank B not read: the read refuses that bank by name, not the camera. */
function unreadB(): DeviceState {
  const slots = writableCamera().slots.map((slot) =>
    slot.key === 'b'
      ? { ...slot, unread: true, reason: 'the window would not arm', present: false, plain: null }
      : slot,
  );
  return {
    ...writableCamera(),
    slots,
    byKey: new Map(slots.map((slot) => [slot.key, slot])),
  };
}

describe('SlotsView: the camera-wide refusal reaches every row', () => {
  it('shows the banner, turns every flash control off in every row with the reason, and keeps Dump on', () => {
    const state = refusedCamera('this camera could not be read');
    const { container, unmount } = view(panel({ plan: slotPlan(true), report: slotReport(state) }));
    expect(container.textContent).toContain('No bank of this camera can be written from here.');
    const rows = bankRows(container);
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      const flash = flashControlsOf(row);
      expect(flash.length, 'the row has its flash controls').toBeGreaterThan(0);
      for (const control of flash) expect(control.enabled, control.text).toBe(false);
      expect(buttonsOf(row).find((button) => button.text === 'Dump')?.enabled).toBe(true);
      expect(row.textContent).toContain('This camera cannot be written from here');
      expect(row.textContent).not.toMatch(/Written as.*derived/);
    }
    unmount();
  });

  it('a bank the read could not read puts no banner on the camera: A and R keep their flash controls', () => {
    const state = unreadB();
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(state, 'b') }),
    );
    expect(container.textContent).not.toContain('No bank of this camera can be written from here');
    const rows = bankRows(container);
    const [a, b, r] = rows;
    if (a === undefined || b === undefined || r === undefined) throw new Error('three bank rows');
    for (const row of [a, r]) {
      expect(flashControlsOf(row).some((control) => control.enabled)).toBe(true);
    }
    expect(b.textContent).toContain('Not read');
    for (const control of flashControlsOf(b)) expect(control.enabled, control.text).toBe(false);
    unmount();
  });
});

describe('SlotsView: the device info names a bank as the table does', () => {
  it('says "Booted from Slot X" with the same name the bank table gives that bank', () => {
    const report = slotReport(base);
    const { container, unmount } = view(panel({ plan: slotPlan(true), report }));
    const text = container.textContent;
    expect(text).toMatch(/Booted from\W*(?:Slot [AB]|Recovery R)/);
    expect(text).not.toMatch(/Booted from\W*slot /);
    const booted = report.slots.find((candidate) => candidate.active);
    if (booted !== undefined) {
      expect(text).toContain(booted.entry.name);
    }
    unmount();
  });
});

describe('SlotsView: the keys panel says what the write is keyed by, on each line', () => {
  it('on the 2016 keystream line the panel says the camera’s keys are not used, and does not claim a derived key', () => {
    const state = {
      ...writableCamera(),
      profile: getProfile('compact-2016'),
      version: '1.0.3.0',
      plainChain: false,
      keyTable: null,
      bankWriteRefusals: [],
    };
    const { container, unmount } = view(panel({ plan: slotPlan(true), report: slotReport(state) }));
    const text = container.textContent;
    /* The 2016 form (core's STAGED_UNDER_IMAGE_BLOCK_0, TESTING.md 42.84): staged under the image's own
     * key block 0, stored by the camera under the key its bootloader checks. */
    expect(text).toContain("this camera's keys are not used");
    expect(text).toContain('Stored as');
    expect(text).not.toContain('derived from the booted bank');
    expect(text).not.toContain('No bank of this camera can be written');
    unmount();
  });
});

describe('SlotsView: a bank not offered the frame-rate patch says why, empty banks included', () => {
  it('shows the plan’s reason on an empty bank, where it used to show nothing', () => {
    const planFps = vi.fn((): FpsPlan => ({
      status: 'refused',
      reason: 'bank B has no decrypted image to patch (it is empty)',
    }));
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base, null, ['b']), planFps }),
    );
    const row = bankRows(container)[1];
    if (row === undefined) throw new Error('no bank row');
    expect(row.textContent).toContain(
      'Frame-rate patch not offered: bank B has no decrypted image to patch (it is empty)',
    );
    expect(buttonsOf(row).some((button) => button.text.startsWith('Make '))).toBe(false);
    unmount();
  });

  it('says nothing about the frame rate on an unsupported build: the build’s own banner says that', () => {
    const planFps = vi.fn((): FpsPlan => ({ status: 'refused', reason: 'no image' }));
    const report = { ...slotReport(writableCamera()), plan: slotPlan(false) };
    const { container, unmount } = view(panel({ plan: slotPlan(false), report, planFps }));
    expect(container.textContent).toContain('This build is not supported here');
    expect(container.textContent).not.toContain('Frame-rate patch not offered');
    unmount();
  });
});
