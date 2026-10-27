/* ==================================================================== *
 * Which bank a locked-line camera (the 2014 plaintext chain and the 2016 Compact PRO 1.0.3.x) runs at its
 * next start, and which bank it reports it entered at this one. Pure: it reads what the slots read already
 * made. The frame-rate warning built on it is fps-boot-warning.ts; this module imports nothing that writes,
 * so the device-info read (workflows/device-info.ts) names the next start through the same function the
 * page and the CLI call.
 *
 * WHAT USB CAN SAY, read-only:
 *   - cfg[0], the boot-config word at 0x14010000. The analysis arms the mode-3 window on every read
 *     and keeps the word as DeviceState.cfg0. The NEXT start uses it.
 *   - the active-slot word, roots[8] (GetFirmwareInfo selector 10), kept as DeviceState.activeSlotWord.
 *     Selector 10 returns the address of the firmware's roots record, and the word is its +8. The record
 *     differs by line (TESTING.md 42.56, measured on the emulator against the bank that ran):
 *       2014 (1.3.0.0) and 2016 (1.0.3.0): the boot record at 0x10000200, so the word is 0x10000208. The
 *         bootloader stores the slot it enters there before it enters the image (42.53; the 2016
 *         bootloader's Reset_Handler, FW-V1 targets/compact_pro_9hz_1_0_3_0_bootloader/src/startup.c:187-195,
 *         handoff->slot), and the word is the bank that ran for boot words 0, 1 and 2. The cell 0x1000AED0
 *         holds other data on these lines.
 *       4.9.1.15: the roots record at 0x10002110, so the word is 0x10002118. It follows the bank that runs
 *         (0 for A, 2 for R; boot word 1 runs A, because B is refused). The cell 0x1000AED0 is 0xFFFFFFFF.
 *         The writer of this word is not established by the test.
 *       4.8.2.1: the reply is zero under every boot word, so the word is 0 whatever runs (42.43, 42.50). The
 *         record was not found, and the cell 0x1000AED0 reads 0 there.
 *     Bank values: 0 is slot A, 1 is slot B, 2 is recovery R. The lines that report it are below.
 *
 * WHICH BANK A START RUNS: the rule both locked-line bootloaders share (profiles/locked-boot.ts), over one
 * verdict per bank. On the 2014 chain the verdict is image_sum_ok on the stored bytes (plainBankVerdict,
 * running.ts). On the 2016 line it is the device-seeded check the read already made (device-info.ts
 * `checkKeyOf`: the bank decrypts to a zero word sum under the key its bootloader checks a bank under).
 * ==================================================================== */

import {
  bankNameOf,
  bankOfActiveSlotWord,
  bankWordsOf,
  lockedBootRule,
  selectLockedBoot,
  type BootVerdict,
} from '../profiles/locked-boot.js';
import type { FirmwareProfile, SlotKey } from '../profiles/types.js';
import type { DeviceState } from '../workflows/types.js';
import { classifyBuild } from './capability-family.js';
import { lockedBankVerdict, onCompactPro2016Line, onPlaintextChain } from './running.js';

export { bankNameOf, bankWordsOf };

/**
 * Why a 2016 bank has no boot verdict when the read could not name the key its bootloader checks a bank
 * under (device-info.ts `checkKeyOf`). It completes "slot A …" in the boot choice's sentence.
 */
export const CHECK_KEY_UNNAMED_VERDICT =
  'could not be checked: the key its bootloader checks a bank under was not named';

/**
 * Whether this build's boot rule and bank check are decoded, so the page and the CLI name the bank the
 * next start runs and warn about a frame-rate patch that will not: the 2014 plaintext chain (a bank the
 * read opened is stored plain, `DeviceState.plainChain`) and the 2016 Compact PRO line read under its own
 * profile (running.ts `onCompactPro2016Line`). The 1.3.0.8 FF build is on neither: its banks are not stored
 * plain, and the bootloader that checks them is not decoded for that form (TESTING.md 42.12).
 */
export function bootRuleKnown(
  state: Pick<DeviceState, 'profile' | 'version' | 'plainChain'>,
): boolean {
  return state.plainChain || onCompactPro2016Line(state.profile, state.version);
}

/**
 * The bank the active-slot word names: 0 slot A, 1 slot B, 2 recovery R. Null for any other value, or
 * when unread. This is the mapping only; bootChoiceOf decides which lines it is reported on.
 */
export function reportedBootedOf(activeSlotWord: number | null): SlotKey | null {
  return bankOfActiveSlotWord(activeSlotWord);
}

