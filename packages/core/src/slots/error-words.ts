/**
 * Refusals and failures of the slot read and the slot write that a person can
 * meet on the page, as messages beside their English: a bank window the camera
 * would not give, a build the slot plan refuses, a backup the browser did not
 * save. Each `text` is the error's message exactly as the CLI prints it.
 */

import { hex } from '../bytes.js';
import { errorParam } from '../errors.js';
import { bankParam, coreMessage, paramText, recordedParam, type CoreMessage } from '../message.js';
import type { SlotKey } from '../profiles/types.js';

export const SLOT_ERROR_WORDS = {
  /** A bank window that could not be read after its retries; `error` is the last one met. */
  windowUnread: (
    key: SlotKey,
    name: string,
    address: number,
    subcmd: number,
    error: unknown,
  ): CoreMessage => {
    const bank = bankParam(key, 'name');
    const said = errorParam(error);
    return coreMessage(
      'slots.window.unread',
      {
        bank: paramText(bank) === name ? bank : name,
        address: hex(address, 8),
        subcmd: hex(subcmd),
        error: said,
      },
      `${name} ${hex(address, 8)} (subcmd ${hex(subcmd)}) could not be read: ${paramText(said)}`,
    );
  },
  /** The slot read of a build the plan refuses; `reason` is the plan's (`supportedBuild`). */
  refusedBuild: (reason: string, reasonMessage: CoreMessage | undefined): CoreMessage =>
    coreMessage(
      'slots.read.refusedBuild',
      { reason: recordedParam(reasonMessage, reason) },
      `refusing to read the firmware slots: ${reason}. Nothing beyond the ` +
        'version read was sent, so no bank was touched.',
    ),
  /** The zip a write saves first was not saved (`why`: the browser's answer, when it gave one). */
  backupNotSaved: (fileName: string, why: string | null): CoreMessage =>
    coreMessage(
      why === null ? 'slots.backup.notSaved' : 'slots.backup.notSavedWhy',
      why === null ? { file: fileName } : { file: fileName, error: why },
      `the backup ${fileName} was not saved${why === null ? '' : ` (${why})`}, so nothing was ` +
        'written. A write never runs without its backup saved first; try again once it can be saved.',
    ),
} as const;
