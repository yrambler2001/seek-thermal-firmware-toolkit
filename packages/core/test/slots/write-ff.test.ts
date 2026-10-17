/* ==================================================================== *
 * The slot writer's FF staging, with no camera: the 1.3.0.8 FF (16 Hz) image on the 2014
 * chain, in the form the vendor app stages it (ff-form.ts; TESTING.md 42.12).
 *
 *   staged payload = image XOR key block 0 (Key A), header window 0x200..0x23F verbatim
 *   stored bank    = image XOR key block 1 (Key B), header window verbatim
 *
 * TWO POPULATIONS:
 *  - SYNTHETIC images, which run everywhere: a deterministic fill, the real 1.3.0.8-FF key
 *    pair planted once each, and word 142 solved so the plain word sum is 0xFFFF (the sum the
 *    FF app accepts). They carry what the builder reads and nothing else.
 *  - THE CORPUS FF IMAGE, when the emulator directory (SEEK_EMU_DIR, or FW-V1 beside this
 *    repository) carries it. Its staged payload is pinned by a committed sha256: the vendor
 *    app's own file, 32K_43X0_1.3.0.8_COMPACT-16HZ_Public.bin (sha256 fd9da63b...). When that
 *    file is also given (SEEK_VENDOR_FF_IMAGE), the payload is compared with it byte for byte.
 * ==================================================================== */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { equalBytes, hexToBytes } from '../../src/bytes.js';
import { SeekError } from '../../src/errors.js';
import { wordSum32 } from '../../src/image/bank.js';
import { IMAGE_MAGIC, LENGTH_OFFSET } from '../../src/image/header.js';
import { KEY_PAIRS, keyWordsOf, keystream, xorWindowVerbatim } from '../../src/preservation/patch.js';
import { ffKeyBPlainOf, ffPlainOfStaged, stageFFVendor } from '../../src/slots/ff-form.js';
import { buildFFPayload, plainChainBuildOf } from '../../src/slots/write-image.js';
import { emulatorDir } from '../emulator/harness.js';

/* ---- fixtures ------------------------------------------------------------ */

const H_LO = 0x80;
const H_HI = 0x8f;
const ADJUST = 142;

function prng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s & 0xff;
  };
}

/** A synthetic 1.3.0.8 FF image: the key pair once each, magic and length, and word 142 solved to a plain sum of 0xFFFF. */
function ffImageOf(length: number, seed: number): Uint8Array {
  const next = prng(seed);
  const out = new Uint8Array(length);
  for (let i = 0; i < length; i++) out[i] = next();
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x10001000, true);
  dv.setUint32(4, 0x10000101, true);
  dv.setUint32(0x200, IMAGE_MAGIC, true);
  dv.setUint32(LENGTH_OFFSET, length, true);
  out.set(hexToBytes(KEY_PAIRS.ff1308.block0), 0x3000);
  out.set(hexToBytes(KEY_PAIRS.ff1308.block1), 0x3100);
  dv.setUint32(ADJUST * 4, 0, true);
  dv.setUint32(ADJUST * 4, (0xffff - wordSum32(out, length)) >>> 0, true);
  return out;
}

/** The same fill with no key pair: what an 8 Hz or foreign image looks like to the FF builder. */
function plainImageOf(length: number, seed: number): Uint8Array {
  const out = ffImageOf(length, seed);
  out.fill(0x5a, 0x3000, 0x3010);
  out.fill(0xa5, 0x3100, 0x3110);
  return out;
}

const ksOf = (block: string, words: number): Uint32Array => keystream(keyWordsOf(block), words);

/** The corpus FF image, when the emulator directory carries it. */
const EMU = emulatorDir();
function corpusFF(): Uint8Array | null {
  if (EMU === null) return null;
  const file = path.join(
    EMU,
    'data',
    'corpus',
    'compact',
    '2017.01.06-11.17.29-1.3.0.8-FF',
    'no-serial',
    '32k_43x0_1.3.0.8_compact-16hz_public_-_compact_ff_jan_6_2017_11-17-29_99.28_gabiz_ro_firmware.bin',
  );
  return existsSync(file) ? new Uint8Array(readFileSync(file)) : null;
}
const CORPUS_FF = corpusFF();

/** The vendor app's own staged file, when it is given: compared byte for byte with the builder. */
function vendorFile(): Uint8Array | null {
  const file = process.env.SEEK_VENDOR_FF_IMAGE;
  return file !== undefined && file !== '' && existsSync(file)
    ? new Uint8Array(readFileSync(file))
    : null;
}

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

