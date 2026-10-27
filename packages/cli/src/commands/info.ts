/**
 * `seek-fw info` — what is this camera running?
 *
 * All of core's `readDeviceInfo` and none of its own analysis: this file only
 * decides what a terminal shows and what `--json` serialises. The one piece of
 * policy is the re-read: when detection confidently names a family whose
 * CIPHER differs from the one the read acted under, the analysis is redone
 * under it, because "does this slot pass acceptance?" is answered differently
 * by each cipher and reporting the wrong answer is worse than a second read.
 */

import {
  acceptsDescription,
  bankWritingOf,
  bootChoiceOf,
  bootedReportOf,
  bootRuleKnown,
  bytesToHex,
  CAPABILITY_WORDS,
  detectedReportOf,
  familyReadBy,
  hex,
  hexUp,
  keyReportRows,
  lastStartOf,
  lastStartReportOf,
  listProfiles,
  bootableDescription,
  nextStartReportOf,
  readDeviceInfo,
  runningApplicationOf,
  upgradeTargetIsBooted,
  upgradeTargetWarning,
  upgradeTargetWhileRecovery,
  type CapabilityName,
  type DeviceState,
  type FirmwareProfile,
  type SlotKey,
  type SlotState,
} from '@seek-fw/core';
import { summarizeDevice } from '../backend.js';
import type { CommandContext, CommandResult } from '../cli.js';
import { permissionHint } from '../errors.js';
import {
  backendFor,
  betterProfile,
  checkKeyJson,
  chooseProfileByProbe,
  cipherDiffers,
  dumpOptionsFrom,
  heading,
  openSession,
  table,
  workflowContext,
  yesNo,
  type Session,
} from './shared.js';

/**
 * One bank as JSON. `footerOk` is null where the profile's bootloader reads no footer (BootPolicy.checksFooter
 * is false: the locked 0.x/1.x line). The flash has none there, so "false" would report a fault it does not have.
 */
function slotJson(slot: SlotState, checksFooter: boolean): Record<string, unknown> {
  return {
    key: slot.key,
    name: slot.name,
    address: hexUp(slot.address),
    /* null when the firmware's plan has no window for this slot: nothing armed it */
    subcmd: slot.subcmd === null ? null : hex(slot.subcmd),
    present: slot.present,
    reason: slot.reason,
    version: slot.plainHeader?.versionStr ?? slot.header?.versionStr ?? null,
    imageId: slot.header === null ? null : hexUp(slot.header.imageId),
    length: slot.header?.length ?? null,
    model: slot.footer?.model ?? null,
    key_name: slot.keyName,
    accepts: slot.accepts,
    footerOk: checksFooter ? slot.footerOk : null,
    bootable: slot.bootable,
    bootability: slot.bootability,
    sha256: slot.sha256,
  };
}

/** The whole analysis as JSON. No Uint8Arrays, no Maps — this must stringify. */
/** The 1.3.0.8 running-build answer for --json: null on any other build. */
function runningJson(state: DeviceState): Record<string, unknown> | null {
  if (state.version !== '1.3.0.8') return null;
  const run = runningApplicationOf(state);
  const answer = (value: number | null | undefined): number | null => value ?? null;
  return {
    build: run.build,
    why: run.why,
    camera:
      state.bankVerdicts === undefined || state.bankVerdicts === null
        ? null
        : {
            a: answer(state.bankVerdicts.a),
            b: answer(state.bankVerdicts.b),
            r: answer(state.bankVerdicts.r),
          },
    predicted: {
      plain: run.predicted.plain,
      ff: run.predicted.ff,
    },
  };
}

