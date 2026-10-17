/* OWNER: reader agent. See ./types.ts. */
import { hex } from '../bytes.js';
import { SeekError } from '../errors.js';
import { readRunningFirmware, type RunningFirmware } from '../workflows/capability.js';
import { profileToRereadUnder, readDeviceInfo } from '../workflows/device-info.js';
import type { DeviceState, SlotState, WorkflowContext } from '../workflows/types.js';
import { buildSlotPlan } from './capability.js';
import type { SlotContent, SlotEntry, SlotPlan, SlotsReport, SlotView } from './types.js';

/** The build the caller already read: what `readRunningFirmware` or an identify probe returns. */
export type InspectFirmware = Pick<RunningFirmware, 'version'>;

export interface InspectSlotsOptions {
  /**
   * The plan to join the camera's state against. Left out, the plan is the
   * capability matrix's own (`buildSlotPlan`). Tests inject a hand-built one so
   * the reader can be exercised before, and independently of, that matrix.
   */
  readonly plan?: SlotPlan;
  /**
   * The build the caller has already read on this same transport, in this run.
   * Left out, the reader asks the camera for its version itself, as the CLI
   * does. Passed, the reader sends no version read of its own, and everything
   * else is checked as before: the plan is for this build, and `readDeviceInfo`
   * must report this same version, or the run is refused.
   */
  readonly firmware?: InspectFirmware;
}

/**
 * Identify the camera, read its banks, and join each one to what this build's
 * plan says about it.
 *
 * ORDER IS THE SAFETY PROPERTY. The build is asked for first, with the one
 * version read every workflow here makes (or is taken from the caller, who asked
 * for it the same way), and the plan is consulted before any bank is touched.
 * An unsupported build (anything older than 0.8.0.0, or a camera that does not
 * say what it runs) is refused with the banks unread: the
 * wire ids a 0.7.x or 0.3.x build reads windows with mean something else, so the
 * bank reads that `readDeviceInfo` makes must not go out on them.
 */
export async function inspectSlots(
  ctx: WorkflowContext,
  options: InspectSlotsOptions = {},
): Promise<SlotsReport> {
  /* THE BUILD, READ ONCE. A caller that has already read it, on this transport
   * and in this run (the web page's identify step does), passes it, and no
   * second version read goes out. The checks below run on it exactly as they do
   * on a read made here. The camera is still checked: `readDeviceInfo` reads the
   * version under its own plan, and the run is refused below if that is not the
   * version passed in. No serial is compared, because a run's only identity is
   * the transport it was opened on. Left out, the version read is made here, and
   * it is the only request sent before an unsupported build is refused. */
  const firmware: InspectFirmware = options.firmware ?? (await readRunningFirmware(ctx.device));
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
        ctx.profile.id,
      { detail: { firmwareVersion: firmware.version, profile: ctx.profile.id } },
    );
  }

  let state = await readDeviceInfo(ctx);
  let finalPlan = plan;
  /* JUDGED UNDER WHAT THE CAMERA IS, as the flash page and `seek-fw info` do.
   * The first read acts under the probe's pick, chosen before any bank was
   * read; on a 2016 Compact PRO that is legacy-auth by design, whose 0xFFFF
   * target fails every bank ("unknown key, NOT bootable"). When the banks
   * confidently name a family with a different cipher, the read is redone under
   * it, and the plan is rebuilt for that family (unless a plan was injected). */
  const better = profileToRereadUnder(state, false);
  if (better !== null) {
    ctx.reporter.log(
      `the slots identify this camera as ${better.name} (${better.id}), whose cipher differs ` +
        'from the one this read used — reading again under it',
      'warn',
    );
    state = await readDeviceInfo({ ...ctx, profile: better, detection: state.detection });
    if (options.plan === undefined) finalPlan = buildSlotPlan(better, firmware.version);
  }
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

  const slots = joinSlotViews(finalPlan, state);
  /* An empty bank is a state, not a fault: said once, plainly, in the run log (the
   * analysis' own line for it is a warning, which reads like a problem). */
  for (const view of slots) {
    if (view.content === 'empty') {
      ctx.reporter.log(
        `${view.entry.name} is empty: its header window reads as all 0xFF, so it holds no image ` +
          `and nothing is decrypted. ${view.entry.emptyBank.writable.supported ? 'It can be written.' : view.entry.emptyBank.why}`,
        'ok',
      );
    }
  }
  return { state, plan: finalPlan, slots };
}

/**
 * What one bank holds, from its analysis. 'empty' is an erased bank (the header
 * window read as all 0xFF on a clean read); it is not 'foreign', which is a bank
 * that holds bytes this page does not recognise as an image, and it is not
 * 'unread', which is a bank the read never got a clean answer from.
 */
export function slotContentOf(state: SlotState | null): SlotContent {
  if (state === null) return 'unread';
  if (state.present) return 'image';
  return state.blank === true ? 'empty' : 'foreign';
}

/**
 * Each plan entry, joined to what the camera analysis found for its key.
 *
 * A slot is UNREAD, and has no `state`, when the plan has no read window for it
 * on this build, when the analysis has no entry for it, or when the read did not
 * complete. `unreadReason` says which, in the words the analysis used. A slot
 * that was read and holds no image is NOT unread: it has a `state` with
 * `present: false`, which is a different fact and is shown as one, and `content`
 * names it: 'empty' for an erased bank, 'foreign' for bytes that are not an image.
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
        content: 'unread',
        active,
      };
    }
    const found = state.byKey.get(entry.key) ?? null;
    if (found === null) {
      return {
        entry,
        state: null,
        unreadReason: `${entry.name} is missing from the camera analysis`,
        content: 'unread',
        active,
      };
    }
    if (found.unread) {
      return {
        entry,
        state: null,
        unreadReason: found.reason ?? `${entry.name} was not read`,
        content: 'unread',
        active,
      };
    }
    return { entry, state: found, unreadReason: null, content: slotContentOf(found), active };
  });
}
