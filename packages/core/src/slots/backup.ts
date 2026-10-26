/* ==================================================================== *
 * The backup every bank write saves first: ONE zip, holding each bank the write is about to change
 * as the camera serves it just before the write (the bank as stored, and its decrypted image when a
 * key recovered from it opens it), and a short text file that says what they are.
 *
 * THE RULE (owner, 2026-10-26): a write never runs without its backup saved first. The page saves the
 * zip as an automatic download, named like its other zips; the CLI writes the same zip, under the same
 * name, into its dump folder. Core builds the zip and its name here, so the two are the same file, and
 * the write functions (`flashSlotWithBackup`, `patchBankFps`, `patchEveryBankFps`) call the caller's
 * `saveBackup` and refuse to send anything unless it answers the literal `true`.
 *
 * A target bank that is EMPTY (every byte 0xFF) or that cannot be read is not a refusal: the zip says
 * so, the plan says so, and the write goes on. A read refused because the camera no longer runs the
 * build the analysis read is a refusal (the plan is stale), and a cancel is a cancel.
 * ==================================================================== */

import { buildZip } from '../archive/zip.js';
import { hexUp, isoStamp, utf8 } from '../bytes.js';
import { CancelledError, errorMessage, SeekError } from '../errors.js';
import type { Artifact } from '../events.js';
import type { WorkflowContext } from '../workflows/types.js';
import { dumpSlot, safeVersion, slotDumpNames } from './dump.js';
import type { DumpedSlot, SlotInputKind, SlotKey, SlotsReport } from './types.js';

/** What a write is, as its backup names it. */
export type WriteAction =
  /** The frame-rate patch of one bank. */
  | { readonly kind: 'fps-patch' }
  /** The frame-rate patch of every bank that offers it, in one confirmation. */
  | { readonly kind: 'fps-patch-every-bank' }
  /** "Flash decrypted image" (`input` 'plain') or "Flash raw bytes" ('raw') of a picked file. */
  | { readonly kind: 'flash'; readonly input: SlotInputKind; readonly fileName: string }
  /** The image of another bank, decrypted from the slots read, written to this one. */
  | { readonly kind: 'copy'; readonly from: SlotKey }
  /** This bank as a full flash backup holds it. */
  | { readonly kind: 'restore'; readonly fileName: string };

/** The action's part of the zip's name: `before-fps-patch`, `before-copy-from-B`, … */
export function writeActionLabel(action: WriteAction): string {
  switch (action.kind) {
    case 'fps-patch':
      return 'before-fps-patch';
    case 'fps-patch-every-bank':
      return 'before-fps-patch-every-bank';
    case 'flash':
      return action.input === 'raw' ? 'before-flash-raw' : 'before-flash';
    case 'copy':
      return `before-copy-from-${action.from.toUpperCase()}`;
    case 'restore':
      return 'before-restore';
  }
}

/**
 * The write a backup is saved before, in words, for its text file: `"Flash decrypted image" of x.bin into
 * Bank B`, `a copy of Bank A's image into Bank B`, … The frame-rate patch adds its rates itself.
 */
export function writeActionWords(
  action: WriteAction,
  report: SlotsReport,
  keys: readonly SlotKey[],
): string {
  const nameOf = (key: SlotKey): string =>
    report.plan.slots.find((slot) => slot.key === key)?.name ?? `Bank ${key.toUpperCase()}`;
  const targets = keys.map(nameOf).join(', then ');
  switch (action.kind) {
    case 'fps-patch':
      return `the frame-rate patch of ${targets}`;
    case 'fps-patch-every-bank':
      return `the frame-rate patch of every bank that offers it: ${targets}`;
    case 'flash':
      return `"${action.input === 'raw' ? 'Flash raw bytes' : 'Flash decrypted image'}" of ${action.fileName} into ${targets}`;
    case 'copy':
      return `a copy of ${nameOf(action.from)}'s image into ${targets}`;
    case 'restore':
      return `a restore of ${targets} from the full flash backup ${action.fileName}`;
  }
}

