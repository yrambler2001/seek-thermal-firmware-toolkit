/**
 * The three banks as one table: what each holds, whether the camera boots it,
 * and what this build lets the page do to it.
 *
 * A control that is off always says WHY, in words beside it. Greyed out alone
 * is not an answer, and a tooltip does not show on a phone. Below 48rem the
 * table becomes one card per bank (`table-cards`), and the labels repeat above
 * each value there.
 */

import type { ReactElement, ReactNode } from 'react';
import { Download, FileUp } from 'lucide-react';
import {
  SLOT_BYTES,
  hexUp,
  type SlotInputKind,
  type SlotKey,
  type SlotView,
  type SlotsReport,
} from '@seek-fw/core';
import { FilePickerButton } from './FilePickerButton';
import { Badge } from './ui/badge';
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
import { slotActionGate, slotVersion, writeRisk, type WriteRisk } from '@/hooks/useSlotsPanel';

/** The same image types the flash view takes. */
const IMAGE_ACCEPT = '.bin,.img,.rom,application/octet-stream';

export interface SlotTableProps {
  readonly report: SlotsReport;
  readonly connected: boolean;
  readonly busy: boolean;
  readonly onDump: (key: SlotKey) => void;
  readonly onPickFile: (key: SlotKey, kind: SlotInputKind, file: File) => void;
}

function bootability(view: SlotView): ReactNode {
  const state = view.state;
  if (state === null) return '—';
  if (state.bootability === 'bootable') {
    return <span className="text-ok">bootable — the bootloader can key it</span>;
  }
  if (state.bootability === 'not-bootable') {
    return <span className="text-destructive">not bootable — skipped at boot</span>;
  }
  return <span>unknown — the bootloader&apos;s key table was not read</span>;
}

function riskNote(risk: WriteRisk): string | null {
  if (risk.booted && risk.recovery) {
    return 'Booted now, and recovery: writing it asks for an extra confirmation.';
  }
  if (risk.booted) return 'Booted now: writing it asks for an extra confirmation.';
  if (risk.recovery) return 'Recovery bank: writing it asks for an extra confirmation.';
  return null;
}

/** A control and, under it, the words for why it is off (or what it will ask). */
function Action({
  reason,
  note,
  children,
}: {
  readonly reason: string | null;
  readonly note: string | null;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div className="flex flex-col items-start gap-1">
      {children}
      {reason !== null && (
        <span className="text-[0.75rem] leading-snug text-muted-foreground">{reason}</span>
      )}
      {reason === null && note !== null && (
        <span className="text-[0.75rem] leading-snug text-muted-foreground">{note}</span>
      )}
    </div>
  );
}

export function SlotTable({
  report,
  connected,
  busy,
  onDump,
  onPickFile,
}: SlotTableProps): ReactElement {
  return (
    <Table>
      <TableCaption>
        Each firmware bank on this camera — A, B and the recovery bank R — as read and checked in
        the browser
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Bank</TableHead>
          <TableHead>Firmware</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Key</TableHead>
          <TableHead>Bootable</TableHead>
          <TableHead>SHA-256 of plaintext</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {report.slots.map((view) => {
          const { entry, state } = view;
          const key = entry.key;
          const risk = writeRisk(report, key);
          const gate = (action: 'dump' | 'flash-plain' | 'flash-raw') =>
            slotActionGate({ entry, view, action, connected, busy });
          const dumpGate = gate('dump');
          const plainGate = gate('flash-plain');
          const rawGate = gate('flash-raw');
          const note = riskNote(risk);
          const version = slotVersion(report, key);

          return (
            <TableRow key={key}>
              <TableRowHeader className="whitespace-nowrap">
                <span className="block">{entry.name}</span>
                <span className="block font-mono text-[0.75rem] font-normal text-muted-foreground">
                  {hexUp(entry.address)}
                </span>
                <span className="mt-1 block">
                  {view.active ? (
                    <Badge tone="ok">booted now</Badge>
                  ) : (
                    <Badge tone="neutral">not booted</Badge>
                  )}
                </span>
                {entry.notes.map((text) => (
                  <span
                    key={text}
                    className="block text-[0.72rem] leading-snug font-normal whitespace-normal text-muted-foreground"
                  >
                    {text}
                  </span>
                ))}
              </TableRowHeader>

              <TableCell label="Firmware">
                {state === null ? (
                  <span className="text-warn">{`not read — ${view.unreadReason ?? 'the bank was not read'}`}</span>
                ) : state.present ? (
                  <>
                    {version ?? 'unknown version'}
                    {state.header !== null && (
                      <span className="block text-[0.75rem] text-muted-foreground">
                        {`image ${hexUp(state.header.imageId)}`}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">{state.reason ?? 'no image'}</span>
                )}
              </TableCell>

              <TableCell label="Size">
                {`${SLOT_BYTES.toLocaleString()} B bank`}
                {state?.header != null && (
                  <span className="block text-[0.75rem] text-muted-foreground">
                    {`image ${state.header.length.toLocaleString()} B`}
                  </span>
                )}
              </TableCell>

              <TableCell label="Key">{state?.keyName ?? '—'}</TableCell>

              <TableCell label="Bootable">{bootability(view)}</TableCell>

              <TableCell label="SHA-256 of plaintext">
                <span className="font-mono text-[0.72rem] [overflow-wrap:anywhere]">
                  {state?.sha256 ?? '—'}
                </span>
              </TableCell>

              <TableCell label="Actions">
                <div className="space-y-3">
                  <Action reason={dumpGate.reason} note={null}>
                    <Button
                      variant="outline"
                      disabled={!dumpGate.enabled}
                      onClick={() => {
                        onDump(key);
                      }}
                    >
                      <Download />
                      Dump
                    </Button>
                  </Action>

                  <Action reason={plainGate.reason} note={note}>
                    <FilePickerButton
                      id={`slot-${key}-plain-file`}
                      variant="danger"
                      icon={<FileUp />}
                      label="Flash decrypted image…"
                      accept={IMAGE_ACCEPT}
                      disabled={!plainGate.enabled}
                      onPick={(file) => {
                        onPickFile(key, 'plain', file);
                      }}
                    />
                  </Action>

                  <Action reason={rawGate.reason} note={note}>
                    <FilePickerButton
                      id={`slot-${key}-raw-file`}
                      variant="danger"
                      icon={<FileUp />}
                      label="Flash raw bytes…"
                      accept={IMAGE_ACCEPT}
                      disabled={!rawGate.enabled}
                      onPick={(file) => {
                        onPickFile(key, 'raw', file);
                      }}
                    />
                  </Action>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
