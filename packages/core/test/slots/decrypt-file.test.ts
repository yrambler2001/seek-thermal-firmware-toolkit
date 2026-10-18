/* ====================================================================
 * Decrypting one slot from a file, with no camera (`decryptSlotFile`).
 *
 * Hermetic: every bank here is built in the test from core's own cipher
 * (`cryptImage` is self-inverse), so it runs everywhere. The corpus case at the
 * end reads a 64 KiB slice of a real whole-flash dump, and runs only when the
 * corpus is on this machine (SEEK_FULL_DUMPS_BY_CAMERA).
 * ==================================================================== */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { bytesToHex, viewOf } from '../../src/bytes.js';
import { cryptImage } from '../../src/crypto/cipher.js';
import { keyFromState } from '../../src/crypto/keys.js';
import type { Xorshift128State } from '../../src/crypto/xorshift128.js';
import { HEADER_OFFSET, IMAGE_MAGIC } from '../../src/image/header.js';
import { getProfile } from '../../src/profiles/registry.js';
import {
  decryptSlotFile,
  type DecryptedSlotFile,
  type SlotFileResult,
} from '../../src/slots/decrypt-file.js';
import { SLOT_BYTES } from '../../src/slots/types.js';

const MODERN_K = 0x13579bdf;
const IMAGE_LEN = 0x8000;
const ACCEPT_OFFSET = 0x238; // word 142: the reserved adjust word the bootloader sums over
const CIPHER = getProfile('modern-4x').cipher;
const STATE: Xorshift128State = Uint32Array.of(0x12345678, 0x9abcdef0, 0x0badf00d, 0xdeadbeef);

/** A deterministic image: a valid reset vector, the four known-zero words, a header, noise. */
function plainImage(length = IMAGE_LEN, seed = 1): Uint8Array {
  const out = new Uint8Array(length);
  const v = new DataView(out.buffer);
  let x = seed >>> 0;
  for (let i = 0; i < length; i += 4) {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    v.setUint32(i, x, true);
  }
  v.setUint32(0, 0x10008000, true); // SP: the 0x10 prefix the reset check wants
  v.setUint32(4, 0x00000101, true); // entry: odd, a Thumb address
  for (const word of [7, 8, 9, 10, 13]) v.setUint32(4 * word, 0, true);
  v.setUint32(HEADER_OFFSET, IMAGE_MAGIC, true);
  v.setUint32(HEADER_OFFSET + 4, length, true);
  return out;
}

/** Sets the adjust word so the decrypted image sums to `target`, as the bootloader's check wants. */
function sealSum(plain: Uint8Array, target: number): void {
  const v = viewOf(plain);
  v.setUint32(ACCEPT_OFFSET, 0, true);
  let sum = 0;
  for (let i = 0; i < plain.length; i += 4) sum = (sum + v.getUint32(i, true)) >>> 0;
  v.setUint32(ACCEPT_OFFSET, (target - sum) >>> 0, true);
}

/** The bank as the camera stores it: the image under the keystream, padded with erased 0xFF. */
function encryptBank(plain: Uint8Array, state: Xorshift128State = STATE): Uint8Array {
  const cipher = cryptImage(viewOf(plain), 0, plain.length, state, CIPHER);
  const bank = new Uint8Array(SLOT_BYTES).fill(0xff);
  bank.set(cipher, 0);
  return bank;
}

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

describe('decryptSlotFile: a bank whose key is solved from its own ciphertext', () => {
  it('decrypts the image exactly, names the acceptance sum and the family, and names a planted key', async () => {
    const plain = plainImage();
    /* The modern key form, written into the image once: it is the evidence that names K. */
    const key = keyFromState(STATE, MODERN_K);
    plain.set(key, 0x4000);
    sealSum(plain, 0xffff);

    const result = await decryptSlotFile(encryptBank(plain));

    expect(result.kind).toBe('decrypted');
    if (result.kind !== 'decrypted') return;
    expect(result.plain.length).toBe(IMAGE_LEN);
    expect(Buffer.from(result.plain).equals(Buffer.from(plain))).toBe(true);
    expect(result.plainSha256).toBe(sha256(plain));
    expect(result.acceptanceSum).toBe(0xffff);
    expect(result.families).toContain(getProfile('modern-4x').name);
    expect(result.header.length).toBe(IMAGE_LEN);
    expect(result.key).toEqual({
      method: 'solved',
      keyHex: bytesToHex(key),
      whiteningK: MODERN_K,
      evidence: 'plaintext',
    });
  });

  it('still decrypts when no key form is in the image, and says the family default is shown', async () => {
    const plain = plainImage(IMAGE_LEN, 7);
    sealSum(plain, 0x1234); // a sum no registered family accepts
    const result = await decryptSlotFile(encryptBank(plain));

    expect(result.kind).toBe('decrypted');
    if (result.kind !== 'decrypted') return;
    expect(Buffer.from(result.plain).equals(Buffer.from(plain))).toBe(true);
    expect(result.acceptanceSum).toBe(0x1234);
    expect(result.families).toEqual([]);
    expect(result.key.method).toBe('solved');
    expect(result.key.evidence).toBe('profile-default');
    expect(result.key.keyHex).toBe(bytesToHex(keyFromState(STATE, result.key.whiteningK ?? 0)));
    expect(result.notes.join('\n')).toContain('the target of no registered family');
  });

  it('names a stored-plain bank (the 2014 chain) as having no key', async () => {
    const plain = plainImage(IMAGE_LEN, 3);
    sealSum(plain, 0); // the plaintext chain's word sum is 0
    const bank = new Uint8Array(SLOT_BYTES).fill(0xff);
    bank.set(plain, 0);

    const result = await decryptSlotFile(bank);

    expect(result.kind).toBe('decrypted');
    if (result.kind !== 'decrypted') return;
    expect(result.key).toEqual({
      method: 'stored-plain',
      keyHex: null,
      whiteningK: null,
      evidence: null,
    });
    expect(Buffer.from(result.plain).equals(Buffer.from(plain))).toBe(true);
    expect(result.plainSha256).toBe(sha256(plain));
  });
});

