/* ====================================================================
 * An EMPTY bank, offline: what the plan says, how the reader names it, what a dump
 * of it returns, and that a write into it is built and sent exactly like a write
 * into a used bank.
 *
 * "Empty" is a bank whose image-header window reads as all 0xFF. The pure halves
 * are pinned here (plan, join, dump over a fake camera, payload builders, the
 * send sequence); the real firmware's behaviour on erased banks is
 * empty-bank.emulator.test.ts.
 *
 * THE 2016 VERDICT. A reader once noticed that the 2016 staging form is built from
 * the IMAGE's own key block 0 (`stageKeyBlockOf`), not from anything read off the
 * target bank, which would make the old capability note ("the keystream is
 * recovered from a readable copy of THIS bank, so a bank that cannot be read cannot
 * be written") stale. The payload tests below hold the code to that: the same image
 * into a used bank and into an empty one stages the SAME bytes on every family.
 * ==================================================================== */

import { createHash } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

import { equalBytes, hexToBytes } from '../../src/bytes.js';
import { cryptBytes } from '../../src/crypto/cipher.js';
import { keyFilenameSuffix, stateFromKey } from '../../src/crypto/keys.js';
import { CHECK_ZERO_IDX, KNOWN_ZERO_IDX } from '../../src/crypto/recover.js';
import { setAcceptSum } from '../../src/image/bank.js';
import { SeekError } from '../../src/errors.js';
import { collectingReporter, silentReporter, type LogEvent } from '../../src/events.js';
import {
  FOOTER_SIZE,
  FOOTER_TAG,
  IMAGE_MAGIC,
  LENGTH_OFFSET,
  parseFooter,
} from '../../src/image/header.js';
import { KEY_PAIRS } from '../../src/preservation/patch.js';
import { compact2014 } from '../../src/profiles/compact-2014.js';
import { compact2016 } from '../../src/profiles/compact-2016.js';
import { generic } from '../../src/profiles/generic.js';
import { legacyAuth } from '../../src/profiles/legacy-auth.js';
import { modern4x } from '../../src/profiles/modern-4x.js';
import { unsupported, type FirmwareProfile, type WindowEntry } from '../../src/profiles/types.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { isReadOnlyOp } from '../../src/protocol/ops.js';
import { UNVERIFIED_STAGING_REASON } from '../../src/slots/capability-family.js';
import { buildSlotPlan } from '../../src/slots/capability.js';
import { bankNotes, stagingNote } from '../../src/slots/capability-notes.js';
import { dumpSlot } from '../../src/slots/dump.js';
import { inspectSlots, joinSlotViews, slotContentOf } from '../../src/slots/inspect.js';
import {
  SLOT_BYTES,
  type SlotEntry,
  type SlotKey,
  type SlotPlan,
  type SlotsReport,
} from '../../src/slots/types.js';
import { onPlaintextChain } from '../../src/slots/running.js';
import { flashSlot, prepareSlotFlash } from '../../src/slots/write.js';
import type * as DeviceInfo from '../../src/workflows/device-info.js';
import { readDeviceInfo } from '../../src/workflows/device-info.js';
import type { DeviceState, SlotState, WorkflowContext } from '../../src/workflows/types.js';
import { fakeCamera, patternFlash } from '../fake-transport.js';
import { reportFor } from './write-fixtures.js';

/* readDeviceInfo is the real one, except in the one test that hands `inspectSlots`
 * an analysis with an erased bank (a fake camera cannot serve a whole readable
 * 2014 part). The other tests never call it. */
vi.mock('../../src/workflows/device-info.js', async (importOriginal) => {
  const actual = await importOriginal<typeof DeviceInfo>();
  return { ...actual, readDeviceInfo: vi.fn(actual.readDeviceInfo) };
});

/* ---- fixtures ------------------------------------------------------------ */

const BLANK_REASON = 'no image header (magic 0xFFFFFFFF)';

function slotState(overrides: Partial<SlotState> & { key: SlotKey }): SlotState {
  return {
    name: `slot ${overrides.key}`,
    subcmd: null,
    address: 0,
    present: false,
    reason: null,
    unread: false,
    header: null,
    raw: null,
    footer: null,
    recovered: null,
    plain: null,
    plainHeader: null,
    accepts: false,
    footerOk: false,
    sha256: null,
    keyName: null,
    bootable: false,
    bootability: 'not-bootable',
    ...overrides,
  };
}

