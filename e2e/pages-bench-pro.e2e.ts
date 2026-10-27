/* ====================================================================
 * The web app's Info and Firmware slots pages on the REAL bench Compact PRO board running
 * 1.0.3.0 (the FF board, serial 090BB12PR939, bootloader 1.2.0.0, boot-config word 0xFFFFFFFF),
 * through Electron and real WebUSB: `npm run e2e:pages:bench:pro`. The 2014 Compact 1.3.0.0 bench
 * has its own spec (`pages-bench.e2e.ts`); nothing here changes it.
 *
 * THE BENCH (TESTING.md 42.85):
 *   SEEK_E2E_WRITE=i-understand      the gate (`approveWrite`); never in CI
 *   SEEK_E2E_SWITCH_DIR, SEEK_E2E_SWITCH_CHANNEL=2
 *                                    the replug is a power cycle of the camera's switch channel
 *   SEEK_E2E_START_IMAGE=<file>      the whole 4 MiB flash, read halted with the J-Link BEFORE this run
 *                                    (the FF target's runner: `node tools/jlink/jlink-runner.js
 *                                    dump-spifi-4m-halted` in FW-V1 targets/compact_pro_ff_18hz_4_18_2_0).
 *                                    The page's dumps are compared with its banks. The spec runs no
 *                                    J-Link itself: the J-Link reads before and after it are the
 *                                    operator's, with that runner, and nothing is restored at the end
 *                                    (the run's purpose is to leave the camera patched).
 *   SEEK_E2E_PRO_PATCHED=r           the banks that hold the 18 Hz patch when the run starts (comma
 *                                    list of a, b, r; default none): what the reads must show
 *   SEEK_E2E_PRO_PATCH=a             the banks the run patches with the bank row's "Make 18 FPS", in
 *                                    order (default a; `none` only reads). Each patch is followed by
 *                                    the replug and a read of Info and Firmware slots
 *   SEEK_E2E_PRO_UNDO=a=<file>       before the patches: "Flash decrypted image" of <file> on that bank,
 *                                    the undo the frame-rate dialog names (the decrypted dump the patch
 *                                    saved first). The bank then holds no patch. Default: no undo
 *   SEEK_E2E_PRO_STEPS=<steps>       after the patches: the bank actions of TESTING.md 42.91, in order,
 *                                    separated by ';': `copy a b` (the row's "Copy to slot B"),
 *                                    `restore <bank> <stock|patched> <file>` ("Restore from full flash
 *                                    backup" with a 4 MiB file; the word says what the bank holds after),
 *                                    `every` ("Make 18 FPS in every bank"), `cancel <bank> <file>` (that
 *                                    restore, confirmed, then the section's Cancel at once: the status
 *                                    "Cancelled — nothing was written.", no commit, the bank unchanged
 *                                    after the replug). Each write checks its plan, its
 *                                    backup zip (its name, and that its files are the bank as it was) and
 *                                    its result, then the replug and the reads. Default: none
 *   SEEK_E2E_PRO_OUT=<dir>           where the page text, screenshots and dumps are kept (default: the
 *                                    scratch folder's `out`)
 *   SEEK_E2E_SOURCE=docs|dev         the hosted bundle (`docs/`, default: the page the owner opens) or
 *                                    the Vite dev server
 *
 * ONE WINDOW for the whole run, as a person uses the app: Connect, Info's "Read firmware version",
 * the Firmware slots tab's "Read slots" and Dump A, B and R, then per patched bank its "Make 18 FPS"
 * (the dialog, the acknowledgement it asks, the write), the replug (a power cycle, then Connect device
 * again: Electron keeps no grant across it), and Info and Read slots again. The page guard is the slots bench's
 * (`benchGuardScript`: the Info read's selectors let out by shape, the stage and commit budgets 0
 * except inside the one patch the test opens), and the UI guard is the slots bench's too.
 *
 * What it checks on 1.0.3.0 (TESTING.md 42.84): one Info read under compact-2016 (no legacy-auth
 * first read), the bootloader's record as "Booted" and slot A as "Next start", the check key (key
 * block 1 faacb3c6...), every bank bootable and the patched ones named "frame-rate patch 18 Hz",
 * one Writing section, none of the stale lines; on the slots page the same boot facts, the
 * frame-rate warning exactly when a bank other than A holds the patch and A does not, the offer
 * enabled on every bank (never gated); the patch's dialog, its status and one replug line.
 * And the words 42.86 fixed: the capitalised replug prompt once (the result panel), one replug record in
 * the log and none in the status; a patched bank's row "Frame-rate patch applied"; no code name
 * (acknowledgeRisk, the table id) on the slots page; the probe's score and the read's score each labelled.
 * And 42.87's: the staging note once on the page (not on every bank row); the extra confirmation once in
 * the booted bank's row and once in R's (not in R's note and under each flash button); the staging form in
 * words in the write log, not its code name; the boot note naming no front end; a write plan saying the
 * acknowledgement once.
 * And 42.88's: a write plan's "Read before writing" lists its warnings and only this write's own notes, not
 * the camera's notes shown above it (no "Note: Staged: …" there); the key recovery's verdict in words in the
 * read-back and dump lines ("key verified by the acceptance sum 0x00000000", never "VERIFIED(profile)"); the
 * frame-rate dialog naming no row by its record or link code names.
 * And 42.91's: every write saves its bank first as one zip download (no save dialog), named with the time,
 * the serial, the firmware, the bank and the write; each row's "Copy to …" and "Restore from full flash
 * backup…"; "Make 18 FPS in every bank".
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { basename } from 'node:path';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { ElementHandle } from 'puppeteer-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { say } from './lib/browser.js';
import { waitForBackupZip, type BackupZip } from './lib/backup-zip.js';
import { describeWire } from './lib/checks.js';
import { countsOf, guardOf, setGuard } from './lib/electron-camera.js';
import { electronBinary } from './lib/electron.js';
import { cameraBusyReason } from './lib/preflight.js';
import { HEADED } from './lib/spec.js';
import { approveWrite, type WriteApproval } from './lib/supervised-write.js';
import { closeSharedDevServer, openTarget, type TargetHandle } from './lib/target.js';
import { guardInstalled, refusalsOf } from './lib/target-tools.js';
import { createBenchCamera, type BenchCamera } from './lib/bench/index.js';
import { SLOTS_BENCH_UI, benchGuardScript, checkChooserEntry } from './lib/bench/spec-page.js';
import {
  ACK_BOX,
  CONFIRM_DIALOG,
  SLOTS_SECTION,
  SLOTS_TABLE_ROWS,
  bankRows,
  confirmWrite,
  copyLabel,
  dumpBank,
  openWriteConfirm,
  outcomeAlert,
  pickImage,
  preparedView,
  readSlots,
  runAndSettle,
  summaryRows,
  writeBanner,
  type BankLetter,
} from './lib/slots-page.js';

/* ---------------------------------------------------------------------------------- */
/* The bench and the run's settings                                                   */

const SCRATCH =
  process.env.SEEK_E2E_SCRATCH ??
  path.join(tmpdir(), `seek-e2e-pages-bench-pro-${String(process.pid)}`);
const OUT = process.env.SEEK_E2E_PRO_OUT ?? path.join(SCRATCH, 'out');
const SOURCE: 'docs' | 'dev' = process.env.SEEK_E2E_SOURCE === 'dev' ? 'dev' : 'docs';
const START_IMAGE_FILE = process.env.SEEK_E2E_START_IMAGE ?? '';

const LETTERS: readonly BankLetter[] = ['a', 'b', 'r'];

/** A comma list of bank letters from the environment ('' and 'none' are the empty list). */
function banksOf(raw: string | undefined, fallback: readonly BankLetter[]): BankLetter[] {
  if (raw === undefined) return [...fallback];
  const text = raw.trim().toLowerCase();
  if (text === '' || text === 'none') return [];
  return text.split(',').map((part) => {
    const letter = part.trim();
    if (letter !== 'a' && letter !== 'b' && letter !== 'r') {
      throw new Error(`"${part}" is not a bank (a, b or r)`);
    }
    return letter;
  });
}

const PATCHED_AT_START = banksOf(process.env.SEEK_E2E_PRO_PATCHED, []);
const TO_PATCH = banksOf(process.env.SEEK_E2E_PRO_PATCH, ['a']);

