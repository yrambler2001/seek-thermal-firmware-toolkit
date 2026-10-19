/* ====================================================================
 * The seek-fps checker on the FW-V1 EMULATOR: the IP modes the emulated stock camera streams, and what
 * the emulator can show of the patched images.
 *
 *   SEEK_EMU_DIR=/Users/yrambler2001/things/a.noindex/seek/FW-V1/emu \
 *     npx vitest run --config e2e/vitest.config.ts seek-fps-emulator.e2e --testTimeout=600000
 *
 * FOR EACH BUILD (1.3.0.0 native dump, 1.3.0.8 8 Hz, 1.3.0.8 FF 16 Hz) AND EACH IP MODE: one boot of the
 * corpus entry, five seconds of the emulated camera's own clock (device.deadlineClock), the same measurement
 * as `seek-fps --fps --emulator ENTRY` (lib/bench/seek-fps/cli.ts measureFps). The device clock, not the
 * host's: on the emulator the host clock measures how fast the emulator runs.
 *
 * THE PATCHED IMAGES. The table patch is applied to the stock part (patch-images.ts, core's applyFpsPatch)
 * and the part is booted with --flash, naming its build with --flash-entry (emulator-link.ts passes the entry).
 * The emulator gives a --flash part the 32K sensor of that build (FW-V1 seekemu/cli.py, --flash-entry), so the
 * patched part streams, and the spec measures its Normal rate the way it measures the stock build's. Before
 * --flash-entry, a --flash boot had no 32K sensor and produced no frames (stock or patched).
 *
 * Nothing here says what a real camera does; the bench run does that.
 * ==================================================================== */

import { readFileSync, writeFileSync } from 'node:fs';
import { afterAll, describe, expect, it } from 'vitest';

import { emulatorDir, liveEmulatorCount } from '../packages/core/test/emulator/harness.js';
import {
  BOOT_TIMEOUT_MS,
  URB_TIMEOUT_MS,
  scratchFile,
} from '../packages/core/test/emulator/suite.js';
import { CONTROL_IP_MODE, SEEK_MODE, SeekCamera } from './lib/bench/seek-fps/camera.js';
import { measureFps } from './lib/bench/seek-fps/cli.js';
import { startEmulatorCamera, type EmulatorCamera } from './lib/bench/seek-fps/emulator-link.js';
import { patchedPart, patchOfId } from './lib/bench/seek-fps/patch-images.js';
import type { FpsWindow } from './lib/bench/seek-fps/stats.js';

const EMU = emulatorDir();
const RUN_MS = 600_000;
const SECONDS = 5;

/** The IP modes measured: the three the checker offers, and the control mode 6. */
const MODES = [
  { key: 'normal', label: 'Normal (IP 8, Init Hi FPS off)', mode: SEEK_MODE.normal, hiFPS: false },
  { key: 'fast', label: 'FastRaw (IP 3)', mode: SEEK_MODE.fastRaw, hiFPS: false },
  { key: 'raw', label: 'Raw (IP 0)', mode: SEEK_MODE.raw, hiFPS: false },
  { key: 'ip6', label: 'control: IP 6 (not a panel mode)', mode: CONTROL_IP_MODE, hiFPS: false },
] as const;

/**
 * The builds the spec measures. `patchable`: the table patch can be written into the stock part, which
 * needs the stock bank to hold the decrypted image as stored (patch-images.ts). The FF build does not:
 * its banks are stored encrypted (42.11b), so its stock bank never matches the table's stock sha.
 */
const BUILDS = [
  {
    label: '1.3.0.0 (native dump)',
    version: '1.3.0.0',
    entryId: 'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump',
    /* the 1.3.0.0 accepts the Startup with Operation=0 write (the panel default) */
    startupOpZero: true,
    patchable: true,
    patchId: 'compact_32k-1.3.0.0-to32',
  },
  {
    label: '1.3.0.8 (8 Hz, image on the 1.3.0.0 donor)',
    version: '1.3.0.8',
    entryId:
      'compact/2017.01.06-11.16.17-1.3.0.8/no-serial/32k_43x0_1.3.0.8_compact-insecure-8hz_public_-_compact_jan_6_2017_11-16-17_99.28_gabiz_ro_firmware',
    /* this build refuses the Startup with Operation=0 write (0x37): the panel's option is unticked */
    startupOpZero: false,
    patchable: true,
    patchId: 'compact_32k-1.3.0.8-to32',
  },
  {
    label: '1.3.0.8-FF (16 Hz build)',
    version: '1.3.0.8',
    entryId:
      'compact/2017.01.06-11.17.29-1.3.0.8-FF/no-serial/32k_43x0_1.3.0.8_compact-16hz_public_-_compact_ff_jan_6_2017_11-17-29_99.28_gabiz_ro_firmware',
    /* this build refuses the Startup with Operation=0 write (0x37): the panel's option is unticked */
    startupOpZero: false,
    patchable: false,
    patchId: 'compact_32k-1.3.0.8-FF-to32',
  },
] as const;

