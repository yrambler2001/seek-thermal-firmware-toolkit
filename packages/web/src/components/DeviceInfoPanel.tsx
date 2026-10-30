/**
 * The device info the slots page shows once it has read the camera: what the
 * camera is running, its boot config and upgrade target, the keys it holds, and
 * the slots the bootloader provably skips.
 *
 * It does NOT list the three banks. The slot table on the same page (`SlotTable`)
 * already shows each bank's firmware, size, key, bootability and SHA-256, so
 * repeating them here would only put two copies of one fact on the screen.
 */

import type { ReactElement } from 'react';
import { KeyRound, Microchip } from 'lucide-react';
import {
  bankNameOf,
  bootedSlot,
  bytesToHex,
  hexUp,
  targetSlot,
  type DeviceState,
  type SlotKey,
  type SlotState,
  bankParam,
  nextStartReportMessage,
  upgradeTargetWarningMessage,
} from '@seek-fw/core';
import { cfg0Words, nullableCoreText } from '@/lib/core-text';
import { KeyValue, type KeyValueRow } from './KeyValue';
import { Panel, PanelTitle } from './Panel';
import { Prose } from './Prose';
import { Alert } from './ui/alert';
import { listAnd, t, useT } from '@/i18n';

/**
 * A bank's name as the slot table says it ("Slot A", "Recovery R"), core's `bankNameOf`, the same on every
 * camera family; the same bank carries the same name on the same page (TESTING.md 42.19, 42.108).
 */
function bankLabel(slot: SlotState): string {
  return bankLabelOf(slot.key);
}

/** The same name, from the bank's key alone. */
function bankLabelOf(key: SlotKey): string {
  return bankNameOf(key);
}

function perDeviceKey(state: DeviceState): string | null {
  const slot = state.deviceKeySlot;
  if (slot === null) return null;
  const blank = slot.every((byte) => byte === 0xff) || slot.every((byte) => byte === 0);
  return blank ? t('shared:deviceInfo.notProgrammed') : bytesToHex(slot);
}

/** Slots the bootloader provably skips: everything checks out but the key it tries. */
function orphanSlots(state: DeviceState): readonly SlotState[] {
  const checksFooter = state.profile.boot.checksFooter;
  return state.slots.filter(
    (slot) =>
      slot.present &&
      slot.accepts &&
      (slot.footerOk || !checksFooter) &&
      slot.bootability === 'not-bootable',
  );
}

export interface DeviceInfoPanelProps {
  readonly state: DeviceState;
}

export function DeviceInfoPanel({ state }: DeviceInfoPanelProps): ReactElement {
  const { rich } = useT();
  const booted = bootedSlot(state);
  const target = targetSlot(state);
  const cfg0Text =
    state.cfg0 === null
      ? null
      : `${hexUp(state.cfg0)} — ${cfg0Words(state.profile.boot, state.cfg0)}`;

  const bootloader =
    state.bootloaderString != null && state.bootloaderString !== ''
      ? `${state.bootloaderString}${
          state.bootloaderVersion != null && state.bootloaderVersion !== ''
            ? `  (${state.bootloaderVersion})`
            : ''
        }`
      : state.bootloaderVersion;

  const running: readonly KeyValueRow[] = [
    [t('shared:deviceInfo.version'), state.version],
    [t('shared:deviceInfo.family'), state.profile.name],
    [t('shared:deviceInfo.build'), state.buildString],
    [t('shared:deviceInfo.bootloader'), bootloader],
    [t('shared:deviceInfo.platform'), state.platform],
    [t('shared:deviceInfo.serial'), state.serial],
    [t('shared:deviceInfo.usbLink'), state.usbSpeed],
    [t('shared:deviceInfo.bootConfig'), cfg0Text],
    /* On the locked line the bank is the active-slot word's, which is the bootloader's own record of the
     * bank it entered (TESTING.md 42.53, 42.56: measured on 1.3.0.0 and 1.0.3.0 for boot words 0, 1, 2). */
    [t('shared:deviceInfo.bootedFrom'), booted === null ? null : bankLabel(booted)],
    /* The bank the next start runs, where the boot rule and each bank's check are decoded (core's
     * `nextStartReportOf`: the 2014 plaintext chain and the 2016 Compact PRO); hidden elsewhere. */
    [
      t('shared:deviceInfo.nextStart'),
      nullableCoreText(nextStartReportMessage(state, (key) => bankParam(key, 'name'))),
    ],
    /* The camera's own upgrade choice. This page writes the bank it is given, not this one. */
    [
      t('shared:deviceInfo.upgradeTarget'),
      target === null
        ? null
        : t('shared:deviceInfo.bankAt', {
            bank: bankLabel(target),
            address: hexUp(target.address),
          }),
    ],
    [t('shared:deviceInfo.perDeviceKey'), perDeviceKey(state)],
  ];

  const orphans = orphanSlots(state);
  const targetIsOrphan = target !== null && orphans.includes(target);
  /* TESTING.md 42.50: the upgrade target is the bank the camera booted from. A warning, never a gate. */
  const targetWarning = nullableCoreText(
    upgradeTargetWarningMessage(state, (_slot, key) => bankParam(key, 'name')),
  );

  return (
    <>
      <Panel>
        <PanelTitle icon={<Microchip />}>{t('shared:deviceInfo.running')}</PanelTitle>
        <KeyValue rows={running} />
        {targetWarning !== null && (
          <Alert tone="warn" className="mt-3">
            <p>{targetWarning}</p>
          </Alert>
        )}
      </Panel>

      {state.keyTable !== null && (
        <Panel>
          <PanelTitle icon={<KeyRound />}>{t('shared:deviceInfo.keysTitle')}</PanelTitle>
          <KeyValue
            rows={[
              [
                t('shared:deviceInfo.foundAt'),
                t('shared:deviceInfo.flashOffset', { offset: hexUp(state.keyTable.offset, 6) }),
              ],
              [t('shared:deviceInfo.keyA'), bytesToHex(state.keyTable.keyA)],
              [t('shared:deviceInfo.keyB'), bytesToHex(state.keyTable.keyB)],
            ]}
          />
          <Prose className="mt-2.5">
            <p>
              {rich('shared:deviceInfo.keysConfirmed', {
                params: { storeKey: state.storeKey.name },
              })}
            </p>
            <p>
              {rich('shared:deviceInfo.keysDecrypted', {
                params: { storeKey: state.storeKey.name },
              })}
            </p>
          </Prose>
        </Panel>
      )}

      {orphans.length > 0 && (
        <Alert tone="err">
          <p>
            {rich('shared:deviceInfo.orphan', {
              params: {
                count: orphans.length,
                banks: listAnd(orphans.map(bankLabel)),
                storeKey: state.storeKey.name,
              },
            })}
          </p>
          {targetIsOrphan && (
            <p>
              {rich('shared:deviceInfo.orphanIsTarget', {
                params: {
                  bank: booted === null ? t('shared:deviceInfo.otherBank') : bankLabel(booted),
                },
              })}
            </p>
          )}
        </Alert>
      )}
    </>
  );
}
