/* ==================================================================== *
 * Which application the camera runs on 1.3.0.8 (`runningApplicationOf`, slots/running.ts),
 * decided from the camera's own per-bank answers (GetFirmwareInfo selectors 6, 7, 8) and the
 * bank bytes the page read. No camera here: every fixture is synthetic, and each build's
 * prediction is taken from its own source's check (TESTING.md 42.12).
 *
 *   8 Hz  image_sum_ok:      magic, length < 0x10000, PLAIN word sum over the header length is 0.
 *   16 Hz image_sum_ok_r32k: the same guards, and the sum of (word XOR Key B, header window verbatim) is 0xFFFF.
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { hexToBytes } from '../../src/bytes.js';
import { wordSum32 } from '../../src/image/bank.js';
import {
  IMAGE_MAGIC,
  LENGTH_OFFSET,
  parseImageHeader,
  type ImageHeader,
} from '../../src/image/header.js';
import {
  KEY_PAIRS,
  keyWordsOf,
  keystream,
  xorWindowVerbatim,
} from '../../src/preservation/patch.js';
import { getProfile } from '../../src/profiles/registry.js';
import { stageFFVendor } from '../../src/slots/ff-form.js';
import { buildSlotPlan } from '../../src/slots/capability.js';
import { imageBuildWarningOf } from '../../src/slots/image-build.js';
import { ffBankVerdict, plainBankVerdict, runningApplicationOf } from '../../src/slots/running.js';
import type { SlotKey } from '../../src/slots/types.js';
import { prepareSlotFlash } from '../../src/slots/write.js';
import type { BankVerdicts, DeviceState, SlotState } from '../../src/workflows/types.js';

import { reportFor } from './write-fixtures.js';

const legacy = getProfile('legacy-auth');
const BANK = 0x10000;
const VERSION_1308 = 0x08000301;
const VERSION_OFFSET = 0x200 + 12;
const PLAIN_LENGTH = 0x6000;
const FF_LENGTH = 0x6000;
const ADJUST = 142;

function prng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s & 0xff;
  };
}

/** An 8 Hz plain image: header stamped, the plain word sum over the header length balanced to 0 at word 142. */
function plainImage(length: number, seed: number): Uint8Array {
  const next = prng(seed);
  const out = new Uint8Array(length);
  for (let i = 0; i < length; i++) out[i] = next();
  const dv = new DataView(out.buffer);
  dv.setUint32(0x200, IMAGE_MAGIC, true);
  dv.setUint32(LENGTH_OFFSET, length, true);
  dv.setUint32(VERSION_OFFSET, VERSION_1308, true);
  dv.setUint32(ADJUST * 4, 0, true);
  dv.setUint32(ADJUST * 4, (0 - wordSum32(out, length)) >>> 0, true);
  return out;
}

/** A 16 Hz FF image as a file is: magic, length, the key pair once each, word 142 solved to a plain sum of 0xFFFF. */
function ffFileImage(seed: number): Uint8Array {
  const next = prng(seed);
  const out = new Uint8Array(FF_LENGTH);
  for (let i = 0; i < out.length; i++) out[i] = next();
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x10001000, true);
  dv.setUint32(4, 0x10000101, true);
  dv.setUint32(0x200, IMAGE_MAGIC, true);
  dv.setUint32(LENGTH_OFFSET, FF_LENGTH, true);
  dv.setUint32(VERSION_OFFSET, VERSION_1308, true);
  out.set(hexToBytes(KEY_PAIRS.ff1308.block0), 0x3000);
  out.set(hexToBytes(KEY_PAIRS.ff1308.block1), 0x3100);
  dv.setUint32(ADJUST * 4, 0, true);
  dv.setUint32(ADJUST * 4, (0xffff - wordSum32(out, out.length)) >>> 0, true);
  return out;
}

/** The FF app's stored form of the image: image XOR Key B, header verbatim (what its commit leaves in the bank). */
function ffStored(image: Uint8Array): Uint8Array {
  return stageFFVendor(image).stored;
}

