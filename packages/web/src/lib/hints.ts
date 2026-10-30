/**
 * The web's half of the CLI's `describeError`: a failure's message says what
 * went wrong, this says what to do about it.
 *
 * The browser needs this MORE than the CLI does, not less. WebUSB cannot claim
 * interface 0 whenever a system driver or another program already holds the
 * camera, and on Linux and Windows that is the ordinary first-run state — a
 * bare "could not claim USB interface 0: Access denied." leaves the user with
 * nowhere to go. The platform prose is the page's own platform-notes section
 * and the README's "Browser and platform support" section, so there is
 * exactly one wording to keep true.
 *
 * Deliberately NOT imported from `@seek-fw/cli`: the web bundle must not pull
 * in a package that reaches for `process` and `node:fs`.
 */

import {
  errorMessage,
  isSeekError,
  type LogLevel,
  type SeekError,
  type SeekErrorCode,
} from '@seek-fw/core';
import { tEnglish, type Translate } from '@/i18n';

/** Only the three the advice actually differs for. */
export type HostPlatform = 'linux' | 'windows' | 'other';

/** The udev rule, as the hint quotes it: a file and two commands, the same in every language. */
const UDEV_RULE =
  '  # /etc/udev/rules.d/70-seek-thermal.rules\n' +
  '  SUBSYSTEM=="usb", ATTR{idVendor}=="289d", MODE="0666", TAG+="uaccess"\n' +
  '\n' +
  '  sudo udevadm control --reload-rules && sudo udevadm trigger';

/*
 * Each hint is a dictionary entry (`shared:hint.*`). A function takes the
 * translate function: `t` for the page, `tEnglish` (the default) for the run
 * log, which stays English. The exported constants are the English text, for
 * the tests and the log.
 */
function udevHint(translate: Translate): string {
  return translate('shared:hint.udev', { rule: UDEV_RULE });
}
export const UDEV_HINT = udevHint(tEnglish);

export const WINDOWS_HINT = tEnglish('shared:hint.windows');

/** The macOS/Android case, and the fallback when the UA says nothing useful. */
export const HOLDING_HINT = tEnglish('shared:hint.holding');

/** The way out that needs no driver work at all, appended to every platform's advice. */

/* Android and ChromeOS both advertise Linux, and neither can act on a udev
 * rule — a phone has no /etc to write to and ChromeOS hands USB devices out
 * through its own permission prompt. Both have to be ruled out first. */
export function hostPlatform(userAgent: string): HostPlatform {
  if (/android|cros/i.test(userAgent)) return 'other';
  if (/windows/i.test(userAgent)) return 'windows';
  if (/linux|x11/i.test(userAgent)) return 'linux';
  return 'other';
}

/** The platform-specific "the browser cannot open this device" advice. */
export function permissionHint(userAgent: string, translate: Translate = tEnglish): string {
  const platform = hostPlatform(userAgent);
  const fallback = translate('shared:hint.recipientFallback');
  if (platform === 'linux') return `${udevHint(translate)}\n\n${fallback}`;
  if (platform === 'windows') return `${translate('shared:hint.windows')}\n\n${fallback}`;
  return `${translate('shared:hint.holding')} ${fallback}`;
}

/**
 * True for the failures a driver or a permission fixes, including the one the
 * CLI never sees: `claimInterface` rejecting. Core turns that into
 * `usb/not-open` with "could not claim USB interface 0" in the message when
 * the recipient is pinned to interface, and Chrome's own DOMException says
 * "Unable to claim interface" — both have to match.
 */
export function looksLikeAccessError(error: unknown): boolean {
  const text = errorMessage(error).toLowerCase();
  return (
    text.includes('claim interface') ||
    text.includes('claim usb interface') ||
    text.includes('access denied') ||
    text.includes('insufficient permissions') ||
    text.includes('permission denied') ||
    text.includes('securityerror') ||
    text.includes('not allowed to access')
  );
}

