/* ====================================================================
 * The CLI mirrors of the non-slots pages, through `run()` itself.
 *
 * WHAT RUNS. The real argument parser and the real commands. Cameras are the
 * FW-V1 emulator behind node-usb over USB/IP (`node-usb-over-usbip.ts`, the same
 * path `emulator-cli.test.ts` and `slots.emulator.test.ts` drive). A command that
 * needs no camera runs with a backend that enumerates nothing, so no real USB
 * device is ever opened by this file.
 *
 *   seek-fw info              on 1.3.0.0, 4.8.2.1 and the 2016 Compact PRO 1.0.3.0
 *   seek-fw info              with no camera: says so, exits 1, writes nothing
 *   seek-fw preserve          --backup-only on 1.3.0.0 and the 2016 PRO: the backup,
 *                             window by window, equals the emulated flash
 *   seek-fw preserve          --backup-only on a 4.8.2.1: refused on the version,
 *                             before any window is armed or read
 *   seek-fw dump              on 4.8.2.1: the whole flash, equal to the emulated flash
 *   seek-fw dump              on 1.3.0.0: refused on the version, with `preserve` named
 *   seek-fw decrypt file      a corpus dump, no camera: the corpus plaintext
 *   seek-fw decrypt slot      a 64 KiB bank cut from a corpus dump, no camera:
 *                             the corpus plaintext; an erased bank exits 0 and
 *                             reports empty; a wrong size, a random bank and a
 *                             bank whose key does not recover exit 1
 *   usage                     `decrypt` without a form, and `dump --family`, exit 2
 *
 * Every command runs under `--json` (one document on stdout). The exit codes are
 * the CLI's (0, 1, 2). What a camera command SENT is the emulator's own ledger, by
 * opcode, not the CLI's word for it.
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR (suite.ts). Emulator only: no hardware.
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { preservationWindows, type UsbBackend } from '@seek-fw/core';
import {
  type Emulator,
  liveEmulatorCount,
  RowEmulators,
} from '../../core/test/emulator/harness.js';
import {
  announceSkip,
  BOOT_TIMEOUT_MS,
  EMU_DIR,
  ENTRIES,
  scratchFile,
  URB_TIMEOUT_MS,
} from '../../core/test/emulator/suite.js';
import { NodeUsbBackend, type BackendOptions } from '../src/backend.js';
import { run } from '../src/cli.js';
import { EXIT_FAILED, EXIT_OK, EXIT_USAGE } from '../src/errors.js';
import { tempDir, testIo } from './helpers.js';
import { nodeUsbOverUsbIp, type NodeUsbOverUsbIp } from './node-usb-over-usbip.js';

const TIMEOUT_MS = Number(process.env.SEEK_EMU_PAGES_CLI_TIMEOUT_MS ?? '1800000');
const FLASH_BYTES = 4 * 1024 * 1024;
const FLASH_BASE = 0x14000000;
const BANK_BYTES = 0x10000;

/**
 * The opcodes that change the camera's flash or reset it: the write (SetFeaturedFirmwareData),
 * the commit (CompleteMemoryUpgrade) and the reset (ResetDevice). SetFirmwareInfoFeatures (0x55)
 * and SetRAMDataFeatures (0x5a) are selectors the read path sets (`readRunningFirmware` notes
 * this); they are counted separately where a command is allowed to use them.
 */
const CHANGES_THE_CAMERA = [0x50, 0x51, 0x59];
/** A window read (GetFeaturedFirmwareData) and a window arm (BeginFirmwareUpgrade). */
const WINDOW_READ = 0x4f;
const WINDOW_ARM = 0x52;

const ENTRY = {
  c1300: 'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump',
  c4821: 'compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/dump',
  pro1030: 'compact_pro/2016.07.06-17.04.49-1.0.3.0/0C21A1M5KP15/dump',
  nano300: 'nano_300/2024.11.21-11.55.00-44.27.3.10/1713A171RJB9/dump',
} as const;

const available = EMU_DIR !== null && ENTRIES.some((entry) => entry.id === ENTRY.c1300);
if (!available) announceSkip('the pages through the CLI on the emulated corpus');

type Json = Record<string, unknown>;

interface CliRun {
  readonly code: number;
  /** The one JSON document `--json` put on stdout (null when stdout held none). */
  readonly json: Json | null;
  readonly stderr: string;
  /** The emulator's own count of requests sent by this command, by opcode (empty with no camera). */
  readonly sent: ReadonlyMap<number, number>;
}

