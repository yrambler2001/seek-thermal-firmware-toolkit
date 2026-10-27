/* OWNER: capability agent. See ./types.ts. */
/* ==================================================================== *
 * The per-build slot capability matrix: for each of the three banks, what this
 * build can read, what it arms before a write, and which of dump / flashPlain /
 * flashRaw it supports, with the reason whenever it does not.
 *
 * PURE AND OFFLINE. It is built from the profile and the version string alone,
 * so the whole corpus can be tested without a device. A supported verdict here
 * says the build's own tables and its family's staging form allow the operation;
 * it does not say a particular camera holds a usable Key A, a keystream it can
 * read, or the right token. The writer checks those against the device.
 *
 * WHAT EACH COLUMN MEANS.
 *   read   the BeginFirmwareUpgrade entry of THIS build's own table whose
 *          address is the bank's (profile.windowPlan(version)), or null.
 *   write  the arm a write sends before staging: mode 7/8/9 (data types that
 *          commit with fw_validate_decrypt_program and never rewrite cfg[0]).
 *          Token form on the locked line (the plain arm of a protected bank is
 *          refused), plain 2-byte on the modern line.
 *   dump   the bank can be read: the profile reads, and the table has a window.
 *   flash  a bank can be written from a decrypted image (flashPlain, encoded in
 *          the family's staging form) or from bytes already in that form
 *          (flashRaw). Both are the same arm and commit; they differ only in
 *          who does the encoding.
 *   emptyBank  whether a bank that holds no image (its header window reads as
 *          all 0xFF) may be written, and why. It follows the flash verdict,
 *          because no staging form reads the target bank: the payload comes
 *          from the image and the camera's own keys, and the commit erases
 *          the block first. An empty bank is a state, not an error.
 *
 * THE FAMILIES AND WHAT EACH PROVES (see capability-family.ts for the reasons):
 *   modern          2.x/4.x/10.x/42.x/44.x  key-a-ciphertext    dump yes, flash yes
 *   locked-plain    0.8.0.0 .. 1.3.0.8 8 Hz  plain               dump yes, flash yes
 *                   (1.3.0.8 shares its string with the FF build: the writer tells them apart
 *                   on the image, and stages FF in its own vendor form, for A, B and R)
 *   locked-2016     Compact PRO 1.0.3.0/1.0.3.2  slot-keystream  dump yes, flash yes
 *   unverified-locked other 0.x/1.x          none                dump yes, flash no
 *   pre-0.8 / unidentified                   none                dump no, flash no
 * ==================================================================== */

import { hexUp } from '../bytes.js';
import { SeekError } from '../errors.js';
import { bankWindow } from '../preservation/windows.js';
import type {
  FirmwareProfile,
  SlotKey,
  Support,
  WindowEntry,
  WindowPlan,
} from '../profiles/types.js';
import { SUPPORTED, unsupported } from '../profiles/types.js';
import {
  BANK_KEYS,
  BANK_NAME,
  MODERN_A_WRITE_SUBCMD,
  UNVERIFIED_STAGING_REASON,
  WRITE_SUBCMD,
  classifyBuild,
  stagingFor,
  type SlotFamily,
} from './capability-family.js';
import {
  bankNotes,
  emptyBankWhy,
  planNotes,
  profileFlashNote,
  stagingNote,
} from './capability-notes.js';
import {
  SLOT_BYTES,
  type CommitEffect,
  type EmptyBankPolicy,
  type SlotEntry,
  type SlotPlan,
} from './types.js';

/**
 * Committing a 7/8/9 arm programs the named bank and nothing else. Measured in
 * the firmware: cmd_CompleteMemoryUpgrade's type 7..9 arm calls
 * fw_validate_decrypt_program and skips update_write_boot_config, which only
 * the type 0 arm reaches (and the locked line's 1.3.0.8 and 2016 handlers do the
 * same, the 2016 one writing its image-select record only for type 0).
 */
const COMMIT_EFFECT: CommitEffect = 'bank-only';

