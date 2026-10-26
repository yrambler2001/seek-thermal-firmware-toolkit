/* ==================================================================== *
 * The frame-rate patch on one BANK: plan it from the bank's own image, prepare the patched
 * image as the page would write it (pure), save the bank, write it through the ordinary writer
 * for that line, and check the read-back. The bytes are the table's (preservation/fps-patch.ts);
 * what makes the write safe is decided here.
 *
 * THE ORDER, AND WHAT EACH STEP MAY REFUSE (nothing is sent by a refusal):
 *   (1) the build is supported, the bank can take a decrypted image, and the bank is read again
 *       (dumpSlot: a read, the same build or nothing);
 *   (2) the image of THAT bank is planned (planFpsPatch): a table entry, enabled on this stage,
 *       the camera's build the same as the entry's;
 *   (3) the patched image is built and checked against the original: the changed bytes are the
 *       documented ones and nothing else, the acceptance sum is the same, and it hashes to the
 *       table (applyFpsPatch, verifyFpsPatchedImage);
 *   (4) the patched image is prepared as the writer prepares any decrypted image for this bank
 *       (prepareSlotFlash, pure). Its staging must be one this patch is written on (the plain 2014
 *       chain, the Key A line, or the 2016 keystream line), its payload and the image it predicts must
 *       be the patched image (the writer would not change the key pair or the sum), and the camera-wide
 *       refusal applies;
 *   (5) the bank is SAVED, raw and decrypted, before anything is written. `saveDump` must say it
 *       saved: a false or a throw refuses the write. There is no restore control; the saved
 *       decrypted file is the way back;
 *   (6) flashSlot writes it, with the same direct mode and the same acknowledgement rules as every
 *       other write, and reads it back;
 *   (7) the read-back is compared with the bank before the patch: on the plain chain the stored bytes
 *       (byte for byte); on the Key A line and the 2016 keystream line, which store the image under a
 *       key of the bank's own, the image the read-back DECRYPTS to. Either way the differing bytes must
 *       be the planned ones, neither more nor fewer.
 *
 * Steps (3) to (7) are `writeFpsPatch`. `patchBankFps` is steps (1), (2) and the offer; a caller that
 * has its own planned patch (the emulator suite, before a stage's offer is opened) calls `writeFpsPatch`.
 * ==================================================================== */

import { equalBytes, viewOf } from '../bytes.js';
import { errorMessage, SeekError } from '../errors.js';
import { decryptImage } from '../crypto/cipher.js';
import { recoverKeyInfo } from '../crypto/recover.js';
import type { CipherProfile } from '../profiles/types.js';
import {
  applyFpsPatch,
  FPS_MEASURED_HZ,
  planFpsPatch,
  verifyFpsPatchedImage,
  type FpsPatch,
  type FpsPlan,
} from '../preservation/fps-patch.js';
import type { WorkflowContext } from '../workflows/types.js';
import { dumpSlot } from './dump.js';
import { stagingPhrase } from './staging-words.js';
import { sha256Sync } from './write-sha.js';
import { flashSlot, prepareSlotFlash } from './write.js';
import type { DumpedSlot, FlashSlotResult, SlotFlashPlan, SlotKey, SlotsReport } from './types.js';

/** What is saved before a patch: the bank as stored, and its decrypted image. */
export interface FpsPreDump {
  readonly key: SlotKey;
  readonly bank: string;
  /** The version the bank's build reports, as the file name carries it. */
  readonly version: string;
  readonly address: number;
  readonly raw: Uint8Array;
  readonly rawSha256: string;
  readonly rawName: string;
  readonly plain: Uint8Array;
  readonly plainSha256: string;
  readonly plainName: string;
}

export interface FpsPatchOptions {
  /** Needed to write the bank the camera boots now, or recovery R (as for every write). */
  readonly acknowledgeRisk: boolean;
  /** Take the read-back and compare it. Default true. */
  readonly verify?: boolean;
  /**
   * Saves the pre-patch dump. Must resolve to true only once the files are on disk (or handed to the
   * browser's download). A false result or a throw refuses the write before anything is sent.
   */
  readonly saveDump: (dump: FpsPreDump) => Promise<boolean>;
}

export interface FpsReadBackCheck {
  /** False when no read-back was taken (verify off, or the read failed). */
  readonly checked: boolean;
  /** Offsets where the read-back differs from the pre-patch bank (stored bytes, or the decrypted image). */
  readonly differing: readonly number[];
  /** Planned offsets the read-back does not change (a missing site). */
  readonly missing: readonly number[];
  /** Differing offsets the patch does not plan (a stray change). */
  readonly unexpected: readonly number[];
  /** True when the differences are exactly the planned bytes; null when not checked. */
  readonly ok: boolean | null;
}

