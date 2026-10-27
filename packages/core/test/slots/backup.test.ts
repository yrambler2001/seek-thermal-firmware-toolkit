/* ==================================================================== *
 * The backup every bank write saves first (slots/backup.ts), the write that saves it
 * (`flashSlotWithBackup`), the copy and restore plans (slots/copy.ts, slots/restore.ts) and the
 * every-bank patch's order, with no camera: a recording device answers the version read, the
 * bank read and the write, and every call it gets is kept in order.
 * The same flows on the emulated cameras are in copy-restore.emulator.test.ts.
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { buildZip } from '../../src/archive/zip.js';
import { readZipEntries } from '../../src/archive/zip-read.js';
import { equalBytes, utf8, viewOf } from '../../src/bytes.js';
import { CHECK_ZERO_IDX, KNOWN_ZERO_IDX } from '../../src/crypto/recover.js';
import { SeekError } from '../../src/errors.js';
import { silentReporter } from '../../src/events.js';
import { setAcceptSum } from '../../src/image/bank.js';
import {
  ADJUST_OFFSET,
  HEADER_OFFSET,
  IMAGE_MAGIC,
  parseImageHeader,
} from '../../src/image/header.js';
import { getProfile } from '../../src/profiles/registry.js';
import type { FirmwareProfile, WindowEntry } from '../../src/profiles/types.js';
import type { SeekDevice } from '../../src/protocol/client.js';
import {
  backupName,
  backupPlanText,
  buildWriteBackup,
  saveBackupFirst,
  writeActionLabel,
  type WriteBackup,
} from '../../src/slots/backup.js';
import { buildSlotPlan } from '../../src/slots/capability.js';
import { copySourceRefusal, planSlotCopy } from '../../src/slots/copy.js';
import { everyBankBootedLast, everyBankWriteOrder } from '../../src/slots/fps-patch.js';
import {
  flashIdentityOf,
  fullFlashOf,
  planSlotRestore,
  restoreReadBack,
  restoreReadBackText,
} from '../../src/slots/restore.js';
import { onPlaintextChain } from '../../src/slots/running.js';
import {
  SLOT_BYTES,
  type DumpedSlot,
  type SlotKey,
  type SlotsReport,
} from '../../src/slots/types.js';
import { flashSlotWithBackup, prepareSlotFlash } from '../../src/slots/write.js';
import { sha256Sync } from '../../src/slots/write-sha.js';
import type { DeviceState, SlotState, WorkflowContext } from '../../src/workflows/types.js';
import { backupBankFiles } from './backup-files.js';
import { reportFor } from './write-fixtures.js';

const legacy = getProfile('legacy-auth');
const VERSION = '1.3.0.0';
const SERIAL = '101310HSNEA2';
const AT = new Date('2026-10-26T12:00:00.000Z');
const STAMP = '2026-10-26T12-00-00Z';

/* ---- fixtures ------------------------------------------------------------------------- */

/** A 1.3.0.0-shaped image the plain chain stores as it is: zero reserved vectors, a header, the line's sum. */
function plainImage(length: number, seed: number, version = 0x00000301): Uint8Array {
  const image = new Uint8Array(length);
  const dv = viewOf(image);
  dv.setUint32(0, 0x10004000, true);
  dv.setUint32(4, 0x14050201, true);
  const zero = new Set<number>([...KNOWN_ZERO_IDX, CHECK_ZERO_IDX]);
  for (let index = 2; index < 64; index++) {
    if (zero.has(index)) continue;
    dv.setUint32(4 * index, (0x14051000 + index * 4) >>> 0, true);
  }
  for (let offset = 0x400; offset < length; offset += 4) {
    dv.setUint32(offset, (offset * 2654435761 + seed) >>> 0, true);
  }
  dv.setUint32(HEADER_OFFSET + 0, IMAGE_MAGIC, true);
  dv.setUint32(HEADER_OFFSET + 4, length, true);
  dv.setUint32(HEADER_OFFSET + 8, 0x2a01, true);
  dv.setUint32(HEADER_OFFSET + 12, version, true);
  dv.setUint32(HEADER_OFFSET + 16, 0x14050201, true);
  dv.setUint32(ADJUST_OFFSET, 0, true);
  /* The plain chain's stored words sum to 0 (the 2014 bootloader's check). */
  return setAcceptSum(image, { ...legacy.cipher, acceptanceSum: 0 }).image;
}

