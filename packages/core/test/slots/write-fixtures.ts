/* ==================================================================== *
 * Shared test plumbing for the slot writer: a SlotPlan built from a profile's
 * own window table, and the report that carries it. The writer reads only
 * SlotEntry.write / read / staging from the plan, so these stand in for the
 * capability matrix (`buildSlotPlan`) until that lands.
 * ==================================================================== */

import { SUPPORTED, type FirmwareProfile, type WindowEntry } from '../../src/profiles/types.js';
import type { SlotEntry, SlotKey, SlotPlan, SlotsReport, SlotView, StagingForm } from '../../src/slots/types.js';
import { SLOT_BYTES } from '../../src/slots/types.js';
import type { DeviceState } from '../../src/workflows/types.js';

/** The windows a build's plan names for one bank, taken from the profile's own table. */
export function windowAt(profile: FirmwareProfile, version: string, address: number): WindowEntry | null {
  return profile.windowPlan(version).windows.find((w) => w.address === address) ?? null;
}

export function entryFor(
  profile: FirmwareProfile,
  version: string,
  key: SlotKey,
  staging: StagingForm | null,
): SlotEntry {
  const descriptor = profile.slots.find((s) => s.key === key);
  if (descriptor === undefined) throw new Error(`profile has no slot ${key}`);
  const window = windowAt(profile, version, descriptor.address);
  return {
    key,
    name: descriptor.name,
    address: descriptor.address,
    length: SLOT_BYTES,
    read: window,
    write: window,
    dump: SUPPORTED,
    flashPlain: SUPPORTED,
    flashRaw: SUPPORTED,
    staging,
    commitEffect: 'bank-only',
    notes: [],
  };
}

export function planFor(
  profile: FirmwareProfile,
  version: string,
  staging: StagingForm | null,
): SlotPlan {
  return {
    profileId: profile.id,
    firmwareVersion: version,
    supportedBuild: SUPPORTED,
    slots: profile.slots.map((s) => entryFor(profile, version, s.key, staging)),
    notes: [],
  };
}

export function reportFor(state: DeviceState, plan: SlotPlan): SlotsReport {
  const slots: SlotView[] = plan.slots.map((entry) => ({
    entry,
    state: state.byKey.get(entry.key) ?? null,
    unreadReason: null,
    active: state.boot?.booted === entry.key,
  }));
  return { state, plan, slots };
}

