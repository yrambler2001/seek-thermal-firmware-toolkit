/**
 * The camera report the Info tab shows once it has read the camera: the same fields, in the same order, as
 * `seek-fw info` prints (TESTING.md 42.64). Camera, firmware, profile, boot, keys, every bank, and how the
 * camera can be written. The values come from the same core functions the CLI uses (the boot and key rows
 * and the 2016 writing verdict are core's workflows/device-report.ts, TESTING.md 42.84); the words are the
 * CLI's, except where the page's own tabs are named.
 */

import type { ReactElement } from 'react';
import {
  bankWritingOf,
  bootableDescription,
  bootedReportOf,
  detectedReportOf,
  hexUp,
  keyReportRows,
  nextStartReportOf,
  runningApplicationOf,
  upgradeTargetWarning,
  type DeviceState,
  type ReportRow,
  type SlotKey,
  type SlotState,
} from '@seek-fw/core';
import { KeyValue } from './KeyValue';
import { Panel, PanelTitle } from './Panel';
import { Prose } from './Prose';
import { Alert } from './ui/alert';
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

export interface CameraReportProps {
  readonly state: DeviceState;
}

function yesNo(value: boolean): string {
  return value ? 'yes' : 'no';
}

function slotName(state: DeviceState, key: SlotKey): string {
  return state.byKey.get(key)?.name ?? key;
}

/** A row of core's report (`keyReportRows`), labelled as the page labels it: the CLI's words, capitalised. */
function pageRow([label, value]: ReportRow): [string, string] {
  return [label.charAt(0).toUpperCase() + label.slice(1), value];
}

/** The running row, on 1.3.0.8 only: the build the camera's own per-bank answers name, or why not. */
function runningText(state: DeviceState): string | null {
  if (state.version !== '1.3.0.8') return null;
  const run = runningApplicationOf(state);
  if (run.build === null) {
    return (
      `not known: ${run.why}. A 16 Hz FF image needs the camera to say which build it runs ` +
      '(the slots tab asks)'
    );
  }
  const build = run.build === 'ff-1308' ? 'the 16 Hz FF 1.3.0.8 build' : 'the 8 Hz 1.3.0.8 build';
  return `${build}: ${run.why}`;
}

function bankPresence(
  state: DeviceState,
  slot: SlotState,
): {
  readonly version: string;
  readonly size: string;
  readonly key: string;
  readonly accepts: string;
  readonly footer: string;
  readonly bootable: string;
} {
  return {
    version: slot.present ? (slot.plainHeader?.versionStr ?? slot.header?.versionStr ?? '?') : '—',
    size: slot.header === null ? '—' : `${String(slot.header.length)} B`,
    key: slot.keyName ?? (slot.plain === null ? '—' : 'none (plaintext)'),
    accepts: slot.present ? yesNo(slot.accepts) : '—',
    /* "n/a" where the bootloader reads no footer: a missing one is not a fault there */
    footer: slot.present ? (state.profile.boot.checksFooter ? yesNo(slot.footerOk) : 'n/a') : '—',
    bootable: slot.present ? bootableDescription(slot) : '—',
  };
}

