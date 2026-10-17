/* ==================================================================== *
 * The 1.3.0.8 FF (16 Hz) vendor-form run on the bench (TESTING 42.12).
 *
 * The platform: the whole flash is the 1.3.0.8 8 Hz dump; the FF app (plain image, 49,308 B)
 * is loaded into recovery R with the J-Link (`writeBank`), A and B are erased, and the camera is
 * power-cycled, so the FF app runs from R. The FF app's own answers (GetFirmwareInfo selectors
 * 6, 7, 8) are read first, and then the CLI writes A, then B, then R with the staged form the
 * vendor app uses. After each write the bank is read back halted over the J-Link and compared
 * with the prediction (`predictedFFStored`, worked out here, not by the page). The camera is
 * NOT expected to boot the written banks (no genuine bootloader for this build is in the corpus);
 * the boot outcome is recorded as observed. The whole flash is restored from the original dump at
 * the end, verified by a halted read, and the camera's original build is checked.
 *
 * Only what the J-Link and the CLI report is recorded as measured. The rest is a prediction,
 * named as one.
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { BankLetter } from '../slots-page.js';
import {
  FF_BANK_BYTES,
  PLAIN_FF_SHA256,
  VENDOR_FF_SHA256,
  predictedFFStored,
  predictedFFVendorPayload,
} from './ff-form.js';
import type { BenchCamera, JlinkBench } from './types.js';

/** The bank addresses on the 2014 chain (the 1.3.0.8 FF build's own, TESTING 42.12). */
export const FF_BANK_ADDRESS: Readonly<Record<BankLetter, number>> = {
  a: 0x14050000,
  b: 0x14060000,
  r: 0x14070000,
};

/** The files the run uses. Every one is checked by its sha256 before anything is written. */
export interface FfVendorFiles {
  /** The camera's original whole flash (4 MiB), the restore point. */
  readonly restoreFile: string;
  readonly restoreSha256: string;
  /** The whole flash of the 1.3.0.8 8 Hz build, the platform the FF app is loaded onto. */
  readonly platformFile: string;
  readonly platformSha256: string;
  /** The plain FF image: the decrypted corpus image (49,308 B) on the bench, with its sha256. */
  readonly plainFfFile: string;
  readonly plainFfSha256: string;
  /** The same image padded with 0xFF to one 64 KiB bank: what R is loaded with. */
  readonly plainFfBankFile: string;
  /** The vendor app's own staged file for the image, when it is available (checked byte for byte). */
  readonly vendorFile: string | null;
}

export interface FfVendorBench {
  readonly jlink: JlinkBench;
  readonly camera: BenchCamera;
  readonly log: (line: string) => void;
}

/** One reading of the camera's own answers and of what they decide. */
export interface CameraAnswers {
  /** The build the camera's answers name: 'plain' (8 Hz), 'ff-1308' (16 Hz), or null (not decided). */
  readonly build: string | null;
  readonly camera: { readonly a: number | null; readonly b: number | null; readonly r: number | null } | null;
  /** The predicted answers of each build from the banks the CLI read, as the CLI printed them. */
  readonly predictedPlain: readonly (number | null)[] | null;
  readonly predictedFf: readonly (number | null)[] | null;
  readonly why: string;
  readonly version: string | null;
  readonly buildString: string | null;
  readonly enumerated: boolean;
}

/** One bank write through the CLI, checked against the J-Link and the prediction. */
export interface FfWriteRecord {
  readonly bank: BankLetter;
  readonly address: number;
  readonly cliCode: number;
  readonly commitStatus: number | null;
  readonly cliVerified: boolean | null;
  readonly predictedSha256: string;
  readonly jlinkSha256: string;
  /** The J-Link read is the prediction, byte for byte. */
  readonly matchesPrediction: boolean;
  readonly problems: readonly string[];
}

export interface FfVendorReport {
  readonly restoreOk: boolean;
  readonly platformOk: boolean;
  /** Step (a): the 8 Hz platform, then the FF-in-R platform. */
  readonly answers8Hz: CameraAnswers | null;
  readonly answersFfInR: CameraAnswers | null;
  /** Step (b): the three writes, in order. */
  readonly writes: readonly FfWriteRecord[];
  /** After the three writes: the camera's answers with the vendor form in every bank. */
  readonly answersAfterWrites: CameraAnswers | null;
  /** The boot after the R write: recorded as observed, the expected outcome being no boot. */
  readonly bootAfterWrites: CameraAnswers | null;
  readonly restored: boolean;
  readonly restoredVersion: string | null;
  /** Failures of a check the run makes (never a boot outcome). */
  readonly failures: readonly string[];
  /** The staged payload, predicted from the image, and its match with the vendor file. */
  readonly stagedSha256: string;
  readonly stagedMatchesVendor: boolean | null;
}

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
const FF_STAGED_NOTE = 'the staged payload is the vendor form (the image XOR Key A, header verbatim)';