/** The bank as the plain chain stores the image: the image, then 0xFF to 64 KiB. */
function bankOf(image: Uint8Array | null): Uint8Array {
  const bank = new Uint8Array(SLOT_BYTES).fill(0xff);
  if (image !== null) bank.set(image, 0);
  return bank;
}

function slotState(key: SlotKey, image: Uint8Array | null): SlotState {
  const raw = bankOf(image);
  return {
    key,
    name: `slot ${key}`,
    subcmd: null,
    address: 0,
    present: image !== null,
    reason: image === null ? 'erased' : null,
    unread: false,
    blank: image === null,
    header: image === null ? null : parseImageHeader(image),
    raw,
    footer: null,
    recovered: null,
    plain: image,
    plainHeader: image === null ? null : parseImageHeader(image),
    accepts: image !== null,
    footerOk: false,
    sha256: image === null ? null : sha256Sync(image),
    keyName: null,
    bootable: image !== null,
    bootability: image === null ? 'not-bootable' : 'bootable',
  } as unknown as SlotState;
}

function stateFor(
  profile: FirmwareProfile,
  slots: readonly SlotState[],
  options: { booted?: SlotKey | null; serial?: string | null } = {},
): DeviceState {
  const booted = options.booted === undefined ? 'a' : options.booted;
  return {
    version: VERSION,
    serial: options.serial === undefined ? SERIAL : options.serial,
    profile,
    slots,
    byKey: new Map(slots.map((slot) => [slot.key, slot])),
    boot: booted === null ? null : { booted, target: booted === 'a' ? 'b' : 'a' },
    keyTable: null,
    keyWhiteningK: profile.cipher.whiteningK,
    storeKey: { name: 'Key B', key: null, programmed: false },
    deviceKeySlot: null,
    bankWriteRefusals: [],
    plainChain: onPlaintextChain(profile, VERSION),
  } as unknown as DeviceState;
}

const IMAGE_A = plainImage(0x2000, 1);
const IMAGE_R = plainImage(0x2000, 3);

function report(
  images: Partial<Record<SlotKey, Uint8Array | null>> = { a: IMAGE_A, b: null, r: IMAGE_R },
  options: { booted?: SlotKey | null; serial?: string | null } = {},
): SlotsReport {
  const slots = (['a', 'b', 'r'] as const).map((key) => slotState(key, images[key] ?? null));
  return reportFor(stateFor(legacy, slots, options), buildSlotPlan(legacy, VERSION));
}

/** A recording camera: the version read, each bank's read (or a failure), and the write. */
interface Recorder {
  readonly device: SeekDevice;
  readonly calls: string[];
}

function recordingCamera(banks: Partial<Record<number, Uint8Array | Error>>): Recorder {
  const calls: string[] = [];
  let armed: number | null = null;
  let staged = 0;
  const device = {
    transport: {
      isOpen: true,
      open: () => Promise.resolve(),
      close: () => Promise.resolve(),
      info: { recipientFallback: null },
    },
    rpcIn: () => {
      calls.push('version');
      const answer = new Uint8Array(36);
      answer.set([1, 3, 0, 0]);
      return Promise.resolve(answer);
    },
    readWindow: (entry: WindowEntry) => {
      calls.push(`read ${entry.subcmd.toString(16)}`);
      const bank = banks[entry.subcmd];
      if (bank instanceof Error) return Promise.reject(bank);
      const data = bank ?? new Uint8Array(SLOT_BYTES).fill(0xff);
      return Promise.resolve({ data, stoppedAt: data.length, stopReason: null, chunkUsed: 64 });
    },
    armWindow: (entry: WindowEntry) => {
      armed = entry.subcmd;
      calls.push(`arm ${entry.subcmd.toString(16)}`);
      return Promise.resolve();
    },
    setFeaturedFirmwareData: (data: Uint8Array) => {
      staged += data.length;
      if (!calls.includes('stage')) calls.push('stage');
      return Promise.resolve();
    },
    getErrorCode: () => Promise.resolve(0),
    completeMemoryUpgrade: () => {
      calls.push(`commit ${String(armed)} after ${String(staged)} B`);
      return Promise.resolve();
    },
  } as unknown as SeekDevice;
  return { device, calls };
}

function ctxOf(device: SeekDevice): WorkflowContext {
  return { device, profile: legacy, detection: null, reporter: silentReporter };
}

