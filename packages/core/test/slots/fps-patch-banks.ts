/* ====================================================================
 * The frame-rate patch on EVERY bank the verdict table offers, on the emulator (TESTING.md 42.36).
 * Shared by the stage-two suite (Key A, fps-patch.stage-two.emulator.test.ts) and the stage-three suite
 * (the 2016 keystream line, fps-patch.pro-2016.emulator.test.ts): one subject per run, in this order.
 *
 * EVERY BANK IS READ WITH dumpSlot, the page's dump: the whole 64 KiB bank as the camera serves it, and its
 * decrypted image. The analysis's own `raw` is shorter (image, pad and footer only), so it is not compared
 * with a whole bank.
 *
 *   0. THE STOCK BOOT. Every bank is read. Its raw bytes are the flash's bytes, and an offered bank's
 *      decrypted image is the table entry's stock image (`patchId`).
 *   1. THE REFUSAL THE TABLE RECORDS. A bank the table does not offer (`fpsNotOffered`) refuses the patch
 *      with the table's reason, and nothing is sent: no SetFeaturedFirmwareData (0x50), no
 *      CompleteMemoryUpgrade (0x51), no ResetDevice (0x59).
 *   2. EACH OFFERED BANK, in the bench's order B, A, R, through the page's path. The analysis is read
 *      again (the page forgets its analysis after every patch), then:
 *        - the offer is the table's rate on the table's entry;
 *        - THE SAVE GATE: a save that does not happen refuses the write, and sends no 0x50 or 0x51;
 *        - patchBankFps saves the bank first, writes the patched image, and reads it back;
 *        - the save is the bank as it was (raw and decrypted), and the written image is the stock image
 *          with the planned bytes and nothing else; the read-back differs from the stock image only at
 *          the planned bytes (the writer's own check, and a fresh read after it);
 *        - a fresh read of the bank is the patched image, decrypted;
 *        - every OTHER bank's raw bytes are exactly what they were before this write.
 *   3. THE PATCHED FLASH, BOOTED. The flash holds every patched bank. It is booted with the boot-config
 *      word as the camera has it (bank A), then with the word set to 1 (prefers bank B) and to 2 (prefers
 *      recovery R), once for each bank written. Bank A is marked for the B and R boots, so the build string
 *      the camera reports names the bank that ran (TESTING.md 42.7's method). A boot must enumerate on the
 *      build, run the bank its word prefers, and find every bank it holds, that is not the marked A, decrypted
 *      to its patched image and planned as "already patched". Every boot is run, and every problem is
 *      reported together, with the camera's boot state (the word, the active slot, and each bank's checks).
 *      THE ACTIVE-SLOT WORD DECIDES NOTHING here: on the 4.8.x line it stays 0 for the B and R boots (the
 *      marked build string shows that B and R ran), so it is only recorded (TESTING.md 42.36).
 *
 * NO FRAME RATE IS MEASURED HERE (the bench does that). Every expectation comes from the verdict table row
 * (e2e/lib/slots-expectations.ts), named by the subject, never from a number written in this file.
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR: the suites that call this check EMU_DIR before they call it.
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { expect } from 'vitest';

import { SLOTS_SUBJECTS, type SlotsSubject } from '../../../../e2e/lib/slots-expectations.js';
import { equalBytes } from '../../src/bytes.js';
import { silentReporter } from '../../src/events.js';
import { setAcceptSum } from '../../src/image/bank.js';
import { identifyFpsImage } from '../../src/preservation/fps-patch.js';
import { detectProfile } from '../../src/profiles/registry.js';
import type { FirmwareProfile, SlotKey } from '../../src/profiles/types.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { WebUsbTransport } from '../../src/protocol/webusb.js';
import { reportedBootedOf } from '../../src/slots/boot-choice.js';
import { dumpSlot } from '../../src/slots/dump.js';
import { inspectSlots } from '../../src/slots/inspect.js';
import {
  fpsPlanOfBank,
  patchBankFps,
  type FpsPatchResult,
  type FpsPreDump,
} from '../../src/slots/fps-patch.js';
import type { SlotsReport } from '../../src/slots/types.js';
import { flashSlot, prepareSlotFlash } from '../../src/slots/write.js';
import {
  evidenceFromChannelProbe,
  probeSelectorChannel,
  readRunningFirmware,
} from '../../src/workflows/capability.js';
import type { WorkflowContext } from '../../src/workflows/types.js';
import { RowEmulators } from '../emulator/harness.js';
import {
  BOOT_TIMEOUT_MS,
  EMU_DIR,
  FILL_SCOPE,
  FILL_SEED,
  scratchFile,
  URB_TIMEOUT_MS,
} from '../emulator/suite.js';
import { recordTransport, type Sent } from './corpus-locked-run.js';

const FLASH_BASE = 0x14000000;
const FLASH_BYTES = 4 * 1024 * 1024;
const BANK_BYTES = 0x10000;
const CFG_ADDRESS = 0x14010000;
/** cfg[0] the bootloader reads as "prefer B, then A, then recovery" (1) and "prefer recovery R" (2). */
const CFG_PREFERS: Readonly<Partial<Record<SlotKey, number>>> = { b: 1, r: 2 };
/** The bench's write order (e2e/lib/bench/spec-flow.ts, WRITE_ORDER): B, then A, then R. */
const WRITE_ORDER: readonly SlotKey[] = ['b', 'a', 'r'];
const BANK_KEYS: readonly SlotKey[] = ['a', 'b', 'r'];

