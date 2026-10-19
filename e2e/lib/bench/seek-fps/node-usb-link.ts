/**
 * The REAL camera as a `SeekLink`: the `usb` package's WebUSB shim, wrapped by the CLI's own
 * correction layer (`fromNodeUsb`, packages/cli/src/node-usb.ts) for the control side, and the
 * same device's `transferIn` for the frame stream.
 *
 * It opens the first Seek camera it finds, Pro (0x0011) before Compact (0x0010), as the Swift
 * `USBDevice.open(productIDs:)` does. Nothing is sent by opening: the transport claims the
 * interface, and the camera's requests are sent by camera.ts and nothing else.
 */

import { SEEK_VENDOR_ID } from '../../../../packages/core/src/protocol/ops.js';
import { fromNodeUsb, type NodeUsbDevice } from '../../../../packages/cli/src/node-usb.js';
import { COMPACT_PRODUCT_ID, PRO_PRODUCT_ID, noAnswerMessage } from './camera.js';
import { seekLink, type SeekLink, type WebUsbBulkDevice } from './link.js';

/** The `usb` package's device as this file uses it: the CLI's view, plus the bulk transfer. */
type UsbDeviceWithBulk = NodeUsbDevice & WebUsbBulkDevice;

interface WebUsbPicker {
  getDevices(): Promise<UsbDeviceWithBulk[]>;
}

/** The bus's time base for a measurement: the host's monotonic clock, in seconds. */
export function wallSeconds(): number {
  return performance.now() / 1000;
}

/** The Seek cameras on the bus, Pro first (the Swift order of preference). */
export async function findSeekCameras(): Promise<UsbDeviceWithBulk[]> {
  const { WebUSB } = await import('usb');
  const webusb = new WebUSB({ allowAllDevices: true }) as unknown as WebUsbPicker;
  const devices = await webusb.getDevices();
  const cameras = devices.filter((device) => device.vendorId === SEEK_VENDOR_ID);
  return [PRO_PRODUCT_ID, COMPACT_PRODUCT_ID].flatMap((pid) =>
    cameras.filter((device) => device.productId === pid),
  );
}

/** Opens the first Seek camera on the bus as a link. Throws when there is none (the camera did not answer). */
export async function openNodeUsbCamera(): Promise<SeekLink> {
  const [device] = await findSeekCameras();
  if (device === undefined) {
    throw new Error(
      noAnswerMessage('no Seek Thermal camera is on the bus (product 0x0011 or 0x0010)'),
    );
  }
  if (typeof device.transferIn !== 'function') {
    throw new Error(
      'this usb package has no bulk transfer (transferIn); the frame stream needs it',
    );
  }
  return seekLink({
    control: fromNodeUsb(device),
    bulk: device,
    api: 'node-usb 3.x (WebUSB shim, CLI correction layer)',
    host: 'seek-fps',
    onWarning: (message) => process.stderr.write(`seek-fps: ${message}\n`),
    /* node-usb 3.1.0 refuses a second transferIn on the endpoint while one is pending ("endpoint not found"),
     * and it has no cancel, so one bulk IN at a time (TESTING.md 42.75, the probe in its section 2). */
    maxBulkIn: 1,
  });
}