export interface FpsPatchResult {
  readonly key: SlotKey;
  readonly patch: FpsPatch;
  readonly fromHz: number;
  readonly toHz: number;
  readonly pre: FpsPreDump;
  /** The decrypted image as it was written (the table's patched image). */
  readonly patched: Uint8Array;
  /** The offsets the patch changes: the edit sites that change, and the adjust word when it moves. */
  readonly changed: readonly number[];
  readonly plan: SlotFlashPlan;
  readonly written: FlashSlotResult;
  readonly readBack: FpsReadBackCheck;
  readonly notes: readonly string[];
}

function refuse(message: string, detail?: Record<string, unknown>): SeekError {
  return new SeekError(
    'slots/refused',
    `${message} Nothing was written.`,
    detail === undefined ? {} : { detail },
  );
}

/** The version as a file name carries it. */
function safeLabel(version: string | null): string {
  return version === null || version === '' ? 'unknown' : version.replace(/[^0-9A-Za-z.]+/g, '-');
}

/**
 * The names the pre-patch dump is saved under: the bank, the build and a short hash, marked as
 * the dump taken before a frame-rate patch so it is not mistaken for a stock dump.
 */
export function fpsPreDumpNames(
  key: SlotKey,
  version: string | null,
  rawSha256: string,
  plainSha256: string,
): { readonly raw: string; readonly decrypted: string } {
  const stem = `seek-slot-${key.toUpperCase()}-v${safeLabel(version)}-before-fps-patch`;
  return {
    raw: `${stem}-raw-${rawSha256.slice(0, 8)}.bin`,
    decrypted: `${stem}-decrypted-${plainSha256.slice(0, 8)}.bin`,
  };
}

/** The name of the patched image the write is prepared under (no key pair in it: the writer finds the camera's). */
function patchedFileName(key: SlotKey, version: string | null, to: number): string {
  return `seek-slot-${key.toUpperCase()}-v${safeLabel(version)}-fps${String(to)}-patched.bin`;
}

/**
 * What can be done to one bank, from the bank's own decrypted image as the analysis read it: the
 * table entry for its rate, or why none. Reads nothing and sends nothing. The page uses it to show
 * the button and its reason; `patchBankFps` plans again from a fresh read before it writes.
 */
export function fpsPlanOfBank(report: SlotsReport, key: SlotKey): FpsPlan {
  if (!report.plan.supportedBuild.supported) {
    return { status: 'refused', reason: report.plan.supportedBuild.reason };
  }
  const view = report.slots.find((candidate) => candidate.entry.key === key);
  if (view === undefined)
    return { status: 'refused', reason: `this build's plan has no bank ${key.toUpperCase()}` };
  if (!view.entry.flashPlain.supported) {
    return {
      status: 'refused',
      reason: `bank ${key.toUpperCase()} cannot take a decrypted image on this build: ${view.entry.flashPlain.reason}`,
    };
  }
  const plain = view.state?.plain ?? null;
  if (view.content === 'empty' || plain === null) {
    return {
      status: 'refused',
      reason: `bank ${key.toUpperCase()} has no decrypted image to patch (${view.content === 'empty' ? 'it is empty' : 'it was not read or no key opens it'})`,
    };
  }
  return planFpsPatch(plain, report.state.version);
}

export type { FpsPatch, FpsPlan };

/**
 * The writer's plan for the patched image, decided before anything is saved or sent. The image goes
 * through prepareSlotFlash exactly as the page's "Flash decrypted image" would send it, and must come
 * out as this patch expects: staged plain (2014 chain), under Key A (the 4.x line), or under the 2016 stage
 * key (the Compact PRO 2016 line), predicting the patched image itself. An image the writer would change (a
 * key pair retargeted, a sum moved) is refused.
 */
