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
import { COMPACT_FRAME_BYTES, COMPACT_HEADER_BYTES, PRO_FRAME_BYTES } from './frame.js';
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
  /**
   * The camera's own transfer size for a payload part (16,224 bytes on the bench). A frame goes out as device
   * transfers of this size, and a header-form frame (0x8200) starts with its 1,664-byte header (TESTING.md 42.74).
   */
  readonly frameTransferBytes?: number;
  /** A slow host: each bulk IN's data reaches the checker this many milliseconds after the camera sent it. */
  readonly hostDelayMs?: number;
  /** The Nth bulk IN (counting from 1) fails with a transfer error. */
  readonly failIn?: number;
  /** The Nth bulk IN (counting from 1) is stalled. */
  readonly stallIn?: number;
  /** A zero-length packet is sent before the device transfers with these indexes (counting from 0). */
  readonly zeroLengthBefore?: readonly number[];
}

/** A bulk IN the checker has posted and the camera has not answered yet. */
interface PendingIn {
  readonly length: number;
  readonly resolve: (result: WebUsbInTransferResult) => void;
  readonly reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout> | undefined;
}

const SET_IMAGE_PROCESSING_MODE = 0x3e;
const SET_RAM_DATA_FEATURES = 0x5a;
const IMAGE_DATA = 0x53;
/** The payload transfer size of a Compact frame, and the header's (TESTING.md 42.74). */
const PAYLOAD_TRANSFER_BYTES = 16224;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  private readonly stream: Uint8Array[];
  private headIndex = 0;
  /** The next byte the window reader serves from the device-id block; 0 until SetRamDataFeatures arms it. */
  private blockCursor = 0;
  private blockArmed = false;
  private readonly frameTransferBytes: number;
  private readonly hostDelayMs: number;
  private readonly failIn: number;
  private readonly stallIn: number;
  private readonly zeroLengthBefore: ReadonlySet<number>;
  /** The camera's transfers for the frame in progress, not yet answered: a zero-length entry is a ZLP. */
  private queue: Uint8Array[] = [];
  /** The bulk INs the checker has posted and the camera has not answered, oldest first. */
  private readonly waiting: PendingIn[] = [];
  private inCount = 0;
  private transferNo = 0;
  private lastFrame: Uint8Array | null = null;
  /** ImageData credits received. */
  credits = 0;
  /** Credits that arrived while the camera still held a transfer: the firmware cancels those (rpc_cmds.c). */
  creditsWithDataQueued = 0;
  /** Camera transfers that a credit cancelled. A correct checker leaves none. */
  cancelledByCredit = 0;
  /** Bulk INs the checker cancelled while they were pending. */
  cancelledIns = 0;
  /** Bulk INs posted and not yet completed to the checker. */
  private inFlightIns = 0;
  /** The most bulk INs in flight at once: the tests' measure of the checker's in-flight count. */
  maxPendingIns = 0;

  constructor(options: FakeCameraOptions = {}) {
    this.frameTransferBytes = options.frameTransferBytes ?? PAYLOAD_TRANSFER_BYTES;
    this.hostDelayMs = options.hostDelayMs ?? 0;
    this.failIn = options.failIn ?? 0;
    this.stallIn = options.stallIn ?? 0;
    this.zeroLengthBefore = new Set(options.zeroLengthBefore ?? []);
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
    if (setup.request === IMAGE_DATA) this.credit(bytes);
    return { status: 'ok', bytesWritten: bytes.length };
  }

  /**
   * One frame credit (ImageData). The camera releases the next frame onto its transfer queue, as a header-form frame
   * (0x8200) or a body-only one (0x7EC0). A transfer it still holds is cancelled, as the firmware does.
   */
  private credit(data: Uint8Array): void {
    this.credits += 1;
    if (this.queue.length > 0) {
      this.creditsWithDataQueued += 1;
      this.cancelledByCredit += this.queue.length;
      this.queue = [];
    }
    let frame = this.stream.shift();
    if (frame === undefined && this.endless) frame = this.lastFrame ?? compactFrame(3, 5000);
    if (frame === undefined) {
      /* no frame is left: the INs waiting for one end now, as a stream that has run out does */
      this.failWaiting('transfer was cancelled');
      return;
    }
    this.lastFrame = frame;
    this.enqueue(frame, (data[1] ?? 0) === 0x82);
    this.serve();
  }

  /** Splits a frame into the camera's transfers: the header (when there is one), then payload parts. */
  private enqueue(frame: Uint8Array, header: boolean): void {
    const sizes: number[] = [];
    let left = frame.length;
    if (header) {
      const n = Math.min(COMPACT_HEADER_BYTES, left);
      sizes.push(n);
      left -= n;
    }
    while (left > 0) {
      const n = Math.min(this.frameTransferBytes, left);
      sizes.push(n);
      left -= n;
    }
    let at = 0;
    for (const n of sizes) {
      if (this.zeroLengthBefore.has(this.transferNo)) this.queue.push(new Uint8Array(0));
      this.queue.push(frame.slice(at, at + n));
      at += n;
      this.transferNo += 1;
    }
  }

  /** Answers waiting INs from the queue, oldest first. A zero-length transfer answers an IN with no bytes. */
  private serve(): void {
    for (
      let head = this.queue[0];
      head !== undefined && this.waiting.length > 0;
      head = this.queue[0]
    ) {
      const entry = this.waiting.shift();
      if (entry === undefined) break;
      if (entry.timer !== undefined) clearTimeout(entry.timer);
      if (head.length === 0) {
        this.queue.shift();
        entry.resolve({ status: 'ok', data: new DataView(new ArrayBuffer(0)) });
        continue;
      }
      const take = Math.min(entry.length, head.length);
      const out = head.slice(0, take);
      if (take === head.length) this.queue.shift();
      else this.queue[0] = head.slice(take);
      entry.resolve({
        status: 'ok',
        data: new DataView(out.buffer, out.byteOffset, out.byteLength),
      });
    }
  }

  /** Ends every waiting IN with `reason` (a cancel, or a stream with nothing left to send). */
  private failWaiting(reason: string): void {
    for (const entry of this.waiting.splice(0)) {
      if (entry.timer !== undefined) clearTimeout(entry.timer);
      entry.reject(new Error(reason));
    }
  }

  /**
   * Bulk IN on endpoint 1. It is answered from the camera's queue, oldest IN first, and waits for a credit when
   * the queue is empty. A deadline ends it as a timeout (the transfer's own, as node-usb does). With nothing left
   * to send, it ends at once, so a stream that has run out does not hold the checker.
   */
  async transferIn(
    endpointNumber: number,
    length: number,
    timeoutMs = 3000,
  ): Promise<WebUsbInTransferResult> {
    this.log.push({ dir: 'bulk', request: endpointNumber, value: 0, index: 0, data: [length] });
    this.inCount += 1;
    if (this.inCount === this.failIn) throw new Error('the device has gone');
    if (this.inCount === this.stallIn) return { status: 'stall' };
    if (this.queue.length === 0 && this.stream.length === 0 && !this.endless) {
      throw new Error('transfer was cancelled');
    }
    /* in flight: posted and not yet completed to the checker, whether the camera answered it at once or later */
    this.inFlightIns += 1;
    this.maxPendingIns = Math.max(this.maxPendingIns, this.inFlightIns);
    try {
      const result = new Promise<WebUsbInTransferResult>((resolve, reject) => {
        const entry: PendingIn = { length, resolve, reject, timer: undefined };
        entry.timer = setTimeout(() => {
          const at = this.waiting.indexOf(entry);
          if (at >= 0) this.waiting.splice(at, 1);
          reject(Object.assign(new Error('timed out'), { name: 'TimeoutError' }));
        }, timeoutMs);
        this.waiting.push(entry);
        this.serve();
      });
      const answered = await result;
      /* a real transfer completes on a later turn of the event loop: a stream loop must not starve its timers */
      await sleep(this.hostDelayMs);
      return answered;
    } finally {
      this.inFlightIns -= 1;
    }
  }

  /** Cancels the bulk INs the checker has pending on the endpoint. The camera's own queue is left as it is. */
  cancelTransfers(): void {
    this.cancelledIns += this.waiting.length;
    this.failWaiting('transfer was cancelled');
  }

  /** The bulk INs pending now. */
  get pendingIns(): number {
    return this.waiting.length;
  }
}

function bytesResult(bytes: readonly number[]): WebUsbInTransferResult {
  const array = Uint8Array.from(bytes);
  return { status: 'ok', data: new DataView(array.buffer, array.byteOffset, array.byteLength) };
}
