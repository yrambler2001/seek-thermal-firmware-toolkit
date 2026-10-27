/* ==================================================================== *
 * The slot writer, with no camera: the pure payload builders, every refusal
 * of `prepareSlotFlash`, and the sequence `flashSlot` drives over a recording
 * device. The emulator suite (write.emulator.test.ts) is the one that runs a
 * write on the emulated camera. These tests pin what the code does before and
 * around the send.
 *
 * The plan is built by a local helper from `profile.windowPlan(version)`, the
 * same windows `buildSlotPlan` will name once the capability matrix lands; the
 * writer itself reads only SlotEntry.write / read / staging from the plan.
 * ==================================================================== */

import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { equalBytes, hexToBytes } from '../../src/bytes.js';
import { silentReporter } from '../../src/events.js';
import { SeekError } from '../../src/errors.js';
import { cryptBytes } from '../../src/crypto/cipher.js';
import { findEmbeddedKeyTable, keyFilenameSuffix, stateFromKey } from '../../src/crypto/keys.js';
import {
  HEADER_OFFSET,
  IMAGE_MAGIC,
  LENGTH_OFFSET,
  parseImageHeader,
  FOOTER_TAG,
  TRY_KEYS_MAX_LEN,
} from '../../src/image/header.js';
import { wordSum32, transferSum16 } from '../../src/image/bank.js';
import { getProfile } from '../../src/profiles/registry.js';
import type { FirmwareProfile, WindowEntry } from '../../src/profiles/types.js';
import type { SeekDevice } from '../../src/protocol/client.js';
import type { DeviceState, SlotState, WorkflowContext } from '../../src/workflows/types.js';
import { onPlaintextChain } from '../../src/slots/running.js';
import { bootsNowOf } from '../../src/slots/booted-words.js';
import { checkSlotFlash, prepareSlotFlash, flashSlot } from '../../src/slots/write.js';
import { retargetImageKeys } from '../../src/slots/write-image.js';
import { reportFor } from './write-fixtures.js';
import { buildSlotPlan } from '../../src/slots/capability.js';
import {
  KEY_PAIRS,
  keystream,
  keyWordsOf,
  xorWindowVerbatim,
} from '../../src/preservation/patch.js';
import { sha256Sync } from '../../src/slots/write-sha.js';
import { stageFFVendor } from '../../src/slots/ff-form.js';
import { stagingDetail } from '../../src/slots/staging-words.js';
import {
  SLOT_BYTES,
  type SlotFlashPlan,
  type SlotKey,
  type SlotsReport,
} from '../../src/slots/types.js';

/* ==================================================================== *
 * Fixtures
 * ==================================================================== */

/** A deterministic byte stream, so every failure reproduces. */
function prng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s & 0xff;
  };
}

function bytesOf(length: number, seed: number): Uint8Array {
  const next = prng(seed);
  const out = new Uint8Array(length);
  for (let i = 0; i < length; i++) out[i] = next();
  return out;
}

/** A decrypted-looking image: SRAM stack pointer, Thumb reset vector, the magic at 0x200. */
function imageOf(length: number, seed: number): Uint8Array {
  const out = bytesOf(length, seed);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x10001000, true);
  dv.setUint32(4, 0x10000101, true);
  dv.setUint32(0x200, IMAGE_MAGIC, true);
  dv.setUint32(LENGTH_OFFSET, length, true);
  return out;
}

/** Stamp the header's version word (0x20C), low byte first as the camera reports it: '1.0.3.0' is 01 00 03 00. */
function withVersion(image: Uint8Array, version: string): Uint8Array {
  image.set(version.split('.').map(Number), 0x20c);
  return image;
}

const modern = getProfile('modern-4x');
const legacy = getProfile('legacy-auth');
const compact2016 = getProfile('compact-2016');

function slotState(overrides: Partial<SlotState> & { key: SlotKey }): SlotState {
  return {
    name: `slot ${overrides.key}`,
    subcmd: null,
    address: 0,
    present: false,
    reason: null,
    unread: false,
    header: null,
    raw: null,
    footer: null,
    recovered: null,
    plain: null,
    plainHeader: null,
    accepts: false,
    footerOk: false,
    sha256: null,
    keyName: null,
    bootable: false,
    bootability: 'not-bootable',
    ...overrides,
  };
}

/** A DeviceState carrying only what the writer reads. The rest is never touched. */
function stateFor(
  profile: FirmwareProfile,
  options: {
    version?: string | null;
    serial?: string | null;
    booted?: SlotKey | null;
    slots?: readonly SlotState[];
    /** The read's camera-wide refusals (none by default). */
    bankWriteRefusals?: readonly string[];
    keyA?: Uint8Array | null;
    keyB?: Uint8Array | null;
    plainChain?: boolean;
  } = {},
): DeviceState {
  const slots = options.slots ?? [];
  const byKey = new Map(slots.map((s) => [s.key, s]));
  const booted = options.booted === undefined ? 'a' : options.booted;
  const keyA = options.keyA === undefined ? null : options.keyA;
  const keyB = options.keyB === undefined ? null : options.keyB;
  const version = options.version === undefined ? '4.8.1.9' : options.version;
  return {
    version,
    serial: options.serial === undefined ? 'TESTSERIAL' : options.serial,
    profile,
    slots,
    byKey,
    boot: booted === null ? null : { booted, target: booted === 'a' ? 'b' : 'a' },
    keyTable: keyA && keyB ? ({ keyA, keyB } as unknown as DeviceState['keyTable']) : null,
    keyWhiteningK: profile.cipher.whiteningK,
    /* The store key of a camera without a per-device key is its Key B (storeKeyOf). */
    storeKey: { name: 'Key B', key: keyB, programmed: false },
    deviceKeySlot: null,
    bankWriteRefusals: options.bankWriteRefusals ?? [],
    /* A 2014-chain build's fixture camera holds its banks plain, as the read would find them. */
    plainChain: options.plainChain ?? onPlaintextChain(profile, version),
  } as unknown as DeviceState;
}

/**
 * The booted bank A of a camera with a Key A / Key B table: it decrypts under the store key (Key B)
 * and carries the application's own pair, planted as a dump would hold it (`write-keys.ts`).
 */
function bootedWithApp(): SlotState {
  const plain = imageOf(0x4800, 9);
  plain.set(KEY_A, 0x4000);
  plain.set(KEY_B, 0x4020);
  return slotState({
    key: 'a',
    present: true,
    accepts: true,
    plain,
    keyName: 'Key B',
    bootable: true,
    bootability: 'bootable',
  });
}

const KEY_A = Uint8Array.from({ length: 16 }, (_, i) => 0xa0 + i);
const KEY_B = Uint8Array.from({ length: 16 }, (_, i) => 0xb0 + i);
const SRC_A = Uint8Array.from({ length: 16 }, (_, i) => 0x10 + i);
const SRC_B = Uint8Array.from({ length: 16 }, (_, i) => 0x30 + i);

/** A recording device: every call it receives, in order, and what it answers. */
interface Recorder {
  readonly device: SeekDevice;
  readonly calls: { op: string; arg?: unknown }[];
}

function recordingDevice(readStored: Uint8Array = new Uint8Array(SLOT_BYTES).fill(0xff)): Recorder {
  const calls: { op: string; arg?: unknown }[] = [];
  const device = {
    transport: { isOpen: true, open: () => Promise.resolve(), info: { recipientFallback: null } },
    armWindow: (entry: WindowEntry) => {
      calls.push({ op: 'arm', arg: entry.subcmd });
      return Promise.resolve();
    },
    setFeaturedFirmwareData: (data: Uint8Array) => {
      calls.push({ op: 'stage', arg: data.length });
      return Promise.resolve();
    },
    getErrorCode: () => {
      calls.push({ op: 'status' });
      return Promise.resolve(0);
    },
    completeMemoryUpgrade: (sum: number) => {
      calls.push({ op: 'commit', arg: sum });
      return Promise.resolve();
    },
    readWindow: () => {
      calls.push({ op: 'read' });
      return Promise.resolve({
        data: readStored,
        stoppedAt: readStored.length,
        stopReason: null,
        chunkUsed: 64,
      });
    },
  } as unknown as SeekDevice;
  return { device, calls };
}

function ctxFor(device: SeekDevice, profile: FirmwareProfile): WorkflowContext {
  return { device, profile, detection: null, reporter: silentReporter };
}

function sends(calls: readonly { op: string }[]): string[] {
  return calls.map((c) => c.op).filter((op) => op !== 'status');
}

/** Refuse-and-capture: the SeekError `fn` throws, or the test fails loudly. */
function refusalOf(fn: () => unknown): SeekError {
  try {
    fn();
  } catch (error) {
    if (error instanceof SeekError) return error;
    throw error;
  }
  throw new Error('expected a refusal, the call returned');
}

/* ==================================================================== *
 * sha256Sync against node:crypto
 * ==================================================================== */

describe('sha256Sync (the synchronous digest of the compare rows)', () => {
  it('agrees with node:crypto over the padding boundaries and a full bank', () => {
    const lengths = [0, 1, 3, 55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 1000, SLOT_BYTES];
    for (const length of lengths) {
      const data = bytesOf(length, 0x51a + length);
      const expected = createHash('sha256').update(data).digest('hex');
      expect(sha256Sync(data), `length ${String(length)}`).toBe(expected);
    }
  });
});

