/**
 * The REAL camera as a USB bus, through the CLI's host stack (the `usb`
 * package's WebUSB shim and `fromNodeUsb`'s corrections) — and guarded.
 *
 * WHAT IT WILL SEND. A whitelist, checked before every transfer
 * (`UsbBridge` turns a refusal into a SecurityError in the page and a line in
 * `refusals`, which fails the test), and checked AGAIN inside the device
 * wrapper, so a transfer that somehow skipped the first check still never
 * reaches the camera:
 *
 *   IN   0x35 GetErrorCode, 0x3D GetOperationMode, 0x4E GetFirmwareInfo,
 *        0x4F GetFeaturedFirmwareData (the window reader), 0x58 GetFeaturedData
 *        (the 0.7.x reader)
 *   OUT  0x3C SetOperationMode, payload u16 0 only;
 *        0x52 BeginFirmwareUpgrade (arms a read window) — only once the camera
 *        has reported its version on this bus (the toolkit's own rule: nothing
 *        but the identity reads before the build is known; on 0.3.0.1 wire 0x52
 *        is EnterBootloaderMode);
 *        0x59 ResetDevice, payload u16 0 only, and only while `allowReset` is
 *        set — the test sets it for Preserve step 02, whose probe may reboot a
 *        spent reader by command. Dump & decrypt promises no reset at all;
 *        0x55 SetFirmwareInfoFeatures and 0x5A SetRamDataFeatures, the device-info
 *        read's two selectors, only while `infoOpen` is set (the test opens it for
 *        the Info read and shuts it after), and only in the shapes core sends
 *        (`info-read.ts`, the same lists the page-side guard uses).
 *
 * Everything else — above all 0x50 SetFeaturedFirmwareData and 0x51
 * CompleteMemoryUpgrade, the only two requests that change flash — is refused unsent.
 *
 * A reboot is the camera's own: it leaves the bus and re-enumerates, node-usb
 * reports both, and the bridge turns them into what Chrome would show the
 * page.
 *
 * NOT ALWAYS BOTH. Measured 2026-10-06 on a camera whose step 02 reboots it
 * once per window: on the third reboot node-usb reported neither the camera
 * leaving nor the new enumeration arriving, so the bus kept the old device,
 * every open failed "open error: not found by registry id", and the page
 * waited for a `disconnect` that never came. Each enumeration has its own id
 * (`DeviceId(<IORegistry id>)`, node-usb's `handle`), so the bus also polls
 * `getDevices()` — a registry query, no transfer — once a second and
 * reconciles: a held device whose id is gone has left, and a camera the bus
 * does not hold has arrived. The events, when they come, are matched by id
 * too, so a late event for an older enumeration cannot unseat a newer one.
 */

import { fromNodeUsb, type NodeUsbDevice } from '../../packages/cli/src/node-usb.js';
import { OP, SEEK_VENDOR_ID } from '../../packages/core/src/protocol/ops.js';
import { RESET_OP } from '../../packages/core/src/preservation/pipeline.js';
import type {
  WebUsbControlSetup,
  WebUsbDevice,
  WebUsbInTransferResult,
  WebUsbOutTransferResult,
} from '../../packages/core/src/protocol/webusb.js';
import type { BusChange, BusDevice, UsbBus, Verdict } from './bridge.js';
import { INFO_FIRMWARE_INFO_OP, INFO_RAM_DATA_OP, infoShapeRefusal } from './info-read.js';
import type { ControlSetup } from './protocol.js';

const ALLOWED_IN: ReadonlySet<number> = new Set([
  OP.GET_ERROR_CODE,
  OP.GET_OPERATION_MODE,
  OP.GET_FIRMWARE_INFO,
  OP.GET_FEATURED_FIRMWARE_DATA,
  OP.GET_FEATURED_DATA,
]);

/** The two requests that change the camera's flash. Never, whatever else changes. */
export const FLASH_WRITE_OPS: readonly number[] = [
  OP.SET_FEATURED_FIRMWARE_DATA,
  OP.COMPLETE_MEMORY_UPGRADE,
];

