/* ==================================================================== *
 * The 2016 Compact PRO's check key (device-info.ts `checkKeyOf`) and the report rows built on it
 * (workflows/device-report.ts), TESTING.md 42.84. No camera: `checkKeyOf` is pure over the read's
 * analysis, and the rows over the DeviceState the read returns. The read itself, end to end on a fake
 * 1.0.3.0 camera, is in workflows.test.ts ("a 2016 Compact PRO (1.0.3.0), read and judged").
 *
 * THE RULE UNDER TEST. The 2016 bootloader enters a bank only after `image_sum_ok_device_seeded` passes on
 * it, except the last bank of the boot-config word's order (FW-V1
 * targets/compact_pro_9hz_1_0_3_0_bootloader/src/image.c:1076-1109), and records the bank it entered (the
 * active-slot word, TESTING.md 42.56). So the bank it entered names the key it checks under, when the word
 * says it was checked; and from a bootloader above 1.1.0.0 that key is its key block 1 (crypto.c:233-247).
 * A bank entered unchecked (the last of the order) still runs under that key (startup.c decrypts whatever it
 * enters under the device-seeded stream), so it names the key too, marked inferred (TESTING.md 42.89).
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import { bytesToHex, hexToBytes } from '../src/bytes.js';
import { stateFromKey } from '../src/crypto/keys.js';
import { KEY_PAIRS } from '../src/preservation/patch.js';
import { compact2016 } from '../src/profiles/compact-2016.js';
import { bankNameOf } from '../src/profiles/locked-boot.js';
import { legacyAuth } from '../src/profiles/legacy-auth.js';
import { getProfile } from '../src/profiles/registry.js';
import type { FirmwareProfile, SlotKey } from '../src/profiles/types.js';
import {
  checkKeyNameOf,
  checkKeyOf,
  storeKeyDescription,
  unknownBootabilityWhy,
  type CheckKeyBank,
} from '../src/workflows/device-info.js';
import {
  bankWritingOf,
  bootedReportOf,
  checkKeyReportOf,
  lastStartReportOf,
  keyReportRows,
  nextStartReportOf,
} from '../src/workflows/device-report.js';
import type { CheckKey, DeviceState, SlotState } from '../src/workflows/types.js';

const BLOCK_1 = hexToBytes(KEY_PAIRS.cp103.block1);
const OTHER_KEY = Uint8Array.from({ length: 16 }, (_, i) => (i * 37 + 11) & 0xff);

/** A bank as the read analysed it: read, decrypting to a zero sum, under `key`. */
function bankUnder(key: Uint8Array, options: { accepts?: boolean } = {}): CheckKeyBank {
  return {
    present: true,
    accepts: options.accepts ?? true,
    recovered: { state: stateFromKey(key, 0) },
  } as unknown as CheckKeyBank;
}

function checkKeyFor(options: {
  readonly cfg0?: number | null;
  readonly activeSlotWord?: number | null;
  readonly bootloaderVersion?: string | null;
  readonly banks?: Partial<Record<SlotKey, CheckKeyBank | undefined>>;
}): CheckKey {
  const banks: Record<SlotKey, CheckKeyBank | undefined> = {
    a: bankUnder(BLOCK_1),
    b: bankUnder(BLOCK_1),
    r: bankUnder(BLOCK_1),
    ...options.banks,
  };
  return checkKeyOf({
    cfg0: options.cfg0 === undefined ? 0xffffffff : options.cfg0,
    activeSlotWord: options.activeSlotWord === undefined ? 0 : options.activeSlotWord,
    bootloaderVersion:
      options.bootloaderVersion === undefined ? '1.2.0.0' : options.bootloaderVersion,
    whiteningK: 0,
    slotOf: (key) => banks[key],
  });
}

