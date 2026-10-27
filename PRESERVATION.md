# Full-flash preservation of the 0.x/1.x cameras

The **Dump & decrypt 0.x/1.x 2014/2016** tab (`#/preserve`) and `seek-fw preserve` take a whole-flash
image of a 2014 to 2017 camera over USB. This file is how that run works. [README.md](README.md) has the
steps a person takes; [HOW_IT_WORKS.md](HOW_IT_WORKS.md) has the firmware families and the slots.

`packages/core/src/preservation/` and `seek-fw preserve` implement a full-flash preservation pipeline for
the v1 "locked line" cameras. A stock camera of this line lets out 31 of the 64 blocks of its flash, so a
whole-flash image cannot be taken read-only. The pipeline is a separate, explicit route that runs only
when you start it: it writes a small temporary patch, reads the whole flash, and puts the original back.
It started with Compact 1.0.0.0 / 1.2.0.0 / 1.3.0.0 (FW-V1 docs 33 sec. 11.7 and 34) and now covers
sixteen builds across three cipher/acceptance families; the eight 2014 Compact 0.x builds (0.7.0.7 ..
0.10.0.0) joined in the doc-36 campaign. The command takes NO image argument: the backup step reads every
bank TWICE (two independent captures that must agree byte for byte; a disagreement on the bank the camera
runs refuses the run), derives each bank's factory plaintext (identity on the 2014 plain chain, the build
family's keystream solver on a cipher family), gates the derived images, says which bank the next start
enters and why, and prints what it will do before anything write-shaped runs.

## The supported builds

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

