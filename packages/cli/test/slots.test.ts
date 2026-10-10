/**
 * `seek-fw slots`, offline.
 *
 * Nothing here touches a camera or USB. The four core calls behind the command are replaced by
 * fakes (`SlotOps`), and the device session is core's fake transport. So what runs for real is
 * everything the CLI owns: argument parsing, every refusal, the plan and read-back as shown, the
 * file names a dump writes, and the exit codes. The fakes report what core would report; they
 * decide nothing that core decides.
 */

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  keyFilenameSuffix,
  type DeviceState,
  type DumpedSlot,
  type FlashSlotOptions,
  type FlashSlotResult,
  type ImageHeader,
  type SlotEntry,
  type SlotFlashPlan,
  type SlotInputKind,
  type SlotKey,
  type SlotState,
  type SlotView,
  type SlotsReport,
  type Support,
  type UsbBackend,
} from '@seek-fw/core';
import { parseCli, run, type CommandContext } from '../src/cli.js';
import { CliError, EXIT_FAILED, EXIT_OK, EXIT_USAGE, UsageError } from '../src/errors.js';
import {
  bootRisk,
  dumpArtifacts,
  dumpRefusal,
  findView,
  flashPlanLines,
  flashQuestion,
  flashRefusal,
  listLines,
  listResult,
  parseBank,
  parseSlotsArgs,
  readBackLines,
  safeVersion,
  slotsCommandWith,
  type SlotOps,
} from '../src/commands/slots.js';
import { TerminalReporter } from '../src/reporter.js';
import {
  buildPlainImage,
  cameraWithFlash,
  buildSyntheticFlash,
  FOREIGN_KEY_A,
  FOREIGN_KEY_B,
  fixedBackend,
  KEY_A,
  KEY_B,
  tempDir,
  testIo,
  type TestIo,
} from './helpers.js';

/* ==================================================================== *
 * Fakes: the device analysis and the bank plan, as core reports them
 * ==================================================================== */

const SUPPORTED: Support = { supported: true };
const UNSUPPORTED = (reason: string): Support => ({ supported: false, reason });

const ADDRESS: Record<SlotKey, number> = { a: 0x14050000, b: 0x14060000, r: 0x14070000 };
const NO_FLAGS = { raw: false, acknowledgeRisk: false, verify: true, dryRun: false } as const;

function slotEntry(key: SlotKey, overrides: Partial<SlotEntry> = {}): SlotEntry {
  return {
    key,
    name: `slot ${key.toUpperCase()}`,
    address: ADDRESS[key],
    length: 0x10000,
    read: null,
    write: null,
    dump: SUPPORTED,
    flashPlain: SUPPORTED,
    flashRaw: SUPPORTED,
    staging: 'key-a-ciphertext',
    commitEffect: 'bank-only',
    notes: [],
    ...overrides,
  };
}

function headerFake(version: string, length: number): ImageHeader {
  const partial: Pick<ImageHeader, 'versionStr' | 'length'> = { versionStr: version, length };
  return partial as ImageHeader;
}

/*
 * The fakes below are typed as a Pick of the real type and then narrowed. Only the fields the
 * slot command reads are built, so the rest of DeviceState / SlotState is not invented here.
 */
function deviceStateFake(serial: string | null = 'SN-1'): DeviceState {
  const partial: Pick<DeviceState, 'description' | 'serial'> = {
    description: {
      vendorId: 0x289d,
      productId: 0x0001,
      productName: 'Seek Compact PRO',
      manufacturerName: 'Seek Thermal',
      serialNumber: serial,
    },
    serial,
  };
  return partial as DeviceState;
}

function slotStateFake(key: SlotKey, bootable: boolean): SlotState {
  const partial: Pick<
    SlotState,
    'key' | 'header' | 'plainHeader' | 'keyName' | 'bootable' | 'bootability' | 'sha256'
  > = {
    key,
    header: headerFake('4.9.5.0', 0x1000),
    plainHeader: headerFake('4.9.5.0', 0x1000),
    keyName: 'Key A',
    bootable,
    bootability: bootable ? 'bootable' : 'not-bootable',
    sha256: 'deadbeef'.repeat(8),
  };
  return partial as SlotState;
}

interface ReportOptions {
  /** The bank the bootloader boots now. null means the camera reports none. */
  readonly booted?: SlotKey | null;
  readonly build?: Support;
  readonly entries?: Partial<Record<SlotKey, Partial<SlotEntry>>>;
  /** A bank whose read failed. */
  readonly unread?: SlotKey;
}

