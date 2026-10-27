/**
 * The run file: a store-only ZIP holding `preserve_run.json` plus every
 * checkpoint the run has produced so far. Built after EVERY completed step and
 * again on demand; the only memory a run has — the app keeps no browser
 * storage, so "resume" means "read this file back in".
 *
 * The layout follows the page: the run state and a generated README at the
 * top, then one folder per wizard step (`02-read-build/`, `03-patch-dump/`,
 * `04-restore-verify/`) holding what that step produced. The reader finds
 * checkpoints by file name in their folders, and refuses a run file whose
 * state is not schema version 3.
 *
 * Building is core's `buildZip` (the same writer the dump archives use). The
 * reader side is here, and it is deliberately small: core ships only the
 * writer, and the files it writes are store-only (method 0), UTF-8-named,
 * CRC-checked and descriptor-free — exactly the narrow slice this reader
 * parses, with every entry verified against its CRC-32 before it is trusted.
 */

import {
  BANK_KEYS,
  bankChoiceWords,
  bankListWords,
  bankWordsOf,
  crc32,
  isPreserveBankChoice,
  readZipEntries,
  utf8,
} from '@seek-fw/core';
import {
  CHECKPOINT_FILES,
  CHECKPOINT_STEP,
  PHASE_FOLDER,
  PRESERVE_BACKUP_FILE,
  PRESERVE_DUMP_ORIGINAL_FILE,
  PRESERVE_DUMP_PATCHED_FILE,
  PRESERVE_VERIFY_FILE,
  RUN_STATE_FILE,
  isCheckpointName,
  phaseOfStep,
  preserveCaptureFile,
  preservePatchedFile,
  preservePlainFile,
  runFileName,
  type CheckpointName,
  type PreserveRunState,
} from './types';

/** The generated guide at the top of the run file. Rebuilt on every save. */
export const RUN_README_FILE = 'README.md';

/** Where a checkpoint lives in the run file: its step's folder. */
export function checkpointPath(name: CheckpointName): string {
  const step = CHECKPOINT_STEP[name];
  if (step === undefined) throw new Error(`${name} is not a checkpoint of a preserve run`);
  return `${PHASE_FOLDER[phaseOfStep(step)]}/${name}`;
}

const FOLDERS: readonly string[] = Object.values(PHASE_FOLDER);

function inStepFolder(name: string): boolean {
  return FOLDERS.some((folder) => name.startsWith(`${folder}/`));
}

function baseName(name: string): string {
  return name.slice(name.lastIndexOf('/') + 1);
}

/** What each checkpoint is, in words, for the README. */
const CHECKPOINT_WHAT: Readonly<Record<CheckpointName, string>> = {
  [PRESERVE_BACKUP_FILE]:
    'the 31 blocks a stock camera serves, read before anything was written, at their flash ' +
    'addresses (0xFF where a block cannot be read this way)',
  ...Object.fromEntries(
    BANK_KEYS.flatMap((bank) => [
      [preserveCaptureFile(bank), `${bankWordsOf(bank)} as stored, read twice (both reads agreed)`],
      [preservePlainFile(bank), `the firmware image in ${bankWordsOf(bank)}, decrypted`],
      [
        preservePatchedFile(bank),
        `the image in ${bankWordsOf(bank)} with the temporary read patch applied`,
      ],
    ]),
  ),
  [PRESERVE_DUMP_PATCHED_FILE]:
    'the whole 4 MiB as read, with the patch still in the written firmware banks',
  [PRESERVE_DUMP_ORIGINAL_FILE]:
    "THE COMPLETE IMAGE: the whole 4 MiB with the original firmware banks put back — the camera's original flash",
  [PRESERVE_VERIFY_FILE]:
    'the 31 blocks read again after the restore, laid out like the backup — it should equal it',
};