function fileSha(path: string): string {
  return sha256(new Uint8Array(readFileSync(path)));
}

/** Reads the camera's answers and the build they decide, through `seek-fw info --json`. */
export async function readAnswers(camera: BenchCamera): Promise<CameraAnswers> {
  const doc = await camera.infoJson();
  if (doc === null) {
    return {
      build: null,
      camera: null,
      predictedPlain: null,
      predictedFf: null,
      why: 'the CLI could not read the camera',
      version: null,
      buildString: null,
      enumerated: camera.present(),
    };
  }
  const firmware = (doc.firmware ?? {}) as Record<string, unknown>;
  const running = (doc.running ?? null) as Record<string, unknown> | null;
  const cameraAnswers = running === null ? null : ((running.camera ?? null) as CameraAnswers['camera']);
  const predicted = running === null ? null : ((running.predicted ?? null) as Record<string, unknown> | null);
  return {
    build: running === null ? null : ((running.build ?? null) as string | null),
    camera: cameraAnswers,
    predictedPlain: predicted === null ? null : ((predicted.plain ?? null) as readonly (number | null)[] | null),
    predictedFf: predicted === null ? null : ((predicted.ff ?? null) as readonly (number | null)[] | null),
    why: running === null ? 'no running record (not 1.3.0.8)' : String(running.why ?? ''),
    version: (firmware.version ?? null) as string | null,
    buildString: (firmware.build ?? null) as string | null,
    enumerated: true,
  };
}

/** Power-cycles the camera and waits for it to come back on the bus. Returns whether it did. */
async function cycleAndWait(camera: BenchCamera): Promise<boolean> {
  await camera.powerCycle();
  return (await camera.waitForEnumeration(60_000)) !== null;
}

/**
 * The whole run. Every write is preceded by the checks that gate it, and the restore is in the
 * `finally`, so a failure in the middle still puts the original flash back.
 */