/**
 * What the page itself refuses on this target, before Node sees it. The page's stand-in refuses by
 * request id alone, with no window, so it cannot let the Info read's two selectors out for one read.
 * Those two are gated on the bus instead (`infoOpen`, `info-read.ts`'s shapes), so they are not here.
 */
export const PAGE_REFUSED_OUT: readonly number[] = [
  OP.SET_FEATURED_FIRMWARE_DATA,
  OP.COMPLETE_MEMORY_UPGRADE,
];

const hexOp = (op: number): string => `0x${op.toString(16).padStart(2, '0')}`;

function isU16Zero(data: Uint8Array | null): boolean {
  return data !== null && data.length === 2 && data[0] === 0 && data[1] === 0;
}

/**
 * A field of a device node-usb may refuse to read: while a transfer on the same
 * native object is still pending (the reset that is taking the camera off the
 * bus), a read throws "The same native value cannot be borrowed mutably while
 * another borrow is active" — measured 2026-10-06, from inside a `disconnect`
 * handler, where a throw is an uncaught exception. Null when it refused.
 */
function readable<T>(read: () => T): T | null {
  try {
    return read();
  } catch {
    return null;
  }
}

/** node-usb's id for one enumeration (`DeviceId(<IORegistry id>)`), or null when it has none. */
function enumerationOf(device: NodeUsbDevice): string | null {
  const handle = readable(() => (device as unknown as { readonly handle?: unknown }).handle);
  return typeof handle === 'string' ? handle : null;
}

/** The enumeration the bus holds: its id is taken once, at adoption, never read again. */
interface Held {
  readonly bus: BusDevice;
  readonly raw: NodeUsbDevice;
  readonly id: string | null;
}

/** Whether a device object is the held enumeration: node-usb hands out new objects. */
function isHeld(device: NodeUsbDevice, held: Held): boolean {
  const id = enumerationOf(device);
  return id !== null && held.id !== null ? id === held.id : device === held.raw;
}

/** How often the bus checks the registry for an enumeration the events missed. */
const POLL_MS = 1000;

export class CameraBus implements UsbBus {
  readonly name = 'real camera (node-usb)';
  /** nusb needs a timeout; this is above every deadline the read paths set (20 s). */
  readonly hostTimeoutMs = 25_000;
  /** Set by the test for Preserve step 02 only. */
  allowReset = false;
  /**
   * Set by the test around the Info read's click, and shut after it: the two device-info selectors
   * (0x55, 0x5A) go out only while it is open, and only in the shapes `info-read.ts` names.
   */
  infoOpen = false;
  /** The version the camera reported, once it has. */
  version: string | null = null;
  /** Every transfer the inner wrapper had to stop (a passing run has none). */
  readonly innerRefusals: string[] = [];
  private readonly log: (line: string) => void;
  private readonly listeners = new Set<(change: BusChange) => void>();
  private readonly webusb: EventTarget & { getDevices: () => Promise<NodeUsbDevice[]> };
  private current: Held | null = null;
  private enumerations = 0;
  private poll: ReturnType<typeof setInterval> | null = null;
  private polling = false;

  private constructor(
    webusb: EventTarget & { getDevices: () => Promise<NodeUsbDevice[]> },
    log: (line: string) => void,
  ) {
    this.webusb = webusb;
    this.log = log;
  }

  static async open(log: (line: string) => void): Promise<CameraBus> {
    const { WebUSB } = await import('usb');
    const webusb = new WebUSB({ allowAllDevices: true }) as unknown as EventTarget & {
      getDevices: () => Promise<NodeUsbDevice[]>;
    };
    return CameraBus.over(webusb, log);
  }

  /** The bus over any WebUSB-shaped host stack: node-usb's in a run, a fake in a test. */
  static async over(
    webusb: EventTarget & { getDevices: () => Promise<NodeUsbDevice[]> },
    log: (line: string) => void,
  ): Promise<CameraBus> {
    const bus = new CameraBus(webusb, log);
    const cameras = (await webusb.getDevices()).filter((d) => d.vendorId === SEEK_VENDOR_ID);
    if (cameras.length !== 1) {
      throw new Error(`expected exactly one Seek camera, found ${String(cameras.length)}`);
    }
    const [camera] = cameras;
    if (camera !== undefined) bus.adopt(camera);
    webusb.addEventListener('connect', bus.onConnect);
    webusb.addEventListener('disconnect', bus.onDisconnect);
    bus.poll = setInterval(() => {
      void bus.reconcile();
    }, POLL_MS);
    return bus;
  }

