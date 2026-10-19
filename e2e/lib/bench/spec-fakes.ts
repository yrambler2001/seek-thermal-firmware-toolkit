/**
 * The fake rig: an in-memory stand-in for the J-Link, the bench camera, the
 * build-string patcher, and the slots page, used ONLY when SEEK_BENCH_FAKE=1.
 * It exists so the bench flow's control (its order, its checks, its stop rules,
 * its failure records) can be rehearsed with no hardware, no Electron, and no
 * Chrome. Nothing here reaches a camera, a J-Link, or a browser.
 *
 * The fake bench is a 4 MiB flash in memory. A flash writes the file's bytes into
 * it; a read returns slices of it; a reset "boots" the build string found in bank
 * B; the page's banks are the 1.3.0.0 layout (A 0x14050000, B 0x14060000, R
 * 0x14070000), a bank is blank until written, B is the booted bank, and a page
 * write stores the image it was given (so the decrypted read-back equals it).
 *
 * `failure` makes one subject fail at one step, for rehearsing the failure paths:
 *   halt    the first full verify cannot halt (the power-cycle retry must clear it)
 *   verify  the full verify reads back a different flash
 *   enumerate  the camera does not come back after the reset
 *   write   the page's first write is refused by the camera
 *   verdict the page takes the write but cannot say it reads back as written
 *   readback the page's read-back after a write shows a byte the J-Link does not
 *   boot    the camera runs a build string that is not the patched one
 */

/* eslint-disable @typescript-eslint/require-await -- the fake APIs mirror async calls and await nothing */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { sha256 } from '../checks.js';
import type { SlotsSubject } from '../slots-expectations.js';
import { LENGTH_OFFSET } from '../../../packages/core/src/image/header.js';
import { viewOf } from '../../../packages/core/src/bytes.js';
import { KEY_PAIRS } from '../../../packages/core/src/preservation/patch.js';
import { ffImageLength, isFF1308Subject, predictedFFStored, FF_VERSION } from './ff-form.js';
import { ffBankVerdict, plainBankVerdict } from '../../../packages/core/src/slots/running.js';
import type {
  BankLetter,
  BankView,
  BenchPage,
  BenchRig,
  PageDump,
  PageImage,
  PageRead,
  PageRefusal,
  PageWrite,
} from './spec-rig.js';
import {
  BENCH_FLASH_BASE,
  BENCH_FLASH_BYTES,
  CHAIN_2014_BANKS,
  type BenchCamera,
  type BenchSubject,
  type BootSlot,
  type JlinkBench,
  type PatchedBuildString,
  type RunningInfo,
  type SlotFlashRun,
} from './types.js';

/** One bank, the unit the page dumps and writes. */
const BANK_BYTES = 0x10000;
/** The 1.3.0.0 layout the fake page shows. */
const LAYOUT: Readonly<Record<BankLetter, number>> = {
  a: 0x14050000,
  b: 0x14060000,
  r: 0x14070000,
};
/** The build string's marker, 0x100 into each bank. */
const MARKER = 'BUILD:';
/** The fake's two subjects: the versions they report. */
const FAKE_VERSIONS = ['1.3.0.0', '1.1.0.0'] as const;

export interface FakeFailure {
  readonly subject: number;
  readonly step: 'halt' | 'verify' | 'enumerate' | 'write' | 'verdict' | 'readback' | 'boot';
}

/** A deterministic pseudo-random byte stream, so each fake dump has a stable sha. */
function fakeFlash(seed: number): Uint8Array {
  const out = new Uint8Array(BENCH_FLASH_BYTES);
  let state = seed * 2654435761;
  for (let i = 0; i < out.length; i++) {
    state = (state * 1103515245 + 12345) >>> 0;
    out[i] = state >>> 24;
  }
  const marker = new TextEncoder().encode(`${MARKER}AAAAAA`);
  /* Every bank carries the build string at 0x100 into it, as a real image's banks do. */
  for (const letter of ['a', 'b', 'r'] as const) {
    out.set(marker, LAYOUT[letter] - BENCH_FLASH_BASE + 0x100);
  }
  return out;
}

/**
 * Two fake subjects, written into `dir` as 4 MiB files the flow reads like the real ones.
 * `blankB` makes the second one's bank B blank (0xFF), as the 2014 dumps' B is.
 */
