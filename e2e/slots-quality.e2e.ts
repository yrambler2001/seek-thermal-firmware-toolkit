/* ====================================================================
 * The Work-with-firmware-slots page, in Chrome, against the ONE verdict table
 * (`e2e/lib/slots-expectations.ts`, TESTING.md 42.19): `npm run e2e:slots:quality`.
 *
 * EMULATOR ONLY (this spec refuses SEEK_E2E_TARGET=camera; it never writes, so it sends the
 * camera nothing that changes its flash). Three corpus cameras, each booted on the emulator and
 * opened on the page, each checked against its table row:
 *   - Compact 1.3.0.0 (the 2014 plain chain; bank B is empty on the dump): every bank's flash
 *     controls are on, no camera-wide banner, Make 32 FPS on A and R (the table's 32 Hz row; the
 *     16 Hz patch was removed, TESTING.md 42.26), and the empty B says why it has no frame-rate patch;
 *   - Compact 4.8.2.1 (the modern Key A line): every bank's flash controls on, no banner, and
 *     Make 32 FPS on the banks that hold the image (TESTING.md 42.24);
 *   - Compact PRO 1.0.3.0 (the 2016 keystream line): every bank's flash controls on, NO banner
 *     (the false "cannot be written" banner this page used to show on this line is the regression),
 *     and Make 18 FPS on every bank that holds the 1.0.3.0 image (the table's 18 Hz row, TESTING.md 42.29).
 * A row the table says is writable must show its flash controls enabled with no refusal; a row the
 * table says is refused must show the banner and its controls off. The camera is only read.
 *
 * SCREENSHOTS: SEEK_E2E_SLOTS_SHOTS=<dir> saves the page at each row.
 * ==================================================================== */

import { mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { say } from './lib/browser.js';
import { KEEP } from './lib/spec.js';
import { wantedTarget, targetUnavailable, type TargetHandle } from './lib/target.js';
import { corpusEntryId, openSlotsCamera, type SlotsCamera } from './lib/slots-camera.js';
import { SLOTS_SUBJECTS, type SlotsSubject } from './lib/slots-expectations.js';
import { bankRows, readSlots, snap, writeBanner, type BankRowView } from './lib/slots-page.js';

if (wantedTarget() !== 'emu') {
  throw new Error(
    'slots-quality.e2e is emulator-only: it must not run with SEEK_E2E_TARGET=camera',
  );
}

const unavailable = targetUnavailable('emu');
if (unavailable !== null) {
  process.stderr.write(`\n[skip] the slots page verdicts [emu]: ${unavailable}\n`);
}

const SHOT_DIR = process.env.SEEK_E2E_SLOTS_SHOTS ?? null;

/**
 * A bank with no "Make N FPS" says why in words (SlotTable `fpsOffNote`): a refusal, or, for a bank that
 * already runs the faster rate, the state it is in (TESTING.md 42.86).
 */
const NO_OFFER_WORDS =
  /Frame-rate patch not offered: |Frame-rate patch applied: |No frame-rate patch needed: /;

/**
 * The three rows the page spec boots, by their table name, with the corpus prefix each boots from. The
 * prefixes are the manifest's own ids (`corpusEntryId` finds the entry; the table holds the verdicts).
 */
const BOOTED: readonly {
  readonly name: string;
  readonly prefix: string;
  readonly kind: 'full-dump';
}[] = [
  {
    name: 'Compact 1.3.0.0',
    prefix: 'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/',
    kind: 'full-dump',
  },
  {
    name: 'Compact 4.8.2.1',
    prefix: 'compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/',
    kind: 'full-dump',
  },
  {
    name: 'Compact PRO 1.0.3.0 (std)',
    prefix: 'compact_pro/2016.07.06-17.04.49-1.0.3.0/0C21A1M5KP15/',
    kind: 'full-dump',
  },
];

/** The table row a name picks. Throws when the table has no such row. */
function rowNamed(name: string): SlotsSubject {
  const row = SLOTS_SUBJECTS.find((candidate) => candidate.name === name);
  if (row === undefined) throw new Error(`the verdict table has no row "${name}"`);
  return row;
}

/** The buttons of one bank row whose label starts with `prefix`. */
function buttonsStarting(row: BankRowView, prefix: string): BankRowView['buttons'] {
  return row.buttons.filter((button) => button.label.startsWith(prefix));
}

/** The flash controls (the two file pickers) of a row. */
function flashControls(row: BankRowView): BankRowView['buttons'] {
  return buttonsStarting(row, 'Flash ');
}

for (const boot of BOOTED) {
  const subject = rowNamed(boot.name);
  describe.skipIf(unavailable !== null)(`the slots page on ${boot.name} [emu]`, () => {
    const scratch = path.join(
      process.env.SEEK_E2E_SCRATCH ??
        path.join(tmpdir(), `seek-e2e-quality-${String(process.pid)}`),
      boot.name.replace(/[^A-Za-z0-9]+/g, '-'),
    );
    let t: TargetHandle;
    let rows: BankRowView[] = [];
    let banner: string | null = null;

    beforeAll(async () => {
      if (unavailable !== null) return;
      const entryId = corpusEntryId(boot.prefix, boot.kind);
      if (entryId === null)
        throw new Error(`the emulator corpus has no entry under ${boot.prefix}`);
      mkdirSync(scratch, { recursive: true });
      const camera: SlotsCamera = { label: boot.name, entryId };
      t = await openSlotsCamera(camera, { scratchDir: scratch });
      await t.wizard.route('#/slots');
      await t.wizard.connect();
      const status = await readSlots(t.wizard, t.page);
      say(`slots on ${boot.name}: ${status}`);
      rows = await bankRows(t.page);
      banner = await writeBanner(t.page);
      await snap(t.page, SHOT_DIR, `quality-${boot.name.replace(/[^A-Za-z0-9]+/g, '-')}-desktop`);
    }, 15 * 60_000);

    afterAll(async () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      await t?.close().catch((error: unknown) => {
        say(`close failed: ${String(error)}`);
      });
      if (!KEEP) rmSync(scratch, { recursive: true, force: true });
    });

    it('shows the camera-wide banner exactly as the table says (none on this row)', () => {
      expect(
        banner,
        `${boot.name}: the banner the page shows (the table says ${subject.banner})`,
      ).toBeNull();
    });

    it('offers the flash controls on every bank the table says is writable, with no refusal in its row', () => {
      expect(rows.map((row) => row.letter)).toEqual(['a', 'b', 'r']);
      for (const row of rows) {
        const verdict = subject.banks[row.letter];
        const controls = flashControls(row);
        expect(controls.length, `${row.name}: its flash controls are shown`).toBe(2);
        if (verdict.writable) {
          for (const control of controls) {
            expect(control.enabled, `${row.name}: ${control.label} is offered`).toBe(true);
          }
          expect(row.actionsText, `${row.name}: no refusal in the row`).not.toContain(
            'cannot be written',
          );
        } else {
          for (const control of controls) {
            expect(control.enabled, `${row.name}: ${control.label} is refused`).toBe(false);
          }
        }
      }
    });

    it('frame-rate: "Make N FPS" exactly where the table offers it, and the reason in words where it does not', () => {
      for (const row of rows) {
        const make = row.buttons.filter((button) => button.label.startsWith('Make '));
        if (subject.fps.offer) {
          const holdsImage = row.firmware.startsWith(subject.version);
          if (holdsImage) {
            expect(
              make.map((button) => button.label),
              `${row.name}: the offer`,
            ).toEqual([`Make ${String(subject.fps.toHz)} FPS`]);
            expect(make[0]?.enabled, `${row.name}: the offer is on`).toBe(true);
          } else {
            expect(make, `${row.name}: no offer on a bank with no image`).toEqual([]);
            expect(row.actionsText, `${row.name}: says why`).toMatch(NO_OFFER_WORDS);
          }
        } else {
          expect(make, `${row.name}: no frame-rate offer on this build`).toEqual([]);
          expect(row.actionsText, `${row.name}: says why`).toMatch(NO_OFFER_WORDS);
        }
      }
    });

    it('says why an empty bank has no frame-rate patch (the reason is in its row, not silence)', () => {
      const empty = rows.find((row) => row.firmware.startsWith('empty'));
      if (empty === undefined) {
        say(`${boot.name}: no empty bank on this dump`);
        return;
      }
      expect(empty.actionsText).toContain('Frame-rate patch not offered: bank');
      expect(empty.actionsText).toContain('it is empty');
    });
  });
}
