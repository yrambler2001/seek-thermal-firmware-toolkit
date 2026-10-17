/**
 * The real rig's page: one Electron window on the Firmware slots page, with the
 * real camera over real WebUSB, and the real rig that pairs it with the bench
 * library (`index.ts`). Only the bench spec uses this; nothing here changes the
 * guards the other real-camera specs run under.
 *
 * The guards, for every window the bench opens:
 *   - the page-side guard is the camera write run's LIFTED guard
 *     (`CAMERA_WRITE_GUARD`: the two flash writes and their budgets, every reset
 *     refused), plus the two info selectors "Read slots" sends, let out by shape
 *     (`DEVICE_INFO_GUARD`'s `infoOps`). Its write budgets are 0 until a write
 *     opens them, and are shut again after it;
 *   - the UI guard (`SLOTS_BENCH_UI`) allows the slots page's own actions and
 *     refuses the raw flash, the forget button and every reset-shaped action.
 * The camera is picked by its chooser entry (`CAMERA_NAME` matches vendor 0x289D);
 * the main process refuses any other device (`e2e/electron/main.mjs`).
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { CAMERA_WRITE_GUARD, DEVICE_INFO_GUARD } from '../camera-flow.js';
import { setGuard } from '../electron-camera.js';
import { HEADED } from '../spec.js';
import { cameraBusyReason } from '../preflight.js';
import type { WriteApproval } from '../supervised-write.js';
import { openTarget, type TargetHandle } from '../target.js';
import { guardInstalled, refusalsOf } from '../target-tools.js';
import {
  ACK_BOX,
  CONFIRM_DIALOG,
  bankRows,
  confirmEnabled,
  confirmWrite,
  dumpBank,
  fillFromBank,
  openWriteConfirm,
  outcomeAlert,
  pickImage,
  readSlots,
  rowOf,
  summaryRows,
  type BankRowView,
} from '../slots-page.js';
import { installWriteGuard, type WriteGuardConfig } from '../write-guard.js';
import type { UiGuard } from '../wizard.js';
import { createBenchCamera, createJlinkBench, patchBuildString } from './index.js';
import type {
  BankLetter,
  BankView,
  BenchPage,
  BenchRig,
  PageDump,
  PageImage,
  PageRead,
  PageRefusal,
  PageWrite,
} from './spec-rig.js';

/** The bench's write guard: the camera write run's, with the Read slots info selectors let out by shape. */
const BENCH_GUARD: WriteGuardConfig = {
  ...DEVICE_INFO_GUARD,
  neverOps: [],
  writeOps: CAMERA_WRITE_GUARD.writeOps ?? null,
};

/** The preload script that installs `BENCH_GUARD` in every window. */
export function benchGuardScript(): string {
  return `(${installWriteGuard.toString()})(${JSON.stringify(BENCH_GUARD)});\n`;
}

/**
 * The slots page's own actions, and nothing else that writes: the raw flash, the
 * forget button and the Preserve steps are refused. The slots page has no
 * Preserve phase, so `allowPhase` is always false.
 */
export const SLOTS_BENCH_UI: UiGuard = {
  name: 'Firmware slots, bench (decrypted images only)',
  allowClick: (label) =>
    !/raw|forget|preserve|patch & dump|restore & verify|read & build|jump past|skip the commit|replug/i.test(
      label,
    ),
  allowRoute: (hash) => /^#\/(slots)?$/.test(hash),
  allowPhase: () => false,
};

/** One 64 KiB bank, the unit the page writes and dumps. */
const BANK_LENGTH = 0x10000;
/** The page stages a payload in 64-byte chunks (`EP0_BUF`). */
const CHUNK_BYTES = 64;
/** Chunks beyond the image's own count the guard lets out before it refuses. */
const CHUNK_SLACK = 64;

/** The stage budget for one write: the chunks its image needs, plus slack. */
function stagesFor(length: number): number {
  return Math.ceil(Math.max(length, BANK_LENGTH) / CHUNK_BYTES) + CHUNK_SLACK;
}

