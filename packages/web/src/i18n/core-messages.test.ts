/**
 * The page's `core` templates say what @seek-fw/core says, word for word.
 *
 * Core gives the page `{ code, params, text }` (packages/core/src/message.ts);
 * the page renders `core:<code>` from locales/en/core.ts (lib/core-text.ts).
 * For representative inputs of every code, the English render must equal
 * core's `text`, nested messages included. Every template must be reached by
 * one of the samples, and every code a sample makes must have a template, so
 * a drift between core and the dictionary fails here.
 *
 * A new core code: add its template to locales/en/core.ts and a sample here.
 */

import {
  MODERN_BOOT,
  bootedReportMessage,
  lastStartReportMessage,
  nextStartReportMessage,
  recoveryTargetVerdictMessage,
  upgradeTargetBootedWarning,
  upgradeWhileRecoveryWarning,
  BOOT_UNNAMED_RISK,
  FF_BOOT_UNTESTED_MESSAGE,
  FF_STAGED_FORM_NOTE,
  NO_STAGING_FORM_WARNING,
  RAW_AS_GIVEN_WARNING,
  RECOVERY_ACK_WARNING,
  RECOVERY_FALLBACK_RISK,
  REENCRYPTS_NOTE,
  STAGE_KEY_UNCHECKED_WARNING,
  bootloaderRejectsWarning,
  ffBuildUnknownWarning,
  ffOtherVersionWarning,
  ffRunsFastNote,
  ffRunsSlowWarning,
  ffUntestedWarning,
  rekeyRiskWarning,
  riskAckWarning,
  BANK_NOT_READ_VERDICT,
  BOOTED_NOW_MESSAGE,
  CFG0_NOT_READ,
  CHECK_KEY_UNNAMED_VERDICT_MESSAGE,
  FF_VENDOR_STAGED_MESSAGE,
  FF_VENDOR_STORED_MESSAGE,
  NOT_BOOTED_MESSAGE,
  STAGED_UNDER_IMAGE_BLOCK_0_MESSAGE,
  backupPlanMessage,
  bankParam,
  bootWordRuleMessage,
  bootsNowMessage,
  copySourceRefusalMessage,
  derivedKeyLineMessage,
  fpsBootWarningOf,
  restoreReadBackMessage,
  selectLockedBoot,
  stagingDetailMessage,
  storedUnderCheckKeyMessage,
  unknownBootabilityWhyMessage,
  type CoreMessage,
  type CoreParam,
  type DeviceState,
  type PlanStaging,
  type SlotKey,
  type SlotView,
  type SlotsReport,
} from '@seek-fw/core';
import { beforeAll, describe, expect, it } from 'vitest';
import { tEnglish, type Translate } from '@/i18n';
import { en } from '@/i18n/locales/en';
import { coreText, coreTexts } from '@/lib/core-text';
import { fakeDeviceState } from '@/test-fixtures';
import { deviceState2016, slotEntry, slotReport, slotReport2016 } from '@/test-slots';

/** Every message in `message`, nested ones included. */
function walk(message: CoreMessage, into: CoreMessage[]): void {
  into.push(message);
  const visit = (param: CoreParam): void => {
    if (typeof param !== 'object') return;
    if ('text' in param) walk(param, into);
    else if ('capital' in param) visit(param.capital);
    else if ('list' in param) param.list.forEach(visit);
  };
  Object.values(message.params).forEach(visit);
}

const KEYS: readonly SlotKey[] = ['a', 'b', 'r'];
const STAGINGS: readonly PlanStaging[] = [
  'key-a-ciphertext',
  'slot-keystream-ciphertext',
  'plain',
  'key-a-keystream',
  'verbatim',
];

/** A report whose banks hold distinct decrypted images, so `heldBy` can tell them apart. */
function distinctPlains(report: SlotsReport): SlotsReport {
  return {
    ...report,
    slots: report.slots.map((view, index): SlotView => ({
      ...view,
      state: view.state === null ? null : { ...view.state, plain: new Uint8Array([index]) },
    })),
  };
}

function withView(report: SlotsReport, key: SlotKey, patch: Partial<SlotView>): SlotsReport {
  return {
    ...report,
    slots: report.slots.map((view) => (view.entry.key === key ? { ...view, ...patch } : view)),
  };
}

