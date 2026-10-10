/* OWNER: reader agent. See ./types.ts. */
import { SeekError } from '../errors.js';
import type { WorkflowContext } from '../workflows/types.js';
import type { SlotsReport } from './types.js';

/** Identify the camera, read all three banks, and join them to the build's slot plan. */
export async function inspectSlots(_ctx: WorkflowContext): Promise<SlotsReport> {
  throw new SeekError('slots/refused', 'inspectSlots is not implemented yet');
}
