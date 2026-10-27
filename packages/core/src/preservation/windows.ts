/**
 * The wire geometry of the v1 preservation pipeline: which BeginFirmwareUpgrade
 * windows it arms, which one is the boot-config block, and which are the image
 * banks. Which bank a start enters, from the boot-config word and each bank's
 * check, is `banks.ts`.
 *
 * All of this is measured on the v1 locked line (Compact 1.0.0.0 / 1.2.0.0 /
 * 1.3.0.0 on the 2016-donor bootloader generation; FW-V1 docs 33 sec. 11.7 and
 * 34 sec. 34.11), and it is the same table every build of the line decodes to
 * (`legacy-auth.ts`'s 0.9.0.2..1.3.0.0 rows): modes 3..9 answer only the
 * 18-byte token form, 0x0A..0x21 arm on the plain 2-byte form, and each mode
 * exposes exactly one 64 KiB block.
 *
 * READ/WRITE ASYMMETRY, AND WHY IT SHAPES THE PIPELINE. Over this wire the
 * reachable part is the lower 2 MiB: 0x14010000..0x141FFFFF (modes 3..0x21 —
 * 31 windows), and `mode > 0x21` is refused outright. The upper 2 MiB is
 * unreachable to a stock camera. The in-place patch WIDENS the mode-2 window
 * to the whole part (`dc = 0x400000`), which is what phase P3's full-4-MiB
 * drain reads through — and why the stock window set is the backup's unit and
 * the widened window is the dump's.
 */

import { hexUp } from '../bytes.js';
import { bankWordsOf } from '../profiles/locked-boot.js';
import { SeekError } from '../errors.js';
import { authPayload, OLD_FW_UNLOCK_TOKEN } from '../profiles/legacy-auth.js';
import { WINDOW_SIZE } from '../profiles/modern-4x.js';
import type { WindowEntry } from '../profiles/types.js';

/** The boot-config block, armed by mode 3. */
export const BOOT_CONFIG_ADDRESS = 0x14010000;
export const CFG_MODE = 3;

/** The image-select record the bootloader keeps in the boot-config block. */
export const BOOT_CONFIG_BYTES = 28;

/**
 * The first 28 bytes of the block at 0x14020000 — the page-shift anchor,
 * measured against the J-Link dump of the reference Compact (sha 40447c7e…,
 * 2026-10-03). Some boots serve every window one 64 KiB page UP (window m
 * answers with the plan's block m+1): the mode-3 probe then returns THESE
 * bytes instead of the boot-config record, which is how the pipeline tells a
 * page-shifted boot from a healthy one before it trusts any window read.
 *
 * Past its first word these bytes are that one camera's own (its serial,
 * `101310HSNEA2`, sits at +16), so the test is the block's header word, which
 * every camera carries (`isDeviceBlockHead`).
 */
export const PAGE_SHIFT_ANCHOR = Uint8Array.from(
  Object.freeze([
    0x01, 0x00, 0x31, 0xf7, 0x10, 0x00, 0x13, 0x00, 0xce, 0x00, 0x09, 0x00, 0x8a, 0x00, 0xca, 0x00,
    0x31, 0x30, 0x31, 0x33, 0x31, 0x30, 0x48, 0x53, 0x4e, 0x45, 0x41, 0x32,
  ]),
);

/** The device-identity block (mode 4 in the plan): the block the page-shift
 *  anchor was cut from. */
export const DEVICE_BLOCK_ADDRESS = 0x14020000;

/**
 * True when `head` starts with the device-identity block's header word,
 * `00|01 00 31 f7` (a cfg0 of 0xF731000x, which names no slot). Measured over
 * every 4 MiB dump in the FW-V1 corpus (2026-10-06): 14 of the 15 carry it,
 * each at 0x14020000 and at no other 64 KiB block — the reference Compact
 * 1.3.0.0, the three 2016 Compact PRO dumps (1.0.3.0 and both 1.0.3.0-FF), and
 * the 4.x, XR, Nano and Mosaic lines. The serial and the calibration fields
 * after it differ per camera, which is why the test stops at the word.
 */
export function isDeviceBlockHead(head: Uint8Array): boolean {
  return (
    head.length >= 4 &&
    (head[0] === 0x00 || head[0] === 0x01) &&
    head[1] === 0x00 &&
    head[2] === 0x31 &&
    head[3] === 0xf7
  );
}

/** True when a mode-3 probe read is the device-identity block instead of the
 *  boot-config record — the boot is serving windows one page up. The exact
 *  28-byte anchor matched only the reference Compact: on the 2016 Compact PRO
 *  (serial `0C21A1M5KP15` at +16) a shifted head passed as a written record. */
export function isPageShiftedHead(block: Uint8Array): boolean {
  return isDeviceBlockHead(block);
}

/** The three app-image banks, in the bootloader's A/B/recovery order. */
export const BANKS = [
  { key: 'a', mode: 7, address: 0x14050000 },
  { key: 'b', mode: 8, address: 0x14060000 },
  { key: 'r', mode: 9, address: 0x14070000 },
] as const;

export type BankKey = (typeof BANKS)[number]['key'];

/** The widened window the PATCHED image serves (mode 2, window length 0x400000). */
export const WIDENED_MODE = 2;

/** One window's length (64 KiB) — re-exported under the pipeline's name. */
export const WINDOW_BYTES = WINDOW_SIZE;

/** The stock backup: modes 3..9 (7) plus 0x0A..0x21 (24). */
export const BACKUP_WINDOW_COUNT = 31;

