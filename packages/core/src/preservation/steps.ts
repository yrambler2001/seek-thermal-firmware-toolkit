/**
 * The preservation pipeline as SIX RESUMABLE STEPS.
 *
 * `pipeline.ts` runs the whole operation in one call with cross-phase state in
 * locals — right for a process that stays alive, wrong for everything else: a
 * run that dies after the commit takes the restore source with it if the
 * backup only reaches disk at the end. This module splits the same operation
 * at the joints a crash actually leaves behind, so each step ends with
 * everything it produced in the caller's hands:
 *
 *   backup  — the 31 stock windows; the active-slot word (the bank the camera
 *             reports it entered); then EVERY bank read twice under the serve
 *             budget (the sweep's own row at the bank address, then ONE fresh
 *             arm on its own admitted boot). The bank the camera runs (the
 *             entered one, or the boot word's first) is the run's anchor: its
 *             reads go through the verified-arm ladder (a swallowed arm is
 *             re-armed once; garbage twice refuses with the power-cycle remedy;
 *             two plausible reads that differ stay a refusal), its factory
 *             plaintext is DERIVED (`solve.ts`: identity on the plain chain,
 *             the family's keystream solver on a cipher family) and gated, and
 *             its build is the run's. Every other bank is read the same two
 *             ways and derived as well; one that cannot be is recorded with the
 *             reason, never refused over. From those reads it records the boot
 *             facts (`banks.ts`: the word, each bank's check, the bank the next
 *             start enters) and the banks the person's choice writes. The
 *             standard dump archive is built offline from the assembled backup.
 *             Read-only. THIS is the pre-flash dump of every region the stock
 *             plan can read, handed over before anything write-shaped can run.
 *             A failed backup re-runs only past a power-cycle acknowledgement
 *             (`powerCycled`), because a retry against the same boot reads a
 *             spent reader.
 *   patch   — offline, no device: buildV1Patch from each writable bank's
 *             factory plaintext, refusing on every before-byte gate.
 *   commit  — the conjugated in-place patch into every chosen bank, staged
 *             image-length-only, committed on a session that NEVER resets
 *             (its post-commit flash state is the ground truth). Reads every
 *             chosen bank's head back BEFORE writing any: a bank that already
 *             holds the patch is not written again, a bank that changed any
 *             other way refuses the step before anything is written. Not
 *             replayed blind.
 *   drain   — the wire-89 reset on its own first session; then, on the first
 *             session after it, the active-slot word: a start that entered a
 *             bank this run did not patch stops the step before anything is
 *             armed. Then the whole 4 MiB through the widened window, DRAIN
 *             FIRST on its own single arm (the per-arm budget is consumed in
 *             asks; anything read before the drain shortens its reach —
 *             TESTING.md sec. 23.3).
 *   restore — every written bank's original content staged back, then one
 *             reset. A bank that already holds its original (a previous
 *             restore landed) is not written again.
 *   verify  — a fresh boot, the 31 windows re-read (every bank among them), 0
 *             differing bytes against the backup, and the run's final numbers.
 *
 * ---- the contract ---------------------------------------------------------
 *
 * Core never touches the filesystem. Each step RETURNS its bytes as
 * `Artifact[]`; the caller (CLI, web runner) persists them and rewrites the
 * run state after every step. Resume hands the state back in together with a
 * `loadArtifact(name)` callback that serves the checkpoint files — the backup
 * windows, each bank's capture, each bank's derived factory plaintext — from
 * wherever the caller keeps them. A step that cannot load what an earlier step
 * produced refuses with the reason, so `--from-step` cannot silently run
 * against a torn run directory.
 *
 * The state document is the whole cross-step world: everything a later step
 * needs (the boot facts, the banks, the chosen banks, the patch summaries, the
 * sha256 of every artifact a step produced) lives in it, so a resumed process
 * rebuilds nothing from guesses. It is JSON-shaped by construction:
 * `JSON.parse(JSON.stringify(state))` round-trips it — exactly how the CLI
 * persists it.
 * ==================================================================== */

import {
  buildOfflineDecryptManifest,
  makeOfflineDecryptReadme,
  manifestToJson,
} from '../archive/index.js';
import {
  bytesToHex,
  equalBytes,
  hexToBytes,
  hexUp,
  isoStamp,
  sha256hex,
  utf8,
  viewOf,
} from '../bytes.js';
import { CancelledError, SeekError } from '../errors.js';
import type { Artifact, Reporter } from '../events.js';
import { HEADER_OFFSET, HEADER_SIZE, IMAGE_MAGIC, parseImageHeader } from '../image/header.js';
import { FLASH_BASE, FLASH_SIZE } from '../profiles/modern-4x.js';
import { legacyReaderOp } from '../profiles/legacy-auth.js';
import { bankOfActiveSlotWord, bankWordsOf, lockedBootOrder } from '../profiles/locked-boot.js';
import { getProfile } from '../profiles/registry.js';
import type { WindowEntry } from '../profiles/types.js';
import type { SeekDevice } from '../protocol/client.js';
import { decryptDump } from '../workflows/decrypt.js';
import { profileInfoOf } from '../workflows/types.js';
import {
  BANK_KEYS,
  bankHoldsOf,
  commitOrderOf,
  preserveBootFactsOf,
  preserveChoiceOf,
  restoreOrderOf,
  warmBootMarkOf,
  type BankHolds,
  type PreserveBankChoice,
  type PreserveBankRead,
  type PreserveBankRecord,
  type PreserveBootFacts,
} from './banks.js';
import {
  PostResetWedgeError,
  PROBE_OFFSET,
  READ_CHUNK,
  STAGE_CHUNK,
  backupSlice,
  backupWindows,
  commitToBank,
  drainExact,
  drainWholePart,
  isWireStall,
  openProbedSession,
  postProcessDump,
  probeWidenedWindow,
  readVersion,
  resetDevice,
  rotatedDrainBase,
  unrotateDump,
  verifyAgainstBackup,
  type BackupResult,
  type SessionOpener,
  type WindowBytes,
} from './pipeline.js';
import {
  buildV1Patch,
  clearsArmCursor,
  conjugateCapture,
  outsideLineRefusal,
  preWideningRefusal,
  stagedAcceptanceSum,
  stagedFormOf,
  type CommitRouteId,
  type DrainCapability,
  type PreserveFamilyId,
  type RestoreFormId,
  type StagedFormId,
  type V1Patch,
} from './patch.js';
import { solvePlainFromCapture } from './solve.js';
import {
  BACKUP_WINDOW_COUNT,
  BANKS,
  BOOT_CONFIG_ADDRESS,
  BOOT_CONFIG_BYTES,
  WINDOW_BYTES,
  bankWindow,
  doubleReadWindows,
  isStaleDescriptorWord,
  preservationWindows,
  spentReaderRefusal,
  type BankKey,
} from './windows.js';

/* ==================================================================== *
 * the run state — the checkpoint document
 * ==================================================================== */

/** The six steps, in run order. */
export type PreserveStepId = 'backup' | 'patch' | 'commit' | 'drain' | 'restore' | 'verify';

export const PRESERVE_STEP_IDS: readonly PreserveStepId[] = [
  'backup',
  'patch',
  'commit',
  'drain',
  'restore',
  'verify',
];

export function isPreserveStepId(value: string): value is PreserveStepId {
  return (PRESERVE_STEP_IDS as readonly string[]).includes(value);
}

/** The step that follows `step`; the run is `done` after verify. */
export function nextStepAfter(step: PreserveStepId): PreserveStepId | 'done' {
  const next = PRESERVE_STEP_IDS[PRESERVE_STEP_IDS.indexOf(step) + 1];
  return next ?? 'done';
}

/** One step's checkpoint record. `failed` keeps the error text, and the step
 *  can be re-run — unlike a `done` one, which refuses. */
export interface PreserveStepRecord {
  readonly status: 'done' | 'failed';
  readonly startedAt?: string;
  readonly finishedAt?: string;
  readonly error?: string;
  readonly notes?: string;
  /** sha256 of every artifact the step emitted, by artifact name — what a
   *  later step (and `--print-state`) checks the run directory against. */
  readonly artifactShas?: Record<string, string>;
  /** Set on a FAILED backup record: the camera must be power-cycled before
   *  this step re-runs (a retry against the same boot can serve stale or
   *  blank window bytes — the 2026-10-02 incident). `describeStepGate`
   *  refuses a backup re-run until the caller asserts the power cycle
   *  (`powerCycled`), which core itself cannot observe. */
  readonly powerCycleRequired?: boolean;
  /** Set on a DONE restore record whose commit landed but whose reboot the
   *  host refused: the banks hold the original, and the camera runs the
   *  patched image from RAM until it is power-cycled. The verify then reads
   *  that boot, and says so. */
  readonly rebootRefused?: boolean;
}

/** One bank's patch, as the run state carries it after the patch step. */
export interface PreservePatchSummary {
  readonly sites: {
    readonly name: string;
    readonly offset: number;
    readonly before: number[];
    readonly after: number[];
  }[];
  readonly rebalanceWord: number;
  readonly stagedLength: number;
  readonly chunkCount: number;
  readonly patchedSha256: string;
  /** How many bytes the patched image differs from the factory one in — the
   *  bank's whole enumerated change, rebalance word included. */
  readonly diffCount: number;
  /** The patched image's arm tail zeroes the reader's whole cursor word — by
   *  a site (the 2014 trio builds' fifth) or by the build's own tail (the
   *  2016 line): the drain leaves the reader readable on its own boot. */
  readonly armResetsCursor: boolean;
}

/**
 * Whether the drain leaves the camera's reader readable on its own boot, so
 * the restore can read without a power cycle: every chosen bank's patch
 * zeroes the whole cursor word in its arm tail (TESTING.md secs. 35.4, 36).
 */
export function drainLeavesReaderReadable(
  state: Pick<PreserveRunState, 'targets' | 'banks'>,
): boolean {
  const targets = state.targets;
  if (targets === undefined || targets.length === 0 || state.banks === undefined) return false;
  return targets.every((key) => {
    const patch = state.banks?.[key].patch;
    return patch !== undefined && (patch.armResetsCursor || clearsArmCursor(patch.sites));
  });
}

export interface PreserveRunState {
  /** 3 — the current schema: the backup reads every bank and records which
   *  bank the next start enters, and the commit writes the banks the person
   *  chose (`targets`). No older schema loads. */
  version: 3;
  /** Timestamped (`preserve-2026-10-01T09-30-00Z`); names nothing on disk. */
  runId: string;
  createdAt: string;
  nextStep: PreserveStepId | 'done';
  steps: Partial<Record<PreserveStepId, PreserveStepRecord>>;
  /** What the person chose: the bank the next start enters (the default), one bank, or every bank. */
  choice: PreserveBankChoice;
  /** The banks the commit writes and the restore puts back, resolved from
   *  `choice` once the backup has read the banks. Undefined while the choice
   *  cannot be resolved (the plan says why). Fixed once the commit has run. */
  targets?: readonly BankKey[];
  /** The bank whose image the camera runs at the backup — the one it reports
   *  it entered, else the first the boot word names (the 1.3.0.8 FF build:
   *  recovery R). Its build is the run's build. */
  anchor?: BankKey;
  /** The boot facts the backup read: the word, each bank's check, the bank
   *  the next start enters, and why. */
  boot?: PreserveBootFacts;
  /** Every bank as the backup read it, and its patch after the patch step. */
  banks?: Readonly<Record<BankKey, PreserveBankRecord>>;
  /** The cipher/acceptance family of the run's build. */
  buildFamily?: PreserveFamilyId;
  /** The version the camera reported at the backup, which the anchor's
   *  derived image agreed with. Every later step requires the camera to
   *  still report it. */
  expectedVersion?: string;
  /** The run's build id in the patch table (`compact-1.3.0.8-8hz`, ...). */
  buildId?: string;
  /** The run's build, as the plan print names it. */
  buildLabel?: string;
  /** How the wire-80 staged bytes relate to the patched plaintext. */
  stagedForm?: StagedFormId;
  /** How (and whether) the restore step can put a bank back through the
   *  running app's own commit path ('none' on the FF build). */
  restoreForm?: RestoreFormId;
  /** Which bank the build's patch may be committed into (`recovery-only` for
   *  the 1.3.0.8-FF build). */
  route?: CommitRouteId;
  /** Why, as text a person can act on (the recovery-slot bootloader fact). */
  routeNote?: string | null;
  /** What the drain step may promise on this build, as measured. */
  capability?: DrainCapability;
  /** The wire-79 read size the drain asks for, in bytes. Default READ_CHUNK
   *  (64 — one EP0 packet, the ask measured exact on silicon, TESTING.md
   *  sec. 28.3); the emulator suites pass 64 explicitly. */
  drainChunk?: number;
  /** The anchor bank's expected as-booted image prefix (plain XOR keystream),
   *  hex, when the slot key is known — the strongest pre-write capture gate. */
  expectedSlotPrefix?: string;
  /** The bank the camera reported it entered after the drain's reset, or
   *  null when it could not be read. Set by a completed drain. */
  drainEntered?: BankKey | null;
  /** The dump shas, after drain. */
  rawDumpSha256?: string;
  deliveredSha256?: string;
  /** The verify step's outcome, after verify. */
  verify?: { diffBytes: number; windowsRead: number; badWindows: number[] };
  /** Post-reset retry attempts for the drain and verify ladders. */
  postResetAttempts?: number;
}

