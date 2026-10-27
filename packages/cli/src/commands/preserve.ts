/**
 * `seek-fw preserve` — the full-flash preservation pipeline for the v1
 * locked line (Compact 1.0.0.0 / 1.2.0.0 / 1.3.0.0 and the other builds the
 * patch table covers), run as SIX RESUMABLE STEPS with a checkpoint written
 * after every one.
 *
 * THE HONEST RISK, STATED WHERE THE OPERATOR IS. The commit and restore steps
 * write boot banks over the wire: by default the bank the next start enters,
 * or the banks `--bank` names. A bank whose write is interrupted fails the
 * bootloader's check, and a start then falls to the next bank of the boot
 * word's order; a power loss mid-commit can still need an SPI programmer. The
 * stepwise shape is the CLI's share of the mitigation, and it exists for one
 * measured reason: the old write-at-the-end flow reached disk only after the
 * whole run, so a crash after the commit lost the restore source with the
 * process. Now the backup — and the standard dump archive built from it, the
 * pre-flash dump of every region the stock plan can read — is on disk BEFORE
 * anything write-shaped can possibly run, and every later step checkpoints
 * behind it.
 *
 * WHICH BANKS. The backup reads every bank twice and says which bank the next
 * start enters, and why (the boot-config word, the bank the camera reports it
 * entered, each bank's check). The plan prints that before the first write;
 * `--bank` chooses: next-start (the default), a, b, r, or all. A choice that
 * leaves out the bank the next start enters is warned about and still runs;
 * a bank the run cannot write is refused with the reason.
 *
 * THE IMAGE IS THE CAMERA'S OWN. There is no image argument anywhere: the
 * backup step reads each bank TWICE, requires the two reads to agree byte for
 * byte, derives its factory plaintext (identity on the 2014 plain chain; the
 * build family's keystream solver on a cipher family), and gates the derived
 * image before anything is trusted. The derived images are run artifacts, so
 * `--resume` never needs any external file.
 *
 * The commands:
 *
 *   seek-fw preserve [--out dir] [--bank b] a full run; checkpoint after every
 *                                          step (preserve_run.json + files)
 *   seek-fw preserve --resume <dir> [--bank b]  continue from state.nextStep;
 *                                          --bank chooses again before the
 *                                          commit has run
 *   seek-fw preserve --resume <dir> --from-step <id>  start at a chosen step
 *   seek-fw preserve --print-state <dir>   the run state, next step, and
 *                                          whether the checkpoint files
 *                                          still match what was recorded
 *
 * The steps refuse to run on a torn run directory (a gate per step, in core),
 * the commit step reads every chosen bank back before it writes any (a commit
 * that already landed is never replayed), and a Ctrl-C leaves the previous
 * checkpoint standing — the interrupted step is simply re-run on the next
 * --resume.
 */

import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  BANK_KEYS,
  CancelledError,
  PRESERVE_STEP_IDS,
  PRESERVE_RUN_STATE_FILE,
  SeekError,
  bankChoiceWords,
  bankListWords,
  bankRecordWords,
  bankWordsOf,
  choosePreserveBanks,
  createPreserveRun,
  hexUp,
  isPreserveStepId,
  lastStartWords,
  nextStartWords,
  preserveChoiceOf,
  preserveChoicesOf,
  recordStepFailure,
  runPreserveStep,
  type Artifact,
  type PreserveArtifactLoader,
  type PreserveRunState,
  type PreserveStepId,
  type SessionOpener,
  PRESERVE_UNPATCHED_START_NEXT,
  preserveDoneWords,
  preserveBuildWords,
  preserveStepResultWords,
  preserveStepLabel,
  preserveStoppedForRestore,
  patchSiteWords,
  stagedFormWords,
  restoreFormWords,
  drainCapabilityWords,
  unpatchedStartOf,
} from '@seek-fw/core';
import type { CommandContext, CommandResult } from '../cli.js';
import { CliError, describeError, markSaid } from '../errors.js';
import {
  artifactInventory,
  loadRunState,
  runStatePath,
  saveRunState,
  writeRunArtifact,
} from '../preserve-store.js';
import { resolveArtifactPath, writeOutputs, type WrittenOutput } from '../output.js';
import { openSession, type Session } from './shared.js';

/** The artifacts land here when --out is not given. */
const DEFAULT_OUT = 'preserve-run';

/** The banks a list names, as a sentence fragment ("slot A and recovery R"). */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** The failure shapes that mean the camera's window reader is spent for this
 *  boot (TESTING.md secs. 23.3, 28.4 and the 2026-10-02 incident): a read
 *  that stalls — at offset 0 most of all — or a capture that comes back
 *  blank or as stale descriptor bytes. The core refusals for those shapes
 *  carry these words; a raw wire stall carries "stall"/"did not answer". */
