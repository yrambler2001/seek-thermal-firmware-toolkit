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
import { copyFileSync, readFileSync } from 'node:fs';
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
  const code = await run([...argv, '--json'], io, new AbortController().signal);
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

/** The stored-bank file of a bank B dump: `slot-b-<version>-<sha8>.bin`, never the decrypted one. */
function rawFile(files: readonly string[]): string | null {
  return (
    files.find((file) => {
      const name = path.basename(file);
      return /^slot-b-.*\.bin$/.test(name) && !name.includes('-decrypted');
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
          /^slot-b-.*-decrypted-KeyA-[0-9a-f]{32}-KeyB-[0-9a-f]{32}\.bin$/,
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

      it('slots flash b <file named without its key pair> --yes: refused by the name, nothing sent', () => {
        const bare = seq.current.bare;
        expect(bare?.code).toBe(EXIT_FAILED);
        expect(bare?.json).toMatchObject({
          command: 'slots',
          ok: false,
          error: { code: 'slots/refused' },
        });
        expect(String(bare?.json?.error && (bare.json.error as Json).message)).toMatch(/key pair/);
        expect(sentOf(bare?.sent ?? new Map(), STAGE_OP), 'SetFeaturedFirmwareData sent').toBe(0);
        expect(sentOf(bare?.sent ?? new Map(), COMMIT_OP), 'CompleteMemoryUpgrade sent').toBe(0);
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
