/* ==================================================================== *
 * Which bank a locked-line camera runs at its next start (`bootChoiceOf`, slots/boot-choice.ts), and the
 * frame-rate patch warning a bank that does not run leaves (`fpsBootWarningOf`, slots/fps-boot-warning.ts),
 * on the 2014 plaintext chain and the 2016 Compact PRO (TESTING.md 42.84).
 *
 * No camera here. Each 2014 bank is a synthetic 64 KiB image: the magic at +0x200, a length, and a word
 * sum over that length that is 0 when the bootloader accepts it (image_sum_ok, bootloader src/crypto.c),
 * or 1 when it does not. A 2016 bank's verdict is the read's own (`SlotState.bootability`, from the key
 * its bootloader checks a bank under, device-info.ts `checkKeyOf`), so the fixture sets it. "Patched" is
 * decided by a test seam (`heldBy`), because the real patched images are not in the repo; `fpsPatchHeldBy`
 * is tested on bytes that hold no patch.
 * ==================================================================== */

import { describe, expect, it } from 'vitest';

import {
  ADJUST_OFFSET,
  HEADER_OFFSET,
  IMAGE_MAGIC,
  LENGTH_OFFSET,
} from '../../src/image/header.js';
import {
  bankWordsOf,
  bootChoiceOf,
  bootRuleKnown,
  bootWordRuleOf,
  CHECK_KEY_UNNAMED_VERDICT,
  reportedBootedOf,
} from '../../src/slots/boot-choice.js';
import { fpsBootWarningOf, fpsPatchHeldBy } from '../../src/slots/fps-boot-warning.js';
import { getProfile } from '../../src/profiles/registry.js';
import type { SlotKey, SlotsReport } from '../../src/slots/types.js';
import type { CheckKey, DeviceState, SlotState } from '../../src/workflows/types.js';

const BANK = 0x10000;
const LENGTH = 0x4000;
const KEYS: readonly SlotKey[] = ['a', 'b', 'r'];

/** A 64 KiB bank the bootloader accepts (word sum 0) or refuses (word sum 1), with code words after the header. */
function imageBank(accepted: boolean): Uint8Array {
  const bank = new Uint8Array(BANK);
  const dv = new DataView(bank.buffer);
  dv.setUint32(HEADER_OFFSET, IMAGE_MAGIC, true);
  dv.setUint32(LENGTH_OFFSET, LENGTH, true);
  for (let i = 0x240; i < LENGTH; i += 4) dv.setUint32(i, (0x69000000 + i) >>> 0, true);
  let sum = 0;
  for (let i = 0; i < LENGTH; i += 4) {
    if (i !== ADJUST_OFFSET) sum = (sum + dv.getUint32(i, true)) >>> 0;
  }
  const adjust = accepted ? (0 - sum) >>> 0 : (((0 - sum) >>> 0) + 1) >>> 0;
  dv.setUint32(ADJUST_OFFSET, adjust, true);
  return bank;
}

interface BankSpec {
  /** The bootloader accepts the stored image (word sum 0). Default true. */
  readonly accepted?: boolean;
  /** The bank holds a frame-rate patch (the test seam decides it). */
  readonly patched?: boolean;
  /** The header window reads as all 0xFF: an erased bank. */
  readonly erased?: boolean;
  /** The bank was not read. */
  readonly unread?: boolean;
}

/**
 * One bank as the analysis reports it. `plain` is a marker the test seam recognises. `bootability` is the
 * read's verdict, which is what a 2016 bank's check is: 'bootable' or 'not-bootable' from `accepted` when the
 * check key is named, 'unknown' when it is not.
 */
function stateOf(
  key: SlotKey,
  spec: BankSpec,
  patchedMarkers: Set<Uint8Array>,
  checkKeyNamed: boolean,
): SlotState {
  const plain = new Uint8Array(8);
  if (spec.patched === true) patchedMarkers.add(plain);
  const unread = spec.unread === true;
  const erased = spec.erased === true;
  let raw: Uint8Array | null = null;
  if (!unread) raw = erased ? new Uint8Array(BANK).fill(0xff) : imageBank(spec.accepted !== false);
  const bootability = !checkKeyNamed
    ? 'unknown'
    : spec.accepted === false
      ? 'not-bootable'
      : 'bootable';
  return {
    key,
    unread,
    blank: erased,
    raw,
    plain: unread ? null : plain,
    bootability,
  } as unknown as SlotState;
}

