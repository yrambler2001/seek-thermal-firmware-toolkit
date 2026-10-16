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
import type {
  BankLetter,
  BankView,
  BenchPage,
  BenchRig,
  PageDump,
  PageImage,
  PageRead,
  PageWrite,
} from './spec-rig.js';
import {
  BENCH_FLASH_BASE,
  BENCH_FLASH_BYTES,
  type BenchCamera,
  type BenchSubject,
  type JlinkBench,
  type PatchedBuildString,
  type RunningInfo,
} from './types.js';

/** One bank, the unit the page dumps and writes. */
const BANK_BYTES = 0x10000;
/** The 1.3.0.0 layout the fake page shows. */
const LAYOUT: Readonly<Record<BankLetter, number>> = {
  a: 0x14050000,
  b: 0x14060000,
  r: 0x14070000,
};
/** The build string's marker in bank B, 0x100 into the bank. */
const MARKER = 'BUILD:';
const MARKER_AT = LAYOUT.b - BENCH_FLASH_BASE + 0x100;
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
  out.set(marker, MARKER_AT);
  return out;
}

/** Two fake subjects, written into `dir` as 4 MiB files the flow reads like the real ones. */
export function fakeSubjects(dir: string): BenchSubject[] {
  mkdirSync(dir, { recursive: true });
  return FAKE_VERSIONS.map((version, index) => {
    const file = path.join(dir, `fake-${String(index + 1)}.bin`);
    const bytes = fakeFlash(index + 1);
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

/** The build string in bank B's marker, or null when there is none. */
function buildAt(flash: Uint8Array): string | null {
  const at = findBytes(flash, MARKER_BYTES, MARKER_AT, MARKER_AT + 0x40);
  if (at < 0) return null;
  return new TextDecoder().decode(flash.subarray(at, at + MARKER_BYTES.length + 6));
}

function isBlank(bytes: Uint8Array): boolean {
  return bytes.every((byte) => byte === 0xff);
}

/** The fake rig over one subject list. Each call builds a fresh, empty bench. */
export function createFakeRig(options: {
  readonly subjects: readonly BenchSubject[];
  readonly failure: FakeFailure | null;
}): BenchRig {
  let flash = new Uint8Array(BENCH_FLASH_BYTES).fill(0xff);
  let current = -1;
  let running: string | null = null;
  let haltArmed = false;
  let enumerateFailed = false;
  /** The bank the page last wrote, for the read-back fault. */
  let lastWritten: BankLetter | null = null;

  const subject = (): BenchSubject | null => options.subjects[current] ?? null;
  const failsAt = (step: FakeFailure['step']): boolean =>
    options.failure !== null &&
    options.failure.subject === current &&
    options.failure.step === step;

  const jlink: JlinkBench = {
    async flashFull(file: string): Promise<void> {
      const index = options.subjects.findIndex((candidate) => candidate.file === file);
      if (index < 0) throw new Error('fake: the file is not one of the fake subjects');
      flash = new Uint8Array(readFileSync(file));
      current = index;
      haltArmed = failsAt('halt');
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
      running = failsAt('boot') ? `${MARKER}BROKE!` : buildAt(flash);
    },
  };

  const camera: BenchCamera = {
    present: () => current >= 0,
    async waitForEnumeration(): Promise<number | null> {
      if (current < 0) return null;
      if (failsAt('enumerate') && !enumerateFailed) {
        enumerateFailed = true;
        return null;
      }
      return 1500;
    },
    async powerCycle(): Promise<void> {
      /* The fake camera holds nothing across a power cycle but its flash. */
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

  const patch = (image: Uint8Array, _buildString: string): PatchedBuildString | null => {
    const from = 'AAAAAA';
    const to = 'BBBBBB';
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

  const openPage = (): Promise<BenchPage> => {
    const page: BenchPage = {
      async readSlots(): Promise<PageRead> {
        const version = subject()?.version ?? null;
        const banks: BankView[] = (['a', 'b', 'r'] as const).map((letter) => ({
          letter,
          name: bankName[letter],
          address: LAYOUT[letter],
          version: isBlank(bankBytes(letter)) ? null : version,
          booted: letter === 'b',
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
        const plain = isBlank(raw) ? null : raw.slice();
        return {
          raw,
          rawName: `seek-slot-${upper}-v${subject()?.version ?? '?'}-raw-${stamp}.bin`,
          decrypted: plain,
          decryptedName:
            plain === null
              ? null
              : `seek-slot-${upper}-v${subject()?.version ?? '?'}-decrypted-${stamp}.bin`,
        };
      },
      async write(letter: BankLetter, image: PageImage, acknowledge: boolean): Promise<PageWrite> {
        const ackShown = letter === 'b' || letter === 'r';
        if (ackShown !== acknowledge)
          throw new Error(`fake: the acknowledgement for ${letter} differs`);
        if (failsAt('write')) throw new Error('Failed — the camera refused the commit');
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
    openPage,
  };
}
