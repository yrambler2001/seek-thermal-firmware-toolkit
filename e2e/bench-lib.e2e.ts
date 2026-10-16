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
} from './lib/bench/index.js';
import { ADJUST_OFFSET, sameAsWritten } from './lib/bench/spec-flow.js';
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
