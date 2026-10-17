/* ==================================================================== *
 * The slot writer's FF staging, with no camera: the 1.3.0.8 FF (16 Hz) image
 * on the 2014 chain is staged as image XOR ks0 XOR ksD with its adjust word
 * solved, for the recovery bank only.
 *
 * TWO POPULATIONS, the split the preservation tests use:
 *  - SYNTHETIC images, which run everywhere: a deterministic fill, the REAL
 *    1.3.0.8-FF key pair planted once each, and a header. They carry what the
 *    builder reads and nothing else.
 *  - THE CORPUS FF IMAGE, when the emulator directory (SEEK_EMU_DIR, or FW-V1
 *    beside this repository) carries it. The differential test pins the new
 *    builder to preservation's own `stagedFormOf`, byte for byte: the
 *    preservation pipeline is what commits this form on the emulator, so a
 *    builder that equals it sends the bytes that pipeline sends.
 * ==================================================================== */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { equalBytes, hexToBytes } from '../../src/bytes.js';
import { SeekError } from '../../src/errors.js';
import { wordSum32 } from '../../src/image/bank.js';
import { IMAGE_MAGIC, LENGTH_OFFSET } from '../../src/image/header.js';
import {
  KEY_PAIRS,
  REBALANCE_WORD_OFFSET,
  buildV1Patch,
  ffFoldedFormOf,
  keyWordsOf,
  keystream,
  locateFFKeys,
  stagedAcceptanceSum,
  stagedFormOf,
  wordSum,
  xorWindowVerbatim,
} from '../../src/preservation/patch.js';
import { getProfile } from '../../src/profiles/registry.js';
import {
  buildFFPayload,
  buildPlainPayload,
  foldedFFPayload,
  plainChainBuildOf,
} from '../../src/slots/write-image.js';
import { emulatorDir } from '../emulator/harness.js';

const legacy = getProfile('legacy-auth');

/* ---- fixtures ------------------------------------------------------------ */

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

/** A decrypted-looking image carrying the FF key pair once each, with word 142 free (0). */
function ffImageOf(length: number, seed: number): Uint8Array {
  const next = prng(seed);
  const out = new Uint8Array(length);
  for (let i = 0; i < length; i++) out[i] = next();
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x10001000, true);
  dv.setUint32(4, 0x10000101, true);
  dv.setUint32(0x200, IMAGE_MAGIC, true);
  dv.setUint32(LENGTH_OFFSET, length, true);
  dv.setUint32(REBALANCE_WORD_OFFSET, 0, true);
  out.set(hexToBytes(KEY_PAIRS.ff1308.block0), 0x3000);
  out.set(hexToBytes(KEY_PAIRS.ff1308.block1), 0x3100);
  return out;
}

/** The same fill, no key pair: what an 8 Hz or foreign image looks like to the builder. */
function plainImageOf(length: number, seed: number): Uint8Array {
  const out = ffImageOf(length, seed);
  out.fill(0x5a, 0x3000, 0x3010);
  out.fill(0xa5, 0x3100, 0x3110);
  return out;
}

const ksOf = (block: string, bytes: number): Uint32Array =>
  keystream(keyWordsOf(block), bytes >>> 2);

/* ---- the corpus image ------------------------------------------------------ */

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

/* ==================================================================== *
 * which build an image is
 * ==================================================================== */