export interface BootChoice {
  /** cfg[0] as read, or null when the word was not read. */
  readonly word: number | null;
  /** The bank the next start runs, or null when a bank the word needs has no verdict. */
  readonly runs: SlotKey | null;
  /**
   * The bank the camera reports it entered at its last start, from the active-slot word. Only on the
   * 2014 plaintext chain, the 2016 line and the 4.9.x Compact PRO (reportsActiveSlotWord); null on 4.8.x,
   * where the word is 0 whatever runs (TESTING.md 42.43, 42.50, 42.56). Null too when the word is unread
   * or names no bank.
   */
  readonly reportedBooted: SlotKey | null;
  /** One sentence: the word's rule and the bank it gives, or what could not be checked. */
  readonly why: string;
}

/**
 * Whether the active-slot word is reported as the bank the camera booted: the 2014 plaintext chain, the 2016
 * line (1.0.3.0 measured, TESTING.md 42.56: the word is the bank that ran), and the 4.9.x Compact PRO, whose
 * word follows the bank that runs (42.50, 42.56). Not 4.8.x, where the word is 0 under every boot word (42.43,
 * 42.50, 42.56). The 4.x line is split by the minor number of the parsed version, the same parse classifyBuild
 * makes; the profile must be modern-4x, or the build is refused and not reported.
 */
export function reportsActiveSlotWord(profile: FirmwareProfile, version: string | null): boolean {
  if (onPlaintextChain(profile, version)) return true;
  const verdict = classifyBuild(profile, version);
  if (verdict.family === 'locked-2016') return true;
  return verdict.family === 'modern' && verdict.version?.major === 4 && verdict.version.minor === 9;
}

/**
 * The bank the next start runs, from the boot-config word and the banks the analysis read. The word
 * alone is not enough: a bank the bootloader refuses is passed over, and the last bank of the word's
 * order runs, unchecked, when the two before it both fail. Meaningful where `bootRuleKnown` holds; the
 * page and the CLI show it only there.
 */
export function bootChoiceOf(
  state: Pick<
    DeviceState,
    'cfg0' | 'activeSlotWord' | 'byKey' | 'profile' | 'version' | 'checkKey'
  >,
): BootChoice {
  /* The word is reported as a bank where it is established as one: the 2014 line (where the page names
   * the booted bank from it, device-info.ts chainReplay), the 2016 line and the 4.9.x Compact PRO (42.50,
   * 42.56). Not on 4.8.x, where it is 0 whatever runs (42.43, 42.50, 42.56). */
  const reportedBooted = reportsActiveSlotWord(state.profile, state.version)
    ? reportedBootedOf(state.activeSlotWord)
    : null;
  if (state.cfg0 === null) {
    return {
      word: null,
      runs: null,
      reportedBooted,
      why: 'the boot-config word (cfg[0]) was not read, so the bank the next start runs is not known',
    };
  }
  const word = state.cfg0 >>> 0;
  const line2016 = onCompactPro2016Line(state.profile, state.version);
  const accepts: Record<SlotKey, BootVerdict> = {
    a: lockedBankVerdict(state.byKey.get('a'), line2016),
    b: lockedBankVerdict(state.byKey.get('b'), line2016),
    r: lockedBankVerdict(state.byKey.get('r'), line2016),
  };
  /* On 2016 a bank with no verdict is one the check key could not settle; say that, not "was not read". */
  const unnamed = line2016 && state.checkKey?.key == null;
  const selection = selectLockedBoot(
    word,
    accepts,
    unnamed ? CHECK_KEY_UNNAMED_VERDICT : undefined,
  );
  return { word, runs: selection.runs, reportedBooted, why: selection.why };
}

/**
 * The bank the camera reports it entered at its last start, from the active-slot word, on every line that
 * reports the word (`reportsActiveSlotWord`: the 2014 chain, the 2016 line, the 4.9.x Compact PRO); null on
 * the others, and when the word is unread or names no bank. `bootChoiceOf`'s `reportedBooted`, without the
 * boot-config rule, so a 4.x read has it too.
 */
export function lastStartOf(
  state: Pick<DeviceState, 'activeSlotWord' | 'profile' | 'version'>,
): SlotKey | null {
  return reportsActiveSlotWord(state.profile, state.version)
    ? reportedBootedOf(state.activeSlotWord)
    : null;
}

/** The boot-config word as the CLI prints it, with the rule it sets. */
export function bootWordRuleOf(word: number): string {
  return lockedBootRule(word);
}
