/**
 * The slots bench library's unit tests. They need NO hardware and NO environment:
 * the J-Link, the power switch and the CLI are fakes, and the dump tree is a
 * fixture built in a temp directory. The corpus tests at the end run only when
 * SEEK_FULL_DUMPS_BY_CAMERA names a real tree, and say so when they skip.
 *
 *   npx vitest run --config e2e/vitest.config.ts bench-lib.e2e
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  BENCH_FLASH_BASE,
  BENCH_FLASH_BYTES,
  DRY_RUN_READ,
  NO_GUI_ARGS,
  benchRoot,
  createBenchCamera,
  createJlinkBench,
  jlinkShimScript,
  lockedPowerSwitchChannel,
  listBenchSubjects,
  parseRunningInfo,
  patchBuildString,
  type BenchSubject,
  type Exec,
  type ExecResult,
  type JlinkBench,
  wordAt,
} from './lib/bench/index.js';
import { createFakeRig, fakeFfSubjects, fakeSubjects } from './lib/bench/spec-fakes.js';
import {
  PLAIN_FF_SHA256,
  describeDifference,
  isFF1308Subject,
  predictedFFStored,
} from './lib/bench/ff-form.js';
import { decryptedDumpNamePattern, rawDumpNamePattern } from './lib/slots-page.js';
import { KEY_PAIRS, locateFFKeys } from '../packages/core/src/preservation/patch.js';
import { ffBankVerdict, plainBankVerdict } from '../packages/core/src/slots/running.js';
import {
  FF_BANK_ADDRESS,
  FF_FILE_SLOTS,
  ORIGINAL_SHA256,
  PLATFORM_SHA256,
  chooseFfFile,
  chooseFfFiles,
  describeFfFiles,
  ffVendorFilesFromEnv,
  requireFfFiles,
  runFfVendor,
  type FfFileKey,
  type FfFileSlots,
  type FfVendorBench,
  type FfVendorFiles,
} from './lib/bench/ff-vendor-run.js';
import { predictedFFVendorPayload, vendorGateSum } from './lib/bench/ff-form.js';
import type { BenchCamera, SlotFlashRun } from './lib/bench/types.js';
import {
  ADJUST_OFFSET,
  ERASED_FOR_BOOT,
  applicationPairAt,
  fallbackSource,
  keyPairNamedBy,
  runProbe,
  runSubject,
  sameAsWritten,
  sameAsWrittenUpToKeyPair,
} from './lib/bench/spec-flow.js';
import { APPLICATION_KEY_PAIRS } from '../packages/core/src/slots/application-pairs.js';
import type { WriteApproval } from './lib/supervised-write.js';

const APPROVED: WriteApproval = { approved: true, dry: false, reason: 'test' };
const DRY: WriteApproval = { approved: false, dry: true, reason: 'dry run' };
const SN = 'TEST-JLINK-SN';
const CAMERA_SERIAL = 'TEST-CAMERA-SERIAL';
const TARGET = 'compact_8hz_1_3_0_8';
const NO_HASH = 'b'.repeat(64);
const BOARD = 'Compact on board 297 (PN297 32K Compact; its own flash is the 1.3.0.0 original)';

const CORPUS = process.env.SEEK_FULL_DUMPS_BY_CAMERA?.trim() ? benchRoot() : undefined;
if (CORPUS === undefined) {
  process.stderr.write(
    '[bench-lib.e2e] SKIPPED the corpus tests: SEEK_FULL_DUMPS_BY_CAMERA is not set\n',
  );
}

const scratch = mkdtempSync(path.join(tmpdir(), 'seek-bench-lib-test-'));
afterAll(() => {
  rmSync(scratch, { recursive: true, force: true });
});

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

/** Writes `content` at `file` (creating folders) and returns its sha256. */
function put(file: string, content: Uint8Array): string {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
  return sha256(content);
}

/** A 4 MiB dump, filled with one byte so that each one hashes differently. */
function dump(fill: number): Buffer {
  return Buffer.alloc(BENCH_FLASH_BYTES, fill);
}

/* ==================================================================== *
 * The dump tree
 * ==================================================================== */

interface RowSpec {
  readonly family: string;
  readonly folder: string;
  readonly version: string;
  readonly variant: string;
  readonly primaryStatus: 'original' | 'reconstructed';
  readonly launches: boolean;
  /** The primary file's content (written, and its real sha is indexed); else `sha256` is indexed as given. */
  readonly primary: { readonly fill: number } | { readonly sha256: string };
  /** The launchable copy, when the row has one; `enumerated` is the copy's own bench record. */
  readonly copy?: { readonly enumerated: boolean; readonly fill: number };
}

/** Writes a camera tree under `root/Compact` for `rows`: the files, the manifests, the INDEX. */
function writeTree(root: string, board: string, rows: readonly RowSpec[]): void {
  const cameraDir = path.join(root, 'Compact');
  const indexRows = rows.map((row) => {
    const folderDir = path.join(cameraDir, row.family, row.folder);
    const primaryFile =
      row.primaryStatus === 'original' ? 'full_dump_original.bin' : 'full_dump_reconstructed.bin';
    const primarySha =
      'fill' in row.primary
        ? put(path.join(folderDir, primaryFile), dump(row.primary.fill))
        : row.primary.sha256;
    const manifest = `${row.family}/${row.folder}/manifest_camera.json`;
    let copy: Record<string, unknown> = {
      launchable_present: false,
      launchable_file: null,
      launchable_sha256: null,
      launchable_variant: null,
    };
    if (row.copy !== undefined) {
      copy = {
        launchable_present: true,
        launchable_file: 'full_dump_launchable.bin',
        launchable_sha256: put(
          path.join(folderDir, 'full_dump_launchable.bin'),
          dump(row.copy.fill),
        ),
        launchable_variant: 'vtfix',
      };
      put(
        path.join(cameraDir, manifest),
        Buffer.from(
          JSON.stringify({
            launchable: {
              evidence: {
                vid: '0x289D',
                pid: row.copy.enumerated ? '0x0010' : null,
                expected_pid: '0x0010',
                identified: row.copy.enumerated,
              },
            },
          }),
        ),
      );
    }
    return {
      family: row.family,
      folder: row.folder,
      version: row.version,
      variant: row.variant,
      primary_file: primaryFile,
      primary_sha256: primarySha,
      primary_status: row.primaryStatus,
      launches: row.launches,
      manifest,
      ...copy,
    };
  });
  mkdirSync(cameraDir, { recursive: true });
  writeFileSync(
    path.join(cameraDir, 'INDEX.json'),
    JSON.stringify({ board, camera: 'Compact', rows: indexRows }),
  );
}

const OWN_FOLDER = '2014.10.21-14.58.29-1.3.0.0';
/** The camera's own original: it must run LAST. */
const OWN_ROW: RowSpec = {
  family: 'Compact',
  folder: OWN_FOLDER,
  version: '1.3.0.0',
  variant: 'std',
  primaryStatus: 'original',
  launches: true,
  primary: { fill: 7 },
};

/** The main fixture: every kind of row the bench must order, keep or refuse. */
const MAIN_ROOT = path.join(scratch, 'main-tree');
const MAIN_ROWS: RowSpec[] = [
  /* pre-0.8: launches, but the slots page does not support it */
  {
    family: 'Compact',
    folder: '2014.06.26-17.10.04-0.5.0.2',
    version: '0.5.0.2',
    variant: 'std',
    primaryStatus: 'reconstructed',
    launches: true,
    primary: { fill: 1 },
  },
  /* the primary does not launch, its launchable copy did (the copy's own record says so) */
  {
    family: 'Compact',
    folder: '2017.01.06-11.17.29-1.3.0.8-FF',
    version: '1.3.0.8',
    variant: 'ff',
    primaryStatus: 'reconstructed',
    launches: false,
    primary: { sha256: NO_HASH },
    copy: { enumerated: true, fill: 2 },
  },
  {
    family: 'Compact',
    folder: '2019.03.14-09.18.41-4.9.1.15',
    version: '4.9.1.15',
    variant: 'std',
    primaryStatus: 'reconstructed',
    launches: true,
    primary: { fill: 3 },
  },
  {
    family: 'Compact',
    folder: '2019.11.19-09.59.21-10.9.1.31',
    version: '10.9.1.31',
    variant: 'std',
    primaryStatus: 'reconstructed',
    launches: true,
    primary: { fill: 4 },
  },
  {
    family: 'Nano 200',
    folder: '2019.12.10-10.48.25-2.27.1.33',
    version: '2.27.1.33',
    variant: 'std',
    primaryStatus: 'reconstructed',
    launches: true,
    primary: { fill: 5 },
  },
  /* does not launch and has no copy: not a subject, and its missing file is never read */
  {
    family: 'Compact',
    folder: '2016.07.06-17.04.49-1.0.3.0',
    version: '1.0.3.0',
    variant: 'std',
    primaryStatus: 'reconstructed',
    launches: false,
    primary: { sha256: NO_HASH },
  },
  /* a launchable copy whose own record says it did not enumerate: not a subject */
  {
    family: 'Compact',
    folder: '2017.01.06-15.45.07-1.0.3.2',
    version: '1.0.3.2',
    variant: 'std',
    primaryStatus: 'reconstructed',
    launches: false,
    primary: { sha256: NO_HASH },
    copy: { enumerated: false, fill: 6 },
  },
  OWN_ROW,
];

const EXPECTED_ORDER = [
  '2014.06.26-17.10.04-0.5.0.2',
  '2017.01.06-11.17.29-1.3.0.8-FF',
  '2019.03.14-09.18.41-4.9.1.15',
  '2019.11.19-09.59.21-10.9.1.31',
  '2019.12.10-10.48.25-2.27.1.33',
  OWN_FOLDER,
];

let mainSubjects: BenchSubject[] = [];

beforeAll(() => {
  writeTree(MAIN_ROOT, BOARD, MAIN_ROWS);
  mainSubjects = listBenchSubjects({ root: MAIN_ROOT });
});

describe('listBenchSubjects: the fixture tree', () => {
  it('keeps the launching rows and the launchable copy that launched, in run order', () => {
    expect(mainSubjects.map((subject) => subject.folder)).toEqual(EXPECTED_ORDER);
  });

  it("ends on the camera's own original", () => {
    const last = mainSubjects.at(-1);
    expect(last?.version).toBe('1.3.0.0');
    expect(last?.fileKind).toBe('primary');
  });

  it('runs the launchable copy when the row has one, with the copy sha', () => {
    const copy = mainSubjects.find((subject) => subject.version === '1.3.0.8');
    expect(copy?.fileKind).toBe('launchable');
    expect(copy?.file.endsWith('full_dump_launchable.bin')).toBe(true);
    expect(copy?.sha256).toBe(sha256(dump(2)));
    expect(copy?.launches).toBe(true);
  });

  it('marks only 0.8.0.0 and later as supported by the slots page', () => {
    const supported = Object.fromEntries(
      mainSubjects.map((subject) => [subject.version, subject.slotsSupported]),
    );
    expect(supported).toEqual({
      '0.5.0.2': false,
      '1.3.0.8': true,
      '4.9.1.15': true,
      '10.9.1.31': true,
      '2.27.1.33': true,
      '1.3.0.0': true,
    });
  });

  it('sorts versions numerically within a family (4.9.1.15 before 10.9.1.31)', () => {
    const versions = mainSubjects
      .filter((subject) => subject.family === 'Compact')
      .map((subject) => subject.version);
    expect(versions.indexOf('4.9.1.15')).toBeLessThan(versions.indexOf('10.9.1.31'));
  });

  it('keeps only the rows the `only` text names', () => {
    const only = listBenchSubjects({ root: MAIN_ROOT, only: '4.9' });
    expect(only.map((subject) => subject.folder)).toEqual(['2019.03.14-09.18.41-4.9.1.15']);
  });

  it('keeps the rows any item of a comma-separated `only` names, in tree order', () => {
    const only = listBenchSubjects({ root: MAIN_ROOT, only: ' 4.9 , 1.3.0.0 ' });
    expect(only.map((subject) => subject.folder)).toEqual([
      '2019.03.14-09.18.41-4.9.1.15',
      '2014.10.21-14.58.29-1.3.0.0',
    ]);
  });

  it('refuses a tree whose board text does not name the own original', () => {
    const root = path.join(scratch, 'no-own-original');
    writeTree(root, 'Compact on board 297', [OWN_ROW]);
    expect(() => listBenchSubjects({ root })).toThrow(/own original/);
  });

  it('refuses a tree with no INDEX.json for the camera', () => {
    expect(() => listBenchSubjects({ root: path.join(scratch, 'nothing-here') })).toThrow(
      /INDEX\.json/,
    );
  });
});

