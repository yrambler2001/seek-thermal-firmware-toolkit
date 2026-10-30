/**
 * The wizard's phase gates: a synchronous projection of core's
 * `describeStepGate` (which `runPreserveStep` enforces authoritatively, and
 * which is async because it inspects the run directory), regrouped at PHASE
 * granularity. Each phase's gate mirrors the gate of every core step the
 * phase will run, in core's order, with the ordering preconditions a phase
 * satisfies ITSELF (the patch step's backup, the drain's commit) treated as
 * met — by the time that step runs, the step it waits for has just finished
 * inside the same task.
 *
 * The two must agree, because a button is enabled exactly when core will
 * accept the call.
 *
 * `pastCommit` is the loud context flag: the commit is not on record and the
 * phase's remaining work concerns the patched part. Core refuses such a
 * step, and the ONE recovery core's own gate offers is the explicit jump
 * (`allowJump`), which relaxes exactly those ordering gates. It is surfaced
 * here as `jumpable` and armed only through the danger dialog, whose
 * assertion is the operator's: the writes landed without their checkpoints.
 * A FAILED commit record is the other jump shape — an attempt happened and
 * the run file cannot prove whether the write landed — and that jump starts
 * the phase PAST the commit (`jumpStartStep`), at the drain, instead of
 * replaying a write that may already be on the camera.
 */

import { drainCapabilityMessage, preserveBuildParam, preserveChoiceOf } from '@seek-fw/core';
import { coreText, recordedText } from '@/lib/core-text';
import { listSemicolon, t, type Translate } from '@/i18n';
import { bankWords } from '@/lib/bank-names';
import {
  NEEDS_CONFIRM,
  PRESERVE_BACKUP_FILE,
  PRESERVE_STEPS,
  phaseMeta,
  preserveCaptureFile,
  preservePlainFile,
  type BankKey,
  type CheckpointName,
  type PreservePhaseId,
  type PreserveRunState,
  type PreserveStepId,
} from './types';

export interface PreserveGate {
  /** The phase may be started as-is — core's gate will accept every step. */
  readonly ok: boolean;
  /** The unmet prerequisites, in the order core's gate names them. */
  readonly missing: readonly string[];
  /**
   * The commit is not on record, and this phase's remaining work concerns
   * the patched part. The UI must say loudly what that means before the
   * phase is armed.
   */
  readonly pastCommit: boolean;
  /**
   * Core's gate accepts the phase with `allowJump` — the only unmet gates
   * are the ordering ones past the commit — or a failed commit record makes
   * the jump-past-commit variant worth offering. Armed only through the
   * danger dialog; `runPhase` then passes `allowJump` down to core.
   */
  readonly jumpable: boolean;
  /** The step the phase starts at: the first one not already done. */
  readonly startStep: PreserveStepId | null;
  /** Where a JUMP run starts. Differs from `startStep` only past a FAILED
   *  commit: the jump does not replay a write that may already be on the
   *  camera, it continues at the drain. */
  readonly jumpStartStep: PreserveStepId | null;
  /** Needs the danger confirmation (a write among the pending steps, or a jump). */
  readonly confirm: boolean;
  /**
   * The backup step failed with `powerCycleRequired` on record — core's retry
   * gate refuses the re-run until the front end asserts the camera was
   * power-cycled, and core cannot observe one. The UI arms the assertion with
   * its own loud control (the "I power-cycled the camera" re-run button),
   * which passes `powerCycled: true` down to core.
   */
  readonly needsPowerCycle: boolean;
}

export interface PreserveGateInput {
  readonly state: PreserveRunState | null;
  readonly phase: PreservePhaseId;
  /** Whether a checkpoint's bytes are in memory (run so far or loaded run file). */
  readonly has: (name: CheckpointName) => boolean;
  /**
   * The language of `missing`: the page's (`t`, the default) for the start button's note, English
   * (`tEnglish`) where the gate's reason goes to the run log.
   */
  readonly translate?: Translate;
}

const done = (state: PreserveRunState, step: PreserveStepId): boolean =>
  state.steps[step]?.status === 'done';

/* The build's name stays as it is; "not known yet" and "firmware …" are core's words. */
const buildName = (state: PreserveRunState, translate: Translate): string =>
  coreText(preserveBuildParam(state), translate);

/** What the chosen banks lack, in core's order: the banks the backup read, a
 *  resolved choice, and each chosen bank writable (and, on a recovery-only
 *  build, recovery R). */
