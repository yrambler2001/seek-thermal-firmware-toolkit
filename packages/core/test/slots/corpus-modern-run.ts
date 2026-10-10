/* ==================================================================== *
 * One modern-line firmware on the emulator, put through every slot check.
 *
 * This is the shared body of `corpus-modern.emulator.test.ts`. It boots one
 * emulator for one corpus entry (a full dump, or an image-only entry running as
 * a chimera on its manifest donor), reads the camera the way the CLI does, and
 * records one VERDICT per check. A verdict is one of three things, and nothing
 * else:
 *
 *   pass  the check ran and held.
 *   fail  the check ran and did not hold, or could not run for a reason that
 *         is not a known limit of the instrument. Always red.
 *   gap   the check cannot be made on the emulator (or the build plan refuses
 *         it), and the reason is said in full. The test file pins the reason;
 *         the gap then has to keep the same reason, or it is red.
 *
 * A check that was not reached is a `fail` that says so. It is never dropped.
 *
 * The checks, per firmware, in the order they run (dumps and refusals are read
 * or refused before any write, so the as-booted flash stays the reference):
 *
 *   plan           buildSlotPlan(modern-4x, version): the bank layout and staging.
 *   inspect        inspectSlots: the camera reports the version, every bank reads.
 *   dump-a/-b/-r   dumpSlot: each bank's raw bytes equal the emulator's own flash
 *                  (the --flash-out image written before the first byte is served).
 *   refuse-booted  a write to the booted bank without acknowledgeRisk is refused
 *                  with nothing sent (not one request, flash opcode or otherwise).
 *   flash-b        bank B (the non-booted one) rewritten from its OWN decrypted
 *                  image; the read-back decrypts to that same image.
 *   raw-r          bank A's raw bytes, verbatim, into recovery R; read back.
 *   blocks         the boot-config block (0x14010000) and the bootloader block
 *                  (0x14000000) read back equal to the as-booted flash, and no
 *                  ResetDevice (0x59) was sent anywhere in the run.
 *
 * THE FILL. The emulator fills every wholly-erased granule with a seeded stream
 * before the firmware boots (suite.ts), so a bank that lost bytes cannot compare
 * clean against an erased one.
 *
 * THE AUDIT. Every emulator this run starts is stopped and audited through
 * `RowEmulators`; a lost reply or a dead emulator is an InfrastructureDefect,
 * recorded as the row's defect and never as a firmware result.
 * ==================================================================== */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { equalBytes, hexUp } from '../../src/bytes.js';
import { findEmbeddedKeyTable, keyFilenameSuffix } from '../../src/crypto/keys.js';
import { SeekError } from '../../src/errors.js';
import { silentReporter } from '../../src/events.js';
import { detectProfile, getProfile } from '../../src/profiles/registry.js';
import type { FirmwareProfile, WindowEntry } from '../../src/profiles/types.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { isReadOnlyOp } from '../../src/protocol/ops.js';
import { WebUsbTransport } from '../../src/protocol/webusb.js';
import { buildSlotPlan } from '../../src/slots/capability.js';
import { dumpSlot } from '../../src/slots/dump.js';
import { inspectSlots } from '../../src/slots/inspect.js';
import { flashSlot, prepareSlotFlash } from '../../src/slots/write.js';
import type { DumpedSlot, SlotFlashPlan, SlotKey, SlotsReport } from '../../src/slots/types.js';
import { evidenceFromChannelProbe, probeSelectorChannel } from '../../src/workflows/capability.js';
import type { WorkflowContext } from '../../src/workflows/types.js';
import {
  type Emulator,
  InfrastructureDefect,
  type ManifestEntry,
  RowEmulators,
} from '../emulator/harness.js';
import { assertRealHostPath } from '../emulator/webusb-over-usbip.js';
import {
  BOOT_TIMEOUT_MS,
  EMU_DIR,
  ENTRIES,
  FILL_SCOPE,
  FILL_SEED,
  scratchFile,
  URB_TIMEOUT_MS,
} from '../emulator/suite.js';
import { windowAt } from './write-fixtures.js';

/** FW-V1's bench-measured SPI-NOR id: the one every chimera boot in this repository uses. */
export const CHIMERA_JEDEC = '010215';

/** The flash the emulator serves: 4 MiB at 0x14000000. */
const FLASH_BASE = 0x14000000;
const FLASH_SIZE = 4 * 1024 * 1024;
/** One bank, one boot-config block, one bootloader block: all 64 KiB. */
const BLOCK_BYTES = 0x10000;

/** The modern line's bank layout (profiles/modern-4x.ts). A, B, R. */
export const MODERN_LAYOUT: Readonly<Record<SlotKey, number>> = {
  a: 0x14030000,
  b: 0x14050000,
  r: 0x14070000,
};
const BOOT_CONFIG_ADDRESS = 0x14010000;
const BOOTLOADER_ADDRESS = 0x14000000;
/** ResetDevice. Nothing in the slot page sends it; this run checks that none went out. */
const RESET_DEVICE = 0x59;
const WRITE_OPCODES: ReadonlySet<number> = new Set([0x50, 0x51]);

export type CheckName =
  | 'plan'
  | 'inspect'
  | 'dump-a'
  | 'dump-b'
  | 'dump-r'
  | 'refuse-booted'
  | 'flash-b'
  | 'raw-r'
  | 'blocks';

