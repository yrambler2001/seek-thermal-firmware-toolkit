/* ==================================================================== *
 * Resume from a run file — `npm run e2e:resume` (emu by default; camera with
 * SEEK_E2E_TARGET=camera is read-only and checks only).
 *
 * Step 02 downloads a patch-built run file. Reloading the page and loading that
 * file resumes the run at step 03 (next step "commit"), with no red past-commit
 * alarm. On the emulator, and only with SEEK_E2E_RESUME_FULL=1, the run then
 * CONTINUES through 03 and 04 to "Verified — a perfect match."; on the camera
 * that is a write and is never run here (it would need the write gate).
 *
 * Also: an old flat-layout run file (checkpoints at the top, no step folders)
 * loads and resumes, and a broken/foreign zip fails calmly — a clear "Not
 * resumed" line, not a wall of red.
 *
 * Step 02 runs as it does in `camera.e2e.ts` (`runStep02`): its plain reset is
 * allowed while it runs, and no guard may refuse anything. When it ends without
 * a run file, the tests that need one say so and skip.
 * ==================================================================== */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { buildZip } from '@seek-fw/core';
import { expect, it } from 'vitest';

import { say } from './lib/browser.js';
import { checkStep03Offered, needsStep02 } from './lib/camera-flow.js';
import { runState } from './lib/checks.js';
import { targetSpec } from './lib/spec.js';
import { runStep02 } from './lib/target-tools.js';
import { readZip } from './lib/zip.js';

const FULL = process.env.SEEK_E2E_RESUME_FULL === '1';

targetSpec({ title: 'resume from a run file', slug: 'resume' }, (ctx) => {
  let patchBuilt = '';
  let step02Failure: string | null = null;

  it('step 02 produces a patch-built run file', async () => {
    const t = ctx.target();
    await t.wizard.connect();
    try {
      const run = await runStep02(t);
      patchBuilt = run.runFile.path;
      expect(runState(run.entries).nextStep).toBe('commit');
    } catch (error) {
      step02Failure = error instanceof Error ? error.message : String(error);
      throw error;
    }
  });

  it('a reloaded page loads that run file and resumes at step 03', async (test) => {
    const t = ctx.target();
    test.skip(step02Failure !== null, needsStep02(step02Failure) ?? '');
    await t.reload();
    const status = await t.wizard.loadRunFile(patchBuilt);
    expect(status).toMatch(/^Resumed at commit/);
    await checkStep03Offered(t.wizard, t.page);
  });

  it.skipIf(!FULL)(
    'continues through 03 and 04 to Verified (emulator write path)',
    async (test) => {
      const t = ctx.target();
      test.skip(step02Failure !== null, needsStep02(step02Failure) ?? '');
      if (!t.writesSafe) {
        say('camera target: the continue-through-03/04 write path is gated — not run here');
        return;
      }
      await t.wizard.runPhase('patch-dump', { confirm: true, timeoutMs: 60 * 60_000 });
      await t.wizard.runPhase('restore-verify', { confirm: true, timeoutMs: 60 * 60_000 });
      const text = await t.page.evaluate(() => document.body.innerText);
      expect(text).toContain('Verified — a perfect match.');
    },
  );

  it('an old flat-layout run file still loads', async (test) => {
    const t = ctx.target();
    test.skip(step02Failure !== null, needsStep02(step02Failure) ?? '');
    /* Rebuild the patch-built zip with every entry at the top level. */
    const flat = buildZip(
      readZip(new Uint8Array(readFileSync(patchBuilt))).map((e) => ({
        name: e.name.slice(e.name.lastIndexOf('/') + 1),
        data: e.data,
      })),
    );
    const flatPath = path.join(ctx.scratch, 'flat-run.zip');
    writeFileSync(flatPath, flat);
    await t.reload();
    const status = await t.wizard.loadRunFile(flatPath);
    expect(status).toMatch(/^Resumed at commit/);
  });

  it('a broken/foreign zip fails calmly, with no wall of red', async () => {
    const t = ctx.target();
    const brokenPath = path.join(ctx.scratch, 'broken.zip');
    writeFileSync(
      brokenPath,
      buildZip([{ name: 'notes.txt', data: new TextEncoder().encode('hi') }]),
    );
    await t.reload();
    const status = await t.wizard.loadRunFile(brokenPath);
    expect(status).toMatch(/^Not resumed/);
    const reds = await t.wizard.redAlerts();
    say(`broken zip: "${status}"; ${String(reds.length)} red alert(s)`);
    expect(
      reds.length,
      'a broken file explains itself in the log, not a wall of red alerts',
    ).toBeLessThanOrEqual(1);
  });
});
