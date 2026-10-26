/* OWNER: writer agent. See ./types.ts. */
/* ==================================================================== *
 * Writing one bank: prepare a payload (pure), then arm, stage, commit and read
 * back (the only part that sends anything).
 *
 * WHAT THIS PAGE WILL NOT DO, and where it is enforced:
 *   - arm subcommand 0, the upgrade-target selector: it rewrites cfg[0], the
 *     record that names the booted bank (`writeWindowOf`);
 *   - write the bootloader (0x14000000) or the boot-config block: any window
 *     below the bank area is refused (`writeWindowOf`);
 *   - send ResetDevice (0x59): nothing in this directory calls it;
 *   - write the booted bank, or recovery R, without `acknowledgeRisk` (`flashSlot`
 *     checks it before the first byte is sent);
 *   - write the 1.3.0.8 FF (16 Hz) image while the camera runs the 8 Hz build, which refuses
 *     its payload at commit (`stageImage`, from `runningApplicationOf`), or while the camera's
 *     own answers leave the build unknown and the person has not said it runs the 16 Hz build;
 *   - write a plan whose camera, firmware or address no longer match the
 *     analysis it is checked against (`flashSlot`).
 *
 * Every window the page arms comes from the report's plan (SlotEntry.write), and
 * every read from SlotEntry.read; no subcommand or address is written here.
 * ==================================================================== */

import { hexUp, sha256hex, hex } from '../bytes.js';
import type { SeekError } from '../errors.js';
import { transferSum16 } from '../image/bank.js';
import { FOOTER_TAG } from '../image/header.js';
import type { CipherProfile, WindowEntry } from '../profiles/types.js';
import { PLAIN_CHAIN_ONLY_REASON } from '../workflows/device-info.js';
import {
  isCancelled,
  slotByKey,
  type DeviceState,
  type SlotState,
  type WorkflowContext,
} from '../workflows/types.js';
import {
  SLOT_BYTES,
  type FlashSlotOptions,
  type FFRunningBasis,
  type FlashSlotResult,
  type PlanNote,
  type PlanStaging,
  type SlotEntry,
  type SlotFlashInput,
  type SlotFlashPlan,
  type SlotInputKind,
  type SlotKey,
  type SlotsReport,
  type StagingForm,
  type StoredForm,
} from './types.js';
import { ffKeyBStoredOf } from './ff-form.js';
import {
  cameraWriteRefusal,
  deriveWriteKeys,
  slotWriteRefusal,
  slotWriteRefusals,
  uploadLandsUnder,
} from './write-keys.js';
import {
  assertImageShape,
  bankImageOf,
  bootloaderFailures,
  buildFFPayload,
  buildKeyAPayload,
  buildPlainPayload,
  buildSlotKeystreamPayload,
  compareRows,
  foldedFFPayload,
  plainChainBuildOf,
  predictRawPlain,
  retargetImageKeys,
  slotRefused,
  type StagedBytes,
} from './write-image.js';
import { bootsNowOf } from './booted-words.js';
import { FF_1308_VERSION } from './capability-family.js';
import { slotContentOf } from './inspect.js';
import { runningApplicationOf, type RunningApplication } from './running.js';
import { stagingPhrase } from './staging-words.js';
import { readBackBank, stageAndCommit } from './write-commit.js';
import { compareReadBack } from './write-verify.js';
import {
  backUpBanks,
  writeActionWords,
  type SaveBackup,
  type WriteAction,
  type WriteBackup,
} from './backup.js';

/* ==================================================================== *
 * The guards every write passes through
 * ==================================================================== */

/** Nothing below this is a bank: the bootloader (0x14000000), the boot config (0x14010000) and the device block (0x14020000). */
const BANK_AREA_START = 0x14030000;
/** One past the last address a bank can sit at (the 4 MiB part). */
const BANK_AREA_END = 0x14400000;

function entryFor(report: SlotsReport, key: SlotKey): SlotEntry {
  const entry = report.plan.slots.find((slot) => slot.key === key);
  if (entry === undefined) {
    throw slotRefused(`this build's slot plan has no slot '${key}'`, { key });
  }
  return entry;
}

/**
 * The write window the plan names for a bank, or a refusal. The three checks
 * are the ones that keep this page away from cfg[0] and the bootloader: a
 * subcommand 0, a commit that also rewrites the boot configuration, and an
 * address outside the bank area.
 */
