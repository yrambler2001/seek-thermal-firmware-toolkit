/* ====================================================================
 * The upgrade target that is the bank the camera booted from (TESTING.md 42.50).
 *
 * A pure check on the two helpers the page and `seek-fw info` both use. The
 * state is a stub with only the fields the helpers read: the boot prediction
 * and the slot names. The replay line and the CLI output are covered where
 * they are printed (packages/cli/test/camera.test.ts).
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { upgradeTargetIsBooted, upgradeTargetWarning } from '../src/workflows/device-info.js';
import type { DeviceState } from '../src/workflows/types.js';
import type { SlotKey } from '../src/slots/types.js';

function stateWith(boot: { booted: SlotKey; target: SlotKey } | null): DeviceState {
  const names: Record<SlotKey, string> = { a: 'Slot A', b: 'Slot B', r: 'Recovery' };
  const byKey = new Map(
    (['a', 'b', 'r'] as const).map((key) => [key, { key, name: names[key] }] as const),
  );
  return { boot, byKey } as unknown as DeviceState;
}

describe('the upgrade target as the booted bank', () => {
  it('is named when the target and the booted bank are the same, with a warning that blocks nothing', () => {
    const state = stateWith({ booted: 'b', target: 'b' });
    expect(upgradeTargetIsBooted(state)).toBe(true);
    const warning = upgradeTargetWarning(state);
    expect(warning).toContain('Slot B');
    expect(warning).toContain('overwrite the image it is running');
    expect(warning).toContain('nothing here stops an upgrade');
  });

  it('is not flagged when the target is the other bank', () => {
    const state = stateWith({ booted: 'a', target: 'b' });
    expect(upgradeTargetIsBooted(state)).toBe(false);
    expect(upgradeTargetWarning(state)).toBeNull();
  });

  it('is not flagged when the recovery bank boots and the target is A or B', () => {
    const state = stateWith({ booted: 'r', target: 'a' });
    expect(upgradeTargetIsBooted(state)).toBe(false);
    expect(upgradeTargetWarning(state)).toBeNull();
  });

  it('is not flagged when no boot prediction exists', () => {
    const state = stateWith(null);
    expect(upgradeTargetIsBooted(state)).toBe(false);
    expect(upgradeTargetWarning(state)).toBeNull();
  });
});