/* ==================================================================== *
 * prepareSlotFlash: the refusals, each with nothing to undo
 * ==================================================================== */

describe('prepareSlotFlash refuses before it builds anything', () => {
  const version = '4.8.1.9';
  const plan = buildSlotPlan(modern, version);
  const image = imageOf(0x4000, 1);

  it('an unsupported build is refused with the plan reason', () => {
    const state = stateFor(modern, { version });
    const report = reportFor(state, {
      ...plan,
      supportedBuild: { supported: false, reason: 'builds older than 0.8.0.0 are not tried' },
    });
    const error = refusalOf(() =>
      prepareSlotFlash(report, 'b', { kind: 'raw', bytes: image, fileName: 'x.bin' }),
    );
    expect(error.code).toBe('slots/refused');
    expect(error.message).toContain('older than 0.8.0.0');
  });

  it('a slot the plan does not name is refused', () => {
    const state = stateFor(modern, { version });
    const report = reportFor(state, { ...plan, slots: plan.slots.filter((s) => s.key !== 'b') });
    expect(() =>
      prepareSlotFlash(report, 'b', { kind: 'raw', bytes: image, fileName: 'x' }),
    ).toThrow(/no slot 'b'/);
  });

  it('an unread slot is refused, and so is a slot the read did not find', () => {
    const unread = slotState({ key: 'b', unread: true, present: false });
    const report = reportFor(stateFor(modern, { version, slots: [unread] }), plan);
    expect(
      refusalOf(() => prepareSlotFlash(report, 'b', { kind: 'raw', bytes: image, fileName: 'x' }))
        .message,
    ).toContain('was not read');
    const absent = reportFor(stateFor(modern, { version, slots: [] }), plan);
    expect(() =>
      prepareSlotFlash(absent, 'b', { kind: 'raw', bytes: image, fileName: 'x' }),
    ).toThrow(/was not read/);
  });

  it('a build with no write window, a subcommand 0 window, or a window below the bank area is refused', () => {
    const state = stateFor(modern, { version, slots: [slotState({ key: 'b', present: true })] });
    const noWrite = {
      ...plan,
      slots: plan.slots.map((s) => (s.key === 'b' ? { ...s, write: null } : s)),
    };
    expect(() =>
      prepareSlotFlash(reportFor(state, noWrite), 'b', {
        kind: 'raw',
        bytes: image,
        fileName: 'x',
      }),
    ).toThrow(/no write window/);
    const selector0 = {
      ...plan,
      slots: plan.slots.map((s) =>
        s.key === 'b' ? { ...s, write: { subcmd: 0, address: 0x14050000, note: 'selector' } } : s,
      ),
    };
    expect(() =>
      prepareSlotFlash(reportFor(state, selector0), 'b', {
        kind: 'raw',
        bytes: image,
        fileName: 'x',
      }),
    ).toThrow(/subcommand 0/);
    const bootloader = {
      ...plan,
      slots: plan.slots.map((s) =>
        s.key === 'b' ? { ...s, write: { subcmd: 2, address: 0x14000000, note: 'SPIFI' } } : s,
      ),
    };
    expect(() =>
      prepareSlotFlash(reportFor(state, bootloader), 'b', {
        kind: 'raw',
        bytes: image,
        fileName: 'x',
      }),
    ).toThrow(/not a bank/);
  });

  it('a commit that also rewrites the boot configuration is refused', () => {
    const state = stateFor(modern, { version, slots: [slotState({ key: 'b', present: true })] });
    const effect = {
      ...plan,
      slots: plan.slots.map((s) =>
        s.key === 'b' ? { ...s, commitEffect: 'bank-and-boot-config' as const } : s,
      ),
    };
    expect(() =>
      prepareSlotFlash(reportFor(state, effect), 'b', { kind: 'raw', bytes: image, fileName: 'x' }),
    ).toThrow(/boot configuration/);
  });

  it('an empty input, and a raw payload longer than its bank, are refused', () => {
    const state = stateFor(modern, { version, slots: [slotState({ key: 'b', present: true })] });
    const report = reportFor(state, plan);
    expect(() =>
      prepareSlotFlash(report, 'b', { kind: 'raw', bytes: new Uint8Array(0), fileName: 'x' }),
    ).toThrow(/empty/);
    const long = new Uint8Array(SLOT_BYTES + 4);
    expect(() =>
      prepareSlotFlash(report, 'b', { kind: 'raw', bytes: long, fileName: 'x' }),
    ).toThrow(/longer than the/);
  });

  it('a raw entry the build cannot take is refused', () => {
    const state = stateFor(modern, { version, slots: [slotState({ key: 'b', present: true })] });
    const noRaw = {
      ...plan,
      slots: plan.slots.map((s) =>
        s.key === 'b'
          ? { ...s, flashRaw: { supported: false as const, reason: 'no raw path' } }
          : s,
      ),
    };
    expect(() =>
      prepareSlotFlash(reportFor(state, noRaw), 'b', { kind: 'raw', bytes: image, fileName: 'x' }),
    ).toThrow(/no raw path/);
  });

  it('a malformed decrypted image is refused by the existing image checks', () => {
    const state = stateFor(modern, { version, slots: [slotState({ key: 'b', present: true })] });
    const report = reportFor(state, plan);
    const notAnImage = bytesOf(0x4000, 9);
    expect(() =>
      prepareSlotFlash(report, 'b', { kind: 'plain', bytes: notAnImage, fileName: 'x' }),
    ).toThrow(/no image header/);
    const odd = imageOf(0x4002, 2);
    expect(() =>
      prepareSlotFlash(report, 'b', { kind: 'plain', bytes: odd, fileName: 'x' }),
    ).toThrow(/multiple of 4/);
  });

  it('key-a staging needs the booted bank read under a key, and a file that carries its keys', () => {
    const slot = slotState({ key: 'b', present: true, accepts: true });
    const noKeys = reportFor(stateFor(modern, { version, slots: [slot, bootedWithApp()] }), plan);
    expect(() =>
      prepareSlotFlash(noKeys, 'b', { kind: 'plain', bytes: image, fileName: 'x.bin' }),
    ).toThrow(/key table does not carry that key|decrypts under no key the bootloader tries/);
    const withKeys = reportFor(
      stateFor(modern, { version, slots: [slot, bootedWithApp()], keyA: KEY_A, keyB: KEY_B }),
      plan,
    );
    const error = refusalOf(() =>
      prepareSlotFlash(withKeys, 'b', {
        kind: 'plain',
        bytes: image,
        fileName: 'no-key-suffix.bin',
      }),
    );
    expect(error.code).toBe('slots/refused');
    expect(error.message).toContain('does not carry its key pair');
  });

  it('a camera the read refuses every bank write for refuses key-a staging with the reasons', () => {
    const slot = slotState({ key: 'b', present: true });
    const reason = 'this camera cannot be written (fixture)';
    const report = reportFor(
      stateFor(modern, {
        version,
        slots: [slot],
        keyA: KEY_A,
        keyB: KEY_B,
        bankWriteRefusals: [reason],
      }),
      plan,
    );
    const name = `img${keyFilenameSuffix(SRC_A, SRC_B)}.bin`;
    const error = refusalOf(() =>
      prepareSlotFlash(report, 'b', { kind: 'plain', bytes: image, fileName: name }),
    );
    expect(error.message).toContain('cannot be written from here');
    /* the refusal carries the writer's own reasons (TESTING.md 42.89) */
    expect(error.detail?.blockedBy).toEqual([reason]);
  });

  it('2016 staging needs a key pair of its line in the image', () => {
    const slotPlan = buildSlotPlan(compact2016, '1.0.3.0');
    const report = reportFor(
      stateFor(compact2016, {
        version: '1.0.3.0',
        slots: [slotState({ key: 'a', present: true, accepts: true })],
      }),
      slotPlan,
    );
    expect(() =>
      prepareSlotFlash(report, 'a', { kind: 'plain', bytes: imageOf(0x6000, 5), fileName: 'x' }),
    ).toThrow(/no key pair of the 2016 line/);
  });

  it('an image with the FF word sum 0xFFFF but not the FF key pair is refused, nothing staged', () => {
    const plan = buildSlotPlan(legacy, '1.3.0.8');
    const report = reportFor(
      stateFor(legacy, {
        version: '1.3.0.8',
        slots: [slotState({ key: 'r', present: true, accepts: true })],
      }),
      plan,
    );
    const image = imageOf(0x2000, 33);
    /* Balance the file's own word sum to 0xFFFF, as the FF image's adjust word does. */
    const dv = new DataView(image.buffer);
    dv.setUint32(0x238, 0, true);
    dv.setUint32(0x238, (0xffff - wordSum32(image, image.length)) >>> 0, true);
    expect(wordSum32(image, image.length)).toBe(0xffff);
    expect(() =>
      prepareSlotFlash(report, 'r', { kind: 'plain', bytes: image, fileName: 'x' }),
    ).toThrow(/16 Hz FF word sum 0xFFFF but does not carry the 1\.3\.0\.8-FF key pair/);
  });

  it('a build with no staging form refuses a decrypted image', () => {
    const noStaging = {
      ...buildSlotPlan(modern, version),
      slots: buildSlotPlan(modern, version).slots.map((s) => ({ ...s, staging: null })),
    };
    const report = reportFor(
      stateFor(modern, { version, slots: [slotState({ key: 'b', present: true })] }),
      noStaging,
    );
    expect(() =>
      prepareSlotFlash(report, 'b', { kind: 'plain', bytes: image, fileName: 'x' }),
    ).toThrow(/no staging form/);
  });
});

