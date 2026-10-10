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
 *   - write a plan whose camera, firmware or address no longer match the
 *     analysis it is checked against (`flashSlot`).
 *
 * Every window the page arms comes from the report's plan (SlotEntry.write), and
 * every read from SlotEntry.read; no subcommand or address is written here.
 * ==================================================================== */

import { hexUp, sha256hex, hex } from '../bytes.js';
import { transferSum16 } from '../image/bank.js';
import { FOOTER_TAG } from '../image/header.js';
import type { CipherProfile, WindowEntry } from '../profiles/types.js';
import {
  isCancelled,
  slotByKey,
  type SlotState,
  type WorkflowContext,
} from '../workflows/types.js';
import {
  SLOT_BYTES,
  type FlashSlotOptions,
  type FlashSlotResult,
  type SlotEntry,
  type SlotFlashInput,
  type SlotFlashPlan,
  type SlotKey,
  type SlotsReport,
  type StagingForm,
} from './types.js';
import {
  assertImageShape,
  bankImageOf,
  bootloaderFailures,
  buildKeyAPayload,
  buildPlainPayload,
  buildSlotKeystreamPayload,
  compareRows,
  predictRawPlain,
  retargetImageKeys,
  slotRefused,
  type StagedBytes,
} from './write-image.js';
import { readBackBank, stageAndCommit } from './write-commit.js';
import { compareReadBack } from './write-verify.js';

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
      `${entry.name}'s commit also rewrites the boot configuration; this page does not offer that`,
    );
  }
  if (entry.write.subcmd === 0) {
    throw slotRefused(
      'subcommand 0 is the upgrade-target selector, and arming it rewrites cfg[0]; this page ' +
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
    return `${key === 'r' ? 'recovery bank R' : `bank ${key.toUpperCase()}`} is the bank the camera boots now`;
  if (key === 'r') return 'recovery bank R is written only with acknowledgeRisk';
  return null;
}

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
  readonly staging: StagingForm | 'verbatim';
  readonly keyAfter: string;
  /**
   * The exact bank bytes, only where the device programs exactly what it is sent
   * (the 2014 plain chain). The encrypting forms re-encrypt, so this is null there.
   */
  readonly expectedStored: Uint8Array | null;
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
  if (input.bytes.length === 0) throw slotRefused('the input is empty');
  const bankBytes = Math.min(entry.length, SLOT_BYTES);
  const cipher = state.profile.cipher;
  const warnings: string[] = [];

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
    const payload = input.bytes.slice();
    /* What the bank will hold depends on the form the device decodes the bytes
     * with. Only the 2014 plain chain programs them as sent, so only there are
     * the stored bytes predicted; the encrypting forms re-encrypt, and what they
     * decrypt to is what can be checked (`predictRawPlain`). */
    body = {
      payload,
      expectedPlain:
        entry.staging === null
          ? null
          : predictRawPlain(entry.staging, payload, { keyA: state.keyTable?.keyA ?? null }, cipher),
      staging: 'verbatim',
      keyAfter: 'as given (raw)',
      expectedStored: entry.staging === 'plain' ? bankImageOf(payload, bankBytes) : null,
    };
    warnings.push(
      'Raw payload: sent exactly as given. This page does not check that it is bootable.',
    );
    if (entry.staging === null) {
      warnings.push(
        'This build names no staging form for the slot, so the bootloader checks cannot be stated.',
      );
    } else {
      if (entry.staging !== 'plain') {
        warnings.push(
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
    const staged = stageImage(report, slot, entry.staging, input, cipher);
    body = {
      payload: staged.staged.payload,
      /* The stamped image is what the builder made the bank hold, after the length
       * stamp and the acceptance balance; the device stores it under its own key. */
      expectedPlain: staged.staged.stamped,
      staging: entry.staging,
      keyAfter: staged.keyAfter,
      expectedStored: staged.expectedStored(bankBytes),
    };
    if (staged.rekeyRisk) {
      warnings.push(
        `${entry.name} already holds an image the bootloader cannot take. This write lands in the same state.`,
      );
    }
  }

  if (body.payload.length > bankBytes) {
    throw slotRefused(`the payload is ${hex(body.payload.length)} B, past the ${entry.name} bank`);
  }

  if (key === 'r') {
    warnings.push(
      'Recovery bank R: writing it needs acknowledgeRisk. Nothing here checks that the camera boots afterwards.',
    );
  }
  const risk = ackNeeded(report, key);
  if (risk !== null && key !== 'r') {
    warnings.push(
      `${risk}: writing it needs acknowledgeRisk, and the camera runs whatever it holds after the next power cycle.`,
    );
  }
  for (const note of [...plan.notes, ...entry.notes]) warnings.push(`Note: ${note}`);

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
    expectedPlain: body.expectedPlain,
    compare,
    warnings,
    serial: state.serial,
    firmwareVersion: state.version,
  };
}

/** What `stageImage` decides for a decrypted image, in the form the bank needs. */
interface StagedImage {
  readonly staged: StagedBytes;
  readonly keyAfter: string;
  /** The bank-sized bytes the bank will hold, when they are predictable. */
  expectedStored(bankBytes: number): Uint8Array | null;
  readonly rekeyRisk: boolean;
}

function stageImage(
  report: SlotsReport,
  slot: SlotState,
  staging: StagingForm,
  input: SlotFlashInput,
  cipher: CipherProfile,
): StagedImage {
  if (staging === 'key-a-ciphertext') {
    const { state } = report;
    if (!state.canFlash) {
      throw slotRefused(
        `this camera cannot be written from here: ${state.flashBlockedBy.length > 0 ? state.flashBlockedBy.join('; ') : 'read the device info first'}`,
        { blockedBy: state.flashBlockedBy },
      );
    }
    const keyTable = state.keyTable;
    if (keyTable === null) {
      throw slotRefused(
        "the analysis does not name this camera's Key A, so the bank cannot be encrypted for it",
      );
    }
    const mine = retargetImageKeys(input.bytes, input.fileName, keyTable);
    const staged = buildKeyAPayload(
      mine,
      keyTable.keyA,
      footerTemplateFor(report, slot),
      state.profile,
    );
    return {
      staged,
      keyAfter: "this camera's Key A",
      /* The device decrypts with Key A and re-encrypts under its store key, so
       * the bytes it keeps are not the bytes it was sent: nothing to predict. */
      expectedStored: () => null,
      rekeyRisk: slot.present && slot.accepts && slot.footerOk && !slot.bootable,
    };
  }
  if (staging === 'slot-keystream-ciphertext') {
    const staged = buildSlotKeystreamPayload(input.bytes, cipher);
    return {
      staged,
      keyAfter: 'the stage key (key block 0 of the image)',
      /* The 2016 device decrypts with the stage key and stores the image under its
       * own store key (key block 1 of the pair), so the staged bytes are not what
       * the bank keeps. Measured on the Compact PRO 1.0.3.0: a bank written with its
       * own image reads back byte-identical to before, and the bytes differ from the
       * payload. The bank is checked as the plain image it decrypts to instead. */
      expectedStored: () => null,
      rekeyRisk: false,
    };
  }
  const staged = buildPlainPayload(input.bytes, cipher);
  return {
    staged,
    keyAfter: 'none (plaintext chain)',
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
 * Arm the bank's write window, stage the payload, commit it, and (by default)
 * read the bank back and compare. Nothing is sent before every check here has
 * passed; the risk acknowledgement is checked first of all.
 */
export async function flashSlot(
  ctx: WorkflowContext,
  report: SlotsReport,
  plan: SlotFlashPlan,
  options: FlashSlotOptions,
): Promise<FlashSlotResult> {
  const entry = entryFor(report, plan.key);
  const write: WindowEntry = writeWindowOf(entry);
  assertPlanIsCurrent(report, plan, entry);

  const risk = ackNeeded(report, plan.key);
  if (risk !== null && !options.acknowledgeRisk) {
    throw slotRefused(`${risk}. Writing it needs acknowledgeRisk: true. Nothing was sent.`, {
      key: plan.key,
    });
  }
  if (plan.staging === 'key-a-ciphertext' && !report.state.canFlash) {
    throw slotRefused(
      'the analysis says this camera cannot be written from here. Nothing was written.',
      { blockedBy: report.state.flashBlockedBy },
    );
  }

  const { reporter } = ctx;
  reporter.log(
    `${entry.name}: writing ${String(plan.payload.length)} B (${plan.kind}, ${plan.staging}) — ` +
      `checksum ${hexUp(plan.sum16, 4)}`,
    'warn',
  );
  const commitStatus = await stageAndCommit(ctx, entry, write, plan.payload, plan.sum16);

  const notes: string[] = [
    `committed ${String(plan.payload.length)} B to ${entry.name} at ${hexUp(entry.address)} ` +
      `(${plan.staging}); commit status ${hex(commitStatus)}`,
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
        { stored: plan.expectedStored, plain: plan.expectedPlain ?? null },
        report.state.profile.cipher,
        plan.kind,
      );
      verified = verdict.verified;
      notes.push(...verdict.notes);
    }
  } else {
    notes.push('verify is off: the bank was not read back');
  }

  reporter.log('NOW UNPLUG AND REPLUG THE CAMERA, then read the device info again.', 'warn');
  reporter.progress(1, 1, 'Written. Unplug and replug, then re-read the device info.');

  return { key: plan.key, commitStatus, verified, after, notes };
}
