/* ==================================================================== *
 * The frame read: one ImageData credit per frame, and up to `inFlight` bulk INs kept pending on
 * the frame endpoint, so the host has a transfer waiting when the camera primes the next one
 * (TESTING.md 42.74, 42.75).
 *
 * The rules, from TESTING.md 42.74:
 *   - One credit per frame. It goes out after the previous frame's last byte has been read. A
 *     credit while the camera still has data queued cancels that data (rpc_cmds.c cmd_ImageData),
 *     so a frame is never asked for while the last one is partly read.
 *   - Any number of bulk INs may be pending. The camera answers them in the order they were
 *     posted, one of its own transfers each (1,664 bytes for the header, 16,224 for each payload
 *     part), so the reader takes them oldest first and assembles the frame in that order.
 *   - An IN asks for the bytes the frame still needs (`count - got`, as the checker has always
 *     asked). The camera's transfers are never larger than the bytes left in the frame when they
 *     are posted (42.74 section 1.5), so the request is never too small for the transfer it takes.
 *     A transfer that does not fit anyway is reported as an error, not split silently.
 *
 * Nothing is thrown for a bad read. A timeout, a stall, a transfer error or too many bytes come
 * back as `{ ok: false, reason }`, and the caller counts and reports them; the INs pending with a
 * failed frame are cancelled, so the next frame starts clean. A zero-length packet is a transfer
 * with no bytes: the frame goes on.
 * ==================================================================== */

import type { SeekLink } from './link.js';

/** The frame transfer's deadline for one bulk IN (Swift readExact's default). */
export const FRAME_TIMEOUT_MS = 3000;

/** The bulk INs a frame read keeps in flight: the range the command line takes, and its default. */
export const IN_FLIGHT_MIN = 1;
export const IN_FLIGHT_MAX = 4;
export const DEFAULT_IN_FLIGHT = 3;

export interface FrameReadOptions {
  /** Bulk INs kept pending on the endpoint while a frame is read. 1 is one at a time, as before. */
  readonly inFlight: number;
  /** The deadline of each bulk IN. */
  readonly timeoutMs: number;
}

/** The outcome of one bulk IN or one frame: the bytes, or why they did not come. */
export type ReadResult =
  | { readonly ok: true; readonly bytes: Uint8Array }
  | { readonly ok: false; readonly reason: string };

export class FrameReader {
  /** The bulk INs posted and not yet taken, oldest first. */
  private pending: Promise<ReadResult>[] = [];
  /** Zero-length packets taken: transfers with no bytes, after which the frame went on. */
  zeroLengthPackets = 0;
  private readonly link: SeekLink;
  private readonly endpoint: number;
  private readonly options: FrameReadOptions;

  constructor(link: SeekLink, endpoint: number, options: FrameReadOptions) {
    this.link = link;
    this.endpoint = endpoint;
    this.options = options;
  }

  /** The bulk INs pending now. */
  get pendingCount(): number {
    return this.pending.length;
  }

  /**
   * Reads one frame of `count` bytes. `credit` sends the ImageData request for it, once, before the
   * frame's bytes are asked for. Returns the frame, or the reason it could not be read.
   */
  async read(count: number, credit: () => Promise<void>): Promise<ReadResult> {
    try {
      await credit();
    } catch (error) {
      this.cancel();
      return { ok: false, reason: messageOf(error) };
    }
    const out = new Uint8Array(count);
    let got = 0;
    this.topUp(count, got);
    while (got < count) {
      const next = this.pending.shift();
      if (next === undefined) return this.failed('no bulk IN is pending');
      const result = await next;
      if (!result.ok) return this.failed(result.reason);
      const chunk = result.bytes;
      if (chunk.length > count - got) {
        return this.failed(
          `the camera sent ${String(chunk.length)} bytes with ${String(count - got)} left in the frame`,
        );
      }
      if (chunk.length === 0) this.zeroLengthPackets += 1;
      out.set(chunk, got);
      got += chunk.length;
      if (got < count) this.topUp(count, got);
    }
    return { ok: true, bytes: out };
  }

  /**
   * Ends every pending IN, at the stop and at the shutdown. The device cancels them where its stack
   * can (`cancelBulkIn`). Where it cannot, the INs run to their own deadline, and their results are
   * dropped here. With one IN in flight nothing is left pending after a read, so this is a no-op on
   * the bench's node-usb stack (TESTING.md 42.75).
   */
  cancel(): void {
    this.pending = [];
    this.link.cancelBulkIn(this.endpoint);
  }

  /**
   * A failed frame ends with its INs. The INs still pending would otherwise take the camera's leftover transfers
   * of this frame, and the next credit cancels only what is still queued, so the next frame could start mid-way.
   */
  private failed(reason: string): ReadResult {
    this.cancel();
    return { ok: false, reason };
  }

  /** Posts INs until `inFlight` are pending. Each asks for the bytes the frame still needs. */
  private topUp(count: number, got: number): void {
    while (this.pending.length < this.options.inFlight) {
      this.pending.push(this.post(count - got));
    }
  }

  /** One bulk IN. Its failure is a result, never a rejection, so a dropped IN cannot go unhandled. */
  private post(request: number): Promise<ReadResult> {
    const { timeoutMs } = this.options;
    return this.link.bulkIn(this.endpoint, request, timeoutMs).then(
      (bytes): ReadResult =>
        bytes === null
          ? { ok: false, reason: `no data for ${String(timeoutMs)} ms (timed out)` }
          : { ok: true, bytes },
      (error: unknown): ReadResult => ({ ok: false, reason: messageOf(error) }),
    );
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
