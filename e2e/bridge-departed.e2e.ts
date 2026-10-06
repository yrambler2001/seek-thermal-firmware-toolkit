/* ==================================================================== *
 * The bridge tells the page a device has gone, even when the host stack
 * cannot describe it any more — `vitest run --config e2e/vitest.config.ts
 * bridge-departed.e2e`. No browser, no device.
 *
 * Measured on the real camera (2026-10-06): when step 02 rebooted it, the
 * bridge built the page's `disconnect` from the departed device, node-usb's
 * `configuration` getter threw "getString error: unknown (error 0xe00002d9)",
 * the bus listener dropped the rejection (`void onBusChange`), and the page
 * never heard the camera go. It kept retrying a dead handle for ten minutes
 * instead of asking for the camera. The page here is a stand-in that records
 * what the bridge sends it; the bus is a fake whose one device leaves.
 *
 * And once that was fixed, the next reboot of the same run was reported by
 * node-usb with no event at all, neither the leaving nor the arrival, so the
 * camera bus held a device the registry no longer had. The last test drives
 * `CameraBus` over a fake host whose re-enumeration sends no event.
 *
 * The same getter is a transfer on the camera's control pipe, and the bridge
 * read it after every call; one such read never returned and froze a run in
 * step 02. The bridge now reads it where Chrome does (open, select).
 * ==================================================================== */

import type { Page } from 'puppeteer-core';
import { describe, expect, it } from 'vitest';

import { fromNodeUsb, type NodeUsbDevice } from '../packages/cli/src/node-usb.js';
import { CameraBus } from './lib/camera-bus.js';
import type { WebUsbDevice } from '../packages/core/src/protocol/webusb.js';
import { UsbBridge, type BusChange, type BusDevice, type UsbBus } from './lib/bridge.js';
import type { BridgeReply, BridgeRequest, BusEvent, DeviceCall } from './lib/protocol.js';

const DEPARTED = 'getString error: unknown (error 0xe00002d9)';

/** A page that records the bus events the bridge delivers, and nothing else. */
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

/** A bus with one device on it, which can be made to leave. */
function oneDeviceBus(device: WebUsbDevice): {
  readonly bus: UsbBus;
  readonly leave: () => void;
} {
  const listeners = new Set<(change: BusChange) => void>();
  const entry: BusDevice = {
    key: 'cam-0',
    device,
    vendorId: 0x289d,
    productId: 0x0011,
    productName: 'PIR324 Thermal Camera',
    manufacturerName: 'Seek Thermal, Inc.',
    serialNumber: null,
  };
  let present = true;
  const bus: UsbBus = {
    name: 'one departing device',
    hostTimeoutMs: 1000,
    present: () => (present ? [entry] : []),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    check: () => ({ kind: 'forward' }),
    close: () => Promise.resolve(),
  };
  return {
    bus,
    leave: () => {
      present = false;
      for (const listener of [...listeners]) listener({ kind: 'detach', device: entry });
    },
  };
}

/** A device whose `configuration` reads until it leaves, then throws as node-usb's did. */
function departingDevice(): { readonly device: NodeUsbDevice; readonly leave: () => void } {
  let gone = false;
  const device = {
    vendorId: 0x289d,
    productId: 0x0011,
    manufacturerName: 'Seek Thermal, Inc.',
    productName: 'PIR324 Thermal Camera',
    serialNumber: null,
    get configuration() {
      if (gone) throw new Error(DEPARTED);
      return { configurationValue: 1 };
    },
    opened: false,
    open: () => Promise.resolve(),
    close: () => Promise.resolve(),
    selectConfiguration: () => Promise.resolve(),
    claimInterface: () => Promise.resolve(),
    releaseInterface: () => Promise.resolve(),
    controlTransferIn: () => Promise.resolve({ status: 'stall' as const }),
    controlTransferOut: () => Promise.resolve({ status: 'stall' as const, bytesWritten: 0 }),
  } as unknown as NodeUsbDevice;
  return {
    device,
    leave: () => {
      gone = true;
    },
  };
}

/** Grants the bus's device to the page the way a person does: the chooser, then a pick. */
async function grant(bridge: UsbBridge, page: ReturnType<typeof recordingPage>): Promise<void> {
  const reply = page.call({ op: 'requestDevice', filters: [], doc: 'doc-1' });
  const prompt = await bridge.waitForDevicePrompt({ timeout: 5000 });
  const [listed] = prompt.devices;
  if (listed === undefined) throw new Error('the chooser listed nothing');
  await prompt.select(listed);
  expect((await reply).ok).toBe(true);
}

/** Lets the bridge's bus listener run to the end. */
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 50));