const SPENT_READER_FAILURE =
  /stall|did not answer|stopped at offset 0|spent reader|all-blank read|0xFF-fill|stale reader descriptor/i;

/**
 * The power-cycle acknowledgement a failed backup must pass before it re-runs
 * (core's retry gate): the instruction prints, and --yes or a fresh terminal
 * confirmation must assert the camera actually was power-cycled — core cannot
 * observe one, so the assertion is the front end's.
 */
async function requirePowerCycleAcknowledgement(
  ctx: CommandContext,
  runDir: string,
): Promise<boolean> {
  ctx.reporter.log(
    'the previous backup attempt failed — power-cycle the camera first (unplug and replug ' +
      'it, or use its power switch): a retry against the same boot can serve stale or blank ' +
      'window bytes',
    'warn',
  );
  if (ctx.options.yes) {
    ctx.reporter.log('--yes given: asserting the camera was power-cycled', 'warn');
    return true;
  }
  if (!ctx.io.stdinIsTty) {
    throw new CliError(
      'refusing to re-run the backup after a failure without the power-cycle confirmation: ' +
        'stdin is not a terminal, so there is nobody to ask',
      {
        code: 'flash/refused',
        hint:
          'Power-cycle the camera (unplug and replug it, or use its power switch), then ' +
          're-run with --yes to assert it was power-cycled.',
      },
    );
  }
  const confirmed = await ctx.io.confirm(
    'Have you power-cycled the camera since that failed backup (unplug and replug it, or ' +
      'use its power switch)? [y/N] ',
  );
  if (!confirmed) {
    throw new CliError(
      'aborted at the power-cycle prompt — nothing was re-read; power-cycle the camera and ' +
        `re-run \`preserve --resume ${runDir}\``,
      { code: 'flash/refused' },
    );
  }
  return true;
}

/** A cancelled run is an interrupt (exit 130, previous checkpoint stands), not
 *  a failed step — both shapes the run can arrive in are recognised here. */
function isCancellation(error: unknown): boolean {
  return (
    error instanceof CancelledError || (error instanceof CliError && error.code === 'cancelled')
  );
}

async function readImageOrNull(path: string): Promise<Uint8Array | null> {
  try {
    const buffer = await readFile(path);
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } catch {
    return null;
  }
}

export async function preserveCommand(ctx: CommandContext): Promise<CommandResult> {
  if (ctx.options.printState !== null) {
    if (ctx.options.backupOnly || ctx.options.zip !== null || ctx.options.bank !== null) {
      throw new CliError(
        '--print-state touches no camera and writes no run, so it takes neither --backup-only, ' +
          '--zip nor --bank',
        { code: 'cli/usage' },
      );
    }
    return printStateCommand(ctx, resolve(ctx.options.printState));
  }

  if (
    ctx.options.backupOnly &&
    ctx.options.fromStep !== null &&
    ctx.options.fromStep !== 'backup'
  ) {
    throw new CliError(
      `--backup-only runs the first step only; --from-step ${ctx.options.fromStep} names a later one`,
      { code: 'cli/usage' },
    );
  }

  if (ctx.options.resume !== null && ctx.options.out !== null) {
    throw new CliError(
      `--resume names the run directory (${ctx.options.resume}) and --out would move it — ` +
        'pass one, not both',
      { code: 'cli/usage' },
    );
  }
  if (ctx.options.fromStep !== null && ctx.options.resume === null) {
    throw new CliError('--from-step needs --resume <dir>: it starts inside an existing run', {
      code: 'cli/usage',
      hint: 'Run `seek-fw preserve --print-state <dir>` first to see where that run stands.',
    });
  }

  return ctx.options.resume !== null
    ? resumeCommand(ctx, resolve(ctx.options.resume))
    : freshCommand(ctx, resolve(ctx.options.out ?? DEFAULT_OUT));
}

/* ==================================================================== *
 * a fresh run
 * ==================================================================== */

