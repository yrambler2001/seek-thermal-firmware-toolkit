/**
 * The camera report the Info tab shows once it has read the camera: the same fields, in the same order, as
 * `seek-fw info` prints (TESTING.md 42.64). Camera, firmware, profile, boot, keys, every bank, and how the
 * camera can be written. The values come from the same core functions the CLI uses (the boot and key rows
 * and the writing verdict are core's workflows/device-report.ts, TESTING.md 42.84, 42.89); the words are the
 * CLI's, except where the page's own tabs are named.
 */

import type { ReactElement } from 'react';
import {
  bankWritingOf,
  bootableDescription,
  acceptsDescription,
  bootedReportOf,
  detectedReportOf,
  hexUp,
  keyReportRows,
  lastStartReportOf,
  nextStartReportOf,
  runningApplicationOf,
  upgradeTargetWarning,
  type DeviceState,
  type ReportRow,
  type SlotKey,
  type SlotState,
} from '@seek-fw/core';
import { cfg0Words } from '@/lib/core-text';
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
import { t } from '@/i18n';

export interface CameraReportProps {
  readonly state: DeviceState;
}

function yesNo(value: boolean): string {
  return value ? t('info:report.yes') : t('info:report.no');
}

function slotName(state: DeviceState, key: SlotKey): string {
  return state.byKey.get(key)?.name ?? key;
}

/** A row of core's report (`keyReportRows`), labelled as the page labels it: the CLI's words, capitalised. */
/* i18n: core message (the row's label and value are core's) */
function pageRow([label, value]: ReportRow): [string, string] {
  return [label.charAt(0).toUpperCase() + label.slice(1), value];
}

/** The running row, on 1.3.0.8 only: the build the camera's own per-bank answers name, or why not. */
function runningText(state: DeviceState): string | null {
  if (state.version !== '1.3.0.8') return null;
  const run = runningApplicationOf(state);
  if (run.build === null) {
    return t('info:report.buildNotKnown', { why: run.why }); // i18n: core message (why)
  }
  const build = run.build === 'ff-1308' ? t('info:report.buildFf') : t('info:report.build8Hz');
  return t('info:report.buildWhy', { build, why: run.why });
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
    size: slot.header === null ? '—' : t('info:report.bytes', { count: slot.header.length }),
    key: slot.keyName ?? (slot.plain === null ? '—' : t('info:report.plaintext')),
    accepts: acceptsDescription(slot), // i18n: core message
    /* "n/a" where the bootloader reads no footer: a missing one is not a fault there */
    footer: slot.present
      ? state.profile.boot.checksFooter
        ? yesNo(slot.footerOk)
        : t('info:report.notApplicable')
      : '—',
    bootable: slot.present ? bootableDescription(slot) : '—', // i18n: core message
  };
}