describe('listBenchSubjects: a bad row throws, naming the row', () => {
  it('a sha256 that does not match the file (and is not read when `only` excludes it)', () => {
    const root = path.join(scratch, 'bad-sha');
    const folder = '2024.11.21-11.55.00-44.27.3.10';
    put(path.join(root, 'Compact', 'Nano 300', folder, 'full_dump_reconstructed.bin'), dump(8));
    writeTree(root, BOARD, [
      {
        family: 'Nano 300',
        folder,
        version: '44.27.3.10',
        variant: 'std',
        primaryStatus: 'reconstructed',
        launches: true,
        primary: { sha256: 'c'.repeat(64) },
      },
      OWN_ROW,
    ]);
    expect(() => listBenchSubjects({ root })).toThrow(/44\.27\.3\.10.*sha256/);
    expect(listBenchSubjects({ root, only: '1.3.0.0' }).map((s) => s.version)).toEqual(['1.3.0.0']);
  });

  it('a file that is not 4 MiB', () => {
    const root = path.join(scratch, 'short-file');
    const folder = '2014.06.26-17.10.04-0.5.0.2';
    const sha = put(
      path.join(root, 'Compact', 'Mosaic 320x240', folder, 'full_dump_reconstructed.bin'),
      Buffer.alloc(1000, 1),
    );
    writeTree(root, BOARD, [
      {
        family: 'Mosaic 320x240',
        folder,
        version: '0.5.0.2',
        variant: 'std',
        primaryStatus: 'reconstructed',
        launches: true,
        primary: { sha256: sha },
      },
      OWN_ROW,
    ]);
    expect(() => listBenchSubjects({ root })).toThrow(/1000 bytes, not 4194304/);
  });

  it('a file that is missing', () => {
    const root = path.join(scratch, 'missing-file');
    writeTree(root, BOARD, [
      {
        family: 'Nano 200',
        folder: '2019.12.10-10.48.25-2.27.1.33',
        version: '2.27.1.33',
        variant: 'std',
        primaryStatus: 'reconstructed',
        launches: true,
        primary: { sha256: 'd'.repeat(64) },
      },
      OWN_ROW,
    ]);
    expect(() => listBenchSubjects({ root })).toThrow(/file missing/);
  });
});

describe('benchRoot', () => {
  it('has no default: a bench run must name its tree', () => {
    expect(() => benchRoot({})).toThrow(/SEEK_FULL_DUMPS_BY_CAMERA is not set/);
    expect(() => benchRoot({ SEEK_FULL_DUMPS_BY_CAMERA: '  ' })).toThrow(/not set/);
  });

  it('is the resolved value of SEEK_FULL_DUMPS_BY_CAMERA', () => {
    expect(benchRoot({ SEEK_FULL_DUMPS_BY_CAMERA: 'relative/tree' })).toBe(
      path.resolve('relative/tree'),
    );
  });
});

/* ==================================================================== *
 * The J-Link bench, with a fake Exec
 * ==================================================================== */

interface Recorded {
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string | undefined;
  readonly env: Readonly<Record<string, string>>;
  /** The command file the session ran, read as it was when the session started. */
  readonly script: string | null;
}

/** A fake Exec: records every call, and answers with `respond`. */
function fakeExec(respond: (call: Recorded) => ExecResult): { exec: Exec; calls: Recorded[] } {
  const calls: Recorded[] = [];
  const exec: Exec = (command, args, options) => {
    const at = args.indexOf('-CommandFile');
    const commandFile = at === -1 ? undefined : args[at + 1];
    const call: Recorded = {
      command,
      args: [...args],
      cwd: options.cwd,
      env: { ...options.env },
      script: commandFile === undefined ? null : readFileSync(commandFile, 'utf8'),
    };
    calls.push(call);
    return Promise.resolve(respond(call));
  };
  return { exec, calls };
}

const OK: ExecResult = { code: 0, stdout: '', stderr: '' };

/** Writes the bytes a `savebin` line asks for, from the flash image. */
function saveBinFor(script: string | null, flash: Buffer): void {
  const match = /savebin "([^"]+)", 0x([0-9a-f]+), 0x([0-9a-f]+)/.exec(script ?? '');
  if (match === null) return;
  const length = Number.parseInt(match[3] ?? '0', 16);
  writeFileSync(match[1] ?? '', flash.subarray(0, length));
}

const FLASH = dump(0x5a);
const FLASH_SHA = sha256(FLASH);
const FW_V1 = path.join(scratch, 'fw-v1');
const TARGET_DIR = path.join(FW_V1, 'targets', TARGET);
const IMAGE = path.join(scratch, 'image.bin');
const TMP_ROOT = path.join(scratch, 'jlink-tmp');

beforeAll(() => {
  mkdirSync(TARGET_DIR, { recursive: true });
  mkdirSync(TMP_ROOT, { recursive: true });
  writeFileSync(IMAGE, FLASH);
});

interface BenchOverrides {
  readonly gate?: WriteApproval;
  readonly onHaltFailed?: () => void;
  readonly log?: (line: string) => void;
}

function bench(exec: Exec, overrides: BenchOverrides = {}): JlinkBench {
  return createJlinkBench({
    gate: overrides.gate ?? APPROVED,
    env: {},
    fwv1Dir: FW_V1,
    serial: SN,
    exec,
    tmpRoot: TMP_ROOT,
    log: overrides.log ?? (() => undefined),
    ...(overrides.onHaltFailed === undefined ? {} : { onHaltFailed: overrides.onHaltFailed }),
  });
}

describe('createJlinkBench: the gate and the required settings', () => {
  const { exec } = fakeExec(() => OK);

  it('refuses unless the gate approved, or is a dry run', () => {
    expect(() =>
      createJlinkBench({
        gate: { approved: false, dry: false, reason: 'no env' },
        env: {},
        fwv1Dir: FW_V1,
        serial: SN,
        exec,
      }),
    ).toThrow(/did not pass \(no env\)/);
  });

  it('requires SEEK_E2E_FWV1_DIR, then SEEK_E2E_JLINK_SN, with clear errors', () => {
    expect(() => createJlinkBench({ gate: APPROVED, env: {}, exec })).toThrow(
      /SEEK_E2E_FWV1_DIR is not set/,
    );
    expect(() => createJlinkBench({ gate: APPROVED, env: {}, fwv1Dir: FW_V1, exec })).toThrow(
      /SEEK_E2E_JLINK_SN is not set/,
    );
  });

  it('reads the required settings and the device default from the env it is given', async () => {
    const { exec: fake, calls } = fakeExec(() => OK);
    const env = { SEEK_E2E_FWV1_DIR: FW_V1, SEEK_E2E_JLINK_SN: SN };
    await createJlinkBench({ gate: APPROVED, env, exec: fake, tmpRoot: TMP_ROOT }).resetCpu();
    expect(calls[0]?.args).toContain(SN);
    expect(calls[0]?.args).toContain('LPC4330_M4');
  });

  it('refuses a FW-V1 checkout without the target directory', () => {
    expect(() =>
      createJlinkBench({
        gate: APPROVED,
        env: {},
        fwv1Dir: path.join(scratch, 'not-fw-v1'),
        serial: SN,
        exec,
      }),
    ).toThrow(new RegExp(TARGET));
  });
});

describe('flashFull: the runner, exact command lines', () => {
  it("runs the erase, then the flash, in the target directory, with the runner's settings", async () => {
    const { exec, calls } = fakeExec(() => OK);
    await bench(exec).flashFull(IMAGE);
    expect(calls).toHaveLength(2);
    const [erase, flash] = calls;
    expect(erase).toMatchObject({
      command: 'node',
      args: ['tools/jlink/jlink-runner.js', 'erase-spifi-range'],
      cwd: TARGET_DIR,
    });
    expect(erase?.env).toEqual({
      JLINK_SERIAL: SN,
      JLINK_DEVICE: 'LPC4330_M4',
      JLINK_IF: 'SWD',
      JLINK_SPEED: '4000',
      ERASE_ADDR: '0x14000000',
      ERASE_LEN: '0x400000',
      JLINKEXE: erase?.env.JLINKEXE,
    });
    expect(erase?.env.JLINKEXE ?? '').toMatch(/JLinkExe$/);
    expect(flash).toMatchObject({
      command: 'node',
      args: ['tools/jlink/jlink-runner.js', 'flash-factory-4m'],
      cwd: TARGET_DIR,
    });
    expect(flash?.env.FACTORY_IMAGE).toBe(path.resolve(IMAGE));
    expect(flash?.env.JLINKEXE).toBe(erase?.env.JLINKEXE);
  });

  it('runs the runner JLinkExe through a shim written for the flash, and removes it after', async () => {
    const seen: string[] = [];
    const { exec, calls } = fakeExec((call) => {
      const shim = call.env.JLINKEXE ?? '';
      seen.push(`${String(existsSync(shim))} ${readFileSync(shim, 'utf8')}`);
      return OK;
    });
    await bench(exec).flashFull(IMAGE);
    expect(seen).toEqual([`true ${jlinkShimScript()}`, `true ${jlinkShimScript()}`]);
    const shim = calls[0]?.env.JLINKEXE ?? '';
    expect(existsSync(shim)).toBe(false);
    expect(readdirSync(TMP_ROOT)).toEqual([]);
  });

  it('the shim runs JLinkExe with -NoGui 1 first, passes every argument and the exit code through', () => {
    const bin = path.join(scratch, 'shim-fake-bin');
    mkdirSync(bin, { recursive: true });
    writeFileSync(
      path.join(bin, 'JLinkExe'),
      '#!/bin/sh\nfor a in "$@"; do printf "arg:%s\\n" "$a"; done\nexit 7\n',
      { mode: 0o755 },
    );
    const shim = path.join(scratch, 'shim-under-test', 'JLinkExe');
    mkdirSync(path.dirname(shim), { recursive: true });
    writeFileSync(shim, jlinkShimScript(), { mode: 0o755 });
    const run = spawnSync(shim, ['-SelectEmuBySN', SN, '-CommandFile', '/tmp/a b.jlink'], {
      env: { PATH: `${bin}:/usr/bin:/bin` },
      encoding: 'utf8',
    });
    expect(run.status).toBe(7);
    expect(run.stdout.split('\n').filter((line) => line !== '')).toEqual([
      'arg:-NoGui',
      'arg:1',
      'arg:-SelectEmuBySN',
      `arg:${SN}`,
      'arg:-CommandFile',
      'arg:/tmp/a b.jlink',
    ]);
  });

  it('tolerates the erase error -5 the recipe names, and still runs the flash', async () => {
    const { exec, calls } = fakeExec((call) =>
      call.args.includes('erase-spifi-range')
        ? {
            code: 2,
            stdout:
              'ERROR: Erase returned with error code -5.\n****** Error: Failed to erase sectors.',
            stderr: '',
          }
        : OK,
    );
    await bench(exec).flashFull(IMAGE);
    expect(calls.map((call) => call.args[1])).toEqual(['erase-spifi-range', 'flash-factory-4m']);
  });

  it('refuses an erase failure it does not tolerate, and does not flash', async () => {
    const { exec, calls } = fakeExec(() => ({
      code: 1,
      stdout: '',
      stderr: 'Cannot connect to J-Link',
    }));
    await expect(bench(exec).flashFull(IMAGE)).rejects.toThrow(/erase-spifi-range failed/);
    expect(calls).toHaveLength(1);
  });

  it('refuses an image that is not the 4 MiB flash, before anything runs', async () => {
    const short = path.join(scratch, 'short.bin');
    writeFileSync(short, Buffer.alloc(1000));
    const { exec, calls } = fakeExec(() => OK);
    await expect(bench(exec).flashFull(short)).rejects.toThrow(/1000 bytes, not 4194304/);
    expect(calls).toHaveLength(0);
  });
});