/* ==================================================================== *
 * prepareSlotFlash: the three staging forms, and their bytes
 * ==================================================================== */

/* ==================================================================== *
 * The file, the key pair and the analysis, checked before anything is built.
 * These were pinned by the removed flash.ts tests (TESTING.md 42.80) and are
 * pinned here against the writer that replaced it.
 * ==================================================================== */

describe('prepareSlotFlash: the file, the key pair and the analysis', () => {
  const version = '4.8.1.9';
  const plan = buildSlotPlan(modern, version);
  /* a 4.x camera whose booted bank reads under the store key, carrying this camera's pair */
  const keyed = (): SlotsReport =>
    reportFor(
      stateFor(modern, {
        version,
        slots: [slotState({ key: 'b', present: true, accepts: true }), bootedWithApp()],
        keyA: KEY_A,
        keyB: KEY_B,
      }),
      plan,
    );

  it('a file name that claims a key pair the image does not hold is refused', () => {
    const image = imageOf(0x5000, 5);
    const name = `img${keyFilenameSuffix(SRC_A, SRC_B)}.bin`;
    const error = refusalOf(() =>
      prepareSlotFlash(keyed(), 'b', { kind: 'plain', bytes: image, fileName: name }),
    );
    expect(error.code).toBe('slots/refused');
    expect(error.message).toContain('the filename claims Key A');
  });

  it('an image the bootloader could never boot (header.length at or past the limit) is refused', () => {
    const image = new Uint8Array(TRY_KEYS_MAX_LEN);
    expect(() =>
      prepareSlotFlash(keyed(), 'b', { kind: 'plain', bytes: image, fileName: 'x.bin' }),
    ).toThrow(/rejects any header\.length/);
  });

  it('a key the image keeps inside the cleartext header window is not patched', () => {
    const image = imageOf(0x5000, 5);
    /* 0x220: inside the window the bootloader reads in clear, before it has a key */
    image.set(SRC_A, HEADER_OFFSET + 0x20);
    image.set(SRC_B, 0x4020);
    const name = `img${keyFilenameSuffix(SRC_A, SRC_B)}.bin`;
    const error = refusalOf(() =>
      prepareSlotFlash(keyed(), 'b', { kind: 'plain', bytes: image, fileName: name }),
    );
    expect(error.code).toBe('slots/refused');
    expect(error.message).toContain('inside the cleartext header window');
  });

  it('retargeting copies the image and leaves the caller’s bytes alone; an image that already carries this camera’s pair is left as it is', () => {
    const mine = { keyA: KEY_A, keyB: KEY_B };
    const image = imageOf(0x5000, 5);
    image.set(SRC_A, 0x4000);
    image.set(SRC_B, 0x4020);
    const before = image.slice();

    const out = retargetImageKeys(image, `img${keyFilenameSuffix(SRC_A, SRC_B)}.bin`, mine);
    expect(equalBytes(image, before)).toBe(true);
    expect(out).not.toBe(image);
    expect(equalBytes(out.subarray(0x4000, 0x4010), KEY_A)).toBe(true);
    expect(equalBytes(out.subarray(0x4020, 0x4030), KEY_B)).toBe(true);
    expect(findEmbeddedKeyTable(out, KEY_A, KEY_B)).not.toBeNull();

    const own = imageOf(0x5000, 6);
    own.set(KEY_A, 0x4000);
    own.set(KEY_B, 0x4020);
    const kept = retargetImageKeys(own, `own${keyFilenameSuffix(KEY_A, KEY_B)}.bin`, mine);
    expect(equalBytes(kept, own)).toBe(true);
  });

  it('an unnamed image that holds this camera’s own pair, each half once, is staged under that pair as it is; the same pair twice is refused (README "The name has no pair", TESTING.md 42.82 F2)', () => {
    const image = imageOf(0x5000, 7);
    image.set(KEY_A, 0x4000);
    image.set(KEY_B, 0x4020);
    const before = image.slice();

    const plan = prepareSlotFlash(keyed(), 'b', {
      kind: 'plain',
      bytes: image,
      fileName: 'no-key-suffix.bin',
    });
    /* nothing retargeted: the stamped image keeps this camera's pair where the file had it, and its code */
    const stamped = plan.expectedPlain!;
    expect(findEmbeddedKeyTable(stamped, KEY_A, KEY_B)).toEqual(
      findEmbeddedKeyTable(image, KEY_A, KEY_B),
    );
    expect(equalBytes(stamped.subarray(0x1000, 0x4800), image.subarray(0x1000, 0x4800))).toBe(true);
    expect(plan.derivedFrom).toEqual({ bank: 'a', key: 'Key B', holds: 'Key B' });
    expect(equalBytes(image, before)).toBe(true);

    /* the value search needs each half exactly once: a second Key A leaves no pair to go by */
    const twice = image.slice();
    twice.set(KEY_A, 0x4800);
    const error = refusalOf(() =>
      prepareSlotFlash(keyed(), 'b', { kind: 'plain', bytes: twice, fileName: 'twice.bin' }),
    );
    expect(error.code).toBe('slots/refused');
    expect(error.message).toContain("neither this camera's pair nor a decoded application pair");
  });

  it('an analysis that does not say which firmware it runs is refused before anything is built', () => {
    const report = reportFor(
      stateFor(modern, { version: null, slots: [slotState({ key: 'b', present: true })] }),
      plan,
    );
    const error = refusalOf(() =>
      prepareSlotFlash(report, 'b', { kind: 'raw', bytes: imageOf(0x4000, 1), fileName: 'x.bin' }),
    );
    expect(error.code).toBe('slots/refused');
    expect(error.message).toContain('does not say which firmware');
  });
});

