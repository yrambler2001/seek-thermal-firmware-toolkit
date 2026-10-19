# seek-fps: the Swift `seek` frame-rate checker, on Node

A TypeScript port of `tv-jc/macos` (SeekKit and the `seek` CLI): the same init sequences, frame decode,
calibration state machine and frame loop, and the CLI commands `info`, `stream` and `--fps`. It runs over the
real camera (through the CLI's USB layer, `packages/cli/src/node-usb.ts`) or over the FW-V1 emulator (through
`packages/core/test/emulator`). The same code runs on both; only the link differs (`link.ts`).

## Run it (from the repo root)

Node runs the TypeScript directly through the loader in this folder (no build step):

```sh
R="node --import ./e2e/lib/bench/seek-fps/register.mjs e2e/lib/bench/seek-fps/seek-fps.ts"
$R --camera info                                # the bench camera: model, firmware, serial, chip id, geometry
$R --camera --fps --mode normal --no-hifps      # Normal (IP mode 8), the Hi FPS box unticked
$R --camera --fps                               # Hi FPS: Normal with Init Hi FPS on (the default)
$R --camera --fps --mode fast                   # FastRaw (IP mode 3)
$R --camera --fps --mode raw                    # Raw (IP mode 0)
$R --camera stream -n 5 --no-hifps              # one status line per second, frozen pairs, % changed
```

Against the emulator, give a corpus entry and point SEEK_EMU_DIR at the FW-V1 `emu` directory:

```sh
SEEK_EMU_DIR=/Users/yrambler2001/things/a.noindex/seek/FW-V1/emu $R --fps --emulator "compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump" --mode normal --no-hifps
```

The emulator runs under `<SEEK_EMU_DIR>/.venv/bin/python` when that exists, else under `SEEK_EMU_PYTHON`, else `python3`.
A checkout without a `.venv` (a worktree, say) needs `SEEK_EMU_PYTHON` set to the venv's Python.

`--emulator-flash FILE` boots a 4 MiB part instead of the entry's own flash. The part is booted as the build ENTRY names
(its board, and its 32K sensor), so a patched part streams frames too (see "The emulator and the patched images" below):

```sh
SEEK_EMU_DIR=/Users/yrambler2001/things/a.noindex/seek/FW-V1/emu $R --fps --emulator "compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump" --emulator-flash patched.bin --mode normal --no-hifps
```

A command needs a source: `--camera` (the bus) or `--emulator ENTRY`. `--camera` must be given explicitly to open a camera;
without a source the command refuses, so a stray run does not open a bench camera.

Flags, as in `main.swift`: `--mode normal|fast|raw`, `--no-hifps`, `--no-opzero`, `--no-pro-init`,
`--raw-min N`, `--raw-max N`, `-n SECONDS`, and the presses `--nuc`, `--big-nuc`, `--shutter-close`,
`--shutter-open`. `snapshot` and `deadpixels` are not ported (they need the Swift image renderer).

`--in-flight 1..4` sets how many bulk INs are kept pending for each frame (default 3; `1` is one at a time, as
before TESTING.md 42.75). A USB stack that takes fewer runs with that many: node-usb 3.1.0 on the bench takes one, so the
default reads one at a time there, and `--in-flight 2` or `3` is refused with a message. `stream` and `--fps` end with
the count they used.

**Normal means `--no-hifps`.** "Init Hi FPS" is on by default, as in the panel: the camera's first shutter
frame switches a Normal stream to FastRaw (IP mode 3), which is about 32 fps. Without `--no-hifps` the `--fps`
line is a Hi FPS line, not a Normal one.

**A build that refuses Hi FPS.** The 1.3.0.8 family refuses FastRaw (IP mode 3) with `0x3e`. On such a build the
default run publishes no frame, and the checker does not fall back to Normal: it prints the refused init and exits 1
(`seek: no frame was published in the 1 s stream: the camera refused the FastRaw init that Init Hi FPS sends ...`).
Run it again with `--no-hifps` to measure Normal, which the build takes. A silent fallback would make the number a
different measurement from the one asked for, and the refused init leaves the stream stopped, so it could not be
restarted in Normal without new logic in the frame loop (TESTING.md 42.59).

## What it sends to the camera

Only the requests the Swift tool sends (the lists are `CHECKER_REQUESTS_IN` and `CHECKER_REQUESTS_OUT` in
`camera.ts`):