export function fakeSubjects(
  dir: string,
  options: { readonly blankB?: boolean } = {},
): BenchSubject[] {
  mkdirSync(dir, { recursive: true });
  return FAKE_VERSIONS.map((version, index) => {
    const file = path.join(dir, `fake-${String(index + 1)}.bin`);
    const bytes = fakeFlash(index + 1);
    if (options.blankB === true && index === 1) {
      const offset = LAYOUT.b - BENCH_FLASH_BASE;
      bytes.fill(0xff, offset, offset + BANK_BYTES);
    }
    writeFileSync(file, bytes);
    return {
      camera: 'Compact',
      family: 'Compact',
      folder: `fake-${version}`,
      version,
      variant: 'fake',
      file,
      fileKind: 'primary',
      sha256: sha256(bytes),
      launches: true,
      slotsSupported: true,
    };
  });
}

/** The FF image's length in the fake: a whole number of words in one bank, like the real 16 Hz image. */
const FF_IMAGE_BYTES = 0xc000;
/** Where the fake FF image keeps each half of its key pair (once each), clear of the header and the marker. */
const FF_KEY_AT = [0x4000, 0x5000] as const;

/**
 * The 1.3.0.8 FF subject: a fake image that carries the FF key pair (each half once), its
 * build marker at 0x100, and its length in the header, in bank R only. A and B are blank,
 * so the fake camera boots R, as the real FF build does (it boots only from recovery).
 */
export function fakeFfSubjects(dir: string): BenchSubject[] {
  mkdirSync(dir, { recursive: true });
  const image = new Uint8Array(FF_IMAGE_BYTES);
  let state = 0x1308;
  for (let i = 0; i < image.length; i++) {
    state = (state * 1103515245 + 12345) >>> 0;
    image[i] = state >>> 24;
  }
  viewOf(image).setUint32(LENGTH_OFFSET, FF_IMAGE_BYTES, true);
  image.set(new TextEncoder().encode(`${MARKER}AAAAAA`), 0x100);
  image.set(Buffer.from(KEY_PAIRS.ff1308.block0, 'hex'), FF_KEY_AT[0]);
  image.set(Buffer.from(KEY_PAIRS.ff1308.block1, 'hex'), FF_KEY_AT[1]);
  const flash = new Uint8Array(BENCH_FLASH_BYTES).fill(0xff);
  flash.set(image, LAYOUT.r - BENCH_FLASH_BASE);
  /* The flashed dump boots slot A (cfg[0] = 0), as the launchable copy the bench flashes does. */
  viewOf(flash).setUint32(BOOT_CONFIG_OFFSET, 0, true);
  const file = path.join(dir, 'fake-ff.bin');
  writeFileSync(file, flash);
  return [
    {
      camera: 'Compact',
      family: 'Compact',
      folder: `fake-${FF_VERSION}-FF`,
      version: FF_VERSION,
      variant: 'ff',
      file,
      fileKind: 'launchable',
      sha256: sha256(flash),
      launches: true,
      slotsSupported: true,
    },
  ];
}

function findBytes(
  haystack: Uint8Array,
  needle: Uint8Array,
  from = 0,
  to = haystack.length,
): number {
  for (let i = from; i + needle.length <= to; i++) {
    let same = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        same = false;
        break;
      }
    }
    if (same) return i;
  }
  return -1;
}

const MARKER_BYTES = new TextEncoder().encode(MARKER);

/**
 * The build string the fake camera runs: the marker in the first non-blank bank of
 * B, A, R (the fake's boot order), or null when all three are blank.
 */
/** The boot-config block's offset in the fake flash (0x14010000). */
const BOOT_CONFIG_OFFSET = 0x14010000 - BENCH_FLASH_BASE;

/**
 * The build string the fake camera runs. cfg[0] (the first word of the boot-config block) names
 * the bank the bootloader runs: 0 A, 1 B, 2 R; any other word boots the first non-blank of B, A, R.
 */
function bootedBuild(flash: Uint8Array): string | null {
  const word = viewOf(flash.subarray(BOOT_CONFIG_OFFSET, BOOT_CONFIG_OFFSET + 4)).getUint32(
    0,
    true,
  );
  const order =
    word === 0
      ? (['a'] as const)
      : word === 1
        ? (['b'] as const)
        : word === 2
          ? (['r'] as const)
          : (['b', 'a', 'r'] as const);
  for (const letter of order) {
    const offset = LAYOUT[letter] - BENCH_FLASH_BASE;
    const bank = flash.subarray(offset, offset + BANK_BYTES);
    if (isBlank(bank)) continue;
    const at = findBytes(bank, MARKER_BYTES, 0x100, 0x140);
    if (at < 0) return null;
    return new TextDecoder().decode(bank.subarray(at, at + MARKER_BYTES.length + 6));
  }
  return null;
}

