/* ====================================================================
 * A family's detection evidence, as messages.
 *
 * Each profile's `detect` says why it scored as it did. The CLI, the logs, the archive README and the
 * copyable camera report print `reasons`, the English; the page shows `reasonMessages`, the same sentences
 * as messages (core:detect.*), in the reader's language. Each profile keeps its sentences in one exported
 * object beside its `detect` (MODERN_EVIDENCE, ...), so the page's drift test reaches every one.
 * ==================================================================== */

import { coreMessage, recordedParam, type CoreMessage } from '../message.js';
import type { DetectionVerdict, DeviceEvidence, ProfileMatch } from './types.js';
import { versionSource } from './version.js';

/** A verdict whose evidence is messages. */
export type MessageVerdict = DetectionVerdict & { readonly reasonMessages: readonly CoreMessage[] };

/** A verdict from its evidence: `reasons` is the messages' English. */
export function verdictOf(score: number, reasons: readonly CoreMessage[]): MessageVerdict {
  return { score, reasons: reasons.map((reason) => reason.text), reasonMessages: reasons };
}

export const VERSION_SAID = {
  dump: coreMessage('detect.source.header', {}, 'the image header says'),
  camera: coreMessage('detect.source.camera', {}, 'the camera reports'),
} as const;

/** Who named the version, as a reason starts: "the image header says" or "the camera reports". */
export function versionSaid(evidence: DeviceEvidence): CoreMessage {
  return versionSource(evidence) === 'dump' ? VERSION_SAID.dump : VERSION_SAID.camera;
}

/** Shared by modern-4x and legacy-auth, which say it the same way. */
export const PLAIN_ARM_NOT_IN_FORCE = coreMessage(
  'detect.plainArmedNotInForce',
  {},
  'a plain 2-byte BeginFirmwareUpgrade armed a protected bank, so the authenticated read channel is not in force',
);

/**
 * A match's evidence for the page: each reason's message while it still says that reason, else the
 * English (a match a caller built, or one whose reasons it replaced).
 */
export function evidenceMessages(
  match: Pick<ProfileMatch, 'reasons' | 'reasonMessages'>,
): (CoreMessage | string)[] {
  return match.reasons.map((reason, index) => recordedParam(match.reasonMessages?.[index], reason));
}
