/**
 * The gate every flash-writing flow on the REAL camera must pass. On the
 * emulator target there is nothing to gate — writing is the point — so it waves
 * through. On the camera target it cannot be passed by accident or in CI:
 *
 *   1. the env switch `SEEK_E2E_WRITE=i-understand` must be set;
 *   2. `CI` must not be set.
 *
 * There is no person in the loop. The run has already held step 02 to the
 * camera's row of the expectation table before it asks, and the plan it is
 * about to carry out (the firmware, the image read THIS run, the bank, the
 * chunks, the bytes that move) is printed to the log first, so the record of
 * what was written is in the run's own output. Setting the env switch is the
 * decision.
 *
 * `SEEK_E2E_WRITE=dry-run` is the third state: everything up to the first write
 * runs, and the gate then stops the flow (`approved: false, dry: true`) before
 * a single write RPC — the way the camera target's write flow is proven without
 * writing. Any other value, or none, is a hard refusal.
 *
 * This module decides ONLY whether a write may proceed. The other guards (the
 * vendor-id device pick, the page-side write guard with its per-phase budget,
 * the expected RPC sequence) live where they always do and are never relaxed
 * here.
 */

import { say } from './browser.js';

export interface WriteApproval {
  readonly approved: boolean;
  /** True when the flow should run right up to, and stop before, the first write. */
  readonly dry: boolean;
  readonly reason: string;
}

export interface WritePlan {
  /** What is about to be written, printed in full before the gate decides. */
  readonly describe: string;
}

const APPROVED_SAFE: WriteApproval = { approved: true, dry: false, reason: 'emulator target' };

/**
 * The gate for a write flow on `target`. `plan()` is called only once the env
 * checks pass, so it can read the camera first (version, image sha).
 */
export async function approveWrite(
  targetName: 'emu' | 'camera',
  plan: () => Promise<WritePlan>,
): Promise<WriteApproval> {
  if (targetName === 'emu') return APPROVED_SAFE;

  const mode = process.env.SEEK_E2E_WRITE ?? '';
  if (mode !== 'i-understand' && mode !== 'dry-run') {
    return {
      approved: false,
      dry: false,
      reason:
        'a camera write needs SEEK_E2E_WRITE=i-understand (or =dry-run to rehearse) — refusing',
    };
  }
  /* A dry run never writes, so CI may run it: it is exactly the rehearsal, and
   * it runs the whole flow up to the first write before stopping. */
  if (mode === 'dry-run') {
    const p = await plan();
    return {
      approved: false,
      dry: true,
      reason: `dry run: everything up to the first write ran; ${p.describe}`,
    };
  }

  if (process.env.CI !== undefined && process.env.CI !== '') {
    return { approved: false, dry: false, reason: 'CI is set — a camera write never runs in CI' };
  }
  const p = await plan();
  say(`\nWRITING THE REAL CAMERA'S FLASH (SEEK_E2E_WRITE=i-understand).\n${p.describe}`);
  return { approved: true, dry: false, reason: 'SEEK_E2E_WRITE=i-understand' };
}
