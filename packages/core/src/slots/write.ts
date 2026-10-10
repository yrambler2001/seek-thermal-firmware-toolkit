/* OWNER: writer agent. See ./types.ts. */
import { SeekError } from '../errors.js';
import type { WorkflowContext } from '../workflows/types.js';
import type {
  FlashSlotOptions,
  FlashSlotResult,
  SlotFlashInput,
  SlotFlashPlan,
  SlotKey,
  SlotsReport,
} from './types.js';

/** Pure: turn a decrypted image or raw bytes into the payload for one bank. Sends nothing. */
export function prepareSlotFlash(
  _report: SlotsReport,
  _key: SlotKey,
  _input: SlotFlashInput,
): SlotFlashPlan {
  throw new SeekError('slots/refused', 'prepareSlotFlash is not implemented yet');
}

/** Arm the bank's write window, stage, commit, and (by default) read back and compare. */
export async function flashSlot(
  _ctx: WorkflowContext,
  _report: SlotsReport,
  _plan: SlotFlashPlan,
  _options: FlashSlotOptions,
): Promise<FlashSlotResult> {
  throw new SeekError('slots/refused', 'flashSlot is not implemented yet');
}
