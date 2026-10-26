/* ====================================================================
 * The camera-wide refusal binds the writer on every staging, not only the Key A line (TESTING.md 42.19).
 * The page's banner and its row controls read `slotWriteRefusal`; the writer must refuse the same reason
 * before it builds anything, so a write the page refuses cannot be sent by the CLI or the frame-rate patch
 * either. No camera: the refusal is decided from the analysis before the payload is built.
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { wordSum32 } from '../../src/image/bank.js';
import { IMAGE_MAGIC, LENGTH_OFFSET } from '../../src/image/header.js';
import { getProfile } from '../../src/profiles/registry.js';
import { buildSlotPlan } from '../../src/slots/capability.js';
import { prepareSlotFlash } from '../../src/slots/write.js';
import { writeBannerOf } from '../../src/slots/write-keys.js';
import type { DeviceState, SlotState } from '../../src/workflows/types.js';
import { reportFor } from './write-fixtures.js';

const legacy = getProfile('legacy-auth');

/** A plain image of `length` bytes with a valid header and a word sum of 0 (what the 2014 chain stores). */
function headered(length: number): Uint8Array {
  const out = new Uint8Array(length);
  for (let i = 0; i < length; i++) out[i] = (i * 31 + 7) & 0xff;
  const dv = new DataView(out.buffer);
  dv.setUint32(0x200, IMAGE_MAGIC, true);
  dv.setUint32(LENGTH_OFFSET, length, true);
  dv.setUint32(0x238, 0, true);
  dv.setUint32(0x238, (0 - wordSum32(out, length)) >>> 0, true);
  return out;
}

/** A 2014 plain-chain camera (1.3.0.0), A booted and holding a plain image, B erased. */
function plainCamera(bankWriteRefusals: readonly string[]): DeviceState {
  const plain = new Uint8Array(0x10000).fill(0x11);
  const a = slot('a', { present: true, plain, bootable: true, bootability: 'bootable' });
  const b = slot('b', { present: false, blank: true, plain: null });
  const r = slot('r', { present: true, plain, bootable: true, bootability: 'bootable' });
  const slots = [a, b, r];
  return {
    version: '1.3.0.0',
    serial: null,
    profile: legacy,
    slots,
    byKey: new Map(slots.map((s) => [s.key, s])),
    boot: { booted: 'a', target: 'b' },
    keyTable: null,
    keyTableCandidates: 0,
    keyWhiteningK: 0,
    storeKey: { name: 'Key B', key: null, programmed: false },
    deviceKeySlot: null,
    bankWriteRefusals,
    plainChain: true,
    cfg0: 0,
  } as unknown as DeviceState;
}

function slot(key: 'a' | 'b' | 'r', over: Partial<SlotState>): SlotState {
  return {
    key,
    name: `slot ${key.toUpperCase()}`,
    subcmd: null,
    address: 0,
    present: true,
    reason: null,
    unread: false,
    header: null,
    raw: null,
    footer: null,
    recovered: null,
    plain: null,
    plainHeader: null,
    accepts: true,
    footerOk: true,
    sha256: null,
    keyName: null,
    bootable: false,
    bootability: 'not-bootable',
    ...over,
  };
}

describe('the writer refuses what the page refuses, on the plain chain too', () => {
  const reason = 'the camera reports a build this page does not write';

  it('a camera-wide reason refuses the prepared write, by its own words, before any payload is built', () => {
    const state = plainCamera([reason]);
    expect(writeBannerOf(state)).toContain(reason);
    const report = reportFor(state, buildSlotPlan(legacy, '1.3.0.0'));
    expect(() =>
      prepareSlotFlash(report, 'b', {
        kind: 'raw',
        bytes: headered(0x8000),
        fileName: 'raw.bin',
      }),
    ).toThrow(reason);
  });

  it('a camera with no camera-wide reason is not refused by the camera (any refusal left is the image’s own)', () => {
    const state = plainCamera([]);
    expect(writeBannerOf(state)).toBeNull();
    const report = reportFor(state, buildSlotPlan(legacy, '1.3.0.0'));
    let message = '';
    try {
      prepareSlotFlash(report, 'b', {
        kind: 'plain',
        bytes: headered(0x8000),
        fileName: 'image.bin',
      });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).not.toContain('cannot be written from here');
  });
});
