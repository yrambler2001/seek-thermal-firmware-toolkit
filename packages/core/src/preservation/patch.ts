/**
 * The preservation pipeline's plaintext and ciphertext math, for every build
 * whose widening patch is derived and proven.
 *
 * Ported from FW-V1 `ht-201/build_v1_patch.py` (doc 34) and reduced to what the
 * in-place route needs, then extended to the newly derived families (FW-V1
 * docs 35 — the two 1.3.0.8 builds — and the 1.0.3.x packaging doc,
 * `V1_WIDENING_1032`). Everything here is pure: bytes in, bytes out, no
 * transport, no I/O — so the whole file is unit-testable without a camera.
 *
 * ---- The two domains, and the trap that costs a camera ---------------------
 *
 * A slot on the part does not hold the firmware image; it holds the image XOR
 * a keystream (the bootloader's at-rest cipher) — or, on the 2014 builds, the
 * image itself (no cipher). The wire-79 reader serves the SLOT BYTES. But the
 * patch is a change to the PLAINTEXT (the reader-cursor widening and the
 * checksum rebalance are code edits in the image). Writing the new plaintext
 * bytes into a ciphertext capture corrupts the slot: the first wire run of the
 * FW-V1 chain did exactly that and the part came back with garbage code bytes
 * that stalled every vendor wire.
 *
 * The fix is one line of algebra: the wire payload is the capture with
 *
 *     wire[off] := wire[off] XOR old_plain[off] XOR new_plain[off]
 *
 * per patched byte — the keystream cancels, because it is the same on both
 * sides. `conjugateCapture` below is that line. On the plaintext 2014 banks
 * the conjugation is its own identity (the staged payload IS the patched
 * plaintext); on the cipher families the wire-80 bytes are the STAGED form
 * derived from the patched plaintext and the build's key blocks
 * (`stagedFormOf`), because the commit's own two-stream transform — not the
 * host — produces the slot bytes.
 *
 * ---- The build table -------------------------------------------------------
 *
 * `BUILD_PATCH_PROFILES` is one entry per build whose patch is derived. Each
 * entry carries a `detect` hook (image properties only — shapes, key-block
 * values, the FF word-sum sentinel — never the version string alone: 1.3.0.8
 * and 1.3.0.8-FF report the same version), a shape-locating `locate` for its
 * sites, its staged form, its acceptance rule, its commit route and its
 * measured drain capability. `buildV1Patch` dispatches over the table; the
 * four-site 2014 table keeps its exact gates (and its pinned refusal order
 * for a foreign image). The 0.x line (FW-V1 doc 36: the eight 2014 Compact
 * builds 0.7.0.7..0.10.0.0 the widening chain reached) joins as eight
 * plaintext-family profiles of its own — the same widen tail as the 1.3.0.0
 * generation, a per-layout-group reader trio, and a per-build header version
 * word, because within a layout group the sibling builds are byte-identical
 * apart from their version identity.
 *
 * NEVER SHIP A HAND-ASSEMBLED PATCH: every site carries its `before` bytes and
 * the builder refuses to run if the factory plaintext does not match them, at
 * the offset the SHAPE search found. The Thumb lesson (doc 34 sec. 34.7) is
 * that LDRH's immediate scales by 2 and LDR's by 4 — three wrong encodings of
 * one edit were measured on the wire before the disassembler-backed builder
 * landed.
 */

import { bytesToHex, findAll, hexToBytes, hexUp, viewOf } from '../bytes.js';
import { SeekError } from '../errors.js';
import { parseImageHeader } from '../image/header.js';

/** The R16 xorshift128 generator, seeded [k1,k2,k3,k0], no whitening — the
 *  2016-donor at-rest form (`build_v1_patch.py keystream`). Only needed where
 *  the slot's key is known (the emulator's donor); the in-place wire patch
 *  itself never needs it, because the keystream cancels in the conjugation. */
export function keystream(
  keyWords: readonly [number, number, number, number],
  words: number,
): Uint32Array {
  const M = 0xffffffff;
  /* Local vars, not an array: the generator's rotations are fixed, and typed
   * index access keeps them numbers. */
  let s0 = keyWords[1];
  let s1 = keyWords[2];
  let s2 = keyWords[3];
  let s3 = keyWords[0];
  const out = new Uint32Array(words);
  for (let i = 0; i < words; i++) {
    const v1 = (s0 ^ ((s0 << 11) & M)) & M;
    s0 = s1;
    s1 = s2;
    const v2 = s3;
    s2 = v2;
    const v3 = (v2 ^ (v2 >>> 19) ^ v1 ^ (v1 >>> 8)) & M;
    s3 = v3;
    out[i] = v3;
  }
  return out;
}

/** XOR every 32-bit word with `ks`, except header words 128..143 (offsets
 *  0x200..0x23F), which are stored verbatim so the bootloader can read the
 *  length before it has a key. */
export function xorWindowVerbatim(image: Uint8Array, ks: Uint32Array): Uint8Array {
  const out = new Uint8Array(image.length);
  const dv = new DataView(image.buffer, image.byteOffset, image.byteLength);
  const ov = new DataView(out.buffer);
  const words = image.length >> 2;
  for (let i = 0; i < words; i++) {
    const w = dv.getUint32(i * 4, true);
    ov.setUint32(i * 4, i >= 0x80 && i <= 0x8f ? w : (w ^ (ks[i] ?? 0)) >>> 0, true);
  }
  /* A trailing partial word (images are word-multiple, but stay byte-exact). */
  for (let i = words * 4; i < image.length; i++) out[i] = (image[i] ?? 0) ^ 0;
  return out;
}

/** The 32-bit word sum the bootloader checks for 0 on the decrypted slot. */
export function wordSum(bytes: Uint8Array): number {
  const M = 0xffffffff;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let total = 0;
  const words = (bytes.length & ~3) >> 2;
  for (let i = 0; i < words; i++) total = (total + dv.getUint32(i * 4, true)) & M;
  return total >>> 0;
}

/** The plain u16 transfer checksum of the staged bytes (the wire's own gate). */
export function sum16(bytes: Uint8Array): number {
  let total = 0;
  for (const b of bytes) total = (total + b) & 0xffff;
  return total;
}

/** One instruction edit: raw offset in the decrypted image, the bytes that
 *  must already be there, the bytes that replace them. */
export interface PatchSite {
  readonly offset: number;
  readonly before: readonly number[];
  readonly after: readonly number[];
  readonly what: string;
}

/** The arm tail's cursor reset, as the widened reader needs it: every
 *  BeginFirmwareUpgrade mode branches into one tail that zeroes the cursor
 *  with `strh r5,[r4,#12]`. With the trio above the reader keeps the cursor
 *  as a WORD, so the halfword zero leaves its upper half standing: once a
 *  read carries past 0xFFFF (one full window, or the drain), every later arm
 *  serves that many 64 KiB pages up, and after the 4 MiB drain every read
 *  fails the limit check and stalls until a reboot (TESTING.md sec. 35.4;
 *  A/B on the emulator: the post-drain probe stalls without this site and
 *  reads the record with it). Every trio build carries the same tail, 0x12
 *  past its widen site. */
export const ARM_CURSOR_RESET_FROM_WIDEN = 0x12;
export const ARM_CURSOR_RESET_BEFORE: readonly number[] = [0xa5, 0x81];
export const ARM_CURSOR_RESET_AFTER: readonly number[] = [0xe5, 0x60];
const ARM_CURSOR_RESET_WHAT =
  'strh r5,[r4,#12] -> str r5,[r4,#12]: the arm tail zeroes the cursor as a HALFWORD, so ' +
  'with the trio widened a cursor past 0xFFFF keeps its upper half — every later arm serves ' +
  'pages up, and after the drain every read stalls. STR imm T1 0x60E5, imm5=3';

/** The 1.x site, at its fixed offset (VMA 0x1008412E = widen 0x3DB4 + 0x12). */
const ARM_CURSOR_RESET_2014: PatchSite = {
  offset: 0x3dc6,
  before: ARM_CURSOR_RESET_BEFORE,
  after: ARM_CURSOR_RESET_AFTER,
  what: `${ARM_CURSOR_RESET_WHAT} (VMA 0x1008412E)`,
};

/** Whether a committed patch carries the arm-tail cursor reset — by the site's
 *  own bytes, so a run state written before the site existed reads false. A
 *  part patched without it keeps a dead reader after the drain until it is
 *  power-cycled; one patched with it reads on. */
export function clearsArmCursor(
  sites: readonly { readonly before: readonly number[]; readonly after: readonly number[] }[],
): boolean {
  const same = (a: readonly number[], b: readonly number[]): boolean =>
    a.length === b.length && a.every((v, i) => v === b[i]);
  return sites.some(
    (site) =>
      same(site.before, ARM_CURSOR_RESET_BEFORE) && same(site.after, ARM_CURSOR_RESET_AFTER),
  );
}

/** The vma the raw image offsets map to (payload VMA = raw + 0x10080368). */
export const V1_PAYLOAD_VMA_BASE = 0x10080368;

/** The free header word that balances the plaintext sum: word 142, offset 0x238. */
export const REBALANCE_WORD_OFFSET = 142 * 4;

/** The five instruction sites of the 2014 builds (1.0.0.0 / 1.2.0.0 / 1.3.0.0). */
export const V1_2014_PATCH_SITES: readonly PatchSite[] = [
  {
    offset: 0x3db4,
    before: [0x4f, 0xf4, 0x80, 0x33],
    after: [0x4f, 0xf4, 0x80, 0x03],
    what:
      'mov.w r3,#0x10000 -> #0x400000 (VMA 0x1008411C): one constant feeds the d4 AND dc ' +
      'window-length stores — the wire-79 reader window becomes [0x14000000, 0x14400000)',
  },
  {
    offset: 0x3c1c,
    before: [0xa9, 0x89],
    after: [0xe9, 0x68],
    what:
      'ldrh r1,[r5,#12] -> ldr r1,[r5,#12] (VMA 0x10083F84): the wire-79 reader loads its ' +
      'd8 cursor as a HALFWORD, so reads wrap every 64 KiB. LDR imm T1 0x68E9, imm5=3 (offset 12)',
  },
  {
    offset: 0x3c68,
    before: [0xa2, 0x89],
    after: [0xe2, 0x68],
    what:
      'ldrh r2,[r4,#12] -> ldr r2,[r4,#12] (VMA 0x10083FD0): the cursor RE-load for the ' +
      'update step — still 16-bit, it truncated d8 at EVERY read even with the first site ' +
      'patched. LDR imm T1 0x68E2, imm5=3',
  },
  {
    offset: 0x3c70,
    before: [0xa3, 0x81],
    after: [0xe3, 0x60],
    what:
      'strh r3,[r4,#12] -> str r3,[r4,#12] (VMA 0x10083FD8): the matching halfword STORE ' +
      'of the advanced cursor. STR imm T1 0x60E3, imm5=3',
  },
  ARM_CURSOR_RESET_2014,
];

/* ==================================================================== *
 * the build table — families, site shapes, capabilities
 * ==================================================================== */

/** The three cipher/acceptance families the pipeline can drive. */
export type PreserveFamilyId = 'v1-2014' | 'v1-2014-ff' | 'compact-2016';

