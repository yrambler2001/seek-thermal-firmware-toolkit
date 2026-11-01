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
  LANG_KEY,
  dropLangParam,
  detectLanguage,
  matchLanguage,
  readLanguageEnvironment,
  writeLanguageChoice,
} from './detect';
import type { LanguageEnvironment } from './detect';
import { interpolate, isPluralForms, selectPluralForm, type NameSayer } from './format';
import { DEFAULT_LANGUAGE, LANGUAGES, type LanguageCode } from './languages';
import { en } from './locales/en';
import type {
  AnyParam,
  GrammaticalCase,
  ListCase,
  LooseDictionary,
  MessageKey,
  NameList,
  NameRef,
  NameValue,
  TArgs,
} from './types';

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
  const entry = LANGUAGES.find((candidate) => candidate.code === lang);
  doc.documentElement.lang = entry?.htmlLang ?? lang;
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

/**
 * Follows a pick made in another tab of the page, as lib/theme.ts does for the
 * theme: the switcher there writes `LANG_KEY`, and the browser fires `storage`
 * in every other tab. The tab loads the language and switches; it does not write
 * the choice again (it is already kept), but it drops its own `?lang=`, so a
 * reload of this tab shows the language just picked, not the link's. A value
 * that is not a registered language, and a cleared store, change nothing.
 * main.tsx calls this once after `initI18n()`; it returns the unsubscribe.
 */
