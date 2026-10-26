/**
 * `seek-fw slots` — the three firmware banks, one at a time.
 *
 *   slots list                     identify the camera and each bank, and what this build can do
 *   slots dump <a|b|r>             read one bank as stored, and its decrypted image when a key recovers
 *   slots flash <a|b|r> <file>     write one bank: a decrypted image (the default), or --raw bytes
 *
 * Core decides everything that makes a write correct: the build's capability matrix, the staging
 * that encrypts a decrypted image for the bank, the commit and the read-back. This file adds what
 * a terminal owes a write, and each of those is decided BEFORE anything is sent:
 *
 *   - a build the slot page does not cover, or a bank that build cannot take, is refused;
 *   - a camera the Slots page's banner refuses (core's `writeBannerOf`) is refused for every bank, raw
 *     bytes included, with the banner's words;
 *   - a bank whose read failed is refused, because nothing may be written on the strength of it;
 *   - the bank the camera boots now, and the recovery bank R, are refused unless the person says
 *     --acknowledge-risk. A camera that reports NO booted bank is treated the same way: the bank
 *     might be the one it boots, and the refusal says so. An EMPTY bank is not exempt from this
 *     (the rule is about which bank the camera boots, not about what the bank holds);
 *   - an EMPTY bank (its header window reads as all 0xFF) is a state, not an error: `list` calls it
 *     empty, `dump` returns the raw 64 KiB of 0xFF and says there is nothing to decrypt, and a flash
 *     into it is planned, confirmed and read back like any other, the plan saying nothing is
 *     overwritten;
 *   - the plan is printed and the person is asked, unless --yes; without a terminal and without
 *     --yes there is nobody to ask, so the command refuses.
 *
 * And after the write, a read-back that does not match is a failed run with a non-zero exit, not a
 * line of text that a script would walk past.
 *
 * The core calls sit behind `SlotOps`. The default is core itself; the offline tests pass fakes, so
 * every refusal and every rendered plan is exercised without a camera.
 */

import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import {
  bankWordsOf,
  bootChoiceOf,
  bootRuleKnown,
  bootWordRuleOf,
  checkKeyReportOf,
  derivedKeyLine,
  deriveWriteKeys,
  dumpSlot,
  flashSlot,
  fpsBootWarningOf,
  fpsPlanOfBank,
  hexUp,
  inspectSlots,
  onPlaintextChain,
  patchBankFps,
  prepareSlotFlash,
  runningApplicationOf,
  sha256hex,
  slotDumpNames,
  slotWriteRefusal,
  STAGED_UNDER_IMAGE_BLOCK_0,
  stagingDetail,
  storedUnderCheckKey,
  withLevelMap,
  writeBannerOf,
  type Artifact,
  type DumpedSlot,
  type FlashSlotOptions,
  type FlashSlotResult,
  type FpsBootWarning,
  type FpsPatchOptions,
  type FpsPatchResult,
  type FpsPlan,
  type FpsPreDump,
  type Reporter,
  type SlotFlashInput,
  type PrepareSlotFlashOptions,
  type SlotFlashPlan,
  type SlotInputKind,
  type SlotKey,
  type SlotView,
  type SlotsReport,
  type Support,
  type WorkflowContext,
} from '@seek-fw/core';
import type { Command, CommandContext, CommandResult, SlotFlags } from '../cli.js';
import { CliError, UsageError } from '../errors.js';
import { paint } from '../ansi.js';
import {
  checkKeyJson,
  chooseProfileByProbe,
  heading,
  openSession,
  table,
  workflowContext,
  writeRun,
} from './shared.js';

/* ==================================================================== *
 * The core calls, behind a seam the tests can replace
 * ==================================================================== */

/**
 * The core calls this command makes. The defaults are core's own functions. `fpsPlan` and `patchFps`
 * are optional so a test that does not reach the frame-rate patch need not answer them.
 */
export interface SlotOps {
  inspect(ctx: WorkflowContext): Promise<SlotsReport>;
  dump(ctx: WorkflowContext, report: SlotsReport, key: SlotKey): Promise<DumpedSlot>;
  prepare(
    report: SlotsReport,
    key: SlotKey,
    input: SlotFlashInput,
    options?: PrepareSlotFlashOptions,
  ): SlotFlashPlan;
  flash(
    ctx: WorkflowContext,
    report: SlotsReport,
    plan: SlotFlashPlan,
    options: FlashSlotOptions,
  ): Promise<FlashSlotResult>;
  fpsPlan?(report: SlotsReport, key: SlotKey): FpsPlan;
  patchFps?(
    ctx: WorkflowContext,
    report: SlotsReport,
    key: SlotKey,
    options: FpsPatchOptions,
  ): Promise<FpsPatchResult>;
}

export const CORE_SLOT_OPS: SlotOps = {
  inspect: inspectSlots,
  dump: dumpSlot,
  prepare: prepareSlotFlash,
  flash: flashSlot,
  fpsPlan: fpsPlanOfBank,
  patchFps: patchBankFps,
};

/* ==================================================================== *
 * Arguments
 * ==================================================================== */

export type SlotsRequest =
  | { readonly action: 'list' }
  | { readonly action: 'dump'; readonly key: SlotKey }
  | {
      readonly action: 'flash';
      readonly key: SlotKey;
      readonly file: string;
      readonly kind: SlotInputKind;
    }
  | { readonly action: 'patch-fps'; readonly key: SlotKey };

/** The flags a command without `slots` never sees: all of them default to "not asked for". */
const NO_SLOT_FLAGS: SlotFlags = {
  raw: false,
  acknowledgeRisk: false,
  verify: true,
  dryRun: false,
  running16Hz: false,
  write: false,
  dumpDir: null,
};

export function parseBank(text: string): SlotKey {
  const key = text.toLowerCase();
  if (key === 'a' || key === 'b' || key === 'r') return key;
  throw new UsageError(
    `bank must be a, b or r, got '${text}'`,
    'a and b are the two application banks; r is the recovery bank.',
  );
}

function unexpected(extra: readonly string[], subcommand: string): UsageError {
  return new UsageError(`unexpected argument '${extra[0] ?? ''}' after '${subcommand}'`);
}

/**
 * A flag that a subcommand does not use is refused there, so it never looks like it did something.
 * `--write` and `--dump-dir` belong to `patch-fps`; the write flags belong to `flash`; the rest to a
 * flash too, and `patch-fps` takes only the acknowledgement and the read-back switch of those.
 */
