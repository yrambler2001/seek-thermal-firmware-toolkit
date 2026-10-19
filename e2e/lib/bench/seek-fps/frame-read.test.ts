/* The frame read on a fake camera: frames in order with one and three bulk INs in flight, one credit per frame, the
 * header form, zero-length and short transfers, a slow host, shutdown with the INs cancelled, and the failures
 * that are reported rather than dropped (TESTING.md 42.75). */
import { describe, expect, it } from 'vitest';

import { CREDIT } from './camera.js';
import { FakeCamera, type FakeCameraOptions } from './fake-camera.js';
import { FrameReader, type ReadResult } from './frame-read.js';
import { seekLink, type SeekLink } from './link.js';

const BODY_BYTES = CREDIT.body.bytes;
const HEADER_BYTES = CREDIT.header.bytes;

/** Frame k of `size` bytes: every byte depends on k and its position, so a misplaced transfer shows. */
function pattern(k: number, size: number): Uint8Array {
  const b = new Uint8Array(size);
  for (let i = 0; i < size; i++) b[i] = (k * 31 + i * 7) & 0xff;
  return b;
}

/** A fake camera that streams `frames` frames of `size` bytes, and a link to it that takes `maxBulkIn` INs. */
function streamOf(frames: number, size: number, options: FakeCameraOptions = {}) {
  const fake = new FakeCamera({
    productId: 0x0010,
    frames: Array.from({ length: frames }, (_, k) => pattern(k + 1, size)),
    ...options,
  });
  const link = seekLink({ control: fake, bulk: fake, api: 'fake camera', maxBulkIn: 4 });
  return { fake, link };
}

/** Reads `count` frames of `size` bytes through a FrameReader with `inFlight` INs, sending one credit per frame. */
async function readFrames(
  count: number,
  size: number,
  inFlight: number,
  options: FakeCameraOptions & { credit?: keyof typeof CREDIT } = {},
): Promise<{ results: ReadResult[]; fake: FakeCamera; reader: FrameReader }> {
  const { fake, link } = streamOf(count, size, options);
  await link.transport.open();
  const reader = new FrameReader(link, 1, { inFlight, timeoutMs: 2000 });
  const form = CREDIT[options.credit ?? 'body'];
  const results: ReadResult[] = [];
  for (let k = 0; k < count; k++) {
    results.push(await reader.read(form.bytes, creditFor(link, form)));
  }
  return { results, fake, reader };
}

/** The ImageData credit for one frame, sent through the link's transport: the checker's own request. */
function creditFor(
  link: SeekLink,
  form: (typeof CREDIT)[keyof typeof CREDIT],
): () => Promise<void> {
  return async () => {
    await link.transport.controlOut(0x53, Uint8Array.from(form.data), 1000);
  };
}

/** The bytes of each result, which must all be ok. */
function frameBytes(results: ReadResult[]): Uint8Array[] {
  return results.map((r) => {
    if (!r.ok) throw new Error(`expected a frame, got: ${r.reason}`);
    return r.bytes;
  });
}

describe('frames in order, with one or three bulk INs in flight (TESTING.md 42.74, 42.75)', () => {
  for (const inFlight of [1, 3]) {
    it(`${String(inFlight)} in flight: every frame comes back whole and in the order the camera sent it`, async () => {
      const { results, fake } = await readFrames(6, BODY_BYTES, inFlight);
      const frames = frameBytes(results);
      expect(frames.length).toBe(6);
      frames.forEach((bytes, k) => {
        expect(bytes.length).toBe(BODY_BYTES);
        expect(bytes).toEqual(pattern(k + 1, BODY_BYTES));
      });
      expect(fake.maxPendingIns).toBe(inFlight);
    });
  }

  it('the header form (0x8200): the 1,664-byte header first, then the body, in order', async () => {
    const { results, fake } = await readFrames(4, HEADER_BYTES, 3, { credit: 'header' });
    const frames = frameBytes(results);
    frames.forEach((bytes, k) => {
      expect(bytes).toEqual(pattern(k + 1, HEADER_BYTES));
    });
    expect(fake.maxPendingIns).toBe(3);
  });

  it('a slow host (3 ms per IN) still gets every frame in order with three in flight', async () => {
    const { results, fake } = await readFrames(4, BODY_BYTES, 3, { hostDelayMs: 3 });
    frameBytes(results).forEach((bytes, k) => {
      expect(bytes).toEqual(pattern(k + 1, BODY_BYTES));
    });
    expect(fake.maxPendingIns).toBe(3);
  });
});

