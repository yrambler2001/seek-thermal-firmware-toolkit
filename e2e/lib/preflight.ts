/**
 * The pre-flight every real-camera run makes before it touches anything:
 * exactly one Seek camera on the bus, its interface held by no other program
 * (macOS shows a claim as an interface user client under the device), neither
 * the CLI nor the user's own hardware probe running, and no other e2e run on
 * the camera (its Electron, or the cross-process lock below). Read-only: it
 * asks `ioreg` and `ps`, never the camera.
 *
 * A process counts as a camera client only when its executable is node, Electron
 * or a J-Link tool (`CLIENT_EXECUTABLE`), and never this run's own process or its
 * ancestors. A shell, grep or ps that merely names the CLI in its arguments is not
 * a holder (agent C's finding E, TESTING.md 42.20 §5).
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * One e2e run on the camera at a time, across processes: the run that passes
 * the pre-flight takes this lock, and keeps it until the run ends. A second
 * run — another terminal, another agent — skips instead of reaching the camera
 * in the gap between the first run's sessions (a restart, the pause between
 * two spec files), where `ioreg` sees no claim.
 *
 * The lock names the RUN's process: the vitest main process, whose pid the
 * global setup (`global-setup.ts`) hands every worker as `SEEK_E2E_RUN_PID`.
 * It outlives every spec file of the run, so the lock covers the gaps between
 * them, and the global teardown removes it when the run ends. It used to name
 * the worker, which vitest ends without running its `exit` hooks, so the file
 * was left behind after every camera spec. A lock whose process is gone (a run
 * that was killed) is taken over by the next run, as before.
 */
export const CAMERA_LOCK = path.join(tmpdir(), 'seek-e2e-camera.lock');

/** The process the lock is held for: the run's main process, or this one outside a run. */
function lockOwner(): number {
  const run = Number(process.env.SEEK_E2E_RUN_PID);
  return Number.isInteger(run) && run > 0 ? run : process.pid;
}

/** Removes the camera lock when `owner` holds it; anyone else's is left alone. */
export function releaseCameraLock(owner: number = lockOwner()): void {
  try {
    if (readFileSync(CAMERA_LOCK, 'utf8').trim() === String(owner)) rmSync(CAMERA_LOCK);
  } catch {
    /* already gone */
  }
}

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

function takeCameraLock(): string | null {
  const owner = lockOwner();
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      writeFileSync(CAMERA_LOCK, String(owner), { flag: 'wx' });
      /* Outside a run (no global setup) this process is the owner; a process
       * that does get to run its exit hooks lets go here too. */
      if (owner === process.pid) {
        process.once('exit', () => {
          releaseCameraLock(owner);
        });
      }
      return null;
    } catch {
      let holder = NaN;
      try {
        holder = Number(readFileSync(CAMERA_LOCK, 'utf8').trim());
      } catch {
        /* removed between the two calls: try again */
      }
      if (holder === owner) return null;
      if (Number.isInteger(holder) && holder > 0 && alive(holder)) {
        return `another e2e run (pid ${String(holder)}) is using the camera (lock ${CAMERA_LOCK})`;
      }
      rmSync(CAMERA_LOCK, { force: true });
    }
  }
  return `could not take the camera lock ${CAMERA_LOCK}`;
}

/** One process from `ps -axww -o pid=,ppid=,command=`. */
export interface ProcessRow {
  readonly pid: number;
  readonly ppid: number;
  /** The full command line, as the process was started. */
  readonly command: string;
}

/** `ps -axww -o pid=,ppid=,command=` output as rows; lines that are not rows are dropped. */
export function parsePsRows(text: string): ProcessRow[] {
  const rows: ProcessRow[] = [];
  for (const line of text.split('\n')) {
    const match = /^\s*(\d+)\s+(\d+)\s+(.+?)\s*$/.exec(line);
    if (match === null) continue;
    rows.push({ pid: Number(match[1]), ppid: Number(match[2]), command: match[3] ?? '' });
  }
  return rows;
}

/**
 * The programs that can hold the camera: node (the CLI, vitest and its workers, the
 * e2e Electron tools), Electron itself, and the J-Link tools. Matched on the executable
 * (the first word of the command line, its directory optional), so a shell, `ps`,
 * `pgrep`, `grep` or an editor that merely names one of these in its arguments is
 * never a holder.
 */
const CLIENT_EXECUTABLE = /^(?:\S*\/)?(?:node|electron|vitest|jlink[\w-]*|JLink[\w-]*)(?:\s|$)/i;

/**
 * The pids this process runs under: its own pid and each ancestor, walked up from the
 * process table (`rows`), so they are excluded whatever their command line says.
 */
export function ancestorsOf(rows: readonly ProcessRow[], self: number): Set<number> {
  const parent = new Map(rows.map((row) => [row.pid, row.ppid] as const));
  const mine = new Set<number>([self]);
  let pid = parent.get(self) ?? NaN;
  for (let depth = 0; depth < 64 && Number.isInteger(pid) && pid > 0; depth++) {
    if (mine.has(pid)) break;
    mine.add(pid);
    pid = parent.get(pid) ?? NaN;
  }
  return mine;
}

/**
 * The processes that are real camera clients for `pattern` (matched against the whole
 * command line): a client executable, not this run's own process or its ancestors, whose
 * command line names the pattern. Returned as `pid command`, cut to 120 characters.
 */