async function freshCommand(ctx: CommandContext, outDir: string): Promise<CommandResult> {
  /* Nobody to ask: same rule as flash, checked before the camera opens. */
  if (!ctx.options.yes && !ctx.io.stdinIsTty) {
    throw new CliError(
      'refusing to run the preservation pipeline without confirmation: stdin is not a ' +
        'terminal, so there is nobody to ask',
      {
        code: 'flash/refused',
        hint:
          'This pipeline WRITES boot banks (the commit and restore steps). Pass --yes to ' +
          'confirm non-interactively after reading the plan on a terminal.',
      },
    );
  }

  /* The run is created empty and self-sources: the backup step reads every
   * bank and records which the next start enters. The detailed plan prints
   * the moment it exists — after the patch step, before anything
   * write-shaped runs — and an interactive run confirms again there. */
  const choice = ctx.options.bank ?? 'next-start';
  const created = await createPreserveRun({
    banks: choice,
    /* The global --chunk, where the drain step is given one; the default
     * (READ_CHUNK, 64) is the ask measured exact on silicon (TESTING.md
     * sec. 28.3). */
    ...(ctx.options.chunk === null ? {} : { drainChunk: ctx.options.chunk }),
  });

  const say = (text: string): void => {
    ctx.reporter.write(text);
  };

  say('');
  say('preserve plan — self-sourced from the camera');
  say('  image source       read from each bank of the camera, two agreeing reads per bank');
  say(`  banks to write     ${bankChoiceWords(choice)} (--bank ${choice}); the backup reads every`);
  say('                     bank first, and the plan then says which bank the next start');
  say('                     enters and why, before anything is written');
  say('  build              detected from the derived images after the backup step; the');
  say('                     full plan (banks, patch sites, restore, drain) prints then');
  say('  steps              backup -> patch -> commit -> drain -> restore -> verify');
  say('  run directory      each step checkpoints there; the backup (and the standard dump');
  say('                     archive built from it) is on disk BEFORE anything is written');
  say('  RISK               commit and restore write BOOT banks. On hardware an interrupted');
  say('                     write there can need an SPI programmer to undo.');
  say(`  interrupted?       seek-fw preserve --resume ${outDir}`);
  if (ctx.options.backupOnly) {
    say('  stop after         the backup: read-only, nothing is written to the camera');
  }
  say('');

  if (!ctx.options.yes) {
    const confirmed = await ctx.io.confirm(
      ctx.options.backupOnly
        ? 'Back this camera up (read-only)? Nothing is written to the camera. [y/N] '
        : 'Back this camera up (read-only), derive the patch from its own flash, and show the ' +
            'plan before anything is written? The commit afterwards WILL write boot banks. [y/N] ',
    );
    if (!confirmed) {
      throw new CliError('aborted at the confirmation prompt — nothing was written', {
        code: 'flash/refused',
      });
    }
  } else {
    ctx.reporter.log('--yes given: skipping the confirmation', 'warn');
  }

  if (await stateExists(outDir)) {
    throw new CliError(
      `${outDir} already holds a ${PRESERVE_RUN_STATE_FILE} — refusing to overwrite a run. ` +
        `Resume it with --resume ${outDir}, or pass --out with a fresh directory.`,
      { code: 'preserve/state' },
    );
  }

  /* The initial checkpoint lands BEFORE the first step: a crash during the
   * backup itself still leaves a resumable run. */
  await saveRunState(outDir, created.state);
  const finalState = await runSteps(ctx, outDir, created.state, {
    onPlanReady: (state) => confirmDerivedPlan(ctx, outDir, state),
    ...(ctx.options.backupOnly ? { stopAfter: 'backup' as const } : {}),
  });

  return finishRun(ctx, outDir, finalState);
}

/** The boot lines and the banks table of a plan or a printed state: the word,
 *  the bank the camera entered, the next start and why, and each bank. */
function bootAndBankLines(state: PreserveRunState): string[] {
  const boot = state.boot;
  const banks = state.banks;
  if (boot === undefined || banks === undefined) return [];
  const lines = [
    `  boot-config word   ${hexUp(boot.word)} — ${boot.rule}`,
    `  last start         ${lastStartWords(boot)}`,
    `  next start         ${nextStartWords(boot)}`,
    '  banks',
  ];
  for (const key of BANK_KEYS) {
    const bank = banks[key];
    lines.push(`    ${key.toUpperCase()}  ${hexUp(bank.address, 8)}  ${bankRecordWords(bank)}`);
  }
  return lines;
}

/** The choices and the banks the run writes, with the choice's warnings. */
function choiceLines(state: PreserveRunState, runDir: string): string[] {
  const lines = ['  choices (--bank)'];
  for (const verdict of preserveChoicesOf(state)) {
    lines.push(
      `    ${verdict.choice.padEnd(10)} ${
        verdict.banks === null ? `not offered — ${verdict.what}` : verdict.what
      }`,
    );
  }
  const chosen = preserveChoiceOf(state, state.choice);
  lines.push(
    state.targets === undefined
      ? `  banks to write     none — ${chosen.what}`
      : `  banks to write     ${bankListWords(state.targets)} (--bank ${state.choice})`,
  );
  lines.push(
    `                     another choice: seek-fw preserve --resume ${runDir} --bank <choice>`,
  );
  for (const warning of state.targets === undefined ? [] : chosen.warnings) {
    lines.push(`  ! ${warning}`);
  }
  return lines;
}

/** The detailed plan, printed from the state the backup and patch steps
 *  recorded — the first moment the build's facts exist. An interactive run
 *  confirms here, at the last gate before the first write; --yes just prints.
 *  A choice the run cannot resolve stops here, before anything is written. */
