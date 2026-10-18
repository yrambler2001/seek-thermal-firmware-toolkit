/* ==================================================================== *
 * The frame-rate button on the real camera — `npm run e2e:fps:bench`
 * (`vitest run --config e2e/vitest.config.ts fps-bench.e2e`).
 *
 * One Electron window on the Firmware slots page over real WebUSB, with the real
 * camera (the page guard of `lib/bench/spec-page.ts`, the bench's UI guard). It
 * reads the slots, finds bank A's own "Make N FPS" button, and opens its plan:
 *   - SEEK_E2E_WRITE=dry-run: cancels the plan. Nothing is saved or written.
 *   - SEEK_E2E_WRITE=i-understand: ticks the acknowledgement the plan asks for and
 *     presses "Yes — patch A". The page saves bank A first (raw and decrypted, the
 *     two downloads the plan promises), writes the patched image, and reads it back.
 *     The write budget is opened for that one write and shut again after it. No
 *     reset is sent; the camera is not power-cycled here.
 * Without SEEK_E2E_WRITE the file skips and says why.
 *
 * SEEK_E2E_FPS_BUILD=1.3.0.0 runs it on a Compact 1.3.0.0 (default 4.8.2.1, the Compact XR).
 * The operator restores bank A and power-cycles the camera afterwards (TESTING.md 42.23).
 * ==================================================================== */

import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { ElementHandle } from 'puppeteer-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { say, type Download } from './lib/browser.js';
import { SLOTS_BENCH_UI, benchGuardScript, checkChooserEntry } from './lib/bench/spec-page.js';
import { setGuard } from './lib/electron-camera.js';
import { HEADED } from './lib/spec.js';
import { guardInstalled } from './lib/target-tools.js';
import { approveWrite } from './lib/supervised-write.js';
import { openTarget, wantedTarget, type TargetHandle } from './lib/target.js';
import {
  CONFIRM_DIALOG,
  SLOTS_TABLE_ROWS,
  bankRows,
  outcomeAlert,
  readSlots,
  runAndSettle,
  snap,
} from './lib/slots-page.js';

if (wantedTarget('camera') !== 'camera') {
  throw new Error('fps-bench.e2e drives the real camera: set SEEK_E2E_TARGET=camera');
}

const MODE = process.env.SEEK_E2E_WRITE ?? '';
const SHOT_DIR = process.env.SEEK_E2E_SLOTS_SHOTS ?? null;
const FPS_ACK = '#slot-fps-ack';
/** The dialog's own confirm, as the page names it ("Yes — patch Bank A"). */
const CONFIRM_LABEL = 'Yes — patch Bank A';
/** The patched image is written as one 64 KiB bank, staged in 64-byte chunks (as the page does). */
const BANK_BYTES = 0x10000;
const CHUNK_BYTES = 64;
const CHUNK_SLACK = 64;
/**
 * The build the camera runs, which fixes the image length and the number of bytes the offered patch changes (the
 * dialog's count). 4.8.2.1 (the Compact XR, TESTING.md 42.24): the stock image, 13 bytes. 1.3.0.0 (TESTING.md 42.25):
 * the page's offer from the image that already carries the 16 Hz patch (the mode-8 edit alone, 9 bytes); SEEK_E2E_FPS_PATCH_BYTES
 * says another count (17 from the stock image, whose mode-6 16 Hz edit rides along).
 */
const BUILD = process.env.SEEK_E2E_FPS_BUILD ?? '4.8.2.1';
const BUILDS: Readonly<Record<string, { readonly image: number; readonly patch: number }>> = {
  '4.8.2.1': { image: 42680, patch: 13 },
  '1.3.0.0': { image: 47768, patch: 9 },
};
const BUILD_FACTS = BUILDS[BUILD];
if (BUILD_FACTS === undefined) {
  throw new Error(`fps-bench.e2e knows the builds ${Object.keys(BUILDS).join(', ')}, not ${BUILD}`);
}
const IMAGE_BYTES = BUILD_FACTS.image;
const PATCH_BYTES = Number(process.env.SEEK_E2E_FPS_PATCH_BYTES ?? BUILD_FACTS.patch);

if (MODE !== 'i-understand' && MODE !== 'dry-run') {
  process.stderr.write(
    '\n[skip] fps-bench.e2e: a write needs SEEK_E2E_WRITE=i-understand (or dry-run to stop at the plan)\n',
  );
}