function isBlank(bytes: Uint8Array): boolean {
  return bytes.every((byte) => byte === 0xff);
}

/**
 * A fault the FF path's checks must catch (unit tests only): `stored` makes R keep the image
 * as sent instead of the predicted stored form; `accepted` lets the page take the FF image
 * into A or B at the picker, where it must be refused.
 */
export type FakeFfFault = 'stored' | 'accepted';

/** The banner heading the real page shows (slots-page.ts WRITE_BANNER_HEADING). */
const BANNER_HEADING = 'No bank of this camera can be written from here.';

/** A verdict row that writes every bank: the default for a fake subject. */
export function writableRowFor(subject: BenchSubject): SlotsSubject {
  const writable = { writable: true } as const;
  return {
    name: subject.folder,
    group: 'fake',
    version: subject.version,
    emulator: null,
    banks: { a: writable, b: writable, r: writable },
    fps: { offer: false, reason: '' },
    banner: 'none',
    source: 'fake (bench-lib)',
  };
}

/** Whether two images are the same bytes. */
function sameBytes(left: Uint8Array, right: Uint8Array): boolean {
  return left.length === right.length && left.every((byte, at) => byte === right[at]);
}

/**
 * The fake rig over one subject list. Each call builds a fresh, empty bench. `verdicts` gives each
 * subject (by index) the table row the page is held to: a bank the row refuses is refused at the
 * picker with the row's reason, its own image included, and the row's `ownImage` bank refuses its
 * own image alone. Without `verdicts`, every subject's row writes every bank.
 */
