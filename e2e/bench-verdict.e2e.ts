/**
 * The slots bench's criterion: each subject is judged by the shared verdict table
 * (`e2e/lib/slots-expectations.ts`), offline. No hardware, no Electron: the judge
 * (`lib/bench/verdict.ts`) is pure, and the flow runs on the fake rig, whose page
 * refuses and banners as the row says.
 *
 *   npx vitest run --config e2e/vitest.config.ts bench-verdict.e2e
 *
 * The corpus test at the end runs only when SEEK_FULL_DUMPS_BY_CAMERA names the real
 * dump tree: it lists the real subjects and checks that each one has its table row.
 */

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { SLOTS_SUBJECTS, type BankLetter, type SlotsSubject } from './lib/slots-expectations.js';
import { createFakeRig, fakeSubjects } from './lib/bench/spec-fakes.js';
import { runSubject, type SubjectResult } from './lib/bench/spec-flow.js';
import type { BenchSubject } from './lib/bench/types.js';
import { benchRoot, listBenchSubjects } from './lib/bench/index.js';
import {
  ROW_NAME_OF_SUBJECT,
  judgeSubject,
  reasonMatches,
  verdictRowOf,
  type BankObservation,
  type SubjectObservation,
} from './lib/bench/verdict.js';

/** The table's rows the tests name, by their name in the table. */
function rowNamed(name: string): SlotsSubject {
  const row = SLOTS_SUBJECTS.find((candidate) => candidate.name === name);
  if (row === undefined) throw new Error(`the table has no row "${name}"`);
  return row;
}

/** Row 14 of TESTING.md 42.21: every bank refused, with the banner. */
const ROW_14 = 'Compact 4.16.1.7 (FF)';
/** Row 20 of TESTING.md 42.21: bank B's own image refused; A, R and B-from-A written. */
const ROW_20 = 'Compact PRO 4.9.1.15 (std)';
/** A writable row of the 4.x line. */
const WRITABLE = 'Compact 4.8.1.9';

/** The page's logged reason for row 14's refusal (the one the page's own check gives: web useSlotsPanel, core write-keys). */
const ROW_14_LOGGED =
  'the running application (bank A, firmware 4.16.1.7) checks an upload under its own keys before it programs it';
/** The banner the page shows for row 14: the heading and the reason under it. */
const ROW_14_BANNER =
  'No bank of this camera can be written from here. the running application checks an upload under its own keys before it programs it';

const WRITTEN: BankObservation = { offer: null, write: 'written' };
const REFUSED = (reason: string): BankObservation => ({
  offer: { accepted: false, reason },
  write: 'none',
});

/** What the flow saw: each bank's observation, the banner, and whether every bank ran to its step. */
function seen(
  banks: Partial<Record<BankLetter, BankObservation>> = {},
  options: {
    readonly banner?: string | null;
    readonly finished?: boolean;
    readonly read?: boolean;
  } = {},
): SubjectObservation {
  return {
    banks: { a: banks.a ?? WRITTEN, b: banks.b ?? WRITTEN, r: banks.r ?? WRITTEN },
    banner: options.read === false ? null : { shown: options.banner ?? null },
    finished: options.finished ?? true,
  };
}

describe('the verdict table, mapped to the dump tree', () => {
  it('names one table row for each of the 28 subjects, and each row once', () => {
    expect(ROW_NAME_OF_SUBJECT.size).toBe(SLOTS_SUBJECTS.length);
    expect(new Set(ROW_NAME_OF_SUBJECT.values()).size).toBe(SLOTS_SUBJECTS.length);
    expect([...ROW_NAME_OF_SUBJECT.values()].sort()).toEqual(
      SLOTS_SUBJECTS.map((row) => row.name).sort(),
    );
  });

  it('finds a subject its row by family and folder, and nothing else', () => {
    const subject = {
      family: 'Compact Pro',
      folder: '2019.03.14-09.18.41-4.9.1.15',
    };
    expect(verdictRowOf(subject)?.name).toBe(ROW_20);
    expect(
      verdictRowOf({ family: 'Compact', folder: '2018.09.04-15.37.00-4.16.1.7-FF' })?.name,
    ).toBe(ROW_14);
    expect(verdictRowOf({ family: 'Compact', folder: 'fake-1.3.0.0' })).toBeNull();
    expect(
      verdictRowOf({ family: 'Compact XR', folder: '2019.03.14-09.18.41-4.9.1.15' }),
    ).toBeNull();
  });

  it('finds no row when the table has none under the name the map gives', () => {
    const subject = { family: 'Compact Pro', folder: '2019.03.14-09.18.41-4.9.1.15' };
    expect(
      verdictRowOf(
        subject,
        SLOTS_SUBJECTS.filter((row) => row.name !== ROW_20),
      ),
    ).toBeNull();
  });
});

