/* ==================================================================== *
 * Which application the camera RUNS, on the 1.3.0.8 build: the 8 Hz plain build or the
 * 16 Hz FF build. Both report the one version string 1.3.0.8, and the FF image is staged in
 * a form only the FF build accepts (ff-form.ts), so the page needs the answer before it sends.
 *
 * THE CAMERA ANSWERS, bank by bank. GetFirmwareInfo selectors 6, 7 and 8 return one byte each:
 * whether the application that answers takes the bank at 0x14050000 (A), 0x14060000 (B) and
 * 0x14070000 (R). Each build's check is in its own source:
 *   8 Hz  image_sum_ok (compact_8hz_1_3_0_8/src/rpc_cmds.c cases 6/7/8, src/crypto.c): the
 *         magic at 0x200, a length under 0x10000, and the PLAIN word sum over the header length is 0.
 *   16 Hz image_sum_ok_r32k (compact_ff_16hz_1_3_0_8/src/rpc_cmds.c cases 6/7/8, src/crypto.c,
 *         the device-seeded walk): the same guards, and the word sum of the bank, each word XOR
 *         the Key B keystream outside the header window 0x200..0x23F, is 0xFFFF.
 * The page computes each build's three bytes from the bank bytes it read. The camera's three
 * bytes decide: they must equal exactly one build's. Otherwise the build is unknown, and the FF
 * write needs the user's own word (write.ts). TESTING.md 42.12 has the measured bytes.
 * ==================================================================== */

import { viewOf } from '../bytes.js';
import { wordSum32 } from '../image/bank.js';
import { HEADER_OFFSET, IMAGE_MAGIC, LENGTH_OFFSET } from '../image/header.js';
import type { FirmwareProfile, SlotKey } from '../profiles/types.js';
import { keystream, keyWordsOf, KEY_PAIRS, xorWindowVerbatim } from '../preservation/patch.js';
import type { BankVerdicts, DeviceState } from '../workflows/types.js';
import { classifyBuild, FF_1308_VERSION } from './capability-family.js';
import { FF_ACCEPT_SUM } from './ff-form.js';

/** The camera's answer for one bank, from a page-side prediction: 1 accepts, 0 refuses. */
export type Verdict = 0 | 1;

/** The header length a bank's image declares, when the bank holds one, else null. */
function declaredLength(bank: Uint8Array): number | null {
  if (bank.length < HEADER_OFFSET + 4 + 4) return null;
  const dv = viewOf(bank);
  if (dv.getUint32(HEADER_OFFSET, true) !== IMAGE_MAGIC) return null;
  const length = dv.getUint32(LENGTH_OFFSET, true);
  return length < 0x10000 ? length : null;
}

/**
 * The 8 Hz build's answer for a bank (`image_sum_ok`): the magic, a length under 64 KiB, and
 * the plain word sum over the header length is 0. Null when the bank cannot be walked.
 */
export function plainBankVerdict(bank: Uint8Array): Verdict | null {
  const length = declaredLength(bank);
  if (length === null) return bank.length < HEADER_OFFSET + 8 ? null : 0;
  const words = length >>> 2;
  if (words * 4 > bank.length) return null;
  return wordSum32(bank, words * 4) === 0 ? 1 : 0;
}

/**
 * The 16 Hz FF build's answer for a bank (`image_sum_ok_r32k`, the device-seeded walk): the same
 * guards, and the word sum of (word XOR the Key B keystream, header window verbatim) is 0xFFFF.
 * Null when the bank cannot be walked.
 */
export function ffBankVerdict(bank: Uint8Array): Verdict | null {
  const length = declaredLength(bank);
  if (length === null) return bank.length < HEADER_OFFSET + 8 ? null : 0;
  const words = length >>> 2;
  if (words * 4 > bank.length) return null;
  const walked = xorWindowVerbatim(
    bank.subarray(0, words * 4),
    keystream(keyWordsOf(KEY_PAIRS.ff1308.block1), words),
  );
  return wordSum32(walked, words * 4) === FF_ACCEPT_SUM ? 1 : 0;
}

