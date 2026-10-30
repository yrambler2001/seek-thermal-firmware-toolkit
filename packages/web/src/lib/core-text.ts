/**
 * Core's sentences in the reader's language.
 *
 * `@seek-fw/core` says its sentences in English (the CLI and the logs print
 * them as they are) and gives the ones the page shows a code and params too:
 * a `CoreMessage` (packages/core/src/message.ts). The page renders
 * `core:<code>` from its dictionary with the params, each param in turn: a
 * nested message is translated, a bank is named with the page's bank words, a
 * list is joined with the language's list words. English renders to exactly
 * core's `text` (i18n/core-messages.test.ts proves it for every code).
 *
 * A plain string is shown as it is: an old run file's stored English, or a
 * core sentence that has no code yet. A code the dictionary does not know
 * shows core's English.
 */

import {
  isCoreMessage,
  recordedParam,
  type BootPolicy,
  type CoreMessage,
  type CoreParam,
} from '@seek-fw/core';
import { listAnd, listComma, t, type Translate } from '@/i18n';
import { en } from '@/i18n/locales/en';
import { bankName, bankWords } from '@/lib/bank-names';

type LooseTranslate = (key: string, params?: Readonly<Record<string, string | number>>) => string;

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function paramWords(param: CoreParam, translate: Translate): string | number {
  if (typeof param === 'string' || typeof param === 'number') return param;
  if ('text' in param) return coreText(param, translate);
  if ('bank' in param) {
    return param.form === 'name'
      ? bankName(param.bank, translate)
      : bankWords(param.bank, translate);
  }
  if ('capital' in param) return capitalise(String(paramWords(param.capital, translate)));
  const words = param.list.map((item) => String(paramWords(item, translate)));
  if (param.join === 'semicolon') return words.join('; ');
  if (param.join === 'comma') return listComma(words, translate);
  if (param.join === 'and') return listAnd(words, translate);
  const last = words.at(-1);
  if (last === undefined) return '';
  if (words.length === 1) return last;
  return translate('common:list.and', {
    first: listComma(words.slice(0, -1), translate),
    second: last,
  });
}

/** One param of a core message in the language in use (a bank, a nested message, a list, plain text). */
export function coreParamText(param: CoreParam, translate: Translate = t): string {
  return String(paramWords(param, translate));
}

/** Whether the page's dictionary has a template for this code. */
export function knowsCoreCode(code: string): boolean {
  return Object.hasOwn(en.core, code);
}

/**
 * A core sentence in the language in use (`tEnglish` gives core's English).
 * `null` and `undefined` give ''.
 */
export function coreText(
  message: CoreMessage | string | null | undefined,
  translate: Translate = t,
): string {
  if (message === null || message === undefined) return '';
  if (typeof message === 'string') return message;
  if (!knowsCoreCode(message.code)) return message.text;
  const params: Record<string, string | number> = {};
  for (const [name, param] of Object.entries(message.params)) {
    params[name] = paramWords(param, translate);
  }
  return (translate as unknown as LooseTranslate)(`core:${message.code}`, params);
}

/** Core's sentences in the language in use: `messages` where core gave them, else the English `texts`. */
export function coreTexts(
  messages: readonly (CoreMessage | string)[] | undefined,
  texts: readonly string[],
  translate: Translate = t,
): string[] {
  return messages === undefined
    ? [...texts]
    : messages.map((message) => coreText(message, translate));
}

/** `coreText`, keeping a missing message missing (a row the page leaves out). */
export function nullableCoreText(
  message: CoreMessage | null | undefined,
  translate: Translate = t,
): string | null {
  return message === null || message === undefined ? null : coreText(message, translate);
}

/** What a boot-config word means on this family, in the language in use (`describeCfg0`). */
export function cfg0Words(boot: BootPolicy, cfg0: number, translate: Translate = t): string {
  return coreText(boot.describeCfg0Message?.(cfg0) ?? boot.describeCfg0(cfg0), translate);
}

/**
 * A core sentence recorded in a saved file (the Preserve run file): its message when the file has a
 * well-formed one, else the stored English `text`. Old files have no message.
 */
export function recordedCoreText(
  message: unknown,
  text: string | undefined,
  translate: Translate = t,
): string | undefined {
  if (!isCoreMessage(message)) return text;
  try {
    return coreText(message, translate);
  } catch {
    return text;
  }
}

/**
 * A sentence a run file recorded as English with a message beside it (a bank's refusal, the boot facts'
 * why), or one core builds from such a file: the message while it still says `text` and renders, else
 * `text`.
 */
export function recordedText(message: unknown, text: string, translate: Translate = t): string {
  return recordedCoreText(recordedParam(message, text), text, translate) ?? text;
}
