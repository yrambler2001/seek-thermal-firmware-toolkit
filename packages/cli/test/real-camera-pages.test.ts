/* ====================================================================
 * The CLI's pages on the REAL bench camera (Compact PIR206, firmware 1.3.0.0), run as the
 * built `seek-fw` binary (packages/cli/dist/bin.js). Guarded: it runs only with
 * SEEK_REAL_CAMERA=1 and the bench's variables set, never by `npm test` (the file is skipped
 * otherwise). It is the CLI counterpart of e2e/pages-bench.e2e.ts:
 *   - info names the 0.x/1.x tab; dump refuses this camera before it reads; preserve --backup-only
 *     saves windows that are byte runs of the halted flash;
 *   - decrypt slot works on a file with no camera, and refuses a file of the wrong size;
 *   - slots list and slots dump a/b/r equal the halted flash;
 *   - a refused write is refused and nothing changes; one allowed write (the decrypted image into
 *     bank B, not booted, no acknowledgement) reads back, with no "cannot be written" text;
 *   - the baseline is restored with the FW-V1 jlink-runner and verified halted, and the camera is
 *     power-cycled on switch channel 2.
 * Environment: SEEK_REAL_CAMERA=1, SEEK_E2E_FWV1_DIR (the FW-V1 checkout), SEEK_E2E_SWITCH_DIR
 * (usb-port-switch-rp2040), SEEK_FULL_DUMPS_BY_CAMERA (or SEEK_PAGES_BASELINE, the 4 MiB baseline).
 * ==================================================================== */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const REAL = process.env.SEEK_REAL_CAMERA === '1';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.resolve(HERE, '..', 'dist', 'bin.js');

const BASELINE_SHA = '40447c7e6da5cbc84621f4694ffff5bda0f783e7807a45e80443383b19a8eb72';
const BASELINE_FILE =
  process.env.SEEK_PAGES_BASELINE ??
  path.join(
    process.env.SEEK_FULL_DUMPS_BY_CAMERA ?? '',
    'Compact',
    'Compact',
    '2014.10.21-14.58.29-1.3.0.0',
    'full_dump_original.bin',
  );
const FW_V1 = process.env.SEEK_E2E_FWV1_DIR ?? '';
const RUNNER = path.join(
  FW_V1,
  'targets',
  'compact_8hz_1_3_0_0',
  'tools',
  'jlink',
  'jlink-runner.js',
);
const SWITCH_DIR = process.env.SEEK_E2E_SWITCH_DIR ?? '';
const HALTED_DUMP = path.join(
  FW_V1,
  'targets',
  'compact_8hz_1_3_0_0',
  'jlink_dumps',
  'spifi_14000000_4m_halted.bin',
);

const BANK = { a: 0x14050000, b: 0x14060000, r: 0x14070000 } as const;
const BANK_BYTES = 0x10000;
const HEADER_LENGTH_OFFSET = 0x204;
const CLI_TIMEOUT_MS = 20 * 60_000;

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

interface Run {
  readonly status: number | null;
  readonly out: string;
}

/** One `seek-fw` command, as the person types it: its exit code and its text. */
function cli(args: readonly string[]): Run {
  const result = spawnSync(process.execPath, [BIN, ...args], {
    encoding: 'utf8',
    timeout: CLI_TIMEOUT_MS,
    env: { ...process.env, NO_COLOR: '1' },
  });
  return { status: result.status, out: `${result.stdout}${result.stderr}` };
}

/** The FW-V1 runner's command, in its own directory's terms (`FACTORY_IMAGE` and the rest from env). */
function runner(command: string, env: Record<string, string> = {}): Run {
  const result = spawnSync(process.execPath, [RUNNER, command], {
    encoding: 'utf8',
    timeout: CLI_TIMEOUT_MS,
    env: { ...process.env, ...env },
  });
  return { status: result.status, out: `${result.stdout}${result.stderr}` };
}

/** The halted whole-flash read, through the runner, as the bytes of this unit's flash. */
function haltedWholeFlash(): Uint8Array {
  const dump = runner('dump-spifi-4m-halted');
  if (dump.status !== 0 || !existsSync(HALTED_DUMP)) {
    throw new Error(`the halted read failed: ${dump.out.slice(-400)}`);
  }
  return new Uint8Array(readFileSync(HALTED_DUMP));
}

