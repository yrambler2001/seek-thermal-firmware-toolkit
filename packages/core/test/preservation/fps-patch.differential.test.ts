/* ====================================================================
 * The frame-rate patch table, checked against the Python tool that wrote it.
 *
 * fps-patch-python.json is the output of FW-V1 emu/fps_patch.py (identify, apply_patch and
 * the dump bank walk) over the corpus: for every decrypted image and every 4 MiB dump bank it
 * identifies, the Python's verdict, the output sha256 and the changed offsets.
 *
 * WITHOUT THE CORPUS (always runs): the table has every entry the Python has, with the same
 * stock and patched hashes, and the stage-one gate is exactly the plain 2014 chain.
 *
 * WITH THE CORPUS (SEEK_FPS_CORPUS, a colon-separated list of directories to search, e.g. the
 * SEEK_FULL_DUMPS_BY_CAMERA tree and the FW-V1 base images): every fixture image and plain bank
 * is found by its hash, and the TypeScript output of every entry is compared with the Python's
 * byte for byte (sha256 of the whole patched image) and offset for offset (the changed bytes).
 * A case whose file is not found FAILS, so an incomplete corpus cannot pass silently.
 *
 * THE EARLIER 32 Hz IMAGES (TESTING.md 42.97). The images the 32 Hz entries wrote before the no-skip
 * branch joined them are known 32 Hz builds that a patch wrote (`earlierPatch`), and no corpus holds
 * them. Their cases carry `derivedFrom` (the entry's stock image) and are rebuilt here from that corpus
 * image: the entry applied, its last edit (the branch) put back, the adjust word moved so the sum is the
 * stock sum. The Python rebuilds them the other way round (fps_patch.earlier_image: the entry's other
 * edits only), and the hashes must agree. No patch takes them; the plan gives the earlier-patch reason.
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { wordSum32 } from '../../src/image/bank.js';
import {
  FPS_ADJUST_OFFSET,
  FPS_KNOWN_BUILDS,
  FPS_PATCHES,
  FPS_OFFER_WITHHELD,
  FPS_MEASURED_HZ,
  FPS_STAGE_ONE_IDS,
  FPS_STAGE_THREE_IDS,
  FPS_STAGE_TWO_IDS,
  applyFpsPatch,
  fpsEarlierPatchReason,
  fpsImageLength,
  identifyFpsImage,
  planFpsPatch,
  verifyFpsPatchedImage,
  type FpsPatch,
} from '../../src/preservation/fps-patch.js';

interface PythonOutput {
  readonly patch: string;
  readonly target?: number;
  readonly version?: string;
  readonly outputSha256?: string;
  readonly changed?: readonly number[];
  readonly refused?: string;
}

interface PythonImageCase {
  readonly inputSha256: string;
  readonly length: number;
  readonly pythonState: string;
  readonly known: string | null;
  readonly outputs: readonly PythonOutput[];
  /** True for a known row a patch wrote (fps_patch.EARLIER_PATCHES). */
  readonly earlierPatch: boolean;
  /** An earlier 32 Hz image no corpus holds: rebuilt from this stock image and table entry. */
  readonly derivedFrom?: {
    readonly inputSha256: string;
    readonly length: number;
    readonly patch: string;
  };
}

interface PythonBankCase {
  readonly dumpSha256: string;
  readonly bankAddress: number;
  readonly length: number;
  readonly target: number;
  readonly pythonState: string;
  readonly storedPlain: boolean;
  readonly patch?: string;
  readonly outputSha256?: string;
  readonly changed?: readonly number[];
}

interface PythonFixture {
  readonly images: readonly PythonImageCase[];
  readonly banks: readonly PythonBankCase[];
}

const FIXTURE: PythonFixture = JSON.parse(
  readFileSync(path.join(import.meta.dirname, 'fps-patch-python.json'), 'utf8'),
) as PythonFixture;

const FLASH_BASE = 0x14000000;
const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

/** Every patch the Python has, by its id: the table must have exactly these. */
const PYTHON_IDS = new Set(
  FIXTURE.images.flatMap((image) => image.outputs.map((output) => output.patch)),
);

function entryNamed(id: string): FpsPatch {
  const entry = FPS_PATCHES.find((candidate) => candidate.id === id);
  if (entry === undefined) throw new Error(`no table entry ${id}`);
  return entry;
}