/**
 * Per-code advice, the CLI's table translated into what this page can offer:
 * there is no `--chunk` or `seek-fw info --families` here, there are form controls,
 * a dump that asks the camera which family it is, and a hand-picked family
 * for the camera that detection gets wrong.
 */
const SEEK_HINTS: Partial<Record<SeekErrorCode, (translate: Translate) => string>> = {
  'options/invalid': (translate) => translate('shared:hint.optionsInvalid'),
  'usb/timeout': (translate) => translate('shared:hint.usbTimeout'),
  'usb/stalled': (translate) => translate('shared:hint.usbStalled'),
  'usb/not-open': (translate) => translate('shared:hint.usbNotOpen'),
  'usb/transfer-failed': (translate) => translate('shared:hint.usbTransferFailed'),
  'device/mode': (translate) => translate('shared:hint.deviceMode'),
  'device/window': (translate) => translate('shared:hint.deviceWindow'),
  'device/version-unknown': (translate) => translate('shared:hint.deviceVersionUnknown'),
  'image/malformed': (translate) => translate('shared:hint.imageMalformed'),
  'image/unsupported': (translate) => translate('shared:hint.imageUnsupported'),
  'image/key-table': (translate) => translate('shared:hint.imageKeyTable'),
  'flash/refused': (translate) => translate('shared:hint.flashRefused'),
  /* 'flash/commit' has no hint: its message says what the commit did to the bank (a refusal before anything
   * was written, an erase that may have started, or a bank that may be partly written) and that the backup
   * saved before the write is kept. The old hint said every rejected commit left the flash untouched. */
  'family/unsupported': (translate) => translate('shared:hint.familyUnsupported'),
};

/**
 * The version gate's refusal of a build that predates the dump protocol, as
 * opposed to a profile's own capability refusal: the same code, but no family
 * the user could pick changes it, so the per-code advice above would send them
 * round in a circle. Told apart by what `planForDevice` puts in the detail —
 * the version it read — which `requireCapability` never does.
 */
export const FIRMWARE_TOO_OLD_HINT = tEnglish('shared:hint.firmwareTooOld');

function isFirmwareTooOld(error: SeekError): boolean {
  return error.code === 'family/unsupported' && typeof error.detail?.firmwareVersion === 'string';
}

/**
 * The preserve refusals that name the power cycle (core's `spentReaderRefusal`)
 * end on the CLI's remedy, `preserve --resume <run-directory>`. This page
 * still holds the run, so its remedy is the replug and the Connect click — a
 * replugged camera is a stranger to Chrome, like a rebooted one.
 */
export const POWER_CYCLE_HINT = tEnglish('shared:hint.powerCycle');

/** A step refused because the camera's reader is spent until a power cycle. */
export function isPowerCycleRefusal(error: unknown): boolean {
  if (!isSeekError(error)) return false;
  return error.code === 'pipeline/refused' && error.message.includes('power-cycle the camera');
}

function liveUserAgent(): string {
  return typeof navigator === 'undefined' ? '' : navigator.userAgent;
}

/** What to try next, or null when there is nothing honest to suggest. */
export function hintFor(
  error: unknown,
  userAgent: string = liveUserAgent(),
  translate: Translate = tEnglish,
): string | null {
  /* The permission case first: it is the one whose remedy depends on the
   * machine rather than on which opcode failed. */
  if (looksLikeAccessError(error)) return permissionHint(userAgent, translate);
  if (isSeekError(error)) {
    if (isFirmwareTooOld(error)) return translate('shared:hint.firmwareTooOld');
    if (isPowerCycleRefusal(error)) return translate('shared:hint.powerCycle');
    return SEEK_HINTS[error.code]?.(translate) ?? null;
  }
  return null;
}

/**
 * Logs the hint under the failure a panel has just reported, if there is one.
 * Takes the log function rather than a reporter handle so each call site keeps
 * its own wording for the error line itself.
 */
export function logHint(
  log: (text: string, level: LogLevel) => void,
  error: unknown,
  userAgent?: string,
): void {
  const hint = hintFor(error, userAgent);
  if (hint !== null) log(hint, 'warn');
}
