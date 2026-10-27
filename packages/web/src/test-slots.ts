/**
 * Slot fixtures for the tests: a build's plan, a read of the three banks, and
 * the answers a fake backend hands back. Nothing here talks to a camera.
 *
 * The one real input is a `DeviceState` (see `fakeDeviceState` in
 * test-fixtures.ts), which every report carries. Its slot is copied, so every
 * field a bank row shows is a value the page would really have been given.
 */

import {
  detectProfile,
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
  a: 'Slot A',
  b: 'Slot B',
  r: 'Recovery R',
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

/** The decrypted image a bank that holds one carries, as an analysis that decrypted it has it. */
export const SLOT_PLAIN: Uint8Array = new Uint8Array(0x100).fill(0x5a);

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
    plain: SLOT_PLAIN,
    keyName: 'Key A',
    bootable: true,
    bootability: 'bootable',
    accepts: true,
    footerOk: true,
    sha256: 'ee'.repeat(32),
    ...overrides,
  };
}

/** One bank as a read found it erased: a clean read of all 0xFF, no image, `blank` set. */
export function emptySlotState(
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
    present: false,
    blank: true,
    reason: 'no image header (magic 0xFFFFFFFF)',
    unread: false,
    header: null,
    raw: null,
    footer: null,
    recovered: null,
    plain: null,
    plainHeader: null,
    accepts: false,
    footerOk: false,
    sha256: null,
    keyName: null,
    bootable: false,
    bootability: 'not-bootable',
    ...overrides,
  };
}