describe('the judge: row 14 (every bank refused, with the banner)', () => {
  const row = rowNamed(ROW_14);
  const refusedAll = seen(
    { a: REFUSED(ROW_14_LOGGED), b: REFUSED(ROW_14_LOGGED), r: REFUSED(ROW_14_LOGGED) },
    { banner: ROW_14_BANNER },
  );

  it('passes when the page refuses every bank with the reason and shows the banner', () => {
    const judged = judgeSubject(row, {
      ...refusedAll,
      banks: {
        a: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'none' },
        b: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'none' },
        r: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'none' },
      },
    });
    expect(judged.failures).toEqual([]);
    expect(judged.passedAs).toBe('refusal');
    expect(judged.banks.map((bank) => [bank.bank, bank.refused, bank.written])).toEqual([
      ['a', true, false],
      ['b', true, false],
      ['r', true, false],
    ]);
  });

  it('fails when the page takes an image the table refuses', () => {
    const judged = judgeSubject(row, {
      ...refusedAll,
      banks: {
        a: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'none' },
        b: { offer: { accepted: true, reason: null }, write: 'none' },
        r: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'none' },
      },
    });
    expect(judged.failures.join(' ')).toMatch(/bank B: the page takes the image offered/);
    expect(judged.passedAs).toBeNull();
  });

  it('fails when the page refuses a bank for another reason than the table records', () => {
    const judged = judgeSubject(row, {
      ...refusedAll,
      banks: {
        a: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'none' },
        b: {
          offer: { accepted: false, reason: 'cannot use this file: wrong size' },
          write: 'none',
        },
        r: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'none' },
      },
    });
    expect(judged.failures.join(' ')).toMatch(/bank B: the page refuses it for "cannot use/);
  });

  it('fails when the page refuses but shows no banner, since the table records one', () => {
    const judged = judgeSubject(row, {
      ...refusedAll,
      banks: {
        a: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'none' },
        b: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'none' },
        r: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'none' },
      },
      banner: { shown: null },
    });
    expect(judged.failures.join(' ')).toMatch(
      /the table records the banner .* and the page shows none/,
    );
  });

  it('a refused row that the page writes anyway fails', () => {
    const judged = judgeSubject(row, {
      ...refusedAll,
      banks: {
        a: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'written' },
        b: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'none' },
        r: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'none' },
      },
    });
    expect(judged.failures.join(' ')).toMatch(/bank A: the page took a write to it/);
    expect(judged.passedAs).toBeNull();
  });

  it('a bank with no image of its own to offer fails, once the run has finished', () => {
    const finished = judgeSubject(row, {
      ...refusedAll,
      banks: {
        a: { offer: null, write: 'none' },
        b: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'none' },
        r: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'none' },
      },
    });
    expect(finished.failures.join(' ')).toMatch(
      /bank A: the table records a refusal .* no image of its own/,
    );
    const stopped = judgeSubject(row, {
      ...refusedAll,
      finished: false,
      banks: {
        a: { offer: null, write: 'none' },
        b: { offer: { accepted: false, reason: ROW_14_LOGGED }, write: 'none' },
        r: { offer: null, write: 'none' },
      },
    });
    expect(stopped.failures).toEqual([]);
  });
});