/** The undo, "<bank>=<decrypted image file>", or null (SEEK_E2E_PRO_UNDO). */
function undoOf(
  raw: string | undefined,
): { readonly letter: BankLetter; readonly file: string } | null {
  if (raw === undefined || raw.trim() === '') return null;
  const match = /^([abr])=(.+)$/i.exec(raw.trim());
  const letter = match?.[1]?.toLowerCase();
  if (match === null || (letter !== 'a' && letter !== 'b' && letter !== 'r')) {
    throw new Error(`SEEK_E2E_PRO_UNDO is "<bank>=<file>", not "${raw}"`);
  }
  return { letter, file: match[2] ?? '' };
}

const UNDO = undoOf(process.env.SEEK_E2E_PRO_UNDO);

/** One bank action of SEEK_E2E_PRO_STEPS (TESTING.md 42.91). */
type Step =
  | { readonly kind: 'copy'; readonly from: BankLetter; readonly to: BankLetter }
  | {
      readonly kind: 'restore';
      readonly letter: BankLetter;
      readonly holds: 'stock' | 'patched';
      readonly file: string;
    }
  | { readonly kind: 'every' }
  | { readonly kind: 'cancel'; readonly letter: BankLetter; readonly file: string };

function letterOf(text: string | undefined): BankLetter {
  const letter = (text ?? '').toLowerCase();
  if (letter !== 'a' && letter !== 'b' && letter !== 'r')
    throw new Error(`"${String(text)}" is not a bank`);
  return letter;
}

function stepsOf(raw: string | undefined): Step[] {
  if (raw === undefined || raw.trim() === '') return [];
  return raw
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part !== '')
    .map((part): Step => {
      const [word, ...rest] = part.split(/\s+/);
      if (word === 'copy') return { kind: 'copy', from: letterOf(rest[0]), to: letterOf(rest[1]) };
      if (word === 'every') return { kind: 'every' };
      if (word === 'cancel')
        return { kind: 'cancel', letter: letterOf(rest[0]), file: rest.slice(1).join(' ') };
      if (word === 'restore') {
        const holds = rest[1];
        if (holds !== 'stock' && holds !== 'patched') throw new Error(`restore: "${part}"`);
        return { kind: 'restore', letter: letterOf(rest[0]), holds, file: rest.slice(2).join(' ') };
      }
      throw new Error(`SEEK_E2E_PRO_STEPS: unknown step "${part}"`);
    });
}

const STEPS = stepsOf(process.env.SEEK_E2E_PRO_STEPS);

/* ---------------------------------------------------------------------------------- */
/* What the board is (TESTING.md 42.84 section 4, 42.85)                              */

const FLASH_BASE = 0x14000000;
const FLASH_BYTES = 0x400000;
const BANK_BYTES = 0x10000;
const BANK_ADDRESS: Readonly<Record<BankLetter, number>> = {
  a: 0x14050000,
  b: 0x14060000,
  r: 0x14070000,
};
/** The bank's name on the slots page (its rows, its dialogs). */
const SLOT_NAME: Readonly<Record<BankLetter, string>> = {
  a: 'Slot A',
  b: 'Slot B',
  r: 'Recovery R',
};
const VERSION = '1.0.3.0';
const SERIAL = process.env.SEEK_E2E_PRO_SERIAL ?? '090BB12PR939';
/** The stock 1.0.3.0 image's length, and the rate the offer names (FPS_32HZ.md, the 1.0.3.0 entry). */
const IMAGE_BYTES = 51848;
const FROM_HZ = 9;
const TO_HZ = 18;
const OFFER_LABEL = `Make ${String(TO_HZ)} FPS`;
/** The check key the read names: the 1.0.3.x 9 Hz pair's key block 1 (the bootloader block holds it at 0x2ACC). */
const CHECK_KEY = 'faacb3c6f1412469bd122fb82d78160d';
const BOOTED_A = 'Slot A — the bank the bootloader entered at this start, as it records it';
/** The active-slot word, the Last start row's, in the CLI's words (TESTING.md 42.89). */
const LAST_START_A = 'the camera reports it entered slot A (active-slot word 0)';
const NEXT_START_WHY =
  'the boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, and it holds an image the bootloader accepts';
/** The Info tab names a bank by its read name, the slots page by its row name. */
const NEXT_START_A = `Slot A — ${NEXT_START_WHY}`;
const NEXT_START_A_SLOTS = `Slot A — ${NEXT_START_WHY}`;
/** The lines the 2016 read printed before 42.84, which must not come back (TESTING.md 42.84 summary). */
const STALE = [
  'flashing disabled',
  'could not confirm',
  'boot prediction unavailable',
  'never decoded',
  'bootable unknown',
  'acceptance FAILS',
  'NOT bootable',
  'probably a different firmware family',
  're-reading under',
];
/** The frame-rate warning's sentence for a patched bank that does not run (core's fpsBootWarningOf). */
const DOES_NOT_RUN =
  'holds a frame-rate patch, but it does not run, so the patch does not take effect';
const WARNING_NAMES_A = 'The camera boots slot A.';
const PATCH_SLOT_A = 'Patch slot A too (the bank that runs)';
/** The status after a write says how it ended; the result panel gives the replug prompt (TESTING.md 42.86). */
const PATCHED_STATUS = 'Patched. The bank reads back as planned.';
const WRITTEN_STATUS = 'Written. The bank reads back as written.';
/** The capitalised replug prompt: the result panel's, once in the section (TESTING.md 42.85 O1, 42.86). */
const REPLUG_PROMPT = 'NOW UNPLUG AND REPLUG THE CAMERA.';
/** A patched bank's row: a state, not a refusal, and no table id (TESTING.md 42.85 O3, 42.86). */
const PATCH_APPLIED = `Frame-rate patch applied: this image runs at ${String(TO_HZ)} Hz.`;
/** Code names the page must not show a person (TESTING.md 42.85 O2, 42.86, 42.87). */
const CODE_NAMES = [
  'acknowledgeRisk',
  'compact_pro-1.0.3.0',
  'OLD_FW_UNLOCK_TOKEN',
  'KEY_PAIRS',
  'capabilities.flash',
  'slot-keystream-ciphertext',
  /* The key recovery's verdict and the frame-rate row's code names (TESTING.md 42.88). */
  'VERIFIED(',
  'confidence ',
  'self-loop',
  'r2016',
];
/** The key recovery's verdict in the read-back and dump lines, in words (core's `keyCheckText`; 42.88). */
const KEY_VERIFIED = 'key verified by the acceptance sum 0x00000000';
const READ_BACK_VERIFIED = `under the keystream recovered from the read-back (${KEY_VERIFIED})`;
/** The camera's staging note, said once on the page, not on each bank row (TESTING.md 42.87). */
const STAGING_NOTE =
  /Staged: the image, XORed with the xorshift128 keystream of its OWN key block 0/g;
/** The 2016 boot note, naming neither front end (TESTING.md 42.87). */
const BOOT_NOTE =
  'The booted bank named on this line is the bank the camera entered at its last start';
/** The staging form in the write log, in words (core's `stagingPhrase`; TESTING.md 42.87). */
const STAGED_WORDS = "staged under the image's own key";
/** The extra confirmation a row says a write asks for: once in A's row and R's, never in B's. */
const ASKS = /extra confirmation|acknowledge/gi;
/** The same, for one line. */
const ASKS_ONE = /extra confirmation|acknowledge/i;

/** One write of one bank: the stage chunks of a whole bank (64 B each) plus slack, and one commit. */
const STAGE_BUDGET = Math.ceil(BANK_BYTES / 64) + 64;

/** The every-bank action's label (TESTING.md 42.91). */
const EVERY_LABEL = `Make ${String(TO_HZ)} FPS in every bank`;
/** The restore button's label. */
const RESTORE_LABEL = 'Restore from full flash backup…';

/* ---------------------------------------------------------------------------------- */

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function unavailable(): string | null {
  if (electronBinary() === null) return 'the electron package is not installed';
  if (START_IMAGE_FILE === '') {
    return 'SEEK_E2E_START_IMAGE is not set: give the halted 4 MiB read taken before this run';
  }
  return cameraBusyReason();
}

const gate: WriteApproval = await approveWrite('camera', () =>
  Promise.resolve({
    describe:
      `the Info and Firmware slots pages on the bench Compact PRO 1.0.3.0: reads, Dump A/B/R, then ` +
      `"${OFFER_LABEL}" on ${TO_PATCH.length === 0 ? 'no bank' : TO_PATCH.map((l) => l.toUpperCase()).join(', then ')}` +
      ' (each one 64 KiB bank, saved first by the page), each followed by a power cycle. Nothing is restored.',
  }),
);
const UNAVAILABLE = unavailable();
const RUNNABLE = gate.approved && UNAVAILABLE === null;
if (!RUNNABLE) {
  process.stderr.write(
    `\n[skip] the pages on the bench Compact PRO: ${gate.approved ? (UNAVAILABLE ?? '') : gate.reason}.\n` +
      '  Run it on the bench with SEEK_E2E_WRITE=i-understand and SEEK_E2E_START_IMAGE (never in CI).\n',
  );
}

