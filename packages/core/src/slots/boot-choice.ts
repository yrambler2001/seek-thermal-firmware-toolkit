/* ==================================================================== *
 * Which bank the 2014 plaintext chain runs at its next start, and what a frame-rate patch in a
 * bank that does not run leaves behind. Pure: it reads what the slots read already made.
 *
 * WHAT USB CAN SAY, read-only:
 *   - cfg[0], the boot-config word at 0x14010000. The analysis arms the mode-3 window on every read
 *     and keeps the word as DeviceState.cfg0. The NEXT start uses it.
 *   - the active-slot word, roots[8] (GetFirmwareInfo selector 10), kept as DeviceState.activeSlotWord.
 *     It is the app's RAM cell 0x1000AED0, not the bootloader's handoff: the bootloader records the slot
 *     it enters in the warm-boot handoff (bootloader src/startup.c, `handoff->slot`). The 4.8.x factory
 *     app never writes the cell (TESTING.md 42.43), so its word reads 0 under every boot word (42.50).
 *     The 4.9.x Compact PRO does write it, and follows the bank that runs: in the emulator it reads 2 when
 *     R runs (42.50) and 1 when B runs (42.36). The 2014 and 2016 factory images were not checked for it.
 *     Only the 2014 plaintext chain and the 4.9.x Compact PRO report it as a bank (below): 0 is slot A,
 *     1 is slot B, 2 is recovery R.
 *
 * WHICH BANK A START RUNS, from the word (bootloader src/image.c, boot_select_image):
 *   0 or 0xFFFFFFFF: A if it passes the check, else B if it does, else R, which is not checked.
 *   1:               B if it passes, else A if it does, else R, which is not checked.
 *   any other word:  R if it passes, else A if it does, else B, which is not checked.
 * The check is image_sum_ok (bootloader src/crypto.c): the magic at +0x200, a length under 0x10000,
 * and the word sum over that length is 0. That is plainBankVerdict (running.ts), on the stored bytes.
 * ==================================================================== */

import { identifyFpsImage, FPS_MEASURED_HZ } from '../preservation/fps-patch.js';
import type { FirmwareProfile, SlotKey } from '../profiles/types.js';
import type { DeviceState, SlotState } from '../workflows/types.js';
import { classifyBuild } from './capability-family.js';
import { fpsPlanOfBank } from './fps-patch.js';
import { onPlaintextChain, plainBankVerdict } from './running.js';
import type { SlotsReport } from './types.js';

/** The banks, in the order the page and the CLI list them. */
const KEYS: readonly SlotKey[] = ['a', 'b', 'r'];

/**
 * The stock frame rate of the 2014 chain's Compact builds (1.3.0.0 and 1.3.0.8). A corpus build that
 * runs above it (FPS_KNOWN_RATE) holds a frame-rate patch as much as a patched table entry does.
 */
const STOCK_HZ = 8;

/** A bank as the page and the CLI name it, lower case: "slot A", "slot B", "recovery R". */
export function bankWordsOf(key: SlotKey): string {
  if (key === 'a') return 'slot A';
  if (key === 'b') return 'slot B';
  return 'recovery R';
}

/**
 * The bank the active-slot word names: 0 slot A, 1 slot B, 2 recovery R. Null for any other value, or
 * when unread. This is the mapping only; bootChoiceOf decides which lines it is reported on.
 */
export function reportedBootedOf(activeSlotWord: number | null): SlotKey | null {
  if (activeSlotWord === 0) return 'a';
  if (activeSlotWord === 1) return 'b';
  if (activeSlotWord === 2) return 'r';
  return null;
}

/** true: the bootloader's check passes. false: it refuses. null: the bank was not read, so no check is known. */
type Verdict = boolean | null;

export interface BootChoice {
  /** cfg[0] as read, or null when the word was not read. */
  readonly word: number | null;
  /** The bank the next start runs, or null when a bank the word needs was not read. */
  readonly runs: SlotKey | null;
  /**
   * The bank the camera reports it entered at its last start, from the active-slot word. Only on the
   * 2014 plaintext chain and the 4.9.x Compact PRO (reportsActiveSlotWord); null on 4.8.x, where the app
   * never writes the word (TESTING.md 42.43, 42.50), and on 2016, which is not checked. Null too when the
   * word is unread or names no bank.
   */
  readonly reportedBooted: SlotKey | null;
  /** One sentence: the word's rule and the bank it gives, or what could not be checked. */
  readonly why: string;
}

function wordText(word: number): string {
  return word === 0xffffffff ? '0xFFFFFFFF' : String(word);
}