describe('readFlash, verifyFull and resetCpu: one JLinkExe session each', () => {
  it('reads with exactly h, savebin, g, q, and leaves no scratch behind', async () => {
    const { exec, calls } = fakeExec((call) => {
      saveBinFor(call.script, FLASH);
      return { code: 0, stdout: 'Saved', stderr: '' };
    });
    const bytes = await bench(exec).readFlash(BENCH_FLASH_BASE, BENCH_FLASH_BYTES);
    expect(sha256(bytes)).toBe(FLASH_SHA);
    expect(calls).toHaveLength(1);
    const [call] = calls;
    expect(call?.command).toBe('JLinkExe');
    expect(call?.args.slice(0, -1)).toEqual([
      '-SelectEmuBySN',
      SN,
      '-device',
      'LPC4330_M4',
      '-if',
      'SWD',
      '-speed',
      '4000',
      '-autoconnect',
      '1',
      '-NoGui',
      '1',
      '-CommandFile',
    ]);
    expect(NO_GUI_ARGS).toEqual(['-NoGui', '1']);
    const out = /savebin "([^"]+)"/.exec(call?.script ?? '')?.[1] ?? '';
    expect(call?.script).toBe(`h\nsavebin "${out}", 0x14000000, 0x400000\ng\nq\n`);
    expect(readdirSync(TMP_ROOT)).toEqual([]);
  });

  it('after a failed halt, reports it, runs the hook, and retries once', async () => {
    const events: string[] = [];
    let sessions = 0;
    const { exec } = fakeExec((call) => {
      sessions += 1;
      events.push(`session ${String(sessions)}`);
      saveBinFor(call.script, FLASH);
      return sessions === 1
        ? { code: 0, stdout: 'WARNING: CPU could not be halted', stderr: '' }
        : { code: 0, stdout: 'Saved', stderr: '' };
    });
    const bytes = await bench(exec, {
      onHaltFailed: () => {
        events.push('hook');
      },
    }).readFlash(BENCH_FLASH_BASE, BENCH_FLASH_BYTES);
    expect(events).toEqual(['session 1', 'hook', 'session 2']);
    expect(sha256(bytes)).toBe(FLASH_SHA);
  });

  it('refuses when the halt fails twice, after one hook', async () => {
    let hooks = 0;
    const { exec, calls } = fakeExec((call) => {
      saveBinFor(call.script, FLASH);
      return { code: 0, stdout: '****** Error: CPU is not halted', stderr: '' };
    });
    await expect(
      bench(exec, {
        onHaltFailed: () => {
          hooks += 1;
        },
      }).readFlash(BENCH_FLASH_BASE, BENCH_FLASH_BYTES),
    ).rejects.toThrow(/could not be halted twice/);
    expect(hooks).toBe(1);
    expect(calls).toHaveLength(2);
  });

  it('verifyFull passes when the read-back matches the sha256', async () => {
    const { exec, calls } = fakeExec((call) => {
      saveBinFor(call.script, FLASH);
      return OK;
    });
    await bench(exec).verifyFull(FLASH_SHA);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.script).toMatch(/savebin "[^"]+", 0x14000000, 0x400000/);
  });

  it('verifyFull names both hashes when the flash does not hold the dump', async () => {
    const { exec } = fakeExec((call) => {
      saveBinFor(call.script, FLASH);
      return OK;
    });
    const wanted = 'f'.repeat(64);
    await expect(bench(exec).verifyFull(wanted)).rejects.toThrow(
      new RegExp(`${FLASH_SHA}.*${wanted}`),
    );
  });

  it('verifyFull refuses a value that is not a sha256', async () => {
    const { exec } = fakeExec(() => OK);
    await expect(bench(exec).verifyFull('not-a-hash')).rejects.toThrow(/not a sha256/);
  });

  it('resetCpu runs r, g, q in one session', async () => {
    const { exec, calls } = fakeExec(() => OK);
    await bench(exec).resetCpu();
    expect(calls).toHaveLength(1);
    expect(calls[0]?.script).toBe('r\ng\nq\n');
    expect(calls[0]?.args).toContain('-CommandFile');
    expect(calls[0]?.args).toEqual(expect.arrayContaining([...NO_GUI_ARGS]));
  });

  it('resetCpu fails on a non-zero exit', async () => {
    const { exec } = fakeExec(() => ({ code: 1, stdout: '', stderr: 'no probe' }));
    await expect(bench(exec).resetCpu()).rejects.toThrow(/reset failed/);
  });
});

describe('readFlash: a refused window goes to the SPIFI memory-mode re-init, then a reset', () => {
  /* The firmware-left command mode on the 4.8.1.7 and 4.16.1.7 PRO FF builds: the halted
   * window answers "Could not read memory" while SPIFI STAT MCINIT is clear (bench run 2). */
  const REFUSED: ExecResult = {
    code: 0,
    stdout: 'Reading 4096 bytes from addr 0x14000000 into file...Could not read memory.',
    stderr: '',
  };
  const state = (stat: string, mcmd: string): ExecResult => ({
    code: 0,
    stdout: `4000301C = ${stat} \n40003018 = ${mcmd} \n`,
    stderr: '',
  });

  it('wordAt reads the word a mem32 line printed, by address', () => {
    expect(wordAt('4000301C = 02000025 \n40003018 = EB930000 ', 0x4000301c)).toBe(0x02000025);
    expect(wordAt('40003018 = EB930000 ', 0x40003018)).toBe(0xeb930000);
    expect(wordAt('Could not read memory.', 0x4000301c)).toBeUndefined();
  });

  it('command mode (MCINIT clear): writes MCMD with the value it holds, then reads halted', async () => {
    const { exec, calls } = fakeExec((call) => {
      const script = call.script ?? '';
      if (script.includes('mem32 0x4000301c,1')) return state('02000020', 'EB930000');
      if (script.includes('w4 0x40003018,0xeb930000')) {
        saveBinFor(call.script, FLASH);
        return OK;
      }
      return REFUSED;
    });
    const bytes = await bench(exec).readFlash(BENCH_FLASH_BASE, BENCH_FLASH_BYTES);
    expect(sha256(bytes)).toBe(FLASH_SHA);
    expect(calls.map((call) => (call.script ?? '').split('\n')[0])).toEqual(['h', 'h', 'h']);
    expect(calls[1]?.script).toBe('h\nmem32 0x4000301c,1\nmem32 0x40003018,1\ng\nq\n');
    expect(calls[2]?.script).toMatch(/^h\nw4 0x40003018,0xeb930000\nsavebin "[^"]+", 0x14000000/);
    expect(readdirSync(TMP_ROOT)).toEqual([]);
  });

  it('MCINIT set: no re-init is written, a reset then a halted read answers', async () => {
    const { exec, calls } = fakeExec((call) => {
      const script = call.script ?? '';
      if (script.includes('mem32 0x4000301c,1')) return state('02000025', 'EB930000');
      if (script.startsWith('r\nh\nsavebin')) {
        saveBinFor(call.script, FLASH);
        return OK;
      }
      return REFUSED;
    });
    const bytes = await bench(exec).readFlash(BENCH_FLASH_BASE, BENCH_FLASH_BYTES);
    expect(sha256(bytes)).toBe(FLASH_SHA);
    expect(calls).toHaveLength(3);
    expect(calls.some((call) => (call.script ?? '').includes('w4 '))).toBe(false);
    expect(calls[2]?.script).toMatch(/^r\nh\nsavebin "[^"]+", 0x14000000, 0x400000\ng\nq\n$/);
  });

  it('when every road is refused, names the reset among the roads tried', async () => {
    const { exec, calls } = fakeExec((call) => {
      const script = call.script ?? '';
      if (script.includes('mem32 0x4000301c,1')) return state('02000020', 'EB930000');
      return REFUSED;
    });
    await expect(bench(exec).readFlash(BENCH_FLASH_BASE, BENCH_FLASH_BYTES)).rejects.toThrow(
      /did not answer a halted read, after the SPIFI memory-mode re-init and a reset/,
    );
    expect(calls).toHaveLength(4);
  });
});

describe('writeBank: one 2014-chain bank, by loadbin and verifybin, then a halted read-back', () => {
  const BANK_R = 0x14070000;
  const BANK_FILE = path.join(scratch, 'bank-r.bin');
  const BANK_BYTES_FILLED = Buffer.alloc(0x10000, 0x3c);
  beforeAll(() => {
    writeFileSync(BANK_FILE, BANK_BYTES_FILLED);
  });

  it('loads the file into R in one session, then reads the bank back halted and requires the same bytes', async () => {
    let sessions = 0;
    const { exec, calls } = fakeExec((call) => {
      sessions += 1;
      if (sessions === 1) return { code: 0, stdout: 'Verify successful.', stderr: '' };
      saveBinFor(call.script, BANK_BYTES_FILLED);
      return OK;
    });
    await bench(exec).writeBank(BANK_R, BANK_FILE);
    expect(calls).toHaveLength(2);
    expect(calls[0]?.script).toBe(
      `loadbin "${BANK_FILE}", 0x14070000\nverifybin "${BANK_FILE}", 0x14070000\nq\n`,
    );
    const out = /savebin "([^"]+)"/.exec(calls[1]?.script ?? '')?.[1] ?? '';
    expect(calls[1]?.script).toBe(`h\nsavebin "${out}", 0x14070000, 0x10000\ng\nq\n`);
    expect(calls.some((call) => (call.script ?? '').includes('dump-spifi'))).toBe(false);
  });

  it('refuses an address that is not a 2014 bank (bootloader, boot config, modern slots), before any session', async () => {
    const { exec, calls } = fakeExec(() => OK);
    for (const address of [0x14000000, 0x14010000, 0x14030000, 0x14080000]) {
      await expect(bench(exec).writeBank(address, BANK_FILE)).rejects.toThrow(
        /only the 2014-chain banks/,
      );
    }
    expect(calls).toHaveLength(0);
  });

  it('refuses a file that is not one 64 KiB bank, before any session', async () => {
    const { exec, calls } = fakeExec(() => OK);
    const small = path.join(scratch, 'bank-small.bin');
    writeFileSync(small, Buffer.alloc(0x8000, 0x3c));
    await expect(bench(exec).writeBank(BANK_R, small)).rejects.toThrow(/not one 64 KiB bank/);
    expect(calls).toHaveLength(0);
  });

  it('a verify that does not pass is an error, and the read-back is not reached', async () => {
    const { exec, calls } = fakeExec(() => ({ code: 0, stdout: 'Verify failed', stderr: '' }));
    await expect(bench(exec).writeBank(BANK_R, BANK_FILE)).rejects.toThrow(/did not verify/);
    expect(calls).toHaveLength(1);
  });

  it('a read-back that holds other bytes is refused, naming both hashes', async () => {
    let sessions = 0;
    const { exec } = fakeExec((call) => {
      sessions += 1;
      if (sessions === 1) return { code: 0, stdout: 'Verify successful.', stderr: '' };
      saveBinFor(call.script, Buffer.alloc(0x10000, 0x11));
      return OK;
    });
    await expect(bench(exec).writeBank(BANK_R, BANK_FILE)).rejects.toThrow(
      /does not hold the file: read-back sha256/,
    );
  });

  it('a dry run logs the load and the read-back, and runs nothing', async () => {
    const lines: string[] = [];
    const { exec, calls } = fakeExec(() => OK);
    await bench(exec, {
      gate: DRY,
      log: (line) => {
        lines.push(line);
      },
    }).writeBank(BANK_R, BANK_FILE);
    expect(calls).toHaveLength(0);
    expect(lines.join('\n')).toMatch(/\[dry-run\].*loadbin/);
  });
});

