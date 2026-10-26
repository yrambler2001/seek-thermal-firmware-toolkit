/**
 * The preserve wizard's view of the checkpoint-run contract.
 *
 * The contract's types and file names live in `@seek-fw/core`
 * (`preservation/steps.ts`) and are re-exported here under one roof, so the
 * wizard's imports keep pointing at this module. Only UI metadata — the
 * phases, the step list under them, the write sets, the file naming — is
 * declared here.
 *
 * THE IMAGE IS THE CAMERA'S OWN: there is no manual plaintext-image
 * selection anywhere. A run (`version: 3`) reads every bank in the backup
 * step, derives each writable bank's factory plaintext, and says which bank
 * the next start enters; the person then chooses the banks the commit writes
 * (by default that bank). Every derived image is a run artifact
 * (`preservePlainFile(bank)`) like the rest — so the run zip is the only file a
 * run ever needs, here or on a resume.
 *
 * The run file is the ONLY memory a run has: the app holds no browser
 * storage, so closing the tab without the file ends the run.
 */

import type { BankKey, PreserveStepId } from '@seek-fw/core';
import {
  BANK_KEYS,
  PRESERVE_BACKUP_FILE,
  PRESERVE_DUMP_ORIGINAL_FILE,
  PRESERVE_DUMP_POSTWRITE_FILE,
  PRESERVE_RUN_STATE_FILE,
  PRESERVE_VERIFY_FILE,
  preserveCaptureFile,
  preservePatchedFile,
  preservePlainFile,
} from '@seek-fw/core';

export type {
  BankKey,
  CreatePreserveRunOptions,
  CreatedPreserveRun,
  PreserveArtifactLoader,
  PreserveBankChoice,
  PreserveBankRecord,
  PreserveBootFacts,
  PreserveChoiceVerdict,
  PreservePatchSummary,
  PreserveRunState,
  PreserveStepOutcome,
  PreserveStepRecord,
} from '@seek-fw/core';
export type { PreserveStepId } from '@seek-fw/core';

/** The file names a run's checkpoints travel under — re-exported so the
 *  wizard's callers share one set of literals. */
export {
  PRESERVE_BACKUP_FILE,
  PRESERVE_DUMP_ORIGINAL_FILE,
  PRESERVE_DUMP_POSTWRITE_FILE,
  PRESERVE_RUN_STATE_FILE,
  PRESERVE_VERIFY_FILE,
  preserveCaptureFile,
  preservePatchedFile,
  preservePlainFile,
} from '@seek-fw/core';

/** The run-state file, by its name inside the run ZIP. */
export const RUN_STATE_FILE: string = PRESERVE_RUN_STATE_FILE;

/** One checkpoint the run can produce: the backup, each bank's capture,
 *  derived image and patched image, the dumps and the verify's re-read. */
export type CheckpointName = string;

/** The binary checkpoints a run can produce, in step order — each bank's
 *  derived factory plaintext among them, from the backup step onward, and the
 *  verify's re-read last. */
export const CHECKPOINT_FILES: readonly CheckpointName[] = [
  PRESERVE_BACKUP_FILE,
  ...BANK_KEYS.flatMap((bank: BankKey) => [preserveCaptureFile(bank), preservePlainFile(bank)]),
  ...BANK_KEYS.map(preservePatchedFile),
  PRESERVE_DUMP_POSTWRITE_FILE,
  PRESERVE_DUMP_ORIGINAL_FILE,
  PRESERVE_VERIFY_FILE,
];

/** The step that writes each checkpoint — which decides its folder in the
 *  run file. */
export const CHECKPOINT_STEP: Readonly<Record<CheckpointName, PreserveStepId>> = {
  [PRESERVE_BACKUP_FILE]: 'backup',
  ...Object.fromEntries(
    BANK_KEYS.flatMap((bank: BankKey) => [
      [preserveCaptureFile(bank), 'backup'],
      [preservePlainFile(bank), 'backup'],
      [preservePatchedFile(bank), 'patch'],
    ]),
  ),
  [PRESERVE_DUMP_POSTWRITE_FILE]: 'drain',
  [PRESERVE_DUMP_ORIGINAL_FILE]: 'drain',
  [PRESERVE_VERIFY_FILE]: 'verify',
};

