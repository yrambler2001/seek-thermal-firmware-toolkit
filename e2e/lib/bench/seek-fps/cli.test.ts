/* The command line: its parsing (main.swift's flags) and the info and stream commands over a fake camera. */
import { describe, expect, it } from 'vitest';

import { SEEK_MODE } from './camera.js';
import { parseArgs, runSeekFps, type CameraSession } from './cli.js';
import { FakeCamera, compactFrame } from './fake-camera.js';
import { seekLink } from './link.js';

type Parsed = Extract<ReturnType<typeof parseArgs>, { ok: true }>['args'];

function parsed(argv: string[]): Parsed {
  const result = parseArgs(argv);
  if (!result.ok) throw new Error(`expected a parse, got: ${result.message}`);
  return result.args;
}

function failure(argv: string[]): string {
  const result = parseArgs(argv);
  if (result.ok) throw new Error(`expected a refusal for ${argv.join(' ')}`);
  return result.message;
}

describe('parseArgs (the Swift main.swift flags)', () => {
  it('--fps with --camera is the fps command, five seconds, in Normal mode', () => {
    const a = parsed(['--fps', '--camera']);
    expect(a.command).toBe('fps');
    expect(a.seconds).toBe(5);
    expect(a.mode).toBe(SEEK_MODE.normal);
    expect(a.camera).toBe(true);
  });

  it('stream takes -n seconds; --fps overrides it to five', () => {
    expect(parsed(['stream', '-n', '2', '--camera']).seconds).toBe(2);
    expect(parsed(['stream', '--camera']).seconds).toBe(5);
    expect(parsed(['-n', '9', '--fps', '--camera']).seconds).toBe(5);
  });

  it('maps --mode normal|fast|raw|4 to IP modes 8, 3, 0, 4', () => {
    expect(parsed(['info', '--camera', '--mode', 'normal']).mode).toBe(8);
    expect(parsed(['info', '--camera', '--mode', 'fast']).mode).toBe(3);
    expect(parsed(['info', '--camera', '--mode', 'raw']).mode).toBe(0);
    expect(parsed(['info', '--camera', '--mode', '4']).mode).toBe(4);
    expect(failure(['info', '--camera', '--mode', 'other'])).toMatch(/normal\|fast\|raw\|4/);
  });

  it('--no-hifps, --no-opzero and --no-pro-init turn their option off', () => {
    const a = parsed(['info', '--camera', '--no-hifps', '--no-opzero', '--no-pro-init']);
    expect(a.options.hiFPS).toBe(false);
    expect(a.options.startupOpZero).toBe(false);
    expect(a.options.compactProInit).toBe(false);
    const d = parsed(['info', '--camera']);
    expect(d.options.hiFPS && d.options.startupOpZero && d.options.compactProInit).toBe(true);
  });

  it('--raw-min and --raw-max set the raw range, clamped to 16 bits', () => {
    const a = parsed(['info', '--camera', '--raw-min', '1200', '--raw-max', '70000']);
    expect(a.options.rawMin).toBe(1200);
    expect(a.options.rawMax).toBe(0xffff);
  });

  it('records the press actions in order', () => {
    const a = parsed(['info', '--camera', '--nuc', '--shutter-open']);
    expect(a.actions).toEqual(['nuc', 'shutter-open']);
  });

  it('refuses a command with no source: the bus is opened only with --camera or --emulator', () => {
    expect(failure(['info'])).toMatch(/no camera source/);
    expect(failure(['--fps'])).toMatch(/no camera source/);
    expect(parsed(['info', '--emulator', 'corpus-entry']).emulatorEntry).toBe('corpus-entry');
  });

  it('refuses snapshot and deadpixels (the image renderer is not ported) and unknown words', () => {
    expect(failure(['snapshot', 'a.png', '--camera'])).toMatch(/not part of this port/);
    expect(failure(['deadpixels', 'a.png', '--camera'])).toMatch(/not part of this port/);
    expect(failure(['frobnicate', '--camera'])).toMatch(/unknown command/);
    expect(failure(['info', '--camera', '--bogus'])).toMatch(/unknown option/);
  });

  it('-h asks for the usage', () => {
    expect(parsed(['-h']).help).toBe(true);
  });
});

