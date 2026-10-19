/* ====================================================================
 * The web app's pages on the REAL bench camera (Compact PIR206, 1.3.0.0), through Electron
 * and real WebUSB: `npm run e2e:pages:bench`. Needs the bench (SEEK_E2E_WRITE=i-understand,
 * SEEK_E2E_FWV1_DIR, SEEK_E2E_SWITCH_DIR, SEEK_FULL_DUMPS_BY_CAMERA when the baseline is taken from there).
 *
 * THE ORDER (each part leaves the camera as it found it):
 *   0. the whole flash is read back halted and must be the baseline (sha256 40447c7e…eb72);
 *   A. read-only session (the Info, 0.x/1.x, 4.x/Nano and Decrypt File/Slot tabs):
 *      - Info reads the version 1.3.0.0 and names the 0.x/1.x tab, sending identity reads only;
 *      - 0.x/1.x: the first step ("Read & build", read-only) saves a run zip whose windows are
 *        byte runs of the halted flash read (taken with the J-Link, not the page);
 *      - 4.x/Nano refuses this camera before any dump read: its wire is a subset of Info's;
 *      - Decrypt File/Slot decrypts a 64 KiB slot file of the halted flash with no camera (nothing
 *        is sent to it), and refuses a file of the wrong size with the refusal text;
 *   B. the slots page (its own window, the bench rig's page): Read slots; Dump A, B and R equal to
 *      the halted flash; a refused image (wrong size) is DENIED with its refusal text and nothing is
 *      sent; one allowed write, the decrypted image into bank B (not booted: no acknowledgement),
 *      with no write banner, the J-Link reads back the same bytes; then the baseline is restored
 *      by the J-Link and verified halted, and the camera is power-cycled.
 *
 * The write guards are the same as the rest of the bench (`lib/bench/spec-page.ts`, `camera-flow.ts`):
 * part A's page cannot write at all (the read-only preload), part B's writes are budgeted.
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { say } from './lib/browser.js';
import { describeWire, wireSince } from './lib/checks.js';
import { NEVER_ON_THE_WIRE, step02 } from './lib/camera-flow.js';
import {
  closeCameraSession,
  countsOf,
  guardOf,
  openCameraSession,
  setGuard,
  type CameraSession,
} from './lib/electron-camera.js';
import { electronBinary } from './lib/electron.js';
import { HEADED } from './lib/spec.js';
import { cameraBusyReason } from './lib/preflight.js';
import { approveWrite, type WriteApproval } from './lib/supervised-write.js';
import {
  createBenchCamera,
  createJlinkBench,
  type BenchCamera,
  type JlinkBench,
} from './lib/bench/index.js';
import { createRealRig } from './lib/bench/spec-page.js';
import type { BankLetter, BenchPage, BenchRig } from './lib/bench/spec-rig.js';
import { readZip } from './lib/zip.js';

const SCRATCH =
  process.env.SEEK_E2E_SCRATCH ??
  path.join(tmpdir(), `seek-e2e-pages-bench-${String(process.pid)}`);
const KEEP = process.env.SEEK_E2E_KEEP === '1';

/** The bench camera's original 4 MiB (Compact PIR206, serial 101310HSNEA2, 1.3.0.0). */
const BASELINE_SHA = '40447c7e6da5cbc84621f4694ffff5bda0f783e7807a45e80443383b19a8eb72';
const BASELINE_FILE =
  process.env.SEEK_PAGES_BASELINE ??
  path.join(
    process.env.SEEK_FULL_DUMPS_BY_CAMERA ?? '',
    'Compact',
    'Compact',
    '2014.10.21-14.58.29-1.3.0.0',
    'full_dump_original.bin',
  );
