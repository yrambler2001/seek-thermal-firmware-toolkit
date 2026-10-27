/**
 * The firmware-slot page, rendered against a stub of its panel.
 *
 * What is pinned: a build below 0.8.0.0 shows its reason and no bank action;
 * one row per bank, the booted one marked; every disabled action says why in
 * words; a prepared write shows what it changes and needs the tick for the
 * booted bank; a commit says to unplug and replug; and the table, the buttons
 * and the phone layout keep the accessibility the other views have.
 */

import type * as CoreModule from '@seek-fw/core';
import { act } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

/*
 * The camera-wide verdict (core's `writeBannerOf`, which the banner and every row's flash controls read) is
 * tested in core and in SlotsView.verdicts.test.tsx. The fake camera this file reads is one the key derivation
 * refuses (its booted bank decrypts under no key), so these tests, which are about one row's own controls and
 * words, hold the verdict at "writable" unless a test sets `cameraVerdict.held` (the banner tests do).
 */
const cameraVerdict = vi.hoisted(() => ({ held: null as string | null | undefined }));
/* The boot warning core makes from a report (boot-choice.ts). Left unset, the real one runs; a test sets it. */
const bootWarning = vi.hoisted((): { value: unknown } => ({ value: undefined }));
vi.mock('@seek-fw/core', async (importOriginal) => {
  const actual = await importOriginal<typeof CoreModule>();
  return {
    ...actual,
    writeBannerOf: (state: Parameters<typeof actual.writeBannerOf>[0]) =>
      cameraVerdict.held === undefined ? actual.writeBannerOf(state) : cameraVerdict.held,
    fpsBootWarningOf: (...args: Parameters<typeof actual.fpsBootWarningOf>) =>
      bootWarning.value === undefined ? actual.fpsBootWarningOf(...args) : bootWarning.value,
  };
});
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
  readSlotState,
  slotEntry,
  PLAIN_R_2016,
  slotPlan,
  slotReport,
  slotReport2016,
  slotView,
} from '../test-slots';
import { buildSlotPlan, getProfile } from '@seek-fw/core';
import type {
  DeviceState,
  FpsEveryBankPlan,
  FpsPatchResult,
  FpsPlan,
  SlotKey,
  SlotsReport,
  WriteAction,
  WriteBackup,
} from '@seek-fw/core';
import { SlotsView, backupLine } from './SlotsView';

/** What a prepared write from a picked file is, for the backup's name. */
const FLASH_ACTION: WriteAction = { kind: 'flash', input: 'plain', fileName: 'fw.bin' };

/** What every outcome carries beside the write's result: the zip saved first, the action, no restore. */
/** The zip a write saved first, as core builds it. */
const BACKUP: WriteBackup = {
  name: 'seek_backup_2026-10-26T12-00-00Z_SN-1_v4.9.1.5_bank-B_before-flash',
  fileName: 'seek_backup_2026-10-26T12-00-00Z_SN-1_v4.9.1.5_bank-B_before-flash.zip',
  savedAt: '2026-10-26T12:00:00.000Z',
  serial: 'SN-1',
  firmware: '4.9.1.5',
  action: FLASH_ACTION,
  follows: 'the write',
  banks: [],
  textName: 'README.txt',
  text: '',
  zip: new Uint8Array(10),
};

/** What every outcome carries beside the write's result: the zip saved first, the action, no restore. */
const OUTCOME_EXTRA = { backup: BACKUP, action: FLASH_ACTION, restore: null } as const;

let base: DeviceState;

beforeAll(async () => {
  base = await fakeDeviceState();
});

