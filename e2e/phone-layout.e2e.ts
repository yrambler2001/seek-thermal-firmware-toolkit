/* ==================================================================== *
 * Phone-width layout — `npm run e2e:phone`.
 *
 * 375x812 with touch, light and dark, screenshots of the states a phone user
 * sees: the Dump page, the Preserve start, a run resumed at step 03, and the
 * "Verified — a perfect match." summary (rendered from a crafted done-state run
 * file, so no hardware is needed). Each state must have no horizontal overflow,
 * and the masthead title must not be clipped by the header controls.
 *
 * No camera, no emulator: the page alone, in Chrome.
 * ==================================================================== */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { buildZip } from '@seek-fw/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  CHROME_PATH,
  launchChrome,
  say,
  startDevServer,
  type DevServer,
  type LaunchedChrome,
} from './lib/browser.js';
import { EVERYTHING, Wizard } from './lib/wizard.js';
import type { DevicePrompter } from './lib/bridge.js';
import type { Download, DownloadWaiter } from './lib/browser.js';
import { existsSync } from 'node:fs';
import type { PreserveRunState } from '@seek-fw/core';

const KEEP = process.env.SEEK_E2E_KEEP === '1';
const SCRATCH =
  process.env.SEEK_E2E_SCRATCH ?? path.join(tmpdir(), `seek-e2e-phone-${String(process.pid)}`);
const SHOTS = process.env.SEEK_E2E_SHOTS ?? path.join(SCRATCH, 'screenshots');

const unavailable = existsSync(CHROME_PATH) ? null : `no Chrome at ${CHROME_PATH}`;
if (unavailable !== null) process.stderr.write(`\n[skip] phone layout: ${unavailable}\n`);

/** A run file the page reads as a finished, verified run — no binaries needed. */
function verifiedRun(): Uint8Array {
  const erased = (key: 'b' | 'r', address: number, mode: number) => ({
    key,
    address,
    mode,
    holds: 'erased' as const,
    refused: 'it is erased: every byte reads 0xFF, so it holds no image',
  });
  const state: PreserveRunState = {
    version: 3,
    runId: 'preserve-phone-sample',
    createdAt: '2026-10-05T00:00:00.000Z',
    nextStep: 'done',
    choice: 'next-start',
    targets: ['a'],
    anchor: 'a',
    boot: {
      cfgHex: 'ffffffff',
      word: 0xffffffff,
      rule: 'slot A first, then B, then recovery R',
      activeSlotWord: 0,
      entered: 'a',
      verdicts: { a: true, b: false, r: false },
      nextStart: 'a',
      why: 'the boot-config word 0xFFFFFFFF tries slot A first, and slot A passes its check',
      checkKeyUnnamed: null,
    },
    banks: {
      a: {
        key: 'a',
        address: 0x14050000,
        mode: 7,
        holds: 'image',
        refused: null,
        slotReadShas: ['983a7010' + '0'.repeat(56), '983a7010' + '0'.repeat(56)],
        imageSha256: '8473b5e4' + '0'.repeat(56),
        buildId: 'compact-1.3.0.0',
        buildLabel: 'Compact 1.3.0.0',
        patch: {
          sites: [
            { name: 'reader widen', offset: 0x3c1c, before: [0x00, 0x30], after: [0x00, 0x50] },
          ],
          rebalanceWord: 0x50c06240,
          stagedLength: 47768,
          chunkCount: 747,
          patchedSha256: '8473b5e4' + '0'.repeat(56),
          diffCount: 13,
          armResetsCursor: true,
        },
      },
      b: erased('b', 0x14060000, 8),
      r: erased('r', 0x14070000, 9),
    },
    buildStorage: 'v1-2014',
    buildId: 'compact-1.3.0.0',
    buildLabel: 'Compact 1.3.0.0',
    expectedVersion: '1.3.0.0',
    deliveredSha256: '40447c7e' + '0'.repeat(56),
    rawDumpSha256: 'b22e9e20' + '0'.repeat(56),
    stagedForm: 'plain',
    restoreForm: 'capture-verbatim',
    capability: { wholePart: true, losslessReadUnit: 64, note: 'one widened-window arm' },
    drainEntered: 'a',
    verify: { diffBytes: 0, windowsRead: 31, badWindows: [] },
    steps: {
      backup: { status: 'done', notes: 'backup' },
      patch: { status: 'done', notes: 'patch' },
      commit: { status: 'done', notes: 'commit' },
      drain: { status: 'done', notes: 'drain' },
      restore: { status: 'done', notes: 'restore' },
      verify: { status: 'done', notes: '31/31 windows re-read at 0 differing bytes' },
    },
  };
  return buildZip([
    { name: 'preserve_run.json', data: new TextEncoder().encode(JSON.stringify(state, null, 2)) },
    { name: 'README.md', data: new TextEncoder().encode('# sample run\n') },
  ]);
}

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
    writeFileSync(runFile, verifiedRun());

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
        const overflow = await page.evaluate(() => {
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
          };
        });
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
      };

      await page.goto(`${srv.url}#/v4`, { waitUntil: 'networkidle0' });
      await shoot('01-dump');
      await page.goto(`${srv.url}#/preserve`, { waitUntil: 'networkidle0' });
      await shoot('02-preserve-start');
      await wizard.loadRunFile(runFile);
      await shoot('03-verify-summary');
      await page.close();
    }
    expect(shots.length).toBe(6);
  });
});