/** How the wire-80 staged bytes relate to the patched plaintext. */
export type StagedFormId = 'plain' | 'xor-ks0' | 'xor-ks0-ksD';

/** How (and whether) the RESTORE step can put the original bank back through
 *  the running app's own commit path.
 *
 *  - 'capture-verbatim': the 2014 plaintext chain — the capture IS the image,
 *    its stored word sum is 0, and the commit programs it as staged.
 *  - 'factory-staged': the 2016 cipher chain — the factory image ^ ks0
 *    satisfies the decrypted-sum-0 acceptance, and the commit's two-stream
 *    transform reproduces the original slot bytes.
 *  - 'none': NO staged form of the factory image passes the running app's
 *    acceptance while transforming back to the original slot bytes — the FF
 *    build: accept1 reads sum(P ^ ksD) and the factory carries 0xB7AB9D17
 *    there, not 0xFFFF (measured on the image), so the only payloads the app
 *    accepts land DIFFERENT bytes than the backup holds. The run ends with
 *    the delivered dump in hand and the patch in place. */
export type RestoreFormId = 'capture-verbatim' | 'factory-staged' | 'none';

/** Which bank the patch may be committed into. */
export type CommitRouteId = 'active-bank' | 'recovery-only';

/**
 * What the DRAIN step may promise on this build, as measured — never more.
 * `wholePart` false means the whole-part single-arm drain DOES NOT EXIST on
 * the build and the drain gate refuses; `losslessReadUnit` is the largest
 * wire-79 ask that does not silently lose bytes on it.
 */
export interface DrainCapability {
  readonly wholePart: boolean;
  readonly losslessReadUnit: number;
  /** The reach the widened window is proven byte-exact to, when it is bounded. */
  readonly maxPerArmReach?: number;
  /**
   * The widened mode-2 window serves the part from a ROTATED base on this
   * build: 0.7.0.7's mode-2 row shares mode 0's body — the boot-config walk
   * that arms the A/B slot the active-slot word does NOT name (the upgrade
   * target; measured slot B `0x14060000` with the donor's blank record, doc 36
   * secs. 36.4.2 and 36.10.3) — so a whole-part drain serves part[base:] and
   * then wraps through the NOR's own alias decode. The drain step computes the
   * base from the slot detection and UNROTATES before the delivered dump is
   * post-processed; the raw artifact is kept in part layout order so the
   * post-write == post-commit invariant holds on every build.
   */
  readonly rotation?: {
    readonly walk: 'upgrade-target';
    /** The base measured on the doc's donor: slot B with the blank record. */
    readonly measuredBase: number;
  };
  /**
   * Offsets that MUST be among the committed patch's sites before a mode-2
   * arm is safe: these builds' factory mode-2 row is the INDIRECT pair (`ldr
   * r3,=0x14000000; ldr r3,[r3,#0]`) — it arms the word stored AT 0x14000000
   * (the bootloader vector's initial SP), and an armed read walks off SRAM and
   * faults the guest (measured on 0.8.0.0: 32 KiB served, then
   * UC_ERR_READ_UNMAPPED; doc 36.3.1). The patch turns the dereference into a
   * nop, and the drain gate refuses a run whose recorded patch summary lacks
   * that site — the nop is applied to the image BEFORE any mode-2 arm is ever
   * sent, which is the patch step's ordering.
   */
  readonly modeTwoHazardSites?: readonly number[];
  readonly note: string;
}

/** The build's cipher key blocks, located BY VALUE (each occurs exactly once). */
export interface LocatedKeys {
  /** Key block 0 — seeds the wire-80 staged form (and the FF accept sum). */
  readonly block0Hex: string;
  /** Key block 1 — the at-rest slot seed; null on the plaintext families. */
  readonly block1Hex: string | null;
}

/** The four u32s a key block's hex seeds the xorshift128 with. */
export function keyWordsOf(keyHex: string): [number, number, number, number] {
  const raw = hexToBytes(keyHex);
  if (raw.length !== 16) {
    throw new SeekError('pipeline/refused', `a key block is 16 bytes, got ${String(raw.length)}`);
  }
  const dv = viewOf(raw);
  return [
    dv.getUint32(0, true),
    dv.getUint32(4, true),
    dv.getUint32(8, true),
    dv.getUint32(12, true),
  ];
}

/* ---- the shape needles -----------------------------------------------------
 *
 * Offsets move between builds (the guard sat at 0x352E in 1.0.3.0 and 0x3596
 * in 1.0.3.2); the bytes around them do not. Every site is FOUND by its shape
 * inside the update machinery — the function whose literal pool carries the
 * window ladder — and then gated on its before-bytes at the found offset.
 */

/** `14060000 14050000 14020000 14000000` — the head of the mode->window pool
 *  ladder every build here carries in BeginFirmwareUpgrade's literal pool.
 *  Exported for the cipher solvers (`solve.ts`), whose post-decrypt structural
 *  gates read the same RE-recorded shapes — one copy, so they cannot drift. */
export const NEEDLE_LADDER = '00000614000005140000021400000014';
/** The 2014-chain widen tail: `mov.w r3,#0x10000` feeding the d4 (+4) and
 *  dc (+12) stores (1.3.0.8, both variants). */
export const NEEDLE_WIDEN_2014 = '4ff480336360e360';
/** The 2016-chain widen tail: `str r3,[r4,#20]` / `mov.w r3,#0x10000` /
 *  `str r3,[r4,#8]` (d4) / `str r3,[r4,#16]` (dc) — also the 1.3.0.0
 *  generation's tail. */
export const NEEDLE_WIDEN_2016 = '63614ff48033a3602361';
/** The mode-2 guard: `cmp r3,#2` / `bne.n +6` / `movs r0,#4` (the refusal's
 *  first move). The patched byte is the `06 d1` at shape + 2. */
export const NEEDLE_GUARD = '022b06d10420';
/** The wire-82 token form's 16-byte constant — the ONE constant across the
 *  whole line (doc 33 sec. 11; doc 1032 sec. 3), carried by every build the
 *  table and the solvers name. */
export const NEEDLE_TOKEN_82 = '5316103180dd00b74af9e417c594bed4';
/** How far before the window ladder the Begin bodies sit (measured spans:
 *  guard->ladder 0x154, widen->ladder 0x4A..0x4C). */
export const CODE_WINDOW_BEFORE_LADDER = 0x800;
/** The Begin arm-tail ending: `mov r0,r5` / `pop {r4,r5,r6,pc}` — the return
 *  pair the tail's refresh call precedes. (The call's own bytes move with its
 *  call site, so the SHAPE is the tail; `tailHookCall` reads the BL before it
 *  and the callee it names.) */
const NEEDLE_TAIL = '284670bd';
/** `bx lr` — the stub callee that makes a tail hook harmless. */
const NEEDLE_BX_LR = '7047';

/** The FSM/op-mode struct 0x10003028: the one the 1.0.3.2 arm-tail refresh
 *  drives, whose state-2 dispatch wedges an accepting arm. */
const HOOK_WEDGE_STRUCT = 0x10003028;

function occurrences(plain: Uint8Array, hexNeedle: string, from = 0, to = plain.length): number[] {
  const needle = hexToBytes(hexNeedle);
  const hits: number[] = [];
  for (const at of findAll(plain, needle)) {
    if (at >= from && at + needle.length <= to) hits.push(at);
  }
  return hits;
}

function oneIn(
  plain: Uint8Array,
  hexNeedle: string,
  what: string,
  from = 0,
  to = plain.length,
): number {
  const hits = occurrences(plain, hexNeedle, from, to);
  const at = hits.at(0);
  if (hits.length !== 1 || at === undefined) {
    throw new SeekError(
      'pipeline/refused',
      `expected exactly one ${what} in this image and found ${String(hits.length)}`,
    );
  }
  return at;
}

/** The window ladder's offset, or null when this image carries none — the
 *  non-throwing form the detect hooks use. */
function findLadder(plain: Uint8Array): number | null {
  const hits = occurrences(plain, NEEDLE_LADDER);
  return hits.length === 1 ? (hits.at(0) ?? null) : null;
}

/** The window ladder's offset — the shape anchor for everything else. */
function ladderOffset(plain: Uint8Array): number {
  return oneIn(
    plain,
    NEEDLE_LADDER,
    'window-pool ladder head (14060000/14050000/14020000/14000000)',
  );
}

/** The guard site when this build carries one, at the found offset. */
function guardSite(plain: Uint8Array, ladder: number): PatchSite {
  const at = oneIn(
    plain,
    NEEDLE_GUARD,
    'mode-2 guard (cmp r3,#2 / bne.n +6 / movs r0,#4)',
    Math.max(0, ladder - CODE_WINDOW_BEFORE_LADDER),
    ladder,
  );
  return {
    offset: at + 2,
    before: [0x06, 0xd1],
    after: [0x06, 0xe0],
    what:
      'mode-2 guard: bne.n -> b.n at the cmp r3,#2 — mode 2 falls through to the ' +
      'normal validation and arms case 2 like any other mode',
  };
}

/** The 1.3.0.8-generation widen site, at the found offset. */
function widen2014Site(plain: Uint8Array, ladder: number): PatchSite {
  const at = oneIn(
    plain,
    NEEDLE_WIDEN_2014,
    'widen tail (mov.w r3,#0x10000; str [r4,#4]; str [r4,#12])',
    Math.max(0, ladder - CODE_WINDOW_BEFORE_LADDER),
    ladder,
  );
  return {
    offset: at,
    before: [0x4f, 0xf4, 0x80, 0x33],
    after: [0x4f, 0xf4, 0x80, 0x03],
    what:
      'widen: mov.w r3,#0x10000 -> #0x400000 — one constant feeds the d4 AND dc ' +
      'window-length stores, the wire-79 window becomes [0x14000000, 0x14400000)',
  };
}

/** The 2016-generation widen site, at the found offset. */
function widen2016Site(plain: Uint8Array, ladder: number): PatchSite {
  const at = oneIn(
    plain,
    NEEDLE_WIDEN_2016,
    'widen tail (str [r4,#20]; mov.w r3,#0x10000; str [r4,#8]; str [r4,#16])',
    Math.max(0, ladder - CODE_WINDOW_BEFORE_LADDER),
    ladder,
  );
  return {
    offset: at + 2,
    before: [0x4f, 0xf4, 0x80, 0x33],
    after: [0x4f, 0xf4, 0x80, 0x03],
    what:
      'widen: mov.w r3,#0x10000 -> #0x400000 — one constant feeds the d4 AND dc ' +
      'window-length stores, the wire-79 window becomes [0x14000000, 0x14400000)',
  };
}

/** Decodes the Thumb-2 BL at `off` to its target VMA, or null when the four
 *  bytes are not a BL pair. The payload VMA base applies — every call target
 *  here lives in that space. */