/* ==================================================================== *
 * the staged form, on synthetic images
 * ==================================================================== */

describe('stageFFVendor: the vendor staged form (synthetic FF image)', () => {
  const image = ffImageOf(0x4000, 7);

  it('the payload is the image XOR key block 0 outside the header window, verbatim inside it', () => {
    const { staged } = stageFFVendor(image);
    const ks0 = ksOf(KEY_PAIRS.ff1308.block0, image.length >> 2);
    const expected = xorWindowVerbatim(image, ks0);
    expect(equalBytes(staged, expected)).toBe(true);
    const dv = new DataView(staged.buffer, staged.byteOffset, staged.byteLength);
    const src = new DataView(image.buffer, image.byteOffset, image.byteLength);
    for (let w = H_LO; w <= H_HI; w++) expect(dv.getUint32(w * 4, true)).toBe(src.getUint32(w * 4, true));
  });

  it('the stored bank is the image XOR key block 1 outside the header window, verbatim inside it', () => {
    const { stored } = stageFFVendor(image);
    const ksD = ksOf(KEY_PAIRS.ff1308.block1, image.length >> 2);
    expect(equalBytes(stored, xorWindowVerbatim(image, ksD))).toBe(true);
  });

  it('the camera re-keys the payload to the stored bank: payload XOR key block 0 XOR key block 1 outside the window', () => {
    const { staged, stored } = stageFFVendor(image);
    const words = image.length >> 2;
    const ks0 = ksOf(KEY_PAIRS.ff1308.block0, words);
    const ksD = ksOf(KEY_PAIRS.ff1308.block1, words);
    const rekeyed = xorWindowVerbatim(xorWindowVerbatim(staged, ks0), ksD);
    expect(equalBytes(rekeyed, stored)).toBe(true);
  });

  it('the app’s gate on the payload is sum(payload XOR Key A) == 0xFFFF, which the image’s own sum is', () => {
    const { staged } = stageFFVendor(image);
    const ks0 = ksOf(KEY_PAIRS.ff1308.block0, image.length >> 2);
    expect(wordSum32(xorWindowVerbatim(staged, ks0), image.length)).toBe(0xffff);
    expect(wordSum32(image, image.length)).toBe(0xffff);
  });

  it('no word is solved: the stamped image differs from the input only in the stamped length', () => {
    const { stamped } = stageFFVendor(image);
    expect(equalBytes(stamped, image)).toBe(true);
  });

  it('the header length is stamped to the file length', () => {
    const copy = image.slice();
    new DataView(copy.buffer).setUint32(LENGTH_OFFSET, 0x1234, true);
    const { stamped } = stageFFVendor(copy);
    expect(new DataView(stamped.buffer).getUint32(LENGTH_OFFSET, true)).toBe(image.length);
  });

  it('the builder round trips: the payload unstages to the image, and the stored bank decodes to it', () => {
    const { staged, stored } = stageFFVendor(image);
    expect(equalBytes(ffPlainOfStaged(staged) ?? new Uint8Array(), image)).toBe(true);
    expect(equalBytes(ffKeyBPlainOf(stored) ?? new Uint8Array(), image)).toBe(true);
  });

  it('the plain image in the clear is not taken for a Key B bank, nor the old plain form for a staged payload', () => {
    expect(ffKeyBPlainOf(image)).toBeNull();
    expect(ffPlainOfStaged(image)).toBeNull();
  });

  it('buildFFPayload (the writer) returns the same payload, stamped image and stored bytes', () => {
    const built = buildFFPayload(image);
    const staged = stageFFVendor(image);
    expect(equalBytes(built.payload, staged.staged)).toBe(true);
    expect(equalBytes(built.stamped, staged.stamped)).toBe(true);
    expect(equalBytes(built.stored, staged.stored)).toBe(true);
  });
});

describe('stageFFVendor refuses what the camera would refuse', () => {
  it('an image whose word sum is not 0xFFFF is refused, with nothing built', () => {
    const image = ffImageOf(0x4000, 9);
    new DataView(image.buffer).setUint32(ADJUST * 4, 0, true);
    expect(() => stageFFVendor(image)).toThrow(SeekError);
  });

  it('an image without the 1.3.0.8-FF key pair (each half once) is refused', () => {
    expect(() => stageFFVendor(plainImageOf(0x4000, 11))).toThrow(SeekError);
  });

  it('an image over the descriptor staging buffer (0xE000) is refused', () => {
    expect(() => stageFFVendor(ffImageOf(0xe004, 13))).toThrow(SeekError);
  });

  it('an image that is not a whole number of words is refused', () => {
    expect(() => stageFFVendor(ffImageOf(0x4000, 15).subarray(0, 0x1002))).toThrow(SeekError);
  });
});