export interface RunningApplication {
  /**
   * The build the camera runs: 'plain' (the 8 Hz 1.3.0.8 build), 'ff-1308' (the 16 Hz FF build),
   * or null when the camera's bytes do not decide it.
   */
  readonly build: 'plain' | 'ff-1308' | null;
  /** What decided it, as a sentence the page and the CLI can carry. */
  readonly why: string;
  /** The camera's own answers for A, B and R (selectors 6, 7, 8), or null when not read. */
  readonly camera: BankVerdicts | null;
  /** Each build's predicted answers from the bank bytes the page read, or null where a bank was not read. */
  readonly predicted: { readonly plain: BankVerdicts | null; readonly ff: BankVerdicts | null };
}

const KEYS: readonly SlotKey[] = ['a', 'b', 'r'];

/** One build's three answers from the page's bank reads, or null when a bank the answer needs was not read. */
function predicted(
  state: DeviceState,
  verdict: (bank: Uint8Array) => Verdict | null,
): BankVerdicts | null {
  const out: Record<SlotKey, Verdict | null> = { a: null, b: null, r: null };
  for (const key of KEYS) {
    const slot = state.byKey.get(key);
    if (slot === undefined || slot.unread || !slot.raw) return null;
    const answer = verdict(slot.raw);
    if (answer === null) return null;
    out[key] = answer;
  }
  return out;
}

function sameAnswers(a: BankVerdicts, b: BankVerdicts): boolean {
  return a.a === b.a && a.b === b.b && a.r === b.r;
}

function triple(v: BankVerdicts | null): string {
  if (v === null) return 'not known';
  return `A ${String(v.a)}, B ${String(v.b)}, R ${String(v.r)}`;
}

/**
 * The application the camera runs, from its own per-bank answers. Pure; nothing is sent. Unknown
 * (never a guess) when the camera did not answer the selectors, a bank was not read, or the two
 * builds would answer the same bytes for these banks.
 */
export function runningApplicationOf(state: DeviceState): RunningApplication {
  const predictions = {
    plain: predicted(state, plainBankVerdict),
    ff: predicted(state, ffBankVerdict),
  };
  const camera = state.bankVerdicts ?? null;
  const unknown = (why: string): RunningApplication => ({
    build: null,
    why,
    camera,
    predicted: predictions,
  });
  if (state.version !== FF_1308_VERSION) {
    return unknown(
      `the camera reports ${state.version ?? 'no version'}, and only ${FF_1308_VERSION} has two builds`,
    );
  }
  if (camera === null || camera.a === null || camera.b === null || camera.r === null) {
    return unknown('the camera did not answer the bank verdicts (GetFirmwareInfo selectors 6, 7, 8)');
  }
  if (predictions.plain === null || predictions.ff === null) {
    return unknown('a bank the verdicts depend on was not read, so the answers cannot be predicted');
  }
  const plainMatch = sameAnswers(camera, predictions.plain);
  const ffMatch = sameAnswers(camera, predictions.ff);
  const answers = `the camera answers ${triple(camera)}`;
  if (plainMatch && !ffMatch) {
    return {
      build: 'plain',
      why: `${answers}, which is what the 8 Hz 1.3.0.8 build answers for these banks (${triple(predictions.plain)})`,
      camera,
      predicted: predictions,
    };
  }
  if (ffMatch && !plainMatch) {
    return {
      build: 'ff-1308',
      why: `${answers}, which is what the 16 Hz FF 1.3.0.8 build answers for these banks (${triple(predictions.ff)})`,
      camera,
      predicted: predictions,
    };
  }
  if (plainMatch && ffMatch) {
    return unknown(
      `${answers}, and both builds answer exactly that for these banks, so the banks do not tell them apart`,
    );
  }
  return unknown(
    `${answers}, which matches neither build (8 Hz: ${triple(predictions.plain)}; 16 Hz FF: ${triple(predictions.ff)})`,
  );
}

/**
 * Whether this build is on the 2014 plaintext chain, where the page's booted bank comes from
 * the camera's active-slot word and recovery R can run instead (device-info.ts `chainReplay`).
 */
export function onPlaintextChain(profile: FirmwareProfile, version: string | null): boolean {
  return classifyBuild(profile, version).family === 'locked-plain';
}
