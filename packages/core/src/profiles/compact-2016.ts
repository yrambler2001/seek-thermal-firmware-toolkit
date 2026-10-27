/**
 * `compact-2016` — the 2016 generation, which is `legacy-auth`'s protocol with
 * a different cipher.
 *
 * The original never identified this generation positively. It identified it by
 * elimination, in the device-info path:
 *
 *   "The 2016 Compact Pro generation uses K=0 / acceptance sum 0 and a different
 *    BeginFirmwareUpgrade map. Nothing here is valid for it."
 *
 * and then, when no slot decrypted to the 0x0000FFFF target:
 *
 *   "no slot on this camera decrypts to the 0x0000FFFF acceptance sum this view
 *    expects — it is probably the 2016 generation. Flashing is disabled."
 *
 * That negative test is encoded here as a real profile: the cipher it actually
 * uses is declared and the read paths stay open. The original's refusal to
 * write is gone (2026-10-27): the slot writer stages a 2016 bank in its own
 * keystream form, the path the preservation run took on 1.0.3.0 and the Work
 * with firmware slots tab took on a real 1.0.3.0 camera (TESTING.md 42.85).
 *
 * ---- WHAT CHANGED, 2026-09-22, AND WHY IT MATTERS -------------------
 *
 * This profile used to carry the MODERN selector map and say so in its own
 * summary: "UNVERIFIED SELECTOR MAP — the map below is the 4.x one ... this
 * generation is known to use a different BeginFirmwareUpgrade map, so windows
 * may stall and be gap-filled." It knew it was wrong and shipped anyway.
 *
 * It is not unverified any more, in either direction. The generation this
 * profile is named after IS the one `legacy-auth` describes:
 *
 *   - FW-V1's byte-exact reconstruction of the 2016 Compact PRO 1.0.3.0's
 *     `cmd_BeginFirmwareUpgrade` (`codegen/fn/cmd_BeginFirmwareUpgrade.c`,
 *     variant `gcc49_shape`, target `compact_pro_9hz_2016`) is the handler with
 *     the `(mode - 2) <= 7` plain-channel guard and the 16-byte `memcmp`. Its
 *     window table is `0x14050000`/`0x14060000` for the case-0 image-id gate,
 *     then `0x14020000`, `0x14000000`, `0x14010000`, `0x14020000`,
 *     `0x14030000` .. `0x141F0000` for cases 1..0x21 — which is `legacy-auth`'s
 *     map, bank for bank.
 *   - Measured, the three 2016 parts and the four 1.0.3.x images answer 25 of
 *     the modern map's 63 selectors and refuse 38: the six protected banks and
 *     every selector above 0x141FFFFF.
 *
 * So the old arrangement gap-filled the six banks that hold the boot config and
 * the firmware images — the most interesting 384 KiB on the part — and spent 32
 * refused selectors on 2 MiB of address space this generation does not decode.
 * It now uses the map its firmware has, with the token on the protected banks.
 *
 * WHICH OF THE TWO A LIVE CAMERA IS READ UNDER. They share a selector map, so
 * the DUMP is the same either way; the choice decides which acceptance sum a
 * decrypted slot is compared against, and so every bank verdict the read
 * reports. The capability probe has no slots to offer, so the version line
 * decides it (2026-10-26; it used to be legacy-auth on the channel answers,
 * which reported a 1.0.3.0 camera's banks as failing and then read it again).
 * Once the slots are read, the cipher tells the two apart.
 *
 * WHAT IS STILL ITS OWN, and why this is not simply `legacy-auth`: the cipher.
 * A 1.0.3.x part decrypts to a 0x00000000 acceptance sum, a 1.3.0.8 Compact to
 * 0x0000FFFF, and both under no whitening at all. The toolkit's own
 * `CipherProfile` keeps K and TARGET as separate axes for exactly this reason,
 * and the two profiles differ in one field.
 *
 * TELLING THEM APART, CORRECTED 2026-10-06. Detection used to take "a slot
 * sums to 0" as this generation, which a 2014 Compact satisfies too: its banks
 * are stored plain and their stored words sum to 0. And `legacy-auth` never
 * looked at a sum at all, so with the probe's evidence kept it outscored this
 * profile on a 1.0.3.0 camera whose every slot it would fail. Now the chain
 * decides: a slot stored PLAIN rules this profile out, a slot under a real
 * keystream decrypting to 0 rules `legacy-auth` out, and the version line
 * (1.0.3.x) and the bootloader's generation (1.x) corroborate.
 */

