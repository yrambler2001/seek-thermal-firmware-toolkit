/* ====================================================================
 * Which cell GetFirmwareInfo selector 10 reads, and which bank ran, on four builds (TESTING.md 42.56).
 *
 * Selector 10 is the product's active-slot word (`readDeviceInfo`: the 64-byte reply's word at +8, read in
 * device-info.ts). The firmware returns the address of its own roots record, so the word's cell depends on
 * the line:
 *   - 1.3.0.0 (2014) and 1.0.3.0 (2016): the record is the boot record at 0x10000200 (the bootloader's
 *     handoff, written before it enters the image), so the word is 0x10000208;
 *   - 4.9.1.15: the roots record is at 0x10002110 (found in RAM by the reply's bytes), so the word is 0x10002118;
 *   - 4.8.2.1: the reply is zero and the record is not found; the word is 0 under every boot word.
 *
 * THE TWO READS ARE INDEPENDENT. The product read runs in one emulator boot (usbip, the page's read path).
 * The direct read runs in a second boot of the same flash through a Python helper (FW-V1's own machine,
 * the same firmware-init gate and selector-10 RPC), which reads the cells 0x1000AED0 and 0x10000208 and the
 * record the reply came from. The two boots start from identical bytes, so their words must agree.
 *
 * WHICH BANK RAN is the build string. Each bank that the bootloader accepts gets a marked copy of its image:
 * the build string's last letter or digit moved on by 1 (A), 2 (B) or 3 (R), the accept sum fixed. The marks
 * are written through the product write path (prepareSlotFlash, flashSlot), and the composed flash is booted
 * with the boot-config word set to 0, 1 and 2. The build string the camera then reports names the bank that
 * ran, and the three marks differ, so B and R are told apart (42.36 marked only A).
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR (SEEK_EMU_DIR), like every emulator suite.
 * ==================================================================== */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { collectingReporter, silentReporter } from '../../src/events.js';
import { detectProfile } from '../../src/profiles/registry.js';
import type { FirmwareProfile, SlotKey } from '../../src/profiles/types.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { WebUsbTransport } from '../../src/protocol/webusb.js';
import { dumpSlot } from '../../src/slots/dump.js';
import { inspectSlots } from '../../src/slots/inspect.js';
import { plainBankVerdict } from '../../src/slots/running.js';
import type { SlotsReport } from '../../src/slots/types.js';
import { flashSlot, prepareSlotFlash } from '../../src/slots/write.js';
import {
  evidenceFromChannelProbe,
  probeSelectorChannel,
  readRunningFirmware,
} from '../../src/workflows/capability.js';
import { readDeviceInfo } from '../../src/workflows/device-info.js';
import type { DeviceState, WorkflowContext } from '../../src/workflows/types.js';
import { RowEmulators } from '../emulator/harness.js';
import {
  announceSkip,
  BOOT_TIMEOUT_MS,
  EMU_DIR,
  FILL_SCOPE,
  FILL_SEED,
  scratchFile,
  URB_TIMEOUT_MS,
} from '../emulator/suite.js';
import { corpusEntries, SPANSION_4MB_JEDEC, type CorpusEntry } from './corpus-locked-subjects.js';

const available = EMU_DIR !== null;
if (!available) announceSkip('the active-slot cells and the bank that runs');

const FLASH_BASE = 0x14000000;
const BANK_BYTES = 0x10000;
/** cfg[0], the boot-config word at 0x14010000. */
const CFG_OFFSET = 0x10000;
const BOOT_BUDGET_MS = 600_000;
const WORDS: readonly number[] = [0, 1, 2];
/** How far each bank's mark moves the build string's last character. */
const MARK_STEP: Readonly<Record<SlotKey, number>> = { a: 1, b: 2, r: 3 };
const BANK_KEYS: readonly SlotKey[] = ['a', 'b', 'r'];
/** The bench's write order (e2e/lib/bench/spec-flow.ts, WRITE_ORDER), which the frame-rate suites follow. */
const WRITE_ORDER: readonly SlotKey[] = ['b', 'a', 'r'];

