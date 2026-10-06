/**
 * Patch the application slots inside a whole 4 MiB flash dump, and write the
 * result as a new dump for a J-Link or SPI-NOR programmer to put back.
 *
 * WHY THIS EXISTS.
 * The Compact PRO 1.0.3.0 (2016) application refuses every board but its own.
 * `app_init` ends with a switch on the board model that `peripherals_init`
 * read from the GPIO straps: 603 (NXP universal processor board) and 714
 * (Compact 80k, the PRO) bring USB up; anything else logs "Firmware does not
 * support target hardware" and reboots. A Compact (PN297, 32k) therefore
 * reboot-loops before USB exists. FW-V1's byte-exact reconstruction spells it
 * out — `targets/compact_pro_9hz_2016/src/app_init.c`, the closing switch.
 * The 2014 Compact firmware has no such check, which is why it runs on a PRO.
 *
 * WHAT THE PATCH DOES.
 * The unknown-board arm at 0x100870B4 starts with three instructions that only
 * feed a logging stub (`movs r0,#4; ldr r1,[pc]; bl nullsub_5`, and nullsub_5
 * is a bare `bx lr`). Those eight bytes become
 *
 *     movw r2, #297 ; cmp r3, r2 ; beq 0x100870C2
 *
 * so model 297 takes the PRO's arm (usb_set_state(241)) and every other
 * unknown model still reaches the original `bl device_reboot` right after it.
 * The model word itself is left at 297, so GetFirmwareInfo still reports the
 * real board. The only other reader, device_mode1_enter, tests for 603 alone,
 * where 297 and 714 already take the same path.
 *
 * HOW A SLOT IS REWRITTEN.
 * The slot cipher is a word-wise XOR with an xorshift128 keystream that does
 * not depend on the plaintext, so the same keystream re-encrypts a patched
 * image. core's `recoverState` solves it from the slot itself, the same
 * no-key-search path `seek-fw decrypt` uses. The bootloader accepts a slot by
 * the 32-bit word sum of its decrypted image. The free adjust word at +0x238
 * sits in the cleartext header and is retuned so that sum does not move. The
 * "CODE" footer carries no image checksum, and the length does not change, so
 * it is left as it is.
 *
 * PRESERVE KNOWS THIS EDIT. The adjust word is also the one Preserve's
 * widening patch balances through. Preserve recognizes a slot this script
 * patched by the same bytes (`KNOWN_DERIVATIONS` in
 * packages/core/src/preservation/patch.ts) and adds its own share to the word
 * on top of this one: the word sum is linear, so the two coexist and either can
 * be taken back out. Keep the two tables in step.
 *
 * WHAT IT REFUSES.
 * A patch applies only to a slot whose decrypted image has the exact SHA-256
 * it was written for, and only if the bytes at the site are the expected
 * original ones. A slot already carrying the patch is recognised and left
 * alone. Afterwards every written slot is decrypted again from the output and
 * checked three ways: same keystream, same acceptance sum, and only the three
 * expected words changed. If no slot was patched, nothing is written.
 *
 * Usage:
 *   node scripts/patch-dump.mjs <in-4m.bin> <out-4m.bin>
 *
 * Needs the core build (`npm run build -w packages/core`, or any `tsc --build`
 * of the CLI). Touches no device.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  ADJUST_OFFSET,
  HEADER_OFFSET,
  IMAGE_MAGIC,
  TRY_KEYS_MAX_LEN,
  checksum32,
  cryptImage,
  getProfile,
  parseImageHeader,
  recoverState,
} from '../packages/core/dist/index.js';

const DUMP_SIZE = 4 * 1024 * 1024;
const FLASH_BASE = 0x14000000;
const BANK_STRIDE = 0x10000;

/**
 * The known patches. `offset` is into the decrypted image (the slot's own
 * byte 0). On this build, code stored at image offset 0x2C0 runs at 0x10080628,
 * so the site's runtime address is offset - 0x2C0 + 0x10080628.
 */
const PATCHES = [
  {
    id: 'compact-pro-1.0.3.0-accept-pn297',
    describe:
      'Compact PRO 1.0.3.0 (2016): a PN297 (Compact 32k) board takes the PRO arm of ' +
      "app_init's board switch instead of rebooting",
    imageSha256: '5e1f3f24c8bc1e85bcb67e73e0ee23f301864ee7839a48135598fca961373e26',
    offset: 0x6d4c, // runtime 0x100870B4
    before: Uint8Array.of(0x04, 0x20, 0x27, 0x49, 0xf9, 0xf7, 0x27, 0xfc),
    after: Uint8Array.of(0x40, 0xf2, 0x29, 0x12, 0x93, 0x42, 0x02, 0xd0),
  },
];

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const hex = (n, width = 8) => `0x${(n >>> 0).toString(16).toUpperCase().padStart(width, '0')}`;
const sameBytes = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const viewOf = (bytes) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

function wordSum(bytes) {
  const dv = viewOf(bytes);
  let acc = 0;
  for (let o = 0; o + 4 <= bytes.length; o += 4) acc = (acc + dv.getUint32(o, true)) >>> 0;
  return acc;
}

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

