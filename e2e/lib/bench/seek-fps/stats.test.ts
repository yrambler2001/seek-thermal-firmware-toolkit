/* The per-second windows of `seek --fps` and the frame counters of `seek stream` (FPSWindow and main.swift). */
import { describe, expect, it } from 'vitest';

import { compactFrame } from './fake-camera.js';
import { SeekFrame } from './frame.js';
import { FrameStats, fpsWindows, median } from './stats.js';

describe('FPSWindow (FrameTests.swift)', () => {
  it('reports mean and median per second', () => {
    // 4 frames in the first second at 0.25 s spacing, 2 in the second at 0.5 s spacing
    const stamps = [0.0, 0.25, 0.5, 0.75, 1.0, 1.5];
    const w = fpsWindows(stamps, 2);
    expect(w[0]!.frames).toBe(4);
    expect(w[0]!.mean).toBe(4);
    expect(w[0]!.median).toBeCloseTo(4, 3);
    expect(w[1]!.frames).toBe(2);
    expect(w[1]!.median).toBeCloseTo(3, 3); // rates 4 and 2
  });

  it('numbers the seconds from 1 and starts them at the first frame', () => {
    const w = fpsWindows([10, 10.1, 10.2, 11.05], 2);
    expect(w.map((x) => x.second)).toEqual([1, 2]);
    expect(w[0]!.frames).toBe(3);
    expect(w[1]!.frames).toBe(1);
  });

  it('gives no windows for no frames, and a zero median for an empty second', () => {
    expect(fpsWindows([], 5)).toEqual([]);
    const w = fpsWindows([0, 3.2], 4);
    expect(w[1]!.frames).toBe(0);
    expect(w[1]!.median).toBe(0);
  });

  it("a window's rates come from the intervals that end inside it", () => {
    // the interval that starts in second 1 and ends in second 2 counts for second 2
    const w = fpsWindows([0, 0.9, 1.2], 2);
    expect(w[0]!.frames).toBe(2);
    expect(w[0]!.median).toBeCloseTo(1 / 0.9, 9);
    expect(w[1]!.median).toBeCloseTo(1 / 0.3, 9);
  });
});

describe('median', () => {
  it('takes the middle of an odd count and the mean of the two middles of an even one', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBe(0);
  });
});

describe('FrameStats (the stream and --fps counters)', () => {
  it('counts a frozen pair when two consecutive frames are identical', () => {
    const s = new FrameStats();
    const a = new SeekFrame(compactFrame(3, 5000), 206, 156, 1000, 65000);
    const b = new SeekFrame(compactFrame(3, 5000), 206, 156, 1000, 65000);
    s.record(a, 0.1);
    s.record(b, 0.2);
    expect(s.pairs).toBe(1);
    expect(s.frozenPairs).toBe(1);
    expect(s.meanChanged()).toBe(0);
  });

  it('measures the share of changed pixels between consecutive frames', () => {
    const s = new FrameStats();
    const a = new SeekFrame(compactFrame(3, 5000), 206, 156, 1000, 65000);
    const b = new SeekFrame(compactFrame(3, 5001), 206, 156, 1000, 65000);
    s.record(a, 0.1);
    s.record(b, 0.2);
    expect(s.pairs).toBe(1);
    expect(s.frozenPairs).toBe(0);
    // every usable pixel changed; the 4 header words that are the same in both frames did not
    expect(s.meanChanged()).toBeCloseTo(1, 3);
    expect(s.stamps).toEqual([0.1, 0.2]);
    expect(s.latest).toBe(b);
  });

  it('keeps the pair counters when the stamps are cleared (as --fps does before it measures)', () => {
    const s = new FrameStats();
    const f = new SeekFrame(compactFrame(3, 5000), 206, 156, 1000, 65000);
    s.record(f, 0.1);
    s.clearStamps();
    expect(s.stamps).toEqual([]);
    expect(s.latest).toBe(f);
  });
});
