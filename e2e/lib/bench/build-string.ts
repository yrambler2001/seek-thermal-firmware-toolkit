/* ==================================================================== *
 * Alters the build string a firmware image carries, in plain bytes, for the
 * bench's "which bank boots" check.
 *
 * The camera reports its running build as `GetFirmwareInfo` selector 0: the
 * version word, then the build date as ASCII (device-info.ts reads it as the
 * text after the version: "Oct 21 2014"). The same text sits in the image itself,
 * in each bank that carries that build (the 1.3.0.0 original has it twice, one
 * copy per bank that holds the running application). So the string is found by
 * its bytes, wherever it is, and every copy is changed.
 *
 * ONE CHARACTER, SAME LENGTH. In every occurrence the last letter or digit moves
 * to the next one (4 -> 5, z -> a), so the image's length, its header and its
 * footer are untouched. The bytes are changed in a COPY: the caller passes the
 * copy through the slots page, which re-balances and encrypts it, so only the
 * plain bytes ever differ.
 * ==================================================================== */

import type { PatchedBuildString } from './types.js';

/** Printable ASCII, the only text this function will search for. */
const PRINTABLE_ASCII = /^[\x20-\x7e]+$/;

/** The index of the last letter or digit in `text`, or -1 when there is none. */
function lastAlnumIndex(text: string): number {
  for (let i = text.length - 1; i >= 0; i--) {
    if (/[A-Za-z0-9]/.test(text.charAt(i))) return i;
  }
  return -1;
}

/** The next letter or digit, wrapping inside its own class (9 -> 0, Z -> A, z -> a). */
function nextChar(char: string): string {
  if (char === '9') return '0';
  if (char === 'Z') return 'A';
  if (char === 'z') return 'a';
  return String.fromCharCode(char.charCodeAt(0) + 1);
}

function matchesAt(image: Uint8Array, at: number, needle: Uint8Array): boolean {
  for (let i = 0; i < needle.length; i++) {
    if (image[at + i] !== needle[i]) return false;
  }
  return true;
}

/**
 * `plainImage` with `buildString` changed in place, in a copy. Null when the
 * string is empty, is not printable ASCII, has no letter or digit to change, or
 * does not occur in the image at all.
 *
 * `mark`, when given, is the one character the last letter or digit becomes (the
 * per-bank boot test writes B, A or R there, so each bank's image names itself).
 * It must be one letter or digit. Without it the character moves to the next one.
 */
export function patchBuildString(
  plainImage: Uint8Array,
  buildString: string,
  mark?: string,
): PatchedBuildString | null {
  if (!PRINTABLE_ASCII.test(buildString)) return null;
  const at = lastAlnumIndex(buildString);
  if (at < 0) return null;
  if (mark !== undefined && !/^[A-Za-z0-9]$/.test(mark)) return null;

  const needle = new Uint8Array(buildString.length);
  for (let i = 0; i < buildString.length; i++) needle[i] = buildString.charCodeAt(i);
  const changed = mark ?? nextChar(buildString.charAt(at));
  const changedByte = changed.charCodeAt(0);

  const patched = plainImage.slice();
  const offsets: number[] = [];
  let i = 0;
  while (i + needle.length <= patched.length) {
    if (matchesAt(patched, i, needle)) {
      offsets.push(i + at);
      patched[i + at] = changedByte;
      i += needle.length;
    } else {
      i++;
    }
  }
  if (offsets.length === 0) return null;

  return {
    patched,
    from: buildString,
    to: `${buildString.slice(0, at)}${changed}${buildString.slice(at + 1)}`,
    offsets,
  };
}
