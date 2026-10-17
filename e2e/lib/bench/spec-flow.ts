/**
 * One subject's bench flow, against whatever rig it is given (the real one or
 * the fake one in `spec-fakes.ts`). For a 4 MiB dump:
 *
 *   1. flash the whole part with the J-Link, read it back halted and require
 *      its sha256, reset the CPU, and wait for the camera on USB;
 *   2. open the slots page, read the three banks, and check each bank's
 *      address against the plan, its version against the subject, and its
 *      Dump against the J-Link read of the same 64 KiB and the dump file;
 *   3. write the bank's own decrypted image into B, then A, then R, through the
 *      page, each with the page's own verdict checked, the replug the page asks
 *      for, a read-back through the page, and a J-Link read of the bank and of
 *      every other block (the boot config and the bootloader included);
 *   4. patch the booted image's build string, write the patched image into all
 *      three banks the same way, reset the CPU, and require the camera to run
 *      the patched build string, with the three banks as the page read them.
 *
 * A failure is recorded on the subject, and the steps that depend on it are not
 * run: after a failed flash, enumeration, or page read, nothing else runs; after a
 * write that was sent and did not check out, the remaining writes and the boot
 * proof do not run, since the camera is then in an unknown state. A bank with no
 * decrypted image of its own cannot be written, so it is recorded and the other
 * banks are still written. The next subject's full flash puts the camera back.
 */

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { APPLICATION_KEY_PAIRS, buildSlotPlan, listProfiles } from '@seek-fw/core';

import { sha256 } from '../checks.js';
import {
  BENCH_FLASH_BASE,
  BENCH_FLASH_BYTES,
  type BenchSubject,
  type BootSlot,
  type RunningInfo,
} from './types.js';
import {
  carriesFFKeyPair,
  describeDifference,
  FF_PLATFORM_BOOTLOADER,
  isFF1308Subject,
  predictedFFStored,
} from './ff-form.js';
import type {
  BankLetter,
  BankView,
  BenchPage,
  BenchRig,
  PageDump,
  PageImage,
  PageRead,
  PageRefusal,
} from './spec-rig.js';

/** One 64 KiB bank read, the unit the page's Dump saves. */
export const BANK_BYTES = 0x10000;
/** The boot-config block (64 KiB) and the bootloader block (64 KiB), both checked unchanged. */
export const BOOT_CONFIG_ADDRESS = 0x14010000;
export const BOOTLOADER_ADDRESS = 0x14000000;
/** cfg[0], the boot preference: which bank the bootloader runs (FW-V1 set-boot: 0 A, 1 B, 2 recovery). */
export const RECOVERY_SLOT: BootSlot = 2;
const SLOT_NAME: Readonly<Record<BootSlot, string>> = {
  0: 'slot A',
  1: 'slot B',
  2: 'recovery bank R',
};

/** cfg[0] as the bootloader reads it, or null when it names none of A, B and R. */
function bootSlotOf(word: number): BootSlot | null {
  return word === 0 || word === 1 || word === 2 ? word : null;
}

/** The first word of the boot-config block (cfg[0]), read halted. */
async function readBootWord(rig: BenchRig): Promise<number> {
  const bytes = await readFlash(rig, BOOT_CONFIG_ADDRESS, 4);
  return Buffer.from(bytes).readUInt32LE(0);
}

/** The boot-config block (64 KiB) in full. */
const BOOT_CONFIG_BYTES = 0x10000;

/**
 * The boot-config block as it must read once cfg[0] is `slot`: the template's own block (this
 * unit's flash as it was flashed), with only cfg[0] changed. FW-V1's set-boot copies it so.
 */
export function bootBlockOf(template: Uint8Array, slot: BootSlot): Uint8Array {
  const at = BOOT_CONFIG_ADDRESS - BENCH_FLASH_BASE;
  const block = Buffer.from(template.subarray(at, at + BOOT_CONFIG_BYTES));
  block.writeUInt32LE(slot, 0);
  return new Uint8Array(block);
}

/**
 * Sets cfg[0] through FW-V1's set-boot, then checks the block. The camera is power-cycled first,
 * because a halted read straight after a page write is not reliable on this part (TESTING 42.4):
 * the block is read after the cycle, and must be the template's with only cfg[0] changed.
 */
async function setBootSlotVerified(rig: BenchRig, slot: BootSlot, template: string): Promise<void> {
  await rig.jlink.setBootSlot(slot, template);
  await rig.camera.powerCycle();
  if ((await rig.camera.waitForEnumeration(ENUMERATE_MS)) === null) {
    throw new Error(`the camera did not come back on USB after cfg[0] was set to ${String(slot)}`);
  }
  const want = bootBlockOf(readFileSync(template), slot);
  const got = await readFlash(rig, BOOT_CONFIG_ADDRESS, BOOT_CONFIG_BYTES);
  if (sha256(got) !== sha256(want)) {
    throw new Error(
      `the boot-config block after cfg[0]=${String(slot)} is not the template's with only cfg[0] changed ` +
        `(${describeDifference(got, want)})`,
    );
  }
}
/** How long the camera has to come back on USB after a reset or a replug. */
export const ENUMERATE_MS = 40_000;
/**
 * How long a reset may take to take the camera off the bus. A reset that reboots the
 * camera drops it at once, and it is back in about 4 s; a camera still on the bus after
 * this long was not reset, and the page must not be read from it.
 */
export const RESET_DROP_MS = 5_000;

/** The failure for a reset that did not reboot the camera, or that did not bring it back. */
function rebootFailure(dropMs: number, timeoutMs: number): string {
  return (
    `the camera stayed on the bus ${String(dropMs / 1000)} s after the reset (not rebooted), ` +
    `or did not come back within ${String(timeoutMs / 1000)} s`
  );
}
/** The banks, in the order they are written. */
export const WRITE_ORDER: readonly BankLetter[] = ['b', 'a', 'r'];
/**
 * The header's cleartext adjust word (core `ADJUST_OFFSET`, image/header.ts). The page
 * stamps every image it writes so its word sum is the bootloader's target, by rewriting
 * this word; an image that already sums right is unchanged.
 */
export const ADJUST_OFFSET = 0x238;

/**
 * Whether a bank's decrypted read-back is the image that was written, allowing for the
 * one word the page's stamp may rebalance (the adjust word). A patched build string
 * changes the sum, so the stamp moves the adjust word and nothing else.
 */
export function sameAsWritten(readBack: Uint8Array, written: Uint8Array): boolean {
  if (readBack.length !== written.length) return false;
  for (let at = 0; at < written.length; at++) {
    if (at >= ADJUST_OFFSET && at < ADJUST_OFFSET + 4) continue;
    if (readBack[at] !== written[at]) return false;
  }
  return true;
}

/**
 * The key pair the page's retarget may have changed (TESTING 42.7). On the modern line the page
 * writes an image under the camera's own pair, so the read-back carries that pair where the image
 * carried the application's. `applicationPairAt` finds the first application pair of the modern
 * line (the core's own table) in an image, each half exactly once: the two offsets, or null.
 */
export function applicationPairAt(
  image: Uint8Array,
): { readonly at0: number; readonly at1: number } | null {
  const bytes = Buffer.from(image);
  for (const pair of APPLICATION_KEY_PAIRS) {
    const needles = [Buffer.from(pair.keyA, 'hex'), Buffer.from(pair.keyB, 'hex')];
    const hits = needles.map((needle) => {
      const found: number[] = [];
      let at = bytes.indexOf(needle);
      while (at >= 0) {
        found.push(at);
        at = bytes.indexOf(needle, at + 1);
      }
      return found;
    });
    if (hits.every((found) => found.length === 1)) {
      return { at0: hits[0]?.[0] ?? -1, at1: hits[1]?.[0] ?? -1 };
    }
  }
  return null;
}

/** The pair a decrypted file's name gives (`…-KeyA-<hex>-KeyB-<hex>.bin`), or null when it names none. */
export function keyPairNamedBy(
  name: string | null,
): { readonly keyA: string; readonly keyB: string } | null {
  const match = /-KeyA-([0-9a-f]{32})-KeyB-([0-9a-f]{32})\.bin$/.exec(name ?? '');
  return match === null ? null : { keyA: match[1] ?? '', keyB: match[2] ?? '' };
}

/**
 * Whether a read-back equals the image written, allowing for the two things the page does to an
 * image on the modern line: the adjust word (sameAsWritten), and the camera's own key pair in place
 * of the application's. The key pair is allowed only where the image holds an application pair and
 * the read-back holds exactly the pair its own name gives, at the same two offsets; every other
 * byte must match.
 */
