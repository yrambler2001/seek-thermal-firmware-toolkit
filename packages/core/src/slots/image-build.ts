/* ==================================================================== *
 * Whether the image a write takes is the firmware build the camera runs. A WARNING, NEVER A
 * REFUSAL (the owner's rule): writing another build stays allowed, and people are told before
 * they confirm (TESTING.md 42.97 finding (a), 42.104).
 *
 * THE IMAGE'S BUILD is the version word of its header (0x20C). It sits inside the cleartext
 * window every staged form leaves verbatim, so a decrypted image and a raw payload both carry it.
 * Every image of the FW-V1 corpus carries its own build's version there (31 images, 0.3.0.1 to
 * 44.27.3.10; TESTING.md 42.104). THE CAMERA'S BUILD is the version its build block reports
 * (`DeviceState.version`): the same four bytes in the same order.
 *
 * ONE VERSION, TWO BUILDS. 1.3.0.8 is an 8 Hz build and a 16 Hz FF build. The image says which
 * (`plainChainBuildOf`), and the camera's own per-bank answers say which it runs
 * (`runningApplicationOf`). The FF image has its own gate (write.ts `ffRunningGate`), so only the
 * 8 Hz image is held against the running build here. The 2016 Compact PRO's 1.0.3.0 and 1.0.3.2
 * also come as a 9 Hz and an 18 Hz FF build under one version; nothing the camera answers tells
 * those two apart here, so on that line only the version is compared.
 *
 * WHAT FOLLOWS is said only where the source says it: on the 2014 plaintext chain the camera's
 * checks are the image's header and word sum (the application's commit gate and the bootloader's
 * image_sum_ok, running.ts), so a different version is taken and runs. On the other lines nothing
 * here has checked it, and the warning says so.
 * ==================================================================== */

import { IMAGE_MAGIC, parseImageHeader } from '../image/header.js';
import type { DeviceState } from '../workflows/types.js';
import { FF_1308_VERSION } from './capability-family.js';
import { runningApplicationOf } from './running.js';
import type { ImageBuildWarning } from './types.js';

/**
 * How the bank takes the bytes: 'plain-chain' when the 2014 chain programs them as they are (a
 * decrypted image staged plain, or raw bytes on that chain that are not the FF form); 'other' for
 * every other form (Key A ciphertext, the 2016 stage-key form, the 1.3.0.8 FF vendor form).
 */
export type ImageBuildForm = 'plain-chain' | 'other';

/** A header version word that names no build: erased (all ones) or never set (zero). */
function blankVersion(word: number): boolean {
  return word === 0 || word >>> 0 === 0xffffffff;
}

/**
 * The warning for an image that may not be the build the camera runs, or null when it is (or when
 * the bytes carry no image header, as raw bytes may not). Pure; nothing is sent, nothing refused.
 */
export function imageBuildWarningOf(
  bytes: Uint8Array,
  state: DeviceState,
  form: ImageBuildForm,
): ImageBuildWarning | null {
  const header = parseImageHeader(bytes);
  if (header?.magic !== IMAGE_MAGIC) return null;
  /* A plan is refused before this when the camera names no version (prepareSlotFlash). */
  const camera = state.version?.trim() ?? '';
  if (camera === '') return null;

  if (blankVersion(header.version)) {
    return {
      code: 'no-version',
      image: null,
      camera,
      text:
        `This image's header names no firmware version, so whether it is the build the camera ` +
        `runs (${camera}) cannot be told. Check that it is the image you mean to write.`,
    };
  }
  const image = header.versionStr;
  if (image !== camera) {
    const follows =
      form === 'plain-chain'
        ? 'On this line the camera checks only that an image is well formed (its header and word sum), not its version, so it takes this image, and when it starts from this bank it runs ' +
          `${image}.`
        : 'Whether this camera takes a different build, and runs it, has not been checked.';
    return {
      code: 'other-version',
      image,
      camera,
      text: `This image is firmware ${image}; the camera runs ${camera}. ${follows}`,
    };
  }
  if (form !== 'plain-chain' || camera !== FF_1308_VERSION) return null;

  const running = runningApplicationOf(state);
  if (running.build === 'ff-1308') {
    return {
      code: 'other-build',
      image: `${FF_1308_VERSION} 8 Hz`,
      camera: `${FF_1308_VERSION} 16 Hz FF`,
      text:
        `This image is the 8 Hz ${FF_1308_VERSION} build; the camera runs the 16 Hz ` +
        `${FF_1308_VERSION} FF build. The 16 Hz build checks a payload against its own FF form when ` +
        'it is committed and refuses one that fails, before it erases the bank (from its source). ' +
        'Writing the 8 Hz build to it has not been tried on a camera.',
    };
  }
  if (running.build === null) {
    return {
      code: 'running-build-unknown',
      image: `${FF_1308_VERSION} 8 Hz`,
      camera: FF_1308_VERSION,
      text:
        `This image is the 8 Hz ${FF_1308_VERSION} build. The camera runs ${FF_1308_VERSION}, which ` +
        'comes as an 8 Hz and a 16 Hz FF build, and its own answers did not say which one it runs, ' +
        'so whether this is its build cannot be told.',
    };
  }
  return null;
}
