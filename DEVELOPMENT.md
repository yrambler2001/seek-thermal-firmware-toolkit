# Development

How the workspace is laid out, how to run the web app and the tests, and how a change is checked
against the original page. [README.md](README.md) is for camera owners;
[HOW_IT_WORKS.md](HOW_IT_WORKS.md) and [PRESERVATION.md](PRESERVATION.md) are the reference.

## Project layout

```
packages/
  core/    @seek-fw/core   isomorphic, zero-dependency: cipher, key recovery,
                           image packaging, USB protocol, firmware profiles
  cli/     @seek-fw/cli    Node CLI, talks to the camera through `usb` v3
  web/     @seek-fw/web    React app, talks to the camera through WebUSB
docs/                      the built web app — GitHub Pages serves this folder
scripts/                   the phone dev server, the table generators, and the differential
                           test against the original page (tag v1.0.0)
e2e/                       opt-in browser runs of the web app (emulator, real camera), and the
                           README screenshots
```

`core` knows nothing about React, Node or the DOM: it takes a `UsbTransport` and a `Reporter` and does the
work. Both front ends are thin. That is what makes the CLI and the browser genuinely the same tool rather
than two implementations that drift.

## Getting started

```sh
git clone https://github.com/yrambler2001/seek-thermal-firmware-dump
cd seek-thermal-firmware-dump
npm ci

npm run dev        # web app on http://localhost:5173
npm run dev:phone  # the same over HTTPS on your Wi-Fi, for an Android phone
npm run test       # vitest, all packages
npm run check      # format + lint + typecheck + test
npm run build      # builds core, cli, and the web app into docs/
npm run e2e:emu    # opt-in: the web app in Chrome, end to end, on the emulated camera
npm run e2e:camera # opt-in: read-only on a real camera, real WebUSB (Electron)
```

Requires Node 22.13 or newer.

The web app is built into `docs/`, which GitHub Pages serves, so **a change to the web app is not released
until `npm run build` is run and `docs/` is committed**. CI fails if the two are out of sync. Keep anything
else out of `docs/`: the build empties it every time.

The README's screenshots are generated: `npm run screenshots` regenerates `.github/readme/*.avif` on the
FW-V1 emulator (it needs `SEEK_EMU_DIR`, as for the emulator suites). Each shot is captured as a PNG and
compressed to AVIF with ImageMagick, so `magick` must be on the `PATH`.

## Running the web app locally

WebUSB needs a secure context, which means HTTPS or `localhost`. `npm run dev` gives you the latter.

On an Android phone the camera takes the phone's USB port (through an OTG adapter), so the phone reaches
the dev server over Wi-Fi, and a plain `http://<computer>:5173` has no WebUSB. Run

```sh
npm run dev:phone
```

It serves the app over HTTPS on port 5174 (`PORT=…` to change it) with a self-signed certificate it makes
in `packages/web/.cert/` for this computer's network address, and prints the address to open on the
phone. Chrome warns that the certificate is not trusted; tap _Advanced_, then _Proceed_. If WebUSB is
still missing on that page, `HTTP=1 npm run dev:phone` serves plain HTTP instead. Add the printed address
under `chrome://flags/#unsafely-treat-insecure-origin-as-secure` on the phone. This mode has no live
reload: Vite's client would reload the page as soon as the phone's Wi-Fi came back after airplane mode,
which mid-write would end the run. Reload the page by hand after an edit.

The other way is Android's _Wireless debugging_: once the phone is paired with `adb`,
`adb reverse tcp:5173 tcp:5173` lets it open `http://localhost:5173`, with no certificate at all.

## End-to-end runs in a browser

`npm test` never opens a browser. A family of opt-in scripts drives the web app in a real browser
instead, through its own buttons, dialogs and run files. None of them is part of `npm test` or
`npm run check`. `npm run e2e` runs them all (see "Every test, either target" below).

```sh
npm run e2e:emu            # Dump & decrypt, then Preserve steps 02, 03 and 04, on the emulated camera
npm run e2e:camera         # Dump & decrypt, then Preserve step 02 only, on a real camera, real WebUSB
npm run e2e:camera:bridge  # the same read-only run through the Node bridge instead
npm run e2e:camera:restart # e2e:camera, with one camera restart in step 02 (see below)
npm run e2e:prompt         # checks whether Chrome lets a test answer its WebUSB device chooser
```

