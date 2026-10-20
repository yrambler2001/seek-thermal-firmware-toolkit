/* ====================================================================
 * The Node bridge's gate for the device-info read's two selectors (TESTING.md 42.81):
 * `vitest run --config e2e/vitest.config.ts camera-bus.e2e`. No browser, no device: the camera
 * is a fake host whose one device records what it is sent.
 *
 * The Info read sends SetFirmwareInfoFeatures (0x55) and SetRamDataFeatures (0x5A). The bridge lets
 * them through only while the test has opened the Info window (`CameraBus.infoOpen`), and only in
 * the shapes core sends (`info-read.ts`, the same lists the page-side guard uses). Every other
 * 0x55 / 0x5A is refused, and the flash writes stay refused in every window.
 * ==================================================================== */

import type { Page } from 'puppeteer-core';
import { describe, expect, it } from 'vitest';

import type { NodeUsbDevice } from '../packages/cli/src/node-usb.js';
import { OP, SEEK_VENDOR_ID } from '../packages/core/src/protocol/ops.js';
import { CameraBus, PAGE_REFUSED_OUT } from './lib/camera-bus.js';
import { UsbBridge, type BusDevice } from './lib/bridge.js';
import {
  INFO_FIRMWARE_INFO_OP,
  INFO_RAM_DATA_OP,
  INFO_SELECTORS,
  INFO_SERIAL_BLOCK,
} from './lib/info-read.js';
import type {
  BridgeReply,
  BridgeRequest,
  BusEvent,
  ControlSetup,
  DeviceCall,
} from './lib/protocol.js';

/** One transfer the fake camera received. */
interface Sent {
  readonly request: number;
  readonly bytes: readonly number[];
}

/** The fake camera: a node-usb device that records every control OUT it is given. */
function fakeCamera(sent: Sent[]): NodeUsbDevice {
  let opened = false;
  return {
    vendorId: SEEK_VENDOR_ID,
    productId: 0x0011,
    manufacturerName: 'Seek Thermal, Inc.',
    productName: 'PIR206 Thermal Camera',
    serialNumber: '101310HSNEA2',
    handle: 'DeviceId(1)',
    get opened() {
      return opened;
    },
    open: () => {
      opened = true;
      return Promise.resolve();
    },
    close: () => {
      opened = false;
      return Promise.resolve();
    },
    get configuration() {
      return { configurationValue: 1 };
    },
    selectConfiguration: () => Promise.resolve(),
    claimInterface: () => Promise.resolve(),
    releaseInterface: () => Promise.resolve(),
    controlTransferIn: () =>
      Promise.resolve({ status: 'ok' as const, data: new DataView(new ArrayBuffer(0)) }),
    controlTransferOut: (setup: { request: number }, data: ArrayBufferView) => {
      sent.push({
        request: setup.request,
        bytes: [...new Uint8Array(data.buffer, data.byteOffset, data.byteLength)],
      });
      return Promise.resolve({ status: 'ok' as const, bytesWritten: data.byteLength });
    },
  } as unknown as NodeUsbDevice;
}

/** A bus over one fake camera, and what the camera receives. */
async function openCamera(): Promise<{ readonly bus: CameraBus; readonly sent: Sent[] }> {
  const sent: Sent[] = [];
  const host = Object.assign(new EventTarget(), {
    getDevices: () => Promise.resolve([fakeCamera(sent)]),
  });
  const bus = await CameraBus.over(host, () => undefined);
  return { bus, sent };
}

/** The one device the bus holds. */
function held(bus: CameraBus): BusDevice {
  const [device] = bus.present();
  if (device === undefined) throw new Error('the bus holds no camera');
  return device;
}

const vendorSetup = (request: number): ControlSetup => ({
  requestType: 'vendor',
  recipient: 'device',
  request,
  value: 0,
  index: 0,
});

const u16 = (value: number): Uint8Array => new Uint8Array([value & 0xff, (value >> 8) & 0xff]);
const block = (): Uint8Array => new Uint8Array(INFO_SERIAL_BLOCK);

/** A page that records the bus events the bridge delivers and calls the bridge's binding. */
function recordingPage(): {
  readonly page: Page;
  readonly events: BusEvent[];
  call(request: BridgeRequest): Promise<BridgeReply>;
} {
  const events: BusEvent[] = [];
  let binding: ((request: BridgeRequest) => Promise<BridgeReply>) | null = null;
  const page = {
    exposeFunction: (_name: string, fn: (request: BridgeRequest) => Promise<BridgeReply>) => {
      binding = fn;
      return Promise.resolve();
    },
    evaluateOnNewDocument: () => Promise.resolve(),
    evaluate: (_fn: unknown, _name: string, event: BusEvent) => {
      events.push(event);
      return Promise.resolve();
    },
  } as unknown as Page;
  return {
    page,
    events,
    call: (request) => {
      if (binding === null) throw new Error('the bridge never exposed its binding');
      return binding(request);
    },
  };
}

