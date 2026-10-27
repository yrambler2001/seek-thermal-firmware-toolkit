/* ==================================================================== *
 * The Firmware slots page, in Chrome, on emulated cameras. Run it with
 * `npx vitest run --config e2e/vitest.config.ts slots-view.e2e` (there is no npm script for it).
 *
 * EMULATOR ONLY. This spec refuses to run with SEEK_E2E_TARGET=camera: the
 * slots page can write a bank, and every bank write here goes to an emulated
 * flash. Each camera is its own emulator (`slots-camera.ts`), booted from a
 * corpus entry, behind its own Chrome, with the page on the Vite dev server.
 *
 * Two supported cameras, the same flow on each:
 *   - a modern Compact, 4.8.2.1 (the 4.x line: banks A, B, R at 0x14030000,
 *     0x14050000, 0x14070000; Key A staging);
 *   - the bench Compact, 1.3.0.0 (the 2014 plaintext chain: banks A, B, R at
 *     0x14050000, 0x14060000, 0x14070000; plain staging).
 * On each: Read slots shows the three banks; every bank's Dump saves a 64 KiB
 * file whose sha is the emulator's own flash for that bank; a decrypted image
 * of the booted bank is picked into the bank the camera does NOT boot, through
 * the plan, the confirmation and the read-back check; the booted bank's and
 * recovery's writes stay disabled until the extra acknowledgement is ticked;
 * and recovery R writes with the tick and verifies.
 *
 * Two builds below 0.8.0.0 (a 0.7.0.7 and a 0.5.1.3, both image-only entries
 * the emulator boots on a donor): the page says why it refused, offers no
 * action, and sends nothing but the version read.
 *
 * SCREENSHOTS. With SEEK_E2E_SLOTS_SHOTS=<dir> the spec saves the page at a
 * desktop width (1280) and a phone width (375) at each state worth a look.
 * ==================================================================== */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { say } from './lib/browser.js';
import { describeWire, sha256, wireSince } from './lib/checks.js';
import { KEEP } from './lib/spec.js';
import { refusalsOf, wireOf } from './lib/target-tools.js';
import { targetUnavailable, wantedTarget, type TargetHandle } from './lib/target.js';
import {
  corpusEntryId,
  emulatorBankBytes,
  openSlotsCamera,
  type SlotsCamera,
} from './lib/slots-camera.js';
import {
  ACK_BOX,
  CONFIRM_DIALOG,
  SLOTS_SECTION,
  SLOTS_TABLE_ROWS,
  bankRows,
  confirmEnabled,
  confirmWrite,
  copyLabel,
  dumpBank,
  outcomeAlert,
  openWriteConfirm,
  pickImage,
  preparedView,
  readSlots,
  slotsAlerts,
  snap,
  summaryRows,
  type BankLetter,
  type BankRowView,
} from './lib/slots-page.js';

if (wantedTarget() !== 'emu') {
  throw new Error('slots-view.e2e is emulator-only: it must not run with SEEK_E2E_TARGET=camera');
}

const unavailable = targetUnavailable('emu');
if (unavailable !== null) {
  process.stderr.write(`\n[skip] the Firmware slots page [emu]: ${unavailable}\n`);
}

/** Where `SEEK_E2E_SLOTS_SHOTS` says the screenshots go, or null for none. */
const SHOTS = process.env.SEEK_E2E_SLOTS_SHOTS ?? '';
const SHOT_DIR = SHOTS === '' ? null : SHOTS;

const DESKTOP = { width: 1280, height: 900 };
/* Width only: `isMobile` makes Chrome re-create the document, which drops the camera. */
const PHONE = { width: 375, height: 812 };

/** The bank layouts the plan puts each bank at, per family (see the dump suite's BANK_LAYOUT). */
const MODERN_LAYOUT: Readonly<Record<BankLetter, string>> = {
  a: '0x14030000',
  b: '0x14050000',
  r: '0x14070000',
};
const LEGACY_LAYOUT: Readonly<Record<BankLetter, string>> = {
  a: '0x14050000',
  b: '0x14060000',
  r: '0x14070000',
};

