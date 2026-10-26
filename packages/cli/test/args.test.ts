import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DEFAULT_DUMP_OPTIONS } from '@seek-fw/core';
import { parseCli } from '../src/cli.js';
import { UsageError, EXIT_USAGE } from '../src/errors.js';
import { usageFor } from '../src/usage.js';

function runOptions(argv: readonly string[]) {
  const parsed = parseCli(argv);
  if (parsed.kind !== 'run') throw new Error(`expected a run, got ${parsed.kind}`);
  return parsed;
}

describe('parseCli', () => {
  it('turns decryption off with --no-decrypt, which a default of true needs', () => {
    /* `decrypt` defaults to true in core, so "only forward what was set"
     * could never express turning it off — the web UI has always had this
     * control and the CLI silently did not. */
    expect(runOptions(['dump']).options.decrypt).toBe(true);
    expect(runOptions(['dump', '--no-decrypt']).options.decrypt).toBe(false);
    expect(runOptions(['dump', '--decrypt']).options.decrypt).toBe(true);
  });

  it('defaults every option that was not given', () => {
    const parsed = runOptions(['dump']);
    expect(parsed.command).toBe('dump');
    expect(parsed.args).toEqual([]);
    expect(parsed.options).toEqual({
      out: null,
      zip: null,
      profile: null,
      chunk: null,
      gapFill: null,
      retries: null,
      retryDelayMs: null,
      recipient: 'auto',
      serial: null,
      json: false,
      quiet: false,
      verbose: false,
      colorFlag: true,
      decrypt: true,
      yes: false,
      probe: true,
      devices: false,
      profiles: false,
      allSelectors: false,
      resume: null,
      fromStep: null,
      printState: null,
      backupOnly: false,
      bank: null,
    });
  });

  it('turns the capability probe off with --no-probe', () => {
    expect(runOptions(['dump']).options.probe).toBe(true);
    expect(runOptions(['dump', '--no-probe']).options.probe).toBe(false);
  });

  it('accepts the whole documented flag surface of dump, without a family pick', () => {
    const parsed = runOptions([
      'dump',
      '--out',
      'out-dir',
      '--zip',
      'out.zip',
      '--all-selectors',
      '--chunk',
      '256',
      '--gap-fill',
      '0x00',
      '--retries',
      '5',
      '--retry-delay',
      '1500',
      '--recipient',
      'device',
      '--serial',
      'ABC123',
      '--no-decrypt',
      '--json',
      '--quiet',
      '--no-color',
    ]);
    expect(parsed.options).toMatchObject({
      out: 'out-dir',
      zip: 'out.zip',
      allSelectors: true,
      chunk: 256,
      gapFill: 0,
      retries: 5,
      retryDelayMs: 1500,
      recipient: 'device',
      serial: 'ABC123',
      decrypt: false,
      json: true,
      quiet: true,
      colorFlag: false,
    });
  });

  it('takes --profile on the commands that still name a family, and nowhere else', () => {
    expect(runOptions(['info', '--profile', 'modern-4x']).options.profile).toBe('modern-4x');
    expect(
      runOptions(['decrypt', 'file', 'a.bin', '--profile', 'compact-2016']).options.profile,
    ).toBe('compact-2016');
    expect(runOptions(['slots', 'list', '--profile', 'modern-4x']).options.profile).toBe(
      'modern-4x',
    );
  });

  it('takes the preserve options, the backup-only step and the zip', () => {
    const parsed = runOptions(['preserve', '--backup-only', '--zip', 'run.zip', '--out', 'run']);
    expect(parsed.options).toMatchObject({ backupOnly: true, zip: 'run.zip', out: 'run' });
    expect(
      runOptions(['preserve', '--resume', 'run', '--from-step', 'drain']).options,
    ).toMatchObject({
      resume: 'run',
      fromStep: 'drain',
    });
    expect(runOptions(['preserve', '--print-state', 'run']).options.printState).toBe('run');
    for (const bank of ['next-start', 'a', 'b', 'r', 'all'] as const) {
      expect(runOptions(['preserve', '--bank', bank]).options.bank).toBe(bank);
    }
    expect(runOptions(['preserve']).options.bank).toBeNull();
  });

  it('reads the info listings', () => {
    expect(runOptions(['info', '--devices']).options.devices).toBe(true);
    expect(runOptions(['info', '--profiles']).options.profiles).toBe(true);
  });

  it('reads the decrypt form and its file, and no others', () => {
    expect(runOptions(['decrypt', 'file', 'flash.bin']).args).toEqual(['file', 'flash.bin']);
    expect(runOptions(['decrypt', 'slot', 'slot-a.bin']).args).toEqual(['slot', 'slot-a.bin']);
  });

  it('parses hex and decimal numbers', () => {
    expect(runOptions(['dump', '--gap-fill', '255']).options.gapFill).toBe(0xff);
    expect(runOptions(['dump', '--gap-fill', '0xff']).options.gapFill).toBe(0xff);
    expect(runOptions(['dump', '--chunk', '0x40']).options.chunk).toBe(64);
  });

  it('returns help and version without running anything', () => {
    expect(parseCli(['--help'])).toEqual({ kind: 'help', command: null, json: false });
    expect(parseCli(['-h'])).toEqual({ kind: 'help', command: null, json: false });
    expect(parseCli(['dump', '--help'])).toEqual({ kind: 'help', command: 'dump', json: false });
    expect(parseCli(['-V'])).toEqual({ kind: 'version', json: false });
    expect(parseCli(['--version'])).toEqual({ kind: 'version', json: false });
  });

  it('answers --help even when the command line names a flag the command does not take', () => {
    expect(parseCli(['dump', '--profile', 'modern-4x', '--help'])).toEqual({
      kind: 'help',
      command: 'dump',
      json: false,
    });
  });

  it('carries --json through to help and version', () => {
    expect(parseCli(['--help', '--json'])).toEqual({ kind: 'help', command: null, json: true });
    expect(parseCli(['dump', '--help', '--json'])).toEqual({
      kind: 'help',
      command: 'dump',
      json: true,
    });
    expect(parseCli(['--version', '--json'])).toEqual({ kind: 'version', json: true });
  });

  it.each([
    [['bogus'], /unknown command 'bogus'/],
    [[], /no command/],
    [['dump', '--nope'], /Unknown option/],
    [['dump', 'extra'], /unexpected argument 'extra' after 'dump'/],
    [['info', 'extra'], /unexpected argument 'extra' after 'info'/],
    [['preserve', 'run'], /unexpected argument 'run' after 'preserve'/],
    [['dump', '--recipient', 'sideways'], /--recipient must be one of/],
    [['dump', '--chunk', 'lots'], /--chunk expects a number/],
    [['dump', '--chunk', '0'], /--chunk must be between/],
    [['dump', '--chunk', '65537'], /--chunk must be between/],
    [['dump', '--gap-fill', '256'], /--gap-fill must be between/],
    [['dump', '--retries=-1'], /--retries expects a number/],
    [['dump', '--retry-delay', '1.5'], /--retry-delay expects a number/],
    [['dump', '--quiet', '--verbose'], /contradict/],
    [['info', '--profile', 'nope'], /unknown profile 'nope'/],
    [['info', '--devices', '--profiles'], /--devices and --profiles each list something/],
  ])('rejects %j', (argv, message) => {
    expect(() => parseCli(argv)).toThrow(UsageError);
    expect(() => parseCli(argv)).toThrow(message);
  });

  it('names the known profiles when --profile is wrong', () => {
    try {
      parseCli(['info', '--profile', 'nope']);
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(UsageError);
      expect((error as UsageError).hint).toContain('info --profiles');
      expect((error as UsageError).exitCode).toBe(EXIT_USAGE);
    }
  });
});

