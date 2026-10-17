/* ==================================================================== *
 * The J-Link side of the bench: erase and flash the whole 4 MiB through FW-V1's
 * own jlink-runner, read the whole flash back halted, reset the CPU.
 *
 * WHAT IT MAY RUN. Exactly three things, all built here:
 *   - `node tools/jlink/jlink-runner.js erase-spifi-range` and `... flash-factory-4m`
 *     in <SEEK_E2E_FWV1_DIR>/targets/<target> (the runner's own commands; this is
 *     what the target's `make jlink-run` rule runs, which not every target keeps);
 *   - one `JLinkExe` session per read (`h`, `savebin`, `g`, `q`) and one per reset
 *     (`r`, `g`, `q`), each a command file in a scratch directory.
 * It never runs `dump-spifi-4m`: that overwrites the unit's original dump in
 * FW-V1, and no command line this module builds can name it (a unit test proves it).
 *
 * THE GATE. The bench is built from the write gate's decision (`approveWrite`).
 * A gate that neither passed nor is a dry run refuses at construction. A dry run
 * builds the bench, logs what each mutating call WOULD run, and does nothing: its
 * reads reject with `dry-run: no hardware access`.
 *
 * SUCCESS IS THE READ-BACK. `flashFull` does not decide that the flash landed:
 * the runner's own verify is not trusted (its erase error -5 still lets the
 * compare-then-write land the bytes, per TESTING.md 41.5), and `verifyFull` reads
 * the whole flash back halted and compares sha256.
 * ==================================================================== */

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { WriteApproval } from '../supervised-write.js';
import { BENCH_FLASH_BASE, BENCH_FLASH_BYTES, type JlinkBench } from './types.js';

/** The FW-V1 target directory the recipe runs in (TESTING.md 41.5). */
export const DEFAULT_TARGET = 'compact_8hz_1_3_0_8';
/** The same target's name before FW-V1 renamed its targets (product, delivered rate, version). */
/** The runner script, relative to the target directory. */
export const RUNNER_SCRIPT = 'tools/jlink/jlink-runner.js';
export const LEGACY_TARGET = 'compact_32k_1_3_0_8';

/** The SWD speed and interface the recipe uses (kilohertz for `-speed`). */
const INTERFACE = 'SWD';
/** One SPIFI bank (and one erase sector group) as the bench erases it. */
const BANK_BYTES = 0x10000;
const SPEED_KHZ = '4000';
const DEFAULT_DEVICE = 'LPC4330_M4';
/**
 * JLinkExe's GUI off: without it SEGGER's flash download progress window is a modal
 * that pops up during a flash. Added to every session the bench runs itself.
 */
export const NO_GUI_ARGS: readonly [string, string] = ['-NoGui', '1'];

/**
 * The JLinkExe the runner starts, as a shell shim: the real JLinkExe with `-NoGui 1`
 * added, every other argument and the exit code passed through unchanged. The
 * runner reads its JLinkExe path from `JLINKEXE` (FW-V1's jlink-runner.js), so
 * FW-V1 itself is not changed.
 */
export function jlinkShimScript(): string {
  return [
    '#!/bin/sh',
    '# Written by the bench: JLinkExe with -NoGui 1 (no flash download window).',
    '# Every other argument and the exit code pass through.',
    'exec JLinkExe -NoGui 1 "$@"',
    '',
  ].join('\n');
}

/** The message that marks a halt that did not happen (J-Link's own wording). */
const HALT_FAILED = /could not be halted|CPU is not halted/i;
/** The window's refusal, as J-Link prints it when a savebin reads a SPIFI address it cannot serve. */
const WINDOW_REFUSED = 'Could not read memory';
/** The LPC43xx SPIFI controller registers (UM10503 SPIFI), read and written halted. */
export const SPIFI_MCMD = 0x40003018;
export const SPIFI_STAT = 0x4000301c;
/**
 * SPIFI STAT bit 0, MCINIT: the memory command is initialised, so the window is served. Measured
 * on the bench: 0x02000020 (refused, bit 0 clear), 0x02000021 (after the MCMD write, served),
 * 0x02000025 (factory and after a reset, served). Bit 5 is set in both 0x20 and 0x25.
 */
export const SPIFI_STAT_MCINIT = 0x01;

/** The 32-bit word a `mem32` line printed for `address` ("4000301C = 02000025"), if any. */
export function wordAt(text: string, address: number): number | undefined {
  const label = address.toString(16).toUpperCase().padStart(8, '0');
  const match = new RegExp(`^${label} = ([0-9A-Fa-f]{8})`, 'm').exec(text);
  return match === null ? undefined : Number.parseInt(match[1] ?? '', 16);
}