function blTargetVma(plain: Uint8Array, off: number): number | null {
  const hi = (plain[off] ?? 0) | ((plain[off + 1] ?? 0) << 8);
  const lo = (plain[off + 2] ?? 0) | ((plain[off + 3] ?? 0) << 8);
  if ((hi & 0xf800) !== 0xf000 || (lo & 0xd000) !== 0xd000) return null;
  const s = (hi >>> 10) & 1;
  const imm10 = hi & 0x3ff;
  const j1 = (lo >>> 13) & 1;
  const j2 = (lo >>> 11) & 1;
  const imm11 = lo & 0x7ff;
  const i1 = ~(j1 ^ s) & 1;
  const i2 = ~(j2 ^ s) & 1;
  let imm = ((s << 24) | (i1 << 23) | (i2 << 22) | (imm10 << 12) | (imm11 << 1)) >>> 0;
  if (s === 1) imm = imm - 0x2000000; /* sign-extend: bit 24 is the sign of the 25-bit field */
  return (V1_PAYLOAD_VMA_BASE + off + 4 + imm) >>> 0;
}

/**
 * The arm-tail hook call, when the build carries the WEDGING one: the Begin
 * tail `bl <refresh>; mov r0,r5; pop` whose callee drives the FSM/op-mode
 * struct 0x10003028 (the refresh an accepting arm fires, wedging the vendor
 * surface). Returns the call's offset, or null when this build's tail either
 * has no such call, calls a `bx lr` stub (the harmless tail), or calls a
 * refresh wired to a DIFFERENT struct — which is what 1.0.3.0 does: its
 * identical-looking callee reads 0x10003128 and never dispatches the mode
 * rebuild, so its arm completes and the hook needs no neutralizing.
 */
function tailHookCall(plain: Uint8Array, ladder: number): number | null {
  for (const at of inBeginWindow(plain, NEEDLE_TAIL, ladder)) {
    const call = at - 4;
    if (call < 0) continue;
    const calleeVma = blTargetVma(plain, call);
    if (calleeVma === null) continue;
    const callee = calleeVma - V1_PAYLOAD_VMA_BASE;
    if (callee < 0 || callee + 0x20 > plain.length) continue;
    /* A `bx lr` stub callee: the harmless tail (and the shape doc 1032's
     * Site C names for 1.0.3.0's sibling address). */
    if (occurrences(plain, NEEDLE_BX_LR, callee, callee + 2).length === 1) return null;
    /* The refresh function's `ldr r3,=struct` literal sits at callee + 0x18
     * (both measured callees: same prologue, 4-byte aligned, pc + 20). */
    const literal = viewOf(plain).getUint32(callee + 0x18, true);
    return literal === HOOK_WEDGE_STRUCT ? call : null;
  }
  return null;
}

/** Whether the build needs the hook neutralized (the 1.0.3.2 wedge). */
function tailHookApplies(plain: Uint8Array, ladder: number): boolean {
  return tailHookCall(plain, ladder) !== null;
}

/** The hook site, when the build needs it neutralized (1.0.3.2 only). The
 *  `before` bytes are the call's own — a BL encoding moves with its call
 *  site, so they are read from the image the shape just located. */
function tailHookSite(plain: Uint8Array, ladder: number): PatchSite | null {
  const call = tailHookCall(plain, ladder);
  if (call === null) return null;
  return {
    offset: call,
    before: [plain[call] ?? 0, plain[call + 1] ?? 0, plain[call + 2] ?? 0, plain[call + 3] ?? 0],
    after: [0x00, 0xbf, 0x00, 0xbf],
    what:
      'arm-tail hook: bl <fsm rebuild> -> nop;nop — the 1.0.3.2 builds wired a real ' +
      'FSM/op-mode refresh into the arm tail and an accepting arm wedges the vendor ' +
      'surface (1.0.3.0’s same-shaped call drives a different struct and is harmless)',
  };
}

/* ---- the key blocks, found by value ---------------------------------------- */

/** The build line's key pairs, by value. Shared with the cipher solvers
 *  (`solve.ts`): a decrypted capture vouches for itself by carrying exactly
 *  one of these pairs, and the at-rest stream is then recomputed from the
 *  FOUND blocks. Exported so the pair table stays single-sourced. */
export const KEY_PAIRS = {
  /** 1.3.0.8-FF (the R16-shaped 0xFFFF build): ks0/ksD seeds. */
  ff1308: {
    block0: '5d7984797c47eb9354fa35898ab11701',
    block1: 'b5541579754be4b33b6f1ba975a8badc',
  },
  /** The 1.0.3.0 / 1.0.3.2 9 Hz pair (the SAME pair across those builds). */
  cp103: {
    block0: '67a3ea21824fecc4b3c3b0a8da514669',
    block1: 'faacb3c6f1412469bd122fb82d78160d',
  },
  /** The 1.0.3.2 18 Hz FF pair (new to the record; proven on the wire) — and
   *  the 1.0.3.0-FF build's pair, measured the same (doc 1032 sec. 3). */
  cp1032ff: {
    block0: '58d6abe5a94e4de650ae3a84f9f8f281',
    block1: '6da05a33f540100034e2c8947d05708c',
  },
} as const;

/** Finds a key pair BY VALUE — each half must occur exactly once — or null. */
function findKeyPair(
  plain: Uint8Array,
  pair: { readonly block0: string; readonly block1: string } | null,
): LocatedKeys | null {
  if (pair === null) return null;
  for (const half of [pair.block0, pair.block1]) {
    if (occurrences(plain, half).length !== 1) return null;
  }
  return { block0Hex: pair.block0, block1Hex: pair.block1 };
}

function requireKeys(pair: LocatedKeys | null): LocatedKeys {
  if (pair === null) {
    throw new SeekError(
      'pipeline/refused',
      'this build key blocks were not found by value (each must occur exactly once)',
    );
  }
  return pair;
}

/* ---- the 0.x line (the 2014 Compact builds the widening reached) -------------
 *
 * FW-V1 doc 36 derived and emulator-proved the widening chain down the 2014
 * Compact line: stage 1 (0.8.0.0, 0.9.0.2, 0.9.0.6, 0.9.0.7, 0.9.1.0,
 * 0.10.0.0) and stage 2 (0.7.0.7, 0.7.0.8). Every build of the line is the
 * plaintext chain — word sum 0, banks stored as-is, no key material anywhere —
 * so the family is `v1-2014` for all of them: the identity solve owns their
 * captures, the staged form is the conjugated capture, and the restore puts
 * the capture back verbatim. What the line ADDS is three things the 1.x table
 * never needed: a wire-88 reader (0.7.x), a rotated mode-2 window (0.7.0.7),
 * and a mode-2 row that is a crash hazard until the patch lands (0.8.0.0,
 * 0.7.0.8).
 *
 * THE SITES, AND WHY THEY LOCATE THE WAY THEY DO. Every build carries the
 * same widen tail as the 1.3.0.0 generation — `str r3,[r4,#20]; mov.w
 * r3,#0x10000; str r3,[r4,#8]; str r3,[r4,#16]` — EXACTLY ONCE per image
 * (byte-verified across the whole corpus line), and the reader trio sits at a
 * fixed offset FROM it, per layout group. The three 2-byte trio encodings are
 * not unique in an image, so a trio site is located as "the widen tail's
 * offset plus this build's measured delta", and every site is then gated on
 * its `before` bytes — a foreign image refuses at the gate, never patches
 * blind. The builds within a layout group differ by NOTHING structural (0.9.0.7
 * and 1.0.0.0 are byte-identical apart from their version identity: 18 bytes
 * of header word, version strings and build timestamps), so the last gate —
 * and the only one that can tell siblings apart — is the header's own version
 * word at 0x20c. That is still an image property, not a wire report, and it
 * never travels alone: every structural gate runs first.
 */

/** `ldr r3,[pc,#0xbc]; ldr r3,[r3,#0]` — the INDIRECT mode-2 body of
 *  0.8.0.0 and 0.7.0.8: the case loads the ADDRESS 0x14000000 from its pool
 *  and then dereferences it, arming the word stored there (the bootloader
 *  vector's initial SP — not a flash window, and a crash under an armed
 *  read). Occurs exactly once in each of the two builds, and in NO build
 *  whose mode 2 is direct. */
const NEEDLE_MODE2_INDIRECT = '2f4b1b68';

/** The reader trio's halfword encodings, and their 32-bit replacements. */
const TRIO_BEFORE: readonly (readonly number[])[] = [
  [0xa9, 0x89],
  [0xa2, 0x89],
  [0xa3, 0x81],
];
const TRIO_AFTER: readonly (readonly number[])[] = [
  [0xe9, 0x68],
  [0xe2, 0x68],
  [0xe3, 0x60],
];

/** Trio offsets FROM the widen site, per layout group (measured, doc 36.3.2
 *  and 36.5). Groups A and B differ by 16 bytes of code between the reader
 *  and the Begin tail; 0.7.0.7's own layout is the one its unaligned widen
 *  sits in. */
const TRIO_LAYOUT_A = [
  -0x198, -0x14c, -0x144,
] as const; /* 0.9.0.2/0.9.0.6/0.9.0.7/0.9.1.0/0.10.0.0 */
const TRIO_LAYOUT_B = [-0x1a8, -0x15c, -0x154] as const; /* 0.8.0.0 / 0.7.0.8 */
const TRIO_LAYOUT_C = [-0x1a2, -0x156, -0x14e] as const; /* 0.7.0.7 */

/** The header version words of the CLOSED 1.x builds (little-endian, as
 *  stored: bytes 01 03 00 00 -> 0x00000301 -> "1.3.0.0") — what keeps
 *  `V1_2014_PROFILE` and the 0.9.0.7 profile (byte-identical siblings:
 *  same length, same sites, same before bytes) from both matching. */
const V1_2014_VERSION_WORDS: readonly number[] = [0x00000001, 0x00000201, 0x00000301];

/** The image's own header version word at 0x20c (`image_header_t.version`),
 *  or null when the image is too small to carry one. */
function headerVersionOf(plain: Uint8Array): number | null {
  if (plain.length < 0x210) return null;
  return viewOf(plain).getUint32(0x20c, true);
}

/** The widen site for a 0.x build: the unique tail's mov.w, at tail + 2. */
function widen0xSite(plain: Uint8Array): PatchSite {
  const at = oneIn(
    plain,
    NEEDLE_WIDEN_2016,
    'widen tail (str [r4,#20]; mov.w r3,#0x10000; str [r4,#8]; str [r4,#16])',
  );
  return {
    offset: at + 2,
    before: [0x4f, 0xf4, 0x80, 0x33],
    after: [0x4f, 0xf4, 0x80, 0x03],
    what:
      'widen: mov.w r3,#0x10000 -> #0x400000 — one constant feeds the d4 AND dc ' +
      'window-length stores, the reader window becomes [0x14000000, 0x14400000)',
  };
}

/** The reader trio at its widen-relative offsets, before-byte gated. */
function trio0xSites(widenAt: number, layout: readonly number[]): PatchSite[] {
  const what = [
    'ldrh r1,[r5,#12] -> ldr r1,[r5,#12]: the reader loads its d8 cursor as a HALFWORD, so reads wrap every 64 KiB',
    'ldrh r2,[r4,#12] -> ldr r2,[r4,#12]: the cursor RE-load for the update step — still 16-bit, it truncated d8 at EVERY read',
    'strh r3,[r4,#12] -> str r3,[r4,#12]: the matching halfword STORE of the advanced cursor',
  ];
  return layout.map((delta, i) => {
    const before = TRIO_BEFORE[i] ?? [];
    const after = TRIO_AFTER[i] ?? [];
    return {
      offset: widenAt + delta,
      before,
      after,
      what: `${what[i] ?? ''} (LDR/STR imm T1, imm5=3, located widen${delta < 0 ? ' -' : ' +'} 0x${Math.abs(
        delta,
      ).toString(16)})`,
    };
  });
}