export function writeWindowOf(entry: SlotEntry): WindowEntry {
  if (entry.write === null) {
    throw slotRefused(
      `${entry.name} has no write window on this build, so nothing can be armed for it`,
    );
  }
  if (entry.commitEffect !== 'bank-only') {
    throw slotRefused(
      `${entry.name}'s commit also rewrites the boot configuration; a slot write does not do that`,
    );
  }
  if (entry.write.subcmd === 0) {
    throw slotRefused(
      'subcommand 0 is the upgrade-target selector, and arming it rewrites cfg[0]; a slot write ' +
        'never arms it',
    );
  }
  const at = entry.write.address;
  if (at < BANK_AREA_START || at >= BANK_AREA_END) {
    throw slotRefused(
      `${hexUp(at)} is not a bank: the bootloader and the boot configuration are not written here`,
      { address: at },
    );
  }
  return entry.write;
}

function unreadWhy(report: SlotsReport, key: SlotKey): string {
  return (
    report.slots.find((view) => view.entry.key === key)?.unreadReason ?? 'the read did not reach it'
  );
}

/** The image footer a Key A payload should carry: this bank's own, else any valid one on the camera. */
function footerTemplateFor(report: SlotsReport, slot: SlotState): Uint8Array | null {
  const valid = (s: SlotState | null | undefined): boolean =>
    s !== null && s !== undefined && s.footer !== null && s.footer.tag === FOOTER_TAG;
  const source = valid(slot) ? slot : (report.state.slots.find((s) => valid(s)) ?? null);
  return source?.footer?.raw ?? null;
}

/** Whether writing this bank needs the risk acknowledgement: the booted bank, recovery, or a boot that could not be named. */
function ackNeeded(report: SlotsReport, key: SlotKey): string | null {
  const boot = report.state.boot;
  if (boot === null)
    return 'the booted bank could not be named, so this one is treated as the booted one';
  if (boot.booted === key)
    return bootsNowOf(key === 'r' ? 'recovery bank R' : `bank ${key.toUpperCase()}`);
  if (key === 'r') return 'recovery bank R is the last-resort copy the bootloader falls back to';
  return null;
}

/** Where a derived-key write takes its key from: the booted bank, and the key's name. */
type DerivedFrom = NonNullable<SlotFlashPlan['derivedFrom']>;

/* ==================================================================== *
 * prepareSlotFlash
 * ==================================================================== */

interface Body {
  readonly payload: Uint8Array;
  /**
   * The plain image the bank must decrypt to, when this page can say it: the image
   * as its staging builder stamped and balanced it, or, for raw bytes, what the
   * payload decrypts to under the staging key. Null when no image can be predicted.
   */
  readonly expectedPlain: Uint8Array | null;
  readonly staging: PlanStaging;
  readonly keyAfter: string;
  /** The booted bank and the key it holds, when this bank is written under a derived key. */
  readonly derivedFrom: DerivedFrom | null;
  /**
   * The exact bank bytes, only where they are predictable: the 2014 plain chain, which programs
   * what it is sent, and the 1.3.0.8 FF build, which programs the image the payload folds to
   * (`storedForm`). The encrypting forms re-encrypt, so this is null there.
   */
  readonly expectedStored: Uint8Array | null;
  /** How `expectedStored` relates to the payload; absent means 'as-sent'. */
  readonly storedForm?: StoredForm;
  /** For an FF image (decrypted or raw): how the running build was decided. Null otherwise. */
  readonly ffRunning?: FFRunningBasis;
}

/** What the person has said about the camera, beside the input. */
export interface PrepareSlotFlashOptions {
  /**
   * The person says the camera runs the 16 Hz FF build. It is read only when the camera's own
   * per-bank answers cannot say which build it runs (running.ts); a wrong choice is refused by the
   * camera with 0x00070100 before it programs anything.
   */
  readonly running16Hz?: boolean;
}

/** The stored-form name the plan gives the Key B bank: the image XOR key block 1, header window verbatim. */
const KEY_B_STORED_NAME =
  'Key B (the camera re-keys the payload with key block 1 and stores the image under it)';

/**
 * The running build for an FF image, or a refusal. The camera's own answers name the 16 Hz build
 * (use it), name the 8 Hz build (refuse: its gate refuses the payload), or decide nothing (refuse
 * unless the person has said the camera runs the 16 Hz build).
 */
function ffRunningGate(
  report: SlotsReport,
  options: PrepareSlotFlashOptions,
): { readonly basis: FFRunningBasis; readonly running: RunningApplication } {
  const running = runningApplicationOf(report.state);
  if (running.build === 'plain') throw ffRunningRefusal(running);
  if (running.build === 'ff-1308') return { basis: 'camera', running };
  if (options.running16Hz === true) return { basis: 'user', running };
  throw ffRunningUnknownRefusal(running);
}

/** What is said beside a plan: its warnings (a risk, or a check not made) and this write's own notes. */
interface PlanWords {
  readonly warnings: readonly string[];
  readonly notes: readonly string[];
}