/** A bank the read found erased: a clean read, no image, `blank` set. */
const emptyBank = (key: SlotKey): SlotState =>
  slotState({ key, present: false, blank: true, reason: BLANK_REASON });

/** A bank holding an image the writer may treat as used. */
const usedBank = (key: SlotKey, overrides: Partial<SlotState> = {}): SlotState =>
  slotState({ key, present: true, accepts: true, ...overrides });

function stateFor(
  profile: FirmwareProfile,
  options: {
    version: string;
    slots: readonly SlotState[];
    booted?: SlotKey | null;
    keyA?: Uint8Array;
    keyB?: Uint8Array;
  },
): DeviceState {
  const byKey = new Map(options.slots.map((s) => [s.key, s]));
  const booted = options.booted === undefined ? 'a' : options.booted;
  return {
    version: options.version,
    serial: 'TESTSERIAL',
    profile,
    slots: options.slots,
    byKey,
    boot: booted === null ? null : { booted, target: booted === 'a' ? 'b' : 'a' },
    keyTable:
      options.keyA && options.keyB
        ? ({ keyA: options.keyA, keyB: options.keyB } as unknown as DeviceState['keyTable'])
        : null,
    keyWhiteningK: profile.cipher.whiteningK,
    deviceKeySlot: null,
    storeKey: { name: 'Key B', key: options.keyB ?? null, programmed: false },
    bankWriteRefusals: [],
    /* A 2014-chain build's fixture camera holds its banks plain, as the read would find them. */
    plainChain: onPlaintextChain(profile, options.version),
  } as unknown as DeviceState;
}

function imageOf(length: number, seed: number): Uint8Array {
  let s = seed >>> 0 || 1;
  const out = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    out[i] = s & 0xff;
  }
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x10001000, true);
  dv.setUint32(4, 0x10000101, true);
  dv.setUint32(0x200, IMAGE_MAGIC, true);
  dv.setUint32(LENGTH_OFFSET, length, true);
  return out;
}

const KEY_A = Uint8Array.from({ length: 16 }, (_, i) => 0xa0 + i);
const KEY_B = Uint8Array.from({ length: 16 }, (_, i) => 0xb0 + i);
const SRC_A = Uint8Array.from({ length: 16 }, (_, i) => 0x10 + i);
const SRC_B = Uint8Array.from({ length: 16 }, (_, i) => 0x30 + i);

/* ==================================================================== *
 * The plan
 * ==================================================================== */

describe('the plan says an empty bank can be written, and why', () => {
  const families: readonly (readonly [string, FirmwareProfile, string, RegExp, RegExp])[] = [
    [
      'the 2014 plaintext chain',
      legacyAuth,
      '1.3.0.0',
      /plaintext chain stages the image bytes as they are/,
      /nothing is read from the target bank/,
    ],
    [
      'the 2014 chain at its first build',
      legacyAuth,
      '0.8.0.0',
      /plaintext chain stages the image bytes as they are/,
      /bench Compact/,
    ],
    [
      'the Key A line',
      modern4x,
      '4.8.2.1',
      /derived from the booted bank and the running application/,
      /not from the target bank/,
    ],
    [
      'the 2016 keystream line',
      compact2016,
      '1.0.3.0',
      /key block 0 of the IMAGE’s own pair/,
      /not a key read from the target bank/,
    ],
  ];

  for (const [label, profile, version, first, second] of families) {
    it(`${label} (${version}): every bank is writable while empty, with the family's reason`, () => {
      const plan = buildSlotPlan(profile, version);
      expect(plan.slots).toHaveLength(3);
      for (const slot of plan.slots) {
        expect(slot.emptyBank.writable.supported, `bank ${slot.key}`).toBe(true);
        expect(slot.emptyBank.why).toMatch(first);
        expect(slot.emptyBank.why).toMatch(second);
        expect(slot.emptyBank.why).toMatch(/exactly as a used one does/);
      }
    });
  }

  it('follows the flash verdict exactly: a bank the profile cannot flash is not writable empty either', () => {
    const refusing: FirmwareProfile = {
      ...modern4x,
      capabilities: {
        ...modern4x.capabilities,
        flash: unsupported('flashing is off in this test'),
      },
    };
    const plan = buildSlotPlan(refusing, '4.8.2.1');
    for (const slot of plan.slots) {
      expect(slot.flashPlain).toEqual({ supported: false, reason: 'flashing is off in this test' });
      expect(slot.emptyBank.writable).toEqual(slot.flashPlain);
      expect(slot.emptyBank.why).toBe('flashing is off in this test');
    }
  });

  it('a locked build whose staging was never measured: read only, an empty bank is not written either', () => {
    const plan = buildSlotPlan(legacyAuth, '1.5.0.0');
    for (const slot of plan.slots) {
      expect(slot.emptyBank.writable).toEqual({
        supported: false,
        reason: UNVERIFIED_STAGING_REASON,
      });
      expect(slot.emptyBank.why).toBe(UNVERIFIED_STAGING_REASON);
    }
  });

  it('a build older than 0.8.0.0, and an unidentified camera, refuse an empty bank with the build reason', () => {
    for (const plan of [
      buildSlotPlan(compact2014, '0.7.0.7'),
      buildSlotPlan(legacyAuth, null),
      buildSlotPlan(generic, '4.8.1.7'),
    ]) {
      expect(plan.supportedBuild.supported).toBe(false);
      const reason = plan.supportedBuild.supported ? '' : plan.supportedBuild.reason;
      for (const slot of plan.slots) {
        expect(slot.emptyBank.writable).toEqual({ supported: false, reason });
        expect(slot.emptyBank.why).toBe(reason);
      }
    }
  });
});