They use `puppeteer-core`, which drives a browser that is already installed and never downloads one of
its own. `e2e:emu`, `e2e:camera:bridge` and `e2e:prompt` drive Google Chrome (the macOS path is the
default; `SEEK_E2E_CHROME` points at another binary). The other two drive Electron, a development
dependency; its binary is fetched the first time it is needed (about 100 MB, or run
`npx install-electron` beforehand). Each run starts the browser on a new, empty profile in a temporary
directory and deletes it afterwards, so your own profile is never touched. The app is served by a Vite
dev server of the run's own, on a free port, never 5173 or 5174, with no live reload, so editing files
mid-run does not reload the page under it.

Google Chrome cannot be scripted past its WebUSB device chooser. The CDP event Puppeteer uses to answer a
chooser fires for Web Bluetooth, and not for `navigator.usb.requestDevice()`; `e2e:prompt` measures that,
and a pre-granting enterprise policy is not something these scripts install. So there are two ways to put
the app in front of a device:

- **Real WebUSB, in Electron** (`e2e:camera`, `e2e:camera:restart`). The page runs Chromium's own WebUSB
  on the real macOS USB stack, with nothing in between. Electron hands the chooser to its main process
  (`select-usb-device`, `e2e/electron/main.mjs`), which shows it to the test, and the test picks the
  camera by its vendor and product ids, as you would in Chrome's window. Permissions are Electron's own.
  For a camera with no serial number they are Chrome's: the grant belongs to one enumeration and is
  dropped when the camera leaves the bus, so a restart ends in the page's blue "Your turn" box and a new
  pick. The run records the serial string Chromium read (empty, for this camera).
- **The bridge** (`e2e:emu`, `e2e:camera:bridge`). The page's `navigator.usb` is replaced by a stand-in
  (`e2e/lib/stand-in.ts`), and every device call goes to Node (`e2e/lib/bridge.ts`), where a real device
  answers it: the emulator, or the camera through the CLI's own USB stack (node-usb). The stand-in behaves
  the way Chrome does with this camera. A camera that restarts sends a `disconnect`, then comes back as a
  new device with no `connect` event and nothing from `getDevices()`. The page shows its "Your turn" box,
  and the test presses **Connect device** and picks the camera in the bridge's chooser.

Neither covers Google Chrome itself: its chooser window, its permission store, or its exact version.
Electron 44 runs Chromium 152, a little behind Google Chrome (154 when this was written).

**`e2e:emu`** needs the FW-V1 emulator (`SEEK_EMU_DIR`, as for the emulator suites). It boots the bench
Compact 1.3.0.0's own dump and runs the whole wizard against it. A restart stops the emulator and boots a
fresh one from the flash it was holding, as the camera boots from its flash. The run checks each run
file's name (`preserve-<start>-<saved>-patch-built.zip`, `…-full-dump.zip`, `…-verified.zip`) and its
folders, down to `04-restore-verify/preserve_verify_windows.bin`. It checks the raw and delivered dumps
byte for byte against the emulated part, and the final page's "matches the backup on all 31 blocks" and
"Verified — a perfect match.". It also checks that the camera's flash is back to exactly what it booted
with. It takes about six minutes, headless. Before the wizard it checks that the 4.x/Nano dump tab
refuses this 0.x/1.x camera on its version, before it reads anything, and names the 0.x/1.x tab.
`SEEK_E2E_EMU_FLASH=<4 MiB dump>` boots another part instead, on the emulator's default board, and checks
against it (`SEEK_E2E_EMU_VERSION` and `SEEK_E2E_EMU_POST_COMMIT_SHA` add the strict checks; TESTING.md
sec. 38 ran the bench Compact PRO 1.0.3.0 flash this way). For a part the expectation table knows
(`e2e/lib/preserve-expectations.ts`) the raw sha comes from the table. Every other spec's emulator target
boots the same part.

**`e2e:camera`** and **`e2e:camera:bridge`** are read-only:

- **They will** connect, run Dump & decrypt twice and check the image, run Preserve step 02 (read the
  camera, build the patch in memory, and, if its reader comes up spent, reboot it by command and answer
  the "Your turn" pick), check the step 02 run file, and check that the page offers step 03 with no red
  alarm. They work on whichever camera is attached: the product string is the one the camera enumerated
  with (`ioreg`), the version is the one it answered on the wire (and recorded in the dump's manifest),
  and the image is checked against the re-dump. `SEEK_E2E_CAMERA_NAME`, `SEEK_E2E_CAMERA_VERSION` and
  `SEEK_E2E_CAMERA_SHA` make each of those a strict check (the bench Compact 1.3.0.0 is
  `PIR206 Thermal Camera`, `1.3.0.0` and `40447c7e…`). The sha is the dump image's, gap-filled where no
  selector reaches, which on a 2016 part is not the flash's.
- **A known app refusal** fails step 02 with a first line that names it: an adjust word at `0x238` held by
  an edit Preserve does not know (`the rebalance word at 0x00000238 is not free`). The board-patched
  Compact PRO 1.0.3.0 on the bench part is a known edit and passes. The tests that need the run file skip
  and say why.
- **They will not** start step 03 or 04, or confirm a write. Three guards stop it independently. The
  script refuses those buttons. The page refuses the flash-write requests before they leave it: on real
  WebUSB a guard loaded before any app code locks `USBDevice.prototype`'s transfer methods to a whitelist
  of reads, operation mode 0, the read window's arm (after the camera has reported its version) and the
  plain reset during step 02. The third guard is Electron's main process, which answers the chooser only
  for a Seek camera on the run's own page with that guard in place; on the bridge it is the bridge, which
  forwards the same whitelist. Anything else, `SetFeaturedFirmwareData` and `CompleteMemoryUpgrade` above
  all, is refused unsent and fails the run.
- They skip themselves when no camera is plugged in, when two are, or when another program holds the
  camera's interface (a Chrome tab mid-run, the CLI). Close the app's tabs first. A run takes about two
  minutes.

**`e2e:camera:restart`** is `e2e:camera` with the one path a plain run never takes: the camera
restarting. Step 02 reboots the camera only when its reader probe finds a dead reader, and on stock
firmware it never does. So the page-side guard answers the first 26 of the probe's reads (28 bytes on
`0x4F`, the probe's whole budget) with a stall, without sending them, which is what a dead reader answers
on the wire. Everything after that is the app's own code. The probe gives up, the step reboots the camera
with its plain `ResetDevice`, and the camera leaves the bus and comes back as a new device. The page shows
its blue "Your turn" box, the test answers the new pick, and the step finishes on real reads. The guards
are unchanged. The run used to allow exactly one reset, and the bench part on Compact PRO 1.0.3.0 needed
one per window (its erased boot-config record read blank on every boot, and the probe rebooted until two
boots agreed). The probe now admits such a boot on the device-identity block, so the injected restart
should be the only one; the cap stays far above any honest run, the injected restart must go out, and any
extra restarts are counted and reported, not failed. The run checks the step 02 run file and a second
Dump & decrypt with the same image as the first, and it checks that step 03 is offered with no red alarm.
It also records what Electron does across the re-enumeration:

- a `disconnect` event and no `connect` event;
- `getDevices()` answering empty while the app tries to re-adopt the camera, and the camera again only
  after the pick;
- a new device id for the same camera.

It takes about two minutes.

### Every test, either target

Beyond the four flows above, a set of target-agnostic checks runs the SAME test body on EITHER target: the
emulator (the default) or the real camera over real WebUSB (`SEEK_E2E_TARGET=camera`). Read-only flows run
on either unattended; a flow that writes flash runs freely on the emulator and, on the camera, only
through the write gate below (`SEEK_E2E_WRITE=i-understand`).

```sh
npm run e2e                # every unattended test (emulator + camera read-only); skips camera cleanly if none
npm run e2e:gate           # the camera write gate and the write guard's budgets (no browser, no device)
npm run e2e:dump           # Dump all selectors and an offline decrypt (SEEK_E2E_DUMP_FILE)
npm run e2e:cancel         # cancel Dump & decrypt (and step 02) mid-read, then read again
npm run e2e:soak           # N Dump & decrypt runs (SEEK_E2E_SOAK_N, default 10) — identical sha, with timings
npm run e2e:offline        # the hosted docs/ bundle, run with the network cut after it loads
npm run e2e:resume         # load a patch-built run file and resume at step 03 (+ flat-layout and broken-zip)
npm run e2e:reload         # reload mid-step-02 (clean restart) and after it (resume)
npm run e2e:forget         # Forget device -> revoke -> getDevices() empty -> connect again (camera by default)
npm run e2e:second         # a second window while the first reads: refused with the message, sends nothing
npm run e2e:phone          # 375x812 screenshots of each state, light and dark, overflow asserted
npm run e2e:unplug         # power cut mid-dump -> clean error -> power back -> re-pick -> read again
npm run e2e:write          # Preserve 02->03->04 against the camera's expectation row, gated on the camera
```

`SEEK_E2E_TARGET=camera npm run e2e:cancel` (and the like) runs a read-only check on the real camera;
without it they default to the emulator. Each test picks a sensible default target (`e2e:forget` defaults
to the camera), and skips cleanly when that target is not available.

| Test             | emulator                                            | camera                              |
| ---------------- | --------------------------------------------------- | ----------------------------------- |
| `e2e:emu` / full | writes 02–04                                        | —                                   |
| `e2e:camera*`    | —                                                   | read-only (02 only)                 |
| `e2e:dump`       | read-only                                           | read-only                           |
| `e2e:cancel`     | read-only                                           | read-only                           |
| `e2e:soak`       | read-only                                           | read-only                           |
| `e2e:offline`    | read-only                                           | read-only                           |
| `e2e:resume`     | resumes; writes 03–04 with `SEEK_E2E_RESUME_FULL=1` | read-only (resume check only)       |
| `e2e:reload`     | read-only                                           | read-only                           |
| `e2e:forget`     | read-only                                           | read-only                           |
| `e2e:second`     | window 2 refused while window 1 dumps, then dumps   | read-only (window 2 sends nothing)  |
| `e2e:unplug`     | read-only                                           | read-only; rp2040 switch cuts power |
| `e2e:write`      | writes 02–04                                        | writes 02–04 with `SEEK_E2E_WRITE`  |
| `e2e:phone`      | n/a (no device)                                     | n/a (no device)                     |

Every test that runs Preserve step 02 runs it the way `e2e:camera` does: the plain reset the step may
send is allowed while it runs, every "Your turn" ask is answered, and a reset or any other request a guard
refused fails the test. The camera's guard used to refuse those resets unsent while the step carried on
as if the camera had rebooted, and nothing failed. The image a dump must come back as is the emulator's
known part, or on the camera the one `SEEK_E2E_CAMERA_SHA` names, or else the first whole image the test
read.

Seven more scripts drive the other tabs. `npm run e2e` loads them too, and each skips, saying why, when
its target or its write gate is not there:

```sh
npm run e2e:pages:emu        # Info, both Dump & decrypt tabs and Decrypt File/Slot, on emulated cameras
npm run e2e:slots:quality    # Work with firmware slots on three emulated cameras, against the verdict table; never writes
npm run e2e:pages:bench      # every tab on the bench Compact 1.3.0.0 (the write gate, the J-Link and the switch)
npm run e2e:pages:bench:pro  # Info and Work with firmware slots on the bench Compact PRO 1.0.3.0 (the write gate)
npm run e2e:slots:bench      # Work with firmware slots on the bench camera, one build at a time, checked with the J-Link
npm run e2e:fps:bench        # one bank's Make N FPS on the bench camera (SEEK_E2E_WRITE)
npm run e2e:ff:vendor        # the 1.3.0.8 FF bank write on the bench camera (SEEK_E2E_WRITE)
```

### Writing the real camera

`e2e:write` runs Preserve 02→03→04 and holds every step to the camera's own row of an expectation table
(`e2e/lib/preserve-expectations.ts`). The row is chosen by what the camera reports: the version it
answered on the wire, the build step 02 found in its slot, and the edit on that build, if any. There are
two rows, the bench Compact 1.3.0.0 and Compact PRO 1.0.3.0 with the Compact board patch (the bench camera
now). A camera with no row stops after step 02, before the gate. The run:

1. Connects, and runs Dump & decrypt. That gives the image the run is held to (or `SEEK_E2E_CAMERA_SHA`)
   and the version the camera answered.
2. Runs step 02, which must match the row exactly before the gate is asked: the build, the edit and its
   balance, the two or five sites, the rebalance word, the chunks, the bank, the bytes that move, and no
   reboot. Its backup must also equal the dump in all 31 windows.
3. Asks the gate.
4. Reopens the app with the write guards, loads the step 02 run file, and runs steps 03 and 04. Each is
   checked: the chunks and the one commit with the row's checksum, one reboot and one pick each, no
   replug, the bytes the commit moved (all in the bank), the restore's record, and the 31-window verify.
   For the two bench parts, the raw and delivered dumps are pinned to their measured shas.

On the emulator that is an ordinary write run (with `SEEK_E2E_WRITE_FULL=1`; `SEEK_E2E_EMU_FLASH` boots
another part, as for `e2e:emu`). It takes the same steps a person takes on the camera.

On the camera it passes through a gate (`approveWrite`, `e2e/lib/supervised-write.ts`) that cannot be
passed by accident: it needs `SEEK_E2E_WRITE=i-understand` and a non-CI session, and nothing else. There is
no typed confirmation. The safety is that step 02 has already matched the camera's row exactly, and the
gate prints the whole plan (firmware, this run's image sha, bank, chunks, checksums, the bytes that move)
before it lets the write go, so the run's log records what was written. Without the env switch it refuses,
so `e2e:all` and any default run never write. `SEEK_E2E_WRITE=dry-run` reads the camera, checks step 02
against the row, and stops before the first write.

Past the gate, the page write guard (`writeGuardScript({ lifted: true })`) opens each write phase with
exactly its row's budget: the chunks, one CompleteMemoryUpgrade carrying the plan's checksum, and the
resets. Anything else is refused unsent, before the camera erases anything. Steps 03 and 04 run in a new
window, whose guard is seeded with the version step 02 matched: the commit session probes the reader
before it reads the version, which an unseeded guard refuses, and every version the camera answers there
must equal the seed. The vendor-id pick in Electron's main process is unchanged. The bench camera's run:

```sh
SEEK_E2E_TARGET=camera SEEK_E2E_WRITE=i-understand npm run e2e:write
```

The run files are kept (the path is printed): the step 03 one holds the camera's whole flash.

The unplug / power-cycle flows on the camera use a USB power switch (`e2e/lib/power-switch.ts`): a MANUAL
mode that asks a human to unplug and replug and waits for the bus, or the RP2040 hardware switch at
`SEEK_E2E_SWITCH_DIR` driven over serial (`on/off/cycle <channel>`). The channel the camera is on must be
given (`SEEK_E2E_SWITCH_CHANNEL`) before anything toggles — the switch has two channels and the wrong one
would cut power to whatever else is plugged into it. Without it, `e2e:unplug` on the camera toggles
nothing and only reports. With it (`SEEK_E2E_TARGET=camera SEEK_E2E_SWITCH_CHANNEL=2 npm run e2e:unplug`;
the bench camera is on channel 2), it cuts the power only during a read-only dump, with the page's write
guard in place. It cuts it with the switch's own `cycle`, so the switch turns the camera back on by itself
even if the run dies, and the run turns it on again afterwards anyway.

`SEEK_E2E_HEADED=1` shows the browser window, `SEEK_E2E_KEEP=1` keeps the downloads and the emulator's
flash images (the path is printed), `SEEK_E2E_SCRATCH` chooses where they go, `SEEK_E2E_PORT` pins the dev
server's port, `SEEK_E2E_SHOTS` is the phone-screenshot directory, `SEEK_E2E_DUMP_FILE` is a 4 MiB dump for
the offline-decrypt check, and `SEEK_E2E_CAMERA_NAME`, `SEEK_E2E_CAMERA_VERSION` and `SEEK_E2E_CAMERA_SHA`
pin the camera's product string, firmware version and dump image (each is otherwise taken from the
camera).

## Verifying a change against the original

The original single-file page (`index.html` at tag `v1.0.0`) is the reference the core was ported from.
`scripts/verify-against-legacy.mjs` reads it from that tag with `git show`, loads its own `<script>` into
a stub-DOM `vm` context, runs both implementations over real flash dumps, and requires identical results
— recovered keystream state, acceptance checksum, decrypted plaintext, and the rebuilt bank payload byte
for byte.

```sh
npm run build
node scripts/verify-against-legacy.mjs /path/to/SEEK_DUMPS
```

The dumps are real camera images and are deliberately not in this repository, so this is a local audit
tool rather than a CI gate. Run it before changing anything in `packages/core/src/crypto` or
`packages/core/src/image` — a bad payload bricks a camera whose bootloader has no USB recovery.
