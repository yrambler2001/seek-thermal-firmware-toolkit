/* ==================================================================== *
 * Which application the camera RUNS, on the 2014 plaintext chain.
 *
 * The 1.3.0.8 8 Hz build and its 16 Hz FF build report one version string, and the
 * 8 Hz application refuses the FF staged payload at commit (TESTING.md 42.10). So a
 * write of the FF image needs the application that is running, and the camera's boot
 * record cannot give it on this line: `state.boot` is the active-slot word's pair, and
 * recovery R runs when A and B hold nothing the bootloader takes, which that word does
 * not show.
 *
 * The decision follows the bootloader instead. The 2014 bootloader takes a bank only
 * when its stored word sum is 0 (`bootloaderFailures` in write-image.ts). It boots A if
 * A is taken, else B if B is, else recovery R, which runs whatever it holds (TESTING.md
 * 42.10, steps 4, 5, 6a to 6c and 7). That order was measured with cfg[0] = 0, the
 * value on the bench camera and in the corpus donor, so any other cfg[0] is not decided
 * here: the answer is unknown, and the page says so.
 * ==================================================================== */

import { hex } from '../bytes.js';
import { wordSum32 } from '../image/bank.js';
import type { FirmwareProfile, SlotKey } from '../profiles/types.js';
import type { DeviceState, SlotState } from '../workflows/types.js';
import { classifyBuild } from './capability-family.js';
import { plainChainBuildOf, type PlainChainBuild } from './write-image.js';

/** The cfg[0] value every measurement of this boot order was taken under (TESTING.md 42.10). */
export const MEASURED_CFG0 = 0;

const BANK_NAME: Readonly<Record<SlotKey, string>> = {
  a: 'slot A',
  b: 'slot B',
  r: 'recovery bank R',
};

export interface RunningApplication {
  /** The bank the camera runs, or null when the analysis cannot say which. */
  readonly bank: SlotKey | null;
  /**
   * The build that bank holds: 'plain' for the 8 Hz 1.3.0.8 image (any image whose stored
   * word sum is 0), 'ff-1308' for the 16 Hz FF build. Null when it cannot be told.
   */
  readonly build: PlainChainBuild | null;
  /** What was decided and why, as a clause a sentence can carry. */
  readonly why: string;
}

function unknownRun(why: string): RunningApplication {
  return { bank: null, build: null, why };
}

/** A present bank's image: the bytes its header length covers. Null when the read holds none. */
function imageOf(slot: SlotState | undefined): Uint8Array | null {
  if (slot === undefined || !slot.present || slot.raw === null || slot.header === null) return null;
  return slot.raw.subarray(0, slot.header.length);
}

/** The version a bank's cleartext header reports. */
function versionOf(slot: SlotState): string | null {
  return slot.header?.versionStr ?? slot.plainHeader?.versionStr ?? null;
}

/**
 * The application the camera runs, from the banks the analysis read. Pure; nothing is
 * sent. Unknown (never a guess) when a bank the order depends on was not read, when a
 * taken bank reports another version than the camera, when cfg[0] is not the measured
 * one, or when the image in R cannot be told apart.
 */
export function runningApplicationOf(state: DeviceState): RunningApplication {
  if (state.version === null) {
    return unknownRun('the camera does not say which firmware it runs');
  }
  if (typeof state.cfg0 !== 'number') {
    return unknownRun('cfg[0] was not read, and the boot order was measured with cfg[0] 0 only');
  }
  if (state.cfg0 !== MEASURED_CFG0) {
    return unknownRun(
      `cfg[0] is ${hex(state.cfg0)}, and the boot order was measured with cfg[0] 0 only`,
    );
  }

  for (const key of ['a', 'b'] as const) {
    const slot = state.byKey.get(key);
    if (slot === undefined || slot.unread) {
      return unknownRun(
        `${BANK_NAME[key]} was not read, so whether the bootloader takes it is not known`,
      );
    }
    const image = imageOf(slot);
    if (image === null || wordSum32(image, image.length) !== 0) continue;
    const version = versionOf(slot);
    if (version !== state.version) {
      return unknownRun(
        `${BANK_NAME[key]} holds an image with word sum 0 that reports ${version ?? 'no version'}, ` +
          `but the camera reports ${state.version}`,
      );
    }
    return {
      bank: key,
      build: 'plain',
      why: `${BANK_NAME[key]} is the first bank the 2014 bootloader takes (its stored word sum is 0)`,
    };
  }

  const recovery = state.byKey.get('r');
  if (recovery === undefined || recovery.unread) {
    return unknownRun(
      'recovery bank R was not read, and A and B hold nothing the bootloader takes',
    );
  }
  const image = imageOf(recovery);
  if (image === null) {
    return unknownRun('neither A nor B holds an image the bootloader takes, and R holds none');
  }
  const version = versionOf(recovery);
  if (version !== state.version) {
    return unknownRun(
      `recovery bank R holds an image that reports ${version ?? 'no version'}, ` +
        `but the camera reports ${state.version}`,
    );
  }
  let build: PlainChainBuild;
  try {
    build = plainChainBuildOf(image);
  } catch {
    return unknownRun('recovery bank R holds an image this page cannot tell apart');
  }
  return {
    bank: 'r',
    build,
    why: 'neither A nor B holds an image the 2014 bootloader takes, so recovery R runs the image it holds',
  };
}

/**
 * Whether this build is on the 2014 plaintext chain, where the page's booted bank comes from
 * the camera's active-slot word and recovery R can run instead (`runningApplicationOf`).
 */
export function onPlaintextChain(profile: FirmwareProfile, version: string | null): boolean {
  return classifyBuild(profile, version).family === 'locked-plain';
}
