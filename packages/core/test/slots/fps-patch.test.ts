/* ====================================================================
 * The frame-rate patch on a bank (slots/fps-patch.ts), without a camera: every refusal that is
 * decided from the analysis is made before the device is touched (the device proxy below throws
 * on any use), and the read-back check. The backup the patch saves first is tested in backup.test.ts.
 * The write itself, the save gate and the read-back on a real emulated camera are in
 * test/slots/fps-patch.emulator.test.ts.
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { SeekError } from '../../src/errors.js';
import { cryptBytes } from '../../src/crypto/cipher.js';
import { stateOf } from '../../src/crypto/xorshift128.js';
import { IMAGE_MAGIC, LENGTH_OFFSET } from '../../src/image/header.js';
import { wordSum32 } from '../../src/image/bank.js';
import { FPS_PATCHES } from '../../src/preservation/fps-patch.js';
import { getProfile } from '../../src/profiles/registry.js';
import { buildSlotPlan } from '../../src/slots/capability.js';
import {
  checkReadBack,
  checkReadBackDecrypted,
  fpsPlanOfBank,
  patchBankFps,
  writeFpsPatch,
} from '../../src/slots/fps-patch.js';
import type { DumpedSlot, SlotKey } from '../../src/slots/types.js';
import type { DeviceState, SlotState, WorkflowContext } from '../../src/workflows/types.js';
import { reportFor } from './write-fixtures.js';

const legacy = getProfile('legacy-auth');
const compact2016 = getProfile('compact-2016');
const BANK = 0x10000;

/** A context whose device must never be touched: any use is a test failure. */
function untouchableContext(): WorkflowContext {
  const device = new Proxy(
    {},
    {
      get(_target, property) {
        throw new Error(`the device was touched (${String(property)}) by a refused patch`);
      },
    },
  );
  return {
    device,
    profile: legacy,
    detection: null,
    reporter: {} as never,
    signal: new AbortController().signal,
  } as unknown as WorkflowContext;
}

/** A synthetic plain image of `length` bytes: the magic, its length, a sum of 0 (the 2014 chain). */
function plainImage(length: number, seed: number): Uint8Array {
  const out = new Uint8Array(length);
  let s = seed >>> 0;
  for (let i = 0; i < length; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    out[i] = s >>> 24;
  }
  const dv = new DataView(out.buffer);
  dv.setUint32(0x200, IMAGE_MAGIC, true);
  dv.setUint32(LENGTH_OFFSET, length, true);
  dv.setUint32(0x238, 0, true);
  dv.setUint32(0x238, (0 - wordSum32(out, length)) >>> 0, true);
  return out;
}

function slotWith(key: SlotKey, image: Uint8Array | null): SlotState {
  const raw = new Uint8Array(BANK).fill(0xff);
  if (image !== null) raw.set(image, 0);
  return {
    key,
    name: `slot ${key}`,
    subcmd: null,
    address: 0,
    present: image !== null,
    reason: image === null ? 'no image header (magic 0xffffffff)' : null,
    blank: image === null,
    unread: false,
    header: null,
    raw,
    plain: image,
    sha256: 'x',
    plainSha256: null,
    keyName: null,
    bootable: true,
    bootability: 'bootable',
  } as unknown as SlotState;
}

/**
 * A synthetic image the 2016 line's recovery can solve: the plain words 7..10 and 13 are zero (the reserved
 * vectors recovery reads), and the acceptance sum is the 2016 target, 0.
 */
/** Flips the bits of one byte of a synthetic image. */
function xorAt(bytes: Uint8Array, offset: number, mask: number): void {
  bytes[offset] = (bytes[offset] ?? 0) ^ mask;
}

function zeroVectorImage(length: number, seed: number): Uint8Array {
  const out = plainImage(length, seed);
  const dv = new DataView(out.buffer);
  for (const word of [7, 8, 9, 10, 13]) dv.setUint32(4 * word, 0, true);
  dv.setUint32(0x238, 0, true);
  dv.setUint32(0x238, (0 - wordSum32(out, length)) >>> 0, true);
  return out;
}

function stateFor(
  version: string,
  banks: readonly SlotState[],
  profile: typeof legacy = legacy,
): DeviceState {
  return {
    version,
    serial: 'FPSSERIAL',
    cfg0: 0,
    profile,
    slots: banks,
    byKey: new Map(banks.map((bank) => [bank.key, bank])),
    boot: { booted: 'b', target: 'b' },
    keyTable: null,
    keyWhiteningK: profile.cipher.whiteningK,
    storeKey: { name: 'Key B', key: null, programmed: false },
    deviceKeySlot: null,
    bankWriteRefusals: [],
    bankVerdicts: null,
  } as unknown as DeviceState;
}

