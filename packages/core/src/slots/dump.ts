/* OWNER: reader agent. See ./types.ts. */
import { SeekError } from '../errors.js';
import type { WorkflowContext } from '../workflows/types.js';
import type { DumpedSlot, SlotKey, SlotsReport } from './types.js';

/** Read one bank (64 KiB, as stored) and decrypt it when its key is recoverable. */
export async function dumpSlot(
  _ctx: WorkflowContext,
  _report: SlotsReport,
  _key: SlotKey,
): Promise<DumpedSlot> {
  throw new SeekError('slots/refused', 'dumpSlot is not implemented yet');
}
