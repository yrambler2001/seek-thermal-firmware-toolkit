/* ==================================================================== *
 * The Seek camera as the Seek Thermal panel drives it: connect, the init sequences, the frame
 * read and the frame loop, with the calibration / shutter / NUC state machine.
 *
 * Port of SeekCamera in tv-jc/macos/Sources/SeekKit/Camera.swift (ThermoVision JoeC's
 * SeekThermalClass). The steps, the order of the requests and the state transitions are the
 * Swift ones. The differences are the host stack (a `SeekLink`, see link.ts) and async/await in
 * place of the Swift thread; nothing else is changed on purpose.
 *
 * WHAT IT SENDS (the whole list, and the only one the checker may send):
 *   IN   0x36 GetChipID (12 bytes, the serial when the USB string is empty)
 *        0x4E GetFirmwareInfo (4 or 8 bytes; 8 at connect, 4 before each init)
 *   OUT  0x37 "Startup with Operation=0" (classic init, option on)
 *        0x3C SetOperationMode: 1 starts the stream, 0 stops it (three times at disconnect)
 *        0x3E SetImageProcessingMode: the mode, 8 Normal, 3 Hi FPS / FastRaw, 0 Raw
 *        0x53 ImageData: one frame credit (the bulk length)
 *        0x54, 0x55, 0x56 the rest of the init sequences (classic and Pro)
 * Nothing else is ever sent. REQUESTS below names them; the camera spec checks the list.
 * ==================================================================== */

import { USB_TIMEOUT_MS, OP } from '../../../../packages/core/src/protocol/ops.js';
import type { UsbTransport } from '../../../../packages/core/src/protocol/transport.js';
import {
  COMPACT_FRAME_BYTES,
  COMPACT_HEIGHT,
  COMPACT_WIDTH,
  PRO_FRAME_BYTES,
  PRO_HEIGHT,
  PRO_WIDTH,
  SeekFrame,
} from './frame.js';
import { FRAME_ENDPOINT, type SeekLink } from './link.js';

/** The Pro is product 0x0011; the Compact and Compact XR are 0x0010 (Swift connect). */
export const PRO_PRODUCT_ID = 0x0011;
export const COMPACT_PRODUCT_ID = 0x0010;

/** The request numbers the checker sends, named as the Swift code names them where it does. */
export const REQUESTS = {
  GET_CHIP_ID: 0x36,
  GET_FIRMWARE_INFO: OP.GET_FIRMWARE_INFO,
  OP_ZERO: 0x37,
  SET_OPERATION_MODE: OP.SET_OPERATION_MODE,
  SET_IMAGE_PROCESSING_MODE: 0x3e,
  IMAGE_DATA: 0x53,
  INIT_54: 0x54,
  INIT_55: 0x55,
  INIT_56: 0x56,
} as const;

/** Every request the Swift tool may send IN, and every one it may send OUT. */
export const CHECKER_REQUESTS_IN: readonly number[] = [
  REQUESTS.GET_CHIP_ID,
  REQUESTS.GET_FIRMWARE_INFO,
];
export const CHECKER_REQUESTS_OUT: readonly number[] = [
  REQUESTS.OP_ZERO,
  REQUESTS.SET_OPERATION_MODE,
  REQUESTS.SET_IMAGE_PROCESSING_MODE,
  REQUESTS.IMAGE_DATA,
  REQUESTS.INIT_54,
  REQUESTS.INIT_55,
  REQUESTS.INIT_56,
];

/** The processing modes the panel offers: Normal, FastRaw (Hi FPS) and Raw. */
export const SEEK_MODE = { raw: 0, fastRaw: 3, normal: 8 } as const;
export type SeekMode = (typeof SEEK_MODE)[keyof typeof SEEK_MODE];

/**
 * The IP mode 6 (shutter-managed correlated double sample, op 9). The panel does not offer it; the emulator
 * spec measures it as a control, because the earlier frame-rate tests on the emulator ran in this mode.
 */
