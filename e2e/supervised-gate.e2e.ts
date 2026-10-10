/* ==================================================================== *
 * The camera write gate — `npm run e2e:gate`.
 *
 * No browser, no device: this pins the logic that keeps a camera write from
 * ever running by accident or in CI (`approveWrite`, lib/supervised-write.ts).
 * It is the proof the gate refuses; the proof it ALLOWS the right flow is the
 * write flows themselves running on the emulator target.
 *
 * It also pins the page guard an approved camera write runs under
 * (`writeGuardScript({ lifted: true })`), the exact preload source, run in a
 * bare VM context against a recording stand-in for `USBDevice`: Preserve's
 * two flash writes go out only inside the budget the test opens for a phase,
 * in Preserve's shapes, with the plan's checksum; the strict guard opens
 * nothing whatever budget is set on it. And the write window's version seed:
 * a fresh page refuses the commit session's mode-3 probe (what stopped the
 * first camera write, TESTING.md sec. 40), a seeded one lets it out, and the
 * camera's own answer must then agree with the seed. The emulator target has
 * no page guard, so only this can catch it.
 * ==================================================================== */

import { runInNewContext } from 'node:vm';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { OP } from '../packages/core/src/protocol/ops.js';
import { WRITE_GUARD_GLOBAL, writeGuardScript } from './lib/camera-flow.js';
import { approveWrite, type WriteApproval, type WritePlan } from './lib/supervised-write.js';
import type { WriteGuardControl } from './lib/write-guard.js';

const PLAN: WritePlan = { describe: 'test plan' };

describe('the camera write gate', () => {
  const saved = { write: process.env.SEEK_E2E_WRITE, ci: process.env.CI };
  afterEach(() => {
    if (saved.write === undefined) delete process.env.SEEK_E2E_WRITE;
    else process.env.SEEK_E2E_WRITE = saved.write;
    if (saved.ci === undefined) delete process.env.CI;
    else process.env.CI = saved.ci;
  });

  /** The gate, whether it read the camera for its plan, and what it logged. */
  async function gate(
    target: 'emu' | 'camera',
  ): Promise<{ verdict: WriteApproval; planned: boolean; logged: string }> {
    let planned = false;
    let logged = '';
    const stderr = vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
      logged += String(chunk);
      return true;
    });
    try {
      const verdict = await approveWrite(target, () => {
        planned = true;
        return Promise.resolve(PLAN);
      });
      return { verdict, planned, logged };
    } finally {
      stderr.mockRestore();
    }
  }

  it('waves the emulator target through', async () => {
    const { verdict } = await gate('emu');
    expect(verdict).toEqual({ approved: true, dry: false, reason: 'emulator target' });
  });

  it('refuses the camera target without SEEK_E2E_WRITE, before reading the camera', async () => {
    delete process.env.SEEK_E2E_WRITE;
    const { verdict, planned } = await gate('camera');
    expect(verdict).toMatchObject({ approved: false, dry: false });
    expect(verdict.reason).toMatch(/SEEK_E2E_WRITE=i-understand/);
    expect(planned).toBe(false);
  });

  it('refuses any other SEEK_E2E_WRITE value', async () => {
    for (const value of ['1', 'yes', 'true', 'i understand']) {
      process.env.SEEK_E2E_WRITE = value;
      const { verdict, planned } = await gate('camera');
      expect(verdict, value).toMatchObject({ approved: false, dry: false });
      expect(planned, value).toBe(false);
    }
  });

  it('refuses the camera target in CI even with the env set', async () => {
    process.env.SEEK_E2E_WRITE = 'i-understand';
    process.env.CI = 'true';
    const { verdict, planned } = await gate('camera');
    expect(verdict).toMatchObject({ approved: false, dry: false });
    expect(verdict.reason).toMatch(/CI is set/);
    expect(planned).toBe(false);
  });

  it('approves the camera target with SEEK_E2E_WRITE=i-understand, after building its plan', async () => {
    process.env.SEEK_E2E_WRITE = 'i-understand';
    delete process.env.CI;
    const { verdict, planned, logged } = await gate('camera');
    expect(verdict).toEqual({ approved: true, dry: false, reason: 'SEEK_E2E_WRITE=i-understand' });
    expect(planned, 'the plan is built before the write').toBe(true);
    expect(logged, 'and printed to the run log').toContain(PLAN.describe);
  });

  it('dry-run reaches the plan and then stops before any write', async () => {
    process.env.SEEK_E2E_WRITE = 'dry-run';
    delete process.env.CI;
    const { verdict, planned } = await gate('camera');
    expect(planned).toBe(true);
    expect(verdict).toMatchObject({ approved: false, dry: true });
    expect(verdict.reason).toContain('dry run');
  });
});