/* ==================================================================== *
 * the artifact names
 * ==================================================================== */

export const PRESERVE_BACKUP_FILE = 'preserve_backup_windows.bin';
export const PRESERVE_DUMP_POSTWRITE_FILE = 'preserve_dump_postwrite.bin';
export const PRESERVE_DUMP_ORIGINAL_FILE = 'preserve_dump_original.bin';
/** The verify step's re-read of the 31 windows after the restore, assembled
 *  at its flash addresses like the backup (erased 0xFF between) — the second
 *  stock read of the run, kept so it can be compared with the backup offline. */
export const PRESERVE_VERIFY_FILE = 'preserve_verify_windows.bin';

/** The run state document a checkpointing caller rewrites after every step. */
export const PRESERVE_RUN_STATE_FILE = 'preserve_run.json';

/** The manifest and README of the dump archive the backup step emits. */
export const PRESERVE_DUMP_MANIFEST_FILE = 'manifest.json';
export const PRESERVE_DUMP_README_FILE = 'README.md';

/** One bank's agreed capture (its 64 KiB as stored), emitted by the backup
 *  step for every bank the run can write. The restore source. */
export function preserveCaptureFile(bank: BankKey): string {
  return `preserve_bank_${bank}_capture.bin`;
}

/** One bank's factory plaintext, DERIVED from its capture by the backup step:
 *  what its patch is built from, and what a cipher family's restore stages. */
export function preservePlainFile(bank: BankKey): string {
  return `preserve_bank_${bank}_plain.bin`;
}

/** One bank's patched image, built by the patch step. */
export function preservePatchedFile(bank: BankKey): string {
  return `preserve_bank_${bank}_patched.bin`;
}

/** Every per-bank artifact name, in A, B, R order — capture, plain, patched. */
export const PRESERVE_BANK_FILES: readonly string[] = BANK_KEYS.flatMap((key) => [
  preserveCaptureFile(key),
  preservePlainFile(key),
  preservePatchedFile(key),
]);

/** Serves one checkpoint artifact by name, or null when the caller does not
 *  have it — which a step that needs it turns into a refusal, never a gap. */
export type PreserveArtifactLoader = (name: string) => Promise<Uint8Array | null>;

/* ==================================================================== *
 * creating a run (offline)
 * ==================================================================== */

export interface CreatePreserveRunOptions {
  /** Default: `preserve-<isoStamp>`. */
  readonly runId?: string;
  /** Injectable clock for the timestamps, so tests are reproducible. */
  readonly now?: () => Date;
  /** Which banks the run writes. Default: the bank the next start enters. */
  readonly banks?: PreserveBankChoice;
  readonly drainChunk?: number;
  readonly expectedSlotPrefix?: Uint8Array;
  readonly postResetAttempts?: number;
}

export interface CreatedPreserveRun {
  readonly state: PreserveRunState;
}

/**
 * Create a run state. Offline: no device, no filesystem — the caller chooses
 * where the run lives and writes `state` out as `preserve_run.json` BEFORE
 * the first step, so even a crash during the backup leaves a resumable run.
 *
 * There is NO image argument and nothing to detect yet: the factory
 * plaintext always derives from the camera itself, and the banks the choice
 * names are resolved once the backup has read them (`runBackupStep`).
 */
export function createPreserveRun(
  options: CreatePreserveRunOptions = {},
): Promise<CreatedPreserveRun> {
  /* The Promise shape is kept on purpose: every caller (CLI, web runner,
   * tests) awaits this entry point. */
  const now = options.now ?? ((): Date => new Date());
  const state: PreserveRunState = {
    version: 3,
    runId: options.runId ?? `preserve-${isoStamp(now())}`,
    createdAt: now().toISOString(),
    nextStep: 'backup',
    steps: {},
    choice: options.banks ?? 'next-start',
    ...(options.drainChunk === undefined ? {} : { drainChunk: options.drainChunk }),
    ...(options.expectedSlotPrefix === undefined
      ? {}
      : { expectedSlotPrefix: bytesToHex(options.expectedSlotPrefix) }),
    ...(options.postResetAttempts === undefined
      ? {}
      : { postResetAttempts: options.postResetAttempts }),
  };
  return Promise.resolve({ state });
}

/**
 * Choose the banks a run writes, before its commit. Offline. Refuses before
 * the backup has read the banks, once the commit has been run or tried (what
 * it wrote is what the restore must put back), and when the run cannot write
 * what the choice names (the reason is the choice's own).
 */
export function choosePreserveBanks(
  state: PreserveRunState,
  choice: PreserveBankChoice,
): PreserveRunState {
  if (state.steps.backup?.status !== 'done') {
    throw new SeekError(
      'pipeline/refused',
      'the banks are chosen after the backup, which reads them — run the backup first',
    );
  }
  if (state.steps.commit !== undefined) {
    throw new SeekError(
      'pipeline/refused',
      `the banks cannot change once the commit has run or been tried: this run writes ` +
        `${(state.targets ?? []).map(bankWordsOf).join(', ') || 'no bank'}, and the restore puts ` +
        'back exactly those',
    );
  }
  const verdict = preserveChoiceOf(state, choice);
  if (verdict.banks === null) throw new SeekError('pipeline/refused', verdict.what);
  return { ...state, choice, targets: verdict.banks };
}

/* ==================================================================== *
 * the gates — what each step requires, as text a person can act on
 * ==================================================================== */

async function loadCheckpoint(
  state: PreserveRunState,
  loadArtifact: PreserveArtifactLoader,
  name: string,
  producer: PreserveStepId,
): Promise<Uint8Array> {
  const bytes = await loadArtifact(name);
  if (bytes === null) {
    throw new SeekError(
      'pipeline/refused',
      `this step needs ${name}, which the ${producer} step writes, and the run directory does ` +
        'not hold it — put the file back from your copy of the run zip (or the run ' +
        'directory) before this step can run',
    );
  }
  const recorded =
    state.steps.backup?.artifactShas?.[name] ?? state.steps.patch?.artifactShas?.[name];
  if (recorded !== undefined) {
    const actual = await sha256hex(bytes);
    if (actual !== recorded) {
      throw new SeekError(
        'pipeline/refused',
        `${name} changed since the step that wrote it recorded it (recorded sha256 ${recorded}, ` +
          `the file is ${actual}) — a checkpoint file must not be edited underneath a run`,
      );
    }
  }
  return bytes;
}

/** One bank's factory plaintext, as the backup step derived it (a run
 *  artifact, sha-checked against the backup's record). */
function loadPlain(
  state: PreserveRunState,
  loadArtifact: PreserveArtifactLoader,
  bank: BankKey,
): Promise<Uint8Array> {
  return loadCheckpoint(state, loadArtifact, preservePlainFile(bank), 'backup');
}

const isDone = (state: PreserveRunState, id: PreserveStepId): boolean =>
  state.steps[id]?.status === 'done';

function buildNameOf(state: PreserveRunState): string {
  return state.buildId ?? state.buildFamily ?? 'the detected build';
}

/** Why the chosen banks cannot be written, or null. Shared by the steps that
 *  touch them. */
function targetsRefusal(state: PreserveRunState, step: PreserveStepId): string | null {
  const targets = state.targets;
  if (state.banks === undefined || state.boot === undefined) {
    return `${step} needs the banks the backup step read, and the state has none`;
  }
  if (targets === undefined || targets.length === 0) {
    return `no banks are chosen for this run: ${preserveChoiceOf(state, state.choice).what}`;
  }
  for (const key of targets) {
    const bank = state.banks[key];
    if (bank.refused !== null) {
      return `${bankWordsOf(key)} cannot be written: ${bank.refused}`;
    }
    if (state.route === 'recovery-only' && key !== 'r') {
      return (
        `this build's patch boots from recovery R only: ${state.routeNote ?? ''} — the run ` +
        `would write ${bankWordsOf(key)}, where the bootloader never runs it`
      );
    }
  }
  return null;
}

async function missingFiles(
  loadArtifact: PreserveArtifactLoader,
  names: readonly string[],
): Promise<string[]> {
  const missing: string[] = [];
  for (const name of names) {
    if ((await loadArtifact(name)) === null) missing.push(name);
  }
  return missing;
}

/**
 * Why `step` cannot run against `state` right now, or null when it can.
 *
 * The run's rule, in gate order: the available regions are dumped and
 * persisted (backup) before the patch is built; the banks are chosen and
 * their patches exist before anything write-shaped; the commit exists before
 * anything that reads the patched part; and the restore exists before the
 * verify that proves it. A step that is already `done` always refuses —
 * re-running a completed step is never what a resume wants.
 *
 * `options.allowJump` relaxes exactly the three ORDERING gates past the
 * commit (drain/restore without a completed commit, verify without a
 * completed restore) — nothing else. The operator who jumps explicitly is
 * asserting the writes landed without their checkpoints; the artifact and
 * file gates stay absolute (a jump cannot fabricate a restore source), the
 * commit step's own gates never relax, and the wire stays protected by the
 * step-level checks that remain (the commit pre-check, the restore
 * already-original detection, verify's 0-diff proof).
 *
 * `options.powerCycled` is the same shape of honesty on the backup's retry:
 * a FAILED backup record re-runs only past an explicit assertion that the
 * camera was power-cycled since the failure. Core cannot observe a power
 * cycle — the flag is an assertion by the front end.
 */