interface Build {
  readonly label: string;
  /** The manifest id of the full dump. */
  readonly prefix: string;
  readonly version: string;
  /** The build's FW-init gate cell (g_systick_state), as the emulator's own probes name it. */
  readonly systick: number;
  /**
   * The RAM record the selector's reply reads, where the direct read found it (the reply is non-zero and
   * matches exactly one place in RAM). Null where the reply is zero and no place was found (4.8.2.1).
   */
  readonly record: number | null;
  /** Whether the word tracks the bank that runs. False where the app never writes it (4.8.x). */
  readonly tracksBank: boolean;
  /** The JEDEC id the emulated part reports (the native 2016 dump is a Spansion part), or null. */
  readonly jedec: string | null;
}

const BUILDS: readonly Build[] = [
  {
    label: 'Compact 1.3.0.0 (2014 chain)',
    prefix: 'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump',
    version: '1.3.0.0',
    systick: 0x10011ac8,
    record: 0x10000200,
    tracksBank: true,
    jedec: null,
  },
  {
    label: 'Compact PRO 1.0.3.0 (2016 keystream line)',
    prefix: 'compact_pro/2016.07.06-17.04.49-1.0.3.0/0C21A1M5KP15/dump',
    version: '1.0.3.0',
    systick: 0x10003155,
    record: 0x10000200,
    tracksBank: true,
    jedec: SPANSION_4MB_JEDEC,
  },
  {
    label: 'Compact 4.8.2.1 (XR tree)',
    prefix: 'compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/dump',
    version: '4.8.2.1',
    systick: 0x100813b8,
    record: null,
    tracksBank: false,
    jedec: null,
  },
  {
    label: 'Compact PRO 4.9.1.15',
    prefix: 'compact_pro/2019.03.14-09.18.41-4.9.1.15/1C0EZ0KTAMA5/dump',
    version: '4.9.1.15',
    systick: 0x10002155,
    record: 0x10002110,
    tracksBank: true,
    jedec: null,
  },
];

/**
 * The direct read: boots `flash` in FW-V1's Python machine (copy-on-write), waits for the firmware-init gate,
 * sends SetFirmwareInfoFeatures(10) and GetFirmwareInfo, and reads the RAM cells. Searches RAM for the reply to
 * find the record, and writes a sentinel at 0x1000AED0 after the reads to see whether the reply's +8 is that
 * cell. Prints one JSON object.
 */
