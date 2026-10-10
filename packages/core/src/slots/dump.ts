/* OWNER: reader agent. See ./types.ts. */
import { hex, hexUp, sha256hex, viewOf } from '../bytes.js';
import { decryptImage } from '../crypto/cipher.js';
import { recoverKeyInfo } from '../crypto/recover.js';
import { errorMessage, CancelledError, SeekError } from '../errors.js';
import {
  HEADER_OFFSET,
  HEADER_SIZE,
  IMAGE_MAGIC,
  TRY_KEYS_MAX_LEN,
  parseImageHeader,
} from '../image/header.js';
import type { SeekDevice } from '../protocol/client.js';
import type { WindowEntry } from '../profiles/types.js';
import { readRunningFirmware } from '../workflows/capability.js';
import { blankSlotCapture, staleDescriptorCapture } from '../workflows/device-info.js';
import { DEFAULT_DUMP_OPTIONS, type WorkflowContext } from '../workflows/types.js';
import type { DumpedSlot, SlotKey, SlotsReport } from './types.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Read one bank's 64 KiB window, as stored, through the plan's read window.
 *
 * THE CONVENTIONS ARE THE WHOLE-FLASH DUMP'S, value for value: the default chunk,
 * `retries` extra attempts, each after a transport close, a `retryDelayMs` pause
 * and a reopen, because on a camera that has wedged its control endpoint that is
 * the only thing that clears it. A cancel is never retried. The one difference is
 * that a failed bank is an error here, not a gap-filled entry in a manifest.
 *
 * (`workflows/dump.ts` holds the same loop as `readWindowsInto`, which is not
 * exported. This is a mirror of it, kept to the same numbers, until that loop is
 * exported and this one can call it instead.)
 */
async function readBankWindow(
  device: SeekDevice,
  entry: WindowEntry,
  label: string,
  reporter: WorkflowContext['reporter'],
): Promise<{ data: Uint8Array; stopReason: string | null }> {
  const options = DEFAULT_DUMP_OPTIONS;
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= options.retries; attempt++) {
    try {
      const raw = await device.readWindow(entry, options.chunk);
      if (attempt > 0)
        reporter.log(`${label}: recovered on attempt ${String(attempt + 1)}`, 'warn');
      return { data: raw.data, stopReason: raw.stopReason };
    } catch (error) {
      if (error instanceof CancelledError) throw error;
      lastError = error;
      if (attempt < options.retries) {
        reporter.log(
          `${label}: attempt ${String(attempt + 1)} failed (${errorMessage(error)}); reopening ...`,
          'warn',
        );
        await device.transport.close();
        await sleep(options.retryDelayMs);
        await device.transport.open();
      }
    }
  }
  if (lastError instanceof SeekError) throw lastError;
  throw new SeekError('device/window', `${label} could not be read: ${errorMessage(lastError)}`, {
    cause: lastError,
  });
}

function refuse(message: string, detail?: Record<string, unknown>): SeekError {
  return new SeekError('slots/refused', message, detail === undefined ? {} : { detail });
}

/**
 * Read one bank (64 KiB, as stored) and decrypt it when its key is recoverable.
 *
 * READ-ONLY BY CONSTRUCTION. The only requests sent are the ones a whole-flash
 * dump sends: the build's version (`GetFirmwareInfo`), the arm of the plan's read
 * window (`BeginFirmwareUpgrade` with the plan's own payload) and its sequential
 * reads. Nothing in here can reach `SetFeaturedFirmwareData` or
 * `CompleteMemoryUpgrade`, and the test suite holds it to `READ_ONLY_OPS`.
 *
 * WHAT COMES BACK. `raw` is the bank exactly as the camera served it. `plain` is
 * the image decrypted under the key recovered from the bank's own ciphertext
 * (`recoverKeyInfo`, the same cryptanalytic solve the analysis uses), and is
 * returned only when the bank holds an image whose key recovers to a plausible
 * reset vector. A bank that is erased, holds no image, or whose key does not
 * recover says so in `notes` and returns no plain image. Nothing is guessed.
 */
