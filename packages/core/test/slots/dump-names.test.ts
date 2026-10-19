/* ====================================================================
 * The file names a slot dump is saved under (slots/dump.ts, slotDumpNames and safeVersion).
 * The CLI and the page both call these, so the cases here are the names both of them write:
 * a bank with a version, an empty bank, a version with characters a file name cannot carry,
 * and a decrypted image with and without the camera's key pair in its name.
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { safeVersion, slotDumpNames } from '../../src/slots/dump.js';
import type { DumpedSlot } from '../../src/slots/types.js';

const KEY_A = Uint8Array.from({ length: 16 }, (_, i) => 0x11 + i);
const KEY_B = Uint8Array.from({ length: 16 }, (_, i) => 0x81 + i);
const OTHER_A = Uint8Array.from({ length: 16 }, (_, i) => 0xe1 + i);
const OTHER_B = Uint8Array.from({ length: 16 }, (_, i) => 0xc1 + i);

/** A 256-byte decrypted image holding KEY_A and KEY_B, each exactly once. */
function imageWithKeys(): Uint8Array {
  const plain = new Uint8Array(256).fill(0x5a);
  plain.set(KEY_A, 32);
  plain.set(KEY_B, 64);
  return plain;
}

/** A bank the read decrypted, stored under the sha 'deadbeef...'. */
function decryptedBank(
  plain: Uint8Array | null = imageWithKeys(),
): Pick<DumpedSlot, 'key' | 'sha256' | 'empty' | 'plain'> {
  return {
    key: 'b',
    sha256: `deadbeef${'0'.repeat(56)}`,
    empty: false,
    plain,
  };
}

const PAIR = { keyA: KEY_A, keyB: KEY_B };

describe('slotDumpNames', () => {
  it('names a bank and its decrypted image with the version and the stored sha, bare without keys', () => {
    expect(slotDumpNames(decryptedBank(), '1.3.0.0', null)).toEqual({
      raw: 'seek-slot-b-1.3.0.0-deadbeef.bin',
      decrypted: 'seek-slot-b-1.3.0.0-deadbeef-decrypted.bin',
    });
  });

  it('adds the camera pair when the decrypted image holds it exactly once each', () => {
    expect(slotDumpNames(decryptedBank(), '1.3.0.0', PAIR)).toEqual({
      raw: 'seek-slot-b-1.3.0.0-deadbeef.bin',
      decrypted:
        'seek-slot-b-1.3.0.0-deadbeef-decrypted' +
        '-KeyA-1112131415161718191a1b1c1d1e1f20-KeyB-8182838485868788898a8b8c8d8e8f90.bin',
    });
  });

  it('leaves the pair out when the image does not hold this camera pair', () => {
    const other = { keyA: OTHER_A, keyB: OTHER_B };
    expect(slotDumpNames(decryptedBank(), '1.3.0.0', other).decrypted).toBe(
      'seek-slot-b-1.3.0.0-deadbeef-decrypted.bin',
    );
  });

  it('leaves the pair out when the image holds one half of it twice', () => {
    const twice = imageWithKeys();
    twice.set(KEY_A, 128);
    expect(slotDumpNames(decryptedBank(twice), '1.3.0.0', PAIR).decrypted).toBe(
      'seek-slot-b-1.3.0.0-deadbeef-decrypted.bin',
    );
  });

  it('names an empty bank by its state, with no decrypted file', () => {
    const empty = {
      key: 'a' as const,
      sha256: `ffeeddcc${'0'.repeat(56)}`,
      empty: true,
      plain: null,
    };
    expect(slotDumpNames(empty, '1.3.0.0', PAIR)).toEqual({
      raw: 'seek-slot-a-empty-ffeeddcc.bin',
      decrypted: null,
    });
    expect(slotDumpNames(empty, null, null).raw).toBe('seek-slot-a-empty-ffeeddcc.bin');
  });

  it('names a bank that holds no decrypted image with the raw name only', () => {
    expect(slotDumpNames(decryptedBank(null), '4.9.1.5', PAIR)).toEqual({
      raw: 'seek-slot-b-4.9.1.5-deadbeef.bin',
      decrypted: null,
    });
  });

  it('keeps the version a file name can carry and turns each other character into an underscore', () => {
    expect(slotDumpNames(decryptedBank(null), '4/../x y', null).raw).toBe(
      'seek-slot-b-4_.._x_y-deadbeef.bin',
    );
    expect(slotDumpNames(decryptedBank(null), null, null).raw).toBe(
      'seek-slot-b-unknown-deadbeef.bin',
    );
  });

  it('takes the bank letter as given, lowercase, for the reserved bank too', () => {
    const reserved = { ...decryptedBank(null), key: 'r' as const };
    expect(slotDumpNames(reserved, '1.3.0.8', null).raw).toBe('seek-slot-r-1.3.0.8-deadbeef.bin');
  });
});

describe('safeVersion', () => {
  it('keeps letters, digits, dots, dashes and underscores; "unknown" for nothing', () => {
    expect(safeVersion('1.3.0.0')).toBe('1.3.0.0');
    expect(safeVersion('4.9_1-5')).toBe('4.9_1-5');
    expect(safeVersion('4/../x')).toBe('4_.._x');
    expect(safeVersion('')).toBe('unknown');
    expect(safeVersion(null)).toBe('unknown');
  });
});
