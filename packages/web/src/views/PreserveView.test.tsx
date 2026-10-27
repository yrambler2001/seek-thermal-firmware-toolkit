/**
 * The wizard on the page: three phases as numbered steps, the image picked
 * NOWHERE (the plan prints from what the camera produced), the commit behind
 * its confirmation dialog, the past-commit jump behind its own, the verify
 * verdict shown unmistakably on the last step — and the run's expected
 * hand-offs (the Connect pick, the replug) asked for calmly, not in red.
 */

import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { PreserveView } from './PreserveView';
import type {
  DeliveredCheck,
  PreservePanelApi,
  PreservePhaseRunOptions,
  PreservePrompt,
  RunFileSave,
} from '@/hooks/usePreservePanel';
import { useReporter, type ReporterHandle } from '@/hooks/useReporter';
import type {
  CheckpointName,
  PreservePhaseId,
  PreserveRunState,
  PreserveStepId,
} from '@/lib/preserve/types';
import { buttonByText, render, renderHook } from '@/test-helpers';
import { unknownImageWords } from '@seek-fw/core';
import {
  preserveBankOf,
  preserveBootOf,
  preserveErasedBankOf,
  preservePatchOf,
  preserveRunStateOf,
} from '@/test-fixtures';

function fourReporters(): readonly ReporterHandle[] {
  const { result } = renderHook(() => Array.from({ length: 4 }, () => useReporter()));
  return result.current;
}

function runState(
  steps: Partial<Record<PreserveStepId, 'done' | 'failed'>> = {},
  extra: Partial<PreserveRunState> = {},
): PreserveRunState {
  const step = (status: 'done' | 'failed' | undefined) =>
    status === undefined ? undefined : { status };
  const base = preserveRunStateOf({
    runId: 'preserve-render-test',
    nextStep: 'backup',
    steps: {
      backup: step(steps.backup),
      patch: step(steps.patch),
      commit: step(steps.commit),
      drain: step(steps.drain),
      restore: step(steps.restore),
      verify: step(steps.verify),
    } as PreserveRunState['steps'],
    ...extra,
  });
  if (steps.backup === 'done') return base;
  /* Before the backup the run has read no bank. */
  const { boot: _boot, banks: _banks, targets: _targets, anchor: _anchor, ...rest } = base;
  return rest;
}

const HAS_ALL = (_name: CheckpointName): boolean => true;

interface Scenario {
  readonly state: PreserveRunState | null;
  readonly connected: boolean;
  readonly busy?: boolean;
  readonly has?: (name: CheckpointName) => boolean;
  readonly activePhase?: PreservePhaseId | null;
  readonly prompt?: PreservePrompt | null;
  readonly lastSave?: RunFileSave | null;
  readonly deliveredCheck?: DeliveredCheck | null;
  readonly unlockNote?: boolean;
  readonly onConnect?: () => void;
  readonly chooseBanks?: PreservePanelApi['chooseBanks'];
}

function preserveStub(scenario: Scenario, ran: [PreservePhaseId, PreservePhaseRunOptions][]) {
  const reps = fourReporters();
  const [load, first, second, third] = reps;
  return {
    loadReporter: load!,
    phaseReporters: { 'read-build': first!, 'patch-dump': second!, 'restore-verify': third! },
    state: scenario.state,
    hasCheckpoint: (name: CheckpointName): boolean => (scenario.has ?? HAS_ALL)(name),
    activePhase: scenario.activePhase ?? null,
    prompt: scenario.prompt ?? null,
    loading: false,
    lastSave: scenario.lastSave ?? null,
    deliveredCheck: scenario.deliveredCheck ?? null,
    unlockNote: scenario.unlockNote === true,
    runPhase: (phase: PreservePhaseId, options: PreservePhaseRunOptions = {}): Promise<void> => {
      ran.push([phase, options]);
      return Promise.resolve();
    },
    chooseBanks: scenario.chooseBanks ?? ((): string | null => null),
    cancel: () => undefined,
    saveAgain: () => undefined,
    loadRunFile: (): Promise<void> => Promise.resolve(),
  } satisfies PreservePanelApi;
}