function refuseUnusedFlags(
  flags: SlotFlags,
  subcommand: 'list' | 'dump' | 'flash' | 'patch-fps',
): void {
  /* Each flag, whether it is on, and the subcommand it belongs to. */
  const flagged: readonly {
    readonly on: boolean;
    readonly name: string;
    readonly owner: 'flash' | 'patch-fps';
  }[] = [
    { on: flags.raw, name: '--raw', owner: 'flash' },
    { on: flags.acknowledgeRisk, name: '--acknowledge-risk', owner: 'flash' },
    { on: !flags.verify, name: '--no-verify', owner: 'flash' },
    { on: flags.dryRun, name: '--dry-run', owner: 'flash' },
    { on: flags.running16Hz, name: '--running-16hz', owner: 'flash' },
    { on: flags.write === true, name: '--write', owner: 'patch-fps' },
    { on: (flags.dumpDir ?? null) !== null, name: '--dump-dir', owner: 'patch-fps' },
  ];
  /* patch-fps is a dry run unless --write is given, so it takes no --dry-run of its own. */
  const usedBy: Readonly<Record<'list' | 'dump' | 'flash' | 'patch-fps', readonly string[]>> = {
    list: [],
    dump: [],
    flash: ['--raw', '--acknowledge-risk', '--no-verify', '--dry-run', '--running-16hz'],
    'patch-fps': ['--acknowledge-risk', '--no-verify', '--write', '--dump-dir'],
  };
  const unused = flagged.filter((flag) => flag.on && !usedBy[subcommand].includes(flag.name));
  if (unused.length > 0) {
    const names = unused.map((flag) => flag.name).join(', ');
    const owners = [...new Set(unused.map((flag) => `'slots ${flag.owner}'`))].join(' or ');
    throw new UsageError(
      `${names} ${unused.length === 1 ? 'applies' : 'apply'} only to ${owners}`,
      `'slots ${subcommand}' does not use ${unused.length === 1 ? 'it' : 'them'}.`,
    );
  }
}

/** Reads `slots <list|dump|flash> ...` from the positionals and flags, or refuses. */
export function parseSlotsArgs(args: readonly string[], flags: SlotFlags): SlotsRequest {
  const [action, ...rest] = args;
  if (action === undefined) {
    throw new UsageError(
      'slots needs a subcommand',
      'Use one of: slots list | slots dump <a|b|r> | slots flash <a|b|r> <file>.',
    );
  }
  if (action === 'list') {
    if (rest.length > 0) throw unexpected(rest, 'slots list');
    refuseUnusedFlags(flags, 'list');
    return { action: 'list' };
  }
  if (action === 'dump') {
    const [bank, ...extra] = rest;
    if (bank === undefined) throw new UsageError('slots dump needs a bank: a, b or r');
    if (extra.length > 0) throw unexpected(extra, 'slots dump');
    refuseUnusedFlags(flags, 'dump');
    return { action: 'dump', key: parseBank(bank) };
  }
  if (action === 'flash') {
    const [bank, file, ...extra] = rest;
    if (bank === undefined) {
      throw new UsageError('slots flash needs a bank and an image: slots flash <a|b|r> <file>');
    }
    const key = parseBank(bank);
    if (file === undefined) throw new UsageError('slots flash needs an image file after the bank');
    if (extra.length > 0) throw unexpected(extra, 'slots flash');
    refuseUnusedFlags(flags, 'flash');
    return { action: 'flash', key, file, kind: flags.raw ? 'raw' : 'plain' };
  }
  if (action === 'patch-fps') {
    const [bank, ...extra] = rest;
    if (bank === undefined) throw new UsageError('slots patch-fps needs a bank: a, b or r');
    if (extra.length > 0) throw unexpected(extra, 'slots patch-fps');
    refuseUnusedFlags(flags, 'patch-fps');
    return { action: 'patch-fps', key: parseBank(bank) };
  }
  throw new UsageError(
    `unknown slots subcommand '${action}'`,
    'Use one of: list, dump, flash, patch-fps.',
  );
}

/* ==================================================================== *
 * Refusals: decided from the report alone, before anything is sent
 * ==================================================================== */

export interface Refusal {
  readonly message: string;
  readonly hint: string;
}

const NOTHING_SENT = 'Nothing was sent to the camera.';

export function bankName(key: SlotKey): string {
  return key.toUpperCase();
}

export function findView(report: SlotsReport, key: SlotKey): SlotView | null {
  return report.slots.find((view) => view.entry.key === key) ?? null;
}

function describeKind(kind: SlotInputKind): string {
  return kind === 'plain' ? 'a decrypted image' : 'raw bytes';
}

function buildRefusal(report: SlotsReport): Refusal | null {
  const build = report.plan.supportedBuild;
  if (build.supported) return null;
  return {
    message: `firmware ${report.plan.firmwareVersion ?? '(unknown)'} is not supported by slots: ${build.reason}`,
    hint: NOTHING_SENT,
  };
}

function bankMissing(key: SlotKey): Refusal {
  return {
    message: `bank ${bankName(key)} is not in this build's slot plan`,
    hint: NOTHING_SENT,
  };
}

/** Why `slots dump` will not read this bank, or null when it will. */
export function dumpRefusal(report: SlotsReport, key: SlotKey): Refusal | null {
  const build = buildRefusal(report);
  if (build !== null) return build;
  const view = findView(report, key);
  if (view === null) return bankMissing(key);
  const dump: Support = view.entry.dump;
  if (!dump.supported) {
    return {
      message: `bank ${bankName(key)} cannot be dumped on this build: ${dump.reason}`,
      hint: NOTHING_SENT,
    };
  }
  return null;
}

/**
 * The reason a write to this bank needs --acknowledge-risk, or null when it does not.
 *
 * The camera's own boot choice is the risk: the bank it boots is the one a bad write stops, and
 * the recovery bank is the last image the camera has. When no bank is reported as booted, the
 * booted bank is unknown and this one might be it, so the same acknowledgement is required.
 */
export function bootRisk(report: SlotsReport, view: SlotView): string | null {
  const bank = bankName(view.entry.key);
  if (view.entry.key === 'r') {
    return 'bank R is the recovery bank; a bad write there can leave the camera with no image it can boot';
  }
  if (view.active) {
    /* On the 2014 plaintext chain the named bank comes from the active-slot word, the bootloader's record
     * of the bank it entered (TESTING.md 42.56); the next start can run another bank when this one fails
     * its check (TESTING.md 42.10), so the words name the word rather than promise the next start. */
    if (onPlaintextChain(report.state.profile, report.state.version)) {
      return `bank ${bank} is the bank the camera's active-slot word names as booted; a bad write there can stop the camera booting`;
    }
    return `bank ${bank} is the bank the camera boots now; a bad write there can stop the camera booting`;
  }
  if (!report.slots.some((other) => other.active)) {
    return `the camera's booted bank could not be determined, so bank ${bank} may be the one it boots`;
  }
  return null;
}

