/* ====================================================================
 * What the firmware-slots page must do on each of the 28 supported subjects of the
 * corpus matrix (TESTING.md 42.1). ONE table, read by every test that judges the page:
 *
 *   - the emulator suites (packages/core/test/slots/page-expectations.emulator.test.ts)
 *     boot each subject that has an `emulator` label and check the page's verdicts
 *     against this table: a bank the table says is writable must not be refused, a bank
 *     it says is refused must be refused with its reason, the camera-wide banner must
 *     match, and the frame-rate row action must be offered or absent with its reason;
 *   - the Chrome spec (e2e/slots-quality.e2e.ts) reads the same rows for the page itself;
 *   - the bench (e2e/slots-bench.e2e.ts) may read it as well, but is not changed by it.
 *
 * A VERDICT is what the page must show for one bank:
 *   - `{ writable: true }`: the page offers the write and no refusal is shown for it;
 *   - `{ writable: false, reason }`: the page refuses the write before anything is sent,
 *     and the refusal contains `reason` (a fragment; the empty string means "any refusal").
 * The camera-wide banner ("No bank of this camera can be written from here") must match each
 * row's `banner`: absent, unless the camera refuses every bank (then the row names the reason,
 * and every flash control on it is off). A row with a writable bank never shows a banner.
 *
 * `emulator` is the label of the subject in LOCKED_SUBJECTS (corpus-locked-subjects.ts) or
 * MODERN_SUBJECTS (corpus-modern-run.ts), or null when the emulator corpus has no entry for
 * the bench row (the bench still runs it). Expectations are the ones the owner's
 * measurements record: a write that the bench or the emulator proved is `writable`; a page
 * refusal that is the design (a bank the page cannot key) is `refused`, with the reason the
 * page gives. Where the emulator cannot make a check (PINNED_GAPS in the modern suite), the
 * row's expectation is still the page's, and the gap is recorded there, not here.
 * ==================================================================== */

/** The three banks of a camera. */
export type BankLetter = 'a' | 'b' | 'r';

/** What the page must show for one bank's flash action. */
export type BankVerdict =
  { readonly writable: true } | { readonly writable: false; readonly reason: string };

/** What the frame-rate row action must show. */
export type FpsExpectation =
  | { readonly offer: true; readonly toHz: number }
  | { readonly offer: false; readonly reason: string };

export interface SlotsSubject {
  /** Stable name for titles and reports: the bench's row name. */
  readonly name: string;
  /** The matrix group (TESTING.md 42.1). */
  readonly group: string;
  /** The build the camera reports. */
  readonly version: string;
  /** The emulator subject label, or null when the corpus has none for this row. */
  readonly emulator: string | null;
  /** The verdict per bank, as the page must show it. */
  readonly banks: Readonly<Record<BankLetter, BankVerdict>>;
  /** The frame-rate row action, on every bank that holds an image (see the emulator suite). */
  readonly fps: FpsExpectation;
  /**
   * A bank that holds an image the frame-rate row does NOT offer, though `fps` is an offer on the others: the
   * bank and the fragment the planner's reason must contain. Absent when every image bank takes `fps`.
   */
  readonly fpsNotOffered?: { readonly bank: BankLetter; readonly reason: string };
  /**
   * The camera-wide banner ("No bank of this camera can be written from here"): `'none'` when the page
   * shows none, else a fragment of the refusal it must show. A banner is shown only when the camera refuses
   * every bank, and then every bank's verdict is a refusal too (the flash controls are off with it).
   */
  readonly banner: string;
  /**
   * A write of the bank's OWN decrypted image back into it, where the table says the page refuses it: the
   * bank and the fragment the refusal must contain. Absent when the page has no such refusal to show.
   */
  readonly ownImage?: { readonly bank: BankLetter; readonly reason: string };
  /**
   * The build each bank's flash holds, as the page reads it (its header's build string), where the table knows it:
   * the bank's build is checked against the page's read by the bench (verdict.ts) and by the emulator suite
   * (page-expectations.emulator.test.ts). A bank left out is not checked. Filled from the corpus dumps, on the
   * line's layout (TESTING.md 42.39): the 0.x, 1.x and 2016 Compact PRO line (A 0x14050000, B 0x14060000,
   * R 0x14070000), and the 4.x and later line (A 0x14030000, B 0x14050000, R 0x14070000). A blank bank has no
   * build and is left out.
   */
  readonly bankVersions?: Readonly<Partial<Record<BankLetter, string>>>;
  /** Where the row's expectation comes from. */
  readonly source: string;
}

