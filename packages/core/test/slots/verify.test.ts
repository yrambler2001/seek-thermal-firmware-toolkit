/* ==================================================================== *
 * The read-back verdict after a commit, on every staging form, against a
 * fake camera that models both behaviours a bank can show:
 *
 *   'verbatim'   the device programs exactly the bytes it was sent;
 *   'reencrypt'  the device decodes the staged bytes (with the staging key) and
 *                stores the image under the bank's OWN store key, a keystream
 *                different from the one the payload carries. This is what the
 *                2016 line and the Key A line do on the bench: the bank's stored
 *                bytes differ from the payload, and only what the bank decrypts
 *                to is the same as what was written.
 *
 * The verdict must be: true for a correct write under either model (where the
 * plan can say what the bank decrypts to), false for a corrupted one, and null
 * only where nothing can be compared. No real hardware is used here.
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { equalBytes, hexToBytes } from '../../src/bytes.js';
import { silentReporter } from '../../src/events.js';
import { SeekError } from '../../src/errors.js';
import { cryptBytes } from '../../src/crypto/cipher.js';
import { keyFilenameSuffix, stateFromKey } from '../../src/crypto/keys.js';
import { IMAGE_MAGIC, LENGTH_OFFSET } from '../../src/image/header.js';
import { transferSum16 } from '../../src/image/bank.js';
import {
  KEY_PAIRS,
  keystream,
  keyWordsOf,
  xorWindowVerbatim,
} from '../../src/preservation/patch.js';
import { getProfile } from '../../src/profiles/registry.js';
import type { FirmwareProfile, WindowEntry } from '../../src/profiles/types.js';
import type { SeekDevice } from '../../src/protocol/client.js';
import type { DeviceState, SlotState, WorkflowContext } from '../../src/workflows/types.js';
import { buildSlotPlan } from '../../src/slots/capability.js';
import { flashSlot, prepareSlotFlash } from '../../src/slots/write.js';
import { compareReadBack } from '../../src/slots/write-verify.js';
import {
  SLOT_BYTES,
  type FlashSlotResult,
  type SlotFlashPlan,
  type SlotKey,
  type SlotsReport,
  type StagingForm,
} from '../../src/slots/types.js';
import { reportFor } from './write-fixtures.js';

/* ==================================================================== *
 * Fixtures
 * ==================================================================== */

const modern = getProfile('modern-4x');
const legacy = getProfile('legacy-auth');
const compact2016 = getProfile('compact-2016');

/** The camera's Key A / Key B, and the pair a dumped image is named with. */
const KEY_A = Uint8Array.from({ length: 16 }, (_, i) => 0xa0 + i);
const KEY_B = Uint8Array.from({ length: 16 }, (_, i) => 0xb0 + i);
const SRC_A = Uint8Array.from({ length: 16 }, (_, i) => 0x10 + i);
const SRC_B = Uint8Array.from({ length: 16 }, (_, i) => 0x30 + i);
/** The store key a Key A camera re-encrypts its banks under: not Key A, so the stored bytes differ. */
const STORE_KEY = Uint8Array.from({ length: 16 }, (_, i) => 0x5c ^ i);

function prng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s & 0xff;
  };
}

/**
 * A decrypted-looking image whose reserved vector words 7..10 and 13 are zero, as
 * a real Cortex-M table is. That zero plaintext is what the keystream solve reads,
 * so an image without it cannot be recovered from its own read-back.
 */
function vectorImageOf(length: number, seed: number): Uint8Array {
  const next = prng(seed);
  const out = new Uint8Array(length);
  for (let i = 0; i < length; i++) out[i] = next();
  for (const word of [7, 8, 9, 10, 13]) new DataView(out.buffer).setUint32(4 * word, 0, true);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x10001000, true);
  dv.setUint32(4, 0x10000101, true);
  dv.setUint32(0x200, IMAGE_MAGIC, true);
  dv.setUint32(LENGTH_OFFSET, length, true);
  return out;
}

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