export function stateJson(state: DeviceState): Record<string, unknown> {
  return {
    readAt: state.readAt,
    device: {
      product: state.description.productName,
      manufacturer: state.description.manufacturerName,
      serial: state.description.serialNumber,
      vendorId: hex(state.description.vendorId, 4),
      productId: hex(state.description.productId, 4),
    },
    family: {
      actedUnder: { id: state.profile.id, name: state.profile.name },
      detected: {
        id: state.detection.best.profile.id,
        name: state.detection.best.profile.name,
        score: state.detection.best.score,
        ambiguous: state.detection.ambiguous,
        reasons: [...state.detection.best.reasons],
      },
    },
    firmware: {
      version: state.version,
      build: state.buildString,
      bootloaderVersion: state.bootloaderVersion,
      bootloader: state.bootloaderString,
      platform: state.platform,
      usbSpeed: state.usbSpeed,
      serial: state.serial,
    },
    boot: {
      cfg0: state.cfg0 === null ? null : hexUp(state.cfg0),
      cfg0Meaning: state.cfg0 === null ? null : state.profile.boot.describeCfg0(state.cfg0),
      cfgSlots: state.cfgSlots === null ? null : state.cfgSlots.map((word) => hexUp(word)),
      activeSlotWord: state.activeSlotWord === null ? null : hexUp(state.activeSlotWord),
      /* The bank the active-slot word names, on every line core reports the word for (the 2014 chain, the
       * 2016 line and 4.9.x); null elsewhere, as `slots list --json` has it (TESTING.md 42.89). */
      reportedBooted: lastStartOf(state),
      booted: state.boot?.booted ?? null,
      /* The bank the next start runs, where the boot rule and the bank check are decoded (the 2014 plaintext
       * chain and the 2016 Compact PRO, TESTING.md 42.84); null on every other line. */
      nextStart: nextStartJson(state),
      upgradeTarget: state.boot?.target ?? null,
      /* TESTING.md 42.50: the upgrade target is the bank the camera booted from. A warning, never a gate. */
      upgradeTargetBooted: upgradeTargetIsBooted(state),
      /* TESTING.md 42.67: the camera runs recovery and its own upgrade writes B. Also a warning, never a gate. */
      upgradeTargetRecovery: upgradeTargetWhileRecovery(state),
      upgradeTargetWarning: upgradeTargetWarning(state),
      targetConfirmed: state.targetConfirmed,
    },
    keys: {
      /* The 2016 line: the key its bootloader checks a bank under, named from the bank the camera entered;
       * null on every other line. */
      checkKey: checkKeyJson(state.checkKey ?? null),
      keyA: state.keyTable === null ? null : bytesToHex(state.keyTable.keyA),
      keyB: state.keyTable === null ? null : bytesToHex(state.keyTable.keyB),
      tableOffset: state.keyTable === null ? null : hexUp(state.keyTable.offset),
      confirmedAgainstSlot:
        state.keyTable === null ? null : state.keyTable.matchA || state.keyTable.matchB,
      candidates: state.keyTableCandidates,
      whiteningK: hexUp(state.keyWhiteningK),
      storeKey: { name: state.storeKey.name, programmed: state.storeKey.programmed },
      perDeviceKey: state.deviceKeySlot === null ? null : bytesToHex(state.deviceKeySlot),
    },
    slots: state.slots.map((slot) => slotJson(slot, state.profile.boot.checksFooter)),
    /* 1.3.0.8 only: the camera's own per-bank answers (GetFirmwareInfo selectors 6, 7, 8) and what they decide. */
    running: runningJson(state),
    familyOk: state.familyOk,
    plainChain: state.plainChain,
    /* How the banks are written, on every line (core's `bankWritingOf`, the Writing section): one at a time,
     * `staged` in words (null when the build takes no write), and `refusedBy` what refuses every bank of this
     * camera, the reasons behind the slots page's banner (TESTING.md 42.89). */
    bankWrites: bankWritesJson(state),
  };
}

/** The next start as `--json` carries it, or null where the boot rule is not decoded. */
function nextStartJson(state: DeviceState): Record<string, unknown> | null {
  if (!bootRuleKnown(state)) return null;
  const choice = bootChoiceOf(state);
  return { runs: choice.runs, why: choice.why };
}

