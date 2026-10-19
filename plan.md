# Plan: what is still to do

Branch `refactor/all-firmware-profiles`: all commits are local; nothing is pushed and main is never touched without the owner's explicit approval. FW-V1 `main` was pushed on the owner's word on 2026-10-19 (`a13c615c6`).
Done work is in `TESTING.md` (sections 42.x; the latest is 42.27) and `FPS_32HZ.md`; this file lists only what is open. Status marks: [ ] open, [~] running, [?] needs the owner.

## Standing rules

- Agents: Haiku 5.5, xhigh, in worktrees, no nested agents; a fresh agent for each follow-up, resume only one that stopped mid-task.
- Never run a whole `vitest` (the CLI suite includes the untracked `packages/cli/test/real-camera-probe.test.ts`, which opens the physical camera; keep it untracked and never `git add packages/cli` as a directory). FW-V1 emulator tests need `SEEK_EMU_DIR=/Users/yrambler2001/things/a.noindex/seek/FW-V1/emu`; FW-V1 Python runs with `emu/.venv/bin/python`.
- Camera: switch channel 1 = J-Link, channel 2 = camera (`node switch.js cycle <ch> 3000` in `usb-port-switch-rp2040`). The J-Link attaches only on its first connection after a channel-1 cycle. Owner decision 2026-10-19: hardware may be used without asking. Save the restore image before any write.
- Owner decisions in force:
  - no deprecated names and no backward-compatible CLI;
  - the "Make N FPS" button stays enabled and is never gated; it shows the boot-word warning text when the patch would not take effect (TESTING.md 42.27, section 6) (2026-10-19);
  - a build that is patched but not measured is offered on the page and CLI exactly like a measured one (2026-10-19);
  - the page and the CLI warn when the camera boots a bank that does not hold the patch while a patched bank will not run (2026-10-19);
  - the Preserve page keeps its zip step; `FW-V1/targets` holds every reconstructed firmware source.

## 1. Frame rate: every 8 and 9 fps build (done in 42.27; open items only)

The all-firmwares work is done: one patch rule for every patchable build, the JS checker, the boot-word warning, the emulator IP rows, and the docs. Principle and per-build table: `TESTING.md` 42.27 and `FPS_32HZ.md`. The orchestration brief (`BRIEF_FOR_CLAUDE_ORCHESTRATOR.md`) and the task text (`PROMPT_FPS_ALL_FIRMWARES.md`) are kept as history.

