/* ==================================================================== *
 * The slots bench suite: every launchable full dump, one after the other,
 * on the real bench camera.
 *
 * For each dump: flash the whole 4 MiB with the J-Link and read all 4 MiB
 * back (halted) to prove the flash IS the dump; reset the CPU; wait for the
 * camera on USB; drive the Firmware slots page in Electron (real WebUSB)
 * through both banks; and cross-check what the page says against what the
 * J-Link reads out of the flash. Then the next dump.
 *
 * THIS FILE IS THE CONTRACT between the library (`dump-tree.ts`, `jlink.ts`,
 * `bench-camera.ts`, `build-string.ts`) and the spec (`slots-bench.e2e.ts`).
 * Change it only in a commit of its own.
 *
 * HARD RULES (they bind every implementation of this contract):
 *   - the whole thing is opt-in and writes the real camera's whole flash:
 *     it refuses unless SEEK_E2E_WRITE=i-understand is set (SEEK_E2E_WRITE=
 *     dry-run rehearses everything up to the first J-Link write and stops),
 *     and never when CI is set — the same gate as `supervised-write.ts`;
 *   - the power switch is driven on CHANNEL 2 ONLY (the camera). Channel 1
 *     is the J-Link's own power and is never toggled; the switch's serial
 *     port is never opened at 1200 baud;
 *   - nothing here may use `dump-spifi-4m` (it overwrites the unit's
 *     original dump in FW-V1); the J-Link is driven through FW-V1's own
 *     `jlink-runner` for erase/flash and one halted JLinkExe session for
 *     the read-back, exactly as `TESTING.md` section 41.5 records;
 *   - no personal absolute path is committed: every location is an
 *     environment variable (below) or relative to the repository.
 * ==================================================================== */

/** One 4 MiB dump to put on the camera, as the dump tree names it. */
export interface BenchSubject {
  /** The bench camera the tree is for ('Compact' = board 297, 'Compact Pro'). */
  readonly camera: string;
  /** The product family folder ('Compact', 'Compact Pro', 'Mosaic 320x240', ...). */
  readonly family: string;
  /** The dated version folder, e.g. '2014.10.21-14.58.29-1.3.0.0'. */
  readonly folder: string;
  /** The firmware version, e.g. '1.3.0.0'. */
  readonly version: string;
  /** The tree's own variant label ('std', 'vtfix', 'pn297', ...). */
  readonly variant: string;
  /** Absolute path of the file to flash: the launchable copy when the tree has one, else the primary. */
  readonly file: string;
  /** Which of the two it is. */
  readonly fileKind: 'primary' | 'launchable';
  /** sha256 of that file, as the tree's index records it (checked against the bytes). */
  readonly sha256: string;
  /** The tree's bench record: the camera enumerated with this file. */
  readonly launches: boolean;
  /** The slots page supports this build (>= 0.8.0.0, as `buildSlotPlan` decides). */
  readonly slotsSupported: boolean;
}

/** What `listBenchSubjects` is asked. */
export interface BenchSubjectQuery {
  /** The tree root (SEEK_FULL_DUMPS_BY_CAMERA). */
  readonly root: string;
  /** Which camera's tree, default 'Compact'. */
  readonly camera?: string;
  /** Only subjects whose version or folder contains this text (SEEK_BENCH_ONLY). */
  readonly only?: string;
}

/** The J-Link side, over one physical probe and one camera. */
export interface JlinkBench {
  /** Erase the whole part and flash the full 4 MiB file with the runner (retrying a clean verify). */
  flashFull(file: string): Promise<void>;
  /** One halted J-Link session: `savebin` of [address, address+length) to a file; returns the bytes. */
  readFlash(address: number, length: number): Promise<Uint8Array>;
  /** Read all 0x400000 bytes back and require sha256 equal to `sha256` (throws, naming both). */
  verifyFull(sha256: string): Promise<void>;
  /** Reset the CPU over SWD (`r` then `g`) so the camera boots what is in flash. */
  resetCpu(): Promise<void>;
}

/** The camera side: USB presence, power, and the running firmware. */
export interface BenchCamera {
  /** True when a Seek camera (VID 0x289D) is on the bus. */
  present(): boolean;
  /** Poll the bus every `pollMs` until a camera is present; the wait in ms, or null on timeout. */
  waitForEnumeration(timeoutMs: number, pollMs?: number): Promise<number | null>;
  /**
   * Waits for a reset to take effect: the camera leaves the bus, then comes back. Null when
   * it is still on the bus `dropMs` after the reset (the reset did not reboot it) or does not
   * come back within `timeoutMs`; otherwise the wait in ms from the reset.
   */
  waitForReboot(dropMs: number, timeoutMs: number): Promise<number | null>;
  /** Cut and restore the camera's power on switch channel 2 only. */
  powerCycle(offMs?: number): Promise<void>;
  /** What `seek-fw info --json` says is running, or null when it cannot be read. */
  runningInfo(): Promise<RunningInfo | null>;
}

export interface RunningInfo {
  readonly product: string | null;
  readonly serial: string | null;
  readonly firmwareVersion: string | null;
  readonly buildString: string | null;
  readonly bootloaderVersion: string | null;
}

/** One image with its build string altered in place (same length), to see which bank boots. */
export interface PatchedBuildString {
  readonly patched: Uint8Array;
  /** The text that was there, the text now, and every offset changed. */
  readonly from: string;
  readonly to: string;
  readonly offsets: readonly number[];
}

/**
 * Environment (all optional unless marked; none has a personal default):
 *   SEEK_FULL_DUMPS_BY_CAMERA  the dump tree root (required)
 *   SEEK_BENCH_CAMERA          'Compact' (default) or 'Compact Pro'
 *   SEEK_BENCH_ONLY            run only subjects whose version/folder contains this
 *   SEEK_E2E_FWV1_DIR          the FW-V1 checkout (required): the runner lives at
 *                              targets/compact_32k_1_3_0_8 (make jlink-run)
 *   SEEK_E2E_JLINK_SN          the J-Link serial number (required)
 *   SEEK_E2E_JLINK_DEVICE      default LPC4330_M4
 *   SEEK_E2E_SWITCH_DIR / SEEK_E2E_SWITCH_CHANNEL (must be 2)   as power-switch.ts
 *   SEEK_E2E_WRITE             'i-understand' to run, 'dry-run' to rehearse
 */
export const BENCH_FLASH_BYTES = 0x400000;
export const BENCH_FLASH_BASE = 0x14000000;
