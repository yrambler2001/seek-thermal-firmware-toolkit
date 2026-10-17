/* ====================================================================
 * The slot workflows on EVERY modern-line firmware in the emulator corpus.
 *
 * WHAT RUNS. Each modern-line corpus entry (profile modern-4x, 2.x / 4.x / 10.x /
 * 42.x / 44.x): the full dumps, and the image-only entries, which boot as a
 * chimera on their manifest donor (`--donor`, `--jedec 010215`, as the preservation
 * suites boot them). One emulator per firmware, booted once; the checks are the
 * ones `corpus-modern-run.ts` documents (plan, inspect, three dumps, the refused
 * booted-bank write, the B rewrite, the raw write into R, the boot-config and
 * bootloader blocks).
 *
 * HOW THE ROWS RUN. Four lanes (`LANES`). Each lane is ONE concurrent test that
 * runs its firmwares one after another, so at most four emulators of this file
 * are alive at once, whatever SEEK_EMU_WORKERS says (it can only lower that). A
 * describe.concurrent would not do it: nested describes inherit the concurrency
 * and every firmware would start at once. The per-check assertions below are
 * ordinary sequential tests that read what the lanes recorded, so each check is
 * its own line in the report.
 *
 * GAPS. A check the emulator cannot make is a GAP with its reason, and the
 * reason is PINNED in `PINNED_GAPS` below. A pinned gap that stops being a gap is
 * red ("promote it"); a gap whose reason changes is red; an unpinned gap is red.
 * A failure is always red. Nothing is skipped, and a check that did not run is a
 * failure that says why.
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR (suite.ts): SEEK_EMU_DIR unset means the file
 * says so on stderr and exits clean. Run it as
 *   SEEK_EMU_DIR=<FW-V1>/emu npx vitest run packages/core/test/slots/corpus-modern.emulator.test.ts
 * SEEK_EMU_MODERN_ONLY=<text> runs only the firmwares whose label contains <text>. The
 * matrix is printed to stdout at the end. A full run takes about two minutes.
 * ==================================================================== */

import { afterAll, describe, expect, it } from 'vitest';

import { liveEmulatorCount } from '../emulator/harness.js';
import { announceSkip, EMU_DIR, ENTRIES } from '../emulator/suite.js';
import {
  CHECKS,
  type CheckName,
  entryFor,
  formatMatrix,
  MODERN_SUBJECTS,
  type ModernRun,
  REASON,
  runModernSubject,
} from './corpus-modern-run.js';

/** Four emulators at once, at most: the lanes below are the cap. */
const LANES = 4;
/** A ceiling on failure, not a wait: a lane runs up to six firmwares back to back. */
const LANE_TIMEOUT_MS = Number(
  process.env.SEEK_EMU_MODERN_TIMEOUT_MS ?? String(6 * 60 * 60 * 1000),
);

/**
 * SEEK_EMU_MODERN_ONLY=<text> runs only the firmwares whose matrix label contains <text>
 * (case-insensitive). For one firmware at a time while a check is being looked at; a run
 * that sets it says so, and its matrix covers only what it selected.
 */
const ONLY = process.env.SEEK_EMU_MODERN_ONLY?.trim().toLowerCase() ?? '';
const SUBJECTS = MODERN_SUBJECTS.filter((s) => ONLY === '' || s.label.toLowerCase().includes(ONLY));
if (ONLY !== '') {
  process.stderr.write(
    `\n[modern] SEEK_EMU_MODERN_ONLY=${ONLY}: ${String(SUBJECTS.length)} of ${String(MODERN_SUBJECTS.length)} firmwares selected\n`,
  );
}

const available = EMU_DIR !== null;
if (!available) announceSkip('the slot workflows on the modern line of the emulated corpus');

/**
 * Known gaps, by matrix row and check. Each reason was MEASURED on the emulator
 * (see the matrix's detail lines), not written from a guess. A row is listed here
 * only while its check cannot be made on the emulator, and the reason is the one
 * the run recorded.
 */
const PINNED_GAPS: Readonly<Record<string, Partial<Record<CheckName, string>>>> = {
  /* The Compact FF 4.16.1.7 chimera: the image is run on its donor's (4.8.2.1) bootloader, the
   * camera is not writable from here, and the device refuses the raw A bytes sent into R. */
  'Compact FF 4.16.1.7 image (on 4.8.2.1)': {
    'flash-b': REASON.notWritable,
    'raw-r': REASON.chimeraRawRefused,
  },
  /* Bank B of the Compact PRO 4.9.1.15 dump holds an image with neither of the camera's keys. */
  'Compact PRO 4.9.1.15 dump': { 'flash-b': REASON.bImageForeignKeys },
};

/** What each lane recorded, by matrix row. Filled by the lanes, read by the checks. */
const runs = new Map<string, ModernRun>();

/** The judgement a single check's test makes of its recorded verdict. */
function expectVerdict(run: ModernRun, check: CheckName): void {
  const verdict = run.verdicts[check];
  const pinned = PINNED_GAPS[run.subject.label]?.[check];
  if (verdict.status === 'fail') expect.fail(verdict.detail);
  if (verdict.status === 'gap') {
    if (pinned === undefined)
      expect.fail(`an unpinned gap (pin its reason, or make the check pass): ${verdict.reason}`);
    expect(verdict.reason, `the recorded gap changed: ${verdict.detail}`).toBe(pinned);
    return;
  }
  if (pinned !== undefined) {
    expect.fail(`was a known gap (${pinned}) and now passes: promote it in PINNED_GAPS`);
  }
}

describe.skipIf(!available)(
  'the slot workflows on every modern-line firmware in the corpus',
  () => {
    afterAll(() => {
      const recorded = SUBJECTS.map((subject) => runs.get(subject.label)).filter(
        (run): run is ModernRun => run !== undefined,
      );
      process.stdout.write(formatMatrix(recorded));
      expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
    });

    /* The rows: each lane boots and measures its firmwares one after another. */
    for (let lane = 0; lane < LANES; lane++) {
      const mine = SUBJECTS.filter((_, index) => index % LANES === lane);
      it.concurrent(
        `lane ${String(lane + 1)} of ${String(LANES)} boots and runs: ${mine.map((s) => s.label).join('; ')}`,
        { timeout: LANE_TIMEOUT_MS },
        async () => {
          for (const subject of mine) {
            runs.set(subject.label, await runModernSubject(subject, ENTRIES));
          }
        },
      );
    }

    /* The checks, one line per firmware per check, after the lanes have run. */
    for (const subject of SUBJECTS) {
      describe(subject.label, () => {
        it('is in the corpus manifest, as a ' + subject.kind, () => {
          expect(
            entryFor(subject, ENTRIES),
            `no ${subject.kind} entry under ${subject.prefix}`,
          ).not.toBeNull();
        });

        for (const check of CHECKS) {
          it(check.title, () => {
            const run = runs.get(subject.label);
            expect(run, 'the lane recorded this firmware').toBeDefined();
            if (run === undefined) return;
            expectVerdict(run, check.name);
          });
        }

        it('the emulator delivered every reply it sent, and nothing died under the row', () => {
          const run = runs.get(subject.label);
          expect(run, 'the lane recorded this firmware').toBeDefined();
          expect(run?.defect ?? null, run?.defect ?? '').toBeNull();
        });
      });
    }
  },
);