/** Why `slots flash` will not send this image to this bank, or null when it may proceed. */
export function flashRefusal(
  report: SlotsReport,
  key: SlotKey,
  kind: SlotInputKind,
  acknowledgeRisk: boolean,
): Refusal | null {
  const build = buildRefusal(report);
  if (build !== null) return build;
  const view = findView(report, key);
  if (view === null) return bankMissing(key);
  const bank = bankName(key);

  const op: Support = kind === 'plain' ? view.entry.flashPlain : view.entry.flashRaw;
  if (!op.supported) {
    return {
      message: `bank ${bank} does not take ${describeKind(kind)} on this build: ${op.reason}`,
      hint: NOTHING_SENT,
    };
  }
  /* The camera-wide refusal the page's banner shows (core's writeBannerOf). The page turns every flash
   * control off with it, raw bytes included, and core's flashSlot refuses it on every staging; refused
   * here, before the plan, so a --dry-run never shows a plan for a write the camera cannot take. */
  const camera = writeBannerOf(report.state);
  if (camera !== null) {
    return {
      message: camera,
      hint: NOTHING_SENT,
    };
  }
  if (view.unreadReason !== null) {
    return {
      message: `bank ${bank} was not read (${view.unreadReason}); nothing is written on the strength of a read that failed`,
      hint: NOTHING_SENT,
    };
  }
  if (view.content === 'empty' && !view.entry.emptyBank.writable.supported) {
    return {
      message: `bank ${bank} is empty and cannot be written on this build: ${view.entry.emptyBank.writable.reason}`,
      hint: NOTHING_SENT,
    };
  }
  const risk = bootRisk(report, view);
  if (risk !== null && !acknowledgeRisk) {
    return {
      message: `refusing to write bank ${bank}: ${risk}`,
      hint: `Pass --acknowledge-risk to write it anyway. ${NOTHING_SENT}`,
    };
  }
  return null;
}

function refuse(refusal: Refusal | null): void {
  if (refusal === null) return;
  throw new CliError(refusal.message, { code: 'slots/refused', hint: refusal.hint });
}

function requireView(report: SlotsReport, key: SlotKey): SlotView {
  const view = findView(report, key);
  if (view === null) throw new CliError(bankMissing(key).message, { code: 'slots/refused' });
  return view;
}

/* ==================================================================== *
 * Text: what a person is shown
 * ==================================================================== */

function opText(support: Support): string {
  return support.supported ? 'yes' : `no — ${support.reason}`;
}

function versionOf(view: SlotView): string | null {
  const state = view.state;
  return state?.plainHeader?.versionStr ?? state?.header?.versionStr ?? null;
}

/**
 * What the camera's own per-bank answers say about the build it runs, on 1.3.0.8 (running.ts).
 * Unknown says so, and says what an FF write then needs.
 */
function runningNote(report: SlotsReport): string {
  const run = runningApplicationOf(report.state);
  if (run.build === null) {
    return (
      `the running build is not known: ${run.why}. A 1.3.0.8 FF (16 Hz) image is refused unless ` +
      'you pass --running-16hz to say the camera runs the 16 Hz build'
    );
  }
  const build = run.build === 'ff-1308' ? 'the 16 Hz FF 1.3.0.8 build' : 'the 8 Hz 1.3.0.8 build';
  return `the camera runs ${build}: ${run.why}`;
}

function bootableText(view: SlotView): string {
  const state = view.state;
  /* An empty bank has nothing to boot; "no" would read as a verdict on an image. */
  if (state === null || view.content === 'empty') return '-';
  if (state.bootability === 'unknown') return 'unknown';
  /* An FF image in R runs only when A and B hold nothing the bootloader takes (TESTING.md 42.10). */
  if (state.bootability === 'recovery-only') return 'recovery only';
  return state.bootable ? 'yes' : 'no';
}

/** What the version column says: the image's version, or what the bank is when it holds none. */
function versionText(view: SlotView): string {
  if (view.content === 'empty') return 'empty';
  if (view.content === 'foreign') return 'no image';
  return versionOf(view) ?? '-';
}

function slotRow(view: SlotView): string[] {
  const state = view.state;
  const header = state?.header ?? null;
  const sha256 = state?.sha256 ?? null;
  return [
    bankName(view.entry.key),
    hexUp(view.entry.address),
    view.active ? 'yes' : 'no',
    versionText(view),
    header === null ? '-' : `${String(header.length)} B`,
    state?.keyName ?? (state?.plain == null ? '-' : 'none (plaintext)'),
    bootableText(view),
    sha256 === null ? '-' : sha256.slice(0, 16),
  ];
}

/**
 * The bank whose decrypted image is the natural source for an empty bank: the one the camera
 * boots when it holds an image, else the first bank that does. Null when no bank holds one.
 * `slots dump <source>` writes that image as the `-decrypted` file `slots flash` takes.
 */
export function imageSourceFor(report: SlotsReport, target: SlotKey): SlotView | null {
  const holds = (view: SlotView): boolean =>
    view.entry.key !== target && view.content === 'image' && view.state?.plain != null;
  return (
    report.slots.find((view) => view.active && holds(view)) ??
    report.slots.find((view) => holds(view)) ??
    null
  );
}

/** The sentence `list` prints for an empty bank: what it is, that it can be written, and how to fill it. */
export function emptyBankNote(report: SlotsReport, view: SlotView): string {
  const bank = bankName(view.entry.key);
  const writable = view.entry.emptyBank.writable;
  const head =
    `${bank}: empty — its header window reads as all 0xFF, so it holds no image (nothing is ` +
    'overwritten by a write, and nothing is decrypted from it).';
  if (!writable.supported) return `${head} It cannot be written on this build: ${writable.reason}`;
  const source = imageSourceFor(report, view.entry.key);
  const how =
    source === null
      ? ''
      : ` To give it the firmware bank ${bankName(source.entry.key)} holds: ` +
        `\`seek-fw slots dump ${source.entry.key}\`, then ` +
        `\`seek-fw slots flash ${view.entry.key} <the -decrypted file>\`.`;
  return `${head} It can be written. ${view.entry.emptyBank.why}${how}`;
}

/**
 * The keys every bank is written under (write-keys.ts), in the form the line uses: the 2014 plaintext
 * chain's image as it is; the 2016 Compact PRO's image under its own key block 0, which the camera stores
 * under the key its bootloader checks; or the modern line's keys derived from the booted bank and the
 * running application. A refusal names the measurement that failed. The page's `SlotWriteKeys` shows the
 * same verdict.
 */