/** What a bank holds as the backup saved it. */
export type BackupContent =
  /** The bank as stored, and the image a key recovered from it decrypts to. */
  | 'image'
  /** The bank as stored; no decrypted image (no image header, or no key opened it). */
  | 'stored'
  /** Every byte read as 0xFF: an erased bank. The stored file is those bytes. */
  | 'empty'
  /** The bank could not be read; nothing of it is in the zip. */
  | 'unread';

/** One file in the zip: its name, its size and its SHA-256. */
export interface BackupFile {
  readonly name: string;
  readonly bytes: number;
  readonly sha256: string;
}

/** One bank as the backup saved it. */
export interface BackupBank {
  readonly key: SlotKey;
  /** The bank's name in the build's plan ("Bank A", "Recovery bank R"). */
  readonly name: string;
  readonly address: number;
  readonly content: BackupContent;
  /** The version the bank's image header carries, when it holds one. */
  readonly version: string | null;
  /** The key the slots read names for the bank ("key block 1"), when it names one. */
  readonly keyName: string | null;
  readonly stored: BackupFile | null;
  readonly decrypted: BackupFile | null;
  /** What the read said about the bank, or why it could not be read. */
  readonly notes: readonly string[];
}

/** The zip a write saves first, and what is in it. */
export interface WriteBackup {
  /** The zip's name without `.zip`, and the folder its files sit in inside the zip. */
  readonly name: string;
  /** `${name}.zip`. */
  readonly fileName: string;
  /** When the zip was built, as an ISO time. */
  readonly savedAt: string;
  readonly serial: string | null;
  readonly firmware: string | null;
  readonly action: WriteAction;
  /** The write the zip was saved before, in words. */
  readonly follows: string;
  readonly banks: readonly BackupBank[];
  /** The text file's name inside the folder. */
  readonly textName: string;
  /** The text file: what the zip holds, for a person. */
  readonly text: string;
  /** The zip as saved: `${name}/${file}` for every file. */
  readonly zip: Uint8Array;
}

/**
 * Saves the zip. The page starts a download; the CLI writes the file. Must resolve to `true` only once the
 * zip is written (the CLI) or handed to the browser's download (the page, which cannot see it reach the
 * disk and says so). Anything else, or a throw, refuses the write before anything is sent.
 */
export type SaveBackup = (backup: WriteBackup) => Promise<boolean>;

/** The text file's name inside the zip. */
export const BACKUP_TEXT_NAME = 'README.txt';

/** The stamp in a zip name: `2026-10-26T12-00-00Z`, as the page's other zips carry it. */
export const BACKUP_TIME_PLACEHOLDER = '<time>';

/** A serial that is safe inside a file name. */
function safeSerial(serial: string | null): string {
  if (serial === null || serial.trim() === '') return 'unknown-serial';
  return serial.trim().replace(/[^A-Za-z0-9.-]+/g, '-');
}

/**
 * The zip's name, without `.zip`: `seek_backup_<time>_<serial>_v<firmware>_bank-<A>_<action>`, the banks
 * joined (`bank-A-B-R`) when one zip holds several. The time is the page's file stamp (`isoStamp`), so the
 * zips sort by when they were saved; `stamp` replaces it (the plan shows `<time>` before the save).
 */
export function backupName(args: {
  readonly stamp: string;
  readonly serial: string | null;
  readonly firmware: string | null;
  readonly keys: readonly SlotKey[];
  readonly action: WriteAction;
}): string {
  /* Always A, B, R, whatever order the write goes in, so the name a plan shows before the save is the name of
   * the zip it saves (TESTING.md 42.96: the every-bank plan listed them in the write order). */
  const banks = [...args.keys]
    .sort((x, y) => 'abr'.indexOf(x) - 'abr'.indexOf(y))
    .map((key) => key.toUpperCase())
    .join('-');
  return [
    'seek_backup',
    args.stamp,
    safeSerial(args.serial),
    `v${safeVersion(args.firmware)}`,
    `bank-${banks}`,
    writeActionLabel(args.action),
  ].join('_');
}

