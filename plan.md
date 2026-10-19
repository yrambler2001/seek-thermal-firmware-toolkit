# Plan: what is still to do

Branch `refactor/all-firmware-profiles`. All commits are local unless a line says otherwise; nothing is pushed and main is never touched without the owner's explicit approval.
Done work is in `TESTING.md` (sections 42.x; the latest is 42.27) and `FPS_32HZ.md`; this file lists only what is open. Status marks: [ ] open, [~] running, [?] needs the owner.

## Standing rules

- Agents: Haiku 5.5, xhigh, in worktrees, no nested agents; a fresh agent for each follow-up, resume only one that stopped mid-task.
- Never run a whole `vitest` (the CLI suite includes the untracked `packages/cli/test/real-camera-probe.test.ts`, which opens the physical camera; keep it untracked and never `git add packages/cli` as a directory). FW-V1 emulator tests need `SEEK_EMU_DIR=/Users/yrambler2001/things/a.noindex/seek/FW-V1/emu`; FW-V1 Python runs with `emu/.venv/bin/python`.
- Camera: switch channel 1 = J-Link, channel 2 = camera (`node switch.js cycle <ch> 3000` in `usb-port-switch-rp2040`). The J-Link attaches only on its first connection after a channel-1 cycle. Owner decision 2026-10-19: hardware may be used without asking. Save the restore image before any write.
- Owner decisions in force:
  - no deprecated names and no backward-compatible CLI;
  - the "Make N FPS" button stays enabled; the boot-word warning (TESTING.md 42.27, section 6) is text on the page and in the CLI and does not gate the button;
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
- [?] The Compact PRO entries and the FF entries are in the table but not offered (their staging is not done: the 1.0.3.x banks are under the 2016 keystream, and the 4.9.x line has no bench measurement). Decide whether to stage them.
- [?] The 4.8.2.1 image: the survey and `fps_patch.py` say the Compact and the XR 4.8.2.1 are one image (f96ac57eda75). Whether the XR corpus entry holds the same bytes was not checked.
- [ ] The TypeScript checker cannot stream patched parts through `--flash` (no frames: the emulator attaches the sensor only for a corpus-entry boot). The Python IP rows are the route; the checker's README says so.

## 2. Hardware and the J-Link runner

- [?] The owner's Compact PIR206 (serial 1013CE098ACA) now runs slot A (`ef90c94a`, 1.3.0.0 mode-8-only, 32 Hz) with word 0. Slot B and recovery R both hold `d91284c6` (the 1.3.0.0 32 Hz image that also carries the removed mode-6 edit). Decide whether R goes back to stock or stays patched. R holds the same image as B, which measured 32.2 fps (42.25); R itself was not run.
- [ ] Runner: `SLOT_BASES` still maps word 1 to 0x14050000 (the other chain's table), and `flash-bank` defaults to `SLOT_BASES[1]`, which is bank A. Bank B needs `BANK_ADDR=0x14060000`. Fix the default or make the address required, in both `targets/compact_8hz_1_3_0_0` and `targets/compact_8hz_1_3_0_8`.
- [ ] Serial mismatch for the same unit: the CLI's `slots list` reports `101310HSNEA2`; the checker and the Swift tool report the chip serial `1013CE098ACA`. Find which the page and the CLI should show, and fix the other.
- [ ] The 1.3.0.0 stock Normal and Hi FPS were not measured on the camera in 42.27 (the 8.0 fps quoted in 42.25 was the 16 Hz image).
- [ ] The 1.3.0.0 boot-config word is 0. A warm reset can set it to 2 again (the bootloader writes it), and the word itself is not guarded. The warning (42.27 section 6) shows when the word points at R while a patched bank A does not run.

## 3. tv-jc and the macOS app

- Done: `tv-jc` macOS changes (Pro init only on firmware 4.x; `seek stream` prints frozen pairs and changed %) are committed and pushed as `tv-jc` master `d28d2ed` on the owner's decision; `swift test` 5 passed.
- [ ] The owner's workflows in `tv-jc/.github/workflows-disabled/` stay disabled until the owner moves them back.

## 4. Repo state and hygiene

- [?] Everything on `refactor/all-firmware-profiles`, FW-V1 `main` and the docs branches is local. Merging to main and pushing needs the owner's approval (the hosted docs bundle in `docs/` is built from this branch).
- [?] Docs branches to review and merge with the owner's word: FW-V1 `fps-docs` (worktree `FW-V1/.claude/worktrees/fps-docs`, the survey outcome, `FRAME_RATE.md` pointer, `emu/README.md` patcher section, the J-Link runner README) and the firmware worktree branch `worktree-agent-af77b9063a00c9039` (TESTING 42.27, FPS_32HZ.md, this file, the seek-fps README, the status lines, the rebuilt bundle).
- [ ] `packages/cli/test/camera.test.ts` fails on the 2016 Compact PRO refusal text (expects `0.x/1.x 2014–2017 line`; the message now says `2014–2016 build`). Not caused by the frame-rate work; update the assertion or the message.
- [ ] FW-V1 `targets/compact_8hz_1_3_0_0/jlink_dumps/` is untracked (the J-Link runner overwrites `spifi_14000000_4m_halted.bin`; the previous file is kept at `~/.claude/jobs/82174575/tmp/previous-spifi_halted.bin`).
- [?] 32 agent worktrees under `.claude/worktrees` (11 locked) use about 6 GB (the orchestrator's estimate, not re-measured here). The disk ran full once; it had 69 GiB free when this was written. Owner to decide on removing them.

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
