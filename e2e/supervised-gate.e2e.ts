/* ==================================================================== *
 * The supervised write gate's refusals — `npm run e2e:gate`.
 *
 * No browser, no device: this pins the logic that keeps a camera write from
 * ever running by accident or in CI (`approveWrite`, lib/supervised-write.ts).
 * It is the proof the gate refuses; the proof it ALLOWS the right flow is the
 * write flows themselves running on the emulator target.
 *
 * It also pins the page guard a confirmed camera write runs under
 * (`writeGuardScript({ lifted: true })`), the exact preload source, run in a
 * bare VM context against a recording stand-in for `USBDevice`: Preserve's
 * two flash writes go out only inside the budget the test opens for a phase,
 * in Preserve's shapes, with the plan's checksum; the strict guard opens
 * nothing whatever budget is set on it.
 * ==================================================================== */

import { PassThrough } from 'node:stream';
import { runInNewContext } from 'node:vm';

import { afterEach, describe, expect, it } from 'vitest';

import { OP } from '../packages/core/src/protocol/ops.js';
import { WRITE_GUARD_GLOBAL, writeGuardScript } from './lib/camera-flow.js';
import { approveWrite, type Terminal, type WriteChallenge } from './lib/supervised-write.js';
import type { WriteGuardControl } from './lib/write-guard.js';

const CHALLENGE: WriteChallenge = { token: '1.3.0.0:40447c7e', describe: 'test' };
const challenge = (): Promise<WriteChallenge> => Promise.resolve(CHALLENGE);

/** A terminal that types `line` once asked, as a person would. */
function scripted(line: string | null): { terminal: Terminal; shown: () => string } {
  const input = new PassThrough();
  const output = new PassThrough();
  let shown = '';
  output.on('data', (chunk: Buffer) => {
    shown += chunk.toString();
    if (line !== null && shown.includes('Type exactly')) input.write(`${line}\n`);
  });
  return {
    terminal: {
      input,
      output,
      close: () => {
        input.destroy();
        output.destroy();
      },
    },
    shown: () => shown,
  };
}

describe('the supervised write gate', () => {
  const saved = { write: process.env.SEEK_E2E_WRITE, ci: process.env.CI };
  afterEach(() => {
    if (saved.write === undefined) delete process.env.SEEK_E2E_WRITE;
    else process.env.SEEK_E2E_WRITE = saved.write;
    if (saved.ci === undefined) delete process.env.CI;
    else process.env.CI = saved.ci;
  });

  it('waves the emulator target through without any confirmation', async () => {
    const verdict = await approveWrite('emu', challenge);
    expect(verdict).toEqual({ approved: true, dry: false, reason: 'emulator target' });
  });

  it('refuses the camera target without SEEK_E2E_WRITE', async () => {
    delete process.env.SEEK_E2E_WRITE;
    const verdict = await approveWrite('camera', challenge);
    expect(verdict.approved).toBe(false);
    expect(verdict.dry).toBe(false);
    expect(verdict.reason).toMatch(/SEEK_E2E_WRITE=i-understand/);
  });

  it('refuses the camera target in CI even with the env set', async () => {
    process.env.SEEK_E2E_WRITE = 'i-understand';
    process.env.CI = 'true';
    const verdict = await approveWrite('camera', challenge);
    expect(verdict.approved).toBe(false);
    expect(verdict.reason).toMatch(/CI is set/);
  });

  it('refuses the camera target when there is no terminal to ask on', async () => {
    process.env.SEEK_E2E_WRITE = 'i-understand';
    delete process.env.CI;
    /* vitest runs a spec with its stdio piped; the gate asks the controlling
     * terminal, and a process started by automation has none. */
    expect(process.stdin.isTTY).toBeFalsy();
    let asked = false;
    const verdict = await approveWrite(
      'camera',
      () => {
        asked = true;
        return challenge();
      },
      { terminal: () => null },
    );
    expect(verdict.approved).toBe(false);
    expect(verdict.reason).toMatch(/not a TTY/);
    expect(asked, 'the camera is not even read for a challenge').toBe(false);
  });

  it('asks on the terminal, and only the exact challenge passes', async () => {
    process.env.SEEK_E2E_WRITE = 'i-understand';
    delete process.env.CI;
    const right = scripted(CHALLENGE.token);
    const verdict = await approveWrite('camera', challenge, { terminal: () => right.terminal });
    expect(right.shown()).toContain(`Type exactly "${CHALLENGE.token}"`);
    expect(verdict).toEqual({ approved: true, dry: false, reason: 'confirmed at the terminal' });

    for (const typed of ['1.3.0.0', `${CHALLENGE.token}x`, 'yes']) {
      const wrong = scripted(typed);
      const refused = await approveWrite('camera', challenge, { terminal: () => wrong.terminal });
      expect(refused.approved, typed).toBe(false);
      expect(refused.reason).toMatch(/confirmation did not match/);
    }
  });

  it('a terminal that never answers times out into a refusal', async () => {
    process.env.SEEK_E2E_WRITE = 'i-understand';
    delete process.env.CI;
    const silent = scripted(null);
    const verdict = await approveWrite('camera', challenge, {
      terminal: () => silent.terminal,
      timeoutMs: 200,
    });
    expect(verdict.approved).toBe(false);
    expect(verdict.reason).toMatch(/confirmation did not match \(""\)/);
  });

  it('dry-run reaches the challenge and then stops before any write', async () => {
    process.env.SEEK_E2E_WRITE = 'dry-run';
    delete process.env.CI;
    let asked = false;
    const verdict = await approveWrite('camera', () => {
      asked = true;
      return Promise.resolve(CHALLENGE);
    });
    expect(asked).toBe(true);
    expect(verdict.approved).toBe(false);
    expect(verdict.dry).toBe(true);
    expect(verdict.reason).toContain('dry run');
  });
});

/* ---- the page guard of a confirmed write, run as the preload runs it ---- */

/** The preload `script` in a context of its own, over a `USBDevice` that records what went out. */
function guarded(script: string): {
  out: (request: number, bytes: number[] | Uint8Array) => Promise<string>;
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

    controlTransferIn(): Promise<unknown> {
      return Promise.resolve({ status: 'ok', data: new DataView(new ArrayBuffer(4)) });
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
  return { out, control, sent };
}

const STAGE = OP.SET_FEATURED_FIRMWARE_DATA;
const COMMIT = OP.COMPLETE_MEMORY_UPGRADE;
const u16 = (value: number): number[] => [value & 0xff, value >>> 8];

describe("a confirmed write's page guard", () => {
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
