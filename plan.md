# Plan: what is still to do

Branch `refactor/all-firmware-profiles`: all commits are local; nothing is pushed and main is never touched without the owner's explicit approval (owner, 2026-10-19: keep it local until the owner says). FW-V1 `main` was pushed on the owner's word on 2026-10-19 (`a13c615c6`).
Done work is in `TESTING.md` (sections 42.x; the latest is 42.31) and `FPS_32HZ.md`; this file lists only what is open. Status marks: [ ] open, [~] running, [?] needs the owner.

## Standing rules

- Agents: Haiku 5.5, xhigh, in worktrees, no nested agents; a fresh agent for each follow-up, resume only one that stopped mid-task.
- Never run a whole `vitest` (the CLI suite includes the untracked `packages/cli/test/real-camera-probe.test.ts`, which opens the physical camera; keep it untracked and never `git add packages/cli` as a directory). FW-V1 emulator tests need `SEEK_EMU_DIR=/Users/yrambler2001/things/a.noindex/seek/FW-V1/emu`; FW-V1 Python runs with `emu/.venv/bin/python`.
- Camera: switch channel 1 = J-Link, channel 2 = camera (`node switch.js cycle <ch> 3000` in `usb-port-switch-rp2040`). The J-Link attaches only on its first connection after a channel-1 cycle. Owner decision 2026-10-19: hardware may be used without asking. Save the restore image before any write.
- Owner decisions in force:
  - no deprecated names and no backward-compatible CLI;
  - the "Make N FPS" button stays enabled and is never gated; it shows the boot-word warning text when the patch would not take effect (TESTING.md 42.27, section 6) (2026-10-19);
  - a build that is patched but not measured is offered on the page and CLI exactly like a measured one, with no "not measured" note (2026-10-19);
  - the page and the CLI warn when the camera boots a bank that does not hold the patch while a patched bank will not run (2026-10-19);
  - the slots bench judges each subject by the shared verdict table: a refusal the table records is a pass (2026-10-19, TESTING.md 42.29);
  - the Preserve page keeps its zip step; `FW-V1/targets` holds every reconstructed firmware source.

## 1. Frame rate (open items only)

Every 8 and 9 fps build with a table entry is offered except the FF entries and 0.7.0.8: stage one (2014 plain chain), stage two (Key A: the Compact 4.8.x and the Compact PRO 4.9.1.15, 4.9.2.0, 42.28) and stage three (the Compact PRO 2016 keystream line 1.0.3.0, 1.0.3.2, 42.29). Principle and per-build table: `TESTING.md` 42.27 to 42.29 and `FPS_32HZ.md`. The orchestration brief (`BRIEF_FOR_CLAUDE_ORCHESTRATOR.md`) and the task text (`PROMPT_FPS_ALL_FIRMWARES.md`) are kept as history.