describe('the bridge and a device that has left the bus', () => {
  it('sends the page its disconnect through the CLI adapter (node-usb)', async () => {
    const departing = departingDevice();
    const { bus, leave } = oneDeviceBus(fromNodeUsb(departing.device));
    const page = recordingPage();
    const bridge = await UsbBridge.attach(page.page, bus);
    await grant(bridge, page);

    departing.leave();
    leave();
    await settle();

    expect(page.events.map((event) => event.type)).toEqual(['disconnect']);
    /* the adapter answers the configuration it last read, as WebUSB does */
    expect(page.events[0]?.device.configurationValue).toBe(1);
    expect(bridge.timeline.some((line) => line.includes('detached — disconnect event'))).toBe(true);
    bridge.detach();
  });

  it('still sends it when the host stack throws on the departed device', async () => {
    /* Any other stack's device, with no adapter in front: the page hears the
     * camera go regardless. The bridge reads nothing from the departed device:
     * the event carries the configuration as it was, as Chrome keeps it. */
    const departing = departingDevice();
    const raw: WebUsbDevice = departing.device;
    const { bus, leave } = oneDeviceBus(raw);
    const page = recordingPage();
    const bridge = await UsbBridge.attach(page.page, bus);
    await grant(bridge, page);

    departing.leave();
    expect(() => raw.configuration).toThrow(DEPARTED);
    leave();
    await settle();

    expect(page.events.map((event) => event.type)).toEqual(['disconnect']);
    expect(page.events[0]?.device.configurationValue).toBe(1);
    bridge.detach();
  });

  it('reads the configuration where Chrome does, never after a transfer', async () => {
    /* node-usb's getter is a GET_DESCRIPTOR on the control pipe, made on the
     * Node thread: read after every transfer, one of some 33,000 per step 02
     * never returned on the camera, and the worker froze (2026-10-06). */
    let reads = 0;
    const device = {
      ...departingDevice().device,
      get configuration() {
        reads += 1;
        return { configurationValue: 1 };
      },
      controlTransferIn: () =>
        Promise.resolve({ status: 'ok' as const, data: new DataView(new ArrayBuffer(64)) }),
    } as unknown as WebUsbDevice;
    const { bus } = oneDeviceBus(device);
    const page = recordingPage();
    const bridge = await UsbBridge.attach(page.page, bus);
    await grant(bridge, page);
    const call = (request: DeviceCall): Promise<BridgeReply> =>
      page.call({ op: 'call', key: 'cam-0', doc: 'doc-1', ...request });
    expect((await call({ method: 'open' })).ok).toBe(true);
    expect((await call({ method: 'claimInterface', n: 0 })).ok).toBe(true);
    const before = reads;
    const setup = {
      requestType: 'vendor',
      recipient: 'interface',
      request: 0x4f,
      value: 0,
      index: 0,
    } as const;
    for (let i = 0; i < 100; i++) {
      const reply = await call({ method: 'controlTransferIn', setup, length: 64 });
      expect(reply.ok && reply.state?.configurationValue).toBe(1);
    }
    expect(reads - before, 'no configuration read for 100 transfers').toBe(0);
    expect((await call({ method: 'selectConfiguration', n: 1 })).ok).toBe(true);
    expect(reads - before, 'one read for a selectConfiguration').toBe(1);
    bridge.detach();
  });

  it('the camera bus notices a re-enumeration the host sent no event for', async () => {
    /* node-usb hands out a NEW object on every `getDevices()`, so only the
     * `handle` (`DeviceId(<IORegistry id>)`) says which enumeration it is. */
    const enumeration = (id: number): NodeUsbDevice =>
      Object.assign(departingDevice().device, { handle: `DeviceId(${String(id)})` });
    let listedId = 1;
    const host = Object.assign(new EventTarget(), {
      getDevices: () => Promise.resolve([enumeration(listedId)]),
    });
    const lines: string[] = [];
    const bus = await CameraBus.over(host, (line) => lines.push(line));
    const changes: string[] = [];
    bus.subscribe((change) => changes.push(`${change.kind} ${change.device.key}`));
    expect(bus.present().map((d) => d.key)).toEqual(['cam-0']);

    /* the camera reboots: a new registry id, and not one event about it */
    listedId = 2;
    await new Promise((resolve) => setTimeout(resolve, 2500));

    expect(changes).toEqual(['detach cam-0', 'attach cam-1']);
    expect(bus.present().map((d) => d.key)).toEqual(['cam-1']);
    expect(lines.some((line) => line.includes('the registry no longer lists it'))).toBe(true);

    /* a late event for the old enumeration does not unseat the new one */
    const late = Object.assign(new Event('disconnect'), { device: enumeration(1) });
    host.dispatchEvent(late);
    expect(bus.present().map((d) => d.key)).toEqual(['cam-1']);

    /* and an event whose device node-usb will not let anyone read (a transfer
     * on it still pending) is left to the poll, not thrown out of the handler */
    const busy = Object.defineProperty({}, 'vendorId', {
      get: () => {
        throw new Error(
          'The same native value cannot be borrowed mutably while another borrow is active',
        );
      },
    });
    host.dispatchEvent(Object.assign(new Event('disconnect'), { device: busy }));
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(lines.some((line) => line.includes('could not be read'))).toBe(true);
    expect(bus.present().map((d) => d.key)).toEqual(['cam-1']);
    await bus.close();
  });
});
