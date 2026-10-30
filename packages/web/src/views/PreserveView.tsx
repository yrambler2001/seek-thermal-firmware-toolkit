/**
 * The preserve wizard, laid out like the dump view: the shared Connect step
 * is 01, and each of the three phases is its own numbered step (02–04) with
 * its start button on top, a plain-words description, and its own bar and
 * log. The image is never picked — step 02 reads every firmware bank, says
 * which one the next start enters and why, and the person chooses the banks
 * step 03 patches (by default that one); the plan prints from what the camera
 * produced.
 *
 * The run's expected hand-offs — the "Connect device" pick after every
 * restart, the replug a pre-fix patch owes, the power cycle a spent reader
 * needs — are the user's turn, not a fault: they show as a calm blue ask with
 * the Connect button inside it, never as red. Red is kept for what really
 * went wrong, and the two writes still open a confirmation dialog first.
 */

import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import {
  Archive,
  Circle,
  CircleCheck,
  CircleStop,
  CircleX,
  HardDriveDownload,
  Layers,
  ListChecks,
  Loader2,
  Play,
  Plug,
  RotateCcw,
  Save,
  ScanSearch,
} from 'lucide-react';
import {
  bankRecordWords,
  commitOrderOf,
  hexUp,
  isPreserveBankChoice,
  lastStartWords,
  nextStartWords,
  preserveChoiceOf,
  preserveChoicesOf,
  restoreOrderOf,
  BANK_KEYS,
  type BankKey,
  type PreserveBankChoice,
  type PreserveBankRecord,
  type PreserveChoiceVerdict,
  bankChoiceWritesWords,
  preserveDoneWords,
  preserveBuildWords,
  preserveStepResultWords,
  preserveStoppedForRestore,
  PRESERVE_UNPATCHED_START_NEXT,
  patchSiteWords,
  stagedFormWords,
  restoreFormWords,
  drainCapabilityWords,
} from '@seek-fw/core';
import { rich, t } from '@/i18n';
import { bankList, bankName, bankWords } from '@/lib/bank-names';
import { Panel, PanelTitle } from '@/components/Panel';
import { Prose } from '@/components/Prose';
import { RunPanel } from '@/components/RunPanel';
import { Section } from '@/components/Section';
import { UnlockNote } from '@/components/UnlockNote';
import { Alert } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Disclosure } from '@/components/ui/disclosure';
import { Field, Select } from '@/components/ui/field';
import { KeyValue } from '@/components/KeyValue';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowHeader,
} from '@/components/ui/table';
import { Toolbar } from '@/components/ui/toolbar';
import { canRunPhase, gateReason, type PreserveGate } from '@/lib/preserve/gating';
import {
  PRESERVE_PHASES,
  WRITES_FLASH,
  phaseMeta,
  stepMeta,
  type PreservePhaseId,
  type PreserveRunState,
  type PreserveStepId,
} from '@/lib/preserve/types';
import type { DeliveredCheck, PreservePanelApi, PreservePrompt } from '@/hooks/usePreservePanel';

const RUN_ACCEPT = '.zip,application/zip';

/** Connect is step 01, shared with the other views; the phases follow it. */
const FIRST_PHASE_STEP = 2;

const PHASE_ICON: Readonly<Record<PreservePhaseId, ReactNode>> = {
  'read-build': <ScanSearch />,
  'patch-dump': <HardDriveDownload />,
  'restore-verify': <RotateCcw />,
};

function stepNumber(index: number): string {
  return String(index + FIRST_PHASE_STEP).padStart(2, '0');
}

function bytesHex(bytes: readonly number[]): string {
  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join(' ');
}

export interface PreserveViewProps {
  readonly preserve: PreservePanelApi;
  readonly connected: boolean;
  readonly busy: boolean;
  /** The Connect click, offered again inside a "your turn" ask so the user
   *  does not have to scroll back to step 01 mid-run. */
  readonly onConnect?: () => void;
}

interface ConfirmRequest {
  readonly phase: PreservePhaseId;
  readonly jump: boolean;
}

