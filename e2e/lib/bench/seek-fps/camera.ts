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
 *   IN   0x36 GetChipID (12 bytes: the chip ID, its own field on the info line)
 *        0x4E GetFirmwareInfo (4 or 8 bytes; 8 at connect, 4 before each init)
 *        0x35 GetErrorCode, and 0x4F GetFeaturedFirmwareData (0x58 on 0.7.x), for the ASCII serial
 *   OUT  0x5A SetRamDataFeatures (case 0, the device-id block), once at connect, before the first init
 *        0x37 "Startup with Operation=0" (classic init, option on)
 *        0x3C SetOperationMode: 1 starts the stream, 0 stops it (three times at disconnect)
 *        0x3E SetImageProcessingMode: the mode, 8 Normal, 3 Hi FPS / FastRaw, 0 Raw
 *        0x53 ImageData: one frame credit (the bulk length)
 *        0x54, 0x55, 0x56 the rest of the init sequences (classic and Pro)
 * Nothing else is ever sent. REQUESTS below names them; the camera spec checks the list.
 * ==================================================================== */

import { USB_TIMEOUT_MS, OP } from '../../../../packages/core/src/protocol/ops.js';
import { SeekDevice } from '../../../../packages/core/src/protocol/client.js';
import type { UsbTransport } from '../../../../packages/core/src/protocol/transport.js';
import { legacyReaderOp } from '../../../../packages/core/src/profiles/legacy-auth.js';
import { SeekError } from '../../../../packages/core/src/errors.js';
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
  GET_ERROR_CODE: OP.GET_ERROR_CODE,
  /** The window reader on 0.8 and later builds; the 0.7.x builds read the window through GET_FEATURED_DATA (0x58). */
  GET_FEATURED_FIRMWARE_DATA: OP.GET_FEATURED_FIRMWARE_DATA,
  GET_FEATURED_DATA: OP.GET_FEATURED_DATA,
  SET_RAM_DATA_FEATURES: OP.SET_RAM_DATA_FEATURES,
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
  REQUESTS.GET_ERROR_CODE,
  REQUESTS.GET_FEATURED_FIRMWARE_DATA,
  REQUESTS.GET_FEATURED_DATA,
];
export const CHECKER_REQUESTS_OUT: readonly number[] = [
  REQUESTS.SET_RAM_DATA_FEATURES,
  REQUESTS.OP_ZERO,
  REQUESTS.SET_OPERATION_MODE,
  REQUESTS.SET_IMAGE_PROCESSING_MODE,
  REQUESTS.IMAGE_DATA,
  REQUESTS.INIT_54,
  REQUESTS.INIT_55,
  REQUESTS.INIT_56,
];

/**
 * The processing modes: Normal, FastRaw (Hi FPS) and Raw are the panel's. `mode4` is IP mode 4, one capture per
 * published frame (FW-V1 docs/FRAME_RATE_MODES.md). Its frames can carry no header type on a camera (status 0),
 * so the checker counts them as pictures in that mode (TESTING.md 42.55).
 */
export const SEEK_MODE = { raw: 0, fastRaw: 3, normal: 8, mode4: 4 } as const;
export type SeekMode = (typeof SEEK_MODE)[keyof typeof SEEK_MODE];

/** The processing mode before any init was sent. */
const NO_INIT_MODE = 255;

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
  /** The ASCII device serial (core's `readSerial`, the CLI's and the page's), or '-' when it could not be read. */
  readonly serial: string;
  /** The GetChipID value as hex, or '-' when it could not be read. Not the serial (TESTING.md 42.37). */
  readonly chipId: string;
  readonly model: string;
  readonly width: number;
  readonly height: number;
}

/** Firmware-info reads at connect: up to this many, until byte 0 is non-zero (Swift connect). */
export const FIRMWARE_INFO_READS = 26;
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

/** The highest major version a Seek build reports. An unlocked camera's window bytes read as 184 (TESTING.md 42.41). */
export const MAX_PLAUSIBLE_MAJOR = 9;

