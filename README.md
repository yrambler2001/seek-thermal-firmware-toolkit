# Seek Thermal Firmware Toolkit

A tool for Seek Thermal cameras. It can:

- **read and back up** the camera's whole flash memory (4 MiB), with the firmware inside it;
- **decrypt** that firmware, or a dump you already have;
- **write one firmware bank** (slot A, slot B or recovery R), saving that bank first;
- **raise the frame rate**: a Compact to 32 fps, a Compact PRO to 18 fps.

It runs in your browser over WebUSB, or from the command line. Nothing is uploaded anywhere: the page
runs on your own machine, and the CLI talks to the camera directly. No SDK, no J-Link.

**→ [Open the web tool](https://yrambler2001.github.io/seek-thermal-firmware-dump/)**

![The Work with firmware slots tab on a Compact 1.3.0.0, with a Make 32 FPS button on each bank](.github/readme/slots.avif)

<!-- ![The page on an Android phone](.github/readme/phone.avif) -->

## Which cameras

The **Info** tab tells you which firmware a camera runs and which tab reads it.

| Camera and firmware                                   | Read and back up the flash                                                    | Decrypt | Write a bank        | Frame rate          |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- | ------- | ------------------- | ------------------- |
| Compact 0.3.0.1 to 0.6.0.4 (2014)                     | no: the firmware has no read command (a J-Link or SPI dump decrypts)          | yes     | no                  | no                  |
| Compact 0.7.0.7, 0.7.0.8                              | yes, Dump & decrypt 0.x/1.x (tested on the emulator only)                     | yes     | no                  | no                  |
| Compact 0.8.0.0 to 0.10.0.0                           | yes, Dump & decrypt 0.x/1.x (tested on the emulator only)                     | yes     | yes                 | 32 fps              |
| Compact 1.0.0.0, 1.2.0.0, 1.3.0.8                     | yes, Dump & decrypt 0.x/1.x (tested on the emulator only)                     | yes     | yes                 | 32 fps              |
| Compact 1.3.0.0                                       | yes, Dump & decrypt 0.x/1.x                                                   | yes     | yes                 | 32 fps              |
| Compact 1.3.0.8 FF (16 Hz)                            | yes, but the run leaves its patch in recovery R (tested on the emulator only) | yes     | yes (boot untested) | no                  |
| Compact PRO 1.0.3.0 (2016)                            | yes, Dump & decrypt 0.x/1.x                                                   | yes     | yes                 | 18 fps              |
| Compact PRO 1.0.3.2                                   | the 31 readable blocks only: no whole-flash read on this build                | yes     | yes                 | 18 fps (9 Hz build) |
| Compact 4.8.1.7, 4.8.1.9, 4.8.2.1; Compact XR 4.8.2.1 | yes, Dump & decrypt 4.x/Nano                                                  | yes     | yes                 | 32 fps              |
| Compact PRO 4.9.1.15, 4.9.2.0                         | yes, Dump & decrypt 4.x/Nano                                                  | yes     | yes                 | 18 fps              |
| Compact 4.16, Compact PRO 4.18, Mosaic, Nano 200/300  | yes, Dump & decrypt 4.x/Nano                                                  | yes     | yes                 | no                  |

"Write a bank" is the Work with firmware slots tab, on every build from 0.8.0.0. The details per build are in
[HOW_IT_WORKS.md](HOW_IT_WORKS.md#which-cameras) and [PRESERVATION.md](PRESERVATION.md#the-supported-builds).

## The five tabs

Each tab has its own address. Connect the camera with **Connect device** at the top of a tab and pick it
in Chrome's list.

### Info (`#/`)

![The Info tab after Read firmware version](.github/readme/info.avif)

**Read firmware version** asks the camera what it runs, how it boots, which keys it holds and what each bank
holds, and names the tab for that camera. It writes nothing to the flash. CLI: `seek-fw info`.

### Dump & decrypt 0.x/1.x 2014/2016 (`#/preserve`)

![The Dump & decrypt 0.x/1.x 2014/2016 tab](.github/readme/preserve.avif)

For the 2014 to 2017 cameras. They only let 31 of their 64 flash blocks be read, so this tab backs up what
it can, writes a small temporary patch, reads the whole flash, then puts the original firmware back and
checks it byte for byte. The two steps that write ask first. CLI: `seek-fw preserve`.

### Dump & decrypt 4.x/Nano (`#/v4`)

![The Dump & decrypt 4.x/Nano tab](.github/readme/dump-4x.avif)

For the 2018-and-later cameras. **Start dump** reads the whole flash but one block (`0x14060000`, which no
request reaches and which holds no firmware bank on these cameras), decrypts the firmware and downloads
it as one zip; it only reads. CLI: `seek-fw dump`.

### Decrypt File/Slot (`#/decrypt`)

![The Decrypt File/Slot tab](.github/readme/decrypt.avif)

No camera needed. **Choose dump file…** decrypts a whole flash dump (from this tool, J-Link or an SPI
programmer), and **Choose slot file…** one 64 KiB firmware bank. This works in every browser, Safari and
iOS included. CLI: `seek-fw decrypt file`, `seek-fw decrypt slot`.

### Work with firmware slots (`#/slots`)

![The Work with firmware slots tab on a Compact PRO, with Make 18 FPS](.github/readme/slots-pro.avif)

**Read slots** shows the three firmware banks (slot A, slot B and recovery R) and what each holds. A bank
can be dumped, written from a decrypted image, copied into another bank, restored from a whole-flash
backup, or given the frame-rate patch with **Make N FPS**. Every write asks first, saves the bank first and
reads it back after. CLI: `seek-fw slots`.

## Raise the frame rate (32 / 18 fps)

A stock Compact publishes one picture for every four sensor captures (8 fps), and a Compact PRO one for
every two (9 fps). The patch changes a few bytes in a firmware bank so every capture is published: about
32 fps on a Compact, 18 fps on a Compact PRO. At 32 fps the picture is not averaged, so it is noisier from
frame to frame, and the camera's calibration pause (about half a second every two seconds) stays, so most
frames come 32 a second but the average over several seconds is about 20 to 26. The 32 fps patch also
stops an Android phone from losing every other frame. [FPS_32HZ.md](FPS_32HZ.md) has how each build is
patched and measured.

Read the steps once before you start, use a computer on mains power, and keep the camera plugged in.

### Compact 1.3.0.0 → 32 fps

<!-- VIDEO Compact 1.3.0.0: paste the GitHub upload link here, on its own line -->

1. **Back up the whole flash** on **Dump & decrypt 0.x/1.x 2014/2016**:
   [the preservation run](#back-up-a-0x1x-camera-the-preservation-run). Keep its last run file.
2. On **Info**, press **Read firmware version**: the firmware is 1.3.0.0.
3. On **Work with firmware slots**, press **Read slots**. Each bank that holds 1.3.0.0 has **Make 32 FPS**.
4. Press **Make 32 FPS in every bank**, read the plan, tick the box and press **Yes — patch … banks** (the
   number is how many banks offer the patch: 2 in the picture below, where slot B is empty; [what happens](#what-make-n-fps-in-every-bank-does)).
5. Unplug the camera and plug it back in. Press **Read slots** again, then watch it in the Seek app.

```sh
seek-fw preserve --out ./preserve-run      # 1: the whole-flash backup (it asks twice)
seek-fw info                               # 2: the firmware version
seek-fw slots list                         # 3: the banks
seek-fw slots patch-fps all                # 4: the plan; nothing is sent
seek-fw slots patch-fps all --write --acknowledge-risk --dump-dir ./before-fps
seek-fw slots list                         # 5: after the unplug and replug
```

![The confirmation of Make 32 FPS in every bank](.github/readme/fps-plan.avif)

![The result after the writes](.github/readme/fps-done.avif)

### Compact PRO 4.9.2.0 → 18 fps

<!-- VIDEO Compact PRO 4.9.2.0: paste the GitHub upload link here, on its own line -->

1. **Back up the whole flash** on **Dump & decrypt 4.x/Nano**: press **Connect device**, pick the camera
   and press **Start dump**. It only reads. Keep the zip it downloads: it holds the 4 MiB flash image
   (`flash_4m_usb_partial_gap_ff.bin`) and the decrypted firmware. The one block no request reaches,
   `0x14060000`, holds no bank on this camera
   ([why it costs nothing](HOW_IT_WORKS.md#known-limitation-the-0x14060000-gap-on-4x-and-nano)).
2. On **Info**, press **Read firmware version**: the firmware is 4.9.2.0.
3. On **Work with firmware slots**, press **Read slots**. Each bank that holds 4.9.2.0 has **Make 18 FPS**.
4. Press **Make 18 FPS in every bank**, read the plan, tick the box and press **Yes — patch … banks**.
5. Unplug the camera and plug it back in. Press **Read slots** again, then watch it in the Seek app.

The commands are those of the Compact 1.3.0.0, with `seek-fw dump --zip ./camera-flash.zip` as step 1. The
18 fps patch of 4.9.2.0 has not been measured on a camera yet; 4.9.1.15 measured 17.70 fps.

### Compact PRO 1.0.3.0 → 18 fps

<!-- VIDEO Compact PRO 1.0.3.0: paste the GitHub upload link here, on its own line -->

1. **Back up the whole flash** on **Dump & decrypt 0.x/1.x 2014/2016**:
   [the preservation run](#back-up-a-0x1x-camera-the-preservation-run). Keep its last run file.
2. On **Info**, press **Read firmware version**: the firmware is 1.0.3.0.
3. On **Work with firmware slots**, press **Read slots**. Each bank that holds 1.0.3.0 has **Make 18 FPS**.
4. Press **Make 18 FPS in every bank**, read the plan, tick the box and press **Yes — patch … banks**.
5. Unplug the camera and plug it back in. Press **Read slots** again, then watch it in the Seek app.

The commands are those of the Compact 1.3.0.0. This build measured 17.68 fps on a camera.

### Back up a 0.x/1.x camera: the preservation run

On **Dump & decrypt 0.x/1.x 2014/2016**, press **Connect device** and pick the camera. Then:

1. **02 Read & build** — press **Start read & build**. It reads the 31 blocks the camera lets out and keeps
   them as your backup, reads each bank twice, works out which bank the camera starts from next and
   prepares the patch. Nothing is written; it usually takes under a minute. Leave **Banks to patch** as it
   is.
2. **03 Write & whole-flash read** — press **Start write & whole-flash read**, then **Yes — write to the
   camera**. It writes a small temporary patch into that bank, restarts the camera and reads the whole
   4 MiB flash. When the blue "Your turn" box asks, press **Connect device** and pick the camera again:
   that is expected, because the camera has no USB serial number and Chrome forgets it at every restart.
3. **04 Restore & verify** — press **Start restore & verify**, then **Yes — write to the camera**. It writes
   your original firmware back, restarts the camera (pick it again), and reads it once more to check it
   matches the backup byte for byte.

So the camera is written to twice, and ends exactly as it was. The page ends with **Done — your firmware is
preserved** and "matches the backup on all 31 blocks". After every step the browser downloads a run file;
keep the newest (`preserve-…-verified.zip`, or press **Download the full archive (run file)**). Its
`03-patch-dump/preserve_dump_original.bin` is the camera's complete original flash. A run can be continued
from its run file with **Load a run file…**. On a phone, turn on airplane mode and keep the screen on
before step 03. [PRESERVATION.md](PRESERVATION.md) has how the run works.

CLI: `seek-fw preserve --out ./preserve-run` runs the same steps and asks before it writes;
`./preserve-run/preserve_dump_original.bin` is the complete original flash.

### What "Make N FPS in every bank" does

- **Why every bank.** The camera does not always start from the bank it ran last: the bootloader picks the
  bank from a boot-config word, and a warm reset can switch it to recovery R. A patched Compact 1.3.0.0
  once stayed at 8 fps because slots A and B held the patch and it started from the still-stock recovery
  bank, and a Compact PRO 1.0.3.0 stayed at 9 fps with only recovery R patched, because it started from
  slot A ([FPS_32HZ.md](FPS_32HZ.md), section 9).
- **The plan.** The dialog **Make every bank run at 32 FPS?** (18 on a Compact PRO) lists each bank with its
  rate change, the banks left as they are and why, and the order: the bank the camera boots now goes last,
  so a failure stops before it. Writing that bank or recovery R needs the tick "I understand this writes …".
  A warning on the tab also says when a patched bank is one the camera will not run.
- **The backup.** Before anything is sent, the page reads the banks again and downloads one zip,
  `seek_backup_<time>_<serial>_v<firmware>_…_before-fps-patch-every-bank.zip`, with each bank as stored and
  its decrypted image. The write waits until the download has started; check your downloads folder.
- **The write.** The banks are written one at a time, and each is read back before the next; the first
  failure stops the rest. The result box says, for each bank, that it was "patched from 8 Hz to 32 Hz" (9 Hz to 18 Hz on a Compact PRO) and
  whether "The read-back differs from the saved bank only at the … planned byte(s)."
- **Unplug and replug.** The page says "NOW UNPLUG AND REPLUG THE CAMERA." No reset is sent, and a bank only
  runs after the camera starts again. The replug also ends the unlock described under
  [Safety and undo](#safety-and-undo).
- **The check.** After **Read slots**, each patched bank says "Frame-rate patch applied: this image runs at
  32 Hz." Then open the camera in the Seek app.

**To undo**, unzip the backup and write each bank's decrypted file back with **Flash decrypted image…** on
that bank (`seek-fw slots flash a <file> --acknowledge-risk`), or use **Restore from full flash backup…**
with your preservation run file or 4 MiB flash image (`seek-fw slots restore a <file> --acknowledge-risk`).
Then unplug and replug the camera.

### Every build the patch supports

| Build                                                                  | Rate   | Measured on a camera                             |
| ---------------------------------------------------------------------- | ------ | ------------------------------------------------ |
| Compact 0.8.0.0, 0.9.0.2, 0.9.0.6, 0.9.0.7, 0.9.1.0, 0.10.0.0, 1.0.0.0 | 32 fps | yes (TESTING.md 42.27)                           |
| Compact 1.2.0.0                                                        | 32 fps | yes, 32.2 fps (42.27)                            |
| Compact 1.3.0.0                                                        | 32 fps | yes, 32.17 to 32.22 fps (42.27)                  |
| Compact 1.3.0.8                                                        | 32 fps | yes, 32.16 to 32.20 fps (FPS_32HZ.md, section 5) |
| Compact 4.8.1.7, 4.8.1.9                                               | 32 fps | no, the emulator only (32.258 Hz)                |
| Compact XR 4.8.2.1                                                     | 32 fps | yes, 32.0 to 32.2 fps (42.24)                    |
| Compact 4.8.2.1                                                        | 32 fps | no: the XR's entry, measured on the XR only      |
| Compact PRO 1.0.3.0                                                    | 18 fps | yes, 17.68 fps (42.85)                           |
| Compact PRO 1.0.3.2                                                    | 18 fps | not yet (the emulator: 17.68 Hz)                 |
| Compact PRO 4.9.1.15                                                   | 18 fps | yes, 17.70 fps (42.32)                           |
| Compact PRO 4.9.2.0                                                    | 18 fps | not yet (the emulator: 17.68 Hz)                 |

The 32 fps rates were measured before the USB fix for phones joined the patch (FPS_32HZ.md); the
Compact 1.3.0.0 on the bench runs the current image. Any other build is refused, with the reason.

## Safety and undo

- **A backup before every write.** Every write on the Work with firmware slots tab saves the bank first, as one zip download
  holding the bank as stored, its decrypted image and a note of what each file is; the CLI saves the same
  zip into `--dump-dir`. Nothing is sent until the download has started. The preservation run keeps its
  backup in the run file before its first write, and its last step puts the original back and checks it
  (on every build but the 1.3.0.8 FF, whose run leaves its patch in recovery R).
- **How to restore.** Write the zip's decrypted file back with **Flash decrypted image…**, or use
  **Restore from full flash backup…** ([undo](#what-make-n-fps-in-every-bank-does), above).
- **What is never written.** The bootloader and the boot-config block. A bank write sends no reset, and the
  camera uses a written bank only after you unplug it and plug it back in (the preservation run restarts
  the camera itself). Writing the bank the camera boots now, or
  recovery R, asks for a tick (`--acknowledge-risk` on the CLI).
- **The camera stays unlocked until it is power-cycled.** To read a camera, the page and the CLI send its
  unlock token, and the camera stays unlocked until its next power cycle. Other tools, such as the vendor
  app, may misread it until then, so unplug and replug it before you use them.
- **What can go wrong.** A write that is cut off (cable pulled, computer asleep, power lost) leaves a bank
  the bootloader skips, which is harmless while another bank is good. An image that passes the
  bootloader's checks but does not run leaves the camera unable to start, and the bootloader has no USB:
  then only an SPI programmer or SWD/J-Link can write your backup back. That is why the steps above take
  a whole-flash backup first.

[HOW_IT_WORKS.md](HOW_IT_WORKS.md#risk-plainly) has the details.

## Command line

The CLI runs from a clone (the packages are not on npm):

```sh
git clone https://github.com/yrambler2001/seek-thermal-firmware-dump
cd seek-thermal-firmware-dump
npm ci && npm run build
node packages/cli/dist/bin.js --help
```

`npm link --workspace @seek-fw/cli` puts `seek-fw` on your `PATH`; otherwise use
`node packages/cli/dist/bin.js` where this page says `seek-fw`. There is one command per tab: `seek-fw info`
(Info), `seek-fw preserve` (Dump & decrypt 0.x/1.x 2014/2016), `seek-fw dump` (Dump & decrypt 4.x/Nano),
`seek-fw decrypt file` and `decrypt slot` (Decrypt File/Slot), and `seek-fw slots` (Work with firmware
slots). `seek-fw <command> --help` lists each command's options, and
[HOW_IT_WORKS.md](HOW_IT_WORKS.md#command-line-reference) has the common ones. On Linux the CLI needs the
udev rule below.

## Browser and platform support

Reading a camera needs WebUSB: Chrome, Edge or another Chromium browser. On macOS it works out of the box,
with no driver install and no admin rights. On Android it works in Chrome for Android with a USB-OTG cable,
provided the phone can supply bus power to the camera. Safari, Firefox and every browser on iPhone and iPad
have no WebUSB; they can still decrypt a file on the Decrypt File/Slot tab.

- **Windows:** Windows needs the WinUSB driver bound to the camera before any browser can reach it. Use
  [Zadig](https://zadig.akeo.ie/): Options → List All Devices, pick the entry named after your camera — for
  example "CompactPRO FF" — choose WinUSB, and click Replace Driver.
- **Linux:** the camera needs a udev rule before the browser or the CLI can open it:

  ```
  # /etc/udev/rules.d/70-seek-thermal.rules
  SUBSYSTEM=="usb", ATTR{idVendor}=="289d", MODE="0666", TAG+="uaccess"
  ```

  ```sh
  sudo udevadm control --reload-rules && sudo udevadm trigger
  ```

  Then unplug and replug the camera. Snap and Flatpak Chromium builds are often sandboxed away from raw
  USB devices; the `.deb` or `.rpm` build is the reliable one.

- **One tab at a time.** The page runs one camera operation at a time across all its tabs and windows; a
  second one sends nothing and says so. That does not reach another browser or the CLI, so use one of
  them at a time.

[HOW_IT_WORKS.md](HOW_IT_WORKS.md#browser-and-platform-details) has the details.

## More

- [CHANGELOG.md](CHANGELOG.md): what changed in each version.
- [HOW_IT_WORKS.md](HOW_IT_WORKS.md): firmware families, the read-only dump, how a bank is written, the
  slots, how the decryption works.
- [PRESERVATION.md](PRESERVATION.md): the full-flash preservation run of the 0.x/1.x cameras.
- [DEVELOPMENT.md](DEVELOPMENT.md): the code layout, tests and end-to-end runs.
- [FPS_32HZ.md](FPS_32HZ.md): how the frame-rate patch is made for each build.
- The original single-file page (1.0.0) is kept at tag
  [`v1.0.0`](https://github.com/yrambler2001/seek-thermal-firmware-dump/tree/v1.0.0).
