/**
 * The corpus files the non-slots pages are fed and checked against.
 *
 * The FW-V1 emulator's corpus (`data/corpus/MANIFEST.json`, under `SEEK_EMU_DIR`)
 * holds a vendored copy of every dump and every decrypted image. Each file is
 * read here and checked against the sha256 its manifest entry records, so a test
 * that says "this is the corpus plaintext" is comparing against the file the
 * manifest names, not against the page's own output.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { EMU_DIR } from '../../packages/core/test/emulator/suite.js';
import { sha256 } from './checks.js';

interface ManifestRow {
  readonly id: string;
  readonly kind: 'full-dump' | 'image-only';
  readonly size: number;
  readonly sha256: string;
  readonly vendored_path: string;
}

function manifest(): readonly ManifestRow[] {
  if (EMU_DIR === null) throw new Error('no FW-V1 emulator found (set SEEK_EMU_DIR)');
  const doc = JSON.parse(
    readFileSync(path.join(EMU_DIR, 'data', 'corpus', 'MANIFEST.json'), 'utf8'),
  ) as { entries: ManifestRow[] };
  return doc.entries;
}

/** A corpus file's bytes, checked against its manifest sha256 and size. */
export interface CorpusBytes {
  readonly id: string;
  readonly bytes: Uint8Array;
  readonly sha256: string;
}

/** The manifest entry whose id starts with `prefix` and is of `kind`; throws when none. */
function entryOf(prefix: string, kind: 'full-dump' | 'image-only'): ManifestRow {
  const found = manifest().find(
    (row) => row.kind === kind && row.id.startsWith(prefix) && !row.id.endsWith('_trimmed'),
  );
  if (found === undefined) throw new Error(`the corpus has no ${kind} ${prefix}`);
  return found;
}

function read(row: ManifestRow): CorpusBytes {
  if (EMU_DIR === null) throw new Error('no FW-V1 emulator found (set SEEK_EMU_DIR)');
  const bytes = new Uint8Array(readFileSync(path.join(EMU_DIR, row.vendored_path)));
  const digest = sha256(bytes);
  if (bytes.length !== row.size || digest !== row.sha256) {
    throw new Error(`${row.id}: the corpus file does not match its manifest entry`);
  }
  return { id: row.id, bytes, sha256: digest };
}

/** A whole-flash dump from the corpus (4 MiB), by its id prefix. */
export function corpusDump(prefix: string): CorpusBytes {
  return read(entryOf(prefix, 'full-dump'));
}

/** A decrypted image the corpus holds, by its id prefix. */
export function corpusImage(prefix: string): CorpusBytes {
  return read(entryOf(prefix, 'image-only'));
}

/**
 * One bank of a whole dump, as the corpus knows its plaintext. `dump` and
 * `plain` are id prefixes; `bank` is the bank's flash address.
 */
export interface KnownBank {
  readonly label: string;
  readonly dump: string;
  readonly bank: number;
  readonly plain: string;
  /** The bank's slot length on the flash, from the manifest's boot-config words. */
  readonly bankBytes: number;
}

export const FLASH_BASE = 0x14000000;
export const BANK_BYTES = 0x10000;

/**
 * The banks whose decrypted image the corpus holds, each found in a whole dump
 * at the address named. The plaintext is the image-only entry.
 */
export const KNOWN_BANKS: readonly KnownBank[] = [
  {
    label: 'Nano 300 44.27.3.10, bank A, Key B (4.x, Key B)',
    dump: 'nano_300/2024.11.21-11.55.00-44.27.3.10/1713A171RJB9/dump',
    bank: 0x14030000,
    plain: 'nano_300/2024.11.21-11.55.00-44.27.3.10/1713A171RJB9/decrypted_14030000_keyb',
    bankBytes: BANK_BYTES,
  },
  {
    label: 'Compact PRO 1.0.3.0 (2016 chain), bank B',
    dump: 'compact_pro/2016.07.06-17.04.49-1.0.3.0/0C21A1M5KP15/dump',
    bank: 0x14050000,
    plain: 'compact_pro/2016.07.06-17.04.49-1.0.3.0/no-serial/80k_4330_1.0.3.0-9hz',
    bankBytes: BANK_BYTES,
  },
  {
    label: 'Compact PRO 1.0.3.0 FF (2016 FF), recovery bank',
    dump: 'compact_pro/2016.07.06-17.05.32-1.0.3.0-FF/0B14A1JULD54/dump',
    bank: 0x14070000,
    plain: 'compact_pro/2016.07.06-17.05.32-1.0.3.0-FF/0B14A1JULD54/compact_pro_ff_jul_6_2016',
    bankBytes: BANK_BYTES,
  },
  {
    label: 'Compact PRO 4.18.2.0 FF, bank A (4.x FF)',
    dump: 'compact_pro/2020.02.13-15.26.28-4.18.2.0-FF/090BB12PR939/dump',
    bank: 0x14030000,
    plain: 'compact_pro/2020.02.13-15.26.28-4.18.2.0-FF/090BB12PR939/compact_pro_ff_090bb12pr939',
    bankBytes: BANK_BYTES,
  },
  {
    label: 'Compact 4.8.2.1, bank A (4.x)',
    dump: 'compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/dump',
    bank: 0x14030000,
    plain:
      'compact_xr/2020.02.26-11.23.26-4.8.2.1/1F1660P7U967/compact_xr_feb_26_2020_11-23-26_4.8.2.1',
    bankBytes: BANK_BYTES,
  },
  {
    label: 'Compact 1.3.0.0 (2014 plain chain), bank A',
    dump: 'compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump',
    bank: 0x14050000,
    plain: 'compact/2014.10.21-14.58.29-1.3.0.0/no-serial/subi_lpc43xx_lpcopen_1.3.0.0',
    bankBytes: BANK_BYTES,
  },
];

/** The 64 KiB bank at `address` in a whole dump's bytes. */
export function bankOf(dump: Uint8Array, address: number): Uint8Array {
  const offset = address - FLASH_BASE;
  return dump.slice(offset, offset + BANK_BYTES);
}