/** How this camera's banks are written, for `--json`. */
function bankWritesJson(state: DeviceState): Record<string, unknown> {
  const writing = bankWritingOf(state);
  return { staged: writing.staged, refusedBy: [...writing.refusals] };
}

function pairs(ctx: CommandContext, rows: readonly (readonly [string, string])[]): void {
  ctx.out(table(rows.map((row) => [`  ${row[0]}`, row[1]])));
}

/** The human report: the same sections, in the same order, as the page's Info tab (TESTING.md 42.64). */
export function renderState(ctx: CommandContext, state: DeviceState): void {
  ctx.out('');
  ctx.out(heading('Camera', ctx.color));
  pairs(ctx, [
    ['product', state.description.productName ?? '(no product string)'],
    ['manufacturer', state.description.manufacturerName ?? '(none)'],
    ['serial', state.serial ?? state.description.serialNumber ?? '(unreadable)'],
    ['platform', state.platform ?? '(unreadable)'],
    ['usb link', state.usbSpeed ?? '(unreadable)'],
  ]);

  ctx.out('');
  ctx.out(heading('Firmware', ctx.color));
  pairs(ctx, [
    [
      'running',
      state.version === null
        ? '(unreadable)'
        : `${state.version}${state.buildString === null ? '' : `  ${state.buildString}`}`,
    ],
    [
      'bootloader',
      state.bootloaderVersion === null
        ? '(unreadable)'
        : `${state.bootloaderVersion}${
            state.bootloaderString === null ? '' : `  ${state.bootloaderString}`
          }`,
    ],
  ]);

  ctx.out('');
  ctx.out(heading('Firmware family', ctx.color));
  pairs(ctx, [
    ['read under', state.profile.name],
    ['detected', detectedReportOf(state.detection)],
  ]);
  for (const reason of state.detection.best.reasons) ctx.out(`    · ${reason}`);

  ctx.out('');
  ctx.out(heading('Boot', ctx.color));
  pairs(ctx, [
    [
      'cfg[0]',
      state.cfg0 === null
        ? '(unreadable)'
        : `${hexUp(state.cfg0)} — ${state.profile.boot.describeCfg0(state.cfg0)}`,
    ],
    ['booted', bootedReportOf(state, nameOf(state)) ?? '(not replayed)'],
    ...lastStartRows(state),
    ...runningRows(state),
    ...nextStartRows(state),
    [
      'upgrade target',
      state.boot === null
        ? '(not replayed)'
        : `${slotName(state, state.boot.target)}${
            state.targetConfirmed === null ? '' : ' (confirmed on the wire)'
          }`,
    ],
  ]);
  const targetWarning = upgradeTargetWarning(state);
  if (targetWarning !== null) ctx.out(`  warning: ${targetWarning}`);

  ctx.out('');
  ctx.out(heading('Keys', ctx.color));
  pairs(ctx, keyReportRows(state));

  ctx.out('');
  ctx.out(heading('Slots', ctx.color));
  ctx.out(
    table(
      state.slots.map((slot) => [
        slot.name,
        hexUp(slot.address),
        slot.present ? (slot.plainHeader?.versionStr ?? slot.header?.versionStr ?? '?') : '—',
        slot.header === null ? '—' : `${String(slot.header.length)} B`,
        slot.keyName ?? (slot.plain === null ? '—' : 'none (plaintext)'),
        acceptsDescription(slot),
        /* "n/a" where the bootloader reads no footer: a missing one is not a fault there */
        slot.present ? (state.profile.boot.checksFooter ? yesNo(slot.footerOk) : 'n/a') : '—',
        slot.present ? bootableDescription(slot) : '—',
        slot.sha256 === null ? '—' : slot.sha256.slice(0, 16),
      ]),
      ['slot', 'address', 'version', 'size', 'key', 'accepts', 'footer', 'bootable', 'sha256'],
    ),
  );
  for (const slot of state.slots) {
    if (slot.reason !== null) ctx.out(`  ${slot.name}: ${slot.reason}`);
  }

  ctx.out('');
  ctx.out(heading('Writing', ctx.color));
  for (const line of writingLines(state)) ctx.out(line);
  ctx.out('');
}