function renderPreserve(
  scenario: Scenario,
  ran: [PreservePhaseId, PreservePhaseRunOptions][] = [],
  stub: ReturnType<typeof preserveStub> = preserveStub(scenario, ran),
) {
  return render(
    <PreserveView
      preserve={stub}
      connected={scenario.connected}
      busy={scenario.busy === true}
      {...(scenario.onConnect === undefined ? {} : { onConnect: scenario.onConnect })}
    />,
  );
}

/** A phase's own numbered step: the section its heading labels. */
function phaseRow(container: HTMLElement, label: string): HTMLElement {
  const row = [...container.querySelectorAll('section')].find(
    (node) => node.querySelector('h2')?.textContent.trim() === label,
  );
  if (row === undefined) throw new Error(`no phase step titled ${label}`);
  return row;
}

function runButton(row: HTMLElement): HTMLButtonElement {
  const match = [...row.querySelectorAll('button')].find((button) =>
    /^(Start |Try |Run past the unrecorded write$)/.test(button.textContent.trim()),
  );
  if (match === undefined) throw new Error(`no run button on ${row.textContent.slice(0, 40)}`);
  return match;
}

function dialogButton(text: string): HTMLButtonElement | undefined {
  return [
    ...(document.body.querySelector('[role="alertdialog"]')?.querySelectorAll('button') ?? []),
  ].find((button) => button.textContent.trim() === text);
}

afterEach(() => {
  for (const node of document.body.querySelectorAll('[role="alertdialog"]')) node.remove();
});

