/* ==================================================================== *
 * Which bank the next start enters, and which banks a run writes
 * (preservation/banks.ts, TESTING.md 42.92). Pure: no camera.
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import {
  BANK_KEYS,
  bankChoiceWords,
  bankHoldsOf,
  commitOrderOf,
  isPreserveBankChoice,
  preserveBootFactsOf,
  preserveChoiceOf,
  preserveChoicesOf,
  restoreOrderOf,
  warmBootMarkOf,
  type PreserveBankRead,
} from '../../src/preservation/banks.js';
import { keyWordsOf, keystream, wordSum, xorWindowVerbatim } from '../../src/preservation/patch.js';
import type { BankKey } from '../../src/preservation/windows.js';
import { boardPatched, cp1030Bank } from './fixtures-2016.js';
import { bankRecordOf, bootFactsOf, erasedBankOf } from './run-state-fixtures.js';

/** A 2014 bank: a balanced plain image (word sum 0), the tail erased. */
function plainBank(): Uint8Array {
  const image = new Uint8Array(0x1000);
  let s = 0x1234567;
  for (let i = 0; i < image.length; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    image[i] = s & 0xff;
  }
  const dv = new DataView(image.buffer);
  dv.setUint32(0x200, 0xa1b2c3d4, true);
  dv.setUint32(0x204, image.length, true);
  dv.setUint32(0xff0, 0, true);
  dv.setUint32(0xff0, (0 - wordSum(image)) >>> 0, true);
  const bank = new Uint8Array(0x10000).fill(0xff);
  bank.set(image, 0);
  return bank;
}

const erased = (): Uint8Array => new Uint8Array(0x10000).fill(0xff);

function cfg(word: number): Uint8Array {
  const head = new Uint8Array(28).fill(0xff);
  new DataView(head.buffer).setUint32(0, word >>> 0, true);
  return head;
}

function reads(
  banks: Partial<Record<BankKey, Uint8Array | 'unsettled'>>,
): Record<BankKey, PreserveBankRead> {
  const out = {} as Record<BankKey, PreserveBankRead>;
  for (const key of BANK_KEYS) {
    const bytes = banks[key] ?? erased();
    out[key] =
      bytes === 'unsettled'
        ? { key, bytes: erased(), holds: 'unsettled' }
        : { key, bytes, holds: bankHoldsOf(bytes) };
  }
  return out;
}

describe('the boot facts on the 2014 chain: the word, each bank’s stored-sum check, the next start', () => {
  it('a blank word tries A first, and A runs when it passes', () => {
    const facts = preserveBootFactsOf({
      cfgHead: cfg(0xffffffff),
      activeSlotWord: 0,
      line: '2014',
      banks: reads({ a: plainBank(), r: plainBank() }),
    });
    expect(facts.word).toBe(0xffffffff);
    expect(facts.rule).toBe('slot A first, then B, then recovery R');
    expect(facts.entered).toBe('a');
    expect(facts.verdicts).toEqual({ a: true, b: false, r: true });
    expect(facts.nextStart).toBe('a');
    expect(facts.why).toBe(
      'the boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, and it holds an ' +
        'image the bootloader accepts',
    );
    expect(facts.checkKeyUnnamed).toBeNull();
  });

  it('word 0 with A erased takes B; with A and B refused it enters R unchecked', () => {
    const takesB = preserveBootFactsOf({
      cfgHead: cfg(0),
      activeSlotWord: 1,
      line: '2014',
      banks: reads({ b: plainBank() }),
    });
    expect(takesB.nextStart).toBe('b');
    expect(takesB.why).toMatch(/slot A holds no image the bootloader accepts, so it takes slot B/);
    const unchecked = preserveBootFactsOf({
      cfgHead: cfg(0),
      activeSlotWord: null,
      line: '2014',
      banks: reads({}),
    });
    expect(unchecked.nextStart).toBe('r');
    expect(unchecked.why).toMatch(/so it boots recovery R, which it does not check/);
    expect(unchecked.entered).toBeNull();
  });

  it('word 1 tries B first; word 2, and any other word, tries recovery R first', () => {
    const banks = reads({ a: plainBank(), b: plainBank(), r: plainBank() });
    const one = preserveBootFactsOf({ cfgHead: cfg(1), activeSlotWord: 1, line: '2014', banks });
    expect(one.rule).toBe('slot B first, then A, then recovery R');
    expect(one.nextStart).toBe('b');
    for (const word of [2, 5, 0xa5a5a5a5]) {
      const facts = preserveBootFactsOf({
        cfgHead: cfg(word),
        activeSlotWord: 2,
        line: '2014',
        banks,
      });
      expect(facts.rule).toBe('recovery R first, then A, then B');
      expect(facts.nextStart).toBe('r');
    }
  });

  it('a bank whose two reads disagree has no verdict, and a start that needs it is not known', () => {
    const facts = preserveBootFactsOf({
      cfgHead: cfg(0),
      activeSlotWord: 0,
      line: '2014',
      banks: reads({ a: 'unsettled', r: plainBank() }),
    });
    expect(facts.verdicts.a).toBeNull();
    expect(facts.nextStart).toBeNull();
    expect(facts.why).toMatch(/but slot A could not be read the same way twice/);
  });

  it('the warm-boot mark: a bank whose header word holds 0xAA55FF01 holds no image and is refused', () => {
    const marked = plainBank();
    new DataView(marked.buffer).setUint32(0x200, 0xaa55ff01, true);
    expect(bankHoldsOf(marked)).toBe('other');
    expect(warmBootMarkOf(marked)).toBe(0xaa55ff01);
    expect(warmBootMarkOf(plainBank())).toBeNull();
    expect(bankHoldsOf(erased())).toBe('erased');
    expect(bankHoldsOf(plainBank())).toBe('image');
    const facts = preserveBootFactsOf({
      cfgHead: cfg(2),
      activeSlotWord: 2,
      line: '2014',
      banks: reads({ a: marked, r: plainBank() }),
    });
    expect(facts.verdicts).toEqual({ a: false, b: false, r: true });
    expect(facts.nextStart).toBe('r');
  });
});

