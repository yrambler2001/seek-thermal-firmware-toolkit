/* ==================================================================== *
 * A second window while the first holds the camera — `npm run e2e:second`
 * (emulator by default; `SEEK_E2E_TARGET=camera` runs it on the real camera).
 *
 * Two windows of one browser profile share the camera's grant, and the USB
 * layer alone does not keep them apart. The second window's `claimInterface`
 * is refused with the NetworkError a system driver causes, and core's
 * transport then talks to the device anyway, on the device recipient
 * (packages/core/src/protocol/webusb.ts, `isPlatformClaimRefusal`). Before
 * the app took a cross-tab camera lock, two windows dumping at once both
 * ended "Done" with wrong, short images and no warning. Now every camera
 * operation holds the lock (packages/web/src/lib/camera-lock.ts) for its whole
 * run, and a window that cannot have it sends nothing and says so.
 *
 * Both targets run the same check. Window 1 dumps. While it reads, window 2
 * presses Start dump, Test connection, Forget device and the Preserve
 * wizard's step 02, and each one is refused with the message: window 2 never
 * opens the device and sends no transfer. Window 1's dump comes back whole,
 * with the right image, and no red alert shows in either window. On the
 * emulator window 2 then dumps on its own once window 1 is done, which shows
 * the lock was let go. On the real camera window 2 sends nothing at all; the
 * only reads are window 1's.
 *
 * "The right image" is the emulator's known part, or on the camera
 * `SEEK_E2E_CAMERA_SHA`; with none named, window 1 first dumps alone, and
 * that uncontended image is the one the contended dump must match.
 * ==================================================================== */

import type { Page } from 'puppeteer-core';
import { expect, it } from 'vitest';

import {
  IN_USE_ELSEWHERE_LOG,
  IN_USE_ELSEWHERE_STATUS,
} from '../packages/web/src/lib/camera-lock.js';
import { say } from './lib/browser.js';
import { describeWire, sha256 } from './lib/checks.js';
import { targetSpec } from './lib/spec.js';
import {
  checkImage,
  expectedImageSha,
  grantedDevices,
  openSecondWindow,
  waitForProgress,
  type SecondWindow,
} from './lib/target-tools.js';
import { Wizard, phaseSection, type DumpRun } from './lib/wizard.js';

const imageSha = (dump: DumpRun): string =>
  sha256(
    dump.entries.find((e) => /^[^/]+\/flash_4m_usb[^/]*\.bin$/.test(e.name))?.data ??
      new Uint8Array(0),
  );

/** Whether this window has the camera open (`USBDevice.opened` is per document). */
function openedIn(page: Page): Promise<boolean> {
  return page.evaluate(async () =>
    (await navigator.usb.getDevices()).some((device) => device.opened),
  );
}

/** How many times `panel`'s log says the camera is in use elsewhere. */
function refusalsShown(page: Page, panel: string): Promise<number> {
  return page.evaluate(
    (id: string, line: string) =>
      (document.getElementById(`${id}-log`)?.innerText ?? '')
        .split('\n')
        .filter((text) => text === line).length,
    panel,
    IN_USE_ELSEWHERE_LOG,
  );
}

/** Clicks `label` in window 2 and waits for its `panel` to show the refusal once more. */
async function refusedIn(
  w2: SecondWindow,
  scope: string,
  label: string,
  panel: string,
): Promise<void> {
  const before = await refusalsShown(w2.page, panel);
  await w2.wizard.click(scope, label);
  await w2.page.waitForFunction(
    (id: string, line: string, want: number) =>
      (document.getElementById(`${id}-log`)?.innerText ?? '')
        .split('\n')
        .filter((text) => text === line).length >= want,
    { timeout: 15_000, polling: 100 },
    panel,
    IN_USE_ELSEWHERE_LOG,
    before + 1,
  );
  expect(await w2.wizard.text(`#${panel}-status`), `${label}: the status line`).toBe(
    IN_USE_ELSEWHERE_STATUS,
  );
  expect(await openedIn(w2.page), `${label}: window 2 never opened the camera`).toBe(false);
  say(`window 2: "${label}" refused — ${IN_USE_ELSEWHERE_STATUS}`);
}