const DIRECT_READ_PY = `
import json, os, struct, sys
EMU, flash, systick, word = sys.argv[1], sys.argv[2], int(sys.argv[3], 16), int(sys.argv[4], 0)
jedec_hex = sys.argv[5] if len(sys.argv) > 5 else ''
kw = {} if not jedec_hex else {'jedec': tuple(bytes.fromhex(jedec_hex))}
sys.path.insert(0, EMU)
os.chdir(EMU)
from seekemu import flash_rpc as FR
from seekemu.machine import Machine
from seekemu.norflash import open_nor
from seekemu.usb_host import UsbHost
SENTINEL = 0xC0FFEE01
bootrom = open(os.path.join(EMU, 'data', 'lpc4330_bootrom_10400000_64k.bin'), 'rb').read()
nor = open_nor(flash, **kw)
nor.data[0x10000:0x10004] = struct.pack('<I', word)
m = Machine(nor.snapshot(), mfi=True, bootrom=bootrom, **kw)
host = UsbHost(m)
rec = {'word': word}
def u32(addr):
    return struct.unpack('<I', bytes(m.uc.mem_read(addr, 4)))[0]
def script():
    yield from host.enumerate()
    rec['product'] = host.product()
    yield from FR._wait_startup_gate(host, m, {'systick_state': systick}, budget=20000000)
    rec['systick'] = m.uc.mem_read(systick, 1)[0]
    yield from host.set_interface(1, 1)
    rec['cell_1000AED0'] = u32(0x1000AED0)
    rec['word_10000208'] = u32(0x10000208)
    yield from host.rpc_bulk(85, struct.pack('<H', 10), budget=400000)
    reply = bytes((yield from host.rpc_bulk(78, b'', limit=64, budget=400000)) or b'')
    rec['reply'] = reply.hex()
    rec['cell_1000AED0_after'] = u32(0x1000AED0)
    rec['word_10000208_after'] = u32(0x10000208)
    hits = []
    if len(reply) == 64 and any(reply[:16]):
        for base in list(range(0x10000000, 0x10040000, 0x1000)) + list(range(0x10080000, 0x100A0000, 0x1000)):
            try:
                blob = bytes(m.uc.mem_read(base, 0x1000))
            except Exception:
                continue
            i = blob.find(reply[:16])
            while i >= 0:
                hits.append(base + i)
                i = blob.find(reply[:16], i + 1)
    rec['record_hits'] = [hex(h) for h in hits[:4]]
    rec['record'] = hex(hits[0]) if len(hits) == 1 else None
    rec['word_at_record_plus8'] = u32(hits[0] + 8) if len(hits) == 1 else None
    m.uc.mem_write(0x1000AED0, struct.pack('<I', SENTINEL))
    yield from host.rpc_bulk(85, struct.pack('<H', 10), budget=400000)
    again = bytes((yield from host.rpc_bulk(78, b'', limit=64, budget=400000)) or b'')
    rec['sentinel_at_reply_plus8'] = again[8:12] == struct.pack('<I', SENTINEL)
FR._run(m, host, script(), 600000000)
rec['handoff_r0'] = hex(m.handoff_r0) if m.handoff_r0 is not None else None
print(json.dumps(rec))
`;

interface Direct {
  readonly systick: number;
  readonly cell_1000AED0: number;
  readonly word_10000208: number;
  readonly reply: string;
  readonly cell_1000AED0_after: number;
  readonly word_10000208_after: number;
  readonly record: string | null;
  readonly record_hits: readonly string[];
  readonly word_at_record_plus8: number | null;
  readonly sentinel_at_reply_plus8: boolean;
  readonly handoff_r0: string | null;
}

/** The bank a boot's build string names: the bank whose mark it carries, or null. */
function bankOfBuild(build: string | null, marks: ReadonlyMap<SlotKey, string>): SlotKey | null {
  if (build === null) return null;
  for (const [key, text] of marks) if (text === build) return key;
  return null;
}

/** The build string with its last letter or digit moved on by `step` (the accept suite's method, 42.7). */
function advanced(
  text: string,
  step: number,
): { readonly text: string; readonly at: number } | null {
  let at = -1;
  for (let i = text.length - 1; i >= 0; i--) {
    if (/[A-Za-z0-9]/.test(text.charAt(i))) {
      at = i;
      break;
    }
  }
  if (at < 0) return null;
  let next = text;
  for (let s = 0; s < step; s++) {
    const c = next.charAt(at);
    const moved =
      c === '9'
        ? '0'
        : c === 'Z'
          ? 'A'
          : c === 'z'
            ? 'a'
            : String.fromCharCode(c.charCodeAt(0) + 1);
    next = `${next.slice(0, at)}${moved}${next.slice(at + 1)}`;
  }
  return { text: next, at };
}

/** `image` with every copy of `from` replaced by `to` (the same length). Throws when `from` is absent. */
function replaced(image: Uint8Array, from: string, to: string): Uint8Array {
  const needle = Uint8Array.from(from, (ch) => ch.charCodeAt(0));
  const repl = Uint8Array.from(to, (ch) => ch.charCodeAt(0));
  const out = image.slice();
  let hits = 0;
  for (let i = 0; i + needle.length <= out.length; i++) {
    if (needle.every((byte, j) => out[i + j] === byte)) {
      out.set(repl, i);
      hits++;
      i += needle.length - 1;
    }
  }
  if (hits === 0) throw new Error(`the build string is not in the bank's image`);
  return out;
}

