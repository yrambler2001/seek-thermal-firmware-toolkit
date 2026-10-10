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

import { equalBytes } from '../../src/bytes.js';
import { silentReporter } from '../../src/events.js';
import { SeekError } from '../../src/errors.js';
import { cryptBytes } from '../../src/crypto/cipher.js';
import { keyFilenameSuffix, stateFromKey } from '../../src/crypto/keys.js';
import { IMAGE_MAGIC, LENGTH_OFFSET, parseImageHeader, FOOTER_TAG } from '../../src/image/header.js';
import { wordSum32, transferSum16 } from '../../src/image/bank.js';
import { getProfile } from '../../src/profiles/registry.js';
import type { FirmwareProfile, WindowEntry } from '../../src/profiles/types.js';
import type { SeekDevice } from '../../src/protocol/client.js';
import type { DeviceState, SlotState, WorkflowContext } from '../../src/workflows/types.js';
import { prepareSlotFlash, flashSlot } from '../../src/slots/write.js';
import { planFor, reportFor } from './write-fixtures.js';
import { sha256Sync } from '../../src/slots/write-sha.js';
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

const modern = getProfile('modern-4x');
const legacy = getProfile('legacy-auth');

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
  } as SlotState;
}

/** A DeviceState carrying only what the writer reads. The rest is never touched. */
function stateFor(
  profile: FirmwareProfile,
  options: {
    version?: string | null;
    serial?: string | null;
    booted?: SlotKey | null;
    slots?: readonly SlotState[];
    canFlash?: boolean;
    keyA?: Uint8Array | null;
    keyB?: Uint8Array | null;
  } = {},
): DeviceState {
  const slots = options.slots ?? [];
  const byKey = new Map(slots.map((s) => [s.key, s]));
  const booted = options.booted === undefined ? 'a' : options.booted;
  const keyA = options.keyA === undefined ? null : options.keyA;
  const keyB = options.keyB === undefined ? null : options.keyB;
  return {
    version: options.version === undefined ? '4.8.1.9' : options.version,
    serial: options.serial === undefined ? 'TESTSERIAL' : options.serial,
    profile,
    slots,
    byKey,
    boot: booted === null ? null : { booted, target: booted === 'a' ? 'b' : 'a' },
    keyTable: keyA && keyB ? ({ keyA, keyB } as unknown as DeviceState['keyTable']) : null,
    keyWhiteningK: profile.cipher.whiteningK,
    canFlash: options.canFlash ?? true,
    flashBlockedBy: [],
    plainChain: false,
  } as unknown as DeviceState;
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
    transport: { isOpen: true, open: async () => undefined, info: { recipientFallback: null } },
    armWindow: async (entry: WindowEntry) => {
      calls.push({ op: 'arm', arg: entry.subcmd });
    },
    setFeaturedFirmwareData: async (data: Uint8Array) => {
      calls.push({ op: 'stage', arg: data.length });
    },
    getErrorCode: async () => {
      calls.push({ op: 'status' });
      return 0;
    },
    completeMemoryUpgrade: async (sum: number) => {
      calls.push({ op: 'commit', arg: sum });
    },
    readWindow: async () => {
      calls.push({ op: 'read' });
      return { data: readStored, stoppedAt: readStored.length, stopReason: null, chunkUsed: 64 };
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
  const plan = planFor(modern, version, 'key-a-ciphertext');
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
    expect(() => prepareSlotFlash(report, 'b', { kind: 'raw', bytes: image, fileName: 'x' })).toThrow(
      /no slot 'b'/,
    );
  });

  it('an unread slot is refused, and so is a slot the read did not find', () => {
    const unread = slotState({ key: 'b', unread: true, present: false });
    const report = reportFor(stateFor(modern, { version, slots: [unread] }), plan);
    expect(refusalOf(() => prepareSlotFlash(report, 'b', { kind: 'raw', bytes: image, fileName: 'x' })).message).toContain(
      'was not read',
    );
    const absent = reportFor(stateFor(modern, { version, slots: [] }), plan);
    expect(() => prepareSlotFlash(absent, 'b', { kind: 'raw', bytes: image, fileName: 'x' })).toThrow(
      /was not read/,
    );
  });

  it('a build with no write window, a subcommand 0 window, or a window below the bank area is refused', () => {
    const state = stateFor(modern, { version, slots: [slotState({ key: 'b', present: true })] });
    const noWrite = {
      ...plan,
      slots: plan.slots.map((s) => (s.key === 'b' ? { ...s, write: null } : s)),
    };
    expect(() => prepareSlotFlash(reportFor(state, noWrite), 'b', { kind: 'raw', bytes: image, fileName: 'x' })).toThrow(
      /no write window/,
    );
    const selector0 = {
      ...plan,
      slots: plan.slots.map((s) =>
        s.key === 'b' ? { ...s, write: { subcmd: 0, address: 0x14050000, note: 'selector' } } : s,
      ),
    };
    expect(() => prepareSlotFlash(reportFor(state, selector0), 'b', { kind: 'raw', bytes: image, fileName: 'x' })).toThrow(
      /subcommand 0/,
    );
    const bootloader = {
      ...plan,
      slots: plan.slots.map((s) =>
        s.key === 'b' ? { ...s, write: { subcmd: 2, address: 0x14000000, note: 'SPIFI' } } : s,
      ),
    };
    expect(() => prepareSlotFlash(reportFor(state, bootloader), 'b', { kind: 'raw', bytes: image, fileName: 'x' })).toThrow(
      /not a bank/,
    );
  });

  it('a commit that also rewrites the boot configuration is refused', () => {
    const state = stateFor(modern, { version, slots: [slotState({ key: 'b', present: true })] });
    const effect = {
      ...plan,
      slots: plan.slots.map((s) => (s.key === 'b' ? { ...s, commitEffect: 'bank-and-boot-config' as const } : s)),
    };
    expect(() => prepareSlotFlash(reportFor(state, effect), 'b', { kind: 'raw', bytes: image, fileName: 'x' })).toThrow(
      /boot configuration/,
    );
  });

  it('an empty input, and a raw payload longer than its bank, are refused', () => {
    const state = stateFor(modern, { version, slots: [slotState({ key: 'b', present: true })] });
    const report = reportFor(state, plan);
    expect(() => prepareSlotFlash(report, 'b', { kind: 'raw', bytes: new Uint8Array(0), fileName: 'x' })).toThrow(
      /empty/,
    );
    const long = new Uint8Array(SLOT_BYTES + 4);
    expect(() => prepareSlotFlash(report, 'b', { kind: 'raw', bytes: long, fileName: 'x' })).toThrow(
      /longer than the/,
    );
  });

  it('a raw entry the build cannot take is refused', () => {
    const state = stateFor(modern, { version, slots: [slotState({ key: 'b', present: true })] });
    const noRaw = { ...plan, slots: plan.slots.map((s) => (s.key === 'b' ? { ...s, flashRaw: { supported: false as const, reason: 'no raw path' } } : s)) };
    expect(() => prepareSlotFlash(reportFor(state, noRaw), 'b', { kind: 'raw', bytes: image, fileName: 'x' })).toThrow(
      /no raw path/,
    );
  });

  it('a malformed decrypted image is refused by the existing image checks', () => {
    const state = stateFor(modern, { version, slots: [slotState({ key: 'b', present: true })] });
    const report = reportFor(state, plan);
    const notAnImage = bytesOf(0x4000, 9);
    expect(() => prepareSlotFlash(report, 'b', { kind: 'plain', bytes: notAnImage, fileName: 'x' })).toThrow(
      /no image header/,
    );
    const odd = imageOf(0x4002, 2);
    expect(() => prepareSlotFlash(report, 'b', { kind: 'plain', bytes: odd, fileName: 'x' })).toThrow(
      /multiple of 4/,
    );
  });

  it('key-a staging needs the camera Key A, and a file name that names its keys', () => {
    const slot = slotState({ key: 'b', present: true, accepts: true });
    const noKeys = reportFor(stateFor(modern, { version, slots: [slot] }), plan);
    expect(() => prepareSlotFlash(noKeys, 'b', { kind: 'plain', bytes: image, fileName: 'x.bin' })).toThrow(
      /does not name this camera's Key A/,
    );
    const withKeys = reportFor(stateFor(modern, { version, slots: [slot], keyA: KEY_A, keyB: KEY_B }), plan);
    const error = refusalOf(() =>
      prepareSlotFlash(withKeys, 'b', { kind: 'plain', bytes: image, fileName: 'no-key-suffix.bin' }),
    );
    expect(error.code).toBe('slots/refused');
    expect(error.message).toContain('does not carry its key pair');
  });

  it('a camera that cannot be flashed from here refuses key-a staging with the reasons', () => {
    const slot = slotState({ key: 'b', present: true });
    const report = reportFor(
      stateFor(modern, { version, slots: [slot], keyA: KEY_A, keyB: KEY_B, canFlash: false }),
      plan,
    );
    const name = `img${keyFilenameSuffix(SRC_A, SRC_B)}.bin`;
    expect(() => prepareSlotFlash(report, 'b', { kind: 'plain', bytes: image, fileName: name })).toThrow(
      /cannot be written from here/,
    );
  });

  it('keystream staging needs the bank keystream, and the bank must be read', () => {
    const slotPlan = planFor(modern, version, 'slot-keystream-ciphertext');
    const report = reportFor(stateFor(modern, { version, slots: [slotState({ key: 'b', present: true })] }), slotPlan);
    expect(() => prepareSlotFlash(report, 'b', { kind: 'plain', bytes: image, fileName: 'x' })).toThrow(
      /keystream is not known/,
    );
  });

  it('a build with no staging form refuses a decrypted image', () => {
    const noStaging = planFor(modern, version, null);
    const report = reportFor(stateFor(modern, { version, slots: [slotState({ key: 'b', present: true })] }), noStaging);
    expect(() => prepareSlotFlash(report, 'b', { kind: 'plain', bytes: image, fileName: 'x' })).toThrow(
      /no staging form/,
    );
  });
});

