/**
 * A pseudo language for tests: every English entry with its letters swapped
 * for accented look-alikes and wrapped in `⟦…⟧`, so it reads like English but
 * holds no ASCII letter. Params (`{name}`), slot tags (`<name>…</name>`,
 * `<name/>`) and the mini-markup characters (`**`, `*`, `` ` ``) are kept as
 * they are, so every key renders exactly as a real translation would.
 *
 * Text on the page that still has ASCII words came from somewhere other than a
 * dictionary: a hard-coded string, a core sentence with no message, or data.
 * pseudo-locale.test.tsx renders the page in it and fails on that text.
 *
 * Test-only: nothing outside the tests imports this file, so it is not in the
 * bundle. It is not in the switcher either: the test adds it to a mocked
 * registry (see `vi.mock('./languages')` there).
 */

import { CASES, PLURAL_CATEGORIES } from './format';
import { NAME_PARAMS, isNameKey } from './names';
import type { Dictionary, Message, NamespaceMessages } from './types';

const UPPER = 'ÁƁÇÐÉƑĜĤÎĴĶĽṀÑÖÞǪŘŠŢÜṼŴẊÝŽ';
const LOWER = 'áƀçðéƒĝĥîĵķľɱñöþǫřšţüṽŵẋýž';

/** `{param}`, `{param:case}` and slot tags: kept as written. */
const KEEP = /(\{[A-Za-z_]\w*(?::[a-z]+)?\}|<\/?[A-Za-z][\w-]*\s*\/?>)/;

function swapLetters(text: string): string {
  return text.replace(/[A-Za-z]/g, (letter) => {
    const code = letter.charCodeAt(0);
    return code <= 90 ? (UPPER[code - 65] ?? letter) : (LOWER[code - 97] ?? letter);
  });
}

/** One English string in the pseudo language: `Write slot` → `⟦Ŵřîţé šľöţ Б⟧`. */
export function pseudoText(english: string): string {
  const body = english
    .split(KEEP)
    .map((part, index) => (index % 2 === 1 ? part : swapLetters(part)))
    .join('');
  return `⟦${body} Б⟧`;
}

/**
 * Plural entries get `one`, `few`, `many` and `other`, as Polish needs; the
 * test registers the pseudo language under `pl` so `Intl.PluralRules` picks
 * among all four.
 */
function pseudoMessage(message: Message): Message {
  if (typeof message === 'string') return pseudoText(message);
  const other = pseudoText(message.other);
  return {
    one: pseudoText(message.one ?? message.other),
    few: other,
    many: other,
    other,
  };
}

/**
 * The case path, exercised: every name (a bank, a key) gets a form in each case, marked `ᶜ`, and each page
 * param names.ts declares asks for the locative, as a Polish sentence might.
 */
function withCases(namespace: string, key: string, message: Message): [string, Message][] {
  const id = `${namespace}:${key}`;
  const params = (NAME_PARAMS as Readonly<Record<string, readonly string[]>>)[id] ?? [];
  const cased = (text: string): string =>
    params.reduce((out, param) => out.replaceAll(`{${param}}`, `{${param}:loc}`), text);
  const own: Message =
    typeof message === 'string'
      ? cased(message)
      : {
          ...Object.fromEntries(
            PLURAL_CATEGORIES.map((category) => [
              category,
              cased(message[category] ?? message.other),
            ]),
          ),
          other: cased(message.other),
        };
  const entries: [string, Message][] = [[key, own]];
  if (isNameKey(id) && typeof message === 'string') {
    for (const gramCase of CASES)
      entries.push([`${key}:${gramCase}`, message.replace(/ Б⟧$/, ' Бᶜ⟧')]);
  }
  return entries;
}

function pseudoNamespace(namespace: string, messages: NamespaceMessages): NamespaceMessages {
  return Object.fromEntries(
    Object.entries(messages).flatMap(([key, message]) =>
      withCases(namespace, key, pseudoMessage(message)),
    ),
  );
}

/** The whole English dictionary in the pseudo language. */
export function pseudoDictionary(english: Dictionary): Dictionary {
  return Object.fromEntries(
    Object.entries(english).map(([namespace, messages]) => [
      namespace,
      pseudoNamespace(namespace, messages as NamespaceMessages),
    ]),
  ) as unknown as Dictionary;
}

/** True when `text` has no ASCII letter: nothing in it was left in English. */
export function isPseudo(text: string): boolean {
  return !/[A-Za-z]/.test(text);
}
