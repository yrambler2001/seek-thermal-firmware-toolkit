/**
 * The log lines a run panel shows when its detail lines are hidden (the CLI without --verbose).
 *
 * Core puts a blank line before each section of a report. When a section holds only detail lines,
 * hiding them leaves its blank line behind, and on the Info tab four of them came in a row between
 * the first lines and the banks. The CLI prints one blank line for each run of them
 * (packages/cli/src/reporter.ts); the page does the same, and shows none first or last.
 */

import type { LogLine } from '@/hooks/useReporter';

export function visibleLogLines(lines: readonly LogLine[], showDetails: boolean): readonly LogLine[] {
  if (showDetails) return lines;
  const shown: LogLine[] = [];
  for (const line of lines) {
    if (line.level === 'detail') continue;
    const blank = line.text === '';
    if (blank && (shown.length === 0 || shown[shown.length - 1]?.text === '')) continue;
    shown.push(line);
  }
  if (shown[shown.length - 1]?.text === '') shown.pop();
  return shown;
}
