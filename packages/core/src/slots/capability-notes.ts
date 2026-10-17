/* ==================================================================== *
 * The facts a person is shown next to a slot, per family and per build. Each
 * sentence states something the repo measured or decoded, and cites where: the
 * README build table, preservation/patch.ts, or the decoded firmware switch in
 * test/firmware/facts.json. Nothing here is a claim the code cannot back.
 * ==================================================================== */

import type { SlotKey } from '../profiles/types.js';
import type { FirmwareVersion } from '../profiles/version.js';
import type { SlotFamily } from './capability-family.js';

/** The 1.3.0.8 16 Hz build, which shares the version string with the 8 Hz build. */
export const FF_1308_NOTE =
  '1.3.0.8-FF (16 Hz) reports the same version as the 8 Hz build, and this plan cannot tell ' +
  'them apart. The FF build boots ONLY from recovery (mode 9): its word sum is the 0xFFFF ' +
  'sentinel, which the 2014 bootloader rejects at slots A and B, so it boots the recovery bank ' +
  'unchecked. Its banks are staged plain XOR ks0 XOR ksD, not plain, and a commit into A or B ' +
  'of that build is refused (README; patch.ts compact-1.3.0.8-ff: route recovery-only). The ' +
  'plain staging here is the 8 Hz form. Before any write, decide on the image itself, as ' +
  'patch.ts does: word sum 0 is the 8 Hz plain chain, 0xFFFF is FF, and FF needs its own staged ' +
  'form, which this plan does not produce.';

/** Compact Pro 1.0.3.2: the EP0 limit that keeps a whole-part dump from running. */
export const EP0_1032_NOTE =
  '1.0.3.2: EP0 sessions die at about 64 to 81 KB and 128 B is the lossless read unit, so one ' +
  '64 KiB bank per session is the measured limit. A whole-part drain is refused on this build ' +
  '(README: no single-arm drain exists; patch.ts cp1032 capability). The slot dump reads one ' +
  'bank at a time, in 64-byte asks.';

const TOKEN_NOTE =
  'Banks are protected on this line: a plain 2-byte arm of mode 7, 8 or 9 is refused, so a ' +
  'slot arm carries the 18-byte payload, the 16-byte token OLD_FW_UNLOCK_TOKEN (the same bytes ' +
  'in 22 corpus images). A camera with another token stalls on its banks.';

const LOCKED_PLAIN_STAGING_NOTE =
  'Staged: the image length only, at most 0xE000 bytes (the descriptor stages into ' +
  '0x20002000 + 0xE000). The commit erases the 64 KiB block and programs exactly those bytes, ' +
  'and the rest of the bank reads 0xFF. The stored word sum must be 0; prepareImage balances it ' +
  'through the adjust word at 0x238.';

const LOCKED_2016_STAGING_NOTE =
  'Staged: the image, XORed with the keystream of key block 0 of the image’s own key pair (each ' +
  'half found by value in the image), image length only (at most 0xE000 bytes). The stage key ' +
  'comes from the image alone: the target bank is not read to stage it, so an empty or foreign ' +
  'bank is staged the same way. The device stores the image under key block 1, so the write is ' +
  'checked by reading the bank back and decrypting it, which needs the bank to be readable.';

/**
 * The general flash command refuses this profile (its own capabilities.flash
 * says why). The slot write is the keystream-staged path the preservation
 * pipeline ran on 1.0.3.0, so the slot page does not gate it on that refusal,
 * and the note says so instead of hiding the refusal.
 */
export function profileFlashNote(profileId: string): string {
  return (
    `The general flash command refuses profile ${profileId} (its capabilities.flash, see ` +
    'compact-2016.ts). The slot write is the keystream-staged path the preservation pipeline ' +
    'ran on 1.0.3.0, so the slot page does not gate it on that refusal.'
  );
}

const MODERN_STAGING_NOTE =
  'Staged: the whole 64 KiB bank, image + 0xFF pad + "CODE" footer. The image is XORed with the ' +
  'keystreams that make the running application’s own two passes (its Key A, then its store key; ' +
  'cmd_CompleteMemoryUpgrade, data types 7 to 9, call fw_validate_decrypt_program) land it under ' +
  'the key the booted bank holds (write-keys.ts). The footer is what lets the bootloader take ' +
  'the bank, so a bank short of it is refused.';

const MODERN_GAP_NOTE =
  'Bank B is 0x14050000 on this line (mode 8). No selector reaches 0x14060000 on any 2.x, 4.x, ' +
  '10.x, 42.x or 44.x build (modern-4x GAP_ADDRESS, decoded from the 14 post-2018 corpus images), so no ' +
  'bank sits there. The 0x14060000 layout belongs to the locked 0.x/1.x line.';