export function sameAsWrittenUpToKeyPair(
  readBack: Uint8Array,
  written: Uint8Array,
  named: { readonly keyA: string; readonly keyB: string } | null,
): boolean {
  if (sameAsWritten(readBack, written)) return true;
  if (named === null || readBack.length !== written.length) return false;
  const pair = applicationPairAt(written);
  if (pair === null) return false;
  const blockAt = (offset: number): string =>
    Buffer.from(readBack.subarray(offset, offset + 16)).toString('hex');
  if (blockAt(pair.at0) !== named.keyA || blockAt(pair.at1) !== named.keyB) return false;
  const allowed = (at: number): boolean =>
    (at >= ADJUST_OFFSET && at < ADJUST_OFFSET + 4) ||
    (at >= pair.at0 && at < pair.at0 + 16) ||
    (at >= pair.at1 && at < pair.at1 + 16);
  for (let at = 0; at < written.length; at++) {
    if (!allowed(at) && readBack[at] !== written[at]) return false;
  }
  return true;
}

const UPPER: Readonly<Record<BankLetter, string>> = { a: 'A', b: 'B', r: 'R' };

/**
 * A step's state. `refused` is a write the page refused at its picker, with nothing sent (the
 * FF image into A or B, TESTING 42.6): the expected outcome for that bank, not a skipped one.
 */
export type StepState = 'passed' | 'failed' | 'skipped' | 'not-run' | 'refused';

export interface SlotWriteResult {
  readonly bank: BankLetter;
  state: StepState;
  /** Whether the bank's bytes before the write equal the bytes the J-Link reads after it. */
  sameAsBefore: boolean | null;
  readonly notes: string[];
}

/**
 * One bank's own boot test (SEEK_BENCH_SLOT_BOOT=1): the bank holds the patched image, the
 * other banks it names are erased, the camera is reset. What it ran is the result.
 *   booted-alone  the camera ran this bank's build string
 *   did-not-boot  the camera did not come back on the bus after the reset
 *   ran-other     the camera came back and ran something else (the string is in `running`)
 */
export type SlotBootState =
  'booted-alone' | 'did-not-boot' | 'ran-other' | 'skipped' | 'failed' | 'not-run';

export interface SlotBootResult {
  readonly bank: BankLetter;
  state: SlotBootState;
  /** The build string the camera reported after the reset, or null. */
  running: string | null;
  /** The banks erased for this test (the other banks; B keeps R as the safety net). */
  readonly erased: BankLetter[];
  readonly notes: string[];
}

export interface SubjectResult {
  readonly label: string;
  readonly file: string;
  readonly version: string;
  flashVerified: boolean;
  enumerated: boolean;
  enumerateMs: number | null;
  pageIdentified: boolean;
  banksMatch: boolean;
  readonly slotWrites: SlotWriteResult[];
  bootProof: StepState;
  /** The per-bank boot tests, when SEEK_BENCH_SLOT_BOOT=1 (empty otherwise). */
  readonly slotBoot: SlotBootResult[];
  readonly notes: string[];
  readonly failures: string[];
}

/** Whether the per-bank boot proof and the blank-bank fallback run (SEEK_BENCH_SLOT_BOOT=1). */
export function slotBootEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.SEEK_BENCH_SLOT_BOOT === '1';
}

/** The banks each bank's own boot test erases. B keeps R intact as the safety net. */
export const ERASED_FOR_BOOT: Readonly<Record<BankLetter, readonly BankLetter[]>> = {
  b: ['a'],
  a: ['b', 'r'],
  r: ['b', 'a'],
};

/**
 * The image a bank with none of its own is written with: the booted bank's own image, else
 * A's, else R's, else B's, never the target's. Null when no other bank has an image.
 */
export function fallbackSource(
  images: ReadonlyMap<BankLetter, PageImage | null>,
  target: BankLetter | null,
  booted: BankLetter | null,
): { readonly letter: BankLetter; readonly image: PageImage } | null {
  const order: BankLetter[] = booted === null ? [] : [booted];
  order.push('a', 'r', 'b');
  for (const letter of order) {
    if (letter === target) continue;
    const image = images.get(letter) ?? null;
    if (image !== null) return { letter, image };
  }
  return null;
}