function stateFor(
  profile: FirmwareProfile,
  version: string,
  slots: readonly SlotState[],
  keys: { readonly keyA: Uint8Array; readonly keyB: Uint8Array } | null = null,
): DeviceState {
  return {
    version,
    serial: 'TESTSERIAL',
    profile,
    slots,
    byKey: new Map(slots.map((s) => [s.key, s])),
    boot: { booted: 'a', target: 'b' },
    keyTable:
      keys === null
        ? null
        : ({ keyA: keys.keyA, keyB: keys.keyB } as unknown as DeviceState['keyTable']),
    keyWhiteningK: profile.cipher.whiteningK,
    /* The store key of a camera without a per-device key is its Key B (storeKeyOf). */
    storeKey: { name: 'Key B', key: keys?.keyB ?? null, programmed: false },
    deviceKeySlot: null,
    canFlash: true,
    flashBlockedBy: [],
    plainChain: false,
  } as unknown as DeviceState;
}

/** The booted bank A of a Key A camera: under the store key (Key B), carrying the application's own pair. */
function bootedWithApp(): SlotState {
  const plain = vectorImageOf(0x5000, 6);
  plain.set(KEY_A, 0x4000);
  plain.set(KEY_B, 0x4020);
  return slotState({
    key: 'a',
    present: true,
    accepts: true,
    plain,
    keyName: 'Key B',
    bootable: true,
    bootability: 'bootable',
  });
}

