/* Frame decode and the calibration steps: the Swift FrameTests.swift cases, and the cases the port adds. */
import { describe, expect, it } from 'vitest';

import { COMPACT_FRAME_BYTES, PRO_FRAME_BYTES, SeekFrame } from './frame.js';
import { compactFrame, proFrame } from './fake-camera.js';

const W = 206;
const H = 156;

describe('Compact frame decode (FrameTests.swift)', () => {
  it('reads the header: status, device temperature, frame counter, and the size of the image', () => {
    const f = new SeekFrame(compactFrame(3, 5000), W, H, 1000, 65000);
    expect(f.status).toBe(3);
    expect(f.deviceTemp).toBe(0x1234);
    expect(f.frameCount).toBe(7);
    expect(f.data.length).toBe(W * H);
    expect(f.isPro).toBe(false);
  });

  it('averages only the in-range pixels: an out-of-range pixel is not counted and not stored', () => {
    const b = compactFrame(3, 5000);
    // pixel (100, 50): word index 50 * 208 + 100
    const w = 50 * 208 + 100;
    b[w * 2] = 0;
    b[w * 2 + 1] = 0;
    const f = new SeekFrame(b, W, H, 1000, 65000);
    // header words are in range too; the average is within 2 of 5000
    expect(Math.abs(f.average - 5000)).toBeLessThanOrEqual(2);
    expect(f.data[50 * W + 100]).toBe(0);
  });

  it('keeps the hexagon skip exactly as the Swift has it: only the byte-10 word of row 0 is skipped', () => {
    // the Swift compares a BYTE offset with a hexagon position that moves to 25 after its first hit; 25 is odd
    const b = compactFrame(3, 5000);
    b[10] = 0x11;
    b[11] = 0x22;
    const f = new SeekFrame(b, W, H, 1000, 65000);
    expect(f.data[5]).toBe(0); // column 5 of row 0: never stored
    expect(f.data[6]).toBe(5000); // the next word is a pixel
  });
});

describe('pattern pixels and the dead-pixel map', () => {
  it('finds the hexagon pattern pixels (FrameTests.swift)', () => {
    expect(SeekFrame.isPatternPixel(10, 0)).toBe(true);
    expect(SeekFrame.isPatternPixel(25, 0)).toBe(true);
    expect(SeekFrame.isPatternPixel(11, 0)).toBe(false);
  });

  it('moves the pattern by 4 columns per row, modulo 15', () => {
    expect(SeekFrame.isPatternPixel(6, 1)).toBe(true); // (10 - 4) % 15 = 6
    expect(SeekFrame.isPatternPixel(21, 1)).toBe(true);
    expect(SeekFrame.isPatternPixel(10, 1)).toBe(false);
    // y = 4: (10 - 16) % 15 = -6, which wraps to 9
    expect(SeekFrame.isPatternPixel(9, 4)).toBe(true);
  });

  it('marks the temperature and frame-counter words dead, and out-of-range pixels dead', () => {
    const b = compactFrame(3, 5000);
    b[2 * 80] = 0; // pixel (80, 0) out of range
    b[2 * 80 + 1] = 0;
    const f = new SeekFrame(b, W, H, 1000, 65000);
    const dead = f.deadPixelMap(1000, 65000);
    expect(dead[1]).toBe(false); // the temperature word
    expect(dead[40]).toBe(false); // the frame counter
    expect(dead[80]).toBe(false); // out of range
    expect(dead[10]).toBe(false); // a pattern pixel on row 0
    expect(dead[11]).toBe(true); // an ordinary usable pixel
  });
});

describe('dead-pixel filling (FrameTests.swift and the port)', () => {
  it('fills a dead pixel from the mean of its valid neighbours', () => {
    const f = new SeekFrame(compactFrame(3, 5000), W, H, 1000, 65000);
    const dead = new Array<boolean>(W * H).fill(true);
    dead[80 * W + 80] = false;
    f.data[80 * W + 80] = 0;
    f.removeDeadPixels(dead);
    expect(f.data[80 * W + 80]).toBe(5000);
  });

  it('with no valid neighbour, takes the nearest valid pixel in one direction', () => {
    const f = new SeekFrame(compactFrame(3, 5000), W, H, 1000, 65000);
    const dead = new Array<boolean>(W * H).fill(false);
    // the only valid pixel in reach of (80, 80) is (80, 60), two rows above its search start
    dead[60 * W + 80] = true;
    f.data[60 * W + 80] = 4000;
    f.removeDeadPixels(dead);
    expect(f.data[80 * W + 80]).toBe(4000);
  });

  it('fills a corner from its three valid neighbours (the edge and corner passes)', () => {
    const f = new SeekFrame(compactFrame(3, 5000), W, H, 1000, 65000);
    // the decoded map: the temperature word (1,0) is dead, so the corner's usable neighbours are (0,1) and (1,1)
    const usable = f.deadPixelMap(1000, 65000);
    usable[0] = false; // the top-left corner is dead
    f.data[0] = 0;
    f.removeDeadPixels(usable);
    expect(f.data[0]).toBe(5000);
    // with every pixel usable, the temperature word (4660) is one of the three neighbours
    const g = new SeekFrame(compactFrame(3, 5000), W, H, 1000, 65000);
    const all = new Array<boolean>(W * H).fill(true);
    all[0] = false;
    g.data[0] = 0;
    g.removeDeadPixels(all);
    expect(g.data[0]).toBe(Math.floor((0x1234 + 5000 + 5000) / 3));
  });
});