/** The 2016 read's check key: named from slot A, or not named. */
function checkKeyFixture(named: boolean): CheckKey {
  return named
    ? {
        name: 'key block 1',
        key: new Uint8Array(16).fill(0x5a),
        from: 'a',
        pair: null,
        unnamedWhy: null,
        why: 'check key: key block 1',
      }
    : {
        name: null,
        key: null,
        from: null,
        pair: null,
        unnamedWhy: "the camera's active-slot word (fw info roots, selector 10) could not be read",
        why: 'check key not named',
      };
}

interface Fixture {
  readonly report: SlotsReport;
  readonly heldBy: (plain: Uint8Array | null) => { hz: number; what: string } | null;
}

function reportWith(options: {
  readonly cfg0: number | null;
  readonly banks: Partial<Record<SlotKey, BankSpec>>;
  readonly activeSlotWord?: number | null;
  readonly plainChain?: boolean;
  /** The acting profile and the build's version. Default: legacy-auth on 1.3.0.0, the 2014 chain. */
  readonly profile?: string;
  readonly version?: string;
  /** The 2016 read's check key: named (default) or not. Only set on a compact-2016 fixture. */
  readonly checkKeyNamed?: boolean;
}): Fixture {
  const patched = new Set<Uint8Array>();
  const byKey = new Map<SlotKey, SlotState>();
  const line2016 = options.profile === 'compact-2016';
  const named = options.checkKeyNamed ?? true;
  for (const key of KEYS) {
    byKey.set(key, stateOf(key, options.banks[key] ?? {}, patched, !line2016 || named));
  }
  const state = {
    cfg0: options.cfg0,
    activeSlotWord: options.activeSlotWord ?? null,
    plainChain: options.plainChain ?? !line2016,
    profile: getProfile(options.profile ?? 'legacy-auth'),
    version: options.version ?? '1.3.0.0',
    byKey,
    checkKey: line2016 ? checkKeyFixture(named) : null,
  } as unknown as DeviceState;
  const slots = KEYS.map((key) => ({
    entry: { key },
    state: byKey.get(key) ?? null,
    content: 'image',
    active: false,
    unreadReason: null,
  }));
  const report = { state, plan: {}, slots } as unknown as SlotsReport;
  const heldBy = (plain: Uint8Array | null) =>
    plain !== null && patched.has(plain) ? { hz: 32, what: 'patched fixture' } : null;
  return { report, heldBy };
}

/**
 * The warning for a fixture. The seam for "why a bank cannot be patched" is always given, because the
 * stub report has no plan to ask.
 */
function warningOf(
  fixture: Fixture,
  options: {
    readonly target?: SlotKey;
    readonly patchBlock?: (key: SlotKey) => string | null;
  } = {},
) {
  return fpsBootWarningOf(fixture.report, {
    heldBy: fixture.heldBy,
    patchBlock: () => null,
    ...options,
  });
}

const ALL_OK = { a: { accepted: true }, b: { accepted: true }, r: { accepted: true } };