/** The arm tail's cursor reset for a 0.x build, at widen + 0x12 (the same
 *  tail as the 1.x line; checked on every corpus image of the line). */
function armCursorReset0xSite(widenAt: number): PatchSite {
  return {
    offset: widenAt + ARM_CURSOR_RESET_FROM_WIDEN,
    before: ARM_CURSOR_RESET_BEFORE,
    after: ARM_CURSOR_RESET_AFTER,
    what: `${ARM_CURSOR_RESET_WHAT} (located widen + 0x${ARM_CURSOR_RESET_FROM_WIDEN.toString(16)})`,
  };
}

/** The mode-2 indirect->direct nop, at its unique shape. */
function mode2DerefSite(plain: Uint8Array): PatchSite {
  const at = oneIn(
    plain,
    NEEDLE_MODE2_INDIRECT,
    'indirect mode-2 body (ldr r3,=0x14000000; ldr r3,[r3,#0])',
  );
  return {
    offset: at + 2,
    before: [0x1b, 0x68],
    after: [0x00, 0xbf],
    what:
      'mode-2 indirection: ldr r3,[r3,#0] -> nop — the factory case arms *(0x14000000) (the ' +
      'bootloader vector SP, not a flash window; an armed read walks off SRAM and faults the ' +
      'guest) and the nop leaves r3 = 0x14000000, arming the bootloader block directly',
  };
}

interface ZeroXSpec {
  readonly buildId: string;
  readonly label: string;
  /** The header version word at 0x20c — the ONLY gate that can tell the
   *  byte-identical siblings of one layout group apart. */
  readonly versionWord: number;
  readonly layout: readonly number[];
  /** The indirect mode-2 body, and the nop that makes it safe. */
  readonly extra: boolean;
  readonly capability: DrainCapability;
}

function zeroXProfile(spec: ZeroXSpec): BuildPatchProfile {
  const detect = (plain: Uint8Array): boolean => {
    if (headerVersionOf(plain) !== spec.versionWord) return false;
    if (occurrences(plain, NEEDLE_WIDEN_2016).length !== 1) return false;
    if (occurrences(plain, NEEDLE_MODE2_INDIRECT).length !== (spec.extra ? 1 : 0)) return false;
    const widenAt = (occurrences(plain, NEEDLE_WIDEN_2016)[0] ?? 0) + 2;
    return spec.layout.every((delta, i) => {
      const before = TRIO_BEFORE[i] ?? [];
      return before.every((b, j) => (plain[widenAt + delta + j] ?? -1) === b);
    });
  };
  return {
    buildId: spec.buildId,
    family: 'v1-2014',
    label: spec.label,
    detect,
    locate: (plain) => {
      const widen = widen0xSite(plain);
      const sites = [
        widen,
        ...trio0xSites(widen.offset, spec.layout),
        armCursorReset0xSite(widen.offset),
      ];
      return spec.extra ? [...sites, mode2DerefSite(plain)] : sites;
    },
    keysOf: () => null,
    stagedForm: 'plain',
    restoreForm: 'capture-verbatim',
    acceptanceSum: 0,
    route: 'active-bank',
    routeNote: null,
    capability: spec.capability,
  };
}

/* ---- the 0.x capability lines, as measured (doc 36.4) ---------------------- */

const ZERO_X_PROVEN =
  'EMULATOR-PROVEN ONLY: this line was derived and measured on the emulator against the ' +
  'plaintext 1.3.0.0 donor (doc 36.3.3); no native flash dump of any of these builds exists, ' +
  'so the first hardware run is the first silicon evidence.';

/** The arm tail's cursor reset joined the 0.x patch after doc 36's runs, so
 *  every sha doc 36 measured is the four-site set's. */
const ZERO_X_FIFTH_SITE =
  'The patch also carries the arm tail’s cursor reset, without which ' +
  'the drain leaves the reader dead until a power cycle; doc 36’s shas are the four-site ' +
  'set’s, and the five-site set is re-proven in place on the emulator on each layout’s ' +
  'representative (0.9.0.7, 0.8.0.0, 0.7.0.7).';

const PLAIN_0X_CAPABILITY = (drainSha: string): DrainCapability => ({
  wholePart: true,
  losslessReadUnit: 64,
  note:
    'one widened-window arm drains the whole 4 MiB part (doc 36.4, four-site: full in-place — ' +
    'commit 0x0, exactly the patch bytes vs as-booted, 0-diff restore, factory reader back; ' +
    `in-place drain sha256 ${drainSha}…); the stock cap is exactly 65,536 B per arm; ` +
    'byte-exact at the 64-byte ask. 13 bytes move (word 142 = 0x50C06240). ' +
    `${ZERO_X_FIFTH_SITE} ${ZERO_X_PROVEN}`,
});

/* ---- the 0.x profiles themselves ------------------------------------------- */

/** The eight 2014 Compact builds doc 36 reached, in wire order. */
const ZERO_X_PROFILES: readonly BuildPatchProfile[] = [
  zeroXProfile({
    buildId: 'compact-0.7.0.7',
    label: 'Compact 0.7.0.7',
    versionWord: 0x07000700,
    layout: TRIO_LAYOUT_C,
    extra: false,
    capability: {
      wholePart: true,
      losslessReadUnit: 64,
      rotation: { walk: 'upgrade-target', measuredBase: 0x14060000 },
      note:
        'the reader answers on WIRE 88, not 79 (0x4F stalls; doc 36.5.0), and the widened ' +
        'mode-2 window serves the part ROTATED: mode 2 shares mode 0’s boot-config walk ' +
        'and arms the A/B slot the active-slot word does not name (slot B 0x14060000 on the ' +
        'donor’s blank record) — the drain unrotates before delivery. Full in-place ' +
        'proven including the boot-back (ip1–ip4 green, doc 36.4.2, four-site: in-place ' +
        'drain sha 5e1b5db4… at the rotated offsets, restore 0-diff, factory window exact on ' +
        'the rotated compare). 10 bytes move (word 142 = 0x0000B300). ' +
        `${ZERO_X_FIFTH_SITE} ${ZERO_X_PROVEN}`,
    },
  }),
  zeroXProfile({
    buildId: 'compact-0.7.0.8',
    label: 'Compact 0.7.0.8',
    versionWord: 0x08000700,
    layout: TRIO_LAYOUT_B,
    extra: true,
    capability: {
      wholePart: true,
      losslessReadUnit: 64,
      modeTwoHazardSites: [0x3bac],
      note:
        'the reader answers on WIRE 88, not 79 (0x4F stalls; doc 36.5.0); the factory mode 2 ' +
        'is the INDIRECT pair — it arms *(0x14000000) and serves 0 B (measured) — so the nop ' +
        'site is part of the patch and MUST be committed before any mode-2 arm (15 bytes ' +
        'move). Full in-place through ip3 (doc 36.4.2, four-site: in-place drain sha ' +
        '18649ea1…, restore 0-diff); the ip4 boot-back stage is OPEN — it died on transport ' +
        'timeouts, not on the patch (doc 36.10 item 5) — everything it would check is proven ' +
        `on the siblings. ${ZERO_X_FIFTH_SITE} ${ZERO_X_PROVEN}`,
    },
  }),
  zeroXProfile({
    buildId: 'compact-0.8.0.0',
    label: 'Compact 0.8.0.0',
    versionWord: 0x00000800,
    layout: TRIO_LAYOUT_B,
    extra: true,
    capability: {
      wholePart: true,
      losslessReadUnit: 64,
      modeTwoHazardSites: [0x3ce4],
      note:
        'the factory mode 2 is the INDIRECT pair: it arms *(0x14000000) — the bootloader ' +
        'vector’s initial SP — and an armed read served 32 KiB of SRAM and then faulted ' +
        'the guest (measured, doc 36.3.1): the nop site is part of the patch and MUST be ' +
        'committed before any mode-2 arm (15 bytes move). Full in-place through ip3 (doc ' +
        '36.4.2, four-site: in-place drain sha c82556c1…, restore 0-diff); the ip4 boot-back ' +
        'stage is OPEN on transport timeouts (doc 36.10 item 5) — everything it would check ' +
        `is proven on the siblings. ${ZERO_X_FIFTH_SITE} ${ZERO_X_PROVEN}`,
    },
  }),
  zeroXProfile({
    buildId: 'compact-0.9.0.2',
    label: 'Compact 0.9.0.2',
    versionWord: 0x02000900,
    layout: TRIO_LAYOUT_A,
    extra: false,
    capability: PLAIN_0X_CAPABILITY('3bd923c2e65a467b'),
  }),
  zeroXProfile({
    buildId: 'compact-0.9.0.6',
    label: 'Compact 0.9.0.6',
    versionWord: 0x06000900,
    layout: TRIO_LAYOUT_A,
    extra: false,
    capability: PLAIN_0X_CAPABILITY('d34497c0c45afd20'),
  }),
  zeroXProfile({
    buildId: 'compact-0.9.0.7',
    label: 'Compact 0.9.0.7',
    versionWord: 0x07000900,
    layout: TRIO_LAYOUT_A,
    extra: false,
    capability: PLAIN_0X_CAPABILITY('ad37c52f633caec9'),
  }),
  zeroXProfile({
    buildId: 'compact-0.9.1.0',
    label: 'Compact 0.9.1.0',
    versionWord: 0x00010900,
    layout: TRIO_LAYOUT_A,
    extra: false,
    capability: PLAIN_0X_CAPABILITY('0630ac9ee9f9eb1c'),
  }),
  zeroXProfile({
    buildId: 'compact-0.10.0.0',
    label: 'Compact 0.10.0.0',
    versionWord: 0x00000a00,
    layout: TRIO_LAYOUT_A,
    extra: false,
    capability: PLAIN_0X_CAPABILITY('62618426fe08ebcb'),
  }),
];

/* ---- the profiles ----------------------------------------------------------- */

/**
 * One build (or one build generation) whose widening patch is derived. `detect`
 * reads IMAGE PROPERTIES only — the version string alone must never select a
 * patch (1.3.0.8 and 1.3.0.8-FF report the same version; they are told apart
 * by the 0xFFFF word-sum sentinel and the key blocks).
 */
export interface BuildPatchProfile {
  readonly buildId: string;
  readonly family: PreserveFamilyId;
  /** The name the plan print shows. */
  readonly label: string;
  readonly detect: (plain: Uint8Array) => boolean;
  /** The sites at their located offsets, before-byte gated (throws). */
  readonly locate: (plain: Uint8Array) => readonly PatchSite[];
  readonly keysOf: (plain: Uint8Array) => LocatedKeys | null;
  readonly stagedForm: StagedFormId;
  readonly restoreForm: RestoreFormId;
  /** The content-acceptance constant of the family: 0 for a word-sum-0 gate,
   *  0xFFFF for the FF build's collapsed staged-form gate. */
  readonly acceptanceSum: number;
  readonly route: CommitRouteId;
  readonly routeNote: string | null;
  readonly capability: DrainCapability;
  /** True when the build's OWN arm tail already zeroes the reader's whole
   *  cursor word, so the drain leaves the reader readable on its boot without
   *  a site for it (`armResetsCursor`). Read from the image, never assumed. */
  readonly stockArmResetsCursor?: (plain: Uint8Array) => boolean;
}

