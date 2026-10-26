/* ====================================================================
 * The upload keys, derived from the booted bank and the running application
 * (`write-keys.ts`), with no camera. Each test states one fact the derivation
 * relies on, and what the page does when it does not hold.
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { bytesToHex, equalBytes, hexToBytes } from '../../src/bytes.js';
import { cryptBytes } from '../../src/crypto/cipher.js';
import { keyFilenameSuffix, stateFromKey, type PickedKeyTable } from '../../src/crypto/keys.js';
import { buildBankPayload, setAcceptSum } from '../../src/image/bank.js';
import { IMAGE_MAGIC, LENGTH_OFFSET, parseImageHeader } from '../../src/image/header.js';
import { KEY_PAIRS } from '../../src/preservation/patch.js';
import { getProfile } from '../../src/profiles/registry.js';
import type { SlotKey } from '../../src/profiles/types.js';
import type { DeviceState, SlotState } from '../../src/workflows/types.js';
import { APPLICATION_KEY_PAIRS } from '../../src/slots/application-pairs.js';
import {
  buildKeyAPayload,
  compareRows,
  retargetImageKeys,
  locateOwnKeyPair,
} from '../../src/slots/write-image.js';
import {
  cameraWriteRefusal,
  cancelPairs,
  checksUploadUnderOwnKeys,
  deriveWriteKeys,
  FF_VENDOR_STAGED,
  FF_VENDOR_STORED,
  slotWriteRefusal,
  slotWriteRefusals,
  STAGED_UNDER_IMAGE_BLOCK_0,
  stagesUnderCameraKey,
  storedUnderCheckKey,
  uploadLandsUnder,
  writeBannerOf,
  type KeyRef,
  type WriteKeys,
} from '../../src/slots/write-keys.js';

const modern = getProfile('modern-4x');

/** The bootloader's pair in the fixtures: the one a camera's key table names. */
const BOOT_A = Uint8Array.from({ length: 16 }, (_, i) => 0xa0 + i);
const BOOT_B = Uint8Array.from({ length: 16 }, (_, i) => 0xb0 + i);
/** The application pair the decoded table holds for 4.18.2.0 and 10.9.1.31 (not the bootloader's). */
const PILOT = APPLICATION_KEY_PAIRS.find((p) => p.builds.includes('Mosaic 10.9.1.31'))!;
const PILOT_A = hexToBytes(PILOT.keyA);
const PILOT_B = hexToBytes(PILOT.keyB);

function imageWith(pairs: readonly { offset: number; key: Uint8Array }[], seed = 7): Uint8Array {
  const out = new Uint8Array(0x5000);
  let s = seed;
  for (let i = 0; i < out.length; i++) {
    s = (s * 1103515245 + 12345) >>> 0;
    out[i] = s >>> 24;
  }
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x10001000, true);
  dv.setUint32(4, 0x10000101, true);
  dv.setUint32(0x200, IMAGE_MAGIC, true);
  dv.setUint32(LENGTH_OFFSET, out.length, true);
  for (const { offset, key } of pairs) out.set(key, offset);
  return out;
}

function slot(overrides: Partial<SlotState> & { key: SlotKey }): SlotState {
  return {
    name: `slot ${overrides.key}`,
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
    accepts: true,
    footerOk: true,
    sha256: null,
    keyName: null,
    bootable: false,
    bootability: 'not-bootable',
    ...overrides,
  };
}

interface CameraOptions {
  readonly version?: string;
  readonly booted?: SlotKey | null;
  readonly bootedPlain?: Uint8Array | null;
  readonly bootedKey?: string | null;
  readonly bootedBootable?: boolean;
  readonly keyTable?: { keyA: Uint8Array; keyB: Uint8Array } | null;
  readonly deviceKey?: Uint8Array | null;
  readonly bankWriteRefusals?: readonly string[];
}