/** The emulator's count of requests sent, per opcode, over every session it has served. */
function sentByOpcode(emu: Emulator | null): Map<number, number> {
  const out = new Map<number, number>();
  if (emu === null) return out;
  for (const [key, count] of Object.entries(emu.ledger.snapshot().requests)) {
    const opcode = Number.parseInt((key.split('/')[1] ?? '').replace(/^0x/, ''), 16);
    out.set(opcode, (out.get(opcode) ?? 0) + count.sent);
  }
  return out;
}

function difference(
  before: ReadonlyMap<number, number>,
  after: ReadonlyMap<number, number>,
): Map<number, number> {
  const out = new Map<number, number>();
  for (const [opcode, n] of after) {
    const delta = n - (before.get(opcode) ?? 0);
    if (delta > 0) out.set(opcode, delta);
  }
  return out;
}

/** Runs one command line under `--json`. With `device` it talks to the emulator; without, to no camera at all. */
async function cli(
  argv: readonly string[],
  target: { readonly device: NodeUsbOverUsbIp; readonly emu: Emulator } | null,
): Promise<CliRun> {
  const before = sentByOpcode(target?.emu ?? null);
  const backend = (options: BackendOptions): UsbBackend =>
    target === null
      ? new NodeUsbBackend({ ...options, enumerate: () => Promise.resolve([]) })
      : new NodeUsbBackend({
          ...options,
          enumerate: () => Promise.resolve([target.device]),
          clock: target.device.usbip.deadlineClock,
        });
  const { io, stdout, stderr } = testIo({ backend });
  const code = await run([...argv, '--json'], io, new AbortController().signal);
  const text = stdout.text.trim();
  const json = text === '' ? null : (JSON.parse(text) as Json);
  const sent = difference(before, sentByOpcode(target?.emu ?? null));
  return { code, json, stderr: stderr.text, sent };
}

/** Every regular file under `dir`, recursively. */
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

/** The bank at `address` of a whole flash, or a cut of it of `length` bytes. */
function bankOf(flash: Uint8Array, address: number, length = BANK_BYTES): Uint8Array {
  const at = address - FLASH_BASE;
  return flash.slice(at, at + length);
}

/** The corpus file for `entryId` from the emulator's manifest (its vendored path), checked against its sha. */
function corpusFile(entryId: string): Uint8Array {
  const entry = ENTRIES.find((candidate) => candidate.id === entryId);
  if (entry === undefined) throw new Error(`no corpus entry ${entryId}`);
  const manifest = JSON.parse(
    readFileSync(path.join(EMU_DIR ?? '', 'data', 'corpus', 'MANIFEST.json'), 'utf8'),
  ) as { entries: { id: string; vendored_path: string; sha256: string }[] };
  const row = manifest.entries.find((candidate) => candidate.id === entryId);
  if (row === undefined) throw new Error(`no manifest row for ${entryId}`);
  const bytes = new Uint8Array(readFileSync(path.join(EMU_DIR ?? '', row.vendored_path)));
  if (sha256(bytes) !== row.sha256)
    throw new Error(`${entryId}: the corpus file is not its manifest's`);
  return bytes;
}

/** A corpus image (image-only entry), by id prefix, checked against its manifest sha. */
function corpusImage(prefix: string): Uint8Array {
  const manifest = JSON.parse(
    readFileSync(path.join(EMU_DIR ?? '', 'data', 'corpus', 'MANIFEST.json'), 'utf8'),
  ) as { entries: { id: string; kind: string; vendored_path: string; sha256: string }[] };
  const row = manifest.entries.find((c) => c.kind === 'image-only' && c.id.startsWith(prefix));
  if (row === undefined) throw new Error(`no image-only entry ${prefix}`);
  const bytes = new Uint8Array(readFileSync(path.join(EMU_DIR ?? '', row.vendored_path)));
  if (sha256(bytes) !== row.sha256)
    throw new Error(`${prefix}: the corpus image is not its manifest's`);
  return bytes;
}

/** A pseudo-random sequence, so a "garbage" file is the same bytes on every run. */
function garbage(length: number, seed: number): Uint8Array {
  const out = new Uint8Array(length);
  let x = seed >>> 0;
  for (let i = 0; i < length; i++) {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    out[i] = x >>> 24;
  }
  return out;
}

