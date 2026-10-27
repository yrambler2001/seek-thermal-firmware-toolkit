/* ==================================================================== *
 * The non-slots pages, in Electron, on emulated cameras — `npm run
 * e2e:pages:emu` (`vitest run --config e2e/vitest.config.ts pages-emu.e2e`).
 *
 * EMULATOR ONLY. Each camera is its own emulator (`pages-camera.ts`), booted
 * from a corpus entry, behind an Electron window on the Vite dev server. The
 * window's navigator.usb is the bridge's stand-in, so no physical camera and
 * no real WebUSB is reached; a session with no camera gets an empty bus.
 *
 * Four pages, a pass set and a denial set each:
 *   - Info: reads the firmware version of a 1.3.0.0 Compact, a 4.8.2.1
 *     Compact and a 2016 Compact PRO, and says which tab covers it. With no
 *     camera it says so and writes nothing.
 *   - Dump & decrypt 0.x/1.x 2014/2016: the read-only first step (Read &
 *     build) completes on the 2014 and 2016 cameras, and its backup holds the
 *     emulated flash's 31 windows. A 4.x camera is refused by this tab before
 *     any write.
 *   - Dump & decrypt 4.x/Nano: a dump of a 4.x Compact and a Nano; the Options
 *     spoiler is collapsed by default and holds "Dump all selectors", which
 *     works. A 1.3.0.0 camera is refused, before any window is read, with the
 *     0.x/1.x tab named.
 *   - Decrypt File/Slot (no camera at all): a whole corpus dump, and a 64 KiB
 *     slot cut from each known bank, decrypt to the corpus's own plaintext; a
 *     wrong-size file, an erased bank, a random bank and a bank whose key does
 *     not recover are refused or reported, and nothing is downloaded for them.
 *
 * Every allowed flow asserts what the page SHOWS. Every denied flow asserts the
 * refusal text, and that nothing that changes the camera went on the wire (the
 * bridge's own count of requests, by opcode).
 * ==================================================================== */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  BACKUP_WINDOW_COUNT,
  HEADER_OFFSET,
  IMAGE_MAGIC,
  LENGTH_OFFSET,
  preservationWindows,
} from '@seek-fw/core';
import { EMU_DIR } from '../packages/core/test/emulator/suite.js';
import { say } from './lib/browser.js';
import { INFO_FIRMWARE_INFO_OP, INFO_RAM_DATA_OP } from './lib/info-read.js';
import { CAMERA_NAME } from './lib/camera-flow.js';
import { entry, names, runState, sha256 } from './lib/checks.js';
import {
  BANK_BYTES,
  FLASH_BASE,
  KNOWN_BANKS,
  bankOf,
  corpusDump,
  corpusImage,
} from './lib/pages-corpus.js';
import { openPagesSession, type PagesCamera, type PagesSession } from './lib/pages-camera.js';
import { KEEP } from './lib/spec.js';
import { corpusEntryId } from './lib/slots-camera.js';
import { PHASE_FOLDER, Wizard, phaseSection, type PhaseRun } from './lib/wizard.js';
import { runStep02 } from './lib/target-tools.js';
import { readZip } from './lib/zip.js';

const UNAVAILABLE = EMU_DIR === null ? 'no FW-V1 emulator found (set SEEK_EMU_DIR)' : null;
if (UNAVAILABLE !== null) process.stderr.write(`\n[skip] the pages [emu]: ${UNAVAILABLE}\n`);

/** The opcodes that change the camera: the flash write, its commit, the reset and the setters. */
const CHANGES_THE_CAMERA = ['out 0x50', 'out 0x51', 'out 0x55', 'out 0x59', 'out 0x5a'];

/**
 * Every request the Info read sends on the emulator (TESTING.md 42.68): the identity reads, the
 * device-info reads and the arms, and the two info selectors 0x55 and 0x5a, which only that read sends.
 */
const INFO_READ_KEYS = [
  'in 0x35',
  'in 0x3d',
  'in 0x4e',
  'in 0x4f',
  'out 0x52',
  'out 0x55',
  'out 0x5a',
];

/** Which of a wire count's keys would change the camera. */
function changesIn(wire: ReadonlyMap<string, number>): string[] {
  return [...wire.keys()].filter((key) => CHANGES_THE_CAMERA.includes(key));
}

/**
 * The info selectors that reached the camera, each as `0x55 [10,0]` (request, payload bytes): the shape
 * a check names. SetFirmwareInfoFeatures (0x55) takes a u16 record selector; SetRamDataFeatures (0x5A)
 * the device-id block.
 */
