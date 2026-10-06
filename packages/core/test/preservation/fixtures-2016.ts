/* ==================================================================== *
 * A synthetic Compact PRO 1.0.3.0 camera, for the unit tests of core, the
 * CLI and the web: no vendored firmware, only what the pipeline reads.
 *
 * THE IMAGE (`cp1030Plain`) carries everything the cipher solver and the
 * build table read on the real 1.0.3.0 plaintext — the vector table's
 * reserved zeros (the crib), the segmented container, the window ladder, the
 * mode-2 guard and the 2016 widen tail in the Begin window, the 2016 arm tail
 * after it, the upgrade token, the real cp103 key blocks, a header that says
 * 1.0.3.0, word sum 0 — and, at 0x6D4C, the factory bytes the board patch
 * replaces. Everything else is a deterministic fill. `boardPatched` applies
 * the known derivation to it, as `scripts/patch-dump.mjs` does to the bench
 * camera's banks.
 *
 * THE CAMERA (`cp1030Camera`) is the bench part's shape: the boot-config
 * block erased, the device-identity block at 0x14020000, banks A, B and R
 * holding the image under the at-rest device stream (key block 1, the header
 * window verbatim), the locked line's selector map with mode 2 widened, and
 * the 2016 app's commit: the stage decrypted with key block 0, refused unless
 * it sums to 0, stored under key block 1.
 * ==================================================================== */

import { hexToBytes, viewOf } from '../../src/bytes.js';
import { FLASH_SIZE } from '../../src/profiles/modern-4x.js';
import {
  KNOWN_DERIVATIONS,
  REBALANCE_WORD_OFFSET,
  applyDerivation,
  keyWordsOf,
  keystream,
  wordSum,
  xorWindowVerbatim,
  type ImageDerivation,
} from '../../src/preservation/patch.js';
import { FakeCamera, type FakeWindowSpec } from '../fake-transport.js';

/** Long enough to hold the board patch's site (0x6D4C) — the real image is 51,848 B. */
export const CP1030_LENGTH = 0x8000;
export const CP1030_VERSION = '1.0.3.0';
/** Little-endian bytes 01 00 03 00 -> "1.0.3.0". */
const VERSION_WORD_1030 = 0x0003_0001;

export const KEY_CP103 = {
  block0: '67a3ea21824fecc4b3c3b0a8da514669',
  block1: 'faacb3c6f1412469bd122fb82d78160d',
} as const;

const LADDER_AT = 0x3000;
/** The 2016 widen tail; the patched mov.w is at +2. */
export const WIDEN_2016_TAIL_AT = LADDER_AT - 0x4c;
export const GUARD_SHAPE_AT = LADDER_AT - 0x154;
/** `movs r5,#0; str r3,[r4,#24]; movs r3,#8; str r5,[r4,#4]; str r5,[r4,#12]`,
 *  at the widen site + 0x0C, as on the real image. */
const ARM_TAIL_2016_HEX = '0025a36108236560e560';

export const BOARD_PATCH: ImageDerivation = (() => {
  const found = KNOWN_DERIVATIONS.find((d) => d.id === 'compact-pro-1.0.3.0-accept-pn297');
  if (found === undefined) throw new Error('the board patch is not in KNOWN_DERIVATIONS');
  return found;
})();

/** The device-identity block's head (header word, then a serial), as at 0x14020000. */
export const DEVICE_BLOCK_HEAD = hexToBytes(
  '010031f70c002100370023005f00d4003043323141314d354b503135',
);

export interface Cp1030Options {
  /** Leave the 2016 arm tail out (a build whose arm reset is unknown). */
  readonly noArmTail?: boolean;
}

