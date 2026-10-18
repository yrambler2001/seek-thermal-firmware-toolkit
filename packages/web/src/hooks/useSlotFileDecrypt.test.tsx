/**
 * The Decrypt tab's slot half: a file picked, decrypted with no camera, and the
 * result it leaves. The banks are built here from core's own cipher, so the
 * test runs everywhere; the decryption itself is core's, tested in core.
 */

import { act } from 'react';
import { describe, expect, it } from 'vitest';
import {
  HEADER_OFFSET,
  IMAGE_MAGIC,
  bytesToHex,
  cryptImage,
  getProfile,
  keyFromState,
  sha256hex,
  viewOf,
  type Xorshift128State,
} from '@seek-fw/core';
import { renderHook } from '../test-helpers';
import { decryptedNameOf, useSlotFileDecrypt } from './useSlotFileDecrypt';

const IMAGE_LEN = 0x8000;
const BANK = 0x10000;
const STATE: Xorshift128State = Uint32Array.of(0x12345678, 0x9abcdef0, 0x0badf00d, 0xdeadbeef);
const CIPHER = getProfile('modern-4x').cipher;

/** A bank as the camera stores it: a reset-vector image under the keystream, padded with 0xFF. */
function bankFile(seed: number, state: Xorshift128State = STATE): Uint8Array {
  const plain = new Uint8Array(IMAGE_LEN);
  const v = new DataView(plain.buffer);
  let x = seed >>> 0;
  for (let i = 0; i < IMAGE_LEN; i += 4) {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    v.setUint32(i, x, true);
  }
  v.setUint32(0, 0x10008000, true);
  v.setUint32(4, 0x00000101, true);
  for (const word of [7, 8, 9, 10, 13]) v.setUint32(4 * word, 0, true);
  v.setUint32(HEADER_OFFSET, IMAGE_MAGIC, true);
  v.setUint32(HEADER_OFFSET + 4, IMAGE_LEN, true);
  /* The bootloader's acceptance sum, so the image names its family. */
  v.setUint32(0x238, 0, true);
  let sum = 0;
  for (let i = 0; i < IMAGE_LEN; i += 4) sum = (sum + v.getUint32(i, true)) >>> 0;
  v.setUint32(0x238, (0xffff - sum) >>> 0, true);
  const bank = new Uint8Array(BANK).fill(0xff);
  bank.set(cryptImage(viewOf(plain), 0, IMAGE_LEN, state, CIPHER), 0);
  return bank;
}

function fileOf(bytes: Uint8Array, name: string): File {
  return new File([bytes as BlobPart], name, { type: 'application/octet-stream' });
}

describe('decryptedNameOf', () => {
  it('names the plain image after the file it came from', () => {
    expect(decryptedNameOf('bank-A.bin')).toBe('bank-A_decrypted.bin');
    expect(decryptedNameOf('dump')).toBe('dump_decrypted.bin');
    expect(decryptedNameOf('.bin')).toBe('slot_decrypted.bin');
  });
});

describe('useSlotFileDecrypt', () => {
  it('starts with nothing picked', () => {
    const { result, unmount } = renderHook(() => useSlotFileDecrypt());
    expect(result.current.file).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.busy).toBe(false);
    unmount();
  });

  it('decrypts a picked bank on its own, and shows its key, size and SHA-256 with a download name', async () => {
    const bank = bankFile(1);
    const { result, unmount } = renderHook(() => useSlotFileDecrypt());

    await act(async () => {
      await result.current.decrypt(fileOf(bank, 'bank-A.bin'));
    });

    const outcome = result.current.result;
    expect(outcome?.kind).toBe('decrypted');
    if (outcome?.kind !== 'decrypted') return;
    expect(result.current.file).toEqual({ name: 'bank-A.bin', size: BANK });
    expect(result.current.inputSha256).toBe(await sha256hex(bank));
    expect(result.current.downloadName).toBe('bank-A_decrypted.bin');
    expect(outcome.plain.length).toBe(IMAGE_LEN);
    expect(outcome.plainSha256).toBe(await sha256hex(outcome.plain));
    expect(outcome.acceptanceSum).toBe(0xffff);
    /* The key it names is the one the bank was encrypted under, for the modern form. */
    expect(outcome.key.method).toBe('solved');
    expect(outcome.key.keyHex).toBe(bytesToHex(keyFromState(STATE, outcome.key.whiteningK ?? 0)));
    expect(result.current.busy).toBe(false);
    unmount();
  });

  it('refuses a file that is not a bank, and offers nothing to download', async () => {
    const short = new Uint8Array(1000).fill(0x11);
    const { result, unmount } = renderHook(() => useSlotFileDecrypt());

    await act(async () => {
      await result.current.decrypt(fileOf(short, 'short.bin'));
    });

    expect(result.current.result?.kind).toBe('refused');
    expect(result.current.downloadName).toBeNull();
    expect(result.current.readError).toBeNull();
    unmount();
  });

  it('reports an erased bank as empty', async () => {
    const { result, unmount } = renderHook(() => useSlotFileDecrypt());
    await act(async () => {
      await result.current.decrypt(fileOf(new Uint8Array(BANK).fill(0xff), 'erased.bin'));
    });
    expect(result.current.result?.kind).toBe('empty');
    expect(result.current.downloadName).toBeNull();
    unmount();
  });

  it('lets the latest pick win, even when an earlier one finishes last', async () => {
    const first = bankFile(2);
    const second = new Uint8Array(BANK).fill(0xff);
    const { result, unmount } = renderHook(() => useSlotFileDecrypt());

    await act(async () => {
      const slow = result.current.decrypt(fileOf(first, 'first.bin'));
      const fast = result.current.decrypt(fileOf(second, 'second.bin'));
      await Promise.all([slow, fast]);
    });

    expect(result.current.file?.name).toBe('second.bin');
    expect(result.current.result?.kind).toBe('empty');
    unmount();
  });
});
