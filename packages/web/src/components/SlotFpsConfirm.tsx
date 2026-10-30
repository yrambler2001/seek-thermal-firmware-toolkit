/**
 * The last step before a frame-rate patch is written: the bank, the build, the rate change,
 * how the bank is saved first (one zip download), and that the decrypted file in it is the way
 * back. A bank the camera boots now, or the recovery bank, adds the same tick a write needs.
 *
 * The plan is core's (`fpsPlanOfBank`); this only states it. Nothing is sent by opening or confirming it
 * here: confirming asks the page to run the patch, which saves the bank before it writes.
 */

import { useRef, useState, type ReactElement } from 'react';
import { Gauge } from 'lucide-react';
import { bootsNowMessage, type FpsBootWarning, type FpsPlan } from '@seek-fw/core';
import { coreText, coreTexts } from '@/lib/core-text';
import { nameText, useT, type NameValue } from '@/i18n';
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
import { needsRiskAck, type WriteRisk } from '@/hooks/useSlotsPanel';
import { backupDownloadNote } from '@/lib/backup-save';

export type FpsOffer = Extract<FpsPlan, { status: 'offer' }>;

export interface SlotFpsConfirmProps {
  readonly open: boolean;
  readonly slotName: NameValue;
  /** The offer the dialog states. Null only while the dialog is closed. */
  readonly offer: FpsOffer | null;
  /** The build the bank's image is, as the camera reports it. */
  readonly version: string | null;
  readonly risk: WriteRisk;
  /**
   * The boot warning for this bank (core's fpsBootWarningOf): the bank the camera runs, and that a patch in
   * this bank would not run. Null, or left out, when the patch takes effect. It states; it does not gate.
   */
  readonly bootWarning?: FpsBootWarning | null;
  /** Core's sentence for the backup the patch saves first (`backupPlanText`): which bank, and the zip's name. */
  readonly backupText: string;
  readonly onConfirm: (acknowledged: boolean) => void;
  readonly onCancel: () => void;
}

export function SlotFpsConfirm({
  open,
  slotName,
  offer,
  version,
  risk,
  bootWarning = null,
  backupText,
  onConfirm,
  onCancel,
}: SlotFpsConfirmProps): ReactElement {
  const { t } = useT();
  const [acknowledged, setAcknowledged] = useState(false);
  /* Radix closes the dialog itself once the action fires; without this the close would also count as a cancel. */
  const confirmed = useRef(false);
  const needsAck = needsRiskAck(risk);
  const confirmable = offer !== null && (!needsAck || acknowledged);
  const toHz = offer === null ? 0 : offer.toHz;
  const fromHz = offer === null ? 0 : offer.fromHz;
  const sites = offer === null ? 0 : offer.sites.length;

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
      <AlertDialogContent aria-describedby="slot-fps-confirm-what">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-warn/12 text-warn"
          >
            <Gauge className="size-4" />
          </span>
          <AlertDialogTitle>
            {t('slots:fpsConfirm.title', { bank: slotName, hz: toHz })}
          </AlertDialogTitle>
        </div>

        {risk.booted && (
          <p className="rounded-md border border-destructive/40 bg-destructive/8 px-3 py-2 text-[0.85rem] font-medium text-destructive">
            {t('slots:fpsConfirm.booted', {
              bootsNow: coreText(bootsNowMessage(nameText(slotName))),
            })}
          </p>
        )}
        {risk.recovery && (
          <p className="rounded-md border border-destructive/40 bg-destructive/8 px-3 py-2 text-[0.85rem] font-medium text-destructive">
            {t('slots:fpsConfirm.recovery', { bank: slotName })}
          </p>
        )}

        {bootWarning !== null && (
          <div className="space-y-1.5 rounded-md border border-warn/40 bg-warn/8 px-3 py-2 text-[0.85rem] text-foreground">
            {coreTexts(bootWarning.messages, bootWarning.paragraphs).map((paragraph) => (
              <p key={paragraph} className="m-0">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        <AlertDialogDescription id="slot-fps-confirm-what" className="space-y-2">
          <span className="block">
            {t('slots:fpsConfirm.what', {
              bank: slotName,
              version: version ?? t('slots:fpsConfirm.unknownVersion'),
              toHz,
              fromHz,
            })}
          </span>
          <span className="block">{t('slots:fpsConfirm.bytes', { count: sites })}</span>
          <span className="block">{`${backupText} ${backupDownloadNote()}`}</span>
          <span className="block font-medium">
            {t('slots:fpsConfirm.wayBack', { bank: slotName })}
          </span>
          <span className="block">{t('slots:fpsConfirm.noReset')}</span>
        </AlertDialogDescription>

        {needsAck && (
          <label
            className="flex items-start gap-2.5 rounded-md border border-border/80 bg-sunken/60 px-3 py-2 text-[0.85rem] leading-snug"
            htmlFor="slot-fps-ack"
          >
            <Checkbox
              id="slot-fps-ack"
              checked={acknowledged}
              onChange={(event) => {
                setAcknowledged(event.target.checked);
              }}
            />
            <span>
              {risk.booted
                ? t('slots:ack.booted')
                : risk.recovery
                  ? t('slots:ack.recovery')
                  : t('slots:fpsConfirm.ackUnnamed')}
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
            {t('slots:fpsConfirm.confirm', { bank: slotName })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