function reportOf(options: ReportOptions = {}): SlotsReport {
  const booted = options.booted === undefined ? 'a' : options.booted;
  const keys: readonly SlotKey[] = ['a', 'b', 'r'];
  const entries = keys.map((key) => slotEntry(key, options.entries?.[key] ?? {}));
  const slots: SlotView[] = entries.map((entry) => {
    const unread = entry.key === options.unread;
    return {
      entry,
      state: unread ? null : slotStateFake(entry.key, entry.key !== 'b'),
      unreadReason: unread ? 'the window would not arm' : null,
      active: entry.key === booted,
    };
  });
  return {
    state: deviceStateFake(),
    plan: {
      profileId: 'modern-4x',
      firmwareVersion: '4.9.5.0',
      supportedBuild: options.build ?? SUPPORTED,
      slots: entries,
      notes: ['fixture build'],
    },
    slots,
  };
}

function view(report: SlotsReport, key: SlotKey): SlotView {
  const found = findView(report, key);
  if (found === null) throw new Error(`fixture has no bank ${key}`);
  return found;
}

function fakeDumped(key: SlotKey, decrypts: boolean): DumpedSlot {
  return {
    key,
    address: ADDRESS[key],
    raw: new Uint8Array(0x10000).fill(0xab),
    sha256: 'deadbeef'.repeat(8),
    plain: decrypts ? new Uint8Array(0x1000).fill(0x01) : null,
    plainSha256: decrypts ? 'feedface'.repeat(8) : null,
    notes: [],
  };
}

function fakePlan(key: SlotKey, kind: SlotInputKind, bytes: Uint8Array): SlotFlashPlan {
  return {
    key,
    address: ADDRESS[key],
    kind,
    staging: kind === 'raw' ? 'verbatim' : 'key-a-ciphertext',
    payload: bytes,
    sum16: 0x1234,
    expectedStored: bytes,
    compare: [{ field: 'version', before: '4.9.5.0', after: '4.9.6.0' }],
    warnings: kind === 'raw' ? ['raw bytes are sent verbatim; nothing checks their content'] : [],
    serial: 'SN-1',
    firmwareVersion: '4.9.5.0',
  };
}

interface OpsLog {
  inspected: number;
  dumped: SlotKey[];
  prepared: { key: SlotKey; kind: SlotInputKind; fileName: string; bytes: Uint8Array }[];
  flashed: { key: SlotKey; options: FlashSlotOptions }[];
}

/** Core's four calls, faked. The log says what the command asked for. */
function fakeOps(
  report: SlotsReport,
  behaviour: { readonly verified?: boolean | null; readonly decrypts?: boolean } = {},
): { readonly ops: SlotOps; readonly log: OpsLog } {
  const log: OpsLog = { inspected: 0, dumped: [], prepared: [], flashed: [] };
  const verified = behaviour.verified === undefined ? true : behaviour.verified;
  const ops: SlotOps = {
    inspect: () => {
      log.inspected += 1;
      return Promise.resolve(report);
    },
    dump: (_ctx, _report, key) => {
      log.dumped.push(key);
      return Promise.resolve(fakeDumped(key, behaviour.decrypts ?? true));
    },
    prepare: (_report, key, input) => {
      log.prepared.push({ key, kind: input.kind, fileName: input.fileName, bytes: input.bytes });
      return fakePlan(key, input.kind, input.bytes);
    },
    flash: (_ctx, _report, plan, options) => {
      log.flashed.push({ key: plan.key, options });
      const result: FlashSlotResult = {
        key: plan.key,
        commitStatus: 0,
        verified: options.verify === false ? null : verified,
        after: options.verify === false ? null : plan.payload,
        notes: [],
      };
      return Promise.resolve(result);
    },
  };
  return { ops, log };
}

/* ==================================================================== *
 * Contexts and backends
 * ==================================================================== */

/** The context `run` would build, for a command under test with the given core calls. */
function contextFor(argv: readonly string[], test: TestIo): CommandContext {
  const parsed = parseCli(argv);
  if (parsed.kind !== 'run') throw new Error(`expected a run, got ${parsed.kind}`);
  const reporter = new TerminalReporter({
    log: test.stdout,
    progress: test.stderr,
    color: false,
    quiet: parsed.options.quiet,
    verbose: parsed.options.verbose,
  });
  return {
    options: parsed.options,
    file: parsed.file,
    args: parsed.args,
    slotFlags: parsed.slotFlags,
    reporter,
    io: test.io,
    signal: new AbortController().signal,
    human: !parsed.options.json,
    color: false,
    out(text: string): void {
      if (!parsed.options.quiet) reporter.write(text);
    },
  };
}

