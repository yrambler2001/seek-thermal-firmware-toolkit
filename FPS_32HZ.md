# Making the Seek Compacts run at 32 fps: the rule for every 8 and 9 fps build

What was done to take the reconstructed Compact builds from 8 fps to about 32 fps (and the Compact PRO builds from 9 fps to 18 fps),
how each build is patched, how it was measured, and what can still go wrong. Everything here was measured on the owner's cameras
or in the FW-V1 emulator unless it says _source_ or _inferred_.

Related records: `TESTING.md` 42.23 (4.8.2.1 at 16 Hz), 42.24 (4.8.2.1 at 32 Hz), 42.25 (1.3.0.0 at 32 Hz), 42.26 (the 16 Hz patches
removed), 42.27 (one rule for every build, the per-build table, the tests and what was not measured), 42.28 (the Compact PRO 4.9.x
builds offered at 18 Hz) and 42.29 (the Compact PRO 1.0.3.0 and 1.0.3.2 builds offered at 18 Hz, the 2016 keystream write), and 42.32 (the Compact PRO 4.9.1.15 rate, measured at 17.7 fps in FW-V1 `FRAME_RATE.md` sec.6.3, recorded, and the earlier "not measured" sentences corrected). FW-V1
`emu/fps_patch.py` is the patch table and the source of truth; `docs/FPS_PATCH_ALL_FIRMWARES.md` in FW-V1 is the survey it was built from.

## 0. Processing modes (what "mode" means here)

"Mode" is the value sent with `SET_IMAGE_PROCESSING_MODE` (62). In the 2014-chain firmware it indexes `frame_mode_table_r32k`, one capture
program per mode (`FW-V1/targets/compact_8hz_1_3_0_0/src/frame_data.c`). On the 1.3.0.0:

| mode | stream                                                                                                                             | steady block                                     | stock rate   |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------ |
| 0    | Raw: average of four captures, no shutter handling                                                                                 | 4 steps (op 5, 6, 6, 7), gpio 6                  | 8 fps        |
| 3    | Hi FPS: the app's "Init Hi FPS" (the checker's `fast`, called FastRaw in its README)                                               | 1 step (op 3 copy, publish)                      | about 32 fps |
| 6    | shutter-managed, correlated double sample (op 9 = difference of two captures); modes 5, 6 and 8 refuse some commands while running | 4 steps: idle, op 3 copy, idle, op 9 + publish   | 8 fps        |
| 8    | Normal: the camera's own shutter and calibration                                                                                   | 4 steps (op 5, 6, 6, 7 + publish), block 8 of 12 | 8 fps        |

What the builds accept (the `SetIPMode` mask, `(1 << mode) & mask`):

- 1.2.0.0 and 1.3.0.0 accept modes 0 and 3 to 8 (mask 0x1F9; the 0.x masks were not read). Mode 3 (Hi FPS) runs on the 0.7.0.8 to
  1.3.0.0 builds (the emulator's IP 3 rows); the 1.3.0.8 and 4.8.x builds refuse it.
- 1.3.0.8 and the 4.8.x builds (including the XR 4.8.2.1) accept modes 0, 4, 7, 8 and 9 (mask 0x391). They refuse mode 3, so there is no
  Hi FPS stream on them, and the emulator's IP 3 row is refused by the build.
- Mode 9 shares mode 8's program on 1.3.0.8, the 4.8.x builds and the XR (the survey, and the emulator's IP 9 rows give the same rate as
  IP 8 on every such build).
- The Compact PRO builds are not covered by this table; their steady rows are in section 2 and section 6.

The macOS app and CLI send 8 (Normal) and, after Init Hi FPS, 3. The checker's `raw` mode sends 0. None of them send mode 6. The removed
16 Hz patch edited mode 6, which is why a patched 1.3.0.0 still read 8 fps in Normal mode (`TESTING.md` 42.25).

## 1. The idea

Each Compact captures frames from the sensor at about 32 Hz and publishes one picture for every **four** captures: the firmware averages
four captures (seed, accumulate, accumulate, mean-of-four) and hands that mean to USB, which gives 8 fps. A capture program (a list of
small steps the firmware walks, one step per capture) decides that. The patch edits the **steady-state block** of the Normal program so it
has one step: a copy of the capture, marked "publish". Every capture is then published.

Consequences, by design:

- The rate is the capture rate (about 32 Hz, 31 ms between frames), not the 8 Hz of the stock picture.
- There is **no averaging**, so the picture is noisier than stock in its frame-to-frame detail. Level and spread match stock.
- The calibration/shutter stretch (about 0.5 s every ~2 s) is not patched, so the _average_ over several seconds is lower (about 20 to
  26 fps); the _median_ frame rate is about 32.
- Only the byte edits in the table change. The acceptance-sum word at image `+0x238` is moved by the same amount so the 32-bit word sum
  the bootloader checks stays the same.
- The copy must read the same source selection as the stock seeds. A copy on another selection saturates or freezes (section 2).

## 2. One rule, per layout

Every patchable build has one steady block of the Normal program, and the patch reduces it to one step with the publish bit. The step is
the copy the layout allows. The stock seeds' source selection is the one the copy keeps, so the copy sees the sensor mode and source the
stock average is made of.

| family (layout)                               | builds (entry)                                                                                                            | steady block (image offset), mode | copy step                                                                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 2014 chain, 14-byte blocks, style a           | 0.7.0.8 (index 2)                                                                                                         | block 4 (`+0xB514`), mode 8       | table index 2 = `frame_line_op_3`, the gain-table remap of one capture, sel 1, publish: `21 04 \| 95 13`                    |
| 2014 chain, 14-byte blocks, style b           | 0.8.0.0, 0.9.0.2, 0.9.0.6, 0.9.0.7, 0.9.1.0, 0.10.0.0, 1.0.0.0 (blocks 6 or 7)                                            | block 6 or 7, mode 8              | op 3 (a plain row copy; the identity operator table), sel 1, publish: `39 27`                                               |
| 2014 chain, 34-byte blocks, 2-byte steps      | 1.2.0.0, 1.3.0.0 (block 8)                                                                                                | block 8 (`+0xB898`), mode 8       | op 3, sel 1, publish: `39 27`, then zeros                                                                                   |
| 52-byte blocks, 3-byte steps (`sel, op, hdr`) | 1.3.0.8 (block 13, `+0xB750`), 1.3.0.8-FF (block 13, `+0xB804`)                                                           | block 13, modes 8 and 9           | op 3, seeds' sel 3 (`13`), publish, hdr `23`: `13 23 23`                                                                    |
| 52-byte pages, 3-byte steps                   | 4.8.1.7 (`+0x976E`), 4.8.1.9 (`+0x95A6`), 4.16.1.7-FF (`+0x9776`)                                                         | page 13, modes 8 and 9            | op 1 (`frame_chunk_copy`), seeds' sel 1 (`11`), publish: `11 21 23`                                                         |
| 68-byte command pages, 4-byte substeps        | 4.8.2.1 and the XR (`+0x90F2`)                                                                                            | page 13, modes 8 and 9            | slot 1 (`frame_chunk_copy`), param `0x23`, LAST: `23 81 03 01`                                                              |
| Compact PRO rows (not a copy)                 | 1.0.3.0 (row 14, `+0xC2BC`), 1.0.3.2 (record 20, `+0xC258`), 4.9.1.15 (record 20, `+0x19B0`), 4.9.2.0 (row 20, `+0xA634`) | the steady self-loop row, mode 8  | the row's two substeps become one armed substep: count `02 -> 01`, the armed substep moves to slot 0, slot 1 zeroed (18 Hz) |

Why the seeds' selection, measured:

- On the 1.3.0.8, the terminator selection (0x11) gave a saturated picture on the camera: 67 % of samples at or above the sensor ceiling
  (15,000), level 15,576 against a stock 5,739. The seeds' selection (0x13) gave the stock picture (level 5,760 against 5,739).
- On the 4.8.x, the terminator selection (0) froze the picture in the emulator (58 of 58 steady pairs equal). The seeds' selection (0x11)
  gave the stock picture (mean 9,712.7 against 9,714.0 stock on the bright scene).
- Why not the op 5 seed as the one step: op 5 writes 0xFFFF over every sample above 15,000 and nothing refills it, so a scene over the
  ceiling shows dead pixels (33 % in the bright emulator scene; mean 26,285 against stock 9,713). The copy has no dead pixel there.
  _Source:_ `targets/compact_8hz_1_3_0_8/src/image.c:1111, 1149` and `frame_chunk_ops_target.c:171`.
- Why not the accumulators: they read the destination, and one-step forms built from them froze or alternated on the other lines.

## 3. The 2014-chain builds with 14-byte blocks (0.7.0.8 to 1.0.0.0)