/**
 * What is said beside an FF image's plan: how the running build was decided, as a note; the untested boot,
 * and a running build the person chose, as warnings. How the image is staged and stored is the plan's own
 * rows' (its staging, `stagingDetail('key-a-keystream')`, and what the bank holds afterwards), so no note
 * says it again (TESTING.md 42.89); a raw payload in the FF form says it in its own note. The payload is not
 * the stored bytes, and no genuine bootloader for this build is in the corpus, so nothing here claims the
 * written bank boots.
 */
function ffStagingWords(args: {
  readonly running: RunningApplication;
  readonly basis: FFRunningBasis;
}): PlanWords {
  const { running, basis } = args;
  const warnings = [
    'UNTESTED: no genuine bootloader for the 1.3.0.8 FF build is in the corpus, so whether the ' +
      'written bank boots is not measured. On the 0.9.0.0 bootloader the old plain form booted from ' +
      'recovery R; this form will not, because recovery runs the bank unchecked and does not decrypt it ' +
      '(TESTING.md 42.12). Nothing here claims the camera boots it.',
  ];
  const notes: string[] = [];
  if (basis === 'camera') {
    notes.push(`The camera's own answers say it runs the 16 Hz FF build: ${running.why}.`);
  } else {
    warnings.push(
      `The camera's own answers did not say which build it runs (${running.why}). You said it runs ` +
        'the 16 Hz build. If it runs the 8 Hz build, it refuses this payload at commit with ' +
        '0x00070100 and leaves the bank unchanged, which is what happens when the choice is wrong.',
    );
  }
  return { warnings, notes };
}

/**
 * The refusal for the FF image while the camera runs the 8 Hz application. That application
 * refuses an FF payload at commit with 0x00070100, before it programs anything (its plain word-sum
 * gate, cmd_CompleteMemoryUpgrade case 9, TESTING.md 42.10), so nothing is sent.
 */
function ffRunningRefusal(running: RunningApplication): SeekError {
  return slotRefused(
    'this is the 1.3.0.8 FF (16 Hz) image, but the camera runs the 8 Hz 1.3.0.8 application: ' +
      `${running.why}. The 8 Hz application refuses an FF payload at commit with 0x00070100, before ` +
      'it programs anything (its plain word-sum gate, measured for the earlier staged form, ' +
      'TESTING.md 42.10). Nothing was sent.',
    { running: running.build },
  );
}

/**
 * The refusal for the FF image while the camera's answers cannot say which build it runs, unless
 * the person says it runs the 16 Hz build. Nothing is sent.
 */
function ffRunningUnknownRefusal(running: RunningApplication): SeekError {
  return slotRefused(
    `the camera's running build could not be told: ${running.why}. The 1.3.0.8 FF image is refused ` +
      'by default, because if the camera runs the 8 Hz build it refuses this payload with 0x00070100. ' +
      'To write it, confirm that this camera runs the 16 Hz build. Nothing was sent.',
    { running: running.build },
  );
}

/**
 * Turn a decrypted image or raw bytes into the payload for one bank. Pure:
 * nothing is sent. Every refusal here means the payload would not be sent
 * safely, and each is raised as 'slots/refused' with nothing to undo.
 */