/**
 * How the trusted read ended. 'trusted': the version is usable. 'untrusted': replies came, but none was agreed on,
 * or the major was not a Seek build (the unlock case). 'no-answer': no read got a reply (each one failed, stalled or
 * timed out), so the camera is off the bus or still powering up (TESTING.md 42.58).
 */
export type FirmwareReadOutcome = 'trusted' | 'untrusted' | 'no-answer';

/** What `readTrustedFirmware` decided, and what it saw. */
export interface TrustedFirmware {
  /** `major.minor.patch.build` from two consecutive replies that agree, or null when none is trusted. */
  readonly version: string | null;
  readonly outcome: FirmwareReadOutcome;
  /** One sentence for the user: what the camera answered and what the checker made of it. */
  readonly note: string;
}

/**
 * The version the init is chosen from. GetFirmwareInfo (8 bytes) is asked until two consecutive replies agree on
 * bytes 0 to 3 and the major is 0 to 9. A leftover reply that the next one does not repeat is passed over, and an
 * unlocked camera's window reply (major 184) is refused. A failed read (a stall, a timeout, a transfer error) is no
 * reply, and a build still starting refuses GetFirmwareInfo for a few milliseconds, so the reads go on for
 * `FIRMWARE_INFO_READS` (26 reads, about 500 ms, the window core's `readRunningFirmware` allows; TESTING.md 42.55).
 * When no read gets a reply at all, the outcome is 'no-answer', which is not the unlock case (TESTING.md 42.58).
 *
 * Core's `readRunningFirmware` is not used: it takes the second reply without asking that the two agree, and it
 * reads 36 bytes, where the checker has always read 8 (the Swift connect).
 */
export async function readTrustedFirmware(
  transport: UsbTransport,
  gapMs: number = FIRMWARE_INFO_GAP_MS,
): Promise<TrustedFirmware> {
  let previous: string | null = null;
  const seen: string[] = [];
  let replies = 0;
  for (let attempt = 0; attempt < FIRMWARE_INFO_READS; attempt++) {
    let reply: Uint8Array;
    try {
      reply = await transport.controlIn(REQUESTS.GET_FIRMWARE_INFO, 8, USB_TIMEOUT_MS);
    } catch (error) {
      seen.push(readFailureLabel(error));
      previous = null;
      await sleep(gapMs);
      continue;
    }
    if (reply.length < 4) {
      seen.push(reply.length === 0 ? 'empty reply' : 'short reply');
      previous = null;
      await sleep(gapMs);
      continue;
    }
    replies += 1;
    const version = Array.from(reply.subarray(0, 4)).join('.');
    seen.push(version);
    if (version === previous) {
      const major = reply[0] ?? 0;
      if (major <= MAX_PLAUSIBLE_MAJOR) {
        return {
          version,
          outcome: 'trusted',
          note: `GetFirmwareInfo answered ${version} twice in a row`,
        };
      }
      return {
        version: null,
        outcome: 'untrusted',
        note:
          `GetFirmwareInfo answered ${version} twice in a row, and major ${String(major)} is not ` +
          'a Seek build (the window bytes of an unlocked camera read this way)',
      };
    }
    previous = version;
    await sleep(gapMs);
  }
  if (replies === 0) {
    return {
      version: null,
      outcome: 'no-answer',
      note:
        `GetFirmwareInfo gave no reply in ${String(FIRMWARE_INFO_READS)} reads ` +
        `(${tally(seen)})`,
    };
  }
  return {
    version: null,
    outcome: 'untrusted',
    note:
      `GetFirmwareInfo gave no two consecutive replies that agree in ${String(FIRMWARE_INFO_READS)} ` +
      `reads (${seen.join(', ')})`,
  };
}

/** What a failed control read was, in the words the checker prints. */
function readFailureLabel(error: unknown): string {
  if (error instanceof SeekError) {
    if (error.code === 'usb/stalled') return 'stalled';
    if (error.code === 'usb/timeout') return 'timed out';
    if (error.code === 'usb/not-open') return 'not open';
  }
  return 'transfer failed';
}

/** "transfer failed x26" for a list of labels, in the order each label first appears. */
function tally(labels: readonly string[]): string {
  const counts = new Map<string, number>();
  for (const label of labels) counts.set(label, (counts.get(label) ?? 0) + 1);
  return [...counts].map(([label, n]) => `${label} x${String(n)}`).join(', ');
}

