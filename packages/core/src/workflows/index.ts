/**
 * The four read operations a user actually runs: dump, sweep, decrypt and
 * device-info. Writing a bank is the slot writer's (`slots/write.ts`), and the
 * preservation pipeline's (`preservation/steps.ts`).
 *
 * Everything here is isomorphic and side-effect-free at the platform level — a
 * workflow returns `Artifact[]` and reports through a `Reporter`, and both the
 * React app and the Node CLI call exactly these functions.
 */

export type {
  CheckKey,
  DecryptResult,
  DecryptedSlot,
  DeviceState,
  DumpOptions,
  DumpResult,
  SlotState,
  SweepResult,
  WorkflowContext,
} from './types.js';
export {
  DEFAULT_DUMP_OPTIONS,
  deviceInfoOf,
  entryForAddress,
  isCancelled,
  profileInfoOf,
  resolveDumpOptions,
  slotByKey,
  transportInfoOf,
  unlockTokenOf,
  usesAuthChannel,
} from './types.js';

export { describeDevice, runDump } from './dump.js';
export {
  channelEvidenceOf,
  evidenceFromChannelProbe,
  identifyCamera,
  identityGate,
  predatesDumpProtocol,
  predatesDumpProtocolReason,
  probeSelectorChannel,
  readRunningFirmware,
  versionUnknownReason,
  FIRST_DUMPABLE_MAJOR,
  FIRST_DUMPABLE_MINOR,
  PROBE_OPEN_SUBCMD,
  PROBE_PROTECTED_SUBCMD,
  VERSION_READ_ATTEMPTS,
  VERSION_READ_STARTUP_READS,
  VERSION_READ_STARTUP_SPACING_MS,
  VERSION_READ_STARTUP_WINDOW_MS,
  type CameraIdentification,
  type IdentityGate,
  type ProbeOptions,
  type RunningFirmware,
  type SelectorChannelProbe,
} from './capability.js';
export {
  identityRefusal,
  planForDevice,
  type DevicePlan,
  type PlannedOperation,
} from './window-plan.js';
export { runSweep } from './sweep.js';
export {
  decryptDump,
  detectProfileForDump,
  evidenceFromDump,
  type DecryptOptions,
} from './decrypt.js';
export {
  BANKS_ONLY_WRITING,
  bootedSlot,
  cameraWideBlocks,
  checkKeyNameOf,
  profileToRereadUnder,
  bootableDescription,
  readDeviceInfo,
  storeKeyDescription,
  targetSlot,
  unknownBootabilityWhy,
  upgradeTargetIsBooted,
  upgradeTargetWarning,
  upgradeTargetWhileRecovery,
} from './device-info.js';
export {
  bankWritingOf,
  bootedReportOf,
  checkKeyReportOf,
  detectedReportOf,
  keyReportRows,
  KEY_TABLE_REFUSED_2016,
  nextStartReportOf,
  type BankWriting,
  type ReportRow,
} from './device-report.js';