export function prepareSlotFlash(
  report: SlotsReport,
  key: SlotKey,
  input: SlotFlashInput,
  options: PrepareSlotFlashOptions = {},
): SlotFlashPlan {
  const { state, plan } = report;
  const entry = entryFor(report, key);
  if (!plan.supportedBuild.supported) throw slotRefused(plan.supportedBuild.reason);
  if (state.version === null) {
    throw slotRefused(
      'the analysis does not say which firmware the camera runs, and the slot commands mean ' +
        'different things on different builds. Read the device info again.',
    );
  }
  writeWindowOf(entry);
  const slot = slotByKey(state, key);
  if (slot === null || slot.unread) {
    throw slotRefused(
      `slot ${entry.name} was not read (${unreadWhy(report, key)}), so nothing can be written ` +
        'on the strength of it',
    );
  }
  /* AN EMPTY BANK IS WRITABLE where the plan says so. Nothing below reads the target
   * bank's own content to build a payload (the stage key is the image's, or the
   * camera's Key A; the plain chain needs none), so an erased bank is written exactly
   * like a used one. The plan's verdict is checked here so that a family it ever marks
   * otherwise is refused with its own reason, before anything is built. */
  const targetEmpty = slotContentOf(slot) === 'empty';
  if (targetEmpty && !entry.emptyBank.writable.supported) {
    throw slotRefused(
      `${entry.name} is empty and cannot be written on this build: ${entry.emptyBank.writable.reason}`,
    );
  }
  if (input.bytes.length === 0) throw slotRefused('the input is empty');
  const bankBytes = Math.min(entry.length, SLOT_BYTES);
  const cipher = state.profile.cipher;
  const warnings: string[] = [];
  /* This write's own notes: how it is staged or checked, or what the bank will hold. Not a risk, so not a
   * warning (TESTING.md 42.88). */
  const writeNotes: string[] = [];

  let body: Body;
  if (input.kind === 'raw') {
    if (!entry.flashRaw.supported) {
      throw slotRefused(
        `${entry.name} cannot take raw bytes on this build: ${entry.flashRaw.reason}`,
      );
    }
    if (input.bytes.length > bankBytes) {
      throw slotRefused(
        `${String(input.bytes.length)} B is longer than the ${entry.name} bank (${hex(bankBytes)} B)`,
        { length: input.bytes.length, bank: bankBytes },
      );
    }
    refuseOnCameraWide(state, input.kind);
    const payload = input.bytes.slice();
    /* The 1.3.0.8 FF build's staged form is told by its bytes: both of the app's accepts pass
     * it and it folds to an image carrying the FF key pair. Sent as given all the same; this
     * only decides what the bank is said to hold, and which bank may take it. */
    const folded = entry.staging === 'plain' ? foldedFFPayload(payload) : null;
    const ffRaw = folded === null ? null : ffRunningGate(report, options);
    /* What the bank will hold depends on the form the device decodes the bytes
     * with. The 2014 plain chain programs them as sent (the FF build, the image they
     * fold to), so there the stored bytes are predicted; the encrypting forms
     * re-encrypt, and what they decrypt to is what can be checked (`predictRawPlain`). */
    body = {
      payload,
      expectedPlain:
        folded ??
        (entry.staging === null
          ? null
          : predictRawPlain(
              entry.staging,
              payload,
              { keyA: state.keyTable?.keyA ?? null },
              cipher,
            )),
      staging: 'verbatim',
      keyAfter: folded === null ? 'as given (raw)' : KEY_B_STORED_NAME,
      derivedFrom: null,
      expectedStored:
        folded !== null
          ? bankImageOf(ffKeyBStoredOf(folded), bankBytes)
          : entry.staging === 'plain'
            ? bankImageOf(payload, bankBytes)
            : null,
      ...(folded === null ? {} : { storedForm: 'key-b-ciphertext' as const }),
      ffRunning: ffRaw === null ? null : ffRaw.basis,
    };
    warnings.push('Raw payload: sent exactly as given. Nothing here checks that it is bootable.');
    if (folded !== null && ffRaw !== null) {
      const ff = ffStagingWords(ffRaw);
      warnings.push(...ff.warnings);
      writeNotes.push(...ff.notes);
      writeNotes.push(
        'This payload is the 1.3.0.8 FF staged form (the image XOR key block 0, word sum 0xFFFF). ' +
          'The camera stores the image under Key B, so the read-back is checked against those bytes.',
      );
    } else if (entry.staging === null) {
      warnings.push(
        'This build names no staging form for the slot, so the bootloader checks cannot be stated.',
      );
    } else {
      if (entry.staging !== 'plain') {
        writeNotes.push(
          'The device decodes this payload and re-encrypts what it keeps, so the stored bytes are ' +
            'not predicted. The read-back is checked as the image it decrypts to, where that can be said.',
        );
      }
      for (const failure of bootloaderFailures(entry.staging, payload, cipher, {
        keyA: state.keyTable?.keyA ?? null,
      })) {
        warnings.push(`The bootloader would reject this payload: ${failure}.`);
      }
      if (entry.staging === 'slot-keystream-ciphertext') {
        warnings.push(
          "The 2016 stage key (key block 0) is not in raw bytes, so this payload's decrypted " +
            'word sum is not checked here.',
        );
      }
    }
  } else {
    if (!entry.flashPlain.supported) {
      throw slotRefused(
        `${entry.name} cannot take a decrypted image on this build: ${entry.flashPlain.reason}`,
      );
    }
    if (entry.staging === null) {
      throw slotRefused(
        `${entry.name} has no staging form on this build, so an image cannot be encoded for it`,
      );
    }
    assertImageShape(input.bytes);
    if (input.bytes.length > bankBytes) {
      throw slotRefused(
        `image is ${String(input.bytes.length)} B, longer than the ${entry.name} bank (${hex(bankBytes)} B)`,
      );
    }
    refuseOnCameraWide(state, input.kind);
    const staged = stageImage(report, slot, entry.staging, input, cipher, options);
    body = {
      payload: staged.staged.payload,
      /* The stamped image is what the builder made the bank hold, after the length
       * stamp and the acceptance balance; the device stores it under its own key. */
      expectedPlain: staged.staged.stamped,
      staging: staged.staging ?? entry.staging,
      keyAfter: staged.keyAfter,
      derivedFrom: staged.derivedFrom,
      expectedStored: staged.expectedStored(bankBytes),
      ...(staged.storedForm === undefined ? {} : { storedForm: staged.storedForm }),
      ...(staged.ffRunning === undefined ? {} : { ffRunning: staged.ffRunning }),
    };
    if (staged.rekeyRisk) {
      warnings.push(
        `${entry.name} already holds an image the bootloader cannot take. This write lands in the same state.`,
      );
    }
    warnings.push(...(staged.words?.warnings ?? []));
    writeNotes.push(...(staged.words?.notes ?? []));
  }

  if (body.payload.length > bankBytes) {
    throw slotRefused(`the payload is ${hex(body.payload.length)} B, past the ${entry.name} bank`);
  }

  if (key === 'r') {
    warnings.push(
      'Recovery bank R: writing it asks you to acknowledge the risk. Nothing here checks that the camera boots afterwards.',
    );
  }
  const risk = ackNeeded(report, key);
  if (risk !== null && key !== 'r') {
    warnings.push(
      `${risk}: writing it asks you to acknowledge the risk, and the camera runs whatever it holds after the next power cycle.`,
    );
  }
  /* This write's notes, then the bank's own, then the camera's. None is a risk, so none is a warning. A front
   * end that already shows the camera's notes and the bank's row need not say those two again (TESTING.md
   * 42.88). */
  const notes: PlanNote[] = [
    ...writeNotes.map((text) => ({ source: 'write' as const, text })),
    ...entry.notes.map((text) => ({ source: 'bank' as const, text })),
    ...plan.notes.map((text) => ({ source: 'camera' as const, text })),
  ];

  const compare = compareRows(
    { header: slot.plainHeader, sha256: slot.sha256, keyName: slot.keyName },
    {
      plain: body.expectedPlain,
      storedPredicted: body.expectedStored !== null,
      keyName: body.keyAfter,
    },
  );

  return {
    key,
    address: entry.address,
    kind: input.kind,
    staging: body.staging,
    payload: body.payload,
    sum16: transferSum16(body.payload),
    expectedStored: body.expectedStored,
    ...(body.storedForm === undefined ? {} : { storedForm: body.storedForm }),
    ...(body.ffRunning === undefined ? {} : { ffRunning: body.ffRunning }),
    expectedPlain: body.expectedPlain,
    derivedFrom: body.derivedFrom,
    compare,
    targetEmpty,
    warnings,
    notes,
    serial: state.serial,
    firmwareVersion: state.version,
  };
}

