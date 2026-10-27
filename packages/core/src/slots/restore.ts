/* ==================================================================== *
 * Restoring one bank from a full flash backup: the 4 MiB image a J-Link reads, or the whole flash inside a
 * ZIP (a Preserve run file's `preserve_dump_original.bin`, a Dump & decrypt 4.x/Nano zip's
 * `flash_dump_original.bin`, a Dump all selectors zip's `flash_dump_all_selectors.bin`), the bank cut out
 * at its address for this camera's line, decrypted with the slot-file decryption (`decryptSlotFile`, the
 * keystream recovered from the bank's own bytes), and staged as a decrypted image, so every rule of a
 * decrypted-image write applies. A run file's `preserve_dump_patched.bin` is never taken: it holds the
 * run's temporary patch.
 *
 * WHAT IS CHECKED, AND WHAT ONLY WARNS (the page and the CLI warn, never gate):
 *   - a file that is not a whole flash (4 MiB, or a ZIP holding one of the three) is refused: there is no
 *     bank to cut;
 *   - a bank the dump did not read (a gap by its manifest.json: a block no request reaches, a window whose
 *     read failed, a block no selector returned; or a bank whose every byte is a gap fill other than 0xFF)
 *     is refused: the bytes are the fill, not the bank. On 4.x the one unreachable block, 0x14060000,
 *     holds no bank, so A, B and R of a 4.x dump are all read;
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
import { bankWordsOf } from '../profiles/locked-boot.js';
import { FLASH_DUMP_ALL_SELECTORS_FILE, FLASH_DUMP_ORIGINAL_FILE } from '../archive/flash-files.js';
import { looksLikeZip, readZipEntries, type ZipEntry } from '../archive/zip-read.js';
import { PRESERVE_DUMP_ORIGINAL_FILE, PRESERVE_DUMP_PATCHED_FILE } from '../preservation/steps.js';
import { isDeviceBlockHead, DEVICE_BLOCK_ADDRESS } from '../preservation/windows.js';
import { decryptSlotFile, type SlotFileDecryption } from './decrypt-file.js';
import { slotDumpNames } from './dump.js';
import { prepareSlotFlash } from './write.js';
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

/**
 * Where a full flash backup's 4 MiB came from: a flash file as it is, or the whole flash inside a Preserve
 * run file, a Dump & decrypt 4.x/Nano zip, or a Dump all selectors zip.
 */
export type FullFlashSource = 'flash-file' | 'preserve-run' | 'dump' | 'all-selectors';

/** A block of the flash the dump did not read, as its manifest.json lists it. */
export interface FullFlashGap {
  readonly address: number;
  readonly length: number;
  readonly reason: string;
}

/** A full flash backup, read from a file. */
export interface FullFlashBackup {
  /** The file the person picked. */
  readonly fileName: string;
  /** The 4 MiB part. */
  readonly flash: Uint8Array;
  readonly sha256: string;
  /** What kind of file the flash came from. */
  readonly from: FullFlashSource;
  /** The entry the flash was taken from, for a ZIP. */
  readonly entry: string | null;
  readonly identity: FlashIdentity;
  /** The byte a dump writes where it read nothing (manifest.json's `gapFill`), or null when not known. */
  readonly gapFill: number | null;
  /** The blocks a dump's manifest.json lists as not read (its `gaps`); empty when it lists none. */
  readonly gaps: readonly FullFlashGap[];
}

/** The ZIP entries a whole flash is taken from, in the order they are looked for. */
const FULL_FLASH_ENTRIES: readonly { readonly file: string; readonly from: FullFlashSource }[] = [
  { file: PRESERVE_DUMP_ORIGINAL_FILE, from: 'preserve-run' },
  { file: FLASH_DUMP_ORIGINAL_FILE, from: 'dump' },
  { file: FLASH_DUMP_ALL_SELECTORS_FILE, from: 'all-selectors' },
];

/** What kind of file a full flash backup is, in words, the same on the page and in the CLI. */
export function fullFlashSourceWords(from: FullFlashSource): string {
  switch (from) {
    case 'flash-file':
      return 'a 4 MiB flash image';
    case 'preserve-run':
      return 'a Preserve run file';
    case 'dump':
      return 'a Dump & decrypt 4.x/Nano zip';
    case 'all-selectors':
      return 'a Dump all selectors zip';
  }
}

