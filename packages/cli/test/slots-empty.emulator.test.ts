/* ====================================================================
 * `seek-fw slots` and an EMPTY bank, through the CLI itself, on the emulated camera.
 *
 * WHAT RUNS. `run()` with the real parser, the real `slots` command and the node-usb
 * layer over the emulated camera (the same path slots.emulator.test.ts drives), on the
 * Compact 1.3.0.0 full dump: the 2014 plaintext chain, whose bank B is erased in the
 * corpus dump (65,536 of 65,536 bytes 0xFF), bank A holds the image and the camera boots A.
 * One emulator, one sequence of commands, in order:
 *
 *   slots list --json                         B is `empty` (content, version null); A and R are images
 *   slots dump b --out <dir> --json           B dumps as the raw 64 KiB of 0xFF: ONE file, no decrypted one
 *   slots dump a --out <dir> --json           A's decrypted image, the source for B
 *   slots flash b <A's image> --dry-run       the plan says the target is empty; no write opcode
 *   slots flash b <A's image> --yes           written, read back, verified; the target was empty
 *   slots dump b --out <dir> --json           B is no longer empty and decrypts to the image written
 *   slots flash a <A's image> --yes           refused: A is the bank the camera boots (rule unchanged)
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR (suite.ts). Emulator only: no hardware.
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { UsbBackend } from '@seek-fw/core';
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
import { EXIT_FAILED, EXIT_OK } from '../src/errors.js';
import { tempDir, testIo } from './helpers.js';
import { nodeUsbOverUsbIp, type NodeUsbOverUsbIp } from './node-usb-over-usbip.js';

const TIMEOUT_MS = Number(process.env.SEEK_EMU_SLOTS_CLI_TIMEOUT_MS ?? '1800000');
const FLASH_BASE = 0x14000000;
const BANK_BYTES = 0x10000;
/** The 2014 locked line's bank addresses. */
const BANK_B = 0x14060000;
const STAGE_OP = 0x50;
const COMMIT_OP = 0x51;
const RESET_OP = 0x59;

const ENTRY_ID = 'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump';
const FF_SHA = createHash('sha256').update(new Uint8Array(BANK_BYTES).fill(0xff)).digest('hex');

const available = EMU_DIR !== null;
if (!available) announceSkip('the slots CLI on an empty bank on the emulated camera');

type Json = Record<string, unknown>;

interface CliRun {
  readonly code: number;
  readonly json: Json | null;
  readonly stderr: string;
  readonly sent: ReadonlyMap<number, number>;
}

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
      clock: device.usbip.deadlineClock,
    });
  const { io, stdout, stderr } = testIo({ backend });
  const code = await run([...argv, '--json'], io, new AbortController().signal);
  const text = stdout.text.trim();
  const json = text === '' ? null : (JSON.parse(text) as Json);
  return { code, json, stderr: stderr.text, sent: difference(before, sentByOpcode(emu)) };
}

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

const filesOf = (result: CliRun | null): string[] =>
  ((result?.json?.output as { files?: string[] } | undefined)?.files ?? []).slice();

const readOrNull = (file: string | undefined): Uint8Array | null =>
  file === undefined ? null : new Uint8Array(readFileSync(file));

interface Sequence {
  setup: string | null;
  defect: string | null;
  list: CliRun | null;
  dumpB: CliRun | null;
  dumpA: CliRun | null;
  dryRun: CliRun | null;
  flash: CliRun | null;
  redumpB: CliRun | null;
  refusal: CliRun | null;
  truth: Uint8Array | null;
  rawB: Uint8Array | null;
  imageA: Uint8Array | null;
  imageAName: string | null;
  redumpBRaw: Uint8Array | null;
  redumpBDecrypted: Uint8Array | null;
}