describe('checkKeyOf: the key the 2016 bootloader checks a bank under, from the bank it entered', () => {
  it('names key block 1 from slot A, entered first and checked under the erased record', () => {
    const key = checkKeyFor({});
    expect(key.name).toBe('key block 1');
    expect(bytesToHex(key.key ?? new Uint8Array())).toBe(KEY_PAIRS.cp103.block1);
    expect(key.from).toBe('a');
    expect(key.inferred).toBe(false);
    expect(key.pair).toBe('the Compact PRO 1.0.3.x 9 Hz pair');
    expect(key.unnamedWhy).toBeNull();
    expect(key.why).toBe(
      `check key: key block 1 ${KEY_PAIRS.cp103.block1} (the Compact PRO 1.0.3.x 9 Hz pair's block 1), ` +
        'named from slot A: the 2016 bootloader enters a bank only after it decrypts to a zero word sum ' +
        'under this key, and the camera reports it entered slot A after that check',
    );
  });

  it('names the FF pair, and claims no pair for a key the corpus does not hold', () => {
    const ff = hexToBytes(KEY_PAIRS.cp1032ff.block1);
    expect(checkKeyFor({ banks: { a: bankUnder(ff) } }).pair).toBe(
      'the Compact PRO 1.0.3.x FF pair',
    );
    const other = checkKeyFor({ banks: { a: bankUnder(OTHER_KEY) } });
    expect(other.pair).toBeNull();
    expect(other.name).toBe('key block 1');
  });

  it('names it from slot B under word 1, and from recovery R under word 2: both are checked first', () => {
    expect(checkKeyFor({ cfg0: 1, activeSlotWord: 1 }).from).toBe('b');
    expect(checkKeyFor({ cfg0: 2, activeSlotWord: 2 }).from).toBe('r');
    /* slot A entered second under word 1: checked, so it names the key too */
    expect(checkKeyFor({ cfg0: 1, activeSlotWord: 0 }).from).toBe('a');
  });

  it('names nothing when the active-slot word was not read', () => {
    const key = checkKeyFor({ activeSlotWord: null });
    expect(key.key).toBeNull();
    expect(key.name).toBeNull();
    expect(key.unnamedWhy).toBe(
      "the camera's active-slot word (fw info roots, selector 10) could not be read",
    );
    expect(key.why).toBe(
      "check key not named: the camera's active-slot word (fw info roots, selector 10) could not be " +
        'read, so whether the bootloader takes each bank is not known',
    );
  });

  it('names nothing when the word names no bank', () => {
    expect(checkKeyFor({ activeSlotWord: 7 }).unnamedWhy).toBe(
      "the camera's active-slot word is 7, which names no bank",
    );
  });

  it('names nothing when the boot-config word was not read', () => {
    expect(checkKeyFor({ cfg0: null }).unnamedWhy).toBe(
      'the boot-config word was not read, so whether the bootloader checked slot A before it entered ' +
        'it is not known',
    );
  });

  it('names the key from a bank entered unchecked, and says it is inferred: recovery R under the erased record', () => {
    const key = checkKeyFor({ activeSlotWord: 2 });
    expect(key.name).toBe('key block 1');
    expect(bytesToHex(key.key ?? new Uint8Array())).toBe(KEY_PAIRS.cp103.block1);
    expect(key.from).toBe('r');
    expect(key.inferred).toBe(true);
    expect(key.unnamedWhy).toBeNull();
    expect(key.why).toBe(
      `check key: key block 1 ${KEY_PAIRS.cp103.block1} (the Compact PRO 1.0.3.x 9 Hz pair's block 1), ` +
        'inferred from recovery R: the camera reports it entered recovery R, which the boot-config word ' +
        '0xFFFFFFFF leaves to last, so the bootloader entered it without its check, and the 2016 ' +
        'bootloader runs every bank it enters under the key it checks the other banks under, so recovery ' +
        "R's key is that key; the check did not pass on recovery R, so the key is inferred",
    );
    /* slot B, last under word 2 (recovery R first, then A, then B) */
    const b = checkKeyFor({ cfg0: 2, activeSlotWord: 1 });
    expect(b.from).toBe('b');
    expect(b.inferred).toBe(true);
    /* recovery R first under word 2: checked */
    expect(checkKeyFor({ cfg0: 2, activeSlotWord: 2 }).inferred).toBe(false);
  });

  it('names nothing from a bank entered unchecked that does not decrypt to a zero sum on this read', () => {
    const key = checkKeyFor({
      activeSlotWord: 2,
      banks: { r: bankUnder(BLOCK_1, { accepts: false }) },
    });
    expect(key.key).toBeNull();
    expect(key.inferred).toBe(false);
    expect(key.unnamedWhy).toBe(
      'the camera reports it entered recovery R, which the boot-config word 0xFFFFFFFF leaves to last, ' +
        'so the bootloader entered it without its check, but recovery R does not decrypt to a zero word ' +
        'sum on this read',
    );
  });

  it('names nothing when the bank it entered does not decrypt to a zero sum on this read', () => {
    const key = checkKeyFor({ banks: { a: bankUnder(BLOCK_1, { accepts: false }) } });
    expect(key.key).toBeNull();
    expect(key.unnamedWhy).toBe(
      'the camera reports it entered slot A, but slot A does not decrypt to a zero word sum on this read',
    );
    expect(checkKeyFor({ banks: { a: undefined } }).key).toBeNull();
  });
});

