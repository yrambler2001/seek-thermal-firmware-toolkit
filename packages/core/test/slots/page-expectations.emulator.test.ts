/* ====================================================================
 * The firmware-slots page's verdicts, on every corpus subject the emulator boots, against
 * the ONE table the matrix holds the page to (`e2e/lib/slots-expectations.ts`, TESTING.md 42.19).
 *
 * FOR EACH ROW THAT HAS AN EMULATOR ENTRY: one boot of its flash, the analysis the page reads
 * (`inspectSlots`), and the verdicts the page is built from:
 *   1. the build the camera reports is the row's build;
 *   2. the camera-wide banner ("No bank of this camera can be written from here") is absent, on a
 *      row whose table says a bank is writable, and on every row (no row's table allows a banner);
 *   3. per bank, the write the page would prepare for the booted image (`prepareSlotFlash`, pure:
 *      nothing is sent) is offered, or refused with the table's reason, exactly as the table says;
 *   4. the frame-rate row action: offered with the table's rate on a bank that holds an image, or
 *      absent with a reason; an empty or unread bank is absent with a reason, never silently;
 *   5. DENIAL: a write to the booted bank without the acknowledgement is refused, and the camera
 *      receives nothing (the request ledger does not move);
 *   6. the build the page shows for each bank the row records one for (`bankVersions`) is that build
 *      (TESTING.md 42.39); a bank the row records no build for is not checked.
 *
 * A row the table says is writable and that the page refuses fails here. A row the table lists as
 * refused and that the page now offers fails here too: the table is the owner's measured claim, and
 * a change in either direction is a decision to record there, not a silent pass.
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR (SEEK_EMU_DIR), like every emulator suite.
 * ==================================================================== */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  SLOTS_SUBJECTS,
  emulatorSubjects,
  type BankLetter,
  type SlotsSubject,
} from '../../../../e2e/lib/slots-expectations.js';
import { silentReporter } from '../../src/events.js';
import { SeekError } from '../../src/errors.js';
import { detectProfile } from '../../src/profiles/registry.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { WebUsbTransport } from '../../src/protocol/webusb.js';
import { dumpSlot } from '../../src/slots/dump.js';
import { fpsPlanOfBank } from '../../src/slots/fps-patch.js';
import { inspectSlots } from '../../src/slots/inspect.js';
import { flashSlot, prepareSlotFlash } from '../../src/slots/write.js';
import { deriveWriteKeys, writeBannerOf } from '../../src/slots/write-keys.js';
import type {
  DumpedSlot,
  SlotFlashPlan,
  SlotKey,
  SlotView,
  SlotsReport,
} from '../../src/slots/types.js';
import {
  evidenceFromChannelProbe,
  probeSelectorChannel,
  readRunningFirmware,
} from '../../src/workflows/capability.js';
import type { WorkflowContext } from '../../src/workflows/types.js';
import { liveEmulatorCount, RowEmulators, type ManifestEntry } from '../emulator/harness.js';
import {
  announceSkip,
  BOOT_TIMEOUT_MS,
  EMU_DIR,
  ENTRIES,
  URB_TIMEOUT_MS,
  scratchFile,
} from '../emulator/suite.js';
import { recordTransport, type Sent } from './corpus-locked-run.js';
import {
  LOCKED_SUBJECTS,
  corpusEntries,
  entryFor as lockedEntryFor,
  type LockedSubject,
} from './corpus-locked-subjects.js';
import {
  CHIMERA_JEDEC,
  MODERN_SUBJECTS,
  entryFor as modernEntryFor,
  type ModernSubject,
} from './corpus-modern-run.js';

const available = EMU_DIR !== null;
if (!available) announceSkip('the firmware-slots page verdicts against the matrix table');

/** The boot an emulator row needs, read from the locked or the modern subject it names. */
interface RowBoot {
  readonly entry: ManifestEntry;
  readonly jedec: string | null;
  readonly donor: string | null;
}

/**
 * The corpus entry and boot options of the subject `label` names, or a throw that names what is
 * missing. The entry is found by the same rules the two matrix suites use (`entryFor` in each).
 */
