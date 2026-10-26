/**
 * The frame-rate table's rows in words (TESTING.md 42.88). The generated table labels each row in the
 * reconstruction's record and link names; people read "the steady frame row (row N)" instead, the same way
 * on every entry, and the table's label stays on `row.detail`.
 */

import { describe, expect, it } from 'vitest';
import { FPS_PATCHES } from '../../src/preservation/fps-patch.js';
import { FPS_PATCH_TABLE } from '../../src/preservation/fps-patch-table.js';
import {
  FPS_ADD_NOSKIP_SUFFIX,
  FPS_USB_CHECK_NAME,
  fpsRowName,
  fpsSteadyRowIndex,
} from '../../src/preservation/fps-row-words.js';

/** The index the table's own label gives: "row 14", "record 20", "block 13", "page 13", or the self-link in a header. */
function indexInLabel(label: string): number | null {
  const named = /\b(?:row|record|block|page) (\d+)\b/.exec(label);
  if (named?.[1] !== undefined) return Number(named[1]);
  /* "header 04 0d 0d 00": steps, next, alt, flags; the self-loop's next and alt are its own index. */
  const header = /header [0-9a-f]{2} ([0-9a-f]{2}) \1 /.exec(label);
  return header?.[1] === undefined ? null : parseInt(header[1], 16);
}

describe('the frame-rate rows in words', () => {
  it('names every table entry’s row, with the index its own label gives', () => {
    expect(FPS_PATCH_TABLE.length).toBeGreaterThan(0);
    for (const source of FPS_PATCH_TABLE) {
      /* The add-noskip entries change code, not a row (TESTING.md 42.97): no index, and their label names none. */
      if (source.id.endsWith(FPS_ADD_NOSKIP_SUFFIX)) {
        expect(fpsSteadyRowIndex(source.id), source.id).toBeNull();
        expect(indexInLabel(source.row.label), source.id).toBeNull();
        continue;
      }
      const index = fpsSteadyRowIndex(source.id);
      expect(index, source.id).not.toBeNull();
      expect(indexInLabel(source.row.label), `${source.id}: ${source.row.label}`).toBe(index);
    }
  });

  it('gives every patch a plain name and keeps the table’s label as the detail', () => {
    for (const [i, patch] of FPS_PATCHES.entries()) {
      const source = FPS_PATCH_TABLE[i];
      expect(patch.id).toBe(source?.id);
      expect(patch.row.name).toBe(
        patch.id.endsWith(FPS_ADD_NOSKIP_SUFFIX)
          ? FPS_USB_CHECK_NAME
          : `the steady frame row (row ${String(fpsSteadyRowIndex(patch.id))})`,
      );
      expect(patch.row.detail).toBe(source?.row.label);
      expect(patch.row.offset).toBe(source?.row.offset);
      expect(patch.row.length).toBe(source?.row.length);
      /* No record or link code names in what a person reads. */
      expect(patch.row.name, patch.id).not.toMatch(
        /self-loop|link|r2016|record|header|next|alt|op \d|mode-8|block/,
      );
    }
  });

  it('the 1.0.3.0 row, as the bench camera’s plan shows it', () => {
    const patch = FPS_PATCHES.find((entry) => entry.id === 'compact_pro-1.0.3.0');
    expect(patch?.row.name).toBe('the steady frame row (row 14)');
    expect(patch?.row.detail).toBe(
      'row 14, the steady self-loop (row link ee: next = alt = 14), 68-byte r2016 record',
    );
  });

  it('names the add-noskip entries by the USB check they change (TESTING.md 42.97)', () => {
    const patch = FPS_PATCHES.find((entry) => entry.id === 'compact_32k-1.3.0.0-to32-add-noskip');
    expect(patch?.row.name).toBe('the USB check at the start of each field');
    expect(patch?.row.offset).toBe(0x6190);
    expect(fpsRowName('compact_32k-1.3.0.0-to32')).toBe('the steady frame row (row 8)');
  });

  it('an id the map does not hold still reads as words', () => {
    expect(fpsSteadyRowIndex('no-such-entry')).toBeNull();
    expect(fpsRowName('no-such-entry')).toBe('the steady frame row');
  });
});