describe('the plan for one bank, from its own image (no device)', () => {
  it('refuses an image that is in no table, and says why', () => {
    const report = reportFor(
      stateFor('1.3.0.0', [slotWith('a', plainImage(0x4000, 1)), slotWith('b', null)]),
      buildSlotPlan(legacy, '1.3.0.0'),
    );
    const plan = fpsPlanOfBank(report, 'a');
    expect(plan.status).toBe('refused');
    if (plan.status === 'refused') expect(plan.reason).toMatch(/not in the frame-rate patch table/);
  });

  it('does not offer a 1.0.3.0 bank whose decrypted image is not the stock image of its table entry', () => {
    const report = reportFor(
      stateFor(
        '1.0.3.0',
        [slotWith('a', zeroVectorImage(0x800, 11)), slotWith('b', null)],
        compact2016,
      ),
      buildSlotPlan(compact2016, '1.0.3.0'),
    );
    const plan = fpsPlanOfBank(report, 'a');
    expect(plan.status).toBe('refused');
    if (plan.status === 'refused') expect(plan.reason).toMatch(/not in the frame-rate patch table/);
  });

  it('refuses an empty bank, without reading it', () => {
    const report = reportFor(
      stateFor('1.3.0.0', [slotWith('a', plainImage(0x4000, 2)), slotWith('b', null)]),
      buildSlotPlan(legacy, '1.3.0.0'),
    );
    const plan = fpsPlanOfBank(report, 'b');
    expect(plan.status).toBe('refused');
    if (plan.status === 'refused') expect(plan.reason).toMatch(/has no decrypted image to patch/);
  });

  it('refuses a build the slot plan does not support, before the camera is asked anything', async () => {
    const report = reportFor(
      stateFor('0.7.0.7', [slotWith('a', plainImage(0x4000, 3))]),
      buildSlotPlan(legacy, '0.7.0.7'),
    );
    expect(report.plan.supportedBuild.supported).toBe(false);
    await expect(
      patchBankFps(untouchableContext(), report, 'a', {
        acknowledgeRisk: true,
        saveBackup: () => Promise.resolve(true),
      }),
    ).rejects.toThrow(SeekError);
  });

  it('refuses an image no table entry makes, before the device is touched', async () => {
    const report = reportFor(
      stateFor('1.3.0.0', [slotWith('a', plainImage(0x4000, 4)), slotWith('b', null)]),
      buildSlotPlan(legacy, '1.3.0.0'),
    );
    await expect(
      patchBankFps(untouchableContext(), report, 'a', {
        acknowledgeRisk: true,
        saveBackup: () => Promise.resolve(true),
      }),
    ).rejects.toThrow(/not in the frame-rate patch table/);
  });
});

describe('the read-back against the pre-patch bank', () => {
  const before = new Uint8Array(BANK).fill(0x33);

  it('passes when the bank differs only at the planned bytes', () => {
    const after = before.slice();
    after[0x100] = 0x44;
    after[0x238] = 0x55;
    const check = checkReadBack(before, after, [0x100, 0x238]);
    expect(check).toMatchObject({ checked: true, ok: true, unexpected: [], missing: [] });
    expect(check.differing).toEqual([0x100, 0x238]);
  });

  it('fails on a stray change the patch does not plan', () => {
    const after = before.slice();
    after[0x100] = 0x44;
    after[0x9000] = 0x00;
    const check = checkReadBack(before, after, [0x100]);
    expect(check.ok).toBe(false);
    expect(check.unexpected).toEqual([0x9000]);
  });

  it('fails when a planned byte did not change', () => {
    const after = before.slice();
    const check = checkReadBack(before, after, [0x100]);
    expect(check.ok).toBe(false);
    expect(check.missing).toEqual([0x100]);
  });

  it('says it did not check when there is no read-back', () => {
    expect(checkReadBack(before, null, [0x100])).toEqual({
      checked: false,
      differing: [],
      missing: [],
      unexpected: [],
      ok: null,
    });
  });
});