const PLAIN_BANK_CAPABILITY: DrainCapability = {
  wholePart: true,
  losslessReadUnit: 64,
  note:
    'one widened-window arm drains the whole 4 MiB part; the unpatched budget is 64 KiB ' +
    'per arm and the reader budget is consumed in asks — byte-exact at the 64-byte ask ' +
    '(one EP0 packet, serve == ask)',
};

const CIPHER_2016_CAPABILITY: DrainCapability = {
  wholePart: true,
  losslessReadUnit: 64,
  note:
    'the whole 4 MiB drained in one session on this build (doc 33 sec. 11, in-place route ' +
    're-verified 2026-10-01); byte-exact at the 64-byte ask',
};

function matchesAt(plain: Uint8Array, site: PatchSite): boolean {
  for (let i = 0; i < site.before.length; i++) {
    if (plain[site.offset + i] !== site.before[i]) return false;
  }
  return true;
}

function inBeginWindow(plain: Uint8Array, hexNeedle: string, ladder: number): number[] {
  const from = Math.max(0, ladder - CODE_WINDOW_BEFORE_LADDER);
  return occurrences(plain, hexNeedle, from, ladder);
}

/** The shared 2016 shape test: one ladder, one guard, one widen — all inside
 *  the Begin window. Non-throwing, for the detect hooks. */
function detect2016Shapes(plain: Uint8Array): boolean {
  const ladder = findLadder(plain);
  if (ladder === null) return false;
  return (
    inBeginWindow(plain, NEEDLE_GUARD, ladder).length === 1 &&
    inBeginWindow(plain, NEEDLE_WIDEN_2016, ladder).length === 1
  );
}

/** The five-site 2014 chain (1.0.0.0 / 1.2.0.0 / 1.3.0.0): widen + the halfword
 *  reader trio at the doc-34 offsets + the arm tail's cursor reset, word-sum-0
 *  acceptance, plaintext banks.
 *  The detect carries the header's version word (the closed 1.x set) because
 *  the 0.x line's 0.9.0.7 carries the SAME five sites at the SAME offsets with
 *  the SAME before bytes — the two builds are byte-identical apart from their
 *  version identity — and two matching profiles is a refusal, never a guess. */
const V1_2014_PROFILE: BuildPatchProfile = {
  buildId: 'v1-2014',
  family: 'v1-2014',
  label: 'Compact 1.x firmware (2014)',
  detect: (plain) =>
    V1_2014_VERSION_WORDS.includes(headerVersionOf(plain) ?? -1) &&
    V1_2014_PATCH_SITES.every((site) => matchesAt(plain, site)),
  locate: (plain) =>
    V1_2014_PATCH_SITES.map((site) => {
      if (!matchesAt(plain, site)) {
        throw new SeekError(
          'pipeline/refused',
          `bytes at raw ${hexUp(site.offset)} are not the expected ` +
            `${bytesToHex(Uint8Array.from(site.before))} — this image does not carry the ` +
            `v1 2014 update machinery this patch was derived from (${site.what})`,
        );
      }
      return site;
    }),
  keysOf: () => null,
  stagedForm: 'plain',
  restoreForm: 'capture-verbatim',
  acceptanceSum: 0,
  route: 'active-bank',
  routeNote: null,
  capability: PLAIN_BANK_CAPABILITY,
};

/** Compact 1.3.0.8 8 Hz — the 2014 chain with the 2017 compiler's widened
 *  cursor: ONE site (the widen; no guard — mode 2 arms with the token — and
 *  the reader trio does not exist in this build), word-sum-0 acceptance,
 *  plaintext banks (doc 35.2). */
const COMPACT_1308_8HZ_PROFILE: BuildPatchProfile = {
  buildId: 'compact-1.3.0.8-8hz',
  family: 'v1-2014',
  label: 'Compact 1.3.0.8 (8 Hz, insecure)',
  detect: (plain) => {
    if (wordSum(plain) !== 0) return false;
    if (V1_2014_PROFILE.detect(plain)) return false; /* the trio builds keep their table */
    if (findKeyPair(plain, KEY_PAIRS.ff1308) !== null) return false; /* that is the FF build */
    const ladder = findLadder(plain);
    if (ladder === null) return false;
    /* Exactly one widen, and NO guard (doc 35.2.1). */
    return (
      inBeginWindow(plain, NEEDLE_WIDEN_2014, ladder).length === 1 &&
      inBeginWindow(plain, NEEDLE_GUARD, ladder).length === 0
    );
  },
  locate: (plain) => [widen2014Site(plain, ladderOffset(plain))],
  keysOf: () => null,
  stagedForm: 'plain',
  restoreForm: 'capture-verbatim',
  acceptanceSum: 0,
  route: 'active-bank',
  routeNote: null,
  capability: PLAIN_BANK_CAPABILITY,
};

/** Compact 1.3.0.8-FF 16 Hz — the R16-shaped 0xFFFF build: guard + widen, and
 *  a TWO-KEYSTREAM staged form S = P ^ ks0 ^ ksD whose double accept collapses
 *  to sum(S ^ ks0) == 0xFFFF. The 2014 bootloader rejects sum-not-0 images at
 *  A/B and boots recovery unchecked, so the route is the RECOVERY slot only
 *  (mode 9) (doc 35.3). */
const COMPACT_1308_FF_PROFILE: BuildPatchProfile = {
  buildId: 'compact-1.3.0.8-ff',
  family: 'v1-2014-ff',
  label: 'Compact 1.3.0.8 FF (16 Hz)',
  detect: (plain) => {
    if (wordSum(plain) !== 0xffff) return false; /* the 0xFFFF sentinel */
    if (findKeyPair(plain, KEY_PAIRS.ff1308) === null) return false;
    const ladder = findLadder(plain);
    if (ladder === null) return false;
    return (
      inBeginWindow(plain, NEEDLE_WIDEN_2014, ladder).length === 1 &&
      inBeginWindow(plain, NEEDLE_GUARD, ladder).length === 1
    );
  },
  locate: (plain) => {
    const ladder = ladderOffset(plain);
    return [guardSite(plain, ladder), widen2014Site(plain, ladder)];
  },
  keysOf: (plain) => requireKeys(findKeyPair(plain, KEY_PAIRS.ff1308)),
  stagedForm: 'xor-ks0-ksD',
  restoreForm: 'none',
  acceptanceSum: 0xffff,
  route: 'recovery-only',
  routeNote:
    'the 2014 bootloader does not take this build’s check sum in slot A or B, and starts ' +
    'recovery R (0x14070000) without checking it, so the patch is written into recovery R and ' +
    'nowhere else',
  capability: {
    wholePart: true,
    losslessReadUnit: 64,
    note:
      'commit + whole-part drain proven through the recovery route (doc 35.3.3: commit 0x0, ' +
      '4 MiB on one arm, dump == post-commit, 6 patch bytes vs as-booted); the IN-PLACE ' +
      'variant is derived, not yet run — this run does not promise it',
  },
};

/**
 * The 2016 arm tail, right after its widen tail (widen site + 0x0C):
 * `movs r5,#0; str r3,[r4,#24]; movs r3,#8; str r5,[r4,#4]; str r5,[r4,#12]`
 * (read from the 1.0.3.0 image at 0x3642). The last store zeroes the reader's
 * cursor (+12) as a WORD — the very instruction the 2014 trio builds need
 * their fifth site for (`ARM_CURSOR_RESET_AFTER`, `e5 60`). With it every arm
 * restarts the widened reader from 0, so after the 4 MiB drain the next arm
 * reads again on the same boot and no replug is owed (sec. 35.4's dead reader
 * was the halfword reset's).
 */
const ARM_TAIL_2016_FROM_WIDEN = 0x0c;
const ARM_TAIL_2016: readonly number[] = [
  0x00, 0x25, 0xa3, 0x61, 0x08, 0x23, 0x65, 0x60, 0xe5, 0x60,
];

function armTail2016ResetsCursor(plain: Uint8Array): boolean {
  const widen = widen2016Site(plain, ladderOffset(plain));
  return hasBytesAt(plain, widen.offset + ARM_TAIL_2016_FROM_WIDEN, ARM_TAIL_2016);
}

/** Compact Pro 1.0.3.0 — the 2016 cipher chain: TWO sites (guard + widen),
 *  staged = plain ^ ks(block 0), acceptance = DECRYPTED word sum 0 (doc 33
 *  sec. 11). The arm-tail hook is a `bx lr` stub here and needs no site, and
 *  the arm tail already zeroes the whole cursor word (`ARM_TAIL_2016`). */
const CP_1030_PROFILE: BuildPatchProfile = {
  buildId: 'compact-pro-1.0.3.0',
  family: 'compact-2016',
  label: 'Compact Pro 1.0.3.0 (9 Hz)',
  /* The shapes are checked first: they are what guarantees the ladder the
   * hook test reads through exists. */
  detect: (plain) =>
    detect2016Shapes(plain) &&
    findKeyPair(plain, KEY_PAIRS.cp103) !== null &&
    !tailHookApplies(plain, ladderOffset(plain)),
  locate: (plain) => {
    const ladder = ladderOffset(plain);
    return [guardSite(plain, ladder), widen2016Site(plain, ladder)];
  },
  keysOf: (plain) => requireKeys(findKeyPair(plain, KEY_PAIRS.cp103)),
  stagedForm: 'xor-ks0',
  restoreForm: 'factory-staged',
  acceptanceSum: 0,
  route: 'active-bank',
  routeNote: null,
  capability: CIPHER_2016_CAPABILITY,
  stockArmResetsCursor: armTail2016ResetsCursor,
};

/** Compact Pro 1.0.3.2 (both variants): the 1.0.3.0 sites PLUS the arm-tail
 *  hook nop (the 1.0.3.2 builds call a real FSM refresh there and an accepting
 *  arm wedges the vendor surface), and HARD drain limits: no whole-part
 *  single-arm drain exists (doc 1032 sec. 2/5). */
function cp1032Profile(
  buildId: string,
  label: string,
  keys: { readonly block0: string; readonly block1: string },
  maxPerArmReach: number,
): BuildPatchProfile {
  return {
    buildId,
    family: 'compact-2016',
    label,
    detect: (plain) =>
      detect2016Shapes(plain) &&
      findKeyPair(plain, keys) !== null &&
      tailHookApplies(plain, ladderOffset(plain)),
    locate: (plain) => {
      const ladder = ladderOffset(plain);
      const sites = [guardSite(plain, ladder), widen2016Site(plain, ladder)];
      const hook = tailHookSite(plain, ladder);
      return hook === null ? sites : [...sites, hook];
    },
    keysOf: (plain) => requireKeys(findKeyPair(plain, keys)),
    stagedForm: 'xor-ks0',
    restoreForm: 'factory-staged',
    acceptanceSum: 0,
    route: 'active-bank',
    routeNote: null,
    capability: {
      wholePart: false,
      losslessReadUnit: 128,
      maxPerArmReach,
      note:
        'no whole-part single-arm drain exists on this build: 128 B is the lossless read ' +
        'unit (larger asks silently lose bytes), the EP0 sessions die at ~64-81 KB and the ' +
        'upgrade descriptors reset on re-enumeration, and the widened reach is proven ' +
        `byte-exact only to 0x${maxPerArmReach.toString(16)}. This run supports backup, ` +
        'patch, commit, restore and verify — the whole-part dump is not one of them ' +
        '(doc 1032 sec. 5).',
    },
  };
}

