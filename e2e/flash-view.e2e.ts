/* ==================================================================== *
 * The Flash view — `npm run e2e:flash` (emu by default; camera with
 * SEEK_E2E_TARGET=camera, READ-ONLY).
 *
 * On the camera the view's READ is covered and nothing else: "Read device
 * info" — the version, the bootloader, the slots and their verdicts, and why
 * the camera may or may not be flashed. That read sends two RAM selectors the
 * dump never does (SetFirmwareInfoFeatures for the firmware-info records,
 * SetRamDataFeatures for the device-id block; the CLI's `info` sends both), so
 * the page's write guard is the strict one plus exactly those two, by payload
 * shape (`DEVICE_INFO_GUARD`). SetFeaturedFirmwareData, CompleteMemoryUpgrade
 * and every reset stay refused unsent, and the UI guard (`FLASH_VIEW_READ_ONLY`)
 * refuses the image picker, the write and its confirmation. The second test,
 * the write, returns at once on the camera.
 *
 * 1. Against a real emulated device it reads the running firmware (1.3.0.0),
 *    reports the slots, finds the build flashable, and offers the "Choose
 *    plaintext image…" write path with its red "this writes to the camera's
 *    flash" warning. On the camera it reads what the camera runs and checks
 *    that the read is honest about it (see the test).
 * 2. A REAL flash and boot, on the emulator: the camera's own plaintext (the
 *    active slot as Dump & decrypt delivers it — the bench part is the 2014
 *    plaintext chain, so no key-named file is needed) is picked, written to
 *    the upgrade-target slot through the view's own "Write to camera" and its
 *    confirmation, the cable is pulled and put back (a fresh emulator booted
 *    from the flash the write left), and "Read device info" must then report
 *    the same firmware version running from the slot that was written.
 * ==================================================================== */

import { writeFileSync } from 'node:fs';
import path from 'node:path';

import type { Page } from 'puppeteer-core';
import { expect, it } from 'vitest';

import { say } from './lib/browser.js';
import { CAMERA_VERSION, writeGuardScript } from './lib/camera-flow.js';
import { describeWire, sha256 } from './lib/checks.js';
import { guardOf } from './lib/electron-camera.js';
import { targetSpec } from './lib/spec.js';
import { BENCH_PLAIN_SHA, refusalsOf, wireOf } from './lib/target-tools.js';
import { wantedTarget } from './lib/target.js';
import { FLASH_VIEW_READ_ONLY, type Wizard } from './lib/wizard.js';

const FW_SECTION = 'section[aria-labelledby="fw-heading"]';
const WRITE_SECTION = 'section[aria-labelledby="write-heading"]';

interface InfoView {
  readonly status: string;
  readonly version: string;
  readonly booted: string;
  readonly target: string;
}

/** Presses "Read device info" and waits for it to settle; returns the panel's key rows. */
async function readDeviceInfo(w: Wizard, page: Page): Promise<InfoView> {
  /* Until the read starts, the line still shows the last one's "Read." */
  const started = await w.watchStatus('#fwinfo-status');
  await w.click(FW_SECTION, 'Read device info');
  await started();
  /* Settled means the line reads an outcome AND the run is over (its Cancel
   * is disabled again): a read whose slots name another family is redone under
   * it, and the first read's own "Read, …" line shows in between. */
  await page.waitForFunction(
    (sel: string) => {
      const s = document.querySelector<HTMLElement>('#fwinfo-status')?.innerText ?? '';
      const cancel = [...(document.querySelector(sel)?.querySelectorAll('button') ?? [])].find(
        (b) => b.textContent.trim() === 'Cancel',
      );
      const outcome =
        (s.startsWith('Read') && !s.startsWith('Reading')) || /^(Refused|Failed)/.test(s);
      return outcome && cancel?.disabled !== false;
    },
    { timeout: 5 * 60_000, polling: 500 },
    FW_SECTION,
  );
  const rows = await page.evaluate((sel: string) => {
    const out: Record<string, string> = {};
    for (const dt of document.querySelectorAll(`${sel} dt`)) {
      /* The first panel is the running firmware's; later ones (the slots) may reuse a label. */
      const key = (dt as HTMLElement).innerText.trim().toLowerCase();
      const dd = dt.nextElementSibling as HTMLElement | null;
      if (!(key in out)) out[key] = dd?.innerText.trim() ?? '';
    }
    return out;
  }, FW_SECTION);
  return {
    status: await w.text('#fwinfo-status'),
    version: rows.version ?? '',
    booted: rows['booted from'] ?? '',
    target: rows['upgrade target'] ?? '',
  };
}

