/* ==================================================================== *
 * Phone-width layout in every language — `npm run e2e:phone:i18n`.
 *
 * 360x740 with touch (the small common Android size), light theme. For every
 * language the page offers (read from its own language switch, so a language
 * added to the registry is covered without touching this file), each tab is
 * opened with `?lang=xx`, closed and with every fold-out open, plus the states
 * reachable without hardware: the Preserve summary of a verified run and of a
 * run stopped as planned (crafted run files), and the Decrypt tab after a file
 * it cannot use. Each state must have:
 *
 *   - no horizontal page overflow, no element past the viewport's edge, and no
 *     button, tab or badge sticking out of the card or panel it sits in;
 *   - no clipped text: no element that hides its overflow (or ends it with an
 *     ellipsis) while its content is wider than its box, and no button, tab,
 *     badge, row label or heading whose text spills out of its box;
 *   - no table that scrolls sideways (below 48rem every row is a card that
 *     must fit), and the masthead title whole;
 *   - no two buttons, tabs or badges on top of each other, and no heading
 *     whose text runs under a badge or button beside it (a section heading
 *     and its "writes to flash" badge, measured on the text's line boxes).
 *
 * Exempt, because they are built to scroll sideways: the hex blocks
 * (HexBlock, a fixed-width dump that keeps its columns) and the run logs
 * (RunPanel, which wraps anyway). Every other overflow is a failure, listed
 * as language, state, element, text and widths.
 *
 * A full-page screenshot per language and state goes to SEEK_E2E_SHOTS (kept
 * with SEEK_E2E_KEEP=1), with the masthead as a phone first shows it. The
 * summary also names, per language, the button and badge labels that now take
 * two lines (a close-up of each is saved beside the screenshots, as is one of
 * each section heading that carries a badge, `header-<section>-<n>.png`) and how many
 * rows the tab strip takes: neither fails the run, both are worth a look. Not reachable here: the camera's own states (the
 * slot table, the slot write and FPS dialogs, a running Preserve phase), and
 * the language menu itself, which is the system's native picker.
 *
 * No camera, no emulator: the page alone, in Chrome.
 * ==================================================================== */

import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { ElementHandle, Page } from 'puppeteer-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  CHROME_PATH,
  launchChrome,
  say,
  startDevServer,
  type DevServer,
  type LaunchedChrome,
} from './lib/browser.js';
import { plannedStopRunState, runFileZip, verifiedRunState } from './lib/run-files.js';

const KEEP = process.env.SEEK_E2E_KEEP === '1';
/* SEEK_E2E_WIDTH / SEEK_E2E_HEIGHT try another size; SEEK_E2E_LANGS (`de,fr`) a few languages. */
const WIDTH = Number(process.env.SEEK_E2E_WIDTH ?? 360);
const HEIGHT = Number(process.env.SEEK_E2E_HEIGHT ?? 740);
const ONLY = (process.env.SEEK_E2E_LANGS ?? '').split(',').filter((code) => code !== '');
const SCRATCH =
  process.env.SEEK_E2E_SCRATCH ?? path.join(tmpdir(), `seek-e2e-phone-i18n-${String(process.pid)}`);
const SHOTS = process.env.SEEK_E2E_SHOTS ?? path.join(SCRATCH, 'screenshots');

const unavailable = existsSync(CHROME_PATH) ? null : `no Chrome at ${CHROME_PATH}`;
if (unavailable !== null) process.stderr.write(`\n[skip] phone layout i18n: ${unavailable}\n`);

/** One thing wrong on one screen. */
interface Problem {
  readonly kind: string;
  readonly element: string;
  readonly text: string;
  readonly widths: string;
}

/**
 * Runs in the page: every layout problem on the screen as it is now. Kept
 * self-contained (no closures) because puppeteer serialises it.
 */