/** The earlier page's stored form: the plain image with word 142 solved against Key B, so its device-seeded sum is 0xFFFF. */
function oldPageStored(image: Uint8Array): Uint8Array {
  const words = image.length >> 2;
  const ksD = keystream(keyWordsOf(KEY_PAIRS.ff1308.block1), words);
  const out = image.slice();
  const dv = new DataView(out.buffer);
  dv.setUint32(ADJUST * 4, 0, true);
  const base = wordSum32(xorWindowVerbatim(out, ksD), out.length);
  dv.setUint32(ADJUST * 4, (0xffff - base) >>> 0, true);
  return out;
}

/** A bank as the analysis reads it: the image at the front, 0xFF after it, its header parsed. */
function presentBank(key: SlotKey, image: Uint8Array): SlotState {
  const raw = new Uint8Array(BANK).fill(0xff);
  raw.set(image, 0);
  const header: ImageHeader | null = parseImageHeader(raw);
  return {
    key,
    name: `slot ${key}`,
    subcmd: null,
    address: 0,
    present: true,
    reason: null,
    unread: false,
    header,
    raw,
    footer: null,
    recovered: null,
    plain: null,
    plainHeader: header,
    accepts: false,
    footerOk: false,
    sha256: null,
    keyName: null,
    bootable: false,
    bootability: 'not-bootable',
  };
}

/** A bank holding no image: an erased bank, read clean. */
function emptyBank(key: SlotKey): SlotState {
  const raw = new Uint8Array(BANK).fill(0xff);
  return {
    key,
    name: `slot ${key}`,
    subcmd: null,
    address: 0,
    present: false,
    reason: 'no image header (magic 0xffffffff)',
    blank: true,
    unread: false,
    header: null,
    raw,
    footer: null,
    recovered: null,
    plain: null,
    plainHeader: null,
    accepts: false,
    footerOk: false,
    sha256: null,
    keyName: null,
    bootable: false,
    bootability: 'not-bootable',
  };
}

function unreadBank(key: SlotKey): SlotState {
  return { ...emptyBank(key), raw: null, unread: true, blank: false, reason: 'not read' };
}

function stateOf(
  slots: readonly SlotState[],
  bankVerdicts: BankVerdicts | null,
  version: string | null = '1.3.0.8',
): DeviceState {
  const byKey = new Map(slots.map((s) => [s.key, s]));
  return {
    version,
    serial: 'TESTSERIAL',
    cfg0: 0,
    profile: legacy,
    slots,
    byKey,
    boot: null,
    keyTable: null,
    keyWhiteningK: legacy.cipher.whiteningK,
    storeKey: { name: 'Key B', key: null, programmed: false },
    deviceKeySlot: null,
    bankWriteRefusals: [],
    bankVerdicts,
  } as unknown as DeviceState;
}

const EIGHT_HZ_BANKS = [
  presentBank('a', plainImage(PLAIN_LENGTH, 31)),
  emptyBank('b'),
  presentBank('r', plainImage(PLAIN_LENGTH, 31)),
];
/** The answers the 8 Hz build gives for those banks: A 1, B 0, R 1. */
const EIGHT_HZ_ANSWERS: BankVerdicts = { a: 1, b: 0, r: 1 };

describe('the verdict each build predicts for one bank (its own check, slots/running.ts)', () => {
  const plain = plainImage(PLAIN_LENGTH, 41);
  const ff = ffFileImage(43);

  it('the 8 Hz plain image: the 8 Hz build accepts it, the 16 Hz build refuses', () => {
    expect(plainBankVerdict(pad(plain))).toBe(1);
    expect(ffBankVerdict(pad(plain))).toBe(0);
  });

  it('the FF image as a file (plain, sum 0xFFFF): neither build accepts it', () => {
    expect(plainBankVerdict(pad(ff))).toBe(0);
    expect(ffBankVerdict(pad(ff))).toBe(0);
  });

  it('the FF app’s stored form (image XOR Key B): the 16 Hz build accepts it, the 8 Hz build refuses', () => {
    expect(plainBankVerdict(pad(ffStored(ff)))).toBe(0);
    expect(ffBankVerdict(pad(ffStored(ff)))).toBe(1);
  });

  it('the earlier page’s stored form (plain, word 142 solved against Key B): the 16 Hz build accepts it', () => {
    expect(plainBankVerdict(pad(oldPageStored(ff)))).toBe(0);
    expect(ffBankVerdict(pad(oldPageStored(ff)))).toBe(1);
  });

  it('an erased bank: both refuse', () => {
    const erased = new Uint8Array(BANK).fill(0xff);
    expect(plainBankVerdict(erased)).toBe(0);
    expect(ffBankVerdict(erased)).toBe(0);
  });

  it('a bank whose header length is 64 KiB or more: both refuse, as the camera does', () => {
    const big = plain.slice();
    new DataView(big.buffer).setUint32(LENGTH_OFFSET, 0x10000, true);
    expect(plainBankVerdict(pad(big))).toBe(0);
    expect(ffBankVerdict(pad(big))).toBe(0);
  });
});

