# Making the Seek Compact and Compact XR run at 32 fps

What was done to get a Compact (1.3.0.0) and a Compact XR (4.8.2.1) from 8 fps to about 32 fps, how it is applied, how it was
measured, and what can still go wrong. Everything here was measured on the owner's cameras unless it says *source* or *inferred*.

Related records: `TESTING.md` sections 42.23 (4.8.2.1 at 16 Hz), 42.24 (4.8.2.1 at 32 Hz), 42.25 (1.3.0.0 at 32 Hz);
FW-V1 `emu/fps_patch.py` (the patch table, the source of truth) and `docs/FPS_PATCH_LINE_STEPS.md`.

## 1. The idea

Both cameras capture frames from the sensor at about 32 Hz and publish one picture for every **four** captures: the firmware
averages four captures (seed, accumulate, accumulate, mean-of-four) and hands that mean to USB, which gives 8 fps. A capture
program (a list of small steps the firmware walks, one step per capture) decides that. The patch edits the **steady-state
block** of that program so it has one step: a plain copy of the capture, marked "publish". Every capture is then published.

Consequences, by design:

- The rate is the capture rate (about 32 Hz, 31 ms between frames), not the 8 Hz of the stock picture.
- There is **no averaging**, so the picture is noisier than stock. Level and spread match stock.
- The calibration/shutter stretch (about 0.5 s every ~2 s) is not patched, so the *average* over several seconds is lower
  (about 23 to 26 fps); the *median* frame rate is about 32.
- Only the byte edits below change. The acceptance-sum word at image `+0x238` is moved by the same amount so the 32-bit word
  sum the bootloader checks stays the same.

## 2. The Compact XR / Compact 4.8.2.1 (PID 0x0010, "Compact XR")

**Where.** The 4.8.2.1 firmware keeps its capture program as 68-byte *command pages* (a count, next/alt links, a reload byte,
then 16 four-byte substeps `param, chunk_op, type, gpio`; bit 7 of `chunk_op` is the line-completing LAST). The steady page is
page 13, a self-loop (next = alt = 13), at image offset `0x90F2`.

**Stock page 13** (68 bytes): `04 0d 0d 00 | 23 07 00 01 | 23 08 00 01 | 23 08 00 01 | 20 8a 03 01 | 00 x48`,
that is seed, accumulate, accumulate, mean4 with LAST.

**The patch** (13 image bytes + the 3 changed bytes of the sum word, table entry `compact_32k-4.8.2.1-to32`):

| image offset | stock | patched |
|---|---|---|
| `0x90F2` | `04` | `01` (one substep) |
| `0x90F6 .. 0x9105` | `23 07 00 01 23 08 00 01 23 08 00 01 20 8a 03 01` | `23 81 03 01` + 12 zero bytes |

The new substep is `frame_chunk_copy` (copy one chunk, no read of the destination), LAST, `param 0x23` (the same source
selection as the stock seed and accumulates), type 3, gpio 1.

