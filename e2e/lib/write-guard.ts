/**
 * The page-side write guard for runs on REAL WebUSB (the Electron camera run),
 * where no Node bridge sits between the page and the camera.
 *
 * `installWriteGuard` runs IN THE PAGE before any app code (Electron's preload,
 * in the page's own world), so it must be self-contained: its source text is
 * what gets injected. It replaces the `USBDevice.prototype` methods that can put
 * a request on the wire with checking wrappers, defined non-writable and
 * non-configurable so nothing loaded later can swap them back, and it lets
 * through only what the read-only scope needs:
 *
 *   IN   the reads in `readsAllowed` (the dump's and step 02's reads);
 *   OUT  `modeOp` with payload u16 0; `armOp` only once `versionOp` has
 *        answered (nothing but identity reads before the build is known);
 *        `resetOp` with payload u16 0, and only while the test has set
 *        `allowReset` (Preserve step 02, whose probe may reboot a spent reader);
 *        and, for the device-info read only, `infoOps`: the two RAM selectors,
 *        in the shapes core's read sends, and on the Info tab only while
 *        `infoOpen` is set (the test opens it for the Info read and shuts it after).
 *
 * Everything else is refused before it leaves the page — above all the ids in
 * `neverOps` (the flash writes and the flash path's selectors), in either
 * direction — and so are the transfer kinds the app never uses (bulk,
 * isochronous, `reset()`, `clearHalt()`, `selectAlternateInterface()`). Every
 * refusal rejects with a `SecurityError` and is recorded in the control object;
 * the test fails on any. `resetBudget`, when the test sets it, caps how many
 * resets may go out at all (the restart run allows exactly one).
 *
 * THE CAMERA WRITE RUN, and only it (`writeOps`, set by
 * `writeGuardScript({ lifted: true })` once the gate in `supervised-write.ts`
 * has passed), may also send the two flash writes Preserve's steps 03 and 04
 * send: SetFeaturedFirmwareData in chunks of at most `maxStageBytes`, and
 * CompleteMemoryUpgrade with a u16 checksum. Not freely: each phase is opened
 * by the test with the exact budget its expectation row names
 * (`stageBudget` chunks, `commitBudget` commits, and `commitSum16`, the
 * checksum the commit must carry), and both budgets are 0 until it does. A
 * write past them, or of another shape or checksum, is refused unsent like any
 * other — before the camera has erased anything.
 *
 * THE WRITE WINDOW'S VERSION SEED (`seededVersion`). The write run opens steps
 * 03 and 04 in a new window, a fresh page whose guard has seen no version,
 * and Preserve's commit session probes the reader (BeginFirmwareUpgrade mode
 * 3) BEFORE its own version read, so the arm rule above refused that probe
 * unsent on every boot (TESTING.md sec. 40). The run seeds the window's guard
 * with the version its step 02 matched: arming is then judged exactly as in
 * the first window once the camera had answered. The seed is no exception to
 * the rule: every GetFirmwareInfo answer in a seeded window must equal it, and
 * one that does not is refused (withheld from the page), and so is every arm
 * after it.
 *
 * TWO THINGS HERE ARE NOT GUARDS, and neither loosens one:
 *  - `fault`, when the test sets it, answers the next `remaining` vendor IN
 *    requests of exactly `request`/`length` with `status: 'stall'` WITHOUT
 *    sending them — what a dead reader answers on the wire. The restart run
 *    aims it at step 02's reader probe (28-byte reads on 0x4F), so the app's
 *    own probe sees a spent reader and reboots the camera by its own code.
 *  - the camera's comings and goings, `getDevices()` answers and every reset's
 *    outcome are recorded, to measure what the browser does across a reboot.
 */