export async function describeStepGate(
  step: PreserveStepId,
  state: PreserveRunState,
  loadArtifact: PreserveArtifactLoader,
  options: { readonly allowJump?: boolean; readonly powerCycled?: boolean } = {},
): Promise<string | null> {
  if (state.nextStep === 'done') {
    return `this run is done — every step completed (run ${state.runId})`;
  }
  const mine = state.steps[step];
  if (mine?.status === 'done') {
    return (
      `${step} is already done in this run (finished ${mine.finishedAt ?? 'at an unknown time'})` +
      ` — resume continues at ${state.nextStep}`
    );
  }

  const jump = options.allowJump === true;
  const doneSteps = PRESERVE_STEP_IDS.filter((id) => isDone(state, id));
  switch (step) {
    case 'backup': {
      if (doneSteps.length > 0) {
        return (
          'the backup cannot re-run: this run has already completed ' +
          `${doneSteps.join(', ')} and its next step is ${state.nextStep} — use --resume`
        );
      }
      /* THE RETRY GATE: a failed backup re-runs only past the power-cycle
       * acknowledgement. The camera's window reader is budgeted per boot, and
       * the incident this gate exists for is a backup attempt + retry
       * back-to-back with no reset — the second pass served stale and blank
       * descriptor bytes. */
      if (
        state.steps.backup?.status === 'failed' &&
        state.steps.backup.powerCycleRequired === true &&
        options.powerCycled !== true
      ) {
        return (
          'the previous backup attempt failed, and the camera must be POWER-CYCLED before ' +
          'this step re-runs — a retry against the same boot can serve stale or blank window ' +
          'bytes (measured: a retried backup served the bootloader vector’s initial-SP word ' +
          'into the boot-config read). Power-cycle the camera (unplug and replug it, or use ' +
          'its power switch), then re-run `preserve --resume <run-directory>`. Core cannot ' +
          'observe the power cycle — the acknowledgement is an assertion by the front end ' +
          '(the CLI asks on a terminal; --yes asserts it). The recorded failure: ' +
          (state.steps.backup.error ?? '(no error text)')
        );
      }
      return null;
    }
    case 'patch': {
      if (!isDone(state, 'backup')) {
        return (
          'patch runs after the backup: the run takes the dump of every region the stock plan ' +
          'can read and persists it BEFORE anything else happens — that backup is the only ' +
          'copy of this camera. Run the backup step first.'
        );
      }
      return null;
    }
    case 'commit': {
      if (!isDone(state, 'backup')) return 'commit runs after the backup (see the patch step)';
      if (!isDone(state, 'patch')) {
        return 'commit runs after the patch step, which records what it stages';
      }
      const targets = targetsRefusal(state, 'commit');
      if (targets !== null) return targets;
      const unpatched = (state.targets ?? []).filter(
        (key) => state.banks?.[key].patch === undefined,
      );
      if (unpatched.length > 0) {
        return (
          `commit needs the patch of ${unpatched.map(bankWordsOf).join(', ')}, and the patch ` +
          'step recorded none — run the patch step again'
        );
      }
      const missing = await missingFiles(loadArtifact, [
        PRESERVE_BACKUP_FILE,
        ...(state.targets ?? []).flatMap((key) => [
          preserveCaptureFile(key),
          preservePlainFile(key),
        ]),
      ]);
      if (missing.length > 0) {
        return (
          'commit requires the backup files in the run directory and they are missing: ' +
          `${missing.join(', ')} — without them a commit has no restore source, so it refuses`
        );
      }
      return null;
    }
    case 'drain': {
      if (!isDone(state, 'commit') && !jump) {
        return (
          'drain reads the PATCHED part through the widened window, and this run has no ' +
          'completed commit — the drain would stall on a stock camera. Run (or resume at) ' +
          'the commit first, or jump explicitly (allowJump) if the commit landed without ' +
          'its checkpoint.'
        );
      }
      const targets = targetsRefusal(state, 'drain');
      if (targets !== null) return targets;
      /* The capability table, consulted where it bites: a build with no
       * whole-part drain gets the documented reason, not a stall on the wire
       * (the 1.0.3.2 builds' EP0 sessions die at ~64-81 KB). */
      if (state.capability !== undefined && !state.capability.wholePart) {
        return `the drain step refuses on ${buildNameOf(state)}: ${state.capability.note}`;
      }
      /* THE MODE-2 HAZARD ORDERING: on the builds whose factory mode-2 row
       * arms *(0x14000000), the nop that makes the arm safe is part of the
       * patch — every chosen bank's recorded patch must carry the hazard
       * site, or the arm is refused before it can fault the camera. */
      const hazardSites = state.capability?.modeTwoHazardSites;
      if (hazardSites !== undefined && hazardSites.length > 0) {
        for (const key of state.targets ?? []) {
          const recorded = new Set(
            (state.banks?.[key].patch?.sites ?? []).map((site) => site.offset),
          );
          const missing = hazardSites.filter((offset) => !recorded.has(offset));
          if (missing.length > 0) {
            return (
              `the drain step refuses on ${buildNameOf(state)}: ` +
              'arming mode 2 on this build’s UNPATCHED image faults the camera — the factory ' +
              'mode-2 row loads the word stored AT 0x14000000 (the bootloader vector’s initial ' +
              'SP, not a flash window) and an armed read walks off SRAM (measured on the ' +
              'emulator: 32 KiB served, then the guest faulted; FW-V1 doc 36.3.1). The nop that ' +
              'makes the arm safe is patch site ' +
              missing.map((offset) => hexUp(offset)).join(', ') +
              `, and it is NOT among the patch sites this run recorded for ${bankWordsOf(key)} — ` +
              'run the patch step (and land the commit) before any mode-2 arm.'
            );
          }
        }
      }
      const missing = await missingFiles(
        loadArtifact,
        (state.targets ?? []).map(preserveCaptureFile),
      );
      if (missing.length > 0) {
        return (
          `drain needs ${missing.join(', ')} (the delivered dump is post-processed with each ` +
          'written bank’s capture) and it is not in the run directory'
        );
      }
      return null;
    }
    case 'restore': {
      if (!isDone(state, 'commit') && !jump) {
        return (
          'restore puts the original banks back over the patch, and this run has no completed ' +
          'commit — there is nothing it can be reverting. Run (or resume at) the commit ' +
          'first, or jump explicitly (allowJump) to restore an already-patched camera.'
        );
      }
      const targets = targetsRefusal(state, 'restore');
      if (targets !== null) return targets;
      if ((state.targets ?? []).some((key) => state.banks?.[key].patch === undefined)) {
        return 'restore needs each written bank’s patch summary (for the staged length) — run the patch step first';
      }
      if (state.restoreForm === 'none') {
        return (
          `the restore step refuses on ${buildNameOf(state)}: no staged form ` +
          'of the factory image passes the running app’s own acceptance while ' +
          'transforming back to the original slot bytes — accept1 reads sum(P ^ ksD), ' +
          'the factory image carries 0xB7AB9D17 there (measured), not the 0xFFFF the app ' +
          'demands. This run ends with the delivered dump in hand and the patch in place; ' +
          'the original content can only go back with a full-flash programmer.'
        );
      }
      /* A cipher family's restore stages the FACTORY image in the build's
       * staged form (the commit's own transform turns it back into the
       * original slot bytes) — so it needs the derived plaintext, which the
       * 'plain' families never do (they stage the capture verbatim). */
      const needsPlain = state.stagedForm !== undefined && state.stagedForm !== 'plain';
      const missing = await missingFiles(
        loadArtifact,
        (state.targets ?? []).flatMap((key) =>
          needsPlain
            ? [preserveCaptureFile(key), preservePlainFile(key)]
            : [preserveCaptureFile(key)],
        ),
      );
      if (missing.length > 0) {
        return (
          `restore needs ${missing.join(', ')} (the original of each written bank, from the ` +
          'backup step) and it is not in the run directory'
        );
      }
      return null;
    }
    case 'verify': {
      if (!isDone(state, 'restore') && !jump) {
        return (
          'verify compares a fresh boot against the backup, and this run has no completed ' +
          'restore — a patched bank would show as diffs. Run (or resume at) the restore ' +
          'first, or jump explicitly (allowJump) if the restore landed without its checkpoint.'
        );
      }
      if ((await loadArtifact(PRESERVE_BACKUP_FILE)) === null) {
        return (
          `verify needs ${PRESERVE_BACKUP_FILE} (the comparison's reference) and it is not in ` +
          'the run directory'
        );
      }
      return null;
    }
  }
}

/* ==================================================================== *
 * running one step
 * ==================================================================== */

export interface PreserveStepOutcome {
  /** The updated state — a new object; the input is never mutated. Persist it
   *  after writing the artifacts. */
  readonly state: PreserveRunState;
  /** Everything the step produced, in the order it produced it. The caller
   *  writes these (atomically) and then the state. */
  readonly artifacts: readonly Artifact[];
}

/**
 * Run one step of a preservation run.
 *
 * Every failure is a thrown error — `SeekError` with code `pipeline/refused`
 * for the gates and the proofs. A checkpointing caller persists the failed
 * step with `recordStepFailure` before exiting; a `CancelledError` is never
 * recorded: an interrupted run's previous checkpoint stands, and a resume
 * re-runs the step from the top.
 */
export async function runPreserveStep(
  step: PreserveStepId,
  opener: SessionOpener,
  state: PreserveRunState,
  loadArtifact: PreserveArtifactLoader,
  reporter: Reporter,
  signal?: AbortSignal,
  options: { readonly allowJump?: boolean; readonly powerCycled?: boolean } = {},
): Promise<PreserveStepOutcome> {
  const refusal = await describeStepGate(step, state, loadArtifact, options);
  if (refusal !== null) throw new SeekError('pipeline/refused', refusal);

  const startedAt = new Date().toISOString();
  const fresh: PreserveRunState = { ...state, steps: { ...state.steps } };
  switch (step) {
    case 'backup':
      return runBackupStep(fresh, opener, reporter, signal, startedAt);
    case 'patch':
      return runPatchStep(fresh, loadArtifact, reporter, signal, startedAt);
    case 'commit':
      return runCommitStep(fresh, opener, loadArtifact, reporter, signal, startedAt);
    case 'drain':
      return runDrainStep(fresh, opener, loadArtifact, reporter, signal, startedAt);
    case 'restore':
      return runRestoreStep(fresh, opener, loadArtifact, reporter, signal, startedAt);
    case 'verify':
      return runVerifyStep(fresh, opener, loadArtifact, reporter, signal, startedAt);
  }
}

/**
 * The failed-step record a checkpointing caller persists when a step threw.
 * (A cancellation is NOT recorded — an interrupted run's previous checkpoint
 * stands.) A failed BACKUP record carries `powerCycleRequired`: the retry
 * gate refuses its re-run until the front end asserts the camera was
 * power-cycled, because a retry against the same boot is exactly how the
 * 2026-10-02 incident turned a refused backup into a stale-byte second pass.
 */
export function recordStepFailure(
  state: PreserveRunState,
  step: PreserveStepId,
  error: unknown,
): PreserveRunState {
  const previous = state.steps[step];
  return {
    ...state,
    steps: {
      ...state.steps,
      [step]: {
        ...(previous?.status === 'failed' ? previous : {}),
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        finishedAt: new Date().toISOString(),
        ...(step === 'backup' ? { powerCycleRequired: true } : {}),
      },
    },
  };
}

/* ---- shared step plumbing ---------------------------------------------- */

function assertLive(signal: AbortSignal | undefined): void {
  if (signal?.aborted === true) throw new CancelledError();
}

async function gateVersion(device: SeekDevice, state: PreserveRunState): Promise<string> {
  const version = await readVersion(device);
  if (state.expectedVersion === undefined) {
    fail('the run state carries no expected version — the backup step has not derived the image');
  }
  if (version !== state.expectedVersion) {
    throw new SeekError(
      'pipeline/refused',
      `the camera reports firmware ${version}, want ${state.expectedVersion} — the patch is ` +
        "derived from one build's bytes and must not be sent to another",
    );
  }
  applyReaderOp(device, version);
  return version;
}

/**
 * Point the session's window reads at the build's reader wire. The version
 * read itself (0x4E) is version-agnostic and always runs first; everything
 * that reads a WINDOW on this generation reads through `device.windowReadOp`,
 * and the 0.7.x builds answer on wire 88, not 79 (their method table puts the
 * read handler in 0x4F's setter column and 0x4F stalls for every request
 * length — measured, FW-V1 doc 36 sec. 36.5.0). Applied at EVERY session
 * open, before the first window read: the backup step from the version it
 * just read, every later step from the version the state pins.
 */
function applyReaderOp(device: SeekDevice, version: string | null | undefined): void {
  device.windowReadOp = legacyReaderOp(version ?? null);
}

/**
 * The active-slot word: GetFirmwareInfo selector 10 returns the firmware's
 * roots record, and its +8 is the bank the bootloader entered at this start
 * (0 A, 1 B, 2 R; TESTING.md 42.53, 42.56). Not a window read. Null when the
 * camera does not answer the selector.
 */
async function readActiveSlotWord(device: SeekDevice): Promise<number | null> {
  const roots = await device.tryFwInfo(10, 64, 'the active-slot word (firmware info roots)');
  return roots !== null && roots.length >= 12 ? viewOf(roots).getUint32(8, true) : null;
}

function expectedPrefixOf(state: PreserveRunState): Uint8Array | undefined {
  return state.expectedSlotPrefix === undefined ? undefined : hexToBytes(state.expectedSlotPrefix);
}

function fail(message: string): never {
  throw new SeekError('pipeline/refused', message);
}

function stepRecord(
  startedAt: string,
  notes: string,
  shas: ReadonlyMap<string, string>,
): PreserveStepRecord {
  const artifactShas: Record<string, string> = {};
  for (const [name, sha] of shas) artifactShas[name] = sha;
  return {
    status: 'done',
    startedAt,
    finishedAt: new Date().toISOString(),
    notes,
    artifactShas,
  };
}

