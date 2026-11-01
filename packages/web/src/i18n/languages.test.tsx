/**
 * The registry as it grows to twenty languages: the switcher's order (checked from the names, so an
 * entry put in the wrong place fails), browser tags matched to their language, the plural categories
 * each language uses, and plural forms picked end to end for Latvian (zero), Slovenian (two) and
 * Lithuanian (many). The planned languages are faked here; none of these strings is a translation.
 */

import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { render } from '@/test-helpers';
import { detectLanguage, matchLanguage } from './detect';
import { pluralCategories, selectPluralForm } from './format';
import type * as LanguagesModule from './languages';
import type { LanguageCode, LanguageEntry } from './languages';
import { resetI18n, setLanguage, t } from './store';
import type {
  Dictionary,
  PluralCategoriesOf,
  PluralCategory,
  PluralLanguage,
  Translation,
} from './types';

/** The agreed order of all twenty languages: the codes, the names, and the `<html lang>` tag. */
const { PLANNED } = vi.hoisted(() => {
  const PLANNED: readonly (readonly [code: string, name: string, htmlLang?: string])[] = [
    ['en', 'English'],
    ['cs', 'Čeština'],
    ['de', 'Deutsch'],
    ['et', 'Eesti'],
    ['es', 'Español'],
    ['fr', 'Français'],
    ['it', 'Italiano'],
    ['lv', 'Latviešu'],
    ['lt', 'Lietuvių'],
    ['hu', 'Magyar'],
    ['pl', 'Polski'],
    ['pt', 'Português', 'pt-PT'],
    ['ro', 'Română'],
    ['sk', 'Slovenčina'],
    ['sl', 'Slovenščina'],
    ['sr', 'Srpski', 'sr-Latn'],
    ['bg', 'Български'],
    ['ru', 'Русский'],
    ['uk', 'Українська'],
    ['zh-Hans', '简体中文'],
  ];
  return { PLANNED };
});

vi.mock('./languages', async (importOriginal) => {
  const actual = await importOriginal<typeof LanguagesModule>();
  const { en } = await import('./locales/en');
  const counts: Readonly<Record<string, Readonly<Record<string, string>>>> = {
    lv: { zero: '{count} failu', one: '{count} fails', other: '{count} faili' },
    sl: {
      one: '{count} datoteka',
      two: '{count} datoteki',
      few: '{count} datoteke',
      other: '{count} datotek',
    },
    lt: {
      one: '{count} failas',
      few: '{count} failai',
      many: '{count} failo',
      other: '{count} failų',
    },
  };
  const fake = (code: string): Dictionary =>
    ({
      ...en,
      common: { ...en.common, 'count.files': counts[code] ?? en.common['count.files'] },
    }) as unknown as Dictionary;
  return {
    ...actual,
    LANGUAGES: PLANNED.map(([code, name, htmlLang]) =>
      code === 'en'
        ? actual.LANGUAGES[0]
        : {
            code: code as LanguageCode,
            name,
            ...(htmlLang === undefined ? {} : { htmlLang }),
            load: () => Promise.resolve(fake(code)),
          },
    ),
  };
});

afterEach(() => {
  resetI18n();
});

/** Latin first, then Cyrillic, then anything else (Chinese). */
function scriptRank(name: string): number {
  if (/^\p{Script=Latin}/u.test(name)) return 0;
  if (/^\p{Script=Cyrillic}/u.test(name)) return 1;
  return 2;
}

const collator = new Intl.Collator('und');

/** Where the switcher's order breaks the rule (English first, then by script and native name), or null. */
function orderProblem(entries: readonly Pick<LanguageEntry, 'code' | 'name'>[]): string | null {
  if (entries[0]?.code !== 'en') return `English is not first: ${entries[0]?.code ?? 'nothing'}`;
  for (let at = 2; at < entries.length; at += 1) {
    const before = entries[at - 1];
    const here = entries[at];
    if (before === undefined || here === undefined) continue;
    const order =
      scriptRank(before.name) - scriptRank(here.name) || collator.compare(before.name, here.name);
    if (order >= 0) return `${here.name} (${here.code}) belongs before ${before.name}`;
  }
  return null;
}

