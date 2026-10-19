/* The camera port on a fake camera: the init choice, the firmware-info retry, the request list, and the frame loop. */
import { describe, expect, it } from 'vitest';

import {
  CHECKER_REQUESTS_IN,
  CHECKER_REQUESTS_OUT,
  REQUESTS,
  SEEK_MODE,
  SeekCamera,
  readTrustedFirmware,
  serialFromChipId,
  usesCompactProInit,
} from './camera.js';
import { FakeCamera, compactFrame, type LoggedTransfer } from './fake-camera.js';
import { seekLink } from './link.js';
import type { SeekFrame } from './frame.js';
import { WebUsbTransport } from '../../../../packages/core/src/protocol/webusb.js';

function linkFor(fake: FakeCamera) {
  return seekLink({ control: fake, bulk: fake, api: 'fake camera' });
}

/** The OUT requests of the log, as (request, payload) rows. */
function outs(log: readonly LoggedTransfer[]): { request: number; data: number[] }[] {
  return log.filter((e) => e.dir === 'out').map((e) => ({ request: e.request, data: [...e.data] }));
}

describe('which init the Compact gets (the Pro init on firmware 4.x and newer only)', () => {
  it('applies the Pro init only to a Compact on firmware major 4 or higher, with the option on', () => {
    expect(usesCompactProInit(false, true, 4)).toBe(true);
    expect(usesCompactProInit(false, true, 5)).toBe(true);
    expect(usesCompactProInit(false, true, 3)).toBe(false);
    expect(usesCompactProInit(false, true, 1)).toBe(false); // 1.3.0.0 always gets the classic init
    expect(usesCompactProInit(false, true, 0)).toBe(false);
    expect(usesCompactProInit(false, true, null)).toBe(false); // no version read at all
  });

  it('never applies it to a Pro, and not when the option is off', () => {
    expect(usesCompactProInit(true, true, 4)).toBe(false);
    expect(usesCompactProInit(false, false, 4)).toBe(false);
  });

  it('a 1.3.0.0 Compact connects with the classic init: no 0x54 or 0x55, mode 8 set with 0x3e', async () => {
    const fake = new FakeCamera({ productId: 0x0010, firmwareHeads: [[1, 3, 0, 0, 0, 0, 0, 0]] });
    const camera = await SeekCamera.connect(linkFor(fake));
    const rows = outs(fake.log);
    expect(rows.some((r) => r.request === REQUESTS.INIT_54)).toBe(false);
    expect(rows.some((r) => r.request === REQUESTS.INIT_55)).toBe(false);
    expect(rows).toContainEqual({ request: REQUESTS.SET_IMAGE_PROCESSING_MODE, data: [8, 0] });
    expect(rows.some((r) => r.request === REQUESTS.OP_ZERO)).toBe(true); // startupOpZero is on
    expect(camera.compactOnPro).toBe(false);
    expect(camera.info?.model).toBe('Seek Compact');
    expect(camera.info?.firmware).toBe('1.3.0.0');
    expect(camera.processingMode).toBe(SEEK_MODE.normal);
    await camera.disconnect();
  });

  it('a Compact XR on 4.8.2.1 connects with the Pro init and mode 8', async () => {
    const fake = new FakeCamera({ productId: 0x0010, firmwareHeads: [[4, 8, 2, 1, 0, 0, 0, 0]] });
    const camera = await SeekCamera.connect(linkFor(fake));
    const rows = outs(fake.log);
    expect(rows).toContainEqual({ request: REQUESTS.INIT_54, data: [1, 0, 0, 0] });
    expect(rows.some((r) => r.request === REQUESTS.OP_ZERO)).toBe(false);
    expect(rows).toContainEqual({ request: REQUESTS.SET_IMAGE_PROCESSING_MODE, data: [8, 0] });
    expect(camera.compactOnPro).toBe(true);
    expect(camera.info?.model).toBe('Seek Compact / Compact XR (Pro init)');
    expect(camera.info?.firmware).toBe('4.8.2.1');
    await camera.disconnect();
  });

  it('--no-pro-init: the 4.8.2.1 gets the classic init', async () => {
    const fake = new FakeCamera({ productId: 0x0010, firmwareHeads: [[4, 8, 2, 1, 0, 0, 0, 0]] });
    const camera = await SeekCamera.connect(linkFor(fake), { compactProInit: false });
    expect(outs(fake.log).some((r) => r.request === REQUESTS.INIT_54)).toBe(false);
    expect(camera.compactOnPro).toBe(false);
    await camera.disconnect();
  });

  it('the Pro (0x0011) always gets the Pro init and the 320 x 240 geometry', async () => {
    const fake = new FakeCamera({ productId: 0x0011, firmwareHeads: [[4, 9, 1, 15, 0, 0, 0, 0]] });
    const camera = await SeekCamera.connect(linkFor(fake));
    expect(outs(fake.log).some((r) => r.request === REQUESTS.INIT_54)).toBe(true);
    expect(camera.isPro).toBe(true);
    expect(camera.width).toBe(320);
    expect(camera.height).toBe(240);
    expect(camera.info?.model).toBe('Seek Thermal Pro');
    expect(camera.supportsShutterCommands).toBe(true);
    await camera.disconnect();
  });
});