async function sequence(): Promise<Sequence> {
  const seq: Sequence = {
    setup: null,
    defect: null,
    list: null,
    dumpB: null,
    dumpA: null,
    dryRun: null,
    flash: null,
    redumpB: null,
    refusal: null,
    truth: null,
    rawB: null,
    imageA: null,
    imageAName: null,
    redumpBRaw: null,
    redumpBDecrypted: null,
  };
  const row = new RowEmulators(ENTRY_ID);
  const truthPath = scratchFile('slots_cli_empty_truth.bin');
  const outB = await tempDir();
  const outA = await tempDir();
  const outB2 = await tempDir();
  try {
    const emu = await row.start(EMU_DIR!, {
      entryId: ENTRY_ID,
      flashOut: truthPath,
      readyTimeoutMs: BOOT_TIMEOUT_MS,
    });
    await row.guard(emu, async () => {
      const usbip = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
      const device = await nodeUsbOverUsbIp(usbip);
      seq.truth = readOrNull(truthPath);

      seq.list = await cli(['slots', 'list'], device, emu);

      seq.dumpB = await cli(['slots', 'dump', 'b', '--out', outB.path], device, emu);
      seq.rawB = readOrNull(filesOf(seq.dumpB)[0]);

      seq.dumpA = await cli(['slots', 'dump', 'a', '--out', outA.path], device, emu);
      const decrypted = filesOf(seq.dumpA).find((file) => file.endsWith('-decrypted.bin'));
      seq.imageAName = decrypted === undefined ? null : path.basename(decrypted);
      seq.imageA = readOrNull(decrypted);
      if (decrypted === undefined) {
        seq.setup = 'slots dump a wrote no decrypted file, so there is no image to flash';
        return;
      }

      seq.dryRun = await cli(['slots', 'flash', 'b', decrypted, '--dry-run'], device, emu);
      seq.flash = await cli(['slots', 'flash', 'b', decrypted, '--yes'], device, emu);

      seq.redumpB = await cli(['slots', 'dump', 'b', '--out', outB2.path], device, emu);
      const after = filesOf(seq.redumpB);
      seq.redumpBRaw = readOrNull(after.find((file) => !file.includes('-decrypted')));
      seq.redumpBDecrypted = readOrNull(after.find((file) => file.includes('-decrypted')));

      seq.refusal = await cli(['slots', 'flash', 'a', decrypted, '--yes'], device, emu);
    });
    await row.assertDelivery();
  } catch (error) {
    seq.defect = error instanceof Error ? error.message : String(error);
  } finally {
    await row.finish();
    await outB.cleanup();
    await outA.cleanup();
    await outB2.cleanup();
  }
  return seq;
}

