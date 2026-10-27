/* ==================================================================== *
 * The facts a person is shown next to a slot, per family and per build. Each
 * sentence states something the repo measured or decoded, and cites where: the
 * README build table, preservation/patch.ts, or the decoded firmware switch in
 * test/firmware/facts.json. Nothing here is a claim the code cannot back.
 * ==================================================================== */

import type { SlotKey } from '../profiles/types.js';
import type { FirmwareVersion } from '../profiles/version.js';
import { FF_1308_VERSION, type SlotFamily } from './capability-family.js';

/** The 1.3.0.8 16 Hz build, which shares the version string with the 8 Hz build. */
export const FF_1308_NOTE =
  '1.3.0.8-FF (16 Hz) reports the same version as the 8 Hz build. The read tells them apart from ' +
  'the camera: GetFirmwareInfo selectors 6, 7 and 8 say, bank by bank, whether the application ' +
  'takes it, and each build predicts its own answers from the banks. The FF ' +
  'image is staged as the vendor app stages it, the image XOR the Key A keystream with the header ' +
  'verbatim, and the camera stores it under Key B (the image XOR the Key B keystream). It goes to ' +
  "A, B or R. A write of it is refused while the camera runs the 8 Hz build, and while the camera's " +
  'answers cannot tell the builds apart it is refused unless you say the camera runs the 16 Hz build. ' +
  'UNTESTED: no genuine bootloader for this build is in the corpus, so whether the written bank boots ' +
  'is not measured. On the 0.9.0.0 bootloader the earlier plain form booted from recovery R; this ' +
  'form will not, because recovery runs its bank unchecked and does not decrypt it (TESTING.md 42.12).';

/**
 * What the booted bank means on the 2014 plaintext chain. The read names one from the camera's
 * active-slot word (device-info.ts, `chainReplay`): the bank the bootloader entered at the last start,
 * which the bootloader writes at every start (0 slot A, 1 slot B, 2 recovery R; TESTING.md 42.53, 42.56).
 * The NEXT start is set by the boot-config word (profiles/locked-boot.ts), and recovery R runs whenever A
 * and B hold nothing the bootloader takes (TESTING.md 42.10; boot-choice.ts). The page and the CLI both
 * print this note, so it names neither (TESTING.md 42.87).
 */
const LOCKED_BOOT_WORD_NOTE =
  'The booted bank named on this line is the bank the camera entered at its last start, ' +
  'as the active-slot word records it (0 slot A, 1 slot B, 2 recovery R). The next start is set by the ' +
  'boot-config word: 0 or 0xFFFFFFFF choose A first, 1 B first, any other value recovery R first. ' +
  'Recovery R runs whenever A and B hold nothing the 2014 bootloader takes (a stored word sum of 0), ' +
  'whatever R holds (TESTING.md 42.10).';

/**
 * The same for the 2016 Compact PRO line. Its bootloader records the bank it enters the same way
 * (TESTING.md 42.56: the word is the bank that ran, for words 0, 1 and 2 on 1.0.3.0), and chooses by the
 * same rule (FW-V1 targets/compact_pro_9hz_1_0_3_0_bootloader/src/image.c:1076-1109), but its check is
 * `image_sum_ok_device_seeded`: the bank decrypted under the key it checks a bank under must sum to 0.
 * The read names that key from the bank the camera entered (device-info.ts `checkKeyOf`).
 */
const LOCKED_2016_BOOT_WORD_NOTE =
  'The booted bank named on this line is the bank the camera entered at its last start, ' +
  'as the bootloader records it in the active-slot word (0 slot A, 1 slot B, 2 recovery R). The next ' +
  'start is set by the boot-config word: 0 or 0xFFFFFFFF choose A first, 1 B first, any other value ' +
  'recovery R first. The 2016 bootloader takes a bank only when it decrypts to a word sum of 0 under the ' +
  'key it checks a bank under (key block 1 on its 1.2.0.0 bootloader), and the last bank of that order ' +
  'runs unchecked when the other two fail. The read names that key from the bank the camera entered, ' +
  'because the bootloader block that holds it is refused on every channel (TESTING.md 42.56, 42.84).';