function concat(parts: readonly Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

function lengthOf(bytes: Uint8Array): number {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(
    LENGTH_OFFSET,
    true,
  );
}

/* ==================================================================== *
 * The fake camera
 * ==================================================================== */

type Form = StagingForm;
type Model = 'verbatim' | 'reencrypt';

/**
 * What the camera stores for the bytes it was sent, per staging form and model.
 * `reencrypt` is the bench's behaviour: decode with the staging key, store under the
 * bank's own store key. The 2014 chain has no encoding to undo, so its re-encrypting
 * model is a hypothetical device that keeps the bank under a keystream of its own.
 */
function programOf(form: Form, model: Model): (payload: Uint8Array) => Uint8Array {
  if (model === 'verbatim') return (payload) => payload.slice();
  if (form === 'plain') {
    return (payload) =>
      cryptBytes(payload, stateFromKey(STORE_KEY, legacy.cipher.whiteningK), legacy.cipher);
  }
  if (form === 'key-a-ciphertext') {
    return (payload) => {
      const length = lengthOf(payload);
      const plain = cryptBytes(
        payload.subarray(0, length),
        stateFromKey(KEY_A, modern.cipher.whiteningK),
        modern.cipher,
      );
      const stored = cryptBytes(
        plain,
        stateFromKey(STORE_KEY, modern.cipher.whiteningK),
        modern.cipher,
      );
      return concat([stored, payload.subarray(length)]);
    };
  }
  return (payload) => {
    const length = lengthOf(payload);
    const plain = xorWindowVerbatim(
      payload.subarray(0, length),
      keystream(keyWordsOf(KEY_PAIRS.cp103.block0), length >>> 2),
    );
    const stored = xorWindowVerbatim(
      plain,
      keystream(keyWordsOf(KEY_PAIRS.cp103.block1), length >>> 2),
    );
    return concat([stored, payload.subarray(length)]);
  };
}

interface Camera {
  readonly device: SeekDevice;
  /** The bank as the device holds it now (64 KiB). */
  bank(): Uint8Array;
  /** The transfer checksum the commit was sent with. */
  commitSum(): number | null;
}

/**
 * A camera whose bank starts as `initial` (erased by default), accepts a staged
 * payload, and on commit programs its bank with `program`. `flipAt` corrupts one
 * byte of the bank after the program, as a faulty write would.
 */
function fakeCamera(
  program: (payload: Uint8Array) => Uint8Array,
  options: { readonly initial?: Uint8Array; readonly flipAt?: number } = {},
): Camera {
  let staged: Uint8Array[] = [];
  let bank = options.initial?.slice() ?? new Uint8Array(SLOT_BYTES).fill(0xff);
  let commit: number | null = null;
  const device = {
    transport: {
      isOpen: true,
      open: () => Promise.resolve(),
      info: { recipientFallback: null },
    },
    armWindow: (_entry: WindowEntry) => {
      staged = [];
      return Promise.resolve();
    },
    setFeaturedFirmwareData: (data: Uint8Array) => {
      staged.push(data.slice());
      return Promise.resolve();
    },
    getErrorCode: () => Promise.resolve(0),
    completeMemoryUpgrade: (sum: number) => {
      commit = sum;
      const payload = concat(staged);
      if (transferSum16(payload) !== sum)
        throw new Error('the fake camera saw a checksum it does not agree with');
      const programmed = program(payload);
      bank = new Uint8Array(SLOT_BYTES).fill(0xff);
      bank.set(programmed.subarray(0, SLOT_BYTES), 0);
      if (options.flipAt !== undefined) bank[options.flipAt] = (bank[options.flipAt] ?? 0) ^ 0x01;
      return Promise.resolve();
    },
    readWindow: () =>
      Promise.resolve({
        data: bank.slice(),
        stoppedAt: bank.length,
        stopReason: null,
        chunkUsed: 64,
      }),
  } as unknown as SeekDevice;
  return { device, bank: () => bank, commitSum: () => commit };
}

function ctxFor(device: SeekDevice, profile: FirmwareProfile): WorkflowContext {
  return { device, profile, detection: null, reporter: silentReporter };
}

/* ==================================================================== *
 * One setup per staging form: the profile, the report, and the image
 * ==================================================================== */

interface Setup {
  readonly form: Form;
  readonly profile: FirmwareProfile;
  readonly version: string;
  readonly report: SlotsReport;
  readonly image: Uint8Array;
  readonly fileName: string;
}

const KEY_A_NAME = `img${keyFilenameSuffix(SRC_A, SRC_B)}.bin`;

function setupFor(form: Form, imageLength = 0x6000): Setup {
  if (form === 'plain') {
    const profile = legacy;
    const version = '1.3.0.0';
    const state = stateFor(profile, version, [
      slotState({ key: 'b', present: true, accepts: true }),
    ]);
    return {
      form,
      profile,
      version,
      report: reportFor(state, buildSlotPlan(profile, version)),
      image: vectorImageOf(imageLength, 3),
      fileName: 'chain.bin',
    };
  }
  if (form === 'key-a-ciphertext') {
    const profile = modern;
    const version = '4.8.1.9';
    const state = stateFor(
      profile,
      version,
      [slotState({ key: 'b', present: true, accepts: true }), bootedWithApp()],
      {
        keyA: KEY_A,
        keyB: KEY_B,
      },
    );
    const image = vectorImageOf(imageLength, 5);
    /* Plant the SOURCE pair in the image, as a dump would, so retargeting has work to do. */
    image.set(SRC_A, 0x4000);
    image.set(SRC_B, 0x4020);
    return {
      form,
      profile,
      version,
      report: reportFor(state, buildSlotPlan(profile, version)),
      image,
      fileName: KEY_A_NAME,
    };
  }
  const profile = compact2016;
  const version = '1.0.3.0';
  const state = stateFor(profile, version, [slotState({ key: 'b', present: true, accepts: true })]);
  const image = vectorImageOf(imageLength, 4);
  image.set(hexToBytes(KEY_PAIRS.cp103.block0), 0x3000);
  image.set(hexToBytes(KEY_PAIRS.cp103.block1), 0x3100);
  return {
    form,
    profile,
    version,
    report: reportFor(state, buildSlotPlan(profile, version)),
    image,
    fileName: 'x.bin',
  };
}

function imagePlanOf(setup: Setup): SlotFlashPlan {
  return prepareSlotFlash(setup.report, 'b', {
    kind: 'plain',
    bytes: setup.image,
    fileName: setup.fileName,
  });
}

/** The raw bytes a write sends for an image: the image plan's own payload, unchanged. */
function rawPlanOf(setup: Setup, payload: Uint8Array): SlotFlashPlan {
  return prepareSlotFlash(setup.report, 'b', { kind: 'raw', bytes: payload, fileName: 'raw.bin' });
}

async function write(setup: Setup, camera: Camera, plan: SlotFlashPlan): Promise<FlashSlotResult> {
  return flashSlot(ctxFor(camera.device, setup.profile), setup.report, plan, {
    acknowledgeRisk: false,
  });
}

/* ==================================================================== *
 * The verdict on each form, under each model
 * ==================================================================== */

/**
 * What the verdict must be for a correct write, by staging form and device model.
 * The 2014 chain is compared byte for byte, so a device that stores other bytes
 * is reported false even if they would decrypt; the encrypting forms are compared
 * as the plain image the bank decrypts to, so both models must come out true.
 */
const CORRECT: Record<Form, Record<Model, boolean>> = {
  plain: { verbatim: true, reencrypt: false },
  'key-a-ciphertext': { verbatim: true, reencrypt: true },
  'slot-keystream-ciphertext': { verbatim: true, reencrypt: true },
};

const FORMS: readonly Form[] = ['plain', 'key-a-ciphertext', 'slot-keystream-ciphertext'];
const MODELS: readonly Model[] = ['verbatim', 'reencrypt'];

describe('the read-back verdict on each staging form, against a device that programs verbatim or re-encrypts', () => {
  for (const form of FORMS) {
    describe(`staging ${form}`, () => {
      for (const model of MODELS) {
        it(`a correct write, device ${model}: verified is ${String(CORRECT[form][model])}`, async () => {
          const setup = setupFor(form);
          const plan = imagePlanOf(setup);
          expect(plan.staging).toBe(form);
          expect(plan.expectedPlain, 'the plain image is predicted for every form').not.toBeNull();
          const camera = fakeCamera(programOf(form, model));
          const result = await write(setup, camera, plan);
          expect(result.commitStatus).toBe(0);
          expect(camera.commitSum()).toBe(plan.sum16);
          expect(result.after, 'the bank was read back').not.toBeNull();
          expect(result.verified, result.notes.join('\n')).toBe(CORRECT[form][model]);
        });

        it(`a corrupted write, device ${model}: verified is false`, async () => {
          const setup = setupFor(form);
          const plan = imagePlanOf(setup);
          const camera = fakeCamera(programOf(form, model), { flipAt: 0x3010 });
          const result = await write(setup, camera, plan);
          expect(result.commitStatus).toBe(0);
          expect(result.verified, result.notes.join('\n')).toBe(false);
        });
      }
    });
  }

  it('a re-encrypting device stores bytes that differ from the payload, and still decrypts to the image (Key A)', async () => {
    const setup = setupFor('key-a-ciphertext');
    const plan = imagePlanOf(setup);
    const camera = fakeCamera(programOf('key-a-ciphertext', 'reencrypt'));
    const result = await write(setup, camera, plan);
    const stored = camera.bank();
    expect(equalBytes(stored.subarray(0, plan.payload.length), plan.payload)).toBe(false);
    expect(result.verified, result.notes.join('\n')).toBe(true);
    expect(result.notes.join('\n')).toContain('decrypts to the expected image');
    expect(result.notes.join('\n')).not.toContain('does NOT');
  });

  it('a re-encrypting 2016 device stores bytes that differ from the payload, and the verdict is still true', async () => {
    const setup = setupFor('slot-keystream-ciphertext');
    const plan = imagePlanOf(setup);
    const camera = fakeCamera(programOf('slot-keystream-ciphertext', 'reencrypt'));
    const result = await write(setup, camera, plan);
    expect(equalBytes(camera.bank().subarray(0, plan.payload.length), plan.payload)).toBe(false);
    expect(result.verified, result.notes.join('\n')).toBe(true);
    expect(plan.expectedStored).toBeNull();
  });

  it('writing a 2016 bank its own image leaves it byte-identical, and the verdict is true (the bench fact)', async () => {
    const setup = setupFor('slot-keystream-ciphertext');
    const plan = imagePlanOf(setup);
    const program = programOf('slot-keystream-ciphertext', 'reencrypt');
    const before = program(plan.payload);
    const bankBefore = new Uint8Array(SLOT_BYTES).fill(0xff);
    bankBefore.set(before, 0);
    const camera = fakeCamera(program, { initial: bankBefore });
    const result = await write(setup, camera, plan);
    expect(equalBytes(camera.bank(), bankBefore)).toBe(true);
    expect(result.verified).toBe(true);
  });
});

/* ==================================================================== *
 * Raw bytes: the coordinator's case, and the case that cannot be compared
 * ==================================================================== */

describe('raw bytes: the verdict follows what the payload decrypts to, not the stored bytes', () => {
  it('a block-0-staged 2016 payload sent raw to a re-encrypting bank: stored bytes differ, verified is true', async () => {
    const setup = setupFor('slot-keystream-ciphertext');
    const staged = imagePlanOf(setup);
    const raw = rawPlanOf(setup, staged.payload);
    expect(
      raw.expectedStored,
      'the stored bytes of a re-encrypted payload are not predicted',
    ).toBeNull();
    expect(raw.expectedPlain && equalBytes(raw.expectedPlain, staged.expectedPlain!)).toBe(true);
    const camera = fakeCamera(programOf('slot-keystream-ciphertext', 'reencrypt'));
    const result = await write(setup, camera, raw);
    expect(equalBytes(camera.bank().subarray(0, raw.payload.length), raw.payload)).toBe(false);
    expect(result.verified, result.notes.join('\n')).toBe(true);
    expect(result.notes.join('\n')).not.toContain('does NOT');
  });

  it('a Key A payload sent raw to a re-encrypting bank: verified is true, decrypted under the camera Key A', async () => {
    const setup = setupFor('key-a-ciphertext');
    const staged = imagePlanOf(setup);
    const raw = rawPlanOf(setup, staged.payload);
    expect(raw.expectedStored).toBeNull();
    const camera = fakeCamera(programOf('key-a-ciphertext', 'reencrypt'));
    const result = await write(setup, camera, raw);
    expect(result.verified, result.notes.join('\n')).toBe(true);
  });

  it('a raw 2014 payload is compared byte for byte, and a device that stores other bytes is false', async () => {
    const setup = setupFor('plain');
    const staged = imagePlanOf(setup);
    const raw = rawPlanOf(setup, staged.payload);
    expect(raw.expectedStored?.length).toBe(SLOT_BYTES);
    const good = await write(setup, fakeCamera(programOf('plain', 'verbatim')), raw);
    expect(good.verified).toBe(true);
    const other = await write(setup, fakeCamera(programOf('plain', 'reencrypt')), raw);
    expect(other.verified).toBe(false);
    expect(other.notes.join('\n')).toContain('does NOT match the bytes the plan predicted');
  });

  it('raw 2016 bytes that decrypt to no acceptable image under either block: null, the read-back reported, not compared', async () => {
    const setup = setupFor('slot-keystream-ciphertext');
    /* A header, but nothing a stage key decrypts to the acceptance sum. */
    const junk = vectorImageOf(0x6000, 99);
    const raw = rawPlanOf(setup, junk);
    expect(raw.expectedPlain).toBeNull();
    const camera = fakeCamera(programOf('slot-keystream-ciphertext', 'verbatim'));
    const result = await write(setup, camera, raw);
    expect(result.verified).toBeNull();
    expect(result.notes.join('\n')).toContain('raw bytes: read-back reported, not compared');
    expect(result.after).not.toBeNull();
  });
});

/* ==================================================================== *
 * compareReadBack, on its own: each branch states its reason
 * ==================================================================== */

describe('compareReadBack states what it compared and why', () => {
  const cipher = modern.cipher;

  it('byte comparison: equal bytes verify, unequal bytes do not, and the first difference is named', () => {
    const stored = new Uint8Array(0x100).fill(0xff);
    stored.set([1, 2, 3, 4], 0);
    const same = compareReadBack(stored.slice(), { stored, plain: null }, cipher, 'plain');
    expect(same.verified).toBe(true);
    const wrong = stored.slice();
    wrong[9] = 0;
    const diff = compareReadBack(wrong, { stored, plain: null }, cipher, 'plain');
    expect(diff.verified).toBe(false);
    expect(diff.notes.join('\n')).toContain('first difference at 0x9');
  });

  it('a read-back of the wrong length is false, not a comparison that passes', () => {
    const stored = new Uint8Array(0x100).fill(0xff);
    const short = compareReadBack(
      stored.subarray(0, 0x80),
      { stored, plain: null },
      cipher,
      'plain',
    );
    expect(short.verified).toBe(false);
    expect(short.notes.join('\n')).toContain('predicted');
  });

  it('a bank with no image header is false when a plain image was predicted', () => {
    const plain = vectorImageOf(0x4000, 1);
    const erased = new Uint8Array(SLOT_BYTES).fill(0xff);
    const verdict = compareReadBack(erased, { stored: null, plain }, cipher, 'plain');
    expect(verdict.verified).toBe(false);
    expect(verdict.notes.join('\n')).toContain('no image header');
  });

  it('a header whose length is not the predicted image length is false, with both lengths named', () => {
    const plain = vectorImageOf(0x4000, 2);
    const other = vectorImageOf(0x5000, 2);
    const verdict = compareReadBack(other, { stored: null, plain }, cipher, 'plain');
    expect(verdict.verified).toBe(false);
    expect(verdict.notes.join('\n')).toContain('0x5000');
    expect(verdict.notes.join('\n')).toContain('0x4000');
  });

  it('a read-back too short for the image it claims is false', () => {
    const plain = vectorImageOf(0x6000, 6);
    const verdict = compareReadBack(
      plain.subarray(0, 0x1000),
      { stored: null, plain },
      cipher,
      'plain',
    );
    expect(verdict.verified).toBe(false);
  });

  it('a read-back that decrypts to a different image is false, with the first difference named', () => {
    const plain = vectorImageOf(0x4000, 8);
    /* The bank holds the image under a store key, with one byte of the image changed. */
    const stored = cryptBytes(plain, stateFromKey(STORE_KEY, cipher.whiteningK), cipher);
    const bank = new Uint8Array(SLOT_BYTES).fill(0xff);
    bank.set(stored, 0);
    bank[0x3000] = (bank[0x3000] ?? 0) ^ 0x01;
    const verdict = compareReadBack(bank, { stored: null, plain }, cipher, 'plain');
    expect(verdict.verified).toBe(false);
    expect(verdict.notes.join('\n')).toContain('first difference at image offset 0x3000');
  });

  it('nothing to compare: null, and a raw write says so in its own words', () => {
    const bank = new Uint8Array(SLOT_BYTES).fill(0xff);
    const plain = compareReadBack(bank, { stored: null, plain: null }, cipher, 'plain');
    expect(plain.verified).toBeNull();
    expect(plain.notes.join('\n')).toContain('no comparison was possible');
    const raw = compareReadBack(bank, { stored: null, plain: null }, cipher, 'raw');
    expect(raw.verified).toBeNull();
    expect(raw.notes.join('\n')).toContain('raw bytes: read-back reported, not compared');
  });
});

/* ==================================================================== *
 * A refused write verifies nothing and sends nothing past the refusal
 * ==================================================================== */

describe('flashSlot still refuses before any send, whatever the verdict would be', () => {
  it('a plan without a read window on the build is reported, and nothing is claimed', async () => {
    const setup = setupFor('plain');
    const plan = imagePlanOf(setup);
    const noRead: SlotsReport = {
      ...setup.report,
      plan: {
        ...setup.report.plan,
        slots: setup.report.plan.slots.map((s) => (s.key === 'b' ? { ...s, read: null } : s)),
      },
    };
    const camera = fakeCamera(programOf('plain', 'verbatim'));
    const result = await flashSlot(ctxFor(camera.device, setup.profile), noRead, plan, {
      acknowledgeRisk: false,
    });
    expect(result.verified).toBeNull();
    expect(result.notes.join('\n')).toContain('no read window');
  });

  it('a plan whose checksum no longer matches its payload is refused before the first send', async () => {
    const setup = setupFor('plain');
    const plan = imagePlanOf(setup);
    const edited: SlotFlashPlan = { ...plan, sum16: (plan.sum16 + 1) & 0xffff };
    const camera = fakeCamera(programOf('plain', 'verbatim'));
    const error = await write(setup, camera, edited).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(SeekError);
    expect(camera.commitSum()).toBeNull();
  });
});
