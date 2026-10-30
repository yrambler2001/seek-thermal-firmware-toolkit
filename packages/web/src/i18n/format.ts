/**
 * The two pure steps between a dictionary entry and the text shown: choosing a
 * plural form and filling in `{name}` placeholders.
 */

import type {
  AnyParam,
  GrammaticalCase,
  Message,
  NameValue,
  PluralCategory,
  PluralForms,
} from './types';

/** `{name}`, or `{name:case}` for a name in a grammatical case. */
export const PLACEHOLDER = /\{([A-Za-z_]\w*)(?::([a-z]+))?\}/g;

/** Every case a template may ask for (README.md, "Cases"). */
export const CASES: readonly GrammaticalCase[] = ['gen', 'dat', 'acc', 'ins', 'loc'];

export function isGrammaticalCase(value: string | undefined): value is GrammaticalCase {
  return CASES.includes(value as GrammaticalCase);
}

/** Says a name in a case (`undefined`: its plain form), in the language that fills the template. */
export type NameSayer = (value: NameValue, gramCase: GrammaticalCase | undefined) => string;

/** A name with no dictionary at hand: only a `NameText` has words of its own. */
const textOnly: NameSayer = (value) => ('text' in value ? value.text : '');

/**
 * Replaces each `{name}` with `params.name`. A number is written as it is
 * (`String(n)`, no grouping): a caller that wants `1,024` or a hex value
 * formats it first and passes the string. A placeholder with no param stays as
 * written, so a missing param shows up on the page instead of vanishing. A name
 * param (`NameValue`) is said by `say`, in the case `{name:case}` asks for; a
 * case on a plain string or number, or a case `say` has no form for, gives the
 * value as it is.
 */
export function interpolate(
  template: string,
  params: Readonly<Record<string, AnyParam>> | undefined,
  say: NameSayer = textOnly,
): string {
  if (params === undefined) return template;
  return template.replace(PLACEHOLDER, (whole, name: string, gramCase: string | undefined) => {
    const value = params[name];
    if (value === undefined) return whole;
    if (typeof value === 'object') {
      return say(value, isGrammaticalCase(gramCase) ? gramCase : undefined);
    }
    return String(value);
  });
}

const rules = new Map<string, Intl.PluralRules>();

/**
 * The locale whose plural rules a language code uses, where the bare code means another variety:
 * plain `pt` resolves to Brazilian Portuguese in CLDR (0 and 1.5 are `one`), and the page's Portuguese
 * is European (`pt-PT`: only 1 is `one`).
 */
const PLURAL_LOCALE: Readonly<Record<string, string>> = { pt: 'pt-PT' };

/** The CLDR plural category of `count` in `lang` (cached per language). */
export function pluralCategory(lang: string, count: number): PluralCategory {
  let rule = rules.get(lang);
  if (rule === undefined) {
    rule = new Intl.PluralRules(PLURAL_LOCALE[lang] ?? lang);
    rules.set(lang, rule);
  }
  return rule.select(count);
}

export function isPluralForms(message: Message): message is PluralForms {
  return typeof message === 'object';
}

/**
 * The form of `forms` for `count` in `lang`; `other` when the language's rule
 * picks a category the entry does not have.
 */
export function selectPluralForm(forms: PluralForms, lang: string, count: number): string {
  return forms[pluralCategory(lang, count)] ?? forms.other;
}
