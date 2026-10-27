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
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  APPLICATION_KEY_PAIRS,
  buildSlotPlan,
  buildZip,
  equalBytes,
  FF_VENDOR_STAGED,
  FF_VENDOR_STORED,
  fpsBootWarningOf,
  getProfile,
  hexToBytes,
  IMAGE_MAGIC,
  keyFilenameSuffix,
  LENGTH_OFFSET,
  prepareSlotFlash,
  safeVersion,
  SeekError,
  writeBannerOf,
  type DeviceState,
  type DumpedSlot,
  type FlashSlotResult,
  type FpsEveryBankResult,
  type FpsPatchResult,
  type FpsPlan,
  type ImageHeader,
  type SlotRestorePlan,
  type WriteAction,
  type WriteBackup,
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
  bootLines,
  bootRisk,
  dumpArtifacts,
  dumpRefusal,
  emptyBankNote,
  findView,
  flashPlanLines,
  flashQuestion,
  flashRefusal,
  fpsPlanJson,
  fpsPlanLines,
  fpsQuestion,
  imageSourceFor,
  listLines,
  listResult,
  parseBank,
  parseSlotsArgs,
  readBackLines,
  backupDirOf,
  saveBackupInto,
  slotsCommandWith,
  writeKeyLines,
  type SlotOps,
} from '../src/commands/slots.js';
import { TerminalReporter } from '../src/reporter.js';
import { MemorySink } from '../src/sink.js';
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

/* The 4.x map of the fixtures' 4.9.5.0 camera (modern-4x.ts:84-86). The 2014 map is legacy-auth.ts:548-552. */
const ADDRESS: Record<SlotKey, number> = { a: 0x14030000, b: 0x14050000, r: 0x14070000 };
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
    | 'bankWriteRefusals'
    | 'storeKey'
    | 'deviceKeySlot'
    | 'keyTable'
    | 'profile'
    | 'version'
    | 'plainChain'
  > = {
    /* The fixtures' camera reports 4.9.5.0 under the `generic` profile: no slot family, so none of the
     * line-specific verdicts (the locked line's boot section, the 2016 staging) applies to it. */
    profile: getProfile('generic'),
    version: '4.9.5.0',
    plainChain: false,
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
    bankWriteRefusals: [],
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
    imageBuild: null,
    notes: [],
    serial: 'SN-1',
    firmwareVersion: '4.9.5.0',
  };
}

interface OpsLog {
  inspected: number;
  dumped: SlotKey[];
  prepared: { key: SlotKey; kind: SlotInputKind; fileName: string; bytes: Uint8Array }[];
  /** Each write: its bank and the two options a write always had. */
  flashed: { key: SlotKey; options: { verify?: boolean; acknowledgeRisk: boolean } }[];
  /** The action each write named for its backup. */
  actions: WriteAction[];
  /** The backups the writes saved (only with `behaviour.save`). */
  saved: WriteBackup[];
}

/** The backup zip core builds before a write, for the bank and the write given: one text file in it. */
function backupOf(keys: readonly SlotKey[], action: WriteAction): WriteBackup {
  const label =
    action.kind === 'copy'
      ? `before-copy-from-${action.from.toUpperCase()}`
      : action.kind === 'restore'
        ? 'before-restore'
        : action.kind === 'flash'
          ? action.input === 'raw'
            ? 'before-flash-raw'
            : 'before-flash'
          : action.kind === 'fps-patch'
            ? 'before-fps-patch'
            : 'before-fps-patch-every-bank';
  const name = `seek_backup_2026-10-26T12-00-00Z_SN-1_v4.9.5.0_bank-${keys.map((key) => key.toUpperCase()).join('-')}_${label}`;
  const zip = buildZip([{ name: `${name}/README.txt`, data: new TextEncoder().encode('backup') }]);
  return {
    name,
    fileName: `${name}.zip`,
    savedAt: '2026-10-26T12:00:00.000Z',
    serial: 'SN-1',
    firmware: '4.9.5.0',
    action,
    follows: 'the write',
    banks: [],
    textName: 'README.txt',
    text: 'backup',
    zip,
  };
}

/** Core's calls, faked. The log says what the command asked for. */
function fakeOps(
  report: SlotsReport,
  behaviour: {
    readonly verified?: boolean | null;
    readonly decrypts?: boolean;
    /** The write saves its backup through the command's save (into --dump-dir), as core's does. */
    readonly save?: boolean;
  } = {},
): { readonly ops: SlotOps; readonly log: OpsLog } {
  const log: OpsLog = {
    inspected: 0,
    dumped: [],
    prepared: [],
    flashed: [],
    actions: [],
    saved: [],
  };
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
    write: async (_ctx, _report, plan, options) => {
      log.flashed.push({
        key: plan.key,
        options: {
          ...(options.verify === undefined ? {} : { verify: options.verify }),
          acknowledgeRisk: options.acknowledgeRisk,
        },
      });
      log.actions.push(options.action);
      const backup = backupOf([plan.key], options.action);
      if (behaviour.save === true) {
        if (!(await options.saveBackup(backup))) throw new Error('not saved');
        log.saved.push(backup);
      }
      const written: FlashSlotResult = {
        key: plan.key,
        commitStatus: 0,
        verified: options.verify === false ? null : verified,
        after: options.verify === false ? null : plan.payload,
        notes: [],
      };
      return { written, backup };
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

  it('still refuses extra positionals on the other commands, and the removed flash command', () => {
    expect(() => parseCli(['info', 'extra'])).toThrow(/unexpected argument 'extra'/);
    expect(() => parseCli(['dump', 'extra'])).toThrow(/unexpected argument 'extra'/);
    expect(() => parseCli(['decrypt'])).toThrow(/decrypt needs a form/);
    expect(() => parseCli(['flash', 'image.bin'])).toThrow(/unknown command 'flash'/);
  });
});

/* ==================================================================== *
 * Refusals, decided before anything is sent
 * ==================================================================== */