These builds use 14-byte blocks with a 3-bit header field (0.7.0.8, style a) or the 1.3.0.0 step bits (0.8.0.0 and later, style b). Their
mode-8 program has 7 to 11 blocks. The steady block is the one whose header has first = next = its own index; its stock steps are op 5,
op 6, op 6, op 7 with the publish bit on the fourth. The patch keeps the header's first index and sets the count to 1.

- **0.7.0.8** (`compact_32k-0.7.0.8-to32`, `c5194276`): the op table has no frame_line_op_2, so table index n is not function op_n
  (`frame_data.c:52-54`). The stock steps are indices 4, 5, 5, 6. The first 0.7.0.8 entry used index 1 (a plain word copy, `8b0f4781`):
  its picture was about 10 to 12 % brighter than stock with about five times the spread, and it was never offered. Index 4 (op 5) was
  brighter too. Index 2 is `frame_line_op_3`, which maps 206 of 208 samples through the gain table (`image.c:307`); it matched stock on the
  camera. Slots refuse 0.7.0.8 (older than 0.8.0.0), so it is not offered on the page.
- **0.8.0.0 to 1.0.0.0**: copy `39 27` for the stock `59 20 69 20 69 20 79 27`, count 4 to 1 (`61`, `71` in the header). Measured on the
  camera for 0.8.0.0, 0.9.0.2, 0.9.0.6, 0.9.0.7, 0.9.1.0, 0.10.0.0 and 1.0.0.0 (TESTING.md 42.27, the per-build table).
- **1.2.0.0** (34-byte): the survey found no pointer words in its image, but the entry's evidence (`fps_patch.py`) finds its mode table at file
  0xB740 and its mode-8 record at 0xB780 under `C = 0x0FFF6808` (the 1.3.0.0 constant is `0x0FFF682C`). The two statements
  disagree; the entry's bytes were measured on the camera. The entry is stage one and was
  measured on the camera at 32.2 fps (TESTING.md 42.27). The older text that said 1.2.0.0 has no patch is out of date.

## 4. The Compact 1.3.0.0 (PIR206, 34-byte blocks)

The 1.3.0.0 firmware has one capture program **per sensor mode**, each a list of 34-byte blocks (2-byte header `count|first, next|reset`,
then 2-byte steps `sel|active<<3|op<<4, push|hdr<<1|gpio<<5`).

- Mode 8, block 8 (image `+0xB898`) is the steady self-loop (first = next = 8, header id 3, gpio 1):

```
stock    84 08 | 59 20 | 69 20 | 69 20 | 79 27     op 5 seed, op 6, op 6, op 7 mean-of-four + publish
patched  81 08 | 39 27 | 00 00 | 00 00 | 00 00     op 3 copy + publish (hdr 3, gpio 1 as stock)
```

- Mode 6 is a different program, and the Normal and Hi FPS streams do not use it. The entry `compact_32k-1.3.0.0-to32` (stock `862717a8...` to
  `ef90c94a...`) edits mode 8 only: 9 image bytes and the sum word, 13 changed bytes.
- [measured] Normal mode on the owner's unit (serial 101310HSNEA2, chip id 1013CE098ACA, PIR206) with the mode-8-only image `ef90c94a...` in bank A, word 0:
  per-second medians 32.17 to 32.22 fps over five seconds (E1 final), 0 frozen pairs, 94 % of pixels change between frames, level 5,880,
  std 66. The JS checker gave medians 32.09 to 32.20 and the Swift tool 31.09 to 32.25 in one second and 32.17 to 32.20 in the others.
  Hi FPS medians 32.19 to 32.20 (checker) and 31.45 to 32.20 (Swift). The run's stock picture was not measured again on this unit.
- [measured] Which bank ran: a J-Link SRAM read showed the patched block at SRAM `0x100020C4` and the stock mode-6 pair at `0x10002190`.
  Only `ef90c94a...` has that pair, so bank A was the running bank.
- The unit's other slots after the work: slot B and recovery R both hold `d91284c6...`, the 1.3.0.0 32 Hz image that also carries the
  removed mode-6 edit. The page recognises it as a known 32 Hz build (`compact-1.3.0.0-mode8-32hz`), so it is not reported as unknown.

## 5. The Compact 1.3.0.8 and the 4.8.x Compacts (52-byte and command-page layouts)

