/* eslint-disable @typescript-eslint/require-await -- the fake answers the async WebUSB shape at once: no awaits are needed */
/* ==================================================================== *
 * A fake Seek camera for the unit tests: a WebUSB-shaped device that core's WebUsbTransport
 * drives exactly as it drives the real one, plus a scripted frame stream on endpoint 1.
 * Every transfer is logged, so a test can assert the requests the checker sent.
 * ==================================================================== */

import type {
  WebUsbConfiguration,
  WebUsbControlSetup,
  WebUsbDevice,
  WebUsbInTransferResult,
  WebUsbOutTransferResult,
} from '../../../../packages/core/src/protocol/webusb.js';
import { SeekError } from '../../../../packages/core/src/errors.js';
import { COMPACT_FRAME_BYTES, PRO_FRAME_BYTES } from './frame.js';
import type { WebUsbBulkDevice } from './link.js';

export interface LoggedTransfer {
  readonly dir: 'in' | 'out' | 'bulk';
  readonly request: number;
  readonly value: number;
  readonly index: number;
  /** For an OUT, the payload; for an IN, the requested length. */
  readonly data: readonly number[];
}

export interface FakeCameraOptions {
  readonly productId?: number;
  readonly serialNumber?: string | null;
  /** The answers to GET_FIRMWARE_INFO with length 8, in order; the last one repeats. */
  readonly firmwareHeads?: readonly (readonly number[])[];
  /** The answer to GET_FIRMWARE_INFO with length 4. */
  readonly firmware4?: readonly number[];
  /** The 12-byte chip id (GET_CHIP_ID). It is also the device-id block's +4 words, as on the bench camera. */
  readonly chipId?: readonly number[];
  /**
   * The ASCII device serial at +16 of the device-id block, which SetRamDataFeatures case 0 arms and the window reader
   * (0x4F, or 0x58 on 0.7.x) serves. Null: the block carries no serial (TESTING.md 42.37).
   */
  readonly deviceSerial?: string | null;
  /** Frame bytes that the stream delivers, in order. Empty: bulk reads time out. */
  readonly frames?: readonly Uint8Array[];
  /** Keep delivering frames forever, the last one again; a read yields to the event loop. */
  readonly endless?: boolean;
  /** OUT requests the camera refuses (a STALL), every time they are sent. */
  readonly refuseOut?: readonly number[];
  /** The first this-many GetFirmwareInfo reads are refused (a STALL), as a build still starting refuses them. */
  readonly stallFirstInfo?: number;
  /**
   * Every GetFirmwareInfo read fails: 'transfer' as a device that has gone (a transfer error), 'timeout' as one that
   * never answers in time. The camera is not answering at all (TESTING.md 42.58).
   */
  readonly infoFault?: 'transfer' | 'timeout';
  /**
   * SetImageProcessingMode requests for these modes are refused (a STALL), and the rest are accepted. The 1.3.0.8
   * family refuses mode 3 (FastRaw, Init Hi FPS) at 0x3e and takes mode 8 (TESTING.md 42.58).
   */
  readonly refuseModes?: readonly number[];
}

const SET_IMAGE_PROCESSING_MODE = 0x3e;
const SET_RAM_DATA_FEATURES = 0x5a;

/**
 * The device-id block (core's readSerial reads it): the header 01 00 31 f7, the chip id's bytes at +4, the ASCII serial
 * at +16 (asciiz, twelve bytes), then zeros to 248. The bytes are the bench Compact's (TESTING.md 42.37).
 */
function deviceIdentityBlock(chipId: readonly number[], serial: string | null): Uint8Array {
  const block = new Uint8Array(248);
  block.set([0x01, 0x00, 0x31, 0xf7], 0);
  block.set(chipId.slice(0, 12), 4);
  if (serial !== null) block.set(new TextEncoder().encode(serial).slice(0, 12), 16);
  return block;
}

/** One Compact frame: every word `value`, the header words set as the Swift tests set them. */
export function compactFrame(status: number, value: number): Uint8Array {
  const b = new Uint8Array(COMPACT_FRAME_BYTES);
  for (let i = 0; i < b.length; i += 2) {
    b[i] = value & 0xff;
    b[i + 1] = value >> 8;
  }
  b[20] = status;
  b[2] = 0x34;
  b[3] = 0x12; // device temperature 0x1234
  b[80] = 0x07;
  b[81] = 0x00; // frame counter 7
  return b;
}

/** One Pro frame: every word `value`, the status at byte 4. */
export function proFrame(status: number, value: number): Uint8Array {
  const b = new Uint8Array(PRO_FRAME_BYTES);
  for (let i = 0; i < b.length; i += 2) {
    b[i] = value & 0xff;
    b[i + 1] = value >> 8;
  }
  b[4] = status;
  return b;
}

export class FakeCamera implements WebUsbDevice, WebUsbBulkDevice {
  readonly vendorId = 0x289d;
  readonly productId: number;
  readonly manufacturerName = 'Seek Thermal, Inc.';
  readonly productName = 'Thermal Camera';
  readonly serialNumber: string | null;
  readonly configuration: WebUsbConfiguration = { configurationValue: 1 };
  opened = false;
  /** Every transfer the checker sent, in order. */
  readonly log: LoggedTransfer[] = [];

  private readonly firmwareHeads: readonly (readonly number[])[];
  private readonly firmware4: readonly number[];
  private readonly chipId: readonly number[];
  private readonly deviceBlock: Uint8Array;
  private readonly endless: boolean;
  private readonly refuseOut: readonly number[];
  private readonly refuseModes: readonly number[];
  private readonly infoFault: 'transfer' | 'timeout' | undefined;
  private infoStalls: number;
  private stream: Uint8Array[];
  private headIndex = 0;
  /** The next byte the window reader serves from the device-id block; 0 until SetRamDataFeatures arms it. */
  private blockCursor = 0;
  private blockArmed = false;

