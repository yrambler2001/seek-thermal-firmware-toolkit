/**
 * The camera-backed commands, driven against core's own fake transport.
 *
 * Nothing here needs hardware: `fakeCamera` answers the same vendor requests a
 * real camera does, and the flash it serves is built by `buildSyntheticFlash`
 * out of core's cipher — so the dump, the decrypt stage and the analysis all
 * have something real to work on.
 */

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { OP, READ_ONLY_OPS, modern4x } from '@seek-fw/core';
import { run } from '../src/cli.js';
import { EXIT_CANCELLED, EXIT_FAILED, EXIT_OK } from '../src/errors.js';
import { MemorySink } from '../src/sink.js';
import {
  FLASH_BASE,
  buildSyntheticFlash,
  cameraWithFlash,
  compactPro1030Camera,
  fixedBackend,
  runningBuildBlock,
  slotOffsetOf,
  tempDir,
  testIo,
  type SyntheticFlash,
} from './helpers.js';

let dir = '';
let cleanup: () => Promise<void> = (): Promise<void> => Promise.resolve();
let synthetic: SyntheticFlash;

beforeEach(async () => {
  const temp = await tempDir();
  dir = temp.path;
  cleanup = temp.cleanup;
  synthetic = buildSyntheticFlash();
});
afterEach(async () => {
  await cleanup();
});

function signal(): AbortSignal {
  return new AbortController().signal;
}

describe('seek-fw info --devices', () => {
  it('says so, and exits 0, when nothing is attached', async () => {
    const { io, stdout } = testIo({ backend: fixedBackend([]) });
    const code = await run(['info', '--devices'], io, signal());
    expect(code).toBe(EXIT_OK);
    expect(stdout.text).toContain('no Seek camera found');
    /* The Linux hint, because an attached camera can be invisible there. */
    expect(stdout.text).toContain('70-seek-thermal.rules');
  });

  it('lists what it found', async () => {
    const camera = cameraWithFlash(synthetic.flash);
    const { io, stdout } = testIo({ backend: fixedBackend([camera]) });
    const code = await run(['info', '--devices'], io, signal());
    expect(code).toBe(EXIT_OK);
    expect(stdout.text).toContain('0x289d');
    expect(stdout.text).toContain('Seek Thermal Compact PRO');
  });

  it('describes them as JSON', async () => {
    const camera = cameraWithFlash(synthetic.flash);
    const { io, stdout } = testIo({ backend: fixedBackend([camera]) });
    await run(['info', '--devices', '--json'], io, signal());
    expect(JSON.parse(stdout.text)).toMatchObject({
      command: 'info',
      ok: true,
      count: 1,
      devices: [{ vendorId: '0x289d', productName: 'Seek Thermal Compact PRO' }],
    });
  });
});

