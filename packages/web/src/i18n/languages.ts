/**
 * The language registry: every language the switcher offers, in the order it
 * offers them, and how each one loads.
 *
 * English is bundled. Every other language is its own chunk, fetched with a
 * dynamic `import()` the first time it is used, so a visitor downloads only
 * English and the one language they read.
 *
 * Adding a language is one folder, `locales/<code>/` (a copy of `locales/en/`
 * with every string translated), its code in `LanguageCode`, and one entry
 * here (README.md, "How to add a language", has the whole checklist). The
 * order is the rule: English first, then by native name — Latin script, then
 * Cyrillic, then Chinese. Each planned language has a comment where its entry
 * goes; replace the comment with the entry once the folder exists.
 * languages.test.ts checks the order from the names, so an entry in the wrong
 * place fails it.
 */

import type { Dictionary, ListCase } from './types';
import { en } from './locales/en';

/** Every language planned for the page. Only the ones in `LANGUAGES` are offered. */
export type LanguageCode =
  | 'en'
  | 'bg'
  | 'cs'
  | 'de'
  | 'es'
  | 'et'
  | 'fr'
  | 'hu'
  | 'it'
  | 'lt'
  | 'lv'
  | 'pl'
  | 'pt'
  | 'ro'
  | 'ru'
  | 'sk'
  | 'sl'
  | 'sr'
  | 'uk'
  | 'zh-Hans';

export interface LanguageEntry {
  /** A BCP 47 tag, as URLs (`?lang=`), storage and the switcher use it. */
  readonly code: LanguageCode;
  /**
   * The tag for `<html lang>` and the switcher's options, when the text is more
   * specific than `code`: hyphenation, fonts and screen-reader voices key on it.
   * Defaults to `code`.
   */
  readonly htmlLang?: string;
  /** The language's own name for itself, as the switcher shows it. */
  readonly name: string;
  /**
   * How a case asked of a list of names reaches them (`ListCase`): each name
   * (the default, as Polish and Russian say it), or only the last (Estonian, for some cases).
   */
  readonly listCase?: ListCase;
  readonly load: () => Promise<Dictionary>;
}

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const LANGUAGES: readonly LanguageEntry[] = [
  { code: 'en', name: 'English', load: () => Promise.resolve(en) },
  { code: 'cs', name: 'Čeština', load: () => import('./locales/cs').then((m) => m.default) },
  { code: 'de', name: 'Deutsch', load: () => import('./locales/de').then((m) => m.default) },
  /* Estonian: the terminative, essive, abessive and comitative go on the last name only ("pesa A ja pesaga B"). */
  {
    code: 'et',
    name: 'Eesti',
    listCase: { lastOnly: ['ter', 'ess', 'abe', 'com'], before: 'gen' },
    load: () => import('./locales/et').then((m) => m.default),
  },
  { code: 'es', name: 'Español', load: () => import('./locales/es').then((m) => m.default) },
  { code: 'fr', name: 'Français', load: () => import('./locales/fr').then((m) => m.default) },
  { code: 'it', name: 'Italiano', load: () => import('./locales/it').then((m) => m.default) },
  { code: 'lv', name: 'Latviešu', load: () => import('./locales/lv').then((m) => m.default) },
  { code: 'lt', name: 'Lietuvių', load: () => import('./locales/lt').then((m) => m.default) },
  { code: 'hu', name: 'Magyar', load: () => import('./locales/hu').then((m) => m.default) },
  { code: 'pl', name: 'Polski', load: () => import('./locales/pl').then((m) => m.default) },
  /* European Portuguese (pt-PT spelling). */
  {
    code: 'pt',
    htmlLang: 'pt-PT',
    name: 'Português',
    load: () => import('./locales/pt').then((m) => m.default),
  },
  /* Romanian (ro): `ro-RO` and `ro-MD` browsers match it by the primary subtag. */
  { code: 'ro', name: 'Română', load: () => import('./locales/ro').then((m) => m.default) },
  { code: 'sk', name: 'Slovenčina', load: () => import('./locales/sk').then((m) => m.default) },
  { code: 'sl', name: 'Slovenščina', load: () => import('./locales/sl').then((m) => m.default) },
  /* Serbian in Latin script (gajica), the ekavian standard: `sr-Latn`; `sr-Cyrl` browsers match it by the primary subtag. */
  {
    code: 'sr',
    htmlLang: 'sr-Latn',
    name: 'Srpski',
    load: () => import('./locales/sr').then((m) => m.default),
  },
  { code: 'bg', name: 'Български', load: () => import('./locales/bg').then((m) => m.default) },
  { code: 'ru', name: 'Русский', load: () => import('./locales/ru').then((m) => m.default) },
  { code: 'uk', name: 'Українська', load: () => import('./locales/uk').then((m) => m.default) },
  {
    code: 'zh-Hans',
    name: '简体中文',
    load: () => import('./locales/zh-Hans').then((m) => m.default),
  },
];