describe('the 2016 staging note no longer claims the bank’s own keystream is needed', () => {
  /* The staging note is the camera's, said once (TESTING.md 42.87): no bank carries it. */
  const notes = stagingNote('locked-2016') ?? '';

  it('says the stage key is the image’s own key block 0 and that nothing is read from the target bank', () => {
    expect(notes).toMatch(/OWN key block 0/);
    expect(notes).toMatch(/Nothing is read from the target bank to stage it/);
  });

  it('does not say the keystream is recovered from a readable copy of this bank', () => {
    expect(notes).not.toMatch(/readable copy/);
    expect(notes).not.toMatch(/cannot be written in this form/);
    expect(notes).not.toMatch(/this bank’s own xorshift128 keystream/);
  });

  it('the recovery bank note no longer says R is written "with its own keystream"', () => {
    expect(bankNotes('locked-2016', 'r').join('\n')).not.toMatch(/own keystream/);
  });

  it('is on no bank: A and B carry no note, R only its own', () => {
    expect(bankNotes('locked-2016', 'a')).toEqual([]);
    expect(bankNotes('locked-2016', 'b')).toEqual([]);
    expect(bankNotes('locked-2016', 'r').join('\n')).not.toMatch(/^Staged: /m);
  });
});

/* ==================================================================== *
 * The reader
 * ==================================================================== */