- [ ] Correct the docs on the Compact PRO 4.9.1.15 rate. TESTING.md 42.28, 42.29 and `FPS_32HZ.md` say no Compact PRO rate was measured on hardware. But FW-V1 `docs/FRAME_RATE.md` §6.3 experiment A measured the same three bytes (0x19B0 `02`→`01`, 0x19B6 `00 20`→`10 23`, image 54,840 bytes) on a Compact PRO camera at 8.85 → 17.70 fps (slot B; slot A held stock 4.18.2.0), and `fps-patch-table.ts` says so. Correct the three docs (4.9.1.15 measured on hardware, 4.9.2.0 and 1.0.3.x not); decide whether `FPS_MEASURED_HZ` should carry 17.70.
- [ ] Builds whose table patch never ran on a camera: 4.8.1.7, 4.8.1.9, 4.16.1.7 FF, 1.3.0.8 FF, the Compact PRO 1.0.3.0, 1.0.3.2 and 4.9.2.0, and the Compact 4.8.2.1 (only the XR was measured, in 42.24). Each needs its unit on the switch.
- [ ] Stage two and three on the emulator write bank A only: the B and R writes the page offers (4.8.x, Compact PRO 4.9.x and 1.0.3.x) are not exercised.
- [ ] Hi FPS: the 4.8.1.7 and 4.8.1.9 builds refuse mode 3 (the build's mask), so their Hi FPS cannot be measured; the XR 4.8.2.1 is not run as its own emulator entry.
- [ ] Over-ceiling behaviour of the 32 Hz copy on a 32K camera. No 32K emulator scene has samples at or above 15000, and the camera's 1.3.0.8 scene had no warm pixel.
- [ ] Long streams: no 32 Hz entry has run for a long stream. The frame-sequence limit may leave 32 Hz (`docs/FPS_PATCH_LONG_STREAM.md`). The two long-run rows in `fps_patch_tests.py` were not run in 42.27.
- [ ] The 1.3.0.8 op-5 entry published 26 fps in 42.20 and 32.2 fps for the same image on the same unit in 42.27. Find out why.
- [ ] 0.10.0.0 patched Hi FPS mean 23.4 against stock 27.4 (cause not known). 0.9.1.0: the first patched run was 27.8 to 30.8 fps; four reruns gave 32.2.
- [ ] Modes 4 and 7 (accepted by 1.3.0.8 and 4.8.x): their programs were not read. The 0.x SetIPMode masks were not read.
- [ ] 0.3.0.1 mode-8 program not located. 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4 and 0.7.0.7 have their capture programs built at run time, so no patch (a patch would change builder code).
- [?] 0.7.0.8: the table has the index-2 entry, measured on the camera, but slots refuse firmware older than 0.8.0.0, so the page does not offer it. Decide whether slots should accept it (flashing it needs the J-Link today). Owner, 2026-10-19: not now.
- [?] The FF entries (1.3.0.8 FF, 4.16.1.7 FF) are in the table but not offered (stage two for the encrypted FF lines, section 5). Decide whether to stage them. Owner, 2026-10-19: not now.
- [?] Raw (IP mode 0, the app's "Raw") stays at 8 fps on every build: its program averages four captures and no patch edits it. Decide whether to patch it too (one more edit per build, same rule). Owner, 2026-10-19: not now.
- [?] The 4.8.2.1 image: the survey and `fps_patch.py` say the Compact and the XR 4.8.2.1 are one image (f96ac57eda75). Whether the XR corpus entry holds the same bytes was not checked.
- [ ] The TypeScript checker cannot stream patched parts through `--flash` (no frames: the emulator attaches the sensor only for a corpus-entry boot). The Python IP rows are the route; the checker's README says so.

## 2. Hardware and the J-Link runner

- State (not a task): the owner's Compact PIR206 (chip serial 1013CE098ACA) runs slot A (`ef90c94a`, the table's 1.3.0.0 image, 32 Hz) with word 0. Slot B and recovery R hold `d91284c6` (the 1.3.0.0 32 Hz image that also carries the removed mode-6 edit). Every bank runs at 32 fps. The whole flash is `50e900c2…` (halted read); the 42.29 bench rows, the 42.30 matrix and the 42.31 reset runs left it byte-identical. Normal fps reads right after a whole-flash dump or restore take several reads to settle (42.31: medians 16 to 27 fps on the first reads, then 32.2), so repeat the read before judging it.
- [ ] Runner: `SLOT_BASES` still maps word 1 to 0x14050000 (the other chain's table), and `flash-bank` defaults to `SLOT_BASES[1]`, which is bank A. Bank B needs `BANK_ADDR=0x14060000`. Fix the default or make the address required, in both `targets/compact_8hz_1_3_0_0` and `targets/compact_8hz_1_3_0_8`.
- [ ] Serial mismatch for the same unit: the CLI's `slots list` (and TESTING.md 42.21) report `101310HSNEA2`; the checker and the Swift tool report the chip serial `1013CE098ACA`. Find which the page and the CLI should show, and fix the other.
- [ ] The 1.3.0.0 stock Normal and Hi FPS were not measured on the camera in 42.27 (the 8.0 fps quoted in 42.25 was the 16 Hz image).
- [ ] The 1.3.0.0 boot-config word is 0. A warm reset can set it to 2 again (the bootloader writes it), and the word itself is not guarded. The warning (42.27 section 6) shows when the word points at R while a patched bank A does not run.

## 3. tv-jc and the macOS app

- Done: `tv-jc` macOS changes (Pro init only on firmware 4.x; `seek stream` prints frozen pairs and changed %) are committed and pushed as `tv-jc` master `d28d2ed` on the owner's decision; `swift test` 5 passed.
- [ ] The owner's workflows in `tv-jc/.github/workflows-disabled/` stay disabled until the owner moves them back.

## 4. Repo state and hygiene

- [?] `refactor/all-firmware-profiles` (HEAD `d62da13` plus this file) is local. The owner keeps it local until they say otherwise (2026-10-19); pushing it and merging to main need the owner's word (the hosted docs bundle in `docs/` is built from this branch). FW-V1 `main` is pushed (`a13c615c6`). All agent branches of 42.27 to 42.31 are merged and their worktrees removed.
- [?] Two unmerged branches from earlier sessions are kept (their worktrees were removed on 2026-10-19, 42.29 section 6): `worktree-agent-a9c8b175a0187b7be` (`f9a34ce`, TESTING 42.13 notes: the balance-word FF run withdrawn before any write) and `worktree-agent-ae27186421cb01b3e` (`f8f2f55`, the FF image's banks follow the camera's bootloader; the bench FF platform path). Owner to decide: merge or delete.
- [ ] Stale text (no behaviour):
  - the `FW-V1/emu/fps_patch_tests.py` docstring still mentions 8 or 16 Hz rows;
  - the `FPS_NO_PATCH_4821_VERSION` comment in `fps-patch.ts` states the Compact and XR 4.8.2.1 are one image, which is not checked (section 1);
  - `packages/core/src/profiles/compact-2016.ts` `FLASH_REFUSAL` (:102-108) and its summary (:288-290) say the write path has nothing for 2016 banks, while the slots writer stages them (`capability-family.ts:214-215`, `write.ts:561-575`); check whether the text is about the profile's own flash path, and fix it if not;
  - the CLI usage line "Banks: A (0x14050000) and B (0x14060000)" (`packages/cli/src/usage.ts` ~229) is the 2014 chain's map; the modern-4x map (the 4.x Compact and the Compact PRO 4.9.x) is A 0x14030000, B 0x14050000, R 0x14070000 (`modern-4x.ts:84-86`).
- [ ] `packages/cli/test/camera.test.ts` fails on the 2016 Compact PRO refusal text (expects `0.x/1.x 2014–2017 line`; the message now says `2014–2016 build`). Not caused by the frame-rate work; update the assertion or the message.
- [ ] FW-V1 `targets/compact_8hz_1_3_0_0/jlink_dumps/` is untracked (the J-Link runner overwrites `spifi_14000000_4m_halted.bin`; the previous file is kept at `~/.claude/jobs/82174575/tmp/previous-spifi_halted.bin`).

## 5. Older open items (carried over from 42.20 to 42.22)

- [ ] The bench's reset check after the 42.31 fix (`waitForReboot` polls every 100 ms while it waits for the camera to leave the bus): only rows 10, 15 and 21 were re-run. Row 27's first-attempt failure in 42.30 is put down to the same missed sample without a trace; the next full matrix run confirms it. The failure text still names two causes (not rebooted, or not back within 40 s); splitting it is optional.
- [ ] The bench's row-9 (1.3.0.8 FF) run needs `SEEK_BENCH_FF_RESTORE`, `SEEK_BENCH_FF_PLATFORM` and `SEEK_BENCH_FF_PLAIN`. Without them its page steps do not run and the row fails (42.30 first attempt). Record them in the bench header or README, or make the bench refuse to start without them.
- [ ] The verdict table has no per-bank version field; the bench treats the `ownImage` bank's version (row 20's bank B, 1.0.3.2) as a note, not a checked value (42.29).
- [ ] The Electron windows retain about 200 MB per subject (22 to 30 MB per window; not located); the full matrix needs `NODE_OPTIONS=--max-old-space-size=16384`.
- [ ] The 0.x/1.x backup on the bench unit is erased where the bootloader's first 11 KiB are (11,268 bytes; the test pins the gap).
- [ ] The slots page clears its bank table after a write until "Read slots".
- [ ] 1.3.0.8 FF: stage two for the encrypted lines, a faithful emulator platform, FW-V1 branch `ff-dump-keyed-bootloader` (unmerged); its boot is observed, not proven; Preserve "Read & build" on the emulated 1.3.0.8 FF refuses at the derivation gate and needs a full-flash FF dump in the corpus.
- [ ] CLI `info` sends SetFirmwareInfoFeatures (0x55) and SetRAMDataFeatures (0x5a) on its read path and reads the slots; the web Info sends neither (recorded, not changed).
- [ ] An offline dump of a v4 camera is not covered by `e2e:offline`.
- [ ] The shutter question of 42.15 (a per-frame shutter in mode 6) is moot now the mode-6 patch is gone; the Normal-mode patches left the shutter cycle unchanged in the measurements. Owner to confirm it can be closed.
- [?] The 4.8.1.7 and 4.8.1.9 Key A path is proven on the emulator only (the stock and patched rate, the saved dumps, the Electron button and the restore were never run on a camera).