function findProblems(viewportWidth: number): Problem[] {
  const problems: Problem[] = [];
  const describeEl = (el: Element): string => {
    const id = el.id === '' ? '' : `#${el.id}`;
    const slot = el.getAttribute('data-slot');
    const section = el.closest('section[aria-labelledby]')?.getAttribute('aria-labelledby') ?? '';
    return `${el.tagName.toLowerCase()}${id}${slot === null ? '' : `[${slot}]`}${section === '' ? '' : ` in ${section.replace(/-heading$/, '')}`}`;
  };
  const textOf = (el: Element): string => el.textContent.replace(/\s+/g, ' ').trim().slice(0, 90);
  const px = (n: number): string => `${String(Math.round(n))}px`;
  const visible = (el: Element): boolean => {
    if (el.getClientRects().length === 0) return false;
    const style = getComputedStyle(el);
    return style.visibility !== 'hidden' && style.opacity !== '0';
  };
  /* Screen-reader-only text, and the table headers the phone layout hides the
   * same way (styles.css), are 1px boxes that clip on purpose. */
  const srOnly = (el: Element): boolean => el.closest('.sr-only, .table-cards thead') !== null;
  /* Built to scroll sideways: a hex block keeps its columns, a run log its lines. */
  const designedScroller = (el: Element): boolean =>
    el.matches('.font-mono.overflow-x-auto, .overflow-y-auto');
  const scrollsX = (style: CSSStyleDeclaration): boolean =>
    style.overflowX === 'auto' || style.overflowX === 'scroll';
  const clipsX = (style: CSSStyleDeclaration): boolean =>
    style.overflowX === 'hidden' || style.overflowX === 'clip';

  const doc = document.scrollingElement ?? document.documentElement;
  if (doc.scrollWidth > doc.clientWidth + 1) {
    problems.push({
      kind: 'page overflows sideways',
      element: 'document',
      text: '',
      widths: `scrollWidth ${px(doc.scrollWidth)} > ${px(doc.clientWidth)}`,
    });
  }

  const all = [...document.querySelectorAll('body *')].filter(
    (el) => visible(el) && !srOnly(el) && el.tagName !== 'svg' && el.closest('svg') === null,
  );
  const inScroller = (el: Element): boolean => {
    for (let up = el.parentElement; up !== null && up !== document.body; up = up.parentElement) {
      const style = getComputedStyle(up);
      if (scrollsX(style) || clipsX(style)) return true;
    }
    return false;
  };
  const ownText = (el: Element): boolean =>
    [...el.childNodes].some((node) => node.nodeType === 3 && (node.textContent ?? '').trim());
  const labelled = 'button, a, [data-slot="badge"], th, dt, label, h1, h2, h3, h4, summary';

  /* Past the viewport's edge, outside any scroller: report the elements that
   * carry the text, which name the culprit better than their wrappers. */
  const past = all.filter((el) => {
    if (inScroller(el)) return false;
    const rect = el.getBoundingClientRect();
    return rect.right > viewportWidth + 1 || rect.left < -1;
  });
  const named = past.filter((el) => ownText(el) || el.matches(labelled));
  for (const el of (named.length > 0 ? named : past).slice(0, 12)) {
    const rect = el.getBoundingClientRect();
    problems.push({
      kind: 'past the viewport edge',
      element: describeEl(el),
      text: textOf(el),
      widths: `left ${px(rect.left)}, right ${px(rect.right)}, width ${px(rect.width)} (viewport ${px(viewportWidth)})`,
    });
  }

  /* Inside the viewport but out of its own box: a control wider than the card
   * or panel it sits in, drawn across that panel's border. */
  for (const el of all) {
    if (!el.matches('button, nav a, [data-slot="badge"]') || inScroller(el)) continue;
    let box = el.parentElement;
    while (box !== null && getComputedStyle(box).display.startsWith('inline')) {
      box = box.parentElement;
    }
    if (box === null) continue;
    const rect = el.getBoundingClientRect();
    const outer = box.getBoundingClientRect();
    if (rect.right > outer.right + 1 || rect.left < outer.left - 1) {
      problems.push({
        kind: 'sticks out of its container',
        element: `${describeEl(el)} (in ${box.tagName.toLowerCase()})`,
        text: textOf(el),
        widths: `${px(rect.left)}..${px(rect.right)} in ${px(outer.left)}..${px(outer.right)}`,
      });
    }
  }

  for (const el of all) {
    const style = getComputedStyle(el);
    const wider = el.scrollWidth > el.clientWidth + 1;
    if (scrollsX(style) && wider) {
      if (designedScroller(el)) continue;
      problems.push({
        kind: el.querySelector('table') === null ? 'scrolls sideways' : 'table scrolls sideways',
        element: describeEl(el),
        text: textOf(el),
        widths: `content ${px(el.scrollWidth)} in ${px(el.clientWidth)}`,
      });
    } else if ((clipsX(style) || style.textOverflow === 'ellipsis') && wider && textOf(el)) {
      problems.push({
        kind: 'text clipped',
        element: describeEl(el),
        text: textOf(el),
        widths: `content ${px(el.scrollWidth)} in ${px(el.clientWidth)}`,
      });
    } else if (el.matches(labelled) && wider && textOf(el)) {
      problems.push({
        kind: 'text spills out of its box',
        element: describeEl(el),
        text: textOf(el),
        widths: `content ${px(el.scrollWidth)} in ${px(el.clientWidth)}`,
      });
    } else if (
      el.matches('button, [data-slot="badge"], nav a') &&
      el.scrollHeight > el.clientHeight + 2 &&
      textOf(el)
    ) {
      problems.push({
        kind: 'text spills out of its box (height)',
        element: describeEl(el),
        text: textOf(el),
        widths: `content ${px(el.scrollHeight)} high in ${px(el.clientHeight)}`,
      });
    }
  }

  const title = document.querySelector('header h1');
  if (title === null) {
    problems.push({ kind: 'no masthead title', element: 'header h1', text: '', widths: '' });
  } else {
    const rect = title.getBoundingClientRect();
    if (title.scrollWidth > title.clientWidth + 1 || rect.right > viewportWidth + 1) {
      problems.push({
        kind: 'masthead title clipped',
        element: 'header h1',
        text: textOf(title),
        widths: `content ${px(title.scrollWidth)} in ${px(title.clientWidth)}, right ${px(rect.right)}`,
      });
    }
  }

  /* Controls on top of each other. Inline links in prose are left out: a link
   * that wraps has a box spanning both lines. */
  const controls = all.filter(
    (el) =>
      el.matches('button, nav a, [data-slot="badge"], header h1') &&
      getComputedStyle(el).display !== 'inline',
  );
  for (let i = 0; i < controls.length; i += 1) {
    for (let j = i + 1; j < controls.length; j += 1) {
      const a = controls[i];
      const b = controls[j];
      if (a === undefined || b === undefined || a.contains(b) || b.contains(a)) continue;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (w > 1 && h > 1) {
        problems.push({
          kind: 'controls overlap',
          element: `${describeEl(a)} / ${describeEl(b)}`,
          text: `${textOf(a)} / ${textOf(b)}`,
          widths: `${px(w)} x ${px(h)} shared`,
        });
      }
    }
  }

  /* A heading's text under a badge or button beside it. Measured on the text's
   * own line boxes, not the heading's box: a heading squeezed narrower than a
   * word draws that word past its box, onto whatever sits next to it. */
  for (const heading of all.filter((el) => el.matches('h1, h2, h3'))) {
    const range = document.createRange();
    range.selectNodeContents(heading);
    const lines = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
    for (const control of controls) {
      if (control.contains(heading) || heading.contains(control)) continue;
      const rc = control.getBoundingClientRect();
      const hit = lines.find(
        (r) =>
          Math.min(r.right, rc.right) - Math.max(r.left, rc.left) > 1 &&
          Math.min(r.bottom, rc.bottom) - Math.max(r.top, rc.top) > 1,
      );
      if (hit !== undefined) {
        problems.push({
          kind: 'heading text under a control',
          element: `${describeEl(heading)} / ${describeEl(control)}`,
          text: `${textOf(heading)} / ${textOf(control)}`,
          widths: `text ${px(hit.left)}..${px(hit.right)}, control ${px(rc.left)}..${px(rc.right)}`,
        });
      }
    }
  }
  return problems;
}