import { hexUp } from '../bytes.js';
import type {
  DetectionVerdict,
  DeviceEvidence,
  FirmwareProfile,
  CipherProfile,
  ProfileCapabilities,
} from './types.js';
import { SUPPORTED } from './types.js';
import { HDR_HI, HDR_LO } from './modern-4x.js';
import {
  buildLegacyWindowMap,
  LEGACY_BOOT,
  LEGACY_MEMORY,
  LEGACY_SLOTS,
  LEGACY_SWEEP_RANGE,
  legacyVersionLine,
  legacyWindowPlan,
} from './legacy-auth.js';
import { parseVersion, primaryVersion, versionSource } from './version.js';

/** No whitening and a zero acceptance target — the original's second DEC_PROFILE. */
const COMPACT_2016_CIPHER: CipherProfile = {
  whiteningK: 0x00000000,
  acceptanceSum: 0x00000000,
  clearWords: [HDR_LO, HDR_HI],
};

const CAPABILITIES: ProfileCapabilities = {
  /* Reads stay open, and now on the right map: the six protected banks are
   * reachable with the token rather than gap-filled. */
  dump: SUPPORTED,
  allSelectors: SUPPORTED,
  decrypt: SUPPORTED,
  deviceInfo: SUPPORTED,
  /* A bank write on the slots tab, which stages the bank in this generation's keystream form
   * (slots/capability-family.ts `stagingFor`). */
  flash: SUPPORTED,
};

/* ---- detection ---------------------------------------------------------- */

/** A slot under a real keystream summing to zero: the defining measurement for this generation. */
const SCORE_DECISIVE = 0.9;
/** That sum AND the plain channel measured refused on a protected bank. */
const SCORE_CORROBORATED = 0.96;
/** What each further independent signal adds when it agrees: the version line, the bootloader. */
const SCORE_AGREES = 0.01;
/**
 * The Compact PRO's 1.0.3.x version line with no slot read: the probe's view. It outranks legacy-auth's
 * channel answers on the same camera (legacy-auth.ts `detectLegacy` caps itself on this line), so the
 * first read is made under this cipher; the slots overrule it once read.
 */
const SCORE_VERSION_LINE = 0.85;
/** A 0.x/1.x version on no known line: the locked Compact firmware is numbered so too. */
const SCORE_WEAK = 0.35;

const MODERN_ACCEPT_SUM = 0x0000ffff;

const LEGACY_MAJORS: readonly number[] = [0, 1];

/**
 * The slots' measurements: whether one is stored under a real keystream and
 * decrypts to 0 (this generation), and whether one is stored plain (the 2014
 * chain). Without `observedSlots` the chain is unknown and only the sum speaks.
 */
function chainEvidence(evidence: DeviceEvidence): {
  readonly keyedZero: boolean;
  readonly storedPlain: boolean;
  readonly chainKnown: boolean;
} {
  const slots = evidence.observedSlots;
  if (slots === undefined) {
    const zero = (evidence.observedAcceptanceSums ?? []).some((sum) => sum >>> 0 === 0);
    return { keyedZero: zero, storedPlain: false, chainKnown: false };
  }
  return {
    keyedZero: slots.some((s) => s.chain === 'cipher' && s.acceptanceSum >>> 0 === 0),
    storedPlain: slots.some((s) => s.chain === 'plain'),
    chainKnown: true,
  };
}

