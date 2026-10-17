/**
 * The Firmware slots page, driven and read the way a person sees it: the
 * "Read slots" run, a bank's Dump, the picker and its prepared plan, and the
 * write's confirmation dialog. Everything goes through the app's own buttons
 * and inputs (`Wizard.click`, the hidden file input), so a control the page does
 * not offer cannot be reached from here.
 */

import { mkdirSync } from 'node:fs';
import path from 'node:path';

import type { ElementHandle, Page } from 'puppeteer-core';

import { say, type Download, type DownloadWaiter } from './browser.js';
import type { Wizard } from './wizard.js';

export const SLOTS_SECTION = 'section[aria-labelledby="slots-heading"]';
export const SLOTS_TABLE_ROWS = `${SLOTS_SECTION} table tbody tr`;
export const SLOTS_STATUS = '#slotsrun-status';
export const CONFIRM_DIALOG = '[role="alertdialog"]';
export const ACK_BOX = '#slot-write-ack';

export type BankLetter = 'a' | 'b' | 'r';

/** One row of the bank table, as the page shows it. */
export interface BankRowView {
  readonly letter: BankLetter;
  /** The bank's name, as the plan gives it: "Bank A", "Recovery bank R". */
  readonly name: string;
  /** The address the row header shows: "0x14030000". */
  readonly address: string;
  readonly booted: boolean;
  /** The Firmware cell's text: the version, or why the bank was not read. */
  readonly firmware: string;
  readonly keyName: string;
  readonly bootable: string;
  readonly sha256: string;
  /** The Actions cell's whole text, reasons included. */
  readonly actionsText: string;
  /** Each button in the Actions cell, by its label, and whether it is enabled. */
  readonly buttons: readonly { readonly label: string; readonly enabled: boolean }[];
}

const LETTER_OF: Readonly<Record<string, BankLetter>> = {
  'Bank A': 'a',
  'Bank B': 'b',
  'Recovery bank R': 'r',
};

/** The bank table's rows, read from the DOM in the page. Row order is A, B, R. */
export async function bankRows(page: Page): Promise<BankRowView[]> {
  const raw = await page.$$eval(SLOTS_TABLE_ROWS, (rows) =>
    rows.map((row) => {
      const cells = [...row.querySelectorAll<HTMLElement>(':scope > th, :scope > td')];
      const header = cells[0];
      const actions = cells[cells.length - 1];
      const headerLines = (header?.innerText ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '');
      const cellText = (index: number): string =>
        (cells[index]?.innerText ?? '').replace(/\s*\n\s*/g, ' — ').trim();
      return {
        name: headerLines[0] ?? '',
        address: headerLines[1] ?? '',
        booted: (header?.innerText ?? '').includes('booted now'),
        firmware: cellText(1),
        keyName: cellText(3),
        bootable: cellText(4),
        sha256: cellText(5),
        actionsText: (actions?.innerText ?? '').replace(/\s*\n\s*/g, ' · ').trim(),
        buttons: [...(actions?.querySelectorAll('button') ?? [])].map((button) => ({
          label: button.textContent.trim(),
          enabled: !button.disabled,
        })),
      };
    }),
  );
  return raw.map((row) => {
    const letter = LETTER_OF[row.name];
    if (letter === undefined) throw new Error(`unexpected bank row "${row.name}"`);
    return { ...row, letter };
  });
}

/** The row of one bank. Throws when the table does not show it. */
export async function rowOf(page: Page, letter: BankLetter): Promise<BankRowView> {
  const found = (await bankRows(page)).find((row) => row.letter === letter);
  if (found === undefined) throw new Error(`the bank table has no row for ${letter.toUpperCase()}`);
  return found;
}

/** The summary the page shows above the table, as label → value (lower-cased labels). */
export async function summaryRows(page: Page): Promise<Record<string, string>> {
  return page.evaluate((sel: string) => {
    const out: Record<string, string> = {};
    for (const dt of document.querySelectorAll(`${sel} dl dt`)) {
      const dd = dt.nextElementSibling as HTMLElement | null;
      out[(dt as HTMLElement).innerText.trim().toLowerCase()] = dd?.innerText.trim() ?? '';
    }
    return out;
  }, SLOTS_SECTION);
}

/**
 * Starts a run from the page, and resolves once its status line reads a final
 * outcome matching `done` and the run's Cancel is back to disabled. The status
 * is watched from before the click, so the line a PREVIOUS run left ("Read. 3/3
 * banks read.") is never taken for this run's. Returns the final status text.
 */
