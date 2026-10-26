/* ==================================================================== *
 * The slot capability matrix, held to every firmware version we have.
 *
 * WHAT IT CHECKS. `buildSlotPlan` is pure: the profile and the version string
 * decide every answer, so the whole corpus can be tested without a device. The
 * table below states, for each measured version, which family it is, which
 * staging form its banks take, and whether a bank can be written. Every version
 * the corpus holds must appear in that table, so a new build cannot slip in
 * without a decision about it.
 *
 * WHERE THE VERSIONS COME FROM. `test/firmware/facts.json` always, and the
 * FW-V1 emulator corpus MANIFEST.json when SEEK_EMU_DIR points at the `emu`
 * directory. Without it the manifest half is SKIPPED, and says so.
 *
 * WHAT IT DOES NOT CHECK. That a camera holds a usable Key A, keystream or
 * token; the writer checks those on the device. Nor that a written bank boots:
 * that is what the emulator and the bench are for.
 *
 * SLOTS_MATRIX=1 prints the matrix (version, profile, dump, flashPlain,
 * flashRaw, staging) to stdout. It is off by default so the run stays quiet.
 * ==================================================================== */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import facts from '../firmware/facts.json' with { type: 'json' };
import { buildSlotPlan } from '../../src/slots/capability.js';
import type { SlotEntry, SlotPlan, StagingForm } from '../../src/slots/types.js';
import { compact2014 } from '../../src/profiles/compact-2014.js';
import { compact2016 } from '../../src/profiles/compact-2016.js';
import { generic } from '../../src/profiles/generic.js';
import { legacyAuth, OLD_FW_UNLOCK_TOKEN } from '../../src/profiles/legacy-auth.js';
import { modern4x } from '../../src/profiles/modern-4x.js';
import type { FirmwareProfile, Support } from '../../src/profiles/types.js';
import { parseVersion } from '../../src/profiles/version.js';

/* ---- the corpus ---------------------------------------------------------- */

const MODERN_BANKS = [0x14030000, 0x14050000, 0x14070000] as const;
const LOCKED_BANKS = [0x14050000, 0x14060000, 0x14070000] as const;
const SLOT_LENGTH = 0x10000;

interface Expectation {
  /** The line the build is on: decides the bank addresses. */
  readonly line: 'modern' | 'locked' | 'pre-0.8';
  /** The staging form every bank takes, or null when nothing is written. */
  readonly staging: StagingForm | null;
  /** Whether the build is readable (supportedBuild) at all. */
  readonly readable: boolean;
  /** Whether a bank can be written from a decrypted image. */
  readonly writable: boolean;
}

/**
 * The decision, per measured version. Two builds share a version string
 * (1.3.0.8 and its 16 Hz FF build, and each 1.0.3.x FF build); the plan is per
 * version, so the notes carry what the version cannot say.
 */