interface SupportedCase {
  readonly camera: SlotsCamera;
  readonly version: string;
  readonly layout: Readonly<Record<BankLetter, string>>;
  /**
   * Whether core can compare the write's read-back with an expected image. True on
   * the 2014 plain chain (the stored bytes are the image). False on the Key A line:
   * the device re-encrypts the staged payload under the bank's store key, so core
   * reports the read-back without comparing it, and the spec proves the write by
   * dumping the bank back and comparing the decrypted bytes instead.
   */
  readonly comparesReadBack: boolean;
  /** The frame-rate row action this build offers on a bank that holds an image (its rate), if any. */
  readonly makeFps?: number;
}

interface OutOfScopeCase {
  readonly camera: SlotsCamera;
  readonly version: string;
  /**
   * The reason the page must show. "predates": the build answers its version and
   * is below 0.8.0.0. "unknown-version": the camera never answers GetFirmwareInfo
   * (the 0.5.x line stalls it through core's start-up window), so the page cannot
   * name the build; that is the refusal the emulator gives, and the spec pins it.
   */
  readonly reason: 'predates' | 'unknown-version';
}

/** The entry id for `prefix` of `kind`, or a throw naming what is missing. */
function entryFor(prefix: string, kind: 'full-dump' | 'image-only', label: string): SlotsCamera {
  const entryId = unavailable === null ? corpusEntryId(prefix, kind) : null;
  if (entryId === null && unavailable === null) {
    throw new Error(`the emulator has no ${kind} entry ${prefix} (${label})`);
  }
  return { label, entryId: entryId ?? '' };
}

const SUPPORTED: readonly SupportedCase[] = [
  {
    camera: entryFor(
      'compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/',
      'full-dump',
      'Compact 4.8.2.1, modern 4.x',
    ),
    version: '4.8.2.1',
    layout: MODERN_LAYOUT,
    comparesReadBack: false,
    /* compact_32k-4.8.2.1-to32 (TESTING.md 42.24, 2af8bb8). */
    makeFps: 32,
  },
  {
    camera: entryFor(
      'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/',
      'full-dump',
      'Compact 1.3.0.0, bench',
    ),
    version: '1.3.0.0',
    layout: LEGACY_LAYOUT,
    comparesReadBack: true,
    /* compact_32k-1.3.0.0-to32 (TESTING.md 42.25); the 16 Hz patches were removed in 42.26 (db45c5b). */
    makeFps: 32,
  },
];

const OUT_OF_SCOPE: readonly OutOfScopeCase[] = [
  {
    camera: entryFor(
      'compact/2014.09.04-14.15.36-0.7.0.7/',
      'image-only',
      'Compact 0.7.0.7 (image-only)',
    ),
    version: '0.7.0.7',
    reason: 'predates',
  },
  {
    camera: entryFor(
      'compact/2014.07.16-09.38.17-0.5.1.3/',
      'image-only',
      'Compact 0.5.1.3 (image-only)',
    ),
    version: '0.5.1.3',
    reason: 'unknown-version',
  },
];

/** The scratch directory for one camera: removed after its tests unless `SEEK_E2E_KEEP=1`. */
function scratchFor(slug: string): string {
  const base =
    process.env.SEEK_E2E_SCRATCH ?? path.join(tmpdir(), `seek-e2e-slots-${String(process.pid)}`);
  return path.join(base, slug);
}

/** Which bank the camera boots, from the table; throws when none is marked. */
function bootedOf(rows: readonly BankRowView[]): BankRowView {
  const booted = rows.filter((row) => row.booted);
  if (booted.length !== 1) {
    throw new Error(`expected exactly one bank marked "booted now", got ${String(booted.length)}`);
  }
  const [only] = booted;
  if (only === undefined) throw new Error('no bank is marked "booted now"');
  return only;
}

/** The bank a plain image goes into: not the booted one, and not recovery. */
function targetOf(rows: readonly BankRowView[]): BankRowView {
  const target = rows.find((row) => !row.booted && row.letter !== 'r');
  if (target === undefined) throw new Error('no bank other than the booted one and R to write');
  return target;
}

/** Writes `bytes` into the scratch directory and returns the path. */
function writeScratch(dir: string, name: string, bytes: Uint8Array): string {
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, name);
  writeFileSync(file, bytes);
  return file;
}

/** The Firmware cell's version, from its text (e.g. "4.8.2.1" inside "4.8.2.1 image …"). */
function versionCell(row: BankRowView): string {
  return row.firmware.split(' ')[0] ?? '';
}

/**
 * The verdict the page must show for a write on this build (see `comparesReadBack`). On the Key A line the
 * page compares the bank's decrypted read-back with the image it staged (core's write-verify wording: "the
 * bank decrypts to the expected image"), not the raw bytes, which the device re-encrypts.
 */
