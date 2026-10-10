/* ====================================================================
 * The slot reader without a camera: the join, the refusals that must come
 * before any bank is touched, and the read-only guarantee of `dumpSlot`.
 *
 * Everything here runs over `fakeCamera`, so it needs nothing on disk. The
 * plan is the real `buildSlotPlan` unless a test says otherwise. What a real
 * bank holds, and what it decrypts to, is `dump.emulator.test.ts`'s job.
 * ==================================================================== */

import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { silentReporter } from '../../src/events.js';
import { SeekError } from '../../src/errors.js';
import { SeekDevice } from '../../src/protocol/client.js';
import { isReadOnlyOp, OP, SAFE_BEFORE_IDENTITY, WINDOW_SIZE } from '../../src/protocol/ops.js';
import { getProfile } from '../../src/profiles/registry.js';
import { modern4x } from '../../src/profiles/modern-4x.js';
import { buildSlotPlan } from '../../src/slots/capability.js';
import { dumpSlot } from '../../src/slots/dump.js';
import { inspectSlots, joinSlotViews } from '../../src/slots/inspect.js';
import type { SlotEntry, SlotKey, SlotPlan, SlotsReport } from '../../src/slots/types.js';
import type { DeviceState, SlotState, WorkflowContext } from '../../src/workflows/types.js';
import { fakeCamera, type FakeCamera } from '../fake-transport.js';

/** GetFirmwareInfo's build block: four version bytes, then the build date. */
function buildBlock(version: readonly [number, number, number, number]): Uint8Array {
  const out = new Uint8Array(36);
  out.set(version, 0);
  out.set(new TextEncoder().encode('Jan  1 2020'), 4);
  return out;
}

/** A camera that answers the version read, and nothing else is needed for these tests. */
function cameraAt(version: readonly [number, number, number, number] | null): FakeCamera {
  return fakeCamera({
    initialMode: 0,
    fwInfo: version === null ? new Map() : new Map([[0, buildBlock(version)]]),
  });
}

async function contextFor(camera: FakeCamera, profile = modern4x): Promise<WorkflowContext> {
  await camera.open();
  return {
    device: new SeekDevice(camera, { reporter: silentReporter }),
    profile,
    detection: null,
    reporter: silentReporter,
  };
}

const opsOf = (camera: FakeCamera): number[] => camera.calls.map((call) => call.op);
const BEGIN = OP.BEGIN_FIRMWARE_UPGRADE;
const FEATURED = OP.GET_FEATURED_FIRMWARE_DATA;
const WRITE_OPS: ReadonlySet<number> = new Set([
  OP.SET_FEATURED_FIRMWARE_DATA,
  OP.COMPLETE_MEMORY_UPGRADE,
]);

function slotStub(key: SlotKey, overrides: Partial<SlotState> = {}): SlotState {
  return {
    key,
    name: `Slot ${key}`,
    subcmd: null,
    address: 0,
    present: true,
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
  } as SlotState;
}

/** A report with no camera analysis behind it, for the refusals that need none. */
function reportWith(plan: SlotPlan, version: string | null = '4.8.2.1'): SlotsReport {
  const state = { version, profile: modern4x, byKey: new Map() } as unknown as DeviceState;
  return { state, plan, slots: [] };
}

/** The plan entry for `key`, with `change` applied to it. */
function withSlot(plan: SlotPlan, key: SlotKey, change: Partial<SlotEntry>): SlotPlan {
  return {
    ...plan,
    slots: plan.slots.map((slot) => (slot.key === key ? { ...slot, ...change } : slot)),
  };
}

const MODERN_PLAN = buildSlotPlan(modern4x, '4.8.2.1');