describe('checkKeyNameOf: block 1 above bootloader 1.1.0.0, the device words at or below it', () => {
  it('follows prng_seed_device_or_key’s `v <= 0x01010000` test', () => {
    expect(checkKeyNameOf('1.2.0.0')).toBe('key block 1');
    expect(checkKeyNameOf('1.1.0.1')).toBe('key block 1');
    expect(checkKeyNameOf('1.1.0.0')).toBe('the device key');
    expect(checkKeyNameOf('0.9.0.0')).toBe('the device key');
    expect(checkKeyNameOf(null)).toBe('the device-seeded key');
    expect(checkKeyNameOf('1.2')).toBe('the device-seeded key');
  });
});

/* ---- the report rows -------------------------------------------------------------------------- */

const NAMED: CheckKey = checkKeyFor({});
const UNNAMED: CheckKey = checkKeyFor({ activeSlotWord: null });

/** A bank the read opened and the check key passed (its bytes are not looked at on this line). */
function slot(key: SlotKey, name: string): SlotState {
  return {
    key,
    name,
    unread: false,
    blank: false,
    raw: new Uint8Array(0x10000),
    bootability: 'bootable',
  } as unknown as SlotState;
}

/** A DeviceState as the read returns it for a 2016 camera, with what the rows read. */
function state2016(
  options: {
    readonly checkKey?: CheckKey | null;
    readonly activeSlotWord?: number | null;
    readonly bankWriteRefusals?: readonly string[];
    readonly profile?: FirmwareProfile;
  } = {},
): DeviceState {
  const slots = [slot('a', 'Slot A'), slot('b', 'Slot B'), slot('r', 'Recovery R')];
  const checkKey = options.checkKey === undefined ? NAMED : options.checkKey;
  return {
    profile: options.profile ?? compact2016,
    version: '1.0.3.0',
    plainChain: false,
    cfg0: 0xffffffff,
    activeSlotWord: options.activeSlotWord === undefined ? 0 : options.activeSlotWord,
    slots,
    byKey: new Map(slots.map((s) => [s.key, s])),
    boot: { booted: 'a', target: 'b' },
    checkKey,
    keyTable: null,
    keyTableCandidates: 0,
    keyWhiteningK: 0,
    deviceKeySlot: null,
    storeKey: {
      name: checkKey?.name ?? 'the key its bootloader checks a bank under',
      key: null,
      programmed: false,
    },
    bankWriteRefusals: [...(options.bankWriteRefusals ?? [])],
  } as unknown as DeviceState;
}

const nameOf = (key: SlotKey): string => bankNameOf(key);