const OP_SET_FEATURED_FIRMWARE_DATA = 0x50;
const OP_COMPLETE_MEMORY_UPGRADE = 0x51;
const OP_RESET_DEVICE = 0x59;

/** One subject of the run: the corpus entry, its boot options, and the verdict-table row it is judged by. */
export interface BankRunSubject {
  /** The subject's label, for the messages. */
  readonly label: string;
  /** The verdict-table row (`name` in e2e/lib/slots-expectations.ts) whose frame-rate expectations apply. */
  readonly row: string;
  /** The build the camera must report. */
  readonly version: string;
  /** The corpus entry the emulator boots. */
  readonly entryId: string;
  /** The donor of an image-only entry (its chimera boot), or null for a full dump. */
  readonly donor: string | null;
  /** The JEDEC id of the emulated flash, or null. */
  readonly jedec: string | null;
  /** The frame-rate table entry (preservation/fps-patch.ts `id`) every offer must name. */
  readonly patchId: string;
  /** The staging the writer must choose on this line. */
  readonly staging: 'key-a-ciphertext' | 'slot-keystream-ciphertext';
}

const sha = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

/**
 * The running build string with its last letter or digit moved one on, in the image (same length), and the
 * string it became. The accept suite's method (TESTING.md 42.7): a boot that runs a marked bank reports the
 * marked string, so the build string names the bank that ran. Null when the string is not in the image.
 */
function marked(
  image: Uint8Array,
  text: string,
): { readonly image: Uint8Array; readonly to: string } | null {
  let at = -1;
  for (let i = text.length - 1; i >= 0; i--) {
    if (/[A-Za-z0-9]/.test(text.charAt(i))) {
      at = i;
      break;
    }
  }
  if (at < 0) return null;
  const c = text.charAt(at);
  const next =
    c === '9' ? '0' : c === 'Z' ? 'A' : c === 'z' ? 'a' : String.fromCharCode(c.charCodeAt(0) + 1);
  const needle = Uint8Array.from(text, (ch) => ch.charCodeAt(0));
  const out = image.slice();
  let hits = 0;
  for (let i = 0; i + needle.length <= out.length; i++) {
    if (needle.every((byte, j) => out[i + j] === byte)) {
      out[i + at] = next.charCodeAt(0);
      hits++;
      i += needle.length - 1;
    }
  }
  if (hits === 0) return null;
  return { image: out, to: `${text.slice(0, at)}${next}${text.slice(at + 1)}` };
}