type TestIoOverrides = NonNullable<Parameters<typeof testIo>[0]>;

/**
 * A fake camera on the bench: enough for a session. The command under test is handed fake core
 * calls, so the camera is only ever opened, never asked for a bank.
 */
function cameraIo(overrides: TestIoOverrides = {}): TestIo {
  return testIo({
    backend: fixedBackend([cameraWithFlash(buildSyntheticFlash().flash)]),
    ...overrides,
  });
}

/** A backend that records whether anything reached for a camera. It has none to give. */
function recordingBackend(): {
  readonly backend: () => UsbBackend;
  readonly touched: { count: number };
} {
  const touched = { count: 0 };
  const refuse = (): Promise<never> =>
    Promise.reject(new Error('test backend: no camera is attached in this test'));
  const backend = (): UsbBackend => {
    touched.count += 1;
    return { listDevices: refuse, requestDevice: refuse };
  };
  return { backend, touched };
}

/* ==================================================================== *
 * Arguments
 * ==================================================================== */

describe('parseSlotsArgs', () => {
  it('reads list, dump and flash, with the bank as a letter of either case', () => {
    expect(parseSlotsArgs(['list'], NO_FLAGS)).toEqual({ action: 'list' });
    expect(parseSlotsArgs(['dump', 'A'], NO_FLAGS)).toEqual({ action: 'dump', key: 'a' });
    expect(parseSlotsArgs(['flash', 'r', 'image.bin'], NO_FLAGS)).toEqual({
      action: 'flash',
      key: 'r',
      file: 'image.bin',
      kind: 'plain',
    });
  });

  it('flashes a raw payload when --raw is given, and a decrypted image otherwise', () => {
    const raw = { raw: true, acknowledgeRisk: false, verify: true, dryRun: false };
    expect(parseSlotsArgs(['flash', 'b', 'x.bin'], raw)).toMatchObject({ kind: 'raw' });
    expect(parseSlotsArgs(['flash', 'b', 'x.bin'], NO_FLAGS)).toMatchObject({ kind: 'plain' });
  });

  it.each([
    [[], /needs a subcommand/],
    [['bogus'], /unknown slots subcommand 'bogus'/],
    [['dump'], /slots dump needs a bank/],
    [['dump', 'z'], /bank must be a, b or r, got 'z'/],
    [['flash'], /needs a bank and an image/],
    [['flash', 'a'], /needs an image file after the bank/],
    [['list', 'extra'], /unexpected argument 'extra' after 'slots list'/],
    [['dump', 'a', 'extra'], /unexpected argument 'extra' after 'slots dump'/],
    [['flash', 'a', 'x.bin', 'extra'], /unexpected argument 'extra' after 'slots flash'/],
  ])('rejects %j', (args, message) => {
    expect(() => parseSlotsArgs(args, NO_FLAGS)).toThrow(UsageError);
    expect(() => parseSlotsArgs(args, NO_FLAGS)).toThrow(message);
  });

  it.each([
    [['list'], { raw: true, acknowledgeRisk: false, verify: true, dryRun: false }],
    [['list'], { raw: false, acknowledgeRisk: true, verify: true, dryRun: false }],
    [['dump', 'a'], { raw: false, acknowledgeRisk: false, verify: false, dryRun: false }],
  ])('refuses the flash-only flags on %j', (args, flags) => {
    expect(() => parseSlotsArgs(args, flags)).toThrow(/applies only to 'slots flash'/);
  });

  it('refuses a bank that is not a, b or r', () => {
    expect(parseBank('B')).toBe('b');
    expect(() => parseBank('0x14050000')).toThrow(UsageError);
  });
});