describe('the table against the Python table (no corpus needed)', () => {
  it('has the same entries as fps_patch.py, and the same stock and patched hashes', () => {
    expect(new Set(FPS_PATCHES.map((patch) => patch.id))).toEqual(PYTHON_IDS);
    expect(FPS_PATCHES).toHaveLength(20);
    for (const image of FIXTURE.images) {
      for (const output of image.outputs) {
        if (output.outputSha256 === undefined) continue;
        const entry = entryNamed(output.patch);
        expect(entry.stockSha256).toBe(image.inputSha256);
        expect(entry.patchedSha256).toBe(output.outputSha256);
        expect(entry.targetHz).toBe(output.target);
      }
    }
  });

  it('enables exactly the stage-one (plain 2014 chain) and stage-two (Key A, 4.8.x and 4.9.x Compact PRO) entries, and records a reason for every other', () => {
    expect([...FPS_STAGE_ONE_IDS].sort()).toEqual([
      'compact_32k-0.10.0.0-to32',
      'compact_32k-0.8.0.0-to32',
      'compact_32k-0.9.0.2-to32',
      'compact_32k-0.9.0.6-to32',
      'compact_32k-0.9.0.7-to32',
      'compact_32k-0.9.1.0-to32',
      'compact_32k-1.0.0.0-to32',
      'compact_32k-1.2.0.0-to32',
      'compact_32k-1.3.0.0-to32',
      'compact_32k-1.3.0.8-to32',
    ]);
    expect([...FPS_STAGE_TWO_IDS].sort()).toEqual([
      'compact_32k-4.8.1.7-to32',
      'compact_32k-4.8.1.9-to32',
      'compact_32k-4.8.2.1-to32',
      'compact_pro-4.9.1.15',
      'compact_pro-4.9.2.0',
    ]);
    expect([...FPS_STAGE_THREE_IDS].sort()).toEqual(['compact_pro-1.0.3.0', 'compact_pro-1.0.3.2']);
    for (const entry of FPS_PATCHES) {
      if (
        FPS_STAGE_ONE_IDS.has(entry.id) ||
        FPS_STAGE_TWO_IDS.has(entry.id) ||
        FPS_STAGE_THREE_IDS.has(entry.id)
      ) {
        expect(entry.gate.enabled).toBe(!FPS_OFFER_WITHHELD);
        if (FPS_OFFER_WITHHELD) expect(entry.gate.reason).toMatch(/withheld after the bench run/);
        else expect(entry.gate.reason).toBeNull();
      } else {
        expect(entry.gate.enabled).toBe(false);
        expect(entry.gate.reason).toMatch(
          entry.id === 'compact_32k-0.7.0.8-to32' ? /older than 0\.8\.0\.0/ : /^stage two: /,
        );
      }
    }
  });

  it('carries the Python known-rate builds', () => {
    const known = FIXTURE.images.filter((image) => image.known !== null);
    expect(known.length).toBeGreaterThan(0);
    for (const image of known) {
      const build = FPS_KNOWN_BUILDS.get(image.inputSha256);
      expect(build?.name).toBe(image.known);
      expect(build?.earlierPatch, image.known ?? '').toBe(image.earlierPatch);
    }
  });
});

/* ---- the corpus, when it is given -------------------------------------- */

const CORPUS_ROOTS = (process.env.SEEK_FPS_CORPUS ?? '')
  .split(':')
  .map((root) => root.trim())
  .filter((root) => root.length > 0);

/** Every regular file under the corpus roots, by size, found once. */
let bySize: Map<number, string[]> | null = null;
function filesBySize(): Map<number, string[]> {
  if (bySize !== null) return bySize;
  const index = new Map<number, string[]>();
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      if (name === '.git' || name === 'node_modules') continue;
      const full = path.join(dir, name);
      const info = statSync(full);
      if (info.isDirectory()) walk(full);
      else if (info.isFile()) {
        const list = index.get(info.size) ?? [];
        list.push(full);
        index.set(info.size, list);
      }
    }
  };
  for (const root of CORPUS_ROOTS) walk(root);
  bySize = index;
  return index;
}

/** The file whose first `length` bytes hash to `wanted` (an image), or whose whole bytes do (a dump). */
function findByHash(size: number, wanted: string, prefix: number | null): Uint8Array | null {
  for (const file of filesBySize().get(size) ?? []) {
    const bytes = new Uint8Array(readFileSync(file));
    const head = prefix === null ? bytes : bytes.subarray(0, prefix);
    if (sha256(head) === wanted) return bytes;
  }
  return null;
}