describe('seek-fw info', () => {
  it('reports the firmware, the slots, the keys and the boot config', async () => {
    const camera = cameraWithFlash(synthetic.flash);
    const { io, stdout } = testIo({ backend: fixedBackend([camera]) });
    const code = await run(['info'], io, signal());

    expect(code).toBe(EXIT_OK);
    expect(stdout.text).toContain('Slots');
    expect(stdout.text).toContain('0x14030000');
    expect(stdout.text).toContain('Key A');
    /* Detection, from evidence the read itself produced. */
    expect(stdout.text).toContain('modern-4x');
    /* The tab map, so the Info command says what each tab does. */
    expect(stdout.text).toContain('Tabs');
    expect(stdout.text).toContain('Dump & decrypt 4.x/Nano');
    expect(stdout.text).toContain('seek-fw decrypt file|slot');
  });

  it('is read-only: no write opcode is ever sent', async () => {
    const camera = cameraWithFlash(synthetic.flash);
    const { io } = testIo({ backend: fixedBackend([camera]) });
    await run(['info'], io, signal());
    const sent = new Set(camera.calls.map((call) => call.op));
    expect(sent.has(OP.SET_FEATURED_FIRMWARE_DATA)).toBe(false);
    expect(sent.has(OP.COMPLETE_MEMORY_UPGRADE)).toBe(false);
  });

  it('serialises the whole analysis under --json', async () => {
    const camera = cameraWithFlash(synthetic.flash);
    const { io, stdout } = testIo({ backend: fixedBackend([camera]) });
    const code = await run(['info', '--json', '--profile', 'modern-4x'], io, signal());
    expect(code).toBe(EXIT_OK);
    const parsed = JSON.parse(stdout.text) as {
      ok: boolean;
      canFlash: boolean;
      keys: { keyA: string | null };
      slots: { name: string; bootable: boolean; accepts: boolean; footerOk: boolean | null }[];
      boot: { booted: string | null; upgradeTarget: string | null };
    };
    expect(parsed.ok).toBe(true);
    expect(parsed.keys.keyA).toBe('f32ad7715c0e9942ab13776008c431de');
    expect(JSON.parse(stdout.text)).toMatchObject({
      tabs: expect.arrayContaining([
        expect.objectContaining({ command: 'seek-fw slots' }),
      ]) as unknown,
    });
    expect(parsed.boot).toMatchObject({ booted: 'a', upgradeTarget: 'b' });
    /* 4.x checks the footer: a bootable bank has one, so footerOk is a real answer here */
    expect(parsed.slots[0]).toMatchObject({ accepts: true, bootable: true, footerOk: true });
    expect(parsed.canFlash).toBe(true);
  });

  it('refuses to flash under the generic fallback, and says why', async () => {
    const camera = cameraWithFlash(synthetic.flash);
    const { io, stdout } = testIo({ backend: fixedBackend([camera]) });
    await run(['info', '--json', '--profile', 'generic'], io, signal());
    const parsed = JSON.parse(stdout.text) as { canFlash: boolean; flashBlockedBy: string[] };
    expect(parsed.canFlash).toBe(false);
    expect(parsed.flashBlockedBy.join(' ')).toContain('does not support flashing');
  });
});

