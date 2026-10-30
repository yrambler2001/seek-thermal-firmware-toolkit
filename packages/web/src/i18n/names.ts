/**
 * The page's params that carry a name: a bank ("slot A"), a list of banks, or a key ("Key A"). Only these
 * params may be put in a grammatical case in a translation (`{bank:loc}`, README.md, "Cases"), and the
 * page passes them a `NameValue` (`bankWordsRef(key)`, not `bankWords(key)`), which the types demand.
 *
 * Core's keys are not listed: a core param is a name when core passes a bank or a key name
 * (`bankParam`, `keyNameParam`), and core-messages.test.ts checks every case selector in a core template
 * against core's own samples.
 *
 * A new page sentence with a bank or a key in it: list its key here and pass the name as a param.
 */

import type { EntryOf, MessageKey, ParamNamesOf } from './types';

type NameParamTable = { readonly [K in MessageKey]?: readonly ParamNamesOf<EntryOf<K>>[] };

export const NAME_PARAMS = {
  'slots:section.description': ['a', 'b', 'r'],
  'slots:status.dumping': ['bank'],
  'slots:status.dumped': ['bank'],
  'slots:status.patching': ['bank'],
  'slots:status.every.stopped': ['bank'],
  'slots:status.cancelled.one': ['bank'],
  'slots:status.cancelled.many': ['banks'],
  'slots:table.caption': ['a', 'b', 'r'],
  'slots:table.copyTo': ['bank'],
  'slots:table.risk.recovery': ['bank'],
  'slots:everyBank.note': ['order'],
  'slots:everyBank.noteBootedLast': ['order'],
  'slots:what.copy': ['bank'],
  'slots:what.restore': ['bank'],
  'slots:preview.title': ['bank'],
  'slots:preview.targetEmpty': ['bank'],
  'slots:preview.compareCaption': ['bank'],
  'slots:preview.nothingSent': ['bank'],
  'slots:preview.toolbar': ['bank'],
  'slots:preview.write': ['bank'],
  'slots:writeConfirm.title': ['bank'],
  'slots:writeConfirm.recovery': ['bank'],
  'slots:writeConfirm.bootUnnamed': ['bank'],
  'slots:writeConfirm.empty': ['bank'],
  'slots:writeConfirm.eraseEmpty': ['bank'],
  'slots:writeConfirm.erase': ['bank'],
  'slots:writeConfirm.backup': ['bank'],
  'slots:writeConfirm.confirm': ['bank'],
  'slots:fpsConfirm.title': ['bank'],
  'slots:fpsConfirm.recovery': ['bank'],
  'slots:fpsConfirm.what': ['bank'],
  'slots:fpsConfirm.wayBack': ['bank'],
  'slots:fpsConfirm.confirm': ['bank'],
  'slots:fpsEvery.role.bootedRecovery': ['bank'],
  'slots:fpsEvery.role.booted': ['bank'],
  'slots:fpsEvery.role.recovery': ['bank'],
  'slots:fpsEvery.role.bootUnnamed': ['bank'],
  'slots:fpsEvery.other': ['bank'],
  'slots:fpsEvery.orderOne': ['bank'],
  'slots:fpsEvery.order': ['order'],
  'slots:fpsEvery.orderBootedLast': ['order'],
  'slots:outcome.verified': ['bank'],
  'slots:outcome.mismatch': ['bank'],
  'slots:outcome.notCompared': ['bank'],
  'slots:outcome.wasEmpty': ['bank'],
  'slots:fpsOutcome.title': ['bank'],
  'slots:fpsEveryOutcome.title': ['order'],
  'slots:fpsEveryOutcome.notWritten': ['banks'],
  'slots:keys.bootedHolds': ['bank', 'key'],
  'slots:how.ff': ['b'],
  'preserve:how.banks': ['a', 'b', 'r'],
  'preserve:choice.withBanks': ['banks'],
  'preserve:plan.summary': ['banks'],
  'preserve:bankPlan.label': ['bank'],
  'preserve:bankPlan.titleChosen': ['bank'],
  'preserve:bankPlan.titleNotChosen': ['bank'],
  'preserve:bankPlan.sourceValue': ['bank'],
  'preserve:bankPlan.sourceTwoReads': ['bank'],
  'preserve:bankPlan.caption': ['bank'],
  'preserve:confirm.titleWrite': ['banks'],
  'preserve:confirm.patch': ['banks'],
  'preserve:confirm.patchInOrder': ['banks'],
  'preserve:confirm.restore': ['banks'],
  'preserve:confirm.restoreInOrder': ['banks'],
  'preserve:summary.image': ['bank'],
  'preserve:gate.bankRefused': ['bank'],
  'preserve:gate.recoveryRoute': ['bank', 'r'],
  'preserve:gate.patchOf': ['bank'],
  'preserve:gate.capture': ['bank'],
  'preserve:gate.derived': ['bank'],
  'preserve:gate.patchSummary': ['bank'],
  'preserve:gate.plaintext': ['bank'],
  'shared:deviceInfo.bankAt': ['bank'],
  'shared:deviceInfo.keysConfirmed': ['storeKey'],
  'shared:deviceInfo.keysDecrypted': ['storeKey'],
  'shared:deviceInfo.orphan': ['banks', 'storeKey'],
  'shared:deviceInfo.orphanIsTarget': ['bank'],
} as const satisfies NameParamTable;

/** Whether `key` (`namespace:key`) names a bank or a key, so a translation may give it case forms (`NameKey`). */
export function isNameKey(key: string): boolean {
  return /^(?:common:bank|core:keyName)\./.test(key);
}

/** The name params of a page key, for the parity test: none for a key not listed. */
export function nameParamsOf(key: string): readonly string[] {
  return (NAME_PARAMS as Readonly<Record<string, readonly string[]>>)[key] ?? [];
}