/**
 * The Writing section, on every line: the banks are written one at a time by `seek-fw slots`, each staged in
 * the form the line takes, and what refuses every bank of this camera is listed (core's `bankWritingOf`, the
 * reasons behind the slots page's banner). The page's Info tab says the same.
 */
export function writingLines(state: DeviceState): string[] {
  const banks = bankWritingOf(state);
  if (banks.staged === null) {
    return [
      '  no bank of this camera is written:',
      ...banks.refusals.map((reason) => `    · ${reason}`),
    ];
  }
  const lines = [
    '  one bank at a time — `seek-fw slots flash <a|b|r> <file>` or `seek-fw slots patch-fps <a|b|r>`, ' +
      `each bank ${banks.staged}`,
  ];
  if (banks.refusals.length > 0) {
    lines.push('  the slot writer refuses every bank of this camera:');
    for (const reason of banks.refusals) lines.push(`    · ${reason}`);
  }
  return lines;
}

function slotName(state: DeviceState, key: string): string {
  return state.slots.find((slot) => slot.key === key)?.name ?? key;
}

/** A bank by the name the profile gives it ("Slot A"), as the slot table names it. */
function nameOf(state: DeviceState): (key: SlotKey) => string {
  return (key) => slotName(state, key);
}

/**
 * The last-start row, on every line core reports the active-slot word for (core's `lastStartReportOf`: the 2014
 * chain, the 2016 line and 4.9.x; TESTING.md 42.89).
 */
function lastStartRows(state: DeviceState): [string, string][] {
  const last = lastStartReportOf(state);
  return last === null ? [] : [['last start', last]];
}

/** The next-start row, on a line whose boot rule is decoded (core's `nextStartReportOf`). */
function nextStartRows(state: DeviceState): [string, string][] {
  const next = nextStartReportOf(state, nameOf(state));
  return next === null ? [] : [['next start', next]];
}

/**
 * The running row, on 1.3.0.8 only (the two builds that share the version): the build the camera's
 * own per-bank answers name (selectors 6, 7, 8; slots/running.ts), or 'not known' with the reason.
 */
function runningRows(state: DeviceState): [string, string][] {
  if (state.version !== '1.3.0.8') return [];
  const run = runningApplicationOf(state);
  if (run.build === null) {
    return [['running', `not known: ${run.why}`]];
  }
  const build = run.build === 'ff-1308' ? 'the 16 Hz FF 1.3.0.8 build' : 'the 8 Hz 1.3.0.8 build';
  return [['running', `${build}: ${run.why}`]];
}

/**
 * Reads the device analysis, re-reading under a confidently detected profile
 * when that would change what the numbers mean.
 */
export async function analyseCamera(
  ctx: CommandContext,
  session: Session,
): Promise<{ readonly state: DeviceState; readonly profile: FirmwareProfile }> {
  /* ASKED, NOT GUESSED — and here the guess had a cost beyond a label. This
   * read arms the boot-config bank, which on the locked 2014-2017 line is
   * subcommand 3 behind the authenticated channel; picking `generic` off a USB
   * product string meant arming it with the modern map's plain selector and
   * reporting "no boot config" for a camera that would have answered. */
  const choice = await chooseProfileByProbe(ctx, session);
  ctx.reporter.log(
    `acting under family ${choice.profile.id}${choice.forced ? ' (--family)' : ''}`,
    'detail',
  );

  const options = dumpOptionsFrom(ctx.options);
  let state = await readDeviceInfo(
    workflowContext(session, choice.profile, choice.detection, ctx),
    options,
  );

  const better = betterProfile(state.profile, state.detection, choice.forced);
  if (better !== null && cipherDiffers(state.profile, better)) {
    ctx.reporter.log(
      `the evidence identifies this camera as ${better.id} (${better.name})` +
        (cipherDiffers(state.profile, better)
          ? ', whose cipher differs from the one this read used'
          : '') +
        ' — re-reading under it',
      'warn',
    );
    state = await readDeviceInfo(workflowContext(session, better, state.detection, ctx), options);
  } else if (better !== null) {
    ctx.reporter.log(
      `detection says ${better.id}; the analysis is unchanged because it shares this ` +
        `family's cipher. Pass --family ${better.id} to act under it.`,
      'detail',
    );
  }
  return { state, profile: state.profile };
}