describe('an erased bank is named empty, distinct from every other thing it can be', () => {
  it('slotContentOf: image, empty, foreign and unread are four different answers', () => {
    expect(slotContentOf(usedBank('a'))).toBe('image');
    expect(slotContentOf(emptyBank('b'))).toBe('empty');
    /* Read cleanly, not erased, not an image: bytes this page does not recognise. */
    expect(
      slotContentOf(
        slotState({ key: 'r', present: false, reason: 'no image header (magic 0x1234)' }),
      ),
    ).toBe('foreign');
    expect(slotContentOf(null)).toBe('unread');
  });

  it('a state with no `blank` field (built before the field existed) is never empty', () => {
    expect(slotContentOf(slotState({ key: 'b', present: false, reason: BLANK_REASON }))).toBe(
      'foreign',
    );
  });

  it('joinSlotViews: the join carries content for an image, an empty bank, a foreign one and an unread one', () => {
    const plan = buildSlotPlan(legacyAuth, '1.3.0.0');
    const byKey = new Map<SlotKey, SlotState>([
      ['a', usedBank('a')],
      ['b', emptyBank('b')],
      ['r', slotState({ key: 'r', unread: true, reason: 'window would not arm' })],
    ]);
    const views = joinSlotViews(plan, { byKey, boot: { booted: 'a', target: 'b' } });
    expect(views.map((v) => v.content)).toEqual(['image', 'empty', 'unread']);
    const b = views[1];
    /* Empty is a state: it has one, and no unread reason. */
    expect(b?.state?.present).toBe(false);
    expect(b?.unreadReason).toBeNull();
    expect(views[2]?.state).toBeNull();
    expect(views[2]?.unreadReason).toBe('window would not arm');

    const foreign = new Map<SlotKey, SlotState>([
      ['b', slotState({ key: 'b', present: false, reason: 'no image header (magic 0xDEAD)' })],
    ]);
    expect(
      joinSlotViews(plan, { byKey: foreign, boot: null }).find((v) => v.entry.key === 'b')?.content,
    ).toBe('foreign');
  });

  it('a slot the plan has no read window for is unread, even if the analysis says it is blank', () => {
    const plan = buildSlotPlan(legacyAuth, '1.3.0.0');
    const noWindow: SlotPlan = {
      ...plan,
      slots: plan.slots.map((s) => (s.key === 'b' ? { ...s, read: null } : s)),
    };
    const byKey = new Map<SlotKey, SlotState>([['b', emptyBank('b')]]);
    const b = joinSlotViews(noWindow, { byKey, boot: null }).find((v) => v.entry.key === 'b');
    expect(b?.content).toBe('unread');
    expect(b?.state).toBeNull();
  });

  it('inspectSlots reports an erased bank as empty with no error, and says so once in the log', async () => {
    const camera = fakeCamera({
      initialMode: 0,
      fwInfo: new Map([[0, buildBlock([1, 3, 0, 0])]]),
    });
    await camera.open();
    const reporter = collectingReporter();
    const ctx: WorkflowContext = {
      device: new SeekDevice(camera, { reporter: silentReporter }),
      profile: legacyAuth,
      detection: null,
      reporter,
    };
    const state = {
      version: '1.3.0.0',
      serial: 'TESTSERIAL',
      profile: legacyAuth,
      detection: { ambiguous: false, best: { profile: legacyAuth } },
      slots: [],
      byKey: new Map<SlotKey, SlotState>([
        ['a', usedBank('a')],
        ['b', emptyBank('b')],
        ['r', usedBank('r')],
      ]),
      boot: { booted: 'a', target: 'b' },
    } as unknown as DeviceState;
    vi.mocked(readDeviceInfo).mockResolvedValueOnce(state);

    const report = await inspectSlots(ctx);

    expect(report.slots.map((v) => [v.entry.key, v.content])).toEqual([
      ['a', 'image'],
      ['b', 'empty'],
      ['r', 'image'],
    ]);
    const lines = reporter.events.filter((e): e is LogEvent => e.type === 'log');
    const empties = lines.filter((l) => l.message.includes('is empty'));
    expect(empties).toHaveLength(1);
    expect(empties[0]?.message).toMatch(/Slot B is empty: its header window reads as all 0xFF/);
    expect(empties[0]?.message).toMatch(/nothing is decrypted/);
    expect(empties[0]?.message).toMatch(/It can be written/);
    /* Not a warning, and nothing in the log is an error. */
    expect(empties[0]?.level).not.toBe('warn');
    expect(lines.some((l) => l.level === 'error')).toBe(false);
  });
});

/** GetFirmwareInfo's build block: four version bytes, then the build date. */
function buildBlock(version: readonly [number, number, number, number]): Uint8Array {
  const out = new Uint8Array(36);
  out.set(version, 0);
  out.set(new TextEncoder().encode('Jan  1 2020'), 4);
  return out;
}

/* ==================================================================== *
 * The dump
 * ==================================================================== */

