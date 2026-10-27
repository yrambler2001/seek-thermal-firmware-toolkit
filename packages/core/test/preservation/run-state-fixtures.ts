/* ==================================================================== *
 * Hand-built preservation run states, for the gate tests that need a state
 * a fake camera does not produce (a build's capability, a route, a bank the
 * run cannot write). The shape is the version-3 run state: the boot facts,
 * every bank, and the banks the run writes.
 * ==================================================================== */

import type {
  BankKey,
  PreserveBankRecord,
  PreserveBootFacts,
  PreservePatchSummary,
  PreserveRunState,
} from '../../src/preservation/index.js';

const ADDRESS: Readonly<Record<BankKey, number>> = { a: 0x14050000, b: 0x14060000, r: 0x14070000 };
const MODE: Readonly<Record<BankKey, number>> = { a: 7, b: 8, r: 9 };

export function patchSummaryOf(
  overrides: Partial<PreservePatchSummary> = {},
): PreservePatchSummary {
  return {
    sites: [],
    rebalanceWord: 0x3000,
    stagedLength: 0x4000,
    chunkCount: 256,
    patchedSha256: 'ab',
    diffCount: 10,
    armResetsCursor: true,
    ...overrides,
  };
}

/** A bank the run can write, with a patch; `overrides` changes any field. */
export function bankRecordOf(
  key: BankKey,
  overrides: Partial<PreserveBankRecord> = {},
): PreserveBankRecord {
  return {
    key,
    address: ADDRESS[key],
    mode: MODE[key],
    holds: 'image',
    refused: null,
    slotReadShas: ['aa', 'aa'],
    imageSha256: 'ab',
    buildId: 'v1-2014',
    buildLabel: 'Compact 1.x firmware (2014)',
    patch: patchSummaryOf(),
    ...overrides,
  };
}

/** The same bank with no patch recorded. */
export function withoutPatch(record: PreserveBankRecord): PreserveBankRecord {
  const { patch: _patch, ...rest } = record;
  return rest;
}

/** An erased bank: the run cannot write it. */
export function erasedBankOf(key: BankKey): PreserveBankRecord {
  return { key, address: ADDRESS[key], mode: MODE[key], holds: 'erased', refused: 'it is erased' };
}

export function bootFactsOf(overrides: Partial<PreserveBootFacts> = {}): PreserveBootFacts {
  return {
    cfgHex: 'ffffffff',
    word: 0xffffffff,
    rule: 'slot A first, then B, then recovery R',
    activeSlotWord: 0,
    entered: 'a',
    verdicts: { a: true, b: false, r: false },
    nextStart: 'a',
    why:
      'the boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, and it holds an ' +
      'image the bootloader accepts',
    checkKeyUnnamed: null,
    ...overrides,
  };
}

/**
 * A run state past the commit (backup, patch and commit done), writing bank A of a blank-record 2014
 * camera whose B and R are erased. `fields` replaces any top-level field.
 */
export function handRunState(fields: Partial<PreserveRunState> = {}): PreserveRunState {
  return {
    version: 3,
    runId: 'hand',
    createdAt: '2026-10-26T00:00:00Z',
    nextStep: 'drain',
    choice: 'next-start',
    targets: ['a'],
    anchor: 'a',
    boot: bootFactsOf(),
    banks: { a: bankRecordOf('a'), b: erasedBankOf('b'), r: erasedBankOf('r') },
    expectedVersion: '1.3.0.0',
    buildStorage: 'v1-2014',
    buildId: 'v1-2014',
    buildLabel: 'Compact 1.x firmware (2014)',
    stagedForm: 'plain',
    restoreForm: 'capture-verbatim',
    route: 'active-bank',
    routeNote: null,
    steps: {
      backup: { status: 'done', notes: 'backup done' },
      patch: { status: 'done', notes: 'patch done' },
      commit: { status: 'done', notes: 'commit done' },
    },
    ...fields,
  };
}