describe('refusals', () => {
  it('refuses to flash the bank the camera boots now, without the acknowledgement', () => {
    const report = reportOf({ booted: 'a' });
    const refusal = flashRefusal(report, 'a', 'plain', false);
    expect(refusal?.message).toMatch(/refusing to write slot A: .*boots now/);
    expect(refusal?.hint).toContain('--acknowledge-risk');
    expect(refusal?.hint).toContain('Nothing was sent');
  });

  it('allows that same write once the acknowledgement is given', () => {
    expect(flashRefusal(reportOf({ booted: 'a' }), 'a', 'plain', true)).toBeNull();
  });

  it('refuses the recovery bank without the acknowledgement, even when it is not booted', () => {
    const report = reportOf({ booted: 'a' });
    expect(flashRefusal(report, 'r', 'plain', false)?.message).toMatch(
      /recovery R is the bank the bootloader falls back to/,
    );
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
    expect(text).toMatch(/A\s+0x14030000\s+yes\s+4\.9\.5\.0/);
    expect(text).toMatch(/B\s+0x14050000\s+no\s+4\.9\.5\.0/);
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
      'seek-slot-a-4.9.5.0-deadbeef.bin',
      'seek-slot-a-4.9.5.0-deadbeef-decrypted.bin',
    ]);
    expect(artifacts[0]?.data.length).toBe(0x10000);
  });

  it('writes only the raw bank when no key recovers the image', () => {
    const artifacts = dumpArtifacts('4.9.5.0', fakeDumped('r', false));
    expect(artifacts.map((artifact) => artifact.name)).toEqual([
      'seek-slot-r-4.9.5.0-deadbeef.bin',
    ]);
  });

  it('names the decrypted image with the key pair it holds, as decrypt does, and bare when it holds neither', () => {
    /* A flash takes its keys from the file name (write-image.ts), so a dumped image the flash can
     * retarget must carry the pair the image contains. */
    const dumped = { ...fakeDumped('b', true), plain: buildPlainImage() };
    const named = `seek-slot-b-4.9.5.0-deadbeef-decrypted${keyFilenameSuffix(KEY_A, KEY_B)}.bin`;
    expect(dumpArtifacts('4.9.5.0', dumped, { keyA: KEY_A, keyB: KEY_B })[1]?.name).toBe(named);
    expect(
      dumpArtifacts('4.9.5.0', dumped, { keyA: FOREIGN_KEY_A, keyB: FOREIGN_KEY_B })[1]?.name,
    ).toBe('seek-slot-b-4.9.5.0-deadbeef-decrypted.bin');
    expect(dumpArtifacts('4.9.5.0', dumped)[1]?.name).toBe(
      'seek-slot-b-4.9.5.0-deadbeef-decrypted.bin',
    );
  });

  it('keeps a version that is not known, or not safe in a name, out of the path', () => {
    expect(safeVersion(null)).toBe('unknown');
    expect(safeVersion('')).toBe('unknown');
    expect(safeVersion('4/../x')).toBe('4_.._x');
    expect(dumpArtifacts(null, fakeDumped('b', false))[0]?.name).toBe(
      'seek-slot-b-unknown-deadbeef.bin',
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
    expect(text).toContain('B (0x14050000)');
    expect(text).toContain('raw.bin — raw bytes');
    /* The form in words, not its code name (TESTING.md 42.87). */
    expect(text).toMatch(/staging\s+verbatim — the bytes exactly as given/);
    expect(text).not.toMatch(/staging\s+verbatim$/m);
    expect(text).toContain('65536 B in 1024 chunk(s) of 64 B');
    expect(text).toContain('0x1234');
    expect(text).toContain('sha256 c0ffee00');
    expect(text).toMatch(/version\s+4\.9\.5\.0\s+->\s+4\.9\.6\.0/);
    expect(text).toContain('! raw bytes are sent verbatim');
  });

  it('says a decrypted image is encrypted for the bank on the way in, in words', () => {
    const plan = fakePlan('b', 'plain', new Uint8Array(0x10000));
    const text = flashPlanLines(plan, 'image.bin', null, false).join('\n');
    expect(text).toContain('image.bin — decrypted image');
    expect(text).toMatch(
      /staging\s+encrypted so the device stores it under the key the booted bank holds/,
    );
    expect(text).not.toContain('key-a-ciphertext');
    expect(text).toContain('not predicted');
  });

  it('says the 2016 staging in words, once, with no code name (TESTING.md 42.87)', () => {
    const plan: SlotFlashPlan = {
      ...fakePlan('b', 'plain', new Uint8Array(0xca88)),
      staging: 'slot-keystream-ciphertext',
    };
    const text = flashPlanLines(plan, 'image.bin', null, false).join('\n');
    expect(text).toContain('image.bin — decrypted image');
    expect(text).toMatch(
      /staging\s+encrypted under the image's own stage key \(key block 0\); the camera stores it under the bank's own key/,
    );
    expect(text).not.toContain('slot-keystream-ciphertext');
  });

  it('prints the plan’s notes under Notes, not as "! Note:" warnings, and its warnings alone under Warnings (TESTING.md 42.88)', () => {
    const plan: SlotFlashPlan = {
      ...fakePlan('a', 'plain', new Uint8Array(0xca88)),
      staging: 'slot-keystream-ciphertext',
      warnings: [
        'slot A is the bank the camera boots now: writing it asks you to acknowledge the risk',
      ],
      notes: [
        { source: 'write', text: 'how this write is checked' },
        { source: 'bank', text: 'the bank’s own note' },
        { source: 'camera', text: 'Staged: the image, XORed with its own key block 0' },
      ],
    };
    const lines = flashPlanLines(plan, 'image.bin', null, false);
    const text = lines.join('\n');
    expect(text).not.toContain('Note: ');
    const warnings = lines.indexOf('Warnings');
    const notes = lines.indexOf('Notes');
    expect(warnings).toBeGreaterThan(0);
    expect(notes).toBeGreaterThan(warnings);
    expect(lines.slice(warnings + 1, notes).filter((line) => line.startsWith('  !'))).toEqual([
      '  ! slot A is the bank the camera boots now: writing it asks you to acknowledge the risk',
    ]);
    /* The CLI shows the camera's notes nowhere else before a write, so all three kinds are printed. */
    expect(lines.slice(notes + 1).filter((line) => line.startsWith('  ·'))).toEqual([
      '  · how this write is checked',
      '  · the bank’s own note',
      '  · Staged: the image, XORed with its own key block 0',
    ]);
  });

  it('prints no Notes heading for a plan with none', () => {
    const text = flashPlanLines(fakePlan('b', 'plain', new Uint8Array(4)), 'x.bin', null, false);
    expect(text).not.toContain('Notes');
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
    expect(text).toContain('ff.bin — decrypted 1.3.0.8 FF image');
    expect(text).toMatch(
      /staging\s+the 1\.3\.0\.8 FF image as the vendor app stages it \(XOR Key A\) — the camera stores it under Key B/,
    );
    /* Said once: the image row says what the file is, the staging row how it is sent. */
    expect(text.match(/vendor app/g)).toHaveLength(1);
    expect(text).not.toContain('key-a-keystream');
    expect(text).toMatch(/running build\s+your word \(--running-16hz\)/);
    expect(text).not.toContain('encrypted for this bank');
    expect(text).toContain('sha256 feedface');
    expect(text).toContain('! UNTESTED: the boot of the written bank is not measured');
  });

  it('asks which bank is written, and says when the camera boots it now', () => {
    const plan = fakePlan('a', 'plain', new Uint8Array(4));
    expect(flashQuestion(report, plan, 'image.bin')).toBe(
      'Write image.bin to slot A (the bank the camera boots now) on Seek Compact PRO (SN-1)? [y/N] ',
    );
    const other = fakePlan('b', 'plain', new Uint8Array(4));
    expect(flashQuestion(report, other, 'image.bin')).toContain('to slot B on');
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
    /* The one replug instruction, with the CLI's own re-read command: core's end-of-write progress gives
     * neither (TESTING.md 42.87). */
    for (const verified of [true, false, null]) {
      const text = readBackLines({ ...base, verified }, null, false).join('\n');
      expect(text.match(/plug it back in/g)).toHaveLength(1);
      expect(text).toContain(
        'Unplug the camera and plug it back in. A bank is only used when the camera boots, so the new ' +
          'image runs after the next start. Then run `seek-fw slots list` to read the banks again.',
      );
      expect(text).not.toContain('device info');
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
      'seek-slot-b-4.9.5.0-deadbeef-decrypted.bin',
      'seek-slot-b-4.9.5.0-deadbeef.bin',
    ]);
    const raw = await readFile(join(out, 'seek-slot-b-4.9.5.0-deadbeef.bin'));
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
    ).rejects.toThrow(/recovery R is the bank the bootloader falls back to/);
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

  it('after a write, says the replug once with its own re-read command, in a pipe and on a terminal (TESTING.md 42.87)', async () => {
    for (const isTty of [false, true]) {
      const { ops } = fakeOps(reportOf({ booted: 'a' }));
      /* Core's flashSlot ends on this progress line (slots/write.ts); the CLI gives the instruction. */
      const withProgress: SlotOps = {
        ...ops,
        write: (ctx, report, plan, options) => {
          ctx.reporter.progress(1, 1, 'Written.');
          return ops.write(ctx, report, plan, options);
        },
      };
      await writeFile(join(temp.path, 'image.bin'), new Uint8Array(0x100).fill(7));
      const stderr = new MemorySink({ isTty });
      const test = { ...cameraIo({ stderr }), stderr };
      await slotsCommandWith(withProgress)(
        contextFor(
          ['slots', 'flash', 'b', join(temp.path, 'image.bin'), '--yes', '--no-probe'],
          test,
        ),
      );
      const said = `${test.stdout.text}\n${stderr.text}`;
      expect(
        said.match(/plug it back in|unplug and replug/gi),
        `tty ${String(isTty)}`,
      ).toHaveLength(1);
      expect(said, `tty ${String(isTty)}`).toContain(
        'Then run `seek-fw slots list` to read the banks again.',
      );
      expect(said, `tty ${String(isTty)}`).not.toContain('device info');
      expect(stderr.text, `tty ${String(isTty)}`).toContain('Written.');
    }
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
        notes: [
          { source: 'write', text: 'the bank holds the image XOR Key B' },
          { source: 'camera', text: 'a camera-wide note' },
        ],
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
    expect(test.stdout.text).toMatch(
      /staging\s+the 1\.3\.0\.8 FF image as the vendor app stages it/,
    );
    expect(test.stdout.text).toContain('! UNTESTED: the boot of the written bank is not measured');
    expect(test.stdout.text).toContain('  · the bank holds the image XOR Key B');
    expect(test.stdout.text).not.toContain('! Note:');
    /* The JSON: `warnings` the plan's warnings, `planNotes` its notes with their source, `notes` the write's
     * own (TESTING.md 42.88). */
    expect(result).toMatchObject({
      action: 'flash',
      bank: 'r',
      staging: 'key-a-keystream',
      written: true,
      verified: true,
      warnings: ['UNTESTED: the boot of the written bank is not measured'],
      planNotes: [
        { source: 'write', text: 'the bank holds the image XOR Key B' },
        { source: 'camera', text: 'a camera-wide note' },
      ],
    });
  });

  it('an image that is not the build the camera runs: the plan prints the warning in words, --json carries it with its code, and the write is not held back (TESTING.md 42.104)', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    const text =
      'This image is firmware 4.9.4.0; the camera runs 4.9.5.0. Whether this camera takes a ' +
      'different build, and runs it, has not been checked.';
    const imageBuild = {
      code: 'other-version' as const,
      image: '4.9.4.0',
      camera: '4.9.5.0',
      text,
    };
    const other: SlotOps = {
      ...ops,
      prepare: (report, key, input) => ({
        ...ops.prepare(report, key, input),
        warnings: [text],
        imageBuild,
      }),
    };
    await writeFile(join(temp.path, 'other.bin'), new Uint8Array(0x100).fill(7));
    const args = ['slots', 'flash', 'b', join(temp.path, 'other.bin'), '--no-probe'];

    const human = cameraIo();
    await slotsCommandWith(other)(contextFor([...args, '--dry-run'], human));
    expect(human.stdout.text).toContain(`! ${text}`);
    expect(human.stdout.text).not.toContain('other-version');

    const machine = cameraIo();
    const json = await slotsCommandWith(other)(contextFor([...args, '--json', '--yes'], machine));
    expect(json).toMatchObject({
      action: 'flash',
      bank: 'b',
      written: true,
      warnings: [text],
      imageBuild,
    });
    /* The plan is still shown in words (the CLI logs it to stderr under --json; this harness's reporter logs
     * to its stdout sink). */
    expect(machine.stdout.text).toContain(`! ${text}`);
    expect(log.flashed).toEqual([{ key: 'b', options: { verify: true, acknowledgeRisk: false } }]);
  });

  it('the same build: --json says imageBuild null', async () => {
    const { ops } = fakeOps(reportOf({ booted: 'a' }));
    await writeFile(join(temp.path, 'same.bin'), new Uint8Array(0x100).fill(7));
    const json = await slotsCommandWith(ops)(
      contextFor(
        ['slots', 'flash', 'b', join(temp.path, 'same.bin'), '--dry-run', '--json', '--no-probe'],
        cameraIo(),
      ),
    );
    expect(json).toMatchObject({ dryRun: true, imageBuild: null });
  });

  it('without --acknowledge-risk the FF image is not written to recovery R, and nothing is prepared', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    await writeFile(join(temp.path, 'ff.bin'), new Uint8Array(0x100).fill(7));
    const test = cameraIo();
    await expect(
      slotsCommandWith(ops)(
        contextFor(['slots', 'flash', 'r', join(temp.path, 'ff.bin'), '--yes', '--no-probe'], test),
      ),
    ).rejects.toThrow(/recovery R is the bank the bootloader falls back to/);
    expect(log.prepared).toEqual([]);
    expect(log.flashed).toEqual([]);
  });

  /* The fake stands for a refusal core does make (write.ts ffRunningRefusal). Before 42.82 it said the FF
   * image goes to R only, which core stopped saying in 42.12 (A, B and R take it). */
  it('shows a core refusal of the FF image (the camera runs the 8 Hz build), and writes nothing', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    const refusing: SlotOps = {
      ...ops,
      prepare: () => {
        throw new SeekError(
          'slots/refused',
          'this is the 1.3.0.8 FF (16 Hz) image, but the camera runs the 8 Hz 1.3.0.8 application. Nothing was sent.',
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
    expect((error as SeekError).message).toContain('the camera runs the 8 Hz 1.3.0.8 application');
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
    expect(test.questions[0]).toContain('Write image.bin to slot B');
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

  it('shows the plan even under --quiet, because it is about to be confirmed', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    await writeFile(join(temp.path, 'image.bin'), new Uint8Array(64).fill(1));
    const test = cameraIo({ stdinIsTty: true, answer: false });
    await expect(
      slotsCommandWith(ops)(
        contextFor(
          ['slots', 'flash', 'b', join(temp.path, 'image.bin'), '--no-probe', '--quiet'],
          test,
        ),
      ),
    ).rejects.toThrow(/aborted at the confirmation prompt/);
    expect(test.questions).toHaveLength(1);
    expect(test.stdout.text).toContain('Slot flash plan');
    expect(test.stdout.text).toContain('transfer checksum');
    expect(log.flashed).toEqual([]);
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
  it('says once that the camera stays unlocked when the run sent the unlock token', async () => {
    /* No --no-probe: the probe's 18-byte authenticated arm is the token, and it is accepted by this fake */
    const test = cameraIo();
    await run(['slots', 'list'], test.io, new AbortController().signal);
    const notes = test.stdout.text.split('\n').filter((line) => line.includes('stays unlocked'));
    expect(notes).toHaveLength(1);
    expect(notes[0]).toContain('until a power cycle, and other tools may misread it');
    expect(notes[0]).toContain('power-cycle it before you use them');
  });

  it('says so for info too, which also probes by default', async () => {
    const test = cameraIo();
    await run(['info'], test.io, new AbortController().signal);
    expect(test.stdout.text).toContain('stays unlocked until a power cycle');
  });

  it('says nothing about the unlock when the run sent no token (--no-probe)', async () => {
    const test = cameraIo();
    await run(['slots', 'list', '--no-probe'], test.io, new AbortController().signal);
    expect(test.stdout.text).not.toContain('stays unlocked');
    expect(test.stderr.text).not.toContain('stays unlocked');
  });

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
      expect(text).toMatch(/A\s+0x14030000\s+yes\s+4\.9\.5\.0/);
      expect(text).toMatch(/B\s+0x14050000\s+no\s+empty\s+-\s+-\s+-\s+-/);
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
      expect(text).toContain('To give it the firmware slot A holds');
      expect(text).toContain('`seek-fw slots copy a b`');
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
      expect(flashRefusal(recovery, 'r', 'plain', false)?.message).toMatch(
        /recovery R is the bank the bootloader falls back to/,
      );
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
        'slot B is empty and cannot be written on this build: no empty writes here',
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
      expect(artifacts.map((artifact) => artifact.name)).toEqual([
        'seek-slot-b-empty-ffeeddcc.bin',
      ]);
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
      expect(await readdir(out)).toEqual(['seek-slot-b-empty-ffeeddcc.bin']);
      const raw = await readFile(join(out, 'seek-slot-b-empty-ffeeddcc.bin'));
      expect(raw).toHaveLength(0x10000);
      expect(raw.every((byte) => byte === 0xff)).toBe(true);
      expect(test.stdout.text).toContain('Slot B: empty, nothing to decrypt');
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
        'seek-slot-a-4.9.5.0-deadbeef-decrypted.bin',
        'seek-slot-a-4.9.5.0-deadbeef.bin',
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
        'Write image.bin to slot B (empty — nothing is overwritten) on Seek Compact PRO (SN-1)? [y/N] ',
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
        'Write image.bin to slot B (empty — nothing is overwritten)',
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
      expect(result).toMatchObject({
        written: false,
        dryRun: true,
        targetEmpty: true,
        warnings: [],
        planNotes: [],
      });
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
      expect(test.stdout.text).toContain('seek-slot-<bank>-empty-<sha8>.bin');
    });
  });
});

