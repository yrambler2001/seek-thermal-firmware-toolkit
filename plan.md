# Plan: what is still to do

Branch `refactor/all-firmware-profiles`. All commits are local; nothing is pushed and main is never touched without the owner's explicit approval.
Done work is in `TESTING.md` (sections 42.x; the latest is 42.26) and `FPS_32HZ.md`; this file lists only what is open. Status marks: [ ] open, [~] running, [?] needs the owner.

## Standing rules

- Agents: Haiku 5.5, xhigh, in worktrees, no nested agents; a fresh agent for each follow-up, resume only one that stopped mid-task.
- Never run a whole `vitest` (the CLI suite includes the untracked `packages/cli/test/real-camera-probe.test.ts`, which opens the physical camera; keep it untracked and never `git add packages/cli` as a directory). FW-V1 emulator tests need `SEEK_EMU_DIR=/Users/yrambler2001/things/a.noindex/seek/FW-V1/emu`; FW-V1 Python runs with `emu/.venv/bin/python`.
- Camera: switch channel 1 = J-Link, channel 2 = camera (`node switch.js cycle <ch> 3000` in `usb-port-switch-rp2040`). The J-Link attaches only on its first connection after a channel-1 cycle. Reading and measuring over USB is fine; writing a bank or the boot-config word needs the owner's go-ahead in that run.
- Owner decisions in force: no deprecated names and no backward-compatible CLI; the "Make N FPS" button stays enabled with no warning; the Preserve page keeps its zip step; `FW-V1/targets` holds every reconstructed firmware source.

## 1. Frame rate: consistent patches for every 8 Hz / 9 Hz firmware (next, for a Haiku agent)

Full brief: `PROMPT_FPS_ALL_FIRMWARES.md` (repo root). Principle: similar firmwares get a similar patch, modelled on 1.3.0.0 (mode-8 steady block, `+0xB898`) and 4.8.2.1 (command page 13, `+0x90F2`): the steady block of the stream the vendor app uses becomes one copy step with the publish bit; the Compact PRO builds go to 18 fps.

- [ ] Survey every reconstructed 8 Hz and 9 Hz target in `FW-V1/targets` (the 0.x builds, 1.0.0.0, 1.2.0.0, 1.3.0.8, 4.8.1.7, 4.8.1.9, the XR 4.8.2.1, the four Compact PRO 9 Hz builds): layout, mode table, the steady block of each stream mode; write `FW-V1/docs/FPS_PATCH_ALL_FIRMWARES.md`.
- [ ] Establish which mode the existing 1.3.0.8, 4.8.1.7, 4.8.1.9 and Compact PRO patches edit. If it is not the Normal (mode 8) steady block, add the mode-8 edit: a patch that edits a mode nobody measures gives no gain in the app (as the removed mode-6 patch did).
- [ ] One patch entry per patchable build (`<family>-<version>-to32`, Pro `-to18`), no 16 Hz, no mixed edits; 1.2.0.0 and the 0.x builds get one if their layout allows. Every byte edit carries an explanation in `fps_patch.py` (the `#` lines above its `Edit(`).
- [ ] A Node/TypeScript frame-rate checker ported from `tv-jc/macos` (SeekKit: init sequences, the Pro init only on 4.x, the firmware-info retry, frame decode, `--fps` median and mean per second, frozen pairs, changed pixels), runnable over the camera and over the emulator, with its unit tests; plus a read-only camera spec. Find out which modes the emulator can run (it streams mode 6 only today).
- [ ] Tests: FW-V1 unit and emulator rows, core table/differential/page tests, the verdict table `e2e/lib/slots-expectations.ts`, web and CLI tests. Extend `scripts/gen-fps-table.py` to regenerate the differential fixture too (it already regenerates `fps-patch-table.ts` with plain-text comments and an explanation above every edit).
- [ ] Docs: `TESTING.md` 42.27, `FPS_32HZ.md`, `FW-V1/docs/FRAME_RATE.md`, `FW-V1/emu/README.md` (patcher section), CLI usage text, then `npm run build:docs` in its own commit.
- [?] Which unmeasured builds the page may offer: today only builds that are in a stage set (plain 2014 chain, or Key A on the 4.x line) are offered; the rest are in the table with a recorded reason. Decide whether to offer unmeasured ones.