describe.skipIf(!available)('seek-fw slots on an empty bank, through the CLI', () => {
  const entry = ENTRIES.find((e) => e.id === ENTRY_ID) ?? null;
  let seq: Sequence | null = null;

  afterAll(() => {
    expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
  });

  describe.skipIf(entry === null)(
    'Compact 1.3.0.0, the 2014 plaintext chain, bank B erased',
    () => {
      beforeAll(async () => {
        seq = await sequence();
      }, TIMEOUT_MS);

      it('the run had no setup failure and no instrument defect', () => {
        expect(seq?.setup).toBeNull();
        expect(seq?.defect).toBeNull();
      });

      it('slots list --json: B is empty (content, no version), A and R are images', () => {
        const list = seq?.list;
        expect(list?.code, list?.stderr).toBe(EXIT_OK);
        expect(list?.json).toMatchObject({ ok: true, action: 'list', firmware: '1.3.0.0' });
        const slots = (list?.json?.slots ?? []) as Json[];
        expect(slots.map((s) => [s.bank, s.content, s.empty])).toEqual([
          ['a', 'image', false],
          ['b', 'empty', true],
          ['r', 'image', false],
        ]);
        expect(slots[1]?.version).toBeNull();
        expect(slots[1]?.emptyBank).toMatchObject({ writable: { supported: true } });
        expect(slots[0]?.active).toBe(true);
      });

      it('slots dump b: exit 0, empty, ONE file of the raw 64 KiB of 0xFF, equal to the emulator flash, nothing decrypted', () => {
        const dump = seq?.dumpB;
        expect(dump?.code, dump?.stderr).toBe(EXIT_OK);
        expect(dump?.json).toMatchObject({
          ok: true,
          action: 'dump',
          bank: 'b',
          address: '0x14060000',
          empty: true,
          decrypted: false,
          plainSha256: null,
          version: null,
          sha256: FF_SHA,
        });
        const files = filesOf(dump ?? null);
        expect(files).toHaveLength(1);
        expect(path.basename(files[0] ?? '')).toBe(`seek-slot-b-empty-${FF_SHA.slice(0, 8)}.bin`);
        expect(seq?.rawB).toHaveLength(BANK_BYTES);
        expect(seq?.rawB?.every((b) => b === 0xff)).toBe(true);
        const at = BANK_B - FLASH_BASE;
        expect(
          Buffer.compare(
            Buffer.from(seq?.rawB ?? []),
            Buffer.from(seq?.truth?.subarray(at, at + BANK_BYTES) ?? []),
          ),
          'the stored bank equals the emulator flash at 0x14060000',
        ).toBe(0);
        expect((dump?.json?.notes as string[]).join('\n')).toMatch(/empty, nothing to decrypt/);
      });

      it('slots flash b <A image> --dry-run: exit 0, the plan says the target is empty, no write opcode', () => {
        const dry = seq?.dryRun;
        expect(dry?.code, dry?.stderr).toBe(EXIT_OK);
        expect(dry?.json).toMatchObject({
          ok: true,
          action: 'flash',
          bank: 'b',
          address: '0x14060000',
          staging: 'plain',
          written: false,
          dryRun: true,
          targetEmpty: true,
        });
        for (const op of [STAGE_OP, COMMIT_OP, RESET_OP]) {
          expect(sentOf(dry?.sent ?? new Map(), op), `opcode 0x${op.toString(16)}`).toBe(0);
        }
      });

      it('slots flash b <A image> --yes: exit 0, committed, read back and verified; the target was empty', () => {
        const flash = seq?.flash;
        expect(flash?.code, flash?.stderr).toBe(EXIT_OK);
        expect(flash?.json).toMatchObject({
          ok: true,
          action: 'flash',
          bank: 'b',
          written: true,
          commitStatus: 0,
          verified: true,
          targetEmpty: true,
        });
        expect(sentOf(flash?.sent ?? new Map(), STAGE_OP)).toBeGreaterThan(0);
        expect(sentOf(flash?.sent ?? new Map(), COMMIT_OP)).toBe(1);
        expect(sentOf(flash?.sent ?? new Map(), RESET_OP)).toBe(0);
      });

      it('slots dump b after the write: not empty any more, and it decrypts to the image written', () => {
        const redump = seq?.redumpB;
        expect(redump?.code, redump?.stderr).toBe(EXIT_OK);
        expect(redump?.json).toMatchObject({ empty: false, decrypted: true });
        expect(seq?.redumpBRaw).toHaveLength(BANK_BYTES);
        expect(seq?.redumpBRaw?.every((b) => b === 0xff)).toBe(false);
        /* The plain chain stores the image as it is: B's decrypted image is A's, byte for byte. */
        expect(
          Buffer.compare(Buffer.from(seq?.redumpBDecrypted ?? []), Buffer.from(seq?.imageA ?? [])),
          'bank B after the write equals the image flashed into it',
        ).toBe(0);
      });

      it('slots flash a --yes: still refused, the bank the camera boots, with nothing sent', () => {
        const refusal = seq?.refusal;
        expect(refusal?.code).toBe(EXIT_FAILED);
        expect(refusal?.json).toMatchObject({ ok: false, error: { code: 'slots/refused' } });
        expect(sentOf(refusal?.sent ?? new Map(), STAGE_OP)).toBe(0);
        expect(sentOf(refusal?.sent ?? new Map(), COMMIT_OP)).toBe(0);
      });
    },
  );
});