function infoSettersSent(s: PagesSession): string[] {
  return s.bridge.outs
    .filter((o) => o.request === INFO_FIRMWARE_INFO_OP || o.request === INFO_RAM_DATA_OP)
    .map((o) => `0x${o.request.toString(16)} [${[...o.bytes].join(',')}]`);
}

/**
 * Preserve's read-only first step reads the started bank for its bank choice: GetFirmwareInfo
 * selector 10, the roots record that holds the active-slot word (TESTING.md 42.98 to 42.103). That
 * is ONE SetFirmwareInfoFeatures whose payload is the u16 10, the Info read's own shape; the
 * pages-bench rig lets exactly that request out by its shape (42.103), and so does this check.
 */
const ACTIVE_SLOT_READ = `0x${INFO_FIRMWARE_INFO_OP.toString(16)} [10,0]`;

function entryFor(prefix: string, kind: 'full-dump' | 'image-only', label: string): PagesCamera {
  const entryId = UNAVAILABLE === null ? corpusEntryId(prefix, kind) : null;
  if (entryId === null && UNAVAILABLE === null) {
    throw new Error(`the emulator has no ${kind} entry ${prefix} (${label})`);
  }
  return { label, entryId };
}

const SCRATCH_BASE =
  process.env.SEEK_E2E_SCRATCH ?? path.join(tmpdir(), `seek-e2e-pages-${String(process.pid)}`);
const scratchFor = (slug: string): string => path.join(SCRATCH_BASE, slug);
const slugOf = (label: string): string => label.replace(/[^A-Za-z0-9]+/g, '-');

const INFO_SECTION = 'section[aria-labelledby="info-read-heading"]';
const DUMP_SECTION = 'section[aria-labelledby="dump-heading"]';
const SLOT_SECTION = 'section[aria-labelledby="slotfile-heading"]';
const CONNECT_SECTION = 'section[aria-labelledby="connect-heading"]';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** The text of a section, as the page shows it. */
function sectionText(s: PagesSession, selector: string): Promise<string> {
  return s.wizard.text(selector);
}

/** Asks the Info page for the version and waits for its line. */
async function readVersion(s: PagesSession): Promise<string> {
  await s.wizard.route('#/');
  await s.wizard.click(INFO_SECTION, 'Read firmware version');
  await s.page.waitForFunction(
    () =>
      /^(Read\.|No version|Failed|Cancelled)/.test(
        document.querySelector<HTMLElement>('#info-status')?.innerText ?? '',
      ),
    { timeout: 120_000, polling: 250 },
  );
  return s.wizard.text('#info-status');
}

/** Waits until the 4.x/Nano tab's dump status line shows an end, and returns it. */
async function waitForDumpEnd(s: PagesSession, timeoutMs: number): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const status = await s.wizard.text('#dump-status');
    if (/^(Done —|Refused|Failed|Cancelled|The camera is in use)/.test(status)) return status;
    if (Date.now() > deadline) {
      throw new Error(`the dump did not end in ${String(timeoutMs)} ms: ${status}`);
    }
    await sleep(500);
  }
}

/* ==================================================================== *
 * Info
 * ==================================================================== */

const INFO_CAMERAS: readonly {
  readonly camera: PagesCamera;
  readonly version: string;
  readonly tab: string;
  /** How many device-info reads the Info read makes on this camera (each sends 4 selectors and 1 block). */
  readonly reads: number;
}[] = [
  {
    camera: entryFor(
      'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump',
      'full-dump',
      'Compact 1.3.0.0',
    ),
    version: '1.3.0.0',
    tab: 'Dump & decrypt 0.x/1.x 2014/2016',
    reads: 1,
  },
  {
    camera: entryFor(
      'compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/dump',
      'full-dump',
      'Compact 4.8.2.1',
    ),
    version: '4.8.2.1',
    tab: 'Dump & decrypt 4.x/Nano',
    reads: 1,
  },
  {
    camera: entryFor(
      'compact_pro/2016.07.06-17.04.49-1.0.3.0/0C21A1M5KP15/dump',
      'full-dump',
      'Compact PRO 2016 1.0.3.0',
    ),
    version: '1.0.3.0',
    tab: 'Dump & decrypt 0.x/1.x 2014/2016',
    /* One read since 42.84 (294712f): the probe picks compact-2016 on 1.0.3.x, so the evidence names the
     * profile the read ran under and nothing is re-read (`profileToRereadUnder`). Before, the first read ran
     * under legacy-auth and a second under compact-2016: 8 selector writes, 2 blocks (42.68). */
    reads: 1,
  },
];