export function PreserveView({
  preserve,
  connected,
  busy,
  onConnect,
}: PreserveViewProps): ReactElement {
  const [confirming, setConfirming] = useState<ConfirmRequest | null>(null);
  const { state } = preserve;

  /* The one loud case: a commit attempt is on record as FAILED, so the write
   * may already be on the camera — the steps that concern the patched part are
   * shut (or jump-only), and the page has to say WHY. A run that simply has
   * not reached the commit yet (right after step 02) is the normal order, not
   * this. The recovery is the commit step's own pre-check or, explicitly, the
   * jump. */
  const pastCommitLoud =
    state !== null && state.nextStep !== 'done' && state.steps.commit?.status === 'failed';

  return (
    <>
      <Section
        id="preserve-how"
        title={t('preserve:how.title')}
        icon={<ListChecks />}
        description={
          state === null
            ? t('preserve:how.descriptionIdle')
            : state.expectedVersion === undefined
              ? t('preserve:how.descriptionRun', { runId: state.runId })
              : t('preserve:how.descriptionRunVersion', {
                  runId: state.runId,
                  version: state.expectedVersion,
                })
        }
      >
        <Prose>
          <ul>
            <li>{rich('preserve:how.restarts')}</li>
            <li>{t('preserve:how.noFile')}</li>
            <li>
              {rich('preserve:how.banks', {
                params: { a: bankWords('a'), b: bankWords('b'), r: bankWords('r') },
              })}
            </li>
            <li>
              {rich('preserve:how.runFile', { params: { example: 'preserve-…-verified.zip' } })}
            </li>
          </ul>
        </Prose>
        <Alert tone="warn">
          <p>{rich('preserve:how.writeWarning')}</p>
          <p>{rich('preserve:how.phone')}</p>
        </Alert>
        {pastCommitLoud && (
          <Alert tone="err">
            <p>{rich('preserve:how.pastCommit')}</p>
          </Alert>
        )}
      </Section>

      {PRESERVE_PHASES.map((meta, index) => (
        <PhaseSection
          key={meta.id}
          index={index}
          meta={meta}
          state={state}
          preserve={preserve}
          connected={connected}
          busy={busy}
          onConnect={onConnect}
          onArm={(jump) => {
            setConfirming({ phase: meta.id, jump });
          }}
          onArmRestore={() => {
            setConfirming({ phase: 'restore-verify', jump: false });
          }}
        />
      ))}

      {preserve.unlockNote && <UnlockNote />}

      {state !== null && state.nextStep === 'done' && (
        <VerifySummary
          state={state}
          check={preserve.deliveredCheck}
          busy={busy}
          onSave={() => {
            preserve.saveAgain();
          }}
        />
      )}

      <Section
        id="preserve-runfile"
        tone="quiet"
        eyebrow={t('preserve:runFile.eyebrow')}
        title={t('preserve:runFile.title')}
        icon={<Save />}
        description={t('preserve:runFile.description')}
      >
        {state !== null && preserve.lastSave !== null ? (
          <KeyValue
            rows={[
              [t('preserve:runFile.run'), state.runId],
              [t('preserve:runFile.file'), preserve.lastSave.fileName],
              [
                t('preserve:runFile.lastSaved'),
                t('preserve:runFile.lastSavedValue', {
                  step: preserve.lastSave.afterStep,
                  at: preserve.lastSave.at,
                  bytes: preserve.lastSave.bytes,
                }),
              ],
              [t('preserve:runFile.nextStep'), state.nextStep],
            ]}
          />
        ) : (
          <Prose>
            <p>{t('preserve:runFile.none')}</p>
          </Prose>
        )}

        <Toolbar label={t('preserve:runFile.toolbar')}>
          <Button
            id="preservePickRun"
            variant="default"
            disabled={busy}
            onClick={() => {
              pickRunFile((file) => {
                void preserve.loadRunFile(file);
              });
            }}
          >
            <Archive />
            {t('preserve:runFile.load')}
          </Button>
          <Button
            disabled={state === null || busy}
            onClick={() => {
              preserve.saveAgain();
            }}
          >
            <Save />
            {t('preserve:runFile.save')}
          </Button>
        </Toolbar>

        <RunPanel
          id="preserve-load"
          label={t('preserve:runFile.panel')}
          progress={preserve.loadReporter.progress}
          lines={preserve.loadReporter.lines}
          trimmed={preserve.loadReporter.trimmed}
        />
      </Section>

      <PhaseConfirm
        request={confirming}
        state={state}
        onCancel={() => {
          setConfirming(null);
        }}
        onConfirm={(request) => {
          setConfirming(null);
          void preserve.runPhase(request.phase, request.jump ? { allowJump: true } : {});
        }}
      />
    </>
  );
}

/** Opens the run-file chooser. A hidden input keeps the picker out of the
 *  component tree — the only file this wizard ever reads is a run zip. */
function pickRunFile(onPick: (file: File) => void): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = RUN_ACCEPT;
  input.onchange = () => {
    const file = input.files?.[0];
    if (file !== undefined) onPick(file);
  };
  input.click();
}

/* ---- one phase, as its own numbered step -------------------------------- */

interface PhaseSectionProps {
  readonly index: number;
  readonly meta: (typeof PRESERVE_PHASES)[number];
  readonly state: PreserveRunState | null;
  readonly preserve: PreservePanelApi;
  readonly connected: boolean;
  readonly busy: boolean;
  readonly onConnect: (() => void) | undefined;
  /** Opens the confirmation dialog; `jump` marks the past-commit variant. */
  readonly onArm: (jump: boolean) => void;
  /** Opens step 04's dialog: the action after the planned stop of the whole-flash read. */
  readonly onArmRestore: () => void;
}

/** Why the start button is dark, in words — or null when there is nothing to
 *  explain (it is lit, the step is done, or an ask already says what to do). */
