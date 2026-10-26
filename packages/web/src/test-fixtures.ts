/**
 * Fixtures the rendering tests need and the hooks do not: a camera that
 * answers every read, and the `DeviceState` core builds out of it. Shared so
 * the a11y and safety-copy tests exercise the *real* shapes rather than a
 * hand-drawn approximation of them.
 */

import {
  OLD_FW_UNLOCK_TOKEN,
  OP,
  SeekDevice,
  WebUsbTransport,
  getProfile,
  readDeviceInfo,
  type BankKey,
  type DeviceState,
  type PreserveBankRecord,
  type PreserveBootFacts,
  type PreservePatchSummary,
  type PreserveRunState,
  type Reporter,
  type WebUsbDevice,
  type WebUsbInTransferResult,
  type WorkflowContext,
} from '@seek-fw/core';

export const SILENT_REPORTER: Reporter = {
  log: () => undefined,
  progress: () => undefined,
  artifact: () => undefined,
};

/**
 * A camera that answers every read with 0xA5. No slot carries an image
 * header, so the analysis refuses every bank write (`bankWriteRefusals`) —
 * which is the correct answer for this fake, and leaves every slot row
 * rendering its "not readable" branch.
 */
export function fakeCamera(): WebUsbDevice {
  let opened = false;
  return {
    vendorId: 0x289d,
    productId: 0x0011,
    manufacturerName: 'Seek Thermal',
    productName: 'Fake PIR324',
    serialNumber: '0E1CA0Z16D19',
    configuration: { configurationValue: 1 },
    get opened(): boolean {
      return opened;
    },
    open: () => {
      opened = true;
      return Promise.resolve();
    },
    close: () => {
      opened = false;
      return Promise.resolve();
    },
    selectConfiguration: () => Promise.resolve(),
    claimInterface: () => Promise.resolve(),
    releaseInterface: () => Promise.resolve(),
    controlTransferIn: (setup, length) => {
      if (setup.request === OP.GET_ERROR_CODE) {
        return Promise.resolve({ status: 'ok', data: new DataView(new ArrayBuffer(4)) });
      }
      if (setup.request === OP.GET_OPERATION_MODE) {
        return Promise.resolve({ status: 'ok', data: new DataView(new ArrayBuffer(2)) });
      }
      const block = new Uint8Array(length).fill(0xa5);
      return Promise.resolve({ status: 'ok', data: new DataView(block.buffer) });
    },
    controlTransferOut: () => Promise.resolve({ status: 'ok', bytesWritten: 2 }),
  };
}

/** A real `DeviceState`, built by core's own analysis of the fake camera. */
export async function fakeDeviceState(): Promise<DeviceState> {
  const transport = new WebUsbTransport(fakeCamera(), { recipient: 'interface' });
  await transport.open();
  const ctx: WorkflowContext = {
    device: new SeekDevice(transport, { reporter: SILENT_REPORTER }),
    profile: getProfile('modern-4x'),
    detection: null,
    reporter: SILENT_REPORTER,
  };
  return readDeviceInfo(ctx);
}

/* ---- a camera that answers the way a given firmware line does ---------- */

/** One vendor request as the camera saw it. */
export interface CameraCall {
  readonly dir: 'in' | 'out';
  readonly request: number;
  readonly length: number;
  readonly data: Uint8Array | null;
}

export interface ScriptedCameraOptions {
  /**
   * The four version bytes GetFirmwareInfo answers with — or null for a camera
   * that never answers it (every GetFirmwareInfo stalls), which is what the
   * emulated Compact 0.5.1.0 and 0.5.1.3 do after enumerating.
   */
  readonly version: readonly [number, number, number, number] | null;
  /**
   * The locked 2014-2017 line: a plain 2-byte arm of banks 2..9 is refused
   * (the handler's `(mode - 2) <= 7` lock), and the 18-byte arm is accepted
   * only with the firmware's token. Off: the post-2018 handler, which arms
   * every bank on either form.
   */
  readonly legacy?: boolean;
  /**
   * What some subcommands' windows hold, read back in order from the arm.
   * Every other window reads as 0xA5, as before.
   */
  readonly windows?: ReadonlyMap<number, Uint8Array>;
}

