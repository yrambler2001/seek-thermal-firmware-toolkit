/* OWNER: reader agent. See ./types.ts. */
import { hex } from '../bytes.js';
import { SeekError } from '../errors.js';
import { readRunningFirmware } from '../workflows/capability.js';
import { readDeviceInfo } from '../workflows/device-info.js';
import type { DeviceState, WorkflowContext } from '../workflows/types.js';
import { buildSlotPlan } from './capability.js';
import type { SlotEntry, SlotPlan, SlotsReport, SlotView } from './types.js';

export interface InspectSlotsOptions {
  /**
   * The plan to join the camera's state against. Left out, the plan is the
   * capability matrix's own (`buildSlotPlan`). Tests inject a hand-built one so
   * the reader can be exercised before, and independently of, that matrix.
   */
  readonly plan?: SlotPlan;
}

/**
 * Identify the camera, read its banks, and join each one to what this build's
 * plan says about it.
 *
 * ORDER IS THE SAFETY PROPERTY. The build is asked for first, with the one
 * version read every workflow here makes, and the plan is consulted before any
 * bank is touched. An unsupported build (anything older than 0.8.0.0, or a
 * camera that does not say what it runs) is refused with the banks unread: the
 * wire ids a 0.7.x or 0.3.x build reads windows with mean something else, so the
 * bank reads that `readDeviceInfo` makes must not go out on them.
 */
export async function inspectSlots(
  ctx: WorkflowContext,
  options: InspectSlotsOptions = {},
): Promise<SlotsReport> {
  const firmware = await readRunningFirmware(ctx.device);
  const plan = options.plan ?? buildSlotPlan(ctx.profile, firmware.version);

  if (!plan.supportedBuild.supported) {
    throw new SeekError(
      'slots/refused',
      `refusing to read the firmware slots: ${plan.supportedBuild.reason}. Nothing beyond the ` +
        'version read was sent, so no bank was touched.',
      { detail: { firmwareVersion: firmware.version, profile: plan.profileId } },
    );
  }
  /* A plan is for ONE build of ONE profile. Joining a plan made for another
   * build would pair the camera's banks with the wrong rows, so it is refused. */
  if (plan.firmwareVersion !== firmware.version || plan.profileId !== ctx.profile.id) {
    throw new SeekError(
      'slots/refused',
      `the slot plan is for firmware ${plan.firmwareVersion ?? 'unknown'} under ` +
        `${plan.profileId}, but the camera reports ${firmware.version ?? 'no version'} under ` +
        `${ctx.profile.id}`,
      { detail: { firmwareVersion: firmware.version, profile: ctx.profile.id } },
    );
  }

  const state = await readDeviceInfo(ctx);
  /* The analysis must be of the build the plan was made for. A camera that
   * changed build between the two reads is not the one the plan describes. */
  if (state.version !== firmware.version) {
    throw new SeekError(
      'slots/refused',
      `the camera reported firmware ${firmware.version ?? 'none'} and then ` +
        `${state.version ?? 'none'} during one read; inspect it again`,
      { detail: { firmwareVersion: firmware.version, readVersion: state.version } },
    );
  }

  return { state, plan, slots: joinSlotViews(plan, state) };
}

/**
 * Each plan entry, joined to what the camera analysis found for its key.
 *
 * A slot is UNREAD, and has no `state`, when the plan has no read window for it
 * on this build, when the analysis has no entry for it, or when the read did not
 * complete. `unreadReason` says which, in the words the analysis used. A slot
 * that was read and holds no image is NOT unread: it has a `state` with
 * `present: false`, which is a different fact and is shown as one.
 */
export function joinSlotViews(
  plan: SlotPlan,
  state: Pick<DeviceState, 'byKey' | 'boot'>,
): SlotView[] {
  return plan.slots.map((entry: SlotEntry): SlotView => {
    const active = state.boot?.booted === entry.key;
    if (entry.read === null) {
      return {
        entry,
        state: null,
        unreadReason:
          `${entry.name} at ${hex(entry.address, 8)} is not readable on this build: its selector ` +
          'table has no window there, so nothing was armed for it',
        active,
      };
    }
    const found = state.byKey.get(entry.key) ?? null;
    if (found === null) {
      return {
        entry,
        state: null,
        unreadReason: `${entry.name} is missing from the camera analysis`,
        active,
      };
    }
    if (found.unread) {
      return {
        entry,
        state: null,
        unreadReason: found.reason ?? `${entry.name} was not read`,
        active,
      };
    }
    return { entry, state: found, unreadReason: null, active };
  });
}
