/* ==================================================================== *
 * The 1.3.0.8 FF (16 Hz) vendor-form bench run — `npm run e2e:ff:vendor` (TESTING 42.12).
 *
 * Needs the bench and the write gate:
 *   SEEK_E2E_WRITE=i-understand   runs it on the camera (never with CI set);
 *   SEEK_E2E_WRITE=dry-run        prints the plan and touches no hardware.
 * and these three files, each checked by sha256 before anything is written. A variable that is set names its
 * file; one that is not set finds the file under its default root (TESTING 42.60, lib/bench/ff-vendor-run.ts):
 *   SEEK_BENCH_FF_RESTORE    the camera's original 4 MiB flash (sha256 40447c7e...eb72)
 *                            default: $SEEK_FULL_DUMPS_BY_CAMERA/Compact/Compact/2014.10.21-14.58.29-1.3.0.0/full_dump_original.bin
 *   SEEK_BENCH_FF_PLATFORM   the whole flash of the 1.3.0.8 8 Hz build (sha256 afa9800f...)
 *                            default: $SEEK_FULL_DUMPS_BY_CAMERA/Compact/Compact/2017.01.06-11.16.17-1.3.0.8/full_dump_reconstructed.bin
 *   SEEK_BENCH_FF_PLAIN      the plain FF image, 49,308 B (sha256 b97ced91...)
 *                            default: $SEEK_E2E_FWV1_DIR/emu/data/corpus/compact/2017.01.06-11.17.29-1.3.0.8-FF/no-serial/32k_43x0_1.3.0.8_compact-16hz_public_-_compact_ff_jan_6_2017_11-17-29_99.28_gabiz_ro_firmware.bin
 * A missing or wrong file stops the run before the camera is touched, with the variable, the path and the expected sha256.
 * optional:
 *   SEEK_BENCH_FF_VENDOR     the vendor app's staged file (sha256 fd9da63b...), compared byte for byte
 *   SEEK_BENCH_FF_SCRATCH    where the padded bank file and the report go (default: the OS temp dir)
 *
 * The run itself is `lib/bench/ff-vendor-run.ts`; this file only gates it and reports it.
 * ==================================================================== */

import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  createBenchCamera,
  createJlinkBench,
  cycleAndWait,
  ffVendorFilesFromEnv,
  haltedRead,
  ORIGINAL_SHA256,
  readAnswers,
  runFfVendor,
  verifyWithRetry,
} from './lib/bench/index.js';
import { approveWrite, type WriteApproval } from './lib/supervised-write.js';

const gate: WriteApproval = await approveWrite('camera', () =>
  Promise.resolve({
    describe:
      'the 1.3.0.8 FF (16 Hz) vendor-form run: writes banks A, B and R of the camera through the CLI, ' +
      'reads each back halted over the J-Link, and restores the original flash',
  }),
);

const scratch = process.env.SEEK_BENCH_FF_SCRATCH ?? path.join(tmpdir(), 'seek-ff-vendor');
if (!gate.approved) {
  process.stderr.write(
    `\n[skip] the 1.3.0.8 FF vendor-form run: ${gate.reason}.\n` +
      '  Run it on the bench with SEEK_E2E_WRITE=i-understand (never in CI).\n',
  );
}

describe.skipIf(!gate.approved)('the 1.3.0.8 FF vendor-form run (TESTING 42.12)', () => {
  it(
    'writes A, B and R with the vendor form, reads each back as predicted, and restores the original',
    async () => {
      const files = ffVendorFilesFromEnv(process.env, scratch);
      if (typeof files === 'string') throw new Error(files);
      const jlink = createJlinkBench({ gate });
      const camera = createBenchCamera({ gate });
      const report = await runFfVendor(
        { jlink, camera, log: (line) => process.stdout.write(`[ff-vendor] ${line}\n`) },
        files,
      );
      mkdirSync(scratch, { recursive: true });
      const reportPath = path.join(scratch, 'ff-vendor-report.json');
      writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
      process.stdout.write(`[ff-vendor] report: ${reportPath}\n`);
      expect(report.failures).toEqual([]);
      expect(report.writes.map((write) => write.matchesPrediction)).toEqual([true, true, true]);
      expect(report.restored).toBe(true);
    },
    3 * 60 * 60 * 1000,
  );
});

/**
 * The recovery: SEEK_BENCH_FF_RECOVER=i-understand reads the whole flash halted, and if it is not the camera's
 * original, flashes the original back, verifies it, power-cycles and requires the 1.3.0.0 build to run again.
 * It is what a run that stopped mid-way needs; it does not run the FF steps.
 */
const recover = process.env.SEEK_BENCH_FF_RECOVER === 'i-understand';
describe.skipIf(!gate.approved || !recover)(
  'the recovery to the original flash (TESTING 42.12)',
  () => {
    it(
      'puts the original 4 MiB back and checks the camera runs 1.3.0.0',
      async () => {
        const files = ffVendorFilesFromEnv(process.env, scratch);
        if (typeof files === 'string') throw new Error(files);
        const jlink = createJlinkBench({ gate });
        const camera = createBenchCamera({ gate });
        const log = (line: string): void => {
          process.stdout.write(`[ff-recover] ${line}\n`);
        };
        if (!(await cycleAndWait(camera)))
          log('the camera is not on the bus after the power cycle; reading the flash anyway');
        const whole = await haltedRead(jlink, camera, 0x14000000, 0x400000);
        const { createHash } = await import('node:crypto');
        const sha = createHash('sha256').update(whole).digest('hex');
        log(`the flash now reads ${sha}`);
        if (sha !== ORIGINAL_SHA256) {
          await jlink.flashFull(files.restoreFile);
          await verifyWithRetry(jlink, camera, ORIGINAL_SHA256);
        }
        expect(await cycleAndWait(camera)).toBe(true);
        const back = await readAnswers(camera);
        log(`the camera runs ${String(back.version)} ${String(back.buildString)}`);
        expect(back.version).toBe('1.3.0.0');
      },
      60 * 60 * 1000,
    );
  },
);