describe('seek-fw info: the upgrade target when it is the bank the camera booted from (TESTING.md 42.50)', () => {
  /* A 4.x camera whose boot-config word is 1 (prefer B) with both banks holding the same bootable
   * image, and its active-slot word 0. The replay boots B and predicts A as the target; the active-slot
   * word names B, and the upgrade selector's window cannot overrule it because A and B are identical.
   * On the bench's Compact 4.8.2.1 the same pair appears with words 1 and 2 (42.50). */
  function sameBankCamera(
    cfg0: number,
    activeSlotWord: number,
  ): ReturnType<typeof cameraWithFlash> {
    const flash = new Uint8Array(synthetic.flash);
    new DataView(flash.buffer).setUint32(modern4x.memory.bootConfigBase - FLASH_BASE, cfg0, true);
    flash.set(synthetic.bank, slotOffsetOf('b'));
    const roots = new Uint8Array(64);
    new DataView(roots.buffer).setUint32(8, activeSlotWord, true);
    return cameraWithFlash(flash, {
      fwInfo: new Map([
        [0, runningBuildBlock()],
        [10, roots],
      ]),
    });
  }

  it('says so under the upgrade target, in the text and the JSON, and warns without blocking', async () => {
    const camera = sameBankCamera(1, 0);
    const { io, stdout } = testIo({ backend: fixedBackend([camera]) });
    expect(await run(['info'], io, signal())).toBe(EXIT_OK);
    expect(stdout.text).toMatch(/upgrade target\s+Slot B/);
    expect(stdout.text).toContain('warning: ');
    expect(stdout.text).toContain('nothing here stops an upgrade');
    /* The warning is a line of information: the rest of the report is still printed. */
    expect(stdout.text).toContain('Writing');

    const again = sameBankCamera(1, 0);
    const json = testIo({ backend: fixedBackend([again]) });
    expect(await run(['info', '--json'], json.io, signal())).toBe(EXIT_OK);
    const boot = (JSON.parse(json.stdout.text) as { boot: Record<string, unknown> }).boot;
    expect(boot).toMatchObject({ booted: 'b', upgradeTarget: 'b', upgradeTargetBooted: true });
    expect(String(boot.upgradeTargetWarning)).toContain('nothing here stops an upgrade');
    /* Read-only, as every info run is: the warning changed nothing on the wire. */
    const sent = new Set(again.calls.map((call) => call.op));
    expect(sent.has(OP.COMPLETE_MEMORY_UPGRADE)).toBe(false);
    expect(sent.has(OP.SET_FEATURED_FIRMWARE_DATA)).toBe(false);
  });

  it('gives the replay line as a prediction, and names the target the camera confirms', async () => {
    const camera = sameBankCamera(1, 0);
    /* The run's log lines go to stdout, as `info` prints them. */
    const { io, stdout } = testIo({ backend: fixedBackend([camera]) });
    expect(await run(['info', '--verbose'], io, signal())).toBe(EXIT_OK);
    /* The replay predicts A (booted B is not booted A); the camera's word overrules it to B. */
    expect(stdout.text).toMatch(
      /boot config replay: booted Slot B, predicting Slot A as the upgrade target/,
    );
    expect(stdout.text).toMatch(/the camera's active-slot word says Slot B instead/);
    expect(stdout.text).toMatch(/an upgrade writes Slot B/);
    expect(stdout.text).not.toContain('so an upgrade would write');
  });

  it('does not warn when the upgrade target is the other bank', async () => {
    const { io, stdout } = testIo({ backend: fixedBackend([cameraWithFlash(synthetic.flash)]) });
    expect(await run(['info', '--json'], io, signal())).toBe(EXIT_OK);
    const boot = (JSON.parse(stdout.text) as { boot: Record<string, unknown> }).boot;
    expect(boot).toMatchObject({ booted: 'a', upgradeTarget: 'b', upgradeTargetBooted: false });
    expect(boot.upgradeTargetWarning).toBeNull();
    const text = testIo({ backend: fixedBackend([cameraWithFlash(synthetic.flash)]) });
    await run(['info'], text.io, signal());
    expect(text.stdout.text).not.toContain('warning: ');
  });
});

describe('seek-fw info: the upgrade target written while the camera runs recovery (TESTING.md 42.67)', () => {
  /* The 4.8.2.1 shape (TESTING.md 42.50): boot word 2 replays R, the active-slot word is 0, and A, B and R hold
   * the same bootable image, so the window cannot tell A from B and the word names B as the upgrade target. */
  function recoveryCamera(): ReturnType<typeof cameraWithFlash> {
    const flash = new Uint8Array(synthetic.flash);
    new DataView(flash.buffer).setUint32(modern4x.memory.bootConfigBase - FLASH_BASE, 2, true);
    flash.set(synthetic.bank, slotOffsetOf('b'));
    flash.set(synthetic.bank, slotOffsetOf('r'));
    const roots = new Uint8Array(64);
    new DataView(roots.buffer).setUint32(8, 0, true);
    return cameraWithFlash(flash, {
      fwInfo: new Map([
        [0, runningBuildBlock()],
        [10, roots],
      ]),
    });
  }

  it('says the camera runs recovery and its upgrade writes B, in the text and the JSON, without blocking', async () => {
    const camera = recoveryCamera();
    const { io, stdout } = testIo({ backend: fixedBackend([camera]) });
    expect(await run(['info'], io, signal())).toBe(EXIT_OK);
    expect(stdout.text).toMatch(/booted\s+Recovery/);
    expect(stdout.text).toMatch(/upgrade target\s+Slot B/);
    expect(stdout.text).toContain('warning: The camera is running its recovery bank');
    expect(stdout.text).toContain('its own upgrade writes Slot B, which it is not running');
    expect(stdout.text).toContain('Slot B holds the same bootable image as the bank it runs');
    expect(stdout.text).toContain('nothing here stops an upgrade');
    /* The warning is a line of information: the rest of the report is still printed. */
    expect(stdout.text).toContain('Writing');

    const again = recoveryCamera();
    const json = testIo({ backend: fixedBackend([again]) });
    expect(await run(['info', '--json'], json.io, signal())).toBe(EXIT_OK);
    const boot = (JSON.parse(json.stdout.text) as { boot: Record<string, unknown> }).boot;
    expect(boot).toMatchObject({
      booted: 'r',
      upgradeTarget: 'b',
      upgradeTargetBooted: false,
      upgradeTargetRecovery: true,
    });
    expect(String(boot.upgradeTargetWarning)).toContain('nothing here stops an upgrade');
    /* Read-only, as every info run is. */
    const sent = new Set(again.calls.map((call) => call.op));
    expect(sent.has(OP.COMPLETE_MEMORY_UPGRADE)).toBe(false);
    expect(sent.has(OP.SET_FEATURED_FIRMWARE_DATA)).toBe(false);
  });

  it('is not flagged as recovery when the same pair boots B (word 1), which is the booted-bank warning instead', async () => {
    const camera = sameBankCamera(1, 0);
    const json = testIo({ backend: fixedBackend([camera]) });
    expect(await run(['info', '--json'], json.io, signal())).toBe(EXIT_OK);
    const boot = (JSON.parse(json.stdout.text) as { boot: Record<string, unknown> }).boot;
    expect(boot).toMatchObject({
      booted: 'b',
      upgradeTarget: 'b',
      upgradeTargetBooted: true,
      upgradeTargetRecovery: false,
    });
  });

  function sameBankCamera(
    cfg0: number,
    activeSlotWord: number,
  ): ReturnType<typeof cameraWithFlash> {
    const flash = new Uint8Array(synthetic.flash);
    new DataView(flash.buffer).setUint32(modern4x.memory.bootConfigBase - FLASH_BASE, cfg0, true);
    flash.set(synthetic.bank, slotOffsetOf('b'));
    const roots = new Uint8Array(64);
    new DataView(roots.buffer).setUint32(8, activeSlotWord, true);
    return cameraWithFlash(flash, {
      fwInfo: new Map([
        [0, runningBuildBlock()],
        [10, roots],
      ]),
    });
  }
});

describe('seek-fw info on a 2016 Compact PRO (1.0.3.0)', () => {
  /* The probe's version picks compact-2016 before any slot is read (TESTING.md 42.84): the two profiles
   * share every selector, and under legacy-auth the first read reported every slot failing its 0xFFFF
   * target and was then redone (FINDINGS 2026-10-06). So the read is made once, under compact-2016. */
  it('judges the slots under compact-2016 from the first read, with nothing to re-read', async () => {
    const camera = compactPro1030Camera();
    const { io, stdout, stderr } = testIo({ backend: fixedBackend([camera]) });
    const code = await run(['info', '--json'], io, signal());

    expect(code).toBe(EXIT_OK);
    expect(stderr.text).not.toContain('re-reading under it');
    expect(stderr.text).not.toContain('acceptance FAILS');
    expect(stderr.text).not.toContain('flashing disabled');
    const parsed = JSON.parse(stdout.text) as {
      profile: { actedUnder: { id: string }; detected: { id: string; ambiguous: boolean } };
      firmware: { bootloaderVersion: string | null };
      slots: {
        accepts: boolean;
        footerOk: boolean | null;
        bootable: boolean;
        bootability: string;
      }[];
      canFlash: boolean;
      flashBlockedBy: string[];
    };
    expect(parsed.profile.actedUnder.id).toBe('compact-2016');
    expect(parsed.profile.detected).toMatchObject({ id: 'compact-2016', ambiguous: false });
    expect(parsed.firmware.bootloaderVersion).toBe('1.2.0.0');
    for (const slot of parsed.slots) {
      /* compact-2016's bootloader reads no footer, so footerOk is not applicable (null), not false */
      expect(slot).toMatchObject({
        accepts: true,
        footerOk: null,
        bootable: false,
        bootability: 'unknown',
      });
    }
    /* still read-only, for compact-2016's own reason */
    expect(parsed.canFlash).toBe(false);
    const blocked = parsed.flashBlockedBy.join(' ');
    expect(blocked).toContain("shares legacy-auth's locked BeginFirmwareUpgrade handler");
    expect(blocked).not.toContain('the evidence says');
    const sent = new Set(camera.calls.map((call) => call.op));
    expect(sent.has(OP.SET_FEATURED_FIRMWARE_DATA)).toBe(false);
    expect(sent.has(OP.COMPLETE_MEMORY_UPGRADE)).toBe(false);
  });

  it('says only what it knows about the store key, the footer and bootability', async () => {
    const { io, stdout } = testIo({ backend: fixedBackend([compactPro1030Camera()]) });
    expect(await run(['info'], io, signal())).toBe(EXIT_OK);
    const text = stdout.text;
    /* "Key B (no per-device key programmed)" was printed with Key B itself
     * "(not identified)" two lines up and the per-device slot never read. On this line the store key
     * is the key its bootloader checks a bank under, which this camera (no active-slot word) does not
     * name. */
    expect(text).toMatch(
      /store key\s+the key its bootloader checks a bank under \(not named on this read\): the application stores every bank it writes under that key/,
    );
    expect(text).toMatch(
      /check key\s+not named — the camera's active-slot word \(fw info roots, selector 10\) could not be read/,
    );
    expect(text).not.toContain('no per-device key programmed');
    /* the footer column says it does not apply; bootability says unknown */
    const row = text.split('\n').find((line) => line.startsWith('App image bank 0x14050000 '));
    expect(row).toMatch(/\byes\s+n\/a\s+unknown\b/);
  });
});

describe('seek-fw info on a 2016 Compact PRO that names the bank it entered (TESTING.md 42.84)', () => {
  /** The camera reports it entered slot A (active-slot word 0); its boot-config record is erased. */
  function namedCamera(): ReturnType<typeof compactPro1030Camera> {
    return compactPro1030Camera({ activeSlotWord: 0 });
  }

  it('prints the boot rows, the check key, and the Writing section the 2016 line has', async () => {
    const { io, stdout } = testIo({ backend: fixedBackend([namedCamera()]) });
    expect(await run(['info'], io, signal())).toBe(EXIT_OK);
    const text = stdout.text;
    expect(text).toMatch(/cfg\[0\]\s+0xFFFFFFFF — slot A first, then B, then recovery R/);
    /* The score is the one taken after the read, and says so: the page's log also prints the probe's
     * (TESTING.md 42.85 O5, 42.86). */
    expect(text).toMatch(
      /detected\s+compact-2016 \(score \d\.\d\d after the read, from the evidence below\)/,
    );
    expect(text).toMatch(
      /booted\s+App image bank 0x14050000 — the bank the bootloader entered at this start, as it records it \(active-slot word 0\)/,
    );
    expect(text).toMatch(
      /next start\s+App image bank 0x14050000 — the boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, and it holds an image the bootloader accepts/,
    );
    expect(text).toMatch(/check key\s+key block 1 [0-9a-f]{32}, named from slot A/);
    expect(text).toMatch(
      /key table\s+not read — the bootloader block \(0x14000000\) is refused on every channel on this line/,
    );
    expect(text).toMatch(
      /store key\s+key block 1: the application stores every bank it writes under the key its bootloader checks/,
    );
    expect(text).not.toMatch(/key A\s+\(not identified\)/);
    expect(text).toContain('one bank at a time — `seek-fw slots flash <a|b|r> <file>`');
    expect(text).toContain('a whole-image write is not available on this line');
    expect(text).not.toContain('not available for a whole-image write:');
    expect(text).not.toContain('flashing disabled');
    expect(text).not.toContain('not a boot record');
    const row = text.split('\n').find((line) => line.startsWith('App image bank 0x14050000 '));
    expect(row).toMatch(/key block 1\s+yes\s+n\/a\s+yes\b/);
  });

  it('carries the check key, the next start and the bank writes in --json', async () => {
    const { io, stdout } = testIo({ backend: fixedBackend([namedCamera()]) });
    expect(await run(['info', '--json'], io, signal())).toBe(EXIT_OK);
    const parsed = JSON.parse(stdout.text) as {
      boot: { booted: string; nextStart: { runs: string; why: string } | null };
      keys: { checkKey: { name: string; from: string; key: string } | null };
      bankWrites: { oneAtATime: boolean; refusedBy: string[] } | null;
      slots: { bootability: string; key_name: string }[];
    };
    expect(parsed.boot.booted).toBe('a');
    expect(parsed.boot.nextStart?.runs).toBe('a');
    expect(parsed.keys.checkKey).toMatchObject({ name: 'key block 1', from: 'a' });
    expect(parsed.keys.checkKey?.key).toMatch(/^[0-9a-f]{32}$/);
    expect(parsed.bankWrites).toEqual({ oneAtATime: true, refusedBy: [] });
    expect(parsed.slots.map((slot) => slot.bootability)).toEqual([
      'bootable',
      'bootable',
      'bootable',
    ]);
  });
});

describe('seek-fw dump on a 2016 Compact PRO (1.0.3.0)', () => {
  /* The 4.x and Nano command does not read the 0.x/1.x 2014–2017 line: that camera's flow is
   * `seek-fw preserve` (its tab). Refused before any read, and nothing is written. */
  it('refuses the camera, names the flow that reads it, and writes nothing', async () => {
    const camera = compactPro1030Camera();
    const out = join(dir, 'refused');
    const { io, stderr } = testIo({ backend: fixedBackend([camera]) });
    expect(await run(['dump', '--out', out], io, signal())).toBe(EXIT_FAILED);
    expect(stderr.text).toContain('a 0.x/1.x 2014–2017 build');
    expect(stderr.text).toContain('nothing was read but the version');
    expect(stderr.text).toContain('seek-fw preserve');
    await expect(readdir(out)).rejects.toThrow();
    for (const call of camera.calls) {
      expect(READ_ONLY_OPS.has(call.op as never), `opcode ${String(call.op)}`).toBe(true);
    }
  });

  it('still says what the camera answers as, under info', async () => {
    const { io, stdout } = testIo({ backend: fixedBackend([compactPro1030Camera()]) });
    expect(await run(['info', '--json'], io, signal())).toBe(EXIT_OK);
    expect(JSON.parse(stdout.text)).toMatchObject({
      profile: { detected: { id: 'compact-2016' } },
    });
  });
});

describe('seek-fw dump on a camera whose version the 0.x/1.x refusal lets through', () => {
  /* dump.ts refuses a version of 0.x or 1.x before any probe ("nothing was read but the version",
   * dump.ts:47). The profile check after the probe (dump.ts:58) is the other guard: a camera the
   * probe names as the 2014–2017 line is refused before anything is dumped. No 2014–2017 build
   * reports 2.x. The 2.0.0.0 below is this fake's version, chosen only to pass dump.ts:47, so the
   * probe's answers are what name the line. `--profile` is not accepted by `dump`. */
  it('refuses the line the probe names, and writes nothing', async () => {
    const version = new Uint8Array(36);
    version.set([2, 0, 0, 0], 0);
    const bootloader = new Uint8Array(36);
    bootloader.set([1, 2, 0, 0], 0);
    const camera = compactPro1030Camera({
      fwInfo: new Map([
        [0, version],
        [1, bootloader],
      ]),
    });
    const out = join(dir, 'probed');
    const { io, stderr } = testIo({ backend: fixedBackend([camera]) });
    expect(await run(['dump', '--out', out], io, signal())).toBe(EXIT_FAILED);

    expect(stderr.text).toContain('answers as Legacy locked firmware (legacy-auth)');
    expect(stderr.text).toContain('a camera of the 0.x/1.x 2014–2017 line');
    expect(stderr.text).toContain('nothing was dumped');
    expect(stderr.text).toContain('seek-fw preserve');
    await expect(readdir(out)).rejects.toThrow();
    for (const call of camera.calls) {
      expect(READ_ONLY_OPS.has(call.op as never), `opcode ${String(call.op)}`).toBe(true);
    }
  });
});

describe('seek-fw dump', () => {
  it('reads the whole flash, decrypts it and writes the archive', async () => {
    const camera = cameraWithFlash(synthetic.flash);
    const out = join(dir, 'dump');
    const { io, stdout } = testIo({ backend: fixedBackend([camera]) });
    const code = await run(['dump', '--out', out, '--chunk', '65536'], io, signal());

    expect(code).toBe(EXIT_OK);
    const files = (await readdir(out)).sort();
    expect(files).toContain('manifest.json');
    expect(files).toContain('README.md');
    expect(files).toContain('windows');
    expect(files).toContain('decrypted');
    expect(files).toContain('flash_4m_usb_partial_gap_ff.bin');

    /* The assembled image is the camera's flash, byte for byte, everywhere a
     * selector reaches. 0x14060000 has none and stays gap-filled. */
    const combined = await readFile(join(out, 'flash_4m_usb_partial_gap_ff.bin'));
    expect(combined.length).toBe(synthetic.flash.length);
    expect(new Uint8Array(combined.subarray(0, 0x60000))).toEqual(
      synthetic.flash.subarray(0, 0x60000),
    );

    const manifest = JSON.parse(await readFile(join(out, 'manifest.json'), 'utf8')) as {
      usbReadableWindows: number;
      decryption: { images?: unknown[] };
    };
    expect(manifest.usbReadableWindows).toBe(63);
    expect(manifest.decryption.images).toHaveLength(1);
    expect(stdout.text).toContain('63/63 windows');
  });

  it('never sends a write opcode', async () => {
    const camera = cameraWithFlash(synthetic.flash);
    const { io } = testIo({ backend: fixedBackend([camera]) });
    await run(['dump', '--out', join(dir, 'ro'), '--chunk', '65536'], io, signal());
    /* ASSERTED AGAINST `READ_ONLY_OPS` ITSELF, not a copy of it. The list used
     * to be written out here, so adding an opcode to the dump path failed this
     * test by one number and the fix looked like "add it to the list". Reading
     * the set means the only way to widen what a dump may send is to widen the
     * set, where `assertOpSetsDisjoint` and the comment above it are waiting. */
    for (const call of camera.calls) {
      expect(READ_ONLY_OPS.has(call.op as never), `opcode ${String(call.op)}`).toBe(true);
    }
    /* And the probe really did run: the version read is what lets the toolkit
     * refuse to arm a window on a build where 0x52 is EnterBootloaderMode. */
    expect(camera.calls.map((c) => c.op)).toContain(OP.GET_FIRMWARE_INFO);
  });

  it('saves the partial archive when interrupted, and still exits 130', async () => {
    const camera = cameraWithFlash(synthetic.flash);
    const controller = new AbortController();
    const out = join(dir, 'partial');

    /* Ctrl-C after a few windows: the sink pulls the trigger once the run has
     * logged its first reads. */
    const stdout = new AbortingSink(controller, 6);
    const { io } = testIo({ backend: fixedBackend([camera]), stdout });
    const code = await run(
      ['dump', '--out', out, '--chunk', '65536', '--verbose'],
      io,
      controller.signal,
    );

    expect(code).toBe(EXIT_CANCELLED);

    /* Core stops where it is and hands back everything it read, so a cancelled
     * dump is a COMPLETE archive describing a PARTIAL read — never silently
     * truncated output. */
    const written = await readdir(join(out, 'windows'));
    expect(written.length).toBeGreaterThan(0);
    expect(written.length).toBeLessThan(63);

    const files = (await readdir(out)).sort();
    expect(files).toContain('manifest.json');
    expect(files).toContain('README.md');
    expect(files).toContain('flash_4m_usb_partial_gap_ff.bin');

    const manifest = JSON.parse(await readFile(join(out, 'manifest.json'), 'utf8')) as {
      cancelled: boolean;
      usbReadableWindows: number;
      decryption: { attempted: boolean; reason?: string };
    };
    expect(manifest.cancelled).toBe(true);
    expect(manifest.usbReadableWindows).toBe(written.length);
    expect(manifest.decryption.attempted).toBe(false);
    expect(stdout.text).toContain('PARTIAL');
  });
});

describe('seek-fw dump --all-selectors', () => {
  it('probes every selector and reports what answered', async () => {
    const camera = cameraWithFlash(synthetic.flash);
    const out = join(dir, 'sweep');
    const { io, stdout } = testIo({ backend: fixedBackend([camera]) });
    const code = await run(
      ['dump', '--all-selectors', '--out', out, '--chunk', '65536'],
      io,
      signal(),
    );

    expect(code).toBe(EXIT_OK);
    const files = await readdir(out);
    expect(files).toContain('blocks');
    expect(files).toContain('manifest.json');
    expect(stdout.text).toMatch(/selector\(s\) armed/);
  });
});

describe('a camera that does not report its firmware version', () => {
  /* Command ids mean different things on different builds — on Compact 0.3.0.1
   * wire id 0x52, which arms a window, is EnterBootloaderMode — so until the
   * version is known only GetErrorCode, GetOperationMode and GetFirmwareInfo
   * may be sent, and a dump, a sweep or an analysis refuses rather than guess. */
  for (const argv of [
    ['dump'],
    ['dump', '--no-probe'],
    ['dump', '--all-selectors'],
    ['info'],
    ['info', '--profile', 'modern-4x'],
  ]) {
    it(`refuses \`seek-fw ${argv.join(' ')}\` and arms nothing`, async () => {
      const camera = cameraWithFlash(synthetic.flash, { fwInfo: new Map() });
      const { io, stderr } = testIo({ backend: fixedBackend([camera]) });
      const writes = argv[0] === 'dump' ? ['--out', join(dir, 'never')] : [];
      const code = await run([...argv, ...writes], io, signal());

      expect(code).toBe(EXIT_FAILED);
      expect(stderr.text).toContain('did not report its firmware version');
      expect(camera.calls.length).toBeGreaterThan(0);
      for (const call of camera.calls) {
        expect(call.direction, `op 0x${call.op.toString(16)}`).toBe('in');
        expect(
          [OP.GET_ERROR_CODE, OP.GET_OPERATION_MODE, OP.GET_FIRMWARE_INFO].includes(
            call.op as never,
          ),
          `op 0x${call.op.toString(16)}`,
        ).toBe(true);
      }
      await expect(readdir(join(dir, 'never'))).rejects.toThrow();
    });
  }
});

describe('failure reporting', () => {
  it('maps a missing camera onto a clear message and exit 1', async () => {
    const { io, stderr } = testIo({ backend: fixedBackend([]) });
    const code = await run(['dump'], io, signal());
    expect(code).toBe(EXIT_FAILED);
    expect(stderr.text).toContain('no Seek camera found');
    expect(stderr.text).toContain('70-seek-thermal.rules');
    expect(stderr.text).not.toContain('at Object.');
  });
});

/** A stdout sink that aborts the run once it has seen `after` writes. */
class AbortingSink extends MemorySink {
  private readonly controller: AbortController;
  private readonly after: number;
  private seen = 0;

  constructor(controller: AbortController, after: number) {
    super();
    this.controller = controller;
    this.after = after;
  }

  /**
   * Counts the lines that mean WINDOWS ARE BEING READ, not lines.
   *
   * It counted every chunk, which was the same thing while the first thing a
   * dump printed was a window. It is not any more: the capability probe logs
   * its four questions first, so a plain count fired before a single window had
   * been read and the "partial archive" under test had no windows in it at all.
   * Matching the window line keeps the test pinned to its own intent —
   * interrupt a dump that is under way — instead of to a line number.
   */
  override write(text: string): void {
    super.write(text);
    if (/0x14[0-9a-f]{6}/i.test(text)) this.seen++;
    if (this.seen >= this.after) this.controller.abort();
  }
}
