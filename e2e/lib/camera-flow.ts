/**
 * What both real-camera runs (Electron's real WebUSB, and the bridge over
 * node-usb) check, so the two routes assert exactly the same things.
 */

import type { Page } from 'puppeteer-core';
import { expect } from 'vitest';

import { OP } from '../../packages/core/src/protocol/ops.js';
import { RESET_OP, STAGE_CHUNK } from '../../packages/core/src/preservation/pipeline.js';
import { say } from './browser.js';
import { entry, sha256, names, runState, type RunStateView } from './checks.js';
import { cameraOnBus } from './preflight.js';
import { installWriteGuard, type WriteGuardConfig } from './write-guard.js';
import { PHASE_FOLDER, Wizard, phaseSection, type DumpRun, type PhaseRun } from './wizard.js';

/* ---- WHICH CAMERA: asked of the camera, or named by the operator --------
 *
 * These runs used to carry one camera's identity: the product string
 * "PIR206 Thermal Camera", firmware 1.3.0.0 and a whole-part sha, all of the
 * bench Compact before it was reflashed. Any other camera failed on the
 * identity before it was ever tested. Each value now comes from the camera
 * itself, and an environment variable turns it into a strict check:
 *
 *   SEEK_E2E_CAMERA_NAME     the USB product string, e.g. "PIR206 Thermal Camera"
 *   SEEK_E2E_CAMERA_VERSION  the running firmware, e.g. "1.3.0.0"
 *   SEEK_E2E_CAMERA_SHA      the Dump & decrypt image's sha256
 */

/**
 * The whole-part image this camera's Dump & decrypt must come back as, when
 * the operator names one, or ''. It is the sha256 of the DUMP image: the 4 MiB
 * the wire reads, gap-filled where no selector reaches. That is not always the
 * flash — on a 2016 part the bootloader block and the upper 2 MiB are 0xFF in
 * the dump whatever the chip holds. With none named, a run checks every dump
 * against its first (`checkImageSha`). The bench Compact 1.3.0.0's is
 * `40447c7e…eb72` (TESTING.md sec. 21.7), the default here until that camera
 * was reflashed.
 */
export const CAMERA_IMAGE_SHA = process.env.SEEK_E2E_CAMERA_SHA ?? '';

/** The product string the camera must report, when the operator names one, or ''. */
export const CAMERA_PRODUCT = process.env.SEEK_E2E_CAMERA_NAME ?? '';

/** The firmware version the camera must report, when the operator names one, or ''. */
export const CAMERA_VERSION = process.env.SEEK_E2E_CAMERA_VERSION ?? '';

/** Which chooser entry is the camera: any Seek camera, by name or by vendor id. */
export const CAMERA_NAME = /PIR\d+|Seek|Thermal|289d/i;

/**
 * The chooser picked the camera on the bus: its name is the product string
 * the camera enumerated with (macOS's copy, read with `ioreg`, no transfer),
 * or `SEEK_E2E_CAMERA_NAME` when that is set. Returns the product string.
 */
export function checkCameraName(chooserName: string): string {
  const bus = cameraOnBus();
  const product = CAMERA_PRODUCT !== '' ? CAMERA_PRODUCT : (bus?.productName ?? null);
  expect(product, 'the camera on the bus names a product (or set SEEK_E2E_CAMERA_NAME)').not.toBe(
    null,
  );
  /* The chooser's entry is "<product> (vvvv:pppp)" on both routes. */
  expect(
    chooserName.startsWith(`${product ?? ''} (289d:`),
    `the chooser picked ${product ?? '?'}`,
  ).toBe(true);
  if (bus !== null) {
    const pid = bus.productId.toString(16).padStart(4, '0');
    expect(chooserName.endsWith(`:${pid})`), `the camera on the bus is 289d:${pid}`).toBe(true);
  }
  say(
    `camera: ${chooserName}${CAMERA_PRODUCT === '' ? ' (as the bus enumerated it)' : ' (as named)'}`,
  );
  return product ?? '';
}

/**
 * The firmware version the camera reported on the wire (`wire`, the write
 * guard's capture of GetFirmwareInfo) is the one the app recorded in the dump's
 * manifest, and `SEEK_E2E_CAMERA_VERSION` when that is set. Two observations
 * of the camera's own answer, not a version written into the test.
 */
export function checkCameraVersion(wire: string | null, dump: DumpRun): string {
  expect(wire, 'the version GetFirmwareInfo answered on the wire').toMatch(/^\d+\.\d+\.\d+\.\d+$/);
  const manifestEntry = dump.entries.find((e) => /^[^/]+\/manifest\.json$/.test(e.name));
  const manifest = JSON.parse(
    new TextDecoder().decode(entry(dump.entries, manifestEntry?.name ?? 'manifest.json')),
  ) as { readonly selectorTable?: { readonly firmwareVersion?: string | null } };
  expect(manifest.selectorTable?.firmwareVersion, "the dump manifest's firmware version").toBe(
    wire,
  );
  if (CAMERA_VERSION !== '') expect(wire, 'SEEK_E2E_CAMERA_VERSION').toBe(CAMERA_VERSION);
  return wire ?? '';
}