/** The line the page logs and the CLI prints when a full flash backup is read: the file, its kind, its identity. */
export function fullFlashBackupText(backup: FullFlashBackup): string {
  return (
    `${backup.fileName}: ${fullFlashSourceWords(backup.from)}` +
    (backup.entry === null ? '' : ` (the whole flash is its ${backup.entry})`) +
    `, sha256 ${backup.sha256}; its identity block names ${backup.identity.serial ?? 'no serial'}`
  );
}

function baseName(name: string): string {
  return name.slice(name.lastIndexOf('/') + 1);
}

function numberOf(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value !== 'string' || !/^(0x)?[0-9a-f]+$/i.test(value)) return null;
  return Number.parseInt(value.replace(/^0x/i, ''), 16);
}

/**
 * The gap fill and the blocks a dump did not read, from its manifest.json (beside the flash entry, in the
 * same folder): for Dump & decrypt 4.x/Nano the gaps it lists and every window whose read failed; for Dump
 * all selectors every 64 KiB block no selector with that address returned data for. A manifest that is not
 * there or cannot be read gives no gap fill and no gaps.
 */
function dumpGapsOf(
  entries: readonly ZipEntry[],
  flashEntry: string,
  from: FullFlashSource,
): { gapFill: number | null; gaps: FullFlashGap[] } {
  const folder = flashEntry.slice(0, flashEntry.lastIndexOf('/') + 1);
  const manifest = entries.find((candidate) => candidate.name === `${folder}manifest.json`);
  if (manifest === undefined) return { gapFill: null, gaps: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(manifest.data));
  } catch {
    return { gapFill: null, gaps: [] };
  }
  if (typeof parsed !== 'object' || parsed === null) return { gapFill: null, gaps: [] };
  const record = parsed as {
    gapFill?: unknown;
    gaps?: unknown;
    windows?: unknown;
    selectors?: unknown;
  };
  const gaps: FullFlashGap[] = [];
  if (Array.isArray(record.gaps)) {
    for (const gap of record.gaps as unknown[]) {
      if (typeof gap !== 'object' || gap === null) continue;
      const { address, length, reason } = gap as {
        address?: unknown;
        length?: unknown;
        reason?: unknown;
      };
      const at = numberOf(address);
      const size = typeof length === 'number' ? length : null;
      if (at === null || size === null) continue;
      gaps.push({ address: at, length: size, reason: typeof reason === 'string' ? reason : '' });
    }
  }
  if (Array.isArray(record.windows)) {
    for (const window of record.windows as unknown[]) {
      if (typeof window !== 'object' || window === null) continue;
      const { address, requested, ok, error } = window as {
        address?: unknown;
        requested?: unknown;
        ok?: unknown;
        error?: unknown;
      };
      const at = numberOf(address);
      if (ok !== false || at === null) continue;
      gaps.push({
        address: at,
        length: typeof requested === 'number' ? requested : SLOT_BYTES,
        reason:
          typeof error === 'string' ? `its read failed: ${error}` : 'its read came back short',
      });
    }
  }
  if (from === 'all-selectors' && Array.isArray(record.selectors)) {
    const placed = new Set<number>();
    for (const selector of record.selectors as unknown[]) {
      if (typeof selector !== 'object' || selector === null) continue;
      const { mappedAddress, file } = selector as { mappedAddress?: unknown; file?: unknown };
      const at = numberOf(mappedAddress);
      if (at !== null && typeof file === 'string') placed.add(at);
    }
    for (let at = FLASH_BASE; at < FLASH_BASE + FULL_FLASH_BYTES; at += SLOT_BYTES) {
      if (!placed.has(at)) {
        gaps.push({
          address: at,
          length: SLOT_BYTES,
          reason: 'no selector with this address returned data',
        });
      }
    }
  }
  return { gapFill: numberOf(record.gapFill), gaps };
}

/**
 * Reads a full flash backup from a file: a 4 MiB flash image as it is, or a ZIP that holds the whole flash:
 * a Preserve run file (`preserve_dump_original.bin`, written once the run's full-dump step has run), a
 * Dump & decrypt 4.x/Nano zip (`flash_dump_original.bin`) or a Dump all selectors zip
 * (`flash_dump_all_selectors.bin`). A run file's `preserve_dump_patched.bin` is never taken. Throws a refusal
 * for anything else, saying what the file is.
 */