describe('the dry run', () => {
  it('logs what each mutating call would run, runs nothing, and rejects the reads', async () => {
    const lines: string[] = [];
    const { exec, calls } = fakeExec(() => OK);
    const dry = bench(exec, {
      gate: DRY,
      log: (line) => {
        lines.push(line);
      },
    });
    await dry.flashFull(IMAGE);
    await dry.resetCpu();
    expect(calls).toHaveLength(0);
    const text = lines.join('\n');
    expect(text).toMatch(/\[dry-run\].*erase-spifi-range/);
    expect(text).toMatch(/\[dry-run\].*flash-factory-4m/);
    expect(text).toMatch(/\[dry-run\].*reset/);
    await expect(dry.readFlash(BENCH_FLASH_BASE, BENCH_FLASH_BYTES)).rejects.toThrow(DRY_RUN_READ);
    await expect(dry.verifyFull(FLASH_SHA)).rejects.toThrow(DRY_RUN_READ);
    expect(calls).toHaveLength(0);
  });

  it('treats a gate that is both approved and dry as a dry run', async () => {
    const { exec, calls } = fakeExec(() => OK);
    await bench(exec, { gate: { approved: true, dry: true, reason: 'both' } }).resetCpu();
    expect(calls).toHaveLength(0);
  });
});

describe('the bench never runs dump-spifi-4m', () => {
  it('no command line or command file that any flow builds names it', async () => {
    const { exec, calls } = fakeExec((call) => {
      saveBinFor(call.script, FLASH);
      return OK;
    });
    const b = bench(exec);
    await b.flashFull(IMAGE);
    await b.readFlash(BENCH_FLASH_BASE, BENCH_FLASH_BYTES);
    await b.verifyFull(FLASH_SHA);
    await b.resetCpu();
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      expect(call.args.join(' ')).not.toMatch(/dump-spifi/);
      expect(call.script ?? '').not.toMatch(/dump-spifi/);
    }
  });
});

/* ==================================================================== *
 * The camera side, with fakes for the switch, the bus and the CLI
 * ==================================================================== */

describe('the power switch is channel 2 only', () => {
  it('reads the locked channel from the env, and only accepts 2', () => {
    expect(() => lockedPowerSwitchChannel({})).toThrow(/channel 2 only/);
    expect(() => lockedPowerSwitchChannel({ SEEK_E2E_SWITCH_CHANNEL: '1' })).toThrow(
      /channel 2 only/,
    );
    expect(() => lockedPowerSwitchChannel({ SEEK_E2E_SWITCH_CHANNEL: '' })).toThrow(
      /channel 2 only/,
    );
    expect(lockedPowerSwitchChannel({ SEEK_E2E_SWITCH_CHANNEL: '2' })).toBe(2);
  });

  it('refuses to cut power when the channel is not 2, before the switch is touched', async () => {
    const channels: number[] = [];
    const camera = createBenchCamera({
      gate: APPROVED,
      env: { SEEK_E2E_SWITCH_CHANNEL: '1' },
      switchFor: (channel) => {
        channels.push(channel);
        return { cycle: () => Promise.resolve() };
      },
    });
    await expect(camera.powerCycle()).rejects.toThrow(/channel 2 only/);
    expect(channels).toEqual([]);
  });

  it('cycles channel 2 with the requested off time', async () => {
    const cycles: { channel: number; ms: number }[] = [];
    const camera = createBenchCamera({
      gate: APPROVED,
      env: { SEEK_E2E_SWITCH_CHANNEL: '2' },
      countCameras: () => 1,
      sleep: () => Promise.resolve(),
      switchFor: (channel) => ({
        cycle: (ms = 3000) => {
          cycles.push({ channel, ms });
          return Promise.resolve();
        },
      }),
    });
    await camera.powerCycle();
    await camera.powerCycle(1500);
    expect(cycles).toEqual([
      { channel: 2, ms: 3000 },
      { channel: 2, ms: 1500 },
    ]);
  });

  it('after the cycle, waits for the camera on the bus and then settles for SWD', async () => {
    let clock = 0;
    const waits: number[] = [];
    let polls = 0;
    const camera = createBenchCamera({
      gate: APPROVED,
      env: { SEEK_E2E_SWITCH_CHANNEL: '2' },
      /* The camera is absent for two polls after the cycle, then enumerates. */
      countCameras: () => {
        polls += 1;
        return polls >= 3 ? 1 : 0;
      },
      now: () => clock,
      sleep: (ms) => {
        waits.push(ms);
        clock += ms;
        return Promise.resolve();
      },
      switchFor: () => ({ cycle: () => Promise.resolve() }),
    });
    await camera.powerCycle();
    expect(polls).toBe(3);
    expect(waits.at(-1)).toBe(5000);
    expect(waits.slice(0, -1).every((ms) => ms <= 500)).toBe(true);
  });

  it('throws when the camera never comes back on the bus after the cycle', async () => {
    let clock = 0;
    const camera = createBenchCamera({
      gate: APPROVED,
      env: { SEEK_E2E_SWITCH_CHANNEL: '2' },
      countCameras: () => 0,
      now: () => clock,
      sleep: (ms) => {
        clock += ms;
        return Promise.resolve();
      },
      switchFor: () => ({ cycle: () => Promise.resolve() }),
    });
    await expect(camera.powerCycle()).rejects.toThrow(/did not come back on the bus/);
  });

  it('a dry run logs the cycle and touches no switch', async () => {
    const lines: string[] = [];
    const channels: number[] = [];
    const camera = createBenchCamera({
      gate: DRY,
      env: { SEEK_E2E_SWITCH_CHANNEL: '2' },
      switchFor: (channel) => {
        channels.push(channel);
        return { cycle: () => Promise.resolve() };
      },
      log: (line) => {
        lines.push(line);
      },
    });
    await camera.powerCycle();
    expect(channels).toEqual([]);
    expect(lines.join('\n')).toMatch(/channel 2/);
  });

  it('refuses to be built without a passed gate', () => {
    expect(() =>
      createBenchCamera({ gate: { approved: false, dry: false, reason: 'no' } }),
    ).toThrow(/did not pass/);
  });
});

describe('the camera on the bus and in the CLI', () => {
  it('waitForEnumeration returns the wait, polling until the camera is there', async () => {
    let clock = 0;
    const seen = [0, 0, 1];
    let reads = 0;
    const camera = createBenchCamera({
      gate: APPROVED,
      env: {},
      countCameras: () => {
        const count = seen[Math.min(reads, seen.length - 1)] ?? 0;
        reads += 1;
        return count;
      },
      now: () => clock,
      sleep: (ms) => {
        clock += ms;
        return Promise.resolve();
      },
    });
    expect(await camera.waitForEnumeration(5000, 500)).toBe(1000);
  });

  it('waitForReboot: the camera must leave the bus, then come back, and the wait is from the reset', async () => {
    let clock = 0;
    /* On the bus at the reset, off from 1 s to 3 s (the reboot), then back. */
    const onBus = (ms: number) => (ms < 1000 || ms >= 3000 ? 1 : 0);
    const camera = createBenchCamera({
      gate: APPROVED,
      env: {},
      countCameras: () => onBus(clock),
      now: () => clock,
      sleep: (ms) => {
        clock += ms;
        return Promise.resolve();
      },
    });
    expect(await camera.waitForReboot(5000, 40_000)).toBe(3000);
  });

  it('waitForReboot: a camera still on the bus at the drop limit was not rebooted', async () => {
    let clock = 0;
    const camera = createBenchCamera({
      gate: APPROVED,
      env: {},
      countCameras: () => 1,
      now: () => clock,
      sleep: (ms) => {
        clock += ms;
        return Promise.resolve();
      },
    });
    expect(await camera.waitForReboot(5000, 40_000)).toBeNull();
    expect(clock).toBe(5000);
  });

  it('waitForReboot: a reboot off the bus for less than a 500 ms poll is still seen (TESTING 42.31)', async () => {
    let clock = 0;
    /* On the bus at the reset, off from 40 ms to 440 ms (a fast reboot), then back. Both 500 ms
     * samples a slow poll would take (0 and 500) see the camera on the bus. */
    const onBus = (ms: number) => (ms < 40 || ms >= 440 ? 1 : 0);
    const camera = createBenchCamera({
      gate: APPROVED,
      env: {},
      countCameras: () => onBus(clock),
      now: () => clock,
      sleep: (ms) => {
        clock += ms;
        return Promise.resolve();
      },
    });
    expect(await camera.waitForReboot(5000, 40_000)).toBe(600);
  });

  it('waitForReboot: null when the camera never comes back', async () => {
    let clock = 0;
    const camera = createBenchCamera({
      gate: APPROVED,
      env: {},
      countCameras: () => (clock < 1000 ? 1 : 0),
      now: () => clock,
      sleep: (ms) => {
        clock += ms;
        return Promise.resolve();
      },
    });
    expect(await camera.waitForReboot(5000, 3000)).toBeNull();
  });

  it('waitForEnumeration returns null on timeout, at the timeout and no later', async () => {
    let clock = 0;
    const camera = createBenchCamera({
      gate: APPROVED,
      env: {},
      countCameras: () => 0,
      now: () => clock,
      sleep: (ms) => {
        clock += ms;
        return Promise.resolve();
      },
    });
    expect(await camera.waitForEnumeration(1200, 500)).toBeNull();
    expect(clock).toBe(1200);
  });

  it('present() is false when the bus cannot be read', () => {
    const counting = (count: number) =>
      createBenchCamera({ gate: APPROVED, env: {}, countCameras: () => count });
    expect(counting(1).present()).toBe(true);
    expect(counting(0).present()).toBe(false);
    const broken = createBenchCamera({
      gate: APPROVED,
      env: {},
      countCameras: () => {
        throw new Error('ioreg failed');
      },
    });
    expect(broken.present()).toBe(false);
  });

  it("runningInfo maps the CLI's info --json document, and runs the CLI with it", async () => {
    const commands: { command: string; args: readonly string[] }[] = [];
    const document = {
      device: { product: 'PIR206 Thermal Camera', serial: null, vendorId: '0x289d' },
      firmware: {
        version: '1.3.0.0',
        build: 'Oct 21 2014',
        bootloaderVersion: '0.9.0.0',
        bootloader: 'Sep 29 2014',
        serial: CAMERA_SERIAL,
      },
    };
    const camera = createBenchCamera({
      gate: APPROVED,
      env: {},
      cliPath: '/cli/bin.js',
      runCli: (command, args) => {
        commands.push({ command, args });
        return Promise.resolve({ code: 0, stdout: JSON.stringify(document), stderr: '' });
      },
    });
    expect(await camera.runningInfo()).toEqual({
      product: 'PIR206 Thermal Camera',
      serial: CAMERA_SERIAL,
      firmwareVersion: '1.3.0.0',
      buildString: 'Oct 21 2014',
      bootloaderVersion: '0.9.0.0',
    });
    expect(commands).toEqual([
      { command: process.execPath, args: ['/cli/bin.js', 'info', '--json'] },
    ]);
  });

  it('runningInfo is null, and never throws, when the CLI fails', async () => {
    const camera = (run: () => Promise<ExecResult>) =>
      createBenchCamera({ gate: APPROVED, env: {}, runCli: run });
    expect(
      await camera(() =>
        Promise.resolve({ code: 1, stdout: '', stderr: 'no camera' }),
      ).runningInfo(),
    ).toBeNull();
    expect(
      await camera(() =>
        Promise.resolve({ code: 0, stdout: 'not json', stderr: '' }),
      ).runningInfo(),
    ).toBeNull();
    expect(await camera(() => Promise.reject(new Error('spawn failed'))).runningInfo()).toBeNull();
  });

  it('parseRunningInfo is null for a document without firmware', () => {
    expect(parseRunningInfo('{"device":{}}')).toBeNull();
    expect(parseRunningInfo('[]')).toBeNull();
  });
});