/* The first whole-part image this spec file checked, when no sha is named. */
let firstImage: { readonly sha: string; readonly what: string } | null = null;

/**
 * A whole-part image's sha: against `want` when one is named (the emulator's
 * known part, or `SEEK_E2E_CAMERA_SHA`), else against the first image this
 * spec file checked — a dump and its re-dump must agree. The first one is
 * recorded and said, so a run's log names the image the rest were held to.
 */
export function checkImageSha(sha: string, what: string, want: string = CAMERA_IMAGE_SHA): void {
  if (want !== '') {
    expect(
      sha,
      `${what}: the image ${want === CAMERA_IMAGE_SHA ? 'SEEK_E2E_CAMERA_SHA' : 'this target'} names`,
    ).toBe(want);
    return;
  }
  if (firstImage === null) {
    firstImage = { sha, what };
    say(
      `${what}: image sha256 ${sha} — the run's reference; later dumps must match it ` +
        '(set SEEK_E2E_CAMERA_SHA to pin one)',
    );
    return;
  }
  expect(sha, `${what}: the same image as ${firstImage.what}`).toBe(firstImage.sha);
}

/** Requests that must never appear on the wire in a read-only run. */
export const NEVER_ON_THE_WIRE = ['out 0x50', 'out 0x51', 'out 0x55', 'out 0x5a'];

export const WRITE_GUARD_GLOBAL = '__seekWriteGuard';

/** The real-WebUSB run's page-side guard: the same whitelist `CameraBus` holds. */
export const WRITE_GUARD: WriteGuardConfig = {
  global: WRITE_GUARD_GLOBAL,
  readsAllowed: [
    OP.GET_ERROR_CODE,
    OP.GET_OPERATION_MODE,
    OP.GET_FIRMWARE_INFO,
    OP.GET_FEATURED_FIRMWARE_DATA,
    OP.GET_FEATURED_DATA,
  ],
  neverOps: [
    OP.SET_FEATURED_FIRMWARE_DATA,
    OP.COMPLETE_MEMORY_UPGRADE,
    OP.SET_FIRMWARE_INFO_FEATURES,
    OP.SET_RAM_DATA_FEATURES,
  ],
  modeOp: OP.SET_OPERATION_MODE,
  armOp: OP.BEGIN_FIRMWARE_UPGRADE,
  versionOp: OP.GET_FIRMWARE_INFO,
  resetOp: RESET_OP,
};

/**
 * The strict guard plus the Flash view's device-info read: SetFirmwareInfoFeatures
 * and the device-id SetRamDataFeatures come off `neverOps` and are let out by
 * shape (`infoOps`). The two flash writes stay refused, and so does every reset.
 */
export const DEVICE_INFO_GUARD: WriteGuardConfig = {
  ...WRITE_GUARD,
  neverOps: [OP.SET_FEATURED_FIRMWARE_DATA, OP.COMPLETE_MEMORY_UPGRADE],
  infoOps: { firmwareInfo: OP.SET_FIRMWARE_INFO_FEATURES, ramData: OP.SET_RAM_DATA_FEATURES },
};

/**
 * The camera write run's guard: the strict one, plus Preserve's two flash
 * writes (`writeOps`), each phase opened by the test with its row's exact
 * budget (`inWritePhase` in `camera-write.e2e.ts`) and shut after. The two
 * RAM selectors stay refused (Preserve never sends them), and so does every
 * reset outside a phase the test opened.
 */
export const CAMERA_WRITE_GUARD: WriteGuardConfig = {
  ...WRITE_GUARD,
  neverOps: [OP.SET_FIRMWARE_INFO_FEATURES, OP.SET_RAM_DATA_FEATURES],
  writeOps: {
    stage: OP.SET_FEATURED_FIRMWARE_DATA,
    commit: OP.COMPLETE_MEMORY_UPGRADE,
    maxStageBytes: STAGE_CHUNK,
  },
};

/**
 * The guard as a script for Electron's preload. The default is the strict
 * read-only guard. `deviceInfo` is that guard plus the Flash view's read
 * (`DEVICE_INFO_GUARD`): still read-only, for the device-info read on the
 * camera. `lifted` is ONLY for a camera write run that has passed the
 * gate (`supervised-write.ts`): `CAMERA_WRITE_GUARD`, whose writes and
 * resets stay shut until the test opens a phase with its row's budgets. The
 * guard still installs, locks the prototype methods and records every
 * transfer, and the vendor-id device pick in Electron's main process is
 * untouched. Never used by the unattended read-only runs. `seededVersion` is
 * for the write window alone: the version the run's step 02 matched, which a
 * fresh page has not seen (see `write-guard.ts`).
 *
 * (It used to drop the flash-write ids from `neverOps` and nothing more, which
 * left them refused as "not on this run's whitelist": an approved camera run
 * would have stopped at its first staged chunk.)
 */
