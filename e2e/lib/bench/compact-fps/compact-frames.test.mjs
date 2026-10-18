// Unit tests for the Compact frame measurer: parsing, derivations and statistics on a recorded fixture
// (fixtures/stock-raw-2s, 16 frames of a stock 1.3.0.0 camera in IP mode 6, recorded by compact-fps.mjs) and on
// synthetic frames. No camera is used.
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  ALLOWED_OUT,
  CREDIT_RAW_HW,
  FRAME_MARKER,
  HEADER_BYTES,
  TYPE_HALFWORD,
  deriveRowWidth,
  formatSummary,
  frameBytesFromMarkers,
  histogram,
  markerPositions,
  median,
  modeOf,
  parseFrame,
  summarize,
} from './compact-frames.mjs';
import { analyzeFrames, ipModeOf } from './compact-fps.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FRAME_BYTES = CREDIT_RAW_HW * 2; // 66560: the raw credit, 0x680 header + 156 body rows of 208

/** A seeded generator, so the synthetic pixels are the same on every run. */
function prng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One synthetic raw frame: marker, capture index, random body (never the marker), and the type word. */
function syntheticFrame({ index, type, seed, noise = 0 }) {
  const rand = prng(seed);
  const buf = Buffer.alloc(FRAME_BYTES);
  for (let hw = HEADER_BYTES / 2; hw < FRAME_BYTES / 2; hw++) {
    let v = Math.floor(rand() * 65536);
    if (v === FRAME_MARKER) v = 0x04b2;
    buf.writeUInt16LE(v, 2 * hw);
  }
  // Pixel values that happen to equal the marker: the derivation must not be fooled by them.
  for (let k = 0; k < noise; k++) {
    const hw = HEADER_BYTES / 2 + 1000 + Math.floor(rand() * (FRAME_BYTES / 2 - 2000));
    buf.writeUInt16LE(FRAME_MARKER, 2 * hw);
  }
  buf.writeUInt16LE(FRAME_MARKER, 0);
  buf.writeUInt16LE(index & 0x3fff, 2);
  buf.writeUInt16LE(type, HEADER_BYTES + 2 * TYPE_HALFWORD);
  return buf;
}

function loadFixture() {
  const dir = join(HERE, 'fixtures', 'stock-raw-2s');
  const manifest = JSON.parse(readFileSync(join(dir, 'frames.json'), 'utf8'));
  const stream = gunzipSync(readFileSync(join(dir, 'stream.bin.gz')));
  const frames = manifest.frames.map((r) => ({
    n: r.n,
    tCredit: r.tCredit,
    tFirst: r.tFirst,
    tDone: r.tDone,
    buf: stream.subarray(r.offset, r.offset + r.bytes),
    errors: r.errors,
  }));
  return { manifest, stream, frames };
}

describe('the frame geometry, derived from the frame size', () => {
  it('derives 208 halfwords per row for the raw frame, and no other value in 128..320', () => {
    const r = deriveRowWidth(FRAME_BYTES, { rawLayout: true });
    expect(r.width).toBe(208);
    expect(r.candidates).toEqual([208]);
  });

  it('does not pin the width for a body-only frame (no header to check against)', () => {
    const r = deriveRowWidth(0x7ec0 * 2, { rawLayout: false });
    expect(r.width).toBeNull();
    expect(r.candidates).toContain(208);
  });

  it('finds the frame size from the marker spacing, not from the marker alone', () => {
    const frames = [];
    for (let k = 0; k < 8; k++)
      frames.push(syntheticFrame({ index: 4 * k, type: 3, seed: 100 + k, noise: 60 }));
    const stream = Buffer.concat(frames);
    // The noise markers are there (pixel values equal to 0x04B1), and they must not win.
    expect(markerPositions(stream).length).toBeGreaterThan(8);
    const d = frameBytesFromMarkers(stream, markerPositions(stream));
    expect(d.bytes).toBe(FRAME_BYTES);
    expect(d.agree).toBeGreaterThanOrEqual(7);
  });

  it('reports no frame size when no pair of markers steps its index forward', () => {
    const buf = Buffer.alloc(64);
    expect(frameBytesFromMarkers(buf, [])).toBeNull();
  });

  it('does not overflow the stack on a noisy stream with more distinct spacings than a spread call takes', () => {
    // 6000 markers at random even offsets over 64 MB, each carrying its own sequence number as the index.
    // Pairs up to 64 markers apart pass the index test (about 384k pairs), and their spacings are spread
    // over several hundred thousand values, so the spacing map has more keys than a spread call accepts
    // (about 1e5 arguments): the old Math.max(...) over the spacing counts threw "Maximum call stack size
    // exceeded" on a stream like this.
    let seed = 2463534242; // xorshift32: an LCG here loses precision in doubles and its spacings collide
    const rand = () => {
      seed ^= seed << 13;
      seed >>>= 0;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      seed >>>= 0;
      return seed;
    };
    const buf = Buffer.alloc(64 << 20);
    const offsets = new Set();
    while (offsets.size < 6000) offsets.add((rand() % (buf.length / 2)) * 2);
    const sorted = [...offsets].sort((a, b) => a - b);
    sorted.forEach((p, k) => buf.writeUInt16LE(k + 1, p + 2));
    for (const p of sorted) buf.writeUInt16LE(FRAME_MARKER, p);
    const d = frameBytesFromMarkers(buf, sorted);
    expect(d).not.toBeNull();
    expect(Number.isInteger(d.bytes)).toBe(true);
    expect(d.of).toBeGreaterThan(100000);
  });
});

