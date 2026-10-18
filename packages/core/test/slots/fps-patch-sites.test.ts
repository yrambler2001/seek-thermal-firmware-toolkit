/* ====================================================================
 * The frame-rate patch's site check (preservation/fps-patch.ts `applyFpsPatch`): the image must be the stock
 * image the patch was written for, and the bytes at every edit site must be the stock bytes, before a single
 * byte is changed. A refusal here means nothing is written (slots/fps-patch.ts plans the write only from the
 * patched image this function returns). No camera and no emulator.
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { IMAGE_MAGIC, LENGTH_OFFSET } from '../../src/image/header.js';
import { wordSum32 } from '../../src/image/bank.js';
import { applyFpsPatch, type FpsPatch } from '../../src/preservation/fps-patch.js';

/** A bank-sized image with a valid header and length, filled from a seed. */
function image(length: number, seed: number): Uint8Array {
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

function sha256Of(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

describe('the patch names the site it cannot find, and changes no byte', () => {
  it('refuses when the bytes at an edit site are not the stock bytes the patch expects', () => {
    const stock = image(0x4000, 9);
    const length = new DataView(stock.buffer).getUint32(LENGTH_OFFSET, true);
    const siteOffset = 0x300;
    expect(stock[siteOffset]).not.toBe(0xaa);
    const patch = {
      id: 'synthetic-site-check',
      stockSha256: sha256Of(stock.subarray(0, length)),
      edits: [{ offset: siteOffset, before: Uint8Array.of(0xaa), after: Uint8Array.of(0xbb) }],
    } as unknown as FpsPatch;
    const before = stock.slice();
    expect(() => applyFpsPatch(stock, patch)).toThrow(/are not the expected original/);
    expect(() => applyFpsPatch(stock, patch)).toThrow(/0x300/);
    expect(stock).toEqual(before);
  });

  it('refuses an image that is not the stock image at all, before any site is looked at', () => {
    const stock = image(0x4000, 9);
    const patch = {
      id: 'synthetic-stock-check',
      stockSha256: '00'.repeat(32),
      edits: [{ offset: 0x300, before: Uint8Array.of(stock[0x300] ?? 0), after: Uint8Array.of(0) }],
    } as unknown as FpsPatch;
    expect(() => applyFpsPatch(stock, patch)).toThrow(
      /not the stock image this patch was written for/,
    );
  });
});