export function writeKeyLines(report: SlotsReport, color: boolean): string[] {
  const refusal = slotWriteRefusal(report.state);
  const keys = deriveWriteKeys(report.state);
  const lines: string[] = ['', heading('Write keys', color)];
  if (refusal === null && keys.form === 'plain') {
    lines.push(
      table([
        ['  chain', 'the 2014 plaintext chain: every bank is stored plain, so none holds a key'],
        ['  written as', 'the image as it is, with no key, to any bank'],
      ]),
    );
    for (const line of keys.evidence) lines.push(`  · ${line}`);
    return lines;
  }
  if (refusal === null && keys.form === 'image-block-0') {
    lines.push(
      table([
        ['  staged as', STAGED_UNDER_IMAGE_BLOCK_0],
        ['  stored as', storedUnderCheckKey(keys)],
      ]),
    );
    for (const line of keys.evidence) lines.push(`  · ${line}`);
    return lines;
  }
  if (refusal !== null || keys.atRest === null || keys.booted === null) {
    lines.push(table([['  refused', refusal ?? keys.refusal ?? 'the keys could not be derived']]));
    return lines;
  }
  const booted = bankName(keys.booted);
  lines.push(
    table([
      ['  booted bank', `${booted} holds ${keys.bootedKeyName ?? 'a key this read cannot name'}`],
      [
        '  written as',
        `${derivedKeyLine({ key: keys.atRest.name, holds: keys.bootedKeyName }, `bank ${booted}`)}; every bank is written the same way`,
      ],
    ]),
  );
  for (const line of keys.evidence) lines.push(`  · ${line}`);
  return lines;
}

/**
 * The boot choice of a locked-line camera whose boot rule is decoded (core's `bootRuleKnown`: the 2014
 * plaintext chain and the 2016 Compact PRO), as `list` shows it: the boot-config word, the bank the next
 * start runs, what the camera reports it entered at its last start, on 2016 the key its bootloader checks a
 * bank under, and the frame-rate warning when a patched bank would not run (core's `fpsBootWarningOf`, the
 * same text the page shows). Empty on any other line, whose boot word is not read this way.
 */
export function bootLines(
  report: SlotsReport,
  color: boolean,
  warning: FpsBootWarning | null,
): string[] {
  if (!bootRuleKnown(report.state)) return [];
  const choice = bootChoiceOf(report.state);
  const lines: string[] = ['', heading('Boot', color)];
  const lastStart =
    report.state.activeSlotWord === null
      ? 'not read'
      : choice.reportedBooted === null
        ? `the camera reports ${String(report.state.activeSlotWord)}, which names no bank`
        : `the camera reports it entered ${bankWordsOf(choice.reportedBooted)} (active-slot word ${String(report.state.activeSlotWord)})`;
  lines.push(
    table([
      [
        '  boot-config word',
        choice.word === null
          ? '(not read)'
          : `${hexUp(choice.word)} — ${bootWordRuleOf(choice.word)}`,
      ],
      ['  next start runs', choice.runs === null ? 'not known' : bankWordsOf(choice.runs)],
      ['  last start', lastStart],
      ...(report.state.checkKey == null
        ? []
        : [['  check key', checkKeyReportOf(report.state.checkKey)]]),
    ]),
  );
  lines.push(`  · ${choice.why}.`);
  if (warning !== null) {
    lines.push('');
    for (const paragraph of warning.paragraphs) {
      lines.push(paint(`  ! ${paragraph}`, 'yellow', color));
    }
  }
  return lines;
}

/** The boot choice as `--json` carries it, or null on a line whose boot rule is not decoded. */
function bootJsonOf(state: SlotsReport['state']): Record<string, unknown> | null {
  if (!bootRuleKnown(state)) return null;
  const choice = bootChoiceOf(state);
  return {
    word: choice.word === null ? null : hexUp(choice.word),
    rule: choice.word === null ? null : bootWordRuleOf(choice.word),
    runs: choice.runs,
    reportedBooted: choice.reportedBooted,
    activeSlotWord: state.activeSlotWord === null ? null : hexUp(state.activeSlotWord),
    why: choice.why,
    /* The 2016 line: the key its bootloader checks a bank under; null on the 2014 chain. */
    checkKey: checkKeyJson(state.checkKey ?? null),
  };
}

export function listLines(
  report: SlotsReport,
  color: boolean,
  bootWarning: FpsBootWarning | null = fpsBootWarningOf(report),
): string[] {
  const build = report.plan.supportedBuild;
  const lines: string[] = [];

  lines.push('', heading('Camera', color));
  lines.push(
    table([
      ['  product', report.state.description.productName ?? '(no product string)'],
      ['  serial', report.state.serial ?? '(unreadable)'],
      ['  firmware', report.plan.firmwareVersion ?? '(unreadable)'],
      ['  profile', report.plan.profileId],
      ['  build', build.supported ? 'supported' : `not supported: ${build.reason}`],
    ]),
  );

  lines.push(...bootLines(report, color, bootWarning));

  lines.push('', heading('Banks', color));
  lines.push(
    table(report.slots.map(slotRow), [
      'bank',
      'address',
      'active',
      'version',
      'size',
      'key',
      'bootable',
      'sha256',
    ]),
  );

  lines.push(...writeKeyLines(report, color));

  lines.push('', heading('Operations', color));
  const operationRows: string[][] = [];
  for (const view of report.slots) {
    operationRows.push([`  ${bankName(view.entry.key)}`, 'dump', opText(view.entry.dump)]);
    operationRows.push(['', 'flash decrypted image', opText(view.entry.flashPlain)]);
    operationRows.push(['', 'flash raw bytes', opText(view.entry.flashRaw)]);
  }
  lines.push(table(operationRows));

  /* The camera's notes once, then each bank's own (core says a note that holds for every bank once, with the
   * camera's: TESTING.md 42.87), and, once per bank, why a write to it needs --acknowledge-risk. */
  const notes: string[] = [...report.plan.notes];
  if (report.state.version === '1.3.0.8') notes.push(runningNote(report));
  for (const view of report.slots) {
    const bank = bankName(view.entry.key);
    for (const note of view.entry.notes) notes.push(`${bank}: ${note}`);
    const risk = bootRisk(report, view);
    if (risk !== null) notes.push(`${bank}: a write needs --acknowledge-risk: ${risk}.`);
    if (view.unreadReason !== null) notes.push(`${bank}: not read — ${view.unreadReason}`);
    if (view.content === 'empty') notes.push(emptyBankNote(report, view));
  }
  if (notes.length > 0) {
    lines.push('', heading('Notes', color));
    for (const note of notes) lines.push(`  · ${note}`);
  }
  lines.push('');
  return lines;
}

function slotJson(view: SlotView): Record<string, unknown> {
  const state = view.state;
  return {
    bank: view.entry.key,
    name: view.entry.name,
    address: hexUp(view.entry.address),
    active: view.active,
    content: view.content,
    empty: view.content === 'empty',
    version: versionOf(view),
    imageBytes: state?.header?.length ?? null,
    bankBytes: view.entry.length,
    key: state?.keyName ?? null,
    bootable: state?.bootable ?? null,
    bootability: state?.bootability ?? null,
    sha256: state?.sha256 ?? null,
    unreadReason: view.unreadReason,
    staging: view.entry.staging,
    commitEffect: view.entry.commitEffect,
    emptyBank: view.entry.emptyBank,
    notes: [...view.entry.notes],
    operations: {
      dump: view.entry.dump,
      flashDecrypted: view.entry.flashPlain,
      flashRaw: view.entry.flashRaw,
    },
  };
}

