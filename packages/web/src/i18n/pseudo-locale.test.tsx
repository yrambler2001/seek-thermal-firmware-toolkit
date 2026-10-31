/**
 * The pre-translation audit: the page rendered in a pseudo language
 * (./test-pseudo.ts: every English entry with accented letters, `⟦…⟧`), and
 * every text node and every `title`, `aria-label`, `placeholder` and `alt`
 * read back. Text a dictionary gave holds no ASCII letter; ASCII words that
 * are left came from somewhere else: a hard-coded string, a core sentence with
 * no message, a stored English error. They fail here, unless STAYS_ENGLISH
 * says why they stay English on purpose (hex, versions, file names, names of
 * products and programs; the run log and the copyable report are skipped).
 *
 * The views are rendered from stubs of their hook APIs, as in
 * render-smoke.test.tsx and the view tests, so each case states the camera
 * state it shows. What no stub here reaches (a live camera flow's own errors,
 * the language menu opened) is listed in README.md, "Checking a language by hand".
 */

import { act, type ReactElement } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type * as LanguagesModule from './languages';

vi.mock('./languages', async (importOriginal) => {
  const actual = await importOriginal<typeof LanguagesModule>();
  const { en } = await import('./locales/en');
  const { pseudoDictionary } = await import('./test-pseudo');
  const pseudo = pseudoDictionary(en);
  return {
    ...actual,
    LANGUAGES: [
      /* The real Polish, once it exists, steps aside: its words would read as leftover English. */
      ...actual.LANGUAGES.filter((language) => language.code !== 'pl'),
      /* `pl`, so the plural rules pick among one, few, many and other. */
      { code: 'pl', name: '⟦Ƥšéüðö Б⟧', load: () => Promise.resolve(pseudo) },
    ],
  };
});

import { App } from '@/App';
import { RunPanel } from '@/components/RunPanel';
import type { DumpPanelApi } from '@/hooks/useDumpPanel';
import type { InfoPanelApi, InfoReading } from '@/hooks/useInfoPanel';
import type { OfflineDecryptApi } from '@/hooks/useOfflineDecrypt';
import type { PreservePanelApi, PreservePrompt } from '@/hooks/usePreservePanel';
import type { SlotFileApi } from '@/hooks/useSlotFileDecrypt';
import type { SlotsPanelApi } from '@/hooks/useSlotsPanel';
import { useReporter, type ReporterHandle } from '@/hooks/useReporter';
import { DEFAULT_OPTIONS_FORM } from '@/lib/options';
import type { CheckpointName, PreserveRunState, PreserveStepId } from '@/lib/preserve/types';
import { detectSupport, type BrowserEnvironment } from '@/lib/support';
import { fakeDeviceState, preserveRunStateOf } from '@/test-fixtures';
import { render, renderHook } from '@/test-helpers';
import {
  flashedSlot,
  preparedSlot,
  slotPlan,
  slotReport,
  deviceState2016,
  slotReport2016,
} from '@/test-slots';
import { DecryptView } from '@/views/DecryptView';
import { InfoView } from '@/views/InfoView';
import { PreserveView } from '@/views/PreserveView';
import { SlotsView } from '@/views/SlotsView';
import { V4View } from '@/views/V4View';
import {
  SeekError,
  decryptSlotFile,
  detectProfile,
  errorCoreMessage,
  getProfile,
  fpsPlanOfBank,
  identityGate,
  listProfiles,
  type DeviceState,
  type FpsPlan,
  type SlotKey,
  type WriteAction,
  type WriteBackup,
} from '@seek-fw/core';
import { LANGUAGES } from './languages';
import { setLanguage } from './store';
import { cameraNotBackEnglish } from '@/lib/preserve/step-error';
import { pseudoText } from './test-pseudo';

/* ------------------------------------------------------------------------ */
/* What stays English on purpose. Each entry is removed from the text before
 * the check; keep them narrow, and give every one its reason. */

const MONTH = '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)';

