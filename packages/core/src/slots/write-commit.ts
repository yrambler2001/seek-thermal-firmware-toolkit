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
import { EP0_BUF, ERR_BAD_CHECKSUM, USB_COMMIT_TIMEOUT_MS } from '../protocol/ops.js';
import type { WindowEntry } from '../profiles/types.js';
import { isCancelled, warnIfRecipientFellBack, type WorkflowContext } from '../workflows/types.js';
import type { SlotEntry } from './types.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Report progress this often while staging (a power of two, in bytes). */
const PROGRESS_MASK = 0x7ff;

/**
 * Arm `write`, stream `payload` in EP0-sized chunks, polling the status word
 * after every chunk (both staging failures the camera reports are sticky), then
 * commit with `sum16`. Returns the commit's status, which is 0 or the call
 * throws.
 *
 * Failure before the commit transfer: nothing was erased, and the error says
 * so. Failure at or after it: the erase/program/verify chain ran inside the
 * transfer, so the error carries `dropAnalysis`, and the caller must re-read
 * the camera before it does anything else.
 */
export async function stageAndCommit(
  ctx: WorkflowContext,
  entry: SlotEntry,
  write: WindowEntry,
  payload: Uint8Array,
  sum16: number,
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
  if (status === ERR_BAD_CHECKSUM) {
    /* Checked before anything is erased: the bank is untouched. */
    throw new SeekError(
      'flash/commit',
      `the camera rejected the transfer checksum (${hex(ERR_BAD_CHECKSUM)}) — nothing was committed`,
      { deviceCode: status, detail: { safeToRetry: true } },
    );
  }
  if (status !== 0) {
    const shown = status === null ? 'no status' : hexUp(status);
    throw new SeekError(
      'flash/commit',
      `CompleteMemoryUpgrade returned ${shown} — ${entry.name} may be partially written. ` +
        'Re-read the device info before doing anything else, and keep your dump.',
      {
        ...(status === null ? {} : { deviceCode: status }),
        detail: { dropAnalysis: true, safeToRetry: false },
      },
    );
  }
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
