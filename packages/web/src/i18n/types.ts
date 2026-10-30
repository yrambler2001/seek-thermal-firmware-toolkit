/**
 * The types the dictionaries are checked against.
 *
 * English is the source: `Messages` is the exact type of `locales/en`, string
 * literals and all. From it come the key union `t()` accepts, the `{param}`
 * names each key needs, and `Translation<N>`, the shape a translated namespace
 * must have: every English key, no other key, a string where English has a
 * string and plural forms where English has plural forms. A translation that
 * misses a key does not compile.
 */

import type { en } from './locales/en';

/** The CLDR plural categories `Intl.PluralRules` answers with. */
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/** One entry per plural category the language uses; `other` is always required. */
export type PluralForms = { readonly other: string } & Partial<
  Readonly<Record<Exclude<PluralCategory, 'other'>, string>>
>;

/** One dictionary entry: a string, or plural forms chosen by `{count}`. */
export type Message = string | PluralForms;

/** What every namespace file is: a flat map of dotted keys to messages. */
export type NamespaceMessages = Readonly<Record<string, Message>>;

/** The English dictionary, the source of every key. */
export type Messages = typeof en;

export type Namespace = keyof Messages;

/** Every key `t()` accepts, written `namespace:key`. */
export type MessageKey = {
  [N in Namespace]: `${N}:${Extract<keyof Messages[N], string>}`;
}[Namespace];

/** The English entry behind a key. */
export type EntryOf<K extends MessageKey> = K extends `${infer N}:${infer R}`
  ? N extends Namespace
    ? R extends keyof Messages[N]
      ? Messages[N][R]
      : never
    : never
  : never;

/** The `{name}` placeholders in one English string. */
type PlaceholdersIn<S> = S extends `${string}{${infer P}}${infer Rest}`
  ? P | PlaceholdersIn<Rest>
  : never;

/** The param names an entry needs: its placeholders, plus `count` for plurals. */
export type ParamNamesOf<E> = E extends string
  ? PlaceholdersIn<E>
  : E extends PluralForms
    ? 'count' | PlaceholdersIn<E[keyof E]>
    : never;

export type ParamValue = string | number;

/** The params object a key needs. */
export type ParamsOf<K extends MessageKey> = Readonly<Record<ParamNamesOf<EntryOf<K>>, ParamValue>>;

/** `t(key)` for a key with no placeholder, `t(key, params)` for one with any. */
export type TArgs<K extends MessageKey> = [ParamNamesOf<EntryOf<K>>] extends [never]
  ? []
  : [params: ParamsOf<K>];

/** The shape a translated namespace file must have. */
export type Translation<N extends Namespace> = {
  readonly [K in keyof Messages[N]]: Messages[N][K] extends string ? string : PluralForms;
};

/** A whole translated language: every namespace. */
export type Dictionary = { readonly [N in Namespace]: Translation<N> };

/** What the runtime is prepared for: any namespace or key may be missing. */
export type LooseDictionary = Readonly<Partial<Record<string, Readonly<Record<string, Message>>>>>;
