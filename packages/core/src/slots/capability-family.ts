/* ==================================================================== *
 * The slot FAMILY of one build: which bank layout it has, how its banks are
 * staged, and whether a plan can be made for it at all.
 *
 * WHY A FAMILY AND NOT THE PROFILE ALONE. The profile says which selector table
 * a read goes through, and the locked line shares one table across its builds.
 * What differs inside that line is the cipher its banks are stored under, and
 * that decides the staging form, so the bytes a write must send. The 2014
 * Compacts store their banks plain; the Compact PRO 1.0.3.x stores them under
 * xorshift128; the 4.x line stores them under Key A. A version string decides
 * which of these a build is, and only for the builds whose images the
 * preservation patch tables (preservation/patch.ts) were derived from, so the
 * classification names those builds explicitly and anything else is read-only.
 *
 * THE BANK ADDRESSES ARE NOT ONE SET. The contract's comment in types.ts says
 * A = 0x14050000, B = 0x14060000, R = 0x14070000. That is the locked line's
 * layout (every decoded 0.x/1.x image sends mode 7/8/9 there). The 2018-and-later
 * line sends mode 7/8 to 0x14030000/0x14050000 and no selector reaches
 * 0x14060000 at all, so its B is 0x14050000 (modern-4x.ts). The addresses come
 * from each profile's own `slots`, never from one constant here.
 * ==================================================================== */

import { legacyVersionLine } from '../profiles/legacy-auth.js';
import type { FirmwareProfile, SlotKey } from '../profiles/types.js';
import { parseVersion, type FirmwareVersion } from '../profiles/version.js';
import type { StagingForm } from './types.js';

/** The first build a slot can be planned for. 0.7.x and older have no read handler. */
export const FIRST_SUPPORTED_VERSION = '0.8.0.0';

/**
 * The families a build can fall into. `pre-0.8` and `unidentified` are the two
 * refusals; `unverified-locked` is readable but has no measured staging form.
 */
export type SlotFamily =
  /** 2.x, 4.x, 10.x, 42.x, 44.x: the modern selector map, banks under Key A. */
  | 'modern'
  /** 0.8.0.0 .. 1.3.0.8 (8 Hz): the 2014 plaintext chain, banks stored plain. */
  | 'locked-plain'
  /** Compact PRO 1.0.3.0 and 1.0.3.2 (and their FF builds): xorshift128 keystream. */
  | 'locked-2016'
  /** A 0.x or 1.x build the preservation tables never measured. Read only. */
  | 'unverified-locked'
  /** Older than 0.8.0.0. Nothing is read or written. */
  | 'pre-0.8'
  /** No version, an unparseable version, or a profile that cannot own this build. */
  | 'unidentified';

/**
 * The 2014 plaintext chain, by the versions the preservation patch tables stage
 * plain (patch.ts: 0.8.0.0, 0.9.0.2 .. 0.10.0.0, the 1.0.0.0 / 1.2.0.0 / 1.3.0.0
 * trio, and the 1.3.0.8 8 Hz build). 1.3.0.8 is listed for its 8 Hz build; its
 * 16 Hz FF build shares the string and is NOT plain (see capability-notes.ts).
 */
export const PLAIN_CHAIN_VERSIONS: ReadonlySet<string> = new Set([
  '0.8.0.0',
  '0.9.0.2',
  '0.9.0.6',
  '0.9.0.7',
  '0.9.1.0',
  '0.10.0.0',
  '1.0.0.0',
  '1.2.0.0',
  '1.3.0.0',
  '1.3.0.8',
]);

/** The Compact PRO builds the 2016 keystream staging was measured on (patch.ts, compact-2016). */
export const COMPACT_PRO_2016_VERSIONS: ReadonlySet<string> = new Set(['1.0.3.0', '1.0.3.2']);

/** Why a readable 0.x/1.x build has no write: its staging form was never measured. */
export const UNVERIFIED_STAGING_REASON =
  'this build is on the locked 0.x/1.x line but is not one of the builds the preservation ' +
  'patch tables were measured on (0.8.0.0 .. 1.3.0.8 and 1.0.3.0 / 1.0.3.2), so the staging ' +
  'form its bank takes is unknown and nothing is written';

export interface FamilyVerdict {
  readonly family: SlotFamily;
  /** The parsed version, or null when the version could not be read or parsed. */
  readonly version: FirmwareVersion | null;
  /** Why no slot can be read or written on this build; null when one can. */
  readonly refusal: string | null;
}

function refused(
  family: SlotFamily,
  version: FirmwareVersion | null,
  refusal: string,
): FamilyVerdict {
  return { family, version, refusal };
}

function lockedFamily(text: string): SlotFamily {
  if (PLAIN_CHAIN_VERSIONS.has(text)) return 'locked-plain';
  if (COMPACT_PRO_2016_VERSIONS.has(text)) return 'locked-2016';
  return 'unverified-locked';
}