const EXPECT: Readonly<Record<string, Expectation>> = {
  '0.3.0.1': { line: 'pre-0.8', staging: null, readable: false, writable: false },
  '0.5.0.2': { line: 'pre-0.8', staging: null, readable: false, writable: false },
  '0.5.1.0': { line: 'pre-0.8', staging: null, readable: false, writable: false },
  '0.5.1.3': { line: 'pre-0.8', staging: null, readable: false, writable: false },
  '0.6.0.4': { line: 'pre-0.8', staging: null, readable: false, writable: false },
  '0.7.0.7': { line: 'pre-0.8', staging: null, readable: false, writable: false },
  '0.7.0.8': { line: 'pre-0.8', staging: null, readable: false, writable: false },
  '0.8.0.0': { line: 'locked', staging: 'plain', readable: true, writable: true },
  '0.9.0.2': { line: 'locked', staging: 'plain', readable: true, writable: true },
  '0.9.0.6': { line: 'locked', staging: 'plain', readable: true, writable: true },
  '0.9.0.7': { line: 'locked', staging: 'plain', readable: true, writable: true },
  '0.9.1.0': { line: 'locked', staging: 'plain', readable: true, writable: true },
  '0.10.0.0': { line: 'locked', staging: 'plain', readable: true, writable: true },
  '1.0.0.0': { line: 'locked', staging: 'plain', readable: true, writable: true },
  '1.2.0.0': { line: 'locked', staging: 'plain', readable: true, writable: true },
  '1.3.0.0': { line: 'locked', staging: 'plain', readable: true, writable: true },
  '1.3.0.8': { line: 'locked', staging: 'plain', readable: true, writable: true },
  '1.0.3.0': {
    line: 'locked',
    staging: 'slot-keystream-ciphertext',
    readable: true,
    writable: true,
  },
  '1.0.3.2': {
    line: 'locked',
    staging: 'slot-keystream-ciphertext',
    readable: true,
    writable: true,
  },
  '2.27.1.33': { line: 'modern', staging: 'key-a-ciphertext', readable: true, writable: true },
  '4.8.1.7': { line: 'modern', staging: 'key-a-ciphertext', readable: true, writable: true },
  '4.8.1.9': { line: 'modern', staging: 'key-a-ciphertext', readable: true, writable: true },
  '4.8.2.1': { line: 'modern', staging: 'key-a-ciphertext', readable: true, writable: true },
  '4.9.1.15': { line: 'modern', staging: 'key-a-ciphertext', readable: true, writable: true },
  '4.9.2.0': { line: 'modern', staging: 'key-a-ciphertext', readable: true, writable: true },
  '4.16.1.7': { line: 'modern', staging: 'key-a-ciphertext', readable: true, writable: true },
  '4.18.2.0': { line: 'modern', staging: 'key-a-ciphertext', readable: true, writable: true },
  '10.9.1.31': { line: 'modern', staging: 'key-a-ciphertext', readable: true, writable: true },
  '42.32.3.10': { line: 'modern', staging: 'key-a-ciphertext', readable: true, writable: true },
  '44.27.3.10': { line: 'modern', staging: 'key-a-ciphertext', readable: true, writable: true },
};

const manifestPath =
  process.env.SEEK_EMU_DIR === undefined
    ? null
    : join(process.env.SEEK_EMU_DIR, 'data', 'corpus', 'MANIFEST.json');
const manifest: { readonly entries: readonly { readonly version: string }[] } | null =
  manifestPath !== null && existsSync(manifestPath)
    ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as {
        readonly entries: readonly { readonly version: string }[];
      })
    : null;

if (manifest === null) {
  process.stderr.write(
    '[skip] slots capability: the emulator corpus MANIFEST.json versions are not checked. ' +
      'Set SEEK_EMU_DIR to the FW-V1 emu directory to include them.\n',
  );
}

const factsVersions = Object.values(facts.images).map((image) => image.version);
const manifestVersions = manifest === null ? [] : manifest.entries.map((entry) => entry.version);
const corpusVersions = [...new Set([...factsVersions, ...manifestVersions])].sort();

const PROFILES: Readonly<Record<string, FirmwareProfile>> = {
  [compact2014.id]: compact2014,
  [legacyAuth.id]: legacyAuth,
  [compact2016.id]: compact2016,
  [modern4x.id]: modern4x,
  [generic.id]: generic,
};

/** Every profile a build of this version can be planned under, by id. */
function profileIdsFor(version: string): readonly string[] {
  const parsed = parseVersion(version);
  if (parsed === null) return [generic.id];
  if (parsed.major === 0 && parsed.minor < 8) return [compact2014.id, legacyAuth.id];
  if (parsed.major >= 2) return [modern4x.id];
  if (version.startsWith('1.0.3.')) return [legacyAuth.id, compact2016.id];
  return [legacyAuth.id];
}

function profileOf(id: string): FirmwareProfile {
  const profile = PROFILES[id];
  if (profile === undefined) throw new Error(`no test profile ${id}`);
  return profile;
}

/* ---- helpers ------------------------------------------------------------- */

function expectationFor(version: string): Expectation {
  const expected = EXPECT[version];
  if (expected === undefined) {
    throw new Error(`no expectation for corpus version ${version}: decide its family first`);
  }
  return expected;
}

/** The bank addresses a line's builds must report, in A, B, R order. */
function addressesFor(line: Expectation['line']): readonly number[] {
  return line === 'modern' ? MODERN_BANKS : LOCKED_BANKS;
}

function expectUnsupportedSupport(support: Support): void {
  expect(support.supported).toBe(false);
  if (!support.supported) expect(support.reason.length).toBeGreaterThan(20);
}

