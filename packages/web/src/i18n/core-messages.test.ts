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
  BOOT_UNNAMED_REFUSAL,
  FF_VENDOR_EVIDENCE,
  KEY_NAMES,
  KEY_TABLE_REFUSAL,
  KEY_TABLE_SOURCE,
  LINE_2016_EVIDENCE,
  NOT_DERIVED_REFUSAL,
  PLAIN_CHAIN_EVIDENCE,
  acceptanceSumRefusal,
  applicationEvidence,
  applicationPairSource,
  bootedKeyEvidence,
  cameraRefusalMessage,
  checkKeyEvidence,
  deriveWriteKeys,
  keyNameParam,
  keyNotInTableRefusal,
  masksEvidence,
  noApplicationPairRefusal,
  noBootKeyRefusal,
  notDecryptedRefusal,
  otherBankEvidence,
  otherFamilyRefusal,
  storeEvidence,
  storeKeyEvidence,
  uploadCheckedRefusal,
  whiteningRefusal,
  writeBannerMessage,
  identityGate,
  identityRefusal,
  choosePreserveBanks,
  readStatusMessage,
  WRITTEN_STATUS,
  errorCoreMessage,
  NO_READ_WINDOW_NOTE,
  capabilityNoteMessage,
  capabilityNotes,
  fpsPlanOfBank,
  fpsStoppedMessage,
  VERIFY_OFF_NOTE,
  bootloaderFailureMessages,
  compareReadBack,
  decryptedNote,
  imageBuildWarningMessage,
  keyCheckMessage,
  keyConfidenceMessage,
  readBackFailedNote,
  readBackNote,
  runningApplicationOf,
  runningVerdictOf,
  stagingPhraseMessage,
  writtenCommittedNote,
  SeekError,
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
import { coreText, coreTexts, recordedCoreText } from '@/lib/core-text';
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

  /* running: which 1.3.0.8 build runs */
  add(runningApplicationOf({ ...state2016, version: null }).whyMessage);
  add(runningApplicationOf({ ...state2016, version: '1.3.0.0' }).whyMessage);
  add(runningApplicationOf({ ...state2016, version: '1.3.0.8', bankVerdicts: null }).whyMessage);
  add(
    runningApplicationOf({
      ...state2016,
      version: '1.3.0.8',
      bankVerdicts: { a: 1, b: 0, r: 1 },
      byKey: new Map(),
    }).whyMessage,
  );
  const answers = (a: 0 | 1, b: 0 | 1, r: 0 | 1) => ({ a, b, r });
  for (const [plain, ff] of [
    [answers(1, 0, 1), answers(0, 0, 0)],
    [answers(0, 0, 0), answers(1, 0, 1)],
    [answers(1, 0, 1), answers(1, 0, 1)],
    [answers(0, 0, 0), answers(1, 1, 1)],
  ] as const) {
    add(runningVerdictOf(answers(1, 0, 1), { plain, ff }).why);
  }
  add(
    ffRunsFastNote(
      runningVerdictOf(answers(1, 0, 1), { plain: answers(0, 0, 0), ff: answers(1, 0, 1) }).why,
    ),
  );

  /* imageBuild */
  for (const kind of [
    'noVersion',
    'otherVersion',
    'otherVersionTaken',
    'otherVersionUnchecked',
    'otherBuild',
    'runningUnknown',
  ] as const) {
    add(imageBuildWarningMessage(kind, '1.2.0.0', '1.3.0.0'));
  }

  /* bootFail: a raw payload's failed bootloader checks */
  const cipher = base.profile.cipher;
  add(
    bootloaderRejectsWarning(
      bootloaderFailureMessages('plain', new Uint8Array(16), cipher, { keyA: null })[0] ?? 'x',
    ),
  );
  const payload = new Uint8Array(0x400);
  new DataView(payload.buffer).setUint32(0x204, 0x300, true);
  bootloaderFailureMessages('plain', payload, cipher, { keyA: null }).forEach(add);
  const big = new Uint8Array(0x100000);
  new DataView(big.buffer).setUint32(0x204, 0x100000, true);
  bootloaderFailureMessages('plain', big, cipher, { keyA: null }).forEach(add);
  new DataView(payload.buffer).setUint32(0x204, 0x800, true);
  bootloaderFailureMessages('plain', payload, cipher, { keyA: null }).forEach(add);
  new DataView(payload.buffer).setUint32(0x204, 0x300, true);
  bootloaderFailureMessages('key-a-ciphertext', payload, cipher, {
    keyA: new Uint8Array(16),
  }).forEach(add);
  new DataView(payload.buffer).setUint32(0x204, 0x200, true);
  bootloaderFailureMessages('key-a-ciphertext', payload, cipher, { keyA: null }).forEach(add);

  const footed = new Uint8Array(0x40000);
  new DataView(footed.buffer).setUint32(0x204, 0x300, true);
  bootloaderFailureMessages('key-a-ciphertext', footed, cipher, { keyA: null }).forEach(add);

  /* keyCheck */
  add(keyConfidenceMessage('VERIFIED(family)'));
  add(keyCheckMessage('VERIFIED(family)', 0));
  add(keyCheckMessage('VERIFIED(structural)', 0x1234abcd));
  add(keyCheckMessage('UNVERIFIED', 1));

  /* written: a finished write's notes */
  STAGINGS.forEach((staging) => {
    add(stagingPhraseMessage(staging));
  });
  add(
    writtenCommittedNote({
      size: '65536',
      name: bankParam('b', 'name'),
      address: '0x00020000',
      staged: stagingPhraseMessage('plain'),
      status: '0x0',
    }),
  );
  add(NO_READ_WINDOW_NOTE);
  add(VERIFY_OFF_NOTE);
  add(readBackFailedNote(new Error('transfer failed')));
  add(
    readBackFailedNote(
      new SeekError('slots/refused', bootsNowMessage(bankParam('a')).text, {
        coreMessage: bootsNowMessage(bankParam('a')),
      }),
    ),
  );
  add(readBackNote('65536', 'ab'.repeat(32)));
  const bytes = (length: number, fill = 0) => new Uint8Array(length).fill(fill);
  const verdicts = [
    compareReadBack(bytes(8), { stored: bytes(4), plain: null }, cipher, 'plain'),
    compareReadBack(bytes(4), { stored: bytes(4), plain: null }, cipher, 'plain'),
    compareReadBack(
      bytes(4),
      { stored: bytes(4), plain: null, storedAs: 'key-b-ciphertext' },
      cipher,
      'raw',
    ),
    compareReadBack(
      bytes(4, 1),
      { stored: bytes(4), plain: null, storedAs: 'key-b-ciphertext' },
      cipher,
      'raw',
    ),
    compareReadBack(bytes(0x400), { stored: null, plain: bytes(0x300) }, cipher, 'plain'),
    compareReadBack(bytes(4), { stored: null, plain: null }, cipher, 'raw'),
    compareReadBack(bytes(4), { stored: null, plain: null }, cipher, 'plain'),
  ];
  const withHeader = (length: number, size: number) => {
    const image = bytes(size);
    new DataView(image.buffer).setUint32(0x200, 0xa1b2c3d4, true);
    new DataView(image.buffer).setUint32(0x204, length, true);
    return image;
  };
  verdicts.push(
    compareReadBack(
      withHeader(0x300, 0x400),
      { stored: null, plain: bytes(0x200) },
      cipher,
      'plain',
    ),
  );
  verdicts.push(
    compareReadBack(
      withHeader(0x800, 0x400),
      { stored: null, plain: bytes(0x800) },
      cipher,
      'plain',
    ),
  );
  verdicts.forEach((verdict) => {
    verdict.noteMessages.forEach(add);
  });
  add(decryptedNote(null, { length: '0x300', check: keyCheckMessage('VERIFIED(family)', 0) }));
  add(decryptedNote('0x210', { length: '0x300', check: keyCheckMessage('UNVERIFIED', 5) }));

  /* keys: a write's key derivation, its evidence and refusals */
  const message = (said: CoreMessage | string | null): void => {
    if (said !== null && typeof said !== 'string') add(said);
  };
  KEY_NAMES.forEach((name) => {
    message(keyNameParam(name));
  });
  add(PLAIN_CHAIN_EVIDENCE);
  FF_VENDOR_EVIDENCE.forEach(add);
  add(LINE_2016_EVIDENCE);
  add(checkKeyEvidence(null, null));
  add(checkKeyEvidence(null, 'the active-slot word could not be read'));
  add(checkKeyEvidence({ name: 'key block 1', hex: 'aa', from: null, inferred: false }, null));
  add(checkKeyEvidence({ name: 'key block 1', hex: 'aa', from: 'b', inferred: true }, null));
  add(checkKeyEvidence({ name: 'Key B', hex: 'aa', from: 'r', inferred: false }, null));
  add(
    applicationEvidence({
      bank: 'a',
      firmware: '4.9.1.15',
      keyA: 'aa',
      keyAAt: '0x100',
      source: KEY_TABLE_SOURCE,
      keyB: null,
    }),
  );
  add(
    applicationEvidence({
      bank: 'b',
      firmware: '?',
      keyA: 'aa',
      keyAAt: '0x100',
      source: applicationPairSource('4.9.1.15'),
      keyB: { hex: 'bb', at: '0x110' },
    }),
  );
  add(storeEvidence(true));
  add(storeEvidence(false));
  add(storeKeyEvidence({ key: 'per-device key', hex: 'cc', bank: 'a', held: 'Key A' }));
  add(bootedKeyEvidence({ bank: 'b', key: 'Key A', hex: 'dd' }));
  add(masksEvidence(['Key B', 'the per-device key', "the application's Key A"], 'Key B'));
  add(otherBankEvidence('r', null, 'Key B'));
  add(otherBankEvidence('b', "the application's Key B", 'per-device key'));
  add(BOOT_UNNAMED_REFUSAL);
  add(NOT_DERIVED_REFUSAL);
  add(notDecryptedRefusal('a'));
  add(noBootKeyRefusal('b'));
  add(keyNotInTableRefusal('a', 'Key B'));
  add(noApplicationPairRefusal('a', '4.9.1.15', null));
  add(noApplicationPairRefusal('a', '?', { keyA: 2, keyB: 0 }));
  add(uploadCheckedRefusal({ bank: 'a', firmware: '4.18.2.0', key: 'Key B', hex: 'ee' }));
  add(
    cameraRefusalMessage([
      acceptanceSumRefusal('Mosaic', '0x00000000'),
      KEY_TABLE_REFUSAL,
      whiteningRefusal('0x1', 'Mosaic', '0x2'),
      otherFamilyRefusal('Compact', 'Mosaic', ['a reason', 'another']),
    ]),
  );
  add(cameraRefusalMessage(['an old reason']));
  (deriveWriteKeys(base).evidenceMessages ?? []).forEach(add);
  message(
    writeBannerMessage({
      ...base,
      bankWriteRefusals: [KEY_TABLE_REFUSAL.text],
      bankWriteRefusalMessages: [KEY_TABLE_REFUSAL],
    }),
  );

  /* identity: the arming gate's refusals */
  for (const version of [null, '0.3.0.1']) {
    const gate = identityGate({ version, buildString: null, note: 'no answer' });
    if (!gate.permitsArming) {
      if (gate.reasonMessage !== undefined) add(gate.reasonMessage);
      for (const operation of ['dump', 'dump all selectors', 'read the device info'] as const) {
        add(identityRefusal(gate, version, operation, 'modern-4x').coreMessage);
      }
    }
  }

  /* preserve: choosing the banks */
  const refusalOf = (run: () => unknown): void => {
    try {
      run();
    } catch (error) {
      add(errorCoreMessage(error));
    }
  };
  refusalOf(() => choosePreserveBanks({ steps: {} } as never, {} as never));
  refusalOf(() =>
    choosePreserveBanks(
      { steps: { backup: { status: 'done' }, commit: {} }, targets: ['a', 'r'] } as never,
      {} as never,
    ),
  );
  refusalOf(() =>
    choosePreserveBanks(
      { steps: { backup: { status: 'done' }, commit: {} } } as never,
      {} as never,
    ),
  );

  /* status lines */
  add(WRITTEN_STATUS);
  add(readStatusMessage(true, 3, 3));
  add(readStatusMessage(false, 0, 3));

  /* notes: every capability note */
  capabilityNotes().forEach((note) => {
    message(capabilityNoteMessage(note));
  });

  /* fps: a bank's plan refused, a patch of every bank stopped */
  for (const fpsReport of [
    { ...report, slots: report.slots.slice(1) },
    withView(report, 'a', {
      entry: slotEntry('a', { flashPlain: { supported: false, reason: 'no window' } }),
    }),
    withView(report, 'a', { content: 'empty' }),
    withView(report, 'a', {
      state: report.slots[0]?.state ? { ...report.slots[0].state, plain: null } : null,
    }),
  ]) {
    const plan = fpsPlanOfBank(fpsReport, 'a');
    if (plan.status === 'refused' && plan.reasonMessage !== undefined) add(plan.reasonMessage);
  }
  add(fpsStoppedMessage(bankParam('b', 'name')));
  add(fpsStoppedMessage('Main', new Error('transfer failed')));
  add(
    fpsStoppedMessage(
      bankParam('r', 'name'),
      new SeekError('slots/refused', NOT_DERIVED_REFUSAL.text, {
        coreMessage: NOT_DERIVED_REFUSAL,
      }),
    ),
  );

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

describe('recordedCoreText (a saved run file)', () => {
  it('shows the recorded message, or the stored English of an old or damaged file', () => {
    const message = bootsNowMessage(bankParam('a', 'name'));
    expect(recordedCoreText(message, 'old English')).toBe(message.text);
    expect(recordedCoreText(undefined, 'old English')).toBe('old English');
    expect(recordedCoreText({ code: 'boot.bootsNow' }, 'old English')).toBe('old English');
    expect(
      recordedCoreText({ code: 'boot.bootsNow', params: { bank: {} }, text: 'x' }, 'old English'),
    ).toBe('old English');
    expect(recordedCoreText(undefined, undefined)).toBeUndefined();
  });
});
