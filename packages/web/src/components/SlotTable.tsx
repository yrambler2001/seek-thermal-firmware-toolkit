/**
 * The three banks as one table: what each holds, whether the camera boots it,
 * and what this build lets the page do to it.
 *
 * A control that is off always says WHY, in words beside it. Greyed out alone
 * is not an answer, and a tooltip does not show on a phone. When every off
 * control of a row is off for the same reason, the row says it once, under its
 * buttons. Below 48rem the table becomes one card per bank (`table-cards`), and
 * the labels repeat above each value there.
 *
 * Three columns: the slot (its name, address, whether it is booted, and whether
 * the bootloader takes it), the firmware (version and image id, then its key,
 * size and SHA-256 as labelled lines, the labels being the former columns'
 * headers), and the actions, which take all the width the other two do not
 * need, so their buttons keep their labels on one line where they fit. The hash
 * is printed whole, in four lines of 16 digits (two of 32 in a phone's card). A
 * label still wraps when the column has no room.
 */

import type { ReactElement, ReactNode } from 'react';
import { ArchiveRestore, Copy, Download, FileUp, Gauge } from 'lucide-react';
import {
  SLOT_BYTES,
  hexUp,
  writeBannerMessage,
  capabilityNoteMessage,
  recordedParam,
  supportReasonMessage,
  type FpsPlan,
  type SlotInputKind,
  type SlotKey,
  type SlotView,
  type SlotsReport,
  BOOTED_NOW_MESSAGE,
  NOT_BOOTED_MESSAGE,
  unknownBootabilityWhyMessage,
  keyNameParam,
} from '@seek-fw/core';
import { coreParamText, coreText } from '@/lib/core-text';
import { pageShowsNote } from '@/lib/page-hidden';
import { t } from '@/i18n';
import { bankName, bankNameRef, bankWordsRef } from '@/lib/bank-names';
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
const FULL_FLASH_ACCEPT = '.bin,.zip,application/octet-stream,application/zip';

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
  return t('slots:table.fpsNote', { fromHz: plan.fromHz, toHz: plan.toHz });
}

/* What the copy buttons do (table.copyNote) and what the restore button does (table.restoreNote) are
 * said under them, translated at render. */

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
  if (plan.status === 'patched') return t('slots:fps.applied', { hz: plan.hz });
  if (plan.status === 'at-rate') {
    /* An earlier patch (before the USB no-skip branch) is not patched again: the way on is the stock
     * image first (TESTING.md 42.97). */
    if (plan.earlierPatch === true) return t('slots:fps.earlierPatch', { hz: plan.hz });
    return t('slots:fps.atRate', { hz: plan.hz });
  }
  /* A reason core gives no code yet (the patch table's own, the build's support) stays English. */
  return t('slots:fps.notOffered', { reason: coreText(plan.reasonMessage ?? plan.reason) });
}

/**
 * A name with its last two words kept on one line ("восстановления R", "Key A"): where the column is narrow
 * and a long name wraps, its letter never sits alone on a line of its own.
 */
function lastWordsTogether(name: string): ReactNode {
  const cut = name.lastIndexOf(' ', name.lastIndexOf(' ') - 1) + 1;
  return (
    <>
      {name.slice(0, cut)}
      <span className="whitespace-nowrap">{name.slice(cut)}</span>
    </>
  );
}

/** A size line with its number and the unit after it kept on one line ("65,536 B"), wherever it wraps. */
function numberWithUnit(text: string, number: string): ReactNode {
  const at = text.indexOf(number);
  if (at < 0) return text;
  const rest = text.slice(at + number.length);
  const unit = /^\s\S+/u.exec(rest)?.[0] ?? '';
  return (
    <>
      {text.slice(0, at)}
      <span className="whitespace-nowrap">{number + unit}</span>
      {rest.slice(unit.length)}
    </>
  );
}

/**
 * One labelled line of a cell: a small muted label (a former column's header) above its value. Inside a
 * `<dl>`, so the label names its value for a screen reader too.
 */