export async function runAndSettle(
  w: Wizard,
  page: Page,
  start: () => Promise<void>,
  done: RegExp,
  timeoutMs: number,
): Promise<string> {
  const moved = await w.watchStatus(SLOTS_STATUS);
  await start();
  await moved();
  await page.waitForFunction(
    (sel: string, source: string) => {
      const status = document.querySelector<HTMLElement>(sel)?.innerText ?? '';
      return new RegExp(source).test(status);
    },
    { timeout: timeoutMs, polling: 500 },
    SLOTS_STATUS,
    done.source,
  );
  await page.waitForFunction(
    (sel: string) => {
      const cancel = [...(document.querySelector(sel)?.querySelectorAll('button') ?? [])].find(
        (b) => b.textContent.trim() === 'Cancel',
      );
      return cancel?.disabled !== false;
    },
    { timeout: 60_000, polling: 250 },
    SLOTS_SECTION,
  );
  return w.text(SLOTS_STATUS);
}

/** Presses "Read slots" and waits for the run to settle. */
export async function readSlots(w: Wizard, page: Page): Promise<string> {
  return runAndSettle(
    w,
    page,
    () => w.click(SLOTS_SECTION, 'Read slots'),
    /^(Read\. |Refused|Failed|Not supported|Cancelled)/,
    10 * 60_000,
  );
}

/** The row's own button, by the bank's letter. The table is A, B, R top to bottom. */
async function rowHandle(page: Page, letter: BankLetter): Promise<ElementHandle> {
  const rows = await page.$$(SLOTS_TABLE_ROWS);
  const index = { a: 0, b: 1, r: 2 }[letter];
  const row = rows[index];
  if (row === undefined) throw new Error(`the bank table has no row ${String(index)}`);
  return row;
}

/**
 * The name the page saves a bank's RAW dump under. A bank with an image is named by its
 * version (`seek-slot-B-v0.9.1.0-raw-<sha8>.bin`); an empty bank has no version, so it is
 * named by its state (`seek-slot-B-empty-raw-<sha8>.bin`, TESTING 42.8).
 */
export function rawDumpNamePattern(letter: BankLetter): RegExp {
  return new RegExp(`^seek-slot-${letter.toUpperCase()}-(?:v.+|empty)-raw-[0-9a-f]{8}\\.bin$`);
}

/**
 * The name the page saves a bank's DECRYPTED dump under, when a recovered key opens it. An
 * empty bank has none: there is nothing in it to decrypt.
 */
export function decryptedDumpNamePattern(letter: BankLetter): RegExp {
  return new RegExp(
    `^seek-slot-${letter.toUpperCase()}-v.+-decrypted-[0-9a-f]{8}(-KeyA-[0-9a-f]{32}-KeyB-[0-9a-f]{32})?\\.bin$`,
  );
}

/**
 * Presses one bank's Dump and returns the file(s) it saved: the raw 64 KiB, and
 * the decrypted image when a recovered key opens the bank (null when none does).
 */
export async function dumpBank(
  w: Wizard,
  page: Page,
  downloads: DownloadWaiter,
  letter: BankLetter,
): Promise<{
  readonly raw: Download;
  readonly decrypted: Download | null;
  readonly status: string;
}> {
  const name = letter.toUpperCase();
  const row = await rowHandle(page, letter);
  const status = await runAndSettle(
    w,
    page,
    () => w.click(row, 'Dump'),
    /^(Dumped slot|Failed|Cancelled)/,
    20 * 60_000,
  );
  const rawPattern = rawDumpNamePattern(letter);
  const decryptedPattern = decryptedDumpNamePattern(letter);
  const raw = await downloads.waitFor(
    (file) => rawPattern.test(file),
    60_000,
    `the raw dump of slot ${name}`,
  );
  const decrypted = await downloads
    .waitFor((file) => decryptedPattern.test(file), 5_000, `the decrypted dump of slot ${name}`)
    .catch((): null => null);
  return { raw, decrypted, status };
}

/**
 * Presses a bank row's own "Use … image" button (the empty bank's fill, from the booted bank or
 * another bank that holds an image) and waits for the plan to be prepared: "Ready — review the
 * plan" or "Rejected — …". Returns the button's label and the status line.
 */
export async function fillFromBank(
  w: Wizard,
  page: Page,
  letter: BankLetter,
): Promise<{ readonly label: string; readonly status: string }> {
  const row = await rowOf(page, letter);
  const button = row.buttons.find((candidate) => candidate.label.startsWith('Use '));
  if (button === undefined) {
    throw new Error(
      `bank ${letter.toUpperCase()} offers no "Use … image" button (its buttons: ${row.buttons
        .map((candidate) => candidate.label)
        .join(', ')})`,
    );
  }
  const handle = await rowHandle(page, letter);
  const moved = await w.watchStatus(SLOTS_STATUS);
  await w.click(handle, button.label);
  await moved();
  await page.waitForFunction(
    (sel: string) =>
      /^(Ready|Rejected)/.test(document.querySelector<HTMLElement>(sel)?.innerText ?? ''),
    { timeout: 60_000, polling: 250 },
    SLOTS_STATUS,
  );
  return { label: button.label, status: await w.text(SLOTS_STATUS) };
}

