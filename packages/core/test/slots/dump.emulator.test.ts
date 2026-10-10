/* ====================================================================
 * The slot reader against the emulator: `inspectSlots` and `dumpSlot` on one
 * firmware at a time, every bank compared with the emulator's own flash.
 *
 * WHAT IS PROVEN, PER FIRMWARE. The plan `inspectSlots` builds (the capability
 * matrix, `buildSlotPlan`) puts each bank at the address its family's selector
 * table uses, and `dumpSlot` returns the bank byte for byte as the emulated
 * camera holds it there (the emulator writes its as-booted 4 MiB image with
 * `--flash-out` before a client can read a byte of it). Where the plain image
 * decrypts, it is the image the corpus pins: a full dump's per-slot entry, or an
 * image-only entry's own vendored file, of which the plain image is the prefix.
 *
 * WHAT IS PROVEN ABOUT WRITES. The reader never sends one. A recording
 * transport holds every request this run makes to the opcodes the read path is
 * allowed: `dumpSlot`'s to `READ_ONLY_OPS`, exactly; `inspectSlots`' to
 * `READ_ONLY_OPS` plus the two info-selector setters `readDeviceInfo` already
 * sends (see INFO_SELECTORS). Neither may ever carry a flash-write opcode.
 *
 * AND THE REFUSALS, ON THE EMULATOR. A build older than 0.8.0.0 is refused
 * after the version read, having sent nothing else (REFUSED_TARGETS).
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR, like every emulator suite (suite.ts).
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { SeekError } from '../../src/errors.js';
import { silentReporter } from '../../src/events.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { WebUsbTransport } from '../../src/protocol/webusb.js';
import { isReadOnlyOp, OP, SAFE_BEFORE_IDENTITY } from '../../src/protocol/ops.js';
import { detectProfile, getProfile } from '../../src/profiles/registry.js';
import type { FirmwareProfile } from '../../src/profiles/types.js';
import { classifyBuild } from '../../src/slots/capability-family.js';
import { dumpSlot } from '../../src/slots/dump.js';
import { inspectSlots } from '../../src/slots/inspect.js';
import type { DumpedSlot, SlotKey, SlotsReport } from '../../src/slots/types.js';
import { evidenceFromChannelProbe, probeSelectorChannel } from '../../src/workflows/capability.js';
import type { WorkflowContext } from '../../src/workflows/types.js';
import { liveEmulatorCount, RowEmulators, type ManifestEntry } from '../emulator/harness.js';
import { assertRealHostPath } from '../emulator/webusb-over-usbip.js';
import {
  announceSkip,
  BOOT_TIMEOUT_MS,
  EMU_DIR,
  ENTRIES,
  FILL_SCOPE,
  FILL_SEED,
  loadExpectations,
  ROUNDTRIP_EXPECTATIONS,
  scratchFile,
  URB_TIMEOUT_MS,
} from '../emulator/suite.js';
import corpusExpectations from '../corpus/expectations.json' with { type: 'json' };

const FLASH_BASE = 0x14000000;
const FLASH_SIZE = 4 * 1024 * 1024;
const BANK_BYTES = 0x10000;
const TIMEOUT_MS = Number(process.env.SEEK_EMU_SLOTS_TIMEOUT_MS ?? '900000');

/**
 * The bank addresses each profile's selector table arms, as the plan must report
 * them. Stated here independently of the plan, so the plan is checked against the
 * firmware's layout rather than against itself.
 *
 * The two lines do NOT share a layout. The locked 0.x/1.x line has banks A, B, R at
 * 0x14050000, 0x14060000 and 0x14070000. The modern 2.x/4.x line has them at
 * 0x14030000, 0x14050000 and 0x14070000, and no selector reaches 0x14060000 on it.
 */
const BANK_LAYOUT: Readonly<Record<string, Readonly<Record<SlotKey, number>>>> = {
  'modern-4x': { a: 0x14030000, b: 0x14050000, r: 0x14070000 },
  'legacy-auth': { a: 0x14050000, b: 0x14060000, r: 0x14070000 },
};

/**
 * The two info selectors `readDeviceInfo` sends. The codebase files them in
 * FLASH_OPS ("info reads that only the flash path needs"), but they only choose
 * which block GetFirmwareInfo returns and change no flash. They are the one
 * allowance beyond READ_ONLY_OPS, named here rather than hidden by widening
 * READ_ONLY_OPS.
 */