/** The `--json` document for `slots list`. Every value must stringify. */
export function listResult(report: SlotsReport): CommandResult {
  const keys = deriveWriteKeys(report.state);
  const bootWarning = fpsBootWarningOf(report);
  return {
    action: 'list',
    boot: bootJsonOf(report.state),
    /* The same paragraphs `list` prints under Boot, or null when no patched bank would fail to run. */
    fpsBootWarning: bootWarning === null ? null : [...bootWarning.paragraphs],
    writeKeys: {
      /* The same text the page's banner shows (core's writeBannerOf), or null when the page shows none. */
      refused: writeBannerOf(report.state),
      booted: keys.booted,
      key: keys.atRest?.name ?? null,
      /* How the keys are chosen (core's `WriteKeyForm`): 'plain' on the 2014 plaintext chain (no key),
       * 'image-block-0' on the 2016 Compact PRO (the image's own key block 0; `key` is the key the camera
       * stores under), 'derived' on the modern line. */
      form: keys.form,
    },
    product: report.state.description.productName,
    serial: report.state.serial,
    firmware: report.plan.firmwareVersion,
    profile: report.plan.profileId,
    build: report.plan.supportedBuild,
    notes: [...report.plan.notes],
    slots: report.slots.map((view) => ({
      ...slotJson(view),
      /* Why a write to this bank needs --acknowledge-risk (the text's Notes line), or null. */
      acknowledgeRisk: bootRisk(report, view),
      /* The frame-rate patch the bank's own image offers (or why not), the same verdict the text shows. */
      patch: fpsPlanJson(fpsPlanOfBank(report, view.entry.key)),
    })),
  };
}

/**
 * The plan a person confirms before a flash, in the order they need it: where the bytes go, what
 * is sent, what the bank will hold afterwards, what changes, and what to be afraid of.
 */
export function flashPlanLines(
  plan: SlotFlashPlan,
  fileName: string,
  expectedSha256: string | null,
  color: boolean,
): string[] {
  const lines: string[] = [''];
  /* What the input is; the staging row says how it is sent, in core's words (`stagingDetail`), so the two
   * rows do not say the same thing twice (TESTING.md 42.87). */
  const ff = plan.staging === 'key-a-keystream' || plan.storedForm === 'key-b-ciphertext';
  const kind =
    plan.kind === 'plain'
      ? ff
        ? 'decrypted 1.3.0.8 FF image'
        : 'decrypted image'
      : ff
        ? 'raw bytes in the 1.3.0.8 FF staged form (the camera stores the image under Key B)'
        : 'raw bytes';
  const runningBasis =
    plan.ffRunning === 'camera'
      ? "the camera's own answers say it runs the 16 Hz FF build"
      : plan.ffRunning === 'user'
        ? "your word (--running-16hz): the camera's answers did not decide the build"
        : null;
  const chunks = Math.ceil(plan.payload.length / 64);

  lines.push(heading('Slot flash plan', color));
  lines.push(
    table([
      ['  bank', `${bankName(plan.key)} (${hexUp(plan.address)})`],
      ...(plan.targetEmpty === true
        ? [['  target', 'empty — the bank holds no image, so nothing is overwritten']]
        : []),
      ['  image', `${fileName} — ${kind}`],
      ['  staging', stagingDetail(plan.staging)],
      ...(runningBasis === null ? [] : [['  running build', runningBasis]]),
      ...(plan.derivedFrom
        ? [['  key', derivedKeyLine(plan.derivedFrom, `bank ${bankName(plan.derivedFrom.bank)}`)]]
        : []),
      ['  payload', `${String(plan.payload.length)} B in ${String(chunks)} chunk(s) of 64 B`],
      ['  transfer checksum', hexUp(plan.sum16, 4)],
      ['  firmware', plan.firmwareVersion ?? '(unknown)'],
      ['  serial', plan.serial ?? '(unknown)'],
      ['  afterwards', expectedSha256 === null ? 'not predicted' : `sha256 ${expectedSha256}`],
    ]),
  );

  if (plan.compare.length > 0) {
    lines.push('', heading('Differences from what the bank holds', color));
    lines.push(
      table(
        plan.compare.map((row) => [`  ${row.field}`, row.before, '->', row.after]),
        ['  field', 'now', '', 'after'],
      ),
    );
  }

  if (plan.warnings.length > 0) {
    lines.push('', paint(heading('Warnings', color), 'yellow', color));
    for (const warning of plan.warnings) lines.push(paint(`  ! ${warning}`, 'yellow', color));
  }
  /* The notes are not warnings, so they are said as notes: this write's, the bank's and the camera's. The
   * plan is the only place the CLI shows them before a write, so all three are printed (TESTING.md 42.88). */
  if (plan.notes.length > 0) {
    lines.push('', heading('Notes', color));
    for (const note of plan.notes) lines.push(`  · ${note.text}`);
  }
  lines.push('');
  return lines;
}

/**
 * The plan's notes for the flash JSON, each with where it comes from ('write', 'bank' or 'camera'). The JSON's
 * `warnings` are the plan's warnings only, and its `notes` are what the write itself reported.
 */
export function planNotesJson(plan: SlotFlashPlan): { source: string; text: string }[] {
  return plan.notes.map((note) => ({ source: note.source, text: note.text }));
}

/** The yes/no question. It says which bank, and whether the camera boots it now. */
export function flashQuestion(report: SlotsReport, plan: SlotFlashPlan, fileName: string): string {
  const view = findView(report, plan.key);
  const booted =
    view?.active === true
      ? ' (the bank the camera boots now)'
      : plan.targetEmpty === true
        ? ' (empty — nothing is overwritten)'
        : '';
  const product = report.state.description.productName ?? 'this camera';
  const serial = plan.serial === null ? '' : ` (${plan.serial})`;
  return `Write ${fileName} to bank ${bankName(plan.key)}${booted} on ${product}${serial}? [y/N] `;
}

/** What the read-back said, and what the person does next. */
/**
 * The CLI's one replug instruction after a write and after a patch, with the command that reads the banks
 * again. Core's end-of-write progress says only "Written." (the front end gives the instruction, once), so
 * on a TTY and in a pipe alike this is the only place it is printed (TESTING.md 42.87).
 */
export const REPLUG_LINE_WRITE =
  'Unplug the camera and plug it back in. A bank is only used when the camera boots, so the new image ' +
  'runs after the next start. Then run `seek-fw slots list` to read the banks again.';
export const REPLUG_LINE_PATCH =
  'Unplug the camera and plug it back in. The patched image runs after the next start. Then run ' +
  '`seek-fw slots list` to read the banks again.';

