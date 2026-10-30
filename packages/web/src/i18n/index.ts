/**
 * The page's translations. README.md in this folder has the conventions.
 *
 *     import { t, useT } from '@/i18n';
 */

export { t, getLanguage, setLanguage, initI18n, resetI18n, subscribe, loadLanguage } from './store';
export { rich, renderMarkup, type Slot, type Slots } from './rich';
export { useLanguage, useLanguageSwitch, useT, type UseT } from './react';
export { DEFAULT_LANGUAGE, LANGUAGES, type LanguageCode, type LanguageEntry } from './languages';
export { LANG_KEY, LANG_PARAM, detectLanguage, matchLanguage } from './detect';
export type {
  Dictionary,
  MessageKey,
  NamespaceMessages,
  ParamValue,
  PluralForms,
  Translation,
} from './types';