/** The synthetic factory 1.0.3.0 plaintext. */
export function cp1030Plain(options: Cp1030Options = {}): Uint8Array {
  const bytes = new Uint8Array(CP1030_LENGTH);
  let state = 0x2468ace1;
  for (let i = 0; i < bytes.length; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    bytes[i] = state & 0xff;
  }
  const put = (at: number, hex: string): void => {
    bytes.set(hexToBytes(hex), at);
  };
  const dv = viewOf(bytes);
  /* The Cortex-M vector table: SP, reset (Thumb), the reserved zeros. */
  dv.setUint32(0, 0x10002000, true);
  dv.setUint32(4, 0x100806a5, true);
  for (const word of [7, 8, 9, 10, 13]) dv.setUint32(word * 4, 0, true);
  /* The segmented container: the code-payload descriptor at 0x290. */
  dv.setUint32(0x290, 0x140002c0, true);
  dv.setUint32(0x294, 0x10080628, true);
  dv.setUint32(0x298, 0x1000, true);
  dv.setUint32(0x29c, 0, true);
  /* The update machinery, inside the Begin window. */
  put(LADDER_AT, '00000614000005140000021400000014');
  put(WIDEN_2016_TAIL_AT, '63614ff48033a3602361');
  if (options.noArmTail !== true) put(WIDEN_2016_TAIL_AT + 2 + 0x0c, ARM_TAIL_2016_HEX);
  put(GUARD_SHAPE_AT, '022b06d10420');
  put(0x2700, '5316103180dd00b74af9e417c594bed4');
  put(0x2800, KEY_CP103.block0);
  put(0x2810, KEY_CP103.block1);
  /* What the board patch replaces, as the factory image has it. */
  bytes.set(BOARD_PATCH.site.before, BOARD_PATCH.site.offset);
  /* The header, and the balance LAST, through a word far from every shape. */
  dv.setUint32(0x200, 0xa1b2c3d4, true);
  dv.setUint32(0x204, CP1030_LENGTH, true);
  dv.setUint32(0x20c, VERSION_WORD_1030, true);
  dv.setUint32(0x210, 0x100806a5, true);
  dv.setUint32(REBALANCE_WORD_OFFSET, 0, true);
  const scratch = 0x7ff0;
  dv.setUint32(scratch, 0, true);
  dv.setUint32(scratch, (0 - wordSum(bytes)) >>> 0, true);
  if (wordSum(bytes) !== 0) throw new Error('the 1.0.3.0 fixture is not balanced');
  return bytes;
}

/** The image the bench camera's banks hold: the factory image + the board patch. */
export function boardPatched(plain: Uint8Array = cp1030Plain()): Uint8Array {
  return applyDerivation(plain, BOARD_PATCH);
}

const stream = (keyHex: string, bytes: number): Uint32Array =>
  keystream(keyWordsOf(keyHex), bytes >> 2);

/** A 64 KiB bank as the 2016 line stores `image`: XOR the device stream (key
 *  block 1) off the header window, the erased tail behind. */
export function cp1030Bank(image: Uint8Array): Uint8Array {
  const bank = new Uint8Array(0x10000).fill(0xff);
  bank.set(xorWindowVerbatim(image, stream(KEY_CP103.block1, image.length)), 0);
  return bank;
}

/** The 2016 app's commit: decrypt the stage with key block 0, accept a word
 *  sum of 0, store under key block 1. */
export function app2016Commit(staged: Uint8Array): Uint8Array | null {
  const image = xorWindowVerbatim(staged, stream(KEY_CP103.block0, staged.length));
  if (wordSum(image) !== 0) return null;
  return xorWindowVerbatim(image, stream(KEY_CP103.block1, image.length));
}

/** The bench part: blank boot config, the device block, `image` in A, B and R. */
export function cp1030Flash(image: Uint8Array = boardPatched()): Uint8Array {
  const flash = new Uint8Array(FLASH_SIZE).fill(0xff);
  flash.set(DEVICE_BLOCK_HEAD, 0x20000);
  const bank = cp1030Bank(image);
  for (const offset of [0x50000, 0x60000, 0x70000]) flash.set(bank, offset);
  return flash;
}

/** The locked line's selector map, mode 2 widened to the whole part (what the
 *  PATCHED image serves; the fake serves it always). */
export function lockedLineWindows(): FakeWindowSpec[] {
  const windows: FakeWindowSpec[] = [{ subcmd: 2, offset: 0, size: FLASH_SIZE }];
  for (let mode = 3; mode <= 9; mode++) {
    windows.push({ subcmd: mode, offset: (mode - 2) * 0x10000 });
  }
  for (let mode = 0x0a; mode <= 0x21; mode++) {
    windows.push({ subcmd: mode, offset: 0x80000 + (mode - 0x0a) * 0x10000 });
  }
  return windows;
}

/** The fake bench camera on Compact PRO 1.0.3.0. */
export function cp1030Camera(flash: Uint8Array = cp1030Flash()): FakeCamera {
  return new FakeCamera({
    flash,
    windows: lockedLineWindows(),
    authBanks: [3, 4, 5, 6, 7, 8, 9],
    fwInfo: new Map([[0, Uint8Array.from([1, 0, 3, 0, 0, 0, 0, 0])]]),
    commitTransform: app2016Commit,
  });
}
