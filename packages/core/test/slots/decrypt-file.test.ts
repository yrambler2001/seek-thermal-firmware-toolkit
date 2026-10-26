/* ====================================================================
 * Decrypting one bank from a file, with no camera (`slots/decrypt-file.ts`).
 *
 * Each case builds its bank the way a camera holds one (a plaintext image, then the cipher, then
 * the 0xFF pad to 64 KiB), so what is asserted is what a real bank file would give.
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { bytesToHex, equalBytes, hexToBytes, sha256hex, viewOf } from '../../src/bytes.js';
import { cryptBytes } from '../../src/crypto/cipher.js';
import { stateFromKey } from '../../src/crypto/keys.js';
import { setAcceptSum } from '../../src/image/bank.js';
import {
  ADJUST_OFFSET,
  HEADER_OFFSET,
  IMAGE_MAGIC,
  LENGTH_OFFSET,
} from '../../src/image/header.js';
import { CHECK_ZERO_IDX, KNOWN_ZERO_IDX } from '../../src/crypto/recover.js';
import { modern4x } from '../../src/profiles/modern-4x.js';
import { getProfile } from '../../src/profiles/registry.js';
import { APPLICATION_KEY_PAIRS } from '../../src/slots/application-pairs.js';
import { decryptSlotFile, slotFileReport } from '../../src/slots/decrypt-file.js';
import { SLOT_BYTES } from '../../src/slots/types.js';
import { SeekError } from '../../src/errors.js';

const LENGTH = 0x1000;
const KEY = Uint8Array.from([
  0xf3, 0x2a, 0xd7, 0x71, 0x5c, 0x0e, 0x99, 0x42, 0xab, 0x13, 0x77, 0x60, 0x08, 0xc4, 0x31, 0xde,
]);

/** A plaintext image the cryptanalytic solve can recover: the reserved vectors are zero, the SP and reset vector look like an LPC build. */
function plainImage(): Uint8Array {
  const image = new Uint8Array(LENGTH);
  const dv = viewOf(image);
  dv.setUint32(0, 0x10004000, true);
  dv.setUint32(4, 0x14030201, true);
  const zero = new Set<number>([...KNOWN_ZERO_IDX, CHECK_ZERO_IDX]);
  for (let index = 2; index < 64; index++) {
    if (zero.has(index)) continue;
    dv.setUint32(4 * index, (0x14031000 + index * 4) >>> 0, true);
  }
  for (let offset = 0x400; offset < LENGTH; offset += 4) {
    dv.setUint32(offset, (offset * 2654435761) >>> 0, true);
  }
  dv.setUint32(HEADER_OFFSET + 0, IMAGE_MAGIC, true);
  dv.setUint32(HEADER_OFFSET + 4, LENGTH, true);
  dv.setUint32(HEADER_OFFSET + 8, 0x2a01, true);
  dv.setUint32(HEADER_OFFSET + 12, 0x00050904, true); /* 4.9.5.0 */
  dv.setUint32(HEADER_OFFSET + 16, 0x14030201, true);
  dv.setUint32(ADJUST_OFFSET, 0, true);
  return setAcceptSum(image, modern4x.cipher).image;
}

/** A whole bank: the image, encrypted under `key` as a camera stores it, then 0xFF to 64 KiB. */
function bankUnder(key: Uint8Array, plain = plainImage()): Uint8Array {
  const state = stateFromKey(key, modern4x.cipher.whiteningK);
  const bank = new Uint8Array(SLOT_BYTES).fill(0xff);
  bank.set(cryptBytes(plain, state, modern4x.cipher), 0);
  return bank;
}

/** A pseudo-random sequence, so a "garbage" bank is the same bytes on every run. */
function garbage(length: number, seed: number): Uint8Array {
  const out = new Uint8Array(length);
  let x = seed >>> 0;
  for (let i = 0; i < length; i++) {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    out[i] = x >>> 24;
  }
  return out;
}

describe('decryptSlotFile: a bank under a key', () => {
  it('decrypts the image, recovers its key by the solve, and names an application key it matches', async () => {
    const pair = APPLICATION_KEY_PAIRS[0];
    if (pair === undefined) throw new Error('no application key pairs');
    const keyA = hexToBytes(pair.keyA);
    const bank = bankUnder(keyA);
    const result = await decryptSlotFile(bank, { profile: modern4x });

    expect(result.status).toBe('decrypted');
    expect(result.size).toBe(SLOT_BYTES);
    expect(result.sha256).toBe(await sha256hex(bank));
    expect(result.profile).toEqual({ id: modern4x.id, name: modern4x.name, detected: false });
    expect(result.header?.version).toBe('4.9.5.0');
    expect(result.header?.length).toBe(LENGTH);

    expect(result.plain).not.toBeNull();
    expect(equalBytes(result.plain ?? new Uint8Array(0), plainImage())).toBe(true);
    expect(result.plainSha256).toBe(await sha256hex(result.plain ?? new Uint8Array(0)));

    expect(result.key?.method).toBe('cryptanalytic');
    expect(result.key?.key).toBe(bytesToHex(keyA));
    expect(result.key?.named).toBe(`Key A of ${pair.builds}`);
    expect(result.key?.matchesProfile).toBe(true);
    expect(result.key?.state).toHaveLength(4);
  });

  it('decrypts under a key no application pair holds, and says the key has no name', async () => {
    const result = await decryptSlotFile(bankUnder(KEY), { profile: modern4x });
    expect(result.status).toBe('decrypted');
    expect(result.key?.key).toBe(bytesToHex(KEY));
    expect(result.key?.named).toBeNull();
  });

  it('detects the family from the bank when none is named, and says it was detected', async () => {
    const result = await decryptSlotFile(bankUnder(KEY));
    expect(result.profile.detected).toBe(true);
    expect(result.status).toBe('decrypted');
  });
});