function verdictFor(subject: SupportedCase): string {
  return subject.comparesReadBack
    ? 'the bank reads back as written.'
    : 'the bank decrypts to the expected image';
}

/**
 * The bank table's rows. The booted bank's badge is "booted now" on every line, the 2014 plain chain
 * included (TESTING.md 42.89: 42.56 measured the active-slot word as the bank that ran).
 */
async function rowsOf(page: Parameters<typeof bankRows>[0]): Promise<BankRowView[]> {
  return bankRows(page);
}

/**
 * Reads the bank back through the page's own Read and Dump, and compares its
 * decrypted image with the one written. This is the check that holds on every
 * build: it does not trust the page's verdict, only the bytes the bank now holds.
 */
async function expectWrittenImage(
  t: TargetHandle,
  letter: BankLetter,
  plain: Uint8Array,
): Promise<void> {
  const name = letter.toUpperCase();
  await readSlots(t.wizard, t.page);
  const dumped = await dumpBank(t.wizard, t.page, t.downloads, letter);
  expect(dumped.decrypted, `${name} after the write decrypts under a recovered key`).not.toBeNull();
  if (dumped.decrypted === null) return;
  expect(
    sha256(dumped.decrypted.bytes),
    `${name}: the decrypted read-back is the image written`,
  ).toBe(sha256(plain));
  say(
    `${name} read back after the write: decrypted ${String(dumped.decrypted.bytes.length)} B = the image written`,
  );
}

/* ---- the supported builds: read, dump, write, acknowledge, recover -------- */