/** The checks in the order the run makes them, with the matrix's short heading for each. */
export const CHECKS: readonly {
  readonly name: CheckName;
  readonly title: string;
  readonly column: string;
}[] = [
  {
    name: 'plan',
    title: 'buildSlotPlan puts A/B/R at the modern layout, staged Key A',
    column: 'plan',
  },
  {
    name: 'inspect',
    title: 'inspectSlots reads the version and all three banks',
    column: 'inspect',
  },
  { name: 'dump-a', title: 'dumpSlot A is byte-identical to the emulator flash', column: 'dumpA' },
  { name: 'dump-b', title: 'dumpSlot B is byte-identical to the emulator flash', column: 'dumpB' },
  { name: 'dump-r', title: 'dumpSlot R is byte-identical to the emulator flash', column: 'dumpR' },
  {
    name: 'refuse-booted',
    title: 'a write to the booted bank without acknowledgeRisk is refused, nothing sent',
    column: 'refuse',
  },
  {
    name: 'flash-b',
    title: 'B rewritten from its own decrypted image; read-back decrypts to it',
    column: 'flashB',
  },
  {
    name: 'raw-r',
    title: "A's raw bytes written verbatim into R; read-back",
    column: 'rawR',
  },
  {
    name: 'blocks',
    title: 'boot-config and bootloader blocks unchanged; no ResetDevice sent',
    column: 'blocks',
  },
];

/* ---- the verdicts --------------------------------------------------- */

export type Verdict =
  | { readonly status: 'pass'; readonly detail: string }
  | { readonly status: 'fail'; readonly detail: string }
  | { readonly status: 'gap'; readonly reason: string; readonly detail: string };

export const pass = (detail: string): Verdict => ({ status: 'pass', detail });
export const fail = (detail: string): Verdict => ({ status: 'fail', detail });
export const gap = (reason: string, detail: string): Verdict => ({ status: 'gap', reason, detail });

function notReached(why: string): Verdict {
  return fail(`not run: ${why}`);
}

/**
 * The gap reasons this run can record. Each is STABLE text (the camera-specific keys and
 * sizes travel in the verdict's detail, not the reason), so a pinned reason is compared
 * exactly and a changed one is red.
 */
export const REASON = {
  /** core's state.canFlash is false: the camera's own keys say a Key A staged write would be refused. */
  notWritable:
    "the camera is not writable from here (state.canFlash is false): the running application's " +
    "built-in Key A is not the bootloader's Key A, so a Key A staged write is refused before anything is sent",
  /** Bank B's own image holds neither of the camera's keys, and the file name has no other pair to carry. */
  bImageForeignKeys:
    "bank B's own decrypted image holds neither of this camera's Key A or Key B, and a decrypted file's " +
    'name can only carry the pair its image holds, which the page does not derive from the image: the write ' +
    'is refused rather than guessed',
  /** A chimera's raw write into R is refused by the device (0x00050000, UNSUPPORTED), on a camera whose keys are not writable from here. */
  chimeraRawRefused:
    "a chimera (the image on its donor bootloader): the device refuses R's commit of bank A's raw bytes " +
    "with 0x00050000 (UNSUPPORTED) and leaves R unchanged; the image does not carry the donor bootloader's " +
    'Key A, and whether a real camera of this build refuses the same bytes is not measured',
} as const;

/* ---- the subjects ------------------------------------------------------ */

export interface ModernSubject {
  /** The matrix row. Unique. */
  readonly label: string;
  /** Which corpus entry: a full dump, or an image-only entry that runs as a chimera. */
  readonly kind: 'full-dump' | 'image-only';
  /** The manifest id prefix that selects the entry (the rule dump.emulator.test.ts uses). */
  readonly prefix: string;
  /** The firmware version the camera must report. */
  readonly version: string;
  /** A fact about this firmware the matrix must carry, when the manifest states one. */
  readonly note?: string;
}

/**
 * The Nano 200's WHAT-IF enable-pin quirk, as the manifest states it (emu.stream.what_if_sensor_power,
 * GPIO1[2], "not measured on this camera"). It is about the sensor's frame stream: the slot workflows
 * never start a capture, so it cannot change a bank, and no check here depends on it. Carried into the
 * matrix so nobody reads the Nano 200 row as having measured the enable pin.
 */
const NANO_200_WHAT_IF =
  'manifest emu.stream.what_if_sensor_power (GPIO1[2], WHAT-IF, not measured on this camera) is about the ' +
  'sensor frame stream, which no slot operation starts; the banks do not depend on it';

/**
 * Every modern-line entry the corpus holds, full dumps and image-only entries.
 * The manifest names 4.8.x, 4.9.x, 4.16 and 4.18 Compacts (the 4.16.1.7 build is
 * a Compact FF), the Compact PRO 4.9.x and 4.18 FF, the Compact XR 4.8.2.1, the
 * Mosaic 10.9.1.31 and its FF 2.27.1.33 (the corpus has no "Compact 2.27"; the
 * 2.x build of the modern line is the Mosaic FF), Nano 200 42.32.3.10 and Nano
 * 300 44.27.3.10. The `_trimmed` siblings are the same image with its tail cut
 * and are not separate firmwares, so they are not listed.
 */