/* ---- the keys every bank is written under, derived from the booted bank ---- */

const KEY_A_BYTES = Uint8Array.from({ length: 16 }, (_, i) => 0xa0 + i);
const KEY_B_BYTES = Uint8Array.from({ length: 16 }, (_, i) => 0xb0 + i);

/** A camera whose booted slot A decrypts under its store key (Key B) and carries the application's pair. */
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
      'Key B, derived from the booted slot A; every bank is written the same way',
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
    expect(text).toContain('Key B, derived from the booted slot A');
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
  it('says the booted bank "boots now" in its risk words, as on every line (TESTING.md 42.89)', () => {
    const locked = onLockedPlain(reportOf({ booted: 'a' }));
    expect(bootRisk(locked, view(locked, 'a'))).toBe(
      'slot A is the bank the camera boots now; a bad write there can stop the camera booting',
    );
    expect(flashRefusal(locked, 'a', 'plain', false)?.message).toContain(
      'slot A is the bank the camera boots now',
    );
    expect(flashRefusal(locked, 'a', 'plain', false)?.message).not.toContain('active-slot word');

    const modern = reportOf({ booted: 'a' });
    expect(bootRisk(modern, view(modern, 'a'))).toBe(bootRisk(locked, view(locked, 'a')));
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
    expect(listResult(bench).writeKeys).toMatchObject({ refused: null, form: 'plain' });
  });

  /* The 1.3.0.8 FF build on a camera with no bank stored plain (TESTING.md 42.89): the list said its write
   * keys were "refused" (the Key A derivation, which this build does not use) while the writer offers the FF
   * image in the vendor's form. The list, the JSON and the page now say that form, in core's words. */
  it('the 1.3.0.8 FF build with no bank stored plain: the write keys are the vendor form, not "refused"', () => {
    const ff = onLockedPlain(reportOf({ booted: null }));
    expect(ff.state.plainChain).toBe(false);
    const text = writeKeyLines(ff, false).join('\n');
    expect(text).not.toMatch(/^\s+refused\s/m);
    expect(text).not.toContain('refused');
    expect(text).toMatch(
      /staged as\s+the 1\.3\.0\.8 FF \(16 Hz\) image as the vendor app stages it/,
    );
    expect(text).toContain(FF_VENDOR_STAGED);
    expect(text).toMatch(/stored as\s+Key B: the camera re-keys the upload with key block 1/);
    expect(text).toContain(FF_VENDOR_STORED);
    expect(text).toContain('UNTESTED');
    expect(listResult(ff).writeKeys).toMatchObject({
      refused: null,
      form: 'ff-vendor',
      key: 'Key B',
    });
  });

  it('the list shows a plain bank as stored plain, not under a key nobody knows', () => {
    const text = listLines(plainChainBench(), false).join('\n');
    expect(text).toContain('none (plaintext)');
    expect(text).not.toContain('unknown key');
  });

  /* The 2016 keystream line stages each image under the key pair it carries (TESTING.md 42.19): it needs no
   * key table, so an unread one refuses nothing. The list and the JSON must agree with the page: no refusal,
   * and no derived key claimed. */
  it('the 2016 keystream line is not refused for a key table it does not need, and the list claims no derived key', () => {
    const base = onLockedPlain(reportOf({ booted: 'a' }));
    const state = {
      ...base.state,
      version: '1.0.3.0',
      plainChain: false,
      keyTable: null,
      bankWriteRefusals: [],
    } as unknown as DeviceState;
    const report: SlotsReport = { ...base, state };
    expect(listResult(report).writeKeys).toMatchObject({ refused: null });
    const text = writeKeyLines(report, false).join('\n');
    expect(text).not.toContain('cannot be written');
    expect(text).not.toContain('derived from the booted bank');
  });
});

/* ==================================================================== *
 * The Mosaic-shaped camera through `slots flash`, with core's own prepare (TESTING.md 42.82 F3)
 * ==================================================================== */

/* The removed whole-image writer refused Mosaic 10.9.1.31 for its application's keys (the pilot pair, not
 * the bootloader's). The slot page replaced that refusal with the upload-key derivation (TESTING.md 42.7):
 * on 10.9.1.31 it derives the three-mask upload, and on a build that checks an upload under its own keys
 * it refuses. The CLI reaches that derivation only through core's `prepareSlotFlash`, so these run the
 * command with core's real prepare (the camera analysis and the commit are the only fakes) and hold the
 * CLI's answer to the page's: the same refusal text as the page's banner, and the same upload bytes. */
