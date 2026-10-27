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
 *   (5) the bank is SAVED, as stored and decrypted, in the backup zip every write saves first
 *       (backup.ts), before anything is written. `saveBackup` must say it saved: a false or a throw
 *       refuses the write. The zip's decrypted file is the way back ("Flash decrypted image");
 *   (6) flashSlot writes it, with the same direct mode and the same acknowledgement rules as every
 *       other write (checked before the save), and reads it back;
 *   (7) the read-back is compared with the bank before the patch: on the plain chain the stored bytes
 *       (byte for byte); on the Key A line and the 2016 keystream line, which store the image under a
 *       key of the bank's own, the image the read-back DECRYPTS to. Either way the differing bytes must
 *       be the planned ones, neither more nor fewer.
 *
 * Steps (3) to (7) are `writeFpsPatch`. `patchBankFps` is steps (1), (2) and the offer; a caller that
 * has its own planned patch (the emulator suite, before a stage's offer is opened) calls `writeFpsPatch`.
 *
 * EVERY BANK AT ONCE (`patchEveryBankFps`, owner 2026-10-26: a warm reset can make the camera start another
 * bank than the one patched). Steps (1) to (4) run for every bank that offers the patch before anything is
 * saved, so a bank that would be refused refuses the whole action with nothing sent. Then ONE zip holds every
 * one of those banks (a browser asks before it lets a page start a second download on its own, so one zip
 * per bank could leave a write without its saved backup), and the banks are written and read back in turn:
 * the banks the camera neither boots nor falls back to first, then recovery R, then the booted bank last, so
 * a failure stops before the bank the camera runs. The first failure stops the rest.
 * ==================================================================== */

import { equalBytes, viewOf } from '../bytes.js';
import { bankWordsOf } from '../profiles/locked-boot.js';
import { CancelledError, errorMessage, SeekError } from '../errors.js';
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
import {
  buildWriteBackup,
  saveBackupFirst,
  backupLogLines,
  type BankRead,
  type SaveBackup,
  type WriteBackup,
} from './backup.js';
import { dumpSlot } from './dump.js';
import { stagingPhrase } from './staging-words.js';
import { checkSlotFlash, flashSlot, prepareSlotFlash, withBackupKept } from './write.js';
import type {
  DumpedSlot,
  FlashSlotResult,
  SlotEntry,
  SlotFlashPlan,
  SlotKey,
  SlotsReport,
} from './types.js';

export interface FpsPatchOptions {
  /** Needed to write the bank the camera boots now, or recovery R (as for every write). */
  readonly acknowledgeRisk: boolean;
  /** Take the read-back and compare it. Default true. */
  readonly verify?: boolean;
  /**
   * Saves the backup zip of the bank (`WriteBackup`, backup.ts). Must resolve to true only once the zip is
   * written (or handed to the browser's download). A false result or a throw refuses the write before
   * anything is sent.
   */
  readonly saveBackup: SaveBackup;
  /** Called just before each bank's commit is sent (`FlashSlotOptions.onCommit`). */
  readonly onCommit?: (key: SlotKey) => void;
  /** The clock the backup is stamped with. Default: now. */
  readonly now?: () => Date;
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
  /** The zip saved before the write: the bank as stored and its decrypted image. */
  readonly backup: WriteBackup;
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
    return { status: 'refused', reason: `this build's plan has no ${bankWordsOf(key)}` };
  if (!view.entry.flashPlain.supported) {
    return {
      status: 'refused',
      reason: `${bankWordsOf(key)} cannot take a decrypted image on this build: ${view.entry.flashPlain.reason}`,
    };
  }
  const plain = view.state?.plain ?? null;
  if (view.content === 'empty' || plain === null) {
    return {
      status: 'refused',
      reason: `${bankWordsOf(key)} has no decrypted image to patch (${view.content === 'empty' ? 'it is empty' : 'it was not read or no key opens it'})`,
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
  const prepared = prepareSlotFlash(report, key, {
    kind: 'plain',
    bytes: patched,
    fileName: patchedFileName(key, report.state.version, patch.targetHz),
  });
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
 * Steps (1) and (2): the offer from the analysis alone, then the bank read again and its patch planned from
 * that fresh read, which must name the same table entry. Refusals send nothing.
 */
async function readAndPlan(
  ctx: WorkflowContext,
  report: SlotsReport,
  key: SlotKey,
): Promise<{ readonly dumped: DumpedSlot; readonly patch: FpsPatch }> {
  const name = bankWordsOf(key);
  if (!report.plan.supportedBuild.supported) throw refuse(report.plan.supportedBuild.reason);
  const entry = report.plan.slots.find((candidate) => candidate.key === key);
  if (entry === undefined) throw refuse(`this build's plan has no ${name}.`);
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
  return { dumped, patch: plan.patch };
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
  const { dumped, patch } = await readAndPlan(ctx, report, key);
  return writeFpsPatch(ctx, report, key, dumped, patch, options);
}

/** One bank's patch, prepared and checked, nothing saved or sent: steps (3) and (4). */
interface PreparedPatch {
  readonly key: SlotKey;
  readonly entry: SlotEntry;
  readonly dumped: DumpedSlot & { readonly plain: Uint8Array };
  readonly patch: FpsPatch;
  readonly patched: Uint8Array;
  readonly changed: readonly number[];
  readonly plan: SlotFlashPlan;
}

/** The patch in words, for the backup's text file. */
function patchFollows(
  report: SlotsReport,
  prepared: readonly PreparedPatch[],
  every: boolean,
): string {
  const banks = prepared.map((one) => one.entry.name).join(', then ');
  const rates = [
    ...new Set(
      prepared.map(
        (one) =>
          `${String(one.patch.fromHz)} Hz to ${String(FPS_MEASURED_HZ.get(one.patch.id) ?? one.patch.targetHz)} Hz`,
      ),
    ),
  ].join(' or ');
  const firmware = report.state.version ?? '(unknown)';
  return every
    ? `the frame-rate patch of every bank that offers it: ${banks} (${rates}, firmware ${firmware})`
    : `the frame-rate patch of ${banks}, ${rates} (firmware ${firmware})`;
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
  const prepared = preparePatch(report, key, dumped, patch, options);
  /* (5) the save: the write waits for it, and a save that did not happen refuses. The zip is built from the
   * read the patch was planned from: one read, the bank as it is now. */
  const reads: BankRead[] = [{ key, dumped, unreadWhy: null }];
  const backup = buildWriteBackup({
    report,
    reads,
    action: { kind: 'fps-patch' },
    follows: patchFollows(report, [prepared], false),
    at: (options.now ?? (() => new Date()))(),
  });
  await saveBackupFirst(backup, options.saveBackup);
  for (const line of backupLogLines(backup)) ctx.reporter.log(line, 'ok');
  return sendPatch(ctx, report, prepared, backup, options);
}

/**
 * Steps (3) and (4), and every check the write makes before it sends a byte (`checkSlotFlash`: the
 * acknowledgement, the camera-wide refusal): pure. Throws the refusal; nothing has been saved or sent.
 */
function preparePatch(
  report: SlotsReport,
  key: SlotKey,
  dumped: DumpedSlot,
  patch: FpsPatch,
  options: Pick<FpsPatchOptions, 'acknowledgeRisk'>,
): PreparedPatch {
  const name = bankWordsOf(key);
  const entry = report.plan.slots.find((candidate) => candidate.key === key);
  if (entry === undefined) throw refuse(`this build's plan has no ${name}.`);
  if (dumped.key !== key) throw refuse(`the bank read is ${bankWordsOf(dumped.key)}, not ${name}.`);
  const plain = dumped.plain;
  if (plain === null) throw refuse(`${entry.name} has no decrypted image to patch.`);
  if (report.state.version === null) {
    throw refuse('the analysis does not say which firmware the camera runs.');
  }
  if (patch.version.replace(/-FF$/, '') !== report.state.version) {
    throw refuse(
      `${entry.name}: the patch is for build ${patch.version}, but the camera reports ${report.state.version}.`,
    );
  }
  /* (3) the patched image and its pre-send check. */
  const patched = applyFpsPatch(plain, patch);
  const changed = verifyFpsPatchedImage(plain, patched, patch);
  /* (4) what the writer would send for it, before anything is saved: the pure check. */
  const plan = preparePatchedWrite(report, key, entry.name, patched, patch);
  checkSlotFlash(report, plan, options);
  return { key, entry, dumped: { ...dumped, plain }, patch, patched, changed, plan };
}

/** Steps (6) and (7): the write of one prepared patch, its read-back, and the check of the change. */
async function sendPatch(
  ctx: WorkflowContext,
  report: SlotsReport,
  prepared: PreparedPatch,
  backup: WriteBackup,
  options: FpsPatchOptions,
): Promise<FpsPatchResult> {
  const { key, dumped, patch, patched, changed, plan } = prepared;
  /* The bank was saved first, so a commit error says the backup is kept (`withBackupKept`). */
  const written = await flashSlot(ctx, report, plan, {
    verify: options.verify !== false,
    acknowledgeRisk: options.acknowledgeRisk,
    ...(options.onCommit === undefined ? {} : { onCommit: options.onCommit }),
  }).catch((error: unknown) => {
    throw withBackupKept(error);
  });
  /* (7) the read-back against the bank before the patch. */
  const readBack =
    plan.staging === 'plain'
      ? checkReadBack(dumped.raw, written.after, changed)
      : checkReadBackDecrypted(dumped.plain, written.after, changed, report.state.profile.cipher);
  return {
    key,
    patch,
    fromHz: patch.fromHz,
    toHz: FPS_MEASURED_HZ.get(patch.id) ?? patch.targetHz,
    backup,
    patched,
    changed,
    plan,
    written,
    readBack,
    notes: [...written.notes],
  };
}

/* ==================================================================== *
 * Every bank at once
 * ==================================================================== */

/** One bank's frame-rate verdict, for the every-bank plan. */
export interface FpsBankVerdict {
  readonly key: SlotKey;
  readonly name: string;
  readonly plan: FpsPlan;
}

/** What "Make N FPS in every bank" would do, from the analysis alone. Pure. */
export interface FpsEveryBankPlan {
  /** The banks that offer the patch, in the order they would be written. */
  readonly order: readonly SlotKey[];
  /** Every bank that offers it, with its offer, in that order. */
  readonly offers: readonly (FpsBankVerdict & {
    readonly plan: Extract<FpsPlan, { status: 'offer' }>;
  })[];
  /** The banks that do not offer it, with their plan (patched, at the rate, or refused with the reason). */
  readonly others: readonly FpsBankVerdict[];
}

/**
 * The order the every-bank patch writes in: the banks the camera neither boots nor falls back to first (A
 * before B), then recovery R, then the bank the camera boots now, so a failure stops before the bank that
 * runs. A camera that names no booted bank is written A, B, then R.
 */
export function everyBankWriteOrder(report: SlotsReport, keys: readonly SlotKey[]): SlotKey[] {
  const booted = bootedBankOf(report);
  const rank = (key: SlotKey): number => {
    if (key === booted) return 3;
    if (key === 'r') return 2;
    return key === 'a' ? 0 : 1;
  };
  return [...keys].sort((a, b) => rank(a) - rank(b));
}

/** The bank shown as booted now (the view's own flag, which the read sets from the boot record). */
function bootedBankOf(report: SlotsReport): SlotKey | null {
  return report.slots.find((view) => view.active)?.entry.key ?? report.state.boot?.booted ?? null;
}

/**
 * Whether the every-bank order ends with the bank the camera boots now after at least one other bank: only
 * then does a plan say the booted bank goes last (TESTING.md 42.96: a plan of R alone said it).
 */
export function everyBankBootedLast(report: SlotsReport, order: readonly SlotKey[]): boolean {
  return order.length > 1 && order.at(-1) === bootedBankOf(report);
}

/**
 * The every-bank plan: which banks offer the patch and in what order they would be written. Pure. `planOf` is
 * each bank's own plan (`fpsPlanOfBank`; a front end's test may give its own).
 */
export function fpsEveryBankPlan(
  report: SlotsReport,
  planOf: (report: SlotsReport, key: SlotKey) => FpsPlan = fpsPlanOfBank,
): FpsEveryBankPlan {
  const verdicts: FpsBankVerdict[] = report.slots.map((view) => ({
    key: view.entry.key,
    name: view.entry.name,
    plan: planOf(report, view.entry.key),
  }));
  const offering = verdicts.filter(
    (verdict): verdict is FpsBankVerdict & { plan: Extract<FpsPlan, { status: 'offer' }> } =>
      verdict.plan.status === 'offer',
  );
  const order = everyBankWriteOrder(
    report,
    offering.map((verdict) => verdict.key),
  );
  return {
    order,
    offers: order.flatMap((key) => offering.filter((verdict) => verdict.key === key)),
    others: verdicts.filter((verdict) => verdict.plan.status !== 'offer'),
  };
}

/** What the every-bank patch did. */
export interface FpsEveryBankResult {
  /** The one zip saved before the first write: every bank it was about to patch. */
  readonly backup: WriteBackup;
  /** The banks it set out to patch, in the order it writes them. */
  readonly order: readonly SlotKey[];
  /** Each bank written, in order, with its read-back check. */
  readonly results: readonly FpsPatchResult[];
  /**
   * The bank where it stopped and why: a write that failed (that bank may be partly written), or a
   * read-back that does not differ only as planned (that bank was written). Null when every bank was written.
   */
  readonly stopped: { readonly key: SlotKey; readonly reason: string } | null;
  /** The banks after the stop, not written. */
  readonly unwritten: readonly SlotKey[];
}

/**
 * Patches every bank that offers the frame-rate patch, in one confirmation: each bank read again and planned
 * (steps 1 to 4) before anything is saved, one zip of all of them saved, then each written and read back in
 * turn (`everyBankWriteOrder`). The first failure stops the rest; a cancel is thrown. The acknowledgement
 * covers every bank that needs one (the booted bank, recovery R). Throws a refusal, with nothing saved or
 * sent, when no bank offers the patch or any bank would be refused.
 */
export async function patchEveryBankFps(
  ctx: WorkflowContext,
  report: SlotsReport,
  options: FpsPatchOptions,
): Promise<FpsEveryBankResult> {
  const plan = fpsEveryBankPlan(report);
  if (plan.order.length === 0) {
    const why = plan.others
      .map((other) => `${other.name}: ${'reason' in other.plan ? other.plan.reason : 'no offer'}`)
      .join('; ');
    throw refuse(`no bank offers the frame-rate patch (${why}).`);
  }
  const prepared: PreparedPatch[] = [];
  for (const key of plan.order) {
    const { dumped, patch } = await readAndPlan(ctx, report, key);
    prepared.push(preparePatch(report, key, dumped, patch, options));
  }
  /* The zip lists the banks A, B, R; the text says the order they are written in. */
  const reads: BankRead[] = [...prepared]
    .sort((a, b) => 'abr'.indexOf(a.key) - 'abr'.indexOf(b.key))
    .map((one) => ({ key: one.key, dumped: one.dumped, unreadWhy: null }));
  const backup = buildWriteBackup({
    report,
    reads,
    action: { kind: 'fps-patch-every-bank' },
    follows: patchFollows(report, prepared, true),
    at: (options.now ?? (() => new Date()))(),
  });
  await saveBackupFirst(backup, options.saveBackup);
  for (const line of backupLogLines(backup)) ctx.reporter.log(line, 'ok');

  const results: FpsPatchResult[] = [];
  let stopped: FpsEveryBankResult['stopped'] = null;
  for (const one of prepared) {
    try {
      const done = await sendPatch(ctx, report, one, backup, options);
      results.push(done);
      if (done.readBack.ok === false || done.written.verified === false) {
        stopped = {
          key: one.key,
          reason:
            `${one.entry.name} was written, but its read-back does not differ from the saved bank only ` +
            'as planned, so the banks after it were not written',
        };
        break;
      }
    } catch (error) {
      if (error instanceof CancelledError) throw error;
      stopped = { key: one.key, reason: `${one.entry.name}: ${errorMessage(error)}` };
      break;
    }
  }
  const reached = new Set<SlotKey>([
    ...results.map((done) => done.key),
    ...(stopped === null ? [] : [stopped.key]),
  ]);
  return {
    backup,
    order: plan.order,
    results,
    stopped,
    unwritten: plan.order.filter((key) => !reached.has(key)),
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
