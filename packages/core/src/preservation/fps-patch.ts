/* ==================================================================== *
 * Making a stock firmware publish at a higher frame rate, on its bytes.
 *
 * A port of FW-V1 emu/fps_patch.py, which is the source of truth. The table
 * (fps-patch-table.ts) is generated from that file, and the differential test
 * (test/preservation/fps-patch.differential.test.ts) checks this module's output
 * against the Python's byte for byte on every corpus image the Python patches.
 *
 * WHAT A PATCH IS. A fixed set of byte edits to the DECRYPTED image, each at a known
 * offset with the bytes it expects there, plus the acceptance sum kept by moving the
 * reserved adjust word at 0x238 by the same amount. The embedded key pair and every
 * other byte are left as they are. The map holds plain bytes only: no encrypted bytes
 * and no key identity, so it says nothing about how the bank is stored. Whether the
 * bytes can be written is the slot layer's business (slots/fps-patch.ts).
 *
 * WHICH BUILD. An image is identified by the SHA-256 of its decrypted bytes (its
 * header.length of them), never by the camera's version string: the 1.3.0.8 8 Hz build
 * and its 16 Hz FF build share one version string, and only the image tells them apart.
 * The camera's version is checked against the entry as a second, refusing, check.
 *
 * THE STAGES. Each offered entry has been staged on its own line, and only then is it
 * offered (see `gateOf`):
 *   - stage one: the 2014 plain chain, whose banks are stored as plain bytes (the Compact 0.8.0.0
 *     to 1.3.0.8, 8 Hz). The write is byte-exact on the read-back. Entries of 0.8.0.0 and later that the
 *     slots code writes plain are offered on the same terms as the measured ones (the owner's decision).
 *   - stage two: the 4.x line (the Compact 4.8.1.7, 4.8.1.9, 4.8.2.1 and the Compact PRO 4.9.1.15, 4.9.2.0),
 *     whose banks are staged under the camera's Key A and stored under the bank's own key. The write is
 *     checked on the read-back DECRYPTED, against the patched image (slots/fps-patch.ts).
 *   - stage three: the Compact PRO 2016 keystream line (1.0.3.0 and 1.0.3.2, 9 Hz), whose banks are
 *     staged under the image's own stage key (key block 0, not Key A) and stored under block 1. The
 *     write is checked on the read-back DECRYPTED, the same way (slots/fps-patch.ts).
 * Every other entry stays in the table with its gate recorded as "stage two: ...", so it can
 * be switched on after its own staging check.
 *
 * REFUSES, FAIL CLOSED: an image that is not a stock image of a table entry; an edit
 * site whose old bytes are not there; a patched image whose changed bytes are not the
 * documented ones; a sum that moved; an output that does not hash to the table.
 * ==================================================================== */

import { SeekError } from '../errors.js';
import { hexToBytes, equalBytes } from '../bytes.js';
import { ADJUST_OFFSET, HEADER_OFFSET, IMAGE_MAGIC, LENGTH_OFFSET } from '../image/header.js';
import { wordSum32 } from '../image/bank.js';
import { sha256Sync } from '../slots/write-sha.js';
import { FPS_KNOWN_RATE, FPS_PATCH_TABLE, type FpsPatchSource } from './fps-patch-table.js';

export { FPS_NOT_PATCHED_NOTES } from './fps-patch-table.js';

/** The reserved adjust word that keeps the acceptance sum (0x238, cleartext). */
export const FPS_ADJUST_OFFSET = ADJUST_OFFSET;

/** The frame rates the table makes: 18 (Compact PRO) and 32 (Compact 32K). There is no 16 Hz patch (TESTING.md 42.26). */
export const FPS_TARGET_RATES: readonly number[] = [18, 32];

export interface FpsEdit {
  /** Offset into the decrypted image. */
  readonly offset: number;
  /** The bytes the image must hold there. */
  readonly before: Uint8Array;
  /** The bytes that replace them. */
  readonly after: Uint8Array;
}

