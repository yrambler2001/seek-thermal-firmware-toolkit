/* ==================================================================== *
 * The device side of a slot write: arm the bank's window, stage the payload
 * in 64-byte chunks, commit with the u16 sum, and read the bank back.
 *
 * This follows `commitToBank` in preservation/pipeline.ts step for step, and
 * does not call it, for three reasons it cannot serve here: it arms
 * `bankWindow(key)`, a fixed legacy-token window, where this page must arm the
 * plan's own `write` window for the build; it throws bare `Error`s, where the
 * slot page owes its callers SeekError codes and the `dropAnalysis` marker that
 * `flashInvalidatesAnalysis` reads; and it takes a BankKey, which excludes a
 * plan entry that names its bank by address.
 *
 * WHAT IS NEVER SENT HERE: ResetDevice (0x59), subcommand 0 (the upgrade-target
 * selector, which rewrites cfg[0]), and any window below the bank area. The
 * caller has already refused those; `writeWindowOf` in write.ts is the guard.
 * ==================================================================== */

import { errorMessage, CancelledError, SeekError } from '../errors.js';
import { hex, hexUp } from '../bytes.js';
import { classifyCommitStatus, commitStatusCause } from '../protocol/commit-status.js';
import { EP0_BUF, USB_COMMIT_TIMEOUT_MS } from '../protocol/ops.js';
import type { WindowEntry } from '../profiles/types.js';
import { isCancelled, warnIfRecipientFellBack, type WorkflowContext } from '../workflows/types.js';
import type { SlotEntry } from './types.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Report progress this often while staging (a power of two, in bytes). */
const PROGRESS_MASK = 0x7ff;

/* What a commit status proves is decoded in protocol/commit-status.ts, which the preservation pipeline's
 * commit (`commitToBank`) decodes with too, so the two writers say the same about one status. */

/**
 * The error for a commit whose status is not 0. Every one carries
 * `dropAnalysis`, whatever its class: the commit transfer is where the camera
 * could have touched the bank, so the caller re-reads before it does anything
 * else. Only the words differ. `refused before programming; the bank is
 * unchanged` is said for the first class and for nothing else, and `may be
 * partially written` for the classes that cannot say so.
 */
export function commitRefusal(name: string, status: number | null): SeekError {
  const outcome = classifyCommitStatus(status);
  const reread = 'Re-read the device info before doing anything else';
  if (status === null) {
    return new SeekError(
      'flash/commit',
      `the commit status could not be read after CompleteMemoryUpgrade, so ${name} may be ` +
        `partially written. ${reread}, and keep your dump.`,
      { detail: { dropAnalysis: true, safeToRetry: false, commitOutcome: outcome } },
    );
  }
  const shown = hexUp(status);
  if (outcome === 'refused-before-programming') {
    return new SeekError(
      'flash/commit',
      `CompleteMemoryUpgrade returned ${shown} (${commitStatusCause(status)}) for ${name}: refused before ` +
        `programming; the bank is unchanged. ${reread}.`,
      {
        deviceCode: status,
        detail: { dropAnalysis: true, safeToRetry: true, commitOutcome: outcome },
      },
    );
  }
  if (outcome === 'erase-stage') {
    return new SeekError(
      'flash/commit',
      `CompleteMemoryUpgrade returned ${shown} (${commitStatusCause(status)}) for ${name}: nothing was ` +
        'programmed, but the erase may have started, so the bank may be partly erased. ' +
        `${reread}, and keep your dump.`,
      {
        deviceCode: status,
        detail: { dropAnalysis: true, safeToRetry: false, commitOutcome: outcome },
      },
    );
  }
  return new SeekError(
    'flash/commit',
    `CompleteMemoryUpgrade returned ${shown} (${commitStatusCause(status)}) — ${name} may be partially ` +
      `written. ${reread}, and keep your dump.`,
    {
      deviceCode: status,
      detail: { dropAnalysis: true, safeToRetry: false, commitOutcome: outcome },
    },
  );
}

/**
 * Whether a commit error says the camera's analysis is stale: every error a slot
 * commit raises after the commit transfer carries `dropAnalysis` (`commitRefusal`),
 * and a caller seeing it must discard its `DeviceState` and re-read before it does
 * anything else. The analysis is the caller's, not a global, so the contract rides
 * on the error itself.
 */