export interface WriteGuardConfig {
  /** The global the control object is published under. */
  readonly global: string;
  readonly readsAllowed: readonly number[];
  readonly neverOps: readonly number[];
  readonly modeOp: number;
  readonly armOp: number;
  readonly versionOp: number;
  readonly resetOp: number;
  /**
   * The version an earlier window of the same run already read and matched
   * (the write run's step 02), for a window opened after it; null or absent
   * for every other window. See THE WRITE WINDOW'S VERSION SEED above.
   */
  readonly seededVersion?: string | null;
  /**
   * The two RAM selectors the device-info read sends (Read slots, Read firmware version), let out
   * only when set: `firmwareInfo` (SetFirmwareInfoFeatures) with a u16 record selector that is one
   * of `selectors`, `ramData` (SetRamDataFeatures) for the device-id block alone, exactly
   * `serialBlock` (case 0, a 6-byte payload). Neither touches flash — the CLI's `info` sends both —
   * but the dump and step 02 never do, so their runs leave this unset and refuse them like any
   * other id off the whitelist. The shapes are core's (`readFwInfo` and `readSerial` in
   * packages/core/src/protocol/client.ts; TESTING.md 42.68).
   */
  readonly infoOps?: {
    readonly firmwareInfo: number;
    readonly ramData: number;
    readonly selectors: readonly number[];
    readonly serialBlock: readonly number[];
  } | null;
  /**
   * Whether `infoOps` are let out right now: the initial state. The Info tab's window starts shut
   * and the test opens it for the Info read (`setGuard`'s `infoOpen`), so the same window's dump
   * tabs still refuse both selectors. Unset means shut.
   */
  readonly infoOpen?: boolean;
  /**
   * The camera write run's flash writes, let out only when set, and then
   * only inside the phase budgets in the control object: `stage`
   * (SetFeaturedFirmwareData) with 1..`maxStageBytes` bytes, `commit`
   * (CompleteMemoryUpgrade) with a u16 checksum. Every other run leaves it
   * unset and lists both ids in `neverOps`.
   */
  readonly writeOps?: {
    readonly stage: number;
    readonly commit: number;
    readonly maxStageBytes: number;
  } | null;
}

/** A test-only fault: the next `remaining` matching reads answer a stall, unsent. */
export interface InjectedStall {
  readonly request: number;
  readonly length: number;
  remaining: number;
}

/** What the guard publishes for the test (and the Electron main process) to read. */
export interface WriteGuardControl {
  installed: boolean;
  allowReset: boolean;
  /** Whether `infoOps` are let out now (`WriteGuardConfig.infoOpen`; the test sets it). */
  infoOpen: boolean;
  /** How many more resets may go out, or null for no cap (still only while `allowReset`). */
  resetBudget: number | null;
  /** How many more SetFeaturedFirmwareData chunks may go out (`writeOps` only; 0 = none). */
  stageBudget: number;
  /** How many more CompleteMemoryUpgrade requests may go out (`writeOps` only; 0 = none). */
  commitBudget: number;
  /** The checksum the next commit must carry, or null for any (`writeOps` only). */
  commitSum16: number | null;
  /** The last four bytes GetFirmwareInfo answered, as a version: what arming waits for. */
  version: string | null;
  /** The version this window was seeded with (`WriteGuardConfig.seededVersion`), or null. */
  readonly seededVersion: string | null;
  /** The first GetFirmwareInfo answer that disagreed with the seed: arming is refused after it. */
  versionMismatch: string | null;
  /**
   * Every GetFirmwareInfo answer, in order. Not every one is the firmware
   * version: a device-info read selects other records (the bootloader's, the
   * platform's) and their first four bytes land here too. The version read's
   * own rule makes the SECOND answer of a session the build block.
   */
  readonly versionsSeen: string[];
  readonly refusals: string[];
  /** `out 0x52` -> how many went out (injected stalls never went out, so never count). */
  readonly counts: Record<string, number>;
  readonly wrapped: string[];
  fault: InjectedStall | null;
  /** One line per stall the fault answered. */
  readonly injected: string[];
  /** Every reset that went out, and what the wire answered. */
  readonly resets: { at: number; outcome: string }[];
  /** `navigator.usb` connect / disconnect events, as the page received them. */
  readonly usbEvents: { at: number; type: string; product: string | null }[];
  /** Every `navigator.usb.getDevices()` the page made, and how many devices it answered. */
  readonly getDevicesCalls: { at: number; devices: number }[];
}