for (const subject of INFO_CAMERAS) {
  describe.skipIf(UNAVAILABLE !== null)(`the Info tab on ${subject.camera.label} [emu]`, () => {
    const scratch = scratchFor(`info-${slugOf(subject.camera.label)}`);
    let s: PagesSession;

    beforeAll(async () => {
      mkdirSync(scratch, { recursive: true });
      s = await openPagesSession(subject.camera, { scratchDir: scratch, route: '#/' });
    }, 10 * 60_000);

    afterAll(async () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      await s?.close().catch((error: unknown) => {
        say(`close failed: ${String(error)}`);
      });
      if (!KEEP) rmSync(scratch, { recursive: true, force: true });
      else say(`kept: ${scratch}`);
    });

    it('connects to the emulated camera by its own name', async () => {
      expect(await s.wizard.connect()).toMatch(CAMERA_NAME);
    });

    it(`reads firmware ${subject.version} and names the tab that covers it`, async () => {
      expect(await readVersion(s)).toBe(`Read. Firmware ${subject.version}.`);
      const text = await sectionText(s, INFO_SECTION);
      expect(text).toContain(subject.version);
      expect(text).toContain('Tab for this camera');
      expect(text).toContain(subject.tab);
      expect(await s.refusals(), 'nothing refused').toEqual([]);
      expect(await s.wizard.redAlerts(), 'no red alert on a good read').toEqual([]);
    });

    it('sends the Info read and nothing that changes the camera: no flash write, no reset, and the info selectors only as the read sends them', async () => {
      const wire = await s.wire();
      say(`info wire: ${JSON.stringify([...wire.entries()])}`);
      expect([...wire.keys()].filter((key) => !INFO_READ_KEYS.includes(key))).toEqual([]);
      expect(changesIn(wire).filter((key) => !INFO_READ_KEYS.includes(key))).toEqual([]);
      expect(wire.get('out 0x55') ?? 0, 'SetFirmwareInfoFeatures: four per device-info read').toBe(
        4 * subject.reads,
      );
      expect(wire.get('out 0x5a') ?? 0, 'SetRamDataFeatures: once per device-info read').toBe(
        subject.reads,
      );
    });
  });
}

describe.skipIf(UNAVAILABLE !== null)('the Info tab with no camera [emu]', () => {
  const scratch = scratchFor('info-no-camera');
  let s: PagesSession;

  beforeAll(async () => {
    mkdirSync(scratch, { recursive: true });
    s = await openPagesSession({ label: 'no camera', entryId: null }, { scratchDir: scratch });
  }, 10 * 60_000);

  afterAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    await s?.close().catch((error: unknown) => {
      say(`close failed: ${String(error)}`);
    });
    if (!KEEP) rmSync(scratch, { recursive: true, force: true });
  });

  it('says a camera is needed, disables the read, and writes nothing', async () => {
    await s.wizard.route('#/');
    expect(await s.wizard.isEnabled(INFO_SECTION, 'Read firmware version')).toBe(false);
    expect(await sectionText(s, INFO_SECTION)).toContain('Connect the camera above first');
    expect(await s.wizard.text('#info-status')).toBe('Not read yet.');
    expect([...(await s.wire()).keys()], 'no device call at all').toEqual([]);
  });
});

/* ==================================================================== *
 * Dump & decrypt 0.x/1.x 2014/2016 (Preserve: the read-only first step)
 * ==================================================================== */

/**
 * The backup file is the flash image with the 31 windows of `preservationWindows()`
 * filled at their flash offsets. Each window is checked against the emulated flash.
 */
function checkBackupWindows(backup: Uint8Array, flash: Uint8Array): void {
  const windows = preservationWindows();
  expect(windows).toHaveLength(BACKUP_WINDOW_COUNT);
  expect(backup.length, 'the backup is the 4 MiB flash image').toBe(FLASH_BYTES);
  for (const window of windows) {
    const at = window.address - FLASH_BASE;
    expect(
      sha256(backup.subarray(at, at + BANK_BYTES)),
      `window ${hex(window.address)} equals the emulated flash`,
    ).toBe(sha256(flash.subarray(at, at + BANK_BYTES)));
  }
}

const hex = (value: number): string => `0x${value.toString(16).padStart(8, '0').toUpperCase()}`;

const FLASH_BYTES = 4 * 1024 * 1024;