/** What `stageImage` decides for a decrypted image, in the form the bank needs. */
interface StagedImage {
  readonly staged: StagedBytes;
  readonly keyAfter: string;
  readonly derivedFrom: DerivedFrom | null;
  /** The bank-sized bytes the bank will hold, when they are predictable. */
  expectedStored(bankBytes: number): Uint8Array | null;
  readonly rekeyRisk: boolean;
  /** The staging the plan reports, when it is not the bank's own (the FF image's 'key-a-keystream'). */
  readonly staging?: PlanStaging;
  /** How the stored bytes relate to the payload, when not 'as-sent'. */
  readonly storedForm?: StoredForm;
  /** Extra words beside the plan: its warnings and this write's notes. */
  readonly words?: PlanWords;
  /** For an FF image: how the running build was decided. */
  readonly ffRunning?: FFRunningBasis;
}

/**
 * The camera-wide refusal, raised before a payload is built or sent. A decrypted image is staged under the
 * camera's keys where the line uses them, so it is refused for everything the page's banner names
 * (`slotWriteRefusal`: the read's camera-wide refusals and the upload-key derivation). A raw payload is sent as
 * given: no key of this write builds it, so only the read's camera-wide refusals refuse it. The page refuses no
 * less than the writer, and the CLI and the frame-rate patch refuse what the page refuses. The refusal carries
 * the reasons it was made for (`detail.blockedBy`).
 */
function refuseOnCameraWide(state: DeviceState, kind: SlotInputKind): void {
  const refusal = kind === 'raw' ? cameraWriteRefusal(state) : slotWriteRefusal(state);
  if (refusal === null) return;
  throw slotRefused(`${refusal}. Nothing was written.`, {
    blockedBy: kind === 'raw' ? [...state.bankWriteRefusals] : slotWriteRefusals(state),
  });
}

/**
 * The 2014 plaintext chain's own condition for an image staged plain (a decrypted image; the 1.3.0.8 FF
 * image is staged in its vendor form and is not this). It is not one of the read's camera-wide refusals,
 * because it refuses only this staging: a camera with no bank stored plain is not shown to be on the chain,
 * and its bootloader may want a keyed bank. A raw payload is sent as given and is not refused for it.
 */
function refusePlainStaging(state: DeviceState): void {
  if (state.plainChain) return;
  throw slotRefused(
    `this camera cannot take a plain-staged image from here: ${PLAIN_CHAIN_ONLY_REASON}. Nothing was written.`,
    { blockedBy: [PLAIN_CHAIN_ONLY_REASON] },
  );
}

