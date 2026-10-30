/**
 * The last step before "Make N FPS in every bank": every bank that offers the patch, the rate change of
 * each, the order they are written in (the bank the camera boots now last), how they are saved first (one
 * zip download of all of them), and the banks left as they are. One confirmation for all of them; the tick
 * a write asks for the booted bank or recovery R covers every bank that needs it (owner, 2026-10-26: a warm
 * reset can make the camera start another bank than the one patched).
 *
 * The plan is core's (`fpsEveryBankPlan`); this only states it. Nothing is sent by opening or confirming it.
 */

import { useRef, useState, type ReactElement } from 'react';
import { Gauge } from 'lucide-react';
import type { FpsEveryBankPlan, SlotKey } from '@seek-fw/core';
import { listAnd, listThen, t } from '@/i18n';
import { bankName } from '@/lib/bank-names';
import { Checkbox } from './ui/field';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { fpsOffNote } from './SlotTable';
import { needsRiskAck, type WriteRisk } from '@/hooks/useSlotsPanel';
import { backupDownloadNote } from '@/lib/backup-save';

export interface SlotFpsEveryConfirmProps {
  readonly open: boolean;
  /** Core's every-bank plan. Null only while the dialog is closed. */
  readonly plan: FpsEveryBankPlan | null;
  /** The build the camera reports. */
  readonly version: string | null;
  /** The write risk of each bank (the booted bank, recovery R). */
  readonly riskOf: (key: SlotKey) => WriteRisk;
  /** Core's sentence for the backup the patch saves first (`backupPlanText`). */
  readonly backupText: string;
  /** The order ends with the bank the camera boots now, after another bank (core's `everyBankBootedLast`). */
  readonly bootedLast: boolean;
  readonly onConfirm: (acknowledged: boolean) => void;
  readonly onCancel: () => void;
}

/** The title's rate: the one every offer names, or null when the banks differ. */
function commonRate(plan: FpsEveryBankPlan | null): number | null {
  const rates = new Set((plan?.offers ?? []).map((offer) => offer.plan.toHz));
  return rates.size === 1 ? ([...rates][0] ?? null) : null;
}

/** A bank's name and, when writing it asks for the tick, what it is. */
function namedWithRole(key: SlotKey, risk: WriteRisk): string {
  const bank = bankName(key);
  if (risk.booted && risk.recovery) return t('slots:fpsEvery.role.bootedRecovery', { bank });
  if (risk.booted) return t('slots:fpsEvery.role.booted', { bank });
  if (risk.recovery) return t('slots:fpsEvery.role.recovery', { bank });
  if (risk.bootUnnamed) return t('slots:fpsEvery.role.bootUnnamed', { bank });
  return bank;
}

export function SlotFpsEveryConfirm({
  open,
  plan,
  version,
  riskOf,
  backupText,
  bootedLast,
  onConfirm,
  onCancel,
}: SlotFpsEveryConfirmProps): ReactElement {
  const [acknowledged, setAcknowledged] = useState(false);
  /* Radix closes the dialog itself once the action fires; without this the close would also count as a cancel. */
  const confirmed = useRef(false);
  const offers = plan?.offers ?? [];
  const asking = offers.filter((offer) => needsRiskAck(riskOf(offer.key)));
  const needsAck = asking.length > 0;
  const confirmable = offers.length > 0 && (!needsAck || acknowledged);
  const rate = commonRate(plan);
  const count = offers.length;
  const order = listThen(offers.map((offer) => bankName(offer.key)));
  const others = (plan?.others ?? []).flatMap((other) => {
    const note = fpsOffNote(other.plan, true);
    return note === null ? [] : [t('slots:fpsEvery.other', { bank: bankName(other.key), note })];
  });

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        if (confirmed.current) {
          confirmed.current = false;
          return;
        }
        setAcknowledged(false);
        onCancel();
      }}
    >
      <AlertDialogContent aria-describedby="slot-fps-every-what">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-warn/12 text-warn"
          >
            <Gauge className="size-4" />
          </span>
          <AlertDialogTitle>
            {rate === null
              ? t('slots:fpsEvery.titleMixed', { count })
              : t('slots:fpsEvery.title', { hz: rate })}
          </AlertDialogTitle>
        </div>

        <AlertDialogDescription id="slot-fps-every-what" className="space-y-2">
          <span className="block">
            {t('slots:fpsEvery.intro', {
              count,
              version: version ?? t('slots:fpsConfirm.unknownVersion'),
            })}
          </span>
          {offers.map((offer) => (
            <span key={offer.key} className="block pl-3">
              {t('slots:fpsEvery.offer', {
                bank: namedWithRole(offer.key, riskOf(offer.key)),
                fromHz: offer.plan.fromHz,
                toHz: offer.plan.toHz,
                count: offer.plan.sites.length,
              })}
            </span>
          ))}
          {others.length > 0 && (
            <span className="block">
              {t('slots:fpsEvery.others', { others: others.join(' ') })}
            </span>
          )}
          <span className="block">
            {offers.length === 1
              ? t('slots:fpsEvery.orderOne', { bank: order })
              : bootedLast
                ? t('slots:fpsEvery.orderBootedLast', { order })
                : t('slots:fpsEvery.order', { order })}
          </span>
          <span className="block">{`${backupText} ${backupDownloadNote()}`}</span>
          <span className="block font-medium">{t('slots:fpsEvery.wayBack')}</span>
          <span className="block">{t('slots:fpsEvery.noReset')}</span>
        </AlertDialogDescription>

        {needsAck && (
          <label
            className="flex items-start gap-2.5 rounded-md border border-border/80 bg-sunken/60 px-3 py-2 text-[0.85rem] leading-snug"
            htmlFor="slot-fps-every-ack"
          >
            <Checkbox
              id="slot-fps-every-ack"
              checked={acknowledged}
              onChange={(event) => {
                setAcknowledged(event.target.checked);
              }}
            />
            <span>
              {t('slots:fpsEvery.ack', {
                banks: listAnd(asking.map((offer) => namedWithRole(offer.key, riskOf(offer.key)))),
              })}
            </span>
          </label>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
          <AlertDialogAction
            disabled={!confirmable}
            onClick={() => {
              confirmed.current = true;
              const sent = acknowledged;
              setAcknowledged(false);
              onConfirm(sent);
            }}
          >
            {t('slots:fpsEvery.confirm', { count })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
