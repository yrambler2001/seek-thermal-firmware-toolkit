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

/** The non-picture frames by their header status, in words (camera.ts grabVisualFrame). */
const STATUS_WORDS: Readonly<Record<number, string>> = {
  1: 'shutter',
  4: 'gain calibration',
  6: 'reference',
};

/** The frames, by header status, that arrived between two snapshots of a camera's counts. */
export function statusCountsSince(
  before: ReadonlyMap<number, number>,
  after: ReadonlyMap<number, number>,
): Map<number, number> {
  const out = new Map<number, number>();
  for (const [status, count] of after) {
    const n = count - (before.get(status) ?? 0);
    if (n > 0) out.set(status, n);
  }
  return out;
}

/**
 * The line `--fps` prints after "overall" when frames that are not pictures came during the measurement: they
 * are the camera's own shutter calibration (a reference frame, status 6, then a shutter frame, status 1), which
 * takes about 17 sensor fields (525 ms at 8 Hz) in which no picture is published. The per-second median is the
 * picture rate between them; the frame count is lower by those gaps. On the stock 1.3.0.0 Compact in Normal
 * mode the first 5 s of a stream hold four such calibrations, so 27 pictures, then one comes every 3 s
 * (TESTING.md 42.103). Status 3 is a picture and status 0 has its own line, so neither is named here. Null when
 * every frame was a picture.
 */
export function notPicturesLine(
  counts: ReadonlyMap<number, number>,
  seconds: number,
): string | null {
  const others = [...counts]
    .filter(([status]) => status !== 3 && status !== 0)
    .sort((a, b) => a[0] - b[0]);
  if (others.length === 0) return null;
  const all = [...counts.values()].reduce((sum, n) => sum + n, 0);
  const named = others
    .map(
      ([status, n]) => `${String(n)} ${STATUS_WORDS[status] ?? 'other'} (status ${String(status)})`,
    )
    .join(', ');
  return (
    `not pictures, in the measurement: ${named}; all frames ${String(all)} ` +
    `(${(all / seconds).toFixed(2)} fps). The median is the picture rate between them; ` +
    'the count is lower by the time they take.'
  );
}
