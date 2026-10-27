/**
 * What a Preserve write run must produce, per firmware: the table the
 * write run (`camera-write.e2e.ts`) holds every step to, on the
 * emulator and on the camera alike.
 *
 * A ROW IS FOUND BY WHAT THE CAMERA REPORTS, never picked by the operator: the
 * version it answered on the wire (step 02 records it as `expectedVersion`),
 * the build step 02 recognised in its active slot (`buildId`), and the known
 * edit on that build when the slot carries one (`imageDerivation`). A camera
 * with no row gets no write run: the spec stops before the gate and names
 * what it found, so a row can be measured on the emulator and added here.
 *
 * What the run can tell for itself is not in the table. The version is the
 * camera's; the image is the run's own Dump & decrypt, which step 02's backup
 * must equal in every block both read; the delivered image must equal the
 * backup in every block, and differ from the raw dump in exactly the row's
 * bytes, inside the bank the run detected; the verify re-read must equal the
 * backup. The rest (the build, the edit, the sites, the rebalance word, the
 * chunks, the checksums, the resets and the picks) belongs to the firmware.
 * It was measured once on the emulator and is written down here.
 *
 * A PART is one camera's whole flash. Its shas cannot be derived from a run
 * (on a 2016 part the bootloader block and the upper 2 MiB are out of the
 * wire's reach), so the two bench parts are named, recognised by their Dump &
 * decrypt image, and their raw and delivered dumps are held to the measured
 * shas. Another camera on a known firmware runs on the derived checks alone.
 */

import type { PhaseId } from './wizard.js';

/** One patch site as the run state records it (its name is not compared). */
export interface SiteExpectation {
  readonly offset: number;
  readonly before: readonly number[];
  readonly after: readonly number[];
}

/** What one phase of the wizard sends and asks, on a camera with no USB serial. */
export interface PhaseExpectation {
  /** ResetDevice requests the app sends. */
  readonly resets: number;
  /** "Your turn: press Connect device" picks: one per reset, since the
   *  camera has no serial and Chrome keeps no grant across a reboot. */
  readonly picks: number;
}

export interface PreserveRow {
  /** For the report. */
  readonly name: string;
  /* ---- the key: what the camera reports ---------------------------------- */
  readonly version: string;
  readonly buildId: string;
  /** The edit the slot carries on top of its factory build, or null for a factory image. */
  readonly derivation: {
    readonly id: string;
    readonly label: string;
    readonly balanceWord: number;
  } | null;
  /* ---- the plan step 02 builds ------------------------------------------- */
  readonly buildLabel: string;
  readonly buildStorage: string;
  /** The decrypted image the slot holds (the run state's `imageSha256`). */
  readonly imageSha256: string;
  readonly stagedForm: string;
  readonly restoreForm: string;
  readonly sites: readonly SiteExpectation[];
  readonly rebalanceWord: number;
  readonly stagedLength: number;
  readonly chunkCount: number;
  readonly patchedSha256: string;
  readonly armResetsCursor: boolean;
  /** Every offset inside the bank where the committed patch differs from the
   *  original: the run's whole effect on the part, enumerated. */
  readonly moved: readonly number[];
  /** CompleteMemoryUpgrade's checksum: the commit (step 03), the restore (step 04). */
  readonly sum16: { readonly commit: number; readonly restore: number };
  /** How the restore's record names what it staged back. */
  readonly restoreStaged: string;
  /* ---- the wizard -------------------------------------------------------- */
  readonly phases: Readonly<Record<PhaseId, PhaseExpectation>>;
}

export interface KnownPart {
  readonly name: string;
  /** The Dump & decrypt image's sha: how the part is recognised. */
  readonly dumpImage: string;
  /** Step 02's backup: the 31 windows at their flash addresses. */
  readonly backupImage: string;
  /** The whole flash as it booted: what the drain delivers and the restore leaves. */
  readonly asBooted: string;
  /** The whole flash with the patch committed: the drain's raw dump. */
  readonly postCommit: string;
  /** The boot record's first word, and the bank it boots. */
  readonly cfg0: number;
  readonly bank: { readonly key: string; readonly address: number; readonly mode: number };
}

