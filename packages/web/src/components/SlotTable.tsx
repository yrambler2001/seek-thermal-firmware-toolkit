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
import { ArchiveRestore, Copy, Download, FileUp, Gauge } from 'lucide-react';
import {
  BOOTED_NOW,
  NOT_BOOTED,
  SLOT_BYTES,
  hexUp,
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
  copyLabel,
  slotActionGate,
  slotCopyGate,
  slotVersion,
  writeRisk,
  type ActionGate,
  type WriteRisk,
} from '@/hooks/useSlotsPanel';

/** The same image types the flash view takes. */
const IMAGE_ACCEPT = '.bin,.img,.rom,application/octet-stream';
/** A full flash backup: the 4 MiB image, or a Preserve run file (a zip) that holds one. */
const FULL_FLASH_ACCEPT = '.bin,.img,.rom,.zip,application/octet-stream,application/zip';

export interface SlotTableProps {
  readonly report: SlotsReport;
  readonly connected: boolean;
  readonly busy: boolean;
  readonly onDump: (key: SlotKey) => void;
  readonly onPickFile: (key: SlotKey, kind: SlotInputKind, file: File) => void;
  /** Prepare a copy of bank `from`'s image into bank `to`. Nothing is sent by it. */
  readonly onCopy: (from: SlotKey, to: SlotKey) => void;
  /** Prepare a restore of bank `key` from a full flash backup file. Nothing is sent by it. */
  readonly onPickRestore: (key: SlotKey, file: File) => void;
  /** The frame-rate plan of one bank, from its own image in the read. Pure. */
  readonly planFps: (key: SlotKey) => FpsPlan;
  /** Opens the confirmation for the frame-rate patch of one bank. Nothing is sent by it. */
  readonly onPatchFps: (key: SlotKey) => void;
}

/** What the frame-rate row action says when it is on: the rate change, and that the saved file is the way back. */
function fpsNote(plan: Extract<FpsPlan, { status: 'offer' }>): string {
  return (
    `Raises this bank from ${String(plan.fromHz)} Hz to ${String(plan.toHz)} Hz by editing its bytes. ` +
    'The bank is saved first, in a zip download, and the decrypted file in it is the way back.'
  );
}

/** What the copy buttons do, in words, once. */
const COPY_NOTE =
  'Copies the firmware this bank holds, as this read decrypted it, into the bank you pick, whatever that ' +
  'bank holds now. You review the plan before anything is sent.';

/** What the restore button does, in words. */
const RESTORE_NOTE =
  'Pick a full flash backup: the 4 MiB image a J-Link reads, or a Preserve run file that holds the whole ' +
  'flash. This bank is cut out of it, decrypted, and shown as a plan before anything is sent.';

/**
 * Why a bank offers no frame-rate patch, in the page's words, or null when there is nothing to say (a
 * build the page does not support, which has its own banner, or an offer). Every bank that is not offered
 * says why, an empty and an unread bank included: the plan's reason names the empty bank or the read that
 * failed. The words never say a write "cannot be written": that banner belongs to the keys verdict alone.
 *
 * A bank that already runs the faster rate is a state, not a refusal: it says what it holds (the patch, or a
 * build made at that rate), from the plan's rate, with no table id (TESTING.md 42.85 O3, 42.86). An earlier
 * patch without the USB fix is the exception: it is not patched again, so it says what to do first.
 */
export function fpsOffNote(plan: FpsPlan, supported: boolean): string | null {
  if (!supported || plan.status === 'offer') return null;
  if (plan.status === 'patched') {
    return `Frame-rate patch applied: this image runs at ${String(plan.hz)} Hz.`;
  }
  if (plan.status === 'at-rate') {
    /* An earlier patch (before the USB no-skip branch) is not patched again: the way on is the stock
     * image first (TESTING.md 42.97). */
    if (plan.earlierPatch === true) {
      return (
        `Frame-rate patch not offered: this bank holds an earlier ${String(plan.hz)} Hz patch without the ` +
        `USB fix. Restore the stock image, then Make ${String(plan.hz)} FPS.`
      );
    }
    return `No frame-rate patch needed: this build already runs at ${String(plan.hz)} Hz.`;
  }
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
 * The words for the booted bank, the same on every line (core's `BOOTED_NOW`, TESTING.md 42.89): on the
 * locked lines the bank is the active-slot word's, which 42.56 measured as the bank that ran.
 */
function riskNote(risk: WriteRisk): string | null {
  const booted = BOOTED_NOW.charAt(0).toUpperCase() + BOOTED_NOW.slice(1);
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

/** The reasons the copy buttons of one row are off, each once, or null when every one is on. */
function copyReasons(
  copies: readonly { readonly to: SlotKey; readonly gate: ActionGate }[],
): string | null {
  const off = copies.filter((copy) => !copy.gate.enabled);
  if (off.length === 0) return null;
  const reasons = [...new Set(off.map((copy) => copy.gate.reason ?? ''))].filter((r) => r !== '');
  if (off.length === copies.length && reasons.length === 1) return reasons[0] ?? null;
  return off.map((copy) => `${copyLabel(copy.to)}: ${copy.gate.reason ?? 'off'}`).join(' ');
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
  onCopy,
  onPickRestore,
  planFps,
  onPatchFps,
}: SlotTableProps): ReactElement {
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
          /* The extra confirmation a write asks for, said once in the row: under the write buttons when
           * one of them is on, not under each (TESTING.md 42.87). */
          const note = riskNote(risk);
          const writable = plainGate.reason === null || rawGate.reason === null;
          const version = slotVersion(report, key);
          const empty = view.content === 'empty';
          /* This row is the source of a copy: one button for each other bank, whatever it holds. */
          const copies = report.slots
            .filter((other) => other.entry.key !== key)
            .map((other) => ({
              to: other.entry.key,
              gate: slotCopyGate({
                report,
                from: key,
                to: other.entry.key,
                connected,
                busy,
                cameraRefusal,
              }),
            }));
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
                    <Badge tone="ok">{BOOTED_NOW}</Badge>
                  ) : (
                    <Badge tone="neutral">{NOT_BOOTED}</Badge>
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

                  <Action reason={plainGate.reason} note={null}>
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

                  <Action reason={rawGate.reason} note={null}>
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

                  {writable && note !== null && (
                    <span className="block text-[0.75rem] leading-snug text-muted-foreground">
                      {note}
                    </span>
                  )}

                  <Action reason={copyReasons(copies)} note={COPY_NOTE}>
                    <div className="flex flex-wrap gap-2">
                      {copies.map((copy) => (
                        <Button
                          key={copy.to}
                          variant="outline"
                          disabled={!copy.gate.enabled}
                          onClick={() => {
                            onCopy(key, copy.to);
                          }}
                        >
                          <Copy />
                          {copyLabel(copy.to)}
                        </Button>
                      ))}
                    </div>
                  </Action>

                  <Action reason={plainGate.reason} note={RESTORE_NOTE}>
                    <FilePickerButton
                      id={`slot-${key}-restore-file`}
                      variant="outline"
                      icon={<ArchiveRestore />}
                      label="Restore from full flash backup…"
                      accept={FULL_FLASH_ACCEPT}
                      disabled={!plainGate.enabled}
                      onPick={(file) => {
                        onPickRestore(key, file);
                      }}
                    />
                  </Action>

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