/* ==================================================================== *
 * The removed names and the old forms are refused, not translated.
 * ==================================================================== */

describe('removed command names and old forms', () => {
  it.each(['flash', 'sweep', 'devices', 'profiles'])(
    "rejects the removed command '%s' as unknown, with exit 2",
    (name) => {
      expect(() => parseCli([name])).toThrow(UsageError);
      expect(() => parseCli([name])).toThrow(`unknown command '${name}'`);
    },
  );

  it('rejects `decrypt <file>` without the form word, and says what to write instead', () => {
    expect(() => parseCli(['decrypt', 'flash_4m.bin'])).toThrow(
      "decrypt takes 'file' or 'slot', got 'flash_4m.bin'",
    );
    try {
      parseCli(['decrypt', 'flash_4m.bin']);
      expect.unreachable('should have thrown');
    } catch (error) {
      expect((error as UsageError).hint).toContain('seek-fw decrypt file flash_4m.bin');
    }
  });

  it('rejects `decrypt file` and `decrypt slot` with no path, and with a second path', () => {
    expect(() => parseCli(['decrypt'])).toThrow(/decrypt needs a form/);
    expect(() => parseCli(['decrypt', 'file'])).toThrow(/decrypt file needs a file argument/);
    expect(() => parseCli(['decrypt', 'slot'])).toThrow(/decrypt slot needs a file argument/);
    expect(() => parseCli(['decrypt', 'file', 'a.bin', 'b.bin'])).toThrow(
      "unexpected argument 'b.bin' after 'decrypt file'",
    );
  });

  it('rejects a flag on a command that does not take it, and says which command does', () => {
    expect(() => parseCli(['dump', '--profile', 'modern-4x'])).toThrow(
      "--profile does not apply to 'dump'",
    );
    expect(() => parseCli(['dump', '--devices'])).toThrow("--devices does not apply to 'dump'");
    expect(() => parseCli(['dump', '--backup-only'])).toThrow(
      "--backup-only does not apply to 'dump'",
    );
    expect(() => parseCli(['info', '--out', 'x'])).toThrow("--out does not apply to 'info'");
    expect(() => parseCli(['info', '--all-selectors'])).toThrow(
      "--all-selectors does not apply to 'info'",
    );
    expect(() => parseCli(['decrypt', 'file', 'a.bin', '--serial', 'X'])).toThrow(
      "--serial does not apply to 'decrypt'",
    );
    expect(() => parseCli(['preserve', '--no-decrypt'])).toThrow(
      "--no-decrypt does not apply to 'preserve'",
    );
    expect(() => parseCli(['dump', '--no-verify'])).toThrow("--no-verify does not apply to 'dump'");
    expect(() => parseCli(['slots', 'list', '--chunk', '64'])).toThrow(
      "--chunk does not apply to 'slots'",
    );
  });

  it('refuses a refused flag with exit 2 and the help hint', () => {
    try {
      parseCli(['dump', '--profile', 'modern-4x']);
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(UsageError);
      expect((error as UsageError).exitCode).toBe(EXIT_USAGE);
      expect((error as UsageError).hint).toContain('seek-fw dump --help');
    }
  });

  it('accepts a flag that names its own command, including --no- forms', () => {
    expect(() => parseCli(['dump', '--no-probe', '--all-selectors'])).not.toThrow();
    expect(() => parseCli(['slots', 'flash', 'b', 'image.bin', '--no-verify'])).not.toThrow();
    expect(() => parseCli(['preserve', '--backup-only', '--zip', 'r.zip'])).not.toThrow();
  });
});