describe('joinSlotViews', () => {
  it('joins each plan entry to the state for its key and marks the booted slot active', () => {
    const byKey = new Map<SlotKey, SlotState>([
      ['a', slotStub('a', { address: 0x14030000 })],
      ['r', slotStub('r', { address: 0x14070000 })],
    ]);
    const views = joinSlotViews(MODERN_PLAN, { byKey, boot: { booted: 'a', target: 'r' } });

    expect(views.map((view) => view.entry.key)).toEqual(['a', 'b', 'r']);
    const a = views.find((view) => view.entry.key === 'a');
    expect(a?.state?.key).toBe('a');
    expect(a?.unreadReason).toBeNull();
    expect(a?.active).toBe(true);
    expect(views.find((view) => view.entry.key === 'r')?.active).toBe(false);
  });

  it('gives a slot the plan has no read window for no state, and says why, even when the analysis has one', () => {
    const plan = withSlot(MODERN_PLAN, 'b', { read: null });
    const byKey = new Map<SlotKey, SlotState>([['b', slotStub('b')]]);
    const b = joinSlotViews(plan, { byKey, boot: null }).find((view) => view.entry.key === 'b');

    expect(b?.state).toBeNull();
    expect(b?.unreadReason).toMatch(/not readable on this build/);
    expect(b?.active).toBe(false);
  });

  it('carries the analysis reason for an unread slot, and does not confuse an empty bank with it', () => {
    const byKey = new Map<SlotKey, SlotState>([
      ['a', slotStub('a', { unread: true, reason: 'window would not arm' })],
      ['r', slotStub('r', { present: false, reason: 'no image header (magic 0xFFFFFFFF)' })],
    ]);
    const views = joinSlotViews(MODERN_PLAN, { byKey, boot: null });
    const a = views.find((view) => view.entry.key === 'a');
    const r = views.find((view) => view.entry.key === 'r');

    expect(a?.state).toBeNull();
    expect(a?.unreadReason).toBe('window would not arm');
    /* Read and empty: a state with present false, and no unread reason. */
    expect(r?.state?.present).toBe(false);
    expect(r?.unreadReason).toBeNull();
  });

  it('reports a slot the analysis does not know about as unread, rather than dropping it', () => {
    const a = joinSlotViews(MODERN_PLAN, { byKey: new Map(), boot: null }).find(
      (view) => view.entry.key === 'a',
    );
    expect(a?.state).toBeNull();
    expect(a?.unreadReason).toMatch(/missing from the camera analysis/);
  });
});

describe('inspectSlots refuses before any bank is touched', () => {
  it('refuses a build older than 0.8.0.0 after the version read, with the real plan, sending nothing else', async () => {
    const camera = cameraAt([0, 7, 0, 7]);
    const ctx = await contextFor(camera, getProfile('legacy-auth'));

    const error = await inspectSlots(ctx).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(SeekError);
    expect((error as SeekError).code).toBe('slots/refused');
    expect((error as SeekError).message).toMatch(/0\.8\.0\.0/);
    expect(opsOf(camera).filter((op) => op === BEGIN || op === FEATURED)).toEqual([]);
    const safe: ReadonlySet<number> = SAFE_BEFORE_IDENTITY;
    for (const op of opsOf(camera)) expect(safe.has(op), `op ${op}`).toBe(true);
  });

  it('refuses a camera that does not say what it runs, before any bank is touched', async () => {
    const camera = cameraAt(null);
    const ctx = await contextFor(camera);

    const error = await inspectSlots(ctx).catch((caught: unknown) => caught);

    expect((error as SeekError).code).toBe('slots/refused');
    expect(opsOf(camera).filter((op) => op === BEGIN || op === FEATURED)).toEqual([]);
  });

  it('refuses a plan made for another build, rather than joining it to this camera', async () => {
    const camera = cameraAt([4, 8, 2, 1]);
    const ctx = await contextFor(camera);
    const other = buildSlotPlan(modern4x, '4.8.1.9');

    const error = await inspectSlots(ctx, { plan: other }).catch((caught: unknown) => caught);

    expect((error as SeekError).code).toBe('slots/refused');
    expect(opsOf(camera).filter((op) => op === BEGIN || op === FEATURED)).toEqual([]);
  });
});

