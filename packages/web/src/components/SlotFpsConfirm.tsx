/**
 * The last step before a frame-rate patch is written: the bank, the build, the rate change, that the rate is
 * UNTESTED on hardware, how the bank is saved first, and that the saved dump is the only way back. A bank
 * the camera boots now, or the recovery bank, adds the same tick a write needs.
 *
 * The plan is core's (`fpsPlanOfBank`); this only states it. Nothing is sent by opening or confirming it
 * here: confirming asks the page to run the patch, which saves the dump before it writes.
 */

import { useRef, useState, type ReactElement } from 'react';
import { Gauge } from 'lucide-react';
import type { FpsPlan } from '@seek-fw/core';
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
import type { FpsSaveMode } from '@/lib/fps-save';

export type FpsOffer = Extract<FpsPlan, { status: 'offer' }>;

export interface SlotFpsConfirmProps {
  readonly open: boolean;
  readonly slotName: string;
  /** The offer the dialog states. Null only while the dialog is closed. */
  readonly offer: FpsOffer | null;
  /** The build the bank's image is, as the camera reports it. */
  readonly version: string | null;
  readonly risk: WriteRisk;
  /** Named by the active-slot word on the 2014 chain (the words differ; see SlotWriteConfirm). */
  readonly namedByWord?: boolean;
  /** How this browser saves the dump: a chosen place per file, or two downloads. */
  readonly saveMode: FpsSaveMode;
  readonly onConfirm: (acknowledged: boolean) => void;
  readonly onCancel: () => void;
}

export function SlotFpsConfirm({
  open,
  slotName,
  offer,
  version,
  risk,
  namedByWord = false,
  saveMode,
  onConfirm,
  onCancel,
}: SlotFpsConfirmProps): ReactElement {
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
          <AlertDialogTitle>{`Make ${slotName} run at ${String(toHz)} FPS?`}</AlertDialogTitle>
        </div>

        {risk.booted && (
          <p className="rounded-md border border-destructive/40 bg-destructive/8 px-3 py-2 text-[0.85rem] font-medium text-destructive">
            {namedByWord
              ? `${slotName} is the bank the camera's active-slot word names as booted. On this line recovery R can run instead, so it may not be the bank that runs.`
              : `${slotName} is the bank this camera boots now. The patched image replaces the firmware it runs now.`}
          </p>
        )}
        {risk.recovery && (
          <p className="rounded-md border border-destructive/40 bg-destructive/8 px-3 py-2 text-[0.85rem] font-medium text-destructive">
            {`${slotName} is the recovery bank, the last-resort copy the bootloader falls back to.`}
          </p>
        )}

        <AlertDialogDescription id="slot-fps-confirm-what" className="space-y-2">
          <span className="block">
            {`${slotName} holds firmware ${version ?? '(unknown)'}, and this makes its image run at ${String(toHz)} Hz instead of ${String(fromHz)} Hz.`}
          </span>
          <span className="block">
            {`The patch changes ${String(sites)} byte(s) of the image and the acceptance-sum word, so the sum the bootloader checks is kept. The key pair is not touched.`}
          </span>
          <span className="block rounded-md border border-warn/40 bg-warn/8 px-3 py-2 font-medium">
            {`UNTESTED on hardware. The ${String(toHz)} Hz rate is measured in the emulator only. Whether this camera publishes at that rate is not known until the bench measures it.`}
          </span>
          <span className="block">
            {saveMode === 'picker'
              ? `Before anything is written, ${slotName} is saved twice, as stored and decrypted. You choose where each file goes, and the write starts only after both are on disk.`
              : `Before anything is written, ${slotName} is saved twice, as stored and decrypted, as two downloads. This browser cannot confirm that the files reached the disk, so check your downloads folder before you rely on them.`}
          </span>
          <span className="block font-medium">
            {`The saved decrypted file is the only way back. There is no restore button: to undo the patch, flash that file yourself with "Flash decrypted image" on ${slotName}.`}
          </span>
          <span className="block">
            No reset is sent. Unplug and replug the camera afterwards for the patched bank to take
            effect.
          </span>
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
                ? namedByWord
                  ? 'I understand the active-slot word names this bank as booted, and that a bad image can leave the camera unbootable.'
                  : 'I understand this is the bank the camera boots now, and that a bad image can leave the camera unbootable.'
                : risk.recovery
                  ? 'I understand this is the recovery bank, and that a bad image leaves the camera without a last-resort copy.'
                  : 'I understand the camera does not say which bank it boots, so this one is treated as the booted one.'}
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
            {`Yes — patch ${slotName}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
