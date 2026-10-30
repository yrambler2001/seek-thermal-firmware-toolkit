/**
 * A Preserve step's recorded error in the reader's language.
 *
 * The run file keeps each failed step's error as English (`error`) with core's
 * message beside it when core made the error (`errorCode`). One error is the
 * page's own: the reconnect wait in usePreservePanel giving up. It is thrown
 * as a plain Error, so the run file has only its English; it is found here by
 * that English (the template with its two params) and shown translated. Any
 * other error is core's message, else its English (a USB or browser error).
 */

import { t, tEnglish } from '@/i18n';
import { recordedText } from '@/lib/core-text';

/** The reconnect wait's last word, in English: the step's recorded error. */
export function cameraNotBackEnglish(minutes: number, error: string): string {
  return tEnglish('preserve:error.cameraNotBack', { minutes, error });
}

const MINUTES = '\u0001';
const ERROR = '\u0002';

/** The English template as a pattern: minutes and the error captured. */
function cameraNotBackPattern(): RegExp {
  const english = cameraNotBackEnglish(MINUTES as unknown as number, ERROR)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(MINUTES, '(\\d+)')
    .replace(ERROR, '([\\s\\S]*)');
  return new RegExp(`^${english}$`);
}

/** A failed step's reason, as the page shows it. */
export function stepErrorText(errorCode: unknown, error: string): string {
  const waited = cameraNotBackPattern().exec(error);
  if (waited !== null) {
    return t('preserve:error.cameraNotBack', { minutes: waited[1] ?? '', error: waited[2] ?? '' });
  }
  return recordedText(errorCode, error);
}