function stageImage(
  report: SlotsReport,
  slot: SlotState,
  staging: StagingForm,
  input: SlotFlashInput,
  cipher: CipherProfile,
  options: PrepareSlotFlashOptions,
): StagedImage {
  if (staging === 'key-a-ciphertext') {
    const { state } = report;
    const refusal = slotWriteRefusal(state);
    if (refusal !== null) {
      throw slotRefused(refusal, { blockedBy: slotWriteRefusals(state) });
    }
    const keyTable = state.keyTable;
    if (keyTable === null) {
      throw slotRefused(
        "the analysis does not name this camera's bootloader key table, so the image cannot be retargeted to it",
      );
    }
    const keys = deriveWriteKeys(state);
    if (keys.refusal !== null || keys.atRest === null || keys.booted === null) {
      throw slotRefused(keys.refusal ?? 'the upload keys could not be derived');
    }
    const mine = retargetImageKeys(input.bytes, input.fileName, keyTable);
    const staged = buildKeyAPayload(
      mine,
      keys.masks.map((mask) => mask.key),
      footerTemplateFor(report, slot),
      state.profile,
    );
    /* The device's own two passes, run on these bytes, must leave the image under
     * the booted bank's key; a mismatch is a bug in the derivation, never sent. */
    const landed = uploadLandsUnder(keys, state.profile.cipher, staged.stamped, staged.payload);
    if (landed !== null) throw slotRefused(landed);
    return {
      staged,
      keyAfter: keys.atRest.name,
      derivedFrom: { bank: keys.booted, key: keys.atRest.name, holds: keys.bootedKeyName },
      /* The device decrypts with the application's keys and re-encrypts under its store key, so
       * the bytes it keeps are not the bytes it was sent: nothing to predict. */
      expectedStored: () => null,
      /* THIS BRANCH IS THE 4.x (modern) FAMILY ONLY: `stagingFor` gives key-a-ciphertext to no other line.
       * footerOk is a real test here, because the 4.x bootloader checks a "CODE" footer (checksFooter).
       * It is not the 2016 gap: the 2016 line never reaches this branch (its staging is the stage-key form
       * below, which sets rekeyRisk false), and its bank has no footer in the flash (TESTING.md 42.43), so
       * footerOk is false there. Nor may `!bootable` alone stand in for 2016: its bootability is "unknown"
       * (no key table, device-info.ts), not "not bootable", so the warning would name every bank that
       * accepts. A 2016 rule waits on a key table that can establish "not bootable" (TESTING.md 42.48 §3). */
      rekeyRisk: slot.present && slot.accepts && slot.footerOk && !slot.bootable,
    };
  }
  if (staging === 'slot-keystream-ciphertext') {
    const staged = buildSlotKeystreamPayload(input.bytes, cipher);
    return {
      staged,
      /* What the bank is keyed by afterwards: the store key, not the stage key it was sent under (TESTING.md
       * 42.93: the FF board's banks read "key block 1" after every write, and the plan had said key block 0). */
      keyAfter:
        'key block 1: the camera stores the image under it (it is sent under key block 0, the stage key)',
      derivedFrom: null,
      /* The 2016 device decrypts with the stage key and stores the image under its
       * own store key (key block 1 of the pair), so the staged bytes are not what
       * the bank keeps. Measured on the Compact PRO 1.0.3.0: a bank written with its
       * own image reads back byte-identical to before, and the bytes differ from the
       * payload. The bank is checked as the plain image it decrypts to instead. */
      expectedStored: () => null,
      rekeyRisk: false,
    };
  }
  /* The 2014 chain holds two builds under one version string; the image says which. */
  if (plainChainBuildOf(input.bytes) === 'ff-1308') {
    const version = report.state.version;
    if (version !== FF_1308_VERSION) {
      throw slotRefused(
        `this is the ${FF_1308_VERSION} FF (16 Hz) image, staged for a camera running ` +
          `${FF_1308_VERSION}; this camera reports ${version ?? 'no version'}. Nothing was written.`,
        { version },
      );
    }
    /* The application that runs decides whether the camera takes this payload at all: the 8 Hz
     * build refuses it at commit, so a camera running it is refused here, before anything is sent,
     * and a camera whose answers cannot say is refused unless the person says it runs the 16 Hz build. */
    const gate = ffRunningGate(report, options);
    const ff = buildFFPayload(input.bytes);
    return {
      staged: ff,
      keyAfter: KEY_B_STORED_NAME,
      derivedFrom: null,
      /* The camera re-keys the payload and programs the image under Key B: those are the bytes. */
      expectedStored: (bankBytes) => bankImageOf(ff.stored, bankBytes),
      rekeyRisk: false,
      staging: 'key-a-keystream',
      storedForm: 'key-b-ciphertext',
      ffRunning: gate.basis,
      words: ffStagingWords(gate),
    };
  }
  refusePlainStaging(report.state);
  const staged = buildPlainPayload(input.bytes, cipher);
  return {
    staged,
    keyAfter: 'none (plaintext chain)',
    derivedFrom: null,
    expectedStored: (bankBytes) => bankImageOf(staged.payload, bankBytes),
    rekeyRisk: false,
  };
}

