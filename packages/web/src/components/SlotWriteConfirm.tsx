/**
 * The last thing between a camera and a bank's erase, for the slot page.
 *
 * It says the same words as the flash view's confirmation, in the same modal
 * (Radix's AlertDialog): focus starts on Cancel, Escape backs out, and nothing
 * but a deliberate press writes. A bank the camera boots now, or the recovery
 * bank, adds a checkbox that must be ticked before the confirm can be pressed,
 * and the tick is what goes to the write as `acknowledgeRisk`.
 */

import { useRef, useState, type ReactElement } from 'react';
import { Flame } from 'lucide-react';
import { bootsNowMessage } from '@seek-fw/core';
import { coreText } from '@/lib/core-text';
import { useT } from '@/i18n';
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

export interface SlotWriteConfirmProps {
  readonly open: boolean;
  /** What is written, in words: the file's name, or "Slot A's image" for a copy (`PendingSlotFlash.what`). */
  readonly what: string;
  readonly slotName: string;
  readonly slotAddress: string;
  readonly risk: WriteRisk;
  /** The bank holds no image: the write overwrites no firmware. */
  readonly targetEmpty?: boolean;
  /**
   * The plan's warnings, as "Read before writing" lists them and the CLI prints them (core's words: the
   * image's build, what the camera is expected to do with a 1.3.0.8 FF image, ...). Said again here, above
   * the confirm, because they are about what is written; the write stays allowed. TESTING.md 42.109: the
   * dialog had said the image's build alone, and a fixed FF paragraph instead of the plan's FF warning.
   */
  readonly warnings?: readonly string[];
  /** The key the image is written under and the bank it was derived from, when there is one. */
  readonly keyLine?: string | null;
  /** The backup zip's name as the plan shows it (the time still to come): the bank is saved there first. */
  readonly backupName: string;
  readonly onConfirm: (acknowledged: boolean) => void;
  readonly onCancel: () => void;
}

export function SlotWriteConfirm({
  open,
  what,
  slotName,
  slotAddress,
  risk,
  targetEmpty = false,
  warnings = [],
  keyLine,
  backupName,
  onConfirm,
  onCancel,
}: SlotWriteConfirmProps): ReactElement {
  const { t } = useT();
  const [acknowledged, setAcknowledged] = useState(false);
  /* Radix closes the dialog itself once the action fires. Without this the
   * close would report itself as a cancel too, and the caller would be told
   * both things happened. */
  const confirmed = useRef(false);
  const needsAck = needsRiskAck(risk);
  /* Off until the tick is in, when the write needs one. */
  const confirmable = !needsAck || acknowledged;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        if (confirmed.current) {
          confirmed.current = false;
          return;
        }
        /* The tick is per write: every way out of the dialog clears it. */
        setAcknowledged(false);
        onCancel();
      }}
    >
      <AlertDialogContent aria-describedby="slot-write-confirm-what">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/12 text-destructive"
          >
            <Flame className="size-4" />
          </span>
          <AlertDialogTitle>
            {t('slots:writeConfirm.title', { what, bank: slotName, address: slotAddress })}
          </AlertDialogTitle>
        </div>

        {risk.booted && (
          <p className="rounded-md border border-destructive/40 bg-destructive/8 px-3 py-2 text-[0.85rem] font-medium text-destructive">
            {t('slots:writeConfirm.booted', { bootsNow: coreText(bootsNowMessage(slotName)) })}
          </p>
        )}
        {risk.recovery && (
          <p className="rounded-md border border-destructive/40 bg-destructive/8 px-3 py-2 text-[0.85rem] font-medium text-destructive">
            {t('slots:writeConfirm.recovery', { bank: slotName })}
          </p>
        )}
        {!risk.booted && !risk.recovery && risk.bootUnnamed && (
          <p className="rounded-md border border-destructive/40 bg-destructive/8 px-3 py-2 text-[0.85rem] font-medium text-destructive">
            {t('slots:writeConfirm.bootUnnamed', { bank: slotName })}
          </p>
        )}

        {warnings.length > 0 && (
          <div
            id="slot-write-confirm-warnings"
            className="space-y-1.5 rounded-md border border-warn/40 bg-warn/8 px-3 py-2 text-[0.85rem] font-medium text-foreground"
          >
            {/* i18n: core message (the plan's warnings) */}
            {warnings.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}

        <AlertDialogDescription id="slot-write-confirm-what" className="space-y-2">
          {targetEmpty && (
            <span className="block font-medium">
              {t('slots:writeConfirm.empty', { bank: slotName })}
            </span>
          )}
          <span className="block">
            {targetEmpty
              ? t('slots:writeConfirm.eraseEmpty', { bank: slotName })
              : t('slots:writeConfirm.erase', { bank: slotName })}
          </span>
          {keyLine && <span className="block">{keyLine}</span>}
          <span className="block">
            {t('slots:writeConfirm.backup', { bank: slotName, file: backupName })}
          </span>
          <span className="block">{t('slots:writeConfirm.noReset')}</span>
          <span className="block">{t('slots:writeConfirm.noUsbRecovery')}</span>
        </AlertDialogDescription>

        {needsAck && (
          <label
            className="flex items-start gap-2.5 rounded-md border border-border/80 bg-sunken/60 px-3 py-2 text-[0.85rem] leading-snug"
            htmlFor="slot-write-ack"
          >
            <Checkbox
              id="slot-write-ack"
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
                  : t('slots:writeConfirm.ackUnnamed')}
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
            {t('slots:writeConfirm.confirm', { bank: slotName })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