/* ==================================================================== *
 * The build string
 * ==================================================================== */

describe('patchBuildString', () => {
  function image(...pieces: { at: number; text: string }[]): Uint8Array {
    const bytes = new Uint8Array(400).fill(0xff);
    for (const piece of pieces) bytes.set(new TextEncoder().encode(piece.text), piece.at);
    return bytes;
  }

  it('changes the last digit in every copy, keeps the length, and changes nothing else', () => {
    const before = image({ at: 40, text: 'xx Oct 21 2014 yy' }, { at: 200, text: 'Oct 21 2014' });
    const result = patchBuildString(before, 'Oct 21 2014');
    expect(result?.from).toBe('Oct 21 2014');
    expect(result?.to).toBe('Oct 21 2015');
    expect(result?.offsets).toEqual([40 + 3 + 10, 200 + 10]);
    const patched = result?.patched ?? new Uint8Array();
    expect(patched.length).toBe(before.length);
    const changed = [...patched.keys()].filter((i) => patched[i] !== before[i]);
    expect(changed).toEqual(result?.offsets);
    expect(String.fromCharCode(patched[53] ?? 0)).toBe('5');
  });

  it('does not change its input', () => {
    const before = image({ at: 10, text: 'Build 9' });
    const copy = before.slice();
    patchBuildString(before, 'Build 9');
    expect(before).toEqual(copy);
  });

  it('wraps a digit 9 to 0 and a capital Z to A', () => {
    expect(patchBuildString(image({ at: 5, text: 'v9' }), 'v9')?.to).toBe('v0');
    expect(patchBuildString(image({ at: 5, text: 'Build Z' }), 'Build Z')?.to).toBe('Build A');
  });

  it('returns null when the string is not in the image, or cannot be changed', () => {
    const plain = image({ at: 0, text: 'Oct 21 2014' });
    expect(patchBuildString(plain, 'Jul  6 2016')).toBeNull();
    expect(patchBuildString(plain, '')).toBeNull();
    expect(patchBuildString(plain, ' -- ')).toBeNull();
    expect(patchBuildString(plain, 'Oct 21 2014 é')).toBeNull();
  });
});

/* ==================================================================== *
 * The real dump tree and a real plain bank (the corpus; skipped unless named)
 * ==================================================================== */

describe.skipIf(CORPUS === undefined)('the corpus (SEEK_FULL_DUMPS_BY_CAMERA)', () => {
  it("lists the bench camera's subjects, with the own original last", () => {
    const subjects = listBenchSubjects({ root: CORPUS ?? '' });
    expect(subjects.length).toBeGreaterThan(0);
    expect(subjects.at(-1)?.version).toBe('1.3.0.0');
    expect(subjects.every((subject) => subject.launches)).toBe(true);
  });

  it("patches the build string in the own original's plain bank, in every copy", () => {
    const own = listBenchSubjects({ root: CORPUS ?? '' }).find(
      (subject) => subject.version === '1.3.0.0' && subject.fileKind === 'primary',
    );
    expect(own).toBeDefined();
    const bytes = new Uint8Array(readFileSync(own?.file ?? ''));
    const result = patchBuildString(bytes, 'Oct 21 2014');
    expect(result).not.toBeNull();
    expect(result?.offsets.length ?? 0).toBeGreaterThan(0);
    const patched = Buffer.from(result?.patched ?? new Uint8Array());
    expect(patched.indexOf('Oct 21 2014')).toBe(-1);
    expect(patched.indexOf('Oct 21 2015')).toBeGreaterThan(-1);
  });
});

describe('sameAsWritten: the page may rebalance only the adjust word', () => {
  /** The bytes with one byte flipped, as a copy. */
  function flipped(bytes: Uint8Array, at: number): Uint8Array {
    const copy = new Uint8Array(bytes);
    copy[at] = (copy[at] ?? 0) ^ 0xff;
    return copy;
  }

  it('accepts the same bytes, and a difference in the adjust word alone', () => {
    const written = dump(0x21);
    expect(sameAsWritten(written, written)).toBe(true);
    let stamped: Uint8Array = written;
    for (let at = ADJUST_OFFSET; at < ADJUST_OFFSET + 4; at++) stamped = flipped(stamped, at);
    expect(sameAsWritten(stamped, written)).toBe(true);
  });

  it('refuses a difference anywhere else, a word past the adjust word included', () => {
    const written = dump(0x21);
    expect(sameAsWritten(flipped(written, ADJUST_OFFSET + 4), written)).toBe(false);
    expect(sameAsWritten(flipped(written, ADJUST_OFFSET - 1), written)).toBe(false);
    expect(sameAsWritten(written.subarray(1), written)).toBe(false);
  });
});

/** The fake subject at `index`; a missing one fails the test by name. */
function subjectAt(subjects: readonly BenchSubject[], index: number): BenchSubject {
  const subject = subjects.at(index);
  if (subject === undefined) throw new Error(`no fake subject ${String(index)}`);
  return subject;
}

describe('the per-bank boot tests (SEEK_BENCH_SLOT_BOOT=1), on the fake rig', () => {
  let dir = '';
  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'seek-slot-boot-test-'));
  });
  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('writes each bank alone with its own marked build, and each boots alone', async () => {
    const subjects = fakeSubjects(path.join(dir, 'full'));
    const rig = createFakeRig({ subjects, failure: null });
    const result = await runSubject(rig, subjectAt(subjects, 0), () => undefined, true);
    expect(result.failures).toEqual([]);
    expect(result.bootProof).toBe('passed');
    expect(result.slotBoot.map((test) => [test.bank, test.state])).toEqual([
      ['b', 'booted-alone'],
      ['a', 'booted-alone'],
      ['r', 'booted-alone'],
    ]);
    expect(result.slotBoot.map((test) => test.erased)).toEqual([['a'], ['b', 'r'], ['b', 'a']]);
    expect(result.slotBoot[0]?.running).toContain('ZBZZZZ');
    expect(result.slotBoot[1]?.running).toContain('ZAZZZZ');
    expect(result.slotBoot[2]?.running).toContain('ZRZZZZ');
  });

  it('a blank bank B is written with the booted image (A) and then boots alone', async () => {
    const subjects = fakeSubjects(path.join(dir, 'blank'), { blankB: true });
    const rig = createFakeRig({ subjects, failure: null });
    const result = await runSubject(rig, subjectAt(subjects, 1), () => undefined, true);
    expect(result.failures).toEqual([]);
    expect(result.slotWrites.map((write) => write.state)).toEqual(['passed', 'passed', 'passed']);
    expect(result.slotWrites[0]?.notes.join(' ')).toMatch(/written with bank A's image/);
    expect(result.slotBoot.map((test) => test.state)).toEqual([
      'booted-alone',
      'booted-alone',
      'booted-alone',
    ]);
  });

  it('without the flag, the run is the standard one: no per-bank tests, the boot proof runs', async () => {
    const subjects = fakeSubjects(path.join(dir, 'standard'));
    const rig = createFakeRig({ subjects, failure: null });
    const result = await runSubject(rig, subjectAt(subjects, 0), () => undefined, false);
    expect(result.slotBoot).toEqual([]);
    expect(result.failures).toEqual([]);
    expect(result.bootProof).toBe('passed');
  });
});

describe('the blank-bank fallback source and the bank erase', () => {
  const image = (name: string): { name: string; bytes: Uint8Array } => ({
    name,
    bytes: new Uint8Array([1]),
  });

  it('takes the booted bank first, then A, then R, then B, and never the target', () => {
    const images = new Map<'a' | 'b' | 'r', ReturnType<typeof image> | null>([
      ['a', image('a.bin')],
      ['b', null],
      ['r', image('r.bin')],
    ]);
    expect(fallbackSource(images, 'b', 'r')?.letter).toBe('r');
    expect(fallbackSource(images, 'b', null)?.letter).toBe('a');
    expect(fallbackSource(images, 'b', 'b')?.letter).toBe('a');
    expect(fallbackSource(images, 'a', 'a')?.letter).toBe('r');
    expect(fallbackSource(new Map(), 'b', 'a')).toBeNull();
  });

  it('erases B alone for A, and keeps R for B', () => {
    expect(ERASED_FOR_BOOT.b).toEqual(['a']);
    expect(ERASED_FOR_BOOT.a).toEqual(['b', 'r']);
    expect(ERASED_FOR_BOOT.r).toEqual(['b', 'a']);
  });

  it('eraseRange runs the runner over one bank only, and refuses anything else', async () => {
    const { exec, calls } = fakeExec(() => OK);
    await bench(exec).eraseRange(0x14050000, 0x10000);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      command: 'node',
      args: ['tools/jlink/jlink-runner.js', 'erase-spifi-range'],
      cwd: TARGET_DIR,
    });
    expect(calls[0]?.env.ERASE_ADDR).toBe('0x14050000');
    expect(calls[0]?.env.ERASE_LEN).toBe('0x10000');
    await expect(bench(exec).eraseRange(0x14000000, 0x400000)).rejects.toThrow(/only one 64 KiB/);
    await expect(bench(exec).eraseRange(0x14050100, 0x10000)).rejects.toThrow(/aligned/);
    await expect(bench(exec).eraseRange(0x14000000, 0x10000)).resolves.toBeUndefined();
    expect(calls).toHaveLength(2);
  });

  it('patchBuildString with a mark makes the last character that letter', () => {
    const text = new TextEncoder().encode('xx Oct 21 2014 yy');
    const bytes = new Uint8Array(40).fill(0xff);
    bytes.set(text, 3);
    const marked = patchBuildString(bytes, 'Oct 21 2014', 'B');
    expect(marked?.to).toBe('Oct 21 201B');
    /* 'Oct 21 2014' starts at 6 (after the 'xx ' the test puts before it), so its last character is at 16. */
    expect(String.fromCharCode(marked?.patched[16] ?? 0)).toBe('B');
    expect(patchBuildString(bytes, 'Oct 21 2014', '-')).toBeNull();
  });
});