function pad(image: Uint8Array): Uint8Array {
  const out = new Uint8Array(BANK).fill(0xff);
  out.set(image, 0);
  return out;
}

describe('runningApplicationOf: the camera’s answers decide the build', () => {
  it('the 8 Hz build: its answers match the plain prediction and not the FF one', () => {
    const app = runningApplicationOf(stateOf(EIGHT_HZ_BANKS, EIGHT_HZ_ANSWERS));
    expect(app.build).toBe('plain');
    expect(app.camera).toEqual(EIGHT_HZ_ANSWERS);
    expect(app.predicted.plain).toEqual(EIGHT_HZ_ANSWERS);
    expect(app.predicted.ff).toEqual({ a: 0, b: 0, r: 0 });
  });

  it('the 16 Hz build with its stored form in R: its answers match the FF prediction', () => {
    const ff = ffFileImage(51);
    const banks = [emptyBank('a'), emptyBank('b'), presentBank('r', ffStored(ff))];
    const app = runningApplicationOf(stateOf(banks, { a: 0, b: 0, r: 1 }));
    expect(app.build).toBe('ff-1308');
    expect(app.predicted.ff).toEqual({ a: 0, b: 0, r: 1 });
  });

  it('the 16 Hz build with its stored form in A: the FF answers name it', () => {
    const ff = ffFileImage(53);
    const banks = [
      presentBank('a', ffStored(ff)),
      emptyBank('b'),
      presentBank('r', plainImage(PLAIN_LENGTH, 54)),
    ];
    const app = runningApplicationOf(stateOf(banks, { a: 1, b: 0, r: 0 }));
    expect(app.build).toBe('ff-1308');
  });

  it('a camera whose banks hold only the FF file in the clear cannot be told apart: unknown, and why', () => {
    const ff = ffFileImage(55);
    const banks = [emptyBank('a'), emptyBank('b'), presentBank('r', ff)];
    const app = runningApplicationOf(stateOf(banks, { a: 0, b: 0, r: 0 }));
    expect(app.build).toBeNull();
    expect(app.why).toMatch(/do not tell them apart/);
  });

  it('answers that match neither build are unknown, never a guess', () => {
    const app = runningApplicationOf(stateOf(EIGHT_HZ_BANKS, { a: 0, b: 1, r: 0 }));
    expect(app.build).toBeNull();
    expect(app.why).toMatch(/matches neither build/);
  });

  it('no answers (the selectors were not read): unknown', () => {
    const app = runningApplicationOf(stateOf(EIGHT_HZ_BANKS, null));
    expect(app.build).toBeNull();
    expect(app.why).toMatch(/did not answer/);
  });

  it('a partial answer (one selector not read): unknown', () => {
    const app = runningApplicationOf(stateOf(EIGHT_HZ_BANKS, { a: 1, b: 0, r: null }));
    expect(app.build).toBeNull();
  });

  it('a bank the verdicts depend on was not read: unknown', () => {
    const banks = [
      presentBank('a', plainImage(PLAIN_LENGTH, 61)),
      unreadBank('b'),
      presentBank('r', plainImage(PLAIN_LENGTH, 61)),
    ];
    const app = runningApplicationOf(stateOf(banks, EIGHT_HZ_ANSWERS));
    expect(app.build).toBeNull();
    expect(app.why).toMatch(/was not read/);
  });

  it('an erased bank read clean, which keeps no bytes past its header window, answers both builds 0 and does not block the decision', () => {
    const erased = { ...emptyBank('b'), raw: null };
    const banks = [
      presentBank('a', plainImage(PLAIN_LENGTH, 31)),
      erased,
      presentBank('r', plainImage(PLAIN_LENGTH, 31)),
    ];
    const app = runningApplicationOf(stateOf(banks, EIGHT_HZ_ANSWERS));
    expect(app.build).toBe('plain');
    expect(app.predicted.plain).toEqual(EIGHT_HZ_ANSWERS);
    expect(app.predicted.ff).toEqual({ a: 0, b: 0, r: 0 });
  });

  it('another version is not decided here: the two builds share 1.3.0.8 only', () => {
    const app = runningApplicationOf(stateOf(EIGHT_HZ_BANKS, EIGHT_HZ_ANSWERS, '1.3.0.0'));
    expect(app.build).toBeNull();
  });
});