/** Whether a name is one of the run's checkpoints. */
export function isCheckpointName(name: string): boolean {
  return CHECKPOINT_FILES.includes(name);
}

/** Which steps put bytes on the wire's write path (the "do not unplug" set). */
export const WRITES_FLASH: ReadonlySet<PreserveStepId> = new Set<PreserveStepId>([
  'commit',
  'restore',
]);

/** Which steps can only run through the danger confirmation. */
export const NEEDS_CONFIRM: ReadonlySet<PreserveStepId> = new Set<PreserveStepId>([
  'commit',
  'restore',
]);

export interface PreserveStepMeta {
  readonly id: PreserveStepId;
  readonly label: string;
  readonly description: string;
}

/** The six steps in run order — the order `nextStep` advances through, and
 *  the order core's gate insists on. */
export const PRESERVE_STEPS: readonly PreserveStepMeta[] = [
  {
    id: 'backup',
    label: 'Back up the reachable flash',
    description:
      'Reads all 31 windows a stock camera serves, 64 KiB each, then reads every bank a ' +
      'SECOND time, requires the two reads of each to agree byte for byte, derives each ' +
      'bank’s factory plaintext and gates it, and works out which bank the next start ' +
      'enters — the dump of the available regions, taken BEFORE anything is written. This is ' +
      "the run's only copy of this camera.",
  },
  {
    id: 'patch',
    label: 'Build the patched image',
    description:
      'Offline. Applies the instruction edits and the checksum rebalance to each writable ' +
      'bank’s derived factory plaintext and files the results as checkpoints. No camera traffic.',
  },
  {
    id: 'commit',
    label: 'Commit the patch into the chosen banks',
    description:
      'THE WRITE. Reads every chosen bank back, refuses unless each still holds exactly what ' +
      'the backup recorded, stages the conjugated patch (image length only) and commits each ' +
      '— the bank the camera tries first last. No reset in this session — the reset belongs ' +
      'to the drain step.',
  },
  {
    id: 'drain',
    label: 'Dump the whole part',
    description:
      'Resets the camera so it boots the patched image (it stays silent for roughly ten ' +
      'seconds while it boots — the wizard waits and re-adopts it when it re-enumerates), ' +
      'checks which bank it started from — a bank without the patch stops the step before ' +
      'anything is read — then drains the whole 4 MiB part through the widened window and ' +
      'swaps every written bank back from the backup to build the delivered, ' +
      'original-content image. Nothing is written.',
  },
  {
    id: 'restore',
    label: 'Restore the original banks',
    description:
      'THE OTHER WRITE. Stages each written bank’s original content back while the patched ' +
      'image still runs from SRAM, then resets.',
  },
  {
    id: 'verify',
    label: 'Verify against the backup',
    description:
      'Re-reads the 31 windows on a fresh boot and requires zero differing bytes against the ' +
      'backup taken before the first write. Read-only.',
  },
];

export function stepMeta(step: PreserveStepId): PreserveStepMeta {
  const found = PRESERVE_STEPS.find((entry) => entry.id === step);
  if (found === undefined) throw new Error(`no such preserve step: ${step}`);
  return found;
}

/* ---- the three phases --------------------------------------------------- */

/** The wizard's rows. A phase is one runner task that runs its core steps
 *  back-to-back, and one run-file download at its end. */
export type PreservePhaseId = 'read-build' | 'patch-dump' | 'restore-verify';

export interface PreservePhaseMeta {
  readonly id: PreservePhaseId;
  readonly label: string;
  readonly description: string;
  /** The core steps the phase runs, in order, in one task. */
  readonly steps: readonly PreserveStepId[];
  /** The camera leaves the bus mid-phase by design (the drain's or the
   *  restore's wire-89 reset): a disconnect there is the reset, not a swap. */
  readonly resetsCamera: boolean;
  /** The phase ends by asking for an unplug and replug, and waits to see it,
   *  when the patched image's arm tail does not reset the whole cursor
   *  (`drainLeavesReaderReadable`: neither the fifth site nor a build tail
   *  that already does): such a part keeps a dead reader after the drain that
   *  the wire reboot does not revive (TESTING.md secs. 28.4, 35, 36). Only
   *  when the phase's last step ran in that invocation. */
  readonly replugAfter: boolean;
}