const FLASH_BASE = 0x14000000;
const FLASH_BYTES = 0x400000;
/** The three banks the page reads and writes (the 1.3.0.0 layout). */
const BANK_ADDRESS = { a: 0x14050000, b: 0x14060000, r: 0x14070000 } as const;
const BANK_BYTES = 0x10000;
/** The bootloader window's first 12 KiB, as offsets into the 4 MiB flash: the one stretch the 0.x/1.x backup leaves erased. */
const BACKUP_GAP_BYTES = { start: 0x0, end: 0x3000 } as const;
/** The image length is the header word at 0x204 (the core's header.length). */
const HEADER_LENGTH_OFFSET = 0x204;
/** What a Compact 1.3.0.0 page run may take, in ms. */
const RUN_TIMEOUT_MS = 30 * 60_000;

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function unavailable(): string | null {
  if (electronBinary() === null) return 'the electron package is not installed';
  return cameraBusyReason();
}

const gate: WriteApproval = await approveWrite('camera', () =>
  Promise.resolve({
    describe:
      'the web app pages on the bench camera: Info, 0.x/1.x (read-only first step), 4.x/Nano (refused), ' +
      'Decrypt File/Slot (no camera), and the slots page (Dump A/B/R, one refused image, one decrypted write to B, restored)',
  }),
);
const UNAVAILABLE = unavailable();
const RUNNABLE = gate.approved && UNAVAILABLE === null;
if (!RUNNABLE) {
  process.stderr.write(
    `\n[skip] the pages on the bench camera: ${gate.approved ? (UNAVAILABLE ?? '') : gate.reason}.\n` +
      '  Run it on the bench with SEEK_E2E_WRITE=i-understand (never in CI).\n',
  );
}

/* ---------------------------------------------------------------------------------- */

/** Part 0 and part B's J-Link: the bench's J-Link (refuses unless the gate passed). */
let jlink: JlinkBench | null = null;
/** The bench camera's switch and bus (its power cycle). */
let camera: BenchCamera | null = null;
/** Set once the baseline is back and proven, so the last hook does not repeat the restore. */
let restored = false;
/** A window's wire as the page-side guard counts it (ops sent by the page to the camera). */
let identityWire: ReadonlySet<string> = new Set();

/** The halted flash read of one range, through the J-Link (not the page). */
async function haltedRead(address: number, length: number): Promise<Uint8Array> {
  if (jlink === null) throw new Error('the J-Link is not open');
  return jlink.readFlash(address, length);
}

/** The baseline file, checked against its own sha256 before it is used to restore. */
function baselineBytes(): Uint8Array {
  if (!existsSync(BASELINE_FILE)) {
    throw new Error(`the baseline 4 MiB file is missing: ${BASELINE_FILE} (SEEK_PAGES_BASELINE)`);
  }
  const bytes = new Uint8Array(readFileSync(BASELINE_FILE));
  if (sha256(bytes) !== BASELINE_SHA) throw new Error(`the baseline file is not ${BASELINE_SHA}`);
  return bytes;
}

/** A slot file of 64 KiB, written where the Decrypt tab picks it from. */
function writeSlotFile(name: string, bytes: Uint8Array): string {
  mkdirSync(SCRATCH, { recursive: true });
  const file = path.join(SCRATCH, name);
  writeFileSync(file, bytes);
  return file;
}

/** The image length the header states, for a bank read as stored (plain chain: the image is in the clear). */
function imageOf(bank: Uint8Array): Uint8Array {
  const view = new DataView(bank.buffer, bank.byteOffset, bank.byteLength);
  const length = view.getUint32(HEADER_LENGTH_OFFSET, true);
  return bank.subarray(0, length);
}

/** One bank of a whole-flash read. */
function bankOf(flash: Uint8Array, letter: BankLetter): Uint8Array {
  const offset = BANK_ADDRESS[letter] - FLASH_BASE;
  return flash.subarray(offset, offset + BANK_BYTES);
}

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  return Buffer.from(a).equals(Buffer.from(b));
}

/** Every byte run of `needle` appears in the flash (the zip's windows are the camera's own bytes). */
function appearsIn(flash: Buffer, needle: Uint8Array): boolean {
  return flash.includes(Buffer.from(needle));
}

/**
 * Writes the baseline back over the J-Link and proves it halted. The first halted read after a
 * flash fails on this bench (TESTING.md 42.2), so each attempt follows a channel-2 power cycle.
 */
async function restoreBaseline(j: JlinkBench, camera: BenchCamera): Promise<void> {
  await j.flashFull(BASELINE_FILE);
  await verifyHalted(j, camera);
}

