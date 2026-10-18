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
  getProfile,
  keyFilenameSuffix,
  SeekError,
  type DeviceState,
  type DumpedSlot,
  type FlashSlotOptions,
  type FlashSlotResult,
  type FpsPatchResult,
  type FpsPlan,
  type FpsPreDump,
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
  emptyBankNote,
  findView,
  flashPlanLines,
  flashQuestion,
  flashRefusal,
  imageSourceFor,
  listLines,
  listResult,
  parseBank,
  parseSlotsArgs,
  readBackLines,
  safeVersion,
  saveFpsDump,
  slotsCommandWith,
  writeKeyLines,
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
const NO_FLAGS = {
  raw: false,
  acknowledgeRisk: false,
  verify: true,
  dryRun: false,
  running16Hz: false,
} as const;

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
    emptyBank: { writable: SUPPORTED, why: 'an empty bank is written like a used one' },
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
/* The fields the write-key derivation reads: no booted bank is named, so it refuses, with the reason. */
function deviceStateFake(serial: string | null = 'SN-1'): DeviceState {
  const partial: Pick<
    DeviceState,
    | 'description'
    | 'serial'
    | 'boot'
    | 'byKey'
    | 'slots'
    | 'flashBlockedBy'
    | 'storeKey'
    | 'deviceKeySlot'
    | 'keyTable'
  > = {
    description: {
      vendorId: 0x289d,
      productId: 0x0001,
      productName: 'Seek Compact PRO',
      manufacturerName: 'Seek Thermal',
      serialNumber: serial,
    },
    serial,
    boot: null,
    byKey: new Map(),
    slots: [],
    flashBlockedBy: [],
    storeKey: { name: 'Key B', key: null, programmed: false },
    deviceKeySlot: null,
    keyTable: null,
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

/** A bank the read found erased: a clean read, no image, `blank` set (the analysis' own shape). */
function emptyStateFake(key: SlotKey): SlotState {
  const partial: Pick<
    SlotState,
    | 'key'
    | 'present'
    | 'blank'
    | 'unread'
    | 'reason'
    | 'header'
    | 'plainHeader'
    | 'keyName'
    | 'bootable'
    | 'bootability'
    | 'sha256'
    | 'plain'
  > = {
    key,
    present: false,
    blank: true,
    unread: false,
    reason: 'no image header (magic 0xFFFFFFFF)',
    header: null,
    plainHeader: null,
    keyName: null,
    bootable: false,
    bootability: 'not-bootable',
    sha256: null,
    plain: null,
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
  /** Banks the read found erased (all 0xFF): a state of their own, not unread. */
  readonly empty?: readonly SlotKey[];
}

function reportOf(options: ReportOptions = {}): SlotsReport {
  const booted = options.booted === undefined ? 'a' : options.booted;
  const keys: readonly SlotKey[] = ['a', 'b', 'r'];
  const entries = keys.map((key) => slotEntry(key, options.entries?.[key] ?? {}));
  const slots: SlotView[] = entries.map((entry) => {
    const unread = entry.key === options.unread;
    const empty = options.empty?.includes(entry.key) === true;
    return {
      entry,
      state: unread
        ? null
        : empty
          ? emptyStateFake(entry.key)
          : slotStateFake(entry.key, entry.key !== 'b'),
      unreadReason: unread ? 'the window would not arm' : null,
      content: unread ? 'unread' : empty ? 'empty' : 'image',
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

/** The same report, with every bank that holds an image carrying its decrypted image, as a real analysis has it. */
function withPlain(report: SlotsReport): SlotsReport {
  return {
    ...report,
    slots: report.slots.map((slot) =>
      slot.state === null || slot.content !== 'image'
        ? slot
        : { ...slot, state: { ...slot.state, plain: new Uint8Array(4) } },
    ),
  };
}

function fakeDumped(key: SlotKey, decrypts: boolean, empty = false): DumpedSlot {
  if (empty) {
    return {
      key,
      address: ADDRESS[key],
      raw: new Uint8Array(0x10000).fill(0xff),
      sha256: 'ffeeddcc'.repeat(8),
      empty: true,
      plain: null,
      plainSha256: null,
      notes: ['empty, nothing to decrypt: all 65536 B of slot B read as 0xFF (an erased bank).'],
    };
  }
  return {
    key,
    address: ADDRESS[key],
    raw: new Uint8Array(0x10000).fill(0xab),
    sha256: 'deadbeef'.repeat(8),
    empty: false,
    plain: decrypts ? new Uint8Array(0x1000).fill(0x01) : null,
    plainSha256: decrypts ? 'feedface'.repeat(8) : null,
    notes: [],
  };
}

function fakePlan(
  key: SlotKey,
  kind: SlotInputKind,
  bytes: Uint8Array,
  targetEmpty = false,
): SlotFlashPlan {
  return {
    targetEmpty,
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
      const empty = findView(report, key)?.content === 'empty';
      return Promise.resolve(fakeDumped(key, behaviour.decrypts ?? true, empty));
    },
    prepare: (_report, key, input) => {
      log.prepared.push({ key, kind: input.kind, fileName: input.fileName, bytes: input.bytes });
      const empty = findView(report, key)?.content === 'empty';
      return fakePlan(key, input.kind, input.bytes, empty);
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
    const raw = {
      raw: true,
      acknowledgeRisk: false,
      verify: true,
      dryRun: false,
      running16Hz: false,
    };
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
    [
      ['list'],
      { raw: true, acknowledgeRisk: false, verify: true, dryRun: false, running16Hz: false },
    ],
    [
      ['list'],
      { raw: false, acknowledgeRisk: true, verify: true, dryRun: false, running16Hz: false },
    ],
    [
      ['dump', 'a'],
      { raw: false, acknowledgeRisk: false, verify: false, dryRun: false, running16Hz: false },
    ],
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
      slotFlags: {
        raw: true,
        acknowledgeRisk: true,
        verify: false,
        dryRun: false,
        running16Hz: false,
      },
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
      running16Hz: false,
      write: false,
      dumpDir: null,
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

  it('says the 1.3.0.8 FF image is staged as the vendor app stages it, stored under Key B, and who said the build', () => {
    const plan: SlotFlashPlan = {
      ...fakePlan('r', 'plain', new Uint8Array(0x6000)),
      staging: 'key-a-keystream',
      storedForm: 'key-b-ciphertext',
      expectedStored: new Uint8Array(0x10000),
      ffRunning: 'user',
      warnings: ['UNTESTED: the boot of the written bank is not measured'],
    };
    const text = flashPlanLines(plan, 'ff.bin', 'feedface', false).join('\n');
    expect(text).toMatch(/staging\s+key-a-keystream/);
    expect(text).toContain('the image XOR Key A on the way in');
    expect(text).toContain('the camera stores it under Key B');
    expect(text).toMatch(/running build\s+your word \(--running-16hz\)/);
    expect(text).not.toContain('encrypted for this bank');
    expect(text).toContain('sha256 feedface');
    expect(text).toContain('! UNTESTED: the boot of the written bank is not measured');
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

  it('writes the 1.3.0.8 FF image to recovery R with --acknowledge-risk: the vendor-form plan is shown and reported', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    const ff: SlotOps = {
      ...ops,
      prepare: (report, key, input) => ({
        ...ops.prepare(report, key, input),
        staging: 'key-a-keystream',
        storedForm: 'key-b-ciphertext',
        warnings: ['UNTESTED: the boot of the written bank is not measured'],
      }),
    };
    await writeFile(join(temp.path, 'ff.bin'), new Uint8Array(0x100).fill(7));
    const test = cameraIo();
    const result = await slotsCommandWith(ff)(
      contextFor(
        [
          'slots',
          'flash',
          'r',
          join(temp.path, 'ff.bin'),
          '--yes',
          '--acknowledge-risk',
          '--no-probe',
        ],
        test,
      ),
    );

    expect(log.flashed).toEqual([{ key: 'r', options: { verify: true, acknowledgeRisk: true } }]);
    expect(test.stdout.text).toMatch(/staging\s+key-a-keystream/);
    expect(test.stdout.text).toContain('! UNTESTED: the boot of the written bank is not measured');
    expect(result).toMatchObject({
      action: 'flash',
      bank: 'r',
      staging: 'key-a-keystream',
      written: true,
      verified: true,
    });
  });

  it('without --acknowledge-risk the FF image is not written to recovery R, and nothing is prepared', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    await writeFile(join(temp.path, 'ff.bin'), new Uint8Array(0x100).fill(7));
    const test = cameraIo();
    await expect(
      slotsCommandWith(ops)(
        contextFor(['slots', 'flash', 'r', join(temp.path, 'ff.bin'), '--yes', '--no-probe'], test),
      ),
    ).rejects.toThrow(/bank R is the recovery bank/);
    expect(log.prepared).toEqual([]);
    expect(log.flashed).toEqual([]);
  });

  it('shows the core refusal of the FF image for bank B (recovery only), and writes nothing', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    const refusing: SlotOps = {
      ...ops,
      prepare: () => {
        throw new SeekError(
          'slots/refused',
          'this is the 1.3.0.8 FF (16 Hz) image: it can be written to R only, not to bank B. Nothing was written.',
        );
      },
    };
    await writeFile(join(temp.path, 'ff.bin'), new Uint8Array(0x100).fill(7));
    const test = cameraIo();
    const error = await slotsCommandWith(refusing)(
      contextFor(['slots', 'flash', 'b', join(temp.path, 'ff.bin'), '--yes', '--no-probe'], test),
    ).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(SeekError);
    expect((error as SeekError).code).toBe('slots/refused');
    expect((error as SeekError).message).toContain('R only, not to bank B');
    expect(log.flashed).toEqual([]);
    expect(test.stdout.text).not.toContain('Slot flash plan');
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
      parseSlotsArgs(['list'], {
        raw: false,
        acknowledgeRisk: false,
        verify: true,
        dryRun: true,
        running16Hz: false,
      }),
    ).toThrow(/--dry-run/);
  });
});

/* ==================================================================== *
 * Empty banks: a state, not an error
 * ==================================================================== */

describe('empty banks', () => {
  let temp: { path: string; cleanup: () => Promise<void> };

  beforeEach(async () => {
    temp = await tempDir();
  });
  afterEach(async () => {
    await temp.cleanup();
  });

  describe('slots list', () => {
    it('shows an empty bank as "empty" with no version, key or bootability, and keeps the others', () => {
      const text = listLines(reportOf({ booted: 'a', empty: ['b'] }), false).join('\n');
      expect(text).toMatch(/A\s+0x14050000\s+yes\s+4\.9\.5\.0/);
      expect(text).toMatch(/B\s+0x14060000\s+no\s+empty\s+-\s+-\s+-\s+-/);
      expect(text).toMatch(/R\s+0x14070000\s+no\s+4\.9\.5\.0/);
    });

    it('says in the notes what empty means, that it can be written, and how to fill it', () => {
      const report = withPlain(reportOf({ booted: 'a', empty: ['b'] }));
      const text = listLines(report, false).join('\n');
      expect(text).toContain(
        'B: empty — its header window reads as all 0xFF, so it holds no image',
      );
      expect(text).toContain('nothing is overwritten by a write');
      expect(text).toContain('It can be written. an empty bank is written like a used one');
      /* The booted bank holds an image, so the note names it as the source. */
      expect(text).toContain('To give it the firmware bank A holds');
      expect(text).toContain('`seek-fw slots dump a`');
      expect(text).toContain('`seek-fw slots flash b <the -decrypted file>`');
    });

    it('says an empty bank cannot be written where the plan says so, with the plan’s reason', () => {
      const report = withPlain(
        reportOf({
          booted: 'a',
          empty: ['b'],
          entries: {
            b: {
              emptyBank: { writable: UNSUPPORTED('no staging form on this build'), why: 'because' },
            },
          },
        }),
      );
      const note = emptyBankNote(report, view(report, 'b'));
      expect(note).toContain('It cannot be written on this build: no staging form on this build');
      expect(note).not.toContain('To give it');
    });

    it('offers no source when no other bank holds an image', () => {
      const report = reportOf({ booted: 'a', empty: ['a', 'b', 'r'] });
      expect(imageSourceFor(report, 'b')).toBeNull();
      expect(emptyBankNote(report, view(report, 'b'))).not.toContain('To give it');
    });

    it('names the booted bank as the source, else the first bank that holds an image, never the target', () => {
      const booted = withPlain(reportOf({ booted: 'r', empty: ['b'] }));
      expect(imageSourceFor(booted, 'b')?.entry.key).toBe('r');
      const unnamed = withPlain(reportOf({ booted: null, empty: ['a'] }));
      expect(imageSourceFor(unnamed, 'a')?.entry.key).toBe('b');
      expect(imageSourceFor(withPlain(reportOf({ booted: 'a' })), 'a')?.entry.key).toBe('b');
      /* An image bank that did not decrypt is no source. */
      expect(imageSourceFor(reportOf({ booted: 'a', empty: ['b'] }), 'b')).toBeNull();
    });

    it('returns content and the empty verdict in the document', () => {
      const report = reportOf({ booted: 'a', empty: ['b'] });
      const document = JSON.parse(JSON.stringify(listResult(report))) as {
        slots: {
          bank: string;
          content: string;
          empty: boolean;
          emptyBank: { writable: Support; why: string };
        }[];
      };
      expect(document.slots.map((slot) => [slot.bank, slot.content, slot.empty])).toEqual([
        ['a', 'image', false],
        ['b', 'empty', true],
        ['r', 'image', false],
      ]);
      expect(document.slots[1]?.emptyBank.writable).toEqual({ supported: true });
    });
  });

  describe('refusals', () => {
    it('writes an empty bank the camera does not boot with no acknowledgement', () => {
      const report = reportOf({ booted: 'a', empty: ['b'] });
      expect(flashRefusal(report, 'b', 'plain', false)).toBeNull();
      expect(flashRefusal(report, 'b', 'raw', false)).toBeNull();
    });

    it('does not exempt an empty bank from the acknowledgement rules', () => {
      /* No booted bank named: every bank may be the booted one, an empty one included. */
      const unnamed = reportOf({ booted: null, empty: ['b'] });
      expect(flashRefusal(unnamed, 'b', 'plain', false)?.message).toMatch(
        /booted bank could not be determined/,
      );
      expect(flashRefusal(unnamed, 'b', 'plain', true)).toBeNull();
      /* An empty recovery bank is still recovery. */
      const recovery = reportOf({ booted: 'a', empty: ['r'] });
      expect(flashRefusal(recovery, 'r', 'plain', false)?.message).toMatch(/recovery bank/);
      expect(flashRefusal(recovery, 'r', 'plain', true)).toBeNull();
    });

    it('refuses an empty bank the plan says cannot be written, naming the reason, before anything is sent', () => {
      const report = reportOf({
        booted: 'a',
        empty: ['b'],
        entries: {
          b: { emptyBank: { writable: UNSUPPORTED('no empty writes here'), why: 'no' } },
        },
      });
      const refusal = flashRefusal(report, 'b', 'plain', false);
      expect(refusal?.message).toBe(
        'bank B is empty and cannot be written on this build: no empty writes here',
      );
      expect(refusal?.hint).toContain('Nothing was sent');
      /* A used bank on the same plan is not affected. */
      expect(flashRefusal(report, 'r', 'plain', true)).toBeNull();
    });

    it('dumps an empty bank: a dump is a read, and empty is not a reason to refuse it', () => {
      expect(dumpRefusal(reportOf({ booted: 'a', empty: ['b'] }), 'b')).toBeNull();
    });
  });

  describe('dump', () => {
    it('names an empty dump by what it is, and writes no decrypted file', () => {
      const artifacts = dumpArtifacts(null, fakeDumped('b', true, true));
      expect(artifacts.map((artifact) => artifact.name)).toEqual(['slot-b-empty-ffeeddcc.bin']);
      expect(artifacts[0]?.data).toHaveLength(0x10000);
      expect(artifacts[0]?.data.every((byte) => byte === 0xff)).toBe(true);
    });

    it('writes the raw 64 KiB of 0xFF only, and says "empty, nothing to decrypt"', async () => {
      const { ops, log } = fakeOps(reportOf({ booted: 'a', empty: ['b'] }));
      const out = join(temp.path, 'dump');
      const test = cameraIo();
      const result = await slotsCommandWith(ops)(
        contextFor(['slots', 'dump', 'b', '--out', out, '--no-probe'], test),
      );

      expect(log.dumped).toEqual(['b']);
      expect(result).toMatchObject({
        action: 'dump',
        bank: 'b',
        empty: true,
        decrypted: false,
        plainSha256: null,
        version: null,
      });
      expect(await readdir(out)).toEqual(['slot-b-empty-ffeeddcc.bin']);
      const raw = await readFile(join(out, 'slot-b-empty-ffeeddcc.bin'));
      expect(raw).toHaveLength(0x10000);
      expect(raw.every((byte) => byte === 0xff)).toBe(true);
      expect(test.stdout.text).toContain('bank B: empty, nothing to decrypt');
      expect(test.stdout.text).toContain('raw 65536 B of 0xFF');
      expect(test.stdout.text).not.toContain('no key recovered');
    });

    it('a bank that holds an image is unchanged: empty false, its decrypted file beside it', async () => {
      const { ops } = fakeOps(reportOf({ booted: 'a', empty: ['b'] }));
      const out = join(temp.path, 'dump-a');
      const result = await slotsCommandWith(ops)(
        contextFor(['slots', 'dump', 'a', '--out', out, '--no-probe'], cameraIo()),
      );
      expect(result).toMatchObject({ empty: false, decrypted: true });
      expect((await readdir(out)).sort()).toEqual([
        'slot-a-4.9.5.0-deadbeef-decrypted.bin',
        'slot-a-4.9.5.0-deadbeef.bin',
      ]);
    });
  });

  describe('flash', () => {
    it('shows the target as empty in the plan, and in the question', () => {
      const report = reportOf({ booted: 'a', empty: ['b'] });
      const plan = fakePlan('b', 'plain', new Uint8Array(0x10000), true);
      const text = flashPlanLines(plan, 'image.bin', null, false).join('\n');
      expect(text).toContain('target');
      expect(text).toContain('empty — the bank holds no image, so nothing is overwritten');
      expect(flashQuestion(report, plan, 'image.bin')).toBe(
        'Write image.bin to bank B (empty — nothing is overwritten) on Seek Compact PRO (SN-1)? [y/N] ',
      );
    });

    it('does not mention emptiness for a plan whose target held an image', () => {
      const report = reportOf({ booted: 'a' });
      const plan = fakePlan('b', 'plain', new Uint8Array(0x10000));
      expect(flashPlanLines(plan, 'image.bin', null, false).join('\n')).not.toContain('empty');
      expect(flashQuestion(report, plan, 'image.bin')).not.toContain('empty');
    });

    it('writes into an empty bank like any other: plan shown, prompt says empty, read-back reported', async () => {
      const { ops, log } = fakeOps(reportOf({ booted: 'a', empty: ['b'] }));
      await writeFile(join(temp.path, 'image.bin'), new Uint8Array(64).fill(1));
      const test = cameraIo({ stdinIsTty: true, answer: true });
      const result = await slotsCommandWith(ops)(
        contextFor(['slots', 'flash', 'b', join(temp.path, 'image.bin'), '--no-probe'], test),
      );

      expect(test.questions).toHaveLength(1);
      expect(test.questions[0]).toContain(
        'Write image.bin to bank B (empty — nothing is overwritten)',
      );
      expect(log.flashed).toEqual([
        { key: 'b', options: { verify: true, acknowledgeRisk: false } },
      ]);
      expect(test.stdout.text).toContain(
        'empty — the bank holds no image, so nothing is overwritten',
      );
      expect(test.stdout.text).toContain('matches the staged image');
      expect(result).toMatchObject({
        action: 'flash',
        bank: 'b',
        written: true,
        verified: true,
        targetEmpty: true,
      });
    });

    it('--dry-run reports the empty target and sends nothing', async () => {
      const { ops, log } = fakeOps(reportOf({ booted: 'a', empty: ['b'] }));
      await writeFile(join(temp.path, 'image.bin'), new Uint8Array(64).fill(1));
      const result = await slotsCommandWith(ops)(
        contextFor(
          ['slots', 'flash', 'b', join(temp.path, 'image.bin'), '--dry-run', '--no-probe'],
          cameraIo(),
        ),
      );
      expect(result).toMatchObject({ written: false, dryRun: true, targetEmpty: true });
      expect(log.flashed).toEqual([]);
    });

    it('keeps the acknowledgement for an empty bank when no booted bank is named, and for an empty R', async () => {
      const { ops, log } = fakeOps(reportOf({ booted: null, empty: ['b', 'r'] }));
      await writeFile(join(temp.path, 'image.bin'), new Uint8Array(64).fill(1));
      for (const bank of ['b', 'r']) {
        await expect(
          slotsCommandWith(ops)(
            contextFor(
              ['slots', 'flash', bank, join(temp.path, 'image.bin'), '--yes', '--no-probe'],
              cameraIo(),
            ),
          ),
        ).rejects.toMatchObject({ code: 'slots/refused' });
      }
      expect(log.prepared).toEqual([]);
      expect(log.flashed).toEqual([]);

      const ok = await slotsCommandWith(ops)(
        contextFor(
          [
            'slots',
            'flash',
            'b',
            join(temp.path, 'image.bin'),
            '--yes',
            '--acknowledge-risk',
            '--no-probe',
          ],
          cameraIo(),
        ),
      );
      expect(ok).toMatchObject({ written: true, targetEmpty: true });
    });

    it('a write to a bank that held an image reports targetEmpty false', async () => {
      const { ops } = fakeOps(reportOf({ booted: 'a', empty: ['b'] }));
      await writeFile(join(temp.path, 'image.bin'), new Uint8Array(64).fill(1));
      const result = await slotsCommandWith(ops)(
        contextFor(
          [
            'slots',
            'flash',
            'r',
            join(temp.path, 'image.bin'),
            '--yes',
            '--acknowledge-risk',
            '--no-probe',
          ],
          cameraIo(),
        ),
      );
      expect(result).toMatchObject({ written: true, targetEmpty: false });
    });
  });

  describe('help', () => {
    it('the slots usage says what an empty bank is and how to fill one', async () => {
      const test = testIo();
      const code = await run(['slots', '--help'], test.io, new AbortController().signal);
      expect(code).toBe(EXIT_OK);
      expect(test.stdout.text).toContain('An EMPTY bank');
      expect(test.stdout.text).toContain('slot-<bank>-empty-<sha8>.bin');
    });
  });
});

/* ---- the keys every bank is written under, derived from the booted bank ---- */

const KEY_A_BYTES = Uint8Array.from({ length: 16 }, (_, i) => 0xa0 + i);
const KEY_B_BYTES = Uint8Array.from({ length: 16 }, (_, i) => 0xb0 + i);

/** A camera whose booted bank A decrypts under its store key (Key B) and carries the application's pair. */
function derivableReport(): SlotsReport {
  const plain = new Uint8Array(0x5000).fill(0x33);
  plain.set(KEY_A_BYTES, 0x4000);
  plain.set(KEY_B_BYTES, 0x4020);
  const bootedSlot = {
    ...slotStateFake('a', true),
    plain,
    keyName: 'Key B',
    bootable: true,
    bootability: 'bootable',
  } as SlotState;
  const base = reportOf();
  const state = {
    ...base.state,
    boot: { booted: 'a', target: 'b' },
    byKey: new Map([['a', bootedSlot]]),
    slots: [bootedSlot],
    keyTable: { keyA: KEY_A_BYTES, keyB: KEY_B_BYTES, offset: 0, matchA: true, matchB: true },
    storeKey: { name: 'Key B', key: KEY_B_BYTES, programmed: false },
    deviceKeySlot: null,
  } as unknown as DeviceState;
  return { ...base, state };
}

describe('the write keys, derived from the booted bank', () => {
  it('the list says which key the booted bank holds, and that every bank is written the same way', () => {
    const text = writeKeyLines(derivableReport(), false).join('\n');
    expect(text).toContain('A holds Key B');
    expect(text).toContain(
      'Key B, derived from the booted bank A; every bank is written the same way',
    );
  });

  it('a camera the derivation refuses says why, in the list', () => {
    const text = writeKeyLines(reportOf(), false).join('\n');
    expect(text).toContain('refused');
    expect(text).toContain('could not be named');
  });

  it('the flash plan names the key and the bank it was derived from', () => {
    const plan = {
      ...fakePlan('b', 'plain', new Uint8Array(0x100)),
      derivedFrom: { bank: 'a' as const, key: 'Key B' },
    } as SlotFlashPlan;
    const text = flashPlanLines(plan, 'image.bin', null, false).join('\n');
    expect(text).toContain('Key B, derived from the booted bank A');
  });
});

/* ==================================================================== *
 * The 2014 plaintext chain: the booted bank is the active-slot word's, and recovery R can run
 * ==================================================================== */

/** The same report on the 2014 plaintext chain (1.3.0.8 under legacy-auth), with each read bank in the analysis. */
function onLockedPlain(report: SlotsReport): SlotsReport {
  const byKey = new Map(
    report.slots.flatMap((v) => (v.state === null ? [] : [[v.entry.key, v.state] as const])),
  );
  return {
    ...report,
    state: {
      ...report.state,
      profile: getProfile('legacy-auth'),
      version: '1.3.0.8',
      cfg0: 0,
      byKey,
    },
  };
}

describe('the 2014 plaintext chain', () => {
  it('names the booted bank by the active-slot word in its risk words, and keeps "boots now" elsewhere', () => {
    const locked = onLockedPlain(reportOf({ booted: 'a' }));
    expect(bootRisk(locked, view(locked, 'a'))).toContain(
      "the bank the camera's active-slot word names as booted",
    );
    expect(bootRisk(locked, view(locked, 'a'))).not.toContain('boots now');
    expect(flashRefusal(locked, 'a', 'plain', false)?.message).toContain(
      'active-slot word names as booted',
    );

    const modern = reportOf({ booted: 'a' });
    expect(bootRisk(modern, view(modern, 'a'))).toContain('boots now');
  });

  it('lists an FF image in R as recovery only, and says what the running build is', () => {
    const locked = onLockedPlain(reportOf({ booted: 'a' }));
    const slots = locked.slots.map((v) =>
      v.entry.key === 'r' && v.state !== null
        ? { ...v, state: { ...v.state, bootability: 'recovery-only' as const, bootable: false } }
        : v,
    );
    const text = listLines({ ...locked, slots }, false).join('\n');
    expect(text).toMatch(/R\s+0x14070000.*recovery only/);
    expect(text).toContain('the running build is not known');
  });

  /* The bench Compact PIR206 (1.3.0.0, 2014 chain): its banks hold no key, so the write keys are not
   * refused, and the list says the banks are plain (TESTING.md 42.13). */
  function plainChainBench(): SlotsReport {
    const base = onLockedPlain(reportOf({ booted: 'a' }));
    const state = {
      ...base.state,
      version: '1.3.0.0',
      plainChain: true,
      keyTable: null,
      deviceKeySlot: null,
      storeKey: { name: 'Key B', key: null, programmed: false },
    } as unknown as DeviceState;
    const slots = base.slots.map((v) =>
      v.state !== null && v.entry.key !== 'b'
        ? {
            ...v,
            state: {
              ...v.state,
              keyName: null,
              plain: new Uint8Array(0x100),
              bootable: true,
              bootability: 'bootable' as const,
            },
          }
        : v,
    );
    return { ...base, state, slots };
  }

  it('the write keys on the plaintext chain are not refused, and no key is derived for them', () => {
    const bench = plainChainBench();
    const text = writeKeyLines(bench, false).join('\n');
    expect(text).not.toContain('refused');
    expect(text).not.toContain('No bank');
    expect(text).toContain('every bank is stored plain, so none holds a key');
    expect(text).not.toContain('derived from the booted bank');
    expect(listResult(bench).writeKeys).toMatchObject({ refused: null, plainChain: true });
  });

  it('the list shows a plain bank as stored plain, not under a key nobody knows', () => {
    const text = listLines(plainChainBench(), false).join('\n');
    expect(text).toContain('none (plaintext)');
    expect(text).not.toContain('unknown key');
  });
});

/* ==================================================================== *
 * patch-fps: the frame-rate patch on one bank, offline (core is faked)
 * ==================================================================== */

type OfferPlan = Extract<FpsPlan, { status: 'offer' }>;

/** A plan the way core makes one for the 1.3.0.0 stock bank: 8 Hz to 16 Hz, one byte changed plus the sum word. */
function offerOf(): OfferPlan {
  return {
    status: 'offer',
    patch: {
      id: 'compact_32k-1.3.0.0-to16',
      family: 'compact_32k',
      version: '1.3.0.0',
      fromHz: 8,
      targetHz: 16,
      row: { label: 'mode-6 capture program, block 2', offset: 0xb964, length: 34 },
    } as unknown as OfferPlan['patch'],
    fromHz: 8,
    toHz: 16,
    sites: [{ offset: 0xb964, before: 0x24, after: 0x22 }],
    sumWord: { offset: 0x238, before: 0 },
  };
}

/** The result core returns for a written patch, with every check passing. */
function writtenResult(pre: FpsPreDump): FpsPatchResult {
  return {
    key: 'a',
    patch: offerOf().patch,
    fromHz: 8,
    toHz: 16,
    pre,
    changed: [0xb964, 0x238],
    plan: fakePlan('a', 'plain', pre.plain),
    written: { key: 'a', commitStatus: 0, verified: true, after: pre.raw, notes: [] },
    readBack: { checked: true, differing: [0xb964, 0x238], missing: [], unexpected: [], ok: true },
    notes: ['saved the pre-patch dump'],
  };
}

function preDump(): FpsPreDump {
  return {
    key: 'a',
    bank: 'Bank A',
    version: '1.3.0.0',
    address: 0x14050000,
    raw: new Uint8Array(0x10000).fill(0x11),
    rawSha256: 'aa',
    rawName: 'seek-slot-A-v1.3.0.0-before-fps-patch-raw-aa.bin',
    plain: new Uint8Array(0xbaa8).fill(0x22),
    plainSha256: 'bb',
    plainName: 'seek-slot-A-v1.3.0.0-before-fps-patch-decrypted-bb.bin',
  };
}

describe('patch-fps', () => {
  let temp: { path: string; cleanup: () => Promise<void> };

  beforeEach(async () => {
    temp = await tempDir();
  });
  afterEach(async () => {
    await temp.cleanup();
  });

  it('parses patch-fps, and refuses a flag the subcommand does not use', () => {
    const plain = parseCli(['slots', 'patch-fps', 'a']);
    if (plain.kind !== 'run') throw new Error('expected a run');
    expect(parseSlotsArgs(plain.args, plain.slotFlags)).toEqual({ action: 'patch-fps', key: 'a' });

    const writing = parseCli(['slots', 'patch-fps', 'b', '--write', '--dump-dir', 'd', '--yes']);
    if (writing.kind !== 'run') throw new Error('expected a run');
    const flags = writing.slotFlags;
    expect(flags).toMatchObject({ write: true, dumpDir: 'd' });
    expect(() => parseSlotsArgs(['patch-fps', 'a'], { ...flags, raw: true })).toThrow(
      /--raw applies only to 'slots flash'/,
    );
    expect(() => parseSlotsArgs(['list'], { ...flags, dumpDir: null })).toThrow(
      /--write applies only to 'slots patch-fps'/,
    );
    expect(() => parseSlotsArgs(['flash', 'a', 'x'], { ...flags, write: false })).toThrow(
      /--dump-dir applies only to 'slots patch-fps'/,
    );
    expect(() => parseSlotsArgs(['patch-fps'], flags)).toThrow(/needs a bank/);
  });

  it('is a dry run by default: prints the plan, saves and sends nothing', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'b' }));
    let patched = 0;
    const withPatch: SlotOps = {
      ...ops,
      fpsPlan: () => offerOf(),
      patchFps: () => {
        patched += 1;
        return Promise.reject(new Error('a dry run must not patch'));
      },
    };
    const test = cameraIo();
    const result = await slotsCommandWith(withPatch)(
      contextFor(['slots', 'patch-fps', 'a', '--no-probe'], test),
    );
    expect(result).toMatchObject({
      action: 'patch-fps',
      bank: 'a',
      written: false,
      dryRun: true,
      status: 'offer',
      toHz: 16,
      changedBytes: 1,
    });
    expect(patched).toBe(0);
    expect(log.flashed).toEqual([]);
    const text = test.stdout.text + test.stderr.text;
    expect(text).toContain('Frame-rate patch plan');
    expect(text).not.toContain('UNTESTED on hardware');
    expect(text).toContain('dry run: nothing was saved and nothing was written');
  });

  it('refuses a bank the plan does not offer, with the plan reason and nothing sent', async () => {
    const { ops } = fakeOps(reportOf({ booted: 'b' }));
    const withPlan: SlotOps = {
      ...ops,
      fpsPlan: () => ({
        status: 'refused',
        reason: 'this image is not in the frame-rate patch table',
      }),
    };
    const error = await slotsCommandWith(withPlan)(
      contextFor(['slots', 'patch-fps', 'a', '--no-probe'], cameraIo()),
    ).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(CliError);
    expect((error as CliError).code).toBe('slots/refused');
    expect((error as CliError).message).toContain('not in the frame-rate patch table');
  });

  it('refuses --write without --dump-dir before the camera is opened', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'b' }));
    const withPlan: SlotOps = { ...ops, fpsPlan: () => offerOf() };
    const error = await slotsCommandWith(withPlan)(
      contextFor(['slots', 'patch-fps', 'a', '--write', '--yes', '--no-probe'], cameraIo()),
    ).catch((caught: unknown) => caught);
    expect((error as CliError).code).toBe('slots/refused');
    expect((error as CliError).message).toMatch(/needs --dump-dir/);
    expect(log.inspected).toBe(0);
  });

  it('saves the pre-patch dump first, then writes, and the files are on disk', async () => {
    const { ops } = fakeOps(reportOf({ booted: 'b' }));
    const dir = join(temp.path, 'before');
    const order: string[] = [];
    const withPatch: SlotOps = {
      ...ops,
      fpsPlan: () => offerOf(),
      patchFps: async (_ctx, _report, _key, options) => {
        order.push('patch');
        const dump = preDump();
        expect(await options.saveDump(dump)).toBe(true);
        order.push('written');
        return writtenResult(dump);
      },
    };
    const result = await slotsCommandWith(withPatch)(
      contextFor(
        ['slots', 'patch-fps', 'a', '--write', '--dump-dir', dir, '--yes', '--no-probe'],
        cameraIo({ stdinIsTty: false }),
      ),
    );
    expect(order).toEqual(['patch', 'written']);
    expect(result).toMatchObject({
      action: 'patch-fps',
      written: true,
      dryRun: false,
      commitStatus: 0,
    });
    expect((await readdir(dir)).sort()).toEqual([
      'seek-slot-A-v1.3.0.0-before-fps-patch-decrypted-bb.bin',
      'seek-slot-A-v1.3.0.0-before-fps-patch-raw-aa.bin',
    ]);
    expect(
      (await readFile(join(dir, 'seek-slot-A-v1.3.0.0-before-fps-patch-raw-aa.bin'))).length,
    ).toBe(0x10000);
  });

  it('never replaces a pre-patch dump that already exists', async () => {
    const dir = join(temp.path, 'twice');
    expect(await saveFpsDump(dir, preDump())).toBe(true);
    await expect(saveFpsDump(dir, preDump())).rejects.toMatchObject({ code: 'EEXIST' });
  });

  it('fails the run with a non-zero exit when the read-back does not match the plan', async () => {
    const { ops } = fakeOps(reportOf({ booted: 'b' }));
    const withPatch: SlotOps = {
      ...ops,
      fpsPlan: () => offerOf(),
      patchFps: async (_ctx, _report, _key, options) => {
        const dump = preDump();
        await options.saveDump(dump);
        return {
          ...writtenResult(dump),
          readBack: {
            checked: true,
            differing: [0xb964, 0x9000],
            missing: [0x238],
            unexpected: [0x9000],
            ok: false,
          },
        };
      },
    };
    const dir = join(temp.path, 'verify');
    const error = await slotsCommandWith(withPatch)(
      contextFor(
        ['slots', 'patch-fps', 'a', '--write', '--dump-dir', dir, '--yes', '--no-probe'],
        cameraIo(),
      ),
    ).catch((caught: unknown) => caught);
    expect((error as CliError).code).toBe('slots/verify-failed');
  });

  it('lists each bank with its patch verdict in the JSON document', () => {
    const list = listResult(reportOf({ booted: 'a' }));
    expect(list.slots).toHaveLength(3);
    for (const bank of list.slots as readonly { readonly patch: { readonly status: string } }[]) {
      expect(bank.patch.status).toBe('refused');
    }
  });
});