function bootOf(label: string): RowBoot {
  const locked = LOCKED_SUBJECTS.find((candidate: LockedSubject) => candidate.label === label);
  if (locked !== undefined) {
    const entry = lockedEntryFor(locked, corpusEntries());
    if (entry === null) throw new Error(`no corpus entry for ${label}`);
    return { entry, jedec: locked.jedec, donor: locked.donor ?? null };
  }
  const modern = MODERN_SUBJECTS.find((candidate: ModernSubject) => candidate.label === label);
  if (modern === undefined)
    throw new Error(`${label} is in neither the locked nor the modern list`);
  const entry = modernEntryFor(modern, ENTRIES);
  if (entry === null) throw new Error(`no corpus entry under ${modern.prefix}`);
  const donor = entry.kind === 'image-only' ? (entry.donor?.id ?? null) : null;
  return { entry, jedec: donor === null ? null : CHIMERA_JEDEC, donor };
}

/** What one booted row yields: the page's analysis and the request ledger the row's device kept. */
interface Booted {
  readonly report: SlotsReport;
  readonly ctx: WorkflowContext;
  readonly sent: Sent[];
  readonly firmware: string | null;
  readonly close: () => Promise<void>;
  /** The decrypted image the writes are prepared from, once read (see `sourceImageOf`). */
  source?: { readonly key: SlotKey; readonly dumped: DumpedSlot } | null;
}

/**
 * The decrypted image the page would offer a write: the booted bank's, else any bank that decrypts.
 * Read once per row (a dump is a read of the camera; nothing is written).
 */
async function sourceImageOf(
  booted: Booted,
): Promise<{ readonly key: SlotKey; readonly dumped: DumpedSlot } | null> {
  if (booted.source !== undefined) return booted.source;
  const { report, ctx } = booted;
  const order = [
    ...report.slots.filter((view) => view.active),
    ...report.slots.filter((view) => !view.active),
  ];
  for (const view of order) {
    const dumped = await dumpSlot(ctx, report, view.entry.key);
    if (dumped.plain !== null) {
      booted.source = { key: view.entry.key, dumped };
      return booted.source;
    }
  }
  return null;
}

/** The page's bank row, by its letter. */
function viewOf(report: SlotsReport, letter: BankLetter) {
  const view = report.slots.find((candidate) => candidate.entry.key === letter);
  if (view === undefined) throw new Error(`the plan has no bank ${letter.toUpperCase()}`);
  return view;
}

/**
 * The build the page shows for a bank: the decrypted header's, else the cleartext header's. It mirrors
 * `slotVersion` in packages/web/src/hooks/useSlotsPanel.ts, which the page's Firmware cell shows.
 */
function slotVersionOf(view: SlotView): string | null {
  return view.state?.plainHeader?.versionStr ?? view.state?.header?.versionStr ?? null;
}

/**
 * Runs `prepare` for a plain image into `letter`, returning the plan or the refusal text. The
 * 16 Hz choice is the page's box: it is ticked on the FF row, the one row whose image needs it when
 * the camera's own answers cannot say which build runs (42.12).
 */
function preparePlain(
  report: SlotsReport,
  letter: BankLetter,
  image: Uint8Array,
  running16Hz: boolean,
): { readonly plan: SlotFlashPlan } | { readonly refusal: string } {
  try {
    const plan = prepareSlotFlash(
      report,
      letter,
      { kind: 'plain', bytes: image, fileName: 'image.bin' },
      { running16Hz },
    );
    return { plan };
  } catch (error) {
    return { refusal: error instanceof Error ? error.message : String(error) };
  }
}

const rows = emulatorSubjects();

/** One line per fact the page showed for a row, printed after the run (the table's failures name the row). */
function diagnose(name: string, text: string): void {
  if (process.env.SEEK_EMU_PAGE_DIAG === '0') return;
  process.stdout.write(`[page] ${name}: ${text}\n`);
}

