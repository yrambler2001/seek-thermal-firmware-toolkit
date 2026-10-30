/* ==================================================================== *
 * Phone-width layout — `npm run e2e:phone`.
 *
 * 375x812 with touch, light and dark, screenshots of the states a phone user
 * sees: the Dump page, the Preserve start, a run resumed at step 03, and the
 * "Verified — a perfect match." summary (rendered from a crafted done-state run
 * file, so no hardware is needed). Each state must have no horizontal overflow,
 * and the masthead title must not be clipped by the header controls. The page
 * must follow the emulated system's theme, and the header's light/dark switch
 * must override it in the real stylesheet and hand it back.
 *
 * No camera, no emulator: the page alone, in Chrome.
 * ==================================================================== */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  CHROME_PATH,
  launchChrome,
  say,
  startDevServer,
  type DevServer,
  type LaunchedChrome,
} from './lib/browser.js';
import { runFileZip, verifiedRunState } from './lib/run-files.js';
import { EVERYTHING, Wizard } from './lib/wizard.js';
import type { DevicePrompter } from './lib/bridge.js';
import type { Download, DownloadWaiter } from './lib/browser.js';
import { existsSync } from 'node:fs';

const KEEP = process.env.SEEK_E2E_KEEP === '1';
/** The header's light/dark switch, and where it keeps a choice (packages/web/src/lib/theme.ts). */
const THEME_SWITCH = 'header button[aria-pressed]';
const THEME_KEY = 'seek-fw:theme';
const SCRATCH =
  process.env.SEEK_E2E_SCRATCH ?? path.join(tmpdir(), `seek-e2e-phone-${String(process.pid)}`);
const SHOTS = process.env.SEEK_E2E_SHOTS ?? path.join(SCRATCH, 'screenshots');

const unavailable = existsSync(CHROME_PATH) ? null : `no Chrome at ${CHROME_PATH}`;
if (unavailable !== null) process.stderr.write(`\n[skip] phone layout: ${unavailable}\n`);

const noPrompter: DevicePrompter = {
  waitForDevicePrompt: () => Promise.reject(new Error('no device on the phone-layout run')),
};
const noDownloads: DownloadWaiter = {
  waitFor: (): Promise<Download> =>
    Promise.reject(new Error('no downloads on the phone-layout run')),
  names: () => [],
};

describe.skipIf(unavailable !== null)('phone-width layout (375x812)', () => {
  let server: DevServer | null = null;
  let chrome: LaunchedChrome | null = null;
  const shots: string[] = [];

  beforeAll(async () => {
    mkdirSync(SHOTS, { recursive: true });
    server = await startDevServer();
    chrome = await launchChrome({ scratchDir: SCRATCH, headless: true });
  });

  afterAll(async () => {
    await chrome?.close();
    await server?.close();
    say(`screenshots (${String(shots.length)}):\n  ${shots.join('\n  ')}`);
    if (!KEEP && SHOTS.startsWith(SCRATCH)) rmSync(SCRATCH, { recursive: true, force: true });
  });

  it('renders every state at phone width with no horizontal overflow, light and dark', async () => {
    const srv = server;
    const ch = chrome;
    if (srv === null || ch === null) throw new Error('setup failed');
    const runFile = path.join(SCRATCH, 'verified-sample.zip');
    writeFileSync(runFile, runFileZip(verifiedRunState()));

    for (const theme of ['light', 'dark'] as const) {
      const page = await ch.browser.newPage();
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
      await page.setViewport({
        width: 375,
        height: 812,
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      });
      const wizard = new Wizard({
        page,
        prompter: noPrompter,
        downloads: noDownloads,
        guard: EVERYTHING,
        camera: /PIR206/i,
      });

      const shoot = async (name: string): Promise<void> => {
        const overflow = await page.evaluate((switchSelector: string) => {
          const doc = document.scrollingElement ?? document.documentElement;
          const wide = [...document.querySelectorAll<HTMLElement>('body *')]
            .filter((el) => el.getBoundingClientRect().width > window.innerWidth + 1)
            .map((el) => `${el.tagName.toLowerCase()}#${el.id || '?'}`);
          const title = document.querySelector<HTMLElement>('h1, [class*="masthead"] a, header a');
          return {
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            wide: [...new Set(wide)].slice(0, 6),
            titleClipped: title !== null && title.scrollWidth > title.clientWidth + 1,
            theme: document.documentElement.dataset.theme,
            switchPressed:
              document.querySelector(switchSelector)?.getAttribute('aria-pressed') ?? 'no switch',
          };
        }, THEME_SWITCH);
        const file = path.join(SHOTS, `${name}-${theme}.png`);
        await page.screenshot({ path: file, fullPage: true });
        shots.push(file);
        say(
          `${name} (${theme}): ${String(overflow.scrollWidth)}x vs ${String(overflow.clientWidth)} client; wide=[${overflow.wide.join(', ')}]`,
        );
        expect(
          overflow.scrollWidth,
          `${name} (${theme}) overflows horizontally`,
        ).toBeLessThanOrEqual(overflow.clientWidth + 1);
        expect(overflow.titleClipped, `${name} (${theme}) title is clipped`).toBe(false);
        expect(overflow.theme, `${name} does not follow the ${theme} system`).toBe(theme);
        expect(overflow.switchPressed).toBe(String(theme === 'dark'));
      };

      await page.goto(`${srv.url}#/v4`, { waitUntil: 'networkidle0' });
      await shoot('01-dump');
      await page.goto(`${srv.url}#/preserve`, { waitUntil: 'networkidle0' });
      await shoot('02-preserve-start');
      await wizard.loadRunFile(runFile);
      await shoot('03-verify-summary');

      /* The switch overrides the system in the real stylesheet (the page's own colour
       * changes, not only the attribute) and keeps the choice; the second press lands on
       * the system's theme again, which forgets it. */
      const look = (): Promise<{
        theme: string | undefined;
        background: string;
        kept: string | null;
      }> =>
        page.evaluate((key: string) => {
          const kept = ((): string | null => {
            try {
              return localStorage.getItem(key);
            } catch {
              return 'storage threw';
            }
          })();
          return {
            theme: document.documentElement.dataset.theme,
            background: getComputedStyle(document.body).backgroundColor,
            kept,
          };
        }, THEME_KEY);
      const before = await look();
      await page.click(THEME_SWITCH);
      const flipped = await look();
      const other = theme === 'light' ? 'dark' : 'light';
      expect(flipped.theme).toBe(other);
      expect(flipped.kept).toBe(other);
      expect(flipped.background, 'the switch did not change the page colours').not.toBe(
        before.background,
      );
      await page.click(THEME_SWITCH);
      expect(await look()).toEqual(before);
      await page.close();
    }
    expect(shots.length).toBe(6);
  });
});
