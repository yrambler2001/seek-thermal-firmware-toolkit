/* ==================================================================== *
 * Which application the camera runs on the 2014 plaintext chain
 * (`runningApplicationOf`), decided from the banks alone, with no camera.
 *
 * The rule under test is the 2014 bootloader's, as measured on the bench (TESTING.md 42.10):
 * a bank is taken only when its stored word sum is 0; A is tried, then B, then recovery R,
 * which runs whatever it holds; cfg[0] is 0. Every fixture is synthetic, and the FF image is
 * built by the writer's own `buildFFPayload`, so its stored form is the one the bank holds.
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { hexToBytes } from '../../src/bytes.js';
import { wordSum32 } from '../../src/image/bank.js';
import {
  IMAGE_MAGIC,
  LENGTH_OFFSET,
  parseImageHeader,
  type ImageHeader,
} from '../../src/image/header.js';
import { KEY_PAIRS, REBALANCE_WORD_OFFSET } from '../../src/preservation/patch.js';
import { getProfile } from '../../src/profiles/registry.js';
import { buildSlotPlan } from '../../src/slots/capability.js';
import { runningApplicationOf } from '../../src/slots/running.js';
import type { SlotKey } from '../../src/slots/types.js';
import { prepareSlotFlash } from '../../src/slots/write.js';
import { buildFFPayload } from '../../src/slots/write-image.js';
import type { DeviceState, SlotState } from '../../src/workflows/types.js';

import { reportFor } from './write-fixtures.js';

/** The header version word of 1.3.0.8: low byte first (header.ts versionString). */
const VERSION_1308 = 0x08000301;
const VERSION_OFFSET = 0x200 + 12;

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

/** A plain 8 Hz image: header stamped, the stored word sum balanced to 0 at 0x238 after the header is set. */
function plainImage(length: number, seed: number, version = VERSION_1308): Uint8Array {
  const next = prng(seed);
  const out = new Uint8Array(length);
  for (let i = 0; i < length; i++) out[i] = next();
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x10001000, true);
  dv.setUint32(4, 0x10000101, true);
  dv.setUint32(0x200, IMAGE_MAGIC, true);
  dv.setUint32(LENGTH_OFFSET, length, true);
  dv.setUint32(VERSION_OFFSET, version, true);
  dv.setUint32(REBALANCE_WORD_OFFSET, 0, true);
  dv.setUint32(REBALANCE_WORD_OFFSET, (0 - wordSum32(out, length)) >>> 0, true);
  return out;
}

/** The 16 Hz FF image as the bank stores it: the writer's own stamped form, with its key pair. */
function ffStoredImage(length: number, seed: number): Uint8Array {
  const next = prng(seed);
  const out = new Uint8Array(length);
  for (let i = 0; i < length; i++) out[i] = next();
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x10001000, true);
  dv.setUint32(4, 0x10000101, true);
  dv.setUint32(0x200, IMAGE_MAGIC, true);
  dv.setUint32(LENGTH_OFFSET, length, true);
  dv.setUint32(VERSION_OFFSET, VERSION_1308, true);
  out.set(hexToBytes(KEY_PAIRS.ff1308.block0), 0x3000);
  out.set(hexToBytes(KEY_PAIRS.ff1308.block1), 0x3100);
  return buildFFPayload(out).stamped;
}

const BANK = 0x10000;

/** A bank as the analysis reads it: the image at the front, 0xFF after it, its header parsed. */
function presentBank(
  key: SlotKey,
  image: Uint8Array,
  overrides: Partial<SlotState> = {},
): SlotState {
  const raw = new Uint8Array(BANK).fill(0xff);
  raw.set(image, 0);
  const header: ImageHeader | null = parseImageHeader(raw);
  return {
    key,
    name: `slot ${key}`,
    subcmd: null,
    address: 0,
    present: true,
    reason: null,
    unread: false,
    header,
    raw,
    footer: null,
    recovered: null,
    plain: null,
    plainHeader: header,
    accepts: false,
    footerOk: false,
    sha256: null,
    keyName: null,
    bootable: false,
    bootability: 'not-bootable',
    ...overrides,
  };
}

/** A bank holding no image: an erased bank, read clean. */
function emptyBank(key: SlotKey): SlotState {
  return {
    key,
    name: `slot ${key}`,
    subcmd: null,
    address: 0,
    present: false,
    reason: 'no image header (magic 0xffffffff)',
    blank: true,
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
  };
}

function stateWith(
  slots: readonly SlotState[],
  options: { cfg0?: number | null; version?: string | null } = {},
): DeviceState {
  const byKey = new Map(slots.map((s) => [s.key, s]));
  return {
    version: options.version === undefined ? '1.3.0.8' : options.version,
    cfg0: options.cfg0 === undefined ? 0 : options.cfg0,
    byKey,
    slots,
  } as unknown as DeviceState;
}

const PLAIN_LENGTH = 0x6000;
const FF_LENGTH = 0x6000;