/** The builds not built here, with the reason, so the report says what was not measured. */
const NOT_BUILT: readonly string[] = [
  '4.8.1.7, 4.8.1.9, 4.8.2.1 and 4.16.1.7-FF: Key A banks, stored under a cipher (patch-images.ts)',
  'Compact PRO 1.0.3.0 and 1.0.3.2: the 2016 keystream banks and the 177840-byte frame',
  'Compact PRO 4.9.1.15 and 4.9.2.0: Key A banks (not the 2016 keystream) and the 177840-byte frame',
  '1.3.0.8-FF patched: the FF banks are stored encrypted (42.11b), so the table stock sha (the decrypted image) never matches the stored bank',
];

/**
 * The SetIPMode modes a 1.3.0.8 build refuses. Its handler accepts `(1 << mode) & 0x391`, that is modes
 * 0, 4, 7, 8 and 9 (rpc_cmds.c, cmd_SetIPMode); FastRaw (3) and the control IP 6 are outside it.
 */
const IP_MODES_REFUSED_ON_1_3_0_8 = new Set<number>([SEEK_MODE.fastRaw, CONTROL_IP_MODE]);

interface Row {
  readonly build: string;
  readonly state: 'stock' | 'patched';
  readonly mode: string;
  readonly frames: number;
  readonly windows: readonly FpsWindow[];
  /** Median of the instantaneous rates over the measured seconds (device clock). */
  readonly median: number | null;
  readonly frozenPairs: number;
  readonly pairs: number;
  readonly changedPct: number;
  readonly note: string | null;
  readonly error: string | null;
}

const rows: Row[] = [];
/** The stock 4 MiB part of each build, written by its first (Normal) stock boot. */
const truth = new Map<string, string>();

function line(row: Row): string {
  const win = row.windows.map((w) => w.mean.toFixed(0)).join('/');
  const med = row.median === null ? '-' : row.median.toFixed(2);
  const tail =
    row.error !== null ? `  ERROR: ${row.error}` : row.note !== null ? `  NOTE: ${row.note}` : '';
  return (
    `[seek-fps emu] ${row.build} | ${row.state} | ${row.mode} | frames ${String(row.frames)} | ` +
    `fps per second ${win || '-'} | median ${med} fps | frozen pairs ${String(row.frozenPairs)} of ${String(row.pairs)} ` +
    `| changed ${row.changedPct.toFixed(0)}%${tail}`
  );
}

function medianOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 === 1 ? (s[mid] ?? 0) : ((s[mid - 1] ?? 0) + (s[mid] ?? 0)) / 2;
}

function record(row: Row): void {
  rows.push(row);
  process.stdout.write(`${line(row)}\n`);
}

/** The row of one measurement: its per-second windows, the median of its instantaneous rates, its frozen pairs. */
function rowOf(
  base: Pick<Row, 'build' | 'state' | 'mode' | 'note'>,
  m: Awaited<ReturnType<typeof measureFps>>,
): Row {
  const stamps = m.stats.stamps;
  const rates: number[] = [];
  for (let i = 1; i < stamps.length; i++) {
    const dt = (stamps[i] ?? 0) - (stamps[i - 1] ?? 0);
    if (dt > 0) rates.push(1 / dt);
  }
  return {
    ...base,
    frames: m.frames,
    windows: m.windows,
    median: medianOf(rates),
    frozenPairs: m.stats.frozenPairs,
    pairs: m.stats.pairs,
    changedPct: m.stats.meanChanged() * 100,
    error: null,
  };
}

/**
 * One boot, one measurement: connect, measure `SECONDS` of the camera's clock in `mode`, disconnect, stop.
 * `flashOut` writes the as-booted 4 MiB flash (the ground truth).
 */