/** The files a command wrote, from its JSON output (`output.files`). */
function filesOf(result: CliRun): string[] {
  const output = result.json?.output as { files?: string[] } | undefined;
  return output?.files ?? [];
}

/* ==================================================================== *
 * The camera commands, each on its own emulator
 * ==================================================================== */

interface Camera {
  readonly label: string;
  readonly entryId: string;
}

/** One emulator's sequence: starts it, runs `body` with the device, and stops it cleanly. */
async function onCamera(
  camera: Camera,
  body: (target: { device: NodeUsbOverUsbIp; emu: Emulator }, truthPath: string) => Promise<void>,
): Promise<string> {
  const row = new RowEmulators(camera.entryId);
  const truthPath = scratchFile(`pages_cli_${camera.entryId.replace(/[^\w.-]+/g, '_')}.bin`);
  try {
    const emu = await row.start(EMU_DIR!, {
      entryId: camera.entryId,
      flashOut: truthPath,
      readyTimeoutMs: BOOT_TIMEOUT_MS,
    });
    await row.guard(emu, async () => {
      const usbip = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
      const device = await nodeUsbOverUsbIp(usbip);
      await body({ device, emu }, truthPath);
    });
    await row.assertDelivery();
    return '';
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  } finally {
    await row.finish();
  }
}

describe.skipIf(!available)('the Info command through the CLI, on the emulated cameras', () => {
  afterAll(() => {
    expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
  });

  const cases = [
    { camera: { label: 'Compact 1.3.0.0', entryId: ENTRY.c1300 }, version: '1.3.0.0' },
    { camera: { label: 'Compact 4.8.2.1', entryId: ENTRY.c4821 }, version: '4.8.2.1' },
    { camera: { label: 'Compact PRO 2016 1.0.3.0', entryId: ENTRY.pro1030 }, version: '1.0.3.0' },
  ] as const;

  for (const subject of cases) {
    it(
      `reads ${subject.version} from ${subject.camera.label}, names its tab, and sends no change`,
      { timeout: TIMEOUT_MS },
      async () => {
        let result: CliRun | null = null;
        const defect = await onCamera(subject.camera, async (target) => {
          result = await cli(['info'], target);
        });
        expect(defect, 'the emulator run').toBe('');
        const r = result as CliRun | null;
        expect(r, 'info ran').not.toBeNull();
        if (r === null) return;
        expect(r.code, r.stderr).toBe(EXIT_OK);
        const firmware = r.json?.firmware as { version?: string } | undefined;
        expect(firmware?.version).toBe(subject.version);
        const tabs = r.json?.tabs as { tab: string; command: string }[] | undefined;
        expect(
          tabs?.map((t) => t.command),
          'the tab map, in the web order',
        ).toEqual([
          'seek-fw info',
          'seek-fw preserve',
          'seek-fw dump',
          'seek-fw decrypt file|slot',
          'seek-fw slots',
        ]);
        const wanted = subject.version.startsWith('4.')
          ? 'Dump & decrypt 4.x/Nano'
          : 'Dump & decrypt 0.x/1.x 2014/2016';
        const profile = r.json?.family as { actedUnder?: { id?: string } } | undefined;
        expect(profile?.actedUnder?.id, 'the family info acted under').toBeTruthy();
        say(
          `info ${subject.version}: tab for this camera ${wanted}, sent ${JSON.stringify([...r.sent])}`,
        );
        expect([...r.sent.keys()].filter((op) => CHANGES_THE_CAMERA.includes(op))).toEqual([]);
        /* The CLI's info also sets the read selectors (0x55, 0x5a) that the web's Info never sends. */
        expect(r.sent.has(0x4e), 'GetFirmwareInfo was sent').toBe(true);
      },
    );
  }

  it('with no camera says so, exits 1, and sends nothing', { timeout: TIMEOUT_MS }, async () => {
    const r = await cli(['info'], null);
    expect(r.code, 'no camera is a failure').toBe(EXIT_FAILED);
    expect(r.stderr).toMatch(/no Seek camera|no camera|not found|no device/i);
    expect(r.sent.size).toBe(0);
  });

  it('lists no camera with --devices and exits 0', { timeout: TIMEOUT_MS }, async () => {
    const r = await cli(['info', '--devices'], null);
    expect(r.code).toBe(EXIT_OK);
    expect(r.json?.count).toBe(0);
  });
});

