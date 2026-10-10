/**
 * One emulated camera for the Firmware slots page, behind a Chrome of its own.
 *
 * `target.ts` boots one corpus entry (the bench Compact 1.3.0.0) and has no way
 * to name another, and the slots page is checked on several builds: a modern
 * Compact, the bench 1.3.0.0, and a build older than 0.8.0.0. So this opens the
 * same stack as `target.ts`'s emulator target (the FW-V1 emulator on the bus,
 * the bridge stand-in in Chrome, the page on the Vite dev server) for the entry
 * it is given. Emulator only: nothing here can reach a real camera.
 */

import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { EMU_DIR, ENTRIES } from '../../packages/core/test/emulator/suite.js';
import { UsbBridge } from './bridge.js';
import {
  launchChrome,
  say,
  startDevServer,
  type DevServer,
  type LaunchedChrome,
} from './browser.js';
import { CAMERA_NAME } from './camera-flow.js';
import { EmulatorBus } from './emulator-bus.js';
import { HEADED } from './spec.js';
import type { TargetHandle } from './target.js';
import { EVERYTHING, Wizard } from './wizard.js';

/** The NOR part's JEDEC id the emulator boots with (as `target.ts` does). */
const JEDEC = '010215';

/** Where a bank starts on the emulated part: the flash window is at 0x14000000. */
export const FLASH_BASE = 0x14000000;

export interface SlotsCamera {
  /** The name for the log and the test titles. */
  readonly label: string;
  /** The corpus entry the emulator boots (its full id, from the manifest). */
  readonly entryId: string;
}

/**
 * The manifest entry whose id starts with `prefix` and is of `kind`. The
 * manifest names every entry by its own path, so a prefix is how a spec says
 * which firmware it means without copying a long id. Null when the emulator
 * has no such entry.
 */
export function corpusEntryId(prefix: string, kind: 'full-dump' | 'image-only'): string | null {
  const found = ENTRIES.find(
    (entry) => entry.kind === kind && entry.id.startsWith(prefix) && !entry.id.endsWith('_trimmed'),
  );
  return found?.id ?? null;
}

export interface OpenSlotsCameraOptions {
  readonly scratchDir: string;
}

/**
 * Boots `camera` on the emulator and opens the page on it, in Chrome, with the
 * bridge attached. The returned handle is a `TargetHandle` (name 'emu'), so the
 * shared helpers (`wireOf`, `refusalsOf`) read its bridge the same way.
 */
export async function openSlotsCamera(
  camera: SlotsCamera,
  options: OpenSlotsCameraOptions,
): Promise<TargetHandle> {
  if (EMU_DIR === null) throw new Error('no FW-V1 emulator found (set SEEK_EMU_DIR)');
  mkdirSync(options.scratchDir, { recursive: true });
  const bus = await EmulatorBus.start({
    emuDir: EMU_DIR,
    entryId: camera.entryId,
    jedec: JEDEC,
    scratchDir: path.join(options.scratchDir, 'flash'),
    log: say,
  });
  let server: DevServer | null = null;
  let chrome: LaunchedChrome | null = null;
  try {
    server = await startDevServer();
    chrome = await launchChrome({ scratchDir: options.scratchDir, headless: !HEADED });
    const page = await chrome.browser.newPage();
    page.on('pageerror', (error) => {
      say(`page error (${camera.label}): ${String(error)}`);
    });
    const bridge = await UsbBridge.attach(page, bus, { log: say });
    await page.goto(`${server.url}#/`, { waitUntil: 'networkidle0' });
    const wizard = new Wizard({
      page,
      prompter: bridge,
      downloads: chrome.downloads,
      guard: EVERYTHING,
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
      serverUrl: server.url,
      httpRequests: [],
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

/**
 * The bytes the emulator holds at `address`, from the flash file its first boot
 * wrote (`--flash-out`, before a client can read a byte of it). Read before any
 * write: a later stop would replace the picture with the post-write flash.
 */
export function emulatorBankBytes(bus: EmulatorBus, address: number, length: number): Uint8Array {
  const boot = bus.bootImages()[0];
  if (boot === undefined) throw new Error('the emulator has not booted');
  const flash = readFileSync(boot.flashOut);
  const offset = address - FLASH_BASE;
  return flash.subarray(offset, offset + length);
}
