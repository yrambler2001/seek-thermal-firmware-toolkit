/**
 * Crafted Preserve run files for the phone-layout runs: the page reads them as
 * a real run's `preserve_run.json` and draws that run's screen, with no camera
 * and no binaries.
 */

import { buildZip, type PreserveRunState } from '@seek-fw/core';

/** A finished, verified run: the "Verified — a perfect match." summary. */
export function verifiedRunState(): PreserveRunState {
  const erased = (key: 'b' | 'r', address: number, mode: number) => ({
    key,
    address,
    mode,
    holds: 'erased' as const,
    refused: 'it is erased: every byte reads 0xFF, so it holds no image',
  });
  return {
    version: 3,
    runId: 'preserve-phone-sample',
    createdAt: '2026-10-05T00:00:00.000Z',
    nextStep: 'done',
    choice: 'next-start',
    targets: ['a'],
    anchor: 'a',
    boot: {
      cfgHex: 'ffffffff',
      word: 0xffffffff,
      rule: 'slot A first, then B, then recovery R',
      activeSlotWord: 0,
      entered: 'a',
      verdicts: { a: true, b: false, r: false },
      nextStart: 'a',
      why: 'the boot-config word 0xFFFFFFFF tries slot A first, and slot A passes its check',
      checkKeyUnnamed: null,
    },
    banks: {
      a: {
        key: 'a',
        address: 0x14050000,
        mode: 7,
        holds: 'image',
        refused: null,
        slotReadShas: ['983a7010' + '0'.repeat(56), '983a7010' + '0'.repeat(56)],
        imageSha256: '8473b5e4' + '0'.repeat(56),
        buildId: 'compact-1.3.0.0',
        buildLabel: 'Compact 1.3.0.0',
        patch: {
          sites: [
            { name: 'reader widen', offset: 0x3c1c, before: [0x00, 0x30], after: [0x00, 0x50] },
          ],
          rebalanceWord: 0x50c06240,
          stagedLength: 47768,
          chunkCount: 747,
          patchedSha256: '8473b5e4' + '0'.repeat(56),
          diffCount: 13,
          armResetsCursor: true,
        },
      },
      b: erased('b', 0x14060000, 8),
      r: erased('r', 0x14070000, 9),
    },
    buildStorage: 'v1-2014',
    buildId: 'compact-1.3.0.0',
    buildLabel: 'Compact 1.3.0.0',
    expectedVersion: '1.3.0.0',
    deliveredSha256: '40447c7e' + '0'.repeat(56),
    rawDumpSha256: 'b22e9e20' + '0'.repeat(56),
    stagedForm: 'plain',
    restoreForm: 'capture-verbatim',
    capability: { wholePart: true, losslessReadUnit: 64, note: 'one widened-window arm' },
    drainEntered: 'a',
    verify: { diffBytes: 0, windowsRead: 31, badWindows: [] },
    steps: {
      backup: { status: 'done', notes: 'backup' },
      patch: { status: 'done', notes: 'patch' },
      commit: { status: 'done', notes: 'commit' },
      drain: { status: 'done', notes: 'drain' },
      restore: { status: 'done', notes: 'restore' },
      verify: { status: 'done', notes: '31/31 windows re-read at 0 differing bytes' },
    },
  };
}

/**
 * A run whose whole-flash read stopped as planned (the camera started a bank the
 * run did not patch): the "Stopped as planned — the restore is next" badge and
 * the restore as the next action.
 */
export function plannedStopRunState(): PreserveRunState {
  const done = verifiedRunState();
  const { verify: _verify, deliveredSha256: _delivered, ...rest } = done;
  return {
    ...rest,
    runId: 'preserve-phone-stopped',
    nextStep: 'restore',
    drainEntered: 'b',
    steps: {
      backup: { status: 'done', notes: 'backup' },
      patch: { status: 'done', notes: 'patch' },
      commit: { status: 'done', notes: 'commit' },
      drain: { status: 'failed', notes: 'the camera started slot B, which the run did not patch' },
    },
  };
}

/** `state` as the zip the page saves and loads. */
export function runFileZip(state: PreserveRunState): Uint8Array {
  return buildZip([
    { name: 'preserve_run.json', data: new TextEncoder().encode(JSON.stringify(state, null, 2)) },
    { name: 'README.md', data: new TextEncoder().encode('# sample run\n') },
  ]);
}
