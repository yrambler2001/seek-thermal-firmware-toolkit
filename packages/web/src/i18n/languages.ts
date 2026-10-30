/**
 * The language registry: every language the switcher offers, in the order it
 * offers them, and how each one loads.
 *
 * English is bundled. Every other language is its own chunk, fetched with a
 * dynamic `import()` the first time it is used, so a visitor downloads only
 * English and the one language they read.
 *
 * Adding a language is one folder, `locales/<code>/` (a copy of `locales/en/`
 * with every string translated), plus one line here. The order is the rule:
 * English first, then by native name — Latin script, then Cyrillic, then
 * Chinese. The planned lines below are in that order already; a translator
 * uncomments theirs once the folder exists.
 */

import type { Dictionary } from './types';
import { en } from './locales/en';

/** Every language planned for the page. Only the ones in `LANGUAGES` are offered. */
export type LanguageCode = 'en' | 'de' | 'es' | 'fr' | 'it' | 'pl' | 'pt' | 'ru' | 'uk' | 'zh-Hans';

export interface LanguageEntry {
  /** A BCP 47 tag; it also goes on `<html lang>`. */
  readonly code: LanguageCode;
  /** The language's own name for itself, as the switcher shows it. */
  readonly name: string;
  readonly load: () => Promise<Dictionary>;
}

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const LANGUAGES: readonly LanguageEntry[] = [
  { code: 'en', name: 'English', load: () => Promise.resolve(en) },
  // { code: 'de', name: 'Deutsch', load: () => import('./locales/de').then((m) => m.default) },
  // { code: 'es', name: 'Español', load: () => import('./locales/es').then((m) => m.default) },
  // { code: 'fr', name: 'Français', load: () => import('./locales/fr').then((m) => m.default) },
  // { code: 'it', name: 'Italiano', load: () => import('./locales/it').then((m) => m.default) },
  // { code: 'pl', name: 'Polski', load: () => import('./locales/pl').then((m) => m.default) },
  /* European Portuguese (pt-PT spelling). */
  // { code: 'pt', name: 'Português', load: () => import('./locales/pt').then((m) => m.default) },
  // { code: 'ru', name: 'Русский', load: () => import('./locales/ru').then((m) => m.default) },
  // { code: 'uk', name: 'Українська', load: () => import('./locales/uk').then((m) => m.default) },
  {
    code: 'zh-Hans',
    name: '简体中文',
    load: () => import('./locales/zh-Hans').then((m) => m.default),
  },
];
