/**
 * The two pure steps between a dictionary entry and the text shown: choosing a
 * plural form and filling in `{name}` placeholders.
 */

import type { Message, ParamValue, PluralCategory, PluralForms } from './types';

const PLACEHOLDER = /\{([A-Za-z_][\w]*)\}/g;

/**
 * Replaces each `{name}` with `params.name`. A number is written as it is
 * (`String(n)`, no grouping): a caller that wants `1,024` or a hex value
 * formats it first and passes the string. A placeholder with no param stays as
 * written, so a missing param shows up on the page instead of vanishing.
 */
export function interpolate(
  template: string,
  params: Readonly<Record<string, ParamValue>> | undefined,
): string {
  if (params === undefined) return template;
  return template.replace(PLACEHOLDER, (whole, name: string) => {
    const value = params[name];
    return value === undefined ? whole : String(value);
  });
}

const rules = new Map<string, Intl.PluralRules>();

/** The CLDR plural category of `count` in `lang` (cached per language). */
export function pluralCategory(lang: string, count: number): PluralCategory {
  let rule = rules.get(lang);
  if (rule === undefined) {
    rule = new Intl.PluralRules(lang);
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
