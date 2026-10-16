/* ==================================================================== *
 * The slots BENCH suite — `npm run e2e:slots:bench`
 * (`vitest run --config e2e/vitest.config.ts slots-bench.e2e`).
 *
 * For each launchable dump the bench camera's tree lists at 0.8.0.0 or above,
 * one after the other: flash the whole part with the J-Link and read it back
 * halted; reset; drive the Firmware slots page in Electron over real WebUSB and
 * check each bank against the J-Link; write each bank its own decrypted image
 * through the page (B, then A, then R), checking the page's verdict and the
 * J-Link after each; then patch the build string and write it into all three
 * banks, reset, and require the camera to run the patched build. The flow is
 * `lib/bench/spec-flow.ts`; the real parts are `lib/bench/index.ts` (the
 * library) and `lib/bench/spec-page.ts` (the page); the fakes are
 * `lib/bench/spec-fakes.ts`.
 *
 * THE GATE (`approveWrite`, lib/supervised-write.ts):
 *   SEEK_E2E_WRITE=i-understand  runs it on the bench (never with CI set);
 *   SEEK_E2E_WRITE=dry-run       lists the subjects and the plan, touches no hardware;
 *   anything else                the whole file skips, and says why.
 * SEEK_BENCH_FAKE=1 (with dry-run, to rehearse) runs the same control flow against
 * the in-memory fakes instead of the library, the page and the camera.
 *
 * Environment, all optional here (the library names the ones it needs):
 *   SEEK_FULL_DUMPS_BY_CAMERA  the dump tree root (required for a real run)
 *   SEEK_BENCH_CAMERA          the tree's camera, default 'Compact'
 *   SEEK_BENCH_ONLY            run only subjects whose version or folder contains this
 *   SEEK_BENCH_REPORT_DIR      where the JSON and markdown matrix go (default: the scratch dir)
 *   SEEK_BENCH_FAKE_FAIL       with SEEK_BENCH_FAKE=1: '<subject index>:<step>', the step one of
 *                              halt, verify, enumerate, write, verdict, readback, boot
 *
 * A failing subject records its failures and the run goes on to the next one; the
 * last test fails and names every subject that did not pass. The camera's own
 * original is the last subject the library lists, so the run ends by flashing it.
 * ==================================================================== */

import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { say } from './lib/browser.js';
import { runSubject, subjectLabel, type SubjectResult } from './lib/bench/spec-flow.js';
import { createFakeRig, fakeSubjects, type FakeFailure } from './lib/bench/spec-fakes.js';
import { createRealRig } from './lib/bench/spec-page.js';
import {
  describePlan,
  reportLine,
  writeMatrix,
  type RunMeta,
  type RunMode,
} from './lib/bench/spec-report.js';
import { loadSubjects, type BenchRig, type LoadedSubjects } from './lib/bench/spec-rig.js';
import type { BenchSubject } from './lib/bench/types.js';
import { approveWrite, type WriteApproval } from './lib/supervised-write.js';

const FAKE = process.env.SEEK_BENCH_FAKE === '1';
const CAMERA = process.env.SEEK_BENCH_CAMERA ?? 'Compact';
const SCRATCH =
  process.env.SEEK_E2E_SCRATCH ??
  path.join(tmpdir(), `seek-e2e-slots-bench-${String(process.pid)}`);
const REPORT_DIR = process.env.SEEK_BENCH_REPORT_DIR ?? SCRATCH;
/** One subject's whole flow, with its page windows and its waits. */
const SUBJECT_TIMEOUT_MS = 2 * 60 * 60_000;

/** `SEEK_BENCH_FAKE_FAIL=<index>:<step>` names the fake subject and step to fail; unset means none. */
function failureFromEnv(): FakeFailure | null {
  const raw = process.env.SEEK_BENCH_FAKE_FAIL ?? '';
  if (raw === '') return null;
  const match = /^(\d+):(halt|verify|enumerate|write|verdict|readback|boot)$/.exec(raw);
  if (match === null) {
    throw new Error(
      `SEEK_BENCH_FAKE_FAIL=${raw}: use <index>:<halt|verify|enumerate|write|verdict|readback|boot>`,
    );
  }
  return { subject: Number(match[1]), step: match[2] as FakeFailure['step'] };
}

