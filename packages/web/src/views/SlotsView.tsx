/**
 * The firmware-slot page: the camera's three banks, A, B and the recovery bank
 * R, what each holds, whether the camera boots it, and what this build allows
 * the page to do to it.
 *
 * Reading and dumping change nothing in the camera. A flash button prepares a
 * write, shows exactly what it would do, and asks before it sends a byte.
 */

import { useMemo, useState, type ReactElement } from 'react';
import { CircleStop, Gauge, Layers, ScanSearch, Send, ShieldAlert } from 'lucide-react';
import {
  everyBankBootedLast,
  backupFileNameShown,
  fpsBootWarningOf,
  hexUp,
  type FpsEveryBankResult,
  type FpsPatchResult,
  type SlotInputKind,
  type SlotKey,
  type SlotsReport,
  type WriteBackup,
  backupPlanMessage,
  bankParam,
  derivedKeyLineMessage,
  restoreReadBackMessage,
  capabilityNoteMessage,
} from '@seek-fw/core';
import { coreText, coreTexts } from '@/lib/core-text';
import { DeviceInfoPanel } from '@/components/DeviceInfoPanel';
import { Prose } from '@/components/Prose';
import { RunPanel } from '@/components/RunPanel';
import { Section } from '@/components/Section';
import { SlotFlashPreview } from '@/components/SlotFlashPreview';
import { SlotFpsConfirm, type FpsOffer } from '@/components/SlotFpsConfirm';
import { SlotFpsEveryConfirm } from '@/components/SlotFpsEveryConfirm';
import { SlotTable } from '@/components/SlotTable';
import { SlotWriteConfirm } from '@/components/SlotWriteConfirm';
import { SlotWriteKeys, writeKeysVerdictOf } from '@/components/SlotWriteKeys';
import { UnlockNote } from '@/components/UnlockNote';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Toolbar } from '@/components/ui/toolbar';
import {
  copyLabel,
  slotActionGate,
  writeRisk,
  type SlotFlashOutcome,
  type SlotsPanelApi,
} from '@/hooks/useSlotsPanel';
import { listComma, listThen, t, useT, type Translate } from '@/i18n';
import { backupDownloadNote } from '@/lib/backup-save';
import { bankName, bankWords } from '@/lib/bank-names';
import type { Refusal } from '@/lib/identify';

export interface SlotsViewProps {
  readonly slots: SlotsPanelApi;
  readonly connected: boolean;
  readonly busy: boolean;
}

function viewOf(report: SlotsReport, key: SlotKey) {
  return report.slots.find((view) => view.entry.key === key) ?? null;
}

/** The result panel's first line: the bank, what was written, and the read-back's verdict. */
function outcomeTitle(bank: string, what: string, verified: boolean | null): string {
  if (verified === true) return t('slots:outcome.verified', { bank, what });
  if (verified === false) return t('slots:outcome.mismatch', { bank, what });
  /* The page always asks for the read-back. Null means core took it but had no
   * expected image to compare it with (a bank the device re-encrypts), which is
   * not the same as verification being switched off. Its notes say why. */
  return t('slots:outcome.notCompared', { bank, what });
}

/**
 * What a frame-rate patch did, on screen until the next run. The rate it claims is the table's, and the
 * read-back is the check that only the planned bytes changed. It says what was NOT proven: the rate.
 */
/** The zip a write saved first, in the result panel: its name, and where to look for it. */
export function backupLine(backup: WriteBackup, translate: Translate = t): string {
  return [
    translate('slots:outcome.savedFirst', { file: backup.fileName }),
    backup.banks.length > 1
      ? translate('slots:outcome.wayBackMany')
      : translate('slots:outcome.wayBackOne'),
    translate('slots:outcome.checkDownloads'),
  ].join(' ');
}

/** "The read-back differs … only at the N planned byte(s) …", or why it does not, for one patched bank. */
function readBackLine(result: FpsPatchResult, every: boolean): string {
  const { readBack } = result;
  if (!readBack.checked) {
    return every ? t('slots:fpsEveryOutcome.notTaken') : t('slots:fpsOutcome.notTaken');
  }
  if (readBack.ok === true) {
    return every
      ? t('slots:fpsEveryOutcome.readBackOk', { count: result.changed.length })
      : t('slots:fpsOutcome.readBackOk', { count: result.changed.length });
  }
  return t('slots:fpsOutcome.readBackBad', {
    unexpected: readBack.unexpected.length,
    count: readBack.missing.length,
  });
}