export function flashInvalidatesAnalysis(error: unknown): boolean {
  return error instanceof SeekError && error.detail?.dropAnalysis === true;
}

/**
 * Arm `write`, stream `payload` in EP0-sized chunks, polling the status word
 * after every chunk (both staging failures the camera reports are sticky), then
 * commit with `sum16`. Returns the commit's status, which is 0 or the call
 * throws.
 *
 * Failure before the commit transfer: nothing was erased, and the error says
 * so. Failure at or after it: the commit ran, and the error carries
 * `dropAnalysis` and says what the status proves (`commitRefusal`).
 */
export async function stageAndCommit(
  ctx: WorkflowContext,
  entry: SlotEntry,
  write: WindowEntry,
  payload: Uint8Array,
  sum16: number,
  onCommit?: () => void,
): Promise<number> {
  const { device, reporter } = ctx;
  if (!device.transport.isOpen) await device.transport.open(); /* a dump closes it */
  warnIfRecipientFellBack(ctx);

  reporter.log(
    `${entry.name}: arming ${write.note} (subcmd ${hex(write.subcmd)} at ${hexUp(write.address, 8)})`,
    'detail',
  );
  await device.armWindow(write);
  reporter.log(`${entry.name}: window armed, staging ${String(payload.length)} B`, 'ok');

  const startedAt = Date.now();
  const abort = (deviceCode: number, offset: number): never => {
    throw new SeekError(
      'slots/refused',
      `the camera reported ${hex(deviceCode)} while staging ${entry.name} at offset ` +
        `${hex(offset)} — aborted before CompleteMemoryUpgrade, so nothing was written to flash`,
      { deviceCode, detail: { offset } },
    );
  };

  for (let offset = 0; offset < payload.length; offset += EP0_BUF) {
    if (isCancelled(ctx)) {
      throw new CancelledError('cancelled before commit — nothing was written to flash');
    }
    const end = Math.min(offset + EP0_BUF, payload.length);
    await device.setFeaturedFirmwareData(payload.subarray(offset, end));
    const code = await device.getErrorCode();
    if (code) abort(code, end);
    if ((offset & PROGRESS_MASK) === 0 || end === payload.length) {
      reporter.progress(
        end,
        payload.length,
        `${entry.name}: staged ${String(end)}/${String(payload.length)} B`,
      );
    }
  }
  const streamError = await device.getErrorCode();
  if (streamError) abort(streamError, payload.length);
  reporter.log(
    `${entry.name}: streamed ${String(payload.length)} B in ` +
      `${((Date.now() - startedAt) / 1000).toFixed(1)} s`,
    'ok',
  );

  reporter.log(`${entry.name}: committing, CompleteMemoryUpgrade(${hexUp(sum16, 4)})`, 'warn');
  /* From here on the bank may change: the caller is told before the commit goes out. */
  onCommit?.();
  try {
    await device.completeMemoryUpgrade(sum16, USB_COMMIT_TIMEOUT_MS);
  } catch (error) {
    /* A transfer that times out says nothing about whether flash was touched:
     * the status read below decides, as it does in commitToBank. */
    if (error instanceof CancelledError) throw error;
    reporter.log(
      `${entry.name}: the commit transfer did not complete (${errorMessage(error)}) — reading the status`,
      'warn',
    );
  }
  await sleep(200); /* erase + program + verify runs inside the commit */

  let status: number | null;
  try {
    status = await device.getErrorCode();
  } catch (error) {
    if (error instanceof CancelledError) throw error;
    status = null;
  }
  /* Not a success: what the status proves is decided by `commitRefusal`. */
  if (status !== 0) throw commitRefusal(entry.name, status);
  reporter.log(`${entry.name}: committed, commit status 0`, 'ok');
  return status;
}

/**
 * Read the whole bank back through the plan's read window. Null when the build
 * names no read window for this bank, which is said in the notes, not guessed.
 */
export async function readBackBank(
  ctx: WorkflowContext,
  read: WindowEntry | null,
): Promise<Uint8Array | null> {
  if (read === null) return null;
  const got = await ctx.device.readWindow(read);
  return got.data;
}