export function createFakeRig(options: {
  readonly subjects: readonly BenchSubject[];
  readonly failure: FakeFailure | null;
  readonly ffFault?: FakeFfFault | null;
  readonly verdicts?: readonly SlotsSubject[];
}): BenchRig {
  const ffFault = options.ffFault ?? null;
  const rows: readonly SlotsSubject[] =
    options.verdicts ?? options.subjects.map((candidate) => writableRowFor(candidate));
  let flash = new Uint8Array(BENCH_FLASH_BYTES).fill(0xff);
  let current = -1;
  let running: string | null = null;
  let haltArmed = false;
  let enumerateFailed = false;
  /** The bank the page last wrote, for the read-back fault. */
  let lastWritten: BankLetter | null = null;

  const subject = (): BenchSubject | null => options.subjects[current] ?? null;
  /** The verdict row of the subject the fake camera is running, or null before any flash. */
  const rowNow = (): SlotsSubject | null => (current < 0 ? null : (rows[current] ?? null));
  /**
   * The bank the fake camera boots: R for the FF build; otherwise the first non-blank of B, A, R
   * (the order bootedBuild uses). A blank B therefore has A booted, as on the 2014 chain.
   */
  const bootedNow = (): BankLetter | null => {
    if (ff()) return 'r';
    for (const letter of ['b', 'a', 'r'] as const) {
      if (!isBlank(bankBytes(letter))) return letter;
    }
    return null;
  };
  /** Whether the running subject is the 1.3.0.8 FF build (it boots R, and takes the FF image only in R). */
  const ff = (): boolean => {
    const running = subject();
    return running !== null && isFF1308Subject(running);
  };
  const failsAt = (step: FakeFailure['step']): boolean =>
    options.failure !== null &&
    options.failure.subject === current &&
    options.failure.step === step;

  const jlink: JlinkBench = {
    async flashFull(file: string): Promise<void> {
      const index = options.subjects.findIndex((candidate) => candidate.file === file);
      /* A subject's file starts that subject; any other 4 MiB file is a restore of the bench's state. */
      if (index >= 0) {
        current = index;
        haltArmed = failsAt('halt');
      }
      flash = new Uint8Array(readFileSync(file));
    },
    async eraseRange(address: number, length: number): Promise<void> {
      const offset = address - BENCH_FLASH_BASE;
      if (length !== BANK_BYTES || offset < 0 || offset + length > flash.length) {
        throw new Error('fake: eraseRange outside one bank');
      }
      flash.fill(0xff, offset, offset + length);
    },
    async writeBank(address: number, file: string): Promise<void> {
      const bytes = new Uint8Array(readFileSync(file));
      if (!CHAIN_2014_BANKS.includes(address) || bytes.length !== BANK_BYTES) {
        throw new Error(
          `fake: writeBank of 0x${address.toString(16)} (${String(bytes.length)} B) refused`,
        );
      }
      flash.set(bytes, address - BENCH_FLASH_BASE);
    },
    async readFlash(address: number, length: number): Promise<Uint8Array> {
      const offset = address - BENCH_FLASH_BASE;
      if (offset < 0 || offset + length > flash.length)
        throw new Error('fake: read outside the flash');
      return flash.slice(offset, offset + length);
    },
    async verifyFull(sha: string): Promise<void> {
      if (haltArmed) {
        haltArmed = false;
        throw new Error('the CPU could not be halted for the read-back');
      }
      /* The injected mismatch reads back a different flash, as a bad write would. */
      const got = failsAt('verify') ? '0'.repeat(64) : sha256(flash);
      if (got !== sha) throw new Error(`the flash reads back as ${got}, not the dump ${sha}`);
    },
    async resetCpu(): Promise<void> {
      running = failsAt('boot') ? `${MARKER}BROKE!` : bootedBuild(flash);
    },
    async setBootSlot(slot: BootSlot, template: string): Promise<void> {
      const asNumber: number = slot;
      if (asNumber !== 0 && asNumber !== 1 && asNumber !== 2) {
        throw new Error(`fake: cfg[0] ${String(asNumber)}`);
      }
      /* The block the template implies (its own, with cfg[0] changed), written as set-boot writes it. */
      const block = new Uint8Array(
        readFileSync(template).subarray(BOOT_CONFIG_OFFSET, BOOT_CONFIG_OFFSET + 0x10000),
      );
      viewOf(block).setUint32(0, slot, true);
      flash.set(block, BOOT_CONFIG_OFFSET);
    },
  };

  /* The fake camera is on the bus whenever it has a subject; its enumerate failure is injected once. */
  const enumerate = (): number | null => {
    if (current < 0) return null;
    if (failsAt('enumerate') && !enumerateFailed) {
      enumerateFailed = true;
      return null;
    }
    return 1500;
  };
  const camera: BenchCamera = {
    present: () => current >= 0,
    waitForEnumeration: () => Promise.resolve(enumerate()),
    waitForReboot: () => Promise.resolve(enumerate()),
    async powerCycle(): Promise<void> {
      /* The fake camera holds nothing across a power cycle but its flash. */
    },
    async infoJson(): Promise<Record<string, unknown> | null> {
      if (running === null) return null;
      /* The camera's own answers, computed from the fake's flash with the same checks the apps run. */
      const answers = (['a', 'b', 'r'] as const).map((letter) => {
        const offset = LAYOUT[letter] - BENCH_FLASH_BASE;
        return ffBankVerdict(flash.subarray(offset, offset + BANK_BYTES));
      });
      const plain = (['a', 'b', 'r'] as const).map((letter) => {
        const offset = LAYOUT[letter] - BENCH_FLASH_BASE;
        return plainBankVerdict(flash.subarray(offset, offset + BANK_BYTES));
      });
      return {
        firmware: { version: subject()?.version ?? null, build: running },
        running: {
          camera: { a: answers[0] ?? null, b: answers[1] ?? null, r: answers[2] ?? null },
          predicted: { plain, ff: answers },
        },
      };
    },

    async slotFlash(bank, file, options): Promise<SlotFlashRun> {
      /* The fake's write is the CLI's: the FF image lands as the predicted stored form, anything else
       * is refused before a byte is sent. The bank is named by the page's own letter. */
      const image = new Uint8Array(readFileSync(file));
      const isFf =
        ffImageLength(image) !== null &&
        image.length <= BANK_BYTES &&
        predictedFFStored(image).length === BANK_BYTES;
      if (!isFf || !options.running16Hz) {
        return { code: 1, result: { written: false }, stdout: '', stderr: 'refused (fake)' };
      }
      const offset = LAYOUT[bank] - BENCH_FLASH_BASE;
      flash.set(predictedFFStored(image), offset);
      return {
        code: 0,
        result: { action: 'flash', bank, written: true, verified: true, commitStatus: 0 },
        stdout: '',
        stderr: '',
      };
    },

    async runningInfo(): Promise<RunningInfo | null> {
      if (running === null) return null;
      return {
        product: 'Fake Compact',
        serial: null,
        firmwareVersion: subject()?.version ?? null,
        buildString: running,
        bootloaderVersion: null,
      };
    },
  };

  const patch = (
    image: Uint8Array,
    _buildString: string,
    mark?: string,
  ): PatchedBuildString | null => {
    const from = 'AAAAAA';
    /* The per-bank mark: Z, the bank's letter, then Z's, so each bank's string is its own. */
    const to = mark === undefined ? 'BBBBBB' : `Z${mark}ZZZZ`;
    const at = findBytes(image, new TextEncoder().encode(`${MARKER}${from}`));
    if (at < 0) return null;
    const patched = new Uint8Array(image);
    const offsets: number[] = [];
    for (let i = 0; i < to.length; i++) {
      patched[at + MARKER_BYTES.length + i] = to.charCodeAt(i);
      offsets.push(at + MARKER_BYTES.length + i);
    }
    return { patched, from, to, offsets };
  };

  const bankBytes = (letter: BankLetter): Uint8Array => {
    const offset = LAYOUT[letter] - BENCH_FLASH_BASE;
    return flash.slice(offset, offset + BANK_BYTES);
  };

  const bankName: Readonly<Record<BankLetter, string>> = {
    a: 'Bank A',
    b: 'Bank B',
    r: 'Recovery bank R',
  };

  /** The reason the row refuses this image at this bank's picker, or null when it takes it. */
  const refusalReasonFor = (letter: BankLetter, image: PageImage): string | null => {
    const row = rowNow();
    if (row === null) return null;
    const verdict = row.banks[letter];
    if (!verdict.writable) return verdict.reason === '' ? 'refused (fake)' : verdict.reason;
    if (row.ownImage?.bank === letter && sameBytes(image.bytes, bankBytes(letter))) {
      return row.ownImage.reason === '' ? 'refused (fake)' : row.ownImage.reason;
    }
    return null;
  };

  const openPage = (): Promise<BenchPage> => {
    const page: BenchPage = {
      /* The banner the row names (its heading and reason, as the real page shows them), or none. */
      banner: () => {
        const row = rowNow();
        return Promise.resolve(
          row === null || row.banner === 'none' ? null : `${BANNER_HEADING} ${row.banner}`,
        );
      },
      async readSlots(): Promise<PageRead> {
        const version = subject()?.version ?? null;
        /* The FF build boots from recovery; every other fake boots B. */
        const booted = bootedNow();
        const banks: BankView[] = (['a', 'b', 'r'] as const).map((letter) => ({
          letter,
          name: bankName[letter],
          address: LAYOUT[letter],
          version: isBlank(bankBytes(letter)) ? null : version,
          booted: letter === booted,
          firmware: isBlank(bankBytes(letter)) ? 'empty' : (version ?? 'no version'),
        }));
        return { status: 'Read. 3/3 banks read.', banks, runningBuild: version };
      },
      async dump(letter: BankLetter): Promise<PageDump> {
        const raw = bankBytes(letter);
        /* The injected read-back fault: the first dump after a write of this bank shows one flipped byte. */
        if (failsAt('readback') && lastWritten === letter && raw.length > 0) {
          lastWritten = null;
          raw[0] = (raw[0] ?? 0) ^ 0xff;
        }
        const upper = letter.toUpperCase();
        const stamp = sha256(raw).slice(0, 8);
        let plain = isBlank(raw) ? null : raw.slice();
        /* A FF image is its header's length; the rest of the bank is erased. */
        if (plain !== null && ff()) {
          const length = ffImageLength(raw);
          plain = length === null ? null : raw.slice(0, length);
        }
        return {
          status:
            plain === null
              ? `Dumped slot ${upper}: empty, nothing to decrypt.`
              : `Dumped slot ${upper}.`,
          raw,
          /* An empty bank has no version to name it by: the page says what it is (TESTING 42.8). */
          rawName:
            plain === null
              ? `seek-slot-${upper}-empty-raw-${stamp}.bin`
              : `seek-slot-${upper}-v${subject()?.version ?? '?'}-raw-${stamp}.bin`,
          decrypted: plain,
          decryptedName:
            plain === null
              ? null
              : `seek-slot-${upper}-v${subject()?.version ?? '?'}-decrypted-${stamp}.bin`,
        };
      },
      async refuse(letter: BankLetter, image: PageImage): Promise<PageRefusal | 'taken'> {
        if (!ff()) {
          const reason = refusalReasonFor(letter, image);
          return reason === null ? 'taken' : { status: 'Rejected — see the log above.', reason };
        }
        if (letter === 'r') throw new Error('fake: the page takes the FF image for R');
        if (ffFault === 'accepted') {
          throw new Error(`fake: the picker took the FF image for ${letter}, it was not refused`);
        }
        return {
          status: 'Rejected — see the log above.',
          reason:
            `this is the 1.3.0.8 FF (16 Hz) image (${image.name}); it can be written to R only, ` +
            `not to bank ${letter.toUpperCase()}. Nothing was written.`,
        };
      },
      async write(letter: BankLetter, image: PageImage, acknowledge: boolean): Promise<PageWrite> {
        /* A refused image never reaches the write: the picker answers "Rejected", as the real page does. */
        if (!ff() && refusalReasonFor(letter, image) !== null) {
          throw new Error('the picker answered "Rejected — see the log above."');
        }
        /* The page asks the tick on R, and on the bank the camera boots. */
        const ackShown = letter === 'r' || letter === bootedNow();
        if (ackShown !== acknowledge)
          throw new Error(`fake: the acknowledgement for ${letter} differs`);
        if (failsAt('write')) throw new Error('Failed — the camera refused the commit');
        if (ff()) {
          /* Only R takes the FF image; the camera keeps the predicted stored form (or, under the
           * fault, the image as sent, which the flow's check must refuse). */
          if (letter !== 'r') throw new Error(`fake: the FF image is not written to ${letter}`);
          if (image.bytes.length > BANK_BYTES)
            throw new Error('fake: the image is longer than a bank');
          const stored =
            ffFault === 'stored'
              ? new Uint8Array(BANK_BYTES).fill(0xff)
              : predictedFFStored(image.bytes);
          if (ffFault === 'stored') stored.set(image.bytes, 0);
          flash.set(stored, LAYOUT.r - BENCH_FLASH_BASE);
          lastWritten = letter;
          return {
            status: 'Written. Slot R is written.',
            ackShown,
            outcome: `Slot R — ${image.name}: the bank reads back as written.\nNOW UNPLUG AND REPLUG THE CAMERA.`,
          };
        }
        if (image.bytes.length !== BANK_BYTES)
          throw new Error('fake: the image is not one bank long');
        const offset = LAYOUT[letter] - BENCH_FLASH_BASE;
        flash.set(image.bytes, offset);
        lastWritten = letter;
        const upper = letter.toUpperCase();
        /* The injected verdict: the page takes the read-back but cannot compare it. */
        const verdict = failsAt('verdict')
          ? 'the read-back was taken but not compared, so this write is not verified here.'
          : 'the bank reads back as written.';
        return {
          status: `Written. Slot ${upper} is written.`,
          ackShown,
          outcome: `Slot ${upper} — ${image.name}: ${verdict}\nNOW UNPLUG AND REPLUG THE CAMERA.`,
        };
      },
      async fill(letter: BankLetter, acknowledge: boolean): Promise<PageWrite> {
        if (ff()) throw new Error('fake: the FF build is not filled from another bank');
        const ackShown = letter === 'r' || letter === bootedNow();
        if (ackShown !== acknowledge)
          throw new Error(`fake: the acknowledgement for ${letter} differs`);
        /* The page's own image: the first other bank that holds one, as the page's source does. */
        const source = (['b', 'a', 'r'] as const).find(
          (candidate) => candidate !== letter && !isBlank(bankBytes(candidate)),
        );
        if (source === undefined) throw new Error('fake: no other bank holds an image to copy');
        flash.set(bankBytes(source), LAYOUT[letter] - BENCH_FLASH_BASE);
        lastWritten = letter;
        const upper = letter.toUpperCase();
        return {
          status: `Written. Slot ${upper} is written.`,
          ackShown,
          outcome: `Slot ${upper} — the image of bank ${source.toUpperCase()}: the bank reads back as written.\nNOW UNPLUG AND REPLUG THE CAMERA.`,
        };
      },
      async refusals(): Promise<string[]> {
        return [];
      },
      async close(): Promise<void> {
        /* nothing is open */
      },
    };
    return Promise.resolve(page);
  };

  return {
    kind: 'fake',
    jlink,
    camera,
    patch,
    verdictRow: (candidate: BenchSubject) => {
      const index = options.subjects.findIndex((other) => other.file === candidate.file);
      return index < 0 ? null : (rows[index] ?? null);
    },
    openPage,
  };
}