describe('slots flash on a Mosaic-shaped camera: the page’s key derivation, through the CLI (TESTING.md 42.82 F3)', () => {
  const modern = getProfile('modern-4x');
  const BOOT_A = Uint8Array.from({ length: 16 }, (_, i) => 0xa0 + i);
  const BOOT_B = Uint8Array.from({ length: 16 }, (_, i) => 0xb0 + i);
  const pilot = APPLICATION_KEY_PAIRS.find((p) => p.builds.includes('Mosaic 10.9.1.31'));
  if (pilot === undefined) throw new Error('the decoded Mosaic 10.9.1.31 pair is not in the table');
  let temp: { path: string; cleanup: () => Promise<void> };

  beforeEach(async () => {
    temp = await tempDir();
  });
  afterEach(async () => {
    await temp.cleanup();
  });

  /** A decrypted-looking image: SRAM stack pointer, Thumb reset vector, the magic, and a key pair. */
  function imageWith(seed: number, keyA: Uint8Array, keyB: Uint8Array): Uint8Array {
    const out = new Uint8Array(0x5000);
    let s = seed;
    for (let i = 0; i < out.length; i++) {
      s = (s * 1103515245 + 12345) >>> 0;
      out[i] = s >>> 24;
    }
    const dv = new DataView(out.buffer);
    dv.setUint32(0, 0x10001000, true);
    dv.setUint32(4, 0x10000101, true);
    dv.setUint32(0x200, IMAGE_MAGIC, true);
    dv.setUint32(LENGTH_OFFSET, out.length, true);
    out.set(keyA, 0x4100);
    out.set(keyB, 0x4120);
    return out;
  }

  /** The analysis the page and the CLI both act on: booted A under the bootloader's Key A, its application the pilot's. */
  function mosaicReport(version: string): SlotsReport {
    const bank = (key: SlotKey, plain: Uint8Array | null): SlotState => ({
      key,
      name: `slot ${key.toUpperCase()}`,
      subcmd: null,
      address: ADDRESS[key],
      present: true,
      reason: null,
      unread: false,
      blank: false,
      header: null,
      raw: null,
      footer: null,
      recovered: null,
      plain,
      plainHeader: null,
      accepts: true,
      footerOk: true,
      sha256: null,
      keyName: 'Key A',
      bootable: true,
      bootability: 'bootable',
    });
    const slots = [
      bank('a', imageWith(3, hexToBytes(pilot!.keyA), hexToBytes(pilot!.keyB))),
      bank('b', null),
      bank('r', null),
    ];
    const state = {
      ...deviceStateFake(),
      version,
      profile: modern,
      slots,
      byKey: new Map(slots.map((s) => [s.key, s])),
      boot: { booted: 'a', target: 'b' },
      keyTable: { keyA: BOOT_A, keyB: BOOT_B, offset: 0, matchA: true, matchB: true },
      keyWhiteningK: modern.cipher.whiteningK,
      storeKey: { name: 'Key B', key: BOOT_B, programmed: false },
      deviceKeySlot: null,
      bankWriteRefusals: [],
      plainChain: false,
    } as unknown as DeviceState;
    const plan = buildSlotPlan(modern, version);
    return {
      state,
      plan,
      slots: plan.slots.map((entry) => ({
        entry,
        state: state.byKey.get(entry.key) ?? null,
        unreadReason: null,
        content: 'image' as const,
        active: entry.key === 'a',
      })),
    };
  }

  /** The command with core's own prepare; the commit is recorded, not sent. */
  function realPrepare(report: SlotsReport): {
    readonly ops: SlotOps;
    readonly plans: SlotFlashPlan[];
  } {
    const { ops } = fakeOps(report);
    const plans: SlotFlashPlan[] = [];
    return {
      plans,
      ops: {
        ...ops,
        prepare: prepareSlotFlash,
        write: (_ctx, _report, plan, options) => {
          plans.push(plan);
          return Promise.resolve({
            written: { key: plan.key, commitStatus: 0, verified: null, after: null, notes: [] },
            backup: backupOf([plan.key], options.action),
          });
        },
      },
    };
  }

  async function flashB(
    ops: SlotOps,
    test: TestIo,
    extra: readonly string[] = [],
  ): Promise<unknown> {
    const name = `image${keyFilenameSuffix(BOOT_A, BOOT_B)}.bin`;
    await writeFile(join(temp.path, name), imageWith(9, BOOT_A, BOOT_B));
    return slotsCommandWith(ops)(
      contextFor(
        ['slots', 'flash', 'b', join(temp.path, name), '--yes', '--no-probe', ...extra],
        test,
      ),
    ).catch((caught: unknown) => caught);
  }

  it('a build that checks its upload under its own keys (4.16.1.7): the CLI refuses with the page’s banner text, and nothing is sent', async () => {
    const report = mosaicReport('4.16.1.7');
    const banner = writeBannerOf(report.state);
    expect(banner).toMatch(/checks an upload under its own keys/);
    const { ops, plans } = realPrepare(report);
    const test = cameraIo();
    const error = await flashB(ops, test);
    expect(error).toBeInstanceOf(Error);
    expect((error as { code?: string }).code).toBe('slots/refused');
    expect((error as Error).message).toContain(banner!);
    expect(plans).toEqual([]);
    expect(test.stdout.text).not.toContain('Slot flash plan');
  });

  it('the same camera with --raw --dry-run: the CLI refuses with the banner before any plan, as the page turns the raw control off (TESTING.md 42.82 F4)', async () => {
    const report = mosaicReport('4.16.1.7');
    const banner = writeBannerOf(report.state);
    const { ops, plans } = realPrepare(report);
    const test = cameraIo();
    const result = await flashB(ops, test, ['--raw', '--dry-run']);
    expect(result).toBeInstanceOf(CliError);
    expect((result as CliError).code).toBe('slots/refused');
    expect((result as CliError).message).toContain(banner!);
    expect(test.stdout.text).not.toContain('Slot flash plan');
    expect(plans).toEqual([]);
  });

  it('Mosaic 10.9.1.31: the CLI sends the upload the page builds, under the key derived from the booted bank', async () => {
    const report = mosaicReport('10.9.1.31');
    expect(writeBannerOf(report.state)).toBeNull();
    const { ops, plans } = realPrepare(report);
    const test = cameraIo();
    const result = await flashB(ops, test);
    expect(result).toMatchObject({ action: 'flash', bank: 'b', written: true });
    expect(plans).toHaveLength(1);
    const page = prepareSlotFlash(report, 'b', {
      kind: 'plain',
      bytes: imageWith(9, BOOT_A, BOOT_B),
      fileName: `image${keyFilenameSuffix(BOOT_A, BOOT_B)}.bin`,
    });
    expect(equalBytes(plans[0]!.payload, page.payload)).toBe(true);
    expect(plans[0]!.derivedFrom).toEqual({ bank: 'a', key: 'Key A', holds: 'Key A' });
    expect(test.stdout.text).toMatch(/key\s+Key A, derived from the booted slot A/);
  });
});

/* ==================================================================== *
 * patch-fps: the frame-rate patch on one bank, offline (core is faked)
 * ==================================================================== */

type OfferPlan = Extract<FpsPlan, { status: 'offer' }>;

/** A plan the way core makes one for the 1.3.0.0 stock bank: 8 Hz to 32 Hz, one byte changed plus the sum word. */
function offerOf(): OfferPlan {
  return {
    status: 'offer',
    patch: {
      id: 'compact_32k-1.3.0.0-to32',
      family: 'compact_32k',
      version: '1.3.0.0',
      fromHz: 8,
      targetHz: 32,
      row: {
        name: 'the steady frame row (row 8)',
        detail: 'mode-8 capture program, block 8',
        offset: 0xb898,
        length: 34,
      },
    } as unknown as OfferPlan['patch'],
    fromHz: 8,
    toHz: 32,
    sites: [{ offset: 0xb898, before: 0x84, after: 0x81 }],
    sumWord: { offset: 0x238, before: 0 },
  };
}

/** The result core returns for a written patch, with every check passing. */
function writtenResult(backup: WriteBackup, key: SlotKey = 'a'): FpsPatchResult {
  const plain = new Uint8Array(0xbaa8).fill(0x22);
  return {
    key,
    patch: offerOf().patch,
    fromHz: 8,
    toHz: 32,
    backup,
    patched: plain,
    changed: [0xb898, 0x238],
    plan: fakePlan(key, 'plain', plain),
    written: {
      key,
      commitStatus: 0,
      verified: true,
      after: new Uint8Array(0x10000).fill(0x11),
      notes: [],
    },
    readBack: { checked: true, differing: [0xb898, 0x238], missing: [], unexpected: [], ok: true },
    notes: ['committed 47768 B to Bank A'],
  };
}

