/**
 * The pre-flight every real-camera run makes before it touches anything:
 * exactly one Seek camera on the bus, its interface held by no other program
 * (macOS shows a claim as an interface user client under the device), neither
 * the CLI nor the user's own hardware probe running, and no other e2e run on
 * the camera (its Electron, or the cross-process lock below). Read-only: it
 * asks `ioreg` and `pgrep`, never the camera.
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

/** Another e2e run's browser on the real camera (Electron), or a camera spec running. */
function otherCameraRun(): string | null {
  let running: string;
  try {
    running = execFileSync(
      'pgrep',
      ['-fl', String.raw`e2e/electron/main\.mjs|camera(-bridge|-restart)?\.e2e`],
      { encoding: 'utf8' },
    );
  } catch {
    return null; /* pgrep exits 1 when nothing matches */
  }
  /* This run's own processes (npm exec -> vitest -> its worker) are not "another". */
  const mine = new Set<string>([String(process.pid)]);
  let pid = process.ppid;
  for (let depth = 0; depth < 12 && pid > 1; depth++) {
    mine.add(String(pid));
    try {
      pid = Number(execFileSync('ps', ['-o', 'ppid=', '-p', String(pid)], { encoding: 'utf8' }));
    } catch {
      break;
    }
  }
  const others = running
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.includes('pgrep'))
    .filter((line) => !mine.has(line.trim().split(/\s+/)[0] ?? ''));
  return others.length === 0
    ? null
    : `another e2e run is on the camera: ${others.map((l) => l.slice(0, 120)).join('; ')}`;
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
  let running = '';
  try {
    running = execFileSync('pgrep', ['-fl', 'real-camera-probe|seek-fw|packages/cli/dist/bin.js'], {
      encoding: 'utf8',
    });
  } catch {
    /* pgrep exits 1 when nothing matches */
  }
  const others = running
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.includes('pgrep'));
  if (others.length > 0) return `another camera client is running: ${others.join('; ')}`;
  return otherCameraRun() ?? takeCameraLock();
}