function allNotes(plan: SlotPlan): string {
  return [...plan.notes, ...plan.slots.flatMap((slot) => [...slot.notes])].join('\n');
}

/** One row of the printed matrix: what a person checks per build. */
function summarise(plan: SlotPlan, pick: (slot: SlotEntry) => Support): string {
  const yes = plan.slots.filter((slot) => pick(slot).supported).map((slot) => slot.key);
  if (yes.length === 0) return 'no';
  if (yes.length === plan.slots.length) return 'yes';
  return `partial(${yes.join(',')})`;
}

function matrixRow(plan: SlotPlan, profileId: string, version: string): string {
  const staging = plan.slots[0]?.staging ?? '-';
  return [
    version.padEnd(12),
    profileId.padEnd(13),
    summarise(plan, (s) => s.dump).padEnd(14),
    summarise(plan, (s) => s.flashPlain).padEnd(14),
    summarise(plan, (s) => s.flashRaw).padEnd(14),
    staging,
  ].join(' ');
}

/* ---- the corpus, every build -------------------------------------------- */

describe('buildSlotPlan: every corpus version has a decision', () => {
  it('lists every corpus version in the expectation table', () => {
    const undecided = corpusVersions.filter((version) => EXPECT[version] === undefined);
    expect(undecided).toEqual([]);
  });

  it.skipIf(manifest === null)('decides every emulator MANIFEST.json version', () => {
    const undecided = manifestVersions.filter((version) => EXPECT[version] === undefined);
    expect(undecided).toEqual([]);
  });

  it.skipIf(manifest !== null)(
    'SKIPPED: SEEK_EMU_DIR is not set, so the emulator MANIFEST.json versions are not checked',
    () => {
      /* Skipped on purpose: the versions above are the whole check when SEEK_EMU_DIR is set. */
    },
  );

  it('has no expectation for a version the corpus does not hold', () => {
    const stale = Object.keys(EXPECT).filter((version) => !corpusVersions.includes(version));
    expect(stale).toEqual([]);
  });
});

const corpusCases: readonly (readonly [string, string])[] = corpusVersions.flatMap((version) =>
  profileIdsFor(version).map((id) => [version, id] as const),
);

