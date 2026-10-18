/* ==================================================================== *
 * The patched 4 MiB part of a plain-stored Compact, for the emulator: the stock part with bank A's
 * image replaced by the image the frame-rate patch makes (core's applyFpsPatch, the same function the
 * slots writer uses, so the bytes are the table's bytes and the acceptance sum is kept).
 *
 * Only the plain 2014-chain builds can be built this way (their banks hold the decrypted image as
 * stored). The Key A (4.x) and the Compact PRO keystream builds keep their image under a cipher, which
 * this tool does not write, so the emulator spec does not build them.
 * ==================================================================== */

import {
  applyFpsPatch,
  FPS_PATCHES,
  type FpsPatch,
} from '../../../../packages/core/src/preservation/fps-patch.js';

/** The emulated NOR's base address, and its size (the 4 MiB part). */
export const FLASH_BASE = 0x14000000;
export const FLASH_BYTES = 4 * 1024 * 1024;
/** The 2014 chain's slot A (the factory boot-config record of the 1.3.0.0 dump names 0x14050000). */
export const BANK_A = 0x14050000;
/** One bank's window in the part: 64 KiB. */
export const BANK_BYTES = 0x10000;

/** The table's patch with this id (fps-patch-table.ts). Throws when there is none. */
export function patchOfId(id: string): FpsPatch {
  const patch = FPS_PATCHES.find((candidate) => candidate.id === id);
  if (patch === undefined) throw new Error(`no frame-rate patch ${id} in the table`);
  return patch;
}

/**
 * The part with bank A patched: `stockPart` (4 MiB, as the emulator booted it) with the 64 KiB at slot A
 * replaced by the patched image. Throws (core's refusal) when that bank is not the stock image of `patch`.
 */
export function patchedPart(stockPart: Uint8Array, patch: FpsPatch): Uint8Array {
  if (stockPart.length !== FLASH_BYTES) {
    throw new Error(`the part is ${String(stockPart.length)} bytes, not ${String(FLASH_BYTES)}`);
  }
  const at = BANK_A - FLASH_BASE;
  const bank = stockPart.slice(at, at + BANK_BYTES);
  const patched = applyFpsPatch(bank, patch);
  const part = stockPart.slice();
  part.set(patched, at);
  return part;
}