/** Which patch this plaintext is for, and whether it already carries it. */
function matchPatch(plain) {
  const sha = sha256(plain);
  for (const patch of PATCHES) {
    if (sha === patch.imageSha256) return { patch, applied: false };
    const site = plain.subarray(patch.offset, patch.offset + patch.after.length);
    if (!sameBytes(site, patch.after)) continue;
    /* Undo the site and the adjust word's retune, then compare the hash: an
     * already-patched slot is recognised by what it was, not by a second hash
     * that would have to be kept in step with this file. */
    const undone = plain.slice();
    undone.set(patch.before, patch.offset);
    const dv = viewOf(undone);
    const drift = (wordSum(undone) - wordSum(plain)) >>> 0;
    dv.setUint32(ADJUST_OFFSET, (dv.getUint32(ADJUST_OFFSET, true) - drift) >>> 0, true);
    if (sha256(undone) === patch.imageSha256) return { patch, applied: true };
  }
  return null;
}

function main() {
  const [inPath, outPath] = process.argv.slice(2);
  if (!inPath || !outPath) fail('usage: node scripts/patch-dump.mjs <in-4m.bin> <out-4m.bin>');
  if (path.resolve(inPath) === path.resolve(outPath)) fail('refusing to overwrite the input dump');
  if (existsSync(outPath)) fail(`${outPath} already exists — refusing to overwrite it`);

  const input = new Uint8Array(readFileSync(inPath));
  if (input.length !== DUMP_SIZE) {
    fail(`${inPath} is ${String(input.length)} B, not a whole ${String(DUMP_SIZE)} B flash dump`);
  }
  const cipher = getProfile('compact-2016').cipher;
  const output = input.slice();
  const inView = viewOf(input);
  let patched = 0;

  console.log(`input   ${inPath}`);
  console.log(`        sha256 ${sha256(input)}`);

  for (let base = 0; base < DUMP_SIZE; base += BANK_STRIDE) {
    if (inView.getUint32(base + HEADER_OFFSET, true) !== IMAGE_MAGIC) continue;
    const where = hex(FLASH_BASE + base);
    const header = parseImageHeader(input, base);
    const length = header?.length ?? 0;
    if (length === 0 || length & 3 || length >= TRY_KEYS_MAX_LEN) {
      console.log(`slot ${where}: header length ${hex(length)} is not a bootable image — skipped`);
      continue;
    }

    const state = recoverState(inView, base);
    const plain = cryptImage(inView, base, length, state, cipher);
    const sum = checksum32(inView, base, length, state, cipher);
    const found = matchPatch(plain);
    const label = `slot ${where}: firmware ${header.versionStr}, ${String(length)} B, sum ${hex(sum)}`;
    if (found === null) {
      console.log(`${label} — no patch for image ${sha256(plain).slice(0, 16)}…, left as is`);
      continue;
    }
    if (found.applied) {
      console.log(`${label} — already carries ${found.patch.id}, left as is`);
      continue;
    }

    const { patch } = found;
    const site = plain.subarray(patch.offset, patch.offset + patch.before.length);
    if (!sameBytes(site, patch.before)) {
      fail(`${where}: the bytes at image +${hex(patch.offset, 4)} are not the expected original`);
    }

    /* Patch, then retune the cleartext adjust word so the acceptance sum is
     * exactly what it was. */
    const next = plain.slice();
    next.set(patch.after, patch.offset);
    const nv = viewOf(next);
    const drift = (wordSum(next) - wordSum(plain)) >>> 0;
    nv.setUint32(ADJUST_OFFSET, (nv.getUint32(ADJUST_OFFSET, true) - drift) >>> 0, true);
    if (wordSum(next) !== wordSum(plain)) fail(`${where}: could not keep the acceptance sum`);

    const enc = cryptImage(nv, 0, length, state, cipher);
    output.set(enc, base);

    /* Read it back the way the bootloader and `seek-fw decrypt` would. */
    const outView = viewOf(output);
    const again = recoverState(outView, base);
    if (!again.every((word, i) => word === state[i])) fail(`${where}: the keystream moved`);
    if (checksum32(outView, base, length, again, cipher) !== sum) {
      fail(`${where}: the acceptance sum moved`);
    }
    if (!sameBytes(cryptImage(outView, base, length, again, cipher), next)) {
      fail(`${where}: the slot does not decrypt to the patched image`);
    }
    const changed = [];
    for (let o = 0; o < length; o += 4) {
      if (inView.getUint32(base + o, true) !== outView.getUint32(base + o, true)) changed.push(o);
    }
    const expected = [ADJUST_OFFSET, patch.offset, patch.offset + 4];
    if (!sameBytes(Uint32Array.from(changed), Uint32Array.from(expected.sort((a, b) => a - b)))) {
      fail(`${where}: changed words ${changed.map((o) => hex(o, 4)).join(', ')}, expected 3`);
    }

    console.log(`${label} — patched: ${patch.describe}`);
    console.log(
      `        image +${hex(patch.offset, 4)} rewritten, adjust word ${hex(
        viewOf(plain).getUint32(ADJUST_OFFSET, true),
      )} -> ${hex(nv.getUint32(ADJUST_OFFSET, true))}, sum unchanged`,
    );
    patched += 1;
  }

  if (patched === 0) fail('no slot was patched — nothing written');
  writeFileSync(outPath, output);
  console.log(`output  ${outPath}`);
  console.log(`        sha256 ${sha256(output)}  (${String(patched)} slot(s) patched)`);
}

main();
