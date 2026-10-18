/* ==================================================================== *
 * The CLI itself - `run()`, `NodeUsbBackend`, `fromNodeUsb` and node-usb's
 * own shim - on an emulated camera.
 *
 * WHY (TESTING.md sec.21.1). On 2026-09-28 the bench Compact 1.3.0.0
 * (101310HSNEA2) made `seek-fw info --devices`, `info` and `dump` exit 1 with
 * "getString error: invalid descriptor" before a single vendor request (FW-V1
 * Phase 53). Every emulator row passed at the time, because every row drove
 * the transport through the harness's WebUSB adapter, which reports a string
 * the device cannot produce as null - the OS's view, not node-usb's. This file
 * puts node-usb's layering over the same emulated camera
 * (`node-usb-over-usbip.ts`) and runs the three commands the camera broke, on
 * the camera's own dump. It fails on `fromNodeUsb` before sec.21.1 (the three
 * commands exit 1 with that message) and passes after it.
 *
 * THE PREMISE IS ASSERTED, NOT ASSUMED: the device descriptor names
 * iSerialNumber 5, the OS layer has no copy, node-usb had to ask the device,
 * and its getter throws the bench's message. If a later emulator answered
 * string 5 differently, this test would say so instead of passing vacuously.
 * ==================================================================== */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import type { UsbBackend } from '@seek-fw/core';
import { liveEmulatorCount, RowEmulators } from '../../core/test/emulator/harness.js';
import {
  announceSkip,
  BOOT_TIMEOUT_MS,
  EMU_DIR,
  ENTRIES,
  scratchFile,
  URB_TIMEOUT_MS,
} from '../../core/test/emulator/suite.js';
import { NodeUsbBackend, type BackendOptions } from '../src/backend.js';
import { run } from '../src/cli.js';
import { EXIT_FAILED, EXIT_OK } from '../src/errors.js';
import { tempDir, testIo } from './helpers.js';
import { nodeUsbOverUsbIp, type NodeUsbOverUsbIp } from './node-usb-over-usbip.js';

/** The bench camera's own dump (FW-V1 corpus, sha256 40447c7e...). */
const ENTRY = 'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump';
const FLASH_BASE = 0x14000000;
const TIMEOUT_MS = Number(process.env.SEEK_EMU_CLI_TIMEOUT_MS ?? '900000');

const available = EMU_DIR !== null && ENTRIES.some((entry) => entry.id === ENTRY);
if (!available) announceSkip(`the CLI through node-usb on ${ENTRY}`);

interface CliRun {
  readonly code: number;
  readonly json: Record<string, unknown>;
  readonly stderr: string;
}

async function cli(argv: readonly string[], device: NodeUsbOverUsbIp): Promise<CliRun> {
  const backend = (options: BackendOptions): UsbBackend =>
    new NodeUsbBackend({
      ...options,
      enumerate: () => Promise.resolve([device]),
      /* The emulated camera's clock, as every emulator suite times its deadlines. */
      clock: device.usbip.deadlineClock,
    });
  const { io, stdout, stderr } = testIo({ backend });
  const code = await run([...argv, '--json'], io, new AbortController().signal);
  return { code, json: JSON.parse(stdout.text) as Record<string, unknown>, stderr: stderr.text };
}

/** `cli` without parsing stdout: a refusal prints no JSON. */
async function cliRaw(
  argv: readonly string[],
  device: NodeUsbOverUsbIp,
): Promise<{ readonly code: number; readonly stderr: string }> {
  const backend = (options: BackendOptions): UsbBackend =>
    new NodeUsbBackend({
      ...options,
      enumerate: () => Promise.resolve([device]),
      clock: device.usbip.deadlineClock,
    });
  const { io, stderr } = testIo({ backend });
  const code = await run([...argv], io, new AbortController().signal);
  return { code, stderr: stderr.text };
}