/** The non-empty lines of a text, trimmed, runs of spaces collapsed. */
function linesOf(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim().replace(/\s+/g, ' '))
    .filter((line) => line !== '');
}

/** The value the page shows under a label: its own line after the label's (innerText). */
function valueUnder(text: string, label: string): string | null {
  const lines = linesOf(text);
  const at = lines.indexOf(label);
  return at < 0 ? null : (lines[at + 1] ?? null);
}

/** The analysis line of one bank ("Slot A: firmware ..."; the 2014 and 2016 lines name banks as the boot rows do, TESTING.md 42.103), or null. */
/** The bank names the Info read gives (core's legacy slot names). */
const BANK_NAME = { a: 'Slot A', b: 'Slot B', r: 'Recovery R' } as const;

function bankLine(text: string, letter: BankLetter): string | null {
  const head = `${BANK_NAME[letter]}: firmware`;
  return linesOf(text).find((line) => line.startsWith(head)) ?? null;
}

function count(text: string, pattern: RegExp): number {
  return [...text.matchAll(new RegExp(pattern.source, `${pattern.flags.replace('g', '')}g`))]
    .length;
}

/** The prepared-write panel's "Read before writing" items (innerText): its lines up to the panel's next part. */
function readBeforeWriting(planText: string): string[] {
  const lines = linesOf(planText);
  const at = lines.indexOf('Read before writing:');
  if (at < 0) return [];
  const end = lines.findIndex(
    (line, index) => index > at && line.startsWith('Nothing has been sent'),
  );
  return lines.slice(at + 1, end < 0 ? undefined : end);
}

/* ---------------------------------------------------------------------------------- */