/** Whether the camera refused a request (a STALL), as opposed to a failure for another reason. */
export function isRefusal(error: unknown): boolean {
  return error instanceof SeekError && error.code === 'usb/stalled';
}

/** The connect's message when the camera answered no GetFirmwareInfo read: it is off the bus, or still starting. */
export function noAnswerMessage(detail: string): string {
  return (
    `the camera did not answer: ${detail}. No init was sent. The camera may be off the bus or still ` +
    'powering up: wait for it to come back after a power cycle, then run again.'
  );
}

/** The connect's message when the replies cannot be trusted (a Compact's init depends on the version). */
export function untrustedFirmwareMessage(note: string): string {
  return (
    `the camera's firmware reply cannot be trusted, so no init is chosen from it (${note}). ` +
    'A camera unlocked by a slots command answers this way: the CLI info, dump and slots commands send ' +
    'the unlock token, and the camera stays unlocked until a power cycle. Power-cycle the camera and run again.'
  );
}

/** The connect's message when the camera refuses one of its init requests. */
export function refusedInitMessage(detail: string): string {
  return (
    `the camera refused an init request (${detail}). A camera unlocked by a slots command refuses the init ` +
    'until a power cycle: the CLI info, dump and slots commands send the unlock token, and the camera stays ' +
    'unlocked until a power cycle. Power-cycle the camera and run again.'
  );
}

/** The chip ID as hex: every other byte of the GetChipID reply (Swift connect's `serialHex`); '' when empty. */
export function chipIdHex(id: Uint8Array): string {
  let out = '';
  for (let k = 0; k < id.length; k += 2)
    out += (id[k] ?? 0).toString(16).toUpperCase().padStart(2, '0');
  return out;
}

/**
 * The ASCII device serial, read the way core's `SeekDevice.readSerial` reads it (TESTING.md 42.37): SetRamDataFeatures
 * case 0 arms the device-id block, and the window reader serves its first 248 bytes. The serial is the twelve bytes at
 * +16. Core does the reading (its error check, its retries); the only choice here is the window reader for the build,
 * which core's preservation pipeline makes the same way. Nil when it cannot be read or the block has no serial in it.
 */