export function readBackLines(
  result: FlashSlotResult,
  afterSha256: string | null,
  color: boolean,
): string[] {
  const bank = bankName(result.key);
  const sha = afterSha256 === null ? '' : ` (sha256 ${afterSha256})`;
  const lines: string[] = [`commit status: ${hexUp(result.commitStatus, 4)}`];
  if (result.verified === true) {
    lines.push(paint(`read-back: bank ${bank} matches the staged image${sha}`, 'green', color));
  } else if (result.verified === false) {
    lines.push(
      paint(`read-back: bank ${bank} does NOT match the staged image${sha}`, 'red', color),
    );
  } else if (afterSha256 !== null) {
    /* Read back, but nothing could be compared with it (raw bytes whose plain image cannot be
     * named). Said as what happened, not "skipped". */
    lines.push(
      `read-back: bank ${bank} read back${sha}; no image could be predicted for it, so it is reported, not compared`,
    );
  } else {
    lines.push('read-back: skipped (--no-verify)');
  }
  lines.push(REPLUG_LINE_WRITE);
  return lines;
}

/* ==================================================================== *
 * Dump: the file names and the report
 * ==================================================================== */

/**
 * The files one dump writes: the bank as stored, and the decrypted image when there is one.
 * The names are core's `slotDumpNames`, the same ones the page downloads under.
 */
export function dumpArtifacts(
  version: string | null,
  dumped: DumpedSlot,
  keys: { readonly keyA: Uint8Array; readonly keyB: Uint8Array } | null = null,
): Artifact[] {
  const names = slotDumpNames(dumped, version, keys);
  const artifacts: Artifact[] = [{ name: names.raw, data: dumped.raw }];
  if (dumped.plain !== null && names.decrypted !== null) {
    artifacts.push({ name: names.decrypted, data: dumped.plain });
  }
  return artifacts;
}

/* ==================================================================== *
 * The commands
 * ==================================================================== */

/** The reporter as a write sees it: during a write, detail lines are shown, not hidden. */
function loud(inner: Reporter): Reporter {
  return withLevelMap(inner, (level) => (level === 'detail' ? 'info' : level));
}

async function readImage(path: string): Promise<Uint8Array> {
  try {
    return new Uint8Array(await readFile(path));
  } catch (error) {
    throw new CliError(
      `could not read ${path}: ${error instanceof Error ? error.message : String(error)}`,
      { code: 'cli/no-input' },
    );
  }
}

async function listAction(ctx: CommandContext, ops: SlotOps): Promise<CommandResult> {
  const session = await openSession(ctx);
  try {
    const choice = await chooseProfileByProbe(ctx, session);
    const report = await ops.inspect(
      workflowContext(session, choice.profile, choice.detection, ctx),
    );
    if (ctx.human) ctx.out(listLines(report, ctx.color).join('\n'));
    return listResult(report);
  } finally {
    await session.close();
  }
}

async function dumpAction(ctx: CommandContext, ops: SlotOps, key: SlotKey): Promise<CommandResult> {
  const session = await openSession(ctx);
  try {
    const choice = await chooseProfileByProbe(ctx, session);
    const workflow = workflowContext(session, choice.profile, choice.detection, ctx);
    const report = await ops.inspect(workflow);
    refuse(dumpRefusal(report, key));
    const view = requireView(report, key);

    const dumped = await ops.dump(workflow, report, key);
    const version = versionOf(view);
    const written = await writeRun(
      ctx,
      'slots',
      dumpArtifacts(version, dumped, report.state.keyTable),
    );

    if (ctx.human) {
      ctx.out(
        dumped.empty
          ? `bank ${bankName(key)}: empty, nothing to decrypt — the stored bank is the raw ` +
              `${String(dumped.raw.length)} B of 0xFF, sha256 ${dumped.sha256}`
          : `bank ${bankName(key)}: stored image sha256 ${dumped.sha256}` +
              (dumped.plain === null
                ? '; no decrypted image (no key recovered for it)'
                : `; decrypted image sha256 ${dumped.plainSha256 ?? '(unknown)'}`),
      );
      for (const note of dumped.notes) ctx.out(`  · ${note}`);
    }

    return {
      action: 'dump',
      bank: key,
      address: hexUp(view.entry.address),
      version,
      sha256: dumped.sha256,
      empty: dumped.empty,
      plainSha256: dumped.plainSha256,
      decrypted: dumped.plain !== null,
      notes: [...dumped.notes],
      output: { directory: written.directory, zip: written.zip, files: written.files },
    };
  } finally {
    await session.close();
  }
}

async function flashAction(
  ctx: CommandContext,
  ops: SlotOps,
  key: SlotKey,
  path: string,
  kind: SlotInputKind,
): Promise<CommandResult> {
  /* (1) Nobody to ask. Checked before the image is read and before the camera is opened, so a
   * script that forgot --yes fails at once. */
  const dryRun = ctx.slotFlags?.dryRun ?? false;
  if (!dryRun && !ctx.options.yes && !ctx.io.stdinIsTty) {
    throw new CliError(
      'refusing to flash without confirmation: stdin is not a terminal, so there is nobody to ask',
      {
        code: 'slots/refused',
        hint: 'Pass --yes to confirm non-interactively, or run it on a terminal to read the plan.',
      },
    );
  }

  const fileName = basename(path);
  const bytes = await readImage(path);
  const acknowledgeRisk = ctx.slotFlags?.acknowledgeRisk ?? false;
  const verify = ctx.slotFlags?.verify ?? true;

  const session = await openSession(ctx);
  try {
    const choice = await chooseProfileByProbe(ctx, session);
    const workflow = workflowContext(session, choice.profile, choice.detection, ctx);
    const report = await ops.inspect(workflow);

    /* (2) Refused before anything is prepared or sent: the build, the bank, the read, and the
     * booted or recovery bank without the acknowledgement. */
    refuse(flashRefusal(report, key, kind, acknowledgeRisk));

    const plan = ops.prepare(
      report,
      key,
      { kind, bytes, fileName },
      { running16Hz: ctx.slotFlags?.running16Hz ?? false },
    );
    const expectedSha256 =
      plan.expectedStored === null ? null : await sha256hex(plan.expectedStored);

    /* (3) The plan is always shown, even under --json (where it lands on stderr): nobody is asked
     * to confirm a write they were not shown. */
    ctx.reporter.write(flashPlanLines(plan, fileName, expectedSha256, ctx.color).join('\n'));

    /* --dry-run stops here: the plan is the whole output, the bank is never armed. */
    if (dryRun) {
      return {
        action: 'flash',
        bank: key,
        address: hexUp(plan.address),
        file: fileName,
        kind: plan.kind,
        staging: plan.staging,
        payloadBytes: plan.payload.length,
        sum16: hexUp(plan.sum16, 4),
        targetEmpty: plan.targetEmpty === true,
        expectedSha256,
        notes: [],
        warnings: [...plan.warnings],
        planNotes: planNotesJson(plan),
        written: false,
        dryRun: true,
      };
    }

    if (!ctx.options.yes) {
      const confirmed = await ctx.io.confirm(flashQuestion(report, plan, fileName));
      if (!confirmed) {
        throw new CliError('aborted at the confirmation prompt — nothing was written', {
          code: 'slots/refused',
        });
      }
    } else {
      ctx.reporter.log('--yes given: skipping the confirmation', 'warn');
    }

    const result = await ops.flash({ ...workflow, reporter: loud(ctx.reporter) }, report, plan, {
      verify,
      acknowledgeRisk,
    });
    const storedSha256 = result.after === null ? null : await sha256hex(result.after);
    ctx.reporter.write(readBackLines(result, storedSha256, ctx.color).join('\n'));

    if (result.verified === false) {
      throw new CliError(`the read-back of bank ${bankName(key)} does not match the staged image`, {
        code: 'slots/verify-failed',
        hint:
          `Run \`seek-fw slots list\` once the camera is back. Do not rely on bank ${bankName(key)} ` +
          'until a read matches.',
      });
    }

    return {
      action: 'flash',
      bank: key,
      address: hexUp(plan.address),
      file: fileName,
      kind: plan.kind,
      staging: plan.staging,
      payloadBytes: plan.payload.length,
      sum16: hexUp(plan.sum16, 4),
      commitStatus: result.commitStatus,
      verified: result.verified,
      targetEmpty: plan.targetEmpty === true,
      expectedSha256,
      storedSha256,
      notes: [...result.notes],
      warnings: [...plan.warnings],
      planNotes: planNotesJson(plan),
      written: true,
    };
  } finally {
    await session.close();
  }
}