/** The table, most specific first. Every pair of detects is mutually
 *  exclusive by image properties; two matches is a refusal, never a guess. */
export const BUILD_PATCH_PROFILES: readonly BuildPatchProfile[] = [
  cp1032Profile(
    'compact-pro-1.0.3.2-18hzff',
    'Compact Pro 1.0.3.2 FF (18 Hz)',
    KEY_PAIRS.cp1032ff,
    0x17500,
  ),
  cp1032Profile('compact-pro-1.0.3.2-9hz', 'Compact Pro 1.0.3.2 (9 Hz)', KEY_PAIRS.cp103, 0x13c00),
  CP_1030_PROFILE,
  COMPACT_1308_FF_PROFILE,
  COMPACT_1308_8HZ_PROFILE,
  ...ZERO_X_PROFILES,
  V1_2014_PROFILE,
];

/* ---- known derivations: a factory image with a balanced edit of its own ------
 *
 * A slot does not always hold a factory image. The bench Compact (a PN297
 * board) runs the Compact PRO 1.0.3.0 image, which reboots on any board but
 * 603 and 714, so its banks carry a board patch (`scripts/patch-dump.mjs`):
 * eight bytes of app_init's board switch, with the adjust word at 0x238
 * retuned so the acceptance sum does not move. That word is the one this
 * builder balances through, so on such an image it is not free, and it must
 * not be treated as if it were: its value is the edit's balance.
 *
 * A DERIVATION names one such edit against one build. The image is taken as
 * that derivation only when every part of it checks out, exactly:
 *  - the edit's after-bytes sit at its offset;
 *  - putting the before-bytes back and taking the edit's drift out of the
 *    adjust word leaves that word at 0, the factory value (the whole word is
 *    the edit's balance and nothing else's);
 *  - the build table detects the image that comes back as exactly the build
 *    the edit was written against (shapes, key blocks, hook), and nothing else.
 * Anything short of that is not a derivation, and the image goes through the
 * table as it is (where a busy adjust word still refuses).
 *
 * BALANCING ON TOP. The word sum is linear, so each balanced edit owns an
 * additive share of the adjust word: 0 (factory) + the edit's share + this
 * patch's share. The widening patch adds its share to the word as the slot
 * holds it, and either edit can still be taken back out exactly — which is
 * also why `patch-dump.mjs` needs no other free word to coexist with it. The
 * patch is built on, committed onto and restored to the image AS THE SLOT
 * HOLDS IT: the restore stages that image back, edit included, so the camera
 * gets the image that boots on its board.
 */

/** One known edit of a factory image, and the build it was written against. */
export interface ImageDerivation {
  readonly id: string;
  /** The name the plan print shows. */
  readonly label: string;
  /** The build table entry the factory image must detect as. */
  readonly baseBuildId: string;
  /** The edit: `before` is the factory bytes, `after` what the slot holds. */
  readonly site: PatchSite;
}

/** The edits Preserve recognizes. The board patch's bytes are
 *  `scripts/patch-dump.mjs`'s, written for the factory 1.0.3.0 plaintext
 *  (sha256 5e1f3f24…, the corpus image and the bench camera's own). */
export const KNOWN_DERIVATIONS: readonly ImageDerivation[] = [
  {
    id: 'compact-pro-1.0.3.0-accept-pn297',
    label: 'the Compact (PN297) board patch',
    baseBuildId: 'compact-pro-1.0.3.0',
    site: {
      offset: 0x6d4c,
      before: [0x04, 0x20, 0x27, 0x49, 0xf9, 0xf7, 0x27, 0xfc],
      after: [0x40, 0xf2, 0x29, 0x12, 0x93, 0x42, 0x02, 0xd0],
      what:
        'app_init’s board switch (VMA 0x100870B4): movs r0,#4; ldr r1,[pc,#0x9c]; bl ' +
        '<log stub> -> movw r2,#297; cmp r3,r2; beq <the PRO arm> — a PN297 (Compact 32k) ' +
        'board takes the PRO’s arm instead of rebooting',
    },
  },
];

/** A derivation found in an image, and the factory image under it. */
export interface LocatedDerivation {
  readonly derivation: ImageDerivation;
  /** The factory image: the before-bytes back, the adjust word back to 0. */
  readonly base: Uint8Array;
  /** The adjust word as the slot holds it — the edit's own balance. */
  readonly balanceWord: number;
}

function hasBytesAt(plain: Uint8Array, offset: number, bytes: readonly number[]): boolean {
  if (offset < 0 || offset + bytes.length > plain.length) return false;
  return bytes.every((b, i) => plain[offset + i] === b);
}

/** Writes `bytes` at `offset` and moves the adjust word by the opposite of
 *  the drift, so the word sum is what it was. */
function writeBalanced(image: Uint8Array, offset: number, bytes: readonly number[]): Uint8Array {
  const out = new Uint8Array(image);
  out.set(bytes, offset);
  const drift = (wordSum(out) - wordSum(image)) >>> 0;
  const dv = viewOf(out);
  dv.setUint32(
    REBALANCE_WORD_OFFSET,
    (dv.getUint32(REBALANCE_WORD_OFFSET, true) - drift) >>> 0,
    true,
  );
  return out;
}

/** The derivation applied to its factory image: the edit, balanced through
 *  the adjust word — the bytes `scripts/patch-dump.mjs` writes. */
export function applyDerivation(base: Uint8Array, derivation: ImageDerivation): Uint8Array {
  const { site } = derivation;
  if (!hasBytesAt(base, site.offset, site.before)) {
    throw new SeekError(
      'pipeline/refused',
      `bytes at raw ${hexUp(site.offset)} are not the expected ` +
        `${bytesToHex(Uint8Array.from(site.before))} — ${derivation.id} does not apply here`,
    );
  }
  return writeBalanced(base, site.offset, site.after);
}

/** The known derivation `plain` is, with its factory image — or null. */
export function locateDerivation(plain: Uint8Array): LocatedDerivation | null {
  if (plain.length < REBALANCE_WORD_OFFSET + 4) return null;
  for (const derivation of KNOWN_DERIVATIONS) {
    const { site } = derivation;
    if (!hasBytesAt(plain, site.offset, site.after)) continue;
    const base = writeBalanced(plain, site.offset, site.before);
    if (viewOf(base).getUint32(REBALANCE_WORD_OFFSET, true) !== 0) continue;
    const detected = BUILD_PATCH_PROFILES.filter((profile) => profile.detect(base));
    if (detected.length !== 1 || detected[0]?.buildId !== derivation.baseBuildId) continue;
    return {
      derivation,
      base,
      balanceWord: viewOf(plain).getUint32(REBALANCE_WORD_OFFSET, true),
    };
  }
  return null;
}

/* ---- building the patch ------------------------------------------------------ */

/** The factory plaintext every assertion below hangs off. */
export interface V1Patch {
  /** The input, verbatim: the image the slot holds — a factory image, or a
   *  known derivation of one (`derivation`). */
  readonly factory: Uint8Array;
  /** `factory` with the sites applied and word 142 rebalanced. */
  readonly patched: Uint8Array;
  /** Byte offsets where `patched` differs from `factory` — the pipeline's
   *  whole effect on the part, enumerated. For the 2014 patch set: exactly
   *  the thirteen bytes 0x238..0x23B, 0x3C1C, 0x3C1D, 0x3C68, 0x3C69,
   *  0x3C70, 0x3C71, 0x3DB7, 0x3DC6, 0x3DC7. */
  readonly diffOffsets: readonly number[];
  /** `factory[o] ^ patched[o]` per diff offset — the conjugation mask. */
  readonly mask: Uint8Array;
  /** The rebalance word, as stored (little-endian) at `REBALANCE_WORD_OFFSET`.
   *  On the FF build this word is NOT a raw-sum rebalance: it spends the free
   *  header word on the collapsed staged-form acceptance (sum(S ^ ks0) ==
   *  0xFFFF). */
  readonly rebalanceWord: number;
  /** The raw 32-bit word sum of `patched` — 0 on every family whose boot gate
   *  reads one; the FF build's is 0x485602E7 and that is fine (its route never
   *  touches the sum-checking slots). */
  readonly patchedWordSum: number;
  /* ---- the build the patch belongs to (additive) ------------------------- */
  readonly buildId: string;
  readonly family: PreserveFamilyId;
  readonly label: string;
  /** The sites at their located offsets — what the plan print shows. */
  readonly sites: readonly PatchSite[];
  readonly keys: LocatedKeys | null;
  readonly stagedForm: StagedFormId;
  readonly restoreForm: RestoreFormId;
  readonly acceptanceSum: number;
  readonly route: CommitRouteId;
  readonly routeNote: string | null;
  readonly capability: DrainCapability;
  /** True when the PATCHED image's arm tail zeroes the reader's whole cursor
   *  word — by a site of this patch (`clearsArmCursor`, the 2014 trio
   *  builds) or by the build's own tail (`stockArmResetsCursor`, 1.0.3.0).
   *  The drain then leaves the reader readable on its own boot. */
  readonly armResetsCursor: boolean;
  /** The known edit the image carries on top of its factory build, with the
   *  share of the adjust word it holds; null on a factory image. */
  readonly derivation: {
    readonly derivation: ImageDerivation;
    readonly balanceWord: number;
  } | null;
}

const NO_MATCH_GUIDANCE =
  'No build in the preservation table matches this image (looked for the 2014 widen + ' +
  'reader trio, the 0.x line’s widen tail + trio layouts, the 1.3.0.8 widen, the ' +
  '1.3.0.8-FF guard and key blocks, and the 2016 guard + widen + key blocks — or the ' +
  'image is already patched). If this is a 2018-or-later build (Compact/Compact PRO 4.x, ' +
  'Compact XR, Nano 200/300, Mosaic), no widening patch is needed: the modern stock plan ' +
  'already reads 63 of the 64 flash windows (the whole flash except 0x14060000, which no ' +
  'selector can arm) — use Dump & decrypt for 4.x and Nano instead.';

/**
 * The 0.x and 1.x line only: this run's builds are the 2014 and 2016 cameras.
 * A 4.x, Nano or Mosaic build (its version starts at 2 or more) is read by the
 * 4.x/Nano flow, and this run refuses it after the version read and before any
 * window is armed or read. Null when the version says 0.x or 1.x, or says
 * nothing (the caller's own gates decide that).
 */
