#!/usr/bin/env node
/* ==================================================================== *
 * Measures the frame rate of a Seek Compact (PID 0x0010, 32K sensor) from its USB
 * frame stream. The Compact-native counterpart of the PRO measurer
 * (seekthermal-pro-fps-unlock/measure_fps.py, 342 x 260, frame id at byte 4), which
 * was never run on this camera.
 *
 *   node e2e/lib/bench/compact-fps/compact-fps.mjs [--seconds S | --frames N]
 *        [--out DIR] [--store] [--label NAME] [--wait-enum MS]
 *   node e2e/lib/bench/compact-fps/compact-fps.mjs --analyze DIR [--label NAME]
 *
 * WHAT IT SENDS. Vendor requests on the interface, and nothing else: GetFirmwareInfo,
 * GetChipID, GetOperationMode, GetIPMode and GetErrorCode (IN, reads); SetOperationMode
 * 0 and 1 (the stream stop and start, runtime state only); ImageData(n) (one frame
 * credit each). compact-frames.mjs (ALLOWED_OUT) refuses any other OUT request in
 * this process. No flash is touched, no setting is written, the IP mode is left as
 * the camera has it, and nothing is reset.
 *
 * WHAT IT READS. Each credit asks for one raw frame (0x8200 halfwords: the 0x680-byte
 * frame header, then 156 body rows of 208 halfwords), so the header's marker and the
 * capture index are in the record. The frame size is derived from the marker spacing
 * in the stream, and the row width from the frame's whole-row structure
 * (compact-frames.mjs), not taken from the PRO's 342 x 260.
 *
 * --store keeps stream.bin and frames.json in DIR (one credit per frame, back to
 * back). --analyze re-reads such a folder without a camera.
 * ==================================================================== */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  openSync,
  writeSync,
  closeSync,
} from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  ALLOWED_OUT,
  CREDIT_RAW_HW,
  HEADER_BYTES,
  deriveRowWidth,
  formatSummary,
  frameBytesFromMarkers,
  markerPositions,
  parseFrame,
  summarize,
} from './compact-frames.mjs';

export const VID = 0x289d;
export const PID = 0x0010;
const BULK_IN_ENDPOINT = 1; // 0x81, the frame endpoint, as the usb package numbers it
const CTRL_TIMEOUT_MS = 5000;
const BULK_TIMEOUT_MS = 10000;
const ENUM_POLL_MS = 200;

const T0 = performance.now();
const now = () => performance.now() - T0;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const u16le = (v) => Buffer.from([v & 0xff, (v >> 8) & 0xff]);

function parseArgs(argv) {
  const a = {
    seconds: 20,
    frames: 0,
    out: null,
    store: false,
    label: 'run',
    waitEnum: 0,
    analyze: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--seconds') a.seconds = Number(argv[++i]);
    else if (k === '--frames') a.frames = Number.parseInt(argv[++i], 10);
    else if (k === '--out') a.out = argv[++i];
    else if (k === '--store') a.store = true;
    else if (k === '--label') a.label = argv[++i];
    else if (k === '--wait-enum') a.waitEnum = Number(argv[++i]);
    else if (k === '--analyze') a.analyze = argv[++i];
    else throw new Error(`unknown argument ${k}`);
  }
  if (a.store && !a.out) throw new Error('--store needs --out DIR');
  if (a.analyze && a.store) throw new Error('--analyze reads a folder; it does not store one');
  return a;
}

/** Splits a stored stream into the frames it was recorded as, using the recorded sizes. */
function splitStored(buffer, frameRecords) {
  return frameRecords.map((r) => ({
    n: r.n,
    bytes: r.bytes,
    tCredit: r.tCredit,
    tFirst: r.tFirst,
    tDone: r.tDone,
    buf: buffer.subarray(r.offset, r.offset + r.bytes),
    errors: r.errors ?? [],
  }));
}