describe('bootChoiceOf: which bank the next start runs', () => {
  it('word 0 and 0xFFFFFFFF try slot A first, and slot A runs when it is accepted', () => {
    expect(bootChoiceOf(reportWith({ cfg0: 0, banks: ALL_OK }).report.state).runs).toBe('a');
    expect(bootChoiceOf(reportWith({ cfg0: 0xffffffff, banks: ALL_OK }).report.state).runs).toBe(
      'a',
    );
  });

  it('word 0 passes slot A over when it is refused, and takes slot B when B is accepted', () => {
    const choice = bootChoiceOf(
      reportWith({ cfg0: 0, banks: { a: { accepted: false }, b: { accepted: true } } }).report
        .state,
    );
    expect(choice.runs).toBe('b');
    expect(choice.why).toContain('slot A holds no image the bootloader accepts');
  });

  it('word 0 boots recovery R, unchecked, when neither slot A nor slot B is accepted', () => {
    const choice = bootChoiceOf(
      reportWith({ cfg0: 0, banks: { a: { accepted: false }, b: { erased: true } } }).report.state,
    );
    expect(choice.runs).toBe('r');
    expect(choice.why).toContain('boots recovery R, which it does not check');
  });

  it('word 1 tries slot B first, then A, then R', () => {
    expect(bootChoiceOf(reportWith({ cfg0: 1, banks: ALL_OK }).report.state).runs).toBe('b');
    expect(
      bootChoiceOf(reportWith({ cfg0: 1, banks: { b: { accepted: false } } }).report.state).runs,
    ).toBe('a');
    expect(
      bootChoiceOf(
        reportWith({ cfg0: 1, banks: { a: { accepted: false }, b: { erased: true } } }).report
          .state,
      ).runs,
    ).toBe('r');
  });

  it('word 2 boots recovery R when R is accepted, otherwise slot A, then slot B', () => {
    expect(bootChoiceOf(reportWith({ cfg0: 2, banks: ALL_OK }).report.state).runs).toBe('r');
    expect(
      bootChoiceOf(reportWith({ cfg0: 2, banks: { r: { accepted: false } } }).report.state).runs,
    ).toBe('a');
    const bothRefused = bootChoiceOf(
      reportWith({
        cfg0: 2,
        banks: { r: { accepted: false }, a: { accepted: false }, b: { erased: true } },
      }).report.state,
    );
    expect(bothRefused.runs).toBe('b');
    expect(bothRefused.why).toContain('which it does not check');
  });

  it('names no bank when a bank the word needs was not read', () => {
    const choice = bootChoiceOf(
      reportWith({ cfg0: 0, banks: { a: { unread: true } } }).report.state,
    );
    expect(choice.runs).toBeNull();
    expect(choice.why).toContain('slot A was not read');
    expect(
      bootChoiceOf(reportWith({ cfg0: 2, banks: { r: { unread: true } } }).report.state).runs,
    ).toBeNull();
  });

  it('names no bank when the word was not read', () => {
    const choice = bootChoiceOf(reportWith({ cfg0: null, banks: ALL_OK }).report.state);
    expect(choice.word).toBeNull();
    expect(choice.runs).toBeNull();
    expect(choice.why).toContain('was not read');
  });

  it('maps the active-slot word to a bank, 0 A, 1 B, 2 R, and nothing else', () => {
    expect(reportedBootedOf(0)).toBe('a');
    expect(reportedBootedOf(1)).toBe('b');
    expect(reportedBootedOf(2)).toBe('r');
    expect(reportedBootedOf(3)).toBeNull();
    expect(reportedBootedOf(null)).toBeNull();
  });

  it('reports the word as the booted bank on the 2014 plaintext chain', () => {
    const choice = bootChoiceOf(
      reportWith({ cfg0: 2, banks: ALL_OK, activeSlotWord: 2 }).report.state,
    );
    expect(choice.reportedBooted).toBe('r');
    expect(choice.runs).toBe('r');
  });

  it('does not report the word as a booted bank on 4.8.x, where the factory app never writes it', () => {
    /* The 4.8.x word reads 0 under every boot word (TESTING.md 42.43, 42.50): slot A here, whatever runs. */
    const modern = reportWith({
      cfg0: 1,
      banks: ALL_OK,
      activeSlotWord: 0,
      profile: 'modern-4x',
      version: '4.8.2.1',
    });
    const choice = bootChoiceOf(modern.report.state);
    expect(choice.reportedBooted).toBeNull();
    expect(choice.runs).toBe('b');
    expect(choice.why).toContain('the boot-config word is 1');
  });

  it('reports the word as the booted bank on the 4.9.x Compact PRO line, which writes it (TESTING.md 42.50)', () => {
    /* The 4.9.1.15 dump reads 2 when R runs (42.50) and 1 when B runs (42.36), both in the emulator. 4.9.2.0 is
     * the same line and is not measured for the word; the rule is the line, not a build list. */
    for (const version of ['4.9.1.15', '4.9.2.0']) {
      for (const [word, key] of [
        [0, 'a'],
        [1, 'b'],
        [2, 'r'],
      ] as const) {
        const choice = bootChoiceOf(
          reportWith({
            cfg0: word,
            banks: ALL_OK,
            activeSlotWord: word,
            profile: 'modern-4x',
            version,
          }).report.state,
        );
        expect(choice.reportedBooted, `${version} word ${String(word)}`).toBe(key);
      }
    }
  });

  it('keeps the word hidden on the other 4.x lines, and under a profile that does not own the build', () => {
    /* 4.8.x is measured (above). 4.16.x and 4.18.x are not 4.9.x and are not measured for the word: hidden. */
    for (const [profile, version] of [
      ['modern-4x', '4.8.1.7'],
      ['modern-4x', '4.8.2.1'],
      ['modern-4x', '4.16.1.7'],
      ['modern-4x', '4.18.2.0'],
      ['legacy-auth', '4.9.1.15'],
    ] as const) {
      const choice = bootChoiceOf(
        reportWith({ cfg0: 2, banks: ALL_OK, activeSlotWord: 2, profile, version }).report.state,
      );
      expect(choice.reportedBooted, `${profile} ${version}`).toBeNull();
    }
  });

  it('reports the word as the bank that ran on 2016, where it follows the boot word (TESTING.md 42.56)', () => {
    /* 1.0.3.0 on the emulator: the word is 0, 1, 2 for slots A, B, R, each the bank that ran. */
    for (const [word, key] of [
      [0, 'a'],
      [1, 'b'],
      [2, 'r'],
    ] as const) {
      const choice = bootChoiceOf(
        reportWith({
          cfg0: word,
          banks: ALL_OK,
          activeSlotWord: word,
          profile: 'compact-2016',
          version: '1.0.3.0',
        }).report.state,
      );
      expect(choice.reportedBooted, `2016 word ${String(word)}`).toBe(key);
    }
  });

  it('says what each word means, in the words the CLI prints', () => {
    expect(bootWordRuleOf(0)).toBe('slot A first, then B, then recovery R');
    expect(bootWordRuleOf(0xffffffff)).toBe('slot A first, then B, then recovery R');
    expect(bootWordRuleOf(1)).toBe('slot B first, then A, then recovery R');
    expect(bootWordRuleOf(2)).toBe('recovery R first, then A, then B');
    expect(bankWordsOf('r')).toBe('recovery R');
  });
});

