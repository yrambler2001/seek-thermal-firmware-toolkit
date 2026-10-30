/**
 * Key parity: every registered language has every English key and no other,
 * the plural forms its language needs, and the same `{params}` and `<slots>`
 * as the English string. The type check already refuses a missing key in a
 * translated file; this also catches a dropped placeholder or plural form,
 * which the types cannot see. A new language is checked by being registered.
 */

import { describe, expect, it } from 'vitest';
import { UNLOCK_POWER_CYCLE_NOTE } from '@seek-fw/core';
import { LANGUAGES } from './languages';
import { en } from './locales/en';
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

const PLACEHOLDER = /\{([A-Za-z_]\w*)\}/g;
const SLOT_TAG = /<([A-Za-z][\w-]*)\s*\/?>/g;

/** Every way `dict` (in language `code`) differs from English, as readable lines. */
export function parityProblems(code: string, dict: LooseDictionary): string[] {
  const problems: string[] = [];
  const needed = new Intl.PluralRules(code).resolvedOptions().pluralCategories;
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
      }
      for (const [what, pattern] of [
        ['params', PLACEHOLDER],
        ['slots', SLOT_TAG],
      ] as const) {
        const want = names(english, pattern).join(', ');
        const have = names(own, pattern).join(', ');
        if (want !== have) problems.push(`${id} has ${what} [${have}], English has [${want}]`);
      }
    }
  }
  for (const [namespace, messages] of Object.entries(dict)) {
    for (const key of Object.keys(messages ?? {})) {
      if (ENGLISH[namespace]?.[key] === undefined)
        problems.push(`${namespace}:${key} is not in English`);
    }
  }
  return problems;
}

describe('every registered language matches English', () => {
  it.each(LANGUAGES.map((entry) => [entry.code, entry] as const))('%s', async (code, entry) => {
    expect(parityProblems(code, await entry.load())).toEqual([]);
  });

  it('lists the languages in the agreed order: English, then by native name', () => {
    const order = ['en', 'de', 'es', 'fr', 'it', 'pl', 'pt', 'ru', 'uk', 'zh-Hans'];
    const codes = LANGUAGES.map((entry) => entry.code);
    expect(codes[0]).toBe('en');
    expect(codes).toEqual(order.filter((code) => codes.includes(code as (typeof codes)[number])));
  });
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
