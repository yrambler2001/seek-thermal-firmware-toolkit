/* ==================================================================== *
 * The README's screenshots — `npm run screenshots`
 * (`vitest run --config e2e/screenshots.config.ts`).
 *
 * OPT-IN ONLY. This file is not a `*.e2e.ts`, so no `npm run e2e*` script
 * loads it; only `e2e/screenshots.config.ts` does. It rewrites the AVIF images in
 * `.github/readme/` (not docs/: the web build empties docs/ on every build).
 * `-t <name>` regenerates one group, e.g. `npm run screenshots -- -t decrypt`.
 *
 * EMULATOR ONLY. Every camera here is the FW-V1 emulator booted from a corpus
 * dump (`SEEK_EMU_DIR`), behind the same Electron window and USB bridge the
 * pages e2e uses (`lib/pages-camera.ts`); no physical camera is reached. The
 * 32 FPS writes go to the emulated flash.
 *
 * PRIVACY. The corpus dumps are real cameras. Before each capture every camera
 * serial the corpus knows (its manifest's serial fields and the serial in each
 * entry's id), the emulated device's USB serial, any value the page labels
 * "Serial", the home directory and the user name are replaced in the page with
 * a neutral string of the same shape. The capture then fails if the page's text
 * (rendered, hidden, form values and attributes) still holds any of them, or a
 * `/Users/` path; it checks again after the capture. No serial is written in
 * this file: the cameras are named by family, date and build only.
 *
 * Light theme, a 1280 px wide viewport at 1x (the phone shot: 412 px), cropped to the
 * page's column or the dialog. A shot over 250 KB is captured again at a smaller scale
 * (0.9, 0.8, ...) of the same layout until it fits; the log says which scale each got. The
 * PNG is then compressed to AVIF with ImageMagick (`magick <png> -strip -quality 45 -define
 * heic:speed=2 <avif>`), so `magick` must be on the PATH.
 * ==================================================================== */

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir, userInfo } from 'node:os';
import path from 'node:path';

import type { Page } from 'puppeteer-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { EMU_DIR, ENTRIES } from '../packages/core/test/emulator/suite.js';
import { REPO_ROOT, say } from './lib/browser.js';
import { openPagesSession, type PagesCamera, type PagesSession } from './lib/pages-camera.js';
import { corpusDump } from './lib/pages-corpus.js';
import { corpusEntryId } from './lib/slots-camera.js';
import { CONFIRM_DIALOG, SLOTS_SECTION, readSlots, runAndSettle } from './lib/slots-page.js';
import { KEEP } from './lib/spec.js';
import { runStep02 } from './lib/target-tools.js';
import { phaseSection } from './lib/wizard.js';

if (EMU_DIR === null) {
  throw new Error('the README screenshots need the FW-V1 emulator: set SEEK_EMU_DIR');
}
try {
  execFileSync('magick', ['-version'], { stdio: 'ignore' });
} catch {
  throw new Error('the README screenshots need ImageMagick (`magick`, with AVIF) on the PATH');
}

const OUT = path.join(REPO_ROOT, '.github', 'readme');
const WIDTH = 1280;
const HEIGHT = 900;
/** A phone's width (a common Android one); width only, so the page keeps its camera. */
const PHONE_WIDTH = 412;
const PHONE_HEIGHT = 915;
/** The size the PNG capture is kept under, before it is compressed to AVIF. */
const MAX_BYTES = 250 * 1024;

const SCRATCH =
  process.env.SEEK_E2E_SCRATCH ?? path.join(tmpdir(), `seek-readme-shots-${String(process.pid)}`);

const INFO_SECTION = 'section[aria-labelledby="info-read-heading"]';
const DUMP_SECTION = 'section[aria-labelledby="dump-heading"]';
const OFFLINE_SECTION = 'section[aria-labelledby="offline-heading"]';
/** The slots tab's "Make N FPS in every bank" button and the line beside it. */
const EVERY_BANK = `${SLOTS_SECTION} [role="group"][aria-label="Every bank"]`;