describe('parseCli for slots', () => {
  it('carries every positional and the slot flags through to the command', () => {
    const parsed = parseCli([
      'slots',
      'flash',
      'r',
      'image.bin',
      '--raw',
      '--acknowledge-risk',
      '--no-verify',
      '--yes',
    ]);
    expect(parsed).toMatchObject({
      kind: 'run',
      command: 'slots',
      file: null,
      args: ['flash', 'r', 'image.bin'],
      slotFlags: { raw: true, acknowledgeRisk: true, verify: false, dryRun: false },
    });
    if (parsed.kind !== 'run') throw new Error('expected a run');
    expect(parsed.options.yes).toBe(true);
  });

  it('defaults the slot flags to "none given", with verification on', () => {
    const parsed = parseCli(['slots', 'list']);
    if (parsed.kind !== 'run') throw new Error('expected a run');
    expect(parsed.slotFlags).toEqual({
      raw: false,
      acknowledgeRisk: false,
      verify: true,
      dryRun: false,
    });
    expect(parsed.args).toEqual(['list']);
  });

  it('takes --out for a dump', () => {
    const parsed = parseCli(['slots', 'dump', 'a', '--out', 'somewhere']);
    if (parsed.kind !== 'run') throw new Error('expected a run');
    expect(parsed.options.out).toBe('somewhere');
  });

  it('still refuses extra positionals and missing files on the other commands', () => {
    expect(() => parseCli(['info', 'extra'])).toThrow(/unexpected argument 'extra'/);
    expect(() => parseCli(['dump', 'extra'])).toThrow(/unexpected argument 'extra'/);
    expect(() => parseCli(['decrypt'])).toThrow(/needs a file argument/);
    expect(() => parseCli(['flash'])).toThrow(/needs a file argument/);
  });
});

/* ==================================================================== *
 * Refusals, decided before anything is sent
 * ==================================================================== */

describe('refusals', () => {
  it('refuses to flash the bank the camera boots now, without the acknowledgement', () => {
    const report = reportOf({ booted: 'a' });
    const refusal = flashRefusal(report, 'a', 'plain', false);
    expect(refusal?.message).toMatch(/refusing to write bank A: .*boots now/);
    expect(refusal?.hint).toContain('--acknowledge-risk');
    expect(refusal?.hint).toContain('Nothing was sent');
  });

  it('allows that same write once the acknowledgement is given', () => {
    expect(flashRefusal(reportOf({ booted: 'a' }), 'a', 'plain', true)).toBeNull();
  });

  it('refuses the recovery bank without the acknowledgement, even when it is not booted', () => {
    const report = reportOf({ booted: 'a' });
    expect(flashRefusal(report, 'r', 'plain', false)?.message).toMatch(/bank R is the recovery/);
    expect(flashRefusal(report, 'r', 'raw', true)).toBeNull();
  });

  it('refuses a write when the camera reports no booted bank, and says why', () => {
    const report = reportOf({ booted: null });
    const refusal = flashRefusal(report, 'b', 'plain', false);
    expect(refusal?.message).toMatch(/booted bank could not be determined/);
    expect(flashRefusal(report, 'b', 'plain', true)).toBeNull();
  });

  it('allows a write to the bank the camera does not boot', () => {
    expect(flashRefusal(reportOf({ booted: 'a' }), 'b', 'plain', false)).toBeNull();
    expect(bootRisk(reportOf({ booted: 'a' }), view(reportOf({ booted: 'a' }), 'b'))).toBeNull();
  });

  it('refuses a raw write where the build does not take raw bytes, and names the reason', () => {
    const report = reportOf({
      entries: { b: { flashRaw: UNSUPPORTED('no staging path for raw bytes') } },
    });
    const refusal = flashRefusal(report, 'b', 'raw', false);
    expect(refusal?.message).toContain('does not take raw bytes');
    expect(refusal?.message).toContain('no staging path for raw bytes');
    expect(flashRefusal(report, 'b', 'plain', false)).toBeNull();
  });

  it('refuses a bank that was not read: nothing is written on the strength of a failed read', () => {
    const refusal = flashRefusal(reportOf({ booted: 'a', unread: 'b' }), 'b', 'plain', false);
    expect(refusal?.message).toContain('was not read');
  });

  it('refuses every operation on a build the slot page does not cover', () => {
    const report = reportOf({ build: UNSUPPORTED('builds before 0.8.0.0 are out of scope') });
    expect(flashRefusal(report, 'b', 'plain', true)?.message).toContain(
      'builds before 0.8.0.0 are out of scope',
    );
    expect(dumpRefusal(report, 'b')?.message).toContain('not supported by slots');
  });

  it('refuses a dump the build cannot read, and allows one it can', () => {
    const report = reportOf({ entries: { r: { dump: UNSUPPORTED('no read window') } } });
    expect(dumpRefusal(report, 'r')?.message).toContain('no read window');
    expect(dumpRefusal(report, 'a')).toBeNull();
  });
});

/* ==================================================================== *
 * list: what a person reads
 * ==================================================================== */