/**
 * The family of one build, for one profile. A profile that cannot own the build
 * (modern-4x on a 1.x build, compact-2014 on a 4.x build) is a refusal, not a
 * guess at which profile should have been used.
 */
export function classifyBuild(
  profile: FirmwareProfile,
  firmwareVersion: string | null,
): FamilyVerdict {
  if (firmwareVersion === null) {
    return refused(
      'unidentified',
      null,
      'the firmware version could not be read, so the build, its banks and their staging form ' +
        'are unknown; nothing is read or written on it',
    );
  }
  const version = parseVersion(firmwareVersion);
  if (version === null) {
    return refused(
      'unidentified',
      null,
      `firmware version "${firmwareVersion}" is not a dotted version, so the build, its banks ` +
        'and their staging form are unknown; nothing is read or written on it',
    );
  }
  const text = version.text;

  if (version.major === 0 && version.minor < 8) {
    return refused(
      'pre-0.8',
      version,
      `firmware ${text} is older than ${FIRST_SUPPORTED_VERSION}: its RPC table has no read ` +
        'handler for GetFeaturedFirmwareData, the only command a bank is read with, so neither ' +
        'a read nor a write is sent to it (compact-2014 has the evidence)',
    );
  }

  switch (profile.id) {
    case 'modern-4x':
      if (version.major < 2) {
        return refused(
          'unidentified',
          version,
          `profile modern-4x covers 2.x, 4.x, 10.x, 42.x and 44.x; ${text} is on the 0.x / 1.x ` +
            'locked line, which needs legacy-auth or compact-2016',
        );
      }
      return { family: 'modern', version, refusal: null };

    case 'legacy-auth':
      if (version.major >= 2) {
        return refused(
          'unidentified',
          version,
          `profile legacy-auth covers the 0.x / 1.x locked line; ${text} is on the modern line, ` +
            'which needs modern-4x',
        );
      }
      return { family: lockedFamily(text), version, refusal: null };

    case 'compact-2016':
      if (legacyVersionLine(text) !== 'compact-pro-2016') {
        return refused(
          'unidentified',
          version,
          `profile compact-2016 covers the Compact PRO 1.0.3.x line; ${text} is not on it`,
        );
      }
      return { family: lockedFamily(text), version, refusal: null };

    case 'compact-2014':
      return refused(
        'unidentified',
        version,
        `profile compact-2014 covers the builds older than ${FIRST_SUPPORTED_VERSION} only, and ` +
          `${text} is read through legacy-auth`,
      );

    case 'generic':
      return refused(
        'unidentified',
        version,
        'the camera family is not identified (profile generic), so the bank layout and the ' +
          'staging form are unknown; identify the camera before a slot is read or written',
      );

    default:
      return refused(
        'unidentified',
        version,
        `no slot plan exists for profile ${profile.id}: its bank layout and staging form are not known`,
      );
  }
}

/**
 * The staging form a family's banks take. Null for every family with no
 * measured form: those are the refusals and the unverified locked builds.
 */
export function stagingFor(family: SlotFamily): StagingForm | null {
  switch (family) {
    case 'modern':
      return 'key-a-ciphertext';
    case 'locked-plain':
      return 'plain';
    case 'locked-2016':
      return 'slot-keystream-ciphertext';
    case 'unverified-locked':
    case 'pre-0.8':
    case 'unidentified':
      return null;
  }
}

/** The three banks, in the bootloader's own order. */
export const BANK_KEYS: readonly SlotKey[] = ['a', 'b', 'r'];

export const BANK_NAME: Readonly<Record<SlotKey, string>> = {
  a: 'Bank A',
  b: 'Bank B',
  r: 'Recovery bank R',
};

/**
 * The BeginFirmwareUpgrade subcommand that arms a bank for a WRITE. Data types
 * 7, 8 and 9 are the three the commit programs with `fw_validate_decrypt_program`
 * and never with a boot-config write (cmd_CompleteMemoryUpgrade.c, and the
 * locked line's handlers for 1.3.0.8 and 1.0.3.0). Type 0 is the one that
 * rewrites cfg[0], and this page never arms it.
 */
export const WRITE_SUBCMD: Readonly<Record<SlotKey, number>> = { a: 7, b: 8, r: 9 };

/**
 * Modern bank A is armed for a write through mode 7, which the modern selector
 * map leaves out: it is an alias of mode 5 (`fw_slot_a_base + g_flash_base_offset`,
 * the same 0x14030000 the decoded switch gives on every 2.x/4.x/10.x/42.x/44.x
 * image). Decoded, not measured on the wire, and the notes say so.
 */
export const MODERN_A_WRITE_SUBCMD = 7;
