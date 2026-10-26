/* ==================================================================== *
 * What a frame-rate patch in a bank that does not run leaves behind: the warning the page and the CLI
 * show when a patched bank (or the bank about to be patched) is not the one the next start runs. Pure:
 * it reads what the slots read already made, and the bank that runs is boot-choice.ts `bootChoiceOf`.
 *
 * Shown on the lines whose boot rule is decoded (`bootRuleKnown`): the 2014 plaintext chain, and the 2016
 * Compact PRO, where the warning was missing when a 1.0.3.0 camera's recovery R was patched to 18 Hz with
 * cfg[0] blank (the bootloader runs slot A first, so the camera stayed at 9 Hz; TESTING.md 42.84).
 * ==================================================================== */

import { identifyFpsImage, FPS_MEASURED_HZ } from '../preservation/fps-patch.js';
import type { SlotKey } from '../profiles/types.js';
import { bankWordsOf, bootChoiceOf, bootRuleKnown } from './boot-choice.js';
import { fpsPlanOfBank } from './fps-patch.js';
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
