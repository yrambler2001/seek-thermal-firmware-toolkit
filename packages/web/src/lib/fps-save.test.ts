/**
 * The browser's save of the pre-patch dump: two files, in order, and the answer the write waits for. A save
 * that did not happen must come back false, so core refuses the patch before anything is sent.
 */

import { describe, expect, it, vi } from 'vitest';
import type { FpsPreDump } from '@seek-fw/core';
import {
  fpsSaveMode,
  saveFpsDumpInBrowser,
  type FileHandleLike,
  type SaveFilePicker,
} from './fps-save';

function dump(): FpsPreDump {
  return {
    key: 'a',
    bank: 'slot A',
    version: '1.3.0.0',
    address: 0x14050000,
    raw: new Uint8Array(0x10000).fill(0x11),
    rawSha256: 'aa',
    rawName: 'seek-slot-A-v1.3.0.0-before-fps-patch-raw-aa.bin',
    plain: new Uint8Array(0xbaa8).fill(0x22),
    plainSha256: 'bb',
    plainName: 'seek-slot-A-v1.3.0.0-before-fps-patch-decrypted-bb.bin',
  } as unknown as FpsPreDump;
}

describe('the pre-patch save in the browser', () => {
  it('writes both files through the chosen places, raw first, and reports the save', async () => {
    const written: { name: string; size: number; closed: boolean }[] = [];
    const picker: SaveFilePicker = vi.fn(({ suggestedName }) => {
      const entry = { name: suggestedName, size: 0, closed: false };
      written.push(entry);
      const handle: FileHandleLike = {
        createWritable: () =>
          Promise.resolve({
            write: (data: Uint8Array) => {
              entry.size = data.length;
              return Promise.resolve();
            },
            close: () => {
              entry.closed = true;
              return Promise.resolve();
            },
          }),
      };
      return Promise.resolve(handle);
    });
    const d = dump();
    expect(await saveFpsDumpInBrowser(d, picker, vi.fn())).toBe(true);
    expect(written).toEqual([
      { name: d.rawName, size: 0x10000, closed: true },
      { name: d.plainName, size: 0xbaa8, closed: true },
    ]);
  });

  it('answers false when the person cancels the picker: nothing is reported as saved', async () => {
    const picker: SaveFilePicker = vi.fn(() =>
      Promise.reject(new DOMException('cancelled', 'AbortError')),
    );
    expect(await saveFpsDumpInBrowser(dump(), picker, vi.fn())).toBe(false);
  });

  it('answers false when a file cannot be closed: the save did not finish', async () => {
    const picker: SaveFilePicker = () =>
      Promise.resolve({
        createWritable: () =>
          Promise.resolve({
            write: () => Promise.resolve(),
            close: () => Promise.reject(new Error('disk full')),
          }),
      });
    expect(await saveFpsDumpInBrowser(dump(), picker, vi.fn())).toBe(false);
  });

  it('starts two downloads when there is no picker, and says so by returning true', async () => {
    const download = vi.fn();
    const d = dump();
    expect(await saveFpsDumpInBrowser(d, null, download)).toBe(true);
    expect(download).toHaveBeenNthCalledWith(1, d.raw, d.rawName);
    expect(download).toHaveBeenNthCalledWith(2, d.plain, d.plainName);
    expect(download).toHaveBeenCalledTimes(2);
  });

  it('answers false when the browser refuses a download', async () => {
    const download = vi.fn(() => {
      throw new Error('blocked');
    });
    expect(await saveFpsDumpInBrowser(dump(), null, download)).toBe(false);
  });

  it('is a picker only where the File System Access API is there', () => {
    expect(fpsSaveMode({ showSaveFilePicker: () => undefined })).toBe('picker');
    expect(fpsSaveMode({})).toBe('download');
  });
});
