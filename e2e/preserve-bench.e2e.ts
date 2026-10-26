/* ====================================================================
 * Preserve (steps 02, 03 and 04) with its bank choice on a REAL bench camera of either chain, through
 * Electron and real WebUSB: the Compact PRO FF board on 1.0.3.0 (TESTING.md 42.98) or the Compact on
 * 1.3.0.0 (42.102). Nothing here names a build: the words checked are core's for any camera.
 * One window, as a person uses the page: Connect, the
 * Preserve tab's step 02, the "Banks to patch" menu, step 03 (its dialog, the commit, the drain) and
 * step 04 (the restore and the verify). Every page text, dialog, log and run file is kept.
 *
 * THE BENCH:
 *   SEEK_E2E_WRITE=i-understand      the gate (`approveWrite`); never in CI
 *   SEEK_E2E_PRESERVE_BANK=<choice>  next-start (default), a, b, r or all: picked in "Banks to patch"
 *   SEEK_E2E_PRESERVE_EXPECT=<what>  run (default): 02, 03 and 04 run, and the verify matches;
 *                                    stop: 03's drain stops before it arms anything (the start entered a
 *                                    bank the run did not patch), then 04 puts the written banks back;
 *                                    refuse: 02 refuses (slot A holds an unknown image, for example
 *                                    a frame-rate patch), and nothing is written
 *   SEEK_E2E_PRESERVE_OUT=<dir>      where the page text, screenshots and run files are kept
 *   SEEK_E2E_SOURCE=docs|dev         the hosted bundle or the Vite dev server
 *
 * The page guard is the slots bench's (`benchGuardScript`: the Info read's selectors let out by
 * shape; the stage and commit budgets 0 except inside the phase the test opens). Resets are capped
 * per phase but not tight: the 2014 chain's reader restarts before each block it reads. The J-Link
 * reads before and after are the operator's (FW-V1's runner); nothing here touches the J-Link.
 * ==================================================================== */

import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { say } from './lib/browser.js';
import { describeWire, runState, wireSince } from './lib/checks.js';
import { countsOf, guardOf, setGuard } from './lib/electron-camera.js';
import { electronBinary } from './lib/electron.js';
import { cameraBusyReason } from './lib/preflight.js';
import { HEADED } from './lib/spec.js';
import { approveWrite } from './lib/supervised-write.js';
import { closeSharedDevServer, openTarget, type TargetHandle } from './lib/target.js';
import { guardInstalled, refusalsOf } from './lib/target-tools.js';
import { benchGuardScript, checkChooserEntry } from './lib/bench/spec-page.js';
import { phaseSection, type PhaseId, type PhaseRun, type UiGuard } from './lib/wizard.js';

const SCRATCH =
  process.env.SEEK_E2E_SCRATCH ??
  path.join(tmpdir(), `seek-e2e-preserve-bench-${String(process.pid)}`);
const OUT = process.env.SEEK_E2E_PRESERVE_OUT ?? path.join(SCRATCH, 'out');
const SOURCE: 'docs' | 'dev' = process.env.SEEK_E2E_SOURCE === 'dev' ? 'dev' : 'docs';
const CHOICE = process.env.SEEK_E2E_PRESERVE_BANK ?? 'next-start';
const EXPECT = process.env.SEEK_E2E_PRESERVE_EXPECT ?? 'run';
if (!['next-start', 'a', 'b', 'r', 'all'].includes(CHOICE)) {
  throw new Error(`SEEK_E2E_PRESERVE_BANK is next-start, a, b, r or all, not "${CHOICE}"`);
}
if (!['run', 'stop', 'refuse'].includes(EXPECT)) {
  throw new Error(`SEEK_E2E_PRESERVE_EXPECT is run, stop or refuse, not "${EXPECT}"`);
}

/** One whole 64 KiB bank in 64-byte chunks, plus slack, per bank a phase writes. */
const STAGES_PER_BANK = Math.ceil(0x10000 / 64) + 64;
/** Resets a phase may send: a restart before each of the 31 blocks a sweep reads, plus slack. */
const RESETS_PER_PHASE = 40;