/**
 * Hides the File System Access picker from the page, so it saves the two dumps as downloads (the
 * path the page takes where it has no picker). A picker needs a person to choose a folder; the
 * downloads land in the window's download folder, where the spec reads them.
 */
const HIDE_FILE_PICKER =
  'try { delete globalThis.showSaveFilePicker; } catch (error) { void error; }';

/** The page's stage budget for one write of a bank image: its chunks, plus slack. */
function stagesFor(length: number): number {
  return Math.ceil(Math.max(length, BANK_BYTES) / CHUNK_BYTES) + CHUNK_SLACK;
}

/** Presses the enabled "Make N FPS" button of one bank row, from the page. */
async function pressFpsButton(rows: readonly ElementHandle[], index: number): Promise<void> {
  const row = rows[index];
  if (row === undefined) throw new Error(`the bank table has no row ${String(index)}`);
  const pressed = await row.evaluate((element) => {
    const button = [...element.querySelectorAll<HTMLButtonElement>('button')].find((candidate) =>
      candidate.textContent.trim().startsWith('Make '),
    );
    if (button === undefined || button.disabled) return false;
    button.click();
    return true;
  });
  if (!pressed) throw new Error(`row ${String(index)} has no enabled "Make N FPS" button`);
}

/** The name the page gives a dump saved before a frame-rate patch: raw or decrypted. */
function beforePatchName(kind: 'raw' | 'decrypted'): (name: string) => boolean {
  const pattern = new RegExp(`before-fps-patch-${kind}-[0-9a-f]+\\.bin$`);
  return (name) => pattern.test(name);
}

