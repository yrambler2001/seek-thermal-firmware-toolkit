/* ==================================================================== *
 * Compact frame parsing and statistics, with no USB in it.
 *
 * The Compact (PID 0x0010, 32K sensor) streams one frame per ImageData credit.
 * Everything here is derived from the bytes the camera sent, or from firmware
 * facts named with their source, so a reading can be checked against the code:
 *
 *   - the frame's byte size comes from the spacing of the frame header marker
 *     (0x04B1 at halfword 0 of the header, frame_capture_step, app_init.c:904),
 *     checked against the capture index, not from the PRO's 342 x 260 geometry;
 *   - the row width (halfwords per sensor row) is the one value in 128..320 that
 *     makes the 0x680-byte header and the whole frame whole numbers of rows: 208
 *     (the firmware's frame pool row, app_init.c:570). A picture-based width was
 *     tried and does not work on the CDS output (see deriveRowWidth);
 *   - the frame type is halfword 10 of the first body row, which is the word the
 *     firmware stores as `pool[0x14 / 2] = hdr` (app_init.c:668) and which the
 *     firmware's own type table names (FPS_PATCH_LINE_STEPS.md 1.1, 1.5);
 *   - the capture index is halfword 1 of the header (the frame counter the
 *     firmware checks at app_init.c:932), and it advances once per sensor
 *     capture, so the spacing of published frames in captures is independent of
 *     how the host reads them.
 *
 * Nothing in this file talks to a camera. The request set the runner may send is
 * the stream start and stop plus frame credits (ALLOWED_OUT), and that set is
 * checked by the tests.
 * ==================================================================== */

/** Vendor request numbers the runner may send as OUT. Nothing else is ever sent. */
export const ALLOWED_OUT = Object.freeze({
  /** SetOperationMode(0 / 1): stop and start the stream. Runtime state only. */
  SetOperationMode: 0x3c,
  /** ImageData(n): one frame credit. */
  ImageData: 0x53,
});

/** Halfwords per credit with the header (lines 0..159): 208 x 160. */
export const CREDIT_RAW_HW = 0x8200;
/** Halfwords per credit without the header (lines 4..159): 208 x 156. */
export const CREDIT_BODY_HW = 0x7ec0;
/** The frame header marker: frame_hdr16_r32k[0] == 0x4B1 (app_init.c:904). */
export const FRAME_MARKER = 0x04b1;
/**
 * The bytes of the frame header sent before the body: stream_push_chunk writes
 * stream_header_buf_r32k with 0x680 bytes (app_init.c, stream_push_chunk). It is
 * four sensor rows of 208 halfwords, so the header is checked against the derived
 * row width below.
 */
export const HEADER_BYTES = 0x680;
/** Halfword index of the frame type inside a body row (pool[0x14 / 2], app_init.c:668). */
export const TYPE_HALFWORD = 10;
/** The image frame type: the steady thermal frame in every steady block (FPS_PATCH_LINE_STEPS.md 1.5). */
export const IMAGE_TYPE = 3;
/** Body rows skipped at the top when the frame mean is taken (the emulator's body is rows 8..155). */
export const MEAN_SKIP_ROWS = 8;

/** Row widths the derivation may choose from. */
const WIDTH_CANDIDATES = Array.from({ length: 321 - 128 }, (_, i) => 128 + i);

/** The largest frame the derivation will consider: 1 MiB. */
const MAX_FRAME_BYTES = 1 << 20;
/** The largest capture-index step between two frames the derivation will consider (16 captures per frame, times 4 frames). */
const MAX_INDEX_STEP = 64;

/**
 * The frame size in bytes, from a stream of frames back to back.
 *
 * A pixel value can equal the marker by chance, so a marker alone is not enough. A
 * true frame header also carries a capture index (halfword 1) that is later than the
 * index of an earlier header by a few captures, so a pair of markers counts only when
 * its index step is between 1 and MAX_INDEX_STEP. Each counted pair has a spacing in
 * bytes. Frames k apart give spacings k times the frame size, with counts that fall
 * off one pair at a time, so the frame size is the SHORTEST spacing whose count is at
 * least half the most common one.
 *
 * Returns { bytes, agree, of }: `agree` counts the pairs at `bytes`, `of` the pairs
 * that passed the index test at all; or null when no pair passed.
 */
export function frameBytesFromMarkers(buffer, markerOffsets) {
  const indexAt = (p) => buffer.readUInt16LE(p + 2) & INDEX_MASK;
  const spacing = new Map();
  let of = 0;
  for (let i = 0; i < markerOffsets.length; i++) {
    const p = markerOffsets[i];
    if (p + 4 > buffer.length) continue;
    for (let j = i + 1; j < markerOffsets.length; j++) {
      const q = markerOffsets[j];
      if (q - p > MAX_FRAME_BYTES * 4) break;
      if (q + 4 > buffer.length) continue;
      const step = (indexAt(q) - indexAt(p)) & INDEX_MASK;
      if (step < 1 || step > MAX_INDEX_STEP) continue;
      spacing.set(q - p, (spacing.get(q - p) ?? 0) + 1);
      of++;
    }
  }
  if (!spacing.size) return null;
  const top = Math.max(...spacing.values());
  const bytes = Math.min(...[...spacing].filter(([, c]) => 2 * c >= top).map(([d]) => d));
  return { bytes, agree: spacing.get(bytes), of };
}