describe('prepareSlotFlash: the FF image follows the running build', () => {
  const plan = buildSlotPlan(legacy, '1.3.0.8');
  const image = ffFileImage(71);
  const write = { kind: 'plain' as const, bytes: image, fileName: 'compact-16hz.bin' };
  const ff16Banks = (): SlotState[] => [
    emptyBank('a'),
    emptyBank('b'),
    presentBank('r', ffStored(image)),
  ];
  const ff16Answers: BankVerdicts = { a: 0, b: 0, r: 1 };
  const unknownBanks = (): SlotState[] => [emptyBank('a'), emptyBank('b'), presentBank('r', image)];
  const unknownAnswers: BankVerdicts = { a: 0, b: 0, r: 0 };

  /* The owner's rule (2026-10-27, "turn into warnings"): each outcome is planned, and its warning says what is
   * expected before the confirm (write.ts ffCommitOf). */
  it('plans the FF image for any bank on the 8 Hz build, and warns the camera is expected to refuse it at commit', () => {
    const report = reportFor(stateOf(EIGHT_HZ_BANKS, EIGHT_HZ_ANSWERS), plan);
    for (const key of ['a', 'b', 'r'] as const) {
      const planned = prepareSlotFlash(report, key, write);
      expect(planned.ffCommit).toBe('refuses');
      expect(planned.staging).toBe('key-a-keystream');
    }
    const text = prepareSlotFlash(report, 'a', write).warnings.join('\n');
    expect(text).toMatch(/The camera runs the 8 Hz 1\.3\.0\.8 build: the camera answers/);
    expect(text).toMatch(
      /expected to refuse this write before it writes anything \(a camera running that build refused an earlier form of this image the same way\)/,
    );
    /* In words: no status code, no word sum, no section a person cannot follow (TESTING.md 42.110). */
    expect(text).not.toMatch(/0x00070100|word sum|TESTING/);
    /* Nothing claims the boot of a bank the camera is expected not to write. */
    expect(text).not.toMatch(/UNTESTED/);
    /* The 8 Hz build's check fails this payload: the plain word sum of the vendor form is not 0. */
    expect(plainBankVerdict(prepareSlotFlash(report, 'a', write).payload)).toBe(0);
  });

  it('plans it when the camera’s answers cannot say which build runs, and says which outcome follows from which build', () => {
    const report = reportFor(stateOf(unknownBanks(), unknownAnswers), plan);
    const planned = prepareSlotFlash(report, 'a', write);
    expect(planned.ffCommit).toBe('build-unknown');
    const text = planned.warnings.join('\n');
    expect(text).toMatch(/The camera's own answers do not say which 1\.3\.0\.8 build it runs: /);
    expect(text).toMatch(/If it runs the 16 Hz FF build, it takes this payload\./);
    expect(text).toMatch(
      /If it runs the 8 Hz build, that build checks a payload before it erases a bank, and this payload fails that check, so it is expected to refuse this write before it writes anything/,
    );
    expect(text).toMatch(/UNTESTED/);
    expect(text).not.toMatch(/0x00070100|TESTING|corpus/);
    expect(text).not.toMatch(/You said|confirm/);
  });

  it('plans it, with no refusal, when the camera’s own answers name the 16 Hz build (A, B and R all allowed)', () => {
    for (const key of ['a', 'b', 'r'] as const) {
      const banks = ff16Banks();
      const report = reportFor(stateOf(banks, ff16Answers), plan);
      const planned = prepareSlotFlash(report, key, write);
      expect(planned.ffCommit).toBe('takes');
      expect(planned.staging).toBe('key-a-keystream');
      expect(planned.storedForm).toBe('key-b-ciphertext');
      expect(planned.warnings.join('\n')).toMatch(/UNTESTED/);
      /* The camera's own answer is the basis, not a risk: a note of this write (TESTING.md 42.88). */
      expect(
        planned.notes.some(
          (note) =>
            note.source === 'write' &&
            note.text.includes('own answers say it runs the 16 Hz FF build'),
        ),
      ).toBe(true);
      expect(planned.warnings.join('\n')).not.toMatch(/own answers say it runs/);
    }
  });

  it('predicts the bank as the image XOR Key B, the payload as the image XOR Key A', () => {
    const report = reportFor(stateOf(ff16Banks(), ff16Answers), plan);
    const planned = prepareSlotFlash(report, 'b', write);
    const staged = stageFFVendor(image);
    expect(planned.payload.subarray(0, staged.staged.length)).toEqual(staged.staged);
    expect(planned.expectedStored?.subarray(0, staged.stored.length)).toEqual(staged.stored);
  });

  it('a raw payload in the vendor form is warned of on the running build the same way, before the raw warning', () => {
    const report = reportFor(stateOf(EIGHT_HZ_BANKS, EIGHT_HZ_ANSWERS), plan);
    const raw = {
      kind: 'raw' as const,
      bytes: stageFFVendor(image).staged,
      fileName: 'vendor.bin',
    };
    const planned = prepareSlotFlash(report, 'a', raw);
    expect(planned.ffCommit).toBe('refuses');
    expect(planned.warnings[0]).toMatch(/The camera runs the 8 Hz 1\.3\.0\.8 build/);
    expect(planned.warnings[1]).toMatch(/^Raw payload: sent exactly as given/);
  });

  it('a camera on another version: the image’s build warning says the versions, the next warning what follows', () => {
    const report = reportFor(
      stateOf(EIGHT_HZ_BANKS, EIGHT_HZ_ANSWERS, '1.3.0.0'),
      buildSlotPlan(legacy, '1.3.0.0'),
    );
    const planned = prepareSlotFlash(report, 'b', write);
    /* TESTING.md 42.109: the 1.3.0.0 Compact took this payload at commit (status 0) and kept it as sent. */
    expect(planned.ffCommit).toBe('programs-as-sent');
    expect(planned.imageBuild?.code).toBe('other-version');
    expect(planned.warnings[0]).toBe('This image is firmware 1.3.0.8; the camera runs 1.3.0.0.');
    /* In words (TESTING.md 42.110): what was measured, not where; no key name, no word sum. */
    expect(planned.warnings[1]).toBe(
      'The 16 Hz FF image is sent in the form only the 16 Hz 1.3.0.8 build reads. This camera writes a ' +
        'bank without checking the image (its firmware source says so, and a 1.3.0.0 Compact did so when ' +
        'tried), so it is expected to write the bytes as they are sent: the bank then holds the image in ' +
        'a form this camera cannot start.',
    );
    /* The plan predicts the payload as the bank's bytes, so the read-back of such a write verifies. */
    expect(planned.storedForm).toBeUndefined();
    expect(planned.expectedStored?.subarray(0, planned.payload.length)).toEqual(planned.payload);
    expect(planned.warnings.join('\n')).not.toMatch(/0x00070100|UNTESTED/);
    /* One statement: "has not been checked" is not said a second time by the version warning. */
    expect(planned.warnings.join('\n')).not.toMatch(/has not been checked/);
  });
});

describe('the 8 Hz 1.3.0.8 image against the build the camera runs: warned, never refused (TESTING.md 42.104)', () => {
  /** The 16 Hz build answering for its stored form in A, with an 8 Hz image in R (so a bank is stored plain). */
  const ffBanks = [
    presentBank('a', ffStored(ffFileImage(71))),
    emptyBank('b'),
    presentBank('r', plainImage(PLAIN_LENGTH, 72)),
  ];
  const ffAnswers: BankVerdicts = { a: 1, b: 0, r: 0 };
  /* An image the writer takes: an SRAM stack pointer and a Thumb reset vector (the stager balances the sum). */
  const image = plainImage(PLAIN_LENGTH, 73);
  new DataView(image.buffer).setUint32(0, 0x10001000, true);
  new DataView(image.buffer).setUint32(4, 0x10000101, true);

  it('the camera runs the 8 Hz build: no warning', () => {
    expect(
      imageBuildWarningOf(image, stateOf(EIGHT_HZ_BANKS, EIGHT_HZ_ANSWERS), 'plain-chain'),
    ).toBeNull();
  });

  it('the camera runs the 16 Hz FF build: the warning names both builds, and the plan still stages the image plain', () => {
    const state = { ...stateOf(ffBanks, ffAnswers), plainChain: true } as DeviceState;
    expect(runningApplicationOf(state).build).toBe('ff-1308');
    const report = reportFor(state, buildSlotPlan(legacy, '1.3.0.8'));
    const plan = prepareSlotFlash(report, 'b', {
      kind: 'plain',
      bytes: image,
      fileName: '8hz.bin',
    });
    expect(plan.staging).toBe('plain');
    expect(plan.imageBuild).toEqual({
      code: 'other-build',
      image: '1.3.0.8 8 Hz',
      camera: '1.3.0.8 16 Hz FF',
      text:
        'This image is the 8 Hz 1.3.0.8 build; the camera runs the 16 Hz 1.3.0.8 FF build. The 16 Hz ' +
        'build checks a payload against its own FF form when it is committed and refuses one that ' +
        'fails, before it erases the bank (from its source). Writing the 8 Hz build to it has not ' +
        'been tried on a camera.',
    });
    expect(plan.warnings[0]).toBe(plan.imageBuild?.text);
  });

  it('the camera’s answers do not say which build runs: the build cannot be told, so it warns (the choice: warn)', () => {
    const state = stateOf(EIGHT_HZ_BANKS, null);
    expect(runningApplicationOf(state).build).toBeNull();
    expect(imageBuildWarningOf(image, state, 'plain-chain')).toEqual({
      code: 'running-build-unknown',
      image: '1.3.0.8 8 Hz',
      camera: '1.3.0.8',
      text:
        'This image is the 8 Hz 1.3.0.8 build. The camera runs 1.3.0.8, which comes as an 8 Hz and a ' +
        '16 Hz FF build, and its own answers did not say which one it runs, so whether this is its ' +
        'build cannot be told.',
    });
  });

  it('the FF image is not held against the running build here: the writer says its outcome (write.ts ffCommitOf)', () => {
    expect(
      imageBuildWarningOf(ffFileImage(74), stateOf(EIGHT_HZ_BANKS, null), 'ff-vendor'),
    ).toBeNull();
  });

  it('another version on a 1.3.0.8 camera: what follows is the chain’s only while the 8 Hz build runs', () => {
    const older = plainImage(PLAIN_LENGTH, 75);
    older.set([1, 3, 0, 0], 0x20c);
    const eightHz = imageBuildWarningOf(
      older,
      stateOf(EIGHT_HZ_BANKS, EIGHT_HZ_ANSWERS),
      'plain-chain',
    );
    expect(eightHz?.code).toBe('other-version');
    expect(eightHz?.text).toContain('so it takes this image, and when it starts from this bank');
    const sixteenHz = imageBuildWarningOf(older, stateOf(ffBanks, ffAnswers), 'plain-chain');
    expect(sixteenHz?.text).toBe(
      'This image is firmware 1.3.0.0; the camera runs 1.3.0.8. Whether this camera takes a ' +
        'different build, and runs it, has not been checked.',
    );
  });
});