for (const subject of SUPPORTED) {
  describe.skipIf(unavailable !== null)(
    `the Firmware slots page on ${subject.camera.label} [emu]`,
    () => {
      const scratch = scratchFor(subject.camera.label.replace(/[^A-Za-z0-9]+/g, '-'));
      let t: TargetHandle;
      /** The booted bank's decrypted image, from the dump test: what the write tests pick. */
      let bootedPlain: Uint8Array | null = null;
      /** The name the page saved the booted bank's decrypted image under: the flash picks it by name. */
      let bootedPlainName: string | null = null;
      let bootedLetter: BankLetter | null = null;
      /** The booted image's name as the page saved it, which the write tests hand back to the picker. */
      const bootedNameOf = (): string => {
        if (bootedPlainName === null) throw new Error('the dump test gave no decrypted name');
        return bootedPlainName;
      };

      beforeAll(async () => {
        mkdirSync(scratch, { recursive: true });
        t = await openSlotsCamera(subject.camera, { scratchDir: scratch });
      }, 10 * 60_000);

      afterAll(async () => {
        /* beforeAll may have failed before `t` was set, so this can run with nothing open. */
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        await t?.close().catch((error: unknown) => {
          say(`close failed: ${String(error)}`);
        });
        if (!KEEP) rmSync(scratch, { recursive: true, force: true });
        else say(`kept: ${scratch}`);
      });

      it(
        'reads the three banks: addresses, version, key, bootability and what each may do',
        async () => {
          const w = t.wizard;
          await w.route('#/slots');
          await w.connect();

          const before = await wireOf(t);
          const status = await readSlots(w, t.page);
          say(`slots: ${status}`);
          expect(status, await w.logTail('slotsrun')).toMatch(/^Read\. 3\/3 banks read/);

          const rows = await rowsOf(t.page);
          expect(rows.map((row) => row.name)).toEqual(['Slot A', 'Slot B', 'Recovery R']);
          for (const row of rows) {
            expect(row.address, `${row.name} address`).toBe(subject.layout[row.letter]);
            const holdsImage = row.firmware.startsWith(subject.version);
            if (holdsImage) {
              expect(versionCell(row), `${row.name} firmware`).toBe(subject.version);
              expect(row.keyName, `${row.name} key`).not.toBe('—');
            } else {
              /* An empty bank (the bench's B) is shown as such, not as a version. */
              say(`${row.name} holds no image: ${row.firmware}`);
              expect(row.booted, `${row.name}: only an empty bank may hold no image`).toBe(false);
              expect(row.firmware, `${row.name} is named empty`).toMatch(/^empty\b/);
            }
            expect(row.bootable, `${row.name} bootability`).toMatch(
              /bootable|not bootable|unknown|nothing to boot/,
            );
            if (row.firmware.startsWith(subject.version)) {
              expect(row.sha256, `${row.name} sha256`).toMatch(/^[0-9a-f]{64}$/);
            }
            /* Per-op support: a read bank can be dumped and both flash actions are offered. Each row
             * copies its image to the other two banks, filled or empty, and restores from a full
             * flash backup (TESTING.md 42.91); an empty bank has no image to copy, so its copy
             * buttons are off. */
            const labels = row.buttons.map((button) => button.label);
            const copies = (['a', 'b', 'r'] as const)
              .filter((other) => other !== row.letter)
              .map(copyLabel);
            expect(labels, `${row.name} actions`).toEqual([
              'Dump',
              'Flash decrypted image…',
              'Flash raw bytes…',
              ...copies,
              'Restore from full flash backup…',
              ...(holdsImage && subject.makeFps !== undefined
                ? [`Make ${String(subject.makeFps)} FPS`]
                : []),
            ]);
            for (const button of row.buttons) {
              expect(button.enabled, `${row.name}: ${button.label}`).toBe(
                holdsImage || !button.label.startsWith('Copy to '),
              );
            }
          }
          expect(rows.filter((row) => row.booted)).toHaveLength(1);
          const booted = bootedOf(rows);
          const summary = await summaryRows(t.page);
          expect(summary.version).toBe(subject.version);
          expect(summary.profile, 'the profile the build reads under').not.toBe('');
          /* "Booted from", on every line. */
          expect(summary['booted from']).toBe(booted.name);
          say(
            `rows: ${rows.map((row) => `${row.name} ${row.address}${row.booted ? ' (booted)' : ''} key=${row.keyName} ${row.bootable}`).join(' | ')}`,
          );

          /* The read's wire: the version read and the bank reads, nothing that writes. */
          const after = await wireOf(t);
          const sent = wireSince(before, after);
          say(`wire for Read slots: ${describeWire(sent)}`);
          /* 0x55 and 0x5a are the two info selectors `readDeviceInfo` always sends. */
          for (const key of ['out 0x50', 'out 0x51']) {
            expect(sent.has(key), key).toBe(false);
          }
          expect(await refusalsOf(t)).toEqual([]);

          await snap(t.page, SHOT_DIR, `${subject.version}-read-desktop`);
          await t.page.setViewport(PHONE);
          await snap(t.page, SHOT_DIR, `${subject.version}-read-phone`);
          await t.page.setViewport(DESKTOP);
        },
        15 * 60_000,
      );

      it(
        "dumps every bank: a 64 KiB file whose sha is the emulator flash's bank",
        async () => {
          const w = t.wizard;
          const emu = t.emu;
          if (emu === null) throw new Error('the emulator target has no bus');
          for (const letter of ['a', 'b', 'r'] as const) {
            const name = letter.toUpperCase();
            const row = (await rowsOf(t.page)).find((candidate) => candidate.letter === letter);
            if (row === undefined) throw new Error(`the bank table has no row for ${name}`);
            expect(
              row.buttons.find((button) => button.label === 'Dump')?.enabled,
              `${name} Dump`,
            ).toBe(true);
            const dumped = await dumpBank(w, t.page, t.downloads, letter);
            const want = emulatorBankBytes(emu, Number.parseInt(row.address, 16), 0x10000);
            expect(dumped.raw.bytes.length, `${name} raw length`).toBe(0x10000);
            expect(sha256(dumped.raw.bytes), `${name} raw sha = the emulator's bank`).toBe(
              sha256(want),
            );
            expect(dumped.raw.name, `${name} file name carries the first 8 of its sha`).toContain(
              sha256(dumped.raw.bytes).slice(0, 8),
            );
            say(
              `dump ${name}: ${dumped.raw.name} (${String(dumped.raw.bytes.length)} B) = the flash`,
            );
            if (row.booted) {
              bootedLetter = letter;
              expect(dumped.decrypted, `${name} (booted) has a decrypted image`).not.toBeNull();
              if (dumped.decrypted !== null) {
                bootedPlain = dumped.decrypted.bytes;
                bootedPlainName = dumped.decrypted.name;
                /* One stem for both files of a read since 42.71 (1d13e9d, `slotDumpNames`): the eight digits
                 * are the stored bank's, then `-decrypted` and the key pair the image holds, if any. */
                expect(
                  /^seek-slot-[abr]-[^-]+-([0-9a-f]{8})-decrypted(-KeyA-[0-9a-f]{32}-KeyB-[0-9a-f]{32})?\.bin$/.exec(
                    dumped.decrypted.name,
                  )?.[1],
                  `${name} decrypted file name carries the stored bank's first 8 of its sha`,
                ).toBe(sha256(dumped.raw.bytes).slice(0, 8));
              }
            }
          }
          expect(bootedLetter, 'the booted bank was dumped').not.toBeNull();
          expect(bootedPlain, 'the booted bank decrypted').not.toBeNull();
          expect(await refusalsOf(t)).toEqual([]);
        },
        30 * 60_000,
      );

      it(
        'flashes a decrypted image into the bank the camera does not boot: plan, confirm, read-back',
        async () => {
          const w = t.wizard;
          expect(bootedPlain, 'the dump test gave the booted image').not.toBeNull();
          if (bootedPlain === null) throw new Error('the dump test gave no booted image');
          const plain: Uint8Array = bootedPlain;
          await readSlots(w, t.page);
          const target = targetOf(await rowsOf(t.page));
          const name = target.name;
          const image = writeScratch(scratch, bootedNameOf(), plain);

          const status = await pickImage(w, t.page, target.letter, 'plain', image);
          expect(status, await w.logTail('slotsrun')).toMatch(/^Ready — /);
          const plan = await preparedView(t.page);
          expect(plan, 'the prepared plan is shown').not.toBeNull();
          if (plan === null) return;
          expect(plan.title).toBe(`Prepared for ${name} at ${target.address}`);
          expect(plan.text).toContain('a decrypted image');
          expect(plan.text).toContain('Payload');
          expect(plan.text).toContain('Transfer checksum');
          say(`plan: ${plan.text.replace(/\n+/g, ' | ')}`);
          say(`compare: ${plan.compareRows.join(' || ') || '(none)'}`);
          say(`warnings: ${plan.warnings.join(' || ') || '(none)'}`);
          await snap(t.page, SHOT_DIR, `${subject.version}-prepared-desktop`);
          await t.page.setViewport(PHONE);
          await snap(t.page, SHOT_DIR, `${subject.version}-prepared-phone`);
          await t.page.setViewport(DESKTOP);

          /* Nothing is sent until the confirmation is answered. */
          const beforeWrite = await wireOf(t);

          await w.click(SLOTS_SECTION, `Write to ${name}…`);
          await t.page.waitForSelector(CONFIRM_DIALOG, { timeout: 10_000 });
          expect(await confirmEnabled(w, name), 'the plain write needs no acknowledgement').toBe(
            true,
          );
          expect(await t.page.$(ACK_BOX), 'no acknowledgement box for a plain bank').toBeNull();
          await w.click(CONFIRM_DIALOG, 'Cancel');
          await t.page.waitForFunction(
            () => document.querySelector('[role="alertdialog"]') === null,
            {
              timeout: 10_000,
            },
          );
          expect(await wireOf(t), 'Cancel sends nothing').toEqual(beforeWrite);

          await openWriteConfirm(w, t.page, name);
          await snap(t.page, SHOT_DIR, `${subject.version}-confirm-desktop`);
          const status2 = await confirmWrite(w, t.page, name, false);
          say(`write: ${status2}`);
          expect(status2, await w.logTail('slotsrun')).toMatch(/^Written\. /);
          const outcome = await outcomeAlert(t.page);
          expect(outcome, 'the verification is shown').not.toBeNull();
          expect(outcome ?? '').toContain(
            `${target.letter === 'r' ? 'Recovery R' : `Slot ${target.letter.toUpperCase()}`} — `,
          );
          expect(outcome ?? '').toContain(verdictFor(subject));
          expect(outcome ?? '').toContain('NOW UNPLUG AND REPLUG THE CAMERA');
          await snap(t.page, SHOT_DIR, `${subject.version}-outcome-desktop`);

          /* The page drops its read at the commit point and reads the banks again after the read-back, so
           * the table is back, from that new read (TESTING.md 42.44): the target now holds the image. */
          const again = await rowsOf(t.page);
          expect(
            again.map((row) => row.name),
            'the table is back after the write',
          ).toEqual(['Slot A', 'Slot B', 'Recovery R']);
          const written = again.find((row) => row.letter === target.letter);
          say(
            `after the write: ${written?.name ?? '?'} ${written?.firmware ?? '?'} ${written?.sha256 ?? '?'}`,
          );
          expect(
            written === undefined ? '' : versionCell(written),
            `${name} holds the image written`,
          ).toBe(subject.version);
          /* Whatever the page says, the bank itself: read it back and compare its image. */
          await expectWrittenImage(t, target.letter, plain);
          expect(await refusalsOf(t)).toEqual([]);
        },
        30 * 60_000,
      );

      it(
        'holds the booted bank and recovery behind the extra acknowledgement',
        async () => {
          const w = t.wizard;
          expect(bootedPlain, 'the dump test gave the booted image').not.toBeNull();
          if (bootedPlain === null) throw new Error('the dump test gave no booted image');
          const plain: Uint8Array = bootedPlain;
          await readSlots(w, t.page);
          const rows = await rowsOf(t.page);
          const booted = bootedOf(rows);
          const recovery = rows.find((row) => row.letter === 'r');
          if (recovery === undefined) throw new Error('the table has no recovery row');

          /* The note under each flash action says why it asks for more. */
          /* "Booted now" on every line, the 2014 plain chain included (TESTING.md 42.89). */
          expect(booted.actionsText).toMatch(
            /Booted now: writing it asks for an extra confirmation\./,
          );
          expect(recovery.actionsText).toContain(
            'Recovery R: writing it asks for an extra confirmation.',
          );

          const image = writeScratch(scratch, bootedNameOf(), plain);
          const before = await wireOf(t);

          for (const [row, name] of [
            [booted, booted.name],
            [recovery, recovery.name],
          ] as const) {
            await pickImage(w, t.page, row.letter, 'plain', image);
            await openWriteConfirm(w, t.page, name);
            expect(await confirmEnabled(w, name), `${name}: Yes is off without the tick`).toBe(
              false,
            );
            expect(
              await t.page.$(ACK_BOX),
              `${name}: the acknowledgement box is shown`,
            ).not.toBeNull();
            const alertText = await t.page.$eval(
              CONFIRM_DIALOG,
              (el) => (el as HTMLElement).innerText,
            );
            expect(alertText, `${name}: the dialog says why`).toMatch(
              row.letter === 'r' ? /recovery bank/ : /boots now/,
            );
            await t.page.click(ACK_BOX);
            expect(await confirmEnabled(w, name), `${name}: Yes is on once ticked`).toBe(true);
            await snap(t.page, SHOT_DIR, `${subject.version}-ack-${row.letter}-desktop`);
            /* Only the booted bank is backed out here; recovery is written below. */
            if (row.letter === 'r') break;
            await w.click(CONFIRM_DIALOG, 'Cancel');
            await t.page.waitForFunction(
              () => document.querySelector('[role="alertdialog"]') === null,
              {
                timeout: 10_000,
              },
            );
            await w.click(SLOTS_SECTION, 'Discard');
          }
          /* Backing out of recovery's dialog too, so the gate tests end sending nothing. */
          await w.click(CONFIRM_DIALOG, 'Cancel');
          await t.page.waitForFunction(
            () => document.querySelector('[role="alertdialog"]') === null,
            {
              timeout: 10_000,
            },
          );

          const after = await wireOf(t);
          const sent = wireSince(before, after);
          say(`wire while the gates were held: ${describeWire(sent) || '(nothing)'}`);
          for (const key of ['out 0x50', 'out 0x51', 'out 0x52']) {
            expect(sent.has(key), `${key} during the gate checks`).toBe(false);
          }
        },
        20 * 60_000,
      );

      it(
        'writes recovery R with the acknowledgement, verifies it, and asks for a re-read',
        async () => {
          const w = t.wizard;
          expect(bootedPlain, 'the dump test gave the booted image').not.toBeNull();
          if (bootedPlain === null) throw new Error('the dump test gave no booted image');
          const plain: Uint8Array = bootedPlain;
          await readSlots(w, t.page);
          const image = writeScratch(scratch, bootedNameOf(), plain);
          const status = await pickImage(w, t.page, 'r', 'plain', image);
          expect(status, await w.logTail('slotsrun')).toMatch(/^Ready — /);
          const view = await preparedView(t.page);
          expect(view?.title).toBe(`Prepared for Recovery R at ${subject.layout.r}`);

          await openWriteConfirm(w, t.page, 'Recovery R');
          expect(await confirmEnabled(w, 'Recovery R')).toBe(false);
          const status2 = await confirmWrite(w, t.page, 'Recovery R', true);
          say(`recovery write: ${status2}`);
          expect(status2, await w.logTail('slotsrun')).toMatch(/^Written\. /);
          const outcome = await outcomeAlert(t.page);
          expect(outcome ?? '').toContain('Recovery R — ');
          expect(outcome ?? '').toContain(verdictFor(subject));
          await snap(t.page, SHOT_DIR, `${subject.version}-recovery-outcome-desktop`);

          /* Read again after the write: the page picks the camera up as it is now. */
          await expectWrittenImage(t, 'r', plain);
          const status3 = await readSlots(w, t.page);
          expect(status3).toMatch(/^Read\. 3\/3/);
          const rows = await rowsOf(t.page);
          expect(rows.map((row) => row.name)).toEqual(['Slot A', 'Slot B', 'Recovery R']);
          expect(await refusalsOf(t)).toEqual([]);
        },
        30 * 60_000,
      );
    },
  );
}

