/**
 * The reader for the ZIPs this toolkit writes (`buildZip`): store-only (method 0), UTF-8 names, no data
 * descriptors. It finds the end-of-central-directory record, walks the central directory, slices each entry
 * out of its local header and checks its CRC-32 before it is returned. Anything compressed is refused with
 * its name: a deflated archive is not one this toolkit wrote, and this reader does not inflate.
 *
 * Core uses it to take a full flash backup out of a Preserve run file (slots/restore.ts), on the page and in
 * the CLI alike.
 */

import { SeekError } from '../errors.js';
import { crc32 } from './crc32.js';

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
const EOCD_SIZE = 22;
const EOCD_MAX_COMMENT = 0xffff;
const CENTRAL_HEADER_SIZE = 46;
const LOCAL_HEADER_SIZE = 30;
const METHOD_STORE = 0;

export interface ZipEntry {
  /** The entry's path inside the archive, as stored. */
  readonly name: string;
  readonly data: Uint8Array;
}

function u16(bytes: Uint8Array, at: number): number {
  return (bytes[at] ?? 0) | ((bytes[at + 1] ?? 0) << 8);
}

function u32(bytes: Uint8Array, at: number): number {
  return (u16(bytes, at) | (u16(bytes, at + 2) << 16)) >>> 0;
}

function refuse(message: string): SeekError {
  return new SeekError('image/malformed', message);
}

/** True when `bytes` starts like a ZIP archive (a local file header). */
export function looksLikeZip(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && u32(bytes, 0) === LOCAL_SIGNATURE;
}

/** Every entry of a store-only ZIP, each checked against its CRC-32. Throws on anything else. */
export function readZipEntries(zip: Uint8Array): ZipEntry[] {
  let eocdAt = -1;
  for (
    let at = zip.length - EOCD_SIZE;
    at >= 0 && at >= zip.length - EOCD_SIZE - EOCD_MAX_COMMENT;
    at--
  ) {
    if (u32(zip, at) === EOCD_SIGNATURE) {
      eocdAt = at;
      break;
    }
  }
  if (eocdAt < 0) throw refuse('this file is not a ZIP archive (no end-of-central-directory)');
  const count = u16(zip, eocdAt + 10);
  const directorySize = u32(zip, eocdAt + 12);
  const directoryAt = u32(zip, eocdAt + 16);
  if (directoryAt + directorySize > zip.length) {
    throw refuse('this ZIP archive is truncated (its central directory runs past the file)');
  }
  const decoder = new TextDecoder('utf-8');
  const entries: ZipEntry[] = [];
  let at = directoryAt;
  for (let index = 0; index < count; index++) {
    if (u32(zip, at) !== CENTRAL_SIGNATURE) {
      throw refuse(`this ZIP archive is damaged (entry ${String(index)} has no central header)`);
    }
    const method = u16(zip, at + 10);
    const crc = u32(zip, at + 16);
    const size = u32(zip, at + 24);
    const nameLen = u16(zip, at + 28);
    const extraLen = u16(zip, at + 30);
    const commentLen = u16(zip, at + 32);
    const localAt = u32(zip, at + 42);
    const name = decoder.decode(
      zip.subarray(at + CENTRAL_HEADER_SIZE, at + CENTRAL_HEADER_SIZE + nameLen),
    );
    if (method !== METHOD_STORE) {
      throw refuse(
        `${name} is compressed (method ${String(method)}); only a ZIP this toolkit wrote (stored, not ` +
          'compressed) is read here',
      );
    }
    if (u32(zip, localAt) !== LOCAL_SIGNATURE) {
      throw refuse(`${name} has no local header: the archive is damaged`);
    }
    const dataAt = localAt + LOCAL_HEADER_SIZE + u16(zip, localAt + 26) + u16(zip, localAt + 28);
    const data = zip.slice(dataAt, dataAt + size);
    if (data.length !== size) {
      throw refuse(`${name} is truncated (${String(data.length)}/${String(size)} B)`);
    }
    if (crc32(data) !== crc) throw refuse(`${name} failed its CRC-32: the archive is damaged`);
    entries.push({ name, data });
    at += CENTRAL_HEADER_SIZE + nameLen + extraLen + commentLen;
  }
  return entries;
}