/**
 * Runs in the page: marks every button and badge whose label now takes more
 * than one line with `data-e2e-wrapped` (not a failure — the label wraps by
 * design — but a translation worth a look), and returns their labels.
 */
function markWrapped(): string[] {
  const wrapped: string[] = [];
  for (const el of document.querySelectorAll('button, [data-slot="badge"]')) {
    if (el.getClientRects().length === 0) continue;
    /* The label's own text lines: icons and screen-reader text left out. */
    const tops: number[] = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
      if (node.parentElement?.closest('.sr-only') !== null) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) if (rect.width > 0) tops.push(rect.top);
    }
    tops.sort((x, y) => x - y);
    const lines = tops.filter((top, i) => i === 0 || top - (tops[i - 1] ?? top) > 6).length;
    if (lines > 1) {
      el.setAttribute('data-e2e-wrapped', '');
      wrapped.push(`${el.textContent.replace(/\s+/g, ' ').trim()} (${String(lines)} lines)`);
    }
  }
  return wrapped;
}

describe.skipIf(unavailable !== null)(
  `phone-width layout in every language (${String(WIDTH)}x${String(HEIGHT)})`,
  () => {
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
      say(`screenshots (${String(shots.length)}) in ${SHOTS}`);
      if (!KEEP && SHOTS.startsWith(SCRATCH)) rmSync(SCRATCH, { recursive: true, force: true });
    });

    it('fits every tab and state at phone width, in every language', async () => {
      const srv = server;
      const ch = chrome;
      if (srv === null || ch === null) throw new Error('setup failed');
      const verifiedFile = path.join(SCRATCH, 'verified-sample.zip');
      const stoppedFile = path.join(SCRATCH, 'stopped-sample.zip');
      const unusableFile = path.join(SCRATCH, 'unusable-dump.bin');
      writeFileSync(verifiedFile, runFileZip(verifiedRunState()));
      writeFileSync(stoppedFile, runFileZip(plannedStopRunState()));
      writeFileSync(unusableFile, new Uint8Array(4096).fill(0xa5));

      const page: Page = await ch.browser.newPage();
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
      await page.setViewport({
        width: WIDTH,
        height: HEIGHT,
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      });

      await page.goto(srv.url, { waitUntil: 'networkidle0' });
      const languages = await page.$$eval('#language-switch option', (options) =>
        options.map((option) => option.value),
      );
      say(`languages (${String(languages.length)}): ${languages.join(', ')}`);
      expect(languages.length).toBeGreaterThan(1);

      const failures: string[] = [];
      const summary: string[] = [];

      for (const lang of languages.filter((code) => ONLY.length === 0 || ONLY.includes(code))) {
        const dir = path.join(SHOTS, lang);
        mkdirSync(dir, { recursive: true });
        let states = 0;
        let found = 0;
        const wraps = new Set<string>();
        const headers = new Set<string>();
        let tabRows = 0;

        const check = async (name: string): Promise<void> => {
          states += 1;
          const shown = await page.$eval(
            '#language-switch',
            (el) => (el as HTMLSelectElement).value,
          );
          expect(shown, `${name}: the page is not in ${lang}`).toBe(lang);
          /* `<html lang>` (hyphenation, voices) is the tag the switcher marks this language with. */
          const tags = await page.evaluate(() => [
            document.documentElement.lang,
            document.querySelector('#language-switch option:checked')?.getAttribute('lang') ?? '',
          ]);
          expect(tags[0], `${name}: <html lang> in ${lang}`).toBe(tags[1]);
          const problems = await page.evaluate(findProblems, WIDTH);
          const file = path.join(dir, `${String(states).padStart(2, '0')}-${name}.png`);
          await page.screenshot({ path: file, fullPage: true });
          shots.push(file);
          found += problems.length;
          /* A close-up of each wrapped label, so a reviewer sees how it wraps. */
          const labels = await page.evaluate(markWrapped);
          const marked = await page.$$('[data-e2e-wrapped]');
          for (const [i, label] of labels.entries()) {
            const handle = marked[i];
            if (wraps.has(label) || handle === undefined) continue;
            wraps.add(label);
            const close = path.join(dir, `wrapped-${String(wraps.size).padStart(2, '0')}.png`);
            await handle.screenshot({ path: close });
          }
          await page.$$eval('[data-e2e-wrapped]', (all) => {
            for (const el of all) el.removeAttribute('data-e2e-wrapped');
          });
          /* A close-up of each section heading that carries a badge, once per heading and badge. */
          for (const header of await page.$$('section [data-slot="card-header"]')) {
            const { id, badges } = await header.evaluate((el) => ({
              id:
                el
                  .closest('section')
                  ?.getAttribute('aria-labelledby')
                  ?.replace(/-heading$/, '') ?? '',
              badges:
                el.getClientRects().length === 0
                  ? ''
                  : [...el.querySelectorAll('[data-slot="badge"]')]
                      .filter((badge) => badge.getClientRects().length > 0)
                      .map((badge) => badge.textContent)
                      .join(' | '),
            }));
            if (id === '' || badges === '' || headers.has(`${id}: ${badges}`)) continue;
            headers.add(`${id}: ${badges}`);
            const n = [...headers].filter((seen) => seen.startsWith(`${id}: `)).length;
            await header.screenshot({ path: path.join(dir, `header-${id}-${String(n)}.png`) });
          }
          for (const p of problems) {
            failures.push(
              `${lang} · ${name} · ${p.kind} · ${p.element} · "${p.text}" · ${p.widths}`,
            );
          }
        };
        /* Through a blank page, so the same address again is a fresh load, not a hash change. */
        const open = async (hash: string): Promise<void> => {
          await page.goto('about:blank');
          await page.goto(`${srv.url}?lang=${lang}${hash}`, { waitUntil: 'networkidle0' });
        };
        const openFoldOuts = async (): Promise<number> =>
          page.$$eval('details:not([open])', (all) => {
            for (const details of all) details.open = true;
            return all.length;
          });
        /* The run-file button makes its input on the click; the dump pickers keep theirs. */
        const loadRun = async (file: string): Promise<void> => {
          const chooser = page.waitForFileChooser({ timeout: 15_000 });
          /* A DOM click: a button pushed past the screen's edge has no point to tap. */
          await page.$eval('#preservePickRun', (button) => {
            (button as HTMLButtonElement).click();
          });
          await (await chooser).accept([file]);
        };
        const upload = async (input: string, file: string): Promise<void> => {
          const handle = (await page.$(input)) as ElementHandle<HTMLInputElement> | null;
          if (handle === null) throw new Error(`${lang}: no ${input}`);
          await handle.uploadFile(file);
        };
        const settle = async (selector: string): Promise<void> => {
          await page
            .waitForFunction(
              (sel: string) => (document.querySelector(sel)?.textContent ?? '').trim() !== '',
              { timeout: 15_000 },
              selector,
            )
            .catch(() => undefined);
          await new Promise((resolve) => setTimeout(resolve, 300));
        };

        for (const [name, hash] of [
          ['info', '#/'],
          ['preserve', '#/preserve'],
          ['v4', '#/v4'],
          ['decrypt', '#/decrypt'],
          ['slots', '#/slots'],
        ] as const) {
          await open(hash);
          if (name === 'info') {
            /* The masthead and the tab strip as a phone shows them first. */
            const top = path.join(dir, '00-masthead.png');
            await page.screenshot({ path: top });
            shots.push(top);
            tabRows = await page.$$eval('header nav a', (tabs) =>
              tabs.reduce(
                (rows, tab, i) =>
                  i > 0 &&
                  tab.getBoundingClientRect().top >
                    (tabs[i - 1]?.getBoundingClientRect().top ?? 0) + 4
                    ? rows + 1
                    : rows,
                tabs.length === 0 ? 0 : 1,
              ),
            );
          }
          await check(name);
          if ((await openFoldOuts()) > 0) await check(`${name}-open`);
        }

        await open('#/preserve');
        await loadRun(verifiedFile);
        await settle('#preserve-load-status');
        await check('preserve-verified');
        await open('#/preserve');
        await loadRun(stoppedFile);
        await settle('#preserve-load-status');
        await check('preserve-stopped');
        await openFoldOuts();
        await check('preserve-stopped-open');

        await open('#/decrypt');
        await upload('#filePick', unusableFile);
        await settle('#offline-status');
        await upload('#slotFilePick', unusableFile);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await check('decrypt-file');

        summary.push(
          `${lang.padEnd(8)} ${String(states)} states, ${found === 0 ? 'fits' : `${String(found)} problem(s)`}, tabs in ${String(tabRows)} row(s)` +
            (wraps.size === 0 ? '' : `; labels on two lines: ${[...wraps].join(' | ')}`),
        );
      }
      await page.close();

      say(`phone layout by language (${String(WIDTH)}px):\n  ${summary.join('\n  ')}`);
      if (failures.length > 0) {
        expect.fail(
          `${String(failures.length)} layout problem(s) at ${String(WIDTH)}px:\n  ${failures.join('\n  ')}`,
        );
      }
    });
  },
);