describe('the report rows on the 2016 line (seek-fw info and the Info tab)', () => {
  it('says the booted bank is the bootloader’s record of this start, and names the next start', () => {
    const state = state2016();
    expect(bootedReportOf(state, nameOf)).toBe(
      'Slot A — the bank the bootloader entered at this start, as it records it',
    );
    expect(lastStartReportOf(state)).toBe(
      'the camera reports it entered slot A (active-slot word 0)',
    );
    expect(nextStartReportOf(state, nameOf)).toBe(
      'Slot A — the boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, ' +
        'and it holds an image the bootloader accepts',
    );
  });

  it('names the check key, says no key table is read, and that the application stores under the check key', () => {
    expect(keyReportRows(state2016())).toEqual([
      [
        'check key',
        `key block 1 ${KEY_PAIRS.cp103.block1} (the Compact PRO 1.0.3.x 9 Hz pair's block 1), named ` +
          "from slot A, the bank the camera reports it entered after the bootloader's check",
      ],
      [
        'key table',
        'not read — the bootloader block (0x14000000) is refused on every channel on this line',
      ],
      ['whitening K', '0x00000000'],
      [
        'store key',
        'key block 1: the application stores every bank it writes under the key its bootloader checks',
      ],
    ]);
  });

  it('says the check key is inferred when the bank that named it was entered without the check', () => {
    expect(checkKeyReportOf(checkKeyFor({ activeSlotWord: 2 }))).toBe(
      `key block 1 ${KEY_PAIRS.cp103.block1} (the Compact PRO 1.0.3.x 9 Hz pair's block 1), inferred ` +
        'from recovery R, the bank the camera reports it entered: the bootloader enters that bank without ' +
        'its check, and runs it under the key it checks the other banks under',
    );
  });

  it('says why the check key is not named, and what that leaves unknown', () => {
    const state = state2016({ checkKey: UNNAMED });
    expect(checkKeyReportOf(UNNAMED)).toBe(
      "not named — the camera's active-slot word (fw info roots, selector 10) could not be read",
    );
    expect(storeKeyDescription(state)).toBe(
      'the key its bootloader checks a bank under (not named on this read): the application stores ' +
        'every bank it writes under that key',
    );
    expect(unknownBootabilityWhy(state)).toBe(
      'the key its bootloader checks a bank under was not named on this read',
    );
  });

  it('writes the banks one at a time, each under its image’s key block 0, and lists what refuses every bank', () => {
    expect(bankWritingOf(state2016())).toEqual({
      staged: "staged under its image's own key block 0",
      refusals: [],
    });
    const refused = state2016({
      bankWriteRefusals: ['no slot decrypts to the 0x00000000 acceptance sum'],
    });
    expect(bankWritingOf(refused)).toEqual({
      staged: "staged under its image's own key block 0",
      refusals: ['no slot decrypts to the 0x00000000 acceptance sum'],
    });
  });
});

describe('the last-start row: the active-slot word, in the same words on every line that reports it (TESTING.md 42.89)', () => {
  const modern = getProfile('modern-4x');
  it('says the bank the word names on the 2014 chain, the 2016 line and 4.9.x', () => {
    const words = 'the camera reports it entered recovery R (active-slot word 2)';
    expect(lastStartReportOf({ profile: legacyAuth, version: '1.3.0.0', activeSlotWord: 2 })).toBe(
      words,
    );
    expect(lastStartReportOf({ profile: compact2016, version: '1.0.3.0', activeSlotWord: 2 })).toBe(
      words,
    );
    expect(lastStartReportOf({ profile: modern, version: '4.9.1.15', activeSlotWord: 2 })).toBe(
      words,
    );
  });

  it('says nothing on 4.8.x, whose word is 0 whatever runs (TESTING.md 42.56)', () => {
    expect(
      lastStartReportOf({ profile: modern, version: '4.8.2.1', activeSlotWord: 0 }),
    ).toBeNull();
  });

  it('says when the word was not read, or names no bank', () => {
    expect(lastStartReportOf({ profile: modern, version: '4.9.2.0', activeSlotWord: null })).toBe(
      'not read',
    );
    expect(lastStartReportOf({ profile: compact2016, version: '1.0.3.0', activeSlotWord: 7 })).toBe(
      'the camera reports 7, which names no bank',
    );
  });
});

describe('the report rows off the 2016 line', () => {
  it('keeps the key-table rows and no next start where the rule is not decoded, and writes the build as before', () => {
    const state = state2016({ checkKey: null, profile: legacyAuth });
    expect(keyReportRows(state).map(([label]) => label)).toEqual([
      'key A',
      'key B',
      'table at',
      'whitening K',
      'store key',
    ]);
    expect(nextStartReportOf(state, nameOf)).toBeNull();
    expect(bootedReportOf(state, nameOf)).toBe('Slot A');
    /* the slot writer stages a 1.0.3.x image under its own key block 0 whichever profile read it */
    expect(bankWritingOf(state).staged).toBe("staged under its image's own key block 0");
    /* a 1.3.0.8 camera with no bank stored plain writes the FF image in the vendor's form */
    expect(bankWritingOf({ ...state, version: '1.3.0.8' }).staged).toBe(
      'staged as the vendor app stages the 16 Hz FF image (the image XOR its own key block 0), stored by ' +
        'the camera under Key B',
    );
    /* and on the plain chain, plain */
    expect(bankWritingOf({ ...state, version: '1.3.0.8', plainChain: true }).staged).toBe(
      'staged plain (the image as it is, with no key)',
    );
    expect(unknownBootabilityWhy(state)).toBe(
      "the bootloader's key table was not read, so the keys it tries cannot be named",
    );
  });
});
