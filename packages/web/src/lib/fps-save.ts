/**
 * Saves the pre-patch dump in the browser, before a frame-rate patch is written. The write waits for
 * this: a save that returns false refuses the patch in core (`patchBankFps`), before anything is sent.
 *
 * Two ways, and the page says which one it is using:
 *  - the File System Access API (Chrome, Edge, and other Chromium browsers that have it): the person
 *    picks a place for each file, and the save counts only once the file is closed, so the page knows
 *    it was written;
 *  - otherwise two downloads. A browser gives no event for a download reaching the disk, so the page
 *    can only say the downloads were started. It says so, and says what to check.
 */

import type { FpsPreDump } from '@seek-fw/core';
import { downloadBytes } from './download';

/** The part of a file handle the save uses. */
export interface WritableLike {
  write(data: Uint8Array): Promise<void>;
  close(): Promise<void>;
}

export interface FileHandleLike {
  createWritable(): Promise<WritableLike>;
}

export type SaveFilePicker = (options: {
  readonly suggestedName: string;
}) => Promise<FileHandleLike>;

export type FpsSaveMode = 'picker' | 'download';

/** Which way this browser saves: the picker when the File System Access API is there. */
export function fpsSaveMode(scope: object = globalThis): FpsSaveMode {
  return typeof (scope as { showSaveFilePicker?: unknown }).showSaveFilePicker === 'function'
    ? 'picker'
    : 'download';
}

/** The live picker, or null when the browser has none. */
function livePicker(): SaveFilePicker | null {
  const scope = globalThis as unknown as { showSaveFilePicker?: SaveFilePicker };
  const picker = scope.showSaveFilePicker;
  return typeof picker === 'function' ? (options) => picker.call(globalThis, options) : null;
}

/**
 * Saves the two files of a pre-patch dump: raw first, then decrypted. Resolves true only when both are
 * written (picker) or both downloads were started (download). Any error, including the person
 * cancelling the picker, resolves false.
 */
export async function saveFpsDumpInBrowser(
  dump: FpsPreDump,
  picker: SaveFilePicker | null = livePicker(),
  download: (data: Uint8Array, name: string) => void = (data, name) => {
    downloadBytes(data, name);
  },
): Promise<boolean> {
  const files = [
    { name: dump.rawName, data: dump.raw },
    { name: dump.plainName, data: dump.plain },
  ] as const;
  try {
    if (picker !== null) {
      for (const file of files) {
        const handle = await picker({ suggestedName: file.name });
        const writable = await handle.createWritable();
        await writable.write(file.data);
        await writable.close();
      }
      return true;
    }
    for (const file of files) download(file.data, file.name);
    return true;
  } catch {
    return false;
  }
}
