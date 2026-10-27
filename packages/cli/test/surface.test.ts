/**
 * The command surface, end to end through `run()`: one command per tab of the web app, the removed
 * names refused as unknown commands, the flags a command does not take refused before anything runs,
 * and each listing reachable without a camera.
 *
 * Nothing here opens a camera. A command that tried would reach the backend below, which fails the
 * test by name.
 */

import { describe, expect, it } from 'vitest';
import { run } from '../src/cli.js';
import { EXIT_FAILED, EXIT_OK, EXIT_USAGE } from '../src/errors.js';
import { COMMAND_NAMES, MAIN_USAGE, usageFor, type CommandName } from '../src/usage.js';
import { fixedBackend, testIo } from './helpers.js';

function signal(): AbortSignal {
  return new AbortController().signal;
}

/** An `Io` whose backend fails the test if anything reaches for a camera. */
function noCameraIo(overrides: Parameters<typeof testIo>[0] = {}): ReturnType<typeof testIo> {
  return testIo({
    backend: () => {
      throw new Error('no camera may be opened by this command');
    },
    ...overrides,
  });
}

const TABS: readonly { readonly tab: string; readonly command: CommandName }[] = [
  { tab: 'Info', command: 'info' },
  { tab: 'Dump & decrypt 0.x/1.x 2014/2016', command: 'preserve' },
  { tab: 'Dump & decrypt 4.x/Nano', command: 'dump' },
  { tab: 'Decrypt File/Slot', command: 'decrypt' },
  { tab: 'Work with firmware slots', command: 'slots' },
];

describe('the command set mirrors the web tabs', () => {
  it('has exactly one command for each tab, and no other', () => {
    expect([...COMMAND_NAMES]).toEqual(TABS.map((row) => row.command));
  });

  it('the main help names every tab, in the order the web app shows them', () => {
    let at = -1;
    for (const row of TABS) {
      const index = MAIN_USAGE.indexOf(row.tab);
      expect(index, row.tab).toBeGreaterThan(at);
      at = index;
    }
  });

  it('the main help lists no removed command', () => {
    for (const name of ['flash', 'sweep', 'devices', 'profiles']) {
      expect(MAIN_USAGE).not.toMatch(new RegExp(`^  ${name}\\b`, 'm'));
    }
  });

  it('every command help opens by naming the tab it is, and the main help lists each command', () => {
    for (const row of TABS) {
      expect(usageFor(row.command).split('\n')[0], row.command).toContain('tab');
      expect(MAIN_USAGE, row.command).toContain(row.command);
    }
  });
});

describe('removed names are unknown commands', () => {
  it.each(['flash', 'sweep', 'devices', 'profiles'])(
    "'%s' exits 2 with the usage on stderr and nothing on stdout",
    async (name) => {
      const { io, stdout, stderr } = noCameraIo();
      const code = await run([name], io, signal());
      expect(code).toBe(EXIT_USAGE);
      expect(stdout.text).toBe('');
      expect(stderr.text).toContain(`error: unknown command '${name}'`);
      expect(stderr.text).toContain('seek-fw <command> [options]');
    },
  );

  it("'flash' under --json is one usage document, and the process reaches no camera", async () => {
    const { io, stdout, stderr } = noCameraIo();
    const code = await run(['flash', 'image.bin', '--json'], io, signal());
    expect(code).toBe(EXIT_USAGE);
    expect(JSON.parse(stdout.text)).toMatchObject({
      command: null,
      ok: false,
      error: { code: 'cli/usage', message: "unknown command 'flash'" },
    });
    expect(stderr.text).toContain('error: unknown command');
  });

  it('the old `decrypt <file>` form is refused, not read as `decrypt file <file>`', async () => {
    const { io, stderr } = noCameraIo();
    const code = await run(['decrypt', 'flash_4m.bin'], io, signal());
    expect(code).toBe(EXIT_USAGE);
    expect(stderr.text).toContain("decrypt takes 'file' or 'slot', got 'flash_4m.bin'");
  });

  it('`sweep` is not a command: its flag lives on dump, and dump names it', async () => {
    const { io, stderr } = noCameraIo();
    expect(await run(['sweep'], io, signal())).toBe(EXIT_USAGE);
    expect(stderr.text).toContain("unknown command 'sweep'");
    expect(usageFor('dump')).toContain('--all-selectors');
  });
});

describe('slots restore says what it takes, as the page does', () => {
  it('a .bin or a .zip: the three ZIPs that hold the whole flash, by their file names', () => {
    const text = usageFor('slots').replace(/\s+/g, ' ');
    expect(text).toContain('write one bank as a full flash backup holds it, a .bin or a .zip');
    for (const name of [
      'preserve_dump_original.bin',
      'flash_dump_original.bin',
      'flash_dump_all_selectors.bin',
    ]) {
      expect(text).toContain(name);
    }
    expect(text).not.toContain('preserve_dump_patched.bin');
  });
});