export const MODERN_SUBJECTS: readonly ModernSubject[] = [
  {
    label: 'Compact 4.8.2.1 dump',
    kind: 'full-dump',
    prefix: 'compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/',
    version: '4.8.2.1',
  },
  {
    label: 'Compact 4.8.1.7 image (on 4.8.2.1)',
    kind: 'image-only',
    prefix: 'compact/2018.09.04-15.36.50-4.8.1.7/',
    version: '4.8.1.7',
  },
  {
    label: 'Compact 4.8.1.9 image (on 4.8.2.1)',
    kind: 'image-only',
    prefix: 'compact/2018.10.11-16.36.37-4.8.1.9/',
    version: '4.8.1.9',
  },
  {
    label: 'Compact FF 4.16.1.7 image (on 4.8.2.1)',
    kind: 'image-only',
    prefix: 'compact/2018.09.04-15.37.00-4.16.1.7-FF/',
    version: '4.16.1.7',
  },
  {
    label: 'Compact PRO 4.9.1.15 dump',
    kind: 'full-dump',
    prefix: 'compact_pro/2019.03.14-09.18.41-4.9.1.15/1C0EZ0KTAMA5/dump',
    version: '4.9.1.15',
  },
  {
    label: 'Compact PRO 4.9.1.15 image (on its dump)',
    kind: 'image-only',
    prefix: 'compact_pro/2019.03.14-09.18.41-4.9.1.15/1C0EZ0KTAMA5/compact_pro_mar',
    version: '4.9.1.15',
  },
  {
    label: 'Compact PRO 4.9.2.0 dump (1215A0YZ9AA8)',
    kind: 'full-dump',
    prefix: 'compact_pro/2020.02.13-15.26.01-4.9.2.0/1215A0YZ9AA8/dump',
    version: '4.9.2.0',
  },
  {
    label: 'Compact PRO 4.9.2.0 dump (1D0DB0Y6ZDC7)',
    kind: 'full-dump',
    prefix: 'compact_pro/2020.02.13-15.26.01-4.9.2.0/1D0DB0Y6ZDC7/dump',
    version: '4.9.2.0',
  },
  {
    label: 'Compact PRO 4.9.2.0 image (on its dump)',
    kind: 'image-only',
    prefix: 'compact_pro/2020.02.13-15.26.01-4.9.2.0/1215A0YZ9AA8/compact_pro_feb',
    version: '4.9.2.0',
  },
  {
    label: 'Compact PRO FF 4.18.2.0 dump (090BB12PR939)',
    kind: 'full-dump',
    prefix: 'compact_pro/2020.02.13-15.26.28-4.18.2.0-FF/090BB12PR939/dump',
    version: '4.18.2.0',
  },
  {
    label: 'Compact PRO FF 4.18.2.0 dump (0E1CA0Z16D19)',
    kind: 'full-dump',
    prefix: 'compact_pro/2020.02.13-15.26.28-4.18.2.0-FF/0E1CA0Z16D19/dump',
    version: '4.18.2.0',
  },
  {
    label: 'Compact PRO FF 4.18.2.0 dump (1818B0Z3K6C8)',
    kind: 'full-dump',
    prefix: 'compact_pro/2020.02.13-15.26.28-4.18.2.0-FF/1818B0Z3K6C8/dump',
    version: '4.18.2.0',
  },
  {
    label: 'Compact PRO FF 4.18.2.0 image (on its dump)',
    kind: 'image-only',
    prefix: 'compact_pro/2020.02.13-15.26.28-4.18.2.0-FF/090BB12PR939/compact_pro_ff',
    version: '4.18.2.0',
  },
  {
    label: 'Compact XR 4.8.2.1 dump',
    kind: 'full-dump',
    prefix: 'compact_xr/2020.02.26-11.23.26-4.8.2.1/1F1660P7U967/dump',
    version: '4.8.2.1',
  },
  {
    label: 'Compact XR 4.8.2.1 image (on its dump)',
    kind: 'image-only',
    prefix: 'compact_xr/2020.02.26-11.23.26-4.8.2.1/1F1660P7U967/compact_xr',
    version: '4.8.2.1',
  },
  {
    label: 'Mosaic 10.9.1.31 dump',
    kind: 'full-dump',
    prefix: 'mosaic/2019.11.19-09.59.21-10.9.1.31/no-serial/dump',
    version: '10.9.1.31',
  },
  {
    label: 'Mosaic 10.9.1.31 image (on its dump)',
    kind: 'image-only',
    prefix: 'mosaic/2019.11.19-09.59.21-10.9.1.31/no-serial/mosaic_nov',
    version: '10.9.1.31',
  },
  {
    label: 'Mosaic FF 2.27.1.33 dump',
    kind: 'full-dump',
    prefix: 'mosaic/2019.12.10-10.48.25-2.27.1.33-FF/no-serial/dump',
    version: '2.27.1.33',
  },
  {
    label: 'Mosaic FF 2.27.1.33 image (on its dump)',
    kind: 'image-only',
    prefix: 'mosaic/2019.12.10-10.48.25-2.27.1.33-FF/no-serial/mosaic_ff',
    version: '2.27.1.33',
  },
  {
    label: 'Nano 200 42.32.3.10 dump',
    kind: 'full-dump',
    prefix: 'nano_200/2024.11.20-14.58.43-42.32.3.10/0E1CA0YWX3A9/dump',
    version: '42.32.3.10',
    note: NANO_200_WHAT_IF,
  },
  {
    label: 'Nano 200 42.32.3.10 image (on its dump)',
    kind: 'image-only',
    prefix: 'nano_200/2024.11.20-14.58.43-42.32.3.10/0E1CA0YWX3A9/nano_200',
    version: '42.32.3.10',
    note: NANO_200_WHAT_IF,
  },
  {
    label: 'Nano 300 44.27.3.10 dump',
    kind: 'full-dump',
    prefix: 'nano_300/2024.11.21-11.55.00-44.27.3.10/1713A171RJB9/dump',
    version: '44.27.3.10',
  },
  {
    label: 'Nano 300 44.27.3.10 image (on its dump)',
    kind: 'image-only',
    prefix: 'nano_300/2024.11.21-11.55.00-44.27.3.10/1713A171RJB9/decrypted_14030000_keyb',
    version: '44.27.3.10',
  },
];

/** The manifest entry a subject names, or null when the corpus does not hold it. */
export function entryFor(
  subject: ModernSubject,
  entries: readonly ManifestEntry[],
): ManifestEntry | null {
  return (
    entries.find(
      (entry) =>
        entry.kind === subject.kind &&
        entry.id.startsWith(subject.prefix) &&
        !entry.id.endsWith('_trimmed'),
    ) ?? null
  );
}