/**
 * Analyses a list of frames (each with buf, times, n): derives the frame size and the
 * row width from the data, parses every frame, and summarises. Pure; no camera.
 */
export function analyzeFrames(frames, { raw, creditBytes, label = 'run' }) {
  const whole = frames.map((f) => f.buf).filter((b) => b.length === creditBytes);
  // The frame size from the data: the spacing of the header markers, checked against
  // the capture index, across the whole stream of back-to-back credits.
  const stream = whole.length ? Buffer.concat(whole) : Buffer.alloc(0);
  const frameBytesDerived =
    raw && whole.length ? frameBytesFromMarkers(stream, markerPositions(stream)) : null;
  // The row width from the frame size (compact-frames.mjs deriveRowWidth).
  const rowWidth = deriveRowWidth(creditBytes, { rawLayout: raw });
  if (rowWidth.width === null) {
    throw new Error(
      `the row width is not fixed by a ${creditBytes} B frame: candidates ${rowWidth.candidates.join(',')}`,
    );
  }
  const parsedFrames = frames.map((f) => ({
    ...f,
    bytes: f.buf.length,
    parsed:
      f.buf.length === creditBytes
        ? parseFrame(f.buf, { raw, rowHw: rowWidth.width })
        : { bytes: f.buf.length, marker: null, index: null, type: null, bodyRows: 0, mean: null },
  }));
  const summary = summarize(parsedFrames, { frameBytes: creditBytes, raw });
  const firstWhole = parsedFrames.find((f) => f.buf.length === creditBytes);
  return {
    frameBytesDerived,
    rowWidth,
    bodyRows: firstWhole ? firstWhole.parsed.bodyRows : null,
    headerBytes: raw ? HEADER_BYTES : 0,
    summary,
    text: formatSummary(summary, label),
  };
}

function analyzeStoredDir(dir, label) {
  const manifest = JSON.parse(readFileSync(join(dir, 'frames.json'), 'utf8'));
  const buffer = readFileSync(join(dir, 'stream.bin'));
  const frames = splitStored(buffer, manifest.frames);
  return analyzeFrames(frames, { raw: manifest.raw, creditBytes: manifest.creditBytes, label });
}

async function findCamera(waitMs, usb) {
  const deadline = now() + waitMs;
  for (;;) {
    const devices = await usb.getDevices();
    const dev = devices.find((d) => d.vendorId === VID && d.productId === PID);
    if (dev) return dev;
    if (now() > deadline) return null;
    await sleep(ENUM_POLL_MS);
  }
}

function vendorSetup(request) {
  return { requestType: 'vendor', recipient: 'interface', request, value: 0, index: 0 };
}

function toBuffer(data) {
  return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
}

async function ctrlIn(dev, request, length) {
  const r = await dev.controlTransferIn(vendorSetup(request), length, CTRL_TIMEOUT_MS);
  if (r.status !== 'ok' || !r.data) throw new Error(`IN 0x${request.toString(16)}: ${r.status}`);
  return toBuffer(r.data);
}

async function ctrlOut(dev, request, bytes) {
  if (!Object.values(ALLOWED_OUT).includes(request)) {
    throw new Error(`refused: OUT request 0x${request.toString(16)} is not in ALLOWED_OUT`);
  }
  const r = await dev.controlTransferOut(vendorSetup(request), bytes, CTRL_TIMEOUT_MS);
  if (r.status !== 'ok') throw new Error(`OUT 0x${request.toString(16)}: ${r.status}`);
}

