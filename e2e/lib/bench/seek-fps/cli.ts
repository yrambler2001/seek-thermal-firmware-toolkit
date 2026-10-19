/* ==================================================================== *
 * The `seek` command line, as tv-jc/macos/Sources/seek/main.swift has it: `info`, `stream` and
 * `--fps`, with the panel's flags. Everything that talks to a camera goes through a
 * CameraBackend, so the unit tests run the same code on a fake link.
 *
 * Not ported: `snapshot` and `deadpixels` (they need the Swift colour renderer, Render.swift's
 * image part, and the checker does not write images). Both say so and exit 1.
 * ==================================================================== */

import { FrameStats, fpsWindows, type FpsWindow } from './stats.js';
import {
  DEFAULT_SEEK_OPTIONS,
  SEEK_MODE,
  SeekCamera,
  type SeekMode,
  type SeekOptions,
} from './camera.js';
import type { SeekFrame } from './frame.js';
import type { SeekLink } from './link.js';

export const USAGE = `seek-fps - Seek Thermal camera (Compact, Compact XR, Pro): the Swift seek CLI, ported

USAGE
  seek-fps info                     connect and print firmware, serial and model
  seek-fps stream [-n SECONDS]      stream and print one status line per second (default 5 s)
  seek-fps --fps                    stream for 5 seconds and print mean and median fps for each second

OPTIONS (mirror the Seek Thermal panel)
  --mode normal|fast|raw|4          Normal (IP mode 8) / FastRaw (3) / Raw (0) / IP mode 4 (default normal)
  --no-hifps                        untick "Init Hi FPS"
  --no-opzero                       untick "Startup with Operation=0"
  --no-pro-init                     untick "Compact: use Pro init (new FW)" (default on; applied only on firmware 4.x)
  --raw-min N  --raw-max N          raw range (default 1000 .. 65000)
  --nuc | --big-nuc                 press NUC / Big NUC after the stream starts
  --shutter-close | --shutter-open  press Shutter Close / Shutter Open after the stream starts

SOURCE (one is required)
  --camera                          the first Seek camera on the USB bus (node-usb)
  --emulator ENTRY                  the FW-V1 emulator, serving this corpus entry (SEEK_EMU_DIR)
  --emulator-flash FILE             with --emulator: boot this 4 MiB part instead of the entry's flash
`;

export type PressAction = 'nuc' | 'big-nuc' | 'shutter-close' | 'shutter-open';

export interface CliArgs {
  readonly help: boolean;
  /** 'info', 'stream' or 'fps'; null when no command was given. */
  readonly command: 'info' | 'stream' | 'fps' | null;
  readonly seconds: number;
  readonly mode: SeekMode;
  readonly options: SeekOptions;
  readonly actions: readonly PressAction[];
  /** `--camera`: the Seek camera on the USB bus. Required for a command without `--emulator`. */
  readonly camera: boolean;
  readonly emulatorEntry: string | null;
  readonly emulatorFlash: string | null;
}

export type ParseResult =
  { readonly ok: true; readonly args: CliArgs } | { readonly ok: false; readonly message: string };

function intValue(argv: readonly string[], index: number, name: string): number | string {
  const raw = argv[index + 1];
  if (raw === undefined || !/^-?\d+$/.test(raw)) return `${name} needs a number`;
  return Number(raw);
}