/** A bank's address as the profile declares it: the one place the layout lives. */
function bankAddress(profile: FirmwareProfile, key: SlotKey): number {
  const slot = profile.slots.find((s) => s.key === key);
  if (slot === undefined) {
    throw new SeekError('slots/refused', `family ${profile.id} declares no bank ${key}`);
  }
  return slot.address;
}

/** The plan for a build the slots cannot be planned on: every operation refused with the same reason. */
function refusedPlan(
  profile: FirmwareProfile,
  firmwareVersion: string | null,
  refusal: string,
): SlotPlan {
  const slots: SlotEntry[] = BANK_KEYS.map((key) => ({
    key,
    name: BANK_NAME[key],
    address: bankAddress(profile, key),
    length: SLOT_BYTES,
    read: null,
    write: null,
    dump: unsupported(refusal),
    flashPlain: unsupported(refusal),
    flashRaw: unsupported(refusal),
    staging: null,
    commitEffect: COMMIT_EFFECT,
    emptyBank: { writable: unsupported(refusal), why: refusal },
    notes: [],
  }));
  return {
    profileId: profile.id,
    firmwareVersion,
    supportedBuild: unsupported(refusal),
    slots,
    notes: [refusal],
  };
}

/**
 * The write arm for one bank, checked against THIS build's own rows. The
 * firmware's mode 7 for bank A is the one row the modern map does not carry,
 * so its absence is not a refusal; every other arm must be a row of the build's
 * table at the bank's address, on the channel the family needs.
 */
function writeWindow(
  family: SlotFamily,
  plan: WindowPlan,
  key: SlotKey,
  address: number,
): { readonly window: WindowEntry | null; readonly reason: string | null } {
  const subcmd = family === 'modern' && key === 'a' ? MODERN_A_WRITE_SUBCMD : WRITE_SUBCMD[key];
  const row = plan.selectors.find((r) => r.subcmd === subcmd);

  if (family === 'modern') {
    /* Mode 7 has no row in the modern map (an alias, see MODERN_A_WRITE_SUBCMD), so
     * its absence is the alias itself. A row that DOES exist must agree. */
    const alias = key === 'a' && row === undefined;
    if (!alias && (row?.address !== address || row.channel !== 'plain')) {
      return {
        window: null,
        reason: `this build's table does not arm mode ${String(subcmd)} at ${hexUp(address, 8)} on the plain channel`,
      };
    }
    const note = alias
      ? `${BANK_NAME[key]} write arm (mode ${String(subcmd)}, ${hexUp(address, 8)}), plain 2-byte; ` +
        'a decoded alias of mode 5, written through on a Compact XR 4.8.2.1 camera'
      : `${BANK_NAME[key]} write arm (mode ${String(subcmd)}, ${hexUp(address, 8)}), plain 2-byte`;
    return { window: { subcmd, address, note }, reason: null };
  }

  /* The locked line: the plain 2-byte arm of a protected bank is refused, so the
   * write arm is the 18-byte token form the profile's own bank window carries. */
  if (row?.address !== address || row.channel !== 'auth') {
    return {
      window: null,
      reason: `this build's table does not arm mode ${String(subcmd)} at ${hexUp(address, 8)} on the token channel`,
    };
  }
  const window = bankWindow(key);
  if (window.address !== address) {
    return {
      window: null,
      reason: `the preservation bank window for ${BANK_NAME[key]} is at ${hexUp(window.address, 8)}, not ${hexUp(address, 8)}`,
    };
  }
  return { window, reason: null };
}

/** Dump support for one bank: the profile must read, and the table must have a window for it. */
function dumpSupport(
  profile: FirmwareProfile,
  read: WindowEntry | null,
  key: SlotKey,
  address: number,
): Support {
  const cap = profile.capabilities.dump;
  if (!cap.supported) return cap;
  if (read === null) {
    return unsupported(
      `this build's BeginFirmwareUpgrade table has no window at ${hexUp(address, 8)} for ${BANK_NAME[key]}`,
    );
  }
  return SUPPORTED;
}