/** Compact Pro 1.0.3.2: the EP0 limit that keeps a whole-part dump from running. */
export const EP0_1032_NOTE =
  '1.0.3.2: EP0 sessions die at about 64 to 81 KB and 128 B is the lossless read unit, so one ' +
  '64 KiB bank per session is the measured limit. A whole-part drain is refused on this build ' +
  '(README: no single-arm drain exists). The slot dump reads one ' +
  'bank at a time, in 64-byte asks.';

/* The token is legacy-auth.ts OLD_FW_UNLOCK_TOKEN; the note names it for what it is, not by its code name
 * (TESTING.md 42.86). */
const TOKEN_NOTE =
  'Banks are protected on this line: a plain 2-byte arm of mode 7, 8 or 9 is refused, so a ' +
  'slot arm carries the 18-byte payload with the line’s 16-byte unlock token (the same bytes ' +
  'in 22 corpus images). A camera with another token stalls on its banks.';

const LOCKED_PLAIN_STAGING_NOTE =
  'Staged: the image length only, at most 0xE000 bytes (the descriptor stages into ' +
  '0x20002000 + 0xE000). The commit erases the 64 KiB block and programs exactly those bytes, ' +
  'and the rest of the bank reads 0xFF. The stored word sum must be 0; the staging balances it ' +
  'through the adjust word at 0x238.';

const LOCKED_2016_STAGING_NOTE =
  'Staged: the image, XORed with the xorshift128 keystream of its OWN key block 0 (the stage ' +
  'key, found in the image by value), image length only (at most 0xE000 bytes). The device ' +
  'decrypts the payload with that key and stores it under the key its bootloader checks a bank ' +
  'under (key block 1), so the stored bytes are not the staged ones. Nothing is read from the ' +
  'target bank to stage it: the bank’s keystream is used only to read the bank back.';

/**
 * This profile declares no write capability of its own (its capabilities.flash says why). The slot write is
 * the keystream-staged path the preservation pipeline ran on 1.0.3.0, so the slot writer does not gate it on
 * that refusal, and the note says so instead of hiding the refusal. It is a slot view's note (the Slots
 * tab, `seek-fw slots list`), so it names neither front end (TESTING.md 42.87). No line has a whole-image
 * write since 42.80, so the note no longer speaks of one (TESTING.md 42.89).
 */
export function profileFlashNote(profileId: string): string {
  return (
    `Profile ${profileId} declares no write of its own. The banks are written one at a time, each ` +
    'staged under its own image’s key, the path the backup already ran on 1.0.3.0 cameras, so a ' +
    'bank write is not refused for that reason.'
  );
}

/* The firmware's own names stay in the code (cmd_CompleteMemoryUpgrade's data types 7 to 9 call
 * fw_validate_decrypt_program); the note says what they do (TESTING.md 42.89). */
const MODERN_STAGING_NOTE =
  'Staged: the whole 64 KiB bank, image + 0xFF pad + "CODE" footer. The image is XORed with the ' +
  'keystreams that make the running application’s own two passes land it under the key the booted ' +
  'bank holds: when the commit command (CompleteMemoryUpgrade) takes data type 7, 8 or 9, the ' +
  'application decrypts the upload with its Key A, re-encrypts it under its store key and programs ' +
  'the bank. The footer is what lets the bootloader take the bank, so a bank short of it is refused.';

const MODERN_GAP_NOTE =
  'Slot B is 0x14050000 on this line (mode 8). No selector reaches 0x14060000 on any 2.x, 4.x, ' +
  '10.x, 42.x or 44.x build (decoded from the 14 post-2018 corpus images), so no ' +
  'bank sits there. The 0x14060000 layout belongs to the locked 0.x/1.x line.';

const MODERN_NAMED_WRITE_NOTE =
  'Named writes (modes 7 to 9) are decoded from the firmware. The emulator suites write A, B ' +
  'and R through them on the 4.x builds (TESTING.md 42.7, 42.36), and on a camera slot A of a ' +
  'Compact XR 4.8.2.1 was written through mode 7 by the frame-rate patch (42.24). A slot write ' +
  'never arms mode 0, the upgrade target.';

const UNVERIFIED_NOTE =
  'Read only. The bank layout is the locked line’s decoded table, but no staging form has ' +
  'been measured for this build, so no write is planned.';

