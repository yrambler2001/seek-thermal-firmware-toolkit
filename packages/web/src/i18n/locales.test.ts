/**
 * Key parity: every registered language has every English key and no other,
 * the plural forms its language needs, and the same `{params}` and `<slots>`
 * as the English string. The type check already refuses a missing key in a
 * translated file; this also catches a dropped placeholder or plural form,
 * which the types cannot see. A new language is checked by being registered.
 */

import { describe, expect, it } from 'vitest';
import { UNLOCK_POWER_CYCLE_NOTE } from '@seek-fw/core';
import { isGrammaticalCase, pluralCategories } from './format';
import { LANGUAGES } from './languages';
import { en } from './locales/en';
import { isNameKey, nameParamsOf } from './names';
import type { LooseDictionary, Message, Translation } from './types';

const ENGLISH: LooseDictionary = en;

function texts(message: Message): readonly string[] {
  return typeof message === 'string' ? [message] : Object.values(message);
}

function names(message: Message, pattern: RegExp): readonly string[] {
  const found = new Set<string>(typeof message === 'string' ? [] : ['count']);
  for (const text of texts(message)) {
    for (const match of text.matchAll(pattern)) found.add(match[1] ?? '');
  }
  return [...found].sort();
}

const PLACEHOLDER = /\{([A-Za-z_]\w*)(?::(\w+))?\}/g;
const SLOT_TAG = /<([A-Za-z][\w-]*)\s*\/?>/g;

/**
 * The case selectors in a translated entry that cannot work: a case that is not one of `CASES`, or a case
 * on a param that is not a name. Core's params are checked against core's samples (core-messages.test.ts).
 */
function caseProblems(id: string, message: Message): string[] {
  const problems: string[] = [];
  for (const text of texts(message)) {
    for (const [whole, param = '', gramCase] of text.matchAll(PLACEHOLDER)) {
      if (gramCase === undefined) continue;
      if (!isGrammaticalCase(gramCase)) problems.push(`${id} asks for ${whole}: no such case`);
      else if (!id.startsWith('core:') && !nameParamsOf(id).includes(param))
        problems.push(`${id} asks for ${whole}: {${param}} is not a name (names.ts)`);
    }
  }
  return problems;
}

/** A translation's case form of a name (`bank.slot:loc`): fine when the name and the case exist. */
function caseFormProblems(id: string, own: Message): string[] | null {
  const split = id.lastIndexOf(':');
  const base = id.slice(0, split);
  if (split <= id.indexOf(':') || !isNameKey(base)) return null;
  const [gramCase, letter, ...rest] = id.slice(split + 1).split('#');
  if (!isGrammaticalCase(gramCase)) return [`${id} is a form of ${base} in no known case`];
  const english = ENGLISH[base.slice(0, base.indexOf(':'))]?.[base.slice(base.indexOf(':') + 1)];
  if (english === undefined) return [`${id} is a case form of ${base}, which English lacks`];
  if (typeof own !== 'string') return [`${id} should be a string`];
  if (letter !== undefined && (!['A', 'B', 'R'].includes(letter) || rest.length > 0))
    return [`${id} is a form for no bank letter (A, B, R)`];
  if (letter !== undefined && !names(english, PLACEHOLDER).includes('letter'))
    return [`${id} is a form for one letter, but ${base} has no {letter}`];
  const want = names(english, PLACEHOLDER).join(', ');
  const have = names(own, PLACEHOLDER).join(', ');
  return want === have ? [] : [`${id} has params [${have}], ${base} has [${want}]`];
}

/** Every way `dict` (in language `code`) differs from English, as readable lines. */
export function parityProblems(code: string, dict: LooseDictionary): string[] {
  const problems: string[] = [];
  const needed = pluralCategories(code);
  for (const [namespace, messages] of Object.entries(ENGLISH)) {
    for (const [key, english] of Object.entries(messages ?? {})) {
      const id = `${namespace}:${key}`;
      const own = dict[namespace]?.[key];
      if (own === undefined) {
        problems.push(`${id} is missing`);
        continue;
      }
      if (typeof own !== typeof english) {
        problems.push(
          `${id} should be ${typeof english === 'string' ? 'a string' : 'plural forms'}`,
        );
        continue;
      }
      if (typeof own === 'object') {
        for (const category of needed) {
          if (own[category] === undefined) problems.push(`${id} lacks the "${category}" form`);
        }
        for (const category of Object.keys(own)) {
          if (!(needed as readonly string[]).includes(category))
            problems.push(`${id} has a "${category}" form, which ${code} never picks`);
        }
      }
      for (const [what, pattern] of [
        ['params', PLACEHOLDER],
        ['slots', SLOT_TAG],
      ] as const) {
        const want = names(english, pattern).join(', ');
        const have = names(own, pattern).join(', ');
        if (want !== have) problems.push(`${id} has ${what} [${have}], English has [${want}]`);
      }
      problems.push(...caseProblems(id, own));
    }
  }
  for (const [namespace, messages] of Object.entries(dict)) {
    for (const [key, own] of Object.entries(messages ?? {})) {
      if (ENGLISH[namespace]?.[key] !== undefined) continue;
      const id = `${namespace}:${key}`;
      problems.push(...(caseFormProblems(id, own) ?? [`${id} is not in English`]));
    }
  }
  return problems;
}