/** The preserve run's backup image (31 windows at their flash offsets), wherever the run put it. */
function findBackupImage(dir: string): Buffer {
  const walk = (current: string): string | null => {
    for (const name of readdirSync(current)) {
      const full = path.join(current, name);
      if (statSync(full).isDirectory()) {
        const found = walk(full);
        if (found !== null) return found;
      } else if (name === 'preserve_backup_windows.bin') return full;
    }
    return null;
  };
  const file = walk(dir);
  return file === null ? Buffer.alloc(0) : readFileSync(file);
}

describe.skipIf(!available)(
  'the CLI through node-usb, on the emulated bench Compact 1.3.0.0',
  () => {
    afterAll(() => {
      expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
    });

    it(
      'lists, reads and dumps a camera whose serial string is not a string descriptor',
      { timeout: TIMEOUT_MS },
      async () => {
        const row = new RowEmulators(ENTRY);
        const out = await tempDir();
        try {
          const truthPath = scratchFile('cli_node_usb_1.3.0.0.bin');
          const emu = await row.start(EMU_DIR!, {
            entryId: ENTRY,
            flashOut: truthPath,
            readyTimeoutMs: BOOT_TIMEOUT_MS,
          });
          await row.guard(emu, async () => {
            const usbip = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
            const device = await nodeUsbOverUsbIp(usbip);

            /* ---- the premise: what node-usb does on this camera ---- */
            expect(usbip.deviceDescriptor[16], 'iSerialNumber').toBe(5);
            expect(usbip.serialNumber, "the OS layer's copy of string 5").toBeNull();
            expect(device.askedTheDevice, 'strings node-usb had to ask the device for').toEqual([
              5,
            ]);
            expect(() => device.serialNumber).toThrow('getString error: invalid descriptor');
            expect(device.productName).toBe('PIR206 Thermal Camera');
            expect(device.manufacturerName).toBe('Seek Thermal');

            /* ---- devices ---- */
            const devices = await cli(['info', '--devices'], device);
            expect(devices.code, devices.stderr).toBe(EXIT_OK);
            expect(devices.json.devices).toEqual([
              {
                vendorId: '0x289d',
                productId: '0x0010',
                productName: 'PIR206 Thermal Camera',
                manufacturerName: 'Seek Thermal',
                serialNumber: null,
              },
            ]);

            /* ---- info: the serial comes from the device-id block, not string 5 ---- */
            const info = await cli(['info'], device);
            expect(info.code, info.stderr).toBe(EXIT_OK);
            expect(info.json.device).toMatchObject({ serial: null, productId: '0x0010' });
            expect(info.json.firmware).toMatchObject({
              version: '1.3.0.0',
              bootloaderVersion: '0.9.0.0',
              serial: '101310HSNEA2',
            });

            /* ---- the 2014 line's read-only dump is the first preserve step: every window it
             * reads is the device's own bytes (`dump` is for 4.x/Nano and refuses this camera) ---- */
            const refused = await cliRaw(['dump', '--out', out.path, '--no-decrypt'], device);
            expect(refused.code).toBe(EXIT_FAILED);
            expect(refused.stderr).toContain('seek-fw preserve');
            const backup = await cli(
              ['preserve', '--backup-only', '--yes', '--out', out.path],
              device,
            );
            expect(backup.code, backup.stderr).toBe(EXIT_OK);
            const truth = readFileSync(truthPath);
            const image = findBackupImage(out.path);
            expect(image.length, 'the backup image').toBeGreaterThan(0);
            /* the 31 windows, 64 KiB each, 0x14010000..0x141FFFFF */
            const first = 0x14010000 - FLASH_BASE;
            const span = 31 * 0x10000;
            expect(
              Buffer.compare(
                image.subarray(first, first + span),
                truth.subarray(first, first + span),
              ),
              'the backup windows equal the emulated part',
            ).toBe(0);
          });
          await row.assertDelivery();
        } finally {
          await row.finish();
          await out.cleanup();
        }
      },
    );
  },
);
