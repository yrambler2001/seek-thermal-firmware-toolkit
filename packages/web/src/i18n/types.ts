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
import type { NAME_PARAMS } from './names';

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

/**
 * The grammatical cases a template may ask a name in: `{bank:gen}`. Genitive, dative, accusative,
 * instrumental, locative; the plain `{bank}` is the form the name's own entry gives (the nominative).
 */
export type GrammaticalCase = 'gen' | 'dat' | 'acc' | 'ins' | 'loc';

/** The entries that name something a sentence declines: the banks and the keys. */
export type NameKey = Extract<MessageKey, `common:bank.${string}` | `core:keyName.${string}`>;

/** One name: the entry that says it ("slot {letter}") and that entry's params. */
export interface NameRef {
  readonly name: NameKey;
  readonly params?: Readonly<Record<string, string>>;
}

/** Names joined into one list ("slot A, slot B and recovery R"); a case applies to each name. */
export interface NameList {
  readonly names: readonly NameValue[];
  readonly join: 'and' | 'comma' | 'commaAnd' | 'then';
}

/** A name no entry says (a key core has no name for): the same text in every case. */
export interface NameText {
  readonly text: string;
}

/** What a name param takes; the language picks the form, `{bank:loc}` a case of it. */
export type NameValue = NameRef | NameList | NameText;

/** The params of a key that carry a name (names.ts declares them). */
type NameParamsOf<K extends MessageKey> = K extends keyof typeof NAME_PARAMS
  ? (typeof NAME_PARAMS)[K][number]
  : never;

/** The params object a key needs: a name where names.ts declares one, else a string or a number. */
export type ParamsOf<K extends MessageKey> = Readonly<
  Record<Exclude<ParamNamesOf<EntryOf<K>>, NameParamsOf<K>>, ParamValue> &
    Record<Extract<ParamNamesOf<EntryOf<K>>, NameParamsOf<K>>, NameValue>
>;

/** Any param the runtime is given: plain text, a number or a name. */
export type AnyParam = ParamValue | NameValue;

/** `t(key)` for a key with no placeholder, `t(key, params)` for one with any. */
export type TArgs<K extends MessageKey> = [ParamNamesOf<EntryOf<K>>] extends [never]
  ? []
  : [params: ParamsOf<K>];

/** The name keys of one namespace, without the namespace: `bank.slot`. */
type NameKeyIn<N extends Namespace> = NameKey extends infer K
  ? K extends `${N}:${infer R}`
    ? R
    : never
  : never;

/**
 * The shape a translated namespace file must have. A name entry may also have case forms, each its own
 * optional key: `'bank.slotInSentence:loc': 'slocie {letter}'`. A case form for a key that is not a
 * name, or a case that is not a `GrammaticalCase`, is a compile error.
 */
export type Translation<N extends Namespace> = {
  readonly [K in keyof Messages[N]]: Messages[N][K] extends string ? string : PluralForms;
} & Partial<Readonly<Record<`${NameKeyIn<N>}:${GrammaticalCase}`, string>>>;

/** A whole translated language: every namespace. */
export type Dictionary = { readonly [N in Namespace]: Translation<N> };

/** What the runtime is prepared for: any namespace or key may be missing. */
export type LooseDictionary = Readonly<Partial<Record<string, Readonly<Record<string, Message>>>>>;