/* ==================================================================== *
 * prepareSlotFlash: the three staging forms, and their bytes
 * ==================================================================== */

describe('prepareSlotFlash builds each staging form', () => {
  it('plain (2014 chain): length stamped, stored word sum 0, the bank holds the payload then erased', () => {
    const plan = planFor(legacy, '1.3.0.0', 'plain');
    const slot = slotState({ key: 'a', present: true, accepts: true, recovered: null });
    const report = reportFor(stateFor(legacy, { version: '1.3.0.0', slots: [slot] }), plan);
    const image = imageOf(0x9000, 3);
    const out = prepareSlotFlash(report, 'a', { kind: 'plain', bytes: image, fileName: 'chain.bin' });
    expect(out.staging).toBe('plain');
    expect(out.payload.length).toBe(0x9000);
    expect(wordSum32(out.payload, out.payload.length)).toBe(0);
    expect(parseImageHeader(out.payload)?.length).toBe(0x9000);
    expect(out.expectedStored?.length).toBe(SLOT_BYTES);
    expect(equalBytes(out.expectedStored!.subarray(0, 0x9000), out.payload)).toBe(true);
    expect(out.expectedStored![0x9000]).toBe(0xff);
    expect(out.sum16).toBe(transferSum16(out.payload));
  });

  it('slot keystream (2016 line): the payload is the image XOR the bank keystream, and decrypts to a zero sum', () => {
    const plan = planFor(legacy, '1.0.3.0', 'slot-keystream-ciphertext');
    const keystreamState = Uint32Array.of(0x12345678, 0x9abcdef0, 0x0badc0de, 0x13572468);
    const slot = slotState({
      key: 'a',
      present: true,
      accepts: true,
      recovered: { state: keystreamState } as unknown as SlotState['recovered'],
    });
    const report = reportFor(stateFor(legacy, { version: '1.0.3.0', slots: [slot] }), plan);
    const image = imageOf(0x6000, 4);
    const out = prepareSlotFlash(report, 'a', { kind: 'plain', bytes: image, fileName: 'x' });
    expect(out.staging).toBe('slot-keystream-ciphertext');
    /* Decrypting the staged bytes with the bank's keystream gives the stamped image back,
     * and that image's decrypted word sum is the family's acceptance target. */
    const decrypted = cryptBytes(out.payload, keystreamState, legacy.cipher);
    expect(wordSum32(decrypted, decrypted.length)).toBe(legacy.cipher.acceptanceSum);
    expect(parseImageHeader(decrypted)?.length).toBe(0x6000);
    /* The header window is verbatim: the cleartext adjust word carries the balance. */
    expect(parseImageHeader(out.payload)?.length).toBe(0x6000);
  });

  it('key-a (2017+): the image is retargeted to this camera, footered, and encrypted under its Key A', () => {
    const plan = planFor(modern, '4.8.1.9', 'key-a-ciphertext');
    const slot = slotState({ key: 'b', present: true, accepts: true });
    const report = reportFor(stateFor(modern, { version: '4.8.1.9', slots: [slot], keyA: KEY_A, keyB: KEY_B }), plan);
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
    expect(new DataView(out.payload.buffer, out.payload.byteOffset).getUint32(footerAt, true)).toBe(FOOTER_TAG);
    /* Decrypted under this camera's Key A, the payload is the retargeted image. */
    const decrypted = cryptBytes(out.payload.subarray(0, length), stateFromKey(KEY_A, modern.cipher.whiteningK), modern.cipher);
    expect(wordSum32(decrypted, length)).toBe(modern.cipher.acceptanceSum);
    expect(equalBytes(decrypted.subarray(0x4000, 0x4010), KEY_A)).toBe(true);
    expect(equalBytes(decrypted.subarray(0x4020, 0x4030), KEY_B)).toBe(true);
  });

  it('raw: sent verbatim, and the bootloader checks it would fail are warned, not refused', () => {
    const plan = planFor(modern, '4.8.1.9', 'key-a-ciphertext');
    const slot = slotState({ key: 'b', present: true, accepts: true });
    const report = reportFor(stateFor(modern, { version: '4.8.1.9', slots: [slot] }), plan);
    /* An image with a header but no footer: the bootloader's own footer check fails. */
    const bytes = imageOf(0x3000, 7);
    const out = prepareSlotFlash(report, 'b', { kind: 'raw', bytes, fileName: 'raw.bin' });
    expect(out.staging).toBe('verbatim');
    expect(equalBytes(out.payload, bytes)).toBe(true);
    expect(out.payload).not.toBe(bytes);
    expect(out.warnings.some((w) => w.includes('sent exactly as given'))).toBe(true);
    expect(out.warnings.some((w) => w.includes('would reject this payload') && w.includes('no footer at'))).toBe(true);
    expect(out.expectedStored?.length).toBe(SLOT_BYTES);
  });
});

