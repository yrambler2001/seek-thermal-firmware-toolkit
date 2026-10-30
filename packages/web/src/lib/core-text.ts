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
  evidenceMessages,
  isCoreMessage,
  keyNameParam,
  recordedParam,
  type BootPolicy,
  type CoreMessage,
  type CoreParam,
  type FirmwareProfile,
  type ProfileMatch,
} from '@seek-fw/core';
import {
  listAnd,
  listComma,
  listSemicolon,
  nameText,
  t,
  type AnyParam,
  type NameKey,
  type NameValue,
  type Translate,
} from '@/i18n';
import { en } from '@/i18n/locales/en';
import { bankNameRef, bankWordsRef } from '@/lib/bank-names';

type LooseTranslate = (key: string, params?: Readonly<Record<string, AnyParam>>) => string;

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * A key's name as a param (`{key}`, `{storeKey}`): the name core gives it ("Key A", keyName.*), which a
 * language may decline, or a name core does not know, said as it is.
 */
export function keyNameValue(name: string): NameValue {
  const param = keyNameParam(name);
  return typeof param === 'string' ? { text: param } : { name: `core:${param.code}` as NameKey };
}

/**
 * A core param that is a name: a bank, a key core names (keyName.*), or a list of those, which a
 * template may put in a case (`{bank:loc}`); null for any other param.
 */
export function coreNameOf(param: Exclude<CoreParam, string | number>): NameValue | null {
  if ('bank' in param) {
    return param.form === 'name' ? bankNameRef(param.bank) : bankWordsRef(param.bank);
  }
  if ('text' in param) {
    return param.code.startsWith('keyName.') ? { name: `core:${param.code}` as NameKey } : null;
  }
  if ('capital' in param || param.join === 'semicolon' || param.list.length === 0) return null;
  const names: NameValue[] = [];
  for (const item of param.list) {
    const name = typeof item === 'object' ? coreNameOf(item) : null;
    if (name === null) return null;
    names.push(name);
  }
  return { names, join: param.join };
}

function paramWords(param: CoreParam, translate: Translate): AnyParam {
  if (typeof param === 'string' || typeof param === 'number') return param;
  /* A bank, a key name or a list of them stays a name: the template may ask for a case of it. */
  const name = coreNameOf(param);
  if (name !== null) return name;
  if ('text' in param) return coreText(param, translate);
  if ('capital' in param) return capitalise(coreParamText(param.capital, translate));
  if ('bank' in param) return ''; /* named above */
  const words = param.list.map((item) => coreParamText(item, translate));
  if (param.join === 'semicolon') return listSemicolon(words, translate);
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
  const words = paramWords(param, translate);
  return typeof words === 'object' ? nameText(words, translate) : String(words);
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
  const params: Record<string, AnyParam> = {};
  for (const [name, param] of Object.entries(message.params)) {
    params[name] = paramWords(param, translate);
  }
  return (translate as unknown as LooseTranslate)(`core:${message.code}`, params);
}

/**
 * Core's sentences in the language in use, one per English `text`: the message at the same place while it
 * still says that text, else the English. A caller that replaced or filtered one list and not the other
 * shows its English, and drops no sentence.
 */
export function coreTexts(
  messages: readonly (CoreMessage | string)[] | undefined,
  texts: readonly string[],
  translate: Translate = t,
): string[] {
  return texts.map((text, at) => recordedText(messages?.[at], text, translate));
}

/** `coreText`, keeping a missing message missing (a row the page leaves out). */
export function nullableCoreText(
  message: CoreMessage | null | undefined,
  translate: Translate = t,
): string | null {
  return message === null || message === undefined ? null : coreText(message, translate);
}

/**
 * Why detection scored a family as it did, one sentence per reason, in the language in use. A reason
 * whose message no longer says its English (a match a caller built) shows the English.
 */
export function evidenceTexts(
  match: Pick<ProfileMatch, 'reasons' | 'reasonMessages'>,
  translate: Translate = t,
): string[] {
  return evidenceMessages(match).map((reason) => coreText(reason, translate));
}

/** What a family is (`summary`), in the language in use. */
export function familySummaryText(
  profile: Pick<FirmwareProfile, 'summary' | 'summaryMessage'>,
  translate: Translate = t,
): string {
  return coreText(recordedParam(profile.summaryMessage, profile.summary), translate);
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