/** Product lines the corpus measured, keyed by the exact build version. */
const PRODUCT_NOTES: Readonly<Record<string, string>> = {
  /* The emulator corpus holds the Compact's full dump and the Compact XR's full dump and image; each confirmed
   * 63 of 63 windows (test/emulator/expectations.rpc.json). The two products run
   * one image (TESTING.md 42.34), so the note names both, and the dumps it was measured on (42.89). */
  '4.8.2.1':
    'Compact 4.8.2.1 and Compact XR 4.8.2.1 (one image, TESTING.md 42.34): the modern 63-window map; the ' +
    'emulator confirmed 63 of 63 windows on the Compact’s full dump and on the Compact XR’s.',
  '10.9.1.31':
    'Mosaic 320x240 10.9.1.31: the modern 63-window map, measured confirming every window on the emulator.',
  '2.27.1.33':
    'Mosaic 320x240 FF 2.27.1.33: the modern 63-window map, measured confirming every window on the emulator.',
  '42.32.3.10':
    'Nano 200 42.32.3.10: the modern 63-window map, measured confirming every window on the emulator. ' +
    'Its commit command (CompleteMemoryUpgrade) has no handler for data type 32, which a write through ' +
    'mode 7, 8 or 9 never asks for.',
  '44.27.3.10':
    'Nano 300 44.27.3.10: the modern 63-window map, measured confirming every window on the emulator. ' +
    'Its arm command (BeginFirmwareUpgrade) refuses a data type past the span it accepts (0x7F) as a ' +
    'bad first argument, and modes 7 to 9 are inside that span.',
};

/* ---- an empty bank ------------------------------------------------------ *
 * An empty bank (its header window reads all 0xFF) is writable wherever the
 * family can be written at all, because no staging form reads the target bank:
 * the payload comes from the IMAGE and from the camera's own keys, and the commit
 * erases the 64 KiB block before it programs it. What differs is the evidence.
 * ------------------------------------------------------------------------- */

const EMPTY_PLAIN_WHY =
  'An empty bank takes an image exactly as a used one does. The plaintext chain stages the ' +
  'image bytes as they are, with no key, and the commit erases the block first, so nothing is ' +
  'read from the target bank. Measured on the bench Compact: an image written into an empty ' +
  'slot B read back identical, and B booted alone (TESTING.md 42.8).';

const EMPTY_MODERN_WHY =
  'An empty bank takes an image exactly as a used one does. The payload is encrypted under keys ' +
  'derived from the booted bank and the running application, not from the target ' +
  'bank, and the device re-keys it and erases the block without reading it. The footer is copied ' +
  'from a bank that holds a valid one, else built blank. Proven on the emulator; not yet measured ' +
  'on a real camera (TESTING.md 42.8).';

const EMPTY_2016_WHY =
  'An empty bank takes an image exactly as a used one does. The stage key is key block 0 of the ' +
  'IMAGE’s own pair, not a key read from the target bank, and the device decrypts the payload ' +
  'with it, stores it under its own key and erases the block without reading it. Proven on the ' +
  'emulator; not yet measured on a real camera (TESTING.md 42.8).';