describe.skipIf(!available)('preserve --backup-only through the CLI', () => {
  for (const subject of [
    { camera: { label: 'Compact 1.3.0.0', entryId: ENTRY.c1300 }, version: '1.3.0.0' },
    { camera: { label: 'Compact PRO 2016 1.0.3.0', entryId: ENTRY.pro1030 }, version: '1.0.3.0' },
  ] as const) {
    it(
      `saves the backup of ${subject.camera.label}: the flash windows, and nothing that changes the camera`,
      { timeout: TIMEOUT_MS },
      async () => {
        const out = await tempDir();
        let result: CliRun | null = null;
        try {
          let flash = null as Uint8Array | null;
          const defect = await onCamera(subject.camera, async (target, truthPath) => {
            result = await cli(['preserve', '--backup-only', '--out', out.path, '--yes'], target);
            flash = new Uint8Array(readFileSync(truthPath));
          });
          expect(defect, 'the emulator run').toBe('');
          const r = result as CliRun | null;
          expect(r, 'preserve ran').not.toBeNull();
          if (r === null || flash === null) return;
          expect(r.code, r.stderr).toBe(EXIT_OK);
          const run = r.json?.run as { id?: string; nextStep?: string } | undefined;
          expect(run?.id, 'the run has an id').toBeTruthy();
          expect(run?.nextStep, 'the backup is done and the next step is the offline patch').toBe(
            'patch',
          );
          expect(sha256(flash), 'the emulator booted the corpus dump').toBe(
            sha256(corpusFile(subject.camera.entryId)),
          );
          const backupFile = walk(out.path).find((f) => f.endsWith('preserve_backup_windows.bin'));
          expect(backupFile, 'the backup file was written').toBeDefined();
          const backup = new Uint8Array(readFileSync(backupFile ?? ''));
          expect(backup.length).toBe(FLASH_BYTES);
          /* Every window the backup reads holds the emulated flash's bytes at its address. */
          for (const window of preservationWindows()) {
            const at = window.address - FLASH_BASE;
            expect(
              sha256(backup.subarray(at, at + BANK_BYTES)),
              `window at ${window.address.toString(16)}`,
            ).toBe(sha256(flash.subarray(at, at + BANK_BYTES)));
          }
          expect([...r.sent.keys()].filter((op) => CHANGES_THE_CAMERA.includes(op))).toEqual([]);
        } finally {
          await out.cleanup();
        }
      },
    );
  }

  it(
    'refuses a 4.8.2.1 on the version, before any window is armed or read',
    { timeout: TIMEOUT_MS },
    async () => {
      const out = await tempDir();
      let result: CliRun | null = null;
      try {
        const defect = await onCamera(
          { label: 'Compact 4.8.2.1', entryId: ENTRY.c4821 },
          async (target) => {
            result = await cli(['preserve', '--backup-only', '--yes', '--out', out.path], target);
          },
        );
        expect(defect, 'the emulator run').toBe('');
      } finally {
        await out.cleanup();
      }
      const r = result as CliRun | null;
      expect(r, 'preserve ran').not.toBeNull();
      if (r === null) return;
      expect(r.code, 'the run fails').toBe(EXIT_FAILED);
      const message = (r.json?.error as { message?: string } | undefined)?.message ?? '';
      expect(message, `the refusal names the build (${r.stderr})`).toContain(
        'is not a 0.x or 1.x build',
      );
      /* Core's refusal names neither front end (TESTING.md 42.105). */
      expect(message).toContain('Dump & decrypt for 4.x and Nano');
      expect([...r.sent.keys()].filter((op) => op === WINDOW_READ || op === WINDOW_ARM)).toEqual(
        [],
      );
      expect([...r.sent.keys()].filter((op) => CHANGES_THE_CAMERA.includes(op))).toEqual([]);
    },
  );
});

