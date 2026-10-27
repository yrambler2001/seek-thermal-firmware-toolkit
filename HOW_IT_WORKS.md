# How it works

The reference behind [README.md](README.md): the firmware families, what each tab sends to the camera,
how a bank is written and checked, and how the decryption works.
[PRESERVATION.md](PRESERVATION.md) covers the 0.x/1.x full-flash preservation run, and
[FPS_32HZ.md](FPS_32HZ.md) the frame-rate patch.

## How a 4.x/Nano dump reads the flash

The **Dump & decrypt 4.x/Nano** tab and `seek-fw dump`:

1. ask the camera which build it runs, then walk that build's own `BeginFirmwareUpgrade` selector map,
   reading each 64 KiB block of `0x14000000..0x143fffff` with `GetFeaturedFirmwareData` over EP0 vendor
   control transfers;
2. assemble the blocks into one 4 MiB image;
3. scan that image for firmware slots and decrypt them, recovering the key from the dump itself — by
   cryptanalysis, not by searching for a stored key;
4. hand you a directory or a single `.zip`.

The **offline mode** (the Decrypt File/Slot tab, `seek-fw decrypt`) takes a flash image you already have
— from this tool, from J-Link, or from an SPI programmer — and gives back the decrypted firmware. That path
touches no device and needs no WebUSB, so in the browser it works in **every** browser, including Safari,
Firefox and iOS.

### Archive contents

| Path                              | What it is                                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `flash_4m_usb_partial_gap_ff.bin` | the assembled 4 MiB flash image                                                                                             |
| `windows/*.bin`                   | each 64 KiB block exactly as it came off the wire                                                                           |
| `decrypted/*.bin`                 | each firmware image slot, decrypted — named `…-KeyA-<32 hex>-KeyB-<32 hex>` when the image embeds that key pair (see below) |
| `decrypted/*.txt`                 | per-slot report: key, key location, family and cipher, SP, entry, SHA-256                                                   |
| `decrypted/decryption_report.txt` | summary across all slots                                                                                                    |
| `manifest.json`                   | exact read, gap and decryption metadata, including the firmware family used                                                 |
| `README.md`                       | what the capture is and what its limits are                                                                                 |

## Firmware families

The code sorts every camera into a **firmware family**: a group of builds that speak the same protocol and
store their firmware the same way. Seek cameras do not all speak one protocol, and the differences are not
cosmetic — they change which selector exposes which block, how a stored key maps to the cipher state, and
what the bootloader will accept. The Info tab names the family in its Firmware family panel, `seek-fw info`
prints the same name with its id, `seek-fw info --families` lists the five, and `--family <id>` names one
by hand.