/** A subject's name for the logs and the matrix. Never a personal path. */
export function subjectLabel(subject: BenchSubject): string {
  return `${subject.family} ${subject.version} ${subject.variant} (${subject.folder})`;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function short(sha: string): string {
  return sha.slice(0, 8);
}

function hex(address: number): string {
  return `0x${address.toString(16).padStart(8, '0')}`;
}

/** Whether a J-Link failure is the CPU refusing to halt (the one a power cycle clears). */
function isHaltFailure(error: unknown): boolean {
  return /halt/i.test(messageOf(error));
}

/** The bank addresses the plan gives for `version`, one entry per profile the page may read under. */
function planLayouts(
  version: string,
): readonly { readonly profile: string; readonly banks: Partial<Record<BankLetter, number>> }[] {
  const layouts: { profile: string; banks: Partial<Record<BankLetter, number>> }[] = [];
  for (const profile of listProfiles()) {
    /* A profile that cannot plan this version has no layout to offer, and is skipped. */
    try {
      const plan = buildSlotPlan(profile, version);
      const banks: Partial<Record<BankLetter, number>> = {};
      for (const slot of plan.slots) banks[slot.key] = slot.address;
      layouts.push({ profile: plan.profileId, banks });
    } catch {
      continue;
    }
  }
  return layouts;
}

/** Runs one step. Its failure is recorded on the subject and returns null; success returns its value. */
async function attempt<T>(
  r: SubjectResult,
  step: string,
  body: () => T | Promise<T>,
): Promise<T | null> {
  try {
    return await body();
  } catch (error) {
    r.failures.push(`${step}: ${messageOf(error)}`);
    return null;
  }
}

/** A J-Link read, with one retry when the halt fails (no power cycle: the page may be open). */
async function readFlash(rig: BenchRig, address: number, length: number): Promise<Uint8Array> {
  try {
    return await rig.jlink.readFlash(address, length);
  } catch (error) {
    if (!isHaltFailure(error)) throw error;
    return rig.jlink.readFlash(address, length);
  }
}

/**
 * The full-flash read-back. If the halt fails, the camera is power-cycled and
 * the read is retried once, as the bench's recipe says; any other failure, or a
 * second one, stands.
 */
async function verifyFlash(rig: BenchRig, sha: string, r: SubjectResult): Promise<void> {
  try {
    await rig.jlink.verifyFull(sha);
    return;
  } catch (error) {
    if (!isHaltFailure(error)) throw error;
    r.notes.push(
      `verify: the halt failed (${messageOf(error)}); power-cycled the camera, read again`,
    );
  }
  await rig.camera.powerCycle();
  await rig.jlink.verifyFull(sha);
}

/**
 * The five regions of the part a write is checked against: the bootloader block,
 * the boot config, and the three banks (the bank being written is the one allowed
 * to change). One halted read covers them all; if that read fails, each region is
 * read on its own, and only the bootloader block may be unreadable.
 */
async function snapshot(
  rig: BenchRig,
  banks: Readonly<Record<BankLetter, number>>,
): Promise<Map<string, Uint8Array | null>> {
  const regions = new Map<string, number>([
    ['bootloader', BOOTLOADER_ADDRESS],
    ['boot-config', BOOT_CONFIG_ADDRESS],
    ['bank-a', banks.a],
    ['bank-b', banks.b],
    ['bank-r', banks.r],
  ]);
  const start = BOOTLOADER_ADDRESS;
  const end = Math.max(...regions.values()) + BANK_BYTES;
  const out = new Map<string, Uint8Array | null>();
  try {
    const span = await readFlash(rig, start, end - start);
    for (const [name, address] of regions) {
      out.set(name, span.slice(address - start, address - start + BANK_BYTES));
    }
  } catch {
    for (const [name, address] of regions) {
      try {
        out.set(name, await readFlash(rig, address, BANK_BYTES));
      } catch (error) {
        if (name !== 'bootloader') throw error;
        out.set(name, null);
      }
    }
  }
  return out;
}

/**
 * The regions whose bytes differ between two snapshots, except `skip` (the bank being written).
 * A region that either snapshot could not read is not compared (only the bootloader can be unread).
 */
function regionsChanged(
  before: ReadonlyMap<string, Uint8Array | null>,
  after: ReadonlyMap<string, Uint8Array | null>,
  skip: string | null,
): string[] {
  const changed: string[] = [];
  for (const [region, was] of before) {
    if (region === skip) continue;
    const now = after.get(region) ?? null;
    if (was === null || now === null) continue;
    if (sha256(was) !== sha256(now)) changed.push(region);
  }
  return changed;
}

interface Reading {
  readonly read: PageRead;
  /** Each bank's own decrypted image, as the page's Dump saved it (null: the page could not decrypt it). */
  readonly images: ReadonlyMap<BankLetter, PageImage | null>;
  /** Each bank's own decrypted image, whatever the boot test would take of it (null: none). */
  readonly own: ReadonlyMap<BankLetter, PageImage | null>;
  readonly addresses: Readonly<Record<BankLetter, number>>;
}

function addressOf(banks: readonly BankView[], letter: BankLetter): number {
  const bank = banks.find((candidate) => candidate.letter === letter);
  if (bank === undefined) throw new Error(`the table has no row for ${UPPER[letter]}`);
  return bank.address;
}

/**
 * Step 2, the page half: one window reads the three banks and dumps each one,
 * then closes. Nothing here touches the J-Link: the window is shut before the
 * caller compares the dumps with the flash.
 */
async function readWindow(
  rig: BenchRig,
  subject: BenchSubject,
  r: SubjectResult,
  slotBoot: boolean,
): Promise<{ readonly read: PageRead; readonly dumps: ReadonlyMap<BankLetter, PageDump> }> {
  const page = await rig.openPage();
  try {
    const read = await page.readSlots();
    r.notes.push(
      `page: "${read.status}", running build ${read.runningBuild ?? 'none shown'}, banks ` +
        read.banks
          .map(
            (bank) =>
              `${UPPER[bank.letter]} ${hex(bank.address)} ${bank.version ?? 'no version'}` +
              (bank.booted ? ' (booted)' : ''),
          )
          .join(', '),
    );
    const letters = read.banks.map((bank) => bank.letter).join(',');
    if (letters !== 'a,b,r') {
      throw new Error(`the table has ${letters === '' ? 'no banks' : letters}, not a, b, r`);
    }
    const layout = planLayouts(subject.version).find((candidate) =>
      read.banks.every((bank) => candidate.banks[bank.letter] === bank.address),
    );
    if (layout === undefined) {
      r.failures.push(
        `page: the bank addresses ${read.banks.map((bank) => `${UPPER[bank.letter]}=${hex(bank.address)}`).join(' ')} ` +
          `are not the plan's for ${subject.version}`,
      );
    } else {
      r.notes.push(`bank addresses: the ${layout.profile} plan`);
    }
    for (const bank of read.banks) {
      if (bank.version === null) {
        r.notes.push(
          `bank ${UPPER[bank.letter]}: holds no readable image (the page shows no version)`,
        );
      } else if (bank.version !== subject.version) {
        /* Under the boot test, a bank holding another build is replaced with the image of a
         * bank that holds the running build (readPage), so it is a note, not a failure. */
        if (slotBoot) {
          r.notes.push(
            `bank ${UPPER[bank.letter]} holds ${bank.version}, not the running ${subject.version}: ` +
              'it has no image of its own for this build',
          );
        } else {
          r.failures.push(
            `page: bank ${UPPER[bank.letter]} reports ${bank.version}, the subject is ${subject.version}`,
          );
        }
      }
    }
    const booted = read.banks.filter((bank) => bank.booted).length;
    const versionsMatch = read.banks.every(
      (bank) => bank.version === null || bank.version === subject.version,
    );
    r.pageIdentified =
      layout !== undefined &&
      read.runningBuild === subject.version &&
      booted === 1 &&
      (slotBoot || versionsMatch);

    const dumps = new Map<BankLetter, PageDump>();
    for (const bank of read.banks) dumps.set(bank.letter, await page.dump(bank.letter));
    const refused = await page.refusals();
    if (refused.length > 0) r.failures.push(`page: refused requests: ${refused.join('; ')}`);
    return { read, dumps };
  } finally {
    const closed = await closeWindow(page);
    if (closed !== null) r.failures.push(closed);
  }
}

/**
 * Step 2: the page's read and dumps, held against the J-Link: each bank's flash
 * is the dump the page saved, and the dump file's bytes at that bank's offset.
 * The window is closed by the time the J-Link is read.
 */
async function readPage(
  rig: BenchRig,
  subject: BenchSubject,
  bytes: Uint8Array,
  r: SubjectResult,
  slotBoot: boolean,
): Promise<Reading> {
  const { read, dumps } = await readWindow(rig, subject, r, slotBoot);
  const addresses: Record<BankLetter, number> = {
    a: addressOf(read.banks, 'a'),
    b: addressOf(read.banks, 'b'),
    r: addressOf(read.banks, 'r'),
  };
  const images = new Map<BankLetter, PageImage | null>();
  /* Each bank's own decrypted image whatever its version (the image map drops a stale one). */
  const own = new Map<BankLetter, PageImage | null>();
  let allMatch = true;
  for (const bank of read.banks) {
    const name = UPPER[bank.letter];
    const dump = dumps.get(bank.letter);
    if (dump === undefined) throw new Error(`no dump of bank ${name}`);
    if (dump.raw.length !== BANK_BYTES) {
      allMatch = false;
      r.failures.push(
        `page: the dump of bank ${name} is ${String(dump.raw.length)} bytes, not 64 KiB`,
      );
    }
    const flash = await readFlash(rig, bank.address, BANK_BYTES);
    const offset = bank.address - BENCH_FLASH_BASE;
    const fromFile = bytes.subarray(offset, offset + BANK_BYTES);
    const flashSha = sha256(flash);
    if (flashSha !== sha256(dump.raw)) {
      allMatch = false;
      r.failures.push(
        `bank ${name}: the J-Link flash ${short(flashSha)} is not the page's dump ${short(sha256(dump.raw))}`,
      );
    }
    if (flashSha !== sha256(fromFile)) {
      allMatch = false;
      r.failures.push(
        `bank ${name}: the J-Link flash ${short(flashSha)} is not the dump file's ${short(sha256(fromFile))} at ${hex(offset)}`,
      );
    }
    own.set(
      bank.letter,
      dump.decrypted === null || dump.decryptedName === null
        ? null
        : { name: dump.decryptedName, bytes: dump.decrypted },
    );
    if (dump.decrypted === null || dump.decryptedName === null) {
      images.set(bank.letter, null);
      r.notes.push(
        `bank ${name}: the page cannot decrypt it, so there is no image of its own to write`,
      );
    } else if (slotBoot && bank.version !== null && bank.version !== subject.version) {
      /* A stale image (another build) is no image of this build: the boot test writes the
       * running build's image there instead. The stale bytes are still checked above. */
      images.set(bank.letter, null);
      r.notes.push(
        `bank ${name}: its image is ${bank.version}, not the running ${subject.version}`,
      );
    } else {
      images.set(bank.letter, { name: dump.decryptedName, bytes: dump.decrypted });
    }
  }
  r.banksMatch = allMatch;
  return { read, images, own, addresses };
}

/** Closes a page window. Returns what went wrong, or null: the window must be gone before the J-Link goes on. */
async function closeWindow(page: BenchPage): Promise<string | null> {
  try {
    await page.close();
    return null;
  } catch (error) {
    return `the page window did not close: ${messageOf(error)}`;
  }
}

interface WriteOutcome {
  /** What the page or the J-Link got wrong about this write. Empty when it checked out. */
  readonly problems: readonly string[];
  /** The page's read-back dump of the bank after the replug. */
  readonly raw: Uint8Array;
  /** Whether the bank's bytes before the write equal its bytes after. */
  readonly sameAsBefore: boolean | null;
}

/**
 * One bank written through the page, end to end: the picker and the confirmation
 * (with the tick the page asks for, and only then), the page's verdict, the
 * replug, the page's read-back dump, the J-Link read of the bank, and the
 * J-Link read of every other block before and after. A problem is returned, not
 * thrown, once the write has been sent, so the read-back still runs; a step that
 * cannot run at all throws.
 */
async function writeBank(
  rig: BenchRig,
  reading: Reading,
  letter: BankLetter,
  image: PageImage,
  expectedStored: Uint8Array | null = null,
  via: 'picker' | 'fill' = 'picker',
): Promise<WriteOutcome> {
  const name = UPPER[letter];
  const address = reading.addresses[letter];
  const problems: string[] = [];
  const before = await snapshot(rig, reading.addresses);

  const page = await rig.openPage();
  try {
    const read = await page.readSlots();
    const bank = read.banks.find((candidate) => candidate.letter === letter);
    if (bank === undefined) throw new Error(`the table has no row for ${name}`);
    if (bank.address !== address) {
      throw new Error(`the row for ${name} is at ${hex(bank.address)}, not ${hex(address)}`);
    }
    /* The page asks for the extra tick on the booted bank, on recovery, and on every bank
     * when the camera names no booted bank (the core's rule). The plan expects exactly
     * that, and a page that disagrees stops the write. */
    const bootUnnamed = !read.banks.some((candidate) => candidate.booted);
    const acknowledge = bank.booted || letter === 'r' || bootUnnamed;
    /* "fill" offers the page's own "Use … image" button instead of a picked file: the same
     * confirmation, and every check below still compares the read-back with `image`. */
    const written =
      via === 'fill'
        ? await page.fill(letter, acknowledge)
        : await page.write(letter, image, acknowledge);
    const outcome = written.outcome ?? '';
    if (!outcome.startsWith(`Slot ${name} — `)) {
      problems.push(`the page shows no verdict for bank ${name}`);
    } else if (!outcome.includes('the bank reads back as written.')) {
      problems.push(
        `the page did not report bank ${name} as matched: ${outcome.split('\n')[0] ?? ''}`,
      );
    }
    const refused = await page.refusals();
    if (refused.length > 0) problems.push(`refused requests: ${refused.join('; ')}`);
  } finally {
    const closed = await closeWindow(page);
    if (closed !== null) problems.push(closed);
  }

  /* The page says the bank takes effect only after a real power cycle, and sends
   * no reset itself: the bench's switch does the unplug and the replug. */
  await rig.camera.powerCycle();
  if ((await rig.camera.waitForEnumeration(ENUMERATE_MS)) === null) {
    throw new Error(
      `the camera did not enumerate within ${String(ENUMERATE_MS / 1000)} s of the replug`,
    );
  }

  const again = await rig.openPage();
  let dump: PageDump;
  try {
    const status = await again.readSlots();
    if (!status.status.startsWith('Read. 3/3')) {
      problems.push(`read-back: Read slots ended "${status.status}"`);
    }
    dump = await again.dump(letter);
    const refused = await again.refusals();
    if (refused.length > 0) problems.push(`read-back: refused requests: ${refused.join('; ')}`);
  } finally {
    const closed = await closeWindow(again);
    if (closed !== null) problems.push(closed);
  }

  const flash = await readFlash(rig, address, BANK_BYTES);
  const flashSha = sha256(flash);
  if (flashSha !== sha256(dump.raw)) {
    problems.push(
      `bank ${name}: the J-Link flash ${short(flashSha)} is not the page's read-back ${short(sha256(dump.raw))}`,
    );
  }
  if (dump.decrypted === null) {
    problems.push(`bank ${name}: the read-back does not decrypt under any recovered key`);
  } else if (
    !sameAsWrittenUpToKeyPair(dump.decrypted, image.bytes, keyPairNamedBy(dump.decryptedName))
  ) {
    problems.push(
      `bank ${name}: the read-back decrypts to ${short(sha256(dump.decrypted))}, not the image written ${short(sha256(image.bytes))}`,
    );
  }
  /* A write whose stored form is predicted (the FF image, TESTING 42.6) is checked byte for byte
   * against that prediction: the bank is what the camera keeps, not what the page sent. */
  if (expectedStored !== null) {
    const diff = describeDifference(dump.raw, expectedStored);
    if (diff !== 'identical') {
      problems.push(`bank ${name}: the read-back is not the predicted stored form (${diff})`);
    }
  }

  const after = await snapshot(rig, reading.addresses);
  for (const region of regionsChanged(before, after, `bank-${letter}`)) {
    problems.push(`${region} changed by the write to bank ${name}`);
  }
  const was = before.get(`bank-${letter}`) ?? null;
  return {
    problems,
    raw: dump.raw,
    sameAsBefore: was === null ? null : sha256(was) === flashSha,
  };
}

/**
 * Step 4: the booted bank's own image with its build string patched, written
 * into all three banks, then a reset, and the camera must run the patched build
 * with the banks as the page read them after the writes.
 */
async function bootProof(rig: BenchRig, reading: Reading, r: SubjectResult): Promise<void> {
  /* The booted bank's image when the page names a booted bank; the locked line cannot, and the
   * patch is written to all three banks anyway, so any bank's image will do. */
  const withImage = reading.read.banks.filter(
    (bank) => (reading.images.get(bank.letter) ?? null) !== null,
  );
  const source = withImage.find((bank) => bank.booted) ?? withImage[0];
  const image = source === undefined ? null : (reading.images.get(source.letter) ?? null);
  if (image === null) {
    r.bootProof = 'skipped';
    r.notes.push('boot proof skipped: no decrypted image of any bank to patch');
    return;
  }
  const buildString = (await rig.camera.runningInfo())?.buildString ?? null;
  if (buildString === null) {
    r.bootProof = 'skipped';
    r.notes.push('boot proof skipped: the camera did not report a build string to look for');
    return;
  }
  const patched = rig.patch(image.bytes, buildString);
  if (patched === null) {
    r.bootProof = 'skipped';
    r.notes.push('boot proof skipped: patchBuildString found no build string in the bank image');
    return;
  }
  r.notes.push(
    `boot proof: build string ${patched.from} -> ${patched.to} at ${String(patched.offsets.length)} offset(s)`,
  );

  const failuresBefore = r.failures.length;
  const patchedImage: PageImage = { name: image.name, bytes: patched.patched };
  const raws = new Map<BankLetter, Uint8Array>();
  for (const letter of WRITE_ORDER) {
    const outcome = await writeBank(rig, reading, letter, patchedImage);
    for (const problem of outcome.problems) {
      r.failures.push(`boot write ${UPPER[letter]}: ${problem}`);
    }
    if (outcome.problems.length > 0) {
      r.bootProof = 'failed';
      return;
    }
    raws.set(letter, outcome.raw);
  }

  await rig.jlink.resetCpu();
  if ((await rig.camera.waitForReboot(RESET_DROP_MS, ENUMERATE_MS)) === null) {
    r.failures.push(`boot: ${rebootFailure(RESET_DROP_MS, ENUMERATE_MS)}`);
    r.bootProof = 'failed';
    return;
  }
  const running = (await rig.camera.runningInfo())?.buildString ?? null;
  if (running === null) {
    r.failures.push('boot: the camera did not report the build it runs');
  } else if (!running.includes(patched.to)) {
    r.failures.push(`boot: the camera runs "${running}", not the patched "${patched.to}"`);
  }
  for (const letter of WRITE_ORDER) {
    const flash = await readFlash(rig, reading.addresses[letter], BANK_BYTES);
    const want = raws.get(letter);
    if (want === undefined || sha256(flash) !== sha256(want)) {
      r.failures.push(`boot: bank ${UPPER[letter]} after the reset is not the page's read-back`);
    }
  }
  r.bootProof = r.failures.length === failuresBefore ? 'passed' : 'failed';
}

/** The write record for `letter`. Every subject's record carries all three banks, so a miss is a bug. */
function writeResultOf(r: SubjectResult, letter: BankLetter): SlotWriteResult {
  const found = r.slotWrites.find((write) => write.bank === letter);
  if (found === undefined) throw new Error(`no write record for bank ${UPPER[letter]}`);
  return found;
}

/** What the camera says it runs, in one line, for the run log and the notes. */
function describeRunning(info: RunningInfo | null): string {
  if (info === null) return 'no report';
  return (
    `product ${info.product ?? '?'}, firmware ${info.firmwareVersion ?? '?'}, ` +
    `build "${info.buildString ?? '?'}", bootloader ${info.bootloaderVersion ?? '?'}`
  );
}

/**
 * One bank the page must refuse at its picker (the FF image into A or B, TESTING 42.6). The
 * page must say "Rejected": it offers no write and sends nothing, so every region of the part
 * reads back unchanged, and the window records no refused request. A page that takes the image
 * is a failure, and nothing is confirmed here.
 */
async function refuseBank(
  rig: BenchRig,
  reading: Reading,
  letter: BankLetter,
  image: PageImage,
  r: SubjectResult,
): Promise<void> {
  const name = UPPER[letter];
  const result = writeResultOf(r, letter);
  const problems: string[] = [];
  const before = await snapshot(rig, reading.addresses);
  let refusal: PageRefusal | null = null;
  const page = await rig.openPage();
  try {
    /* The picker's rows exist only once the banks are read in this window (as writeBank does). */
    await page.readSlots();
    refusal = await page.refuse(letter, image);
    const refused = await page.refusals();
    if (refused.length > 0) problems.push(`refused requests: ${refused.join('; ')}`);
  } catch (error) {
    problems.push(messageOf(error));
  } finally {
    const closed = await closeWindow(page);
    if (closed !== null) problems.push(closed);
  }
  const after = await snapshot(rig, reading.addresses);
  for (const region of regionsChanged(before, after, null)) {
    problems.push(`${region} changed while the page was refusing bank ${name}`);
  }
  if (refusal !== null) {
    result.notes.push(`page: "${refusal.status}", logged: ${refusal.reason ?? 'no reason logged'}`);
  }
  if (problems.length > 0) {
    result.state = 'failed';
    for (const problem of problems) r.failures.push(`refuse ${name}: ${problem}`);
    return;
  }
  result.state = 'refused';
}

/**
 * The 1.3.0.8 FF (16 Hz) subject (TESTING 42.6), in place of the three-bank write:
 *   - the banks are read as for any subject, and the page's decrypted R is the FF image;
 *   - the image is refused at the picker for A and for B, with nothing sent;
 *   - the image is written to R alone, through the page with the risk tick: the read-back must be
 *     the PREDICTED stored form (`predictedFFStored`, not the page's own builder), and the J-Link
 *     must read the same bytes back from R;
 *   - the boot proof: the FF app's own build string is patched (same length) in the image, written
 *     to R alone, the CPU reset; the camera, which boots FF only from recovery, must run the patched
 *     string. What the FF app reports at each step is recorded.
 * Every region other than R reads back unchanged from the first read to the end.
 */
async function runFF1308(
  rig: BenchRig,
  subject: BenchSubject,
  bytes: Uint8Array,
  r: SubjectResult,
  log: (line: string) => void,
): Promise<void> {
  const reading = await attempt(r, 'page read', () => readPage(rig, subject, bytes, r, true));
  if (reading === null) {
    r.notes.push('FF steps not run: the page read failed');
    return;
  }
  log(
    `${r.label}: page identified=${String(r.pageIdentified)}, banks match J-Link=${String(r.banksMatch)}`,
  );
  const booted = reading.read.banks.find((bank) => bank.booted)?.letter ?? null;
  r.notes.push(
    `FF: the page names ${booted === null ? 'no booted bank' : `bank ${UPPER[booted]}`} as booted`,
  );
  const start = await snapshot(rig, reading.addresses);

  const image = reading.images.get('r') ?? null;
  if (image === null) {
    r.failures.push(
      'FF: the page holds no decrypted image of bank R, so there is nothing to write',
    );
    return;
  }
  if (!carriesFFKeyPair(image.bytes)) {
    r.failures.push(
      `FF: the page's image of R (${image.name}) does not carry the 1.3.0.8-FF key pair`,
    );
    return;
  }
  r.notes.push(`FF: image ${image.name}, ${String(image.bytes.length)} B, the page's decrypted R`);

  /* The bank rule follows the camera's bootloader (core ff-platform.ts). On the FF platform's
   * own bootloader (2.0.2.3) the page refuses the FF image for all three banks: nothing is written,
   * and the boot proof is not run (TESTING 42.12 measured the page's form by hand, not by this flow). */
  const bootloader = (await rig.camera.runningInfo())?.bootloaderVersion ?? null;
  if (bootloader === FF_PLATFORM_BOOTLOADER) {
    r.notes.push(
      `FF: bootloader ${FF_PLATFORM_BOOTLOADER} (the FF platform): the page must refuse the FF image for every bank`,
    );
    for (const letter of ['b', 'a', 'r'] as const) {
      await refuseBank(rig, reading, letter, image, r);
    }
    log(
      `${r.label}: the FF image is refused for B, A and R: ` +
        `${writeResultOf(r, 'b').state}, ${writeResultOf(r, 'a').state}, ${writeResultOf(r, 'r').state}`,
    );
    r.notes.push('FF: nothing written on this bootloader, so no boot proof is run (TESTING 42.12)');
    return;
  }
  r.notes.push(
    `FF: bootloader ${bootloader ?? 'not reported'}: the 2014 rule (A and B refused, R written)`,
  );

  for (const letter of ['b', 'a'] as const) {
    await refuseBank(rig, reading, letter, image, r);
  }
  log(
    `${r.label}: A and B refuse the FF image: ` +
      `${writeResultOf(r, 'a').state}, ${writeResultOf(r, 'b').state}`,
  );

  /* R: the one write. The page's read-back is checked against the prediction, then the J-Link. */
  const rWrite = writeResultOf(r, 'r');
  let first: WriteOutcome;
  try {
    first = await writeBank(rig, reading, 'r', image, predictedFFStored(image.bytes));
  } catch (error) {
    rWrite.state = 'failed';
    r.failures.push(`write R: ${messageOf(error)}`);
    r.notes.push('boot proof not run: the R write did not complete');
    return;
  }
  rWrite.sameAsBefore = first.sameAsBefore;
  if (first.problems.length > 0) {
    rWrite.state = 'failed';
    for (const problem of first.problems) r.failures.push(`write R: ${problem}`);
    r.notes.push('boot proof not run: the R write did not check out');
    return;
  }
  rWrite.state = 'passed';
  log(`${r.label}: bank R written with the FF image, read back as predicted`);

  /* The boot. The flashed image has cfg[0] = 0 (slot A), so the FF image in R runs only once
   * cfg[0] names recovery (2). That is set through FW-V1's set-boot, from the flashed image, and
   * put back after the proof whatever the proof found (the restore is in the finally). */
  const cfgBefore = bootSlotOf(await readBootWord(rig));
  if (cfgBefore === null) {
    r.bootProof = 'failed';
    r.failures.push('boot: cfg[0] is neither slot A, B nor recovery, so the boot cannot be set');
    return;
  }
  r.notes.push(
    `boot config: cfg[0]=${String(cfgBefore)} (${SLOT_NAME[cfgBefore]}) as the flashed image has it`,
  );
  let changed = false;
  try {
    if (cfgBefore !== RECOVERY_SLOT) {
      changed = true;
      await setBootSlotVerified(rig, RECOVERY_SLOT, subject.file);
      r.notes.push(
        `boot config: cfg[0] set to ${String(RECOVERY_SLOT)} (${SLOT_NAME[RECOVERY_SLOT]}), block verified`,
      );
    }
    await ffBootProof(rig, reading, image, r, log);
  } catch (error) {
    r.bootProof = 'failed';
    r.failures.push(`boot: ${messageOf(error)}`);
  } finally {
    if (changed) {
      const restored = await attempt(r, 'boot config restore', async () => {
        await setBootSlotVerified(rig, cfgBefore, subject.file);
        r.notes.push(
          `boot config: cfg[0] restored to ${String(cfgBefore)} (${SLOT_NAME[cfgBefore]}), block verified`,
        );
        await rig.jlink.resetCpu();
        if ((await rig.camera.waitForReboot(RESET_DROP_MS, ENUMERATE_MS)) === null) {
          throw new Error(rebootFailure(RESET_DROP_MS, ENUMERATE_MS));
        }
        r.notes.push(
          `FF app after the restore and a reset: ${describeRunning(await rig.camera.runningInfo())}`,
        );
      });
      if (restored === null) r.bootProof = 'failed';
    }
  }

  /* Only R may have changed over the whole FF path: boot config included, once it is restored.
   * The end state is read after a power cycle, as the start was (the halted reads after a page
   * write are not reliable, TESTING 42.4). */
  await rig.camera.powerCycle();
  if ((await rig.camera.waitForEnumeration(ENUMERATE_MS)) === null) {
    r.failures.push('FF: the camera did not come back on USB after the last power cycle');
    r.bootProof = 'failed';
    return;
  }
  for (const region of regionsChanged(start, await snapshot(rig, reading.addresses), 'bank-r')) {
    r.failures.push(`FF: ${region} changed over the FF steps (only R may change)`);
    r.bootProof = 'failed';
  }
}

/** The boot test of the FF image in R, with cfg[0] already set to recovery (`runFF1308`). */
async function ffBootProof(
  rig: BenchRig,
  reading: Reading,
  image: PageImage,
  r: SubjectResult,
  log: (line: string) => void,
): Promise<void> {
  /* What the FF app reports once R is the boot slot, with the image as sent. */
  await rig.jlink.resetCpu();
  if ((await rig.camera.waitForReboot(RESET_DROP_MS, ENUMERATE_MS)) === null) {
    r.failures.push(`boot: ${rebootFailure(RESET_DROP_MS, ENUMERATE_MS)}`);
    r.bootProof = 'failed';
    return;
  }
  const asSent = await rig.camera.runningInfo();
  r.notes.push(`FF app booted from R with the image as sent: ${describeRunning(asSent)}`);

  /* The proof: the same image with its build string patched, written to R alone, then a reset. */
  const running = asSent?.buildString ?? null;
  if (running === null) {
    r.bootProof = 'failed';
    r.failures.push(
      'boot: the camera reports no build string for the FF app, so there is none to patch',
    );
    return;
  }
  const patched = rig.patch(image.bytes, running);
  if (patched === null) {
    r.bootProof = 'failed';
    r.failures.push(`boot: the build string "${running}" is not in the FF image`);
    return;
  }
  r.notes.push(
    `boot proof: build string ${patched.from} -> ${patched.to} at ${String(patched.offsets.length)} offset(s), R alone`,
  );
  const failuresBefore = r.failures.length;
  const patchedImage: PageImage = { name: image.name, bytes: patched.patched };
  const second = await writeBank(
    rig,
    reading,
    'r',
    patchedImage,
    predictedFFStored(patched.patched),
  );
  for (const problem of second.problems) r.failures.push(`boot write R: ${problem}`);
  if (second.problems.length > 0) {
    r.bootProof = 'failed';
    return;
  }
  await rig.jlink.resetCpu();
  if ((await rig.camera.waitForReboot(RESET_DROP_MS, ENUMERATE_MS)) === null) {
    r.failures.push(`boot: ${rebootFailure(RESET_DROP_MS, ENUMERATE_MS)}`);
    r.bootProof = 'failed';
    return;
  }
  const back = await rig.camera.runningInfo();
  r.notes.push(`FF app after the patched R and a reset: ${describeRunning(back)}`);
  const buildBack = back?.buildString ?? null;
  if (buildBack === null) {
    r.failures.push('boot: the camera did not report the build it runs');
  } else if (!buildBack.includes(patched.to)) {
    r.failures.push(`boot: the camera runs "${buildBack}", not the patched "${patched.to}"`);
  }
  const flashR = await readFlash(rig, reading.addresses.r, BANK_BYTES);
  if (sha256(flashR) !== sha256(second.raw)) {
    r.failures.push("boot: bank R after the reset is not the page's read-back");
  }
  r.bootProof = r.failures.length === failuresBefore ? 'passed' : 'failed';
  log(`${r.label}: boot proof ${r.bootProof}`);
}

/** One bank's erase, checked: the bank must read back all 0xFF. */
async function eraseBank(rig: BenchRig, address: number): Promise<void> {
  await rig.jlink.eraseRange(address, BANK_BYTES);
  /* The first halt after a flash or an erase can fail (TESTING 42.2): a power cycle clears it,
   * as verifyFlash does, so the check reads after one rather than failing the run. */
  let left: Uint8Array;
  try {
    left = await rig.jlink.readFlash(address, BANK_BYTES);
  } catch (error) {
    if (!isHaltFailure(error)) throw error;
    await rig.camera.powerCycle();
    left = await rig.jlink.readFlash(address, BANK_BYTES);
  }
  if (!left.every((byte) => byte === 0xff)) {
    throw new Error(`the bank at ${hex(address)} is not erased after its erase`);
  }
}

/**
 * The per-bank boot proof (SEEK_BENCH_SLOT_BOOT=1). For each bank that was written (B, A, R):
 * the bank takes the source image with its build string marked with that bank's letter, the
 * banks it names in ERASED_FOR_BOOT are erased, the CPU is reset, and the camera's running
 * build string says whether that bank booted alone. Then the state the subject was in after
 * its writes is flashed back (the whole part, read back), so the next bank starts from it.
 *
 * A camera that does not come back is a result (did-not-boot), recorded and recovered through
 * the whole-flash path. Only a flow error (a write, an erase, the restore) is a failure.
 */
async function slotBootProof(
  rig: BenchRig,
  reading: Reading,
  r: SubjectResult,
  written: ReadonlySet<BankLetter>,
  log: (line: string) => void,
): Promise<void> {
  const booted = reading.read.banks.find((bank) => bank.booted)?.letter ?? null;
  const source = fallbackSource(reading.images, null, booted);
  const running = (await rig.camera.runningInfo())?.buildString ?? null;
  if (source === null || running === null) {
    r.bootProof = 'skipped';
    r.notes.push(
      `slot boot skipped: ${source === null ? 'no decrypted image to patch' : 'the camera reports no build string'}`,
    );
    return;
  }
  const dir = mkdtempSync(path.join(tmpdir(), 'seek-slot-boot-'));
  try {
    /* The state after the writes: the whole part, read back, is what each test restores. */
    let state: Uint8Array;
    try {
      state = await readFlash(rig, BENCH_FLASH_BASE, BENCH_FLASH_BYTES);
    } catch (error) {
      if (!isHaltFailure(error)) throw error;
      await rig.camera.powerCycle();
      state = await readFlash(rig, BENCH_FLASH_BASE, BENCH_FLASH_BYTES);
    }
    const stateSha = sha256(state);
    const stateFile = path.join(dir, 'state.bin');
    writeFileSync(stateFile, state);
    r.notes.push(
      `slot boot: source image ${source.image.name} (bank ${UPPER[source.letter]}), build "${running}", ` +
        `state ${short(stateSha)} restored after each bank`,
    );

    for (const letter of WRITE_ORDER) {
      const name = UPPER[letter];
      const result: SlotBootResult = {
        bank: letter,
        state: 'not-run',
        running: null,
        erased: [...ERASED_FOR_BOOT[letter]],
        notes: [],
      };
      r.slotBoot.push(result);
      if (!written.has(letter)) {
        result.state = 'skipped';
        result.notes.push('the bank was not written in this run');
        continue;
      }
      const marked = rig.patch(source.image.bytes, running, name);
      if (marked === null) {
        result.state = 'skipped';
        result.notes.push('patchBuildString found no build string in the source image');
        continue;
      }

      /* The bank takes the marked image through the page, then the other banks it names are erased. */
      const outcome = await writeBank(rig, reading, letter, {
        name: `${source.image.name} (boot test ${name})`,
        bytes: marked.patched,
      });
      if (outcome.problems.length > 0) {
        result.state = 'failed';
        for (const problem of outcome.problems) {
          r.failures.push(`slot boot write ${name}: ${problem}`);
        }
        r.bootProof = 'failed';
        return;
      }
      try {
        for (const other of ERASED_FOR_BOOT[letter]) {
          await eraseBank(rig, reading.addresses[other]);
        }
      } catch (error) {
        result.state = 'failed';
        r.failures.push(`slot boot erase for ${name}: ${messageOf(error)}`);
        r.bootProof = 'failed';
        return;
      }

      await rig.jlink.resetCpu();
      const back = await rig.camera.waitForReboot(RESET_DROP_MS, ENUMERATE_MS);
      if (back === null) {
        result.state = 'did-not-boot';
        result.notes.push(rebootFailure(RESET_DROP_MS, ENUMERATE_MS));
      } else {
        result.running = (await rig.camera.runningInfo())?.buildString ?? null;
        if (result.running?.includes(marked.to) === true) {
          result.state = 'booted-alone';
        } else {
          result.state = 'ran-other';
          result.notes.push(
            result.running === null
              ? 'the camera came back and reported no build string'
              : `the camera ran "${result.running}", not "${marked.to}"`,
          );
        }
      }
      log(
        `${r.label}: boot test ${name}: ${result.state}${result.running ? ` ("${result.running}")` : ''}`,
      );

      /* Back to the state after the writes, read back against its sha, before the next bank. */
      await rig.jlink.flashFull(stateFile);
      await verifyFlash(rig, stateSha, r);
      await rig.jlink.resetCpu();
      if ((await rig.camera.waitForReboot(RESET_DROP_MS, ENUMERATE_MS)) === null) {
        r.failures.push(
          `slot boot restore after ${name}: ${rebootFailure(RESET_DROP_MS, ENUMERATE_MS)}`,
        );
        r.bootProof = 'failed';
        return;
      }
    }
    r.bootProof = 'passed';
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Runs the whole flow for one subject. Never throws: every failure lands in the result. */
/** A subject's record before any step has run. */
function resultFor(subject: BenchSubject): SubjectResult {
  return {
    label: subjectLabel(subject),
    file: path.basename(subject.file),
    version: subject.version,
    flashVerified: false,
    enumerated: false,
    enumerateMs: null,
    pageIdentified: false,
    banksMatch: false,
    slotWrites: WRITE_ORDER.map((bank) => ({
      bank,
      state: 'not-run',
      sameAsBefore: null,
      notes: [],
    })),
    bootProof: 'not-run',
    slotBoot: [],
    notes: [],
    failures: [],
  };
}

/**
 * The subject's file, read and checked (4 MiB, the tree's sha256) before anything touches the bench.
 * Null when it is not the file the tree indexed, with the failure on the record.
 */
async function subjectBytes(r: SubjectResult, subject: BenchSubject): Promise<Uint8Array | null> {
  return attempt(r, 'file', () => {
    const data = new Uint8Array(readFileSync(subject.file));
    if (data.length !== BENCH_FLASH_BYTES) {
      throw new Error(`${String(data.length)} bytes, not a 4 MiB flash`);
    }
    const got = sha256(data);
    if (got !== subject.sha256) {
      throw new Error(`sha256 ${short(got)} is not the tree's ${short(subject.sha256)}`);
    }
    return data;
  });
}

/**
 * Step 1 of every subject: the whole part flashed with the J-Link, read back halted to the dump's
 * sha256, the CPU reset, and the camera back on USB. True when the camera enumerated; otherwise
 * the failure is on the record and the caller stops.
 */
async function flashAndBoot(
  rig: BenchRig,
  subject: BenchSubject,
  r: SubjectResult,
  log: (line: string) => void,
): Promise<boolean> {
  const flashed = await attempt(r, 'flash', async () => {
    await rig.jlink.flashFull(subject.file);
    await verifyFlash(rig, subject.sha256, r);
    r.flashVerified = true;
    log(`${r.label}: flashed and verified, resetting the CPU`);
    await rig.jlink.resetCpu();
  });
  if (flashed === null) {
    r.notes.push('steps 2-4 not run: the flash, its read-back, or the reset failed');
    return false;
  }
  const enumerated = await rig.camera.waitForReboot(RESET_DROP_MS, ENUMERATE_MS);
  r.enumerated = enumerated !== null;
  r.enumerateMs = enumerated;
  if (enumerated === null) {
    r.failures.push(rebootFailure(RESET_DROP_MS, ENUMERATE_MS));
    r.notes.push('steps 2-4 not run: the camera is not on the bus');
    return false;
  }
  log(`${r.label}: enumerated after ${String(enumerated)} ms`);
  return true;
}

/**
 * The refusal probe (TESTING 42.7): bank B's own decrypted image is offered at the picker, and the
 * page must refuse it with nothing sent. A bank the page decrypts no image of is skipped, not sent.
 */
async function runRefusalProbe(
  rig: BenchRig,
  subject: BenchSubject,
  bytes: Uint8Array,
  r: SubjectResult,
  log: (line: string) => void,
  letter: BankLetter,
): Promise<void> {
  const reading = await attempt(r, 'page read', () => readPage(rig, subject, bytes, r, true));
  if (reading === null) {
    r.notes.push('probe not run: the page read failed');
    return;
  }
  log(`${r.label}: page read, offering bank ${UPPER[letter]}'s own image at the picker`);
  const image = reading.own.get(letter) ?? null;
  if (image === null) {
    writeResultOf(r, letter).state = 'skipped';
    r.notes.push(
      `bank ${UPPER[letter]}: the page decrypts no image of its own, so none is offered; nothing was sent`,
    );
    return;
  }
  r.notes.push(
    `bank ${UPPER[letter]}: its own decrypted image ${image.name}, ${String(image.bytes.length)} B`,
  );
  await refuseBank(rig, reading, letter, image, r);
}

/**
 * The empty bank as a user does it (TESTING 42.8), on the 2014 chain with bank B blank: the page
 * lists B as empty; B is dumped (64 KiB of 0xFF, nothing to decrypt); B is filled with the image the
 * camera boots, through the page's own "Use … image" button and its confirmation; the read-back is
 * checked as for any write; then the per-bank boot test proves that B alone boots.
 */
async function runEmptyBankFlow(
  rig: BenchRig,
  subject: BenchSubject,
  bytes: Uint8Array,
  r: SubjectResult,
  log: (line: string) => void,
): Promise<void> {
  const reading = await attempt(r, 'page read', () => readPage(rig, subject, bytes, r, false));
  if (reading === null) {
    r.notes.push('probe not run: the page read failed');
    return;
  }
  const row = reading.read.banks.find((bank) => bank.letter === 'b');
  if (row === undefined) {
    r.failures.push('page: the table has no row for bank B');
    return;
  }
  if (!/\bempty\b/.test(row.firmware)) {
    r.failures.push(`page: bank B is listed "${row.firmware}", not empty`);
    return;
  }
  r.notes.push(`page: bank B is listed "${row.firmware}"`);

  /* The dump, as a user presses it: a fresh window, Read slots, then Dump on bank B. */
  const dump = await attempt(r, 'dump B', async () => {
    const page = await rig.openPage();
    try {
      await page.readSlots();
      return await page.dump('b');
    } finally {
      const closed = await closeWindow(page);
      if (closed !== null) r.failures.push(closed);
    }
  });
  if (dump === null) return;
  const blank = dump.raw.every((byte) => byte === 0xff);
  r.notes.push(
    `dump B: "${dump.status}", ${dump.rawName}, ${String(dump.raw.length)} B, ` +
      `${blank ? 'all 0xFF' : 'NOT all 0xFF'}, decrypted file: ${dump.decryptedName ?? 'none'}`,
  );
  if (dump.raw.length !== BANK_BYTES || !blank) {
    r.failures.push('dump B: the raw dump of an empty bank is not 64 KiB of 0xFF');
  }
  if (dump.decrypted !== null) {
    r.failures.push(
      `dump B: the page wrote a decrypted file (${dump.decryptedName ?? '?'}) for an empty bank`,
    );
  }
  if (!/^seek-slot-B-empty-raw-[0-9a-f]{8}\.bin$/.test(dump.rawName)) {
    r.failures.push(
      `dump B: the file is named "${dump.rawName}", not seek-slot-B-empty-raw-<sha8>.bin`,
    );
  }

  /* The image: the booted bank's own, the one the page's button offers. */
  const booted = reading.read.banks.find((bank) => bank.booted)?.letter ?? null;
  const image = booted === null ? null : (reading.images.get(booted) ?? null);
  if (booted === null || image === null) {
    r.failures.push('fill B: the booted bank holds no decrypted image for the page to offer');
    return;
  }
  r.notes.push(`fill B: the page offers bank ${UPPER[booted]}'s image (${image.name})`);

  const bWrite = writeResultOf(r, 'b');
  let outcome: WriteOutcome;
  try {
    outcome = await writeBank(rig, reading, 'b', image, null, 'fill');
  } catch (error) {
    bWrite.state = 'failed';
    r.failures.push(`fill B: ${messageOf(error)}`);
    return;
  }
  bWrite.sameAsBefore = outcome.sameAsBefore;
  if (outcome.problems.length > 0) {
    bWrite.state = 'failed';
    for (const problem of outcome.problems) r.failures.push(`fill B: ${problem}`);
    return;
  }
  bWrite.state = 'passed';
  log(`${r.label}: bank B filled from the booted image, read back and verified`);

  /* The per-bank boot test for B alone: B holds a marked image of this build, A is erased. */
  const proof = await attempt(r, 'slot boot', () =>
    slotBootProof(rig, reading, r, new Set<BankLetter>(['b']), log),
  );
  if (proof === null) r.bootProof = 'failed';
}

/**
 * The derived upload, proven on the camera (TESTING 42.7; the subject is one the page refused
 * before the derivation). Bank B takes a build-string-marked image through the page; cfg[0] is set
 * to B and the camera must run the marked B. Then bank R takes its own marked image, cfg[0] is set
 * to recovery and the camera must run the marked R. cfg[0] is put back after each boot, and the
 * boot-config block must equal what was saved before the probe. Bank A is never written.
 */
async function runDerivedProbe(
  rig: BenchRig,
  subject: BenchSubject,
  bytes: Uint8Array,
  r: SubjectResult,
  log: (line: string) => void,
): Promise<void> {
  const reading = await attempt(r, 'page read', () => readPage(rig, subject, bytes, r, true));
  if (reading === null) {
    r.notes.push('probe not run: the page read failed');
    return;
  }
  const start = await snapshot(rig, reading.addresses);
  const cfgBefore = bootSlotOf(await readBootWord(rig));
  if (cfgBefore === null) {
    r.bootProof = 'failed';
    r.failures.push(
      'derived: cfg[0] is neither slot A, B nor recovery, so the boot cannot be tested',
    );
    return;
  }
  /* Saved before anything is changed: the restore must reproduce these bytes exactly. */
  const savedBlock = await readFlash(rig, BOOT_CONFIG_ADDRESS, BOOT_CONFIG_BYTES);
  r.notes.push(
    `boot config: cfg[0]=${String(cfgBefore)} (${SLOT_NAME[cfgBefore]}), block saved (sha ${short(sha256(savedBlock))})`,
  );
  const booted = reading.read.banks.find((bank) => bank.booted)?.letter ?? null;
  const source = fallbackSource(reading.images, null, booted);
  const running = (await rig.camera.runningInfo())?.buildString ?? null;
  if (source === null || running === null) {
    r.bootProof = 'failed';
    r.failures.push(
      `derived: ${source === null ? 'no decrypted image to derive from' : 'the camera reports no build string'}`,
    );
    return;
  }
  r.notes.push(
    `derived: the image of bank ${UPPER[source.letter]} (${source.image.name}), running "${running}"`,
  );

  let proven = true;
  for (const [letter, slot] of [
    ['b', 1],
    ['r', 2],
  ] as const) {
    const name = UPPER[letter];
    const marked = rig.patch(source.image.bytes, running, name);
    if (marked === null) {
      r.failures.push(`derived ${name}: the running build string is not in the image`);
      proven = false;
      break;
    }
    const write = writeResultOf(r, letter);
    let outcome: WriteOutcome;
    try {
      outcome = await writeBank(rig, reading, letter, {
        name: `${source.image.name} (derived ${name})`,
        bytes: marked.patched,
      });
    } catch (error) {
      write.state = 'failed';
      r.failures.push(`write ${name}: ${messageOf(error)}`);
      proven = false;
      break;
    }
    write.sameAsBefore = outcome.sameAsBefore;
    if (outcome.problems.length > 0) {
      write.state = 'failed';
      for (const problem of outcome.problems) r.failures.push(`write ${name}: ${problem}`);
      proven = false;
      break;
    }
    write.state = 'passed';
    log(`${r.label}: bank ${name} written with the derived image "${marked.to}", read back`);

    /* The boot test: this bank's cfg, the camera's own build string. cfg[0] is put back below. */
    try {
      await setBootSlotVerified(rig, slot, subject.file);
      await rig.jlink.resetCpu();
      if ((await rig.camera.waitForReboot(RESET_DROP_MS, ENUMERATE_MS)) === null) {
        throw new Error(rebootFailure(RESET_DROP_MS, ENUMERATE_MS));
      }
      const back = (await rig.camera.runningInfo())?.buildString ?? null;
      r.notes.push(
        `derived ${name}: cfg[0]=${String(slot)} (${SLOT_NAME[slot]}), the camera runs "${back ?? 'no report'}"`,
      );
      if (!back?.includes(marked.to)) {
        throw new Error(
          `cfg[0]=${String(slot)} did not run the marked ${name} ("${back ?? 'no report'}")`,
        );
      }
    } catch (error) {
      r.failures.push(`derived ${name}: ${messageOf(error)}`);
      proven = false;
    } finally {
      const restored = await attempt(r, `derived ${name} restore`, async () => {
        await setBootSlotVerified(rig, cfgBefore, subject.file);
        const now = await readFlash(rig, BOOT_CONFIG_ADDRESS, BOOT_CONFIG_BYTES);
        if (sha256(now) !== sha256(savedBlock)) {
          throw new Error(
            `the boot-config block is not the one saved (${describeDifference(now, savedBlock)})`,
          );
        }
        r.notes.push(`derived ${name}: cfg[0] restored to ${String(cfgBefore)}, block as saved`);
      });
      if (restored === null) proven = false;
    }
    if (!proven) break;
  }

  /* Only B and R may change over the probe; A, the bootloader and the boot config may not. */
  await rig.camera.powerCycle();
  if ((await rig.camera.waitForEnumeration(ENUMERATE_MS)) === null) {
    r.failures.push('derived: the camera did not come back on USB after the last power cycle');
    proven = false;
  } else {
    for (const region of regionsChanged(start, await snapshot(rig, reading.addresses), 'bank-b')) {
      if (region === 'bank-r') continue;
      r.failures.push(`derived: ${region} changed over the probe (only B and R may change)`);
      proven = false;
    }
  }
  r.bootProof = proven && r.failures.length === 0 ? 'passed' : 'failed';
}

/** One probe, in place of a subject's full flow (SEEK_BENCH_PROBE). */
export type BenchProbe = 'refuse-b' | 'empty-b' | 'derived';

/**
 * One probe on one subject: the file is checked and the flash brought up as for any subject, then
 * the probe's own steps run. The record has the same shape as a subject's.
 */
export async function runProbe(
  rig: BenchRig,
  subject: BenchSubject,
  probe: BenchProbe,
  log: (line: string) => void,
): Promise<SubjectResult> {
  const r = resultFor(subject);
  log(`${r.label}: probe ${probe}, ${r.file} (${short(subject.sha256)})`);
  const bytes = await subjectBytes(r, subject);
  if (bytes === null) {
    r.notes.push('probe not run: the file is not the one the tree indexed');
    return r;
  }
  if (!(await flashAndBoot(rig, subject, r, log))) return r;
  if (probe === 'refuse-b') await runRefusalProbe(rig, subject, bytes, r, log, 'b');
  else if (probe === 'derived') await runDerivedProbe(rig, subject, bytes, r, log);
  else await runEmptyBankFlow(rig, subject, bytes, r, log);
  return r;
}

export async function runSubject(
  rig: BenchRig,
  subject: BenchSubject,
  log: (line: string) => void,
  slotBoot: boolean = slotBootEnabled(),
): Promise<SubjectResult> {
  const r = resultFor(subject);
  log(
    `${r.label}: ${r.file} (${short(subject.sha256)}), ${subject.fileKind}${slotBoot ? ', slot boot tests on' : ''}`,
  );

  const bytes = await subjectBytes(r, subject);
  if (bytes === null) {
    r.notes.push('steps 1-4 not run: the file is not the one the tree indexed');
    return r;
  }

  /* Step 1: the whole flash, read back, then the CPU reset and the camera on USB. */
  if (!(await flashAndBoot(rig, subject, r, log))) return r;

  /* The 1.3.0.8 FF build has its own write path: R alone, A and B refused (TESTING 42.6). */
  if (isFF1308Subject(subject)) {
    if (slotBoot) {
      r.notes.push(
        'per-bank boot tests not run on the FF build: it writes R alone (its boot proof is the FF one)',
      );
    }
    await attempt(r, 'FF', () => runFF1308(rig, subject, bytes, r, log));
    return r;
  }

  /* Step 2: the page and the J-Link agree on the banks and their dumps. */
  const reading = await attempt(r, 'page read', () => readPage(rig, subject, bytes, r, slotBoot));
  if (reading === null) {
    r.notes.push('steps 3-4 not run: the page read failed');
    return r;
  }
  log(
    `${r.label}: page identified=${String(r.pageIdentified)}, banks match J-Link=${String(r.banksMatch)}`,
  );

  /* Step 3: the bank's own decrypted image into B, then A, then R. A write that
   * was sent and did not check out ends the writes, and the boot proof. */
  const booted = reading.read.banks.find((bank) => bank.booted)?.letter ?? null;
  for (const result of r.slotWrites) {
    const name = UPPER[result.bank];
    let image = reading.images.get(result.bank) ?? null;
    let from: BankLetter | null = null;
    if (image === null && slotBoot) {
      /* Under the boot test a bank with no image of its own (blank, undecryptable, or another
       * build) takes the booted bank's image, so every bank holds a bootable image of this build. */
      const source = fallbackSource(reading.images, result.bank, booted);
      if (source !== null) {
        image = { name: source.image.name, bytes: source.image.bytes };
        from = source.letter;
      }
    }
    if (image === null) {
      /* An empty bank (or one the page cannot decrypt) has no image of its own to write.
       * That is recorded, not failed: the boot proof writes all three banks anyway. */
      result.state = 'skipped';
      result.notes.push("the bank holds no image of its own: its write is the boot proof's");
      r.notes.push(
        `bank ${name}: no image of its own, so no slot write (the boot proof writes it)`,
      );
      continue;
    }
    let outcome: WriteOutcome;
    try {
      outcome = await writeBank(rig, reading, result.bank, image);
    } catch (error) {
      result.state = 'failed';
      r.failures.push(`write ${name}: ${messageOf(error)}`);
      break;
    }
    result.sameAsBefore = outcome.sameAsBefore;
    if (outcome.problems.length > 0) {
      result.state = 'failed';
      for (const problem of outcome.problems) r.failures.push(`write ${name}: ${problem}`);
      break;
    }
    result.state = 'passed';
    if (from !== null) {
      result.notes.push(`written with bank ${UPPER[from]}'s image (it had no image of its own)`);
    }
    log(`${r.label}: bank ${name} written, verified, and read back`);
  }
  if (r.slotWrites.some((result) => result.state === 'failed' || result.state === 'not-run')) {
    r.notes.push('boot proof not run: a slot write did not pass');
    return r;
  }

  if (slotBoot) {
    /* The per-bank boot tests: each written bank alone, the others it names erased. */
    const written = new Set(
      r.slotWrites.filter((result) => result.state === 'passed').map((result) => result.bank),
    );
    const proof = await attempt(r, 'slot boot', () => slotBootProof(rig, reading, r, written, log));
    if (proof === null) r.bootProof = 'failed';
    return r;
  }

  /* Step 4: the patched build, in all three banks, and the camera runs it. */
  const proof = await attempt(r, 'boot proof', () => bootProof(rig, reading, r));
  if (proof === null) r.bootProof = 'failed';
  return r;
}