/** Writes a picked image to the scratch folder under the name the page saved it by. */
function writeScratch(dir: string, image: PageImage): string {
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, image.name);
  writeFileSync(file, image.bytes);
  return file;
}

function bankView(row: BankRowView): BankView {
  const version = /^(\d+\.\d+\.\d+\.\d+)\b/.exec(row.firmware)?.[1] ?? null;
  return {
    letter: row.letter,
    name: row.name,
    address: Number.parseInt(row.address, 16),
    version,
    booted: row.booted,
    firmware: row.firmware,
  };
}

/**
 * Opens one Electron window on the slots page and connects it to the camera.
 * Throws when the chooser or the guard is not as expected; the window is closed
 * before the error goes out.
 */
export async function openBenchPage(scratchDir: string): Promise<BenchPage> {
  mkdirSync(scratchDir, { recursive: true });
  const target = await openTarget('camera', {
    scratchDir,
    source: 'dev',
    uiGuard: SLOTS_BENCH_UI,
    preloadSource: benchGuardScript(),
    headed: HEADED,
  });
  try {
    await target.wizard.route('#/slots');
    checkChooserEntry(await target.wizard.connect());
    if (!(await guardInstalled(target))) throw new Error('the write guard is not in the page');
    return windowOf(target, scratchDir);
  } catch (error) {
    await target.close().catch(() => undefined);
    throw error;
  }
}

/**
 * The chooser's entry must be a Seek camera (vendor 0x289D), whatever its product name:
 * the matrix covers every family, and each names itself differently (PIR206, CompactXR,
 * Nano200 ...). The main process refuses any other device.
 */
export function checkChooserEntry(chooserName: string): string {
  if (!/\(289d:[0-9a-f]{4}\)$/i.test(chooserName)) {
    throw new Error(`the chooser picked "${chooserName}", not a Seek camera (vendor 0x289D)`);
  }
  return chooserName;
}