export function cameraClientsIn(
  rows: readonly ProcessRow[],
  pattern: RegExp,
  self: number = process.pid,
): string[] {
  const mine = ancestorsOf(rows, self);
  return rows
    .filter((row) => !mine.has(row.pid))
    .filter((row) => CLIENT_EXECUTABLE.test(row.command) && pattern.test(row.command))
    .map((row) => `${String(row.pid)} ${row.command.slice(0, 120)}`);
}

/** The process table, read with ps (read-only). Throws when ps cannot answer. */
function processTable(): ProcessRow[] {
  return parsePsRows(
    execFileSync('ps', ['-axww', '-o', 'pid=,ppid=,command='], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    }),
  );
}

/** Another e2e run's browser on the real camera (Electron), or a camera spec running. */
function otherCameraRun(): string | null {
  let rows: ProcessRow[];
  try {
    rows = processTable();
  } catch (error) {
    /* Fail closed: a run that cannot see the process table does not know the camera is free. */
    return `could not list the processes (ps): ${error instanceof Error ? error.message : String(error)}`;
  }
  const others = cameraClientsIn(rows, /e2e\/electron\/main\.mjs|camera(-bridge|-restart)?\.e2e/);
  return others.length === 0 ? null : `another e2e run is on the camera: ${others.join('; ')}`;
}

/** The camera as macOS enumerated it: its own USB descriptors, cached by the OS. */
export interface CameraOnBus {
  /** iProduct, as the camera answered it (`kUSBProductString`), or null when it named none. */
  readonly productName: string | null;
  readonly productId: number;
}

/**
 * The one Seek camera on the bus, from `ioreg` — the camera's own descriptors,
 * read without a transfer — or null when there is not exactly one. A run that
 * checks the chooser's camera against this checks it against the camera
 * attached, not against a name written into the test for one camera.
 */
export function cameraOnBus(): CameraOnBus | null {
  let tree: string;
  try {
    tree = execFileSync('ioreg', ['-l', '-w0', '-p', 'IOService'], {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    });
  } catch {
    return null;
  }
  const lines = tree.split('\n');
  const found: CameraOnBus[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/\+-o .*<class IOUSBHostDevice/.test(lines[i] ?? '')) continue;
    const next = lines.findIndex((l, j) => j > i && l.includes('+-o'));
    const own = lines.slice(i + 1, next < 0 ? undefined : next);
    if (!own.some((l) => /"idVendor" = 10397\b/.test(l))) continue;
    const product = own.map((l) => /"kUSBProductString" = "(.*)"/.exec(l)?.[1]).find(Boolean);
    const pid = own.map((l) => /"idProduct" = (\d+)/.exec(l)?.[1]).find(Boolean);
    found.push({ productName: product ?? null, productId: Number(pid ?? NaN) });
  }
  return found.length === 1 ? (found[0] ?? null) : null;
}

/**
 * Why the camera cannot be used right now, or null when it can: it must be
 * on the bus exactly once, no program may hold its interface (macOS shows a
 * claim as an interface user client under the device), and neither the CLI nor
 * the user's own hardware probe may be running.
 */
export function cameraBusyReason(): string | null {
  let tree: string;
  try {
    tree = execFileSync('ioreg', ['-l', '-w0', '-p', 'IOService'], {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    });
  } catch (error) {
    return `ioreg failed: ${error instanceof Error ? error.message : String(error)}`;
  }
  const lines = tree.split('\n');
  /* A device's own properties run from its `+-o` line to the next one. */
  const ownProperties = (i: number): string[] => {
    const next = lines.findIndex((l, j) => j > i && l.includes('+-o'));
    return lines.slice(i + 1, next < 0 ? undefined : next);
  };
  const starts = lines
    .map((line, i) => ({ line, i }))
    .filter(({ line }) => /\+-o .*<class IOUSBHostDevice/.test(line))
    .filter(({ i }) => ownProperties(i).some((l) => /"idVendor" = 10397\b/.test(l)));
  if (starts.length === 0) return 'no Seek camera (vendor 0x289d) is on the bus';
  if (starts.length > 1) return `${String(starts.length)} Seek cameras are on the bus`;
  const start = starts[0]?.i ?? 0;
  const indent = (lines[start] ?? '').indexOf('+-o');
  const holders: string[] = [];
  let inInterfaceClient = false;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const at = line.indexOf('+-o');
    if (at >= 0 && at <= indent) break;
    if (at >= 0) inInterfaceClient = line.includes('<class AppleUSBHostInterfaceUserClient');
    const creator = /"IOUserClientCreator" = "pid (\d+), (.*)"/.exec(line);
    if (inInterfaceClient && creator !== null && creator[2] !== 'accessoryd') {
      holders.push(`${creator[2] ?? '?'} (pid ${creator[1] ?? '?'})`);
    }
  }
  if (holders.length > 0) return `the camera's interface is held by ${holders.join(', ')}`;
  let rows: ProcessRow[];
  try {
    rows = processTable();
  } catch (error) {
    return `could not list the processes (ps): ${error instanceof Error ? error.message : String(error)}`;
  }
  const others = cameraClientsIn(rows, /real-camera-probe|seek-fw|packages\/cli\/dist\/bin\.js/);
  if (others.length > 0) return `another camera client is running: ${others.join('; ')}`;
  return otherCameraRun() ?? takeCameraLock();
}