function targetGaps(state: PreserveRunState, translate: Translate): string[] {
  if (state.banks === undefined || state.boot === undefined) {
    return [translate('preserve:gate.banksRead')];
  }
  const targets = state.targets;
  if (targets === undefined || targets.length === 0) {
    const verdict = preserveChoiceOf(state, state.choice);
    return [
      translate('preserve:gate.choice', {
        why: recordedText(verdict.whatMessage, verdict.what, translate),
      }),
    ];
  }
  const out: string[] = [];
  for (const key of targets) {
    const refused = state.banks[key].refused;
    if (refused !== null) {
      out.push(
        translate('preserve:gate.bankRefused', {
          bank: bankWords(key, translate),
          reason: recordedText(state.banks[key].refusedMessage, refused, translate),
        }),
      );
    }
    if (state.route === 'recovery-only' && key !== 'r') {
      out.push(
        translate('preserve:gate.recoveryRoute', {
          r: bankWords('r', translate),
          bank: bankWords(key, translate),
        }),
      );
    }
  }
  return out;
}

const targetsOf = (state: PreserveRunState): readonly BankKey[] => state.targets ?? [];

export function canRunPhase(input: PreserveGateInput): PreserveGate {
  const { state, phase, has } = input;
  const translate = input.translate ?? t;
  const bank = (key: BankKey): string => bankWords(key, translate);
  const meta = phaseMeta(phase);
  const first = meta.steps[0] ?? 'backup';

  if (state === null) {
    return {
      ok: phase === 'read-build',
      missing: phase === 'read-build' ? [] : [translate('preserve:gate.noRun')],
      pastCommit: false,
      jumpable: false,
      startStep: first,
      jumpStartStep: null,
      confirm: false,
      needsPowerCycle: false,
    };
  }
  if (state.nextStep === 'done') {
    return {
      ok: false,
      missing: [translate('preserve:gate.runDone')],
      pastCommit: false,
      jumpable: false,
      startStep: first,
      jumpStartStep: null,
      confirm: false,
      needsPowerCycle: false,
    };
  }

  const startStep = meta.steps.find((step) => !done(state, step)) ?? null;
  if (startStep === null) {
    return {
      ok: false,
      missing: [translate('preserve:gate.alreadyDone', { step: state.nextStep })],
      pastCommit: false,
      jumpable: false,
      startStep: first,
      jumpStartStep: null,
      confirm: false,
      needsPowerCycle: false,
    };
  }

  /* The gate of every pending step, in core's order. `effDone` grows as the
   * loop walks the phase: a step that runs earlier in the same task counts
   * as done for the steps after it. */
  const effDone = new Set<PreserveStepId>(
    PRESERVE_STEPS.filter((entry) => done(state, entry.id)).map((entry) => entry.id),
  );
  const missing: string[] = [];
  /* The ordering gates allowJump relaxes, kept apart from the rest: they are
   * the only gaps a jump can clear. */
  const ordering: string[] = [];

  for (const step of meta.steps) {
    if (done(state, step)) continue;

    const want = (pre: PreserveStepId, why: string): void => {
      if (!effDone.has(pre)) ordering.push(why);
    };
    switch (step) {
      case 'backup':
        /* Nothing comes before it, and a run with work done never re-runs it. */
        break;
      case 'patch':
        want('backup', translate('preserve:gate.backupFirst'));
        break;
      case 'commit': {
        want('backup', translate('preserve:gate.backup'));
        want('patch', translate('preserve:gate.patchStep'));
        if (effDone.has('backup')) missing.push(...targetGaps(state, translate));
        if (done(state, 'patch')) {
          for (const key of targetsOf(state)) {
            if (state.banks?.[key].patch === undefined) {
              missing.push(translate('preserve:gate.patchOf', { bank: bank(key) }));
            }
          }
        }
        if (done(state, 'backup')) {
          if (!has(PRESERVE_BACKUP_FILE)) missing.push(translate('preserve:gate.backupFile'));
          for (const key of targetsOf(state)) {
            if (!has(preserveCaptureFile(key))) {
              missing.push(translate('preserve:gate.capture', { bank: bank(key) }));
            }
            if (!has(preservePlainFile(key))) {
              missing.push(translate('preserve:gate.derived', { bank: bank(key) }));
            }
          }
        }
        break;
      }
      case 'drain': {
        want('commit', translate('preserve:gate.writeStep'));
        missing.push(...targetGaps(state, translate));
        if (state.capability !== undefined && !state.capability.wholePart) {
          missing.push(
            translate('preserve:gate.drainRefused', {
              build: buildName(state, translate),
              why: coreText(drainCapabilityMessage(state.capability), translate),
            }),
          );
        }
        for (const key of targetsOf(state)) {
          if (!has(preserveCaptureFile(key))) {
            missing.push(translate('preserve:gate.capture', { bank: bank(key) }));
          }
        }
        break;
      }
      case 'restore': {
        want('commit', translate('preserve:gate.writeStep'));
        missing.push(...targetGaps(state, translate));
        for (const key of targetsOf(state)) {
          if (state.banks?.[key].patch === undefined) {
            missing.push(translate('preserve:gate.patchSummary', { bank: bank(key) }));
          }
        }
        if (state.restoreForm === 'none') {
          missing.push(
            translate('preserve:gate.restoreRefused', { build: buildName(state, translate) }),
          );
        }
        for (const key of targetsOf(state)) {
          if (
            state.stagedForm !== undefined &&
            state.stagedForm !== 'plain' &&
            !has(preservePlainFile(key))
          ) {
            missing.push(
              translate('preserve:gate.plaintext', {
                bank: bank(key),
                file: preservePlainFile(key),
              }),
            );
          }
          if (!has(preserveCaptureFile(key))) {
            missing.push(translate('preserve:gate.capture', { bank: bank(key) }));
          }
        }
        break;
      }
      case 'verify': {
        want('restore', translate('preserve:gate.restoreFirst'));
        if (!has(PRESERVE_BACKUP_FILE)) missing.push(translate('preserve:gate.backup'));
        break;
      }
    }
    effDone.add(step);
  }

  /* Core's retry gate: a FAILED backup with `powerCycleRequired` on record
   * re-runs only past the front end's assertion that the camera was
   * power-cycled since. Only phase ① runs the backup step. The gap lands in
   * `missing` BEFORE `ok` is computed, so the plain Run button stays dark —
   * core would refuse it — and the row's own re-run control arms the
   * assertion. */
  const needsPowerCycle =
    phase === 'read-build' &&
    startStep === 'backup' &&
    state.steps.backup?.status === 'failed' &&
    state.steps.backup.powerCycleRequired === true;
  if (needsPowerCycle) {
    missing.push(translate('preserve:gate.powerCycle'));
  }

  /* allowJump relaxes exactly the ordering gates past the commit — nothing
   * else. A phase whose only gaps are those runs ONLY as a jump; a phase
   * with no gaps at all runs normally and may additionally offer the
   * jump-past-a-failed-commit (see below). */
  /* The commit is in doubt only when an attempt is ON RECORD as failed: the
   * write may have landed. A run that simply has not reached the commit yet —
   * the normal state right after phase ① — is not in doubt, and its later
   * phases just wait. (A commit interrupted with no record at all is sorted by
   * the commit's own pre-check, which reads the bank and records the failure
   * that opens the jump.) */
  const commitInDoubt = state.steps.commit?.status === 'failed' && !done(state, 'commit');
  const orderOnly = ordering.length > 0 && missing.length === 0 && commitInDoubt;
  const ok = missing.length === 0 && ordering.length === 0;
  /* Two steps of one phase can want the same file (the commit and the drain
   * both need the capture) — named once, in first-seen order. */
  const uniqueMissing = [...new Set(missing)];

  /* The failed-commit jump: an attempt is on record as failed — the write may
   * already be on the camera — and the drain is otherwise ready. The normal
   * run stays available (the commit's own pre-check reads the bank and sorts
   * landed from not-landed); the jump skips the commit instead of replaying
   * it, which is core's own remedy text for a landed commit. */
  const stuckJump =
    phase === 'patch-dump' &&
    state.steps.commit?.status === 'failed' &&
    !done(state, 'drain') &&
    ok &&
    targetsOf(state).length > 0 &&
    targetsOf(state).every((key) => has(preserveCaptureFile(key)));

  return {
    ok,
    missing: ok ? [] : orderOnly ? ordering : [...ordering, ...uniqueMissing],
    /* Loud only where the situation is anomalous: a commit attempt failed, so
     * the camera may already run the patched image. Everywhere else the
     * ordering gaps are just the run's normal order. */
    pastCommit:
      ((ordering.length > 0 && commitInDoubt) || stuckJump) &&
      state.steps.backup?.status === 'done',
    jumpable: orderOnly || stuckJump,
    startStep,
    jumpStartStep: stuckJump ? 'drain' : orderOnly ? startStep : null,
    confirm: meta.steps.some((step) => !done(state, step) && NEEDS_CONFIRM.has(step)),
    needsPowerCycle,
  };
}

/**
 * One line for a row's subtitle: why the Run button is dark. `translate` is the language of the line around
 * the gaps; give the gate's `missing` in the same one (`PreserveGateInput.translate`).
 */
export function gateReason(gate: PreserveGate, translate: Translate = t): string | null {
  if (gate.ok || gate.jumpable) return null;
  return translate('preserve:gate.needs', { missing: listSemicolon(gate.missing, translate) });
}