export interface FpsSibling {
  readonly sha256: string;
  readonly offset: number;
  readonly length: number;
}

/** The steady-state record the edit lives in, for the page to name. */
export interface FpsRow {
  readonly label: string;
  readonly offset: number;
  readonly length: number;
}

export interface FpsGate {
  /** True on stage one: the entry may be offered. */
  readonly enabled: boolean;
  /** Null when enabled; otherwise the recorded reason, starting "stage two:". */
  readonly reason: string | null;
}

export interface FpsPatch {
  readonly id: string;
  readonly family: string;
  /** The version the Python names it: "1.3.0.8" (8 Hz) or "1.3.0.8-FF" (16 Hz FF). */
  readonly version: string;
  readonly fromHz: number;
  readonly targetHz: number;
  readonly stockSha256: string;
  readonly patchedSha256: string;
  readonly length: number;
  readonly edits: readonly FpsEdit[];
  readonly row: FpsRow;
  readonly sibling: FpsSibling | null;
  readonly gate: FpsGate;
}

/**
 * Whether the stage-one offer is withheld. It was withheld after the first bench run (TESTING.md 42.14), whose
 * 8.29 fps reading was taken before the written image ran. 42.15 corrects it: the 1.3.0.0 patch gives 16.00 fps in
 * IP mode 6 after a power cycle; the per-frame shutter is stock mode-6 behaviour (the patch doubles the blade's
 * motion, inferred). The owner re-enabled the offer, with no warning, on 2026-10-18. The switch stays so a later
 * finding can turn the offer off again.
 */
export const FPS_OFFER_WITHHELD = false as boolean;

const WITHHELD_REASON =
  'withheld after the bench run (TESTING.md 42.14): on the physical camera the patch did not raise ' +
  'the publish rate, and the shutter fired on every frame after the write';

/**
 * The stage-one entries: the plain 2014 chain, the builds slots/capability-family.ts stages plain (PLAIN_CHAIN_VERSIONS,
 * 0.8.0.0 to 1.3.0.8). 0.7.0.8 has an entry too, but the slots code refuses it (older than 0.8.0.0), so it is not here.
 * Pinned by a test, so a change is deliberate.
 */
export const FPS_STAGE_ONE_IDS: ReadonlySet<string> = new Set([
  'compact_32k-0.8.0.0-to32',
  'compact_32k-0.9.0.2-to32',
  'compact_32k-0.9.0.6-to32',
  'compact_32k-0.9.0.7-to32',
  'compact_32k-0.9.1.0-to32',
  'compact_32k-0.10.0.0-to32',
  'compact_32k-1.0.0.0-to32',
  'compact_32k-1.2.0.0-to32',
  'compact_32k-1.3.0.0-to32',
  'compact_32k-1.3.0.8-to32',
]);

/**
 * The stage-two entries: the 4.x line (the Compact 4.8.x, and the Compact PRO 4.9.x at 18 Hz, TESTING.md 42.28),
 * staged under the camera's Key A and stored under the bank's own key (the device re-keys the upload in
 * fw_validate_decrypt_program). Pinned by a test. Their write is checked on the read-back decrypted
 * (slots/fps-patch.ts, TESTING.md 42.22).
 */
export const FPS_STAGE_TWO_IDS: ReadonlySet<string> = new Set([
  'compact_32k-4.8.1.7-to32',
  'compact_32k-4.8.1.9-to32',
  'compact_32k-4.8.2.1-to32',
  'compact_pro-4.9.1.15',
  'compact_pro-4.9.2.0',
]);

/**
 * The stage-three entries: the Compact PRO 2016 keystream line, the 9 Hz builds 1.0.3.0 and 1.0.3.2. Their banks
 * store the image under a key block of the image's own pair (the stage key is key block 0, found in the image by
 * value), not under the camera's Key A, so they are a third staging form and a separate set: the stage-two
 * entries' write and read-back are about Key A. Written as slots/write-image.ts `buildSlotKeystreamPayload`
 * stages it, checked on the read-back decrypted (slots/fps-patch.ts). Pinned by a test.
 */