/** The README at the top of the run file: what is where, and the shas. */
export function runReadme(
  state: PreserveRunState,
  checkpoints: ReadonlyMap<CheckpointName, Uint8Array>,
  extra: ReadonlyMap<string, Uint8Array>,
  savedAt: Date,
): string {
  const lines: string[] = [
    `${RUN_README_TITLE}${state.runId}`,
    '',
    `Saved ${savedAt.toISOString()}; next step: ${state.nextStep}.` +
      (state.expectedVersion === undefined ? '' : ` Firmware ${state.expectedVersion}.`),
    '',
  ];
  if (checkpoints.has(PRESERVE_DUMP_ORIGINAL_FILE)) {
    lines.push(
      `**The complete flash image:** \`${checkpointPath(PRESERVE_DUMP_ORIGINAL_FILE)}\`` +
        (state.deliveredSha256 === undefined ? '' : ` (sha256 ${state.deliveredSha256})`),
      '',
    );
  }
  if (state.targets !== undefined) {
    lines.push(
      `Banks written: ${bankListWords(state.targets)} (the choice: ${bankChoiceWords(state.choice)}).`,
      '',
    );
  }
  lines.push('One folder per step of the Preserve page:', '');
  for (const [phase, folder] of Object.entries(PHASE_FOLDER)) {
    const names = CHECKPOINT_FILES.filter((name) => {
      const step = CHECKPOINT_STEP[name];
      return checkpoints.has(name) && step !== undefined && phaseOfStep(step) === phase;
    });
    const others = [...extra.keys()].filter((name) => name.startsWith(`${folder}/`));
    if (names.length === 0 && others.length === 0) continue;
    lines.push(`- \`${folder}/\``);
    for (const name of names) {
      lines.push(`  - \`${name}\` — ${CHECKPOINT_WHAT[name] ?? 'a checkpoint of the run'}`);
    }
    if (others.length > 0) {
      lines.push(
        `  - ${String(others.length)} more file(s): the backup decrypted, as the Dump & decrypt ` +
          'page would (`decrypted/`, `manifest.json`, `README.md`)',
      );
    }
  }
  lines.push(
    '',
    `\`${RUN_STATE_FILE}\` is the run's record: load this zip on the Preserve page to ` +
      'continue the run, or to look at it again.',
    '',
  );
  return lines.join('\n');
}

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
const EOCD_SIZE = 22;
const CENTRAL_HEADER_SIZE = 46;
const LOCAL_HEADER_SIZE = 30;
const METHOD_STORE = 0;

export interface PreserveRunFile {
  readonly state: PreserveRunState;
  /** The checkpoints the run has produced, bytes as written. */
  readonly checkpoints: ReadonlyMap<CheckpointName, Uint8Array>;
  /**
   * Entries this version of the wizard does not know, kept verbatim so
   * saving the run again never drops another writer's files.
   */
  readonly extra: ReadonlyMap<string, Uint8Array>;
}

export interface RunFileEntry {
  readonly name: string;
  readonly data: Uint8Array;
}

/** Packs the run state and its checkpoints into the run ZIP's bytes: the
 *  state and the README at the top, everything else in its step's folder. */
export function buildRunFile(
  state: PreserveRunState,
  checkpoints: ReadonlyMap<CheckpointName, Uint8Array>,
  extra: ReadonlyMap<string, Uint8Array> = new Map(),
  savedAt: Date = new Date(),
): Uint8Array {
  const json = utf8(`${JSON.stringify(state, null, 2)}\n`);
  const entries: RunFileEntry[] = [
    { name: RUN_STATE_FILE, data: json },
    { name: RUN_README_FILE, data: utf8(runReadme(state, checkpoints, extra, savedAt)) },
  ];
  for (const name of CHECKPOINT_FILES) {
    const data = checkpoints.get(name);
    if (data !== undefined) entries.push({ name: checkpointPath(name), data });
  }
  for (const [name, data] of extra) {
    if (name !== RUN_STATE_FILE && name !== RUN_README_FILE) entries.push({ name, data });
  }
  return buildStoreZip(entries);
}

/** Minimal store-only ZIP writer over core's `crc32` — `buildZip`'s layout. */
function buildStoreZip(entries: readonly RunFileEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const now = new Date();
  const time = dosTime(now);
  const date = dosDate(now);

  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;
    const local = new Uint8Array(LOCAL_HEADER_SIZE + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, LOCAL_SIGNATURE, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true); /* UTF-8 names */
    lv.setUint16(8, METHOD_STORE, true);
    lv.setUint16(10, time, true);
    lv.setUint16(12, date, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true);
    local.set(nameBytes, LOCAL_HEADER_SIZE);
    parts.push(local, entry.data);

    const dir = new Uint8Array(CENTRAL_HEADER_SIZE + nameBytes.length);
    const dv = new DataView(dir.buffer);
    dv.setUint32(0, CENTRAL_SIGNATURE, true);
    dv.setUint16(4, 20, true);
    dv.setUint16(6, 20, true);
    dv.setUint16(8, 0x0800, true);
    dv.setUint16(10, METHOD_STORE, true);
    dv.setUint16(12, time, true);
    dv.setUint16(14, date, true);
    dv.setUint32(16, crc, true);
    dv.setUint32(20, size, true);
    dv.setUint32(24, size, true);
    dv.setUint16(28, nameBytes.length, true);
    dv.setUint32(42, offset, true);
    dir.set(nameBytes, CENTRAL_HEADER_SIZE);
    central.push(dir);
    offset += local.length + size;
  }

  const centralDirectorySize = central.reduce((sum, part) => sum + part.length, 0);
  const eocd = new Uint8Array(EOCD_SIZE);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, EOCD_SIGNATURE, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralDirectorySize, true);
  ev.setUint32(16, offset, true);

  const out = new Uint8Array(offset + centralDirectorySize + EOCD_SIZE);
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  for (const part of central) {
    out.set(part, at);
    at += part.length;
  }
  out.set(eocd, at);
  return out;
}