function preparePatchedWrite(
  report: SlotsReport,
  key: SlotKey,
  name: string,
  patched: Uint8Array,
  patch: FpsPatch,
): SlotFlashPlan {
  const prepared = prepareSlotFlash(
    report,
    key,
    {
      kind: 'plain',
      bytes: patched,
      fileName: patchedFileName(key, report.state.version, patch.targetHz),
    },
    {},
  );
  if (prepared.storedForm !== undefined) {
    throw refuse(`${name}: the plan stores the image in a form this patch is not written on.`);
  }
  if (prepared.staging === 'plain') {
    if (!equalBytes(prepared.payload, patched)) {
      throw refuse(`${name}: the payload is not the patched image, so it was not sent.`);
    }
  } else if (
    prepared.staging !== 'key-a-ciphertext' &&
    prepared.staging !== 'slot-keystream-ciphertext'
  ) {
    throw refuse(
      `${name}: the plan's payload is ${stagingPhrase(prepared.staging)}; a frame-rate patch is written only ` +
        'on the plain 2014 chain, on the Key A line and on the 2016 keystream line.',
    );
  }
  const expectedPlain = prepared.expectedPlain ?? null;
  if (expectedPlain === null || !equalBytes(expectedPlain, patched)) {
    throw refuse(
      `${name}: the writer would store a different image from the patched one (its key pair or ` +
        'its acceptance sum would change), so the patch is not sent.',
    );
  }
  return prepared;
}

/**
 * Patch one bank: plan it, save it, write the patched image through the writer, read it back and check
 * the change. See the header for the order. Throws a SeekError (code `slots/refused`) with the reason before
 * anything is sent for every refusal; a failure after the commit is reported through the result, not thrown.
 */
export async function patchBankFps(
  ctx: WorkflowContext,
  report: SlotsReport,
  key: SlotKey,
  options: FpsPatchOptions,
): Promise<FpsPatchResult> {
  const name = key.toUpperCase();
  if (!report.plan.supportedBuild.supported) throw refuse(report.plan.supportedBuild.reason);
  const entry = report.plan.slots.find((candidate) => candidate.key === key);
  if (entry === undefined) throw refuse(`this build's plan has no bank ${name}.`);
  if (!entry.flashPlain.supported) {
    throw refuse(
      `${entry.name} cannot take a decrypted image on this build: ${entry.flashPlain.reason}.`,
    );
  }
  if (report.state.version === null) {
    throw refuse('the analysis does not say which firmware the camera runs.');
  }

  /* Refused from the analysis alone, before the camera is asked for anything: the row's own image. */
  const early = fpsPlanOfBank(report, key);
  if (early.status !== 'offer') throw refuse(`${entry.name}: ${early.reason}.`);

  /* (1) the same build or nothing: dumpSlot checks the camera still reports the report's build. */
  const dumped: DumpedSlot = await dumpSlot(ctx, report, key);
  if (dumped.plain === null) {
    throw refuse(
      `${entry.name} has no decrypted image to patch (${dumped.notes.join('; ') || 'no key opened it'}).`,
    );
  }

  /* (2) the image of THIS bank decides the entry, never the camera's version alone. The fresh read
   * must name the same entry the analysis did; if the bank moved, the write is refused. */
  const plan = planFpsPatch(dumped.plain, report.state.version);
  if (plan.status !== 'offer') throw refuse(`${entry.name}: ${plan.reason}.`);
  if (plan.patch.id !== early.patch.id) {
    throw refuse(
      `${entry.name} now holds a different image (${plan.patch.id}) from the one the analysis read ` +
        `(${early.patch.id}). Read the slots again.`,
    );
  }
  return writeFpsPatch(ctx, report, key, dumped, plan.patch, options);
}

/**
 * Write one planned patch to one bank: steps (3) to (7) of the header. `dumped` is the bank as it was read
 * just now (dumpSlot), and `patch` is the table entry the caller planned for it. This function does not decide
 * the offer: `patchBankFps` decides it through the stage gate (planFpsPatch) before it calls this. The patch
 * must be the stock image's own entry (applyFpsPatch refuses any other image before anything is saved), the
 * camera must report its build, and the save must happen before the write. Refusals send nothing.
 */
