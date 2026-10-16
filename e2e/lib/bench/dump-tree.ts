/* ==================================================================== *
 * The bench's list of dumps, read from the per-camera dump tree.
 *
 * The tree (SEEK_FULL_DUMPS_BY_CAMERA, see its README) is laid out as
 *   <root>/<Camera>/INDEX.json
 *   <root>/<Camera>/<Family>/<folder>/{full_dump_*.bin, manifest_camera.json}
 * and INDEX.json has one row per firmware version and variant. This module
 * turns those rows into the subjects the bench runs, in the order it runs them:
 * the camera's own original LAST, so the bench ends on its original firmware.
 *
 * WHAT A SUBJECT IS.
 *   - Its file: the launchable copy when the row has one, else the primary.
 *   - Whether it launches: for a primary, the row's `launches`; for a launchable
 *     copy, the copy's own bench record in its manifest. A launchable copy exists
 *     only where the primary does not launch, so the row's `launches` is false
 *     for every row that has one: it describes the primary, not the copy.
 *   - Only subjects that launch are returned. Each returned file is checked
 *     before it is returned: present, exactly 4 MiB, sha256 equal to the index's.
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { parseVersion } from '@seek-fw/core';

import { BENCH_FLASH_BYTES, type BenchSubject, type BenchSubjectQuery } from './types.js';

/** The camera the bench runs when the query names none (the bench camera, board 297). */
const DEFAULT_CAMERA = 'Compact';

/** The tree's own declaration of the camera's original, in INDEX.json's `board` text. */
const OWN_ORIGINAL = /its own flash is the (\d+(?:\.\d+)+)(-FF)? original/;

/** The Seek vendor id, lower case, as the tree's manifests record it. */
const SEEK_VID = '0x289d';

/** The first build the slots page supports (`classifyBuild`'s FIRST_SUPPORTED_VERSION). */
const FIRST_SLOTS_MAJOR = 0;
const FIRST_SLOTS_MINOR = 8;

type Json = Record<string, unknown>;

/** One INDEX.json row, with the fields the bench reads. */
interface IndexRow {
  readonly family: string;
  readonly folder: string;
  readonly version: string;
  readonly variant: string;
  readonly primaryFile: string;
  readonly primarySha256: string;
  readonly primaryStatus: string;
  readonly launches: boolean;
  readonly launchableFile: string | null;
  readonly launchableSha256: string | null;
  readonly manifest: string;
}

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringField(record: Json, key: string, where: string): string {
  const value = record[key];
  if (typeof value !== 'string') throw new Error(`${where}: "${key}" is not a string`);
  return value;
}

function sha256Field(record: Json, key: string, where: string): string {
  const value = stringField(record, key, where).toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(value)) throw new Error(`${where}: "${key}" is not a sha256`);
  return value;
}

function parseRow(raw: unknown, camera: string, position: number): IndexRow {
  if (!isRecord(raw)) {
    throw new Error(`${camera} INDEX.json: row ${String(position)} is not an object`);
  }
  const family = stringField(raw, 'family', `${camera} INDEX.json row ${String(position)}`);
  const folder = stringField(raw, 'folder', `${camera} INDEX.json row ${family}`);
  const where = `${camera} INDEX.json ${family}/${folder}`;
  if (typeof raw.launches !== 'boolean') {
    throw new Error(`${where}: "launches" is not a boolean`);
  }
  const hasCopy = raw.launchable_present === true;
  return {
    family,
    folder,
    version: stringField(raw, 'version', where),
    variant: stringField(raw, 'variant', where),
    primaryFile: stringField(raw, 'primary_file', where),
    primarySha256: sha256Field(raw, 'primary_sha256', where),
    primaryStatus: stringField(raw, 'primary_status', where),
    launches: raw.launches,
    launchableFile: hasCopy ? stringField(raw, 'launchable_file', where) : null,
    launchableSha256: hasCopy ? sha256Field(raw, 'launchable_sha256', where) : null,
    manifest: stringField(raw, 'manifest', where),
  };
}

function readJson(file: string, where: string): unknown {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`${where}: cannot read ${file}: ${reason}`, { cause: error });
  }
}

/**
 * A launchable copy's own bench record, from its manifest: the camera enumerated
 * after a cold boot with the Seek vendor id and its family's product id (the test
 * the tree's README states for `launches`).
 */
function copyEnumerated(manifest: Json, where: string): boolean {
  const launchable = manifest.launchable;
  if (!isRecord(launchable)) throw new Error(`${where}: manifest has no launchable record`);
  const evidence = launchable.evidence;
  if (!isRecord(evidence)) throw new Error(`${where}: the launchable copy has no evidence`);
  const vid = typeof evidence.vid === 'string' ? evidence.vid.toLowerCase() : null;
  const pid = typeof evidence.pid === 'string' ? evidence.pid : null;
  return (
    evidence.identified === true &&
    vid === SEEK_VID &&
    pid !== null &&
    pid === evidence.expected_pid
  );
}

/** Numeric version order (4.9.1.15 before 10.9.1.31); a missing part counts as 0. */
function compareVersions(a: string, b: string): number {
  const left = a.split('.').map((part) => Number.parseInt(part, 10));
  const right = b.split('.').map((part) => Number.parseInt(part, 10));
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const x = left[i] ?? 0;
    const y = right[i] ?? 0;
    const lhs = Number.isNaN(x) ? -1 : x;
    const rhs = Number.isNaN(y) ? -1 : y;
    if (lhs !== rhs) return lhs - rhs;
  }
  return 0;
}

