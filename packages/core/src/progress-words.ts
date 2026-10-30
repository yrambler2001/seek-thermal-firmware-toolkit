/**
 * The status lines core's long runs give `reporter.progress`, as messages: the
 * line a run panel shows under its bar while a dump, a read, a sweep or a
 * Preserve step runs. Each `text` is the English the CLI and the logs print, as
 * it was; the message lets the page show the same line in the reader's
 * language (the page's useReporter shows `message`, the log keeps `text`).
 * The page's i18n/core-messages.test.ts renders every one against its English.
 */

import { hex, hexUp } from './bytes.js';
import { bankParam, coreMessage, paramText, type CoreMessage, type CoreParam } from './message.js';
import type { SlotKey } from './profiles/types.js';

/** A bank as a run names it: the bank param while the name is the usual one, else the name as given. */
function bankNamed(key: SlotKey, name: string): CoreParam {
  const param = bankParam(key, 'name');
  return paramText(param) === name ? param : name;
}

export const PROGRESS_WORDS = {
  /** Preserve step 01, the backup: the 64 KiB block it is reading. */
  backupBlock: (address: number): CoreMessage =>
    coreMessage(
      'progress.backupBlock',
      { address: hexUp(address, 8) },
      `Backup: block ${hexUp(address, 8)}`,
    ),
  backupDone: (): CoreMessage => coreMessage('progress.backupDone', {}, 'Backup: every block read'),
  /** Preserve step 06, the check read: the block it is reading. */
  checkBlock: (address: number): CoreMessage =>
    coreMessage(
      'progress.checkBlock',
      { address: hexUp(address, 8) },
      `Check: block ${hexUp(address, 8)}`,
    ),
  checkDone: (): CoreMessage => coreMessage('progress.checkDone', {}, 'Check: every block read'),
  /** The label of a bank write (Preserve step 03) and of a restore (step 05). */
  writingBank: (key: SlotKey): CoreMessage =>
    coreMessage(
      'progress.writingBank',
      { bank: bankParam(key) },
      `Writing ${paramText(bankParam(key))}`,
    ),
  restoringBank: (key: SlotKey): CoreMessage =>
    coreMessage(
      'progress.restoringBank',
      { bank: bankParam(key) },
      `Restoring ${paramText(bankParam(key))}`,
    ),
  /** How much of a bank write has been sent: `label` is writingBank or restoringBank. */
  staged: (label: CoreMessage, done: number, total: number): CoreMessage =>
    coreMessage(
      'progress.staged',
      { label, done, total },
      `${label.text}: staged ${String(done)}/${String(total)} B`,
    ),
  /** Preserve step 04, the whole-flash read. */
  wholeFlash: (got: number, total: number): CoreMessage =>
    coreMessage(
      'progress.wholeFlash',
      { got, total },
      `Whole-flash read: ${String(got)}/${String(total)} B`,
    ),
  /** The 4.x dump: the window it is reading, by address and selector. */
  readWindow: (address: number, subcmd: number, auth: boolean): CoreMessage =>
    coreMessage(
      auth ? 'progress.readWindowAuth' : 'progress.readWindow',
      { address: hex(address, 8), subcmd: hex(subcmd) },
      `read ${hex(address, 8)} subcmd=${hex(subcmd)}${auth ? ' (auth)' : ''} ...`,
    ),
  /** The 4.x dump's last line. */
  windowsRead: (ok: number, total: number): CoreMessage =>
    coreMessage(
      'progress.windowsRead',
      { ok, total },
      `Done — ${String(ok)}/${String(total)} windows read.`,
    ),
  /** The camera read (Info, Slots): the bank it is reading, and the analysis after. */
  readingBank: (key: SlotKey, name: string): CoreMessage =>
    coreMessage('progress.readingBank', { bank: bankNamed(key, name) }, `Reading ${name} ...`),
  analysing: (): CoreMessage => coreMessage('progress.analysing', {}, 'Analysing ...'),
  /** The selector sweep: the selector it is trying, and its last line. */
  probeSelector: (subcmd: number): CoreMessage =>
    coreMessage(
      'progress.probeSelector',
      { selector: hex(subcmd) },
      `probe selector ${hex(subcmd)} ...`,
    ),
  selectorsArmed: (armed: number, span: number, withData: number): CoreMessage =>
    coreMessage(
      'progress.selectorsArmed',
      { armed, span, withData },
      `Done — ${String(armed)}/${String(span)} selectors armed, ${String(withData)} with data.`,
    ),
  /** The offline decrypt of a dump: the image whose key it is solving. */
  recoveringKey: (address: string): CoreMessage =>
    coreMessage(
      'progress.recoveringKey',
      { address },
      `decrypt: recovering key for ${address} ...`,
    ),
} as const;