describe.skipIf(!RUNNABLE)(
  'the Info and Firmware slots pages on the bench Compact PRO 1.0.3.0 (FF board, real WebUSB)',
  () => {
    let target: TargetHandle | null = null;
    let camera: BenchCamera | null = null;
    let start: Uint8Array | null = null;
    /** The banks that hold the patch now: the start's, then each one this run patched and replugged. */
    const patched = new Set<BankLetter>(PATCHED_AT_START);
    /** The banks this run wrote: their dumps are no longer compared with the start image. */
    const written = new Set<BankLetter>();
    /** Each bank's stored bytes as last dumped: what a backup zip saved before a write must hold. */
    const now = new Map<BankLetter, Uint8Array>();

    const live = (): TargetHandle => {
      if (target === null) throw new Error('the window is not open (an earlier step failed)');
      return target;
    };
    const startBank = (letter: BankLetter): Uint8Array => {
      if (start === null) throw new Error('the start image was not read');
      const offset = BANK_ADDRESS[letter] - FLASH_BASE;
      return start.subarray(offset, offset + BANK_BYTES);
    };

    /** Keeps what the page showed: its text in `<name>.txt` and a full-page screenshot `<name>.png`. */
    async function keep(name: string, text: string): Promise<void> {
      mkdirSync(OUT, { recursive: true });
      writeFileSync(path.join(OUT, `${name}.txt`), text);
      await live().page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
      say(`kept ${name}.txt and ${name}.png in ${OUT}`);
    }

    function keepBytes(name: string, bytes: Uint8Array): void {
      mkdirSync(OUT, { recursive: true });
      writeFileSync(path.join(OUT, name), bytes);
      say(`kept ${name} (${String(bytes.length)} B, sha256 ${sha256(bytes)})`);
    }

    async function bodyText(): Promise<string> {
      return live().page.evaluate(() => document.body.innerText);
    }

    /** Info's "Read firmware version", to its final status. Returns the page's text and the read's log. */
    async function readInfo(tag: string): Promise<{ text: string; log: string; status: string }> {
      const { wizard, page } = live();
      await wizard.route('#/');
      const moved = await wizard.watchStatus('#info-status');
      const clickedAt = Date.now();
      await wizard.click('section[aria-labelledby="info-read-heading"]', 'Read firmware version');
      await moved();
      await page.waitForFunction(
        () =>
          /^(Read\.|Failed|Cancelled|No version)/.test(
            (document.querySelector<HTMLElement>('#info-status')?.innerText ?? '').trim(),
          ),
        { timeout: 5 * 60_000, polling: 250 },
      );
      const status = (await wizard.text('#info-status')).trim();
      say(`info read (${tag}): "${status}" after ${String(Date.now() - clickedAt)} ms`);
      const text = await bodyText();
      const log = await wizard.text('#info-log');
      await keep(`info-${tag}`, text);
      writeFileSync(path.join(OUT, `info-${tag}-log.txt`), log);
      return { text, log, status };
    }

    /** The Info read's checks, for the banks that hold the patch now. */
    function checkInfo(info: { text: string; log: string; status: string }): void {
      const { text, log, status } = info;
      expect(status, 'the Info read ends on the running build').toBe(`Read. Firmware ${VERSION}.`);
      for (const stale of STALE) expect(text, `the Info tab says "${stale}"`).not.toContain(stale);
      expect(log, 'one read, under compact-2016: no legacy-auth read first').not.toContain(
        'legacy-auth',
      );
      /* Two scores, each saying what it is: the probe's in the log, the read's in the Profile panel
       * (TESTING.md 42.85 O5, 42.86). */
      expect(log, 'the probe line').toMatch(
        /probe: 2016 Compact Pro \(compact-2016\), score \d\.\d\d from the answers above, before any bank is read/,
      );
      expect(log, 'no bare "confidence"').not.toContain('confidence');
      expect(valueUnder(text, 'Detected'), 'Detected: the score after the read').toMatch(
        /^compact-2016 \(score \d\.\d\d after the read, from the evidence below\)$/,
      );
      expect(valueUnder(text, 'Serial'), 'serial').toBe(SERIAL);
      expect(valueUnder(text, 'Running'), 'running').toBe(`${VERSION} Jul 6 2016`);
      expect(valueUnder(text, 'Bootloader'), 'bootloader').toBe('1.2.0.0 Jun 26 2016');
      expect(valueUnder(text, 'cfg[0]'), 'cfg[0]').toMatch(/^0xFFFFFFFF /);
      expect(valueUnder(text, 'Booted'), 'Booted: the bootloader’s record').toBe(BOOTED_A);
      expect(valueUnder(text, 'Last start'), 'Last start: the active-slot word').toBe(LAST_START_A);
      expect(valueUnder(text, 'Next start'), 'Next start: slot A').toBe(NEXT_START_A);
      expect(text, 'the check key').toContain(CHECK_KEY);
      for (const letter of LETTERS) {
        const line = bankLine(text, letter);
        expect(line, `the analysis line of bank ${letter.toUpperCase()}`).not.toBeNull();
        expect(line, `bank ${letter.toUpperCase()} is bootable`).toMatch(/-> bootable$/);
        expect(line?.includes(`frame-rate patch ${String(TO_HZ)} Hz`), String(line)).toBe(
          patched.has(letter),
        );
      }
      expect(
        linesOf(text).filter((line) => line === 'Writing'),
        'one Writing section',
      ).toHaveLength(1);
    }

    /** Firmware slots: "Read slots", to its final status. Returns the section's text. */
    async function readSlotsPage(tag: string): Promise<string> {
      const { wizard, page } = live();
      await wizard.route('#/slots');
      const status = await readSlots(wizard, page);
      say(`read slots (${tag}): "${status}"`);
      expect(status, 'Read slots reads the three banks').toMatch(/^Read\. 3\/3/);
      const text = await wizard.text(SLOTS_SECTION);
      await keep(`slots-${tag}`, text);
      return text;
    }

    /** The slots page's checks, for the banks that hold the patch now. */
    async function checkSlots(text: string): Promise<void> {
      const { page } = live();
      for (const stale of STALE)
        expect(text, `the slots page says "${stale}"`).not.toContain(stale);
      for (const name of CODE_NAMES)
        expect(text, `the slots page shows the code name "${name}"`).not.toContain(name);
      expect(await writeBanner(page), 'no "cannot be written" banner').toBeNull();
      /* TESTING.md 42.87: a note that holds for every bank is said once; each acknowledgement once in its
       * row; the boot note names no front end. */
      expect(count(text, STAGING_NOTE), 'the staging note, once on the page').toBe(1);
      expect(text, 'the boot note').toContain(BOOT_NOTE);
      expect(text, 'the boot note names no front end').not.toContain('Where the page names');
      const rowTexts = await page.$$eval(SLOTS_TABLE_ROWS, (trs) =>
        trs.map((tr) => (tr as HTMLElement).innerText),
      );
      for (const [index, rowText] of rowTexts.entries()) {
        const letter = LETTERS[index] ?? 'a';
        const asks = linesOf(rowText).filter((line) => new RegExp(ASKS.source, 'i').test(line));
        say(`row ${letter.toUpperCase()}: asks ${JSON.stringify(asks)}`);
        expect(rowText, `${letter.toUpperCase()} row: no staging note`).not.toContain('Staged:');
        expect(count(rowText, ASKS), `${letter.toUpperCase()} row: the extra confirmation`).toBe(
          letter === 'b' ? 0 : 1,
        );
      }
      const summary = await summaryRows(page);
      say(`slots summary: ${JSON.stringify(summary)}`);
      expect(summary['booted from'], 'Booted from').toBe('Slot A');
      expect(summary['next start'], 'Next start').toBe(NEXT_START_A_SLOTS);
      const rows = await bankRows(page);
      for (const row of rows) {
        say(
          `row ${row.name}: booted ${String(row.booted)}; firmware "${row.firmware}"; key "${row.keyName}"; ` +
            `bootable "${row.bootable}"; buttons ${row.buttons.map((b) => `${b.label}${b.enabled ? '' : ' (off)'}`).join(', ')}`,
        );
        expect(row.booted, `${row.name} booted`).toBe(row.letter === 'a');
        expect(row.firmware, `${row.name} firmware`).toContain(VERSION);
        const offer = row.buttons.find((button) => button.label === OFFER_LABEL);
        /* TESTING.md 42.91: each row copies its image to the two other banks and restores from a full
         * flash backup; every bank holds an image here, so each is on. */
        for (const label of [
          ...LETTERS.filter((other) => other !== row.letter).map(copyLabel),
          RESTORE_LABEL,
        ]) {
          const button = row.buttons.find((candidate) => candidate.label === label);
          expect(button?.enabled, `${row.name}: "${label}" is offered and enabled`).toBe(true);
        }
        expect(
          row.buttons.some((candidate) => candidate.label.startsWith('Use ')),
          `${row.name}: no "Use … image" button any more`,
        ).toBe(false);
        if (patched.has(row.letter)) {
          /* A bank that runs the patched image is not offered it again, and says so. */
          expect(offer, `${row.name}: no "${OFFER_LABEL}" on a patched bank`).toBeUndefined();
          expect(row.actionsText, `${row.name}: the patch is applied`).toContain(PATCH_APPLIED);
          expect(row.actionsText, `${row.name}: a state, not a refusal`).not.toContain(
            'not offered',
          );
        } else {
          /* The offer is never gated: on, whatever the boot word says (owner, 42.29). */
          expect(offer?.enabled, `${row.name}: "${OFFER_LABEL}" is offered and enabled`).toBe(true);
        }
      }
      /* "Make 18 FPS in every bank" beside the per-bank buttons, whenever some bank offers the patch. */
      const every = await page.evaluate(
        (sel: string, label: string) =>
          [...(document.querySelector(sel)?.querySelectorAll('button') ?? [])]
            .filter((button) => button.textContent.trim() === label)
            .map((button) => !button.disabled),
        SLOTS_SECTION,
        EVERY_LABEL,
      );
      expect(every, `"${EVERY_LABEL}" when a bank offers the patch, enabled`).toEqual(
        LETTERS.every((letter) => patched.has(letter)) ? [] : [true],
      );
      expect(text, 'no save-file dialog wording').not.toMatch(/choose where|save dialog/i);
      const warned = !patched.has('a') && (patched.has('b') || patched.has('r'));
      if (warned) {
        expect(text, 'the warning names the bank that runs').toContain(WARNING_NAMES_A);
        expect(text, 'the warning').toContain(DOES_NOT_RUN);
        expect(text, 'the warning says to patch A').toContain(PATCH_SLOT_A);
        if (patched.has('r')) {
          expect(text, 'the warning names R').toContain(`Recovery R ${DOES_NOT_RUN}`);
        }
      } else {
        expect(text, 'no frame-rate warning').not.toContain(DOES_NOT_RUN);
      }
    }

    /** Dump of one bank from its row; keeps the files. Returns the raw 64 KiB. */
    async function dumpOf(letter: BankLetter, tag: string): Promise<Uint8Array> {
      const { wizard, page, downloads } = live();
      const saved = await dumpBank(wizard, page, downloads, letter);
      say(`dump ${letter.toUpperCase()} (${tag}): ${saved.status}`);
      expect(saved.status, `Dump ${letter.toUpperCase()}`).toMatch(/^Dumped (slot|recovery) /);
      keepBytes(`dump-${tag}-${letter}-raw.bin`, saved.raw.bytes);
      if (saved.decrypted !== null) {
        keepBytes(`dump-${tag}-${letter}-decrypted.bin`, saved.decrypted.bytes);
      }
      /* TESTING.md 42.88: the dump's note says the key recovery's verdict in words. */
      const log = await wizard.text('#slotsrun-log');
      writeFileSync(path.join(OUT, `dump-${tag}-${letter}-log.txt`), log);
      const recovered = linesOf(log).filter((line) =>
        line.includes('key recovered from this bank'),
      );
      say(`dump ${letter.toUpperCase()} (${tag}) note: ${recovered.join(' | ') || '(none)'}`);
      expect(recovered.join('\n'), 'the dump note: the verdict in words').toContain(
        `(${KEY_VERIFIED}`,
      );
      for (const codeName of CODE_NAMES) expect(log, codeName).not.toContain(codeName);
      return saved.raw.bytes;
    }

    /** The bank's table row, as an element, for its own buttons. */
    async function rowHandle(letter: BankLetter): Promise<ElementHandle> {
      const rows = await live().page.$$(SLOTS_TABLE_ROWS);
      const row = rows[LETTERS.indexOf(letter)];
      if (row === undefined) throw new Error(`the bank table has no row for ${letter}`);
      return row;
    }

    /**
     * The replug after a write of `letter`: a power cycle, Connect device again (Electron keeps no grant
     * across the re-enumeration: no permission handler, e2e/electron/main.mjs, so no `connect` event
     * reaches the page, and a person presses Connect device when the page shows "Device disconnected.",
     * TESTING.md 42.85), then Info and Read slots, checked for the banks that hold the patch now, and the
     * dumps: the written bank kept, the others still the start image's.
     */
    async function replugAndRead(
      wrote: BankLetter | readonly BankLetter[],
      tag: string,
    ): Promise<void> {
      const letters: readonly BankLetter[] = typeof wrote === 'string' ? [wrote] : wrote;
      const { wizard, page } = live();
      if (camera === null) throw new Error('the bench camera is not open');
      const eventsBefore = (await guardOf(page)).usbEvents.length;
      await camera.powerCycle();
      say('power cycle done: the camera is on the bus again');
      const adopted = await page
        .waitForFunction(
          () => (document.querySelector('#device-description')?.textContent ?? '').includes('VID'),
          { timeout: 30_000, polling: 250 },
        )
        .then(() => true)
        .catch(() => false);
      say(`the page took the camera back on its own: ${String(adopted)}`);
      if (!adopted) {
        await wizard.route('#/');
        checkChooserEntry(await wizard.connect());
      }
      const events = (await guardOf(page)).usbEvents.slice(eventsBefore);
      say(`usb events across the replug: ${JSON.stringify(events)}`);
      expect(
        events.map((event) => event.type),
        'the page saw the camera leave',
      ).toContain('disconnect');

      const info = await readInfo(tag);
      checkInfo(info);
      const text = await readSlotsPage(tag);
      await checkSlots(text);
      for (const letter of letters) now.set(letter, await dumpOf(letter, tag));
      for (const other of LETTERS.filter((l) => !written.has(l))) {
        const raw = await dumpOf(other, tag);
        expect(
          Buffer.from(raw).equals(Buffer.from(startBank(other))),
          `Dump ${other.toUpperCase()} (not written) still equals the start image's bank`,
        ).toBe(true);
      }
      expect(await refusalsOf(live()), 'nothing refused by the guards').toEqual([]);
    }

    /**
     * The backup zip a write downloaded first (TESTING.md 42.91): one folder of the zip's name, the text file
     * naming the camera, the firmware and each bank, and each bank's stored file equal to the bank as it was
     * last dumped (`now`). The zip is kept in OUT.
     */
    function checkBackupZip(zip: BackupZip, letters: readonly BankLetter[], tag: string): void {
      keepBytes(`${tag}-${zip.name}`, zip.bytes);
      writeFileSync(path.join(OUT, `${tag}-README.txt`), zip.text);
      say(`backup zip ${zip.name}: ${zip.entries.map((entry) => entry.name).join(', ')}`);
      expect(zip.text, 'the text file names the camera').toContain(
        `serial ${SERIAL}, firmware ${VERSION}`,
      );
      for (const letter of letters) {
        const bank = zip.bank(letter);
        const was = now.get(letter);
        expect(bank.raw, `${zip.name}: bank ${letter.toUpperCase()} as stored`).not.toBeNull();
        expect(
          was !== undefined && bank.raw !== null && Buffer.from(bank.raw).equals(Buffer.from(was)),
          `${zip.name}: bank ${letter.toUpperCase()}'s stored file is the bank as it was`,
        ).toBe(true);
        expect(bank.decrypted?.length, `${zip.name}: bank ${letter.toUpperCase()} decrypted`).toBe(
          IMAGE_BYTES,
        );
        expect(zip.text, `the text file names bank ${letter.toUpperCase()}`).toContain(
          `${SLOT_NAME[letter]} at 0x${BANK_ADDRESS[letter].toString(16).toUpperCase()}`,
        );
        if (bank.raw !== null) {
          expect(zip.text, 'the text file gives the stored file’s sha256').toContain(
            sha256(bank.raw),
          );
        }
      }
    }

    /** Opens the write confirmation of the prepared plan, keeps it, ticks it when asked, writes, and keeps the result. */
    async function writePrepared(
      letter: BankLetter,
      tag: string,
    ): Promise<{ status: string; log: string; section: string; outcome: string | null }> {
      const { wizard, page } = live();
      const name = SLOT_NAME[letter];
      await openWriteConfirm(wizard, page, name);
      const dialog = await page.$eval(CONFIRM_DIALOG, (el) => (el as HTMLElement).innerText);
      await keep(`${tag}-dialog`, dialog);
      expect(dialog, 'the dialog names the zip saved first').toMatch(
        /Before anything is sent, .+ is read again and saved as one zip download: seek_backup_<time>_/,
      );
      const ackShown = (await page.$(ACK_BOX)) !== null;
      expect(ackShown, 'A (booted) and R (recovery) ask the acknowledgement').toBe(letter !== 'b');
      await setGuard(page, {
        allowReset: false,
        resetBudget: null,
        stageBudget: STAGE_BUDGET,
        commitBudget: 1,
        commitSum16: null,
      });
      let status: string;
      try {
        status = await confirmWrite(wizard, page, name, ackShown);
      } finally {
        await setGuard(page, {
          allowReset: false,
          resetBudget: null,
          stageBudget: 0,
          commitBudget: 0,
          commitSum16: null,
        }).catch(() => undefined);
      }
      written.add(letter);
      const log = await wizard.text('#slotsrun-log');
      const section = await wizard.text(SLOTS_SECTION);
      writeFileSync(path.join(OUT, `${tag}-log.txt`), log);
      await keep(`${tag}-after`, section);
      const outcome = await outcomeAlert(page);
      say(`${tag}: "${status}"; outcome: ${outcome ?? '(none)'}`);
      for (const codeName of CODE_NAMES) expect(log, codeName).not.toContain(codeName);
      expect(count(log, /unplug and replug/i), 'the replug line, once in the log').toBe(1);
      expect(count(section, /NOW UNPLUG AND REPLUG THE CAMERA\./), 'the prompt, once').toBe(1);
      return { status, log, section, outcome };
    }

    /** Waits for the prepare to end: "Ready — review the plan" or "Rejected — …". */
    async function prepared(): Promise<string> {
      const { wizard, page } = live();
      await page.waitForFunction(
        (sel: string) =>
          /^(Ready|Rejected)/.test(document.querySelector<HTMLElement>(sel)?.innerText ?? ''),
        { timeout: 60_000, polling: 250 },
        '#slotsrun-status',
      );
      return wizard.text('#slotsrun-status');
    }

    beforeAll(async () => {
      mkdirSync(OUT, { recursive: true });
      say(`scratch ${SCRATCH}; out ${OUT}; source ${SOURCE}`);
      say(
        `patched at the start: ${PATCHED_AT_START.join(', ') || 'none'}; to patch: ${TO_PATCH.join(', then ') || 'none'}`,
      );
      const image = new Uint8Array(readFileSync(START_IMAGE_FILE));
      if (image.length !== FLASH_BYTES) {
        throw new Error(
          `the start image ${START_IMAGE_FILE} is ${String(image.length)} B, not 4 MiB`,
        );
      }
      start = image;
      say(`start image ${START_IMAGE_FILE}: sha256 ${sha256(image)}`);
      camera = createBenchCamera({ gate });
      const opened = await openTarget('camera', {
        scratchDir: path.join(SCRATCH, 'window'),
        source: SOURCE,
        sharedServer: SOURCE === 'dev',
        uiGuard: SLOTS_BENCH_UI,
        preloadSource: `${benchGuardScript()}\n`,
        headed: HEADED,
      });
      target = opened;
      await opened.wizard.route('#/');
      const chooser = checkChooserEntry(await opened.wizard.connect());
      say(`connected: ${chooser}`);
      if (!(await guardInstalled(opened))) throw new Error('the write guard is not in the page');
    }, 10 * 60_000);

    afterAll(async () => {
      if (target !== null) {
        await setGuard(target.page, {
          allowReset: false,
          resetBudget: null,
          stageBudget: 0,
          commitBudget: 0,
          commitSum16: null,
        }).catch(() => undefined);
        const guard = await guardOf(target.page).catch(() => null);
        if (guard !== null) {
          say(`wire (whole window): ${describeWire(countsOf(guard))}`);
          say(`usb events: ${JSON.stringify(guard.usbEvents)}`);
        }
        await target.close().catch((error: unknown) => {
          say(`close failed: ${String(error)}`);
        });
        target = null;
      }
      await closeSharedDevServer();
    }, 2 * 60_000);

    it('Info: one read under compact-2016, the boot record and next start, the check key, every bank bootable, one Writing section', async () => {
      const before = countsOf(await guardOf(live().page));
      const info = await readInfo('before');
      const wire = countsOf(await guardOf(live().page));
      const sent = new Map(
        [...wire]
          .map(([key, n]) => [key, n - (before.get(key) ?? 0)] as const)
          .filter(([, n]) => n > 0),
      );
      say(`info wire: ${describeWire(sent)}`);
      checkInfo(info);
    });

    it('Firmware slots: Read slots, the boot facts and the warning; Dump A, B and R equal the start image', async () => {
      const text = await readSlotsPage('before');
      await checkSlots(text);
      for (const letter of LETTERS) {
        const raw = await dumpOf(letter, 'before');
        now.set(letter, raw);
        expect(
          Buffer.from(raw).equals(Buffer.from(startBank(letter))),
          `Dump ${letter.toUpperCase()} equals the start image's bank`,
        ).toBe(true);
      }
      expect(await refusalsOf(live()), 'nothing refused by the guards').toEqual([]);
    });

    if (UNDO !== null) {
      const undo = UNDO;
      const L = undo.letter.toUpperCase();
      const name = SLOT_NAME[undo.letter];

      it(`the undo the dialog names: "Flash decrypted image" of the saved file on ${L}, written and read back`, async () => {
        const { wizard, page } = live();
        const image = new Uint8Array(readFileSync(undo.file));
        say(`undo ${L}: ${undo.file} (${String(image.length)} B, sha256 ${sha256(image)})`);
        await wizard.route('#/slots');
        await setGuard(page, {
          allowReset: false,
          resetBudget: null,
          stageBudget: STAGE_BUDGET,
          commitBudget: 1,
          commitSum16: null,
        });
        let status: string;
        try {
          const picked = await pickImage(wizard, page, undo.letter, 'plain', undo.file);
          say(`picker: "${picked}"`);
          const plan = await preparedView(page);
          await keep(`undo-${undo.letter}-plan`, plan?.text ?? '(no prepared plan)');
          expect(picked, 'the page takes the saved decrypted file').toMatch(/^Ready — /);
          /* TESTING.md 42.87: the plan says what the file is and how it is staged, each once, and the
           * acknowledgement once. 42.88: "Read before writing" lists the warnings and only this write's
           * own notes; the camera's notes (the staging note among them) stay above the device panel. */
          const planText = plan?.text ?? '';
          expect(valueUnder(planText, 'Read as'), 'Read as').toBe('a decrypted image');
          expect(count(planText, STAGING_NOTE), 'the staging note, not again in the plan').toBe(0);
          expect(count(planText, /^Note: /gm), 'no camera or bank note in the plan').toBe(0);
          expect(count(planText, ASKS), 'the acknowledgement, once in the plan').toBe(
            undo.letter === 'b' ? 0 : 1,
          );
          const readFirst = readBeforeWriting(planText);
          say(`read before writing (undo ${L}): ${JSON.stringify(readFirst)}`);
          expect(readFirst, 'Read before writing: the acknowledgement alone').toEqual(
            undo.letter === 'b' ? [] : [expect.stringMatching(ASKS_ONE)],
          );
          const sectionNow = await wizard.text(SLOTS_SECTION);
          expect(count(sectionNow, STAGING_NOTE), 'the staging note, once in the section').toBe(1);
          await openWriteConfirm(wizard, page, name);
          const dialog = await page.$eval(CONFIRM_DIALOG, (el) => (el as HTMLElement).innerText);
          await keep(`undo-${undo.letter}-dialog`, dialog);
          say(`dialog (undo ${L}): ${dialog.replace(/\s+/g, ' ')}`);
          const ackShown = (await page.$(ACK_BOX)) !== null;
          expect(ackShown, 'A (booted) and R (recovery) ask the acknowledgement').toBe(
            undo.letter !== 'b',
          );
          status = await confirmWrite(wizard, page, name, ackShown);
        } finally {
          await setGuard(page, {
            allowReset: false,
            resetBudget: null,
            stageBudget: 0,
            commitBudget: 0,
            commitSum16: null,
          }).catch(() => undefined);
        }
        written.add(undo.letter);
        const log = await wizard.text('#slotsrun-log');
        const section = await wizard.text(SLOTS_SECTION);
        writeFileSync(path.join(OUT, `undo-${undo.letter}-log.txt`), log);
        await keep(`undo-${undo.letter}-after`, section);
        say(`undo ${L}: "${status}"; outcome: ${(await outcomeAlert(page)) ?? '(none)'}`);
        for (const line of linesOf(log).filter((l) => /status|commit|replug|written/i.test(l))) {
          say(`  log: ${line}`);
        }
        say(
          `"unplug and replug": ${String(count(log, /unplug and replug/i))} in the log, ` +
            `${String(count(section, /unplug and replug/i))} in the whole section`,
        );
        expect(status, `the undo of ${L}`).toBe(WRITTEN_STATUS);
        expect(log, 'the staging form in words').toContain(
          `B payload, ${STAGED_WORDS}, transfer checksum`,
        );
        expect(log, 'the write line in words').toContain(
          `from the decrypted image, ${STAGED_WORDS} — checksum`,
        );
        expect(log, 'the commit line in words').toMatch(
          new RegExp(`to ${name} at 0x[0-9A-F]+, ${STAGED_WORDS}; commit status 0x0`),
        );
        expect(log, 'the read-back line: the verdict in words (42.88)').toContain(
          READ_BACK_VERIFIED,
        );
        for (const codeName of CODE_NAMES) expect(log, codeName).not.toContain(codeName);
        expect(count(log, /unplug and replug/i), 'the replug line, once in the log').toBe(1);
        expect(count(section, /NOW UNPLUG AND REPLUG THE CAMERA\./), 'the prompt, once').toBe(1);
        expect(log, 'the log keeps the record, not the capitalised prompt').not.toContain(
          REPLUG_PROMPT,
        );
        expect(await refusalsOf(live()), 'nothing refused by the guards').toEqual([]);
      });

      it(`after the replug: Info and slots show ${L} without the patch`, async () => {
        if (!written.has(undo.letter)) throw new Error(`the undo of ${L} did not run: no replug`);
        patched.delete(undo.letter);
        await replugAndRead(undo.letter, `after-undo-${undo.letter}`);
      });
    }

    for (const letter of TO_PATCH) {
      const L = letter.toUpperCase();
      const name = SLOT_NAME[letter];

      it(`${OFFER_LABEL} on ${L}: the dialog, the write, its status and one replug line`, async () => {
        const { wizard, page, downloads } = live();
        await wizard.route('#/slots');
        await wizard.click(await rowHandle(letter), OFFER_LABEL);
        await page.waitForSelector(CONFIRM_DIALOG, { timeout: 10_000 });
        const dialog = await page.$eval(CONFIRM_DIALOG, (el) => (el as HTMLElement).innerText);
        await keep(`fps-${letter}-dialog`, dialog);
        say(`dialog (${L}): ${dialog.replace(/\s+/g, ' ')}`);
        /* A dialog that is not as expected is cancelled before the test fails: nothing is written. */
        try {
          expect(dialog).toContain(`Make ${name} run at ${String(TO_HZ)} FPS?`);
          expect(dialog).toContain(
            `${name} holds firmware ${VERSION}, and this makes its image run at ${String(TO_HZ)} Hz instead of ${String(FROM_HZ)} Hz.`,
          );
          expect(dialog, 'the 2014 chain’s word sentence is not said on 2016').not.toContain(
            'active-slot word names',
          );
          /* TESTING.md 42.88: no row named by its record or link code names. */
          for (const codeName of CODE_NAMES) expect(dialog, codeName).not.toContain(codeName);
          /* The dialog's warning is for the bank it patches (fpsBootWarningOf with the target): a bank
           * other than A while A holds no patch. */
          const warned = letter !== 'a' && !patched.has('a');
          if (letter === 'a') {
            expect(dialog, 'A is the bank the camera boots now').toContain(
              'Slot A is the bank the camera boots now. The patched image replaces the firmware it runs now.',
            );
          }
          if (letter === 'r') {
            expect(dialog).toContain('Recovery R is the recovery bank');
          }
          if (warned) {
            expect(dialog, 'the warning names the bank that runs').toContain(WARNING_NAMES_A);
            expect(dialog, 'the warning for this bank').toContain(
              `would not make it run, because the camera boots slot A instead.`,
            );
            expect(dialog, 'the warning says to patch A').toContain(PATCH_SLOT_A);
          } else {
            for (const sentence of [WARNING_NAMES_A, 'would not make it run', PATCH_SLOT_A]) {
              expect(dialog, `no frame-rate warning ("${sentence}")`).not.toContain(sentence);
            }
          }
        } catch (error) {
          await wizard.click(CONFIRM_DIALOG, 'Cancel');
          throw error;
        }

        const ack = await page.$('#slot-fps-ack');
        say(`acknowledgement asked: ${String(ack !== null)}`);
        expect(
          ack !== null,
          'A (booted) and R (recovery) ask the acknowledgement; B does not',
        ).toBe(letter !== 'b');
        const confirm = `Yes — patch ${name}`;
        if (ack !== null) {
          expect(
            await wizard.isEnabled(CONFIRM_DIALOG, confirm),
            'Yes is off before the tick',
          ).toBe(false);
          await page.$eval('#slot-fps-ack', (el) => {
            (el as HTMLInputElement).click();
          });
        }
        await page.waitForFunction(
          (sel: string, label: string) =>
            [...(document.querySelector(sel)?.querySelectorAll('button') ?? [])].some(
              (b) => b.textContent.trim() === label && !b.disabled,
            ),
          { timeout: 10_000 },
          CONFIRM_DIALOG,
          confirm,
        );

        await setGuard(page, {
          allowReset: false,
          resetBudget: null,
          stageBudget: STAGE_BUDGET,
          commitBudget: 1,
          commitSum16: null,
        });
        let status: string;
        const startedAt = Date.now();
        try {
          status = await runAndSettle(
            wizard,
            page,
            () => wizard.click(CONFIRM_DIALOG, confirm),
            /^(Patched|Failed|Cancelled)/,
            30 * 60_000,
          );
        } finally {
          await setGuard(page, {
            allowReset: false,
            resetBudget: null,
            stageBudget: 0,
            commitBudget: 0,
            commitSum16: null,
          }).catch(() => undefined);
        }
        written.add(letter);
        const log = await wizard.text('#slotsrun-log');
        const section = await wizard.text(SLOTS_SECTION);
        writeFileSync(path.join(OUT, `fps-${letter}-log.txt`), log);
        await keep(`fps-${letter}-after`, section);
        const outcome = await outcomeAlert(page);
        say(`patch ${L}: "${status}" after ${String(Date.now() - startedAt)} ms`);
        say(`outcome: ${outcome ?? '(none)'}`);
        for (const line of linesOf(log).filter((l) => /status|commit|replug|patched/i.test(l))) {
          say(`  log: ${line}`);
        }
        const replugLog = count(log, /unplug and replug/i);
        const replugSection = count(section, /unplug and replug/i);
        say(
          `"unplug and replug": ${String(replugLog)} in the log, ${String(replugSection)} in the whole section`,
        );
        expect(status, `the patch of ${L}`).toBe(PATCHED_STATUS);
        expect(log, 'the write line in words').toContain(
          `from the decrypted image, ${STAGED_WORDS} — checksum`,
        );
        expect(log, 'the read-back line: the verdict in words (42.88)').toContain(
          READ_BACK_VERIFIED,
        );
        for (const codeName of CODE_NAMES) expect(log, codeName).not.toContain(codeName);
        for (const codeName of CODE_NAMES) expect(section, codeName).not.toContain(codeName);
        expect(replugLog, 'the replug line, once in the log').toBe(1);
        expect(count(section, /NOW UNPLUG AND REPLUG THE CAMERA\./), 'the prompt, once').toBe(1);
        expect(log, 'the log keeps the record, not the capitalised prompt').not.toContain(
          REPLUG_PROMPT,
        );
        expect(count(log, /saved first, as a download: seek_backup_/), 'the zip, named once').toBe(
          1,
        );
        expect(outcome ?? '', 'the result panel names the firmware, not the table id').toContain(
          `${SLOT_NAME[letter]} — patched from ${String(FROM_HZ)} Hz to ${String(TO_HZ)} Hz (firmware ${VERSION}).`,
        );
        const { zip } = await waitForBackupZip(downloads, [letter], 'before-fps-patch');
        checkBackupZip(zip, [letter], `fps-${letter}`);
        expect(outcome ?? '', 'the result names the zip').toContain(
          `Saved first, as a download: ${zip.name}`,
        );
        expect(await refusalsOf(live()), 'nothing refused by the guards').toEqual([]);
      });

      it(`after the replug (a power cycle): Connect again; Info and slots show ${L} patched`, async () => {
        if (!written.has(letter)) throw new Error(`the patch of ${L} did not run: no replug`);
        patched.add(letter);
        await replugAndRead(letter, `after-${letter}`);
      });
    }

    for (const [index, step] of STEPS.entries()) {
      const n = String(index + 1);
      if (step.kind === 'copy') {
        const { from, to } = step;
        const tag = `step-${n}-copy-${from}-${to}`;
        it(`step ${n}: "${copyLabel(to)}" on ${from.toUpperCase()}'s row: the plan, the zip saved first, the write`, async () => {
          const { wizard, page, downloads } = live();
          await wizard.route('#/slots');
          const moved = await wizard.watchStatus('#slotsrun-status');
          await wizard.click(await rowHandle(from), copyLabel(to));
          await moved();
          const ready = await prepared();
          const plan = await preparedView(page);
          await keep(`${tag}-plan`, plan?.text ?? '(no prepared plan)');
          say(`${tag} plan: ${(plan?.text ?? '').replace(/\s+/g, ' ')}`);
          expect(ready, 'the copy is prepared').toMatch(/^Ready — /);
          const planText = plan?.text ?? '';
          expect(valueUnder(planText, 'Image taken from'), 'where the image comes from').toBe(
            `${SLOT_NAME[from]} at 0x${BANK_ADDRESS[from].toString(16).toUpperCase()}, firmware ${VERSION}, as the slots read decrypted it`,
          );
          expect(valueUnder(planText, 'Saved first') ?? '', 'the zip saved first').toMatch(
            new RegExp(
              `_bank-${to.toUpperCase()}_before-copy-from-${from.toUpperCase()}\\.zip\\. The zip is downloaded automatically`,
            ),
          );
          const done = await writePrepared(to, tag);
          expect(done.status, `the copy into ${to.toUpperCase()}`).toBe(WRITTEN_STATUS);
          expect(done.log, 'the read-back in words').toContain(READ_BACK_VERIFIED);
          const { zip } = await waitForBackupZip(
            downloads,
            [to],
            `before-copy-from-${from.toUpperCase()}`,
          );
          checkBackupZip(zip, [to], tag);
          expect(done.outcome ?? '', 'the result names the zip').toContain(
            `Saved first, as a download: ${zip.name}`,
          );
          if (patched.has(from)) patched.add(to);
          else patched.delete(to);
          expect(await refusalsOf(live()), 'nothing refused by the guards').toEqual([]);
        });
        it(`step ${n}: after the replug, ${to.toUpperCase()} holds ${from.toUpperCase()}'s image`, async () => {
          if (!written.has(to)) throw new Error(`the copy into ${to.toUpperCase()} did not run`);
          await replugAndRead(to, `after-${tag}`);
          const source = now.get(from);
          const target = now.get(to);
          say(
            `${tag}: Dump ${to.toUpperCase()} sha256 ${target === undefined ? '-' : sha256(target)}; ` +
              `Dump ${from.toUpperCase()} sha256 ${source === undefined ? '-' : sha256(source)}`,
          );
          await dumpOf(from, `after-${tag}`).then((raw) => now.set(from, raw));
        });
      } else if (step.kind === 'restore') {
        const { letter, holds, file } = step;
        const L = letter.toUpperCase();
        const tag = `step-${n}-restore-${letter}`;
        it(`step ${n}: "${RESTORE_LABEL}" on ${L} with ${basename(file)}: the plan, the zip saved first, the write, the read-back against the backup`, async () => {
          const { wizard, page, downloads } = live();
          await wizard.route('#/slots');
          const full = new Uint8Array(readFileSync(file));
          const offset = BANK_ADDRESS[letter] - FLASH_BASE;
          const backupBank = full.subarray(offset, offset + BANK_BYTES);
          say(`${tag}: ${file} sha256 ${sha256(full)}; its bank ${L} sha256 ${sha256(backupBank)}`);
          const input = (await page.$(
            `#slot-${letter}-restore-file`,
          )) as ElementHandle<HTMLInputElement> | null;
          if (input === null) throw new Error(`no restore picker for bank ${L}`);
          const moved = await wizard.watchStatus('#slotsrun-status');
          await input.uploadFile(file);
          await moved();
          const ready = await prepared();
          const plan = await preparedView(page);
          await keep(`${tag}-plan`, plan?.text ?? '(no prepared plan)');
          say(`${tag} plan: ${(plan?.text ?? '').replace(/\s+/g, ' ')}`);
          expect(ready, 'the restore is prepared').toMatch(/^Ready — /);
          const planText = plan?.text ?? '';
          expect(
            valueUnder(planText, 'Image taken from') ?? '',
            'where the image comes from',
          ).toContain(`in the full flash backup ${basename(file)}, firmware ${VERSION}`);
          expect(planText, 'this camera’s backup: no other-camera warning').not.toContain(
            'looks like another camera',
          );
          expect(valueUnder(planText, 'Saved first') ?? '').toMatch(
            new RegExp(`_bank-${L}_before-restore\\.zip\\. The zip is downloaded automatically`),
          );
          const done = await writePrepared(letter, tag);
          expect(done.status, `the restore of ${L}`).toBe(WRITTEN_STATUS);
          const { zip } = await waitForBackupZip(downloads, [letter], 'before-restore');
          checkBackupZip(zip, [letter], tag);
          /* Measured: whether the bank reads back as the backup stores it (the 2016 line re-encrypts under key
           * block 1 of the image's pair, so the bytes are expected to come back equal). */
          const verdict = (done.outcome ?? '')
            .split('\n')
            .find((line) => line.startsWith(`${SLOT_NAME[letter]} reads back`));
          say(`${tag}: restore verdict: ${verdict ?? '(none)'}`);
          expect(
            verdict,
            'the restore says how the read-back compares with the backup',
          ).toBeDefined();
          writeFileSync(path.join(OUT, `${tag}-verdict.txt`), `${verdict ?? ''}\n`);
          if (holds === 'patched') patched.add(letter);
          else patched.delete(letter);
          expect(await refusalsOf(live()), 'nothing refused by the guards').toEqual([]);
        });
        it(`step ${n}: after the replug, ${L} is the backup's bank`, async () => {
          if (!written.has(letter)) throw new Error(`the restore of ${L} did not run`);
          await replugAndRead(letter, `after-${tag}`);
          const full = new Uint8Array(readFileSync(file));
          const offset = BANK_ADDRESS[letter] - FLASH_BASE;
          const backupBank = full.subarray(offset, offset + BANK_BYTES);
          const dumped = now.get(letter);
          say(
            `${tag}: Dump ${L} sha256 ${dumped === undefined ? '-' : sha256(dumped)}; the backup's ${L} ${sha256(backupBank)}`,
          );
          expect(
            dumped !== undefined && Buffer.from(dumped).equals(Buffer.from(backupBank)),
            `Dump ${L} equals the backup's bank ${L}`,
          ).toBe(true);
        });
      } else if (step.kind === 'cancel') {
        const { letter, file } = step;
        const L = letter.toUpperCase();
        const tag = `step-${n}-cancel-${letter}`;
        const name = SLOT_NAME[letter];
        it(`step ${n}: a restore of ${L} cancelled right after Yes: "Cancelled — nothing was written."`, async () => {
          const { wizard, page } = live();
          await wizard.route('#/slots');
          const input = (await page.$(
            `#slot-${letter}-restore-file`,
          )) as ElementHandle<HTMLInputElement> | null;
          if (input === null) throw new Error(`no restore picker for bank ${L}`);
          const moved = await wizard.watchStatus('#slotsrun-status');
          await input.uploadFile(file);
          await moved();
          expect(await prepared(), 'the restore is prepared').toMatch(/^Ready — /);
          await openWriteConfirm(wizard, page, name);
          if ((await page.$(ACK_BOX)) !== null) await page.click(ACK_BOX);
          /* The commit budget stays 0: a commit that went out would be refused and named. */
          await setGuard(page, {
            allowReset: false,
            resetBudget: null,
            stageBudget: STAGE_BUDGET,
            commitBudget: 0,
            commitSum16: null,
          });
          const startedAt = Date.now();
          let status: string;
          try {
            await wizard.click(CONFIRM_DIALOG, `Yes — write to ${name}`);
            await page.waitForFunction(
              (section: string, dialog: string) =>
                document.querySelector(dialog) === null &&
                [...(document.querySelector(section)?.querySelectorAll('button') ?? [])].some(
                  (button) => button.textContent.trim() === 'Cancel' && !button.disabled,
                ),
              { timeout: 10_000, polling: 50 },
              SLOTS_SECTION,
              CONFIRM_DIALOG,
            );
            const before = await wizard.text('#slotsrun-status');
            say(
              `${tag}: Cancel pressed ${String(Date.now() - startedAt)} ms after Yes, status "${before}"`,
            );
            status = await wizard.cancel('slotsrun', SLOTS_SECTION, 120_000);
          } finally {
            await setGuard(page, {
              allowReset: false,
              resetBudget: null,
              stageBudget: 0,
              commitBudget: 0,
              commitSum16: null,
            }).catch(() => undefined);
          }
          const log = await wizard.text('#slotsrun-log');
          writeFileSync(path.join(OUT, `${tag}-log.txt`), log);
          await keep(`${tag}-after`, await wizard.text(SLOTS_SECTION));
          say(`${tag}: "${status}" after ${String(Date.now() - startedAt)} ms`);
          expect(status, 'the cancel before the commit').toBe('Cancelled — nothing was written.');
          expect(count(log, /committing, CompleteMemoryUpgrade/g), 'no commit').toBe(0);
          expect(await refusalsOf(live()), 'nothing refused by the guards').toEqual([]);
        });
        it(`step ${n}: after the replug, ${L} is as it was`, async () => {
          await replugAndRead([], `after-${tag}`);
          const raw = await dumpOf(letter, `after-${tag}-again`);
          const was = now.get(letter);
          expect(
            was !== undefined && Buffer.from(raw).equals(Buffer.from(was)),
            `Dump ${L} equals the bank before the cancelled write`,
          ).toBe(true);
        });
      } else {
        const tag = `step-${n}-every`;
        let order: BankLetter[] = [];
        it(`step ${n}: "${EVERY_LABEL}": one confirmation, one zip of every bank it patches, each written and read back`, async () => {
          const { wizard, page, downloads } = live();
          await wizard.route('#/slots');
          order = LETTERS.filter((letter) => !patched.has(letter));
          await wizard.click(SLOTS_SECTION, EVERY_LABEL);
          await page.waitForSelector(CONFIRM_DIALOG, { timeout: 10_000 });
          const dialog = await page.$eval(CONFIRM_DIALOG, (el) => (el as HTMLElement).innerText);
          await keep(`${tag}-dialog`, dialog);
          say(`${tag} dialog: ${dialog.replace(/\s+/g, ' ')}`);
          /* The write order: B, then R, then A (the booted bank last), of the banks that offer it. */
          const rank: Record<BankLetter, number> = { b: 0, r: 1, a: 2 };
          order.sort((x, y) => rank[x] - rank[y]);
          const confirm = `Yes — patch ${String(order.length)} bank${order.length === 1 ? '' : 's'}`;
          try {
            expect(dialog).toContain(`Make every bank run at ${String(TO_HZ)} FPS?`);
            expect(dialog).toContain(
              `They are written in this order: ${order.map((letter) => SLOT_NAME[letter]).join(', then ')}.`,
            );
            /* The zip lists the banks A, B, R (core `patchEveryBankFps`); the dialog says the write order. */
            expect(dialog).toContain(
              `_bank-${[...order]
                .sort((x, y) => 'abr'.indexOf(x) - 'abr'.indexOf(y))
                .map((letter) => letter.toUpperCase())
                .join('-')}_before-fps-patch-every-bank.zip`,
            );
            for (const codeName of CODE_NAMES) expect(dialog, codeName).not.toContain(codeName);
          } catch (error) {
            await wizard.click(CONFIRM_DIALOG, 'Cancel');
            throw error;
          }
          const ack = await page.$('#slot-fps-every-ack');
          expect(ack !== null, 'the tick, when A or R is among them').toBe(
            order.includes('a') || order.includes('r'),
          );
          if (ack !== null) {
            expect(
              await wizard.isEnabled(CONFIRM_DIALOG, confirm),
              'Yes is off before the tick',
            ).toBe(false);
            await page.$eval('#slot-fps-every-ack', (el) => {
              (el as HTMLInputElement).click();
            });
          }
          await setGuard(page, {
            allowReset: false,
            resetBudget: null,
            stageBudget: STAGE_BUDGET * order.length,
            commitBudget: order.length,
            commitSum16: null,
          });
          let status: string;
          const startedAt = Date.now();
          try {
            status = await runAndSettle(
              wizard,
              page,
              () => wizard.click(CONFIRM_DIALOG, confirm),
              /^(Patched|Stopped|Failed|Cancelled)/,
              60 * 60_000,
            );
          } finally {
            await setGuard(page, {
              allowReset: false,
              resetBudget: null,
              stageBudget: 0,
              commitBudget: 0,
              commitSum16: null,
            }).catch(() => undefined);
          }
          for (const letter of order) written.add(letter);
          const log = await wizard.text('#slotsrun-log');
          const section = await wizard.text(SLOTS_SECTION);
          writeFileSync(path.join(OUT, `${tag}-log.txt`), log);
          await keep(`${tag}-after`, section);
          say(`${tag}: "${status}" after ${String(Date.now() - startedAt)} ms`);
          expect(status).toBe(
            `Patched ${String(order.length)} bank${order.length === 1 ? '' : 's'}. Each reads back as planned.`,
          );
          for (const codeName of CODE_NAMES) expect(log, codeName).not.toContain(codeName);
          expect(count(log, /unplug and replug/i), 'the replug line, once in the log').toBe(1);
          expect(count(log, /committing, CompleteMemoryUpgrade/g), 'one commit per bank').toBe(
            order.length,
          );
          const { zip } = await waitForBackupZip(
            downloads,
            [...order].sort((x, y) => 'abr'.indexOf(x) - 'abr'.indexOf(y)),
            'before-fps-patch-every-bank',
          );
          checkBackupZip(zip, order, tag);
          for (const letter of order) patched.add(letter);
          expect(await refusalsOf(live()), 'nothing refused by the guards').toEqual([]);
        });
        it(`step ${n}: after the replug, every bank is patched`, async () => {
          if (order.length === 0) throw new Error('the every-bank patch did not run');
          await replugAndRead(order, `after-${tag}`);
        });
      }
    }
  },
);
