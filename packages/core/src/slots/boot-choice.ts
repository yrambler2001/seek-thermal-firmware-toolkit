/* ==================================================================== *
 * Which bank a locked-line camera (the 2014 plaintext chain and the 2016 Compact PRO 1.0.3.x) runs at its
 * next start, and what a frame-rate patch in a bank that does not run leaves behind. Pure: it reads what
 * the slots read already made.
 *
 * WHAT USB CAN SAY, read-only:
 *   - cfg[0], the boot-config word at 0x14010000. The analysis arms the mode-3 window on every read
 *     and keeps the word as DeviceState.cfg0. The NEXT start uses it.
 *   - the active-slot word, roots[8] (GetFirmwareInfo selector 10), kept as DeviceState.activeSlotWord.
 *     Selector 10 returns the address of the firmware's roots record, and the word is its +8. The record
 *     differs by line (TESTING.md 42.56, measured on the emulator against the bank that ran):
 *       2014 (1.3.0.0) and 2016 (1.0.3.0): the boot record at 0x10000200, so the word is 0x10000208. The
 *         bootloader stores the slot it enters there before it enters the image (42.53), and the word is the
 *         bank that ran for boot words 0, 1 and 2. The cell 0x1000AED0 holds other data on these lines.
 *       4.9.1.15: the roots record at 0x10002110, so the word is 0x10002118. It follows the bank that runs
 *         (0 for A, 2 for R; boot word 1 runs A, because B is refused). The cell 0x1000AED0 is 0xFFFFFFFF.
 *         The writer of this word is not established by the test.
 *       4.8.2.1: the reply is zero under every boot word, so the word is 0 whatever runs (42.43, 42.50). The
 *         record was not found, and the cell 0x1000AED0 reads 0 there.
 *     Bank values: 0 is slot A, 1 is slot B, 2 is recovery R. The lines that report it are below.
 *
 * WHICH BANK A START RUNS: the rule both locked-line bootloaders share (profiles/locked-boot.ts), over one
 * verdict per bank. On the 2014 chain the verdict is image_sum_ok on the stored bytes (plainBankVerdict,
 * running.ts). On the 2016 line it is the device-seeded check the read already made (device-info.ts: the
 * bank decrypts to a zero sum under the key the bank the camera booted is stored under).
 * ==================================================================== */

import { identifyFpsImage, FPS_MEASURED_HZ } from '../preservation/fps-patch.js';
import {
  bankOfActiveSlotWord,
  bankWordsOf,
  lockedBootRule,
  selectLockedBoot,
  type BootVerdict,
} from '../profiles/locked-boot.js';
import type { FirmwareProfile, SlotKey } from '../profiles/types.js';
import type { DeviceState } from '../workflows/types.js';
import { classifyBuild } from './capability-family.js';
import { fpsPlanOfBank } from './fps-patch.js';
import { lockedBankVerdict, onPlaintextChain } from './running.js';
import type { SlotsReport } from './types.js';

/** The banks, in the order the page and the CLI list them. */
const KEYS: readonly SlotKey[] = ['a', 'b', 'r'];

/**
 * The stock frame rate of the 2014 chain's Compact builds (1.3.0.0 and 1.3.0.8). A corpus build that
 * runs above it (FPS_KNOWN_RATE) holds a frame-rate patch as much as a patched table entry does. The
 * 2016 Compact PRO's stock builds run at 9 Hz and none of them is in FPS_KNOWN_RATE (its builds there
 * are the 18 Hz FF ones), so the one threshold serves both lines.
 */
const STOCK_HZ = 8;

export { bankWordsOf };

/**
 * Whether this build's boot rule and bank check are decoded, so the page and the CLI name the bank the
 * next start runs and warn about a frame-rate patch that will not: the 2014 plaintext chain and the 2016
 * Compact PRO line (profiles/locked-boot.ts).
 */
export function bootRuleKnown(state: Pick<DeviceState, 'profile' | 'version'>): boolean {
  return classifyBuild(state.profile, state.version).family === 'locked-plain' || on2016Line(state);
}

/**
 * The 2016 Compact PRO line, read under its own profile. Under legacy-auth its banks are checked against
 * the 2014 line's target, so no bank verdict of that read describes this bootloader's check.
 */