/**
 * An earlier 32 Hz image: `entry` applied to its stock image, its last edit (the no-skip branch) put back to the old
 * bytes, and the adjust word moved so the acceptance sum is the stock image's again (fps_patch.earlier_image's image).
 */
function earlierImage(stock: Uint8Array, entry: FpsPatch): Uint8Array {
  const out = applyFpsPatch(stock, entry).slice();
  const branch = entry.edits[entry.edits.length - 1];
  if (branch === undefined) throw new Error(`${entry.id} has no edits`);
  out.set(branch.before, branch.offset);
  const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
  const delta = (wordSum32(out, stock.length) - wordSum32(stock, stock.length)) >>> 0;
  view.setUint32(FPS_ADJUST_OFFSET, (view.getUint32(FPS_ADJUST_OFFSET, true) - delta) >>> 0, true);
  return out;
}

/** A fixture image's bytes: the corpus file, or for a `derivedFrom` case the image rebuilt from its stock image. */
function imageOf(image: PythonImageCase): Uint8Array | null {
  const from = image.derivedFrom;
  if (from === undefined) return findByHash(image.length, image.inputSha256, image.length);
  const bytes = findByHash(from.length, from.inputSha256, from.length);
  return bytes === null
    ? null
    : earlierImage(bytes.subarray(0, from.length), entryNamed(from.patch));
}

const corpusDescribe = CORPUS_ROOTS.length > 0 ? describe : describe.skip;