/* ---- the run ----------------------------------------------------------- */

export interface ModernRun {
  readonly subject: ModernSubject;
  readonly entryId: string | null;
  /** The donor an image-only entry runs on, or null for a full dump. */
  readonly donorId: string | null;
  readonly profileId: string | null;
  readonly version: string | null;
  readonly booted: SlotKey | null;
  readonly verdicts: Record<CheckName, Verdict>;
  /** Set when the emulator's delivery audit (or a death) failed the row. */
  readonly defect: string | null;
  /** Set when the row could not start or boot at all. */
  readonly setup: string | null;
  readonly resetSent: boolean;
  readonly delivery: {
    readonly emulators: number;
    readonly delivered: number;
    readonly dropped: number;
  };
  readonly seconds: number;
  /** Everything a person reading the matrix needs about this row, in order. */
  readonly notes: string[];
}

function blankVerdicts(why: string): Record<CheckName, Verdict> {
  const out = {} as Record<CheckName, Verdict>;
  for (const check of CHECKS) out[check.name] = notReached(why);
  return out;
}

function reasonOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** The first differing byte of two equal-length slices, as a line for a failure message. */
function describeDiff(want: Uint8Array, got: Uint8Array): string {
  let count = 0;
  let first = -1;
  for (let i = 0; i < want.length; i++) {
    if (want[i] !== got[i]) {
      count++;
      if (first < 0) first = i;
    }
  }
  if (count === 0 && want.length === got.length) return 'identical';
  if (want.length !== got.length)
    return `length ${String(got.length)}, expected ${String(want.length)}`;
  return `${String(count)} byte(s) differ, first at +0x${first.toString(16)}`;
}

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

/** Every request the transport sends, in order, from the first byte on. */
interface Sent {
  readonly dir: 'in' | 'out';
  readonly op: number;
}

function recordRequests(transport: WebUsbTransport, sent: Sent[]): void {
  const controlIn = transport.controlIn.bind(transport);
  transport.controlIn = (request, length, timeoutMs) => {
    sent.push({ dir: 'in', op: request });
    return controlIn(request, length, timeoutMs);
  };
  const controlOut = transport.controlOut.bind(transport);
  transport.controlOut = (request, data, timeoutMs) => {
    sent.push({ dir: 'out', op: request });
    return controlOut(request, data, timeoutMs);
  };
}

/** The profile the camera's own selector answers choose, as the CLI chooses it. */
async function probedProfile(device: SeekDevice): Promise<FirmwareProfile> {
  return detectProfile(evidenceFromChannelProbe(await probeSelectorChannel(device))).best.profile;
}

/** The image file name a decrypted image is retargeted under: the camera's own key pair. */
function imageFileName(report: SlotsReport): string {
  const table = report.state.keyTable;
  return table === null ? 'image.bin' : `image${keyFilenameSuffix(table.keyA, table.keyB)}.bin`;
}

/** The bank the camera boots, or null when it names none. */
function bootedOf(report: SlotsReport): SlotKey | null {
  return report.state.boot?.booted ?? null;
}

/**
 * Boot `subject` on the emulator and run every check. Never throws for a firmware
 * result: a failure is a verdict. An InfrastructureDefect is recorded as the
 * row's `defect`, so the other rows still run and the defect is reported.
 */
export async function runModernSubject(
  subject: ModernSubject,
  entries: readonly ManifestEntry[] = ENTRIES,
): Promise<ModernRun> {
  const started = Date.now();
  const notes: string[] = [];
  const entry = entryFor(subject, entries);
  const run: {
    entryId: string | null;
    donorId: string | null;
    profileId: string | null;
    version: string | null;
    booted: SlotKey | null;
    verdicts: Record<CheckName, Verdict>;
    defect: string | null;
    setup: string | null;
    resetSent: boolean;
  } = {
    entryId: entry?.id ?? null,
    donorId: null,
    profileId: null,
    version: null,
    booted: null,
    verdicts: blankVerdicts('the row did not start'),
    defect: null,
    setup: null,
    resetSent: false,
  };
  const row = new RowEmulators(entry?.id ?? subject.label);
  let delivery = { emulators: 0, delivered: 0, dropped: 0 };

  const finish = (): ModernRun => ({
    subject,
    entryId: run.entryId,
    donorId: run.donorId,
    profileId: run.profileId,
    version: run.version,
    booted: run.booted,
    verdicts: run.verdicts,
    defect: run.defect,
    setup: run.setup,
    resetSent: run.resetSent,
    delivery,
    seconds: (Date.now() - started) / 1000,
    notes,
  });

  if (entry === null) {
    run.setup = `the corpus holds no ${subject.kind} entry under ${subject.prefix}`;
    run.verdicts = blankVerdicts(run.setup);
    return finish();
  }
  if (EMU_DIR === null) {
    run.setup = 'no emulator directory (SEEK_EMU_DIR)';
    run.verdicts = blankVerdicts(run.setup);
    return finish();
  }

  /* An image-only entry has no bootloader: it runs as a chimera on its manifest donor. */
  const donor = entry.kind === 'image-only' ? (entry.donor?.id ?? null) : null;
  run.donorId = donor;
  if (entry.kind === 'image-only' && donor === null) {
    run.setup = `${entry.id} is image-only and the manifest names no donor`;
    run.verdicts = blankVerdicts(run.setup);
    return finish();
  }
  const truthPath = scratchFile(`modern_${entry.id.replace(/[^\w.-]+/g, '_')}.bin`);

  try {
    const emu = await row.start(EMU_DIR, {
      entryId: entry.id,
      fillSeed: FILL_SEED,
      fillScope: FILL_SCOPE,
      flashOut: truthPath,
      readyTimeoutMs: BOOT_TIMEOUT_MS,
      ...(donor === null ? {} : { donor, jedec: CHIMERA_JEDEC }),
    });
    await row.guard(emu, () => exerciseCamera(emu, entry, truthPath, run, notes));
  } catch (error) {
    if (error instanceof InfrastructureDefect) {
      run.defect = reasonOf(error);
    } else {
      run.setup = run.setup ?? reasonOf(error);
    }
  } finally {
    try {
      await row.finish();
      const totals = row.totals();
      delivery = {
        emulators: totals.emulators,
        delivered: totals.delivered,
        dropped: totals.dropped,
      };
      await row.assertDelivery();
    } catch (error) {
      run.defect = run.defect ?? reasonOf(error);
    }
  }
  if (run.setup !== null) {
    for (const check of CHECKS) {
      if (
        run.verdicts[check.name].status === 'fail' &&
        run.verdicts[check.name].detail.startsWith('not run')
      ) {
        run.verdicts[check.name] = fail(`not run: ${run.setup}`);
      }
    }
  }
  if (run.defect !== null) {
    for (const check of CHECKS) {
      if (run.verdicts[check.name].detail.startsWith('not run')) {
        run.verdicts[check.name] = fail(
          `not run: the instrument failed (${run.defect.split('\n')[0] ?? ''})`,
        );
      }
    }
  }
  return finish();
}

