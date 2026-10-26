/**
 * The backup zip the slots page downloads before every bank write (core slots/backup.ts, TESTING.md 42.91):
 * `seek_backup_<time>_<serial>_v<firmware>_bank-<banks>_<write>.zip`, one folder of the same name holding
 * each bank as stored (`seek-slot-<bank>-<version>-<sha8>.bin`), its decrypted image when a key opens it
 * (`…-decrypted[-KeyA-…-KeyB-…].bin`) and `README.txt`. A spec reads it back here, from the download.
 */

import type { Download, DownloadWaiter } from './browser.js';
import { readZip } from './zip.js';

export type BankLetter = 'a' | 'b' | 'r';

/** The zip name's pattern for the banks and the write's label (`before-fps-patch`, `before-copy-from-A`, …). */
export function backupZipPattern(banks: readonly BankLetter[], label: string): RegExp {
  const bank = banks.map((letter) => letter.toUpperCase()).join('-');
  return new RegExp(
    `^seek_backup_\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}Z_[A-Za-z0-9.-]+_v[A-Za-z0-9._-]+_bank-${bank}_${label}\\.zip$`,
  );
}

/** One bank's files in the zip. */
export interface BackupZipBank {
  readonly rawName: string | null;
  readonly raw: Uint8Array | null;
  readonly decryptedName: string | null;
  readonly decrypted: Uint8Array | null;
}

/** The zip, opened: its name, every entry, the text file, and each bank's files. */
export interface BackupZip {
  readonly name: string;
  readonly bytes: Uint8Array;
  readonly entries: readonly { readonly name: string; readonly data: Uint8Array }[];
  readonly text: string;
  bank(letter: BankLetter): BackupZipBank;
}

/** Opens a downloaded backup zip. Throws when it is not one (no folder of its name, no README.txt). */
export function openBackupZip(download: Download): BackupZip {
  const stem = download.name.replace(/\.zip$/, '');
  const entries = readZip(download.bytes);
  const inFolder = entries.every((entry) => entry.name.startsWith(`${stem}/`));
  if (!inFolder) throw new Error(`${download.name}: an entry is not in the folder ${stem}/`);
  const text = entries.find((entry) => entry.name === `${stem}/README.txt`);
  if (text === undefined) throw new Error(`${download.name}: no README.txt`);
  return {
    name: download.name,
    bytes: download.bytes,
    entries,
    text: new TextDecoder().decode(text.data),
    bank(letter: BankLetter): BackupZipBank {
      const base = (name: string): string => name.slice(stem.length + 1);
      const ofBank = entries.filter((entry) => base(entry.name).startsWith(`seek-slot-${letter}-`));
      const raw = ofBank.find((entry) => !base(entry.name).includes('-decrypted')) ?? null;
      const decrypted = ofBank.find((entry) => base(entry.name).includes('-decrypted')) ?? null;
      return {
        rawName: raw === null ? null : base(raw.name),
        raw: raw?.data ?? null,
        decryptedName: decrypted === null ? null : base(decrypted.name),
        decrypted: decrypted?.data ?? null,
      };
    },
  };
}

/** Waits for the backup zip of `banks` and `label`, and opens it. */
export async function waitForBackupZip(
  downloads: DownloadWaiter,
  banks: readonly BankLetter[],
  label: string,
  timeoutMs = 60_000,
): Promise<{ readonly download: Download; readonly zip: BackupZip }> {
  const pattern = backupZipPattern(banks, label);
  const download = await downloads.waitFor(
    (name) => pattern.test(name),
    timeoutMs,
    `the backup zip of ${banks.map((letter) => letter.toUpperCase()).join(', ')} (${label})`,
  );
  return { download, zip: openBackupZip(download) };
}