corpusDescribe('the table against the Python tool, over the corpus (SEEK_FPS_CORPUS)', () => {
  it('finds every fixture image in the corpus roots', () => {
    const missing = FIXTURE.images
      .filter((image) => {
        const bytes = imageOf(image);
        return bytes === null || sha256(bytes.subarray(0, image.length)) !== image.inputSha256;
      })
      .map((image) => `${image.inputSha256.slice(0, 12)} (${String(image.length)} B)`);
    expect(missing, 'images not found under SEEK_FPS_CORPUS').toEqual([]);
  });

  it('applies every entry to its image exactly as the Python does (sha256 and changed offsets)', () => {
    let compared = 0;
    for (const image of FIXTURE.images) {
      const bytes = imageOf(image);
      expect(bytes, `image ${image.inputSha256.slice(0, 12)}`).not.toBeNull();
      if (bytes === null) continue;
      const stock = bytes.subarray(0, image.length);
      expect(fpsImageLength(stock)).toBe(image.length);
      expect(identifyFpsImage(stock).sha256).toBe(image.inputSha256);
      for (const output of image.outputs) {
        const entry = entryNamed(output.patch);
        expect(output.refused, `${output.patch} refused by the Python`).toBeUndefined();
        const patched = applyFpsPatch(stock, entry);
        expect(sha256(patched.subarray(0, image.length)), output.patch).toBe(output.outputSha256);
        const changed = verifyFpsPatchedImage(stock, patched, entry);
        expect(changed, `${output.patch} changed offsets`).toEqual(output.changed);
        compared++;
      }
    }
    expect(compared).toBe(20);
    expect(FIXTURE.images.filter((image) => image.derivedFrom !== undefined)).toHaveLength(16);
  });

  it.skipIf(!FPS_OFFER_WITHHELD)(
    'withholds every stage-one offer after the bench run, and refuses the stage-two builds too',
    () => {
      for (const image of FIXTURE.images.filter((candidate) => candidate.pythonState === 'stock')) {
        const bytes = imageOf(image);
        if (bytes === null) continue;
        const stock = bytes.subarray(0, image.length);
        const top = [...image.outputs].sort((a, b) => (b.target ?? 0) - (a.target ?? 0))[0];
        if (top === undefined) continue;
        const entry = entryNamed(top.patch);
        const plan = planFpsPatch(stock, entry.version.replace(/-FF$/, ''));
        expect(plan.status, entry.id).toBe('refused');
        if (plan.status === 'refused') {
          expect(plan.reason, entry.id).toMatch(
            FPS_STAGE_ONE_IDS.has(entry.id) ? /withheld after the bench run/ : /^stage two: /,
          );
        }
      }
    },
  );

  it.skipIf(FPS_OFFER_WITHHELD)(
    'offers the stage-one and stage-two builds at their top rate, refuses the rest, and refuses a camera on another build',
    () => {
      // The rate the page names: the table's target, except where FPS_MEASURED_HZ names another (none now; the
      // 1.3.0.8 32 Hz entry is the unmeasured plain-copy form and names its target).
      for (const image of FIXTURE.images.filter((candidate) => candidate.pythonState === 'stock')) {
        const bytes = imageOf(image);
        if (bytes === null) continue;
        const stock = bytes.subarray(0, image.length);
        const top = [...image.outputs].sort((a, b) => (b.target ?? 0) - (a.target ?? 0))[0];
        if (top === undefined) continue;
        const entry = entryNamed(top.patch);
        const build = entry.version.replace(/-FF$/, '');
        const plan = planFpsPatch(stock, build);
        if (
          FPS_STAGE_ONE_IDS.has(entry.id) ||
          FPS_STAGE_TWO_IDS.has(entry.id) ||
          FPS_STAGE_THREE_IDS.has(entry.id)
        ) {
          expect(plan.status, entry.id).toBe('offer');
          if (plan.status === 'offer') {
            expect(plan.toHz, entry.id).toBe(FPS_MEASURED_HZ.get(entry.id) ?? entry.targetHz);
            expect(plan.sites.length).toBeGreaterThan(0);
          }
          const other = planFpsPatch(stock, '9.9.9.9');
          expect(other.status).toBe('refused');
          if (other.status === 'refused')
            expect(other.reason).toMatch(/the camera reports 9\.9\.9\.9/);
          const patched = applyFpsPatch(stock, entry);
          expect(planFpsPatch(patched, build).status, `${entry.id} patched`).toBe('patched');
        } else {
          expect(plan.status, entry.id).toBe('refused');
          if (plan.status === 'refused')
            expect(plan.reason, entry.id).toMatch(
              entry.id === 'compact_32k-0.7.0.8-to32' ? /older than 0\.8\.0\.0/ : /^stage two: /,
            );
        }
      }
    },
  );

  it('plans the same verdict as the Python for every known build, an earlier patch with its own reason', () => {
    let earlier = 0;
    for (const image of FIXTURE.images.filter((candidate) => candidate.known !== null)) {
      const bytes = imageOf(image);
      expect(bytes).not.toBeNull();
      if (bytes === null) continue;
      const stock = bytes.subarray(0, image.length);
      const plan = planFpsPatch(stock, '1.0.3.2');
      expect(plan.status).toBe('at-rate');
      if (plan.status !== 'at-rate') continue;
      expect(plan.earlierPatch === true, image.known ?? '').toBe(image.earlierPatch);
      if (image.earlierPatch) {
        earlier++;
        expect(plan.reason).toBe(fpsEarlierPatchReason(plan.hz));
        // the camera's own build does not change it: a patched image is never a patch input
        const entry =
          image.derivedFrom === undefined ? undefined : entryNamed(image.derivedFrom.patch);
        if (entry !== undefined) {
          expect(planFpsPatch(stock, entry.version.replace(/-FF$/, '')).status).toBe('at-rate');
          expect(() => applyFpsPatch(stock, entry)).toThrow(/not the stock image/);
        }
      } else {
        expect(plan.reason).toMatch(/already runs at \d+ Hz without a patch/);
      }
    }
    expect(earlier).toBe(16);
  });

  it('applies every plain-stored bank of the corpus dumps exactly as the Python does', () => {
    let compared = 0;
    for (const bank of FIXTURE.banks) {
      const dump = findByHash(4 * 1024 * 1024, bank.dumpSha256, null);
      expect(dump, `dump ${bank.dumpSha256.slice(0, 12)}`).not.toBeNull();
      if (dump === null) continue;
      const offset = bank.bankAddress - FLASH_BASE;
      const plain = dump.slice(offset, offset + bank.length);
      expect(bank.storedPlain).toBe(true);
      const entry = entryNamed(bank.patch ?? '');
      expect(entry.targetHz).toBe(bank.target);
      const patched = applyFpsPatch(plain, entry);
      expect(sha256(patched), `${String(bank.patch)} at ${bank.bankAddress.toString(16)}`).toBe(
        bank.outputSha256,
      );
      expect(verifyFpsPatchedImage(plain, patched, entry)).toEqual(bank.changed);
      compared++;
    }
    expect(compared).toBe(FIXTURE.banks.filter((bank) => bank.patch !== undefined).length);
  });
});
