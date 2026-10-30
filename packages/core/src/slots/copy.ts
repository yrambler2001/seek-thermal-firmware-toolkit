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
import { bankNameOf } from '../profiles/locked-boot.js';
import { coreMessage, recordedParam, type CoreMessage } from '../message.js';
import { bankNameParam } from './backup.js';
import { slotDumpNames } from './dump.js';
import { prepareSlotFlash } from './write.js';
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
  /** Where the image comes from, in words ("Slot A, firmware 1.0.3.0, as the slots read decrypted it"). */
  readonly source: string;
  /** `source` as a message, for the page. */
  readonly sourceMessage?: CoreMessage;
  readonly plan: SlotFlashPlan;
}

/** The bank's name in the build's plan. */
function nameOf(report: SlotsReport, key: SlotKey): string {
  return report.plan.slots.find((slot) => slot.key === key)?.name ?? bankNameOf(key);
}

/**
 * Why the image of `from` cannot be copied to any bank, from the source alone, or null when it can: a bank
 * that was not read, is empty, holds no image, or that no recovered key opens. The target's own rules (its
 * write support, the camera-wide refusal, the acknowledgement) are the writer's.
 */
export function copySourceRefusal(report: SlotsReport, from: SlotKey): string | null {
  return copySourceRefusalMessage(report, from)?.text ?? null;
}

const NO_READ: CoreMessage = coreMessage('copy.source.noRead', {}, 'no read');

/** `copySourceRefusal` as a message, for the page. */
export function copySourceRefusalMessage(report: SlotsReport, from: SlotKey): CoreMessage | null {
  const view = report.slots.find((candidate) => candidate.entry.key === from);
  const name = nameOf(report, from);
  const bank = { name: bankNameParam(name, from) };
  if (view === undefined) {
    return coreMessage('copy.source.notInPlan', bank, `${name} is not in this build's plan`);
  }
  if (view.state === null) {
    const reason =
      view.unreadReason === null
        ? NO_READ
        : recordedParam(view.unreadReasonMessage, view.unreadReason);
    return coreMessage(
      'copy.source.notRead',
      { ...bank, reason },
      `${name} was not read (${view.unreadReason ?? NO_READ.text}), so there is no image to copy`,
    );
  }
  if (view.content === 'empty') {
    return coreMessage('copy.source.empty', bank, `${name} is empty: there is no image to copy`);
  }
  if (view.content === 'foreign') {
    return coreMessage(
      'copy.source.foreign',
      bank,
      `${name} holds no firmware image this read recognises, so there is nothing to copy`,
    );
  }
  if (view.state.plain === null) {
    return coreMessage(
      'copy.source.noKey',
      bank,
      `no key this read recovered opens ${name}, so there is no decrypted image to copy`,
    );
  }
  return null;
}

/** What a copy's plan says, as messages for the page (`source` and the note are their English). */
export const COPY_WORDS = {
  source: (
    fromName: string,
    from: SlotKey,
    address: number,
    version: string | null,
  ): CoreMessage => {
    const name = bankNameParam(fromName, from);
    const at = hexUp(address);
    return coreMessage(
      version === null ? 'copy.from' : 'copy.fromVersion',
      version === null ? { name, address: at } : { name, address: at, version },
      `${fromName} at ${at}` +
        `${version === null ? '' : `, firmware ${version}`}, as the slots read decrypted it`,
    );
  },
  note: (
    fromName: string,
    from: SlotKey,
    version: string | null,
    size: number,
    sha256: string,
  ): CoreMessage => {
    const name = bankNameParam(fromName, from);
    return coreMessage(
      version === null ? 'copy.note' : 'copy.noteVersion',
      version === null ? { name, size, sha256 } : { name, version, size, sha256 },
      `The image is ${fromName}'s, as the slots read decrypted it: ` +
        `${version === null ? '' : `firmware ${version}, `}${String(size)} B, sha256 ${sha256}.`,
    );
  },
} as const;

/**
 * Plans the copy of `from`'s image into `to`. Throws a refusal (nothing sent) for a copy onto itself, for a
 * source with no image to copy, and for everything `prepareSlotFlash` refuses for a decrypted image in `to`.
 */
export function planSlotCopy(report: SlotsReport, from: SlotKey, to: SlotKey): SlotCopyPlan {
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
  const prepared = prepareSlotFlash(report, to, { kind: 'plain', bytes: plain, fileName });
  const source = COPY_WORDS.source(fromName, from, view?.entry.address ?? 0, version);
  const note = COPY_WORDS.note(fromName, from, version, plain.length, sha256Sync(plain));
  return {
    from,
    to,
    fileName,
    source: source.text,
    sourceMessage: source,
    plan: {
      ...prepared,
      notes: [{ source: 'write', text: note.text, message: note }, ...prepared.notes],
    },
  };
}
