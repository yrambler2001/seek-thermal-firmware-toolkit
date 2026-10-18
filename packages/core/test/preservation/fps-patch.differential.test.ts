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
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  FPS_KNOWN_BUILDS,
  FPS_PATCHES,
  FPS_OFFER_WITHHELD,
  FPS_STAGE_ONE_IDS,
  applyFpsPatch,
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
    expect(FPS_PATCHES).toHaveLength(14);
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

  it('enables exactly the plain 2014 chain on stage one, and records a stage-two reason for every other entry', () => {
    expect([...FPS_STAGE_ONE_IDS].sort()).toEqual([
      'compact_32k-1.2.0.0-to16',
      'compact_32k-1.3.0.0-to16',
      'compact_32k-1.3.0.8-to16',
      'compact_32k-1.3.0.8-to32',
    ]);
    for (const entry of FPS_PATCHES) {
      if (FPS_STAGE_ONE_IDS.has(entry.id)) {
        expect(entry.gate.enabled).toBe(!FPS_OFFER_WITHHELD);
        if (FPS_OFFER_WITHHELD) expect(entry.gate.reason).toMatch(/withheld after the bench run/);
        else expect(entry.gate.reason).toBeNull();
      } else {
        expect(entry.gate.enabled).toBe(false);
        expect(entry.gate.reason).toMatch(/^stage two: /);
      }
    }
  });

  it('carries the Python known-rate builds', () => {
    const known = FIXTURE.images.filter((image) => image.known !== null);
    expect(known.length).toBeGreaterThan(0);
    for (const image of known) {
      const build = FPS_KNOWN_BUILDS.get(image.inputSha256);
      expect(build?.name).toBe(image.known);
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

const corpusDescribe = CORPUS_ROOTS.length > 0 ? describe : describe.skip;

corpusDescribe('the table against the Python tool, over the corpus (SEEK_FPS_CORPUS)', () => {
  it('finds every fixture image in the corpus roots', () => {
    const missing = FIXTURE.images
      .filter((image) => findByHash(image.length, image.inputSha256, image.length) === null)
      .map((image) => `${image.inputSha256.slice(0, 12)} (${String(image.length)} B)`);
    expect(missing, 'images not found under SEEK_FPS_CORPUS').toEqual([]);
  });

  it('applies every entry to its image exactly as the Python does (sha256 and changed offsets)', () => {
    let compared = 0;
    for (const image of FIXTURE.images) {
      const bytes = findByHash(image.length, image.inputSha256, image.length);
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
    expect(compared).toBe(14);
  });

  it.skipIf(!FPS_OFFER_WITHHELD)('withholds every stage-one offer after the bench run, and refuses the stage-two builds too', () => {
    for (const image of FIXTURE.images.filter((candidate) => candidate.pythonState === 'stock')) {
      const bytes = findByHash(image.length, image.inputSha256, image.length);
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
  });

  it.skipIf(FPS_OFFER_WITHHELD)(
    'offers the stage-one builds at their top rate, refuses the stage-two builds, and refuses a camera on another build',
    () => {
      const stageOne: Record<string, number> = {
        '1.2.0.0': 16,
        '1.3.0.0': 16,
        '1.3.0.8': 32,
      };
      for (const image of FIXTURE.images.filter((candidate) => candidate.pythonState === 'stock')) {
        const bytes = findByHash(image.length, image.inputSha256, image.length);
        if (bytes === null) continue;
        const stock = bytes.subarray(0, image.length);
        const top = [...image.outputs].sort((a, b) => (b.target ?? 0) - (a.target ?? 0))[0];
        if (top === undefined) continue;
        const entry = entryNamed(top.patch);
        const build = entry.version.replace(/-FF$/, '');
        const plan = planFpsPatch(stock, build);
        if (FPS_STAGE_ONE_IDS.has(entry.id)) {
          expect(plan.status, entry.id).toBe('offer');
          if (plan.status === 'offer') {
            expect(plan.toHz, entry.id).toBe(stageOne[build]);
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
          if (plan.status === 'refused') expect(plan.reason, entry.id).toMatch(/^stage two: /);
        }
      }
    },
  );

  it('plans the same verdict as the Python for every known build', () => {
    for (const image of FIXTURE.images.filter((candidate) => candidate.known !== null)) {
      const bytes = findByHash(image.length, image.inputSha256, image.length);
      expect(bytes).not.toBeNull();
      if (bytes === null) continue;
      const plan = planFpsPatch(bytes.subarray(0, image.length), '1.0.3.2');
      expect(plan.status).toBe('at-rate');
    }
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
