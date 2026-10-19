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
  bootedSlot,
  onPlaintextChain,
  bytesToHex,
  hexUp,
  targetSlot,
  upgradeTargetWarning,
  type DeviceState,
  type SlotState,
} from '@seek-fw/core';
import { KeyValue, type KeyValueRow } from './KeyValue';
import { Panel, PanelTitle } from './Panel';
import { Prose } from './Prose';
import { Alert } from './ui/alert';

/**
 * A bank's name as the slot table says it ("Bank A", "Recovery bank R"). The device info names a bank
 * "slot A"; the same bank must carry the same name on the same page (TESTING.md 42.19).
 */
function bankLabel(slot: SlotState): string {
  return slot.key === 'r' ? 'Recovery bank R' : `Bank ${slot.key.toUpperCase()}`;
}

function perDeviceKey(state: DeviceState): string | null {
  const slot = state.deviceKeySlot;
  if (slot === null) return null;
  const blank = slot.every((byte) => byte === 0xff) || slot.every((byte) => byte === 0);
  return blank ? 'not programmed — the camera falls back to Key B' : bytesToHex(slot);
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
  const booted = bootedSlot(state);
  const target = targetSlot(state);
  const cfg0Text =
    state.cfg0 === null
      ? null
      : `${hexUp(state.cfg0)} — ${state.profile.boot.describeCfg0(state.cfg0)}`;

  const bootloader =
    state.bootloaderString != null && state.bootloaderString !== ''
      ? `${state.bootloaderString}${
          state.bootloaderVersion != null && state.bootloaderVersion !== ''
            ? `  (${state.bootloaderVersion})`
            : ''
        }`
      : state.bootloaderVersion;

  const running: readonly KeyValueRow[] = [
    ['Version', state.version],
    ['Profile', state.profile.name],
    ['Build', state.buildString],
    ['Bootloader', bootloader],
    ['Platform', state.platform],
    ['Serial', state.serial],
    ['USB link', state.usbSpeed],
    ['Boot config', cfg0Text],
    /* On the 2014 plaintext chain the name is the active-slot word's, not a boot record (TESTING.md 42.10). */
    [
      onPlaintextChain(state.profile, state.version) ? 'Named booted' : 'Booted from',
      booted === null ? null : bankLabel(booted),
    ],
    /* The camera's own upgrade choice. This page writes the bank it is given, not this one. */
    [
      'Upgrade target (its own upgrade)',
      target === null ? null : `${bankLabel(target)} at ${hexUp(target.address)}`,
    ],
    ['Per-device key', perDeviceKey(state)],
  ];

  const orphans = orphanSlots(state);
  const targetIsOrphan = target !== null && orphans.includes(target);
  /* TESTING.md 42.50: the upgrade target is the bank the camera booted from. A warning, never a gate. */
  const targetWarning = upgradeTargetWarning(state, (slot, key) =>
    slot === undefined ? key.toUpperCase() : bankLabel(slot),
  );

  return (
    <>
      <Panel>
        <PanelTitle icon={<Microchip />}>Running firmware</PanelTitle>
        <KeyValue rows={running} />
        {targetWarning !== null && (
          <Alert tone="warn" className="mt-3">
            <p>{targetWarning}</p>
          </Alert>
        )}
      </Panel>

      {state.keyTable !== null && (
        <Panel>
          <PanelTitle icon={<KeyRound />}>Keys read from this camera</PanelTitle>
          <KeyValue
            rows={[
              ['Found at', `flash offset ${hexUp(state.keyTable.offset, 6)}`],
              ['Key A', bytesToHex(state.keyTable.keyA)],
              ['Key B', bytesToHex(state.keyTable.keyB)],
            ]}
          />
          <Prose className="mt-2.5">
            <p>
              Confirmed by matching a slot&apos;s keystream state, recovered from the ciphertext
              itself. Key&nbsp;A is what an upload has to be encrypted with.
            </p>
            <p>
              Each slot was decrypted in the browser by solving for its keystream from its own
              known-zero reset vectors. Decrypting is not the same as booting: the bootloader only
              ever tries {state.storeKey.name} and Key A, so a slot written under any other key
              checksums perfectly and is still skipped. Nothing was written.
            </p>
          </Prose>
        </Panel>
      )}

      {orphans.length > 0 && (
        <Alert tone="err">
          <p>
            <strong>
              {`${orphans.map(bankLabel).join(' and ')}${
                orphans.length > 1 ? ' hold' : ' holds'
              } a valid firmware image encrypted with a key this camera's bootloader does not know.`}
            </strong>{' '}
            The image is intact and its checksum is correct, but <code>image_try_keys()</code> only
            tries {state.storeKey.name} and Key A, so the bootloader skips{' '}
            {orphans.length > 1 ? 'them' : 'it'} and boots something else.
          </p>
          {targetIsOrphan && (
            <p>
              That is the slot an upgrade writes. The application running on this camera re-encrypts
              with that unknown key, so{' '}
              <strong>
                flashing through this page will produce another slot the bootloader cannot boot
              </strong>{' '}
              — the camera will carry on running{' '}
              {booted === null ? 'the other bank' : bankLabel(booted)}. Writing the slot directly
              with an SPI programmer or over SWD/J-Link is the way round it.
            </p>
          )}
        </Alert>
      )}
    </>
  );
}