/* The cameras, by corpus family, date and build: the id's serial segment is never written here. */
const COMPACT_1300 = 'compact/2014.10.21-14.58.29-1.3.0.0/';
const PRO_4920 = 'compact_pro/2020.02.13-15.26.01-4.9.2.0/';
const COMPACT_4821 = 'compact/2020.02.26-11.23.26-4.8.2.1/';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function camera(prefix: string, label: string): PagesCamera {
  const entryId = corpusEntryId(prefix, 'full-dump');
  if (entryId === null) throw new Error(`the emulator's corpus has no full dump ${prefix}`);
  return { label, entryId };
}

/* ---- privacy -------------------------------------------------------- */

/** Every camera serial the corpus knows: each entry's serial field, and the serial its id names. */
function corpusSerials(): string[] {
  const found = new Set<string>();
  for (const entry of ENTRIES) {
    for (const candidate of [entry.serial, entry.id.split('/')[2]]) {
      if (candidate == null || candidate === '' || candidate === 'no-serial') continue;
      if (/^[0-9A-Za-z]{6,20}$/.test(candidate)) found.add(candidate);
    }
  }
  return [...found];
}

/** The same shape with nothing in it: digits become 0, letters X. */
const shapeOf = (text: string): string => text.replace(/[0-9]/g, '0').replace(/[A-Za-z]/g, 'X');

interface Swap {
  readonly find: string;
  readonly put: string;
}

/** What must not be on a capture, and what each is replaced with. */
interface Privacy {
  readonly swaps: readonly Swap[];
  readonly needles: readonly string[];
}

function privacyFor(session: PagesSession | null): Privacy {
  const serials = corpusSerials();
  for (const device of session?.emu?.present() ?? []) {
    if (device.serialNumber != null && device.serialNumber !== '') {
      serials.push(device.serialNumber);
    }
  }
  const home = homedir();
  const user = userInfo().username;
  const swaps: Swap[] = [
    ...serials.map((serial) => ({ find: serial, put: shapeOf(serial) })),
    { find: home, put: '/home/user' },
  ];
  const needles = [...serials, home, '/Users/'];
  /* A short user name would match ordinary words; the home directory still covers its paths. */
  if (user.length >= 5) {
    swaps.push({ find: user, put: 'user' });
    needles.push(user);
  }
  return { swaps, needles };
}

/**
 * Replaces, in the live page, each swap's text, any `/Users/<name>` path, and the value of
 * every row the page labels "Serial", in text nodes, form values and the attributes a
 * reader can see.
 */
async function scrub(page: Page, swaps: readonly Swap[]): Promise<void> {
  await page.evaluate((list: readonly Swap[]) => {
    const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rules = list.map((swap) => ({ re: new RegExp(escape(swap.find), 'gi'), put: swap.put }));
    rules.push({ re: /\/Users\/[^/\s"'<>]+/g, put: '/home/user' });
    const fix = (text: string): string =>
      rules.reduce((out, rule) => out.replace(rule.re, rule.put), text);
    const shape = (text: string): string =>
      text.replace(/\b(?=[0-9A-Z]*[0-9])[0-9A-Z]{6,20}\b/g, (token) =>
        token.replace(/[0-9]/g, '0').replace(/[A-Z]/g, 'X'),
      );
    const editText = (root: Node, edit: (text: string) => string): void => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
        const before = node.nodeValue ?? '';
        const after = edit(before);
        if (after !== before) node.nodeValue = after;
      }
    };
    editText(document.body, fix);
    const attributes = ['title', 'aria-label', 'alt', 'href', 'download', 'value', 'placeholder'];
    for (const element of document.body.querySelectorAll('*')) {
      for (const name of attributes) {
        const before = element.getAttribute(name);
        if (before === null) continue;
        const after = fix(before);
        if (after !== before) element.setAttribute(name, after);
      }
      if (
        (element instanceof HTMLInputElement && element.type !== 'file') ||
        element instanceof HTMLTextAreaElement
      ) {
        const after = fix(element.value);
        if (after !== element.value) element.value = after;
      }
    }
    /* A serial the corpus does not list (another camera's): masked by its label. */
    for (const label of document.body.querySelectorAll('dt, th, td')) {
      if (label.textContent.trim().toLowerCase() !== 'serial') continue;
      const value = label.nextElementSibling;
      if (value !== null) editText(value, shape);
    }
  }, swaps);
}

/** Which of `needles` the page still holds anywhere a reader or a copy could find it (indices only). */
async function leaks(page: Page, needles: readonly string[]): Promise<number[]> {
  const text = await page.evaluate(() => {
    const parts = [document.title, document.body.innerText, document.body.textContent];
    for (const element of document.body.querySelectorAll('*')) {
      for (const name of element.getAttributeNames()) parts.push(element.getAttribute(name) ?? '');
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        parts.push(element.value);
      }
    }
    return parts.join('\n').toLowerCase();
  });
  return needles.flatMap((needle, index) => (text.includes(needle.toLowerCase()) ? [index] : []));
}