describe('the read-back of a Key A bank, judged on its decrypted image', () => {
  it('says it did not check when there is no read-back', () => {
    expect(checkReadBackDecrypted(plainImage(0x800, 5), null, [0x238], legacy.cipher)).toEqual({
      checked: false,
      differing: [],
      missing: [],
      unexpected: [],
      ok: null,
    });
  });

  it('refuses a read-back too short to hold the image it is judged on', () => {
    const check = checkReadBackDecrypted(
      plainImage(0x800, 6),
      new Uint8Array(0x400),
      [0x238],
      legacy.cipher,
    );
    expect(check).toMatchObject({ checked: true, ok: false, missing: [0x238] });
  });
});

describe('the read-back of the 2016 keystream line, judged on its decrypted image', () => {
  /* The bank holds the image under a keystream of its own. A synthetic bank is the image XORed with
   * that keystream (cryptBytes is self-inverse), and the read-back's own keystream is what the check solves. */
  const KEYSTREAM = stateOf(0x12345678, 0x9abcdef0, 0x0badf00d, 0x2545f491);
  const stored = (plain: Uint8Array): Uint8Array =>
    cryptBytes(plain, KEYSTREAM, compact2016.cipher);
  const before = zeroVectorImage(0x800, 21);

  it('passes when the decrypted read-back differs from the saved image only at the planned bytes', () => {
    const patched = before.slice();
    xorAt(patched, 0x100, 0xff);
    xorAt(patched, 0x101, 0x0f);
    xorAt(patched, 0x238, 0x5a);
    const check = checkReadBackDecrypted(
      before,
      stored(patched),
      [0x100, 0x101, 0x238],
      compact2016.cipher,
    );
    expect(check).toMatchObject({ checked: true, ok: true, unexpected: [], missing: [] });
    expect(check.differing).toEqual([0x100, 0x101, 0x238]);
  });

  it('refuses a read-back that changes a byte the patch does not plan, however small', () => {
    const patched = before.slice();
    xorAt(patched, 0x100, 0xff);
    xorAt(patched, 0x238, 0x5a);
    xorAt(patched, 0x300, 0x01);
    const check = checkReadBackDecrypted(
      before,
      stored(patched),
      [0x100, 0x238],
      compact2016.cipher,
    );
    expect(check.ok).toBe(false);
    expect(check.unexpected).toEqual([0x300]);
  });

  it('refuses a read-back where a planned byte did not change', () => {
    const patched = before.slice();
    xorAt(patched, 0x100, 0xff);
    const check = checkReadBackDecrypted(
      before,
      stored(patched),
      [0x100, 0x102],
      compact2016.cipher,
    );
    expect(check.ok).toBe(false);
    expect(check.missing).toEqual([0x102]);
  });
});

describe('writing a planned patch refuses before the device is touched', () => {
  const patch = FPS_PATCHES.find((candidate) => candidate.id === 'compact_pro-1.0.3.0');

  function dumpOf(plain: Uint8Array): DumpedSlot {
    return {
      key: 'a',
      address: 0x14050000,
      raw: new Uint8Array(BANK).fill(0xff),
      sha256: 'x',
      empty: false,
      plain,
      plainSha256: null,
      notes: [],
    };
  }

  it('refuses a bank whose decrypted image is not the patch’s stock image', async () => {
    if (patch === undefined) throw new Error('the table has no compact_pro-1.0.3.0 entry');
    const image = zeroVectorImage(0x800, 31);
    const report = reportFor(
      stateFor('1.0.3.0', [slotWith('a', image), slotWith('b', null)], compact2016),
      buildSlotPlan(compact2016, '1.0.3.0'),
    );
    await expect(
      writeFpsPatch(untouchableContext(), report, 'a', dumpOf(image), patch, {
        acknowledgeRisk: true,
        saveBackup: () => Promise.resolve(true),
      }),
    ).rejects.toThrow(/not the stock image this patch was written for/);
  });

  it('refuses a patch for a build other than the one the camera reports', async () => {
    if (patch === undefined) throw new Error('the table has no compact_pro-1.0.3.0 entry');
    const image = zeroVectorImage(0x800, 32);
    const report = reportFor(
      stateFor('1.3.0.0', [slotWith('a', image), slotWith('b', null)]),
      buildSlotPlan(legacy, '1.3.0.0'),
    );
    await expect(
      writeFpsPatch(untouchableContext(), report, 'a', dumpOf(image), patch, {
        acknowledgeRisk: true,
        saveBackup: () => Promise.resolve(true),
      }),
    ).rejects.toThrow(/is for build 1\.0\.3\.0, but the camera reports 1\.3\.0\.0/);
  });
});