  private readonly onConnect = (event: Event): void => {
    const device = (event as unknown as { device: NodeUsbDevice }).device;
    const vendor = readable(() => device.vendorId);
    if (vendor === null) {
      this.log(
        '[camera] a connect event whose device could not be read — the registry poll settles it',
      );
      void this.reconcile();
      return;
    }
    if (vendor !== SEEK_VENDOR_ID) return;
    const held = this.current;
    if (held !== null && isHeld(device, held)) return;
    /* A new enumeration while the bus still holds an older one: that one's
     * disconnect was missed or is late. It has left either way. */
    if (held !== null) this.leave(held, 'its disconnect never came; a new enumeration did');
    this.log('[camera] a Seek camera arrived on the bus');
    this.adopt(device);
  };

  private readonly onDisconnect = (event: Event): void => {
    const device = (event as unknown as { device: NodeUsbDevice }).device;
    const held = this.current;
    if (held === null) return;
    const vendor = readable(() => device.vendorId);
    if (vendor === null) {
      this.log(
        '[camera] a disconnect event whose device could not be read — the registry poll settles it',
      );
      void this.reconcile();
      return;
    }
    /* A late disconnect for an enumeration already replaced is not this one's. */
    if (vendor !== SEEK_VENDOR_ID || !isHeld(device, held)) return;
    this.leave(held, null);
  };

  /** The held enumeration is gone: tell the bridge, once. */
  private leave(held: { readonly bus: BusDevice }, why: string | null): void {
    if (this.current?.bus.key !== held.bus.key) return;
    this.current = null;
    this.log(`[camera] the camera left the bus${why === null ? '' : ` (${why})`}`);
    this.emit({ kind: 'detach', device: held.bus });
  }

  /** The registry's answer, for whatever the hotplug events missed (see the file comment). */
  private async reconcile(): Promise<void> {
    if (this.polling) return;
    this.polling = true;
    try {
      const cameras = (await this.webusb.getDevices()).filter((d) => d.vendorId === SEEK_VENDOR_ID);
      const held = this.current;
      if (held !== null && !cameras.some((d) => isHeld(d, held))) {
        this.leave(held, 'no event; the registry no longer lists it');
      }
      const [only] = cameras;
      if (this.current === null && cameras.length === 1 && only !== undefined) {
        this.log('[camera] a Seek camera arrived on the bus (no event; the registry lists it)');
        this.adopt(only);
      }
    } catch {
      /* the next poll asks again */
    } finally {
      this.polling = false;
    }
  }

  present(): readonly BusDevice[] {
    return this.current === null ? [] : [this.current.bus];
  }