/** A session over a fake camera, which the command closes. */
function sessionOver(fake: FakeCamera): CameraSession {
  const link = seekLink({ control: fake, bulk: fake, api: 'fake camera' });
  return { link, clock: () => performance.now() / 1000, release: () => link.close() };
}

function capture(): {
  out: string[];
  err: string[];
  io: { out(l: string): void; err(l: string): void };
} {
  const out: string[] = [];
  const err: string[] = [];
  return { out, err, io: { out: (l) => out.push(l), err: (l) => err.push(l) } };
}

describe('runSeekFps over a fake camera', () => {
  it('info prints the model, firmware, serial, chip id and geometry, and exits 0', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      serialNumber: '1013CE098ACA',
      deviceSerial: '101310HSNEA2',
      firmwareHeads: [[1, 3, 0, 0, 0, 0, 0, 0]],
    });
    const io = capture();
    const code = await runSeekFps(
      ['info', '--camera'],
      () => Promise.resolve(sessionOver(fake)),
      io.io,
    );
    expect(code).toBe(0);
    expect(io.err).toEqual([]);
    expect(io.out[0]).toBe(
      'Seek Compact, firmware 1.3.0.0, serial 101310HSNEA2, chip id 1013CE098ACA, 206x156',
    );
  });

  it('info with the serial unreadable says "serial -" and shows the chip id under its own label', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      refuseOut: [0x5a],
      firmwareHeads: [[1, 3, 0, 0, 0, 0, 0, 0]],
    });
    const io = capture();
    const code = await runSeekFps(
      ['info', '--camera'],
      () => Promise.resolve(sessionOver(fake)),
      io.io,
    );
    expect(code).toBe(0);
    expect(io.out[0]).toBe(
      'Seek Compact, firmware 1.3.0.0, serial -, chip id 1013CE098ACA, 206x156',
    );
  });

  it('stream -n 1 prints one status line for the second, with frames and frozen pairs', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      serialNumber: 'SN',
      firmwareHeads: [[1, 3, 0, 0, 0, 0, 0, 0]],
      frames: Array.from({ length: 4 }, () => compactFrame(3, 5000)),
      endless: true,
    });
    const io = capture();
    const code = await runSeekFps(
      ['stream', '-n', '1', '--camera'],
      () => Promise.resolve(sessionOver(fake)),
      io.io,
    );
    expect(code).toBe(0);
    expect(io.out[0]).toMatch(
      /^Seek Compact, firmware 1\.3\.0\.0, serial 101310HSNEA2, chip id 1013CE098ACA, 206x156$/,
    );
    expect(io.out[1]).toMatch(
      /^t=1s frames=\d+ status=3 min=5000 max=5000 avg=\d+ devTemp=4660 frameCnt=7 frozenPairs=\d+ changed=\d+%$/,
    );
  });

  it('info says when the camera refused Startup with Operation=0 and connected without it', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      serialNumber: 'SN',
      firmwareHeads: [[1, 3, 0, 8, 0, 0, 0, 0]],
      refuseOut: [0x37],
    });
    const io = capture();
    const code = await runSeekFps(
      ['info', '--camera'],
      () => Promise.resolve(sessionOver(fake)),
      io.io,
    );
    expect(code).toBe(0);
    expect(io.out[0]).toBe(
      'Seek Compact, firmware 1.3.0.8, serial 101310HSNEA2, chip id 1013CE098ACA, 206x156, Startup with Operation=0 refused (connected without it)',
    );
  });

  it('a Compact whose firmware reply cannot be trusted is refused on stderr with exit 1, and no init is sent', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      firmwareHeads: [[0xb8, 0x2a, 0x00, 0x14, 0x00, 0x00, 0x01, 0x14]],
    });
    const io = capture();
    const code = await runSeekFps(
      ['info', '--camera'],
      () => Promise.resolve(sessionOver(fake)),
      io.io,
    );
    expect(code).toBe(1);
    expect(io.err[0]).toMatch(/^seek: the camera's firmware reply cannot be trusted/);
    expect(io.err[0]).toMatch(/unlocked by a slots command/);
    expect(io.err[0]).toMatch(/power cycle/);
    expect(fake.sent('out')).toEqual([]);
  });

  it('stream --mode 4 counts the status-0 frames of mode 4 as pictures and prints them', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      serialNumber: 'SN',
      firmwareHeads: [[1, 3, 0, 0, 0, 0, 0, 0]],
      frames: [compactFrame(0, 5000)],
      endless: true,
    });
    const io = capture();
    const code = await runSeekFps(
      ['stream', '-n', '1', '--camera', '--mode', '4', '--no-hifps'],
      () => Promise.resolve(sessionOver(fake)),
      io.io,
    );
    expect(code).toBe(0);
    expect(io.out[1]).toMatch(/^t=1s frames=\d+ status=0 /);
    expect(io.out[1]).not.toMatch(/frames=0 /);
    expect(fake.sent('out').some((e) => e.request === 0x3e && e.data[0] === 4)).toBe(true);
  });

  it('a refusal to connect is reported on stderr with exit 1', async () => {
    const fake = new FakeCamera({ productId: 0x0010, firmwareHeads: [[1, 3, 0, 0, 0, 0, 0, 0]] });
    const io = capture();
    const code = await runSeekFps(
      ['info', '--camera'],
      () => Promise.reject(new Error('no Seek Thermal camera found')),
      io.io,
    );
    expect(code).toBe(1);
    expect(io.err[0]).toBe('seek: no Seek Thermal camera found');
    expect(fake.opened).toBe(false);
  });

  it('a parse error is reported and nothing is opened', async () => {
    const io = capture();
    let opened = false;
    const code = await runSeekFps(
      ['info'],
      () => {
        opened = true;
        return Promise.reject(new Error('should not open'));
      },
      io.io,
    );
    expect(code).toBe(1);
    expect(opened).toBe(false);
    expect(io.err[0]).toMatch(/no camera source/);
  });

  it('with no arguments it prints the usage and exits 1', async () => {
    const io = capture();
    const code = await runSeekFps([], () => Promise.reject(new Error('should not open')), io.io);
    expect(code).toBe(1);
    expect(io.out[0]).toMatch(/^seek-fps - /);
  });
});

