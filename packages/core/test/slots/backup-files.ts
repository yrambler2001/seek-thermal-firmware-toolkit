/* ==================================================================== *
 * Test plumbing: what a backup zip holds for one bank, read back out of the zip itself (the bytes a
 * person would unpack), so a test checks the saved file, not the object it was built from.
 * ==================================================================== */

import { readZipEntries } from '../../src/archive/zip-read.js';
import type { WriteBackup } from '../../src/slots/backup.js';
import type { SlotKey } from '../../src/slots/types.js';

export interface BackupBankFiles {
  readonly rawName: string | null;
  readonly raw: Uint8Array | null;
  readonly plainName: string | null;
  readonly plain: Uint8Array | null;
  readonly text: string;
}

/** The stored and decrypted files the zip holds for `key`, by the names its bank record gives. */
export function backupBankFiles(backup: WriteBackup, key: SlotKey): BackupBankFiles {
  const entries = readZipEntries(backup.zip);
  const at = (name: string | null): Uint8Array | null =>
    name === null
      ? null
      : (entries.find((entry) => entry.name === `${backup.name}/${name}`)?.data ?? null);
  const bank = backup.banks.find((candidate) => candidate.key === key);
  const rawName = bank?.stored?.name ?? null;
  const plainName = bank?.decrypted?.name ?? null;
  const text = entries.find((entry) => entry.name === `${backup.name}/${backup.textName}`);
  return {
    rawName,
    raw: at(rawName),
    plainName,
    plain: at(plainName),
    text: text === undefined ? '' : new TextDecoder().decode(text.data),
  };
}