export const PRESERVE_PHASES: readonly PreservePhaseMeta[] = [
  {
    id: 'read-build',
    label: 'Read & build',
    description:
      'Reads everything a normal dump can reach — 31 blocks of 64 KiB — and keeps it as your ' +
      'backup, reads each firmware bank a second time, works out which bank the camera ' +
      'starts from next time, and prepares the small patch the next step writes. Nothing is ' +
      'written to the camera. Usually under a minute. If the camera needs a restart along the ' +
      'way, the page asks you to press "Connect device" and pick it again — that is expected.',
    steps: ['backup', 'patch'],
    resetsCamera: true,
    replugAfter: false,
  },
  {
    id: 'patch-dump',
    label: 'Patch & dump',
    description:
      'Writes a small, temporary patch into the firmware banks chosen in step 02 (by ' +
      'default the bank the camera starts from next), so it can read out all of its flash. ' +
      'Then the camera restarts — press "Connect device" and pick it again when the page asks ' +
      '— and the whole 4 MiB is dumped. Step 04 puts the original firmware back.',
    steps: ['commit', 'drain'],
    resetsCamera: true,
    replugAfter: true,
  },
  {
    id: 'restore-verify',
    label: 'Restore & verify',
    description:
      'Writes your original firmware back, restarts the camera (press "Connect device" and ' +
      'pick it again when asked), then reads everything once more to check it matches the ' +
      'backup byte for byte.',
    steps: ['restore', 'verify'],
    resetsCamera: true,
    replugAfter: false,
  },
];

export function phaseMeta(phase: PreservePhaseId): PreservePhaseMeta {
  const found = PRESERVE_PHASES.find((entry) => entry.id === phase);
  if (found === undefined) throw new Error(`no such preserve phase: ${phase}`);
  return found;
}

/** The phases whose remaining work expects the camera to drop off the bus and
 *  re-enumerate mid-phase — the disconnect there is the reset working, not a
 *  device swap. */
export const RESETS_CAMERA: ReadonlySet<PreservePhaseId> = new Set<PreservePhaseId>(
  PRESERVE_PHASES.filter((phase) => phase.resetsCamera).map((phase) => phase.id),
);

/** The phase that runs a step. */
export function phaseOfStep(step: PreserveStepId): PreservePhaseId {
  const found = PRESERVE_PHASES.find((meta) => meta.steps.includes(step));
  if (found === undefined) throw new Error(`no phase runs the step ${step}`);
  return found.id;
}

/** The run file's folders: one per wizard step, numbered as the page numbers
 *  them (Connect is step 01), each holding what that step produced. */
export const PHASE_FOLDER: Readonly<Record<PreservePhaseId, string>> = {
  'read-build': '02-read-build',
  'patch-dump': '03-patch-dump',
  'restore-verify': '04-restore-verify',
};

/** A step's name in the run file's name — what the run had got to. */
export const STEP_FILE_LABEL: Readonly<Record<PreserveStepId, string>> = {
  backup: 'backup',
  patch: 'patch-built',
  commit: 'patch-written',
  drain: 'full-dump',
  restore: 'restored',
  verify: 'verified',
};

/** `2026-10-04T00:18:44.537Z` -> `2026-10-04T00-18-44Z`, the run id's own
 *  stamp shape (no colons, so every file system takes it). */
export function fileStamp(at: Date): string {
  return at
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z')
    .replaceAll(':', '-');
}

/**
 * `<runId>-<saved at>-<what the run had got to>.zip` — the run id already
 * carries the start (`preserve-2026-10-04T00-14-42Z`), so the name reads
 * start, save time, step: `preserve-2026-10-04T00-14-42Z-2026-10-04T00-18-44Z-verified.zip`.
 */
export function runFileName(runId: string, at: Date, label: string): string {
  return `${runId}-${fileStamp(at)}-${label}.zip`;
}
