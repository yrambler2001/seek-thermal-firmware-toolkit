/* ====================================================================
 * The device-info read's two RAM selectors, in the shapes core sends them. This file is the ONE
 * place the shapes are written down. Two guards use them:
 *   - the page-side guard (`write-guard.ts`) is injected into the page as text, so it cannot
 *     import this file; `camera-flow.ts` hands it these lists through its config (`infoOps`);
 *   - the Node bridge (`camera-bus.ts`) imports `infoShapeRefusal` below.
 *
 *   SetFirmwareInfoFeatures (0x55), a u16 record selector: 1 (bootloader), 20 (platform),
 *     17 (USB speed), 10 (roots), and 6, 7, 8 (the bank verdicts; core reads them only on 1.3.0.8);
 *   SetRamDataFeatures (0x5A), the device-id block alone: case 0 at length 124, a 6-byte payload.
 *
 * Core's shapes: `readFwInfo` and `readSerial` in packages/core/src/protocol/client.ts, and
 * `readDeviceInfo` in packages/core/src/workflows/device-info.ts (TESTING.md 42.68).
 * ==================================================================== */

import { OP } from '../../packages/core/src/protocol/ops.js';

/** SetFirmwareInfoFeatures: the u16 record selector. */
export const INFO_FIRMWARE_INFO_OP: number = OP.SET_FIRMWARE_INFO_FEATURES;
/** SetRamDataFeatures: the device-id block. */
export const INFO_RAM_DATA_OP: number = OP.SET_RAM_DATA_FEATURES;
/** The record selectors the Info read sends in SetFirmwareInfoFeatures. */
export const INFO_SELECTORS: readonly number[] = [1, 6, 7, 8, 10, 17, 20];
/** The 6-byte payload of the device-id SetRamDataFeatures: case 0, length 124. */
export const INFO_SERIAL_BLOCK: readonly number[] = [0x00, 0x00, 0x7c, 0x00, 0x00, 0x00];

const hex = (n: number): string => `0x${n.toString(16).padStart(2, '0')}`;

/**
 * Null when an OUT with this request and payload is one the Info read sends; otherwise the
 * refusal's reason. Says nothing about the window: the caller decides whether the Info read is
 * open. A request that is not one of the two selectors is refused here too.
 */
export function infoShapeRefusal(request: number, bytes: Uint8Array): string | null {
  if (request === INFO_FIRMWARE_INFO_OP) {
    if (bytes.length !== 2) return 'SetFirmwareInfoFeatures with a payload other than a u16';
    const selector = (bytes[0] ?? 0) | ((bytes[1] ?? 0) << 8);
    return INFO_SELECTORS.includes(selector)
      ? null
      : `SetFirmwareInfoFeatures(${String(selector)}): a selector the Info read does not send`;
  }
  if (request === INFO_RAM_DATA_OP) {
    const sameBlock =
      bytes.length === INFO_SERIAL_BLOCK.length &&
      INFO_SERIAL_BLOCK.every((b, i) => bytes[i] === b);
    return sameBlock
      ? null
      : 'SetRamDataFeatures other than the device-id block the Info read sends';
  }
  return `OUT ${hex(request)} is not one of the Info read's selectors`;
}