/** A DeviceState carrying what the derivation reads, and nothing else. */
function camera(options: CameraOptions = {}): DeviceState {
  const version = options.version ?? '4.8.1.9';
  const booted = options.booted === undefined ? 'a' : options.booted;
  const bootedSlot = slot({
    key: 'a',
    plain: options.bootedPlain === undefined ? imageWith([]) : options.bootedPlain,
    keyName: options.bootedKey === undefined ? 'Key B' : options.bootedKey,
    bootable: options.bootedBootable ?? true,
    bootability: 'bootable',
    plainHeader: null,
  });
  const slots = [bootedSlot, slot({ key: 'b', present: true, plain: null, keyName: null })];
  const keyTable =
    options.keyTable === undefined ? { keyA: BOOT_A, keyB: BOOT_B } : options.keyTable;
  const deviceKey = options.deviceKey ?? null;
  return {
    version,
    serial: 'TESTSERIAL',
    profile: modern,
    slots,
    byKey: new Map(slots.map((s) => [s.key, s])),
    boot: booted === null ? null : { booted, target: booted === 'a' ? 'b' : 'a' },
    keyTable:
      keyTable === null
        ? null
        : ({ ...keyTable, offset: 0, matchA: true, matchB: true } as unknown as PickedKeyTable),
    keyWhiteningK: modern.cipher.whiteningK,
    deviceKeySlot: deviceKey,
    storeKey:
      deviceKey === null
        ? { name: 'Key B', key: keyTable?.keyB ?? null, programmed: false }
        : { name: 'per-device key', key: deviceKey, programmed: true },
    bankWriteRefusals: options.bankWriteRefusals ?? [],
    plainChain: false,
  } as unknown as DeviceState;
}

const refusalOf = (state: DeviceState): string | null => deriveWriteKeys(state).refusal;

describe('cancelPairs: equal keys XOR to nothing, the rest keep their order', () => {
  const k = (name: string, key: Uint8Array): KeyRef => ({ name, key });
  it('one key cancels against an equal one', () => {
    expect(
      cancelPairs([k('K', BOOT_B), k('S', BOOT_B), k('A', BOOT_A)]).map((m) => m.name),
    ).toEqual(['A']);
  });
  it('three equal keys leave one (the last one listed survives: the key is the same either way)', () => {
    expect(
      cancelPairs([k('K', BOOT_A), k('S', BOOT_A), k('A', BOOT_A)]).map((m) => m.name),
    ).toEqual(['A']);
  });
  it('three distinct keys stay three, in order', () => {
    expect(
      cancelPairs([k('K', PILOT_A), k('S', PILOT_B), k('A', BOOT_A)]).map((m) => m.name),
    ).toEqual(['K', 'S', 'A']);
  });
});