export interface ScriptedCamera {
  readonly camera: WebUsbDevice;
  /** Every vendor request, in order. */
  readonly calls: CameraCall[];
}

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * A camera that answers like one firmware line: its version, its channel lock
 * and its token check. Every window reads back as 0xA5 unless `windows` says
 * otherwise, so by default no image is found and the decrypt stage stays out
 * of the way. A refusal is a STALL, as it is on the wire: the dispatcher
 * stalls a control request whose handler returns an error status.
 */
export function scriptedCamera(options: ScriptedCameraOptions): ScriptedCamera {
  const calls: CameraCall[] = [];
  let opened = false;
  let armed = false;
  /* The armed window's own bytes and the read cursor into them, when scripted. */
  let window: Uint8Array | null = null;
  let cursor = 0;
  const ok = (bytes: Uint8Array): Promise<WebUsbInTransferResult> =>
    Promise.resolve({
      status: 'ok',
      data: new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
    });
  const stall = (): Promise<WebUsbInTransferResult> =>
    Promise.resolve({ status: 'stall', data: new DataView(new ArrayBuffer(0)) });

  const camera: WebUsbDevice = {
    vendorId: 0x289d,
    productId: options.legacy === true ? 0x0010 : 0x0011,
    manufacturerName: 'Seek Thermal',
    productName: options.legacy === true ? 'PIR206 Thermal Camera' : 'Fake PIR324',
    serialNumber: null,
    configuration: { configurationValue: 1 },
    get opened(): boolean {
      return opened;
    },
    open: () => {
      opened = true;
      return Promise.resolve();
    },
    close: () => {
      opened = false;
      return Promise.resolve();
    },
    selectConfiguration: () => Promise.resolve(),
    claimInterface: () => Promise.resolve(),
    releaseInterface: () => Promise.resolve(),
    controlTransferIn: (setup, length) => {
      calls.push({ dir: 'in', request: setup.request, length, data: null });
      switch (setup.request) {
        case OP.GET_ERROR_CODE:
          return ok(new Uint8Array(4));
        case OP.GET_OPERATION_MODE:
          return ok(new Uint8Array(2));
        case OP.GET_FIRMWARE_INFO: {
          if (options.version === null) return stall();
          const block = new Uint8Array(36);
          block.set(options.version, 0);
          block.set(new TextEncoder().encode('Jan  6 2017 11:16:17'), 4);
          return ok(block.subarray(0, Math.min(length, block.length)));
        }
        case OP.GET_FEATURED_FIRMWARE_DATA: {
          if (!armed) return stall();
          if (window === null) return ok(new Uint8Array(length).fill(0xa5));
          const bytes = window.subarray(cursor, cursor + length);
          cursor += bytes.length;
          return ok(bytes);
        }
        default:
          return stall();
      }
    },
    controlTransferOut: (setup, data) => {
      const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength).slice();
      calls.push({ dir: 'out', request: setup.request, length: bytes.length, data: bytes });
      const accepted = Promise.resolve({ status: 'ok' as const, bytesWritten: bytes.length });
      const refused = Promise.resolve({ status: 'stall' as const, bytesWritten: 0 });
      if (setup.request === OP.SET_OPERATION_MODE) return accepted;
      if (setup.request !== OP.BEGIN_FIRMWARE_UPGRADE) return refused;
      const subcmd = (bytes[0] ?? 0) | ((bytes[1] ?? 0) << 8);
      if (options.legacy === true) {
        if (bytes.length === 18 && !sameBytes(bytes.subarray(2), OLD_FW_UNLOCK_TOKEN)) {
          return refused;
        }
        if (bytes.length === 2 && subcmd >= 2 && subcmd <= 9) return refused;
      }
      armed = true;
      window = options.windows?.get(subcmd) ?? null;
      cursor = 0;
      return accepted;
    },
  };
  return { camera, calls };
}

