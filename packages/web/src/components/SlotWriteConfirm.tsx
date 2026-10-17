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
  readonly fileName: string;
  readonly slotName: string;
  readonly slotAddress: string;
  readonly risk: WriteRisk;
  /**
   * The write is the 1.3.0.8 FF (16 Hz) image in its two-stream staged form. That image goes to
   * the recovery bank only, so the dialog says why, in words, above the tick.
   */
  readonly twoStream?: boolean;
  readonly onConfirm: (acknowledged: boolean) => void;
  readonly onCancel: () => void;
}

export function SlotWriteConfirm({
  open,
  fileName,
  slotName,
  slotAddress,
  risk,
  twoStream = false,
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
          <AlertDialogTitle>{`Write ${fileName} to ${slotName} at ${slotAddress}?`}</AlertDialogTitle>
        </div>

        {risk.booted && (
          <p className="rounded-md border border-destructive/40 bg-destructive/8 px-3 py-2 text-[0.85rem] font-medium text-destructive">
            {`${slotName} is the bank this camera boots now. Writing it replaces the firmware the camera is running now. If the new image does not run, the camera may not boot at all.`}
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

        <AlertDialogDescription id="slot-write-confirm-what" className="space-y-2">
          <span className="block">
            {`This erases a 64 KiB block of the camera's flash and programs it at ${slotName}.`}
          </span>
          {twoStream && (
            <span className="block" id="slot-write-confirm-ff">
              This is the 1.3.0.8 FF (16 Hz) image. The camera boots it only from the recovery bank:
              the 2014 bootloader rejects its word sum at banks A and B, so recovery is the one bank
              that takes it. It is staged folded through two keystreams, and the camera stores the
              plain image with one header word (0x238) set so the running app accepts it.
            </span>
          )}
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
