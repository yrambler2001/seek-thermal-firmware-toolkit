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
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
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
const SPEED_KHZ = '4000';
const DEFAULT_DEVICE = 'LPC4330_M4';

/** The message that marks a halt that did not happen (J-Link's own wording). */
const HALT_FAILED = /could not be halted|CPU is not halted/i;
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

  /** One runner command (`node tools/jlink/jlink-runner.js <command>`), with the runner's own environment set. */
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
        '-CommandFile',
        commandFile,
      ],
      {},
    );
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
   * One halted read of [address, address+length). A halt that fails is reported,
   * the caller's hook runs (the power cycle), and the read is retried once.
   */
  function readHalted(address: number, length: number): Promise<Uint8Array> {
    return withScratch(async (dir) => {
      for (let attempt = 1; attempt <= 2; attempt++) {
        const out = path.join(dir, `read-${String(attempt)}.bin`);
        const result = await session(dir, `read-${String(attempt)}`, [
          'h',
          `savebin "${out}", ${hex(address)}, ${hex(length)}`,
          'g',
          'q',
        ]);
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
        const size = existsSync(out) ? statSync(out).size : -1;
        if (size !== length) {
          throw new Error(
            `savebin of ${hex(address)}+${hex(length)} wrote ${String(size)} bytes, not ${String(length)}: ${tail(result)}`,
          );
        }
        return new Uint8Array(readFileSync(out));
      }
      throw new Error('unreachable: the read loop ends by returning or throwing');
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
      const erased = await runRunner('erase-spifi-range', erase);
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
      const flashed = await runRunner('flash-factory-4m', { FACTORY_IMAGE: image });
      if (flashed.code !== 0) {
        log(
          `flash-factory-4m exited ${String(flashed.code)}: ${tail(flashed)} (the read-back decides)`,
        );
      }
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
        if (result.code !== 0 || JLINK_ERROR.test(text)) {
          throw new Error(`reset failed (exit ${String(result.code)}): ${tail(result)}`);
        }
      });
    },
  };
}
