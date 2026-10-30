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

import type { Dictionary, Message, NamespaceMessages } from './types';

const UPPER = 'ÁƁÇÐÉƑĜĤÎĴĶĽṀÑÖÞǪŘŠŢÜṼŴẊÝŽ';
const LOWER = 'áƀçðéƒĝĥîĵķľɱñöþǫřšţüṽŵẋýž';

/** `{param}` and slot tags: kept as written. */
const KEEP = /(\{[A-Za-z_]\w*\}|<\/?[A-Za-z][\w-]*\s*\/?>)/;

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

function pseudoNamespace(messages: NamespaceMessages): NamespaceMessages {
  return Object.fromEntries(
    Object.entries(messages).map(([key, message]) => [key, pseudoMessage(message)]),
  );
}

/** The whole English dictionary in the pseudo language. */
export function pseudoDictionary(english: Dictionary): Dictionary {
  return Object.fromEntries(
    Object.entries(english).map(([namespace, messages]) => [
      namespace,
      pseudoNamespace(messages as NamespaceMessages),
    ]),
  ) as unknown as Dictionary;
}

/** True when `text` has no ASCII letter: nothing in it was left in English. */
export function isPseudo(text: string): boolean {
  return !/[A-Za-z]/.test(text);
}