describe('prepareSlotFlash builds each staging form', () => {
  it('plain (2014 chain): length stamped, stored word sum 0, the bank holds the payload then erased', () => {
    const plan = buildSlotPlan(legacy, '1.3.0.0');
    const slot = slotState({ key: 'a', present: true, accepts: true, recovered: null });
    const report = reportFor(stateFor(legacy, { version: '1.3.0.0', slots: [slot] }), plan);
    const image = imageOf(0x9000, 3);
    const out = prepareSlotFlash(report, 'a', {
      kind: 'plain',
      bytes: image,
      fileName: 'chain.bin',
    });
    expect(out.staging).toBe('plain');
    expect(out.payload.length).toBe(0x9000);
    expect(wordSum32(out.payload, out.payload.length)).toBe(0);
    expect(parseImageHeader(out.payload)?.length).toBe(0x9000);
    expect(out.expectedStored?.length).toBe(SLOT_BYTES);
    expect(equalBytes(out.expectedStored!.subarray(0, 0x9000), out.payload)).toBe(true);
    expect(out.expectedStored![0x9000]).toBe(0xff);
    expect(out.sum16).toBe(transferSum16(out.payload));
    /* On the chain the stored bytes ARE the image, so the plain image is the payload. */
    expect(out.expectedPlain && equalBytes(out.expectedPlain, out.payload)).toBe(true);
  });

  it('slot keystream (2016 line): the payload is the image XOR the stage key, and decrypts to a zero sum', () => {
    const plan = buildSlotPlan(compact2016, '1.0.3.0');
    const slot = slotState({ key: 'a', present: true, accepts: true });
    const report = reportFor(stateFor(compact2016, { version: '1.0.3.0', slots: [slot] }), plan);
    const image = imageOf(0x6000, 4);
    const pair = KEY_PAIRS.cp103;
    image.set(hexToBytes(pair.block0), 0x3000);
    image.set(hexToBytes(pair.block1), 0x3100);
    const out = prepareSlotFlash(report, 'a', { kind: 'plain', bytes: image, fileName: 'x' });
    expect(out.staging).toBe('slot-keystream-ciphertext');
    /* TESTING.md 42.96: afterwards the bank is under key block 1 (the store key), as the read after a write shows. */
    expect(JSON.stringify(out)).toContain('key block 1: the camera stores the image under it');
    expect(JSON.stringify(out)).not.toContain('the stage key (key block 0 of the image)');
    /* The bootloader decrypts with key block 0 and checks the word sum: that is the stage key. */
    const decrypted = xorWindowVerbatim(
      out.payload,
      keystream(keyWordsOf(pair.block0), 0x6000 >>> 2),
    );
    expect(wordSum32(decrypted, decrypted.length)).toBe(compact2016.cipher.acceptanceSum);
    expect(parseImageHeader(decrypted)?.length).toBe(0x6000);
    /* The header window is verbatim: the cleartext adjust word carries the balance. */
    expect(parseImageHeader(out.payload)?.length).toBe(0x6000);
    /* The device stores the image under its own key, so the stored bytes are not
     * predicted; the plain image is, and it is the stamped image the stage XOR came from. */
    expect(out.expectedStored).toBeNull();
    expect(out.expectedPlain?.length).toBe(0x6000);
    expect(
      equalBytes(
        xorWindowVerbatim(out.payload, keystream(keyWordsOf(pair.block0), 0x6000 >>> 2)),
        out.expectedPlain!,
      ),
    ).toBe(true);
  });

  it('key-a (2017+): the image is retargeted to this camera, footered, and encrypted under its Key A', () => {
    const plan = buildSlotPlan(modern, '4.8.1.9');
    const slot = slotState({ key: 'b', present: true, accepts: true });
    const report = reportFor(
      stateFor(modern, {
        version: '4.8.1.9',
        slots: [slot, bootedWithApp()],
        keyA: KEY_A,
        keyB: KEY_B,
      }),
      plan,
    );
    const image = imageOf(0x5000, 5);
    /* Plant the SOURCE pair in the image, as a dump would. */
    image.set(SRC_A, 0x4000);
    image.set(SRC_B, 0x4020);
    const name = `img${keyFilenameSuffix(SRC_A, SRC_B)}.bin`;
    const out = prepareSlotFlash(report, 'b', { kind: 'plain', bytes: image, fileName: name });
    expect(out.staging).toBe('key-a-ciphertext');
    expect(out.expectedStored).toBeNull();
    /* The footer is in place and the length is stamped where the bootloader reads it. */
    const length = parseImageHeader(out.payload)?.length ?? 0;
    expect(length).toBe(0x5000);
    const footerAt = ((length >>> 14) + 1) * 0x4000 - 0x40;
    expect(new DataView(out.payload.buffer, out.payload.byteOffset).getUint32(footerAt, true)).toBe(
      FOOTER_TAG,
    );
    /* Decrypted under this camera's Key A, the payload is the retargeted image. */
    const decrypted = cryptBytes(
      out.payload.subarray(0, length),
      stateFromKey(KEY_A, modern.cipher.whiteningK),
      modern.cipher,
    );
    expect(wordSum32(decrypted, length)).toBe(modern.cipher.acceptanceSum);
    expect(equalBytes(decrypted.subarray(0x4000, 0x4010), KEY_A)).toBe(true);
    expect(equalBytes(decrypted.subarray(0x4020, 0x4030), KEY_B)).toBe(true);
    /* The plain image the bank must decrypt to is the retargeted image the payload carries. */
    expect(out.expectedPlain && equalBytes(out.expectedPlain, decrypted)).toBe(true);
  });

  it('raw: sent verbatim, and the bootloader checks it would fail are warned, not refused', () => {
    const plan = buildSlotPlan(modern, '4.8.1.9');
    const slot = slotState({ key: 'b', present: true, accepts: true });
    const report = reportFor(stateFor(modern, { version: '4.8.1.9', slots: [slot] }), plan);
    /* An image with a header but no footer: the bootloader's own footer check fails. */
    const bytes = imageOf(0x3000, 7);
    const out = prepareSlotFlash(report, 'b', { kind: 'raw', bytes, fileName: 'raw.bin' });
    expect(out.staging).toBe('verbatim');
    expect(equalBytes(out.payload, bytes)).toBe(true);
    expect(out.payload).not.toBe(bytes);
    expect(out.warnings.some((w) => w.includes('sent exactly as given'))).toBe(true);
    expect(
      out.warnings.some(
        (w) => w.includes('would reject this payload') && w.includes('no footer at'),
      ),
    ).toBe(true);
    /* Key A line: the device decodes and re-encrypts, so the stored bytes are not predicted. That is how
     * the write is checked, not a risk: a note of this write (TESTING.md 42.88). */
    expect(out.expectedStored).toBeNull();
    expect(
      out.notes.some(
        (note) => note.source === 'write' && note.text.includes('re-encrypts what it keeps'),
      ),
    ).toBe(true);
    expect(out.warnings.some((w) => w.includes('re-encrypts what it keeps'))).toBe(false);
    /* No Key A on this camera's state, so not even the plain image can be said. */
    expect(out.expectedPlain).toBeNull();
  });

  it('raw on the 2014 chain: the stored bytes are the payload, erased past it (the chain programs them as sent)', () => {
    const plan = buildSlotPlan(legacy, '1.3.0.0');
    const slot = slotState({ key: 'a', present: true, accepts: true });
    const report = reportFor(stateFor(legacy, { version: '1.3.0.0', slots: [slot] }), plan);
    /* A payload the chain accepts, built by the plain builder, then sent raw. */
    const staged = prepareSlotFlash(report, 'a', {
      kind: 'plain',
      bytes: imageOf(0x9000, 8),
      fileName: 'x',
    });
    const raw = prepareSlotFlash(report, 'a', {
      kind: 'raw',
      bytes: staged.payload,
      fileName: 'raw.bin',
    });
    expect(raw.expectedStored?.length).toBe(SLOT_BYTES);
    expect(equalBytes(raw.expectedStored!.subarray(0, staged.payload.length), staged.payload)).toBe(
      true,
    );
    expect(raw.expectedStored![staged.payload.length]).toBe(0xff);
    expect(raw.expectedPlain && equalBytes(raw.expectedPlain, staged.payload)).toBe(true);
  });

  it('raw on the 2016 line: the plain image is what the block-0 stage key decrypts it to, and the stored bytes are not predicted', () => {
    const plan = buildSlotPlan(compact2016, '1.0.3.0');
    const slot = slotState({ key: 'r', present: true, accepts: true });
    const report = reportFor(stateFor(compact2016, { version: '1.0.3.0', slots: [slot] }), plan);
    const image = imageOf(0x6000, 12);
    image.set(hexToBytes(KEY_PAIRS.cp103.block0), 0x3000);
    image.set(hexToBytes(KEY_PAIRS.cp103.block1), 0x3100);
    /* The block-0-staged payload of a valid image: the form a real write sends. */
    const staged = prepareSlotFlash(report, 'r', { kind: 'plain', bytes: image, fileName: 'x' });
    const raw = prepareSlotFlash(report, 'r', {
      kind: 'raw',
      bytes: staged.payload,
      fileName: 'raw.bin',
    });
    expect(raw.staging).toBe('verbatim');
    expect(raw.expectedStored).toBeNull();
    expect(raw.expectedPlain).not.toBeNull();
    expect(equalBytes(raw.expectedPlain!, staged.expectedPlain!)).toBe(true);
  });
});

/* ==================================================================== *
 * prepareSlotFlash: the compare rows claim only what they can predict
 * ==================================================================== */

describe('prepareSlotFlash compare rows', () => {
  const plan = buildSlotPlan(compact2016, '1.0.3.0');
  const row = (rows: readonly { field: string; after: string }[], field: string) =>
    rows.find((r) => r.field === field);

  it('2016 image: the sha row is the expected PLAIN image, labelled as such, not a sha of stored bytes', () => {
    const slot = slotState({ key: 'a', present: true, accepts: true });
    const report = reportFor(stateFor(compact2016, { version: '1.0.3.0', slots: [slot] }), plan);
    const image = imageOf(0x6000, 4);
    image.set(hexToBytes(KEY_PAIRS.cp103.block0), 0x3000);
    image.set(hexToBytes(KEY_PAIRS.cp103.block1), 0x3100);
    const out = prepareSlotFlash(report, 'a', { kind: 'plain', bytes: image, fileName: 'x' });
    const shaRow = out.compare.find((r) => r.field.startsWith('SHA-256'));
    expect(shaRow?.field).toBe('SHA-256 of the expected plain image (stored bytes not predicted)');
    expect(shaRow?.after).toBe(sha256Sync(out.expectedPlain!));
    expect(shaRow?.after).not.toBe(sha256Sync(out.payload));
  });

  it('2014 chain: the sha row is the image, which is also what the chain stores', () => {
    const chain = buildSlotPlan(legacy, '1.3.0.0');
    const slot = slotState({ key: 'a', present: true, accepts: true });
    const report = reportFor(stateFor(legacy, { version: '1.3.0.0', slots: [slot] }), chain);
    const out = prepareSlotFlash(report, 'a', {
      kind: 'plain',
      bytes: imageOf(0x9000, 3),
      fileName: 'x',
    });
    const shaRow = out.compare.find((r) => r.field.startsWith('SHA-256'));
    expect(shaRow?.field).toBe('SHA-256 of the image');
    expect(shaRow?.after).toBe(sha256Sync(out.payload));
  });

  it('raw bytes on a form whose device re-encrypts, with no Key A: nothing is claimed; the rows say not predicted', () => {
    const modernPlan = buildSlotPlan(modern, '4.8.1.9');
    const slot = slotState({ key: 'b', present: true, accepts: true });
    const report = reportFor(stateFor(modern, { version: '4.8.1.9', slots: [slot] }), modernPlan);
    const out = prepareSlotFlash(report, 'b', {
      kind: 'raw',
      bytes: imageOf(0x3000, 7),
      fileName: 'raw.bin',
    });
    expect(out.expectedPlain).toBeNull();
    const shaRow = out.compare.find((r) => r.field.startsWith('SHA-256'));
    expect(shaRow?.field).toBe('SHA-256 of the expected plain image');
    expect(shaRow?.after).toMatch(/not predicted/);
    expect(row(out.compare, 'Initial SP')?.after).toMatch(/not predicted/);
    expect(row(out.compare, 'Reset vector')?.after).toMatch(/not predicted/);
  });
});

