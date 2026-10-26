/* ====================================================================
 * `seek-fw slots` on an emulated camera, through the CLI itself.
 *
 * WHAT RUNS. `run()` with the real argument parser, the real `slots` command and
 * the node-usb layer over the emulated camera (`node-usb-over-usbip.ts`, the same
 * path `emulator-cli.test.ts` drives). Two firmwares, one emulator each, boot once
 * and then take the same sequence of commands, in order:
 *
 *   slots list --json                       the camera, its banks, what each can take
 *   slots dump b --out <dir> --json         bank B: the stored bank and its decrypted image
 *   slots flash b <decrypted> --dry-run     the plan, and NO write opcode on the wire
 *   slots flash b <decrypted> --yes         the write, with the read-back
 *   slots dump b --out <dir2> --json        the bank after the write, decrypted again
 *   slots flash a <decrypted> --yes         refused: bank A is the one the camera boots
 *
 * FIRMWARES. The Compact 4.8.2.1 (modern 4.x) full dump and the Compact PRO 4.9.2.0
 * full dump. Both are on the modern line, and both have a bank B whose decrypted
 * image carries the camera's own key pair (the corpus run of corpus-modern shows
 * the B write works on each).
 *
 * WHAT IS ASSERTED, PER COMMAND. The exit code (0, or 1 for a refusal). The files
 * written (the raw bank and the decrypted bank, byte for byte against the emulator's
 * own flash and the decryption the bank holds). The JSON document's shape and its
 * values under `--json` (exactly one document on stdout). For `--dry-run`: no
 * SetFeaturedFirmwareData (0x50), no CompleteMemoryUpgrade (0x51) and no ResetDevice
 * (0x59) is sent, counted by the emulator's own ledger, and the bank is unchanged.
 *
 * THE NAME OF A DECRYPTED FILE. `slots flash` refuses a file whose name does not carry
 * its key pair (write-image.ts). The dump names its decrypted file with the pair its
 * image holds, the way `decrypt` does; this file asserts that name, and then flashes
 * that very file.
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR (suite.ts). Emulator only: no hardware.
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { copyFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { UsbBackend } from '@seek-fw/core';
import {
  type Emulator,
  liveEmulatorCount,
  RowEmulators,
  type ManifestEntry,
} from '../../core/test/emulator/harness.js';
import {
  announceSkip,
  BOOT_TIMEOUT_MS,
  EMU_DIR,
  ENTRIES,
  FILL_SCOPE,
  FILL_SEED,
  scratchFile,
  URB_TIMEOUT_MS,
} from '../../core/test/emulator/suite.js';
import { expectedFFStored } from '../../core/test/slots/corpus-locked-run.js';
import { NodeUsbBackend, type BackendOptions } from '../src/backend.js';
import { run } from '../src/cli.js';
import { EXIT_FAILED, EXIT_OK } from '../src/errors.js';
import { tempDir, testIo } from './helpers.js';
import { nodeUsbOverUsbIp, type NodeUsbOverUsbIp } from './node-usb-over-usbip.js';

const TIMEOUT_MS = Number(process.env.SEEK_EMU_SLOTS_CLI_TIMEOUT_MS ?? '1800000');
const FLASH_BASE = 0x14000000;
const FLASH_SIZE = 4 * 1024 * 1024;
const BANK_BYTES = 0x10000;
/** The bank addresses on the modern line (profiles/modern-4x.ts). */
const BANK_B = 0x14050000;

/** SetFeaturedFirmwareData, CompleteMemoryUpgrade and ResetDevice: the opcodes a dry run must never send. */
const STAGE_OP = 0x50;
const COMMIT_OP = 0x51;
const RESET_OP = 0x59;

interface Firmware {
  readonly label: string;
  readonly entryId: string;
  /** The version the camera reports, and the family's JSON profile id. */
  readonly version: string;
}

const FIRMWARES: readonly Firmware[] = [
  {
    label: 'Compact 4.8.2.1 (modern 4.x)',
    entryId: 'compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/dump',
    version: '4.8.2.1',
  },
  {
    label: 'Compact PRO 4.9.2.0',
    entryId: 'compact_pro/2020.02.13-15.26.01-4.9.2.0/1215A0YZ9AA8/dump',
    version: '4.9.2.0',
  },
];

