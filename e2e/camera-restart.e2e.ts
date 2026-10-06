/* ==================================================================== *
 * The camera's restart, end to end, on real WebUSB — READ-ONLY —
 * `npm run e2e:camera:restart`.
 *
 * Step 02 reboots the camera only when its reader probe finds a dead reader,
 * and on stock 2014 firmware it never does, so `e2e:camera` never sees a
 * restart there. This run makes the page SEE one: the write guard's test-only
 * fault answers
 * the first 26 of step 02's reader-probe reads (28-byte IN 0x4F — the probe's
 * whole budget, `openProbedSession` in packages/core/src/preservation/
 * pipeline.ts) with `status: 'stall'`, unsent — exactly what a dead reader
 * answers on the wire (TESTING.md sec. 28.4). From there it is all the app's
 * own code: the probe gives up, reboots the camera by its own plain
 * ResetDevice (u16 0), the camera leaves the bus and comes back as a new
 * device, the page asks "Your turn", the test answers Electron's chooser, and
 * the step carries on with real reads. Every later read is real.
 *
 * The guards are those of `camera.e2e.ts`, unchanged, plus a cap on resets.
 * Anything beyond "plain reset, re-enumerate, re-pick, continue" fails the run,
 * and any ask but the Connect pick stops it.
 *
 * NOT EVERY FIRMWARE IS STOCK 2014. The cap used to be ONE reset, on the
 * premise that the step never restarts the camera by itself — and a camera
 * whose boot-config block is erased (Compact PRO 1.0.3.0 on the bench part)
 * reads "blank" on every boot, so its step 02 restarts it once per window.
 * That is the app's behaviour, not this run's, so it is measured and reported:
 * the injected restart must go out, every restart must be answered the same
 * way, and the count beyond the injected one is said, not failed. The cap
 * (`RESET_CAP`) stays, far above any honest run, so a reset loop still ends
 * refused unsent.
 *
 * It also measures what Electron does across a real re-enumeration: whether
 * the page gets a `disconnect` and a `connect`, what `getDevices()` answers
 * while the camera is gone and back, and whether the camera comes back under
 * a new device id.
 * ==================================================================== */

import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { BOOT_CONFIG_BYTES } from '../packages/core/src/preservation/windows.js';
import { OP } from '../packages/core/src/protocol/ops.js';
import { say } from './lib/browser.js';
import {
  NEVER_ON_THE_WIRE,
  checkDumpArchive,
  checkStep02RunFile,
  checkStep03Offered,
  needsStep02,
  step02,
} from './lib/camera-flow.js';
import { describeWire, wireSince } from './lib/checks.js';
import {
  checkGuardAndConnect,
  closeCameraSession,
  countsOf,
  guardOf,
  openCameraSession,
  setGuard,
  type CameraSession,
} from './lib/electron-camera.js';
import { electronBinary } from './lib/electron.js';
import { cameraBusyReason } from './lib/preflight.js';
import type { PhaseRun } from './lib/wizard.js';
import type { WriteGuardControl } from './lib/write-guard.js';

const SCRATCH =
  process.env.SEEK_E2E_SCRATCH ?? path.join(tmpdir(), `seek-e2e-restart-${String(process.pid)}`);
const KEEP = process.env.SEEK_E2E_KEEP === '1';
const HEADED = process.env.SEEK_E2E_HEADED === '1';

/** `openProbedSession`'s probe: 26 reads, 20 ms apart, before it reboots. */
const PROBE_READS = 26;

/**
 * The most resets the run lets out: one per backup window (31), the active
 * bank's fresh boot, and the injected one, with room to spare. Beyond it the
 * guard refuses the reset unsent and the run fails.
 */
const RESET_CAP = 64;

function unavailable(): string | null {
  if (electronBinary() === null) return 'the electron package is not installed';
  return cameraBusyReason();
}

const UNAVAILABLE = unavailable();
if (UNAVAILABLE !== null)
  process.stderr.write(`\n[skip] e2e restart on the camera: ${UNAVAILABLE}\n`);