/* ==================================================================== *
 * prepareSlotFlash: warnings for the booted bank, recovery and notes
 * ==================================================================== */

describe('prepareSlotFlash warnings', () => {
  it('names the booted bank, recovery, and an unnamed boot, and carries the build notes', () => {
    const plan = buildSlotPlan(modern, '4.8.1.9');
    const withNotes = {
      ...plan,
      notes: ['build note one'],
      slots: plan.slots.map((s) => (s.key === 'r' ? { ...s, notes: ['recovery-only note'] } : s)),
    };
    const slots = (['a', 'b', 'r'] as const).map((k) =>
      slotState({ key: k, present: true, accepts: true }),
    );
    const image = imageOf(0x2000, 11);
    const bootedA = reportFor(stateFor(modern, { slots, booted: 'a' }), withNotes);
    const outA = prepareSlotFlash(bootedA, 'a', { kind: 'raw', bytes: image, fileName: 'x' });
    expect(outA.warnings.some((w) => w.includes('Slot A is the bank the camera boots now'))).toBe(
      true,
    );
    /* The camera's notes and the bank's own are notes, not warnings, each with where it comes from
     * (TESTING.md 42.88). */
    expect(outA.notes).toContainEqual({ source: 'camera', text: 'build note one' });
    expect(outA.warnings.some((w) => w.includes('build note one'))).toBe(false);

    const recovery = reportFor(stateFor(modern, { slots, booted: 'a' }), withNotes);
    const outR = prepareSlotFlash(recovery, 'r', { kind: 'raw', bytes: image, fileName: 'x' });
    expect(outR.warnings.some((w) => w.includes('Recovery R:'))).toBe(true);
    expect(outR.notes).toContainEqual({ source: 'bank', text: 'recovery-only note' });
    expect(outR.notes).toContainEqual({ source: 'camera', text: 'build note one' });
    expect(outA.notes.some((note) => note.text === 'recovery-only note')).toBe(false);

    const unnamed = reportFor(stateFor(modern, { slots, booted: null }), withNotes);
    const outB = prepareSlotFlash(unnamed, 'b', { kind: 'raw', bytes: image, fileName: 'x' });
    expect(outB.warnings.some((w) => w.includes('could not be named'))).toBe(true);

    /* The plan's warnings are read by people on the page and in the CLI: they name no option
     * (TESTING.md 42.85 O2, 42.86). */
    for (const out of [outA, outR, outB]) {
      expect(out.warnings.join('\n')).not.toContain('acknowledgeRisk');
    }
    expect(outA.warnings).toContain(
      'Slot A is the bank the camera boots now: writing it asks you to acknowledge the risk, and the ' +
        'camera runs whatever it holds after the next power cycle.',
    );
    expect(outR.warnings).toContain(
      'Recovery R: writing it asks you to acknowledge the risk. Nothing here checks that the ' +
        'camera boots afterwards.',
    );
  });

  it('says the booted bank "boots now" on the 2014 plaintext chain too, in the words the 2016 line has (TESTING.md 42.89)', () => {
    const slots = (['a', 'b', 'r'] as const).map((k) =>
      slotState({ key: k, present: true, accepts: true }),
    );
    const image = imageOf(0x2000, 11);
    const plain = reportFor(
      stateFor(legacy, { version: '1.3.0.0', slots, booted: 'a', plainChain: true }),
      buildSlotPlan(legacy, '1.3.0.0'),
    );
    const out = prepareSlotFlash(plain, 'a', { kind: 'raw', bytes: image, fileName: 'x' });
    expect(out.warnings).toContain(
      `${bootsNowOf('Slot A')}: writing it asks you to acknowledge the risk, and the camera runs whatever ` +
        'it holds after the next power cycle.',
    );
    expect(out.warnings.join('\n')).not.toContain('active-slot word');
    expect(bootsNowOf('Slot A')).toBe('Slot A is the bank the camera boots now');
  });

  /* The rekey warning (write.ts, key-a branch; TESTING.md 42.50): the target accepts, has its footer, and
   * is not bootable, so the application re-keys a valid image under a key the bootloader will not try. */
  const REKEY_WARNING = 'already holds an image the bootloader cannot take';

  it('the rekey warning on the 4.x line: named for a footered bank the bootloader cannot key, not for one without a footer', () => {
    const plan = buildSlotPlan(modern, '4.8.1.9');
    const image = imageOf(0x5000, 5);
    image.set(SRC_A, 0x4000);
    image.set(SRC_B, 0x4020);
    const name = `img${keyFilenameSuffix(SRC_A, SRC_B)}.bin`;
    const warnedFor = (footerOk: boolean): boolean => {
      const slot = slotState({ key: 'b', present: true, accepts: true, footerOk });
      const report = reportFor(
        stateFor(modern, {
          version: '4.8.1.9',
          slots: [slot, bootedWithApp()],
          keyA: KEY_A,
          keyB: KEY_B,
        }),
        plan,
      );
      const out = prepareSlotFlash(report, 'b', { kind: 'plain', bytes: image, fileName: name });
      expect(out.staging).toBe('key-a-ciphertext');
      return out.warnings.some((w) => w.includes(REKEY_WARNING));
    };
    expect(warnedFor(true)).toBe(true);
    expect(warnedFor(false)).toBe(false);
  });

  it('the rekey warning never fires on the 2016 line: its stage-key staging takes no rekey rule, and a bank that accepts is not "not bootable" there', () => {
    /* On 2016 the bank is "unknown" (no key table), not "not bootable", and the stage-key form sets
     * rekeyRisk false. A footer the 2016 bootloader never reads does not make the bank unbootable. */
    const plan = buildSlotPlan(compact2016, '1.0.3.0');
    const image = imageOf(0x6000, 4);
    image.set(hexToBytes(KEY_PAIRS.cp103.block0), 0x3000);
    image.set(hexToBytes(KEY_PAIRS.cp103.block1), 0x3100);
    const slot = slotState({
      key: 'b',
      present: true,
      accepts: true,
      footerOk: true,
      bootability: 'unknown',
    });
    const report = reportFor(stateFor(compact2016, { version: '1.0.3.0', slots: [slot] }), plan);
    const out = prepareSlotFlash(report, 'b', { kind: 'plain', bytes: image, fileName: 'x.bin' });
    expect(out.staging).toBe('slot-keystream-ciphertext');
    expect(out.warnings.some((w) => w.includes(REKEY_WARNING))).toBe(false);
  });

  it('a 2016 write plan says the acknowledgement once as a warning, and the camera’s and bank’s notes as notes (TESTING.md 42.87, 42.88)', () => {
    /* Before: R's plan said "Recovery R: writing it asks you to acknowledge the risk. …" and again
     * "Note: Recovery bank, mode 9, token form. A write asks you to acknowledge the risk. …". Then (42.87)
     * the warnings carried all six camera notes as "Note: …"; they are notes now, by source (42.88). */
    const plan = buildSlotPlan(compact2016, '1.0.3.0');
    /* The camera's own build, so no warning says the image is another one (TESTING.md 42.104). */
    const image = withVersion(imageOf(0x6000, 4), '1.0.3.0');
    image.set(hexToBytes(KEY_PAIRS.cp103.block0), 0x3000);
    image.set(hexToBytes(KEY_PAIRS.cp103.block1), 0x3100);
    const slots = (['a', 'b', 'r'] as const).map((k) =>
      slotState({ key: k, present: true, accepts: true }),
    );
    const report = reportFor(
      stateFor(compact2016, { version: '1.0.3.0', slots, booted: 'a' }),
      plan,
    );
    for (const key of ['a', 'r'] as const) {
      const out = prepareSlotFlash(report, key, { kind: 'plain', bytes: image, fileName: 'x.bin' });
      expect(
        out.warnings.filter((w) => w.includes('acknowledge')),
        `${key}: the acknowledgement, once`,
      ).toHaveLength(1);
      expect(
        out.notes.filter((note) => note.text.startsWith('Staged: ')),
        `${key}: the staging note, once, as the camera's`,
      ).toEqual([expect.objectContaining({ source: 'camera' })]);
      /* No note is a warning: the warnings are the acknowledgement alone. */
      expect(out.warnings, `${key}: only the acknowledgement warns`).toHaveLength(1);
      expect(out.warnings.some((w) => w.startsWith('Note: '))).toBe(false);
      /* Every camera note, in the camera's order, after the bank's own; this write has none of its own. */
      expect(out.notes.filter((note) => note.source === 'camera').map((note) => note.text)).toEqual(
        plan.notes,
      );
      expect(out.notes.filter((note) => note.source === 'write')).toEqual([]);
    }
    const outR = prepareSlotFlash(report, 'r', { kind: 'plain', bytes: image, fileName: 'x.bin' });
    expect(outR.notes[0]).toEqual({
      source: 'bank',
      text:
        'Measured on a Compact PRO 1.0.3.0: recovery R took its own image, a one-byte change and the ' +
        'raw bytes as they were sent, each written without an error.',
    });
    const outB = prepareSlotFlash(report, 'b', { kind: 'plain', bytes: image, fileName: 'x.bin' });
    expect(outB.warnings.filter((w) => w.includes('acknowledge'))).toEqual([]);
    expect(outB.warnings).toEqual([]);
  });

  it('a raw 2016 payload: the checks not made warn, how the read-back is checked is this write’s note (TESTING.md 42.88)', () => {
    const plan = buildSlotPlan(compact2016, '1.0.3.0');
    const slots = (['a', 'b', 'r'] as const).map((k) =>
      slotState({ key: k, present: true, accepts: true }),
    );
    const report = reportFor(
      stateFor(compact2016, { version: '1.0.3.0', slots, booted: 'a' }),
      plan,
    );
    const out = prepareSlotFlash(report, 'b', {
      kind: 'raw',
      bytes: imageOf(0x2000, 7),
      fileName: 'raw.bin',
    });
    expect(out.warnings).toContain(
      'Raw payload: sent exactly as given. Nothing here checks that it is bootable.',
    );
    expect(out.warnings.join('\n')).toContain('is not in raw bytes');
    expect(out.notes.filter((note) => note.source === 'write').map((note) => note.text)).toEqual([
      'The device decodes this payload and re-encrypts what it keeps, so the stored bytes are not ' +
        'predicted. The read-back is checked as the image it decrypts to, where that can be said.',
    ]);
    /* Shared text names no front end (TESTING.md 42.87). */
    expect([...out.warnings, ...out.notes.map((note) => note.text)].join('\n')).not.toMatch(
      /this page|the page/i,
    );
  });
});