const ON_CAMERA = wantedTarget() === 'camera';

targetSpec(
  {
    title: 'the Flash view',
    slug: 'flash-view',
    ...(ON_CAMERA
      ? { uiGuard: FLASH_VIEW_READ_ONLY, preloadSource: writeGuardScript({ deviceInfo: true }) }
      : {}),
  },
  (ctx) => {
    it('reads the running firmware and offers the write path', async () => {
      const t = ctx.target();
      if (t.emu === null) {
        await readOnCamera(ctx.target());
        return;
      }
      const w = t.wizard;
      await w.connect();
      await w.route('#/flash');
      const info = await readDeviceInfo(w, t.page);
      say(`Flash view device info: ${info.status}`);
      expect(info.status).toMatch(/^Read/);

      /* The view read the device and shows its version. */
      expect(await w.text(FW_SECTION)).toContain('1.3.0.0');

      /* This build is flashable here, so the write path is offered: the image
       * picker is live, and the view carries its own loud write warning. */
      const canChoose = await w.isEnabled(WRITE_SECTION, 'Choose plaintext image…');
      const warnings = await w.redAlerts();
      say(
        `Flash view: picker enabled=${String(canChoose)}; ${String(warnings.length)} warning alert(s)`,
      );
      expect(canChoose, 'the "Choose plaintext image…" picker is offered').toBe(true);
      expect(
        warnings.some((a) => /writes to the camera's flash/i.test(a)),
        'the Flash view warns that it writes',
      ).toBe(true);
    });

    it(
      "flashes the camera's own plaintext into the upgrade slot, and the emulator boots it",
      { timeout: 30 * 60_000 },
      async () => {
        const t = ctx.target();
        if (t.emu === null) {
          say('camera target: the Flash view writes no camera here — its read was the test above');
          return;
        }
        const w = t.wizard;

        /* The image: the active slot's plaintext, as Dump & decrypt delivers it. */
        const dump = await w.dumpAndDecrypt(20 * 60_000);
        const plain = dump.entries.find(
          (e) => /\/decrypted\/[^/]+\.bin$/.test(e.name) && sha256(e.data) === BENCH_PLAIN_SHA,
        );
        expect(plain, "the dump's decrypted active slot").toBeDefined();
        if (plain === undefined) return;
        const imagePath = path.join(ctx.scratch, path.basename(plain.name));
        writeFileSync(imagePath, plain.data);
        say(`image: ${path.basename(plain.name)} (${String(plain.data.length)} B)`);

        /* Before: what runs, and where the write will land. */
        await w.route('#/flash');
        const before = await readDeviceInfo(w, t.page);
        say(`before: ${before.version}, booted from ${before.booted}, target ${before.target}`);
        expect(before.status).toMatch(/^Read\. /);
        expect(before.target).not.toBe('');
        const targetName = before.target.split(' at ')[0] ?? '';
        expect(targetName).not.toBe(before.booted);

        /* Pick the file; the view packages it and says it is ready. */
        const input = await t.page.$('input#filePickFw');
        if (input === null) throw new Error('the Flash view has no image input');
        await input.uploadFile(imagePath);
        await t.page.waitForFunction(
          () =>
            /^(Ready|Rejected)/.test(
              document.querySelector<HTMLElement>('#flash-status')?.innerText ?? '',
            ),
          { timeout: 60_000, polling: 250 },
        );
        const prepared = await w.text('#flash-status');
        expect(prepared, await w.logTail('flash')).toMatch(/^Ready — /);

        /* No rescue dump: the emulator's flash is a scratch file, and the dump
         * above already read the whole part. */
        await t.page.click('#optDumpFirst');
        expect(await t.page.$eval('#optDumpFirst', (el) => (el as HTMLInputElement).checked)).toBe(
          false,
        );

        /* The view's own write, through its confirmation dialog. */
        await w.click(WRITE_SECTION, 'Write to camera');
        await t.page.waitForSelector('[role="alertdialog"]', { timeout: 10_000 });
        await w.click('[role="alertdialog"]', 'Yes — write to camera');
        const t0 = Date.now();
        await t.page.waitForFunction(
          () =>
            /^(Written|Failed|Cancelled)/.test(
              document.querySelector<HTMLElement>('#flash-status')?.innerText ?? '',
            ),
          { timeout: 20 * 60_000, polling: 500 },
        );
        const written = await w.text('#flash-status');
        say(`write: ${written} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
        expect(written, await w.logTail('flash')).toMatch(/^Written\./);

        /* The bank switch takes effect on a power cycle: pull the cable and put
         * it back — a fresh emulator booted from the flash the write left. */
        await t.emu.unplug();
        await t.emu.replug();
        await w.route('#/');
        await w.connect(); /* a re-enumerated camera with no serial needs a new pick */
        await w.route('#/flash');
        const after = await readDeviceInfo(w, t.page);
        say(`after: ${after.version}, booted from ${after.booted}, target ${after.target}`);
        expect(after.status).toMatch(/^Read/);
        expect(after.version, 'the written image runs and reports its version').toBe(
          before.version,
        );
        expect(after.booted, 'the camera now runs from the slot that was written').toBe(targetName);
        expect(await refusalsOf(t)).toEqual([]);
      },
    );
  },
);

/**
 * The view's read on the real camera, and nothing that writes. It checks that
 * the read reached the camera and is honest about it: the version shown is the
 * one the camera answered on the wire; at least one slot passes acceptance
 * under the profile the read settled on (the camera boots one, so a read that
 * fails every slot judged them under the wrong cipher — what a 2016 Compact PRO
 * got before detection could tell it from the 2014 Compact); and nothing but
 * reads, the window arm and the two device-info selectors left the page.
 */
async function readOnCamera(t: Parameters<typeof refusalsOf>[0]): Promise<void> {
  const w = t.wizard;
  await w.connect();
  await w.route('#/flash');
  const info = await readDeviceInfo(w, t.page);
  say(`Flash view device info: ${info.status}; version ${info.version}`);
  expect(info.status, await w.logTail('fwinfo')).toMatch(/^Read/);

  /* The version read sends GetFirmwareInfo until two answers in a row; the
   * first only proves the record selector is back at 0, the second is the
   * build block. Later answers are other records the device-info read asks
   * for (the bootloader's, the platform's), so the last one is not it. */
  const guard = await guardOf(t.page);
  say(`GetFirmwareInfo answers on the wire: ${guard.versionsSeen.join(', ')}`);
  expect(info.version, 'the version shown is the one the camera answered').toBe(
    guard.versionsSeen[1],
  );
  if (CAMERA_VERSION !== '') expect(info.version, 'SEEK_E2E_CAMERA_VERSION').toBe(CAMERA_VERSION);

  /* The slot table's cells; each slot's verdict sits under its key name. */
  const verdicts = await t.page.$$eval(`${FW_SECTION} td`, (cells) =>
    cells.map((cell) => (cell as HTMLElement).innerText),
  );
  const passing = verdicts.filter((v) => /bootloader can boot this|passes acceptance/.test(v));
  const shown = verdicts.filter((v) => /boot|acceptance|footer|key/.test(v));
  say(`slot verdicts: ${shown.map((v) => v.replace(/\s*\n\s*/g, ' — ')).join(' | ')}`);
  expect(
    passing.length,
    'a slot passes acceptance under the profile the read settled on',
  ).toBeGreaterThan(0);

  /* Nothing to write with: no image was chosen, so the write is not offered. */
  expect(await w.isEnabled(WRITE_SECTION, 'Write to camera')).toBe(false);

  const wire = await wireOf(t);
  say(`Flash view wire: ${describeWire(wire)}`);
  for (const op of ['out 0x50', 'out 0x51', 'out 0x59']) expect(wire.has(op), op).toBe(false);
  expect(await refusalsOf(t)).toEqual([]);
}