/* ==================================================================== *
 * patch-fps: the frame-rate patch on one bank (core: slots/fps-patch.ts)
 * ==================================================================== */

/** The frame-rate plan as JSON: the same facts the text plan states, for a script to read. */
export function fpsPlanJson(plan: FpsPlan): Record<string, unknown> {
  if (plan.status === 'offer') {
    return {
      status: 'offer',
      reason: null,
      patch: plan.patch.id,
      fromHz: plan.fromHz,
      toHz: plan.toHz,
      changedBytes: plan.sites.length,
      sumWord: hexUp(plan.sumWord.offset, 4),
      /* The row the patch changes: in words (`name`, what the text plan prints), and as the table labels it
       * (`detail`), with where it is in the decrypted image. */
      row: {
        name: plan.patch.row.name,
        detail: plan.patch.row.detail,
        offset: hexUp(plan.patch.row.offset, 4),
        length: plan.patch.row.length,
      },
    };
  }
  return {
    status: plan.status,
    reason: plan.reason,
    patch: null,
    fromHz: null,
    toHz: null,
    changedBytes: null,
    sumWord: null,
    row: null,
  };
}

/** The plan as a person reads it, before anything is saved or sent. */
export function fpsPlanLines(
  key: SlotKey,
  plan: Extract<FpsPlan, { status: 'offer' }>,
  address: number,
  version: string | null,
  color: boolean,
  dumpDir: string | null,
  bootWarning: FpsBootWarning | null = null,
): string[] {
  const bank = bankName(key);
  const lines: string[] = [''];
  lines.push(heading('Frame-rate patch plan', color));
  lines.push(
    table([
      ['  bank', `${bank} (${hexUp(address)})`],
      /* The build in words, the rate on the next row; the JSON's `patch` keeps the table id for scripts
       * (TESTING.md 42.87). */
      ['  build', `firmware ${version ?? plan.patch.version}`],
      ['  rate', `${String(plan.fromHz)} Hz -> ${String(plan.toHz)} Hz`],
      [
        '  bytes',
        `${String(plan.sites.length)} byte(s) of the decrypted image change; the acceptance-sum word at ` +
          `${hexUp(plan.sumWord.offset, 4)} moves so the sum is kept; the key pair is not touched`,
      ],
      /* The row in words; the JSON's `row.detail` keeps the table's own label (TESTING.md 42.88). */
      ['  row', plan.patch.row.name],
      [
        '  saved first',
        dumpDir === null
          ? 'the bank as stored and its decrypted image, into --dump-dir (needed to write)'
          : `the bank as stored and its decrypted image, into ${dumpDir}, before any byte is sent`,
      ],
    ]),
  );
  if (bootWarning !== null) {
    lines.push('');
    for (const paragraph of bootWarning.paragraphs) {
      lines.push(paint(`  ! ${paragraph}`, 'yellow', color));
    }
  }
  lines.push('');
  lines.push(
    paint(
      `  ! The saved decrypted file is the only way back. To undo the patch, flash it again: ` +
        `seek-fw slots flash ${key} <the -decrypted file> --yes (add --acknowledge-risk ` +
        `${key === 'r' ? 'as for every write to recovery R' : `if the camera boots bank ${bank}`}).`,
      'yellow',
      color,
    ),
  );
  lines.push('');
  return lines;
}

/** The yes/no question for a patch write. */
export function fpsQuestion(
  report: SlotsReport,
  key: SlotKey,
  plan: Extract<FpsPlan, { status: 'offer' }>,
): string {
  const view = findView(report, key);
  const booted = view?.active === true ? ' (the bank the camera boots now)' : '';
  const product = report.state.description.productName ?? 'this camera';
  const serial = report.state.serial === null ? '' : ` (${report.state.serial})`;
  return (
    `Patch bank ${bankName(key)}${booted} on ${product}${serial} from ${String(plan.fromHz)} Hz to ` +
    `${String(plan.toHz)} Hz? The bank is saved first. [y/N] `
  );
}

/**
 * Saves the pre-patch dump into `dir`, as the write waits for it. A file that already exists is never
 * replaced (`wx`): a second run into the same folder is refused rather than overwriting a dump.
 * True only once both files are on disk at their full size.
 */
export async function saveFpsDump(dir: string, dump: FpsPreDump): Promise<boolean> {
  await mkdir(dir, { recursive: true });
  const rawPath = join(dir, dump.rawName);
  const plainPath = join(dir, dump.plainName);
  await writeFile(rawPath, dump.raw, { flag: 'wx' });
  await writeFile(plainPath, dump.plain, { flag: 'wx' });
  const [rawInfo, plainInfo] = await Promise.all([stat(rawPath), stat(plainPath)]);
  return rawInfo.size === dump.raw.length && plainInfo.size === dump.plain.length;
}