/** The window reply an unlocked camera gives (TESTING.md 42.41): major 184, read as a version it is not. */
const WINDOW_REPLY = [0xb8, 0x2a, 0x00, 0x14, 0x00, 0x00, 0x01, 0x14];

describe('the firmware reply the init is chosen from', () => {
  it('takes the version from two consecutive replies that agree, and passes over a leftover reply', async () => {
    // right after a stop the camera can answer with the leftover slice [0, 0, 4, 0] once
    const fake = new FakeCamera({
      firmwareHeads: [
        [0, 0, 4, 0, 0, 0, 0, 0],
        [4, 8, 2, 1, 0, 0, 0, 0],
        [4, 8, 2, 1, 0, 0, 0, 0],
      ],
    });
    const link = linkFor(fake);
    await link.transport.open();
    const reply = await readTrustedFirmware(link.transport, 0);
    expect(reply.version).toBe('4.8.2.1');
    expect(fake.sent('in').filter((e) => e.request === REQUESTS.GET_FIRMWARE_INFO)).toHaveLength(3);
  });

  it('gives no version when no two consecutive replies agree in 26 reads', async () => {
    // every reply differs from the one before it
    const fake = new FakeCamera({
      firmwareHeads: Array.from({ length: 26 }, (_, i) =>
        i % 2 === 0 ? [0, 0, 4, 0, 0, 0, 0, 0] : [1, 3, 0, 0, 0, 0, 0, 0],
      ),
    });
    const link = linkFor(fake);
    await link.transport.open();
    const reply = await readTrustedFirmware(link.transport, 0);
    expect(reply.version).toBeNull();
    expect(reply.note).toContain('no two consecutive replies that agree in 26 reads');
    expect(fake.sent('in').filter((e) => e.request === REQUESTS.GET_FIRMWARE_INFO)).toHaveLength(
      26,
    );
  });

  it('waits out the reads a starting build refuses, and takes the version that two later replies agree on', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      firmwareHeads: [[1, 3, 0, 8, 0, 0, 0, 0]],
      stallFirstInfo: 5,
    });
    const camera = await SeekCamera.connect(linkFor(fake));
    expect(camera.info?.firmware).toBe('1.3.0.8');
    await camera.disconnect();
  });

  it('a Compact whose firmware is never answered is refused after the start-up reads, with nothing sent', async () => {
    const fake = new FakeCamera({ productId: 0x0010, stallFirstInfo: 1000 });
    await expect(SeekCamera.connect(linkFor(fake))).rejects.toThrow(
      /cannot be trusted[\s\S]*no two consecutive replies that agree in 26 reads/,
    );
    expect(outs(fake.log)).toEqual([]);
    expect(fake.opened).toBe(false);
  });

  it('refuses a repeated reply whose major is above 9: the window bytes of an unlocked camera', async () => {
    const fake = new FakeCamera({ firmwareHeads: [WINDOW_REPLY] });
    const link = linkFor(fake);
    await link.transport.open();
    const reply = await readTrustedFirmware(link.transport, 0);
    expect(reply.version).toBeNull();
    expect(reply.note).toContain('major 184 is not a Seek build');
  });

  it('a Compact with an untrusted reply does not connect: no init is sent, and the link is closed', async () => {
    const fake = new FakeCamera({ productId: 0x0010, firmwareHeads: [WINDOW_REPLY] });
    await expect(SeekCamera.connect(linkFor(fake))).rejects.toThrow(
      /cannot be trusted[\s\S]*unlocked by a slots command[\s\S]*power cycle/,
    );
    expect(outs(fake.log)).toEqual([]);
    expect(fake.opened).toBe(false);
  });

  it('a Pro with an untrusted reply still connects, with the firmware unnamed: its init does not depend on it', async () => {
    const fake = new FakeCamera({ productId: 0x0011, firmwareHeads: [WINDOW_REPLY] });
    const camera = await SeekCamera.connect(linkFor(fake));
    expect(camera.info?.firmware).toBe('-');
    expect(camera.compactOnPro).toBe(false);
    expect(outs(fake.log).some((r) => r.request === REQUESTS.INIT_54)).toBe(true);
    await camera.disconnect();
  });

  it('a camera that refuses one of its init requests is reported as unlocked until a power cycle', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      firmwareHeads: [[1, 3, 0, 0, 0, 0, 0, 0]],
      refuseOut: [REQUESTS.INIT_56],
    });
    await expect(SeekCamera.connect(linkFor(fake))).rejects.toThrow(
      /refused an init request[\s\S]*unlocked by a slots command[\s\S]*until a power cycle/,
    );
    expect(fake.opened).toBe(false);
  });
});