describe.each(corpusCases)('buildSlotPlan %s under %s', (version, profileId) => {
  const profile = profileOf(profileId);
  const expected = expectationFor(version);
  const plan = buildSlotPlan(profile, version);

  it('is for this profile and this version', () => {
    expect(plan.profileId).toBe(profile.id);
    expect(plan.firmwareVersion).toBe(version);
  });

  it('has the three banks, A, B and R, each one 64 KiB, committed bank-only', () => {
    expect(plan.slots.map((slot) => slot.key)).toEqual(['a', 'b', 'r']);
    for (const slot of plan.slots) {
      expect(slot.length).toBe(SLOT_LENGTH);
      expect(slot.commitEffect).toBe('bank-only');
    }
  });

  if (expected.line === 'pre-0.8') {
    it('refuses a build older than 0.8.0.0 with a reason, and touches none of its slots', () => {
      expect(plan.supportedBuild.supported).toBe(false);
      if (plan.supportedBuild.supported) return;
      expect(plan.supportedBuild.reason).toContain('0.8.0.0');
      for (const slot of plan.slots) {
        expect(slot.read).toBeNull();
        expect(slot.write).toBeNull();
        expect(slot.staging).toBeNull();
        expectUnsupportedSupport(slot.dump);
        expectUnsupportedSupport(slot.flashPlain);
        expectUnsupportedSupport(slot.flashRaw);
        expectUnsupportedSupport(slot.emptyBank.writable);
      }
    });
    return;
  }

  it(`is ${expected.readable ? 'supported' : 'refused'} as a build`, () => {
    expect(plan.supportedBuild.supported).toBe(expected.readable);
  });

  it('places the banks at this line’s addresses', () => {
    expect(plan.slots.map((slot) => slot.address)).toEqual([...addressesFor(expected.line)]);
  });

  it('arms each bank for a write with subcmd 7, 8 and 9, at the bank’s own address', () => {
    plan.slots.forEach((slot, index) => {
      if (slot.write === null) return;
      expect(slot.write.subcmd).toBe([7, 8, 9][index]);
      expect(slot.write.address).toBe(slot.address);
    });
  });

  it('reads each bank through the build’s own window at that address', () => {
    for (const slot of plan.slots) {
      expect(slot.read).not.toBeNull();
      expect(slot.read?.address).toBe(slot.address);
    }
  });

  it(`stages ${expected.staging ?? 'nothing'} on every bank`, () => {
    for (const slot of plan.slots) expect(slot.staging).toBe(expected.staging);
  });

  it(`${expected.writable ? 'can' : 'cannot'} be written from a decrypted image`, () => {
    for (const slot of plan.slots) {
      if (expected.writable) {
        expect(slot.flashPlain.supported).toBe(true);
        expect(slot.flashRaw.supported).toBe(true);
      } else {
        expectUnsupportedSupport(slot.flashPlain);
        expectUnsupportedSupport(slot.flashRaw);
      }
    }
  });

  it(`${expected.writable ? 'can' : 'cannot'} be written while EMPTY, and says why in a sentence`, () => {
    for (const slot of plan.slots) {
      expect(slot.emptyBank.why.length, `bank ${slot.key}`).toBeGreaterThan(40);
      if (expected.writable) {
        /* No staging form reads the target bank, so empty follows the flash verdict. */
        expect(slot.emptyBank.writable).toEqual(slot.flashPlain);
        expect(slot.emptyBank.writable.supported).toBe(true);
      } else {
        expectUnsupportedSupport(slot.emptyBank.writable);
        expect(slot.emptyBank.why).toBe(
          slot.emptyBank.writable.supported ? '' : slot.emptyBank.writable.reason,
        );
      }
    }
  });

  it('dumps every bank: the profile reads and the table has a window for each', () => {
    for (const slot of plan.slots) expect(slot.dump.supported).toBe(true);
  });

  if (expected.line === 'locked') {
    it('arms the locked line’s banks with the 18-byte token, not the plain 2-byte arm', () => {
      for (const slot of plan.slots) {
        expect(slot.read?.auth).toBe(true);
        expect(slot.read?.payload?.length).toBe(2 + OLD_FW_UNLOCK_TOKEN.length);
        if (slot.write !== null) {
          expect(slot.write.payload?.length).toBe(2 + OLD_FW_UNLOCK_TOKEN.length);
          expect(slot.write.payload?.[0]).toBe(slot.write.subcmd);
          expect(slot.write.payload?.[1]).toBe(0);
        }
      }
    });
  } else {
    it('arms the modern banks on the plain 2-byte channel, no token', () => {
      for (const slot of plan.slots) {
        expect(slot.read?.payload).toBeUndefined();
        expect(slot.write?.payload).toBeUndefined();
      }
    });
  }
});

/* ---- the bank addresses against each image's own switch ---------------- */

/**
 * `facts.json` holds each image's BeginFirmwareUpgrade switch as decoded from
 * its bytes. A mode whose address is a constant has it in `address`; a computed
 * one carries the bank base as the last of its `loads`. Those are the bytes the
 * plan's addresses and write arms must agree with, not the plan's own tables.
 */
interface DecodedRow {
  readonly mode: number;
  readonly kind: string;
  readonly address?: string;
  readonly loads?: readonly string[];
}
interface ImageFacts {
  readonly version: string;
  readonly product: string;
  readonly windowTable?: { readonly rows: readonly DecodedRow[] } | null;
}
const imageFacts: readonly ImageFacts[] = Object.values(facts.images);

describe('the bank addresses agree with each image\u2019s own decoded switch', () => {
  for (const image of imageFacts) {
    const parsed = parseVersion(image.version);
    const table = image.windowTable;
    if (!table || parsed === null) continue;
    if (parsed.major === 0 && parsed.minor < 8) continue;
    const profileId = profileIdsFor(image.version)[0] ?? generic.id;

    it(`${image.product} ${image.version}: modes 7, 8 and 9 arm the banks the plan names`, () => {
      const plan = buildSlotPlan(profileOf(profileId), image.version);
      const rows = table.rows;
      plan.slots.forEach((slot, index) => {
        const mode = [7, 8, 9][index] ?? -1;
        const row = rows.find((r) => r.mode === mode);
        expect(row, `mode ${String(mode)} in the decoded switch`).toBeDefined();
        const decoded = row?.address ?? row?.loads?.at(-1);
        expect(decoded === undefined ? null : Number(decoded)).toBe(slot.address);
        expect(slot.write?.subcmd).toBe(mode);
      });
    });
  }
});