/** The whole flash, read halted, must be the baseline; each attempt follows a channel-2 power cycle. */
async function verifyHalted(j: JlinkBench, camera: BenchCamera): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    await camera.powerCycle();
    await camera.waitForEnumeration(60_000);
    try {
      await j.verifyFull(BASELINE_SHA);
      return;
    } catch (error) {
      if (attempt >= 3) throw error;
      say(`halted read ${String(attempt)} after the restore failed; power-cycling again`);
    }
  }
}

/**
 * Waits while another program holds the camera (the preflight's own check). The page of a run
 * that is still going must not share the camera with this one; the wait is bounded.
 */
async function waitForCameraFree(maxMs: number): Promise<void> {
  const deadline = Date.now() + maxMs;
  for (;;) {
    const reason = cameraBusyReason();
    if (reason === null) return;
    if (Date.now() > deadline) throw new Error(`the bench camera stayed busy: ${reason}`);
    say(`waiting for the bench camera: ${reason}`);
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }
}

/* ---------------------------------------------------------------------------------- */

describe.skipIf(!RUNNABLE)('the web app pages on the bench camera (1.3.0.0, real WebUSB)', () => {
  beforeAll(async () => {
    mkdirSync(SCRATCH, { recursive: true });
    say(`scratch: ${SCRATCH}`);
    /* The restore's file is checked before anything is sent to the camera. */
    baselineBytes();
    jlink = createJlinkBench({ gate });
    camera = createBenchCamera({ gate });
    /* Part 0: the camera is the baseline before anything is sent to it. */
    await verifyHalted(jlink, camera);
    say('part 0: the halted whole-flash read is the baseline (40447c7e…eb72)');
  }, 10 * 60_000);

  afterAll(async () => {
    if (jlink === null || camera === null || restored) return;
    /* Restores the baseline whatever the run did, then proves it halted. */
    try {
      await restoreBaseline(jlink, camera);
      restored = true;
      say('restored: the halted whole-flash read is the baseline again');
    } catch (error) {
      say(`RESTORE FAILED: ${String(error)}`);
      throw error;
    }
  }, 20 * 60_000);

  describe('A. the read-only pages: Info, 0.x/1.x, 4.x/Nano, Decrypt File/Slot', () => {
    let session: CameraSession | null = null;

    const need = (): CameraSession => {
      if (session === null) throw new Error('Electron is not up (an earlier step failed)');
      return session;
    };

    beforeAll(async () => {
      session = await openCameraSession(path.join(SCRATCH, 'read-only'), HEADED);
    }, 5 * 60_000);

    afterAll(async () => {
      await closeCameraSession(session, path.join(SCRATCH, 'read-only'), KEEP);
      session = null;
    }, 60_000);

    it('Info: connects, reads firmware 1.3.0.0 and names the 0.x/1.x tab; identity reads only', async () => {
      const { app, wizard } = need();
      await wizard.route('#/');
      await wizard.connect();
      const before = countsOf(await guardOf(app.page));
      await wizard.click('section[aria-labelledby="info-read-heading"]', 'Read firmware version');
      await app.page.waitForFunction(
        () =>
          document.body.innerText.includes('What the camera reports') &&
          document.body.innerText.includes('1.3.0.0'),
        { timeout: 60_000, polling: 250 },
      );
      const text = await app.page.evaluate(() => document.body.innerText);
      expect(text, 'the Info result names the 0.x/1.x tab').toContain('0.x/1.x');
      const wire = wireSince(before, countsOf(await guardOf(app.page)));
      say(`info wire: ${describeWire(wire)}`);
      for (const op of NEVER_ON_THE_WIRE) expect(wire.has(op), op).toBe(false);
      expect((await guardOf(app.page)).refusals).toEqual([]);
      identityWire = new Set(wire.keys());
      expect(identityWire.size, 'Info sent something to read the version').toBeGreaterThan(0);
    });

    it(
      '0.x/1.x, first step (Read & build, read-only): the run zip holds the camera’s own flash bytes, and nothing that writes',
      async () => {
        const { app, wizard } = need();
        await wizard.openPreserve();
        const before = countsOf(await guardOf(app.page));
        await setGuard(app.page, { allowReset: true });
        let run;
        try {
          run = await step02(() =>
            wizard.runPhase('read-build', { confirm: false, timeoutMs: RUN_TIMEOUT_MS }),
          );
        } finally {
          await setGuard(app.page, { allowReset: false });
        }
        const wire = wireSince(before, countsOf(await guardOf(app.page)));
        say(
          `0.x/1.x step 02 wire: ${describeWire(wire)}; ${String(run.asks)} restart ask(s) answered`,
        );
        for (const op of NEVER_ON_THE_WIRE) expect(wire.has(op), op).toBe(false);

        const flash = await haltedRead(FLASH_BASE, FLASH_BYTES);
        expect(sha256(flash), 'the halted read is the baseline').toBe(BASELINE_SHA);
        const haystack = Buffer.from(flash);
        say(
          `0.x/1.x zip: ${run.entries.map((entry) => `${entry.name} (${String(entry.data.length)} B)`).join(', ')}`,
        );
        /* The camera's own reads, as the zip holds them: the whole backup (4 MiB, the halted flash
         * itself) and the booted bank's capture. The patched image is built in memory from the bank,
         * not read from the camera, so it is not checked against the flash. */
        const byName = (name: string): Uint8Array => {
          const found = run.entries.find((entry) => entry.name === `02-read-build/${name}`);
          if (found === undefined) throw new Error(`the zip has no 02-read-build/${name}`);
          return found.data;
        };
        const backup = byName('preserve_backup_windows.bin');
        expect(backup.length, 'the backup is the whole 4 MiB flash').toBe(FLASH_BYTES);
        /* Measured on the bench (TESTING.md 42.20): this backup is erased (0xFF) where the flash holds
         * bootloader code in the bootloader window's first 12 KiB (11,268 bytes differ, all below 0x2D00);
         * every other byte is the flash's own. The test pins that gap: nothing outside it may differ, and
         * inside it the backup is erased. */
        const differing: number[] = [];
        for (let at = 0; at < FLASH_BYTES; at++) if (backup[at] !== flash[at]) differing.push(at);
        const outside = differing.filter(
          (at) => at < BACKUP_GAP_BYTES.start || at >= BACKUP_GAP_BYTES.end,
        );
        const notErased = differing.filter((at) => backup[at] !== 0xff);
        say(
          `backup vs halted flash: ${String(differing.length)} byte(s) differ, all in ` +
            `0x${BACKUP_GAP_BYTES.start.toString(16)}..0x${(BACKUP_GAP_BYTES.end - 1).toString(16)}` +
            ` and erased in the backup: ${String(outside.length === 0 && notErased.length === 0)}`,
        );
        expect(outside, 'the backup differs from the flash outside the bootloader gap').toEqual([]);
        expect(notErased, 'inside the gap the backup is erased (0xFF)').toEqual([]);
        const capture = byName('preserve_bank_capture.bin');
        expect(capture.length, 'the bank capture is one 64 KiB bank').toBe(BANK_BYTES);
        expect(appearsIn(haystack, capture), 'the bank capture is a run of the flash').toBe(true);
        const plain = byName('preserve_image_plain.bin');
        expect(
          sameBytes(plain, imageOf(bankOf(flash, 'a'))),
          'the plain image is the booted bank’s own image',
        ).toBe(true);
        /* Step 02 saves the run file and no later step: no patch and no dump is in it. */
        const names = run.entries.map((entry) => entry.name);
        expect(
          names.some((name) => /full-dump|verified/.test(name)),
          names.join(', '),
        ).toBe(false);
        expect(readZip(run.runFile.bytes).length).toBeGreaterThan(0);
      },
      RUN_TIMEOUT_MS + 5 * 60_000,
    );

    it('4.x/Nano refuses this 1.3.0.0 camera before any dump read; what it sends is a subset of Info’s identity reads', async () => {
      const { app, wizard } = need();
      await wizard.route('#/v4');
      const before = countsOf(await guardOf(app.page));
      await wizard.click('section[aria-labelledby="dump-heading"]', 'Start dump');
      await app.page.waitForFunction(
        () => document.body.innerText.includes('reads only 4.x/Nano'),
        { timeout: 60_000, polling: 250 },
      );
      const text = await app.page.evaluate(() => document.body.innerText);
      expect(text, 'the refusal says nothing was read').toContain('Nothing was read');
      expect(text, 'the refusal names the 0.x/1.x tab').toContain(
        'Dump & decrypt 0.x/1.x 2014/2016',
      );
      const wire = wireSince(before, countsOf(await guardOf(app.page)));
      say(`4.x wire: ${describeWire(wire)}`);
      for (const op of wire.keys()) {
        expect(identityWire.has(op), `4.x sent ${op}, which Info did not send`).toBe(true);
      }
      expect(wire.has('out 0x59'), 'no window read').toBe(false);
    });

    it(
      'Decrypt File/Slot decrypts a slot file of the halted flash with no camera, and refuses a file of the wrong size',
      async () => {
        const { app, wizard } = need();
        await wizard.route('#/decrypt');
        const before = countsOf(await guardOf(app.page));
        const flash = await haltedRead(BANK_ADDRESS.a, BANK_BYTES);
        const slot = writeSlotFile('slot-A-halted.bin', flash);
        await app.page.waitForSelector('section[aria-labelledby="slotfile-heading"]', {
          timeout: 30_000,
        });
        const input = await app.page.$(
          'section[aria-labelledby="slotfile-heading"] input[type="file"]',
        );
        if (input === null) throw new Error('the slot file picker has no file input');
        await input.uploadFile(slot);
        await app.page.waitForFunction(
          () =>
            (
              document.querySelector<HTMLElement>('section[aria-labelledby="slotfile-heading"]')
                ?.innerText ?? ''
            ).includes('Image SHA-256'),
          { timeout: 120_000, polling: 300 },
        );
        const text = await app.page.evaluate(
          () =>
            document.querySelector<HTMLElement>('section[aria-labelledby="slotfile-heading"]')
              ?.innerText ?? '',
        );
        const expected = sha256(imageOf(flash));
        expect(text, 'the decrypted image hashes to the image in the bank').toContain(expected);
        expect(text, 'the file hash is the 64 KiB file').toContain(sha256(flash));
        const wire = wireSince(before, countsOf(await guardOf(app.page)));
        expect(wire.size, `the Decrypt tab sent to the camera: ${describeWire(wire)}`).toBe(0);

        /* The denial: a file that is not a 64 KiB slot is refused, with its reason, and nothing is decrypted. */
        const short = writeSlotFile('slot-short.bin', flash.subarray(0, 1000));
        const input2 = await app.page.$(
          'section[aria-labelledby="slotfile-heading"] input[type="file"]',
        );
        if (input2 === null) throw new Error('the slot file picker has no file input');
        await input2.uploadFile(short);
        await app.page.waitForFunction(
          () =>
            (
              document.querySelector<HTMLElement>('section[aria-labelledby="slotfile-heading"]')
                ?.innerText ?? ''
            ).includes('Not decrypted'),
          { timeout: 60_000, polling: 300 },
        );
        const refused = await app.page.evaluate(
          () =>
            document.querySelector<HTMLElement>('section[aria-labelledby="slotfile-heading"]')
              ?.innerText ?? '',
        );
        expect(refused, 'the refusal says why').toMatch(
          /65,?536|64 KiB|exactly|not a firmware slot/,
        );
      },
      10 * 60_000,
    );

    it('nothing was refused by the page guard, and no flash write ever left the page', async () => {
      const { app } = need();
      const guard = await guardOf(app.page);
      expect(guard.refusals, 'page-side refusals').toEqual([]);
      for (const op of ['out 0x50', 'out 0x51', 'out 0x55', 'out 0x5a']) {
        expect(guard.counts[op], op).toBeUndefined();
      }
      expect(app.timeline.filter((line: string) => line.includes('REFUSED'))).toEqual([]);
    });
  });

  describe('B. the slots page: dump, refuse, one allowed write to bank B, and the restore', () => {
    let rig: BenchRig | null = null;
    let page: BenchPage | null = null;

    beforeAll(async () => {
      /* Part A's window is closed; another program may still hold the camera, so wait (bounded). */
      await waitForCameraFree(40 * 60_000);
      rig = await createRealRig(gate, path.join(SCRATCH, 'slots-rig'));
    }, 45 * 60_000);

    afterAll(async () => {
      if (page !== null) await page.close().catch(() => undefined);
      page = null;
    }, 60_000);

    const need = (): BenchPage => {
      if (page === null) throw new Error('the slots page is not open (an earlier step failed)');
      return page;
    };

    it(
      'Read slots reads the three banks; Dump A, B and R are equal to the halted flash',
      async () => {
        if (rig === null) throw new Error('the bench rig did not open');
        page = await rig.openPage();
        const read = await need().readSlots();
        expect(read.runningBuild, 'the page reads the running build').toBe('1.3.0.0');
        expect(
          await need().banner(),
          'no write banner on a plan that allows the writes',
        ).toBeNull();
        for (const letter of ['a', 'b', 'r'] as const) {
          const dumped = await need().dump(letter);
          const flash = await haltedRead(BANK_ADDRESS[letter], BANK_BYTES);
          expect(
            Buffer.from(dumped.raw).equals(Buffer.from(flash)),
            `Dump ${letter} equals the halted flash`,
          ).toBe(true);
          say(
            `Dump ${letter}: ${dumped.status} (${String(dumped.raw.length)} B, sha ${sha256(dumped.raw).slice(0, 8)})`,
          );
        }
      },
      RUN_TIMEOUT_MS,
    );

    it(
      'a refused image is DENIED with the page’s refusal, and nothing is sent to the camera',
      async () => {
        const refusal = await need().refuse('a', {
          name: 'not-a-slot.bin',
          bytes: new Uint8Array(1000),
        });
        if (refusal === 'taken') throw new Error('the picker took the file, so it was not refused');
        expect(refusal.status, 'the picker rejects the file').toMatch(/^Rejected/);
        expect(refusal.reason, 'the refusal says why').not.toBeNull();
        expect(await need().refusals(), 'nothing went to the camera past the guard').toEqual([]);
      },
      RUN_TIMEOUT_MS,
    );

    it(
      'one allowed write: the decrypted image into bank B (not booted, so no acknowledgement), no write banner, and the J-Link reads it back',
      async () => {
        const dumped = await need().dump('a');
        const image = dumped.decrypted ?? imageOf(dumped.raw);
        const name = dumped.decryptedName ?? 'seek-slot-A-1.3.0.0-decrypted.bin';
        expect(await need().banner(), 'no write banner before the write').toBeNull();
        const written = await need().write('b', { name, bytes: image }, false);
        expect(written.status.startsWith('Written. '), `the write ended "${written.status}"`).toBe(
          true,
        );
        expect(written.ackShown, 'bank B is not booted: no extra tick').toBe(false);
        expect(await need().banner(), 'no write banner after an allowed write').toBeNull();
        /* A write clears the page's bank table until the banks are read again. */
        await need().readSlots();
        const after = await need().dump('b');
        const flash = await haltedRead(BANK_ADDRESS.b, BANK_BYTES);
        expect(
          Buffer.from(after.raw).equals(Buffer.from(flash)),
          'the J-Link reads bank B as the page did',
        ).toBe(true);
        const stagedAt = Buffer.from(flash).indexOf(Buffer.from(image.subarray(0, 4096)));
        expect(stagedAt, 'the image is in bank B at the start').toBe(0);
      },
      RUN_TIMEOUT_MS,
    );

    it(
      'closes the page and restores the baseline by the J-Link, then power-cycles the camera',
      async () => {
        await need().close();
        page = null;
        if (jlink === null || camera === null) throw new Error('the bench is not open');
        await restoreBaseline(jlink, camera);
        restored = true;
        const back = await camera.waitForEnumeration(60_000);
        say(`power cycle: camera back on the bus after ${String(back)} ms`);
        expect(back, 'the camera comes back after the power cycle').not.toBeNull();
      },
      RUN_TIMEOUT_MS,
    );
  });
});
