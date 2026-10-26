/**
 * The gating table, walked row by row — the wizard's sync mirror of core's
 * `describeStepGate`, regrouped at PHASE granularity: a phase's gate is the
 * gate of every core step it will run, with the ordering preconditions the
 * phase satisfies itself (patch's backup, drain's commit) treated as met.
 * The loud `pastCommit` context, the danger-dialog set, and the explicit
 * jump (`allowJump`) all live here.
 */

import { describe, expect, it } from 'vitest';
import {
  preserveBankOf,
  preserveBootOf,
  preserveErasedBankOf,
  preserveRunStateOf,
  withoutPatch,
} from '../../test-fixtures';
import { canRunPhase } from './gating';
import type { PreservePhaseId, PreserveRunState } from './types';

function runState(
  overrides: {
    backup?: 'done' | 'failed';
    patch?: 'done' | 'failed';
    commit?: 'done' | 'failed';
    drain?: 'done' | 'failed';
    restore?: 'done' | 'failed';
    verify?: 'done' | 'failed';
    /** The backup's bank facts and the resolved choice; default: present once the backup is done. */
    banks?: boolean;
    nextStep?: PreserveRunState['nextStep'];
    /** The FF build: the restore refuses and the route is recovery-only (recovery R written). */
    restoreNone?: boolean;
    /** A cipher family: the restore stages the derived plaintext. */
    ciphered?: boolean;
  } = {},
): PreserveRunState {
  const step = (status: 'done' | 'failed' | undefined) =>
    status === undefined ? undefined : { status };
  const banks = overrides.banks ?? overrides.backup === 'done';
  const ff = overrides.restoreNone === true;
  const base = preserveRunStateOf({
    runId: 'preserve-test',
    nextStep: overrides.nextStep ?? 'backup',
    stagedForm: overrides.ciphered === true ? 'xor-ks0' : 'plain',
    restoreForm: ff ? 'none' : 'capture-verbatim',
    route: ff ? 'recovery-only' : 'active-bank',
    boot: preserveBootOf(ff ? { nextStart: 'r', entered: 'r', activeSlotWord: 2 } : {}),
    banks: ff
      ? { a: preserveErasedBankOf('a'), b: preserveErasedBankOf('b'), r: preserveBankOf('r') }
      : { a: preserveBankOf('a'), b: preserveErasedBankOf('b'), r: preserveErasedBankOf('r') },
    targets: ff ? ['r'] : ['a'],
    steps: {
      backup: step(overrides.backup),
      patch: step(overrides.patch),
      commit: step(overrides.commit),
      drain: step(overrides.drain),
      restore: step(overrides.restore),
      verify: step(overrides.verify),
    } as PreserveRunState['steps'],
  });
  if (banks) return base;
  const { boot: _boot, banks: _banks, targets: _targets, ...rest } = base;
  return rest;
}

const NOTHING = (): boolean => false;
const HAS_ALL = (): boolean => true;

function gate(
  state: PreserveRunState | null,
  phase: PreservePhaseId,
  has: (name: string) => boolean = HAS_ALL,
) {
  return canRunPhase({ state, phase, has });
}

const ALL_PHASES: readonly PreservePhaseId[] = ['read-build', 'patch-dump', 'restore-verify'];