describe('fpsBootWarningOf: a frame-rate patch the next start does not run', () => {
  it('warns when the camera boots R and slot A holds the patch, and says to patch R too', () => {
    const fixture = reportWith({ cfg0: 2, banks: { a: { patched: true }, b: {}, r: {} } });
    const warning = warningOf(fixture);
    expect(warning).not.toBeNull();
    expect(warning?.runs).toBe('r');
    expect(warning?.word).toBe(2);
    expect(warning?.idle).toEqual(['a']);
    const [boots, idle, fix] = warning?.paragraphs ?? [];
    expect(boots).toContain('The camera boots recovery R.');
    expect(boots).toContain('The boot-config word is 2, so the bootloader tries recovery R first');
    expect(idle).toBe(
      'Slot A holds a frame-rate patch, but it does not run, so the patch does not take effect.',
    );
    expect(fix).toBe(
      'Patch recovery R too (the bank that runs): that is what makes the frame-rate patch take effect.',
    );
  });

  it('warns when the camera boots slot A stock and slot B holds the patch', () => {
    const fixture = reportWith({ cfg0: 0, banks: { a: {}, b: { patched: true }, r: {} } });
    const warning = warningOf(fixture);
    expect(warning?.runs).toBe('a');
    expect(warning?.idle).toEqual(['b']);
    expect(warning?.paragraphs.at(-1)).toContain('Patch slot A too (the bank that runs)');
  });

  it('says both idle banks when slot A and slot B both hold the patch and R runs', () => {
    const fixture = reportWith({
      cfg0: 2,
      banks: { a: { patched: true }, b: { patched: true }, r: {} },
    });
    const warning = warningOf(fixture);
    expect(warning?.idle).toEqual(['a', 'b']);
    expect(warning?.paragraphs[1]).toBe(
      'Slot A and slot B hold frame-rate patches, but neither runs, so the patches do not take effect.',
    );
  });

  it('is silent when the bank that runs holds the patch, even with another bank patched', () => {
    const fixture = reportWith({
      cfg0: 0,
      banks: { a: { patched: true }, b: { patched: true }, r: {} },
    });
    expect(warningOf(fixture)).toBeNull();
  });

  it('is silent when every bank holds the patch (the owner bench state, all three at 32 Hz)', () => {
    const fixture = reportWith({
      cfg0: 2,
      banks: { a: { patched: true }, b: { patched: true }, r: { patched: true } },
    });
    expect(warningOf(fixture)).toBeNull();
  });

  it('is silent when nothing holds the patch and no bank is about to be patched', () => {
    expect(warningOf(reportWith({ cfg0: 2, banks: ALL_OK }))).toBeNull();
  });

  it('warns about the bank being patched when it is not the one that runs', () => {
    const fixture = reportWith({ cfg0: 2, banks: ALL_OK });
    const warning = warningOf(fixture, { target: 'a' });
    expect(warning?.idle).toEqual(['a']);
    expect(warning?.paragraphs).toContain(
      'Patching slot A would not make it run, because the camera boots recovery R instead.',
    );
    expect(warning?.paragraphs.at(-1)).toContain('Patch recovery R too');
  });

  it('is silent for the bank being patched when it is the one that runs', () => {
    const fixture = reportWith({ cfg0: 2, banks: ALL_OK });
    expect(warningOf(fixture, { target: 'r' })).toBeNull();
  });

  it('says why the bank that runs cannot be patched, when its own plan refuses it', () => {
    const fixture = reportWith({ cfg0: 2, banks: { a: { patched: true }, b: {}, r: {} } });
    const warning = warningOf(fixture, {
      patchBlock: (key) => (key === 'r' ? 'the image is not in the table' : null),
    });
    expect(warning?.paragraphs.at(-1)).toBe(
      'Recovery R cannot be patched here (the image is not in the table), so a frame-rate patch in another bank does not take effect on this camera.',
    );
  });

  it('is silent on a line other than the 2014 plaintext chain, and when the word was not read', () => {
    const modern = reportWith({ cfg0: 2, banks: { a: { patched: true } }, plainChain: false });
    expect(warningOf(modern)).toBeNull();
    const unread = reportWith({ cfg0: null, banks: { a: { patched: true } } });
    expect(warningOf(unread)).toBeNull();
  });

  it('word 1 runs slot B, so a patch left in R is warned about with slot B as the fix', () => {
    const fixture = reportWith({ cfg0: 1, banks: { a: {}, b: {}, r: { patched: true } } });
    const warning = warningOf(fixture);
    expect(warning?.runs).toBe('b');
    expect(warning?.idle).toEqual(['r']);
    expect(warning?.paragraphs.at(-1)).toContain('Patch slot B too (the bank that runs)');
  });

  it('holds no patch for a stock image, read from its own bytes', () => {
    expect(fpsPatchHeldBy(null)).toBeNull();
    expect(fpsPatchHeldBy(imageBank(true))).toBeNull();
  });
});

