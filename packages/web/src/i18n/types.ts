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

/**
 * The plural categories `Intl.PluralRules` gives each language the page has or plans (CLDR, as Node and
 * the browsers ship it; `pt` is European Portuguese, format.ts `PLURAL_LOCALE`). languages.test.ts checks
 * this table against the runtime's rules. A language not here yet: add its line before its dictionaries.
 */
export interface PluralCategoriesOf {
  readonly en: 'one' | 'other';
  readonly bg: 'one' | 'other';
  readonly cs: 'one' | 'few' | 'many' | 'other';
  readonly de: 'one' | 'other';
  readonly es: 'one' | 'many' | 'other';
  readonly et: 'one' | 'other';
  readonly fr: 'one' | 'many' | 'other';
  readonly hu: 'one' | 'other';
  readonly it: 'one' | 'many' | 'other';
  readonly lt: 'one' | 'few' | 'many' | 'other';
  readonly lv: 'zero' | 'one' | 'other';
  readonly pl: 'one' | 'few' | 'many' | 'other';
  readonly pt: 'one' | 'many' | 'other';
  readonly ro: 'one' | 'few' | 'other';
  readonly ru: 'one' | 'few' | 'many' | 'other';
  readonly sk: 'one' | 'few' | 'many' | 'other';
  readonly sl: 'one' | 'two' | 'few' | 'other';
  readonly sr: 'one' | 'few' | 'other';
  readonly uk: 'one' | 'few' | 'many' | 'other';
  readonly 'zh-Hans': 'other';
}

/** A language whose plural categories the types know (`Translation<N, L>`). */
export type PluralLanguage = keyof PluralCategoriesOf;

/**
 * Plural forms with exactly the categories `C`: each one required, any other refused. Latvian's
 * `PluralFormsOf<'zero' | 'one' | 'other'>` must give `zero` and may not give `few`.
 */
export type PluralFormsOf<C extends PluralCategory> = Readonly<Record<C | 'other', string>> &
  Partial<Readonly<Record<Exclude<PluralCategory, C | 'other'>, never>>>;

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
 * The grammatical cases a template may ask a name in: `{bank:gen}`; the plain `{bank}` is the form the
 * name's own entry gives (the nominative). README.md, "Cases", says what each one means.
 *
 * - the five the Slavic languages and German use (the Romance languages and Romanian use them for the
 *   article): genitive, dative, accusative, instrumental, locative;
 * - the local cases Hungarian and Estonian mark with a suffix on the noun: inessive (in), illative (into),
 *   elative (out of), superessive (on), sublative (onto), delative (off, about), adessive (at),
 *   allative (to), ablative (from);
 * - translative (into a state, "becomes"), terminative (until, as far as), essive (as), comitative
 *   (with), abessive (without), partitive (Estonian's object and part case), causal-final (Hungarian
 *   -ért, "for");
 * - nominative: the name as a subject inside a sentence, where that differs from the plain form (a
 *   Hungarian article, Bulgarian's full article "слотът").
 */
export type GrammaticalCase =
  | 'nom'
  | 'gen'
  | 'dat'
  | 'acc'
  | 'ins'
  | 'loc'
  | 'ine'
  | 'ill'
  | 'ela'
  | 'sup'
  | 'sub'
  | 'del'
  | 'ade'
  | 'all'
  | 'abl'
  | 'tra'
  | 'ter'
  | 'ess'
  | 'com'
  | 'abe'
  | 'par'
  | 'cau';

/**
 * How a case asked of a list reaches its names (the language's registry entry, `listCase`):
 * - `'each'`: every name takes it ("w slocie A i slocie B"), the default;
 * - `'last'`: only the last name does and the others are said in the nominative (`:nom`, else the
 *   plain form), as Hungarian closes a coordinated list with one suffix;
 * - `{ lastOnly, before }`: for the cases in `lastOnly` only the last name takes the case and the others
 *   take `before` (the nominative when it is left out); every other case reaches each name. Estonian
 *   says the terminative, essive, abessive and comitative this way, the names before the last in the
 *   genitive ("Mardi ja Juhaniga").
 */
export type ListCase =
  | 'each'
  | 'last'
  | { readonly lastOnly: readonly GrammaticalCase[]; readonly before?: GrammaticalCase };

/**
 * The entries that name something a sentence declines: the banks and the keys, and the page's "the other
 * bank" (said where the booted bank has no name).
 */
export type NameKey = Extract<
  MessageKey,
  `common:bank.${string}` | `core:keyName.${string}` | 'shared:deviceInfo.otherBank'
>;

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

/** The letters of the camera's banks: a case form may be given for one of them (`Translation`). */
export type BankLetter = 'A' | 'B' | 'R';

/**
 * The shape a translated namespace file must have. A name entry may also have case forms, each its own
 * optional key: `'bank.slotInSentence:loc': 'slocie {letter}'`, and a form for one bank letter where the
 * words around the letter change with it (Hungarian's article: `'bank.slotInSentence:nom': 'az {letter}
 * slot'`, `'bank.slotInSentence:nom#B': 'a {letter} slot'`). A case form for a key that is not a name,
 * or a case that is not a `GrammaticalCase`, is a compile error.
 *
 * With the language, `Translation<'common', 'lv'>`, every plural entry must give exactly the categories
 * that language's `Intl.PluralRules` uses (`PluralCategoriesOf`): a missing `zero` in Latvian, or a
 * `few` it never picks, is a compile error. Without it, any categories with `other` pass the types and
 * locales.test.ts reports a missing one.
 */
export type Translation<N extends Namespace, L extends PluralLanguage | undefined = undefined> = {
  readonly [K in keyof Messages[N]]: Messages[N][K] extends string
    ? string
    : L extends PluralLanguage
      ? PluralFormsOf<PluralCategoriesOf[L]>
      : PluralForms;
} & Partial<
  Readonly<
    Record<
      `${NameKeyIn<N>}:${GrammaticalCase}` | `${NameKeyIn<N>}:${GrammaticalCase}#${BankLetter}`,
      string
    >
  >
>;

/** A whole translated language: every namespace. */
export type Dictionary = { readonly [N in Namespace]: Translation<N> };

/** What the runtime is prepared for: any namespace or key may be missing. */
export type LooseDictionary = Readonly<Partial<Record<string, Readonly<Record<string, Message>>>>>;
