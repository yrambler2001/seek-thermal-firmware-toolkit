/**
 * The firmware-slot page, rendered against a stub of its panel.
 *
 * What is pinned: a build below 0.8.0.0 shows its reason and no bank action;
 * one row per bank, the booted one marked; every disabled action says why in
 * words; a prepared write shows what it changes and needs the tick for the
 * booted bank; a commit says to unplug and replug; and the table, the buttons
 * and the phone layout keep the accessibility the other views have.
 */

import { act } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { detectSupport, type BrowserEnvironment } from '../lib/support';
import { useReporter, type ReporterHandle } from '../hooks/useReporter';
import type { SlotsPanelApi } from '../hooks/useSlotsPanel';
import { App } from '../App';
import { fakeDeviceState } from '../test-fixtures';
import { writeKeysVerdictOf } from '../components/SlotWriteKeys';
import { render, renderHook, buttonByText } from '../test-helpers';
import {
  UNSUPPORTED_REASON,
  flashedSlot,
  preparedSlot,
  slotEntry,
  slotPlan,
  slotReport,
  slotView,
} from '../test-slots';
import type { DeviceState, SlotKey, SlotsReport } from '@seek-fw/core';
import { SlotsView } from './SlotsView';

let base: DeviceState;

beforeAll(async () => {
  base = await fakeDeviceState();
});

afterEach(() => {
  window.location.hash = '';
});

const READY = detectSupport({
  hasWebUsb: true,
  userAgent: 'Chrome',
  platform: 'MacIntel',
  maxTouchPoints: 0,
  isSecureContext: true,
  protocol: 'https:',
} satisfies BrowserEnvironment);

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
    write: vi.fn((_acknowledged: boolean) => Promise.resolve()),
    discardPending: vi.fn(),
    cancel: vi.fn(),
    ...over,
  };
}

function view(
  element: ReturnType<typeof panel>,
  connected = true,
  busy = false,
): ReturnType<typeof render> {
  return render(<SlotsView slots={element} connected={connected} busy={busy} />);
}

function bankRows(container: HTMLElement): HTMLTableRowElement[] {
  return [...container.querySelectorAll<HTMLTableRowElement>('tbody tr')];
}

function buttonsIn(container: HTMLElement): string[] {
  return [...container.querySelectorAll('button')].map((button) => button.textContent.trim());
}

function dialog(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('[role="alertdialog"]');
}

