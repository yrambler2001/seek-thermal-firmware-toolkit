/* ==================================================================== *
 * Which bank the 2014 plaintext chain runs at its next start (`bootChoiceOf`), and the frame-rate
 * patch warning a bank that does not run leaves (`fpsBootWarningOf`), slots/boot-choice.ts.
 *
 * No camera here. Each bank is a synthetic 64 KiB image: the magic at +0x200, a length, and a word
 * sum over that length that is 0 when the bootloader accepts it (image_sum_ok, bootloader src/crypto.c),
 * or 1 when it does not. "Patched" is decided by a test seam (`heldBy`), because the real patched
 * images are not in the repo; `fpsPatchHeldBy` is tested on bytes that hold no patch.
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
  bootWordRuleOf,
  fpsBootWarningOf,
  fpsPatchHeldBy,
  reportedBootedOf,
} from '../../src/slots/boot-choice.js';
import { getProfile } from '../../src/profiles/registry.js';
import type { SlotKey, SlotsReport } from '../../src/slots/types.js';
import type { DeviceState, SlotState } from '../../src/workflows/types.js';

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

/** One bank as the analysis reports it. `plain` is a marker the test seam recognises. */
function stateOf(key: SlotKey, spec: BankSpec, patchedMarkers: Set<Uint8Array>): SlotState {
  const plain = new Uint8Array(8);
  if (spec.patched === true) patchedMarkers.add(plain);
  const unread = spec.unread === true;
  const erased = spec.erased === true;
  let raw: Uint8Array | null = null;
  if (!unread) raw = erased ? new Uint8Array(BANK).fill(0xff) : imageBank(spec.accepted !== false);
  return {
    key,
    unread,
    blank: erased,
    raw,
    plain: unread ? null : plain,
  } as unknown as SlotState;
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
}): Fixture {
  const patched = new Set<Uint8Array>();
  const byKey = new Map<SlotKey, SlotState>();
  for (const key of KEYS) byKey.set(key, stateOf(key, options.banks[key] ?? {}, patched));
  const state = {
    cfg0: options.cfg0,
    activeSlotWord: options.activeSlotWord ?? null,
    plainChain: options.plainChain ?? true,
    profile: getProfile(options.profile ?? 'legacy-auth'),
    version: options.version ?? '1.3.0.0',
    byKey,
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