describe('decryptSlotFile: what is refused or not decrypted', () => {
  it('refuses a file that is not one 64 KiB bank, before anything is decided', async () => {
    await expect(decryptSlotFile(new Uint8Array(0x8000))).rejects.toMatchObject({
      code: 'slots/refused',
    });
    await expect(decryptSlotFile(new Uint8Array(SLOT_BYTES + 4))).rejects.toBeInstanceOf(SeekError);
  });

  it('calls an erased bank empty, and decrypts nothing from it', async () => {
    const result = await decryptSlotFile(new Uint8Array(SLOT_BYTES).fill(0xff));
    expect(result.status).toBe('empty');
    expect(result.plain).toBeNull();
    expect(result.key).toBeNull();
    expect(result.header).toBeNull();
  });

  it('reports a bank with no image header as no image', async () => {
    const result = await decryptSlotFile(new Uint8Array(SLOT_BYTES));
    expect(result.status).toBe('no-image');
    expect(result.plain).toBeNull();
  });

  it('refuses a header whose length is out of the image range', async () => {
    const bank = new Uint8Array(SLOT_BYTES).fill(0xff);
    const dv = viewOf(bank);
    dv.setUint32(HEADER_OFFSET, IMAGE_MAGIC, true);
    dv.setUint32(LENGTH_OFFSET, 0x20000, true);
    const result = await decryptSlotFile(bank, { profile: modern4x });
    expect(result.status).toBe('bad-header');
    expect(result.plain).toBeNull();
    expect(result.header?.length).toBe(0x20000);
  });

  it('does not decrypt an image whose key does not recover to a Cortex-M entry', async () => {
    const bank = garbage(SLOT_BYTES, 0x5eed);
    const dv = viewOf(bank);
    dv.setUint32(HEADER_OFFSET, IMAGE_MAGIC, true);
    dv.setUint32(LENGTH_OFFSET, LENGTH, true);
    const result = await decryptSlotFile(bank, { profile: modern4x });
    expect(result.status).toBe('not-decrypted');
    expect(result.plain).toBeNull();
    expect(result.notes.join('\n')).toContain('not a Cortex-M entry');
  });
});

describe('decryptSlotFile: the 2014 plaintext chain', () => {
  it('keeps the image as it is, with no key, when the bank is stored plain', async () => {
    const plain = plainImage();
    const bank = new Uint8Array(SLOT_BYTES).fill(0xff);
    bank.set(plain, 0);
    const result = await decryptSlotFile(bank, { profile: getProfile('compact-2014') });
    expect(result.status).toBe('decrypted');
    expect(result.key?.method).toBe('stored-plain');
    expect(result.key?.key).toBeNull();
    expect(equalBytes(result.plain ?? new Uint8Array(0), plain)).toBe(true);
  });
});

describe('slotFileReport', () => {
  it('states the file, its digests, the key and what it is named', async () => {
    const pair = APPLICATION_KEY_PAIRS[0];
    if (pair === undefined) throw new Error('no application key pairs');
    const bank = bankUnder(hexToBytes(pair.keyA));
    const result = await decryptSlotFile(bank, { profile: modern4x });
    const text = slotFileReport(result, 'slot-a.bin');
    expect(text).toContain('Source      : slot-a.bin (65536 bytes)');
    expect(text).toContain(`sha256      : ${result.sha256}`);
    expect(text).toContain(`Decrypted   : ${String(LENGTH)} B, sha256 ${result.plainSha256 ?? ''}`);
    expect(text).toContain(`named       : Key A of ${pair.builds}`);
    expect(text).toContain(`key         : ${bytesToHex(hexToBytes(pair.keyA))}`);
    /* The key recovery's verdict in words; the result keeps the code for scripts (TESTING.md 42.88). */
    expect(text).toContain('check       : key verified by the acceptance sum');
    expect(text).not.toContain('VERIFIED');
    expect(text).not.toMatch(/confidence/i);
    expect(result.key?.confidence).toBe('VERIFIED(profile)');
    expect(result.notes.join('\n')).toContain(
      'under the key recovered from this bank (key verified by the acceptance sum 0x0000FFFF; it is Key A of',
    );
    expect(result.notes.join('\n')).not.toContain('VERIFIED');
  });

  it('says what an erased bank is, with no key and no decrypted size', async () => {
    const result = await decryptSlotFile(new Uint8Array(SLOT_BYTES).fill(0xff));
    const text = slotFileReport(result, 'empty.bin');
    expect(text).toContain('empty (erased bank, nothing to decrypt)');
    expect(text).not.toContain('Decrypted   :');
  });
});