async function profileOf(device: SeekDevice): Promise<FirmwareProfile> {
  return detectProfile(evidenceFromChannelProbe(await probeSelectorChannel(device))).best.profile;
}

function workflowOf(device: SeekDevice, profile: FirmwareProfile): WorkflowContext {
  return { device, profile, detection: null, reporter: silentReporter };
}

function viewOf(report: SlotsReport, key: SlotKey) {
  const view = report.slots.find((candidate) => candidate.entry.key === key);
  if (view === undefined) throw new Error(`the plan has no bank ${key.toUpperCase()}`);
  return view;
}

/**
 * Whether the bootloader takes bank `key`. On the 2014 plaintext chain that is the image check the boot
 * choice uses (boot-choice.ts `acceptsOf`); on the other lines it is the analysis's own acceptance.
 */
function acceptedOf(report: SlotsReport, key: SlotKey): boolean {
  const state = viewOf(report, key).state;
  if (report.state.plainChain) {
    const raw = state?.raw;
    return raw !== null && raw !== undefined && plainBankVerdict(raw) === 1;
  }
  return state?.accepts === true;
}

/** The flash with each bank's whole raw bytes replaced, and the boot-config word set to `word`. */
function composed(
  base: Uint8Array,
  addresses: ReadonlyMap<SlotKey, number>,
  raws: ReadonlyMap<SlotKey, Uint8Array>,
  word: number,
): Uint8Array {
  const flash = base.slice();
  for (const key of BANK_KEYS) {
    const address = addresses.get(key);
    const raw = raws.get(key);
    if (address === undefined || raw === undefined) throw new Error(`no bank ${key} to compose`);
    flash.set(raw.subarray(0, BANK_BYTES), address - FLASH_BASE);
  }
  new DataView(flash.buffer, flash.byteOffset, flash.byteLength).setUint32(CFG_OFFSET, word, true);
  return flash;
}

interface Boot {
  readonly version: string | null;
  readonly state: DeviceState;
}

/** One emulator boot of `flashPath`, read the way the page reads it (readDeviceInfo). */
async function bootRead(
  entryId: string,
  name: string,
  flashPath: string,
  jedec: string | null,
): Promise<Boot> {
  const row = new RowEmulators(`${entryId}#${name}`);
  const emu = await row.start(String(EMU_DIR), {
    entryId: `${entryId}#${name}`,
    readyTimeoutMs: BOOT_TIMEOUT_MS,
    flashOverride: flashPath,
    ...(jedec === null ? {} : { jedec }),
  });
  const adapter = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
  const transport = new WebUsbTransport(adapter, {
    recipient: 'auto',
    api: 'usbip (emulator)',
    host: 'vitest',
    clock: adapter.deadlineClock,
  });
  await transport.open();
  try {
    const device = new SeekDevice(transport, { reporter: silentReporter });
    const firmware = await readRunningFirmware(device);
    const profile = await profileOf(device);
    const state = await readDeviceInfo(
      { device, profile, detection: null, reporter: collectingReporter() },
      { chunk: 4096 },
    );
    return { version: firmware.version, state };
  } finally {
    await transport.close();
    await row.assertDelivery();
  }
}

/** The direct read of one flash and word, in FW-V1's Python machine. */
function directRead(build: Build, flashPath: string, word: number): Direct {
  const python = path.join(String(EMU_DIR), '.venv', 'bin', 'python');
  const out = execFileSync(
    python,
    [
      '-B',
      '-c',
      DIRECT_READ_PY,
      String(EMU_DIR),
      flashPath,
      build.systick.toString(16),
      String(word),
      build.jedec ?? '',
    ],
    { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: BOOT_BUDGET_MS },
  );
  const line = out.trim().split('\n').at(-1) ?? '';
  return JSON.parse(line) as Direct;
}

