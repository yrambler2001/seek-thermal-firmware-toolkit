/**
 * What a prepared slot write would do, shown before anything is sent.
 *
 * The compare rows, the warnings and the payload sizes are all core's
 * `SlotFlashPlan`, shown as it gives them. Nothing here recomputes them. The
 * button only opens the confirmation; the write itself is the next step.
 */

import type { ReactElement } from 'react';
import { FileUp, Flame } from 'lucide-react';
import { hexUp, type SlotFlashPlan, type SlotInputKind } from '@seek-fw/core';
import { KeyValue, type KeyValueRow } from './KeyValue';
import { Panel, PanelTitle } from './Panel';
import { Prose } from './Prose';
import { Alert } from './ui/alert';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowHeader,
} from './ui/table';
import { Toolbar } from './ui/toolbar';

/** One 0x50 command carries at most this many bytes (the EP0 buffer). */
const CHUNK = 64;

const STAGING_TEXT: Readonly<Record<SlotFlashPlan['staging'], string>> = {
  'key-a-ciphertext': "encrypted under Key A, the key this camera's bootloader reads",
  'slot-keystream-ciphertext': 'encrypted under the keystream this bank already carries',
  plain: 'plaintext, no cipher',
  'two-stream':
    'the 1.3.0.8 FF image folded through two keystreams — the camera stores the plain image, not these bytes',
  verbatim: 'verbatim — the bytes exactly as given',
};

/** What the Stored afterwards row says, by what the plan predicts and how it relates to the payload. */
function storedText(plan: SlotFlashPlan): string {
  if (plan.expectedStored === null) return 'not predicted — the read-back is the check';
  const size = `${plan.expectedStored.length.toLocaleString()} B predicted`;
  return plan.storedForm === 'two-stream-fold'
    ? `${size} — the plain image the payload folds to, not the payload itself`
    : size;
}

export interface SlotFlashPreviewProps {
  readonly slotName: string;
  readonly address: number;
  readonly fileName: string;
  readonly kind: SlotInputKind;
  readonly plan: SlotFlashPlan;
  readonly busy: boolean;
  readonly onWrite: () => void;
  readonly onDiscard: () => void;
}

export function SlotFlashPreview({
  slotName,
  address,
  fileName,
  kind,
  plan,
  busy,
  onWrite,
  onDiscard,
}: SlotFlashPreviewProps): ReactElement {
  const chunks = Math.ceil(plan.payload.length / CHUNK);
  const rows: readonly KeyValueRow[] = [
    ['File', fileName],
    [
      'Read as',
      kind === 'plain'
        ? plan.staging === 'two-stream'
          ? "a decrypted image — folded through the FF build's two keystreams before it is staged"
          : 'a decrypted image — encrypted for this bank before it is staged'
        : 'raw bytes — staged exactly as given',
    ],
    ['Staging', STAGING_TEXT[plan.staging]],
    [
      'Payload',
      `${plan.payload.length.toLocaleString()} B in ${String(chunks)} chunk${
        chunks === 1 ? '' : 's'
      } of up to ${String(CHUNK)} B`,
    ],
    ['Transfer checksum', hexUp(plan.sum16, 4)],
    ['Stored afterwards', storedText(plan)],
  ];

  return (
    <Panel>
      <PanelTitle icon={<FileUp />}>{`Prepared for ${slotName} at ${hexUp(address)}`}</PanelTitle>
      <KeyValue rows={rows} />

      {plan.compare.length > 0 && (
        <div className="mt-3">
          <Table>
            <TableCaption>What changes in {slotName}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Now</TableHead>
                <TableHead>After the write</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.compare.map((row) => (
                <TableRow key={row.field}>
                  <TableRowHeader>{row.field}</TableRowHeader>
                  <TableCell
                    label="Now"
                    className="font-mono text-[0.8rem] [overflow-wrap:anywhere]"
                  >
                    {row.before}
                  </TableCell>
                  <TableCell
                    label="After the write"
                    className="font-mono text-[0.8rem] [overflow-wrap:anywhere]"
                  >
                    {row.after}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {plan.warnings.length > 0 && (
        <Alert tone="warn" className="mt-3">
          <p>
            <strong>Read before writing:</strong>
          </p>
          <ul>
            {plan.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Prose className="mt-3">
        <p>
          Nothing has been sent to the camera yet. Writing streams this payload to {slotName} and
          commits it.
        </p>
      </Prose>

      <Toolbar label={`Write actions for ${slotName}`} className="mt-3">
        <Button
          variant="destructive"
          disabled={busy}
          onClick={() => {
            /* Only ever a step towards the write: the confirmation decides. */
            onWrite();
          }}
        >
          <Flame />
          {`Write to ${slotName}…`}
        </Button>
        <Button variant="ghost" onClick={onDiscard}>
          Discard
        </Button>
      </Toolbar>
    </Panel>
  );
}