describe('dumpSlot on an empty bank', () => {
  const BANK_AT = 0x50000;
  const FF_SHA = createHash('sha256').update(new Uint8Array(SLOT_BYTES).fill(0xff)).digest('hex');

  async function dumpOf(
    flash: Uint8Array,
    window: { size?: number } = {},
  ): Promise<{ dumped: Awaited<ReturnType<typeof dumpSlot>>; ops: number[] }> {
    const camera = fakeCamera({
      initialMode: 0,
      flash,
      fwInfo: new Map([[0, buildBlock([4, 8, 2, 1])]]),
      ...(window.size === undefined
        ? {}
        : { windows: [{ subcmd: 5, offset: BANK_AT, size: window.size }] }),
    });
    await camera.open();
    const ctx: WorkflowContext = {
      device: new SeekDevice(camera, { reporter: silentReporter }),
      profile: modern4x,
      detection: null,
      reporter: silentReporter,
    };
    const base = buildSlotPlan(modern4x, '4.8.2.1');
    /* A fake camera exposes subcommand s at flash offset s * 0x10000: bank A is moved there. */
    const plan: SlotPlan = {
      ...base,
      slots: base.slots.map((s) =>
        s.key === 'a'
          ? {
              ...s,
              address: 0x14050000,
              read: { subcmd: 5, address: 0x14050000, note: 'test bank' } satisfies WindowEntry,
            }
          : s,
      ),
    };
    const state = {
      version: '4.8.2.1',
      profile: modern4x,
      byKey: new Map(),
    } as unknown as DeviceState;
    const report: SlotsReport = { state, plan, slots: [] };
    const dumped = await dumpSlot(ctx, report, 'a');
    return { dumped, ops: camera.calls.map((c) => c.op) };
  }

  function flashWith(fill: (flash: Uint8Array) => void): Uint8Array {
    const flash = patternFlash(4 * 1024 * 1024);
    fill(flash);
    return flash;
  }

  it('returns the raw 64 KiB of 0xFF, says it is empty, and decrypts nothing', async () => {
    const { dumped, ops } = await dumpOf(
      flashWith((f) => f.fill(0xff, BANK_AT, BANK_AT + SLOT_BYTES)),
    );

    expect(dumped.empty).toBe(true);
    expect(dumped.raw).toHaveLength(SLOT_BYTES);
    expect(dumped.raw.every((b) => b === 0xff)).toBe(true);
    expect(dumped.sha256).toBe(FF_SHA);
    expect(dumped.plain).toBeNull();
    expect(dumped.plainSha256).toBeNull();
    expect(dumped.notes.join('\n')).toMatch(/empty, nothing to decrypt/);
    expect(dumped.notes.join('\n')).not.toMatch(/key not recovered|no image header|decrypted \d/);
    /* Still read-only. */
    for (const op of ops) expect(isReadOnlyOp(op), `op 0x${op.toString(16)}`).toBe(true);
  });

  it('a header window erased over a bank that holds other bytes is NOT empty, and says what it is', async () => {
    const { dumped } = await dumpOf(flashWith((f) => f.fill(0xff, BANK_AT, BANK_AT + 0x240)));

    expect(dumped.empty).toBe(false);
    expect(dumped.plain).toBeNull();
    const notes = dumped.notes.join('\n');
    expect(notes).toMatch(/erased header: the header window is all 0xFF, so no image starts here/);
    expect(notes).toMatch(/later byte\(s\) are not 0xFF/);
    expect(notes).not.toMatch(/empty, nothing to decrypt/);
  });

  it('a SHORT read of erased bytes is never called empty: the gap fill is 0xFF too', async () => {
    const { dumped } = await dumpOf(
      flashWith((f) => f.fill(0xff, BANK_AT, BANK_AT + SLOT_BYTES)),
      { size: 0x8000 },
    );

    expect(dumped.empty).toBe(false);
    expect(dumped.raw).toHaveLength(SLOT_BYTES);
    const notes = dumped.notes.join('\n');
    expect(notes).toMatch(/short read: 32768 of 65536 B came back/);
    expect(notes).not.toMatch(/empty, nothing to decrypt/);
    expect(dumped.plain).toBeNull();
  });

  it('a bank that holds bytes is not empty (the pattern flash has no image header either)', async () => {
    const { dumped } = await dumpOf(flashWith(() => undefined));
    expect(dumped.empty).toBe(false);
    expect(dumped.notes.join('\n')).toMatch(/no image header/);
  });

  it('a bank that holds an image decrypts, and says the key recovery’s verdict in words (TESTING.md 42.88)', async () => {
    /* An image the solve recovers: the reserved vectors zero, the sum at the line's target, under a key. */
    const image = imageOf(0x2000, 9);
    const dv = new DataView(image.buffer);
    for (const index of [...KNOWN_ZERO_IDX, CHECK_ZERO_IDX]) dv.setUint32(4 * index, 0, true);
    const plain = setAcceptSum(image, modern4x.cipher).image;
    const stored = cryptBytes(
      plain,
      stateFromKey(KEY_A, modern4x.cipher.whiteningK),
      modern4x.cipher,
    );
    const { dumped } = await dumpOf(
      flashWith((f) => {
        f.set(stored, BANK_AT);
      }),
    );

    expect(equalBytes(dumped.plain ?? new Uint8Array(0), plain)).toBe(true);
    const notes = dumped.notes.join('\n');
    expect(notes).toContain(
      `decrypted ${String(plain.length)} B under the key recovered from this bank (key verified by the acceptance sum 0x0000FFFF)`,
    );
    expect(notes).not.toMatch(/VERIFIED|confidence|the profile/);
  });
});

/* ==================================================================== *
 * Preparing and sending a write into an empty bank
 * ==================================================================== */