export function writeGuardScript(
  options: {
    readonly lifted?: boolean;
    readonly deviceInfo?: boolean;
    /** The version step 02 matched, for the write window (`WriteGuardConfig.seededVersion`). */
    readonly seededVersion?: string;
  } = {},
): string {
  const base: WriteGuardConfig = options.lifted
    ? CAMERA_WRITE_GUARD
    : options.deviceInfo === true
      ? DEVICE_INFO_GUARD
      : WRITE_GUARD;
  const seed = options.seededVersion;
  if (seed !== undefined && !/^\d+\.\d+\.\d+\.\d+$/.test(seed)) {
    throw new Error(`a version seed must read like 1.0.3.0, not ${JSON.stringify(seed)}`);
  }
  const config: WriteGuardConfig = seed === undefined ? base : { ...base, seededVersion: seed };
  return `(${installWriteGuard.toString()})(${JSON.stringify(config)});\n`;
}

/**
 * The Dump & decrypt archive: its layout, and its whole image against `want`
 * (see `checkImageSha`: the named image, or this run's first).
 */
export function checkDumpArchive(dump: DumpRun, want: string = CAMERA_IMAGE_SHA): void {
  expect(dump.status).toMatch(/^Done — (\d+)\/\1 windows read/);
  const all = names(dump.entries);
  const dir = all[0]?.split('/')[0] ?? '';
  expect(dir).toMatch(/^seek_flash4m_/);
  expect(all).toContain(`${dir}/manifest.json`);
  expect(all).toContain(`${dir}/README.md`);
  const image = dump.entries.find((e) => /^[^/]+\/flash_4m_usb[^/]*\.bin$/.test(e.name));
  expect(image?.data.length).toBe(4 * 1024 * 1024);
  checkImageSha(sha256(image?.data ?? new Uint8Array(0)), "the dump's image", want);
}

/* ---- Preserve step 02's known refusal -----------------------------------
 *
 * Step 02 builds the patch from the slot it reads, and on some cameras the
 * app refuses that, by design, before anything is written. Those are app
 * limitations a person already knows about, not harness failures, and a run
 * that meets one fails with a first line that says which. */
export const KNOWN_STEP02_REFUSALS: readonly { readonly pattern: RegExp; readonly why: string }[] =
  [
    {
      pattern: /the rebalance word at 0x00000238 is not free/,
      why:
        "KNOWN APP LIMITATION — Preserve step 02 refused this camera's slot image: the " +
        'rebalance word at 0x00000238 is already in use by an edit this build of Preserve does ' +
        'not know, so no patch is built; the read itself completed. The source knows the ' +
        'Compact board patch on Compact PRO 1.0.3.0 (`KNOWN_DERIVATIONS`); a bundle built ' +
        'before it (the committed docs/, until it is rebuilt) does not. Not a harness failure.',
    },
  ];

/** Runs Preserve step 02 through `run`; a known refusal comes back with a first line naming it. */
export async function step02<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const known = KNOWN_STEP02_REFUSALS.find((k) => k.pattern.test(message));
    if (known === undefined) throw error;
    throw new Error(`${known.why}\n\n${message}`, { cause: error });
  }
}

/** Why a test that needs step 02's run file is skipped, or null when it has one. */
export function needsStep02(failure: string | null): string | null {
  return failure === null
    ? null
    : `step 02 did not produce a run file (${failure.split('\n')[0] ?? failure}), so there is ` +
        'nothing to check here';
}

/** Step 02's run file: its name pattern is checked by the wizard; here the folders and state. */
export function checkStep02RunFile(run: PhaseRun): RunStateView {
  const all = names(run.entries);
  expect(all.slice(0, 2)).toEqual(['preserve_run.json', 'README.md']);
  for (const file of [
    'preserve_backup_windows.bin',
    'preserve_bank_capture.bin',
    'preserve_image_plain.bin',
    'preserve_patch_plain_patched.bin',
  ]) {
    expect(all).toContain(`${PHASE_FOLDER['read-build']}/${file}`);
  }
  expect(all.filter((n) => /^0[34]-/.test(n))).toEqual([]);
  const state = runState(run.entries);
  expect(state.steps.backup?.status).toBe('done');
  expect(state.steps.patch?.status).toBe('done');
  expect(state.steps.commit).toBeUndefined();
  expect(state.nextStep).toBe('commit');
  return state;
}

/** The page offers step 03 — not taken — and shows no red past-commit alarm. */
export async function checkStep03Offered(wizard: Wizard, page: Page): Promise<void> {
  expect(await wizard.isEnabled(phaseSection('patch-dump'), Wizard.startLabel('patch-dump'))).toBe(
    true,
  );
  expect(await wizard.redAlerts()).toEqual([]);
  const text = await page.evaluate(() => document.body.innerText);
  expect(text).not.toContain('The commit is not on record');
  expect(text).not.toContain('Concerns the patched part');
}
