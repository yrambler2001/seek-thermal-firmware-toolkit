/* ====================================================================
 * The seek-fps checker on the REAL camera, READ-ONLY: `info`, and `--fps` in Normal and in Hi FPS.
 *
 *   SEEK_E2E_TARGET=camera npx vitest run --config e2e/vitest.config.ts seek-fps-camera.e2e
 *
 * Skipped unless SEEK_E2E_TARGET=camera (the same gate as fps-bench.e2e.ts, which also throws without
 * it; this spec skips instead, so the file can sit in a normal run). Nothing here writes flash: every
 * request the run sends is recorded at the transport, and the spec fails on any request outside the
 * list the Swift tool sends (lib/bench/seek-fps/camera.ts CHECKER_REQUESTS_IN / _OUT), on any flash
 * or reset request (0x50 SetFeaturedFirmwareData, 0x51 CompleteMemoryUpgrade, 0x52 BeginFirmwareUpgrade,
 * 0x59 ResetDevice), and on any bulk read that is not the frame endpoint. 0x5A SetRamDataFeatures is allowed by the
 * list: it arms the device-id block that the serial is read from (TESTING.md 42.61), as the CLI's `info` arms it.
 *
 * The run is the checker's own command line (lib/bench/seek-fps/cli.ts), so what the spec measures is what
 * the orchestrator runs by hand: `--camera info`, `--camera --fps --mode normal --no-hifps` (Normal) and
 * `--camera --fps` (Hi FPS, the default option, which switches to FastRaw on the first shutter frame).
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { CHECKER_REQUESTS_IN, CHECKER_REQUESTS_OUT } from './lib/bench/seek-fps/camera.js';
import { runSeekFps, type CameraSession, type CliIo } from './lib/bench/seek-fps/cli.js';
import { FRAME_ENDPOINT } from './lib/bench/seek-fps/link.js';
import { openNodeUsbCamera, wallSeconds } from './lib/bench/seek-fps/node-usb-link.js';

const CAMERA = process.env.SEEK_E2E_TARGET === 'camera';
/** Requests that change the flash or reset the part. None may be sent by this checker. */
const FLASH_OR_RESET: readonly number[] = [0x50, 0x51, 0x52, 0x59];

interface Sent {
  readonly dir: 'in' | 'out' | 'bulk';
  readonly request: number;
  readonly payload: readonly number[];
}

/** The real camera's session, with every control and bulk call recorded at the transport. */
async function openRecorded(sent: Sent[]): Promise<CameraSession> {
  const link = await openNodeUsbCamera();
  const transport = link.transport;
  const controlIn = transport.controlIn.bind(transport);
  const controlOut = transport.controlOut.bind(transport);
  const bulkIn = link.bulkIn.bind(link);
  transport.controlIn = (request, length, timeoutMs) => {
    sent.push({ dir: 'in', request, payload: [length] });
    return controlIn(request, length, timeoutMs);
  };
  transport.controlOut = (request, data, timeoutMs) => {
    sent.push({ dir: 'out', request, payload: [...data] });
    return controlOut(request, data, timeoutMs);
  };
  link.bulkIn = (endpoint, length, timeoutMs) => {
    sent.push({ dir: 'bulk', request: endpoint, payload: [length] });
    return bulkIn(endpoint, length, timeoutMs);
  };
  return { link, clock: wallSeconds, release: () => link.close() };
}

/** Collects the checker's output lines. */
function capture(): { lines: string[]; errors: string[]; io: CliIo } {
  const lines: string[] = [];
  const errors: string[] = [];
  return { lines, errors, io: { out: (l) => lines.push(l), err: (l) => errors.push(l) } };
}

/** Asserts the recorded requests are the Swift tool's init and stream set, and nothing that writes. */
function expectReadOnly(sent: readonly Sent[]): void {
  for (const entry of sent) {
    if (entry.dir === 'in')
      expect(CHECKER_REQUESTS_IN, `IN ${String(entry.request)}`).toContain(entry.request);
    if (entry.dir === 'out') {
      expect(CHECKER_REQUESTS_OUT, `OUT ${String(entry.request)}`).toContain(entry.request);
      expect(FLASH_OR_RESET, `OUT ${String(entry.request)} writes flash or resets`).not.toContain(
        entry.request,
      );
    }
    if (entry.dir === 'bulk') expect(entry.request, 'bulk endpoint').toBe(FRAME_ENDPOINT);
  }
}

const RUNS: readonly { readonly name: string; readonly argv: readonly string[] }[] = [
  { name: 'info', argv: ['info', '--camera'] },
  {
    name: 'Normal (--fps, Init Hi FPS off)',
    argv: ['--fps', '--camera', '--mode', 'normal', '--no-hifps'],
  },
  { name: 'Hi FPS (--fps, the default options)', argv: ['--fps', '--camera'] },
];

describe.skipIf(!CAMERA)('the seek-fps checker on the real camera (read-only)', () => {
  for (const run of RUNS) {
    it(`${run.name}: the requests are the Swift set, nothing writes, and the output is the checker's`, async () => {
      const sent: Sent[] = [];
      const out = capture();
      const code = await runSeekFps(run.argv, () => openRecorded(sent), out.io);
      process.stdout.write(`\n--- seek-fps ${run.argv.join(' ')}\n${out.lines.join('\n')}\n`);
      expect(out.errors, out.errors.join('\n')).toEqual([]);
      expect(code).toBe(0);
      expectReadOnly(sent);
      expect(sent.filter((s) => s.dir === 'out').length).toBeGreaterThan(0);
      if (run.argv.includes('--fps')) {
        const seconds = out.lines.filter((l) => /^second \d+: mean/.test(l));
        expect(seconds).toHaveLength(5);
        expect(out.lines.at(-1)).toMatch(/^overall: mean [\d.]+ fps over 5 s/);
      }
    }, 120_000);
  }
});