describe.skipIf(UNAVAILABLE !== null)(
  'the camera restarts in step 02 on real WebUSB (Electron), read-only',
  () => {
    let session: CameraSession | null = null;
    let step02Failure: string | null = null;

    const need = (): CameraSession => {
      if (session === null) throw new Error('Electron is not up (an earlier step failed)');
      return session;
    };

    beforeAll(async () => {
      session = await openCameraSession(SCRATCH, HEADED);
    });

    afterAll(async () => {
      await closeCameraSession(session, SCRATCH, KEEP);
    });

    it('connects, and Dump & decrypt reads the camera', async () => {
      const { app, wizard } = need();
      await checkGuardAndConnect(need());
      const dump = await wizard.dumpAndDecrypt(20 * 60_000);
      checkDumpArchive(dump);
      expect((await guardOf(app.page)).refusals).toEqual([]);
    });

    it('step 02 meets a dead reader: the app reboots the camera, asks for it, and finishes', async () => {
      const { app, wizard } = need();
      await wizard.openPreserve();
      const before = await guardOf(app.page);
      const startedAt = Date.now();
      await setGuard(app.page, {
        allowReset: true,
        resetBudget: RESET_CAP,
        fault: {
          request: OP.GET_FEATURED_FIRMWARE_DATA,
          length: BOOT_CONFIG_BYTES,
          remaining: PROBE_READS,
        },
      });
      let after: WriteGuardControl;
      let run: PhaseRun | null = null;
      let stepError: Error | null = null;
      try {
        run = await step02(() =>
          wizard.runPhase('read-build', { confirm: false, timeoutMs: 30 * 60_000 }),
        );
      } catch (error) {
        /* The restart is measured whichever way the step ends; its own end is
         * rethrown after (a known app refusal says so in its first line). */
        stepError = error instanceof Error ? error : new Error(String(error));
        step02Failure = stepError.message;
      } finally {
        after = await guardOf(app.page);
        await setGuard(app.page, { allowReset: false, resetBudget: null, fault: null });
      }

      /* The fault: exactly the probe's budget, all spent on the first probe. */
      expect(after.injected).toHaveLength(PROBE_READS);
      expect(after.fault?.remaining).toBe(0);
      /* The injected restart went out, the plain reset, and the wire answered
       * it. More is this firmware's own doing: measured, said, not failed. */
      expect(after.resets.length).toBeGreaterThanOrEqual(1);
      const outcomes = new Map<string, number>();
      for (const r of after.resets) outcomes.set(r.outcome, (outcomes.get(r.outcome) ?? 0) + 1);
      say(
        `${String(after.resets.length)} reset(s): ` +
          [...outcomes].map(([outcome, n]) => `${outcome} x${String(n)}`).join('; '),
      );
      const own = after.resets.length - 1;
      if (own > 0) {
        say(
          `this firmware restarted the camera ${String(own)} more time(s) in step 02 on its own ` +
            '(the step reboots when its reader probe reads the boot-config record as blank, ' +
            'and an erased record reads blank on every boot), so the "stock firmware never ' +
            'restarts" premise does not hold here; every restart was answered as the injected one',
        );
      }
      const wire = wireSince(countsOf(before), countsOf(after));
      say(`step 02 wire: ${describeWire(wire)}`);
      expect(wire.get('out 0x59')).toBe(after.resets.length);
      for (const op of NEVER_ON_THE_WIRE) expect(wire.has(op), op).toBe(false);
      expect(after.refusals).toEqual([]);

      /* WHAT ELECTRON DID, measured on the page across the re-enumerations. */
      const resetAt = after.resets[0]?.at ?? startedAt;
      const events = after.usbEvents.filter((e) => e.at >= startedAt);
      const calls = after.getDevicesCalls.filter((c) => c.at >= resetAt);
      say(
        `usb events: ${events.map((e) => `${e.type} +${String(e.at - resetAt)}ms`).join(', ') || 'none'}; ` +
          `getDevices() after the first reset: ${calls.map((c) => `${String(c.devices)} +${String(c.at - resetAt)}ms`).join(', ')}`,
      );
      /* One disconnect per restart, and never a connect. */
      expect(events.map((e) => e.type)).toEqual(after.resets.map(() => 'disconnect'));
      const gone = events[0]?.at ?? resetAt;
      expect(calls.some((c) => c.at >= gone && c.devices === 0)).toBe(true);
      const ids = app.devicesSeen.filter((d) => d.vendorId === 0x289d).map((d) => d.deviceId);
      say(`the camera's device ids across the run: ${ids.join(' -> ')}`);
      expect(new Set(ids).size).toBeGreaterThanOrEqual(2);

      const log = await wizard.text('#preserve-phase-read-build-log');
      const around = log
        .split('\n')
        .filter((line) =>
          /reader probe|reboot command|restart|Your turn|back|re-adopted|did not open|disconnected/i.test(
            line,
          ),
        );
      say(`step 02 log around the resets:\n  ${around.slice(0, 40).join('\n  ')}`);

      if (stepError !== null) throw stepError;
      if (run === null) throw new Error('step 02 returned no run');
      /* The page's view of each restart: the calm blue ask, answered once. */
      expect(run.asks).toBe(after.resets.length);
      for (const ask of run.askViews) {
        expect(ask.tone).toBe('info');
        expect(ask.redAlerts).toEqual([]);
      }
      expect(calls.at(-1)?.devices).toBe(1);
      const state = checkStep02RunFile(run);
      say(
        `run ${state.runId}: firmware ${state.expectedVersion ?? '?'}, next step ${state.nextStep}`,
      );
    });

    it('Dump & decrypt again: the reboot changed nothing on the camera', async () => {
      const { app, wizard } = need();
      const before = countsOf(await guardOf(app.page));
      const dump = await wizard.dumpAndDecrypt(20 * 60_000);
      const wire = wireSince(before, countsOf(await guardOf(app.page)));
      checkDumpArchive(dump);
      for (const op of [...NEVER_ON_THE_WIRE, 'out 0x59']) expect(wire.has(op), op).toBe(false);
    });

    it('step 03 is offered with no red alarm, and nothing was refused anywhere', async (test) => {
      const { app, wizard } = need();
      const guard = await guardOf(app.page);
      expect(guard.refusals).toEqual([]);
      test.skip(step02Failure !== null, needsStep02(step02Failure) ?? '');
      await wizard.openPreserve();
      await checkStep03Offered(wizard, app.page);
      expect(guard.refusals).toEqual([]);
      for (const op of ['out 0x50', 'out 0x51']) expect(guard.counts[op], op).toBeUndefined();
      expect(app.timeline.filter((line) => line.includes('REFUSED'))).toEqual([]);
    });
  },
);
