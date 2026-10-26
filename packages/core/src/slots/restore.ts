/* ==================================================================== *
 * Restoring one bank from a full flash backup: the 4 MiB image a J-Link reads (or the whole flash a
 * Preserve run file holds), the bank cut out at its address for this camera's line, decrypted with the
 * slot-file decryption (`decryptSlotFile`, the keystream recovered from the bank's own bytes), and staged
 * as a decrypted image, so every rule of a decrypted-image write applies.
 *
 * WHAT IS CHECKED, AND WHAT ONLY WARNS (the page and the CLI warn, never gate):
 *   - a file that is not a whole flash (4 MiB, or a Preserve run file holding one) is refused: there is no
 *     bank to cut;
 *   - a bank that is EMPTY in the backup (all 0xFF) cannot be restored by a write, because a write programs
 *     an image and cannot leave a bank erased: refused, and said so;
 *   - a bank that holds no image, or that no key recovered from it opens, is refused: there is nothing to
 *     stage;
 *   - a backup whose identity block (0x14020000) names another camera than this one, or names none, and a
 *     bank of another firmware than the camera runs, are WARNINGS on the plan.
 *
 * After the write the read-back is compared with the backup's stored bank bytes (`restoreReadBack`): on the
 * 2016 line the camera re-encrypts the image under key block 1 of its pair, so the bytes are expected to come
 * back equal; that is what the bench measures (TESTING.md 42.91).
 * ==================================================================== */

import { sha256hex } from '../bytes.js';
import { looksLikeZip, readZipEntries } from '../archive/zip-read.js';
import { PRESERVE_DUMP_ORIGINAL_FILE } from '../preservation/steps.js';
import { isDeviceBlockHead, DEVICE_BLOCK_ADDRESS } from '../preservation/windows.js';
import { decryptSlotFile, type SlotFileDecryption } from './decrypt-file.js';
import { slotDumpNames } from './dump.js';
import { prepareSlotFlash, type PrepareSlotFlashOptions } from './write.js';
import { slotRefused } from './write-image.js';
import { sha256Sync } from './write-sha.js';
import { SLOT_BYTES, type SlotFlashPlan, type SlotKey, type SlotsReport } from './types.js';

/** Where the flash starts in the camera's address space. */
export const FLASH_BASE = 0x14000000;
/** A whole flash backup: the 4 MiB part. */
export const FULL_FLASH_BYTES = 0x400000;

/** Who a flash image belongs to, from its identity block (0x14020000). */
export interface FlashIdentity {
  /** The 12-character serial at +16, or null when the block is not there or holds none. */
  readonly serial: string | null;
  /** The chip id: the low bytes of the six words at +4, as hex, or null. */
  readonly chipId: string | null;
}

/**
 * The identity a whole flash carries in its device block: the header word `00|01 00 31 f7`, the chip id's six
 * bytes as the low bytes of the words at +4..+15, and the serial as 12 ASCII characters at +16 (measured on the
 * bench's FF board: `090BE9B6D4E4` and `090BB12PR939`; and on the reference Compact: `1013CE098ACA` and
 * `101310HSNEA2`). Null fields when the block is not there.
 */
export function flashIdentityOf(flash: Uint8Array): FlashIdentity {
  const at = DEVICE_BLOCK_ADDRESS - FLASH_BASE;
  const head = flash.subarray(at, at + 32);
  if (head.length < 28 || !isDeviceBlockHead(head)) return { serial: null, chipId: null };
  let chipId = '';
  for (let word = 0; word < 6; word++) {
    chipId += (head[4 + word * 2] ?? 0).toString(16).padStart(2, '0').toUpperCase();
  }
  const serialBytes = head.subarray(16, 28);
  const serial = String.fromCharCode(...serialBytes).replace(/\0+$/, '');
  return {
    serial: /^[0-9A-Za-z]{6,12}$/.test(serial) ? serial : null,
    chipId: /^0+$/.test(chipId) ? null : chipId,
  };
}

/** A full flash backup, read from a file. */
export interface FullFlashBackup {
  /** The file the person picked. */
  readonly fileName: string;
  /** The 4 MiB part. */
  readonly flash: Uint8Array;
  readonly sha256: string;
  /** A flash file as it is, or the whole flash inside a Preserve run file. */
  readonly from: 'flash-file' | 'preserve-run';
  /** The entry the flash was taken from, for a Preserve run file. */
  readonly entry: string | null;
  readonly identity: FlashIdentity;
}

function baseName(name: string): string {
  return name.slice(name.lastIndexOf('/') + 1);
}