export const FPS_STAGE_THREE_IDS: ReadonlySet<string> = new Set([
  'compact_pro-1.0.3.0',
  'compact_pro-1.0.3.2',
]);

/** True when a dotted build version is older than `than` (an FF suffix is ignored). */
function versionBefore(version: string, than: string): boolean {
  const a = version.replace(/-FF$/, '').split('.').map(Number);
  const b = than.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x < y;
  }
  return false;
}

/** Why an entry outside the three stage sets is not offered yet. Null for an offered entry. */
function gateOf(source: FpsPatchSource): FpsGate {
  if (
    FPS_STAGE_ONE_IDS.has(source.id) ||
    FPS_STAGE_TWO_IDS.has(source.id) ||
    FPS_STAGE_THREE_IDS.has(source.id)
  ) {
    return FPS_OFFER_WITHHELD
      ? { enabled: false, reason: WITHHELD_REASON }
      : { enabled: true, reason: null };
  }
  if (versionBefore(source.version, '0.8.0.0')) {
    return {
      enabled: false,
      reason:
        `firmware ${source.version} is older than 0.8.0.0: its RPC table has no read handler for ` +
        'GetFeaturedFirmwareData, the only command a bank is read with, so the slots code refuses the ' +
        'build and the page does not offer this patch (slots/capability-family.ts FIRST_SUPPORTED_VERSION)',
    };
  }
  let why: string;
  if (source.version.endsWith('-FF')) {
    why =
      'stage two: the 16 Hz FF build is staged as the vendor app stages it (the image XOR Key A, ' +
      'stored under Key B), not as plain bytes, so its staging check is not done and the page does ' +
      'not offer this patch yet';
  } else {
    why =
      'stage two: this entry is not in the stage-two set, so its staging check is not done and the ' +
      'page does not offer this patch yet';
  }
  return { enabled: false, reason: why };
}

/** The table as bytes, with each entry's gate. Built once. */
export const FPS_PATCHES: readonly FpsPatch[] = FPS_PATCH_TABLE.map((source) => ({
  id: source.id,
  family: source.family,
  version: source.version,
  fromHz: source.fromHz,
  targetHz: source.targetHz,
  stockSha256: source.stockSha256,
  patchedSha256: source.patchedSha256,
  length: source.length,
  edits: source.edits.map((edit) => ({
    offset: edit.offset,
    before: hexToBytes(edit.before),
    after: hexToBytes(edit.after),
  })),
  row: { ...source.row },
  sibling: source.sibling === null ? null : { ...source.sibling },
  gate: gateOf(source),
}));

/**
 * The rate an entry was MEASURED to publish at on the bench, where that differs from the table's target
 * (the byte edits are the table's and are not changed). The offer names this rate: the page's button, its note
 * and its confirmation, and the CLI's plan, all read the plan's toHz. Entries not listed run at their target.
 *
 * No entry is listed. compact_pro-4.9.1.15 is offered at its 18 Hz target like the other Compact PRO entries
 * (owner, 2026-10-26); its camera measurement is in TESTING.md 42.32.
 *
 * The 1.3.0.8 32 Hz entry is not listed. 42.20 measured its earlier op-5 form (image ee8c7f0e) at 26 fps, but
 * that is a whole-run average over 20 s, which counts the captures the stream never publishes; the steady
 * median of that image is 32.2 fps, and 42.20's tool reads it at 26.3 to 26.9 fps over the whole run
 * (TESTING.md 42.37 sec.3a). The table's entry is the plain-copy form (image 5313f107): 42.27 measured it on the
 * camera at 32.16 to 32.20 fps by per-second medians, and its whole-run rate has not been measured, so it names
 * its target (32 Hz).
 */
export const FPS_MEASURED_HZ: ReadonlyMap<string, number> = new Map<string, number>([]);