export async function writeFpsPatch(
  ctx: WorkflowContext,
  report: SlotsReport,
  key: SlotKey,
  dumped: DumpedSlot,
  patch: FpsPatch,
  options: FpsPatchOptions,
): Promise<FpsPatchResult> {
  const name = key.toUpperCase();
  const entry = report.plan.slots.find((candidate) => candidate.key === key);
  if (entry === undefined) throw refuse(`this build's plan has no bank ${name}.`);
  if (dumped.key !== key)
    throw refuse(`the bank read is bank ${dumped.key.toUpperCase()}, not ${name}.`);
  if (dumped.plain === null) throw refuse(`${entry.name} has no decrypted image to patch.`);
  if (report.state.version === null) {
    throw refuse('the analysis does not say which firmware the camera runs.');
  }
  if (patch.version.replace(/-FF$/, '') !== report.state.version) {
    throw refuse(
      `${entry.name}: the patch is for build ${patch.version}, but the camera reports ${report.state.version}.`,
    );
  }
  const notes: string[] = [];

  /* (3) the patched image and its pre-send check. */
  const patched = applyFpsPatch(dumped.plain, patch);
  const changed = verifyFpsPatchedImage(dumped.plain, patched, patch);

  /* (4) what the writer would send for it, before anything is saved: the pure check. */
  const prepared = preparePatchedWrite(report, key, entry.name, patched, patch);

  /* (5) the pre-patch save: the write waits for it, and a save that did not happen refuses. */
  const plainSha256 = sha256Sync(dumped.plain);
  const names = fpsPreDumpNames(key, report.state.version, dumped.sha256, plainSha256);
  const pre: FpsPreDump = {
    key,
    bank: entry.name,
    version: report.state.version,
    address: entry.address,
    raw: dumped.raw,
    rawSha256: dumped.sha256,
    rawName: names.raw,
    plain: dumped.plain,
    plainSha256,
    plainName: names.decrypted,
  };
  let saved = false;
  let saveError: string | null = null;
  try {
    /* Only the literal true counts: a save that answers anything else did not happen. */
    const answer: unknown = await options.saveDump(pre);
    saved = answer === true;
  } catch (error) {
    saveError = errorMessage(error);
  }
  if (!saved) {
    throw refuse(
      `The pre-patch dump of ${entry.name} was not saved${saveError === null ? '' : ` (${saveError})`}, ` +
        'so the patch was not written. Save the dump first (it is the only way back), then try again.',
    );
  }
  notes.push(`saved the pre-patch dump: ${names.raw} and ${names.decrypted}`);

  /* (6) the write, and its read-back. */
  const written = await flashSlot(ctx, report, prepared, {
    verify: options.verify !== false,
    acknowledgeRisk: options.acknowledgeRisk,
  });

  /* (7) the read-back against the bank before the patch. */
  const readBack =
    prepared.staging === 'plain'
      ? checkReadBack(dumped.raw, written.after, changed)
      : checkReadBackDecrypted(dumped.plain, written.after, changed, report.state.profile.cipher);
  return {
    key,
    patch,
    fromHz: patch.fromHz,
    toHz: FPS_MEASURED_HZ.get(patch.id) ?? patch.targetHz,
    pre,
    patched,
    changed,
    plan: prepared,
    written,
    readBack,
    notes: [...notes, ...written.notes],
  };
}

/** The read-back against the raw bank before the patch: the differences must be the planned ones. */
export function checkReadBack(
  before: Uint8Array,
  after: Uint8Array | null,
  planned: readonly number[],
): FpsReadBackCheck {
  if (after === null)
    return { checked: false, differing: [], missing: [], unexpected: [], ok: null };
  const span = Math.min(before.length, after.length);
  const differing: number[] = [];
  for (let o = 0; o < span; o++) if (before[o] !== after[o]) differing.push(o);
  return judgeDifferences(differing, planned, before.length === after.length);
}

/**
 * The read-back of a bank that stores its image under a key of its own (the Key A line, and the 2016 line,
 * whose device re-encrypts the staged image under block 1 of the image's pair): the image it DECRYPTS to,
 * recovered from the read-back itself (the same solve the writer's verification uses), is compared with
 * the decrypted image before the patch. The differences must be the planned ones.
 */
export function checkReadBackDecrypted(
  beforePlain: Uint8Array,
  after: Uint8Array | null,
  planned: readonly number[],
  cipher: CipherProfile,
): FpsReadBackCheck {
  if (after === null)
    return { checked: false, differing: [], missing: [], unexpected: [], ok: null };
  const length = beforePlain.length;
  if (after.length < length) {
    return judgeDifferences([], planned, false);
  }
  const view = viewOf(after);
  const recovered = recoverKeyInfo(view, 0, length, cipher);
  const decrypted = decryptImage(view, 0, length, recovered.state, cipher);
  const differing: number[] = [];
  for (let o = 0; o < length; o++) if (decrypted[o] !== beforePlain[o]) differing.push(o);
  return judgeDifferences(differing, planned, true);
}

/** The verdict on a list of differing offsets against the planned ones. */
function judgeDifferences(
  differing: readonly number[],
  planned: readonly number[],
  sameLength: boolean,
): FpsReadBackCheck {
  const plannedSet = new Set(planned);
  const differingSet = new Set(differing);
  const unexpected = differing.filter((o) => !plannedSet.has(o));
  const missing = planned.filter((o) => !differingSet.has(o));
  return {
    checked: true,
    differing: [...differing],
    missing,
    unexpected,
    ok: unexpected.length === 0 && missing.length === 0 && sameLength,
  };
}