/** The erase error the recipe says to tolerate: the compare-then-write still lands the bytes. */
const ERASE_TOLERATED = /Failed to erase sectors|Erase returned with error code -5/;
/** A J-Link error line, as a command-file session prints it. */
const JLINK_ERROR = /\*{3,} Error/;

/** The runner's commands this module may run, and nothing else (never `dump-spifi-4m`). */
type RunnerCommand = 'erase-spifi-range' | 'flash-factory-4m';

export const DRY_RUN_READ = 'dry-run: no hardware access';

export interface ExecOptions {
  /** The working directory the command runs in. */
  readonly cwd?: string;
  /** Extra variables, merged over the inherited environment. */
  readonly env?: Readonly<Record<string, string>>;
  /** Kill the command after this many milliseconds (its code is then 124). */
  readonly timeoutMs?: number;
}

export interface ExecResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}

/** Runs a command and resolves with its exit code and output. Never rejects for a non-zero exit. */
export type Exec = (
  command: string,
  args: readonly string[],
  options: ExecOptions,
) => Promise<ExecResult>;

/** The real `Exec`: spawns the command, collects its output, resolves with its code. */
export function runCommand(
  command: string,
  args: readonly string[],
  options: ExecOptions,
): Promise<ExecResult> {
  return new Promise((resolve) => {
    const child = spawn(command, [...args], {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });
    const timer =
      options.timeoutMs === undefined
        ? undefined
        : setTimeout(() => {
            timedOut = true;
            child.kill('SIGKILL');
          }, options.timeoutMs);
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ code: 127, stdout, stderr: `${stderr}${error.message}` });
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) {
        resolve({ code: 124, stdout, stderr: `${stderr}timed out, killed` });
        return;
      }
      resolve({
        code: code ?? (signal === null ? 1 : 128),
        stdout,
        stderr: signal === null ? stderr : `${stderr}killed by ${signal}`,
      });
    });
  });
}

export interface JlinkBenchOptions {
  /** The write gate's decision (`approveWrite`). Refuses unless approved or a dry run. */
  readonly gate: WriteApproval;
  /** Where SEEK_E2E_* is read from when an option is not given (default process.env). */
  readonly env?: NodeJS.ProcessEnv;
  /** The FW-V1 checkout (default SEEK_E2E_FWV1_DIR). */
  readonly fwv1Dir?: string;
  /** The J-Link serial number (default SEEK_E2E_JLINK_SN). */
  readonly serial?: string;
  /** The target device (default SEEK_E2E_JLINK_DEVICE, else LPC4330_M4). */
  readonly device?: string;
  /** The FW-V1 target directory under targets/ (default compact_8hz_1_3_0_8, or its old name compact_32k_1_3_0_8 when only that exists). */
  readonly target?: string;
  /** Runs every command (default: spawn). */
  readonly exec?: Exec;
  /** Where scratch files go (default os.tmpdir()). */
  readonly tmpRoot?: string;
  /**
   * Called after a halted read reports that the CPU could not be halted, before the
   * one retry. The caller power-cycles the camera here (channel 2 only).
   */
  readonly onHaltFailed?: () => void | Promise<void>;
  /** Where the bench says what it does (default: stderr, timestamped). */
  readonly log?: (line: string) => void;
}

function defaultLog(line: string): void {
  process.stderr.write(`[bench ${new Date().toISOString().slice(11, 19)}] ${line}\n`);
}

function nonEmpty(value: string | undefined): string | undefined {
  return value === undefined || value.trim() === '' ? undefined : value.trim();
}

/** A required setting, trimmed; throws with `message` when it is unset or blank. */
function required(value: string | undefined, message: string): string {
  const trimmed = nonEmpty(value);
  if (trimmed === undefined) throw new Error(message);
  return trimmed;
}

function hex(value: number): string {
  return `0x${value.toString(16)}`;
}

function tail(result: ExecResult): string {
  const lines = `${result.stdout}\n${result.stderr}`
    .split('\n')
    .filter((line) => line.trim() !== '');
  return lines.slice(-6).join(' | ');
}