function on2016Line(state: Pick<DeviceState, 'profile' | 'version'>): boolean {
  return (
    state.profile.id === 'compact-2016' &&
    classifyBuild(state.profile, state.version).family === 'locked-2016'
  );
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
  /** The bank the next start runs, or null when a bank the word needs was not read. */
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
function reportsActiveSlotWord(profile: FirmwareProfile, version: string | null): boolean {
  if (onPlaintextChain(profile, version)) return true;
  const verdict = classifyBuild(profile, version);
  if (verdict.family === 'locked-2016') return true;
  return verdict.family === 'modern' && verdict.version?.major === 4 && verdict.version.minor === 9;
}

/**
 * The bank the next start runs, from the boot-config word and the banks the analysis read. The word
 * alone is not enough: a bank the bootloader refuses is passed over, and recovery R runs when the
 * word asks for it or when A and B both fail, whatever R holds.
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
  const line2016 = on2016Line(state);
  const accepts: Record<SlotKey, BootVerdict> = {
    a: lockedBankVerdict(state.byKey.get('a'), line2016),
    b: lockedBankVerdict(state.byKey.get('b'), line2016),
    r: lockedBankVerdict(state.byKey.get('r'), line2016),
  };
  const unnamed = line2016 && state.checkKey?.key == null;
  const selection = selectLockedBoot(
    word,
    accepts,
    unnamed ? 'could not be checked: the key its bootloader checks a bank under was not named' : undefined,
  );
  return { word, runs: selection.runs, reportedBooted, why: selection.why };
}

/** A frame-rate patch an image holds: the frame rate it runs at, and the table entry or corpus build it is. */
export interface PatchHeld {
  readonly hz: number;
  readonly what: string;
}

/**
 * The frame-rate patch a decrypted image holds, or null: a patched table entry, or a corpus build that
 * runs above the stock rate. A stock image of a table entry holds none.
 */
export function fpsPatchHeldBy(plain: Uint8Array | null): PatchHeld | null {
  if (plain === null) return null;
  const identity = identifyFpsImage(plain);
  const patched = identity.patchedEntries[0];
  if (patched !== undefined) {
    return { hz: FPS_MEASURED_HZ.get(patched.id) ?? patched.targetHz, what: patched.id };
  }
  if (identity.known !== null && identity.known.hz > STOCK_HZ) {
    return { hz: identity.known.hz, what: identity.known.name };
  }
  return null;
}

export interface FpsBootWarning {
  /** The bank the next start runs. */
  readonly runs: SlotKey;
  /** The boot-config word the warning is about. */
  readonly word: number;
  /** The banks that hold a frame-rate patch, or are about to be patched, and do not run. */
  readonly idle: readonly SlotKey[];
  /** The warning, one paragraph each. The page and the CLI show the same text. */
  readonly paragraphs: readonly string[];
}

export interface FpsBootOptions {
  /** The bank about to be patched. It counts as holding the patch. */
  readonly target?: SlotKey;
  /** What an image holds. Default: fpsPatchHeldBy. A seam for tests that hand-make images. */
  readonly heldBy?: (plain: Uint8Array | null) => PatchHeld | null;
  /** Why a bank cannot be patched here, or null. Default: that bank's own plan. A seam for tests. */
  readonly patchBlock?: (key: SlotKey) => string | null;
}

function plainOf(report: SlotsReport, key: SlotKey): Uint8Array | null {
  return report.slots.find((view) => view.entry.key === key)?.state?.plain ?? null;
}

function patchBlockOf(report: SlotsReport, key: SlotKey): string | null {
  const plan = fpsPlanOfBank(report, key);
  return plan.status === 'offer' ? null : plan.reason;
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function joinBanks(keys: readonly SlotKey[]): string {
  return keys.map(bankWordsOf).join(' and ');
}

/**
 * The warning for a frame-rate patch that will not take effect: a patched bank (or the bank about to be
 * patched) that the next start does not run. Null when the bank that runs holds the patch, or will hold
 * it once the planned patch is written, or when nothing that holds a patch is idle. Only the lines whose
 * boot rule is decoded (`bootRuleKnown`: the 2014 plaintext chain and the 2016 Compact PRO) get one.
 *
 * The fix the warning names is the bank that runs: a patch there is what makes the camera run it.
 */
export function fpsBootWarningOf(
  report: SlotsReport,
  options: FpsBootOptions = {},
): FpsBootWarning | null {
  if (!bootRuleKnown(report.state)) return null;
  const choice = bootChoiceOf(report.state);
  if (choice.word === null || choice.runs === null) return null;
  const runs = choice.runs;
  const heldBy = options.heldBy ?? fpsPatchHeldBy;
  const holdsNow = (key: SlotKey): PatchHeld | null => heldBy(plainOf(report, key));
  if (runs === options.target || holdsNow(runs) !== null) return null;

  const idle = KEYS.filter(
    (key) => key !== runs && (key === options.target || holdsNow(key) !== null),
  );
  if (idle.length === 0) return null;

  const runsName = bankWordsOf(runs);
  const paragraphs: string[] = [`The camera boots ${runsName}. ${capitalise(choice.why)}.`];
  const patchedNow = idle.filter((key) => holdsNow(key) !== null);
  if (patchedNow.length === 1) {
    paragraphs.push(
      `${capitalise(joinBanks(patchedNow))} holds a frame-rate patch, but it does not run, so the patch does not take effect.`,
    );
  } else if (patchedNow.length === 2) {
    paragraphs.push(
      `${capitalise(joinBanks(patchedNow))} hold frame-rate patches, but neither runs, so the patches do not take effect.`,
    );
  }
  const target = options.target;
  if (target !== undefined && idle.includes(target) && holdsNow(target) === null) {
    paragraphs.push(
      `Patching ${bankWordsOf(target)} would not make it run, because the camera boots ${runsName} instead.`,
    );
  }
  const block =
    options.patchBlock === undefined ? patchBlockOf(report, runs) : options.patchBlock(runs);
  paragraphs.push(
    block === null
      ? `Patch ${runsName} too (the bank that runs): that is what makes the frame-rate patch take effect.`
      : `${capitalise(runsName)} cannot be patched here (${block}), so a frame-rate patch in another bank does not take effect on this camera.`,
  );
  return { runs, word: choice.word, idle, paragraphs };
}

/** The boot-config word as the CLI prints it, with the rule it sets. */
export function bootWordRuleOf(word: number): string {
  return lockedBootRule(word);
}