/* ==================================================================== *
 * flashSlot: the gates, the sequence, and the read-back
 * ==================================================================== */

describe('prepareSlotFlash: an image that is not the build the camera runs is warned of, never refused (TESTING.md 42.104)', () => {
  /** A 2014-chain camera on 1.3.0.0 (the bench Compact's build), booting A; B is the target. */
  function chainReport(): SlotsReport {
    const slots = (['a', 'b', 'r'] as const).map((k) =>
      slotState({ key: k, present: true, accepts: true }),
    );
    return reportFor(
      stateFor(legacy, { version: '1.3.0.0', slots, booted: 'a' }),
      buildSlotPlan(legacy, '1.3.0.0'),
    );
  }
  const plain = (bytes: Uint8Array) => ({ kind: 'plain' as const, bytes, fileName: 'image.bin' });

  it('the same build: no warning, and the plan carries none', () => {
    const out = prepareSlotFlash(
      chainReport(),
      'b',
      plain(withVersion(imageOf(0x6000, 61), '1.3.0.0')),
    );
    expect(out.imageBuild).toBeNull();
    expect(out.warnings).toEqual([]);
  });

  it('another build on the 2014 chain: the warning first, in plain words, with what follows; the write is still planned and passes its checks', () => {
    const report = chainReport();
    const out = prepareSlotFlash(report, 'b', plain(withVersion(imageOf(0x6000, 62), '1.2.0.0')));
    const text =
      'This image is firmware 1.2.0.0; the camera runs 1.3.0.0. On this line the camera checks only ' +
      'that an image is well formed (its header and word sum), not its version, so it takes this ' +
      'image, and when it starts from this bank it runs 1.2.0.0.';
    expect(out.imageBuild).toEqual({
      code: 'other-version',
      image: '1.2.0.0',
      camera: '1.3.0.0',
      text,
    });
    expect(out.warnings).toEqual([text]);
    /* Warned, never gated: the plan is built and every check before a send passes. */
    expect(out.staging).toBe('plain');
    expect(() => checkSlotFlash(report, out, { acknowledgeRisk: false })).not.toThrow();
    /* People's words carry no code name. */
    expect(text).not.toContain('other-version');
  });

  it('an image whose header names no version: the build cannot be told, so it warns (the choice: warn, not stay silent)', () => {
    const image = imageOf(0x6000, 63);
    new DataView(image.buffer).setUint32(0x20c, 0, true);
    const out = prepareSlotFlash(chainReport(), 'b', plain(image));
    expect(out.imageBuild).toEqual({
      code: 'no-version',
      image: null,
      camera: '1.3.0.0',
      text:
        "This image's header names no firmware version, so whether it is the build the camera runs " +
        '(1.3.0.0) cannot be told. Check that it is the image you mean to write.',
    });
    expect(out.warnings[0]).toBe(out.imageBuild?.text);
  });

  it('raw bytes: an image header of another build warns as an image does; bytes with no image header say nothing more', () => {
    const report = chainReport();
    const image = withVersion(imageOf(0x6000, 64), '1.2.0.0');
    const out = prepareSlotFlash(report, 'b', { kind: 'raw', bytes: image, fileName: 'raw.bin' });
    expect(out.imageBuild?.code).toBe('other-version');
    expect(out.warnings[0]).toMatch(
      /^This image is firmware 1\.2\.0\.0; the camera runs 1\.3\.0\.0\./,
    );
    const noHeader = bytesOf(0x6000, 65);
    const outRaw = prepareSlotFlash(report, 'b', {
      kind: 'raw',
      bytes: noHeader,
      fileName: 'raw.bin',
    });
    expect(outRaw.imageBuild).toBeNull();
  });

  it('the 2016 stage-key form and Key A ciphertext warn too, and say the other build is not checked there', () => {
    const notChecked =
      'Whether this camera takes a different build, and runs it, has not been checked.';
    const pro = reportFor(
      stateFor(compact2016, {
        version: '1.0.3.0',
        slots: [slotState({ key: 'b', present: true, accepts: true })],
      }),
      buildSlotPlan(compact2016, '1.0.3.0'),
    );
    const image2016 = withVersion(imageOf(0x6000, 66), '1.0.3.2');
    image2016.set(hexToBytes(KEY_PAIRS.cp103.block0), 0x3000);
    image2016.set(hexToBytes(KEY_PAIRS.cp103.block1), 0x3100);
    const out2016 = prepareSlotFlash(pro, 'b', plain(image2016));
    expect(out2016.staging).toBe('slot-keystream-ciphertext');
    expect(out2016.imageBuild).toEqual({
      code: 'other-version',
      image: '1.0.3.2',
      camera: '1.0.3.0',
      text: `This image is firmware 1.0.3.2; the camera runs 1.0.3.0. ${notChecked}`,
    });

    const modernReport = reportFor(
      stateFor(modern, {
        version: '4.8.1.9',
        slots: [slotState({ key: 'b', present: true, accepts: true }), bootedWithApp()],
        keyA: KEY_A,
        keyB: KEY_B,
      }),
      buildSlotPlan(modern, '4.8.1.9'),
    );
    const imageKeyA = withVersion(imageOf(0x5000, 67), '4.8.1.7');
    imageKeyA.set(SRC_A, 0x4000);
    imageKeyA.set(SRC_B, 0x4020);
    const name = `img${keyFilenameSuffix(SRC_A, SRC_B)}.bin`;
    const outKeyA = prepareSlotFlash(modernReport, 'b', {
      kind: 'plain',
      bytes: imageKeyA,
      fileName: name,
    });
    expect(outKeyA.staging).toBe('key-a-ciphertext');
    expect(outKeyA.imageBuild?.text).toBe(
      `This image is firmware 4.8.1.7; the camera runs 4.8.1.9. ${notChecked}`,
    );
    expect(outKeyA.warnings[0]).toBe(outKeyA.imageBuild?.text);
    /* The same build under Key A: nothing. */
    const same = withVersion(imageOf(0x5000, 68), '4.8.1.9');
    same.set(SRC_A, 0x4000);
    same.set(SRC_B, 0x4020);
    expect(
      prepareSlotFlash(modernReport, 'b', { kind: 'plain', bytes: same, fileName: name })
        .imageBuild,
    ).toBeNull();
  });
});

