/* ==================================================================== *
 * The words a bank write's plan says before the confirm: its warnings and this write's own notes, as
 * messages (code + params, ../message.ts). `prepareSlotFlash` (write.ts) says them; the CLI prints their
 * English, the page renders their codes. Each builder takes only plain values, so a test can make every
 * code without building a payload.
 * ==================================================================== */

import { coreMessage, paramText, type CoreMessage, type CoreParam } from '../message.js';
import { FF_1308_VERSION } from './capability-family.js';
import { FF_BOOT_UNTESTED } from './capability-notes.js';

/** `FF_BOOT_UNTESTED` as a message. */
export const FF_BOOT_UNTESTED_MESSAGE: CoreMessage = coreMessage(
  'notes.ffBootUntested',
  {},
  FF_BOOT_UNTESTED,
);

/** An FF image on a camera that reports another version than 1.3.0.8. */
export function ffOtherVersionWarning(): CoreMessage {
  return coreMessage(
    'write.ff.otherVersion',
    { version: FF_1308_VERSION },
    `The 16 Hz FF image is sent in the form only the 16 Hz ${FF_1308_VERSION} build reads. This camera ` +
      'writes a bank without checking the image (its firmware source says so, and a 1.3.0.0 Compact ' +
      'did so when tried), so it is expected to write the bytes as they are sent: the bank then holds ' +
      'the image in a form this camera cannot start.',
  );
}

export function ffUntestedWarning(): CoreMessage {
  return coreMessage(
    'write.ff.untested',
    { untested: FF_BOOT_UNTESTED_MESSAGE },
    `${FF_BOOT_UNTESTED} Nothing here claims the camera starts it.`,
  );
}

/** `why`: how the camera's answers name its build (running.ts). */
export function ffRunsFastNote(why: CoreParam): CoreMessage {
  return coreMessage(
    'write.ff.runsFast',
    { why },
    `The camera's own answers say it runs the 16 Hz FF build: ${paramText(why)}.`,
  );
}

/** What the 8 Hz 1.3.0.8 build does with an FF payload, said after "it". */
export function plainChainOutcomeMessage(plainTakes: boolean): CoreMessage {
  if (plainTakes) {
    return coreMessage(
      'write.ff.outcome.takes',
      {},
      'checks a payload before it erases a bank, and this payload passes that check, so it may write ' +
        'these bytes as they are, in a form its bootloader cannot start: the bank may not start (not ' +
        'tried; the backup saved before the write puts it back)',
    );
  }
  return coreMessage(
    'write.ff.outcome.refuses',
    {},
    'checks a payload before it erases a bank, and this payload fails that check, so it is expected to ' +
      'refuse this write before it writes anything (a camera running that build refused an earlier form ' +
      'of this image the same way)',
  );
}

export function ffRunsSlowWarning(why: CoreParam, plainTakes: boolean): CoreMessage {
  const outcome = plainChainOutcomeMessage(plainTakes);
  return coreMessage(
    'write.ff.runsSlow',
    { version: FF_1308_VERSION, why, outcome },
    `The camera runs the 8 Hz ${FF_1308_VERSION} build: ${paramText(why)}. That build ` +
      `${outcome.text}.`,
  );
}

export function ffBuildUnknownWarning(why: CoreParam, plainTakes: boolean): CoreMessage {
  const outcome = plainChainOutcomeMessage(plainTakes);
  return coreMessage(
    'write.ff.buildUnknown',
    { version: FF_1308_VERSION, why, outcome },
    `The camera's own answers do not say which ${FF_1308_VERSION} build it runs: ${paramText(why)}. If it ` +
      'runs the 16 Hz FF build, it takes this payload. If it runs the 8 Hz build, that build ' +
      `${outcome.text}.`,
  );
}

export const RAW_AS_GIVEN_WARNING: CoreMessage = coreMessage(
  'write.raw.asGiven',
  {},
  'Raw payload: sent exactly as given. Nothing here checks that it is bootable.',
);

export const FF_STAGED_FORM_NOTE: CoreMessage = coreMessage(
  'write.raw.ffStagedForm',
  {},
  'This payload is the 1.3.0.8 FF staged form (the image XOR key block 0, word sum 0xFFFF). ' +
    'The camera stores the image under Key B, so the read-back is checked against those bytes.',
);

export const NO_STAGING_FORM_WARNING: CoreMessage = coreMessage(
  'write.raw.noStaging',
  {},
  'This build names no staging form for the slot, so the bootloader checks cannot be stated.',
);

export const REENCRYPTS_NOTE: CoreMessage = coreMessage(
  'write.raw.reencrypts',
  {},
  'The device decodes this payload and re-encrypts what it keeps, so the stored bytes are ' +
    'not predicted. The read-back is checked as the image it decrypts to, where that can be said.',
);

/** `failure`: one of the bootloader's checks the payload fails (write-image.ts). */
export function bootloaderRejectsWarning(failure: CoreParam): CoreMessage {
  return coreMessage(
    'write.raw.bootloaderRejects',
    { failure },
    `The bootloader would reject this payload: ${paramText(failure)}.`,
  );
}

export const STAGE_KEY_UNCHECKED_WARNING: CoreMessage = coreMessage(
  'write.raw.stageKeyUnchecked',
  {},
  "The 2016 stage key (key block 0) is not in raw bytes, so this payload's decrypted " +
    'word sum is not checked here.',
);

/** `name`: the plan's name for the bank (`bankNameParam`). */
export function rekeyRiskWarning(name: CoreParam): CoreMessage {
  return coreMessage(
    'write.image.rekeyRisk',
    { name },
    `${paramText(name)} already holds an image the bootloader cannot take. This write lands in the same state.`,
  );
}

export const RECOVERY_ACK_WARNING: CoreMessage = coreMessage(
  'write.ack.recovery',
  {},
  'Recovery R: writing it asks you to acknowledge the risk. Nothing here checks that the camera boots afterwards.',
);

/** `risk`: why the write needs the acknowledgement (`ackNeeded`). */
export function riskAckWarning(risk: CoreParam): CoreMessage {
  return coreMessage(
    'write.ack.risk',
    { risk },
    `${paramText(risk)}: writing it asks you to acknowledge the risk, and the camera runs whatever it holds after the next power cycle.`,
  );
}

export const BOOT_UNNAMED_RISK: CoreMessage = coreMessage(
  'write.ack.bootUnnamed',
  {},
  'the booted bank could not be named, so this one is treated as the booted one',
);

export const RECOVERY_FALLBACK_RISK: CoreMessage = coreMessage(
  'write.ack.recoveryFallback',
  {},
  'Recovery R is the last-resort copy the bootloader falls back to',
);