describe('the slots page names its dumps (empty banks included, TESTING 42.8)', () => {
  it('matches a version-named raw dump and the empty bank raw dump, per bank', () => {
    expect(rawDumpNamePattern('b').test('seek-slot-B-v0.9.1.0-raw-8881f545.bin')).toBe(true);
    expect(rawDumpNamePattern('b').test('seek-slot-B-empty-raw-71189f7f.bin')).toBe(true);
    expect(rawDumpNamePattern('b').test('seek-slot-A-empty-raw-71189f7f.bin')).toBe(false);
    expect(rawDumpNamePattern('r').test('seek-slot-R-v1.3.0.8-raw-0a1b2c3d.bin')).toBe(true);
    expect(rawDumpNamePattern('b').test('seek-slot-B-v0.9.1.0-decrypted-f0ff04d5.bin')).toBe(false);
  });

  it('matches a decrypted dump with or without its key pair, and never an empty bank', () => {
    const keys = `-KeyA-${'a'.repeat(32)}-KeyB-${'b'.repeat(32)}`;
    expect(decryptedDumpNamePattern('a').test('seek-slot-A-v4.8.1.9-decrypted-2c5eedec.bin')).toBe(
      true,
    );
    expect(
      decryptedDumpNamePattern('a').test(`seek-slot-A-v4.8.1.9-decrypted-2c5eedec${keys}.bin`),
    ).toBe(true);
    expect(decryptedDumpNamePattern('b').test('seek-slot-B-empty-raw-71189f7f.bin')).toBe(false);
  });
});

describe('the 1.3.0.8 FF build: its subject, its predictions, its differences', () => {
  it('is the FF build of 1.3.0.8, not the 8 Hz build or another FF version', () => {
    expect(isFF1308Subject({ version: '1.3.0.8', variant: 'ff' })).toBe(true);
    expect(isFF1308Subject({ version: '1.3.0.8', variant: 'std' })).toBe(false);
    expect(isFF1308Subject({ version: '1.3.0.0', variant: 'ff' })).toBe(false);
  });

  it('predicts the stored bank as the image XOR Key B, header verbatim, and the payload as the image XOR Key A', () => {
    const image = ffTestImage(0xc000, 5);
    const stored = predictedFFStored(image);
    const payload = predictedFFVendorPayload(image);
    expect(stored.length).toBe(0x10000);
    expect(payload.length).toBe(0x10000);
    expect(stored.subarray(image.length).every((byte) => byte === 0xff)).toBe(true);
    /* The header window is verbatim in both; everything else is XORed with its own key block. */
    for (let at = 0; at < image.length; at++) {
      const inWindow = at >= 0x200 && at <= 0x23f;
      if (inWindow) {
        expect(stored[at]).toBe(image[at]);
        expect(payload[at]).toBe(image[at]);
      }
    }
    expect(stored.subarray(0x240, image.length)).not.toEqual(image.subarray(0x240, image.length));
    /* The app's gate on the payload is sum(payload XOR Key A) == 0xFFFF for an image that sums to 0xFFFF. */
    expect(vendorGateSum(image)).toBe(0xffff);
  });

  it('describes a difference by its count and first byte, and says when two byte arrays are identical', () => {
    const a = new Uint8Array([1, 2, 3, 4]);
    expect(describeDifference(a, new Uint8Array([1, 2, 3, 4]))).toBe('identical');
    expect(describeDifference(a, new Uint8Array([1, 9, 3, 8]))).toBe(
      '2 byte(s) differ, first at 0x000001',
    );
    expect(describeDifference(a, new Uint8Array([1]))).toBe('4 B, not 1 B');
  });
});

describe('the FF vendor-form run, on a fake J-Link and camera', () => {
  it('writes A, B and R with the vendor form, each read back as predicted, then restores the original', async () => {
    const fake = fakeVendorBench({});
    const report = await runFfVendor(fake.bench, fake.files);
    expect(report.failures).toEqual([]);
    expect(report.restoreOk).toBe(true);
    expect(report.restored).toBe(true);
    expect(report.platformOk).toBe(true);
    expect(report.writes.map((write) => [write.bank, write.matchesPrediction])).toEqual([
      ['a', true],
      ['b', true],
      ['r', true],
    ]);
    expect(report.answersAfterWrites?.camera).toEqual({ a: 1, b: 1, r: 1 });
    expect(report.answersAfterWrites?.build).toBe('ff-1308');
    expect(report.restored).toBe(true);
    expect(fake.flash).toEqual(fake.original);
  });

  it('reads the 8 Hz platform as A 1, B 0, R 1 (the 8 Hz build), and the FF-in-R platform as all 0 and not decided', async () => {
    const fake = fakeVendorBench({});
    const report = await runFfVendor(fake.bench, fake.files);
    expect(report.answers8Hz?.camera).toEqual({ a: 1, b: 0, r: 1 });
    expect(report.answers8Hz?.build).toBe('plain');
    expect(report.answersFfInR?.camera).toEqual({ a: 0, b: 0, r: 0 });
    expect(report.answersFfInR?.build).toBeNull();
    expect(report.answersFfInR?.why).toMatch(/tell the builds apart/);
  });

  it('a write the camera stores as sent is a failed check, not a boot claim, and the run still restores', async () => {
    const fake = fakeVendorBench({ storeAsSentAt: 'b' });
    const report = await runFfVendor(fake.bench, fake.files);
    const write = report.writes.find((w) => w.bank === 'b');
    expect(write?.matchesPrediction).toBe(false);
    expect(report.failures.join(' ')).toMatch(/write B: the J-Link read .* is not the prediction/);
    expect(report.restored).toBe(true);
    expect(fake.flash).toEqual(fake.original);
  });

  it('a restore point that is not the original refuses the run before anything is written', async () => {
    const fake = fakeVendorBench({});
    const wrong = { ...fake.files, restoreSha256: '0'.repeat(64) };
    await expect(runFfVendor(fake.bench, wrong)).rejects.toThrow(/restore file/);
    expect(fake.calls.filter((call) => call.startsWith('flashFull') || call.startsWith('writeBank'))).toEqual([]);
  });

  it('a failure in the middle still puts the original flash back', async () => {
    const fake = fakeVendorBench({ throwAt: 'b' });
    await expect(runFfVendor(fake.bench, fake.files)).rejects.toThrow(/CLI fault at B/);
    expect(fake.flash).toEqual(fake.original);
  });

  it('the address of each bank is the 2014 chain’s own (A 0x14050000, B 0x14060000, R 0x14070000)', () => {
    expect(FF_BANK_ADDRESS).toEqual({ a: 0x14050000, b: 0x14060000, r: 0x14070000 });
  });
});

/* ==================================================================== *
 * The FF vendor-run files (TESTING 42.60): each is the variable's path when the variable is set, else the file under
 * its default root, and each is checked by sha256 before anything else. The real files are 4 MiB, so the fixtures are
 * small files of their own, with their own hashes, at the default places; the real defaults are checked at the end.
 * ==================================================================== */

interface FfFixture {
  readonly dumps: string;
  readonly fwv1: string;
  /** The default table, with each file's sha256 replaced by the fixture's own. */
  readonly slots: FfFileSlots;
  /** Where the default of `key` is, under the fixture's two roots. */
  readonly place: (key: FfFileKey) => string;
  /** The bytes each default file holds when the fixture is made. */
  readonly bytes: Readonly<Record<FfFileKey, Uint8Array>>;
}

/** The fixture: all three files at their default places under a temp dump tree and FW-V1 folder. */
function fixtureFf(
  dir: string,
  plain: Uint8Array = new TextEncoder().encode('the plain fixture\n'),
): FfFixture {
  const dumps = path.join(dir, 'dumps');
  const fwv1 = path.join(dir, 'fw-v1');
  const bytes: Record<FfFileKey, Uint8Array> = {
    restore: new TextEncoder().encode('the restore fixture\n'),
    platform: new TextEncoder().encode('the platform fixture\n'),
    plain,
  };
  const slots: FfFileSlots = {
    restore: { ...FF_FILE_SLOTS.restore, sha256: sha256(bytes.restore) },
    platform: { ...FF_FILE_SLOTS.platform, sha256: sha256(bytes.platform) },
    plain: { ...FF_FILE_SLOTS.plain, sha256: sha256(plain) },
  };
  const place = (key: FfFileKey): string =>
    path.join(
      FF_FILE_SLOTS[key].root === 'SEEK_FULL_DUMPS_BY_CAMERA' ? dumps : fwv1,
      ...FF_FILE_SLOTS[key].below,
    );
  for (const key of ['restore', 'platform', 'plain'] as const) {
    mkdirSync(path.dirname(place(key)), { recursive: true });
    writeFileSync(place(key), bytes[key]);
  }
  return { dumps, fwv1, slots, place, bytes };
}

/** The environment that points the defaults at a fixture's two roots. */
function rootsOf(fx: FfFixture): NodeJS.ProcessEnv {
  return { SEEK_FULL_DUMPS_BY_CAMERA: fx.dumps, SEEK_E2E_FWV1_DIR: fx.fwv1 };
}

