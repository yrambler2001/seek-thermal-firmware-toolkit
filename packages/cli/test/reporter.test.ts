import { describe, expect, it } from 'vitest';
import { shouldColor, stripAnsi } from '../src/ansi.js';
import { TerminalReporter, formatBytes } from '../src/reporter.js';
import { MemorySink } from '../src/sink.js';

function reporterOn(
  options: {
    quiet?: boolean;
    verbose?: boolean;
    color?: boolean;
    tty?: boolean;
    now?: () => number;
  } = {},
) {
  const log = new MemorySink();
  const progress = new MemorySink({ isTty: options.tty ?? false, columns: 80 });
  const reporter = new TerminalReporter({
    log,
    progress,
    color: options.color ?? false,
    quiet: options.quiet ?? false,
    verbose: options.verbose ?? false,
    ...(options.now === undefined ? {} : { now: options.now }),
  });
  return { reporter, log, progress };
}

describe('TerminalReporter', () => {
  it('writes each level to the log sink', () => {
    const { reporter, log } = reporterOn();
    reporter.log('plain');
    reporter.log('good', 'ok');
    reporter.log('careful', 'warn');
    reporter.log('broken', 'error');
    expect(log.text).toBe('plain\ngood\ncareful\nbroken\n');
  });

  it('keeps core messages verbatim, with no prefix of its own', () => {
    const { reporter, log } = reporterOn();
    reporter.log('NOW UNPLUG AND REPLUG THE CAMERA.', 'warn');
    expect(log.text).toBe('NOW UNPLUG AND REPLUG THE CAMERA.\n');
  });

  it('hides detail lines unless --verbose', () => {
    const quiet = reporterOn();
    quiet.reporter.log('inner workings', 'detail');
    expect(quiet.log.text).toBe('');

    const loud = reporterOn({ verbose: true });
    loud.reporter.log('inner workings', 'detail');
    expect(loud.log.text).toBe('inner workings\n');
  });

  it('prints one blank line where the detail lines between two sections are hidden', () => {
    /* `info` without --verbose printed four blank lines in a row after its first line (TESTING.md 42.84). */
    const quiet = reporterOn();
    quiet.reporter.log('  running firmware 1.0.3.0', 'ok');
    quiet.reporter.log('');
    quiet.reporter.log('boot config at 0x14010000 ...', 'detail');
    quiet.reporter.log('');
    quiet.reporter.log('');
    quiet.reporter.log('check key: key block 1', 'ok');
    expect(quiet.log.text).toBe('  running firmware 1.0.3.0\n\ncheck key: key block 1\n');

    const loud = reporterOn({ verbose: true });
    loud.reporter.log('a');
    loud.reporter.log('');
    loud.reporter.log('b', 'detail');
    loud.reporter.log('');
    expect(loud.log.text).toBe('a\n\nb\n\n');

    /* A plain write between two blank log lines ends the run of blanks. */
    const mixed = reporterOn();
    mixed.reporter.log('');
    mixed.reporter.write('table');
    mixed.reporter.log('');
    expect(mixed.log.text).toBe('\ntable\n\n');

    /* A blank written line right after a blank log line is the same run: `info`'s report opens with one
     * after the read's log ended on one, and printed two (TESTING.md 42.87). */
    const report = reporterOn();
    report.reporter.log('bank line', 'ok');
    report.reporter.log('');
    report.reporter.write('');
    report.reporter.write('Camera');
    report.reporter.write('');
    report.reporter.write('');
    report.reporter.write('Tabs');
    expect(report.log.text).toBe('bank line\n\nCamera\n\nTabs\n');

    /* A block that opens with a blank line (the slots list, a plan: lines joined from ['', heading, …])
     * after a blank log line: one blank line. */
    const block = reporterOn();
    block.reporter.log('bank line', 'ok');
    block.reporter.log('');
    block.reporter.write(['', 'Frame-rate patch plan', '  bank  B', ''].join('\n'));
    block.reporter.log('dry run');
    expect(block.log.text).toBe('bank line\n\nFrame-rate patch plan\n  bank  B\ndry run\n');

    /* Not after a line that is not blank: the block keeps its opening blank line. */
    const after = reporterOn();
    after.reporter.log('--yes given');
    after.reporter.write(['', 'Slot flash plan'].join('\n'));
    expect(after.log.text).toBe('--yes given\n\nSlot flash plan\n');
  });

  it('--quiet suppresses logs and the progress bar', () => {
    const { reporter, log, progress } = reporterOn({ quiet: true, tty: true });
    reporter.log('hello');
    reporter.log('bad', 'error');
    reporter.progress(1, 2, 'half way');
    expect(log.text).toBe('');
    expect(progress.text).toBe('');
  });

  it('emits no escape sequences when colour is off', () => {
    const { reporter, log, progress } = reporterOn({ color: false, tty: true });
    reporter.log('warned', 'warn');
    reporter.progress(1, 2, 'half');
    /* eslint-disable-next-line no-control-regex -- the point is that there are none */
    expect(/\u001B\[[0-9;]*m/.test(log.text)).toBe(false);
    expect(progress.text).toContain('\u001B[2K'); /* the erase is not colour */
    /* eslint-disable-next-line no-control-regex -- asserting on control codes */
    expect(stripAnsi(progress.text)).not.toMatch(/\u001B\[3[0-9]m/);
  });

  it('colours by level when colour is on', () => {
    const { reporter, log } = reporterOn({ color: true });
    reporter.log('warned', 'warn');
    expect(log.text).toContain('\u001B[33m');
    expect(stripAnsi(log.text)).toBe('warned\n');
  });

  it('redraws one line on a tty instead of one line per chunk', () => {
    let now = 0;
    const { reporter, progress } = reporterOn({ tty: true, now: () => (now += 1000) });
    for (let done = 0; done <= 1000; done += 1) reporter.progress(done, 1000, 'reading');
    expect(progress.text.split('\n')).toHaveLength(1);
    expect(progress.text.startsWith('\r\u001B[2K')).toBe(true);
    expect(progress.text).toContain('100%');
  });

  it('throttles hard when the destination is a pipe', () => {
    let now = 0;
    /* A clock that never advances: only the percentage steps may emit. */
    const { reporter, progress } = reporterOn({ tty: false, now: () => now });
    for (let done = 0; done <= 1000; done += 1) reporter.progress(done, 1000, 'reading');
    const lines = progress.text.trimEnd().split('\n');
    expect(lines.length).toBeLessThanOrEqual(12);
    expect(lines[0]).toMatch(/^progress: 0% \(0 \/ 1000\) reading$/);
    expect(lines.at(-1)).toContain('100%');
    now = 10_000;
    reporter.progress(1000, 1000);
    expect(progress.text.trimEnd().split('\n').length).toBe(lines.length + 1);
  });

  it('erases the bar before a log line so the two never interleave', () => {
    const { reporter, log, progress } = reporterOn({ tty: true, now: () => Date.now() + 1e6 });
    reporter.progress(1, 10, 'reading');
    reporter.log('something happened');
    expect(log.text).toBe('something happened\n');
    expect(progress.text.endsWith('\r\u001B[2K')).toBe(true);
  });

  it('collects the artifacts a workflow reports', () => {
    const { reporter } = reporterOn();
    reporter.artifact({ name: 'windows/a.bin', data: new Uint8Array(4) });
    reporter.artifact({ name: 'manifest.json', data: new Uint8Array(8) });
    expect(reporter.artifacts.map((artifact) => artifact.name)).toEqual([
      'windows/a.bin',
      'manifest.json',
    ]);
  });
});

describe('shouldColor', () => {
  it('is off for a pipe and on for a tty', () => {
    expect(shouldColor({ isTty: false, env: {} })).toBe(false);
    expect(shouldColor({ isTty: true, env: {} })).toBe(true);
  });

  it('honours --no-color, NO_COLOR, TERM=dumb and FORCE_COLOR', () => {
    expect(shouldColor({ isTty: true, noColorFlag: true, env: {} })).toBe(false);
    expect(shouldColor({ isTty: true, env: { NO_COLOR: '1' } })).toBe(false);
    expect(shouldColor({ isTty: true, env: { TERM: 'dumb' } })).toBe(false);
    expect(shouldColor({ isTty: false, env: { FORCE_COLOR: '1' } })).toBe(true);
    expect(shouldColor({ isTty: false, env: { FORCE_COLOR: '0' } })).toBe(false);
  });
});

describe('formatBytes', () => {
  it('reads like a human wrote it', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KiB');
    expect(formatBytes(4 * 1024 * 1024)).toBe('4.0 MiB');
  });
});
