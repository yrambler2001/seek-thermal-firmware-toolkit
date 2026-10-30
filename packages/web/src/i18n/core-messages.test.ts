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
  listParam,
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
  PROGRESS_WORDS,
  SLOT_ERROR_WORDS,
  usbSpeedWords,
  keyPairParam,
  WRITTEN_STATUS,
  errorCoreMessage,
  compareWordMessage,
  compareWords,
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
  SLOT_WRITE_REFUSAL,
  joinSlotViews,
  supportReasonMessage,
  supportReasons,
  PRESERVE_BANK_REFUSAL,
  PRESERVE_UNPATCHED_START_NEXT_MESSAGE,
  PRESERVE_UNPATCHED_START_STOP_MESSAGE,
  bankChoiceWritesMessage,
  bankRecordMessage,
  drainCapabilityMessage,
  inferredBootWhyMessage,
  lastStartMessage,
  nextStartMessage,
  patchSiteMessage,
  preserveBootFactsOf,
  preserveBuildParam,
  preserveChoiceOf,
  preserveDoneMessages,
  preserveOtherVersionMessage,
  preserveStepResultMessage,
  restoreFormMessage,
  stagedFormMessage,
  type PreserveBankChoice,
  type PreserveBankRecord,
  type PreserveBootFacts,
  type PreserveChoiceFacts,
  type PreserveRunState,
  READ_REASON,
  RECOVERY_ONLY_ROUTE_NOTE,
  routeNoteMessage,
  SLOT_FILE_WORDS,
  SUPPORT_REASON,
  acceptsDescriptionMessage,
  bootableDescriptionMessage,
  buildSlotPlan,
  capabilityRefusalMessage,
  checkKeyOf,
  detectedReportMessage,
  keyReportMessageRows,
  listProfiles,
  spentReaderDiagnosisMessage,
  staleDescriptorMessage,
  stagedClauseMessage,
  FPS_TABLE_REASON,
  VERSION_NOTE,
  COPY_WORDS,
  RESTORE_WORDS,
  PRESERVE_FAIL,
  spentReaderRefusalMessage,
  spentReaderDeriveMessage,
  outsideLineRefusalMessage,
  preWideningRefusalMessage,
  frameRateImageRefusalMessage,
  frameRateImageWordsMessage,
  unknownImageRefusalMessage,
  unknownImageWordsMessage,
  PRESERVE_DERIVE_WORDS,
  PRESERVE_GATE,
  COPY_REFUSAL,
  RESTORE_REFUSAL,
  SLOT_IMAGE_REFUSAL,
  SLOT_PLAN_REFUSAL,
  commitRefusal,
  stagingStatusMessage,
  COMPACT_2016_EVIDENCE,
  EARLY_COMPACT_EVIDENCE,
  GENERIC_EVIDENCE,
  LEGACY_EVIDENCE,
  MODERN_EVIDENCE,
  VERSION_SAID,
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
    { heldBy: held([1]), patchBlock: () => FPS_TABLE_REASON.notInTable },
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
  add(derivedKeyLineMessage({ key: 'Key A', holds: 'Key A' }, null));
  add(derivedKeyLineMessage({ key: 'Key B', holds: 'per-device key' }, null));
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
      otherFamilyRefusal('Compact', 'Mosaic', ['a reason', MODERN_EVIDENCE.none]),
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

  /* identity: the arming gate's refusals, and why the version read gave no version */
  const usbError = new Error('LIBUSB_ERROR_PIPE');
  for (const note of [
    VERSION_NOTE.startup(usbError, 6),
    VERSION_NOTE.neverTwice(3),
    VERSION_NOTE.noAnswer(usbError),
    VERSION_NOTE.noAnswer(
      new SeekError('device/window', SLOT_FILE_WORDS.wrongSize(100).text, {
        coreMessage: SLOT_FILE_WORDS.wrongSize(100),
      }),
    ),
    VERSION_NOTE.noAnswerSome(usbError, 1, 3),
    VERSION_NOTE.tooShort(2, []),
    VERSION_NOTE.tooShort(2, [VERSION_NOTE.otherRecord('4.8.2.1'), VERSION_NOTE.afterStartup(2)]),
  ]) {
    const gate = identityGate({
      version: null,
      buildString: null,
      note: note.text,
      noteMessage: note,
    });
    if (!gate.permitsArming) add(gate.reasonMessage);
  }
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
  /* status lines under a run panel's bar */
  add(PROGRESS_WORDS.backupBlock(0x14010000));
  add(PROGRESS_WORDS.backupDone());
  add(PROGRESS_WORDS.checkBlock(0x14010000));
  add(PROGRESS_WORDS.checkDone());
  add(PROGRESS_WORDS.staged(PROGRESS_WORDS.writingBank('a'), 0x1000, 0xc000));
  add(PROGRESS_WORDS.staged(PROGRESS_WORDS.restoringBank('r'), 0x1000, 0xc000));
  add(PROGRESS_WORDS.wholeFlash(0x40000, 0x400000));
  add(PROGRESS_WORDS.readWindow(0x14010000, 0x12, false));
  add(PROGRESS_WORDS.readWindow(0x14010000, 0x12, true));
  add(PROGRESS_WORDS.windowsRead(5, 6));
  add(PROGRESS_WORDS.readingBank('b', 'Slot B'));
  add(PROGRESS_WORDS.readingBank('b', 'Bank 2'));
  add(PROGRESS_WORDS.analysing());
  add(PROGRESS_WORDS.probeSelector(0x1f));
  add(PROGRESS_WORDS.selectorsArmed(40, 256, 12));
  add(PROGRESS_WORDS.recoveringKey('0x14050000'));
  add(SLOT_ERROR_WORDS.windowUnread('a', 'Slot A', 0x14050000, 0x31, new Error('transfer error')));
  add(SLOT_ERROR_WORDS.windowUnread('r', 'Bank 3', 0x14070000, 0x33, new Error('stall')));
  add(SLOT_ERROR_WORDS.refusedBuild('firmware 0.7.4.0 is older than 0.8.0.0', undefined));
  add(SLOT_ERROR_WORDS.backupNotSaved('seek_backup.zip', null));
  add(SLOT_ERROR_WORDS.backupNotSaved('seek_backup.zip', 'the download was blocked'));
  add(keyPairParam('the Compact PRO 1.0.3.x 9 Hz pair') as CoreMessage);
  add(keyPairParam('the Compact PRO 1.0.3.x FF pair') as CoreMessage);
  add(usbSpeedWords(2));
  add(usbSpeedWords(0));
  add(usbSpeedWords(42405));
  add(readStatusMessage(true, 3, 3));
  add(readStatusMessage(false, 0, 3));

  /* compare: the preview's table words */
  compareWords().forEach((word) => {
    message(compareWordMessage(word));
  });

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

  /* preserve: the boot facts, the bank table, the choices, the plan, the results */
  const unsettled = preserveBootFactsOf({
    cfgHead: new Uint8Array(32),
    activeSlotWord: 0,
    line: '2014',
    banks: {
      a: { key: 'a', bytes: new Uint8Array(0x400), holds: 'unsettled' },
      b: { key: 'b', bytes: new Uint8Array(0x400), holds: 'erased' },
      r: { key: 'r', bytes: new Uint8Array(0x400), holds: 'erased' },
    },
  });
  add(unsettled.whyMessage);
  add(unsettled.ruleMessage);
  const selected = selectLockedBoot(0, { a: true, b: true, r: true });
  add(inferredBootWhyMessage(selected.whyMessage, 'b'));
  const boot = (
    nextStart: SlotKey | null,
    entered: SlotKey | null = 'a',
    activeSlotWord: number | null = 0,
  ): PreserveBootFacts => ({
    cfgHex: '',
    word: 0,
    rule: 'x',
    activeSlotWord,
    entered,
    verdicts: { a: true, b: true, r: true },
    nextStart,
    why: selected.why,
    whyMessage: selected.whyMessage,
    checkKeyUnnamed: null,
  });
  add(lastStartMessage(boot('a')));
  add(lastStartMessage(boot('a', null, null)));
  add(lastStartMessage(boot('a', null, 7)));
  add(nextStartMessage(boot('b')));
  add(nextStartMessage(boot(null)));
  const erased = PRESERVE_BANK_REFUSAL.erased();
  const record = (key: SlotKey, fields: Partial<PreserveBankRecord> = {}): PreserveBankRecord => ({
    key,
    address: 0,
    mode: 7,
    holds: 'image',
    refused: null,
    ...fields,
  });
  const refusedRecord = (key: SlotKey, message: CoreMessage): PreserveBankRecord =>
    record(key, { refused: message.text, refusedMessage: message });
  for (const message of [
    PRESERVE_BANK_REFUSAL.secondRead(new Error('transfer failed')),
    PRESERVE_BANK_REFUSAL.readsDisagree('aa', 'bb'),
    erased,
    PRESERVE_BANK_REFUSAL.watchdogMark(0x12345678),
    PRESERVE_BANK_REFUSAL.noHeader(),
    PRESERVE_BANK_REFUSAL.otherBuild('Compact 1.3.0.8 (16 Hz)', 'ff1308', 'Compact 1.3.0.0'),
    PRESERVE_BANK_REFUSAL.otherKey(),
  ]) {
    add(bankRecordMessage(refusedRecord('b', message)));
  }
  add(bankRecordMessage(record('a')));
  add(
    bankRecordMessage(
      record('a', { buildLabel: 'Compact 1.0.3.0', patch: { diffCount: 9 } as never }),
    ),
  );
  add(
    bankRecordMessage(
      record('a', { imageDerivation: { id: 'x', label: 'the 16 Hz edit', balanceWord: 0 } }),
    ),
  );
  add(
    bankRecordMessage(
      record('a', {
        patch: { diffCount: 9 } as never,
        imageDerivation: { id: 'x', label: 'the 16 Hz edit', balanceWord: 0 },
      }),
    ),
  );
  const writable = { a: record('a'), b: record('b'), r: record('r') };
  const blocked = { ...writable, b: refusedRecord('b', erased) };
  const none = {
    a: record('a', { holds: 'erased' }),
    b: record('b', { holds: 'erased' }),
    r: record('r', { holds: 'erased' }),
  };
  const allRefused = {
    a: refusedRecord('a', erased),
    b: refusedRecord('b', erased),
    r: refusedRecord('r', erased),
  };
  const choices: [PreserveChoiceFacts, PreserveBankChoice][] = [
    [{}, 'all'],
    [{ boot: boot('a'), banks: blocked }, 'all'],
    [{ boot: boot('a'), banks: writable }, 'all'],
    [{ boot: boot('a'), banks: none }, 'all'],
    [{ boot: boot('a'), banks: writable }, 'next-start'],
    [{ boot: boot('b'), banks: blocked }, 'next-start'],
    [{ boot: boot(null), banks: writable }, 'next-start'],
    [{ boot: boot(null), banks: blocked }, 'next-start'],
    [{ boot: boot('a'), banks: writable }, 'b'],
    [{ boot: boot(null), banks: writable }, 'a'],
    [{ boot: boot('a'), banks: blocked }, 'b'],
  ];
  for (const [facts, choice] of choices) {
    const verdict = preserveChoiceOf(facts, choice);
    add(verdict.whatMessage);
    verdict.warningMessages?.forEach(add);
    message(bankChoiceWritesMessage(verdict));
  }
  refusalOf(() =>
    choosePreserveBanks(
      { steps: { backup: { status: 'done' } }, boot: boot('a'), banks: blocked } as never,
      'b',
    ),
  );
  message(preserveBuildParam({}));
  message(preserveBuildParam({ expectedVersion: '1.3.0.8' }));
  for (const form of ['plain', 'xor-ks0', 'xor-ks0-ksD'] as const) add(stagedFormMessage(form));
  for (const form of ['capture-verbatim', 'factory-staged', 'none'] as const) {
    add(restoreFormMessage(form));
  }
  add(drainCapabilityMessage({ wholePart: false } as never));
  add(drainCapabilityMessage({ wholePart: true, losslessReadUnit: 64 } as never));
  add(
    drainCapabilityMessage({
      wholePart: true,
      losslessReadUnit: 64,
      rotation: 1,
      modeTwoHazardSites: [],
    } as never),
  );
  for (const site of [
    'mov.w r3,#0x10000 -> #0x400000',
    'ldrh r1,[r0]',
    'ldrh r2,[r0]',
    'strh r3,[r0]',
    'strh r5,[r0]',
    'mode-2 guard',
    'mode-2 indirection',
    'arm-tail hook',
    'something else',
  ]) {
    add(patchSiteMessage(site));
  }
  const done = { status: 'done' as const };
  const run = (fields: object): PreserveRunState => ({ steps: {}, ...fields }) as never;
  const stopped = new SeekError('pipeline/refused', erased.text, { coreMessage: erased });
  for (const [state, step] of [
    [run({ steps: { drain: { status: 'failed' } }, drainEntered: 'b', targets: ['a'] }), 'drain'],
    [run({ steps: { patch: { status: 'failed' } } }), 'patch'],
    [
      run({ steps: { patch: { status: 'failed', error: erased.text, errorCode: erased } } }),
      'patch',
    ],
    [run({ steps: { backup: done }, banks: writable }), 'backup'],
    [run({ steps: { backup: done }, banks: blocked, boot: boot('a') }), 'backup'],
    [run({ steps: { backup: done }, banks: allRefused, boot: boot(null) }), 'backup'],
    [
      run({
        steps: { backup: done },
        banks: { a: record('a'), b: refusedRecord('b', erased), r: refusedRecord('r', erased) },
      }),
      'backup',
    ],
    [
      run({
        steps: { patch: done },
        banks: {
          a: record('a', { patch: { diffCount: 9 } as never }),
          b: record('b', { patch: { diffCount: 9 } as never }),
          r: refusedRecord('r', erased),
        },
      }),
      'patch',
    ],
    [run({ steps: { patch: done }, banks: allRefused }), 'patch'],
    [run({ steps: { commit: done }, targets: ['a'] }), 'commit'],
    [run({ steps: { commit: done }, targets: ['a', 'b'] }), 'commit'],
    [run({ steps: { drain: done } }), 'drain'],
    [run({ steps: { drain: done }, deliveredSha256: 'ab' }), 'drain'],
    [run({ steps: { drain: done }, deliveredSha256: 'ab', drainEntered: 'b' }), 'drain'],
    [run({ steps: { restore: done }, targets: ['a'] }), 'restore'],
    [run({ steps: { restore: done }, targets: ['a', 'r'], stagedForm: 'xor-ks0' }), 'restore'],
    [run({ steps: { verify: done } }), 'verify'],
    [
      run({ steps: { verify: done }, verify: { windowsRead: 9, diffBytes: 0, badWindows: [] } }),
      'verify',
    ],
    [
      run({ steps: { verify: done }, verify: { windowsRead: 9, diffBytes: 4, badWindows: [] } }),
      'verify',
    ],
    [
      run({ steps: { verify: done }, verify: { windowsRead: 9, diffBytes: 4, badWindows: [1] } }),
      'verify',
    ],
  ] as const) {
    add(preserveStepResultMessage(state, step));
  }
  add(errorCoreMessage(stopped));
  add(PRESERVE_UNPATCHED_START_STOP_MESSAGE);
  add(PRESERVE_UNPATCHED_START_NEXT_MESSAGE);
  for (const state of [
    run({ deliveredSha256: 'ab' }),
    run({}),
    run({ verify: { windowsRead: 9, diffBytes: 0, badWindows: [] } }),
  ]) {
    const messages = preserveDoneMessages(state);
    add(messages.title);
    add(messages.detail);
  }
  add(preserveOtherVersionMessage('1.3.0.0', '1.3.0.8'));

  /* support: the constant reasons */
  supportReasons().forEach((reason) => {
    message(supportReasonMessage(reason));
  });

  /* slots: why a bank was not read */
  const views = joinSlotViews(
    {
      ...report.plan,
      slots: report.plan.slots.map((entry) => ({
        ...entry,
        read: entry.key === 'a' ? null : ({ subcmd: 1, address: 0 } as never),
      })),
    },
    { byKey: new Map([['b', { unread: true, reason: null }]]), boot: null } as never,
  );
  views.forEach((view) => {
    message(view.unreadReasonMessage ?? null);
  });

  /* slots: a write's refusals */
  const entry = report.slots[0]?.entry ?? slotEntry('a');
  add(SLOT_WRITE_REFUSAL.nothingWritten(KEY_TABLE_REFUSAL, KEY_TABLE_REFUSAL.text));
  add(SLOT_WRITE_REFUSAL.versionUnknown());
  add(SLOT_WRITE_REFUSAL.versionUnknownWrite());
  add(SLOT_WRITE_REFUSAL.emptyInput());
  add(SLOT_WRITE_REFUSAL.emptyNotWritable(entry, supportReasons()[1] ?? 'x'));
  add(SLOT_WRITE_REFUSAL.noRaw(entry, 'a reason the build gives'));
  add(SLOT_WRITE_REFUSAL.noPlain(entry, supportReasons()[0] ?? 'x'));
  add(SLOT_WRITE_REFUSAL.noStaging(entry));
  add(SLOT_WRITE_REFUSAL.rawTooLong(entry, 9, 0x40000));
  add(SLOT_WRITE_REFUSAL.imageTooLong(entry, 9, 0x40000));

  /* support: the build's refusals and a bank's, on every family; every family's refused operation */
  const refuses = { supported: false, reason: 'x' } as const;
  const [first] = listProfiles();
  if (first === undefined) throw new Error('no family is registered');
  const families = [
    ...listProfiles(),
    { ...first, id: 'custom' },
    {
      ...first,
      capabilities: {
        dump: refuses,
        allSelectors: refuses,
        decrypt: refuses,
        deviceInfo: refuses,
        flash: refuses,
      },
    },
  ];
  for (const profile of families) {
    for (const version of [null, 'v4', '0.7.0.7', '1.3.0.0', '1.5.0.0', '1.0.3.0', '4.8.2.1']) {
      const plan = buildSlotPlan(profile, version);
      for (const support of [
        plan.supportedBuild,
        ...plan.slots.flatMap((slot) => [slot.dump, slot.flashPlain, slot.emptyBank.writable]),
      ]) {
        if (!support.supported) message(supportReasonMessage(support));
      }
    }
    for (const op of ['dump', 'allSelectors', 'decrypt', 'deviceInfo', 'flash'] as const) {
      add(capabilityRefusalMessage(profile, op));
    }
  }
  add(SUPPORT_REASON.noArm('plain', 7, 0x10000));
  add(SUPPORT_REASON.noArm('token', 8, 0x10000));
  add(SUPPORT_REASON.windowElsewhere('b', 0x20000, 0x30000));
  add(SUPPORT_REASON.noDumpWindow('r', 0x40000));

  /* the read: why a bank holds no image or was not read, and why the check key was not named */
  add(READ_REASON.shortRead(12));
  add(READ_REASON.noParse());
  add(READ_REASON.noHeader(0xffffffff));
  add(READ_REASON.lengthOutOfRange(0x1234567));
  add(READ_REASON.stopped(4096, 65536));
  add(READ_REASON.notInPlan('modern', '4.8.2.1', 0x10000));
  add(READ_REASON.notInPlan('modern', null, 0x10000));
  add(spentReaderDiagnosisMessage());
  add(staleDescriptorMessage(new Uint8Array([0, 0, 0, 0x10, 0, 0, 0, 0x14])));
  for (const [activeSlotWord, cfg0] of [
    [null, 0],
    [9, 0],
    [0, null],
    [0, 0],
    [1, 0],
    [2, 0],
  ] as const) {
    const checkKey = checkKeyOf({
      cfg0,
      activeSlotWord,
      bootloaderVersion: '1.2.0.0',
      whiteningK: 0,
      slotOf: () => undefined,
    });
    add(checkKey.unnamedWhyMessage);
  }

  /* the Info tab's report: the key rows, the cells, the detected row, the staging clauses */
  const named2016 = deviceState2016(base);
  const unnamed2016 = deviceState2016(base, { checkKeyNamed: false });
  const unprogrammed = { ...base.storeKey, programmed: false };
  for (const state of [
    base,
    { ...base, keyTable: null },
    { ...base, keyTable: null, plainChain: true },
    { ...base, storeKey: unprogrammed, deviceKeySlot: null },
    { ...base, storeKey: unprogrammed, deviceKeySlot: new Uint8Array(16) },
    { ...base, storeKey: unprogrammed, deviceKeySlot: new Uint8Array(16), keyTable: null },
    {
      ...base,
      storeKey: unprogrammed,
      deviceKeySlot: new Uint8Array(16),
      keyTable: { keyA: new Uint8Array(16), keyB: new Uint8Array(16), offset: 0x1234 },
    },
    named2016,
    unnamed2016,
    { ...named2016, checkKey: { ...named2016.checkKey, pair: 'x', from: 'r', inferred: true } },
    { ...named2016, checkKey: { ...named2016.checkKey, from: 'a', inferred: false } },
    { ...named2016, checkKey: { ...named2016.checkKey, from: null } },
    { ...unnamed2016, checkKey: { ...unnamed2016.checkKey, unnamedWhy: null } },
  ] as DeviceState[]) {
    keyReportMessageRows(state).forEach(([label, value]) => {
      add(label);
      message(value);
    });
  }
  const cell = (fields: object) =>
    ({
      present: true,
      keyName: 'Key A',
      plain: null,
      accepts: true,
      bootable: true,
      bootability: 'bootable',
      ...fields,
    }) as never;
  for (const slot of [
    cell({}),
    cell({ accepts: false, bootable: false, bootability: 'not-bootable' }),
    cell({ keyName: null, plain: new Uint8Array(1) }),
    cell({ bootability: 'unknown' }),
    cell({ bootability: 'recovery-only' }),
  ]) {
    message(acceptsDescriptionMessage(slot));
    message(bootableDescriptionMessage(slot));
  }
  for (const ambiguous of [false, true]) {
    add(
      detectedReportMessage({
        best: { profile: { name: 'Compact PRO' }, score: 0.98 },
        ambiguous,
      } as never),
    );
  }
  for (const form of [
    'plain',
    'slot-keystream-ciphertext',
    'key-a-ciphertext',
    'ff-vendor',
  ] as const) {
    add(stagedClauseMessage(form));
  }

  /* preserve: a build that runs from recovery R only */
  add(PRESERVE_BANK_REFUSAL.recoveryOnly(RECOVERY_ONLY_ROUTE_NOTE));
  message(routeNoteMessage(RECOVERY_ONLY_ROUTE_NOTE));

  /* detection: what each family is, and each family's evidence */
  listProfiles().forEach((profile) => {
    expect(profile.summaryMessage).toBeDefined();
    add(profile.summaryMessage);
  });
  for (const said of Object.values(VERSION_SAID)) {
    add(MODERN_EVIDENCE.legacyVersion(said, '1.3.0.8'));
    add(EARLY_COMPACT_EVIDENCE.older(said, '0.7.0.7'));
    add(COMPACT_2016_EVIDENCE.proLine(said, '1.0.3.0'));
    add(COMPACT_2016_EVIDENCE.compactLine(said, '1.3.0.0'));
    add(COMPACT_2016_EVIDENCE.lockedLine(said, '1.5.0.0'));
    add(LEGACY_EVIDENCE.notLine(said, '4.8.2.1'));
  }
  add(MODERN_EVIDENCE.version('4.8.2.1'));
  add(EARLY_COMPACT_EVIDENCE.readable('1.3.0.8'));
  add(COMPACT_2016_EVIDENCE.early('0.7.0.7'));
  add(COMPACT_2016_EVIDENCE.notLine('4.8.2.1'));
  add(COMPACT_2016_EVIDENCE.bootloader2016('1.2.0.0'));
  add(COMPACT_2016_EVIDENCE.bootloader2014('0.9.0.0'));
  add(LEGACY_EVIDENCE.proLine('1.0.3.2'));
  add(LEGACY_EVIDENCE.early('0.7.0.8'));
  add(LEGACY_EVIDENCE.version('1.3.0.8'));
  for (const family of [
    MODERN_EVIDENCE,
    EARLY_COMPACT_EVIDENCE,
    GENERIC_EVIDENCE,
    COMPACT_2016_EVIDENCE,
    LEGACY_EVIDENCE,
  ]) {
    for (const sentence of Object.values(family)) {
      if (typeof sentence !== 'function') add(sentence);
    }
  }

  /* preserve: why a step stopped */
  add(spentReaderRefusalMessage('every byte 0xFF'));
  add(PRESERVE_FAIL.notInBackup('a', 0x14010000));
  add(PRESERVE_FAIL.readsDisagree('b', 'ab', 'cd'));
  add(PRESERVE_FAIL.notFactory('r'));
  add(PRESERVE_FAIL.ffSum);
  add(PRESERVE_FAIL.headChanged('a', '00', '11'));
  add(PRESERVE_FAIL.landed(['a']));
  add(PRESERVE_FAIL.landed(['a', 'b', 'r']));
  add(PRESERVE_FAIL.drainRebootRefused);
  add(PRESERVE_FAIL.shiftedRebootRefused);
  const places = [0x14010000, 0x14000000, 0x14070000].map((address) =>
    PRESERVE_FAIL.verifyPlace(address),
  );
  for (const where of [[], places]) {
    for (const short of [[], [3, 7]]) {
      add(PRESERVE_FAIL.verify({ count: 12, read: 63, total: 64, places: where, short }));
    }
  }

  /* preserve: the line gates, a bank whose image the run cannot patch, and why a step cannot run */
  add(spentReaderDeriveMessage('every byte 0xFF', ['one way: no', 'another way: no']));
  add(outsideLineRefusalMessage('4.8.2.1'));
  add(preWideningRefusalMessage('0.3.0.1'));
  add(unknownImageWordsMessage('1.3.0.8'));
  add(unknownImageRefusalMessage('r', '1.3.0.8'));
  for (const build of [
    { hz: 32, earlierPatch: false },
    { hz: 16, earlierPatch: true },
  ]) {
    add(frameRateImageWordsMessage('1.3.0.8', build));
    add(frameRateImageRefusalMessage('a', '1.3.0.8', build));
  }
  add(PRESERVE_DERIVE_WORDS.otherFirmware('1.2.0.0', '1.3.0.8'));
  add(PRESERVE_DERIVE_WORDS.otherFirmwareRefusal('b', '1.2.0.0', '1.3.0.8'));
  add(PRESERVE_DERIVE_WORDS.noImage(new Error('image is too small to hold the header window')));
  for (const gate of Object.values(PRESERVE_GATE)) {
    if (typeof gate !== 'function') add(gate);
  }
  add(PRESERVE_GATE.runDone('2026-10-30T07-00-00Z'));
  add(PRESERVE_GATE.stepDone('commit', '2026-10-30T07:00:00.000Z', 'drain'));
  add(PRESERVE_GATE.stepDone('commit', undefined, 'drain'));
  add(PRESERVE_GATE.backupRerun(['backup', 'patch'], 'commit'));
  add(PRESERVE_GATE.powerCycle(PRESERVE_GATE.noErrorText));
  add(PRESERVE_GATE.powerCycle(PRESERVE_FAIL.ffSum));
  add(PRESERVE_GATE.commitNeedsPatch(['a']));
  add(PRESERVE_GATE.commitNeedsPatch(['a', 'b', 'r']));
  add(PRESERVE_GATE.commitFiles(['preserve_backup.bin', 'capture_a.bin']));
  for (const build of [
    '1.3.0.8 (Compact)',
    PRESERVE_GATE.detectedBuild,
    preserveBuildParam({ expectedVersion: '1.3.0.8' }),
  ]) {
    add(PRESERVE_GATE.drainRefused(build, 'the EP0 sessions die at ~64-81 KB'));
    add(PRESERVE_GATE.drainHazard(build, [0x1234, 0x5678], 'b'));
    add(PRESERVE_GATE.restoreNoForm(build));
  }
  add(PRESERVE_GATE.drainFiles(['capture_a.bin']));
  add(PRESERVE_GATE.restoreFiles(['capture_a.bin', 'plain_a.bin']));
  add(PRESERVE_GATE.verifyNeedsBackup('preserve_backup.bin'));
  add(PRESERVE_GATE.needsBanks('drain'));
  add(PRESERVE_GATE.noBanks('the backup has not read the banks yet, so no bank can be chosen'));
  add(PRESERVE_GATE.bankRefused('a', PRESERVE_BANK_REFUSAL.erased()));
  add(PRESERVE_GATE.recoveryOnly(RECOVERY_ONLY_ROUTE_NOTE, 'a'));

  /* slots: an image file's refusal, a stale plan, the commit, a copy's and a restore's refusal */
  for (const refusal of Object.values(SLOT_IMAGE_REFUSAL)) {
    if (typeof refusal !== 'function') add(refusal);
  }
  add(SLOT_IMAGE_REFUSAL.notWordSized(51850));
  add(SLOT_IMAGE_REFUSAL.tooLong(0x80000));
  add(SLOT_IMAGE_REFUSAL.noHeader(0x12345678));
  add(SLOT_IMAGE_REFUSAL.stackOutside(0x30000000));
  add(SLOT_IMAGE_REFUSAL.stackUnaligned(0x10008002));
  add(SLOT_IMAGE_REFUSAL.notThumb(0x1a000200));
  add(
    SLOT_IMAGE_REFUSAL.keyMismatch('00'.repeat(16), '11'.repeat(16), 'Key A is not in the image'),
  );
  add(SLOT_IMAGE_REFUSAL.keyInHeader(0x210));
  add(SLOT_IMAGE_REFUSAL.keysOverlap(0x1000, 0x1008));
  const planEntry = { key: 'a', name: 'Slot A', address: 0x14010000 } as never;
  for (const refusal of Object.values(SLOT_PLAN_REFUSAL)) {
    if (typeof refusal !== 'function') add(refusal);
  }
  add(SLOT_PLAN_REFUSAL.otherFirmware('1.3.0.8', '1.3.0.0'));
  add(SLOT_PLAN_REFUSAL.otherFirmware(null, '1.3.0.0'));
  add(SLOT_PLAN_REFUSAL.otherCamera('SN1', 'SN2'));
  add(SLOT_PLAN_REFUSAL.otherCamera(null, null));
  add(SLOT_PLAN_REFUSAL.otherAddress(0x14030000, planEntry));
  add(SLOT_PLAN_REFUSAL.notRead(planEntry));
  add(SLOT_PLAN_REFUSAL.outsideBank(0x20000, planEntry));
  add(SLOT_PLAN_REFUSAL.riskAck(BOOT_UNNAMED_RISK));
  for (const status of [
    null,
    0x70000,
    0x50000,
    0x70100,
    0x30201,
    0x40000,
    0x40100,
    0x40200,
    0x12345,
  ]) {
    add(commitRefusal('Slot A', status, 'a').coreMessage);
    add(commitRefusal('Bank 2', status).coreMessage);
  }
  add(stagingStatusMessage(0x70000, 'Recovery R', 'r', 0x800));
  add(COPY_REFUSAL.ontoItself('Slot A', 'a'));
  add(COPY_REFUSAL.source('Slot B is empty'));
  add(COPY_REFUSAL.noPlain('Slot B', 'b'));
  add(RESTORE_REFUSAL.zipUnreadable('backup.zip', 'bad central directory'));
  for (const names of [[], ['preserve_run.json', 'preserve_dump_patched.bin']]) {
    for (const patched of [false, true]) {
      add(RESTORE_REFUSAL.noWholeFlash('run.zip', names, patched));
    }
  }
  add(RESTORE_REFUSAL.wrongSize('whole.bin', 100));
  add(RESTORE_REFUSAL.noBank('r'));
  add(RESTORE_REFUSAL.outsideFlash('Slot B', 'b'));
  const restoreWhere = RESTORE_WORDS.where('Slot B', 'b', 0x14030000);
  for (const gap of ['', 'not reached']) {
    for (const fill of [null, 0xff]) {
      add(RESTORE_REFUSAL.gap(restoreWhere, 'dump.zip', 0x14030000, gap, fill));
    }
  }
  add(RESTORE_REFUSAL.empty(restoreWhere));
  add(RESTORE_REFUSAL.fill(restoreWhere, 0x00));
  add(RESTORE_REFUSAL.notDecrypted(restoreWhere, 'erased'));
  add(
    RESTORE_REFUSAL.notDecrypted(
      restoreWhere,
      listParam([SLOT_FILE_WORDS.erasedHeader(), SLOT_FILE_WORDS.storedPlain()], 'semicolon'),
    ),
  );

  /* copy and restore: the preview's source, notes and warnings */
  for (const version of [null, '1.0.3.0']) {
    add(COPY_WORDS.source('Slot A', 'a', 0x14010000, version));
    add(COPY_WORDS.note('Slot B', 'b', version, 51848, 'ab'.repeat(32)));
    const where = RESTORE_WORDS.where('Recovery R', 'r', 0x14050000);
    add(RESTORE_WORDS.source(where, 'seek-preserve.zip', version));
    for (const from of ['flash-file', 'preserve-run', 'dump', 'all-selectors'] as const) {
      for (const entry of [null, 'flash-original.bin']) {
        add(
          RESTORE_WORDS.image({
            where,
            file: 'backup.zip',
            from,
            entry,
            stored: 'cd'.repeat(32),
            version,
            size: 51848,
            sha256: 'ef'.repeat(32),
          }),
        );
      }
    }
  }
  add(RESTORE_WORDS.readBack);
  add(RESTORE_WORDS.otherCamera('SN1', 'SN2', 'Slot A', 'a'));
  add(RESTORE_WORDS.noIdentity);
  add(RESTORE_WORDS.serialNotRead('SN1'));
  add(RESTORE_WORDS.sameCamera('SN1'));
  add(
    RESTORE_WORDS.otherFirmware(
      RESTORE_WORDS.where('Slot B', 'b', 0x14030000),
      '4.8.1.9',
      '4.8.2.1',
    ),
  );
  add(RESTORE_WORDS.sameBytes('Slot B', 'b'));

  /* fps: the patch table's reasons */
  for (const reason of [
    FPS_TABLE_REASON.withheld,
    FPS_TABLE_REASON.predates('0.7.0.8'),
    FPS_TABLE_REASON.stageTwoFf,
    FPS_TABLE_REASON.stageTwo,
    FPS_TABLE_REASON.notOffered,
    FPS_TABLE_REASON.notImage,
    FPS_TABLE_REASON.otherBuild('1.3.0.8-FF', '1308ff-16hz', '1.3.0.0'),
    FPS_TABLE_REASON.otherBuild('1.3.0.8', '1308-32hz', null),
    FPS_TABLE_REASON.patched(32),
    FPS_TABLE_REASON.earlierPatch(16),
    FPS_TABLE_REASON.atRate(16),
    FPS_TABLE_REASON.not4821(),
    FPS_TABLE_REASON.notInTable,
  ]) {
    add(reason);
  }

  /* decrypt: a bank file's refusal and notes */
  add(SLOT_FILE_WORDS.wrongSize(100));
  add(SLOT_FILE_WORDS.erasedBank(65536));
  add(SLOT_FILE_WORDS.erasedHeader());
  add(SLOT_FILE_WORDS.noHeader(0x12345678));
  add(SLOT_FILE_WORDS.lengthOutOfRange(0x123));
  add(SLOT_FILE_WORDS.ffKeyB(51848));
  add(SLOT_FILE_WORDS.notRecovered('UNVERIFIED'));
  add(SLOT_FILE_WORDS.storedPlain());
  add(SLOT_FILE_WORDS.decrypted(51848, 'VERIFIED(family)', 0, null));
  add(SLOT_FILE_WORDS.decrypted(51848, 'VERIFIED(structural)', 0x1234abcd, 'Key A'));

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