describe('runningApplicationOf: the bank the 2014 bootloader takes', () => {
  it('runs A when A holds a stored-sum-0 image, whatever R holds', () => {
    const state = stateWith([
      presentBank('a', plainImage(PLAIN_LENGTH, 1)),
      emptyBank('b'),
      presentBank('r', ffStoredImage(FF_LENGTH, 2)),
    ]);
    const run = runningApplicationOf(state);
    expect(run).toMatchObject({ bank: 'a', build: 'plain' });
    expect(run.why).toContain('slot A is the first bank the 2014 bootloader takes');
  });

  it('runs B when A is not taken and B holds a stored-sum-0 image', () => {
    const state = stateWith([
      presentBank('a', ffStoredImage(FF_LENGTH, 3)),
      presentBank('b', plainImage(PLAIN_LENGTH, 4)),
      emptyBank('r'),
    ]);
    expect(runningApplicationOf(state)).toMatchObject({ bank: 'b', build: 'plain' });
  });

  it('runs the FF image in R when A and B hold nothing the bootloader takes', () => {
    const state = stateWith([
      presentBank('a', ffStoredImage(FF_LENGTH, 5)),
      emptyBank('b'),
      presentBank('r', ffStoredImage(FF_LENGTH, 6)),
    ]);
    const run = runningApplicationOf(state);
    expect(run).toMatchObject({ bank: 'r', build: 'ff-1308' });
    expect(run.why).toContain('recovery R runs the image it holds');
  });

  it('runs the 8 Hz image in R when A and B are empty, as the bench measured (42.10 step 5)', () => {
    const state = stateWith([
      emptyBank('a'),
      emptyBank('b'),
      presentBank('r', plainImage(PLAIN_LENGTH, 7)),
    ]);
    expect(runningApplicationOf(state)).toMatchObject({ bank: 'r', build: 'plain' });
  });

  it('is unknown when no bank holds an image the bootloader takes and R is empty', () => {
    const state = stateWith([emptyBank('a'), emptyBank('b'), emptyBank('r')]);
    const run = runningApplicationOf(state);
    expect(run.bank).toBeNull();
    expect(run.build).toBeNull();
    expect(run.why).toContain('R holds none');
  });
});

describe('runningApplicationOf: unknown is never a guess', () => {
  it('is unknown when cfg[0] is not the measured 0', () => {
    const state = stateWith(
      [presentBank('a', plainImage(PLAIN_LENGTH, 8)), emptyBank('b'), emptyBank('r')],
      {
        cfg0: 2,
      },
    );
    const run = runningApplicationOf(state);
    expect(run).toMatchObject({ bank: null, build: null });
    expect(run.why).toContain('cfg[0] is 0x2');
  });

  it('is unknown when cfg[0] was not read', () => {
    const state = stateWith(
      [presentBank('a', plainImage(PLAIN_LENGTH, 9)), emptyBank('b'), emptyBank('r')],
      {
        cfg0: null,
      },
    );
    expect(runningApplicationOf(state)).toMatchObject({ bank: null, build: null });
  });

  it('is unknown when the camera reports no version', () => {
    const state = stateWith([presentBank('a', plainImage(PLAIN_LENGTH, 10))], { version: null });
    expect(runningApplicationOf(state)).toMatchObject({ bank: null, build: null });
  });

  it('is unknown when A was not read, since the bootloader may take it', () => {
    const unread = { ...emptyBank('a'), unread: true, reason: 'the window would not arm' };
    const state = stateWith([
      unread,
      presentBank('r', ffStoredImage(FF_LENGTH, 11)),
      emptyBank('b'),
    ]);
    const run = runningApplicationOf(state);
    expect(run).toMatchObject({ bank: null, build: null });
    expect(run.why).toContain('slot A was not read');
  });

  it('is unknown when the bank the bootloader takes reports another version than the camera', () => {
    const other = plainImage(PLAIN_LENGTH, 12, 0x00000301);
    const state = stateWith([presentBank('a', other), emptyBank('b'), emptyBank('r')]);
    const run = runningApplicationOf(state);
    expect(run).toMatchObject({ bank: null, build: null });
    expect(run.why).toContain('but the camera reports 1.3.0.8');
  });

  it('is unknown when R holds a sum-0xFFFF image with no FF key pair, which the writer cannot build', () => {
    const stray = plainImage(PLAIN_LENGTH, 13);
    const dv = new DataView(stray.buffer);
    dv.setUint32(REBALANCE_WORD_OFFSET, 0, true);
    dv.setUint32(REBALANCE_WORD_OFFSET, (0xffff - wordSum32(stray, stray.length)) >>> 0, true);
    const state = stateWith([emptyBank('a'), emptyBank('b'), presentBank('r', stray)]);
    const run = runningApplicationOf(state);
    expect(run).toMatchObject({ bank: null, build: null });
    expect(run.why).toContain('cannot tell apart');
  });
});

/* ==================================================================== *
 * prepareSlotFlash: the FF image while the camera runs the 8 Hz build
 * ==================================================================== */

