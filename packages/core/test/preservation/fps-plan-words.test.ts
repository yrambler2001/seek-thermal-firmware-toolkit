/* ==================================================================== *
 * What a person reads about a bank that already runs the faster rate (TESTING.md 42.85 O3, 42.86): the
 * plan's reason says the state, with no table id, and the bank's analysis line names the rate, not the
 * table's name for the build. The table is replaced by one synthetic 1.0.3.0 entry and one known-rate build,
 * because no real image is in the repository: the plan reads only the image's hash.
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import type * as FpsTable from '../../src/preservation/fps-patch-table.js';

const images = vi.hoisted(() => {
  const N = 0x400;
  /* image/header.ts IMAGE_MAGIC; the first test checks it is the same. */
  const magic = 0xa1b2c3d4;
  function image(seed: number): Uint8Array {
    const out = new Uint8Array(N);
    let s = seed >>> 0;
    for (let i = 0; i < N; i++) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      out[i] = s >>> 24;
    }
    const view = new DataView(out.buffer);
    view.setUint32(0x200, magic, true);
    view.setUint32(0x204, N, true);
    return out;
  }
  return { N, magic, stock: image(1), patched: image(2), atRate: image(3) };
});

const sha = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

vi.mock('../../src/preservation/fps-patch-table.js', async (importOriginal) => {
  const actual = await importOriginal<typeof FpsTable>();
  const { createHash: hash } = await import('node:crypto');
  const shaOf = (bytes: Uint8Array): string => hash('sha256').update(bytes).digest('hex');
  return {
    ...actual,
    FPS_PATCH_TABLE: [
      {
        id: 'compact_pro-1.0.3.0',
        family: 'compact_pro',
        version: '1.0.3.0',
        fromHz: 9,
        targetHz: 18,
        stockSha256: shaOf(images.stock),
        patchedSha256: shaOf(images.patched),
        length: images.N,
        edits: [{ offset: 0x100, before: '00', after: '01' }],
        row: { label: 'synthetic', offset: 0x100, length: 4 },
        sibling: null,
      },
    ],
    FPS_KNOWN_RATE: { [shaOf(images.atRate)]: { name: 'compact_pro-1.0.3.0-FF', hz: 18 } },
  };
});

const { IMAGE_MAGIC } = await import('../../src/image/header.js');
const { planFpsPatch } = await import('../../src/preservation/fps-patch.js');
const { frameRateNote } = await import('../../src/workflows/device-info.js');

describe('the words for a bank that already runs the faster rate (TESTING.md 42.86)', () => {
  it('uses the synthetic table (the seam holds)', () => {
    expect(IMAGE_MAGIC).toBe(images.magic);
    expect(sha(images.stock)).not.toBe(sha(images.patched));
    expect(planFpsPatch(images.stock, '1.0.3.0').status).toBe('offer');
  });

  it('a patched image: the plan says the patch is applied, as a state, with no table id', () => {
    const plan = planFpsPatch(images.patched, '1.0.3.0');
    expect(plan).toEqual({
      status: 'patched',
      reason: 'the frame-rate patch is already applied: this image runs at 18 Hz',
      hz: 18,
    });
    if (plan.status === 'patched') {
      expect(plan.reason).not.toContain('compact_pro');
      expect(plan.reason).not.toContain('not offered');
    }
  });

  it('a build made at the faster rate: the plan says it needs none, with no table name', () => {
    const plan = planFpsPatch(images.atRate, '1.0.3.0');
    expect(plan).toEqual({
      status: 'at-rate',
      reason: 'this build already runs at 18 Hz without a patch',
      hz: 18,
    });
  });

  it('the bank line names the rate, not the table name', () => {
    expect(frameRateNote(images.patched)).toBe(', frame-rate patch 18 Hz');
    expect(frameRateNote(images.atRate)).toBe(', runs at 18 Hz');
    expect(frameRateNote(images.stock)).toBe('');
    expect(frameRateNote(null)).toBe('');
  });
});