const available = EMU_DIR !== null;
if (!available) announceSkip('the slots CLI on the emulated corpus');

type Json = Record<string, unknown>;

interface CliRun {
  readonly code: number;
  /** The one JSON document `--json` put on stdout (null when stdout held none). */
  readonly json: Json | null;
  readonly stderr: string;
  /** Requests the emulator's ledger counted as sent by this command, by opcode. */
  readonly sent: ReadonlyMap<number, number>;
}

/** Where every write's backup zip goes (TESTING.md 42.91): a folder of this run's own, never the working directory. */
const BACKUP_DIR = mkdtempSync(path.join(tmpdir(), 'seek-fw-cli-backups-'));

/** A slots write saves its bank first, into --dump-dir; the suite names its own folder unless the test does. */
function withBackupDir(argv: readonly string[]): readonly string[] {
  const writes =
    argv[0] === 'slots' && ['flash', 'copy', 'restore', 'patch-fps'].includes(argv[1] ?? '');
  return writes && !argv.includes('--dump-dir') ? [...argv, '--dump-dir', BACKUP_DIR] : argv;
}

/** Runs one `seek-fw` command line under `--json`, over the emulated camera. */
async function cli(
  argv: readonly string[],
  device: NodeUsbOverUsbIp,
  emu: Emulator,
): Promise<CliRun> {
  const before = sentByOpcode(emu);
  const backend = (options: BackendOptions): UsbBackend =>
    new NodeUsbBackend({
      ...options,
      enumerate: () => Promise.resolve([device]),
      /* The emulated camera's clock, as every emulator suite times its deadlines. */
      clock: device.usbip.deadlineClock,
    });
  const { io, stdout, stderr } = testIo({ backend });
  const code = await run([...withBackupDir(argv), '--json'], io, new AbortController().signal);
  const text = stdout.text.trim();
  const json = text === '' ? null : (JSON.parse(text) as Json);
  return { code, json, stderr: stderr.text, sent: difference(before, sentByOpcode(emu)) };
}