export function outsideLineRefusal(version: string | null): string | null {
  const match = /^\s*(\d+)\./.exec(version ?? '');
  if (match === null) return null;
  const major = Number.parseInt(match[1] ?? '', 10);
  if (major <= 1) return null;
  return (
    `firmware ${version ?? ''} is not a 0.x or 1.x build, and this run covers only the 2014 and ` +
    '2016 builds. Nothing was read beyond the version. Read this camera with Dump & decrypt for ' +
    '4.x and Nano instead: it reads the flash without a patch, every block but the one at ' +
    '0x14060000, which no read window reaches on those builds.'
  );
}

/**
 * The measured refusal for the generation the widening route explicitly does
 * NOT reach: the 2014 Compact builds OLDER than 0.7.0.7 (0.3.0.1, 0.5.0.2,
 * 0.5.1.0, 0.5.1.3, 0.6.0.4). FW-V1 doc 36 sec. 36.7 investigated that
 * generation and STOPPED: the upgrade machinery exists (0.3.0.1 even has a
 * byte-exact reconstruction target) but the route does not port, for three
 * measured reasons, each fatal on its own. Returns the refusal text, or null
 * when `version` is not one of those builds.
 */
export function preWideningRefusal(version: string | null): string | null {
  const match = /^\s*0\.(\d+)\./.exec(version ?? '');
  const minor = match === null ? Number.NaN : Number.parseInt(match[1] ?? '', 10);
  if (Number.isNaN(minor) || minor >= 7) return null;
  return (
    `firmware ${version ?? '(unreadable)'} predates the widening route, and the run refuses ` +
    'rather than write over a bank it cannot read back. On this generation the camera turns ' +
    'away every way of starting the read the route needs (measured on 0.3.0.1), its read ' +
    'command does not reach the start of the flash, and the size the patch would change is ' +
    'stored in a different way. It has no read a standard dump can use either. Nothing was ' +
    'read beyond the version.'
  );
}

/**
 * Build the widening patch for whatever build the plaintext turns out to be.
 *
 * The table dispatch is on image properties (never the version string alone);
 * the per-family gates refuse — before anything is derived — when the
 * plaintext does not carry the expected `before` bytes at the located sites,
 * when its acceptance sum is not what the family assumes, or when the
 * rebalance word is not free (or held by a known derivation's balance).
 *
 * A known derivation (`locateDerivation`) is detected by its factory image,
 * and the patch is built on the image as the slot holds it: the same sites,
 * balanced on top of the edit's share of the adjust word.
 */
export function buildV1Patch(plain: Uint8Array): V1Patch {
  if (plain.length & 3) {
    throw new SeekError(
      'pipeline/refused',
      `image length ${String(plain.length)} is not a multiple of 4`,
    );
  }
  if (plain.length < REBALANCE_WORD_OFFSET + 4) {
    throw new SeekError('pipeline/refused', 'image is too small to hold the header window');
  }

  const derived = locateDerivation(plain);
  const subject = derived?.base ?? plain;
  const matches = BUILD_PATCH_PROFILES.filter((profile) => profile.detect(subject));
  if (matches.length > 1) {
    throw new SeekError(
      'pipeline/refused',
      `this image matches ${String(matches.length)} build profiles ` +
        `(${matches.map((p) => p.buildId).join(', ')}) — refusing to guess`,
    );
  }
  const matched = matches.at(0);
  if (matched !== undefined) return buildWithProfile(plain, matched, derived);

  /* No table entry matched. The generation the route explicitly does not
   * reach gets its doc-cited refusal first, then the 2014 chain's own pinned
   * messages, then the guidance. */
  const tooOld = preWideningRefusal(parseImageHeader(plain)?.versionStr ?? null);
  if (tooOld !== null) throw new SeekError('pipeline/refused', tooOld);

  /* The 2014 chain's own refusals — the pinned, measured messages — then the
   * guidance above. */
  const sum = wordSum(plain);
  if (sum !== 0) {
    throw new SeekError(
      'pipeline/refused',
      `the factory plaintext word sum is not 0 (0x${sum.toString(16)}) — this builder only ` +
        `rebalances a balanced image. ${NO_MATCH_GUIDANCE}`,
    );
  }
  for (const site of V1_2014_PATCH_SITES) {
    if (!matchesAt(plain, site)) {
      throw new SeekError(
        'pipeline/refused',
        `bytes at raw ${hexUp(site.offset)} are not the expected ` +
          `${bytesToHex(Uint8Array.from(site.before))} — ` +
          `this image does not carry the v1 2014 update machinery this patch was derived ` +
          `from (${site.what}). ${NO_MATCH_GUIDANCE}`,
      );
    }
  }
  throw new SeekError(
    'pipeline/refused',
    `the rebalance word at ${hexUp(REBALANCE_WORD_OFFSET)} is not free (0). ` + NO_MATCH_GUIDANCE,
  );
}

/** The refusal for an adjust word some edit already spent, when that edit is
 *  not one Preserve knows: balancing on top of an unknown edit is fine for the
 *  sum, but the run would restore and vouch for an image it cannot name. */
function busyWordRefusal(word: number): SeekError {
  return new SeekError(
    'pipeline/refused',
    `the rebalance word at ${hexUp(REBALANCE_WORD_OFFSET)} is not free (0): it holds ` +
      `${hexUp(word)}, the balance of an edit made to this image, and the edit is none of the ` +
      `ones Preserve knows (${KNOWN_DERIVATIONS.map((d) => `${d.id}: ${d.label}`).join('; ')}) — ` +
      'refusing to patch, and later restore, an image it cannot name',
    { detail: { rebalanceWord: word } },
  );
}

function buildWithProfile(
  plain: Uint8Array,
  profile: BuildPatchProfile,
  derived: LocatedDerivation | null = null,
): V1Patch {
  const dv = new DataView(plain.buffer, plain.byteOffset, plain.byteLength);
  const rawSum = wordSum(plain);
  if (profile.family === 'v1-2014-ff') {
    /* The FF build's sentinel: its raw word sum is 0xFFFF on the factory
     * image, and the acceptance is carried by the staged form, not the raw
     * bytes (doc 35.3.1-35.3.2). */
    if (rawSum !== 0xffff) {
      throw new SeekError(
        'pipeline/refused',
        `the factory plaintext word sum is 0x${rawSum.toString(16)}, want the FF build's ` +
          '0xFFFF sentinel — this patch is derived from the 1.3.0.8-FF bytes',
      );
    }
  } else if (rawSum !== 0) {
    throw new SeekError(
      'pipeline/refused',
      'the factory plaintext word sum is not 0 — this builder only rebalances a balanced image',
    );
  }
  /* THE ADJUST WORD: free (0) on a factory image; on a known derivation it is
   * the edit's own balance, which `locateDerivation` proved is all it holds.
   * The FF build solves the word outright (below), so it never builds on one. */
  const heldWord = dv.getUint32(REBALANCE_WORD_OFFSET, true);
  if (derived === null || profile.family === 'v1-2014-ff') {
    if (heldWord !== 0) throw busyWordRefusal(heldWord);
  } else if (heldWord !== derived.balanceWord) {
    throw busyWordRefusal(heldWord);
  }

  const located = profile.locate(plain);
  if (derived !== null) {
    /* The edit and the patch must not touch the same bytes: each is gated on
     * the other's absence, and the restore puts the edit back unchanged. */
    const edit = derived.derivation.site;
    for (const site of located) {
      const apart =
        site.offset + site.before.length <= edit.offset ||
        edit.offset + edit.after.length <= site.offset;
      if (!apart) {
        throw new SeekError(
          'pipeline/refused',
          `patch site ${hexUp(site.offset)} overlaps ${derived.derivation.id} at ` +
            `${hexUp(edit.offset)} — refusing to stack two edits on the same bytes`,
        );
      }
    }
  }

  const patched = new Uint8Array(plain);
  for (const site of located) {
    for (let i = 0; i < site.before.length; i++) {
      if (patched[site.offset + i] !== site.before[i]) {
        throw new SeekError(
          'pipeline/refused',
          `bytes at raw ${hexUp(site.offset)} are not the expected ` +
            `${bytesToHex(Uint8Array.from(site.before))} — ` +
            `this image does not carry the update machinery this patch was derived from ` +
            `(${site.what})`,
        );
      }
    }
    patched.set(site.after, site.offset);
  }

  const keys = profile.keysOf(plain);
  let rebalanceWord: number;
  if (profile.family === 'v1-2014-ff') {
    const block1Hex = keys?.block1Hex;
    if (keys == null || block1Hex == null) {
      throw new SeekError(
        'pipeline/refused',
        'the FF staged form needs both key blocks and they were not located by value',
      );
    }
    /* Solve the free header word for the ONE content constraint the double
     * accept collapses to: sum over (S ^ ks0), header words at face value,
     * == 0xFFFF. With S = P ^ ks0 ^ ksD off the header, that sum reads
     * P ^ ksD — so the solve is exact arithmetic on the patched plaintext. */
    const ks0 = keystream(keyWordsOf(keys.block0Hex), plain.length >> 2);
    const ksD = keystream(keyWordsOf(block1Hex), plain.length >> 2);
    const base = wordSum(xorWindowVerbatim(patched, ksD)); /* word 142 still 0 here */
    rebalanceWord = (0xffff - base) >>> 0;
    new DataView(patched.buffer).setUint32(REBALANCE_WORD_OFFSET, rebalanceWord, true);
    const staged = xorWindowVerbatim(xorWindowVerbatim(patched, ks0), ksD);
    if (wordSum(xorWindowVerbatim(staged, ks0)) !== 0xffff) {
      throw new SeekError(
        'pipeline/refused',
        'the rebalance did not bring the staged-form acceptance to 0xFFFF',
      );
    }
  } else {
    /* The patch's share goes ON TOP of whatever the word holds: 0 on a
     * factory image (this is then `0 - sum`, as it always was), the edit's
     * balance on a known derivation. */
    rebalanceWord = (heldWord - wordSum(patched)) >>> 0;
    new DataView(patched.buffer).setUint32(REBALANCE_WORD_OFFSET, rebalanceWord, true);
    if (wordSum(patched) !== 0) {
      throw new SeekError('pipeline/refused', 'the rebalance did not bring the word sum to 0');
    }
  }
  /* The commit and restore pre-checks read the bank's first 1 KiB and tell the
   * original from the patched bank by this word (the instruction sites lie
   * past it), so a patch that left it where it was could not be told apart. */
  if (rebalanceWord === heldWord) {
    throw new SeekError(
      'pipeline/refused',
      `the patch leaves the rebalance word at ${hexUp(heldWord)} — the bank-head pre-checks ` +
        'could not tell the patched bank from the original, so the run refuses',
    );
  }

  const diffOffsets: number[] = [];
  for (let i = 0; i < plain.length; i++) {
    if (plain[i] !== patched[i]) diffOffsets.push(i);
  }
  const mask = new Uint8Array(diffOffsets.length);
  diffOffsets.forEach((o, i) => {
    mask[i] = (plain[o] ?? 0) ^ (patched[o] ?? 0);
  });

  return {
    factory: plain,
    patched,
    diffOffsets,
    mask,
    rebalanceWord,
    patchedWordSum: wordSum(patched),
    buildId: profile.buildId,
    family: profile.family,
    label: profile.label,
    sites: located,
    keys,
    stagedForm: profile.stagedForm,
    restoreForm: profile.restoreForm,
    acceptanceSum: profile.acceptanceSum,
    route: profile.route,
    routeNote: profile.routeNote,
    capability: profile.capability,
    armResetsCursor: clearsArmCursor(located) || (profile.stockArmResetsCursor?.(plain) ?? false),
    derivation:
      derived === null
        ? null
        : { derivation: derived.derivation, balanceWord: derived.balanceWord },
  };
}