describe('deriveWriteKeys: the booted bank gives the key, the running application gives its own pair', () => {
  it('a Key B camera whose application carries the bootloader pair: the upload is the image under Key A alone', () => {
    const keys = deriveWriteKeys(
      camera({
        bootedPlain: imageWith([
          { offset: 0x4000, key: BOOT_A },
          { offset: 0x4020, key: BOOT_B },
        ]),
      }),
    );
    expect(keys.refusal).toBeNull();
    expect(keys.booted).toBe('a');
    expect(keys.atRest?.name).toBe('Key B');
    expect(keys.application?.source).toBe("the bootloader's key table");
    expect(keys.masks.map((m) => m.name)).toEqual(["the application's Key A"]);
    expect(equalBytes(keys.masks[0]!.key, BOOT_A)).toBe(true);
    expect(keys.evidence.join(' ')).toContain('the writes store every bank under it');
  });

  it('a camera whose booted bank is under Key A and whose application carries a decoded pair (10.9.1.31): three masks', () => {
    const plain = imageWith([
      { offset: 0x4100, key: PILOT_A },
      { offset: 0x4120, key: PILOT_B },
    ]);
    const keys = deriveWriteKeys(
      camera({
        version: '10.9.1.31',
        bootedPlain: plain,
        bootedKey: 'Key A',
        keyTable: { keyA: BOOT_A, keyB: BOOT_B },
      }),
    );
    expect(keys.refusal).toBeNull();
    expect(keys.atRest?.name).toBe('Key A');
    expect(keys.application?.source).toContain('Compact PRO FF 4.18.2.0, Mosaic 10.9.1.31');
    expect(keys.masks.map((m) => m.name)).toEqual([
      'Key A',
      "the application's Key B",
      "the application's Key A",
    ]);
    expect(equalBytes(keys.masks[0]!.key, BOOT_A)).toBe(true);
    expect(equalBytes(keys.masks[1]!.key, PILOT_B)).toBe(true);
    expect(equalBytes(keys.masks[2]!.key, PILOT_A)).toBe(true);
  });

  it('the same camera on a build that checks its upload (4.16.1.7) is refused, with the measured reason', () => {
    const plain = imageWith([
      { offset: 0x4100, key: PILOT_A },
      { offset: 0x4120, key: PILOT_B },
    ]);
    const reason = refusalOf(
      camera({
        version: '4.16.1.7',
        bootedPlain: plain,
        bootedKey: 'Key A',
        keyTable: { keyA: BOOT_A, keyB: BOOT_B },
      }),
    );
    expect(reason).toMatch(/checks an upload under its own keys/);
    expect(reason).toMatch(/neither its Key A nor its store key/);
  });

  it("a checking build accepts a booted key equal to the application's Key A (the store-key form is not the only one)", () => {
    const plain = imageWith([
      { offset: 0x4100, key: PILOT_A },
      { offset: 0x4120, key: PILOT_B },
    ]);
    const keys = deriveWriteKeys(
      camera({
        version: '4.16.1.7',
        bootedPlain: plain,
        bootedKey: 'Key A',
        keyTable: { keyA: PILOT_A, keyB: BOOT_B },
      }),
    );
    expect(keys.refusal).toBeNull();
    expect(keys.masks.map((m) => m.name)).toEqual(["the application's Key B"]);
  });

  it('a per-device key is the store key, and the application needs only its Key A', () => {
    const device = Uint8Array.from({ length: 16 }, (_, i) => 0x31 + i);
    const plain = imageWith([{ offset: 0x4000, key: BOOT_A }]);
    const keys = deriveWriteKeys(
      camera({ bootedPlain: plain, bootedKey: 'per-device key', deviceKey: device }),
    );
    expect(keys.refusal).toBeNull();
    expect(keys.store?.name).toBe('the per-device key');
    expect(keys.application?.keyB).toBeNull();
    expect(keys.masks.map((m) => m.name)).toEqual(["the application's Key A"]);
  });

  it("a booted bank under Key A, with the store key the bootloader's Key B: the writes keep the old bytes (store key)", () => {
    /* The form every passing row sends: the booted bank holds Key A, the application stores under the bootloader's Key B. */
    const plain = imageWith([
      { offset: 0x4000, key: BOOT_A },
      { offset: 0x4020, key: BOOT_B },
    ]);
    const keys = deriveWriteKeys(camera({ bootedPlain: plain, bootedKey: 'Key A' }));
    expect(keys.refusal).toBeNull();
    expect(keys.bootedKeyName).toBe('Key A');
    expect(keys.atRest?.name).toBe('Key B');
    expect(keys.masks.map((m) => m.name)).toEqual(["the application's Key A"]);
    const image = setAcceptSum(
      imageWith([{ offset: 0x4000, key: BOOT_A }], 6),
      modern.cipher,
    ).image;
    const derived = buildKeyAPayload(
      image,
      keys.masks.map((m) => m.key),
      null,
      modern,
    ).payload;
    expect(equalBytes(derived, buildBankPayload(image, BOOT_A, null, modern.cipher).payload)).toBe(
      true,
    );
  });

  it('the refusals each name what was measured', () => {
    expect(refusalOf(camera({ booted: null }))).toMatch(/could not be named/);
    expect(refusalOf(camera({ bootedPlain: null }))).toMatch(/does not decrypt to an image/);
    expect(refusalOf(camera({ bootedBootable: false, bootedKey: 'unknown key' }))).toMatch(
      /decrypts under no key the bootloader tries/,
    );
    expect(refusalOf(camera({ bootedKey: 'Key B', keyTable: null }))).toMatch(
      /key table does not carry that key/,
    );
    expect(refusalOf(camera({ bootedPlain: imageWith([]) }))).toMatch(
      /carries none of the key pairs this page knows/,
    );
  });

  it('a build the table does not list is treated as checking: its booted key must then be a store or Key A key', () => {
    expect(checksUploadUnderOwnKeys('10.9.1.31')).toBe(false);
    expect(checksUploadUnderOwnKeys('4.9.1.15')).toBe(false);
    expect(checksUploadUnderOwnKeys('4.8.1.9')).toBe(true);
    expect(checksUploadUnderOwnKeys('99.9.9.9')).toBe(true);
    expect(checksUploadUnderOwnKeys(null)).toBe(true);
  });
});