/** The boot-config window entry (mode 3, token form). */
export function cfgWindow(): WindowEntry {
  return {
    subcmd: CFG_MODE,
    address: BOOT_CONFIG_ADDRESS,
    note: 'boot-config block (the image-select record)',
    payload: authPayload(CFG_MODE, OLD_FW_UNLOCK_TOKEN),
  };
}

/** The 31 windows a stock v1 camera can read: modes 3..9 (token form) and
 *  0x0A..0x21 (plain form) — 0x14010000..0x141FFFFF, one 64 KiB block each. */
export function preservationWindows(): readonly WindowEntry[] {
  const windows: WindowEntry[] = [];
  for (let mode = 3; mode <= 9; mode++) {
    windows.push({
      subcmd: mode,
      address: 0x14010000 + (mode - 3) * WINDOW_SIZE,
      note: `protected window (auth): ${hexUp(0x14010000 + (mode - 3) * WINDOW_SIZE, 8)}`,
      payload: authPayload(mode, OLD_FW_UNLOCK_TOKEN),
    });
  }
  for (let mode = 0x0a; mode <= 0x21; mode++) {
    windows.push({
      subcmd: mode,
      address: 0x14080000 + (mode - 0x0a) * WINDOW_SIZE,
      note: `linear window: ${hexUp(0x14080000 + (mode - 0x0a) * WINDOW_SIZE, 8)}`,
    });
  }
  return windows;
}

/** The window entry for one bank, armed for a WRITE phase (P2/P4). */
export function bankWindow(key: BankKey): WindowEntry {
  const bank = BANKS.find((b) => b.key === key);
  if (bank === undefined) throw new SeekError('pipeline/refused', `no bank ${key}`);
  return {
    subcmd: bank.mode,
    address: bank.address,
    note: `${bankWordsOf(key)} (${hexUp(bank.address, 8)}), write-capable window`,
    payload: authPayload(bank.mode, OLD_FW_UNLOCK_TOKEN),
  };
}

/** The plan's own window for one 64 KiB block — the entry of
 *  `preservationWindows()` whose address equals `address`. The plan covers
 *  every block of 0x14010000..0x141FFFFF exactly once, so a bank address
 *  always resolves; anything else refuses rather than guess. */
export function planWindowAt(address: number): WindowEntry {
  const entry = preservationWindows().find((w) => w.address === address);
  if (entry === undefined) {
    throw new SeekError(
      'pipeline/refused',
      `the stock window plan names no window at ${hexUp(address, 8)} — the plan covers ` +
        '0x14010000..0x141FFFFF, one 64 KiB block per mode',
    );
  }
  return entry;
}

/** The plan's own window for the device-identity block (mode 4, token form). */
export function deviceBlockWindow(): WindowEntry {
  return planWindowAt(DEVICE_BLOCK_ADDRESS);
}

/**
 * The two independently-armed windows the backup's double read serves the
 * active slot through: the bank's own window (mode 7/8/9 per `BANKS`) and the
 * plain plan window whose address equals the bank's. Two arms = two separate
 * BeginFirmwareUpgrade descriptors — the firmware's arm handler re-stages the
 * reader descriptor at every arm (remaining, cursor, capacity, source) — so
 * the two reads draw on two descriptor lifetimes rather than on one arm whose
 * budget the first read already spent. Measured on the real Compact
 * (TESTING.md secs. 23.3, 28.4 and the 2026-10-02 incident): a window re-read
 * through a spent arm truncates mid-stream, so the double read may never ask
 * one arm for the whole 64 KiB twice.
 *
 * For every bank the two entries carry the SAME mode id — the plan's row at a
 * bank address IS the bank's row (modes 7/8/9 are both the bank windows and
 * plan modes 3..9) — the pair is still two arms, each with its own descriptor.
 */
export function doubleReadWindows(bank: BankKey): readonly [WindowEntry, WindowEntry] {
  const bankEntry = bankWindow(bank);
  return [bankEntry, planWindowAt(bankEntry.address)];
}

/**
 * The lead every spent-reader refusal carries, with the read's own signature
 * after it. The wording is shared so every refusal that names the remedy names
 * it the same way: the diagnosis and the power-cycle remedy FIRST (the one
 * action that un-blocks a real camera), the technical detail after.
 */
export function spentReaderRefusal(signature: string): string {
  return (
    'the camera’s window reader is budgeted per boot and these reads came back from a spent ' +
    'reader — power-cycle the camera (unplug and replug it, or use its power switch), then ' +
    `re-run \`preserve --resume <run-directory>\`. Signature: ${signature}`
  );
}

/** True when a whole window read is unprogrammed fill, every byte 0xFF. The
 *  canary reads in `backupWindows` use it on two rows whose co-occurrence no
 *  running camera can produce (see the canary comment there). */
export function isBlankWindow(bytes: Uint8Array): boolean {
  for (const byte of bytes) {
    if (byte !== 0xff) return false;
  }
  return true;
}

/** True when a boot-config word is the stale-descriptor shape: an SRAM address
 *  (the bootloader vector's initial SP, 0x10018000 measured on the real
 *  Compact) served where a record selector should be. */
export function isStaleDescriptorWord(word: number): boolean {
  const w = word >>> 0;
  return w >= 0x10000000 && w < 0x20000000;
}

/** The widened mode-2 window entry (P3's drain). */
export function widenedWindow(): WindowEntry {
  return {
    subcmd: WIDENED_MODE,
    address: 0x14000000,
    note: "bootloader block through the patched image's widened window",
    payload: authPayload(WIDENED_MODE, OLD_FW_UNLOCK_TOKEN),
  };
}
