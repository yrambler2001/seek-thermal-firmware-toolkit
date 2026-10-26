# phone-skip: timing the Seek app's frame reads on an Android phone

Tools behind `PHONE_SKIPS.md` (2026-10-26). They time the Android Seek app's camera reads frame by frame and can hold two things late
on purpose, to tell a late frame request from a late last chunk.

## The probe app (`apk-patches/`)

An experiment patch for the owner's `apk-patches` repo (seek-patch), not a release patch:
- `usb_probe.py`: adds four calls to the camera library's frame read (2.3.4: `com/tyriansystems/Seekware/a$a.smali` `run()` and
  `a.smali`): before and after the frame request (control transfer 0x41 / 0x53), before each chunk's `UsbRequest.queue()`, after each
  `requestWait()`. Nothing is changed.
- `usb_queue_finders.py`: the call shapes it matches (shared with the `usb-queue` branch's experiment).
- `UsbProbe.java`: the helper. Every frame goes to logcat (tag `SeekProbe`, 16 frames per entry) as
  `seq requestStart requestDuration cDelay lDelay chunk1 chunk2 chunk3 chunk4`, microseconds, chunks relative to the request's start.
  Delays come from the property `debug.seekprobe`, re-read every second (readable by the app on Android 7.1 and 16):
  - `c=min-max`: wait a random time (us) before each frame request;
  - `l=min-max`: wait a random time before queueing the read of each frame's last chunk.

Build (a worktree of `apk-patches` main, 0.9.0):
```sh
git -C apk-patches worktree add --detach /tmp/probe-wt main
cp apk-patches/*.py /tmp/probe-wt/src/seekpatch/patches/ && cp apk-patches/UsbProbe.java /tmp/probe-wt/helpers/java/seekpatch/
# register usb_probe in src/seekpatch/patches/__init__.py (import + ALL); set RECOMMENDED = True to get it with the default set
ANDROID_HOME=... python helpers/build.py                       # compiles UsbProbe.java to smali
PYTHONPATH=src python -m seekpatch patch Seek+Thermal_2.3.4.apk --side-by-side -o seek-2.3.4-probe.apk
```
It installs over the side-by-side build (`com.tyriansystems.SeekThermal.patched`, same key) and keeps its data.

## Scripts

- `cap.sh <name> <seconds> [prop]`: sets `debug.seekprobe` on the phone (`SERIAL=<adb serial>`), streams the SeekProbe log for N seconds
  into `<name>.log` next to the script, runs `probe.py` on it.
- `probe.py <log>`: per frame pair: on time (next first chunk < 40 ms later) or one skipped (55-70 ms); skip rate; a `.`/`x`/`|` strip
  (on time / one skipped / longer, e.g. the shutter); with delays set, skip rate by request time after the frame's first chunk, by the
  last-chunk hold, and by when the last chunk arrived after chunk 3.
- `lc.py <log>`: camera frames per second from `logcat -v epoch -s UsbRequestJNI:D` (Android 7 logs `UsbRequestJNI: init` four times
  per frame request; no probe build needed).
- `sflat.sh <serial> <seconds> <out>` + `sfrep.py <out>`: frames shown on screen, from `dumpsys SurfaceFlinger --latency` polled every 1.5 s.

Raw logs of the 2026-10-26 runs: `SEEK_BENCH_WORK/phone_skip_2026-10-26/`.