/**
 * Reads a full flash backup from a file: a 4 MiB flash image as it is, or a Preserve run file (a ZIP) that
 * holds the whole flash (`preserve_dump_original.bin`, written once the run's full-dump step has run). Throws a
 * refusal for anything else, saying what the file is.
 */
export async function fullFlashOf(bytes: Uint8Array, fileName: string): Promise<FullFlashBackup> {
  let flash = bytes;
  let from: FullFlashBackup['from'] = 'flash-file';
  let entry: string | null = null;
  if (looksLikeZip(bytes)) {
    let entries;
    try {
      entries = readZipEntries(bytes);
    } catch (error) {
      throw slotRefused(
        `${fileName} is a ZIP that cannot be read here (${error instanceof Error ? error.message : String(error)}). Nothing was written.`,
      );
    }
    const found = entries.find(
      (candidate) => baseName(candidate.name) === PRESERVE_DUMP_ORIGINAL_FILE,
    );
    if (found === undefined) {
      throw slotRefused(
        `${fileName} holds no whole flash. A Preserve run file holds one (${PRESERVE_DUMP_ORIGINAL_FILE}) ` +
          'once its full-dump step has run; this ZIP holds ' +
          `${
            entries.length === 0
              ? 'nothing'
              : entries
                  .map((candidate) => baseName(candidate.name))
                  .slice(0, 8)
                  .join(', ')
          }. Nothing was written.`,
      );
    }
    flash = found.data;
    from = 'preserve-run';
    entry = found.name;
  }
  if (flash.length !== FULL_FLASH_BYTES) {
    throw slotRefused(
      `a full flash backup is ${String(FULL_FLASH_BYTES)} B (4 MiB, the whole part a J-Link reads); ` +
        `${entry ?? fileName} is ${String(flash.length)} B. Nothing was written.`,
      { size: flash.length },
    );
  }
  return {
    fileName,
    flash,
    sha256: await sha256hex(flash),
    from,
    entry,
    identity: flashIdentityOf(flash),
  };
}

/** A restore, planned. */
export interface SlotRestorePlan {
  readonly key: SlotKey;
  readonly backup: FullFlashBackup;
  /** The bank as the backup stores it (64 KiB at the bank's address). */
  readonly stored: Uint8Array;
  readonly storedSha256: string;
  /** The bank's stored bytes now, from the slots read, are the backup's: the write puts the same image back. */
  readonly sameAsNow: boolean;
  /** The backup's identity names this camera (true), another one (false), or cannot say (null). */
  readonly sameCamera: boolean | null;
  /** The version the backup's bank holds. */
  readonly version: string | null;
  readonly decryption: SlotFileDecryption;
  /** The name the image is prepared under (a slot dump's decrypted name, with the camera's key pair when held). */
  readonly fileName: string;
  /** Where the image comes from, in words. */
  readonly source: string;
  readonly plan: SlotFlashPlan;
}

/**
 * Plans the restore of bank `key` from a full flash backup: cut, decrypt, stage as a decrypted image, and say
 * how the backup compares with the camera. Reads nothing from the camera and sends nothing.
 */