function notReadyLine(
  gate: PreserveGate,
  state: PreserveRunState | null,
  index: number,
): string | null {
  if (gate.ok || gate.jumpable || gate.needsPowerCycle) return null;
  if (state === null) return t('preserve:notReady.noRun');
  /* The run is over: nothing is waiting, so there is nothing to explain (TESTING.md 42.98). */
  if (state.nextStep === 'done') return null;
  const previous = PRESERVE_PHASES[index - 1];
  if (previous?.steps.some((step) => state.steps[step]?.status !== 'done')) {
    return t('preserve:notReady.previous', { step: stepNumber(index - 1), phase: previous.label });
  }
  const reason = gateReason(gate);
  return reason === null ? null : t('preserve:notReady.gate', { reason });
}

function PhaseSection({
  index,
  meta,
  state,
  preserve,
  connected,
  busy,
  onConnect,
  onArm,
  onArmRestore,
}: PhaseSectionProps): ReactElement {
  const phase = meta.id;
  const gate = canRunPhase({ state, phase, has: preserve.hasCheckpoint });
  const reporter = preserve.phaseReporters[phase];
  /* The detail lines are the ones the CLI prints only with --verbose: off by default, so the
   * page and the CLI show the same lines, and both show the details on request (TESTING.md
   * 42.105). */
  const [showDetails, setShowDetails] = useState(false);
  const active = preserve.activePhase === phase;
  const writes = meta.steps.some((step) => WRITES_FLASH.has(step));
  /* A phase needs the camera when any step it will actually run touches the
   * wire — everything does except a patch step resumed on its own. */
  /* Done is read off the run itself: the gate names the phase's first step
   * as its start even when every step is recorded done. */
  const phaseDone =
    state !== null && meta.steps.every((step) => state.steps[step]?.status === 'done');
  const startStep = phaseDone ? null : gate.startStep;
  const startIndex = startStep === null ? meta.steps.length : meta.steps.indexOf(startStep);
  const pending = meta.steps.slice(startIndex);
  const needsCamera = pending.some((step) => step !== 'patch');
  const cameraMissing = needsCamera && !connected;

  /* The whole-flash read stopped as planned (the start entered a bank the run did not patch):
   * another try would enter the same bank, so this section's action is the restore (42.101). */
  const plannedStop =
    state !== null && meta.steps.includes('drain') && preserveStoppedForRestore(state);
  const phaseFailed =
    !plannedStop && pending.some((step) => state?.steps[step]?.status === 'failed');
  const upNext = state !== null && state.nextStep !== 'done' && startStep === state.nextStep;

  const ask: PreservePrompt['kind'] | 'power-cycle-assert' | null =
    preserve.prompt?.phase === phase
      ? preserve.prompt.kind
      : gate.needsPowerCycle && !active
        ? 'power-cycle-assert'
        : null;

  const run = (jump: boolean): void => {
    if (gate.confirm || jump) onArm(jump);
    else void preserve.runPhase(phase);
  };

  const jumpOnly = gate.jumpable && !gate.ok;
  const startLabel = plannedStop
    ? t('preserve:phase.goRestore')
    : jumpOnly
      ? t('preserve:phase.jumpOnly')
      : phaseFailed
        ? t('preserve:phase.retry', { phase: meta.labelInSentence })
        : t('preserve:phase.start', { phase: meta.labelInSentence });
  const notReady = phaseDone || plannedStop ? null : notReadyLine(gate, state, index);

  const status = active ? (
    <Badge tone="accent">
      <Loader2 className="animate-spin motion-reduce:animate-none" />
      {t('preserve:badge.running')}
    </Badge>
  ) : phaseDone ? (
    <Badge tone="ok">
      <CircleCheck />
      {t('preserve:badge.done')}
    </Badge>
  ) : plannedStop ? (
    <Badge tone="accent">{t('preserve:badge.plannedStop')}</Badge>
  ) : phaseFailed ? (
    <Badge tone="warn">{t('preserve:badge.failed')}</Badge>
  ) : upNext ? (
    <Badge tone="accent">{t('preserve:badge.upNext')}</Badge>
  ) : null;

  return (
    <Section
      id={`preserve-${phase}`}
      step={String(index + FIRST_PHASE_STEP)}
      title={meta.label}
      icon={PHASE_ICON[phase]}
      aside={
        status === null && !writes ? undefined : (
          <span className="flex flex-wrap items-center justify-end gap-1.5">
            {/* Phone width keeps the title whole; "What to expect" and the
             * dialog already say which steps write. */}
            {writes && (
              <Badge tone="neutral" className="hidden sm:inline-flex">
                {t('preserve:badge.writes')}
              </Badge>
            )}
            {status}
          </span>
        )
      }
    >
      <Toolbar label={t('preserve:phase.toolbar', { phase: meta.label })}>
        <Button
          variant="default"
          disabled={
            plannedStop
              ? busy || !connected
              : (!gate.ok && !gate.jumpable) || busy || cameraMissing || gate.needsPowerCycle
          }
          onClick={() => {
            if (plannedStop) onArmRestore();
            else run(jumpOnly);
          }}
        >
          <Play />
          {startLabel}
        </Button>
        {gate.ok && gate.jumpable && (
          <Button
            disabled={busy || cameraMissing}
            onClick={() => {
              onArm(true);
            }}
          >
            {t('preserve:phase.skipWrite')}
          </Button>
        )}
        <Button variant="ghost" disabled={!active} onClick={preserve.cancel}>
          <CircleStop />
          {t('common:cancel')}
        </Button>
      </Toolbar>

      <Prose>
        <p>{meta.description}</p>
      </Prose>

      <StepChips steps={meta.steps} state={state} />

      {ask !== null && (
        <YourTurn
          kind={ask}
          label={meta.labelInSentence}
          busy={busy}
          connected={connected}
          onConnect={onConnect}
          onPowerCycled={() => {
            void preserve.runPhase(phase, { powerCycled: true });
          }}
        />
      )}

      {notReady !== null && <p className="text-[0.8rem] text-muted-foreground">{notReady}</p>}
      {plannedStop && (
        <p className="text-[0.8rem] text-muted-foreground">
          {/* i18n: core message */}
          {PRESERVE_UNPATCHED_START_NEXT}
        </p>
      )}
      {gate.pastCommit && (
        <p className="text-[0.8rem] font-medium text-warn">
          {t('preserve:phase.pastCommit', { section: t('preserve:how.title') })}
        </p>
      )}
      {phase === 'restore-verify' &&
        gate.ok &&
        preserve.activePhase === null &&
        state !== null &&
        state.steps.commit?.status === 'done' &&
        state.steps.drain?.status !== 'done' && (
          <p className="text-[0.8rem] text-warn">{t('preserve:phase.noDrain')}</p>
        )}
      {active && writes && ask === null && (
        <p className="text-[0.8rem] text-muted-foreground">{t('preserve:phase.keepPlugged')}</p>
      )}

      {phase === 'read-build' && state !== null && (
        <BankChoice state={state} busy={busy} chooseBanks={preserve.chooseBanks} />
      )}
      {phase === 'read-build' && state !== null && patchedBanks(state).length > 0 && (
        <PlanFromState state={state} />
      )}
      {phase === 'restore-verify' && <VerifyVerdict state={state} />}

      <div className="flex items-center gap-2 text-[0.8rem] text-muted-foreground">
        <input
          type="checkbox"
          id={`preserve-phase-${phase}-details`}
          checked={showDetails}
          onChange={(event) => {
            setShowDetails(event.target.checked);
          }}
        />
        <label htmlFor={`preserve-phase-${phase}-details`}>{t('preserve:phase.showDetails')}</label>
      </div>
      <RunPanel
        id={`preserve-phase-${phase}`}
        label={meta.label}
        progress={reporter.progress}
        lines={
          showDetails ? reporter.lines : reporter.lines.filter((line) => line.level !== 'detail')
        }
        trimmed={reporter.trimmed}
      />

      <Disclosure summary={t('preserve:phase.inDetail')}>
        {meta.steps.map((step) => (
          <p key={step}>
            {/* i18n: core message (the step's name) */}
            <strong className="text-foreground">{stepMeta(step).label}.</strong>{' '}
            {stepMeta(step).description}
          </p>
        ))}
      </Disclosure>
    </Section>
  );
}