export function CameraReport({ state }: CameraReportProps): ReactElement {
  const warning = upgradeTargetWarning(state);
  const running = runningText(state);
  const best = state.detection.best;
  const nameOf = (key: SlotKey): string => slotName(state, key);
  /* The 2016 line writes its banks one at a time, and has no whole-image write (core's `bankWritingOf`). */
  const bankWriting = bankWritingOf(state);

  return (
    <>
      <Panel>
        <PanelTitle>Camera</PanelTitle>
        <KeyValue
          rows={[
            ['Product', state.description.productName ?? '(no product string)'],
            ['Manufacturer', state.description.manufacturerName ?? '(none)'],
            ['Serial', state.serial ?? state.description.serialNumber ?? '(unreadable)'],
            ['Platform', state.platform ?? '(unreadable)'],
            ['USB link', state.usbSpeed ?? '(unreadable)'],
          ]}
        />
      </Panel>

      <Panel>
        <PanelTitle>Firmware</PanelTitle>
        <KeyValue
          rows={[
            [
              'Running',
              state.version === null
                ? '(unreadable)'
                : `${state.version}${state.buildString === null ? '' : `  ${state.buildString}`}`,
            ],
            [
              'Bootloader',
              state.bootloaderVersion === null
                ? '(unreadable)'
                : `${state.bootloaderVersion}${
                    state.bootloaderString === null ? '' : `  ${state.bootloaderString}`
                  }`,
            ],
          ]}
        />
      </Panel>

      <Panel>
        <PanelTitle>Profile</PanelTitle>
        <KeyValue
          rows={[
            ['Read under', `${state.profile.id} — ${state.profile.name}`],
            ['Detected', detectedReportOf(state.detection)],
          ]}
        />
        {best.reasons.length > 0 && (
          <Prose className="mt-2">
            <ul>
              {best.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </Prose>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Boot</PanelTitle>
        <KeyValue
          rows={[
            [
              'cfg[0]',
              state.cfg0 === null
                ? '(unreadable)'
                : `${hexUp(state.cfg0)} — ${state.profile.boot.describeCfg0(state.cfg0)}`,
            ],
            ['Booted', bootedReportOf(state, nameOf)],
            ['Running (1.3.0.8)', running],
            ['Next start', nextStartReportOf(state, nameOf)],
            [
              'Upgrade target',
              state.boot === null
                ? '(not replayed)'
                : `${slotName(state, state.boot.target)}${
                    state.targetConfirmed === null ? '' : ' (confirmed on the wire)'
                  }`,
            ],
          ]}
        />
        {warning !== null && (
          <Alert tone="warn" className="mt-3">
            <p>{warning}</p>
          </Alert>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Keys</PanelTitle>
        <KeyValue rows={keyReportRows(state).map(pageRow)} />
      </Panel>

      <Panel>
        <PanelTitle>Slots</PanelTitle>
        <Table>
          <TableCaption>
            Each bank as the read found it. Read-only: the Slots tab writes.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Slot</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Accepts</TableHead>
              <TableHead>Footer</TableHead>
              <TableHead>Bootable</TableHead>
              <TableHead>SHA-256</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.slots.map((slot) => {
              const cells = bankPresence(state, slot);
              return (
                <TableRow key={slot.key}>
                  <TableRowHeader className="font-semibold">{slot.name}</TableRowHeader>
                  <TableCell label="Address" className="font-mono">
                    {hexUp(slot.address)}
                  </TableCell>
                  <TableCell label="Version">{cells.version}</TableCell>
                  <TableCell label="Size">{cells.size}</TableCell>
                  <TableCell label="Key">{cells.key}</TableCell>
                  <TableCell label="Accepts">{cells.accepts}</TableCell>
                  <TableCell label="Footer">{cells.footer}</TableCell>
                  <TableCell label="Bootable">{cells.bootable}</TableCell>
                  <TableCell label="SHA-256" className="font-mono">
                    {slot.sha256 === null ? '—' : slot.sha256.slice(0, 16)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {state.slots.some((slot) => slot.reason !== null) && (
          <Prose className="mt-2">
            <ul>
              {state.slots
                .filter((slot) => slot.reason !== null)
                .map((slot) => (
                  <li key={slot.key}>
                    {slot.name}: {slot.reason}
                  </li>
                ))}
            </ul>
          </Prose>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Writing</PanelTitle>
        {bankWriting !== null ? (
          <Prose>
            <p>
              One bank at a time: the Slots tab writes or patches one bank of this camera, each
              staged under its image&apos;s own key block 0, and each write asks first. A
              whole-image write is not available on this line.
            </p>
            {bankWriting.refusals.length > 0 && (
              <>
                <p>The Slots tab refuses every bank of this camera:</p>
                <ul>
                  {bankWriting.refusals.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </>
            )}
          </Prose>
        ) : state.canFlash ? (
          <Prose>
            <p>
              Available: the Slots tab can write one bank of this camera, and each write asks first.
            </p>
          </Prose>
        ) : (
          <Prose>
            <p>Not available for a whole-image write:</p>
            <ul>
              {state.flashBlockedBy.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </Prose>
        )}
      </Panel>
    </>
  );
}
