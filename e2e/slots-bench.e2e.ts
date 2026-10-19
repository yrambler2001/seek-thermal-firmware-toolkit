/* ==================================================================== *
 * The slots BENCH suite — `npm run e2e:slots:bench`
 * (`vitest run --config e2e/vitest.config.ts slots-bench.e2e`).
 *
 * For each launchable dump the bench camera's tree lists at 0.8.0.0 or above,
 * one after the other: flash the whole part with the J-Link and read it back
 * halted; reset; drive the Firmware slots page in Electron over real WebUSB and
 * check each bank against the J-Link; then judge each bank against the shared
 * verdict table (`e2e/lib/slots-expectations.ts`, its row found by `lib/bench/verdict.ts`):
 * a bank the table refuses must be refused at the picker with the table's reason
 * (nothing sent); a bank the table says is writable is written through the page
 * (its own image, or another bank's where the table records its own as refused),
 * checking the page's verdict and the J-Link after each; then patch the build string
 * and write it into all three banks, reset, and require the camera to run the patched
 * build (where the table refuses no bank). A subject passes when every bank does what
 * its row says. The flow is `lib/bench/spec-flow.ts`; the judge is `lib/bench/verdict.ts`;
 * the real parts are `lib/bench/index.ts` (the library) and `lib/bench/spec-page.ts`
 * (the page); the fakes are `lib/bench/spec-fakes.ts`.
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
import { closeSharedDevServer } from './lib/target.js';
import {
  runProbe,
  runSubject,
  subjectLabel,
  type BenchProbe,
  type SubjectResult,
} from './lib/bench/spec-flow.js';
import { createFakeRig, fakeSubjects, type FakeFailure } from './lib/bench/spec-fakes.js';
import { createRealRig } from './lib/bench/spec-page.js';
import {
  describePlan,
  passedAsWord,
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

/**
 * SEEK_BENCH_PROBE names one probe to run on each subject in place of its full flow:
 *   refuse-b  bank B's own decrypted image is offered at the picker (the page must refuse it)
 *   empty-b   the empty bank as a user does it: list, dump, fill from the booted bank, boot B alone
 * Unset, the full flow runs.
 */
function probeFromEnv(): BenchProbe | null {
  const raw = process.env.SEEK_BENCH_PROBE ?? '';
  if (raw === '') return null;
  if (raw === 'refuse-b' || raw === 'empty-b' || raw === 'derived') return raw;
  throw new Error(`SEEK_BENCH_PROBE=${raw}: use refuse-b, empty-b or derived`);
}
const PROBE = probeFromEnv();

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

  afterAll(async () => {
    await closeSharedDevServer();
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
        'flashes it, checks the page and the J-Link, holds each bank to the verdict table, and proves the boot',
        async () => {
          const log = (line: string): void => {
            say(line);
          };
          heapLine(`before ${subjectLabel(subject)}`);
          const result =
            rig === null
              ? missingRig(subject)
              : PROBE === null
                ? await runSubject(rig, subject, log)
                : await runProbe(rig, subject, PROBE, log);
          results.push(result);
          heapLine(`after ${subjectLabel(subject)}`);
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
    /* The summary: each subject, and whether it passed as a write or as a refusal the table records. */
    for (const r of results) say(`${r.label}: passed as ${passedAsWord(r)}`);
    const failing = results.filter((r) => r.failures.length > 0).map((r) => r.label);
    expect(results.length, 'every subject ran').toBe(subjects.length);
    expect(failing, `subjects that did not pass: ${failing.join('; ')}`).toEqual([]);
  });
});

/**
 * One line of the worker's heap, after a collection when the run exposes `gc` (NODE_OPTIONS
 * --expose-gc): the RETAINED heap, so growth between subjects is a leak and not garbage.
 * Read by the matrix's memory notes (TESTING.md 42.21); it changes no result.
 */
function heapLine(when: string): void {
  const gc = (globalThis as { gc?: () => void }).gc;
  if (gc !== undefined) gc();
  const mb = (n: number): string => String(Math.round(n / 2 ** 20));
  const m = process.memoryUsage();
  say(
    `heap ${when}: heapUsed ${mb(m.heapUsed)} MB, rss ${mb(m.rss)} MB${gc === undefined ? ' (no gc: not retained)' : ''}`,
  );
}

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
    slotBoot: [],
    pageBanner: null,
    pageVersions: null,
    judgement: null,
    notes: [],
    failures: ['the bench rig did not open (see the beforeAll error)'],
  };
}
