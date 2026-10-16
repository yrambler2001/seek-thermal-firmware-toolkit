/**
 * The seam between the bench flow (`spec-flow.ts`) and what it drives.
 *
 * The real rig is the bench library (`index.ts`: the subject tree, the J-Link,
 * the bench camera, the build-string patcher) plus the Electron page
 * (`spec-page.ts`). The fake rig (`spec-fakes.ts`) is an in-memory stand-in used
 * only when SEEK_BENCH_FAKE=1, so the flow's control can be rehearsed with no
 * hardware. The flow never imports either of them: it sees only these types.
 */

import { benchRoot, listBenchSubjects } from './index.js';
import type {
  BenchSubject,
  BenchSubjectQuery,
  BenchCamera,
  JlinkBench,
  PatchedBuildString,
} from './types.js';

/** One of the three banks: A, B, or the recovery bank R. */
export type BankLetter = 'a' | 'b' | 'r';

/** A bank row as the page shows it. */
export interface BankView {
  readonly letter: BankLetter;
  /** "Bank A", "Bank B", "Recovery bank R". */
  readonly name: string;
  readonly address: number;
  /** The version the row reports, or null when the bank holds no readable image. */
  readonly version: string | null;
  /** The row says "booted now". */
  readonly booted: boolean;
}

export interface PageRead {
  /** The status line the run ended on ("Read. 3/3 banks read ..."). */
  readonly status: string;
  readonly banks: readonly BankView[];
  /** The summary's "running build", when the page shows one. */
  readonly runningBuild: string | null;
}

/** A file the page saved from a Dump. */
export interface PageDump {
  readonly raw: Uint8Array;
  readonly rawName: string;
  /** The decrypted image, when a recovered key opens the bank; null when none does. */
  readonly decrypted: Uint8Array | null;
  readonly decryptedName: string | null;
}

/** An image handed to a bank's picker, under the name the page saved it by. */
export interface PageImage {
  readonly name: string;
  readonly bytes: Uint8Array;
}

export interface PageWrite {
  /** The status line the write ended on ("Written. ..."). */
  readonly status: string;
  /** Whether the confirmation asked for the extra tick (the booted bank, or R). */
  readonly ackShown: boolean;
  /** The page's verdict panel ("Slot B — ...: the bank reads back as written."), or null. */
  readonly outcome: string | null;
}

/** One Electron window on the slots page, connected to the camera. */
export interface BenchPage {
  readSlots(): Promise<PageRead>;
  dump(letter: BankLetter): Promise<PageDump>;
  /**
   * Picks `image` for `letter`, confirms the write, and returns the page's
   * verdict. Throws when the page does not reach "Written", or when its
   * acknowledgement prompt is not what `acknowledge` expects (nothing is sent).
   */
  write(letter: BankLetter, image: PageImage, acknowledge: boolean): Promise<PageWrite>;
  /** Every request the write guard refused in this window, and every REFUSED line. */
  refusals(): Promise<string[]>;
  close(): Promise<void>;
}

export interface BenchRig {
  readonly kind: 'real' | 'fake';
  readonly jlink: JlinkBench;
  readonly camera: BenchCamera;
  readonly patch: (image: Uint8Array, buildString: string) => PatchedBuildString | null;
  openPage(): Promise<BenchPage>;
}

/** The subjects the matrix runs, and the ones the tree lists but the matrix leaves out. */
export interface LoadedSubjects {
  readonly subjects: readonly BenchSubject[];
  /** Listed by the tree but not run: not launchable, or below 0.8.0.0 (no slots page). */
  readonly left: readonly BenchSubject[];
}

/**
 * The real subject list: the tree named by SEEK_FULL_DUMPS_BY_CAMERA, the camera
 * it is for (SEEK_BENCH_CAMERA, default 'Compact'), and SEEK_BENCH_ONLY. Only
 * launchable rows the slots page supports are run.
 */
export function loadSubjects(): Promise<LoadedSubjects> {
  const camera = process.env.SEEK_BENCH_CAMERA ?? 'Compact';
  const only = process.env.SEEK_BENCH_ONLY ?? '';
  const query: BenchSubjectQuery = {
    root: benchRoot(),
    camera,
    ...(only === '' ? {} : { only }),
  };
  const listed = listBenchSubjects(query);
  const subjects = listed.filter((subject) => subject.launches && subject.slotsSupported);
  const left = listed.filter((subject) => !subjects.includes(subject));
  if (subjects.length === 0) {
    return Promise.reject(
      new Error(
        `no launchable ${camera} row at 0.8.0.0 or above in the tree (${String(listed.length)} listed)`,
      ),
    );
  }
  return Promise.resolve({ subjects, left });
}