async function confirmDerivedPlan(
  ctx: CommandContext,
  outDir: string,
  state: PreserveRunState,
): Promise<void> {
  const say = (text: string): void => {
    ctx.reporter.write(text);
  };
  const targets = state.targets;
  const first = targets?.[0];
  const patch = first === undefined ? undefined : state.banks?.[first].patch;

  say('');
  say(`preserve plan — derived from the camera (run ${state.runId})`);
  say(`  build              ${preserveBuildWords(state)}`);
  say(`  image version      ${state.expectedVersion ?? '?'}`);
  for (const line of bootAndBankLines(state)) say(line);
  for (const line of choiceLines(state, outDir)) say(line);
  for (const key of targets ?? []) {
    const bank = state.banks?.[key];
    const edit = bank?.imageDerivation;
    if (edit !== undefined) {
      say(`  image edit         ${bankWordsOf(key)}: ${edit.label}`);
      say(
        `                     on the factory image; its balance ${hexUp(edit.balanceWord)} is in the`,
      );
      say('                     adjust word, the patch balances on top of it, and the restore');
      say('                     puts the image back with the edit');
    }
  }
  if (patch !== undefined) {
    say(`  patch sites        ${String(patch.sites.length)} changed instruction(s)`);
    for (const site of patch.sites) say(`    ${hexUp(site.offset)}  ${patchSiteWords(site.name)}`);
  }
  for (const key of targets ?? []) {
    const bank = state.banks?.[key];
    if (bank?.patch === undefined) continue;
    const edit = bank.imageDerivation;
    say(
      `  rebalance word     ${bankWordsOf(key)}: ${hexUp(bank.patch.rebalanceWord)} at 0x00000238` +
        (edit === undefined ? '' : ` (was ${hexUp(edit.balanceWord)}, the edit's balance)`),
    );
    say(
      `  bytes that change  ${bankWordsOf(key)}: ${String(bank.patch.diffCount)}, all inside that bank`,
    );
  }
  if (state.stagedForm !== undefined)
    say(`  written            ${stagedFormWords(state.stagedForm)}`);
  if (state.routeNote !== null && state.routeNote !== undefined) {
    say(`  where it goes      ${state.routeNote}`);
  }
  if (state.restoreForm !== undefined)
    say(`  restore            ${restoreFormWords(state.restoreForm)}`);
  if (state.capability !== undefined)
    say(`  whole-flash read   ${drainCapabilityWords(state.capability)}`);
  if (targets !== undefined)
    say(`  next write         the commit step, into ${bankListWords(targets)}`);
  say(`  run directory      ${outDir}`);
  say('');

  if (targets === undefined) {
    throw new CliError(
      `no banks to write: ${preserveChoiceOf(state, state.choice).what} — nothing was written; ` +
        `the backup and the derived plan are checkpointed in ${outDir}`,
      {
        code: 'flash/refused',
        hint: `Choose the banks: seek-fw preserve --resume ${outDir} --bank <a|b|r|all>`,
      },
    );
  }
  if (ctx.options.yes) return;
  const confirmed = await ctx.io.confirm(
    `Proceed to the commit — the first write, into ${bankListWords(targets)} of this camera ` +
      `(${state.expectedVersion ?? '?'})? [y/N] `,
  );
  if (!confirmed) {
    throw new CliError(
      'aborted at the plan prompt — nothing was written; the backup and the derived plan are ' +
        `checkpointed in ${outDir} (resume with --resume ${outDir}, choose other banks with ` +
        '--bank, or delete the directory)',
      { code: 'flash/refused' },
    );
  }
}

/* ==================================================================== *
 * resuming a run
 * ==================================================================== */

