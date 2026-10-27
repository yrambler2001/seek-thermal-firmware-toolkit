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
import { bootsNowOf } from '@seek-fw/core';
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
  /** What is written, in words: the file's name, or "Bank A's image" for a copy (`PendingSlotFlash.what`). */
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
          <AlertDialogTitle>{`Write ${what} to ${slotName} at ${slotAddress}?`}</AlertDialogTitle>
        </div>

        {risk.booted && (
          <p className="rounded-md border border-destructive/40 bg-destructive/8 px-3 py-2 text-[0.85rem] font-medium text-destructive">
            {`${bootsNowOf(slotName)}. Writing it replaces the firmware the camera is running now. If the new image does not run, the camera may not boot at all.`}
          </p>
        )}
        {risk.recovery && (
          <p className="rounded-md border border-destructive/40 bg-destructive/8 px-3 py-2 text-[0.85rem] font-medium text-destructive">
            {`${slotName} is the recovery bank, the last-resort copy the bootloader falls back to. Writing it leaves the camera without that copy until it is restored.`}
          </p>
        )}
        {!risk.booted && !risk.recovery && risk.bootUnnamed && (
          <p className="rounded-md border border-destructive/40 bg-destructive/8 px-3 py-2 text-[0.85rem] font-medium text-destructive">
            {`The camera does not say which bank it boots, so ${slotName} is treated as the bank it boots now. Writing it can replace the firmware the camera is running.`}
          </p>
        )}

        {warnings.length > 0 && (
          <div
            id="slot-write-confirm-warnings"
            className="space-y-1.5 rounded-md border border-warn/40 bg-warn/8 px-3 py-2 text-[0.85rem] font-medium text-foreground"
          >
            {warnings.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}

        <AlertDialogDescription id="slot-write-confirm-what" className="space-y-2">
          {targetEmpty && (
            <span className="block font-medium">
              {`${slotName} is empty: it holds no image, so no firmware is overwritten.`}
            </span>
          )}
          <span className="block">
            {targetEmpty
              ? `The write still erases the 64 KiB block of the camera's flash at ${slotName} (already blank) and programs it.`
              : `This erases a 64 KiB block of the camera's flash and programs it at ${slotName}.`}
          </span>
          {keyLine && <span className="block">{keyLine}</span>}
          <span className="block">
            {`Before anything is sent, ${slotName} is read again and saved as one zip download: ${backupName}. Check your downloads folder for it.`}
          </span>
          <span className="block">
            No reset is sent. Unplug and replug the camera afterwards for the bank to take effect.
          </span>
          <span className="block">
            If the image does not run, the camera cannot be recovered over USB — only with
            SWD/J-Link or an SPI programmer.
          </span>
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
                ? 'I understand this is the bank the camera boots now, and that a bad image can leave the camera unbootable.'
                : risk.recovery
                  ? 'I understand this is the recovery bank, and that a bad image leaves the camera without a last-resort copy.'
                  : 'I understand the camera does not say which bank it boots, so this one is treated as the booted one, and that a bad image can leave the camera unbootable.'}
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
            {`Yes — write to ${slotName}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