/**
 * Everything that talks to the camera, under the row's death race. Each check is
 * recorded where it lands; an exception inside one check is that check's verdict.
 */
async function exerciseCamera(
  emu: Emulator,
  entry: ManifestEntry,
  truthPath: string,
  run: {
    profileId: string | null;
    version: string | null;
    booted: SlotKey | null;
    verdicts: Record<CheckName, Verdict>;
    resetSent: boolean;
    setup: string | null;
  },
  notes: string[],
): Promise<void> {
  const adapter = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
  const transport = new WebUsbTransport(adapter, {
    recipient: 'auto',
    api: 'usbip (emulator)',
    host: 'vitest',
    clock: adapter.deadlineClock,
  });
  const sent: Sent[] = [];
  recordRequests(transport, sent);
  await transport.open();
  assertRealHostPath(adapter, transport.info, `${entry.id}: first open()`);
  try {
    const device = new SeekDevice(transport, { reporter: silentReporter });
    const profile = await probedProfile(device);
    run.profileId = profile.id;
    const ctx: WorkflowContext = { device, profile, detection: null, reporter: silentReporter };

    const truth = new Uint8Array(readFileSync(truthPath));
    if (truth.length !== FLASH_SIZE)
      throw new Error(`the emulator wrote ${String(truth.length)} B, not 4 MiB`);
    const truthAt = (address: number, length: number): Uint8Array =>
      truth.subarray(address - FLASH_BASE, address - FLASH_BASE + length);

    /* ---- inspect (and the plan it is joined to) ---- */
    let report: SlotsReport;
    try {
      report = await inspectSlots(ctx);
    } catch (error) {
      const why = `inspectSlots failed: ${reasonOf(error)}`;
      run.verdicts.inspect = fail(why);
      run.setup = run.setup ?? why;
      return;
    }
    run.version = report.state.version;
    run.booted = bootedOf(report);
    const version = report.state.version ?? '';
    const expectedVersion = entry.version;

    run.verdicts.plan = checkPlan(report, version);
    run.verdicts.inspect =
      report.state.version !== expectedVersion
        ? fail(
            `the camera reports ${String(report.state.version)}, the corpus says ${expectedVersion}`,
          )
        : checkInspect(report);

    /* ---- the dumps: read-only, before any write ---- */
    const dumps: Partial<Record<SlotKey, DumpedSlot>> = {};
    for (const key of ['a', 'b', 'r'] as const) {
      const name: CheckName = key === 'a' ? 'dump-a' : key === 'b' ? 'dump-b' : 'dump-r';
      const mark = sent.length;
      try {
        const dumped = await dumpSlot(ctx, report, key);
        const bad = sent.slice(mark).filter((s) => !isReadOnlyOp(s.op));
        dumps[key] = dumped;
        run.verdicts[name] =
          bad.length > 0
            ? fail(
                `dumping ${key.toUpperCase()} sent ${bad.map((s) => hexUp(s.op, 2)).join(', ')}, not read-only`,
              )
            : checkDump(key, dumped, truthAt(MODERN_LAYOUT[key], BLOCK_BYTES), report, notes);
      } catch (error) {
        run.verdicts[name] = dumpFailure(key, report, error);
      }
    }

    /* ---- the refusal: the booted bank, no acknowledgement, nothing sent ---- */
    run.verdicts['refuse-booted'] = await checkRefusal(ctx, report, dumps, sent);

    /* ---- bank B from its own decrypted image ---- */
    run.verdicts['flash-b'] = await checkFlashB(ctx, report, dumps, notes);

    /* ---- bank A's raw bytes, verbatim, into recovery R ---- */
    run.verdicts['raw-r'] = await checkRawR(ctx, report, dumps, notes, entry.kind === 'image-only');

    /* ---- the boot-config and bootloader blocks, after every write ---- */
    run.verdicts.blocks = await checkBlocks(
      device,
      profile,
      report.state.version ?? '',
      truthAt,
      sent,
    );
    run.resetSent = sent.some((s) => s.op === RESET_DEVICE);
  } finally {
    await transport.close();
  }
}