async function shasOf(artifacts: readonly Artifact[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (const artifact of artifacts) out.set(artifact.name, await sha256hex(artifact.data));
  return out;
}

function named(name: string, data: Uint8Array): Artifact {
  return { name, data };
}

/** Opens a session, runs the body, and always closes — the shape every
 *  device-touching step shares. */
async function withSession<T>(
  opener: SessionOpener,
  body: (device: SeekDevice) => Promise<T>,
): Promise<T> {
  const device = await opener.open();
  try {
    return await body(device);
  } finally {
    await opener.close(device);
  }
}

function bankOf(key: BankKey): (typeof BANKS)[number] {
  const bank = BANKS.find((entry) => entry.key === key);
  if (bank === undefined) fail(`no bank ${key}`);
  return bank;
}

/** The banks a list names, as a sentence fragment ("slot A and recovery R"). */
function bankList(keys: readonly BankKey[]): string {
  const words = keys.map(bankWordsOf);
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} and ${words.at(-1) ?? ''}`;
}

/* ==================================================================== *
 * backup — the 31 windows, every bank, and the pre-flash dump archive
 * ==================================================================== */

/** The backup, assembled at its flash addresses into a whole-part image (the
 *  unreachable windows stay 0xFF — the archive's manifest says the real
 *  coverage). */
export function assembleBackupImage(byAddress: ReadonlyMap<number, Uint8Array>): Uint8Array {
  const image = new Uint8Array(FLASH_SIZE).fill(0xff);
  for (const [address, bytes] of byAddress) image.set(bytes, address - FLASH_BASE);
  return image;
}

/** A `BackupResult` rebuilt from an assembled backup image — what the verify
 *  step compares against when the windows themselves were never in memory. */
export function backupResultFromImage(image: Uint8Array): BackupResult {
  if (image.length !== FLASH_SIZE) {
    fail(`the backup image is ${String(image.length)} B, want ${String(FLASH_SIZE)}`);
  }
  const windows: WindowBytes[] = [];
  const byAddress = new Map<number, Uint8Array>();
  for (const entry of preservationWindows()) {
    const at = entry.address - FLASH_BASE;
    const bytes = image.slice(at, at + WINDOW_BYTES);
    windows.push({ mode: entry.subcmd, address: entry.address, bytes });
    byAddress.set(entry.address, bytes);
  }
  return { windows, byAddress, bytes: windows.length * WINDOW_BYTES };
}

/** One arm of the double read: arm `entry` and serve the whole 64 KiB through
 *  the drain path. A stall here is the dead-reader wire answer; the caller's
 *  segment machinery reboots and retries, so a stall surfacing from here has
 *  already exhausted its boots. */
async function armAndDrainSlot(
  device: SeekDevice,
  entry: WindowEntry,
  label: string,
  signal: AbortSignal | undefined,
): Promise<Uint8Array> {
  await device.armWindow(entry);
  try {
    return await drainExact(device, WINDOW_BYTES, label, {
      chunk: READ_CHUNK,
      retries: 3,
      timeoutMs: 20000,
      ...(signal === undefined ? {} : { signal }),
    });
  } catch (error) {
    if (isWireStall(error)) {
      throw new SeekError(
        'pipeline/refused',
        spentReaderRefusal(
          `${label} stalled at ${error instanceof Error ? error.message : String(error)}`,
        ),
        { cause: error },
      );
    }
    throw error;
  }
}

/**
 * The expectation a slot read is sanity-checked against (the verified-arm
 * ladder): every family on this line stores the image header VERBATIM at
 * 0x200 — the cipher's cleartext window, the solver's own first step — so a
 * real read parses with the image magic. A read that fails this is garbage
 * (a swallowed arm serves blank or stale descriptor bytes — the 2026-10-02
 * probe: a mode-3 read served blank while the immediately-following mode-7
 * read served correctly), and the ladder re-arms ONCE, never loops.
 */
function slotReadIsPlausible(read: Uint8Array): boolean {
  const header = parseImageHeader(read);
  return header !== null && header.magic === IMAGE_MAGIC;
}

/** The spent-reader signature of a garbage slot read, for the refusal text;
 *  a read carrying no known signature is described by its header failure. */
function slotGarbageNoun(read: Uint8Array): string {
  return spentReaderSignature(read) ?? 'no image header parses at 0x200';
}

/**
 * The spent-reader signatures a capture can carry, checked before any
 * candidate is derived. On the real Compact the window reader is budgeted per
 * boot (emulator: the cursor resets per re-arm — the gap that hid this), so a
 * camera whose reads arrive after the budget is spent serves BLANK bytes or
 * STALE DESCRIPTOR bytes, and no solver can read an image out of either. The
 * shapes, from the 2026-10-02 incident: an all-0xFF capture; a header window
 * that is 0xFF-fill so no magic can be read; and the bootloader vector's own
 * first words (initial SP 0x10018000, reset address in the bootloader block
 * 0x1400xxxx — the REAL bootloader block starts exactly so, and a real bank
 * image never does: its SP word is its own, e.g. 0x10008000) served through a
 * descriptor still pointing at the boot block. Returns the signature text, or
 * null when the capture does not carry one of these shapes.
 */
export function spentReaderSignature(capture: Uint8Array): string | null {
  let allBlank = true;
  for (const byte of capture) {
    if (byte !== 0xff) {
      allBlank = false;
      break;
    }
  }
  if (allBlank) return 'every byte of the capture is 0xFF (an all-blank read)';
  if (capture.length >= 8) {
    const dv = new DataView(capture.buffer, capture.byteOffset, capture.byteLength);
    const word0 = dv.getUint32(0, true);
    const word1 = dv.getUint32(4, true);
    if (word0 === 0x10018000 && word1 >>> 16 === 0x1400) {
      return (
        `the capture’s first words are ${hexUp(word0)} / ${hexUp(word1 & ~1)} — the ` +
        'bootloader vector’s own initial SP and reset address served through a stale reader ' +
        'descriptor, not the bank’s image'
      );
    }
  }
  let headerFill = true;
  for (let i = HEADER_OFFSET; i < HEADER_OFFSET + HEADER_SIZE; i++) {
    if (capture[i] !== 0xff) {
      headerFill = false;
      break;
    }
  }
  if (headerFill) {
    return (
      'the capture’s header window (0x200..0x240) is 0xFF-fill — no image magic can be read ' +
      'from it'
    );
  }
  return null;
}

interface Derived {
  readonly plain: Uint8Array;
  readonly patch: V1Patch;
  readonly method: string;
}

/**
 * The factory plaintext, derived from an agreed capture — the ruling's whole
 * mechanism, in one function. The candidate order is fixed: the identity
 * solve first (the 2014 chain's banks hold the image as-is), then each cipher
 * family's solver in table order. EVERY candidate is pushed through the full
 * gate set on the DERIVED image before it is trusted — the version
 * cross-check against the camera's own report, then `buildV1Patch` (the build
 * table's detect hooks, the before-byte site gates — which refuse an
 * already-patched bank — and the family word-sum/acceptance rule). The first
 * candidate that passes all of them IS the factory plaintext; a capture for
 * which none passes refuses, and nothing is recorded, let alone written.
 */
function deriveFactoryImage(capture: Uint8Array, cameraVersion: string, bank: BankKey): Derived {
  const words = bankWordsOf(bank);
  const attempts: { plain: Uint8Array; method: string }[] = [];
  const reasons: string[] = [];
  /* The spent-reader check comes FIRST: a capture carrying one of those
   * shapes is a reader state, not an image, and the refusal must say the one
   * thing that un-blocks the camera before any cipher talk. */
  const spent = spentReaderSignature(capture);
  for (const family of ['v1-2014', 'v1-2014-ff', 'compact-2016'] as const) {
    const solved = solvePlainFromCapture(family, capture);
    if (solved.ok) attempts.push({ plain: solved.plain, method: solved.method });
    else reasons.push(solved.reason);
  }
  for (const attempt of attempts) {
    /* The version cross-check, FIRST of the gates: the camera's own report is
     * the one external fact here, and the derived image must agree with it. */
    const says = parseImageHeader(attempt.plain)?.versionStr;
    if (says !== undefined && says !== cameraVersion) {
      reasons.push(`the camera reports ${cameraVersion} but the image in ${words} says ${says}`);
      continue;
    }
    try {
      return { plain: attempt.plain, patch: buildV1Patch(attempt.plain), method: attempt.method };
    } catch (error) {
      reasons.push(
        `the ${attempt.method} candidate failed its build gates: ` +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  }
  if (spent !== null) {
    fail(
      spentReaderRefusal(
        `${spent} — no factory plaintext can be derived from these bytes. Every candidate was ` +
          `tried:\n  - ${reasons.join('\n  - ')}`,
      ),
    );
  }
  /* The reads are not the problem here — they agreed, and a spent reader was
   * ruled out above. What failed is every derivation's gate set, so the first
   * line says that, and the list says which gate. */
  fail(
    `both reads of ${words} agree, but no candidate derivation of the factory ` +
      'plaintext from them passes every gate below, so this run has no image it can patch there ' +
      'and refuses rather than write over it. Every candidate was tried:\n  - ' +
      reasons.join('\n  - '),
  );
}

/** One bank's read on its own admitted boot: a full 64 KiB drain completes
 *  the window (which poisons the reader for the rest of that boot —
 *  TESTING.md sec. 34), so the segment ends with the wire reboot the next
 *  probe sends. */
async function readBankOnFreshBoot(
  opener: SessionOpener,
  bank: BankKey,
  version: string,
  reporter: Reporter,
  signal: AbortSignal | undefined,
  label: string,
): Promise<Uint8Array> {
  const [bankEntry] = doubleReadWindows(bank);
  const { device } = await openProbedSession(opener, reporter, signal, label, (d) => {
    applyReaderOp(d, version);
  });
  try {
    return await armAndDrainSlot(device, bankEntry, label, signal);
  } finally {
    /* No eager reset: the next segment's probe detects the poisoned boot and
     * reboots by command itself. */
    await opener.close(device);
  }
}

interface AnchorCapture {
  readonly capture: Uint8Array;
  readonly slotReadShas: readonly [string, string];
  readonly readModes: readonly [number, number];
  readonly byAddress: ReadonlyMap<number, Uint8Array>;
  readonly serveNote: string;
  readonly derived: Derived;
}

/** The anchor bank's capture-and-derive pass: the double read under the
 *  serve budget (the sweep's row + ONE fresh arm), the verified-arm ladder on
 *  those reads, the expected-prefix gate (when the slot key is known), and the
 *  derivation with its gate set. Any failure here refuses the backup. */
async function captureAnchor(
  opener: SessionOpener,
  byAddress: ReadonlyMap<number, Uint8Array>,
  bank: BankKey,
  version: string,
  expectedPrefix: Uint8Array | undefined,
  reporter: Reporter,
  signal: AbortSignal | undefined,
): Promise<AnchorCapture> {
  const words = bankWordsOf(bank);
  const address = bankOf(bank).address;
  const sweepRow = byAddress.get(address);
  if (sweepRow === undefined) {
    fail(
      `the backup does not hold ${words} (${hexUp(address, 8)}) — the stock windows cannot serve it`,
    );
  }
  const [bankEntry, planEntry] = doubleReadWindows(bank);
  const fresh = await readBankOnFreshBoot(
    opener,
    bank,
    version,
    reporter,
    signal,
    `${words}’s fresh-boot read (the bank window, mode ${String(bankEntry.subcmd)})`,
  );

  /* THE VERIFIED-ARM LADDER on the slot reads. `sweepRow` is the first read
   * (the sweep's own boot); `fresh` is the second (its own admitted boot).
   * Both are sanity-checked against the header expectation; a garbage read is
   * re-read ONCE ON A FRESH BOOT (a re-arm on the same boot would serve the
   * completion poison's blank); two plausible reads that differ stay a
   * refusal — the byte-agreement rule is the trust anchor. */
  let capture = sweepRow;
  let verifiedSecond: Uint8Array = fresh;
  let serveNote = 'both reads agree';
  const disagree = (sha1: string, sha2: string): never =>
    fail(
      `the two reads of ${words} disagree (sha256 ${sha1} vs ${sha2}) — a camera that cannot ` +
        'serve the bank it runs twice in a row is not a camera to write to; the capture is the ' +
        'restore source and the patch’s derivation input',
    );
  if (!slotReadIsPlausible(sweepRow)) {
    if (!slotReadIsPlausible(fresh)) {
      /* Both boots served garbage. One more admitted boot for the sweep row's
       * side: the sweep's own boot may have been the swallowed one. */
      const rescued = await readBankOnFreshBoot(
        opener,
        bank,
        version,
        reporter,
        signal,
        `${words}’s re-read after two garbage reads (the bank window)`,
      );
      if (!slotReadIsPlausible(rescued)) {
        fail(
          spentReaderRefusal(
            `the reads of ${words}, the bank the camera runs, served garbage on three boots ` +
              `(${slotGarbageNoun(sweepRow)}; ${slotGarbageNoun(fresh)}; then ` +
              `${slotGarbageNoun(rescued)})`,
          ),
        );
      }
      capture = rescued;
      verifiedSecond = rescued;
      serveNote =
        'the sweep’s row and the fresh-boot read both served garbage — a third boot’s read ' +
        'is the capture, and the archive’s row is repaired to it';
    } else {
      /* The flip: the sweep's boot was swallowed and the fresh boot reads a
       * real image — the re-read is the capture, and the archive's row is
       * repaired to it so the run directory stays self-consistent. */
      capture = fresh;
      serveNote =
        'the sweep’s row served garbage and was re-verified — the fresh boot’s read is the ' +
        'capture';
    }
  } else if (!equalBytes(sweepRow, fresh)) {
    const sha1 = await sha256hex(sweepRow);
    const sha2 = await sha256hex(fresh);
    if (!slotReadIsPlausible(fresh)) {
      /* The fresh boot was swallowed: one more admitted boot. */
      const again = await readBankOnFreshBoot(
        opener,
        bank,
        version,
        reporter,
        signal,
        `${words}’s re-read (the fresh boot served garbage)`,
      );
      if (equalBytes(again, sweepRow)) {
        verifiedSecond = again;
        serveNote =
          'the fresh boot served garbage and was re-read on another boot — the re-read ' +
          'agrees with the sweep’s row';
      } else if (!slotReadIsPlausible(again)) {
        fail(
          spentReaderRefusal(
            `the fresh-boot reads of ${words} served garbage twice (${slotGarbageNoun(fresh)}; ` +
              `then ${slotGarbageNoun(again)})`,
          ),
        );
      } else {
        disagree(sha1, sha2);
      }
    } else {
      disagree(sha1, sha2);
    }
  }

  const slotReadShas: readonly [string, string] = [
    await sha256hex(sweepRow),
    await sha256hex(verifiedSecond),
  ];
  reporter.log(
    `${words} served on two admitted boots (the sweep’s own boot, mode ` +
      `${String(planEntry.subcmd)}, + one fresh boot of the bank window, mode ` +
      `${String(bankEntry.subcmd)}): ${serveNote} (sha256 ${slotReadShas[1]})`,
    'detail',
  );
  /* The archive's row at the bank address is the verified capture when the
   * sweep's own row was the swallowed one — the assembled backup must agree
   * with the capture the run derives from and verify compares against. */
  const archiveRows: ReadonlyMap<number, Uint8Array> =
    capture === sweepRow ? byAddress : new Map(byAddress).set(address, capture);

  /* The strongest keyless gate that survives, when the slot key is known
   * (the emulator's donor): the capture must be the factory image as the
   * cipher stores it. */
  if (
    expectedPrefix !== undefined &&
    !equalBytes(capture.subarray(0, expectedPrefix.length), expectedPrefix)
  ) {
    fail(
      `${words} does not hold the factory image as this build’s cipher stores it ` +
        '(the expected image prefix does not match the capture) — refusing before anything ' +
        'is recorded, let alone written',
    );
  }

  const derived = deriveFactoryImage(capture, version, bank);
  await logDerived(reporter, bank, derived);
  return {
    capture,
    slotReadShas,
    readModes: [planEntry.subcmd, bankEntry.subcmd] as const,
    byAddress: archiveRows,
    serveNote,
    derived,
  };
}

async function logDerived(reporter: Reporter, bank: BankKey, derived: Derived): Promise<void> {
  reporter.log(
    `${bankWordsOf(bank)}: the factory plaintext derived from the capture: ${derived.method} ` +
      `(${String(derived.plain.length)} B, sha256 ${await sha256hex(derived.plain)}); ` +
      `build ${derived.patch.buildId} (family ${derived.patch.family})`,
    'detail',
  );
  const edit = derived.patch.derivation;
  if (edit !== null) {
    reporter.log(
      `${bankWordsOf(bank)}: the image is the ${derived.patch.buildId} factory image with ` +
        `${edit.derivation.label} (${edit.derivation.id}): ` +
        `${String(edit.derivation.site.after.length)} bytes at ` +
        `${hexUp(edit.derivation.site.offset)}, balanced through the adjust word at 0x238 ` +
        `(${hexUp(edit.balanceWord)}). The patch balances on top of it, and the restore puts ` +
        'this image back, edit included.',
      'detail',
    );
  }
}

/** Another bank's two reads and derivation: never refuses the backup. */
interface OtherCapture {
  readonly holds: BankHolds;
  readonly bytes: Uint8Array;
  readonly slotReadShas: readonly [string, string] | null;
  readonly derived: Derived | null;
  /** Why the run cannot write this bank, before the build and key rules. */
  readonly refused: string | null;
}

async function captureOther(
  opener: SessionOpener,
  byAddress: ReadonlyMap<number, Uint8Array>,
  bank: BankKey,
  version: string,
  reporter: Reporter,
  signal: AbortSignal | undefined,
): Promise<OtherCapture> {
  const words = bankWordsOf(bank);
  const row = byAddress.get(bankOf(bank).address) ?? new Uint8Array(WINDOW_BYTES).fill(0xff);
  let fresh: Uint8Array;
  try {
    fresh = await readBankOnFreshBoot(
      opener,
      bank,
      version,
      reporter,
      signal,
      `${words}’s fresh-boot read (the bank window, mode ${String(bankOf(bank).mode)})`,
    );
  } catch (error) {
    if (error instanceof CancelledError) throw error;
    const why = error instanceof Error ? error.message : String(error);
    reporter.log(`${words}: the second read failed (${why})`, 'warn');
    return {
      holds: 'unsettled',
      bytes: row,
      slotReadShas: null,
      derived: null,
      refused: `its second read failed (${why})`,
    };
  }
  const shas: readonly [string, string] = [await sha256hex(row), await sha256hex(fresh)];
  if (!equalBytes(row, fresh)) {
    reporter.log(
      `${words}: the two reads disagree (sha256 ${shas[0]} vs ${shas[1]}) — it is not written`,
      'warn',
    );
    return {
      holds: 'unsettled',
      bytes: row,
      slotReadShas: shas,
      derived: null,
      refused: `its two reads disagree (sha256 ${shas[0]} vs ${shas[1]})`,
    };
  }
  const holds = bankHoldsOf(row);
  if (holds !== 'image') {
    const mark = warmBootMarkOf(row);
    const refused =
      holds === 'erased'
        ? 'it is erased'
        : mark !== null
          ? `its header word at +0x200 holds ${hexUp(mark)}, the mark the bootloader writes ` +
            'over a bank after a watchdog reset early in a start; the bootloader no longer ' +
            'takes this bank, and the run has no image to patch there'
          : 'it holds no image header at +0x200';
    reporter.log(`${words}: ${refused}`, 'detail');
    return { holds, bytes: row, slotReadShas: shas, derived: null, refused };
  }
  try {
    const derived = deriveFactoryImage(row, version, bank);
    await logDerived(reporter, bank, derived);
    return { holds, bytes: row, slotReadShas: shas, derived, refused: null };
  } catch (error) {
    if (error instanceof CancelledError) throw error;
    const why = error instanceof Error ? error.message : String(error);
    reporter.log(`${words}: no image the run can patch (${why})`, 'detail');
    return { holds, bytes: row, slotReadShas: shas, derived: null, refused: why };
  }
}

/** The boot word from the backup's boot-config row: an SRAM-shaped word is a
 *  spent reader serving the bootloader vector, never a record. */
function bootHeadOf(cfgRow: Uint8Array): Uint8Array {
  const head = cfgRow.subarray(0, BOOT_CONFIG_BYTES);
  if (head.length < BOOT_CONFIG_BYTES) {
    fail(`boot-config read is ${String(head.length)} B, want ${String(BOOT_CONFIG_BYTES)}`);
  }
  const word = viewOf(head).getUint32(0, true);
  if (isStaleDescriptorWord(word)) {
    fail(
      spentReaderRefusal(
        `cfg[0]=${hexUp(word)} is an SRAM-shaped word — the bootloader vector’s initial SP ` +
          'served through a stale reader descriptor, not a record the bootloader wrote — and ' +
          'no bank can be named from it; nothing is written',
      ),
    );
  }
  return head;
}

async function runBackupStep(
  state: PreserveRunState,
  opener: SessionOpener,
  reporter: Reporter,
  signal: AbortSignal | undefined,
  startedAt: string,
): Promise<PreserveStepOutcome> {
  const expectedPrefix = expectedPrefixOf(state);

  /* THE VERSION GATE, its own small-read session: GetFirmwareInfo is not the
   * window reader and answers on any boot. No gate yet — the camera's own
   * report is the version the run expects from here on. The derived image's
   * header must agree with it (below). The active-slot word rides along: the
   * bank the camera entered is the bank whose image runs now. */
  const { version, activeSlotWord } = await withSession(opener, async (device) => {
    assertLive(signal);
    const v = await readVersion(device);
    /* THE LINE GATE, before a single window is armed or read: a 4.x or Nano build is
     * the 4.x/Nano flow's, and this run refuses it with the tab to use. */
    const outside = outsideLineRefusal(v);
    if (outside !== null) fail(outside);
    /* THE GENERATION GATE, before a single window read: the 2014 builds older
     * than 0.7.0.7 are outside the widening route (doc 36.7, measured) and
     * this run refuses with that evidence instead of reading anything. */
    const tooOld = preWideningRefusal(v);
    if (tooOld !== null) fail(tooOld);
    return { version: v, activeSlotWord: await readActiveSlotWord(device) };
  });
  reporter.log(`camera reports firmware ${version}`, 'detail');
  const entered = bankOfActiveSlotWord(activeSlotWord);
  reporter.log(
    activeSlotWord === null
      ? 'the active-slot word could not be read, so the bank the camera entered is not known'
      : entered === null
        ? `the active-slot word is ${String(activeSlotWord)}, which names no bank`
        : `the camera reports it entered ${bankWordsOf(entered)} at this start (active-slot word ` +
          `${String(activeSlotWord)})`,
    'detail',
  );

  /* THE SWEEP: one admitted boot per window, each segment's probe read IS the
   * boot-config record, and each completing read ends with the wire reboot
   * that clears the reader poison (TESTING.md sec. 34). */
  const backup = await backupWindows(opener, reporter, READ_CHUNK, signal, (device) => {
    applyReaderOp(device, version);
  });
  const cfgRow = backup.byAddress.get(BOOT_CONFIG_ADDRESS);
  if (cfgRow === undefined) fail('the backup does not hold the boot-config block');
  const cfgHead = bootHeadOf(cfgRow);
  const word = viewOf(cfgHead).getUint32(0, true) >>> 0;

  /* THE ANCHOR: the bank the camera runs — the one it reports it entered,
   * else the first the boot word names. Its image is captured and derived in
   * full, with every refusal the run had before 42.92. */
  let anchor: BankKey = entered ?? lockedBootOrder(word)[0];
  let anchorRead = await captureAnchor(
    opener,
    backup.byAddress,
    anchor,
    version,
    expectedPrefix,
    reporter,
    signal,
  );
  /* THE RECOVERY RE-POINT. A build whose route is recovery-only (the FF
   * build) cannot run from slot A or B: the 2014 bootloader rejects its
   * 0xFFFF-sum image there and boots recovery R UNCHECKED (doc 35.3). The
   * route is only KNOWN once a capture has been derived, so the first pass
   * may derive from A or B; then R is the bank that truly runs, and it is
   * captured and derived in full. */
  let repointed = false;
  if (anchorRead.derived.patch.route === 'recovery-only' && anchor !== 'r') {
    reporter.log(
      `${bankWordsOf(anchor)} holds ${anchorRead.derived.patch.label}, which runs only from ` +
        'recovery R — the run takes R as the bank the camera runs',
      'detail',
    );
    anchor = 'r';
    anchorRead = await captureAnchor(
      opener,
      anchorRead.byAddress,
      anchor,
      version,
      expectedPrefix,
      reporter,
      signal,
    );
    repointed = true;
  }
  const anchorPatch = anchorRead.derived.patch;

  /* EVERY OTHER BANK, read twice and derived where it holds an image. None of
   * these refuses the backup: a bank the run cannot write is recorded with
   * the reason. */
  const others = new Map<BankKey, OtherCapture>();
  for (const key of BANK_KEYS) {
    if (key === anchor) continue;
    assertLive(signal);
    others.set(
      key,
      await captureOther(opener, anchorRead.byAddress, key, version, reporter, signal),
    );
  }

  /* THE BOOT FACTS: each bank's check, and the bank the next start enters. */
  const reads = {} as Record<BankKey, PreserveBankRead>;
  for (const key of BANK_KEYS) {
    const other = others.get(key);
    reads[key] =
      other === undefined
        ? { key, bytes: anchorRead.capture, holds: 'image' }
        : { key, bytes: other.bytes, holds: other.holds };
  }
  const boot = preserveBootFactsOf({
    cfgHead,
    activeSlotWord,
    line: anchorPatch.family === 'compact-2016' ? '2016' : '2014',
    banks: reads,
  });
  reporter.log(
    `boot-config word ${hexUp(boot.word)} — ${boot.rule}; next start: ` +
      (boot.nextStart === null ? 'not known' : bankWordsOf(boot.nextStart)) +
      ` (${boot.why})`,
    'detail',
  );

  /* WHICH BANKS THE RUN CAN WRITE. The anchor always (its build is the
   * run's); another bank when its image derived as the same build, the
   * build's route allows it, and on the 2016 line the bootloader's check does
   * not refuse it (a bank under another key than the camera stores under
   * cannot be put back byte for byte through the camera). */
  const records = {} as Record<BankKey, PreserveBankRecord>;
  const artifacts: Artifact[] = [];
  const derivedPlains = new Map<BankKey, Uint8Array>();
  for (const key of BANK_KEYS) {
    const entry = bankOf(key);
    const base = { key, address: entry.address, mode: entry.mode };
    const other = others.get(key);
    const derived = other === undefined ? anchorRead.derived : other.derived;
    let refused: string | null = other === undefined ? null : other.refused;
    if (refused === null && derived !== null && derived.patch.buildId !== anchorPatch.buildId) {
      refused =
        `it holds ${derived.patch.label} (${derived.patch.buildId}), not the build the camera ` +
        `runs (${anchorPatch.label})`;
    }
    if (refused === null && anchorPatch.route === 'recovery-only' && key !== 'r') {
      refused = `this build runs only from recovery R: ${anchorPatch.routeNote ?? ''}`;
    }
    if (
      refused === null &&
      other !== undefined &&
      anchorPatch.family === 'compact-2016' &&
      boot.verdicts[key] === false
    ) {
      refused =
        'the bootloader’s check refuses it: it is stored under another key than the one this ' +
        'camera’s bootloader checks banks under, and a write through the camera would store ' +
        'it under that key, so the restore could not put its exact bytes back';
    }
    const capture = other === undefined ? anchorRead.capture : other.bytes;
    const shas = other === undefined ? anchorRead.slotReadShas : other.slotReadShas;
    const holds: BankHolds = other === undefined ? 'image' : other.holds;
    records[key] = {
      ...base,
      holds,
      refused,
      ...(shas === null ? {} : { slotReadShas: shas }),
      ...(derived === null
        ? {}
        : {
            imageSha256: await sha256hex(derived.plain),
            buildId: derived.patch.buildId,
            buildLabel: derived.patch.label,
            ...(derived.patch.derivation === null
              ? {}
              : {
                  imageDerivation: {
                    id: derived.patch.derivation.derivation.id,
                    label: derived.patch.derivation.derivation.label,
                    balanceWord: derived.patch.derivation.balanceWord,
                  },
                }),
          }),
    };
    if (refused === null && derived !== null) {
      artifacts.push(named(preserveCaptureFile(key), capture));
      artifacts.push(named(preservePlainFile(key), derived.plain));
      derivedPlains.set(key, derived.plain);
    }
  }

  const assembled = assembleBackupImage(anchorRead.byAddress);

  /* THE PRE-FLASH DUMP ARCHIVE, offline from the assembled backup: the same
   * decrypt/report path the `decrypt` command runs on a dump file — the
   * camera is not read twice for it. */
  const archive = await decryptDump(
    assembled,
    'preserve_backup',
    {
      dumpPath: `${state.runId}/${PRESERVE_BACKUP_FILE}`,
      ...(signal === undefined ? {} : { signal }),
    },
    reporter,
  );
  const profile = archive.detection?.best.profile ?? getProfile('generic');
  const manifest = buildOfflineDecryptManifest({
    producer:
      'seek-thermal-firmware-dump (preserve backup step: the offline decrypt of the assembled ' +
      'stock windows — the pre-flash dump of every region the stock plan can read)',
    startedAt,
    finishedAt: new Date().toISOString(),
    source: {
      fileName: PRESERVE_BACKUP_FILE,
      size: assembled.length,
      sha256: await sha256hex(assembled),
    },
    flashBase: profile.memory.flashBase,
    decryption: archive.summary,
    profile: profileInfoOf(profile, archive.detection),
  });

  const allArtifacts: Artifact[] = [
    named(PRESERVE_BACKUP_FILE, assembled),
    ...artifacts,
    ...archive.artifacts.map((a) => named(a.name, a.data)),
    named(PRESERVE_DUMP_MANIFEST_FILE, utf8(manifestToJson(manifest))),
    named(PRESERVE_DUMP_README_FILE, utf8(makeOfflineDecryptReadme(manifest))),
  ];
  const shas = await shasOf(allArtifacts);

  const facts: Pick<PreserveRunState, 'boot' | 'banks'> = { boot, banks: records };
  const resolved = preserveChoiceOf(facts, state.choice);
  const bankNotes = BANK_KEYS.map((key) => {
    const refused = records[key].refused;
    return `${bankWordsOf(key)}: ${
      refused === null
        ? `${records[key].buildLabel ?? 'an image'} — the run can write it`
        : `not written — ${refused}`
    }`;
  }).join('; ');
  const nextState: PreserveRunState = {
    ...state,
    anchor,
    boot,
    banks: records,
    ...(resolved.banks === null ? {} : { targets: resolved.banks }),
    buildFamily: anchorPatch.family,
    expectedVersion: version,
    buildId: anchorPatch.buildId,
    buildLabel: anchorPatch.label,
    stagedForm: anchorPatch.stagedForm,
    restoreForm: anchorPatch.restoreForm,
    route: anchorPatch.route,
    routeNote: anchorPatch.routeNote,
    capability: anchorPatch.capability,
    nextStep: nextStepAfter('backup'),
    steps: {
      ...state.steps,
      backup: stepRecord(
        startedAt,
        `${String(BACKUP_WINDOW_COUNT)} windows (${String(
          BACKUP_WINDOW_COUNT * WINDOW_BYTES,
        )} B) backed up; boot-config word ${hexUp(boot.word)} (${boot.rule}); ` +
          (boot.entered === null
            ? 'the bank the camera entered is not known'
            : `the camera reports it entered ${bankWordsOf(boot.entered)}`) +
          `; next start: ${boot.nextStart === null ? 'not known' : bankWordsOf(boot.nextStart)} ` +
          `(${boot.why}); ${bankWordsOf(anchor)}, the bank the camera runs, served twice ` +
          `(the sweep’s row, mode ${String(anchorRead.readModes[0])}, + one fresh arm of the ` +
          `bank window, mode ${String(anchorRead.readModes[1])}), ${anchorRead.serveNote} ` +
          `(sha256 ${anchorRead.slotReadShas[1]}); the factory plaintext derived from the ` +
          `capture (${anchorRead.derived.method}, ${String(anchorRead.derived.plain.length)} B) ` +
          `and gated; build ${anchorPatch.buildId}` +
          (repointed
            ? '; the run took recovery R as the bank the camera runs (the build boots it unchecked)'
            : '') +
          `; ${bankNotes}; ` +
          (resolved.banks === null
            ? `no banks chosen: ${resolved.what}`
            : `banks to write: ${bankList(resolved.banks)} (${resolved.what})`) +
          `; dump archive: ${String(archive.slots.length)} slot(s) decrypted`,
        shas,
      ),
    },
  };
  return { state: nextState, artifacts: allArtifacts };
}

/* ==================================================================== *
 * patch — offline, no device
 * ==================================================================== */

async function runPatchStep(
  state: PreserveRunState,
  loadArtifact: PreserveArtifactLoader,
  reporter: Reporter,
  signal: AbortSignal | undefined,
  startedAt: string,
): Promise<PreserveStepOutcome> {
  assertLive(signal);
  const banks = state.banks;
  if (banks === undefined) fail('the run state carries no banks — the backup step has not run');
  const writable = BANK_KEYS.filter((key) => banks[key].refused === null);
  if (writable.length === 0) fail('the backup found no bank the run can write');

  const artifacts: Artifact[] = [];
  const records: Record<BankKey, PreserveBankRecord> = { ...banks };
  const notes: string[] = [];
  for (const key of writable) {
    const plain = await loadPlain(state, loadArtifact, key);
    const patch = buildV1Patch(plain); /* the before-byte gates refuse here */
    const summary: PreservePatchSummary = {
      sites: patch.sites.map((site) => ({
        name: site.what.split(' (')[0] ?? site.what,
        offset: site.offset,
        before: [...site.before],
        after: [...site.after],
      })),
      rebalanceWord: patch.rebalanceWord,
      stagedLength: plain.length,
      chunkCount: Math.ceil(plain.length / STAGE_CHUNK),
      patchedSha256: await sha256hex(patch.patched),
      diffCount: patch.diffOffsets.length,
      armResetsCursor: patch.armResetsCursor,
    };
    artifacts.push(named(preservePatchedFile(key), patch.patched));
    records[key] = { ...banks[key], patch: summary };
    reporter.log(
      `${bankWordsOf(key)}: patch built: ${String(summary.sites.length)} instruction site(s), ` +
        `${String(patch.diffOffsets.length)} byte(s) move, ${String(summary.chunkCount)} ` +
        'staging chunk(s)',
      'detail',
    );
    notes.push(
      `${bankWordsOf(key)}: ${String(patch.diffOffsets.length)} byte(s) differ (rebalance word ` +
        `${patch.rebalanceWord.toString(16)}), staged length ${String(summary.stagedLength)} B in ` +
        `${String(summary.chunkCount)} chunk(s)`,
    );
  }
  const shas = await shasOf(artifacts);
  const nextState: PreserveRunState = {
    ...state,
    banks: records,
    nextStep: nextStepAfter('patch'),
    steps: {
      ...state.steps,
      patch: stepRecord(
        startedAt,
        `patches built offline from each writable bank's factory plaintext: ${notes.join('; ')}`,
        shas,
      ),
    },
  };
  return { state: nextState, artifacts };
}