describe('flashSlot gates', () => {
  const plan = buildSlotPlan(legacy, '1.3.0.0');
  const slots = (['a', 'b', 'r'] as const).map((k) =>
    slotState({ key: k, present: true, accepts: true }),
  );
  const image = imageOf(0x2000, 21);

  function built(booted: SlotKey | null = 'a'): { report: SlotsReport; payload: SlotFlashPlan } {
    const report = reportFor(stateFor(legacy, { version: '1.3.0.0', slots, booted }), plan);
    return {
      report,
      payload: prepareSlotFlash(report, 'b', { kind: 'plain', bytes: image, fileName: 'x' }),
    };
  }

  it('the booted bank is refused without acknowledgeRisk, with nothing sent', async () => {
    const rec = recordingDevice();
    const { report, payload } = built('b');
    const error = await flashSlot(ctxFor(rec.device, legacy), report, payload, {
      acknowledgeRisk: false,
    }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(SeekError);
    expect((error as SeekError).code).toBe('slots/refused');
    expect(sends(rec.calls)).toEqual([]);
  });

  it('recovery is refused without acknowledgeRisk, with nothing sent', async () => {
    const rec = recordingDevice();
    const { report } = built('a');
    const rPlan = prepareSlotFlash(report, 'r', { kind: 'plain', bytes: image, fileName: 'x' });
    await expect(
      flashSlot(ctxFor(rec.device, legacy), report, rPlan, { acknowledgeRisk: false }),
    ).rejects.toThrow(/acknowledgeRisk/);
    expect(sends(rec.calls)).toEqual([]);
  });

  it('a plan from another camera, or for another firmware, is refused with nothing sent', async () => {
    const rec = recordingDevice();
    const { report, payload } = built('a');
    const otherCamera: SlotFlashPlan = { ...payload, serial: 'SOMEONE-ELSE' };
    await expect(
      flashSlot(ctxFor(rec.device, legacy), report, otherCamera, { acknowledgeRisk: false }),
    ).rejects.toThrow(/another camera|camera SOMEONE-ELSE/);
    const otherFirmware: SlotFlashPlan = { ...payload, firmwareVersion: '4.8.2.1' };
    await expect(
      flashSlot(ctxFor(rec.device, legacy), report, otherFirmware, { acknowledgeRisk: false }),
    ).rejects.toThrow(/stale/);
    expect(sends(rec.calls)).toEqual([]);
  });

  it('a payload edited after it was planned is refused, and so is a target at another address', async () => {
    const rec = recordingDevice();
    const { report, payload } = built('a');
    const edited: SlotFlashPlan = {
      ...payload,
      payload: payload.payload.slice(),
      sum16: (payload.sum16 + 1) & 0xffff,
    };
    await expect(
      flashSlot(ctxFor(rec.device, legacy), report, edited, { acknowledgeRisk: false }),
    ).rejects.toThrow(/edited/);
    const moved: SlotFlashPlan = { ...payload, address: 0x14040000 };
    await expect(
      flashSlot(ctxFor(rec.device, legacy), report, moved, { acknowledgeRisk: false }),
    ).rejects.toThrow(/targets/);
    expect(sends(rec.calls)).toEqual([]);
  });

  it('a non-booted bank is written: arm the plan window, stage in 64-byte chunks, commit the u16 sum, read back', async () => {
    const { report, payload } = built('a');
    const rec = recordingDevice(payload.expectedStored!);
    const result = await flashSlot(ctxFor(rec.device, legacy), report, payload, {
      acknowledgeRisk: false,
    });
    const ops = sends(rec.calls);
    expect(ops[0]).toBe('arm');
    expect(rec.calls[0]?.arg).toBe(report.plan.slots.find((s) => s.key === 'b')?.write?.subcmd);
    const stages = rec.calls.filter((c) => c.op === 'stage').map((c) => c.arg as number);
    expect(stages.every((n) => n <= 64)).toBe(true);
    expect(stages.reduce((a, b) => a + b, 0)).toBe(payload.payload.length);
    expect(ops[ops.length - 2]).toBe('commit');
    expect(rec.calls.find((c) => c.op === 'commit')?.arg).toBe(payload.sum16);
    expect(ops[ops.length - 1]).toBe('read');
    expect(result.commitStatus).toBe(0);
    expect(result.verified).toBe(true);
  });

  it('logs the staging form in words, and ends on "Written." with no replug or re-read of its own (TESTING.md 42.87)', async () => {
    const { report, payload } = built('a');
    const rec = recordingDevice(payload.expectedStored!);
    const logs: string[] = [];
    const progress: string[] = [];
    const reporter = {
      ...silentReporter,
      log: (message: string) => {
        logs.push(message);
      },
      progress: (_done: number, _total: number, text?: string) => {
        if (text !== undefined) progress.push(text);
      },
    };
    const result = await flashSlot({ ...ctxFor(rec.device, legacy), reporter }, report, payload, {
      acknowledgeRisk: false,
    });
    expect(logs).toContain(
      `Slot B: writing ${String(payload.payload.length)} B from the decrypted image, staged plain — ` +
        `checksum 0x${payload.sum16.toString(16).toUpperCase().padStart(4, '0')}`,
    );
    expect(result.notes[0]).toBe(
      `committed ${String(payload.payload.length)} B to Slot B at 0x14060000, staged plain; commit status 0x0`,
    );
    expect(progress.at(-1)).toBe('Written.');
    const said = [...logs, ...progress, ...result.notes].join('\n');
    expect(said).not.toMatch(/replug|device info|plain-chain|'plain'|\(plain\)/i);
  });

  it('verify off: nothing is read back and no comparison is claimed', async () => {
    const rec = recordingDevice();
    const { report, payload } = built('a');
    const result = await flashSlot(ctxFor(rec.device, legacy), report, payload, {
      acknowledgeRisk: false,
      verify: false,
    });
    expect(sends(rec.calls)).not.toContain('read');
    expect(result.verified).toBeNull();
    expect(result.after).toBeNull();
  });

  it('a read-back that matches the predicted bytes verifies; one that does not, does not', async () => {
    const { report, payload } = built('a');
    const expected = payload.expectedStored!;
    const good = await flashSlot(
      ctxFor(recordingDevice(expected).device, legacy),
      report,
      payload,
      { acknowledgeRisk: false },
    );
    expect(good.verified).toBe(true);
    const wrong = expected.slice();
    wrong[7] = (wrong[7] ?? 0) ^ 0xff;
    const bad = await flashSlot(ctxFor(recordingDevice(wrong).device, legacy), report, payload, {
      acknowledgeRisk: false,
    });
    expect(bad.verified).toBe(false);
    expect(bad.notes.join('\n')).toContain('does NOT match');
    expect(sha256Sync(expected)).toHaveLength(64);
  });

  it('a status word after staging stops the write before the commit, and says so', async () => {
    const rec = recordingDevice();
    let polls = 0;
    (rec.device as unknown as { getErrorCode: () => Promise<number> }).getErrorCode = () => {
      polls++;
      return Promise.resolve(polls > 3 ? 0x31 : 0);
    };
    const { report, payload } = built('a');
    const error = await flashSlot(ctxFor(rec.device, legacy), report, payload, {
      acknowledgeRisk: false,
    }).catch((e: unknown) => e);
    expect((error as SeekError).code).toBe('slots/refused');
    expect(sends(rec.calls)).not.toContain('commit');
  });
});

/* ==================================================================== *
 * The 1.3.0.8 FF (16 Hz) image: the vendor staged form, to A, B or R (TESTING.md 42.12).
 * The running build is unknown here (no bank bytes are read in these fixtures), so each plan
 * warns which outcome follows from which build; the camera's own answers that decide it are
 * tested in running.test.ts.
 * ==================================================================== */

describe('the 1.3.0.8 FF image on the slot writer', () => {
  const FF_OFFSET = 0x238;
  const plan = buildSlotPlan(legacy, '1.3.0.8');
  const slots = (['a', 'b', 'r'] as const).map((k) =>
    slotState({ key: k, present: true, accepts: true }),
  );
  /** A synthetic FF image: the real key pair once each, word 142 solved to a plain sum of 0xFFFF. */
  function ffImage(): Uint8Array {
    const out = imageOf(0x6000, 71);
    out.set(hexToBytes(KEY_PAIRS.ff1308.block0), 0x3000);
    out.set(hexToBytes(KEY_PAIRS.ff1308.block1), 0x3100);
    const dv = new DataView(out.buffer);
    dv.setUint32(FF_OFFSET, 0, true);
    dv.setUint32(FF_OFFSET, (0xffff - wordSum32(out, out.length)) >>> 0, true);
    return out;
  }

  function reportOn(version = '1.3.0.8'): SlotsReport {
    return reportFor(
      stateFor(legacy, { version, slots, booted: null }),
      version === '1.3.0.8' ? plan : buildSlotPlan(legacy, version),
    );
  }

  const input = (bytes: Uint8Array, kind: 'plain' | 'raw' = 'plain') => ({
    kind,
    bytes,
    fileName: 'ff.bin',
  });

  it('is staged in the vendor form for A, B and R alike, with the stored bytes predicted', () => {
    const image = ffImage();
    const staged = stageFFVendor(image);
    for (const key of ['a', 'b', 'r'] as const) {
      const out = prepareSlotFlash(reportOn(), key, input(image));
      expect(out.staging).toBe('key-a-keystream');
      expect(out.storedForm).toBe('key-b-ciphertext');
      expect(out.ffCommit).toBe('build-unknown');
      expect(out.key).toBe(key);
      expect(equalBytes(out.payload, staged.staged)).toBe(true);
      expect(out.expectedStored?.length).toBe(SLOT_BYTES);
      expect(equalBytes(out.expectedStored!.subarray(0, 0x6000), staged.stored)).toBe(true);
      expect(out.expectedStored![0x6000]).toBe(0xff);
      expect(equalBytes(out.expectedPlain!, image)).toBe(true);
    }
  });

  it('the payload is the image XOR Key A, and the app’s gate on it, sum(payload XOR Key A), is 0xFFFF', () => {
    const out = prepareSlotFlash(reportOn(), 'r', input(ffImage()));
    const ks0 = keystream(keyWordsOf(KEY_PAIRS.ff1308.block0), 0x6000 >>> 2);
    expect(wordSum32(xorWindowVerbatim(out.payload, ks0), 0x6000)).toBe(0xffff);
    expect(out.payload.length).toBe(0x6000);
    expect(out.sum16).toBe(transferSum16(out.payload));
  });

  it('says what it does once: the staging row the vendor form and Key B, the boot untested and each build’s outcome (warnings)', () => {
    const out = prepareSlotFlash(reportOn(), 'a', input(ffImage()));
    const text = out.warnings.join('\n');
    const notes = out.notes
      .filter((note) => note.source === 'write')
      .map((note) => note.text)
      .join('\n');
    /* The plan's staging row says the vendor form and what the camera stores; no note says it again
     * (TESTING.md 42.89: it was said in the row and in a note). */
    expect(out.staging).toBe('key-a-keystream');
    expect(out.storedForm).toBe('key-b-ciphertext');
    expect(stagingDetail(out.staging)).toBe(
      'the 1.3.0.8 FF image as the vendor app stages it (XOR Key A) — the 16 Hz build stores it under Key B, not these bytes',
    );
    expect(notes).not.toMatch(/vendor app/);
    expect(notes).not.toMatch(/block 0 \(Key A\)/);
    expect(text).toMatch(/UNTESTED/);
    expect(text).toMatch(
      /0\.9\.0\.0 bootloader an earlier form of this image started from recovery R/,
    );
    expect(text).toMatch(/Nothing here claims the camera starts it\./);
    /* In words: no section a person cannot follow, no corpus, no key or status names (TESTING.md 42.110). */
    expect(text).not.toMatch(/TESTING|corpus|0x00070100|XOR/);
    expect(text).toMatch(/do not say which 1\.3\.0\.8 build it runs/);
    expect(text).toMatch(/If it runs the 16 Hz FF build, it takes this payload/);
    expect(text).not.toMatch(/The page does not claim/);
  });

  it('the 8 Hz image is unchanged: plain staging into A, B and R alike, with no running question', () => {
    const eight = imageOf(0x6000, 72);
    for (const key of ['a', 'b', 'r'] as const) {
      const out = prepareSlotFlash(reportOn(), key, input(eight));
      expect(out.staging).toBe('plain');
      expect(out.storedForm).toBeUndefined();
      expect(out.ffCommit).toBeUndefined();
      expect(wordSum32(out.payload, out.payload.length)).toBe(0);
    }
  });

  it('an FF image for a camera on another version is planned: the camera programs the payload as sent (never refused)', () => {
    const out = prepareSlotFlash(reportOn('1.3.0.0'), 'r', input(ffImage()));
    expect(out.ffCommit).toBe('programs-as-sent');
    expect(out.staging).toBe('key-a-keystream');
    const text = out.warnings.join('\n');
    /* The synthetic image's version word is arbitrary: the version warning says the fact alone, then this. */
    expect(out.warnings[0]).toMatch(
      /^This image is firmware [0-9.]+; the camera runs 1\.3\.0\.0\.$/,
    );
    expect(text).toMatch(/This camera writes a bank without checking the image/);
    expect(text).toMatch(/expected to write the bytes as they are sent/);
    expect(text).toMatch(/the image in a form this camera cannot start/);
    expect(text).not.toMatch(/0x00070100|XOR|Key A|TESTING/);
    /* What the bank holds afterwards is the payload as sent, not the 16 Hz build's Key B form (TESTING.md 42.109). */
    expect(out.storedForm).toBeUndefined();
    expect(JSON.stringify(out.compare)).toContain(
      'as sent (the camera writes the bytes as they arrive, in a form it cannot start)',
    );
    expect(equalBytes(out.expectedStored!.subarray(0, out.payload.length), out.payload)).toBe(true);
  });

  it('a previously written FF bank is staged again to the same bytes', () => {
    const first = prepareSlotFlash(reportOn(), 'b', input(ffImage()));
    const second = prepareSlotFlash(reportOn(), 'b', input(first.expectedPlain!));
    expect(equalBytes(second.payload, first.payload)).toBe(true);
    expect(equalBytes(second.expectedStored!, first.expectedStored!)).toBe(true);
  });

  it('raw: the vendor payload is sent as given, and the bank is predicted as the Key B image it holds', () => {
    const staged = prepareSlotFlash(reportOn(), 'a', input(ffImage()));
    const raw = prepareSlotFlash(reportOn(), 'a', input(staged.payload, 'raw'));
    expect(raw.staging).toBe('verbatim');
    expect(equalBytes(raw.payload, staged.payload)).toBe(true);
    expect(raw.storedForm).toBe('key-b-ciphertext');
    expect(equalBytes(raw.expectedPlain!, staged.expectedPlain!)).toBe(true);
    expect(equalBytes(raw.expectedStored!, staged.expectedStored!)).toBe(true);
    /* the raw FF form is said once, in its own note: the staging row says only "sent as given" */
    expect(
      raw.notes.filter((note) => note.source === 'write' && note.text.includes('FF staged form')),
    ).toHaveLength(1);
    expect(
      raw.notes.some((note) => note.source === 'write' && note.text.includes('vendor app')),
    ).toBe(false);
    /* No 2014 sum-0 complaint: the FF form is judged by its own gate. */
    expect(raw.warnings.some((w) => w.includes('the 2014 bootloader needs 0'))).toBe(false);
  });

  it('raw: a plain (non-FF) payload is still judged by the 2014 chain', () => {
    const other = prepareSlotFlash(reportOn(), 'a', input(imageOf(0x6000, 73), 'raw'));
    expect(other.storedForm).toBeUndefined();
    expect(other.warnings.some((w) => w.includes('the 2014 bootloader needs 0'))).toBe(true);
  });

  describe('flashSlot', () => {
    const ack = { acknowledgeRisk: true };

    function readyPlan(key: SlotKey): { report: SlotsReport; flash: SlotFlashPlan } {
      const report = reportOn();
      return { report, flash: prepareSlotFlash(report, key, input(ffImage())) };
    }

    it.each([
      ['a', 7],
      ['b', 8],
      ['r', 9],
    ] as const)(
      'writes bank %s: arm mode %i, stage the vendor payload, commit its sum, read back the Key B image',
      async (key, mode) => {
        const { report, flash } = readyPlan(key);
        const rec = recordingDevice(flash.expectedStored!);
        const result = await flashSlot(ctxFor(rec.device, legacy), report, flash, ack);
        const ops = sends(rec.calls);
        expect(ops[0]).toBe('arm');
        expect(rec.calls[0]?.arg).toBe(mode);
        const staged = rec.calls.filter((c) => c.op === 'stage').map((c) => c.arg as number);
        expect(staged.reduce((a, b) => a + b, 0)).toBe(flash.payload.length);
        expect(rec.calls.find((c) => c.op === 'commit')?.arg).toBe(flash.sum16);
        expect(result.commitStatus).toBe(0);
        expect(result.verified).toBe(true);
        expect(result.notes.join('\n')).toMatch(
          /holds the image as the 16 Hz build stores it \(not the bytes sent\)/,
        );
      },
    );

    it('needs acknowledgeRisk for recovery R, like every recovery write, and sends nothing without it', async () => {
      const { report, flash } = readyPlan('r');
      const rec = recordingDevice();
      await expect(
        flashSlot(ctxFor(rec.device, legacy), report, flash, { acknowledgeRisk: false }),
      ).rejects.toThrow(/acknowledgeRisk/);
      expect(sends(rec.calls)).toEqual([]);
    });

    it('a bank that holds the payload as sent instead of the Key B image is NOT verified', async () => {
      const { report, flash } = readyPlan('b');
      /* A camera that stored the payload as sent (no re-key) would leave these bytes. */
      const asSent = new Uint8Array(SLOT_BYTES).fill(0xff);
      asSent.set(flash.payload, 0);
      const result = await flashSlot(
        ctxFor(recordingDevice(asSent).device, legacy),
        report,
        flash,
        ack,
      );
      expect(result.verified).toBe(false);
      expect(result.notes.join('\n')).toMatch(
        /does NOT match the bytes the plan predicted the bank would hold \(the image as the 16 Hz build stores it/,
      );
    });

    it('a plan retargeted at another bank address is refused with nothing sent', async () => {
      const { report, flash } = readyPlan('a');
      const entry = report.plan.slots.find((s) => s.key === 'r')!;
      const rec = recordingDevice();
      const moved: SlotFlashPlan = { ...flash, key: 'r', address: entry.address + 0x10000 };
      await expect(
        flashSlot(ctxFor(rec.device, legacy), report, moved, { acknowledgeRisk: true }),
      ).rejects.toThrow(/the plan targets/);
      expect(sends(rec.calls)).toEqual([]);
    });
  });
});

describe('the 1.3.0.8 notes say the FF image goes to A, B and R in its vendor form', () => {
  it('the plan note and the bank notes state it, on the 1.3.0.8 plan and not on 1.3.0.0', () => {
    const plan = buildSlotPlan(legacy, '1.3.0.8');
    const planText = plan.notes.join('\n');
    expect(planText).toMatch(/UNTESTED/);
    expect(planText).toMatch(/the camera stores it under its own key/);
    expect(planText).not.toMatch(/refuses it for A and B/);
    const byKey = Object.fromEntries(plan.slots.map((s) => [s.key, s.notes.join('\n')]));
    for (const key of ['a', 'b', 'r'] as const) {
      expect(byKey[key]).toMatch(
        /in the form the vendor app sends it, and the camera stores it under its own key/,
      );
      expect(byKey[key]).not.toMatch(/Key B|TESTING|mode \d|token form/);
    }
    const old = buildSlotPlan(legacy, '1.3.0.0');
    expect(old.slots.map((s) => s.notes.join('\n')).join('\n')).not.toMatch(/FF \(16 Hz\)/);
  });
});
