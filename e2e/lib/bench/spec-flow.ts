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

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { buildSlotPlan, listProfiles } from '@seek-fw/core';

import { sha256 } from '../checks.js';
import { BENCH_FLASH_BASE, BENCH_FLASH_BYTES, type BenchSubject } from './types.js';
import type {
  BankLetter,
  BankView,
  BenchPage,
  BenchRig,
  PageDump,
  PageImage,
  PageRead,
} from './spec-rig.js';

/** One 64 KiB bank read, the unit the page's Dump saves. */
export const BANK_BYTES = 0x10000;
/** The boot-config block (64 KiB) and the bootloader block (64 KiB), both checked unchanged. */
export const BOOT_CONFIG_ADDRESS = 0x14010000;
export const BOOTLOADER_ADDRESS = 0x14000000;
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

const UPPER: Readonly<Record<BankLetter, string>> = { a: 'A', b: 'B', r: 'R' };

export type StepState = 'passed' | 'failed' | 'skipped' | 'not-run';

export interface SlotWriteResult {
  readonly bank: BankLetter;
  state: StepState;
  /** Whether the bank's bytes before the write equal the bytes the J-Link reads after it. */
  sameAsBefore: boolean | null;
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
  readonly notes: string[];
  readonly failures: string[];
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

interface Reading {
  readonly read: PageRead;
  /** Each bank's own decrypted image, as the page's Dump saved it (null: the page could not decrypt it). */
  readonly images: ReadonlyMap<BankLetter, PageImage | null>;
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
        r.failures.push(
          `page: bank ${UPPER[bank.letter]} reports ${bank.version}, the subject is ${subject.version}`,
        );
      }
    }
    const booted = read.banks.filter((bank) => bank.booted).length;
    r.pageIdentified =
      layout !== undefined &&
      read.runningBuild === subject.version &&
      booted === 1 &&
      read.banks.every((bank) => bank.version === null || bank.version === subject.version);

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
): Promise<Reading> {
  const { read, dumps } = await readWindow(rig, subject, r);
  const addresses: Record<BankLetter, number> = {
    a: addressOf(read.banks, 'a'),
    b: addressOf(read.banks, 'b'),
    r: addressOf(read.banks, 'r'),
  };
  const images = new Map<BankLetter, PageImage | null>();
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
    if (dump.decrypted === null || dump.decryptedName === null) {
      images.set(bank.letter, null);
      r.notes.push(
        `bank ${name}: the page cannot decrypt it, so there is no image of its own to write`,
      );
    } else {
      images.set(bank.letter, { name: dump.decryptedName, bytes: dump.decrypted });
    }
  }
  r.banksMatch = allMatch;
  return { read, images, addresses };
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
    const written = await page.write(letter, image, acknowledge);
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
  } else if (!sameAsWritten(dump.decrypted, image.bytes)) {
    problems.push(
      `bank ${name}: the read-back decrypts to ${short(sha256(dump.decrypted))}, not the image written ${short(sha256(image.bytes))}`,
    );
  }

  const after = await snapshot(rig, reading.addresses);
  for (const [region, was] of before) {
    if (region === `bank-${letter}`) continue;
    const now = after.get(region) ?? null;
    if (was === null || now === null) continue;
    if (sha256(was) !== sha256(now))
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

/** Runs the whole flow for one subject. Never throws: every failure lands in the result. */
export async function runSubject(
  rig: BenchRig,
  subject: BenchSubject,
  log: (line: string) => void,
): Promise<SubjectResult> {
  const r: SubjectResult = {
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
    notes: [],
    failures: [],
  };
  log(`${r.label}: ${r.file} (${short(subject.sha256)}), ${subject.fileKind}`);

  /* Nothing touches the bench until the file is the one the tree indexed. */
  const bytes = await attempt(r, 'file', () => {
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
  if (bytes === null) {
    r.notes.push('steps 1-4 not run: the file is not the one the tree indexed');
    return r;
  }

  /* Step 1: the whole flash, read back, then the CPU reset and the camera on USB. */
  const flashed = await attempt(r, 'flash', async () => {
    await rig.jlink.flashFull(subject.file);
    await verifyFlash(rig, subject.sha256, r);
    r.flashVerified = true;
    log(`${r.label}: flashed and verified, resetting the CPU`);
    await rig.jlink.resetCpu();
  });
  if (flashed === null) {
    r.notes.push('steps 2-4 not run: the flash, its read-back, or the reset failed');
    return r;
  }
  const enumerated = await rig.camera.waitForReboot(RESET_DROP_MS, ENUMERATE_MS);
  r.enumerated = enumerated !== null;
  r.enumerateMs = enumerated;
  if (enumerated === null) {
    r.failures.push(rebootFailure(RESET_DROP_MS, ENUMERATE_MS));
    r.notes.push('steps 2-4 not run: the camera is not on the bus');
    return r;
  }
  log(`${r.label}: enumerated after ${String(enumerated)} ms`);

  /* Step 2: the page and the J-Link agree on the banks and their dumps. */
  const reading = await attempt(r, 'page read', () => readPage(rig, subject, bytes, r));
  if (reading === null) {
    r.notes.push('steps 3-4 not run: the page read failed');
    return r;
  }
  log(
    `${r.label}: page identified=${String(r.pageIdentified)}, banks match J-Link=${String(r.banksMatch)}`,
  );

  /* Step 3: the bank's own decrypted image into B, then A, then R. A write that
   * was sent and did not check out ends the writes, and the boot proof. */
  for (const result of r.slotWrites) {
    const name = UPPER[result.bank];
    const image = reading.images.get(result.bank) ?? null;
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
    log(`${r.label}: bank ${name} written, verified, and read back`);
  }
  if (r.slotWrites.some((result) => result.state === 'failed' || result.state === 'not-run')) {
    r.notes.push('boot proof not run: a slot write did not pass');
    return r;
  }

  /* Step 4: the patched build, in all three banks, and the camera runs it. */
  const proof = await attempt(r, 'boot proof', () => bootProof(rig, reading, r));
  if (proof === null) r.bootProof = 'failed';
  return r;
}