describe('the boot facts on the 2016 line: the key named from the entered bank', () => {
  const bank = cp1030Bank(boardPatched());

  it('a blank word, entered A (checked): the key is named from A and every bank under it passes', () => {
    const facts = preserveBootFactsOf({
      cfgHead: cfg(0xffffffff),
      activeSlotWord: 0,
      line: '2016',
      banks: reads({ a: bank, b: bank, r: bank }),
    });
    expect(facts.checkKeyUnnamed).toBeNull();
    expect(facts.verdicts).toEqual({ a: true, b: true, r: true });
    expect(facts.nextStart).toBe('a');
  });

  it('a bank under another key fails the check, and the start falls to the next bank', () => {
    /* B holds the same image under a key that is not the device's: the
     * 9 Hz pair's key block 0, as a bank written by another camera could be. */
    const image = boardPatched();
    const foreign = new Uint8Array(0x10000).fill(0xff);
    foreign.set(
      xorWindowVerbatim(
        image,
        keystream(keyWordsOf('5d7984797c47eb9354fa35898ab11701'), image.length >> 2),
      ),
    );
    const facts = preserveBootFactsOf({
      cfgHead: cfg(1),
      activeSlotWord: 0,
      line: '2016',
      banks: reads({ a: bank, b: foreign, r: bank }),
    });
    /* Word 1 tries B, then A: the camera entered A, which it checked. */
    expect(facts.verdicts).toEqual({ a: true, b: false, r: true });
    expect(facts.nextStart).toBe('a');
    expect(facts.why).toMatch(/slot B holds no image the bootloader accepts, so it takes slot A/);
  });

  it('entered the bank the word leaves to last (unchecked): no key, so the next start is not known', () => {
    const facts = preserveBootFactsOf({
      cfgHead: cfg(0xffffffff),
      activeSlotWord: 2,
      line: '2016',
      banks: reads({ a: bank, b: bank, r: bank }),
    });
    expect(facts.checkKeyUnnamed).toMatch(/leaves to last/);
    expect(facts.verdicts).toEqual({ a: null, b: null, r: null });
    expect(facts.nextStart).toBeNull();
    expect(facts.why).toMatch(/the key its bootloader checks a bank under was not named/);
  });

  it('no active-slot word: no key, and the start is not known', () => {
    const facts = preserveBootFactsOf({
      cfgHead: cfg(0xffffffff),
      activeSlotWord: null,
      line: '2016',
      banks: reads({ a: bank }),
    });
    expect(facts.checkKeyUnnamed).toMatch(/could not be read/);
    expect(facts.nextStart).toBeNull();
  });
});