/** A bank view whose bank is empty. */
export function emptySlotView(
  base: DeviceState,
  key: SlotKey,
  overrides: Partial<SlotView> = {},
): SlotView {
  return slotView(base, key, {
    state: emptySlotState(base, key),
    content: 'empty',
    active: false,
    ...overrides,
  });
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
export function slotReport(
  base: DeviceState,
  unread: SlotKey | null = null,
  empty: readonly SlotKey[] = [],
): SlotsReport {
  const slots = (['a', 'b', 'r'] as const).map((key) =>
    key === unread
      ? slotView(base, key, {
          state: null,
          unreadReason: 'the window would not arm',
          content: 'unread',
        })
      : empty.includes(key)
        ? emptySlotView(base, key)
        : slotView(base, key),
  );
  return { state: base, plan: slotPlan(true), slots };
}

export function actingProfile(): ActingProfile {
  return {
    profile: getProfile('modern-4x'),
    detection: detectProfile({ firmwareVersion: '0.8.0.0' }),
    firmwareVersion: '0.8.0.0',
    buildString: null,
  };
}

/** What dumping an empty bank returns: the raw 64 KiB of 0xFF, nothing decrypted. */
export function dumpedEmptySlot(key: SlotKey): DumpedSlot {
  return {
    key,
    address: SLOT_ADDRESS[key],
    raw: new Uint8Array(0x10000).fill(0xff),
    sha256: 'ff'.repeat(32),
    empty: true,
    plain: null,
    plainSha256: null,
    notes: ['empty, nothing to decrypt: all 65536 B of the bank read as 0xFF'],
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

export function preparedSlot(
  key: SlotKey,
  kind: SlotInputKind,
  bytes: Uint8Array,
  targetEmpty = false,
): SlotFlashPlan {
  return {
    targetEmpty,
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
    imageBuild: null,
    notes: [],
    serial: null,
    firmwareVersion: '4.9.1.5',
  };
}

export function flashedSlot(key: SlotKey, verified: boolean | null = true): FlashSlotResult {
  return { key, commitStatus: 0, verified, after: null, notes: [] };
}

/* ---- the 2016 Compact PRO (TESTING.md 42.84) --------------------------------------------------- */

/** Key block 1 of the Compact PRO 1.0.3.x 9 Hz pair (core's preservation/patch.ts KEY_PAIRS.cp103). */
export const BLOCK_1_2016 = 'faacb3c6f1412469bd122fb82d78160d';

/** The decrypted image recovery R holds in the 2016 fixture: the bank a test may call patched. */
export const PLAIN_R_2016: Uint8Array = new Uint8Array(0x100).fill(0x18);

function hexBytes(hex: string): Uint8Array {
  return Uint8Array.from(hex.match(/../g) ?? [], (pair) => Number.parseInt(pair, 16));
}

/**
 * A Compact PRO 1.0.3.0 read under compact-2016, built on a real read's shape (`base`): cfg[0] erased
 * (0xFFFFFFFF), the camera reports it entered slot A, and the key its bootloader checks a bank under is
 * named from slot A (key block 1), so every bank stored under it is bootable. With `checkKeyNamed` false
 * the active-slot word is unread and no bank has a verdict. The read refuses no bank write on this line
 * (`bankWriteRefusals` empty: no key table is needed).
 */
export function deviceState2016(
  base: DeviceState,
  options: { readonly checkKeyNamed?: boolean } = {},
): DeviceState {
  const named = options.checkKeyNamed ?? true;
  const header: ImageHeader = { ...SLOT_HEADER, length: 51848, versionStr: '1.0.3.0' };
  const slots = (['a', 'b', 'r'] as const).map((key) =>
    readSlotState(base, key, {
      name: SLOT_NAME[key],
      raw: new Uint8Array(0x10000),
      blank: false,
      plain: key === 'r' ? PLAIN_R_2016 : SLOT_PLAIN,
      header,
      plainHeader: header,
      keyName: named ? 'key block 1' : 'unknown key',
      bootable: named,
      bootability: named ? 'bootable' : 'unknown',
      footerOk: false,
    }),
  );
  return {
    ...base,
    profile: getProfile('compact-2016'),
    version: '1.0.3.0',
    bootloaderVersion: '1.2.0.0',
    plainChain: false,
    cfg0: 0xffffffff,
    activeSlotWord: named ? 0 : null,
    slots,
    byKey: new Map(slots.map((slot) => [slot.key, slot])),
    boot: named ? { booted: 'a', target: 'b' } : null,
    targetConfirmed: null,
    keyTable: null,
    keyTableCandidates: 0,
    keyWhiteningK: 0,
    deviceKeySlot: null,
    storeKey: {
      name: named ? 'key block 1' : 'the key its bootloader checks a bank under',
      key: named ? hexBytes(BLOCK_1_2016) : null,
      programmed: false,
    },
    checkKey: named
      ? {
          name: 'key block 1',
          key: hexBytes(BLOCK_1_2016),
          from: 'a',
          inferred: false,
          pair: 'the Compact PRO 1.0.3.x 9 Hz pair',
          unnamedWhy: null,
          why: 'check key: key block 1',
        }
      : {
          name: null,
          key: null,
          from: null,
          inferred: false,
          pair: null,
          unnamedWhy:
            "the camera's active-slot word (fw info roots, selector 10) could not be read",
          why: 'check key not named',
        },
    bankWriteRefusals: [],
  };
}

/** The slots report of `deviceState2016`: its three banks, staged under each image's own key block 0. */
export function slotReport2016(
  base: DeviceState,
  options: { readonly checkKeyNamed?: boolean } = {},
): SlotsReport {
  const state = deviceState2016(base, options);
  const entries = (['a', 'b', 'r'] as const).map((key) =>
    slotEntry(key, { staging: 'slot-keystream-ciphertext' }),
  );
  return {
    state,
    plan: slotPlan(true, { profileId: 'compact-2016', firmwareVersion: '1.0.3.0', slots: entries }),
    slots: entries.map((entry): SlotView => ({
      entry,
      state: state.byKey.get(entry.key) ?? null,
      unreadReason: null,
      content: 'image',
      active: state.boot?.booted === entry.key,
    })),
  };
}
