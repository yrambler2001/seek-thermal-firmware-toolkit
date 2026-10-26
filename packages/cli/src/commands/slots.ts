/**
 * `seek-fw slots` — the three firmware banks, one at a time.
 *
 *   slots list                     identify the camera and each bank, and what this build can do
 *   slots dump <a|b|r>             read one bank as stored, and its decrypted image when a key recovers
 *   slots flash <a|b|r> <file>     write one bank: a decrypted image (the default), or --raw bytes
 *   slots copy <from> <to>         write one bank with another bank's image, as the slots read decrypted it
 *   slots restore <bank> <file>    write one bank as a full flash backup (4 MiB, or a Preserve run file) holds it
 *   slots patch-fps <a|b|r|all>    the frame-rate patch of one bank, or of every bank that offers it
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
 *     --yes there is nobody to ask, so the command refuses;
 *   - every write saves its target bank first, as the same zip the page downloads (core's backup,
 *     owner 2026-10-26), into --dump-dir, or the current directory when none is given, as the page's
 *     download needs no question either. The write waits for the zip to be on disk at its full size;
 *     an existing file is never replaced.
 *
 * And after the write, a read-back that does not match is a failed run with a non-zero exit, not a
 * line of text that a script would walk past.
 *
 * The core calls sit behind `SlotOps`. The default is core itself; the offline tests pass fakes, so
 * every refusal and every rendered plan is exercised without a camera.
 */

import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import {
  bankWordsOf,
  bootChoiceOf,
  bootRuleKnown,
  bootsNowOf,
  bootWordRuleOf,
  checkKeyReportOf,
  derivedKeyLine,
  deriveWriteKeys,
  backupFileNameShown,
  backupPlanText,
  copySourceRefusal,
  dumpSlot,
  FF_VENDOR_STAGED,
  FF_VENDOR_STORED,
  flashSlotWithBackup,
  fpsBootWarningOf,
  everyBankBootedLast,
  fpsEveryBankPlan,
  fpsPlanOfBank,
  fullFlashOf,
  hexUp,
  inspectSlots,
  lastStartReportOf,
  patchBankFps,
  patchEveryBankFps,
  planSlotCopy,
  planSlotRestore,
  prepareSlotFlash,
  restoreReadBack,
  restoreReadBackText,
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
  type FlashSlotResult,
  type FpsBootWarning,
  type FpsEveryBankPlan,
  type FpsEveryBankResult,
  type FpsPatchOptions,
  type FpsPatchResult,
  type FpsPlan,
  type Reporter,
  type RestoreReadBack,
  type SaveBackup,
  type SlotCopyPlan,
  type SlotRestorePlan,
  type SlotWriteOptions,
  type SlotWriteResult,
  type WriteAction,
  type WriteBackup,
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
 * The core calls this command makes. The defaults are core's own functions. The frame-rate, copy and
 * restore calls are optional so a test that does not reach them need not answer them.
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
  /** Saves the target bank first (the backup zip), then writes and reads it back: core `flashSlotWithBackup`. */
  write(
    ctx: WorkflowContext,
    report: SlotsReport,
    plan: SlotFlashPlan,
    options: SlotWriteOptions,
  ): Promise<SlotWriteResult>;
  fpsPlan?(report: SlotsReport, key: SlotKey): FpsPlan;
  patchFps?(
    ctx: WorkflowContext,
    report: SlotsReport,
    key: SlotKey,
    options: FpsPatchOptions,
  ): Promise<FpsPatchResult>;
  patchEveryFps?(
    ctx: WorkflowContext,
    report: SlotsReport,
    options: FpsPatchOptions,
  ): Promise<FpsEveryBankResult>;
  copy?(
    report: SlotsReport,
    from: SlotKey,
    to: SlotKey,
    options?: PrepareSlotFlashOptions,
  ): SlotCopyPlan;
  restore?(
    report: SlotsReport,
    key: SlotKey,
    file: { readonly bytes: Uint8Array; readonly name: string },
    options?: PrepareSlotFlashOptions,
  ): Promise<SlotRestorePlan>;
}