const WRITABLE: BankVerdict = { writable: true };

/** Every bank writable: the common case on every line the bench and the emulator proved. */
const ALL_WRITABLE = { a: WRITABLE, b: WRITABLE, r: WRITABLE } as const;

/** Not an offer: the reason the stage-one table gives for a build outside it. */
const NO_FPS_TABLE: FpsExpectation = { offer: false, reason: '' };

export const SLOTS_SUBJECTS: readonly SlotsSubject[] = [
  /* ---- the 2014 plaintext chain (A, B, R stored plain) ------------------------------- */
  {
    name: 'Compact 0.8.0.0',
    group: 'Compact 2014 chain',
    version: '0.8.0.0',
    emulator: 'Compact 0.8.0.0',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 32 },
    banner: 'none',
    bankVersions: { a: '0.8.0.0', r: '0.8.0.0' },
    source:
      '42.1 (pass); 42.2 (the camera names no booted bank: every bank takes the tick); 32 Hz table entry, stage one, offered unmeasured (owner decision); not measured on a camera',
  },
  {
    name: 'Compact 0.9.0.2',
    group: 'Compact 2014 chain',
    version: '0.9.0.2',
    emulator: 'Compact 0.9.0.2',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 32 },
    banner: 'none',
    bankVersions: { a: '0.9.0.2', r: '0.9.0.2' },
    source:
      '42.1 (pass), 42.5; 32 Hz table entry, stage one, offered unmeasured (owner decision); not measured on a camera',
  },
  {
    name: 'Compact 0.9.0.6',
    group: 'Compact 2014 chain',
    version: '0.9.0.6',
    emulator: 'Compact 0.9.0.6',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 32 },
    banner: 'none',
    bankVersions: { a: '0.9.0.6', r: '0.9.0.6' },
    source:
      '42.1 (pass); 32 Hz table entry, stage one, offered unmeasured (owner decision); not measured on a camera',
  },
  {
    name: 'Compact 0.9.0.7',
    group: 'Compact 2014 chain',
    version: '0.9.0.7',
    emulator: 'Compact 0.9.0.7',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 32 },
    banner: 'none',
    bankVersions: { a: '0.9.0.7', r: '0.9.0.7' },
    source:
      '42.1 (pass); 32 Hz table entry, stage one, offered unmeasured (owner decision); not measured on a camera',
  },
  {
    name: 'Compact 0.9.1.0',
    group: 'Compact 2014 chain',
    version: '0.9.1.0',
    emulator: 'Compact 0.9.1.0',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 32 },
    banner: 'none',
    bankVersions: { a: '0.9.1.0', r: '0.9.1.0' },
    source:
      '42.1 (pass), 42.5; 32 Hz table entry, stage one, offered unmeasured (owner decision); not measured on a camera',
  },
  {
    name: 'Compact 0.10.0.0',
    group: 'Compact 2014 chain',
    version: '0.10.0.0',
    emulator: 'Compact 0.10.0.0',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 32 },
    banner: 'none',
    bankVersions: { a: '0.10.0.0', r: '0.10.0.0' },
    source:
      '42.1 (pass); 32 Hz table entry, stage one, offered unmeasured (owner decision); not measured on a camera',
  },
  {
    name: 'Compact 1.0.0.0',
    group: 'Compact 2014 chain',
    version: '1.0.0.0',
    emulator: 'Compact 1.0.0.0',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 32 },
    banner: 'none',
    bankVersions: { a: '1.0.0.0', r: '1.0.0.0' },
    source:
      '42.1 (pass), 42.5; 32 Hz table entry, stage one, offered unmeasured (owner decision); not measured on a camera',
  },
  {
    name: 'Compact 1.2.0.0',
    group: 'Compact 2014 chain',
    version: '1.2.0.0',
    emulator: 'Compact 1.2.0.0',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 32 },
    banner: 'none',
    bankVersions: { a: '1.2.0.0', r: '1.2.0.0' },
    source:
      '42.1 (pass), 42.5; its 16 Hz patch was removed (42.26); 32 Hz table entry, stage one, not measured on a camera',
  },
  {
    name: 'Compact 1.3.0.0',
    group: 'Compact 2014 chain',
    version: '1.3.0.0',
    emulator: 'Compact 1.3.0.0 (native dump)',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 32 },
    banner: 'none',
    bankVersions: { a: '1.3.0.0', r: '1.3.0.0' },
    source:
      '42.1 (pass), 42.5 (the bench camera); frame-rate stage one (42.15); 32 Hz in the Normal stream, measured on a 1.3.0.0 Compact (42.25)',
  },
  {
    name: 'Compact 1.3.0.8 (8 Hz)',
    group: 'Compact 2014 chain',
    version: '1.3.0.8',
    emulator: 'Compact 1.3.0.8 (8 Hz)',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 32 },
    banner: 'none',
    bankVersions: { a: '1.3.0.8', r: '1.3.0.8' },
    source:
      '42.1 (pass), 42.5; frame-rate stage one, the 8 Hz build, table target 32 Hz (the plain-copy form, not measured on a camera; its earlier op 5 form measured 26 Hz, 42.20)',
  },

  /* ---- Compact 1.3.0.8 FF (the 16 Hz build, vendor form) ----------------------------- */
  {
    name: 'Compact 1.3.0.8 FF',
    group: 'Compact FF',
    version: '1.3.0.8',
    emulator: 'Compact 1.3.0.8-FF (16 Hz)',
    banks: ALL_WRITABLE,
    fps: NO_FPS_TABLE,
    banner: 'none',
    bankVersions: { a: '1.3.0.8', r: '1.3.0.8' },
    source:
      '42.1 listed it as refused; 42.6 and 42.12 made it writable to A, B and R (vendor form)',
  },

  /* ---- the modern Key A line (4.x) ----------------------------------------------------- */
  {
    name: 'Compact 4.8.1.9',
    group: 'Compact 4.x',
    version: '4.8.1.9',
    emulator: 'Compact 4.8.1.9 image (on 4.8.2.1)',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 32 },
    banner: 'none',
    bankVersions: { a: '4.8.1.9', b: '4.8.1.9', r: '4.8.1.9' },
    source: '42.1 (pass), 42.5; frame-rate stage two (Key A), 32 Hz table entry (TESTING.md 42.22)',
  },
  {
    name: 'Compact 4.8.2.1',
    group: 'Compact 4.x',
    version: '4.8.2.1',
    emulator: 'Compact 4.8.2.1 dump',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 32 },
    banner: 'none',
    bankVersions: { a: '4.8.2.1', b: '4.8.2.1', r: '4.8.2.1' },
    source:
      '42.1 (pass); the slots-view spec (modern Key A); frame-rate stage two (Key A), 32 Hz table entry, the highest for this image (TESTING.md 42.24; 16 Hz entry 42.23)',
  },
  {
    name: 'Compact 4.8.1.7 (std)',
    group: 'Compact 4.x',
    version: '4.8.1.7',
    emulator: 'Compact 4.8.1.7 image (on 4.8.2.1)',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 32 },
    banner: 'none',
    bankVersions: { a: '4.8.1.7', b: '4.8.1.7', r: '4.8.1.7' },
    source:
      '42.4 (slot steps pass after the SPIFI read-back fix); its emulator subject, the 4.8.1.7 image on the 4.8.2.1 donor, is in corpus-modern-run (no pinned gap; TESTING.md 42.39); frame-rate stage two (Key A), 32 Hz table entry (TESTING.md 42.22)',
  },
  {
    name: 'Compact 4.16.1.7 (FF)',
    group: 'Compact 4.x',
    version: '4.16.1.7',
    emulator: 'Compact FF 4.16.1.7 image (on 4.8.2.1)',
    banks: {
      a: { writable: false, reason: 'checks an upload under its own keys' },
      b: { writable: false, reason: 'checks an upload under its own keys' },
      r: { writable: false, reason: 'checks an upload under its own keys' },
    },
    fps: NO_FPS_TABLE,
    banner: 'checks an upload under its own keys',
    bankVersions: { a: '4.16.1.7', b: '4.16.1.7', r: '4.16.1.7' },
    source:
      '42.4: the page refused bank B with the Key A message; its application embeds none of the corpus pairs (42.5 key tables). The application checks an upload under its own keys before it programs it, and the key the writes would store under is neither of its pair, so every bank is refused (the emulator pins it as a gap: corpus-modern-run REASON.notWritable).',
  },

  /* ---- Compact PRO (2016 keystream line, and the 4.x Pro line) ------------------------- */
  {
    name: 'Compact PRO 1.0.3.0 (std)',
    group: 'Compact PRO 2016 chain',
    version: '1.0.3.0',
    emulator: 'Compact PRO 1.0.3.0 (9 Hz, native dump)',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 18 },
    banner: 'none',
    bankVersions: { a: '1.0.3.0', b: '1.0.3.0', r: '1.0.3.0' },
    source:
      '42.1 (pass), 42.8 (locked-2016 is writable); frame-rate stage three (2016 keystream), 18 Hz table entry; every bank of the native dump decrypts to its stock image (fps-patch.pro-2016.emulator.test.ts)',
  },
  {
    name: 'Compact PRO 1.0.3.0 (FF)',
    group: 'Compact PRO 2016 chain',
    version: '1.0.3.0',
    emulator: 'Compact PRO 1.0.3.0 (FF, native dump)',
    banks: ALL_WRITABLE,
    fps: { offer: false, reason: 'already runs at 18 Hz' },
    banner: 'none',
    bankVersions: { a: '1.0.3.0', b: '1.0.3.0', r: '1.0.3.0' },
    source: '42.1 (pass); the FF image is the 18 Hz build (known rate), so no patch is offered',
  },
  {
    name: 'Compact PRO 1.0.3.2 (std)',
    group: 'Compact PRO 2016 chain',
    version: '1.0.3.2',
    emulator: 'Compact PRO 1.0.3.2 (9 Hz, chimera)',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 18 },
    banner: 'none',
    bankVersions: { a: '1.0.3.2', b: '1.0.3.2', r: '1.0.3.2' },
    source:
      '42.1 (pass); frame-rate stage three (2016 keystream), 18 Hz table entry; the chimera splices the image into every slot (fps-patch.pro-2016.emulator.test.ts)',
  },
  {
    name: 'Compact PRO 1.0.3.2 (FF)',
    group: 'Compact PRO 2016 chain',
    version: '1.0.3.2',
    emulator: 'Compact PRO 1.0.3.2 (FF 18 Hz, chimera)',
    banks: ALL_WRITABLE,
    fps: { offer: false, reason: 'already runs at 18 Hz' },
    banner: 'none',
    bankVersions: { a: '1.0.3.2', b: '1.0.3.2', r: '1.0.3.2' },
    source: '42.1 (pass); the FF image is the 18 Hz build (known rate), so no patch is offered',
  },
  {
    name: 'Compact PRO 1.0.3.2 (FF-FF)',
    group: 'Compact PRO 2016 chain',
    version: '1.0.3.2',
    emulator: null,
    banks: ALL_WRITABLE,
    fps: NO_FPS_TABLE,
    banner: 'none',
    bankVersions: { a: '1.0.3.2', b: '1.0.3.2', r: '1.0.3.2' },
    source: '42.1 (pass); no emulator entry for the FF-FF image',
  },
  {
    name: 'Compact PRO 4.9.2.0',
    group: 'Compact Pro 4.x',
    version: '4.9.2.0',
    emulator: 'Compact PRO 4.9.2.0 dump (1215A0YZ9AA8)',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 18 },
    banner: 'none',
    bankVersions: { a: '4.9.2.0', b: '4.9.2.0', r: '4.9.2.0' },
    source:
      '42.1 (pass), 42.5; frame-rate stage two (Key A), 18 Hz table entry, offered unmeasured (owner decision 2026-10-19; TESTING.md 42.28)',
  },
  {
    name: 'Compact PRO FF 4.18.2.0',
    group: 'Compact Pro 4.x',
    version: '4.18.2.0',
    emulator: 'Compact PRO FF 4.18.2.0 dump (090BB12PR939)',
    banks: ALL_WRITABLE,
    fps: NO_FPS_TABLE,
    banner: 'none',
    bankVersions: { a: '4.18.2.0', b: '4.18.2.0', r: '4.18.2.0' },
    source: '42.1 (pass)',
  },
  {
    name: 'Compact PRO 4.9.1.15 (std)',
    group: 'Compact Pro 4.x',
    version: '4.9.1.15',
    emulator: 'Compact PRO 4.9.1.15 dump',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 18 },
    fpsNotOffered: { bank: 'b', reason: 'already runs at 18 Hz' },
    banner: 'none',
    ownImage: {
      bank: 'b',
      reason: "neither this camera's pair nor a decoded application pair occurs in the image",
    },
    bankVersions: { a: '4.9.1.15', b: '1.0.3.2', r: '4.9.1.15' },
    source:
      '42.1 and 42.5: the dump’s bank B holds a 1.0.3.2 image with neither key pair, so writing B back from its own image is refused; the bench writes B from A’s image (42.5 note 2), which the page offers. Frame-rate: banks A and R hold the 4.9.1.15 image, offered at 18 Hz (stage two, TESTING.md 42.28; owner, 2026-10-26); bank B holds the 1.0.3.2-FF build, which the table records at 18 Hz already, so it takes no patch.',
  },

  /* ---- XR, Mosaic, Nano ------------------------------------------------------------------ */
  {
    name: 'Compact XR 4.8.2.1',
    group: 'XR, Mosaic, Nano',
    version: '4.8.2.1',
    emulator: 'Compact XR 4.8.2.1 dump',
    banks: ALL_WRITABLE,
    fps: { offer: true, toHz: 32 },
    banner: 'none',
    bankVersions: { a: '4.8.2.1', b: '4.8.2.1', r: '4.8.2.1' },
    source:
      '42.1 (pass); frame-rate stage two (Key A), 32 Hz table entry, the highest for this image, measured on the Compact XR 4.8.2.1 (TESTING.md 42.24; 16 Hz entry 42.23)',
  },
  {
    name: 'Mosaic 10.9.1.31 (std)',
    group: 'XR, Mosaic, Nano',
    version: '10.9.1.31',
    emulator: 'Mosaic 10.9.1.31 dump',
    banks: ALL_WRITABLE,
    fps: NO_FPS_TABLE,
    banner: 'none',
    bankVersions: { a: '10.9.1.31', b: '10.9.1.31', r: '10.9.1.31' },
    source:
      '42.1 listed it refused; 42.7 derives its upload keys from the camera and the emulator boots the write',
  },
  {
    name: 'Mosaic FF 2.27.1.33',
    group: 'XR, Mosaic, Nano',
    version: '2.27.1.33',
    emulator: 'Mosaic FF 2.27.1.33 dump',
    banks: ALL_WRITABLE,
    fps: NO_FPS_TABLE,
    banner: 'none',
    bankVersions: { a: '2.27.1.33', b: '2.27.1.33', r: '2.27.1.33' },
    source: '42.1 (pass)',
  },
  {
    name: 'Nano 200 42.32.3.10',
    group: 'XR, Mosaic, Nano',
    version: '42.32.3.10',
    emulator: 'Nano 200 42.32.3.10 dump',
    banks: ALL_WRITABLE,
    fps: NO_FPS_TABLE,
    banner: 'none',
    bankVersions: { a: '42.32.3.10', b: '42.32.3.10', r: '42.32.3.10' },
    source: '42.1 (pass)',
  },
  {
    name: 'Nano 300 44.27.3.10',
    group: 'XR, Mosaic, Nano',
    version: '44.27.3.10',
    emulator: 'Nano 300 44.27.3.10 dump',
    banks: ALL_WRITABLE,
    fps: NO_FPS_TABLE,
    banner: 'none',
    bankVersions: { a: '44.27.3.10', b: '44.27.3.10', r: '44.27.3.10' },
    source: '42.1 (pass), 42.5',
  },
];

/** The two sets the emulator tests split on: the rows a corpus entry boots, and the rest. */
export function emulatorSubjects(): readonly SlotsSubject[] {
  return SLOTS_SUBJECTS.filter((subject) => subject.emulator !== null);
}

/** Count of rows whose refusal is expected for at least one bank (the page's designed refusals). */
export function refusedRows(): readonly SlotsSubject[] {
  return SLOTS_SUBJECTS.filter((subject) =>
    Object.values(subject.banks).some((verdict) => !verdict.writable),
  );
}