describe('canRunPhase — the run’s gate, as the buttons show it', () => {
  it('before a run exists only the first phase is armed — it creates the run', () => {
    expect(gate(null, 'read-build').ok).toBe(true);
    for (const phase of ['patch-dump', 'restore-verify'] as const) {
      const g = gate(null, phase);
      expect(g.ok, phase).toBe(false);
      expect(g.missing[0], phase).toContain('no run is active');
      expect(g.pastCommit, phase).toBe(false);
      expect(g.jumpable, phase).toBe(false);
    }
  });

  it('a failed backup with powerCycleRequired holds phase ① for the power-cycle assertion', () => {
    const state = {
      ...runState({ backup: 'failed' }),
      steps: {
        ...runState({ backup: 'failed' }).steps,
        backup: { status: 'failed', powerCycleRequired: true, error: 'spent reader' },
      },
    } as unknown as PreserveRunState;
    const g = gate(state, 'read-build');
    expect(g.ok).toBe(false);
    expect(g.needsPowerCycle).toBe(true);
    expect(g.jumpable).toBe(false);
    expect(g.missing.join('; ')).toMatch(/power-cycle assertion/);
    /* The other phases are untouched by the backup's retry gate. */
    expect(gate(state, 'patch-dump').needsPowerCycle).toBe(false);
    /* A failed backup WITHOUT the flag (any other failure shape) is a normal
     * re-run: the phase arms as before. */
    const other = {
      ...runState({ backup: 'failed' }),
      steps: {
        ...runState({ backup: 'failed' }).steps,
        backup: { status: 'failed', error: 'something else' },
      },
    } as unknown as PreserveRunState;
    expect(gate(other, 'read-build').ok).toBe(true);
    expect(gate(other, 'read-build').needsPowerCycle).toBe(false);
  });

  it('a fresh run: phase ① armed; the later phases wait, in the run’s normal order', () => {
    const state = runState();
    const first = gate(state, 'read-build');
    expect(first).toMatchObject({ ok: true, pastCommit: false, startStep: 'backup' });

    const second = gate(state, 'patch-dump');
    expect(second.ok).toBe(false);
    expect(second.pastCommit).toBe(false); /* a fresh run is not the anomalous case */
    expect(second.missing).toEqual([
      'the flash backup',
      'the patch step',
      'the banks the backup reads',
    ]);

    const third = gate(state, 'restore-verify');
    expect(third.ok).toBe(false);
    expect(third.pastCommit).toBe(false);
    expect(third.missing[0]).toContain('the commit');
    expect(third.jumpable).toBe(false); /* the banks and their patches are missing too */
  });

  it('after phase ①: phase ② arms, phase ③ simply waits — the normal order is not an alarm', () => {
    const state = runState({ backup: 'done', patch: 'done', nextStep: 'commit' });
    expect(gate(state, 'read-build').missing[0]).toContain('already done');

    const second = gate(state, 'patch-dump');
    expect(second).toMatchObject({ ok: true, confirm: true, startStep: 'commit', jumpable: false });
    expect(second.pastCommit).toBe(false);

    const third = gate(state, 'restore-verify');
    expect(third.ok).toBe(false);
    expect(third.pastCommit).toBe(false);
    expect(third.jumpable).toBe(false);
    expect(third.missing).toEqual(['the commit (run or resume at it first)']);
    expect(third.jumpStartStep).toBeNull();
  });

  it('after the commit: phase ② starts at the drain (no dialog needed for it), phase ③ arms', () => {
    const state = runState({
      backup: 'done',
      patch: 'done',
      commit: 'done',
      nextStep: 'drain',
    });
    const second = gate(state, 'patch-dump');
    expect(second).toMatchObject({ ok: true, startStep: 'drain' });
    expect(second.confirm).toBe(false); /* only the drain is left, and the drain reads */
    const third = gate(state, 'restore-verify');
    expect(third).toMatchObject({ ok: true, confirm: true, pastCommit: false });
  });

  it('each phase arms exactly the next one', () => {
    const drained = runState({
      backup: 'done',
      patch: 'done',
      commit: 'done',
      drain: 'done',
      nextStep: 'restore',
    });
    expect(gate(drained, 'patch-dump').missing[0]).toContain('already done');
    expect(gate(drained, 'restore-verify')).toMatchObject({ ok: true, startStep: 'restore' });

    const restored = runState({
      backup: 'done',
      patch: 'done',
      commit: 'done',
      drain: 'done',
      restore: 'done',
      nextStep: 'verify',
    });
    const third = gate(restored, 'restore-verify');
    expect(third).toMatchObject({ ok: true, startStep: 'verify' });
    expect(third.confirm).toBe(false); /* only the verify read is left */
  });

  it('a done run refuses everything', () => {
    const state = runState({
      backup: 'done',
      patch: 'done',
      commit: 'done',
      drain: 'done',
      restore: 'done',
      verify: 'done',
      nextStep: 'done',
    });
    for (const phase of ALL_PHASES) {
      const g = gate(state, phase);
      expect(g.ok, phase).toBe(false);
      expect(g.jumpable, phase).toBe(false);
      expect(g.missing[0], phase).toContain('this run is done');
    }
  });

  it('missing checkpoints keep the phase dark, in core’s order, without repeats', () => {
    const state = runState({ backup: 'done', patch: 'done', nextStep: 'commit' });
    const g = gate(state, 'patch-dump', NOTHING);
    expect(g.ok).toBe(false);
    expect(g.jumpable).toBe(false); /* a jump cannot fabricate the capture */
    /* The capture is wanted by both the commit and the drain; named once. */
    expect(g.missing).toEqual([
      'the backup windows file',
      'slot A’s capture',
      'slot A’s derived image',
    ]);
  });
});