function checkPlan(report: SlotsReport, version: string): Verdict {
  const plan = buildSlotPlan(getProfile('modern-4x'), report.state.version);
  const problems: string[] = [];
  if (!plan.supportedBuild.supported) problems.push(`not supported: ${plan.supportedBuild.reason}`);
  if (plan.profileId !== 'modern-4x') problems.push(`profile ${plan.profileId}`);
  if (report.plan.profileId !== 'modern-4x')
    problems.push(`the report plans under ${report.plan.profileId}`);
  for (const slot of plan.slots) {
    const want = MODERN_LAYOUT[slot.key];
    if (slot.address !== want)
      problems.push(`${slot.key.toUpperCase()} at ${hexUp(slot.address)}, not ${hexUp(want)}`);
    if (slot.staging !== 'key-a-ciphertext')
      problems.push(`${slot.key.toUpperCase()} staged as ${String(slot.staging)}`);
    if (!slot.dump.supported || !slot.flashPlain.supported || !slot.flashRaw.supported) {
      problems.push(
        `${slot.key.toUpperCase()} refuses an operation: ${slot.dump.supported ? '' : slot.dump.reason}`,
      );
    }
  }
  if (problems.length > 0) return fail(`build ${version}: ${problems.join('; ')}`);
  return pass(
    `build ${version}: A ${hexUp(MODERN_LAYOUT.a)}, B ${hexUp(MODERN_LAYOUT.b)}, R ${hexUp(MODERN_LAYOUT.r)}, ` +
      'key-a-ciphertext, dump/flash-plain/flash-raw supported',
  );
}

function checkInspect(report: SlotsReport): Verdict {
  const unread = report.slots.filter((view) => view.unreadReason !== null);
  if (unread.length > 0) {
    return fail(
      unread.map((view) => `${view.entry.name}: ${String(view.unreadReason)}`).join('; '),
    );
  }
  const booted = report.state.boot?.booted ?? 'none named';
  const keys = report.slots
    .map((view) => `${view.entry.key.toUpperCase()} ${view.state?.keyName ?? '-'}`)
    .join(', ');
  return pass(
    `version ${String(report.state.version)}, all three banks read, booted ${booted}, keys ${keys}`,
  );
}

/** A dump that could not run: a refusal the plan itself states is a gap; anything else is a failure. */
function dumpFailure(key: SlotKey, report: SlotsReport, error: unknown): Verdict {
  const entry = report.plan.slots.find((slot) => slot.key === key);
  if (entry !== undefined && !entry.dump.supported) {
    return gap(entry.dump.reason, `${entry.name}: dumpSlot refused: ${reasonOf(error)}`);
  }
  if (error instanceof SeekError)
    return fail(`dumpSlot ${key.toUpperCase()} refused: ${error.message}`);
  return fail(`dumpSlot ${key.toUpperCase()} threw: ${reasonOf(error)}`);
}

function checkDump(
  key: SlotKey,
  dumped: DumpedSlot,
  want: Uint8Array,
  report: SlotsReport,
  notes: string[],
): Verdict {
  const address = MODERN_LAYOUT[key];
  if (dumped.address !== address)
    return fail(`dump reports ${hexUp(dumped.address)}, the layout is ${hexUp(address)}`);
  if (dumped.raw.length !== BLOCK_BYTES)
    return fail(`dump is ${String(dumped.raw.length)} B, not 64 KiB`);
  const diff = describeDiff(want, dumped.raw);
  if (diff !== 'identical')
    return fail(
      `${key.toUpperCase()} at ${hexUp(address)} differs from the emulator flash: ${diff}`,
    );
  if (dumped.sha256 !== sha256(want))
    return fail(`${key.toUpperCase()} sha256 does not match its own bytes`);
  const plain =
    dumped.plain === null ? 'no decrypted image' : `decrypts to ${String(dumped.plain.length)} B`;
  const verdict = `${key.toUpperCase()} ${hexUp(address)}: raw identical to the emulator flash; ${plain}`;
  if (key === 'a' || key === 'b')
    notes.push(`${verdict}; report booted ${report.state.boot?.booted ?? 'none'}`);
  return pass(verdict);
}

/**
 * The booted bank, written without acknowledgeRisk. The prepared payload is built
 * from the bank's OWN decrypted image, so only the risk gate can refuse it.
 */
async function checkRefusal(
  ctx: WorkflowContext,
  report: SlotsReport,
  dumps: Partial<Record<SlotKey, DumpedSlot>>,
  sent: Sent[],
): Promise<Verdict> {
  const booted = bootedOf(report);
  const key: SlotKey = booted ?? 'a';
  const dumped = dumps[key];
  if (dumped === undefined) return notReached(`bank ${key.toUpperCase()} was not dumped`);
  /* A decrypted image when the camera takes one. When it does not (its key state refuses
   * every Key A staged write, see checkFlashB), the bank's raw bytes, verbatim: they reach
   * the acknowledgement gate without the key-state refusal in front of it. The form used is
   * reported, so the verdict says which gate was exercised. */
  const writable = report.state.canFlash;
  const form = writable
    ? 'its decrypted image'
    : 'its raw bytes (the camera is not writable from here)';
  let plan: SlotFlashPlan;
  try {
    if (writable) {
      if (dumped.plain === null) {
        return fail(
          `the booted bank ${key.toUpperCase()} holds no decrypted image to attempt the write with`,
        );
      }
      plan = prepareSlotFlash(report, key, {
        kind: 'plain',
        bytes: dumped.plain,
        fileName: imageFileName(report),
      });
    } else {
      plan = prepareSlotFlash(report, key, { kind: 'raw', bytes: dumped.raw, fileName: 'raw.bin' });
    }
  } catch (error) {
    return fail(`the refusal could not be prepared for ${key.toUpperCase()}: ${reasonOf(error)}`);
  }
  const mark = sent.length;
  try {
    await flashSlot(ctx, report, plan, { acknowledgeRisk: false });
    return fail(`a write to ${key.toUpperCase()} went through without acknowledgeRisk`);
  } catch (error) {
    const during = sent.slice(mark);
    const refused = error instanceof SeekError && error.code === 'slots/refused';
    if (!refused) return fail(`the write was not refused as slots/refused: ${reasonOf(error)}`);
    if (during.length > 0) {
      return fail(`refused, but ${String(during.length)} request(s) went out first`);
    }
    return pass(
      `${key.toUpperCase()} (${booted === null ? 'no booted bank named' : 'booted'}), ${form}, refused: ` +
        `${error.message.split('\n')[0] ?? ''}; 0 requests sent`,
    );
  }
}