const MODERN_NAMED_WRITE_NOTE =
  'Named writes (modes 7 to 9) are decoded from the firmware and are not exercised by any ' +
  'test or page in this repo on a 4.x part: the flash page writes only the camera’s own ' +
  'target (mode 0). The first write to a named bank is the first evidence for it.';

const UNVERIFIED_NOTE =
  'Read only. The bank layout is the locked line’s decoded table, but no staging form has ' +
  'been measured for this build, so no write is planned.';

/** Product lines the corpus measured, keyed by the exact build version. */
const PRODUCT_NOTES: Readonly<Record<string, string>> = {
  '4.8.2.1':
    'Compact XR 4.8.2.1: the modern 63-window map, measured confirming every window on the emulator.',
  '10.9.1.31':
    'Mosaic 320x240 10.9.1.31: the modern 63-window map, measured confirming every window on the emulator.',
  '2.27.1.33':
    'Mosaic 320x240 FF 2.27.1.33: the modern 63-window map, measured confirming every window on the emulator.',
  '42.32.3.10':
    'Nano 200 42.32.3.10: the modern 63-window map, measured confirming every window on the emulator. ' +
    'Its CompleteMemoryUpgrade has no case 32, which modes 7 to 9 do not reach.',
  '44.27.3.10':
    'Nano 300 44.27.3.10: the modern 63-window map, measured confirming every window on the emulator. ' +
    'Its BeginFirmwareUpgrade rejects a wider type span (0x7F, BAD_ARG0), and modes 7 to 9 are inside ' +
    'the span it accepts.',
};

/** Facts about a whole build, shown once above its slots. */
export function planNotes(family: SlotFamily, version: FirmwareVersion): string[] {
  const text = version.text;
  const notes: string[] = [];
  const product = PRODUCT_NOTES[text];
  if (product !== undefined) notes.push(product);

  switch (family) {
    case 'modern':
      notes.push(MODERN_GAP_NOTE);
      notes.push(MODERN_NAMED_WRITE_NOTE);
      break;
    case 'locked-plain':
      notes.push(TOKEN_NOTE);
      if (text === '0.8.0.0') {
        notes.push(
          '0.8.0.0: mode 2 (0x14000000) is a crash hazard on this build, an armed read walks off ' +
            'SRAM (README). The slot page arms modes 7 to 9 only and never mode 2.',
        );
      }
      if (text === '1.3.0.8') notes.push(FF_1308_NOTE);
      break;
    case 'locked-2016':
      notes.push(TOKEN_NOTE);
      notes.push(
        'The 9 Hz builds of 1.0.3.0 and 1.0.3.2 share one key pair, and the FF builds share ' +
          'another (patch.ts KEY_PAIRS). The version string does not tell them apart, so the ' +
          'keystream is recovered from the bank itself and the bank’s own image decides.',
      );
      if (text === '1.0.3.0') {
        notes.push(
          'The 1.0.3.0 app reboots on any board but the Compact Pro’s, so a Compact board ' +
            'runs it only with the board patch in its banks (scripts/patch-dump.mjs).',
        );
      }
      if (text === '1.0.3.2') notes.push(EP0_1032_NOTE);
      break;
    case 'unverified-locked':
      notes.push(UNVERIFIED_NOTE);
      break;
    case 'pre-0.8':
    case 'unidentified':
      break;
  }
  return notes;
}

/** Facts about one bank, shown beside it. */
export function bankNotes(family: SlotFamily, key: SlotKey): string[] {
  const notes: string[] = [];
  switch (family) {
    case 'modern':
      notes.push(MODERN_STAGING_NOTE);
      if (key === 'a') {
        notes.push(
          'Read through mode 5 (0x14030000). Written through mode 7, a decoded alias of mode 5 ' +
            'that the modern map leaves out and that is not measured on the wire.',
        );
      } else if (key === 'b') {
        notes.push('Mode 8 (0x14050000).');
      } else {
        notes.push('Recovery bank, mode 9 (0x14070000). A write needs acknowledgeRisk.');
      }
      break;
    case 'locked-plain':
      notes.push(LOCKED_PLAIN_STAGING_NOTE);
      notes.push(
        key === 'a'
          ? 'Mode 7 (0x14050000), token form.'
          : key === 'b'
            ? 'Mode 8 (0x14060000), token form.'
            : 'Recovery bank, mode 9 (0x14070000), token form. A write needs acknowledgeRisk.',
      );
      break;
    case 'locked-2016':
      notes.push(LOCKED_2016_STAGING_NOTE);
      if (key === 'r') {
        notes.push(
          'Recovery bank, mode 9, token form. A write needs acknowledgeRisk; the only measured ' +
            '2016 commits are into the booted bank, so R is the same arm with its own keystream and ' +
            'unmeasured on this family.',
        );
      }
      break;
    case 'unverified-locked':
    case 'pre-0.8':
    case 'unidentified':
      break;
  }
  return notes;
}