  subscribe(listener: (change: BusChange) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(change: BusChange): void {
    for (const listener of [...this.listeners]) listener(change);
  }

  private adopt(raw: NodeUsbDevice): void {
    const device = this.guarded(fromNodeUsb(raw));
    const bus: BusDevice = {
      key: `cam-${String(this.enumerations++)}`,
      device,
      vendorId: device.vendorId,
      productId: device.productId,
      productName: device.productName,
      manufacturerName: device.manufacturerName,
      serialNumber: device.serialNumber,
    };
    this.current = { bus, raw, id: enumerationOf(raw) };
    this.log(
      `[camera] ${bus.key}: ${bus.productName ?? '?'} ${hexOp(bus.vendorId)}:${hexOp(bus.productId)}, ` +
        `serial ${bus.serialNumber ?? 'none'}`,
    );
    this.emit({ kind: 'attach', device: bus });
  }

  /** The whitelist. Null when the transfer may go out. */
  private refusal(
    direction: 'in' | 'out',
    request: number,
    data: Uint8Array | null,
  ): string | null {
    if (direction === 'in') {
      return ALLOWED_IN.has(request) ? null : `IN ${hexOp(request)} is not a read this run allows`;
    }
    if (FLASH_WRITE_OPS.includes(request)) {
      return `OUT ${hexOp(request)} changes flash — never on the real camera`;
    }
    if (request === OP.SET_OPERATION_MODE) {
      return isU16Zero(data) ? null : 'SetOperationMode with a payload other than u16 0';
    }
    if (request === OP.BEGIN_FIRMWARE_UPGRADE) {
      return this.version === null
        ? 'BeginFirmwareUpgrade before the camera reported its version'
        : null;
    }
    if (request === RESET_OP) {
      if (!isU16Zero(data)) return 'ResetDevice with a non-zero payload (the TIMER1 arm route)';
      return this.allowReset ? null : 'ResetDevice outside Preserve step 02';
    }
    if (request === INFO_FIRMWARE_INFO_OP || request === INFO_RAM_DATA_OP) {
      if (!this.infoOpen) {
        return `OUT ${hexOp(request)}: a device-info selector, let out only during an Info read`;
      }
      return infoShapeRefusal(request, data ?? new Uint8Array(0));
    }
    return `OUT ${hexOp(request)} is not on this run's whitelist`;
  }

  check(
    _device: BusDevice,
    direction: 'in' | 'out',
    setup: ControlSetup,
    data: Uint8Array | null,
  ): Verdict {
    const why = this.refusal(direction, setup.request, data);
    return why === null ? { kind: 'forward' } : { kind: 'refuse', why };
  }

  /** The second line: the same whitelist inside the device itself, and the version read noted. */
  private guarded(inner: WebUsbDevice): WebUsbDevice {
    const stop = (why: string): never => {
      this.innerRefusals.push(why);
      throw new DOMException(`e2e guard (inner): ${why}`, 'SecurityError');
    };
    return {
      get vendorId() {
        return inner.vendorId;
      },
      get productId() {
        return inner.productId;
      },
      get manufacturerName() {
        return inner.manufacturerName;
      },
      get productName() {
        return inner.productName;
      },
      get serialNumber() {
        return inner.serialNumber;
      },
      get configuration() {
        return inner.configuration;
      },
      get opened() {
        return inner.opened;
      },
      open: () => inner.open(),
      close: () => inner.close(),
      selectConfiguration: (value) => inner.selectConfiguration(value),
      claimInterface: (n) => inner.claimInterface(n),
      releaseInterface: (n) => inner.releaseInterface(n),
      controlTransferIn: async (
        setup: WebUsbControlSetup,
        length: number,
        timeoutMs: number,
      ): Promise<WebUsbInTransferResult> => {
        const why = this.refusal('in', setup.request, null);
        if (why !== null) stop(why);
        const result = await inner.controlTransferIn(setup, length, timeoutMs);
        const data = result.data;
        if (
          setup.request === OP.GET_FIRMWARE_INFO &&
          result.status === 'ok' &&
          data !== undefined &&
          data.byteLength >= 4
        ) {
          const v = `${String(data.getUint8(0))}.${String(data.getUint8(1))}.${String(
            data.getUint8(2),
          )}.${String(data.getUint8(3))}`;
          if (this.version !== v) this.log(`[camera] the camera reports firmware ${v}`);
          this.version = v;
        }
        return result;
      },
      controlTransferOut: (
        setup: WebUsbControlSetup,
        data: ArrayBufferView,
        timeoutMs: number,
      ): Promise<WebUsbOutTransferResult> => {
        const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        const why = this.refusal('out', setup.request, bytes);
        if (why !== null) stop(why);
        return inner.controlTransferOut(setup, data, timeoutMs);
      },
    };
  }

  /** Closes the handle (if the page left it open) and stops listening. */
  async close(): Promise<void> {
    if (this.poll !== null) clearInterval(this.poll);
    this.poll = null;
    this.webusb.removeEventListener('connect', this.onConnect);
    this.webusb.removeEventListener('disconnect', this.onDisconnect);
    const held = this.current;
    if (held?.bus.device.opened === true) {
      await held.bus.device.close().catch(() => undefined);
    }
    this.current = null;
  }
}