describe('slots list', () => {
  it('shows the camera, every bank, and what each one can take', () => {
    const text = listLines(reportOf({ booted: 'a' }), false).join('\n');
    expect(text).toContain('Seek Compact PRO');
    expect(text).toContain('SN-1');
    expect(text).toMatch(/A\s+0x14050000\s+yes\s+4\.9\.5\.0/);
    expect(text).toMatch(/B\s+0x14060000\s+no\s+4\.9\.5\.0/);
    expect(text).toMatch(/R\s+0x14070000\s+no\s+4\.9\.5\.0/);
    expect(text).toContain('flash decrypted image');
    expect(text).toContain('flash raw bytes');
    expect(text).toContain('fixture build');
  });

  it('gives the reason next to every operation the build cannot do', () => {
    const report = reportOf({
      entries: { b: { flashRaw: UNSUPPORTED('the staging path is not on this build') } },
    });
    expect(listLines(report, false).join('\n')).toContain(
      'no — the staging path is not on this build',
    );
  });

  it('says the build is unsupported, and why, when it is', () => {
    const text = listLines(
      reportOf({ build: UNSUPPORTED('0.7.9.0 is older than 0.8.0.0') }),
      false,
    ).join('\n');
    expect(text).toContain('not supported: 0.7.9.0 is older than 0.8.0.0');
  });

  it('returns a document that stringifies, with each bank and its operations', () => {
    const report = reportOf({ booted: 'a', entries: { b: { flashRaw: UNSUPPORTED('nope') } } });
    const document = JSON.parse(JSON.stringify(listResult(report))) as {
      action: string;
      firmware: string;
      slots: { bank: string; active: boolean; operations: { flashRaw: Support } }[];
    };
    expect(document.action).toBe('list');
    expect(document.firmware).toBe('4.9.5.0');
    expect(document.slots.map((slot) => slot.bank)).toEqual(['a', 'b', 'r']);
    expect(document.slots[0]?.active).toBe(true);
    expect(document.slots[1]?.operations.flashRaw).toEqual({ supported: false, reason: 'nope' });
  });
});

/* ==================================================================== *
 * dump: the file names
 * ==================================================================== */

describe('dump file names', () => {
  it('names the raw bank and its decrypted image after the version and the bank digest', () => {
    const artifacts = dumpArtifacts('4.9.5.0', fakeDumped('a', true));
    expect(artifacts.map((artifact) => artifact.name)).toEqual([
      'slot-a-4.9.5.0-deadbeef.bin',
      'slot-a-4.9.5.0-deadbeef-decrypted.bin',
    ]);
    expect(artifacts[0]?.data.length).toBe(0x10000);
  });

  it('writes only the raw bank when no key recovers the image', () => {
    const artifacts = dumpArtifacts('4.9.5.0', fakeDumped('r', false));
    expect(artifacts.map((artifact) => artifact.name)).toEqual(['slot-r-4.9.5.0-deadbeef.bin']);
  });

  it('names the decrypted image with the key pair it holds, as decrypt does, and bare when it holds neither', () => {
    /* A flash takes its keys from the file name (write-image.ts), so a dumped image the flash can
     * retarget must carry the pair the image contains. */
    const dumped = { ...fakeDumped('b', true), plain: buildPlainImage() };
    const named = `slot-b-4.9.5.0-deadbeef-decrypted${keyFilenameSuffix(KEY_A, KEY_B)}.bin`;
    expect(dumpArtifacts('4.9.5.0', dumped, { keyA: KEY_A, keyB: KEY_B })[1]?.name).toBe(named);
    expect(
      dumpArtifacts('4.9.5.0', dumped, { keyA: FOREIGN_KEY_A, keyB: FOREIGN_KEY_B })[1]?.name,
    ).toBe('slot-b-4.9.5.0-deadbeef-decrypted.bin');
    expect(dumpArtifacts('4.9.5.0', dumped)[1]?.name).toBe('slot-b-4.9.5.0-deadbeef-decrypted.bin');
  });

  it('keeps a version that is not known, or not safe in a name, out of the path', () => {
    expect(safeVersion(null)).toBe('unknown');
    expect(safeVersion('')).toBe('unknown');
    expect(safeVersion('4/../x')).toBe('4_.._x');
    expect(dumpArtifacts(null, fakeDumped('b', false))[0]?.name).toBe(
      'slot-b-unknown-deadbeef.bin',
    );
  });
});

/* ==================================================================== *
 * flash: the plan, the question and the read-back, as shown
 * ==================================================================== */

