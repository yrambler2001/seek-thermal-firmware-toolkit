/* ==================================================================== *
 * The locked-line firmwares the corpus-locked suite runs, each named by its
 * manifest fields rather than a typed id, so a renamed or missing entry fails
 * loudly instead of silently skipping. Shared by the suite and its matrix.
 *
 * WHICH BUILDS. Every locked-line build the emulator corpus carries at or above
 * 0.8.0.0: the 2014 plaintext chain (0.8.0.0 .. 1.3.0.8, the 8 Hz builds and the
 * 1.3.0.8 16 Hz FF build) and the Compact PRO 2016 keystream line (1.0.3.0 and
 * 1.0.3.2, the 9 Hz builds and the FF builds). The modern line (2.x, 4.x, 10.x,
 * 42.x, 44.x) is out of this file's scope; write.emulator.test.ts and
 * dump.emulator.test.ts cover it.
 *
 * NATIVE OR CHIMERA. A `native` subject is a full dump booted as itself. A
 * `chimera` subject is an image-only corpus entry the emulator splices onto its
 * manifest donor (the same rule the preservation suites use), so its banks hold
 * that image and its boot chain is the donor's.
 * ==================================================================== */

import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { StagingForm } from '../../src/slots/types.js';
import type { ManifestEntry } from '../emulator/harness.js';
import { loadManifest } from '../emulator/harness.js';
import { EMU_DIR } from '../emulator/suite.js';

/**
 * The Spansion 4 MB part the Compact PRO bootloaders can erase: manufacturer 0x01,
 * type 0x02, capacity 0x15 (32 Mbit). The bench Compact measured this id; the PRO
 * board's own chip was never read (FW-V1 docs/EMULATOR_CORPUS.md sec.33.5).
 */
export const SPANSION_4MB_JEDEC = '010215';

export type Boot = 'native' | 'chimera';

/** A corpus manifest entry, with the two fields this suite reads that the harness type leaves out. */
export interface CorpusEntry extends ManifestEntry {
  readonly variant: string;
  readonly vendored_path: string;
}

export interface LockedSubject {
  /** Short name for the matrix and the test titles. */
  readonly label: string;
  /** The firmware version the camera is expected to report. */
  readonly version: string;
  /** 'ff' builds are the 16 Hz / 18 Hz variants; 'std' the 8 Hz / 9 Hz ones. */
  readonly variant: 'std' | 'ff';
  readonly boot: Boot;
  /** The manifest family the entry belongs to. */
  readonly family: 'compact' | 'compact_pro';
  /** The manifest entry's kind and serial: the unique key a subject names. */
  readonly kind: ManifestEntry['kind'];
  readonly serial: string;
  /** The profile id the camera's own probe is expected to pick. */
  readonly profileId: 'legacy-auth' | 'compact-2016';
  /** The staging form the capability plan names for this build. */
  readonly staging: StagingForm;
  /**
   * `--jedec` for this boot, or null for the manifest's own part. The 2016 Compact
   * PRO dumps carry no measured `emu.nor`, so the model's default Winbond part
   * (EF 40 16) would answer. The 2016 bootloader's ROM-style driver erases only a
   * Spansion part, so the default refuses every commit with 0x0004000x (see the
   * FINDING in corpus-locked.emulator.test.ts). The Spansion id is the emulator
   * configuration the preservation suites run these builds on.
   */
  readonly jedec: string | null;
  /**
   * `--donor` for this boot: the corpus entry an image-only boot is spliced onto, when it is not
   * the manifest's own. Absent means the manifest's donor.
   */
  readonly donor?: string;
  /** What is particular about this row, printed with it. */
  readonly note: string;
}

const CHIMERA_2014 = 'the image-only entry on the 1.3.0.0 2014 donor dump';

/**
 * The 2014 plaintext donor the preservation suite boots the FF image on (families.emulator.test.ts):
 * its banks hold the image as-is, as the 2014 chain stores it. The FF entry's manifest donor is the
 * 4.8.2.1 dump, which stores the image under another bank form, so its bytes are not the FF build's
 * own and a commit there says nothing about the camera the FF image runs on.
 */
const DONOR_2014 = '101310HSNEA2/dump';

