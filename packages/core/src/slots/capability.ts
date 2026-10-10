/* OWNER: capability agent. See ./types.ts. */
import { SeekError } from '../errors.js';
import type { FirmwareProfile } from '../profiles/types.js';
import type { SlotPlan } from './types.js';

/** The per-build slot capability matrix. Pure; no device. */
export function buildSlotPlan(_profile: FirmwareProfile, _firmwareVersion: string | null): SlotPlan {
  throw new SeekError('slots/refused', 'buildSlotPlan is not implemented yet');
}