/** Steps 03 and 04 each reboot the camera once (the drain's reset, the
 *  restore's); step 02 never does on either build. No replug anywhere: both
 *  patches leave the reader readable after the drain (`armResetsCursor`). */
const ONE_REBOOT_PER_WRITE: Readonly<Record<PhaseId, PhaseExpectation>> = {
  'read-build': { resets: 0, picks: 0 },
  'patch-dump': { resets: 1, picks: 1 },
  'restore-verify': { resets: 1, picks: 1 },
};

/** The bench Compact 1.3.0.0 (TESTING.md secs. 34, 36). */
const COMPACT_1300: PreserveRow = {
  name: 'Compact 1.3.0.0, the 2014 chain (five sites)',
  version: '1.3.0.0',
  buildId: 'v1-2014',
  derivation: null,
  buildLabel: 'Compact 1.x firmware (2014)',
  buildStorage: 'v1-2014',
  imageSha256: '862717a8a605021def7858ac0c04ad4aa1abe23d357d6c2417699939137f481c',
  stagedForm: 'plain',
  restoreForm: 'capture-verbatim',
  sites: [
    { offset: 0x3db4, before: [0x4f, 0xf4, 0x80, 0x33], after: [0x4f, 0xf4, 0x80, 0x03] },
    { offset: 0x3c1c, before: [0xa9, 0x89], after: [0xe9, 0x68] },
    { offset: 0x3c68, before: [0xa2, 0x89], after: [0xe2, 0x68] },
    { offset: 0x3c70, before: [0xa3, 0x81], after: [0xe3, 0x60] },
    { offset: 0x3dc6, before: [0xa5, 0x81], after: [0xe5, 0x60] },
  ],
  rebalanceWord: 0x50c06240,
  stagedLength: 47_768,
  chunkCount: 747,
  patchedSha256: '8473b5e4181b83231e15315d5b627c2f482b50c69a9600fc324e801b7fd36463',
  armResetsCursor: true,
  moved: [
    0x238, 0x239, 0x23a, 0x23b, 0x3c1c, 0x3c1d, 0x3c68, 0x3c69, 0x3c70, 0x3c71, 0x3db7, 0x3dc6,
    0x3dc7,
  ],
  sum16: { commit: 0x60ca, restore: 0x5ecc },
  restoreStaged: 'the capture verbatim',
  phases: ONE_REBOOT_PER_WRITE,
};

/** Compact PRO 1.0.3.0 carrying the Compact board patch: the bench camera
 *  since it was reflashed (TESTING.md secs. 37, 38). */
const COMPACT_PRO_1030_PN297: PreserveRow = {
  name: 'Compact PRO 1.0.3.0 with the Compact (PN297) board patch',
  version: '1.0.3.0',
  buildId: 'compact-pro-1.0.3.0',
  derivation: {
    id: 'compact-pro-1.0.3.0-accept-pn297',
    label: 'the Compact (PN297) board patch',
    balanceWord: 0x6322e32a,
  },
  buildLabel: 'Compact Pro 1.0.3.0 (9 Hz)',
  buildStorage: 'compact-2016',
  imageSha256: '68c6333409177ad4c28c758eba4325607c2795986dd08f69297fb6b252dc480b',
  stagedForm: 'xor-ks0',
  restoreForm: 'factory-staged',
  sites: [
    { offset: 0x352e, before: [0x06, 0xd1], after: [0x06, 0xe0] },
    { offset: 0x3636, before: [0x4f, 0xf4, 0x80, 0x33], after: [0x4f, 0xf4, 0x80, 0x03] },
  ],
  rebalanceWord: 0x5423132a,
  stagedLength: 51_848,
  chunkCount: 811,
  patchedSha256: '2074f65974cbfdb9016ec2aaa771a86cc091a6e131afae593536986e565e0817',
  armResetsCursor: true,
  moved: [0x239, 0x23a, 0x23b, 0x352f, 0x3639],
  sum16: { commit: 0x128f, restore: 0x132c },
  restoreStaged: 'the xor-ks0 staged form',
  phases: ONE_REBOOT_PER_WRITE,
};