function detectCompact2016(evidence: DeviceEvidence): DetectionVerdict {
  const reasons: string[] = [];
  const sums = evidence.observedAcceptanceSums ?? [];

  /* A build with no read handler is early-compact's, whatever it sums to: the
   * 2014 images sum to zero as well, and this profile dumps. */
  const early = primaryVersion(evidence);
  if (early !== null && early.major === 0 && early.minor < 8) {
    reasons.push(
      `firmware ${early.text} is older than 0.8.0.0 and has no read handler for ` +
        'GetFeaturedFirmwareData — that is early-compact, not this family',
    );
    return { score: 0, reasons };
  }

  if (sums.some((sum) => sum >>> 0 === MODERN_ACCEPT_SUM)) {
    reasons.push(
      `a slot decrypts to the ${hexUp(MODERN_ACCEPT_SUM)} acceptance sum, which is not ` +
        "this generation's target",
    );
    return { score: 0, reasons };
  }

  /* A camera that armed a protected bank on the plain channel is not on the
   * locked line at all, whatever its slots sum to. Measured, not inferred. */
  if (evidence.plainSelectorRefused === false) {
    reasons.push(
      'a plain 2-byte BeginFirmwareUpgrade armed a protected bank, so this camera is not on ' +
        'the locked line this family shares with legacy-auth',
    );
    return { score: 0, reasons };
  }

  const version = primaryVersion(evidence);
  if (version !== null && !LEGACY_MAJORS.includes(version.major)) {
    reasons.push(`firmware ${version.text} is not on the 0.x / 1.x line`);
    return { score: 0, reasons };
  }

  /* THE CHAIN. Both chains sum to 0, so the sum alone cannot tell a 2014
   * Compact from this generation; how the slot is stored can. A bank stored
   * plain, with nothing keyed beside it summing to 0, is the 2014 chain. */
  const chain = chainEvidence(evidence);
  if (chain.storedPlain && !chain.keyedZero) {
    reasons.push(
      'a slot is stored plain — the keystream solve returns the identity state, so its stored ' +
        "words ARE the image — which is the 2014 plaintext chain; this generation's banks are " +
        'xorshift128 under a real key',
    );
    return { score: 0, reasons };
  }

  let score = 0;
  if (chain.keyedZero) {
    score = SCORE_DECISIVE;
    reasons.push(
      chain.chainKnown
        ? `a slot stored under a real xorshift128 keystream decrypts to the ${hexUp(0)} ` +
            "acceptance sum, which is this generation's cipher"
        : `a slot decrypts to the ${hexUp(0)} acceptance sum, which is this generation's target`,
    );
    if (evidence.plainSelectorRefused === true) {
      reasons.push(
        'and a protected bank refused the plain 2-byte arm, which is the locked handler',
      );
      score = SCORE_CORROBORATED;
    }
  }

  /* THE VERSION LINE. The two lines share this handler, so a version decides
   * no selector; it is evidence about the cipher (`legacyVersionLine`), and with
   * no slot read it is the best evidence there is: it picks this profile for the
   * first read, so the banks are checked against this generation's target. */
  if (version !== null) {
    const said =
      `${versionSource(evidence) === 'dump' ? 'the image header says' : 'the camera reports'} ` +
      `firmware ${version.text}`;
    const line = legacyVersionLine(version.text);
    if (line === 'compact-pro-2016') {
      reasons.push(`${said}, the 2016 Compact PRO's 1.0.3.x line`);
      score = score > 0 ? score + SCORE_AGREES : SCORE_VERSION_LINE;
    } else if (line === 'compact') {
      reasons.push(`${said}, a Compact build, not the Compact PRO's 1.0.3.x line`);
    } else {
      /* Weak on purpose: the locked Compact firmware is numbered 0.x/1.x too,
       * and a measured 1.3.0.8 build hits 0xFFFF rather than 0. */
      reasons.push(
        `${said}, on the 0.x / 1.x line this generation shares with the locked legacy firmware`,
      );
      score = Math.max(score, SCORE_WEAK);
    }
  }

  /* THE BOOTLOADER, read back through GetFirmwareInfo selector 1. Two parts
   * measured: 1.2.0.0 (Jun 26 2016) under Compact PRO 1.0.3.0, 0.9.0.0
   * (Sep 29 2014) under Compact 1.3.0.0. It corroborates; it rules nothing
   * out on two measurements. */
  const bootloader = parseVersion(evidence.bootloaderVersion);
  if (bootloader !== null && score > 0) {
    if (bootloader.major >= 1) {
      reasons.push(
        `the bootloader reports ${bootloader.text}, a 2016-generation bootloader (1.2.0.0 is ` +
          "measured under Compact PRO 1.0.3.0; the 2014 Compact's is 0.9.0.0)",
      );
      score += SCORE_AGREES;
    } else {
      reasons.push(
        `the bootloader reports ${bootloader.text}, the 2014 generation's numbering, not this ` +
          "generation's",
      );
    }
  }

  if (score === 0) {
    reasons.push('no slot was observed decrypting to a zero acceptance sum under a real key');
  }
  return { score, reasons };
}

/* ---- the profile -------------------------------------------------------- */

export const compact2016: FirmwareProfile = {
  id: 'compact-2016',
  name: '2016 Compact Pro',
  summary:
    'The Compact PRO 1.0.3.x builds (1.0.3.0 and 1.0.3.2). They answer reads exactly as the 2014 ' +
    'Compacts do, unlock token included, so they are told apart by their version and by how ' +
    'their banks are stored: encrypted, where the 2014 banks are plain. A 1.0.3.x camera is ' +
    'read under this family from the start. The preservation run reads the whole flash, and ' +
    'banks are written one at a time on the Work with firmware slots tab.',
  stored:
    `encrypted: xorshift128, K=${hexUp(COMPACT_2016_CIPHER.whiteningK)}, the decrypted words sum ` +
    `to ${String(COMPACT_2016_CIPHER.acceptanceSum)}`,
  cipher: COMPACT_2016_CIPHER,
  /* The legacy geometry, not the modern one: 0x14000000 is blocked on every
   * channel and there is no selector above 0x141FFFFF, so the dump's gap list
   * has to say so or it will claim it read bytes it never asked for. */
  memory: LEGACY_MEMORY,
  capabilities: CAPABILITIES,
  slots: LEGACY_SLOTS,
  boot: LEGACY_BOOT,
  windowMap: buildLegacyWindowMap,
  windowPlan: legacyWindowPlan,
  sweepRange: LEGACY_SWEEP_RANGE,
  detect: detectCompact2016,
};