- **1.3.0.8** (52-byte blocks, 3-byte steps): block 13 (`+0xB750`, mode 8 and 9). The stock block is `04 0d 0d 00 | 13 05 20 13 06 20
13 07 20 11 28 23`; the patched block is `01 0d 0d 00 | 13 23 23 | 00 x9`. Measured on the owner's unit booted from bank B (word 1):
  Normal medians 32.16 to 32.20, level 5,760 against stock 5,739 (+0.4 %), std 76.7 against 76.3, 0 frozen pairs. The FF build (16 Hz
  stock, `+0xB804`) takes the same step: `01 0d 0d 00 | 13 23 23 | 00 x3`. Not measured on a camera.
- **4.8.1.7, 4.8.1.9** (52-byte pages, 18 pages in the program): page 13 (`+0x976E` and `+0x95A6`). The stock page is `04 0d 0d 00 | 11 05 20 11
06 20 11 07 20 10 28 23`; the patched page is `01 0d 0d 00 | 11 21 23 | 00 x9`. Emulator only: Normal 8.065 to 32.258 Hz, IP 3 refused
  by the build. The 4.8.x copy is op 1 on selection 0x11; the terminator selection 0x10 (`10 21 23`, op 1 on selection 0) froze the picture on the emulator.
- **4.16.1.7 FF** (16 Hz stock, `+0x9776`): `01 0d 0d 00 | 11 21 23 | 00 x3`. Emulator only.
- **Compact XR 4.8.2.1** (68-byte command pages, 4-byte substeps): steady page 13 (`+0x90F2`, next = alt = 13). Stock page 13 is
  `04 0d 0d 00 | 23 07 00 01 | 23 08 00 01 | 23 08 00 01 | 20 8a 03 01`, that is seed, accumulate, accumulate, mean4 with LAST (bit 7 of
  `chunk_op`). The patch makes it `01 0d 0d 00 | 23 81 03 01 | 00 x12`: one `frame_chunk_copy` with LAST, param `0x23` (the seeds' source
  selection), type 3, gpio 1.
  - Why `0x23`: the first candidate used param `0x20` (the terminator's selection). It ran at 31 ms, but its pictures sat above the sensor
    ceiling (mean about 15,600, 99.99 % of pixels over, against stock about 5,700), so it was rejected on the XR (`TESTING.md` 42.24).
  - Measured on the XR (serial 1E2A50YZ7628, IP mode 9, `TESTING.md` 42.24): steady interval 31 ms (32.0 to 32.2 Hz), 0 frozen pairs, the
    body mean median 5.6k to 5.7k (stock 5.67k in the same session). All-frame rate 24.7 to 26.1 fps, because the calibration stretch is
    not patched.
  - The corpus's Compact 4.8.2.1 entry (serial 2229A0YZ7E28) is the image the table names. It has not been measured on a camera.
  - The emulator's Normal rows for this image (IP 8 and IP 9) give 8.065 to 32.258 Hz (TESTING.md 42.27).

## 6. The Compact PRO 9 Hz builds (18 Hz)

The Compact PRO captures at 17.68 Hz and publishes every **second** capture, so it runs at 9 fps. The patch makes the steady row publish
every capture by removing its leading unarmed substep (the row's count goes from 2 to 1 and the armed substep moves to slot 0; the other slot
is zeroed, or left in place where a count of 1 never reads it, as in 4.9.1.15). The four entries are in the table. All four are offered at 18 Hz (owner, 2026-10-26). The two 4.9.x entries (4.9.1.15, 4.9.2.0) are stage two (TESTING.md 42.28): their banks are staged under Key A like the 4.8 Compact. The two 1.0.3.x entries (1.0.3.0, 1.0.3.2) are stage three (TESTING.md 42.29): their banks are staged under the image's own stage key and stored under key block 1, and the write is checked on the read-back decrypted. The write of each is proven on the emulator. The owner decided on 2026-10-19 that a patched build which is not measured is offered. The 4.9.1.15 rate is measured (corrected in 42.32): experiment A of FW-V1 `FRAME_RATE.md` sec.6.3 read 17.70 fps on a Compact PRO 4.9.1.15 camera, slot B, against 8.85 fps for the unmodified control on the same unit. 4.9.2.0 and 1.0.3.2 have no camera measurement. Measured in the emulator: Normal 8.84 to
17.68 Hz, with the picture level unchanged within a few per cent. The 1.0.3.0 rate is measured on the camera (TESTING.md 42.85, the FF
board running 1.0.3.0, bank A patched from the page): 17.68 fps, against 8.84 fps for the stock image in the same bank, with frames read
back to back (the camera's frame counter steps by 1 between frames on the patched image and by 2 on the stock one). The seek-fps checker
reads about 9 fps on the patched camera: it credits each frame after processing the last one, and loses every other frame at this rate
(`SKIP_STORMS.md`). `FRAME_RATE.md` in FW-V1 has the clock and row analysis.

## 7. How to apply it

With the firmware tool (`packages/cli`), on a camera that is connected over USB:

```sh
node packages/cli/dist/bin.js slots patch-fps a                         # dry run: prints the plan
node packages/cli/dist/bin.js slots patch-fps a --write --yes --acknowledge-risk --dump-dir ./before-patch
```

`--write` first saves bank A as stored and decrypted into `--dump-dir`, then writes the patched image and reads it back; the read-back
must differ from the saved dump only at the planned bytes. Or press **Make 32 FPS** on the Firmware slots page (**Make 18 FPS** on a
Compact PRO). The page and the CLI offer the entries in stage one (the plain 2014 chain: 0.8.0.0, 0.9.0.2, 0.9.0.6, 0.9.0.7, 0.9.1.0,
0.10.0.0, 1.0.0.0, 1.2.0.0, 1.3.0.0, 1.3.0.8), stage two (the Key A 4.x line: 4.8.1.7, 4.8.1.9, 4.8.2.1 at 32 Hz, and the Compact PRO
4.9.1.15 and 4.9.2.0 at 18 Hz) and stage three (the Compact PRO 2016 keystream line: 1.0.3.0 and 1.0.3.2 at 18 Hz). A build outside those
sets is refused with the reason.

**Then power-cycle the camera**: a bank only runs after the next boot. And check the boot-config word (section 9).

To undo: `seek-fw slots flash a <the saved ...-decrypted file> --yes --acknowledge-risk`, then power-cycle. (On the 4.8.2.1 an app write
leaves the bank in the store-key form instead of the factory Key A form; both boot.)

The CLI writes bank B with `slots flash b`. The J-Link runner's `flash-bank` writes bank B with `BANK_ADDR=0x14060000` (`targets/compact_8hz_1_3_0_0/tools/jlink/README.md`).

## 8. Measuring it

**The JS frame-rate checker** (`e2e/lib/bench/seek-fps/`, a port of the `tv-jc/macos` SeekKit and the `seek` tool). Run from the repo root:

```sh
R="node --import ./e2e/lib/bench/seek-fps/register.mjs e2e/lib/bench/seek-fps/seek-fps.ts"
$R --camera info                                 # model, firmware, serial, geometry
$R --camera --fps --mode normal --no-hifps       # Normal (IP mode 8), Hi FPS off: the Normal rate
$R --camera --fps                                # Hi FPS on (the default): IP mode 3
$R --camera stream -n 5 --no-hifps              # one status line per second, frozen pairs, % changed
```

`--camera` must be given to open a camera; a command with no source refuses. `--fps` measures five seconds after the first frame, and each
second's median is the median of the instantaneous rates of the intervals that end in it. The checker and the Swift tool agree on the bench
camera (section 4). A patched part streams from the emulator with `--emulator ENTRY --emulator-flash FILE`, which boots it as the build ENTRY names,
with that build's 32K sensor (FW-V1's `--flash-entry`, TESTING.md 42.42). That needs the FW-V1 branch `emu-sensor` until it is merged.
Before it, a `--flash` part got no frames, because the sensor was attached only for a corpus-entry boot. The Python rows below are the
other route; the 1.3.0.8 copy's emulator rate was measured through them.

**Lost frames on the checker's reads.** The checker can keep several bulk INs pending for each frame: `--in-flight`, default 3 (TESTING.md 42.75, from the host timing in 42.74). On the bench it reads one at a time. Its USB stack, node-usb 3.1.0, refuses a second IN on the endpoint while one is pending and cannot cancel one, so `--in-flight 2` and `3` are refused there. The libusb probe in 42.74 showed the gain: single skips fell from 23 to 32 a minute with one IN to 3 to 12 a minute with three. With one IN, six 60 s runs on the patched 1.3.0.0 gave 5 to 54 single skips a minute, three with the checker before the change and three with it after. That spread is the run-to-run variation 42.62 saw on one image, so the change does not show in the count (TESTING.md 42.75).

The cause is in TESTING.md 42.79 and `SKIP_STORMS.md`. The camera starts a frame only if its credit is already in place by about 7.5 ms after the previous frame's last byte, and the checker sends the next credit only after it has decoded and processed the frame. A credit that arrives later loses the next field, and the field after it is published: that is the 32/16 fps toggle. In 13 one-minute runs, every frame whose credit went out 6.6 ms or more after its last byte was followed by a lost field (3,691 of 3,691). So the checker's lost-frame counts depend on how macOS schedules its thread: 206, 349 and 421 lost fields a minute on a plain thread, against 750, 735 and 792 under `taskpolicy -b`. Treat them as host-and-camera numbers, not as camera numbers alone. With the credit sent at the frame's last byte (a wrapper in a scratch driver, not the checker), a plain thread drops to 66 to 90 lost fields a minute, against 234 to 470 for the checker's own timing in that driver, with no storm. A C loop with a prompt credit still loses about 25 fields a minute, from late transfer completions (the endpoint-busy skip of 42.74), and no storms.

The copy gate (candidate 6, FW-V1 branch `drop-path-study`, not in FW-V1 main) is not retested. 42.78's A/B measured the host thread, not the gate: its skip counts track the checker's per-frame JavaScript time (r 0.97). So its "no gain" verdict says nothing about the gate either way. A fair test would use a host loop with a prompt credit, judged against the residual of about 25 a minute (the endpoint-busy skip of 42.74). It was not run.

Owner decisions, 2026-10-20: the checker in `e2e/lib/bench/seek-fps` stays as it is, and still sends the next credit after it has decoded and processed the frame; the finding is documented only. tv-jc's `Camera.swift` `grabBytes` has the same order and is not changed now. The copy gate is not retested, as above. The checker stays on node-usb 3.1.0. See `SKIP_STORMS.md` (Status) and TESTING.md 42.79 for the record.

**The Swift tool** (`tv-jc/macos`, `seek --fps`): the same five-second medians, and `seek stream` for frozen pairs and changed pixels. The Pro
init is applied only on firmware 4.x and newer.

**The emulator, through the FW-V1 Python rows** (`emu/fps_patch_tests.py`). Each row boots a corpus entry with the patched image, sends the
vendor app's init and `SetImageProcessingMode` (IP 8, 3 or 9), and measures 80 frames:

```sh
SEEK_EMU_DIR=<FW-V1>/emu <FW-V1>/emu/.venv/bin/python emu/fps_patch_tests.py --only :ip --no-long -j 2     # the 36 IP rows
SEEK_EMU_DIR=<FW-V1>/emu <FW-V1>/emu/.venv/bin/python emu/fps_patch_tests.py --no-long --no-ip -j 2       # the 10 steady rows
SEEK_EMU_DIR=<FW-V1>/emu <FW-V1>/emu/.venv/bin/python emu/fps_patch_tests.py --only 1.3.0.0@32:ip8 --no-long
<FW-V1>/emu/.venv/bin/python emu/fps_patch.py --check FILE [--to 32]      # which patch applies to FILE (writes nothing)
```

`--only :ip` selects the IP rows, `--no-ip` skips them. The emulator's stock Normal rate is 8.065 Hz on the 2014 builds and 8.000 Hz on
the 40-frame steady control of 1.3.0.8; the patched rates are their doubling (32.258 Hz) within the 1 % band.

## 9. The trap: the boot-config word (the 2014-chain Compacts and the 2016 Compact PRO)

A patched bank only helps if the camera **boots** it. On the 2014 chain the bootloader reads the boot-config word at `0x14010000`
(`boot_select_image`, bootloader `src/image.c`); the 2016 Compact PRO's bootloader 1.2.0.0 has the same rule (FW-V1
`targets/compact_pro_9hz_1_0_3_0_bootloader/src/image.c:1076-1109`):