function windowOf(target: TargetHandle, scratchDir: string): BenchPage {
  const picked = path.join(scratchDir, 'picked');

  /* The prepared plan is confirmed: the extra tick only where the page asks for it, and the page's
   * own verdict back. Shared by the picker's write and the bank's own fill. */
  async function confirmPrepared(name: string, acknowledge: boolean): Promise<PageWrite> {
    await openWriteConfirm(target.wizard, target.page, name);
    const ackShown = (await target.page.$(ACK_BOX)) !== null;
    if (ackShown !== acknowledge) {
      await target.wizard.click(CONFIRM_DIALOG, 'Cancel');
      throw new Error(
        `the page ${ackShown ? 'asks' : 'does not ask'} for the acknowledgement on ${name}; ` +
          `the plan expected it ${acknowledge ? 'to' : 'not to'}`,
      );
    }
    if (ackShown && (await confirmEnabled(target.wizard, name))) {
      throw new Error(`${name}: Yes is on before the acknowledgement is ticked`);
    }
    const status = await confirmWrite(target.wizard, target.page, name, ackShown);
    if (!status.startsWith('Written. ')) {
      throw new Error(
        `the write ended "${status}"\n${await target.wizard.logTail('slotsrun', 25)}`,
      );
    }
    return { status, ackShown, outcome: (await outcomeAlert(target.page)) ?? null };
  }

  /* Every budget back to zero: nothing is staged or committed outside a write. */
  async function shutGuard(): Promise<void> {
    await setGuard(target.page, {
      allowReset: false,
      resetBudget: null,
      stageBudget: 0,
      commitBudget: 0,
      commitSum16: null,
    }).catch(() => undefined);
  }

  return {
    async readSlots(): Promise<PageRead> {
      const status = await readSlots(target.wizard, target.page);
      if (!status.startsWith('Read. 3/3')) {
        throw new Error(
          `Read slots ended "${status}"\n${await target.wizard.logTail('slotsrun', 25)}`,
        );
      }
      const summary = await summaryRows(target.page);
      return {
        status,
        banks: (await bankRows(target.page)).map(bankView),
        runningBuild: summary['running build'] ?? null,
      };
    },

    async dump(letter: BankLetter): Promise<PageDump> {
      const saved = await dumpBank(target.wizard, target.page, target.downloads, letter);
      return {
        status: saved.status,
        raw: saved.raw.bytes,
        rawName: saved.raw.name,
        decrypted: saved.decrypted?.bytes ?? null,
        decryptedName: saved.decrypted?.name ?? null,
      };
    },

    async refuse(letter: BankLetter, image: PageImage): Promise<PageRefusal> {
      const name = (await rowOf(target.page, letter)).name;
      const file = writeScratch(picked, image);
      /* Every budget is zero: a refused image must not reach the stage or the commit. */
      await setGuard(target.page, {
        allowReset: false,
        resetBudget: null,
        stageBudget: 0,
        commitBudget: 0,
        commitSum16: null,
      });
      const status = await pickImage(target.wizard, target.page, letter, 'plain', file);
      if (!status.startsWith('Rejected')) {
        throw new Error(
          `${name}: the picker took the image ("${status}"); it was not refused, so nothing is confirmed`,
        );
      }
      const log = await target.wizard.logTail('slotsrun', 60);
      const reasons = [...log.matchAll(/cannot use this file: (.+)$/gm)].map(
        (match) => match[1] ?? '',
      );
      return { status, reason: reasons.at(-1) ?? null };
    },

    async write(letter: BankLetter, image: PageImage, acknowledge: boolean): Promise<PageWrite> {
      const name = (await rowOf(target.page, letter)).name;
      const file = writeScratch(picked, image);
      await setGuard(target.page, {
        allowReset: false,
        resetBudget: null,
        stageBudget: stagesFor(image.bytes.length),
        commitBudget: 1,
        commitSum16: null,
      });
      try {
        const status = await pickImage(target.wizard, target.page, letter, 'plain', file);
        if (!status.startsWith('Ready — ')) {
          throw new Error(
            `the picker answered "${status}"\n${await target.wizard.logTail('slotsrun', 25)}`,
          );
        }
        return await confirmPrepared(name, acknowledge);
      } finally {
        await shutGuard();
      }
    },

    async fill(letter: BankLetter, acknowledge: boolean): Promise<PageWrite> {
      const name = (await rowOf(target.page, letter)).name;
      /* The fill's stage is the booted bank's image: at most one bank long. */
      await setGuard(target.page, {
        allowReset: false,
        resetBudget: null,
        stageBudget: stagesFor(BANK_LENGTH),
        commitBudget: 1,
        commitSum16: null,
      });
      try {
        const { label, status } = await fillFromBank(target.wizard, target.page, letter);
        if (!status.startsWith('Ready — ')) {
          throw new Error(
            `"${label}" answered "${status}"\n${await target.wizard.logTail('slotsrun', 25)}`,
          );
        }
        return await confirmPrepared(name, acknowledge);
      } finally {
        await shutGuard();
      }
    },

    async refusals(): Promise<string[]> {
      return refusalsOf(target);
    },

    async close(): Promise<void> {
      await target.close();
    },
  };
}

/**
 * The real rig: the bench library's J-Link and camera (both given the write
 * gate's result, which they check before any flash write), and the Electron page.
 */
export function createRealRig(approval: WriteApproval, scratchRoot: string): Promise<BenchRig> {
  /* The run's camera lock (preflight.ts): taken here, before the first flash, and held
   * until the run ends. Every window's openTarget takes the same check again. */
  const busy = cameraBusyReason();
  if (busy !== null) return Promise.reject(new Error(`the bench camera is not free: ${busy}`));
  const jlink = createJlinkBench({ gate: approval });
  const camera = createBenchCamera({ gate: approval });
  let windows = 0;
  return Promise.resolve({
    kind: 'real',
    jlink,
    camera,
    patch: (image: Uint8Array, buildString: string, mark?: string) =>
      patchBuildString(image, buildString, mark),
    openPage: () => {
      windows += 1;
      return openBenchPage(path.join(scratchRoot, `window-${String(windows)}`));
    },
  });
}
