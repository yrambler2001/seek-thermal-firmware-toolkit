/**
 * Which language a visit starts in, and where a choice is kept.
 *
 * The order, first match wins:
 *   1. `?lang=xx` in the URL, for that visit only (a forum post can link
 *      straight to Russian: `…/?lang=ru#/v4`);
 *   2. the choice made in the switcher, kept in localStorage under `LANG_KEY`;
 *   3. the first of the browser's `navigator.languages` that matches a
 *      registered language by its primary subtag (`zh-TW` → `zh-Hans`,
 *      `pt-BR` → `pt`, `en-GB` → `en`);
 *   4. English.
 *
 * Only registered languages match: a `?lang=` for one not shipped yet falls
 * through to the next step. Storage can throw (a private window, blocked site
 * data), so every read and write is wrapped, as lib/theme.ts does.
 */

import { DEFAULT_LANGUAGE, LANGUAGES, type LanguageCode, type LanguageEntry } from './languages';

export const LANG_KEY = 'seek-fw:lang';
export const LANG_PARAM = 'lang';

type Registry = readonly Pick<LanguageEntry, 'code'>[];

function primarySubtag(tag: string): string {
  return tag.split(/[-_]/)[0] ?? '';
}

/** The registered language a tag means, or null: an exact match first, then the primary subtag. */
export function matchLanguage(
  tag: string | null | undefined,
  registry: Registry = LANGUAGES,
): LanguageCode | null {
  if (tag === null || tag === undefined) return null;
  const wanted = tag.trim().toLowerCase();
  if (wanted === '') return null;
  const exact = registry.find((entry) => entry.code.toLowerCase() === wanted);
  if (exact !== undefined) return exact.code;
  const primary = primarySubtag(wanted);
  const loose = registry.find((entry) => primarySubtag(entry.code.toLowerCase()) === primary);
  return loose?.code ?? null;
}

export interface LanguageEnvironment {
  /** `location.search`, e.g. `?lang=ru`. */
  readonly search: string;
  /** The choice kept in storage, or null. */
  readonly stored: string | null;
  /** `navigator.languages`, most preferred first. */
  readonly languages: readonly string[];
}

/** The URL's `?lang=` value, or null. */
export function langParam(search: string): string | null {
  try {
    return new URLSearchParams(search).get(LANG_PARAM);
  } catch {
    return null;
  }
}

export function detectLanguage(
  env: LanguageEnvironment,
  registry: Registry = LANGUAGES,
): LanguageCode {
  const fromUrl = matchLanguage(langParam(env.search), registry);
  if (fromUrl !== null) return fromUrl;
  const fromStorage = matchLanguage(env.stored, registry);
  if (fromStorage !== null) return fromStorage;
  for (const tag of env.languages) {
    const fromBrowser = matchLanguage(tag, registry);
    if (fromBrowser !== null) return fromBrowser;
  }
  return DEFAULT_LANGUAGE;
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** The choice kept from the switcher, as stored (not yet matched), or null. */
export function readLanguageChoice(): string | null {
  try {
    return storage()?.getItem(LANG_KEY) ?? null;
  } catch {
    return null;
  }
}

/** Keeps the switcher's choice. A store that throws keeps nothing. */
export function writeLanguageChoice(code: LanguageCode): void {
  try {
    storage()?.setItem(LANG_KEY, code);
  } catch {
    /* Blocked storage: the language still changes, for this visit only. */
  }
}

/** Reads the live environment. Split out so `detectLanguage` stays pure. */
export function readLanguageEnvironment(): LanguageEnvironment {
  const nav: Navigator | undefined = typeof navigator === 'undefined' ? undefined : navigator;
  const languages =
    nav === undefined ? [] : nav.languages.length > 0 ? nav.languages : [nav.language];
  return {
    search: typeof location === 'undefined' ? '' : location.search,
    stored: readLanguageChoice(),
    languages,
  };
}

/**
 * Drops `?lang=` from the address bar without a reload, so a choice made in
 * the switcher is not overridden by the link's parameter on the next reload.
 */
export function dropLangParam(): void {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(LANG_PARAM)) return;
    url.searchParams.delete(LANG_PARAM);
    window.history.replaceState(window.history.state, '', url);
  } catch {
    /* An opaque origin (file:) may refuse; the parameter then simply stays. */
  }
}