/** The corpus builds that already run at a target rate, by the SHA-256 of the decrypted image. */
export const FPS_KNOWN_BUILDS: ReadonlyMap<string, { readonly name: string; readonly hz: number }> =
  new Map(Object.entries(FPS_KNOWN_RATE).map(([sha, value]) => [sha, value] as const));

/* ==================================================================== *
 * The image
 * ==================================================================== */

/** The image's own length (header.length, magic at 0x200 checked), or null when it is no image. */
export function fpsImageLength(image: Uint8Array): number | null {
  if (image.length < ADJUST_OFFSET + 4) return null;
  const view = new DataView(image.buffer, image.byteOffset, image.byteLength);
  if (view.getUint32(HEADER_OFFSET, true) !== IMAGE_MAGIC) return null;
  const n = view.getUint32(LENGTH_OFFSET, true);
  return n > 0 && n <= image.length && n % 4 === 0 ? n : null;
}

function shaOf(image: Uint8Array, n: number): string {
  return sha256Sync(image.subarray(0, n));
}

/** What an image is, from its own bytes: the table entries it is the stock or patched image of. */
export interface FpsIdentity {
  /** The image's header.length, or null when the bytes are no image. */
  readonly length: number | null;
  /** The SHA-256 of the image's header.length bytes, or null. */
  readonly sha256: string | null;
  /** Table entries whose STOCK image this is (all targets; a 1.3.0.8 image lists both). */
  readonly stockEntries: readonly FpsPatch[];
  /** Table entries whose PATCHED image this is. */
  readonly patchedEntries: readonly FpsPatch[];
  /** A corpus build that already runs at a target rate, or null. */
  readonly known: { readonly name: string; readonly hz: number } | null;
}

export function identifyFpsImage(image: Uint8Array): FpsIdentity {
  const n = fpsImageLength(image);
  if (n === null) {
    return { length: null, sha256: null, stockEntries: [], patchedEntries: [], known: null };
  }
  const sha256 = shaOf(image, n);
  return {
    length: n,
    sha256,
    stockEntries: FPS_PATCHES.filter((patch) => patch.stockSha256 === sha256),
    patchedEntries: FPS_PATCHES.filter((patch) => patch.patchedSha256 === sha256),
    known: FPS_KNOWN_BUILDS.get(sha256) ?? null,
  };
}

/**
 * The acceptance sum the image must keep: the 32-bit word sum over header.length bytes. The
 * adjust word is part of it, so a patch that keeps the sum keeps the bootloader's check.
 */
function sumOf(image: Uint8Array, n: number): number {
  return wordSum32(image, n);
}

/* ==================================================================== *
 * Applying a patch, and checking the result before anything is sent
 * ==================================================================== */

/** The offsets (into the image) that a patch is allowed to change: the edit bytes that differ, and the adjust word where it moved. */
export function fpsExpectedChanges(
  patch: FpsPatch,
  original: Uint8Array,
  patched: Uint8Array,
): number[] {
  const want = new Set<number>();
  for (const edit of patch.edits) {
    for (let k = 0; k < edit.before.length; k++) {
      if (edit.before[k] !== edit.after[k]) want.add(edit.offset + k);
    }
  }
  for (let o = FPS_ADJUST_OFFSET; o < FPS_ADJUST_OFFSET + 4; o++) {
    if (original[o] !== patched[o]) want.add(o);
  }
  return [...want].sort((a, b) => a - b);
}

/**
 * The patched image: the edits applied and the adjust word moved by the sum's change, so the
 * acceptance sum is the same as the stock image's. Refuses with the reason when the stock image
 * is not this entry's, a site does not hold its old bytes, or the output is not the table's.
 */