const INFO_SELECTORS: ReadonlySet<number> = new Set([
  OP.SET_FIRMWARE_INFO_FEATURES,
  OP.SET_RAM_DATA_FEATURES,
]);
/** The flash-write opcodes. Nothing in this file may ever see one. */
const FLASH_WRITES: ReadonlySet<number> = new Set([
  OP.SET_FEATURED_FIRMWARE_DATA,
  OP.COMPLETE_MEMORY_UPGRADE,
]);

/* ---- which firmwares ---------------------------------------------------
 *
 * Selected by prefix of the manifest's own ids, so each line names the firmware
 * it selects. `_trimmed` siblings are the same image with its tail cut. */
interface Target {
  readonly label: string;
  readonly prefix: string;
  readonly kind: ManifestEntry['kind'];
}

const TARGETS: readonly Target[] = [
  {
    label: 'Compact 4.8.1.9 (modern 4.x)',
    prefix: 'compact/2018.10.11-16.36.37-4.8.1.9/',
    kind: 'image-only',
  },
  {
    label: 'Compact 4.8.2.1 (modern 4.x)',
    prefix: 'compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/',
    kind: 'full-dump',
  },
  {
    label: 'Compact PRO 4.9.2.0',
    prefix: 'compact_pro/2020.02.13-15.26.01-4.9.2.0/1215A0YZ9AA8/',
    kind: 'full-dump',
  },
  {
    label: 'Compact PRO 1.0.3.0 (2016 locked)',
    prefix: 'compact_pro/2016.07.06-17.04.49-1.0.3.0/0C21A1M5KP15/',
    kind: 'full-dump',
  },
  {
    label: 'Compact 1.3.0.0 (2014 plain chain)',
    prefix: 'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/',
    kind: 'full-dump',
  },
  {
    label: 'Compact 1.3.0.8',
    prefix: 'compact/2017.01.06-11.16.17-1.3.0.8/',
    kind: 'image-only',
  },
  {
    label: 'Compact 1.3.0.8-FF',
    prefix: 'compact/2017.01.06-11.17.29-1.3.0.8-FF/',
    kind: 'image-only',
  },
  {
    label: 'Mosaic 10.9.1.31',
    prefix: 'mosaic/2019.11.19-09.59.21-10.9.1.31/no-serial/dump',
    kind: 'full-dump',
  },
  {
    label: 'Nano 300 44.27.3.10',
    prefix: 'nano_300/2024.11.21-11.55.00-44.27.3.10/1713A171RJB9/dump',
    kind: 'full-dump',
  },
  {
    label: 'Compact XR 4.8.2.1',
    prefix: 'compact_xr/2020.02.26-11.23.26-4.8.2.1/1F1660P7U967/dump',
    kind: 'full-dump',
  },
];

/**
 * Builds the reader must REFUSE, after the version read and nothing else. 0.3.0.1
 * is the one that matters most: on that build wire id 0x52, the arm, is
 * EnterBootloaderMode, so a reader that armed it would reboot the camera.
 */
const REFUSED_TARGETS: readonly Target[] = [
  {
    label: 'Compact 0.3.0.1 (out of scope: 0x52 is EnterBootloaderMode there)',
    prefix: 'compact/2014.05.03-10.42.49-0.3.0.1/',
    kind: 'image-only',
  },
  {
    label: 'Compact 0.7.0.7 (out of scope: no read handler)',
    prefix: 'compact/2014.09.04-14.15.36-0.7.0.7/',
    kind: 'image-only',
  },
];

/** The manifest's own fields this file reads, beyond the ones the harness types. */
type ManifestFile = ManifestEntry & { readonly vendored_path?: string };

function pick(target: Target): ManifestFile | null {
  return (
    ENTRIES.find(
      (entry) =>
        entry.kind === target.kind &&
        entry.id.startsWith(target.prefix) &&
        !entry.id.endsWith('_trimmed'),
    ) ?? null
  );
}

if (EMU_DIR === null) announceSkip('the slot reader against the emulator');

const roundtrip = loadExpectations<{ readonly decryptedSha256: readonly string[] }>(
  ROUNDTRIP_EXPECTATIONS,
);

/* ---- expectations already on disk ---------------------------------------- */

interface CorpusSlot {
  readonly flash: string;
  readonly length: number;
  readonly plainSha256: string;
}
const corpusDumps = (
  corpusExpectations as { readonly dumps: Record<string, { readonly slots: CorpusSlot[] }> }
).dumps;

/** The corpus's pinned facts for the bank at `address`, when the corpus has this dump. */
function corpusSlot(entry: ManifestEntry, address: number): CorpusSlot | null {
  return corpusDumps[entry.sha256]?.slots.find((s) => Number(s.flash) === address) ?? null;
}