/** Text matched exactly, longest first, so a name inside a longer one does not split it. */
function exactly(names: readonly string[]): RegExp {
  const escaped = [...names]
    .sort((a, b) => b.length - a.length)
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(?<![A-Za-z])(?:${escaped.join('|')})(?![A-Za-z])`, 'g');
}

/*
 * Sentences the test fixtures write by hand with no message (test-fixtures.ts, test-slots.ts): a
 * real read or run carries the message, and an old run file shows its stored English on purpose
 * (recordedText). They stand for data here, not for page text.
 */
const FIXTURE_ENGLISH = [
  'Fake PIR324' /* the fake camera's USB product string: what a camera reports */,
  'an empty bank is written like a used one',
  'the window would not arm',
  'this write targets a bank that matters',
  /* preparedSlot's compare rows; core's compareRows writes words compareWordMessage knows */
  'version',
  'image id',
  'slot A first, then B, then recovery R',
  'the boot-config word 0xFFFFFFFF tries slot A first, and slot A passes its check',
  'it is erased: every byte reads 0xFF, so it holds no image',
];

const STAYS_ENGLISH: readonly { readonly pattern: RegExp; readonly why: string }[] = [
  { pattern: exactly(FIXTURE_ENGLISH), why: 'test data with no message: see FIXTURE_ENGLISH' },
  {
    pattern: exactly(listProfiles().map((profile) => profile.name)),
    why: 'firmware family names: core passes them as {family}, and the core notes keep them English',
  },
  {
    pattern: exactly(LANGUAGES.map((language) => language.name)),
    why: "the switcher's language names, each in its own language",
  },
  {
    pattern: /[^\s"'(),:;]*\.(?:bin|zip|json|txt|md)\b/g,
    why: 'file names and paths the page saves, reads or names (README.md, windows/*.bin)',
  },
  {
    pattern: /\b\d\d-[a-z]+(?:-[a-z]+)*\/(?:[\w-]+\/)*/g,
    why: "the run file's folders, which the page names (02-read-build/decrypted/)",
  },
  { pattern: /\bpreserve-[\w-]+/g, why: 'a Preserve run id, which names its files' },
  { pattern: /\b0x[0-9A-Fa-f]+\b/g, why: 'hex: addresses, status words, USB ids' },
  { pattern: /\b[0-9A-Fa-f]{16,}\b/g, why: 'SHA-256 digests and AES keys, as hex' },
  { pattern: /\b\d+(?:\.\d+){1,3}(?:\.x)?\b/g, why: 'firmware versions' },
  {
    pattern: new RegExp(`\\b${MONTH}\\s+\\d{1,2}\\s+\\d{4}(?:\\s+\\d\\d:\\d\\d:\\d\\d)?`, 'g'),
    why: 'the build string the camera reports',
  },
  {
    pattern: /\b(?:[A-Z][a-z]+){2,}\b/g,
    why: 'USB command and DOM names in CamelCase: GetFirmwareInfo, CompleteMemoryUpgrade, NotReadableError',
  },
  { pattern: /\bUSBDevice\.\w+\(\)/g, why: 'a WebUSB call the page names' },
  { pattern: /\bcfg\[\d\]/g, why: 'a register name (the boot-config word)' },
  { pattern: /\b(?:IN|OUT)\b/g, why: "a USB transfer's direction, as the USB spec names it" },
  {
    pattern: exactly([
      'Seek Thermal',
      'Seek',
      'Compact PRO',
      'Compact Pro',
      'Compact XR',
      'Compact',
      'Mosaic',
      'Nano',
      'J-Link',
      'WebUSB',
      'SHA-256',
      'Windows',
      'macOS',
      'Linux',
      'Android',
    ]),
    why: 'names of products, programs, systems and algorithms',
  },
  { pattern: /\b(?:KiB|MiB|KB|MB|Hz)\b/g, why: 'units' },
];

/** A text with every STAYS_ENGLISH match taken out. */
function withoutAllowed(text: string): string {
  return STAYS_ENGLISH.reduce((rest, { pattern }) => rest.replace(pattern, ' '), text);
}

/** ASCII words of two letters or more: what a dictionary entry never leaves. */
const ENGLISH_WORD = /[A-Za-z]{2,}/;

/* The run log (`tEnglish`, README "What stays English"), and code blocks: the udev rule and the
 * shell lines PlatformNotes gives to paste, and HexBlock's bytes. */
const SKIPPED = '[role="log"], pre, script, style';
const ATTRIBUTES = ['title', 'aria-label', 'placeholder', 'alt'] as const;

/** Every text a reader meets in `root` that still has English in it, with where it was. */
function leftovers(root: ParentNode, where: string): string[] {
  const found: string[] = [];
  const check = (text: string, at: string): void => {
    const trimmed = text.replace(/\s+/g, ' ').trim();
    if (trimmed === '' || !ENGLISH_WORD.test(withoutAllowed(trimmed))) return;
    found.push(`${where} ${at}: ${JSON.stringify(trimmed)}`);
  };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (parent?.closest(SKIPPED) !== null) continue;
    check(node.textContent ?? '', `<${parent.tagName.toLowerCase()}>`);
  }
  for (const element of root.querySelectorAll<HTMLElement>(
    ATTRIBUTES.map((name) => `[${name}]`).join(','),
  )) {
    if (element.closest(SKIPPED) !== null) continue;
    for (const name of ATTRIBUTES) {
      const value = element.getAttribute(name);
      if (value !== null) check(value, `[${name}]`);
    }
  }
  return found;
}

/** Renders `element`, collects what is left in English on the page (dialogs included), unmounts. */
function audit(
  where: string,
  element: ReactElement,
  interact?: (root: HTMLElement) => void,
): string[] {
  const { container, unmount } = render(element);
  if (interact !== undefined) {
    act(() => {
      interact(container);
    });
  }
  const found = [...leftovers(document.body, where)];
  if (/[A-Za-z]{2,}/.test(withoutAllowed(document.title))) {
    found.push(`${where} document.title: ${JSON.stringify(document.title)}`);
  }
  unmount();
  return found;
}

/** Clicks the first button whose label holds `english` in the pseudo language. */
function clickButton(root: HTMLElement, english: string): void {
  const words = pseudoText(english).slice(1, -3);
  const button = [...root.querySelectorAll('button')].find((candidate) =>
    candidate.textContent.includes(words),
  );
  if (button === undefined) throw new Error(`no button with ${english}`);
  button.click();
}

function expectNone(found: readonly string[]): void {
  expect([...new Set(found)], 'text left in English in the pseudo language').toEqual([]);
}

/* ------------------------------------------------------------------------ */
/* Stubs: the same shapes the view tests use. */

const ENV: Readonly<Record<string, BrowserEnvironment>> = {
  chrome: {
    hasWebUsb: true,
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    platform: 'MacIntel',
    maxTouchPoints: 0,
    isSecureContext: true,
    protocol: 'https:',
  },
  firefoxLinux: {
    hasWebUsb: false,
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
    platform: 'Linux x86_64',
    maxTouchPoints: 0,
    isSecureContext: true,
    protocol: 'https:',
  },
  iphone: {
    hasWebUsb: false,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    maxTouchPoints: 5,
    isSecureContext: true,
    protocol: 'https:',
  },
  insecure: {
    hasWebUsb: false,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    platform: 'Win32',
    maxTouchPoints: 0,
    isSecureContext: false,
    protocol: 'http:',
  },
};

const HASHES = ['#/', '#/preserve', '#/v4', '#/decrypt', '#/slots'] as const;

function reporters(count: number): ReporterHandle[] {
  const { result } = renderHook(() => Array.from({ length: count }, () => useReporter()));
  return [...result.current];
}

function reporter(): ReporterHandle {
  return reporters(1)[0]!;
}

/** A reporter in the middle of a run, and one at its end. */
function busyReporter(): ReporterHandle {
  const hook = renderHook(() => useReporter());
  act(() => {
    hook.result.current.reset(pseudoText('Reading ...'));
    hook.result.current.log('read 0x14010000', 'ok');
  });
  return hook.result.current;
}

function infoStub(result: InfoReading | null = null, rep = reporter()): InfoPanelApi {
  return {
    reporter: rep,
    reading: false,
    result,
    unlockNote: result !== null,
    read: () => Promise.resolve(),
    cancel: () => undefined,
  };
}

function reading(
  version: string | null,
  buildString: string | null,
  state: DeviceState | null,
): InfoReading {
  return {
    version,
    buildString,
    gate: identityGate({ version, buildString, note: version === null ? 'no answer' : '' }),
    state,
  };
}

function dumpStub(over: Partial<DumpPanelApi> = {}): DumpPanelApi {
  return {
    reporter: reporter(),
    running: false,
    acting: null,
    refusal: null,
    unlockNote: false,
    start: () => Promise.resolve(),
    cancel: () => undefined,
    ...over,
  };
}

function offlineStub(): OfflineDecryptApi {
  return {
    reporter: reporter(),
    running: false,
    detection: null,
    decryptFile: () => Promise.resolve(),
    cancel: () => undefined,
  };
}

function slotFileStub(over: Partial<SlotFileApi> = {}): SlotFileApi {
  return {
    busy: false,
    file: null,
    result: null,
    refusal: null,
    inputSha256: null,
    readError: null,
    downloadName: null,
    decrypt: () => Promise.resolve(),
    download: () => undefined,
    ...over,
  };
}

const FLASH_ACTION: WriteAction = { kind: 'flash', input: 'plain', fileName: 'fw.bin' };
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

function slotsStub(over: Partial<SlotsPanelApi> = {}): SlotsPanelApi {
  return {
    reporter: reporter(),
    plan: null,
    report: null,
    refusal: null,
    pending: null,
    outcome: null,
    reading: false,
    writing: false,
    readSlots: () => Promise.resolve(),
    dump: () => Promise.resolve(),
    pickFile: () => Promise.resolve(),
    copyBank: () => Promise.resolve(),
    pickRestore: () => Promise.resolve(),
    write: () => Promise.resolve(),
    discardPending: () => undefined,
    cancel: () => undefined,
    unlockNote: false,
    fpsOutcome: null,
    fpsEveryOutcome: null,
    /* What core answers for the report in hand; before a read the page shows no row to ask. */
    planFps: (key): FpsPlan =>
      over.report == null
        ? { status: 'refused', reason: pseudoText('no read yet') }
        : fpsPlanOfBank(over.report, key),
    patchFps: () => Promise.resolve(),
    planEveryFps: () => null,
    patchEveryFps: () => Promise.resolve(),
    ...over,
  };
}

function runState(
  steps: Partial<Record<PreserveStepId, 'done' | 'failed'>>,
  extra: Partial<PreserveRunState> = {},
): PreserveRunState {
  const step = (status: 'done' | 'failed' | undefined) =>
    status === undefined ? undefined : { status };
  const base = preserveRunStateOf({
    runId: 'preserve-pseudo-test',
    nextStep: 'backup',
    steps: Object.fromEntries(
      (['backup', 'patch', 'commit', 'drain', 'restore', 'verify'] as const).map((id) => [
        id,
        step(steps[id]),
      ]),
    ),
    ...extra,
  });
  if (steps.backup === 'done') return base;
  const { boot: _boot, banks: _banks, targets: _targets, anchor: _anchor, ...rest } = base;
  return rest;
}

function preserveStub(
  state: PreserveRunState | null,
  over: Partial<PreservePanelApi> = {},
): PreservePanelApi {
  const [load, first, second, third] = reporters(4);
  return {
    loadReporter: load!,
    phaseReporters: { 'read-build': first!, 'patch-dump': second!, 'restore-verify': third! },
    state,
    hasCheckpoint: (_name: CheckpointName): boolean => true,
    activePhase: null,
    prompt: null,
    loading: false,
    lastSave: null,
    deliveredCheck: null,
    unlockNote: false,
    runPhase: () => Promise.resolve(),
    chooseBanks: () => null,
    cancel: () => undefined,
    saveAgain: () => undefined,
    loadRunFile: () => Promise.resolve(),
    ...over,
  };
}

/* ------------------------------------------------------------------------ */

let base: DeviceState;

beforeAll(async () => {
  base = await fakeDeviceState();
});

beforeEach(async () => {
  await act(async () => {
    await setLanguage('pl');
  });
});

describe('the pseudo language itself', () => {
  it('keeps params, slots and markup, and leaves no ASCII letter', () => {
    expect(pseudoText('Write **{file}** to <link>slot {slot}</link>, then <icon/>.')).toBe(
      '⟦Ŵřîţé **{file}** ţö <link>šľöţ {slot}</link>, ţĥéñ <icon/>. Б⟧',
    );
  });
});

describe('nothing on the page is left in English', () => {
  it('the shell and every tab, with no camera, in every browser the support banner knows', () => {
    const found: string[] = [];
    for (const [name, env] of Object.entries(ENV)) {
      for (const hash of HASHES) {
        window.location.hash = hash;
        found.push(...audit(`${name} ${hash}`, <App support={detectSupport(env)} />));
      }
    }
    window.location.hash = '';
    expectNone(found);
  });

  it('Info: no camera, each family it names, a full read, no version', () => {
    const connected = { connected: true, busy: false } as const;
    expectNone([
      ...audit('info off', <InfoView info={infoStub()} connected={false} busy={false} />),
      ...audit('info busy', <InfoView info={infoStub(null, busyReporter())} {...connected} />),
      ...audit(
        'info 4.x',
        <InfoView info={infoStub(reading('4.18.2.0', 'Feb 13 2020', null))} {...connected} />,
      ),
      ...audit(
        'info 2016',
        <InfoView
          info={infoStub(reading('1.0.3.0', 'Jul  6 2016 17:04:49', null))}
          {...connected}
        />,
      ),
      ...audit(
        'info too old',
        <InfoView info={infoStub(reading('0.3.0.1', null, null))} {...connected} />,
      ),
      ...audit(
        'info no version',
        <InfoView info={infoStub(reading(null, null, null))} {...connected} />,
      ),
      ...audit(
        'info full read',
        <InfoView info={infoStub(reading('4.9.5.0', 'Sep 20 2026', base))} {...connected} />,
      ),
      ...audit(
        'info 2016 full read',
        <InfoView
          info={infoStub(reading('1.0.3.0', 'Jul  6 2016 17:04:49', deviceState2016(base)))}
          {...connected}
        />,
      ),
      ...audit(
        'info same bank',
        <InfoView
          info={infoStub(
            reading('4.9.5.0', 'Sep 20 2026', {
              ...base,
              boot: { booted: 'b', target: 'b' },
            }),
          )}
          {...connected}
        />,
      ),
    ]);
  });

  it('Decrypt File/Slot: no file, a refused file, an erased bank, a read error', async () => {
    const refusal = await decryptSlotFile(new Uint8Array(100)).then(
      () => 'not refused',
      (error: unknown) =>
        error instanceof SeekError ? (errorCoreMessage(error) ?? error.message) : 'not refused',
    );
    const erased = await decryptSlotFile(new Uint8Array(0x10000).fill(0xff));
    const view = (slotFile: SlotFileApi) => (
      <DecryptView offline={offlineStub()} slotFile={slotFile} busy={false} />
    );
    expectNone([
      ...audit('decrypt empty', view(slotFileStub())),
      ...audit(
        'decrypt refused',
        view(
          slotFileStub({
            file: { name: 'short.bin', size: 100 },
            refusal,
            inputSha256: 'c'.repeat(64),
          }),
        ),
      ),
      ...audit(
        'decrypt erased',
        view(slotFileStub({ file: { name: 'bank-B.bin', size: 0x10000 }, result: erased })),
      ),
      ...audit(
        'decrypt read error',
        view(slotFileStub({ file: { name: 'gone.bin', size: 0 }, readError: 'NotReadableError' })),
      ),
    ]);
  });

  it('Dump & decrypt 4.x/Nano: no camera, a camera, a run, a detected camera, the unlock note', () => {
    const v4 = (dump: DumpPanelApi, connected = true) => (
      <V4View
        dump={dump}
        connected={connected}
        busy={false}
        options={DEFAULT_OPTIONS_FORM}
        onOptionsChange={() => undefined}
        optionsInvalidField={null}
        optionsErrorMessage={null}
      />
    );
    const detection = detectProfile({ firmwareVersion: '4.18.2.0', plainSelectorRefused: false });
    expectNone([
      ...audit('v4 off', v4(dumpStub(), false)),
      ...audit('v4 on', v4(dumpStub())),
      ...audit('v4 running', v4(dumpStub({ reporter: busyReporter(), running: true }))),
      ...audit('v4 unlock note', v4(dumpStub({ unlockNote: true }))),
      ...audit(
        'v4 detected',
        v4(
          dumpStub({
            acting: {
              profile: getProfile('modern-4x'),
              detection,
              firmwareVersion: '4.18.2.0',
              buildString: 'Feb 13 2020',
            },
          }),
        ),
      ),
    ]);
  });

  it('Work with firmware slots: before a read, a 4.x and a 2016 camera read, a prepared write, its outcome', () => {
    const view = (slots: SlotsPanelApi, connected = true) => (
      <SlotsView slots={slots} connected={connected} busy={false} />
    );
    const report = slotReport(base);
    const report2016 = slotReport2016(base);
    const prepared = (key: SlotKey) => ({
      key,
      kind: 'plain' as const,
      what: 'fw_decrypted.bin',
      plan: preparedSlot(key, 'plain', new Uint8Array(0x10000)),
      report,
      source: null,
      action: FLASH_ACTION,
      restore: null,
    });
    expectNone([
      ...audit('slots off', view(slotsStub(), false)),
      ...audit('slots on', view(slotsStub())),
      ...audit('slots reading', view(slotsStub({ reporter: busyReporter(), reading: true }))),
      ...audit('slots 4.x', view(slotsStub({ plan: slotPlan(true), report }))),
      ...audit('slots 4.x off', view(slotsStub({ plan: slotPlan(true), report }), false)),
      ...audit('slots 2016', view(slotsStub({ plan: report2016.plan, report: report2016 }))),
      ...audit(
        'slots empty B',
        view(slotsStub({ plan: slotPlan(true), report: slotReport(base, null, ['b']) })),
      ),
      ...audit(
        'slots unread B',
        view(slotsStub({ plan: slotPlan(true), report: slotReport(base, 'b') })),
      ),
      ...audit(
        'slots prepared',
        view(slotsStub({ plan: slotPlan(true), report, pending: prepared('a') })),
      ),
      /* The write's confirmation dialog, opened from the prepared write. */
      ...audit(
        'slots write dialog',
        view(slotsStub({ plan: slotPlan(true), report, pending: prepared('a') })),
        (root) => {
          clickButton(root, 'Write to');
        },
      ),
      ...audit(
        'slots written',
        view(
          slotsStub({
            plan: slotPlan(true),
            report,
            outcome: {
              key: 'b',
              what: 'fw.bin',
              result: flashedSlot('b', true),
              backup: BACKUP,
              action: FLASH_ACTION,
              restore: null,
            },
          }),
        ),
      ),
      ...audit(
        'slots written, no match',
        view(
          slotsStub({
            plan: slotPlan(true),
            report,
            outcome: {
              key: 'b',
              what: 'fw.bin',
              result: flashedSlot('b', false),
              backup: BACKUP,
              action: FLASH_ACTION,
              restore: null,
            },
          }),
        ),
      ),
    ]);
  });

  it('Dump & decrypt 0.x/1.x: before a run, each phase done or failed, the asks, the verdicts', () => {
    const view = (preserve: PreservePanelApi, connected = true) => (
      <PreserveView preserve={preserve} connected={connected} busy={false} />
    );
    const ask = (prompt: PreservePrompt, state: PreserveRunState) =>
      preserveStub(state, { prompt, activePhase: prompt.phase });
    const all = {
      backup: 'done',
      patch: 'done',
      commit: 'done',
      drain: 'done',
      restore: 'done',
    } as const;
    expectNone([
      ...audit('preserve off', view(preserveStub(null), false)),
      ...audit('preserve on', view(preserveStub(null))),
      ...audit(
        'preserve built',
        view(preserveStub(runState({ backup: 'done', patch: 'done' }, { nextStep: 'commit' }))),
      ),
      ...audit(
        'preserve commit failed',
        view(
          preserveStub(
            runState({ backup: 'done', patch: 'done', commit: 'failed' }, { nextStep: 'commit' }),
          ),
        ),
      ),
      ...audit(
        'preserve reconnect',
        view(
          ask(
            { phase: 'patch-dump', kind: 'reconnect' },
            runState({ backup: 'done', patch: 'done', commit: 'done' }, { nextStep: 'drain' }),
          ),
          false,
        ),
      ),
      ...audit(
        'preserve replug',
        view(
          ask(
            { phase: 'patch-dump', kind: 'replug-before-restore' },
            runState(
              { backup: 'done', patch: 'done', commit: 'done', drain: 'done' },
              { nextStep: 'restore' },
            ),
          ),
        ),
      ),
      ...audit(
        'preserve power cycle',
        view(
          preserveStub(
            runState({}, {
              nextStep: 'backup',
              steps: { backup: { status: 'failed', powerCycleRequired: true } },
            } as unknown as Partial<PreserveRunState>),
          ),
        ),
      ),
      ...audit(
        'preserve gave up waiting',
        view(
          preserveStub({
            ...runState({ backup: 'done', patch: 'done', commit: 'done' }, { nextStep: 'drain' }),
            steps: {
              backup: { status: 'done' },
              patch: { status: 'done' },
              commit: { status: 'done' },
              drain: { status: 'failed', error: cameraNotBackEnglish(5, 'NotFoundError') },
            },
          } as unknown as PreserveRunState),
        ),
      ),
      ...audit(
        'preserve verified',
        view(
          preserveStub(
            runState(all, {
              nextStep: 'verify',
              verify: { diffBytes: 0, windowsRead: 31, badWindows: [] },
            }),
          ),
        ),
      ),
      ...audit(
        'preserve finished',
        view(
          preserveStub(
            runState(
              { ...all, verify: 'done' },
              {
                nextStep: 'done',
                deliveredSha256: 'a'.repeat(64),
                rawDumpSha256: 'c'.repeat(64),
                verify: { diffBytes: 0, windowsRead: 31, badWindows: [] },
              },
            ),
            { deliveredCheck: { blocksCompared: 31, differing: [], onlyInFullDump: [0x14000000] } },
          ),
        ),
      ),
    ]);
  });

  it('the run panel: idle, in progress, finished', () => {
    expectNone([
      ...audit(
        'run panel idle',
        <RunPanel
          id="pseudo"
          label={pseudoText('Dump')}
          progress={{ done: 0, total: 0, text: pseudoText('Idle.') }}
          lines={[]}
          trimmed={0}
        />,
      ),
      ...audit(
        'run panel progress',
        <RunPanel
          id="pseudo"
          label={pseudoText('Dump')}
          progress={{ done: 5, total: 10, text: pseudoText('window 5 of 10') }}
          lines={[{ seq: 1, level: 'ok', text: 'read 0x14010000' }]}
          trimmed={3}
        />,
      ),
    ]);
  });
});