async function measureBoot(options: {
  readonly build: string;
  readonly entryId: string;
  readonly startupOpZero: boolean;
  readonly mode: (typeof MODES)[number];
  readonly flashOut?: string;
}): Promise<Row> {
  if (EMU === null) throw new Error('no emulator');
  const base = {
    build: options.build,
    state: 'stock' as const,
    mode: options.mode.label,
    note: null,
  };
  let camera: SeekCamera | null = null;
  let emu: EmulatorCamera | null = null;
  try {
    emu = await startEmulatorCamera({
      emuDir: EMU,
      entryId: options.entryId,
      readyTimeoutMs: BOOT_TIMEOUT_MS,
      urbTimeoutMs: URB_TIMEOUT_MS,
      ...(options.flashOut === undefined ? {} : { flashOut: options.flashOut }),
    });
    const device = emu.device;
    const clock = (): number => device.deadlineClock.now() / 1000;
    camera = await SeekCamera.connect(emu.link, {
      hiFPS: options.mode.hiFPS,
      startupOpZero: options.startupOpZero,
    });
    if (!options.startupOpZero && options.mode.mode !== SEEK_MODE.normal) {
      /* A build that refuses 0x37 leaves the connect in operation 1, and its SetShutterPolarity (0x56) and
       * SetIPMode (0x3E) refuse operation 1 (RPC_MODE0_IDLE). The checker's reinit only sends 0x3C 0 while
       * streaming, and it has stopped the stream by then, so it never gets there: the stall at 0x56. Send
       * the three SetOperationMode(0) first, the stop the checker's sendInit makes while streaming. */
      for (let k = 0; k < 3; k++) {
        await emu.link.transport.controlOut(0x3c, new Uint8Array([0, 0]), URB_TIMEOUT_MS);
      }
    }
    return rowOf(base, await measureFps(camera, options.mode.mode, clock, SECONDS));
  } catch (error) {
    return {
      ...base,
      frames: 0,
      windows: [],
      median: null,
      frozenPairs: 0,
      pairs: 0,
      changedPct: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    if (camera !== null) await camera.disconnect().catch(() => undefined);
    if (emu !== null) await emu.stop();
  }
}

describe.skipIf(EMU === null)('the frame-rate checker on the FW-V1 emulator', () => {
  afterAll(() => {
    process.stdout.write(
      `\n[seek-fps emu] NOT BUILT here:\n${NOT_BUILT.map((n) => `  - ${n}`).join('\n')}\n`,
    );
    expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
  });

  for (const build of BUILDS) {
    describe(build.label, () => {
      for (const m of MODES) {
        it(
          `${m.label}: the stock build, ${String(SECONDS)} s of the camera's clock`,
          async () => {
            const path =
              m.key === 'normal' ? scratchFile(`seek-fps-truth-${build.patchId}.bin`) : undefined;
            const row = await measureBoot({
              build: build.label,
              entryId: build.entryId,
              startupOpZero: build.startupOpZero,
              mode: m,
              ...(path === undefined ? {} : { flashOut: path }),
            });
            if (path !== undefined) truth.set(build.patchId, path);
            record(row);
            if (m.key === 'normal') {
              expect(row.error).toBeNull();
              expect(row.frames, 'the stock build streams in Normal').toBeGreaterThan(0);
            } else if (build.version === '1.3.0.8' && IP_MODES_REFUSED_ON_1_3_0_8.has(m.mode)) {
              /* the build's own refusal, from its SetIPMode handler: the request is refused, nothing streams */
              expect(row.error, 'the build refuses this IP mode in SetIPMode (0x3E)').toMatch(
                /0x3e|62/i,
              );
              expect(row.frames).toBe(0);
            } else {
              expect(row.error).toBeNull();
            }
          },
          RUN_MS,
        );
      }

      it.skipIf(!build.patchable)(
        'the patched part (the table patch on bank A) boots on its own build and streams Normal frames',
        async () => {
          const stockPath = truth.get(build.patchId);
          expect(
            stockPath,
            'the stock flash of this build was written by its Normal boot',
          ).toBeDefined();
          const stockPart = new Uint8Array(readFileSync(stockPath ?? ''));
          const part = patchedPart(stockPart, patchOfId(build.patchId));
          const patchedPath = scratchFile(`seek-fps-patched-${build.patchId}.bin`);
          writeFileSync(patchedPath, part);
          if (EMU === null) return;
          const emu = await startEmulatorCamera({
            emuDir: EMU,
            entryId: build.entryId,
            flashOverride: patchedPath,
            readyTimeoutMs: BOOT_TIMEOUT_MS,
            urbTimeoutMs: URB_TIMEOUT_MS,
          });
          let camera: SeekCamera | null = null;
          try {
            camera = await SeekCamera.connect(emu.link, {
              hiFPS: false,
              startupOpZero: build.startupOpZero,
            });
            expect(camera.info?.firmware, 'the patched part enumerates on its own build').toBe(
              build.version,
            );
            const clock = (): number => emu.device.deadlineClock.now() / 1000;
            const m = await measureFps(camera, SEEK_MODE.normal, clock, SECONDS);
            const row = rowOf(
              {
                build: build.label,
                state: 'patched',
                mode: 'Normal (IP 8, Init Hi FPS off)',
                note: `connected on ${String(camera.info?.firmware)}`,
              },
              m,
            );
            record(row);
            expect(row.error).toBeNull();
            expect(
              row.frames,
              'the patched part streams in Normal (its --flash-entry gives it the 32K sensor)',
            ).toBeGreaterThan(0);
          } finally {
            if (camera !== null) await camera.disconnect().catch(() => undefined);
            await emu.stop();
          }
        },
        RUN_MS,
      );
    });
  }
});