/* ==================================================================== *
 * prepareSlotFlash: warnings for the booted bank, recovery and notes
 * ==================================================================== */

describe('prepareSlotFlash warnings', () => {
  it('names the booted bank, recovery, and an unnamed boot, and carries the build notes', () => {
    const plan = planFor(modern, '4.8.1.9', 'plain');
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
    expect(outA.warnings.some((w) => w.includes('bank A is the bank the camera boots now'))).toBe(true);
    expect(outA.warnings.some((w) => w === 'Note: build note one')).toBe(true);

    const recovery = reportFor(stateFor(modern, { slots, booted: 'a' }), withNotes);
    const outR = prepareSlotFlash(recovery, 'r', { kind: 'raw', bytes: image, fileName: 'x' });
    expect(outR.warnings.some((w) => w.includes('Recovery bank R'))).toBe(true);
    expect(outR.warnings.some((w) => w === 'Note: recovery-only note')).toBe(true);

    const unnamed = reportFor(stateFor(modern, { slots, booted: null }), withNotes);
    const outB = prepareSlotFlash(unnamed, 'b', { kind: 'raw', bytes: image, fileName: 'x' });
    expect(outB.warnings.some((w) => w.includes('could not be named'))).toBe(true);
  });
});

/* ==================================================================== *
 * flashSlot: the gates, the sequence, and the read-back
 * ==================================================================== */