**Compact Pro 1.0.3.0 on a Compact board.** The 1.0.3.0 app reboots on any board but the PRO's, so a
Compact (PN297) running it carries a board patch in its banks (`scripts/patch-dump.mjs`: eight bytes of
app_init's board switch, balanced through the adjust word at `0x238`). That is the word the widening patch
balances through, and Preserve used to refuse it as "not free". It now knows the edit (`KNOWN_DERIVATIONS`
in `patch.ts`) and takes an image as it only when the edit's bytes are in place, taking them back out
leaves the adjust word at 0, and the image underneath detects as the factory 1.0.3.0 build. The patch then
balances ON TOP of the edit's share of the word: the word sum is linear, so on the bench camera
`0x6322E32A` (the edit's) + `0xF1003000` (the patch's) = `0x5423132A`, and five bytes move instead of
four. The restore stages the image as the slot held it, edit included, so the camera gets back the image
that boots on its board. An adjust word held by any other edit still refuses, naming the edits Preserve
knows.

Three 0.x-specific facts the plan print states and the gates enforce:

- **The 0.x line is emulator-proven, not hardware-proven.** Every 0.x patch was derived from the images'
  bytes and measured end-to-end on the emulator against the plaintext 1.3.0.0 donor (FW-V1 doc 36.4); no
  native flash dump of any of these builds exists, so a hardware run is the first silicon evidence for
  each. The capability line each run prints says so.
- **The 0.7.x builds serve their reader on wire 88 (`GetFeaturedData`), not 79.** Their method table puts
  the read handler in 0x4F's setter column, and 0x4F stalls for every request length. The pipeline selects
  the reader wire from the version (0x4F everywhere else); on 0.7.0.7 the widened mode-2 window serves the
  part from the A/B slot the boot config does NOT name (measured slot B `0x14060000` on the donor's blank
  record), so the drain unrotates the served bytes before the delivered dump is built.
- **On 0.8.0.0 and 0.7.0.8 the factory mode-2 row is a crash hazard**: it loads the word stored AT
  `0x14000000` (the bootloader vector's initial SP) and an armed read walks off SRAM — measured on 0.8.0.0
  (32 KiB served, then the guest faulted). The patch turns that dereference into a nop, and the drain gate
  refuses a run whose recorded patch lacks the site: the nop is applied BEFORE any mode-2 arm is ever sent.

The builds OLDER than 0.7.0.7 (0.3.0.1, 0.5.x, 0.6.0.4) are refused with the doc-cited verdict: the route
does not port to that generation (every arm shape answers `0x400000`, the mode-2 row is not a
`0x14000000`-named window, and the widen constant is not the patchable two-store immediate — FW-V1 doc
36.7), and no standard dump path exists on it either.

Two build-specific facts the plan print states and the gates enforce:

- **The 1.3.0.8-FF build boots its patch from the RECOVERY slot only.** Its raw word sum is the 0xFFFF
  sentinel, which the 2014 bootloader rejects at slots A/B — it boots the recovery bank unchecked. The run
  refuses a commit into A/B; when the backup first finds the build in slot A or B (the factory chimera's
  blank cfg), it takes recovery R as the bank the camera runs and reads and derives R in full. The restore is refused too, for a measured reason: no staged form of the factory image
  passes the running app's own acceptance while transforming back to the original slot bytes (accept1
  reads sum(P ⊕ ksD); the factory carries `0xB7AB9D17` there, not `0xFFFF`). The FF run ends with the
  delivered dump in hand and the patch in place; the original content can only go back with a full-flash
  programmer.
- **1.3.0.8 and 1.3.0.8-FF report the same version string.** The build is chosen from image properties —
  the 0xFFFF word-sum sentinel and the key blocks (located by value), never the version alone. A
  2018-or-later build (4.x, Compact XR, Nano 200/300, Mosaic) is refused with a pointer at the standard
  dump workflow: no widening patch is needed, the modern stock plan already reads 63 of the 64 flash
  windows.

A ciphered slot (the 2016 Compact PRO, the 1.3.0.8 FF build) is solved from its capture by the family's
keystream solver (`solvePlainFromCapture` in `packages/core/src/preservation/solve.ts`). A capture that no
family solves, or whose solved image fails the gates, is refused, and nothing is written.

## What it does — the four phases

| Phase                 | What happens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | What it touches             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| **P1 backup**         | Reads all 31 windows a stock camera can serve (BeginFirmwareUpgrade modes 3..9 with the 18-byte token, 0x0A..0x21 plain; 0x14010000..0x141FFFFF, 64 KiB each) and refuses to continue if any window comes back short. Every bank is then read AGAIN as an independent capture — the two must agree byte for byte (on the bank the camera runs a disagreement refuses the run; another bank is only marked as not writable) — and each bank's factory plaintext is DERIVED from its agreed capture. The derived image's header version must equal what the camera reports, and the build table's gates (detect hooks, before-bytes — an already-patched bank refuses here) run on it before anything is trusted. The boot-config record (mode 3), the active-slot word and each bank's check name the bank the next start enters. | read-only                   |
| **P2 in-place patch** | Commits the patch into each chosen bank (by default the bank the next start enters) via the raw types-7 path (`0x52` mode 7/8/9 + token, `0x50` staging in 64-B chunks, `0x51` commit with the u16 sum) — every chosen bank was already captured, double-read and its image gated in P1, and every one is read back before any is written. No boot-config write.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | **writes the chosen banks** |
| **P3 full dump**      | Sends the wire-89 reset; after re-enumeration it reads the active-slot word (the bootloader's record of the bank it entered) and stops before arming anything when that bank holds no patch. Otherwise it drains all 4 MiB through the widened mode-2 window (the patch turns the reader's 64 KiB window into the whole part) at 64 B per call (one EP0 packet — the ask measured exact on the hardware, TESTING.md §28.3). The DELIVERED dump is post-processed: every written bank's 64 KiB is replaced from the P1 backup, so the file you keep is the camera's original flash content, byte-clean.                                                                                                                                                                                                                           | read-only after the reset   |
| **P4 restore**        | Commits each written bank's ORIGINAL content back while the patched image still runs from SRAM, resets, then re-reads the 31 windows (every bank among them) and requires 0 differing bytes against the P1 backup.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | **writes the chosen banks** |

## Which banks it writes

The patch only runs if the start after P3's reset enters a patched bank, and the bootloader picks that
bank: the boot-config word sets the order (0 or 0xFFFFFFFF: A, B, R; 1: B, A, R; any other word: R, A, B),
the first two are checked (the 2014 chain: the stored word sum; the 2016 line: the bank decrypted under the
key its bootloader holds) and the last is entered unchecked. A watchdog reset early in a start makes both
bootloaders write a mark over the bank they entered and set the word to 2, so recovery R runs from then on
(FW-V1 `image.c` `boot_select_image`; the owner's 1.3.0.0 dump `4.bin` carries exactly that state,
TESTING.md sec. 23 and 42.92). The backup reads all three banks, and the plan says which bank the next start enters
and why before the first write. The choice (`--bank` in the CLI, the "Banks to patch" list on the page):

- **the bank the next start enters** (the default; when that cannot be known, every bank that holds an
  image);
- **slot A, slot B or recovery R** by name;
- **every bank** that holds an image, so whichever the start enters runs the patch; the restore puts all
  of them back.

A choice that leaves out the bank the next start enters is warned about and still runs: the drain then
sees the start enter an unpatched bank and stops before it reads anything, and the restore puts the
written banks back. A bank the run cannot write (erased, another build, its two reads disagree, stored
under another key than the camera's bootloader checks, the 1.3.0.8 FF build outside recovery R, or an
image that is not the stock firmware: a frame-rate build, named as such, or any change Preserve does not
know) is not offered, with the reason. When the bank the camera runs holds such an image, the run stops
before anything is written: write the stock image back first, then start a new run. The commit writes the
bank the bootloader tries first last, and the restore puts it back first.

## The patch, and the ciphertext rule

On Compact 1.0.0.0 / 1.2.0.0 / 1.3.0.0 the patch is five instruction edits in the build's own update
machinery, plus one free header word rebalanced so the bootloader's plaintext word-sum check still passes
(the other builds' patches are in the table above):

- the reader-window widening, `mov.w r3,#0x10000 → #0x400000`;
- the three halfword loads/stores of the wire-79 reader's cursor, which wrapped every 64 KiB;
- the arm tail's cursor reset, `strh r5,[r4,#12] → str r5,[r4,#12]`. Without it, the arm zeroes only the
  low half of the now 32-bit cursor. After a read that crosses 64 KiB, every later window is served pages
  too far up, and after the drain every read stalls until a power cycle (TESTING.md §35.4, §36).

On 1.3.0.0 they move exactly **thirteen bytes** on the part: 0x238..0x23B, 0x3C1C, 0x3C1D, 0x3C68,
0x3C69, 0x3C70, 0x3C71, 0x3DB7, 0x3DC6, 0x3DC7 (bank-relative). The 0.x line carries the same arm-tail edit
at its own offsets (see the table above).

A slot of a cipher family (the 2016 Compact PRO, the 1.3.0.8 FF build) does not hold the firmware image;
it holds the image XOR a keystream, and the wire-79 reader serves those SLOT BYTES. Pasting the new
plaintext bytes into such a capture corrupts the slot — the first FW-V1 wire run did exactly that. The
rule is to conjugate: `wire[off] := wire[off] XOR old_plain[off] XOR new_plain[off]` per patched byte; the
keystream cancels, the decrypted image changes by exactly the diff (`conjugateCapture` in
`packages/core/src/preservation/patch.ts`). On the 2014 plain chain the keystream is zero, and the
conjugated capture is what the commit stages. On a cipher family the commit's own transform makes the slot
bytes, so the run stages the patched image in the build's staged form (the table above), and the
conjugated capture is what the bank holds once the write has landed: a resumed commit compares against it
to tell a bank it already wrote.

## The honest risk

**P2 and P4 write boot banks.** On real hardware a bank whose write is interrupted fails the bootloader's
check, and the start falls to the next bank of the word's order; the last is entered unchecked, and a
power loss mid-commit can still need an SPI programmer. P1's backup, P4's restore, the write order and the
post-processed dump are the mitigation — not a guarantee. Run it on mains power, keep
`preserve_backup_windows.bin`, and treat every commit transfer as the moment the camera can die.

## Running it

Against the emulator (needs the FW-V1 `emu` directory — point `SEEK_EMU_DIR` at one whose
`seekemu/cli.py` carries `--jedec`, `--flash`, `--flash-out`, `--corpus-entry` and `--usbip-clock`; the
suites boot the real corpus dumps, the corpus entry itself included):

```sh
SEEK_EMU_DIR=/path/to/FW-V1/emu npm run test -- preserve
# the whole folder:
SEEK_EMU_DIR=/path/to/FW-V1/emu npx vitest run packages/core/test/preservation/
```

On hardware (Chrome/WebUSB or the node-usb backend). There is no image to pass: the run derives
everything from the camera, and the detailed plan prints after the backup step — before anything
write-shaped runs, with a second confirmation at that point on an interactive terminal (`--yes` skips both
confirmations, and is required when stdin is not a terminal):

```sh
seek-fw preserve --out ./preserve-run
```

## Stepwise runs, and resuming one

The pipeline also exists as SIX RESUMABLE STEPS — `backup → patch → commit → drain → restore → verify` —
and this is what `seek-fw preserve` drives: after every step it rewrites `preserve_run.json` (the run
state: what completed, what each step produced, the sha256 of every artifact) in the run directory. Three
properties fall out of that, and they are the reason the stepwise shape exists:

- **The restore source reaches disk before the first write.** The backup step persists the 31 windows,
  each writable bank's capture and DERIVED factory plaintext, AND the standard dump archive built offline
  from the windows (decrypted slots, reports, manifest) — the user's pre-flash dump of every region the
  stock plan can read — before anything write-shaped can possibly run.
- **The run needs nothing but the camera and its own directory.** The images always come from the camera
  itself, and the derived plaintexts are run artifacts — so `--resume <dir>` needs no file but the run
  directory. The run state is schema version 3; a run directory of an older schema is refused (its backup
  files are still a backup of that camera; start a new run).
- **A crash is a pause, not a loss.** Re-run with `--resume <dir>` and the run continues at
  `state.nextStep`; the interrupted step starts over, and a completed step is never repeated. The commit
  step is not replayable, so it reads every chosen bank back before it writes any: a bank that already
  holds the patch is not written again (when every chosen bank does, the step refuses with "Resume at the
  drain step"), and a bank that changed any other way is refused outright. `--resume <dir> --bank <choice>`
  chooses the banks again until the commit has run.

```sh
seek-fw preserve --print-state ./preserve-run    # the run's state, its next step, and
                                                 # whether the checkpoint files still match
seek-fw preserve --resume ./preserve-run         # continue from the run's next step
seek-fw preserve --resume ./preserve-run --bank all  # choose every bank, before the commit
seek-fw preserve --resume ./preserve-run --from-step restore  # start at a chosen step
```

`--from-step` refuses, with the reason, when the step it names is missing its files from the run
directory (commit without the backup files) or already completed; jumping past an incomplete commit warns
loudly and then proceeds on your explicit assertion that the camera is in the patched state — the
restore's already-original detection and the verify's 0-diff proof stay in the steps either way. A Ctrl-C
is not a failure: it stops at the next safe point, leaves the previous checkpoint standing, and exits 130
— the interrupted step is re-run on the next `--resume`.

On a core level the same steps are `createPreserveRun(opts)` — no image argument; it builds the empty,
self-sourcing shell of a run — and
`runPreserveStep(step, opener, state, loadArtifact, reporter, signal?, options?)` in
`packages/core/src/preservation/steps.ts`: core returns bytes as `Artifact[]` and never touches the
filesystem; the caller (CLI or web) persists them and rewrites the state after every step. The
plaintext-from-capture seam is `solvePlainFromCapture(family, capture)` in
`packages/core/src/preservation/solve.ts`.

Artifacts in the run directory: `preserve_run.json` (the state, rewritten after every step),
`preserve_backup_windows.bin` (the backup, assembled at its flash addresses), and for each bank the run
can write `preserve_bank_<a|b|r>_capture.bin` (its two agreeing reads), `preserve_bank_<a|b|r>_plain.bin`
(the factory plaintext the backup step derived from it) and `preserve_bank_<a|b|r>_patched.bin` (the
patched plaintext); `preserve_dump_postwrite.bin` (the part as patched), `preserve_dump_original.bin` (the
delivered image — the camera's original content), `preserve_verify_windows.bin` (the verify step's re-read
of the 31 windows), plus `manifest.json`, `README.md` and the decrypted slots under `decrypted/` (the
backup's dump archive).

## In the browser

The **Dump & decrypt 0.x/1.x 2014/2016** tab drives the same checkpoint-step API. It runs the six steps as
three, each with its own button, progress bar and log: step 02 **Read & build** (backup and patch), step
03 **Write & whole-flash read** (commit and drain) and step 04 **Restore & verify** (restore and verify).
Steps 03 and 04 ask before they write. The run there is self-sourced exactly as the CLI's is — the images
come from the camera's own banks, never from a file the person picked; step 02 shows which bank the next
start enters and why, and the "Banks to patch" list chooses the banks before step 03 — and each completed
step re-issues a downloadable run file, named start, save time and step reached
(`preserve-2026-10-04T00-14-42Z-2026-10-04T00-18-44Z-verified.zip`). The run file is the run's only memory
— the page keeps no browser storage — so a run resumes from it ("Load a run file…"), or starts at a later
step after an issue. The backup is taken before the patched firmware is ever written.

Inside the run file, the run state and a README sit at the top and every checkpoint sits in the folder of
the page step that made it: `02-read-build/` (the backup, each bank's two-read capture, the derived and
patched images, the backup decrypted), `03-patch-dump/` (the raw post-commit part and
`preserve_dump_original.bin`, the complete original image) and `04-restore-verify/` (the verify's re-read
of the 31 windows after the restore). A run file of an older schema is refused. The finished run is
checked by holding the complete image against the backup block by block.

The commit session never resets; the drain step owns the wire-89 and waits out the reboot ("the camera is
restarting…"). This camera has no USB serial number, so Chrome forgets it on every reboot: the running
step then shows a blue "Your turn" box with its own Connect device button — pick the camera again and the
step continues by itself. These hand-offs are the expected flow, so the page asks for them calmly; red is
kept for real failures. A run whose patch carries no arm-tail cursor reset (the fifth site; the 1.3.0.8
and 1.3.0.8 FF patches have none) ends Write & whole-flash read by asking you, the same way, to unplug the
camera and plug it back in: without that site the drain can leave the reader dead until it is powered off.
With it, the restore reads on the same boot and no replug is asked for. Compact Pro 1.0.3.0 needs no site for it: its own arm tail
already zeroes the whole cursor (`str r5,[r4,#12]`), so its runs read on the same boot too. A camera whose
boot-config block is erased (every 2016 Compact PRO in the record) reads its record as blank on every
boot; step 02 admits such a boot when the same boot serves the device-identity block at `0x14020000`, so
it no longer restarts the camera once per window.
