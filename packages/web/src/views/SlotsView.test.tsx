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
  emptySlotView,
  flashedSlot,
  preparedSlot,
  slotEntry,
  slotPlan,
  slotReport,
  slotView,
} from '../test-slots';
import { buildSlotPlan, getProfile } from '@seek-fw/core';
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
    fillWithBankImage: vi.fn((_key: SlotKey) => Promise.resolve()),
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
        source: null,
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

  it('shows the 1.3.0.8 FF image as writable to recovery R: its staging in words, what is stored, and why only R', () => {
    const report = slotReport(base);
    const api = panel({
      plan: slotPlan(true),
      report,
      pending: {
        key: 'r',
        kind: 'plain',
        fileName: 'ff.bin',
        source: null,
        plan: {
          ...preparedSlot('r', 'plain', new Uint8Array(0x6000)),
          staging: 'two-stream',
          storedForm: 'two-stream-fold',
          expectedStored: new Uint8Array(0x10000),
          warnings: [
            'This is the 1.3.0.8 FF (16 Hz) image. It is staged as the image XOR two keystreams.',
            'The 2014 bootloader rejects this build at banks A and B, so only the recovery bank R takes it.',
          ],
        },
        report,
      },
    });
    const { container, unmount } = view(api);

    expect(container.textContent).toContain('Prepared for recovery R at 0x14070000');
    expect(container.textContent).toContain(
      "a decrypted image — folded through the FF build's two keystreams before it is staged",
    );
    expect(container.textContent).toContain(
      'the 1.3.0.8 FF image folded through two keystreams — the camera stores the plain image, not these bytes',
    );
    expect(container.textContent).toContain(
      '65,536 B predicted — the plain image the payload folds to, not the payload itself',
    );
    expect(container.textContent).toContain('only the recovery bank R takes it');

    act(() => {
      buttonByText(container, 'Write to recovery R…').click();
    });
    const node = dialog();
    expect(node).not.toBeNull();
    expect(node?.textContent).toContain('This is the 1.3.0.8 FF (16 Hz) image.');
    expect(node?.textContent).toContain('rejects its word sum at banks A and B');
    /* Recovery's own tick still stands in the way of the write. */
    expect(buttonByText(document.body, 'Yes — write to recovery R').disabled).toBe(true);
    act(() => {
      document.body.querySelector<HTMLInputElement>('#slot-write-ack')?.click();
    });
    act(() => {
      buttonByText(document.body, 'Yes — write to recovery R').click();
    });
    expect(api.write).toHaveBeenCalledWith(true);
    unmount();
  });

  it('does not explain the FF image in the dialog of any other prepared write', () => {
    const report = slotReport(base);
    const api = panel({
      plan: slotPlan(true),
      report,
      pending: {
        key: 'r',
        kind: 'raw',
        fileName: 'raw.bin',
        source: null,
        plan: preparedSlot('r', 'raw', new Uint8Array(16)),
        report,
      },
    });
    const { container, unmount } = view(api);
    act(() => {
      buttonByText(container, 'Write to recovery R…').click();
    });
    expect(dialog()?.textContent).not.toContain('1.3.0.8 FF');
    unmount();
  });

  it('on a 1.3.0.8 plan, says beside each bank where the FF image goes, and explains the two builds', () => {
    const realPlan = buildSlotPlan(getProfile('legacy-auth'), '1.3.0.8');
    const report: SlotsReport = {
      ...slotReport(base),
      plan: realPlan,
      slots: realPlan.slots.map((entry) => slotView(base, entry.key, { entry })),
    };
    const { container, unmount } = view(panel({ plan: realPlan, report }));

    const rows = bankRows(container);
    expect(rows[0]?.textContent).toContain('FF (16 Hz) image is refused here');
    expect(rows[1]?.textContent).toContain('FF (16 Hz) image is refused here');
    expect(rows[2]?.textContent).toContain('Takes the 1.3.0.8 FF (16 Hz) image too');
    expect(rows[2]?.textContent).toContain('the only bank that does');
    /* The plan's own note states the rule, and the page explains it once more in words. */
    expect(container.textContent).toContain('writes the FF image to bank R only');
    expect(container.textContent).toContain('The FF image goes to the recovery bank R only');
    /* The flash controls on every bank are on: the image decides, not the version. */
    expect(buttonByText(rows[2] as HTMLElement, 'Flash decrypted image…').disabled).toBe(false);
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
        source: null,
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

/* ==================================================================== *
 * An empty bank: a state, not a fault
 * ==================================================================== */

describe('SlotsView: an empty bank', () => {
  it('shows it as empty, says nothing is decrypted from it and that it can be written, and keeps every action', () => {
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base, null, ['b']) }),
    );

    const row = bankRows(container)[1] as HTMLElement;
    expect(row.textContent).toContain('empty');
    expect(row.textContent).toContain('header window reads as all 0xFF');
    expect(row.textContent).toContain('writing it overwrites no firmware');
    expect(row.textContent).toContain('Can be written. an empty bank is written like a used one');
    /* Nothing to boot, and no verdict on an image that is not there. */
    expect(row.textContent).toContain('nothing to boot');
    expect(row.textContent).not.toContain('not bootable');
    /* Dump and both flashes are available: an empty bank is not an error state. */
    expect(buttonByText(row, 'Dump').disabled).toBe(false);
    expect(buttonByText(row, 'Flash decrypted image…').disabled).toBe(false);
    expect(buttonByText(row, 'Flash raw bytes…').disabled).toBe(false);
    /* A bank that holds an image is shown as before. */
    expect(bankRows(container)[0]?.textContent).toContain('4.9.1.5');
    expect(bankRows(container)[0]?.textContent).not.toContain('header window reads as all 0xFF');
    unmount();
  });

  it('says an empty bank cannot be written where the plan says so, and greys the flash actions with that reason', () => {
    const report = slotReport(base, null, ['b']);
    const unwritable: SlotsReport = {
      ...report,
      slots: report.slots.map((candidate) =>
        candidate.entry.key === 'b'
          ? emptySlotView(base, 'b', {
              entry: slotEntry('b', {
                emptyBank: {
                  writable: { supported: false, reason: 'no staging form for an empty bank' },
                  why: 'no staging form for an empty bank',
                },
              }),
            })
          : candidate,
      ),
    };
    const { container, unmount } = view(panel({ plan: slotPlan(true), report: unwritable }));

    const row = bankRows(container)[1] as HTMLElement;
    expect(row.textContent).toContain(
      'Cannot be written on this build: no staging form for an empty bank',
    );
    expect(buttonByText(row, 'Flash decrypted image…').disabled).toBe(true);
    expect(buttonByText(row, 'Flash raw bytes…').disabled).toBe(true);
    expect(row.textContent).toContain('This bank is empty and cannot be written on this build');
    /* A dump is a read and stays allowed. */
    expect(buttonByText(row, 'Dump').disabled).toBe(false);
    unmount();
  });

  it('offers "Use the booted bank\'s image" on the empty bank only, labelled, and prepares it on click', () => {
    const api = panel({ plan: slotPlan(true), report: slotReport(base, null, ['b']) });
    const { container, unmount } = view(api);

    const rows = bankRows(container);
    expect(buttonsIn(rows[0] as HTMLElement)).not.toContain("Use the booted bank's image");
    expect(buttonsIn(rows[2] as HTMLElement)).not.toContain("Use the booted bank's image");
    const row = rows[1] as HTMLElement;
    const button = buttonByText(row, "Use the booted bank's image");
    expect(button.disabled).toBe(false);
    /* Labelled: where the image comes from, that it is the bank the camera boots, and that nothing is sent yet. */
    expect(row.textContent).toContain(
      'Copies the firmware slot A holds (4.9.1.5) into this empty bank',
    );
    expect(row.textContent).toContain('a second slot with the same firmware');
    expect(row.textContent).toContain('That is the bank the camera boots now.');
    expect(row.textContent).toContain('You review the plan before anything is sent.');

    act(() => {
      button.click();
    });
    expect(api.fillWithBankImage).toHaveBeenCalledWith('b');
    expect(api.write).not.toHaveBeenCalled();
    unmount();
  });

  it('names the first bank that holds an image when the camera names no booted bank', () => {
    const report = slotReport({ ...base, boot: null }, null, ['b']);
    const unnamed: SlotsReport = {
      ...report,
      slots: report.slots.map((candidate) => ({ ...candidate, active: false })),
    };
    const { container, unmount } = view(panel({ plan: slotPlan(true), report: unnamed }));

    const row = bankRows(container)[1] as HTMLElement;
    expect(buttonsIn(row)).toContain("Use slot A's image");
    expect(buttonsIn(row)).not.toContain("Use the booted bank's image");
    expect(row.textContent).toContain('The camera does not say which bank it boots');
    /* Every bank needs the tick then, an empty one too, and the button says so. */
    expect(row.textContent).toContain(
      'The camera does not name its booted bank: writing it asks for an extra confirmation.',
    );
    unmount();
  });

  it('offers no image source when no other bank holds a decrypted image', () => {
    const all = slotReport(base, null, ['a', 'b', 'r']);
    const { container, unmount } = view(panel({ plan: slotPlan(true), report: all }));
    for (const row of bankRows(container)) {
      expect(buttonsIn(row).some((text) => text.startsWith('Use '))).toBe(false);
    }
    unmount();
  });

  it('greys the source button out with the reason when the camera is not connected', () => {
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base, null, ['b']) }),
      false,
    );
    const row = bankRows(container)[1] as HTMLElement;
    expect(buttonByText(row, "Use the booted bank's image").disabled).toBe(true);
    expect(row.textContent).toContain('Connect the camera first.');
    unmount();
  });

  it('shows the prepared write into an empty bank as such, with where the image came from', () => {
    const report = slotReport(base, null, ['b']);
    const api = panel({
      plan: slotPlan(true),
      report,
      pending: {
        key: 'b',
        kind: 'plain',
        fileName: 'seek-slot-A-v4.9.1.5-decrypted-eeeeeeee.bin',
        plan: preparedSlot('b', 'plain', new Uint8Array(0x10000), true),
        report,
        source: 'slot A, the bank the camera boots now (4.9.1.5)',
      },
    });
    const { container, unmount } = view(api);

    expect(container.textContent).toContain('Prepared for slot B at 0x14060000');
    expect(container.textContent).toContain('Image taken from');
    expect(container.textContent).toContain('slot A, the bank the camera boots now (4.9.1.5)');
    expect(container.textContent).toContain(
      'slot B is empty: it holds no image, so this write overwrites no firmware',
    );

    act(() => {
      buttonByText(container, 'Write to slot B…').click();
    });
    expect(dialog()?.textContent).toContain(
      'slot B is empty: it holds no image, so no firmware is overwritten.',
    );
    /* Slot A is booted and B is not, so no tick is asked for: the rule is the one for a used bank. */
    expect(document.body.querySelector('#slot-write-ack')).toBeNull();
    act(() => {
      buttonByText(document.body, 'Yes — write to slot B').click();
    });
    expect(api.write).toHaveBeenCalledWith(false);
    unmount();
  });

  it('a write into an empty bank still asks for the tick where the camera names no booted bank', () => {
    const report = slotReport({ ...base, boot: null }, null, ['b']);
    const api = panel({
      plan: slotPlan(true),
      report,
      pending: {
        key: 'b',
        kind: 'plain',
        fileName: 'image.bin',
        plan: preparedSlot('b', 'plain', new Uint8Array(0x10000), true),
        report,
        source: null,
      },
    });
    const { container, unmount } = view(api);

    act(() => {
      buttonByText(container, 'Write to slot B…').click();
    });
    expect(dialog()?.textContent).toContain('slot B is empty');
    expect(buttonByText(document.body, 'Yes — write to slot B').disabled).toBe(true);
    act(() => {
      document.body.querySelector<HTMLInputElement>('#slot-write-ack')?.click();
    });
    act(() => {
      buttonByText(document.body, 'Yes — write to slot B').click();
    });
    expect(api.write).toHaveBeenCalledWith(true);
    unmount();
  });

  it('says after a commit that the bank was empty, so no firmware was overwritten', () => {
    const { container, unmount } = view(
      panel({
        plan: slotPlan(true),
        report: slotReport(base),
        outcome: {
          key: 'b',
          fileName: 'fw.bin',
          result: flashedSlot('b', true),
          targetEmpty: true,
        },
      }),
    );
    expect(container.textContent).toContain(
      'Slot B was empty before this write, so no firmware was overwritten.',
    );
    expect(container.textContent).toContain('NOW UNPLUG AND REPLUG THE CAMERA.');
    unmount();
  });

  it('explains empty banks and the one-click source in "What these buttons do"', () => {
    const { container, unmount } = view(panel({ plan: slotPlan(true), report: slotReport(base) }));
    expect(container.textContent).toContain('An empty bank');
    expect(container.textContent).toContain("Use the booted bank's image");
    unmount();
  });
});
