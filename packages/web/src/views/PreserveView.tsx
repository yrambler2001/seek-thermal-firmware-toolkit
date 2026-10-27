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
  bankChoiceWords,
  bankListWords,
  bankRecordWords,
  bankWordsOf,
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
        title="What to expect"
        icon={<ListChecks />}
        description={
          state === null
            ? 'Connect the camera, then start at step 02.'
            : `Run ${state.runId}${
                state.expectedVersion === undefined ? '' : ` — firmware ${state.expectedVersion}`
              }.`
        }
      >
        <Prose>
          <ul>
            <li>
              The camera <strong>restarts</strong> during each step. After a restart Chrome no
              longer recognises it (it has no USB serial number), so the page asks you to press{' '}
              <strong>Connect device</strong> and pick the camera again. That is the normal flow —
              the step carries on by itself once you do.
            </li>
            <li>There is no firmware file to pick: everything is read from the camera itself.</li>
            <li>
              The camera keeps its firmware in three <strong>banks</strong> (slot A, slot B and
              recovery R). Step 02 reads all three and works out which one the camera starts from
              next; the patch only works if that bank holds it. You choose the banks step 03 patches
              — by default the one the next start enters — and step 04 puts every one of them back.
            </li>
            <li>
              After every step your browser downloads a <strong>run file</strong> named after the
              run&apos;s start, the save time and the step it reached (
              <code>preserve-…-verified.zip</code>), with one folder per step inside. Keep the
              newest one — it lets you continue later.
            </li>
          </ul>
        </Prose>
        <Alert tone="warn">
          <p>
            <strong>Steps 03 and 04 write to the camera&apos;s flash</strong>, and each asks you to
            confirm first. While one of them runs, keep the camera plugged in (unless the page asks
            you to replug it) and the computer awake, ideally on mains power. An interrupted write
            leaves a camera that only a hardware programmer (SPI or SWD/J-Link) can fix.
          </p>
          <p>
            <strong>On a phone:</strong> before step 03, turn on airplane mode and switch off Wi-Fi
            and mobile data, so a call or a notification cannot pull the browser away mid-write —
            and keep the screen on. The page keeps working offline once it is open.
          </p>
        </Alert>
        {pastCommitLoud && (
          <Alert tone="err">
            <p>
              <strong>
                The write is not on record for this run, so the steps after it are shut.
              </strong>{' '}
              The camera may already be running the patched image (an interrupted write) or may not
              (the write never started) — the run file cannot prove which. Do not run the
              whole-flash read or the restore against a patched camera without the write on record;
              the way forward is step 03, whose check before the write reads the bank and refuses to
              write it blindly again. Only if that check has already refused with{' '}
              <em>already holds the patched bytes</em> does the jump apply — and it goes through its
              own dialog.
            </p>
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
        eyebrow="Optional — to continue a run later"
        title="Run file"
        icon={<Save />}
        description="The run's only record. It downloads by itself after every step (and after a step that stopped early); keep the newest one. To continue later, or after a problem, load it here and the page picks up where it left off."
      >
        {state !== null && preserve.lastSave !== null ? (
          <KeyValue
            rows={[
              ['Run', state.runId],
              ['File', preserve.lastSave.fileName],
              [
                'Last saved',
                `after ${preserve.lastSave.afterStep} — ${preserve.lastSave.at} (${String(
                  preserve.lastSave.bytes,
                )} B)`,
              ],
              ['Next step', state.nextStep],
            ]}
          />
        ) : (
          <Prose>
            <p>No run is active. Step 02 starts one, or load a run file here.</p>
          </Prose>
        )}

        <Toolbar label="Run file actions">
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
            Load a run file…
          </Button>
          <Button
            disabled={state === null || busy}
            onClick={() => {
              preserve.saveAgain();
            }}
          >
            <Save />
            Save the run file again
          </Button>
        </Toolbar>

        <RunPanel
          id="preserve-load"
          label="Resume"
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
  if (state === null) return 'Available after step 02 — it starts the run.';
  /* The run is over: nothing is waiting, so there is nothing to explain (TESTING.md 42.98). */
  if (state.nextStep === 'done') return null;
  const previous = PRESERVE_PHASES[index - 1];
  if (previous?.steps.some((step) => state.steps[step]?.status !== 'done')) {
    return `Available after step ${stepNumber(index - 1)} (${previous.label}).`;
  }
  const reason = gateReason(gate);
  return reason === null ? null : `Not ready yet — ${reason}.`;
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
    ? 'Go on to step 04: restore the banks'
    : jumpOnly
      ? 'Run past the unrecorded write'
      : phaseFailed
        ? `Try ${meta.label.toLowerCase()} again`
        : `Start ${meta.label.toLowerCase()}`;
  const notReady = phaseDone || plannedStop ? null : notReadyLine(gate, state, index);

  const status = active ? (
    <Badge tone="accent">
      <Loader2 className="animate-spin motion-reduce:animate-none" />
      Running
    </Badge>
  ) : phaseDone ? (
    <Badge tone="ok">
      <CircleCheck />
      Done
    </Badge>
  ) : plannedStop ? (
    <Badge tone="accent">Stopped as planned — the restore is next</Badge>
  ) : phaseFailed ? (
    <Badge tone="warn">Stopped — see the log</Badge>
  ) : upNext ? (
    <Badge tone="accent">Up next</Badge>
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
                writes to the camera
              </Badge>
            )}
            {status}
          </span>
        )
      }
    >
      <Toolbar label={`${meta.label} actions`}>
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
            Skip the write — start at the whole-flash read
          </Button>
        )}
        <Button variant="ghost" disabled={!active} onClick={preserve.cancel}>
          <CircleStop />
          Cancel
        </Button>
      </Toolbar>

      <Prose>
        <p>{meta.description}</p>
      </Prose>

      <StepChips steps={meta.steps} state={state} />

      {ask !== null && (
        <YourTurn
          kind={ask}
          label={meta.label}
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
        <p className="text-[0.8rem] text-muted-foreground">{PRESERVE_UNPATCHED_START_NEXT}</p>
      )}
      {gate.pastCommit && (
        <p className="text-[0.8rem] font-medium text-warn">
          Concerns the patched camera while the write is not on record — the camera may already be
          patched. See the note under &ldquo;What to expect&rdquo;.
        </p>
      )}
      {phase === 'restore-verify' &&
        gate.ok &&
        preserve.activePhase === null &&
        state !== null &&
        state.steps.commit?.status === 'done' &&
        state.steps.drain?.status !== 'done' && (
          <p className="text-[0.8rem] text-warn">
            The whole-flash read has not run — this step puts the camera back without it. Run step
            03 first unless the whole-flash read does not matter to you.
          </p>
        )}
      {active && writes && ask === null && (
        <p className="text-[0.8rem] text-muted-foreground">
          Keep the camera plugged in and the computer awake until this step finishes.
        </p>
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
        <label htmlFor={`preserve-phase-${phase}-details`}>Show details in the log</label>
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

      <Disclosure summary="What this step does, in detail">
        {meta.steps.map((step) => (
          <p key={step}>
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
  readonly label: string;
  readonly busy: boolean;
  readonly connected: boolean;
  readonly onConnect: (() => void) | undefined;
  readonly onPowerCycled: () => void;
}

const YOUR_TURN: Readonly<
  Record<YourTurnProps['kind'], { readonly title: string; readonly body: string }>
> = {
  reconnect: {
    title: 'Your turn: press Connect device and pick the camera.',
    body:
      'The camera restarted, as planned. Chrome cannot recognise it again by itself (it has no ' +
      'USB serial number), so it needs you to pick it once more. The step carries on as soon as ' +
      'you do.',
  },
  replug: {
    title: 'Your turn: unplug the camera, plug it back in, then press Connect device.',
    body:
      'This run’s patch was made before the reader fix, so the camera needs a fresh power-up ' +
      'before the restore. The run file is already saved.',
  },
  'replug-before-restore': {
    title: 'Before step 04: unplug the camera, plug it back in, then press Connect device.',
    body:
      'This run’s patch was made before the reader fix, so the camera needs a fresh power-up ' +
      'before the restore. The run file is already saved.',
  },
  'power-cycle': {
    title: 'Your turn: unplug the camera, plug it back in, press Connect device — then try again.',
    body:
      'The camera’s reader needs a fresh power-up before it can be read again. The run is still ' +
      'loaded here; nothing is lost.',
  },
  'power-cycle-assert': {
    title: 'Your turn: unplug the camera, plug it back in, press Connect device — then continue.',
    body:
      'The last backup attempt stopped, and the camera needs a fresh power-up before it runs ' +
      'again. The camera cannot report that by itself, so the button below tells the page you ' +
      'did it.',
  },
};

function YourTurn({
  kind,
  label,
  busy,
  connected,
  onConnect,
  onPowerCycled,
}: YourTurnProps): ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);
  const copy = YOUR_TURN[kind];
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
        <Toolbar label="Your turn" className="pt-1">
          {onConnect !== undefined && (
            <Button
              variant={kind === 'power-cycle-assert' && connected ? 'outline' : 'default'}
              onClick={onConnect}
            >
              <Plug />
              Connect device
            </Button>
          )}
          {kind === 'power-cycle-assert' && (
            <Button
              variant={connected ? 'default' : 'outline'}
              disabled={busy || !connected}
              onClick={onPowerCycled}
            >
              <Play />
              {`I replugged it — continue ${label.toLowerCase()}`}
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
    <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Progress">
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

function sentence(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

/** The choice as the menu names it: the banks it writes, or that it is not offered. */
function choiceOption(verdict: PreserveChoiceVerdict): string {
  const words = sentence(bankChoiceWords(verdict.choice));
  if (verdict.banks === null) return `${words} — not offered`;
  if (verdict.choice === 'next-start' || verdict.choice === 'all') {
    return `${words} — ${bankListWords(verdict.banks)}`;
  }
  return words;
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
      <PanelTitle icon={<Layers />}>Which banks step 03 patches</PanelTitle>
      <KeyValue
        rows={[
          ['Boot-config word', `${hexUp(boot.word)} — ${boot.rule}`],
          ['Last start', lastStartWords(boot)],
          ['Next start', nextStartWords(boot)],
        ]}
      />
      <Table>
        <TableCaption>The three firmware banks, as step 02 read them</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[22%]">Bank</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>What it holds</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {BANK_KEYS.map((key) => {
            const bank: PreserveBankRecord = banks[key];
            return (
              <TableRow key={key}>
                <TableRowHeader>
                  {sentence(bankWordsOf(key))}
                  {boot.nextStart === key && (
                    <>
                      {' '}
                      <Badge tone="accent">next start</Badge>
                    </>
                  )}
                </TableRowHeader>
                <TableCell label="Address">
                  <code>{hexUp(bank.address, 8)}</code>
                </TableCell>
                <TableCell label="What it holds">{bankRecordWords(bank)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Field htmlFor="preserveBankChoice" label="Banks to patch">
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
        {targets === undefined
          ? `No bank is chosen yet: ${chosen.what}. Choose a bank by name above.`
          : `Step 03 writes ${bankChoiceWritesWords(chosen)}.`}
      </p>
      {fixed && (
        <p className="text-[0.8rem] text-muted-foreground">
          The write has run, so the choice is fixed: step 04 puts back exactly these banks.
        </p>
      )}
      {verdicts.some((verdict) => verdict.banks === null) && (
        <ul className="list-disc pl-5 text-[0.8rem] text-muted-foreground">
          {verdicts
            .filter((verdict) => verdict.banks === null)
            .map((verdict) => (
              <li key={verdict.choice}>
                {sentence(bankChoiceWords(verdict.choice))}: not offered — {verdict.what}.
              </li>
            ))}
        </ul>
      )}
      {targets !== undefined &&
        chosen.warnings.map((warning) => (
          <Alert key={warning} tone="warn">
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
  return (
    <Disclosure
      summary={`The plan — ${state.buildLabel ?? state.buildId ?? 'your camera'}, ${
        targets.length === 0 ? 'no bank chosen yet' : `patches ${bankListWords(targets)}`
      }`}
    >
      <p>
        Printed from the camera&apos;s own bytes. Nothing is written until step 03 runs, and step 04
        puts every byte it writes back.
      </p>
      <KeyValue
        rows={[
          ['Build', preserveBuildWords(state)],
          ['Firmware version', state.expectedVersion ?? '?'],
          ...(state.stagedForm === undefined
            ? []
            : [['Written', stagedFormWords(state.stagedForm)] as const]),
          ...(state.route === 'recovery-only' && state.routeNote != null
            ? ([['Where it goes', state.routeNote]] as const)
            : []),
          ...(state.restoreForm === undefined
            ? []
            : [['Restore', restoreFormWords(state.restoreForm)] as const]),
          ...(state.capability === undefined
            ? []
            : [['Whole-flash read', drainCapabilityWords(state.capability)] as const]),
        ]}
      />
      {keys.map((key) => (
        <BankPlan key={key} bank={key} state={state} chosen={targets.includes(key)} />
      ))}
      <p>
        In the form the camera stores, the same bytes change and no others, so the camera&apos;s
        firmware changes by exactly this difference and nothing else.
      </p>
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
    <section aria-label={`The patch of ${bankWordsOf(key)}`} className="space-y-2">
      <h4 className="text-[0.85rem] font-semibold text-foreground">
        {sentence(bankWordsOf(key))} — {chosen ? 'written by this run' : 'not chosen'}
      </h4>
      <KeyValue
        rows={[
          [
            'Image source',
            bank.slotReadShas === undefined
              ? `${bankWordsOf(key)} as stored`
              : `${bankWordsOf(key)} as stored, two agreeing reads (sha256 ${bank.slotReadShas[0]})`,
          ],
          ...(derivation === undefined
            ? []
            : [
                [
                  'Image edit',
                  `${derivation.label} (${derivation.id}) on the factory image. Its balance, ` +
                    `${hexUp(derivation.balanceWord)}, is in the adjust word; the patch balances ` +
                    'on top of it, and step 04 puts the image back with the edit.',
                ] as const,
              ]),
          ['Factory plaintext sha256', bank.imageSha256 ?? '?'],
          ['Patched sha256', patch.patchedSha256],
          ['Bytes that move on the part', String(patch.diffCount)],
          [
            'Staged length',
            `${String(patch.stagedLength)} B in ${String(patch.chunkCount)} chunks`,
          ],
          [
            'Rebalance word',
            derivation === undefined
              ? hexUp(patch.rebalanceWord)
              : `${hexUp(patch.rebalanceWord)} (was ${hexUp(derivation.balanceWord)}, the ` +
                'edit’s balance)',
          ],
        ]}
      />
      <Table>
        <TableCaption>The exact bytes the patch moves in {bankWordsOf(key)}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">What it changes</TableHead>
            <TableHead>Offset</TableHead>
            <TableHead>Before</TableHead>
            <TableHead>After</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patch.sites.map((site) => (
            <TableRow key={site.offset}>
              <TableRowHeader>{patchSiteWords(site.name)}</TableRowHeader>
              <TableCell label="Offset">
                <code>{hexUp(site.offset)}</code>
              </TableCell>
              <TableCell label="Before">
                <code>{bytesHex(site.before)}</code>
              </TableCell>
              <TableCell label="After">
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
          <strong>Verified — a perfect match.</strong> After a fresh start the camera was read
          again: {String(verify.windowsRead)}/31 blocks, {String(verify.diffBytes)} differing
          byte(s)
          {verify.badWindows.length > 0 ? ` (short blocks: ${verify.badWindows.join(',')})` : ''}.
          Its flash is exactly what it was before the first write.
        </p>
      </Alert>
    );
  }
  const failed = state.steps.verify;
  if (failed?.status === 'failed') {
    return (
      <Alert tone="err">
        <p>
          <strong>The check found differences against the backup.</strong>{' '}
          {failed.error ?? 'unknown reason'}
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
  const banks = order.length === 0 ? 'the chosen banks' : bankListWords(order);
  const inOrder = order.length > 1 ? ', in that order' : '';
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
            ? `${label} — jump past the unrecorded write?`
            : `${label} — write to ${banks}?`}
        </AlertDialogTitle>
        <AlertDialogDescription id="preserve-confirm-what" className="space-y-2">
          {request?.jump === true ? (
            <>
              <span className="block">
                THE WRITE IS NOT ON RECORD for this run, and you are asserting that the writes
                landed without their checkpoints: the step starts past the write instead of writing
                again. The steps&apos; own checks still run — the version read, the bank checks —
                and a wrong guess costs a wasted whole-flash read, not a bricked camera.
              </span>
              <span className="block">
                Keep the camera plugged in and the computer awake until the step finishes.
              </span>
            </>
          ) : (
            <>
              <span className="block">
                {writing
                  ? `This writes a small patch into ${banks}${inOrder}` +
                    (order.length > 1 ? ' — the bank the camera tries first goes last' : '') +
                    '. Step 04 puts the originals back. The whole-flash read that follows only reads.'
                  : `This writes your original firmware back into ${banks}${inOrder}` +
                    (order.length > 1 ? ' — the bank the camera tries first goes first' : '') +
                    '.'}
              </span>
              {warnings.map((warning) => (
                <span key={warning} className="block font-medium text-warn">
                  {warning}
                </span>
              ))}
              <span className="block">
                Keep the camera plugged in and the computer awake while it writes — an interrupted
                write leaves a camera that only a hardware programmer (SPI or SWD/J-Link) can fix.
                On a phone, airplane mode on and the screen kept on. The camera then restarts; when
                the page asks, press Connect device and pick it again. That is expected.
              </span>
            </>
          )}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (request !== null) onConfirm(request);
            }}
          >
            {request?.jump === true ? 'Yes — jump past the write' : 'Yes — write to the camera'}
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
        {`differs from the backup in ${String(check.differing.length)} of ` +
          `${String(check.blocksCompared)} blocks: ${blockList(check.differing)}`}
      </Badge>
    );
  }
  return (
    <Badge tone="ok">{`matches the backup on all ${String(check.blocksCompared)} blocks`}</Badge>
  );
}

function VerifySummary({ state, check, busy, onSave }: VerifySummaryProps): ReactElement {
  const done = preserveDoneWords(state);
  return (
    <Section
      id="preserve-done"
      tone="ok"
      title={done.title}
      icon={<CircleCheck />}
      description={done.detail}
    >
      <Panel>
        <PanelTitle icon={<CircleCheck />}>The proof</PanelTitle>
        <KeyValue
          rows={[
            [
              'Complete image (4 MiB)',
              <>
                {state.deliveredSha256 ?? 'not produced'} {deliveredVerdict(check)}
              </>,
            ],
            ...(check === null || check.onlyInFullDump.length === 0
              ? []
              : ([
                  [
                    'Only in the whole-flash read',
                    `${String(check.onlyInFullDump.length)} block(s) a stock read cannot reach: ` +
                      blockList(check.onlyInFullDump),
                  ],
                ] as const)),
            [
              'Whole-flash read, as read',
              <>
                {state.rawDumpSha256 ?? 'not produced'}{' '}
                {state.rawDumpSha256 !== undefined && (
                  <Badge tone="neutral">the same, with the patch still in</Badge>
                )}
              </>,
            ],
            ...(state.targets ?? []).map(
              (key) =>
                [
                  `Firmware image (decrypted, ${bankWordsOf(key)})`,
                  state.banks?.[key].imageSha256 ?? 'not produced',
                ] as const,
            ),
            ['Verify', preserveStepResultWords(state, 'verify')],
          ]}
        />
      </Panel>
      <Toolbar label="Archive actions">
        <Button variant="default" disabled={busy} onClick={onSave}>
          <Save />
          Download the full archive (run file)
        </Button>
      </Toolbar>
    </Section>
  );
}
