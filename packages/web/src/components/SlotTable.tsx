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
import { Copy, Download, FileUp, Gauge } from 'lucide-react';
import {
  SLOT_BYTES,
  hexUp,
  onPlaintextChain,
  unknownBootabilityWhy,
  writeBannerOf,
  type FpsPlan,
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
import {
  bankImageSource,
  slotActionGate,
  slotVersion,
  writeRisk,
  type BankImageSource,
  type WriteRisk,
} from '@/hooks/useSlotsPanel';

/** The same image types the flash view takes. */
const IMAGE_ACCEPT = '.bin,.img,.rom,application/octet-stream';

export interface SlotTableProps {
  readonly report: SlotsReport;
  readonly connected: boolean;
  readonly busy: boolean;
  readonly onDump: (key: SlotKey) => void;
  readonly onPickFile: (key: SlotKey, kind: SlotInputKind, file: File) => void;
  /** Prepare a write of the running firmware's own image into an empty bank. */
  readonly onFillWithBankImage: (key: SlotKey) => void;
  /** The frame-rate plan of one bank, from its own image in the read. Pure. */
  readonly planFps: (key: SlotKey) => FpsPlan;
  /** Opens the confirmation for the frame-rate patch of one bank. Nothing is sent by it. */
  readonly onPatchFps: (key: SlotKey) => void;
}

/** What the frame-rate row action says when it is on: the rate change, and that the saved file is the way back. */
function fpsNote(plan: Extract<FpsPlan, { status: 'offer' }>): string {
  return (
    `Raises this bank from ${String(plan.fromHz)} Hz to ${String(plan.toHz)} Hz by editing its bytes. ` +
    'The bank is saved in full before anything is written, and the saved decrypted file is the only way back.'
  );
}

/**
 * Why a bank offers no frame-rate patch, in the page's words, or null when there is nothing to say (a
 * build the page does not support, which has its own banner, or an offer). Every bank that is not offered
 * says why, an empty and an unread bank included: the plan's reason names the empty bank or the read that
 * failed. The words never say a write "cannot be written": that banner belongs to the keys verdict alone.
 */
export function fpsOffNote(plan: FpsPlan, supported: boolean): string | null {
  if (!supported || plan.status === 'offer') return null;
  return `Frame-rate patch not offered: ${plan.reason}`;
}

/** A bank's bootability cell. `unknownWhy` is core's reason a verdict is unknown on this camera (`unknownBootabilityWhy`). */
function bootability(view: SlotView, unknownWhy: string): ReactNode {
  const state = view.state;
  if (state === null) return '—';
  /* An empty bank holds nothing the bootloader could take: "not bootable" would read as a
   * verdict on an image that is not there. */
  if (view.content === 'empty') return <span>— nothing to boot</span>;
  if (state.bootability === 'bootable') {
    return <span className="text-ok">bootable — the bootloader can key it</span>;
  }
  if (state.bootability === 'not-bootable') {
    return <span className="text-destructive">not bootable — skipped at boot</span>;
  }
  if (state.bootability === 'recovery-only') {
    return (
      <span className="text-warn">
        recovery only — R runs when A and B hold nothing the bootloader takes (measured for the
        plain form, 42.10); the FF form&apos;s boot is untested (42.12)
      </span>
    );
  }
  return <span>unknown — {unknownWhy}</span>;
}

/**
 * The words for the booted bank. On the 2014 plaintext chain the camera's active-slot word names it: the
 * bootloader's record of the bank it entered (TESTING.md 42.56), and the next start can run another bank
 * when this one fails its check (TESTING.md 42.10), so the words name the word.
 */
function riskNote(risk: WriteRisk, byWord: boolean): string | null {
  const booted = byWord ? 'Named booted by the active-slot word' : 'Booted now';
  if (risk.booted && risk.recovery) {
    return `${booted}, and recovery: writing it asks for an extra confirmation.`;
  }
  if (risk.booted) return `${booted}: writing it asks for an extra confirmation.`;
  if (risk.recovery) return 'Recovery bank: writing it asks for an extra confirmation.';
  if (risk.bootUnnamed) {
    return 'The camera does not name its booted bank: writing it asks for an extra confirmation.';
  }
  return null;
}

/** What the "use the booted bank's image" button does, in words, with the extra confirmation it will ask for. */
function fillNote(source: BankImageSource, risk: string | null, byWord: boolean): string {
  const version = source.version === null ? '' : ` (${source.version})`;
  const which = source.booted
    ? byWord
      ? 'That is the bank the active-slot word names as booted.'
      : 'That is the bank the camera boots now.'
    : 'The camera does not say which bank it boots; this is the first bank that holds an image.';
  return [
    `Copies the firmware ${source.name} holds${version} into this empty bank, so the camera has a second slot with the same firmware.`,
    which,
    'You review the plan before anything is sent.',
    ...(risk === null ? [] : [risk]),
  ].join(' ');
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
  onFillWithBankImage,
  planFps,
  onPatchFps,
}: SlotTableProps): ReactElement {
  /* On the 2014 plaintext chain the booted bank is the camera's active-slot word, so the words say "named". */
  const byWord = onPlaintextChain(report.state.profile, report.state.version);
  /* The camera-wide refusal the banner shows, if any: it turns every flash control off (see slotActionGate). */
  const cameraRefusal = writeBannerOf(report.state);
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
            slotActionGate({ entry, view, action, connected, busy, cameraRefusal });
          const dumpGate = gate('dump');
          const plainGate = gate('flash-plain');
          const rawGate = gate('flash-raw');
          const note = riskNote(risk, byWord);
          const version = slotVersion(report, key);
          const empty = view.content === 'empty';
          /* An empty bank can be filled with the firmware the camera already runs, when another
           * bank holds a decrypted image of it. */
          const source = empty ? bankImageSource(report, key) : null;
          /* The frame-rate patch belongs to this row: its own image decides the entry, or the reason none. */
          const fps = planFps(key);
          const supported = report.plan.supportedBuild.supported;

          return (
            <TableRow key={key}>
              <TableRowHeader className="whitespace-nowrap">
                <span className="block">{entry.name}</span>
                <span className="block font-mono text-[0.75rem] font-normal text-muted-foreground">
                  {hexUp(entry.address)}
                </span>
                <span className="mt-1 block">
                  {view.active ? (
                    <Badge tone="ok">{byWord ? 'named booted' : 'booted now'}</Badge>
                  ) : (
                    <Badge tone="neutral">{byWord ? 'not named booted' : 'not booted'}</Badge>
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
                ) : empty ? (
                  <>
                    <Badge tone="neutral">empty</Badge>
                    <span className="mt-1 block text-[0.75rem] text-muted-foreground">
                      No image: this bank&apos;s header window reads as all 0xFF, so nothing is
                      decrypted from it and writing it overwrites no firmware.
                    </span>
                    <span className="mt-1 block text-[0.72rem] leading-snug text-muted-foreground">
                      {entry.emptyBank.writable.supported
                        ? `Can be written. ${entry.emptyBank.why}`
                        : `Cannot be written on this build: ${entry.emptyBank.writable.reason}`}
                    </span>
                  </>
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

              <TableCell label="Key">
                {state?.keyName ?? (state?.plain == null ? '—' : 'none (plaintext)')}
              </TableCell>

              <TableCell label="Bootable">
                {bootability(view, unknownBootabilityWhy(report.state))}
              </TableCell>

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

                  {source !== null && (
                    <Action reason={plainGate.reason} note={fillNote(source, note, byWord)}>
                      <Button
                        variant="outline"
                        disabled={!plainGate.enabled}
                        onClick={() => {
                          onFillWithBankImage(key);
                        }}
                      >
                        <Copy />
                        {source.booted
                          ? "Use the booted bank's image"
                          : `Use ${source.name}'s image`}
                      </Button>
                    </Action>
                  )}

                  {fps.status === 'offer' ? (
                    <Action reason={plainGate.reason} note={fpsNote(fps)}>
                      <Button
                        variant="outline"
                        disabled={!plainGate.enabled}
                        onClick={() => {
                          onPatchFps(key);
                        }}
                      >
                        <Gauge />
                        {`Make ${String(fps.toHz)} FPS`}
                      </Button>
                    </Action>
                  ) : (
                    fpsOffNote(fps, supported) !== null && (
                      <span className="block text-[0.75rem] leading-snug text-muted-foreground">
                        {fpsOffNote(fps, supported)}
                      </span>
                    )
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