/* ---- the user's turn: the expected hand-offs, calmly -------------------- */

interface YourTurnProps {
  readonly kind: PreservePrompt['kind'] | 'power-cycle-assert';
  /** The phase's name inside a sentence (`labelInSentence`). */
  readonly label: string;
  readonly busy: boolean;
  readonly connected: boolean;
  readonly onConnect: (() => void) | undefined;
  readonly onPowerCycled: () => void;
}

/** The ask's heading and body, in the language in use. */
function yourTurnCopy(kind: YourTurnProps['kind']): {
  readonly title: string;
  readonly body: string;
} {
  switch (kind) {
    case 'reconnect':
      return {
        title: t('preserve:yourTurn.reconnect.title'),
        body: t('preserve:yourTurn.reconnect.body'),
      };
    case 'replug':
      return {
        title: t('preserve:yourTurn.replug.title'),
        body: t('preserve:yourTurn.replug.body'),
      };
    case 'replug-before-restore':
      return {
        title: t('preserve:yourTurn.replugBeforeRestore.title'),
        body: t('preserve:yourTurn.replug.body'),
      };
    case 'power-cycle':
      return {
        title: t('preserve:yourTurn.powerCycle.title'),
        body: t('preserve:yourTurn.powerCycle.body'),
      };
    case 'power-cycle-assert':
      return {
        title: t('preserve:yourTurn.powerCycleAssert.title'),
        body: t('preserve:yourTurn.powerCycleAssert.body'),
      };
  }
}