/** The emulator's own count of requests sent, per opcode, over every session it has served. */
function sentByOpcode(emu: Emulator): Map<number, number> {
  const out = new Map<number, number>();
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

const sentOf = (sent: ReadonlyMap<number, number>, opcode: number): number => sent.get(opcode) ?? 0;

/** A decrypted file's name in the output: the one that is not the stored bank. */
function decryptedFile(files: readonly string[]): string | null {
  return files.find((file) => /-decrypted[^/]*\.bin$/.test(path.basename(file))) ?? null;
}

/** The stored-bank file of a bank B dump: `seek-slot-b-<version>-<sha8>.bin`, never the decrypted one. */
function rawFile(files: readonly string[]): string | null {
  return (
    files.find((file) => {
      const name = path.basename(file);
      return /^seek-slot-b-.*\.bin$/.test(name) && !name.includes('-decrypted');
    }) ?? null
  );
}

/** Everything one firmware's sequence recorded, read by the tests. */
interface Sequence {
  entry: ManifestEntry | null;
  setup: string | null;
  list: CliRun | null;
  dump: CliRun | null;
  dumpDir: string | null;
  dryRun: CliRun | null;
  flash: CliRun | null;
  redump: CliRun | null;
  redumpDir: string | null;
  refusal: CliRun | null;
  /** The decrypted file under the bare name, flashed: refused by its name. */
  bare: CliRun | null;
  /** The bytes of the raw and decrypted files the first dump wrote. */
  raw: Uint8Array | null;
  decrypted: Uint8Array | null;
  decryptedName: string | null;
  /** The emulator's as-booted flash, from before the first command. */
  truth: Uint8Array | null;
  /** The bytes of the bank B file the redump wrote, raw and decrypted. */
  redumpRaw: Uint8Array | null;
  redumpDecrypted: Uint8Array | null;
  defect: string | null;
}

function blankSequence(entry: ManifestEntry | null): Sequence {
  return {
    entry,
    setup: null,
    list: null,
    dump: null,
    dumpDir: null,
    dryRun: null,
    flash: null,
    redump: null,
    redumpDir: null,
    refusal: null,
    bare: null,
    raw: null,
    decrypted: null,
    decryptedName: null,
    truth: null,
    redumpRaw: null,
    redumpDecrypted: null,
    defect: null,
  };
}

/** A file's bytes, or null when no file was named. */
function readOrNull(file: string | null): Uint8Array | null {
  return file === null ? null : new Uint8Array(readFileSync(file));
}

async function sequence(entry: ManifestEntry): Promise<Sequence> {
  const seq = blankSequence(entry);
  const row = new RowEmulators(entry.id);
  const truthPath = scratchFile(`slots_cli_${entry.id.replace(/[^\w.-]+/g, '_')}.bin`);
  const outA = await tempDir();
  const outB = await tempDir();
  const outC = await tempDir();
  try {
    const emu = await row.start(EMU_DIR!, {
      entryId: entry.id,
      fillSeed: FILL_SEED,
      fillScope: FILL_SCOPE,
      flashOut: truthPath,
      readyTimeoutMs: BOOT_TIMEOUT_MS,
    });
    await row.guard(emu, async () => {
      const usbip = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
      const device = await nodeUsbOverUsbIp(usbip);
      seq.truth = readOrNull(truthPath);

      seq.list = await cli(['slots', 'list'], device, emu);

      seq.dump = await cli(['slots', 'dump', 'b', '--out', outA.path], device, emu);
      seq.dumpDir = outA.path;
      const files = (seq.dump.json?.output as { files?: string[] } | undefined)?.files ?? [];
      const decrypted = decryptedFile(files);
      seq.decryptedName = decrypted === null ? null : path.basename(decrypted);
      seq.decrypted = readOrNull(decrypted);
      seq.raw = readOrNull(rawFile(files));

      if (decrypted === null) {
        seq.setup = 'slots dump b wrote no decrypted file, so there is no image to flash';
        return;
      }

      seq.dryRun = await cli(['slots', 'flash', 'b', decrypted, '--dry-run'], device, emu);
      seq.flash = await cli(['slots', 'flash', 'b', decrypted, '--yes'], device, emu);

      seq.redump = await cli(['slots', 'dump', 'b', '--out', outB.path], device, emu);
      seq.redumpDir = outB.path;
      const after = (seq.redump.json?.output as { files?: string[] } | undefined)?.files ?? [];
      seq.redumpRaw = readOrNull(rawFile(after));
      seq.redumpDecrypted = readOrNull(decryptedFile(after));

      seq.refusal = await cli(['slots', 'flash', 'a', decrypted, '--yes'], device, emu);

      /* The same bytes under the bare name the dump used to give them (no key pair in it). The
       * flash must refuse the name before a single write opcode goes out. */
      seq.bare = await cli(
        ['slots', 'flash', 'b', bareCopy(decrypted, outC.path), '--yes'],
        device,
        emu,
      );
    });
    await row.assertDelivery();
  } catch (error) {
    seq.defect = error instanceof Error ? error.message : String(error);
  } finally {
    await row.finish();
    await outA.cleanup();
    await outB.cleanup();
    await outC.cleanup();
  }
  return seq;
}

/**
 * The decrypted file under the name the dump gave it before the key pair was added: the same
 * bytes, `-decrypted.bin`, no `-KeyA-…-KeyB-…`. Copied into `dir`; returns the path.
 */
function bareCopy(decrypted: string, dir: string): string {
  const bare = path
    .basename(decrypted)
    .replace(/-KeyA-[0-9a-f]{32}-KeyB-[0-9a-f]{32}(?=\.bin$)/, '');
  const target = path.join(dir, bare);
  copyFileSync(decrypted, target);
  return target;
}

const HEX64 = /^[0-9a-f]{64}$/;

/**
 * The payload is the image, its pad and its footer: whole 64-byte chunks, and no more than the
 * bank holds. Its length follows the image, so it is not pinned to the bank size.
 */
function expectPayload(json: Json | null | undefined): void {
  const bytes = Number(json?.payloadBytes);
  expect(bytes, 'payloadBytes').toBeGreaterThan(0);
  expect(bytes, 'payloadBytes is whole 64-byte chunks').toBe(Math.ceil(bytes / 64) * 64);
  expect(bytes, 'payloadBytes fits the bank').toBeLessThanOrEqual(BANK_BYTES);
}

describe.skipIf(!available)('seek-fw slots, through the CLI, on the emulated camera', () => {
  afterAll(() => {
    expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
  });

  for (const firmware of FIRMWARES) {
    const entry = ENTRIES.find((e) => e.id === firmware.entryId) ?? null;

    describe.skipIf(entry === null)(firmware.label, () => {
      const seq: { current: Sequence } = { current: blankSequence(entry) };

      beforeAll(async () => {
        if (entry === null) return;
        seq.current = await sequence(entry);
      }, TIMEOUT_MS);

      it('is in the corpus manifest', () => {
        expect(entry, `no manifest entry ${firmware.entryId}`).not.toBeNull();
      });

      it('slots list --json: exit 0, the camera and its three banks, what each takes', () => {
        const list = seq.current.list;
        expect(list, seq.current.setup ?? 'no list run').not.toBeNull();
        expect(list?.code, list?.stderr).toBe(EXIT_OK);
        const json = list?.json ?? {};
        expect(json).toMatchObject({
          command: 'slots',
          ok: true,
          action: 'list',
          firmware: firmware.version,
          profile: 'modern-4x',
          build: { supported: true },
        });
        const slots = json.slots as Json[];
        expect(slots.map((slot) => slot.bank)).toEqual(['a', 'b', 'r']);
        expect(slots.map((slot) => slot.address)).toEqual([
          '0x14030000',
          '0x14050000',
          '0x14070000',
        ]);
        for (const slot of slots) {
          expect(slot.staging, `${String(slot.bank)} staging`).toBe('key-a-ciphertext');
          expect(slot.operations, `${String(slot.bank)} operations`).toMatchObject({
            dump: { supported: true },
            flashDecrypted: { supported: true },
            flashRaw: { supported: true },
          });
        }
        expect(slots.filter((slot) => slot.active).map((slot) => slot.bank)).toEqual(['a']);
      });

      it('slots dump b --out: exit 0; writes the stored bank and its decrypted image, byte for byte', () => {
        const dump = seq.current.dump;
        expect(dump?.code, dump?.stderr).toBe(EXIT_OK);
        expect(dump?.json).toMatchObject({
          command: 'slots',
          ok: true,
          action: 'dump',
          bank: 'b',
          address: '0x14050000',
          version: firmware.version,
          decrypted: true,
        });
        const json = dump?.json ?? {};
        expect(String(json.sha256)).toMatch(HEX64);
        expect(String(json.plainSha256)).toMatch(HEX64);
        const output = json.output as { directory: string; zip: string | null; files: string[] };
        expect(output.zip).toBeNull();
        expect(output.files).toHaveLength(2);
        expect(seq.current.raw, 'the stored-bank file').not.toBeNull();
        expect(seq.current.decrypted, 'the decrypted file').not.toBeNull();
        expect(seq.current.raw?.length).toBe(BANK_BYTES);
        /* The stored bank is the emulator's own bytes at 0x14050000. */
        const truth = seq.current.truth;
        expect(truth?.length).toBe(FLASH_SIZE);
        expect(
          Buffer.compare(
            Buffer.from(seq.current.raw ?? []),
            Buffer.from(
              truth?.subarray(BANK_B - FLASH_BASE, BANK_B - FLASH_BASE + BANK_BYTES) ?? [],
            ),
          ),
          'the stored bank equals the emulator flash at 0x14050000',
        ).toBe(0);
        /* The decrypted file is the image the bank decrypts to, and it is named with the pair it holds. */
        expect(seq.current.decryptedName).toMatch(
          /^seek-slot-b-.*-decrypted-KeyA-[0-9a-f]{32}-KeyB-[0-9a-f]{32}\.bin$/,
        );
        expect(sha256Hex(seq.current.decrypted ?? new Uint8Array())).toBe(json.plainSha256);
      });

      it('slots flash b <decrypted> --dry-run: exit 0, the plan as JSON, and no write opcode on the wire', () => {
        const dry = seq.current.dryRun;
        expect(dry?.code, dry?.stderr).toBe(EXIT_OK);
        expect(dry?.json).toMatchObject({
          command: 'slots',
          ok: true,
          action: 'flash',
          bank: 'b',
          address: '0x14050000',
          kind: 'plain',
          staging: 'key-a-ciphertext',
          written: false,
          dryRun: true,
        });
        expectPayload(dry?.json);
        expect(
          sentOf(dry?.sent ?? new Map(), STAGE_OP),
          'SetFeaturedFirmwareData sent by the dry run',
        ).toBe(0);
        expect(
          sentOf(dry?.sent ?? new Map(), COMMIT_OP),
          'CompleteMemoryUpgrade sent by the dry run',
        ).toBe(0);
        expect(sentOf(dry?.sent ?? new Map(), RESET_OP), 'ResetDevice sent by the dry run').toBe(0);
      });

      it('slots flash b <decrypted> --yes: exit 0, committed and read back; the bank decrypts to the file', () => {
        const flash = seq.current.flash;
        expect(flash?.code, flash?.stderr).toBe(EXIT_OK);
        expect(flash?.json).toMatchObject({
          command: 'slots',
          ok: true,
          action: 'flash',
          bank: 'b',
          written: true,
          commitStatus: 0,
        });
        expectPayload(flash?.json);
        expect(String(flash?.json?.storedSha256)).toMatch(HEX64);
        expect(sentOf(flash?.sent ?? new Map(), STAGE_OP)).toBeGreaterThan(0);
        expect(sentOf(flash?.sent ?? new Map(), COMMIT_OP)).toBe(1);
        /* The bank after the write decrypts to the very file that was flashed. */
        const redump = seq.current.redump;
        expect(redump?.code, redump?.stderr).toBe(EXIT_OK);
        expect(seq.current.redumpDecrypted, 'the decrypted bank after the write').not.toBeNull();
        /* The JSON reports the hash of the file it wrote: the file and the report agree. */
        expect(
          sha256Hex(seq.current.redumpRaw ?? new Uint8Array()),
          'the stored bank after the write',
        ).toBe(redump?.json?.sha256);
        expect(
          Buffer.compare(
            Buffer.from(seq.current.redumpDecrypted ?? []),
            Buffer.from(seq.current.decrypted ?? []),
          ),
          'the bank B image after the write equals the flashed file',
        ).toBe(0);
      });

      it('slots flash a <decrypted> --yes: refused with exit 1 and nothing sent, the booted bank', () => {
        const refusal = seq.current.refusal;
        expect(refusal?.code).toBe(EXIT_FAILED);
        expect(refusal?.json).toMatchObject({
          command: 'slots',
          ok: false,
          error: { code: 'slots/refused' },
        });
        expect(sentOf(refusal?.sent ?? new Map(), STAGE_OP), 'SetFeaturedFirmwareData sent').toBe(
          0,
        );
        expect(sentOf(refusal?.sent ?? new Map(), COMMIT_OP), 'CompleteMemoryUpgrade sent').toBe(0);
      });

      it('slots flash b <file named without its key pair> --yes: the pair is found in the image by value, so it is written', () => {
        /* The name used to be the only source of the pair, so a bare name was refused. The pair is
         * now located in the image itself (the camera's own, or a decoded application pair), so the
         * same bytes under a bare name stage and commit like the named copy. An image carrying no
         * known pair is still refused, by `write-keys.test.ts` and the corpus rows. */
        const bare = seq.current.bare;
        expect(bare?.code).toBe(EXIT_OK);
        expect(
          sentOf(bare?.sent ?? new Map(), STAGE_OP),
          'SetFeaturedFirmwareData sent',
        ).toBeGreaterThan(0);
        expect(sentOf(bare?.sent ?? new Map(), COMMIT_OP), 'CompleteMemoryUpgrade sent').toBe(1);
      });

      it('the run had no setup failure and no instrument defect', () => {
        expect(seq.current.setup).toBeNull();
        expect(seq.current.defect).toBeNull();
      });
    });
  }
});

function sha256Hex(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

/* ====================================================================
 * THE 1.3.0.8 FF (16 Hz) IMAGE, through the CLI: `slots flash r <ff image>`.
 *
 * The FF image goes to A, B and R in the vendor's staged form, the image XOR Key A with the header
 * verbatim, and the camera stores the image XOR Key B (TESTING.md 42.12). One emulator
 * boot (the 2014 plaintext donor, the Spansion part its commit needs; the corpus-locked suite's
 * FF row and the preservation suite's FF row use the same), then this sequence:
 *
 *   slots list --json                                  the camera and its banks, the FF note
 *   slots flash b <ff> --acknowledge-risk --yes        refused for bank B before any byte is sent
 *   slots flash r <ff> --yes                           refused: recovery needs --acknowledge-risk
 *   slots flash r <ff> --acknowledge-risk --dry-run    the plan (vendor form), no write opcode
 *   slots flash r <ff> --acknowledge-risk --yes        the write, read back, verified
 *   slots dump r --out <dir>                           the bank after the write
 *
 * What the bank must hold is worked out in corpus-locked-run.ts (`expectedFFStored`), from the
 * image and the key pair, not by the writer's own builder. Emulator only: no hardware.
 * ==================================================================== */

const FF_ENTRY_ID =
  'compact/2017.01.06-11.17.29-1.3.0.8-FF/no-serial/32k_43x0_1.3.0.8_compact-16hz_public_-_compact_ff_jan_6_2017_11-17-29_99.28_gabiz_ro_firmware';
/** The 2014 plaintext donor and the Spansion part the FF commit runs on (preservation families suite). */
const FF_DONOR = '101310HSNEA2/dump';
const FF_JEDEC = '010215';

interface FFSequence {
  setup: string | null;
  defect: string | null;
  image: Uint8Array | null;
  list: CliRun | null;
  writtenB: CliRun | null;
  refusedNoAck: CliRun | null;
  dryRun: CliRun | null;
  flash: CliRun | null;
  dump: CliRun | null;
  /** The bank-R file the dump wrote after the write. */
  stored: Uint8Array | null;
  /** The dump's decrypted file of bank R, read while the dump's directory still exists. */
  decrypted: Uint8Array | null;
}

async function ffSequence(entry: ManifestEntry): Promise<FFSequence> {
  const seq: FFSequence = {
    setup: null,
    defect: null,
    image: null,
    list: null,
    writtenB: null,
    refusedNoAck: null,
    dryRun: null,
    flash: null,
    dump: null,
    stored: null,
    decrypted: null,
  };
  const row = new RowEmulators(entry.id);
  const out = await tempDir();
  const files = await tempDir();
  try {
    const vendored = (entry as ManifestEntry & { vendored_path?: string }).vendored_path;
    if (vendored === undefined) {
      seq.setup = 'the manifest entry names no vendored image';
      return seq;
    }
    const imagePath = path.join(EMU_DIR!, vendored);
    seq.image = new Uint8Array(readFileSync(imagePath));
    /* The file under a plain name: the plain chain needs no key pair in it. */
    const ffFile = path.join(files.path, 'ff-1.3.0.8.bin');
    copyFileSync(imagePath, ffFile);

    const emu = await row.start(EMU_DIR!, {
      entryId: entry.id,
      readyTimeoutMs: BOOT_TIMEOUT_MS,
      jedec: FF_JEDEC,
      donor: FF_DONOR,
    });
    await row.guard(emu, async () => {
      const usbip = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
      const device = await nodeUsbOverUsbIp(usbip);

      seq.list = await cli(['slots', 'list'], device, emu);
      seq.writtenB = await cli(
        ['slots', 'flash', 'b', ffFile, '--acknowledge-risk', '--yes', '--running-16hz'],
        device,
        emu,
      );
      seq.refusedNoAck = await cli(
        ['slots', 'flash', 'r', ffFile, '--yes', '--running-16hz'],
        device,
        emu,
      );
      seq.dryRun = await cli(
        ['slots', 'flash', 'r', ffFile, '--acknowledge-risk', '--dry-run', '--running-16hz'],
        device,
        emu,
      );
      seq.flash = await cli(
        ['slots', 'flash', 'r', ffFile, '--acknowledge-risk', '--yes', '--running-16hz'],
        device,
        emu,
      );
      seq.dump = await cli(['slots', 'dump', 'r', '--out', out.path], device, emu);
      const written = (seq.dump.json?.output as { files?: string[] } | undefined)?.files ?? [];
      seq.stored =
        readOrNull(
          written.find((file) => {
            const name = path.basename(file);
            return /^seek-slot-r-.*\.bin$/.test(name) && !name.includes('-decrypted');
          }) ?? null,
        ) ?? null;
      seq.decrypted =
        readOrNull(
          written.find((file) => /^seek-slot-r-.*-decrypted.*\.bin$/.test(path.basename(file))) ??
            null,
        ) ?? null;
    });
    await row.assertDelivery();
  } catch (error) {
    seq.defect = error instanceof Error ? error.message : String(error);
  } finally {
    await row.finish();
    await out.cleanup();
    await files.cleanup();
  }
  return seq;
}

describe.skipIf(!available)(
  'seek-fw slots flash r <1.3.0.8 FF image>, through the CLI, on the emulated camera',
  () => {
    const entry = ENTRIES.find((e) => e.id === FF_ENTRY_ID) ?? null;

    describe.skipIf(entry === null)('Compact 1.3.0.8-FF (16 Hz), 2014 donor', () => {
      const seq: { current: FFSequence } = {
        current: {
          setup: null,
          defect: null,
          image: null,
          list: null,
          writtenB: null,
          refusedNoAck: null,
          dryRun: null,
          flash: null,
          dump: null,
          stored: null,
          decrypted: null,
        },
      };

      beforeAll(async () => {
        if (entry === null) return;
        seq.current = await ffSequence(entry);
      }, TIMEOUT_MS);

      /** The bank the write must leave: the stamped image, then erased. */
      function expectedBank(): Uint8Array {
        const image = seq.current.image ?? new Uint8Array();
        const bank = new Uint8Array(BANK_BYTES).fill(0xff);
        bank.set(expectedFFStored(image), 0);
        return bank;
      }

      it('slots list --json: 1.3.0.8 on legacy-auth, three banks, the FF image said to be untested, the write keys the vendor form', () => {
        const list = seq.current.list;
        expect(list?.code, list?.stderr ?? seq.current.setup ?? '').toBe(EXIT_OK);
        expect(list?.json).toMatchObject({
          command: 'slots',
          ok: true,
          action: 'list',
          firmware: '1.3.0.8',
          profile: 'legacy-auth',
          build: { supported: true },
        });
        const notes = (list?.json?.notes as string[] | undefined) ?? [];
        expect(notes.join('\n')).toMatch(/UNTESTED/);
        /* No bank of this camera is stored plain: the write keys are the FF vendor form, not "refused"
         * (TESTING.md 42.89). */
        expect(list?.json?.writeKeys).toMatchObject({
          refused: null,
          form: 'ff-vendor',
          key: 'Key B',
        });
        const slots = (list?.json?.slots as Json[] | undefined) ?? [];
        expect(slots.map((slot) => slot.bank)).toEqual(['a', 'b', 'r']);
        for (const slot of slots) expect(slot.staging, String(slot.bank)).toBe('plain');
      });

      it('slots flash b <ff> --acknowledge-risk --yes --running-16hz: written in the vendor form, committed, read back', () => {
        const written = seq.current.writtenB;
        expect(written?.code, written?.stderr).toBe(EXIT_OK);
        expect(written?.json).toMatchObject({
          command: 'slots',
          ok: true,
          action: 'flash',
          bank: 'b',
          staging: 'key-a-keystream',
          written: true,
          commitStatus: 0,
          verified: true,
        });
        expect(sentOf(written?.sent ?? new Map(), COMMIT_OP)).toBe(1);
      });

      it('slots flash r <ff> --yes: refused without --acknowledge-risk, nothing sent', () => {
        const refusal = seq.current.refusedNoAck;
        expect(refusal?.code).toBe(EXIT_FAILED);
        expect(refusal?.json).toMatchObject({
          command: 'slots',
          ok: false,
          error: { code: 'slots/refused' },
        });
        expect(String((refusal?.json?.error as Json | undefined)?.message)).toMatch(
          /bank R is the recovery bank/,
        );
        expect(sentOf(refusal?.sent ?? new Map(), STAGE_OP)).toBe(0);
        expect(sentOf(refusal?.sent ?? new Map(), COMMIT_OP)).toBe(0);
      });

      it('slots flash r <ff> --acknowledge-risk --dry-run: exit 0, the vendor-form plan, the image it will leave, no write opcode', () => {
        const dry = seq.current.dryRun;
        expect(dry?.code, dry?.stderr).toBe(EXIT_OK);
        expect(dry?.json).toMatchObject({
          command: 'slots',
          ok: true,
          action: 'flash',
          bank: 'r',
          address: '0x14070000',
          kind: 'plain',
          staging: 'key-a-keystream',
          written: false,
          dryRun: true,
        });
        /* The payload is the staged image: the file's length, and not the bank's. */
        expect(dry?.json?.payloadBytes).toBe(seq.current.image?.length);
        /* The plan says the bank will hold the solved image, then erased, by its digest. */
        expect(dry?.json?.expectedSha256).toBe(sha256Hex(expectedBank()));
        /* The staging row says the vendor form and the stored Key B (the JSON's `staging`), so no note says
         * it again (TESTING.md 42.89); the untested boot warns (42.88). */
        const warnings = (dry?.json?.warnings as string[] | undefined) ?? [];
        const planNotes =
          (dry?.json?.planNotes as { source: string; text: string }[] | undefined) ?? [];
        const writeNotes = planNotes.filter((note) => note.source === 'write').map((n) => n.text);
        expect(writeNotes.join('\n')).not.toMatch(/vendor app/);
        expect(writeNotes.join('\n')).not.toMatch(/block 0 \(Key A\)/);
        expect(warnings.join('\n')).toMatch(/UNTESTED/);
        for (const opcode of [STAGE_OP, COMMIT_OP, RESET_OP]) {
          expect(sentOf(dry?.sent ?? new Map(), opcode), `opcode ${String(opcode)}`).toBe(0);
        }
      });

      it('slots flash r <ff> --acknowledge-risk --yes: exit 0, committed, and the read-back is the image XOR Key B', () => {
        const flash = seq.current.flash;
        expect(flash?.code, flash?.stderr).toBe(EXIT_OK);
        expect(flash?.json).toMatchObject({
          command: 'slots',
          ok: true,
          action: 'flash',
          bank: 'r',
          staging: 'key-a-keystream',
          written: true,
          commitStatus: 0,
          verified: true,
        });
        expect(flash?.json?.storedSha256).toBe(sha256Hex(expectedBank()));
        expect(flash?.json?.storedSha256).toBe(flash?.json?.expectedSha256);
        expect(sentOf(flash?.sent ?? new Map(), STAGE_OP)).toBeGreaterThan(0);
        expect(sentOf(flash?.sent ?? new Map(), COMMIT_OP)).toBe(1);
        expect(sentOf(flash?.sent ?? new Map(), RESET_OP), 'ResetDevice is never sent').toBe(0);
      });

      it('slots dump r afterwards: the stored bank is the image XOR Key B (the header window verbatim), then erased', () => {
        const dump = seq.current.dump;
        expect(dump?.code, dump?.stderr).toBe(EXIT_OK);
        const stored = seq.current.stored;
        expect(stored, 'the stored-bank file of bank R').not.toBeNull();
        expect(Buffer.compare(Buffer.from(stored ?? []), Buffer.from(expectedBank()))).toBe(0);
        expect(dump?.json?.sha256).toBe(sha256Hex(stored ?? new Uint8Array()));
        const image = seq.current.image ?? new Uint8Array();
        /* The dump decodes the bank under Key B: its decrypted file is the plain FF image, byte for byte. */
        const decrypted = seq.current.decrypted;
        expect(decrypted, 'the decrypted file of bank R').not.toBeNull();
        expect(Buffer.compare(Buffer.from(decrypted ?? []), Buffer.from(image))).toBe(0);
        const changed: number[] = [];
        for (let i = 0; i < image.length; i++) if (stored?.[i] !== image[i]) changed.push(i);
        expect(changed.length).toBeGreaterThan(0);
        /* The header window 0x200..0x23F is verbatim; everything after it is XORed with Key B. */
        expect(changed.every((at) => at < 0x200 || at >= 0x240)).toBe(true);
      });

      it('the run had no setup failure and no instrument defect', () => {
        expect(seq.current.setup).toBeNull();
        expect(seq.current.defect).toBeNull();
      });
    });
  },
);