describe('the flash plan and read-back', () => {
  const report = reportOf({ booted: 'a' });

  it('shows where the bytes go, what is sent, and what changes, with its warnings', () => {
    const plan = fakePlan('b', 'raw', new Uint8Array(0x10000));
    const text = flashPlanLines(plan, 'raw.bin', 'c0ffee00', false).join('\n');
    expect(text).toContain('Slot flash plan');
    expect(text).toContain('B (0x14060000)');
    expect(text).toContain('raw.bin — raw bytes, sent verbatim');
    expect(text).toContain('65536 B in 1024 chunk(s) of 64 B');
    expect(text).toContain('0x1234');
    expect(text).toContain('sha256 c0ffee00');
    expect(text).toMatch(/version\s+4\.9\.5\.0\s+->\s+4\.9\.6\.0/);
    expect(text).toContain('! raw bytes are sent verbatim');
  });

  it('says a decrypted image is encrypted for the bank on the way in', () => {
    const plan = fakePlan('b', 'plain', new Uint8Array(0x10000));
    const text = flashPlanLines(plan, 'image.bin', null, false).join('\n');
    expect(text).toContain('decrypted image, encrypted for this bank on the way in');
    expect(text).toContain('not predicted');
  });

  it('asks which bank is written, and says when the camera boots it now', () => {
    const plan = fakePlan('a', 'plain', new Uint8Array(4));
    expect(flashQuestion(report, plan, 'image.bin')).toBe(
      'Write image.bin to bank A (the bank the camera boots now) on Seek Compact PRO (SN-1)? [y/N] ',
    );
    const other = fakePlan('b', 'plain', new Uint8Array(4));
    expect(flashQuestion(report, other, 'image.bin')).toContain('to bank B on');
  });

  it('reports a read-back that matches, one that does not, and one that was skipped', () => {
    const base = { key: 'b' as const, commitStatus: 0, after: null, notes: [] };
    expect(readBackLines({ ...base, verified: true }, 'abc123', false).join('\n')).toContain(
      'matches the staged image (sha256 abc123)',
    );
    expect(readBackLines({ ...base, verified: false }, 'abc123', false).join('\n')).toContain(
      'does NOT match the staged image',
    );
    expect(readBackLines({ ...base, verified: null }, null, false).join('\n')).toContain(
      'skipped (--no-verify)',
    );
    /* Read back, with nothing predicted to compare it with (a Key A bank): not "skipped". */
    const readBack = readBackLines(
      { ...base, after: new Uint8Array(4), verified: null },
      'abc123',
      false,
    ).join('\n');
    expect(readBack).toContain('read back (sha256 abc123)');
    expect(readBack).not.toContain('skipped');
    for (const verified of [true, false, null]) {
      expect(readBackLines({ ...base, verified }, null, false).join('\n')).toContain(
        'Unplug the camera and plug it back in',
      );
    }
  });
});

/* ==================================================================== *
 * The command, over fake core calls
 * ==================================================================== */