const LEGACY_CAMERAS: readonly {
  readonly camera: PagesCamera;
  readonly version: string;
  readonly dumpPrefix: string;
}[] = [
  {
    camera: entryFor(
      'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump',
      'full-dump',
      'Compact 1.3.0.0',
    ),
    version: '1.3.0.0',
    dumpPrefix: 'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump',
  },
  {
    camera: entryFor(
      'compact_pro/2016.07.06-17.04.49-1.0.3.0/0C21A1M5KP15/dump',
      'full-dump',
      'Compact PRO 2016 1.0.3.0',
    ),
    version: '1.0.3.0',
    dumpPrefix: 'compact_pro/2016.07.06-17.04.49-1.0.3.0/0C21A1M5KP15/dump',
  },
];

for (const subject of LEGACY_CAMERAS) {
  describe.skipIf(UNAVAILABLE !== null)(
    `Dump & decrypt 0.x/1.x on ${subject.camera.label} [emu]`,
    () => {
      const scratch = scratchFor(`preserve-${slugOf(subject.camera.label)}`);
      let s: PagesSession;
      let run: PhaseRun | null = null;

      beforeAll(async () => {
        mkdirSync(scratch, { recursive: true });
        s = await openPagesSession(subject.camera, { scratchDir: scratch, route: '#/preserve' });
      }, 10 * 60_000);

      afterAll(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        await s?.close().catch((error: unknown) => {
          say(`close failed: ${String(error)}`);
        });
        if (!KEEP) rmSync(scratch, { recursive: true, force: true });
        else say(`kept: ${scratch}`);
      });

      it('connects to the emulated camera by its own name', async () => {
        expect(await s.wizard.connect()).toMatch(CAMERA_NAME);
      });

      it('Read & build completes read-only and saves its run file', async () => {
        run = await runStep02(s.target);
        expect(run.status).toMatch(/ — done[.,]/);
        const all = names(run.entries);
        expect(all.slice(0, 2)).toEqual(['preserve_run.json', 'README.md']);
        expect(all).toContain(`${PHASE_FOLDER['read-build']}/preserve_backup_windows.bin`);
        expect(
          all.filter((n) => /^0[34]-/.test(n)),
          'no later step ran',
        ).toEqual([]);
        const state = runState(run.entries);
        expect(state.steps.backup?.status).toBe('done');
        expect(state.steps.patch?.status).toBe('done');
        expect(state.steps.commit).toBeUndefined();
        expect(state.nextStep).toBe('commit');
        expect(state.expectedVersion).toBe(subject.version);
        expect(await s.wizard.redAlerts(), 'no red alert on an allowed step').toEqual([]);
      });

      it('the backup holds the emulated flash, window by window, in the order the plan reads them', () => {
        expect(run, 'Read & build produced a run file').not.toBeNull();
        if (run === null) return;
        const backup = entry(
          run.entries,
          `${PHASE_FOLDER['read-build']}/preserve_backup_windows.bin`,
        );
        const flash = s.asBootedFlash();
        expect(flash, 'the emulator wrote its as-booted flash').not.toBeNull();
        if (flash === null) return;
        expect(flash.length).toBe(FLASH_BYTES);
        /* The emulator booted the corpus dump, so its as-booted flash is that dump, byte for byte. */
        expect(sha256(flash)).toBe(corpusDump(subject.dumpPrefix).sha256);
        checkBackupWindows(backup, flash);
      });

      it('offers step 03 and shows no past-commit alarm', async () => {
        expect(
          await s.wizard.isEnabled(phaseSection('patch-dump'), Wizard.startLabel('patch-dump')),
        ).toBe(true);
        const text = await s.page.evaluate(() => document.body.innerText);
        expect(text).not.toContain('The write is not on record');
      });

      it('sends nothing that changes the camera during the read-only step: the active-slot read alone, by its shape', async () => {
        const wire = await s.wire();
        expect(
          changesIn(wire).filter((key) => key !== 'out 0x55'),
          'no write, commit, reset or other setter on the wire',
        ).toEqual([]);
        expect(
          infoSettersSent(s),
          'one SetFirmwareInfoFeatures(10), the active-slot read, and no other setter',
        ).toEqual([ACTIVE_SLOT_READ]);
        expect(await s.refusals()).toEqual([]);
      });
    },
  );
}