/** Preserve's own steps and their confirmation; the Flash view, the forget button and the jumps stay refused. */
const PRESERVE_BENCH_UI: UiGuard = {
  name: 'Preserve, bench (steps 02 to 04)',
  allowClick: (label) =>
    !/flash|forget|raw|jump past|skip the commit|i replugged it|choose plaintext image/i.test(
      label,
    ),
  allowRoute: (hash) => /^#\/(preserve)?$/.test(hash),
  allowPhase: () => true,
};

const gate = await approveWrite('camera', () =>
  Promise.resolve({
    describe:
      `Preserve on the bench camera with the choice "${CHOICE}" (expect: ${EXPECT}): ` +
      'step 02 reads; step 03 commits the patch into the chosen banks and drains; step 04 puts them back.',
  }),
);
function unavailable(): string | null {
  if (electronBinary() === null) return 'the electron package is not installed';
  return cameraBusyReason();
}
const UNAVAILABLE = unavailable();
const RUNNABLE = gate.approved && UNAVAILABLE === null;
if (!RUNNABLE) {
  process.stderr.write(
    `\n[skip] Preserve on the bench camera: ${gate.approved ? (UNAVAILABLE ?? '') : gate.reason}.\n`,
  );
}

describe.skipIf(!RUNNABLE)(
  `Preserve on the bench camera (choice ${CHOICE}, expect ${EXPECT})`,
  () => {
    let target: TargetHandle | null = null;
    let banks = 0;
    let step03Ended: 'done' | 'stopped' | null = null;
    const live = (): TargetHandle => {
      if (target === null) throw new Error('the window is not open (an earlier step failed)');
      return target;
    };

    async function keep(name: string, text: string): Promise<void> {
      mkdirSync(OUT, { recursive: true });
      writeFileSync(path.join(OUT, `${name}.txt`), text);
      await live().page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
      say(`kept ${name}.txt and ${name}.png`);
    }

    async function sectionText(phase: PhaseId): Promise<string> {
      return live().page.evaluate(
        (sel: string) => document.querySelector<HTMLElement>(sel)?.innerText ?? '',
        phaseSection(phase),
      );
    }

    async function phaseLog(phase: PhaseId): Promise<string> {
      return live().page.evaluate(
        (id: string) =>
          [...(document.getElementById(`${id}-log`)?.children ?? [])]
            .map((line) => line.textContent)
            .join('\n'),
        `preserve-phase-${phase}`,
      );
    }

    /** Each write confirmation, as it read while open, before Yes was pressed. */
    const seenDialogs: string[] = [];
    async function dialogs(): Promise<string[]> {
      return Promise.resolve([...seenDialogs]);
    }

    async function wire(): Promise<Map<string, number>> {
      return countsOf(await guardOf(live().page));
    }

    function keepRunFile(run: PhaseRun, tag: string): void {
      mkdirSync(OUT, { recursive: true });
      writeFileSync(path.join(OUT, `${tag}-${run.runFile.name}`), run.runFile.bytes);
    }

    /** Opens the phase's write budget, runs it, shuts the budget. Returns the run, or the error it ended with. */
    async function inPhase(
      phase: PhaseId,
      budget: { stages: number; commits: number; resets: number },
    ): Promise<{ run: PhaseRun | null; error: string | null }> {
      const { page, wizard } = live();
      await setGuard(page, {
        allowReset: budget.resets > 0,
        resetBudget: budget.resets,
        stageBudget: budget.stages,
        commitBudget: budget.commits,
        commitSum16: null,
      });
      try {
        /* The wizard starts the phase; the dialog is read here while it is open, then confirmed
         * (the wizard's own confirm presses Yes at once, and a closing dialog reads differently). */
        const running = wizard
          .runPhase(phase, { confirm: false, timeoutMs: 60 * 60_000 })
          .then((run) => ({ run, error: null }))
          .catch((error: unknown) => ({
            run: null,
            error: error instanceof Error ? error.message : String(error),
          }));
        if (phase !== 'read-build') {
          await page.waitForSelector('[role="alertdialog"]', { timeout: 10_000 });
          await new Promise((resolve) => setTimeout(resolve, 500));
          seenDialogs.push(
            await page.$eval('[role="alertdialog"]', (el) => (el as HTMLElement).innerText),
          );
          await wizard.click('[role="alertdialog"]', 'Yes — write to the camera');
        }
        return await running;
      } catch (error) {
        return { run: null, error: error instanceof Error ? error.message : String(error) };
      } finally {
        await setGuard(page, {
          allowReset: false,
          resetBudget: null,
          stageBudget: 0,
          commitBudget: 0,
          commitSum16: null,
        }).catch(() => undefined);
      }
    }

    beforeAll(async () => {
      mkdirSync(OUT, { recursive: true });
      say(`scratch ${SCRATCH}; out ${OUT}; source ${SOURCE}; choice ${CHOICE}; expect ${EXPECT}`);
      const opened = await openTarget('camera', {
        scratchDir: path.join(SCRATCH, 'window'),
        source: SOURCE,
        sharedServer: SOURCE === 'dev',
        uiGuard: PRESERVE_BENCH_UI,
        preloadSource: `${benchGuardScript()}\n`,
        headed: HEADED,
      });
      target = opened;
      await opened.wizard.route('#/');
      say(`connected: ${checkChooserEntry(await opened.wizard.connect())}`);
      if (!(await guardInstalled(opened))) throw new Error('the write guard is not in the page');
    }, 10 * 60_000);

    afterAll(async () => {
      if (target !== null) {
        const guard = await guardOf(target.page).catch(() => null);
        if (guard !== null) {
          say(`wire (whole window): ${describeWire(countsOf(guard))}`);
          writeFileSync(
            path.join(OUT, 'wire.txt'),
            `${describeWire(countsOf(guard))}\nrefusals: ${JSON.stringify(guard.refusals)}\n` +
              `resets: ${JSON.stringify(guard.resets)}\nusb events: ${JSON.stringify(guard.usbEvents)}\n`,
          );
        }
        await target.close().catch((error: unknown) => {
          say(`close failed: ${String(error)}`);
        });
        target = null;
      }
      await closeSharedDevServer();
    }, 2 * 60_000);

    it('step 02 reads the banks; the choice is made in "Banks to patch"', async () => {
      const { page, wizard } = live();
      await wizard.openPreserve();
      const before = await wire();
      const { run, error } = await inPhase('read-build', {
        stages: 0,
        commits: 0,
        resets: RESETS_PER_PHASE,
      });
      const sent = wireSince(before, await wire());
      say(`step 02 wire: ${describeWire(sent)}`);
      await keep('02-section', await sectionText('read-build'));
      writeFileSync(path.join(OUT, '02-log.txt'), await phaseLog('read-build'));
      expect(sent.get('out 0x50') ?? 0, 'no chunk staged in step 02').toBe(0);
      expect(sent.get('out 0x51') ?? 0, 'no commit in step 02').toBe(0);
      if (EXPECT === 'refuse') {
        writeFileSync(path.join(OUT, '02-error.txt'), error ?? '(no error)');
        say(`step 02 ended: ${error ?? 'done'}`);
        expect(error, 'step 02 refuses').not.toBeNull();
        const shown = await sectionText('read-build');
        expect(shown).toMatch(/Slot A holds an unknown image \(not the stock [\d.]+ firmware/);
        expect(shown).toContain('a frame-rate patch is not one');
        expect(shown).toContain(
          'To preserve this camera, write the stock image back to slot A first',
        );
        expect(await wizard.isEnabled(phaseSection('patch-dump'), 'Start patch & dump')).toBe(
          false,
        );
        expect(await refusalsOf(live()), 'nothing refused by the guards').toEqual([]);
        return;
      }
      if (run === null) throw new Error(`step 02 failed: ${String(error)}`);
      keepRunFile(run, '02');
      if (CHOICE !== 'next-start') {
        await page.select('#preserveBankChoice', CHOICE);
        await page.waitForFunction(
          (want: string) =>
            (document.querySelector<HTMLSelectElement>('#preserveBankChoice')?.value ?? '') ===
            want,
          { timeout: 10_000 },
          CHOICE,
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      const shown = await sectionText('read-build');
      await keep('02-chosen', shown);
      const writes = await page.evaluate(
        () =>
          document.querySelector<HTMLElement>('[data-testid="preserve-banks-to-write"]')
            ?.innerText ?? '',
      );
      say(`banks to write: ${writes}`);
      const state = runState(run.entries);
      say(
        `run file v${String(state.version)}: choice ${state.choice}, ` +
          `targets ${JSON.stringify(state.targets)}, next start ${String(state.boot?.nextStart)}`,
      );
      expect(state.version).toBe(3);
      /* The banks the phase budgets cover: every writable bank for "all" (and for the next start
       * when it is not known), else one. The sentence's words are not parsed: they changed in 42.98,
       * and a count read from them once let one bank's budget cover an every-bank run. */
      const writable = (shown.match(/— can be written;/g) ?? []).length;
      banks = CHOICE === 'all' || writes.startsWith('Step 03 writes every bank') ? writable : 1;
      say(`banks the budgets cover: ${String(banks)}`);
      expect(banks, 'at least one bank to write').toBeGreaterThan(0);
      expect(await refusalsOf(live()), 'nothing refused by the guards').toEqual([]);
    });

    it('step 03 commits the chosen banks and drains (or stops before it arms)', async (test) => {
      test.skip(EXPECT === 'refuse', 'step 02 refused: nothing to write');
      if (banks === 0) throw new Error('step 02 did not choose a bank');
      const before = await wire();
      const { run, error } = await inPhase('patch-dump', {
        stages: banks * STAGES_PER_BANK,
        commits: banks,
        resets: RESETS_PER_PHASE,
      });
      const sent = wireSince(before, await wire());
      say(`step 03 wire: ${describeWire(sent)}`);
      writeFileSync(path.join(OUT, '03-dialogs.txt'), (await dialogs()).join('\n\n-----\n\n'));
      await keep('03-section', await sectionText('patch-dump'));
      writeFileSync(path.join(OUT, '03-log.txt'), await phaseLog('patch-dump'));
      writeFileSync(path.join(OUT, '03-error.txt'), error ?? '(none)');
      say(`step 03: ${error ?? run?.status ?? ''}`);
      expect(sent.get('out 0x51') ?? 0, 'one commit per chosen bank').toBe(banks);
      if (run !== null) keepRunFile(run, '03');
      step03Ended = run !== null ? 'done' : 'stopped';
      if (EXPECT === 'stop') {
        expect(error, 'the drain stops').not.toBeNull();
        /* The commit's own session arms to read the banks back; the drain reads nothing. */
        expect(sent.get('in 0x4f') ?? 0, 'no whole-flash read').toBeLessThan(1000);
        expect(await phaseLog('patch-dump')).toContain('so nothing was read');
        /* The planned stop's action is the restore, not another try (TESTING.md 42.101). */
        const stopped = await sectionText('patch-dump');
        expect(stopped).toContain('Go on to step 04: restore the banks');
        expect(stopped).toContain('Stopped as planned — the restore is next');
        expect(stopped).not.toContain('Try patch & dump again');
      } else {
        expect(error, 'step 03 finishes').toBeNull();
      }
    });

    it('step 04 puts every written bank back and the verify matches', async (test) => {
      test.skip(EXPECT === 'refuse', 'step 02 refused: nothing to restore');
      if (step03Ended === null) throw new Error('step 03 did not run');
      const before = await wire();
      const { run, error } = await inPhase('restore-verify', {
        stages: banks * STAGES_PER_BANK,
        commits: banks,
        resets: RESETS_PER_PHASE,
      });
      const sent = wireSince(before, await wire());
      say(`step 04 wire: ${describeWire(sent)}`);
      writeFileSync(path.join(OUT, '04-dialogs.txt'), (await dialogs()).join('\n\n-----\n\n'));
      await keep('04-section', await sectionText('restore-verify'));
      writeFileSync(path.join(OUT, '04-log.txt'), await phaseLog('restore-verify'));
      await keep('04-body', await live().page.evaluate(() => document.body.innerText));
      if (run === null) throw new Error(`step 04 failed: ${String(error)}`);
      keepRunFile(run, '04');
      const state = runState(run.entries);
      say(`verify: ${JSON.stringify(state.verify)}; next step ${state.nextStep}`);
      expect(sent.get('out 0x51') ?? 0, 'one commit per written bank').toBe(banks);
      expect(state.nextStep).toBe('done');
      expect(state.verify?.diffBytes).toBe(0);
      expect(await refusalsOf(live()), 'nothing refused by the guards').toEqual([]);
    });
  },
);
