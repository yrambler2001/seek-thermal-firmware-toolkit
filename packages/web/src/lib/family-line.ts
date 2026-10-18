/**
 * Which of the two firmware lines a version string belongs to, for the Info tab's
 * "which tab" answer. Only the major number is read, and the rule is the one the
 * core profile for 4.x/Nano states: 0.x and 1.x are the 2014 and 2016 line, and
 * everything else is the 4.x/Nano line. (That line includes the Mosaic builds,
 * whose versions are 10.x and 2.x, and the Nano 200/300 builds, 42.x and 44.x.)
 *
 * This is a hint for where to go, not the family check: each tab still asks the
 * camera which family it is before it reads anything.
 */

export type FirmwareLine = 'legacy' | 'modern';

export function firmwareLineOf(version: string | null): FirmwareLine | null {
  if (version === null) return null;
  const first = version.split('.')[0] ?? '';
  if (!/^\d+$/.test(first)) return null;
  return Number(first) <= 1 ? 'legacy' : 'modern';
}