/** "Slot A — patched from 9 Hz to 30 Hz (firmware 1.0.3.0)." */
function patchedLine(result: FpsPatchResult): string {
  return t('slots:fpsOutcome.title', {
    bank: bankName(result.key),
    fromHz: result.fromHz,
    toHz: result.toHz,
    version: result.patch.version,
  });
}

function FpsOutcomePanel({ result }: { readonly result: FpsPatchResult }): ReactElement {
  const { rich } = useT();
  const { backup, readBack } = result;
  const tone = readBack.ok === true && result.written.verified !== false ? 'ok' : 'err';
  return (
    <Alert tone={tone} className="mt-3">
      <p>
        <strong>{patchedLine(result)}</strong>
      </p>
      <p>{readBackLine(result, false)}</p>
      <p>{backupLine(backup)}</p>
      <p>{rich('slots:outcome.replugShort')}</p>
    </Alert>
  );
}

function OutcomePanel({ outcome }: { readonly outcome: SlotFlashOutcome }): ReactElement {
  const { rich } = useT();
  const { key, result } = outcome;
  const what = outcome.whatOnPage?.() ?? outcome.what;
  const tone = result.verified === true ? 'ok' : result.verified === false ? 'err' : 'warn';
  return (
    <Alert tone={tone} className="mt-3">
      <p>
        <strong>{outcomeTitle(bankName(key), what, result.verified)}</strong>
      </p>
      <p>{t('slots:outcome.commitStatus', { status: hexUp(result.commitStatus, 4) })}</p>
      {outcome.targetEmpty === true && (
        <p>{t('slots:outcome.wasEmpty', { bank: bankName(key) })}</p>
      )}
      {outcome.restore !== null && (
        <p>{coreText(restoreReadBackMessage(outcome.restore, bankParam(key, 'name')))}</p>
      )}
      <p>{backupLine(outcome.backup)}</p>
      <p>
        {result.verified === true
          ? t('slots:outcome.provenVerified')
          : t('slots:outcome.provenCommitted')}
      </p>
      <p>{rich('slots:outcome.replug')}</p>
      {result.notes.length > 0 && (
        <ul>
          {coreTexts(result.noteMessages, result.notes).map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </Alert>
  );
}

/** What "Make N FPS in every bank" did: each bank's result in the order written, and where it stopped. */
function FpsEveryOutcomePanel({ result }: { readonly result: FpsEveryBankResult }): ReactElement {
  const { rich } = useT();
  const ok =
    result.stopped === null &&
    result.results.every((one) => one.readBack.ok === true && one.written.verified !== false);
  return (
    <Alert tone={ok ? 'ok' : 'err'} className="mt-3">
      <p>
        <strong>
          {t('slots:fpsEveryOutcome.title', {
            done: result.results.length,
            count: result.order.length,
            order: listComma(result.order.map((key) => bankWords(key))),
          })}
        </strong>
      </p>
      <ul>
        {result.results.map((one) => (
          <li key={one.key}>{`${patchedLine(one)} ${readBackLine(one, true)}`}</li>
        ))}
      </ul>
      {result.stopped !== null && (
        <p>
          {t('slots:fpsEveryOutcome.stopped', {
            reason: coreText(result.stopped.reasonMessage ?? result.stopped.reason),
          })}
        </p>
      )}
      {result.unwritten.length > 0 && (
        <p>
          {t('slots:fpsEveryOutcome.notWritten', {
            banks: listComma(result.unwritten.map((key) => bankWords(key))),
          })}
        </p>
      )}
      <p>{backupLine(result.backup)}</p>
      <p>{rich('slots:outcome.replugShort')}</p>
    </Alert>
  );
}

/**
 * The refusal the page shows. A camera that does not give a usable firmware
 * version is not a refused write: the page cannot tell which build it runs, and
 * it says so, and says what it covers. It does not say the camera "did not
 * report its version" and send the user to unplug it, which is the advice for a
 * camera that is still starting up, so that advice is kept only as the secondary
 * hint. The toolkit's own sentence stays in the run log, where its detail is.
 */
function RefusalAlert({ refusal }: { readonly refusal: Refusal }): ReactElement {
  if (refusal.code === 'device/version-unknown') {
    return (
      <Alert tone="err">
        <p>
          <strong>{t('slots:refusal.notIdentified.title')}</strong>
        </p>
        <p>{t('slots:refusal.notIdentified.body', { minVersion: '0.8.0.0' })}</p>
        {refusal.hint !== null && (
          <p>{t('slots:refusal.notIdentified.hint', { hint: refusal.hint })}</p>
        )}
      </Alert>
    );
  }
  return (
    <Alert tone="err">
      <p>
        <strong>{t('slots:refusal.title')}</strong>
      </p>
      {/* i18n: core message (the refusal) */}
      <p>{refusal.message}</p>
      {refusal.hint !== null && <p>{refusal.hint}</p>}
    </Alert>
  );
}

/**
 * "Make N FPS in every bank": beside the per-bank buttons, one action for every bank that offers the patch.
 * It is off only where a bank's own write is off (the same gate as the bank's "Make N FPS"), with the reason.
 */
function EveryBankAction({
  plan,
  report,
  connected,
  busy,
  onOpen,
}: {
  readonly plan: NonNullable<ReturnType<SlotsPanelApi['planEveryFps']>>;
  readonly report: SlotsReport;
  readonly connected: boolean;
  readonly busy: boolean;
  readonly onOpen: () => void;
}): ReactElement {
  const rates = new Set(plan.offers.map((offer) => offer.plan.toHz));
  const label =
    rates.size === 1
      ? t('slots:everyBank.make', { hz: [...rates][0] ?? 0 })
      : t('slots:everyBank.faster');
  const gates = plan.offers.map((offer) => {
    const view = viewOf(report, offer.key);
    return view === null
      ? { enabled: false, reason: t('slots:gate.noSuchBank') }
      : slotActionGate({ entry: view.entry, view, action: 'flash-plain', connected, busy });
  });
  const off = gates.find((gate) => !gate.enabled) ?? null;
  const order = listThen(plan.offers.map((offer) => bankName(offer.key)));
  return (
    <Toolbar label={t('slots:everyBank.toolbar')} className="mt-3">
      <Button variant="outline" disabled={off !== null} onClick={onOpen}>
        <Gauge />
        {label}
      </Button>
      <span className="text-[0.8rem] leading-snug text-muted-foreground">
        {off?.reason ??
          (everyBankBootedLast(report, plan.order)
            ? t('slots:everyBank.noteBootedLast', { order })
            : t('slots:everyBank.note', { order }))}
      </span>
    </Toolbar>
  );
}

export function SlotsView({ slots, connected, busy }: SlotsViewProps): ReactElement {
  const { rich } = useT();
  const [confirming, setConfirming] = useState(false);
  /* The bank whose frame-rate patch the person is confirming, or null when no dialog is open. */
  const [fpsKey, setFpsKey] = useState<SlotKey | null>(null);
  /* The every-bank patch's confirmation is open. */
  const [fpsEvery, setFpsEvery] = useState(false);
  const { plan, report, refusal, pending, outcome, fpsOutcome, fpsEveryOutcome, reading, writing } =
    slots;
  const everyPlan = slots.planEveryFps();
  const fpsPlan = fpsKey === null ? null : slots.planFps(fpsKey);
  const fpsOffer: FpsOffer | null = fpsPlan !== null && fpsPlan.status === 'offer' ? fpsPlan : null;
  const fpsView = fpsKey === null || report === null ? null : viewOf(report, fpsKey);
  /* The boot warning on the page: a patched bank the camera does not run. Core decides it (boot-choice.ts). */
  const bootWarning = useMemo(() => (report === null ? null : fpsBootWarningOf(report)), [report]);
  /* The same warning for the bank the person is about to patch, which then counts as holding the patch. */
  const dialogBootWarning = useMemo(
    () =>
      report === null || fpsKey === null ? null : fpsBootWarningOf(report, { target: fpsKey }),
    [report, fpsKey],
  );
  const unsupported =
    plan !== null && !plan.supportedBuild.supported ? plan.supportedBuild.reason : null;
  const pendingView = pending === null ? null : viewOf(pending.report, pending.key);

  return (
    <>
      <Section
        id="slots"
        step="2"
        title={t('slots:section.title')}
        icon={<Layers />}
        aside={
          <Badge tone="err">
            <ShieldAlert />
            {t('slots:section.badge')}
          </Badge>
        }
        description={t('slots:section.description', {
          a: bankWords('a'),
          b: bankWords('b'),
          r: bankWords('r'),
        })}
      >
        <Alert tone="err">
          <p>{rich('slots:section.danger')}</p>
        </Alert>

        <Toolbar label={t('slots:actions.toolbar')}>
          <Button
            variant="default"
            disabled={!connected || busy}
            onClick={() => {
              void slots.readSlots();
            }}
          >
            <ScanSearch />
            {t('slots:actions.read')}
          </Button>
          <Button variant="ghost" disabled={!reading && !writing} onClick={slots.cancel}>
            <CircleStop />
            {t('common:cancel')}
          </Button>
        </Toolbar>

        <RunPanel
          id="slotsrun"
          label={t('slots:run.label')}
          tone={writing ? 'danger' : 'default'}
          progress={slots.reporter.progress}
          lines={slots.reporter.lines}
          trimmed={slots.reporter.trimmed}
        />

        {refusal !== null && <RefusalAlert refusal={refusal} />}

        {unsupported !== null && (
          <Alert tone="err">
            <p>
              <strong>{t('slots:unsupported.title')}</strong>
            </p>
            {/* i18n: core message (the build's support reason) */}
            <p>{unsupported}</p>
          </Alert>
        )}

        {plan !== null && plan.notes.length > 0 && (
          <Prose>
            <ul>
              {plan.notes.map((note) => (
                <li key={note}>{coreText(capabilityNoteMessage(note))}</li>
              ))}
            </ul>
          </Prose>
        )}

        {report !== null && (
          <>
            <DeviceInfoPanel state={report.state} />
            <SlotWriteKeys verdict={writeKeysVerdictOf(report)} />
            {bootWarning !== null && (
              <Alert tone="warn">
                {coreTexts(bootWarning.messages, bootWarning.paragraphs).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </Alert>
            )}
            <SlotTable
              report={report}
              connected={connected}
              busy={busy}
              onDump={(key) => {
                void slots.dump(key);
              }}
              onPickFile={(key: SlotKey, kind: SlotInputKind, file: File) => {
                setConfirming(false);
                void slots.pickFile(key, kind, file);
              }}
              onCopy={(from: SlotKey, to: SlotKey) => {
                setConfirming(false);
                void slots.copyBank(from, to);
              }}
              onPickRestore={(key: SlotKey, file: File) => {
                setConfirming(false);
                void slots.pickRestore(key, file);
              }}
              planFps={slots.planFps}
              onPatchFps={(key: SlotKey) => {
                setConfirming(false);
                setFpsKey(key);
              }}
            />
            {everyPlan !== null && everyPlan.order.length > 0 && (
              <EveryBankAction
                plan={everyPlan}
                report={report}
                connected={connected}
                busy={busy}
                onOpen={() => {
                  setConfirming(false);
                  setFpsEvery(true);
                }}
              />
            )}
          </>
        )}

        {report === null && unsupported === null && refusal === null && (
          <Prose>
            <p>{connected ? t('slots:empty.connected') : t('slots:empty.disconnected')}</p>
          </Prose>
        )}

        {pending !== null && pendingView !== null && (
          <SlotFlashPreview
            slotName={bankName(pending.key)}
            address={pendingView.entry.address}
            what={pending.whatOnPage?.() ?? pending.what}
            kind={pending.kind}
            plan={pending.plan}
            busy={busy}
            targetEmpty={pending.plan.targetEmpty === true}
            source={pending.source}
            backupText={`${coreText(backupPlanMessage(pending.report, [pending.key], pending.action))} ${backupDownloadNote()}`}
            onWrite={() => {
              setConfirming(true);
            }}
            onDiscard={slots.discardPending}
          />
        )}

        {pending !== null && pendingView !== null && (
          <SlotWriteConfirm
            open={confirming}
            what={pending.whatOnPage?.() ?? pending.what}
            slotName={bankName(pending.key)}
            slotAddress={hexUp(pendingView.entry.address)}
            risk={writeRisk(pending.report, pending.key)}
            targetEmpty={pending.plan.targetEmpty === true}
            warnings={coreTexts(pending.plan.warningMessages, pending.plan.warnings)}
            keyLine={
              pending.plan.derivedFrom
                ? t('slots:writeConfirm.keyLine', {
                    key: coreText(
                      derivedKeyLineMessage(
                        pending.plan.derivedFrom,
                        bankParam(pending.plan.derivedFrom.bank),
                      ),
                    ),
                  })
                : null
            }
            backupName={backupFileNameShown(pending.report, [pending.key], pending.action)}
            onCancel={() => {
              setConfirming(false);
            }}
            onConfirm={(acknowledged) => {
              setConfirming(false);
              void slots.write(acknowledged);
            }}
          />
        )}

        {fpsKey !== null && fpsView !== null && (
          <SlotFpsConfirm
            open={fpsOffer !== null}
            slotName={bankName(fpsKey)}
            offer={fpsOffer}
            version={report?.state.version ?? null}
            risk={
              report === null
                ? { booted: false, recovery: false, bootUnnamed: false }
                : writeRisk(report, fpsKey)
            }
            bootWarning={dialogBootWarning}
            backupText={
              report === null
                ? ''
                : coreText(backupPlanMessage(report, [fpsKey], { kind: 'fps-patch' }))
            }
            onConfirm={(acknowledged) => {
              const key = fpsKey;
              setFpsKey(null);
              void slots.patchFps(key, acknowledged);
            }}
            onCancel={() => {
              setFpsKey(null);
            }}
          />
        )}

        {fpsEvery && report !== null && (
          <SlotFpsEveryConfirm
            open={everyPlan !== null && everyPlan.order.length > 0}
            plan={everyPlan}
            version={report.state.version}
            riskOf={(key) => writeRisk(report, key)}
            bootedLast={everyPlan !== null && everyBankBootedLast(report, everyPlan.order)}
            backupText={
              everyPlan === null
                ? ''
                : coreText(
                    backupPlanMessage(report, everyPlan.order, { kind: 'fps-patch-every-bank' }),
                  )
            }
            onConfirm={(acknowledged) => {
              setFpsEvery(false);
              void slots.patchEveryFps(acknowledged);
            }}
            onCancel={() => {
              setFpsEvery(false);
            }}
          />
        )}

        {outcome !== null && <OutcomePanel outcome={outcome} />}
        {fpsOutcome !== null && <FpsOutcomePanel result={fpsOutcome} />}
        {fpsEveryOutcome !== null && <FpsEveryOutcomePanel result={fpsEveryOutcome} />}
        {slots.unlockNote && <UnlockNote />}
      </Section>

      <Section id="slots-how" title={t('slots:how.title')} icon={<Send />}>
        <Prose>
          <p>{rich('slots:how.read', { params: { minVersion: '0.8.0.0' } })}</p>
          <p>{rich('slots:how.flash')}</p>
          <p>{rich('slots:how.ff', { params: { letterR: 'R', b: bankWords('b') } })}</p>
          <p>
            {rich('slots:how.copy', {
              params: { copyA: copyLabel('a'), copyB: copyLabel('b'), copyR: copyLabel('r') },
            })}
          </p>
          <p>{rich('slots:how.fps')}</p>
          <p>
            {rich('slots:how.backup', {
              params: {
                example: 'seek_backup_<time>_<serial>_v1.0.3.0_bank-B_before-copy-from-A.zip',
              },
            })}
          </p>
          <p>{rich('slots:how.write', { params: { address: '0x14000000' } })}</p>
        </Prose>
      </Section>
    </>
  );
}