- [ ] Builds never run on a camera: 4.8.1.7, 4.8.1.9, 4.16.1.7 FF, 1.3.0.8 FF, the Compact PRO 1.0.3.0, 1.0.3.2, 4.9.1.15 and 4.9.2.0, and the Compact 4.8.2.1 (only the XR was measured, in 42.24). Each needs its unit on the switch.
- [ ] Hi FPS: the 4.8.1.7 and 4.8.1.9 builds refuse mode 3 (the build's mask), so their Hi FPS cannot be measured; the XR 4.8.2.1 is not run as its own emulator entry.
- [ ] Over-ceiling behaviour of the 32 Hz copy on a 32K camera. No 32K emulator scene has samples at or above 15000, and the camera's 1.3.0.8 scene had no warm pixel.
- [ ] Long streams: no 32 Hz entry has run for a long stream. The frame-sequence limit may leave 32 Hz (`docs/FPS_PATCH_LONG_STREAM.md`). The two long-run rows in `fps_patch_tests.py` were not run in 42.27.
- [ ] The 1.3.0.8 op-5 entry published 26 fps in 42.20 and 32.2 fps for the same image on the same unit in 42.27. Find out why.
- [ ] 0.10.0.0 patched Hi FPS mean 23.4 against stock 27.4 (cause not known). 0.9.1.0: the first patched run was 27.8 to 30.8 fps; four reruns gave 32.2.
- [ ] Modes 4 and 7 (accepted by 1.3.0.8 and 4.8.x): their programs were not read. The 0.x SetIPMode masks were not read.
- [ ] 0.3.0.1 mode-8 program not located. 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4 and 0.7.0.7 have their capture programs built at run time, so no patch (a patch would change builder code).
- [?] 0.7.0.8: the table has the index-2 entry, measured on the camera, but slots refuse firmware older than 0.8.0.0, so the page does not offer it. Decide whether slots should accept it (flashing it needs the J-Link today).
- [ ] Compact PRO 4.9.1.15 and 4.9.2.0: offer "Make 18 FPS". Their only gate (`gateOf` in `packages/core/src/preservation/fps-patch.ts`) is "frame rate not measured on the bench", which the owner's decision (unmeasured builds are offered) overrides. They stage under Key A like the 4.8.x Compacts. Steps: run the page's stage-two write flow for both on the emulator (as `fps-patch.stage-two.emulator.test.ts` does for 4.8.1.x: offer, save gate, write, read-back of only the planned bytes, the patched part boots); if it passes, add both ids to `FPS_STAGE_TWO_IDS`, update the verdict table `e2e/lib/slots-expectations.ts` (rows 20 and the 4.9.2.0 subject), the CLI usage build list and the bench criterion of section 5. Emulator rate already shown: Normal 8.84 to 17.68 fps (42.27).
- [ ] Compact PRO 1.0.3.0 and 1.0.3.2: offer "Make 18 FPS". Blocked on the write path: these banks are stored under the 2016 keystream, not as plain bytes, so the page has no staging check for them. Steps: build and test the 2016-keystream staging and read-back check for a patched bank (the decrypted read-back must differ from the saved dump only at the planned bytes), prove it on the emulator, then add both ids to a stage set and the verdict table. Emulator rate already shown: Normal 8.84 to 17.68 fps (42.27).
- [?] The FF entries (1.3.0.8 FF, 4.16.1.7 FF) are in the table but not offered (stage two for the encrypted FF lines, section 5). Decide whether to stage them.
- [?] Raw (IP mode 0, the app's "Raw") stays at 8 fps on every build: its program averages four captures and no patch edits it. Decide whether to patch it too (one more edit per build, same rule).
- [?] The 4.8.2.1 image: the survey and `fps_patch.py` say the Compact and the XR 4.8.2.1 are one image (f96ac57eda75). Whether the XR corpus entry holds the same bytes was not checked.
- [ ] The TypeScript checker cannot stream patched parts through `--flash` (no frames: the emulator attaches the sensor only for a corpus-entry boot). The Python IP rows are the route; the checker's README says so.

## 2. Hardware and the J-Link runner

- State (not a task): the owner's Compact PIR206 (serial 1013CE098ACA) runs slot A (`ef90c94a`, the table's 1.3.0.0 image, 32 Hz) with word 0. Slot B and recovery R hold `d91284c6` (the 1.3.0.0 32 Hz image that also carries the removed mode-6 edit); the owner wrote R themselves. R ran on 2026-10-19 while the word was 2: Normal median 32.14 to 32.19 fps. Every bank of this unit runs at 32 fps.
- [ ] Runner: `SLOT_BASES` still maps word 1 to 0x14050000 (the other chain's table), and `flash-bank` defaults to `SLOT_BASES[1]`, which is bank A. Bank B needs `BANK_ADDR=0x14060000`. Fix the default or make the address required, in both `targets/compact_8hz_1_3_0_0` and `targets/compact_8hz_1_3_0_8`.
- [ ] Serial mismatch for the same unit: the CLI's `slots list` reports `101310HSNEA2`; the checker and the Swift tool report the chip serial `1013CE098ACA`. Find which the page and the CLI should show, and fix the other.
- [ ] The 1.3.0.0 stock Normal and Hi FPS were not measured on the camera in 42.27 (the 8.0 fps quoted in 42.25 was the 16 Hz image).
- [ ] The 1.3.0.0 boot-config word is 0. A warm reset can set it to 2 again (the bootloader writes it), and the word itself is not guarded. The warning (42.27 section 6) shows when the word points at R while a patched bank A does not run.

## 3. tv-jc and the macOS app

- Done: `tv-jc` macOS changes (Pro init only on firmware 4.x; `seek stream` prints frozen pairs and changed %) are committed and pushed as `tv-jc` master `d28d2ed` on the owner's decision; `swift test` 5 passed.
- [ ] The owner's workflows in `tv-jc/.github/workflows-disabled/` stay disabled until the owner moves them back.

## 4. Repo state and hygiene

- [?] `refactor/all-firmware-profiles` (HEAD `a400390` plus this file) is local. Pushing it and merging to main needs the owner's approval (the hosted docs bundle in `docs/` is built from this branch). FW-V1 `main` is pushed (`a13c615c6`, 2026-10-19). All agent branches of 42.27 are merged into these two and their worktrees removed.
- [ ] Leftover stale text (no behaviour): the `FW-V1/emu/fps_patch_tests.py` docstring still mentions 8 or 16 Hz rows; `e2e/fps-bench.e2e.ts` line 17 cites 42.23 (the 16 Hz section) for the XR procedure; the `FPS_NO_PATCH_4821_VERSION` comment in `fps-patch.ts` states the Compact and XR 4.8.2.1 are one image, which is not checked (section 1).
- [ ] `packages/cli/test/camera.test.ts` fails on the 2016 Compact PRO refusal text (expects `0.x/1.x 2014–2017 line`; the message now says `2014–2016 build`). Not caused by the frame-rate work; update the assertion or the message.
- [ ] FW-V1 `targets/compact_8hz_1_3_0_0/jlink_dumps/` is untracked (the J-Link runner overwrites `spifi_14000000_4m_halted.bin`; the previous file is kept at `~/.claude/jobs/82174575/tmp/previous-spifi_halted.bin`).
- [?] 31 agent worktrees from earlier sessions under `.claude/worktrees` (10 locked) use 7.0 GB (measured 2026-10-19; the 42.27 worktrees are already removed). The disk ran full once during 42.27; it had 72 GB free afterwards. Owner to decide on removing them.

## 5. Older open items (carried over from 42.20 to 42.22)

- [?] Bench criterion for rows 14 (4.16.1.7 FF) and 20 (Compact PRO 4.9.1.15): the page and the verdict table agree on both refusals, the bench expects a write, so the matrix reports 26 of 28. Make the bench read the table, or accept the two as the expected result.
- [ ] The Electron windows retain about 200 MB per subject (22 to 30 MB per window; not located); the full matrix needs `NODE_OPTIONS=--max-old-space-size=16384`.
- [ ] The 0.x/1.x backup on the bench unit is erased where the bootloader's first 11 KiB are (11,268 bytes; the test pins the gap).
- [ ] The slots page clears its bank table after a write until "Read slots".
- [ ] 1.3.0.8 FF: stage two for the encrypted lines, a faithful emulator platform, FW-V1 branch `ff-dump-keyed-bootloader` (unmerged); its boot is observed, not proven; Preserve "Read & build" on the emulated 1.3.0.8 FF refuses at the derivation gate and needs a full-flash FF dump in the corpus.
- [ ] CLI `info` sends SetFirmwareInfoFeatures (0x55) and SetRAMDataFeatures (0x5a) on its read path and reads the slots; the web Info sends neither (recorded, not changed).
- [ ] An offline dump of a v4 camera is not covered by `e2e:offline`.
- [ ] After the next full bench run: re-run the 28-subject Electron matrix on the final HEAD (the page offers and the verdict table changed after the last one, 42.21).
- [ ] The shutter question of 42.15 (a per-frame shutter in mode 6) is moot now the mode-6 patch is gone; the Normal-mode patches left the shutter cycle unchanged in the measurements. Owner to confirm it can be closed.
- [?] The 4.8.1.7 and 4.8.1.9 Key A path is proven on the emulator only (the stock and patched rate, the saved dumps, the Electron button and the restore were never run on a camera).