/** The zip's name as a plan shows it before the save: the time not known yet. */
export function backupFileNameShown(
  report: SlotsReport,
  keys: readonly SlotKey[],
  action: WriteAction,
): string {
  return `${backupName({
    stamp: BACKUP_TIME_PLACEHOLDER,
    serial: report.state.serial,
    firmware: report.state.version,
    keys,
    action,
  })}.zip`;
}

/**
 * What the plan says the backup will hold for one bank, from the slots read: "Bank B (as stored, and
 * decrypted)", or why there is no decrypted file, or that the bank is empty or cannot be read. The read the
 * backup makes is a fresh one, just before the write; this is what that read is expected to find.
 */
export function backupBankWords(report: SlotsReport, key: SlotKey): string {
  const view = report.slots.find((candidate) => candidate.entry.key === key);
  const name = view?.entry.name ?? `Bank ${key.toUpperCase()}`;
  if (view === undefined) return `${name} (not in this build's plan: the zip says so)`;
  if (!view.entry.dump.supported) {
    return `${name} (this build cannot read it, ${view.entry.dump.reason}: the zip says so)`;
  }
  if (view.content === 'empty') {
    return `${name} (empty, every byte 0xFF: the zip says so, and the write overwrites no firmware)`;
  }
  if (view.content === 'unread') {
    return `${name} (the slots read did not reach it: the zip says whether the read before the write does)`;
  }
  if (view.state?.plain == null) {
    return `${name} (as stored; no key this read recovered opens it, so there is no decrypted file)`;
  }
  return `${name} (as stored, and decrypted)`;
}