/**
 * Hands a file to a bank's picker and waits for the page to settle: "Ready —
 * review the plan" or "Rejected — …". Returns the status line.
 */
export async function pickImage(
  w: Wizard,
  page: Page,
  letter: BankLetter,
  kind: 'plain' | 'raw',
  filePath: string,
): Promise<string> {
  const input = (await page.$(
    `#slot-${letter}-${kind}-file`,
  )) as ElementHandle<HTMLInputElement> | null;
  if (input === null) throw new Error(`no ${kind} picker for bank ${letter.toUpperCase()}`);
  const moved = await w.watchStatus(SLOTS_STATUS);
  await input.uploadFile(filePath);
  await moved();
  await page.waitForFunction(
    (sel: string) =>
      /^(Ready|Rejected)/.test(document.querySelector<HTMLElement>(sel)?.innerText ?? ''),
    { timeout: 60_000, polling: 250 },
    SLOTS_STATUS,
  );
  return w.text(SLOTS_STATUS);
}

/** What the prepared-write panel shows, as text: its title, its rows, and its warnings. */
export interface PreparedView {
  readonly title: string;
  readonly text: string;
  readonly warnings: readonly string[];
  /** The "What changes in …" compare table's body rows, each as one line. */
  readonly compareRows: readonly string[];
}

export async function preparedView(page: Page): Promise<PreparedView | null> {
  return page.evaluate(() => {
    const panel = [...document.querySelectorAll<HTMLElement>('[data-slot="panel"]')].find((el) =>
      (el.querySelector('h3')?.innerText ?? '').startsWith('Prepared for '),
    );
    if (panel === undefined) return null;
    const warnings = [...panel.querySelectorAll<HTMLElement>('[data-slot="alert"]')].map((alert) =>
      alert.innerText.trim(),
    );
    const compareRows = [...panel.querySelectorAll<HTMLElement>('table')]
      .filter((table) =>
        (table.querySelector('caption')?.innerText ?? '').includes('What changes in'),
      )
      .flatMap((table) => [...table.querySelectorAll<HTMLElement>('tbody tr')])
      .map((tr) => tr.innerText.replace(/\s*\n\s*/g, ' | ').trim());
    return {
      title: panel.querySelector<HTMLElement>('h3')?.innerText.trim() ?? '',
      text: panel.innerText,
      warnings,
      compareRows,
    };
  });
}

/**
 * Presses "Write to <bank>…" on the prepared plan and waits for the
 * confirmation dialog to open.
 */
export async function openWriteConfirm(w: Wizard, page: Page, slotName: string): Promise<void> {
  await w.click(SLOTS_SECTION, `Write to ${slotName}…`);
  await page.waitForSelector(CONFIRM_DIALOG, { timeout: 10_000 });
}

/** Whether the open confirmation's own confirm button is pressable right now. */
export async function confirmEnabled(w: Wizard, slotName: string): Promise<boolean> {
  return w.isEnabled(CONFIRM_DIALOG, `Yes — write to ${slotName}`);
}

/**
 * Presses the confirmation's "Yes — write to <bank>" and waits for the write to
 * end. A bank that needs the extra acknowledgement is ticked first, and only
 * then is the confirm pressed (the caller checks it was disabled before).
 */
export async function confirmWrite(
  w: Wizard,
  page: Page,
  slotName: string,
  acknowledge: boolean,
): Promise<string> {
  if (acknowledge) await page.click(ACK_BOX);
  return runAndSettle(
    w,
    page,
    () => w.click(CONFIRM_DIALOG, `Yes — write to ${slotName}`),
    /^(Written|Failed|Cancelled)/,
    30 * 60_000,
  );
}

/** Every alert text inside the slots section: the refusal, the outcome, the warnings. */
export async function slotsAlerts(page: Page): Promise<string[]> {
  return page.evaluate((sel: string) => {
    const section = document.querySelector(sel);
    return [...(section?.querySelectorAll<HTMLElement>('[data-slot="alert"]') ?? [])].map((alert) =>
      alert.innerText.trim(),
    );
  }, SLOTS_SECTION);
}

/** The write's verdict panel, when one is shown: the alert that starts "Slot A — ", "Slot B — " or "Slot R — ". */
export async function outcomeAlert(page: Page): Promise<string | null> {
  const alerts = await slotsAlerts(page);
  return alerts.find((text) => /^Slot [ABR] — /.test(text)) ?? null;
}

/**
 * Writes a full-page screenshot to `dir/name.png` when `dir` is given; does
 * nothing otherwise. The viewport is whatever the page has now.
 */
export async function snap(page: Page, dir: string | null, name: string): Promise<void> {
  if (dir === null) return;
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  say(`screenshot: ${file}`);
}