describe('dumpSlot refuses before any transfer', () => {
  it('refuses a slot whose dump is unsupported, sending nothing', async () => {
    const camera = cameraAt([4, 8, 2, 1]);
    const ctx = await contextFor(camera);
    const plan = withSlot(MODERN_PLAN, 'b', { dump: { supported: false, reason: 'test: no dump' } });

    const error = await dumpSlot(ctx, reportWith(plan), 'b').catch((caught: unknown) => caught);

    expect((error as SeekError).code).toBe('slots/refused');
    expect((error as SeekError).message).toMatch(/test: no dump/);
    expect(camera.calls).toEqual([]);
  });

  it('refuses every slot of a build the plan calls unsupported, sending nothing', async () => {
    const camera = cameraAt([0, 7, 0, 7]);
    const ctx = await contextFor(camera, getProfile('legacy-auth'));
    const plan = buildSlotPlan(getProfile('legacy-auth'), '0.7.0.7');

    const error = await dumpSlot(ctx, reportWith(plan, '0.7.0.7'), 'a').catch(
      (caught: unknown) => caught,
    );

    expect((error as SeekError).code).toBe('slots/refused');
    expect(camera.calls).toEqual([]);
  });

  it('refuses a key that the plan does not have', async () => {
    const camera = cameraAt([4, 8, 2, 1]);
    const ctx = await contextFor(camera);
    const plan: SlotPlan = { ...MODERN_PLAN, slots: MODERN_PLAN.slots.filter((s) => s.key !== 'r') };

    const error = await dumpSlot(ctx, reportWith(plan), 'r').catch((caught: unknown) => caught);

    expect((error as SeekError).code).toBe('slots/refused');
    expect(camera.calls).toEqual([]);
  });

  it('refuses when the camera now reports another build than the report was taken on', async () => {
    const camera = cameraAt([4, 8, 2, 2]);
    const ctx = await contextFor(camera);

    const error = await dumpSlot(ctx, reportWith(MODERN_PLAN, '4.8.2.1'), 'a').catch(
      (caught: unknown) => caught,
    );

    expect((error as SeekError).code).toBe('slots/refused');
    expect(opsOf(camera).filter((op) => op === BEGIN || op === FEATURED)).toEqual([]);
  });
});

describe('dumpSlot reads one bank as stored, read-only', () => {
  it('returns exactly the 64 KiB at the bank address, with its digest, and sends only read ops', async () => {
    const camera = cameraAt([4, 8, 2, 1]);
    const ctx = await contextFor(camera);
    /* A fake camera exposes subcommand s at flash offset s * 0x10000, so the bank at
     * 0x14050000 (flash offset 0x50000) is subcommand 5 here. The real modern plan
     * arms bank A at 0x14030000; this test swaps in a window the fake serves. */
    const plan = withSlot(MODERN_PLAN, 'a', {
      address: 0x14050000,
      read: { subcmd: 5, address: 0x14050000, note: 'test bank' },
    });

    const dumped = await dumpSlot(ctx, reportWith(plan), 'a');

    const expected = camera.flash.subarray(0x50000, 0x50000 + WINDOW_SIZE);
    expect(dumped.raw.length).toBe(WINDOW_SIZE);
    expect(Buffer.from(dumped.raw).equals(Buffer.from(expected))).toBe(true);
    expect(dumped.sha256).toBe(createHash('sha256').update(expected).digest('hex'));
    expect(dumped.address).toBe(0x14050000);
    /* The pattern flash holds no image header, so nothing is decrypted, and it says so. */
    expect(dumped.plain).toBeNull();
    expect(dumped.plainSha256).toBeNull();
    expect(dumped.notes.join('\n')).toMatch(/no image header/);

    const ops = opsOf(camera);
    expect(ops).toContain(BEGIN);
    expect(ops.filter((op) => WRITE_OPS.has(op))).toEqual([]);
    /* THE READ-ONLY ASSERTION: every opcode this slot read sent is in READ_ONLY_OPS. */
    for (const op of ops) expect(isReadOnlyOp(op), `op 0x${op.toString(16)}`).toBe(true);
  });
});
