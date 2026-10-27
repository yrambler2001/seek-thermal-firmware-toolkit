/* ==================================================================== *
 * The camera side of the bench: is a Seek camera on the USB bus, cut and restore
 * its power, and read what it is running.
 *
 * POWER IS CHANNEL 2 ONLY. The rp2040 switch's channel 1 is the J-Link's own
 * power. `powerCycle` reads SEEK_E2E_SWITCH_CHANNEL through `lockedPowerSwitchChannel`
 * and refuses unless it is exactly '2', before the switch is touched at all.
 *
 * `runningInfo` is the built CLI's own report (`seek-fw info --json`), so the bench
 * and the user see the same answer. It never throws: a failure is `null`.
 * ==================================================================== */

import path from 'node:path';

import { REPO_ROOT } from '../browser.js';
import { Rp2040PowerSwitch, seekCamerasOnBus, type PowerSwitch } from '../power-switch.js';
import type { WriteApproval } from '../supervised-write.js';
import { runCommand, type Exec } from './jlink.js';
import type { BenchCamera, RunningInfo, SlotFlashRun } from './types.js';

/** The switch channel the camera is on. The only one the bench may toggle. */
const CAMERA_CHANNEL = 2;

/** How long `info --json` may take (it reads the camera over USB). */
const INFO_TIMEOUT_MS = 180_000;
/** One CLI slot write reads the banks, stages 48 KiB in 64-byte chunks, commits and reads back. */
const SLOT_FLASH_TIMEOUT_MS = 600_000;

/** The default poll interval for `waitForEnumeration`. */
const DEFAULT_POLL_MS = 500;
/**
 * The poll interval while `waitForReboot` waits for the camera to leave the bus. A fast
 * reboot is off the bus for about 0.4 s (TESTING 42.31: a 1.3.0.8 image, 5 of 25 resets
 * missed at 500 ms), so a 500 ms poll can fall between two samples that both see it on
 * the bus. At 100 ms every absence longer than that is seen.
 */
const REBOOT_POLL_MS = 100;

/** The default power-off time for `powerCycle`, as the switch's own default. */
const DEFAULT_OFF_MS = 3000;

/** How long the camera has to come back on USB after its power returns. */
const BACK_ON_BUS_MS = 40_000;

/**
 * Settle time once the camera is on the bus, before the J-Link may read it: the
 * target's SWD is not reachable until its firmware has powered up, and a read in
 * that gap fails with "Could not connect to the target device".
 */
const SWD_SETTLE_MS = 5_000;

/**
 * The switch channel the bench may power-cycle, read from SEEK_E2E_SWITCH_CHANNEL.
 * Anything but '2' throws: channel 1 powers the J-Link.
 */
export function lockedPowerSwitchChannel(env: NodeJS.ProcessEnv = process.env): 2 {
  const raw = env.SEEK_E2E_SWITCH_CHANNEL;
  if (raw !== String(CAMERA_CHANNEL)) {
    const shown = raw === undefined ? 'unset' : `"${raw}"`;
    throw new Error(
      `the bench power-cycles the camera on switch channel ${String(CAMERA_CHANNEL)} only ` +
        `(SEEK_E2E_SWITCH_CHANNEL=${String(CAMERA_CHANNEL)}); it is ${shown}. ` +
        "Channel 1 is the J-Link's own power and is never toggled.",
    );
  }
  return CAMERA_CHANNEL;
}

/** What `powerCycle` needs from a switch: a cycle. */
export type CycleSwitch = Pick<PowerSwitch, 'cycle'>;

export interface BenchCameraOptions {
  /** The write gate's decision (`approveWrite`). Refuses unless approved or a dry run. */
  readonly gate: WriteApproval;
  /** Where SEEK_E2E_SWITCH_CHANNEL is read from (default process.env). */
  readonly env?: NodeJS.ProcessEnv;
  /** How many Seek cameras are on the bus (default: ioreg, read-only). */
  readonly countCameras?: () => number;
  /** The switch for a channel (default: the rp2040 switch project). */
  readonly switchFor?: (channel: 1 | 2) => CycleSwitch;
  /** Runs the CLI (default: spawn). */
  readonly runCli?: Exec;
  /** The built CLI entry (default packages/cli/dist/bin.js in this checkout). */
  readonly cliPath?: string;
  /** Milliseconds since an arbitrary origin (default Date.now). */
  readonly now?: () => number;
  /** Waits this many milliseconds (default setTimeout). */
  readonly sleep?: (ms: number) => Promise<void>;
  /** Where dry-run lines go (default: stderr, timestamped). */
  readonly log?: (line: string) => void;
}

