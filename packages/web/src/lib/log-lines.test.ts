import { describe, expect, it } from 'vitest';
import type { LogLevel } from '@seek-fw/core';
import type { LogLine } from '@/hooks/useReporter';
import { visibleLogLines } from './log-lines';

function lines(...entries: readonly (readonly [string, LogLevel])[]): LogLine[] {
  return entries.map(([text, level], index) => ({ seq: index + 1, level, text }));
}

/* A Compact on 1.3.0.0, read on the Info tab: core puts a blank line before each section, and the
 * sections between the first line and the banks hold only detail lines. */
const COMPACT_READ = lines(
  ['firmware 1.3.0.0  Oct 21 2014', 'ok'],
  ['probe: compact-2014 (score 9)', 'detail'],
  ['firmware info selectors ...', 'detail'],
  ['  running firmware 1.3.0.0  Oct 21 2014', 'ok'],
  ['  serial 0000', 'detail'],
  ['', 'info'],
  ['boot config at 0x14000000 ...', 'detail'],
  ['  cfg[0] = 0x00000000 — boots A', 'detail'],
  ['', 'info'],
  ['bootloader block at 0x14000000 (key material) ...', 'detail'],
  ['  1 key-table candidate(s)', 'detail'],
  ['', 'info'],
  ['reading bank A at 0x14050000 ...', 'detail'],
  ['', 'info'],
  ['the banks', 'info'],
);

describe('visibleLogLines', () => {
  it('hides the detail lines without piling up the blank lines between their sections', () => {
    const shown = visibleLogLines(COMPACT_READ, false).map((line) => line.text);
    expect(shown).toEqual([
      'firmware 1.3.0.0  Oct 21 2014',
      '  running firmware 1.3.0.0  Oct 21 2014',
      '',
      'the banks',
    ]);
  });

  it('keeps every line, blank ones too, when the details are shown', () => {
    expect(visibleLogLines(COMPACT_READ, true)).toEqual(COMPACT_READ);
  });

  it('shows no blank line first or last', () => {
    const shown = visibleLogLines(
      lines(['', 'info'], ['x', 'detail'], ['one', 'ok'], ['', 'info'], ['y', 'detail']),
      false,
    );
    expect(shown.map((line) => line.text)).toEqual(['one']);
  });
});