/* ---- capture -------------------------------------------------------- */

interface Clip {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface Box {
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
}

/**
 * Where a crop starts or ends: a CSS selector, or, inside `within`, the first `match` element whose
 * text starts with `text`. A heading stands for the panel, card or section it heads.
 */
type Edge = string | { readonly within: string; readonly match: string; readonly text: string };

const panel = (within: string, title: string): Edge => ({ within, match: 'h3', text: title });
const alertOf = (within: string, start: string): Edge => ({
  within,
  match: '[data-slot="alert"]',
  text: start,
});

/**
 * The capture scales tried in turn until the PNG fits `MAX_BYTES`. The page is laid out at
 * 1280 CSS px either way; a scale below 1 renders the same layout with fewer device pixels.
 */
const SCALES = [1, 0.9, 0.8, 0.75, 0.7];

/** Light theme, the given width at 1x, no scrollbar, and a viewport tall enough to hold the whole document. */
async function fitViewport(page: Page, width: number, minHeight: number): Promise<void> {
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  /* No scrollbar: the capture lays the page out without one, so the clip is measured that way too. */
  await page.evaluate(() => {
    if (document.getElementById('readme-shots-no-scrollbar') !== null) return;
    const style = document.createElement('style');
    style.id = 'readme-shots-no-scrollbar';
    style.textContent = 'html { scrollbar-width: none !important; }';
    document.head.append(style);
  });
  let height = minHeight;
  for (let pass = 0; pass < 5; pass++) {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await sleep(250);
    const needed = await page.evaluate(() => document.documentElement.scrollHeight);
    if (needed <= height) break;
    height = needed;
  }
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await sleep(250);
}

/** Each edge's box in document pixels, the `main` column's box, and the document's size. */
async function measure(
  page: Page,
  edges: readonly Edge[],
): Promise<{ boxes: Box[]; column: Box; width: number; height: number }> {
  return page.evaluate((list: readonly Edge[]) => {
    const boxOf = (element: Element): Box => {
      const r = element.getBoundingClientRect();
      return {
        top: r.top + window.scrollY,
        bottom: r.bottom + window.scrollY,
        left: r.left + window.scrollX,
        right: r.right + window.scrollX,
      };
    };
    const find = (edge: Edge): Element => {
      if (typeof edge === 'string') {
        const found = document.querySelector(edge);
        if (found === null) throw new Error(`nothing on the page matches ${edge}`);
        return found;
      }
      const root = document.querySelector(edge.within);
      const found = [...(root?.querySelectorAll(edge.match) ?? [])].find((element) =>
        element.textContent.trim().startsWith(edge.text),
      );
      if (found === undefined) {
        throw new Error(`no ${edge.match} reading "${edge.text}…" in ${edge.within}`);
      }
      if (!/^H[1-6]$/.test(found.tagName)) return found;
      return found.closest('[data-slot="panel"], [data-slot="card"], section') ?? found;
    };
    const main = document.querySelector('main');
    if (main === null) throw new Error('the page has no <main>');
    return {
      boxes: list.map((edge) => boxOf(find(edge))),
      column: boxOf(main),
      width: document.documentElement.clientWidth,
      height: document.documentElement.scrollHeight,
    };
  }, edges);
}

/** The page's own column, from the top of `from` (or of the page) to the bottom of `to`. */
async function bandClip(page: Page, from: Edge | null, to: Edge, margin = 16): Promise<Clip> {
  const measured = await measure(page, from === null ? [to] : [from, to]);
  const end = measured.boxes[measured.boxes.length - 1];
  if (end === undefined) throw new Error('nothing measured');
  const start = from === null ? null : (measured.boxes[0] ?? null);
  const top = start === null ? 0 : Math.max(0, Math.floor(start.top - margin));
  const bottom = Math.min(measured.height, Math.ceil(end.bottom + margin));
  const left = Math.max(0, Math.floor(measured.column.left));
  const right = Math.min(measured.width, Math.ceil(measured.column.right));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/** One element, with a margin of what is around it. */
async function elementClip(page: Page, edge: Edge, margin = 16): Promise<Clip> {
  const measured = await measure(page, [edge]);
  const box = measured.boxes[0];
  if (box === undefined) throw new Error('nothing measured');
  const left = Math.max(0, Math.floor(box.left - margin));
  const top = Math.max(0, Math.floor(box.top - margin));
  const right = Math.min(measured.width, Math.ceil(box.right + margin));
  const bottom = Math.min(measured.height, Math.ceil(box.bottom + margin));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/**
 * Scrubs the page, checks nothing identifying is left, captures `clip` and checks again, then
 * compresses it to `.github/readme/<name>.avif`. Nothing is written when a check fails.
 */
async function capture(
  page: Page,
  privacy: Privacy,
  name: string,
  clipOf: () => Promise<Clip>,
): Promise<void> {
  await scrub(page, privacy.swaps);
  const before = await leaks(page, privacy.needles);
  if (before.length > 0) {
    throw new Error(
      `${name}: ${String(before.length)} identifying string(s) still on the page after the scrub (needles #${before.join(', #')}); not captured`,
    );
  }
  const clip = await clipOf();
  let png: Uint8Array = new Uint8Array(0);
  let scale = 1;
  for (const tried of SCALES) {
    scale = tried;
    png = await page.screenshot({
      type: 'png',
      clip: { ...clip, scale },
      captureBeyondViewport: true,
    });
    if (png.length <= MAX_BYTES) break;
  }
  const after = await leaks(page, privacy.needles);
  if (after.length > 0) {
    throw new Error(
      `${name}: the page showed identifying text again during the capture (needles #${after.join(', #')}); not written`,
    );
  }
  mkdirSync(OUT, { recursive: true });
  mkdirSync(path.join(SCRATCH, 'png'), { recursive: true });
  const pngFile = path.join(SCRATCH, 'png', `${name}.png`);
  const avifFile = path.join(OUT, `${name}.avif`);
  writeFileSync(pngFile, png);
  execFileSync('magick', [
    pngFile,
    '-strip',
    '-quality',
    '45',
    '-define',
    'heic:speed=2',
    avifFile,
  ]);
  const avifBytes = statSync(avifFile).size;
  const text = await page.evaluate(() => document.body.innerText);
  mkdirSync(path.join(SCRATCH, 'texts'), { recursive: true });
  writeFileSync(path.join(SCRATCH, 'texts', `${name}.txt`), text);
  const px = (n: number): string => String(Math.round(n * scale));
  say(
    `${name}.avif: ${px(clip.width)}x${px(clip.height)} (scale ${String(scale)}), PNG ${String(png.length)} B, AVIF ${String(avifBytes)} B, privacy check passed (${String(privacy.needles.length)} strings)`,
  );
  expect
    .soft(png.length, `${name}'s PNG capture stays under ${String(MAX_BYTES)} B`)
    .toBeLessThanOrEqual(MAX_BYTES);
}

/* ---- sessions ------------------------------------------------------- */

async function open(
  subject: PagesCamera | null,
  slug: string,
  route: string,
): Promise<PagesSession> {
  const s = await openPagesSession(subject ?? { label: 'no camera', entryId: null }, {
    scratchDir: path.join(SCRATCH, slug),
    route,
  });
  await fitViewport(s.page, WIDTH, HEIGHT);
  return s;
}

async function close(s: PagesSession | undefined): Promise<void> {
  await s?.close().catch((error: unknown) => {
    say(`close failed: ${String(error)}`);
  });
}

afterAll(() => {
  if (!KEEP) rmSync(SCRATCH, { recursive: true, force: true });
  else say(`kept: ${SCRATCH}`);
});

/** Waits until `selector`'s text matches `pattern`; returns it. */
async function waitForText(
  s: PagesSession,
  selector: string,
  pattern: RegExp,
  timeoutMs: number,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const text = await s.wizard.text(selector);
    if (pattern.test(text)) return text;
    if (Date.now() > deadline) {
      throw new Error(`${selector} never matched ${String(pattern)}: ${text.slice(0, 300)}`);
    }
    await sleep(500);
  }
}

/* ---- the Compact 1.3.0.0: Info, phone, Preserve ---------------------- */

describe('info, phone and preserve on an emulated Compact 1.3.0.0', () => {
  let s: PagesSession | undefined;
  const live = (): PagesSession => {
    if (s === undefined) throw new Error('the session did not open');
    return s;
  };

  beforeAll(async () => {
    s = await open(camera(COMPACT_1300, 'Compact 1.3.0.0'), 'compact-1300-info', '#/');
  }, 10 * 60_000);

  afterAll(() => close(s));

  it('info.avif: the Info tab after reading the firmware version', async () => {
    const { page, wizard } = live();
    await wizard.connect();
    await wizard.route('#/');
    await wizard.click(INFO_SECTION, 'Read firmware version');
    expect(await waitForText(live(), '#info-status', /^(Read\.|Failed|No version)/, 120_000)).toBe(
      'Read. Firmware 1.3.0.0.',
    );
    await fitViewport(page, WIDTH, HEIGHT);
    await capture(page, privacyFor(live()), 'info', () =>
      bandClip(page, null, panel(INFO_SECTION, 'Firmware')),
    );
  });

  it('phone.avif: the same tab at a phone width', async () => {
    const { page } = live();
    await fitViewport(page, PHONE_WIDTH, PHONE_HEIGHT);
    await capture(page, privacyFor(live()), 'phone', () =>
      bandClip(page, null, panel(INFO_SECTION, 'What the camera reports')),
    );
    await fitViewport(page, WIDTH, HEIGHT);
  });

  it('preserve.avif: the 0.x/1.x tab after its read-only first step', async () => {
    const { page, wizard } = live();
    await wizard.route('#/preserve');
    const run = await runStep02(live().target);
    expect(run.status).toMatch(/ — done[.,]/);
    await fitViewport(page, WIDTH, HEIGHT);
    await capture(page, privacyFor(live()), 'preserve', () =>
      bandClip(page, phaseSection('read-build'), phaseSection('restore-verify')),
    );
  });
});

/* ---- the Compact 1.3.0.0: slots and 32 FPS --------------------------- */

describe('slots and 32 FPS on an emulated Compact 1.3.0.0', () => {
  let s: PagesSession | undefined;
  const live = (): PagesSession => {
    if (s === undefined) throw new Error('the session did not open');
    return s;
  };
  const EVERY = 'Make 32 FPS in every bank';

  beforeAll(async () => {
    s = await open(camera(COMPACT_1300, 'Compact 1.3.0.0'), 'compact-1300-slots', '#/slots');
  }, 10 * 60_000);

  afterAll(() => close(s));

  it('slots.avif: the banks after Read slots, with the "Make 32 FPS" buttons', async () => {
    const { page, wizard } = live();
    await wizard.connect();
    await wizard.route('#/slots');
    expect(await readSlots(wizard, page)).toMatch(/^Read\. /);
    expect(await wizard.isEnabled(SLOTS_SECTION, EVERY)).toBe(true);
    await fitViewport(page, WIDTH, HEIGHT);
    await capture(page, privacyFor(live()), 'slots', () =>
      bandClip(page, `${SLOTS_SECTION} table`, EVERY_BANK),
    );
  });

  it('fps-plan.avif: the every-bank confirmation, with its plan and warnings', async () => {
    const { page, wizard } = live();
    await wizard.click(SLOTS_SECTION, EVERY);
    await page.waitForSelector(CONFIRM_DIALOG, { timeout: 10_000 });
    await fitViewport(page, WIDTH, HEIGHT);
    await capture(page, privacyFor(live()), 'fps-plan', () => elementClip(page, CONFIRM_DIALOG));
  });

  it('fps-done.avif: the tab after every bank was patched and read back', async () => {
    const { page, wizard } = live();
    if ((await page.$('#slot-fps-every-ack')) !== null) {
      await page.$eval('#slot-fps-every-ack', (element) => {
        (element as HTMLInputElement).click();
      });
    }
    const confirm = await page.$eval(CONFIRM_DIALOG, (dialog) => {
      const yes = [...dialog.querySelectorAll('button')].find((b) =>
        b.textContent.trim().startsWith('Yes — patch'),
      );
      return yes?.textContent.trim() ?? '';
    });
    expect(confirm).toMatch(/^Yes — patch \d bank/);
    const status = await runAndSettle(
      wizard,
      page,
      () => wizard.click(CONFIRM_DIALOG, confirm),
      /^(Patched|Stopped|Failed|Cancelled)/,
      60 * 60_000,
    );
    expect(status).toMatch(/^Patched \d banks?\. Each reads back as planned\./);
    await fitViewport(page, WIDTH, HEIGHT);
    await capture(page, privacyFor(live()), 'fps-done', () =>
      bandClip(page, `${SLOTS_SECTION} table`, alertOf(SLOTS_SECTION, 'Every bank:')),
    );
  });
});

/* ---- a Compact PRO 4.9.2.0: the 4.x dump and its slots ---------------- */

describe('dump and slots on an emulated Compact PRO 4.9.2.0', () => {
  let s: PagesSession | undefined;
  const live = (): PagesSession => {
    if (s === undefined) throw new Error('the session did not open');
    return s;
  };

  beforeAll(async () => {
    s = await open(camera(PRO_4920, 'Compact PRO 4.9.2.0'), 'pro-4920', '#/v4');
  }, 10 * 60_000);

  afterAll(() => close(s));

  it('dump-4x.avif: the 4.x/Nano tab after a whole-flash dump', async () => {
    const { page, wizard } = live();
    await wizard.connect();
    await wizard.route('#/v4');
    await wizard.startDump('dump', 'Start dump');
    expect(
      await waitForText(live(), '#dump-status', /^(Done —|Refused|Failed|Cancelled)/, 40 * 60_000),
    ).toMatch(/^Done — (\d+)\/\1 windows read/);
    await fitViewport(page, WIDTH, HEIGHT);
    await capture(page, privacyFor(live()), 'dump-4x', () =>
      bandClip(page, DUMP_SECTION, DUMP_SECTION),
    );
  });

  it('slots-pro.avif: the slots tab offering "Make 18 FPS"', async () => {
    const { page, wizard } = live();
    await wizard.route('#/slots');
    expect(await readSlots(wizard, page)).toMatch(/^Read\. /);
    const labels = await page.$$eval(`${SLOTS_SECTION} button`, (buttons) =>
      buttons.map((b) => b.textContent.trim()),
    );
    expect(labels).toContain('Make 18 FPS');
    await fitViewport(page, WIDTH, HEIGHT);
    await capture(page, privacyFor(live()), 'slots-pro', () =>
      bandClip(page, `${SLOTS_SECTION} table`, EVERY_BANK),
    );
  });
});

/* ---- no camera: decrypt a whole flash file --------------------------- */

describe('decrypt a whole flash file, no camera', () => {
  let s: PagesSession | undefined;
  const live = (): PagesSession => {
    if (s === undefined) throw new Error('the session did not open');
    return s;
  };

  beforeAll(async () => {
    s = await open(null, 'decrypt', '#/decrypt');
  }, 10 * 60_000);

  afterAll(() => close(s));

  it('decrypt.avif: the Decrypt File/Slot tab after a 4 MiB flash file', async () => {
    const { page, wizard } = live();
    const dir = path.join(SCRATCH, 'decrypt', 'inputs');
    mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'flash_4m.bin');
    writeFileSync(file, corpusDump(COMPACT_4821).bytes);
    const run = await wizard.offlineDecrypt(file);
    expect(run.status).toMatch(/^Done —/);
    await fitViewport(page, WIDTH, HEIGHT);
    await capture(page, privacyFor(null), 'decrypt', () => bandClip(page, null, OFFLINE_SECTION));
  });
});