function safeName(text: string): string {
  return text.replace(/[^\w.-]+/g, '_');
}

/** One line per fact the run measured, for the record of the run (SEEK_EMU_FPS_DIAG=0 silences it). */
function diagnose(name: string, text: string): void {
  if (process.env.SEEK_EMU_FPS_DIAG === '0') return;
  process.stdout.write(`[fps-banks] ${name}: ${text}\n`);
}

/** The verdict-table row with this name, or a throw naming the missing row. */
export function tableRowNamed(name: string): SlotsSubject {
  const row = SLOTS_SUBJECTS.find((candidate) => candidate.name === name);
  if (row === undefined) throw new Error(`the verdict table has no row named "${name}"`);
  return row;
}

/** The emulator's boot options for the subject: its donor (an image-only entry) and its JEDEC id, each when set. */
function bootOptionsOf(subject: BankRunSubject): { donor?: string; jedec?: string } {
  return {
    ...(subject.donor === null ? {} : { donor: subject.donor }),
    ...(subject.jedec === null ? {} : { jedec: subject.jedec }),
  };
}

function workflowOf(device: SeekDevice, profile: FirmwareProfile): WorkflowContext {
  return { device, profile, detection: null, reporter: silentReporter };
}

function opsAfter(sent: readonly Sent[], from: number): number[] {
  return sent.slice(from).map((entry) => entry.op);
}

function viewOf(report: SlotsReport, key: SlotKey) {
  const view = report.slots.find((candidate) => candidate.entry.key === key);
  if (view === undefined) throw new Error(`the plan has no bank ${key.toUpperCase()}`);
  return view;
}

function plainOf(report: SlotsReport, key: SlotKey): Uint8Array | null {
  return viewOf(report, key).state?.plain ?? null;
}

/** A bank as the page's dump reads it: the whole bank as the camera serves it, and its decrypted image. */
async function readBank(
  ctx: WorkflowContext,
  report: SlotsReport,
  key: SlotKey,
): Promise<{ readonly raw: Uint8Array; readonly plain: Uint8Array | null }> {
  const dumped = await dumpSlot(ctx, report, key);
  return { raw: dumped.raw, plain: dumped.plain };
}

async function profileOf(device: SeekDevice): Promise<FirmwareProfile> {
  return detectProfile(evidenceFromChannelProbe(await probeSelectorChannel(device))).best.profile;
}

/**
 * The flash the emulator boots: the stock part with each bank's whole raw bytes replaced, and the boot-config
 * word set to `cfg` when given (null keeps the stock word).
 */
function composedFlash(
  truth: Uint8Array,
  addresses: ReadonlyMap<SlotKey, number>,
  raws: ReadonlyMap<SlotKey, Uint8Array>,
  cfg: number | null,
): Uint8Array {
  const flash = truth.slice();
  for (const key of BANK_KEYS) {
    const address = addresses.get(key);
    const raw = raws.get(key);
    if (address === undefined || raw === undefined) {
      throw new Error(`no bank ${key.toUpperCase()} to compose the flash from`);
    }
    flash.set(raw.subarray(0, BANK_BYTES), address - FLASH_BASE);
  }
  if (cfg !== null) {
    new DataView(flash.buffer, flash.byteOffset, flash.byteLength).setUint32(
      CFG_ADDRESS - FLASH_BASE,
      cfg,
      true,
    );
  }
  return flash;
}

/** What one boot of a patched flash reported: the build, and the camera's analysis after it booted. */
interface BootOutcome {
  readonly version: string | null;
  readonly report: SlotsReport;
}

