/**
 * The language in use, as one module-level store.
 *
 * Plain `t()` reads it directly, so hooks and libs that build strings outside
 * React need nothing passed in. React reads it through `useSyncExternalStore`
 * (./react.ts), so a component that calls `useT()` re-renders when it changes.
 *
 * A language is always loaded before it is applied: `setLanguage()` awaits the
 * chunk, then swaps the dictionary, updates `<html lang>` and notifies. The page
 * never shows half of one language and half of another, and main.tsx awaits
 * `initI18n()` before the first render, so English never flashes first.
 */

import {
  dropLangParam,
  detectLanguage,
  readLanguageEnvironment,
  writeLanguageChoice,
} from './detect';
import type { LanguageEnvironment } from './detect';
import { interpolate, isPluralForms, selectPluralForm } from './format';
import { DEFAULT_LANGUAGE, LANGUAGES, type LanguageCode } from './languages';
import { en } from './locales/en';
import type { LooseDictionary, MessageKey, ParamValue, TArgs } from './types';

interface State {
  readonly lang: LanguageCode;
  readonly dict: LooseDictionary;
}

const ENGLISH: LooseDictionary = en;

let state: State = { lang: DEFAULT_LANGUAGE, dict: ENGLISH };
/** Bumped by every switch: a slow load that a later switch overtook is dropped. */
let generation = 0;
const listeners = new Set<() => void>();
const loaded = new Map<LanguageCode, LooseDictionary>([[DEFAULT_LANGUAGE, ENGLISH]]);

/** The language in use. */
export function getLanguage(): LanguageCode {
  return state.lang;
}

/** For `useSyncExternalStore`: calls `listener` after every switch. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Sets `<html lang>`, which screen readers, hyphenation and fonts key on. */
export function syncHtmlLang(lang: LanguageCode, doc: Document = document): void {
  doc.documentElement.lang = lang;
}

function apply(lang: LanguageCode, dict: LooseDictionary): void {
  state = { lang, dict };
  if (typeof document !== 'undefined') syncHtmlLang(lang);
  for (const listener of [...listeners]) listener();
}

/** Loads a registered language's dictionary (once; later calls reuse it). */
export async function loadLanguage(lang: LanguageCode): Promise<LooseDictionary> {
  const cached = loaded.get(lang);
  if (cached !== undefined) return cached;
  const entry = LANGUAGES.find((candidate) => candidate.code === lang);
  if (entry === undefined) throw new Error(`language ${lang} is not registered`);
  const dict: LooseDictionary = await entry.load();
  loaded.set(lang, dict);
  return dict;
}

export interface SetLanguageOptions {
  /** Keep the choice in localStorage and drop `?lang=` from the URL: a pick in the switcher. */
  readonly persist?: boolean;
}

/**
 * Loads `lang`, then switches to it. Rejects when the chunk cannot be fetched
 * (offline, say); the page then stays in the language it was in.
 */
export async function setLanguage(
  lang: LanguageCode,
  { persist = false }: SetLanguageOptions = {},
): Promise<void> {
  generation += 1;
  const mine = generation;
  const dict = await loadLanguage(lang);
  if (mine !== generation) return;
  if (persist) {
    writeLanguageChoice(lang);
    dropLangParam();
  }
  apply(lang, dict);
}

/**
 * Picks the starting language (see ./detect.ts) and loads it. main.tsx awaits
 * this before the first render. A language that fails to load leaves English.
 */
export async function initI18n(
  env: LanguageEnvironment = readLanguageEnvironment(),
): Promise<LanguageCode> {
  const lang = detectLanguage(env);
  try {
    await setLanguage(lang);
  } catch {
    apply(DEFAULT_LANGUAGE, ENGLISH);
  }
  return state.lang;
}

/** Back to English at once, with nothing loaded or kept. The test setup calls it before every test. */
export function resetI18n(): void {
  generation += 1;
  apply(DEFAULT_LANGUAGE, ENGLISH);
}

/**
 * The template for a key in the language in use: the language's entry, else
 * English's (a key a translation lacks), else the key itself. Plural entries
 * pick their form by `params.count` with the rules of the language the entry
 * came from.
 */
export function template(key: string, params?: Readonly<Record<string, ParamValue>>): string {
  const split = key.indexOf(':');
  const namespace = key.slice(0, split);
  const name = key.slice(split + 1);
  const own = state.dict[namespace]?.[name];
  const english = ENGLISH[namespace]?.[name];
  const [message, lang] =
    own !== undefined
      ? [own, state.lang]
      : english !== undefined
        ? [english, DEFAULT_LANGUAGE]
        : [];
  if (message === undefined || lang === undefined) return key;
  if (!isPluralForms(message)) return message;
  /* A form the translation left out falls back to its own `other`, which
   * stays in the reader's language; locales.test.ts makes that a test failure. */
  return selectPluralForm(message, lang, Number(params?.count ?? 0));
}

/**
 * The text for a key, in the language in use, with `{name}` placeholders
 * filled from `params`. Mini-markup (`**bold**`, `*em*`, `` `code` ``, slots)
 * is returned as written: render it with `rich()` or `<Rich>`, or strip it
 * with `plainText()`.
 *
 *     t('app:connect.test')                       // "Test connection"
 *     t('app:documentTitle', { tab: 'Info' })      // "Seek Thermal Firmware — Info (WebUSB)"
 *     t('common:count.files', { count: 3 })        // "3 files"
 */
export function t<K extends MessageKey>(key: K, ...args: TArgs<K>): string;
export function t(key: string, params?: Readonly<Record<string, ParamValue>>): string {
  return interpolate(template(key, params), params);
}