/* ---- the 2016 Compact PRO (TESTING.md 42.84) ---------------------------------------------------- */

/** A 2016 camera read under compact-2016: 1.0.3.0, the banks' verdicts from the check key. */
function report2016(options: {
  readonly cfg0: number | null;
  readonly banks: Partial<Record<SlotKey, BankSpec>>;
  readonly activeSlotWord?: number | null;
  readonly checkKeyNamed?: boolean;
}): Fixture {
  return reportWith({ ...options, profile: 'compact-2016', version: '1.0.3.0' });
}

describe('bootRuleKnown: the lines whose boot rule and bank check are decoded', () => {
  it('is the 2014 plaintext chain and the 2016 Compact PRO read under compact-2016, and nothing else', () => {
    const known = (state: DeviceState): boolean => bootRuleKnown(state);
    expect(known(reportWith({ cfg0: 0, banks: ALL_OK }).report.state)).toBe(true);
    expect(known(report2016({ cfg0: 0, banks: ALL_OK }).report.state)).toBe(true);
    expect(known(report2016({ cfg0: 0, banks: ALL_OK, checkKeyNamed: false }).report.state)).toBe(
      true,
    );
    /* A 1.3.0.x camera whose read found no bank stored plain (the 1.3.0.8 FF build): its banks are not
     * checked by the 2014 rule, and the FF bootloader is not decoded for that form (TESTING.md 42.12). */
    expect(
      known(
        reportWith({ cfg0: 0, banks: ALL_OK, plainChain: false, version: '1.3.0.8' }).report.state,
      ),
    ).toBe(false);
    /* A 1.0.3.0 camera read under legacy-auth: its banks were compared against the 2014 line's target. */
    expect(
      known(
        reportWith({
          cfg0: 0,
          banks: ALL_OK,
          plainChain: false,
          profile: 'legacy-auth',
          version: '1.0.3.0',
        }).report.state,
      ),
    ).toBe(false);
    expect(
      known(
        reportWith({
          cfg0: 0,
          banks: ALL_OK,
          plainChain: false,
          profile: 'modern-4x',
          version: '4.9.1.15',
        }).report.state,
      ),
    ).toBe(false);
  });
});