async function readFrame(dev, bytes) {
  const parts = [];
  const errors = [];
  let got = 0;
  let tFirst = null;
  while (got < bytes) {
    let r;
    try {
      r = await dev.transferIn(BULK_IN_ENDPOINT, bytes - got, BULK_TIMEOUT_MS);
    } catch (e) {
      errors.push(`${got ? 'mid-frame' : 'wait'} error at ${got} B: ${e.message || e}`);
      break;
    }
    if (r.status !== 'ok' || !r.data) {
      errors.push(`bulk status ${r.status} at ${got} B`);
      break;
    }
    if (r.data.byteLength === 0) {
      errors.push(`zero-length packet at ${got} B`);
      break;
    }
    if (tFirst === null) tFirst = now();
    parts.push(toBuffer(r.data));
    got += r.data.byteLength;
  }
  return { buf: Buffer.concat(parts), tFirst, tDone: now(), errors };
}

async function openStream(dev) {
  await dev.open();
  // The wrapper reads an unconfigured device as an error (node-usb's "not configured"); select configuration 1 then.
  let configured;
  try {
    configured = dev.configuration !== null;
  } catch {
    configured = false;
  }
  if (!configured) await dev.selectConfiguration(1);
  await dev.claimInterface(0);
}

async function liveRun(a) {
  const { usb } = await import('usb');
  const enumeration = {};
  const dev = await findCamera(a.waitEnum, usb);
  if (!dev) throw new Error(`camera ${VID.toString(16)}:${PID.toString(16)} not found`);
  enumeration.foundMs = Number(now().toFixed(1));
  await openStream(dev);
  const credit = CREDIT_RAW_HW;
  const creditBytes = credit * 2;
  const init = [];
  const step = async (name, fn) => {
    const t = now();
    try {
      const value = await fn();
      init.push({ name, ms: Number(t.toFixed(1)), hex: value ? value.toString('hex') : null });
      return value;
    } catch (e) {
      init.push({ name, ms: Number(t.toFixed(1)), error: String(e.message || e) });
      return null;
    }
  };
  await step('GetFirmwareInfo', () => ctrlIn(dev, 0x4e, 36));
  await step('GetChipID', () => ctrlIn(dev, 0x36, 12));
  await step('GetOperationMode', () => ctrlIn(dev, 0x3d, 2));
  await step('GetIPMode', () => ctrlIn(dev, 0x3f, 2));
  await step('GetErrorCode', () => ctrlIn(dev, 0x35, 4));
  await step('SetOperationMode(0)', () => ctrlOut(dev, ALLOWED_OUT.SetOperationMode, u16le(0)));
  await step('SetOperationMode(1)', () => ctrlOut(dev, ALLOWED_OUT.SetOperationMode, u16le(1)));
  await step('GetOperationMode', () => ctrlIn(dev, 0x3d, 2));
  await step('GetErrorCode', () => ctrlIn(dev, 0x35, 4));
  const tStart = now();
  const frameRecords = [];
  const parts = [];
  const problems = [];
  let offset = 0;
  let stopping = false;
  const onSignal = () => {
    stopping = true;
  };
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);
  try {
    for (;;) {
      if (stopping) break;
      if (a.frames && frameRecords.length >= a.frames) break;
      if (!a.frames && now() - tStart >= a.seconds * 1000) break;
      const tCredit = now();
      try {
        await ctrlOut(dev, ALLOWED_OUT.ImageData, u16le(credit));
      } catch (e) {
        problems.push(`frame ${frameRecords.length + 1}: credit failed: ${e.message || e}`);
        break;
      }
      const f = await readFrame(dev, creditBytes);
      const n = frameRecords.length + 1;
      frameRecords.push({
        n,
        offset,
        bytes: f.buf.length,
        tCredit: Number(tCredit.toFixed(3)),
        tFirst: f.tFirst === null ? null : Number(f.tFirst.toFixed(3)),
        tDone: Number(f.tDone.toFixed(3)),
        errors: f.errors,
      });
      parts.push(f.buf);
      offset += f.buf.length;
      if (f.errors.length) {
        problems.push(`frame ${n}: ${f.errors.join('; ')}`);
        break;
      }
    }
  } finally {
    process.off('SIGINT', onSignal);
    process.off('SIGTERM', onSignal);
    try {
      await ctrlOut(dev, ALLOWED_OUT.SetOperationMode, u16le(0));
    } catch (e) {
      problems.push(`SetOperationMode(0) at the end failed: ${e.message || e}`);
    }
    try {
      await dev.releaseInterface(0);
    } catch {
      /* the device may already be gone */
    }
    try {
      await dev.close();
    } catch {
      /* as above */
    }
  }
  const stream = Buffer.concat(parts);
  return {
    stream,
    frameRecords,
    init,
    problems,
    enumeration,
    creditBytes,
    credit,
    tStart: Number(tStart.toFixed(1)),
  };
}