export const PRESERVE_ROWS: readonly PreserveRow[] = [COMPACT_1300, COMPACT_PRO_1030_PN297];

const BANK_A = { key: 'a', address: 0x14050000, mode: 7 } as const;

/** The bench Compact 1.3.0.0's part: the corpus entry the emulator boots by default. */
export const BENCH_PART_1300: KnownPart = {
  name: 'the bench Compact 1.3.0.0 (corpus 101310HSNEA2, J-Link 40447c7e…)',
  dumpImage: '40447c7e6da5cbc84621f4694ffff5bda0f783e7807a45e80443383b19a8eb72',
  backupImage: '983a7010dc75bf03f6844847069b28e05a1897c0fce6043356d3dbbec52435df',
  asBooted: '40447c7e6da5cbc84621f4694ffff5bda0f783e7807a45e80443383b19a8eb72',
  postCommit: 'b22e9e20a9928241348c089f4e046c62f8a3f73db0ecb29dd2ce17eaa1cb6dcd',
  cfg0: 0,
  bank: BANK_A,
};

/** The bench camera reflashed with the board-patched Compact PRO 1.0.3.0
 *  (PIR324, no USB serial, J-Link 202cb5c1…). Its dump image is gap-filled:
 *  no selector on this build reaches 0x14000000 or the upper 2 MiB. */
export const BENCH_PART_1030: KnownPart = {
  name: 'the bench camera on Compact PRO 1.0.3.0 (PIR324, J-Link 202cb5c1…)',
  dumpImage: '0cb0e5444174d2dc2e851abdaff0d172c92adf3947ab3d115e9aabc933b57bf0',
  backupImage: '0cb0e5444174d2dc2e851abdaff0d172c92adf3947ab3d115e9aabc933b57bf0',
  asBooted: '202cb5c19020aeca6c0bffa83f970c09f50d8dd6162cecad78c4ad798447ef27',
  postCommit: '759280a209e0239f478928d7292ed0003af9ab024c761290678ba6e80b82b8ce',
  cfg0: 0xffffffff,
  bank: BANK_A,
};

export const KNOWN_PARTS: readonly KnownPart[] = [BENCH_PART_1300, BENCH_PART_1030];

/** What a run state says about the camera, as far as the key goes. */
export interface RowKey {
  readonly expectedVersion?: string;
  readonly buildId?: string;
  readonly imageDerivation?: { readonly id: string };
}

/** The row for what the camera reported, or null when no row covers it. */
export function preserveRowFor(key: RowKey): PreserveRow | null {
  return (
    PRESERVE_ROWS.find(
      (row) =>
        row.version === key.expectedVersion &&
        row.buildId === key.buildId &&
        (row.derivation?.id ?? null) === (key.imageDerivation?.id ?? null),
    ) ?? null
  );
}

/** The known part whose Dump & decrypt image this is, or null. */
export function knownPartByDump(dumpImageSha: string): KnownPart | null {
  return KNOWN_PARTS.find((part) => part.dumpImage === dumpImageSha) ?? null;
}

/** The known part a flash file holds (the emulator boots one), or null. */
export function knownPartByFlash(asBootedSha: string): KnownPart | null {
  return KNOWN_PARTS.find((part) => part.asBooted === asBootedSha) ?? null;
}

/** `0x5423132A`, as the wizard prints a word. */
export function hexWord(value: number, width = 8): string {
  return `0x${(value >>> 0).toString(16).toUpperCase().padStart(width, '0')}`;
}

/** The key a run state carries, in one line, for a refusal or a report. */
export function describeKey(key: RowKey): string {
  return (
    `firmware ${key.expectedVersion ?? '?'}, build ${key.buildId ?? '?'}, ` +
    `edit ${key.imageDerivation?.id ?? 'none (a factory image)'}`
  );
}