describe('canRunPhase — the banks the commit writes', () => {
  it('a choice the backup could not resolve keeps phase ② dark, with the choice’s own reason', () => {
    const base = runState({ backup: 'done', patch: 'done', nextStep: 'commit' });
    const { targets: _targets, ...unresolved } = base;
    const state: PreserveRunState = {
      ...unresolved,
      boot: preserveBootOf({ nextStart: 'b', why: 'slot B is tried first and passes' }),
    };
    const g = gate(state, 'patch-dump');
    expect(g.ok).toBe(false);
    expect(g.missing.join(' ')).toMatch(/a choice of banks — the next start enters slot B/);
  });

  it('wants every chosen bank’s patch, capture and derived image, by name', () => {
    const state: PreserveRunState = {
      ...runState({ backup: 'done', patch: 'done', nextStep: 'commit' }),
      choice: 'all',
      targets: ['a', 'r'],
      banks: {
        a: preserveBankOf('a'),
        b: preserveErasedBankOf('b'),
        r: withoutPatch(preserveBankOf('r')),
      },
    };
    const g = canRunPhase({
      state,
      phase: 'patch-dump',
      has: (name) => !name.includes('bank_r'),
    });
    expect(g.ok).toBe(false);
    expect(g.missing).toEqual([
      'the patch of recovery R',
      'recovery R’s capture',
      'recovery R’s derived image',
    ]);
  });

  it('the recovery-only build refuses a choice that writes another bank', () => {
    const ff = runState({ backup: 'done', patch: 'done', nextStep: 'commit', restoreNone: true });
    const state: PreserveRunState = {
      ...ff,
      targets: ['a'],
      banks: { a: preserveBankOf('a'), b: preserveErasedBankOf('b'), r: preserveBankOf('r') },
    };
    const g = gate(state, 'patch-dump');
    expect(g.ok).toBe(false);
    expect(g.missing.join(' ')).toMatch(/runs only from recovery R, not slot A/);
  });
});

describe('canRunPhase — the past-commit context and the jump', () => {
  it('a FAILED commit offers both ways forward: the re-run and the jump past it', () => {
    const state = runState({
      backup: 'done',
      patch: 'done',
      commit: 'failed',
      nextStep: 'commit',
    });
    const second = gate(state, 'patch-dump');
    /* The normal run stays available — the commit's own pre-check sorts
     * landed from not-landed. */
    expect(second.ok).toBe(true);
    expect(second.pastCommit).toBe(true);
    expect(second.jumpable).toBe(true);
    expect(second.startStep).toBe('commit');
    expect(second.jumpStartStep).toBe('drain');
    expect(second.confirm).toBe(true);
    /* And phase ③ is jump-only while the failed commit leaves it in doubt. */
    const third = gate(state, 'restore-verify');
    expect(third.ok).toBe(false);
    expect(third.jumpable).toBe(true);
    expect(third.pastCommit).toBe(true);
  });

  it('the jump refuses when anything beyond the ordering gate is missing', () => {
    const state = runState({ backup: 'done', patch: 'done', commit: 'failed', nextStep: 'commit' });
    const g = gate(state, 'restore-verify', NOTHING);
    expect(g.ok).toBe(false);
    expect(g.jumpable).toBe(false); /* the capture is gone; allowJump cannot help */
    expect(g.missing.length).toBeGreaterThan(1);
  });

  it('the FF build’s restore refusal is a hard stop, not a jump', () => {
    const state = runState({
      backup: 'done',
      patch: 'done',
      commit: 'done',
      drain: 'done',
      restoreNone: true,
      nextStep: 'restore',
    });
    const third = gate(state, 'restore-verify');
    expect(third.ok).toBe(false);
    expect(third.jumpable).toBe(false);
    expect(third.missing.join(' ')).toContain('restore refuses');
  });

  it('a cipher family’s restore wants the derived plaintext artifact', () => {
    const base = {
      backup: 'done',
      patch: 'done',
      commit: 'done',
      drain: 'done',
      ciphered: true,
      nextStep: 'restore',
    } as const;
    const without = gate(
      runState(base),
      'restore-verify',
      (name) => name !== 'preserve_bank_a_plain.bin',
    );
    expect(without.ok).toBe(false);
    expect(without.missing.join(' ')).toContain('preserve_bank_a_plain.bin');

    const withPlain = gate(runState(base), 'restore-verify');
    expect(withPlain.ok).toBe(true);
  });

  it('never flags pastCommit before the run stands past phase ①', () => {
    const fresh = runState();
    for (const phase of ALL_PHASES) {
      expect(gate(fresh, phase).pastCommit, phase).toBe(false);
    }
  });
});

describe('canRunPhase — the danger dialog', () => {
  it('asks before the write phases, and never before the read phase', () => {
    const fresh = runState();
    expect(gate(fresh, 'read-build').confirm).toBe(false);
    /* The flag is about the phase's pending steps, not about whether the
     * gate arms them — a refused ② still contains the commit. */
    expect(gate(fresh, 'patch-dump').confirm).toBe(true);
    expect(gate(fresh, 'restore-verify').confirm).toBe(true);
    const afterFirst = runState({ backup: 'done', patch: 'done', nextStep: 'commit' });
    expect(gate(afterFirst, 'patch-dump').confirm).toBe(true);
    expect(gate(afterFirst, 'restore-verify').confirm).toBe(true);
    /* A resumed ② at the drain (the write already landed) runs without one. */
    const atDrain = runState({
      backup: 'done',
      patch: 'done',
      commit: 'done',
      nextStep: 'drain',
    });
    expect(gate(atDrain, 'patch-dump').confirm).toBe(false);
  });
});
