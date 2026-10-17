/* ==================================================================== *
 * The 1.3.0.8 FF (16 Hz) vendor-form bench run — `npm run e2e:ff:vendor` (TESTING 42.12).
 *
 * Needs the bench and the write gate:
 *   SEEK_E2E_WRITE=i-understand   runs it on the camera (never with CI set);
 *   SEEK_E2E_WRITE=dry-run        prints the plan and touches no hardware.
 * and these files (checked by sha256 before anything is written):
 *   SEEK_BENCH_FF_RESTORE    the camera's original 4 MiB flash (sha256 40447c7e...eb72)
 *   SEEK_BENCH_FF_PLATFORM   the whole flash of the 1.3.0.8 8 Hz build (sha256 afa9800f...)
 *   SEEK_BENCH_FF_PLAIN      the plain FF image, 49,308 B (sha256 b97ced91...)
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

import { createBenchCamera, createJlinkBench, ffVendorFilesFromEnv, runFfVendor } from './lib/bench/index.js';
import { approveWrite, type WriteApproval } from './lib/supervised-write.js';

const gate: WriteApproval = await approveWrite('camera', async () => ({
  describe:
    'the 1.3.0.8 FF (16 Hz) vendor-form run: writes banks A, B and R of the camera through the CLI, ' +
    'reads each back halted over the J-Link, and restores the original flash',
}));

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