/**
 * Flash support for one bank, in the family's staging form. The modern and
 * 2014-plain families take the profile's own flash capability. The 2016 family
 * does not: compact-2016 declares no flash capability, but the keystream-staged
 * write is the path the preservation pipeline ran on 1.0.3.0, and the plan
 * records that refusal as a note rather than hiding it.
 */
function flashSupport(
  profile: FirmwareProfile,
  family: SlotFamily,
  write: WindowEntry | null,
  writeReason: string | null,
): Support {
  if (family === 'unverified-locked') return unsupported(UNVERIFIED_STAGING_REASON);
  if (write === null) {
    return unsupported(writeReason ?? 'this build has no write arm for the bank');
  }
  if (family === 'locked-2016') return SUPPORTED;
  const gate = profile.capabilities.flash;
  return gate.supported ? SUPPORTED : gate;
}

/**
 * What an empty bank means for a write. It follows the flash verdict exactly: a
 * bank that can be written from an image can be written while empty, because no
 * family's staging reads the target bank. A family that cannot be written at all
 * says the same reason it says for a used bank.
 */
function emptyBankPolicy(family: SlotFamily, flash: Support): EmptyBankPolicy {
  if (!flash.supported) return { writable: flash, why: flash.reason };
  const why = emptyBankWhy(family);
  if (why === null) {
    return {
      writable: unsupported('this build has no staging form, so an empty bank is not written'),
      why: 'this build has no staging form, so an empty bank is not written',
    };
  }
  return { writable: SUPPORTED, why };
}

function supportedEntry(
  profile: FirmwareProfile,
  family: SlotFamily,
  plan: WindowPlan,
  key: SlotKey,
  versionText: string,
): SlotEntry {
  const address = bankAddress(profile, key);
  const read = plan.windows.find((w) => w.address === address) ?? null;
  const write = writeWindow(family, plan, key, address);
  const dump = dumpSupport(profile, read, key, address);
  const flash = flashSupport(profile, family, write.window, write.reason);
  return {
    key,
    name: BANK_NAME[key],
    address,
    length: SLOT_BYTES,
    read,
    write: write.window,
    dump,
    flashPlain: flash,
    flashRaw: flash,
    staging: stagingFor(family),
    commitEffect: COMMIT_EFFECT,
    emptyBank: emptyBankPolicy(family, flash),
    notes: bankNotes(family, key, versionText),
  };
}

/**
 * The per-build slot capability matrix. Pure; no device.
 *
 * A build older than 0.8.0.0, an unknown version (null or undotted), and a
 * profile that cannot own the build all come back `supportedBuild` unsupported,
 * with every slot unsupported and the same reason. Nothing is attempted on them.
 */
export function buildSlotPlan(profile: FirmwareProfile, firmwareVersion: string | null): SlotPlan {
  const verdict = classifyBuild(profile, firmwareVersion);
  if (verdict.refusal !== null || verdict.version === null) {
    return refusedPlan(profile, firmwareVersion, verdict.refusal ?? 'the build is unknown');
  }

  const family = verdict.family;
  const plan = profile.windowPlan(firmwareVersion);
  const notes = planNotes(family, verdict.version);
  if (family === 'locked-2016' && !profile.capabilities.flash.supported) {
    notes.push(profileFlashNote(profile.id));
  }
  /* How a bank write is staged is the same for every bank, so it is said once, with the build's notes,
   * not on each bank (TESTING.md 42.87). `slots list --json` follows the same split: the camera's notes
   * in `notes`, a bank's own in `slots[].notes`. */
  const staging = stagingNote(family);
  if (staging !== null) notes.push(staging);
  const slots = BANK_KEYS.map((key) =>
    supportedEntry(profile, family, plan, key, verdict.version?.text ?? ''),
  );

  return {
    profileId: profile.id,
    firmwareVersion,
    supportedBuild: SUPPORTED,
    slots,
    notes,
  };
}