/* ---- the page guard of an approved write, run as the preload runs it ---- */

/**
 * The preload `script` in a context of its own, over a `USBDevice` that
 * records what went out and answers every IN with `answer`.
 */
function guarded(
  script: string,
  answer: readonly number[] = [0, 0, 0, 0],
): {
  out: (request: number, bytes: number[] | Uint8Array) => Promise<string>;
  read: (request: number, length: number) => Promise<string>;
  control: WriteGuardControl;
  sent: string[];
} {
  const sent: string[] = [];
  class StandInDevice {
    controlTransferOut(setup: USBControlTransferParameters, data?: BufferSource): Promise<unknown> {
      const length = data === undefined ? 0 : (data as Uint8Array).byteLength;
      sent.push(`out 0x${setup.request.toString(16)} ${String(length)} B`);
      return Promise.resolve({ status: 'ok', bytesWritten: length });
    }

    controlTransferIn(_setup: USBControlTransferParameters, _length: number): Promise<unknown> {
      return Promise.resolve({ status: 'ok', data: new DataView(Uint8Array.from(answer).buffer) });
    }
  }
  const context: Record<string, unknown> = {
    USBDevice: StandInDevice,
    DOMException,
    navigator: {},
  };
  runInNewContext(script, context);
  const control = context[WRITE_GUARD_GLOBAL] as WriteGuardControl;
  /* The guard has replaced the prototype's methods: this call goes through it. */
  const device = new StandInDevice();
  const out = async (request: number, bytes: number[] | Uint8Array): Promise<string> => {
    try {
      await device.controlTransferOut(
        { requestType: 'vendor', recipient: 'interface', request, value: 0, index: 0 },
        Uint8Array.from(bytes),
      );
      return 'sent';
    } catch (error) {
      return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    }
  };
  const read = async (request: number, length: number): Promise<string> => {
    try {
      await device.controlTransferIn(
        { requestType: 'vendor', recipient: 'interface', request, value: 0, index: 0 },
        length,
      );
      return 'read';
    } catch (error) {
      return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    }
  };
  return { out, read, control, sent };
}

const STAGE = OP.SET_FEATURED_FIRMWARE_DATA;
const COMMIT = OP.COMPLETE_MEMORY_UPGRADE;
const u16 = (value: number): number[] => [value & 0xff, value >>> 8];