describe('Pro frame decode', () => {
  it('reads the header and the 320 x 240 image from byte 2736', () => {
    const f = new SeekFrame(proFrame(3, 4321), 320, 240, 1000, 65000);
    expect(f.isPro).toBe(true);
    expect(f.status).toBe(3);
    expect(f.data.length).toBe(320 * 240);
    expect(f.data[0]).toBe(4321);
  });

  it('keeps out-of-range pixels only on status 3, as the Swift does', () => {
    const b = proFrame(1, 500); // below the raw range
    const f1 = new SeekFrame(b, 320, 240, 1000, 65000);
    expect(f1.data[0]).toBe(0);
    const f3 = new SeekFrame(proFrame(3, 500), 320, 240, 1000, 65000);
    expect(f3.data[0]).toBe(500);
    expect(PRO_FRAME_BYTES).toBe(177840);
    expect(COMPACT_FRAME_BYTES).toBe(64896);
  });
});

describe('calibration steps', () => {
  it('shutterGainCal subtracts the shutter frame, applies the gain and re-centres on the average', () => {
    const f = new SeekFrame(compactFrame(3, 2000), W, H, 1000, 65000);
    const dead = new Array<boolean>(W * H).fill(true);
    const shutter = new Uint16Array(W * H).fill(1000);
    f.shutterGainCal(dead, shutter, null, 500);
    expect(f.data[0]).toBe(1500); // (2000 - 1000) * 1 + 500
  });

  it('average10 blends 9:1 with the other frame', () => {
    const f = new SeekFrame(compactFrame(3, 1000), W, H, 1000, 65000);
    const dead = new Array<boolean>(W * H).fill(true);
    f.average10(dead, new Uint16Array(W * H).fill(2000));
    expect(f.data[0]).toBe(1100); // (1000 * 9 + 2000) / 10
  });

  it('offsetMap is the pixel minus the average, and offsetCal adds it back', () => {
    const f = new SeekFrame(compactFrame(3, 1200), W, H, 1000, 65000);
    f.calcMinMax(new Array<boolean>(W * H).fill(true), false);
    const dead = new Array<boolean>(W * H).fill(true);
    const map = f.offsetMap(dead);
    expect(map[0]).toBe((f.data[0] ?? 0) - f.average);
    const g = new SeekFrame(compactFrame(3, 1000), W, H, 1000, 65000);
    g.offsetCal(dead, map);
    expect(g.data[0]).toBe(1000 + (map[0] ?? 0));
  });

  it('gains are the divisor over the pixel, and a pixel that would be extreme goes dead', () => {
    const f = new SeekFrame(compactFrame(3, 2000), W, H, 1000, 65000);
    const dead = new Array<boolean>(W * H).fill(true);
    const gains = f.gains(dead, 4000, 1000, 65000);
    expect(gains[0]).toBeCloseTo(2, 9); // 4000 / 2000
    const g = new SeekFrame(compactFrame(3, 2000), W, H, 1000, 65000);
    const deadG = new Array<boolean>(W * H).fill(true);
    deadG[0] = true;
    g.data[0] = 2000;
    const gains2 = g.gains(deadG, 2000 * 200, 1000, 65000); // ratio 200: beyond the 100 limit
    expect(gains2[0]).toBe(1);
    expect(deadG[0]).toBe(false);
  });

  it('calcMinMax replaces a pixel under 3000 by the running maximum when zeroOffset is set', () => {
    const f = new SeekFrame(compactFrame(3, 5000), W, H, 1000, 65000);
    const dead = new Array<boolean>(W * H).fill(false);
    dead[0] = true;
    dead[1] = true;
    f.data[0] = 4000;
    f.data[1] = 2000;
    f.calcMinMax(dead, true);
    expect(f.data[1]).toBe(4000);
    expect(f.minValue).toBe(4000);
    expect(f.maxValue).toBe(4000);
    expect(f.average).toBe(4000);
  });
});