/** A 1.3.0.8 build: it refuses Startup with Operation=0 (0x37) and FastRaw (mode 3, 0x3e), and takes Normal. */
function stock1308(frames: Uint8Array[], endless = false): FakeCamera {
  return new FakeCamera({
    productId: 0x0010,
    serialNumber: 'SN',
    firmwareHeads: [[1, 3, 0, 8, 0, 0, 0, 0]],
    refuseOut: [0x37],
    refuseModes: [SEEK_MODE.fastRaw],
    frames,
    endless,
  });
}

describe('a stream that publishes no frame in its window exits 1 (TESTING.md 42.58)', () => {
  it('the default stream (Init Hi FPS on) on 1.3.0.8: the refused FastRaw init is named, and the run exits 1, not 0', async () => {
    const fake = stock1308([compactFrame(1, 5000)]); // a shutter frame: Init Hi FPS asks for FastRaw on it
    const io = capture();
    const code = await runSeekFps(
      ['stream', '-n', '1', '--camera'],
      () => Promise.resolve(sessionOver(fake)),
      io.io,
    );
    expect(code).toBe(1);
    expect(io.out.some((line) => line.startsWith('t=1s no frame yet'))).toBe(true);
    expect(io.err[0]).toMatch(
      /^seek: no frame was published in the 1 s stream: the camera refused the FastRaw init that Init Hi FPS sends \(control OUT 0x3e -> stall\)/,
    );
    expect(io.err[0]).toMatch(/run again with --no-hifps to stream Normal/);
    expect(fake.sent('out').some((e) => e.request === 0x3e && e.data[0] === 3)).toBe(true);
  });

  it('the default --fps on 1.3.0.8 fails the same way: no frame, the refusal named, exit 1', async () => {
    const fake = stock1308([compactFrame(1, 5000)]);
    const io = capture();
    const code = await runSeekFps(
      ['--fps', '--camera'],
      () => Promise.resolve(sessionOver(fake)),
      io.io,
    );
    expect(code).toBe(1);
    expect(io.out.some((line) => line.startsWith('second '))).toBe(false);
    expect(io.err[0]).toMatch(
      /^seek: no frame was published in the wait for a first frame \(up to 10 s\): the camera refused the FastRaw init/,
    );
    expect(io.err[0]).toMatch(/--no-hifps/);
  });

  it('with --no-hifps the same 1.3.0.8 streams Normal, publishes frames and exits 0', async () => {
    const fake = stock1308([compactFrame(3, 5000)], true);
    const io = capture();
    const code = await runSeekFps(
      ['stream', '-n', '1', '--camera', '--no-hifps'],
      () => Promise.resolve(sessionOver(fake)),
      io.io,
    );
    expect(code).toBe(0);
    expect(io.err).toEqual([]);
    expect(io.out[1]).toMatch(/^t=1s frames=\d+ status=3 /);
    expect(fake.sent('out').some((e) => e.request === 0x3e && e.data[0] === 3)).toBe(false);
  });

  it.each([
    ['normal', ['--mode', 'normal']],
    ['fast', ['--mode', 'fast']],
    ['raw', ['--mode', 'raw']],
    ['mode 4', ['--mode', '4']],
  ])('a stream in %s with no frame at all exits 1', async (_name, modeArgs) => {
    const fake = new FakeCamera({ productId: 0x0010, firmwareHeads: [[1, 3, 0, 0, 0, 0, 0, 0]] });
    const io = capture();
    const code = await runSeekFps(
      ['stream', '-n', '1', '--camera', '--no-hifps', ...modeArgs],
      () => Promise.resolve(sessionOver(fake)),
      io.io,
    );
    expect(code).toBe(1);
    expect(io.err[0]).toMatch(/^seek: no frame was published in the 1 s stream/);
  });

  it('a stream that publishes one frame in its window and then goes quiet still exits 0', async () => {
    const fake = new FakeCamera({
      productId: 0x0010,
      firmwareHeads: [[1, 3, 0, 0, 0, 0, 0, 0]],
      frames: [compactFrame(3, 5000), compactFrame(3, 5000)], // the first is the calibration read
    });
    const io = capture();
    const code = await runSeekFps(
      ['stream', '-n', '1', '--camera', '--no-hifps'],
      () => Promise.resolve(sessionOver(fake)),
      io.io,
    );
    expect(code).toBe(0);
    expect(io.out[1]).toMatch(/^t=1s frames=1 /);
  });

  it('a camera that answers no GetFirmwareInfo read is "did not answer" on stderr, exit 1, and no init is sent', async () => {
    const fake = new FakeCamera({ productId: 0x0010, infoFault: 'transfer' });
    const io = capture();
    const code = await runSeekFps(
      ['info', '--camera'],
      () => Promise.resolve(sessionOver(fake)),
      io.io,
    );
    expect(code).toBe(1);
    expect(io.err[0]).toMatch(
      /^seek: the camera did not answer: GetFirmwareInfo gave no reply in 26 reads \(transfer failed x26\)/,
    );
    expect(io.err[0]).toMatch(/wait for it to come back after a power cycle/);
    expect(fake.sent('out')).toEqual([]);
  });
});