describe('bootChoiceOf on the 2016 Compact PRO: the same rule, over the device-seeded check', () => {
  it('word 0xFFFFFFFF (a blank record) tries slot A first, and slot A runs when its check passes', () => {
    const choice = bootChoiceOf(
      report2016({ cfg0: 0xffffffff, banks: ALL_OK, activeSlotWord: 0 }).report.state,
    );
    expect(choice.runs).toBe('a');
    expect(choice.reportedBooted).toBe('a');
    expect(choice.why).toBe(
      'the boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, and it holds an image the bootloader accepts',
    );
  });

  it('passes over a bank under another key (not bootable), and enters the last bank unchecked', () => {
    expect(
      bootChoiceOf(report2016({ cfg0: 0, banks: { a: { accepted: false } } }).report.state).runs,
    ).toBe('b');
    const last = bootChoiceOf(
      report2016({ cfg0: 0, banks: { a: { accepted: false }, b: { accepted: false } } }).report
        .state,
    );
    expect(last.runs).toBe('r');
    expect(last.why).toContain('boots recovery R, which it does not check');
    expect(bootChoiceOf(report2016({ cfg0: 1, banks: ALL_OK }).report.state).runs).toBe('b');
    expect(bootChoiceOf(report2016({ cfg0: 2, banks: ALL_OK }).report.state).runs).toBe('r');
  });

  it('names no bank, and says why, when the key its bootloader checks a bank under was not named', () => {
    const choice = bootChoiceOf(
      report2016({ cfg0: 0xffffffff, banks: ALL_OK, checkKeyNamed: false }).report.state,
    );
    expect(choice.runs).toBeNull();
    expect(choice.why).toBe(
      `the boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, but slot A ${CHECK_KEY_UNNAMED_VERDICT}, so the bank that runs is not known`,
    );
  });

  it('still says an erased bank is refused when the check key is not named: it holds no image header', () => {
    const choice = bootChoiceOf(
      report2016({
        cfg0: 0,
        banks: { a: { erased: true }, b: { erased: true } },
        checkKeyNamed: false,
      }).report.state,
    );
    expect(choice.runs).toBe('r');
  });
});

describe('fpsBootWarningOf on the 2016 Compact PRO', () => {
  it('warns when recovery R holds the 18 Hz patch and the blank record runs slot A: patch slot A too', () => {
    /* The owner's 1.0.3.0 camera (TESTING.md 42.84): R patched to 18 Hz from the slots page, cfg[0]
     * 0xFFFFFFFF, slot A entered. The camera stayed at 9 Hz and the page said nothing. */
    const fixture = report2016({
      cfg0: 0xffffffff,
      activeSlotWord: 0,
      banks: { a: {}, b: {}, r: { patched: true } },
    });
    const warning = warningOf(fixture);
    expect(warning?.runs).toBe('a');
    expect(warning?.word).toBe(0xffffffff);
    expect(warning?.idle).toEqual(['r']);
    expect(warning?.paragraphs).toEqual([
      'The camera boots slot A. The boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, and it holds an image the bootloader accepts.',
      'Recovery R holds a frame-rate patch, but it does not run, so the patch does not take effect.',
      'Patch slot A too (the bank that runs): that is what makes the frame-rate patch take effect.',
    ]);
  });

  it('warns before the patch of a bank that would not run, and is silent for the bank that runs', () => {
    const fixture = report2016({ cfg0: 0xffffffff, banks: ALL_OK });
    expect(warningOf(fixture, { target: 'r' })?.paragraphs).toContain(
      'Patching recovery R would not make it run, because the camera boots slot A instead.',
    );
    expect(warningOf(fixture, { target: 'a' })).toBeNull();
  });

  it('is silent when the check key was not named: the bank that runs is not known', () => {
    const fixture = report2016({
      cfg0: 0xffffffff,
      banks: { r: { patched: true } },
      checkKeyNamed: false,
    });
    expect(warningOf(fixture)).toBeNull();
  });

  it('is silent on a 1.0.3.0 camera read under legacy-auth, whose bank verdicts are not this check', () => {
    const fixture = reportWith({
      cfg0: 0xffffffff,
      banks: { r: { patched: true } },
      plainChain: false,
      profile: 'legacy-auth',
      version: '1.0.3.0',
    });
    expect(warningOf(fixture)).toBeNull();
  });
});