/** The Swift main.swift argument loop, with the same names and defaults. */
export function parseArgs(argv: readonly string[]): ParseResult {
  const help = argv.includes('-h') || argv.includes('--help');
  let fpsMode = false;
  let seconds = 5;
  let mode: SeekMode = SEEK_MODE.normal;
  let options: SeekOptions = { ...DEFAULT_SEEK_OPTIONS };
  const actions: PressAction[] = [];
  const positional: string[] = [];
  let emulatorEntry: string | null = null;
  let emulatorFlash: string | null = null;
  let camera = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] ?? '';
    if (a === '-h' || a === '--help') continue;
    if (a === '--camera') {
      camera = true;
    } else if (a === '--fps') {
      fpsMode = true;
    } else if (a === '-n') {
      const v = intValue(argv, i, a);
      if (typeof v === 'string') return { ok: false, message: v };
      seconds = v;
      i++;
    } else if (a === '--mode') {
      const v = argv[i + 1];
      i++;
      if (v === 'normal') mode = SEEK_MODE.normal;
      else if (v === 'fast') mode = SEEK_MODE.fastRaw;
      else if (v === 'raw') mode = SEEK_MODE.raw;
      else if (v === '4') mode = SEEK_MODE.mode4;
      else return { ok: false, message: `--mode needs normal|fast|raw|4 (got ${v ?? 'nothing'})` };
    } else if (a === '--no-hifps') {
      options = { ...options, hiFPS: false };
    } else if (a === '--no-opzero') {
      options = { ...options, startupOpZero: false };
    } else if (a === '--no-pro-init') {
      options = { ...options, compactProInit: false };
    } else if (a === '--raw-min' || a === '--raw-max') {
      const v = intValue(argv, i, a);
      if (typeof v === 'string') return { ok: false, message: v };
      const clamped = Math.min(0xffff, Math.max(0, v));
      options =
        a === '--raw-min' ? { ...options, rawMin: clamped } : { ...options, rawMax: clamped };
      i++;
    } else if (a === '--nuc') {
      actions.push('nuc');
    } else if (a === '--big-nuc') {
      actions.push('big-nuc');
    } else if (a === '--shutter-close') {
      actions.push('shutter-close');
    } else if (a === '--shutter-open') {
      actions.push('shutter-open');
    } else if (a === '--emulator' || a === '--emulator-flash') {
      const v = argv[i + 1];
      if (v === undefined) return { ok: false, message: `${a} needs a value` };
      i++;
      if (a === '--emulator') emulatorEntry = v;
      else emulatorFlash = v;
    } else if (a.startsWith('-')) {
      return { ok: false, message: `unknown option ${a}` };
    } else {
      positional.push(a);
    }
  }
  if (fpsMode) seconds = 5;
  const first = positional[0] ?? '';
  let command: CliArgs['command'] = null;
  if (fpsMode) command = 'fps';
  else if (first === 'info' || first === 'stream') command = first;
  else if (first === 'snapshot' || first === 'deadpixels') {
    return {
      ok: false,
      message: `${first} is not part of this port (the Swift image renderer is not ported)`,
    };
  } else if (first !== '') return { ok: false, message: `unknown command '${first}'` };
  // The bus is opened only when asked for by name: a stray run must not touch a bench camera.
  if (command !== null && emulatorEntry === null && !camera) {
    return {
      ok: false,
      message:
        'no camera source: pass --camera to use the Seek camera on the USB bus, or --emulator ENTRY for the emulator',
    };
  }
  return {
    ok: true,
    args: {
      help,
      command,
      seconds,
      mode,
      options,
      actions,
      camera,
      emulatorEntry,
      emulatorFlash,
    },
  };
}

/**
 * Where the camera comes from: the bus, or the emulator. `release` runs after the command. `clock` is the
 * time base the measurement runs on, in seconds: the wall clock on the bus, the emulated camera's own clock
 * on the emulator (where the host's clock measures the emulator's speed, not the camera's).
 */
export interface CameraSession {
  readonly link: SeekLink;
  readonly clock: () => number;
  release(): Promise<void>;
}

export interface CliIo {
  out(line: string): void;
  err(line: string): void;
}

export type OpenSession = (args: CliArgs) => Promise<CameraSession>;

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** A wait on the session clock never passes this much wall-clock time: a camera that stops is an error. */
const WALL_GUARD_MS = 300_000;

/** Waits until `clock()` reaches `target` (seconds on the session clock). */
export async function waitUntil(clock: () => number, target: number): Promise<void> {
  const wallEnd = Date.now() + WALL_GUARD_MS;
  while (clock() < target) {
    if (Date.now() > wallEnd) {
      throw new Error(
        'the camera did not reach the measurement time (no progress for 300 s of wall clock)',
      );
    }
    await sleep(20);
  }
}