function reportOf(
  profile: FirmwareProfile,
  version: string,
  slots: readonly SlotState[],
  extra: { booted?: SlotKey | null; keyA?: Uint8Array; keyB?: Uint8Array } = {},
  plan: SlotPlan = buildSlotPlan(profile, version),
): SlotsReport {
  return reportFor(stateFor(profile, { version, slots, ...extra }), plan);
}

describe('prepareSlotFlash into an empty bank stages the same bytes as into a used one', () => {
  it('the 2014 plaintext chain: same payload, same stored-bytes prediction, plan says the target was empty', () => {
    const image = imageOf(0x9000, 3);
    const input = { kind: 'plain' as const, bytes: image, fileName: 'chain.bin' };
    const intoEmpty = prepareSlotFlash(
      reportOf(legacyAuth, '1.3.0.0', [usedBank('a'), emptyBank('b'), usedBank('r')]),
      'b',
      input,
    );
    const intoUsed = prepareSlotFlash(
      reportOf(legacyAuth, '1.3.0.0', [usedBank('a'), usedBank('b'), usedBank('r')]),
      'b',
      input,
    );

    expect(intoEmpty.targetEmpty).toBe(true);
    expect(intoUsed.targetEmpty).toBe(false);
    expect(equalBytes(intoEmpty.payload, intoUsed.payload)).toBe(true);
    expect(intoEmpty.sum16).toBe(intoUsed.sum16);
    expect(equalBytes(intoEmpty.expectedStored!, intoUsed.expectedStored!)).toBe(true);
    /* The compare table says there is nothing there now, in the page's own words. */
    expect(intoEmpty.compare.find((r) => r.field === 'Firmware version')?.before).toBe(
      '(no image)',
    );
    expect(intoEmpty.warnings.join('\n')).not.toMatch(
      /already holds an image the bootloader cannot take/,
    );
  });

  it('the 2016 keystream line: the stage key is the IMAGE’s, so the bank’s absence changes no byte', () => {
    const image = imageOf(0x6000, 4);
    image.set(hexToBytes(KEY_PAIRS.cp103.block0), 0x3000);
    image.set(hexToBytes(KEY_PAIRS.cp103.block1), 0x3100);
    const input = { kind: 'plain' as const, bytes: image, fileName: 'x.bin' };
    const intoEmpty = prepareSlotFlash(
      reportOf(compact2016, '1.0.3.0', [usedBank('a'), emptyBank('b'), usedBank('r')]),
      'b',
      input,
    );
    const intoUsed = prepareSlotFlash(
      reportOf(compact2016, '1.0.3.0', [usedBank('a'), usedBank('b'), usedBank('r')]),
      'b',
      input,
    );

    expect(intoEmpty.targetEmpty).toBe(true);
    expect(intoEmpty.staging).toBe('slot-keystream-ciphertext');
    expect(equalBytes(intoEmpty.payload, intoUsed.payload)).toBe(true);
    expect(equalBytes(intoEmpty.expectedPlain!, intoUsed.expectedPlain!)).toBe(true);
    /* An empty bank has no raw bytes, no recovered state and no sha: none of it is read. */
    expect(emptyBank('b').raw).toBeNull();
    expect(emptyBank('b').recovered).toBeNull();
  });

  it('the Key A line: the payload is keyed by the camera, and the footer is borrowed from a bank that has one', () => {
    const image = imageOf(0x5000, 5);
    image.set(SRC_A, 0x4000);
    image.set(SRC_B, 0x4020);
    const input = {
      kind: 'plain' as const,
      bytes: image,
      fileName: `img${keyFilenameSuffix(SRC_A, SRC_B)}.bin`,
    };
    /* Slot A carries a footer with recognisable bytes after the tag and length. */
    const footerRaw = new Uint8Array(FOOTER_SIZE).fill(0x5a);
    const view = new DataView(footerRaw.buffer);
    view.setUint32(0, FOOTER_TAG, true);
    view.setUint32(4, 0x5000, true);
    const footer = parseFooter(footerRaw, 0)!;
    /* The booted bank decrypts under the store key (Key B) and carries the application's pair. */
    const appPlain = new Uint8Array(0x5000).fill(0x33);
    appPlain.set(KEY_A, 0x4000);
    appPlain.set(KEY_B, 0x4020);
    const bootedA = { keyName: 'Key B', plain: appPlain, bootable: true } as const;
    const withFooter = usedBank('a', { footer, ...bootedA });
    const keys = { keyA: KEY_A, keyB: KEY_B };

    const intoEmpty = prepareSlotFlash(
      reportOf(modern4x, '4.8.1.9', [withFooter, emptyBank('b'), usedBank('r')], keys),
      'b',
      input,
    );
    const intoUsed = prepareSlotFlash(
      reportOf(modern4x, '4.8.1.9', [withFooter, usedBank('b'), usedBank('r')], keys),
      'b',
      input,
    );
    expect(intoEmpty.targetEmpty).toBe(true);
    expect(equalBytes(intoEmpty.payload, intoUsed.payload)).toBe(true);
    const footerAt = ((0x5000 >>> 14) + 1) * 0x4000 - 0x40;
    expect(
      intoEmpty.payload.subarray(footerAt + 8, footerAt + FOOTER_SIZE).every((b) => b === 0x5a),
    ).toBe(true);

    /* With no bank on the camera holding a footer, it is built blank rather than refused. */
    const alone = prepareSlotFlash(
      reportOf(modern4x, '4.8.1.9', [usedBank('a', bootedA), emptyBank('b'), usedBank('r')], keys),
      'b',
      input,
    );
    expect(alone.targetEmpty).toBe(true);
    expect(
      alone.payload.subarray(footerAt + 8, footerAt + FOOTER_SIZE).every((b) => b === 0xff),
    ).toBe(true);
  });

  it('a raw payload into an empty bank is built like a raw payload into a used one', () => {
    const staged = prepareSlotFlash(
      reportOf(legacyAuth, '1.3.0.0', [usedBank('a'), emptyBank('b'), usedBank('r')]),
      'b',
      { kind: 'plain', bytes: imageOf(0x9000, 8), fileName: 'x' },
    );
    const raw = prepareSlotFlash(
      reportOf(legacyAuth, '1.3.0.0', [usedBank('a'), emptyBank('b'), usedBank('r')]),
      'b',
      { kind: 'raw', bytes: staged.payload, fileName: 'raw.bin' },
    );
    expect(raw.targetEmpty).toBe(true);
    expect(raw.staging).toBe('verbatim');
    expect(equalBytes(raw.payload, staged.payload)).toBe(true);
    expect(equalBytes(raw.expectedStored!.subarray(0, staged.payload.length), staged.payload)).toBe(
      true,
    );
  });

  it('a bank that holds bytes which are not an image is written as before, and is not called empty', () => {
    const foreign = slotState({
      key: 'b',
      present: false,
      reason: 'no image header (magic 0x1234)',
    });
    const out = prepareSlotFlash(
      reportOf(legacyAuth, '1.3.0.0', [usedBank('a'), foreign, usedBank('r')]),
      'b',
      { kind: 'plain', bytes: imageOf(0x9000, 3), fileName: 'x' },
    );
    expect(out.targetEmpty).toBe(false);
  });

  it('an UNREAD bank is not empty: it is refused, as before', () => {
    const unread = slotState({ key: 'b', unread: true, reason: 'window would not arm' });
    expect(() =>
      prepareSlotFlash(
        reportOf(legacyAuth, '1.3.0.0', [usedBank('a'), unread, usedBank('r')]),
        'b',
        { kind: 'plain', bytes: imageOf(0x9000, 3), fileName: 'x' },
      ),
    ).toThrow(/was not read/);
  });

  it('refuses an empty bank the plan says cannot be written, with the plan’s reason; a used bank is unaffected', () => {
    const base = buildSlotPlan(legacyAuth, '1.3.0.0');
    const plan: SlotPlan = {
      ...base,
      slots: base.slots.map((s): SlotEntry =>
        s.key === 'b'
          ? {
              ...s,
              emptyBank: {
                writable: { supported: false, reason: 'test: no empty writes' },
                why: 'test',
              },
            }
          : s,
      ),
    };
    const input = { kind: 'plain' as const, bytes: imageOf(0x9000, 3), fileName: 'x' };

    let thrown: unknown = null;
    try {
      prepareSlotFlash(
        reportOf(legacyAuth, '1.3.0.0', [usedBank('a'), emptyBank('b'), usedBank('r')], {}, plan),
        'b',
        input,
      );
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(SeekError);
    expect((thrown as SeekError).code).toBe('slots/refused');
    expect((thrown as SeekError).message).toMatch(/is empty and cannot be written on this build/);
    expect((thrown as SeekError).message).toContain('test: no empty writes');

    const used = prepareSlotFlash(
      reportOf(legacyAuth, '1.3.0.0', [usedBank('a'), usedBank('b'), usedBank('r')], {}, plan),
      'b',
      input,
    );
    expect(used.targetEmpty).toBe(false);
  });
});

/* ---- the send --------------------------------------------------------------- */

interface Call {
  op: string;
  arg?: unknown;
}

function recordingDevice(read: Uint8Array): { device: SeekDevice; calls: Call[] } {
  const calls: Call[] = [];
  const device = {
    transport: { isOpen: true, open: () => Promise.resolve(), info: { recipientFallback: null } },
    armWindow: (entry: WindowEntry) => {
      calls.push({ op: 'arm', arg: entry.subcmd });
      return Promise.resolve();
    },
    setFeaturedFirmwareData: (data: Uint8Array) => {
      calls.push({ op: 'stage', arg: data.length });
      return Promise.resolve();
    },
    getErrorCode: () => Promise.resolve(0),
    completeMemoryUpgrade: (sum: number) => {
      calls.push({ op: 'commit', arg: sum });
      return Promise.resolve();
    },
    readWindow: () => {
      calls.push({ op: 'read' });
      return Promise.resolve({
        data: read,
        stoppedAt: read.length,
        stopReason: null,
        chunkUsed: 64,
      });
    },
  } as unknown as SeekDevice;
  return { device, calls };
}

describe('flashSlot into an empty bank', () => {
  const image = imageOf(0x2000, 21);
  const input = { kind: 'plain' as const, bytes: image, fileName: 'x.bin' };
  const slots = [usedBank('a'), emptyBank('b'), emptyBank('r')];

  it('arms, stages, commits and reads back exactly as for a used bank, and the read-back verifies', async () => {
    const report = reportOf(legacyAuth, '1.3.0.0', slots, { booted: 'a' });
    const plan = prepareSlotFlash(report, 'b', input);
    const { device, calls } = recordingDevice(plan.expectedStored!);

    const result = await flashSlot(
      { device, profile: legacyAuth, detection: null, reporter: silentReporter },
      report,
      plan,
      { acknowledgeRisk: false },
    );

    const ops = calls.map((c) => c.op);
    expect(ops[0]).toBe('arm');
    expect(ops).toContain('commit');
    expect(ops.at(-1)).toBe('read');
    expect(result.commitStatus).toBe(0);
    expect(result.verified).toBe(true);
  });

  it('the acknowledgement rule is unchanged: an empty bank is not exempt where the camera names no booted bank', async () => {
    const report = reportOf(legacyAuth, '1.3.0.0', slots, { booted: null });
    const plan = prepareSlotFlash(report, 'b', input);
    const { device, calls } = recordingDevice(plan.expectedStored!);

    await expect(
      flashSlot(
        { device, profile: legacyAuth, detection: null, reporter: silentReporter },
        report,
        plan,
        {
          acknowledgeRisk: false,
        },
      ),
    ).rejects.toThrow(/could not be named|acknowledgeRisk/);
    expect(calls).toEqual([]);

    const ok = await flashSlot(
      { device, profile: legacyAuth, detection: null, reporter: silentReporter },
      report,
      plan,
      { acknowledgeRisk: true },
    );
    expect(ok.verified).toBe(true);
  });

  it('an empty recovery bank still needs the acknowledgement', async () => {
    const report = reportOf(legacyAuth, '1.3.0.0', slots, { booted: 'a' });
    const plan = prepareSlotFlash(report, 'r', input);
    expect(plan.targetEmpty).toBe(true);
    const { device, calls } = recordingDevice(plan.expectedStored!);

    await expect(
      flashSlot(
        { device, profile: legacyAuth, detection: null, reporter: silentReporter },
        report,
        plan,
        {
          acknowledgeRisk: false,
        },
      ),
    ).rejects.toThrow(/acknowledgeRisk/);
    expect(calls).toEqual([]);
  });

  it('a read-back that does not decrypt to the image is reported false even though the target was empty', async () => {
    const report = reportOf(legacyAuth, '1.3.0.0', slots, { booted: 'a' });
    const plan = prepareSlotFlash(report, 'b', input);
    const wrong = plan.expectedStored!.slice();
    wrong[9] = (wrong[9] ?? 0) ^ 0xff;
    const { device } = recordingDevice(wrong);

    const result = await flashSlot(
      { device, profile: legacyAuth, detection: null, reporter: silentReporter },
      report,
      plan,
      { acknowledgeRisk: false },
    );
    expect(result.verified).toBe(false);
  });
});