/* ==================================================================== *
 * commit — the in-place patch; never reset, never replayed blind
 * ==================================================================== */

/**
 * How much of a bank's head the pre-checks read, and at what ask size —
 * both measured constraints, not choices.
 *
 * THE ASK SIZE: 64 B, the shape where serve == ask on this reader (TESTING.md
 * sec. 23.3). At a 512-ask the RE-ARMED bank window serves short (~192-256 B)
 * while its cursor advances by the full ask, so the delivered stream is
 * SPARSE — measured on the emulator. At a 64-ask serve == ask always, and
 * sixteen asks deliver a contiguous, byte-accurate 1 KiB.
 *
 * THE LENGTH: 1 KiB is ENOUGH — the rebalance word at 0x238 (568) is among
 * the patch bytes: 0 on a factory image (or a known derivation's balance) and
 * a different value on the patched one, which buildV1Patch guarantees — so
 * the head alone distinguishes original from patched, which is the only
 * question the pre-checks exist to answer.
 */
const BANK_HEAD_BYTES = 0x400;
const BANK_HEAD_ASK = 64;

async function readBankHead(device: SeekDevice, bank: BankKey, label: string): Promise<Uint8Array> {
  await device.armWindow(bankWindow(bank));
  return drainExact(device, BANK_HEAD_BYTES, label, {
    chunk: BANK_HEAD_ASK,
    retries: 3,
    timeoutMs: 20000,
  });
}