describe('flashSlot gates', () => {
  const plan = planFor(modern, '4.8.1.9', 'plain');
  const slots = (['a', 'b', 'r'] as const).map((k) => slotState({ key: k, present: true, accepts: true }));
  const image = imageOf(0x2000, 21);

  function built(booted: SlotKey | null = 'a'): { report: SlotsReport; payload: SlotFlashPlan } {
    const report = reportFor(stateFor(modern, { slots, booted }), plan);
    return { report, payload: prepareSlotFlash(report, 'b', { kind: 'plain', bytes: image, fileName: 'x' }) };
  }

  it('the booted bank is refused without acknowledgeRisk, with nothing sent', async () => {
    const rec = recordingDevice();
    const { report, payload } = built('b');
    const error = await flashSlot(ctxFor(rec.device, modern), report, payload, { acknowledgeRisk: false }).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(SeekError);
    expect((error as SeekError).code).toBe('slots/refused');
    expect(sends(rec.calls)).toEqual([]);
  });

  it('recovery is refused without acknowledgeRisk, with nothing sent', async () => {
    const rec = recordingDevice();
    const { report } = built('a');
    const rPlan = prepareSlotFlash(report, 'r', { kind: 'plain', bytes: image, fileName: 'x' });
    await expect(flashSlot(ctxFor(rec.device, modern), report, rPlan, { acknowledgeRisk: false })).rejects.toThrow(/acknowledgeRisk/);
    expect(sends(rec.calls)).toEqual([]);
  });

  it('a plan from another camera, or for another firmware, is refused with nothing sent', async () => {
    const rec = recordingDevice();
    const { report, payload } = built('a');
    const otherCamera: SlotFlashPlan = { ...payload, serial: 'SOMEONE-ELSE' };
    await expect(flashSlot(ctxFor(rec.device, modern), report, otherCamera, { acknowledgeRisk: false })).rejects.toThrow(/another camera|camera SOMEONE-ELSE/);
    const otherFirmware: SlotFlashPlan = { ...payload, firmwareVersion: '4.8.2.1' };
    await expect(flashSlot(ctxFor(rec.device, modern), report, otherFirmware, { acknowledgeRisk: false })).rejects.toThrow(/stale/);
    expect(sends(rec.calls)).toEqual([]);
  });

  it('a payload edited after it was planned is refused, and so is a target at another address', async () => {
    const rec = recordingDevice();
    const { report, payload } = built('a');
    const edited: SlotFlashPlan = { ...payload, payload: payload.payload.slice(), sum16: (payload.sum16 + 1) & 0xffff };
    await expect(flashSlot(ctxFor(rec.device, modern), report, edited, { acknowledgeRisk: false })).rejects.toThrow(/edited/);
    const moved: SlotFlashPlan = { ...payload, address: 0x14040000 };
    await expect(flashSlot(ctxFor(rec.device, modern), report, moved, { acknowledgeRisk: false })).rejects.toThrow(/targets/);
    expect(sends(rec.calls)).toEqual([]);
  });

  it('a non-booted bank is written: arm the plan window, stage in 64-byte chunks, commit the u16 sum, read back', async () => {
    const { report, payload } = built('a');
    const rec = recordingDevice(payload.expectedStored!);
    const result = await flashSlot(ctxFor(rec.device, modern), report, payload, { acknowledgeRisk: false });
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

  it('verify off: nothing is read back and no comparison is claimed', async () => {
    const rec = recordingDevice();
    const { report, payload } = built('a');
    const result = await flashSlot(ctxFor(rec.device, modern), report, payload, { acknowledgeRisk: false, verify: false });
    expect(sends(rec.calls)).not.toContain('read');
    expect(result.verified).toBeNull();
    expect(result.after).toBeNull();
  });

  it('a read-back that matches the predicted bytes verifies; one that does not, does not', async () => {
    const { report, payload } = built('a');
    const expected = payload.expectedStored!;
    const good = await flashSlot(ctxFor(recordingDevice(expected).device, modern), report, payload, { acknowledgeRisk: false });
    expect(good.verified).toBe(true);
    const wrong = expected.slice();
    wrong[7] = (wrong[7] ?? 0) ^ 0xff;
    const bad = await flashSlot(ctxFor(recordingDevice(wrong).device, modern), report, payload, { acknowledgeRisk: false });
    expect(bad.verified).toBe(false);
    expect(bad.notes.join('\n')).toContain('does NOT match');
    expect(sha256Sync(expected)).toHaveLength(64);
  });

  it('a status word after staging stops the write before the commit, and says so', async () => {
    const rec = recordingDevice();
    let polls = 0;
    (rec.device as unknown as { getErrorCode: () => Promise<number> }).getErrorCode = async () => {
      polls++;
      return polls > 3 ? 0x31 : 0;
    };
    const { report, payload } = built('a');
    const error = await flashSlot(ctxFor(rec.device, modern), report, payload, { acknowledgeRisk: false }).catch((e: unknown) => e);
    expect((error as SeekError).code).toBe('slots/refused');
    expect(sends(rec.calls)).not.toContain('commit');
  });
});