**Why `0x23`.** The first candidate used `param 0x20` (the terminator's source selection). It also ran at 31 ms, but its pictures
sat above the sensor ceiling (mean ~15,600, 99.99 % of pixels over, against stock ~5,700) and was rejected. `0x23` gives the stock
picture. *Inferred:* stock's output effectively comes from the `0x23` captures.

**Why one copy step and not the accumulators.** The accumulating slots read the destination; one-step forms built from them froze or
alternated on the other lines (1.3.0.8, 4.8.1.x). A copy reads nothing, so nothing carries from one capture to the next.

**Measured on the XR (serial 1E2A50YZ7628, IP mode 9 and the app's Normal stream):**

| image | steady interval | fps (all frames) | median | picture |
|---|---|---|---|---|
| stock | 124 ms | 8.0 to 8.1 | 8.0 | stock |
| 16 Hz (the removed `...-to16`, for comparison) | 62 ms | 14.1 | ~16 | alive |
| **32 Hz (`...-to32`)** | **31 ms** | **24.7 to 26.1** | **32.2** | alive, 0 frozen pairs |

Applied three ways with the same result: a raw bank write, `seek-fw slots patch-fps a --write`, and the page's own
"Make 32 FPS" button (driven by `e2e/fps-bench.e2e.ts`).

## 3. The Compact 1.3.0.0 (PID 0x0010, "PIR206 Thermal Camera")

The 1.3.0.0 firmware has one capture program **per sensor mode** (`frame_mode_table_r32k`, `src/frame_data.c`), each a list of
34-byte blocks (2-byte header `count|first, next|reset`, then 2-byte steps `sel|active<<3|op<<4, push|hdr<<1|gpio<<5`).

- Mode 6 (the stream the earlier "16 Hz" patch edited) and **mode 8** (the processed *Normal* stream the macOS app uses until
  "Init Hi FPS" switches to mode 3) are different programs. The 16 Hz patch only changed mode 6, so a patched camera still read
  **8 fps in Normal mode**.
- Mode 3 (what "Init Hi FPS" selects) is already one block of one step, `STEP(1,1,3,1,3,6)`, i.e. every capture published: about
  32 fps on **stock** firmware as well.

**Mode 8, block 8** (image `+0xB898`) is the steady self-loop (first = next = 8, header id 3, gpio 1):

```
stock    84 08 | 59 20 | 69 20 | 69 20 | 79 27     op 5 seed, op 6, op 6, op 7 mean-of-four + publish
patched  81 08 | 39 27 | 00 00 | 00 00 | 00 00     op 3 copy + publish (hdr 3, gpio 1 as stock)
```

Op 5 and op 6 multiply the samples at or above a level by 4 and op 7 averages in that quarter-scale domain, quartering the
over-level samples, so a plain copy (op 3) has the stock scale. *Source:* `targets/compact_8hz_1_3_0_0/src/image.c`.

**One table entry**, `compact_32k-1.3.0.0-to32`: stock `862717a8...` to `ef90c94a...` (13 changed bytes: 9 image bytes and the
sum word). The bench measurement below was made on an image that also carried the old mode-6 16 Hz edit (`d91284c6...`); that edit
was removed with all 16 Hz patches (section 8) and does not take part in the Normal or Hi FPS streams, but the mode-8-only
image `ef90c94a...` itself has **not** been run on a camera yet. `d91284c6...` is recognised as an already-patched 32 Hz build.

**Measured** (owner's unit, serial 1013CE098ACA, after a power cycle): Normal mode (no Hi FPS) went from 8.0 fps to a **median of
32.2 fps** (31.85 to 32.29 per second), 0 frozen pairs, about 94 % of pixels change between consecutive frames, level about 5,900
with a spread of about 430 counts. Hi FPS gives about 32 fps as it does on stock firmware.

The 1.2.0.0 image has the same mode-6 block but its mode-8 block was not read; it has no 32 Hz patch.

## 4. How to apply it

With the firmware tool (`packages/cli`), on a camera that is connected over USB:

```sh
node packages/cli/dist/bin.js slots patch-fps a                         # dry run: prints the plan
node packages/cli/dist/bin.js slots patch-fps a --write --yes --acknowledge-risk --dump-dir ./before-patch
```

`--write` first saves bank A as stored and decrypted into `--dump-dir`, then writes the patched image and reads it back; the
read-back must differ from the saved dump only at the planned bytes. Or press **Make 32 FPS** on the Firmware slots page.
**Then power-cycle the camera**: a bank only runs after the next boot.

To undo: `seek-fw slots flash a <the saved ...-decrypted file> --yes --acknowledge-risk`, then power-cycle. (On the 4.8.2.1 an
app write leaves the bank in the store-key form instead of the factory Key A form; both boot.)

## 5. Measuring it: the Seek Thermal macOS app and CLI

`tv-jc/macos` (Swift package, libusb linked statically). `seek --fps` streams for 5 seconds and prints the mean and median fps of
each second; `seek stream` also prints frozen pairs and the share of pixels that changed between frames.

- The **Compact Pro init** ("use Pro init (new FW)") is needed for firmware 4.8.2.1 and is applied only on firmware 4.x and
  newer; a 1.3.0.0 always gets the classic init (it stalls on the Pro init).
- The firmware-info request answers `0.0.4.0` instead of the version right after a stop, so the app asks again until the major
  version is non-zero.
- The median is the rate to trust; the mean over a few seconds includes the unpatched calibration stretch.

## 6. The trap: the boot-config word (1.3.0.0 and the other 2014-chain Compacts)

A patched bank only helps if the camera **boots** it. On the 2014 chain the bootloader reads the boot-config word at
`0x14010000` (`boot_select_image`, bootloader `src/image.c`):

| word | boots first |
|---|---|
| `0` or `0xFFFFFFFF` | slot A (`0x14050000`), then B, then recovery |
| `1` | slot B, then A, then recovery |
| anything else, e.g. `2` | **recovery R** (`0x14070000`), if its checksum is valid |

The firmware leaves a warm-boot magic (`0xAA55FF01` / `0xAA55FF02`) before a soft reset; the bootloader then writes `2` into the
word and boots recovery (*source*). The owner's patched 1.3.0.0 later ran at 8 fps for exactly this reason: a whole-flash J-Link
dump showed the word at `2`, A and B holding the 32 Hz patch, and R still stock. The event that flipped the word was not observed.
A user dump of another 1.3.0.0 (`221A10H6HQC1`) shows the same state.

Check with a J-Link dump: the word at `0x14010000` should be `0` for the patched bank A to run. Setting it back to `0` is the
runner's `set-boot-slot-a`. A later warm reset can set it to `2` again; writing the image to R as well would stop that, at the cost
of the stock recovery image.

## 7. Not established

- The mode-8-only 1.3.0.0 image `ef90c94a...` on a camera (the measurement was of `d91284c6...`, which also had the removed mode-6 edit).
- The mode-8 edit on 1.2.0.0 and the other 2014-chain builds; the 1.3.0.8 and 4.8.1.x builds keep their earlier entries.
- The 32 Hz picture's noise against stock beyond "same level and spread": the averaging is gone by design.
- What triggers the boot-config flip, and how bank B on the 1.3.0.0 unit became a copy of A.
- The emulator streams mode 6 only, so it has no rate or picture test for the mode-8 edit; those proofs are the bench's.
- The 4.8.1.7 and 4.8.1.9 Key A path is proven on the emulator only.

## 8. The 16 Hz patches were removed

All 8 to 16 Hz patches (1.2.0.0, 1.3.0.0, 1.3.0.8, 4.8.1.7, 4.8.1.9, 4.8.2.1) and the 1.3.0.0 16-to-32 migration entry are out of
the table, the page, the CLI (`--to 16` is not a choice) and the tests (`TESTING.md` 42.26). Each of those builds except 1.2.0.0 keeps
its 32 Hz patch; 1.2.0.0 has no patch now. A camera that still carries an old 16 Hz image is read as an unknown image: restore the
stock image first, then press "Make 32 FPS".