afterEach(() => {
  window.location.hash = '';
  cameraVerdict.held = null;
  bootWarning.value = undefined;
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
    copyBank: vi.fn((_from: SlotKey, _to: SlotKey) => Promise.resolve()),
    pickRestore: vi.fn((_key: SlotKey, _file: File) => Promise.resolve()),
    write: vi.fn((_acknowledged: boolean) => Promise.resolve()),
    discardPending: vi.fn(),
    cancel: vi.fn(),
    unlockNote: false,
    fpsOutcome: null,
    fpsEveryOutcome: null,
    planFps: vi.fn((): FpsPlan => ({ status: 'refused', reason: 'no read yet' })),
    patchFps: vi.fn((_key: SlotKey, _acknowledged: boolean) => Promise.resolve()),
    planEveryFps: vi.fn((): FpsEveryBankPlan | null => null),
    patchEveryFps: vi.fn((_acknowledged: boolean) => Promise.resolve()),
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
  it('shows the unlock note after a slot action that sent the token, and no note otherwise', () => {
    const quiet = view(panel({ plan: slotPlan(true), report: slotReport(base) }));
    expect(quiet.container.textContent).not.toContain('stays unlocked');
    quiet.unmount();

    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base), unlockNote: true }),
    );
    const note = Array.from(container.querySelectorAll('[data-slot="alert"]')).find((el) =>
      el.textContent.includes('stays unlocked'),
    );
    expect(note?.textContent).toContain('the camera stays unlocked until a power cycle');
    expect(note?.textContent).toContain('power-cycle it before you use them');
    /* information only: the banks and the write controls are still offered */
    expect(bankRows(container)).toHaveLength(3);
    unmount();
  });

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
    cameraVerdict.held = undefined;
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

  it('shows the 2014 plaintext chain as stored plain, not as a refusal, with A, B and R still offered', () => {
    /* The bench Compact PIR206 (1.3.0.0, 2014 chain), as the analysis reads it: A and R hold the
     * image stored plain and name no key, so the page must not say no bank can be written (TESTING.md 42.13). */
    const plainState = {
      ...base,
      version: '1.3.0.0',
      plainChain: true,
      keyTable: null,
      deviceKeySlot: null,
      storeKey: { name: 'Key B', key: null, programmed: false },
      bankWriteRefusals: [],
    } as unknown as DeviceState;
    const plainReport = slotReport(plainState);
    const report: SlotsReport = {
      ...plainReport,
      slots: plainReport.slots.map((v) =>
        v.state !== null && v.entry.key !== 'b'
          ? { ...v, state: { ...v.state, keyName: null } }
          : v,
      ),
    };
    const verdict = writeKeysVerdictOf(report);
    expect(verdict.refusal).toBeNull();
    expect(verdict.form).toBe('plain');

    const { container, unmount } = view(panel({ plan: slotPlan(true), report }));
    const text = container.textContent;
    expect(text).not.toContain('No bank of this camera can be written');
    expect(text).not.toContain('unknown key');
    expect(text).toContain(
      'the 2014 plaintext chain: every bank is stored plain, so none holds a key',
    );
    const rows = bankRows(container);
    expect(rows[0]?.textContent).toContain('none (plaintext)');
    expect(rows[2]?.textContent).toContain('none (plaintext)');
    unmount();
  });

  it('shows one row per bank, with the booted bank marked and every column filled', () => {
    const { container, unmount } = view(panel({ plan: slotPlan(true), report: slotReport(base) }));

    const rows = bankRows(container);
    expect(rows).toHaveLength(3);
    expect(rows[0]?.textContent).toContain('Slot A');
    expect(rows[0]?.textContent).toContain('0x14050000');
    expect(rows[0]?.textContent).toContain('booted now');
    expect(rows[1]?.textContent).toContain('not booted');
    expect(rows[2]?.textContent).toContain('Recovery R');
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
      'Recovery R: writing it asks for an extra confirmation.',
    );
    /* Once in the row, not under each flash button (TESTING.md 42.87). */
    for (const row of [rows[0], rows[2]]) {
      expect(row?.textContent.match(/extra confirmation/g)).toHaveLength(1);
    }
    unmount();
  });

  it('labels an FF image in recovery R as recovery only, not as a skipped slot', () => {
    const ffInR = slotView(base, 'r', {
      state: readSlotState(base, 'r', {
        bootable: false,
        bootability: 'recovery-only',
        accepts: false,
        keyName: null,
      }),
      active: false,
    });
    const report: SlotsReport = {
      state: base,
      plan: slotPlan(true),
      slots: [slotView(base, 'a'), slotView(base, 'b', { active: false }), ffInR],
    };
    const { container, unmount } = view(panel({ plan: slotPlan(true), report }));

    const row = bankRows(container)[2] as HTMLElement;
    expect(row.textContent).toContain(
      'recovery only — R runs when A and B hold nothing the bootloader takes (measured on a camera for an earlier form of this image); whether this form starts is untested',
    );
    expect(row.textContent).not.toContain('skipped at boot');
    expect(row.textContent).not.toContain('not bootable');
    unmount();
  });

  it('says the booted bank boots now on the 2014 plaintext chain, as on every line (TESTING.md 42.89)', () => {
    const locked = {
      ...base,
      version: '1.3.0.8',
      profile: getProfile('legacy-auth'),
    } as DeviceState;
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(locked) }),
    );

    const rows = bankRows(container);
    expect(rows[0]?.textContent).toContain('booted now');
    expect(rows[1]?.textContent).toContain('not booted');
    expect(rows[0]?.textContent).toContain(
      'Booted now: writing it asks for an extra confirmation.',
    );
    /* the 42.10 hedge is gone: 42.56 measured the active-slot word as the bank that ran */
    expect(container.textContent).not.toContain('named booted');
    expect(container.textContent).not.toContain('recovery R can run instead');
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
        what: 'fw_decrypted.bin',
        plan: preparedSlot('a', 'plain', bytes),
        report,
        source: null,
        action: FLASH_ACTION,
        restore: null,
      },
    });
    const { container, unmount } = view(api);

    expect(container.textContent).toContain('Prepared for Slot A at 0x14050000');
    expect(container.textContent).toContain('Nothing has been sent to the camera yet.');
    expect(container.textContent).toContain('Read before writing:');
    expect(container.textContent).toContain('What changes in Slot A');
    expect(container.textContent).toContain('4.9.1.6');

    act(() => {
      buttonByText(container, 'Write to Slot A…').click();
    });
    expect(dialog()).not.toBeNull();
    const confirm = buttonByText(document.body, 'Yes — write to Slot A');
    expect(confirm.disabled).toBe(true);

    act(() => {
      document.body.querySelector<HTMLInputElement>('#slot-write-ack')?.click();
    });
    act(() => {
      buttonByText(document.body, 'Yes — write to Slot A').click();
    });
    expect(api.write).toHaveBeenCalledWith(true);
    unmount();
  });

  it('an image that is not the build the camera runs: the warning is in "Read before writing" and in the dialog, and the write stays allowed (TESTING.md 42.104)', () => {
    const report = slotReport(base);
    const text =
      'This image is firmware 4.9.1.6; the camera runs 4.9.1.5. Whether this camera takes a ' +
      'different build, and runs it, has not been checked.';
    const api = panel({
      plan: slotPlan(true),
      report,
      pending: {
        key: 'b',
        kind: 'plain',
        what: 'other-build.bin',
        plan: {
          ...preparedSlot('b', 'plain', new Uint8Array(0x10000)),
          warnings: [text],
          imageBuild: { code: 'other-version', image: '4.9.1.6', camera: '4.9.1.5', text },
        },
        report,
        source: null,
        action: FLASH_ACTION,
        restore: null,
      },
    });
    const { container, unmount } = view(api);

    const readFirst = [...container.querySelectorAll('li')].map((li) => li.textContent);
    expect(readFirst).toContain(text);
    act(() => {
      buttonByText(container, 'Write to Slot B…').click();
    });
    const node = dialog();
    expect(node?.querySelector('#slot-write-confirm-warnings')?.textContent).toBe(text);
    /* People's words only: the code name is for JSON. */
    expect(node?.textContent).not.toContain('other-version');
    /* Warned, never gated: bank B needs no tick, and the confirm writes. */
    const confirm = buttonByText(document.body, 'Yes — write to Slot B');
    expect(confirm.disabled).toBe(false);
    act(() => {
      confirm.click();
    });
    expect(api.write).toHaveBeenCalledWith(false);
    unmount();
  });

  it('the same build: the dialog has no build line', () => {
    const report = slotReport(base);
    const api = panel({
      plan: slotPlan(true),
      report,
      pending: {
        key: 'b',
        kind: 'plain',
        what: 'same-build.bin',
        plan: preparedSlot('b', 'plain', new Uint8Array(0x10000)),
        report,
        source: null,
        action: FLASH_ACTION,
        restore: null,
      },
    });
    const { container, unmount } = view(api);
    act(() => {
      buttonByText(container, 'Write to Slot B…').click();
    });
    expect(dialog()?.querySelector('#slot-write-confirm-warnings')).toBeNull();
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
        what: 'ff.bin',
        source: null,
        action: FLASH_ACTION,
        restore: null,
        plan: {
          ...preparedSlot('r', 'plain', new Uint8Array(0x6000)),
          staging: 'key-a-keystream',
          storedForm: 'key-b-ciphertext',
          expectedStored: new Uint8Array(0x10000),
          warnings: [
            'UNTESTED: no genuine bootloader for this build is in the corpus, so the boot is not measured.',
          ],
          /* As core splits them (TESTING.md 42.88): what the image is, a note of this write; the bank's and
           * the camera's notes, shown elsewhere in the section, not again here. */
          notes: [
            {
              source: 'write',
              text: "The camera's own answers say it runs the 16 Hz FF build: the camera answers 0, 0, 1.",
            },
            { source: 'bank', text: 'Recovery bank note.' },
            { source: 'camera', text: 'Camera-wide note.' },
          ],
        },
        report,
      },
    });
    const { container, unmount } = view(api);

    expect(container.textContent).toContain('Prepared for Recovery R at 0x14070000');
    /* "Read as" says what the file is, and "Staging" how it is sent, so the vendor form is said once. */
    expect(container.textContent).toContain('Read asa decrypted 1.3.0.8 FF imageStaging');
    expect(container.textContent).toContain(
      'the 1.3.0.8 FF image as the vendor app stages it (XOR Key A) — the 16 Hz build stores it under Key B, not these bytes',
    );
    expect(container.textContent).toContain(
      '65,536 B predicted — the image XOR Key B, not the payload itself',
    );
    expect(container.textContent).toContain('UNTESTED: no genuine bootloader');
    /* "Read before writing" lists the warnings, then this write's own note as a note; the bank's and the
     * camera's notes are not repeated there (TESTING.md 42.88). */
    const readFirst = [...container.querySelectorAll('li')].map((li) => li.textContent);
    expect(readFirst).toContain(
      "Note: The camera's own answers say it runs the 16 Hz FF build: the camera answers 0, 0, 1.",
    );
    /* The vendor form is the Staging row's alone (TESTING.md 42.89). */
    expect(container.textContent.match(/as the vendor app stages it/g)).toHaveLength(1);
    expect(readFirst.filter((text) => text.includes('Recovery bank note.'))).toEqual([]);
    expect(readFirst.filter((text) => text.includes('Camera-wide note.'))).toEqual([]);

    act(() => {
      buttonByText(container, 'Write to Recovery R…').click();
    });
    const node = dialog();
    expect(node).not.toBeNull();
    /* The dialog says the plan's warnings, as "Read before writing" does (TESTING.md 42.109). */
    expect(node?.querySelector('#slot-write-confirm-warnings')?.textContent).toBe(
      'UNTESTED: no genuine bootloader for this build is in the corpus, so the boot is not measured.',
    );
    /* Recovery's own tick still stands in the way of the write. */
    expect(buttonByText(document.body, 'Yes — write to Recovery R').disabled).toBe(true);
    act(() => {
      document.body.querySelector<HTMLInputElement>('#slot-write-ack')?.click();
    });
    act(() => {
      buttonByText(document.body, 'Yes — write to Recovery R').click();
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
        what: 'raw.bin',
        source: null,
        action: FLASH_ACTION,
        restore: null,
        plan: preparedSlot('r', 'raw', new Uint8Array(16)),
        report,
      },
    });
    const { container, unmount } = view(api);
    act(() => {
      buttonByText(container, 'Write to Recovery R…').click();
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
    /* In words: the key it is stored under, not its name (TESTING.md 42.110). */
    for (const row of rows) {
      expect(row.textContent).toContain(
        'goes here in the form the vendor app sends it, and the camera stores it under its own key',
      );
      expect(row.textContent).not.toMatch(/TESTING|\(42\.\d+\)|token form/);
    }
    /* The plan's own note states the rule, and the page explains it once more in words. */
    expect(container.textContent).toContain('UNTESTED');
    expect(container.textContent).toContain('The camera tells them apart itself');
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
        what: 'raw.bin',
        plan: preparedSlot('b', 'raw', new Uint8Array(16)),
        report,
        source: null,
        action: FLASH_ACTION,
        restore: null,
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
        outcome: { key: 'b', what: 'fw.bin', result: flashedSlot('b', true), ...OUTCOME_EXTRA },
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
        outcome: {
          key: 'b',
          what: 'fw.bin',
          result: flashedSlot('b', false),
          ...OUTCOME_EXTRA,
        },
      }),
    );

    expect(container.textContent).toContain('the read-back does NOT match what was written.');
    unmount();
  });

  it('keeps the bank table on screen after a write, with the outcome above the banks', () => {
    const { container, unmount } = view(
      panel({
        plan: slotPlan(true),
        report: slotReport(base),
        outcome: { key: 'b', what: 'fw.bin', result: flashedSlot('b', true), ...OUTCOME_EXTRA },
      }),
    );

    expect(bankRows(container)).toHaveLength(3);
    expect(container.textContent).toContain('reads back as written');
    expect(container.textContent).not.toContain('Press Read slots');
    unmount();
  });

  it('after a write that does not read back, the table still shows the banks and the outcome says the read-back does NOT match', () => {
    const { container, unmount } = view(
      panel({
        plan: slotPlan(true),
        report: slotReport(base),
        outcome: {
          key: 'b',
          what: 'fw.bin',
          result: flashedSlot('b', false),
          ...OUTCOME_EXTRA,
        },
      }),
    );

    expect(bankRows(container)).toHaveLength(3);
    expect(container.textContent).toContain('the read-back does NOT match what was written.');
    expect(container.textContent).not.toContain('reads back as written');
    unmount();
  });

  it('with no read after a write, shows no bank table and no bank as written, and asks for Read slots', () => {
    const { container, unmount } = view(
      panel({
        plan: slotPlan(true),
        report: null,
        outcome: null,
      }),
    );

    expect(bankRows(container)).toHaveLength(0);
    expect(container.textContent).not.toContain('reads back as written');
    expect(container.textContent).toContain('Press Read slots');
    unmount();
  });

  it('names the refusal and offers nothing else when the camera will not name its build', () => {
    const { container, unmount } = view(
      panel({
        refusal: {
          code: 'family/unsupported',
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
    expect(current?.textContent).toBe('Work with firmware slots');
    expect(buttonByText(container, 'Read slots').disabled).toBe(true);
    expect(document.title).toBe('Seek Thermal Firmware — Work with firmware slots (WebUSB)');
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

  it('offers on every row "Copy to" each other bank, filled or empty, labelled, and prepares it on click', () => {
    const api = panel({ plan: slotPlan(true), report: slotReport(base, null, ['b']) });
    const { container, unmount } = view(api);

    const rows = bankRows(container);
    const rowA = rows[0] as HTMLElement;
    const rowB = rows[1] as HTMLElement;
    const rowR = rows[2] as HTMLElement;
    expect(buttonsIn(rowA)).toEqual(
      expect.arrayContaining(['Copy to slot B', 'Copy to recovery R']),
    );
    expect(buttonsIn(rowA)).not.toContain('Copy to slot A');
    expect(buttonsIn(rowR)).toEqual(expect.arrayContaining(['Copy to slot A', 'Copy to slot B']));
    expect(buttonByText(rowA, 'Copy to slot B').disabled).toBe(false);
    expect(buttonByText(rowA, 'Copy to recovery R').disabled).toBe(false);
    expect(rowA.textContent).toContain(
      'Copies the firmware this bank holds, as this read decrypted it, into the bank you pick',
    );
    /* The empty bank has nothing to copy: its buttons are off, and say why once. */
    expect(buttonByText(rowB, 'Copy to slot A').disabled).toBe(true);
    expect(rowB.textContent).toContain('Slot B is empty: there is no image to copy.');
    expect(buttonsIn(rowA).some((text) => text.startsWith('Use '))).toBe(false);

    act(() => {
      buttonByText(rowA, 'Copy to slot B').click();
    });
    expect(api.copyBank).toHaveBeenCalledWith('a', 'b');
    expect(api.write).not.toHaveBeenCalled();
    unmount();
  });

  it('offers "Restore from full flash backup…" on each row, with what it takes', () => {
    const { container, unmount } = view(panel({ plan: slotPlan(true), report: slotReport(base) }));
    for (const row of bankRows(container)) {
      expect(buttonByText(row, 'Restore from full flash backup…').disabled).toBe(false);
      expect(row.textContent).toContain(
        'Pick a full flash backup: the 4 MiB image a J-Link reads, or a Preserve run file that holds the whole flash.',
      );
    }
    const input = container.querySelector<HTMLInputElement>('#slot-b-restore-file');
    expect(input?.accept).toContain('.zip');
    unmount();
  });

  it('greys the copy and restore buttons out with the reason when the camera is not connected', () => {
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base, null, ['b']) }),
      false,
    );
    const row = bankRows(container)[0] as HTMLElement;
    expect(buttonByText(row, 'Copy to slot B').disabled).toBe(true);
    expect(buttonByText(row, 'Restore from full flash backup…').disabled).toBe(true);
    expect(row.textContent).toContain('Connect the camera first.');
    unmount();
  });

  it('shows the prepared plan with what is saved first, and the write dialog names the zip', () => {
    const report = slotReport(base);
    const api = panel({
      plan: slotPlan(true),
      report,
      pending: {
        key: 'b',
        kind: 'plain',
        what: 'seek-slot-a-4.9.1.5-eeeeeeee-decrypted.bin',
        plan: preparedSlot('b', 'plain', new Uint8Array(0x100)),
        report,
        source: 'slot A at 0x14030000, firmware 4.9.1.5, as the slots read decrypted it',
        action: { kind: 'copy', from: 'a' },
        restore: null,
      },
    });
    const { container, unmount } = view(api);
    const text = container.textContent;
    expect(text).toContain('Saved first');
    expect(text).toContain(
      'Before anything is written, Slot B (as stored, and decrypted) is read again and saved in one zip',
    );
    expect(text).toContain('_bank-B_before-copy-from-A.zip');
    expect(text).toContain('The zip is downloaded automatically, before anything is sent.');
    expect(text).toContain('Image taken from');
    act(() => {
      buttonByText(container, 'Write to Slot B…').click();
    });
    expect(dialog()?.textContent).toContain(
      'Before anything is sent, Slot B is read again and saved as one zip download: seek_backup_<time>_',
    );
    unmount();
  });

  it('a restore’s result says whether the bank reads back as the backup stores it, and names the zip', () => {
    const { container, unmount } = view(
      panel({
        plan: slotPlan(true),
        report: slotReport(base),
        outcome: {
          key: 'b',
          what: 'seek-slot-b-4.9.1.5-aaaaaaaa-decrypted.bin',
          result: flashedSlot('b', true),
          backup: BACKUP,
          action: { kind: 'restore', fileName: 'whole.bin' },
          restore: { compared: true, equal: true, differing: 0, firstDiffering: null },
        },
      }),
    );
    expect(container.textContent).toContain(
      'Slot B reads back byte for byte as the backup stores it.',
    );
    expect(container.textContent).toContain(`Saved first, as a download: ${BACKUP.fileName}.`);
    unmount();
  });

  it('offers "Make N FPS in every bank" beside the per-bank buttons, and opens its one confirmation', () => {
    const offer = (key: SlotKey) =>
      ({
        key,
        name: `slot ${key.toUpperCase()}`,
        plan: {
          status: 'offer',
          patch: { id: 'x', version: '4.9.1.5' },
          fromHz: 9,
          toHz: 18,
          sites: [{ offset: 1, before: 0, after: 1 }],
          sumWord: { offset: 0x238, before: 0 },
        },
      }) as unknown as FpsEveryBankPlan['offers'][number];
    const everyPlan: FpsEveryBankPlan = {
      order: ['b', 'r', 'a'],
      offers: [offer('b'), offer('r'), offer('a')],
      others: [],
    };
    const api = panel({
      plan: slotPlan(true),
      report: slotReport(base),
      planEveryFps: vi.fn(() => everyPlan),
    });
    const { container, unmount } = view(api);
    const button = buttonByText(container, 'Make 18 FPS in every bank');
    expect(button.disabled).toBe(false);
    expect(container.textContent).toContain(
      'Patches slot B, then slot R, then slot A in one confirmation, the bank the camera boots now last',
    );
    act(() => {
      button.click();
    });
    const text = dialog()?.textContent ?? '';
    expect(text).toContain('Make every bank run at 18 FPS?');
    expect(text).toContain('They are written in this order: slot B, then slot R, then slot A.');
    expect(text).toContain('_bank-A-B-R_before-fps-patch-every-bank.zip');
    /* The booted bank and R are among them: the tick before the confirm. */
    expect(buttonByText(document.body, 'Yes — patch 3 banks').disabled).toBe(true);
    act(() => {
      document.body.querySelector<HTMLInputElement>('#slot-fps-every-ack')?.click();
    });
    act(() => {
      buttonByText(document.body, 'Yes — patch 3 banks').click();
    });
    expect(api.patchEveryFps).toHaveBeenCalledWith(true);
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
        what: 'seek-slot-a-4.9.1.5-eeeeeeee-decrypted.bin',
        plan: preparedSlot('b', 'plain', new Uint8Array(0x10000), true),
        report,
        source: 'slot A, the bank the camera boots now (4.9.1.5)',
        action: FLASH_ACTION,
        restore: null,
      },
    });
    const { container, unmount } = view(api);

    expect(container.textContent).toContain('Prepared for Slot B at 0x14060000');
    expect(container.textContent).toContain('Image taken from');
    expect(container.textContent).toContain('slot A, the bank the camera boots now (4.9.1.5)');
    expect(container.textContent).toContain(
      'Slot B is empty: it holds no image, so this write overwrites no firmware',
    );

    act(() => {
      buttonByText(container, 'Write to Slot B…').click();
    });
    expect(dialog()?.textContent).toContain(
      'Slot B is empty: it holds no image, so no firmware is overwritten.',
    );
    /* Slot A is booted and B is not, so no tick is asked for: the rule is the one for a used bank. */
    expect(document.body.querySelector('#slot-write-ack')).toBeNull();
    act(() => {
      buttonByText(document.body, 'Yes — write to Slot B').click();
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
        what: 'image.bin',
        plan: preparedSlot('b', 'plain', new Uint8Array(0x10000), true),
        report,
        source: null,
        action: FLASH_ACTION,
        restore: null,
      },
    });
    const { container, unmount } = view(api);

    act(() => {
      buttonByText(container, 'Write to Slot B…').click();
    });
    expect(dialog()?.textContent).toContain('Slot B is empty');
    expect(buttonByText(document.body, 'Yes — write to Slot B').disabled).toBe(true);
    act(() => {
      document.body.querySelector<HTMLInputElement>('#slot-write-ack')?.click();
    });
    act(() => {
      buttonByText(document.body, 'Yes — write to Slot B').click();
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
          what: 'fw.bin',
          result: flashedSlot('b', true),
          targetEmpty: true,
          ...OUTCOME_EXTRA,
        },
      }),
    );
    expect(container.textContent).toContain(
      'Slot B was empty before this write, so no firmware was overwritten.',
    );
    expect(container.textContent).toContain('NOW UNPLUG AND REPLUG THE CAMERA.');
    unmount();
  });

  it('explains empty banks, the copy and the restore, and the zip saved first, in "What these buttons do"', () => {
    const { container, unmount } = view(panel({ plan: slotPlan(true), report: slotReport(base) }));
    const text = container.textContent;
    expect(text).toContain('An empty bank');
    expect(text).toContain('Copy to recovery R');
    expect(text).toContain('Restore from full flash backup');
    expect(text).toContain('Every write saves its bank first');
    expect(text).toContain('one zip download');
    expect(text).not.toContain("Use the booted bank's image");
    unmount();
  });
});