export function installWriteGuard(config: WriteGuardConfig): void {
  const scope = globalThis as unknown as Record<string, unknown>;
  const control: WriteGuardControl = {
    installed: false,
    allowReset: false,
    infoOpen: config.infoOpen === true,
    resetBudget: null,
    stageBudget: 0,
    commitBudget: 0,
    commitSum16: null,
    version: null,
    seededVersion: config.seededVersion ?? null,
    versionMismatch: null,
    versionsSeen: [],
    refusals: [],
    counts: {},
    wrapped: [],
    fault: null,
    injected: [],
    resets: [],
    usbEvents: [],
    getDevicesCalls: [],
  };
  Object.defineProperty(scope, config.global, {
    value: control,
    writable: false,
    configurable: false,
  });
  const ctor = scope.USBDevice as { prototype: USBDevice } | undefined;
  if (ctor === undefined) {
    control.refusals.push('USBDevice is not defined here — the write guard could not install');
    return;
  }
  const proto = ctor.prototype;

  const hex = (n: number): string => `0x${n.toString(16).padStart(2, '0')}`;
  const refuse = (why: string): never => {
    control.refusals.push(why);
    throw new DOMException(`e2e write guard: ${why}`, 'SecurityError');
  };
  const count = (direction: 'in' | 'out', request: number): void => {
    const key = `${direction} ${hex(request)}`;
    control.counts[key] = (control.counts[key] ?? 0) + 1;
  };
  const bytesOf = (data: BufferSource | undefined): Uint8Array => {
    if (data === undefined) return new Uint8Array(0);
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  };
  const isU16Zero = (bytes: Uint8Array): boolean =>
    bytes.length === 2 && bytes[0] === 0 && bytes[1] === 0;

  const checkOut = (setup: USBControlTransferParameters, bytes: Uint8Array): void => {
    const op = setup.request;
    if (setup.requestType !== 'vendor') {
      refuse(`a ${setup.requestType} OUT request (the app sends vendor requests only)`);
    }
    if (config.neverOps.includes(op)) {
      refuse(`OUT ${hex(op)}: a flash write or a flash-path selector, never on this run`);
    }
    if (op === config.modeOp) {
      if (!isU16Zero(bytes)) refuse('SetOperationMode with a payload other than u16 0');
      return;
    }
    if (op === config.armOp) {
      if (control.versionMismatch !== null) {
        refuse(
          `BeginFirmwareUpgrade after GetFirmwareInfo answered ${control.versionMismatch}, not ` +
            `the seeded ${String(control.seededVersion)}`,
        );
      }
      if ((control.version ?? control.seededVersion) === null)
        refuse('BeginFirmwareUpgrade before the camera reported its version');
      return;
    }
    if (op === config.resetOp) {
      if (!isU16Zero(bytes)) refuse('ResetDevice with a non-zero payload (the TIMER1 arm route)');
      if (!control.allowReset) refuse('ResetDevice outside Preserve step 02');
      if (control.resetBudget !== null) {
        if (control.resetBudget <= 0) refuse("ResetDevice beyond this run's reset budget");
        control.resetBudget -= 1;
      }
      return;
    }
    const write = config.writeOps ?? null;
    if (write !== null && op === write.stage) {
      if (bytes.length === 0 || bytes.length > write.maxStageBytes) {
        refuse(
          `SetFeaturedFirmwareData with ${String(bytes.length)} B (Preserve stages ` +
            `1..${String(write.maxStageBytes)} B)`,
        );
      }
      if (control.stageBudget <= 0) refuse("SetFeaturedFirmwareData beyond this phase's budget");
      control.stageBudget -= 1;
      return;
    }
    if (write !== null && op === write.commit) {
      if (bytes.length !== 2) refuse('CompleteMemoryUpgrade with a payload other than a u16');
      if (control.commitBudget <= 0) refuse("CompleteMemoryUpgrade beyond this phase's budget");
      const sum = (bytes[0] ?? 0) | ((bytes[1] ?? 0) << 8);
      if (control.commitSum16 !== null && sum !== control.commitSum16) {
        refuse(
          `CompleteMemoryUpgrade with checksum ${hex(sum)}, not the plan's ` +
            hex(control.commitSum16),
        );
      }
      control.commitBudget -= 1;
      return;
    }
    const info = config.infoOps ?? null;
    if (info !== null && (op === info.firmwareInfo || op === info.ramData)) {
      if (!control.infoOpen) {
        refuse(`OUT ${hex(op)}: an info selector, let out only for the Info read`);
      }
      if (op === info.firmwareInfo) {
        if (bytes.length !== 2) refuse('SetFirmwareInfoFeatures with a payload other than a u16');
        const selector = (bytes[0] ?? 0) | ((bytes[1] ?? 0) << 8);
        if (!info.selectors.includes(selector)) {
          refuse(
            `SetFirmwareInfoFeatures(${String(selector)}): a selector the Info read does not send`,
          );
        }
        return;
      }
      const sameBlock =
        bytes.length === info.serialBlock.length &&
        info.serialBlock.every((b, i) => bytes[i] === b);
      if (!sameBlock)
        refuse('SetRamDataFeatures other than the device-id block the Info read sends');
      return;
    }
    refuse(`OUT ${hex(op)} is not on this run's whitelist`);
  };

  const checkIn = (setup: USBControlTransferParameters): void => {
    const op = setup.request;
    if (setup.requestType !== 'vendor') {
      refuse(`a ${setup.requestType} IN request (the app sends vendor requests only)`);
    }
    if (config.neverOps.includes(op)) refuse(`IN ${hex(op)}: a write id, never on this run`);
    if (!config.readsAllowed.includes(op)) refuse(`IN ${hex(op)} is not a read this run allows`);
  };

  const original = (name: string): unknown => Object.getOwnPropertyDescriptor(proto, name)?.value;
  const define = (name: string, value: unknown): void => {
    Object.defineProperty(proto, name, {
      value,
      writable: false,
      configurable: false,
      enumerable: true,
    });
    control.wrapped.push(name);
  };

  type OutFn = (
    setup: USBControlTransferParameters,
    data?: BufferSource,
  ) => Promise<USBOutTransferResult>;
  type InFn = (setup: USBControlTransferParameters, length: number) => Promise<USBInTransferResult>;
  const controlOut = original('controlTransferOut') as OutFn;
  const controlIn = original('controlTransferIn') as InFn;

  define(
    'controlTransferOut',
    async function guardedControlTransferOut(
      this: USBDevice,
      setup: USBControlTransferParameters,
      data?: BufferSource,
    ): Promise<USBOutTransferResult> {
      count('out', setup.request);
      checkOut(setup, bytesOf(data));
      if (setup.request !== config.resetOp) return controlOut.call(this, setup, data);
      try {
        const result = await controlOut.call(this, setup, data);
        control.resets.push({ at: Date.now(), outcome: `status ${result.status}` });
        return result;
      } catch (error) {
        const outcome =
          error instanceof DOMException ? `${error.name}: ${error.message}` : String(error);
        control.resets.push({ at: Date.now(), outcome });
        throw error;
      }
    },
  );

  define(
    'controlTransferIn',
    async function guardedControlTransferIn(
      this: USBDevice,
      setup: USBControlTransferParameters,
      length: number,
    ): Promise<USBInTransferResult> {
      checkIn(setup);
      const fault = control.fault;
      if (
        fault !== null &&
        fault.remaining > 0 &&
        setup.request === fault.request &&
        length === fault.length
      ) {
        fault.remaining -= 1;
        control.injected.push(`IN ${hex(setup.request)} x${String(length)} -> stall (injected)`);
        return { status: 'stall', data: undefined } as unknown as USBInTransferResult;
      }
      count('in', setup.request);
      const result = await controlIn.call(this, setup, length);
      const data = result.data;
      if (
        setup.request === config.versionOp &&
        result.status === 'ok' &&
        data !== undefined &&
        data.byteLength >= 4
      ) {
        const answered = [0, 1, 2, 3].map((i) => String(data.getUint8(i))).join('.');
        control.versionsSeen.push(answered);
        const seeded = control.seededVersion;
        if (seeded !== null && answered !== seeded) {
          control.versionMismatch ??= answered;
          refuse(
            `GetFirmwareInfo answered ${answered}, not ${seeded}, the version this run matched ` +
              'before the window opened — not the camera the write was planned on',
          );
        }
        control.version = answered;
      }
      return result;
    },
  );

  for (const name of [
    'transferOut',
    'transferIn',
    'isochronousTransferOut',
    'isochronousTransferIn',
    'reset',
    'clearHalt',
    'selectAlternateInterface',
  ]) {
    define(name, function refused(): Promise<never> {
      try {
        return refuse(`USBDevice.${name}(): the app never calls it, so this run refuses it`);
      } catch (error) {
        return Promise.reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }
  /* Observation only: what the page is told about the camera coming and going. */
  const usb = (navigator as unknown as { usb?: USB }).usb;
  if (usb !== undefined) {
    for (const type of ['connect', 'disconnect']) {
      usb.addEventListener(type, (event) => {
        const device = (event as USBConnectionEvent).device;
        control.usbEvents.push({ at: Date.now(), type, product: device.productName ?? null });
      });
    }
    const usbProto = Object.getPrototypeOf(usb) as USB;
    const getDevices = Object.getOwnPropertyDescriptor(usbProto, 'getDevices')?.value as
      (() => Promise<USBDevice[]>) | undefined;
    if (getDevices !== undefined) {
      Object.defineProperty(usbProto, 'getDevices', {
        value: async function observedGetDevices(this: USB): Promise<USBDevice[]> {
          const devices = await getDevices.call(this);
          control.getDevicesCalls.push({ at: Date.now(), devices: devices.length });
          return devices;
        },
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
  }
  control.installed = true;
}