describe('the FF vendor-run files: defaults, explicit paths, sha256 (TESTING 42.60)', () => {
  it('the defaults are the files the 42.30 retry used, with the hashes the header names', () => {
    expect(FF_FILE_SLOTS.restore.root).toBe('SEEK_FULL_DUMPS_BY_CAMERA');
    expect(FF_FILE_SLOTS.restore.below.join('/')).toBe(
      'Compact/Compact/2014.10.21-14.58.29-1.3.0.0/full_dump_original.bin',
    );
    expect(FF_FILE_SLOTS.restore.sha256).toBe(
      '40447c7e6da5cbc84621f4694ffff5bda0f783e7807a45e80443383b19a8eb72',
    );
    expect(FF_FILE_SLOTS.platform.root).toBe('SEEK_FULL_DUMPS_BY_CAMERA');
    expect(FF_FILE_SLOTS.platform.below.join('/')).toBe(
      'Compact/Compact/2017.01.06-11.16.17-1.3.0.8/full_dump_reconstructed.bin',
    );
    expect(PLATFORM_SHA256).toBe(
      'afa9800f8969e46a0d868b19bdd55a9514fec40cfd958de41d0f769eea5a6e7b',
    );
    expect(FF_FILE_SLOTS.plain.root).toBe('SEEK_E2E_FWV1_DIR');
    expect(FF_FILE_SLOTS.plain.below.join('/')).toBe(
      'emu/data/corpus/compact/2017.01.06-11.17.29-1.3.0.8-FF/no-serial/' +
        '32k_43x0_1.3.0.8_compact-16hz_public_-_compact_ff_jan_6_2017_11-17-29_99.28_gabiz_ro_firmware.bin',
    );
    expect(PLAIN_FF_SHA256).toBe(
      'b97ced91fff9f0949a02f35fceab697634cc109a0fe2a2fbbfe6ccfadb7d4d16',
    );
  });

  it('finds each file at its default place, under the dump tree and the FW-V1 folder, and says so', () => {
    const fx = fixtureFf(path.join(scratch, 'ff-default'));
    const chosen = chooseFfFiles(rootsOf(fx), fx.slots);
    if (typeof chosen === 'string') throw new Error(chosen);
    expect(chosen.restore).toEqual({
      variable: 'SEEK_BENCH_FF_RESTORE',
      path: fx.place('restore'),
      from: 'default',
      sha256: fx.slots.restore.sha256,
    });
    expect(chosen.platform.path).toBe(fx.place('platform'));
    expect(chosen.plain.path).toBe(fx.place('plain'));
    expect(chosen.plain.from).toBe('default');
    expect(describeFfFiles(chosen)).toMatch(
      /SEEK_BENCH_FF_RESTORE \(default\): .*full_dump_original\.bin, sha256 [0-9a-f]{64} ok/,
    );
  });

  it('an explicit variable wins over its default, even when the default is gone, and needs no root', () => {
    const fx = fixtureFf(path.join(scratch, 'ff-explicit'));
    rmSync(fx.place('restore'));
    const copy = path.join(scratch, 'ff-explicit', 'elsewhere', 'restore.bin');
    mkdirSync(path.dirname(copy), { recursive: true });
    writeFileSync(copy, fx.bytes.restore);
    const chosen = chooseFfFiles(
      {
        SEEK_BENCH_FF_RESTORE: copy,
        SEEK_BENCH_FF_PLATFORM: fx.place('platform'),
        SEEK_BENCH_FF_PLAIN: fx.place('plain'),
      },
      fx.slots,
    );
    if (typeof chosen === 'string') throw new Error(chosen);
    expect(chosen.restore).toMatchObject({ path: copy, from: 'set' });
    expect(chosen.platform.from).toBe('set');
    expect(chosen.plain.from).toBe('set');
  });

  it('a missing file stops with the variable, the path tried and the expected sha256', () => {
    const fx = fixtureFf(path.join(scratch, 'ff-missing'));
    rmSync(fx.place('platform'));
    const problem = chooseFfFiles(rootsOf(fx), fx.slots);
    expect(typeof problem).toBe('string');
    expect(problem).toContain('SEEK_BENCH_FF_PLATFORM');
    expect(problem).toContain(fx.place('platform'));
    expect(problem).toContain(fx.slots.platform.sha256);
    expect(problem).not.toContain('SEEK_BENCH_FF_RESTORE');
  });

  it('a file with the wrong sha256 stops with the variable, the path, its sha256 and the expected one', () => {
    const fx = fixtureFf(path.join(scratch, 'ff-wrong'));
    const other = 'a different plain image\n';
    writeFileSync(fx.place('plain'), other);
    const problem = chooseFfFiles(rootsOf(fx), fx.slots);
    expect(typeof problem).toBe('string');
    expect(problem).toContain('SEEK_BENCH_FF_PLAIN');
    expect(problem).toContain(fx.place('plain'));
    expect(problem).toContain(sha256(new TextEncoder().encode(other)));
    expect(problem).toContain(fx.slots.plain.sha256);
  });

  it('an explicit file is checked by sha256 too, and a blank variable counts as not set', () => {
    const fx = fixtureFf(path.join(scratch, 'ff-explicit-wrong'));
    const wrong = path.join(scratch, 'ff-explicit-wrong', 'wrong-restore.bin');
    writeFileSync(wrong, 'not the original');
    const refused = chooseFfFile({ SEEK_BENCH_FF_RESTORE: wrong }, fx.slots.restore);
    expect(typeof refused).toBe('string');
    expect(refused).toContain('SEEK_BENCH_FF_RESTORE');
    expect(refused).toContain(wrong);
    expect(refused).toContain(fx.slots.restore.sha256);
    const blank = chooseFfFile({ SEEK_BENCH_FF_RESTORE: '   ', ...rootsOf(fx) }, fx.slots.restore);
    expect(blank).toMatchObject({ from: 'default', path: fx.place('restore') });
  });

  it('with no root and no variable, the message names the root and the real expected sha256', () => {
    const restore = chooseFfFiles({});
    expect(restore).toMatch(
      /SEEK_BENCH_FF_RESTORE is not set, and its default is under SEEK_FULL_DUMPS_BY_CAMERA/,
    );
    expect(restore).toContain(ORIGINAL_SHA256);
    const plain = chooseFfFile({ SEEK_FULL_DUMPS_BY_CAMERA: '/somewhere' }, FF_FILE_SLOTS.plain);
    expect(plain).toMatch(
      /SEEK_BENCH_FF_PLAIN is not set, and its default is under SEEK_E2E_FWV1_DIR/,
    );
    expect(plain).toContain(PLAIN_FF_SHA256);
  });

  it('the FF row not selected: no file is looked for, and none is required', () => {
    const subjects = fakeSubjects(path.join(scratch, 'ff-not-selected'));
    expect(requireFfFiles(subjects, {})).toBeNull();
    expect(requireFfFiles([], {})).toBeNull();
  });

  it('the FF row selected: its three files are required before any subject runs, one message at a time', () => {
    const ffSubjects = fakeFfSubjects(path.join(scratch, 'ff-selected'));
    expect(() => requireFfFiles(ffSubjects, {})).toThrow(/no subject was run/);
    expect(() => requireFfFiles(ffSubjects, {})).toThrow(
      /SEEK_FULL_DUMPS_BY_CAMERA, which is not set/,
    );
    const fx = fixtureFf(path.join(scratch, 'ff-selected-fixture'));
    const chosen = requireFfFiles(ffSubjects, rootsOf(fx), fx.slots);
    expect(chosen?.plain.from).toBe('default');
    rmSync(fx.place('plain'));
    expect(() => requireFfFiles(ffSubjects, rootsOf(fx), fx.slots)).toThrow(/SEEK_BENCH_FF_PLAIN/);
  });

  it('ffVendorFilesFromEnv pads the plain image to one bank from the chosen files, and names the first problem', () => {
    const image = ffTestImage(0xc000, 9);
    const fx = fixtureFf(path.join(scratch, 'ff-pad'), image);
    const files = ffVendorFilesFromEnv(
      rootsOf(fx),
      path.join(scratch, 'ff-pad', 'scratch'),
      fx.slots,
    );
    if (typeof files === 'string') throw new Error(files);
    expect(files.restoreFile).toBe(fx.place('restore'));
    expect(files.restoreSha256).toBe(fx.slots.restore.sha256);
    expect(files.plainFfFile).toBe(fx.place('plain'));
    const bank = readFileSync(files.plainFfBankFile);
    expect(bank.length).toBe(0x10000);
    expect(Buffer.from(bank.subarray(0, 0xc000)).equals(Buffer.from(image))).toBe(true);
    expect(bank.subarray(0xc000).every((byte) => byte === 0xff)).toBe(true);
    expect(ffVendorFilesFromEnv({}, path.join(scratch, 'ff-pad', 'none'))).toMatch(
      /SEEK_FULL_DUMPS_BY_CAMERA, which is not set/,
    );
  });
});

describe.skipIf(CORPUS === undefined)(
  'the FF vendor-run defaults on the real tree (TESTING 42.60)',
  () => {
    it('the restore and platform defaults are on the dump tree, and match their sha256', () => {
      for (const key of ['restore', 'platform'] as const) {
        const chosen = chooseFfFile({ SEEK_FULL_DUMPS_BY_CAMERA: CORPUS }, FF_FILE_SLOTS[key]);
        if (typeof chosen === 'string') throw new Error(chosen);
        expect(chosen.from).toBe('default');
        expect(chosen.sha256).toBe(FF_FILE_SLOTS[key].sha256);
      }
    });

    it.skipIf(!process.env.SEEK_E2E_FWV1_DIR?.trim())(
      'the plain default is in the FW-V1 checkout, and matches its sha256',
      () => {
        const chosen = chooseFfFile(
          { SEEK_E2E_FWV1_DIR: process.env.SEEK_E2E_FWV1_DIR },
          FF_FILE_SLOTS.plain,
        );
        if (typeof chosen === 'string') throw new Error(chosen);
        expect(chosen.from).toBe('default');
        expect(chosen.sha256).toBe(PLAIN_FF_SHA256);
      },
    );
  },
);

/** A synthetic 1.3.0.8 FF image: magic, length, the key pair once each, word 142 solved to a plain sum of 0xFFFF. */
function ffTestImage(length: number, seed: number): Uint8Array {
  const out = new Uint8Array(length);
  let s = seed >>> 0 || 1;
  for (let i = 0; i < length; i++) {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    out[i] = s & 0xff;
  }
  const view = new DataView(out.buffer);
  view.setUint32(0, 0x10001000, true);
  view.setUint32(4, 0x10000101, true);
  view.setUint32(0x200, 0xa1b2c3d4, true);
  view.setUint32(0x204, length, true);
  out.set(Buffer.from(KEY_PAIRS.ff1308.block0, 'hex'), 0x4000);
  out.set(Buffer.from(KEY_PAIRS.ff1308.block1, 'hex'), 0x5000);
  view.setUint32(0x238, 0, true);
  let sum = 0;
  for (let at = 0; at < length; at += 4) sum = (sum + view.getUint32(at, true)) >>> 0;
  view.setUint32(0x238, (0xffff - sum) >>> 0, true);
  return out;
}

/**
 * A J-Link and a camera with the same checks the apps run. The flash is a 4 MiB array; the camera's
 * answers come from the banks through the core's own verdicts; a power cycle boots R, and the build
 * is the FF app when R holds the FF image, else the 8 Hz build. `storeAsSentAt` makes one bank keep the
 * payload as sent; `throwAt` makes the CLI write to one bank throw.
 */