describe("the upload, built and run through the device's own two passes", () => {
  it('lands the image under the booted key on every derived form', () => {
    const plain = imageWith([
      { offset: 0x4100, key: PILOT_A },
      { offset: 0x4120, key: PILOT_B },
    ]);
    const state = camera({
      version: '10.9.1.31',
      bootedPlain: plain,
      bootedKey: 'Key A',
      keyTable: { keyA: BOOT_A, keyB: BOOT_B },
    });
    const keys = deriveWriteKeys(state);
    const image = setAcceptSum(
      imageWith([{ offset: 0x4000, key: BOOT_A }], 3),
      modern.cipher,
    ).image;
    const staged = buildKeyAPayload(
      image,
      keys.masks.map((m) => m.key),
      null,
      modern,
    );
    expect(uploadLandsUnder(keys, modern.cipher, staged.stamped, staged.payload)).toBeNull();
  });

  it('a stored key the derivation did not choose is caught before anything is sent', () => {
    const plain = imageWith([
      { offset: 0x4100, key: PILOT_A },
      { offset: 0x4120, key: PILOT_B },
    ]);
    const keys = deriveWriteKeys(
      camera({
        version: '10.9.1.31',
        bootedPlain: plain,
        bootedKey: 'Key A',
        keyTable: { keyA: BOOT_A, keyB: BOOT_B },
      }),
    );
    const image = setAcceptSum(imageWith([], 4), modern.cipher).image;
    const staged = buildKeyAPayload(
      image,
      keys.masks.map((m) => m.key),
      null,
      modern,
    );
    const wrong: WriteKeys = { ...keys, store: { name: 'a key it does not use', key: BOOT_A } };
    expect(uploadLandsUnder(wrong, modern.cipher, staged.stamped, staged.payload)).toMatch(
      /does not decrypt under Key A/,
    );
  });

  it('with the store key as the booted key, the payload is byte-identical to the bootloader-Key-A form', () => {
    const keys = deriveWriteKeys(
      camera({
        bootedPlain: imageWith([
          { offset: 0x4000, key: BOOT_A },
          { offset: 0x4020, key: BOOT_B },
        ]),
      }),
    );
    const image = setAcceptSum(
      imageWith([{ offset: 0x4000, key: BOOT_A }], 5),
      modern.cipher,
    ).image;
    const derived = buildKeyAPayload(
      image,
      keys.masks.map((m) => m.key),
      null,
      modern,
    ).payload;
    const legacy = buildBankPayload(image, BOOT_A, null, modern.cipher).payload;
    expect(equalBytes(derived, legacy)).toBe(true);
    /* And the device's two passes cancel to the same stored bytes: the image under the booted key. */
    const stored = cryptBytes(
      cryptBytes(
        derived.subarray(0, image.length),
        stateFromKey(BOOT_A, modern.cipher.whiteningK),
        modern.cipher,
      ),
      stateFromKey(BOOT_B, modern.cipher.whiteningK),
      modern.cipher,
    );
    expect(
      equalBytes(
        cryptBytes(stored, stateFromKey(BOOT_B, modern.cipher.whiteningK), modern.cipher),
        image,
      ),
    ).toBe(true);
  });
});

describe('the camera-wide refusal is the read’s own list (TESTING.md 42.89)', () => {
  it('a camera the read refuses nothing for has no camera-wide refusal: the derivation decides', () => {
    expect(cameraWriteRefusal(camera())).toBeNull();
  });

  it('a camera-wide refusal refuses, says which, and is the writer’s list', () => {
    const state = camera({ bankWriteRefusals: ['this camera could not be read'] });
    expect(cameraWriteRefusal(state)).toBe(
      'this camera cannot be written from here: this camera could not be read',
    );
    expect(slotWriteRefusals(state)).toEqual(['this camera could not be read']);
  });

  it('on the Key A line, a derivation that fails is the writer’s list when the read refused nothing', () => {
    const state = camera({ bootedKey: 'unknown key' });
    expect(cameraWriteRefusal(state)).toBeNull();
    expect(slotWriteRefusals(state)).toEqual([refusalOf(state)]);
  });
});