/** One chosen bank's write: what the wire stages, what the bank holds before
 *  and after. */
interface BankWrite {
  readonly key: BankKey;
  readonly capture: Uint8Array;
  readonly patch: V1Patch;
  readonly payload: Uint8Array;
  readonly patchedSlot: Uint8Array;
}

async function bankWriteOf(
  state: PreserveRunState,
  loadArtifact: PreserveArtifactLoader,
  key: BankKey,
): Promise<BankWrite> {
  const plain = await loadPlain(state, loadArtifact, key);
  const patch = buildV1Patch(plain);
  const capture = await loadCheckpoint(state, loadArtifact, preserveCaptureFile(key), 'backup');
  /* THE STAGED PAYLOAD, per family. On the plaintext 2014 banks it is the
   * conjugated capture (the keystream is zero, so the conjugation is its own
   * identity). On the cipher families the wire-80 bytes are the STAGED form
   * of the PATCHED PLAINTEXT — the commit's own two-stream transform, not the
   * host, produces the slot bytes — and the conjugated capture is what the
   * bank is expected to hold AFTER the write (the pre-check). */
  const payload =
    patch.stagedForm === 'plain'
      ? conjugateCapture(capture, patch)
      : stagedFormOf(patch, patch.patched);
  if (patch.family === 'v1-2014-ff' && stagedAcceptanceSum(patch, payload) !== 0xffff) {
    fail(
      'the staged payload does not satisfy the FF build collapsed acceptance ' +
        '(sum(staged ^ ks0) must be 0xFFFF) — refusing to stage a payload the app would ' +
        'reject after the erase',
    );
  }
  return { key, capture, patch, payload, patchedSlot: conjugateCapture(capture, patch) };
}