/**
 * The help text spells the defaults out for a reader; core owns them. A copy that drifts is worse
 * than no documentation at all, so it is pinned against the values themselves rather than against
 * another copy of them.
 */
describe('documented defaults', () => {
  function documentedDefault(flag: string, text: string): number {
    const line = text.split('\n').find((l) => l.trimStart().startsWith(`--${flag} `));
    if (line === undefined) throw new Error(`the help text does not mention --${flag}`);
    const match = /\(default (0x[0-9a-f]+|\d+)\)/.exec(line);
    if (match?.[1] === undefined) throw new Error(`--${flag} documents no default: ${line}`);
    return Number(match[1]);
  }

  it("match core's DEFAULT_DUMP_OPTIONS in the help of dump", () => {
    const text = usageFor('dump');
    expect(documentedDefault('chunk', text)).toBe(DEFAULT_DUMP_OPTIONS.chunk);
    expect(documentedDefault('gap-fill', text)).toBe(DEFAULT_DUMP_OPTIONS.gapFill);
    expect(documentedDefault('retries', text)).toBe(DEFAULT_DUMP_OPTIONS.retries);
    expect(documentedDefault('retry-delay', text)).toBe(DEFAULT_DUMP_OPTIONS.retryDelayMs);
  });

  it('the README is not a third copy that can drift', () => {
    /* The same four numbers are written out a third time, for people who never run --help. An
     * audit found the README had already drifted on other points; this is the cheap way to stop it
     * drifting on these. */
    const readme = readFileSync(new URL('../../../README.md', import.meta.url), 'utf8');
    expect(documentedDefault('chunk', readme)).toBe(DEFAULT_DUMP_OPTIONS.chunk);
    expect(documentedDefault('gap-fill', readme)).toBe(DEFAULT_DUMP_OPTIONS.gapFill);
    expect(documentedDefault('retries', readme)).toBe(DEFAULT_DUMP_OPTIONS.retries);
    expect(documentedDefault('retry-delay', readme)).toBe(DEFAULT_DUMP_OPTIONS.retryDelayMs);
  });
});
