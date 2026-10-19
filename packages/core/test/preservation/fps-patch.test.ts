/* ====================================================================
 * The frame-rate patch logic (preservation/fps-patch.ts), on synthetic images: the edit, the
 * site check, the acceptance-sum balance, the pre-send check, and the plan's refusals that do
 * not need a real build. The real builds are the differential test's job
 * (fps-patch.differential.test.ts), which needs the corpus.
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { hexToBytes } from '../../src/bytes.js';
import { SeekError } from '../../src/errors.js';
import { IMAGE_MAGIC } from '../../src/image/header.js';
import { wordSum32 } from '../../src/image/bank.js';
import {
  FPS_MEASURED_HZ,
  FPS_NO_PATCH_4821_REASON,
  FPS_OFFER_WITHHELD,
  FPS_PATCHES,
  FPS_STAGE_ONE_IDS,
  FPS_STAGE_THREE_IDS,
  FPS_STAGE_TWO_IDS,
  applyFpsPatch,
  fpsExpectedChanges,
  fpsImageLength,
  identifyFpsImage,
  planFpsPatch,
  verifyFpsPatchedImage,
  type FpsPatch,
} from '../../src/preservation/fps-patch.js';

const sha = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

const N = 0x400;
const ADJ = 0x238;

/** A synthetic image: the magic at 0x200, its length at 0x204, deterministic bytes, a non-zero adjust word. */
function syntheticImage(seed: number): Uint8Array {
  const image = new Uint8Array(N);
  let s = seed >>> 0;
  for (let i = 0; i < N; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    image[i] = s >>> 24;
  }
  const view = new DataView(image.buffer);
  view.setUint32(0x200, IMAGE_MAGIC, true);
  view.setUint32(0x204, N, true);
  view.setUint32(ADJ, 0x1234abcd, true);
  return image;
}

/** The patched image as the Python makes it: the edits, then the adjust word moved by the sum's change. */
function expectedPatched(
  image: Uint8Array,
  edits: readonly { offset: number; after: string }[],
): Uint8Array {
  const out = image.slice();
  for (const edit of edits) out.set(hexToBytes(edit.after), edit.offset);
  const before = wordSum32(image, N);
  const delta = (wordSum32(out, N) - before) >>> 0;
  const view = new DataView(out.buffer);
  view.setUint32(ADJ, (view.getUint32(ADJ, true) - delta) >>> 0, true);
  return out;
}

/** A table-shaped entry for a synthetic image. The stock and patched hashes are the image's own. */
function entryFor(
  stock: Uint8Array,
  edits: { offset: number; before: string; after: string }[],
  patched: Uint8Array,
): FpsPatch {
  return {
    id: 'synthetic-to32',
    family: 'compact_32k',
    version: '9.9.9.9',
    fromHz: 8,
    targetHz: 32,
    stockSha256: sha(stock.subarray(0, N)),
    patchedSha256: sha(patched.subarray(0, N)),
    length: N,
    edits: edits.map((edit) => ({
      offset: edit.offset,
      before: hexToBytes(edit.before),
      after: hexToBytes(edit.after),
    })),
    row: { label: 'synthetic', offset: edits[0]?.offset ?? 0, length: 8 },
    sibling: null,
    gate: { enabled: true, reason: null },
  };
}

const EDITS = [
  { offset: 0x100, before: '', after: '' },
  { offset: 0x300, before: '', after: '' },
];

function editsFor(stock: Uint8Array): { offset: number; before: string; after: string }[] {
  return EDITS.map((edit) => {
    const before = Buffer.from(stock.subarray(edit.offset, edit.offset + 4)).toString('hex');
    const after = Buffer.from(
      stock.subarray(edit.offset, edit.offset + 4).map((b) => b ^ 0x5a),
    ).toString('hex');
    return { offset: edit.offset, before, after };
  });
}

describe('the image: its length and its identity', () => {
  it('reads header.length when the magic is there, and nothing else', () => {
    expect(fpsImageLength(syntheticImage(1))).toBe(N);
    const bad = syntheticImage(1);
    new DataView(bad.buffer).setUint32(0x200, 0, true);
    expect(fpsImageLength(bad)).toBeNull();
    expect(fpsImageLength(new Uint8Array(0x100))).toBeNull();
  });

  it('identifies an image that is in no table as nothing the table names', () => {
    const plan = planFpsPatch(syntheticImage(2), '1.3.0.0');
    expect(plan.status).toBe('refused');
    if (plan.status === 'refused') expect(plan.reason).toMatch(/not in the frame-rate patch table/);
    expect(identifyFpsImage(syntheticImage(2)).stockEntries).toEqual([]);
  });

  it('refuses bytes that are not an image at all', () => {
    const plan = planFpsPatch(new Uint8Array(0x300).fill(0xff), '1.3.0.0');
    expect(plan.status).toBe('refused');
    if (plan.status === 'refused') expect(plan.reason).toMatch(/not a firmware image/);
  });
});