/** Bytes as lowercase hex, for a message a person reads. */
const hexOf = (bytes: Uint8Array): string => Buffer.from(bytes).toString('hex');

async function checkFlashB(
  ctx: WorkflowContext,
  report: SlotsReport,
  dumps: Partial<Record<SlotKey, DumpedSlot>>,
  notes: string[],
): Promise<Verdict> {
  const before = dumps.b;
  if (before === undefined) return notReached('bank B was not dumped');
  if (before.plain === null) {
    return fail(
      `bank B holds no decrypted image to write back: ${before.notes.join('; ') || 'no reason recorded'}`,
    );
  }
  /* A Key A staged write is refused before anything is sent when the camera's own keys say
   * the bootloader would refuse the result (state.canFlash). That is the product's verdict on
   * this camera, read from its own dump, and it is recorded as the gap it is. */
  if (!report.state.canFlash) {
    return gap(
      REASON.notWritable,
      `B: refused before anything is sent: ${report.state.flashBlockedBy.join('; ')}`,
    );
  }
  /* A decrypted file's name must carry the pair its image holds, and the write retargets the
   * image to this camera's pair. Where the image holds neither of this camera's keys, the page
   * has no name it can give the file without guessing, and refuses. Measured on the image. */
  const keyTable = report.state.keyTable;
  if (
    keyTable !== null &&
    findEmbeddedKeyTable(before.plain, keyTable.keyA, keyTable.keyB) === null
  ) {
    return gap(
      REASON.bImageForeignKeys,
      `B: ${String(before.plain.length)} B image, sha ${sha256(before.plain).slice(0, 16)}; this camera's Key A ` +
        `${hexOf(keyTable.keyA)}, Key B ${hexOf(keyTable.keyB)}; bank B reads as ` +
        `'${report.state.byKey.get('b')?.keyName ?? 'unknown'}'`,
    );
  }
  const booted = bootedOf(report);
  /* B is the non-booted bank in this corpus. Were the camera to name B, or name no
   * bank at all, the write needs the acknowledgement, and the verdict says so. */
  const acknowledgeRisk = booted === null || booted === 'b';
  try {
    const plan = prepareSlotFlash(report, 'b', {
      kind: 'plain',
      bytes: before.plain,
      fileName: imageFileName(report),
    });
    notes.push(...plan.warnings.filter((w) => !w.startsWith('Note: ')).map((w) => `B plan: ${w}`));
    const result = await flashSlot(ctx, report, plan, { acknowledgeRisk });
    const back = await dumpSlot(ctx, report, 'b');
    if (back.plain === null) {
      return fail(`the read-back of B holds no decrypted image: ${back.notes.join('; ')}`);
    }
    if (!equalBytes(back.plain, before.plain)) {
      return fail(
        `the read-back of B decrypts to a different image: ${describeDiff(before.plain, back.plain)}`,
      );
    }
    if (result.after !== null && !equalBytes(result.after, back.raw)) {
      return fail('the read-back flashSlot took and the one dumpSlot took disagree');
    }
    return pass(
      `B rewritten: commit status ${hexUp(result.commitStatus, 4)}, read-back decrypts to the same ` +
        `${String(before.plain.length)} B image` +
        (acknowledgeRisk
          ? ' (written with acknowledgeRisk: B is the booted or an unnamed bank)'
          : ''),
    );
  } catch (error) {
    return fail(`writing B failed: ${reasonOf(error)}`);
  }
}

async function checkRawR(
  ctx: WorkflowContext,
  report: SlotsReport,
  dumps: Partial<Record<SlotKey, DumpedSlot>>,
  notes: string[],
  chimera: boolean,
): Promise<Verdict> {
  const a = dumps.a;
  if (a === undefined) return notReached('bank A was not dumped');
  if (a.plain === null)
    return fail('bank A holds no decrypted image, so there is nothing to compare R with');
  const before = dumps.r?.raw ?? null;
  try {
    const plan = prepareSlotFlash(report, 'r', { kind: 'raw', bytes: a.raw, fileName: 'raw.bin' });
    notes.push(...plan.warnings.filter((w) => !w.startsWith('Note: ')).map((w) => `R plan: ${w}`));
    const result = await flashSlot(ctx, report, plan, { acknowledgeRisk: true });
    const after = result.after;
    if (after === null) return fail('recovery R was not read back');
    const sent = plan.payload;
    /* Verbatim or not, MEASURED, not assumed. On the Key A line the device decrypts what it
     * is sent under Key A and stores the image under the store key, so the bytes it keeps
     * may differ from the bytes it was given. What the bank must then hold is A's image. */
    const verbatim = equalBytes(after.subarray(0, sent.length), sent);
    const tailErased = after.subarray(sent.length).every((b) => b === 0xff);
    const back = await dumpSlot(ctx, report, 'r');
    const decrypts = back.plain !== null && equalBytes(back.plain, a.plain);
    const shape =
      `commit status ${hexUp(result.commitStatus, 4)}; the ${String(sent.length)} B ` +
      (verbatim ? 'read back verbatim' : 'read back re-encrypted (not verbatim)') +
      (tailErased ? '; the tail is erased' : '; the tail is NOT erased') +
      (decrypts
        ? "; R decrypts to A's image"
        : `; R does NOT decrypt to A's image (${back.notes.join('; ') || 'no reason recorded'})`);
    if (!tailErased) return fail(`raw write into R left bytes past the payload: ${shape}`);
    if (!decrypts) return fail(`raw write into R: ${shape}`);
    return pass(`A's raw bytes into R: ${shape}`);
  } catch (error) {
    /* A refused commit: say what the camera did with the bank it refused. */
    const read = report.plan.slots.find((slot) => slot.key === 'r')?.read ?? null;
    let rAfter = 'R could not be read back';
    if (read !== null && before !== null) {
      try {
        const got = (await ctx.device.readWindow(read)).data;
        rAfter = equalBytes(got.subarray(0, before.length), before) ? 'R unchanged' : 'R CHANGED';
      } catch (readError) {
        rAfter = `R unreadable: ${reasonOf(readError)}`;
      }
    }
    notes.push(`R after the refused raw write: ${rAfter}`);
    const refusal = `the raw write into R was refused by the camera: ${reasonOf(error)} (${rAfter})`;
    /* On a chimera the image's own keys are not the bootloader's, which is the state the camera
     * reports as not writable. The refusal is then a measurement on the emulated chimera, not
     * on a camera of this build, and it is recorded as the gap it is. */
    if (chimera && !report.state.canFlash) {
      return gap(REASON.chimeraRawRefused, refusal);
    }
    return fail(refusal);
  }
}