describe.skipIf(!available)('dump through the CLI', () => {
  it(
    'dumps a 4.8.2.1 whole: the image is the emulated flash, and it decrypts what it holds',
    { timeout: TIMEOUT_MS },
    async () => {
      const out = await tempDir();
      let result: CliRun | null = null;
      try {
        let flash = null as Uint8Array | null;
        const defect = await onCamera(
          { label: 'Compact 4.8.2.1', entryId: ENTRY.c4821 },
          async (target, truthPath) => {
            result = await cli(['dump', '--out', out.path], target);
            flash = new Uint8Array(readFileSync(truthPath));
          },
        );
        expect(defect, 'the emulator run').toBe('');
        const r = result as CliRun | null;
        expect(r, 'dump ran').not.toBeNull();
        if (r === null || flash === null) return;
        expect(r.code, r.stderr).toBe(EXIT_OK);
        const image = walk(out.path).find((f) => statSync(f).size === FLASH_BYTES);
        expect(image, 'a 4 MiB image was written').toBeDefined();
        const bytes = new Uint8Array(readFileSync(image ?? ''));
        expect(sha256(bytes), 'the dump is the emulated flash').toBe(sha256(flash));
        expect(filesOf(r).length, 'the archive lists its files').toBeGreaterThan(0);
        expect([...r.sent.keys()].filter((op) => CHANGES_THE_CAMERA.includes(op))).toEqual([]);
      } finally {
        await out.cleanup();
      }
    },
  );

  it(
    'refuses a 1.3.0.0 on the version, names `preserve`, and reads no window',
    { timeout: TIMEOUT_MS },
    async () => {
      let result: CliRun | null = null;
      const defect = await onCamera(
        { label: 'Compact 1.3.0.0', entryId: ENTRY.c1300 },
        async (target) => {
          result = await cli(['dump'], target);
        },
      );
      expect(defect, 'the emulator run').toBe('');
      const r = result as CliRun | null;
      expect(r, 'dump ran').not.toBeNull();
      if (r === null) return;
      expect(r.code, 'the run is refused').toBe(EXIT_FAILED);
      expect(r.stderr).toContain('this camera runs 1.3.0.0');
      expect(r.stderr).toContain('seek-fw preserve');
      expect(r.stderr).toContain('nothing was read but the version');
      expect([...r.sent.keys()].filter((op) => op === WINDOW_READ || op === WINDOW_ARM)).toEqual(
        [],
      );
      expect([...r.sent.keys()].filter((op) => CHANGES_THE_CAMERA.includes(op))).toEqual([]);
    },
  );
});

/* ==================================================================== *
 * Decrypt File/Slot through the CLI: no camera at all
 * ==================================================================== */