function subcmdOf(rep: SlotsReport, key: SlotKey): number {
  const read = rep.plan.slots.find((slot) => slot.key === key)?.read;
  if (read == null) throw new Error(`no read window for ${key}`);
  return read.subcmd;
}

function dumpedOf(key: SlotKey, image: Uint8Array | null, empty = false): DumpedSlot {
  const raw = bankOf(image);
  return {
    key,
    address: 0x14050000,
    raw,
    sha256: sha256Sync(raw),
    empty,
    plain: image,
    plainSha256: image === null ? null : sha256Sync(image),
    notes: empty ? ['empty, nothing to decrypt'] : [],
  };
}

/* ---- the name ------------------------------------------------------------------------- */

describe('the backup zip’s name', () => {
  it('reads time, serial, firmware, bank and action, as the page’s other zips are stamped', () => {
    expect(
      backupName({
        stamp: STAMP,
        serial: '090BB12PR939',
        firmware: '1.0.3.0',
        keys: ['a'],
        action: { kind: 'fps-patch' },
      }),
    ).toBe('seek_backup_2026-10-26T12-00-00Z_090BB12PR939_v1.0.3.0_bank-A_before-fps-patch');
  });

  it('names each write by what it is, and joins the banks of one zip', () => {
    expect(writeActionLabel({ kind: 'flash', input: 'plain', fileName: 'x.bin' })).toBe(
      'before-flash',
    );
    expect(writeActionLabel({ kind: 'flash', input: 'raw', fileName: 'x.bin' })).toBe(
      'before-flash-raw',
    );
    expect(writeActionLabel({ kind: 'copy', from: 'b' })).toBe('before-copy-from-B');
    expect(writeActionLabel({ kind: 'restore', fileName: 'x.bin' })).toBe('before-restore');
    expect(
      backupName({
        stamp: STAMP,
        serial: null,
        firmware: null,
        keys: ['a', 'b', 'r'],
        action: { kind: 'fps-patch-every-bank' },
      }),
    ).toBe(
      'seek_backup_2026-10-26T12-00-00Z_unknown-serial_vunknown_bank-A-B-R_before-fps-patch-every-bank',
    );
    /* TESTING.md 42.96: the write order (B, R, A) does not change the name, so a plan shows the zip's own name. */
    expect(
      backupName({
        stamp: STAMP,
        serial: null,
        firmware: null,
        keys: ['b', 'r', 'a'],
        action: { kind: 'fps-patch-every-bank' },
      }),
    ).toContain('_bank-A-B-R_before-fps-patch-every-bank');
  });

  it('the plan names the zip with the time still to come, and what each bank gives', () => {
    const text = backupPlanText(report(), ['b'], { kind: 'copy', from: 'a' });
    expect(text).toContain(
      `seek_backup_<time>_${SERIAL}_v${VERSION}_bank-B_before-copy-from-A.zip`,
    );
    expect(text).toBe(
      'Before anything is written, Slot B (empty, every byte 0xFF: the zip says so, and the write ' +
        'overwrites no firmware) is read again and saved in one zip with a note of what each file is: ' +
        `seek_backup_<time>_${SERIAL}_v${VERSION}_bank-B_before-copy-from-A.zip.`,
    );
    expect(backupPlanText(report(), ['b', 'r', 'a'], { kind: 'fps-patch-every-bank' })).toContain(
      'Recovery R (as stored, and decrypted) and Slot A (as stored, and decrypted) are read again',
    );
  });
});

/* ---- the zip -------------------------------------------------------------------------- */