- IN: `0x36` GetChipID (12 bytes: the chip id, every other byte in hex, on the info line), `0x4E` GetFirmwareInfo
  (8 bytes; two consecutive replies that agree on the version, with a major of 0 to 9, are the version the init is
  chosen from; at most 26 reads, about 500 ms, while a build starts up; 4 bytes before each init).
- IN, for the serial (read once at connect, before the first init, as the CLI's `info` reads it): `0x35`
  GetErrorCode (4 bytes), and `0x4F` GetFeaturedFirmwareData, or `0x58` on a 0.7.x build, in 64-byte requests for the
  first 248 bytes of the device-id block. The serial is the ASCII at +16 (TESTING.md 42.37, 42.61).
- OUT: `0x5A` SetRamDataFeatures (case 0, which arms the device-id block for that read; the same request the CLI's
  `info` makes), `0x37` Startup with Operation=0 (classic init), `0x3C` SetOperationMode (1 starts the stream, 0 stops
  it; three times at disconnect, and three times before an init on a build that took no 0x37), `0x3E`
  SetImageProcessingMode (the mode), `0x53` ImageData (one frame credit per frame), `0x54`, `0x55`, `0x56` the rest
  of the classic and Pro inits.
- Bulk IN on endpoint 1 (0x81): the frame bytes, 64896 (Compact) or 177840 (Pro). One credit per frame, sent after the
  frame's last byte; the INs for a frame are kept pending as `--in-flight` says (TESTING.md 42.74, 42.75).

It never sends a flash write or a reset (`0x50`, `0x51`, `0x52`, `0x59`). `0x5A` is the one setter of the info read
(core's `FLASH_OPS` lists it with the other info-read arms); it changes no flash and no image. The Compact Pro init is used
only on a Compact on firmware 4.x or newer with the option on; a 1.x Compact always gets the classic init.

**The two labels.** The info line prints `serial` and `chip id` as two fields. `serial` is the ASCII device serial
(`101310HSNEA2` on the bench Compact), the same one the CLI `info` and the slots page show. `chip id` is the GetChipID
value (`1013CE098ACA`). The USB string is not used. If the serial cannot be read, the line says `serial -` and still
shows the chip id under its own label, so the chip id is never printed as the serial. The Swift `seek info` prints the
same two fields in the same order.

**When the connect fails.** The checker reads GetFirmwareInfo before it sends any init, and a failed connect says
which of three things happened (TESTING.md 42.58):
- **The camera did not answer.** No read got a reply: each one failed, stalled or timed out, or the camera is not on
  the bus at all. The message says so and says to wait for the camera to come back after a power cycle. Nothing
  is sent to it, and this includes a Pro.
- **The replies cannot be trusted.** Replies came, but no two consecutive ones agreed, or the major is not a Seek build
  (window bytes, major 184). That is a camera unlocked by a slots command: the CLI's `info`, `dump` and `slots` send
  the unlock token (`0x52`), and the camera stays unlocked until its next power cycle (TESTING.md 42.41). The checker
  stops before an init (a Pro still connects, with its firmware unnamed).
- **An init is refused.** The camera answers, and refuses an init request (a STALL). The message gives the same
  unlock cause as the second case, since a camera unlocked by a slots command also refuses inits.

Power-cycle the camera and run again in each case. A build that refuses Startup with Operation=0 (the 1.3.0.8 family)
is connected without it, and `info` says so.

**Mode 4.** `--mode 4` is IP mode 4, one capture per published frame. Its frames can carry no header type on a
camera (status 0), so in that mode the checker counts them as pictures and reports how many there were; in the
other modes status-0 frames are dropped and counted too.

## Measurement

A stream that publishes no frame in its window exits 1 in every mode: `stream -n N` when no frame came in its N
seconds, and `--fps` when none came in its wait for a first frame (up to 10 s). The message names the refused init
when the camera refused one.

`--fps` starts the stream, waits up to 10 s for the first frame, drops the arrival times, then measures five
seconds from there. Each second's `mean` is the frame count of that second, and its `median` is the median of the
instantaneous rates of the intervals that end in it (Swift `FPSWindow`). The clock is the host's on the bus, and
the emulated camera's own clock (`device.deadlineClock`) on the emulator, so an emulator rate is the emulated camera's
rate, not the rate of the host running it.

## Tests

```sh
npx vitest run --config e2e/lib/bench/seek-fps/vitest.config.mjs      # the unit tests: no camera, no emulator
npx vitest run --config e2e/vitest.config.ts seek-fps-emulator.e2e --testTimeout=600000   # SEEK_EMU_DIR needed
SEEK_E2E_TARGET=camera npx vitest run --config e2e/vitest.config.ts seek-fps-camera.e2e    # read-only, the bench
```

The unit tests port `FrameTests.swift` and cover the decode, the calibration steps, the init choice, the
firmware-info retry, the request list and the CLI, on a fake camera driven through core's `WebUsbTransport`.
The emulator spec measures the stock builds (1.3.0.0, 1.3.0.8, 1.3.0.8-FF) in each IP mode through their corpus
entries. The image-only 1.3.0.8 builds refuse the Startup with Operation=0 write, so they run with `--no-opzero`. It builds the patched parts, boots them with `--flash-entry` (through `emulator-link.ts`), and measures their Normal rate the same way (see the emulator section).
The camera spec runs `info` and `--fps` in Normal and Hi FPS, and fails on any request outside the lists above.

## The emulator and the patched images

The emulator streams frames for a 32K part only when the FW-V1 CLI gives it a 32K sensor. The sensor is the one
the build's corpus entry gets (`seekemu/cli.py`): a corpus-entry boot gets it, and so does a `--flash` part when
the caller names the build with `--flash-entry`. `emulator-link.ts` passes the `--emulator ENTRY` as that name, so
`--emulator ENTRY --emulator-flash FILE` boots the part as the build ENTRY and streams it. (Before `--flash-entry`, a
`--flash` part got the SGPIO sensor instead of the 32K one, and the checker received no frames from it.)

Measured through the checker (FW-V1 emu, Normal, `--no-hifps`, the device clock; the frames of
`compact/2014.10.21-14.58.29-1.3.0.0/101310HSNEA2/dump` and `compact/2020.02.26-11.23.26-4.8.2.1/2229A0YZ7E28/dump`
with the table patch written by `fps_patch.py`):

| build (entry)                      | stock, IP 8 Python row | patched, checker `--emulator-flash`, per-second medians | patched, mean |
| ---------------------------------- | ---------------------- | ------------------------------------------------------- | ------------- |
| 1.3.0.0 (2014 chain, full dump)    | 8.065 -> 32.258 Hz     | 32.26 in all five seconds                               | 22.6 fps      |
| 4.8.2.1 (Key A, Compact full dump) | 8.065 -> 32.258 Hz     | 32.26 in all five seconds                               | 23.8 fps      |

The medians match the Python IP rows (32.258 Hz). The means are lower: the calibration and shutter stretch is not patched
(FW-V1 `docs/FPS_PATCH_LONG_STREAM.md`, `FPS_32HZ.md` section 1), so the checker's `mean` over five seconds is about 20 to 24 fps.

The FW-V1 Python rows still measure the patched rate in each IP mode, with the picture checks (frozen pairs, alternation,
the ceiling share) and the ratio against stock:

```sh
SEEK_EMU_DIR=/Users/yrambler2001/things/a.noindex/seek/FW-V1/emu \
  /Users/yrambler2001/things/a.noindex/seek/FW-V1/emu/.venv/bin/python \
  /Users/yrambler2001/things/a.noindex/seek/FW-V1/emu/fps_patch_tests.py --only 1.3.0.0@32:ip8 --no-long
```

Each `--only <build>@<target>:ip<mode>` row boots the corpus entry with the patched image, sends the vendor app's init and
SetImageProcessingMode for that mode (8, 3 or 9), and measures 80 frames. `--only :ip` selects all 36 IP rows and `--no-ip` skips
them (`fps_patch_tests.py --list` shows them). Those Python checks are the authority for the picture; this checker measures the
rate through the same code path the bench camera uses.

A patched bank on the bench is measured with `--camera`, once the camera boots that bank (`slots patch-fps`, then a power cycle).

## Not carried over from the Swift

- The Render part of `Render.swift` (the colour image and the PNG writer). `FPSWindow` is ported.
- The Swift's hexagon skip (`Frame.swift`) is kept as written, and it fires once: only the byte-10 word of row 0
  is skipped (its hexagon position is a byte offset that moves to an odd value).