/**
 * The tabs of the web app, in the order the page shows them, with the command that
 * does each one. `info` prints them after the camera report, and `--json` carries them
 * as `tabs`, so the map of the tool is one place and not a guess at each front end.
 */
export const TABS: readonly {
  readonly tab: string;
  readonly command: string;
  readonly does: string;
}[] = [
  {
    tab: 'Info',
    command: 'seek-fw info',
    does: "the camera's firmware version, identity, boot state and slots (--devices, --families)",
  },
  {
    tab: 'Dump & decrypt 0.x/1.x 2014/2016',
    command: 'seek-fw preserve',
    does: 'the six-step preservation run; --backup-only saves the read-only backup as a zip',
  },
  {
    tab: 'Dump & decrypt 4.x/Nano',
    command: 'seek-fw dump',
    does: 'read the whole flash and decrypt it; --all-selectors probes every selector',
  },
  {
    tab: 'Decrypt File/Slot',
    command: 'seek-fw decrypt file|slot',
    does: 'decrypt a dump, or one 64 KiB bank, from a file with no camera',
  },
  {
    tab: 'Work with firmware slots',
    command: 'seek-fw slots',
    does: 'list, dump, write or raise the frame rate of one bank (A, B or R)',
  },
];

function renderTabs(ctx: CommandContext): void {
  ctx.out('');
  ctx.out(heading('Tabs', ctx.color));
  ctx.out(table(TABS.map((row) => [`  ${row.tab}`, row.command, row.does])));
}

/** `info --devices`: the cameras this host can see. Opens none. */
async function devicesListing(ctx: CommandContext): Promise<CommandResult> {
  const backend = backendFor(ctx, { recipient: ctx.options.recipient });
  const transports = await backend.listDevices();
  const devices = transports.map((transport) => summarizeDevice(transport));

  if (ctx.human) {
    if (devices.length === 0) {
      ctx.out('no Seek camera found');
      if (ctx.io.platform === 'linux' || ctx.io.platform === 'win32') {
        ctx.out('');
        ctx.out(permissionHint(ctx.io.platform));
      }
    } else {
      ctx.out(
        table(
          devices.map((device) => [
            device.vendorId,
            device.productId,
            device.productName ?? '(no product string)',
            device.manufacturerName ?? '',
            device.serialNumber ?? '',
          ]),
          ['vendor', 'product', 'name', 'manufacturer', 'serial'],
        ),
      );
    }
  }

  return { count: devices.length, devices };
}

/* ---- `info --families`: the families this build knows, from the registry ---- */

/** An operation the family refuses, as `--json` names it, and why. */
interface Refusal {
  readonly operation: string;
  readonly reason: string;
}