async function runCommitStep(
  state: PreserveRunState,
  opener: SessionOpener,
  loadArtifact: PreserveArtifactLoader,
  reporter: Reporter,
  signal: AbortSignal | undefined,
  startedAt: string,
): Promise<PreserveStepOutcome> {
  const targets = state.targets ?? [];
  const boot = state.boot;
  if (boot === undefined) fail('the run state carries no boot facts');
  /* The gate checked the windows file's presence; loading verifies its sha. */
  await loadCheckpoint(state, loadArtifact, PRESERVE_BACKUP_FILE, 'backup');
  const order = commitOrderOf(targets, boot.word);
  const writes: BankWrite[] = [];
  for (const key of order) writes.push(await bankWriteOf(state, loadArtifact, key));

  /* The commit session is ADMITTED like every read session (the mode-3 probe
   * first — a boot that comes up page-shifted or unreadable is rebooted by
   * command before anything is staged), and NO reset is sent after: the
   * session's post-commit flash state is the ground truth, and the wire-89
   * belongs to the drain step's own first session. The probe is a window
   * read, so it runs on the run's reader wire: it comes BEFORE the version
   * gate that would otherwise set it, and on a 0.7.x build wire 79 stalls. */
  const outcomes = await (async () => {
    const { device } = await openProbedSession(
      opener,
      reporter,
      signal,
      'the commit session',
      (d) => {
        applyReaderOp(d, state.expectedVersion);
      },
    );
    try {
      assertLive(signal);
      const version = await gateVersion(device, state);
      reporter.log(`camera reports firmware ${version}`, 'detail');

      /* THE PRE-COMMIT READ-BACK, every chosen bank BEFORE any is written:
       * what is in each bank RIGHT NOW decides what may be written. A crash
       * between a commit transfer and its checkpoint leaves this run at
       * nextStep `commit`; re-running it must never stage a commit blind. The
       * head carries the rebalance word (0x238), which differs between the
       * original and the patched bytes (BANK_HEAD_BYTES). The comparison is
       * against SLOT bytes (what the reader serves). */
      const landed = new Set<BankKey>();
      for (const write of writes) {
        const words = bankWordsOf(write.key);
        const live = await readBankHead(device, write.key, `commit pre-check (${words}'s head)`);
        if (equalBytes(live, write.patchedSlot.subarray(0, BANK_HEAD_BYTES))) {
          landed.add(write.key);
          continue;
        }
        if (!equalBytes(live, write.capture.subarray(0, BANK_HEAD_BYTES))) {
          fail(
            `${words}'s head changed since the backup (it holds neither the original capture ` +
              'nor the patched bytes) — refusing to write over an unknown bank state; nothing ' +
              `was written. Head hex: live ${bytesToHex(live, 24)} vs capture ` +
              bytesToHex(write.capture.subarray(0, 24)),
          );
        }
      }
      if (landed.size === writes.length) {
        fail(
          `${bankList(order)} already ${writes.length === 1 ? 'holds' : 'hold'} the patched ` +
            'bytes — the commit landed in a previous attempt and must not be replayed. Resume ' +
            'at the drain step (--resume), which boots the patched image and continues from ' +
            'there.',
        );
      }

      const done: string[] = [];
      for (const write of writes) {
        const words = bankWordsOf(write.key);
        if (landed.has(write.key)) {
          reporter.log(
            `${words} already holds the patch (a previous attempt landed) — not written again`,
            'detail',
          );
          done.push(`${words}: already held the patch (a previous attempt landed); not written`);
          continue;
        }
        assertLive(signal);
        const commit = await commitToBank(device, write.key, write.payload, {
          label: `preserve commit (${words})`,
          reporter,
          ...(signal === undefined ? {} : { signal }),
        });
        done.push(
          `${words}: ${String(commit.chunks)} chunks staged (${String(write.payload.length)} B, ` +
            `image length only), commit status ${commit.status.toString(16)}, sum16 ` +
            commit.sum16.toString(16),
        );
      }
      return done;
    } finally {
      await opener.close(device);
    }
  })();

  const nextState: PreserveRunState = {
    ...state,
    nextStep: nextStepAfter('commit'),
    steps: {
      ...state.steps,
      commit: {
        status: 'done',
        startedAt,
        finishedAt: new Date().toISOString(),
        notes:
          `written in this order: ${outcomes.join('; ')}; every bank was read back and checked ` +
          'against the backup before any was written; no reset sent in this session',
      },
    },
  };
  return { state: nextState, artifacts: [] };
}

/* ==================================================================== *
 * drain — reset, the bank the start entered, then the whole part on one arm
 * ==================================================================== */

/** The refusal a drain gives when the start after its reset entered a bank
 *  this run did not patch. */
function enteredUnpatchedRefusal(
  entered: BankKey,
  word: number,
  targets: readonly BankKey[],
  boot: PreserveBootFacts | undefined,
): string {
  return (
    `after the restart the camera reports it entered ${bankWordsOf(entered)} (active-slot word ` +
    `${String(word)}), which this run did not patch (it patched ${bankList(targets)}). ` +
    'The whole-flash read runs only through the patched image, so nothing was armed or read. ' +
    (boot === undefined
      ? ''
      : `The backup read the boot-config word as ${hexUp(boot.word)} (${boot.rule}); a start ` +
        'that enters another bank means the word or a bank changed since, or the bootloader ' +
        'refused the patched bank. ') +
    'The patched banks still hold the patch: the restore step puts every written bank back.'
  );
}

async function runDrainStep(
  state: PreserveRunState,
  opener: SessionOpener,
  loadArtifact: PreserveArtifactLoader,
  reporter: Reporter,
  signal: AbortSignal | undefined,
  startedAt: string,
): Promise<PreserveStepOutcome> {
  const targets = state.targets ?? [];
  const captures = new Map<BankKey, Uint8Array>();
  for (const key of targets) {
    captures.set(
      key,
      await loadCheckpoint(state, loadArtifact, preserveCaptureFile(key), 'backup'),
    );
  }
  /* The bank the start after the reset is expected to enter: the next start
   * the backup read, else the bank the camera ran then. */
  const expected: BankKey | undefined = state.boot?.nextStart ?? state.anchor;

  /* THE ROTATION, resolved BEFORE anything touches the camera: on the 0.7.0.7
   * the widened mode-2 window serves the part from the A/B slot the
   * active-slot word does NOT name (measured slot B 0x14060000 on the donor's
   * blank record; doc 36.10 item 3), so the served bytes fold back through the
   * NOR's own alias decode. A start expected in recovery, whose base this walk
   * cannot name, refuses before the reset, not after it. */
  let rotationBase: number | null = null;
  if (state.capability?.rotation !== undefined) {
    if (expected === undefined) fail('the run state names no bank the start is expected to enter');
    rotationBase = rotatedDrainBase(expected);
    reporter.log(
      `the widened window serves the part rotated from ${hexUp(rotationBase, 8)} — ` +
        'the drain will unrotate before delivery',
      'detail',
    );
  }

  /* The reset, ONCE, on its own first session: after it the camera boots the
   * bank the bootloader picks, and the session that sent it holds the reset's
   * own orphaned URB. Nothing reads a window before the drain — the reader's
   * per-arm budget is consumed in asks (TESTING.md sec. 23.3).
   *
   * A reset the HOST refused never left (a WebUSB SecurityError: a browser
   * policy, or the e2e write guard), so the camera still runs the image it
   * booted with — the committed patch is in flash and not running. The drain
   * must not go on. Nothing has been read, so the step stops here and can
   * simply run again. */
  await withSession(opener, async (device) => {
    assertLive(signal);
    const version = await gateVersion(device, state);
    reporter.log(
      `camera reports firmware ${version}; resetting so it boots the patched image`,
      'detail',
    );
    if ((await resetDevice(device)) === 'refused') {
      fail(
        'the drain’s reboot command was REFUSED by the host before it left (a SecurityError: ' +
          'a browser policy or a test guard), so the camera still runs the image it booted ' +
          'with, not the committed patch. The drain reads only through the patched image’s ' +
          'widened window, so it stops before arming anything; nothing was read. Run the drain ' +
          'again where the reset can go out (the CLI, or a browser that allows it).',
      );
    }
  });

  const attempts = state.postResetAttempts ?? 2;
  let rawDump: Uint8Array | null = null;
  let drainEntered: BankKey | null = null;
  let lastError = 'not attempted';
  for (let n = 1; n <= attempts && rawDump === null; n++) {
    const device = await opener.open();
    /* No version read happens on an attempt session (the reset session gates
     * it); the reader op comes from the state's pinned version. */
    applyReaderOp(device, state.expectedVersion);
    try {
      /* THE BANK THE START ENTERED, before a single window is armed: the
       * active-slot word is the bootloader's own record (TESTING.md 42.56). A
       * start that entered a bank this run did not patch runs a stock image,
       * whose mode 2 serves one 64 KiB window and stalls (the 2014 chain),
       * refuses the arm (the 2016 guard), or faults the camera (0.8.0.0 and
       * 0.7.0.8, TESTING.md 42.92 §1) — so the step stops here. A word that
       * cannot be read says nothing either way, and the drain goes on as it
       * always has. */
      const slotWord = await readActiveSlotWord(device);
      const entered = bankOfActiveSlotWord(slotWord);
      if (entered === null) {
        reporter.log(
          'the bank the camera entered after the restart could not be read (the active-slot ' +
            'word did not answer or names no bank) — the drain goes on',
          'warn',
        );
      } else if (!targets.includes(entered)) {
        throw new SeekError(
          'pipeline/refused',
          enteredUnpatchedRefusal(entered, slotWord ?? 0, targets, state.boot),
          { detail: { entered, targets: [...targets] } },
        );
      } else {
        reporter.log(
          `after the restart the camera reports it entered ${bankWordsOf(entered)}, which holds ` +
            'the patch',
          'detail',
        );
        if (state.capability?.rotation !== undefined && entered !== expected) {
          rotationBase = rotatedDrainBase(entered);
        }
      }
      drainEntered = entered;
      rawDump = await drainWholePart(device, reporter, {
        chunk: state.drainChunk ?? READ_CHUNK,
        ...(signal === undefined ? {} : { signal }),
      });
      /* THE PAGE-SHIFT CHECK (TESTING.md sec. 34): a page-shifted boot serves
       * the widened window one 64 KiB page up, so the dump would start with
       * the boot-config block's `00 00 00 00` instead of a vector's segment
       * SP. No legitimate part image starts with four zero bytes. The bias
       * re-rolls per boot, so the camera is rebooted by command and the
       * attempt loop takes another boot. */
      if (rawDump[0] === 0 && rawDump[1] === 0 && rawDump[2] === 0 && rawDump[3] === 0) {
        reporter.log(
          'the drain came back one page high (a page-shifted boot — the dump starts with the ' +
            'boot-config block, not a vector) — rebooting by command and taking another boot',
          'warn',
        );
        if ((await resetDevice(device)) === 'refused') {
          fail(
            'the drain came back one page high, and the reboot that takes another boot was ' +
              'REFUSED by the host before it left (a SecurityError: a browser policy or a test ' +
              'guard) — another attempt would drain the same shifted boot. Nothing was kept; run ' +
              'the drain again where the reset can go out.',
          );
        }
        rawDump = null;
        lastError = 'page-shifted boot (rebooting for another)';
        continue;
      }
      /* Advisory, AFTER the drain and on what budget remains: the full
       * 4 MiB completion is the liveness proof; the probe only comments on
       * the budget and can stall without meaning anything is wrong. */
      try {
        const backupImage = await loadArtifact(PRESERVE_BACKUP_FILE);
        if (backupImage !== null) {
          const probeFlash = (rotationBase ?? FLASH_BASE) + PROBE_OFFSET - READ_CHUNK - FLASH_BASE;
          const probeBytes = backupSlice(
            backupResultFromImage(backupImage),
            probeFlash,
            READ_CHUNK,
          );
          const probe = await probeWidenedWindow(device, probeBytes);
          reporter.log(`drain probe, ${probe.detail}`, probe.live ? 'detail' : 'warn');
        }
      } catch {
        reporter.log('drain probe skipped (the drain already proves the widened window)', 'detail');
      }
    } catch (error) {
      if (error instanceof CancelledError) throw error;
      /* the refusals above: another attempt would read the same boot */
      if (error instanceof SeekError && error.code === 'pipeline/refused') throw error;
      lastError = `attempt ${String(n)}: ${error instanceof Error ? error.message : String(error)}`;
      reporter.log(`drain attempt failed: ${lastError}`, 'warn');
    } finally {
      await opener.close(device);
    }
  }
  if (rawDump === null) {
    throw new PostResetWedgeError(
      'the commit landed but the post-reset read window never came up — the doc 33 sec. 11.6 ' +
        'same-server wedge. The commit is NOT replayed; re-run the drain step against a ' +
        `fresh session/server booted from the committed state. Last attempt: ${lastError}`,
      { step: 'drain', lastError },
    );
  }

  /* The served bytes become the part in LAYOUT order here: the post-write
   * artifact is the state the commits produced, and the delivered dump swaps
   * every written bank back from its capture on top of it. */
  const layout = rotationBase === null ? rawDump : unrotateDump(rawDump, rotationBase);
  const delivered = postProcessDump(
    layout,
    targets.map((key) => ({
      address: bankOf(key).address,
      bytes: captures.get(key) ?? new Uint8Array(),
    })),
  );
  const artifacts: Artifact[] = [
    named(PRESERVE_DUMP_POSTWRITE_FILE, layout),
    named(PRESERVE_DUMP_ORIGINAL_FILE, delivered),
  ];
  const shas = await shasOf(artifacts);
  const rawSha = shas.get(PRESERVE_DUMP_POSTWRITE_FILE) ?? '';
  const deliveredSha = shas.get(PRESERVE_DUMP_ORIGINAL_FILE) ?? '';
  const servedNote =
    rotationBase === null
      ? `raw dump ${String(rawDump.length)} B (sha256 ${rawSha})`
      : `served dump ${String(rawDump.length)} B rotated from ${hexUp(rotationBase, 8)} ` +
        `(sha256 ${await sha256hex(rawDump)}), unrotated to layout order (sha256 ${rawSha})`;
  const nextState: PreserveRunState = {
    ...state,
    drainEntered,
    rawDumpSha256: rawSha,
    deliveredSha256: deliveredSha,
    nextStep: nextStepAfter('drain'),
    steps: {
      ...state.steps,
      drain: stepRecord(
        startedAt,
        (drainEntered === null
          ? 'the bank the start entered was not read; '
          : `the start after the reset entered ${bankWordsOf(drainEntered)}, which holds the patch; `) +
          `${servedNote}; delivered dump (${bankList(targets)} swapped back from the backup) ` +
          `sha256 ${deliveredSha}`,
        shas,
      ),
    },
  };
  return { state: nextState, artifacts };
}