/* ---- the builds below 0.8.0.0: refused, nothing offered, nothing read ----- */

for (const subject of OUT_OF_SCOPE) {
  describe.skipIf(unavailable !== null)(
    `the Firmware slots page on ${subject.camera.label} [emu]`,
    () => {
      const scratch = scratchFor(subject.camera.label.replace(/[^A-Za-z0-9]+/g, '-'));
      let t: TargetHandle;

      beforeAll(async () => {
        mkdirSync(scratch, { recursive: true });
        t = await openSlotsCamera(subject.camera, { scratchDir: scratch });
      }, 10 * 60_000);

      afterAll(async () => {
        /* beforeAll may have failed before `t` was set, so this can run with nothing open. */
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        await t?.close().catch((error: unknown) => {
          say(`close failed: ${String(error)}`);
        });
        if (!KEEP) rmSync(scratch, { recursive: true, force: true });
        else say(`kept: ${scratch}`);
      });

      it(
        `refuses ${subject.version} after the version read: the reason, no bank, no action`,
        async () => {
          const w = t.wizard;
          await w.route('#/slots');
          await w.connect();

          const before = await wireOf(t);
          const status = await readSlots(w, t.page);
          say(`slots on ${subject.version}: ${status}`);
          expect(status).toMatch(/^Refused/);

          const alerts = await slotsAlerts(t.page);
          /* A build below 0.8.0.0 is "Refused — nothing was armed"; a camera with no usable version is
           * "Not identified: this page cannot tell which build the camera runs" (SlotsView RefusalAlert). */
          const refusal = alerts.find(
            (text) =>
              text.includes('Refused — nothing was armed') ||
              text.includes('Not identified: this page cannot tell which build'),
          );
          expect(refusal, `the refusal is shown: ${alerts.join(' || ')}`).toBeDefined();
          if (subject.reason === 'predates') {
            expect(refusal ?? '').toContain(`firmware ${subject.version}`);
            expect(refusal ?? '').toContain('predates the dump protocol');
          } else {
            /* The page cannot name a build that never answers its version: say so, and
             * pin that it does not guess one. */
            expect(refusal ?? '').toContain('no usable firmware version');
            expect(refusal ?? '').not.toContain(subject.version);
          }
          say(
            `refusal on ${subject.version}: ${(refusal ?? '').split('\n').slice(0, 2).join(' ')}`,
          );

          /* No bank table, and no action anywhere in the section but Read slots and Cancel. */
          expect(await t.page.$(SLOTS_TABLE_ROWS), 'no bank rows').toBeNull();
          const labels = await t.page.$$eval(`${SLOTS_SECTION} button`, (buttons) =>
            buttons.map((button) => button.textContent.trim()),
          );
          expect(labels.filter((label) => !['Read slots', 'Cancel'].includes(label))).toEqual([]);

          /* The wire: the version read, and nothing a bank read or a write would send. */
          const sent = wireSince(before, await wireOf(t));
          say(`wire for ${subject.version}: ${describeWire(sent)}`);
          expect([...sent.keys()].filter((key) => key !== 'in 0x4e')).toEqual([]);
          for (const key of ['in 0x4f', 'out 0x52', 'out 0x50', 'out 0x51']) {
            expect(sent.has(key), key).toBe(false);
          }
          expect(await refusalsOf(t)).toEqual([]);

          await snap(t.page, SHOT_DIR, `${subject.version}-refused-desktop`);
        },
        15 * 60_000,
      );
    },
  );
}