/** The bootloader's rule (boot_select_image), over which banks accept. Pure. */
function ranBy(word: number, accepts: Readonly<Record<SlotKey, boolean>>): SlotKey {
  if (word === 1) {
    if (accepts.b) return 'b';
    if (accepts.a) return 'a';
    return 'r';
  }
  if (word === 2) {
    if (accepts.r) return 'r';
    if (accepts.a) return 'a';
    return 'b';
  }
  if (accepts.a) return 'a';
  if (accepts.b) return 'b';
  return 'r';
}

const indexOf: Readonly<Record<SlotKey, number>> = { a: 0, b: 1, r: 2 };

interface Row {
  readonly word: number;
  readonly ran: SlotKey | null;
  readonly expectedRan: SlotKey;
  readonly product: number | null;
  readonly direct: Direct;
}

async function runBuild(build: Build, entry: CorpusEntry): Promise<Row[]> {
  /* 1. the stock boot: the flash as it booted (the emulator's fill of erased bytes, saved before serving),
   * every accepted bank read, and its marked copy written through the product write path. */
  const stockPath = scratchFile(`active-slot_${build.version}_stock.bin`);
  const stock = new RowEmulators(`${entry.id}#stock`);
  const emu = await stock.start(String(EMU_DIR), {
    entryId: entry.id,
    fillSeed: FILL_SEED,
    fillScope: FILL_SCOPE,
    readyTimeoutMs: BOOT_TIMEOUT_MS,
    flashOut: stockPath,
    ...(build.jedec === null ? {} : { jedec: build.jedec }),
  });
  const base = new Uint8Array(readFileSync(stockPath));
  expect(base.length, `${build.version}: the saved flash is 4 MiB`).toBe(4 * 1024 * 1024);
  const adapter = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
  const transport = new WebUsbTransport(adapter, {
    recipient: 'auto',
    api: 'usbip (emulator)',
    host: 'vitest',
    clock: adapter.deadlineClock,
  });
  await transport.open();
  const marks = new Map<SlotKey, string>();
  const accepts: Record<SlotKey, boolean> = { a: false, b: false, r: false };
  const addresses = new Map<SlotKey, number>();
  const raws = new Map<SlotKey, Uint8Array>();
  try {
    const device = new SeekDevice(transport, { reporter: silentReporter });
    const firmware = await readRunningFirmware(device);
    expect(firmware.version, `${build.version}: the camera enumerates on its build`).toBe(
      build.version,
    );
    const profile = await profileOf(device);
    const ctx = workflowOf(device, profile);
    let report = await inspectSlots(ctx);
    const stockBuild = report.state.buildString;
    expect(stockBuild, `${build.version}: the camera reports its build string`).not.toBeNull();
    if (stockBuild === null) throw new Error(`${build.version}: no build string`);
    for (const key of BANK_KEYS) {
      const view = viewOf(report, key);
      addresses.set(key, view.entry.address);
      accepts[key] = acceptedOf(report, key);
    }
    for (const key of WRITE_ORDER) {
      if (!accepts[key]) continue;
      report = await inspectSlots(ctx);
      const plain = (await dumpSlot(ctx, report, key)).plain;
      expect(plain, `${build.version}: bank ${key.toUpperCase()} decrypts`).not.toBeNull();
      if (plain === null) throw new Error('no plain image');
      const step = advanced(stockBuild, MARK_STEP[key]);
      expect(step, `${build.version}: the build string has a letter or digit`).not.toBeNull();
      if (step === null) throw new Error('no build string position');
      /* The product stamps the accept sum when it stages a plain image (write.ts stageImage), so the mark is
       * written as the decrypted image with the build string moved on, and nothing else. */
      const bytes = replaced(plain, stockBuild, step.text);
      const plan = prepareSlotFlash(report, key, {
        kind: 'plain',
        bytes,
        fileName: `active-slot-mark-${key}.bin`,
      });
      await flashSlot(ctx, report, plan, { acknowledgeRisk: true, verify: false });
      marks.set(key, step.text);
    }
    report = await inspectSlots(ctx);
    for (const key of BANK_KEYS) {
      raws.set(key, (await dumpSlot(ctx, report, key)).raw);
    }
  } finally {
    await transport.close();
    await stock.finish();
  }
  const rows: Row[] = [];
  for (const word of WORDS) {
    const flashPath = scratchFile(`active-slot_${build.version}_word${String(word)}.bin`);
    writeFileSync(flashPath, composed(base, addresses, raws, word));
    const boot = await bootRead(entry.id, `word${String(word)}`, flashPath, build.jedec);
    const direct = directRead(build, flashPath, word);
    const ran = bankOfBuild(boot.state.buildString, marks);
    rows.push({
      word,
      ran,
      expectedRan: ranBy(word, accepts),
      product: boot.state.activeSlotWord,
      direct,
    });
  }
  return rows;
}

