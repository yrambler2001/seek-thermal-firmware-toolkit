/* ==================================================================== *
 * One camera frame: decode and the calibration / cleanup steps.
 *
 * Port of tv-jc/macos/Sources/SeekKit/Frame.swift (OLD_ThermalFrame, the Seek Thermal part of
 * ThermoVision JoeC). Same arithmetic, same order of the in-place passes. Two things in the
 * Swift are kept on purpose and are NOT fixed here, because the measurements were taken with
 * them:
 *
 *   - the Compact hexagon skip: the Swift walks BYTE offsets (i += 2) and compares them with a
 *     hexagon position that starts at byte 10 and moves to 25 after the first hit. 25 is odd and
 *     the walk is even, so only the byte-10 word (column 5 of row 0) is ever skipped;
 *   - the Pro's rows are 342 words (320 pixels and 22 others) and the image starts at byte 2736.
 *
 * Nothing here talks to a camera. The frame is the body the camera sends for one ImageData
 * credit: 64896 bytes for the Compact (206 x 156 pixels in 208-word rows) and 177840 bytes for
 * the Pro (320 x 240 pixels in 342-word rows).
 * ==================================================================== */

export const COMPACT_WIDTH = 206;
export const COMPACT_HEIGHT = 156;
export const PRO_WIDTH = 320;
export const PRO_HEIGHT = 240;
/** The bulk length of one Compact frame (ImageData wValue 0x7EC0 halfwords). */
export const COMPACT_FRAME_BYTES = 64896;
/** The bulk length of one Pro frame (ImageData 0x15B58 halfwords). */
export const PRO_FRAME_BYTES = 177840;

/** The Swift `UInt16(bytes[i + 1]) << 8 | UInt16(bytes[i])` little-endian word. */
function wordAt(bytes: Uint8Array, i: number): number {
  return ((bytes[i + 1] ?? 0) << 8) | (bytes[i] ?? 0);
}

/** Truncating integer division for the non-negative values here (Swift's `sum / count`). */
function div(a: number, b: number): number {
  return Math.floor(a / b);
}

/** Swift's `Int(Double)`: truncation toward zero. */
function trunc(value: number): number {
  return Math.trunc(value);
}

/** Swift's `UInt16(truncatingIfNeeded:)` for a non-negative integer. */
function u16(value: number): number {
  return value & 0xffff;
}

export class SeekFrame {
  readonly width: number;
  readonly height: number;
  readonly isPro: boolean;
  /** Row-major raw counts, width x height. */
  readonly data: Uint16Array;
  status = 0;
  deviceTemp = 0;
  frameCount = 0;
  average = 0;
  minValue = 0xffff;
  maxValue = 0;

  /** Decode one raw bulk transfer (`bytes`) of `width` x `height` pixels. */
  constructor(bytes: Uint8Array, width: number, height: number, rawMin: number, rawMax: number) {
    this.width = width;
    this.height = height;
    this.isPro = width === PRO_WIDTH;
    this.data = new Uint16Array(width * height);
    let sum = 0;
    let count = 0;
    let x = 0;
    let y = 0;
    if (this.isPro) {
      this.status = bytes[4] ?? 0;
      this.deviceTemp = ((bytes[11] ?? 0) << 8) | (bytes[10] ?? 0);
      this.frameCount = ((bytes[9] ?? 0) << 8) | (bytes[8] ?? 0);
      for (let i = 2736; i + 1 < bytes.length; i += 2) {
        const v = wordAt(bytes, i);
        if (x < width) {
          if (this.status !== 3) {
            if (v > rawMin && v < rawMax) {
              sum += v;
              count += 1;
              this.data[y * width + x] = v;
            }
          } else {
            sum += v;
            count += 1;
            this.data[y * width + x] = v;
          }
        }
        x += 1;
        if (x === width + 22) {
          y += 1;
          x = 0;
          if (y === height) break;
        }
      }
    } else {
      this.status = bytes[20] ?? 0;
      this.deviceTemp = ((bytes[3] ?? 0) << 8) | (bytes[2] ?? 0);
      this.frameCount = ((bytes[81] ?? 0) << 8) | (bytes[80] ?? 0);
      let hexagon = 10;
      for (let i = 0; i + 1 < bytes.length; i += 2) {
        const v = wordAt(bytes, i);
        if (i === hexagon) {
          hexagon += 15;
        } else if (x < width) {
          if (v > rawMin && v < rawMax) {
            sum += v;
            count += 1;
          }
          this.data[y * width + x] = v;
        }
        x += 1;
        if (x === width + 2) {
          y += 1;
          x = 0;
          if (y === height) break;
        }
      }
    }
    if (count > 0) this.average = u16(div(sum, count));
  }