describe('Startup with Operation=0, and the stop before an init', () => {
  it('a build that refuses it (0x37) connects without it, and says so', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      firmwareHeads: [[1, 3, 0, 8, 0, 0, 0, 0]],
      refuseOut: [REQUESTS.OP_ZERO],
    });
    const camera = await SeekCamera.connect(linkFor(fake));
    expect(camera.startupOpZeroRefused).toBe(true);
    expect(camera.info?.firmware).toBe('1.3.0.8');
    expect(camera.processingMode).toBe(SEEK_MODE.normal);
    const rows = outs(fake.log);
    expect(rows).toContainEqual({ request: REQUESTS.INIT_56, data: [0x01] });
    expect(rows).toContainEqual({ request: REQUESTS.SET_IMAGE_PROCESSING_MODE, data: [8, 0] });
    await camera.disconnect();
  });

  it('after such a refusal, a reinit stops the camera first: three SetOperationMode 0, then the FastRaw init', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      firmwareHeads: [[1, 3, 0, 8, 0, 0, 0, 0]],
      refuseOut: [REQUESTS.OP_ZERO],
    });
    const camera = await SeekCamera.connect(linkFor(fake));
    const before = fake.log.length;
    await camera.reinit(SEEK_MODE.fastRaw);
    const rows = outs(fake.log.slice(before));
    expect(rows.slice(0, 4)).toEqual([
      { request: REQUESTS.SET_OPERATION_MODE, data: [0, 0] },
      { request: REQUESTS.SET_OPERATION_MODE, data: [0, 0] },
      { request: REQUESTS.SET_OPERATION_MODE, data: [0, 0] },
      { request: REQUESTS.INIT_56, data: [0x01] },
    ]);
    expect(rows).toContainEqual({ request: REQUESTS.SET_IMAGE_PROCESSING_MODE, data: [3, 0] });
    await camera.disconnect();
  });

  it('a build that takes it gets no extra stop on a reinit while not streaming', async () => {
    const fake = new FakeCamera({ productId: 0x0010, firmwareHeads: [[1, 3, 0, 0, 0, 0, 0, 0]] });
    const camera = await SeekCamera.connect(linkFor(fake));
    const before = fake.log.length;
    await camera.reinit(SEEK_MODE.fastRaw);
    const rows = outs(fake.log.slice(before));
    /* the classic init's own Startup with Operation=0 comes first, and no stop of three precedes it */
    expect(rows[0]).toEqual({ request: REQUESTS.OP_ZERO, data: [1, 0, 0, 0] });
    expect(rows[1]).toEqual({ request: REQUESTS.SET_OPERATION_MODE, data: [0, 0] });
    expect(rows[2]).toEqual({ request: REQUESTS.INIT_56, data: [0x01] });
    await camera.disconnect();
  });

  it('--no-opzero connects without 0x37, and a reinit still stops the camera first', async () => {
    const fake = new FakeCamera({ productId: 0x0010, firmwareHeads: [[1, 3, 0, 8, 0, 0, 0, 0]] });
    const camera = await SeekCamera.connect(linkFor(fake), { startupOpZero: false });
    expect(outs(fake.log).some((r) => r.request === REQUESTS.OP_ZERO)).toBe(false);
    expect(camera.startupOpZeroRefused).toBe(false);
    const before = fake.log.length;
    await camera.reinit(SEEK_MODE.raw);
    const rows = outs(fake.log.slice(before));
    expect(rows.slice(0, 3).every((r) => r.request === REQUESTS.SET_OPERATION_MODE)).toBe(true);
    await camera.disconnect();
  });
});