/* ==================================================================== *
 * restore — the original banks back, then a reset
 * ==================================================================== */

async function runRestoreStep(
  state: PreserveRunState,
  opener: SessionOpener,
  loadArtifact: PreserveArtifactLoader,
  reporter: Reporter,
  signal: AbortSignal | undefined,
  startedAt: string,
): Promise<PreserveStepOutcome> {
  const targets = state.targets ?? [];
  const boot = state.boot;
  if (boot === undefined) fail('the run state carries no boot facts');
  const order = restoreOrderOf(targets, boot.word);

  /* Each bank's ORIGINAL content, as the reader serves it (slot bytes) — the
   * pre-check compares against it, and the 'plain' families stage it back
   * verbatim. A cipher family stages the FACTORY image in the build's staged
   * form: the commit's own two-stream transform turns it back into the
   * original slot bytes. */
  const restores: { key: BankKey; original: Uint8Array; payload: Uint8Array }[] = [];
  for (const key of order) {
    const capture = await loadCheckpoint(state, loadArtifact, preserveCaptureFile(key), 'backup');
    const stagedLength = state.banks?.[key].patch?.stagedLength;
    if (stagedLength === undefined)
      fail(`the run state carries no patch summary for ${bankWordsOf(key)}`);
    if (capture.length < stagedLength) {
      fail(`${bankWordsOf(key)}'s capture is shorter than its staged length`);
    }
    const original = capture.subarray(0, stagedLength);
    let payload = original;
    if (state.stagedForm !== undefined && state.stagedForm !== 'plain') {
      const plain = await loadPlain(state, loadArtifact, key);
      payload = stagedFormOf(buildV1Patch(plain), plain);
    }
    restores.push({ key, original, payload });
  }

  /* The restore session is ADMITTED like every read session. After a drain
   * the patched reader's position sits at its 4 MiB limit, which the arm's
   * halfword reset cannot clear, so every read stalls (TESTING.md sec.
   * 35.4) — unless the patch carries the arm tail's cursor reset (sec. 36),
   * when the probe reads on the drain's own boot. The web wizard asks for a
   * replug after a drain on a patch without the reset (TESTING.md secs.
   * 28.4, 35, 36). The probe's reboot-and-retry loop stays (it is free when
   * it works, and a resumed run may not have replugged); its refusal names
   * the power cycle. */
  const result = await (async () => {
    const { device, cfgHead } = await openProbedSession(
      opener,
      reporter,
      signal,
      'the restore session',
      (d) => {
        /* The probe is a window read: the run's reader wire, as at commit. */
        applyReaderOp(d, state.expectedVersion);
      },
    );
    try {
      assertLive(signal);
      const version = await gateVersion(device, state);
      reporter.log(`camera reports firmware ${version}`, 'detail');
      const wordNow = viewOf(cfgHead).getUint32(0, true) >>> 0;
      const wordNote =
        wordNow === boot.word
          ? null
          : `the boot-config word now reads ${hexUp(wordNow)}, and the backup read ` +
            `${hexUp(boot.word)} — the restore puts the written banks back, and nothing here ` +
            'writes the word, so the verify will show the difference';
      if (wordNote !== null) reporter.log(`restore: ${wordNote}`, 'warn');

      /* Head reads, every bank before any is written (see BANK_HEAD_BYTES):
       * the rebalance word at 0x238 differs between the original and the
       * patched bytes. */
      const already = new Set<BankKey>();
      for (const item of restores) {
        const live = await readBankHead(
          device,
          item.key,
          `restore pre-check (${bankWordsOf(item.key)}'s head)`,
        );
        if (equalBytes(live, item.original.subarray(0, BANK_HEAD_BYTES))) already.add(item.key);
      }
      const notes: string[] = [];
      let wrote = false;
      for (const item of restores) {
        const words = bankWordsOf(item.key);
        if (already.has(item.key)) {
          /* A previous restore landed and its checkpoint did not: the
           * recovery is to say so, not to erase and reprogram the same bytes. */
          reporter.log(
            `restore: ${words} already holds its original content — nothing to stage`,
            'detail',
          );
          notes.push(
            `${words}: already held its original content (a previous restore landed); not written`,
          );
          continue;
        }
        reporter.log(
          `restore: ${words} holds something other than its original content — staging the ` +
            'backup over it (the backup is the authority this run restores from)',
          'detail',
        );
        assertLive(signal);
        await commitToBank(device, item.key, item.payload, {
          label: `preserve restore (${words})`,
          reporter,
          ...(signal === undefined ? {} : { signal }),
        });
        wrote = true;
        notes.push(
          `${words}: original content staged back (${String(item.payload.length)} B${
            item.payload === item.original
              ? ', the capture verbatim'
              : `, the ${state.stagedForm ?? ''} staged form`
          }) and committed`,
        );
      }
      if (!wrote) return { notes, outcome: 'already original' as const, wordNote };
      /* The commits LANDED (status 0): the banks hold the original. The reset
       * only boots them. One the host refused (a SecurityError: a browser
       * policy or a test guard) left the camera running the patched image
       * from RAM, which is harmless to the flash and ends at its next
       * power-up — so the restore is done, and the record says the reboot is
       * owed instead of "reset sent". */
      if ((await resetDevice(device)) === 'refused') {
        reporter.log(
          'restore: the banks hold their original content, but the reboot command was REFUSED ' +
            'by the host before it left (a SecurityError: a browser policy or a test guard) — ' +
            'the camera still runs the patched image from RAM; unplug it and plug it back in to ' +
            'boot the restored bank',
          'warn',
        );
        return { notes, outcome: 'restored, reboot refused' as const, wordNote };
      }
      return { notes, outcome: 'restored' as const, wordNote };
    } finally {
      await opener.close(device);
    }
  })();

  const tail =
    result.outcome === 'restored'
      ? 'reset sent'
      : result.outcome === 'restored, reboot refused'
        ? 'the reset was REFUSED by the host, so the camera still runs the patched image until ' +
          'it is unplugged and plugged back in (the banks hold their original content)'
        : 'nothing staged, no reset sent';
  const nextState: PreserveRunState = {
    ...state,
    nextStep: nextStepAfter('restore'),
    steps: {
      ...state.steps,
      restore: {
        status: 'done',
        startedAt,
        finishedAt: new Date().toISOString(),
        notes:
          `${result.notes.join('; ')}; ${tail}` +
          (result.wordNote === null ? '' : `; ${result.wordNote}`),
        ...(result.outcome === 'restored, reboot refused' ? { rebootRefused: true } : {}),
      },
    },
  };
  return { state: nextState, artifacts: [] };
}

/* ==================================================================== *
 * verify — a fresh boot, 31 windows, 0 diffs
 * ==================================================================== */

async function runVerifyStep(
  state: PreserveRunState,
  opener: SessionOpener,
  loadArtifact: PreserveArtifactLoader,
  reporter: Reporter,
  signal: AbortSignal | undefined,
  startedAt: string,
): Promise<PreserveStepOutcome> {
  const backupImage = await loadCheckpoint(state, loadArtifact, PRESERVE_BACKUP_FILE, 'backup');
  const backup = backupResultFromImage(backupImage);

  const attempts = state.postResetAttempts ?? 2;
  let last: Awaited<ReturnType<typeof verifyAgainstBackup>> | null = null;
  for (let n = 1; n <= attempts; n++) {
    /* One admitted boot per window — the sweep's own discipline; the reader
     * op comes from the state's pinned version, as in every step after the
     * backup. */
    const read = await verifyAgainstBackup(opener, backup, reporter, READ_CHUNK, signal, (d) => {
      applyReaderOp(d, state.expectedVersion);
    });
    last = read;
    if (read.badWindows.length === 0) break;
  }
  const result = last ?? {
    diffBytes: -1,
    windowsRead: 0,
    badWindows: [] as number[],
    readBack: new Map<number, Uint8Array>(),
  };
  /* The windows that came back different, by address — every bank is one of
   * them, and the boot-config block too. */
  const differing: number[] = [];
  for (const [address, bytes] of result.readBack) {
    const want = backup.byAddress.get(address);
    if (want !== undefined && !equalBytes(bytes, want)) differing.push(address);
  }
  if (result.diffBytes !== 0 || result.badWindows.length > 0) {
    fail(
      `the verify read ${String(result.diffBytes)} differing byte(s) over ` +
        `${String(result.windowsRead)}/${String(BACKUP_WINDOW_COUNT)} windows` +
        (differing.length > 0
          ? ` (in ${differing
              .map((address) => {
                const bank = BANKS.find((entry) => entry.address === address);
                const what =
                  bank !== undefined
                    ? bankWordsOf(bank.key)
                    : address === BOOT_CONFIG_ADDRESS
                      ? 'the boot-config block'
                      : 'a data block';
                return `${what} ${hexUp(address, 8)}`;
              })
              .join(', ')})`
          : '') +
        (result.badWindows.length > 0 ? ` (short windows: ${result.badWindows.join(',')})` : '') +
        ' — the part does not re-read byte-identical to the backup',
    );
  }

  const artifacts: Artifact[] =
    last === null ? [] : [named(PRESERVE_VERIFY_FILE, assembleBackupImage(last.readBack))];
  const shas = await shasOf(artifacts);
  const nextState: PreserveRunState = {
    ...state,
    verify: {
      diffBytes: result.diffBytes,
      windowsRead: result.windowsRead,
      badWindows: [...result.badWindows],
    },
    nextStep: nextStepAfter('verify'),
    steps: {
      ...state.steps,
      verify: stepRecord(
        startedAt,
        (state.steps.restore?.rebootRefused === true
          ? 'the boot the restore ran on (its reboot was refused by the host — the camera still ' +
            'runs the patched image until it is unplugged and plugged back in) re-read '
          : 'a fresh boot re-read ') +
          `${String(result.windowsRead)}/` +
          `${String(BACKUP_WINDOW_COUNT)} windows at ${String(result.diffBytes)} differing ` +
          "byte(s), slot A, slot B and recovery R among them — the camera's flash is " +
          'byte-identical to the backup',
        shas,
      ),
    },
  };
  return { state: nextState, artifacts };
}
