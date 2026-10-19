/**
 * The FW-V1 EMULATOR as a `SeekLink`: one emulated camera, booted by the core suites' own
 * harness (`Emulator.start`) and served over USB/IP to `UsbIpWebUsbDevice`, which is the same
 * device object the fps-patch emulator suite uses. The control side is core's WebUsbTransport,
 * the frame side is the device's bulk `transferIn`, so the checker runs the same code it runs
 * on the real camera.
 *
 * The host model is `nusb`: a host that honours a transfer's own timeout, as libusb and nusb do
 * (`chrome` never gives a transfer up, which a frame read with a deadline cannot use).
 *
 * LABEL A RESULT FROM HERE HONESTLY: it has been through the toolkit's protocol stack against
 * the firmware running in the emulator, not through a kernel USB stack or silicon.
 */

import { Emulator } from '../../../../packages/core/test/emulator/harness.js';
import type { UsbIpWebUsbDevice } from '../../../../packages/core/test/emulator/webusb-over-usbip.js';
import { seekLink, type SeekLink } from './link.js';

export interface EmulatorBoot {
  /** The FW-V1 `emu` directory (SEEK_EMU_DIR). */
  readonly emuDir: string;
  /** The corpus entry the emulator serves (`--corpus-entry`). With `flashOverride`, the build the part is a copy of
   *  (`--flash-entry`): its board and its 32K sensor are the ones the part boots with. */
  readonly entryId: string;
  /** Boot this 4 MiB part instead of the entry's own flash (`--flash`): a patched image. */
  readonly flashOverride?: string;
  /** Where the as-booted 4 MiB image is written (the ground truth). */
  readonly flashOut?: string;
  readonly jedec?: string;
  readonly donor?: string;
  readonly readyTimeoutMs?: number;
  /** The per-URB wall-clock watchdog (SEEK_EMU_URB_TIMEOUT_MS by default). */
  readonly urbTimeoutMs?: number;
}

export interface EmulatorCamera {
  readonly emu: Emulator;
  readonly device: UsbIpWebUsbDevice;
  readonly link: SeekLink;
  /** Stop the emulator (every emulator this process started is stopped; the harness audits it). */
  stop(): Promise<void>;
}

export async function startEmulatorCamera(boot: EmulatorBoot): Promise<EmulatorCamera> {
  const emu = await Emulator.start(boot.emuDir, {
    entryId: boot.entryId,
    /* the frame-rate checker needs frames: the sensor feed is attached (the core suites run without it) */
    sensor: true,
    ...(boot.flashOverride === undefined
      ? {}
      : { flashOverride: boot.flashOverride, flashEntry: boot.entryId }),
    ...(boot.flashOut === undefined ? {} : { flashOut: boot.flashOut }),
    ...(boot.jedec === undefined ? {} : { jedec: boot.jedec }),
    ...(boot.donor === undefined ? {} : { donor: boot.donor }),
    ...(boot.readyTimeoutMs === undefined ? {} : { readyTimeoutMs: boot.readyTimeoutMs }),
  });
  const device = await emu.attach({
    urbTimeoutMs: boot.urbTimeoutMs ?? 30_000,
    hostModel: 'nusb',
  });
  const link = seekLink({
    control: device,
    bulk: device,
    api: 'usbip (emulator)',
    host: 'seek-fps',
    clock: device.deadlineClock,
    /* not measured with several bulk INs pending: one at a time until it is (TESTING.md 42.75) */
    maxBulkIn: 1,
  });
  return {
    emu,
    device,
    link,
    async stop(): Promise<void> {
      await link.close().catch(() => undefined);
      await emu.stop();
    },
  };
}