async function checkBlocks(
  device: SeekDevice,
  profile: FirmwareProfile,
  version: string,
  truthAt: (address: number, length: number) => Uint8Array,
  sent: Sent[],
): Promise<Verdict> {
  const blocks: readonly { readonly name: string; readonly address: number }[] = [
    { name: 'boot-config block', address: BOOT_CONFIG_ADDRESS },
    { name: 'bootloader block', address: BOOTLOADER_ADDRESS },
  ];
  const parts: string[] = [];
  for (const block of blocks) {
    const window: WindowEntry | null = windowAt(profile, version, block.address);
    if (window === null) {
      return gap(
        `this build's table has no window at ${hexUp(block.address)} (the ${block.name})`,
        `${block.name}: not readable through this build's selector table`,
      );
    }
    let got: Uint8Array;
    try {
      got = (await device.readWindow(window)).data;
    } catch (error) {
      return fail(`${block.name} could not be read after the writes: ${reasonOf(error)}`);
    }
    const want = truthAt(block.address, BLOCK_BYTES);
    const diff = describeDiff(want, got.subarray(0, BLOCK_BYTES));
    if (diff !== 'identical') return fail(`${block.name} changed by the writes: ${diff}`);
    parts.push(`${block.name} ${hexUp(block.address)} unchanged`);
  }
  const reset = sent.some((s) => s.op === RESET_DEVICE);
  const writes = sent.filter((s) => WRITE_OPCODES.has(s.op)).length;
  if (reset) return fail('ResetDevice (0x59) was sent');
  parts.push(`no ResetDevice; ${String(writes)} staging/commit request(s) in the run`);
  return pass(parts.join('; '));
}

/* ---- the matrix ------------------------------------------------------- */

/** The matrix: one row per firmware, one column per check. Plain text. */
export function formatMatrix(runs: readonly ModernRun[]): string {
  const cols = CHECKS.map((check) => check.column);
  const lines: string[] = [];
  lines.push('');
  lines.push('--- modern line on the emulated corpus: firmware x check ---');
  lines.push(`${'firmware'.padEnd(46)}  ${cols.map((c) => c.padEnd(7)).join(' ')}  secs  booted`);
  for (const run of runs) {
    const cells = CHECKS.map((check) => {
      const v = run.verdicts[check.name];
      return (v.status === 'pass' ? 'PASS' : v.status === 'gap' ? 'GAP' : 'FAIL').padEnd(7);
    });
    const defect = run.defect !== null ? ' DEFECT' : '';
    const setup = run.setup !== null ? ' SETUP' : '';
    lines.push(
      `${run.subject.label.slice(0, 46).padEnd(46)}  ${cells.join(' ')}  ${run.seconds.toFixed(0).padStart(4)}  ` +
        `${run.booted ?? '-'}${defect}${setup}`,
    );
  }
  const counts = { pass: 0, gap: 0, fail: 0 };
  for (const run of runs) for (const check of CHECKS) counts[run.verdicts[check.name].status]++;
  lines.push(
    `checks: ${String(counts.pass)} pass, ${String(counts.gap)} gap, ${String(counts.fail)} fail`,
  );
  lines.push('');
  lines.push('--- detail, per firmware: gaps (with their reason) and failures ---');
  for (const run of runs) {
    lines.push(`* ${run.subject.label} [${run.entryId ?? 'no entry'}]`);
    lines.push(
      `    profile ${run.profileId ?? '-'}, version ${run.version ?? '-'}, donor ${run.donorId ?? '-'}`,
    );
    if (run.setup !== null) lines.push(`    setup: ${run.setup}`);
    if (run.defect !== null)
      lines.push(`    INSTRUMENT DEFECT: ${run.defect.split('\n')[0] ?? ''}`);
    for (const check of CHECKS) {
      const v = run.verdicts[check.name];
      const text =
        v.status === 'pass'
          ? `PASS ${v.detail}`
          : v.status === 'gap'
            ? `GAP  ${v.reason} | ${v.detail}`
            : `FAIL ${v.detail}`;
      lines.push(`    ${check.name}: ${text.slice(0, 400)}`);
    }
    if (run.subject.note !== undefined) lines.push(`    note: ${run.subject.note}`);
    for (const note of run.notes) lines.push(`    note: ${note.slice(0, 300)}`);
  }
  lines.push('');
  return lines.join('\n');
}