/** The patch's backup, as core builds it for slot A. */
function patchBackup(key: SlotKey = 'a'): WriteBackup {
  return backupOf([key], { kind: 'fps-patch' });
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
    expect(() => parseSlotsArgs(['dump', 'a'], { ...flags, write: false })).toThrow(
      /--dump-dir applies only to 'slots flash', 'slots copy', 'slots restore', 'slots patch-fps'/,
    );
    expect(parseSlotsArgs(['patch-fps', 'ALL'], { ...flags, raw: false })).toEqual({
      action: 'patch-fps',
      key: 'all',
    });
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
      toHz: 32,
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

  it('refuses a patched bank in words that say its state, with no table id', async () => {
    const { ops } = fakeOps(reportOf({ booted: 'b' }));
    const withPlan: SlotOps = {
      ...ops,
      fpsPlan: () => ({
        status: 'patched',
        reason: 'the frame-rate patch is already applied: this image runs at 18 Hz',
        hz: 18,
      }),
    };
    const error = await slotsCommandWith(withPlan)(
      contextFor(['slots', 'patch-fps', 'a', '--no-probe'], cameraIo()),
    ).catch((caught: unknown) => caught);
    expect((error as CliError).message).toBe(
      'slot A: the frame-rate patch is already applied: this image runs at 18 Hz',
    );
  });

  it('refuses to patch the booted bank without --acknowledge-risk, before the plan, the question and the dump (TESTING.md 42.86)', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }));
    let patched = 0;
    const withPatch: SlotOps = {
      ...ops,
      fpsPlan: () => offerOf(),
      patchFps: () => {
        patched += 1;
        return Promise.reject(new Error('must not be reached'));
      },
    };
    const dir = join(temp.path, 'refused');
    const test = cameraIo();
    const error = await slotsCommandWith(withPatch)(
      contextFor(
        ['slots', 'patch-fps', 'a', '--write', '--dump-dir', dir, '--yes', '--no-probe'],
        test,
      ),
    ).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(CliError);
    expect((error as CliError).code).toBe('slots/refused');
    expect((error as CliError).message).toBe(
      'refusing to patch slot A: slot A is the bank the camera boots now; a bad write there can stop the camera booting',
    );
    expect((error as CliError).hint).toContain('Pass --acknowledge-risk to patch it anyway.');
    expect((error as CliError).message + ((error as CliError).hint ?? '')).not.toContain(
      'acknowledgeRisk',
    );
    expect(patched).toBe(0);
    expect(log.flashed).toEqual([]);
    expect(test.stdout.text).not.toContain('Frame-rate patch plan');
    await expect(readdir(dir)).rejects.toThrow();
  });

  it('after a patch, says the replug once with its own re-read command, in a pipe and on a terminal (TESTING.md 42.87)', async () => {
    for (const isTty of [false, true]) {
      const { ops } = fakeOps(reportOf({ booted: 'a' }));
      const withPatch: SlotOps = {
        ...ops,
        fpsPlan: () => offerOf(),
        patchFps: async (ctx, _report, _key, options) => {
          const backup = patchBackup();
          await options.saveBackup(backup);
          /* Core's flashSlot ends on this progress line (slots/write.ts). */
          ctx.reporter.progress(1, 1, 'Written.');
          return writtenResult(backup);
        },
      };
      const stderr = new MemorySink({ isTty });
      const test = { ...cameraIo({ stderr }), stderr };
      await slotsCommandWith(withPatch)(
        contextFor(
          [
            'slots',
            'patch-fps',
            'b',
            '--write',
            '--dump-dir',
            join(temp.path, `tty-${String(isTty)}`),
            '--yes',
            '--no-probe',
          ],
          test,
        ),
      );
      const said = `${test.stdout.text}\n${stderr.text}`;
      expect(
        said.match(/plug it back in|unplug and replug/gi),
        `tty ${String(isTty)}`,
      ).toHaveLength(1);
      expect(said, `tty ${String(isTty)}`).toContain(
        'Unplug the camera and plug it back in. The patched image runs after the next start. Then run ' +
          '`seek-fw slots list` to read the banks again.',
      );
      expect(said, `tty ${String(isTty)}`).not.toContain('device info');
    }
  });

  it('refuses to patch recovery R without --acknowledge-risk, and patches it with it', async () => {
    const { ops } = fakeOps(reportOf({ booted: 'a' }));
    const keys: SlotKey[] = [];
    const withPatch: SlotOps = {
      ...ops,
      fpsPlan: () => offerOf(),
      patchFps: async (_ctx, _report, key, options) => {
        keys.push(key);
        expect(options.acknowledgeRisk).toBe(true);
        const backup = patchBackup('r');
        await options.saveBackup(backup);
        return writtenResult(backup, 'r');
      },
    };
    const refused = await slotsCommandWith(withPatch)(
      contextFor(
        [
          'slots',
          'patch-fps',
          'r',
          '--write',
          '--dump-dir',
          join(temp.path, 'r1'),
          '--yes',
          '--no-probe',
        ],
        cameraIo(),
      ),
    ).catch((caught: unknown) => caught);
    expect((refused as CliError).message).toMatch(
      /^refusing to patch recovery R: recovery R is the bank the bootloader falls back to/,
    );
    expect(keys).toEqual([]);
    const result = await slotsCommandWith(withPatch)(
      contextFor(
        [
          'slots',
          'patch-fps',
          'r',
          '--write',
          '--dump-dir',
          join(temp.path, 'r2'),
          '--yes',
          '--acknowledge-risk',
          '--no-probe',
        ],
        cameraIo(),
      ),
    );
    expect(result).toMatchObject({ action: 'patch-fps', written: true });
    expect(keys).toEqual(['r']);
  });

  it('the dry run on the booted bank names --acknowledge-risk in the command it suggests', async () => {
    const { ops } = fakeOps(reportOf({ booted: 'a' }));
    const withPlan: SlotOps = { ...ops, fpsPlan: () => offerOf() };
    const test = cameraIo();
    await slotsCommandWith(withPlan)(contextFor(['slots', 'patch-fps', 'a', '--no-probe'], test));
    const text = test.stdout.text + test.stderr.text;
    expect(text).toContain('Add --write --acknowledge-risk to patch slot A.');
    const unbooted = cameraIo();
    await slotsCommandWith(withPlan)(
      contextFor(['slots', 'patch-fps', 'b', '--no-probe'], unbooted),
    );
    expect(unbooted.stdout.text + unbooted.stderr.text).toContain('Add --write to patch slot B.');
  });

  it('the plan names the undo for recovery R without "if the camera boots" it', () => {
    const lines = fpsPlanLines('r', offerOf(), 0x14070000, '1.3.0.0', false, 'saved first').join(
      '\n',
    );
    expect(lines).toContain('(add --acknowledge-risk as for every write to recovery R).');
    expect(lines).not.toContain('if the camera boots recovery R');
    expect(
      fpsPlanLines('a', offerOf(), 0x14050000, '1.3.0.0', false, 'saved first').join('\n'),
    ).toContain('(add --acknowledge-risk if the camera boots slot A).');
  });

  it('names the row in words; the JSON keeps the table’s own label as row.detail (TESTING.md 42.88)', () => {
    const text = fpsPlanLines('b', offerOf(), 0x14050000, '1.3.0.0', false, 'saved first').join(
      '\n',
    );
    expect(text).toMatch(/^ {2}row\s+the steady frame row \(row 8\)$/m);
    expect(text).not.toContain('mode-8 capture program');
    expect(fpsPlanJson(offerOf())).toMatchObject({
      row: {
        name: 'the steady frame row (row 8)',
        detail: 'mode-8 capture program, block 8',
        offset: '0xB898',
        length: 34,
      },
    });
    expect(fpsPlanJson({ status: 'refused', reason: 'no entry' })).toMatchObject({ row: null });
  });

  it('without --dump-dir, a write saves its backup into the current directory, as the page needs no question', () => {
    expect(backupDirOf({ ...NO_FLAGS, dumpDir: null })).toBe(resolve('.'));
    expect(backupDirOf({ ...NO_FLAGS, dumpDir: 'here' })).toBe(resolve('here'));
  });

  it('saves the backup zip first, then writes, and the zip is on disk under core’s name', async () => {
    const { ops } = fakeOps(reportOf({ booted: 'b' }));
    const dir = join(temp.path, 'before');
    const order: string[] = [];
    const withPatch: SlotOps = {
      ...ops,
      fpsPlan: () => offerOf(),
      patchFps: async (_ctx, _report, _key, options) => {
        order.push('patch');
        const backup = patchBackup();
        expect(await options.saveBackup(backup)).toBe(true);
        order.push('written');
        return writtenResult(backup);
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
    const name = patchBackup().fileName;
    expect(await readdir(dir)).toEqual([name]);
    expect(new Uint8Array(await readFile(join(dir, name)))).toEqual(patchBackup().zip);
    expect(result).toMatchObject({
      backup: { directory: dir, file: join(dir, name), fileName: name },
    });
  });

  it('never replaces a backup that already exists: a second one of the same second is saved beside it', async () => {
    const dir = join(temp.path, 'twice');
    const reporter = new TerminalReporter({
      log: new MemorySink(),
      progress: new MemorySink(),
      color: false,
      quiet: false,
      verbose: false,
    });
    const first = await readdir(dir).catch(() => []);
    expect(first).toEqual([]);
    expect(await saveBackupInto(dir, reporter)(patchBackup())).toBe(true);
    expect(await saveBackupInto(dir, reporter)(patchBackup())).toBe(true);
    expect((await readdir(dir)).sort()).toEqual([
      `${patchBackup().name}-2.zip`,
      patchBackup().fileName,
    ]);
  });

  it('fails the run with a non-zero exit when the read-back does not match the plan', async () => {
    const { ops } = fakeOps(reportOf({ booted: 'b' }));
    const withPatch: SlotOps = {
      ...ops,
      fpsPlan: () => offerOf(),
      patchFps: async (_ctx, _report, _key, options) => {
        const backup = patchBackup();
        await options.saveBackup(backup);
        return {
          ...writtenResult(backup),
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

/* ==================================================================== *
 * The backup every write saves first, copy, restore, and patch-fps all (TESTING.md 42.91)
 * ==================================================================== */

/** Core's planSlotCopy, faked: the target prepared as a decrypted image of the source's. */
function withCopy(ops: SlotOps): SlotOps {
  return {
    ...ops,
    copy: (_report, from, to) => ({
      from,
      to,
      fileName: `seek-slot-${from}-4.9.5.0-deadbeef-decrypted.bin`,
      source: `slot ${from.toUpperCase()} at ${ADDRESS[from].toString(16)}, firmware 4.9.5.0, as the slots read decrypted it`,
      plan: fakePlan(to, 'plain', new Uint8Array(0x1000).fill(0x01)),
    }),
  };
}

/** Core's planSlotRestore, faked: bank `key` of a full flash file, with the stored bytes the read-back is compared with. */
function restorePlanOf(key: SlotKey, stored: Uint8Array, name: string): SlotRestorePlan {
  const plain = new Uint8Array(0x1000).fill(0x01);
  return {
    key,
    backup: {
      fileName: name,
      flash: new Uint8Array(0),
      sha256: 'ab'.repeat(32),
      from: 'flash-file',
      entry: null,
      identity: { serial: 'SN-1', chipId: '090BE9B6D4E4' },
    },
    stored,
    storedSha256: 'cd'.repeat(32),
    sameAsNow: false,
    sameCamera: true,
    version: '4.9.5.0',
    decryption: { plain, plainSha256: 'ef'.repeat(32) } as unknown as SlotRestorePlan['decryption'],
    fileName: `seek-slot-${key}-4.9.5.0-cdcdcdcd-decrypted.bin`,
    source: `the backup's slot ${key.toUpperCase()} in the full flash backup ${name}, firmware 4.9.5.0`,
    plan: fakePlan(key, 'plain', stored),
  };
}

describe('every write saves its bank first, as the page’s zip', () => {
  let temp: { path: string; cleanup: () => Promise<void> };
  beforeEach(async () => {
    temp = await tempDir();
  });
  afterEach(async () => {
    await temp.cleanup();
  });

  it('slots flash saves the zip into --dump-dir before the write, under core’s name, and the JSON says where', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }), { save: true });
    const image = join(temp.path, 'image.bin');
    await writeFile(image, new Uint8Array(0x100).fill(7));
    const dir = join(temp.path, 'saved');
    const test = cameraIo();
    const result = await slotsCommandWith(ops)(
      contextFor(['slots', 'flash', 'b', image, '--dump-dir', dir, '--yes', '--no-probe'], test),
    );
    const name = backupOf(['b'], { kind: 'flash', input: 'plain', fileName: 'image.bin' }).fileName;
    expect(name).toBe('seek_backup_2026-10-26T12-00-00Z_SN-1_v4.9.5.0_bank-B_before-flash.zip');
    expect(await readdir(dir)).toEqual([name]);
    expect(log.actions).toEqual([{ kind: 'flash', input: 'plain', fileName: 'image.bin' }]);
    expect(result).toMatchObject({
      action: 'flash',
      written: true,
      backup: { directory: dir, file: join(dir, name), fileName: name },
    });
    const text = test.stdout.text + test.stderr.text;
    expect(text).toContain(`saved first: ${join(dir, name)}`);
    expect(text).toMatch(
      /saved first\s+Before anything is written, slot B \(as stored[;,].*\) is read again/,
    );
    expect(text).toContain(`Into ${dir}.`);
  });

  it('the dry run names the zip with the time still to come, and saves nothing', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }), { save: true });
    const image = join(temp.path, 'image.bin');
    await writeFile(image, new Uint8Array(0x100).fill(7));
    const dir = join(temp.path, 'dry');
    const result = await slotsCommandWith(ops)(
      contextFor(
        ['slots', 'flash', 'b', image, '--raw', '--dump-dir', dir, '--dry-run', '--no-probe'],
        cameraIo(),
      ),
    );
    expect(log.flashed).toEqual([]);
    expect(result).toMatchObject({
      dryRun: true,
      backup: {
        directory: dir,
        fileName: 'seek_backup_<time>_SN-1_v4.9.5.0_bank-B_before-flash-raw.zip',
      },
    });
    await expect(readdir(dir)).rejects.toThrow();
  });
});