/* ---- helpers ---------------------------------------------------------------- */

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
const hex8 = (n: number): string => `0x${n.toString(16).toUpperCase().padStart(8, '0')}`;
const opName = (op: number): string => `0x${op.toString(16).toUpperCase().padStart(2, '0')}`;

/** Where two equal-length slices differ, as one line for a failure message. */
function describeDiff(want: Uint8Array, got: Uint8Array): string {
  let count = 0;
  let first = -1;
  for (let i = 0; i < want.length; i++) {
    if (want[i] !== got[i]) {
      count++;
      if (first < 0) first = i;
    }
  }
  return count === 0 ? 'identical' : `${String(count)} byte(s) differ, first at +${hex8(first)}`;
}

/** One request the camera received, as the recording transport saw it. */
interface Sent {
  readonly direction: 'in' | 'out';
  readonly op: number;
}

/** What one firmware did, for the summary the run ends with. */
interface Outcome {
  readonly label: string;
  readonly id: string;
  status: 'works' | 'refused' | 'fails';
  readonly lines: string[];
}
const outcomes: Outcome[] = [];

/**
 * A transport that writes every request it sends into `sent`, in order.
 *
 * It wraps the instance's own methods, so every path the reader takes is seen,
 * including the transport reopens a retry makes.
 */
function recording(transport: WebUsbTransport, sent: Sent[]): void {
  const controlIn = transport.controlIn.bind(transport);
  transport.controlIn = (request, length, timeoutMs) => {
    sent.push({ direction: 'in', op: request });
    return controlIn(request, length, timeoutMs);
  };
  const controlOut = transport.controlOut.bind(transport);
  transport.controlOut = (request, data, timeoutMs) => {
    sent.push({ direction: 'out', op: request });
    return controlOut(request, data, timeoutMs);
  };
}

/** Opens `entryId` on the emulator, with a recording transport, and hands the work the device. */
async function withCamera<T>(
  row: RowEmulators,
  entryId: string,
  sent: Sent[],
  flashOut: string | undefined,
  work: (seek: SeekDevice) => Promise<T>,
): Promise<T> {
  const emu = await row.start(EMU_DIR!, {
    entryId,
    fillSeed: FILL_SEED,
    fillScope: FILL_SCOPE,
    ...(flashOut === undefined ? {} : { flashOut }),
    readyTimeoutMs: BOOT_TIMEOUT_MS,
  });
  return row.guard(emu, async () => {
    const device = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
    const transport = new WebUsbTransport(device, {
      recipient: 'auto',
      api: 'usbip (emulator)',
      host: 'vitest',
      clock: device.deadlineClock,
    });
    recording(transport, sent);
    await transport.open();
    assertRealHostPath(device, transport.info, `${entryId}: first open()`);
    try {
      return await work(new SeekDevice(transport, { reporter: silentReporter }));
    } finally {
      await transport.close();
    }
  });
}

/** The profile the camera's own selector answers choose, as the CLI chooses it. */
async function probedProfile(seek: SeekDevice): Promise<FirmwareProfile> {
  return detectProfile(evidenceFromChannelProbe(await probeSelectorChannel(seek))).best.profile;
}

/* ---- the suite ---------------------------------------------------------------- */