describe('the backup zip’s files', () => {
  it('holds each bank as stored and decrypted, and a text file with the camera, the write and every sha', () => {
    const rep = report();
    const backup = buildWriteBackup({
      report: rep,
      reads: [
        { key: 'a', dumped: dumpedOf('a', IMAGE_A), unreadWhy: null },
        { key: 'b', dumped: dumpedOf('b', null, true), unreadWhy: null },
        { key: 'r', dumped: null, unreadWhy: 'the read failed: stall' },
      ],
      action: { kind: 'fps-patch-every-bank' },
      follows: 'the frame-rate patch of every bank',
      at: AT,
    });
    expect(backup.fileName).toBe(
      `seek_backup_${STAMP}_${SERIAL}_v${VERSION}_bank-A-B-R_before-fps-patch-every-bank.zip`,
    );
    const names = readZipEntries(backup.zip).map((entry) => entry.name);
    const a = backupBankFiles(backup, 'a');
    const b = backupBankFiles(backup, 'b');
    expect(names.every((name) => name.startsWith(`${backup.name}/`))).toBe(true);
    expect(names).toContain(`${backup.name}/README.txt`);
    expect(a.raw).toEqual(bankOf(IMAGE_A));
    expect(a.plain).toEqual(IMAGE_A);
    expect(a.rawName).toMatch(/^seek-slot-a-1\.3\.0\.0-[0-9a-f]{8}\.bin$/);
    expect(a.plainName).toMatch(/^seek-slot-a-1\.3\.0\.0-[0-9a-f]{8}-decrypted\.bin$/);
    expect(b.raw).toEqual(new Uint8Array(SLOT_BYTES).fill(0xff));
    expect(b.plain).toBeNull();
    expect(backup.banks.map((bank) => bank.content)).toEqual(['image', 'empty', 'unread']);
    const text = a.text;
    expect(text).toContain(`serial ${SERIAL}, firmware ${VERSION}`);
    expect(text).toContain('write     : the frame-rate patch of every bank');
    expect(text).toContain(`saved at  : ${AT.toISOString()}`);
    expect(text).toContain(`sha256 ${sha256Sync(bankOf(IMAGE_A))}`);
    expect(text).toContain(`sha256 ${sha256Sync(IMAGE_A)}`);
    expect(text).toContain('Slot B at 0x14060000');
    expect(text).toContain('the bank is empty (every byte read as 0xFF)');
    expect(text).toContain('could not be read');
    expect(text).toContain('the read failed: stall');
    expect(text).not.toMatch(/slot-keystream|acknowledgeRisk|VERIFIED\(/);
  });

  it('a save that does not answer true, or throws, refuses the write', async () => {
    const backup = buildWriteBackup({
      report: report(),
      reads: [{ key: 'b', dumped: dumpedOf('b', null, true), unreadWhy: null }],
      action: { kind: 'copy', from: 'a' },
      follows: 'a copy',
      at: AT,
    });
    await expect(saveBackupFirst(backup, () => Promise.resolve(false))).rejects.toThrow(
      /was not saved, so nothing was written/,
    );
    await expect(
      saveBackupFirst(backup, () => Promise.reject(new Error('disk full'))),
    ).rejects.toThrow(/\(disk full\)/);
    await expect(saveBackupFirst(backup, () => Promise.resolve(true))).resolves.toBeUndefined();
  });
});

/* ---- the write that saves first ------------------------------------------------------- */

describe('flashSlotWithBackup', () => {
  const rep = report();
  const plan = prepareSlotFlash(rep, 'b', { kind: 'plain', bytes: IMAGE_A, fileName: 'a.bin' });
  const action = { kind: 'flash', input: 'plain', fileName: 'a.bin' } as const;

  it('reads the target, saves the zip, and only then stages and commits', async () => {
    const stored = plan.expectedStored ?? new Uint8Array(0);
    const camera = recordingCamera({ [subcmdOf(rep, 'b')]: stored });
    const order: string[] = [];
    const saved: WriteBackup[] = [];
    const commits: SlotKey[] = [];
    const done = await flashSlotWithBackup(ctxOf(camera.device), rep, plan, {
      acknowledgeRisk: false,
      action,
      now: () => AT,
      saveBackup: (backup) => {
        order.push(`save after ${String(camera.calls.length)} calls`);
        saved.push(backup);
        return Promise.resolve(true);
      },
      onCommit: (key) => {
        commits.push(key);
        /* Told before the commit goes out: the camera has not had it yet. */
        expect(camera.calls.some((call) => call.startsWith('commit'))).toBe(false);
        order.push(
          `commit ${key} after ${String(camera.calls.filter((c) => c === 'stage').length)} stage`,
        );
      },
    });
    expect(saved).toHaveLength(1);
    /* The version read and bank B's read, then the save, then the write: nothing staged before the save. */
    const b = subcmdOf(rep, 'b').toString(16);
    expect(camera.calls.slice(0, 3)).toEqual(['version', 'version', `read ${b}`]);
    expect(order[0]).toBe('save after 3 calls');
    expect(camera.calls.slice(3, 5)).toEqual([`arm ${b}`, 'stage']);
    expect(order[1]).toBe('commit b after 1 stage');
    expect(commits).toEqual(['b']);
    expect(done.backup.fileName).toBe(
      `seek_backup_${STAMP}_${SERIAL}_v${VERSION}_bank-B_before-flash.zip`,
    );
    expect(done.backup.text).toContain('"Flash decrypted image" of a.bin into Slot B');
    expect(done.written.verified).toBe(true);
  });

  /* TESTING.md 42.107: a commit the camera refuses (the 1.3.0.8 FF image on the 8 Hz build is planned to expect
   * it) says plainly that it refused, that nothing was written, and that the backup is kept. */
  it('a commit the camera refuses says so plainly, that nothing was written, and that the backup is kept', async () => {
    const camera = recordingCamera({});
    const device = camera.device as unknown as {
      completeMemoryUpgrade: () => Promise<void>;
      getErrorCode: () => Promise<number>;
    };
    const commit = device.completeMemoryUpgrade;
    let committed = false;
    device.completeMemoryUpgrade = () => {
      committed = true;
      return commit();
    };
    device.getErrorCode = () => Promise.resolve(committed ? 0x70100 : 0);
    const saved: WriteBackup[] = [];
    const error = await flashSlotWithBackup(ctxOf(camera.device), rep, plan, {
      acknowledgeRisk: false,
      action,
      now: () => AT,
      saveBackup: (backup) => {
        saved.push(backup);
        return Promise.resolve(true);
      },
    }).catch((caught: unknown) => caught);
    expect(saved).toHaveLength(1);
    expect(error).toBeInstanceOf(SeekError);
    const refusal = error as SeekError;
    expect(refusal.code).toBe('flash/commit');
    expect(refusal.deviceCode).toBe(0x70100);
    expect(refusal.message).toMatch(
      /^the camera refused the write to .*B at commit with 0x00070100: the image was refused by its acceptance check/,
    );
    expect(refusal.message).toContain(
      'Nothing was written; the bank is unchanged. Read the banks again before doing anything else. ' +
        'The backup saved before the write is kept: it holds the bank as it was.',
    );
    expect(refusal.message).not.toContain('CompleteMemoryUpgrade');
    expect(refusal.detail).toMatchObject({ dropAnalysis: true, backupKept: true });
  });

  it('a write that would be refused reads and saves nothing, and sends nothing', async () => {
    const camera = recordingCamera({});
    const booted = report({ a: IMAGE_A, b: null, r: IMAGE_R }, { booted: 'b' });
    const toBooted = prepareSlotFlash(booted, 'b', {
      kind: 'plain',
      bytes: IMAGE_A,
      fileName: 'a.bin',
    });
    let saves = 0;
    await expect(
      flashSlotWithBackup(ctxOf(camera.device), booted, toBooted, {
        acknowledgeRisk: false,
        action,
        saveBackup: () => {
          saves += 1;
          return Promise.resolve(true);
        },
      }),
    ).rejects.toThrow(SeekError);
    expect(saves).toBe(0);
    expect(camera.calls).toEqual([]);
  });

  it('a save that did not happen sends nothing to the bank', async () => {
    const camera = recordingCamera({});
    await expect(
      flashSlotWithBackup(ctxOf(camera.device), rep, plan, {
        acknowledgeRisk: false,
        action,
        saveBackup: () => Promise.resolve(false),
      }),
    ).rejects.toThrow(/was not saved/);
    expect(camera.calls.filter((call) => call === 'stage' || call.startsWith('commit'))).toEqual(
      [],
    );
  });

  it('an empty target is said in the zip, and a target whose read fails too: neither refuses the write', async () => {
    const empty = recordingCamera({});
    const saved: WriteBackup[] = [];
    await flashSlotWithBackup(ctxOf(empty.device), rep, plan, {
      acknowledgeRisk: false,
      action,
      saveBackup: (backup) => {
        saved.push(backup);
        return Promise.resolve(true);
      },
    });
    expect(saved[0]?.banks[0]?.content).toBe('empty');
    expect(saved[0]?.text).toContain('the bank is empty');

    const failing = recordingCamera({ [subcmdOf(rep, 'b')]: new Error('the pipe stalled') });
    const after: WriteBackup[] = [];
    const done = await flashSlotWithBackup(ctxOf(failing.device), rep, plan, {
      acknowledgeRisk: false,
      action,
      verify: false,
      saveBackup: (backup) => {
        after.push(backup);
        return Promise.resolve(true);
      },
    });
    expect(after[0]?.banks[0]?.content).toBe('unread');
    expect(after[0]?.text).toContain('the pipe stalled');
    expect(done.written.commitStatus).toBe(0);
  });
});

/* ---- copy ----------------------------------------------------------------------------- */

describe('planSlotCopy', () => {
  it('stages the source bank’s decrypted image for the target, as a decrypted-image write', () => {
    const rep = report();
    const copy = planSlotCopy(rep, 'a', 'b');
    expect(copy.plan.key).toBe('b');
    expect(copy.plan.kind).toBe('plain');
    expect(equalBytes(copy.plan.expectedPlain ?? new Uint8Array(0), IMAGE_A)).toBe(true);
    expect(copy.fileName).toMatch(/^seek-slot-a-.+-decrypted\.bin$/);
    expect(copy.plan.notes[0]?.text).toContain(
      "The image is Slot A's, as the slots read decrypted it",
    );
    expect(copy.source).toContain('Slot A at 0x14050000');
  });

  it('keeps the target’s own warnings: recovery R asks the acknowledgement', () => {
    const copy = planSlotCopy(report(), 'a', 'r');
    expect(copy.plan.warnings.join('\n')).toMatch(/Recovery R:/);
  });

  it('refuses a copy onto itself, and a source with no image to copy', () => {
    const rep = report();
    expect(() => planSlotCopy(rep, 'a', 'a')).toThrow(/not copied onto itself/);
    expect(copySourceRefusal(rep, 'b')).toBe('Slot B is empty: there is no image to copy');
    expect(() => planSlotCopy(rep, 'b', 'a')).toThrow(/Slot B is empty/);
    expect(copySourceRefusal(rep, 'a')).toBeNull();
  });
});

/* ---- restore -------------------------------------------------------------------------- */

/** A whole flash: the identity block of `serial`, and the banks given. */
function flashWith(
  serial: string | null,
  banks: Partial<Record<SlotKey, Uint8Array | null>>,
): Uint8Array {
  const flash = new Uint8Array(0x400000).fill(0xff);
  if (serial !== null) {
    const block = 0x20000;
    flash.set([0x00, 0x00, 0x31, 0xf7], block);
    [0x09, 0x0b, 0xe9, 0xb6, 0xd4, 0xe4].forEach((byte, index) => {
      flash[block + 4 + index * 2] = byte;
      flash[block + 5 + index * 2] = 0;
    });
    flash.set(utf8(serial), block + 16);
  }
  const at: Record<SlotKey, number> = { a: 0x50000, b: 0x60000, r: 0x70000 };
  for (const key of ['a', 'b', 'r'] as const) {
    const image = banks[key];
    if (image != null) flash.set(bankOf(image), at[key]);
  }
  return flash;
}

describe('restore from a full flash backup', () => {
  it('reads the identity block: the chip id and the serial', () => {
    expect(flashIdentityOf(flashWith('090BB12PR939', {}))).toEqual({
      serial: '090BB12PR939',
      chipId: '090BE9B6D4E4',
    });
    expect(flashIdentityOf(flashWith(null, {}))).toEqual({ serial: null, chipId: null });
  });

  it('refuses a file that is not a whole flash, and a ZIP that holds none', async () => {
    await expect(fullFlashOf(new Uint8Array(1000), 'x.bin')).rejects.toThrow(/is 1000 B/);
    const other = buildZip([{ name: 'run/README.md', data: utf8('hi') }]);
    await expect(fullFlashOf(other, 'run.zip')).rejects.toThrow(/holds no whole flash/);
  });

  it('takes the whole flash out of a Preserve run file', async () => {
    const flash = flashWith(SERIAL, { a: IMAGE_A });
    const zip = buildZip([
      { name: 'preserve_run.json', data: utf8('{}') },
      { name: '03-patch-dump/preserve_dump_original.bin', data: flash },
    ]);
    const backup = await fullFlashOf(zip, 'preserve-run.zip');
    expect(backup.from).toBe('preserve-run');
    expect(backup.entry).toBe('03-patch-dump/preserve_dump_original.bin');
    expect(equalBytes(backup.flash, flash)).toBe(true);
    expect(backup.identity.serial).toBe(SERIAL);
  });

  it('cuts the bank at its address, decrypts it and stages the image; this camera’s backup warns nothing', async () => {
    const rep = report({ a: IMAGE_A, b: null, r: IMAGE_R });
    const backup = await fullFlashOf(flashWith(SERIAL, { b: IMAGE_R }), 'whole.bin');
    const restore = await planSlotRestore(rep, 'b', backup);
    expect(equalBytes(restore.stored, bankOf(IMAGE_R))).toBe(true);
    expect(restore.decryption.key?.method).toBe('stored-plain');
    expect(equalBytes(restore.plan.expectedPlain ?? new Uint8Array(0), IMAGE_R)).toBe(true);
    expect(restore.sameCamera).toBe(true);
    expect(restore.plan.warnings).toEqual([]);
    expect(restore.plan.notes.map((note) => note.text).join('\n')).toContain(
      `names this camera (serial ${SERIAL})`,
    );
  });

  it('warns, and does not refuse, for another camera’s backup, one with no identity, and another firmware', async () => {
    const rep = report();
    const theirs = await planSlotRestore(
      rep,
      'b',
      await fullFlashOf(flashWith('0C21A1M5KP15', { b: IMAGE_R }), 'theirs.bin'),
    );
    expect(theirs.sameCamera).toBe(false);
    expect(theirs.plan.warnings[0]).toMatch(
      /looks like another camera's: .*0C21A1M5KP15.*101310HSNEA2/,
    );
    const nameless = await planSlotRestore(
      rep,
      'b',
      await fullFlashOf(flashWith(null, { b: IMAGE_R }), 'nameless.bin'),
    );
    expect(nameless.plan.warnings[0]).toMatch(/no identity block/);
    const older = await planSlotRestore(
      rep,
      'b',
      await fullFlashOf(flashWith(SERIAL, { b: plainImage(0x2000, 5, 0x00000201) }), 'old.bin'),
    );
    expect(older.plan.warnings.join('\n')).toMatch(
      /holds firmware 1\.2\.0\.0, and the camera runs 1\.3\.0\.0/,
    );
  });

  it('an empty bank in the backup cannot be restored by a write, and says so', async () => {
    const backup = await fullFlashOf(flashWith(SERIAL, { a: IMAGE_A }), 'whole.bin');
    await expect(planSlotRestore(report(), 'b', backup)).rejects.toThrow(
      /is empty: every byte is 0xFF.*cannot be restored by a write/,
    );
  });

  it('compares the read-back with the backup’s stored bank bytes', () => {
    const stored = bankOf(IMAGE_R);
    expect(restoreReadBack(stored, stored.slice())).toEqual({
      compared: true,
      equal: true,
      differing: 0,
      firstDiffering: null,
    });
    const other = stored.slice();
    other[0x1234] = (other[0x1234] ?? 0) ^ 0xff;
    const check = restoreReadBack(stored, other);
    expect(check).toMatchObject({ equal: false, differing: 1, firstDiffering: 0x1234 });
    expect(restoreReadBackText(check, 'Slot B')).toBe(
      "Slot B reads back different from the backup's stored bytes in 1 B (first at +0x1234).",
    );
    expect(restoreReadBack(stored, null).compared).toBe(false);
  });
});

/* ---- every bank ----------------------------------------------------------------------- */

describe('the every-bank patch’s order', () => {
  it('writes the banks the camera neither boots nor falls back to first, then R, then the booted bank', () => {
    expect(everyBankWriteOrder(report({}, { booted: 'a' }), ['a', 'b', 'r'])).toEqual([
      'b',
      'r',
      'a',
    ]);
    expect(everyBankWriteOrder(report({}, { booted: 'b' }), ['r', 'b', 'a'])).toEqual([
      'a',
      'r',
      'b',
    ]);
    expect(everyBankWriteOrder(report({}, { booted: null }), ['r', 'a', 'b'])).toEqual([
      'a',
      'b',
      'r',
    ]);
  });

  it('says the booted bank goes last only when it is written after another (TESTING.md 42.96)', () => {
    const bootsA = report({}, { booted: 'a' });
    expect(everyBankBootedLast(bootsA, ['b', 'r', 'a'])).toBe(true);
    /* The FF board's CLI run: R alone, with A and B patched already, was called "the bank the camera boots now". */
    expect(everyBankBootedLast(bootsA, ['r'])).toBe(false);
    expect(everyBankBootedLast(bootsA, ['b', 'r'])).toBe(false);
    expect(everyBankBootedLast(bootsA, ['a'])).toBe(false);
    expect(everyBankBootedLast(report({}, { booted: null }), ['a', 'b', 'r'])).toBe(false);
  });
});
