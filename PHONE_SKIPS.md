# Android phones losing every other frame on the 32 fps Compact: the endpoint-busy skip, and the no-skip firmware patch

On a Redmi 4X the bench Compact (1.3.0.0, 32 Hz) lost 84-88 % of its frames in long 16 fps stretches; a Pixel 8 Pro lost 1.5 %. This file
states the cause, how it was shown on both phones, the one-branch firmware patch that removes it, its flash on the bench Compact on
2026-10-26 and what it measured after. It is the second cause of the 32/16 fps toggle next to `SKIP_STORMS.md` (a credit sent late). The
per-firmware patch table, side effects and emulator runs are FW-V1 `docs/NOSKIP_PATCH_ALL_FIRMWARES.md`; tools here in `scripts/phone-skip/`,
raw logs in `SEEK_BENCH_WORK/phone_skip_2026-10-26/`. Tags: [measured] a phone or camera run, named; [source] the 1.3.0.0 reconstruction
(`FW-V1/targets/compact_8hz_1_3_0_0/src/`); [inferred] not measured directly.

## The short answer

- The Android Seek app (2.3.4, with or without the seek-patch builds) sends each frame's credit (ImageData, 0x53) 0.5-1.2 ms after the frame's
  last chunk, well inside the credit window of `SKIP_STORMS.md` (about 7.5 ms after the last byte). Late credits are not the cause here.
- The cause is the endpoint-busy check at the field start (`app_init.c:952-961`, TESTING.md 42.74): if the previous frame's last 16,224-byte
  chunk is not yet read out when the next field begins, the camera logs "USB TX not complete - Skipping field" and sends nothing that field.
  The last chunk is primed at the field's last row group and the check comes one group later, a margin of about 0.7-0.8 ms [source, 42.74].
- The Redmi's USB host (Qualcomm EHCI on a micro-USB OTG port) drains a waiting 16 KB chunk in 1.38 ms median; the Pixel in 0.82 ms
  [measured]. The Pixel is about 0.3 ms inside the margin, the Redmi past it most of the time, and the outcome holds for dozens of frames.
- Fix: one Thumb branch in the firmware jumps over the skip block (FW-V1 doc). Flashed in all three banks of the bench Compact: the Redmi now
  streams 32 fps between shutter clicks, and the Pixel tolerates a last chunk read about 5.5 ms late instead of 0.3 ms [measured].

## How it was shown (phones, 2026-10-26)

