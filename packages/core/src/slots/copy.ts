/* ==================================================================== *
 * Copying one bank's firmware into another: the source bank's image, as the slots read decrypted it,
 * staged for the target exactly as "Flash decrypted image" stages a picked file (`prepareSlotFlash`), so
 * every rule of a decrypted-image write applies, with the target's own warnings (the booted bank,
 * recovery R). Pure: nothing is read or sent here. The write is `flashSlotWithBackup` with the action
 * `{ kind: 'copy', from }`, which saves the target first.
 *
 * The page offers "Copy to slot A / B / recovery slot R" on each bank row (the row is the source), and
 * `seek-fw slots copy <from> <to>` does the same (owner, 2026-10-26).
 * ==================================================================== */

import { hexUp } from '../bytes.js';
import { slotDumpNames } from './dump.js';
import { prepareSlotFlash, type PrepareSlotFlashOptions } from './write.js';
import { slotRefused } from './write-image.js';
import { sha256Sync } from './write-sha.js';
import type { SlotFlashPlan, SlotKey, SlotsReport } from './types.js';

/** A copy, planned: where the image comes from, the name it is prepared under, and the writer's plan. */
export interface SlotCopyPlan {
  readonly from: SlotKey;
  readonly to: SlotKey;
  /**
   * The name the image is prepared under: the source bank's decrypted dump name (`slotDumpNames`), which
   * carries the camera's key pair when the image holds it, as a dump's decrypted file does.
   */
  readonly fileName: string;
  /** Where the image comes from, in words ("Bank A, firmware 1.0.3.0, as the slots read decrypted it"). */
  readonly source: string;
  readonly plan: SlotFlashPlan;
}

/** The bank's name in the build's plan. */
function nameOf(report: SlotsReport, key: SlotKey): string {
  return report.plan.slots.find((slot) => slot.key === key)?.name ?? `Bank ${key.toUpperCase()}`;
}

/**
 * Why the image of `from` cannot be copied to any bank, from the source alone, or null when it can: a bank
 * that was not read, is empty, holds no image, or that no recovered key opens. The target's own rules (its
 * write support, the camera-wide refusal, the acknowledgement) are the writer's.
 */
export function copySourceRefusal(report: SlotsReport, from: SlotKey): string | null {
  const view = report.slots.find((candidate) => candidate.entry.key === from);
  const name = nameOf(report, from);
  if (view === undefined) return `${name} is not in this build's plan`;
  if (view.state === null) {
    return `${name} was not read (${view.unreadReason ?? 'no read'}), so there is no image to copy`;
  }
  if (view.content === 'empty') return `${name} is empty: there is no image to copy`;
  if (view.content === 'foreign') {
    return `${name} holds no firmware image this read recognises, so there is nothing to copy`;
  }
  if (view.state.plain === null) {
    return `no key this read recovered opens ${name}, so there is no decrypted image to copy`;
  }
  return null;
}

/**
 * Plans the copy of `from`'s image into `to`. Throws a refusal (nothing sent) for a copy onto itself, for a
 * source with no image to copy, and for everything `prepareSlotFlash` refuses for a decrypted image in `to`.
 */
export function planSlotCopy(
  report: SlotsReport,
  from: SlotKey,
  to: SlotKey,
  options: PrepareSlotFlashOptions = {},
): SlotCopyPlan {
  const fromName = nameOf(report, from);
  if (from === to) throw slotRefused(`${fromName} is not copied onto itself. Nothing was written.`);
  const why = copySourceRefusal(report, from);
  if (why !== null) throw slotRefused(`${why}. Nothing was written.`);
  const view = report.slots.find((candidate) => candidate.entry.key === from);
  const state = view?.state ?? null;
  const plain = state?.plain ?? null;
  if (state === null || plain === null) {
    throw slotRefused(`${fromName} has no decrypted image to copy. Nothing was written.`);
  }
  const version = state.plainHeader?.versionStr ?? state.header?.versionStr ?? null;
  const storedSha = state.raw === null ? sha256Sync(plain) : sha256Sync(state.raw);
  const { decrypted } = slotDumpNames(
    { key: from, sha256: storedSha, empty: false, plain },
    version,
    report.state.keyTable,
  );
  const fileName = decrypted ?? `seek-slot-${from}-decrypted.bin`;
  const prepared = prepareSlotFlash(report, to, { kind: 'plain', bytes: plain, fileName }, options);
  const source =
    `${fromName} at ${hexUp(view?.entry.address ?? 0)}` +
    `${version === null ? '' : `, firmware ${version}`}, as the slots read decrypted it`;
  const note =
    `The image is ${fromName}'s, as the slots read decrypted it: ` +
    `${version === null ? '' : `firmware ${version}, `}${String(plain.length)} B, sha256 ${sha256Sync(plain)}.`;
  return {
    from,
    to,
    fileName,
    source,
    plan: { ...prepared, notes: [{ source: 'write', text: note }, ...prepared.notes] },
  };
}