describe('the judge: row 20 (bank B own image refused; A, R and B-from-A written)', () => {
  const row = rowNamed(ROW_20);
  const ownRefusal = row.ownImage?.reason ?? '';

  it('the table records the own image of bank B as refused, and bank B as writable', () => {
    expect(row.ownImage?.bank).toBe('b');
    expect(row.banks.b.writable).toBe(true);
  });

  it('passes as a write and a refusal: B refused, B written from another image, A and R written', () => {
    const judged = judgeSubject(
      row,
      seen({ b: { offer: { accepted: false, reason: ownRefusal }, write: 'written' } }),
    );
    expect(judged.failures).toEqual([]);
    expect(judged.passedAs).toBe('write and refusal');
    expect(judged.banks.map((bank) => [bank.bank, bank.refused, bank.written])).toEqual([
      ['a', false, true],
      ['b', true, true],
      ['r', false, true],
    ]);
  });

  it('fails when the page takes the own image of B, since the table records its refusal', () => {
    const judged = judgeSubject(
      row,
      seen({ b: { offer: { accepted: true, reason: null }, write: 'written' } }),
    );
    expect(judged.failures.join(' ')).toMatch(/bank B: the page takes the image offered/);
  });

  it('fails when the own image of B is refused for another reason than the table records', () => {
    const judged = judgeSubject(
      row,
      seen({
        b: {
          offer: { accepted: false, reason: 'cannot use this file: 1.0.3.2' },
          write: 'written',
        },
      }),
    );
    expect(judged.failures.join(' ')).toMatch(
      /bank B: the page refuses it for "cannot use this file: 1.0.3.2"/,
    );
  });

  it('fails when B is not written from another image, once the run has finished', () => {
    const judged = judgeSubject(
      row,
      seen({ b: { offer: { accepted: false, reason: ownRefusal }, write: 'none' } }),
    );
    expect(judged.failures.join(' ')).toMatch(
      /bank B: not written, and the table says it is writable/,
    );
  });

  it('fails when the write of B from another image did not read back as written', () => {
    const judged = judgeSubject(
      row,
      seen({ b: { offer: { accepted: false, reason: ownRefusal }, write: 'failed' } }),
    );
    expect(judged.failures.join(' ')).toMatch(/bank B: its write did not read back as written/);
    expect(judged.passedAs).toBeNull();
  });
});

describe('the judge: a writable row', () => {
  const row = rowNamed(WRITABLE);

  it('passes as a write when every bank is written and nothing is refused', () => {
    const judged = judgeSubject(row, seen());
    expect(judged.failures).toEqual([]);
    expect(judged.passedAs).toBe('write');
  });

  it('fails when a write does not read back as written (the table says writable)', () => {
    const judged = judgeSubject(row, seen({ b: { offer: null, write: 'failed' } }));
    expect(judged.failures.join(' ')).toMatch(/bank B: its write did not read back as written/);
    expect(judged.passedAs).toBeNull();
  });

  it('fails when a writable bank is not written at all, once the run has finished', () => {
    const judged = judgeSubject(row, seen({ r: { offer: null, write: 'none' } }));
    expect(judged.failures.join(' ')).toMatch(
      /bank R: not written, and the table says it is writable/,
    );
    expect(judged.passedAs).toBeNull();
  });

  it('a run that stopped early reports its own failure, not a missing write', () => {
    const judged = judgeSubject(
      row,
      seen({ r: { offer: null, write: 'none' } }, { finished: false }),
    );
    expect(judged.failures).toEqual([]);
  });

  it('fails when the page refuses the image of a bank the table says is writable', () => {
    const judged = judgeSubject(
      row,
      seen({ a: { offer: { accepted: false, reason: 'refused' }, write: 'written' } }),
    );
    expect(judged.failures.join(' ')).toMatch(/bank A: the page refuses its image/);
  });

  it('fails when the camera shows a banner on a row that records none', () => {
    const judged = judgeSubject(
      row,
      seen({}, { banner: 'No bank of this camera can be written from here.' }),
    );
    expect(judged.failures.join(' ')).toMatch(
      /the page shows the banner .* and the table records none/,
    );
  });

  it('judges nothing about the banner when the page was not read', () => {
    const judged = judgeSubject(row, seen({}, { read: false }));
    expect(judged.failures).toEqual([]);
  });
});

describe('reasonMatches: the table fragment, against the logged reason', () => {
  it('matches a fragment anywhere in the reason, across whitespace', () => {
    expect(reasonMatches(ROW_14_LOGGED, 'checks an upload under its own keys')).toBe(true);
    expect(
      reasonMatches(
        'the page\n  checks an upload\tunder its own keys',
        'checks an upload under its own keys',
      ),
    ).toBe(true);
  });

  it('does not match a different reason, or no reason at all', () => {
    expect(
      reasonMatches('cannot use this file: wrong size', 'checks an upload under its own keys'),
    ).toBe(false);
    expect(reasonMatches(null, 'checks an upload under its own keys')).toBe(false);
  });

  it('the empty fragment means any refusal', () => {
    expect(reasonMatches('anything at all', '')).toBe(true);
    expect(reasonMatches(null, '')).toBe(false);
  });
});