function YourTurn({
  kind,
  label,
  busy,
  connected,
  onConnect,
  onPowerCycled,
}: YourTurnProps): ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);
  const copy = yourTurnCopy(kind);
  /* The ask can land while the user is reading elsewhere on the page: bring
   * it into view once, gently. */
  useEffect(() => {
    const node = ref.current;
    /* jsdom has no scrollIntoView; a real browser always does. */
    if (node !== null && 'scrollIntoView' in node) {
      node.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [kind]);

  return (
    <div ref={ref} role="status" aria-live="polite">
      <Alert tone="info">
        <p>
          <strong>{copy.title}</strong>
        </p>
        <p>{copy.body}</p>
        <Toolbar label={t('preserve:yourTurn.toolbar')} className="pt-1">
          {onConnect !== undefined && (
            <Button
              variant={kind === 'power-cycle-assert' && connected ? 'outline' : 'default'}
              onClick={onConnect}
            >
              <Plug />
              {t('app:connect.connect')}
            </Button>
          )}
          {kind === 'power-cycle-assert' && (
            <Button
              variant={connected ? 'default' : 'outline'}
              disabled={busy || !connected}
              onClick={onPowerCycled}
            >
              <Play />
              {t('preserve:yourTurn.replugged', { phase: label })}
            </Button>
          )}
        </Toolbar>
      </Alert>
    </div>
  );
}

/** The phase's core steps, each with its own status from the run state. */
function StepChips({
  steps,
  state,
}: {
  readonly steps: readonly PreserveStepId[];
  readonly state: PreserveRunState | null;
}): ReactElement {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label={t('preserve:phase.stepsLabel')}>
      {steps.map((step) => {
        const record = state?.steps[step];
        const Icon =
          record?.status === 'done' ? CircleCheck : record?.status === 'failed' ? CircleX : Circle;
        return (
          <li key={step} className="flex items-center gap-1.5 text-[0.8rem]">
            <Icon
              aria-hidden="true"
              className={
                record?.status === 'done'
                  ? 'size-3.5 text-ok'
                  : record?.status === 'failed'
                    ? 'size-3.5 text-warn'
                    : 'size-3.5 text-muted-foreground'
              }
            />
            {/* i18n: core message (the step's name) */}
            {stepMeta(step).label}
          </li>
        );
      })}
    </ul>
  );
}

/* ---- the banks: which one the next start enters, and the choice --------- */

/** The banks that carry a built patch, the chosen ones first, each group in
 *  A, B, R order. */
function patchedBanks(state: PreserveRunState): BankKey[] {
  const banks = state.banks;
  if (banks === undefined) return [];
  const targets = state.targets ?? [];
  const withPatch = BANK_KEYS.filter((key) => banks[key].patch !== undefined);
  return [
    ...withPatch.filter((key) => targets.includes(key)),
    ...withPatch.filter((key) => !targets.includes(key)),
  ];
}

/** A choice of banks by name, on its own (core's `bankChoiceWords`, capitalised, in English). */
function choiceName(choice: PreserveBankChoice): string {
  if (choice === 'next-start') return t('preserve:choice.nextStart');
  if (choice === 'all') return t('preserve:choice.all');
  return bankName(choice);
}

/** The choice as the menu names it: the banks it writes, or that it is not offered. */
function choiceOption(verdict: PreserveChoiceVerdict): string {
  const choice = choiceName(verdict.choice);
  if (verdict.banks === null) return t('preserve:choice.notOffered', { choice });
  if (verdict.choice === 'next-start' || verdict.choice === 'all') {
    return t('preserve:choice.withBanks', { choice, banks: bankList(verdict.banks) });
  }
  return choice;
}

interface BankChoiceProps {
  readonly state: PreserveRunState;
  readonly busy: boolean;
  readonly chooseBanks: PreservePanelApi['chooseBanks'];
}

/**
 * What step 02 learned about the banks — the boot-config word, the bank the
 * camera last started from, the bank the next start enters and why, each
 * bank — and the choice of the banks step 03 patches, with its warnings. The
 * same facts the CLI's plan prints.
 */