/* ---- the staged forms -------------------------------------------------------- */

/**
 * The wire-80 staged bytes for `image` (the patched plaintext for a commit,
 * the factory plaintext for a restore) under the patch's family:
 *
 *  - 'plain'       the image itself — the 2014 banks hold it as stored, and
 *                  the commit path conjugates the capture instead (`plain` is
 *                  the identity here; the caller decides);
 *  - 'xor-ks0'     image ^ keystream(key block 0) — the 2016 staged form;
 *  - 'xor-ks0-ksD' image ^ keystream(block 0) ^ keystream(block 1) — the FF
 *                  build's staged form, whose commit transform folds it back
 *                  to the plaintext slot content.
 *
 * The header window (words 128..143) passes verbatim through every form; the
 * keystreams advance through it.
 */
export function stagedFormOf(patch: V1Patch, image: Uint8Array): Uint8Array {
  if (image.length !== patch.factory.length) {
    throw new SeekError(
      'pipeline/refused',
      `staged form: image is ${String(image.length)} B, the patch was built from ` +
        `${String(patch.factory.length)} B`,
    );
  }
  return stageWithKeys(patch.stagedForm, patch.keys, image);
}

/** The staged form of `image` under `form`, from the key blocks found in it. The one
 *  copy of the fold: `stagedFormOf` stages a patch with it and `ffStagedFormOf` stages
 *  a bare FF image with it, so the two cannot drift. */
function stageWithKeys(
  form: StagedFormId,
  keys: LocatedKeys | null,
  image: Uint8Array,
): Uint8Array {
  if (form === 'plain') return image;
  if (keys === null) {
    throw new SeekError(
      'pipeline/refused',
      'the staged form needs this build key blocks and they were not located by value',
    );
  }
  const words = image.length >> 2;
  const ks0 = keystream(keyWordsOf(keys.block0Hex), words);
  let out = xorWindowVerbatim(image, ks0);
  if (form === 'xor-ks0-ksD') {
    if (keys.block1Hex === null) {
      throw new SeekError(
        'pipeline/refused',
        'the two-stream staged form needs key block 1 and it was not located by value',
      );
    }
    out = xorWindowVerbatim(out, keystream(keyWordsOf(keys.block1Hex), words));
  }
  return out;
}

/* ---- the FF staged form for a bare image ------------------------------------
 *
 * `buildV1Patch` stages the PATCHED plaintext of an FF image it is widening. The
 * slot writer stages an image as it is given, with no patch, and needs the same
 * two-stream form and the same solved header word. These three functions are that,
 * built from the shared fold above and the same arithmetic as the FF branch of
 * `buildV1Patch`; the differential test in test/slots/write-ff.test.ts pins them to
 * `stagedFormOf` over the corpus image.
 */

/** The 1.3.0.8-FF key pair as found in `image` by value (each half exactly once), or null. */
export function locateFFKeys(image: Uint8Array): LocatedKeys | null {
  return findKeyPair(image, KEY_PAIRS.ff1308);
}

/** An FF image, stamped and staged. */
export interface FFStaging {
  /** The image as the bank will hold it: the input with word 142 (0x238) solved. */
  readonly stamped: Uint8Array;
  /** The wire payload: `stamped` XOR ks0 XOR ksD, header window verbatim. */
  readonly staged: Uint8Array;
  /** The solved word 142, as stored. */
  readonly rebalanceWord: number;
  /** What word 142 held in the input. */
  readonly heldWord: number;
  /** The raw word sum of `stamped` (not the collapsed gate, which is 0xFFFF). */
  readonly storedWordSum: number;
}

/**
 * Stage a bare FF image: solve word 142 so the collapsed gate sum(S ^ ks0) is 0xFFFF
 * (S is the staged form; its header words are verbatim, so the gate reads the image
 * XOR ksD off the header), then fold the image through ks0 and ksD. The input's word
 * 142 is overwritten whatever it held, which makes the solve idempotent: an image that
 * already carries its solved word stages to the same bytes. Throws `pipeline/refused`
 * when the image does not carry the 1.3.0.8-FF key pair or is too short.
 */
export function ffStagedFormOf(image: Uint8Array): FFStaging {
  const keys = locateFFKeys(image);
  const block1Hex = keys?.block1Hex;
  if (keys == null || block1Hex == null) {
    throw new SeekError(
      'pipeline/refused',
      'the FF staged form needs the 1.3.0.8-FF key pair, and the image does not carry both ' +
        'halves exactly once',
    );
  }
  if (image.length < REBALANCE_WORD_OFFSET + 4 || (image.length & 3) !== 0) {
    throw new SeekError(
      'pipeline/refused',
      `an FF image is a whole number of words past ${hexUp(REBALANCE_WORD_OFFSET + 4)}, got ` +
        `${String(image.length)} B`,
    );
  }
  const words = image.length >> 2;
  const ks0 = keystream(keyWordsOf(keys.block0Hex), words);
  const ksD = keystream(keyWordsOf(block1Hex), words);
  const stamped = new Uint8Array(image);
  const dv = viewOf(stamped);
  const heldWord = dv.getUint32(REBALANCE_WORD_OFFSET, true);
  dv.setUint32(REBALANCE_WORD_OFFSET, 0, true);
  const base = wordSum(xorWindowVerbatim(stamped, ksD)); /* word 142 is 0 here */
  const rebalanceWord = (0xffff - base) >>> 0;
  dv.setUint32(REBALANCE_WORD_OFFSET, rebalanceWord, true);
  const staged = stageWithKeys('xor-ks0-ksD', keys, stamped);
  if (wordSum(xorWindowVerbatim(staged, ks0)) !== 0xffff) {
    throw new SeekError(
      'pipeline/refused',
      'the rebalance did not bring the staged-form acceptance to 0xFFFF',
    );
  }
  return { stamped, staged, rebalanceWord, heldWord, storedWordSum: wordSum(stamped) };
}

/**
 * The inverse of `ffStagedFormOf`, for bytes sent raw: the plain image `staged` folds to,
 * or null when `staged` is not an FF staged payload. It is one only when both of the app's
 * accepts would pass it (sum(staged ^ ks0) == 0xFFFF) AND the image it folds to carries the
 * 1.3.0.8-FF key pair, so a random payload is not mistaken for one.
 */
export function ffFoldedFormOf(staged: Uint8Array): Uint8Array | null {
  if (staged.length < REBALANCE_WORD_OFFSET + 4 || (staged.length & 3) !== 0) return null;
  const words = staged.length >> 2;
  const ks0 = keystream(keyWordsOf(KEY_PAIRS.ff1308.block0), words);
  const unfolded = xorWindowVerbatim(staged, ks0);
  if (wordSum(unfolded) !== 0xffff) return null;
  const folded = xorWindowVerbatim(unfolded, keystream(keyWordsOf(KEY_PAIRS.ff1308.block1), words));
  return locateFFKeys(folded) === null ? null : folded;
}

/**
 * The FF build's collapsed content gate, evaluated on staged bytes: the word
 * sum of (staged ^ ks0), header words at face value — what BOTH of the app's
 * accepts read (the two-stream transform sits between them, and accept 2's
 * device-stream decryption lands on the same sum). Must be 0xFFFF.
 */
export function stagedAcceptanceSum(patch: V1Patch, staged: Uint8Array): number {
  if (patch.keys === null) {
    throw new SeekError('pipeline/refused', 'the staged acceptance needs the build key blocks');
  }
  return wordSum(
    xorWindowVerbatim(staged, keystream(keyWordsOf(patch.keys.block0Hex), staged.length >> 2)),
  );
}

/**
 * THE CIPHERTEXT RULE, as a function: apply the plaintext diff to a SLOT
 * CAPTURE (ciphertext) so the decrypted image changes by exactly the diff.
 *
 * `capture` is what the wire-79 reader served for the bank; `plain` and
 * `patched` are the builder's two plaintexts. The result is the staged
 * wire-80 payload: image-length only (the commit erases the whole 64 KiB
 * block and programs exactly the staged bytes, and the as-booted tail past
 * the image is already erased — a full 64 KiB stage would also overrun the
 * descriptor's staging buffer at 0x20002000 + 0xE000).
 */
export function conjugateCapture(
  capture: Uint8Array,
  patch: V1Patch,
  imageLen: number = patch.factory.length,
): Uint8Array {
  if (capture.length < imageLen) {
    throw new SeekError(
      'pipeline/refused',
      `the bank capture is ${String(capture.length)} B, shorter than the image ` +
        `(${String(imageLen)} B)`,
    );
  }
  const out = new Uint8Array(capture.subarray(0, imageLen));
  patch.diffOffsets.forEach((off, i) => {
    const m = patch.mask[i] ?? 0;
    if (m === 0) return; /* a zero mask byte is not a diff */
    if (off >= imageLen) {
      throw new SeekError(
        'pipeline/refused',
        `patch offset ${hexUp(off)} is past the image length`,
      );
    }
    out[off] = ((out[off] ?? 0) ^ m) & 0xff;
  });
  return out;
}

/**
 * Verify a bank capture against what the factory plaintext predicts, BEFORE
 * anything is written.
 *
 * Two checks, strongest first:
 *  - `expected` (the plain XOR keystream of the factory image, when the slot
 *    key is known — the emulator's donor case) must equal the capture's image
 *    prefix byte for byte;
 *  - ALWAYS, the verbatim header window (words 128..143, offsets 0x200..0x23F)
 *    of the capture must equal the factory plaintext's — that window is stored
 *    unencrypted, so this check needs no key material and works on hardware
 *    where the device key was never recovered.
 */
export function verifyCapture(
  capture: Uint8Array,
  plain: Uint8Array,
  expected?: Uint8Array,
): { ok: boolean; reason: string | null } {
  if (expected !== undefined) {
    if (capture.length < expected.length) {
      return {
        ok: false,
        reason: `capture ${String(capture.length)} B shorter than expected prefix`,
      };
    }
    for (let i = 0; i < expected.length; i++) {
      if (capture[i] !== expected[i]) {
        return {
          ok: false,
          reason:
            `capture byte ${hexUp(i)} is ${hexUp(capture[i] ?? 0, 2)}, expected ` +
            `${hexUp(expected[i] ?? 0, 2)} (the bank does not hold the factory image)`,
        };
      }
    }
    return { ok: true, reason: null };
  }
  const windowStart = 0x80 * 4;
  const windowEnd = (0x8f + 1) * 4;
  if (capture.length < windowEnd || plain.length < windowEnd) {
    return { ok: false, reason: 'capture or plaintext too short for the verbatim header window' };
  }
  for (let i = windowStart; i < windowEnd; i++) {
    if (capture[i] !== plain[i]) {
      return {
        ok: false,
        reason:
          `verbatim header word at ${hexUp(i)} differs — the bank does not hold the ` +
          'factory image (that window is stored unencrypted, so this is a real mismatch)',
      };
    }
  }
  return { ok: true, reason: null };
}