describe.skipIf(UNAVAILABLE !== null)(
  'Dump & decrypt 0.x/1.x refuses a 4.8.2.1 camera before any write [emu]',
  () => {
    const scratch = scratchFor('preserve-refuses-4821');
    let s: PagesSession;

    beforeAll(async () => {
      mkdirSync(scratch, { recursive: true });
      s = await openPagesSession(
        entryFor(
          'compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/dump',
          'full-dump',
          'Compact 4.8.2.1',
        ),
        { scratchDir: scratch, route: '#/preserve' },
      );
    }, 10 * 60_000);

    afterAll(async () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      await s?.close().catch((error: unknown) => {
        say(`close failed: ${String(error)}`);
      });
      if (!KEEP) rmSync(scratch, { recursive: true, force: true });
    });

    it('connects, then refuses the step on the version, naming the 4.x/Nano tab, before any window is read', async () => {
      expect(await s.wizard.connect()).toMatch(CAMERA_NAME);
      await s.wizard.route('#/preserve');
      await s.wizard.click(phaseSection('read-build'), Wizard.startLabel('read-build'));
      const deadline = Date.now() + 5 * 60_000;
      let status: string;
      for (;;) {
        status = await s.wizard.text('#preserve-phase-read-build-status');
        if (/^(Refused|Failed|Stopped|Not created|No run|Cancelled)/.test(status)) break;
        if (/ — done[.,]/.test(status) || Date.now() > deadline) break;
        await sleep(500);
      }
      const log = await s.wizard.text('#preserve-phase-read-build-log');
      say(`4.x on the 0.x/1.x tab: status ${JSON.stringify(status)}\n${log}`);
      expect(status, 'the step ends refused or failed, not done').toMatch(/^(Refused|Failed)/);
      expect(log, 'the log says the build is not a 0.x or 1.x build').toContain(
        'is not a 0.x or 1.x build',
      );
      /* Core's words since 42.105 (871da8c): the tab in words, neither front end named. */
      expect(log, 'the log names the 4.x/Nano tab').toContain('Dump & decrypt for 4.x and Nano');
      const wire = await s.wire();
      expect(changesIn(wire), 'nothing that changes the camera').toEqual([]);
      expect(
        [...wire.keys()].filter((key) => key === 'in 0x4f' || key === 'out 0x52'),
        'no window read and no window armed',
      ).toEqual([]);
    });
  },
);

/* ==================================================================== *
 * Dump & decrypt 4.x/Nano
 * ==================================================================== */

const V4_CAMERAS: readonly {
  readonly camera: PagesCamera;
  readonly version: string;
  readonly dumpPrefix: string;
}[] = [
  {
    camera: entryFor(
      'compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/dump',
      'full-dump',
      'Compact 4.8.2.1',
    ),
    version: '4.8.2.1',
    dumpPrefix: 'compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/dump',
  },
  {
    camera: entryFor(
      'nano_200/2024.11.20-14.58.43-42.32.3.10/0E1CA0YWX3A9/dump',
      'full-dump',
      'Nano 200 42.32.3.10',
    ),
    version: '42.32.3.10',
    dumpPrefix: 'nano_200/2024.11.20-14.58.43-42.32.3.10/0E1CA0YWX3A9/dump',
  },
];

