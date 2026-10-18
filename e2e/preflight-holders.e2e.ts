/**
 * The camera-holder scan's unit tests (`e2e/lib/preflight.ts`). They need NO hardware and
 * NO environment: the process table is a string written here.
 *
 *   npx vitest run --config e2e/vitest.config.ts preflight-holders.e2e
 *
 * The defect they pin (agent C's finding E, TESTING.md 42.20 §5): the scan matched any
 * process whose command line named the CLI or the repo path, so a shell, a grep or a ps
 * of this session counted as a camera holder and blocked a bench run.
 */

import { describe, expect, it } from 'vitest';

import { ancestorsOf, cameraClientsIn, parsePsRows, type ProcessRow } from './lib/preflight.js';

const REPO = '/Users/someone/things/seek-thermal-firmware-backup/.claude/worktrees/agent-x';
const NODE = '/usr/local/bin/node';
const ELECTRON = `${REPO}/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron`;

/** A small process table: launcher shell -> npm -> vitest main -> its worker, plus others. */
function table(rows: [number, number, string][]): ProcessRow[] {
  return rows.map(([pid, ppid, command]) => ({ pid, ppid, command }));
}

describe('parsePsRows', () => {
  it('reads pid, ppid and the whole command line, and drops lines that are not rows', () => {
    const rows = parsePsRows(
      [
        '  PID  PPID COMMAND',
        '  101     1 /sbin/launchd',
        '  202   101 zsh -c node packages/cli/dist/bin.js info --json',
        '',
      ].join('\n'),
    );
    expect(rows).toEqual([
      { pid: 101, ppid: 1, command: '/sbin/launchd' },
      { pid: 202, ppid: 101, command: 'zsh -c node packages/cli/dist/bin.js info --json' },
    ]);
  });
});

describe('ancestorsOf', () => {
  it('returns this process and every ancestor, and stops at launchd', () => {
    const rows = table([
      [1, 0, '/sbin/launchd'],
      [10, 1, 'zsh'],
      [20, 10, `${NODE} npm exec vitest`],
      [30, 20, `${NODE} vitest run`],
      [40, 30, `${NODE} worker`],
    ]);
    expect([...ancestorsOf(rows, 40)].sort((a, b) => a - b)).toEqual([1, 10, 20, 30, 40]);
  });

  it('survives a cycle in the table', () => {
    const rows = table([
      [5, 6, 'node a'],
      [6, 5, 'node b'],
    ]);
    expect([...ancestorsOf(rows, 5)].sort((a, b) => a - b)).toEqual([5, 6]);
  });
});

describe('cameraClientsIn: the camera-holder scan', () => {
  const CAMERA_CLI = /real-camera-probe|seek-fw|packages\/cli\/dist\/bin\.js/;
  const E2E_RUN = /e2e\/electron\/main\.mjs|camera(-bridge|-restart)?\.e2e/;

  it('does not count a shell whose command names the CLI path (the session that blocked runs)', () => {
    const rows = table([
      [1, 0, '/sbin/launchd'],
      [700, 1, `/bin/zsh -c ls ${REPO}/packages/cli/dist/bin.js && node -e 'x' seek-fw`],
      [701, 700, `grep -n seek-fw ${REPO}/packages/cli/dist/bin.js`],
      [702, 700, `ps -axww -o pid=,ppid=,command=`],
      [703, 700, `pgrep -fl real-camera-probe|seek-fw`],
    ]);
    expect(cameraClientsIn(rows, CAMERA_CLI, 9999)).toEqual([]);
    expect(cameraClientsIn(rows, E2E_RUN, 9999)).toEqual([]);
  });

  it('does not count an editor, tail or cat that names a camera spec', () => {
    const rows = table([
      [1, 0, '/sbin/launchd'],
      [800, 1, `tail -f /tmp/camera.e2e.log`],
      [801, 1, `cat ${REPO}/e2e/electron/main.mjs`],
      [802, 1, `/usr/bin/vim ${REPO}/e2e/camera.e2e.ts`],
    ]);
    expect(cameraClientsIn(rows, E2E_RUN, 9999)).toEqual([]);
  });

  it('counts another run: a vitest worker and an Electron window on the camera spec', () => {
    const rows = table([
      [1, 0, '/sbin/launchd'],
      [
        900,
        1,
        `${NODE} ${REPO}/node_modules/vitest/vitest.mjs run --config e2e/vitest.config.ts camera.e2e`,
      ],
      [901, 900, `${NODE} ${REPO}/node_modules/vitest/dist/workers/forks.js`],
      [902, 1, `${ELECTRON} ${REPO}/e2e/electron/main.mjs`],
    ]);
    const found = cameraClientsIn(rows, E2E_RUN, 9999);
    expect(found).toHaveLength(2);
    expect(found[0]).toMatch(/^900 /);
    expect(found[1]).toMatch(/^902 /);
  });

  it('does not count this run: its own process and its ancestors are excluded', () => {
    const rows = table([
      [1, 0, '/sbin/launchd'],
      [10, 1, `/bin/zsh -c npm run e2e:camera`],
      [20, 10, `${NODE} /x/npm-cli.js run e2e:camera`],
      [
        30,
        20,
        `${NODE} ${REPO}/node_modules/vitest/vitest.mjs run --config e2e/vitest.config.ts camera.e2e`,
      ],
      [40, 30, `${NODE} ${REPO}/node_modules/vitest/dist/workers/forks.js camera.e2e`],
    ]);
    expect(cameraClientsIn(rows, E2E_RUN, 40)).toEqual([]);
  });

  it('counts the CLI and the user probe as clients of the camera, whichever shell started them', () => {
    const rows = table([
      [1, 0, '/sbin/launchd'],
      [50, 1, `${NODE} ${REPO}/packages/cli/dist/bin.js info --json`],
      [60, 1, `${NODE} /Users/someone/x/real-camera-probe.test.ts`],
      [70, 1, `/usr/local/bin/JLinkExe -device LPC4330_M4`],
    ]);
    const found = cameraClientsIn(rows, CAMERA_CLI, 9999);
    expect(found.map((line) => line.split(' ')[0])).toEqual(['50', '60']);
    /* A J-Link is not a CLI or probe match; the camera scan is about Seek clients. */
    expect(found.some((line) => line.startsWith('70 '))).toBe(false);
  });

  it('matches the executable by name, not by a prefix of a longer word', () => {
    const rows = table([
      [1, 0, '/sbin/launchd'],
      [80, 1, `/usr/local/bin/nodemon ${REPO}/packages/cli/dist/bin.js`],
    ]);
    expect(cameraClientsIn(rows, CAMERA_CLI, 9999)).toEqual([]);
  });
});