describe('the switcher order', () => {
  it('is English, then Latin, Cyrillic and Chinese names, each by its native name', async () => {
    const actual = await vi.importActual<typeof LanguagesModule>('./languages');
    expect(orderProblem(actual.LANGUAGES)).toBeNull();
    const planned = PLANNED.map(([code, name]) => ({ code: code as LanguageCode, name }));
    expect(orderProblem(planned)).toBeNull();
    /* The rule gives exactly the agreed list. */
    const sorted = [...planned.slice(1)].sort(
      (a, b) => scriptRank(a.name) - scriptRank(b.name) || collator.compare(a.name, b.name),
    );
    expect(sorted).toEqual(planned.slice(1));
  });

  it('fails an entry put in the wrong place', () => {
    const entries = PLANNED.map(([code, name]) => ({ code: code as LanguageCode, name }));
    const swapped = [entries[0], entries[3], entries[2], entries[1], ...entries.slice(4)].filter(
      (entry) => entry !== undefined,
    );
    expect(orderProblem(swapped)).toBe('Deutsch (de) belongs before Eesti');
    expect(orderProblem([...entries.slice(1, 3), entries[0]!])).toMatch(/English is not first/);
  });

  it('offers twenty languages in the switcher, each with its own lang', () => {
    const { container, unmount } = render(<LanguageSwitch />);
    const select = container.querySelector('select');
    if (select === null) throw new Error('no select');
    expect([...select.options].map((option) => [option.value, option.text, option.lang])).toEqual(
      PLANNED.map(([code, name, htmlLang]) => [code, name, htmlLang ?? code]),
    );
    unmount();
  });
});

describe('a browser tag finds its language', () => {
  const registry = PLANNED.map(([code]) => ({ code: code as LanguageCode }));
  const env = { search: '', stored: null, languages: [] as string[] };

  it('maps every Serbian tag, Latin or Cyrillic, to sr', () => {
    for (const tag of ['sr', 'sr-RS', 'sr-Latn', 'sr-Latn-RS', 'sr-Cyrl', 'sr-Cyrl-RS', 'SR_latn'])
      expect(matchLanguage(tag, registry)).toBe('sr');
    expect(detectLanguage({ ...env, search: '?lang=sr-Latn' }, registry)).toBe('sr');
  });

  it('maps a regional tag to its base language', () => {
    const tags = {
      'cs-CZ': 'cs',
      'hu-HU': 'hu',
      'et-EE': 'et',
      'lv-LV': 'lv',
      'lt-LT': 'lt',
      'sk-SK': 'sk',
      'sl-SI': 'sl',
      'bg-BG': 'bg',
    };
    for (const [tag, code] of Object.entries(tags)) {
      expect(matchLanguage(tag, registry)).toBe(code);
      expect(detectLanguage({ ...env, languages: ['ja-JP', tag, 'ru'] }, registry)).toBe(code);
    }
  });

  it('does not take a language that is not registered', () => {
    const today = registry.filter((entry) => !['cs', 'sr', 'bg'].includes(entry.code));
    expect(matchLanguage('sr-Latn-RS', today)).toBeNull();
    expect(detectLanguage({ ...env, languages: ['cs-CZ', 'bg-BG', 'ru-RU'] }, today)).toBe('ru');
  });
});