/* ---- what the notes must say -------------------------------------------- */

describe('the facts a person is shown with the plan', () => {
  it('says the 1.3.0.8-FF build is stored under Key B, and that its boot is untested, on the 1.3.0.8 plan', () => {
    const plan = buildSlotPlan(legacyAuth, '1.3.0.8');
    expect(plan.notes.join('\n')).toMatch(/1\.3\.0\.8-FF/);
    expect(plan.notes.join('\n')).toMatch(/UNTESTED/);
    expect(plan.notes.join('\n')).toMatch(/Key B/);
  });

  it('gives the 1.0.3.2 EP0 limit on the 1.0.3.2 plan, and says a whole-part drain is refused', () => {
    const plan = buildSlotPlan(legacyAuth, '1.0.3.2');
    expect(plan.notes.join('\n')).toMatch(/64.{0,8}81 KB/);
    expect(plan.notes.join('\n')).toMatch(/whole-part drain is refused/);
  });

  it('names the Compact XR and the Mosaic and Nano lines by their builds', () => {
    expect(buildSlotPlan(modern4x, '4.8.2.1').notes.join('\n')).toMatch(/Compact XR/);
    expect(buildSlotPlan(modern4x, '10.9.1.31').notes.join('\n')).toMatch(/Mosaic/);
    expect(buildSlotPlan(modern4x, '42.32.3.10').notes.join('\n')).toMatch(/Nano 200/);
    expect(buildSlotPlan(modern4x, '44.27.3.10').notes.join('\n')).toMatch(/Nano 300/);
  });

  it('says the modern line has no bank at 0x14060000 and that bank B is 0x14050000', () => {
    const plan = buildSlotPlan(modern4x, '4.9.2.0');
    expect(allNotes(plan)).toMatch(/0x14060000/);
    expect(plan.slots.some((slot) => slot.address === 0x14060000)).toBe(false);
    expect(plan.slots[1]?.address).toBe(0x14050000);
  });

  it('says mode 7 on the modern line is a decoded alias, and names the camera write through it', () => {
    const plan = buildSlotPlan(modern4x, '4.9.2.0');
    expect(plan.slots[0]?.write?.subcmd).toBe(7);
    expect(plan.slots[0]?.notes.join('\n')).toMatch(/decoded alias of mode 5/);
    expect(plan.slots[0]?.notes.join('\n')).toMatch(/Compact XR 4\.8\.2\.1 took a write/);
    expect(plan.slots[0]?.notes.join('\n')).not.toMatch(/not measured on the wire/);
  });

  it('says in words what the 4.x firmware does, and names none of its functions (TESTING.md 42.89)', () => {
    const identifiers = /cmd_|fw_\w|image_try_keys|BAD_ARG|case \d|_\w+\(\)/;
    for (const version of ['4.8.2.1', '4.9.2.0', '10.9.1.31', '42.32.3.10', '44.27.3.10']) {
      const plan = buildSlotPlan(modern4x, version);
      const words = [...plan.notes, ...plan.slots.flatMap((slot) => slot.notes)].join('\n');
      expect(words, version).not.toMatch(identifiers);
    }
    const staging = buildSlotPlan(modern4x, '4.9.2.0').notes.join('\n');
    expect(staging).toContain(
      'when the commit command (CompleteMemoryUpgrade) takes data type 7, 8 or 9, the application ' +
        'decrypts the upload with its Key A, re-encrypts it under its store key and programs the bank',
    );
    expect(buildSlotPlan(modern4x, '42.32.3.10').notes.join('\n')).toContain(
      'has no handler for data type 32',
    );
    expect(buildSlotPlan(modern4x, '44.27.3.10').notes.join('\n')).toContain(
      'refuses a data type past the span it accepts (0x7F) as a bad first argument',
    );
  });

  it('says the 2016 keystream write is the preservation path, and carries the profile refusal', () => {
    const plan = buildSlotPlan(compact2016, '1.0.3.0');
    expect(plan.slots.every((slot) => slot.flashPlain.supported)).toBe(true);
    expect(plan.notes.join('\n')).toMatch(/Profile compact-2016 declares no write of its own\./);
    /* no line has a whole-image write since 42.80, so no note speaks of one (TESTING.md 42.89) */
    expect(plan.notes.join('\n')).not.toMatch(/whole-image/);
    /* Shared by the page and the CLI, so it names neither as "this page" (TESTING.md 42.86). */
    expect(plan.notes.join('\n')).not.toMatch(/this page|the slot page/);
  });

  it('names no code identifier in a note a person reads (TESTING.md 42.86)', () => {
    const plans = [
      buildSlotPlan(compact2016, '1.0.3.0'),
      buildSlotPlan(compact2016, '1.0.3.2'),
      buildSlotPlan(legacyAuth, '1.3.0.0'),
      buildSlotPlan(legacyAuth, '1.3.0.8'),
      buildSlotPlan(modern4x, '4.9.2.0'),
    ];
    for (const plan of plans) {
      const notes = [...plan.notes, ...plan.slots.flatMap((slot) => slot.notes)].join('\n');
      for (const name of [
        'acknowledgeRisk',
        'OLD_FW_UNLOCK_TOKEN',
        'KEY_PAIRS',
        'capabilities.flash',
        'compact-2016.ts',
        'patch-dump.mjs',
      ]) {
        expect(notes, `${plan.profileId} ${String(plan.firmwareVersion)}: ${name}`).not.toContain(
          name,
        );
      }
      /* The acknowledgement is each front end's to say once beside the bank (the page's row, the CLI's
       * Notes line) and the write plan's to say once in its warnings; a note saying it too made three on
       * R's row and two in an R write plan (TESTING.md 42.87). */
      const recovery = plan.slots.find((slot) => slot.key === 'r');
      expect(recovery?.notes.join(' ')).toMatch(/^Recovery bank, mode 9/);
      expect(recovery?.notes.join(' ')).not.toMatch(/acknowledge|confirmation/);
    }
  });

  /* Every plan the matrix builds: each family, and the builds whose notes differ. */
  const everyPlan = (): SlotPlan[] => [
    buildSlotPlan(compact2016, '1.0.3.0'),
    buildSlotPlan(compact2016, '1.0.3.2'),
    buildSlotPlan(legacyAuth, '0.8.0.0'),
    buildSlotPlan(legacyAuth, '1.3.0.0'),
    buildSlotPlan(legacyAuth, '1.3.0.8'),
    buildSlotPlan(modern4x, '4.8.2.1'),
    buildSlotPlan(modern4x, '4.9.2.0'),
    buildSlotPlan(modern4x, '44.27.3.10'),
  ];

  it('says a note that holds for every bank once, with the camera’s notes, not on each bank (TESTING.md 42.87)', () => {
    for (const plan of everyPlan()) {
      const label = `${plan.profileId} ${String(plan.firmwareVersion)}`;
      const [first, ...rest] = plan.slots;
      for (const note of first?.notes ?? []) {
        expect(
          rest.every((slot) => slot.notes.includes(note)),
          `${label}: "${note.slice(0, 60)}…" is on every bank`,
        ).toBe(false);
      }
      /* The staging note is the camera's, said once. */
      const staged = plan.notes.filter((note) => note.startsWith('Staged: '));
      expect(staged, `${label}: the staging note, once`).toHaveLength(1);
      expect(
        plan.slots.flatMap((slot) => slot.notes).filter((note) => note.startsWith('Staged: ')),
        `${label}: no bank repeats it`,
      ).toEqual([]);
    }
    const pro = buildSlotPlan(compact2016, '1.0.3.0');
    expect(pro.notes.at(-1)).toMatch(/^Staged: the image, XORed with the xorshift128 keystream/);
    expect(pro.slots.map((slot) => slot.notes.length)).toEqual([0, 0, 1]);
  });

  it('names neither front end in a note both print (TESTING.md 42.87)', () => {
    for (const plan of everyPlan()) {
      const notes = [...plan.notes, ...plan.slots.flatMap((slot) => slot.notes)].join('\n');
      expect(notes, `${plan.profileId} ${String(plan.firmwareVersion)}`).not.toMatch(
        /\bpage\b|Slots tab|seek-fw|\.ts\)|patch\.ts|cp1032/,
      );
    }
    const boot = buildSlotPlan(compact2016, '1.0.3.0').notes.find((note) =>
      note.includes('active-slot word'),
    );
    expect(boot).toMatch(
      /^The booted bank named on this line is the bank the camera entered at its last start, as the bootloader records it/,
    );
  });

  it('warns on 0.8.0.0 that mode 2 is a crash hazard the slot page never arms', () => {
    expect(buildSlotPlan(legacyAuth, '0.8.0.0').notes.join('\n')).toMatch(/mode 2.*crash hazard/s);
  });
});