for (const subject of V4_CAMERAS) {
  describe.skipIf(UNAVAILABLE !== null)(
    `Dump & decrypt 4.x/Nano on ${subject.camera.label} [emu]`,
    () => {
      const scratch = scratchFor(`v4-${slugOf(subject.camera.label)}`);
      let s: PagesSession;

      beforeAll(async () => {
        mkdirSync(scratch, { recursive: true });
        s = await openPagesSession(subject.camera, { scratchDir: scratch, route: '#/v4' });
      }, 10 * 60_000);

      afterAll(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        await s?.close().catch((error: unknown) => {
          say(`close failed: ${String(error)}`);
        });
        if (!KEEP) rmSync(scratch, { recursive: true, force: true });
        else say(`kept: ${scratch}`);
      });

      it('connects to the emulated camera by its own name', async () => {
        expect(await s.wizard.connect()).toMatch(CAMERA_NAME);
      });

      it('keeps "Dump all selectors" inside the Options spoiler, collapsed by default', async () => {
        await s.wizard.route('#/v4');
        const view = await s.page.evaluate(() => {
          const spoiler = [...document.querySelectorAll('details')].find((d) =>
            (d.querySelector('summary')?.textContent ?? '').includes('Options'),
          );
          const sweep = [...(spoiler?.querySelectorAll('button') ?? [])].find(
            (b) => b.textContent.trim() === 'Dump all selectors (0x00–0xFF)',
          );
          const start = [...document.querySelectorAll('button')].find(
            (b) => b.textContent.trim() === 'Start dump',
          );
          return {
            spoiler: spoiler !== undefined,
            open: spoiler?.open ?? null,
            sweepInSpoiler: sweep !== undefined,
            sweepVisible: sweep?.checkVisibility({ checkVisibilityCSS: true }) ?? false,
            startVisible: start?.checkVisibility({ checkVisibilityCSS: true }) ?? false,
          };
        });
        expect(view.spoiler, 'an Options spoiler exists').toBe(true);
        expect(view.open, 'Options is collapsed by default').toBe(false);
        expect(view.sweepInSpoiler, 'Dump all selectors is inside Options').toBe(true);
        expect(view.sweepVisible, 'Dump all selectors is hidden while Options is closed').toBe(
          false,
        );
        expect(view.startVisible, 'Start dump is on the page, outside Options').toBe(true);
        expect(await s.wizard.text('#dump-status')).toBe('Idle.');
      });

      it('dumps the whole flash: Done with every window read, and the image is the emulated flash', async () => {
        await s.wizard.route('#/v4');
        await s.wizard.startDump('dump', 'Start dump');
        const status = await waitForDumpEnd(s, 40 * 60_000);
        expect(status).toMatch(/^Done — (\d+)\/\1 windows read/);
        const archive = await s.app.waitFor(
          (name) => /^seek_flash4m_.+\.zip$/.test(name),
          60_000,
          'dump archive',
        );
        const entries = readZip(archive.bytes);
        const dir = names(entries)[0]?.split('/')[0] ?? '';
        expect(dir).toMatch(/^seek_flash4m_/);
        const image = entries.find((e) => /^[^/]+\/flash_dump_original\.bin$/.test(e.name));
        expect(image?.data.length).toBe(4 * 1024 * 1024);
        const flash = s.asBootedFlash();
        expect(flash).not.toBeNull();
        if (flash !== null) {
          expect(
            sha256(corpusDump(subject.dumpPrefix).bytes),
            'the emulated flash is the corpus dump',
          ).toBe(sha256(flash));
          expect(
            sha256(image?.data ?? new Uint8Array(0)),
            'the dump image is the emulated flash',
          ).toBe(sha256(flash));
        }
        expect(await s.wizard.redAlerts()).toEqual([]);
        expect(changesIn(await s.wire()), 'a dump sends no write, commit, reset or setter').toEqual(
          [],
        );
      });

      it('"Dump all selectors", from Options, runs to its end and saves what answers', async () => {
        await s.wizard.route('#/v4');
        await s.wizard.openOptions();
        await s.wizard.startDump('dump', 'Dump all selectors (0x00–0xFF)');
        const status = await waitForDumpEnd(s, 40 * 60_000);
        expect(status).toMatch(/selectors armed/);
        const archive = await s.app.waitFor(
          (name) => /^seek_selectors_.+\.zip$/.test(name),
          60_000,
          'selector archive',
        );
        expect(archive.bytes.length).toBeGreaterThan(0);
        expect(
          changesIn(await s.wire()),
          'a sweep sends no write, commit, reset or setter',
        ).toEqual([]);
      });
    },
  );
}

describe.skipIf(UNAVAILABLE !== null)(
  'Dump & decrypt 4.x/Nano refuses a 1.3.0.0 camera [emu]',
  () => {
    const scratch = scratchFor('v4-refuses-1300');
    let s: PagesSession;

    beforeAll(async () => {
      mkdirSync(scratch, { recursive: true });
      s = await openPagesSession(
        entryFor(
          'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump',
          'full-dump',
          'Compact 1.3.0.0',
        ),
        { scratchDir: scratch, route: '#/v4' },
      );
    }, 10 * 60_000);

    afterAll(async () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      await s?.close().catch((error: unknown) => {
        say(`close failed: ${String(error)}`);
      });
      if (!KEEP) rmSync(scratch, { recursive: true, force: true });
    });

    it('connects, then refuses the dump before any window is read, and names the 0.x/1.x tab', async () => {
      expect(await s.wizard.connect()).toMatch(CAMERA_NAME);
      await s.wizard.route('#/v4');
      await s.wizard.startDump('dump', 'Start dump');
      const status = await waitForDumpEnd(s, 5 * 60_000);
      expect(status).toMatch(/^(Refused|Failed)/);
      const alert = await s.page.evaluate(
        (sel: string) =>
          [...document.querySelectorAll(`${sel} [role="alert"]`)]
            .map((a) => (a as HTMLElement).innerText)
            .join('\n'),
        DUMP_SECTION,
      );
      say(`refusal on the 4.x tab: ${alert}`);
      expect(alert).toContain('Not read: this camera cannot be read this way.');
      expect(alert).toContain('The camera runs 1.3.0.0, a 0.x or 1.x build');
      expect(alert).toContain('Dump & decrypt 0.x/1.x 2014/2016');
      expect(alert).toContain('Nothing was read but the version.');
      const wire = await s.wire();
      say(`1.3.0.0 on the 4.x tab, wire: ${JSON.stringify([...wire.entries()])}`);
      expect(changesIn(wire), 'nothing that changes the camera').toEqual([]);
      expect(
        [...wire.keys()].filter((key) => key === 'in 0x4f' || key === 'out 0x52'),
        'no window read (GetFeaturedFirmwareData) and no window armed (BeginFirmwareUpgrade)',
      ).toEqual([]);
    });
  },
);