| `--family` id   | Name on the page            | Builds                                                                                                                                                | Read by                                                                               | Firmware stored                                                                                                   |
| --------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `modern-4x`     | Modern (2018+ selector map) | 2018 and later (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200, Nano 300 | the Dump & decrypt 4.x/Nano tab and `seek-fw dump`                                    | encrypted: xorshift128, K=0x13579BDF, sum 0x0000FFFF                                                              |
| `legacy-auth`   | Legacy locked firmware      | the 2014 Compacts 0.8.0.0 to 1.3.0.8, the 1.3.0.8 FF (16 Hz) among them                                                                               | the preservation run on the Dump & decrypt 0.x/1.x 2014/2016 tab (`seek-fw preserve`) | plain: no key, the stored words sum to 0; the 1.3.0.8 FF build is encrypted (two keystreams, K=0, sum 0x0000FFFF) |
| `compact-2016`  | 2016 Compact Pro            | the Compact PRO 1.0.3.x (1.0.3.0, 1.0.3.2)                                                                                                            | the preservation run (`seek-fw preserve`)                                             | encrypted: xorshift128, K=0, the decrypted words sum to 0                                                         |
| `early-compact` | Early Compact (pre-0.8)     | the Compacts before 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7, 0.7.0.8                                                            | none for 0.3.0.1 to 0.6.0.4; the preservation run for 0.7.0.7 and 0.7.0.8             | plain on 0.7.0.7 and 0.7.0.8; the older builds are never read                                                     |
| `generic`       | Unidentified camera         | a camera no other family matches                                                                                                                      | `seek-fw dump`, with the 4.x selector map; the 4.x/Nano tab refuses it                | not known: a decrypt tries the 4.x cipher, and the key is solved from the image either way                        |

Every family decrypts offline on the Decrypt File/Slot tab (`seek-fw decrypt`), whatever took the dump.
The Info tab (`seek-fw info`) reads every family from 0.8.0.0, `generic` included; the Work with firmware
slots tab (`seek-fw slots`) reads `modern-4x`, `legacy-auth` and `compact-2016` and refuses `generic`. An
`early-compact` camera is read by neither past its version. No family has a whole-image write: banks are
written one at a time on the Work with firmware slots tab, and what each build allows is in
[Which cameras](#which-cameras).

The Info tab's first read, "Read firmware version", shows only the version range: 0.x / 1.x goes to the
Dump & decrypt 0.x/1.x 2014/2016 tab, 2.x and newer to the Dump & decrypt 4.x/Nano tab. That is the tab,
not the family; the family comes with the full read.

The family is detected from evidence — and, on an attached camera, from **asking it**. Before a dump, a
dump of every selector or a device-info read, both the CLI and the web app send up to four read-only
transfers (`--no-probe` turns this off on the CLI): the running firmware's version, then — only if that
build can be read at all — a plain 2-byte arm of a bank the locked line protects, the 18-byte
authenticated arm of the same bank, and a read of a bank that is open on every line. Those answers
separate the families directly, where a USB product string or an acceptance sum only correlates with
them. The web app asks, and says why when it will not read a camera. On `info`, `decrypt` and `slots`,
`--family <id>` overrides detection; on `info` and `slots` it also skips the probe — but not the version
check: the run still reads the version first and refuses a camera that does not report it, or runs a
build older than 0.8.0.0, whatever family was named. The web app names no family by hand: its 4.x/Nano
tab reads only the modern family and refuses any other.

**`legacy-auth` and `compact-2016` share every selector, so the channel answers cannot tell them apart;
the version and the slots can.** The read is the same 31 windows either way, but each family checks the
banks against its own cipher's target. The probe's version decides the first read: a 1.0.3.x camera (the
Compact PRO's line) is read under `compact-2016` before any slot is read, so its banks are checked against
the 2016 target from the start (TESTING.md 42.84; it used to be read under `legacy-auth` first, which
reported every bank failing and then read the camera again). Once the slots are read, detection keeps the
probe's answers and adds what only the slots say: a bank under a real xorshift128 keystream that decrypts
to a word sum of 0 is the 2016 cipher, and rules `legacy-auth` out; a bank stored plain (the 2014 chain,
whose stored words sum to 0) rules `compact-2016` out; a bank that decrypts to 0xFFFF (the Compact 1.3.0.8
cipher) keeps a 1.0.3.x camera on `legacy-auth`. The bootloader's version (1.2.0.0 on the 2016 part,
0.9.0.0 on the 2014 Compact) corroborates. When the slots name the other family, the Info tab,
`seek-fw info` and "Read slots" (`seek-fw slots list`) redo the analysis under it, and a dump decrypts its
slots under it, saying in the report which family the read acted under. `compact-2016` declares no write
of its own: its banks are written one at a time on the Work with firmware slots tab, as on every line.

**`early-compact` refuses to dump, and that refusal is the point.** Every decrypted image carries its own
RPC method table — wire id = index + 53 — and recovering it from all 36 images in the reference corpus
shows five builds (0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4) with no `GetFeaturedFirmwareData` at all:
wire id `0x4F` is `UploadFirmwareRowSize` there, and nothing in this toolkit reads a window on them. On
0.7.0.7 and 0.7.0.8 it is in the table with its handler in the write (setter) column only, so the
control-IN read a dump sends cannot be dispatched either; 0.8.0.0 is the first build with a read handler
there. The same handler is the read side of `0x58` (`GetFeaturedData`) on those two builds, and the
preservation run reads them through it (`legacyReaderOp` in `packages/core/src/profiles/legacy-auth.ts`);
the Info tab, the dumps and the Work with firmware slots tab do not, and refuse every build older than
0.8.0.0 after reading its version. On 0.3.0.1, `0x52` — the id a dump arms 63 windows with — is
`EnterBootloaderMode`. Dumping such a camera would not read anything: each arm sets a flash target and
arms that build's firmware-upgrade stage instead (the camera stays in its application; TESTING.md 21.5).
The facts are committed in `packages/core/test/firmware/facts.json` and asserted by
`packages/core/test/firmware-facts.test.ts`.

**The locked line reaches `0x14060000` and the modern line does not**, which is the reverse of what
[the 0x14060000 gap](#known-limitation-the-0x14060000-gap-on-4x-and-nano) says about 4.x cameras: on a
2016 or 2017 build that block is subcommand 8 behind the authenticated channel, and the six protected
banks (`0x14010000`, `0x14030000`-`0x14070000`) come back with the token. What that line cannot reach is
`0x14000000`, blocked on every channel, and everything above `0x141FFFFF`, for which it decodes no
selector at all — 2 MiB that the dump now declares as gaps instead of trying 32 selectors and reporting 32
refusals.

Three properties that older versions of this tool conflated are kept independent, because measurement
showed they are:

- the **selector map** (which subcommand exposes which window),
- the **whitening constant K** (how a stored key maps to the keystream state),
- the **acceptance sum TARGET** (what the decrypted word sum must equal).

A real 1.3.0.8 Compact build (the 16 Hz FF one) has `TARGET = 0x0000FFFF` and yet **no whitening at
all**. Pairing the two, as the original single-file page did, reports that build's key wrongly — and a
wrong Key A poisons the upgrade path on a real camera. The tool now resolves K by looking for each candidate key form in the
image's own plaintext and keeping the one that actually occurs.

Adding a family is one file in `packages/core/src/profiles/` plus one `registerProfile()` call.

## Read-only by design

The dump view (the Dump & decrypt 4.x/Nano tab) can issue exactly six vendor commands. That is its entire
vocabulary, and there is no code path to anything else:

| Opcode | Name                    | Dir | Why                                                                                                      |
| ------ | ----------------------- | --- | -------------------------------------------------------------------------------------------------------- |
| `0x4e` | GetFirmwareInfo         | IN  | the running firmware version, read first: it picks the build's own selector table, or refuses the camera |
| `0x35` | GetErrorCode            | IN  | check status after each step                                                                             |
| `0x3c` | SetOperationMode        | OUT | only to select mode 0, and only if not already there                                                     |
| `0x3d` | GetOperationMode        | IN  | read the current mode                                                                                    |
| `0x4f` | GetFeaturedFirmwareData | IN  | the actual flash read                                                                                    |
| `0x52` | BeginFirmwareUpgrade    | OUT | volatile read-window selector only — it selects which block subsequent reads return, and writes nothing  |

Until the camera has reported its firmware version only three of the six go out, and only as reads —
`GetFirmwareInfo`, `GetOperationMode` and `GetErrorCode`, the reads that mean the same thing on every one
of the 36 images examined — because a command number does not mean the same thing on every build.

`SetFeaturedFirmwareData`, `CompleteMemoryUpgrade`, `ResetDevice` and every upload, commit and erase
command are absent from this view. `USBDevice.reset()` is never called either; the retry path just closes
and reopens the handle. Decryption happens entirely in memory on the copy in your browser and never
touches the device.

Writing lives on the **Work with firmware slots** tab, described in
[Firmware and flashing](#firmware-and-flashing), and in the preservation run's write steps. Nothing in the
dump view reaches either.

## Operation mode 0, and why a cold camera used to hang

Each RPC carries two permission bits in the firmware's dispatch table: bit 0 "allowed in operation mode
0", bit 1 "allowed in mode 1". They are not the same across builds:

| Command                                                            | 4.9.2.0, 4.18.2.0 | 4.9.1.15              |
| ------------------------------------------------------------------ | ----------------- | --------------------- |
| `BeginFirmwareUpgrade`                                             | `3` — either mode | `1` — **mode 0 only** |
| `GetFeaturedFirmwareData`                                          | `3` — either mode | `1` — **mode 0 only** |
| `GetFirmwareInfo`, `SetFirmwareInfoFeatures`, `SetRamDataFeatures` | `3`               | `3`                   |

Mode 0 only is the common case: of the 36 corpus images, only 4.9.2.0, 4.18.2.0, 2.27.1.33, 10.9.1.31
and 44.27.3.10 allow those two commands in either mode (`packages/core/test/firmware/facts.json`). So on
most cameras the two commands the dump is built from are refused while the camera is still
imaging, and the page has to get it into mode 0 first. Leaving imaging is not instant — there is a sensor
and a shutter to park — so the page waits for mode 0 to actually read back rather than assuming a fixed
delay covers it, and says so plainly if the camera never gets there.

This is also why _reading device info first made dumping work_: the info selectors are allowed in either
mode, and the mode switch that happens on the way settles the camera before the dump starts.

Separately, WebUSB control transfers have no timeout of their own. A camera that simply never answers
left the transfer pending forever, which looked like the page freezing mid-dump with no error and no
retry. Every transfer is now raced against a timer (5 s, or 20 s for the commit, which erases and
programs inside the transfer), so a silent camera becomes an ordinary failure that the existing retry path
reopens and recovers from.

## Read chunk size

**The default is 64 bytes**, the EP0 max packet size, and it is also the most a read asks for: a larger
`--chunk` is read at 64 bytes per request, because a longer control IN can lose a packet to the boot ROM
on an idle-clocked camera.

Some firmware does not tolerate a size everywhere. On a 4.9.x PIR324, 256-byte requests served 65280 bytes
of a window and then the request that would empty it was never answered — the same bytes came back fine
in 64-byte requests. So the read adapts: a failed request is retried once at the same size, then at half
that size, down to 32 bytes, and **whatever size works is kept for the rest of the window**. Shrinking
only for the stuck request and then going back up just stalls again on the next.

If a chunk will not come at any size, the read stops and keeps what it has. The good bytes are kept, the
missing tail is gap-filled, and both the log and `manifest.json` record exactly which addresses were
filled and why.

## Known limitation: the 0x14060000 gap on 4.x and Nano

On the modern line the USB command set exposes a read-window selector for every 64 KiB block of the 4 MiB
flash **except** `0x14060000..0x1406ffff`. That one block is filled with `0xff` in the combined image and
recorded in `manifest.json`. (The locked 0.x/1.x line reaches that block; see
[Firmware families](#firmware-families).)

**In practice this costs you nothing.** On most cameras that block is just erased flash, which reads as
`0xff` anyway — so the filler matches the real contents and the dump is complete.

And when the block _is_ in use, what it holds is a redundant copy. These cameras keep the same firmware
image in several 64 KiB slots. Across every multi-slot dump checked while building this page, all slots
decrypted to byte-identical firmware — in one case across four slots that had been written with two
different keys:

| Dump                       | Slots                                       | Decrypted firmware               |
| -------------------------- | ------------------------------------------- | -------------------------------- |
| Compact_Android_CW         | `14030000` `14050000` `14070000`            | all identical                    |
| Compact_Pro_Android_UQ-AAA | `14050000` **`14060000`** `14070000`        | all identical                    |
| Nano_300_CQ_ABAX           | `14030000` `14040000` `14050000` `14070000` | all identical (2 different keys) |
| Restore_20260801           | `14030000` `14050000` `14070000`            | all identical                    |

On the one unit with a real image at `0x14060000`, it was byte-for-byte the same as the copies at
`0x14050000` and `0x14070000` — so the archive still contains that firmware, just read from a different
address.

That redundancy is also why a camera whose `0x14060000` reads back as `0xff` is fine: the bootable
firmware still exists in the other slots. The dump view writes nothing to the device in any case — the gap
affects only the file you download, and the 4.x/Nano tab never touches that block either.

If you do want a strictly complete byte-for-byte image — to diff flash against a reference, say — read it
over SWD/J-Link or with an SPI programmer.

## Firmware and flashing

Firmware writes live on the **Work with firmware slots** tab (`#/slots`), which has its own command
vocabulary and asks before every write. The 1.0.0 page's `#flash` view is gone: `#flash` (and `#/dump`)
opens the Info tab, and TESTING.md 42.16 lists what its whole-image write did that a bank write does not. The 4.x/Nano
tab is read-only, and nothing on it can reach a write.

### What it shows

The **Info** tab (`#/`) and `seek-fw info` both read the camera. **Read firmware version** asks it what it
is, reads all three firmware slots and decrypts them locally. The **Work with firmware slots** tab runs
the same read under **Read slots**, then shows the banks next to the write controls. Neither writes flash.

|                            |                                                                                                                                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Running firmware           | version and build string from `GetFirmwareInfo`, plus the bootloader's own build string                                                                                                                                                                                   |
| Serial, platform, USB link | from the device-id RAM block and the info selectors                                                                                                                                                                                                                       |
| Boot config                | `cfg[0]` at `0x14010000`, which slot the camera booted, which slot the next start runs (2014 chain and 2016 Compact PRO), and which slot an upgrade would write (rules below)                                                                                             |
| Keys                       | Key A and Key B, read out of the camera's bootloader block and confirmed against a slot's recovered keystream. On the 2016 Compact PRO, whose bootloader block is refused on every channel, the key its bootloader checks a bank under, named from the bank it entered    |
| Per-device key             | whether `0x14000218` is programmed                                                                                                                                                                                                                                        |
| Each slot                  | firmware version, image id, size, which key encrypts it, whether it passes the bootloader's acceptance sum and `CODE` footer check, whether the camera will boot it, and the SHA-256 of its plaintext. The model string from the footer is in `seek-fw info --json` only. |

Which slot the camera booted depends on the line. On the 2014 chain and the 2016 Compact PRO it is the bank
the active-slot word records as the camera's last start: the bootloader's own record of the bank it
entered (TESTING.md 42.56). On those two lines the read also names the bank the **next** start runs, from
the boot-config word and each bank's check, the way the bootloader picks it (TESTING.md 42.84). The 2016
check is the bank decrypted under the key its bootloader checks a bank under (key block 1 on bootloader
1.2.0.0); the read names that key from the bank the camera entered, and calls a bank under any other key
not bootable. When the word's rule left that bank to last (recovery R under word 0 or 1), the bootloader
entered it without its check but still runs it under that key, so the key is named from it and the row
and `--json` (`keys.checkKey.inferred`) say it is inferred (TESTING.md 42.89). On 4.x it is the bank the
boot-config word predicts, and there the camera's own answer also sets the upgrade target, overriding the
prediction. The **last start** row (`seek-fw info`, the Info tab and `seek-fw slots list`) gives the
active-slot word itself, in the same words on every line that reports it: the 2014 chain, the 2016 Compact
PRO and 4.9.x (4.8.x answers 0 whatever runs, so it shows none; TESTING.md 42.56, 42.89). `--json` carries
the bank it names as `boot.reportedBooted`.

The Writing section says how the camera can be written. On every line the banks are written one at a time
on the Work with firmware slots tab (`seek-fw slots flash` or `patch-fps`), each staged in its line's form
(plain on the 2014 chain, under the image's own key block 0 on the 2016 Compact PRO, under keys derived
from the booted bank and the running application on 4.x), and the section lists what refuses every bank
of the camera, the reasons behind the Work with firmware slots tab's banner. No line has a whole-image write, and the read no
longer reports one (`--json` has `bankWrites: {staged, refusedBy}` on every line and no `canFlash` or
`flashBlockedBy`; TESTING.md 42.89).

The read writes no flash. It sets two RAM selectors (`0x55`, `0x5a`). The identify step before it sends
the camera's unlock token, which leaves the vendor window unlocked until a power cycle, as
[described below](#the-camera-stays-unlocked-until-a-power-cycle).

When the upgrade target is the bank the camera booted from, the Info tab, the Work with firmware slots tab and `seek-fw info`
show a warning: an upgrade run from that camera would overwrite the image it is running. It is only a
warning, and nothing stops the upgrade.

A second warning covers a camera that runs its recovery bank R while its own upgrade writes B. The running
image is not the one written, so the warning does not say it will be overwritten. It says what B holds on
this read: a bootable image (the same as R's when the two match), an empty bank, or a bank whose
bootability is unknown or not shown as bootable. With a bootable B it adds that an upgrade which stops
partway leaves B unbootable. This is the case measured on a 4.8.2.1 camera under boot word 2 (TESTING.md
42.50, 42.67). It is only a warning, and nothing stops the upgrade. `seek-fw info --json` reports it as
`boot.upgradeTargetRecovery`, and `boot.upgradeTargetWarning` carries the sentence.

### What it writes

To write a bank, give the Work with firmware slots tab, or `seek-fw slots flash`, a **decrypted** image:
the same kind of file the dump tabs and `seek-fw slots dump` save. On the modern line (2.x, 4.x, 10.x,
42.x and 44.x) the tool does the packaging:

1. stamps `header.length` (file `+0x204`) to the real image size;
2. tunes the reserved adjust word at `+0x238` so the 32-bit word sum over `header.length` bytes is
   `0x0000FFFF`, the bootloader's acceptance target;
3. encrypts the image under keys derived from that camera's own read, so the camera stores it under a key
   its bootloader tries (the store key, or the booted bank's key where the application's store key
   differs; see `packages/core/src/slots/write-keys.ts`);
4. appends `0xff` padding and a 64-byte `"CODE"` footer at `((header.length>>14)+1)*0x4000 - 0x40`. The
   footer keeps the image id, version and model string from the footer already on the device, and only
   the length is patched;
5. shows the plan before anything is sent: the bank, the new image next to what the bank holds now, the
   payload size in 64-byte chunks, the transfer checksum, and any warnings and notes;
6. streams the payload in 64-byte chunks, commits it, and reads the bank back to compare it with the image
   that was sent.

Nothing is sent until you confirm. Then unplug and replug the camera. A bank is used only at a start, so
the new image runs after the next power-up.

The other lines are packaged in their own ways. The 2014 plaintext chain takes the image as it is, with no
key and no footer. The 2016 Compact PRO and the 1.3.0.8 FF build have their own staged forms.
[Firmware slots](#firmware-slots-list-dump-and-flash-one-bank) has the details.

### Why the payload is bigger than your image

On the modern line each bank holds the encrypted image, the padding and that `CODE` footer. The bootloader
reads the footer straight out of flash, undecrypted, and takes the normal boot path only if
`footer[0] == "CODE"` and `footer[1] == header.length`.

The camera erases the whole 64 KiB block and writes back only what the host streams, and it never writes
the footer itself. So an upload of the bare image would wipe the footer that was there. The bootloader
would then fall through to its segmented loader, and the camera could be bricked. On this line the Work with firmware slots tab always streams the whole bank, and it refuses to send one whose footer does not validate
(`assertBankPayload` in `packages/core/src/image/bank.ts`).

The other classic failure is `header.length` not matching the real size. The bootloader sums exactly
`header.length` bytes, so a stale length makes the slot fail acceptance, and the camera quietly boots the
other bank. That is how "I flashed it but it is still running the old firmware" happens. The Work with firmware slots tab
stamps the length and balances the sum over that exact range.

### Commands a write sends

Every slot read sets two RAM selectors. Neither writes flash:

- `0x55` SetFirmwareInfoFeatures selects which fields GetFirmwareInfo returns.
- `0x5a` SetRamDataFeatures arms the device-id block, so the serial can be read.

A write also sends:

- `0x52` BeginFirmwareUpgrade arms the bank's 64 KiB window. A dump uses the same command.
- `0x50` SetFeaturedFirmwareData streams the payload into the camera's RAM staging buffer, 64 bytes at a
  time.
- `0x51` CompleteMemoryUpgrade commits the payload. It is the only command that erases or programs flash.

The Work with firmware slots tab and `seek-fw slots` never send `ResetDevice` (`0x59`). They refuse any window below the bank
area, so the bootloader at `0x14000000` and the boot-config block are never written. They also refuse
subcommand 0, the upgrade-target selector, which rewrites `cfg[0]` (`writeWindowOf` in
`packages/core/src/slots/write.ts`). Bank R can be written, with the extra acknowledgement described under
[Risk, plainly](#risk-plainly).

### The keys inside the image, and why the filename carries them

A firmware image contains its own `g_keyA` / `g_keyB`, and once it runs _those_ are the keys it uses: Key A
to decrypt an upload, Key B to re-encrypt it into flash. Flash an image whose table belongs to a different
camera and you have quietly changed which keys your camera will use from then on — every later upgrade
lands under a key the bootloader cannot try, and the camera stops taking updates.

So a decrypted image is named after the key pair it contains:

```
flash_4m_usb_partial_gap_ff_decrypted_14030000-KeyA-f32ad771…-KeyB-997ed6e5….bin
```

The suffix is added **only when the keys are genuinely in that image** — checked, not assumed. A decrypted
slot file gets the same suffix when its image holds the camera's own pair. The keys are locatable by value
but not by offset (the pair was found at `0xf54`, `0x9670`, `0x9a3c` and `0x9a40` across builds, with no
constant word nearby to anchor on), and what makes a value search safe is uniqueness: each key must occur
exactly once, so there is no ambiguity about which bytes to rewrite. They are usually adjacent but need
not be — a build may place them apart, and each is patched where it is found. An image that does not
contain the dump's own pair — because it was built for a different key family, or keeps no literal keys —
gets no suffix.

At flash time, on the modern line, the filename decides which keys are used:

- **The name carries a pair, and both keys occur once.** The image is rewritten to this camera's keys
  before packaging, so it will encrypt its own future upgrades with keys that camera's bootloader can
  read. If they are already this camera's keys, nothing changes.
- **The name has no pair.** The tool looks for this camera's pair in the image, then for the application
  pairs it knows (`packages/core/src/slots/application-pairs.ts`). It uses the first pair whose two halves
  each occur exactly once. If neither is found, the file is refused, because a wrong pair would quietly
  stop the camera accepting later updates.
- **The named keys are not both in the file, either occurs more than once, or a key sits in the cleartext
  header.** The file is refused, and the error says which check failed.

The acceptance sum is balanced after the substitution, so the patch costs nothing else.

### When a flash lands but the camera keeps running the old firmware

The bootloader's `image_try_keys()` tries exactly two keys: the store key (the per-device key at
`0x14000218` if one is programmed, otherwise Key B) and Key A. A slot written under any _third_ key
decrypts perfectly, passes its acceptance sum, has a valid footer — and is still skipped at boot, because
the bootloader has no way to derive that key.

The dumps hold one such bank. A Compact PRO dump with the 2019 bootloader runs 4.9.1.15 from banks A and
R. Its bank B holds the 1.0.3.2 application (January 2017) under a key found nowhere in that flash: not in
the bootloader's key table, not in the per-device slot (blank on that unit), and not in any image. The
bootloader cannot read that bank, and the camera ran 4.9.1.15. The dump does not show how bank B came to
be written. The two 4.9.2.0 dumps on the same bootloader have nothing of the kind: every bank is under the
bootloader's Key A, and the 4.9.2.0 application holds the bootloader's own key pair.

So the Info tab, the Work with firmware slots tab and `seek-fw info` report decryptability and bootability as separate
things. A slot is only marked bootable when the key that encrypted it is one the bootloader will actually
try. If a slot holds a valid image under any other key, the Work with firmware slots tab says so after the read. If that slot
is the one an upgrade writes, the tab warns that a flash through it will not be booted. Changing what such
a camera runs needs an SPI programmer or SWD/J-Link.

After a commit the tool reads the bank back and recovers its keystream from the read-back itself. It then
checks that the bank decrypts to the image that was sent. A clean commit still does not show that the
camera will boot the bank. After a power cycle, read the slots again: the version and the bank the camera
reports are what settle it.

### Risk, plainly

`CompleteMemoryUpgrade` erases a 64 KiB bank and programs it. The Work with firmware slots tab does not change the boot
config, and it has no control for choosing the boot bank. A write changes the bytes of the bank you name,
and the camera uses that bank at its next start if the bootloader takes it.

If the image fails the bootloader's checks, the camera skips that bank. That is harmless while another
bank is good. The dangerous case is an image that passes those checks but does not run. The camera keeps
booting it, and the bootloader has no USB. Recovering from that means writing your dump back with an SPI
programmer or over SWD/J-Link.

So keep a copy of the bank you write. Every write on the Work with firmware slots tab and in `seek-fw slots` saves it first,
as one zip named with the time, the camera's serial, the firmware, the bank and the write
(`seek_backup_<time>_<serial>_v<firmware>_bank-B_before-copy-from-A.zip`): the bank as stored, its
decrypted image when a key opens it, and a note of what each file is. The page downloads it before
anything is sent, and the CLI writes it into `--dump-dir`. To go back, write the zip's decrypted file with
**Flash decrypted image…** (`seek-fw slots flash`). A browser cannot tell when a download reaches the disk,
so check your downloads folder.

Bank R, the recovery bank, can be written too. It is the last image the camera has, and R runs only when
A and B hold nothing the bootloader takes. Writing R, or the bank the camera boots now, needs an explicit
acknowledgement: the checkbox on the Work with firmware slots tab, or `--acknowledge-risk` on the CLI. Without it, nothing is
sent.

### Which cameras

The Work with firmware slots tab and `seek-fw slots` cover builds **0.8.0.0** and newer. An older build is
reported as unsupported, with the reason, and nothing but the version read is sent to it. Each line can
do this:

- **Read and write:** the modern line, 2.x, 4.x, 10.x, 42.x and 44.x (Compact, Compact PRO, Compact XR,
  Mosaic and Nano), with the `modern-4x` family.
- **Read and write:** the 2014 plaintext-chain builds from 0.8.0.0 to 1.3.0.8, the builds listed in
  `PLAIN_CHAIN_VERSIONS` (`packages/core/src/slots/capability-family.ts`). That includes the 1.3.0.8 8 Hz
  and 16 Hz FF builds.
- **Read and write:** the Compact PRO 1.0.3.0 and 1.0.3.2, on the 2016 keystream line.
- **Read only:** any other 0.x or 1.x build from 0.8.0.0 up. Its banks can be dumped, but nothing is
  written, because its staging form was never measured.
- **Refused:** a camera whose build or family cannot be identified, and a camera whose keys cannot be
  confirmed against a bank. Each is refused with the reason, and nothing is armed.

The rules for each bank on each build are in
[Firmware slots](#firmware-slots-list-dump-and-flash-one-bank).

### How it was verified

The packaging was checked against real hardware artifacts and in the emulator. The hardware runs are
under **What has been run** in the Firmware slots section.

- **Byte-identical rebuild.** The FW-V1 corpus holds 16 real 4 MiB dumps, with bootloaders from 2014,
  2016, 2018, 2019 and 2021 (Compact, Compact PRO and PRO FF, Compact XR, Mosaic, Nano). Each of their 48
  banks was decrypted and its plaintext run back through the packaging under that bank's own key, and
  every bank came out byte for byte as it is on the flash. On the 37 banks with a footer that is the
  image, the padding and the footer; on the 11 without one (the 2014 and 2016 lines, and two banks of the
  4.9.1.15 dump) it is the image, with `0xFF` to the end of the block.
- **Agreement with the reference tool.** On those 37 banks, at their own size and grown by 4, 0x200 and
  0x1000 bytes and to the next 16 KiB boundary, the cipher, acceptance-sum repair, bank payload, footer
  offset and transfer checksum are byte-identical to FW-V1's `seek_fw_tool.mjs`: 183 of 185 cases. In the
  other 2 both refuse the same 0x14000-byte payload as larger than the 64 KiB window. `seek_fw_tool.mjs` is
  the tool whose USB upload booted a real Compact PRO FF (FW-V1 `docs/FIXED_BUGS.md`).
- **Emulator.** The slot path runs against the emulator in `packages/core/test/slots/`. A raw write to
  bank R reads back identical (`write.emulator.test.ts`). A raw dump matches the emulator's flash
  (`dump.emulator.test.ts`). The boot choice follows `cfg[0]` (`upgrade-target.emulator.test.ts`).
- **Refusals.** Bad images are refused before anything is sent. The shape checks are in
  `assertImageShape` (`packages/core/src/slots/write-image.ts`). A bad transfer checksum, or a status word
  during staging, stops the write before the commit, and nothing is written
  (`packages/core/test/slots/write-commit.test.ts`).
- **Key retargeting.** The image's keys are retargeted, and checked, before any payload is built
  (`accept.emulator.test.ts`, `write-keys.test.ts`).
- **Read-only.** The 4.x/Nano dump sends only the commands in `READ_ONLY_OPS`
  (`packages/core/src/protocol/ops.ts`). The workflow tests check this for every family
  (`packages/core/test/workflows.test.ts`), and so does the slot read
  (`packages/core/test/slots/inspect.test.ts`).

## Firmware slots: list, dump and flash one bank

The **Work with firmware slots** tab
([`#/slots`](https://yrambler2001.github.io/seek-thermal-firmware-dump/#/slots)) and `seek-fw slots` work
on one 64 KiB firmware bank at a time — A, B or the recovery bank R — on every build from **0.8.0.0** up.
Older builds (0.3.0.1 .. 0.7.0.8) are reported as unsupported, with the reason, and nothing but the
version read is sent to them: they have no read handler for the command a slot read sends.

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

- **Flash a decrypted image.** The page stamps the length, balances the acceptance sum and encrypts the
  image the way that generation needs: on the modern line (2.x, 4.x, 10.x, 42.x and 44.x) under keys
  derived from that camera's own read, so each bank stores the image under the bootloader's store key, or
  under the booted bank's own key where the application's store key is not the bootloader's (the camera
  re-encrypts the upload under its own store key); under the image's block-0 key stream on the 2016
  Compact PRO (the camera re-encrypts it into the bank's key); plain on the 2014 plaintext chain. A plain
  image is refused on a camera whose read finds no bank stored plain, because nothing then shows that the
  camera is on that chain.
- **Compact 1.3.0.8: two builds, one version string.** The 8 Hz build and the 16 Hz FF build report the
  same version. The image tells the page what it is (a stored word sum of 0 is the 8 Hz plain chain; an
  image carrying the FF key pair is the FF build), and the **camera** says which build runs:
  GetFirmwareInfo selectors 6, 7 and 8 answer, bank by bank, whether the running application takes the
  bank. The FF image is staged the way the vendor app stages it, the image XOR Key A with the header
  verbatim, and the camera stores it under Key B. It goes to A, B or R. Nothing refuses it: the plan says
  before you confirm what the camera is expected to do with it. The 8 Hz build checks the plain word sum
  and is expected to refuse it at commit (0x00070100) before anything is written. A camera on another
  version writes a bank without checking the image, so it is expected to write the payload as sent, in a
  form it cannot start (a 1.3.0.0 Compact did so, `TESTING.md` §42.109). When the camera's answers cannot
  tell the two builds apart, the plan says what each build does. The stored form is not known to boot: no
  genuine bootloader for this build is in the corpus, so the boot is untested (`TESTING.md` §42.11 and
  §42.12).
- **Flash raw bytes.** The bytes you give go through the staging stream as they are. Whether they boot is
  the camera's business, and the plan says what the bootloader's checks make of them.
- **Raise the frame rate.** On a bank whose image the table knows, **Make N FPS** (or
  `seek-fw slots patch-fps`, a dry run unless `--write`) edits the bank's bytes so its picture publishes
  at a higher rate. The table offers 32 fps for the Compact 0.8.0.0, 0.9.0.2, 0.9.0.6, 0.9.0.7, 0.9.1.0,
  0.10.0.0, 1.0.0.0, 1.2.0.0, 1.3.0.0 and 1.3.0.8 builds on the plain 2014 chain, and for the Compact
  4.8.1.7, 4.8.1.9 and 4.8.2.1 (the Compact XR 4.8.2.1 too) under Key A. It offers 18 fps for the Compact
  PRO 4.9.1.15, 4.9.2.0, 1.0.3.0 and 1.0.3.2. Other builds are refused, with the reason. The bank is saved
  first. **Make N FPS in every bank** (`patch-fps all`) patches every bank that offers it in one
  confirmation, one zip of them all saved first, the bank the camera boots now written last: a warm reset
  can start another bank than the one patched. A bank runs only after a boot, so power-cycle the camera
  afterwards. The page and `seek-fw slots list` also warn when a patched bank is one the camera will not
  run. [README.md](README.md#raise-the-frame-rate-32--18-fps) has the steps, and
  [FPS_32HZ.md](FPS_32HZ.md) how each build is patched and what was measured.
- **Writes arm the bank's own window and nothing else** (subcommand 5, 8 or 9 on the modern line, 7, 8 or 9
  on the locked line). They program that bank and leave the boot config alone, so
  there is no "select the active slot": the protocol has no such command. Writing the bank the camera
  boots now, or the recovery bank, needs an explicit acknowledgement (a checkbox on the page,
  `--acknowledge-risk` on the CLI). The bootloader (`0x14000000`) and the boot-config block are never
  written. After a write, unplug and replug the camera: a bank is only used at boot.
- **Bank addresses follow the generation.** The locked line (Compact 0.8 - 1.3, Compact PRO 1.0.3.x) has
  A/B/R at `0x14050000` / `0x14060000` / `0x14070000`. The modern line (2.x, 4.x, XR, Mosaic, Nano) has
  them at `0x14030000` / `0x14050000` / `0x14070000`; no selector reaches `0x14060000` there.
- **What each build can do is a table, not a guess.** `buildSlotPlan` (`packages/core/src/slots/`)
  derives it from the family and the build's own selector table, with the reason for every "no", and a
  test checks every corpus build against it.
- **Read-back.** After a commit the bank is read again and its decrypted image compared with the image
  that was meant to be written.
- **Empty banks.** A bank whose image-header window reads as all `0xFF` (many 2014 cameras' bank B) is
  listed as `empty`, not as an error: it dumps as the raw 64 KiB of `0xFF` with nothing to decrypt, and it
  is written, confirmed and read back like any other bank, the plan saying nothing is overwritten. The
  risk acknowledgement rules do not change (`TESTING.md` §42.8).
- **Copy and restore.** **Copy to slot A / B / recovery slot R** (`seek-fw slots copy <from> <to>`) writes
  one bank's image, as the read decrypted it, into another bank, filled or empty, staged as any decrypted
  image is. **Restore from full flash backup…** (`seek-fw slots restore <bank> <file>`) takes a 4 MiB
  flash image (a J-Link read, for one), or a Preserve run file that holds the whole flash, cuts the bank
  out at its address, decrypts it, plans it, and after the write says whether the bank reads back as the
  backup stores it. A backup that looks like another camera's (the serial in its identity block at
  `0x14020000`), or of another firmware, is a warning; a bank that is empty in the backup cannot be
  restored by a write (`TESTING.md` §42.91).

What has been run: the whole path on the emulator for every build from 0.8.0.0 in the corpus
(`TESTING.md` §41). On **real** hardware: a Compact PRO 1.0.3.0 on a Compact board, a dump of all three
banks and a write of the recovery bank with the bank's own image, with an image changed by one byte (the
read-back decrypted to exactly that image) and with raw staged bytes, then restored (§41.3); the slots
bench, which flashes each supported corpus dump whole onto the bench Compact board and writes its banks
through the page, judged by the verdict table (§42, §42.30); an empty bank B written and booted on the
2014 chain (§42.8); and a Compact XR 4.8.2.1 whose bank A took the frame-rate patch (§42.24).

## The camera stays unlocked until a power cycle

The identify probe that runs before a read sends the camera's unlock token, an 18-byte form of
`BeginFirmwareUpgrade`. The preservation backup sends it too. Once the camera accepts the token, it keeps
its vendor window unlocked until its next power cycle. So the Info, both Dump & decrypt and the Work with
firmware slots tabs do this, and so do the CLI's `info`, `dump`, `slots` and `preserve` commands. A CLI run
given `--no-probe` or `--family` skips the probe.

The page keeps one flag for the camera, so once one tab has sent the token, every tab shows the note, and
so does the Connect section. The CLI prints the note when the run closes its session, and `--quiet` hides
it. The note is a warning and gates nothing.

**Power-cycle the camera (unplug it, plug it back in) before you use another tool on it**, such as the
vendor app or a frame-rate checker. Until then, another tool may misread the camera.

## Browser and platform details

| Platform             | Reading a camera                                                                                                                      | Decrypting a file |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **macOS**            | Works out of the box in Chrome/Edge/Chromium. No driver, no admin rights.                                                             | yes               |
| **Linux**            | Needs a one-line udev rule ([README](README.md#browser-and-platform-support)).                                                        | yes               |
| **Windows**          | Needs WinUSB bound to the camera, via [Zadig](https://zadig.akeo.ie/) — pick the entry named after your camera, e.g. `CompactPRO FF`. | yes               |
| **Android**          | Works in Chrome with a USB-OTG cable, if the phone can power the camera.                                                              | yes               |
| **iPhone / iPad**    | **Not possible.** See below.                                                                                                          | yes               |
| **Firefox / Safari** | Not possible — no WebUSB.                                                                                                             | yes               |

WebUSB is a Chromium feature; Firefox and Safari have both declined to implement it. Only the half that
talks to the camera depends on it — offline decryption works everywhere.

### One tab at a time

Every tab and window of the page in one browser shares the camera's permission, and USB alone does not
keep them apart. A second tab's claim of the camera's interface is refused the same way a system driver's
would be, and the fallback the transport has for that case (device-recipient requests, see
`isPlatformClaimRefusal`) would let it read alongside the first: two dumps at once both came back "Done",
with wrong images. So the page holds a lock, a
[Web Lock](https://developer.mozilla.org/docs/Web/API/Web_Locks_API) shared by its tabs, for the length of
every camera operation: a connection test, a dump, a device-info read, a flash write, and each preservation
step, its camera restarts and re-picks included. A tab that tries while another holds it sends nothing and
says _"The camera is in use in another tab or window — finish or close it there first."_ Forget device
waits for it too, since forgetting the camera closes it in every tab. The lock goes when the operation
ends, however it ends, and when its tab is closed or reloaded. An idle tab holds nothing. A browser without
Web Locks (Chromium before 69) runs without it. It does not reach another browser, another profile, the
hosted page from a local one, or the CLI. Between those the operating system's own claim is the only
guard, so run one of them at a time.

### Why iOS can never work

Safari does not implement WebUSB, and on iOS and iPadOS every browser — including Chrome and Firefox — is
required to render with WebKit. So no iOS browser exposes `navigator.usb`. There is no flag, extension, or
app that changes this.

Offline decryption does work on iOS, since it only reads a file you pick.

## How the decryption works

The firmware images of the modern line, the 2016 Compact PRO and the Compact 1.3.0.8 16 Hz FF build are
encrypted with a Marsaglia xorshift128 keystream (shifts 11/8/19); the 2014 chain (Compact 0.8.0.0 to
1.3.0.8 at 8 Hz) stores its images plain, and the solve below finds the all-zero state for them. The
16-byte key maps to the generator state as `x = k1^K`, `y = k2^K`, `z = k3^K`, `w = k0^K`, for a
per-build whitening constant `K`. One keystream word is consumed per image word and the generator always
advances, but words 128..143 (`0x200..0x23F`, the cleartext header) are left un-XORed. The bootloader
accepts an image when the 32-bit sum of its decrypted words equals its line's target.

The key is not searched for. xorshift128 is linear over GF(2), so every keystream word is a linear function
of the 128-bit state. A Cortex-M image's vector table has reserved words (7 to 10) that are 0 in the
plaintext, so the ciphertext there is the keystream itself, and those 128 bits solve for the state
directly (`recoverState` in `packages/core/src/crypto/recover.ts`). The stored key is never needed, so a
slot decrypts even when the dump's key region is missing or could not be read, and the solve does not
read the reset vector, so a damaged reset vector does not stop it.

Each recovered key is then checked, and the reports say how in words:

| Verdict                           | When                                                                                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| verified by the acceptance sum    | the decrypted word sum equals the family's target, the check the bootloader itself makes                                                            |
| verified by the vector table only | no target matched, but reserved word 13, which the solve did not use, decrypts to 0 and the reset vector is an SRAM stack pointer and a Thumb entry |
| not verified                      | neither; the slot is still decrypted                                                                                                                |

`manifest.json` and `seek-fw decrypt --json` keep the code names (`VERIFIED(family)`,
`VERIFIED(structural)`, `UNVERIFIED`).

The cipher and acceptance forms known so far (K is resolved per image, as
[Firmware families](#firmware-families) says):

| Builds                                                 | `K`                          | checksum target              |
| ------------------------------------------------------ | ---------------------------- | ---------------------------- |
| 2018.07.05 / 2019.01.07 / 2021.08.12 (the modern line) | `0x13579BDF`                 | `0x0000FFFF`                 |
| 2016.06.26 (Compact PRO 1.0.3.x)                       | `0x00000000`                 | `0x00000000`                 |
| Compact 1.3.0.8 16 Hz FF                               | none (no whitening)          | `0x0000FFFF`                 |
| the 2014 plain chain                                   | not encrypted (stored as is) | stored word sum `0x00000000` |

Decryption never drops a slot: one that fails every check is still decrypted and reported as not
verified. Slots are found by the image header at each 64 KiB boundary; a dump with none decrypts nothing
and says so, and the flash image itself is unaffected.

The implementation is a direct port of `decrypt_firmware.js` and produces byte-identical output —
verified against it on real dumps covering both ciphers the 1.0.0 page knew, multi-key devices,
duplicate slots, and the no-key-found path.

## Command-line reference

The commands are the web app's tabs, one each ([README.md](README.md#command-line) has how to install
the CLI):

| Command                       | Tab                              | What it does                                                                                                                                                                                            |
| ----------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `seek-fw info`                | Info                             | firmware version, identity, slots, key table, boot config, upgrade target; `--devices` lists the cameras, `--families` the families                                                                     |
| `seek-fw preserve`            | Dump & decrypt 0.x/1.x 2014/2016 | the six-step preservation run; `--bank` chooses the banks it patches (default: the one the next start enters), `--backup-only` is its read-only first step, `--zip <file>` saves the run as one archive |
| `seek-fw dump`                | Dump & decrypt 4.x/Nano          | read the whole 4 MiB flash and decrypt it; `--all-selectors` probes every selector instead                                                                                                              |
| `seek-fw decrypt file <dump>` | Decrypt File/Slot                | decrypt a dump you already have — no camera needed                                                                                                                                                      |
| `seek-fw decrypt slot <file>` | Decrypt File/Slot                | decrypt one 64 KiB firmware bank from a file — no camera needed                                                                                                                                         |
| `seek-fw slots ...`           | Work with firmware slots         | list, dump, write, copy or restore one bank (A, B or R), or raise the frame rate of one bank or of every bank                                                                                           |

```sh
seek-fw info                                # what is this camera running?
seek-fw dump --out ./my-camera              # whole flash + decrypted images (4.x and Nano)
seek-fw decrypt file flash_4m.bin           # works with no camera attached
```

`seek-fw <command> --help` lists each command's options. A flag a command does not take is a usage error
(`seek-fw dump --family …` is refused, because the 4.x dump chooses its family from the camera). Common
options:

```
--out <dir>          write files to a directory (default)
--zip <file>         write a single archive instead
--family <id>        info, decrypt and slots: act under a family named by hand
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

`seek-fw slots flash` writes one bank. It shows the plan and asks first unless `--yes` is given. Every bank
write (`slots flash`, `copy`, `restore`, `patch-fps --write`) saves the bank it is about to change first,
as one zip in `--dump-dir` (the current directory by default). That is the bank only, not the whole flash,
so take a whole-flash backup first when the rest matters. On Linux the CLI needs the udev rule in
[README.md](README.md#browser-and-platform-support).