function dosTime(date: Date): number {
  return (
    ((date.getHours() & 31) << 11) |
    ((date.getMinutes() & 63) << 5) |
    ((date.getSeconds() >> 1) & 31)
  );
}

function dosDate(date: Date): number {
  return (
    (((date.getFullYear() - 1980) & 127) << 9) |
    (((date.getMonth() + 1) & 15) << 5) |
    date.getDate()
  );
}

/**
 * Parses a run ZIP: the state file must be present and must be schema version
 * 3 (the run reads every bank and writes the banks it chose). An older run
 * file is refused with the remedy. Known checkpoints come back by name,
 * unknown files ride along in `extra` so a later save keeps them.
 */
export function parseRunFile(zip: Uint8Array): PreserveRunFile {
  const entries = readZipEntries(zip);
  const stateEntry = entries.find((entry) => entry.name === RUN_STATE_FILE);
  if (stateEntry === undefined) {
    throw new Error(
      `this archive holds no ${RUN_STATE_FILE} — it is not a preserve run file ` +
        `(found: ${entries.map((entry) => entry.name).join(', ') || 'nothing'})`,
    );
  }
  let raw: unknown;
  try {
    raw = JSON.parse(new TextDecoder('utf-8').decode(stateEntry.data));
  } catch (error) {
    throw new Error(
      `${RUN_STATE_FILE} does not parse as JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error },
    );
  }
  /* The version is checked on the untyped parse, because the typed shape
   * cannot hold a foreign version — that is exactly what it must refuse. */
  const loose = raw as { version?: unknown; choice?: unknown };
  if (loose.version === 1 || loose.version === 2) {
    throw new Error(
      `${RUN_STATE_FILE} is a run of schema version ${String(loose.version)}, saved before the ` +
        'run chose its firmware banks (version 3); this page reads version 3 only. Its backup ' +
        'is still a backup of that camera; start a new run to continue.',
    );
  }
  if (loose.version !== 3) {
    throw new Error(
      `${RUN_STATE_FILE} says version ${String(loose.version)}; this page reads version 3. ` +
        'Update the app (or re-run the run) to a matching version.',
    );
  }
  if (typeof loose.choice !== 'string' || !isPreserveBankChoice(loose.choice)) {
    throw new Error(`${RUN_STATE_FILE} names no choice of banks — not a usable run state`);
  }
  const state = raw as PreserveRunState;
  if (typeof state.runId !== 'string' || state.runId === '') {
    throw new Error(`${RUN_STATE_FILE} has no runId — not a usable run state`);
  }

  const checkpoints = new Map<CheckpointName, Uint8Array>();
  const extra = new Map<string, Uint8Array>();
  for (const entry of entries) {
    if (entry.name === RUN_STATE_FILE) continue;
    /* The generated README is rebuilt on every save. */
    if (entry.name === RUN_README_FILE && isRunReadme(entry.data)) continue;
    const base = baseName(entry.name);
    if (inStepFolder(entry.name) && isCheckpointName(base)) {
      checkpoints.set(base, entry.data);
    } else {
      extra.set(entry.name, entry.data);
    }
  }
  return { state, checkpoints, extra };
}

const RUN_README_TITLE = '# Seek Thermal preserve run ';

function isRunReadme(data: Uint8Array): boolean {
  return new TextDecoder('utf-8').decode(data.subarray(0, 64)).startsWith(RUN_README_TITLE);
}

/** The name the wizard downloads: re-exported so callers share one rule. */
export { runFileName };