| word                    | boots first                                             |
| ----------------------- | ------------------------------------------------------- |
| `0` or `0xFFFFFFFF`     | slot A (`0x14050000`), then B, then recovery            |
| `1`                     | slot B (`0x14060000`), then A, then recovery            |
| anything else, e.g. `2` | **recovery R** (`0x14070000`), if its checksum is valid |

The firmware leaves a warm-boot magic (`0xAA55FF01` / `0xAA55FF02`) before a soft reset; the bootloader then writes `2` into the word and
boots recovery (_source_). The owner's patched 1.3.0.0 once ran at 8 fps for exactly this reason: a whole-flash J-Link dump showed the word
at `2`, A and B holding the 32 Hz patch, and R still stock. The event that flipped the word was not observed. A user dump of another 1.3.0.0
(`221A10H6HQC1`) shows the same state.

**What USB can read.** The analysis reads two words, both without writing:

- `cfg[0]`, the boot-config word. It is the word the next start uses.
- The active-slot word (`roots[8]`, GetFirmwareInfo selector 10). Selector 10 returns the address of the firmware's roots record, and the
  word is that record's +8 (TESTING.md 42.56). On 1.3.0.0 and 1.0.3.0 the record is the boot record at 0x10000200, so the word is 0x10000208:
  the bootloader writes the slot it enters there before it starts the image (0 slot A, 1 slot B, 2 recovery R; 42.53). On 4.9.1.15 the record
  is at 0x10002110 and the word is 0x10002118, which follows the bank that ran (42.56). On 4.8.2.1 selector 10 returns zero, so the word reads
  0 under every boot word and the record is not located (42.56). The cell `0x1000AED0` is not the word on these lines: it holds copy-loop data
  on 1.3.0.0 and 1.0.3.0 and `0xFFFFFFFF` on 4.9.1.15 (42.53, 42.56). On the 2014 chain and the 2016 Compact PRO the page and the CLI
  name the booted bank from the word, with 2 as R.

