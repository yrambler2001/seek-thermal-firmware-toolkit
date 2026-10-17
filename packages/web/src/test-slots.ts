/**
 * Slot fixtures for the tests: a build's plan, a read of the three banks, and
 * the answers a fake backend hands back. Nothing here talks to a camera.
 *
 * The one real input is a `DeviceState` (see `fakeDeviceState` in
 * test-fixtures.ts), which every report carries. Its slot is copied, so every
 * field a bank row shows is a value the page would really have been given.
 */

import {
  getProfile,
  type DeviceState,
  type DumpedSlot,
  type FlashSlotResult,
  type ImageHeader,
  type SlotEntry,
  type SlotFlashPlan,
  type SlotInputKind,
  type SlotKey,
  type SlotPlan,
  type SlotState,
  type SlotView,
  type SlotsReport,
} from '@seek-fw/core';
import type { ActingProfile } from './lib/identify';

export const SLOT_ADDRESS: Readonly<Record<SlotKey, number>> = {
  a: 0x1405_0000,
  b: 0x1406_0000,
  r: 0x1407_0000,
};

export const SLOT_NAME: Readonly<Record<SlotKey, string>> = {
  a: 'slot A',
  b: 'slot B',
  r: 'recovery R',
};

export const SLOT_HEADER: ImageHeader = {
  sp: 0x1000_4000,
  reset: 0x1403_0201,
  magic: 0x1234,
  length: 0x1c000,
  imageId: 0x11,
  version: 0x0004_0901,
  entry: 0,
  adjust: 0,
  versionStr: '4.9.1.5',
};

export const UNSUPPORTED_REASON =
  'firmware 0.7.4.0 predates the slot workflows (0.8.0.0 and newer)';

export function slotEntry(key: SlotKey, overrides: Partial<SlotEntry> = {}): SlotEntry {
  return {
    key,
    name: SLOT_NAME[key],
    address: SLOT_ADDRESS[key],
    length: 0x10000,
    read: null,
    write: null,
    dump: { supported: true },
    flashPlain: { supported: true },
    flashRaw: { supported: true },
    staging: 'plain',
    commitEffect: 'bank-only',
    emptyBank: { writable: { supported: true }, why: 'an empty bank is written like a used one' },
    notes: [],
    ...overrides,
  };
}

/** A build the page supports, or one it reports and does not touch. */
export function slotPlan(supported: boolean, overrides: Partial<SlotPlan> = {}): SlotPlan {
  return {
    profileId: 'modern-4x',
    firmwareVersion: supported ? '0.8.0.0' : '0.7.4.0',
    supportedBuild: supported
      ? { supported: true }
      : { supported: false, reason: UNSUPPORTED_REASON },
    slots: [slotEntry('a'), slotEntry('b'), slotEntry('r')],
    notes: [],
    ...overrides,
  };
}

/** One bank as a read found it: present, decrypted, bootable. */
export function readSlotState(
  base: DeviceState,
  key: SlotKey,
  overrides: Partial<SlotState> = {},
): SlotState {
  const template = base.slots[0];
  if (template === undefined) throw new Error('the fake camera has no slot to copy');
  return {
    ...template,
    key,
    name: SLOT_NAME[key],
    address: SLOT_ADDRESS[key],
    present: true,
    reason: null,
    unread: false,
    header: SLOT_HEADER,
    plainHeader: SLOT_HEADER,
    keyName: 'Key A',
    bootable: true,
    bootability: 'bootable',
    accepts: true,
    footerOk: true,
    sha256: 'ee'.repeat(32),
    ...overrides,
  };
}

export function slotView(
  base: DeviceState,
  key: SlotKey,
  overrides: Partial<SlotView> = {},
): SlotView {
  return {
    entry: slotEntry(key),
    state: readSlotState(base, key),
    unreadReason: null,
    content: 'image',
    active: key === 'a',
    ...overrides,
  };
}

/**
 * The three banks: slot A is the one booted, B a standby, R recovery. `unread`
 * names the one whose window would not arm, which leaves its state null.
 */
export function slotReport(base: DeviceState, unread: SlotKey | null = null): SlotsReport {
  const slots = (['a', 'b', 'r'] as const).map((key) =>
    key === unread
      ? slotView(base, key, {
          state: null,
          unreadReason: 'the window would not arm',
          content: 'unread',
        })
      : slotView(base, key),
  );
  return { state: base, plan: slotPlan(true), slots };
}

export function actingProfile(): ActingProfile {
  return {
    profile: getProfile('modern-4x'),
    detection: null,
    firmwareVersion: '0.8.0.0',
    buildString: null,
    forced: false,
  };
}

export function dumpedSlot(key: SlotKey): DumpedSlot {
  return {
    key,
    address: SLOT_ADDRESS[key],
    raw: new Uint8Array(0x10000).fill(0xab),
    sha256: 'ab'.repeat(32),
    empty: false,
    plain: new Uint8Array(0x10000).fill(0x01),
    plainSha256: 'cd'.repeat(32),
    notes: [],
  };
}

export function preparedSlot(key: SlotKey, kind: SlotInputKind, bytes: Uint8Array): SlotFlashPlan {
  return {
    key,
    address: SLOT_ADDRESS[key],
    kind,
    staging: kind === 'plain' ? 'key-a-ciphertext' : 'verbatim',
    payload: bytes,
    sum16: 0x1234,
    expectedStored: null,
    compare: [
      { field: 'version', before: '4.9.1.5', after: '4.9.1.6' },
      { field: 'image id', before: '0x00000011', after: '0x00000012' },
    ],
    warnings: key === 'b' ? [] : ['this write targets a bank that matters'],
    serial: null,
    firmwareVersion: '4.9.1.5',
  };
}

export function flashedSlot(key: SlotKey, verified: boolean | null = true): FlashSlotResult {
  return { key, commitStatus: 0, verified, after: null, notes: [] };
}