/**
 * The byte offsets of every halfword equal to the frame marker in a stream (2-byte
 * aligned). The frame headers are among them, once per frame; pixel values that
 * happen to equal 0x04B1 are the others, and they do not repeat at one spacing, so
 * the most common spacing (frameBytesFromMarkers) is the frame size.
 */
export function markerPositions(buffer) {
  const out = [];
  for (let at = 0; at + 2 <= buffer.length; at += 2) {
    if (buffer.readUInt16LE(at) === FRAME_MARKER) out.push(at);
  }
  return out;
}

/**
 * The halfwords per sensor row, from the frame size in bytes.
 *
 * A raw frame is a 0x680-byte header followed by whole rows. The row width is the
 * one value in 128..320 for which both the header and the whole frame are whole
 * numbers of rows. For the 66560-byte frame that is 208, and no other value in the
 * range fits. Returns { width, candidates }; width is null when the size does not
 * pin the width down (a body-only frame, for instance).
 *
 * Why not the picture: a vertical-neighbour smoothness score was tried first. It
 * does not work on this camera's output. The body is a difference of two captures
 * (the CDS of op 9), so it is noise-dominated: the score's minima fall at 204 and
 * 219, and the 208-wide render is a fixed texture, not an image. Recorded in
 * TESTING.md section 42.15.
 */
export function deriveRowWidth(frameBytes, { rawLayout = true } = {}) {
  const frameHw = frameBytes / 2;
  const headerHw = rawLayout ? HEADER_BYTES / 2 : 0;
  const candidates = WIDTH_CANDIDATES.filter((w) => frameHw % w === 0 && headerHw % w === 0);
  return { width: candidates.length === 1 ? candidates[0] : null, candidates };
}

/**
 * One frame, parsed. `raw` is true when the frame carries its 0x680-byte header
 * (a raw credit); the body then starts at HEADER_BYTES. `rowHw` is the derived
 * row width.
 */
export function parseFrame(buf, { raw, rowHw }) {
  const bodyStart = raw ? HEADER_BYTES : 0;
  const rowBytes = rowHw * 2;
  const bodyBytes = buf.length - bodyStart;
  const bodyRows = Math.floor(bodyBytes / rowBytes);
  const typeAt = bodyStart + TYPE_HALFWORD * 2;
  const meanFrom = bodyStart + MEAN_SKIP_ROWS * rowBytes;
  const meanTo = bodyStart + bodyRows * rowBytes;
  let sum = 0;
  let count = 0;
  for (let o = meanFrom; o + 2 <= meanTo; o += 2) {
    sum += buf.readInt16LE(o);
    count++;
  }
  return {
    bytes: buf.length,
    marker: raw ? buf.readUInt16LE(0) : null,
    index: raw ? buf.readUInt16LE(2) : null,
    type: typeAt + 2 <= buf.length ? buf.readUInt16LE(typeAt) : null,
    bodyRows,
    mean: count ? sum / count : null,
  };
}

/** The median of a non-empty numeric array. */
export function median(values) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * The most common value of `values` after rounding to `bin` (default 0.5 ms).
 * Ties go to the smaller value.
 */