**The warning.** `packages/core/src/slots/boot-choice.ts` works out the bank the next start runs from the word and each bank's image check,
and the page and the CLI warn when a frame-rate patch sits in a bank that will not run. For word 2 with slot A patched and recovery R stock,
the text is:

> The camera boots recovery R. The boot-config word is 2, so the bootloader tries recovery R first, and it holds an image the bootloader
> accepts. Slot A holds a frame-rate patch, but it does not run, so the patch does not take effect. Patch recovery R too (the bank that
> runs): that is what makes the frame-rate patch take effect.

The same paragraphs show on the page's slot alert and the "Make N FPS" dialog, in `slots list` and `slots patch-fps` in the CLI, and in its
JSON. The button stays enabled; the warning is text. The warning applies where the rule and each bank's check are decoded: the 2014
plaintext chain, whose check is the stored word sum, and the 2016 Compact PRO (1.0.3.0, 1.0.3.2) read under `compact-2016`, whose check is
the bank decrypted under the key its bootloader checks a bank under (key block 1 on bootloader 1.2.0.0). The bootloader block that holds
that key is refused on every channel, so the read names it from the bank the camera reports it entered (TESTING.md 42.84). On the owner's
1.0.3.0 camera, recovery R was patched to 18 Hz with the word erased (`0xFFFFFFFF`), so slot A ran and the camera stayed at 9 Hz; the
warning there reads:

> The camera boots slot A. The boot-config word is 0xFFFFFFFF, so the bootloader tries slot A first, and it holds an image the bootloader
> accepts. Recovery R holds a frame-rate patch, but it does not run, so the patch does not take effect. Patch slot A too (the bank that
> runs): that is what makes the frame-rate patch take effect.

(Built from the owner's 1.0.3.0 dump with R patched, on a fake camera, TESTING.md 42.84; the same text on the camera after R was patched
from the page, TESTING.md 42.85, where the rate stayed 8.84 fps until slot A was patched too.)

**Bench check** (owner's unit, J-Link on channel 1): the word was set to 2 with `set-boot-recovery`, and `slots list` printed "boot-config
word 0x00000002 — recovery R first, then A, then B", "next start runs recovery R", and "last start the camera reports it entered recovery R
(active-slot word 2)". The word was restored to 0 with `set-boot-slot-a`, and `info` reported booted slot A (`TESTING.md` 42.27).

**Rule of thumb.** The word must be 0 (or 1 for B) for the patched bank to run. A warm reset can set it to 2 again. Writing the patched image
to recovery R as well would stop that, at the cost of the stock recovery image. The owner's unit holds the 32 Hz image `d91284c6...` in R,
so a flip to R would not drop the rate there (not tested by flipping the word). The J-Link runner's `set-boot-slot-a` writes the word back to 0 (`BOOT_CFG_TEMPLATE` must be a dump of the same unit).

## 10. Not established

- Hi FPS on the emulator for 4.8.1.7 and 4.8.1.9 (the build refuses mode 3), and for the XR as its own corpus entry.
- The 4.8.1.7, 4.8.1.9, 4.16.1.7 FF, 1.3.0.8 FF, the Compact 4.8.2.1 and the Compact PRO 4.9.2.0 and 1.0.3.2 builds on a camera (4.9.1.15 is measured, 17.7 fps: 42.32; 1.0.3.0 is measured, 17.68 fps: 42.85). The 4.8.2.1 is measured
  on the XR only (42.24).
- The write to banks B and R of the Key A builds: the stage-two emulator tests write bank A only, and the page offers the same patch on
  every bank that holds the image (42.28). The 2016 keystream builds (stage three) are the same: the emulator test writes bank A only (42.29).
- Long streams. The frame-sequence limit moves the program on and returns it after a number of captures, so a 32 Hz
  stream may leave 32 Hz on a long run (`docs/FPS_PATCH_LONG_STREAM.md`). Not measured for any 32 Hz entry.
- Over-ceiling behaviour of the copy on a 32K camera. No 32K emulator scene has samples at or above 15,000, and the camera's scene in the
  1.3.0.8 run had no warm pixel. The bright-scene result is the emulator's.
- The 0.7.0.8 stock picture differs between two sessions on the same unit (level 5,649 and std 38 in one, 5,716 and 34.3 in the other), so
  the picture comparison depends on the session it was made in.
- The 1.3.0.8 op-5 entry: 26 fps in 42.20, and 32.2 fps for the same image in 42.27 on the same unit. The cause is not known.
- The 0.10.0.0 patched Hi FPS mean (23.4) is below its stock mean (27.4); the cause is not known. The first 0.9.1.0 run (27.8 to 30.8 fps) was
  not reproduced.
- The 1.3.0.0 stock picture and rate on the camera in the 42.27 run (the 8.0 fps in 42.25 was the 16 Hz image).
- Modes 4 and 7 on a camera. Mode 4 is measured on a Compact: stock 1.3.0.0 and stock 1.3.0.8 stream live pictures, one capture per
  published frame, with no patch; whole-run rates were 26.8 to 32.2 fps on 1.3.0.0 and 28.7 to 31.9 fps on 1.3.0.8 (TESTING.md 42.54, 42.58).
  Mode 7 has no capture program: it sends a synthetic ramp, not a sensor picture (TESTING.md 42.43; FW-V1 `docs/FRAME_RATE_MODES.md`), so it is
  not measured.
- The writer of the 4.9.1.15 word at `0x10002118` is not established. The reconstructed reset code that would write the roots record does not
  match this factory image, and the 4.8.2.1 record is not located, so its word is not measured (TESTING.md 42.56).
- The TypeScript checker's `--flash` route for patched parts (no frames, see section 8).
- The owner's unit has two identifiers. `101310HSNEA2` is the ASCII device serial, shown as `serial` by the CLI and the page, and by the
  checker since `cde6257`. `1013CE098ACA` is the GetChipID value, shown as `chip id` (TESTING.md 42.61). The checker printed the chip id as
  its serial before that.

## 11. The 16 Hz patches were removed

All 8 to 16 Hz patches (1.2.0.0, 1.3.0.0, 1.3.0.8, 4.8.1.7, 4.8.1.9, 4.8.2.1) and the 1.3.0.0 16-to-32 migration entry are out of the table,
the page, the CLI (`--to 16` is not a choice) and the tests (`TESTING.md` 42.26). Each build now has a 32 Hz entry where the layout allows
one (1.2.0.0 included, since 42.27). A camera that still carries an old 16 Hz image is read as an unknown image: restore the stock image
first, then press "Make 32 FPS". The 16 Hz FF builds (1.3.0.8-FF, 4.16.1.7-FF) are stock 16 Hz images, not patches, and keep their 32 Hz
entries.

## 12. Maintaining the patch table

`FW-V1/emu/fps_patch.py` is the source of truth. `packages/core/src/preservation/fps-patch-table.ts` is generated from it, and the
differential fixture `packages/core/test/preservation/fps-patch-python.json` is generated from it too:

```sh
/Users/yrambler2001/things/a.noindex/seek/FW-V1/emu/.venv/bin/python scripts/gen-fps-table.py
npx prettier --write packages/core/src/preservation/fps-patch-table.ts
```

Each entry's evidence becomes a plain-text comment, and the `#` comment lines above each `Edit(` in `fps_patch.py` become the explanation
above that byte edit in the TypeScript. Write that explanation for every new edit (the script says when one is missing). The differential
test (`packages/core/test/preservation/fps-patch.differential.test.ts`, run with `SEEK_FPS_CORPUS`) checks the generated table and the
fixture against the Python output byte for byte. Stage sets are in `packages/core/src/preservation/fps-patch.ts`
(`FPS_STAGE_ONE_IDS`, `FPS_STAGE_TWO_IDS`, `FPS_STAGE_THREE_IDS`); a new entry is not offered until it is in one of them.