describe('slots command', () => {
  let temp: { path: string; cleanup: () => Promise<void> };

  beforeEach(async () => {
    temp = await tempDir();
  });
  afterEach(async () => {
    await temp.cleanup();
  });

  it('lists the banks, and under --json returns the document and prints no text', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    const test = cameraIo();
    const human = await slotsCommandWith(ops)(contextFor(['slots', 'list', '--no-probe'], test));
    expect(human).toMatchObject({ action: 'list', firmware: '4.9.5.0' });
    expect(test.stdout.text).toContain('Banks');
    expect(log.inspected).toBe(1);

    const machine = cameraIo();
    const json = await slotsCommandWith(ops)(
      contextFor(['slots', 'list', '--json', '--no-probe'], machine),
    );
    expect(json).toMatchObject({ action: 'list' });
    expect(machine.stdout.text).toBe('');
  });

  it('dumps the raw bank and the decrypted image into the output directory', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    const out = join(temp.path, 'dump');
    const test = cameraIo();
    const result = await slotsCommandWith(ops)(
      contextFor(['slots', 'dump', 'b', '--out', out, '--no-probe'], test),
    );

    expect(result).toMatchObject({ action: 'dump', bank: 'b', decrypted: true });
    expect(log.dumped).toEqual(['b']);
    expect((await readdir(out)).sort()).toEqual([
      'slot-b-4.9.5.0-deadbeef-decrypted.bin',
      'slot-b-4.9.5.0-deadbeef.bin',
    ]);
    const raw = await readFile(join(out, 'slot-b-4.9.5.0-deadbeef.bin'));
    expect(raw.length).toBe(0x10000);
    expect(raw[0]).toBe(0xab);
  });

  it('refuses a dump the build cannot read, before it reads the bank', async () => {
    const report = reportOf({ entries: { a: { dump: UNSUPPORTED('no read window') } } });
    const { ops, log } = fakeOps(report);
    const test = cameraIo();
    await expect(
      slotsCommandWith(ops)(contextFor(['slots', 'dump', 'a', '--no-probe'], test)),
    ).rejects.toMatchObject({ code: 'slots/refused' });
    expect(log.dumped).toEqual([]);
  });

  it('refuses the booted bank without --acknowledge-risk, with exit 1 and nothing sent', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    await writeFile(join(temp.path, 'image.bin'), new Uint8Array(64).fill(1));
    const test = cameraIo();
    const error = await slotsCommandWith(ops)(
      contextFor(
        ['slots', 'flash', 'a', join(temp.path, 'image.bin'), '--yes', '--no-probe'],
        test,
      ),
    ).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(CliError);
    expect((error as CliError).exitCode).toBe(EXIT_FAILED);
    expect((error as CliError).code).toBe('slots/refused');
    expect(log.prepared).toEqual([]);
    expect(log.flashed).toEqual([]);
    expect(test.stdout.text).not.toContain('Slot flash plan');
  });

  it('refuses the recovery bank without --acknowledge-risk, even with --yes', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    await writeFile(join(temp.path, 'image.bin'), new Uint8Array(64).fill(1));
    const test = cameraIo();
    await expect(
      slotsCommandWith(ops)(
        contextFor(
          ['slots', 'flash', 'r', join(temp.path, 'image.bin'), '--yes', '--no-probe'],
          test,
        ),
      ),
    ).rejects.toThrow(/bank R is the recovery bank/);
    expect(log.flashed).toEqual([]);
  });

  it('writes the booted bank when --acknowledge-risk is given, with the plan shown first', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    const dir = temp.path;
    await writeFile(join(dir, 'image.bin'), new Uint8Array(0x100).fill(7));
    const test = cameraIo();
    const result = await slotsCommandWith(ops)(
      contextFor(
        [
          'slots',
          'flash',
          'a',
          join(dir, 'image.bin'),
          '--yes',
          '--acknowledge-risk',
          '--no-probe',
        ],
        test,
      ),
    );

    expect(log.flashed).toEqual([{ key: 'a', options: { verify: true, acknowledgeRisk: true } }]);
    expect(log.prepared[0]).toMatchObject({ key: 'a', kind: 'plain', fileName: 'image.bin' });
    expect(test.stdout.text.indexOf('Slot flash plan')).toBeGreaterThanOrEqual(0);
    expect(result).toMatchObject({ action: 'flash', written: true, verified: true, kind: 'plain' });
  });

  it('asks before writing, and writes nothing when the answer is no', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    await writeFile(join(temp.path, 'image.bin'), new Uint8Array(64).fill(1));
    const test = cameraIo({ stdinIsTty: true, answer: false });
    await expect(
      slotsCommandWith(ops)(
        contextFor(['slots', 'flash', 'b', join(temp.path, 'image.bin'), '--no-probe'], test),
      ),
    ).rejects.toThrow(/aborted at the confirmation prompt — nothing was written/);
    expect(test.questions).toHaveLength(1);
    expect(test.questions[0]).toContain('Write image.bin to bank B');
    expect(log.flashed).toEqual([]);
  });

  it('writes after a yes at the prompt', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    await writeFile(join(temp.path, 'image.bin'), new Uint8Array(64).fill(1));
    const test = cameraIo({ stdinIsTty: true, answer: true });
    await slotsCommandWith(ops)(
      contextFor(['slots', 'flash', 'b', join(temp.path, 'image.bin'), '--no-probe'], test),
    );
    expect(log.flashed).toEqual([{ key: 'b', options: { verify: true, acknowledgeRisk: false } }]);
  });

  it('refuses to flash without a terminal and without --yes, before the camera is touched', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    await writeFile(join(temp.path, 'image.bin'), new Uint8Array(64).fill(1));
    const camera = recordingBackend();
    const test = testIo({ backend: camera.backend, stdinIsTty: false });
    await expect(
      slotsCommandWith(ops)(
        contextFor(['slots', 'flash', 'b', join(temp.path, 'image.bin'), '--no-probe'], test),
      ),
    ).rejects.toThrow(/refusing to flash without confirmation/);
    expect(camera.touched.count).toBe(0);
    expect(log.inspected).toBe(0);
  });

  it('sends a raw image verbatim when --raw is given', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    const bytes = Uint8Array.from([9, 8, 7, 6]);
    await writeFile(join(temp.path, 'raw.bin'), bytes);
    const test = cameraIo();
    await slotsCommandWith(ops)(
      contextFor(
        ['slots', 'flash', 'b', join(temp.path, 'raw.bin'), '--raw', '--yes', '--no-probe'],
        test,
      ),
    );
    expect(log.prepared).toHaveLength(1);
    expect(log.prepared[0]?.kind).toBe('raw');
    expect(log.prepared[0]?.fileName).toBe('raw.bin');
    expect([...(log.prepared[0]?.bytes ?? [])]).toEqual([9, 8, 7, 6]);
  });

  it('skips the read-back, and says so, under --no-verify', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    await writeFile(join(temp.path, 'image.bin'), new Uint8Array(64).fill(1));
    const test = cameraIo();
    const result = await slotsCommandWith(ops)(
      contextFor(
        ['slots', 'flash', 'b', join(temp.path, 'image.bin'), '--yes', '--no-verify', '--no-probe'],
        test,
      ),
    );
    expect(log.flashed).toEqual([{ key: 'b', options: { verify: false, acknowledgeRisk: false } }]);
    expect(result).toMatchObject({ verified: null, storedSha256: null });
    expect(test.stdout.text).toContain('skipped (--no-verify)');
  });

  it('fails the run, with exit 1, when the read-back does not match what was staged', async () => {
    const { ops } = fakeOps(reportOf({ booted: 'a' }), { verified: false });
    await writeFile(join(temp.path, 'image.bin'), new Uint8Array(64).fill(1));
    const test = cameraIo();
    const error = await slotsCommandWith(ops)(
      contextFor(
        ['slots', 'flash', 'b', join(temp.path, 'image.bin'), '--yes', '--no-probe'],
        test,
      ),
    ).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(CliError);
    expect((error as CliError).code).toBe('slots/verify-failed');
    expect((error as CliError).exitCode).toBe(EXIT_FAILED);
    expect(test.stdout.text).toContain('does NOT match the staged image');
  });

  it('reports an image file it cannot read, before the camera is touched', async () => {
    const { ops } = fakeOps(reportOf({ booted: 'a' }));
    const camera = recordingBackend();
    const test = testIo({ backend: camera.backend, stdinIsTty: true });
    await expect(
      slotsCommandWith(ops)(
        contextFor(['slots', 'flash', 'b', join(temp.path, 'missing.bin'), '--yes'], test),
      ),
    ).rejects.toMatchObject({ code: 'cli/no-input' });
    expect(camera.touched.count).toBe(0);
  });
});

