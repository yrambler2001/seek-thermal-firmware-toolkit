/* ====================================================================
 * The upgrade target of a 4.x camera, by boot-config word, on the emulator (TESTING.md 42.50).
 *
 * `readDeviceInfo` names the bank an upgrade writes (`boot.target` and the "Upgrade target" row).
 * On 4.x it starts from the boot-config replay (the bank the word boots,
 * and the other of A and B, or A for recovery), then the camera's own answers overrule it: the
 * active-slot word (roots[8]) when it names a bank, and the window the upgrade selector arms, when that
 * window matches exactly one of A and B.
 *
 * THE CAMERA'S OWN ANSWER is the destination BeginFirmwareUpgrade(0) computes, `fw_op_desc.dest`, which
 * is what `CompleteMemoryUpgrade` programs (seekemu/flash_rpc.py, `upgrade_phase`). A read-only probe on
 * the emulator measured it for each word (TESTING.md 42.50; the probe is not run by this suite): the
 * 4.8.2.1 Compact dump gives slot B for words 0, 1 and 2; the 4.9.1.15 Compact PRO dump gives B, B and A.
 * The `target` expectations below are those answers. On the 4.8.2.1 dump the three slots are identical,
 * so the window cannot read the target and the word decides it (`confirmed` null). The `booted` column is
 * the replay's answer, which this suite does not measure.
 *
 * SKIPS LOUDLY WITHOUT THE EMULATOR (SEEK_EMU_DIR), like every emulator suite.
 * ==================================================================== */

import { writeFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { collectingReporter, silentReporter } from '../../src/events.js';
import { detectProfile } from '../../src/profiles/registry.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { WebUsbTransport } from '../../src/protocol/webusb.js';
import type { SlotKey } from '../../src/profiles/types.js';
import {
  evidenceFromChannelProbe,
  probeSelectorChannel,
  readRunningFirmware,
} from '../../src/workflows/capability.js';
import { readDeviceInfo } from '../../src/workflows/device-info.js';
import type { DeviceState } from '../../src/workflows/types.js';
import { RowEmulators } from '../emulator/harness.js';
import {
  announceSkip,
  BOOT_TIMEOUT_MS,
  EMU_DIR,
  scratchFile,
  URB_TIMEOUT_MS,
} from '../emulator/suite.js';
import { corpusEntries, vendoredBytes, type CorpusEntry } from './corpus-locked-subjects.js';

const available = EMU_DIR !== null;
if (!available) announceSkip('the 4.x upgrade target by boot-config word');

/** cfg[0], the boot-config word at 0x14010000 (offset 0x10000 in the 4 MiB part). */
const CFG_OFFSET = 0x10000;
const TIMEOUT_MS = 300_000;

interface Row {
  /** cfg[0] the part is booted with. */
  readonly word: number;
  /** The bank the replay names as booted (the code's answer, not measured here). */
  readonly booted: SlotKey;
  /** The camera's own upgrade destination (TESTING.md 42.50), which the code must name. */
  readonly target: SlotKey;
  /** The bank the window confirmed, or null where the window cannot tell A from B. */
  readonly confirmed: SlotKey | null;
}

interface Subject {
  readonly label: string;
  /** The manifest id prefix of the full dump. */
  readonly prefix: string;
  readonly version: string;
  readonly rows: readonly Row[];
}

const SUBJECTS: readonly Subject[] = [
  {
    label: 'Compact 4.8.2.1 (the active-slot word is 0 on every boot)',
    prefix: 'compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/dump',
    version: '4.8.2.1',
    rows: [
      { word: 0, booted: 'a', target: 'b', confirmed: null },
      { word: 1, booted: 'b', target: 'b', confirmed: null },
      { word: 2, booted: 'r', target: 'b', confirmed: null },
    ],
  },
  {
    label: 'Compact PRO 4.9.1.15 (the active-slot word follows the boot)',
    prefix: 'compact_pro/2019.03.14-09.18.41-4.9.1.15/1C0EZ0KTAMA5/dump',
    version: '4.9.1.15',
    rows: [
      { word: 0, booted: 'a', target: 'b', confirmed: 'b' },
      { word: 1, booted: 'a', target: 'b', confirmed: 'b' },
      { word: 2, booted: 'r', target: 'a', confirmed: 'a' },
    ],
  },
];

/** Boots `entry` with cfg[0] set to `word` and reads the device info the way the page does. */
async function readBooted(entry: CorpusEntry, word: number): Promise<DeviceState> {
  const flash = vendoredBytes(entry);
  new DataView(flash.buffer, flash.byteOffset, flash.byteLength).setUint32(CFG_OFFSET, word, true);
  const file = scratchFile(`upgrade-target_${entry.version}_cfg${String(word)}.bin`);
  writeFileSync(file, flash);

  const label = `${entry.id}#cfg${String(word)}`;
  const row = new RowEmulators(label);
  const emu = await row.start(String(EMU_DIR), {
    entryId: label,
    readyTimeoutMs: BOOT_TIMEOUT_MS,
    flashOverride: file,
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
    expect(firmware.version, `${label}: the camera enumerates on its build`).toBe(entry.version);
    const profile = detectProfile(evidenceFromChannelProbe(await probeSelectorChannel(device))).best
      .profile;
    const reporter = collectingReporter();
    return await readDeviceInfo({ device, profile, detection: null, reporter }, { chunk: 4096 });
  } finally {
    await transport.close();
    await row.assertDelivery();
  }
}

describe.skipIf(!available)('the 4.x upgrade target, by boot-config word, on the emulator', () => {
  for (const subject of SUBJECTS) {
    describe(subject.label, () => {
      for (const row of subject.rows) {
        it(
          `cfg[0] ${String(row.word)}: the replay boots ${row.booted.toUpperCase()}, ` +
            `the upgrade target is ${row.target.toUpperCase()}`,
          async () => {
            const entry = corpusEntries().find((e) => e.id.startsWith(subject.prefix));
            expect(entry, `the corpus holds ${subject.prefix}`).toBeDefined();
            const state = await readBooted(entry!, row.word);

            expect(state.cfg0).toBe(row.word);
            expect(state.boot?.booted).toBe(row.booted);
            expect(state.targetConfirmed).toBe(row.confirmed);
            expect(state.boot?.target).toBe(row.target);
          },
          TIMEOUT_MS,
        );
      }
    });
  }
});