describe('applying a patch: the edits, the acceptance sum, the output', () => {
  it('writes the edit bytes and moves the adjust word by the sum change, so the sum is kept', () => {
    const stock = syntheticImage(3);
    const edits = editsFor(stock);
    const expected = expectedPatched(stock, edits);
    expect(wordSum32(expected, N)).toBe(wordSum32(stock, N));
    const patch = entryFor(stock, edits, expected);
    const out = applyFpsPatch(stock, patch);
    expect(out).toEqual(expected);
    expect(verifyFpsPatchedImage(stock, out, patch)).toEqual(fpsExpectedChanges(patch, stock, out));
  });

  it('refuses an image whose bytes are not the stock image the entry was written for', () => {
    const stock = syntheticImage(4);
    const other = stock.slice();
    other[0x101] = (other[0x101] ?? 0) ^ 1;
    const patch = entryFor(stock, editsFor(stock), expectedPatched(stock, editsFor(stock)));
    expect(() => applyFpsPatch(other, patch)).toThrow(SeekError);
    expect(() => applyFpsPatch(other, patch)).toThrow(/not the stock image/);
  });

  it('refuses a site whose old bytes are not there, even when the hash matches (a broken table)', () => {
    const stock = syntheticImage(5);
    const edits = editsFor(stock);
    const patch = entryFor(stock, edits, expectedPatched(stock, edits));
    const broken: FpsPatch = {
      ...patch,
      edits: [{ offset: 0x100, before: hexToBytes('00000000'), after: hexToBytes('11111111') }],
    };
    expect(() => applyFpsPatch(stock, broken)).toThrow(/not the expected original/);
  });

  it('refuses a patched image that changes a byte the table does not name', () => {
    const stock = syntheticImage(6);
    const edits = editsFor(stock);
    const patched = expectedPatched(stock, edits);
    const patch = entryFor(stock, edits, patched);
    const extra = patched.slice();
    extra[0x222] = (extra[0x222] ?? 0) ^ 0xff;
    expect(() => verifyFpsPatchedImage(stock, extra, patch)).toThrow(/not the documented ones/);
  });

  it('refuses a patched image whose acceptance sum moved', () => {
    const stock = syntheticImage(7);
    const edits = editsFor(stock);
    const patched = expectedPatched(stock, edits);
    const patch = entryFor(stock, edits, patched);
    const moved = patched.slice();
    const view = new DataView(moved.buffer);
    view.setUint32(ADJ, (view.getUint32(ADJ, true) + 1) >>> 0, true);
    expect(() => verifyFpsPatchedImage(stock, moved, patch)).toThrow(
      /acceptance sum moved|not the documented ones/,
    );
  });
});

describe('the rate the page names (the bench-measured rate, FPS_MEASURED_HZ)', () => {
  it('names a rate only for entries of the table, and the 1.3.0.8 entries at the rates the bench measured', () => {
    for (const id of FPS_MEASURED_HZ.keys()) {
      expect(
        FPS_PATCHES.some((p) => p.id === id),
        id,
      ).toBe(true);
    }
    // The 1.3.0.8 32 Hz entry is the plain-copy form. The camera measured its per-second medians at 32.16 to 32.20 fps
    // (TESTING.md 42.27), but its whole-run rate has not been measured, so it names its target (32 Hz).
    // (Its earlier op 5 form published 26 fps, TESTING.md 42.20; that whole-run figure is not this entry's, 42.37 section 3a.)
    expect(FPS_MEASURED_HZ.has('compact_32k-1.3.0.8-to32')).toBe(false);
    expect(FPS_PATCHES.find((p) => p.id === 'compact_32k-1.3.0.8-to32')?.targetHz).toBe(32);
    // An entry the bench did not change keeps its target: the 1.3.0.0 mode-8 entry measured 32 Hz.
    expect(FPS_MEASURED_HZ.has('compact_32k-1.3.0.0-to32')).toBe(false);
  });

  it('names 17.7 for the Compact PRO 4.9.1.15 entry (measured, TESTING.md 42.32), and the 18 Hz target for 4.9.2.0 and 1.0.3.x', () => {
    // The page and the CLI print String(rate): the literal 17.7 prints "17.7", with no float tail.
    expect(FPS_MEASURED_HZ.get('compact_pro-4.9.1.15')).toBe(17.7);
    expect(String(FPS_MEASURED_HZ.get('compact_pro-4.9.1.15'))).toBe('17.7');
    expect(FPS_PATCHES.find((p) => p.id === 'compact_pro-4.9.1.15')?.targetHz).toBe(18);
    // Not measured on a camera: these name their target, 18 Hz.
    for (const id of ['compact_pro-4.9.2.0', 'compact_pro-1.0.3.0', 'compact_pro-1.0.3.2']) {
      expect(FPS_MEASURED_HZ.has(id), id).toBe(false);
      expect(FPS_PATCHES.find((p) => p.id === id)?.targetHz, id).toBe(18);
    }
  });
});