function samples(base: DeviceState): CoreMessage[] {
  const out: CoreMessage[] = [];
  const add = (message: CoreMessage | null | undefined): void => {
    if (message !== null && message !== undefined) out.push(message);
  };

  /* boot */
  for (const word of [0, 1, 2, 0xffffffff]) add(bootWordRuleMessage(word));
  add(selectLockedBoot(0, { a: true, b: true, r: true }).whyMessage);
  add(selectLockedBoot(0, { a: false, b: true, r: true }).whyMessage);
  add(selectLockedBoot(0, { a: false, b: false, r: true }).whyMessage);
  add(selectLockedBoot(2, { a: false, b: false, r: false }).whyMessage);
  add(selectLockedBoot(0x10, { a: null, b: true, r: true }).whyMessage);
  add(selectLockedBoot(0, { a: false, b: null, r: true }, BANK_NOT_READ_VERDICT).whyMessage);
  add(
    selectLockedBoot(1, { a: true, b: null, r: true }, CHECK_KEY_UNNAMED_VERDICT_MESSAGE)
      .whyMessage,
  );
  add(CFG0_NOT_READ);
  add(bootsNowMessage(bankParam('r')));
  add(bootsNowMessage('Slot B'));
  add(BOOTED_NOW_MESSAGE);
  add(NOT_BOOTED_MESSAGE);
  add(unknownBootabilityWhyMessage({ checkKey: null }));
  add(unknownBootabilityWhyMessage({ checkKey: base.checkKey ?? ({} as never) }));

  /* fpsBoot: a 2016 read boots slot A */
  const report2016 = distinctPlains(slotReport2016(base));
  const held = (indexes: readonly number[]) => (plain: Uint8Array | null) =>
    plain !== null && indexes.includes(plain[0] ?? -1) ? { hz: 32, what: 'test' } : null;
  for (const options of [
    { target: 'b' as const, heldBy: held([]), patchBlock: () => null },
    { heldBy: held([1]), patchBlock: () => 'the build has no patch site' },
    { heldBy: held([1, 2]), patchBlock: () => null },
    { target: 'r' as const, heldBy: held([1]), patchBlock: () => null },
  ]) {
    const warning = fpsBootWarningOf(report2016, options);
    expect(warning?.messages).toBeDefined();
    warning?.messages?.forEach(add);
  }

  /* backup */
  const report = slotReport(base, 'b', ['r']);
  add(backupPlanMessage(report, ['a'], { kind: 'fps-patch' }));
  add(backupPlanMessage(report, KEYS, { kind: 'fps-patch-every-bank' }));
  add(
    backupPlanMessage(
      withView(withView(report, 'a', { entry: slotEntry('a', { name: 'Main' }) }), 'r', {
        state: report.slots[0]?.state ? { ...report.slots[0].state, plain: null } : null,
        content: 'image',
      }),
      ['a', 'r'],
      { kind: 'copy', from: 'a' },
    ),
  );
  const unsupported = withView(report, 'a', {
    entry: slotEntry('a', { dump: { supported: false, reason: 'no window reaches it' } }),
  });
  add(backupPlanMessage(unsupported, ['a'], { kind: 'fps-patch' }));
  add(
    backupPlanMessage({ ...report, slots: report.slots.slice(1) }, ['a', 'b'], {
      kind: 'fps-patch',
    }),
  );

  /* staging and keys */
  STAGINGS.forEach((staging) => {
    add(stagingDetailMessage(staging));
  });
  add(derivedKeyLineMessage({ key: 'Key A', holds: 'Key A' }, bankParam('a')));
  add(derivedKeyLineMessage({ key: 'Key B', holds: 'per-device key' }, 'slot B'));
  add(FF_VENDOR_STAGED_MESSAGE);
  add(FF_VENDOR_STORED_MESSAGE);
  add(STAGED_UNDER_IMAGE_BLOCK_0_MESSAGE);
  add(storedUnderCheckKeyMessage({ atRest: null }));
  add(storedUnderCheckKeyMessage({ atRest: { name: 'Key B', key: new Uint8Array(16) } }));

  /* copy */
  add(copySourceRefusalMessage(report, 'b'));
  add(copySourceRefusalMessage(withView(report, 'b', { unreadReason: null }), 'b'));
  add(copySourceRefusalMessage(report, 'r'));
  add(copySourceRefusalMessage(withView(report, 'a', { content: 'foreign' }), 'a'));
  add(
    copySourceRefusalMessage(
      withView(report, 'a', {
        state: report.slots[0]?.state ? { ...report.slots[0].state, plain: null } : null,
      }),
      'a',
    ),
  );
  add(copySourceRefusalMessage({ ...report, slots: report.slots.slice(1) }, 'a'));

  /* restore */
  add(restoreReadBackMessage({ compared: false } as never, bankParam('a', 'name')));
  add(restoreReadBackMessage({ compared: true, equal: true } as never, bankParam('r', 'name')));
  add(
    restoreReadBackMessage(
      { compared: true, equal: false, differing: 12, firstDiffering: 0x1f0 },
      'Slot B',
    ),
  );

  /* write plan */
  add(FF_BOOT_UNTESTED_MESSAGE);
  add(ffOtherVersionWarning());
  add(ffUntestedWarning());
  add(ffRunsFastNote('its answers name the 16 Hz FF build'));
  add(ffRunsSlowWarning('its answers name the 8 Hz build', true));
  add(ffRunsSlowWarning('its answers name the 8 Hz build', false));
  add(ffBuildUnknownWarning('its answers name no build', false));
  for (const message of [
    RAW_AS_GIVEN_WARNING,
    FF_STAGED_FORM_NOTE,
    NO_STAGING_FORM_WARNING,
    REENCRYPTS_NOTE,
    STAGE_KEY_UNCHECKED_WARNING,
    RECOVERY_ACK_WARNING,
    BOOT_UNNAMED_RISK,
    RECOVERY_FALLBACK_RISK,
  ]) {
    add(message);
  }
  add(bootloaderRejectsWarning('its word sum is not 0'));
  add(rekeyRiskWarning(bankParam('b', 'name')));
  add(riskAckWarning(bootsNowMessage(bankParam('a', 'name'))));

  /* the device panel */
  for (const word of [0, 1, 2]) add(MODERN_BOOT.describeCfg0Message?.(word));
  add(nextStartReportMessage(deviceState2016(base), (key) => bankParam(key, 'name')));
  add(nextStartReportMessage(deviceState2016(base, { checkKeyNamed: false }), () => 'x'));
  const name = bankParam('a', 'name');
  add(upgradeTargetBootedWarning(name));
  const slot = (fields: object) =>
    ({ present: true, blank: false, sha256: 'aa', ...fields }) as never;
  for (const target of [
    undefined,
    slot({ present: false }),
    slot({ blank: true }),
    slot({ bootability: 'bootable' }),
    slot({ bootability: 'unknown' }),
    slot({ bootability: 'not-bootable' }),
  ]) {
    add(upgradeWhileRecoveryWarning(name, recoveryTargetVerdictMessage(target, slot({}), name)));
  }
  add(recoveryTargetVerdictMessage(slot({ bootability: 'bootable' }), slot({ sha256: 'bb' }), 'B'));

  /* the Info tab's report rows */
  const state2016 = deviceState2016(base);
  add(bootedReportMessage(state2016, (key) => bankParam(key, 'name')));
  add(bootedReportMessage({ ...state2016, activeSlotWord: null }, () => 'Main'));
  add(lastStartReportMessage(state2016));
  add(lastStartReportMessage({ ...state2016, activeSlotWord: null }));
  add(lastStartReportMessage({ ...state2016, activeSlotWord: 7 }));

  const all: CoreMessage[] = [];
  out.forEach((message) => {
    walk(message, all);
  });
  return all;
}

