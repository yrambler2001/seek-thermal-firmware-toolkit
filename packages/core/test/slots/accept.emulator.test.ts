/* ====================================================================
 * Does the bootloader accept a bank the slot page writes? (TESTING.md sec.42.7)
 *
 * The corpus runs (corpus-modern.emulator.test.ts) read a written bank back and
 * decrypt it. That shows what the device STORED, not what the bootloader takes. This
 * file asks the bootloader itself: the bank is written with a build string changed in
 * its image, the boot configuration is set to prefer that bank (cfg[0] = 1 prefers B,
 * 2 prefers recovery R), the emulator is booted from the resulting flash, and the build
 * string the camera reports is read. The changed string means the real bootloader took
 * the bank; the original string means it fell back to the booted bank A.
 *
 * Rows:
 *   - Mosaic 10.9.1.31 dump: the derived upload, B and R. Its application (pair
 *     f32ad771 / 997ed6e5) does not carry the bootloader's pair, and the booted bank
 *     is under the bootloader's Key A. This is the row the derivation changes.
 *   - the same row, CONTROL: the upload the page sent before the derivation (the
 *     image under the bootloader's Key A alone). It must not be accepted.
 *   - Compact 4.8.2.1 dump: the derived upload is byte-identical to the old one (the
 *     application carries the bootloader's pair). Accepted, B and R.
  (Compact PRO 4.9.1.15 is not here: its bank B holds the 2016 line's image, whose key blocks
 *   the page's candidate table does not carry, so the B write is refused at the retarget step.)
 *   - Compact FF 4.16.1.7 (chimera on 4.8.2.1): the derivation refuses (its build checks
 *     an upload under its own keys, and the booted key is neither of its keys). Nothing
 *     is sent; the refusal is pinned here.
 *
 * Runs only with SEEK_EMU_DIR set (it skips loudly without it). About 20 s per boot.
 * ==================================================================== */

import { readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { silentReporter } from '../../src/events.js';
import { buildBankPayload, setAcceptSum } from '../../src/image/bank.js';
import { detectProfile } from '../../src/profiles/registry.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { WebUsbTransport } from '../../src/protocol/webusb.js';
import { dumpSlot } from '../../src/slots/dump.js';
import { inspectSlots } from '../../src/slots/inspect.js';
import { flashSlot, prepareSlotFlash } from '../../src/slots/write.js';
import type { SlotKey, SlotsReport } from '../../src/slots/types.js';
import { cameraWriteRefusal, deriveWriteKeys } from '../../src/slots/write-keys.js';
import { evidenceFromChannelProbe, probeSelectorChannel } from '../../src/workflows/capability.js';
import type { WorkflowContext } from '../../src/workflows/types.js';
import { RowEmulators, liveEmulatorCount } from '../emulator/harness.js';
import {
  BOOT_TIMEOUT_MS,
  EMU_DIR,
  ENTRIES,
  FILL_SCOPE,
  FILL_SEED,
  URB_TIMEOUT_MS,
  announceSkip,
  scratchFile,
} from '../emulator/suite.js';
import {
  CHIMERA_JEDEC,
  MODERN_SUBJECTS,
  entryFor,
  type ModernSubject,
} from './corpus-modern-run.js';

const FLASH_BASE = 0x14000000;
const BANK_OFFSET: Readonly<Record<'b' | 'r', number>> = {
  b: 0x14050000 - FLASH_BASE,
  r: 0x14070000 - FLASH_BASE,
};
const CFG_OFFSET = 0x14010000 - FLASH_BASE;
/** cfg[0] the 4.x bootloader reads as "prefer B, then A, then recovery" (1) and "prefer recovery" (2). */
const CFG0_PREFERS: Readonly<Record<'b' | 'r', number>> = { b: 1, r: 2 };

/** The running build string with its last letter or digit moved one on, in the image (same length). */
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

interface Session {
  readonly row: RowEmulators;
  readonly transport: WebUsbTransport;
  readonly ctx: WorkflowContext;
  readonly truth: Uint8Array;
  readonly report: SlotsReport;
}

/** Boot the subject's own dump (or chimera) and read what the page reads. */
async function openSession(
  entryId: string,
  donor: string | null,
  truthPath: string,
): Promise<Session> {
  const row = new RowEmulators(entryId);
  const emu = await row.start(EMU_DIR!, {
    entryId,
    fillSeed: FILL_SEED,
    fillScope: FILL_SCOPE,
    flashOut: truthPath,
    readyTimeoutMs: BOOT_TIMEOUT_MS,
    ...(donor === null ? {} : { donor, jedec: CHIMERA_JEDEC }),
  });
  const adapter = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
  const transport = new WebUsbTransport(adapter, {
    recipient: 'auto',
    api: 'usbip (emulator)',
    host: 'vitest',
    clock: adapter.deadlineClock,
  });
  await transport.open();
  const device = new SeekDevice(transport, { reporter: silentReporter });
  const profile = detectProfile(evidenceFromChannelProbe(await probeSelectorChannel(device))).best
    .profile;
  const ctx: WorkflowContext = { device, profile, detection: null, reporter: silentReporter };
  const truth = new Uint8Array(readFileSync(truthPath));
  const report = await inspectSlots(ctx);
  return { row, transport, ctx, truth, report };
}

/**
 * Boot a flash image whose boot configuration prefers the bank it was crafted for, and return the
 * build string the camera reports. Its own emulator, stopped before this returns.
 */
async function bootPreferring(
  flash: Uint8Array,
  name: string,
  donor: string | null,
): Promise<string | null> {
  const path = scratchFile(`accept-${name.replace(/[^\w.-]+/g, '_')}.bin`);
  writeFileSync(path, flash);
  const row = new RowEmulators(`accept ${name}`);
  const emu = await row.start(EMU_DIR!, {
    entryId: `flash:${name}`,
    readyTimeoutMs: BOOT_TIMEOUT_MS,
    flashOverride: path,
    ...(donor === null ? {} : { jedec: CHIMERA_JEDEC }),
  });
  const adapter = await emu.attach({ urbTimeoutMs: URB_TIMEOUT_MS });
  const transport = new WebUsbTransport(adapter, {
    recipient: 'auto',
    api: 'usbip (emulator)',
    host: 'vitest',
    clock: adapter.deadlineClock,
  });
  await transport.open();
  const device = new SeekDevice(transport, { reporter: silentReporter });
  const profile = detectProfile(evidenceFromChannelProbe(await probeSelectorChannel(device))).best
    .profile;
  const ctx: WorkflowContext = { device, profile, detection: null, reporter: silentReporter };
  const report = await inspectSlots(ctx);
  await transport.close();
  await transport.close();
  await row.finish();
  return report.state.buildString;
}

/** The flash the emulator booted, with bank B or R replaced and the boot config preferring it. */
function craftFlash(truth: Uint8Array, bank: 'b' | 'r', raw: Uint8Array): Uint8Array {
  const flash = new Uint8Array(truth);
  flash.set(raw, BANK_OFFSET[bank]);
  new DataView(flash.buffer, flash.byteOffset, flash.byteLength).setUint32(
    CFG_OFFSET,
    CFG0_PREFERS[bank],
    true,
  );
  return flash;
}

/** Write `bank` from `image` through `kind`, read it back, and return the crafted flash. */
async function writeAndCraft(
  session: Session,
  bank: 'b' | 'r',
  image: Uint8Array,
  raw: boolean,
): Promise<Uint8Array> {
  const { report, ctx } = session;
  const booted: SlotKey | null = report.state.boot?.booted ?? null;
  const plan = raw
    ? prepareSlotFlash(report, bank, { kind: 'raw', bytes: image, fileName: 'raw.bin' })
    : prepareSlotFlash(report, bank, { kind: 'plain', bytes: image, fileName: 'image.bin' });
  await flashSlot(ctx, report, plan, {
    /* Recovery is written only with the acknowledgement; the booted bank needs it too. */
    acknowledgeRisk: bank === 'r' || booted === null || booted === bank,
    verify: false,
  });
  const after = await dumpSlot(ctx, report, bank);
  return craftFlash(session.truth, bank, after.raw);
}

/** A test's own emulator is always stopped, whatever the check did. */
async function closeSession(session: Session): Promise<void> {
  await session.transport.close();
  await session.row.finish();
}

const SUBJECT_LABELS = [
  'Mosaic 10.9.1.31 dump',
  'Compact 4.8.2.1 dump',
  'Compact FF 4.16.1.7 image (on 4.8.2.1)',
];

const SUBJECTS: readonly ModernSubject[] = MODERN_SUBJECTS.filter((s) =>
  SUBJECT_LABELS.includes(s.label),
);

if (EMU_DIR === null) announceSkip('the bootloader acceptance of slot writes');

describe.skipIf(EMU_DIR === null)(
  'the bootloader accepts what the slot page writes (emulator)',
  () => {
    for (const subject of SUBJECTS) {
      const entry = entryFor(subject, ENTRIES);
      const donor = entry?.kind === 'image-only' ? (entry.donor?.id ?? null) : null;

      it(
        `${subject.label}: the derivation is stated, and a refusal is pinned`,
        { timeout: 900_000 },
        async () => {
          expect(entry, `no entry for ${subject.label}`).not.toBeNull();
          const session = await openSession(
            entry!.id,
            donor,
            scratchFile(`accept-truth-${subject.label.replace(/[^\w]+/g, '_')}.bin`),
          );
          try {
            const gate =
              cameraWriteRefusal(session.report.state) ??
              deriveWriteKeys(session.report.state).refusal;
            if (subject.label.startsWith('Compact FF 4.16.1.7')) {
              expect(gate, 'the 4.16.1.7 build refuses the derived upload').toMatch(
                /checks an upload under its own keys/,
              );
            } else {
              expect(gate, `the page refuses this camera: ${gate ?? ''}`).toBeNull();
            }
          } finally {
            await closeSession(session);
          }
        },
      );

      if (subject.label.startsWith('Compact FF 4.16.1.7')) continue;

      it(
        `${subject.label}: the bootloader boots the bank the derived upload wrote, on B and on R`,
        { timeout: 1_200_000 },
        async () => {
          const session = await openSession(
            entry!.id,
            donor,
            scratchFile(`accept-truth-${subject.label.replace(/[^\w]+/g, '_')}.bin`),
          );
          const cipher = session.report.state.profile.cipher;
          const running = session.report.state.buildString ?? '';
          const results: string[] = [];
          try {
            for (const bank of ['b', 'r'] as const) {
              const dumped = await dumpSlot(session.ctx, session.report, bank);
              expect(dumped.plain, `bank ${bank.toUpperCase()} holds an image`).not.toBeNull();
              const mark = marked(dumped.plain!, running);
              expect(mark, 'the running build string is in the image').not.toBeNull();
              const image = setAcceptSum(mark!.image, cipher).image;
              const crafted = await writeAndCraft(session, bank, image, false);
              const build = await bootPreferring(crafted, `${entry!.id}-${bank}-derived`, donor);
              results.push(`${bank.toUpperCase()} derived: boots ${JSON.stringify(build)}`);
              expect(
                build,
                `bank ${bank.toUpperCase()} is accepted (the marked build string boots)`,
              ).toBe(mark!.to);
            }
          } finally {
            await closeSession(session);
          }
          process.stderr.write(`[accept] ${subject.label}: ${results.join('; ')}\n`);
          expect(liveEmulatorCount()).toBe(0);
        },
      );
    }

    it('Mosaic 10.9.1.31 CONTROL: the upload the page sent before the derivation is not accepted on B', async () => {
      const subject = SUBJECTS.find((s) => s.label === 'Mosaic 10.9.1.31 dump')!;
      const entry = entryFor(subject, ENTRIES)!;
      const session = await openSession(
        entry.id,
        null,
        scratchFile('accept-truth-Mosaic_10_9_1_31_dump.bin'),
      );
      try {
        const keyTable = session.report.state.keyTable!;
        const cipher = session.report.state.profile.cipher;
        const dumped = await dumpSlot(session.ctx, session.report, 'b');
        const mark = marked(dumped.plain!, session.report.state.buildString ?? '');
        expect(mark).not.toBeNull();
        const image = setAcceptSum(mark!.image, cipher).image;
        /* The pre-derivation upload: the image under the bootloader's Key A, padded and footered. */
        const payload = buildBankPayload(image, keyTable.keyA, null, cipher).payload;
        const crafted = await writeAndCraft(session, 'b', payload, true);
        const build = await bootPreferring(crafted, 'Mosaic-control-classic', null);
        process.stderr.write(
          `[accept] Mosaic 10.9.1.31 control (pre-derivation upload): boots ${JSON.stringify(build)}\n`,
        );
        expect(
          build,
          'the pre-derivation upload is NOT accepted: the camera boots its old bank A',
        ).not.toBe(mark!.to);
      } finally {
        await closeSession(session);
      }
    }, 1_200_000);
  },
);
