/** Public surface of the archive/output-packaging module. */

export { crc32 } from './crc32.js';
export { buildZip, zipEntryCount, zipTotalDataSize } from './zip.js';
export { looksLikeZip, readZipEntries, type ZipEntry } from './zip-read.js';
export { FLASH_DUMP_ALL_SELECTORS_FILE, FLASH_DUMP_ORIGINAL_FILE } from './flash-files.js';

export type {
  DeviceInfo,
  TransportInfo,
  ManifestProfileInfo,
  ShortfallFill,
  WindowRecordRead,
  WindowRecordError,
  WindowRecord,
  WindowRecordReadInput,
  WindowRecordErrorInput,
  WindowRecordInput,
  GapRecord,
  GapRecordInput,
  SelectorRecord,
  SelectorRecordInput,
  SelectorTableInfo,
  EmbeddedKeyTable,
  EmbeddedKeyTableInput,
  ImageSummary,
  ImageSummaryInput,
  KeySummary,
  KeySummaryInput,
  BootloaderKeysSummary,
  DecryptionNotAttempted,
  DecryptionAttempted,
  DecryptionSummary,
  DecryptionSummaryInput,
  DumpManifest,
  BuildDumpManifestInput,
  LegacyDumpManifest,
  BuildLegacyDumpManifestInput,
  SweepManifest,
  BuildSweepManifestInput,
  OfflineDecryptSource,
  OfflineDecryptManifest,
  BuildOfflineDecryptManifestInput,
} from './manifest.js';

export {
  buildWindowRecord,
  buildGapRecord,
  buildSelectorRecord,
  buildImageSummary,
  buildKeySummary,
  buildBootloaderKeysSummary,
  buildDecryptionNotAttempted,
  buildDecryptionSummary,
  buildDecryptionFailed,
  buildDumpManifest,
  buildLegacyDumpManifest,
  buildSweepManifest,
  buildOfflineDecryptManifest,
  manifestToJson,
} from './manifest.js';

export {
  REPO_URL,
  makeReadme,
  makeLegacyReadme,
  makeSweepReadme,
  makeOfflineDecryptReadme,
} from './readme.js';
