/* ==================================================================== *
 * Reload mid-step — `npm run e2e:reload` (emu by default; camera read-only
 * with SEEK_E2E_TARGET=camera).
 *
 * Reloading the page in the middle of step 02 must not leave corrupted state:
 * step 02 writes its run file only when it finishes, so a mid-step reload just
 * starts clean, and running step 02 again works. Reloading AFTER step 02, with
 * the run file in hand, resumes at step 03.
 *
 * A page mid-run asks before it unloads (the runner's beforeunload). Chrome
 * shows "Leave site?" and Electron reports `will-prevent-unload`; the reload
 * here answers it as the person would ("Leave"), on either target.
 *
 * Step 02 runs as it does in `camera.e2e.ts`: its plain reset is allowed while
 * it runs, every "Your turn" ask is answered, and no guard may refuse anything.
 * ==================================================================== */

import { expect, it } from 'vitest';

import { say } from './lib/browser.js';
import { checkStep02RunFile, checkStep03Offered, needsStep02 } from './lib/camera-flow.js';
import { describeWire } from './lib/checks.js';
import { Wizard, phaseSection } from './lib/wizard.js';
import { targetSpec } from './lib/spec.js';
import {
  allowStep02Reset,
  refusalsOf,
  reloadAnswering,
  runStep02,
  wireOf,
} from './lib/target-tools.js';

targetSpec({ title: 'reload mid-step', slug: 'reload' }, (ctx) => {
  let patchBuilt = '';
  let step02Failure: string | null = null;

  it('connects', async () => {
    await ctx.target().wizard.connect();
  });

  it('a reload mid-step-02 leaves no corrupted state; a fresh step 02 then works', async () => {
    const t = ctx.target();
    await t.wizard.openPreserve();
    const refusedBefore = (await refusalsOf(t)).length;
    /* The reload ends the page, and with it the guard's permission: a new
     * document's guard starts with resets refused again. */
    await allowStep02Reset(t, true);
    await t.wizard.click(phaseSection('read-build'), Wizard.startLabel('read-build'));
    /* Well into the backup sweep (its bar past 5 %), not just started. */
    const at = await t.wizard.waitForPhaseProgress('read-build', 5, 5 * 60_000);
    say(
      `step 02 at ${String(at.percent)} % (${String(at.asks)} ask(s) answered): ` +
        (await t.wizard.text('#preserve-phase-read-build-status')),
    );
    expect((await refusalsOf(t)).slice(refusedBefore), 'no guard refused anything').toEqual([]);
    const { asked } = await reloadAnswering(t);
    say(`mid-step reload: the page ${asked ? 'asked before unloading' : 'did not ask'}`);
    /* After the reload the page is fresh: no run, nothing "Running", no red. */
    await t.wizard.openPreserve();
    const reds = await t.wizard.redAlerts();
    expect(reds, `a mid-step reload left a wall of red: ${reds.join(' | ')}`).toEqual([]);
    const running = await t.page.$$eval('[data-slot="badge"]', (bs) =>
      bs.some((b) => (b as HTMLElement).innerText.trim() === 'Running'),
    );
    expect(running, 'nothing is still marked Running after the reload').toBe(false);
    say('mid-step reload: the page came back clean');

    /* The device came back with the page (the grant survives a reload); make
     * sure, then run step 02 to completion. A camera that was rebooting when
     * the page went is new to it, and needs a pick. */
    if (!(await t.wizard.deviceDescription()).includes('VID')) await t.wizard.connect();
    try {
      const run = await runStep02(t);
      checkStep02RunFile(run);
      patchBuilt = run.runFile.path;
    } catch (error) {
      step02Failure = error instanceof Error ? error.message : String(error);
      throw error;
    }
    say(`wire after the fresh step 02: ${describeWire(await wireOf(t))}`);
  });

  it('a reload after step 02 resumes from the run file at step 03', async (test) => {
    const t = ctx.target();
    test.skip(step02Failure !== null, needsStep02(step02Failure) ?? '');
    expect(patchBuilt, 'the previous test recorded the run file').not.toBe('');
    await reloadAnswering(t);
    const status = await t.wizard.loadRunFile(patchBuilt);
    expect(status).toMatch(/^Resumed at commit/);
    await checkStep03Offered(t.wizard, t.page);
    expect(await refusalsOf(t), 'no guard refused anything').toEqual([]);
  });
});