/* ==================================================================== *
 * flashSlot
 * ==================================================================== */

/**
 * The checks a plan must pass against the analysis it is sent under, before
 * anything is sent: the same camera (serial), the same build (version), the
 * same bank, and a checksum that matches its payload. A plan that fails one is
 * stale or was edited, and nothing is written from it.
 */
function assertPlanIsCurrent(report: SlotsReport, plan: SlotFlashPlan, entry: SlotEntry): void {
  const { state } = report;
  if (!report.plan.supportedBuild.supported) throw slotRefused(report.plan.supportedBuild.reason);
  if (state.version === null) {
    throw slotRefused(
      'the analysis does not say which firmware the camera runs. Nothing was written.',
    );
  }
  if (plan.firmwareVersion !== state.version) {
    throw slotRefused(
      `the plan was built for firmware ${plan.firmwareVersion ?? 'of unknown version'}, but the ` +
        `analysis reads ${state.version}. The plan is stale; build it again. Nothing was written.`,
    );
  }
  if (plan.serial !== state.serial) {
    throw slotRefused(
      `the plan was built for camera ${plan.serial ?? 'of unknown serial'}, but the analysis reads ` +
        `${state.serial ?? 'an unknown serial'}. Refusing to write it here. Nothing was written.`,
    );
  }
  if (plan.address !== entry.address) {
    throw slotRefused(
      `the plan targets ${hexUp(plan.address)}, but the build's ${entry.name} is at ${hexUp(entry.address)}`,
    );
  }
  const slot = slotByKey(state, plan.key);
  if (slot === null || slot.unread) {
    throw slotRefused(`the analysis no longer reads ${entry.name}. Nothing was written.`);
  }
  if (plan.sum16 !== transferSum16(plan.payload)) {
    throw slotRefused(
      'the plan checksum does not match its payload, so the plan was edited. Nothing was written.',
    );
  }
  const bankBytes = Math.min(entry.length, SLOT_BYTES);
  if (plan.payload.length === 0 || plan.payload.length > bankBytes) {
    throw slotRefused(
      `the payload is ${hex(plan.payload.length)} B, outside the ${entry.name} bank`,
    );
  }
}

/**
 * Every check `flashSlot` makes before it sends a byte, without sending anything: the bank's write window, the
 * plan against the analysis, the risk acknowledgement, the camera-wide refusal and the plain form's own
 * condition. Throws the refusal; returns the bank's entry and window. `flashSlotWithBackup` runs it before it
 * reads the bank for the backup, so a write that would be refused saves nothing.
 */
export function checkSlotFlash(
  report: SlotsReport,
  plan: SlotFlashPlan,
  options: Pick<FlashSlotOptions, 'acknowledgeRisk'>,
): { readonly entry: SlotEntry; readonly write: WindowEntry } {
  const entry = entryFor(report, plan.key);
  const write: WindowEntry = writeWindowOf(entry);
  assertPlanIsCurrent(report, plan, entry);

  const risk = ackNeeded(report, plan.key);
  /* This refusal names the option, because only a library caller reaches it: the page asks its own tick
   * first (`useSlotsPanel` `needsRiskAck`, the same rule), and the CLI refuses `slots flash` and
   * `slots patch-fps` without --acknowledge-risk before the plan (`bootRisk`, a superset of this rule). */
  if (risk !== null && !options.acknowledgeRisk) {
    throw slotRefused(`${risk}. Writing it needs acknowledgeRisk: true. Nothing was sent.`, {
      key: plan.key,
    });
  }
  /* The camera-wide refusal the page's banner shows (`slotWriteRefusal`) binds every staging, so the
   * writer sends nothing the page refuses. On the lines that stage under their own image it names only
   * the read's camera-wide refusals (no key-table or derivation reason applies there). */
  const refusal = slotWriteRefusal(report.state);
  if (refusal !== null) {
    throw slotRefused(`${refusal}. Nothing was written.`, {
      blockedBy: slotWriteRefusals(report.state),
    });
  }
  /* And the plain form's own condition, which that gate does not carry (see `refusePlainStaging`). */
  if (plan.kind === 'plain' && plan.staging === 'plain') refusePlainStaging(report.state);
  return { entry, write };
}

/**
 * Arm the bank's write window, stage the payload, commit it, and (by default)
 * read the bank back and compare. Nothing is sent before every check here has
 * passed; the risk acknowledgement is checked first of all.
 *
 * This is the write alone: it saves nothing. A write a person makes goes through
 * `flashSlotWithBackup` (or the frame-rate patch), which saves the bank first and calls this.
 */