describe('mode 4: frames with no header type', () => {
  it('counts the status-0 frames of mode 4 and delivers them as pictures', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      frames: [compactFrame(0, 5000)],
      endless: true,
    });
    const camera = await SeekCamera.connect(linkFor(fake), { hiFPS: false });
    const statuses: number[] = [];
    camera.onFrame = (frame) => statuses.push(frame.status);
    await camera.reinit(SEEK_MODE.mode4);
    camera.startStreaming();
    await waitFor(() => statuses.length >= 3);
    await camera.stopStreaming();
    expect(statuses.every((status) => status === 0)).toBe(true);
    expect(camera.untypedFrames).toBeGreaterThanOrEqual(3);
    expect(camera.processingMode).toBe(SEEK_MODE.mode4);
    await camera.disconnect();
  });

  it('in Normal, a status-0 frame is counted and dropped, and the pictures around it are kept', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      frames: [
        compactFrame(3, 5000), // the calibration frame: it sets the dead-pixel map and is not delivered
        compactFrame(0, 5000),
        compactFrame(3, 5000),
        compactFrame(3, 5000),
      ],
    });
    const camera = await SeekCamera.connect(linkFor(fake), { hiFPS: false });
    const statuses: number[] = [];
    camera.onFrame = (frame) => statuses.push(frame.status);
    camera.startStreaming();
    await waitFor(() => statuses.length >= 2);
    await camera.stopStreaming();
    expect(statuses).toEqual([3, 3]);
    expect(camera.untypedFrames).toBe(1);
    await camera.disconnect();
  });
});

describe('the serial', () => {
  it('is the USB serial string when there is one, else the chip id as hex (every other byte)', async () => {
    expect(serialFromChipId(new Uint8Array([0x10, 0x01, 0x13, 0x02, 0xce, 0x03]))).toBe('1013CE');
    const withString = new FakeCamera({ serialNumber: '101310HSNEA2' });
    const a = await SeekCamera.connect(linkFor(withString));
    expect(a.info?.serial).toBe('101310HSNEA2');
    await a.disconnect();
    const noString = new FakeCamera({ serialNumber: null, chipId: [0x10, 0, 0x13, 0, 0xce, 0] });
    const b = await SeekCamera.connect(linkFor(noString));
    expect(b.info?.serial).toBe('1013CE');
    await b.disconnect();
  });
});

describe('the request list', () => {
  it('every request the connect, the init and the stream send is one of the checker list', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      firmwareHeads: [[4, 8, 2, 1, 0, 0, 0, 0]],
      frames: [compactFrame(3, 5000), compactFrame(3, 5000), compactFrame(3, 5000)],
    });
    const camera = await SeekCamera.connect(linkFor(fake));
    const frames: SeekFrame[] = [];
    camera.onFrame = (frame) => frames.push(frame);
    camera.startStreaming();
    await waitFor(() => frames.length >= 2);
    await camera.disconnect();
    const inRequests = new Set(fake.sent('in').map((e) => e.request));
    const outRequests = new Set(fake.sent('out').map((e) => e.request));
    for (const r of inRequests) expect(CHECKER_REQUESTS_IN).toContain(r);
    for (const r of outRequests) expect(CHECKER_REQUESTS_OUT).toContain(r);
    expect(outRequests.has(REQUESTS.IMAGE_DATA)).toBe(true);
    expect(fake.sent('bulk').every((e) => e.request === 1)).toBe(true);
  });

  it('a Compact frame credit is the bulk length 0x7EC0, and the bulk read is 64896 bytes on endpoint 1', async () => {
    // two frames: the first grab is the calibration read, which the stream does not deliver (Swift streamLoop)
    const fake = new FakeCamera({
      productId: 0x0010,
      frames: [compactFrame(3, 5000), compactFrame(3, 5000)],
    });
    const camera = await SeekCamera.connect(linkFor(fake));
    const frames: SeekFrame[] = [];
    camera.onFrame = (frame) => frames.push(frame);
    camera.startStreaming();
    await waitFor(() => frames.length >= 1);
    await camera.stopStreaming();
    const credit = fake.sent('out').find((e) => e.request === REQUESTS.IMAGE_DATA);
    expect(credit?.data).toEqual([0xc0, 0x7e, 0, 0]);
    expect(fake.sent('bulk')[0]!.data).toEqual([64896]);
    await camera.disconnect();
  });
});