targetSpec({ title: 'a second window is kept off the camera', slug: 'second' }, (ctx) => {
  let second: SecondWindow | null = null;

  it('a second window shares the grant and stays responsive', async () => {
    const t = ctx.target();
    await t.wizard.connect();
    second = await openSecondWindow(t);
    const w2 = second;
    /* Both windows, same browser profile, see the same granted camera. */
    expect(await grantedDevices(t.page), 'window 1 holds the grant').toBeGreaterThanOrEqual(1);
    expect(await grantedDevices(w2.page), 'window 2 shares the grant').toBeGreaterThanOrEqual(1);
    say('the second window sees the same camera');
    expect(await w2.page.evaluate(() => document.title)).toContain('Seek');
  });

  it('window 1 alone reads the reference image, when none is named', async () => {
    const t = ctx.target();
    if (expectedImageSha(t) !== '') {
      say('the true image is named for this target — no reference dump needed');
      return;
    }
    const dump = await t.wizard.dumpAndDecrypt(20 * 60_000);
    expect(dump.status).toMatch(/^Done — (\d+)\/\1 windows read\. /);
    checkImage(t, imageSha(dump), 'window 1 alone');
  });

  it('while window 1 reads, window 2 is refused with the message and sends nothing', async () => {
    const t = ctx.target();
    if (second === null) throw new Error('no second window');
    const w2 = second;

    const dump1 = t.wizard.dumpAndDecrypt(20 * 60_000);
    dump1.catch(() => undefined);
    /* A reference dump may have left its "Done" line and full bar behind:
     * wait for this run to take the line over before reading its bar. */
    await t.page.waitForFunction(
      () =>
        !(document.querySelector<HTMLElement>('#dump-status')?.innerText ?? '').startsWith('Done'),
      { timeout: 60_000, polling: 100 },
    );
    await waitForProgress(t.page, 'dump', 5);

    /* Each try must land while window 1 still holds the camera: one that
     * came after it finished would be a real start, not a refusal. */
    const tryInWindow2 = async (scope: string, label: string, panel: string): Promise<void> => {
      const window1 = await t.wizard.text('#dump-status');
      expect(window1, 'window 1 is still reading').not.toMatch(/^(Done|Failed|Cancelled|Refused)/);
      await refusedIn(w2, scope, label, panel);
    };
    await w2.wizard.route('#/v4');
    const connect = 'section[aria-labelledby="connect-heading"]';
    await tryInWindow2('section[aria-labelledby="dump-heading"]', 'Start dump', 'dump');
    await tryInWindow2(connect, 'Test connection', 'dump');
    await tryInWindow2(connect, 'Forget device', 'dump');
    expect(await grantedDevices(w2.page), 'the refused Forget revoked nothing').toBe(1);
    await w2.wizard.openPreserve();
    await tryInWindow2(
      phaseSection('read-build'),
      Wizard.startLabel('read-build'),
      'preserve-phase-read-build',
    );
    await w2.wizard.route('#/');

    const wire2 = await w2.wire();
    say(`window 2 wire while window 1 read: ${describeWire(wire2) || 'nothing'}`);
    expect([...wire2.keys()], 'window 2 sent no transfer to the camera').toEqual([]);
    expect(await w2.refusals()).toEqual([]);

    const dump = await dump1;
    say(`window 1: ${dump.status} sha ${imageSha(dump).slice(0, 16)}`);
    expect(dump.status).toMatch(/^Done — (\d+)\/\1 windows read\. /);
    checkImage(t, imageSha(dump), 'window 1 while window 2 was refused');
    const reds = [...(await t.wizard.redAlerts()), ...(await w2.wizard.redAlerts())];
    expect(reds, `no red alert in either window: ${reds.join(' | ')}`).toEqual([]);
    /* Window 2's own transfers stay at zero to the end. */
    expect([...(await w2.wire()).keys()]).toEqual([]);
  });

  it('once window 1 is done, window 2 has the camera — EMULATOR only', async () => {
    const t = ctx.target();
    if (second === null) throw new Error('no second window');
    if (t.name !== 'emu') {
      say('camera target: window 2 stays transfer-free; the release is pinned by the unit tests');
      return;
    }
    const dump = await second.wizard.dumpAndDecrypt(20 * 60_000);
    say(`window 2: ${dump.status} sha ${imageSha(dump).slice(0, 16)}`);
    expect(dump.status).toMatch(/^Done — (\d+)\/\1 windows read\. /);
    checkImage(t, imageSha(dump), 'window 2 once window 1 was done');
  });

  it('cleans up the second window', async () => {
    await second?.close();
    second = null;
  });
});
