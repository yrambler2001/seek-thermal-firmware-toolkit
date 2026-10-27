/* ==================================================================== *
 * Cancelling mid-read — `npm run e2e:cancel` (emu by default; camera with
 * SEEK_E2E_TARGET=camera, read-only).
 *
 * Cancel Dump & decrypt once it is under way, then run it again and get the
 * whole part back with the same sha. Also cancels step 02 mid-backup, when the
 * UI allows, and shows the camera still reads afterwards — the same image.
 *
 * Step 02 runs as it does in `camera.e2e.ts`: its plain reset is allowed while
 * it runs, every "Your turn" ask on the way is answered, and no guard may
 * refuse anything. On the camera's guard a refused reset used to pass unseen.
 * ==================================================================== */

import { expect, it } from 'vitest';

import { say } from './lib/browser.js';
import { sha256 } from './lib/checks.js';
import { phaseSection, Wizard } from './lib/wizard.js';
import { targetSpec } from './lib/spec.js';
import { allowStep02Reset, checkImage, refusalsOf, waitForProgress } from './lib/target-tools.js';

const image = (entries: readonly { name: string; data: Uint8Array }[]): Uint8Array =>
  entries.find((e) => /^[^/]+\/flash_dump_original\.bin$/.test(e.name))?.data ?? new Uint8Array(0);

targetSpec({ title: 'cancel mid-read', slug: 'cancel' }, (ctx) => {
  it('connects', async () => {
    await ctx.target().wizard.connect();
  });

  it('cancels Dump & decrypt mid-read, then a clean re-run returns the whole part', async () => {
    const t = ctx.target();
    const w = t.wizard;
    await w.route('#/v4');
    await w.startDump('dump', 'Start dump');
    /* A few windows in (the bar past 10 %), so the cancel lands mid-sweep. */
    const at = await waitForProgress(t.page, 'dump', 10, 5 * 60_000);
    say(`dump at ${String(at)} %: ${await w.text('#dump-status')}`);
    const cancelled = await w.cancel('dump', 'section[aria-labelledby="dump-heading"]');
    say(`after cancel: ${cancelled}`);
    expect(cancelled).toMatch(/^Done — ([1-9]\d*)\/(\d+) windows read \(cancelled\)/);
    /* A cancelled dump still downloads its PARTIAL archive. Consume it so the
     * re-run's wait picks up the full one, not this one. */
    await t.downloads.waitFor((n) => /^seek_flash4m_.+\.zip$/.test(n), 60_000, 'partial dump');

    const again = await w.dumpAndDecrypt(20 * 60_000);
    expect(again.status).toMatch(/^Done — (\d+)\/\1 windows read\. /);
    checkImage(t, sha256(image(again.entries)), 'the re-run after the cancel');
  });

  it('cancels step 02 mid-backup; the camera still reads afterwards', async () => {
    const t = ctx.target();
    const w = t.wizard;
    await w.openPreserve();
    const section = phaseSection('read-build');
    const refusedBefore = (await refusalsOf(t)).length;
    await allowStep02Reset(t, true);
    let stopped: string;
    try {
      await w.click(section, Wizard.startLabel('read-build'));
      /* Well into the backup sweep (its bar past 5 %), not just started — then
       * stop. A camera that reboots between windows asks for itself on the way. */
      const at = await w.waitForPhaseProgress('read-build', 5, 5 * 60_000);
      say(
        `step 02 at ${String(at.percent)} % (${String(at.asks)} ask(s) answered): ` +
          (await t.wizard.text('#preserve-phase-read-build-status')),
      );
      stopped = await w.cancel('preserve-phase-read-build', section);
    } finally {
      await allowStep02Reset(t, false).catch(() => undefined);
    }
    say(`step 02 after cancel: ${stopped}`);
    expect(stopped).toMatch(/Cancelled|Done/i);
    expect((await refusalsOf(t)).slice(refusedBefore), 'no guard refused anything').toEqual([]);
    /* A camera that was rebooting when the cancel landed is new to the page:
     * give its disconnect a moment to arrive, then pick it again if it left. */
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (!(await w.deviceDescription()).includes('VID')) await w.connect();
    /* A cancelled step is not a failure, so a plain re-read works — read-only. */
    const dump = await w.dumpAndDecrypt(20 * 60_000);
    expect(dump.status).toMatch(/^Done — /);
    checkImage(t, sha256(image(dump.entries)), 'the dump after the cancelled step 02');
  });
});