function defaultLog(line: string): void {
  process.stderr.write(`[bench ${new Date().toISOString().slice(11, 19)}] ${line}\n`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function textOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

/**
 * The CLI's `info --json` document as a RunningInfo, or null when it is not one.
 * The CLI prints exactly one JSON document under --json (its `device` and
 * `firmware` objects; see packages/cli/src/commands/info.ts `stateJson`).
 */
export function parseRunningInfo(stdout: string): RunningInfo | null {
  let document: unknown;
  try {
    document = JSON.parse(stdout) as unknown;
  } catch {
    return null;
  }
  if (!isRecord(document) || !isRecord(document.firmware)) return null;
  const firmware = document.firmware;
  const device = isRecord(document.device) ? document.device : {};
  return {
    product: textOrNull(device.product),
    serial: textOrNull(firmware.serial) ?? textOrNull(device.serial),
    firmwareVersion: textOrNull(firmware.version),
    buildString: textOrNull(firmware.build),
    bootloaderVersion: textOrNull(firmware.bootloaderVersion),
  };
}

/** The bench's camera. Throws at construction when the gate refuses. */
export function createBenchCamera(options: BenchCameraOptions): BenchCamera {
  const { gate } = options;
  if (!gate.approved && !gate.dry) {
    throw new Error(`refusing to drive the camera: the write gate did not pass (${gate.reason})`);
  }
  const dry = gate.dry || !gate.approved;
  const env = options.env ?? process.env;
  const countCameras = options.countCameras ?? seekCamerasOnBus;
  const switchFor = options.switchFor ?? ((channel: 1 | 2) => new Rp2040PowerSwitch(channel));
  const runCli = options.runCli ?? runCommand;
  const cliPath = options.cliPath ?? path.join(REPO_ROOT, 'packages', 'cli', 'dist', 'bin.js');
  const now = options.now ?? (() => Date.now());
  const sleep =
    options.sleep ??
    ((ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
      }));
  const log = options.log ?? defaultLog;

  function present(): boolean {
    try {
      return countCameras() > 0;
    } catch {
      /* ioreg did not answer: the camera is not known to be there */
      return false;
    }
  }

  async function waitForEnumeration(
    timeoutMs: number,
    pollMs: number = DEFAULT_POLL_MS,
  ): Promise<number | null> {
    const start = now();
    for (;;) {
      if (present()) return now() - start;
      const elapsed = now() - start;
      if (elapsed >= timeoutMs) return null;
      await sleep(Math.min(pollMs, timeoutMs - elapsed));
    }
  }

  return {
    present,

    waitForEnumeration,

    async waitForReboot(dropMs: number, timeoutMs: number): Promise<number | null> {
      const start = now();
      while (present()) {
        const elapsed = now() - start;
        if (elapsed >= dropMs) return null;
        await sleep(Math.min(REBOOT_POLL_MS, dropMs - elapsed));
      }
      const back = await waitForEnumeration(timeoutMs);
      return back === null ? null : now() - start;
    },

    async powerCycle(offMs: number = DEFAULT_OFF_MS): Promise<void> {
      const channel = lockedPowerSwitchChannel(env);
      if (dry) {
        log(
          `[dry-run] would power-cycle switch channel ${String(channel)} for ${String(offMs)} ms`,
        );
        return;
      }
      await switchFor(channel).cycle(offMs);
      /* The power is back, but the camera enumerates on USB a few seconds later, and its
       * SWD after that: a J-Link read before both fails. Wait for the bus, then settle. */
      if ((await waitForEnumeration(BACK_ON_BUS_MS)) === null) {
        throw new Error(
          `the camera did not come back on the bus within ${String(BACK_ON_BUS_MS / 1000)} s of the power cycle`,
        );
      }
      await sleep(SWD_SETTLE_MS);
    },

    async runningInfo(): Promise<RunningInfo | null> {
      try {
        const result = await runCli(process.execPath, [cliPath, 'info', '--json'], {
          cwd: REPO_ROOT,
          timeoutMs: INFO_TIMEOUT_MS,
        });
        if (result.code !== 0) return null;
        return parseRunningInfo(result.stdout);
      } catch {
        return null;
      }
    },

    async infoJson(): Promise<Record<string, unknown> | null> {
      try {
        const result = await runCli(process.execPath, [cliPath, 'info', '--json'], {
          cwd: REPO_ROOT,
          timeoutMs: INFO_TIMEOUT_MS,
        });
        if (result.code !== 0) return null;
        const parsed: unknown = JSON.parse(result.stdout);
        return isRecord(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },

    async slotFlash(bank, file, options): Promise<SlotFlashRun> {
      const args = [cliPath, 'slots', 'flash', bank, file, '--yes', '--json'];
      if (options.acknowledgeRisk) args.push('--acknowledge-risk');
      if (dry) {
        log(
          `[dry-run] would run: seek-fw slots flash ${bank} ${path.basename(file)} ${args.slice(5).join(' ')}`,
        );
        return { code: 0, result: null, stdout: '', stderr: '' };
      }
      const result = await runCli(process.execPath, args, {
        cwd: REPO_ROOT,
        timeoutMs: SLOT_FLASH_TIMEOUT_MS,
      });
      let document: Record<string, unknown> | null;
      try {
        const parsed: unknown = JSON.parse(result.stdout);
        document = isRecord(parsed) ? parsed : null;
      } catch {
        document = null;
      }
      return { code: result.code, result: document, stdout: result.stdout, stderr: result.stderr };
    },
  };
}