export async function readDeviceSerial(
  transport: UsbTransport,
  version: string | null,
): Promise<string | null> {
  const device = new SeekDevice(transport);
  device.windowReadOp = legacyReaderOp(version);
  const serial = await device.readSerial();
  return serial === null || serial === '' ? null : serial;
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
  processingMode = NO_INIT_MODE;
  lastStatus = 0;
  lastDeviceTemp = 0;
  lastFrameCount = 0;
  /**
   * Frames whose header status (byte 20, the type word) is 0. On mode 4 they are pictures and are published; in
   * the other modes they are dropped. Counted in both, so a run says how many there were (TESTING.md 42.55).
   */
  untypedFrames = 0;
  /**
   * The camera refused `Startup with Operation=0` (0x37) at connect, and the connect went on without it. Such a
   * build leaves the camera in operation 1 after an init, so a later init stops it first (see `sendInit`).
   */
  startupOpZeroRefused = false;
  /**
   * The last init the stream sent that the camera refused (a STALL), and the mode it asked for. The stream goes on
   * without it, so a stream that then publishes no frame can say why (TESTING.md 42.58). Null when none was refused.
   */
  initRefusal: { readonly mode: number; readonly detail: string } | null = null;
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
    this.untypedFrames = 0;
    this.startupOpZeroRefused = false;
    this.initRefusal = null;

    let firmware: TrustedFirmware;
    let deviceSerial: string | null;
    try {
      firmware = await readTrustedFirmware(this.link.transport);
      /* No read got a reply: the camera is off the bus or still starting, and no init is sent to it (TESTING.md 42.58). */
      if (firmware.outcome === 'no-answer') {
        throw new Error(noAnswerMessage(firmware.note));
      }
      /* A Pro's init does not depend on the version, so it connects with the firmware unnamed. A Compact's does,
       * so a reply that is not trusted stops the connect before anything is sent. */
      if (firmware.version === null && !this.isPro) {
        throw new Error(untrustedFirmwareMessage(firmware.note));
      }
      this.compactOnPro = usesCompactProInit(
        this.isPro,
        this.options.compactProInit,
        firmware.version === null ? null : Number(firmware.version.split('.')[0]),
      );
      /* The serial is read before the first init, in the state the CLI's `info` reads it in: no init has been
       * sent, so the camera is as it booted (TESTING.md 42.61). */
      deviceSerial = await readDeviceSerial(this.link.transport, firmware.version);
      try {
        await this.sendInit(SEEK_MODE.normal);
      } catch (error) {
        if (isRefusal(error)) {
          throw new Error(refusedInitMessage(messageOf(error)), { cause: error });
        }
        throw error;
      }
    } catch (error) {
      await this.link.close();
      throw error;
    }
    const chipId = chipIdHex(await this.inBytes(REQUESTS.GET_CHIP_ID, 12));
    const model = this.isPro
      ? 'Seek Thermal Pro'
      : this.compactOnPro
        ? 'Seek Compact / Compact XR (Pro init)'
        : 'Seek Compact';
    /* The USB string is not used: on 1.3.0.0 it is absent, and the serial is the device's own (core's readSerial). */
    this.info = {
      firmware: firmware.version ?? '-',
      serial: deviceSerial ?? '-',
      chipId: chipId === '' ? '-' : chipId,
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
  /** Whether the classic init sends Startup with Operation=0: the option is on and the build has not refused it. */
  private startupOpZeroUsable(): boolean {
    return this.options.startupOpZero && !this.startupOpZeroRefused;
  }

  private async sendInit(requested: number): Promise<void> {
    let mode: number = requested;
    /* The stop before an init: a stream is stopped first (Swift sendInit). A classic build that takes no
     * Startup with Operation=0 is left in operation 1 by its last init, and its 0x56 is refused there
     * (RPC_MODE0_IDLE, TESTING.md 42.53). So it is stopped first on every later init, streaming or not. */
    const leftInRun =
      this.processingMode !== NO_INIT_MODE &&
      !this.isPro &&
      !this.compactOnPro &&
      !this.startupOpZeroUsable();
    if (this.streaming || leftInRun) {
      for (let k = 0; k < 3; k++) await this.controlOut(REQUESTS.SET_OPERATION_MODE, [0, 0]);
    }
    await this.controlIn(REQUESTS.GET_FIRMWARE_INFO, 4); // the read the Swift makes before each init
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
    if (this.startupOpZeroUsable()) {
      try {
        await this.controlOut(REQUESTS.OP_ZERO, [1, 0, 0, 0]);
        await this.controlOut(REQUESTS.SET_OPERATION_MODE, [0x00, 0x00]);
      } catch (error) {
        /* The 1.3.0.8 family refuses Startup with Operation=0 on a clean boot (TESTING.md 42.41, 42.53): the
         * connect goes on without it, and a later init stops the camera first (above). */
        if (!isRefusal(error)) throw error;
        this.startupOpZeroRefused = true;
      }
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

  /**
   * Swift `try? sendInit`: a failed init during the loop is ignored, as the panel ignores it. A refusal is kept in
   * `initRefusal`, so a stream that publishes nothing after it can say which init the camera refused (TESTING.md 42.58).
   */
  private async trySendInit(mode: number): Promise<void> {
    try {
      await this.sendInit(mode);
    } catch (error) {
      /* ignored on purpose, as in the Swift */
      if (isRefusal(error)) this.initRefusal = { mode, detail: messageOf(error) };
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
    const frame = new SeekFrame(
      bytes,
      this.width,
      this.height,
      this.options.rawMin,
      this.options.rawMax,
    );
    if (frame.status === 0) this.untypedFrames += 1;
    return frame;
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
      /* Mode 4's frames are pictures, whatever their header says: the camera's publish gate skips the header type
       * for that mode (FW-V1 FRAME_RATE_MODES.md), so a status 0 there is an image (TESTING.md 42.55). */
      const status = f.status === 0 && this.processingMode === SEEK_MODE.mode4 ? 3 : f.status;
      switch (status) {
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