describe('PreserveView', () => {
  it('a step log shows the detail lines only when asked, as the CLI does with --verbose (42.105)', () => {
    const scenario: Scenario = { state: null, connected: true };
    const base = preserveStub(scenario, []);
    /* The handle as the hook renders it after two lines: one for people, one detail. */
    const stub = {
      ...base,
      phaseReporters: {
        ...base.phaseReporters,
        'read-build': {
          ...base.phaseReporters['read-build'],
          lines: [
            { seq: 1, level: 'info', text: 'Backup: 31 blocks read, no restart needed.' },
            { seq: 2, level: 'detail', text: 'camera reports firmware 1.3.0.0' },
          ] as const,
        },
      },
    };
    const { container, unmount } = renderPreserve(scenario, [], stub);
    const log = (): string =>
      container.querySelector('#preserve-phase-read-build-log')?.textContent ?? '';
    expect(log()).toContain('Backup: 31 blocks read, no restart needed.');
    expect(log()).not.toContain('camera reports firmware');
    const toggle = container.querySelector<HTMLInputElement>('#preserve-phase-read-build-details');
    expect(toggle?.checked).toBe(false);
    expect(
      container.querySelector('label[for="preserve-phase-read-build-details"]')?.textContent,
    ).toBe('Show details in the log');
    act(() => {
      toggle?.click();
    });
    expect(log()).toContain('camera reports firmware 1.3.0.0');
    unmount();
  });

  it('shows the unlock note after a run that sent the token, and no note otherwise', () => {
    const quiet = renderPreserve({ state: null, connected: true });
    expect(quiet.container.textContent).not.toContain('stays unlocked');
    quiet.unmount();

    const { container, unmount } = renderPreserve({
      state: null,
      connected: true,
      unlockNote: true,
    });
    const note = [...container.querySelectorAll('[data-slot="alert"]')].find((el) =>
      el.textContent.includes('stays unlocked'),
    );
    expect(note?.textContent).toContain('the camera stays unlocked until a power cycle');
    expect(note?.textContent).toContain('power-cycle it before you use them');
    /* information only: phase ① is still offered */
    expect(runButton(phaseRow(container, 'Read & build')).disabled).toBe(false);
    unmount();
  });

  it('the image picker is gone — the wizard never asks for a firmware file', () => {
    const { container, unmount } = renderPreserve({ state: null, connected: false });
    expect(container.textContent).not.toContain('Choose plaintext image');
    expect(container.textContent).not.toContain('Re-attach');
    expect(container.textContent).toContain('no firmware file to pick');
    expect(container.textContent).toContain('Steps 03 and 04 write to the camera');
    unmount();
  });

  it('before a run: phase ① creates it, the later phases are dark, the resume picker is there', () => {
    const { container, unmount } = renderPreserve({ state: null, connected: true });
    expect(runButton(phaseRow(container, 'Read & build')).disabled).toBe(false);
    expect(runButton(phaseRow(container, 'Write & whole-flash read')).disabled).toBe(true);
    expect(runButton(phaseRow(container, 'Restore & verify')).disabled).toBe(true);
    expect(buttonByText(container, 'Load a run file…')).toBeTruthy();
    expect(buttonByText(container, 'Save the run file again').disabled).toBe(true);
    unmount();
  });

  it('a fresh run shows no past-commit alarm — the run is merely in its normal order', () => {
    const { container, unmount } = renderPreserve({ state: runState(), connected: true });
    expect(container.textContent).not.toContain('The write is not on record');
    expect(phaseRow(container, 'Read & build').textContent).toContain('Up next');
    unmount();
  });

  it('phase ② runs from its dialog, which names the commit as the irreversible write', () => {
    const ran: [PreservePhaseId, PreservePhaseRunOptions][] = [];
    const state = runState({ backup: 'done', patch: 'done' }, { nextStep: 'commit' });
    const view = renderPreserve({ state, connected: true }, ran);

    expect(document.body.querySelector('[role="alertdialog"]')).toBeNull();
    const row = phaseRow(view.container, 'Write & whole-flash read');
    expect(row.textContent).toContain('Up next');
    act(() => {
      runButton(row).click();
    });
    const dialog = document.body.querySelector('[role="alertdialog"]');
    expect(dialog?.textContent).toContain('Write & whole-flash read — write to slot A?');
    expect(dialog?.textContent).toContain('This writes a small patch into slot A');
    act(() => {
      dialogButton('Cancel')?.click();
    });
    expect(ran).toEqual([]);
    act(() => {
      runButton(row).click();
    });
    act(() => {
      dialogButton('Yes — write to the camera')?.click();
    });
    expect(ran).toEqual([['patch-dump', {}]]);
    view.unmount();
  });

  it('right after step 02 nothing is alarming — step 04 just waits for step 03', () => {
    const state = runState({ backup: 'done', patch: 'done' }, { nextStep: 'commit' });
    const { container, unmount } = renderPreserve({ state, connected: true });
    expect(container.textContent).not.toContain('The write is not on record');
    const row = phaseRow(container, 'Restore & verify');
    expect(row.textContent).toContain('Available after step 03 (Write & whole-flash read)');
    expect(row.textContent).not.toContain('already be patched');
    expect(runButton(row).textContent.trim()).toBe('Start restore & verify');
    expect(runButton(row).disabled).toBe(true);
    unmount();
  });

  it('phase ③ after a FAILED commit is jump-only, loud, and behind its own dialog', () => {
    const ran: [PreservePhaseId, PreservePhaseRunOptions][] = [];
    const state = runState(
      { backup: 'done', patch: 'done', commit: 'failed' },
      { nextStep: 'commit' },
    );
    const view = renderPreserve({ state, connected: true }, ran);

    expect(view.container.textContent).toContain(
      'The write is not on record for this run, so the steps after it are shut',
    );
    const row = phaseRow(view.container, 'Restore & verify');
    expect(row.textContent).toContain('the camera may already be patched');
    const button = runButton(row);
    expect(button.textContent.trim()).toBe('Run past the unrecorded write');
    expect(button.disabled).toBe(false);
    act(() => {
      button.click();
    });
    const dialog = document.body.querySelector('[role="alertdialog"]');
    expect(dialog?.textContent).toContain('THE WRITE IS NOT ON RECORD');
    expect(dialog?.textContent).toContain('jump past the unrecorded write');
    act(() => {
      dialogButton('Yes — jump past the write')?.click();
    });
    expect(ran).toEqual([['restore-verify', { allowJump: true }]]);
    view.unmount();
  });

  it('a failed commit offers the re-run AND the jump past it', () => {
    const ran: [PreservePhaseId, PreservePhaseRunOptions][] = [];
    const state = runState(
      { backup: 'done', patch: 'done', commit: 'failed' },
      { nextStep: 'commit' },
    );
    const view = renderPreserve({ state, connected: true }, ran);

    const row = phaseRow(view.container, 'Write & whole-flash read');
    const skip = [...row.querySelectorAll('button')].find((button) =>
      button.textContent.includes('Skip the write'),
    );
    expect(skip).toBeTruthy();
    expect(skip?.disabled).toBe(false);
    act(() => {
      skip?.click();
    });
    expect(document.body.querySelector('[role="alertdialog"]')?.textContent).toContain(
      'THE WRITE IS NOT ON RECORD',
    );
    act(() => {
      dialogButton('Yes — jump past the write')?.click();
    });
    expect(ran).toEqual([['patch-dump', { allowJump: true }]]);
    view.unmount();
  });

  it('the plan prints from what the camera produced — build, two agreeing reads, the diff', () => {
    const { container, unmount } = renderPreserve({
      state: runState({ backup: 'done', patch: 'done' }, { nextStep: 'commit' }),
      connected: true,
    });
    const row = phaseRow(container, 'Read & build');
    /* A finished step says so, and says nothing about being "not ready". */
    expect(row.textContent).toContain('Done');
    expect(row.textContent).not.toContain('Not ready');
    expect(row.textContent).toContain('Compact 1.3.0.8 (8 Hz)');
    expect(row.textContent).toContain('two agreeing reads');
    expect(row.textContent).toContain('Bytes that move on the part');
    /* Each change in plain words; the instruction text stays in the run file (42.101). */
    expect(row.textContent).toContain(
      "lets the camera's read command reach the whole 4 MiB flash, not just the first 64 KiB",
    );
    expect(row.textContent).not.toContain('mov.w');
    expect(row.textContent).not.toMatch(/\bfamily\b|staged form|Staged form/);
    unmount();
  });

  it('the planned stop of the whole-flash read leads to the restore, not another try (42.101)', () => {
    const ran: [PreservePhaseId, PreservePhaseRunOptions][] = [];
    const state = runState(
      { backup: 'done', patch: 'done', commit: 'done', drain: 'failed' },
      { nextStep: 'restore', drainEntered: 'a' },
    );
    const view = renderPreserve({ state, connected: true }, ran);
    const row = phaseRow(view.container, 'Write & whole-flash read');
    expect(row.textContent).toContain('Stopped as planned — the restore is next');
    expect(row.textContent).toContain('Next: the restore puts every written bank back.');
    expect(row.textContent).not.toContain('Try write & whole-flash read again');
    expect(row.textContent).not.toContain('Stopped — see the log');
    const go = [...row.querySelectorAll('button')].find(
      (button) => button.textContent.trim() === 'Go on to step 04: restore the banks',
    );
    expect(go?.disabled).toBe(false);
    act(() => {
      go?.click();
    });
    expect(document.body.querySelector('[role="alertdialog"]')?.textContent).toContain(
      'Restore & verify',
    );
    view.unmount();
  });

  it('after step 02: the next start and why, every bank, the choice, and what step 03 writes', () => {
    const chosen: string[] = [];
    const { container, unmount } = renderPreserve({
      state: runState({ backup: 'done', patch: 'done' }, { nextStep: 'commit' }),
      connected: true,
      chooseBanks: (choice) => {
        chosen.push(choice);
        return null;
      },
    });
    const row = phaseRow(container, 'Read & build');
    expect(row.textContent).toContain('Which banks step 03 patches');
    expect(row.textContent).toContain('0xFFFFFFFF — slot A first, then B, then recovery R');
    expect(row.textContent).toContain('slot A, as the camera records it (active-slot word 0)');
    expect(row.textContent).toContain(
      'slot A — the boot-config word 0xFFFFFFFF tries slot A first, and slot A passes its check',
    );
    expect(row.textContent).toContain('0x14070000');
    expect(row.textContent).toContain('not written — it is erased');
    expect(row.textContent).toContain('Step 03 writes slot A, the bank the next start enters');
    /* An erased bank is not offered, with the reason. */
    expect(row.textContent).toContain(
      'Slot B: not offered — slot B cannot be written: it is erased',
    );
    const select = row.querySelector<HTMLSelectElement>('#preserveBankChoice');
    expect(select?.value).toBe('next-start');
    const offered = [...(select?.options ?? [])].filter((option) => !option.disabled);
    expect(offered.map((option) => option.value)).toEqual(['next-start', 'a', 'all']);
    act(() => {
      if (select === null) return;
      select.value = 'all';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(chosen).toEqual(['all']);
    unmount();
  });

  it('a choice that leaves out the next start warns, and the dialog names the banks and the warning', () => {
    const state = runState(
      { backup: 'done', patch: 'done' },
      {
        nextStep: 'commit',
        choice: 'r',
        targets: ['r'],
        banks: { a: preserveBankOf('a'), b: preserveErasedBankOf('b'), r: preserveBankOf('r') },
      },
    );
    const { container, unmount } = renderPreserve({ state, connected: true });
    const row = phaseRow(container, 'Read & build');
    expect(row.textContent).toContain('The next start enters slot A');
    expect(row.textContent).toContain('this choice does not patch it');
    act(() => {
      runButton(phaseRow(container, 'Write & whole-flash read')).click();
    });
    const dialog = document.body.querySelector('[role="alertdialog"]');
    expect(dialog?.textContent).toContain('Write & whole-flash read — write to recovery R?');
    expect(dialog?.textContent).toContain('this choice does not patch it');
    unmount();
  });

  it('every bank: the dialog lists them in the order the commit writes them', () => {
    const state = runState(
      { backup: 'done', patch: 'done' },
      {
        nextStep: 'commit',
        choice: 'all',
        targets: ['a', 'r'],
        boot: preserveBootOf({ word: 2, rule: 'recovery R first, then A, then B', nextStart: 'r' }),
        banks: { a: preserveBankOf('a'), b: preserveErasedBankOf('b'), r: preserveBankOf('r') },
      },
    );
    const { container, unmount } = renderPreserve({ state, connected: true });
    act(() => {
      runButton(phaseRow(container, 'Write & whole-flash read')).click();
    });
    const dialog = document.body.querySelector('[role="alertdialog"]');
    /* Word 2 tries R first, so R is written last. */
    expect(dialog?.textContent).toContain('write to slot A and recovery R?');
    expect(dialog?.textContent).toContain('in that order');
    unmount();
  });

  it('once the commit has run, the choice is fixed', () => {
    const { container, unmount } = renderPreserve({
      state: runState({ backup: 'done', patch: 'done', commit: 'done' }, { nextStep: 'drain' }),
      connected: true,
    });
    const row = phaseRow(container, 'Read & build');
    expect(row.querySelector<HTMLSelectElement>('#preserveBankChoice')?.disabled).toBe(true);
    expect(row.textContent).toContain('the choice is fixed');
    unmount();
  });

  it('a board-patched image: the plan names the edit and the adjust-word share it holds', () => {
    const { container, unmount } = renderPreserve({
      state: runState(
        { backup: 'done', patch: 'done' },
        {
          nextStep: 'commit',
          buildStorage: 'compact-2016',
          buildId: 'compact-pro-1.0.3.0',
          buildLabel: 'Compact Pro 1.0.3.0 (9 Hz)',
          expectedVersion: '1.0.3.0',
          stagedForm: 'xor-ks0',
          restoreForm: 'factory-staged',
          banks: {
            a: preserveBankOf('a', {
              buildId: 'compact-pro-1.0.3.0',
              buildLabel: 'Compact Pro 1.0.3.0 (9 Hz)',
              imageDerivation: {
                id: 'compact-pro-1.0.3.0-accept-pn297',
                label: 'the Compact (PN297) board patch',
                balanceWord: 0x6322e32a,
              },
              patch: preservePatchOf({
                sites: [
                  { name: 'widen', offset: 0x3636, before: [1, 2, 3, 4], after: [5, 6, 7, 8] },
                ],
                rebalanceWord: 0x5423132a,
                stagedLength: 51848,
                chunkCount: 811,
                diffCount: 5,
              }),
            }),
            b: preserveErasedBankOf('b'),
            r: preserveErasedBankOf('r'),
          },
        },
      ),
      connected: true,
    });
    const row = phaseRow(container, 'Read & build');
    expect(row.textContent).toContain('Image edit');
    expect(row.textContent).toContain('the Compact (PN297) board patch');
    expect(row.textContent).toContain('0x6322E32A');
    expect(row.textContent).toContain('0x5423132A (was 0x6322E32A, the edit’s balance)');
    unmount();
  });

  it('the verify verdict is unmistakable, both ways', () => {
    const matched = runState(
      { backup: 'done', patch: 'done', commit: 'done', drain: 'done', restore: 'done' },
      {
        nextStep: 'verify',
        verify: { diffBytes: 0, windowsRead: 31, badWindows: [] },
      },
    );
    const okView = renderPreserve({ state: matched, connected: true });
    expect(phaseRow(okView.container, 'Restore & verify').textContent).toContain(
      'Verified — a perfect match',
    );
    okView.unmount();

    const mismatched = runState(
      {
        backup: 'done',
        patch: 'done',
        commit: 'done',
        drain: 'done',
        restore: 'done',
        verify: 'failed',
      },
      {
        nextStep: 'done',
        steps: {},
      },
    );
    /* The failed verify's recorded error carries the differing count. */
    const state = {
      ...mismatched,
      nextStep: 'verify',
      steps: {
        backup: { status: 'done' },
        patch: { status: 'done' },
        commit: { status: 'done' },
        drain: { status: 'done' },
        restore: { status: 'done' },
        verify: {
          status: 'failed',
          error: 'the verify read 4096 differing byte(s) over 31/31 windows',
        },
      },
    } as unknown as PreserveRunState;
    const badView = renderPreserve({ state, connected: true });
    const row = phaseRow(badView.container, 'Restore & verify');
    expect(row.textContent).toContain('The check found differences');
    expect(row.textContent).toContain('4096 differing byte(s)');
    badView.unmount();
  });

  it('a finished run shows the sha pairs and the archive download', () => {
    const full = runState(
      {
        backup: 'done',
        patch: 'done',
        commit: 'done',
        drain: 'done',
        restore: 'done',
        verify: 'done',
      },
      {
        nextStep: 'done',
        deliveredSha256: 'a'.repeat(64),
        rawDumpSha256: 'c'.repeat(64),
        verify: { diffBytes: 0, windowsRead: 31, badWindows: [] },
      },
    );
    const { container, unmount } = renderPreserve({
      state: full,
      connected: true,
      deliveredCheck: { blocksCompared: 31, differing: [], onlyInFullDump: [0x14000000] },
    });
    /* The complete image is held against the backup — the comparison that can
     * actually match — never against the one-slot firmware image's sha. */
    expect(container.textContent).toContain('matches the backup on all 31 blocks');
    expect(container.textContent).not.toContain('DOES NOT match');
    expect(container.textContent).toContain('Only in the whole-flash read');
    expect(container.textContent).toContain('0x14000000');
    expect(container.textContent).toContain('Whole-flash read, as read');
    expect(container.textContent).toContain('Firmware image (decrypted, slot A)');
    expect(buttonByText(container, 'Download the full archive (run file)')).toBeTruthy();
    unmount();
  });
  it('the Connect pick after a restart is the user’s turn — a blue ask with its own Connect button, never red', () => {
    let connects = 0;
    const state = runState(
      { backup: 'done', patch: 'done', commit: 'done' },
      { nextStep: 'drain' },
    );
    const { container, unmount } = renderPreserve({
      state,
      connected: false,
      busy: true,
      activePhase: 'patch-dump',
      prompt: { phase: 'patch-dump', kind: 'reconnect' },
      onConnect: () => {
        connects += 1;
      },
    });
    const row = phaseRow(container, 'Write & whole-flash read');
    expect(row.textContent).toContain('Your turn: press Connect device and pick the camera');
    expect(row.textContent).toContain('restarted, as planned');
    const ask = row.querySelector('[data-slot="alert"]');
    expect(ask?.className).toContain('border-l-primary');
    expect(ask?.className).not.toContain('destructive');
    /* The ask's own button works while the phase holds the run lock. */
    const connect = buttonByText(row, 'Connect device');
    expect(connect.disabled).toBe(false);
    act(() => {
      connect.click();
    });
    expect(connects).toBe(1);
    /* Only the phase that waits shows it. */
    expect(phaseRow(container, 'Read & build').textContent).not.toContain('Your turn');
    unmount();
  });

  it('the replug a pre-fix patch owes is asked the same calm way', () => {
    const state = runState(
      { backup: 'done', patch: 'done', commit: 'done', drain: 'done' },
      { nextStep: 'restore' },
    );
    const { container, unmount } = renderPreserve({
      state,
      connected: true,
      prompt: { phase: 'patch-dump', kind: 'replug-before-restore' },
      onConnect: () => undefined,
    });
    const row = phaseRow(container, 'Write & whole-flash read');
    expect(row.textContent).toContain('Before step 04: unplug the camera, plug it back in');
    expect(row.querySelector('[data-slot="alert"]')?.className).toContain('border-l-primary');
    unmount();
  });

  it('a backup that needs a power cycle asks for the replug, and its continue button carries the assertion', () => {
    const ran: [PreservePhaseId, PreservePhaseRunOptions][] = [];
    const state = runState({}, {
      nextStep: 'backup',
      steps: { backup: { status: 'failed', powerCycleRequired: true } },
    } as unknown as Partial<PreserveRunState>);
    const { container, unmount } = renderPreserve({ state, connected: true }, ran);
    const row = phaseRow(container, 'Read & build');
    expect(row.textContent).toContain('Your turn: unplug the camera, plug it back in');
    expect(runButton(row).disabled).toBe(true);
    const go = buttonByText(row, 'I replugged it — continue read & build');
    expect(go.className).not.toContain('destructive');
    act(() => {
      go.click();
    });
    expect(ran).toEqual([['read-build', { powerCycled: true }]]);
    unmount();
  });

  it('no step reads as alarming before anything has gone wrong — no red buttons, borders or badges', () => {
    const { container, unmount } = renderPreserve({ state: runState(), connected: true });
    for (const label of ['Read & build', 'Write & whole-flash read', 'Restore & verify']) {
      const row = phaseRow(container, label);
      expect(row.innerHTML).not.toContain('destructive');
    }
    unmount();
  });
  it('a complete image that differs from the backup says where, in red', () => {
    const full = runState(
      {
        backup: 'done',
        patch: 'done',
        commit: 'done',
        drain: 'done',
        restore: 'done',
        verify: 'done',
      },
      { nextStep: 'done', deliveredSha256: 'a'.repeat(64) },
    );
    const { container, unmount } = renderPreserve({
      state: full,
      connected: true,
      deliveredCheck: { blocksCompared: 31, differing: [0x14020000], onlyInFullDump: [] },
    });
    expect(container.textContent).toContain(
      'differs from the backup in 1 of 31 blocks: 0x14020000',
    );
    unmount();
  });

  it("a bank that holds an unknown image: the bank table and the choices say it in core's words", () => {
    const words = unknownImageWords('1.3.0.8');
    const { container, unmount } = renderPreserve({
      state: runState(
        { backup: 'done', patch: 'done' },
        {
          nextStep: 'commit',
          banks: {
            a: preserveBankOf('a'),
            b: preserveErasedBankOf('b'),
            r: (({ patch: _patch, ...bank }) => ({ ...bank, refused: words }))(preserveBankOf('r')),
          },
        },
      ),
      connected: true,
      chooseBanks: () => null,
    });
    const row = phaseRow(container, 'Read & build');
    expect(row.textContent).toContain(`not written — ${words}`);
    expect(row.textContent).toContain(
      `Recovery R: not offered — recovery R cannot be written: ${words}`,
    );
    expect(words).toMatch(/^it holds an unknown image \(not the stock 1\.3\.0\.8 firmware/);
    unmount();
  });
});
