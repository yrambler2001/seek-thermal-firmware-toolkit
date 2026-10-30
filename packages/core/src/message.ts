/* ==================================================================== *
 * A user-facing sentence as a code plus params, next to its English.
 *
 * Core says its sentences in English, and the CLI and every log print that English as it is. The web page
 * also shows them in the reader's language: it renders `core:<code>` from its own dictionary with the
 * params (packages/web/src/lib/core-text.ts). So a function that makes a sentence the page shows returns a
 * `CoreMessage`, or a result carries one next to its English text field, and `text` is exactly the English
 * the function produced before it had a code.
 *
 * The English templates live in the page's `core` namespace (packages/web/src/i18n/locales/en/core.ts). A
 * web test renders each code's template in English for representative inputs and asserts it equals
 * `text`, so the two cannot drift apart.
 *
 * A param is plain text (a hex value, a version, a file name: never translated), a number, another
 * message (translated in turn), a bank (named by the page in the reader's words), a capitalised param, or
 * a list. Codes are dotted, like the page's keys: `<area>.<what>`.
 * ==================================================================== */

import type { SlotKey } from './profiles/types.js';

/** A bank, by key: "slot A" / "recovery R" inside a sentence, "Slot A" / "Recovery R" with `form: 'name'`. */
export interface CoreBankParam {
  readonly bank: SlotKey;
  readonly form?: 'name';
}

/** A param with its first letter upper-cased (a sentence that starts with it). */
export interface CoreCapitalParam {
  readonly capital: CoreParam;
}

/**
 * Params joined into one: `and` pairwise ("A and B and C"), `commaAnd` as core's bank lists say it
 * ("A, B and C"), `semicolon` with "; ".
 */
export interface CoreListParam {
  readonly list: readonly CoreParam[];
  readonly join: 'and' | 'commaAnd' | 'semicolon';
}

export type CoreParam =
  string | number | CoreMessage | CoreBankParam | CoreCapitalParam | CoreListParam;

export interface CoreMessage {
  /** The page's key, without the `core:` namespace. */
  readonly code: string;
  readonly params: Readonly<Record<string, CoreParam>>;
  /** The English, as the CLI and the logs say it. */
  readonly text: string;
}

/** A message whose English is `text`. The caller builds `text` the way it always has. */
export function coreMessage(
  code: string,
  params: Readonly<Record<string, CoreParam>>,
  text: string,
): CoreMessage {
  return { code, params, text };
}

/** A bank param, in sentence words ("slot A") or, with `'name'`, as a label ("Slot A"). */
export function bankParam(bank: SlotKey, form?: 'name'): CoreBankParam {
  return form === undefined ? { bank } : { bank, form };
}

export function capitalParam(param: CoreParam): CoreCapitalParam {
  return { capital: param };
}

export function listParam(list: readonly CoreParam[], join: CoreListParam['join']): CoreListParam {
  return { list, join };
}

export function isCoreMessage(value: unknown): value is CoreMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { code?: unknown }).code === 'string' &&
    typeof (value as { text?: unknown }).text === 'string' &&
    typeof (value as { params?: unknown }).params === 'object' &&
    (value as { params?: unknown }).params !== null
  );
}

const BANK_WORDS: Readonly<Record<SlotKey, string>> = {
  a: 'slot A',
  b: 'slot B',
  r: 'recovery R',
};

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** A param's English, as core writes it into `text`. */
export function paramText(param: CoreParam): string {
  if (typeof param === 'string') return param;
  if (typeof param === 'number') return String(param);
  if ('text' in param) return param.text;
  if ('bank' in param) {
    const words = BANK_WORDS[param.bank];
    return param.form === 'name' ? capitalise(words) : words;
  }
  if ('capital' in param) return capitalise(paramText(param.capital));
  const words = param.list.map(paramText);
  if (param.join === 'semicolon') return words.join('; ');
  if (param.join === 'and' || words.length < 2) return words.join(' and ');
  return `${words.slice(0, -1).join(', ')} and ${words.at(-1) ?? ''}`;
}