describe('SlotsView: the frame-rate row action', () => {
  function offer(toHz: number): FpsPlan {
    return {
      status: 'offer',
      patch: { id: `compact_32k-test-to${String(toHz)}` },
      fromHz: 8,
      toHz,
      sites: [{ offset: 0xb964, before: 0x24, after: 0x22 }],
      sumWord: { offset: 0x238, before: 0 },
    } as unknown as FpsPlan;
  }

  it('offers Make 32 FPS on a bank whose own image the table patches, and opens the confirmation for it', () => {
    const planFps = vi.fn((): FpsPlan => offer(32));
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base), planFps }),
    );
    const rows = bankRows(container);
    expect(buttonsIn(rows[1] as HTMLElement)).toContain('Make 32 FPS');
    act(() => {
      buttonByText(rows[1] as HTMLElement, 'Make 32 FPS').click();
    });
    expect(dialog()?.textContent).toContain('Make Slot B run at 32 FPS?');
    unmount();
  });

  it('offers Make 18 FPS for the Compact PRO 4.9.1.15, with its note and its confirmation', () => {
    const measured = (): FpsPlan =>
      ({
        ...offer(18),
        patch: { id: 'compact_pro-4.9.1.15' },
        fromHz: 9,
      }) as unknown as FpsPlan;
    const planFps = vi.fn(measured);
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base), planFps }),
    );
    const rows = bankRows(container);
    expect(buttonsIn(rows[1] as HTMLElement)).toContain('Make 18 FPS');
    expect(rows[1]?.textContent).toContain(
      'Raises this bank from 9 Hz to 18 Hz by editing its bytes.',
    );
    act(() => {
      buttonByText(rows[1] as HTMLElement, 'Make 18 FPS').click();
    });
    expect(dialog()?.textContent).toContain('Make Slot B run at 18 FPS?');
    unmount();
  });

  it('says on the page which bank runs when a patched bank will not run, and the dialog names the fix', () => {
    bootWarning.value = {
      runs: 'r',
      word: 2,
      idle: ['a'],
      paragraphs: [
        'The camera boots recovery R. The boot-config word is 2, so the bootloader tries recovery R first.',
        'Slot A holds a frame-rate patch, but it does not run, so the patch does not take effect.',
        'Patch Recovery R too (the bank that runs): that is what makes the frame-rate patch take effect.',
      ],
    };
    const planFps = vi.fn((): FpsPlan => offer(32));
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base), planFps }),
    );
    expect(container.textContent).toContain('The camera boots recovery R.');
    expect(container.textContent).toContain('Patch Recovery R too (the bank that runs)');
    act(() => {
      buttonByText(bankRows(container)[1] as HTMLElement, 'Make 32 FPS').click();
    });
    const open = dialog();
    if (open === null) throw new Error('the confirmation is not open');
    expect(open.textContent).toContain('Patch Recovery R too (the bank that runs)');
    /* The warning states; the confirmation is not gated by it. */
    expect(buttonByText(open, 'Yes — patch Slot B').disabled).toBe(false);
    unmount();
  });

  it('on a 2016 Compact PRO, warns that recovery R’s 18 Hz patch does not run while the blank record runs slot A', async () => {
    /* The owner's 1.0.3.0 camera (TESTING.md 42.84): R patched to 18 Hz from this page, cfg[0] 0xFFFFFFFF,
     * slot A entered; the camera stayed at 9 Hz and the page said nothing. The warning is core's own
     * function on this report, with only "which image holds a patch" seamed (no patched 1.0.3.0 image is
     * in the repo). */
    const actual = await vi.importActual<typeof CoreModule>('@seek-fw/core');
    const report = slotReport2016(base);
    bootWarning.value = actual.fpsBootWarningOf(report, {
      heldBy: (plain) => (plain === PLAIN_R_2016 ? { hz: 18, what: 'compact_pro-1.0.3.0' } : null),
      patchBlock: () => null,
    });
    const planFps = vi.fn((): FpsPlan => offer(18));
    const { container, unmount } = view(panel({ plan: report.plan, report, planFps }));
    const text = container.textContent;
    expect(text).toContain(
      'The camera boots slot A. The boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, and it holds an image the bootloader accepts.',
    );
    expect(text).toContain(
      'Recovery R holds a frame-rate patch, but it does not run, so the patch does not take effect.',
    );
    expect(text).toContain(
      'Patch slot A too (the bank that runs): that is what makes the frame-rate patch take effect.',
    );
    /* The device panel names the next start; the write keys are the 2016 form, never the banner. */
    expect(text).toContain(
      'Slot A — the boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, and it holds an image the bootloader accepts',
    );
    expect(text).toContain('Staged as');
    expect(text).not.toContain('No bank of this camera can be written');
    /* Each bank's verdict comes from the check key: bootable, not "unknown". */
    expect(bankRows(container)[2]?.textContent).toContain('bootable — the bootloader can key it');
    unmount();
  });

  it('on a 2016 Compact PRO, says the staging note once for the camera and each acknowledgement once in its row (TESTING.md 42.87)', () => {
    /* core's real 1.0.3.0 plan: its notes and its bank entries. Before, every row carried "Staged: …", and
     * R's row said the acknowledgement three times (its note and under both flash buttons). */
    const fixture = slotReport2016(base);
    const plan = buildSlotPlan(getProfile('compact-2016'), '1.0.3.0');
    const report: SlotsReport = {
      ...fixture,
      plan,
      slots: fixture.slots.map((slotView) => ({
        ...slotView,
        entry: plan.slots.find((entry) => entry.key === slotView.entry.key) ?? slotView.entry,
      })),
    };
    const { container, unmount } = view(panel({ plan, report }));
    const text = container.textContent;
    expect(text.match(/Staged: the image, XORed with the xorshift128 keystream/g)).toHaveLength(1);
    const rows = bankRows(container);
    for (const row of rows) expect(row.textContent).not.toContain('Staged:');
    expect(rows[0]?.textContent.match(/extra confirmation|acknowledge/g)).toHaveLength(1);
    expect(rows[1]?.textContent).not.toMatch(/extra confirmation|acknowledge/);
    expect(rows[2]?.textContent.match(/extra confirmation|acknowledge/g)).toHaveLength(1);
    expect(rows[2]?.textContent).toContain(
      'Measured on a Compact PRO 1.0.3.0: recovery R took its own image',
    );
    expect(text).toContain('The booted bank named on this line is the bank the camera entered');
    expect(text).not.toContain('Where the page names');
    unmount();
  });

  it('on a 2016 Compact PRO, a write plan’s "Read before writing" repeats none of the camera’s or the bank’s notes (TESTING.md 42.88)', () => {
    /* Core's real 1.0.3.0 plan, and a write plan carrying its notes as core gives them: the camera's six and
     * the bank's own, with the one warning the booted bank's write has. Before, the list carried all of them
     * as "Note: …" while the same notes sat above the device panel. */
    const fixture = slotReport2016(base);
    const plan = buildSlotPlan(getProfile('compact-2016'), '1.0.3.0');
    const report: SlotsReport = {
      ...fixture,
      plan,
      slots: fixture.slots.map((slotView) => ({
        ...slotView,
        entry: plan.slots.find((entry) => entry.key === slotView.entry.key) ?? slotView.entry,
      })),
    };
    const pendingFor = (key: SlotKey, warnings: readonly string[]) => ({
      key,
      kind: 'plain' as const,
      what: 'stock-a.bin',
      source: null,
      action: FLASH_ACTION,
      restore: null,
      report,
      plan: {
        ...preparedSlot(key, 'plain', new Uint8Array(0xca88)),
        staging: 'slot-keystream-ciphertext' as const,
        warnings,
        notes: [
          ...(plan.slots.find((entry) => entry.key === key)?.notes ?? []).map((text) => ({
            source: 'bank' as const,
            text,
          })),
          ...plan.notes.map((text) => ({ source: 'camera' as const, text })),
        ],
      },
    });
    const warning =
      'Slot A is the bank the camera boots now: writing it asks you to acknowledge the risk, and the camera runs whatever it holds after the next power cycle.';
    const booted = view(panel({ plan, report, pending: pendingFor('a', [warning]) }));
    const text = booted.container.textContent;
    expect(plan.notes.length).toBeGreaterThan(0);
    expect(text).toContain('Read before writing:');
    const items = [...booted.container.querySelectorAll('[data-slot="alert"] li')].map(
      (li) => li.textContent,
    );
    expect(items).toEqual([warning]);
    /* Each camera note is on the page once: above the device panel, not again in the plan. */
    for (const note of plan.notes) expect(text.split(note)).toHaveLength(2);
    expect(text).not.toContain('Note: ');
    booted.unmount();

    /* Recovery R: its own note is on its row, so the plan does not say it again either. */
    const recovery = view(
      panel({
        plan,
        report,
        pending: pendingFor('r', ['Recovery R: writing it asks you to acknowledge the risk.']),
      }),
    );
    const rNote = plan.slots.find((entry) => entry.key === 'r')?.notes[0] ?? '';
    expect(rNote).toContain('Measured on a Compact PRO 1.0.3.0: recovery R took its own image');
    expect(recovery.container.textContent.split(rNote)).toHaveLength(2);
    recovery.unmount();

    /* B: no warning and no note of its own write, so no "Read before writing" at all. */
    const unbooted = view(panel({ plan, report, pending: pendingFor('b', []) }));
    expect(unbooted.container.textContent).not.toContain('Read before writing:');
    unbooted.unmount();
  });

  it('on a 2016 Compact PRO whose check key is not named, says why each bank’s bootability is unknown', () => {
    const report = slotReport2016(base, { checkKeyNamed: false });
    const { container, unmount } = view(panel({ plan: report.plan, report }));
    expect(bankRows(container)[0]?.textContent).toContain(
      'unknown — the key its bootloader checks a bank under was not named on this read',
    );
    expect(container.textContent).not.toContain("the bootloader's key table was not read");
    unmount();
  });

  it('hides the button and says why when the image is in no table entry, without the banner words', () => {
    const planFps = vi.fn((): FpsPlan => ({
      status: 'refused',
      reason: 'this image is not in the frame-rate patch table',
    }));
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base), planFps }),
    );
    const rows = bankRows(container);
    expect(buttonsIn(rows[0] as HTMLElement).some((text) => text.startsWith('Make '))).toBe(false);
    const text = rows[0]?.textContent ?? '';
    expect(text).toContain(
      'Frame-rate patch not offered: this image is not in the frame-rate patch table',
    );
    expect(text).not.toContain('cannot be written');
    unmount();
  });

  it('confirms an unbooted bank without a tick, and hands the patch to the page action', () => {
    const patchFps = vi.fn((_key: SlotKey, _acknowledged: boolean) => Promise.resolve());
    const { container, unmount } = view(
      panel({
        plan: slotPlan(true),
        report: slotReport(base),
        planFps: vi.fn(() => offer(32)),
        patchFps,
      }),
    );
    act(() => {
      buttonByText(bankRows(container)[1] as HTMLElement, 'Make 32 FPS').click();
    });
    act(() => {
      buttonByText(document.body, 'Yes — patch Slot B').click();
    });
    expect(patchFps).toHaveBeenCalledWith('b', false);
    unmount();
  });

  it('says a bank that already holds the patch is patched: a state, with no "not offered" and no table id', () => {
    const planFps = vi.fn((): FpsPlan => ({
      status: 'patched',
      reason: 'the frame-rate patch is already applied: this image runs at 18 Hz',
      hz: 18,
    }));
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base), planFps }),
    );
    const text = bankRows(container)[0]?.textContent ?? '';
    expect(
      buttonsIn(bankRows(container)[0] as HTMLElement).some((b) => b.startsWith('Make ')),
    ).toBe(false);
    expect(text).toContain('Frame-rate patch applied: this image runs at 18 Hz.');
    expect(text).not.toContain('not offered');
    expect(text).not.toContain('compact_pro-');
    unmount();
  });

  it('says a build made at the faster rate needs no patch, without calling it a refusal', () => {
    const planFps = vi.fn((): FpsPlan => ({
      status: 'at-rate',
      reason: 'this build already runs at 18 Hz without a patch',
      hz: 18,
    }));
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base), planFps }),
    );
    const text = bankRows(container)[0]?.textContent ?? '';
    expect(text).toContain('No frame-rate patch needed: this build already runs at 18 Hz.');
    expect(text).not.toContain('not offered');
    unmount();
  });

  it('tells a bank with an earlier 32 Hz patch to restore the stock image first, not that no patch is needed', () => {
    const planFps = vi.fn((): FpsPlan => ({
      status: 'at-rate',
      reason:
        'this image holds an earlier 32 Hz frame-rate patch without the USB fix, and a patch is never ' +
        'applied to a patched image: restore the stock image, then patch it',
      hz: 32,
      earlierPatch: true,
    }));
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base), planFps }),
    );
    const text = bankRows(container)[0]?.textContent ?? '';
    expect(text).toContain(
      'Frame-rate patch not offered: this bank holds an earlier 32 Hz patch without the USB fix. ' +
        'Restore the stock image, then Make 32 FPS.',
    );
    expect(text).not.toContain('No frame-rate patch needed');
    expect(
      buttonsIn(bankRows(container)[0] as HTMLElement).some((b) => b.startsWith('Make ')),
    ).toBe(false);
    unmount();
  });

  it('keeps the outcome of a patch on screen: the rate, the read-back, the saved files, and the way back', () => {
    const outcome = {
      key: 'a',
      patch: { id: 'compact_32k-1.3.0.0-to32', version: '1.3.0.0' },
      fromHz: 8,
      toHz: 32,
      backup: BACKUP,
      changed: [0xb964, 0x238],
      written: { verified: true },
      readBack: {
        checked: true,
        ok: true,
        differing: [0xb964, 0x238],
        missing: [],
        unexpected: [],
      },
    } as unknown as FpsPatchResult;
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base), fpsOutcome: outcome }),
    );
    const text = container.textContent;
    expect(text).toContain('Slot A — patched from 8 Hz to 32 Hz (firmware 1.3.0.0).');
    expect(text).not.toContain('compact_32k-');
    /* The capitalised replug prompt is the panel's, once (TESTING.md 42.86). */
    expect(text.split('NOW UNPLUG AND REPLUG THE CAMERA.')).toHaveLength(2);
    expect(text).toContain('differs from the saved dump only at the 2 planned byte(s)');
    expect(text).toContain(`Saved first, as a download: ${BACKUP.fileName}.`);
    expect(text).not.toContain('UNTESTED on hardware');
    expect(text).toContain('The decrypted file in it is the way back');
    unmount();
  });

  it('says "files" when the zip saved first holds several banks (the every-bank patch, TESTING.md 42.96)', () => {
    expect(backupLine(BACKUP)).toContain('The decrypted file in it is the way back');
    /* Only the count matters to the sentence. */
    const three = { ...BACKUP, banks: [{}, {}, {}] as unknown as WriteBackup['banks'] };
    expect(backupLine(three)).toContain(
      'The decrypted files in it are the way back ("Flash decrypted image" on each bank).',
    );
  });

  /** A patch's outcome as the page holds it: the read-back is the only thing these tests vary. */
  function patchOutcome(readBackOk: boolean): FpsPatchResult {
    return {
      key: 'b',
      patch: { id: 'compact_32k-1.3.0.0-to32', version: '1.3.0.0' },
      fromHz: 8,
      toHz: 32,
      backup: BACKUP,
      changed: [0xb964, 0x238],
      written: { verified: true },
      readBack: {
        checked: true,
        ok: readBackOk,
        differing: readBackOk ? [0xb964, 0x238] : [],
        missing: readBackOk ? [] : [0xb964],
        unexpected: [],
      },
    } as unknown as FpsPatchResult;
  }

  it('keeps the bank table on screen after a patch, with the patch outcome above the banks', () => {
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base), fpsOutcome: patchOutcome(true) }),
    );

    expect(bankRows(container)).toHaveLength(3);
    expect(container.textContent).toContain('patched from 8 Hz to 32 Hz');
    expect(container.textContent).not.toContain('Press Read slots');
    unmount();
  });

  it('after a patch whose read-back does not match, the table still shows the banks and the outcome says it does NOT match', () => {
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: slotReport(base), fpsOutcome: patchOutcome(false) }),
    );

    expect(bankRows(container)).toHaveLength(3);
    expect(container.textContent).toContain('does NOT differ only as planned');
    expect(container.textContent).not.toContain('differs from the saved dump only');
    unmount();
  });

  it('with no read after a patch, shows no bank table, keeps the patch outcome, and asks for Read slots', () => {
    const { container, unmount } = view(
      panel({ plan: slotPlan(true), report: null, fpsOutcome: patchOutcome(true) }),
    );

    expect(bankRows(container)).toHaveLength(0);
    expect(container.textContent).toContain('patched from 8 Hz to 32 Hz');
    expect(container.textContent).toContain('Press Read slots');
    unmount();
  });
});