export function CameraReport({ state }: CameraReportProps): ReactElement {
  const warning = upgradeTargetWarning(state); // i18n: core message
  const running = runningText(state);
  const best = state.detection.best;
  const nameOf = (key: SlotKey): string => slotName(state, key);
  /* How the banks are written, on every line (core's `bankWritingOf`, the CLI's Writing section). */
  const bankWriting = bankWritingOf(state); // i18n: core message (staged, refusals)

  return (
    <>
      <Panel>
        <PanelTitle>{t('info:report.camera')}</PanelTitle>
        <KeyValue
          rows={[
            [t('info:report.product'), state.description.productName ?? t('info:report.noProduct')],
            [
              t('info:report.manufacturer'),
              state.description.manufacturerName ?? t('info:report.none'),
            ],
            [
              t('info:report.serial'),
              state.serial ?? state.description.serialNumber ?? t('info:report.unreadable'),
            ],
            [t('info:report.platform'), state.platform ?? t('info:report.unreadable')],
            [t('info:report.usbLink'), state.usbSpeed ?? t('info:report.unreadable')],
          ]}
        />
      </Panel>

      <Panel>
        <PanelTitle>{t('info:report.firmware')}</PanelTitle>
        <KeyValue
          rows={[
            [
              t('info:report.running'),
              state.version === null
                ? t('info:report.unreadable')
                : `${state.version}${state.buildString === null ? '' : `  ${state.buildString}`}`,
            ],
            [
              t('info:report.bootloader'),
              state.bootloaderVersion === null
                ? t('info:report.unreadable')
                : `${state.bootloaderVersion}${
                    state.bootloaderString === null ? '' : `  ${state.bootloaderString}`
                  }`,
            ],
          ]}
        />
      </Panel>

      <Panel>
        <PanelTitle>{t('info:report.family')}</PanelTitle>
        <KeyValue
          rows={[
            [t('info:report.readUnder'), state.profile.name],
            /* i18n: core message */
            [t('info:report.detected'), detectedReportOf(state.detection)],
          ]}
        />
        {best.reasons.length > 0 && (
          <Prose className="mt-2">
            <ul>
              {/* i18n: core message */}
              {best.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </Prose>
        )}
      </Panel>

      <Panel>
        <PanelTitle>{t('info:report.boot')}</PanelTitle>
        <KeyValue
          rows={[
            [
              'cfg[0]',
              state.cfg0 === null
                ? t('info:report.unreadable')
                : `${hexUp(state.cfg0)} — ${cfg0Words(state.profile.boot, state.cfg0)}`,
            ],
            /* i18n: core message (these three rows' values) */
            [t('info:report.booted'), bootedReportOf(state, nameOf)],
            [t('info:report.lastStart'), lastStartReportOf(state)],
            [t('info:report.running1308'), running],
            [t('info:report.nextStart'), nextStartReportOf(state, nameOf)],
            [
              t('info:report.upgradeTarget'),
              state.boot === null
                ? t('info:report.notReplayed')
                : state.targetConfirmed === null
                  ? slotName(state, state.boot.target)
                  : t('info:report.targetConfirmed', { slot: slotName(state, state.boot.target) }),
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
        <PanelTitle>{t('info:report.keys')}</PanelTitle>
        <KeyValue rows={keyReportRows(state).map(pageRow)} />
      </Panel>

      <Panel>
        <PanelTitle>{t('info:report.slots')}</PanelTitle>
        <Table>
          <TableCaption>{t('info:report.slotsCaption')}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>{t('info:report.slot')}</TableHead>
              <TableHead>{t('info:report.address')}</TableHead>
              <TableHead>{t('info:report.version')}</TableHead>
              <TableHead>{t('info:report.size')}</TableHead>
              <TableHead>{t('info:report.key')}</TableHead>
              <TableHead>{t('info:report.accepts')}</TableHead>
              <TableHead>{t('info:report.footer')}</TableHead>
              <TableHead>{t('info:report.bootable')}</TableHead>
              <TableHead>SHA-256</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.slots.map((slot) => {
              const cells = bankPresence(state, slot);
              return (
                <TableRow key={slot.key}>
                  <TableRowHeader className="font-semibold">{slot.name}</TableRowHeader>
                  <TableCell label={t('info:report.address')} className="font-mono">
                    {hexUp(slot.address)}
                  </TableCell>
                  <TableCell label={t('info:report.version')}>{cells.version}</TableCell>
                  <TableCell label={t('info:report.size')}>{cells.size}</TableCell>
                  <TableCell label={t('info:report.key')}>{cells.key}</TableCell>
                  <TableCell label={t('info:report.accepts')}>{cells.accepts}</TableCell>
                  <TableCell label={t('info:report.footer')}>{cells.footer}</TableCell>
                  <TableCell label={t('info:report.bootable')}>{cells.bootable}</TableCell>
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
                    {t('info:report.slotReason', { slot: slot.name, reason: slot.reason ?? '' })}
                  </li>
                ))}
            </ul>
          </Prose>
        )}
      </Panel>

      <Panel>
        <PanelTitle>{t('info:report.writing')}</PanelTitle>
        {bankWriting.staged === null ? (
          <Prose>
            <p>{t('info:report.noBankWritten')}</p>
            <ul>
              {bankWriting.refusals.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </Prose>
        ) : (
          <Prose>
            <p>{t('info:report.oneBank', { staged: bankWriting.staged })}</p>
            {bankWriting.refusals.length > 0 && (
              <>
                <p>{t('info:report.refusesEvery')}</p>
                <ul>
                  {bankWriting.refusals.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </>
            )}
          </Prose>
        )}
      </Panel>
    </>
  );
}