/** The first fake subject: the test names it, so a missing one is a failure of the fixture. */
function firstSubject(list: readonly BenchSubject[]): BenchSubject {
  const found = list.at(0);
  if (found === undefined) throw new Error('the fixture has no fake subject');
  return found;
}

describe('the flow on the fake rig, held to the table (runSubject)', () => {
  let dir = '';
  let subjects: BenchSubject[] = [];
  const log = (): void => undefined;

  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'seek-verdict-test-'));
    subjects = fakeSubjects(path.join(dir, 'fake'));
  });
  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  /** The fake page's rows for the two subjects: row 14 for the first, row 20 for the second. */
  const verdicts = (): SlotsSubject[] => [rowNamed(ROW_14), rowNamed(ROW_20)];

  function run(index: number, verdictRows: readonly SlotsSubject[]): Promise<SubjectResult> {
    const rig = createFakeRig({ subjects, failure: null, verdicts: verdictRows });
    const subject = subjects[index];
    if (subject === undefined) throw new Error(`no fake subject ${String(index)}`);
    return runSubject(rig, subject, log, false);
  }

  it('row 14 on the fake page: every bank refused with the reason, banner shown, nothing written', async () => {
    const result = await run(0, verdicts());
    expect(result.failures).toEqual([]);
    expect(result.judgement?.passedAs).toBe('refusal');
    expect(result.slotWrites.map((write) => write.state)).toEqual([
      'refused',
      'refused',
      'refused',
    ]);
    expect(result.bootProof).toBe('not-run');
    expect(result.notes.join('\n')).toMatch(/boot proof not run: the table records a refusal/);
    expect(result.pageBanner?.shown).toContain('checks an upload under its own keys');
  });

  it('row 20 on the fake page: B refused as its own image, then B, A and R written; the boot proof passes', async () => {
    const result = await run(1, verdicts());
    expect(result.failures).toEqual([]);
    expect(result.judgement?.passedAs).toBe('write and refusal');
    const writes = Object.fromEntries(result.slotWrites.map((write) => [write.bank, write.state]));
    expect(writes).toEqual({ b: 'passed', a: 'passed', r: 'passed' });
    expect(result.slotWrites.find((write) => write.bank === 'b')?.offer?.accepted).toBe(false);
    expect(result.slotWrites.find((write) => write.bank === 'b')?.notes.join(' ')).toMatch(
      /written with bank A's image \(its own image is refused by the table\)/,
    );
    expect(result.bootProof).toBe('passed');
  });

  it('a writable row whose write fails fails the subject, and passes as nothing', async () => {
    const rig = createFakeRig({
      subjects,
      failure: { subject: 0, step: 'write' },
    });
    const result = await runSubject(rig, firstSubject(subjects), log, false);
    expect(result.failures.join(' ')).toMatch(/write B: Failed/);
    expect(result.judgement?.passedAs).toBeNull();
    expect(result.bootProof).toBe('not-run');
  });

  it('a subject the table has no row for is not run, and fails', async () => {
    const rig = createFakeRig({ subjects, failure: null, verdicts: [] });
    const result = await runSubject(rig, firstSubject(subjects), log, false);
    expect(result.failures.join(' ')).toMatch(/the verdict table has no row for/);
    expect(result.slotWrites.every((write) => write.state === 'not-run')).toBe(true);
  });
});

describe.skipIf(!process.env.SEEK_FULL_DUMPS_BY_CAMERA?.trim())(
  'the real dump tree (SEEK_FULL_DUMPS_BY_CAMERA): every launchable subject has its table row',
  () => {
    it('maps the 28 launchable subjects of the tree (0.8.0.0 and above) to their rows', () => {
      /* The Compact index lists every family's rows (Compact Pro, XR, Mosaic, Nano) under its own folder. */
      const subjects = listBenchSubjects({ root: benchRoot(), camera: 'Compact' }).filter(
        (subject) => subject.slotsSupported,
      );
      expect(subjects, 'the subjects the bench runs').toHaveLength(SLOTS_SUBJECTS.length);
      const unmapped = subjects.filter((subject) => verdictRowOf(subject) === null);
      expect(
        unmapped.map((subject) => `${subject.family} ${subject.folder}`),
        'subjects with no table row',
      ).toEqual([]);
    });
  },
);