describe('the stages: which entries are offered (pinned, so a change is deliberate)', () => {
  it('offers exactly the stage-one (plain 2014 chain) and stage-two (Key A, 4.8.x and 4.9.x Compact PRO) sets', () => {
    expect([...FPS_STAGE_ONE_IDS].sort()).toEqual([
      'compact_32k-0.10.0.0-to32',
      'compact_32k-0.8.0.0-to32',
      'compact_32k-0.9.0.2-to32',
      'compact_32k-0.9.0.6-to32',
      'compact_32k-0.9.0.7-to32',
      'compact_32k-0.9.1.0-to32',
      'compact_32k-1.0.0.0-to32',
      'compact_32k-1.2.0.0-to32',
      'compact_32k-1.3.0.0-to32',
      'compact_32k-1.3.0.8-to32',
    ]);
    expect([...FPS_STAGE_TWO_IDS].sort()).toEqual([
      'compact_32k-4.8.1.7-to32',
      'compact_32k-4.8.1.9-to32',
      'compact_32k-4.8.2.1-to32',
      'compact_pro-4.9.1.15',
      'compact_pro-4.9.2.0',
    ]);
    expect([...FPS_STAGE_THREE_IDS].sort()).toEqual(['compact_pro-1.0.3.0', 'compact_pro-1.0.3.2']);
    for (const id of FPS_STAGE_ONE_IDS) expect(FPS_STAGE_TWO_IDS.has(id), id).toBe(false);
    for (const id of FPS_STAGE_THREE_IDS) {
      expect(FPS_STAGE_ONE_IDS.has(id), id).toBe(false);
      expect(FPS_STAGE_TWO_IDS.has(id), id).toBe(false);
    }
  });

  it('enables exactly those entries (the offer is not withheld), and gives every other entry its stage-two reason', () => {
    expect(FPS_OFFER_WITHHELD).toBe(false);
    for (const patch of FPS_PATCHES) {
      const offered =
        FPS_STAGE_ONE_IDS.has(patch.id) ||
        FPS_STAGE_TWO_IDS.has(patch.id) ||
        FPS_STAGE_THREE_IDS.has(patch.id);
      expect(patch.gate.enabled, patch.id).toBe(offered);
      if (offered) expect(patch.gate.reason, patch.id).toBeNull();
      else if (patch.id === 'compact_32k-0.7.0.8-to32')
        expect(patch.gate.reason ?? '', patch.id).toMatch(/older than 0\.8\.0\.0/);
      else expect(patch.gate.reason ?? '', patch.id).toMatch(/^stage two: /);
    }
  });

  it('offers every Compact PRO build at 18 Hz: 4.9.x under Key A (stage two), 1.0.3.x on the 2016 keystream (stage three)', () => {
    for (const id of ['compact_pro-4.9.1.15', 'compact_pro-4.9.2.0']) {
      const patch = FPS_PATCHES.find((candidate) => candidate.id === id);
      expect(FPS_STAGE_TWO_IDS.has(id), id).toBe(true);
      expect(patch?.gate.enabled, id).toBe(true);
      expect(patch?.targetHz, id).toBe(18);
    }
    for (const id of ['compact_pro-1.0.3.0', 'compact_pro-1.0.3.2']) {
      const patch = FPS_PATCHES.find((candidate) => candidate.id === id);
      expect(FPS_STAGE_THREE_IDS.has(id), id).toBe(true);
      expect(patch?.gate.enabled, id).toBe(true);
      expect(patch?.targetHz, id).toBe(18);
    }
  });
});

describe('a Compact 4.8.2.1 image that is not the stock one', () => {
  it('is refused with the reason, not with the generic "not in the table" message', () => {
    const plan = planFpsPatch(syntheticImage(8), '4.8.2.1');
    expect(plan.status).toBe('refused');
    if (plan.status === 'refused') {
      expect(plan.reason).toBe(FPS_NO_PATCH_4821_REASON);
      expect(plan.reason).toMatch(/68-byte command pages/);
    }
  });
});