const legacy = getProfile('legacy-auth');
const FF_IMAGE_LENGTH = 0x6000;

/** The analysis a write is checked against: 1.3.0.8, with the given banks and cfg[0]. */
function writerState(slots: readonly SlotState[], cfg0: number | null = 0): DeviceState {
  const byKey = new Map(slots.map((s) => [s.key, s]));
  return {
    version: '1.3.0.8',
    serial: 'TESTSERIAL',
    cfg0,
    profile: legacy,
    slots,
    byKey,
    boot: null,
    keyTable: null,
    keyWhiteningK: legacy.cipher.whiteningK,
    storeKey: { name: 'Key B', key: null, programmed: false },
    deviceKeySlot: null,
    canFlash: true,
    flashBlockedBy: [],
  } as unknown as DeviceState;
}

/** The 16 Hz FF image as a file is: the key pair planted once each, the header, no stamped word. */
function ffFileImage(seed: number): Uint8Array {
  const next = prng(seed);
  const out = new Uint8Array(FF_IMAGE_LENGTH);
  for (let i = 0; i < out.length; i++) out[i] = next();
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x10001000, true);
  dv.setUint32(4, 0x10000101, true);
  dv.setUint32(0x200, IMAGE_MAGIC, true);
  dv.setUint32(LENGTH_OFFSET, FF_IMAGE_LENGTH, true);
  dv.setUint32(VERSION_OFFSET, VERSION_1308, true);
  out.set(hexToBytes(KEY_PAIRS.ff1308.block0), 0x3000);
  out.set(hexToBytes(KEY_PAIRS.ff1308.block1), 0x3100);
  return out;
}

describe('prepareSlotFlash: the FF image is refused while the 8 Hz build runs', () => {
  const plan = buildSlotPlan(legacy, '1.3.0.8');
  const image = ffFileImage(21);
  const write = { kind: 'plain' as const, bytes: image, fileName: 'compact-16hz.bin' };

  it('refuses the FF image into R before anything is sent when slot A runs the 8 Hz build', () => {
    const report = reportFor(
      writerState([presentBank('a', plainImage(PLAIN_LENGTH, 31)), emptyBank('b'), emptyBank('r')]),
      plan,
    );
    expect(() => prepareSlotFlash(report, 'r', write)).toThrow(
      /the camera runs the 8 Hz 1\.3\.0\.8 application: slot A is the first bank the 2014 bootloader takes/,
    );
    expect(() => prepareSlotFlash(report, 'r', write)).toThrow(/0x00070100/);
    expect(() => prepareSlotFlash(report, 'r', write)).toThrow(/Nothing was sent/);
    expect(() => prepareSlotFlash(report, 'r', write)).toThrow(/J-Link/);
  });

  it('refuses it when the 8 Hz build runs from R, with A and B empty', () => {
    const report = reportFor(
      writerState([emptyBank('a'), emptyBank('b'), presentBank('r', plainImage(PLAIN_LENGTH, 32))]),
      plan,
    );
    expect(() => prepareSlotFlash(report, 'r', write)).toThrow(
      /runs the 8 Hz 1\.3\.0\.8 application: neither A nor B holds an image/,
    );
  });

  it('plans the FF image into R when the FF build runs from R, with no warning about the running build', () => {
    const report = reportFor(
      writerState([
        presentBank('a', ffStoredImage(FF_IMAGE_LENGTH, 33)),
        emptyBank('b'),
        presentBank('r', ffStoredImage(FF_IMAGE_LENGTH, 34)),
      ]),
      plan,
    );
    const out = prepareSlotFlash(report, 'r', write);
    expect(out.staging).toBe('two-stream');
    expect(out.warnings.some((w) => w.includes('could not be told'))).toBe(false);
    /* The plan's own FF note says the 8 Hz build refuses the payload; that is a fact, not this run's verdict. */
    expect(out.warnings.some((w) => w.includes('the camera runs the 8 Hz 1.3.0.8'))).toBe(false);
  });

  it('plans it, with a warning rather than a refusal, when the running application cannot be told', () => {
    const report = reportFor(
      writerState(
        [presentBank('a', plainImage(PLAIN_LENGTH, 35)), emptyBank('b'), emptyBank('r')],
        2,
      ),
      plan,
    );
    const out = prepareSlotFlash(report, 'r', write);
    expect(out.staging).toBe('two-stream');
    expect(out.warnings.some((w) => w.includes('could not be told (cfg[0] is 0x2'))).toBe(true);
  });

  it('leaves a raw FF payload as it was: it is not checked against the running build', () => {
    const report = reportFor(
      writerState([presentBank('a', plainImage(PLAIN_LENGTH, 36)), emptyBank('b'), emptyBank('r')]),
      plan,
    );
    const staged = buildFFPayload(image).payload;
    const out = prepareSlotFlash(report, 'r', {
      kind: 'raw',
      bytes: staged,
      fileName: 'staged.bin',
    });
    expect(out.kind).toBe('raw');
  });
});