function describe(camera: SeekCamera): string {
  const info = camera.info;
  if (info === null) return 'not connected';
  const refused = camera.startupOpZeroRefused
    ? ', Startup with Operation=0 refused (connected without it)'
    : '';
  return `${info.model}, firmware ${info.firmware}, serial ${info.serial}, ${String(info.width)}x${String(info.height)}${refused}`;
}

/** Runs one command. Returns the process exit code (Swift `fail` is 1). */
export async function runSeekFps(
  argv: readonly string[],
  open: OpenSession,
  io: CliIo,
): Promise<number> {
  const parsed = parseArgs(argv);
  if (!parsed.ok) {
    io.err(`seek: ${parsed.message}`);
    io.err(USAGE);
    return 1;
  }
  const { args } = parsed;
  if (args.help || argv.length === 0) {
    io.out(USAGE);
    return args.help ? 0 : 1;
  }
  if (args.command === null) {
    io.err(`seek: no command`);
    io.out(USAGE);
    return 1;
  }
  let session: CameraSession;
  let camera: SeekCamera;
  try {
    session = await open(args);
  } catch (error) {
    io.err(`seek: ${messageOf(error)}`);
    return 1;
  }
  try {
    try {
      camera = await SeekCamera.connect(session.link, args.options);
    } catch (error) {
      io.err(`seek: ${messageOf(error)}`);
      return 1;
    }
    try {
      return await runCommand(camera, args, io, session.clock);
    } finally {
      await camera.stopStreaming();
      await camera.disconnect();
    }
  } finally {
    await session.release();
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Starts the stream as main.swift's start(): a non-Normal mode is an init first, then the stream. */
async function startStream(
  camera: SeekCamera,
  mode: number,
  actions: readonly PressAction[],
  stats: FrameStats,
  clock: () => number,
  t0: number,
): Promise<void> {
  camera.onFrame = (frame: SeekFrame) => {
    stats.record(frame, clock() - t0);
  };
  if (mode !== SEEK_MODE.normal) await camera.reinit(mode);
  camera.startStreaming();
  for (const action of actions) {
    if (action === 'nuc') camera.nuc();
    else if (action === 'big-nuc') camera.bigNUC();
    else if (action === 'shutter-close') camera.shutterClose();
    else camera.shutterOpen();
  }
}

/** A stream that published no frame in the window it waited for (TESTING.md 42.58). */
export class NoFrameError extends Error {}

/**
 * The failure for a stream that published no frame in its window, in every mode. When the camera refused the FastRaw
 * init that Init Hi FPS sends (the 1.3.0.8 family refuses it at 0x3e), the stream stopped at that refusal, so the
 * message says so and names the way out: `--no-hifps` streams Normal, which the build takes (TESTING.md 42.58).
 */
export function noFrameMessage(camera: SeekCamera, window: string): string {
  const base = `no frame was published in ${window}`;
  const refusal = camera.initRefusal;
  if (refusal !== null && refusal.mode === SEEK_MODE.fastRaw && camera.options.hiFPS) {
    return (
      `${base}: the camera refused the FastRaw init that Init Hi FPS sends (${refusal.detail}), ` +
      'and the stream stopped there. This build does not take Init Hi FPS: run again with --no-hifps ' +
      'to stream Normal.'
    );
  }
  if (refusal !== null) {
    return `${base}: the camera refused the init for mode ${String(refusal.mode)} (${refusal.detail})`;
  }
  return camera.lastError === null ? base : `${base}: ${camera.lastError}`;
}

/** Swift waitForFrame: the first frame within `seconds` on the session clock, or NoFrameError. */
async function waitForFrame(
  camera: SeekCamera,
  stats: FrameStats,
  clock: () => number,
  seconds: number,
): Promise<SeekFrame> {
  const start = clock();
  const wallEnd = Date.now() + WALL_GUARD_MS;
  while (clock() - start < seconds && Date.now() < wallEnd) {
    if (stats.latest !== null) return stats.latest;
    if (!camera.isStreaming) break;
    await sleep(20);
  }
  if (stats.latest !== null) return stats.latest;
  throw new NoFrameError(camera.lastError ?? 'no frames received');
}

/** One `--fps` measurement: the per-second windows from the first published frame, and the counters. */
export interface FpsMeasurement {
  readonly windows: readonly FpsWindow[];
  readonly stats: FrameStats;
  /** Frames in the measured windows. */
  readonly frames: number;
  readonly seconds: number;
}

/**
 * main.swift's `fps` run: start the stream (a non-Normal mode is an init first), wait up to 10 s for the
 * first frame, clear the arrival times, then measure for `seconds` from there, on `clock`. Throws when no
 * frame comes (the camera's own error, when it has one).
 */
export async function measureFps(
  camera: SeekCamera,
  mode: number,
  clock: () => number,
  seconds: number,
  actions: readonly PressAction[] = [],
): Promise<FpsMeasurement> {
  const t0 = clock();
  const stats = new FrameStats();
  await startStream(camera, mode, actions, stats, clock, t0);
  await waitForFrame(camera, stats, clock, 10);
  stats.clearStamps();
  await waitUntil(clock, clock() + seconds + 0.05);
  const windows = fpsWindows(stats.stamps, seconds);
  const frames = windows.reduce((sum, w) => sum + w.frames, 0);
  return { windows, stats, frames, seconds };
}

async function runCommand(
  camera: SeekCamera,
  args: CliArgs,
  io: CliIo,
  clock: () => number,
): Promise<number> {
  const t0 = clock();
  const stats = new FrameStats();
  if (args.command === 'info') {
    io.out(describe(camera));
    return 0;
  }
  if (args.command === 'stream') {
    io.out(describe(camera));
    await startStream(camera, args.mode, args.actions, stats, clock, t0);
    const seconds = Math.max(1, args.seconds);
    for (let s = 1; s <= seconds; s++) {
      await waitUntil(clock, t0 + s);
      const f = stats.latest;
      if (f !== null) {
        io.out(
          `t=${String(s)}s frames=${String(stats.stamps.length)} status=${String(camera.lastStatus)} ` +
            `min=${String(f.minValue)} max=${String(f.maxValue)} avg=${String(f.average)} ` +
            `devTemp=${String(camera.lastDeviceTemp)} frameCnt=${String(camera.lastFrameCount)} ` +
            `frozenPairs=${String(stats.frozenPairs)} changed=${(stats.meanChanged() * 100).toFixed(0)}%`,
        );
      } else {
        io.out(`t=${String(s)}s no frame yet (status ${String(camera.lastStatus)})`);
      }
    }
    // A stream that published nothing in its window is a failure in every mode, not a run that measured nothing.
    if (stats.stamps.length === 0) {
      io.err(`seek: ${noFrameMessage(camera, `the ${String(seconds)} s stream`)}`);
      return 1;
    }
    return 0;
  }
  // --fps: stream, wait for the first frame, then measure from there for `seconds` seconds.
  io.out(describe(camera));
  let measured: FpsMeasurement;
  try {
    measured = await measureFps(camera, args.mode, clock, args.seconds, args.actions);
  } catch (error) {
    if (!(error instanceof NoFrameError)) throw error;
    io.err(`seek: ${noFrameMessage(camera, 'the wait for a first frame (up to 10 s)')}`);
    return 1;
  }
  const windows = measured.windows;
  if (windows.length === 0) {
    io.err('seek: no frames in the measurement window');
    return 1;
  }
  for (const w of windows) {
    io.out(
      `second ${String(w.second)}: mean ${w.mean.toFixed(2)} fps  median ${w.median.toFixed(2)} fps  (${String(w.frames)} frames)`,
    );
  }
  const total = measured.frames;
  io.out(
    `overall: mean ${(total / args.seconds).toFixed(2)} fps over ${String(args.seconds)} s (${String(total)} frames)`,
  );
  if (camera.untypedFrames > 0) {
    io.out(
      `status 0 (no header type): ${String(camera.untypedFrames)} frames, ` +
        (args.mode === SEEK_MODE.mode4
          ? 'counted as pictures in mode 4'
          : 'dropped (only mode 4 counts them)'),
    );
  }
  return 0;
}