function BankChoice({ state, busy, chooseBanks }: BankChoiceProps): ReactElement | null {
  const [refusal, setRefusal] = useState<string | null>(null);
  const { boot, banks } = state;
  if (boot === undefined || banks === undefined) return null;
  const verdicts = preserveChoicesOf(state);
  const chosen = preserveChoiceOf(state, state.choice);
  const fixed = state.steps.commit !== undefined;
  const targets = state.targets;
  return (
    <Panel>
      <PanelTitle icon={<Layers />}>{t('preserve:banks.title')}</PanelTitle>
      {/* i18n: core message (the boot rule, the last and next start) */}
      <KeyValue
        rows={[
          [t('preserve:banks.bootWord'), `${hexUp(boot.word)} — ${boot.rule}`],
          [t('preserve:banks.lastStart'), lastStartWords(boot)],
          [t('preserve:banks.nextStart'), nextStartWords(boot)],
        ]}
      />
      <Table>
        <TableCaption>{t('preserve:banks.caption')}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[22%]">{t('preserve:banks.col.bank')}</TableHead>
            <TableHead>{t('preserve:banks.col.address')}</TableHead>
            <TableHead>{t('preserve:banks.col.holds')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {BANK_KEYS.map((key) => {
            const bank: PreserveBankRecord = banks[key];
            return (
              <TableRow key={key}>
                <TableRowHeader>
                  {bankName(key)}
                  {boot.nextStart === key && (
                    <>
                      {' '}
                      <Badge tone="accent">{t('preserve:banks.nextStartBadge')}</Badge>
                    </>
                  )}
                </TableRowHeader>
                <TableCell label={t('preserve:banks.col.address')}>
                  <code>{hexUp(bank.address, 8)}</code>
                </TableCell>
                <TableCell label={t('preserve:banks.col.holds')}>
                  {/* i18n: core message */}
                  {bankRecordWords(bank)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Field htmlFor="preserveBankChoice" label={t('preserve:banks.choiceLabel')}>
        <Select
          id="preserveBankChoice"
          value={state.choice}
          disabled={busy || fixed}
          onChange={(event) => {
            const value = event.target.value;
            if (isPreserveBankChoice(value)) setRefusal(chooseBanks(value));
          }}
        >
          {verdicts.map((verdict) => (
            <option key={verdict.choice} value={verdict.choice} disabled={verdict.banks === null}>
              {choiceOption(verdict)}
            </option>
          ))}
        </Select>
      </Field>
      <p className="text-[0.85rem]" data-testid="preserve-banks-to-write">
        {/* i18n: core message (the choice's `what`, bankChoiceWritesWords) */}
        {targets === undefined
          ? t('preserve:banks.notChosen', { what: chosen.what })
          : t('preserve:banks.writes', { what: bankChoiceWritesWords(chosen) })}
      </p>
      {fixed && <p className="text-[0.8rem] text-muted-foreground">{t('preserve:banks.fixed')}</p>}
      {verdicts.some((verdict) => verdict.banks === null) && (
        <ul className="list-disc pl-5 text-[0.8rem] text-muted-foreground">
          {verdicts
            .filter((verdict) => verdict.banks === null)
            .map((verdict) => (
              <li key={verdict.choice}>
                {/* i18n: core message (the verdict's `what`) */}
                {t('preserve:banks.notOfferedLine', {
                  choice: choiceName(verdict.choice),
                  why: verdict.what,
                })}
              </li>
            ))}
        </ul>
      )}
      {targets !== undefined &&
        chosen.warnings.map((warning) => (
          <Alert key={warning} tone="warn">
            {/* i18n: core message */}
            <p>{warning}</p>
          </Alert>
        ))}
      {refusal !== null && <p className="text-[0.8rem] font-medium text-warn">{refusal}</p>}
    </Panel>
  );
}

/* ---- the plan, printed from what the camera produced -------------------- */

function PlanFromState({ state }: { readonly state: PreserveRunState }): ReactElement {
  const keys = patchedBanks(state);
  const targets = state.targets ?? [];
  /* i18n: core message (the build's label or id) */
  const build = state.buildLabel ?? state.buildId ?? t('preserve:plan.yourCamera');
  return (
    <Disclosure
      summary={
        targets.length === 0
          ? t('preserve:plan.summaryNone', { build })
          : t('preserve:plan.summary', { build, banks: bankList(targets) })
      }
    >
      <p>{t('preserve:plan.intro')}</p>
      {/* i18n: core message (every row's value) */}
      <KeyValue
        rows={[
          [t('preserve:plan.build'), preserveBuildWords(state)],
          [t('preserve:plan.version'), state.expectedVersion ?? '?'],
          ...(state.stagedForm === undefined
            ? []
            : [[t('preserve:plan.written'), stagedFormWords(state.stagedForm)] as const]),
          ...(state.route === 'recovery-only' && state.routeNote != null
            ? ([[t('preserve:plan.route'), state.routeNote]] as const)
            : []),
          ...(state.restoreForm === undefined
            ? []
            : [[t('preserve:plan.restore'), restoreFormWords(state.restoreForm)] as const]),
          ...(state.capability === undefined
            ? []
            : [[t('preserve:plan.wholeFlash'), drainCapabilityWords(state.capability)] as const]),
        ]}
      />
      {keys.map((key) => (
        <BankPlan key={key} bank={key} state={state} chosen={targets.includes(key)} />
      ))}
      <p>{t('preserve:plan.outro')}</p>
    </Disclosure>
  );
}

/** One bank's patch: its image, the bytes that move, and whether the run writes it. */
function BankPlan({
  bank: key,
  state,
  chosen,
}: {
  readonly bank: BankKey;
  readonly state: PreserveRunState;
  readonly chosen: boolean;
}): ReactElement | null {
  const bank = state.banks?.[key];
  const patch = bank?.patch;
  if (bank === undefined || patch === undefined) return null;
  const derivation = bank.imageDerivation;
  return (
    <section
      aria-label={t('preserve:bankPlan.label', { bank: bankWords(key) })}
      className="space-y-2"
    >
      <h4 className="text-[0.85rem] font-semibold text-foreground">
        {chosen
          ? t('preserve:bankPlan.titleChosen', { bank: bankName(key) })
          : t('preserve:bankPlan.titleNotChosen', { bank: bankName(key) })}
      </h4>
      <KeyValue
        rows={[
          [
            t('preserve:bankPlan.source'),
            bank.slotReadShas === undefined
              ? t('preserve:bankPlan.sourceValue', { bank: bankWords(key) })
              : t('preserve:bankPlan.sourceTwoReads', {
                  bank: bankWords(key),
                  sha: bank.slotReadShas[0],
                }),
          ],
          ...(derivation === undefined
            ? []
            : [
                [
                  t('preserve:bankPlan.edit'),
                  /* i18n: core message (the edit's label) */
                  t('preserve:bankPlan.editValue', {
                    label: derivation.label,
                    id: derivation.id,
                    balance: hexUp(derivation.balanceWord),
                  }),
                ] as const,
              ]),
          [t('preserve:bankPlan.factorySha'), bank.imageSha256 ?? '?'],
          [t('preserve:bankPlan.patchedSha'), patch.patchedSha256],
          [t('preserve:bankPlan.diffCount'), String(patch.diffCount)],
          [
            t('preserve:bankPlan.staged'),
            t('preserve:bankPlan.stagedValue', {
              size: patch.stagedLength,
              count: patch.chunkCount,
            }),
          ],
          [
            t('preserve:bankPlan.rebalance'),
            derivation === undefined
              ? hexUp(patch.rebalanceWord)
              : t('preserve:bankPlan.rebalanceValue', {
                  word: hexUp(patch.rebalanceWord),
                  balance: hexUp(derivation.balanceWord),
                }),
          ],
        ]}
      />
      <Table>
        <TableCaption>{t('preserve:bankPlan.caption', { bank: bankWords(key) })}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">{t('preserve:bankPlan.col.what')}</TableHead>
            <TableHead>{t('preserve:bankPlan.col.offset')}</TableHead>
            <TableHead>{t('preserve:bankPlan.col.before')}</TableHead>
            <TableHead>{t('preserve:bankPlan.col.after')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patch.sites.map((site) => (
            <TableRow key={site.offset}>
              {/* i18n: core message (the patch site's name) */}
              <TableRowHeader>{patchSiteWords(site.name)}</TableRowHeader>
              <TableCell label={t('preserve:bankPlan.col.offset')}>
                <code>{hexUp(site.offset)}</code>
              </TableCell>
              <TableCell label={t('preserve:bankPlan.col.before')}>
                <code>{bytesHex(site.before)}</code>
              </TableCell>
              <TableCell label={t('preserve:bankPlan.col.after')}>
                <code>{bytesHex(site.after)}</code>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

/* ---- step 04's tail: the verify verdict --------------------------------- */

function VerifyVerdict({
  state,
}: {
  readonly state: PreserveRunState | null;
}): ReactElement | null {
  if (state === null) return null;
  const verify = state.verify;
  if (verify !== undefined) {
    return (
      <Alert tone="ok">
        <p>
          {verify.badWindows.length > 0
            ? rich('preserve:verify.okShort', {
                params: {
                  read: verify.windowsRead,
                  count: verify.diffBytes,
                  blocks: verify.badWindows.join(','),
                },
              })
            : rich('preserve:verify.ok', {
                params: { read: verify.windowsRead, count: verify.diffBytes },
              })}
        </p>
      </Alert>
    );
  }
  const failed = state.steps.verify;
  if (failed?.status === 'failed') {
    return (
      <Alert tone="err">
        <p>
          {/* i18n: core message (the step's recorded error) */}
          {rich('preserve:verify.failed', {
            params: { error: failed.error ?? t('preserve:unknownReason') },
          })}
        </p>
      </Alert>
    );
  }
  return null;
}

/* ---- the confirmation dialog -------------------------------------------- */

interface PhaseConfirmProps {
  readonly request: ConfirmRequest | null;
  readonly state: PreserveRunState | null;
  readonly onConfirm: (request: ConfirmRequest) => void;
  readonly onCancel: () => void;
}

/** The banks a write touches, in the order it writes them: the commit writes
 *  the bank the camera tries first last, the restore puts it back first. */
function writeOrder(state: PreserveRunState | null, phase: PreservePhaseId): BankKey[] {
  const targets = state?.targets;
  const word = state?.boot?.word;
  if (targets === undefined || word === undefined) return [];
  return phase === 'patch-dump' ? commitOrderOf(targets, word) : restoreOrderOf(targets, word);
}

function PhaseConfirm({ request, state, onConfirm, onCancel }: PhaseConfirmProps): ReactElement {
  const label = request === null ? '' : phaseMeta(request.phase).label;
  const writing = request !== null && request.phase === 'patch-dump' && !request.jump;
  const order = request === null ? [] : writeOrder(state, request.phase);
  const banks = order.length === 0 ? t('preserve:confirm.chosenBanks') : bankList(order);
  const inOrder = order.length > 1;
  const warnings =
    writing && state?.targets !== undefined ? preserveChoiceOf(state, state.choice).warnings : [];
  return (
    <AlertDialog
      open={request !== null}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <AlertDialogContent aria-describedby="preserve-confirm-what">
        <AlertDialogTitle>
          {request?.jump === true
            ? t('preserve:confirm.titleJump', { phase: label })
            : t('preserve:confirm.titleWrite', { phase: label, banks })}
        </AlertDialogTitle>
        <AlertDialogDescription id="preserve-confirm-what" className="space-y-2">
          {request?.jump === true ? (
            <>
              <span className="block">{t('preserve:confirm.jump')}</span>
              <span className="block">{t('preserve:confirm.jumpKeepPlugged')}</span>
            </>
          ) : (
            <>
              <span className="block">
                {writing
                  ? inOrder
                    ? t('preserve:confirm.patchInOrder', { banks })
                    : t('preserve:confirm.patch', { banks })
                  : inOrder
                    ? t('preserve:confirm.restoreInOrder', { banks })
                    : t('preserve:confirm.restore', { banks })}
              </span>
              {warnings.map((warning) => (
                <span key={warning} className="block font-medium text-warn">
                  {/* i18n: core message */}
                  {warning}
                </span>
              ))}
              <span className="block">{t('preserve:confirm.keepPlugged')}</span>
            </>
          )}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (request !== null) onConfirm(request);
            }}
          >
            {request?.jump === true
              ? t('preserve:confirm.yesJump')
              : t('preserve:confirm.yesWrite')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ---- the final screen --------------------------------------------------- */

interface VerifySummaryProps {
  readonly state: PreserveRunState;
  readonly check: DeliveredCheck | null;
  readonly busy: boolean;
  readonly onSave: () => void;
}

function blockList(addresses: readonly number[]): string {
  return addresses.map((address) => hexUp(address, 8)).join(', ');
}

/** The delivered image's own verdict: held against the backup taken before
 *  the first write, block by block — the comparison that can actually match.
 *  (Its sha is a whole 4 MiB part; the firmware image's sha is one decrypted
 *  slot, so those two never equal each other.) */
function deliveredVerdict(check: DeliveredCheck | null): ReactNode {
  if (check === null) return null;
  if (check.differing.length > 0) {
    return (
      <Badge tone="err">
        {t('preserve:summary.differs', {
          differing: check.differing.length,
          count: check.blocksCompared,
          blocks: blockList(check.differing),
        })}
      </Badge>
    );
  }
  return <Badge tone="ok">{t('preserve:summary.matches', { count: check.blocksCompared })}</Badge>;
}

function VerifySummary({ state, check, busy, onSave }: VerifySummaryProps): ReactElement {
  const done = preserveDoneWords(state);
  return (
    <Section
      id="preserve-done"
      tone="ok"
      /* i18n: core message (preserveDoneWords) */
      title={done.title}
      icon={<CircleCheck />}
      description={done.detail}
    >
      <Panel>
        <PanelTitle icon={<CircleCheck />}>{t('preserve:summary.proof')}</PanelTitle>
        <KeyValue
          rows={[
            [
              t('preserve:summary.complete'),
              <>
                {state.deliveredSha256 ?? t('preserve:summary.notProduced')}{' '}
                {deliveredVerdict(check)}
              </>,
            ],
            ...(check === null || check.onlyInFullDump.length === 0
              ? []
              : ([
                  [
                    t('preserve:summary.onlyInFull'),
                    t('preserve:summary.onlyInFullValue', {
                      count: check.onlyInFullDump.length,
                      blocks: blockList(check.onlyInFullDump),
                    }),
                  ],
                ] as const)),
            [
              t('preserve:summary.rawDump'),
              <>
                {state.rawDumpSha256 ?? t('preserve:summary.notProduced')}{' '}
                {state.rawDumpSha256 !== undefined && (
                  <Badge tone="neutral">{t('preserve:summary.rawDumpBadge')}</Badge>
                )}
              </>,
            ],
            ...(state.targets ?? []).map(
              (key) =>
                [
                  t('preserve:summary.image', { bank: bankWords(key) }),
                  state.banks?.[key].imageSha256 ?? t('preserve:summary.notProduced'),
                ] as const,
            ),
            /* i18n: core message (the verify step's result) */
            [t('preserve:summary.verify'), preserveStepResultWords(state, 'verify')],
          ]}
        />
      </Panel>
      <Toolbar label={t('preserve:summary.toolbar')}>
        <Button variant="default" disabled={busy} onClick={onSave}>
          <Save />
          {t('preserve:summary.download')}
        </Button>
      </Toolbar>
    </Section>
  );
}