describe.skipIf(EMU_DIR === null)('the slot reader against the emulator', () => {
  afterAll(() => {
    const leaked = liveEmulatorCount();
    if (leaked > 0) throw new Error(`${String(leaked)} emulator process(es) still running`);
    if (outcomes.length === 0) return;
    const out = ['', '--- slot reader, per firmware (emulator) ---'];
    for (const o of outcomes) {
      out.push(`${o.status.toUpperCase().padEnd(7)} ${o.label}  [${o.id.slice(0, 64)}]`);
      for (const line of o.lines) out.push(`          ${line}`);
    }
    out.push('');
    process.stderr.write(out.join('\n'));
  });

  for (const target of TARGETS) {
    const entry = pick(target);

    it.skipIf(entry === null)(
      `${target.label}: identifies the banks, and dumps each one byte for byte`,
      { timeout: TIMEOUT_MS },
      async () => {
        if (entry === null) return;
        const outcome: Outcome = { label: target.label, id: entry.id, status: 'fails', lines: [] };
        outcomes.push(outcome);
        const row = new RowEmulators(entry.id);
        try {
          const truthPath = scratchFile(`slots_${entry.id.replace(/[^\w.-]+/g, '_')}.bin`);
          const sent: Sent[] = [];
          let inspectEnd = 0;
          let report: SlotsReport | null = null;
          let family = 'unknown';
          const banks: Array<{ key: SlotKey; dumped: DumpedSlot | null; refusal: string | null }> =
            [];

          await withCamera(row, entry.id, sent, truthPath, async (seek) => {
            const profile = await probedProfile(seek);
            const ctx: WorkflowContext = {
              device: seek,
              profile,
              detection: null,
              reporter: silentReporter,
            };

            /* The real capability matrix, by default: no plan is injected. */
            const inspected = await inspectSlots(ctx);
            report = inspected;
            inspectEnd = sent.length;
            family = classifyBuild(profile, inspected.state.version).family;

            for (const slot of inspected.plan.slots) {
              try {
                const dumped = await dumpSlot(ctx, inspected, slot.key);
                banks.push({ key: slot.key, dumped, refusal: null });
              } catch (error) {
                if (!(error instanceof SeekError) || error.code !== 'slots/refused') throw error;
                banks.push({ key: slot.key, dumped: null, refusal: error.message });
              }
            }
          });
          await row.assertDelivery();

          const truth = new Uint8Array(readFileSync(truthPath));
          expect(truth.length, 'the emulator wrote its 4 MiB as-booted image').toBe(FLASH_SIZE);
          if (report === null) throw new Error('the reader produced no report');
          const done: SlotsReport = report;
          const plan = done.plan;

          /* ---- THE READ-ONLY GUARANTEE ----------------------------------- */
          const inspectSent = sent.slice(0, inspectEnd);
          const dumpSent = sent.slice(inspectEnd);
          expect(
            sent.filter((s) => FLASH_WRITES.has(s.op)),
            'flash-write opcodes received by the camera',
          ).toEqual([]);
          for (const s of inspectSent) {
            expect(
              isReadOnlyOp(s.op) || INFO_SELECTORS.has(s.op),
              `inspect sent ${opName(s.op)}, which is neither read-only nor an info selector`,
            ).toBe(true);
          }
          for (const s of dumpSent) {
            expect(isReadOnlyOp(s.op), `dump sent ${opName(s.op)}`).toBe(true);
          }

          /* ---- THE PLAN'S BANK ADDRESSES, PER FAMILY ----------------------- */
          const layout = BANK_LAYOUT[plan.profileId];
          expect(layout, `a bank layout is known for profile ${plan.profileId}`).toBeDefined();
          if (layout === undefined) return;
          expect(plan.supportedBuild.supported, 'the plan supports this build').toBe(true);
          for (const slot of plan.slots) {
            expect(slot.address, `plan address of slot ${slot.key}`).toBe(layout[slot.key]);
            if (slot.read !== null) {
              expect(slot.read.address, `read window of slot ${slot.key} arms its own bank`).toBe(
                slot.address,
              );
            }
          }
          const infoSetters = inspectSent.filter((s) => INFO_SELECTORS.has(s.op)).length;
          const addresses = plan.slots
            .map((slot) => `${slot.key.toUpperCase()} ${hex8(slot.address)}`)
            .join(', ');
          outcome.lines.push(
            `build ${done.state.version ?? 'unknown'} (${family}), profile ${plan.profileId}, ` +
              `banks ${addresses}, booted ${done.state.boot?.booted ?? 'unknown'}; inspect sent ` +
              `${String(inspectSent.length)} request(s), ${String(infoSetters)} of them info-selector ` +
              `setter(s); dump sent ${String(dumpSent.length)}, all read-only`,
          );

          /* ---- every bank ------------------------------------------------- */
          expect(banks.length, 'every slot in the plan was attempted').toBe(plan.slots.length);
          for (const bank of banks) {
            const planned = plan.slots.find((s) => s.key === bank.key);
            if (planned === undefined) throw new Error(`no planned slot ${bank.key}`);
            const where = `${bank.key.toUpperCase()} ${hex8(planned.address)}`;

            if (bank.dumped === null) {
              /* A refusal is only right where the plan itself says the dump is unsupported. */
              expect(planned.dump.supported, `${where} refused, though the plan supports it`).toBe(
                false,
              );
              outcome.lines.push(`${where}: not dumped: ${bank.refusal ?? 'refused'}`);
              continue;
            }

            const dumped = bank.dumped;
            expect(dumped.address, `${where} address`).toBe(planned.address);
            const want = truth.subarray(
              dumped.address - FLASH_BASE,
              dumped.address - FLASH_BASE + BANK_BYTES,
            );
            expect(dumped.raw.length, `${where} raw length`).toBe(BANK_BYTES);
            expect(describeDiff(want, dumped.raw), `${where} raw against the emulator's flash`).toBe(
              'identical',
            );
            expect(dumped.sha256, `${where} sha256 of the raw bank`).toBe(sha256(want));

            let line = `${where}: raw identical to the emulator's flash`;
            if (dumped.plain !== null && dumped.plainSha256 !== null) {
              const plain = dumped.plain;
              expect(dumped.plainSha256, `${where} plain sha256`).toBe(sha256(plain));
              line += `; decrypts to ${String(plain.length)} B, sha ${dumped.plainSha256.slice(0, 16)}`;

              /* An image-only entry's vendored file carries the plain image at its head,
               * then whatever the bank pads it with. The decrypted bank must reproduce it. */
              if (entry.kind === 'image-only') {
                const vendored = entry.vendored_path;
                if (vendored === undefined) throw new Error(`${entry.id} names no vendored file`);
                const file = new Uint8Array(readFileSync(path.join(EMU_DIR!, vendored)));
                expect(sha256(file), `${entry.id}: the vendored file is the manifest's`).toBe(
                  entry.sha256,
                );
                expect(file.length, `${where} the vendored image is at least as long as the plain`)
                  .toBeGreaterThanOrEqual(plain.length);
                expect(
                  sha256(file.subarray(0, plain.length)),
                  `${where} plain image against the head of the vendored file`,
                ).toBe(dumped.plainSha256);
                line += `; = head of the vendored image (${String(file.length)} B file)`;
              }
              /* A full dump's committed corpus pins the length and sha of its plain image. */
              const pinned = corpusSlot(entry, dumped.address);
              if (pinned !== null) {
                expect(plain.length, `${where} plain length against the corpus`).toBe(pinned.length);
                expect(dumped.plainSha256, `${where} plain sha against the corpus`).toBe(
                  pinned.plainSha256,
                );
                line += ' (= corpus)';
              }
              /* The round trip pins the sha256 of every image it decrypted. */
              const measured = roundtrip?.firmwares[entry.id]?.decryptedSha256 ?? [];
              if (measured.length > 0) {
                expect(measured, `${where} plain sha among the round trip's images`).toContain(
                  dumped.plainSha256,
                );
                line += ' (= round trip)';
              }
            } else {
              line += `; not decrypted (${dumped.notes.join('; ') || 'no reason recorded'})`;
            }
            outcome.lines.push(line);
          }

          outcome.status = 'works';
        } catch (error) {
          outcome.lines.push(
            `FAILED: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`,
          );
          throw error;
        } finally {
          await row.finish();
        }
      },
    );
  }

  for (const target of REFUSED_TARGETS) {
    const entry = pick(target);

    it.skipIf(entry === null)(
      `${target.label}: refused after the version read, with nothing else sent`,
      { timeout: TIMEOUT_MS },
      async () => {
        if (entry === null) return;
        const outcome: Outcome = { label: target.label, id: entry.id, status: 'fails', lines: [] };
        outcomes.push(outcome);
        const row = new RowEmulators(entry.id);
        try {
          const sent: Sent[] = [];
          let refusal: SeekError | null = null;

          await withCamera(row, entry.id, sent, undefined, async (seek) => {
            /* No probe: the selector probe is itself a set of arms, and this test is about
             * what the reader sends. The profile is a stand-in; the refusal is the build's. */
            try {
              await inspectSlots({
                device: seek,
                profile: getProfile('legacy-auth'),
                detection: null,
                reporter: silentReporter,
              });
            } catch (error) {
              if (error instanceof SeekError) refusal = error;
              else throw error;
            }
          });
          await row.assertDelivery();

          if (refusal === null) throw new Error('the reader did not refuse this build');
          const refused: SeekError = refusal;
          expect(refused.code).toBe('slots/refused');
          const ops = sent.map((s) => s.op);
          const safe: ReadonlySet<number> = SAFE_BEFORE_IDENTITY;
          expect(
            ops.filter((op) => !safe.has(op)),
            'requests sent beyond the version read',
          ).toEqual([]);
          expect(ops).not.toContain(OP.BEGIN_FIRMWARE_UPGRADE);
          outcome.lines.push(
            `version ${String(refused.detail?.firmwareVersion ?? 'unknown')}: refused: ` +
              `${refused.message.slice(0, 220)}; sent ${String(sent.length)} request(s), all of them ` +
              'the version read',
          );
          outcome.status = 'refused';
        } catch (error) {
          outcome.lines.push(
            `FAILED: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`,
          );
          throw error;
        } finally {
          await row.finish();
        }
      },
    );
  }
});