async function patchFpsAction(
  ctx: CommandContext,
  ops: SlotOps,
  key: SlotKey,
): Promise<CommandResult> {
  const flags = ctx.slotFlags ?? NO_SLOT_FLAGS;
  const write = flags.write === true;
  const dumpDir = flags.dumpDir ?? null;
  const acknowledgeRisk = flags.acknowledgeRisk;
  const verify = flags.verify;
  /* A write that cannot keep its dump is not started: the dump is the only way back. Checked before the
   * camera is opened. */
  if (write && dumpDir === null) {
    throw new CliError(
      'slots patch-fps --write needs --dump-dir: the bank is saved there before the patch is written, ' +
        'and that dump is the only way back',
      { code: 'slots/refused', hint: `Pass --dump-dir <a new folder>. ${NOTHING_SENT}` },
    );
  }
  if (write && !ctx.options.yes && !ctx.io.stdinIsTty) {
    throw new CliError(
      'refusing to patch without confirmation: stdin is not a terminal, so there is nobody to ask',
      {
        code: 'slots/refused',
        hint: 'Pass --yes to confirm non-interactively, or run it on a terminal to read the plan.',
      },
    );
  }

  const session = await openSession(ctx);
  try {
    const choice = await chooseProfileByProbe(ctx, session);
    const workflow = workflowContext(session, choice.profile, choice.detection, ctx);
    const report = await ops.inspect(workflow);
    const plan = ops.fpsPlan === undefined ? fpsPlanOfBank(report, key) : ops.fpsPlan(report, key);
    const view = requireView(report, key);
    if (plan.status !== 'offer') {
      throw new CliError(`bank ${bankName(key)}: ${plan.reason}`, {
        code: 'slots/refused',
        hint: NOTHING_SENT,
      });
    }
    /* The booted bank and recovery R need --acknowledge-risk, as `slots flash` does. Refused here, before
     * the plan, the question and the saved dump: core's own refusal comes only after the dump is saved,
     * and it is worded for a library caller (TESTING.md 42.86). */
    const risk = bootRisk(report, view);
    if (write && risk !== null && !acknowledgeRisk) {
      throw new CliError(`refusing to patch bank ${bankName(key)}: ${risk}`, {
        code: 'slots/refused',
        hint: `Pass --acknowledge-risk to patch it anyway. ${NOTHING_SENT}`,
      });
    }
    const version = report.state.version;
    /* The warning is about the bank being patched: it counts as holding the patch once written. */
    const bootWarning = fpsBootWarningOf(report, { target: key });
    ctx.reporter.write(
      fpsPlanLines(key, plan, view.entry.address, version, ctx.color, dumpDir, bootWarning).join(
        '\n',
      ),
    );

    /* The dry run stops here: the plan is the whole output and nothing is saved or sent. */
    if (!write) {
      const needs = risk === null || acknowledgeRisk ? '' : ' --acknowledge-risk';
      ctx.reporter.log(
        `dry run: nothing was saved and nothing was written. Add --write --dump-dir <folder>${needs} to patch bank ${bankName(key)}.`,
        'info',
      );
      return {
        action: 'patch-fps',
        bank: key,
        address: hexUp(view.entry.address),
        version,
        ...fpsPlanJson(plan),
        bootWarning: bootWarning === null ? null : [...bootWarning.paragraphs],
        written: false,
        dryRun: true,
        notes: [],
      };
    }

    if (!ctx.options.yes) {
      const confirmed = await ctx.io.confirm(fpsQuestion(report, key, plan));
      if (!confirmed) {
        throw new CliError('aborted at the confirmation prompt — nothing was written', {
          code: 'slots/refused',
        });
      }
    } else {
      ctx.reporter.log('--yes given: skipping the confirmation', 'warn');
    }

    const saveDir = dumpDir;
    if (saveDir === null) {
      throw new CliError('no --dump-dir for the write', {
        code: 'slots/refused',
        hint: NOTHING_SENT,
      });
    }
    const patchOptions = {
      acknowledgeRisk,
      verify,
      saveDump: (dump: FpsPreDump) => saveFpsDump(saveDir, dump),
    };
    const patchWorkflow = { ...workflow, reporter: loud(ctx.reporter) };
    const result =
      ops.patchFps === undefined
        ? await patchBankFps(patchWorkflow, report, key, patchOptions)
        : await ops.patchFps(patchWorkflow, report, key, patchOptions);
    const readBack = result.readBack;
    const lines = [
      `commit status: ${hexUp(result.written.commitStatus, 4)}`,
      readBack.checked
        ? readBack.ok === true
          ? paint(
              `read-back: bank ${bankName(key)} differs from the saved dump only at the ` +
                `${String(result.changed.length)} planned byte(s), the sites and the sum word`,
              'green',
              ctx.color,
            )
          : paint(
              `read-back: bank ${bankName(key)} does NOT differ only as planned (unexpected ` +
                `${String(readBack.unexpected.length)}, missing ${String(readBack.missing.length)})`,
              'red',
              ctx.color,
            )
        : 'read-back: skipped (--no-verify)',
      REPLUG_LINE_PATCH,
    ];
    ctx.reporter.write(lines.join('\n'));
    if (readBack.ok === false || result.written.verified === false) {
      throw new CliError(
        `the read-back of bank ${bankName(key)} does not match the patched image as planned`,
        {
          code: 'slots/verify-failed',
          hint:
            `The saved dump is in ${saveDir}. Run \`seek-fw slots list\` once the camera is back. ` +
            'Do not rely on the bank until a read matches.',
        },
      );
    }
    return {
      action: 'patch-fps',
      bank: key,
      address: hexUp(view.entry.address),
      version,
      ...fpsPlanJson(plan),
      bootWarning: bootWarning === null ? null : [...bootWarning.paragraphs],
      written: true,
      dryRun: false,
      saved: { directory: dumpDir, rawName: result.pre.rawName, plainName: result.pre.plainName },
      commitStatus: result.written.commitStatus,
      verified: result.written.verified,
      readBack: {
        checked: readBack.checked,
        ok: readBack.ok,
        differing: [...readBack.differing],
        missing: [...readBack.missing],
        unexpected: [...readBack.unexpected],
      },
      changedOffsets: [...result.changed],
      notes: [...result.notes],
    };
  } finally {
    await session.close();
  }
}

/**
 * The `slots` command, over the given core calls. `slotsCommand` is this with core's own functions;
 * the tests call it with fakes.
 */
export function slotsCommandWith(ops: SlotOps): Command {
  return async (ctx: CommandContext): Promise<CommandResult> => {
    const request = parseSlotsArgs(ctx.args ?? [], ctx.slotFlags ?? NO_SLOT_FLAGS);
    switch (request.action) {
      case 'list':
        return listAction(ctx, ops);
      case 'dump':
        return dumpAction(ctx, ops, request.key);
      case 'flash':
        return flashAction(ctx, ops, request.key, request.file, request.kind);
      case 'patch-fps':
        return patchFpsAction(ctx, ops, request.key);
    }
  };
}

export const slotsCommand: Command = slotsCommandWith(CORE_SLOT_OPS);
