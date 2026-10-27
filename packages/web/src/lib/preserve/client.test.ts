/**
 * The adapter against the real core steps API, offline paths only:
 * `createPreserveRun` — the empty, self-sourcing shell (no image argument,
 * because the image always derives from the camera) — and the patch step,
 * the one step with no camera, driven off the DERIVED plaintext served as a
 * run artifact. The camera steps are the emulator suite's business
 * (packages/core/test/preservation); here they are only checked to refuse
 * before anything opens a session.
 */

import {
  CancelledError,
  REBALANCE_WORD_OFFSET,
  SeekError,
  V1_2014_PATCH_SITES,
  buildV1Patch,
  equalBytes,
  sha256hex,
  silentReporter,
  wordSum,
  type SessionOpener,
} from '@seek-fw/core';
import { describe, expect, it } from 'vitest';
import { artifactLoader, createPreserveRun, isCancelledStep, runPreserveStep } from './client';
import { buildRunFile, parseRunFile } from './run-file';
import { preserveCaptureFile } from './types';
import { preserveBankOf, preserveBootOf, preserveErasedBankOf } from '../../test-fixtures';
import {
  preservePatchedFile,
  preservePlainFile,
  type CheckpointName,
  type PreserveRunState,
} from './types';

const PLAIN_A = preservePlainFile('a');
const PATCHED_A = preservePatchedFile('a');

/** A synthetic factory plaintext that carries the four patch sites — the
 * same recipe core's patch.test.ts uses, with a header version word. */
function syntheticPlain(): Uint8Array {
  const bytes = new Uint8Array(0x4000);
  let state = 0x12345678;
  for (let i = 0; i < bytes.length; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    bytes[i] = state & 0xff;
  }
  for (const site of V1_2014_PATCH_SITES) bytes.set(site.before, site.offset);
  bytes[0x20c] = 0x01; /* header version word 0x00000301 -> "1.3.0.0" */
  bytes[0x20d] = 0x03;
  bytes[0x20e] = 0x00;
  bytes[0x20f] = 0x00;
  for (let i = 0; i < 4; i++) bytes[REBALANCE_WORD_OFFSET + i] = 0;
  const dv = new DataView(bytes.buffer);
  const scratch = 0x3ff0;
  dv.setUint32(scratch, 0, true);
  dv.setUint32(scratch, (0 - wordSum(bytes)) >>> 0, true);
  expect(wordSum(bytes)).toBe(0);
  return bytes;
}

/** An opener that must never be reached by the offline steps. */
const NO_CAMERA: SessionOpener = {
  open: () => {
    throw new Error('no camera takes part in this test');
  },
  close: () => Promise.resolve(),
};

describe('createPreserveRun — the empty, self-sourcing shell', () => {
  it('takes no image: schema 3, the default choice is the next start, next step backup', async () => {
    const created = await createPreserveRun({
      runId: 'preserve-test',
      now: (): Date => new Date('2026-10-01T10:00:00Z'),
    });

    expect(created.state.version).toBe(3);
    expect(created.state.runId).toBe('preserve-test');
    expect(created.state.choice).toBe('next-start');
    expect(created.state.nextStep).toBe('backup');
    expect(created.state.steps).toEqual({});
    /* The build fields fill in when the backup step derives the image. */
    expect(created.state.buildStorage).toBeUndefined();
    expect(created.state.expectedVersion).toBeUndefined();
    /* No bank, no boot facts and no patch on a fresh run — nothing is read
     * or built before the camera speaks, and the choice resolves after the
     * backup. */
    expect(created.state.banks).toBeUndefined();
    expect(created.state.boot).toBeUndefined();
    expect(created.state.targets).toBeUndefined();
    expect('patch' in created).toBe(false);
  });

  it('a choice named at the start rides in the state', async () => {
    const created = await createPreserveRun({ banks: 'all' });
    expect(created.state.choice).toBe('all');
  });

  it('the form’s chunk rides in as the drain ask size', async () => {
    const created = await createPreserveRun({ drainChunk: 64 });
    expect(created.state.drainChunk).toBe(64);
  });
});

/** A checkpoint doc as it stands after the backup step — exactly what the
 *  real step records, including the sha the derived plaintext is checked
 *  against on every later load. */
