/**
 * The full-flash preservation pipeline for the v1 locked line.
 *
 * A deliberate exception to this core's "read-only over the wire" posture:
 * these modules drive the raw type-7 write path (BeginFirmwareUpgrade modes
 * 7..9 + the token, SetFeaturedFirmwareData staging, CompleteMemoryUpgrade
 * commit) against the ACTIVE boot slot, because that is what in-place
 * preservation means. The general flash workflow refuses this generation for
 * good reason and is untouched; this directory is an operator-invoked tool
 * with its own gates, its own backups and its own honest risk note.
 *
 * Two shapes of the same operation:
 *  - `pipeline.ts` — the four phases in one call, for a process that stays
 *    alive (`runPreservationPipeline`), plus the per-phase wire primitives.
 *  - `steps.ts` — the same operation as six resumable steps with a JSON run
 *    state and an artifact loader, for a run that must survive the process
 *    that started it (`createPreserveRun`, `runPreserveStep`).
 */

export {
  applyDerivation,
  buildV1Patch,
  clearsArmCursor,
  conjugateCapture,
  locateDerivation,
  keystream,
  preWideningRefusal,
  stagedAcceptanceSum,
  stagedFormOf,
  sum16,
  verifyCapture,
  wordSum,
  xorWindowVerbatim,
  keyWordsOf,
  REBALANCE_WORD_OFFSET,
  BUILD_PATCH_PROFILES,
  KNOWN_DERIVATIONS,
  V1_2014_PATCH_SITES,
  V1_PAYLOAD_VMA_BASE,
} from './patch.js';
export type {
  BuildPatchProfile,
  CommitRouteId,
  DrainCapability,
  ImageDerivation,
  LocatedDerivation,
  LocatedKeys,
  PatchSite,
  PreserveFamilyId,
  RestoreFormId,
  StagedFormId,
  V1Patch,
} from './patch.js';

export {
  BACKUP_WINDOW_COUNT,
  BANKS,
  BOOT_CONFIG_ADDRESS,
  BOOT_CONFIG_BYTES,
  CFG_MODE,
  WIDENED_MODE,
  WINDOW_BYTES,
  bankWindow,
  cfgWindow,
  doubleReadWindows,
  isStaleDescriptorWord,
  planWindowAt,
  preservationWindows,
  spentReaderRefusal,
  widenedWindow,
} from './windows.js';
export type { BankKey } from './windows.js';

export {
  BANK_KEYS,
  PRESERVE_BANK_CHOICES,
  WARM_BOOT_MARKS,
  bankChoiceWords,
  bankChoiceWritesWords,
  bankHoldsOf,
  bankListWords,
  bankRecordWords,
  commitOrderOf,
  isPreserveBankChoice,
  lastStartWords,
  nextStartWords,
  preserveBootFactsOf,
  preserveChoiceOf,
  preserveChoicesOf,
  restoreOrderOf,
  unknownImageRefusal,
  unknownImageWords,
  warmBootMarkOf,
} from './banks.js';
export type {
  BankHolds,
  PreserveBankChoice,
  PreserveBankRead,
  PreserveBankRecord,
  PreserveBootFacts,
  PreserveChoiceFacts,
  PreserveChoiceVerdict,
  PreserveLine,
} from './banks.js';

export {
  PostResetWedgeError,
  backupSlice,
  backupWindows,
  commitToBank,
  classifyReaderBoot,
  openProbedSession,
  drainExact,
  drainWholePart,
  postProcessDump,
  probeWidenedWindow,
  readVersion,
  resetDevice,
  resetOpPayload,
  rotatedDrainBase,
  runPreservationPipeline,
  unrotateDump,
  verifyAgainstBackup,
  DRAIN_RETRIES,
  PROBE_OFFSET,
  READ_CHUNK,
  RESET_OP,
  STAGE_CHUNK,
} from './pipeline.js';
export type {
  BackupResult,
  PipelineArtifacts,
  PipelineOptions,
  PipelineRecord,
  SessionOpener,
  WindowBytes,
} from './pipeline.js';

export {
  PRESERVE_BACKUP_FILE,
  PRESERVE_BANK_FILES,
  PRESERVE_DUMP_MANIFEST_FILE,
  PRESERVE_DUMP_POSTWRITE_FILE,
  PRESERVE_DUMP_ORIGINAL_FILE,
  PRESERVE_VERIFY_FILE,
  PRESERVE_DUMP_README_FILE,
  PRESERVE_RUN_STATE_FILE,
  PRESERVE_STEP_IDS,
  assembleBackupImage,
  backupResultFromImage,
  choosePreserveBanks,
  createPreserveRun,
  describeStepGate,
  drainLeavesReaderReadable,
  isPreserveStepId,
  nextStepAfter,
  preserveCaptureFile,
  preservePatchedFile,
  preservePlainFile,
  recordStepFailure,
  PRESERVE_UNPATCHED_START_STOP,
  PRESERVE_UNPATCHED_START_NEXT,
  preserveStoppedForRestore,
  preserveDoneWords,
  unpatchedStartOf,
  runPreserveStep,
  spentReaderSignature,
} from './steps.js';
export {
  bankDerivedWords,
  blockSweepWords,
  derivationWords,
  drainCapabilityWords,
  PRESERVE_CODE_NAMES,
  patchSiteLine,
  patchSiteWords,
  preserveBuildWords,
  preserveStepResultWords,
  restoreFormWords,
  stagedFormWords,
} from './words.js';
export type { PreserveBlockAdmission, PreserveWordsState } from './words.js';
export type {
  CreatePreserveRunOptions,
  CreatedPreserveRun,
  PreserveArtifactLoader,
  PreservePatchSummary,
  PreserveRunState,
  PreserveStepId,
  PreserveStepOutcome,
  PreserveStepRecord,
} from './steps.js';

export { solvePlainFromCapture } from './solve.js';
export type { SolvePlainResult } from './solve.js';
