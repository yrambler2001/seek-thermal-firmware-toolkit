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
 *   - a bank whose read failed is refused, because nothing may be written on the strength of it;
 *   - the bank the camera boots now, and the recovery bank R, are refused unless the person says
 *     --acknowledge-risk. A camera that reports NO booted bank is treated the same way: the bank
 *     might be the one it boots, and the refusal says so;
 *   - the plan is printed and the person is asked, unless --yes; without a terminal and without
 *     --yes there is nobody to ask, so the command refuses.
 *
 * And after the write, a read-back that does not match is a failed run with a non-zero exit, not a
 * line of text that a script would walk past.
 *
 * The core calls sit behind `SlotOps`. The default is core itself; the offline tests pass fakes, so
 * every refusal and every rendered plan is exercised without a camera.
 */

import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import {
  dumpSlot,
  findEmbeddedKeyTable,
  flashSlot,
  hexUp,
  inspectSlots,
  keyFilenameSuffix,
  prepareSlotFlash,
  sha256hex,
  withLevelMap,
  type Artifact,
  type DumpedSlot,
  type FlashSlotOptions,
  type FlashSlotResult,
  type Reporter,
  type SlotFlashInput,
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

/** The four core calls this command makes. The defaults are core's own functions. */
export interface SlotOps {
  inspect(ctx: WorkflowContext): Promise<SlotsReport>;
  dump(ctx: WorkflowContext, report: SlotsReport, key: SlotKey): Promise<DumpedSlot>;
  prepare(report: SlotsReport, key: SlotKey, input: SlotFlashInput): SlotFlashPlan;
  flash(
    ctx: WorkflowContext,
    report: SlotsReport,
    plan: SlotFlashPlan,
    options: FlashSlotOptions,
  ): Promise<FlashSlotResult>;
}

export const CORE_SLOT_OPS: SlotOps = {
  inspect: inspectSlots,
  dump: dumpSlot,
  prepare: prepareSlotFlash,
  flash: flashSlot,
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
    };

/** The flags a command without `slots` never sees: all three default to "not asked for". */
const NO_SLOT_FLAGS: SlotFlags = {
  raw: false,
  acknowledgeRisk: false,
  verify: true,
  dryRun: false,
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
 * `--raw`, `--acknowledge-risk` and `--no-verify` mean something only to a flash. Accepting
 * them on `list` or `dump` would look like they did something, so they are refused there.
 */
function refuseFlashOnlyFlags(flags: SlotFlags, subcommand: string): void {
  const given: string[] = [];
  if (flags.raw) given.push('--raw');
  if (flags.acknowledgeRisk) given.push('--acknowledge-risk');
  if (!flags.verify) given.push('--no-verify');
  if (flags.dryRun) given.push('--dry-run');
  if (given.length > 0) {
    const verb = given.length === 1 ? 'applies' : 'apply';
    throw new UsageError(
      `${given.join(', ')} ${verb} only to 'slots flash'`,
      `'slots ${subcommand}' does not use them.`,
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
    refuseFlashOnlyFlags(flags, 'list');
    return { action: 'list' };
  }
  if (action === 'dump') {
    const [bank, ...extra] = rest;
    if (bank === undefined) throw new UsageError('slots dump needs a bank: a, b or r');
    if (extra.length > 0) throw unexpected(extra, 'slots dump');
    refuseFlashOnlyFlags(flags, 'dump');
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
    return { action: 'flash', key, file, kind: flags.raw ? 'raw' : 'plain' };
  }
  throw new UsageError(`unknown slots subcommand '${action}'`, 'Use one of: list, dump, flash.');
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
  if (view.unreadReason !== null) {
    return {
      message: `bank ${bank} was not read (${view.unreadReason}); nothing is written on the strength of a read that failed`,
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

function bootableText(view: SlotView): string {
  const state = view.state;
  if (state === null) return '-';
  if (state.bootability === 'unknown') return 'unknown';
  return state.bootable ? 'yes' : 'no';
}

function slotRow(view: SlotView): string[] {
  const state = view.state;
  const header = state?.header ?? null;
  const sha256 = state?.sha256 ?? null;
  return [
    bankName(view.entry.key),
    hexUp(view.entry.address),
    view.active ? 'yes' : 'no',
    versionOf(view) ?? '-',
    header === null ? '-' : `${String(header.length)} B`,
    state?.keyName ?? '-',
    bootableText(view),
    sha256 === null ? '-' : sha256.slice(0, 16),
  ];
}

/** The `slots list` report: the camera, its banks, what each bank can take, and why not. */
export function listLines(report: SlotsReport, color: boolean): string[] {
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

  lines.push('', heading('Operations', color));
  const operationRows: string[][] = [];
  for (const view of report.slots) {
    operationRows.push([`  ${bankName(view.entry.key)}`, 'dump', opText(view.entry.dump)]);
    operationRows.push(['', 'flash decrypted image', opText(view.entry.flashPlain)]);
    operationRows.push(['', 'flash raw bytes', opText(view.entry.flashRaw)]);
  }
  lines.push(table(operationRows));

  const notes: string[] = [...report.plan.notes];
  for (const view of report.slots) {
    const bank = bankName(view.entry.key);
    for (const note of view.entry.notes) notes.push(`${bank}: ${note}`);
    if (view.unreadReason !== null) notes.push(`${bank}: not read — ${view.unreadReason}`);
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
  return {
    action: 'list',
    product: report.state.description.productName,
    serial: report.state.serial,
    firmware: report.plan.firmwareVersion,
    profile: report.plan.profileId,
    build: report.plan.supportedBuild,
    notes: [...report.plan.notes],
    slots: report.slots.map(slotJson),
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
  const kind =
    plan.kind === 'plain'
      ? 'decrypted image, encrypted for this bank on the way in'
      : 'raw bytes, sent verbatim';
  const chunks = Math.ceil(plan.payload.length / 64);

  lines.push(heading('Slot flash plan', color));
  lines.push(
    table([
      ['  bank', `${bankName(plan.key)} (${hexUp(plan.address)})`],
      ['  image', `${fileName} — ${kind}`],
      ['  staging', plan.staging],
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
  lines.push('');
  return lines;
}

/** The yes/no question. It says which bank, and whether the camera boots it now. */
export function flashQuestion(report: SlotsReport, plan: SlotFlashPlan, fileName: string): string {
  const view = findView(report, plan.key);
  const booted = view?.active === true ? ' (the bank the camera boots now)' : '';
  const product = report.state.description.productName ?? 'this camera';
  const serial = plan.serial === null ? '' : ` (${plan.serial})`;
  return `Write ${fileName} to bank ${bankName(plan.key)}${booted} on ${product}${serial}? [y/N] `;
}

/** What the read-back said, and what the person does next. */
export function readBackLines(
  result: FlashSlotResult,
  afterSha256: string | null,
  color: boolean,
): string[] {
  const bank = bankName(result.key);
  const sha = afterSha256 === null ? '' : ` (sha256 ${afterSha256})`;
  const lines: string[] = [`commit status: ${hexUp(result.commitStatus, 4)}`];
  if (result.verified === true) {
    lines.push(
      paint(`read-back: bank ${bank} holds exactly the staged bytes${sha}`, 'green', color),
    );
  } else if (result.verified === false) {
    lines.push(paint(`read-back: bank ${bank} DIFFERS from the staged bytes${sha}`, 'red', color));
  } else {
    lines.push('read-back: skipped (--no-verify)');
  }
  lines.push(
    'Unplug the camera and plug it back in. A bank is only used when the camera boots, so the ' +
      'new image runs after the next start.',
  );
  return lines;
}

/* ==================================================================== *
 * Dump: the file names and the report
 * ==================================================================== */

/** A version that is safe inside a file name, or "unknown" when nothing was read. */
export function safeVersion(version: string | null): string {
  return version === null || version === '' ? 'unknown' : version.replace(/[^A-Za-z0-9._-]/g, '_');
}

/**
 * `slot-<key>-<version>-<sha8>.bin` for the bank as stored, and the same stem with
 * `-decrypted.bin` when a key recovered and the image decrypts. The eight-digit tag is the first
 * eight hex digits of the stored bank's own SHA-256, so the two files of one read share it.
 *
 * THE KEY PAIR IN THE NAME. A decrypted file is named with the pair its image holds, the way
 * `decrypt` names its files: `slots flash` retargets an image from the pair its file name carries
 * and refuses a name without one (write-image.ts, retargetImageKeys). So when the image holds this
 * camera's own pair, the suffix is added; when it holds neither, the name stays bare and the flash
 * refuses the file for the reason that is true.
 */
export function dumpArtifacts(
  version: string | null,
  dumped: DumpedSlot,
  keys: { readonly keyA: Uint8Array; readonly keyB: Uint8Array } | null = null,
): Artifact[] {
  const stem = `slot-${dumped.key}-${safeVersion(version)}-${dumped.sha256.slice(0, 8)}`;
  const artifacts: Artifact[] = [{ name: `${stem}.bin`, data: dumped.raw }];
  if (dumped.plain !== null) {
    const suffix =
      keys !== null && findEmbeddedKeyTable(dumped.plain, keys.keyA, keys.keyB) !== null
        ? keyFilenameSuffix(keys.keyA, keys.keyB)
        : '';
    artifacts.push({ name: `${stem}-decrypted${suffix}.bin`, data: dumped.plain });
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
        `bank ${bankName(key)}: stored image sha256 ${dumped.sha256}` +
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

    const plan = ops.prepare(report, key, { kind, bytes, fileName });
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
        expectedSha256,
        notes: [],
        warnings: [...plan.warnings],
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
          'Unplug and replug the camera, then run `seek-fw slots list`. Do not rely on ' +
          `bank ${bankName(key)} until a read matches.`,
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
      expectedSha256,
      storedSha256,
      notes: [...result.notes],
      warnings: [...plan.warnings],
      written: true,
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
    }
  };
}

export const slotsCommand: Command = slotsCommandWith(CORE_SLOT_OPS);
