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
import { BACKUP_DOWNLOAD_NOTE } from '@/lib/backup-save';

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
  readonly onConfirm: (acknowledged: boolean) => void;
  readonly onCancel: () => void;
}

/** The title's rate: the one every offer names, or null when the banks differ. */
function commonRate(plan: FpsEveryBankPlan | null): number | null {
  const rates = new Set((plan?.offers ?? []).map((offer) => offer.plan.toHz));
  return rates.size === 1 ? ([...rates][0] ?? null) : null;
}

/** What a bank is, beside its name, when writing it asks for the tick. */
function roleOf(risk: WriteRisk): string {
  if (risk.booted && risk.recovery)
    return ' (the bank this camera boots now, and the recovery bank)';
  if (risk.booted) return ' (the bank this camera boots now)';
  if (risk.recovery) return ' (the recovery bank, the last-resort copy)';
  if (risk.bootUnnamed) return ' (the camera does not say which bank it boots)';
  return '';
}

export function SlotFpsEveryConfirm({
  open,
  plan,
  version,
  riskOf,
  backupText,
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
  const count = `${String(offers.length)} bank${offers.length === 1 ? '' : 's'}`;
  const order = offers.map((offer) => offer.name).join(', then ');
  const others = (plan?.others ?? []).flatMap((other) => {
    const note = fpsOffNote(other.plan, true);
    return note === null ? [] : [`${other.name}: ${note}`];
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
              ? `Patch the frame rate of ${count}?`
              : `Make every bank run at ${String(rate)} FPS?`}
          </AlertDialogTitle>
        </div>

        <AlertDialogDescription id="slot-fps-every-what" className="space-y-2">
          <span className="block">
            {`This patches ${count} that offer it, of firmware ${version ?? '(unknown)'}:`}
          </span>
          {offers.map((offer) => (
            <span key={offer.key} className="block pl-3">
              {`${offer.name}${roleOf(riskOf(offer.key))}: ${String(offer.plan.fromHz)} Hz to ${String(offer.plan.toHz)} Hz, ${String(offer.plan.sites.length)} byte(s) and the acceptance-sum word.`}
            </span>
          ))}
          {others.length > 0 && (
            <span className="block">{`Left as they are: ${others.join(' ')}`}</span>
          )}
          <span className="block">
            {`They are written in this order: ${order}. The bank the camera boots now goes last, so a failure stops before it. Each is read back before the next, and the first failure stops the rest.`}
          </span>
          <span className="block">{`${backupText} ${BACKUP_DOWNLOAD_NOTE}`}</span>
          <span className="block font-medium">
            The decrypted files in that zip are the way back: to undo the patch of a bank, write its
            file with &quot;Flash decrypted image&quot; on that bank.
          </span>
          <span className="block">
            No reset is sent. Unplug and replug the camera afterwards for the patched banks to take
            effect.
          </span>
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
              {`I understand this writes ${asking.map((offer) => `${offer.name}${roleOf(riskOf(offer.key))}`).join(' and ')}, and that a bad image can leave the camera unbootable.`}
            </span>
          </label>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!confirmable}
            onClick={() => {
              confirmed.current = true;
              const sent = acknowledged;
              setAcknowledged(false);
              onConfirm(sent);
            }}
          >
            {`Yes — patch ${count}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