  /** The Compact's hexagon pattern pixels, which carry no image (Swift isPatternPixel). */
  static isPatternPixel(x: number, y: number): boolean {
    let start = (10 - y * 4) % 15;
    if (start < 0) start += 15;
    return x >= start && (x - start) % 15 === 0;
  }

  /** true = usable pixel, false = dead (Swift deadPixelMap). */
  deadPixelMap(rawMin: number, rawMax: number): boolean[] {
    const out = new Array<boolean>(this.width * this.height).fill(false);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const v = this.data[y * this.width + x] ?? 0;
        if (v < rawMin || v > rawMax) {
          out[y * this.width + x] = false;
        } else {
          out[y * this.width + x] = this.isPro ? true : !SeekFrame.isPatternPixel(x, y);
        }
      }
    }
    if (!this.isPro) {
      out[1] = false; // temperature word
      out[40] = false; // frame counter
    }
    return out;
  }

  /**
   * Per-pixel gain against the average of a gain-calibration frame. Marks the pixels it cannot use
   * as dead in `deadMap` (in place), and returns the gains (Swift gains(deadMap:divisor:...)).
   */
  gains(deadMap: boolean[], divisor: number, rawMin: number, rawMax: number): Float64Array {
    const out = new Float64Array(this.width * this.height).fill(1);
    for (let i = 0; i < this.width * this.height; i++) {
      if (!(deadMap[i] ?? false)) continue;
      const source = this.data[i] ?? 0;
      if (source > rawMin && source < rawMax) {
        let val = divisor / source;
        if (val < -100 || val > 100) {
          val = 1;
          deadMap[i] = false;
        }
        if (val === 0) {
          val = 1;
          deadMap[i] = false;
        }
        out[i] = val;
      } else {
        deadMap[i] = false;
      }
    }
    return out;
  }

  /** Shutter reference subtraction and gain, re-centred on `average` (Swift shutterGainCal). */
  shutterGainCal(
    deadMap: readonly boolean[],
    shutter: Uint16Array,
    gains: Float64Array | null,
    average: number,
  ): void {
    for (let i = 0; i < this.width * this.height; i++) {
      if (!(deadMap[i] ?? false)) continue;
      const g = gains?.[i] ?? 1;
      let v = trunc(((this.data[i] ?? 0) - (shutter[i] ?? 0)) * g) + average;
      if (v < 0) v = 0;
      if (v > 0xffff) v = 0xffff;
      this.data[i] = v;
    }
  }

  offsetCal(deadMap: readonly boolean[], offsets: Int16Array): void {
    for (let i = 0; i < this.width * this.height; i++) {
      if (!(deadMap[i] ?? false)) continue;
      let v = (this.data[i] ?? 0) + (offsets[i] ?? 0);
      if (v < 0) v = 0;
      if (v > 0xffff) v = 0xffff;
      this.data[i] = v;
    }
  }

  /** Running 9:1 blend of shutter reference frames into this frame (Swift average10). */
  average10(deadMap: readonly boolean[], other: Uint16Array): void {
    for (let i = 0; i < this.width * this.height; i++) {
      if (!(deadMap[i] ?? false)) continue;
      this.data[i] = u16(div((this.data[i] ?? 0) * 9 + (other[i] ?? 0), 10));
    }
  }

  offsetMap(deadMap: readonly boolean[]): Int16Array {
    const out = new Int16Array(this.width * this.height);
    for (let i = 0; i < this.width * this.height; i++) {
      if (!(deadMap[i] ?? false)) continue;
      out[i] = (((this.data[i] ?? 0) - this.average) << 16) >> 16;
    }
    return out;
  }

  /** Min, max and mean of the usable pixels; with zeroOffset, pixels under 3000 take the running max. */
  calcMinMax(deadMap: readonly boolean[], zeroOffset: boolean): void {
    let sum = 0;
    let count = 0;
    this.minValue = 0xffff;
    this.maxValue = 0;
    for (let i = 0; i < this.width * this.height; i++) {
      if (!(deadMap[i] ?? false)) continue;
      if (zeroOffset && (this.data[i] ?? 0) < 3000) {
        this.data[i] = this.maxValue;
        continue;
      }
      sum += this.data[i] ?? 0;
      count += 1;
      if ((this.data[i] ?? 0) < this.minValue) this.minValue = this.data[i] ?? 0;
      if ((this.data[i] ?? 0) > this.maxValue) this.maxValue = this.data[i] ?? 0;
    }
    if (count > 0) this.average = u16(div(sum, count));
  }

  /** Replace each dead pixel by the mean of its valid neighbours (Swift removeDeadPixels). */
  removeDeadPixels(dp: readonly boolean[]): void {
    const w = this.width;
    const h = this.height;
    const d = this.data;
    const x1 = w - 1;
    const y1 = h - 1;
    const x2 = w - 2;
    const y2 = h - 2;
    const at = (x: number, y: number): number => y * w + x;

    const meanOfValid = (cells: readonly (readonly [number, number])[]): number | null => {
      let sum = 0;
      let n = 0;
      for (const [cx, cy] of cells) {
        if (dp[at(cx, cy)] ?? false) {
          sum += d[at(cx, cy)] ?? 0;
          n += 1;
        }
      }
      return n === 0 ? null : u16(div(sum, n));
    };

    for (let y = 1; y < y1; y++) {
      for (let x = 1; x < x1; x++) {
        if (dp[at(x, y)] ?? false) continue;
        let sum = 0;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const i = at(x + dx, y + dy);
            if (dp[i] ?? false) {
              sum += d[i] ?? 0;
              n += 1;
            }
          }
        }
        if (n !== 0) {
          d[at(x, y)] = u16(div(sum, n));
          continue;
        }
        // No valid neighbour: the nearest valid pixel in each of the four directions.
        let n2 = x - 2;
        let s2 = x + 2;
        let w2 = y - 2;
        let e2 = y + 2;
        while (n2 > 0) {
          if (dp[at(n2, y)] ?? false) {
            sum += d[at(n2, y)] ?? 0;
            n += 1;
            break;
          }
          n2 -= 1;
        }
        while (s2 < w) {
          if (dp[at(s2, y)] ?? false) {
            sum += d[at(s2, y)] ?? 0;
            n += 1;
            break;
          }
          s2 += 1;
        }
        while (w2 > 0) {
          if (dp[at(x, w2)] ?? false) {
            sum += d[at(x, w2)] ?? 0;
            n += 1;
            break;
          }
          w2 -= 1;
        }
        while (e2 < h) {
          if (dp[at(x, e2)] ?? false) {
            sum += d[at(x, e2)] ?? 0;
            n += 1;
            break;
          }
          e2 += 1;
        }
        d[at(x, y)] = n !== 0 ? u16(div(sum, n)) : this.average;
      }
    }
    for (let y = 1; y < y1; y++) {
      if (!(dp[at(0, y)] ?? false)) {
        const v = meanOfValid([
          [0, y - 1],
          [1, y - 1],
          [1, y],
          [0, y + 1],
          [1, y + 1],
        ]);
        if (v !== null) d[at(0, y)] = v;
      }
      if (!(dp[at(x1, y)] ?? false)) {
        const v = meanOfValid([
          [x2, y - 1],
          [x1, y - 1],
          [x2, y],
          [x2, y + 1],
          [x1, y + 1],
        ]);
        if (v !== null) d[at(x1, y)] = v;
      }
    }
    for (let x = 1; x < x1; x++) {
      if (!(dp[at(x, 0)] ?? false)) {
        const v = meanOfValid([
          [x - 1, 0],
          [x + 1, 0],
          [x - 1, 1],
          [x, 1],
          [x + 1, 1],
        ]);
        if (v !== null) d[at(x, 0)] = v;
      }
      if (!(dp[at(x, y1)] ?? false)) {
        const v = meanOfValid([
          [x - 1, y2],
          [x, y2],
          [x + 1, y2],
          [x - 1, y1],
          [x + 1, y1],
        ]);
        if (v !== null) d[at(x, y1)] = v;
      }
    }
    const corners: readonly [number, number, readonly (readonly [number, number])[]][] = [
      [
        0,
        0,
        [
          [1, 0],
          [0, 1],
          [1, 1],
        ],
      ],
      [
        x1,
        0,
        [
          [x2, 0],
          [x2, 1],
          [x1, 1],
        ],
      ],
      [
        0,
        y1,
        [
          [0, y2],
          [1, y2],
          [1, y1],
        ],
      ],
      [
        x1,
        y1,
        [
          [x2, y2],
          [x1, y2],
          [x2, y1],
        ],
      ],
    ];
    for (const [cx, cy, cells] of corners) {
      if (!(dp[at(cx, cy)] ?? false)) {
        const v = meanOfValid(cells);
        if (v !== null) d[at(cx, cy)] = v;
      }
    }
  }
}
