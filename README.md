# Seek Thermal Firmware Toolkit

Read the 4 MiB SPIFI flash of a Seek Thermal camera, decrypt the firmware images inside it, and
flash a new plaintext image back — **from a browser over WebUSB, or from the command line**.

**→ [Open the web tool](https://yrambler2001.github.io/seek-thermal-firmware-dump/)**
&nbsp;·&nbsp;
**[Firmware slots](https://yrambler2001.github.io/seek-thermal-firmware-dump/#/slots)**

No drivers on macOS or Linux, no SDK, no J-Link. Nothing is uploaded anywhere: the browser build
runs entirely on your machine, and the CLI talks to the camera directly.

```sh
npm ci && npm run build
node packages/cli/dist/bin.js dump --out ./my-camera        # whole flash + decrypted images (4.x and Nano)
node packages/cli/dist/bin.js info                          # what is this camera running?
node packages/cli/dist/bin.js decrypt file flash_4m.bin     # works with no camera attached
```

## What it does

1. Walks the device's `BeginFirmwareUpgrade` selector map, reading each 64 KiB block of
   `0x14000000..0x143fffff` with `GetFeaturedFirmwareData` over EP0 vendor control transfers.
2. Assembles the blocks into one 4 MiB image.
3. Scans that image for firmware slots and decrypts them, recovering the key from the dump itself —
   by cryptanalysis, not by searching for a stored key.
4. Hands you a directory or a single `.zip`.

There is also an **offline mode**: point it at a flash image you already have — from this tool, from
J-Link, or from an SPI programmer — and get back the decrypted firmware. That path touches no device
and needs no WebUSB, so in the browser it works in **every** browser, including Safari, Firefox and
iOS.

### Archive contents

| Path                              | What it is                                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `flash_4m_usb_partial_gap_ff.bin` | the assembled 4 MiB flash image                                                                                             |
| `windows/*.bin`                   | each 64 KiB block exactly as it came off the wire                                                                           |
| `decrypted/*.bin`                 | each firmware image slot, decrypted — named `…-KeyA-<32 hex>-KeyB-<32 hex>` when the image embeds that key pair (see below) |
| `decrypted/*.txt`                 | per-slot report: key, key location, cipher profile, SP, entry, SHA-256                                                      |
| `decrypted/decryption_report.txt` | summary across all slots                                                                                                    |
| `manifest.json`                   | exact read, gap and decryption metadata, including the firmware profile used                                                |
| `README.md`                       | what the capture is and what its limits are                                                                                 |

## Install and use

### Web

Nothing to install — [open the page](https://yrambler2001.github.io/seek-thermal-firmware-dump/).
WebUSB needs Chrome, Edge, or another Chromium browser on Windows, macOS, Linux or Android.

The page has five tabs, in this order. Each one is a real URL.

| Tab                              | Hash         | For                                                                                              | Writes to the camera?                  |
| -------------------------------- | ------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------- |
| Info                             | `#/`         | any camera: the same read as `seek-fw info` (identity, boot config, banks, keys, upgrade target) | no flash (sets two RAM selectors)      |
| Dump & decrypt 0.x/1.x 2014/2016 | `#/preserve` | 0.x and 1.x cameras: the 2014 builds, the 2016 Compact PRO (1.0.3.x) and the 1.3.0.8 FF build    | yes, two guided steps, each asks first |
| Dump & decrypt 4.x/Nano          | `#/v4`       | 4.x, Nano and Mosaic cameras: a read-only dump of the whole flash, decrypted                     | no                                     |
| Decrypt File/Slot                | `#/decrypt`  | nothing: a dump file you have, or one 64 KiB firmware slot. No camera is used                    | no                                     |
| Work with firmware slots         | `#/slots`    | 0.8.0.0 and newer: read, dump, write or raise the frame rate of one bank (A, B or R)             | yes, one bank at a time, asks first    |

Old hashes (`#/dump`, `#/flash`) are not redirected: they open the Info tab.

The **Dump & decrypt 0.x/1.x 2014/2016** tab (`#/preserve`) runs the [v1 preservation pipeline](#the-v1-full-flash-preservation-pipeline)
one step at a time: six gated steps (backup → patch → commit → drain → restore → verify), each
with its own progress bar and log, and a downloadable run file rebuilt after every completed step.
The run file is the run's only memory — the page keeps no browser storage — so a run can be
resumed from it, or started at a non-first step after an issue. The backup step's archive is taken
before the patched firmware is ever flashed.

### CLI

The packages are not published to npm, so the CLI runs from a clone:

```sh
git clone https://github.com/yrambler2001/seek-thermal-firmware-dump
cd seek-thermal-firmware-dump
npm ci && npm run build
node packages/cli/dist/bin.js --help
```

To get a `seek-fw` on your `PATH`, link it once with
`npm link --workspace @seek-fw/cli`. The examples below use `seek-fw` for
brevity; substitute `node packages/cli/dist/bin.js` if you have not linked it.

The commands are the web app's tabs, one each:

| Command                       | Tab                              | What it does                                                                                                                        |
| ----------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `seek-fw info`                | Info                             | firmware version, identity, slots, key table, boot config, upgrade target; `--devices` lists the cameras, `--profiles` the families |
| `seek-fw preserve`            | Dump & decrypt 0.x/1.x 2014/2016 | the six-step preservation run; `--backup-only` is its read-only first step, `--zip <file>` saves the run as one archive             |
| `seek-fw dump`                | Dump & decrypt 4.x/Nano          | read the whole 4 MiB flash and decrypt it; `--all-selectors` probes every selector instead                                          |
| `seek-fw decrypt file <dump>` | Decrypt File/Slot                | decrypt a dump you already have — no camera needed                                                                                  |
| `seek-fw decrypt slot <file>` | Decrypt File/Slot                | decrypt one 64 KiB firmware bank from a file — no camera needed                                                                     |
| `seek-fw slots ...`           | Work with firmware slots         | list, dump, write or raise the frame rate of one bank (A, B or R)                                                                   |

The old names are gone, with no alias: `devices` is `info --devices`, `profiles` is `info --profiles`,
`sweep` is `dump --all-selectors`, and `flash` is `slots flash`. A flag a command does not take is a
usage error (`seek-fw dump --profile …` is refused, because the 4.x dump chooses its family from the
camera). Run `seek-fw <command> --help` for each command's options.

Common options:

```
--out <dir>          write files to a directory (default)
--zip <file>         write a single archive instead
--profile <id>       info, decrypt and slots: act under a family named by hand
--chunk <n>          control-IN request size, at most 64 (default 64)
--gap-fill <byte>    fill byte for unreachable blocks (default 0xff)
--retries <n>        per-window retry count (default 2)
--retry-delay <ms>   pause between window retries (default 500)
--no-probe           info, dump, slots: do not ask the camera which protocol it speaks first
--recipient <r>      interface | device | auto (default auto)
--serial <id>        pick one camera when several are attached
--no-decrypt         dump: dump the flash but skip the decryption stage
--json               machine-readable output on stdout
--quiet, --verbose, --no-color
```

`seek-fw slots flash` writes one bank. It shows the plan and asks first unless `--yes` is given.
Every bank write (`slots flash`, `copy`, `restore`, `patch-fps --write`) saves the bank it is about
to change first, as one zip in `--dump-dir` (the current directory by default); that is the bank
only, not the whole flash, so take `seek-fw dump` first when the rest matters. TESTING.md 42.16
lists what the removed whole-image `flash` did that `slots flash` does not.

On Linux the CLI needs permission to talk to the device — see [the udev rule](#linux-udev-rule)
below, which applies to both the CLI and the browser.

## Firmware version profiles

Seek cameras do not all speak the same protocol, and the differences are not cosmetic — they change
which selector exposes which block, how a stored key maps to the cipher state, and what the
bootloader will accept. A **profile** captures one firmware family:

| Profile        | Family                                                                                                             | Dump   | Decrypt | Flash   |
| -------------- | ------------------------------------------------------------------------------------------------------------------ | ------ | ------- | ------- |
| `modern-4x`    | 2018 and later: Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact XR, Mosaic 2.27/10.9, Nano 200 42.x, Nano 300 44.x | yes    | yes     | **yes** |
| `legacy-auth`  | 2014-2017 locked line: Compact 0.8.0.0-1.3.0.8, Compact PRO 1.0.3.x                                                | yes    | yes     | no      |
| `compact-2016` | the same locked protocol with the 2016 cipher (K=0, acceptance sum 0)                                              | yes    | yes     | no      |
| `compact-2014` | Compact builds older than 0.8.0.0 — no read handler exists in their RPC table                                      | **no** | yes     | no      |
| `generic`      | fallback when the family cannot be identified                                                                      | yes    | yes     | no      |

The profile is detected from evidence — and, on an attached camera, from **asking it**. Before a
dump, a sweep or a device-info read, both the CLI and the web app send up to four read-only
transfers (`--no-probe` turns this off on the CLI): the running firmware's version, then — only
if that build can be read at all — a plain 2-byte arm of a bank the locked line protects, the
18-byte authenticated arm of the same bank, and a read of a bank that is open on every line. Those
answers separate the families directly, where a USB product string or an acceptance sum only
correlates with them. The web app has no "modern" and "legacy" buttons any more: it asks, and
says why when it will not read a camera. `--profile <id>` overrides detection and skips the probe —
but not the version check: the run still reads the version first and refuses a camera that does not
report it, or runs a build older than 0.8.0.0, whatever family was named. The web app names no
family by hand: its 4.x/Nano tab reads only the modern family and refuses any other.

**`legacy-auth` and `compact-2016` share every selector, so the channel answers cannot tell them
apart; the version and the slots can.** The read is the same 31 windows either way, but each family
checks the banks against its own cipher's target. The probe's version decides the first read: a
1.0.3.x camera (the Compact PRO's line) is read under `compact-2016` before any slot is read, so its
banks are checked against the 2016 target from the start (TESTING.md 42.84; it used to be read under
`legacy-auth` first, which reported every bank failing and then read the camera again). Once the slots
are read, detection keeps the probe's answers and adds what only the slots say: a bank under a real
xorshift128 keystream that decrypts to a word sum of 0 is the 2016 cipher, and rules `legacy-auth` out;
a bank stored plain (the 2014 chain, whose stored words sum to 0) rules `compact-2016` out; a bank that
decrypts to 0xFFFF (the Compact 1.3.0.8 cipher) keeps a 1.0.3.x camera on `legacy-auth`. The bootloader's
version (1.2.0.0 on the 2016 part, 0.9.0.0 on the 2014 Compact) corroborates. When the slots name the
other family, `seek-fw info` and the slots page's "Read slots" redo the analysis under it, and a dump
decrypts its slots under it, saying in the report which profile the read acted under. `compact-2016`
declares no write of its own: its banks are written one at a time on the Slots tab, as on every line.

**`compact-2014` refuses to dump, and that refusal is the point.** Every decrypted image carries
its own RPC method table — wire id = index + 53 — and recovering it from all 36 images in the
reference corpus shows five builds (0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4) with no
`GetFeaturedFirmwareData` at all: wire id `0x4F` is `UploadFirmwareRowSize` there, so nothing can
read a window however it is armed. On 0.7.0.7 and 0.7.0.8 it is in the table with its handler in
the write (setter) column only, so the control-IN read a dump sends cannot be dispatched either;
0.8.0.0 is the first build with a read handler. On 0.3.0.1, `0x52` — the id a dump arms 63 windows with — is
`EnterBootloaderMode`. Dumping such a camera would not fail; it would send it 63 requests to leave
the application. The facts are committed in `packages/core/test/firmware/facts.json` and asserted
by `packages/core/test/firmware-facts.test.ts`.

**The locked line reaches `0x14060000` and the modern line does not**, which is the reverse of what
the section below says about 4.x cameras: on a 2016 or 2017 build that block is subcommand 8 behind
the authenticated channel, and the six protected banks (`0x14010000`, `0x14030000`-`0x14070000`)
come back with the token. What that line cannot reach is `0x14000000`, blocked on every channel,
and everything above `0x141FFFFF`, for which it decodes no selector at all — 2 MiB that the dump
now declares as gaps instead of trying 32 selectors and reporting 32 refusals.

Three properties that older versions of this tool conflated are kept independent, because measurement
showed they are:

- the **selector map** (which subcommand exposes which window),
- the **whitening constant K** (how a stored key maps to the keystream state),
- the **acceptance sum TARGET** (what the decrypted word sum must equal).

A real 1.3.0.8 Compact build has `TARGET = 0x0000FFFF` and yet **no whitening at all**. Pairing the
two, as the original single-file page did, reports that build's key wrongly — and a wrong Key A
poisons the upgrade path on a real camera. The tool now resolves K by looking for each candidate key
form in the image's own plaintext and keeping the one that actually occurs.

Adding a family is one file in `packages/core/src/profiles/` plus one `registerProfile()` call.

## Project layout

```
packages/
  core/    @seek-fw/core   isomorphic, zero-dependency: cipher, key recovery,
                           image packaging, USB protocol, firmware profiles
  cli/     @seek-fw/cli    Node CLI, talks to the camera through `usb` v3
  web/     @seek-fw/web    React app, talks to the camera through WebUSB
legacy/index.html          the original single-file page, kept for reference
docs/                      the built web app — GitHub Pages serves this folder
scripts/                   the differential test against the legacy page
e2e/                       opt-in browser runs of the web app (emulator, real camera)
```

`core` knows nothing about React, Node or the DOM: it takes a `UsbTransport` and a `Reporter` and
does the work. Both front ends are thin. That is what makes the CLI and the browser genuinely the
same tool rather than two implementations that drift.

## Read-only by design

The dump view (the Dump & decrypt 4.x/Nano tab) can issue exactly six vendor commands. That is its
entire vocabulary, and there is no code path to anything else:

| Opcode | Name                    | Dir | Why                                                                                                      |
| ------ | ----------------------- | --- | -------------------------------------------------------------------------------------------------------- |
| `0x4e` | GetFirmwareInfo         | IN  | the running firmware version, read first: it picks the build's own selector table, or refuses the camera |
| `0x35` | GetErrorCode            | IN  | check status after each step                                                                             |
| `0x3c` | SetOperationMode        | OUT | only to select mode 0, and only if not already there                                                     |
| `0x3d` | GetOperationMode        | IN  | read the current mode                                                                                    |
| `0x4f` | GetFeaturedFirmwareData | IN  | the actual flash read                                                                                    |
| `0x52` | BeginFirmwareUpgrade    | OUT | volatile read-window selector only — it selects which block subsequent reads return, and writes nothing  |

Until the camera has reported its firmware version only three of the six go out, and only as
reads — `GetFirmwareInfo`, `GetOperationMode` and `GetErrorCode`, the reads that mean the same thing
on every one of the 36 images examined — because a command number does not mean the same thing on
every build.

`SetFeaturedFirmwareData`, `CompleteMemoryUpgrade`, `ResetDevice` and every upload, commit and erase
command are absent from this view. `USBDevice.reset()` is never called either; the retry path just
closes and reopens the handle. Decryption happens entirely in memory on the copy in your browser and
never touches the device.

Writing lives on the **Work with firmware slots** tab, described in [Firmware and flashing](#firmware-and-flashing).
Nothing in the dump view reaches it.

## The v1 full-flash preservation pipeline

`packages/core/src/preservation/` and `seek-fw preserve` implement a full-flash preservation
pipeline for the v1 "locked line" cameras. These are the builds whose write path the profiles
refuse, and that refusal is still right for the general `flash` command; this pipeline is a
separate, explicit, operator-invoked route that exists because in-place preservation cannot be
done read-only. It started with Compact 1.0.0.0 / 1.2.0.0 / 1.3.0.0 (FW-V1 docs 33 sec. 11.7 and 34) and now covers sixteen builds across three cipher/acceptance families — the eight 2014
Compact 0.x builds (0.7.0.7 .. 0.10.0.0) joined in the doc-36 campaign. The command takes NO
image argument: the backup step reads the active slot's image TWICE (two independent captures
that must agree byte for byte — a disagreement refuses the run), derives the factory plaintext
from that capture (identity on the 2014 plain chain, the build family's keystream solver on a
cipher family), gates the derived image, and prints what it will do before anything write-shaped
runs.

### The supported builds

| Build                                                    | Family       | Patch                                                                | Staged form                        | Restore                 | Drain (whole part)                                                                                                                                                                                                              |
| -------------------------------------------------------- | ------------ | -------------------------------------------------------------------- | ---------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Compact 1.0.0.0 / 1.2.0.0 / 1.3.0.0                      | v1-2014      | widen + reader trio + arm cursor reset, word 142 rebalanced          | plain (the capture, conjugated)    | capture verbatim        | yes — one widened-window arm; byte-exact at the 64-byte ask                                                                                                                                                                     |
| Compact 0.9.0.2 / 0.9.0.6 / 0.9.0.7 / 0.9.1.0 / 0.10.0.0 | v1-2014      | widen + trio (per-layout offsets) + arm cursor reset, word 142       | plain                              | capture verbatim        | yes — 13 bytes move; full in-place proven on the emulator (doc 36.4); stock cap 65,536 B/arm                                                                                                                                    |
| Compact 0.8.0.0 / 0.7.0.8                                | v1-2014      | widen + trio + arm cursor reset + the mode-2 nop (15 bytes)          | plain                              | capture verbatim        | yes — the nop site MUST be committed before any mode-2 arm (the factory mode 2 arms `*(0x14000000)` and faults under an armed read); full in-place through ip3; the ip4 boot-back stage is open (transport timeouts, doc 36.10) |
| Compact 0.7.0.7                                          | v1-2014      | widen + trio + arm cursor reset (10 bytes, word 142 := `0x0000B300`) | plain                              | capture verbatim        | yes — reads on **wire 88**, and the widened window serves the part ROTATED from the slot the cfg does not name (slot B on the donor); the drain unrotates; full in-place incl. the boot-back (doc 36.4.2)                       |
| Compact 1.3.0.8 (8 Hz "insecure")                        | v1-2014      | widen only (the 2017 reader is already 32-bit; no guard), `0x3000`   | plain                              | capture verbatim        | yes — proven in-place on the 2014 donor                                                                                                                                                                                         |
| Compact 1.3.0.8 FF (16 Hz)                               | v1-2014-ff   | guard + widen, word 142 := `0x485523E8` (the accept solve)           | plain ⊕ ks0 ⊕ ksD (two keystreams) | **refused** (see below) | commit + drain proven **through the recovery slot only**; the in-place variant is derived, not run                                                                                                                              |
| Compact Pro 1.0.3.0 (9 Hz)                               | compact-2016 | guard + widen (by shape), `0xF1003000`                               | plain ⊕ ks(block 0)                | factory image, staged   | yes — the doc-33 chain                                                                                                                                                                                                          |
| Compact Pro 1.0.3.2 (9 Hz and 18 Hz FF)                  | compact-2016 | guard + widen + the arm-tail hook nop, `0x29FD6B0F`                  | plain ⊕ ks(block 0)                | factory image, staged   | **refused** — 128 B is the lossless read unit and the EP0 sessions die at ~64–81 KB; backup → patch → commit → restore → verify only                                                                                            |

**Compact Pro 1.0.3.0 on a Compact board.** The 1.0.3.0 app reboots on any board but the PRO's,
so a Compact (PN297) running it carries a board patch in its banks (`scripts/patch-dump.mjs`:
eight bytes of app_init's board switch, balanced through the adjust word at `0x238`). That is the
word the widening patch balances through, and Preserve used to refuse it as "not free". It now
knows the edit (`KNOWN_DERIVATIONS` in `patch.ts`) and takes an image as it only when the edit's
bytes are in place, taking them back out leaves the adjust word at 0, and the image underneath
detects as the factory 1.0.3.0 build. The patch then balances ON TOP of the edit's share of the
word: the word sum is linear, so on the bench camera `0x6322E32A` (the edit's) + `0xF1003000`
(the patch's) = `0x5423132A`, and five bytes move instead of four. The restore stages the image
as the slot held it, edit included, so the camera gets back the image that boots on its board. An
adjust word held by any other edit still refuses, naming the edits Preserve knows.

Three 0.x-specific facts the plan print states and the gates enforce:

- **The 0.x line is emulator-proven, not hardware-proven.** Every 0.x patch was derived from the
  images' bytes and measured end-to-end on the emulator against the plaintext 1.3.0.0 donor
  (FW-V1 doc 36.4); no native flash dump of any of these builds exists, so a hardware run is
  the first silicon evidence for each. The capability line each run prints says so.
- **The 0.7.x builds serve their reader on wire 88 (`GetFeaturedData`), not 79.** Their method
  table puts the read handler in 0x4F's setter column, and 0x4F stalls for every request length.
  The pipeline selects the reader wire from the version (0.4F everywhere else); on 0.7.0.7 the
  widened mode-2 window serves the part from the A/B slot the boot config does NOT name (measured
  slot B `0x14060000` on the donor's blank record), so the drain unrotates the served bytes
  before the delivered dump is built.
- **On 0.8.0.0 and 0.7.0.8 the factory mode-2 row is a crash hazard**: it loads the word stored
  AT `0x14000000` (the bootloader vector's initial SP) and an armed read walks off SRAM —
  measured on 0.8.0.0 (32 KiB served, then the guest faulted). The patch turns that dereference
  into a nop, and the drain gate refuses a run whose recorded patch lacks the site: the nop is
  applied BEFORE any mode-2 arm is ever sent.

The builds OLDER than 0.7.0.7 (0.3.0.1, 0.5.x, 0.6.0.4) are refused with the doc-cited verdict:
the route does not port to that generation (every arm shape answers `0x400000`, the mode-2 row
is not a `0x14000000`-named window, and the widen constant is not the patchable two-store
immediate — FW-V1 doc 36.7), and no standard dump path exists on it either.

Two build-specific facts the plan print states and the gates enforce:

- **The 1.3.0.8-FF build boots its patch from the RECOVERY slot only.** Its raw word sum is the
  0xFFFF sentinel, which the 2014 bootloader rejects at slots A/B — it boots the recovery bank
  unchecked. The run refuses a commit into A/B, and a run whose detection names A/B (the factory
  chimera's blank cfg) refuses before any write. The restore is refused too, for a measured
  reason: no staged form of the factory image passes the running app's own acceptance while
  transforming back to the original slot bytes (accept1 reads sum(P ⊕ ksD); the factory carries
  `0xB7AB9D17` there, not `0xFFFF`). The FF run ends with the delivered dump in hand and the
  patch in place; the original content can only go back with a full-flash programmer.
- **1.3.0.8 and 1.3.0.8-FF report the same version string.** The build is chosen from image
  properties — the 0xFFFF word-sum sentinel and the key blocks (located by value), never the
  version alone. A 2018-or-later build (4.x, Compact XR, Nano 200/300, Mosaic) is refused with a
  pointer at the standard dump workflow: no widening patch is needed, the modern stock plan
  already reads 63 of the 64 flash windows.
- **A ciphered slot refuses at the keystream-solver seam.** Self-sourcing has to READ the factory
  plaintext out of the slot, and today only the identity solve is implemented (the 2014 plain
  chain, plus every build whose donor stores the image as-is — the 1.3.0.8 chimeras included). A
  genuinely ciphered capture (the native 2016 Compact Pro dumps, whose banks hold plain ⊕ ks) gets
  as far as the build gates and then refuses with "the <family> keystream solver is not
  implemented in this build" — nothing is written, and the run says so.

### What it does — the four phases

| Phase                 | What happens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | What it touches            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| **P1 backup**         | Reads all 31 windows a stock camera can serve (BeginFirmwareUpgrade modes 3..9 with the 18-byte token, 0x0A..0x21 plain; 0x14010000..0x141FFFFF, 64 KiB each) and refuses to continue if any window comes back short. The active bank is then read AGAIN as an independent capture — the two must agree byte for byte, and a disagreement refuses the run (a read glitch must become a refusal, never a write) — and the factory plaintext is DERIVED from the agreed capture: identity on the 2014 plain chain, the build family's keystream solver on a cipher family. The derived image's header version must equal what the camera reports, and the build table's gates (detect hooks, before-bytes — an already-patched bank refuses here) run on it before anything is trusted. | read-only                  |
| **P2 in-place patch** | Reads the 28-byte boot-config record (mode 3) and names the ACTIVE slot (a blank `cfg[0]` boots bank A 0x14050000 — the bootloader's fixed A→B→recovery validate order), then commits the patch into the active slot via the raw types-7 path (`0x52` mode 7 + token, `0x50` staging in 64-B chunks, `0x51` commit with the u16 sum) — the bank was already captured, double-read and its image gated in P1. No boot-config write, no other-slot write.                                                                                                                                                                                                                                                                                                                               | **writes the active slot** |
| **P3 full dump**      | Sends the wire-89 reset, which boots the PATCHED image; after re-enumeration it probes the widened mode-2 window (the patch turns the reader's 64 KiB window into the whole 4 MiB part) and drains all 4 MiB at 64 B per call (one EP0 packet — the ask measured exact on the hardware, TESTING.md §28.3). The DELIVERED dump is post-processed: the active bank's 64 KiB is replaced from the P1 backup, so the file you keep is the camera's original flash content, byte-clean.                                                                                                                                                                                                                                                                                                    | read-only after the reset  |
| **P4 restore**        | Commits the ORIGINAL bank content (the P1 capture, staged verbatim — the raw path programs exactly what is staged) back over the active bank while the patched image still runs from SRAM, resets, then re-reads the 31 windows and requires 0 differing bytes against the P1 backup.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | **writes the active slot** |

### The patch, and the ciphertext rule

The patch is five instruction edits in the build's own update machinery, plus one free header
word rebalanced so the bootloader's plaintext word-sum check still passes:

- the reader-window widening, `mov.w r3,#0x10000 → #0x400000`;
- the three halfword loads/stores of the wire-79 reader's cursor, which wrapped every 64 KiB;
- the arm tail's cursor reset, `strh r5,[r4,#12] → str r5,[r4,#12]`. Without it, the arm zeroes
  only the low half of the now 32-bit cursor. After a read that crosses 64 KiB, every later
  window is served pages too far up, and after the drain every read stalls until a power cycle
  (TESTING.md §35.4, §36).

Together they move exactly **thirteen bytes** on the part: 0x238..0x23B, 0x3C1C, 0x3C1D, 0x3C68,
0x3C69, 0x3C70, 0x3C71, 0x3DB7, 0x3DC6, 0x3DC7 (bank-relative). The 0.x line carries the same
arm-tail edit at its own offsets (see the table above).

A flash slot does not hold the firmware image; it holds the image XOR a keystream. The wire-79
reader serves those SLOT BYTES. Pasting the new plaintext bytes into a ciphertext capture corrupts
the slot — the first FW-V1 wire run did exactly that. The pipeline conjugates instead:
`wire[off] := wire[off] XOR old_plain[off] XOR new_plain[off]` per patched byte; the keystream
cancels, the decrypted image changes by exactly the diff. (`conjugateCapture` in
`src/preservation/patch.ts`.)

### The honest risk

**P2 and P4 write the ACTIVE boot slot.** On real hardware an interrupted write there has NO
bootable fallback: the other banks hold whatever they hold, the recovery slot is not written by
this pipeline, and a power loss mid-commit is unrecoverable without an SPI programmer. P1's backup,
P4's restore and the post-processed dump are the mitigation — not a guarantee. Run it on mains
power, keep `preserve_backup_windows.bin`, and treat every commit transfer as the moment the
camera can die.

### Running it

Against the emulator (needs the FW-V1 `emu` directory — point `SEEK_EMU_DIR` at one whose
`seekemu/cli.py` carries `--jedec`, `--flash`, `--flash-out`, `--corpus-entry` and
`--usbip-clock`; the suites boot the real corpus dumps, the corpus entry itself included):

```sh
SEEK_EMU_DIR=/path/to/FW-V1/emu npm run test -- preserve
# the whole file:
SEEK_EMU_DIR=/path/to/FW-V1/emu npx vitest run packages/core/test/preservation/
```

On hardware (Chrome/WebUSB or the node-usb backend). There is no image to pass: the run derives
everything from the camera, and the detailed plan prints after the backup step — before anything
write-shaped runs, with a second confirmation at that point on an interactive terminal:

```sh
seek-fw preserve --out ./preserve-run --yes
```

### Stepwise runs, and resuming one

The pipeline also exists as SIX RESUMABLE STEPS — `backup → patch → commit → drain → restore →
verify` — and this is what `seek-fw preserve` drives: after every step it rewrites
`preserve_run.json` (the run state: what completed, what each step produced, the sha256 of every
artifact) in the run directory. Three properties fall out of that, and they are the reason the
stepwise shape exists:

- **The restore source reaches disk before the first write.** The backup step persists the 31
  windows, the active-bank capture, the DERIVED factory plaintext, AND the standard dump archive
  built offline from the windows (decrypted slots, reports, manifest) — the user's pre-flash dump
  of every region the stock plan can read — before anything write-shaped can possibly run.
- **The run needs nothing but the camera and its own directory.** The image always comes from the
  camera itself, and the derived plaintext is a run artifact — so `--resume <dir>` needs no file
  but the run directory. (Run directories from before the self-sourcing schema kept their
  plaintext outside; resume one at a patch-building step and it asks for that file copied into
  the directory as `preserve_image_plain.bin`.)
- **A crash is a pause, not a loss.** Re-run with `--resume <dir>` and the run continues at
  `state.nextStep`; the interrupted step starts over, and a completed step is never repeated.
  The commit step is not replayable, so it reads the bank back before it writes: a bank that
  already holds the patch (a crash between the commit transfer and its checkpoint) is refused
  with "resume at the drain", and a bank that changed any other way is refused outright.

```sh
seek-fw preserve --print-state ./preserve-run    # the run's state, its next step, and
                                                 # whether the checkpoint files still match
seek-fw preserve --resume ./preserve-run         # continue from the run's next step
seek-fw preserve --resume ./preserve-run --from-step restore  # start at a chosen step
```

`--from-step` refuses, with the reason, when the step it names is missing its files from the
run directory (commit without the backup files) or already completed; jumping past an incomplete
commit warns loudly and then proceeds on your explicit assertion that the camera is in the
patched state — the restore's already-original detection and the verify's 0-diff proof stay in
the steps either way. A Ctrl-C is not a failure: it stops at the
next safe point, leaves the previous checkpoint standing, and exits 130 — the interrupted step is
re-run on the next `--resume`.

On a core level the same steps are `createPreserveRun(opts)` — no image argument; it builds the
empty, self-sourcing shell of a run — and
`runPreserveStep(step, opener, state, loadArtifact, reporter, signal?)` in
`packages/core/src/preservation/steps.ts`: core returns bytes as `Artifact[]` and never touches
the filesystem; the caller (CLI or web) persists them and rewrites the state after every step.
The plaintext-from-capture seam is `solvePlainFromCapture(family, capture)` in
`packages/core/src/preservation/solve.ts`.

Artifacts in the run directory: `preserve_run.json` (the state, rewritten after every step),
`preserve_backup_windows.bin` (the backup, assembled at its flash addresses),
`preserve_bank_capture.bin`, `preserve_image_plain.bin` (the factory plaintext the backup step
derived from the capture), `preserve_patch_plain_patched.bin` (the patched plaintext),
`preserve_dump_postwrite.bin` (the part as patched), `preserve_dump_original.bin` (the delivered
image — the camera's original content), plus `manifest.json`, `README.md` and the decrypted
slots under `decrypted/` (the backup's dump archive).

Artifacts in `--out`: `preserve_backup_windows.bin` (the P1 backup, assembled at its flash
addresses), `preserve_bank_capture.bin`, `preserve_image_plain.bin` (the derived factory
plaintext), `preserve_dump_postwrite.bin` (the part as patched), `preserve_dump_original.bin`
(the delivered image — the camera's original content) and `preserve_run.json` (per-step records
with sha256 of everything).

In the browser, the **Dump & decrypt 0.x/1.x 2014/2016** tab drives the same checkpoint-step API one step at a
time; the run there is self-sourced exactly as the CLI's is — the image comes from the camera's
active slot, never from a file the person picked — and each completed step re-issues a
downloadable run file, named start, save time and step reached
(`preserve-2026-10-04T00-14-42Z-2026-10-04T00-18-44Z-verified.zip`), from which the run resumes.
Inside, the run state and a README sit at the top and every checkpoint sits in the folder of the
page step that made it: `02-read-build/` (the backup, the twice-read boot slot, the derived and
patched images, the backup decrypted), `03-patch-dump/` (the raw post-commit part and
`preserve_dump_original.bin`, the complete original image) and `04-restore-verify/` (the verify's
re-read of the 31 windows after the restore). Older flat run files still load. The finished run is
checked by holding the complete image against the backup block by block. The commit session never
resets; the drain step owns the wire-89 and waits out the reboot ("the camera is restarting…").
This camera has no USB serial number, so Chrome forgets it on every reboot: the running step then
shows a blue "Your turn" box with its own Connect device button — pick the camera again and the
step continues by itself. These hand-offs are the expected flow, so the page asks for them calmly;
red is kept for real failures. A run whose committed patch predates the arm-tail cursor reset (the
fifth site) ends Patch & dump by asking you, the same way, to unplug the camera and plug it back
in: without that site the drain leaves the reader dead until it is powered off. With it, the
restore reads on the same boot and no replug is asked for. Compact Pro 1.0.3.0 needs no site for
it: its own arm tail already zeroes the whole cursor (`str r5,[r4,#12]`), so its runs read on the
same boot too. A camera whose boot-config block is erased (every 2016 Compact PRO in the record)
reads its record as blank on every boot; step 02 admits such a boot when the same boot serves the
device-identity block at `0x14020000`, so it no longer restarts the camera once per window.

## Operation mode 0, and why a cold camera used to hang

Each RPC carries two permission bits in the firmware's dispatch table: bit 0 "allowed in operation
mode 0", bit 1 "allowed in mode 1". They are not the same across builds:

| Command                                                            | 4.18.x            | 4.9.x                 |
| ------------------------------------------------------------------ | ----------------- | --------------------- |
| `BeginFirmwareUpgrade`                                             | `3` — either mode | `1` — **mode 0 only** |
| `GetFeaturedFirmwareData`                                          | `3` — either mode | `1` — **mode 0 only** |
| `GetFirmwareInfo`, `SetFirmwareInfoFeatures`, `SetRamDataFeatures` | `3`               | `3`                   |

So on a 4.9.x camera the two commands the dump is built from are refused while the camera is still
imaging, and the page has to get it into mode 0 first. Leaving imaging is not instant — there is a
sensor and a shutter to park — so the page now waits for mode 0 to actually read back rather than
assuming a fixed delay covers it, and says so plainly if the camera never gets there.

This is also why _reading device info first made dumping work_: the info selectors are allowed in
either mode, and the mode switch that happens on the way settles the camera before the dump starts.

Separately, WebUSB control transfers have no timeout of their own. A camera that simply never answers
left the transfer pending forever, which looked like the page freezing mid-dump with no error and no
retry. Every transfer is now raced against a timer (5 s, or 20 s for the commit, which erases and
programs inside the transfer), so a silent camera becomes an ordinary failure that the existing retry
path reopens and recovers from.

## Read chunk size

**The default is 64 bytes**, the EP0 max packet size, because that is the value that works on every
camera tested. Raising it to 256 is roughly four times faster and is fine on most units.

Some firmware does not tolerate the larger size everywhere. On a 4.9.x PIR324, 256-byte requests serve
65280 bytes of a window and then the request that would empty it is never answered — the same bytes
come back fine in 64-byte requests. So the page adapts: a failed request is retried once at the same
size, then at progressively smaller ones, and **whatever size works is kept for the rest of the
window**. Shrinking only for the stuck request and then going back up just stalls again on the next.

If a chunk will not come at any size, the read stops and keeps what it has. A single bad 256-byte
request used to discard the whole 64 KiB window; now the good bytes are kept, the missing tail is
gap-filled, and both the log and `manifest.json` record exactly which addresses were filled and why.

## Known limitation: the 0x14060000 gap

The USB command set exposes a read-window selector for every 64 KiB block of the 4 MiB flash **except**
`0x14060000..0x1406ffff`. That one block is filled with `0xff` in the combined image and recorded in
`manifest.json`.

**In practice this costs you nothing.** On most cameras that block is just erased flash, which reads
as `0xff` anyway — so the filler matches the real contents and the dump is complete.

And when the block _is_ in use, what it holds is a redundant copy. These cameras keep the same
firmware image in several 64 KiB slots. Across every multi-slot dump checked while building this
page, all slots decrypted to byte-identical firmware — in one case across four slots that had been
written with two different keys:

| Dump                       | Slots                                       | Decrypted firmware               |
| -------------------------- | ------------------------------------------- | -------------------------------- |
| Compact_Android_CW         | `14030000` `14050000` `14070000`            | all identical                    |
| Compact_Pro_Android_UQ-AAA | `14050000` **`14060000`** `14070000`        | all identical                    |
| Nano_300_CQ_ABAX           | `14030000` `14040000` `14050000` `14070000` | all identical (2 different keys) |
| Restore_20260801           | `14030000` `14050000` `14070000`            | all identical                    |

On the one unit with a real image at `0x14060000`, it was byte-for-byte the same as the copies at
`0x14050000` and `0x14070000` — so the archive still contains that firmware, just read from a
different address.

That redundancy is also why a camera whose `0x14060000` reads back as `0xff` is fine: the bootable
firmware still exists in the other slots. The dump view writes nothing to the device in any case — the
gap affects only the file you download, and the 4.x/Nano tab never touches that block either.

If you do want a strictly complete byte-for-byte image — to diff flash against a reference, say —
read it over SWD/J-Link or with an SPI programmer.

## Firmware and flashing

Firmware writes live on the **Work with firmware slots** tab (`#/slots`), which has its own command
vocabulary and asks before every write. The old `#flash` page is gone: `#flash` opens the Info tab.
The 4.x/Nano tab is read-only, and nothing on it can reach a write.

### What it shows

The **Info** tab (`#/`) and `seek-fw info` both read the camera. **Read firmware version** asks it what
it is, reads all three firmware slots and decrypts them locally. The **Work with firmware slots** tab
runs the same read under **Read slots**, then shows the banks next to the write controls. Neither
writes flash.

|                            |                                                                                                                                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Running firmware           | version and build string from `GetFirmwareInfo`, plus the bootloader's own build string                                                                                                                                                                                   |
| Serial, platform, USB link | from the device-id RAM block and the info selectors                                                                                                                                                                                                                       |
| Boot config                | `cfg[0]` at `0x14010000`, which slot the camera booted, which slot the next start runs (2014 chain and 2016 Compact PRO), and which slot an upgrade would write (rules below)                                                                                             |
| Keys                       | Key A and Key B, read out of the camera's bootloader block and confirmed against a slot's recovered keystream. On the 2016 Compact PRO, whose bootloader block is refused on every channel, the key its bootloader checks a bank under, named from the bank it entered    |
| Per-device key             | whether `0x14000218` is programmed                                                                                                                                                                                                                                        |
| Each slot                  | firmware version, image id, size, which key encrypts it, whether it passes the bootloader's acceptance sum and `CODE` footer check, whether the camera will boot it, and the SHA-256 of its plaintext. The model string from the footer is in `seek-fw info --json` only. |

Which slot the camera booted depends on the line. On the 2014 chain and the 2016 Compact PRO it is the
bank the active-slot word records as the camera's last start: the bootloader's own record of the bank it
entered (TESTING.md 42.56). On those two lines the read also names the bank the **next** start runs, from
the boot-config word and each bank's check, the way the bootloader picks it (TESTING.md 42.84). The
2016 check is the bank decrypted under the key its bootloader checks a bank under (key block 1 on
bootloader 1.2.0.0); the read names that key from the bank the camera entered, and calls a bank under any
other key not bootable. When the word's rule left that bank to last (recovery R under word 0 or 1), the
bootloader entered it without its check but still runs it under that key, so the key is named from it and
the row and `--json` (`keys.checkKey.inferred`) say it is inferred (TESTING.md 42.89). On 4.x it is
the bank the boot-config word predicts, and there the camera's own answer also sets the upgrade target,
overriding the prediction.
The **last start** row (`seek-fw info`, the Info tab and `seek-fw slots list`) gives the active-slot word
itself, in the same words on every line that reports it: the 2014 chain, the 2016 Compact PRO and 4.9.x
(4.8.x answers 0 whatever runs, so it shows none; TESTING.md 42.56, 42.89). `--json` carries the bank it
names as `boot.reportedBooted`.

The Writing section says how the camera can be written. On every line the banks are written one at a
time on the Slots tab (`seek-fw slots flash` or `patch-fps`), each staged in its line's form (plain on
the 2014 chain, under the image's own key block 0 on the 2016 Compact PRO, under keys derived from the
booted bank and the running application on 4.x), and the section lists what refuses every bank of the
camera, the reasons behind the Slots tab's banner. No line has a whole-image write, and the read no
longer reports one (`--json` has `bankWrites: {staged, refusedBy}` on every line and no `canFlash` or
`flashBlockedBy`; TESTING.md 42.89).

The read writes no flash. It sets two RAM selectors (`0x55`, `0x5a`). The identify step before it sends
the camera's unlock token, which leaves the vendor window unlocked until a power cycle, as
[described below](#the-camera-stays-unlocked-until-a-power-cycle).

When the upgrade target is the bank the camera booted from, the Info tab, the Slots tab and
`seek-fw info` show a warning: an upgrade run from that camera would overwrite the image it is running.
It is only a warning, and nothing stops the upgrade.

A second warning covers a camera that runs its recovery bank R while its own upgrade writes B. The
running image is not the one written, so the warning does not say it will be overwritten. It says what
B holds on this read: a bootable image (the same as R's when the two match), an empty bank, or a bank
whose bootability is unknown or not shown as bootable. With a bootable B it adds that an upgrade which
stops partway leaves B unbootable. This is the case measured on a 4.8.2.1 camera under boot word 2
(TESTING.md 42.50, 42.67). It is only a warning, and nothing stops the upgrade. `seek-fw info --json`
reports it as `boot.upgradeTargetRecovery`, and `boot.upgradeTargetWarning` carries the sentence.

### What it writes

To write a bank, give the Slots tab, or `seek-fw slots flash`, a **decrypted** image: the same kind of
file the dump tabs and `seek-fw slots dump` save. On the modern line (2.x, 4.x, 10.x, 42.x and 44.x)
the tool does the packaging:

1. stamps `header.length` (file `+0x204`) to the real image size;
2. tunes the reserved adjust word at `+0x238` so the 32-bit word sum over `header.length` bytes is
   `0x0000FFFF`, the bootloader's acceptance target;
3. encrypts the image under keys derived from that camera's own read, so the camera stores it under a
   key its bootloader tries (the store key, or the booted bank's key where the application's store key
   differs; see `packages/core/src/slots/write-keys.ts`);
4. appends `0xff` padding and a 64-byte `"CODE"` footer at `((header.length>>14)+1)*0x4000 - 0x40`. The
   footer keeps the image id, version and model string from the footer already on the device, and only
   the length is patched;
5. shows the plan before anything is sent: the bank, the new image next to what the bank holds now, the
   payload size in 64-byte chunks, the transfer checksum, and any warnings and notes;
6. streams the payload in 64-byte chunks, commits it, and reads the bank back to compare it with the
   image that was sent.

Nothing is sent until you confirm. Then unplug and replug the camera. A bank is used only at a start, so
the new image runs after the next power-up.

The other lines are packaged in their own ways. The 2014 plaintext chain takes the image as it is, with
no key and no footer. The 2016 Compact PRO and the 1.3.0.8 FF build have their own staged forms.
[Firmware slots](#firmware-slots-list-dump-and-flash-one-bank) has the details.

### Why the payload is bigger than your image

On the modern line each bank holds the encrypted image, the padding and that `CODE` footer. The
bootloader reads the footer straight out of flash, undecrypted, and takes the normal boot path only if
`footer[0] == "CODE"` and `footer[1] == header.length`.

The camera erases the whole 64 KiB block and writes back only what the host streams, and it never
writes the footer itself. So an upload of the bare image would wipe the footer that was there. The
bootloader would then fall through to its segmented loader, and the camera could be bricked. On this
line the Slots tab always streams the whole bank, and it refuses to send one whose footer does not
validate (`assertBankPayload` in `packages/core/src/image/bank.ts`).

The other classic failure is `header.length` not matching the real size. The bootloader sums exactly
`header.length` bytes, so a stale length makes the slot fail acceptance, and the camera quietly boots
the other bank. That is how "I flashed it but it is still running the old firmware" happens. The Slots
tab stamps the length and balances the sum over that exact range.

### Commands a write sends

Every slot read sets two RAM selectors. Neither writes flash:

- `0x55` SetFirmwareInfoFeatures selects which fields GetFirmwareInfo returns.
- `0x5a` SetRamDataFeatures arms the device-id block, so the serial can be read.

A write also sends:

- `0x52` BeginFirmwareUpgrade arms the bank's 64 KiB window. A dump uses the same command.
- `0x50` SetFeaturedFirmwareData streams the payload into the camera's RAM staging buffer, 64 bytes at
  a time.
- `0x51` CompleteMemoryUpgrade commits the payload. It is the only command that erases or programs
  flash.

The Slots tab and `seek-fw slots` never send `ResetDevice` (`0x59`). They refuse any window below the
bank area, so the bootloader at `0x14000000` and the boot-config block are never written. They also
refuse subcommand 0, the upgrade-target selector, which rewrites `cfg[0]` (`writeWindowOf` in
`packages/core/src/slots/write.ts`). Bank R can be written, with the extra acknowledgement described
under [Risk, plainly](#risk-plainly).

### The keys inside the image, and why the filename carries them

A firmware image contains its own `g_keyA` / `g_keyB`, and once it runs _those_ are the keys it uses:
Key A to decrypt an upload, Key B to re-encrypt it into flash. Flash an image whose table belongs to a
different camera and you have quietly changed which keys your camera will use from then on — every
later upgrade lands under a key the bootloader cannot try, and the camera stops taking updates.

So a decrypted image is named after the key pair it contains:

```
flash_4m_usb_partial_gap_ff_decrypted_14030000-KeyA-f32ad771…-KeyB-997ed6e5….bin
```

The suffix is added **only when the keys are genuinely in that image** — checked, not assumed. A
decrypted slot file gets the same suffix when its image holds the camera's own pair. The keys are
locatable by value but not by offset (the pair was found at `0xf54`, `0x9670`, `0x9a3c` and `0x9a40`
across builds, with no constant word nearby to anchor on), and what makes a value search safe is
uniqueness: each key must occur exactly once, so there is no ambiguity about which bytes to rewrite.
They are usually adjacent but need not be — a build may place them apart, and each is patched where it
is found. An image that does not contain the dump's own pair — because it was built for a different key
family, or keeps no literal keys — gets no suffix.

At flash time, on the modern line, the filename decides which keys are used:

- **The name carries a pair, and both keys occur once.** The image is rewritten to this camera's keys
  before packaging, so it will encrypt its own future upgrades with keys that camera's bootloader can
  read. If they are already this camera's keys, nothing changes.
- **The name has no pair.** The tool looks for this camera's pair in the image, then for the application
  pairs it knows (`packages/core/src/slots/application-pairs.ts`). It uses the first pair whose two
  halves each occur exactly once. If neither is found, the file is refused, because a wrong pair would
  quietly stop the camera accepting later updates.
- **The named keys are not both in the file, either occurs more than once, or a key sits in the
  cleartext header.** The file is refused, and the error says which check failed.

The acceptance sum is balanced after the substitution, so the patch costs nothing else.

### When a flash lands but the camera keeps running the old firmware

The bootloader's `image_try_keys()` tries exactly two keys: the store key (the per-device key at
`0x14000218` if one is programmed, otherwise Key B) and Key A. A slot written under any _third_ key
decrypts perfectly, passes its acceptance sum, has a valid footer — and is still skipped at boot,
because the bootloader has no way to derive that key.

The dumps hold one such bank. A Compact PRO dump with the 2019 bootloader runs 4.9.1.15 from banks A
and R. Its bank B holds the 1.0.3.2 application (January 2017) under a key found nowhere in that
flash: not in the bootloader's key table, not in the per-device slot (blank on that unit), and not
in any image. The bootloader cannot read that bank, and the camera ran 4.9.1.15. The dump does not
show how bank B came to be written. The two 4.9.2.0 dumps on the same bootloader have nothing of the
kind: every bank is under the bootloader's Key A, and the 4.9.2.0 application holds the
bootloader's own key pair.

So the Info tab, the Slots tab and `seek-fw info` report decryptability and bootability as separate
things. A slot is only marked bootable when the key that encrypted it is one the bootloader will
actually try. If a slot holds a valid image under any other key, the Slots tab says so after the read.
If that slot is the one an upgrade writes, the tab warns that a flash through it will not be booted.
Changing what such a camera runs needs an SPI programmer or SWD/J-Link.

After a commit the tool reads the bank back and recovers its keystream from the read-back itself. It
then checks that the bank decrypts to the image that was sent. A clean commit still does not show that
the camera will boot the bank. After a power cycle, read the slots again: the version and the bank the
camera reports are what settle it.

### Risk, plainly

`CompleteMemoryUpgrade` erases a 64 KiB bank and programs it. The Slots tab does not change the boot
config, and it has no control for choosing the boot bank. A write changes the bytes of the bank you
name, and the camera uses that bank at its next start if the bootloader takes it.

If the image fails the bootloader's checks, the camera skips that bank. That is harmless while another
bank is good. The dangerous case is an image that passes those checks but does not run. The camera
keeps booting it, and the bootloader has no USB. Recovering from that means writing your dump back with
an SPI programmer or over SWD/J-Link.

So keep a copy of the bank you write. Every write on the Slots tab and in `seek-fw slots` saves it
first, as one zip named with the time, the camera's serial, the firmware, the bank and the write
(`seek_backup_<time>_<serial>_v<firmware>_bank-B_before-copy-from-A.zip`): the bank as stored, its
decrypted image when a key opens it, and a note of what each file is. The page downloads it before
anything is sent, and the CLI writes it into `--dump-dir`. To go back, write the zip's decrypted
file with **Flash decrypted image** (`seek-fw slots flash`). A browser cannot tell when a download
reaches the disk, so check your downloads folder.

Bank R, the recovery bank, can be written too. It is the last image the camera has, and R runs only when
A and B hold nothing the bootloader takes. Writing R, or the bank the camera boots now, needs an explicit
acknowledgement: the checkbox on the Slots tab, or `--acknowledge-risk` on the CLI. Without it, nothing
is sent.

### Which cameras

The Slots tab and `seek-fw slots` cover builds **0.8.0.0** and newer. An older build is reported as
unsupported, with the reason, and nothing is sent to it. Each line can do this:

- **Read and write:** the modern line, 2.x, 4.x, 10.x, 42.x and 44.x (Compact, Compact PRO, Compact XR,
  Mosaic and Nano), with the `modern-4x` profile.
- **Read and write:** the 2014 plaintext-chain builds from 0.8.0.0 to 1.3.0.8, the builds listed in
  `PLAIN_CHAIN_VERSIONS` (`packages/core/src/slots/capability-family.ts`). That includes the 1.3.0.8 8 Hz
  and 16 Hz FF builds.
- **Read and write:** the Compact PRO 1.0.3.0 and 1.0.3.2, on the 2016 keystream line.
- **Read only:** any other 0.x or 1.x build from 0.8.0.0 up. Its banks can be dumped, but nothing is
  written, because its staging form was never measured.
- **Refused:** a camera whose build or family cannot be identified, and a camera whose keys cannot be
  confirmed against a bank. Each is refused with the reason, and nothing is armed.

The rules for each bank on each build are in [Firmware slots](#firmware-slots-list-dump-and-flash-one-bank).

### How it was verified

The packaging was checked against real hardware artifacts and in the emulator. The hardware runs are
under **What has been run** in the Firmware slots section.

- **Byte-identical rebuild.** The FW-V1 corpus holds 16 real 4 MiB dumps, with bootloaders from 2014,
  2016, 2018, 2019 and 2021 (Compact, Compact PRO and PRO FF, Compact XR, Mosaic, Nano). Each of their
  48 banks was decrypted and its plaintext run back through the packaging under that bank's own key,
  and every bank came out byte for byte as it is on the flash. On the 37 banks with a footer that is
  the image, the padding and the footer; on the 11 without one (the 2014 and 2016 lines, and two banks
  of the 4.9.1.15 dump) it is the image, with `0xFF` to the end of the block.
- **Agreement with the reference tool.** On those 37 banks, at their own size and grown by 4, 0x200
  and 0x1000 bytes and to the next 16 KiB boundary, the cipher, acceptance-sum repair, bank payload,
  footer offset and transfer checksum are byte-identical to FW-V1's `seek_fw_tool.mjs`: 183 of 185
  cases. In the other 2 both refuse the same 0x14000-byte payload as larger than the 64 KiB window.
  `seek_fw_tool.mjs` is the tool whose USB upload booted a real Compact PRO FF (FW-V1
  `docs/FIXED_BUGS.md`).
- **Emulator.** The slot path runs against the emulator in `packages/core/test/slots/`. A raw write to
  bank R reads back identical (`write.emulator.test.ts`). A raw dump matches the emulator's flash
  (`dump.emulator.test.ts`). The boot choice follows `cfg[0]` (`upgrade-target.emulator.test.ts`).
- **Refusals.** Bad images are refused before anything is sent. The shape checks are in
  `assertImageShape` (`packages/core/src/slots/write-image.ts`). A bad transfer checksum, or a status
  word during staging, stops the write before the commit, and nothing is written
  (`packages/core/test/slots/write-commit.test.ts`).
- **Key retargeting.** The image's keys are retargeted, and checked, before any payload is built
  (`accept.emulator.test.ts`, `write-keys.test.ts`).
- **Read-only.** The 4.x/Nano dump sends only the commands in `READ_ONLY_OPS`
  (`packages/core/src/protocol/ops.ts`). The workflow tests check this for every profile
  (`packages/core/test/workflows.test.ts`), and so does the slot read
  (`packages/core/test/slots/inspect.test.ts`).

## Firmware slots: list, dump and flash one bank

The **[`#slots`](https://yrambler2001.github.io/seek-thermal-firmware-dump/#/slots)** page and `seek-fw slots`
work on one 64 KiB firmware bank at a time — A, B or the recovery bank R — on every build from
**0.8.0.0** up. Older builds (0.3.0.1 .. 0.7.0.8) are reported as unsupported, with the reason, and
nothing is sent to them: they have no usable read handler.

```sh
seek-fw slots list                                  # banks, versions, keys, what each can do
seek-fw slots dump r --out ./banks                  # the bank as stored, plus the decrypted image
seek-fw slots flash b my-image.bin --dry-run        # print the plan, send nothing
seek-fw slots flash b my-image.bin                  # decrypted image, encrypted for THAT bank
seek-fw slots flash r prepared.bin --raw --acknowledge-risk   # raw staged bytes, verbatim
seek-fw slots copy a b --dump-dir ./backups                   # bank A's image into bank B
seek-fw slots restore b whole-flash.bin --dry-run             # bank B as a 4 MiB flash backup holds it
seek-fw slots patch-fps a                                     # frame-rate patch: prints the plan, sends nothing
seek-fw slots patch-fps all --write --acknowledge-risk        # every bank that offers it, booted bank last
```

- **Flash a decrypted image.** The page stamps the length, balances the acceptance sum and encrypts
  the image the way that generation needs: on the modern line (2.x, 4.x, 10.x, 42.x and 44.x) under keys
  derived from that camera's own read, so each bank stores the image under the bootloader's store key,
  or under the booted bank's own key where the application's store key is not the bootloader's (the
  camera re-encrypts the upload under its own store key); under the image's block-0 key stream on the
  2016 Compact PRO (the camera re-encrypts it into the bank's key); plain on the 2014 plaintext chain.
  A plain image is refused on a camera whose read finds no bank stored plain, because nothing then
  shows that the camera is on that chain.
- **Compact 1.3.0.8: two builds, one version string.** The 8 Hz build and the 16 Hz FF build report the
  same version. The image tells the page what it is (a stored word sum of 0 is the 8 Hz plain chain; an
  image carrying the FF key pair is the FF build), and the **camera** says which build runs: GetFirmwareInfo
  selectors 6, 7 and 8 answer, bank by bank, whether the running application takes the bank. The FF image
  is staged the way the vendor app stages it, the image XOR Key A with the header verbatim, and the camera
  stores it under Key B. It goes to A, B or R. A camera whose answers cannot tell the two builds apart is
  refused unless you say it runs the 16 Hz build (`--running-16hz` on the CLI). The stored form is not
  known to boot: no genuine bootloader for this build is in the corpus, so the boot is untested
  (`TESTING.md` §42.11 and §42.12).
- **Flash raw bytes.** The bytes you give go through the staging stream as they are. Whether they
  boot is the camera's business, and the plan says what the bootloader's checks make of them.
- **Raise the frame rate.** On a bank whose image the table knows, **Make N FPS** (or
  `seek-fw slots patch-fps`, a dry run unless `--write`) edits the bank's bytes so its picture
  publishes at a higher rate. The table offers 32 fps for the Compact 0.8.0.0, 0.9.0.2, 0.9.0.6,
  0.9.0.7, 0.9.1.0, 0.10.0.0, 1.0.0.0, 1.2.0.0, 1.3.0.0 and 1.3.0.8 builds on the plain 2014 chain,
  and for the Compact 4.8.1.7, 4.8.1.9 and 4.8.2.1 (the Compact XR 4.8.2.1 too) under Key A. It
  offers 18 fps for the Compact PRO 4.9.1.15, 4.9.2.0, 1.0.3.0 and 1.0.3.2. Other builds are refused, with the reason. The bank is saved
  first. **Make N FPS in every bank** (`patch-fps all`) patches every bank that offers it in one
  confirmation, one zip of them all saved first, the bank the camera boots now written last: a warm
  reset can start another bank than the one patched. A bank runs only after a boot, so power-cycle the
  camera afterwards. The page and `seek-fw slots list` also warn when a patched bank is one the camera
  will not run.
  [FPS_32HZ.md](FPS_32HZ.md) has how each build is patched and what was measured.
- **Writes arm bank 7/8/9 and nothing else.** They program that bank and leave the boot config
  alone, so there is no "select the active slot": the protocol has no such command. Writing the bank
  the camera boots now, or the recovery bank, needs an explicit acknowledgement (a checkbox on the
  page, `--acknowledge-risk` on the CLI). The bootloader (`0x14000000`) and the boot-config block are
  never written. After a write, unplug and replug the camera: a bank is only used at boot.
- **Bank addresses follow the generation.** The locked line (Compact 0.8 - 1.3, Compact PRO 1.0.3.x) has
  A/B/R at `0x14050000` / `0x14060000` / `0x14070000`. The modern line (2.x, 4.x, XR, Mosaic, Nano) has
  them at `0x14030000` / `0x14050000` / `0x14070000`; no selector reaches `0x14060000` there.
- **What each build can do is a table, not a guess.** `buildSlotPlan` (`packages/core/src/slots/`)
  derives it from the profile and the build's own selector table, with the reason for every "no", and a
  test checks every corpus build against it.
- **Read-back.** After a commit the bank is read again and its decrypted image compared with the
  image that was meant to be written.
- **Empty banks.** A bank whose image-header window reads as all `0xFF` (many 2014 cameras' bank B)
  is listed as `empty`, not as an error: it dumps as the raw 64 KiB of `0xFF` with nothing to
  decrypt, and it is written, confirmed and read back like any other bank, the plan saying nothing
  is overwritten. The risk acknowledgement rules do not change (`TESTING.md` §42.8).
- **Copy and restore.** **Copy to slot A / B / recovery slot R** (`seek-fw slots copy <from> <to>`)
  writes one bank's image, as the read decrypted it, into another bank, filled or empty, staged as any
  decrypted image is. **Restore from full flash backup** (`seek-fw slots restore <bank> <file>`) takes
  the 4 MiB image a J-Link reads, or a Preserve run file that holds the whole flash, cuts the bank out
  at its address, decrypts it, plans it, and after the write says whether the bank reads back as the
  backup stores it. A backup that looks like another camera's (the serial in its identity block at
  `0x14020000`), or of another firmware, is a warning; a bank that is empty in the backup cannot be
  restored by a write (`TESTING.md` §42.91).

What has been run: the whole path on the emulator for every build from 0.8.0.0 in the corpus
(`TESTING.md` §41). On **real** hardware: a Compact PRO 1.0.3.0 on a Compact board, a dump of all three
banks and a write of the recovery bank with the bank's own image, with an image changed by one byte
(the read-back decrypted to exactly that image) and with raw staged bytes, then restored (§41.3); the
slots bench, which flashes each supported corpus dump whole onto the bench Compact board and writes
its banks through the page, judged by the verdict table (§42, §42.30); an empty bank B written and
booted on the 2014 chain (§42.8); and a Compact XR 4.8.2.1 whose bank A took the frame-rate patch
(§42.24).

## The camera stays unlocked until a power cycle

The identify probe that runs before a read sends the camera's unlock token, an 18-byte form of
`BeginFirmwareUpgrade`. The Preserve backup sends it too. Once the camera accepts the token, it keeps
its vendor window unlocked until its next power cycle. So the Info, Dump, Preserve and Slots tabs do
this, and so do the CLI's `info`, `dump`, `slots` and `preserve` commands. A CLI run given `--no-probe`
or `--profile` skips the probe.

The page keeps one flag for the camera, so once one tab has sent the token, every tab shows the
note, and so does the Connect section. The CLI prints the note when the run closes its session, and `--quiet` hides it. The note is a
warning and gates nothing.

**Power-cycle the camera (unplug it, plug it back in) before you use another tool on it**, such as the
vendor app or a frame-rate checker. Until then, another tool may misread the camera.

## Browser and platform support

| Platform             | Dumping a camera                                                                                                                      | Decrypting a file |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **macOS**            | Works out of the box in Chrome/Edge/Chromium. No driver, no admin rights.                                                             | ✅                |
| **Linux**            | Needs a one-line udev rule (below).                                                                                                   | ✅                |
| **Windows**          | Needs WinUSB bound to the camera, via [Zadig](https://zadig.akeo.ie/) — pick the entry named after your camera, e.g. `CompactPRO FF`. | ✅                |
| **Android**          | Works in Chrome with a USB-OTG cable, if the phone can power the camera.                                                              | ✅                |
| **iPhone / iPad**    | **Not possible.** See below.                                                                                                          | ✅                |
| **Firefox / Safari** | Not possible — no WebUSB.                                                                                                             | ✅                |

WebUSB is a Chromium feature; Firefox and Safari have both declined to implement it. Only the dumping
half depends on it — offline decryption works everywhere.

### One tab at a time

Every tab and window of the page in one browser shares the camera's permission, and USB alone does
not keep them apart. A second tab's claim of the camera's interface is refused the same way a system
driver's would be, and the fallback the transport has for that case (device-recipient requests, see
`isPlatformClaimRefusal`) would let it read alongside the first: two dumps at once both came back
"Done", with wrong images. So the page holds a lock, a [Web Lock](https://developer.mozilla.org/docs/Web/API/Web_Locks_API)
shared by its tabs, for the length of every camera operation: a connection test, a dump, a
device-info read, a flash write, and each Preserve phase, its camera restarts and re-picks
included. A tab that tries while another holds it sends nothing and says _"The camera is in use in
another tab or window — finish or close it there first."_ Forget device waits for it too, since
forgetting the camera closes it in every tab. The lock goes when the operation ends, however it
ends, and when its tab is closed or reloaded. An idle tab holds nothing. A browser without Web Locks
(Chromium before 69) runs without it, as the page did before. It does not reach another browser,
another profile, the hosted page from a local one, or the CLI. Between those the operating system's
own claim is the only guard, so run one of them at a time.

### Linux udev rule

```
# /etc/udev/rules.d/70-seek-thermal.rules
SUBSYSTEM=="usb", ATTR{idVendor}=="289d", MODE="0666", TAG+="uaccess"
```

```sh
sudo udevadm control --reload-rules && sudo udevadm trigger
```

Then unplug and replug the camera. Snap and Flatpak Chromium builds are often sandboxed away from raw
USB; the `.deb`/`.rpm` build is the reliable one.

### Why iOS can never work

Safari does not implement WebUSB, and on iOS and iPadOS every browser — including Chrome and Firefox —
is required to render with WebKit. So no iOS browser exposes `navigator.usb`. There is no flag,
extension, or app that changes this.

Offline decryption does work on iOS, since it only reads a file you pick.

## How the decryption works

The firmware images are encrypted with a Marsaglia xorshift128 keystream (shifts 11/8/19). The 16-byte
key maps to the generator state as `x = k1^K`, `y = k2^K`, `z = k3^K`, `w = k0^K`, for a per-build
whitening constant `K`. One keystream word is consumed per image word and the generator always
advances, but words 128..143 (`0x200..0x23F`, the cleartext header) are left un-XORed. A key is
accepted when the 32-bit sum of the decrypted words equals the profile's target.

That acceptance test makes the cipher self-validating, which is what lets the key be found without
knowing where it is stored: every 16-byte window in the dump is a candidate. A pre-filter on the
decrypted reset vector — stack pointer must be SRAM-resident and word-aligned, entry must be a Thumb
code address — discards almost every window before the full checksum runs, so a pass over the whole
4 MiB takes a fraction of a second.

### The key search widens if the first pass fails

The obvious way to decide "SRAM-resident" is to read the dump's own word 0 and take its top byte.
That breaks on units that ship with a **poisoned reset vector**: word 0 reads `0xBEBEBE00` while the
rest of the vector table is intact, so the derived prefix is `0xbe` and every genuine candidate is
thrown away before the checksum ever runs. The key is sitting right there in the dump, and a naive
scan reports "no key found".

Because the pre-filter is only an optimisation — the checksum is the real acceptance test — relaxing
it can never yield a wrong key, only a slower scan. So the search runs in stages and stops at the
first one that finds a key:

| Stage            | SP constraint                                                               |
| ---------------- | --------------------------------------------------------------------------- |
| `reset-vector`   | top byte equals the dump's own word 0 — fastest, and what a naive scan does |
| `sram-region`    | any LPC43xx SRAM region (`0x10` or `0x20`)                                  |
| `alignment-only` | none; alignment and the entry vector alone                                  |

Dumps that the first stage already handles resolve identically and at identical speed. The stage that
succeeded is recorded per key as `keySearch` in `manifest.json` and in the per-slot report.

Two cipher profiles are known:

| Builds                               | `K`          | checksum target |
| ------------------------------------ | ------------ | --------------- |
| 2018.07.05 / 2019.01.07 / 2021.08.12 | `0x13579BDF` | `0x0000FFFF`    |
| 2016.06.26                           | `0x00000000` | `0x00000000`    |

Decryption is best-effort. A unit whose bootloader derives its key from chip OTP cannot be decrypted
from a flash dump alone, because the OTP is not in the dump. Those slots are skipped and listed in
`manifest.json`; the flash image itself is unaffected.

The implementation is a direct port of `decrypt_firmware.js` and produces byte-identical output —
verified against it on real dumps covering both cipher profiles, multi-key devices, duplicate slots,
and the no-key-found path.

## Development

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

The web app is built into `docs/`, which GitHub Pages serves, so **a change to the web app is not
released until `npm run build` is run and `docs/` is committed**. CI fails if the two are out of
sync.

### Running the web app locally

WebUSB needs a secure context, which means HTTPS or `localhost`. `npm run dev` gives you the latter.

On an Android phone the camera takes the phone's USB port (through an OTG adapter), so the phone
reaches the dev server over Wi-Fi, and a plain `http://<computer>:5173` has no WebUSB. Run

```sh
npm run dev:phone
```

It serves the app over HTTPS on port 5174 (`PORT=…` to change it) with a self-signed certificate
it makes in `packages/web/.cert/` for this computer's network address, and prints the address to
open on the phone. Chrome warns that the certificate is not trusted; tap _Advanced_, then _Proceed_.
If WebUSB is still missing on that page, `HTTP=1 npm run dev:phone` serves plain HTTP instead. Add
the printed address under `chrome://flags/#unsafely-treat-insecure-origin-as-secure` on the phone.
This mode has no live reload: Vite's client would reload the page as soon as the phone's Wi-Fi came
back after airplane mode, which mid-write would end the run. Reload the page by hand after an edit.

The other way is Android's _Wireless debugging_: once the phone is paired with `adb`,
`adb reverse tcp:5173 tcp:5173` lets it open `http://localhost:5173`, with no certificate at all.

### End-to-end runs in a browser

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

They use `puppeteer-core`, which drives a browser that is already installed and never downloads
one of its own. `e2e:emu`, `e2e:camera:bridge` and `e2e:prompt` drive Google Chrome (the macOS path
is the default; `SEEK_E2E_CHROME` points at another binary). The other two drive Electron, a
development dependency; its binary is fetched the first time it is needed (about 100 MB, or run
`npx install-electron` beforehand). Each run starts the browser on a new, empty profile in a
temporary directory and deletes it afterwards, so your own profile is never touched. The app is
served by a Vite dev server of the run's own, on a free port, never 5173 or 5174, with no live
reload, so editing files mid-run does not reload the page under it.

Google Chrome cannot be scripted past its WebUSB device chooser. The CDP event Puppeteer uses to
answer a chooser fires for Web Bluetooth, and not for `navigator.usb.requestDevice()`;
`e2e:prompt` measures that, and a pre-granting enterprise policy is not something these scripts
install. So there are two ways to put the app in front of a device:

- **Real WebUSB, in Electron** (`e2e:camera`, `e2e:camera:restart`). The page runs Chromium's own WebUSB on the real
  macOS USB stack, with nothing in between. Electron hands the chooser to its main process
  (`select-usb-device`, `e2e/electron/main.mjs`), which shows it to the test, and the test picks
  the camera by its vendor and product ids, as you would in Chrome's window. Permissions are
  Electron's own. For a camera with no serial number they are Chrome's: the grant belongs to one
  enumeration and is dropped when the camera leaves the bus, so a restart ends in the page's blue
  "Your turn" box and a new pick. The run records the serial string Chromium read (empty, for this
  camera).
- **The bridge** (`e2e:emu`, `e2e:camera:bridge`). The page's `navigator.usb` is replaced by a
  stand-in (`e2e/lib/stand-in.ts`), and every device call goes to Node (`e2e/lib/bridge.ts`),
  where a real device answers it: the emulator, or the camera through the CLI's own USB stack
  (node-usb). The stand-in behaves the way Chrome does with this camera. A camera that restarts
  sends a `disconnect`, then comes back as a new device with no `connect` event and nothing from
  `getDevices()`. The page shows its "Your turn" box, and the test presses **Connect device** and
  picks the camera in the bridge's chooser.

Neither covers Google Chrome itself: its chooser window, its permission store, or its exact
version. Electron 44 runs Chromium 152, a little behind Google Chrome (154 when this was written).

**`e2e:emu`** needs the FW-V1 emulator (`SEEK_EMU_DIR`, as for the emulator suites). It boots the
bench Compact 1.3.0.0's own dump and runs the whole wizard against it. A restart stops the emulator
and boots a fresh one from the flash it was holding, as the camera boots from its flash. The run
checks each run file's name (`preserve-<start>-<saved>-patch-built.zip`, `…-full-dump.zip`,
`…-verified.zip`) and its folders, down to `04-restore-verify/preserve_verify_windows.bin`. It
checks the raw and delivered dumps byte for byte against the emulated part, and the final page's
"matches the backup on all 31 blocks" and "Verified — a perfect match.". It also checks that the
camera's flash is back to exactly what it booted with. It takes about six minutes, headless.
`SEEK_E2E_EMU_FLASH=<4 MiB dump>` boots another part instead, on the emulator's default board,
and checks against it (`SEEK_E2E_EMU_VERSION`, `SEEK_E2E_EMU_POST_COMMIT_SHA` and
`SEEK_E2E_EMU_DUMP_SHA` add the strict checks; TESTING.md sec. 38 ran the bench Compact PRO
1.0.3.0 flash this way). For a part the expectation table knows (`e2e/lib/preserve-expectations.ts`)
the two shas come from the table. Every other spec's emulator target boots the same part.

**`e2e:camera`** and **`e2e:camera:bridge`** are read-only:

- **They will** connect, run Dump & decrypt twice and check the image, run Preserve step 02 (read
  the camera, build the patch in memory, and, if its reader comes up spent, reboot it by command and
  answer the "Your turn" pick), check the step 02 run file, and check that the page offers step 03
  with no red alarm. They work on whichever camera is attached: the product string is the one the
  camera enumerated with (`ioreg`), the version is the one it answered on the wire (and recorded in
  the dump's manifest), and the image is checked against the re-dump. `SEEK_E2E_CAMERA_NAME`,
  `SEEK_E2E_CAMERA_VERSION` and `SEEK_E2E_CAMERA_SHA` make each of those a strict check (the bench
  Compact 1.3.0.0 is `PIR206 Thermal Camera`, `1.3.0.0` and `40447c7e…`). The sha is the dump
  image's, gap-filled where no selector reaches, which on a 2016 part is not the flash's.
- **A known app refusal** fails step 02 with a first line that names it: an adjust word at
  `0x238` held by an edit Preserve does not know (`the rebalance word at 0x00000238 is not
free`). The board-patched Compact PRO 1.0.3.0 on the bench part is a known edit and passes. The
  tests that need the run file skip and say why.
- **They will not** start step 03 or 04, or confirm a write. Three guards stop
  it independently. The script refuses those buttons. The page refuses the flash-write requests
  before they leave it: on real WebUSB a guard loaded before any app code locks
  `USBDevice.prototype`'s transfer methods to a whitelist of reads, operation mode 0, the read
  window's arm (after the camera has reported its version) and the plain reset during step 02.
  The third guard is Electron's main process, which answers the chooser only for a Seek camera on
  the run's own page with that guard in place; on the bridge it is the bridge, which forwards the
  same whitelist. Anything else, `SetFeaturedFirmwareData` and `CompleteMemoryUpgrade` above all,
  is refused unsent and fails the run.
- They skip themselves when no camera is plugged in, when two are, or when another program holds
  the camera's interface (a Chrome tab mid-run, the CLI). Close the app's tabs first. A run takes
  about two minutes.

**`e2e:camera:restart`** is `e2e:camera` with the one path a plain run never takes: the camera
restarting. Step 02 reboots the camera only when its reader probe finds a dead reader, and on stock
firmware it never does. So the page-side guard answers the first 26 of the probe's reads (28 bytes
on `0x4F`, the probe's whole budget) with a stall, without sending them, which is what a dead
reader answers on the wire. Everything after that is the app's own code. The probe gives up, the
step reboots the camera with its plain `ResetDevice`, and the camera leaves the bus and comes back
as a new device. The page shows its blue "Your turn" box, the test answers the new pick, and the
step finishes on real reads. The guards are unchanged. The run used to allow exactly one reset,
and the bench part on Compact PRO 1.0.3.0 needed one per window (its erased boot-config record
read blank on every boot, and the probe rebooted until two boots agreed). The probe now admits
such a boot on the device-identity block, so the injected restart should be the only one; the cap
stays far above any honest run, the injected restart must go out, and any extra restarts are
counted and reported, not failed. The run checks the step 02 run file and a second Dump & decrypt with the same image as the
first, and it checks that step 03 is offered with no red alarm. It also records what Electron does
across the re-enumeration:

- a `disconnect` event and no `connect` event;
- `getDevices()` answering empty while the app tries to re-adopt the camera, and the camera again
  only after the pick;
- a new device id for the same camera.

It takes about two minutes.

#### Every test, either target

Beyond the four flows above, a set of target-agnostic checks runs the SAME test body on EITHER
target: the emulator (the default) or the real camera over real WebUSB (`SEEK_E2E_TARGET=camera`).
Read-only flows run on either unattended; a flow that writes flash runs freely on the emulator and,
on the camera, only through the write gate below (`SEEK_E2E_WRITE=i-understand`).

```sh
npm run e2e                # every unattended test (emulator + camera read-only); skips camera cleanly if none
npm run e2e:gate           # the camera write gate and the write guard's budgets (no browser, no device)
npm run e2e:dump           # sweep mode and an offline decrypt (SEEK_E2E_DUMP_FILE)
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

`SEEK_E2E_TARGET=camera npm run e2e:cancel` (and the like) runs a read-only check on the real
camera; without it they default to the emulator. Each test picks a sensible default target
(`e2e:forget` defaults to the camera), and skips cleanly when that target is not available.

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

Every test that runs Preserve step 02 runs it the way `e2e:camera` does: the plain reset the step
may send is allowed while it runs, every "Your turn" ask is answered, and a reset or any other
request a guard refused fails the test. The camera's guard used to refuse those resets unsent while
the step carried on as if the camera had rebooted, and nothing failed. The image a dump must come
back as is the emulator's known part, or on the camera the one `SEEK_E2E_CAMERA_SHA` names, or
else the first whole image the test read.

#### Writing the real camera

`e2e:write` runs Preserve 02→03→04 and holds every step to the camera's own row of an expectation
table (`e2e/lib/preserve-expectations.ts`). The row is chosen by what the camera reports: the version
it answered on the wire, the build step 02 found in its slot, and the edit on that build, if any.
There are two rows, the bench Compact 1.3.0.0 and Compact PRO 1.0.3.0 with the Compact board patch
(the bench camera now). A camera with no row stops after step 02, before the gate. The run:

1. Connects, and runs Dump & decrypt. That gives the image the run is held to (or
   `SEEK_E2E_CAMERA_SHA`) and the version the camera answered.
2. Runs step 02, which must match the row exactly before the gate is asked: the build, the edit
   and its balance, the two or five sites, the rebalance word, the chunks, the bank, the bytes that
   move, and no reboot. Its backup must also equal the dump in all 31 windows.
3. Asks the gate.
4. Reopens the app with the write guards, loads the step 02 run file, and runs steps 03 and 04.
   Each is checked: the chunks and the one commit with the row's checksum, one reboot and one pick
   each, no replug, the bytes the commit moved (all in the bank), the restore's record, and the
   31-window verify. For the two bench parts, the raw and delivered dumps are pinned to their
   measured shas.

On the emulator that is an ordinary write run (with `SEEK_E2E_WRITE_FULL=1`; `SEEK_E2E_EMU_FLASH`
boots another part, as for `e2e:emu`). It takes the same steps a person takes on the camera.

On the camera it passes through a gate (`approveWrite`, `e2e/lib/supervised-write.ts`) that cannot
be passed by accident: it needs `SEEK_E2E_WRITE=i-understand` and a non-CI session, and nothing
else. There is no typed confirmation. The safety is that step 02 has already matched the camera's
row exactly, and the gate prints the whole plan (firmware, this run's image sha, bank, chunks,
checksums, the bytes that move) before it lets the write go, so the run's log records what was
written. Without the env switch it refuses, so `e2e:all` and any default run never write.
`SEEK_E2E_WRITE=dry-run` reads the camera, checks step 02 against the row, and stops before the
first write.

Past the gate, the page write guard (`writeGuardScript({ lifted: true })`) opens each write phase
with exactly its row's budget: the chunks, one CompleteMemoryUpgrade carrying the plan's checksum,
and the resets. Anything else is refused unsent, before the camera erases anything. Steps 03 and 04
run in a new window, whose guard is seeded with the version step 02 matched: the commit session
probes the reader before it reads the version, which an unseeded guard refuses, and every version
the camera answers there must equal the seed. The vendor-id pick in Electron's main process is
unchanged. The bench camera's run:

```sh
SEEK_E2E_TARGET=camera SEEK_E2E_WRITE=i-understand npm run e2e:write
```

The run files are kept (the path is printed): the step 03 one holds the camera's whole flash.

The unplug / power-cycle flows on the camera use a USB power switch (`e2e/lib/power-switch.ts`): a
MANUAL mode that asks a human to unplug and replug and waits for the bus, or the RP2040 hardware
switch at `SEEK_E2E_SWITCH_DIR` driven over serial (`on/off/cycle <channel>`). The channel the
camera is on must be given (`SEEK_E2E_SWITCH_CHANNEL`) before anything toggles — the switch has two
channels and the wrong one would cut power to whatever else is plugged into it. Without it,
`e2e:unplug` on the camera toggles nothing and only reports. With it
(`SEEK_E2E_TARGET=camera SEEK_E2E_SWITCH_CHANNEL=2 npm run e2e:unplug`; the bench camera is on
channel 2), it cuts the power only during a read-only dump, with the page's write guard in place.
It cuts it with the switch's own `cycle`, so the switch turns the camera back on by itself even if
the run dies, and the run turns it on again afterwards anyway.

`SEEK_E2E_HEADED=1` shows the browser window, `SEEK_E2E_KEEP=1` keeps the downloads and the
emulator's flash images (the path is printed), `SEEK_E2E_SCRATCH` chooses where they go,
`SEEK_E2E_PORT` pins the dev server's port, `SEEK_E2E_SHOTS` is the phone-screenshot directory,
`SEEK_E2E_DUMP_FILE` is a 4 MiB dump for the offline-decrypt check, and `SEEK_E2E_CAMERA_NAME`,
`SEEK_E2E_CAMERA_VERSION` and `SEEK_E2E_CAMERA_SHA` pin the camera's product string, firmware
version and dump image (each is otherwise taken from the camera).

### Verifying a change against the original

`legacy/index.html` is the only version of this code that has ever driven real hardware, so it is the
reference. `scripts/verify-against-legacy.mjs` loads that page's own `<script>` into a stub-DOM `vm`
context, runs both implementations over real flash dumps, and requires identical results — recovered
keystream state, acceptance checksum, decrypted plaintext, and the rebuilt bank payload byte for
byte.

```sh
npm run build
node scripts/verify-against-legacy.mjs ~/path/to/SEEK_DUMPS
```

The dumps are real camera images and are deliberately not in this repository, so this is a local
audit tool rather than a CI gate. Run it before changing anything in `packages/core/src/crypto` or
`packages/core/src/image` — a bad payload bricks a camera whose bootloader has no USB recovery.