export const LOCKED_SUBJECTS: readonly LockedSubject[] = [
  {
    label: 'Compact 0.8.0.0',
    version: '0.8.0.0',
    variant: 'std',
    boot: 'chimera',
    family: 'compact',
    kind: 'image-only',
    serial: 'no-serial',
    profileId: 'legacy-auth',
    staging: 'plain',
    jedec: null,
    note: CHIMERA_2014,
  },
  {
    label: 'Compact 0.9.0.2',
    version: '0.9.0.2',
    variant: 'std',
    boot: 'chimera',
    family: 'compact',
    kind: 'image-only',
    serial: 'no-serial',
    profileId: 'legacy-auth',
    staging: 'plain',
    jedec: null,
    note: CHIMERA_2014,
  },
  {
    label: 'Compact 0.9.0.6',
    version: '0.9.0.6',
    variant: 'std',
    boot: 'chimera',
    family: 'compact',
    kind: 'image-only',
    serial: 'no-serial',
    profileId: 'legacy-auth',
    staging: 'plain',
    jedec: null,
    note: CHIMERA_2014,
  },
  {
    label: 'Compact 0.9.0.7',
    version: '0.9.0.7',
    variant: 'std',
    boot: 'chimera',
    family: 'compact',
    kind: 'image-only',
    serial: 'no-serial',
    profileId: 'legacy-auth',
    staging: 'plain',
    jedec: null,
    note: CHIMERA_2014,
  },
  {
    label: 'Compact 0.9.1.0',
    version: '0.9.1.0',
    variant: 'std',
    boot: 'chimera',
    family: 'compact',
    kind: 'image-only',
    serial: 'no-serial',
    profileId: 'legacy-auth',
    staging: 'plain',
    jedec: null,
    note: CHIMERA_2014,
  },
  {
    label: 'Compact 0.10.0.0',
    version: '0.10.0.0',
    variant: 'std',
    boot: 'chimera',
    family: 'compact',
    kind: 'image-only',
    serial: 'no-serial',
    profileId: 'legacy-auth',
    staging: 'plain',
    jedec: null,
    note: CHIMERA_2014,
  },
  {
    label: 'Compact 1.0.0.0',
    version: '1.0.0.0',
    variant: 'std',
    boot: 'chimera',
    family: 'compact',
    kind: 'image-only',
    serial: 'no-serial',
    profileId: 'legacy-auth',
    staging: 'plain',
    jedec: null,
    note: CHIMERA_2014,
  },
  {
    label: 'Compact 1.2.0.0',
    version: '1.2.0.0',
    variant: 'std',
    boot: 'chimera',
    family: 'compact',
    kind: 'image-only',
    serial: 'no-serial',
    profileId: 'legacy-auth',
    staging: 'plain',
    jedec: null,
    note: CHIMERA_2014,
  },
  {
    label: 'Compact 1.3.0.0 (native dump)',
    version: '1.3.0.0',
    variant: 'std',
    boot: 'native',
    family: 'compact',
    kind: 'full-dump',
    serial: '101310HSNEA2',
    profileId: 'legacy-auth',
    staging: 'plain',
    jedec: null,
    note: 'the full dump booted as itself',
  },
  {
    label: 'Compact 1.3.0.0 (chimera)',
    version: '1.3.0.0',
    variant: 'std',
    boot: 'chimera',
    family: 'compact',
    kind: 'image-only',
    serial: 'no-serial',
    profileId: 'legacy-auth',
    staging: 'plain',
    jedec: null,
    note: CHIMERA_2014,
  },
  {
    label: 'Compact 1.3.0.8 (8 Hz)',
    version: '1.3.0.8',
    variant: 'std',
    boot: 'chimera',
    family: 'compact',
    kind: 'image-only',
    serial: 'no-serial',
    profileId: 'legacy-auth',
    staging: 'plain',
    jedec: null,
    note: CHIMERA_2014,
  },
  {
    label: 'Compact 1.3.0.8-FF (16 Hz)',
    version: '1.3.0.8',
    variant: 'ff',
    boot: 'chimera',
    family: 'compact',
    kind: 'image-only',
    serial: 'no-serial',
    profileId: 'legacy-auth',
    staging: 'plain',
    /* The 2014 donor with the Spansion part the preservation suite runs the FF commit on: the app's
     * commit only erases a Spansion part (the same driver fact as the 2016 rows, see the FINDING in
     * corpus-locked.emulator.test.ts), and the FF build's own tests use this boot. */
    jedec: SPANSION_4MB_JEDEC,
    donor: DONOR_2014,
    note: 'boots only from recovery on the 2014 bootloader (word sum 0xFFFF); written to A, B and R in its vendor form, stored under Key B (TESTING.md 42.12); on the 2014 donor with a Spansion part',
  },
  {
    label: 'Compact PRO 1.0.3.0 (9 Hz, native dump)',
    version: '1.0.3.0',
    variant: 'std',
    boot: 'native',
    family: 'compact_pro',
    kind: 'full-dump',
    serial: '0C21A1M5KP15',
    profileId: 'compact-2016',
    staging: 'slot-keystream-ciphertext',
    jedec: SPANSION_4MB_JEDEC,
    note: 'the full dump booted as itself',
  },
  {
    label: 'Compact PRO 1.0.3.0 (9 Hz, chimera)',
    version: '1.0.3.0',
    variant: 'std',
    boot: 'chimera',
    family: 'compact_pro',
    kind: 'image-only',
    serial: 'no-serial',
    profileId: 'compact-2016',
    staging: 'slot-keystream-ciphertext',
    jedec: SPANSION_4MB_JEDEC,
    note: 'the image-only entry on the 0C21A1M5KP15 dump',
  },
  {
    label: 'Compact PRO 1.0.3.0 (FF, native dump)',
    version: '1.0.3.0',
    variant: 'ff',
    boot: 'native',
    family: 'compact_pro',
    kind: 'full-dump',
    serial: '0B14A1JULD54',
    profileId: 'compact-2016',
    staging: 'slot-keystream-ciphertext',
    jedec: SPANSION_4MB_JEDEC,
    note: 'the full dump booted as itself',
  },
  {
    label: 'Compact PRO 1.0.3.0 (FF, chimera)',
    version: '1.0.3.0',
    variant: 'ff',
    boot: 'chimera',
    family: 'compact_pro',
    kind: 'image-only',
    serial: '0B14A1JULD54',
    profileId: 'compact-2016',
    staging: 'slot-keystream-ciphertext',
    jedec: SPANSION_4MB_JEDEC,
    note: 'the image-only entry on the 0B14A1JULD54 FF dump',
  },
  {
    label: 'Compact PRO 1.0.3.2 (9 Hz, chimera)',
    version: '1.0.3.2',
    variant: 'std',
    boot: 'chimera',
    family: 'compact_pro',
    kind: 'image-only',
    serial: 'no-serial',
    profileId: 'compact-2016',
    staging: 'slot-keystream-ciphertext',
    jedec: SPANSION_4MB_JEDEC,
    note: 'on the 0C21A1M5KP15 dump; EP0 limit, one 64 KiB bank per session',
  },
  {
    label: 'Compact PRO 1.0.3.2 (FF 18 Hz, chimera)',
    version: '1.0.3.2',
    variant: 'ff',
    boot: 'chimera',
    family: 'compact_pro',
    kind: 'image-only',
    serial: 'no-serial',
    profileId: 'compact-2016',
    staging: 'slot-keystream-ciphertext',
    jedec: SPANSION_4MB_JEDEC,
    note: 'on the 0B14A1JULD54 FF dump',
  },
];

