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
  /** The 12-byte chip id (GET_CHIP_ID). */
  readonly chipId?: readonly number[];
  /** Frame bytes that the stream delivers, in order. Empty: bulk reads time out. */
  readonly frames?: readonly Uint8Array[];
  /** Keep delivering frames forever, the last one again; a read yields to the event loop. */
  readonly endless?: boolean;
  /** OUT requests the camera refuses (a STALL), every time they are sent. */
  readonly refuseOut?: readonly number[];
  /** The first this-many GetFirmwareInfo reads are refused (a STALL), as a build still starting refuses them. */
  readonly stallFirstInfo?: number;
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
  private readonly endless: boolean;
  private readonly refuseOut: readonly number[];
  private infoStalls: number;
  private stream: Uint8Array[];
  private headIndex = 0;

  constructor(options: FakeCameraOptions = {}) {
    this.productId = options.productId ?? 0x0010;
    this.serialNumber = options.serialNumber === undefined ? null : options.serialNumber;
    this.firmwareHeads = options.firmwareHeads ?? [[1, 3, 0, 0, 0, 0, 0, 0]];
    this.firmware4 = options.firmware4 ?? [1, 3, 0, 0];
    this.chipId = options.chipId ?? [
      0x10, 0x13, 0xce, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ];
    this.endless = options.endless ?? false;
    this.refuseOut = options.refuseOut ?? [];
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
    if (this.refuseOut.includes(setup.request)) return { status: 'stall', bytesWritten: 0 };
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