export function applyFpsPatch(image: Uint8Array, patch: FpsPatch): Uint8Array {
  const n = fpsImageLength(image);
  if (n === null || shaOf(image, n) !== patch.stockSha256) {
    throw refused(`${patch.id}: not the stock image this patch was written for`);
  }
  const out = image.slice();
  for (const edit of patch.edits) {
    const at = image.subarray(edit.offset, edit.offset + edit.before.length);
    if (!equalBytes(at, edit.before)) {
      throw refused(
        `${patch.id}: the bytes at image +0x${edit.offset.toString(16)} are not the ` +
          'expected original, so this image is not the stock build the patch was written for',
      );
    }
    out.set(edit.after, edit.offset);
  }
  const before = sumOf(image, n);
  const delta = (sumOf(out, n) - before) >>> 0;
  const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
  const adjust = view.getUint32(FPS_ADJUST_OFFSET, true);
  view.setUint32(FPS_ADJUST_OFFSET, (adjust - delta) >>> 0, true);
  if (sumOf(out, n) !== before) {
    throw refused(`${patch.id}: could not keep the acceptance sum`);
  }
  if (shaOf(out, n) !== patch.patchedSha256) {
    throw refused(`${patch.id}: the patched image does not match the table`);
  }
  return out;
}

/**
 * The pre-send check: the patched image differs from the original in exactly the documented bytes
 * (the edit sites that change, and the adjust word where it moved), keeps the acceptance sum, and
 * hashes to the table. Returns the changed offsets. Throws otherwise.
 */
export function verifyFpsPatchedImage(
  original: Uint8Array,
  patched: Uint8Array,
  patch: FpsPatch,
): number[] {
  const n = fpsImageLength(original);
  if (n === null) throw refused(`${patch.id}: the original is not an image`);
  if (patched.length !== original.length) {
    throw refused(
      `${patch.id}: the patched image is ${String(patched.length)} B, the original ${String(original.length)} B`,
    );
  }
  const changed: number[] = [];
  for (let o = 0; o < n; o++) if (original[o] !== patched[o]) changed.push(o);
  const expected = fpsExpectedChanges(patch, original, patched);
  if (changed.length !== expected.length || changed.some((o, i) => o !== expected[i])) {
    throw refused(
      `${patch.id}: the patched image changes ${String(changed.length)} byte(s), not the documented ones ` +
        `(${String(expected.length)})`,
    );
  }
  if (sumOf(patched, n) !== sumOf(original, n)) {
    throw refused(`${patch.id}: the acceptance sum moved`);
  }
  if (shaOf(patched, n) !== patch.patchedSha256) {
    throw refused(`${patch.id}: the patched image does not hash to the table`);
  }
  return changed;
}

/* ==================================================================== *
 * The plan for one image: offer, or the reason there is none
 * ==================================================================== */

/** One byte site a patch changes, with what the image holds now and what it will hold. */
export interface FpsSite {
  readonly offset: number;
  readonly before: number;
  readonly after: number;
}

export type FpsPlan =
  | {
      readonly status: 'offer';
      readonly patch: FpsPatch;
      readonly fromHz: number;
      /** The rate the page names: the bench-measured rate (FPS_MEASURED_HZ) where one is recorded, else the target. */
      readonly toHz: number;
      /** The bytes the patch changes (the edit bytes that differ). */
      readonly sites: readonly FpsSite[];
      /** The adjust word, which moves to keep the acceptance sum. */
      readonly sumWord: { readonly offset: number; readonly before: number };
    }
  | { readonly status: 'patched'; readonly reason: string; readonly hz: number }
  | { readonly status: 'at-rate'; readonly reason: string; readonly hz: number }
  | { readonly status: 'refused'; readonly reason: string };

/**
 * What can be done to one decrypted image: the table entry for its rate, or why none. The
 * entry is the image's own stock entry at the HIGHEST target the table makes for it; a build
 * the table does not make is refused; an image whose entry is gated is refused with the gate's
 * reason. `cameraVersion` is the build the camera runs; it must be the entry's build.
 */
