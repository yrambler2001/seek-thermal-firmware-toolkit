/* ====================================================================
 * The frame-rate patch on a bank (slots/fps-patch.ts), without a camera: every refusal that is
 * decided from the analysis is made before the device is touched (the device proxy below throws
 * on any use), the read-back check, and the names the pre-patch dump is saved under.
 * The write itself, the save gate and the read-back on a real emulated camera are in
 * test/slots/fps-patch.emulator.test.ts.
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { SeekError } from '../../src/errors.js';
import { IMAGE_MAGIC, LENGTH_OFFSET } from '../../src/image/header.js';
import { wordSum32 } from '../../src/image/bank.js';
import { getProfile } from '../../src/profiles/registry.js';
import { buildSlotPlan } from '../../src/slots/capability.js';
import {
  checkReadBack,
  checkReadBackDecrypted,
  fpsPlanOfBank,
  fpsPreDumpNames,
  patchBankFps,
} from '../../src/slots/fps-patch.js';
import type { SlotKey } from '../../src/slots/types.js';
import type { DeviceState, SlotState, WorkflowContext } from '../../src/workflows/types.js';
import { reportFor } from './write-fixtures.js';

const legacy = getProfile('legacy-auth');
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

function stateFor(version: string, banks: readonly SlotState[]): DeviceState {
  return {
    version,
    serial: 'FPSSERIAL',
    cfg0: 0,
    profile: legacy,
    slots: banks,
    byKey: new Map(banks.map((bank) => [bank.key, bank])),
    boot: { booted: 'b', target: 'b' },
    keyTable: null,
    keyWhiteningK: legacy.cipher.whiteningK,
    storeKey: { name: 'Key B', key: null, programmed: false },
    deviceKeySlot: null,
    canFlash: true,
    flashBlockedBy: [],
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
        saveDump: () => Promise.resolve(true),
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
        saveDump: () => Promise.resolve(true),
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

describe('the names the pre-patch dump is saved under', () => {
  it('names the bank, the build, the kind and a short hash, marked as taken before a patch', () => {
    const names = fpsPreDumpNames('a', '1.3.0.0', 'abcdef0123456789', '9876543210fedcba');
    expect(names.raw).toBe('seek-slot-A-v1.3.0.0-before-fps-patch-raw-abcdef01.bin');
    expect(names.decrypted).toBe('seek-slot-A-v1.3.0.0-before-fps-patch-decrypted-98765432.bin');
  });

  it('names an unknown build as unknown, and keeps the file name to safe characters', () => {
    expect(fpsPreDumpNames('r', null, 'aa', 'bb').raw).toBe(
      'seek-slot-R-vunknown-before-fps-patch-raw-aa.bin',
    );
    expect(fpsPreDumpNames('b', '1.3.0.8 FF/x', 'aa', 'bb').raw).toMatch(/-v1\.3\.0\.8-FF-x-/);
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