describe('SlotsView', () => {
  it('shows the reason for a build below 0.8.0.0 and offers no bank action', () => {
    const { container, unmount } = view(panel({ plan: slotPlan(false) }));

    expect(container.textContent).toContain(UNSUPPORTED_REASON);
    expect(container.querySelector('table')).toBeNull();
    expect(buttonsIn(container)).not.toContain('Dump');
    expect(buttonsIn(container).some((text) => text.startsWith('Flash'))).toBe(false);
    expect(buttonsIn(container)).toContain('Read slots');
    unmount();
  });

  it('states the keys the writes use: the booted bank’s key, or the measured refusal, from core', () => {
    const report = slotReport(base);
    const verdict = writeKeysVerdictOf(report);
    const { container, unmount } = view(panel({ plan: slotPlan(true), report }));
    const text = container.textContent;
    if (verdict.refusal !== null) {
      expect(text).toContain('No bank of this camera can be written from here.');
      expect(text).toContain(verdict.refusal);
    } else {
      expect(text).toContain('Keys for the writes');
      expect(text).toContain(`derived from the booted bank ${verdict.bootedName ?? ''}`);
    }
    unmount();
  });

  it('shows one row per bank, with the booted bank marked and every column filled', () => {
    const { container, unmount } = view(panel({ plan: slotPlan(true), report: slotReport(base) }));

    const rows = bankRows(container);
    expect(rows).toHaveLength(3);
    expect(rows[0]?.textContent).toContain('slot A');
    expect(rows[0]?.textContent).toContain('0x14050000');
    expect(rows[0]?.textContent).toContain('booted now');
    expect(rows[1]?.textContent).toContain('not booted');
    expect(rows[2]?.textContent).toContain('recovery R');
    expect(rows[2]?.textContent).toContain('0x14070000');
    expect(rows[0]?.textContent).toContain('4.9.1.5');
    expect(rows[0]?.textContent).toContain('Key A');
    expect(rows[0]?.textContent).toContain('bootable — the bootloader can key it');
    expect(rows[0]?.textContent).toContain('ee'.repeat(32));
    unmount();
  });

  it('greys out a disabled action and says why, in words beside it', () => {
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base) }),
      false,
    );

    const rows = bankRows(container);
    expect(buttonByText(rows[0] as HTMLElement, 'Dump').disabled).toBe(true);
    expect(rows[0]?.textContent).toContain('Connect the camera first.');
    expect(buttonByText(rows[0] as HTMLElement, 'Flash decrypted image…').disabled).toBe(true);
    unmount();
  });

  it('greys out an operation the build lacks, with the build reason visible as text', () => {
    const report = slotReport(base);
    const withoutRaw: SlotsReport = {
      ...report,
      slots: report.slots.map((candidate) =>
        candidate.entry.key === 'b'
          ? slotView(base, 'b', {
              entry: slotEntry('b', {
                flashRaw: { supported: false, reason: 'raw staging is not offered on this build' },
              }),
            })
          : candidate,
      ),
    };
    const { container, unmount } = view(panel({ plan: slotPlan(true), report: withoutRaw }));

    const row = bankRows(container)[1] as HTMLElement;
    expect(buttonByText(row, 'Flash raw bytes…').disabled).toBe(true);
    expect(row.textContent).toContain('raw staging is not offered on this build');
    expect(buttonByText(row, 'Flash decrypted image…').disabled).toBe(false);
    unmount();
  });

  it('will not write a bank the camera did not read, and says it was not read', () => {
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base, 'r') }),
    );

    const row = bankRows(container)[2] as HTMLElement;
    expect(row.textContent).toContain('not read — the window would not arm');
    expect(buttonByText(row, 'Flash decrypted image…').disabled).toBe(true);
    expect(row.textContent).toContain('Not read: the window would not arm.');
    /* Reading it again is still allowed, so Dump is not what is refused. */
    expect(buttonByText(row, 'Dump').disabled).toBe(false);
    unmount();
  });

  it('says that writing the booted bank or recovery asks for an extra confirmation', () => {
    const { container, unmount } = view(panel({ plan: slotPlan(true), report: slotReport(base) }));

    const rows = bankRows(container);
    expect(rows[0]?.textContent).toContain(
      'Booted now: writing it asks for an extra confirmation.',
    );
    expect(rows[1]?.textContent).not.toContain('extra confirmation');
    expect(rows[2]?.textContent).toContain(
      'Recovery bank: writing it asks for an extra confirmation.',
    );
    unmount();
  });

  it('shows the prepared write, and asks for the tick before the booted bank is written', () => {
    const report = slotReport(base);
    const bytes = new Uint8Array(0x10000);
    const api = panel({
      plan: slotPlan(true),
      report,
      pending: {
        key: 'a',
        kind: 'plain',
        fileName: 'fw_decrypted.bin',
        plan: preparedSlot('a', 'plain', bytes),
        report,
      },
    });
    const { container, unmount } = view(api);

    expect(container.textContent).toContain('Prepared for slot A at 0x14050000');
    expect(container.textContent).toContain('Nothing has been sent to the camera yet.');
    expect(container.textContent).toContain('Read before writing:');
    expect(container.textContent).toContain('What changes in slot A');
    expect(container.textContent).toContain('4.9.1.6');

    act(() => {
      buttonByText(container, 'Write to slot A…').click();
    });
    expect(dialog()).not.toBeNull();
    const confirm = buttonByText(document.body, 'Yes — write to slot A');
    expect(confirm.disabled).toBe(true);

    act(() => {
      document.body.querySelector<HTMLInputElement>('#slot-write-ack')?.click();
    });
    act(() => {
      buttonByText(document.body, 'Yes — write to slot A').click();
    });
    expect(api.write).toHaveBeenCalledWith(true);
    unmount();
  });

  it('sends nothing when the prepared write is discarded', () => {
    const report = slotReport(base);
    const api = panel({
      plan: slotPlan(true),
      report,
      pending: {
        key: 'b',
        kind: 'raw',
        fileName: 'raw.bin',
        plan: preparedSlot('b', 'raw', new Uint8Array(16)),
        report,
      },
    });
    const { container, unmount } = view(api);

    act(() => {
      buttonByText(container, 'Discard').click();
    });
    expect(api.discardPending).toHaveBeenCalledTimes(1);
    expect(api.write).not.toHaveBeenCalled();
    unmount();
  });

  it('tells the user to unplug and replug after a commit, and what is not proven', () => {
    const { container, unmount } = view(
      panel({
        plan: slotPlan(true),
        report: slotReport(base),
        outcome: { key: 'b', fileName: 'fw.bin', result: flashedSlot('b', true) },
      }),
    );

    expect(container.textContent).toContain('NOW UNPLUG AND REPLUG THE CAMERA.');
    expect(container.textContent).toContain('reads back as written');
    expect(container.textContent).toContain('NOT proven');
    unmount();
  });

  it('says plainly when the read-back does not match', () => {
    const { container, unmount } = view(
      panel({
        plan: slotPlan(true),
        report: slotReport(base),
        outcome: { key: 'b', fileName: 'fw.bin', result: flashedSlot('b', false) },
      }),
    );

    expect(container.textContent).toContain('the read-back does NOT match what was written.');
    unmount();
  });

  it('names the refusal and offers nothing else when the camera will not name its build', () => {
    const { container, unmount } = view(
      panel({
        refusal: {
          code: 'profile/unsupported',
          message: 'firmware 0.3.0.1 predates the dump protocol',
          hint: null,
        },
      }),
    );

    expect(container.textContent).toContain('Refused — nothing was armed.');
    expect(container.textContent).toContain('firmware 0.3.0.1 predates the dump protocol');
    expect(container.querySelector('table')).toBeNull();
    unmount();
  });

  it('says it cannot identify the build, and that builds before 0.8.0.0 are outside the page, when the camera gives no version', () => {
    const { container, unmount } = view(
      panel({
        refusal: {
          code: 'device/version-unknown',
          message:
            'refusing to read the device info: the camera did not report its firmware version ' +
            '(GetFirmwareInfo did not answer on any of 26 reads). Nothing was armed. Unplug the camera, ' +
            'let it finish starting up, plug it back in and try again.',
          hint:
            'Nothing that could change the camera was sent. Unplug it, let it finish starting up, ' +
            'plug it back in and try again; a camera that reports its firmware version is read normally.',
        },
      }),
    );

    const text = container.textContent;
    expect(text).toContain('Not identified: this page cannot tell which build the camera runs.');
    expect(text).toContain('Builds before 0.8.0.0 are outside what the slots page supports');
    /* The page does not blame the camera for not reporting, or send the user to unplug it first. */
    expect(text).not.toContain('did not report its firmware version');
    expect(text).not.toContain('refusing to read the device info');
    /* The re-plug advice is still there, as the secondary hint, after the statement of what the page covers. */
    expect(text).toContain('If the camera runs a supported build, it may only be starting up.');
    expect(text.indexOf('Builds before 0.8.0.0')).toBeLessThan(text.indexOf('Unplug it'));
    expect(container.querySelector('table')).toBeNull();
    unmount();
  });

  it('still states the 0.8.0.0 limit when the refusal has no hint to add', () => {
    const { container, unmount } = view(
      panel({
        refusal: { code: 'device/version-unknown', message: 'no version', hint: null },
      }),
    );

    expect(container.textContent).toContain(
      'Builds before 0.8.0.0 are outside what the slots page supports',
    );
    expect(container.textContent).not.toContain('it may only be starting up');
    unmount();
  });

  it('keeps the table a real, labelled table on a phone, with no unnamed control', () => {
    const { container, unmount } = view(panel({ plan: slotPlan(true), report: slotReport(base) }));

    const table = container.querySelector('table');
    expect(table?.classList.contains('table-cards')).toBe(true);
    expect(table?.querySelector('caption')?.textContent).toContain('Each firmware bank');
    expect(container.querySelectorAll('th[scope="col"]')).toHaveLength(7);
    expect(container.querySelectorAll('th[scope="row"]')).toHaveLength(3);
    expect(container.querySelectorAll('[role="button"]')).toHaveLength(0);
    for (const button of container.querySelectorAll('button')) {
      expect(button.textContent.trim().length, 'a button has no accessible name').toBeGreaterThan(
        0,
      );
    }
    unmount();
  });
});

describe('the slot page in the app shell', () => {
  it('mounts at #/slots, marks its nav link current, and offers Read slots', () => {
    window.location.hash = '#/slots';
    const { container, unmount } = render(<App support={READY} />);

    const current = container.querySelector('[aria-current="page"]');
    expect(current?.textContent).toBe('Firmware slots');
    expect(buttonByText(container, 'Read slots').disabled).toBe(true);
    expect(document.title).toBe('Seek Thermal Firmware — Firmware slots (WebUSB)');
    unmount();
  });

  it('issues every id once, and gives every visible control a real label, on #/slots', () => {
    window.location.hash = '#/slots';
    const { container, unmount } = render(<App support={READY} />);

    /* A duplicate id breaks every label and aria-labelledby on the page. */
    const ids = [...container.querySelectorAll('[id]')].map((node) => node.id);
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);

    /* The file pickers' inputs are the browser's dialog, not a control. */
    const controls = [...container.querySelectorAll<HTMLElement>('input, select, textarea')].filter(
      (control) => control.getAttribute('aria-hidden') !== 'true',
    );
    for (const control of controls) {
      expect(container.querySelector(`label[for="${control.id}"]`), control.id).toBeTruthy();
    }
    unmount();
  });
});