/**
 * The IP mode from the start-up GetIPMode reply (two bytes, little-endian; the mode is the
 * low byte). The camera boots in mode 6; the vendor SDK's open sets mode 8.
 */
export function ipModeOf(init) {
  const s = init.find((x) => x.name === 'GetIPMode');
  return s && s.hex ? Number.parseInt(s.hex.slice(0, 2), 16) : 'unread';
}

/** The derived-geometry line: what the frame size and the row width came from. */
export function derivedLine(result, creditBytes) {
  const d = result.frameBytesDerived;
  return (
    `  derived: frame ${creditBytes} B (header-marker spacing ${d ? d.bytes : 'n/a'} B; index-consistent marker pairs at that spacing ${d ? `${d.agree} of ${d.of}` : '-'}); ` +
    `row width ${result.rowWidth.width} halfwords (the only width in 128..320 that makes the header and the frame whole rows); ` +
    `body rows ${result.bodyRows ?? '-'}; header ${result.headerBytes} B`
  );
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  if (a.analyze) {
    const manifest = JSON.parse(readFileSync(join(a.analyze, 'frames.json'), 'utf8'));
    const stored = analyzeStoredDir(a.analyze, a.label);
    console.log(
      `  image-processing mode (GetIPMode, read, not set): ${ipModeOf(manifest.init ?? [])}`,
    );
    console.log(stored.text);
    console.log(derivedLine(stored, manifest.creditBytes));
    return;
  }
  const live = await liveRun(a);
  const raw = true;
  const frames = splitStored(live.stream, live.frameRecords);
  const result = analyzeFrames(frames, { raw, creditBytes: live.creditBytes, label: a.label });
  console.log(`  image-processing mode (GetIPMode, read, not set): ${ipModeOf(live.init)}`);
  console.log(result.text);
  console.log(derivedLine(result, live.creditBytes));
  if (live.problems.length) console.log(`  problems: ${live.problems.join(' | ')}`);
  const summary = {
    tool: 'e2e/lib/bench/compact-fps/compact-fps.mjs',
    label: a.label,
    vid: VID,
    pid: PID,
    raw,
    creditHalfwords: live.credit,
    creditBytes: live.creditBytes,
    startedAt: new Date(Date.now() - now()).toISOString(),
    stream_start_ms: live.tStart,
    init: live.init,
    problems: live.problems,
    derived: {
      frameBytesFromMarkers: result.frameBytesDerived,
      rowWidth: result.rowWidth,
      bodyRows: result.bodyRows,
      headerBytes: result.headerBytes,
    },
    summary: result.summary,
  };
  if (a.out) {
    if (!existsSync(a.out)) mkdirSync(a.out, { recursive: true });
    writeFileSync(join(a.out, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
    if (a.store) {
      const fd = openSync(join(a.out, 'stream.bin'), 'w');
      writeSync(fd, live.stream, 0, live.stream.length, 0);
      closeSync(fd);
      writeFileSync(
        join(a.out, 'frames.json'),
        `${JSON.stringify({ raw, creditBytes: live.creditBytes, init: live.init, frames: live.frameRecords })}\n`,
      );
    }
    console.log(`  wrote ${join(a.out, 'summary.json')}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error('FATAL:', e.message || e);
    process.exit(1);
  });
}