/* ==================================================================== *
 * Decrypt File/Slot: no camera at all
 * ==================================================================== */

/** The 64 KiB bank at `address` of a corpus dump, or a shorter cut of it. */
function cutBank(dump: Uint8Array, address: number, length = BANK_BYTES): Uint8Array {
  return bankOf(dump, address).slice(0, length);
}

/** A pseudo-random sequence, so a "garbage" file is the same bytes on every run. */
function garbage(length: number, seed: number): Uint8Array {
  const out = new Uint8Array(length);
  let x = seed >>> 0;
  for (let i = 0; i < length; i++) {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    out[i] = x >>> 24;
  }
  return out;
}

/** Picks a file into the slot picker on the Decrypt File/Slot tab. */
async function pickSlot(s: PagesSession, filePath: string): Promise<void> {
  await s.wizard.route('#/decrypt');
  const chooser = s.page.waitForFileChooser({ timeout: 15_000 });
  chooser.catch(() => undefined);
  await s.wizard.click(SLOT_SECTION, 'Choose slot file…');
  const dialog = await chooser;
  await dialog.accept([filePath]);
}

/** Waits until the slot section shows text matching `pattern`; throws with what it shows otherwise. */
async function waitForSlotText(s: PagesSession, pattern: RegExp): Promise<string> {
  const deadline = Date.now() + 120_000;
  for (;;) {
    const text = await sectionText(s, SLOT_SECTION);
    if (pattern.test(text)) return text;
    if (Date.now() > deadline) {
      throw new Error(`the slot page never showed ${String(pattern)}: ${text.slice(0, 400)}`);
    }
    await sleep(250);
  }
}

/** Picks a slot file, waits for the decrypted result, and downloads its image. */
async function decryptSlot(
  s: PagesSession,
  filePath: string,
): Promise<{ name: string; bytes: Uint8Array }> {
  await pickSlot(s, filePath);
  await waitForSlotText(s, /Decrypted firmware slot/);
  await s.page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((b) =>
      b.textContent.trim().startsWith('Download '),
    );
    if (button === undefined) throw new Error('the decrypted panel has no Download button');
    button.click();
  });
  const got = await s.app.waitFor(
    (name) => /decrypt/i.test(name),
    60_000,
    'the decrypted slot download',
  );
  return { name: got.name, bytes: got.bytes };
}