/* ==================================================================== *
 * Through the dispatcher: the command is registered, and the usage paths are the CLI's
 * ==================================================================== */

describe('slots through run()', () => {
  it('reaches the camera layer for a real command, and touches nothing before it', async () => {
    const camera = recordingBackend();
    const test = testIo({ backend: camera.backend });
    const signal = new AbortController().signal;
    const code = await run(['slots', 'list', '--no-probe'], test.io, signal);
    expect(camera.touched.count).toBe(1);
    expect(code).toBe(EXIT_FAILED);
  });

  it('exits 2 with the slots usage when no subcommand is given, before any camera', async () => {
    const camera = recordingBackend();
    const test = testIo({ backend: camera.backend });
    const code = await run(['slots'], test.io, new AbortController().signal);
    expect(code).toBe(EXIT_USAGE);
    expect(camera.touched.count).toBe(0);
    expect(test.stderr.text).toContain('seek-fw slots');
  });

  it('exits 2 for a bank that is not a, b or r', async () => {
    const camera = recordingBackend();
    const test = testIo({ backend: camera.backend });
    const code = await run(['slots', 'dump', 'z'], test.io, new AbortController().signal);
    expect(code).toBe(EXIT_USAGE);
    expect(camera.touched.count).toBe(0);
    expect(test.stderr.text).toContain("bank must be a, b or r, got 'z'");
  });

  it('exits 2 for a flash-only flag on list, before any camera', async () => {
    const camera = recordingBackend();
    const test = testIo({ backend: camera.backend });
    const code = await run(['slots', 'list', '--raw'], test.io, new AbortController().signal);
    expect(code).toBe(EXIT_USAGE);
    expect(camera.touched.count).toBe(0);
  });

  it('prints the slots help on stdout and exits 0', async () => {
    const test = testIo();
    const code = await run(['slots', '--help'], test.io, new AbortController().signal);
    expect(code).toBe(EXIT_OK);
    expect(test.stdout.text).toContain('seek-fw slots');
    expect(test.stdout.text).toContain('--acknowledge-risk');
  });

  it('--dry-run is refused on list and dump, and on flash it prints the plan and sends no write', () => {
    expect(() =>
      parseSlotsArgs(['list'], { raw: false, acknowledgeRisk: false, verify: true, dryRun: true }),
    ).toThrow(/--dry-run/);
  });
});