describe('plainChainBuildOf decides on the image itself', () => {
  it('a stored word sum of 0 is the plain chain, with or without the FF key pair', () => {
    const image = plainImageOf(0x4000, 21);
    new DataView(image.buffer).setUint32(ADJUST * 4, 0, true);
    new DataView(image.buffer).setUint32(ADJUST * 4, (0 - wordSum32(image, image.length)) >>> 0, true);
    expect(wordSum32(image, image.length)).toBe(0);
    expect(plainChainBuildOf(image)).toBe('plain');
  });

  it('an image carrying the FF key pair is the FF build, whatever its word sum', () => {
    const image = ffImageOf(0x4000, 23);
    expect(plainChainBuildOf(image)).toBe('ff-1308');
    new DataView(image.buffer).setUint32(ADJUST * 4, 0, true);
    expect(plainChainBuildOf(image)).toBe('ff-1308');
  });

  it('a word sum of 0xFFFF without the key pair is refused, not staged as plain', () => {
    const image = plainImageOf(0x4000, 25);
    const dv = new DataView(image.buffer);
    dv.setUint32(ADJUST * 4, 0, true);
    dv.setUint32(ADJUST * 4, (0xffff - wordSum32(image, image.length)) >>> 0, true);
    expect(wordSum32(image, image.length)).toBe(0xffff);
    expect(() => plainChainBuildOf(image)).toThrow(SeekError);
  });
});

/* ==================================================================== *
 * the corpus image: the vendor form, pinned by committed hashes
 * ==================================================================== */

/** The vendor app's file, 32K_43X0_1.3.0.8_COMPACT-16HZ_Public.bin: 49,308 B, sha256 fd9da63b... */
const VENDOR_SHA256 = 'fd9da63b22c9b03ef1b93ef1c62e27128c90c40b04780c726064f14aeb99d133';
/** The plain corpus image (the decrypted bank of the Compact FF Jan 6 2017 dump): sha256 b97ced91... */
const PLAIN_SHA256 = 'b97ced91fff9f0949a02f35fceab697634cc109a0fe2a2fbbfe6ccfadb7d4d16';
/** The bank the camera keeps from it: the plain image XOR key block 1, header verbatim: sha256 fdc8be40... */
const STORED_SHA256 = 'fdc8be406ea5387b65cf32b20463eb28a1168e7a54a2c47cbb575a9c4c5d318d';

describe.skipIf(CORPUS_FF === null)('the corpus FF image, staged as the vendor app stages it', () => {
  const plain = CORPUS_FF ?? new Uint8Array();

  it('the corpus image is the plain image the page committed: sha256 b97ced91…', () => {
    expect(sha256(plain)).toBe(PLAIN_SHA256);
  });

  it('the staged payload is the vendor app’s file: sha256 fd9da63b…', () => {
    const { staged } = stageFFVendor(plain);
    expect(sha256(staged)).toBe(VENDOR_SHA256);
    const file = vendorFile();
    if (file !== null) expect(equalBytes(staged, file)).toBe(true);
  });

  it('the stored bank the camera keeps is the plain image XOR Key B: sha256 fdc8be40…', () => {
    const { stored } = stageFFVendor(plain);
    expect(sha256(stored)).toBe(STORED_SHA256);
    expect(equalBytes(ffKeyBPlainOf(stored) ?? new Uint8Array(), plain)).toBe(true);
  });

  it('the payload the vendor file holds unstages to the plain image', () => {
    const { staged } = stageFFVendor(plain);
    expect(equalBytes(ffPlainOfStaged(staged) ?? new Uint8Array(), plain)).toBe(true);
  });

  it('the page’s old two-stream payload is not the vendor form (it differs in every word outside the window)', () => {
    const { staged } = stageFFVendor(plain);
    const ks0 = ksOf(KEY_PAIRS.ff1308.block0, plain.length >> 2);
    const ksD = ksOf(KEY_PAIRS.ff1308.block1, plain.length >> 2);
    const twoStream = xorWindowVerbatim(xorWindowVerbatim(plain, ks0), ksD);
    expect(equalBytes(staged, twoStream)).toBe(false);
  });
});