describe('every registered language matches English', () => {
  it.each(LANGUAGES.map((entry) => [entry.code, entry] as const))('%s', async (code, entry) => {
    expect(parityProblems(code, await entry.load())).toEqual([]);
  });

  /* The switcher's order is checked in languages.test.tsx, from the names. */
});

describe('the parity check itself', () => {
  it('reports a missing key, a dropped param or slot, a missing plural form and an extra key', () => {
    const fake: LooseDictionary = {
      ...ENGLISH,
      app: {
        ...ENGLISH.app,
        'connect.test': undefined as unknown as string,
        documentTitle: 'Seek Thermal Firmware (WebUSB)',
        'platform.windows': 'Zadig',
        invented: 'x',
      },
      common: {
        ...ENGLISH.common,
        'count.files': { one: '{count} файл', other: '{count} файла' },
      },
    };
    /* English's other plurals have only one/other, so they show up too; these are the planted ones. */
    const problems = parityProblems('ru', fake);
    expect(problems).toEqual(
      expect.arrayContaining([
        'common:count.files lacks the "few" form',
        'common:count.files lacks the "many" form',
        'app:connect.test is missing',
        'app:documentTitle has params [], English has [tab]',
        'app:platform.windows has slots [], English has [zadig]',
        'app:invented is not in English',
      ]),
    );
    expect(problems.filter((line) => line.startsWith('app:'))).toHaveLength(4);
    expect(parityProblems('en', ENGLISH)).toEqual([]);
  });

  it('reports a case that does not exist, a case on a param that is not a name, and a bad case form', () => {
    const fake: LooseDictionary = {
      ...ENGLISH,
      common: {
        ...ENGLISH.common,
        'bank.slot:loc': 'slocie {letter}',
        'bank.slot:voc': 'slocie {letter}',
        'bank.slotInSentence:gen': 'slotu',
        'list.and:gen': '{first} i {second}',
      },
      slots: {
        ...ENGLISH.slots,
        'table.copyTo': 'Kopiuj do {bank:gen}',
        'status.dumping': 'Zrzut {bank:voc} ...',
        'what.restore': '{bank:gen} z {file:gen}',
      },
    };
    const problems = parityProblems('pl', fake);
    expect(problems).toEqual(
      expect.arrayContaining([
        'slots:status.dumping asks for {bank:voc}: no such case',
        'slots:what.restore asks for {file:gen}: {file} is not a name (names.ts)',
        'common:bank.slot:voc is a form of common:bank.slot in no known case',
        'common:bank.slotInSentence:gen has params [], common:bank.slotInSentence has [letter]',
        'common:list.and:gen is not in English',
      ]),
    );
    expect(problems.join('\n')).not.toContain('table.copyTo');
    expect(problems.join('\n')).not.toContain('bank.slot:loc');
  });

  it('takes the local cases on names, and only there', () => {
    const fake: LooseDictionary = {
      ...ENGLISH,
      common: {
        ...ENGLISH.common,
        'bank.slotInSentence:ine': '{letter} slotban',
        'bank.slotInSentence:ill': '{letter} slotba',
        'bank.slotInSentence:par': 'sloti {letter}',
        'bank.slotInSentence:nom': 'az {letter} slot',
        'bank.slotInSentence:nom#B': 'a {letter} slot',
        'bank.slotInSentence:ill#b': 'a {letter} slotba',
      },
      core: { ...ENGLISH.core, 'keyName.keyA:nom#A': 'az A kulcs' },
      slots: {
        ...ENGLISH.slots,
        'table.copyTo': 'Másolás {bank:ill}',
        'what.restore': '{bank:ela} {file:ine}',
        'fpsEveryOutcome.notWritten': 'Semmi {banks:ine}.',
      },
    };
    expect(parityProblems('hu', fake)).toEqual([
      'slots:what.restore asks for {file:ine}: {file} is not a name (names.ts)',
      'common:bank.slotInSentence:ill#b is a form for no bank letter (A, B, R)',
      'core:keyName.keyA:nom#A is a form for one letter, but core:keyName.keyA has no {letter}',
    ]);
  });

  it('reports a plural form the language never picks, and one it needs', () => {
    const fake: LooseDictionary = {
      ...ENGLISH,
      common: {
        ...ENGLISH.common,
        'count.files': { one: '{count} fails', few: '{count} faili', other: '{count} faili' },
      },
    };
    expect(parityProblems('lv', fake).filter((line) => line.startsWith('common:'))).toEqual([
      'common:count.files lacks the "zero" form',
      'common:count.files has a "few" form, which lv never picks',
    ]);
  });
});

describe('the types', () => {
  it('make a missing, an extra or a mis-shaped key a compile error in a translation', () => {
    // @ts-expect-error -- every English key is required
    const missing: Translation<'core'> = {};
    const extra: Translation<'core'> = {
      'unlock.powerCycleNote': 'x',
      // @ts-expect-error -- a key English does not have
      invented: 'y',
    };
    const plural: Translation<'common'>['count.files'] = { one: 'x', other: 'y' };
    // @ts-expect-error -- plural forms need `other`
    const noOther: Translation<'common'>['count.files'] = { one: 'x' };
    expect([missing, extra, plural, noOther]).toHaveLength(4);
  });
});

describe('the core namespace', () => {
  it('says what @seek-fw/core says, word for word', () => {
    expect(en.core['unlock.powerCycleNote']).toBe(UNLOCK_POWER_CYCLE_NOTE);
  });
});