/** One family as `info --families` shows it: the columns of HOW_IT_WORKS.md's family table. */
interface FamilyInfo {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  /** Which tab or command reads a camera of this family. */
  readonly readBy: string;
  /** Whether a bank can be written on the Work with firmware slots tab, and if not, why. */
  readonly bankWrites: { readonly allowed: boolean; readonly reason: string | null };
  /** How the firmware is stored in a bank. */
  readonly stored: string;
  readonly cipher: {
    readonly whiteningK: string;
    readonly acceptanceSum: string;
    readonly clearWords: readonly number[];
  };
  /** The operations other than a bank write that the family refuses. */
  readonly refuses: readonly Refusal[];
  /** The subcommands Dump all selectors (`--all-selectors`) probes. */
  readonly allSelectorsRange: readonly number[];
  /** The blocks a dump reads when the build is not known. */
  readonly blocks: number;
}

/** The operations a family may refuse besides a bank write: their `--json` name and capability. */
const FAMILY_OPERATIONS: readonly (readonly [string, CapabilityName])[] = [
  ['dump', 'dump'],
  ['allSelectors', 'allSelectors'],
  ['decrypt', 'decrypt'],
  ['info', 'deviceInfo'],
];

const BANK_WRITES_ALLOWED = 'yes, one bank at a time on the Work with firmware slots tab';

function describeFamily(profile: FirmwareProfile): FamilyInfo {
  const flash = profile.capabilities.flash;
  const refuses: Refusal[] = [];
  for (const [operation, capability] of FAMILY_OPERATIONS) {
    const support = profile.capabilities[capability];
    if (!support.supported) refuses.push({ operation, reason: support.reason });
  }
  return {
    id: profile.id,
    name: profile.name,
    summary: profile.summary,
    readBy: familyReadBy(profile),
    bankWrites: flash.supported
      ? { allowed: true, reason: null }
      : { allowed: false, reason: flash.reason },
    stored: profile.stored,
    cipher: {
      whiteningK: hexUp(profile.cipher.whiteningK),
      acceptanceSum: hexUp(profile.cipher.acceptanceSum),
      clearWords: [...profile.cipher.clearWords],
    },
    refuses,
    allSelectorsRange: [...profile.sweepRange],
    blocks: profile.windowMap().length,
  };
}

/** `info --families`: the registry, read rather than hard-coded, so a family added to core shows here. */
function familiesListing(ctx: CommandContext): CommandResult {
  const families = listProfiles().map(describeFamily);

  if (ctx.human) {
    ctx.out(
      table(
        families.map((family) => [
          family.id,
          family.name,
          family.bankWrites.allowed ? 'yes' : 'no',
        ]),
        ['id', 'name on the page', 'bank writes'],
      ),
    );
    ctx.out('');
    for (const family of families) {
      ctx.out(`${family.id}: ${family.summary}`);
      ctx.out(`  read by: ${family.readBy}`);
      ctx.out(
        `  bank writes: ${family.bankWrites.allowed ? BANK_WRITES_ALLOWED : `no: ${family.bankWrites.reason ?? ''}`}`,
      );
      ctx.out(`  firmware stored: ${family.stored}`);
      /* One line per reason: operations refused for the same reason are named together. */
      const reasons = new Map<string, string[]>();
      for (const [operation, capability] of FAMILY_OPERATIONS) {
        const refusal = family.refuses.find((entry) => entry.operation === operation);
        if (refusal === undefined) continue;
        reasons.set(refusal.reason, [
          ...(reasons.get(refusal.reason) ?? []),
          CAPABILITY_WORDS[capability],
        ]);
      }
      for (const [reason, words] of reasons) {
        ctx.out(`  refuses ${words.join(' and ')}: ${reason}`);
      }
      ctx.out('');
    }
  }

  return { families };
}

export async function infoCommand(ctx: CommandContext): Promise<CommandResult> {
  if (ctx.options.devices) return devicesListing(ctx);
  if (ctx.options.families) return familiesListing(ctx);

  const session = await openSession(ctx);
  try {
    const { state } = await analyseCamera(ctx, session);
    if (ctx.human) {
      renderState(ctx, state);
      renderTabs(ctx);
    }
    return { ...stateJson(state), tabs: TABS };
  } finally {
    await session.close();
  }
}