async function resumeCommand(ctx: CommandContext, runDir: string): Promise<CommandResult> {
  if (!ctx.options.yes && !ctx.io.stdinIsTty) {
    throw new CliError(
      'refusing to resume a preservation run without confirmation: stdin is not a terminal, ' +
        'so there is nobody to ask',
      {
        code: 'flash/refused',
        hint:
          'Resuming can WRITE boot banks (the commit and restore steps). Pass --yes to ' +
          'confirm non-interactively.',
      },
    );
  }

  /* The flag is validated before the run directory is even read: a typo in
   * --from-step is a usage error, not a missing-file error. */
  let fromStep: PreserveStepId | null = null;
  if (ctx.options.fromStep !== null) {
    if (!isPreserveStepId(ctx.options.fromStep)) {
      throw new CliError(
        `--from-step '${ctx.options.fromStep}' is not a step; the steps are ` +
          PRESERVE_STEP_IDS.join(', '),
        { code: 'cli/usage' },
      );
    }
    fromStep = ctx.options.fromStep;
  }

  /* No image is passed and none is needed: the run directory carries the
   * derived factory plaintexts (the backup step wrote them there), and the
   * steps refuse with the remedy when a checkpoint file is missing. */
  let state = await loadRunState(runDir);

  /* A NEW CHOICE OF BANKS, before the commit has run: core refuses it once
   * the commit has run or been tried (a finished run included), and refuses a
   * bank the run cannot write, each with the reason. Saved before anything
   * else runs. */
  if (ctx.options.bank !== null && state.steps.backup?.status === 'done') {
    try {
      state = choosePreserveBanks(state, ctx.options.bank);
    } catch (error) {
      if (error instanceof SeekError) {
        throw new CliError(`--bank ${ctx.options.bank}: ${error.message}`, {
          code: 'flash/refused',
        });
      }
      throw error;
    }
    await saveRunState(runDir, state);
    ctx.reporter.log(
      `banks to write: ${bankListWords(state.targets ?? [])} (--bank ${state.choice})`,
      'info',
    );
  } else if (ctx.options.bank !== null) {
    /* No backup yet: the choice is recorded and resolved when the backup reads the banks. */
    state = { ...state, choice: ctx.options.bank };
    await saveRunState(runDir, state);
  }

  const nextStep = state.nextStep;
  if (nextStep === 'done') {
    ctx.reporter.log(`run ${state.runId} is already done — nothing to resume`, 'warn');
    return finishRun(ctx, runDir, state);
  }

  const start: PreserveStepId = fromStep ?? nextStep;

  /* THE LOUD WARN. A forward jump skips steps this run never completed; past
   * the commit it asserts the camera is in the patched state, which is the
   * one assertion this tool will not make quietly. */
  if (start !== nextStep) {
    const skipped = PRESERVE_STEP_IDS.slice(
      PRESERVE_STEP_IDS.indexOf(nextStep),
      PRESERVE_STEP_IDS.indexOf(start),
    );
    if (skipped.length > 0) {
      ctx.reporter.log(
        `WARNING: jumping from ${nextStep} to ${start}, skipping: ` + skipped.join(', '),
        'warn',
      );
    }
  }
  if (
    PRESERVE_STEP_IDS.indexOf(start) > PRESERVE_STEP_IDS.indexOf('commit') &&
    state.steps.commit?.status !== 'done'
  ) {
    ctx.reporter.log(
      'WARNING: this jump goes past an INCOMPLETE commit — the camera is expected to be in ' +
        'the PATCHED state (the commit may have landed without its checkpoint being written). ' +
        'The jump is granted because you asked for it explicitly; the protections that remain ' +
        "are the steps' own: the restore detects an already-original bank, and the verify " +
        'refuses any diff against the backup. If the camera is NOT patched, stop and re-run ' +
        'the commit instead (--resume without --from-step) — its pre-check reads the bank ' +
        'before writing.',
      'warn',
    );
  }

  ctx.reporter.log(
    `resuming run ${state.runId} (${state.expectedVersion ?? 'image not derived yet'}) at ${start}` +
      (ctx.options.fromStep === null ? '' : ' (--from-step)'),
    'detail',
  );
  /* A resume that reaches the commit prints the plan first, and asks on a
   * terminal: the same last gate a fresh run passes before its first write. */
  const planBeforeCommit =
    start === 'commit' || (start === 'patch' && state.steps.commit === undefined);
  const finalState = await runSteps(
    ctx,
    runDir,
    {
      ...state,
      nextStep: start,
      /* An explicit --chunk on a resume overrides the recorded drain ask size. */
      ...(ctx.options.chunk === null ? {} : { drainChunk: ctx.options.chunk }),
    },
    /* An explicit --from-step is the one loud way a jump past an incomplete
     * write step is granted; core relaxes only the ordering gates, never the
     * file gates, and the wire-side pre-checks stay in the steps. */
    {
      allowJump: fromStep !== null,
      ...(ctx.options.backupOnly ? { stopAfter: 'backup' as const } : {}),
      ...(planBeforeCommit || state.steps.backup?.status !== 'done'
        ? { onPlanReady: (s: PreserveRunState) => confirmDerivedPlan(ctx, runDir, s) }
        : {}),
      planReadyNow: start === 'commit',
    },
  );
  return finishRun(ctx, runDir, finalState);
}

/* ==================================================================== *
 * the step loop — checkpoint after every step
 * ==================================================================== */

async function stateExists(runDir: string): Promise<boolean> {
  try {
    await stat(`${runDir}/${PRESERVE_RUN_STATE_FILE}`);
    return true;
  } catch {
    return false;
  }
}