describe.skipIf(UNAVAILABLE !== null)('Decrypt File/Slot with no camera [emu]', () => {
  const scratch = scratchFor('decrypt-no-camera');
  const inputs = path.join(scratch, 'inputs');
  let s: PagesSession;

  beforeAll(async () => {
    mkdirSync(inputs, { recursive: true });
    s = await openPagesSession(
      { label: 'no camera', entryId: null },
      { scratchDir: scratch, route: '#/decrypt' },
    );
  }, 10 * 60_000);

  afterAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    await s?.close().catch((error: unknown) => {
      say(`close failed: ${String(error)}`);
    });
    if (!KEEP) rmSync(scratch, { recursive: true, force: true });
    else say(`kept: ${scratch}`);
  });

  it('has no camera section and no USB banner on this tab', async () => {
    await s.wizard.route('#/decrypt');
    expect(await s.page.$(CONNECT_SECTION)).toBeNull();
    const text = await s.page.evaluate(() => document.body.innerText);
    expect(text).not.toMatch(/WebUSB is not available/i);
    expect((await s.wire()).size, 'no device call on this tab').toBe(0);
  });

  it('decrypts a whole corpus dump: the bank at 0x14030000 comes out as the corpus plaintext', async () => {
    const dump = corpusDump('nano_300/2024.11.21-11.55.00-44.27.3.10/1713A171RJB9/dump');
    const file = path.join(inputs, 'nano300-dump.bin');
    writeFileSync(file, dump.bytes);
    const offline = await s.wizard.offlineDecrypt(file);
    expect(offline.status).toMatch(/^Done —/);
    const plain = corpusImage(
      'nano_300/2024.11.21-11.55.00-44.27.3.10/1713A171RJB9/decrypted_14030000_keyb',
    );
    const slot = offline.entries.filter((e) => e.name.includes('14030000'));
    say(`offline archive entries for 0x14030000: ${slot.map((e) => e.name).join(', ') || 'none'}`);
    expect(slot.length, 'the bank at 0x14030000 is in the archive').toBeGreaterThan(0);
    expect(
      slot.map((e) => sha256(e.data)),
      'the corpus plaintext',
    ).toContain(plain.sha256);
  });

  for (const known of KNOWN_BANKS) {
    it(`decrypts a 64 KiB slot cut from ${known.label}: the download is the corpus plaintext`, async () => {
      const dump = corpusDump(known.dump);
      const file = path.join(inputs, `slot-${slugOf(known.label)}.bin`);
      writeFileSync(file, cutBank(dump.bytes, known.bank));
      const download = await decryptSlot(s, file);
      const plain = corpusImage(known.plain);
      say(`${known.label}: download ${download.name}, ${String(download.bytes.length)} B`);
      expect(download.bytes.length, 'the image length is the corpus image length').toBe(
        plain.bytes.length,
      );
      expect(sha256(download.bytes), 'the decrypted image is the corpus plaintext').toBe(
        plain.sha256,
      );
      const text = await sectionText(s, SLOT_SECTION);
      expect(text).toContain('Decrypted firmware slot');
      expect(text).toContain('SHA-256 of the file');
      expect(await s.wizard.redAlerts(), 'no red alert on a decrypted slot').toEqual([]);
    });
  }

  it('reports an erased bank as empty, and downloads nothing', async () => {
    const before = s.app.names().length;
    const file = path.join(inputs, 'erased-64k.bin');
    writeFileSync(file, new Uint8Array(BANK_BYTES).fill(0xff));
    await pickSlot(s, file);
    const text = await waitForSlotText(s, /is an erased bank\./);
    expect(text).toContain('erased-64k.bin is an erased bank.');
    expect(text).not.toContain('Decrypted firmware slot');
    expect(s.app.names().length, 'nothing was downloaded').toBe(before);
  });

  it('refuses a file that is not exactly 64 KiB, and downloads nothing', async () => {
    const before = s.app.names().length;
    const dump = corpusDump('nano_300/2024.11.21-11.55.00-44.27.3.10/1713A171RJB9/dump');
    const file = path.join(inputs, 'short-65535.bin');
    writeFileSync(file, cutBank(dump.bytes, 0x14030000, BANK_BYTES - 1));
    await pickSlot(s, file);
    const text = await waitForSlotText(s, /Not decrypted:/);
    expect(text).toContain(
      'Not decrypted: short-65535.bin is not a firmware slot this page can decrypt.',
    );
    expect(text).toContain('Nothing was written anywhere.');
    expect(text).not.toContain('Decrypted firmware slot');
    expect(await s.wizard.redAlerts()).not.toEqual([]);
    expect(s.app.names().length, 'nothing was downloaded').toBe(before);
  });

  it('refuses a random 64 KiB file, and downloads nothing', async () => {
    const before = s.app.names().length;
    const file = path.join(inputs, 'random-64k.bin');
    writeFileSync(file, garbage(BANK_BYTES, 0x1234));
    await pickSlot(s, file);
    const text = await waitForSlotText(s, /Not decrypted:|could not be read/);
    expect(text).not.toContain('Decrypted firmware slot');
    expect(s.app.names().length, 'nothing was downloaded').toBe(before);
  });

  it('refuses a slot whose key does not recover to a Cortex-M entry, and downloads nothing', async () => {
    /* An image header and a length over random ciphertext: the key solve finds no
     * key whose reset vector is a Cortex-M entry (core's own test builds it this way). */
    const before = s.app.names().length;
    const bank = garbage(BANK_BYTES, 0x5eed);
    const dv = new DataView(bank.buffer, bank.byteOffset, bank.byteLength);
    dv.setUint32(HEADER_OFFSET, IMAGE_MAGIC, true);
    dv.setUint32(LENGTH_OFFSET, 0x1000, true);
    const file = path.join(inputs, 'no-key-64k.bin');
    writeFileSync(file, bank);
    await pickSlot(s, file);
    const text = await waitForSlotText(s, /Not decrypted:/);
    expect(text).toContain(
      'Not decrypted: no-key-64k.bin is not a firmware slot this page can decrypt.',
    );
    expect(text).toContain('Nothing was written anywhere.');
    expect(text).not.toContain('Decrypted firmware slot');
    expect(s.app.names().length, 'nothing was downloaded').toBe(before);
  });
});