describe('one credit per frame, after the frame is read (TESTING.md 42.74, section 1.4)', () => {
  it('one ImageData credit per frame, and no credit arrives while the camera still holds a transfer', async () => {
    const { results, fake } = await readFrames(5, BODY_BYTES, 3);
    expect(frameBytes(results).length).toBe(5);
    expect(fake.credits).toBe(5);
    expect(fake.creditsWithDataQueued).toBe(0);
    expect(fake.cancelledByCredit).toBe(0);
  });

  it('the credit carries the body form (0x7EC0) or the header form (0x8200), as asked', async () => {
    const { fake } = await readFrames(1, HEADER_BYTES, 1, { credit: 'header' });
    const credit = fake.sent('out').find((e) => e.request === 0x53);
    expect(credit?.data).toEqual([0x00, 0x82, 0, 0]);
  });
});

describe('transfers that are not the usual size (TESTING.md 42.75: short and zero-length packets)', () => {
  it('a zero-length packet inside a frame is no bytes: the frame goes on, and it is counted', async () => {
    const { results, reader } = await readFrames(3, BODY_BYTES, 3, { zeroLengthBefore: [1, 3] });
    frameBytes(results).forEach((bytes, k) => {
      expect(bytes).toEqual(pattern(k + 1, BODY_BYTES));
    });
    expect(reader.zeroLengthPackets).toBe(2);
  });

  it('the 1,664-byte header is a short transfer that ends on its own: the body follows in the next transfers', async () => {
    const { results } = await readFrames(2, HEADER_BYTES, 1, { credit: 'header' });
    frameBytes(results).forEach((bytes, k) => {
      expect(bytes).toEqual(pattern(k + 1, HEADER_BYTES));
    });
  });
});

describe('shutdown and failures are reported, not dropped (TESTING.md 42.75)', () => {
  it('shutdown cancels every IN that is still pending on the endpoint', async () => {
    /* two frames: the INs that are pending after frame 1 wait for frame 2's credit, as they do on the camera */
    const { fake, link } = streamOf(2, BODY_BYTES);
    await link.transport.open();
    const reader = new FrameReader(link, 1, { inFlight: 3, timeoutMs: 2000 });
    const form = CREDIT.body;
    const first = await reader.read(form.bytes, creditFor(link, form));
    expect(first.ok).toBe(true);
    expect(reader.pendingCount).toBe(2);
    expect(fake.pendingIns).toBe(2);
    reader.cancel();
    expect(fake.pendingIns).toBe(0);
    expect(fake.cancelledIns).toBe(2);
    expect(reader.pendingCount).toBe(0);
  });

  it('a transfer error in the middle of a frame is returned with its reason, and the frame is not delivered', async () => {
    const { results } = await readFrames(2, BODY_BYTES, 3, { failIn: 2 });
    const [first] = results;
    expect(first?.ok).toBe(false);
    if (first?.ok === false) expect(first.reason).toContain('the device has gone');
  });

  it('a stall is returned with its reason, not as a frame', async () => {
    const { results } = await readFrames(1, BODY_BYTES, 1, { stallIn: 1 });
    const [first] = results;
    expect(first?.ok).toBe(false);
    if (first?.ok === false) expect(first.reason).toBe('bulk IN 1 -> stall');
  });

  it('a stream with no frame left times the read out, and the timeout is returned with its reason', async () => {
    const { results } = await readFrames(1, BODY_BYTES, 3, { frames: [] });
    const [first] = results;
    expect(first?.ok).toBe(false);
    if (first?.ok === false) expect(first.reason).toContain('timed out');
  });

  it('a refused credit is returned as the frame’s failure, and no IN is posted for it', async () => {
    const { fake, link } = streamOf(1, BODY_BYTES, { refuseOut: [0x53] });
    await link.transport.open();
    const reader = new FrameReader(link, 1, { inFlight: 3, timeoutMs: 2000 });
    const form = CREDIT.body;
    const result = await reader.read(form.bytes, creditFor(link, form));
    expect(result.ok).toBe(false);
    expect(fake.sent('bulk')).toHaveLength(0);
  });
});