describe('plainChainBuildOf decides on the image itself', () => {
  it('a stored word sum of 0 is the plain chain, with or without the FF key pair', () => {
    const balanced = plainImageOf(0x6000, 1);
    new DataView(balanced.buffer).setUint32(
      REBALANCE_WORD_OFFSET,
      (0 - wordSum32(balanced, balanced.length)) >>> 0,
      true,
    );
    expect(wordSum32(balanced, balanced.length)).toBe(0);
    expect(plainChainBuildOf(balanced)).toBe('plain');
  });

  it('an image carrying the FF key pair is the FF build, whatever its word sum', () => {
    const factory = ffImageOf(0x6000, 2);
    /* As built: the adjust word makes the file sum 0xFFFF. */
    new DataView(factory.buffer).setUint32(
      REBALANCE_WORD_OFFSET,
      (0xffff - wordSum32(factory, factory.length)) >>> 0,
      true,
    );
    expect(wordSum32(factory, factory.length)).toBe(0xffff);
    expect(plainChainBuildOf(factory)).toBe('ff-1308');
    /* A bank this page wrote carries the sum 0xFFFF plus its solved word, and is still FF. */
    expect(plainChainBuildOf(buildFFPayload(factory).stamped)).toBe('ff-1308');
    /* Any other sum with the pair is FF too: an edited FF image is solved again. */
    expect(plainChainBuildOf(ffImageOf(0x6000, 3))).toBe('ff-1308');
  });

  it('a word sum of 0xFFFF without the key pair is refused, not staged as plain', () => {
    const image = plainImageOf(0x6000, 4);
    new DataView(image.buffer).setUint32(
      REBALANCE_WORD_OFFSET,
      (0xffff - wordSum32(image, image.length)) >>> 0,
      true,
    );
    expect(wordSum32(image, image.length)).toBe(0xffff);
    let error: unknown;
    try {
      plainChainBuildOf(image);
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(SeekError);
    expect((error as SeekError).code).toBe('slots/refused');
    expect((error as SeekError).message).toContain('1.3.0.8-FF key pair');
  });

  it('any other image is the plain chain, and the plain builder stamps it to a word sum of 0', () => {
    const image = plainImageOf(0x6000, 5);
    expect(plainChainBuildOf(image)).toBe('plain');
    const built = buildPlainPayload(image, legacy.cipher);
    expect(wordSum32(built.payload, built.payload.length)).toBe(0);
  });

  it('the plain builder will not stage the FF image as a plain image', () => {
    expect(() => buildPlainPayload(ffImageOf(0x6000, 6), legacy.cipher)).toThrow(
      /own two-stream form/,
    );
  });
});

/* ==================================================================== *
 * the staged form
 * ==================================================================== */

describe('buildFFPayload (synthetic FF image)', () => {
  const image = ffImageOf(0x6000, 7);
  const built = buildFFPayload(image);
  const ks0 = ksOf(KEY_PAIRS.ff1308.block0, image.length);
  const ksD = ksOf(KEY_PAIRS.ff1308.block1, image.length);

  it('the payload is the stamped image XOR ks0 XOR ksD, header window verbatim', () => {
    expect(built.payload.length).toBe(image.length);
    expect(
      equalBytes(built.payload, xorWindowVerbatim(xorWindowVerbatim(built.stamped, ks0), ksD)),
    ).toBe(true);
    /* Words 128..143 (0x200..0x23F) pass verbatim, so the header reads in clear. */
    expect(
      equalBytes(built.payload.subarray(0x200, 0x240), built.stamped.subarray(0x200, 0x240)),
    ).toBe(true);
  });

  it('the app’s collapsed gate sum(staged ^ ks0) is 0xFFFF', () => {
    expect(wordSum(xorWindowVerbatim(built.payload, ks0))).toBe(0xffff);
  });

  it('the stamped image differs from the input in the adjust word only, and the camera’s fold returns it', () => {
    const diffs: number[] = [];
    for (let i = 0; i < image.length; i++) if (image[i] !== built.stamped[i]) diffs.push(i);
    expect(diffs.every((i) => i >= 0x238 && i < 0x23c)).toBe(true);
    expect(new DataView(built.stamped.buffer).getUint32(REBALANCE_WORD_OFFSET, true)).toBe(
      built.rebalanceWord,
    );
    expect(built.heldWord).toBe(0);
    expect(built.storedWordSum).toBe(wordSum32(built.stamped, built.stamped.length));
    /* Folding the payload back is exactly the stamped image. */
    expect(equalBytes(ffFoldedFormOf(built.payload)!, built.stamped)).toBe(true);
    expect(equalBytes(foldedFFPayload(built.payload)!, built.stamped)).toBe(true);
  });

  it('solving is idempotent: a stamped image stages to the same bytes', () => {
    const again = buildFFPayload(built.stamped);
    expect(equalBytes(again.payload, built.payload)).toBe(true);
    expect(equalBytes(again.stamped, built.stamped)).toBe(true);
    expect(again.heldWord).toBe(built.rebalanceWord);
  });

  it('whatever word 142 held is overwritten, and the gate still holds', () => {
    const busy = image.slice();
    new DataView(busy.buffer).setUint32(REBALANCE_WORD_OFFSET, 0xdeadbeef, true);
    const out = buildFFPayload(busy);
    expect(out.heldWord).toBe(0xdeadbeef);
    expect(equalBytes(out.payload, built.payload)).toBe(true);
  });

  it('the header length is stamped to the file length', () => {
    const wrong = image.slice();
    new DataView(wrong.buffer).setUint32(LENGTH_OFFSET, 0x1234, true);
    const out = buildFFPayload(wrong);
    expect(new DataView(out.stamped.buffer).getUint32(LENGTH_OFFSET, true)).toBe(image.length);
  });

  it('an image over the descriptor stage (0xE000) is refused', () => {
    expect(() => buildFFPayload(ffImageOf(0xe004, 8))).toThrow(/staging buffer/);
  });

  it('an image without the key pair is refused by the builder itself', () => {
    expect(() => buildFFPayload(plainImageOf(0x6000, 9))).toThrow(/1\.3\.0\.8-FF key pair/);
  });

  it('a payload that is not an FF staged form folds to nothing', () => {
    const noise = new Uint8Array(0x6000);
    const next = prng(11);
    for (let i = 0; i < noise.length; i++) noise[i] = next();
    expect(foldedFFPayload(noise)).toBeNull();
    /* The right sum is not enough: the fold must carry the FF key pair. */
    const plain = plainImageOf(0x6000, 12);
    const k0 = ksOf(KEY_PAIRS.ff1308.block0, plain.length);
    const forged = xorWindowVerbatim(plain, k0);
    const forgedView = new DataView(forged.buffer);
    const gate = wordSum(xorWindowVerbatim(forged, k0));
    forgedView.setUint32(
      REBALANCE_WORD_OFFSET,
      (forgedView.getUint32(REBALANCE_WORD_OFFSET, true) + (0xffff - gate)) >>> 0,
      true,
    );
    expect(wordSum(xorWindowVerbatim(forged, k0))).toBe(0xffff);
    expect(foldedFFPayload(forged)).toBeNull();
    expect(foldedFFPayload(new Uint8Array(8))).toBeNull();
  });
});

/* ==================================================================== *
 * differential: preservation's own staging of the corpus image
 * ==================================================================== */

describe.skipIf(CORPUS_FF === null)(
  'buildFFPayload against preservation stagedFormOf (corpus)',
  () => {
    const image = CORPUS_FF ?? new Uint8Array(0);

    it('the corpus FF image is the factory FF image: sum 0xFFFF, the key pair once each, word 142 free', () => {
      expect(wordSum32(image, image.length)).toBe(0xffff);
      expect(locateFFKeys(image)).not.toBeNull();
      expect(
        new DataView(image.buffer, image.byteOffset).getUint32(REBALANCE_WORD_OFFSET, true),
      ).toBe(0);
      expect(plainChainBuildOf(image)).toBe('ff-1308');
    });

    it('the staged payload of the image equals stagedFormOf of the same stamped image, byte for byte', () => {
      const patch = buildV1Patch(image);
      expect(patch.buildId).toBe('compact-1.3.0.8-ff');
      expect(patch.stagedForm).toBe('xor-ks0-ksD');
      const built = buildFFPayload(image);
      expect(equalBytes(built.payload, stagedFormOf(patch, built.stamped))).toBe(true);
      expect(stagedAcceptanceSum(patch, built.payload)).toBe(0xffff);
    });

    it('the payload of the preservation’s PATCHED image is the very bytes its commit step stages', () => {
      /* steps.ts runCommitStep sends stagedFormOf(patch, patch.patched). The slots builder, given
       * that patched image, solves the same word (the solve is on the image it is given, word 142
       * zeroed), stamps the same image and stages the same bytes. */
      const patch = buildV1Patch(image);
      const built = buildFFPayload(patch.patched);
      expect(built.rebalanceWord).toBe(patch.rebalanceWord);
      expect(equalBytes(built.stamped, patch.patched)).toBe(true);
      expect(equalBytes(built.payload, stagedFormOf(patch, patch.patched))).toBe(true);
    });

    it('the unpatched image’s solved word is 0xFFFF minus sum(image ^ ksD) with word 142 zero', () => {
      const built = buildFFPayload(image);
      const ksD = ksOf(KEY_PAIRS.ff1308.block1, image.length);
      const base = wordSum(xorWindowVerbatim(image, ksD));
      expect(built.rebalanceWord).toBe((0xffff - base) >>> 0);
      /* The factory image carries 0xB7AB9D17 there (TESTING.md 26.4), so it cannot be staged as is. */
      expect(base).toBe(0xb7ab9d17);
      /* Its raw sum was 0xFFFF with the word free, so the stored sum is 0xFFFF plus the solved word. */
      expect(built.storedWordSum).toBe((0xffff + built.rebalanceWord) >>> 0);
    });
  },
);