/** Every row is booted once, in order, and its checks read what was recorded: the rows share no emulator. */
for (const subject of rows) {
  describe.skipIf(!available)(`the page on ${subject.name} [${subject.emulator ?? ''}]`, () => {
    const row = new RowEmulators(subject.emulator ?? subject.name);
    let booted: Booted | null = null;
    let bootError: string | null = null;

    beforeAll(async () => {
      if (!available || subject.emulator === null) return;
      try {
        const boot = bootOf(subject.emulator);
        const truthPath = scratchFile(
          `page-expectations_${boot.entry.id.replace(/[^\w.-]+/g, '_')}.bin`,
        );
        const emu = await row.start(String(EMU_DIR), {
          entryId: boot.entry.id,
          readyTimeoutMs: BOOT_TIMEOUT_MS,
          flashOut: truthPath,
          ...(boot.jedec === null ? {} : { jedec: boot.jedec }),
          ...(boot.donor === null ? {} : { donor: boot.donor }),
        });
        const adapter = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
        const transport = new WebUsbTransport(adapter, {
          recipient: 'auto',
          api: 'usbip (emulator)',
          host: 'vitest',
          clock: adapter.deadlineClock,
        });
        const sent: Sent[] = [];
        recordTransport(transport, sent);
        await transport.open();
        const device = new SeekDevice(transport, { reporter: silentReporter });
        const probe = await probeSelectorChannel(device);
        const profile = detectProfile(evidenceFromChannelProbe(probe)).best.profile;
        const firmware = await readRunningFirmware(device);
        const ctx: WorkflowContext = { device, profile, detection: null, reporter: silentReporter };
        const report = await inspectSlots(ctx);
        booted = {
          report,
          ctx,
          sent,
          firmware: firmware.version ?? null,
          close: () => transport.close(),
        };
      } catch (error) {
        bootError = error instanceof Error ? error.message : String(error);
      }
    }, 10 * 60_000);

    afterAll(async () => {
      if (booted !== null) await booted.close().catch(() => undefined);
      await row.finish();
      expect(liveEmulatorCount(), 'every emulator this file started was stopped').toBe(0);
    });

    /** The booted row, or a failure that says the row never booted. */
    function bootedRow(): Booted {
      if (booted === null) {
        throw new Error(
          `${subject.name} did not boot on the emulator: ${bootError ?? 'no reason'}`,
        );
      }
      return booted;
    }

    it('reads the build the table names', () => {
      const { report, firmware } = bootedRow();
      expect(firmware, `${subject.name}: the build the camera reports`).toBe(subject.version);
      expect(report.state.version, `${subject.name}: the analysis's build`).toBe(subject.version);
    });

    /* The builds the row records per bank (bankVersions), read as the page shows them (42.39). */
    const recordedBuilds = (['a', 'b', 'r'] as const).flatMap((letter) => {
      const build = subject.bankVersions?.[letter];
      return build === undefined ? [] : [{ letter, build }];
    });
    if (recordedBuilds.length > 0) {
      it(`shows the build the table records for each bank: ${recordedBuilds.map(({ letter, build }) => `${letter.toUpperCase()} ${build}`).join(', ')}`, () => {
        const { report } = bootedRow();
        for (const { letter, build } of recordedBuilds) {
          expect(
            slotVersionOf(viewOf(report, letter)),
            `${subject.name} bank ${letter.toUpperCase()}: the build the page shows`,
          ).toBe(build);
        }
      });
    }

    it(
      subject.banner === 'none'
        ? 'shows no camera-wide "cannot be written" banner'
        : 'shows the camera-wide banner the table names, because the camera refuses every bank',
      () => {
        const { report } = bootedRow();
        const banner = writeBannerOf(report.state);
        const keys = deriveWriteKeys(report.state);
        diagnose(
          subject.name,
          `banner: ${banner ?? '(none)'}; keys: plainChain=${String(keys.plainChain)} atRest=${keys.atRest?.name ?? '(none)'}`,
        );
        if (subject.banner === 'none') {
          expect(banner, `${subject.name}: the banner`).toBeNull();
        } else {
          expect(banner, `${subject.name}: the banner is shown`).not.toBeNull();
          expect(banner ?? '', `${subject.name}: the banner's reason`).toContain(subject.banner);
        }
      },
    );

    for (const letter of ['a', 'b', 'r'] as const) {
      const verdict = subject.banks[letter];
      it(`bank ${letter.toUpperCase()}: ${verdict.writable ? 'the page offers the write' : 'the page refuses the write, with the table reason'}`, async () => {
        const booted = bootedRow();
        const { report } = booted;
        const view = viewOf(report, letter);
        /* An empty bank is written too, when the plan says so; the image source is never the target. */
        const source = await sourceImageOf(booted);
        expect(source, `${subject.name}: a decrypted image to offer`).not.toBeNull();
        if (source === null) return;
        const result = preparePlain(
          report,
          letter,
          source.dumped.plain ?? new Uint8Array(),
          subject.name.includes('1.3.0.8 FF'),
        );
        diagnose(
          subject.name,
          `bank ${letter.toUpperCase()} (${view.content}, ${view.active ? 'booted' : 'not booted'}): ` +
            ('plan' in result ? 'offered' : `refused: ${result.refusal}`),
        );
        if (verdict.writable) {
          expect(
            'refusal' in result ? result.refusal : null,
            `${subject.name} bank ${letter.toUpperCase()} (${view.content}): the page must offer the write`,
          ).toBeNull();
          if ('plan' in result) expect(result.plan.payload.length).toBeGreaterThan(0);
        } else {
          expect(
            'plan' in result ? 'offered' : result.refusal,
            `${subject.name} bank ${letter.toUpperCase()}: the page must refuse the write`,
          ).not.toBe('offered');
          if ('refusal' in result && verdict.reason !== '') {
            expect(result.refusal).toContain(verdict.reason);
          }
        }
      });
    }

    it('frame-rate: offered with the table rate on each bank that holds an image; absent with a reason elsewhere', () => {
      const { report } = bootedRow();
      for (const view of report.slots) {
        const plan = fpsPlanOfBank(report, view.entry.key);
        const notOffered = subject.fpsNotOffered;
        if (view.content === 'image' && notOffered?.bank === view.entry.key) {
          /* The row's own exception: this bank's image takes no patch, and the planner says why. */
          expect(plan.status, `${subject.name} bank ${view.entry.name}: not offered`).not.toBe(
            'offer',
          );
          if (plan.status !== 'offer') expect(plan.reason).toContain(notOffered.reason);
        } else if (view.content === 'image') {
          if (subject.fps.offer) {
            expect(plan.status, `${subject.name} bank ${view.entry.name}`).toBe('offer');
            if (plan.status === 'offer') expect(plan.toHz).toBe(subject.fps.toHz);
          } else {
            expect(plan.status, `${subject.name} bank ${view.entry.name}: no offer`).not.toBe(
              'offer',
            );
            if (plan.status !== 'offer' && subject.fps.reason !== '') {
              expect(plan.reason).toContain(subject.fps.reason);
            }
            if (plan.status !== 'offer') expect(plan.reason.length).toBeGreaterThan(0);
          }
        } else {
          /* The row says why: an empty or unread bank has no image to patch, and the plan's reason is said. */
          expect(plan.status, `${subject.name} bank ${view.entry.name} (${view.content})`).not.toBe(
            'offer',
          );
          if (plan.status !== 'offer')
            expect(plan.reason).toMatch(/no decrypted image|cannot take/);
        }
      }
    });

    if (subject.ownImage !== undefined) {
      const own = subject.ownImage;
      it(`refuses writing bank ${own.bank.toUpperCase()}'s own decrypted image back into it, with the table's reason`, async () => {
        const booted = bootedRow();
        const dumped = await dumpSlot(booted.ctx, booted.report, own.bank);
        expect(
          dumped.plain,
          `${subject.name}: bank ${own.bank.toUpperCase()} decrypts to its own image`,
        ).not.toBeNull();
        if (dumped.plain === null) return;
        const result = preparePlain(booted.report, own.bank, dumped.plain, false);
        expect(
          'plan' in result ? 'offered' : result.refusal,
          `${subject.name}: the page must refuse the bank's own image`,
        ).not.toBe('offered');
        if ('refusal' in result) expect(result.refusal).toContain(own.reason);
      });
    }

    it('denies a write to the booted bank without the acknowledgement, and sends nothing', async () => {
      const booted = bootedRow();
      const { report, ctx, sent } = booted;
      const target: SlotKey = report.slots.find((view) => view.active)?.entry.key ?? 'a';
      const source = await sourceImageOf(booted);
      if (source === null) throw new Error(`${subject.name}: no decrypted image to test with`);
      const prepared = preparePlain(
        report,
        target,
        source.dumped.plain ?? new Uint8Array(),
        subject.name.includes('1.3.0.8 FF'),
      );
      if (!('plan' in prepared)) {
        /* The page refuses this bank before any write is armed; the denial is that refusal. */
        expect(prepared.refusal.length).toBeGreaterThan(0);
        return;
      }
      const before = sent.length;
      await expect(
        flashSlot(ctx, report, prepared.plan, { acknowledgeRisk: false }),
      ).rejects.toBeInstanceOf(SeekError);
      expect(sent.length, `${subject.name}: no request was sent for the refused write`).toBe(
        before,
      );
    });
  });
}

/** Every table row is either booted here or named as bench-only, so none is silently dropped. */
describe.skipIf(!available)('the table covers the 28 matrix rows', () => {
  it('has 28 rows, each booted by the emulator or named as bench-only', () => {
    expect(SLOTS_SUBJECTS).toHaveLength(28);
    const benchOnly = SLOTS_SUBJECTS.filter((subject: SlotsSubject) => subject.emulator === null);
    for (const subject of benchOnly) {
      expect(
        subject.source.length,
        `${subject.name} says where its row comes from`,
      ).toBeGreaterThan(0);
    }
    expect(rows.length + benchOnly.length).toBe(SLOTS_SUBJECTS.length);
  });
});
