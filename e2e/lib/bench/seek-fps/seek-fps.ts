#!/usr/bin/env node
/* ==================================================================== *
 * seek-fps: the Swift `seek` CLI (info, stream, --fps) on Node, over the real camera or the
 * FW-V1 emulator. See README.md in this folder for what it sends.
 *
 *   node --import ./e2e/lib/bench/seek-fps/register.mjs e2e/lib/bench/seek-fps/seek-fps.ts --camera --fps
 *   node --import ./e2e/lib/bench/seek-fps/register.mjs e2e/lib/bench/seek-fps/seek-fps.ts --camera --fps --mode fast
 *   SEEK_EMU_DIR=/path/to/FW-V1/emu node --import ./e2e/lib/bench/seek-fps/register.mjs \
 *     e2e/lib/bench/seek-fps/seek-fps.ts --fps --emulator <corpus-entry-id>
 *
 * Run from the repo root. `--camera` opens the first Seek camera on the USB bus; without it (and
 * without --emulator) the command refuses, so a stray run never touches a bench camera.
 * ==================================================================== */

import { pathToFileURL } from 'node:url';

import { emulatorDir } from '../../../../packages/core/test/emulator/harness.js';
import { runSeekFps, type CameraSession, type CliArgs } from './cli.js';
import { startEmulatorCamera } from './emulator-link.js';
import { openNodeUsbCamera, wallSeconds } from './node-usb-link.js';

/** Opens the camera the arguments name: the bus, or an emulator serving the corpus entry. */
export async function openSession(args: CliArgs): Promise<CameraSession> {
  if (args.emulatorEntry === null) {
    const link = await openNodeUsbCamera();
    return { link, clock: wallSeconds, release: () => link.close() };
  }
  const emuDir = emulatorDir();
  if (emuDir === null) throw new Error('no FW-V1 emulator found (set SEEK_EMU_DIR)');
  const camera = await startEmulatorCamera({
    emuDir,
    entryId: args.emulatorEntry,
    ...(args.emulatorFlash === null ? {} : { flashOverride: args.emulatorFlash }),
    ...(process.env.SEEK_EMU_BOOT_TIMEOUT_MS === undefined
      ? {}
      : { readyTimeoutMs: Number(process.env.SEEK_EMU_BOOT_TIMEOUT_MS) }),
  });
  /* the emulated camera's own clock: the time its frames are delivered at, not the host's */
  const device = camera.device;
  return {
    link: camera.link,
    clock: () => device.deadlineClock.now() / 1000,
    release: () => camera.stop(),
  };
}

export function main(argv: readonly string[]): Promise<number> {
  return runSeekFps(argv, openSession, {
    out: (line) => process.stdout.write(`${line}\n`),
    err: (line) => process.stderr.write(`${line}\n`),
  });
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error: unknown) => {
      process.stderr.write(`seek: ${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    },
  );
}