export async function fullFlashOf(bytes: Uint8Array, fileName: string): Promise<FullFlashBackup> {
  let flash = bytes;
  let from: FullFlashSource = 'flash-file';
  let entry: string | null = null;
  let gapFill: number | null = null;
  let gaps: FullFlashGap[] = [];
  if (looksLikeZip(bytes)) {
    let entries;
    try {
      entries = readZipEntries(bytes);
    } catch (error) {
      throw slotRefused(
        `${fileName} is a ZIP that cannot be read here (${error instanceof Error ? error.message : String(error)}). Nothing was written.`,
      );
    }
    let found: { entry: ZipEntry; from: FullFlashSource } | undefined;
    for (const kind of FULL_FLASH_ENTRIES) {
      const match = entries.find((candidate) => baseName(candidate.name) === kind.file);
      if (match !== undefined) {
        found = { entry: match, from: kind.from };
        break;
      }
    }
    if (found === undefined) {
      const names = entries.map((candidate) => baseName(candidate.name));
      throw slotRefused(
        `${fileName} holds no whole flash. A ZIP is taken when it is a Preserve run file that holds ` +
          `${PRESERVE_DUMP_ORIGINAL_FILE} (once its full-dump step has run), a Dump & decrypt 4.x/Nano zip ` +
          `(${FLASH_DUMP_ORIGINAL_FILE}) or a Dump all selectors zip (${FLASH_DUMP_ALL_SELECTORS_FILE}); ` +
          `this ZIP holds ${names.length === 0 ? 'nothing' : names.slice(0, 8).join(', ')}.` +
          (names.includes(PRESERVE_DUMP_PATCHED_FILE)
            ? ` Its ${PRESERVE_DUMP_PATCHED_FILE} is the flash with the run's temporary patch in it, so it is not taken.`
            : '') +
          ' Nothing was written.',
      );
    }
    flash = found.entry.data;
    from = found.from;
    entry = found.entry.name;
    if (from === 'dump' || from === 'all-selectors') {
      ({ gapFill, gaps } = dumpGapsOf(entries, entry, from));
    }
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
    gapFill,
    gaps,
  };
}

function byteWords(value: number): string {
  return `0x${value.toString(16).toUpperCase().padStart(2, '0')}`;
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
): Promise<SlotRestorePlan> {
  const entry = report.plan.slots.find((slot) => slot.key === key);
  if (entry === undefined) {
    throw slotRefused(`this build's plan has no ${bankWordsOf(key)}. Nothing was written.`);
  }
  const offset = entry.address - FLASH_BASE;
  if (offset < 0 || offset + SLOT_BYTES > backup.flash.length) {
    throw slotRefused(`${entry.name} is not inside a 4 MiB flash. Nothing was written.`);
  }
  const stored = backup.flash.slice(offset, offset + SLOT_BYTES);
  const storedSha256 = await sha256hex(stored);
  const where = `the backup's ${entry.name} (at 0x${entry.address.toString(16).toUpperCase()})`;
  const gap = backup.gaps.find(
    (candidate) =>
      candidate.address < entry.address + SLOT_BYTES &&
      entry.address < candidate.address + candidate.length,
  );
  if (gap !== undefined) {
    throw slotRefused(
      `${where} was not read by the dump ${backup.fileName} comes from: by its manifest.json, ` +
        `0x${gap.address.toString(16).toUpperCase()} is a gap${gap.reason === '' ? '' : ` (${gap.reason})`}` +
        `${backup.gapFill === null ? '' : `, filled with ${byteWords(backup.gapFill)}`}. There is no image ` +
        'to restore. Nothing was written.',
    );
  }
  if (stored.every((byte) => byte === 0xff)) {
    throw slotRefused(
      `${where} is empty: every byte is 0xFF. A write programs an image and cannot leave a bank ` +
        'erased, so an empty bank cannot be restored by a write. Nothing was written.',
    );
  }
  const gapFill = backup.gapFill;
  if (gapFill !== null && stored.every((byte) => byte === gapFill)) {
    throw slotRefused(
      `${where} is ${byteWords(gapFill)} in every byte, the fill the dump writes where it read nothing: ` +
        'the dump did not read this bank. There is no image to restore. Nothing was written.',
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
  const prepared = prepareSlotFlash(report, key, { kind: 'plain', bytes: plain, fileName });

  const camera = report.state.serial;
  const theirs = backup.identity.serial;
  const sameCamera = theirs === null || camera === null ? null : theirs === camera;
  const view = report.slots.find((candidate) => candidate.entry.key === key);
  const nowRaw = view?.state?.raw ?? null;
  const sameAsNow = nowRaw !== null && sha256Sync(nowRaw) === storedSha256;

  const warnings: string[] = [];
  const notes: string[] = [
    `The image is ${where} in ${backup.fileName}, ${fullFlashSourceWords(backup.from)}` +
      `${backup.entry === null ? '' : ` (its ${backup.entry})`}: ` +
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
