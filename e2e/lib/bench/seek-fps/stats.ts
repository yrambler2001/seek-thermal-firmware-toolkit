/* ==================================================================== *
 * Frame-rate bookkeeping for the checker: the per-second windows of `seek --fps`, and the
 * per-frame counters `seek stream` prints (frozen pairs, the share of pixels that changed).
 *
 * Port of FPSWindow in tv-jc/macos/Sources/SeekKit/Render.swift and of the onFrame closure
 * in tv-jc/macos/Sources/seek/main.swift. Nothing here reads a clock of its own: the caller
 * passes the arrival times, so the windows are a pure function of them.
 * ==================================================================== */

import type { SeekFrame } from './frame.js';

export interface FpsWindow {
  /** 1-based second. */
  readonly second: number;
  /** Frames whose arrival time falls in the second. Swift: `frames`, and the window's `mean`. */
  readonly frames: number;
  /** Equal to `frames`: the mean fps of a one-second window (Swift `mean: Double(inWin.count)`). */
  readonly mean: number;
  /** Median of the instantaneous rates of the intervals that END inside the second. */
  readonly median: number;
}

/** The median of `values`, or 0 for none (the Swift windows report 0 for an empty second). */
export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  const at = (i: number): number => sorted[i] ?? 0;
  return sorted.length % 2 === 1 ? at(mid) : (at(mid - 1) + at(mid)) / 2;
}

/**
 * `stamps` are frame arrival times in seconds, ascending. Windows are one second long, starting
 * at the first frame, `seconds` of them (Swift FPSWindow.windows(stamps:seconds:)).
 */
export function fpsWindows(stamps: readonly number[], seconds: number): FpsWindow[] {
  const first = stamps[0];
  if (first === undefined) return [];
  const out: FpsWindow[] = [];
  for (let s = 0; s < seconds; s++) {
    const lo = first + s;
    const hi = lo + 1;
    const inWindow: number[] = [];
    for (let i = 0; i < stamps.length; i++) {
      const t = stamps[i] ?? Number.NaN;
      if (t >= lo && t < hi) inWindow.push(i);
    }
    // Intervals ending inside the window give the instantaneous rates.
    const rates: number[] = [];
    for (const i of inWindow) {
      const now = stamps[i] ?? 0;
      const before = stamps[i - 1] ?? 0;
      if (i > 0 && now > before) rates.push(1 / (now - before));
    }
    out.push({
      second: s + 1,
      frames: inWindow.length,
      mean: inWindow.length,
      median: median(rates),
    });
  }
  return out;
}

/**
 * What `seek stream` and `seek --fps` count per frame. `record` is the Swift onFrame body:
 * the arrival stamp, the latest frame, and the comparison with the previous frame.
 */
export class FrameStats {
  /** Arrival times in seconds, from the clock's origin. */
  readonly stamps: number[] = [];
  /** The newest frame (Swift `latest`). */
  latest: SeekFrame | null = null;
  /** Consecutive pairs with no changed pixel (Swift `frozenPairs`). */
  frozenPairs = 0;
  /** Consecutive pairs compared (Swift `pairs`). */
  pairs = 0;
  private changedSum = 0;
  private previous: Uint16Array | null = null;

  record(frame: SeekFrame, nowSeconds: number): void {
    this.latest = frame;
    this.stamps.push(nowSeconds);
    if (this.previous !== null && this.previous.length === frame.data.length) {
      let changed = 0;
      for (let i = 0; i < frame.data.length; i++) {
        if (frame.data[i] !== this.previous[i]) changed += 1;
      }
      this.pairs += 1;
      this.changedSum += changed / frame.data.length;
      if (changed === 0) this.frozenPairs += 1;
    }
    this.previous = frame.data.slice();
  }

  /** Mean share of pixels that changed between consecutive frames, 0..1 (0 with no pairs). */
  meanChanged(): number {
    return this.pairs > 0 ? this.changedSum / this.pairs : 0;
  }

  /** Forget the arrival times (Swift `stamps.removeAll()`); the pair counters are kept. */
  clearStamps(): void {
    this.stamps.length = 0;
  }
}
