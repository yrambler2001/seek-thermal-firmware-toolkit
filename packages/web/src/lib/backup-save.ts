/**
 * Saves the backup zip every bank write saves first (core `WriteBackup`, slots/backup.ts), as one automatic
 * download, the way the page saves its other zips (`lib/download.ts`): no save-file dialog, no question
 * (owner, 2026-10-26). The write waits for this: a save that answers anything but true refuses it in core
 * before anything is sent.
 *
 * A browser gives no event for a download reaching the disk, so true here means the download was started.
 * The page says so, and says what to check (`backupDownloadLines`).
 */

import type { WriteBackup } from '@seek-fw/core';
import { downloadBytes } from './download';

/** Starts the zip's download. Resolves true once it is handed to the browser; any throw resolves false. */
export function saveBackupAsDownload(
  backup: WriteBackup,
  download: (data: Uint8Array, name: string) => void = (data, name) => {
    downloadBytes(data, name, 'application/zip');
  },
): Promise<boolean> {
  try {
    download(backup.zip, backup.fileName);
    return Promise.resolve(true);
  } catch {
    return Promise.resolve(false);
  }
}

/** What the page says a write saves first, after core's plan sentence: where the zip goes, and what to check. */
export const BACKUP_DOWNLOAD_NOTE =
  'The zip is downloaded automatically, before anything is sent. A browser gives no word when a ' +
  'download reaches the disk, so check your downloads folder for it before you rely on it.';

/** The log lines once the zip's download was started. */
export function backupDownloadLines(backup: WriteBackup): string[] {
  return [
    `saved first, as a download: ${backup.fileName} (${backup.zip.length.toLocaleString()} B)`,
    'the browser gives no word when a download reaches the disk: check your downloads folder for it ' +
      'before you rely on it',
  ];
}
