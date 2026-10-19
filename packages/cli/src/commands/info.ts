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
  bytesToHex,
  hex,
  hexUp,
  listProfiles,
  onPlaintextChain,
  bootableDescription,
  readDeviceInfo,
  runningApplicationOf,
  storeKeyDescription,
  upgradeTargetIsBooted,
  upgradeTargetWarning,
  type CapabilityName,
  type DeviceState,
  type FirmwareProfile,
  type SlotState,
} from '@seek-fw/core';
import { summarizeDevice } from '../backend.js';
import type { CommandContext, CommandResult } from '../cli.js';
import { permissionHint } from '../errors.js';
import {
  backendFor,
  betterProfile,
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
    profile: {
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
      booted: state.boot?.booted ?? null,
      upgradeTarget: state.boot?.target ?? null,
      /* TESTING.md 42.50: the upgrade target is the bank the camera booted from. A warning, never a gate. */
      upgradeTargetBooted: upgradeTargetIsBooted(state),
      upgradeTargetWarning: upgradeTargetWarning(state),
      targetConfirmed: state.targetConfirmed,
    },
    keys: {
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
    canFlash: state.canFlash,
    flashBlockedBy: [...state.flashBlockedBy],
  };
}

function pairs(ctx: CommandContext, rows: readonly (readonly [string, string])[]): void {
  ctx.out(table(rows.map((row) => [`  ${row[0]}`, row[1]])));
}

/** The human report. Also used by `flash`, which shows it before it asks. */
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
  ctx.out(heading('Profile', ctx.color));
  pairs(ctx, [
    ['read under', `${state.profile.id} — ${state.profile.name}`],
    [
      'detected',
      `${state.detection.best.profile.id} (score ${state.detection.best.score.toFixed(2)}` +
        `${state.detection.ambiguous ? ', ambiguous' : ''})`,
    ],
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
    ['booted', bootedText(state)],
    ...runningRows(state),
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
  pairs(ctx, [
    ['key A', state.keyTable === null ? '(not identified)' : bytesToHex(state.keyTable.keyA)],
    ['key B', state.keyTable === null ? '(not identified)' : bytesToHex(state.keyTable.keyB)],
    [
      'table at',
      state.keyTable === null
        ? `${String(state.keyTableCandidates)} candidate(s), none confirmed`
        : `${hexUp(state.keyTable.offset)} in the bootloader block, confirmed against a slot`,
    ],
    ['whitening K', hexUp(state.keyWhiteningK)],
    ['store key', storeKeyDescription(state)],
  ]);

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
        slot.present ? yesNo(slot.accepts) : '—',
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
  if (state.canFlash) {
    ctx.out('  available — `seek-fw slots flash <a|b|r> <file>` can write a bank of this camera');
  } else {
    ctx.out('  not available for a whole-image write:');
    for (const reason of state.flashBlockedBy) ctx.out(`    · ${reason}`);
  }
  ctx.out('');
}

function slotName(state: DeviceState, key: string): string {
  return state.slots.find((slot) => slot.key === key)?.name ?? key;
}

/**
 * The booted row. On the 2014 plaintext chain the bank is named from the camera's active-slot word,
 * which is not a boot record: recovery R runs when A and B hold nothing the bootloader takes
 * (TESTING.md 42.10), so the row does not present the name as authoritative there.
 */
function bootedText(state: DeviceState): string {
  if (state.boot === null) return '(not replayed)';
  const name = slotName(state, state.boot.booted);
  return onPlaintextChain(state.profile, state.version)
    ? `${name} (named by the active-slot word; not a boot record on this line)`
    : name;
}

/**
 * The running row, on 1.3.0.8 only (the two builds that share the version): the build the camera's
 * own per-bank answers name (selectors 6, 7, 8; slots/running.ts), or 'not known' with the reason.
 */
function runningRows(state: DeviceState): [string, string][] {
  if (state.version !== '1.3.0.8') return [];
  const run = runningApplicationOf(state);
  if (run.build === null) {
    return [
      [
        'running',
        `not known: ${run.why}. A 16 Hz FF image needs --running-16hz to say the camera runs that build`,
      ],
    ];
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
    `acting under profile ${choice.profile.id}${choice.forced ? ' (--profile)' : ''}`,
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
        `profile's cipher. Pass --profile ${better.id} to act under it.`,
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
    does: "the camera's firmware version, identity, boot state and slots (--devices, --profiles)",
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

/* ---- `info --profiles`: the families this build knows, from the registry ---- */

interface CapabilityInfo {
  readonly supported: boolean;
  readonly reason: string | null;
}

interface ProfileInfo {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  readonly cipher: {
    readonly whiteningK: string;
    readonly acceptanceSum: string;
    readonly clearWords: readonly number[];
  };
  readonly capabilities: Readonly<Record<string, CapabilityInfo>>;
  readonly sweepRange: readonly number[];
  readonly windows: number;
}

const FAMILY_CAPABILITIES: readonly CapabilityName[] = [
  'dump',
  'sweep',
  'decrypt',
  'deviceInfo',
  'flash',
];

function describeProfile(profile: FirmwareProfile): ProfileInfo {
  const capabilities: Record<string, CapabilityInfo> = {};
  for (const name of FAMILY_CAPABILITIES) {
    const support = profile.capabilities[name];
    capabilities[name] = support.supported
      ? { supported: true, reason: null }
      : { supported: false, reason: support.reason };
  }
  return {
    id: profile.id,
    name: profile.name,
    summary: profile.summary,
    cipher: {
      whiteningK: hexUp(profile.cipher.whiteningK),
      acceptanceSum: hexUp(profile.cipher.acceptanceSum),
      clearWords: [...profile.cipher.clearWords],
    },
    capabilities,
    sweepRange: [...profile.sweepRange],
    windows: profile.windowMap().length,
  };
}

/** `info --profiles`: the registry, read rather than hard-coded, so a family added to core shows here. */
function profilesListing(ctx: CommandContext): CommandResult {
  const profiles = listProfiles().map(describeProfile);

  if (ctx.human) {
    ctx.out(
      table(
        profiles.map((profile) => [
          profile.id,
          profile.name,
          ...FAMILY_CAPABILITIES.map((name) =>
            profile.capabilities[name]?.supported === true ? 'yes' : 'no',
          ),
          profile.cipher.whiteningK,
          profile.cipher.acceptanceSum,
        ]),
        ['id', 'name', ...FAMILY_CAPABILITIES, 'K', 'sum'],
      ),
    );
    ctx.out('');
    for (const profile of profiles) {
      ctx.out(`${profile.id}: ${profile.summary}`);
      for (const name of FAMILY_CAPABILITIES) {
        const capability = profile.capabilities[name];
        if (capability !== undefined && !capability.supported && capability.reason !== null) {
          ctx.out(`  ${name} refused: ${capability.reason}`);
        }
      }
      ctx.out('');
    }
  }

  return { profiles };
}

export async function infoCommand(ctx: CommandContext): Promise<CommandResult> {
  if (ctx.options.devices) return devicesListing(ctx);
  if (ctx.options.profiles) return profilesListing(ctx);

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