describe('the frame loop', () => {
  it('delivers each frame to onFrame, with the header read from the bytes', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      frames: [compactFrame(3, 5000), compactFrame(3, 5000), compactFrame(3, 5001)],
    });
    const camera = await SeekCamera.connect(linkFor(fake));
    const frames: SeekFrame[] = [];
    camera.onFrame = (frame) => frames.push(frame);
    camera.startStreaming();
    await waitFor(() => frames.length >= 2);
    await camera.stopStreaming();
    expect(frames[0]!.status).toBe(3);
    expect(frames[0]!.data.length).toBe(206 * 156);
    expect(camera.lastStatus).toBe(3);
    expect(camera.lastFrameCount).toBe(7);
    await camera.disconnect();
  });

  it('Init Hi FPS: a shutter frame (status 1) in Normal mode sends FastRaw (mode 3) and the stream goes on', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      frames: [
        compactFrame(1, 5000),
        compactFrame(3, 5000),
        compactFrame(3, 5000),
        compactFrame(3, 5000),
      ],
    });
    const camera = await SeekCamera.connect(linkFor(fake));
    const frames: SeekFrame[] = [];
    camera.onFrame = (frame) => frames.push(frame);
    camera.startStreaming();
    await waitFor(() => frames.length >= 1);
    await camera.stopStreaming();
    expect(outs(fake.log)).toContainEqual({
      request: REQUESTS.SET_IMAGE_PROCESSING_MODE,
      data: [3, 0],
    });
    await camera.disconnect();
  });

  it('--no-hifps: a shutter frame in Normal mode does not switch the mode', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      frames: [compactFrame(1, 5000), compactFrame(3, 5000), compactFrame(3, 5000)],
    });
    const camera = await SeekCamera.connect(linkFor(fake), { hiFPS: false });
    const frames: SeekFrame[] = [];
    camera.onFrame = (frame) => frames.push(frame);
    camera.startStreaming();
    await waitFor(() => frames.length >= 1);
    await camera.stopStreaming();
    const modes = outs(fake.log).filter((r) => r.request === REQUESTS.SET_IMAGE_PROCESSING_MODE);
    expect(modes.map((r) => r.data[0])).toEqual([8]); // only the connect's Normal init
    await camera.disconnect();
  });

  it('reinit to FastRaw while streaming stops, re-inits, and starts again', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      frames: Array.from({ length: 12 }, () => compactFrame(3, 5000)),
      endless: true,
    });
    const camera = await SeekCamera.connect(linkFor(fake), { hiFPS: false });
    camera.onFrame = () => undefined;
    camera.startStreaming();
    await waitFor(() => fake.sent('bulk').length >= 2);
    await camera.reinit(SEEK_MODE.fastRaw);
    expect(camera.isStreaming).toBe(true);
    expect(camera.processingMode).toBe(SEEK_MODE.fastRaw);
    await camera.disconnect();
    expect(outs(fake.log)).toContainEqual({
      request: REQUESTS.SET_IMAGE_PROCESSING_MODE,
      data: [3, 0],
    });
  });

  it('disconnect sends SetOperationMode 0 three times and closes', async () => {
    const fake = new FakeCamera({ productId: 0x0010 });
    const camera = await SeekCamera.connect(linkFor(fake));
    await camera.disconnect();
    const stops = fake
      .sent('out')
      .filter((e) => e.request === REQUESTS.SET_OPERATION_MODE && e.data[0] === 0);
    expect(stops.length).toBeGreaterThanOrEqual(3);
    expect(fake.opened).toBe(false);
    expect(camera.info).toBeNull();
  });
});

describe('the transport is the core one', () => {
  it('the link is a core WebUsbTransport with recipient auto', () => {
    const link = linkFor(new FakeCamera());
    expect(link.transport).toBeInstanceOf(WebUsbTransport);
  });
});

/** Polls until `done` holds, yielding between polls; fails after a generous limit. */
async function waitFor(done: () => boolean, limitMs = 5000): Promise<void> {
  const end = Date.now() + limitMs;
  while (!done()) {
    if (Date.now() > end) throw new Error('waitFor: the condition did not hold in time');
    await new Promise((resolve) => setTimeout(resolve, 2));
  }
}