describe('an unnamed image is retargeted by the pair it carries, found by value', () => {
  it("an image that carries a decoded application pair is retargeted to this camera's pair", () => {
    const image = imageWith([
      { offset: 0x4000, key: PILOT_A },
      { offset: 0x4020, key: PILOT_B },
    ]);
    expect(locateOwnKeyPair(image, { keyA: BOOT_A, keyB: BOOT_B })).toEqual({
      keyA: PILOT_A,
      keyB: PILOT_B,
    });
    const out = retargetImageKeys(image, 'image.bin', { keyA: BOOT_A, keyB: BOOT_B });
    expect(equalBytes(out.subarray(0x4000, 0x4010), BOOT_A)).toBe(true);
    expect(equalBytes(out.subarray(0x4020, 0x4030), BOOT_B)).toBe(true);
  });

  it('an image with no known pair is still refused, with the sentence that says why', () => {
    expect(() =>
      retargetImageKeys(imageWith([]), 'image.bin', { keyA: BOOT_A, keyB: BOOT_B }),
    ).toThrow(/neither this camera's pair nor a decoded application pair occurs/);
  });

  it('a file named with its pair still goes by the name', () => {
    const named = `img${keyFilenameSuffix(BOOT_A, BOOT_B)}.bin`;
    const image = imageWith([
      { offset: 0x4000, key: BOOT_A },
      { offset: 0x4020, key: BOOT_B },
    ]);
    expect(retargetImageKeys(image, named, { keyA: BOOT_A, keyB: BOOT_B })).toEqual(image);
  });
});

describe('the 2016 line stages from the image alone', () => {
  it('its payload does not depend on the target bank: a blank bank and a full one stage the same bytes', async () => {
    const { buildSlotKeystreamPayload } = await import('../../src/slots/write-image.js');
    const { KEY_PAIRS } = await import('../../src/preservation/patch.js');
    const cp103 = getProfile('compact-2016');
    const image = imageWith([]);
    image.set(hexToBytes(KEY_PAIRS.cp103.block0), 0x3000);
    image.set(hexToBytes(KEY_PAIRS.cp103.block1), 0x3100);
    const first = buildSlotKeystreamPayload(image, cp103.cipher);
    const second = buildSlotKeystreamPayload(image.slice(), cp103.cipher);
    expect(equalBytes(first.payload, second.payload)).toBe(true);
  });
});

/* ==================================================================== *
 * The 2016 Compact PRO (TESTING.md 42.84). Its writes stage each image under the image's own key
 * block 0, and the camera re-keys the upload into the key its bootloader checks a bank under
 * (device-info.ts `checkKeyOf`). Since the read names the booted bank on this line (`state.boot`), the
 * derivation used to run on it and refused: "the booted bank A decrypts under key block 1, but this
 * camera's key table does not carry that key".
 * ==================================================================== */

/** A 1.0.3.0 camera read under compact-2016, with its check key named from slot A, or not. */
function camera2016(options: { readonly checkKeyNamed?: boolean } = {}): DeviceState {
  const named = options.checkKeyNamed ?? true;
  const keyName = named ? 'key block 1' : 'unknown key';
  const banks = (['a', 'b', 'r'] as const).map((key) =>
    slot({
      key,
      plain: imageWith([]),
      keyName,
      bootable: named,
      bootability: named ? 'bootable' : 'unknown',
    }),
  );
  const checkKey = named
    ? {
        name: 'key block 1',
        key: BOOT_B,
        from: 'a' as const,
        inferred: false,
        pair: null,
        unnamedWhy: null,
        why: 'check key: key block 1',
      }
    : {
        name: null,
        key: null,
        from: null,
        inferred: false,
        pair: null,
        unnamedWhy: "the camera's active-slot word (fw info roots, selector 10) could not be read",
        why: 'check key not named',
      };
  return {
    version: '1.0.3.0',
    serial: null,
    profile: getProfile('compact-2016'),
    slots: banks,
    byKey: new Map(banks.map((s) => [s.key, s])),
    boot: named ? { booted: 'a', target: 'b' } : null,
    keyTable: null,
    keyWhiteningK: 0,
    storeKey: {
      name: checkKey.name ?? 'the key its bootloader checks a bank under',
      key: checkKey.key,
      programmed: false,
    },
    deviceKeySlot: null,
    bankWriteRefusals: [],
    plainChain: false,
    checkKey,
  } as unknown as DeviceState;
}

describe('the 2016 line: the image under its own key block 0, stored by the camera under the check key', () => {
  it('derives nothing from the camera and refuses nothing, though the booted bank is named', () => {
    const state = camera2016();
    const keys = deriveWriteKeys(state);
    expect(keys.refusal).toBeNull();
    expect(keys.form).toBe('image-block-0');
    expect(keys.booted).toBe('a');
    expect(keys.bootedKeyName).toBe('key block 1');
    expect(keys.atRest?.name).toBe('key block 1');
    expect(equalBytes(keys.atRest?.key ?? new Uint8Array(), BOOT_B)).toBe(true);
    expect(keys.application).toBeNull();
    expect(keys.store).toBeNull();
    expect(keys.masks).toEqual([]);
    expect(keys.evidence.join(' ')).not.toContain('key table does not carry that key');
    expect(keys.evidence[0]).toBe(
      'the 2016 Compact PRO line: an upload is the image XORed with the keystream of its own key ' +
        'block 0, found in the image by value, so no key of this camera builds it',
    );
    expect(keys.evidence[1]).toContain(
      'the key its bootloader checks a bank under (named from slot A, the bank the camera reports it entered)',
    );
    expect(slotWriteRefusal(state)).toBeNull();
    expect(writeBannerOf(state)).toBeNull();
  });

  it('says the check key is inferred in its evidence when it was named from a bank entered unchecked (TESTING.md 42.89)', () => {
    const base = camera2016();
    const state = {
      ...base,
      checkKey: { ...base.checkKey, from: 'r', inferred: true },
    } as DeviceState;
    const keys = deriveWriteKeys(state);
    expect(keys.refusal).toBeNull();
    expect(keys.atRest?.name).toBe('key block 1');
    expect(keys.evidence[1]).toContain(
      '(inferred from recovery R, the bank the camera reports it entered, which the bootloader entered ' +
        'without its check)',
    );
  });

  it('says the stored key is not named, and still refuses nothing, when the read could not name it', () => {
    const state = camera2016({ checkKeyNamed: false });
    const keys = deriveWriteKeys(state);
    expect(keys.refusal).toBeNull();
    expect(keys.form).toBe('image-block-0');
    expect(keys.atRest).toBeNull();
    expect(keys.evidence[1]).toBe(
      'the camera decrypts the upload with that key and re-encrypts it under the key its bootloader ' +
        "checks a bank under; that key was not named on this read (the camera's active-slot word (fw " +
        'info roots, selector 10) could not be read), and the write does not need it: the bank is read ' +
        'back as the image it decrypts to',
    );
    expect(writeBannerOf(state)).toBeNull();
  });

  it('says how the upload is staged and what the bank is stored under, in the words the page and the CLI show', () => {
    expect(STAGED_UNDER_IMAGE_BLOCK_0).toBe(
      "the image under its own key block 0 (found in the image by value), to any bank; this camera's keys are not used",
    );
    expect(storedUnderCheckKey(deriveWriteKeys(camera2016()))).toBe(
      'key block 1, the key its bootloader checks a bank under; the camera re-encrypts the upload under it',
    );
    expect(storedUnderCheckKey(deriveWriteKeys(camera2016({ checkKeyNamed: false })))).toBe(
      'the key its bootloader checks a bank under (not named on this read); the camera re-encrypts the upload under it',
    );
  });

  it('is the same form on a 2016 camera read under legacy-auth, where no check key is named', () => {
    const state = {
      ...camera2016(),
      profile: getProfile('legacy-auth'),
      checkKey: null,
    } as DeviceState;
    const keys = deriveWriteKeys(state);
    expect(keys.form).toBe('image-block-0');
    expect(keys.refusal).toBeNull();
    expect(keys.atRest).toBeNull();
  });
});

describe('the 2016 staging note says what staging needs', () => {
  it('no longer claims the keystream comes from the target bank', async () => {
    const { stagingNote } = await import('../../src/slots/capability-notes.js');
    const note = stagingNote('locked-2016') ?? '';
    expect(note).not.toMatch(/recovered from a readable copy of THIS bank/);
    expect(note).toMatch(/Nothing is read from the target bank to stage it/);
  });
});

/* ==================================================================== *
 * The 2014 plaintext chain (TESTING.md 42.13). The bench Compact PIR206, 1.3.0.0 "Oct 21 2014",
 * as the analysis read it (the serial omitted): banks A and R hold the image stored plain, the
 * identity keystream and word sum 0; B is erased; no key table is read; the store key is Key B,
 * not programmed. Its banks name no key: identifyKey gives the plain identity keystream the
 * placeholder name, and the chain's own verdict makes the banks bootable. The page said "No bank of
 * this camera can be written from here" for it, from the key derivation, which has no key to read.
 * ==================================================================== */

/** The bench camera's read, minus its serial: what `deriveWriteKeys` and `slotWriteRefusal` see. */
function plainChainCamera(overrides: Partial<DeviceState> = {}): DeviceState {
  const plain = new Uint8Array(47768).fill(0x11);
  const bootedSlot = slot({
    key: 'a',
    present: true,
    plain,
    plainHeader: null,
    keyName: null,
    bootable: true,
    bootability: 'bootable',
  });
  const erased = slot({ key: 'b', present: false, blank: true, plain: null, keyName: null });
  const recovery = slot({
    key: 'r',
    present: true,
    plain,
    plainHeader: null,
    keyName: null,
    bootable: true,
    bootability: 'bootable',
  });
  const slots = [bootedSlot, erased, recovery];
  return {
    version: '1.3.0.0',
    serial: null,
    profile: getProfile('legacy-auth'),
    slots,
    byKey: new Map(slots.map((s) => [s.key, s])),
    boot: { booted: 'a', target: 'b' },
    keyTable: null,
    keyTableCandidates: 0,
    keyWhiteningK: 0,
    storeKey: { name: 'Key B', key: null, programmed: false },
    deviceKeySlot: null,
    bankWriteRefusals: [],
    plainChain: true,
    cfg0: 0,
    ...overrides,
  } as unknown as DeviceState;
}

describe('the camera-wide refusal: a bank the read could not read, or the upgrade target, refuses no other bank', () => {
  /** The 2014 chain camera with bank B unread: the read refuses that bank by name, not the camera. */
  function withUnreadB(): DeviceState {
    const base = plainChainCamera();
    const unreadB = slot({
      key: 'b',
      name: 'slot B',
      present: false,
      unread: true,
      reason: 'the window would not arm',
      plain: null,
    });
    const slots = [...base.slots.filter((s) => s.key !== 'b'), unreadB];
    return { ...base, slots, byKey: new Map(slots.map((s) => [s.key, s])) };
  }

  it('a bank the read could not read does not put the banner on the camera: A and R stay writable', () => {
    const state = withUnreadB();
    expect(cameraWriteRefusal(state)).toBeNull();
    expect(slotWriteRefusal(state)).toBeNull();
  });

  it('a booted bank that cannot be named does not refuse the slot page: the bank is named by the acknowledgement', () => {
    const state = plainChainCamera({ boot: null });
    expect(cameraWriteRefusal(state)).toBeNull();
    expect(slotWriteRefusal(state)).toBeNull();
  });

  it('a camera-wide reason refuses the camera, and says which', () => {
    const state = plainChainCamera({
      boot: null,
      bankWriteRefusals: ['the camera reports a build this page does not write'],
    });
    expect(cameraWriteRefusal(state)).toMatch(
      /the camera reports a build this page does not write/,
    );
  });

  it('an unconfirmed key table refuses a camera whose writes are sent under its own key (Key A staging)', () => {
    const state = camera({ bankWriteRefusals: ["this camera's key table could not be confirmed"] });
    expect(stagesUnderCameraKey(state)).toBe(true);
    expect(slotWriteRefusal(state)).toMatch(/key table could not be confirmed/);
    expect(writeBannerOf(state)).toMatch(/key table could not be confirmed/);
  });

  it('the 2016 line stages from its own image, so the camera’s key is not asked for', () => {
    const state = plainChainCamera({ version: '1.0.3.0', plainChain: false });
    expect(stagesUnderCameraKey(state)).toBe(false);
    expect(slotWriteRefusal(state)).toBeNull();
    expect(writeBannerOf(state)).toBeNull();
  });

  it('a camera whose whole read failed still refuses every bank, and says so', () => {
    const state = plainChainCamera({ bankWriteRefusals: ['this camera could not be read'] });
    expect(slotWriteRefusal(state)).toMatch(/this camera could not be read/);
  });
});

describe('the 2014 plaintext chain: no key is derived, so no bank is refused for one', () => {
  it('derives no upload key, and the write verdict is open', () => {
    const state = plainChainCamera();
    const keys = deriveWriteKeys(state);
    expect(keys.refusal).toBeNull();
    expect(keys.form).toBe('plain');
    expect(keys.atRest).toBeNull();
    expect(keys.masks).toEqual([]);
    expect(slotWriteRefusal(state)).toBeNull();
  });

  it('the compare table shows a bank with an image and no key as stored plain, and an empty bank as no image', () => {
    const plainKeyRow = compareRows(
      { header: parseImageHeader(imageWith([])), sha256: null, keyName: null },
      { plain: null, storedPredicted: false, keyName: 'none (plaintext)' },
    ).find((r) => r.field === 'Key');
    expect(plainKeyRow?.before).toBe('none (plaintext)');
    const emptyKeyRow = compareRows(
      { header: null, sha256: null, keyName: null },
      { plain: null, storedPredicted: false, keyName: 'none (plaintext)' },
    ).find((r) => r.field === 'Key');
    expect(emptyKeyRow?.before).toBe('(no image)');
  });

  it('says nothing of the placeholder: the verdict names no key the chain does not have', () => {
    expect(JSON.stringify(deriveWriteKeys(plainChainCamera()))).not.toContain('unknown key');
  });

  it('still applies the camera-wide refusal: a real blocking reason refuses the writes', () => {
    const state = plainChainCamera({
      bankWriteRefusals: ['the camera reports a build this page does not write'],
    });
    expect(slotWriteRefusal(state)).toContain(
      'the camera reports a build this page does not write',
    );
  });
});

describe('the placeholder name is not a key on a keyed camera either', () => {
  it('a booted bank that is bootable under the placeholder is refused for the key it lacks, without naming the placeholder', () => {
    const refusal = refusalOf(camera({ bootedBootable: true, bootedKey: 'unknown key' }));
    expect(refusal).toMatch(/decrypts under no key the bootloader tries/);
    expect(refusal).not.toMatch(/unknown key/);
  });
});

/* ==================================================================== *
 * The 1.3.0.8 FF (16 Hz) build on a camera with no bank stored plain (TESTING.md 42.12, 42.89). The FF image
 * is staged as the vendor app stages it (the image XOR its own key block 0) and stored by the camera under
 * Key B; the writer offers it with its UNTESTED warning. The list said its write keys were "refused" (the
 * Key A line's derivation, which this build does not use); the page said the image was staged "under the key
 * pair the image carries". Both now say the vendor form, in core's words.
 * ==================================================================== */

describe('the 1.3.0.8 FF build with no bank stored plain: the vendor form, not a refusal', () => {
  const ff = (): DeviceState =>
    plainChainCamera({ version: '1.3.0.8', plainChain: false, boot: null });

  it('names the vendor form and Key B, derives nothing from the camera, and refuses nothing', () => {
    const keys = deriveWriteKeys(ff());
    expect(keys.form).toBe('ff-vendor');
    expect(keys.refusal).toBeNull();
    expect(keys.atRest?.name).toBe('Key B');
    expect(bytesToHex(keys.atRest?.key ?? new Uint8Array())).toBe(KEY_PAIRS.ff1308.block1);
    expect(keys.application).toBeNull();
    expect(keys.masks).toEqual([]);
    expect(keys.evidence.join(' ')).toContain('no bank this read opened is stored plain');
    expect(keys.evidence.join(' ')).toContain('UNTESTED');
    expect(slotWriteRefusal(ff())).toBeNull();
    expect(writeBannerOf(ff())).toBeNull();
  });

  it('says how the upload is staged and what the bank is stored under, in the words the page and the CLI show', () => {
    expect(FF_VENDOR_STAGED).toBe(
      'the 1.3.0.8 FF (16 Hz) image as the vendor app stages it: the image XOR its own key block 0 (Key A), ' +
        "header window verbatim, to any bank; this camera's keys are not used",
    );
    expect(FF_VENDOR_STORED).toBe(
      'Key B: the camera re-keys the upload with key block 1 and stores the image under it',
    );
  });

  it('keeps a 1.3.0.8 camera whose banks are stored plain on the plain chain', () => {
    expect(deriveWriteKeys(plainChainCamera({ version: '1.3.0.8' })).form).toBe('plain');
  });
});