  constructor(options: FakeCameraOptions = {}) {
    this.productId = options.productId ?? 0x0010;
    this.serialNumber = options.serialNumber === undefined ? null : options.serialNumber;
    this.firmwareHeads = options.firmwareHeads ?? [[1, 3, 0, 0, 0, 0, 0, 0]];
    this.firmware4 = options.firmware4 ?? [1, 3, 0, 0];
    /* The bench Compact 1013CE098ACA (TESTING.md 42.37): the chip ID's every other byte is the chip ID. */
    this.chipId = options.chipId ?? [
      0x10, 0x00, 0x13, 0x00, 0xce, 0x00, 0x09, 0x00, 0x8a, 0x00, 0xca, 0x00,
    ];
    this.deviceBlock = deviceIdentityBlock(
      this.chipId,
      options.deviceSerial === undefined ? '101310HSNEA2' : options.deviceSerial,
    );
    this.endless = options.endless ?? false;
    this.refuseOut = options.refuseOut ?? [];
    this.refuseModes = options.refuseModes ?? [];
    this.infoFault = options.infoFault;
    this.infoStalls = options.stallFirstInfo ?? 0;
    this.stream = [...(options.frames ?? [])];
  }

  /** The requests of one kind, as (request, payload) pairs, in order. */
  sent(dir: 'in' | 'out' | 'bulk'): LoggedTransfer[] {
    return this.log.filter((entry) => entry.dir === dir);
  }

  async open(): Promise<void> {
    this.opened = true;
  }
  async close(): Promise<void> {
    this.opened = false;
  }
  async selectConfiguration(): Promise<void> {
    /* the fake is always configured */
  }
  async claimInterface(): Promise<void> {
    /* the fake's interface is always claimed */
  }
  async releaseInterface(): Promise<void> {
    /* nothing to release */
  }

  async controlTransferIn(
    setup: WebUsbControlSetup,
    length: number,
  ): Promise<WebUsbInTransferResult> {
    this.log.push({
      dir: 'in',
      request: setup.request,
      value: setup.value,
      index: setup.index,
      data: [length],
    });
    if (setup.request === 0x4e && this.infoFault === 'transfer') {
      throw new Error('the device has gone');
    }
    if (setup.request === 0x4e && this.infoFault === 'timeout') {
      throw new SeekError('usb/timeout', 'control IN 0x4e did not answer within 500 ms');
    }
    if (setup.request === 0x4e && length === 8 && this.infoStalls > 0) {
      this.infoStalls -= 1;
      return { status: 'stall' };
    }
    if (setup.request === 0x4e && length === 8) {
      const head =
        this.firmwareHeads[Math.min(this.headIndex, this.firmwareHeads.length - 1)] ?? [];
      this.headIndex += 1;
      return bytesResult(head.slice(0, length));
    }
    if (setup.request === 0x4e) return bytesResult(this.firmware4.slice(0, length));
    if (setup.request === 0x36) return bytesResult(this.chipId.slice(0, length));
    if ((setup.request === 0x4f || setup.request === 0x58) && this.blockArmed) {
      const from = this.blockCursor;
      this.blockCursor += length;
      return bytesResult(Array.from(this.deviceBlock.subarray(from, from + length)));
    }
    return bytesResult(new Array<number>(length).fill(0));
  }

  async controlTransferOut(
    setup: WebUsbControlSetup,
    data: ArrayBufferView,
  ): Promise<WebUsbOutTransferResult> {
    const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    this.log.push({
      dir: 'out',
      request: setup.request,
      value: setup.value,
      index: setup.index,
      data: [...bytes],
    });
    const refusedMode =
      setup.request === SET_IMAGE_PROCESSING_MODE && this.refuseModes.includes(bytes[0] ?? -1);
    if (this.refuseOut.includes(setup.request) || refusedMode) {
      return { status: 'stall', bytesWritten: 0 };
    }
    /* SetRamDataFeatures case 0 arms the device-id block (core's readSerial). */
    if (setup.request === SET_RAM_DATA_FEATURES && bytes[0] === 0 && bytes[1] === 0) {
      this.blockArmed = true;
      this.blockCursor = 0;
    }
    return { status: 'ok', bytesWritten: bytes.length };
  }

  /** Bulk IN on endpoint 1: the next bytes of the scripted stream; a timeout when there are none. */
  async transferIn(endpointNumber: number, length: number): Promise<WebUsbInTransferResult> {
    this.log.push({ dir: 'bulk', request: endpointNumber, value: 0, index: 0, data: [length] });
    if (this.endless) {
      await new Promise((resolve) => setImmediate(resolve));
      if (this.stream.length === 0) this.stream.push(compactFrame(3, 5000));
    }
    const head = this.stream[0];
    if (head === undefined) throw new Error('transfer was cancelled');
    const take = Math.min(length, head.length);
    const out = head.slice(0, take);
    if (take === head.length) {
      this.stream.shift();
      if (this.endless && this.stream.length === 0) this.stream.push(head);
    } else {
      this.stream[0] = head.slice(take);
    }
    return { status: 'ok', data: new DataView(out.buffer, out.byteOffset, out.byteLength) };
  }
}

function bytesResult(bytes: readonly number[]): WebUsbInTransferResult {
  const array = Uint8Array.from(bytes);
  return { status: 'ok', data: new DataView(array.buffer, array.byteOffset, array.byteLength) };
}