function acceptsOf(slot: SlotState | undefined): Verdict {
  if (slot === undefined || slot.unread) return null;
  /* An erased bank holds no image header, so the bootloader refuses it: a clean read is a verdict. */
  if (slot.raw == null) return slot.blank === true ? false : null;
  const verdict = plainBankVerdict(slot.raw);
  return verdict === null ? null : verdict === 1;
}

interface Selection {
  readonly runs: SlotKey | null;
  readonly why: string;
}

function unchecked(key: SlotKey, head: string): Selection {
  return {
    runs: null,
    why: `${head}, but ${bankWordsOf(key)} was not read, so the bank that runs is not known`,
  };
}

/** boot_select_image(), over the word and each bank's verdict. Pure. */
function selectRunning(word: number, accepts: Readonly<Record<SlotKey, Verdict>>): Selection {
  const text = `the boot-config word is ${wordText(word)}`;
  if (word === 0 || word === 0xffffffff || word === 1) {
    const first: SlotKey = word === 1 ? 'b' : 'a';
    const second: SlotKey = word === 1 ? 'a' : 'b';
    const head = `${text}, so the bootloader tries ${bankWordsOf(first)} first`;
    const firstOk = accepts[first];
    if (firstOk === null) return unchecked(first, head);
    if (firstOk)
      return { runs: first, why: `${head}, and it holds an image the bootloader accepts` };
    const secondOk = accepts[second];
    if (secondOk === null) return unchecked(second, head);
    if (secondOk) {
      return {
        runs: second,
        why: `${head}; ${bankWordsOf(first)} holds no image the bootloader accepts, so it takes ${bankWordsOf(second)}`,
      };
    }
    return {
      runs: 'r',
      why: `${head}; neither slot A nor slot B holds an image the bootloader accepts, so it boots recovery R, which it does not check`,
    };
  }
  const head = `${text}, so the bootloader tries recovery R first`;
  const rOk = accepts.r;
  if (rOk === null) return unchecked('r', head);
  if (rOk) return { runs: 'r', why: `${head}, and it holds an image the bootloader accepts` };
  const aOk = accepts.a;
  if (aOk === null) return unchecked('a', head);
  if (aOk) {
    return {
      runs: 'a',
      why: `${head}; recovery R holds no image the bootloader accepts, so it takes slot A`,
    };
  }
  return {
    runs: 'b',
    why: `${head}; neither recovery R nor slot A holds an image the bootloader accepts, so it takes slot B, which it does not check`,
  };
}

/**
 * Whether the active-slot word is reported as the bank the camera booted: the 2014 plaintext chain, and
 * the 4.9.x Compact PRO, which writes the word (42.50). Not 4.8.x, where the factory app never writes it
 * (42.43, 42.50), and not 2016, which is not checked. The 4.x line is split by the minor number of the
 * parsed version, the same parse classifyBuild makes; the profile must be modern-4x, or the build is
 * refused and not reported.
 */
function reportsActiveSlotWord(profile: FirmwareProfile, version: string | null): boolean {
  if (onPlaintextChain(profile, version)) return true;
  const verdict = classifyBuild(profile, version);
  return verdict.family === 'modern' && verdict.version?.major === 4 && verdict.version.minor === 9;
}

/**
 * The bank the next start runs, from the boot-config word and the banks the analysis read. The word
 * alone is not enough: a bank the bootloader refuses is passed over, and recovery R runs when the
 * word asks for it or when A and B both fail, whatever R holds.
 */
export function bootChoiceOf(
  state: Pick<DeviceState, 'cfg0' | 'activeSlotWord' | 'byKey' | 'profile' | 'version'>,
): BootChoice {
  /* The word is reported as a bank where it is established as one: the 2014 line (where the page names
   * the booted bank from it, device-info.ts chainReplay) and the 4.9.x Compact PRO (42.50). Not on 4.8.x
   * (42.43, 42.50), and not on 2016, which is unchecked. */
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
  const accepts: Record<SlotKey, Verdict> = {
    a: acceptsOf(state.byKey.get('a')),
    b: acceptsOf(state.byKey.get('b')),
    r: acceptsOf(state.byKey.get('r')),
  };
  const selection = selectRunning(word, accepts);
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
 * it once the planned patch is written, or when nothing that holds a patch is idle. Only the 2014
 * plaintext chain has a boot word this reads; any other line gets null.
 *
 * The fix the warning names is the bank that runs: a patch there is what makes the camera run it.
 */
export function fpsBootWarningOf(
  report: SlotsReport,
  options: FpsBootOptions = {},
): FpsBootWarning | null {
  if (!report.state.plainChain) return null;
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
  if (word === 0 || word === 0xffffffff) return 'slot A first, then B, then recovery R';
  if (word === 1) return 'slot B first, then A, then recovery R';
  return 'recovery R first, then A, then B';
}