/* ---- preserve run states (schema version 3) ------------------------------ */

const PRESERVE_ADDRESS: Readonly<Record<BankKey, number>> = {
  a: 0x14050000,
  b: 0x14060000,
  r: 0x14070000,
};
const PRESERVE_MODE: Readonly<Record<BankKey, number>> = { a: 7, b: 8, r: 9 };

/** One bank's patch as the run state carries it after the patch step. */
export function preservePatchOf(
  overrides: Partial<PreservePatchSummary> = {},
): PreservePatchSummary {
  return {
    sites: [
      {
        name: 'mov.w r3,#0x10000 -> #0x400000',
        offset: 0x3db4,
        before: [1, 2, 3, 4],
        after: [5, 6, 7, 8],
      },
    ],
    rebalanceWord: 0x30006240,
    stagedLength: 0x4000,
    chunkCount: 256,
    patchedSha256: '2'.repeat(64),
    diffCount: 10,
    armResetsCursor: true,
    ...overrides,
  };
}

/** A bank the run can write, its patch built. */
export function preserveBankOf(
  key: BankKey,
  overrides: Partial<PreserveBankRecord> = {},
): PreserveBankRecord {
  return {
    key,
    address: PRESERVE_ADDRESS[key],
    mode: PRESERVE_MODE[key],
    holds: 'image',
    refused: null,
    slotReadShas: ['4'.repeat(64), '4'.repeat(64)],
    imageSha256: '1'.repeat(64),
    buildId: 'compact-1.3.0.8-8hz',
    buildLabel: 'Compact 1.3.0.8 (8 Hz)',
    patch: preservePatchOf(),
    ...overrides,
  };
}

/** An erased bank: nothing to write. */
export function preserveErasedBankOf(key: BankKey): PreserveBankRecord {
  return {
    key,
    address: PRESERVE_ADDRESS[key],
    mode: PRESERVE_MODE[key],
    holds: 'erased',
    refused: 'it is erased: every byte reads 0xFF, so it holds no image',
  };
}

/** The boot facts of a camera whose word tries slot A first and whose A passes. */
export function preserveBootOf(overrides: Partial<PreserveBootFacts> = {}): PreserveBootFacts {
  return {
    cfgHex: 'ffffffff',
    word: 0xffffffff,
    rule: 'slot A first, then B, then recovery R',
    activeSlotWord: 0,
    entered: 'a',
    verdicts: { a: true, b: false, r: false },
    nextStart: 'a',
    why: 'the boot-config word 0xFFFFFFFF tries slot A first, and slot A passes its check',
    checkKeyUnnamed: null,
    ...overrides,
  };
}

/**
 * A run past its patch step: the backup read A (an image, the next start) and
 * erased B and R, and the run writes A. `overrides` replaces any field.
 */
export function preserveRunStateOf(overrides: Partial<PreserveRunState> = {}): PreserveRunState {
  return {
    version: 3,
    runId: 'preserve-2026-10-01T10-00-00Z',
    createdAt: '2026-10-01T10:00:00.000Z',
    nextStep: 'commit',
    steps: {
      backup: { status: 'done', notes: '31 windows; every bank read twice' },
      patch: { status: 'done' },
    },
    choice: 'next-start',
    targets: ['a'],
    anchor: 'a',
    boot: preserveBootOf(),
    banks: { a: preserveBankOf('a'), b: preserveErasedBankOf('b'), r: preserveErasedBankOf('r') },
    buildFamily: 'v1-2014',
    expectedVersion: '1.3.0.8',
    buildId: 'compact-1.3.0.8-8hz',
    buildLabel: 'Compact 1.3.0.8 (8 Hz)',
    stagedForm: 'plain',
    restoreForm: 'capture-verbatim',
    route: 'active-bank',
    ...overrides,
  };
}

/** The same bank before the patch step: no patch recorded. */
export function withoutPatch(record: PreserveBankRecord): PreserveBankRecord {
  const { patch: _patch, ...rest } = record;
  return rest;
}
