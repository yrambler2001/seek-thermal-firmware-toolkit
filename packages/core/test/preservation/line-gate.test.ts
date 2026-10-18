/* ====================================================================
 * The 0.x and 1.x line gate of the Preserve run (`outsideLineRefusal`).
 *
 * The Dump & decrypt 0.x/1.x tab and `seek-fw preserve` cover the 2014 and 2016
 * builds only. A 4.x, Nano or Mosaic version is refused by the backup step after
 * its version read and before any window is armed or read; this is the check
 * that decides it, on the version string alone.
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { outsideLineRefusal } from '../../src/preservation/patch.js';

describe('outsideLineRefusal: the Preserve run covers the 0.x and 1.x line', () => {
  it('lets 0.x and 1.x builds through', () => {
    for (const version of ['0.8.0.0', '0.10.0.0', '1.0.3.0', '1.2.0.0', '1.3.0.0', '1.3.0.8']) {
      expect(outsideLineRefusal(version), version).toBeNull();
    }
  });

  it('says nothing when the version is unknown (the other gates decide that)', () => {
    expect(outsideLineRefusal(null)).toBeNull();
    expect(outsideLineRefusal('')).toBeNull();
  });

  it('refuses a 4.x, a Nano and a Mosaic build, and names the 4.x/Nano flow', () => {
    for (const version of [
      '4.8.2.1',
      '4.9.1.15',
      '4.18.2.0',
      '2.27.1.33',
      '10.9.1.31',
      '42.32.3.10',
      '44.27.3.10',
    ]) {
      const refusal = outsideLineRefusal(version);
      expect(refusal, version).not.toBeNull();
      expect(refusal).toContain(version);
      expect(refusal).toContain('Dump & decrypt 4.x/Nano');
      expect(refusal).toContain('Nothing was read beyond the version');
    }
  });
});
