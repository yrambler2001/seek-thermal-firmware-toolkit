/* ==================================================================== *
 * Shared test plumbing for the slot writer: the report that carries a plan
 * (the plan itself comes from the capability matrix, `buildSlotPlan`), and the
 * profile window a boot-config or bootloader block is read through.
 * ==================================================================== */

import type { FirmwareProfile, WindowEntry } from '../../src/profiles/types.js';
import type { SlotPlan, SlotsReport, SlotView } from '../../src/slots/types.js';
import type { DeviceState } from '../../src/workflows/types.js';

/** The window a build's own table arms for one address, or null when it names none there. */
export function windowAt(profile: FirmwareProfile, version: string, address: number): WindowEntry | null {
  return profile.windowPlan(version).windows.find((w) => w.address === address) ?? null;
}

/** The report a writer call takes: the analysis, the plan, and one view per planned slot. */
export function reportFor(state: DeviceState, plan: SlotPlan): SlotsReport {
  const slots: SlotView[] = plan.slots.map((entry) => ({
    entry,
    state: state.byKey.get(entry.key) ?? null,
    unreadReason: null,
    active: state.boot?.booted === entry.key,
  }));
  return { state, plan, slots };
}
