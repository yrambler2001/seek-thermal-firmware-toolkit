/**
 * The words TESTING.md 42.98 fixed after Preserve ran on the Compact PRO FF board (1.0.3.0): the banks a
 * choice writes, said once; the drain's planned stop (the start entered a bank the run did not patch)
 * recorded so the run goes on to the restore; the last screen of a run with no complete image.
 */
import { describe, expect, it } from 'vitest';

import { SeekError } from '../../src/errors.js';
import { bankChoiceWritesWords, type PreserveChoiceVerdict } from '../../src/preservation/banks.js';
import {
  PRESERVE_UNPATCHED_START_STOP,
  preserveDoneWords,
  recordStepFailure,
  unpatchedStartOf,
  type PreserveRunState,
} from '../../src/preservation/steps.js';

const verdict = (over: Partial<PreserveChoiceVerdict>): PreserveChoiceVerdict => ({
  choice: 'r',
  banks: ['r'],
  what: 'recovery R',
  warnings: [],
  ...over,
});

/** The drain's stop, as core throws it (`enteredUnpatchedRefusal`). */
const stop = new SeekError(
  'pipeline/refused',
  'after the restart the camera reports it entered slot A (active-slot word 0), which this run did ' +
    'not patch (it patched recovery R). The whole-flash read runs only through the patched image, so ' +
    'nothing was armed or read.',
  { detail: { entered: 'a', targets: ['r'] } },
);

/** A run after its commit: the drain is next. Only the fields these helpers read are real. */
const afterCommit = {
  version: 3,
  runId: 'preserve-2026-10-26T16-34-54Z',
  createdAt: '2026-10-26T16:34:54Z',
  nextStep: 'drain',
  steps: { commit: { status: 'done' } },
  choice: 'r',
  targets: ['r'],
} as unknown as PreserveRunState;

describe('bankChoiceWritesWords: the banks a choice writes, each named once', () => {
  it('a choice by name says so, instead of naming the bank twice ("recovery R: recovery R")', () => {
    expect(bankChoiceWritesWords(verdict({}))).toBe('recovery R, the bank chosen by name');
    expect(bankChoiceWritesWords(verdict({ choice: 'a', banks: ['a'], what: 'slot A' }))).toBe(
      'slot A, the bank chosen by name',
    );
  });

  it('the next start and every bank keep their own words, which name the banks', () => {
    const next = 'recovery R, the bank the next start enters: the boot-config word is 2, …';
    expect(bankChoiceWritesWords(verdict({ choice: 'next-start', what: next }))).toBe(next);
    const all = 'every bank that holds an image: slot A, slot B and recovery R';
    expect(
      bankChoiceWritesWords(verdict({ choice: 'all', banks: ['a', 'b', 'r'], what: all })),
    ).toBe(all);
  });

  it('a choice not offered gives its reason', () => {
    const why = 'slot B cannot be written: it is erased';
    expect(bankChoiceWritesWords(verdict({ choice: 'b', banks: null, what: why }))).toBe(why);
  });
});

describe("the drain's planned stop", () => {
  it('unpatchedStartOf names the bank the start entered, and nothing for any other error', () => {
    expect(unpatchedStartOf(stop)).toBe('a');
    expect(unpatchedStartOf(new SeekError('pipeline/refused', 'another refusal'))).toBeNull();
    expect(unpatchedStartOf(new Error('the camera did not answer'))).toBeNull();
    expect(unpatchedStartOf('a')).toBeNull();
  });

  it('is recorded as a failed drain whose run goes on to the restore, with the bank it entered', () => {
    const state = recordStepFailure(afterCommit, 'drain', stop);
    expect(state.steps.drain?.status).toBe('failed');
    expect(state.steps.drain?.error).toBe(stop.message);
    expect(state.nextStep).toBe('restore');
    expect(state.drainEntered).toBe('a');
  });

  it('any other drain failure leaves the drain next, as before', () => {
    const state = recordStepFailure(
      afterCommit,
      'drain',
      new Error('the camera did not come back'),
    );
    expect(state.nextStep).toBe('drain');
    expect(state.drainEntered).toBeUndefined();
    /* The same refusal from another step does not move the run on. */
    expect(recordStepFailure(afterCommit, 'commit', stop).nextStep).toBe('drain');
  });

  it('the stop says what happened and what comes next, and names neither front end', () => {
    expect(PRESERVE_UNPATCHED_START_STOP).toBe(
      'Stopped before the whole-flash read: the camera started a bank this run did not patch, so ' +
        'nothing was read. The restore puts every written bank back.',
    );
    expect(PRESERVE_UNPATCHED_START_STOP).not.toMatch(/page|CLI|seek-fw|--|step 0/i);
  });
});

describe('preserveDoneWords: the last screen and the last lines', () => {
  it('a run that delivered the complete image says the firmware is preserved', () => {
    const done = preserveDoneWords({ ...afterCommit, deliveredSha256: 'd2ee76b4' });
    expect(done.title).toBe('Done — your firmware is preserved');
    expect(done.detail).toContain("The complete image is the camera's whole original flash");
  });

  it('a run whose drain stopped does not claim a complete image', () => {
    const done = preserveDoneWords({
      ...afterCommit,
      nextStep: 'done',
      verify: { diffBytes: 0, windowsRead: 31, badWindows: [] },
    });
    expect(done.title).toBe('Done — the camera is back as it was; there is no complete image');
    expect(done.detail).toBe(
      'The whole-flash read did not run, so this run has no complete image of the flash. Every ' +
        'written bank was put back, and a fresh read of the 31 blocks a normal dump reaches matches ' +
        'the backup. For the complete image, start a new run with a choice that includes the bank ' +
        'the next start enters.',
    );
    expect(`${done.title} ${done.detail}`).not.toMatch(/preserved|page|CLI|seek-fw/i);
  });
});