export const CORE_SLOT_OPS: SlotOps = {
  inspect: inspectSlots,
  dump: dumpSlot,
  prepare: prepareSlotFlash,
  write: flashSlotWithBackup,
  fpsPlan: fpsPlanOfBank,
  patchFps: patchBankFps,
  patchEveryFps: patchEveryBankFps,
  copy: planSlotCopy,
  restore: async (report, key, file, options) =>
    planSlotRestore(report, key, await fullFlashOf(file.bytes, file.name), options),
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
  | { readonly action: 'copy'; readonly from: SlotKey; readonly to: SlotKey }
  | { readonly action: 'restore'; readonly key: SlotKey; readonly file: string }
  | { readonly action: 'patch-fps'; readonly key: SlotKey | 'all' };

/** The subcommands, as the flag checks name them. */
type Subcommand = 'list' | 'dump' | 'flash' | 'copy' | 'restore' | 'patch-fps';

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
 * The writes that are flashes (`flash`, `copy`, `restore`) write unless --dry-run; `patch-fps` is a dry run
 * unless --write. Every write saves its bank first into --dump-dir (the current directory by default).
 */
function refuseUnusedFlags(flags: SlotFlags, subcommand: Subcommand): void {
  /* Each flag, and whether it is on. */
  const flagged: readonly { readonly on: boolean; readonly name: string }[] = [
    { on: flags.raw, name: '--raw' },
    { on: flags.acknowledgeRisk, name: '--acknowledge-risk' },
    { on: !flags.verify, name: '--no-verify' },
    { on: flags.dryRun, name: '--dry-run' },
    { on: flags.running16Hz, name: '--running-16hz' },
    { on: flags.write === true, name: '--write' },
    { on: (flags.dumpDir ?? null) !== null, name: '--dump-dir' },
  ];
  const writes = ['--acknowledge-risk', '--no-verify', '--dump-dir'];
  const usedBy: Readonly<Record<Subcommand, readonly string[]>> = {
    list: [],
    dump: [],
    flash: ['--raw', ...writes, '--dry-run', '--running-16hz'],
    copy: [...writes, '--dry-run', '--running-16hz'],
    restore: [...writes, '--dry-run', '--running-16hz'],
    'patch-fps': [...writes, '--write'],
  };
  const unused = flagged.filter((flag) => flag.on && !usedBy[subcommand].includes(flag.name));
  if (unused.length > 0) {
    const names = unused.map((flag) => flag.name).join(', ');
    const owners = [
      ...new Set(
        unused.flatMap((flag) =>
          (Object.keys(usedBy) as Subcommand[])
            .filter((name) => usedBy[name].includes(flag.name))
            .map((name) => `'slots ${name}'`),
        ),
      ),
    ].join(', ');
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
      'Use one of: slots list | slots dump <a|b|r> | slots flash <a|b|r> <file> | ' +
        'slots copy <from> <to> | slots restore <a|b|r> <full-flash-file> | slots patch-fps <a|b|r|all>.',
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
  if (action === 'copy') {
    const [from, to, ...extra] = rest;
    if (from === undefined || to === undefined) {
      throw new UsageError('slots copy needs two banks: slots copy <from> <to>');
    }
    if (extra.length > 0) throw unexpected(extra, 'slots copy');
    const source = parseBank(from);
    const target = parseBank(to);
    if (source === target)
      throw new UsageError(`slots copy: bank ${from} is not copied onto itself`);
    refuseUnusedFlags(flags, 'copy');
    return { action: 'copy', from: source, to: target };
  }
  if (action === 'restore') {
    const [bank, file, ...extra] = rest;
    if (bank === undefined || file === undefined) {
      throw new UsageError(
        'slots restore needs a bank and a full flash backup: slots restore <a|b|r> <file>',
      );
    }
    if (extra.length > 0) throw unexpected(extra, 'slots restore');
    refuseUnusedFlags(flags, 'restore');
    return { action: 'restore', key: parseBank(bank), file };
  }
  if (action === 'patch-fps') {
    const [bank, ...extra] = rest;
    if (bank === undefined) throw new UsageError('slots patch-fps needs a bank: a, b, r or all');
    if (extra.length > 0) throw unexpected(extra, 'slots patch-fps');
    refuseUnusedFlags(flags, 'patch-fps');
    return { action: 'patch-fps', key: bank.toLowerCase() === 'all' ? 'all' : parseBank(bank) };
  }
  throw new UsageError(
    `unknown slots subcommand '${action}'`,
    'Use one of: list, dump, flash, copy, restore, patch-fps.',
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
    /* The same words on every line, core's (`bootsNowOf`): on the locked lines the bank is the active-slot
     * word's, which TESTING.md 42.56 measured as the bank that ran (42.89). */
    return `${bootsNowOf(`bank ${bank}`)}; a bad write there can stop the camera booting`;
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
        `\`seek-fw slots copy ${source.entry.key} ${view.entry.key}\`.`;
  return `${head} It can be written. ${view.entry.emptyBank.why}${how}`;
}

/**
 * The keys every bank is written under (write-keys.ts), in the form the line uses: the 2014 plaintext
 * chain's image as it is; the 2016 Compact PRO's image under its own key block 0, which the camera stores
 * under the key its bootloader checks; the 1.3.0.8 FF image in the vendor's form, stored under Key B; or the
 * modern line's keys derived from the booted bank and the running application. A refusal names the
 * measurement that failed. The page's `SlotWriteKeys` shows the same verdict.
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
  /* The 1.3.0.8 FF build with no bank stored plain: the vendor's form, not a refusal (TESTING.md 42.89). */
  if (refusal === null && keys.form === 'ff-vendor') {
    lines.push(
      table([
        ['  staged as', FF_VENDOR_STAGED],
        ['  stored as', FF_VENDOR_STORED],
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
  /* The same words as `seek-fw info` and the Info tab (core's `lastStartReportOf`, TESTING.md 42.89). */
  const lastStart = lastStartReportOf(report.state) ?? 'not read';
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
       * stores under), 'ff-vendor' on a 1.3.0.8 FF camera with no bank stored plain (`key` Key B),
       * 'derived' on the modern line. */
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
  extra: {
    /** Where the image comes from when it is not a file: another bank, or a bank of a full flash backup. */
    readonly source?: string | null;
    /** What the write saves first, and where (core's `backupPlanText` and the folder). */
    readonly savedFirst?: string | null;
  } = {},
): string[] {
  const lines: string[] = [''];
  /* What the input is; the staging row says how it is sent, in core's words (`stagingDetail`), so the two
   * rows do not say the same thing twice (TESTING.md 42.87). */
  const ff = plan.staging === 'key-a-keystream' || plan.storedForm === 'key-b-ciphertext';
  const kind =
    plan.kind === 'plain' ? (ff ? 'decrypted 1.3.0.8 FF image' : 'decrypted image') : 'raw bytes';
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
      ...(extra.source == null ? [] : [['  image taken from', extra.source]]),
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
      ...(extra.savedFirst == null ? [] : [['  saved first', extra.savedFirst]]),
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
 * The backup every write saves first (core: slots/backup.ts)
 * ==================================================================== */

/** The folder every write saves its backup zip into: --dump-dir, or the current directory. */
export function backupDirOf(flags: SlotFlags): string {
  return resolve(flags.dumpDir ?? '.');
}

/**
 * Saves the backup zip into `dir` under core's name, the same zip the page downloads. A file that already
 * exists is never replaced (`wx`): a second zip of the same second is saved as `<name>-2.zip`, as a
 * browser keeps both downloads. True only once the zip is on disk at its full size; the save is logged with
 * its path, before anything is sent.
 */
export function saveBackupInto(
  dir: string,
  reporter: Reporter,
  saved: (path: string) => void = () => undefined,
): SaveBackup {
  return async (backup: WriteBackup): Promise<boolean> => {
    await mkdir(dir, { recursive: true });
    let path = join(dir, backup.fileName);
    for (let copy = 2; ; copy++) {
      try {
        await writeFile(path, backup.zip, { flag: 'wx' });
        break;
      } catch (error) {
        if ((error as { code?: unknown }).code !== 'EEXIST' || copy > 99) throw error;
        path = join(dir, `${backup.name}-${String(copy)}.zip`);
      }
    }
    const info = await stat(path);
    if (info.size !== backup.zip.length) return false;
    reporter.log(`saved first: ${path} (${String(info.size)} B)`, 'ok');
    saved(path);
    return true;
  };
}

/** The plan's "saved first" row: core's sentence, and the folder. */
export function savedFirstText(
  report: SlotsReport,
  keys: readonly SlotKey[],
  action: WriteAction,
  dir: string,
): string {
  return `${backupPlanText(report, keys, action)} Into ${dir}.`;
}

/** The backup as the JSON carries it: where it is and what it holds (the file names and their sha256). */
export function backupJson(backup: WriteBackup, path: string | null): Record<string, unknown> {
  return {
    file: path,
    fileName: backup.fileName,
    bytes: backup.zip.length,
    savedAt: backup.savedAt,
    banks: backup.banks.map((bank) => ({
      bank: bank.key,
      address: hexUp(bank.address),
      content: bank.content,
      version: bank.version,
      stored: bank.stored,
      decrypted: bank.decrypted,
      notes: [...bank.notes],
    })),
  };
}

/** The read-back of a restore against the backup's stored bank bytes, as the JSON carries it. */
function restoreJson(check: RestoreReadBack | null): Record<string, unknown> | null {
  return check === null
    ? null
    : {
        compared: check.compared,
        equal: check.equal,
        differing: check.differing,
        firstDiffering: check.firstDiffering === null ? null : hexUp(check.firstDiffering),
      };
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

/** Nobody to ask: refused before the camera is opened, so a script that forgot --yes fails at once. */
function refuseUnattended(ctx: CommandContext, writes: boolean, what: string): void {
  if (writes && !ctx.options.yes && !ctx.io.stdinIsTty) {
    throw new CliError(
      `refusing to ${what} without confirmation: stdin is not a terminal, so there is nobody to ask`,
      {
        code: 'slots/refused',
        hint: 'Pass --yes to confirm non-interactively, or run it on a terminal to read the plan.',
      },
    );
  }
}

/** One write a flash, a copy or a restore has planned, ready to be shown, saved first, sent and read back. */
interface PlannedWrite {
  /** The JSON's `action`: 'flash', 'copy' or 'restore'. */
  readonly command: 'flash' | 'copy' | 'restore';
  readonly plan: SlotFlashPlan;
  /**
   * What is written, in the plan's image row and the question: the file's name, or for a copy and a restore
   * the source in words ("bank A's image", "bank B of <file>"), never a made-up file name (TESTING.md 42.96).
   */
  readonly what: string;
  readonly action: WriteAction;
  /** Where the image comes from when it is not a file. */
  readonly source: string | null;
  readonly restore: SlotRestorePlan | null;
  /** The JSON's own keys for this command (the file, the source bank). */
  readonly json: Record<string, unknown>;
}

/**
 * The part every flash, copy and restore shares, once the plan is made: the plan shown (always, even under
 * --json, on stderr), the dry run's stop, the question, the backup zip saved into the dump folder, the write
 * and its read-back, and a non-zero exit when the read-back does not match.
 */
async function runPlannedWrite(
  ctx: CommandContext,
  ops: SlotOps,
  report: SlotsReport,
  workflow: WorkflowContext,
  planned: PlannedWrite,
): Promise<CommandResult> {
  const flags = ctx.slotFlags ?? NO_SLOT_FLAGS;
  const { plan } = planned;
  const dir = backupDirOf(flags);
  const expectedSha256 = plan.expectedStored === null ? null : await sha256hex(plan.expectedStored);
  ctx.reporter.write(
    flashPlanLines(plan, planned.what, expectedSha256, ctx.color, {
      source: planned.source,
      savedFirst: savedFirstText(report, [plan.key], planned.action, dir),
    }).join('\n'),
  );
  const common = {
    action: planned.command,
    bank: plan.key,
    address: hexUp(plan.address),
    ...planned.json,
    kind: plan.kind,
    staging: plan.staging,
    payloadBytes: plan.payload.length,
    sum16: hexUp(plan.sum16, 4),
    targetEmpty: plan.targetEmpty === true,
    expectedSha256,
    warnings: [...plan.warnings],
    /* The image may not be the build the camera runs: its code is for JSON only; the text is also in warnings. */
    imageBuild: plan.imageBuild,
    planNotes: planNotesJson(plan),
  };

  /* --dry-run stops here: the plan is the whole output; nothing is saved, the bank is never armed. */
  if (flags.dryRun) {
    return {
      ...common,
      notes: [],
      backup: { directory: dir, fileName: backupFileNameShown(report, [plan.key], planned.action) },
      written: false,
      dryRun: true,
    };
  }

  if (!ctx.options.yes) {
    const confirmed = await ctx.io.confirm(flashQuestion(report, plan, planned.what));
    if (!confirmed) {
      throw new CliError('aborted at the confirmation prompt — nothing was written', {
        code: 'slots/refused',
      });
    }
  } else {
    ctx.reporter.log('--yes given: skipping the confirmation', 'warn');
  }

  const saved: { path: string | null } = { path: null };
  const done = await ops.write({ ...workflow, reporter: loud(ctx.reporter) }, report, plan, {
    verify: flags.verify,
    acknowledgeRisk: flags.acknowledgeRisk,
    action: planned.action,
    saveBackup: saveBackupInto(dir, ctx.reporter, (path) => {
      saved.path = path;
    }),
    ...(ctx.io.now === undefined ? {} : { now: () => ctx.io.now?.() ?? new Date() }),
  });
  const result: FlashSlotResult = done.written;
  const storedSha256 = result.after === null ? null : await sha256hex(result.after);
  const check =
    planned.restore === null ? null : restoreReadBack(planned.restore.stored, result.after);
  const lines = readBackLines(result, storedSha256, ctx.color);
  if (check !== null) {
    lines.splice(-1, 0, `restore: ${restoreReadBackText(check, `bank ${bankName(plan.key)}`)}`);
  }
  ctx.reporter.write(lines.join('\n'));

  if (result.verified === false) {
    throw new CliError(
      `the read-back of bank ${bankName(plan.key)} does not match the staged image`,
      {
        code: 'slots/verify-failed',
        hint:
          `The backup is ${saved.path ?? done.backup.fileName}. Run \`seek-fw slots list\` once the ` +
          `camera is back. Do not rely on bank ${bankName(plan.key)} until a read matches.`,
      },
    );
  }

  return {
    ...common,
    commitStatus: result.commitStatus,
    verified: result.verified,
    storedSha256,
    restoreReadBack: restoreJson(check),
    notes: [...result.notes],
    backup: { directory: dir, ...backupJson(done.backup, saved.path) },
    written: true,
  };
}

/** Opens the camera, reads the banks, and runs `body` with them; the session is closed after. */
async function withReport(
  ctx: CommandContext,
  ops: SlotOps,
  body: (report: SlotsReport, workflow: WorkflowContext) => Promise<CommandResult>,
): Promise<CommandResult> {
  const session = await openSession(ctx);
  try {
    const choice = await chooseProfileByProbe(ctx, session);
    const workflow = workflowContext(session, choice.profile, choice.detection, ctx);
    const report = await ops.inspect(workflow);
    return await body(report, workflow);
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
  const flags = ctx.slotFlags ?? NO_SLOT_FLAGS;
  refuseUnattended(ctx, !flags.dryRun, 'flash');
  const fileName = basename(path);
  const bytes = await readImage(path);
  return withReport(ctx, ops, async (report, workflow) => {
    /* Refused before anything is prepared or sent: the build, the bank, the read, and the booted or
     * recovery bank without the acknowledgement. */
    refuse(flashRefusal(report, key, kind, flags.acknowledgeRisk));
    const plan = ops.prepare(
      report,
      key,
      { kind, bytes, fileName },
      { running16Hz: flags.running16Hz },
    );
    return runPlannedWrite(ctx, ops, report, workflow, {
      command: 'flash',
      plan,
      what: fileName,
      action: { kind: 'flash', input: kind, fileName },
      source: null,
      restore: null,
      json: { file: fileName },
    });
  });
}

async function copyAction(
  ctx: CommandContext,
  ops: SlotOps,
  from: SlotKey,
  to: SlotKey,
): Promise<CommandResult> {
  const flags = ctx.slotFlags ?? NO_SLOT_FLAGS;
  refuseUnattended(ctx, !flags.dryRun, 'copy');
  return withReport(ctx, ops, async (report, workflow) => {
    /* The target's own rules first, as for any decrypted image; then the source's. */
    refuse(flashRefusal(report, to, 'plain', flags.acknowledgeRisk));
    const why = copySourceRefusal(report, from);
    if (why !== null) refuse({ message: why, hint: NOTHING_SENT });
    const copy = (ops.copy ?? planSlotCopy)(report, from, to, { running16Hz: flags.running16Hz });
    return runPlannedWrite(ctx, ops, report, workflow, {
      command: 'copy',
      plan: copy.plan,
      what: `bank ${bankName(from)}'s image`,
      action: { kind: 'copy', from },
      source: copy.source,
      restore: null,
      json: { from },
    });
  });
}

async function restoreAction(
  ctx: CommandContext,
  ops: SlotOps,
  key: SlotKey,
  path: string,
): Promise<CommandResult> {
  const flags = ctx.slotFlags ?? NO_SLOT_FLAGS;
  refuseUnattended(ctx, !flags.dryRun, 'restore');
  const name = basename(path);
  const bytes = await readImage(path);
  return withReport(ctx, ops, async (report, workflow) => {
    refuse(flashRefusal(report, key, 'plain', flags.acknowledgeRisk));
    const restore = await (
      ops.restore ??
      (async (r: SlotsReport, k: SlotKey, f: { bytes: Uint8Array; name: string }) =>
        planSlotRestore(r, k, await fullFlashOf(f.bytes, f.name)))
    )(report, key, { bytes, name }, { running16Hz: flags.running16Hz });
    const backup = restore.backup;
    ctx.reporter.log(
      `${name}: ${backup.from === 'preserve-run' ? `the whole flash in a Preserve run file (${backup.entry ?? ''})` : 'a 4 MiB flash image'}, ` +
        `sha256 ${backup.sha256}; its identity block names ${backup.identity.serial ?? 'no serial'}`,
      'info',
    );
    return runPlannedWrite(ctx, ops, report, workflow, {
      command: 'restore',
      plan: restore.plan,
      what: `bank ${bankName(key)} of ${name}`,
      action: { kind: 'restore', fileName: name },
      source: restore.source,
      restore,
      json: {
        file: name,
        fullFlash: {
          from: backup.from,
          entry: backup.entry,
          sha256: backup.sha256,
          serial: backup.identity.serial,
          chipId: backup.identity.chipId,
          sameCamera: restore.sameCamera,
        },
        backupBank: {
          storedSha256: restore.storedSha256,
          version: restore.version,
          plainSha256: restore.decryption.plainSha256,
          sameAsNow: restore.sameAsNow,
        },
      },
    });
  });
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
  savedFirst: string,
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
      ['  saved first', savedFirst],
    ]),
  );
  if (bootWarning !== null) {
    lines.push('');
    for (const paragraph of bootWarning.paragraphs) {
      lines.push(paint(`  ! ${paragraph}`, 'yellow', color));
    }
  }
  lines.push('');
  lines.push(paint(`  ! ${undoLine(key)}`, 'yellow', color));
  lines.push('');
  return lines;
}

/** The way back after a patch: the decrypted file in the backup zip, written with `slots flash`. */
function undoLine(key: SlotKey): string {
  return (
    `The decrypted file in the backup zip is the way back. To undo the patch, unzip it and write it: ` +
    `seek-fw slots flash ${key} <the -decrypted file> --yes (add --acknowledge-risk ` +
    `${key === 'r' ? 'as for every write to recovery R' : `if the camera boots bank ${bankName(key)}`}).`
  );
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

/** The read-back of one patched bank, in words. */
function patchReadBackLine(result: FpsPatchResult, color: boolean): string {
  const readBack = result.readBack;
  const bank = bankName(result.key);
  if (!readBack.checked) return 'read-back: skipped (--no-verify)';
  return readBack.ok === true
    ? paint(
        `read-back: bank ${bank} differs from the saved bank only at the ` +
          `${String(result.changed.length)} planned byte(s), the sites and the sum word`,
        'green',
        color,
      )
    : paint(
        `read-back: bank ${bank} does NOT differ only as planned (unexpected ` +
          `${String(readBack.unexpected.length)}, missing ${String(readBack.missing.length)})`,
        'red',
        color,
      );
}

/** One patched bank as the JSON carries it. */
function patchResultJson(result: FpsPatchResult): Record<string, unknown> {
  return {
    bank: result.key,
    fromHz: result.fromHz,
    toHz: result.toHz,
    commitStatus: result.written.commitStatus,
    verified: result.written.verified,
    readBack: {
      checked: result.readBack.checked,
      ok: result.readBack.ok,
      differing: [...result.readBack.differing],
      missing: [...result.readBack.missing],
      unexpected: [...result.readBack.unexpected],
    },
    changedOffsets: [...result.changed],
    notes: [...result.notes],
  };
}

/**
 * The booted bank and recovery R need --acknowledge-risk, as `slots flash` does. Refused before the plan, the
 * question and the backup: core's own refusal is worded for a library caller (TESTING.md 42.86).
 */
function refusePatchRisk(
  report: SlotsReport,
  keys: readonly SlotKey[],
  write: boolean,
  acknowledgeRisk: boolean,
): void {
  if (!write || acknowledgeRisk) return;
  for (const key of keys) {
    const risk = bootRisk(report, requireView(report, key));
    if (risk !== null) {
      throw new CliError(`refusing to patch bank ${bankName(key)}: ${risk}`, {
        code: 'slots/refused',
        hint: `Pass --acknowledge-risk to patch it anyway. ${NOTHING_SENT}`,
      });
    }
  }
}

async function patchFpsAction(
  ctx: CommandContext,
  ops: SlotOps,
  key: SlotKey,
): Promise<CommandResult> {
  const flags = ctx.slotFlags ?? NO_SLOT_FLAGS;
  const write = flags.write === true;
  refuseUnattended(ctx, write, 'patch');
  const dir = backupDirOf(flags);
  return withReport(ctx, ops, async (report, workflow) => {
    const plan = ops.fpsPlan === undefined ? fpsPlanOfBank(report, key) : ops.fpsPlan(report, key);
    const view = requireView(report, key);
    if (plan.status !== 'offer') {
      throw new CliError(`bank ${bankName(key)}: ${plan.reason}`, {
        code: 'slots/refused',
        hint: NOTHING_SENT,
      });
    }
    refusePatchRisk(report, [key], write, flags.acknowledgeRisk);
    const version = report.state.version;
    /* The warning is about the bank being patched: it counts as holding the patch once written. */
    const bootWarning = fpsBootWarningOf(report, { target: key });
    const action: WriteAction = { kind: 'fps-patch' };
    ctx.reporter.write(
      fpsPlanLines(
        key,
        plan,
        view.entry.address,
        version,
        ctx.color,
        savedFirstText(report, [key], action, dir),
        bootWarning,
      ).join('\n'),
    );
    const common = {
      action: 'patch-fps',
      bank: key,
      address: hexUp(view.entry.address),
      version,
      ...fpsPlanJson(plan),
      bootWarning: bootWarning === null ? null : [...bootWarning.paragraphs],
    };

    /* The dry run stops here: the plan is the whole output and nothing is saved or sent. */
    if (!write) {
      const needs =
        bootRisk(report, view) === null || flags.acknowledgeRisk ? '' : ' --acknowledge-risk';
      ctx.reporter.log(
        `dry run: nothing was saved and nothing was written. Add --write${needs} to patch bank ${bankName(key)}.`,
        'info',
      );
      return {
        ...common,
        backup: { directory: dir, fileName: backupFileNameShown(report, [key], action) },
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

    const saved: { path: string | null } = { path: null };
    const patchOptions: FpsPatchOptions = {
      acknowledgeRisk: flags.acknowledgeRisk,
      verify: flags.verify,
      saveBackup: saveBackupInto(dir, ctx.reporter, (path) => {
        saved.path = path;
      }),
      ...(ctx.io.now === undefined ? {} : { now: () => ctx.io.now?.() ?? new Date() }),
    };
    const patchWorkflow = { ...workflow, reporter: loud(ctx.reporter) };
    const result =
      ops.patchFps === undefined
        ? await patchBankFps(patchWorkflow, report, key, patchOptions)
        : await ops.patchFps(patchWorkflow, report, key, patchOptions);
    ctx.reporter.write(
      [
        `commit status: ${hexUp(result.written.commitStatus, 4)}`,
        patchReadBackLine(result, ctx.color),
        REPLUG_LINE_PATCH,
      ].join('\n'),
    );
    if (result.readBack.ok === false || result.written.verified === false) {
      throw new CliError(
        `the read-back of bank ${bankName(key)} does not match the patched image as planned`,
        {
          code: 'slots/verify-failed',
          hint:
            `The backup is ${saved.path ?? result.backup.fileName}. Run \`seek-fw slots list\` once the ` +
            'camera is back. Do not rely on the bank until a read matches.',
        },
      );
    }
    const one = patchResultJson(result);
    return {
      ...common,
      written: true,
      dryRun: false,
      backup: { directory: dir, ...backupJson(result.backup, saved.path) },
      commitStatus: one.commitStatus,
      verified: one.verified,
      readBack: one.readBack,
      changedOffsets: one.changedOffsets,
      notes: one.notes,
    };
  });
}

/** The every-bank plan as a person reads it: each bank, the order, the banks left, what is saved first. */
export function fpsEveryPlanLines(
  report: SlotsReport,
  plan: FpsEveryBankPlan,
  color: boolean,
  savedFirst: string,
): string[] {
  const lines: string[] = ['', heading('Frame-rate patch plan, every bank', color)];
  const role = (key: SlotKey): string => {
    const view = findView(report, key);
    if (view?.active === true) return '; the bank the camera boots now';
    if (key === 'r') return '; the recovery bank';
    return '';
  };
  lines.push(
    table([
      ...plan.offers.map((offer) => [
        `  ${bankName(offer.key)}`,
        `${hexUp(findView(report, offer.key)?.entry.address ?? 0)}: firmware ${report.state.version ?? offer.plan.patch.version}, ` +
          `${String(offer.plan.fromHz)} Hz -> ${String(offer.plan.toHz)} Hz, ` +
          `${String(offer.plan.sites.length)} byte(s) and the sum word${role(offer.key)}`,
      ]),
      [
        '  order',
        plan.order.map(bankName).join(', then ') +
          (everyBankBootedLast(report, plan.order) ? ' (the bank the camera boots now last)' : ''),
      ],
      ...plan.others.map((other) => [
        `  ${bankName(other.key)}`,
        `left as it is: ${'reason' in other.plan ? other.plan.reason : 'no offer'}`,
      ]),
      ['  saved first', savedFirst],
    ]),
  );
  lines.push(
    '',
    paint(
      '  ! Each bank is read back before the next is written; the first failure stops the rest.',
      'yellow',
      color,
    ),
  );
  lines.push(
    paint(
      '  ! The decrypted files in the backup zip are the way back. To undo the patch of a bank, unzip its file ' +
        'and write it: seek-fw slots flash <bank> <the -decrypted file> --yes (add --acknowledge-risk for ' +
        'the bank the camera boots and for recovery R).',
      'yellow',
      color,
    ),
  );
  lines.push('');
  return lines;
}

/** `slots patch-fps all`: every bank that offers the patch, in one confirmation (core `patchEveryBankFps`). */
async function patchEveryAction(ctx: CommandContext, ops: SlotOps): Promise<CommandResult> {
  const flags = ctx.slotFlags ?? NO_SLOT_FLAGS;
  const write = flags.write === true;
  refuseUnattended(ctx, write, 'patch');
  const dir = backupDirOf(flags);
  return withReport(ctx, ops, async (report, workflow) => {
    const plan = fpsEveryBankPlan(report, (r, k) =>
      ops.fpsPlan === undefined ? fpsPlanOfBank(r, k) : ops.fpsPlan(r, k),
    );
    if (plan.order.length === 0) {
      throw new CliError(
        `no bank offers the frame-rate patch (${plan.others
          .map(
            (other) =>
              `${bankName(other.key)}: ${'reason' in other.plan ? other.plan.reason : 'no offer'}`,
          )
          .join('; ')})`,
        { code: 'slots/refused', hint: NOTHING_SENT },
      );
    }
    refusePatchRisk(report, plan.order, write, flags.acknowledgeRisk);
    const action: WriteAction = { kind: 'fps-patch-every-bank' };
    ctx.reporter.write(
      fpsEveryPlanLines(
        report,
        plan,
        ctx.color,
        savedFirstText(report, plan.order, action, dir),
      ).join('\n'),
    );
    const common = {
      action: 'patch-fps',
      bank: 'all',
      version: report.state.version,
      order: [...plan.order],
      banks: plan.offers.map((offer) => ({ bank: offer.key, ...fpsPlanJson(offer.plan) })),
      others: plan.others.map((other) => ({ bank: other.key, ...fpsPlanJson(other.plan) })),
    };

    if (!write) {
      const needs =
        flags.acknowledgeRisk ||
        plan.order.every((key) => bootRisk(report, requireView(report, key)) === null)
          ? ''
          : ' --acknowledge-risk';
      ctx.reporter.log(
        `dry run: nothing was saved and nothing was written. Add --write${needs} to patch every bank that offers it.`,
        'info',
      );
      return {
        ...common,
        backup: { directory: dir, fileName: backupFileNameShown(report, plan.order, action) },
        written: false,
        dryRun: true,
        results: [],
        stopped: null,
        unwritten: [...plan.order],
      };
    }

    if (!ctx.options.yes) {
      const product = report.state.description.productName ?? 'this camera';
      const serial = report.state.serial === null ? '' : ` (${report.state.serial})`;
      const confirmed = await ctx.io.confirm(
        `Patch ${plan.order.map((key) => `bank ${bankName(key)}`).join(', then ')} on ${product}${serial}? ` +
          'The banks are saved first, in one zip. [y/N] ',
      );
      if (!confirmed) {
        throw new CliError('aborted at the confirmation prompt — nothing was written', {
          code: 'slots/refused',
        });
      }
    } else {
      ctx.reporter.log('--yes given: skipping the confirmation', 'warn');
    }

    const saved: { path: string | null } = { path: null };
    const options: FpsPatchOptions = {
      acknowledgeRisk: flags.acknowledgeRisk,
      verify: flags.verify,
      saveBackup: saveBackupInto(dir, ctx.reporter, (path) => {
        saved.path = path;
      }),
      ...(ctx.io.now === undefined ? {} : { now: () => ctx.io.now?.() ?? new Date() }),
    };
    const everyWorkflow = { ...workflow, reporter: loud(ctx.reporter) };
    const done =
      ops.patchEveryFps === undefined
        ? await patchEveryBankFps(everyWorkflow, report, options)
        : await ops.patchEveryFps(everyWorkflow, report, options);
    const lines: string[] = [];
    for (const one of done.results) {
      lines.push(
        `bank ${bankName(one.key)}: commit status ${hexUp(one.written.commitStatus, 4)}`,
        patchReadBackLine(one, ctx.color),
      );
    }
    if (done.stopped !== null)
      lines.push(paint(`stopped: ${done.stopped.reason}`, 'red', ctx.color));
    if (done.unwritten.length > 0) {
      lines.push(`not written: ${done.unwritten.map((key) => `bank ${bankName(key)}`).join(', ')}`);
    }
    lines.push(REPLUG_LINE_PATCH);
    ctx.reporter.write(lines.join('\n'));
    const failed =
      done.stopped !== null ||
      done.results.some((one) => one.readBack.ok === false || one.written.verified === false);
    if (failed) {
      throw new CliError(
        done.stopped === null
          ? 'a patched bank does not read back as planned'
          : `stopped at bank ${bankName(done.stopped.key)}: ${done.stopped.reason}`,
        {
          code: 'slots/verify-failed',
          hint:
            `The backup is ${saved.path ?? done.backup.fileName}. Run \`seek-fw slots list\` once the ` +
            'camera is back. Do not rely on a bank until a read matches.',
        },
      );
    }
    return {
      ...common,
      written: true,
      dryRun: false,
      backup: { directory: dir, ...backupJson(done.backup, saved.path) },
      results: done.results.map(patchResultJson),
      stopped: done.stopped,
      unwritten: [...done.unwritten],
    };
  });
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
      case 'copy':
        return copyAction(ctx, ops, request.from, request.to);
      case 'restore':
        return restoreAction(ctx, ops, request.key, request.file);
      case 'patch-fps':
        return request.key === 'all'
          ? patchEveryAction(ctx, ops)
          : patchFpsAction(ctx, ops, request.key);
    }
  };
}

export const slotsCommand: Command = slotsCommandWith(CORE_SLOT_OPS);