/** "A", "A and B", "A, B and C". */
function listed(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1) ?? ''}`;
}

/**
 * The plan's sentence for the backup: which banks, what of each, and the zip's name, the same on the page and
 * in the CLI. The front end adds where the zip goes (a download, or the CLI's folder).
 */
export function backupPlanText(
  report: SlotsReport,
  keys: readonly SlotKey[],
  action: WriteAction,
): string {
  const banks = keys.map((key) => backupBankWords(report, key));
  return (
    `Before anything is written, ${listed(banks)} ${keys.length === 1 ? 'is' : 'are'} read again and ` +
    `saved in one zip with a note of what each file is: ${backupFileNameShown(report, keys, action)}.`
  );
}

/** One bank's read for the backup: what came back, or why nothing did. */
export interface BankRead {
  readonly key: SlotKey;
  readonly dumped: DumpedSlot | null;
  /** Why the bank could not be read, when `dumped` is null. */
  readonly unreadWhy: string | null;
}

/**
 * Reads one bank for its backup (`dumpSlot`). A bank this build cannot read, or a read that fails, comes back
 * as unread with the reason, and the write goes on: the zip and the log say so. Two things are not caught: a
 * cancel, and the refusal for a camera that now reports another build than the analysis read (the plan the
 * write would send is stale, so nothing may be sent on the strength of it).
 */
export async function readBankForBackup(
  ctx: WorkflowContext,
  report: SlotsReport,
  key: SlotKey,
): Promise<BankRead> {
  const entry = report.plan.slots.find((slot) => slot.key === key);
  if (entry === undefined) {
    return { key, dumped: null, unreadWhy: "this build's plan has no such bank" };
  }
  if (!entry.dump.supported) {
    return { key, dumped: null, unreadWhy: `this build cannot read it: ${entry.dump.reason}` };
  }
  if (entry.read === null) {
    return { key, dumped: null, unreadWhy: "this build's plan has no read window for it" };
  }
  try {
    return { key, dumped: await dumpSlot(ctx, report, key), unreadWhy: null };
  } catch (error) {
    if (error instanceof CancelledError) throw error;
    if (
      error instanceof SeekError &&
      error.code === 'slots/refused' &&
      error.detail?.firmwareVersion !== undefined
    ) {
      throw error;
    }
    return { key, dumped: null, unreadWhy: `the read failed: ${errorMessage(error)}` };
  }
}

function fileOf(name: string, data: Uint8Array, sha256: string): BackupFile {
  return { name, bytes: data.length, sha256 };
}

/** The version a bank's image carries, from the slots read. */
function versionIn(report: SlotsReport, key: SlotKey): string | null {
  const state = report.slots.find((view) => view.entry.key === key)?.state ?? null;
  return state?.plainHeader?.versionStr ?? state?.header?.versionStr ?? null;
}

/** The text file's lines for one bank. */
function bankLines(bank: BackupBank): string[] {
  const lines = [`${bank.name} at ${hexUp(bank.address)}`];
  const holds =
    bank.content === 'empty'
      ? 'nothing: the bank is empty (every byte read as 0xFF), so the write overwrites no firmware'
      : bank.content === 'unread'
        ? 'not known: the bank could not be read, so nothing of it is in this zip'
        : bank.version === null
          ? 'no image this read recognises'
          : `firmware ${bank.version}`;
  lines.push(`  holds     : ${holds}`);
  if (bank.content !== 'empty' && bank.content !== 'unread') {
    lines.push(`  key       : ${bank.keyName ?? 'not named by the slots read'}`);
  }
  if (bank.stored !== null) {
    lines.push(
      `  stored    : ${bank.stored.name}, ${String(bank.stored.bytes)} B, sha256 ${bank.stored.sha256}`,
    );
  }
  if (bank.decrypted !== null) {
    lines.push(
      `  decrypted : ${bank.decrypted.name}, ${String(bank.decrypted.bytes)} B, sha256 ${bank.decrypted.sha256}`,
    );
  } else if (bank.content === 'stored') {
    lines.push('  decrypted : none (no key recovered from the bank opens it)');
  }
  for (const note of bank.notes) lines.push(`  note      : ${note}`);
  return lines;
}

/** The text file: when, which camera, which write, and each bank. */
function backupText(backup: Omit<WriteBackup, 'text' | 'zip' | 'textName'>): string {
  const lines = [
    'Bank backup, saved before a write',
    '=================================',
    'Saved by the Seek Thermal firmware toolkit before it wrote to the camera. Each bank the write',
    'was about to change is here as the camera served it just before the write.',
    '',
    `saved at  : ${backup.savedAt}`,
    `camera    : serial ${backup.serial ?? '(not read)'}, firmware ${backup.firmware ?? '(not read)'}`,
    `write     : ${backup.follows}`,
    '',
  ];
  for (const bank of backup.banks) lines.push(...bankLines(bank), '');
  lines.push(
    'To put a bank back, write its decrypted file to the same bank with "Flash decrypted image"',
    '(seek-fw slots flash <bank> <file>). A bank with no decrypted file here cannot be put back that',
    'way. An empty bank cannot be made empty again by a write.',
  );
  return `${lines.join('\n')}\n`;
}

/**
 * Builds the zip from the reads. Pure: nothing is read or saved here. `follows` is the write in words. The
 * files are named as a slot dump names them (`slotDumpNames`), so a decrypted file carries the camera's key
 * pair when the image holds it and "Flash decrypted image" takes it as it is.
 */
export function buildWriteBackup(args: {
  readonly report: SlotsReport;
  readonly reads: readonly BankRead[];
  readonly action: WriteAction;
  readonly follows: string;
  readonly at: Date;
}): WriteBackup {
  const { report, reads, action, follows, at } = args;
  const files: Artifact[] = [];
  const banks: BackupBank[] = reads.map((read) => {
    const entry = report.plan.slots.find((slot) => slot.key === read.key);
    const name = entry?.name ?? `Bank ${read.key.toUpperCase()}`;
    const address = entry?.address ?? 0;
    const keyName =
      report.slots.find((view) => view.entry.key === read.key)?.state?.keyName ?? null;
    const dumped = read.dumped;
    if (dumped === null) {
      return {
        key: read.key,
        name,
        address,
        content: 'unread',
        version: null,
        keyName: null,
        stored: null,
        decrypted: null,
        notes: [read.unreadWhy ?? 'the bank was not read'],
      };
    }
    const version = dumped.empty ? null : versionIn(report, read.key);
    const names = slotDumpNames(dumped, version, report.state.keyTable);
    files.push({ name: names.raw, data: dumped.raw });
    const stored = fileOf(names.raw, dumped.raw, dumped.sha256);
    let decrypted: BackupFile | null = null;
    if (dumped.plain !== null && dumped.plainSha256 !== null && names.decrypted !== null) {
      files.push({ name: names.decrypted, data: dumped.plain });
      decrypted = fileOf(names.decrypted, dumped.plain, dumped.plainSha256);
    }
    return {
      key: read.key,
      name,
      address,
      content: dumped.empty ? 'empty' : decrypted === null ? 'stored' : 'image',
      version,
      keyName: dumped.empty ? null : keyName,
      stored,
      decrypted,
      notes: [...dumped.notes],
    };
  });
  const name = backupName({
    stamp: isoStamp(at),
    serial: report.state.serial,
    firmware: report.state.version,
    keys: reads.map((read) => read.key),
    action,
  });
  const head = {
    name,
    fileName: `${name}.zip`,
    savedAt: at.toISOString(),
    serial: report.state.serial,
    firmware: report.state.version,
    action,
    follows,
    banks,
  };
  const text = backupText(head);
  const zip = buildZip(
    [...files, { name: BACKUP_TEXT_NAME, data: utf8(text) }].map((file) => ({
      name: `${name}/${file.name}`,
      data: file.data,
    })),
    at,
  );
  return { ...head, textName: BACKUP_TEXT_NAME, text, zip };
}

/**
 * Saves the zip and refuses the write unless the save says it happened. Only the literal `true` counts: a
 * save that answers anything else, or throws, did not happen. Nothing has been sent when this refuses.
 */
export async function saveBackupFirst(backup: WriteBackup, save: SaveBackup): Promise<void> {
  let saved = false;
  let why: string | null = null;
  try {
    const answer: unknown = await save(backup);
    saved = answer === true;
  } catch (error) {
    why = errorMessage(error);
  }
  if (!saved) {
    throw new SeekError(
      'slots/refused',
      `the backup ${backup.fileName} was not saved${why === null ? '' : ` (${why})`}, so nothing was ` +
        'written. A write never runs without its backup saved first; try again once it can be saved.',
      { detail: { backup: backup.fileName } },
    );
  }
}

/**
 * The log lines for the banks of a backup that is not a plain copy of an image: a bank that is empty, one
 * that could not be read, one with no decrypted file. The front end says where the zip went.
 */
export function backupLogLines(backup: WriteBackup): string[] {
  const lines: string[] = [];
  for (const bank of backup.banks) {
    if (bank.content === 'empty') {
      lines.push(`${bank.name} is empty: the zip says so and holds its 64 KiB as read`);
    } else if (bank.content === 'unread') {
      lines.push(
        `${bank.name} could not be read for the backup (${bank.notes.join('; ')}): the zip says so, and the write goes on`,
      );
    } else if (bank.content === 'stored') {
      lines.push(
        `${bank.name}: the zip holds it as stored; no key opened it, so no decrypted file`,
      );
    }
  }
  return lines;
}

/**
 * Reads each bank, builds the zip and saves it: the step every write takes before it sends anything. The
 * reads are in the order given. Throws the refusal when the save did not happen (nothing sent).
 */
export async function backUpBanks(
  ctx: WorkflowContext,
  report: SlotsReport,
  args: {
    readonly keys: readonly SlotKey[];
    readonly action: WriteAction;
    readonly follows: string;
    readonly save: SaveBackup;
    readonly now?: () => Date;
  },
): Promise<WriteBackup> {
  const reads: BankRead[] = [];
  for (const key of args.keys) reads.push(await readBankForBackup(ctx, report, key));
  const backup = buildWriteBackup({
    report,
    reads,
    action: args.action,
    follows: args.follows,
    at: (args.now ?? (() => new Date()))(),
  });
  await saveBackupFirst(backup, args.save);
  for (const line of backupLogLines(backup)) ctx.reporter.log(line, 'ok');
  return backup;
}