describe('one frame, parsed', () => {
  it('reads the frame type from halfword 10 of the first body row, after the 0x680-byte header', () => {
    const f = syntheticFrame({ index: 1234, type: 7, seed: 5 });
    const p = parseFrame(f, { raw: true, rowHw: 208 });
    expect(p.type).toBe(7);
    expect(p.marker).toBe(FRAME_MARKER);
    expect(p.index).toBe(1234);
    expect(p.bodyRows).toBe(156);
  });

  it('takes the mean over body rows 8 and on, and only those', () => {
    const f = Buffer.alloc(FRAME_BYTES);
    f.writeUInt16LE(FRAME_MARKER, 0);
    for (let hw = HEADER_BYTES / 2; hw < FRAME_BYTES / 2; hw++) {
      const row = Math.floor((hw - HEADER_BYTES / 2) / 208);
      f.writeInt16LE(row < 8 ? 5000 : -100, 2 * hw);
    }
    const p = parseFrame(f, { raw: true, rowHw: 208 });
    expect(p.mean).toBe(-100);
  });
});

describe('the summary of a run', () => {
  function run(types, indices, period = 0.125) {
    const frames = types.map((t, i) => ({
      n: i + 1,
      bytes: FRAME_BYTES,
      tDone: 100 + i * period * 1000,
      parsed: { bytes: FRAME_BYTES, marker: FRAME_MARKER, index: indices[i], type: t, mean: 10 },
    }));
    return summarize(frames, { frameBytes: FRAME_BYTES, raw: true });
  }

  it('counts the frame types and lists the non-thermal frames with their capture spacing', () => {
    const s = run([4, 1, 3, 3, 6, 3, 3], [0, 1, 4, 8, 12, 16, 20]);
    expect(s.typeHistogram).toEqual({ 1: 1, 3: 4, 4: 1, 6: 1 });
    expect(s.nonThermal.map((x) => [x.n, x.type, x.capturesSincePrevious])).toEqual([
      [1, 4, null],
      [2, 1, 1],
      [5, 6, 11],
    ]);
  });

  it('gives the frame rate from the span of complete frames and the thermal-only rate from type 3 alone', () => {
    const s = run([3, 3, 3, 3, 3], [0, 4, 8, 12, 16]);
    expect(s.fps).toBeCloseTo(8, 6);
    expect(s.thermal.fps).toBeCloseTo(8, 6);
    expect(s.intervalMs.median).toBeCloseTo(125, 6);
    expect(s.captures.indexDeltaHistogram).toEqual({ 4: 4 });
    expect(s.captures.perSecond).toBeCloseTo(32, 6);
  });

  it('counts a frame of the wrong size as incomplete and leaves it out of the rate', () => {
    const frames = [
      {
        n: 1,
        bytes: FRAME_BYTES,
        tDone: 0,
        parsed: { type: 3, index: 0, marker: FRAME_MARKER, mean: 0 },
      },
      {
        n: 2,
        bytes: 100,
        tDone: 100,
        parsed: { type: null, index: null, marker: null, mean: null },
      },
      {
        n: 3,
        bytes: FRAME_BYTES,
        tDone: 250,
        parsed: { type: 3, index: 4, marker: FRAME_MARKER, mean: 0 },
      },
    ];
    const s = summarize(frames, { frameBytes: FRAME_BYTES, raw: true });
    expect(s.complete).toBe(2);
    expect(s.incomplete).toBe(1);
    expect(s.fps).toBeCloseTo(1 / 0.25, 6);
  });

  it('formats a summary as text without throwing', () => {
    const text = formatSummary(run([4, 3, 3], [0, 1, 5]), 'synthetic');
    expect(text).toContain('synthetic');
    expect(text).toContain('frame type histogram');
  });
});