describe('a flag a command does not take is refused, before anything runs', () => {
  it.each([
    [['dump', '--family', 'modern-4x'], "--family does not apply to 'dump'"],
    [['dump', '--all-selectors', '--family', 'generic'], "--family does not apply to 'dump'"],
    [['info', '--out', 'x'], "--out does not apply to 'info'"],
    [['preserve', '--all-selectors'], "--all-selectors does not apply to 'preserve'"],
    [['dump', '--backup-only'], "--backup-only does not apply to 'dump'"],
    [['decrypt', 'slot', 'a.bin', '--serial', 'X'], "--serial does not apply to 'decrypt'"],
    [['slots', 'list', '--chunk', '64'], "--chunk does not apply to 'slots'"],
  ])('%j exits 2: %s', async (argv, message) => {
    const { io, stdout, stderr } = noCameraIo();
    const code = await run(argv, io, signal());
    expect(code).toBe(EXIT_USAGE);
    expect(stdout.text).toBe('');
    expect(stderr.text).toContain(message);
  });
});

describe('the listings in info need no camera', () => {
  it('--families lists every family this build knows, and exits 0', async () => {
    const { io, stdout } = noCameraIo();
    expect(await run(['info', '--families'], io, signal())).toBe(EXIT_OK);
    for (const id of ['modern-4x', 'legacy-auth', 'early-compact', 'compact-2016', 'generic']) {
      expect(stdout.text).toContain(`${id}: `);
    }
    /* The page's words, not the capability keys; "sweep" is a removed name. */
    expect(stdout.text).toMatch(/^id +name on the page +bank writes$/m);
    expect(stdout.text).not.toMatch(/sweep|deviceInfo/);
    expect(stdout.text).toContain('read by: the Dump & decrypt 4.x/Nano tab and `seek-fw dump`');
    expect(stdout.text).toContain(
      'read by: the preservation run on the Dump & decrypt 0.x/1.x 2014/2016 tab (`seek-fw preserve`)',
    );
    expect(stdout.text).toContain('refuses dump and Dump all selectors: ');
    /* compact-2016's banks are written on the slots tab (TESTING.md 42.85), and the listing says so. */
    expect(stdout.text).toMatch(/^compact-2016 +2016 Compact Pro +yes$/m);
    expect(stdout.text).toMatch(/^early-compact +Early Compact \(pre-0\.8\) +no$/m);
  });

  it('--families --json says the same as the table, under the same names', async () => {
    const { io, stdout } = noCameraIo();
    expect(await run(['info', '--families', '--json'], io, signal())).toBe(EXIT_OK);
    const document = JSON.parse(stdout.text) as {
      command: string;
      families: {
        id: string;
        readBy: string;
        bankWrites: { allowed: boolean; reason: string | null };
        stored: string;
        refuses: { operation: string; reason: string }[];
        allSelectorsRange: number[];
      }[];
    };
    expect(document.command).toBe('info');
    const byId = new Map(document.families.map((family) => [family.id, family]));
    expect([...byId.keys()]).toContain('modern-4x');
    expect(
      Object.fromEntries([...byId].map(([id, family]) => [id, family.bankWrites.allowed])),
    ).toEqual({
      'modern-4x': true,
      'legacy-auth': true,
      'compact-2016': true,
      'early-compact': false,
      generic: false,
    });
    expect(byId.get('modern-4x')?.readBy).toBe(
      'the Dump & decrypt 4.x/Nano tab and `seek-fw dump`',
    );
    expect(byId.get('legacy-auth')?.stored).toMatch(/^plain: no key/);
    expect(byId.get('early-compact')?.refuses.map((refusal) => refusal.operation)).toEqual([
      'dump',
      'allSelectors',
    ]);
    expect(stdout.text).not.toMatch(/sweep|"capabilities"|deviceInfo/);
  });

  it('--devices says so and exits 0 when no camera is attached', async () => {
    const { io, stdout } = testIo({ backend: fixedBackend([]) });
    expect(await run(['info', '--devices'], io, signal())).toBe(EXIT_OK);
    expect(stdout.text).toContain('no Seek camera found');
  });

  it('--devices and --families together are a usage error', async () => {
    const { io, stderr } = noCameraIo();
    expect(await run(['info', '--devices', '--families'], io, signal())).toBe(EXIT_USAGE);
    expect(stderr.text).toContain('each list something');
  });
});

describe('the exit codes of the commands that take a subcommand or a form', () => {
  it('decrypt with no form is a usage error, exit 2', async () => {
    const { io, stderr } = noCameraIo();
    expect(await run(['decrypt'], io, signal())).toBe(EXIT_USAGE);
    expect(stderr.text).toContain('decrypt needs a form');
  });

  it('decrypt file with a missing dump is a failure to read, exit 1, not a usage error', async () => {
    const { io, stderr } = noCameraIo();
    expect(await run(['decrypt', 'file', '/nonexistent/nope.bin'], io, signal())).toBe(EXIT_FAILED);
    expect(stderr.text).toContain('could not read');
  });

  it('slots with no subcommand is a usage error, exit 2, with the slots usage', async () => {
    const { io, stderr } = noCameraIo();
    expect(await run(['slots'], io, signal())).toBe(EXIT_USAGE);
    expect(stderr.text).toContain('slots needs a subcommand');
  });
});