describe('decryptSlotFile: refusals and erased banks, never a crash', () => {
  it('refuses a file that is not one bank, and says how big it is', async () => {
    const result = await decryptSlotFile(new Uint8Array(100));
    expect(result.kind).toBe('refused');
    if (result.kind !== 'refused') return;
    expect(result.reason).toContain('65536');
    expect(result.reason).toContain('100 bytes');
  });

  it('reports an erased bank as empty, with nothing to decrypt', async () => {
    const result = await decryptSlotFile(new Uint8Array(SLOT_BYTES).fill(0xff));
    expect(result.kind).toBe('empty');
    if (result.kind !== 'empty') return;
    expect(result.reason).toContain('erased bank');
  });

  it('refuses a bank that holds no image header', async () => {
    const noise = new Uint8Array(SLOT_BYTES);
    let x = 0x2468ace1;
    for (let i = 0; i < noise.length; i++) {
      x = (Math.imul(x, 1103515245) + 12345) >>> 0;
      noise[i] = x >>> 24;
    }
    const result = await decryptSlotFile(noise);
    expect(result.kind).toBe('refused');
    if (result.kind !== 'refused') return;
    expect(result.reason).toContain('no firmware image header');
  });

  it('refuses an image whose header length is out of range', async () => {
    const bank = encryptBank(plainImage());
    /* The header window is clear, so the length is read as stored. */
    new DataView(bank.buffer).setUint32(HEADER_OFFSET + 4, 0x20000, true);
    const result = await decryptSlotFile(bank);
    expect(result.kind).toBe('refused');
    if (result.kind !== 'refused') return;
    expect(result.reason).toContain('out of range');
  });

  it('refuses a bank whose key recovers to a reset vector no Cortex-M core can start from', async () => {
    const plain = plainImage(IMAGE_LEN, 5);
    new DataView(plain.buffer).setUint32(0, 0, true); // SP of zero: not a valid stack pointer
    const result = await decryptSlotFile(encryptBank(plain));
    expect(result.kind).toBe('refused');
    if (result.kind !== 'refused') return;
    expect(result.reason).toContain('reset vector');
  });
});

/* The corpus: a 64 KiB slice of a real whole-flash dump, read as a file. Runs only with
 * the corpus present (SEEK_FULL_DUMPS_BY_CAMERA, the per-camera tree); skipped otherwise. */
const CORPUS = process.env.SEEK_FULL_DUMPS_BY_CAMERA ?? null;
const NANO_DUMP =
  CORPUS === null
    ? null
    : path.join(
        CORPUS,
        'Compact',
        'Nano 200',
        '2024.11.20-14.58.43-42.32.3.10',
        'full_dump_original.bin',
      );
const CP_2016_DUMP =
  CORPUS === null
    ? null
    : path.join(
        CORPUS,
        'Compact Pro',
        'Compact Pro',
        '2016.07.06-17.04.49-1.0.3.0',
        'full_dump_original.bin',
      );

describe.skipIf(NANO_DUMP === null || !existsSync(NANO_DUMP))(
  'decryptSlotFile on a real 4.x/Nano dump (the corpus)',
  () => {
    it('decrypts the banks it holds, each to a 4.x image accepted at 0xFFFF', async () => {
      const dump = new Uint8Array(readFileSync(NANO_DUMP ?? ''));
      const outcomes: SlotFileResult[] = [];
      for (const offset of [0x30000, 0x50000, 0x70000]) {
        outcomes.push(await decryptSlotFile(dump.subarray(offset, offset + SLOT_BYTES)));
      }
      const decrypted = outcomes.filter((o): o is DecryptedSlotFile => o.kind === 'decrypted');
      expect(decrypted.length).toBeGreaterThan(0);
      for (const outcome of decrypted) {
        expect(outcome.acceptanceSum).toBe(0xffff);
        expect(outcome.families).toContain(getProfile('modern-4x').name);
        expect(outcome.key.method).toBe('solved');
      }
    });
  },
);

describe.skipIf(CP_2016_DUMP === null || !existsSync(CP_2016_DUMP))(
  'decryptSlotFile on a real Compact PRO 1.0.3.0 dump (the corpus)',
  () => {
    it('decrypts the 2016 cipher chain: keyed, with a decrypted word sum of 0', async () => {
      const dump = new Uint8Array(readFileSync(CP_2016_DUMP ?? ''));
      const outcomes: SlotFileResult[] = [];
      for (const offset of [0x50000, 0x60000, 0x70000]) {
        outcomes.push(await decryptSlotFile(dump.subarray(offset, offset + SLOT_BYTES)));
      }
      const decrypted = outcomes.filter((o): o is DecryptedSlotFile => o.kind === 'decrypted');
      expect(decrypted.length).toBeGreaterThan(0);
      for (const outcome of decrypted) {
        expect(outcome.acceptanceSum).toBe(0);
        expect(outcome.key.method).toBe('solved');
      }
    });
  },
);