/* The plan is built inside the gate, and only when the gate asks for it: a run
 * that is not approved and not a dry run never reads the tree. */
const planned: { current: { readonly loaded: LoadedSubjects; readonly text: string } | null } = {
  current: null,
};
const gate: WriteApproval = await approveWrite('camera', async () => {
  const loaded = FAKE
    ? { subjects: fakeSubjects(path.join(SCRATCH, 'fake')), left: [] }
    : await loadSubjects();
  const text = describePlan(loaded.subjects, loaded.left, CAMERA);
  planned.current = { loaded, text };
  return { describe: text };
});

const runnable = gate.approved || gate.dry;
if (!runnable) {
  process.stderr.write(
    `\n[skip] the slots bench (every launchable ${CAMERA} dump, on the real camera): ${gate.reason}.\n` +
      '  Run it on the bench with SEEK_E2E_WRITE=i-understand (never in CI).\n' +
      '  Rehearse it, touching no hardware, with SEEK_E2E_WRITE=dry-run.\n',
  );
}

const subjects: readonly BenchSubject[] = planned.current?.loaded.subjects ?? [];
const meta: RunMeta = {
  mode: (FAKE ? 'fake' : gate.approved ? 'bench' : 'dry') satisfies RunMode,
  camera: CAMERA,
  startedAt: new Date().toISOString(),
  left: (planned.current?.loaded.left ?? []).map(subjectLabel),
};
/** A dry run on the real tree: it lists the subjects, and opens nothing. */
const rehearsalOnly = gate.dry && !FAKE;
if (gate.dry && planned.current !== null) process.stdout.write(`${planned.current.text}\n`);

describe.skipIf(!runnable)('the slots bench', () => {
  const results: SubjectResult[] = [];
  let rig: BenchRig | null = null;

  beforeAll(async () => {
    if (rehearsalOnly) return;
    mkdirSync(SCRATCH, { recursive: true });
    say(`scratch: ${SCRATCH}`);
    rig = FAKE
      ? createFakeRig({ subjects, failure: failureFromEnv() })
      : await createRealRig(gate, SCRATCH);
  }, 10 * 60_000);

  afterAll(() => {
    if (rehearsalOnly || results.length === 0) return;
    const written = writeMatrix(REPORT_DIR, results, meta);
    say(`bench report: ${written.markdown}`);
    say(`bench report: ${written.json}`);
  });

  if (rehearsalOnly) {
    it('dry run: lists the subjects and the plan, and touches no hardware', () => {
      expect(subjects.length, 'the tree lists launchable subjects').toBeGreaterThan(0);
    });
    return;
  }

  for (const [index, subject] of subjects.entries()) {
    describe(`${String(index + 1)}/${String(subjects.length)} ${subjectLabel(subject)}`, () => {
      it(
        'flashes it, checks the page and the J-Link, writes both banks, and proves the boot',
        async () => {
          const result =
            rig === null
              ? missingRig(subject)
              : await runSubject(rig, subject, (line) => {
                  say(line);
                });
          results.push(result);
          /* The run's log is the only place a failure's cause shows before the run ends. */
          for (const note of result.notes) say(`${result.label}: note: ${note}`);
          for (const failure of result.failures) say(`${result.label}: FAILED: ${failure}`);
          process.stdout.write(`${reportLine(result)}\n`);
          expect(result.failures, `${result.label}: ${result.failures.join(' ;; ')}`).toEqual([]);
        },
        SUBJECT_TIMEOUT_MS,
      );
    });
  }

  it('the matrix: every subject passes, and the failing ones are named', () => {
    const failing = results.filter((r) => r.failures.length > 0).map((r) => r.label);
    expect(results.length, 'every subject ran').toBe(subjects.length);
    expect(failing, `subjects that did not pass: ${failing.join('; ')}`).toEqual([]);
  });
});

/** The record of a subject whose rig never opened (the beforeAll error says why). */
function missingRig(subject: BenchSubject): SubjectResult {
  return {
    label: subjectLabel(subject),
    file: path.basename(subject.file),
    version: subject.version,
    flashVerified: false,
    enumerated: false,
    enumerateMs: null,
    pageIdentified: false,
    banksMatch: false,
    slotWrites: [],
    bootProof: 'not-run',
    notes: [],
    failures: ['the bench rig did not open (see the beforeAll error)'],
  };
}