export function planFpsPatch(image: Uint8Array, cameraVersion: string | null): FpsPlan {
  const identity = identifyFpsImage(image);
  if (identity.length === null || identity.sha256 === null) {
    return {
      status: 'refused',
      reason: 'this is not a firmware image, so no frame-rate patch applies to it',
    };
  }
  if (identity.stockEntries.length > 0) {
    const entry = [...identity.stockEntries].sort((a, b) => b.targetHz - a.targetHz)[0];
    if (entry === undefined) throw new Error('unreachable: stock entries are not empty');
    if (!entry.gate.enabled)
      return { status: 'refused', reason: entry.gate.reason ?? 'not offered' };
    const build = entry.version.replace(/-FF$/, '');
    if (cameraVersion !== build) {
      return {
        status: 'refused',
        reason:
          `the image is the ${entry.version} build ("${entry.id}"), but the camera reports ` +
          `${cameraVersion ?? 'no version'}; the patch is refused rather than applied to a build it does not match`,
      };
    }
    const sites: FpsSite[] = [];
    for (const edit of entry.edits) {
      for (let k = 0; k < edit.before.length; k++) {
        if (edit.before[k] !== edit.after[k]) {
          sites.push({
            offset: edit.offset + k,
            before: edit.before[k] ?? 0,
            after: edit.after[k] ?? 0,
          });
        }
      }
    }
    const adjust = new DataView(image.buffer, image.byteOffset, image.byteLength).getUint32(
      FPS_ADJUST_OFFSET,
      true,
    );
    return {
      status: 'offer',
      patch: entry,
      fromHz: entry.fromHz,
      toHz: FPS_MEASURED_HZ.get(entry.id) ?? entry.targetHz,
      sites,
      sumWord: { offset: FPS_ADJUST_OFFSET, before: adjust },
    };
  }
  if (identity.patchedEntries.length > 0) {
    const entry = identity.patchedEntries[0];
    if (entry === undefined) throw new Error('unreachable: patched entries are not empty');
    const hz = FPS_MEASURED_HZ.get(entry.id) ?? entry.targetHz;
    return {
      status: 'patched',
      reason: `already patched: this image runs at ${String(hz)} Hz (${entry.id}), so no patch is offered`,
      hz,
    };
  }
  if (identity.known !== null) {
    return {
      status: 'at-rate',
      reason: `already runs at ${String(identity.known.hz)} Hz (${identity.known.name}), so no patch is offered`,
      hz: identity.known.hz,
    };
  }
  if (cameraVersion === FPS_NO_PATCH_4821_VERSION) {
    return { status: 'refused', reason: FPS_NO_PATCH_4821_REASON };
  }
  return {
    status: 'refused',
    reason:
      'this image is not in the frame-rate patch table, so no frame-rate patch is made for this build. ' +
      'The table names the Compact 0.7.0.8 to 1.3.0.8 (8 Hz; 0.7.0.8 is refused by the slots code), 1.3.0.8 (16 Hz FF), ' +
      '4.8.1.7, 4.8.1.9, 4.8.2.1 and 4.16.1.7 FF builds and the Compact PRO 1.0.3.x and 4.9.x builds; no other build has an entry',
  };
}

/**
 * The build of the Compact 4.8.2.1 and of the Compact XR 4.8.2.1. Checked 2026-10-19 (TESTING.md 42.34): in each
 * unit's full dump the first 42,680 bytes of the 0x14030000 bank are the same ciphertext, and core's decryptDump
 * decrypts them to one image, f96ac57eda75 (byte for byte the XR corpus file). The other two banks of both dumps
 * decrypt to that image too.
 */
export const FPS_NO_PATCH_4821_VERSION = '4.8.2.1';

/**
 * Why an image that claims the 4.8.2.1 build but is not the stock image the table names is refused: the table patches
 * the stock image's steady command page (68-byte pages, include/fw_types.h cmd_page_t) and no other 4.8.2.1 image.
 */
export const FPS_NO_PATCH_4821_REASON =
  'this image reports the Compact 4.8.2.1 build (or the Compact XR 4.8.2.1, the same build) but is not the stock ' +
  'image the frame-rate patch was written for (f96ac57eda75: its 68-byte command pages, steady page 13), so no ' +
  'frame-rate patch is made for it (TESTING.md 42.24)';

function refused(message: string): SeekError {
  return new SeekError('slots/refused', message);
}