describe('the requests the measurer may send', () => {
  it('allows the stream start and stop and the frame credit, and nothing else', () => {
    expect(ALLOWED_OUT).toEqual({ SetOperationMode: 0x3c, ImageData: 0x53 });
    expect(Object.values(ALLOWED_OUT)).not.toContain(0x3e); // SetIPMode is never sent by the measurer
  });
});

describe('the helpers', () => {
  it('takes the median, the most common step and the histogram', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(modeOf([124.0, 124.0, 124.5, 90])).toBe(124);
    expect(histogram([4, 4, 1])).toEqual({ 1: 1, 4: 2 });
  });

  it('reads the image-processing mode from the start-up GetIPMode reply', () => {
    expect(ipModeOf([{ name: 'GetIPMode', hex: '0600' }])).toBe(6);
    expect(ipModeOf([{ name: 'GetIPMode', hex: '0800' }])).toBe(8);
    expect(ipModeOf([{ name: 'GetIPMode', error: 'x' }])).toBe('unread');
    expect(ipModeOf([])).toBe('unread');
  });
});

describe('a recorded stock run (fixture: 16 frames, IP mode 6, 1.3.0.0)', () => {
  const { manifest, frames } = loadFixture();

  it('is raw frames of the credit size, every one starting with the frame marker', () => {
    expect(manifest.raw).toBe(true);
    expect(manifest.creditBytes).toBe(FRAME_BYTES);
    expect(frames).toHaveLength(16);
    for (const f of frames) {
      expect(f.buf.length).toBe(FRAME_BYTES);
      expect(f.buf.readUInt16LE(0)).toBe(FRAME_MARKER);
    }
  });

  it('derives the frame size and the row width from the data', () => {
    const r = analyzeFrames(frames, { raw: true, creditBytes: FRAME_BYTES });
    expect(r.frameBytesDerived.bytes).toBe(FRAME_BYTES);
    expect(r.rowWidth.width).toBe(208);
    expect(r.bodyRows).toBe(156);
    expect(r.headerBytes).toBe(HEADER_BYTES);
  });

  it('shows the boot frames (types 4 and 1) and then thermal frames (type 3) only', () => {
    const r = analyzeFrames(frames, { raw: true, creditBytes: FRAME_BYTES });
    expect(r.summary.typeHistogram).toEqual({ 1: 1, 3: 14, 4: 1 });
    expect(r.summary.nonThermal.map((x) => x.type)).toEqual([4, 1]);
  });

  it('spaces the published frames four captures apart once the boot frames are past', () => {
    const r = analyzeFrames(frames, { raw: true, creditBytes: FRAME_BYTES });
    // Recorded: capture indices 0, 1, 3, 7, 11 ... 55. The boot gives a step of 1 and a step of 2; every later step is 4.
    expect(r.summary.captures.indexDeltaHistogram).toEqual({ 1: 1, 2: 1, 4: 13 });
    expect(r.summary.captures.perSecond).toBeGreaterThan(31);
    expect(r.summary.captures.perSecond).toBeLessThan(33.5);
  });

  it('runs at the stock 8 Hz: 8.05 fps of thermal frames, about 124 ms between them', () => {
    const r = analyzeFrames(frames, { raw: true, creditBytes: FRAME_BYTES });
    expect(r.summary.thermal.fps).toBeGreaterThan(7.8);
    expect(r.summary.thermal.fps).toBeLessThan(8.3);
    expect(r.summary.thermal.intervalMs.median).toBeGreaterThan(120);
    expect(r.summary.thermal.intervalMs.median).toBeLessThan(128);
    // The whole window is faster than the steady rate only because the boot frames come close together.
    expect(r.summary.fps).toBeGreaterThan(7.6);
    expect(r.summary.fps).toBeLessThan(9.5);
  });
});
