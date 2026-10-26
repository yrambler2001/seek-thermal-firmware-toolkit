/**
 * Which firmware family a run acts under: asked of the camera, every time.
 *
 * Nobody picks the family on this page any more. Core answers it itself now:
 * `identifyCamera` reads the version, and only when that build can be read at
 * all asks the three channel questions and ranks the answers. This module is the
 * page's one way in to that. A tab that is for one line of cameras (the 4.x/Nano
 * tab) checks the answer against its own family after this returns, so the
 * camera is still asked and the page still refuses what it does not cover.
 *
 * DETECTION DOES NOT PERMIT. The run that follows still goes through
 * `planForDevice`, which reads the version again and applies `identityGate`
 * before its first arm, so a camera that does not name its build, or one older
 * than 0.8.0.0, is refused whatever the ranking says.
 */

import {
  identifyCamera,
  identityRefusal,
  isSeekError,
  type DetectionResult,
  type FirmwareProfile,
  type LogLevel,
  type PlannedOperation,
  type SeekDevice,
  type SeekErrorCode,
} from '@seek-fw/core';
import { hintFor } from './hints';

/** What a run acts under, and what the camera said to decide it. */
export interface ActingProfile {
  readonly profile: FirmwareProfile;
  /** The ranking the camera's answers produced. */
  readonly detection: DetectionResult;
  /** The version the probe read. */
  readonly firmwareVersion: string | null;
  /** The build date string that came with it. */
  readonly buildString: string | null;
}

type Log = (text: string, level: LogLevel) => void;

/**
 * The probe's line in a run's log: the profile the camera's first answers (its version, the channel questions,
 * the notes logged just above) point to, and the probe's score. It is taken before any bank is read, so it is
 * not the score the Info tab's Profile panel shows, which is taken again once the banks are read (core's
 * `detectedReportOf`). On a Compact PRO 1.0.3.0 the two were 0.85 and 0.98, shown unlabelled as "confidence"
 * and "score" (TESTING.md 42.85 O5, 42.86).
 */
export function probeLine(detection: DetectionResult): string {
  const best = detection.best;
  return (
    `probe: ${best.profile.name} (${best.profile.id}), score ${best.score.toFixed(2)} from the answers ` +
    `above, before any bank is read` +
    (detection.ambiguous ? ' — the evidence did not settle it, so this is a guess' : '')
  );
}

/**
 * Asks the camera which family it is. When its identity gate stays shut — no
 * version came back, or the build predates the dump protocol — this throws the
 * same `SeekError` `planForDevice` would have thrown one step later, so the
 * refusal the user reads names the reason and nothing is armed either way.
 */
export async function chooseActingProfile(
  device: SeekDevice,
  operation: PlannedOperation,
  log: Log,
): Promise<ActingProfile> {
  log('asking the camera which firmware it runs ...', 'detail');
  const identification = await identifyCamera(device);
  for (const note of identification.probe.notes) log(`  ${note}`, 'detail');

  const { detection, gate, probe } = identification;
  const best = detection.best;
  if (!gate.permitsArming) {
    throw identityRefusal(gate, probe.firmwareVersion, operation, best.profile.id);
  }
  log(probeLine(detection), detection.ambiguous ? 'warn' : 'ok');
  return {
    profile: best.profile,
    detection,
    firmwareVersion: probe.firmwareVersion,
    buildString: probe.buildString,
  };
}

/** A run the toolkit refused before it read anything, and why, for the page to show. */
export interface Refusal {
  readonly code: Extract<SeekErrorCode, 'device/version-unknown' | 'profile/unsupported'>;
  readonly message: string;
  /** What to do about it, or null when there is nothing honest to suggest. */
  readonly hint: string | null;
}

/**
 * The refusals worth more than a log line: the camera would not say which
 * build it runs, or the build (or the tab's family) cannot do what was asked.
 * Anything else — a USB failure, a cancel — is not a refusal and stays in the
 * transcript, as it always has.
 */
export function refusalOf(error: unknown, userAgent?: string): Refusal | null {
  if (!isSeekError(error)) return null;
  if (error.code !== 'device/version-unknown' && error.code !== 'profile/unsupported') {
    return null;
  }
  return { code: error.code, message: error.message, hint: hintFor(error, userAgent) };
}
