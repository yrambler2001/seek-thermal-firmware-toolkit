/* ====================================================================
 * The upgrade target that is the bank the camera booted from (TESTING.md 42.50), and the
 * upgrade target that is written while the camera runs recovery (TESTING.md 42.67).
 *
 * A pure check on the helpers the page and `seek-fw info` both use. The state is a stub with
 * only the fields the helpers read: the boot prediction, and each bank's presence, blankness,
 * verdict and sha256. The replay line and the CLI output are covered where they are printed
 * (packages/cli/test/camera.test.ts).
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import {
  upgradeTargetIsBooted,
  upgradeTargetWarning,
  upgradeTargetWhileRecovery,
} from '../src/workflows/device-info.js';
import type { DeviceState } from '../src/workflows/types.js';
import type { SlotKey } from '../src/slots/types.js';

type Bootability = 'bootable' | 'unknown' | 'recovery-only' | 'not-bootable';
interface Bank {
  readonly present?: boolean;
  readonly blank?: boolean;
  readonly bootability?: Bootability;
  readonly sha256?: string | null;
}

/** A state with the boot prediction and the three banks; each bank is bootable with no sha256 unless told. */
function stateWith(
  boot: { booted: SlotKey; target: SlotKey } | null,
  banks: Partial<Record<SlotKey, Bank>> = {},
): DeviceState {
  const names: Record<SlotKey, string> = { a: 'Slot A', b: 'Slot B', r: 'Recovery' };
  const byKey = new Map(
    (['a', 'b', 'r'] as const).map((key) => {
      const bank = banks[key] ?? {};
      return [
        key,
        {
          key,
          name: names[key],
          present: bank.present ?? true,
          blank: bank.blank ?? false,
          bootability: bank.bootability ?? 'bootable',
          sha256: bank.sha256 ?? null,
        },
      ] as const;
    }),
  );
  return { boot, byKey } as unknown as DeviceState;
}

const SAME_IMAGE = 'f96ac57eda75bca2';

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

  it('is not flagged when the recovery bank boots and the target is A', () => {
    const state = stateWith({ booted: 'r', target: 'a' });
    expect(upgradeTargetIsBooted(state)).toBe(false);
    expect(upgradeTargetWhileRecovery(state)).toBe(false);
    expect(upgradeTargetWarning(state)).toBeNull();
  });

  it('is not flagged when no boot prediction exists', () => {
    const state = stateWith(null);
    expect(upgradeTargetIsBooted(state)).toBe(false);
    expect(upgradeTargetWhileRecovery(state)).toBe(false);
    expect(upgradeTargetWarning(state)).toBeNull();
  });
});

describe('the upgrade target written while the camera runs recovery (TESTING.md 42.67)', () => {
  it('is recognised only when recovery boots and the target is B', () => {
    expect(upgradeTargetWhileRecovery(stateWith({ booted: 'r', target: 'b' }))).toBe(true);
    expect(upgradeTargetWhileRecovery(stateWith({ booted: 'b', target: 'b' }))).toBe(false);
    expect(upgradeTargetWhileRecovery(stateWith({ booted: 'a', target: 'b' }))).toBe(false);
    expect(upgradeTargetWhileRecovery(stateWith({ booted: 'r', target: 'a' }))).toBe(false);
  });

  it('says the camera runs recovery and its own upgrade writes B, and blocks nothing', () => {
    const state = stateWith(
      { booted: 'r', target: 'b' },
      {
        b: { sha256: SAME_IMAGE },
        r: { sha256: SAME_IMAGE },
      },
    );
    const warning = upgradeTargetWarning(state);
    expect(warning).toContain('The camera is running its recovery bank');
    expect(warning).toContain('its own upgrade writes Slot B, which it is not running');
    expect(warning).toContain('nothing here stops an upgrade');
    /* The running image is not the one written, so the booted-bank sentence is not used. */
    expect(warning).not.toContain('overwrite the image it is running');
    expect(upgradeTargetIsBooted(state)).toBe(false);
  });

  it('says B holds the same bootable image as the bank it runs when the two sha256 match', () => {
    const state = stateWith(
      { booted: 'r', target: 'b' },
      {
        b: { sha256: SAME_IMAGE, bootability: 'bootable' },
        r: { sha256: SAME_IMAGE, bootability: 'bootable' },
      },
    );
    const warning = upgradeTargetWarning(state) ?? '';
    expect(warning).toContain(
      'Slot B holds the same bootable image as the bank it runs, which the upgrade replaces',
    );
    expect(warning).toContain('if the upgrade stops partway, Slot B is left unbootable');
  });

  it('says B holds a bootable image of its own when its sha256 differs from the running bank', () => {
    const state = stateWith(
      { booted: 'r', target: 'b' },
      {
        b: { sha256: 'aaaaaaaaaaaaaaaa', bootability: 'bootable' },
        r: { sha256: SAME_IMAGE, bootability: 'bootable' },
      },
    );
    const warning = upgradeTargetWarning(state) ?? '';
    expect(warning).toContain('Slot B holds a bootable image, which the upgrade replaces');
    expect(warning).not.toContain('the same bootable image');
  });

  it('says the bootability of B is unknown when the key table was not read', () => {
    const state = stateWith({ booted: 'r', target: 'b' }, { b: { bootability: 'unknown' } });
    const warning = upgradeTargetWarning(state) ?? '';
    expect(warning).toContain("Slot B's bootability is unknown on this read");
    expect(warning).toContain('may replace an image the camera would boot');
  });

  it('says B is not shown as bootable, so the upgrade replaces no image the camera would boot', () => {
    const state = stateWith({ booted: 'r', target: 'b' }, { b: { bootability: 'not-bootable' } });
    expect(upgradeTargetWarning(state)).toContain(
      'Slot B is not shown as bootable on this read, so the upgrade replaces no image the camera would boot',
    );
  });

  it('says B is blank, so the upgrade writes into an empty bank', () => {
    const state = stateWith({ booted: 'r', target: 'b' }, { b: { blank: true } });
    expect(upgradeTargetWarning(state)).toContain(
      'Slot B is blank, so the upgrade writes into an empty bank',
    );
  });

  it('says B could not be read, so what it holds is not known', () => {
    const state = stateWith({ booted: 'r', target: 'b' }, { b: { present: false } });
    expect(upgradeTargetWarning(state)).toContain(
      'Slot B could not be read on this check, so what it holds is not known',
    );
  });

  it('takes the page label for each bank when one is given', () => {
    const state = stateWith(
      { booted: 'r', target: 'b' },
      { b: { sha256: SAME_IMAGE }, r: { sha256: SAME_IMAGE } },
    );
    const warning = upgradeTargetWarning(state, (slot, key) =>
      slot === undefined ? key.toUpperCase() : `Bank ${key.toUpperCase()}`,
    );
    expect(warning).toContain('its own upgrade writes Bank B, which it is not running');
    expect(warning).toContain('Bank B holds the same bootable image as the bank it runs');
  });
});