function sha256Of(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * The bench's J-Link, over one probe and one camera. Throws at construction when
 * the gate refuses, or when a required setting (SEEK_E2E_FWV1_DIR, SEEK_E2E_JLINK_SN)
 * is missing or its target directory is not there.
 */
export function createJlinkBench(options: JlinkBenchOptions): JlinkBench {
  const { gate } = options;
  if (!gate.approved && !gate.dry) {
    throw new Error(`refusing to drive the J-Link: the write gate did not pass (${gate.reason})`);
  }
  /* Dry wins: a gate that is both approved and dry never touches the probe. */
  const dry = gate.dry || !gate.approved;
  const env = options.env ?? process.env;

  const fwv1Dir = required(
    options.fwv1Dir ?? env.SEEK_E2E_FWV1_DIR,
    'SEEK_E2E_FWV1_DIR is not set: point it at the FW-V1 checkout',
  );
  const serial = required(
    options.serial ?? env.SEEK_E2E_JLINK_SN,
    'SEEK_E2E_JLINK_SN is not set: give the J-Link serial number',
  );
  const device = nonEmpty(options.device ?? env.SEEK_E2E_JLINK_DEVICE) ?? DEFAULT_DEVICE;
  const targetsDir = path.join(path.resolve(fwv1Dir), 'targets');
  const asked = nonEmpty(options.target);
  const target =
    asked ??
    (existsSync(path.join(targetsDir, DEFAULT_TARGET)) ||
    !existsSync(path.join(targetsDir, LEGACY_TARGET))
      ? DEFAULT_TARGET
      : LEGACY_TARGET);
  const targetDir = path.join(targetsDir, target);
  if (!existsSync(targetDir)) {
    throw new Error(
      `no FW-V1 target directory ${targetDir} (SEEK_E2E_FWV1_DIR must be the FW-V1 checkout ` +
        `that has targets/${target})`,
    );
  }

  const exec = options.exec ?? runCommand;
  const tmpRoot = options.tmpRoot ?? tmpdir();
  const log = options.log ?? defaultLog;

  /**
   * One runner command (`node tools/jlink/jlink-runner.js <command>`), with the runner's
   * own environment set. `extra` carries JLINKEXE (the shim) for the flashes.
   */
  function runRunner(
    command: RunnerCommand,
    extra: Readonly<Record<string, string>>,
  ): Promise<ExecResult> {
    return exec('node', [RUNNER_SCRIPT, command], {
      cwd: targetDir,
      env: {
        JLINK_SERIAL: serial,
        JLINK_DEVICE: device,
        JLINK_IF: INTERFACE,
        JLINK_SPEED: SPEED_KHZ,
        ...extra,
      },
    });
  }

  /** One JLinkExe session over a command file written into `dir`. */
  function session(dir: string, name: string, lines: readonly string[]): Promise<ExecResult> {
    const commandFile = path.join(dir, `${name}.jlink`);
    writeFileSync(commandFile, `${lines.join('\n')}\n`);
    return exec(
      'JLinkExe',
      [
        '-SelectEmuBySN',
        serial,
        '-device',
        device,
        '-if',
        INTERFACE,
        '-speed',
        SPEED_KHZ,
        '-autoconnect',
        '1',
        ...NO_GUI_ARGS,
        '-CommandFile',
        commandFile,
      ],
      {},
    );
  }

  /** The shim the runner's JLinkExe is, written into `dir` (removed with the scratch). */
  function writeShim(dir: string): string {
    const file = path.join(dir, 'JLinkExe');
    writeFileSync(file, jlinkShimScript());
    chmodSync(file, 0o755);
    return file;
  }

  /** A scratch directory for one operation, removed when it ends. */
  async function withScratch<T>(body: (dir: string) => Promise<T>): Promise<T> {
    const dir = mkdtempSync(path.join(tmpRoot, 'seek-bench-jlink-'));
    try {
      return await body(dir);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  /**
   * One JLinkExe session that runs `lines`, then saves [address, address+length) to a
   * file and resumes. `bytes` is set only when the file holds exactly `length` bytes.
   */
  async function saveWindow(
    dir: string,
    name: string,
    lines: readonly string[],
    address: number,
    length: number,
  ): Promise<{ readonly result: ExecResult; readonly size: number; readonly bytes?: Uint8Array }> {
    const out = path.join(dir, `${name}.bin`);
    const result = await session(dir, name, [
      ...lines,
      `savebin "${out}", ${hex(address)}, ${hex(length)}`,
      'g',
      'q',
    ]);
    const size = existsSync(out) ? statSync(out).size : -1;
    return size === length
      ? { result, size, bytes: new Uint8Array(readFileSync(out)) }
      : { result, size };
  }

  /**
   * One halted read of [address, address+length). Three roads, in order:
   *   1. HALTED: `h`, then savebin. A halt that fails is reported, the caller's hook runs
   *      (the power cycle), and the read is retried once.
   *   2. HALTED AFTER A SPIFI MEMORY-MODE RE-INIT: when the window answers "Could not read
   *      memory", the firmware has left the SPIFI controller in command mode (SPIFI STAT
   *      MCINIT clear). Then MCMD is written with the value it already holds, which puts the
   *      controller back in memory mode, and the read is repeated. Registers only, never flash.
   *   3. RESET THEN HALTED: `r`, then `h` (the reset leaves the controller in memory mode),
   *      then savebin.
   * Any road that answers is the read; success is still the caller's sha256 check.
   */
  function readHalted(address: number, length: number): Promise<Uint8Array> {
    return withScratch(async (dir) => {
      let refused = false;
      let last: ExecResult | undefined;
      for (let attempt = 1; attempt <= 2; attempt++) {
        const { result, size, bytes } = await saveWindow(
          dir,
          `read-${String(attempt)}`,
          ['h'],
          address,
          length,
        );
        last = result;
        const text = `${result.stdout}\n${result.stderr}`;
        if (HALT_FAILED.test(text)) {
          log(`the CPU could not be halted (read ${String(attempt)} of 2)`);
          if (attempt === 2) {
            throw new Error(
              `the CPU could not be halted twice reading ${hex(address)}+${hex(length)}: ${tail(result)}`,
            );
          }
          await options.onHaltFailed?.();
          continue;
        }
        if (bytes !== undefined) return bytes;
        if (text.includes(WINDOW_REFUSED)) {
          refused = true;
          break;
        }
        throw new Error(
          `savebin of ${hex(address)}+${hex(length)} wrote ${String(size)} bytes, not ${String(length)}: ${tail(result)}`,
        );
      }
      if (!refused) throw new Error('unreachable: the read loop ends by returning or throwing');

      log(
        'the halted window read was refused (Could not read memory): checking the SPIFI controller',
      );
      const state = await session(dir, 'spifi-state', [
        'h',
        `mem32 ${hex(SPIFI_STAT)},1`,
        `mem32 ${hex(SPIFI_MCMD)},1`,
        'g',
        'q',
      ]);
      const stateText = `${state.stdout}\n${state.stderr}`;
      const stat = wordAt(stateText, SPIFI_STAT);
      const mcmd = wordAt(stateText, SPIFI_MCMD);
      if (stat !== undefined && mcmd !== undefined && (stat & SPIFI_STAT_MCINIT) === 0) {
        log(
          `SPIFI STAT ${hex(stat)} has MCINIT clear (command mode); writing MCMD ${hex(mcmd)} to re-enter memory mode`,
        );
        const again = await saveWindow(
          dir,
          'read-mcmd',
          ['h', `w4 ${hex(SPIFI_MCMD)},${hex(mcmd)}`],
          address,
          length,
        );
        if (again.bytes !== undefined) return again.bytes;
        last = again.result;
      } else {
        log(
          `SPIFI STAT ${stat === undefined ? '(unread)' : hex(stat)}, MCMD ${mcmd === undefined ? '(unread)' : hex(mcmd)}: no memory-mode re-init`,
        );
      }

      log('reset, then halted, for the read');
      const reset = await saveWindow(dir, 'read-reset', ['r', 'h'], address, length);
      if (reset.bytes !== undefined) return reset.bytes;
      throw new Error(
        `the window ${hex(address)}+${hex(length)} did not answer a halted read, after the SPIFI ` +
          `memory-mode re-init and a reset: ${tail(reset.result)} (before: ${tail(last ?? reset.result)})`,
      );
    });
  }

  return {
    async flashFull(file: string): Promise<void> {
      const image = path.resolve(file);
      if (!existsSync(image)) throw new Error(`the image to flash does not exist: ${image}`);
      const size = statSync(image).size;
      if (size !== BENCH_FLASH_BYTES) {
        throw new Error(
          `the image to flash is ${String(size)} bytes, not ${String(BENCH_FLASH_BYTES)} (4 MiB): ${image}`,
        );
      }
      const erase = { ERASE_ADDR: hex(BENCH_FLASH_BASE), ERASE_LEN: hex(BENCH_FLASH_BYTES) };
      if (dry) {
        log(
          `[dry-run] would run: node tools/jlink/jlink-runner.js erase-spifi-range in ${targetDir} ` +
            `(ERASE_ADDR=${erase.ERASE_ADDR} ERASE_LEN=${erase.ERASE_LEN}, JLINK_SERIAL=${serial})`,
        );
        log(
          `[dry-run] would run: node tools/jlink/jlink-runner.js flash-factory-4m in ${targetDir} ` +
            `(FACTORY_IMAGE=${image}); the caller's verifyFull is the success check`,
        );
        return;
      }
      /* The runner's JLinkExe is the shim, so its flash runs with the GUI off. */
      await withScratch(async (dir) => {
        const jlinkExe = writeShim(dir);
        const erased = await runRunner('erase-spifi-range', { ...erase, JLINKEXE: jlinkExe });
        if (erased.code !== 0) {
          if (!ERASE_TOLERATED.test(`${erased.stdout}\n${erased.stderr}`)) {
            throw new Error(
              `erase-spifi-range failed (exit ${String(erased.code)}): ${tail(erased)}`,
            );
          }
          log(
            `erase-spifi-range reported error -5 (exit ${String(erased.code)}): tolerated, as the ` +
              'recipe says; the read-back decides',
          );
        }
        const flashed = await runRunner('flash-factory-4m', {
          FACTORY_IMAGE: image,
          JLINKEXE: jlinkExe,
        });
        if (flashed.code !== 0) {
          log(
            `flash-factory-4m exited ${String(flashed.code)}: ${tail(flashed)} (the read-back decides)`,
          );
        }
      });
    },

    async eraseRange(address: number, length: number): Promise<void> {
      if (length !== BANK_BYTES || address % BANK_BYTES !== 0 || address < BENCH_FLASH_BASE) {
        throw new Error(
          `eraseRange: only one 64 KiB bank, 64 KiB-aligned, in the flash (got ${hex(address)}+${hex(length)})`,
        );
      }
      if (address + length > BENCH_FLASH_BASE + BENCH_FLASH_BYTES) {
        throw new Error(`eraseRange: ${hex(address)}+${hex(length)} is past the end of the flash`);
      }
      const erase = { ERASE_ADDR: hex(address), ERASE_LEN: hex(length) };
      if (dry) {
        log(
          `[dry-run] would run: node tools/jlink/jlink-runner.js erase-spifi-range in ${targetDir} ` +
            `(ERASE_ADDR=${erase.ERASE_ADDR} ERASE_LEN=${erase.ERASE_LEN}, JLINK_SERIAL=${serial})`,
        );
        return;
      }
      await withScratch(async (dir) => {
        const jlinkExe = writeShim(dir);
        const erased = await runRunner('erase-spifi-range', { ...erase, JLINKEXE: jlinkExe });
        if (erased.code !== 0) {
          if (!ERASE_TOLERATED.test(`${erased.stdout}\n${erased.stderr}`)) {
            throw new Error(
              `erase-spifi-range ${erase.ERASE_ADDR} failed (exit ${String(erased.code)}): ${tail(erased)}`,
            );
          }
          log(
            `erase-spifi-range ${erase.ERASE_ADDR} reported error -5 (exit ${String(erased.code)}): tolerated; the read decides`,
          );
        }
      });
    },

    readFlash(address: number, length: number): Promise<Uint8Array> {
      if (dry) return Promise.reject(new Error(DRY_RUN_READ));
      return readHalted(address, length);
    },

    async verifyFull(sha256: string): Promise<void> {
      if (dry) return Promise.reject(new Error(DRY_RUN_READ));
      const expected = sha256.trim().toLowerCase();
      if (!/^[0-9a-f]{64}$/.test(expected)) throw new Error(`not a sha256: ${sha256}`);
      const bytes = await readHalted(BENCH_FLASH_BASE, BENCH_FLASH_BYTES);
      const actual = sha256Of(bytes);
      if (actual !== expected) {
        throw new Error(
          `the flash does not hold the dump: read-back sha256 ${actual}, expected ${expected}`,
        );
      }
      log(`flash read-back matches: sha256 ${actual}`);
    },

    async resetCpu(): Promise<void> {
      if (dry) {
        log(`[dry-run] would reset the CPU: a JLinkExe session with r, g, q on ${serial}`);
        return;
      }
      await withScratch(async (dir) => {
        const result = await session(dir, 'reset', ['r', 'g', 'q']);
        const text = `${result.stdout}\n${result.stderr}`;
        log(`reset: JLinkExe exit ${String(result.code)}: ${tail(result)}`);
        if (result.code !== 0 || JLINK_ERROR.test(text)) {
          throw new Error(`reset failed (exit ${String(result.code)}): ${tail(result)}`);
        }
      });
    },
  };
}