/* ---- refusals -------------------------------------------------------------- */

describe('refusals name their reason and touch nothing', () => {
  const refusedCases: readonly [string, FirmwareProfile, string | null, RegExp][] = [
    ['null version', legacyAuth, null, /could not be read/],
    ['an undotted version', legacyAuth, 'banana', /not a dotted version/],
    ['an empty version', modern4x, '', /not a dotted version/],
    ['0.7.0.8 under the legacy profile', legacyAuth, '0.7.0.8', /older than 0\.8\.0\.0/],
    ['0.7.0.7 under the compact-2014 profile', compact2014, '0.7.0.7', /older than 0\.8\.0\.0/],
    ['a 1.3.0.0 build under modern-4x', modern4x, '1.3.0.0', /modern-4x covers 2\.x/],
    ['a 4.8.1.7 build under legacy-auth', legacyAuth, '4.8.1.7', /legacy-auth covers the 0\.x/],
    [
      'a 1.3.0.0 build under compact-2016',
      compact2016,
      '1.3.0.0',
      /compact-2016 covers the Compact PRO/,
    ],
    [
      'a 4.8.1.7 build under compact-2014',
      compact2014,
      '4.8.1.7',
      /compact-2014 covers the builds older/,
    ],
    ['an unidentified camera under generic', generic, '4.8.1.7', /camera family is not identified/],
  ];

  for (const [label, profile, version, reason] of refusedCases) {
    it(`refuses ${label}`, () => {
      const plan = buildSlotPlan(profile, version);
      expect(plan.supportedBuild.supported).toBe(false);
      if (plan.supportedBuild.supported) return;
      expect(plan.supportedBuild.reason).toMatch(reason);
      for (const slot of plan.slots) {
        expect(slot.read).toBeNull();
        expect(slot.write).toBeNull();
        expect(slot.staging).toBeNull();
        expectUnsupportedSupport(slot.dump);
        expectUnsupportedSupport(slot.flashPlain);
        expectUnsupportedSupport(slot.flashRaw);
        expectUnsupportedSupport(slot.emptyBank.writable);
      }
    });
  }

  it('reads a locked 1.5.0.0 but refuses to write it: the staging form was never measured', () => {
    const plan = buildSlotPlan(legacyAuth, '1.5.0.0');
    expect(plan.supportedBuild.supported).toBe(true);
    expect(plan.slots.every((slot) => slot.dump.supported)).toBe(true);
    expect(plan.slots.every((slot) => slot.staging === null)).toBe(true);
    expect(plan.slots.every((slot) => !slot.flashPlain.supported)).toBe(true);
    expect(plan.slots.every((slot) => slot.write !== null)).toBe(true);
  });
});

/* ---- the matrix, on request ---------------------------------------------- */

describe('the capability matrix', () => {
  it('prints the matrix to stdout when SLOTS_MATRIX=1, and is quiet otherwise', () => {
    const rows: string[] = [];
    for (const [version, profileId] of corpusCases) {
      rows.push(matrixRow(buildSlotPlan(profileOf(profileId), version), profileId, version));
    }
    const header = [
      'version'.padEnd(12),
      'profile'.padEnd(13),
      'dump'.padEnd(14),
      'flashPlain'.padEnd(14),
      'flashRaw'.padEnd(14),
      'staging',
    ].join(' ');
    if (process.env.SLOTS_MATRIX === '1') {
      process.stdout.write(`\n${header}\n${rows.join('\n')}\n`);
    }
    expect(rows.length).toBeGreaterThan(0);
  });
});