/** Why an empty bank can be written on this family, in one sentence; null when the family has no write. */
export function emptyBankWhy(family: SlotFamily): string | null {
  switch (family) {
    case 'locked-plain':
      return EMPTY_PLAIN_WHY;
    case 'modern':
      return EMPTY_MODERN_WHY;
    case 'locked-2016':
      return EMPTY_2016_WHY;
    case 'unverified-locked':
    case 'pre-0.8':
    case 'unidentified':
      return null;
  }
}

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
      notes.push(LOCKED_BOOT_WORD_NOTE);
      if (text === '0.8.0.0') {
        notes.push(
          '0.8.0.0: mode 2 (0x14000000) is a crash hazard on this build, an armed read walks off ' +
            'SRAM (README). A slot read or write arms modes 7 to 9 only and never mode 2.',
        );
      }
      if (text === FF_1308_VERSION) notes.push(FF_1308_NOTE);
      break;
    case 'locked-2016':
      notes.push(TOKEN_NOTE);
      notes.push(LOCKED_2016_BOOT_WORD_NOTE);
      notes.push(
        'The 9 Hz builds of 1.0.3.0 and 1.0.3.2 share one key pair, and the FF builds share ' +
          'another. The version string does not tell them apart, so the keystream is recovered ' +
          'from the bank itself and the bank’s own image decides.',
      );
      if (text === '1.0.3.0') {
        notes.push(
          'The 1.0.3.0 app reboots on any board but the Compact Pro’s, so a Compact board ' +
            'runs it only with the board patch in its banks.',
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

/** What the 1.3.0.8 bank rows say about the FF image, beside the bank it can and cannot go to. */
const FF_1308_BANK_NOTES: Readonly<Record<SlotKey, string>> = {
  a: 'The 1.3.0.8 FF (16 Hz) image goes here in its vendor form, stored under Key B. The 2014 bootloader takes a bank only when its stored word sum is 0, so it passes this one over at boot; whether the FF build boots from A is UNTESTED (TESTING.md 42.12). The 8 Hz image is written as plain.',
  b: 'The 1.3.0.8 FF (16 Hz) image goes here in its vendor form, stored under Key B. The 2014 bootloader passes this bank over at boot (its stored word sum is not 0); whether the FF build boots from B is UNTESTED (TESTING.md 42.12). The 8 Hz image is written as plain.',
  r: 'The 1.3.0.8 FF (16 Hz) image goes here in its vendor form, stored under Key B. Recovery runs its bank unchecked, and the 0.9.0.0 bootloader does not decrypt it, so this form may not boot: UNTESTED, and the earlier plain form did boot from here (TESTING.md 42.10, 42.12). The 8 Hz image is written as plain.',
};

/**
 * How a bank write is staged on this family, or null when the family has no write. It is the same for
 * every bank, so it is a note about the camera, said once (`buildSlotPlan` puts it with the build's notes),
 * not once per bank row (TESTING.md 42.87).
 */
export function stagingNote(family: SlotFamily): string | null {
  switch (family) {
    case 'modern':
      return MODERN_STAGING_NOTE;
    case 'locked-plain':
      return LOCKED_PLAIN_STAGING_NOTE;
    case 'locked-2016':
      return LOCKED_2016_STAGING_NOTE;
    case 'unverified-locked':
    case 'pre-0.8':
    case 'unidentified':
      return null;
  }
}

/**
 * Facts about one bank that differ from bank to bank, shown beside it. `version` is the build's version
 * string, when it is known. A fact that holds for every bank is a camera note (`planNotes`, `stagingNote`).
 * Whether a write asks for the risk acknowledgement is not a note: each front end says it once, beside the
 * bank, from its own rule (the page's `writeRisk`, the CLI's `bootRisk`), and a write plan says it once in
 * its warnings (TESTING.md 42.87).
 */
export function bankNotes(
  family: SlotFamily,
  key: SlotKey,
  version: string | null = null,
): string[] {
  const notes: string[] = [];
  switch (family) {
    case 'modern':
      if (key === 'a') {
        notes.push(
          'Read through mode 5 (0x14030000). Written through mode 7, a decoded alias of mode 5 ' +
            'that the modern map leaves out; a Compact XR 4.8.2.1 took a write through it on the ' +
            'camera (TESTING.md 42.24).',
        );
      } else if (key === 'b') {
        notes.push('Mode 8 (0x14050000).');
      } else {
        notes.push('Recovery bank, mode 9 (0x14070000).');
      }
      break;
    case 'locked-plain':
      notes.push(
        key === 'a'
          ? 'Mode 7 (0x14050000), token form.'
          : key === 'b'
            ? 'Mode 8 (0x14060000), token form.'
            : 'Recovery bank, mode 9 (0x14070000), token form.',
      );
      if (version === FF_1308_VERSION) notes.push(FF_1308_BANK_NOTES[key]);
      break;
    case 'locked-2016':
      if (key === 'r') {
        notes.push(
          'Recovery bank, mode 9, token form. Measured on a Compact PRO 1.0.3.0: R took its own image, ' +
            'a one-byte change and the raw staged bytes, each with commit status 0 (TESTING.md 41.3).',
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
