/**
 * Where each family is read, as the page and the CLI route it. `seek-fw dump` and the web app's
 * 4.x/Nano tab gate on these, and `seek-fw info --families` says what they decide, so the listing
 * cannot drift from the gates.
 */

import type { FirmwareProfile, ProfileId } from './types.js';

/** The family the Dump & decrypt 4.x/Nano tab reads under; it refuses a camera that answers as any other. */
export const V4_TAB_FAMILY: ProfileId = 'modern-4x';

/**
 * The families `seek-fw dump` reads: the 4.x/Nano tab's, and `generic`, read with the 4.x block list.
 * Every other family is on the 0.x/1.x line, and the dump points it at `seek-fw preserve`.
 */
export const DUMP_COMMAND_FAMILIES: ReadonlySet<ProfileId> = new Set([V4_TAB_FAMILY, 'generic']);

/** Which tab or command reads a camera of this family, in the page's words. */
export function familyReadBy(profile: FirmwareProfile): string {
  if (profile.id === V4_TAB_FAMILY) return 'the Dump & decrypt 4.x/Nano tab and `seek-fw dump`';
  if (DUMP_COMMAND_FAMILIES.has(profile.id)) return '`seek-fw dump`; the 4.x/Nano tab refuses it';
  const preserve =
    'the preservation run on the Dump & decrypt 0.x/1.x 2014/2016 tab (`seek-fw preserve`)';
  /* A family that refuses a dump is the pre-0.8 Compact's: the preservation run reads 0.7.0.7 and
   * 0.7.0.8 through another command and refuses the older builds (preservation/patch.ts
   * `preWideningRefusal`). */
  if (!profile.capabilities.dump.supported) {
    return `${preserve}, for 0.7.0.7 and 0.7.0.8; nothing reads the older builds`;
  }
  return preserve;
}