function fakeVendorBench(options: { storeAsSentAt?: 'a' | 'b' | 'r'; throwAt?: 'a' | 'b' | 'r' }): {
  bench: FfVendorBench;
  files: FfVendorFiles;
  flash: Uint8Array;
  original: Uint8Array;
  calls: string[];
} {
  const dir = mkdtempSync(path.join(tmpdir(), 'seek-ff-fake-'));
  const base = 0x14000000;
  const size = 0x400000;
  const original = new Uint8Array(size).fill(0xff);
  /* The original: A holds an 8 Hz plain image, R the same, B is erased (the 1.3.0.8 platform's own shape). */
  const plainEight = ffTestImage(0xc000, 21);
  plainEight.set(new Uint8Array(0x10).fill(0), 0x4000);
  plainEight.set(new Uint8Array(0x10).fill(0), 0x5000);
  const view = new DataView(plainEight.buffer);
  view.setUint32(0x238, 0, true);
  let eightSum = 0;
  for (let at = 0; at < 0xc000; at += 4) eightSum = (eightSum + view.getUint32(at, true)) >>> 0;
  view.setUint32(0x238, (0 - eightSum) >>> 0, true);
  original.set(plainEight, 0x50000);
  original.set(plainEight, 0x70000);
  const restoreFile = path.join(dir, 'restore.bin');
  writeFileSync(restoreFile, original);
  const platform = original.slice();
  platform[0x100] = 0x5a;
  const platformFile = path.join(dir, 'platform.bin');
  writeFileSync(platformFile, platform);
  const plainFf = ffTestImage(0xc000, 31);
  const plainFfFile = path.join(dir, 'ff-plain.bin');
  writeFileSync(plainFfFile, plainFf);
  const plainFfBankFile = path.join(dir, 'ff-plain-bank.bin');
  const padded = new Uint8Array(0x10000).fill(0xff);
  padded.set(plainFf, 0);
  writeFileSync(plainFfBankFile, padded);

  const flash = new Uint8Array(size).fill(0xff);
  flash.set(original);
  const calls: string[] = [];
  let on = true;
  let build: 'plain' | 'ff' = 'plain';
  /* The restore image is the 1.3.0.0 original; the platform and anything else is the 1.3.0.8 build. */
  let version = '1.3.0.8';
  const bankOf = (letter: 'a' | 'b' | 'r'): Uint8Array => {
    const at = FF_BANK_ADDRESS[letter] - base;
    return flash.subarray(at, at + 0x10000);
  };
  const answers = (which: 'plain' | 'ff'): (number | null)[] =>
    (['a', 'b', 'r'] as const).map((letter) =>
      which === 'plain' ? plainBankVerdict(bankOf(letter)) : ffBankVerdict(bankOf(letter)),
    );
  const bootBuild = (): 'plain' | 'ff' => {
    const r = bankOf('r');
    return locateFFKeys(r.subarray(0, 0xc000)) !== null ? 'ff' : 'plain';
  };

  const jlink: JlinkBench = {
    flashFull(file: string): Promise<void> {
      calls.push('flashFull');
      flash.set(readFileSync(file));
      version = file === restoreFile ? '1.3.0.0' : '1.3.0.8';
      return Promise.resolve();
    },
    readFlash(address: number, length: number): Promise<Uint8Array> {
      calls.push('readFlash');
      const at = address - base;
      return Promise.resolve(flash.slice(at, at + length));
    },
    verifyFull(sha: string): Promise<void> {
      calls.push('verifyFull');
      if (sha256(flash) !== sha) return Promise.reject(new Error('verify: the flash is not the file'));
      return Promise.resolve();
    },
    eraseRange(address: number, length: number): Promise<void> {
      calls.push('eraseRange');
      const at = address - base;
      flash.fill(0xff, at, at + length);
      return Promise.resolve();
    },
    writeBank(address: number, file: string): Promise<void> {
      calls.push('writeBank');
      const at = address - base;
      flash.set(readFileSync(file).subarray(0, 0x10000), at);
      return Promise.resolve();
    },
    resetCpu: () => Promise.resolve(),
    setBootSlot: () => Promise.resolve(),
  };

  const camera: BenchCamera = {
    present: () => on,
    waitForEnumeration: () => Promise.resolve(on ? 1 : null),
    waitForReboot: () => Promise.resolve(on ? 1 : null),
    powerCycle(): Promise<void> {
      calls.push('powerCycle');
      build = bootBuild();
      on = true;
      return Promise.resolve();
    },
    runningInfo: () => Promise.resolve(null),
    infoJson(): Promise<Record<string, unknown> | null> {
      calls.push('infoJson');
      if (!on) return Promise.resolve(null);
      const plain = answers('plain');
      const ff = answers('ff');
      const camera = answers(build);
      const same = (a: (number | null)[], b: (number | null)[]): boolean => a.every((v, i) => v === b[i]);
      const decided =
        same(camera, plain) && !same(camera, ff) ? 'plain' : same(camera, ff) && !same(camera, plain) ? 'ff-1308' : null;
      return Promise.resolve({
        firmware: { version, build: build === 'ff' ? 'Jan 6 2017 (FF)' : 'Jan 6 2017' },
        running: {
          build: decided,
          why: decided === null ? 'the banks do not tell the builds apart' : `the camera answers ${camera.join(', ')}`,
          camera: { a: camera[0], b: camera[1], r: camera[2] },
          predicted: { plain, ff },
        },
      });
    },
    slotFlash(bank: 'a' | 'b' | 'r', file: string): Promise<SlotFlashRun> {
      calls.push(`slotFlash ${bank}`);
      if (options.throwAt === bank) return Promise.reject(new Error(`CLI fault at ${bank.toUpperCase()}`));
      if (build !== 'ff') return Promise.resolve({ code: 1, result: { written: false }, stdout: '', stderr: 'refused' });
      const image = new Uint8Array(readFileSync(file));
      const stored = options.storeAsSentAt === bank ? new Uint8Array(0x10000).fill(0xff) : predictedFFStored(image);
      if (options.storeAsSentAt === bank) stored.set(image, 0);
      flash.set(stored, FF_BANK_ADDRESS[bank] - base);
      return Promise.resolve({
        code: 0,
        result: { written: true, verified: true, commitStatus: 0 },
        stdout: '',
        stderr: '',
      });
    },
  };

  const files: FfVendorFiles = {
    restoreFile,
    restoreSha256: sha256(original),
    platformFile,
    platformSha256: sha256(platform),
    plainFfFile,
    plainFfSha256: sha256(plainFf),
    plainFfBankFile,
    vendorFile: null,
  };
  return {
    bench: { jlink, camera, log: () => undefined },
    files,
    flash,
    original,
    calls,
  };
}

describe('the probes, on the fake rig (SEEK_BENCH_PROBE)', () => {
  let dir = '';
  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'seek-probe-test-'));
  });
  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('empty-b: the empty bank is listed, dumped, filled from the booted bank, and B alone boots', async () => {
    const subjects = fakeSubjects(path.join(dir, 'empty'), { blankB: true });
    const rig = createFakeRig({ subjects, failure: null });
    const result = await runProbe(rig, subjectAt(subjects, 1), 'empty-b', () => undefined);
    expect(result.failures).toEqual([]);
    expect(result.notes.join('\n')).toMatch(/bank B is listed "empty"/);
    expect(result.notes.join('\n')).toMatch(/dump B: ".*empty, nothing to decrypt.*"/);
    expect(result.slotWrites.find((write) => write.bank === 'b')?.state).toBe('passed');
    expect(result.slotBoot.find((test) => test.bank === 'b')?.state).toBe('booted-alone');
    expect(result.bootProof).toBe('passed');
  });

  it('empty-b: a bank that is not empty is a failure of the probe, not a fill', async () => {
    const subjects = fakeSubjects(path.join(dir, 'full'));
    const rig = createFakeRig({ subjects, failure: null });
    const result = await runProbe(rig, subjectAt(subjects, 0), 'empty-b', () => undefined);
    expect(result.failures.join(' ')).toMatch(/bank B is listed .*, not empty/);
    expect(result.slotWrites.find((write) => write.bank === 'b')?.state).toBe('not-run');
  });

  it('refuse-b: a bank the page decrypts nothing of is skipped, and nothing is sent', async () => {
    const subjects = fakeSubjects(path.join(dir, 'refuse'), { blankB: true });
    const rig = createFakeRig({ subjects, failure: null });
    const result = await runProbe(rig, subjectAt(subjects, 1), 'refuse-b', () => undefined);
    expect(result.failures).toEqual([]);
    expect(result.slotWrites.find((write) => write.bank === 'b')?.state).toBe('skipped');
    expect(result.notes.join('\n')).toMatch(/decrypts no image of its own/);
  });
});

describe('the read-back of a modern write: the camera key pair may replace the application pair (42.7)', () => {
  /* A 64 KiB image holding the Mosaic 10.9.1.31 application pair at 0x8000 (key A) and 0x8010 (key B). */
  const pair = APPLICATION_KEY_PAIRS.find((candidate) =>
    candidate.builds.includes('Mosaic 10.9.1.31'),
  );
  if (pair === undefined) throw new Error('no Mosaic 10.9.1.31 pair in the core table');
  const written = (): Uint8Array => {
    const image = new Uint8Array(0x10000);
    for (let at = 0; at < image.length; at++) image[at] = (at * 37 + 11) & 0xff;
    image.set(Buffer.from(pair.keyA, 'hex'), 0x8000);
    image.set(Buffer.from(pair.keyB, 'hex'), 0x8010);
    return image;
  };
  const CAMERA_A = '874dfcf676d51af58f356d972663a592';
  const CAMERA_B = 'b23b0d202adb4713eb799f87a29e279f';
  /* The read-back: the same image with the camera's pair in place, and the adjust word moved. */
  const readBack = (): Uint8Array => {
    const bytes = written();
    bytes.set(Buffer.from(CAMERA_A, 'hex'), 0x8000);
    bytes.set(Buffer.from(CAMERA_B, 'hex'), 0x8010);
    bytes.set([1, 2, 3, 4], ADJUST_OFFSET);
    return bytes;
  };
  const named = { keyA: CAMERA_A, keyB: CAMERA_B };

  it('finds the application pair by value, each half once', () => {
    expect(applicationPairAt(written())).toEqual({ at0: 0x8000, at1: 0x8010 });
    expect(applicationPairAt(new Uint8Array(0x10000))).toBeNull();
  });

  it('accepts the camera pair the read-back names, with the adjust word moved, and nothing else changed', () => {
    expect(sameAsWrittenUpToKeyPair(readBack(), written(), named)).toBe(true);
  });

  it('refuses a read-back that changes any other byte, a key the name does not give, or no name at all', () => {
    const tampered = readBack();
    tampered[0x1234] = (tampered[0x1234] ?? 0) ^ 0xff;
    expect(sameAsWrittenUpToKeyPair(tampered, written(), named)).toBe(false);
    const wrongKey = readBack();
    wrongKey[0x8000] = (wrongKey[0x8000] ?? 0) ^ 0x01;
    expect(sameAsWrittenUpToKeyPair(wrongKey, written(), named)).toBe(false);
    expect(sameAsWrittenUpToKeyPair(readBack(), written(), null)).toBe(false);
  });

  it('reads the pair from a decrypted file name', () => {
    expect(
      keyPairNamedBy(
        `seek-slot-B-v10.9.1.31-decrypted-c6c5719a-KeyA-${CAMERA_A}-KeyB-${CAMERA_B}.bin`,
      ),
    ).toEqual(named);
    expect(keyPairNamedBy('seek-slot-B-v10.9.1.31-decrypted-c6c5719a.bin')).toBeNull();
  });
});

describe('the derived probe, on the fake rig (TESTING 42.7)', () => {
  let dir = '';
  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'seek-derived-test-'));
  });
  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('derives B and R, boots each with its own cfg[0], restores cfg[0] exactly, and leaves A alone', async () => {
    const [base] = fakeSubjects(path.join(dir, 'derived'));
    if (base === undefined) throw new Error('no fake subject');
    /* The flashed dump boots slot A: cfg[0] = 0 in its boot-config block. */
    const bytes = new Uint8Array(readFileSync(base.file));
    bytes.set(Buffer.from([0, 0, 0, 0]), 0x10000);
    writeFileSync(base.file, bytes);
    const subject = { ...base, sha256: sha256(bytes) };
    const rig = createFakeRig({ subjects: [subject], failure: null });
    const result = await runProbe(rig, subject, 'derived', () => undefined);
    expect(result.failures).toEqual([]);
    expect(result.slotWrites.map((write) => [write.bank, write.state])).toEqual([
      ['b', 'passed'],
      ['a', 'not-run'],
      ['r', 'passed'],
    ]);
    const notes = result.notes.join('\n');
    expect(notes).toMatch(/derived B: cfg\[0\]=1 \(slot B\), the camera runs "BUILD:ZBZZZZ"/);
    expect(notes).toMatch(
      /derived R: cfg\[0\]=2 \(recovery bank R\), the camera runs "BUILD:ZRZZZZ"/,
    );
    expect(notes.match(/cfg\[0\] restored to 0, block as saved/g)).toHaveLength(2);
    expect(result.bootProof).toBe('passed');
    expect(await rig.jlink.readFlash(0x14010000, 4)).toEqual(new Uint8Array([0, 0, 0, 0]));
  });
});