async function stateAfterBackup(plain: Uint8Array): Promise<PreserveRunState> {
  const created = await createPreserveRun();
  const { patch: _patch, ...bankA } = preserveBankOf('a', { imageSha256: await sha256hex(plain) });
  return {
    ...created.state,
    nextStep: 'patch',
    buildStorage: 'v1-2014',
    expectedVersion: '1.3.0.0',
    anchor: 'a',
    boot: preserveBootOf(),
    banks: { a: bankA, b: preserveErasedBankOf('b'), r: preserveErasedBankOf('r') },
    targets: ['a'],
    steps: {
      backup: {
        status: 'done',
        startedAt: '2026-10-01T10:00:01Z',
        finishedAt: '2026-10-01T10:00:20Z',
        notes: 'test fixture',
        artifactShas: {
          [PLAIN_A]: await sha256hex(plain),
          [preserveCaptureFile('a')]: 'c'.repeat(64),
        },
      },
    },
  };
}

describe('runPreserveStep — the patch step, offline, off the derived artifact', () => {
  it('files the patched plaintext of every writable bank and advances the run to commit', async () => {
    const plain = syntheticPlain();
    const state = await stateAfterBackup(plain);
    const loader = artifactLoader(new Map([[PLAIN_A, plain]]), new Map());

    const outcome = await runPreserveStep('patch', NO_CAMERA, state, loader, silentReporter);
    expect(outcome.artifacts).toHaveLength(1);
    expect(outcome.artifacts[0]?.name).toBe(PATCHED_A);
    expect(
      equalBytes(outcome.artifacts[0]?.data ?? new Uint8Array(), buildV1Patch(plain).patched),
    ).toBe(true);
    expect(outcome.state.nextStep).toBe('commit');
    expect(outcome.state.steps.patch?.status).toBe('done');
    expect(outcome.state.banks?.a.patch?.patchedSha256).toBe(
      outcome.state.steps.patch?.artifactShas?.[PATCHED_A],
    );
    /* The enumerated change, recorded for the plan screen. */
    expect(outcome.state.banks?.a.patch?.diffCount).toBeGreaterThan(0);
  });

  it('a run zip carries the derived plaintext, and the loader serves it back by name', async () => {
    const plain = syntheticPlain();
    const state = await stateAfterBackup(plain);
    const patched = buildV1Patch(plain).patched;
    /* A resumed run: the backup step's artifacts came back inside the run ZIP. */
    const zip = buildRunFile(
      state,
      new Map<CheckpointName, Uint8Array>([
        [PLAIN_A, plain],
        [PATCHED_A, patched],
      ]),
    );
    const parsed = parseRunFile(zip);
    expect(parsed.checkpoints.has(PLAIN_A)).toBe(true);
    const loader = artifactLoader(parsed.checkpoints, parsed.extra);
    await expect(loader(PLAIN_A)).resolves.toEqual(plain);
    await expect(loader(PATCHED_A)).resolves.toEqual(patched);
  });

  it('refuses when the derived plaintext artifact is not in the run', async () => {
    const plain = syntheticPlain();
    const state = await stateAfterBackup(plain);
    await expect(
      runPreserveStep(
        'patch',
        NO_CAMERA,
        state,
        artifactLoader(new Map(), new Map()),
        silentReporter,
      ),
    ).rejects.toThrow(/this step needs preserve_bank_a_plain\.bin, which the backup step writes/);
  });

  it('refuses a plaintext artifact that changed since the backup recorded it', async () => {
    const plain = syntheticPlain();
    const state = await stateAfterBackup(plain);
    /* Different bytes under the same name — the sha check fires before
     * anything is derived. */
    const tampered = syntheticPlain();
    tampered[0x1000] = (tampered[0x1000] ?? 0) ^ 0xff;
    await expect(
      runPreserveStep(
        'patch',
        NO_CAMERA,
        state,
        artifactLoader(new Map([[PLAIN_A, tampered]]), new Map()),
        silentReporter,
      ),
    ).rejects.toThrow(/preserve_bank_a_plain\.bin changed since/);
  });

  it('the commit refuses at the gate before any session opens on a fresh run', async () => {
    const created = await createPreserveRun();
    await expect(
      runPreserveStep(
        'commit',
        NO_CAMERA,
        created.state,
        artifactLoader(new Map(), new Map()),
        silentReporter,
      ),
    ).rejects.toThrow(SeekError);
  });
});

describe('small adapter helpers', () => {
  it('isCancelledStep tells a cancel from a failure', () => {
    expect(isCancelledStep(new Error('bank mismatch'))).toBe(false);
    expect(isCancelledStep(new CancelledError())).toBe(true);
  });
});