describe('slots copy', () => {
  let temp: { path: string; cleanup: () => Promise<void> };
  beforeEach(async () => {
    temp = await tempDir();
  });
  afterEach(async () => {
    await temp.cleanup();
  });

  it('parses copy, and refuses a copy onto itself', () => {
    expect(parseSlotsArgs(['copy', 'A', 'b'], NO_FLAGS)).toEqual({
      action: 'copy',
      from: 'a',
      to: 'b',
    });
    expect(() => parseSlotsArgs(['copy', 'a', 'a'], NO_FLAGS)).toThrow(/not copied onto itself/);
    expect(() => parseSlotsArgs(['copy', 'a'], NO_FLAGS)).toThrow(/needs two banks/);
    expect(() => parseSlotsArgs(['copy', 'a', 'b'], { ...NO_FLAGS, raw: true })).toThrow(
      /--raw applies only to 'slots flash'/,
    );
  });

  it('the dry run shows the plan with where the image comes from and what is saved first', async () => {
    const { ops, log } = fakeOps(withPlain(reportOf({ booted: 'a' })));
    const test = cameraIo();
    const result = await slotsCommandWith(withCopy(ops))(
      contextFor(['slots', 'copy', 'a', 'b', '--dry-run', '--no-probe'], test),
    );
    expect(log.flashed).toEqual([]);
    expect(result).toMatchObject({ action: 'copy', from: 'a', bank: 'b', dryRun: true });
    const text = test.stdout.text + test.stderr.text;
    expect(text).toContain('image taken from');
    /* TESTING.md 42.96: the image row names the source bank, not a made-up decrypted file name. */
    expect(text).toMatch(/image\s+slot A's image — /);
    expect(text).not.toContain('seek-slot-a-');
    expect(text).toContain('slot A at 14030000, firmware 4.9.5.0, as the slots read decrypted it');
    expect(text).toContain('_bank-B_before-copy-from-A.zip');
  });

  it('writes after the plan, saving the target first, with the copy named in the zip', async () => {
    const { ops, log } = fakeOps(withPlain(reportOf({ booted: 'a' })), { save: true });
    const dir = join(temp.path, 'copy');
    const result = await slotsCommandWith(withCopy(ops))(
      contextFor(['slots', 'copy', 'a', 'b', '--dump-dir', dir, '--yes', '--no-probe'], cameraIo()),
    );
    expect(log.actions).toEqual([{ kind: 'copy', from: 'a' }]);
    expect(await readdir(dir)).toEqual([
      'seek_backup_2026-10-26T12-00-00Z_SN-1_v4.9.5.0_bank-B_before-copy-from-A.zip',
    ]);
    expect(result).toMatchObject({ action: 'copy', written: true, verified: true });
  });

  it('refuses the booted bank as a target without --acknowledge-risk, and an empty source, with nothing sent', async () => {
    const { ops, log } = fakeOps(withPlain(reportOf({ booted: 'a', empty: ['b'] })));
    const booted = await slotsCommandWith(withCopy(ops))(
      contextFor(['slots', 'copy', 'r', 'a', '--yes', '--no-probe'], cameraIo()),
    ).catch((caught: unknown) => caught);
    expect((booted as CliError).message).toMatch(/^refusing to write slot A: slot A is the bank/);
    const empty = await slotsCommandWith(withCopy(ops))(
      contextFor(
        ['slots', 'copy', 'b', 'r', '--acknowledge-risk', '--yes', '--no-probe'],
        cameraIo(),
      ),
    ).catch((caught: unknown) => caught);
    expect((empty as CliError).message).toBe('slot B is empty: there is no image to copy');
    expect(log.flashed).toEqual([]);
  });
});

describe('slots restore', () => {
  let temp: { path: string; cleanup: () => Promise<void> };
  beforeEach(async () => {
    temp = await tempDir();
  });
  afterEach(async () => {
    await temp.cleanup();
  });

  it('parses restore', () => {
    expect(parseSlotsArgs(['restore', 'b', 'whole.bin'], NO_FLAGS)).toEqual({
      action: 'restore',
      key: 'b',
      file: 'whole.bin',
    });
    expect(() => parseSlotsArgs(['restore', 'b'], NO_FLAGS)).toThrow(
      /needs a bank and a full flash backup/,
    );
  });

  it('writes the bank cut from the backup, saves the target first, and says whether the read-back equals the backup', async () => {
    const { ops, log } = fakeOps(reportOf({ booted: 'a' }), { save: true });
    const stored = new Uint8Array(0x1000).fill(0x01);
    const file = join(temp.path, 'whole.bin');
    await writeFile(file, new Uint8Array(16));
    const dir = join(temp.path, 'restore');
    const withRestore: SlotOps = {
      ...ops,
      restore: (_report, key, picked) => Promise.resolve(restorePlanOf(key, stored, picked.name)),
    };
    const test = cameraIo();
    const result = await slotsCommandWith(withRestore)(
      contextFor(['slots', 'restore', 'b', file, '--dump-dir', dir, '--yes', '--no-probe'], test),
    );
    expect(log.actions).toEqual([{ kind: 'restore', fileName: 'whole.bin' }]);
    expect(result).toMatchObject({
      action: 'restore',
      bank: 'b',
      written: true,
      restoreReadBack: { compared: true, equal: true, differing: 0 },
      fullFlash: { serial: 'SN-1', sameCamera: true },
    });
    const text = test.stdout.text + test.stderr.text;
    expect(text).toContain('restore: slot B reads back byte for byte as the backup stores it.');
    expect(text).toMatch(
      /image taken from\s+the backup's slot B in the full flash backup whole\.bin/,
    );
    expect(text).toMatch(/image\s+slot B of whole\.bin — /);
    expect(await readdir(dir)).toEqual([
      'seek_backup_2026-10-26T12-00-00Z_SN-1_v4.9.5.0_bank-B_before-restore.zip',
    ]);
  });
});

describe('slots patch-fps all', () => {
  let temp: { path: string; cleanup: () => Promise<void> };
  beforeEach(async () => {
    temp = await tempDir();
  });
  afterEach(async () => {
    await temp.cleanup();
  });

  /** A report whose every bank offers the patch (core's fpsEveryBankPlan reads fpsPlanOfBank). */
  function everyOps(
    report: SlotsReport,
    done?: (
      options: Parameters<NonNullable<SlotOps['patchEveryFps']>>[2],
    ) => Promise<FpsEveryBankResult>,
  ): SlotOps {
    const { ops } = fakeOps(report);
    return {
      ...ops,
      patchEveryFps: (_ctx, _report, options) =>
        done === undefined ? Promise.reject(new Error('a dry run must not patch')) : done(options),
    };
  }

  it('refuses when no bank offers the patch, with each bank’s reason', async () => {
    const error = await slotsCommandWith(everyOps(reportOf({ booted: 'b' })))(
      contextFor(['slots', 'patch-fps', 'all', '--no-probe'], cameraIo()),
    ).catch((caught: unknown) => caught);
    expect((error as CliError).code).toBe('slots/refused');
    expect((error as CliError).message).toMatch(
      /^no bank offers the frame-rate patch \(slot A: slot A has /,
    );
  });

  it('the dry run shows each bank, the order (the booted bank last) and the one zip, and saves nothing', async () => {
    const ops: SlotOps = { ...everyOps(reportOf({ booted: 'a' })), fpsPlan: () => offerOf() };
    const test = cameraIo();
    const result = await slotsCommandWith(ops)(
      contextFor(['slots', 'patch-fps', 'all', '--no-probe'], test),
    );
    expect(result).toMatchObject({
      action: 'patch-fps',
      bank: 'all',
      order: ['b', 'r', 'a'],
      dryRun: true,
      written: false,
      backup: {
        fileName: 'seek_backup_<time>_SN-1_v4.9.5.0_bank-A-B-R_before-fps-patch-every-bank.zip',
      },
    });
    const text = test.stdout.text + test.stderr.text;
    expect(text).toContain('Frame-rate patch plan, every bank');
    expect(text).toMatch(
      /order\s+slot B, then recovery R, then slot A \(the bank the camera boots now last\)/,
    );
    expect(text).toContain('Add --write --acknowledge-risk to patch every bank that offers it.');
  });

  it('refuses without --acknowledge-risk when the booted bank or R is among them, before anything is saved', async () => {
    const dir = join(temp.path, 'refused');
    const ops: SlotOps = { ...everyOps(reportOf({ booted: 'a' })), fpsPlan: () => offerOf() };
    const error = await slotsCommandWith(ops)(
      contextFor(
        ['slots', 'patch-fps', 'all', '--write', '--dump-dir', dir, '--yes', '--no-probe'],
        cameraIo(),
      ),
    ).catch((caught: unknown) => caught);
    expect((error as CliError).message).toMatch(
      /^refusing to patch recovery R: recovery R is the bank the bootloader falls back to/,
    );
    await expect(readdir(dir)).rejects.toThrow();
  });

  it('writes every bank in one run after one save, and fails the run where it stopped', async () => {
    const dir = join(temp.path, 'every');
    const backup = backupOf(['a', 'b', 'r'], { kind: 'fps-patch-every-bank' });
    const ops: SlotOps = {
      ...everyOps(reportOf({ booted: 'a' }), async (options) => {
        expect(await options.saveBackup(backup)).toBe(true);
        options.onCommit?.('b');
        return {
          backup,
          order: ['b', 'r', 'a'],
          results: [writtenResult(backup, 'b')],
          stopped: {
            key: 'r',
            reason: 'Recovery bank R: CompleteMemoryUpgrade returned 0x00040005',
          },
          unwritten: ['a'],
        };
      }),
      fpsPlan: () => offerOf(),
    };
    const test = cameraIo();
    const error = await slotsCommandWith(ops)(
      contextFor(
        [
          'slots',
          'patch-fps',
          'all',
          '--write',
          '--acknowledge-risk',
          '--dump-dir',
          dir,
          '--yes',
          '--no-probe',
        ],
        test,
      ),
    ).catch((caught: unknown) => caught);
    expect((error as CliError).code).toBe('slots/verify-failed');
    expect((error as CliError).message).toBe(
      'stopped at recovery R: Recovery bank R: CompleteMemoryUpgrade returned 0x00040005',
    );
    expect(await readdir(dir)).toEqual([backup.fileName]);
    const text = test.stdout.text + test.stderr.text;
    expect(text).toContain('Slot B: commit status 0x0000');
    expect(text).toContain('not written: slot A');
    expect(text.match(/plug it back in/g)).toHaveLength(1);
  });
});

/* ==================================================================== *
 * The boot word and the frame-rate warning on the 2014 plaintext chain (boot-choice.ts)
 * ==================================================================== */

/** A 64 KiB bank as the analysis holds it: the bootloader accepts it (word sum 0) or refuses it (sum 1). */
function bankRaw(accepted: boolean): Uint8Array {
  const bank = new Uint8Array(0x10000);
  const dv = new DataView(bank.buffer);
  dv.setUint32(0x200, 0xa1b2c3d4, true);
  dv.setUint32(0x204, 0x4000, true);
  for (let i = 0x240; i < 0x4000; i += 4) dv.setUint32(i, (0x69000000 + i) >>> 0, true);
  let sum = 0;
  for (let i = 0; i < 0x4000; i += 4) {
    if (i !== 0x238) sum = (sum + dv.getUint32(i, true)) >>> 0;
  }
  dv.setUint32(0x238, accepted ? (0 - sum) >>> 0 : (((0 - sum) >>> 0) + 1) >>> 0, true);
  return bank;
}

/**
 * The 2014 plaintext chain as the analysis would report it: the boot-config word and the active-slot word,
 * each bank's stored bytes (refused where `refused` names it), and the banks in `patched` holding a marker
 * the test's seam reads as a frame-rate patch.
 */
function chainReport(options: {
  readonly cfg0: number | null;
  readonly activeSlotWord?: number | null;
  readonly refused?: readonly SlotKey[];
  readonly patched?: readonly SlotKey[];
}): {
  readonly report: SlotsReport;
  readonly heldBy: (plain: Uint8Array | null) => { hz: number; what: string } | null;
} {
  const base = reportOf({ booted: 'a' });
  const patchedImages = new Set<Uint8Array>();
  const byKey = new Map<SlotKey, SlotState>();
  const slots = base.slots.map((view): SlotView => {
    const key = view.entry.key;
    const plain = options.patched?.includes(key) === true ? new Uint8Array(8) : null;
    if (plain !== null) patchedImages.add(plain);
    const state = {
      ...(view.state ?? {}),
      key,
      raw: bankRaw(options.refused?.includes(key) !== true),
      blank: false,
      unread: false,
      plain,
    } as unknown as SlotState;
    byKey.set(key, state);
    return { ...view, state, content: 'image' };
  });
  const state = {
    ...base.state,
    profile: getProfile('legacy-auth'),
    plainChain: true,
    version: '1.3.0.0',
    cfg0: options.cfg0,
    activeSlotWord: options.activeSlotWord ?? null,
    byKey,
  } as unknown as DeviceState;
  const heldBy = (plain: Uint8Array | null) =>
    plain !== null && patchedImages.has(plain) ? { hz: 32, what: 'marker' } : null;
  return { report: { ...base, state, slots }, heldBy };
}

describe('the boot word and the frame-rate warning', () => {
  it('shows the boot word, the bank the next start runs, and what the camera reports, on the 2014 chain', () => {
    const { report } = chainReport({ cfg0: 2, activeSlotWord: 2 });
    const text = listLines(report, false, null).join('\n');
    expect(text).toContain('Boot');
    expect(text).toMatch(/boot-config word\s+0x00000002 — recovery R first, then A, then B/);
    expect(text).toMatch(/next start runs\s+recovery R/);
    expect(text).toContain('the camera reports it entered recovery R (active-slot word 2)');
    expect(text).toContain(
      '· the boot-config word is 2, so the bootloader tries recovery R first, and it holds an image the bootloader accepts.',
    );
  });

  it('prints the frame-rate warning under Boot, in the words core gives the page', () => {
    const { report, heldBy } = chainReport({ cfg0: 2, activeSlotWord: 2, patched: ['a'] });
    const warning = fpsBootWarningOf(report, { heldBy, patchBlock: () => null });
    const text = listLines(report, false, warning).join('\n');
    expect(text).toContain('! The camera boots recovery R.');
    expect(text).toContain(
      '! Slot A holds a frame-rate patch, but it does not run, so the patch does not take effect.',
    );
    expect(text).toContain(
      '! Patch recovery R too (the bank that runs): that is what makes the frame-rate patch take effect.',
    );
  });

  it('prints no boot section on a line whose boot rule is not decoded', () => {
    const plain = reportOf({ booted: 'a' });
    expect(listLines(plain, false, null).join('\n')).not.toContain('boot-config word');
    expect(bootLines(plain, false, null)).toEqual([]);
  });

  it('carries the boot choice in the list JSON, and no warning when nothing patched would fail to run', () => {
    const { report } = chainReport({ cfg0: 2, activeSlotWord: 2 });
    const list = listResult(report);
    expect(list.boot).toMatchObject({
      word: '0x00000002',
      rule: 'recovery R first, then A, then B',
      runs: 'r',
      reportedBooted: 'r',
      activeSlotWord: '0x00000002',
    });
    expect(list.fpsBootWarning).toBeNull();
  });

  it('puts the warning in the patch-fps plan as "!" lines, and keeps the saved-file line', () => {
    const { report, heldBy } = chainReport({ cfg0: 2, activeSlotWord: 2 });
    const warning = fpsBootWarningOf(report, { heldBy, patchBlock: () => null, target: 'a' });
    const text = fpsPlanLines(
      'a',
      offerOf(),
      0x14050000,
      '1.3.0.0',
      false,
      'saved first',
      warning,
    ).join('\n');
    expect(text).toContain(
      '! Patching slot A would not make it run, because the camera boots recovery R instead.',
    );
    expect(text).toContain('! Patch recovery R too (the bank that runs)');
    expect(text).toContain('The decrypted file in the backup zip is the way back.');
  });

  it('patch-fps dry run: the JSON names the warning for the bank being patched', async () => {
    const { report } = chainReport({ cfg0: 2, activeSlotWord: 2 });
    const { ops } = fakeOps(report);
    const withPatch: SlotOps = { ...ops, fpsPlan: () => offerOf() };
    const test = cameraIo();
    const result = await slotsCommandWith(withPatch)(
      contextFor(['slots', 'patch-fps', 'a', '--no-probe'], test),
    );
    expect(result).toMatchObject({ action: 'patch-fps', dryRun: true, written: false });
    const bootWarning = (result as { readonly bootWarning: readonly string[] | null }).bootWarning;
    expect(bootWarning?.[0]).toBe(
      'The camera boots recovery R. The boot-config word is 2, so the bootloader tries recovery R first, and it holds an image the bootloader accepts.',
    );
    expect(bootWarning?.[1]).toBe(
      'Patching slot A would not make it run, because the camera boots recovery R instead.',
    );
  });
});

describe('the Compact PRO 4.9.1.15 rate, as the CLI prints it', () => {
  it('shows 18 Hz in the plan, the JSON and the question', () => {
    const base = offerOf();
    const plan: OfferPlan = {
      ...base,
      patch: {
        ...base.patch,
        id: 'compact_pro-4.9.1.15',
        family: 'compact_pro',
        version: '4.9.1.15',
        fromHz: 9,
        targetHz: 18,
      },
      fromHz: 9,
      toHz: 18,
    };
    const text = fpsPlanLines('a', plan, 0x14030000, '4.9.1.15', false, 'saved first').join('\n');
    expect(text).toContain('9 Hz -> 18 Hz');
    /* The build in words; the table id stays in the JSON's `patch` for scripts (TESTING.md 42.87). */
    expect(text).toMatch(/build\s+firmware 4\.9\.1\.15$/m);
    expect(text).not.toContain('compact_pro-4.9.1.15');
    expect(text).not.toContain('table entry');
    expect(fpsPlanJson(plan)).toMatchObject({
      status: 'offer',
      patch: 'compact_pro-4.9.1.15',
      fromHz: 9,
      toHz: 18,
    });
    expect(fpsQuestion(reportOf({ booted: 'b' }), 'a', plan)).toContain(
      'from 9 Hz to 18 Hz? The bank is saved first. [y/N] ',
    );
  });
});

/* ==================================================================== *
 * The 2016 Compact PRO (TESTING.md 42.84): the Boot section, the frame-rate warning and the write keys,
 * which `slots list` printed only for the 2014 chain (the Boot section) or as a refusal (the write keys)
 * ==================================================================== */

/** The key the 2016 fixture's check key holds: key block 1 of the 1.0.3.x 9 Hz pair. */
const BLOCK_1_HEX = 'faacb3c6f1412469bd122fb82d78160d';

/**
 * A 1.0.3.0 camera read under compact-2016, as the analysis would report it: the banks' verdicts from the
 * check key (named from slot A, or not), the boot-config word and the active-slot word, and the banks in
 * `patched` holding a marker the test's seam reads as a frame-rate patch.
 */
function report2016(options: {
  readonly cfg0: number | null;
  readonly activeSlotWord?: number | null;
  readonly checkKeyNamed?: boolean;
  readonly patched?: readonly SlotKey[];
}): {
  readonly report: SlotsReport;
  readonly heldBy: (plain: Uint8Array | null) => { hz: number; what: string } | null;
} {
  const named = options.checkKeyNamed ?? true;
  const base = reportOf({
    booted: named ? 'a' : null,
    entries: {
      a: { staging: 'slot-keystream-ciphertext' },
      b: { staging: 'slot-keystream-ciphertext' },
      r: { staging: 'slot-keystream-ciphertext' },
    },
  });
  const patchedImages = new Set<Uint8Array>();
  const byKey = new Map<SlotKey, SlotState>();
  const slots = base.slots.map((view): SlotView => {
    const key = view.entry.key;
    const plain = new Uint8Array(8);
    if (options.patched?.includes(key) === true) patchedImages.add(plain);
    const state = {
      ...(view.state ?? {}),
      key,
      raw: new Uint8Array(0x10000),
      blank: false,
      unread: false,
      plain,
      keyName: named ? 'key block 1' : 'unknown key',
      bootable: named,
      bootability: named ? 'bootable' : 'unknown',
    } as unknown as SlotState;
    byKey.set(key, state);
    return { ...view, state, content: 'image' };
  });
  const checkKey = named
    ? {
        name: 'key block 1',
        key: Uint8Array.from(BLOCK_1_HEX.match(/../g) ?? [], (h) => Number.parseInt(h, 16)),
        from: 'a',
        inferred: false,
        pair: 'the Compact PRO 1.0.3.x 9 Hz pair',
        unnamedWhy: null,
        why: 'check key: key block 1',
      }
    : {
        name: null,
        key: null,
        from: null,
        inferred: false,
        pair: null,
        unnamedWhy: "the camera's active-slot word (fw info roots, selector 10) could not be read",
        why: 'check key not named',
      };
  const state = {
    ...base.state,
    profile: getProfile('compact-2016'),
    plainChain: false,
    version: '1.0.3.0',
    cfg0: options.cfg0,
    activeSlotWord: options.activeSlotWord === undefined ? 0 : options.activeSlotWord,
    byKey,
    slots: [...byKey.values()],
    boot: named ? { booted: 'a', target: 'b' } : null,
    checkKey,
    bankWriteRefusals: [],
  } as unknown as DeviceState;
  const heldBy = (plain: Uint8Array | null) =>
    plain !== null && patchedImages.has(plain) ? { hz: 18, what: 'marker' } : null;
  return { report: { ...base, state, slots }, heldBy };
}

describe('slots list on the 2016 Compact PRO', () => {
  it('prints the Boot section: the word, the next start, the last start and the check key', () => {
    const { report } = report2016({ cfg0: 0xffffffff });
    const text = bootLines(report, false, null).join('\n');
    expect(text).toMatch(/boot-config word\s+0xFFFFFFFF — slot A first, then B, then recovery R/);
    expect(text).toMatch(/next start runs\s+slot A/);
    expect(text).toMatch(
      /last start\s+the camera reports it entered slot A \(active-slot word 0\)/,
    );
    expect(text).toMatch(
      new RegExp(
        `check key\\s+key block 1 ${BLOCK_1_HEX} \\(the Compact PRO 1\\.0\\.3\\.x 9 Hz pair's block 1\\), named from slot A`,
      ),
    );
    expect(text).toContain(
      '· the boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, and it holds an image the bootloader accepts.',
    );
  });

  it('warns when recovery R holds the 18 Hz patch and the blank record runs slot A', () => {
    const { report, heldBy } = report2016({ cfg0: 0xffffffff, patched: ['r'] });
    const warning = fpsBootWarningOf(report, { heldBy, patchBlock: () => null });
    const text = listLines(report, false, warning).join('\n');
    expect(text).toContain('! The camera boots slot A.');
    expect(text).toContain(
      '! Recovery R holds a frame-rate patch, but it does not run, so the patch does not take effect.',
    );
    expect(text).toContain(
      '! Patch slot A too (the bank that runs): that is what makes the frame-rate patch take effect.',
    );
  });

  it('says the next start is not known, and why, when the check key was not named', () => {
    const { report } = report2016({ cfg0: 0xffffffff, checkKeyNamed: false, activeSlotWord: null });
    const text = bootLines(report, false, null).join('\n');
    expect(text).toMatch(/next start runs\s+not known/);
    expect(text).toMatch(/last start\s+not read/);
    expect(text).toMatch(
      /check key\s+not named — the camera's active-slot word \(fw info roots, selector 10\) could not be read/,
    );
  });

  it('prints the write keys as staged under the image’s key block 0 and stored under the check key, never refused', () => {
    const { report } = report2016({ cfg0: 0xffffffff });
    const text = writeKeyLines(report, false).join('\n');
    expect(text).toMatch(
      /staged as\s+the image under its own key block 0 \(found in the image by value\), to any bank; this camera's keys are not used/,
    );
    expect(text).toMatch(
      /stored as\s+key block 1, the key its bootloader checks a bank under; the camera re-encrypts the upload under it/,
    );
    expect(text).not.toContain('refused');
    expect(text).not.toContain('key table does not carry that key');
    const unnamed = writeKeyLines(
      report2016({ cfg0: 0xffffffff, checkKeyNamed: false }).report,
      false,
    );
    expect(unnamed.join('\n')).toMatch(
      /stored as\s+the key its bootloader checks a bank under \(not named on this read\)/,
    );
  });

  it('carries the boot choice, the check key and the write-key form in the list JSON', () => {
    const { report } = report2016({ cfg0: 0xffffffff });
    const list = listResult(report);
    expect(list.boot).toMatchObject({
      word: '0xFFFFFFFF',
      rule: 'slot A first, then B, then recovery R',
      runs: 'a',
      reportedBooted: 'a',
      checkKey: {
        name: 'key block 1',
        key: BLOCK_1_HEX,
        from: 'a',
        inferred: false,
        pair: 'the Compact PRO 1.0.3.x 9 Hz pair',
        unnamedWhy: null,
      },
    });
    expect(list.writeKeys).toMatchObject({
      refused: null,
      booted: 'a',
      key: 'key block 1',
      form: 'image-block-0',
    });
  });

  it('asks for the acknowledgement on the booted slot A, and keeps it on recovery R', () => {
    const { report } = report2016({ cfg0: 0xffffffff });
    const viewA = report.slots.find((view) => view.entry.key === 'a');
    const viewB = report.slots.find((view) => view.entry.key === 'b');
    const viewR = report.slots.find((view) => view.entry.key === 'r');
    if (viewA === undefined || viewB === undefined || viewR === undefined)
      throw new Error('no view');
    const active = {
      ...report,
      slots: report.slots.map((v) => ({ ...v, active: v.entry.key === 'a' })),
    };
    expect(bootRisk(active, { ...viewA, active: true })).toBe(
      'slot A is the bank the camera boots now; a bad write there can stop the camera booting',
    );
    expect(bootRisk(active, { ...viewB, active: false })).toBeNull();
    expect(bootRisk(active, { ...viewR, active: false })).toMatch(
      /recovery R is the bank the bootloader falls back to/,
    );
  });

  /* The 1.0.3.0 report with core's real plan (its notes and bank entries), slot A booted. */
  function realReport2016(): SlotsReport {
    const { report } = report2016({ cfg0: 0xffffffff });
    const plan = buildSlotPlan(getProfile('compact-2016'), '1.0.3.0');
    return {
      ...report,
      plan,
      slots: report.slots.map((view) => ({
        ...view,
        entry: plan.slots.find((entry) => entry.key === view.entry.key) ?? view.entry,
        active: view.entry.key === 'a',
      })),
    };
  }

  it('prints a note that holds for every bank once, and the acknowledgement once per bank (TESTING.md 42.87)', () => {
    const report = realReport2016();
    const text = listLines(report, false, null).join('\n');
    const notes = text.slice(text.indexOf('\nNotes\n'));
    /* Before: "A: Staged: …", "B: Staged: …" and "R: Staged: …", and R's note said the acknowledgement. */
    expect(notes.match(/Staged: the image, XORed with the xorshift128 keystream/g)).toHaveLength(1);
    expect(notes).toContain('  · Staged: the image, XORed');
    expect(notes).not.toMatch(/· [ABR]: Staged/);
    expect(notes).toContain(
      '  · Slot A: a write needs --acknowledge-risk: slot A is the bank the camera boots now; a bad write ' +
        'there can stop the camera booting.',
    );
    expect(notes).toContain(
      '  · Recovery R: a write needs --acknowledge-risk: recovery R is the bank the bootloader falls back to; a bad write there can ' +
        'leave the camera with no image it can boot.',
    );
    expect(notes).not.toContain('B: a write needs');
    expect(notes.match(/acknowledge/g)).toHaveLength(2);
    expect(notes).toContain(
      '  · Recovery R: Recovery bank, mode 9, token form. Measured on a Compact PRO 1.0.3.0: R took its own image',
    );
    /* A note both front ends print names neither (TESTING.md 42.87). */
    expect(notes).toContain(
      '  · The booted bank named on this line is the bank the camera entered at its last start',
    );
    expect(text).not.toMatch(/\bthe page\b|this page|Slots tab/);
  });

  it('gives the list JSON the same split: the camera’s notes once, a bank’s own on the bank (TESTING.md 42.87)', () => {
    const list = listResult(realReport2016());
    const notes = list.notes as string[];
    expect(notes.filter((note) => note.startsWith('Staged: '))).toHaveLength(1);
    const slots = list.slots as { bank: string; notes: string[]; acknowledgeRisk: string | null }[];
    expect(slots.map((slot) => slot.notes.length)).toEqual([0, 0, 1]);
    expect(slots.map((slot) => slot.acknowledgeRisk)).toEqual([
      'slot A is the bank the camera boots now; a bad write there can stop the camera booting',
      null,
      'recovery R is the bank the bootloader falls back to; a bad write there can leave the camera with no image it can boot',
    ]);
  });
});
