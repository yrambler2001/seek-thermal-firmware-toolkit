/* ==================================================================== *
 * Unplug / replug mid-read — `npm run e2e:unplug`.
 *
 * The same body on both targets. A Dump & decrypt is cut off mid-read by
 * taking the camera's power away. It must then END cleanly, with an error and
 * not a hang. Once the power is back and the camera is picked again, the
 * camera reads whole, with the same sha as before.
 *
 *   emulator   stopping the emulator IS the cable being pulled; a fresh
 *              emulator booted from the same flash is the replug.
 *   camera     the rp2040 USB power switch cuts the camera's VBUS
 *              (`e2e/lib/power-switch.ts`), on the channel named by
 *              `SEEK_E2E_SWITCH_CHANNEL` (the bench camera is on 2). Without
 *              it nothing is toggled and the test only reports. The power is
 *              cut only during the read-only dump, with the page's write guard
 *              in place. It comes back three ways: the switch's own `cycle`
 *              turns it on again by itself, the test turns it on in a
 *              `finally`, and once more after the last test.
 *
 * The "replug after an unfixed-patch drain" ask and the "power-cycle" ask are
 * NOT reached here. The first follows only the drain of step 03, which writes.
 * The second needs a reader that is still spent after the wire reboots of
 * step 02, which a power cut cannot produce (it gives a fresh boot) and stock
 * firmware never shows. Both stay covered by the wizard's unit tests
 * (`usePreservePanel.adoption.test.tsx`).
 * ==================================================================== */

import { afterAll, expect, it } from 'vitest';

import { say } from './lib/browser.js';
import { sha256 } from './lib/checks.js';
import {
  Rp2040PowerSwitch,
  seekCamerasOnBus,
  switchInfo,
  waitForCameras,
} from './lib/power-switch.js';
import { targetSpec } from './lib/spec.js';
import type { TargetHandle } from './lib/target.js';
import {
  expectedImageSha,
  guardInstalled,
  refusalsOf,
  waitForProgress,
} from './lib/target-tools.js';

const image = (entries: readonly { name: string; data: Uint8Array }[]): Uint8Array =>
  entries.find((e) => /^[^/]+\/flash_4m_usb[^/]*\.bin$/.test(e.name))?.data ?? new Uint8Array(0);

/** Taking the camera's power away and giving it back, on this target. */
interface Power {
  readonly what: string;
  /** Cut the power, and wait until the camera has left the bus. */
  off(): Promise<void>;
  /** Restore the power, and wait until the camera is back on the bus. */
  on(): Promise<void>;
}

/** How long the camera's channel stays off. The switch's own firmware turns it
 *  back on after this (`cycle`), so even a run killed mid-cut leaves the camera
 *  powered. */
const POWER_OFF_MS = 8000;

function powerFor(t: TargetHandle, hw: Rp2040PowerSwitch | null): Power | null {
  const emu = t.emu;
  if (emu !== null) {
    return {
      what: 'the emulator stopped (the cable pulled)',
      off: () => emu.unplug(),
      on: () => emu.replug(),
    };
  }
  if (hw === null) return null;
  return {
    what: `${hw.describe()}, off for ${String(POWER_OFF_MS)} ms`,
    off: async () => {
      await hw.cycle(POWER_OFF_MS);
      if (!(await waitForCameras(0, 5000))) {
        throw new Error(`the camera is still on the bus after ${hw.describe()} went off`);
      }
    },
    on: async () => {
      /* The cycle ends by itself; `on` is idempotent, and makes sure of it. */
      await waitForCameras(1, POWER_OFF_MS + 15_000);
      await hw.on();
      if (!(await waitForCameras(1, 30_000))) {
        throw new Error(`the camera did not come back after ${hw.describe()} went on`);
      }
    },
  };
}

targetSpec({ title: 'unplug / replug mid-read', slug: 'unplug' }, (ctx) => {
  const hw = ctx.name === 'camera' ? Rp2040PowerSwitch.fromEnv() : null;

  /* Whatever happened above, the camera ends the run powered. */
  afterAll(async () => {
    if (hw === null) return;
    await hw.on();
    say(`switch at the end: ${await hw.status()}`);
  });

  it('connects', async () => {
    await ctx.target().wizard.connect();
  });

  it('a mid-dump power cut fails cleanly, and power back + re-pick reads again', async () => {
    const t = ctx.target();
    const power = powerFor(t, hw);
    if (power === null) {
      const info = await switchInfo();
      say(
        'camera target: SEEK_E2E_SWITCH_CHANNEL is not set, so nothing is toggled — set it to ' +
          `the rp2040 channel the camera is on, or unplug by hand; switch board: ${info.detail}`,
      );
      return;
    }
    if (hw !== null) {
      /* The camera must be powered and alone on the bus before anything is cut. */
      const status = await hw.status();
      say(`switch: ${status}`);
      expect(await hw.isOn(), `${hw.describe()} is on`).toBe(true);
      expect(seekCamerasOnBus(), 'one Seek camera on the bus').toBe(1);
    }

    const w = t.wizard;
    await w.route('#/v4');
    await w.startDump('dump', 'Start dump');
    await waitForProgress(t.page, 'dump', 10);
    /* Nothing but the read-only dump is running, under the page's write guard. */
    expect(await w.text('#dump-status')).not.toMatch(/^(Done|Failed|Cancelled|Refused)/);
    expect(await guardInstalled(t), 'the write guard is in place').toBe(true);
    expect(await refusalsOf(t)).toEqual([]);

    say(`cutting the power mid-dump: ${power.what}`);
    let ended: string;
    try {
      await power.off();
      say('the camera has left the bus');
      /* The dump must END — an error, not a hang. */
      await t.page.waitForFunction(
        () =>
          /^(Failed|Refused|Cancelled|Done)/.test(
            document.querySelector<HTMLElement>('#dump-status')?.innerText ?? '',
          ),
        { timeout: 90_000, polling: 500 },
      );
      ended = await w.text('#dump-status');
      say(`after the power cut: ${ended}`);
      say(`dump log tail:\n${await w.logTail('dump', 6)}`);
    } finally {
      say('restoring the power');
      await power.on();
    }
    expect(ended).toMatch(/^(Failed|Refused|Cancelled)/);
    say('the camera is back on the bus');

    await w.connect(); /* the camera that came back is new to the browser — it needs a pick */
    const again = await w.dumpAndDecrypt(20 * 60_000);
    const read = sha256(image(again.entries));
    say(`read again after the power came back: ${again.status} sha ${read.slice(0, 16)}`);
    expect(again.status).toMatch(/^Done — (\d+)\/\1 windows read\. /);
    const sha = expectedImageSha(t);
    if (sha !== '') expect(read).toBe(sha);
    expect(await refusalsOf(t)).toEqual([]);
  });
});