export const CONTROL_IP_MODE = 6;

/** The panel's options (Swift SeekOptions), with the Swift defaults. */
export interface SeekOptions {
  /** "Init Hi FPS": switch to FastRaw once the shutter frame has been seen. */
  readonly hiFPS: boolean;
  /** "Startup with Operation=0" (older firmware only). */
  readonly startupOpZero: boolean;
  /** "Compact: use Pro init (new FW)": applied only on Compact firmware 4.x and newer. */
  readonly compactProInit: boolean;
  readonly rawMin: number;
  readonly rawMax: number;
}

export const DEFAULT_SEEK_OPTIONS: SeekOptions = {
  hiFPS: true,
  startupOpZero: true,
  compactProInit: true,
  rawMin: 1000,
  rawMax: 65000,
};

export interface SeekDeviceInfo {
  readonly firmware: string;
  readonly serial: string;
  readonly model: string;
  readonly width: number;
  readonly height: number;
}

/** Firmware-info reads at connect: up to this many, until byte 0 is non-zero (Swift connect). */
export const FIRMWARE_INFO_TRIES = 6;
const FIRMWARE_INFO_GAP_MS = 20;
/** The frame bulk read's deadline (Swift readExact's default). */
export const FRAME_TIMEOUT_MS = 3000;

/** Whether the Compact Pro init applies: a Compact (never a Pro), the option on, firmware major >= 4. */
export function usesCompactProInit(
  isPro: boolean,
  option: boolean,
  firmwareMajor: number | null,
): boolean {
  return !isPro && option && firmwareMajor !== null && firmwareMajor >= 4;
}

/**
 * The firmware-info head the connect uses: an 8-byte read, asked again (up to six times) until
 * its first byte is non-zero. Right after a stop the camera can answer with a leftover slice
 * whose first byte is 0 (Swift connect). A failed read counts as an empty answer.
 */
export async function readFirmwareHead(
  transport: UsbTransport,
  gapMs: number = FIRMWARE_INFO_GAP_MS,
): Promise<Uint8Array> {
  let head: Uint8Array = new Uint8Array(0);
  for (let attempt = 0; attempt < FIRMWARE_INFO_TRIES; attempt++) {
    head = await transport
      .controlIn(REQUESTS.GET_FIRMWARE_INFO, 8, USB_TIMEOUT_MS)
      .catch(() => new Uint8Array(0));
    if (head.length > 0 && head[0] !== 0) break;
    await sleep(gapMs);
  }
  return head;
}