/** The active-slot word in the selector's 64-byte reply: its +8, little-endian. */
function replyWord(direct: Direct): number {
  return Buffer.from(direct.reply, 'hex').readUInt32LE(8);
}

function lineOf(build: Build, row: Row): string {
  const d = row.direct;
  const hex = (value: number) => `0x${value.toString(16).toUpperCase()}`;
  return (
    `[active-slot] ${build.version} word ${String(row.word)}: selector 10 ${String(row.product)} ` +
    `(reply ${hex(replyWord(d))}, record ${d.record ?? 'not found'}, sentinel ${String(d.sentinel_at_reply_plus8)}), ` +
    `cell 0x1000AED0 ${hex(d.cell_1000AED0)}, word 0x10000208 ${hex(d.word_10000208)}, ` +
    `handoff R0 ${d.handoff_r0 ?? 'none'}, runs ${row.ran ?? 'unknown'} (rule ${row.expectedRan})`
  );
}

describe.skipIf(!available)('the active-slot cell and the bank that runs, on the emulator', () => {
  for (const build of BUILDS) {
    it(
      `${build.label}: selector 10 reads ${build.record === null ? 'a zero record' : `the record at ${build.record.toString(16)}`}, and the word ${build.tracksBank ? 'follows' : 'does not follow'} the bank that runs`,
      async () => {
        const entry = corpusEntries().find((e) => e.id.startsWith(build.prefix));
        expect(entry, `the corpus holds ${build.prefix}`).toBeDefined();
        const rows = await runBuild(build, entry!);
        for (const row of rows) {
          process.stdout.write(`${lineOf(build, row)}\n`);
          const d = row.direct;
          /* The product's word is the +8 of the reply the direct boot read (the same RPC, the same flash). */
          expect(row.product, `word ${String(row.word)}: product matches the direct read`).toBe(
            replyWord(d),
          );
          if (build.record !== null) {
            /* The reply is the record the build names (found in RAM by its bytes). */
            expect(d.record, `word ${String(row.word)}: the reply is the record`).toBe(
              `0x${build.record.toString(16)}`,
            );
          } else {
            /* 4.8.2.1: the reply is zero, the record is not found, and the cell 0x1000AED0 reads 0. */
            expect(replyWord(d), `word ${String(row.word)}: the 4.8.2.1 reply is zero`).toBe(0);
            expect(d.cell_1000AED0, `word ${String(row.word)}: cell 0x1000AED0 is zero`).toBe(0);
          }
          expect(
            row.ran,
            `word ${String(row.word)}: the build string names the bank that ran`,
          ).not.toBeNull();
          expect(row.ran, `word ${String(row.word)}: the bank the bootloader enters`).toBe(
            row.expectedRan,
          );
          if (build.tracksBank) {
            expect(row.product, `word ${String(row.word)}: the word is the bank that ran`).toBe(
              indexOf[row.ran!],
            );
          } else {
            expect(row.product, `word ${String(row.word)}: the 4.8.x word is 0`).toBe(0);
          }
        }
      },
      BOOT_BUDGET_MS * 4,
    );
  }
});