export function followLanguageChoice(target: Window = window): () => void {
  const onStorage = (event: StorageEvent): void => {
    if (event.key !== LANG_KEY) return;
    const lang = matchLanguage(event.newValue);
    if (lang === null || lang === state.lang) return;
    setLanguage(lang).then(dropLangParam, () => {
      /* The chunk could not be fetched (offline): this tab stays as it was. */
    });
  };
  target.addEventListener('storage', onStorage);
  return () => {
    target.removeEventListener('storage', onStorage);
  };
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
export function template(key: string, params?: Readonly<Record<string, AnyParam>>): string {
  return templateIn(state.dict, state.lang, key, params);
}

function templateIn(
  dict: LooseDictionary,
  dictLang: LanguageCode,
  key: string,
  params?: Readonly<Record<string, AnyParam>>,
): string {
  const split = key.indexOf(':');
  const namespace = key.slice(0, split);
  const name = key.slice(split + 1);
  const own = dict[namespace]?.[name];
  const english = ENGLISH[namespace]?.[name];
  const [message, lang] =
    own !== undefined ? [own, dictLang] : english !== undefined ? [english, DEFAULT_LANGUAGE] : [];
  if (message === undefined || lang === undefined) return key;
  if (!isPluralForms(message)) return message;
  /* A form the translation left out falls back to its own `other`, which
   * stays in the reader's language; locales.test.ts makes that a test failure. */
  return selectPluralForm(message, lang, Number(params?.count ?? 0));
}

/**
 * A name entry's form in `gramCase`, when the language gives one (`bank.slot:loc`); English gives none.
 * A form for the name's own letter (`bank.slot:nom#B`) comes first.
 */
function caseForm(
  dict: LooseDictionary,
  value: NameRef,
  gramCase: GrammaticalCase,
): string | undefined {
  const split = value.name.indexOf(':');
  const own = dict[value.name.slice(0, split)];
  const key = `${value.name.slice(split + 1)}:${gramCase}`;
  const letter = value.params?.letter;
  const form = (letter === undefined ? undefined : own?.[`${key}#${letter}`]) ?? own?.[key];
  return typeof form === 'string' ? form : undefined;
}

const LIST_KEY: Readonly<Record<Exclude<NameList['join'], 'commaAnd'>, string>> = {
  and: 'common:list.and',
  comma: 'common:list.comma',
  then: 'common:list.then',
};

/**
 * The case a name in a list is said in, when the list is asked for `gramCase` (`ListCase`): the last name
 * always takes it; the others take it too, or the nominative (a missing `:nom` form is the plain form),
 * or the rule's `before`.
 */
export function listItemCase(
  rule: ListCase,
  gramCase: GrammaticalCase | undefined,
  isLast: boolean,
): GrammaticalCase | undefined {
  if (isLast || gramCase === undefined || rule === 'each') return gramCase;
  if (rule === 'last') return 'nom';
  return rule.lastOnly.includes(gramCase) ? (rule.before ?? 'nom') : gramCase;
}

/**
 * Says names in one language: a name in its case form, or its plain form when the language has no such
 * form (a missing form falls back to the same language's plain one, never to English); a list with its
 * names in the case as the language's `listCase` says (each name, by default), joined with the
 * language's `common:list.*`.
 */
function sayerIn(dict: LooseDictionary, lang: LanguageCode): NameSayer {
  const join = (key: string, first: string, second: string): string =>
    interpolate(templateIn(dict, lang, key), { first, second });
  const rule = LANGUAGES.find((entry) => entry.code === lang)?.listCase ?? 'each';
  const say: NameSayer = (value, gramCase) => {
    if ('text' in value) return value.text;
    if ('name' in value) {
      const form = gramCase === undefined ? undefined : caseForm(dict, value, gramCase);
      return interpolate(form ?? templateIn(dict, lang, value.name), value.params);
    }
    const words = value.names.map((name, at) =>
      say(name, listItemCase(rule, gramCase, at === value.names.length - 1)),
    );
    const last = words.at(-1);
    if (last === undefined) return '';
    if (value.join !== 'commaAnd') {
      const key = LIST_KEY[value.join];
      return words.reduce((joined, word) => join(key, joined, word));
    }
    if (words.length === 1) return last;
    const head = words.slice(0, -1).reduce((joined, word) => join(LIST_KEY.comma, joined, word));
    return join(LIST_KEY.and, head, last);
  };
  return say;
}

/** Says names in the language in use; rich() fills its templates with it. */
export function currentSayer(): NameSayer {
  return sayerIn(state.dict, state.lang);
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
export function t(key: string, params?: Readonly<Record<string, AnyParam>>): string {
  return interpolate(template(key, params), params, currentSayer());
}

/**
 * The English text for a key, whatever language is in use. For a sentence the
 * page both shows and writes into the run log or a copyable report, which stay
 * English (README.md, "What stays English"): one dictionary entry, two
 * readers. `hintFor(error, ua, t)` shows a hint translated; `logHint` logs the
 * same hint through `tEnglish`.
 */
export function tEnglish<K extends MessageKey>(key: K, ...args: TArgs<K>): string;
export function tEnglish(key: string, params?: Readonly<Record<string, AnyParam>>): string {
  return interpolate(
    templateIn(ENGLISH, DEFAULT_LANGUAGE, key, params),
    params,
    sayerIn(ENGLISH, DEFAULT_LANGUAGE),
  );
}

/** `t` or `tEnglish`: for a function that builds text either for the page or for the log. */
export type Translate = typeof t;

/**
 * A name on its own, outside a template: in English for `tEnglish`, else in the language in use; in
 * `gramCase` when the language has that form.
 */
export function nameText(
  value: NameValue,
  translate: Translate = t,
  gramCase?: GrammaticalCase,
): string {
  const say =
    translate === tEnglish ? sayerIn(ENGLISH, DEFAULT_LANGUAGE) : sayerIn(state.dict, state.lang);
  return say(value, gramCase);
}

/**
 * Joins names into one phrase with `common:list.and`, pairwise from the left:
 * "slot A", "slot A and slot B", "slot A and slot B and slot R". The names are
 * params, so a translation only places them.
 */
export function listAnd(items: readonly string[], translate: Translate = t): string {
  if (items.length === 0) return '';
  return items.reduce((joined, item) =>
    translate('common:list.and', { first: joined, second: item }),
  );
}

/** Joins names in the order they happen with `common:list.then`, pairwise: "slot A, then slot B, then recovery R". */
export function listThen(items: readonly string[], translate: Translate = t): string {
  if (items.length === 0) return '';
  return items.reduce((joined, item) =>
    translate('common:list.then', { first: joined, second: item }),
  );
}

/** Joins names into a plain list with `common:list.comma`, pairwise: "slot A, slot B, recovery R". */
export function listComma(items: readonly string[], translate: Translate = t): string {
  if (items.length === 0) return '';
  return items.reduce((joined, item) =>
    translate('common:list.comma', { first: joined, second: item }),
  );
}

/** Joins clauses with `common:list.semicolon`, pairwise: "the flash backup; the patch step". */
export function listSemicolon(items: readonly string[], translate: Translate = t): string {
  if (items.length === 0) return '';
  return items.reduce((joined, item) =>
    translate('common:list.semicolon', { first: joined, second: item }),
  );
}