/** The serial from the chip-id read: every other byte, as hex (Swift connect's `serialHex`). */
export function serialFromChipId(id: Uint8Array): string {
  let out = '';
  for (let k = 0; k < id.length; k += 2)
    out += (id[k] ?? 0).toString(16).toUpperCase().padStart(2, '0');
  return out;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class SeekCamera {
  readonly link: SeekLink;
  readonly options: SeekOptions;
  info: SeekDeviceInfo | null = null;
  /** Called on each finished frame while the stream runs (Swift `onFrame`). */
  onFrame: ((frame: SeekFrame) => void) | null = null;

  width = 0;
  height = 0;
  isPro = false;
  /** The Compact runs the Pro init (firmware 4.x and newer with the option on). */
  compactOnPro = false;
  /** 0 normal; 1 / 2 / 3 little NUC steps; 10..13 big NUC steps. */
  nucState = 0;
  /** The mode of the last init that was sent (255 before one). */
  processingMode = 255;
  lastStatus = 0;
  lastDeviceTemp = 0;
  lastFrameCount = 0;
  deadMap: boolean[] | null = null;
  lastError: string | null = null;

  private connected = false;
  private streaming = false;
  private loop: Promise<void> | null = null;
  private doCloseShutter = false;
  private doOpenShutter = false;
  private gains: Float64Array | null = null;
  private frameID1: SeekFrame | null = null;
  private isNormalMode = true;
  private avrFramesLeft = 10;
  private shutterOffsetMapData: Int16Array | null = null;
  private firmwareBytes: Uint8Array = new Uint8Array(0);

  private constructor(link: SeekLink, options: SeekOptions) {
    this.link = link;
    this.options = options;
  }

  /** Open the camera and send the first init, in Normal mode, as the panel does. */
  static async connect(link: SeekLink, options: Partial<SeekOptions> = {}): Promise<SeekCamera> {
    const camera = new SeekCamera(link, { ...DEFAULT_SEEK_OPTIONS, ...options });
    await camera.open();
    return camera;
  }

  /** The offset map of the last shutter calibration (empty until a big NUC has run). */
  get shutterOffsetMap(): Int16Array | null {
    return this.shutterOffsetMapData;
  }

  get isStreaming(): boolean {
    return this.streaming;
  }

  /** The loop's flag, read through a method: it is set from outside the loop, between its awaits. */
  private isRunning(): boolean {
    return this.streaming;
  }

  /** Shutter and NUC commands are not sent on the Compact PRO init (Swift supportsShutterCommands). */
  get supportsShutterCommands(): boolean {
    return !this.compactOnPro;
  }

  private async open(): Promise<void> {
    await this.link.transport.open();
    const productId = this.link.description.productId;
    if (productId === PRO_PRODUCT_ID) {
      this.width = PRO_WIDTH;
      this.height = PRO_HEIGHT;
      this.isPro = true;
    } else {
      this.width = COMPACT_WIDTH;
      this.height = COMPACT_HEIGHT;
      this.isPro = false;
    }
    this.compactOnPro = false;
    this.frameID1 = null;
    this.deadMap = null;
    this.gains = null;
    this.nucState = 0;
    this.isNormalMode = true;

    const head = await readFirmwareHead(this.link.transport);
    this.compactOnPro = usesCompactProInit(
      this.isPro,
      this.options.compactProInit,
      head.length > 0 ? (head[0] ?? null) : null,
    );
    try {
      await this.sendInit(SEEK_MODE.normal);
    } catch (error) {
      await this.link.close();
      throw error;
    }
    const fw = head.length >= 4 && head[0] !== 0 ? head.subarray(0, 4) : this.firmwareBytes;
    const serialHex = serialFromChipId(await this.inBytes(REQUESTS.GET_CHIP_ID, 12));
    const model = this.isPro
      ? 'Seek Thermal Pro'
      : this.compactOnPro
        ? 'Seek Compact / Compact XR (Pro init)'
        : 'Seek Compact';
    const usbSerial = this.link.description.serialNumber;
    this.info = {
      firmware: fw.length === 4 ? Array.from(fw).join('.') : '-',
      serial:
        usbSerial !== null && usbSerial !== '' ? usbSerial : serialHex === '' ? '-' : serialHex,
      model,
      width: this.width,
      height: this.height,
    };
    this.connected = true;
  }

  /** Stop the stream, send SetOperationMode 0 three times, and close (Swift disconnect). */
  async disconnect(): Promise<void> {
    await this.stopStreaming();
    if (!this.connected) return;
    for (let k = 0; k < 3; k++) {
      await this.controlOut(REQUESTS.SET_OPERATION_MODE, [0, 0]).catch(() => undefined);
    }
    await this.link.close();
    this.connected = false;
    this.info = null;
  }

  /** The FastRaw / Normal / Raw buttons: stop the stream, send the init for the mode, start again. */
  async reinit(mode: number): Promise<void> {
    const wasStreaming = this.streaming;
    await this.stopStreaming();
    await this.sendInit(mode);
    this.isNormalMode = mode === SEEK_MODE.normal;
    if (wasStreaming) this.startStreaming();
  }

  /** Start the frame loop. Frames go to `onFrame`. A second start while running does nothing. */
  startStreaming(): void {
    if (this.streaming) return;
    this.streaming = true;
    this.lastError = null;
    this.loop = this.streamLoop();
  }

  /** Stop the loop and wait for it. It ends at its next frame or at the read's own deadline. */
  async stopStreaming(): Promise<void> {
    if (!this.streaming && this.loop === null) return;
    this.streaming = false;
    const loop = this.loop;
    if (loop !== null) await loop;
    this.loop = null;
  }

  /* ---- buttons (Swift nuc, bigNUC, shutterClose, shutterOpen) ---- */

  nuc(): void {
    if (this.processingMode !== SEEK_MODE.normal || this.compactOnPro) this.nucState = 1;
  }

  bigNUC(): void {
    this.nucState = 10;
  }

  shutterClose(): void {
    this.doCloseShutter = true;
  }

  shutterOpen(): void {
    this.doOpenShutter = true;
  }

  /* ---- requests ---- */

  private controlOut(request: number, data: readonly number[]): Promise<void> {
    return this.link.transport.controlOut(request, Uint8Array.from(data), USB_TIMEOUT_MS);
  }

  private controlIn(request: number, length: number): Promise<Uint8Array> {
    return this.link.transport.controlIn(request, length, USB_TIMEOUT_MS);
  }

  /** A control read that counts a failure as no bytes (Swift `(try? controlIn) ?? []`). */
  private inBytes(request: number, length: number): Promise<Uint8Array> {
    return this.controlIn(request, length).catch(() => new Uint8Array(0));
  }

  /** The init sequences (Swift sendInit): the Pro init on a Pro or a Compact with the Pro init, else the classic. */
  private async sendInit(requested: number): Promise<void> {
    let mode: number = requested;
    if (this.streaming) {
      for (let k = 0; k < 3; k++) await this.controlOut(REQUESTS.SET_OPERATION_MODE, [0, 0]);
    }
    this.firmwareBytes = await this.controlIn(REQUESTS.GET_FIRMWARE_INFO, 4);
    await this.controlIn(REQUESTS.GET_CHIP_ID, 12);
    if (this.compactOnPro) mode = SEEK_MODE.normal; // 4.8.2.1: mode 3 reboots it, mode 0 sends no frames
    if (this.isPro || this.compactOnPro) {
      await this.controlOut(REQUESTS.INIT_54, [1, 0, 0, 0]);
      await this.controlOut(REQUESTS.SET_OPERATION_MODE, [0, 0]);
      await this.controlOut(REQUESTS.INIT_56, [0x06, 0x00, 0x08, 0x00, 0x00, 0x00]);
      await this.controlOut(REQUESTS.INIT_55, [0x17, 0x00]);
      await this.controlOut(REQUESTS.INIT_56, [0x01, 0x00, 0x00, 0x06, 0x00, 0x00]);
      await this.controlOut(REQUESTS.INIT_56, [0x01, 0x00, 0x01, 0x06, 0x00, 0x00]);
      let a = 0;
      let b = 0;
      for (;;) {
        await this.controlOut(REQUESTS.INIT_56, [0x02, 0x00, b, a, 0x00, 0x00]);
        if (b < 0xe0) {
          b += 0x20;
        } else {
          b = 0;
          a += 1;
        }
        if (a === 0x09 && b === 0xe0) break;
      }
      await this.controlOut(REQUESTS.INIT_55, [0x15, 0x00]);
      await this.controlOut(REQUESTS.SET_IMAGE_PROCESSING_MODE, [mode, 0x00]);
      await this.controlOut(REQUESTS.SET_OPERATION_MODE, [0x01, 0x00]);
      this.processingMode = mode;
      return;
    }
    if (this.options.startupOpZero) {
      await this.controlOut(REQUESTS.OP_ZERO, [1, 0, 0, 0]);
      await this.controlOut(REQUESTS.SET_OPERATION_MODE, [0x00, 0x00]);
    }
    await this.controlOut(REQUESTS.INIT_56, [0x01]);
    await this.controlOut(REQUESTS.INIT_56, [0x00, 0x00]);
    await this.controlOut(REQUESTS.INIT_56, [0x06, 0x00, 0x08, 0x00, 0x00, 0x00]);
    await this.controlOut(REQUESTS.INIT_56, [0x01, 0x00, 0x00, 0x06, 0x00, 0x00]);
    await this.controlOut(REQUESTS.INIT_56, [0x01, 0x00, 0x01, 0x06, 0x00, 0x00]);
    await this.controlOut(REQUESTS.INIT_56, [0x20, 0x00, 0x30, 0x00, 0x00, 0x00]);
    await this.controlOut(REQUESTS.INIT_56, [0x20, 0x00, 0x50, 0x00, 0x00, 0x00]);
    await this.controlOut(REQUESTS.INIT_56, [0x0c, 0x00, 0x70, 0x00, 0x00, 0x00]);
    await this.controlOut(REQUESTS.SET_IMAGE_PROCESSING_MODE, [mode, 0x00]);
    await this.controlOut(REQUESTS.SET_OPERATION_MODE, [0x01, 0x00]);
    this.processingMode = mode;
  }

  /** Swift `try? sendInit`: a failed init during the loop is ignored, as the panel ignores it. */
  private async trySendInit(mode: number): Promise<void> {
    try {
      await this.sendInit(mode);
    } catch {
      /* ignored on purpose, as in the Swift */
    }
  }

  /* ---- frames ---- */

  /** One bulk read of a whole frame; null on a timeout or an error (the error is kept in lastError). */
  private async grabBytes(): Promise<Uint8Array | null> {
    try {
      if (this.isPro) {
        await this.controlOut(REQUESTS.IMAGE_DATA, [0x58, 0x5b, 0x01, 0x00]);
        return await this.readExact(FRAME_ENDPOINT, PRO_FRAME_BYTES);
      }
      await this.controlOut(REQUESTS.IMAGE_DATA, [0xc0, 0x7e, 0, 0]);
      return await this.readExact(FRAME_ENDPOINT, COMPACT_FRAME_BYTES);
    } catch (error) {
      this.lastError = messageOf(error);
      return null;
    }
  }

  /** Reads exactly `count` bytes from the endpoint, or null when a read times out (Swift readExact). */
  private async readExact(endpoint: number, count: number): Promise<Uint8Array | null> {
    const out = new Uint8Array(count);
    let got = 0;
    while (got < count) {
      const chunk = await this.link.bulkIn(endpoint, count - got, FRAME_TIMEOUT_MS);
      if (chunk === null || chunk.length === 0) return null;
      const take = Math.min(chunk.length, count - got);
      out.set(chunk.subarray(0, take), got);
      got += take;
    }
    return out;
  }

  private async grabFrame(): Promise<SeekFrame | null> {
    const bytes = await this.grabBytes();
    if (bytes === null) return null;
    return new SeekFrame(bytes, this.width, this.height, this.options.rawMin, this.options.rawMax);
  }

  /**
   * The next frame to show, handling the calibration frames on the way (Swift
   * grabVisualFrame). Status 4 is a gain calibration, 1 a shutter frame, 3 a
   * shutter-corrected image, 6 a vendor reference frame. Null on a timeout, or after 40
   * frames with no image.
   */
  private async grabVisualFrame(): Promise<SeekFrame | null> {
    if (this.doOpenShutter) {
      if (this.compactOnPro) {
        this.doOpenShutter = false; // the camera opens its own shutter; mode commands while streaming reboot it
      } else {
        await this.trySendInit(SEEK_MODE.normal);
      }
    }
    let tries = 40;
    while (tries > 0) {
      tries -= 1;
      const f = await this.grabFrame();
      if (f === null) return null;
      this.lastStatus = f.status;
      this.lastDeviceTemp = f.deviceTemp;
      this.lastFrameCount = f.frameCount;
      const { rawMin, rawMax } = this.options;
      switch (f.status) {
        case 4: {
          const dead = f.deadPixelMap(rawMin, rawMax);
          this.gains = f.gains(dead, f.average, rawMin, rawMax);
          this.deadMap = dead;
          break;
        }
        case 1: {
          this.frameID1 ??= f;
          if (this.isPro) {
            this.frameID1 = f;
            continue;
          }
          if (this.compactOnPro) {
            // the camera closes the shutter by itself; this frame is the new reference
            this.frameID1 = f;
            if (this.nucState === 1 || this.nucState === 10) this.nucState = 0;
            continue;
          }
          if (
            (this.options.hiFPS && this.isNormalMode) ||
            this.doOpenShutter ||
            this.nucState === 3 ||
            this.nucState === 12
          ) {
            await this.trySendInit(this.options.hiFPS ? SEEK_MODE.fastRaw : SEEK_MODE.raw);
            this.isNormalMode = false;
            this.doOpenShutter = false;
            tries = 30;
            if (this.nucState === 3) this.nucState = 0;
            if (this.nucState === 12) this.nucState = 13;
          } else {
            this.frameID1 = f;
          }
          continue;
        }
        case 6:
          break; // reference frame of the vendor processing, unused
        case 3: {
          this.deadMap ??= f.deadPixelMap(rawMin, rawMax);
          const dead = this.deadMap;
          if (this.compactOnPro) this.doCloseShutter = false; // NUC completes with the next shutter frame (ID 1)
          if (
            this.doCloseShutter ||
            (!this.compactOnPro && (this.nucState === 1 || this.nucState === 10))
          ) {
            this.doCloseShutter = false;
            await this.trySendInit(SEEK_MODE.normal);
            await this.grabFrame(); // the calibration read; the loop takes the next frame
            await this.trySendInit(SEEK_MODE.fastRaw);
            this.isNormalMode = false;
            if (this.nucState === 1 || this.nucState === 10) {
              this.avrFramesLeft = 11;
              this.nucState += 1;
            } else if (!this.options.hiFPS) {
              await this.trySendInit(SEEK_MODE.raw);
            }
            tries = 30;
            continue;
          }
          const frame = f;
          const ref = this.frameID1;
          if (this.nucState !== 0 && ref !== null) {
            if (this.nucState === 11) {
              frame.shutterGainCal(dead, ref.data, this.gains, ref.average);
            }
            if (this.nucState === 2 || this.nucState === 11) {
              ref.average10(dead, frame.data);
              this.avrFramesLeft -= 1;
              if (this.avrFramesLeft > 0) return frame;
              frame.calcMinMax(dead, true);
              frame.removeDeadPixels(dead);
              await this.trySendInit(SEEK_MODE.normal);
              this.nucState += 1; // the Swift also sets tries = 30 here; the frame is returned below, so it has no effect
            }
          }
          if (ref !== null) {
            frame.shutterGainCal(dead, ref.data, this.gains, ref.average);
            frame.calcMinMax(dead, true);
            frame.removeDeadPixels(dead);
            if (this.nucState === 13) {
              const map = frame.offsetMap(dead);
              this.shutterOffsetMapData = map;
              ref.offsetCal(dead, map);
              this.nucState = 0;
              tries = 30;
              continue;
            }
          } else {
            frame.calcMinMax(dead, true);
            frame.removeDeadPixels(dead);
          }
          return frame;
        }
        default:
          if (f.status > 10) await sleep(10);
      }
    }
    this.lastError = 'Timeout while reading frames';
    return null;
  }

  /** The stream thread of the Swift (streamLoop): the first calibration, then one frame per call. */
  private async streamLoop(): Promise<void> {
    try {
      if (this.frameID1 === null) await this.grabVisualFrame(); // the first full processed frame
      if (this.deadMap === null) {
        this.streaming = false;
        this.lastError ??= 'no calibration frames received';
        return;
      }
      while (this.isRunning()) {
        const frame = await this.grabVisualFrame();
        if (frame === null) {
          if (this.lastError !== null && !this.isRunning()) break;
          await sleep(10);
          continue;
        }
        if (this.nucState === 0) this.onFrame?.(frame);
      }
    } catch (error) {
      this.lastError = messageOf(error);
      this.streaming = false;
    }
  }
}