describe('plural categories', () => {
  /* The categories `PluralCategoriesOf` gives each language, as values the runtime can compare. */
  const TABLE = {
    en: ['one', 'other'],
    bg: ['one', 'other'],
    cs: ['one', 'few', 'many', 'other'],
    de: ['one', 'other'],
    es: ['one', 'many', 'other'],
    et: ['one', 'other'],
    fr: ['one', 'many', 'other'],
    hu: ['one', 'other'],
    it: ['one', 'many', 'other'],
    lt: ['one', 'few', 'many', 'other'],
    lv: ['zero', 'one', 'other'],
    pl: ['one', 'few', 'many', 'other'],
    pt: ['one', 'many', 'other'],
    ro: ['one', 'few', 'other'],
    ru: ['one', 'few', 'many', 'other'],
    sk: ['one', 'few', 'many', 'other'],
    sl: ['one', 'two', 'few', 'other'],
    sr: ['one', 'few', 'other'],
    uk: ['one', 'few', 'many', 'other'],
    'zh-Hans': ['other'],
  } as const satisfies { readonly [L in PluralLanguage]: readonly PluralCategoriesOf[L][] };
  /* …and every category of the type is in the table. */
  type Unlisted = {
    [L in PluralLanguage]: Exclude<PluralCategoriesOf[L], (typeof TABLE)[L][number]>;
  }[PluralLanguage];
  const complete: [Unlisted] extends [never] ? true : false = true;

  it('match what Intl.PluralRules gives each language', () => {
    expect(complete).toBe(true);
    for (const [code, categories] of Object.entries(TABLE))
      expect([code, pluralCategories(code)]).toEqual([code, categories]);
    expect(Object.keys(TABLE).sort()).toEqual(PLANNED.map(([code]) => code).sort());
  });

  it('pick zero, two and many where the language has them', () => {
    const lv = { zero: 'z', one: 'o', other: 'x' };
    const pick = (forms: Readonly<Record<string, string>>, lang: string, counts: number[]) =>
      counts.map((count) => selectPluralForm(forms as { other: string }, lang, count)).join('');
    expect(pick(lv, 'lv', [0, 1, 2, 10, 11, 21, 30, 101, 111])).toBe('zoxzzozoz');
    const sl = { one: 'o', two: 't', few: 'f', other: 'x' };
    expect(pick(sl, 'sl', [1, 2, 3, 4, 5, 101, 102, 103, 0])).toBe('otffxotfx');
    const lt = { one: 'o', few: 'f', many: 'm', other: 'x' };
    expect(pick(lt, 'lt', [1, 2, 9, 10, 11, 21, 0.5])).toBe('offxxom');
    /* A category the entry lacks is said in its `other`. */
    expect(pick({ one: 'o', other: 'x' }, 'lv', [0, 1])).toBe('xo');
  });

  it('pick the form end to end in t(), with each language’s rules', async () => {
    const files = async (code: string, counts: number[]): Promise<string[]> => {
      await act(async () => {
        await setLanguage(code as LanguageCode);
      });
      return counts.map((count) => t('common:count.files', { count }));
    };
    expect(await files('lv', [0, 1, 2, 21])).toEqual(['0 failu', '1 fails', '2 faili', '21 fails']);
    expect(await files('sl', [1, 2, 3, 5, 102])).toEqual([
      '1 datoteka',
      '2 datoteki',
      '3 datoteke',
      '5 datotek',
      '102 datoteki',
    ]);
    expect(await files('lt', [1, 3, 10, 0.5])).toEqual([
      '1 failas',
      '3 failai',
      '10 failų',
      '0.5 failo',
    ]);
  });

  it('are required, exactly, by the types when a translation names its language', () => {
    const lv: Translation<'common', 'lv'>['count.files'] = { zero: 'z', one: 'o', other: 'x' };
    // @ts-expect-error -- Latvian needs `zero`
    const noZero: Translation<'common', 'lv'>['count.files'] = { one: 'o', other: 'x' };
    const lvFew: Translation<'common', 'lv'>['count.files'] = {
      zero: 'z',
      one: 'o',
      // @ts-expect-error -- Latvian never picks `few`
      few: 'f',
      other: 'x',
    };
    // @ts-expect-error -- Slovenian needs `two` (and `few`)
    const slNoTwo: Translation<'common', 'sl'>['count.files'] = { one: 'o', other: 'x' };
    const sl: Translation<'common', 'sl'>['count.files'] = {
      one: 'o',
      two: 't',
      few: 'f',
      other: 'x',
    };
    const lt: Translation<'common', 'lt'>['count.files'] = {
      one: 'o',
      few: 'f',
      many: 'm',
      other: 'x',
    };
    /* Without the language, any categories with `other` pass the types. */
    const loose: Translation<'common'>['count.files'] = { two: 't', other: 'x' };
    const categories: readonly PluralCategory[] = Object.keys(sl) as PluralCategory[];
    expect([lv, noZero, lvFew, slNoTwo, sl, lt, loose, categories]).toHaveLength(8);
  });
});