async function runSteps(
  ctx: CommandContext,
  runDir: string,
  initialState: PreserveRunState,
  options: {
    readonly allowJump?: boolean;
    /** `--backup-only`: the run stops before any step after this one. Nothing after it is started. */
    readonly stopAfter?: PreserveStepId;
    /** Called once, before the commit: after the patch step that records the
     *  patches (the first moment the derived plan exists), or at once when
     *  `planReadyNow` says the run already stands there. */
    readonly onPlanReady?: (state: PreserveRunState) => Promise<void>;
    readonly planReadyNow?: boolean;
  } = {},
): Promise<PreserveRunState> {
  /* A fresh session per step boundary. After a wire-89 the camera
   * re-enumerates, so open() retries until the camera is back (or the run is
   * cancelled) — 60 attempts, 1 s apart, covers a full boot of silence. */
  let current: Session | null = null;
  const opener: SessionOpener = {
    open: async () => {
      for (let attempt = 0; ; attempt++) {
        /* Core's own cancellation type: describeError maps it to exit 130,
         * the same code a SIGINT mid-transfer takes. */
        if (ctx.signal.aborted) throw new CancelledError();
        try {
          current = await openSession(ctx);
          return current.device;
        } catch (error) {
          if (attempt >= 60) {
            throw new CliError(
              `the camera did not come back after ${String(attempt + 1)} attempts — ` +
                'replug it and re-run the phase that failed. Nothing more was written. ' +
                `Last error: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
          await sleep(1000);
        }
      }
    },
    close: async () => {
      const session = current;
      current = null;
      await session?.close();
    },
  };

  /* Every checkpoint — the derived factory plaintexts included — is a run
   * directory file; core sha-checks each against the backup step's record. */
  const loadArtifact: PreserveArtifactLoader = (name) => readImageOrNull(`${runDir}/${name}`);

  let state = initialState;
  let planned = false;
  if (options.planReadyNow === true && options.onPlanReady !== undefined) {
    planned = true;
    await options.onPlanReady(state);
  }
  while (state.nextStep !== 'done') {
    const step: PreserveStepId = state.nextStep;
    if (
      options.stopAfter !== undefined &&
      PRESERVE_STEP_IDS.indexOf(step) > PRESERVE_STEP_IDS.indexOf(options.stopAfter)
    ) {
      ctx.reporter.log(
        `--backup-only: stopping after the ${preserveStepLabel(options.stopAfter)}; ` +
          `${preserveStepLabel(step)} and the steps after it are not run`,
        'info',
      );
      break;
    }
    ctx.reporter.log(`— ${preserveStepLabel(step)} —`, 'info');
    /* THE RETRY GATE: a failed backup re-runs only past the power-cycle
     * acknowledgement — core refuses it otherwise (describeStepGate), and the
     * flag passed here is this front end's assertion, asked for on a terminal
     * or carried by --yes. */
    const powerCycled =
      step === 'backup' && state.steps.backup?.status === 'failed'
        ? await requirePowerCycleAcknowledgement(ctx, runDir)
        : false;
    let outcome;
    try {
      outcome = await runPreserveStep(step, opener, state, loadArtifact, ctx.reporter, ctx.signal, {
        ...(options.allowJump === true ? { allowJump: true } : {}),
        ...(powerCycled ? { powerCycled: true } : {}),
      });
    } catch (error) {
      if (isCancellation(error)) throw error;
      /* The failure is checkpointed; --print-state reports it, and the step
       * can be re-run (a `failed` record never blocks). */
      state = recordStepFailure(state, step, error);
      await saveRunState(runDir, state);
      /* THE FIRST-ATTEMPT REMEDY: a fresh run whose first backup stalls at
       * its first bytes or comes back blank is almost always a spent reader —
       * say the power cycle before any retry is even thinkable. */
      if (
        step === 'backup' &&
        initialState.steps.backup === undefined &&
        SPENT_READER_FAILURE.test(error instanceof Error ? error.message : String(error))
      ) {
        ctx.reporter.log(
          'a backup that stalls at its first bytes or comes back blank usually means the ' +
            "camera's window reader is spent for this boot — power-cycle the camera (unplug " +
            'and replug it, or use its power switch) before any retry',
          'warn',
        );
      }
      /* THE START THAT ENTERED AN UNPATCHED BANK: another drain would read the
       * same bank, so core records the run's next step as the restore, and a plain
       * resume goes on there (no jump past a step, no warning). */
      const stopped = step === 'drain' && unpatchedStartOf(error) !== null;
      /* A backup that refuses the camera (an unknown image, another build) wrote nothing, and its
       * words say what to do; "fix the cause and resume" contradicted "start a new run". */
      const refused =
        step === 'backup' && error instanceof SeekError && error.code === 'pipeline/refused';
      /* THE PLANNED STOP is said once, as the page says it ("Stopped: …"); the run's last lines
       * give the next step, and the command ends with exit status 3, not an error (42.105). */
      if (stopped) {
        ctx.reporter.log(
          `Stopped: ${error instanceof Error ? error.message : String(error)}`,
          'warn',
        );
        return state;
      }
      const label = preserveStepLabel(step);
      ctx.reporter.log(
        refused
          ? `${label} refused: ${error.message} — recorded in ${runDir}/` +
              `${PRESERVE_RUN_STATE_FILE}; nothing was written to the camera.`
          : `${label} failed: ${describeError(error, ctx.io.platform).message} — ` +
              `recorded in ${runDir}/${PRESERVE_RUN_STATE_FILE}; ` +
              'the previous checkpoint stands. Fix the cause and resume.',
        'error',
      );
      /* A refusal or a failure is said once, in the line above, in the words the CLI's own `error:` line
       * would print (describeError); the run still fails with its exit status (1) and the JSON's error. The
       * hint, if any, is still printed after it (TESTING.md 42.108 O2, 42.110). */
      throw typeof error === 'object' && error !== null ? markSaid(error) : error;
    }
    /* Artifacts first, state second: a crash in between leaves the state
     * behind the files, which a resume catches up from. */
    for (const artifact of outcome.artifacts) {
      const file = await writeRunArtifact(runDir, artifact);
      ctx.reporter.log(`wrote ${file}`, 'detail');
    }
    state = outcome.state;
    await saveRunState(runDir, state);
    if (!planned && step === 'patch') {
      planned = true;
      if (options.onPlanReady !== undefined) await options.onPlanReady(state);
    }
  }
  return state;
}

/* ==================================================================== *
 * the results
 * ==================================================================== */

/**
 * The zip of a run: `preserve_run.json` and every checkpoint file the run has produced, read back
 * from the run directory and checked against the record. The same shape the web app saves as its
 * run file, so a zip from either front end holds the same files. Null without `--zip`.
 */
async function writeRunZip(
  ctx: CommandContext,
  runDir: string,
  state: PreserveRunState,
): Promise<WrittenOutput | null> {
  if (ctx.options.zip === null) return null;
  const artifacts: Artifact[] = [
    { name: PRESERVE_RUN_STATE_FILE, data: await readFile(runStatePath(runDir)) },
  ];
  for (const entry of await artifactInventory(runDir, state)) {
    if (!entry.present) continue;
    artifacts.push({
      name: entry.name,
      data: await readFile(resolveArtifactPath(runDir, entry.name)),
    });
  }
  return writeOutputs({ directory: null, zip: ctx.options.zip }, artifacts);
}

/** The end of every run that reaches the user: the zip if one was asked for, then the result. */
async function finishRun(
  ctx: CommandContext,
  runDir: string,
  state: PreserveRunState,
): Promise<CommandResult> {
  const zip = await writeRunZip(ctx, runDir, state);
  return runResult(ctx, runDir, state, { backupOnly: ctx.options.backupOnly, zip });
}

/** The choices a run offers, as the JSON carries them: the code names and the words. */
function choicesJsonOf(state: PreserveRunState): unknown {
  if (state.banks === undefined) return null;
  return preserveChoicesOf(state).map((verdict) => ({
    choice: verdict.choice,
    banks: verdict.banks,
    what: verdict.what,
    warnings: verdict.warnings,
  }));
}

function runResult(
  ctx: CommandContext,
  runDir: string,
  state: PreserveRunState,
  extra: { readonly backupOnly: boolean; readonly zip: WrittenOutput | null },
): CommandResult {
  const stepIds = PRESERVE_STEP_IDS.filter((id) => state.steps[id] !== undefined);
  /* The planned stop: the whole-flash read stopped before it read anything, and the run's next
   * step is the restore. Exit status 3 (`EXIT_STOPPED`), not a failure. */
  const stopped = preserveStoppedForRestore(state);
  if (ctx.human) {
    /* Each step's result in core's plain words; the run file keeps its full notes. */
    for (const id of stepIds) {
      const words = preserveStepResultWords(state, id);
      if (words !== null) ctx.out(words);
    }
    ctx.out(`run ${state.runId}: next step ${state.nextStep}`);
    if (state.nextStep === 'done') {
      const done = preserveDoneWords(state);
      ctx.out(`${done.title}. ${done.detail}`);
    }
    if (state.targets !== undefined) {
      ctx.out(`banks written: ${bankListWords(state.targets)} (--bank ${state.choice})`);
    }
    ctx.out(`run directory: ${runDir}`);
    if (extra.backupOnly) {
      ctx.out(
        'backup only: the run stopped after the read-only backup; nothing was written to the camera',
      );
    }
    if (extra.zip !== null) ctx.out(`wrote ${extra.zip.zip ?? ''} (${String(extra.zip.bytes)} B)`);
    if (stopped) {
      ctx.out(
        `${PRESERVE_UNPATCHED_START_NEXT} Continue with the restore: ` +
          `seek-fw preserve --resume ${runDir}`,
      );
    }
  }
  return {
    run: {
      id: state.runId,
      directory: runDir,
      nextStep: state.nextStep,
      createdAt: state.createdAt,
    },
    version: state.expectedVersion ?? null,
    /* `storage` is how the build stores its firmware in a bank (`v1-2014` plain, `v1-2014-ff` the
     * 1.3.0.8 FF build's two keystreams, `compact-2016` the 2016 keystream), which picks the solver
     * and the patch table. It is not the firmware family `seek-fw info` names. */
    build:
      state.buildId === undefined
        ? null
        : {
            id: state.buildId,
            storage: state.buildFamily ?? null,
            label: state.buildLabel ?? null,
          },
    boot: state.boot ?? null,
    choice: state.choice,
    targets: state.targets ?? null,
    choices: choicesJsonOf(state),
    banks: state.banks ?? null,
    drainEntered: state.drainEntered ?? null,
    steps: Object.fromEntries(stepIds.map((id) => [id, state.steps[id]])),
    verify: state.verify ?? null,
    sha256: {
      rawDump: state.rawDumpSha256 ?? null,
      deliveredDump: state.deliveredSha256 ?? null,
    },
    output: {
      directory: runDir,
      record: `${runDir}/${PRESERVE_RUN_STATE_FILE}`,
      zip: extra.zip?.zip ?? null,
    },
    backupOnly: extra.backupOnly,
    stopped: stopped
      ? {
          step: 'drain',
          entered: state.drainEntered ?? null,
          message: state.steps.drain?.error ?? null,
          next: state.nextStep,
        }
      : null,
  };
}

/* ==================================================================== *
 * --print-state
 * ==================================================================== */

async function printStateCommand(ctx: CommandContext, runDir: string): Promise<CommandResult> {
  const state = await loadRunState(runDir);
  const inventory = await artifactInventory(runDir, state);

  if (ctx.human) {
    const say = (text: string): void => {
      ctx.reporter.write(text);
    };
    say(`preserve run ${state.runId}`);
    say(`  directory          ${runDir}`);
    say(`  created            ${state.createdAt}`);
    say(`  schema version     ${String(state.version)}`);
    say(`  expected version   ${state.expectedVersion ?? '(not derived yet)'}`);
    say(`  build              ${preserveBuildWords(state)}`);
    if (state.stagedForm !== undefined) {
      say(`  written            ${stagedFormWords(state.stagedForm)}`);
    }
    for (const line of bootAndBankLines(state)) say(line);
    if (state.banks !== undefined) {
      for (const line of choiceLines(state, runDir)) say(line);
      for (const key of BANK_KEYS) {
        const bank = state.banks[key];
        if (bank.slotReadShas !== undefined) {
          say(`  ${bankWordsOf(key)} reads   ${bank.slotReadShas[0]}`);
          say(`                     ${bank.slotReadShas[1]}`);
        }
        if (bank.imageSha256 !== undefined) {
          say(`  ${bankWordsOf(key)} image   ${bank.imageSha256}`);
        }
        if (bank.imageDerivation !== undefined) {
          say(
            `  image edit         ${bankWordsOf(key)}: ${bank.imageDerivation.label}, ` +
              `balance ${hexUp(bank.imageDerivation.balanceWord)}`,
          );
        }
      }
    } else {
      say(`  banks to write     ${bankChoiceWords(state.choice)} (--bank ${state.choice})`);
    }
    if (state.capability !== undefined) {
      say(`  whole-flash read   ${drainCapabilityWords(state.capability)}`);
    }
    if (state.drainEntered !== undefined) {
      say(
        `  last restart       ${
          state.drainEntered === null
            ? 'the bank the camera entered was not read'
            : `entered ${bankWordsOf(state.drainEntered)}`
        }`,
      );
    }
    say(`  next step          ${state.nextStep}`);
    for (const id of PRESERVE_STEP_IDS) {
      const record = state.steps[id];
      if (record === undefined) {
        say(`  ${id.padEnd(8)} not run yet`);
        continue;
      }
      say(`  ${id.padEnd(8)} ${preserveStepResultWords(state, id) ?? record.status}`);
    }
    if (state.rawDumpSha256 !== undefined) say(`  raw dump sha256    ${state.rawDumpSha256}`);
    if (state.deliveredSha256 !== undefined) {
      say(`  delivered sha256   ${state.deliveredSha256}`);
    }
    if (inventory.length > 0) {
      say('  checkpoint files');
      for (const entry of inventory) {
        const verdict = !entry.present ? 'MISSING' : entry.shaMatches === false ? 'CHANGED' : 'ok';
        say(`    ${verdict.padEnd(8)} ${entry.name}`);
      }
    }
  }
  return {
    run: {
      id: state.runId,
      directory: runDir,
      nextStep: state.nextStep,
      createdAt: state.createdAt,
    },
    state,
    choices: choicesJsonOf(state),
    inventory,
  };
}