function Field({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div>
      <dt className="text-[0.68rem] font-semibold tracking-[0.06em] text-muted-foreground uppercase hyphens-auto">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

/** A bank's bootability verdict. `unknownWhy` is core's reason a verdict is unknown on this camera (`unknownBootabilityWhy`). */
function bootability(view: SlotView, unknownWhy: string): ReactNode {
  const state = view.state;
  if (state === null) return '—';
  /* An empty bank holds nothing the bootloader could take: "not bootable" would read as a
   * verdict on an image that is not there. */
  if (view.content === 'empty') return <span>{t('slots:table.boot.empty')}</span>;
  if (state.bootability === 'bootable') {
    return <span className="text-ok">{t('slots:table.boot.bootable')}</span>;
  }
  if (state.bootability === 'not-bootable') {
    return <span className="text-destructive">{t('slots:table.boot.notBootable')}</span>;
  }
  if (state.bootability === 'recovery-only') {
    return (
      <span className="text-warn">
        {t('slots:table.boot.recoveryOnly', { letterA: 'A', letterB: 'B', letterR: 'R' })}
      </span>
    );
  }
  return <span>{t('slots:table.boot.unknown', { why: unknownWhy })}</span>;
}

/**
 * The words for the booted bank, the same on every line (core's `BOOTED_NOW`, TESTING.md 42.89): on the
 * locked lines the bank is the active-slot word's, which 42.56 measured as the bank that ran.
 */
function riskNote(risk: WriteRisk): string | null {
  const bootedNow = coreText(BOOTED_NOW_MESSAGE);
  const booted = bootedNow.charAt(0).toUpperCase() + bootedNow.slice(1);
  if (risk.booted && risk.recovery) return t('slots:table.risk.bootedRecovery', { booted });
  if (risk.booted) return t('slots:table.risk.booted', { booted });
  if (risk.recovery) return t('slots:table.risk.recovery', { bank: bankNameRef('r') });
  if (risk.bootUnnamed) return t('slots:table.risk.bootUnnamed');
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
  return off
    .map((copy) =>
      copy.gate.reason === null
        ? t('slots:table.copyOffNoReason', { button: copyLabel(copy.to) })
        : t('slots:table.copyOff', { button: copyLabel(copy.to), reason: copy.gate.reason }),
    )
    .join(' ');
}

/**
 * The one reason every off control of a row is off for, or null. When two or more controls are off and all
 * for the same reason (the camera's refusal, no camera connected), the row says it once under its buttons
 * instead of under each; controls off for different reasons keep their own words.
 */
export function sharedOffReason(gates: readonly ActionGate[]): string | null {
  const off = gates.filter((gate) => !gate.enabled);
  const first = off[0]?.reason ?? null;
  if (off.length < 2 || first === null) return null;
  return off.every((gate) => gate.reason === first) ? first : null;
}

/**
 * A control and, under it, the words for why it is off (or what it will ask). `shared` is set when the
 * row says the reason once under its buttons (sharedOffReason): the control then says nothing of its own.
 */
function Action({
  reason,
  note,
  shared,
  children,
}: {
  readonly reason: string | null;
  readonly note: string | null;
  readonly shared: boolean;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div className="flex flex-col items-start gap-1">
      {children}
      {reason !== null && !shared && (
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
  const banner = writeBannerMessage(report.state);
  const cameraRefusal = banner === null ? null : coreText(banner);
  return (
    <Table>
      <TableCaption>
        {t('slots:table.caption', {
          a: bankWordsRef('a'),
          b: bankWordsRef('b'),
          r: bankWordsRef('r'),
        })}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{t('slots:table.col.bank')}</TableHead>
          <TableHead>{t('slots:table.col.firmware')}</TableHead>
          {/* All the width the slot and firmware columns do not need. */}
          <TableHead className="md:w-full">{t('slots:table.col.actions')}</TableHead>
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
          /* Every control of the cell, in its order (restore and the frame-rate patch use the plain write's gate). */
          const shared = sharedOffReason([
            dumpGate,
            plainGate,
            rawGate,
            ...copies.map((copy) => copy.gate),
            plainGate,
            ...(fps.status === 'offer' ? [plainGate] : []),
          ]);
          const sharing = shared !== null;
          const fpsOff = fpsOffNote(fps, supported);

          return (
            <TableRow key={key}>
              <TableRowHeader>
                <span className="block">{lastWordsTogether(bankName(key))}</span>
                <span className="block font-mono text-[0.75rem] font-normal text-muted-foreground">
                  {hexUp(entry.address)}
                </span>
                <span className="mt-1 block">
                  {view.active ? (
                    <Badge tone="ok">{coreText(BOOTED_NOW_MESSAGE)}</Badge>
                  ) : (
                    <Badge tone="neutral">{coreText(NOT_BOOTED_MESSAGE)}</Badge>
                  )}
                </span>
                {entry.notes.filter(pageShowsNote).map((text) => (
                  <span
                    key={text}
                    className="block text-[0.72rem] leading-snug font-normal whitespace-normal text-muted-foreground"
                  >
                    {coreText(capabilityNoteMessage(text))}
                  </span>
                ))}
                <dl className="mt-2 font-normal md:min-w-[8rem]">
                  <Field label={t('slots:table.col.bootable')}>
                    {bootability(view, coreText(unknownBootabilityWhyMessage(report.state)))}
                  </Field>
                </dl>
              </TableRowHeader>

              <TableCell label={t('slots:table.col.firmware')}>
                {state === null ? (
                  <span className="text-warn">
                    {view.unreadReason === null
                      ? t('slots:table.notReadNoReason')
                      : t('slots:table.notRead', {
                          reason: coreText(
                            recordedParam(view.unreadReasonMessage, view.unreadReason),
                          ),
                        })}
                  </span>
                ) : empty ? (
                  <>
                    <Badge tone="neutral">{t('slots:table.empty')}</Badge>
                    <span className="mt-1 block text-[0.75rem] text-muted-foreground">
                      {t('slots:table.emptyNote')}
                    </span>
                    <span className="mt-1 block text-[0.72rem] leading-snug text-muted-foreground">
                      {/* An empty bank's why (core's `emptyBankWhy`, notes.empty.*) is left out (lib/page-hidden.ts). */}
                      {entry.emptyBank.writable.supported
                        ? t('slots:table.emptyWritable')
                        : t('slots:table.emptyNotWritable', {
                            reason: coreText(supportReasonMessage(entry.emptyBank.writable)),
                          })}
                    </span>
                  </>
                ) : state.present ? (
                  <>
                    {version ?? t('slots:table.unknownVersion')}
                    {state.header !== null && (
                      <span className="block text-[0.75rem] text-muted-foreground">
                        {t('slots:table.imageId', { id: hexUp(state.header.imageId) })}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    {state.reason === null
                      ? t('slots:table.noImage')
                      : coreText(recordedParam(state.reasonMessage, state.reason))}
                  </span>
                )}
                <dl className="mt-2 space-y-1.5 lg:min-w-[11rem]">
                  <Field label={t('slots:table.col.key')}>
                    {state?.keyName == null
                      ? state?.plain == null
                        ? '—'
                        : t('slots:table.keyNone')
                      : lastWordsTogether(coreParamText(keyNameParam(state.keyName)))}
                  </Field>
                  <Field label={t('slots:table.col.size')}>
                    {numberWithUnit(
                      t('slots:table.bankSize', { size: SLOT_BYTES.toLocaleString() }),
                      SLOT_BYTES.toLocaleString(),
                    )}
                    {state?.header != null && (
                      <span className="block text-[0.75rem] text-muted-foreground">
                        {numberWithUnit(
                          t('slots:table.imageSize', {
                            size: state.header.length.toLocaleString(),
                          }),
                          state.header.length.toLocaleString(),
                        )}
                      </span>
                    )}
                  </Field>
                  <Field label={t('slots:table.col.sha')}>
                    {/* Whole and selectable as one string: 16 digits a line in the table, 32 in a phone's card. */}
                    <span className="block w-[32ch] max-w-full font-mono text-[0.72rem] [overflow-wrap:anywhere] md:w-[16ch]">
                      {state?.sha256 ?? '—'}
                    </span>
                  </Field>
                </dl>
              </TableCell>

              <TableCell label={t('slots:table.col.actions')}>
                <div className="space-y-3">
                  <Action reason={dumpGate.reason} note={null} shared={sharing}>
                    <Button
                      variant="outline"
                      disabled={!dumpGate.enabled}
                      onClick={() => {
                        onDump(key);
                      }}
                    >
                      <Download />
                      {t('slots:table.dump')}
                    </Button>
                  </Action>

                  <Action reason={plainGate.reason} note={null} shared={sharing}>
                    <FilePickerButton
                      id={`slot-${key}-plain-file`}
                      variant="danger"
                      icon={<FileUp />}
                      label={t('slots:table.flashPlain')}
                      accept={IMAGE_ACCEPT}
                      disabled={!plainGate.enabled}
                      onPick={(file) => {
                        onPickFile(key, 'plain', file);
                      }}
                    />
                  </Action>

                  <Action reason={rawGate.reason} note={null} shared={sharing}>
                    <FilePickerButton
                      id={`slot-${key}-raw-file`}
                      variant="danger"
                      icon={<FileUp />}
                      label={t('slots:table.flashRaw')}
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

                  <Action
                    reason={copyReasons(copies)}
                    note={t('slots:table.copyNote')}
                    shared={sharing}
                  >
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

                  <Action
                    reason={plainGate.reason}
                    note={t('slots:table.restoreNote')}
                    shared={sharing}
                  >
                    <FilePickerButton
                      id={`slot-${key}-restore-file`}
                      variant="outline"
                      icon={<ArchiveRestore />}
                      label={t('slots:table.restore')}
                      accept={FULL_FLASH_ACCEPT}
                      disabled={!plainGate.enabled}
                      onPick={(file) => {
                        onPickRestore(key, file);
                      }}
                    />
                  </Action>

                  {fps.status === 'offer' && (
                    <Action reason={plainGate.reason} note={fpsNote(fps)} shared={sharing}>
                      <Button
                        variant="outline"
                        disabled={!plainGate.enabled}
                        onClick={() => {
                          onPatchFps(key);
                        }}
                      >
                        <Gauge />
                        {t('slots:table.makeFps', { hz: fps.toHz })}
                      </Button>
                    </Action>
                  )}

                  {/* The one reason every off control above is off for, once, under the buttons. */}
                  {shared !== null && (
                    <span className="block text-[0.75rem] leading-snug text-muted-foreground">
                      {shared}
                    </span>
                  )}

                  {fpsOff !== null && (
                    <span className="block text-[0.75rem] leading-snug text-muted-foreground">
                      {fpsOff}
                    </span>
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
