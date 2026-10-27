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
  PRESERVE_DUMP_PATCHED_FILE,
  PRESERVE_RUN_STATE_FILE,
  PRESERVE_VERIFY_FILE,
  preserveCaptureFile,
  preserveStepLabel,
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
  PRESERVE_DUMP_PATCHED_FILE,
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
  PRESERVE_DUMP_PATCHED_FILE,
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
  [PRESERVE_DUMP_PATCHED_FILE]: 'drain',
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
    label: preserveStepLabel('backup'),
    description:
      'Reads the 31 blocks of 64 KiB a stock camera can read, then reads every bank a second ' +
      'time (the two reads must agree byte for byte), gets each bank’s firmware out of what the ' +
      'camera stores (decrypted where it is stored encrypted) and checks it, and works out which ' +
      'bank the camera starts next. This is the run’s only copy of this camera, taken before ' +
      'anything is written.',
  },
  {
    id: 'patch',
    label: preserveStepLabel('patch'),
    description:
      'Offline, no camera. Builds the patch for each bank the run can write: it lets the ' +
      'camera’s read reach the whole 4 MiB flash, and it is written in the form the camera ' +
      'stores it, so only the patch’s own bytes change.',
  },
  {
    id: 'commit',
    label: preserveStepLabel('commit'),
    description:
      'The write. Reads every chosen bank back first and writes nothing unless each still holds ' +
      'what the backup recorded (a write that already landed is never repeated), then writes ' +
      'each one, the bank the camera tries first last. The camera is not restarted here: the ' +
      'next step restarts it.',
  },
  {
    id: 'drain',
    label: preserveStepLabel('drain'),
    description:
      'Restarts the camera so it starts the patched firmware (it is silent for about ten ' +
      'seconds; the page waits and finds it again), checks which bank it started from (a bank ' +
      'without the patch stops the step before anything is read), then reads the whole 4 MiB ' +
      'flash in one read and puts each written bank’s original firmware, from the backup, into ' +
      'the saved image. Nothing is written.',
  },
  {
    id: 'restore',
    label: preserveStepLabel('restore'),
    description:
      'The other write. Writes each written bank’s original firmware back while the patched ' +
      'firmware still runs, then restarts the camera.',
  },
  {
    id: 'verify',
    label: preserveStepLabel('verify'),
    description:
      'After a fresh start, reads the 31 blocks again, every bank among them: 0 differing bytes ' +
      'proves the camera’s flash is byte-identical to the backup. Read-only.',
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
      'Reads everything a stock camera lets out — 31 blocks of 64 KiB — and keeps it as your ' +
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
    label: 'Write & whole-flash read',
    description:
      'Writes a small, temporary patch into the firmware banks chosen in step 02 (by ' +
      'default the bank the camera starts from next), so it can read out all of its flash. ' +
      'Then the camera restarts — press "Connect device" and pick it again when the page asks ' +
      '— and the whole 4 MiB flash is read. Step 04 puts the original firmware back.',
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