describe.skipIf(!available)('decrypt through the CLI, with no camera', () => {
  it(
    'decrypts a whole corpus dump: the bank at 0x14030000 is the corpus plaintext',
    { timeout: TIMEOUT_MS },
    async () => {
      const dir = await tempDir();
      const inputs = await tempDir();
      try {
        const file = path.join(inputs.path, 'nano300-dump.bin');
        writeFileSync(file, corpusFile(ENTRY.nano300));
        const r = await cli(['decrypt', 'file', file, '--out', dir.path], null);
        expect(r.code, r.stderr).toBe(EXIT_OK);
        const plain = corpusImage(
          'nano_300/2024.11.21-11.55.00-44.27.3.10/1713A171RJB9/decrypted_14030000_keyb',
        );
        const decrypted = walk(dir.path).filter(
          (f) => path.basename(f).includes('14030000') && f.endsWith('.bin'),
        );
        const shas = decrypted.map((f) => sha256(new Uint8Array(readFileSync(f))));
        expect(shas, 'the corpus plaintext is among the decrypted slots').toContain(sha256(plain));
        expect(r.sent.size).toBe(0);
      } finally {
        await dir.cleanup();
        await inputs.cleanup();
      }
    },
  );

  it(
    'decrypts a 64 KiB slot cut from the Nano 300 dump: the file is the corpus plaintext',
    { timeout: TIMEOUT_MS },
    async () => {
      const dir = await tempDir();
      const inputs = await tempDir();
      try {
        const flash = corpusFile(ENTRY.nano300);
        const file = path.join(inputs.path, 'nano300-bank-a.bin');
        writeFileSync(file, bankOf(flash, 0x14030000));
        const r = await cli(['decrypt', 'slot', file, '--out', dir.path], null);
        expect(r.code, r.stderr).toBe(EXIT_OK);
        const plain = corpusImage(
          'nano_300/2024.11.21-11.55.00-44.27.3.10/1713A171RJB9/decrypted_14030000_keyb',
        );
        const out = walk(dir.path).find((f) => f.endsWith('-decrypted.bin'));
        expect(out, 'the decrypted image was written').toBeDefined();
        expect(sha256(new Uint8Array(readFileSync(out ?? ''))), 'the corpus plaintext').toBe(
          sha256(plain),
        );
        expect(
          walk(dir.path).some((f) => f.endsWith('-report.txt')),
          'the report was written',
        ).toBe(true);
        expect(r.json?.decrypted).toBe(true);
        expect(r.json?.status).toBe('decrypted');
      } finally {
        await dir.cleanup();
        await inputs.cleanup();
      }
    },
  );

  it(
    'reports an erased bank as empty and exits 0, with no decrypted file',
    { timeout: TIMEOUT_MS },
    async () => {
      const dir = await tempDir();
      const inputs = await tempDir();
      try {
        const file = path.join(inputs.path, 'erased.bin');
        writeFileSync(file, new Uint8Array(BANK_BYTES).fill(0xff));
        const r = await cli(['decrypt', 'slot', file, '--out', dir.path], null);
        expect(r.code, r.stderr).toBe(EXIT_OK);
        expect(r.json?.status).toBe('empty');
        expect(r.json?.decrypted).toBe(false);
        expect(walk(dir.path).some((f) => f.includes('-decrypted'))).toBe(false);
      } finally {
        await dir.cleanup();
        await inputs.cleanup();
      }
    },
  );

  it(
    'refuses a file that is not exactly 64 KiB, exits 1, and writes nothing',
    { timeout: TIMEOUT_MS },
    async () => {
      const dir = await tempDir();
      const inputs = await tempDir();
      try {
        const file = path.join(inputs.path, 'short.bin');
        writeFileSync(file, bankOf(corpusFile(ENTRY.nano300), 0x14030000, BANK_BYTES - 1));
        const r = await cli(['decrypt', 'slot', file, '--out', dir.path], null);
        expect(r.code).toBe(EXIT_FAILED);
        expect(r.stderr).toMatch(/64 KiB|65,?536|not exactly/i);
        expect(walk(dir.path)).toEqual([]);
      } finally {
        await dir.cleanup();
        await inputs.cleanup();
      }
    },
  );

  it(
    'refuses a random 64 KiB file: exits 1, the report says no image',
    { timeout: TIMEOUT_MS },
    async () => {
      const dir = await tempDir();
      const inputs = await tempDir();
      try {
        const file = path.join(inputs.path, 'random.bin');
        writeFileSync(file, garbage(BANK_BYTES, 0x1234));
        const r = await cli(['decrypt', 'slot', file, '--out', dir.path], null);
        expect(r.code).toBe(EXIT_FAILED);
        expect(
          walk(dir.path).some((f) => f.endsWith('-report.txt')),
          'the report says why',
        ).toBe(true);
        expect(walk(dir.path).some((f) => f.includes('-decrypted'))).toBe(false);
      } finally {
        await dir.cleanup();
        await inputs.cleanup();
      }
    },
  );

  it(
    'refuses a slot whose key does not recover: exits 1, the report is written, nothing decrypted',
    { timeout: TIMEOUT_MS },
    async () => {
      const dir = await tempDir();
      const inputs = await tempDir();
      try {
        const bank = garbage(BANK_BYTES, 0x5eed);
        const dv = new DataView(bank.buffer, bank.byteOffset, bank.byteLength);
        dv.setUint32(0x200, 0xa1b2c3d4, true);
        dv.setUint32(0x204, 0x1000, true);
        const file = path.join(inputs.path, 'no-key.bin');
        writeFileSync(file, bank);
        const r = await cli(['decrypt', 'slot', file, '--out', dir.path], null);
        expect(r.code).toBe(EXIT_FAILED);
        expect(
          walk(dir.path).some((f) => f.endsWith('-report.txt')),
          'the report says why',
        ).toBe(true);
        expect(walk(dir.path).some((f) => f.includes('-decrypted'))).toBe(false);
      } finally {
        await dir.cleanup();
        await inputs.cleanup();
      }
    },
  );

  it(
    'refuses a missing form and a --family on dump with exit 2',
    { timeout: TIMEOUT_MS },
    async () => {
      const noForm = await cli(['decrypt'], null);
      expect(noForm.code).toBe(EXIT_USAGE);
      const profileOnDump = await cli(['dump', '--family', 'modern-4x'], null);
      expect(profileOnDump.code).toBe(EXIT_USAGE);
    },
  );
});

/** A progress line for a long run, through the test's own output. */
function say(line: string): void {
  process.stderr.write(`[pages-cli] ${line}\n`);
}