**Setup.** Camera on the phone's USB; phones over Wi-Fi adb. Redmi 4X (santoni, Android 7.1.2, 6 cores at 1.4 GHz, EHCI `ehci_hcd park=3
log2_irq_thresh=0`); Pixel 8 Pro (Android 16, xHCI). The app: seek-patch 0.9.0 side-by-side builds of 2.3.4, plus a probe build that logs
every frame's request and chunk times and can hold the request or the last chunk's read late (`scripts/phone-skip/`).

**1. Phone side is fast** [measured: Redmi atrace, Pixel Perfetto]. Chunks reach both phones 7.8 / 7.8 / 7.0 ms apart, 31.07 ms per frame (the
firmware pushes them at row groups 44 / 84 / 124 / 160, ~0.195 ms a row [source]). The request goes out 0.6 ms (Redmi) / 1.2 ms (Pixel) after
the last chunk; its control transfer completes in 0.29 / 0.47 ms; the USB thread wakes in 0.02 ms median (99 % within 1.1 ms). The request is
counted in the USB interrupt before the status stage (`usb_ctrl_xfer_handler` -> `cmd_ImageData`), so a completed transfer is a counted credit [source].

**2. The request time does not matter** (Redmi, probe build, request held a random 0-8 ms, 120 s, `csweep.log`):

| request after the frame's first chunk | on time | skipped |
|---|---|---|
| 23-24 ms | 38 | 144 (79 %) |
| 24-28 ms (four 1 ms bins) | 41 each | 191-219 (82-84 %) |
| 28-29 ms | 31 | 225 (88 %) |
| 29-30 ms | 3 | 206 (98.6 %) |
| 30 ms and later | 0 | all |

Flat until about 29 ms (the credit window: 22.6 ms + about 6.5 ms), so the skips are decided before the request matters.

**3. The last chunk decides** (probe build, read of each frame's last chunk held a random 6-8.5 ms; holds under ~7 ms change nothing on the bus):

| last chunk arrived after chunk 3 | Redmi skipped (`lsweep.log`) | Pixel skipped (`pix_lsweep.log`, 6-9.5 ms) |
|---|---|---|
| 6.5-7.0 ms (normal: 6.95-7.03) | 1 of 4 | 8 of 69 (11.6 %) |
| 7.0-7.5 ms | 147 of 157 (93.6 %) | 177 of 302 (58.6 %) |
| 7.5 ms and later | **1,681 of 1,681** | 1,568 of 1,570 |

In the Redmi run the requests went out 24-27 ms after the first chunk, where run 2 had 16 % on time; with the last chunk late, none were.

**4. The drain** (queue -> the app sees the chunk, the chunk already waiting in the camera: hold of 8 ms or more):

| | median | 10-90 % |
|---|---|---|
| Pixel 8 Pro | 0.821 ms | 0.666-1.016 |
| Redmi 4X | 1.378 ms | 1.124-1.666 |

About 0.25 ms of each is software (the 4-byte control transfer's 0.29 ms on the Redmi includes it), so the Redmi needs roughly 1.1 ms on the bus
for 16 KB (~15 MB/s) [inferred].

**5. Ruled out on the Redmi.** CPU starvation (USB thread latency above); the DDR bandwidth vote (two `dd` memory loads held `cpubw` at its
maximum 7031: 85.8 % skipped, `load1.log`); EHCI tuning (park mode and the minimum interrupt threshold are already set, the parameters are
read-only); sending the request sooner (the `usb_queue` experiment in apk-patches: no gain on the Pixel, and the request time does not matter, 2).

## The fix: skip nothing at the field start

FW-V1 `docs/NOSKIP_PATCH_ALL_FIRMWARES.md` has the per-image table (every Compact PID 0x0010 build, 0.3.0.1 to 1.3.0.8 FF and the 4.x / XR
lines), the integrity rules, the side effects and the emulator runs; `emu/instruments/noskip/make_noskip.py` builds and verifies the images.
For the 1.3.0.0 32 Hz image `ef90c94a`: file 0x6190 (runtime 0x100864F8) `18 b3` (`cbz r0`) -> `23 e0` (`b.n`, same target 0x61DA), and the
acceptance word at +0x238 -> `0x19891ADA` so the word sum stays 0: image `edeabb71…` (4 bytes differ). Side effects in short: no new hang (a
frame still starts only with the IN queue empty, at most 5 of 8 slots per frame); one new risk, a torn frame instead of a dropped one when a
chunk sits unread more than about 23 ms (the chunks are sent straight from the frame pool).

## The flash (bench Compact `101310HSNEA2`, 2026-10-26, J-Link)

- The owner attached the J-Link (channel 1 was off on the switch; turned on for the session, off at the end). J-Link CE `69656086`, SWD 4 MHz,
  `LPC4330_M4`, VTref 3.34 V, CPUID `410FC241`.
- Two full 4 MB reads, byte-identical: backup sha256 `78e53151…`. All three banks held `ef90c94a` (not `d91284c6` as in 42.79), boot word 0.
- `flash-bank` (`targets/compact_8hz_1_3_0_0/tools/jlink/jlink-runner.js`, `BANK_FORM=plain-2014`, plain bank `dce0ed45…` = image + 0xFF to
  64 KiB) to A, then B, then R, each `loadbin` + `verifybin` OK (R printed "CPU could not be halted ... alternate halt strategy", then verified).
- A re-read differs from the backup in exactly 12 bytes (0x14050238-9, 0x14056190-1 and the same in B and R). After each step the camera was
  cold-booted by switch channel 2 (no J-Link reset: a warm reset can set the boot word to 2): it enumerates, boot word 0, and the code running
  at 0x100864F8 reads `E023`.
- Files: `SEEK_BENCH_WORK/101310HSNEA2_1300_32hz_before_noskip_2026-10-26.bin` (backup), `…_noskip_ABR_2026-10-26.bin` (after, `18cdbeb6…`),
  `…_noskip_bank64k.bin` (the bank written). Restore: `flash-bank` the stock bank to each bank, or `flash-factory-4m-2` with the backup, then
  a channel-2 power-cycle.

## After the flash (measured)

- **Redmi 4X** (normal 0.9.0 build, 60 s, `fw_lc1.txt`): 1,764 frame requests in 61.4 s = 28.7 fps with the shutter pauses (one 0.43 s pause
  every ~3.4 s); of the 1,721 frame gaps outside those pauses, 1,695 are one period and 26 two (the post-shutter skip, plus 2 isolated). On
  screen (`fw_sf1.txt`): 32 or 33 frames in every second without a shutter click; the app's readout 32.1 Hz; the picture normal. Before:
  84-88 % skipped.
- **Pixel 8 Pro** (probe build): 1.4 % skipped in normal use (`pix_fw_base.log`; 1.5 % before, both the post-shutter skip). Last chunk held
  6-16 ms (`pix_fw_lsweep.log`): arriving up to 12.5 ms after chunk 3 (about 5.5 ms late) 0-10 % skipped, where 0.5 ms late was 100 % before;
  beyond that the only loss is the credit window (requests 23-28 ms after the first chunk 0.4-1.5 % skipped, 29-30 ms 91 %, later 100 %).

## Bench state after this work, and what is open

- The Compact `101310HSNEA2`: banks A, B and R hold `edeabb71` (the 32 Hz image + no-skip), boot word 0, booted A. (`plan.md` section 2
  said A `ef90c94a`, B and R `d91284c6` until 42.93.) The J-Link was moved to this camera by the owner for the flash.
- Phones: the Pixel back on its 0.9.0 build, the Redmi on 0.9.0; `debug.seekprobe` cleared on both.
- Open: a tear check (probe app, last chunk held 15-30 ms, a moving scene, look at the chunk seams at rows 38/39, 77/78, 116/117); a 30-minute
  soak (shutter cycles, pause / resume, phone sleep, replug); the 4.x / XR rows are a table only.
- The run record is `TESTING.md` 42.93.