describe('the choices, judged on the backup’s facts', () => {
  const facts = {
    boot: bootFactsOf({
      word: 2,
      nextStart: 'r',
      entered: 'r',
      verdicts: { a: true, b: false, r: true },
    }),
    banks: { a: bankRecordOf('a'), b: erasedBankOf('b'), r: bankRecordOf('r') },
  };

  it('the default is the bank the next start enters; one bank by name; every bank that holds an image', () => {
    const verdicts = preserveChoicesOf(facts);
    expect(verdicts.map((v) => [v.choice, v.banks])).toEqual([
      ['next-start', ['r']],
      ['a', ['a']],
      ['b', null],
      ['r', ['r']],
      ['all', ['a', 'r']],
    ]);
    expect(verdicts[0]?.what).toMatch(/^recovery R, the bank the next start enters: /);
    expect(verdicts[2]?.what).toBe('slot B cannot be written: it is erased');
    expect(verdicts[4]?.what).toBe('every bank that holds an image: slot A and recovery R');
  });

  it('a choice that leaves out the next start warns, and never refuses', () => {
    const a = preserveChoiceOf(facts, 'a');
    expect(a.banks).toEqual(['a']);
    expect(a.warnings).toHaveLength(1);
    expect(a.warnings[0]).toMatch(/^The next start enters recovery R \(/);
    expect(a.warnings[0]).toMatch(/whole-flash read stops before it reads anything/);
    expect(a.warnings[0]).toMatch(/The restore still puts every written bank back/);
    expect(preserveChoiceOf(facts, 'r').warnings).toEqual([]);
    expect(preserveChoiceOf(facts, 'all').warnings).toEqual([]);
  });

  it('every bank refuses when a bank that holds an image cannot be written, and names it', () => {
    const blocked = {
      ...facts,
      banks: {
        ...facts.banks,
        b: bankRecordOf('b', {
          refused: 'it holds Compact 1.2.0.0, not the build the camera runs',
        }),
      },
    };
    const all = preserveChoiceOf(blocked, 'all');
    expect(all.banks).toBeNull();
    expect(all.what).toMatch(/slot B cannot — it holds Compact 1\.2\.0\.0/);
  });

  it('the default cannot resolve when the next start enters a bank the run cannot write', () => {
    const toB = {
      boot: bootFactsOf({ word: 1, nextStart: 'b', verdicts: { a: true, b: true, r: false } }),
      banks: {
        a: bankRecordOf('a'),
        b: bankRecordOf('b', {
          refused: 'it holds Compact 1.2.0.0, not the build the camera runs',
        }),
        r: erasedBankOf('r'),
      },
    };
    const next = preserveChoiceOf(toB, 'next-start');
    expect(next.banks).toBeNull();
    expect(next.what).toMatch(
      /^the next start enters slot B \(.*\), and the run cannot write it: it holds/,
    );
  });

  it('nothing is offered before the backup has read the banks', () => {
    expect(preserveChoiceOf({}, 'a').banks).toBeNull();
    expect(preserveChoiceOf({}, 'a').what).toMatch(/has not read the banks yet/);
  });

  it('the words and the guard', () => {
    expect(bankChoiceWords('next-start')).toBe('the bank the next start enters');
    expect(bankChoiceWords('all')).toBe('every bank');
    expect(bankChoiceWords('r')).toBe('recovery R');
    expect(isPreserveBankChoice('b')).toBe(true);
    expect(isPreserveBankChoice('both')).toBe(false);
  });
});

describe('the write order', () => {
  it('the commit writes the bank the bootloader tries first last; the restore puts it back first', () => {
    const all: BankKey[] = ['a', 'b', 'r'];
    expect(commitOrderOf(all, 0xffffffff)).toEqual(['r', 'b', 'a']);
    expect(restoreOrderOf(all, 0xffffffff)).toEqual(['a', 'b', 'r']);
    expect(commitOrderOf(all, 1)).toEqual(['r', 'a', 'b']);
    expect(commitOrderOf(all, 2)).toEqual(['b', 'a', 'r']);
    expect(restoreOrderOf(['a', 'r'], 2)).toEqual(['r', 'a']);
    expect(commitOrderOf(['r'], 0)).toEqual(['r']);
  });
});