function bankOf(flash: Uint8Array, letter: keyof typeof BANK): Uint8Array {
  const offset = BANK[letter] - 0x14000000;
  return flash.subarray(offset, offset + BANK_BYTES);
}

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  return Buffer.from(a).equals(Buffer.from(b));
}

function onlyFile(dir: string, pattern: RegExp): string {
  const names = readdirSync(dir).filter((name) => pattern.test(name));
  if (names.length !== 1)
    throw new Error(`expected one file matching ${String(pattern)} in ${dir}: ${names.join(', ')}`);
  return path.join(dir, names[0] ?? '');
}

describe.skipIf(!REAL)('the CLI on the bench camera (1.3.0.0, real USB)', () => {
  let dir = '';
  let flash: Uint8Array = new Uint8Array();

  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'seek-cli-real-'));
    if (!existsSync(BIN)) throw new Error(`build the CLI first: ${BIN} is missing`);
    if (!existsSync(BASELINE_FILE) || sha256(readFileSync(BASELINE_FILE)) !== BASELINE_SHA) {
      throw new Error(`the baseline file is not ${BASELINE_SHA}: ${BASELINE_FILE}`);
    }
    flash = haltedWholeFlash();
    expect(sha256(flash), 'the halted read is the baseline before anything is sent').toBe(
      BASELINE_SHA,
    );
  }, 10 * 60_000);

  afterAll(() => {
    if (!REAL) return;
    /* Restore: erase the range (a failed erase writes nothing), flash the baseline, verify it halted. */
    runner('erase-spifi-range', { ERASE_ADDR: '0x14000000', ERASE_LEN: '0x400000' });
    const flashed = runner('flash-factory-4m', { FACTORY_IMAGE: BASELINE_FILE });
    expect(flashed.out, 'the baseline is written back').toMatch(/Verify successful/);
    expect(sha256(haltedWholeFlash()), 'the restored flash is the baseline').toBe(BASELINE_SHA);
    spawnSync(process.execPath, [path.join(SWITCH_DIR, 'switch.js'), 'cycle', '2', '3000']);
    rmSync(dir, { recursive: true, force: true });
  }, 20 * 60_000);

  it(
    'info reports firmware 1.3.0.0 and names the 0.x/1.x tab',
    () => {
      const run = cli(['info']);
      expect(run.status, run.out).toBe(0);
      expect(run.out).toContain('1.3.0.0');
      expect(run.out).toContain('Dump & decrypt 0.x/1.x 2014/2016');
    },
    CLI_TIMEOUT_MS,
  );

  it(
    'dump refuses this 1.3.0.0 camera before it reads anything, and points at preserve',
    () => {
      const run = cli(['dump', '--out', path.join(dir, 'dump-refused')]);
      expect(run.status, run.out).not.toBe(0);
      expect(run.out).toMatch(/preserve/);
      expect(run.out).not.toMatch(/Reading 4 MiB|progress: \d+%/);
    },
    CLI_TIMEOUT_MS,
  );

  it(
    'preserve --backup-only saves a zip whose windows are byte runs of the halted flash',
    () => {
      const zip = path.join(dir, 'backup.zip');
      const run = cli(['preserve', '--backup-only', '--zip', zip]);
      expect(run.status, run.out).toBe(0);
      expect(existsSync(zip), 'the run file is written').toBe(true);
      const listing = spawnSync('unzip', ['-Z1', zip], { encoding: 'utf8' })
        .stdout.split('\n')
        .filter(Boolean);
      const big = listing.filter((name) => name.endsWith('.bin'));
      expect(big.length, `binary entries in ${listing.join(', ')}`).toBeGreaterThan(0);
      for (const name of big) {
        const bytes = spawnSync('unzip', ['-p', zip, name], { maxBuffer: 64 << 20 }).stdout;
        if (bytes.length < 4096) continue;
        expect(Buffer.from(flash).includes(bytes), `${name} is a run of the flash`).toBe(true);
      }
    },
    CLI_TIMEOUT_MS,
  );

  it(
    'decrypt slot decrypts a bank of the halted flash with no camera, and refuses a file of the wrong size',
    () => {
      const slot = path.join(dir, 'slot-A.bin');
      writeFileSync(slot, bankOf(flash, 'a'));
      const run = cli(['decrypt', 'slot', slot]);
      expect(run.status, run.out).toBe(0);
      const decrypted = onlyFile(dir, /-decrypted\.bin$/);
      const bank = bankOf(flash, 'a');
      const length = new DataView(bank.buffer, bank.byteOffset, bank.byteLength).getUint32(
        HEADER_LENGTH_OFFSET,
        true,
      );
      expect(
        sameBytes(readFileSync(decrypted), bank.subarray(0, length)),
        'the decrypted image is the bank’s image',
      ).toBe(true);
      expect(run.out).not.toMatch(/camera|usb/i);

      const short = path.join(dir, 'slot-short.bin');
      writeFileSync(short, bank.subarray(0, 1000));
      const refused = cli(['decrypt', 'slot', short]);
      expect(refused.status, refused.out).not.toBe(0);
      expect(refused.out).toMatch(/slots\/refused|65,?536|64 KiB/);
    },
    CLI_TIMEOUT_MS,
  );

  it(
    'slots list shows bank A as booted, firmware 1.3.0.0, and nothing written',
    () => {
      const run = cli(['slots', 'list']);
      expect(run.status, run.out).toBe(0);
      expect(run.out).toMatch(/A\s+0x14050000\s+yes\s+1\.3\.0\.0/);
      expect(run.out).not.toMatch(/cannot be written/);
    },
    CLI_TIMEOUT_MS,
  );

  it(
    'slots dump a, b and r equal the halted flash',
    () => {
      for (const letter of ['a', 'b', 'r'] as const) {
        const out = path.join(dir, `dump-${letter}`);
        const run = cli(['slots', 'dump', letter, '--out', out]);
        expect(run.status, run.out).toBe(0);
        const raw = onlyFile(out, /^slot-[ABR]-.*\.bin$/);
        expect(
          sameBytes(readFileSync(raw), bankOf(flash, letter)),
          `dump ${letter} is the halted bank`,
        ).toBe(true);
      }
    },
    CLI_TIMEOUT_MS,
  );

  it(
    'a refused write is DENIED with the refusal text, and nothing changes in bank A',
    () => {
      const bad = path.join(dir, 'not-a-slot.bin');
      writeFileSync(bad, new Uint8Array(1000));
      const run = cli(['slots', 'flash', 'a', bad, '--yes', '--acknowledge-risk']);
      expect(run.status, run.out).not.toBe(0);
      expect(run.out).toMatch(/refus|cannot use|not a firmware|65,?536|64 KiB/i);
      const out = path.join(dir, 'dump-a-after-refusal');
      expect(cli(['slots', 'dump', 'a', '--out', out]).status).toBe(0);
      expect(sameBytes(readFileSync(onlyFile(out, /^slot-A-.*\.bin$/)), bankOf(flash, 'a'))).toBe(
        true,
      );
    },
    CLI_TIMEOUT_MS,
  );

  it(
    'one allowed write: the decrypted image into bank B (not booted, no acknowledgement), read back, no "cannot be written" text',
    () => {
      const decrypted = onlyFile(dir, /-decrypted\.bin$/);
      const run = cli(['slots', 'flash', 'b', decrypted, '--yes']);
      expect(run.status, run.out).toBe(0);
      expect(run.out).not.toMatch(/cannot be written/);
      expect(run.out).toMatch(/read-back|matches/);
      const out = path.join(dir, 'dump-b-after-write');
      expect(cli(['slots', 'dump', 'b', '--out', out]).status).toBe(0);
      const after = readFileSync(onlyFile(out, /^slot-B-.*\.bin$/));
      const image = readFileSync(decrypted);
      expect(sameBytes(after.subarray(0, image.length), image), 'bank B holds the image').toBe(
        true,
      );
    },
    CLI_TIMEOUT_MS,
  );
});