export async function runFfVendor(
  bench: FfVendorBench,
  files: FfVendorFiles,
): Promise<FfVendorReport> {
  const { jlink, camera, log } = bench;
  const failures: string[] = [];
  const writes: FfWriteRecord[] = [];
  let answers8Hz: CameraAnswers | null = null;
  let answersFfInR: CameraAnswers | null = null;
  let answersAfterWrites: CameraAnswers | null = null;
  let bootAfterWrites: CameraAnswers | null = null;
  let restored = false;
  let restoredVersion: string | null = null;
  let platformOk = false;
  let restoreOk = false;
  /* Set before the first write: only a run that has written anything restores the flash. */
  let touched = false;

  /* The file checks come first: a wrong file is refused before the J-Link or the camera is touched. */
  if (fileSha(files.restoreFile) !== files.restoreSha256) {
    throw new Error(`the restore file ${files.restoreFile} is not ${files.restoreSha256}`);
  }
  if (fileSha(files.platformFile) !== files.platformSha256) {
    throw new Error(`the platform file ${files.platformFile} is not ${files.platformSha256}`);
  }
  const plain = new Uint8Array(readFileSync(files.plainFfFile));
  if (sha256(plain) !== files.plainFfSha256) {
    throw new Error(`the plain FF image ${files.plainFfFile} is not ${files.plainFfSha256}`);
  }
  const staged = predictedFFVendorPayload(plain);
  const stagedSha256 = sha256(staged.subarray(0, plain.length));
  const stagedMatchesVendor =
    files.vendorFile === null
      ? null
      : equalBytesOf(staged.subarray(0, plain.length), new Uint8Array(readFileSync(files.vendorFile)));
  /* The vendor file is the oracle for the corpus image only; another image has no vendor file to match. */
  if (files.plainFfSha256 === PLAIN_FF_SHA256 && stagedSha256 !== VENDOR_FF_SHA256) {
    failures.push(`the predicted staged payload is ${stagedSha256}, not the vendor file ${VENDOR_FF_SHA256}`);
  }
  log(`staged payload: ${FF_STAGED_NOTE}; sha256 ${stagedSha256}; vendor file ${stagedMatchesVendor === null ? 'not given' : String(stagedMatchesVendor)}`);

  try {
    /* Step 0: the restore point, read halted and checked before anything is written. */
    const whole = await jlink.readFlash(0x14000000, 0x400000);
    restoreOk = sha256(whole) === files.restoreSha256;
    log(`restore point: halted read sha256 ${sha256(whole)} (${restoreOk ? 'the original' : 'NOT the original'})`);
    if (!restoreOk) {
      failures.push('the camera flash is not the original before the run, so nothing was written');
      return report();
    }

    /* Step (a), the 8 Hz platform: the whole flash of the 1.3.0.8 8 Hz build, power cycled. */
    touched = true;
    await jlink.flashFull(files.platformFile);
    await jlink.verifyFull(files.platformSha256);
    if (!(await cycleAndWait(camera))) {
      failures.push('the 8 Hz platform did not come back on the bus after the power cycle');
      return report();
    }
    answers8Hz = await readAnswers(camera);
    log(`8 Hz platform: ${answers8Hz.why}; camera answers ${JSON.stringify(answers8Hz.camera)}`);
    platformOk = answers8Hz.version === '1.3.0.8';

    /* Step (a), the FF-in-R platform: the FF app loaded into R, A and B erased, power cycled. */
    await jlink.writeBank(FF_BANK_ADDRESS.r, files.plainFfBankFile);
    for (const letter of ['a', 'b'] as const) {
      await jlink.eraseRange(FF_BANK_ADDRESS[letter], FF_BANK_BYTES);
      const erased = await jlink.readFlash(FF_BANK_ADDRESS[letter], FF_BANK_BYTES);
      if (!erased.every((byte) => byte === 0xff)) {
        failures.push(`bank ${letter.toUpperCase()} is not erased after its erase`);
      }
    }
    if (!(await cycleAndWait(camera))) {
      failures.push('the FF-in-R platform did not come back on the bus after the power cycle');
      return report();
    }
    answersFfInR = await readAnswers(camera);
    log(`FF-in-R platform: ${answersFfInR.why}; camera answers ${JSON.stringify(answersFfInR.camera)}`);

    /* Step (b): A, then B, then R, through the CLI (the core write path), each read back halted. */
    for (const letter of ['a', 'b', 'r'] as const) {
      const run = await camera.slotFlash(letter, files.plainFfFile, {
        acknowledgeRisk: true,
        running16Hz: true,
      });
      const predicted = predictedFFStored(plain);
      const readBack = await jlink.readFlash(FF_BANK_ADDRESS[letter], FF_BANK_BYTES);
      const predictedSha256 = sha256(predicted);
      const jlinkSha256 = sha256(readBack);
      const problems: string[] = [];
      if (run.code !== 0) problems.push(`the CLI exited ${String(run.code)}: ${run.stderr.trim().slice(0, 300)}`);
      const commitStatus = typeof run.result?.commitStatus === 'number' ? run.result.commitStatus : null;
      const cliVerified = typeof run.result?.verified === 'boolean' ? run.result.verified : null;
      if (cliVerified !== true) problems.push('the CLI did not report the bank as verified');
      if (jlinkSha256 !== predictedSha256) {
        problems.push(`the J-Link read ${jlinkSha256} is not the prediction ${predictedSha256}`);
      }
      writes.push({
        bank: letter,
        address: FF_BANK_ADDRESS[letter],
        cliCode: run.code,
        commitStatus,
        cliVerified,
        predictedSha256,
        jlinkSha256,
        matchesPrediction: jlinkSha256 === predictedSha256,
        problems,
      });
      log(
        `write ${letter.toUpperCase()}: CLI exit ${String(run.code)}, commit ${commitStatus === null ? '(none)' : `0x${commitStatus.toString(16)}`}, ` +
          `verified ${String(cliVerified)}, J-Link ${jlinkSha256 === predictedSha256 ? 'equals' : 'DIFFERS FROM'} the prediction`,
      );
      for (const problem of problems) failures.push(`write ${letter.toUpperCase()}: ${problem}`);
    }

    /* After the three writes, with the FF app still running from RAM: the camera's own answers. */
    answersAfterWrites = await readAnswers(camera);
    log(`after the writes: ${answersAfterWrites.why}; camera answers ${JSON.stringify(answersAfterWrites.camera)}`);

    /* The boot, recorded as observed. The expected outcome is that it does not run the vendor form. */
    if (await cycleAndWait(camera)) {
      bootAfterWrites = await readAnswers(camera);
      log(`boot after the writes: the camera came back as ${String(bootAfterWrites.version)} ${String(bootAfterWrites.buildString)}`);
    } else {
      log('boot after the writes: the camera did not come back on the bus (expected: no boot of the vendor form)');
    }
  } finally {
    /* The restore: the whole original flash, halted-read and checked, then a power cycle and the build. */
    try {
      if (!touched) throw new Error('nothing was written, so there is nothing to restore');
      await jlink.flashFull(files.restoreFile);
      await jlink.verifyFull(files.restoreSha256);
      if (await cycleAndWait(camera)) {
        const back = await readAnswers(camera);
        restoredVersion = back.version;
        restored = back.version === '1.3.0.0';
        log(`restore: the camera runs ${String(back.version)} ${String(back.buildString)} (${restored ? 'the original' : 'NOT the original'})`);
      } else {
        log('restore: the camera did not come back on the bus after the restore');
      }
    } catch (error) {
      if (touched) failures.push(`restore: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return report();

  function report(): FfVendorReport {
    return {
      restoreOk,
      platformOk,
      answers8Hz,
      answersFfInR,
      writes,
      answersAfterWrites,
      bootAfterWrites,
      restored,
      restoredVersion,
      failures,
      stagedSha256,
      stagedMatchesVendor,
    };
  }
}

function equalBytesOf(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** The original whole flash of this unit (the restore point): the Compact PIR206 at 1.3.0.0 (TESTING 42.10). */
export const ORIGINAL_SHA256 = '40447c7e6da5cbc84621f4694ffff5bda0f783e7807a45e80443383b19a8eb72';
/** The whole flash of the 1.3.0.8 8 Hz build (the platform the FF app is loaded onto). */
export const PLATFORM_SHA256 = 'afa9800f8969e46a0d868b19bdd55a9514fec40cfd958de41d0f769eea5a6e7b';

/**
 * The run's files, from the environment: SEEK_BENCH_FF_RESTORE (the original 4 MiB), SEEK_BENCH_FF_PLATFORM
 * (the 1.3.0.8 8 Hz whole-flash dump) and SEEK_BENCH_FF_PLAIN (the plain FF image, 49,308 B), with the optional
 * SEEK_BENCH_FF_VENDOR (the vendor app's staged file). The FF image is padded with 0xFF into a bank-sized file in
 * `scratchDir`. Returns the reason in words when a file is missing, instead of the files.
 */
export function ffVendorFilesFromEnv(env: NodeJS.ProcessEnv, scratchDir: string): FfVendorFiles | string {
  const restore = env.SEEK_BENCH_FF_RESTORE;
  const platform = env.SEEK_BENCH_FF_PLATFORM;
  const plain = env.SEEK_BENCH_FF_PLAIN;
  const missing = [
    restore === undefined ? 'SEEK_BENCH_FF_RESTORE' : null,
    platform === undefined ? 'SEEK_BENCH_FF_PLATFORM' : null,
    plain === undefined ? 'SEEK_BENCH_FF_PLAIN' : null,
  ].filter((name): name is string => name !== null);
  if (missing.length > 0) {
    return `set ${missing.join(', ')} (the original flash, the 1.3.0.8 8 Hz whole-flash dump and the plain FF image)`;
  }
  const image = new Uint8Array(readFileSync(plain ?? ''));
  if (image.length > FF_BANK_BYTES) return `the plain FF image is ${String(image.length)} B, larger than a bank`;
  mkdirSync(scratchDir, { recursive: true });
  const bank = path.join(scratchDir, 'ff-plain-bank-r.bin');
  const padded = new Uint8Array(FF_BANK_BYTES).fill(0xff);
  padded.set(image, 0);
  writeFileSync(bank, padded);
  return {
    restoreFile: restore ?? '',
    restoreSha256: ORIGINAL_SHA256,
    platformFile: platform ?? '',
    platformSha256: PLATFORM_SHA256,
    plainFfFile: plain ?? '',
    plainFfSha256: PLAIN_FF_SHA256,
    plainFfBankFile: bank,
    vendorFile: env.SEEK_BENCH_FF_VENDOR ?? null,
  };
}