describe('SlotsView: the device info on this page', () => {
  it('shows what the camera runs once it has been read, and does not repeat the bank table', () => {
    const report = slotReport(base);
    const { container, unmount } = view(panel({ plan: slotPlan(true), report }));

    /* The device info: what the camera runs, its boot config and its keys. */
    const runningHeading = [...container.querySelectorAll('h3, h2, h4, span, div')].find(
      (node) => node.textContent.trim() === 'Running firmware',
    );
    expect(runningHeading, 'Running firmware heading').toBeTruthy();
    const text = container.textContent;
    expect(text).toContain(base.version);
    expect(text).toContain('Firmware family');
    expect(text).not.toContain('Profile');
    expect(text).toContain('Booted from');
    expect(text).toContain('Upgrade target (its own upgrade)');

    /* Exactly one bank table, and it is SlotTable's: the device info adds no second one. */
    expect(container.querySelectorAll('table')).toHaveLength(1);
    expect(container.querySelector('table')?.querySelector('caption')?.textContent).toContain(
      'Each firmware bank on this camera',
    );
    unmount();
  });

  it('is not shown before the camera has been read', () => {
    const { container, unmount } = view(panel({ plan: null, report: null }));
    expect(container.textContent).not.toContain('Running firmware');
    expect(container.textContent).toContain('Press Read slots.');
    unmount();
  });
});