function compareText(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/** Firmware 0.8.0.0 and later: the builds the slots page plans on. */
function slotsSupportedFor(version: string): boolean {
  const parsed = parseVersion(version);
  if (parsed === null) return false;
  return (
    parsed.major > FIRST_SLOTS_MAJOR ||
    (parsed.major === FIRST_SLOTS_MAJOR && parsed.minor >= FIRST_SLOTS_MINOR)
  );
}

/** The camera's own original, as the tree's `board` text names it. */
function ownOriginalOf(board: string, camera: string): { version: string; ff: boolean } {
  const match = OWN_ORIGINAL.exec(board);
  const version = match?.[1];
  if (version === undefined) {
    throw new Error(
      `${camera} INDEX.json: its "board" text does not name the camera's own original ` +
        '("its own flash is the <version> original"), so the bench cannot end on it',
    );
  }
  return { version, ff: match?.[2] !== undefined };
}

function isOwnOriginal(row: IndexRow, own: { version: string; ff: boolean }): boolean {
  return (
    row.primaryStatus === 'original' &&
    row.version === own.version &&
    row.variant === (own.ff ? 'ff' : 'std')
  );
}

function matchesOnly(row: IndexRow, only: string | undefined): boolean {
  if (only === undefined || only === '') return true;
  return row.version.includes(only) || row.folder.includes(only);
}

/** The file exists, is exactly one dump, and hashes to what the index says. */
function verifyFile(file: string, sha256: string, where: string): void {
  if (!existsSync(file)) throw new Error(`${where}: file missing: ${file}`);
  const size = statSync(file).size;
  if (size !== BENCH_FLASH_BYTES) {
    throw new Error(
      `${where}: ${file} is ${String(size)} bytes, not ${String(BENCH_FLASH_BYTES)} (4 MiB)`,
    );
  }
  const actual = createHash('sha256').update(readFileSync(file)).digest('hex');
  if (actual !== sha256) {
    throw new Error(`${where}: ${file} sha256 is ${actual}, the index says ${sha256}`);
  }
}

/**
 * Every subject the bench runs on `query.camera`, in run order: the others by
 * family then version, the camera's own original last.
 *
 * Throws, naming the row, when a subject's file is missing, is not 4 MiB, or does
 * not hash to the index's sha256. Rows that do not launch are not subjects and
 * their files are not read.
 */
export function listBenchSubjects(query: BenchSubjectQuery): BenchSubject[] {
  const camera = query.camera ?? DEFAULT_CAMERA;
  const cameraDir = path.join(query.root, camera);
  const indexFile = path.join(cameraDir, 'INDEX.json');
  if (!existsSync(indexFile)) {
    throw new Error(`no INDEX.json for ${camera} under ${query.root} (expected ${indexFile})`);
  }
  const index = readJson(indexFile, `${camera} INDEX.json`);
  if (!isRecord(index)) throw new Error(`${camera} INDEX.json is not an object`);
  const board = stringField(index, 'board', `${camera} INDEX.json`);
  if (!Array.isArray(index.rows)) throw new Error(`${camera} INDEX.json has no "rows" array`);

  const own = ownOriginalOf(board, camera);
  const rows = index.rows.map((raw, position) => parseRow(raw, camera, position));
  const ownCount = rows.filter((row) => isOwnOriginal(row, own)).length;
  if (ownCount !== 1) {
    throw new Error(
      `${camera} INDEX.json: the camera's own original (${own.version}` +
        `${own.ff ? '-FF' : ''}) matches ${String(ownCount)} rows, not 1`,
    );
  }

  const subjects: { own: boolean; subject: BenchSubject }[] = [];
  for (const row of rows) {
    if (!matchesOnly(row, query.only)) continue;
    const where = `${camera} ${row.family}/${row.folder} (${row.version} ${row.variant})`;

    let fileKind: BenchSubject['fileKind'] = 'primary';
    let file = row.primaryFile;
    let sha256 = row.primarySha256;
    let launches = row.launches;
    if (row.launchableFile !== null && row.launchableSha256 !== null) {
      fileKind = 'launchable';
      file = row.launchableFile;
      sha256 = row.launchableSha256;
      const manifest = readJson(path.join(cameraDir, row.manifest), where);
      if (!isRecord(manifest)) throw new Error(`${where}: the manifest is not an object`);
      launches = copyEnumerated(manifest, where);
    }
    if (!launches) continue;

    const fullPath = path.join(cameraDir, row.family, row.folder, file);
    verifyFile(fullPath, sha256, where);
    subjects.push({
      own: isOwnOriginal(row, own),
      subject: {
        camera,
        family: row.family,
        folder: row.folder,
        version: row.version,
        variant: row.variant,
        file: fullPath,
        fileKind,
        sha256,
        launches: true,
        slotsSupported: slotsSupportedFor(row.version),
      },
    });
  }

  subjects.sort((a, b) => {
    if (a.own !== b.own) return a.own ? 1 : -1;
    return (
      compareText(a.subject.family, b.subject.family) ||
      compareVersions(a.subject.version, b.subject.version) ||
      compareText(a.subject.variant, b.subject.variant) ||
      compareText(a.subject.folder, b.subject.folder)
    );
  });
  return subjects.map((entry) => entry.subject);
}

/** SEEK_FULL_DUMPS_BY_CAMERA, resolved. There is no default: a bench run names its tree. */
export function benchRoot(env: NodeJS.ProcessEnv = process.env): string {
  const raw = env.SEEK_FULL_DUMPS_BY_CAMERA;
  if (raw === undefined || raw.trim() === '') {
    throw new Error(
      'SEEK_FULL_DUMPS_BY_CAMERA is not set: point it at the per-camera dump tree ' +
        '(the folder that holds Compact/INDEX.json)',
    );
  }
  return path.resolve(raw.trim());
}
