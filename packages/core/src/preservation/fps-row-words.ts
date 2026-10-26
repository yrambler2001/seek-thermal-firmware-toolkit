/* ==================================================================== *
 * The frame-rate table's rows in words. The table (fps-patch-table.ts) is
 * generated from FW-V1's fps_patch.py, and its row labels use the
 * reconstruction's record and link names: "row 14, the steady self-loop (row
 * link ee: next = alt = 14), 68-byte r2016 record". That label stays on
 * `FpsRow.detail`, for developers and the JSON. Everything a person reads
 * names the row from this map instead (TESTING.md 42.88).
 *
 * Every entry patches the same thing: the one row of the build's frame program
 * that the camera repeats while it streams (the steady self-loop, whose next
 * and alternate links point at itself). Each is named "the steady frame row
 * (row N)", N being that row's index in the build's own table, as its label
 * gives it (a row, record, block or command page). The two 4.8.1.x labels give
 * no index; their edits name block 13 (header 04 0d 0d 00: next = alt = 0x0d).
 * ==================================================================== */

/** The steady row's index in each entry's frame table, by table id. A test pins one per entry. */
const STEADY_ROW_INDEX: Readonly<Record<string, number>> = {
  'compact_pro-1.0.3.0': 14,
  'compact_pro-1.0.3.2': 20,
  'compact_pro-4.9.1.15': 20,
  'compact_pro-4.9.2.0': 20,
  'compact_32k-1.3.0.8-to32': 13,
  'compact_32k-4.8.1.7-to32': 13,
  'compact_32k-4.8.1.9-to32': 13,
  'compact_32k-1.3.0.0-to32': 8,
  'compact_32k-0.7.0.8-to32': 4,
  'compact_32k-0.8.0.0-to32': 6,
  'compact_32k-0.9.0.2-to32': 7,
  'compact_32k-0.9.0.6-to32': 7,
  'compact_32k-0.9.0.7-to32': 7,
  'compact_32k-0.9.1.0-to32': 7,
  'compact_32k-0.10.0.0-to32': 7,
  'compact_32k-1.0.0.0-to32': 7,
  'compact_32k-1.2.0.0-to32': 8,
  'compact_32k-1.3.0.8-FF-to32': 13,
  'compact_32k-4.16.1.7-FF-to32': 13,
  'compact_32k-4.8.2.1-to32': 13,
};

/** The steady row's index for a table id, or null for an id this map does not hold. */
export function fpsSteadyRowIndex(id: string): number | null {
  return STEADY_ROW_INDEX[id] ?? null;
}

/**
 * The id suffix of the entries that add the no-skip branch alone to an image an earlier 32 Hz entry wrote
 * (TESTING.md 42.97). Their one edit is code, the USB check at the start of each field, not a frame-program row.
 */
export const FPS_ADD_NOSKIP_SUFFIX = '-add-noskip';

/** What an add-noskip entry changes, in words. */
export const FPS_USB_CHECK_NAME = 'the USB check at the start of each field';

/** The row a patch changes, in words: "the steady frame row (row 14)", or the USB check for an add-noskip entry. */
export function fpsRowName(id: string): string {
  if (id.endsWith(FPS_ADD_NOSKIP_SUFFIX)) return FPS_USB_CHECK_NAME;
  const index = fpsSteadyRowIndex(id);
  return index === null ? 'the steady frame row' : `the steady frame row (row ${String(index)})`;
}