export function modeOf(values, bin = 0.5) {
  const counts = new Map();
  for (const v of values) {
    const k = Math.round(v / bin) * bin;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  let best = null;
  let bestCount = 0;
  for (const [k, c] of [...counts].sort((a, b) => a[0] - b[0])) {
    if (c > bestCount) {
      best = k;
      bestCount = c;
    }
  }
  return best;
}

/** A histogram as a plain object keyed by the value (sorted numerically). */
export function histogram(values) {
  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return Object.fromEntries([...counts].sort((a, b) => Number(a[0]) - Number(b[0])));
}

const INDEX_MASK = 0x3fff;

/**
 * The summary of one run.
 *
 * `frames` is in stream order: { n, tCredit, tFirst, tDone, bytes, parsed }. The
 * times are host milliseconds from one origin. `frameBytes` is the credit size in
 * bytes; a frame of any other size is counted as incomplete.
 */
export function summarize(frames, { frameBytes, raw }) {
  const complete = frames.filter((f) => f.bytes === frameBytes);
  const times = complete.map((f) => f.tDone);
  const out = {
    frames: frames.length,
    complete: complete.length,
    incomplete: frames.length - complete.length,
    frameBytes,
    raw,
    windowMs: null,
    fps: null,
    intervalMs: { median: null, mode: null, min: null, max: null },
    typeHistogram: histogram(complete.map((f) => f.parsed.type)),
    markerOk: complete.filter((f) => f.parsed.marker === FRAME_MARKER).length,
    thermal: { frames: 0, fps: null, intervalMs: { median: null, mode: null } },
    nonThermal: [],
    captures: { indexDeltaHistogram: {}, perSecond: null, indexSpanOk: true },
    body: { medianMean: null, medianAbsStep: null, steps: 0 },
  };
  if (complete.length > 1) {
    const spanMs = times[times.length - 1] - times[0];
    out.windowMs = spanMs;
    out.fps = (complete.length - 1) / (spanMs / 1000);
    const dts = [];
    for (let i = 1; i < times.length; i++) dts.push(times[i] - times[i - 1]);
    out.intervalMs = {
      median: median(dts),
      mode: modeOf(dts),
      min: Math.min(...dts),
      max: Math.max(...dts),
    };
  }
  const thermal = complete.filter((f) => f.parsed.type === IMAGE_TYPE);
  out.thermal.frames = thermal.length;
  if (thermal.length > 1) {
    const tt = thermal.map((f) => f.tDone);
    const spanMs = tt[tt.length - 1] - tt[0];
    out.thermal.fps = (thermal.length - 1) / (spanMs / 1000);
    const dts = [];
    for (let i = 1; i < tt.length; i++) dts.push(tt[i] - tt[i - 1]);
    out.thermal.intervalMs = { median: median(dts), mode: modeOf(dts) };
  }
  let lastNon = null;
  for (const f of complete) {
    if (f.parsed.type === IMAGE_TYPE) continue;
    out.nonThermal.push({
      n: f.n,
      type: f.parsed.type,
      tDoneMs: f.tDone,
      captureIndex: f.parsed.index,
      capturesSincePrevious: lastNon && raw ? (f.parsed.index - lastNon.index) & INDEX_MASK : null,
      msSincePrevious: lastNon ? f.tDone - lastNon.tDone : null,
    });
    lastNon = { index: f.parsed.index, tDone: f.tDone };
  }
  if (raw && complete.length > 1) {
    const deltas = [];
    for (let i = 1; i < complete.length; i++) {
      deltas.push((complete[i].parsed.index - complete[i - 1].parsed.index) & INDEX_MASK);
    }
    out.captures.indexDeltaHistogram = histogram(deltas);
    const first = complete[0].parsed.index;
    const last = complete[complete.length - 1].parsed.index;
    const captures = (last - first) & INDEX_MASK;
    const spanMs = times[times.length - 1] - times[0];
    out.captures.perSecond = spanMs > 0 ? captures / (spanMs / 1000) : null;
    out.captures.capturesOverWindow = captures;
    const sum = deltas.reduce((a, b) => a + b, 0);
    out.captures.indexSpanOk = sum === captures;
  }
  const means = complete.map((f) => f.parsed.mean).filter((m) => m !== null);
  if (means.length) {
    out.body.medianMean = median(means);
    const steps = [];
    for (let i = 1; i < means.length; i++) steps.push(Math.abs(means[i] - means[i - 1]));
    out.body.steps = steps.length;
    out.body.medianAbsStep = steps.length ? median(steps) : null;
  }
  return out;
}

/** Rounds a number for display. */
export function fmt(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  if (!Number.isFinite(value)) return String(value);
  return value.toFixed(digits);
}

/**
 * The plain-text report of a summary, one fact per line. `label` names the run.
 */
export function formatSummary(s, label = 'run') {
  const lines = [];
  lines.push(
    `${label}: ${s.frames} frames, ${s.complete} complete (${s.frameBytes} B each, ${s.raw ? 'raw, with header' : 'body only'})`,
  );
  lines.push(
    `  frame rate: ${fmt(s.fps)} fps over ${fmt((s.windowMs ?? 0) / 1000, 2)} s; interval median ${fmt(s.intervalMs.median, 1)} ms, mode ${fmt(s.intervalMs.mode, 1)} ms`,
  );
  lines.push(
    `  thermal (type ${IMAGE_TYPE}) only: ${s.thermal.frames} frames, ${fmt(s.thermal.fps)} fps, interval median ${fmt(s.thermal.intervalMs.median, 1)} ms`,
  );
  const types = Object.entries(s.typeHistogram)
    .map(([t, c]) => `${t}:${c}`)
    .join(' ');
  lines.push(`  frame type histogram (halfword ${TYPE_HALFWORD} of body row 0): ${types || '-'}`);
  if (s.raw) {
    const d = Object.entries(s.captures.indexDeltaHistogram)
      .map(([k, c]) => `${k}:${c}`)
      .join(' ');
    lines.push(
      `  captures per published frame (capture index deltas): ${d || '-'}; capture rate from the index ${fmt(s.captures.perSecond, 2)} /s`,
    );
  }
  if (s.nonThermal.length) {
    const shown = s.nonThermal
      .slice(0, 12)
      .map(
        (x) =>
          `#${x.n}(t${x.type}${x.capturesSincePrevious === null ? '' : `,+${x.capturesSincePrevious}cap`})`,
      )
      .join(' ');
    lines.push(
      `  non-thermal frames: ${s.nonThermal.length}: ${shown}${s.nonThermal.length > 12 ? ' ...' : ''}`,
    );
  } else {
    lines.push('  non-thermal frames: none');
  }
  lines.push(
    `  body mean: median ${fmt(s.body.medianMean, 1)}, median |step| between frames ${fmt(s.body.medianAbsStep, 1)}`,
  );
  return lines.join('\n');
}