describe("an approved write's page guard", () => {
  it('lets no write out until the test opens a phase', async () => {
    const { out, control, sent } = guarded(writeGuardScript({ lifted: true }));
    expect(control.installed).toBe(true);
    expect(await out(STAGE, new Uint8Array(64))).toMatch(/SecurityError: .*budget/);
    expect(await out(COMMIT, u16(0x128f))).toMatch(/SecurityError: .*budget/);
    expect(await out(0x59, u16(0))).toMatch(/SecurityError: .*outside Preserve step 02/);
    expect(sent).toEqual([]);
  });

  it("an opened phase passes exactly its budget, in Preserve's shapes and checksum", async () => {
    const { out, control, sent } = guarded(writeGuardScript({ lifted: true }));
    Object.assign(control, {
      stageBudget: 2,
      commitBudget: 1,
      commitSum16: 0x128f,
      allowReset: true,
      resetBudget: 1,
    });
    expect(await out(STAGE, new Uint8Array(65))).toMatch(/SetFeaturedFirmwareData with 65 B/);
    expect(await out(STAGE, new Uint8Array(0))).toMatch(/SetFeaturedFirmwareData with 0 B/);
    expect(await out(STAGE, new Uint8Array(64))).toBe('sent');
    expect(await out(STAGE, new Uint8Array(8))).toBe('sent');
    expect(await out(STAGE, new Uint8Array(64))).toMatch(/beyond this phase's budget/);
    expect(await out(COMMIT, u16(0x132c))).toMatch(/checksum 0x132c, not the plan's 0x128f/);
    expect(await out(COMMIT, [0x8f, 0x12, 0])).toMatch(/other than a u16/);
    expect(await out(COMMIT, u16(0x128f))).toBe('sent');
    expect(await out(COMMIT, u16(0x128f))).toMatch(/beyond this phase's budget/);
    expect(await out(0x59, u16(1))).toMatch(/non-zero payload/);
    expect(await out(0x59, u16(0))).toBe('sent');
    expect(await out(0x59, u16(0))).toMatch(/reset budget/);
    expect(sent).toEqual(['out 0x50 64 B', 'out 0x50 8 B', 'out 0x51 2 B', 'out 0x59 2 B']);
  });

  it('keeps the RAM selectors and every other id refused', async () => {
    const { out, control, sent } = guarded(writeGuardScript({ lifted: true }));
    Object.assign(control, { stageBudget: 10, commitBudget: 10 });
    expect(await out(OP.SET_FIRMWARE_INFO_FEATURES, u16(0))).toMatch(/never on this run/);
    expect(await out(OP.SET_RAM_DATA_FEATURES, new Uint8Array(6))).toMatch(/never on this run/);
    expect(await out(0x5b, u16(0))).toMatch(/not on this run's whitelist/);
    expect(sent).toEqual([]);
  });

  it('the strict guard opens nothing, whatever budget is set on it', async () => {
    const { out, control, sent } = guarded(writeGuardScript());
    Object.assign(control, { stageBudget: 10, commitBudget: 10, commitSum16: null });
    expect(await out(STAGE, new Uint8Array(64))).toMatch(/OUT 0x50: a flash write/);
    expect(await out(COMMIT, u16(0x128f))).toMatch(/OUT 0x51: a flash write/);
    expect(sent).toEqual([]);
  });
});

describe("the write window's version seed", () => {
  const ARM = OP.BEGIN_FIRMWARE_UPGRADE;
  const VERSION = OP.GET_FIRMWARE_INFO;
  /** The commit session's reader probe: BeginFirmwareUpgrade mode 3. */
  const PROBE = u16(3);
  /** Step 03's phase, opened as `inWritePhase` opens it on Compact PRO 1.0.3.0. */
  const openPhase = (control: WriteGuardControl): void => {
    Object.assign(control, {
      allowReset: true,
      resetBudget: 3,
      stageBudget: 811,
      commitBudget: 1,
      commitSum16: 0x128f,
    });
  };

  it('a fresh write window refuses the mode-3 probe: the first camera write', async () => {
    const { out, control, sent } = guarded(writeGuardScript({ lifted: true }));
    openPhase(control);
    expect(control.seededVersion).toBeNull();
    expect(await out(ARM, PROBE)).toMatch(
      /SecurityError: .*BeginFirmwareUpgrade before the camera reported its version/,
    );
    expect(sent).toEqual([]);
  });

  it("seeded with step 02's version, the probe goes out, and the camera's answer agrees", async () => {
    const { out, read, control, sent } = guarded(
      writeGuardScript({ lifted: true, seededVersion: '1.0.3.0' }),
      [1, 0, 3, 0],
    );
    openPhase(control);
    expect(control.seededVersion).toBe('1.0.3.0');
    expect(await out(ARM, PROBE)).toBe('sent');
    expect(await read(VERSION, 64)).toBe('read');
    expect(control.version).toBe('1.0.3.0');
    expect(await out(ARM, PROBE)).toBe('sent');
    expect(control.refusals).toEqual([]);
    expect(sent).toEqual(['out 0x52 2 B', 'out 0x52 2 B']);
  });

  it('an answer that disagrees with the seed is refused, and so is every arm after it', async () => {
    const { out, read, control, sent } = guarded(
      writeGuardScript({ lifted: true, seededVersion: '1.0.3.0' }),
      [1, 3, 0, 0],
    );
    openPhase(control);
    expect(await read(VERSION, 64)).toMatch(
      /SecurityError: .*GetFirmwareInfo answered 1\.3\.0\.0, not 1\.0\.3\.0/,
    );
    expect(control.versionMismatch).toBe('1.3.0.0');
    expect(control.version, 'the disagreeing answer is not taken').toBeNull();
    expect(await out(ARM, PROBE)).toMatch(
      /SecurityError: .*after GetFirmwareInfo answered 1\.3\.0\.0, not the seeded 1\.0\.3\.0/,
    );
    expect(sent).toEqual([]);
  });

  it("an unseeded window takes the camera's answer as before, and a seed must be a version", async () => {
    const { out, read, control } = guarded(writeGuardScript(), [1, 3, 0, 0]);
    expect(await read(VERSION, 64)).toBe('read');
    expect(control.version).toBe('1.3.0.0');
    expect(await out(ARM, PROBE)).toBe('sent');
    expect(() => writeGuardScript({ lifted: true, seededVersion: '1.0.3' })).toThrow(
      /a version seed must read like 1\.0\.3\.0/,
    );
  });
});
