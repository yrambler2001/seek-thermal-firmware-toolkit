/**
 * ONE test body, EITHER target. A target is the app in a real browser in front
 * of a real-enough camera:
 *
 *   emu     Google Chrome (puppeteer-core), `navigator.usb` replaced by the
 *           bridge stand-in, served in Node by the FW-V1 emulator, booted from
 *           the bench Compact 1.3.0.0 or from `SEEK_E2E_EMU_FLASH`. Writes and
 *           steps 03/04 are fine here — that is what the emulator is for.
 *   camera  Electron, Chromium's own WebUSB on the real macOS USB stack, with
 *           the page-side write guard. READ-ONLY unless a run passes through the
 *           camera write gate (`supervised-write.ts`); this module never
 *           lifts the guard on its own.
 *
 * `SEEK_E2E_TARGET` (or a spec's own default) picks one; `emu` is the default
 * everywhere. Both targets expose the same `page`, `wizard`, `downloads` and
 * `prompter`, so a spec written against `TargetHandle` runs on either. The page
 * can be served from the Vite dev server (`source: 'dev'`, the default) or the
 * hosted `docs/` bundle over plain HTTP (`source: 'docs'`).
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import type { Page } from 'puppeteer-core';

import { EMU_DIR } from '../../packages/core/test/emulator/suite.js';
import { UsbBridge } from './bridge.js';
import {
  CHROME_PATH,
  REPO_ROOT,
  launchChrome,
  say,
  startDevServer,
  startStaticServer,
  type DevServer,
  type DownloadWaiter,
  type LaunchedChrome,
} from './browser.js';
import type { DevicePrompter } from './bridge.js';
import { CAMERA_NAME, WRITE_GUARD_GLOBAL, writeGuardScript } from './camera-flow.js';
import { EmulatorBus } from './emulator-bus.js';
import { ElectronApp, electronBinary } from './electron.js';
import { cameraBusyReason } from './preflight.js';
import { EVERYTHING, READ_ONLY_CAMERA, Wizard, type UiGuard } from './wizard.js';

export type TargetName = 'emu' | 'camera';

const CORPUS_ENTRY = '101310HSNEA2/dump';
const JEDEC = '010215';

/**
 * The part the emulator target boots: the corpus entry (the bench Compact
 * 1.3.0.0), or the 4 MiB flash file `SEEK_E2E_EMU_FLASH` names (a J-Link
 * dump, booted on the emulator's default board) — as `emulator.e2e.ts` does.
 * `asBooted` is that flash's sha256, which the expectation table
 * (`preserve-expectations.ts`) knows a part by; '' for the corpus entry.
 */
export const EMU_FLASH = process.env.SEEK_E2E_EMU_FLASH ?? '';

let emuFlashSha: string | null = null;

export function emuFlashAsBooted(): string {
  if (EMU_FLASH === '' || !existsSync(EMU_FLASH)) return '';
  emuFlashSha ??= createHash('sha256').update(readFileSync(EMU_FLASH)).digest('hex');
  return emuFlashSha;
}

/** What `SEEK_E2E_TARGET` says, or `fallback` (default `emu`). */
export function wantedTarget(fallback: TargetName = 'emu'): TargetName {
  const value = process.env.SEEK_E2E_TARGET;
  if (value === 'camera' || value === 'emu') return value;
  if (value !== undefined && value !== '') {
    throw new Error(`SEEK_E2E_TARGET=${value} — use 'emu' or 'camera'`);
  }
  return fallback;
}

/** Why `target` cannot run here, or null when it can. */
export function targetUnavailable(target: TargetName): string | null {
  if (target === 'emu') {
    if (EMU_DIR === null) return 'no FW-V1 emulator found (set SEEK_EMU_DIR)';
    if (EMU_FLASH !== '' && !existsSync(EMU_FLASH)) return `no part at ${EMU_FLASH}`;
    if (!existsSync(CHROME_PATH)) return `no Chrome at ${CHROME_PATH} (set SEEK_E2E_CHROME)`;
    return null;
  }
  if (electronBinary() === null) return 'the electron package is not installed';
  return cameraBusyReason();
}

export interface OpenTargetOptions {
  readonly scratchDir: string;
  /** The page to open: the Vite dev server, or the hosted `docs/` bundle. */
  readonly source?: 'dev' | 'docs';
  readonly headed?: boolean;
  /**
   * The UI guard the wizard runs under. The default is the target's safe one
   * (everything on the emulator, read-only on the camera). A camera write
   * run passes `EVERYTHING` for the camera — only `supervised-write.ts` does.
   */
  readonly uiGuard?: UiGuard;
  /**
   * Camera target only: the Electron preload source. Defaults to the strict
   * read-only write guard. A camera write run (only after the gate)
   * passes the lifted guard here. Ignored on the emulator target.
   */
  readonly preloadSource?: string;
  /**
   * Camera target, dev source only: the window uses this process's shared dev server
   * (`sharedDevServer`), and closing the window leaves that server running. Its owner
   * stops the server with `closeSharedDevServer` when the run is over (TESTING.md 42.45).
   */
  readonly sharedServer?: boolean;
}

/**
 * One dev server per process, for the windows that ask to share it. After `close()` a Vite 8
 * dev server's module graph stays reachable (a V8 global handle keeps its bundler callbacks
 * alive), so a server per window kept about 25 MB per window in the worker (TESTING.md 42.45).
 */
let sharedServer: Promise<DevServer> | null = null;

