/**
 * One page, one camera, for the non-slots pages (`pages-emu.e2e.ts`).
 *
 * The app runs in Electron (`ElectronApp`, the same window the real-camera
 * runs use), served from the Vite dev server. Its `navigator.usb` is the
 * bridge's stand-in, served in Node by the FW-V1 emulator booted from the
 * corpus entry named, so nothing here reaches Chromium's real WebUSB and no
 * physical camera. A session with no camera (`entryId: null`) gets an empty
 * bus: the page still has the stand-in, so a Connect that finds nothing is
 * answered by the bridge, not by the Mac's USB stack.
 *
 * The reboot model is `EmulatorBus`'s: a wire reset drops the device and
 * re-enumerates a fresh one that Electron has no grant for.
 */

import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import type { Page } from 'puppeteer-core';

import { EMU_DIR } from '../../packages/core/test/emulator/suite.js';
import { UsbBridge, type BusDevice, type UsbBus, type Verdict } from './bridge.js';
import { say, startDevServer, type DevServer } from './browser.js';
import { CAMERA_NAME } from './camera-flow.js';
import { EmulatorBus } from './emulator-bus.js';
import { ElectronApp } from './electron.js';
import { EVERYTHING, Wizard } from './wizard.js';
import { HEADED } from './spec.js';
import type { TargetHandle } from './target.js';

/** The NOR part's JEDEC id the emulator boots with (as `target.ts` does). */
const JEDEC = '010215';

/** A preload with no write guard: the bridge is the only device this page can reach. */
const NO_GUARD_PRELOAD = '/* pages-emu: the bridge stand-in is the device; no write guard. */\n';
const NO_GUARD_GLOBAL = '__pagesNoGuard';

/** A bus with no device on it: the page's Connect finds nothing, and nothing real is touched. */
class EmptyBus implements UsbBus {
  readonly name = 'empty';
  readonly hostTimeoutMs = 60_000;
  present(): readonly BusDevice[] {
    return [];
  }
  subscribe(): () => void {
    return () => undefined;
  }
  check(): Verdict {
    return { kind: 'forward' };
  }
  close(): Promise<void> {
    return Promise.resolve();
  }
}

export interface PagesCamera {
  /** The name for the log and the test titles. */
  readonly label: string;
  /** The corpus entry the emulator boots, or null for no camera at all. */
  readonly entryId: string | null;
}

/** A page with the app open on it, and whatever stands in for its camera. */
export interface PagesSession {
  readonly label: string;
  /** The same session as a `TargetHandle` (the emulator target's shape), for the shared helpers. */
  readonly target: TargetHandle;
  readonly app: ElectronApp;
  readonly page: Page;
  readonly wizard: Wizard;
  readonly bridge: UsbBridge;
  /** The emulator bus, or null for a session with no camera. */
  readonly emu: EmulatorBus | null;
  readonly serverUrl: string;
  /** The requests that went out to the device, `in 0x4f`-style keys (all of them since the session opened). */
  wire(): Promise<Map<string, number>>;
  /** Every request the bridge refused. A passing run has none. */
  refusals(): Promise<string[]>;
  /** The emulator's as-booted flash file, read before anything is written (null with no camera). */
  asBootedFlash(): Uint8Array | null;
  /** Reloads the page: the app starts again, with the bridge in place. */
  reload(): Promise<void>;
  close(): Promise<void>;
}

export interface OpenPagesOptions {
  readonly scratchDir: string;
  /** The hash the page opens on. */
  readonly route?: string;
}

/**
 * Opens the app in Electron on `camera` (or on no camera), with the bridge
 * attached before the page's first script runs (a reload after the attach).
 */
export async function openPagesSession(
  camera: PagesCamera,
  options: OpenPagesOptions,
): Promise<PagesSession> {
  mkdirSync(options.scratchDir, { recursive: true });
  let emu: EmulatorBus | null = null;
  let bus: UsbBus = new EmptyBus();
  if (camera.entryId !== null) {
    if (EMU_DIR === null) throw new Error('no FW-V1 emulator found (set SEEK_EMU_DIR)');
    emu = await EmulatorBus.start({
      emuDir: EMU_DIR,
      entryId: camera.entryId,
      jedec: JEDEC,
      scratchDir: path.join(options.scratchDir, 'flash'),
      log: say,
    });
    bus = emu;
  }
  let server: DevServer | null = null;
  let app: ElectronApp | null = null;
  try {
    server = await startDevServer();
    const route = options.route ?? '#/';
    app = await ElectronApp.launch({
      scratchDir: options.scratchDir,
      url: `${server.url}${route}`,
      preloadSource: NO_GUARD_PRELOAD,
      guardGlobal: NO_GUARD_GLOBAL,
      headed: HEADED,
    });
    const page = app.page;
    page.on('pageerror', (error) => {
      say(`page error (${camera.label}): ${String(error)}`);
    });
    const bridge = await UsbBridge.attach(page, bus, { log: say });
    await page.reload({ waitUntil: 'networkidle0' });
    const wizard = new Wizard({
      page,
      prompter: bridge,
      downloads: app,
      guard: EVERYTHING,
      camera: CAMERA_NAME,
    });
    const theApp = app;
    const theServer = server;
    const theEmu = emu;
    const target: TargetHandle = {
      name: 'emu',
      page,
      wizard,
      downloads: theApp,
      prompter: bridge,
      serverUrl: theServer.url,
      httpRequests: [],
      emu,
      app: theApp,
      writesSafe: true,
      setOffline: (on) => page.setOfflineMode(on),
      reload: async () => {
        await page.reload({ waitUntil: 'networkidle0' });
      },
      close: () => Promise.resolve(),
    };
    return {
      label: camera.label,
      target,
      app: theApp,
      page,
      wizard,
      bridge,
      emu,
      serverUrl: theServer.url,
      wire: () => Promise.resolve(new Map(bridge.counts)),
      refusals: async () => [...bridge.refusals, ...(await bridge.pageRefusals())],
      asBootedFlash: () => {
        const boot = theEmu?.bootImages()[0];
        return boot === undefined ? null : new Uint8Array(readFileSync(boot.flashOut));
      },
      reload: async () => {
        await page.reload({ waitUntil: 'networkidle0' });
      },
      close: async () => {
        bridge.detach();
        await theApp.close();
        await theServer.close();
        await emu?.close();
      },
    };
  } catch (error) {
    await app?.close().catch(() => undefined);
    await server?.close();
    await emu?.close();
    throw error;
  }
}
