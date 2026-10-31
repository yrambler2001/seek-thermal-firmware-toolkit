/**
 * The 0.x/1.x tab's "What you get" table names what the run file really holds: every entry of a run
 * file that has been through every step matches one of its rows, and every row matches an entry.
 */

import { describe, expect, it } from 'vitest';
import {
  PRESERVE_DUMP_MANIFEST_FILE,
  PRESERVE_DUMP_README_FILE,
  readZipEntries,
  utf8,
} from '@seek-fw/core';
import { buildRunFile } from '@/lib/preserve/run-file';
import { CHECKPOINT_FILES, PAGE_BUILD_FILE, PHASE_FOLDER } from '@/lib/preserve/types';
import { preserveRunStateOf } from '@/test-fixtures';
import { runFileRows } from './PreserveView';

/** A row's name as a pattern: `*` is one bank's letter, a trailing `/` a folder and what is in it. */
function matcher(row: string): RegExp {
  const escaped = row.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[abr]');
  return new RegExp(`^${escaped}${row.endsWith('/') ? '.+' : ''}$`);
}

describe('the run file table', () => {
  it('has a row for every file a finished run saves, and no row for a file it never saves', () => {
    const read = PHASE_FOLDER['read-build'];
    const checkpoints = new Map(CHECKPOINT_FILES.map((name) => [name, utf8(name)]));
    const extra = new Map([
      [`${read}/${PAGE_BUILD_FILE}`, utf8('build')],
      [`${read}/decrypted/slot_14050000.bin`, utf8('plain')],
      [`${read}/decrypted/decryption_report.txt`, utf8('report')],
      [`${read}/${PRESERVE_DUMP_MANIFEST_FILE}`, utf8('{}')],
      [`${read}/${PRESERVE_DUMP_README_FILE}`, utf8('readme')],
    ]);
    const names = readZipEntries(buildRunFile(preserveRunStateOf(), checkpoints, extra)).map(
      (entry) => entry.name,
    );
    const patterns = runFileRows().map(([file]) => matcher(file));

    for (const name of names) {
      expect(
        patterns.some((pattern) => pattern.test(name)),
        `${name} has a row`,
      ).toBe(true);
    }
    for (const [file] of runFileRows()) {
      expect(
        names.some((name) => matcher(file).test(name)),
        `${file} is in the run file`,
      ).toBe(true);
    }
  });
});