## 2. Frame rate: hardware that is still unproven

- [?] The 1.3.0.0 mode-8-only image `ef90c94a…` has never run on a camera (the measured image, `d91284c6…`, also had the removed mode-6 edit). Needs the boot-config word back at 0 on the owner's unit (`jlink-runner.js set-boot-slot-a`), then write bank A, power-cycle, measure Normal and Hi FPS.
- [?] The owner's 1.3.0.0 unit (serial 1013CE098ACA) boots recovery R (boot-config word `2`, stock image), so it reads 8 fps although A and B hold the 32 Hz patch. Fix by setting the word to 0; a later warm reset can set it to 2 again (bootloader `boot_select_image`). Decide whether to also write the patch to R, and whether the page and CLI should warn when the word points at R while a patched bank A exists.
- [ ] 4.8.1.7 and 4.8.1.9 (Key A, stage two): proven on the emulator only; the stock and patched rate, the saved dumps, the Electron button and the restore were never run (no camera for them).
- [ ] Compact PRO 4.9.x: gated, rate never measured (the bench camera is a Compact board).
- [ ] The shutter question of 42.15 (a per-frame shutter in mode 6) is moot now the mode-6 patch is gone; the Normal-mode patches left the shutter cycle unchanged in the measurements. Owner to confirm it can be closed.

## 3. tv-jc and the macOS app

- [?] `tv-jc` (`/Users/yrambler2001/things/a.noindex/seek/tv-jc`, master) has uncommitted changes in `macos/` (Pro init only on firmware 4.x, frozen-pair and changed-pixel stats in `seek stream`). Commit; push only on the owner's word (the first commit `277d9dc` was pushed on request).
- [ ] The owner's workflows in `tv-jc/.github/workflows-disabled/` stay disabled until the owner moves them back.

## 4. Repo state and hygiene

- [?] Everything on `refactor/all-firmware-profiles` and FW-V1 `main` is local. Merging to main and pushing needs the owner's approval (the hosted docs bundle in `docs/` is built from this branch).
- [ ] `packages/cli/test/camera.test.ts` fails on the 2016 Compact PRO refusal text (expects `0.x/1.x 2014–2017 line`; the message now says `2014–2016 build`). Not caused by the frame-rate work; update the assertion or the message.
- [ ] FW-V1 `targets/compact_8hz_1_3_0_0/jlink_dumps/` is untracked (the J-Link runner overwrites `spifi_14000000_4m_halted.bin`; the previous file is kept at `~/.claude/jobs/82174575/tmp/previous-spifi_halted.bin`).

## 5. Older open items (carried over from 42.20 to 42.22)

- [?] Bench criterion for rows 14 (4.16.1.7 FF) and 20 (Compact PRO 4.9.1.15): the page and the verdict table agree on both refusals, the bench expects a write, so the matrix reports 26 of 28. Make the bench read the table, or accept the two as the expected result.
- [ ] The Electron windows retain about 200 MB per subject (22 to 30 MB per window; not located); the full matrix needs `NODE_OPTIONS=--max-old-space-size=16384`.
- [ ] The 0.x/1.x backup on the bench unit is erased where the bootloader's first 11 KiB are (11,268 bytes; the test pins the gap).
- [ ] The slots page clears its bank table after a write until "Read slots".
- [ ] 1.3.0.8 FF: stage two for the encrypted lines, a faithful emulator platform, FW-V1 branch `ff-dump-keyed-bootloader` (unmerged); its boot is observed, not proven; Preserve "Read & build" on the emulated 1.3.0.8 FF refuses at the derivation gate and needs a full-flash FF dump in the corpus.
- [ ] CLI `info` sends SetFirmwareInfoFeatures (0x55) and SetRAMDataFeatures (0x5a) on its read path and reads the slots; the web Info sends neither (recorded, not changed).
- [ ] An offline dump of a v4 camera is not covered by `e2e:offline`.
- [ ] After the next full bench run: re-run the 28-subject Electron matrix on the final HEAD (the page offers and the verdict table changed after the last one, 42.21).
