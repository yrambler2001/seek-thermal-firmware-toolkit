/**
 * The React side: a component that calls `useT()` (or `useLanguage()`)
 * re-renders when the language changes.
 *
 * There is no provider to wrap the tree in. The language lives in one store
 * (./store.ts) that plain `t()` also reads, and `useSyncExternalStore` is the
 * subscription — a context would only be a second copy of it. App calls
 * `useLanguage()`, so the whole page re-renders on a switch, including the
 * parts that read `t()` through a lib (tab labels, the support banner).
 */

import { useMemo, useSyncExternalStore } from 'react';
import { LANGUAGES, type LanguageCode, type LanguageEntry } from './languages';
import { rich } from './rich';
import { getLanguage, setLanguage, subscribe, t } from './store';

/** The language in use; re-renders the caller when it changes. */
export function useLanguage(): LanguageCode {
  return useSyncExternalStore(subscribe, getLanguage, getLanguage);
}

export interface UseT {
  /** Plain text (mini-markup left as written). */
  readonly t: typeof t;
  /** React nodes, with mini-markup and slots rendered. */
  readonly rich: typeof rich;
  /** The language in use. */
  readonly lang: LanguageCode;
}

/** `const { t, rich } = useT();` in any component that shows text. */
export function useT(): UseT {
  const lang = useLanguage();
  return useMemo(() => ({ t, rich, lang }), [lang]);
}

export interface UseLanguageSwitch {
  readonly lang: LanguageCode;
  readonly languages: readonly LanguageEntry[];
  /** Loads `code`, switches to it and keeps the choice (the switcher's pick). */
  readonly choose: (code: LanguageCode) => Promise<void>;
}

export function useLanguageSwitch(): UseLanguageSwitch {
  const lang = useLanguage();
  return useMemo(
    () => ({
      lang,
      languages: LANGUAGES,
      choose: (code: LanguageCode) => setLanguage(code, { persist: true }),
    }),
    [lang],
  );
}