export async function flashSlot(
  ctx: WorkflowContext,
  report: SlotsReport,
  plan: SlotFlashPlan,
  options: FlashSlotOptions,
): Promise<FlashSlotResult> {
  const { entry, write } = checkSlotFlash(report, plan, options);

  const { reporter } = ctx;
  /* `plan.kind` 'plain' is the INPUT (a decrypted image), not the stored form: on the 2016 line the line
   * used to read "(plain, slot-keystream-ciphertext)", which looked like a contradiction. The form is said
   * in words (`stagingPhrase`); the JSON outputs keep the code name (TESTING.md 42.87). */
  const staged = stagingPhrase(plan.staging);
  const source =
    plan.kind === 'plain' ? `from the decrypted image, ${staged}` : `of raw bytes, ${staged}`;
  reporter.log(
    `${entry.name}: writing ${String(plan.payload.length)} B ${source} — checksum ` +
      hexUp(plan.sum16, 4),
    'warn',
  );
  const commitStatus = await stageAndCommit(ctx, entry, write, plan.payload, plan.sum16, () => {
    options.onCommit?.(plan.key);
  });

  const notes: string[] = [
    `committed ${String(plan.payload.length)} B to ${entry.name} at ${hexUp(entry.address)}, ` +
      `${staged}; commit status ${hex(commitStatus)}`,
  ];
  let after: Uint8Array | null = null;
  let verified: boolean | null = null;

  if (options.verify !== false) {
    if (entry.read === null) {
      notes.push('this build names no read window for the bank, so nothing was read back');
    } else {
      try {
        after = await readBackBank(ctx, entry.read);
      } catch (error) {
        if (isCancelled(ctx)) throw error;
        verified = false;
        notes.push(
          `the read-back failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    if (after !== null) {
      notes.push(`read back ${String(after.length)} B, SHA-256 ${await sha256hex(after)}`);
      /* Byte comparison where the plan predicts the stored bytes; otherwise the bank
       * is decrypted under the keystream the read-back itself carries and compared
       * with the plain image. See write-verify.ts for why that is the check. */
      const verdict = compareReadBack(
        after,
        {
          stored: plan.expectedStored,
          plain: plan.expectedPlain ?? null,
          storedAs: plan.storedForm ?? 'as-sent',
        },
        report.state.profile.cipher,
        plan.kind,
      );
      verified = verdict.verified;
      notes.push(...verdict.notes);
    }
  } else {
    notes.push('verify is off: the bank was not read back');
  }

  /* The replug instruction, and what to read again after it, are the front end's to give, once, after its
   * own result lines: the page logs its replug record and shows the prompt in its result panel, and the CLI
   * prints its read-back lines with the replug and the command to run. Saying it here too printed it twice
   * after one write or one frame-rate patch (TESTING.md 42.84), and the CLI's copy named "the device info"
   * (TESTING.md 42.87). */
  reporter.progress(1, 1, 'Written.');

  return { key: plan.key, commitStatus, verified, after, notes };
}

/* ==================================================================== *
 * flashSlotWithBackup: the write a person makes
 * ==================================================================== */

/** A write that saves its target bank first. */
export interface SlotWriteOptions extends FlashSlotOptions {
  /** What the write is, for the backup's name and its text file. */
  readonly action: WriteAction;
  /** Saves the backup zip. The write waits for it, and a save that did not happen refuses it. */
  readonly saveBackup: SaveBackup;
  /** The clock the backup's name and text are stamped with. Default: now. */
  readonly now?: () => Date;
}

export interface SlotWriteResult {
  readonly written: FlashSlotResult;
  /** The zip saved before the write. */
  readonly backup: WriteBackup;
}

/**
 * Checks the write as `flashSlot` would (nothing is read or saved for a write that would be refused), reads the
 * target bank again and saves it in the backup zip, then writes and reads back. Every bank write the page and the
 * CLI make goes through here or through the frame-rate patch, which saves the bank the same way (owner,
 * 2026-10-26). A target that is empty, or that cannot be read, is said in the zip and does not refuse the write.
 */
export async function flashSlotWithBackup(
  ctx: WorkflowContext,
  report: SlotsReport,
  plan: SlotFlashPlan,
  options: SlotWriteOptions,
): Promise<SlotWriteResult> {
  checkSlotFlash(report, plan, options);
  const backup = await backUpBanks(ctx, report, {
    keys: [plan.key],
    action: options.action,
    follows: writeActionWords(options.action, report, [plan.key]),
    save: options.saveBackup,
    ...(options.now === undefined ? {} : { now: options.now }),
  });
  const written = await flashSlot(ctx, report, plan, options);
  return { written, backup };
}