export function sharedDevServer(): Promise<DevServer> {
  if (sharedServer === null) {
    const started = startDevServer();
    sharedServer = started;
    started.catch(() => {
      if (sharedServer === started) sharedServer = null;
    });
  }
  return sharedServer;
}

/** Stops the shared dev server, if one was started. Safe to call more than once. */
export async function closeSharedDevServer(): Promise<void> {
  const pending = sharedServer;
  sharedServer = null;
  if (pending === null) return;
  /* A start that failed has nothing to close; its error went to the window that asked. */
  const server = await pending.catch(() => null);
  await server?.close();
}

export interface TargetHandle {
  readonly name: TargetName;
  readonly page: Page;
  readonly wizard: Wizard;
  readonly downloads: DownloadWaiter;
  readonly prompter: DevicePrompter;
  readonly serverUrl: string;
  /** Any network path the page requested, when served from `docs/` (else empty). */
  readonly httpRequests: readonly string[];
  /** The emulator bus (emu target only) — stop it to model an unplug, etc. */
  readonly emu: EmulatorBus | null;
  /** The Electron app (camera target only). */
  readonly app: ElectronApp | null;
  /** Chrome's WebUSB has no serial-number grant to drop; the camera's does. */
  readonly writesSafe: boolean;
  setOffline(on: boolean): Promise<void>;
  reload(): Promise<void>;
  close(): Promise<void>;
}

export async function openTarget(
  target: TargetName,
  options: OpenTargetOptions,
): Promise<TargetHandle> {
  const reason = targetUnavailable(target);
  if (reason !== null) throw new Error(`cannot open the ${target} target: ${reason}`);
  return target === 'emu' ? openEmu(options) : openCamera(options);
}

async function startSource(
  source: 'dev' | 'docs',
  shared = false,
): Promise<{ server: DevServer; url: string; requests: readonly string[] }> {
  if (source === 'docs') {
    const server = await startStaticServer(path.join(REPO_ROOT, 'docs'));
    return { server, url: server.url, requests: server.requests };
  }
  if (shared) {
    const server = await sharedDevServer();
    /* This window's close leaves the shared server to its owner. */
    return {
      server: { url: server.url, close: () => Promise.resolve() },
      url: server.url,
      requests: [],
    };
  }
  const server = await startDevServer();
  return { server, url: server.url, requests: [] };
}

async function openEmu(options: OpenTargetOptions): Promise<TargetHandle> {
  const source = options.source ?? 'dev';
  const bus = await EmulatorBus.start({
    emuDir: EMU_DIR ?? '',
    entryId: CORPUS_ENTRY,
    ...(EMU_FLASH === '' ? {} : { flash: EMU_FLASH }),
    jedec: JEDEC,
    scratchDir: path.join(options.scratchDir, 'flash'),
    log: say,
  });
  let server: DevServer | null = null;
  let chrome: LaunchedChrome | null = null;
  try {
    const started = await startSource(source);
    server = started.server;
    chrome = await launchChrome({ scratchDir: options.scratchDir, headless: !options.headed });
    const page = await chrome.browser.newPage();
    page.on('pageerror', (error) => {
      say(`page error: ${String(error)}`);
    });
    const bridge = await UsbBridge.attach(page, bus, { log: say });
    await page.goto(`${started.url}#/`, { waitUntil: 'networkidle0' });
    const wizard = new Wizard({
      page,
      prompter: bridge,
      downloads: chrome.downloads,
      guard: options.uiGuard ?? EVERYTHING,
      camera: CAMERA_NAME,
    });
    const theChrome = chrome;
    const theServer = server;
    return {
      name: 'emu',
      page,
      wizard,
      downloads: theChrome.downloads,
      prompter: bridge,
      serverUrl: started.url,
      httpRequests: started.requests,
      emu: bus,
      app: null,
      writesSafe: true,
      setOffline: (on) => page.setOfflineMode(on),
      reload: async () => {
        await page.reload({ waitUntil: 'networkidle0' });
      },
      close: async () => {
        bridge.detach();
        await theChrome.close();
        await theServer.close();
        await bus.close();
      },
    };
  } catch (error) {
    await chrome?.close();
    await server?.close();
    await bus.close();
    throw error;
  }
}

async function openCamera(options: OpenTargetOptions): Promise<TargetHandle> {
  const source = options.source ?? 'dev';
  const started = await startSource(source, options.sharedServer === true);
  try {
    const app = await ElectronApp.launch({
      scratchDir: options.scratchDir,
      url: `${started.url}#/`,
      preloadSource: options.preloadSource ?? writeGuardScript(),
      guardGlobal: WRITE_GUARD_GLOBAL,
      headed: options.headed ?? false,
    });
    app.page.on('pageerror', (error) => {
      say(`page error: ${String(error)}`);
    });
    const wizard = new Wizard({
      page: app.page,
      prompter: app,
      downloads: app,
      guard: options.uiGuard ?? READ_ONLY_CAMERA,
      camera: CAMERA_NAME,
    });
    return {
      name: 'camera',
      page: app.page,
      wizard,
      downloads: app,
      prompter: app,
      serverUrl: started.url,
      httpRequests: started.requests,
      emu: null,
      app,
      writesSafe: false,
      setOffline: (on) => app.page.setOfflineMode(on),
      reload: async () => {
        await app.page.reload({ waitUntil: 'networkidle0' });
      },
      close: async () => {
        await app.close();
        await started.server.close();
      },
    };
  } catch (error) {
    await started.server.close();
    throw error;
  }
}