describe.skipIf(MODE !== 'i-understand' && MODE !== 'dry-run')(
  'the frame-rate button on bank A, on the real camera (Electron)',
  () => {
    const scratch = path.join(
      process.env.SEEK_E2E_SCRATCH ?? path.join(tmpdir(), `seek-e2e-fps-${String(process.pid)}`),
      'fps-bench',
    );
    let target: TargetHandle | null = null;

    /** The open window. The tests run only after `beforeAll` has opened it. */
    function live(): TargetHandle {
      if (target === null) throw new Error('the camera window is not open');
      return target;
    }

    beforeAll(async () => {
      const approval = await approveWrite('camera', () =>
        Promise.resolve({
          describe:
            'Make 32 FPS on bank A: the page saves bank A as stored and decrypted, then writes the patched image (one 64 KiB bank) and reads it back. No reset.',
        }),
      );
      if (MODE === 'i-understand' && !approval.approved) {
        throw new Error(`the write gate refused: ${approval.reason}`);
      }
      mkdirSync(scratch, { recursive: true });
      const opened = await openTarget('camera', {
        scratchDir: scratch,
        source: 'dev',
        uiGuard: SLOTS_BENCH_UI,
        preloadSource: `${benchGuardScript()}\n${HIDE_FILE_PICKER}`,
        headed: HEADED,
      });
      target = opened;
      await opened.wizard.route('#/slots');
      checkChooserEntry(await opened.wizard.connect());
      if (!(await guardInstalled(opened))) throw new Error('the write guard is not in the page');
      const status = await readSlots(opened.wizard, opened.page);
      say(`slots: ${status}`);
      if (!status.startsWith('Read. 3/3')) throw new Error(`Read slots ended "${status}"`);
    }, 15 * 60_000);

    afterAll(async () => {
      if (target !== null) {
        await setGuard(target.page, {
          allowReset: false,
          resetBudget: null,
          stageBudget: 0,
          commitBudget: 0,
          commitSum16: null,
        }).catch(() => undefined);
        await target.close().catch((error: unknown) => {
          say(`close failed: ${String(error)}`);
        });
      }
    });

    it('offers "Make 32 FPS" on bank A and states the plan in its dialog', async () => {
      const handle = live();
      const rows = await bankRows(handle.page);
      const a = rows.find((row) => row.letter === 'a');
      expect(a, 'bank A row').toBeDefined();
      expect(a?.firmware, `bank A holds ${BUILD}`).toContain(BUILD);
      const fps = a?.buttons.filter((button) => button.label.startsWith('Make ')) ?? [];
      expect(
        fps.map((button) => button.label),
        'the frame-rate offer on bank A',
      ).toEqual(['Make 32 FPS']);
      expect(fps[0]?.enabled, 'the offer is on').toBe(true);
      await snap(handle.page, SHOT_DIR, 'fps-bench-before');

      const rowHandles = await handle.page.$$(SLOTS_TABLE_ROWS);
      await pressFpsButton(rowHandles, 0);
      await handle.page.waitForSelector(CONFIRM_DIALOG, { timeout: 10_000 });
      const dialog = await handle.page.$eval(
        CONFIRM_DIALOG,
        (element) => (element as HTMLElement).innerText,
      );
      say(`dialog: ${dialog.replace(/\s+/g, ' ').slice(0, 700)}`);
      expect(dialog, 'the dialog names the rate change').toContain('32 Hz instead of 8 Hz');
      expect(dialog, 'the dialog names the build').toContain(`holds firmware ${BUILD}`);
      expect(dialog, 'the dialog names the bytes').toContain(
        `changes ${String(PATCH_BYTES)} byte(s)`,
      );
      await snap(handle.page, SHOT_DIR, 'fps-bench-dialog');
      if (MODE === 'dry-run') {
        await handle.wizard.click(CONFIRM_DIALOG, 'Cancel');
        say('dry run: the plan is open and cancelled; nothing was saved or written');
      }
    });

    it.skipIf(MODE !== 'i-understand')(
      'saves bank A first, writes the patched image, reads it back, and says so',
      async () => {
        const handle = live();
        const ackShown = (await handle.page.$(FPS_ACK)) !== null;
        if (ackShown) {
          expect(
            await handle.wizard.isEnabled(CONFIRM_DIALOG, CONFIRM_LABEL),
            'Yes is off before the acknowledgement',
          ).toBe(false);
          /* A native checkbox: its change re-renders the dialog, so the confirm is waited for below. */
          await handle.page.$eval(FPS_ACK, (element) => {
            (element as HTMLInputElement).click();
          });
        }
        await handle.page.waitForFunction(
          (sel: string, label: string) => {
            const root = document.querySelector(sel);
            const match = [...(root?.querySelectorAll('button') ?? [])].find(
              (b) => b.textContent.trim() === label,
            );
            return match !== undefined && !match.disabled;
          },
          { timeout: 10_000 },
          CONFIRM_DIALOG,
          CONFIRM_LABEL,
        );
        expect(
          await handle.wizard.isEnabled(CONFIRM_DIALOG, CONFIRM_LABEL),
          `"${CONFIRM_LABEL}" is on`,
        ).toBe(true);

        /* One write of one bank: the stage budget for its chunks, one commit, no reset. */
        await setGuard(handle.page, {
          allowReset: false,
          resetBudget: null,
          stageBudget: stagesFor(IMAGE_BYTES),
          commitBudget: 1,
          commitSum16: null,
        });
        let status: string;
        try {
          status = await runAndSettle(
            handle.wizard,
            handle.page,
            () => handle.wizard.click(CONFIRM_DIALOG, CONFIRM_LABEL),
            /^(Patched|Failed|Cancelled)/,
            30 * 60_000,
          );
        } finally {
          await setGuard(handle.page, {
            allowReset: false,
            resetBudget: null,
            stageBudget: 0,
            commitBudget: 0,
            commitSum16: null,
          }).catch(() => undefined);
        }
        say(`status: ${status}`);
        say(`outcome: ${(await outcomeAlert(handle.page)) ?? '(none)'}`);
        expect(status, 'the patch ends patched, with the read-back as planned').toBe(
          'Patched. Unplug and replug, then read the slots again.',
        );

        /* The two dumps the page saved before the write: bank A as stored, and decrypted. */
        const raw: Download = await handle.downloads.waitFor(
          beforePatchName('raw'),
          60_000,
          'the bank A raw dump, saved before the patch',
        );
        const decrypted: Download = await handle.downloads.waitFor(
          beforePatchName('decrypted'),
          60_000,
          'the bank A decrypted dump, saved before the patch',
        );
        expect(raw.bytes.length, 'the raw dump is the whole bank').toBe(BANK_BYTES);
        expect(decrypted.bytes.length, `the decrypted dump is the ${BUILD} image`).toBe(IMAGE_BYTES);
        await snap(handle.page, SHOT_DIR, 'fps-bench-after');
        say(`saved before the patch: ${raw.path} ; ${decrypted.path}`);
      },
      45 * 60_000,
    );
  },
);