/** Grants the bus's camera to the page the way a person does: the chooser, then a pick. */
async function grant(bridge: UsbBridge, page: ReturnType<typeof recordingPage>): Promise<void> {
  const reply = page.call({ op: 'requestDevice', filters: [], doc: 'doc-1' });
  const prompt = await bridge.waitForDevicePrompt({ timeout: 5000 });
  const [listed] = prompt.devices;
  if (listed === undefined) throw new Error('the chooser listed nothing');
  await prompt.select(listed);
  expect((await reply).ok).toBe(true);
}

/** One device call through the bridge, as the page makes it on the camera the grant named. */
const callOn = (page: ReturnType<typeof recordingPage>, call: DeviceCall): Promise<BridgeReply> =>
  page.call({ op: 'call', key: 'cam-0', doc: 'doc-1', ...call });

/** The page's control OUT of `request` with `bytes`, through the bridge (base64 on the wire). */
const outThroughBridge = (
  page: ReturnType<typeof recordingPage>,
  request: number,
  bytes: Uint8Array,
): Promise<BridgeReply> =>
  callOn(page, {
    method: 'controlTransferOut',
    setup: vendorSetup(request),
    data: Buffer.from(bytes).toString('base64'),
  });

describe('the bridge gate for the Info read (TESTING.md 42.81)', () => {
  it('lets the Info read’s selectors out during an Info read, in the shapes core sends', async () => {
    const { bus, sent } = await openCamera();
    try {
      bus.infoOpen = true;
      const device = held(bus);
      for (const selector of INFO_SELECTORS) {
        expect(
          bus.check(device, 'out', vendorSetup(INFO_FIRMWARE_INFO_OP), u16(selector)).kind,
          `SetFirmwareInfoFeatures(${String(selector)})`,
        ).toBe('forward');
      }
      expect(
        bus.check(device, 'out', vendorSetup(INFO_RAM_DATA_OP), block()).kind,
        'the device-id block',
      ).toBe('forward');
      /* the device wrapper, the second line of the gate, lets the same transfers reach the camera */
      const wire = device.device;
      await wire.controlTransferOut(
        {
          requestType: 'vendor',
          recipient: 'device',
          request: INFO_FIRMWARE_INFO_OP,
          value: 0,
          index: 0,
        },
        u16(1),
        1000,
      );
      await wire.controlTransferOut(
        {
          requestType: 'vendor',
          recipient: 'device',
          request: INFO_RAM_DATA_OP,
          value: 0,
          index: 0,
        },
        block(),
        1000,
      );
      expect(sent).toEqual([
        { request: INFO_FIRMWARE_INFO_OP, bytes: [1, 0] },
        { request: INFO_RAM_DATA_OP, bytes: [...INFO_SERIAL_BLOCK] },
      ]);
    } finally {
      await bus.close();
    }
  });

  it('through the bridge, the Info read’s selectors reach the camera during an Info read', async () => {
    const { bus, sent } = await openCamera();
    const page = recordingPage();
    const bridge = await UsbBridge.attach(page.page, bus);
    try {
      bus.infoOpen = true;
      await grant(bridge, page);
      expect((await callOn(page, { method: 'open' })).ok).toBe(true);
      expect((await callOn(page, { method: 'claimInterface', n: 0 })).ok).toBe(true);
      const selectorReply = await outThroughBridge(page, INFO_FIRMWARE_INFO_OP, u16(20));
      expect(selectorReply.ok, 'SetFirmwareInfoFeatures(20) through the bridge').toBe(true);
      const blockReply = await outThroughBridge(page, INFO_RAM_DATA_OP, block());
      expect(blockReply.ok, 'the device-id block through the bridge').toBe(true);
      expect(sent).toEqual([
        { request: INFO_FIRMWARE_INFO_OP, bytes: [20, 0] },
        { request: INFO_RAM_DATA_OP, bytes: [...INFO_SERIAL_BLOCK] },
      ]);
      expect(bridge.refusals, 'nothing refused').toEqual([]);
    } finally {
      bridge.detach();
      await bus.close();
    }
  });

  it('outside an Info read the same two selectors are refused, at the bus and through the bridge', async () => {
    const { bus, sent } = await openCamera();
    const page = recordingPage();
    const bridge = await UsbBridge.attach(page.page, bus);
    try {
      /* shut (the default), then open for one read, then shut again */
      expect(bus.infoOpen).toBe(false);
      const device = held(bus);
      const shut = bus.check(device, 'out', vendorSetup(INFO_FIRMWARE_INFO_OP), u16(1));
      expect(shut.kind, 'SetFirmwareInfoFeatures(1), window shut').toBe('refuse');
      expect(shut.kind === 'refuse' ? shut.why : '').toMatch(/only during an Info read/);
      expect(bus.check(device, 'out', vendorSetup(INFO_RAM_DATA_OP), block()).kind).toBe('refuse');

      await grant(bridge, page);
      expect((await callOn(page, { method: 'open' })).ok).toBe(true);
      expect((await callOn(page, { method: 'claimInterface', n: 0 })).ok).toBe(true);
      bus.infoOpen = true;
      expect((await outThroughBridge(page, INFO_FIRMWARE_INFO_OP, u16(1))).ok).toBe(true);
      bus.infoOpen = false;

      const after = await outThroughBridge(page, INFO_FIRMWARE_INFO_OP, u16(1));
      expect(after.ok, 'after the Info read the window is shut').toBe(false);
      if (!after.ok) expect(after.name).toBe('SecurityError');
      const afterBlock = await outThroughBridge(page, INFO_RAM_DATA_OP, block());
      expect(afterBlock.ok, 'the device-id block, window shut').toBe(false);
      expect(bridge.refusals).toEqual([
        expect.stringMatching(/^GUARD refused OUT 0x55: .*only during an Info read$/),
        expect.stringMatching(/^GUARD refused OUT 0x5a: .*only during an Info read$/),
      ]);
      expect(sent, 'the camera got only the read’s selector').toEqual([
        { request: INFO_FIRMWARE_INFO_OP, bytes: [1, 0] },
      ]);
    } finally {
      bridge.detach();
      await bus.close();
    }
  });

  it('during an Info read, a selector or block off the Info read’s shapes is refused, and so is a flash write', async () => {
    const { bus, sent } = await openCamera();
    try {
      bus.infoOpen = true;
      const device = held(bus);
      const refused: [string, number, Uint8Array][] = [
        [
          'SetFirmwareInfoFeatures(2): a selector the read does not send',
          INFO_FIRMWARE_INFO_OP,
          u16(2),
        ],
        [
          'SetFirmwareInfoFeatures(0): a selector the read does not send',
          INFO_FIRMWARE_INFO_OP,
          u16(0),
        ],
        [
          'SetFirmwareInfoFeatures with three bytes',
          INFO_FIRMWARE_INFO_OP,
          new Uint8Array([1, 0, 0]),
        ],
        [
          'SetFirmwareInfoFeatures with four bytes',
          INFO_FIRMWARE_INFO_OP,
          new Uint8Array([1, 0, 0, 0]),
        ],
        ['SetFirmwareInfoFeatures with no payload', INFO_FIRMWARE_INFO_OP, new Uint8Array(0)],
        [
          'SetRamDataFeatures with the case changed',
          INFO_RAM_DATA_OP,
          new Uint8Array([0, 1, 0x7c, 0, 0, 0]),
        ],
        [
          'SetRamDataFeatures with the length changed',
          INFO_RAM_DATA_OP,
          new Uint8Array([0, 0, 0x7d, 0, 0, 0]),
        ],
        [
          'SetRamDataFeatures with a nonzero tail',
          INFO_RAM_DATA_OP,
          new Uint8Array([0, 0, 0x7c, 0, 0, 1]),
        ],
        ['SetRamDataFeatures with two bytes', INFO_RAM_DATA_OP, new Uint8Array([0, 0])],
        [
          'SetFeaturedFirmwareData (a flash write)',
          OP.SET_FEATURED_FIRMWARE_DATA,
          new Uint8Array([0, 0]),
        ],
        ['CompleteMemoryUpgrade (a flash write)', OP.COMPLETE_MEMORY_UPGRADE, u16(0)],
      ];
      for (const [what, request, bytes] of refused) {
        const verdict = bus.check(device, 'out', vendorSetup(request), bytes);
        expect(verdict.kind, what).toBe('refuse');
      }
      /* and the device wrapper, the second line, refuses the same and sends nothing (it throws
       * synchronously; the bridge's async call turns that into the page's rejection) */
      const wire = device.device;
      expect(
        () =>
          wire.controlTransferOut(
            {
              requestType: 'vendor',
              recipient: 'device',
              request: INFO_FIRMWARE_INFO_OP,
              value: 0,
              index: 0,
            },
            u16(2),
            1000,
          ),
        'the device wrapper refuses selector 2',
      ).toThrow(/e2e guard \(inner\)/);
      expect(bus.innerRefusals, 'the inner refusal is recorded').toHaveLength(1);
      expect(sent, 'nothing refused reached the camera').toEqual([]);
    } finally {
      await bus.close();
    }
  });

  it('the page-side list keeps the flash writes and no longer holds the two selectors', () => {
    expect(PAGE_REFUSED_OUT).toEqual([OP.SET_FEATURED_FIRMWARE_DATA, OP.COMPLETE_MEMORY_UPGRADE]);
  });
});