export async function dumpSlot(
  ctx: WorkflowContext,
  report: SlotsReport,
  key: SlotKey,
): Promise<DumpedSlot> {
  if (!report.plan.supportedBuild.supported) {
    throw refuse(`refusing to dump a slot: ${report.plan.supportedBuild.reason}`);
  }
  const entry = report.plan.slots.find((slot) => slot.key === key);
  if (entry === undefined) {
    throw refuse(`refusing to dump slot ${key}: this build's plan has no such slot`);
  }
  /* Both refusals come BEFORE any transfer: an unsupported dump is a statement
   * about the build, and sending anything to find that out would be pointless. */
  if (!entry.dump.supported) {
    throw refuse(`refusing to dump ${entry.name}: ${entry.dump.reason}`, { key });
  }
  const read = entry.read;
  if (read === null) {
    throw refuse(`refusing to dump ${entry.name}: this build's plan has no read window for it`, {
      key,
    });
  }

  /* THE SAME BUILD, OR NOTHING. A report is a statement about one camera's
   * firmware; reading its bank on a camera now running another build would
   * mean reading with a table the bank was not planned under. One version read
   * (GetFirmwareInfo, read-only) is the cheapest check there is. */
  const now = await readRunningFirmware(ctx.device);
  if (now.version !== report.state.version) {
    throw refuse(
      `the camera now reports firmware ${now.version ?? 'none'}, but the report was taken on ` +
        `${report.state.version ?? 'none'}; inspect the camera again before dumping`,
      { key, firmwareVersion: now.version },
    );
  }

  const label = `${entry.name} ${hex(entry.address, 8)} (subcmd ${hex(read.subcmd)})`;
  const notes: string[] = [];
  const { data, stopReason } = await readBankWindow(ctx.device, read, label, ctx.reporter);

  /* A short read is KEPT, as the whole-flash dump keeps one: the bytes that came
   * off the camera are real, and the rest is named as filled, never passed off
   * as flash. A short bank is not decrypted, because its image may be cut. */
  const bankLength = entry.length;
  let raw: Uint8Array = data;
  if (data.length < bankLength) {
    raw = new Uint8Array(bankLength).fill(DEFAULT_DUMP_OPTIONS.gapFill);
    raw.set(data, 0);
    notes.push(
      `short read: ${String(data.length)} of ${String(bankLength)} B came back` +
        (stopReason === null ? '' : ` (${stopReason})`) +
        `; the other ${String(bankLength - data.length)} B are filled with ` +
        `${hex(DEFAULT_DUMP_OPTIONS.gapFill, 2)} and were NOT read from flash`,
    );
  }

  const stale = staleDescriptorCapture(raw);
  if (stale !== null) {
    throw new SeekError('device/window', `${entry.name}: ${stale}`, { detail: { key } });
  }

  let plain: Uint8Array | null = null;
  const head = raw.subarray(0, HEADER_OFFSET + HEADER_SIZE);
  if (blankSlotCapture(head)) {
    notes.push('erased: the header window is all 0xFF, so the bank holds no image');
  } else {
    const header = parseImageHeader(raw);
    if (header?.magic !== IMAGE_MAGIC) {
      notes.push(
        `no image header (magic ${hexUp(header?.magic ?? 0)}), so there is no image to decrypt`,
      );
    } else if (
      header.length < HEADER_OFFSET ||
      header.length >= TRY_KEYS_MAX_LEN ||
      header.length & 3
    ) {
      notes.push(`header.length ${hexUp(header.length)} is out of range; no image to decrypt`);
    } else if (data.length < bankLength) {
      notes.push('not decrypted: the read was short, so the image may be incomplete');
    } else {
      const cipher = report.state.profile.cipher;
      const view = viewOf(raw);
      const recovered = recoverKeyInfo(view, 0, header.length, cipher);
      if (!recovered.sane) {
        notes.push(
          'key not recovered: the image decrypts to a reset vector that is not a Cortex-M ' +
            `entry (confidence ${recovered.confidence})`,
        );
      } else {
        plain = decryptImage(view, 0, header.length, recovered.state, cipher);
        const keyName = report.state.byKey.get(key)?.keyName ?? null;
        notes.push(
          `decrypted ${String(plain.length)} B under the key recovered from this bank ` +
            `(confidence ${recovered.confidence}, acceptance sum ${hexUp(recovered.checksum)}` +
            (recovered.matchesProfile ? ', matches the profile' : ', does not match the profile') +
            (keyName === null ? '' : `; the analysis names it '${keyName}'`) +
            ')',
        );
      }
    }
  }

  /* The analysis read this bank earlier. Same bytes, or the bank moved under us:
   * the second is worth saying, not refusing, because the bytes here are what
   * the bank holds now. */
  const seen = report.state.byKey.get(key)?.raw ?? null;
  if (seen !== null) {
    let differ = 0;
    const span = Math.min(seen.length, raw.length);
    for (let i = 0; i < span; i++) if (seen[i] !== raw[i]) differ++;
    if (differ > 0) {
      notes.push(
        `the bank differs from the inspection's read in ${String(differ)} of ${String(span)} B`,
      );
    }
  }

  return {
    key,
    address: entry.address,
    raw,
    sha256: await sha256hex(raw),
    plain,
    plainSha256: plain === null ? null : await sha256hex(plain),
    notes,
  };
}