export async function planSlotRestore(
  report: SlotsReport,
  key: SlotKey,
  backup: FullFlashBackup,
  options: PrepareSlotFlashOptions = {},
): Promise<SlotRestorePlan> {
  const entry = report.plan.slots.find((slot) => slot.key === key);
  if (entry === undefined) {
    throw slotRefused(`this build's plan has no bank ${key.toUpperCase()}. Nothing was written.`);
  }
  const offset = entry.address - FLASH_BASE;
  if (offset < 0 || offset + SLOT_BYTES > backup.flash.length) {
    throw slotRefused(`${entry.name} is not inside a 4 MiB flash. Nothing was written.`);
  }
  const stored = backup.flash.slice(offset, offset + SLOT_BYTES);
  const storedSha256 = await sha256hex(stored);
  const where = `the backup's ${entry.name} (at 0x${entry.address.toString(16).toUpperCase()})`;
  if (stored.every((byte) => byte === 0xff)) {
    throw slotRefused(
      `${where} is empty: every byte is 0xFF. A write programs an image and cannot leave a bank ` +
        'erased, so an empty bank cannot be restored by a write. Nothing was written.',
    );
  }
  const decryption = await decryptSlotFile(stored, { profile: report.state.profile });
  if (decryption.status !== 'decrypted' || decryption.plain === null) {
    throw slotRefused(
      `${where} cannot be restored from this file: ${decryption.notes.join('; ') || decryption.status}. ` +
        'Nothing was written.',
    );
  }
  const plain = decryption.plain;
  const version = decryption.header?.version ?? null;
  const { decrypted } = slotDumpNames(
    { key, sha256: storedSha256, empty: false, plain },
    version,
    report.state.keyTable,
  );
  const fileName = decrypted ?? `seek-slot-${key}-decrypted.bin`;
  const prepared = prepareSlotFlash(
    report,
    key,
    { kind: 'plain', bytes: plain, fileName },
    options,
  );

  const camera = report.state.serial;
  const theirs = backup.identity.serial;
  const sameCamera = theirs === null || camera === null ? null : theirs === camera;
  const view = report.slots.find((candidate) => candidate.entry.key === key);
  const nowRaw = view?.state?.raw ?? null;
  const sameAsNow = nowRaw !== null && sha256Sync(nowRaw) === storedSha256;

  const warnings: string[] = [];
  const notes: string[] = [
    `The image is ${where} in ${backup.fileName}${backup.entry === null ? '' : ` (${backup.entry})`}: ` +
      `stored sha256 ${storedSha256}, decrypted to ${version === null ? 'an image' : `firmware ${version}`} of ` +
      `${String(plain.length)} B (sha256 ${decryption.plainSha256 ?? sha256Sync(plain)}).`,
    'After the write, the bank read back is compared with the backup’s stored bank bytes.',
  ];
  if (sameCamera === false) {
    warnings.push(
      `This backup looks like another camera's: its identity block names serial ${theirs ?? '(none)'}, and this ` +
        `camera is ${camera ?? '(serial not read)'}. Only ${entry.name}'s image is written; nothing of that ` +
        "camera's identity or calibration is.",
    );
  } else if (sameCamera === null) {
    warnings.push(
      theirs === null
        ? 'This backup has no identity block at 0x14020000, so it cannot be told whose camera it was read from.'
        : `The camera's serial was not read, so the backup (serial ${theirs}) cannot be matched to it.`,
    );
  } else {
    notes.push(`The backup's identity block names this camera (serial ${theirs ?? ''}).`);
  }
  if (version !== null && report.state.version !== null && version !== report.state.version) {
    warnings.push(
      `${where} holds firmware ${version}, and the camera runs ${report.state.version}: the restore puts ` +
        'another firmware in the bank.',
    );
  }
  if (sameAsNow) {
    notes.push(
      `${entry.name} holds the backup's stored bytes already: the write puts the same image back.`,
    );
  }
  const source =
    `${where} in the full flash backup ${backup.fileName}` +
    (version === null ? '' : `, firmware ${version}`);
  return {
    key,
    backup,
    stored,
    storedSha256,
    sameAsNow,
    sameCamera,
    version,
    decryption,
    fileName,
    source,
    plan: {
      ...prepared,
      warnings: [...warnings, ...prepared.warnings],
      notes: [...notes.map((text) => ({ source: 'write' as const, text })), ...prepared.notes],
    },
  };
}

/** The read-back of a restored bank against the backup's stored bytes. */
export interface RestoreReadBack {
  /** False when no read-back was taken. */
  readonly compared: boolean;
  /** The read-back equals the backup's stored bank, byte for byte; null when not compared. */
  readonly equal: boolean | null;
  /** How many bytes differ. */
  readonly differing: number;
  /** The first differing offset, or null. */
  readonly firstDiffering: number | null;
}

/** Compares the read-back of a restored bank with the backup's stored bank bytes. */
export function restoreReadBack(stored: Uint8Array, after: Uint8Array | null): RestoreReadBack {
  if (after === null) return { compared: false, equal: null, differing: 0, firstDiffering: null };
  const span = Math.max(stored.length, after.length);
  let differing = 0;
  let firstDiffering: number | null = null;
  for (let at = 0; at < span; at++) {
    if (stored[at] !== after[at]) {
      differing++;
      firstDiffering ??= at;
    }
  }
  return { compared: true, equal: differing === 0, differing, firstDiffering };
}

/** The read-back verdict in words, the same on the page and in the CLI. */
export function restoreReadBackText(check: RestoreReadBack, bankName: string): string {
  if (!check.compared)
    return `${bankName} was not read back, so it is not compared with the backup.`;
  if (check.equal === true) {
    return `${bankName} reads back byte for byte as the backup stores it.`;
  }
  return (
    `${bankName} reads back different from the backup's stored bytes in ${String(check.differing)} B ` +
    `(first at +0x${(check.firstDiffering ?? 0).toString(16).toUpperCase()}).`
  );
}