describe('the core namespace', () => {
  let all: CoreMessage[] = [];
  beforeAll(async () => {
    all = samples(await fakeDeviceState());
  });

  it('renders every sample in English exactly as core says it', () => {
    for (const message of all) {
      expect({ code: message.code, text: coreText(message, tEnglish) }).toEqual({
        code: message.code,
        text: message.text,
      });
    }
  });

  it('has a template for every code core gives, and a sample for every template', () => {
    const produced = new Set(all.map((message) => message.code));
    const templates = new Set(Object.keys(en.core));
    /* Not a message: the unlock note is a plain constant (locales.test.ts pins it). */
    templates.delete('unlock.powerCycleNote');
    expect([...produced].filter((code) => !templates.has(code))).toEqual([]);
    expect([...templates].filter((code) => !produced.has(code))).toEqual([]);
  });
});

describe('coreText', () => {
  /** A translate that shows the key and params it was given. */
  const shown = ((key: string, params?: Readonly<Record<string, string | number>>) =>
    `${key}(${Object.entries(params ?? {})
      .map(([name, value]) => `${name}=${String(value)}`)
      .join(',')})`) as unknown as Translate;

  it('translates the message and each param with the translate it is given', () => {
    expect(coreText(bootsNowMessage(bankParam('r')), shown)).toBe(
      'core:boot.bootsNow(bank=common:bank.recoveryInSentence(letter=R))',
    );
    expect(
      coreText(restoreReadBackMessage({ compared: false } as never, bankParam('a', 'name')), shown),
    ).toBe('core:restore.readBack.notCompared(bank=common:bank.slot(letter=A))');
  });

  it('shows a plain string, an unknown code and nothing as they are', () => {
    expect(coreText('stored English', shown)).toBe('stored English');
    expect(coreText({ code: 'no.such.code', params: {}, text: 'core English' }, shown)).toBe(
      'core English',
    );
    expect(coreText(null, shown)).toBe('');
    expect(coreTexts(undefined, ['a', 'b'], shown)).toEqual(['a', 'b']);
  });
});
