/* ==================================================================== *
 * Which banks the 1.3.0.8 FF (16 Hz) image may be written to, decided by the
 * camera's own BOOTLOADER (the version it reports from selector 1), not by the
 * image alone.
 *
 * Why the bootloader. The 8 Hz and the 16 Hz builds report one version string, and
 * the FF image is recognised by its bytes (write.ts). But the banks it may take
 * depend on the bootloader that boots them:
 *
 *  - 0.9.0.0 (the 2014 bootloader; the original Compact, 1.3.0.0 and the 8 Hz 1.3.0.8).
 *    The FF build boots only from recovery bank R: A and B reject its word sum (0xFFFF,
 *    not 0). R runs whatever it holds (TESTING.md 42.10, steps 2a to 7). So the FF image
 *    is written to R only, and the 8 Hz application must not be the one running (the
 *    running-application walk in running.ts decides that).
 *  - 2.0.2.3 (the FF platform: the 1.3.0.8 FF launchable copy, its own bootloader). The
 *    page's two-stream write was accepted by the FF application at A, B and R, and each
 *    bank read back as the page predicted (TESTING.md 42.12). But on the bench none of the
 *    three booted ALONE with cfg[0] 0 (B, A and R each with the other banks erased), and R
 *    did not boot with cfg[0] 2 either. The bank the camera came with (the same image in
 *    its encrypted, bootable form) did boot alone from R. So on this bootloader the page's
 *    stored form is not a bootable image, and the page refuses the FF image for every bank.
 *  - anything else: not measured. Refused, the conservative answer.
 *
 * The bank a write targets is the only input here besides the bootloader; the running
 * application is checked where it matters (write.ts, `runningApplicationOf`), and the
 * two-stream staging itself is keyed to the FF image (write-image.ts `buildFFPayload`).
 * ==================================================================== */

import type { SlotKey } from '../profiles/types.js';
import type { DeviceState } from '../workflows/types.js';
import { ffBankRefusal, slotRefused } from './write-image.js';
import type { SeekError } from '../errors.js';

/** The 2014 bootloader: the original Compact (1.3.0.0) and the 8 Hz 1.3.0.8 build run on it (42.10). */
export const LEGACY_2014_BOOTLOADER = '0.9.0.0';

/** The FF platform's bootloader: the 1.3.0.8 FF (16 Hz) launchable copy runs on it (42.12). */
export const FF_PLATFORM_BOOTLOADER = '2.0.2.3';

/** What the bootloader allows for the FF (16 Hz) image. */
export type FFBankRule =
  | {
      /** Only recovery R takes it (the 2014 bootloader, measured in 42.10). */
      readonly kind: 'recovery-only';
      readonly bootloader: string;
      readonly why: string;
    }
  | {
      /** No bank takes the page's form on this bootloader, or it was never measured. */
      readonly kind: 'refused';
      readonly bootloader: string | null;
      readonly why: string;
    };

/** The bank rule for the FF image, from the bootloader the camera reports. Pure. */
export function ffBankRuleOf(state: Pick<DeviceState, 'bootloaderVersion'>): FFBankRule {
  const bootloader = state.bootloaderVersion ?? null;
  if (bootloader === LEGACY_2014_BOOTLOADER) {
    return {
      kind: 'recovery-only',
      bootloader,
      why: 'the 2014 bootloader (0.9.0.0) takes the FF image in recovery bank R only (TESTING.md 42.10)',
    };
  }
  if (bootloader === FF_PLATFORM_BOOTLOADER) {
    return {
      kind: 'refused',
      bootloader,
      why:
        `the FF platform's bootloader (${FF_PLATFORM_BOOTLOADER}) does not boot the page's two-stream ` +
        'form from any bank: A, B and R were written and read back as predicted, but none booted ' +
        'alone with cfg[0] 0 (and R not with cfg[0] 2) (TESTING.md 42.12)',
    };
  }
  return {
    kind: 'refused',
    bootloader,
    why:
      bootloader === null
        ? 'the camera did not report its bootloader version, so the bank rule for the FF image is unknown'
        : `bootloader ${bootloader} is not one the FF image was measured on (0.9.0.0 and ${FF_PLATFORM_BOOTLOADER})`,
  };
}

/**
 * The refusal for the FF image aimed at `key`, or null when the bootloader allows it there.
 * On 0.9.0.0 that is R only (the existing refusal for A and B); on any other bootloader every
 * bank is refused, with the measured reason.
 */
export function ffWriteRefusal(
  state: Pick<DeviceState, 'bootloaderVersion'>,
  key: SlotKey,
): SeekError | null {
  const rule = ffBankRuleOf(state);
  if (rule.kind === 'recovery-only') {
    return key === 'r' ? null : ffBankRefusal(key);
  }
  return slotRefused(
    `this is the 1.3.0.8 FF (16 Hz) image, and ${rule.why}. Nothing was written.`,
    {
      key,
      bootloader: rule.bootloader,
    },
  );
}
