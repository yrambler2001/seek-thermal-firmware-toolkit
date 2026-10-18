/* ==================================================================== *
 * What the checker needs from a camera, and the one place that builds it.
 *
 * The control requests go through core's `WebUsbTransport`, the same transport the CLI and the
 * page use (claim, recipient, stall handling and the per-transfer deadline all come from there).
 * The frame stream is a bulk IN on endpoint 1 (0x81), which core's transport does not carry, so
 * it is read through `transferIn`, the WebUSB shape the `usb` package and the emulator's
 * `UsbIpWebUsbDevice` both have (1 is 0x81: the `usb` package numbers endpoints this way).
 *
 * `seekLink` takes any WebUSB-shaped device, so the same checker code runs over the real camera
 * (node-usb-link.ts) and over the emulator (emulator-link.ts). Nothing here sends a request by
 * itself; that is the camera's job (camera.ts).
 * ==================================================================== */

import type {
  DeviceDescription,
  UsbTransport,
} from '../../../../packages/core/src/protocol/transport.js';
import {
  WebUsbTransport,
  type DeadlineClock,
  type WebUsbDevice,
  type WebUsbInTransferResult,
} from '../../../../packages/core/src/protocol/webusb.js';

/** The frame stream: endpoint number 1, which is address 0x81. */
export const FRAME_ENDPOINT = 1;

/** The `usb` package's `transferIn` and the emulator's: bulk IN by endpoint number. */
export interface WebUsbBulkDevice {
  transferIn(
    endpointNumber: number,
    length: number,
    timeoutMs: number,
  ): Promise<WebUsbInTransferResult>;
}

export interface SeekLink {
  /** The control side: vendor requests on interface 0, exactly as the CLI sends them. */
  readonly transport: UsbTransport;
  readonly description: DeviceDescription;
  /**
   * One bulk IN on `endpointNumber`: whatever arrives, up to `length` bytes, or null when nothing
   * arrived before the deadline (the Swift readExact's nil). A stall throws.
   */
  bulkIn(endpointNumber: number, length: number, timeoutMs: number): Promise<Uint8Array | null>;
  close(): Promise<void>;
}

export interface SeekLinkOptions {
  /** The device the control transfers go to (a WebUSB device). */
  readonly control: WebUsbDevice;
  /** The device the bulk reads go to: the same device, with `transferIn`. */
  readonly bulk: WebUsbBulkDevice;
  /** Recorded in dump manifests and error messages, e.g. 'node-usb 3.x (WebUSB shim)'. */
  readonly api: string;
  readonly host?: string | null;
  readonly clock?: DeadlineClock;
  readonly onWarning?: (message: string) => void;
}

/** The host stack's words for a bulk read that ran out of time (node-usb, nusb and the emulator). */
const TIMEOUT_MARKERS: readonly string[] = ['transfer was cancelled', 'timed out'];

/** Whether a bulk read failed because its deadline passed, not because the device refused it. */
export function isBulkTimeout(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === 'LIBUSB_TRANSFER_TIMED_OUT' || error.name === 'TimeoutError') return true;
  return TIMEOUT_MARKERS.some((marker) => error.message.includes(marker));
}

/** A link over one WebUSB-shaped camera. The transport is created here and not opened yet. */
export function seekLink(options: SeekLinkOptions): SeekLink {
  const transport = new WebUsbTransport(options.control, {
    recipient: 'auto',
    api: options.api,
    host: options.host ?? 'seek-fps',
    ...(options.clock === undefined ? {} : { clock: options.clock }),
    ...(options.onWarning === undefined ? {} : { onWarning: options.onWarning }),
  });
  return {
    transport,
    get description(): DeviceDescription {
      return transport.description;
    },
    async bulkIn(endpointNumber, length, timeoutMs): Promise<Uint8Array | null> {
      let result: WebUsbInTransferResult;
      try {
        result = await options.bulk.transferIn(endpointNumber, length, timeoutMs);
      } catch (error) {
        if (isBulkTimeout(error)) return null;
        throw error;
      }
      if (result.status !== 'ok') {
        throw new Error(`bulk IN ${String(endpointNumber)} -> ${result.status}`);
      }
      const data = result.data;
      if (data === undefined) return new Uint8Array(0);
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    },
    close: () => transport.close(),
  };
}