/** Boots `flash` (an emulator of its own, stopped before this returns) and reads what the page reads. */
async function bootFlash(
  subject: BankRunSubject,
  name: string,
  flash: Uint8Array,
  rows: RowEmulators[],
): Promise<BootOutcome> {
  const path = scratchFile(`fps-banks_${safeName(subject.label)}_${name}.bin`);
  writeFileSync(path, flash);
  const row = new RowEmulators(`${subject.entryId}#${name}`);
  rows.push(row);
  const emu = await row.start(String(EMU_DIR), {
    entryId: `${subject.entryId}#${name}`,
    readyTimeoutMs: BOOT_TIMEOUT_MS,
    flashOverride: path,
    flashOut: scratchFile(`fps-banks_${safeName(subject.label)}_${name}_booted.bin`),
    ...bootOptionsOf(subject),
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
    const report = await inspectSlots(workflowOf(device, await profileOf(device)));
    return { version: firmware.version, report };
  } finally {
    await transport.close();
    await emu.stop();
  }
}

/**
 * What the camera reports about its boot choice, for a failure message: the boot-config word, the active-slot
 * word, the prediction, and each bank's checks as the analysis reads them.
 */
function bootDiagnosis(report: SlotsReport): string {
  const word =
    report.state.cfg0 === null ? 'unread' : `0x${report.state.cfg0.toString(16).toUpperCase()}`;
  const active =
    report.state.activeSlotWord === null ? 'unread' : String(report.state.activeSlotWord);
  const banks = BANK_KEYS.map((key) => {
    const state = viewOf(report, key).state;
    if (state === null) return `${key.toUpperCase()} unread`;
    return (
      `${key.toUpperCase()} accepts=${String(state.accepts)} footerOk=${String(state.footerOk)} ` +
      `bootable=${String(state.bootable)} bootability=${state.bootability}`
    );
  }).join('; ');
  const prediction = JSON.stringify(report.state.boot).slice(0, 300);
  return `cfg0 ${word}, active-slot word ${active}, prediction ${prediction}; ${banks}`;
}

/** Runs the steps above for one subject. Throws (through `expect`) at the first wrong fact of a write. */
export async function runBankFlow(subject: BankRunSubject): Promise<void> {
  const row = tableRowNamed(subject.row);
  expect(row.version, `${subject.label}: the table row's build`).toBe(subject.version);
  if (!row.fps.offer) throw new Error(`${subject.label}: the table row does not offer the patch`);
  const top = row.fps.toHz;
  const refused = row.fpsNotOffered ?? null;
  const offered = WRITE_ORDER.filter((key) => key !== refused?.bank);
  const label = subject.label;

  const stock = new RowEmulators(subject.entryId);
  const bootRows: RowEmulators[] = [];
  let transport: WebUsbTransport | null = null;
  try {
    /* 0. the stock boot: the flash is saved as it booted, and every bank is read. */
    const truthPath = scratchFile(`fps-banks_${safeName(label)}_stock.bin`);
    const emu = await stock.start(String(EMU_DIR), {
      entryId: subject.entryId,
      fillSeed: FILL_SEED,
      fillScope: FILL_SCOPE,
      readyTimeoutMs: BOOT_TIMEOUT_MS,
      flashOut: truthPath,
      ...bootOptionsOf(subject),
    });
    const truth = new Uint8Array(readFileSync(truthPath));
    expect(truth.length, `${label}: the saved flash is 4 MiB`).toBe(FLASH_BYTES);

    const adapter = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
    transport = new WebUsbTransport(adapter, {
      recipient: 'auto',
      api: 'usbip (emulator)',
      host: 'vitest',
      clock: adapter.deadlineClock,
    });
    const sent: Sent[] = [];
    recordTransport(transport, sent);
    await transport.open();
    const device = new SeekDevice(transport, { reporter: silentReporter });
    const profile = await profileOf(device);
    const firmware = await readRunningFirmware(device);
    expect(firmware.version, `${label}: the camera enumerates on its build`).toBe(subject.version);
    const ctx = workflowOf(device, profile);
    let report = await inspectSlots(ctx);

    const addresses = new Map<SlotKey, number>();
    const expectedRaw = new Map<SlotKey, Uint8Array>();
    const stockPlain = new Map<SlotKey, Uint8Array>();
    for (const key of BANK_KEYS) {
      const bank = key.toUpperCase();
      const view = viewOf(report, key);
      addresses.set(key, view.entry.address);
      const read = await readBank(ctx, report, key);
      const offset = view.entry.address - FLASH_BASE;
      expect(read.raw.length, `${label}: bank ${bank} is read whole`).toBe(BANK_BYTES);
      expect(
        equalBytes(read.raw, truth.subarray(offset, offset + BANK_BYTES)),
        `${label}: bank ${bank} is the flash's bank`,
      ).toBe(true);
      expectedRaw.set(key, read.raw);
      if (read.plain !== null) stockPlain.set(key, read.plain);
      if (offered.includes(key)) {
        expect(read.plain, `${label}: bank ${bank} decrypts to an image`).not.toBeNull();
        expect(
          identifyFpsImage(read.plain ?? new Uint8Array()).stockEntries.map((hit) => hit.id),
          `${label}: bank ${bank} holds the table entry's stock image`,
        ).toContain(subject.patchId);
      }
    }

    /* 1. the bank the table does not offer refuses, with the table's reason, and nothing is sent. */
    if (refused !== null) {
      const key: SlotKey = refused.bank;
      const bank = key.toUpperCase();
      const plan = fpsPlanOfBank(report, key);
      const planReason = plan.status === 'offer' ? 'OFFERED' : plan.reason;
      expect(
        planReason,
        `${label}: bank ${bank} is not offered, with the table's reason`,
      ).toContain(refused.reason);
      const from = sent.length;
      let saves = 0;
      await expect(
        patchBankFps(ctx, report, key, {
          acknowledgeRisk: true,
          saveDump: () => {
            saves += 1;
            return Promise.resolve(true);
          },
        }),
      ).rejects.toThrow(refused.reason);
      expect(saves, `${label}: bank ${bank} is not saved when it is refused`).toBe(0);
      const ops = opsAfter(sent, from);
      expect(ops, `${label}: nothing is written to bank ${bank}`).not.toContain(
        OP_SET_FEATURED_FIRMWARE_DATA,
      );
      expect(ops).not.toContain(OP_COMPLETE_MEMORY_UPGRADE);
      expect(ops).not.toContain(OP_RESET_DEVICE);
      diagnose(label, `bank ${bank} refused: ${planReason}`);
    }

    /* 2. each offered bank, through the page's path. */
    const patched = new Map<SlotKey, Uint8Array>();
    for (const key of offered) {
      const bank = key.toUpperCase();
      report = await inspectSlots(ctx);
      const offer = fpsPlanOfBank(report, key);
      if (offer.status !== 'offer') {
        throw new Error(`${label}: bank ${bank} is not offered: ${offer.reason}`);
      }
      expect(offer.patch.id, `${label}: bank ${bank} offers the table entry`).toBe(subject.patchId);
      expect(offer.toHz, `${label}: bank ${bank} is offered at the table's rate`).toBe(top);

      /* the save gate: a save that does not happen refuses the write. */
      const gateFrom = sent.length;
      await expect(
        patchBankFps(ctx, report, key, {
          acknowledgeRisk: true,
          saveDump: () => Promise.resolve(false),
        }),
      ).rejects.toThrow(/was not saved/);
      const gateOps = opsAfter(sent, gateFrom);
      expect(gateOps, `${label}: bank ${bank}, an unsaved patch sends no 0x50`).not.toContain(
        OP_SET_FEATURED_FIRMWARE_DATA,
      );
      expect(gateOps).not.toContain(OP_COMPLETE_MEMORY_UPGRADE);

      /* the patch, with the pre-patch save first. */
      const saved: FpsPreDump[] = [];
      const beforePatch = sent.length;
      const result: FpsPatchResult = await patchBankFps(ctx, report, key, {
        acknowledgeRisk: true,
        saveDump: (dump) => {
          saved.push(dump);
          return Promise.resolve(true);
        },
      });
      expect(saved, `${label}: bank ${bank} is saved once`).toHaveLength(1);
      const pre = saved[0];
      if (pre === undefined) throw new Error(`${label}: bank ${bank} was not saved`);
      expect(pre.key).toBe(key);
      expect(pre.version).toBe(subject.version);
      expect(pre.raw, `${label}: bank ${bank} is saved as it was`).toEqual(expectedRaw.get(key));
      const stockImage = stockPlain.get(key);
      expect(stockImage, `${label}: bank ${bank} has a stock image`).toBeDefined();
      expect(sha(pre.plain), `${label}: bank ${bank} is saved decrypted as it was`).toBe(
        sha(stockImage ?? new Uint8Array()),
      );
      expect(pre.rawName).toMatch(
        new RegExp(
          `^seek-slot-${bank}-v${subject.version.replace(/\./g, '\\.')}-before-fps-patch-raw-`,
        ),
      );
      expect(pre.plainName).toMatch(/-decrypted-/);
      expect(result.plan.staging, `${label}: bank ${bank} is staged as the line stages it`).toBe(
        subject.staging,
      );
      expect(result.patch.id).toBe(subject.patchId);
      expect(result.toHz).toBe(top);
      expect(result.written.commitStatus, `${label}: bank ${bank} commit status`).toBe(0);
      expect(result.written.verified, `${label}: bank ${bank} verified`).toBe(true);
      expect(result.readBack.checked).toBe(true);
      expect(result.readBack.ok, `${label}: bank ${bank} ${JSON.stringify(result.readBack)}`).toBe(
        true,
      );
      expect(result.readBack.differing).toEqual(result.changed);
      expect(result.readBack.missing).toEqual([]);
      expect(result.readBack.unexpected).toEqual([]);
      const differs: number[] = [];
      for (let o = 0; o < pre.plain.length; o++) {
        if (pre.plain[o] !== result.patched[o]) differs.push(o);
      }
      expect(differs, `${label}: bank ${bank} changes only the planned bytes`).toEqual(
        result.changed,
      );
      const writeOps = opsAfter(sent, beforePatch);
      expect(writeOps).toContain(OP_SET_FEATURED_FIRMWARE_DATA);
      expect(writeOps).toContain(OP_COMPLETE_MEMORY_UPGRADE);
      expect(writeOps).not.toContain(OP_RESET_DEVICE);

      /* the read-back: a fresh analysis, the bank read whole and decrypted, and the other banks' raw bytes. */
      const after = await inspectSlots(ctx);
      const afterRead = await readBank(ctx, after, key);
      expect(afterRead.raw.length, `${label}: bank ${bank} is read back whole`).toBe(BANK_BYTES);
      if (result.written.after !== null) {
        expect(
          equalBytes(
            result.written.after.subarray(0, BANK_BYTES),
            afterRead.raw.subarray(0, BANK_BYTES),
          ),
          `${label}: bank ${bank}, the writer's read-back is the fresh read`,
        ).toBe(true);
      }
      expect(afterRead.plain, `${label}: bank ${bank} decrypts after the write`).not.toBeNull();
      expect(
        sha(afterRead.plain ?? new Uint8Array()),
        `${label}: bank ${bank} decrypts to the patched image`,
      ).toBe(sha(result.patched));
      expect(fpsPlanOfBank(after, key).status, `${label}: bank ${bank} is patched`).toBe('patched');
      for (const other of BANK_KEYS) {
        if (other === key) continue;
        const otherRead = await readBank(ctx, after, other);
        const before = expectedRaw.get(other);
        expect(
          before !== undefined && equalBytes(otherRead.raw, before),
          `${label}: bank ${other.toUpperCase()} is unchanged by the write to bank ${bank}`,
        ).toBe(true);
      }
      expectedRaw.set(key, afterRead.raw);
      patched.set(key, result.patched);
      diagnose(
        label,
        `bank ${bank} written at ${String(top)} Hz, read back decrypted, the others unchanged`,
      );
      report = after;
    }

    /* 3. the patched flash, booted. Which bank ran is read from the build string the camera reports after the
     * boot. For the boots that must run B or R, bank A is marked first (its build string's last character moved
     * on, the sum fixed): a boot that runs A then reports the marked string, and a boot that runs the bank the
     * word prefers reports the running string. The B and R images are the patched ones, unmarked. The
     * active-slot word is recorded in the diagnostic line and decides nothing. */
    report = await inspectSlots(ctx);
    const runningBuild = report.state.buildString;
    expect(runningBuild, `${label}: the camera reports its build string`).not.toBeNull();
    if (runningBuild === null) throw new Error(`${label}: no build string`);
    const aPlain = (await readBank(ctx, report, 'a')).plain ?? new Uint8Array();
    const mark = marked(aPlain, runningBuild);
    expect(mark, `${label}: the build string is in bank A's image`).not.toBeNull();
    if (mark === null) throw new Error(`${label}: the build string is not in bank A`);
    const markedPlan = prepareSlotFlash(report, 'a', {
      kind: 'plain',
      bytes: setAcceptSum(mark.image, report.state.profile.cipher).image,
      fileName: 'marked-a.bin',
    });
    await flashSlot(ctx, report, markedPlan, { acknowledgeRisk: true, verify: false });
    const markedRaw = (await readBank(ctx, await inspectSlots(ctx), 'a')).raw;
    await transport.close();
    transport = null;
    await emu.stop();
    const withMarkedA = new Map(expectedRaw);
    withMarkedA.set('a', markedRaw);
    const boots: {
      readonly name: string;
      readonly cfg: number;
      readonly raws: ReadonlyMap<SlotKey, Uint8Array>;
      readonly key: SlotKey;
    }[] = [
      { name: 'boot-a', cfg: 0, raws: expectedRaw, key: 'a' },
      ...offered
        .filter((key) => CFG_PREFERS[key] !== undefined)
        .map((key) => ({
          name: `boot-${key}`,
          cfg: CFG_PREFERS[key] ?? 0,
          raws: withMarkedA,
          key,
        })),
    ];
    const bootProblems: string[] = [];
    for (const boot of boots) {
      const flash = composedFlash(truth, addresses, boot.raws, boot.cfg);
      const outcome = await bootFlash(subject, boot.name, flash, bootRows);
      const build = outcome.report.state.buildString;
      const activeWord = reportedBootedOf(outcome.report.state.activeSlotWord);
      const why = bootDiagnosis(outcome.report);
      diagnose(
        label,
        `${boot.name} (word ${String(boot.cfg)}): build string "${String(build)}" ` +
          `(running "${runningBuild}", marked "${mark.to}"), active-slot word says ${activeWord ?? 'none'}; ${why}`,
      );
      if (outcome.version !== subject.version) {
        bootProblems.push(
          `${boot.name}: enumerates ${String(outcome.version)}, not ${subject.version}`,
        );
      }
      if (build !== runningBuild) {
        bootProblems.push(
          `${boot.name}: the camera reports build string "${String(build)}", not "${runningBuild}" ` +
            `(${build === mark.to ? `marked bank A ran, so bank ${boot.key.toUpperCase()} did not boot` : 'an unexpected build string'}; ${why})`,
        );
      }
      for (const [key, image] of patched) {
        /* in the B and R boots bank A holds the marked image, not its patched one */
        if (key === 'a' && boot.key !== 'a') continue;
        const plain = plainOf(outcome.report, key);
        if (plain === null || sha(plain) !== sha(image)) {
          bootProblems.push(
            `${boot.name}: bank ${key.toUpperCase()} does not decrypt to its patched image`,
          );
        }
        const status = fpsPlanOfBank(outcome.report, key).status;
        if (status !== 'patched') {
          bootProblems.push(
            `${boot.name}: bank ${key.toUpperCase()} is planned as ${status}, not patched`,
          );
        }
      }
    }
    expect(bootProblems, `${label}: the patched flash boots as its boot-config word says`).toEqual(
      [],
    );
  } finally {
    if (transport !== null) await transport.close();
    await stock.finish();
    for (const bootRow of bootRows) await bootRow.finish();
  }
}