/*
 * WHAT EACH BUILD CAN SHOW. The page reads a bootloader window and names the booted
 * bank only where the build's own tables let it. These are the declared limits, read
 * from legacy-auth's per-build traits (`modeOne`, `modeTwo`) and its holes, and each
 * one is pinned by the suite rather than skipped:
 *   - the bootloader block (0x14000000) is armed by mode 2. Mode 2 is `indirect` on
 *     0.8.0.0 (the handler arms the word stored there, not a window), `differs` on
 *     1.3.0.8 (the 16 Hz build refuses it, the 8 Hz arms it, one version string), and
 *     `refused` on 1.0.3.x (the `mode == 2` test runs first). Only the other 2014
 *     builds expose it.
 *   - the booted bank is named from the 2014 plaintext chain's active-slot word, which
 *     needs a mode-0 row this build decodes (`legacyUpgradeTargetBuild`): not on
 *     0.8.0.0 (`modeOne` boot-config), and not for the 16 Hz FF build (one version
 *     string with the 8 Hz build, whose prediction is blocked). The 1.0.3.x line's
 *     selectBootSlot is not reconstructed (`profile/unsupported`).
 */
export function bootloaderIsRead(subject: LockedSubject): boolean {
  if (subject.staging !== 'plain') return false;
  return subject.version !== '0.8.0.0' && subject.version !== '1.3.0.8';
}

export function bootedIsNamed(subject: LockedSubject): boolean {
  if (subject.staging !== 'plain') return false;
  return subject.version !== '0.8.0.0' && subject.variant !== 'ff';
}

/**
 * The 16 Hz 1.3.0.8 FF image (word sum 0xFFFF): the writer stages it in its vendor form (the image XOR
 * Key A, header window verbatim) to A, B or R, and the camera stores the image XOR Key B (TESTING.md
 * 42.12). The 2014 bootloader rejects its sum at A and B, so it runs only from recovery R there (42.10).
 */
export function isFFImage(subject: LockedSubject): boolean {
  return subject.staging === 'plain' && subject.variant === 'ff';
}

/** The manifest's entries, or none when the emulator corpus is not present. */
export function corpusEntries(): readonly CorpusEntry[] {
  if (EMU_DIR === null) return [];
  return loadManifest(EMU_DIR) as readonly CorpusEntry[];
}

/**
 * The one manifest entry a subject names. Null when the corpus lacks it; throws
 * when its fields name more than one entry, because the subject would then be
 * testing an arbitrary one of them.
 */
export function entryFor(
  subject: LockedSubject,
  entries: readonly CorpusEntry[],
): CorpusEntry | null {
  const hits = entries.filter(
    (e) =>
      e.family === subject.family &&
      e.version === subject.version &&
      e.variant === subject.variant &&
      e.kind === subject.kind &&
      (e.serial ?? 'no-serial') === subject.serial,
  );
  if (hits.length > 1) {
    throw new Error(
      `corpus-locked: ${subject.label} names ${String(hits.length)} manifest entries, not one`,
    );
  }
  return hits[0] ?? null;
}

/** The entry's vendored bytes: the decrypted image for an image-only entry, the dump for a full one. */
export function vendoredBytes(entry: CorpusEntry): Uint8Array {
  if (EMU_DIR === null) throw new Error('corpus-locked: no emulator directory');
  return new Uint8Array(readFileSync(path.join(EMU_DIR, entry.vendored_path)));
}
