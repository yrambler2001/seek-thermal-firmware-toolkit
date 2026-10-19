# Plan: what is still to do

Branch `refactor/all-firmware-profiles`: all commits are local; nothing is pushed and main is never touched without the owner's explicit approval (owner, 2026-10-19: keep it local until the owner says). FW-V1 `main` was pushed on the owner's word on 2026-10-19 (`a13c615c6`).
Done work is in `TESTING.md` (sections 42.x; the latest is 42.37; 42.38, 42.40 and 42.44 merged; 42.39, 42.41 to 42.43, 42.45 to 42.47 are running) and `FPS_32HZ.md`; this file lists only what is open. Status marks: [ ] open, [~] running, [?] needs the owner.

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

- [ ] Builds whose table patch never ran on a camera: 4.8.1.7, 4.8.1.9, 4.16.1.7 FF, 1.3.0.8 FF, the Compact PRO 1.0.3.0, 1.0.3.2 and 4.9.2.0, and the Compact 4.8.2.1 (the XR was measured in 42.24; 42.34 showed the Compact and XR 4.8.2.1 run the same image, f96ac57eda75, on different hardware). Each needs its unit on the switch.
- [~] On the emulator the 4.8.x line's active-slot word reads 0 under boot words 1 and 2 (unpatched control too), so 42.36 proved which bank ran by marking bank A's build string; the cause is in the FW-V1 Python machine and not known. On the 2016 line the analysis reports `footerOk` false and bootability unknown on every boot while the bootloader runs the requested bank (42.36). (running: TESTING.md 42.43)
- [~] The verdict table's `Compact 4.8.1.7 (std)` row has `emulator: null`; 42.36 maps it by row name. Give it its emulator subject. (running: TESTING.md 42.39)
- [ ] Hi FPS: the 4.8.1.7 and 4.8.1.9 builds refuse mode 3 (the build's mask), so their Hi FPS cannot be measured (the XR 4.8.2.1 needs no entry of its own: same image as the Compact, 42.34).
- [~] Over-ceiling behaviour of the 32 Hz copy on a 32K camera. No 32K emulator scene has samples at or above 15000, and the camera's 1.3.0.8 scene had no warm pixel. (running: TESTING.md 42.42)
- [?] Long streams (42.37): a 30-minute Normal stream on the 1.3.0.0 32 Hz bank kept per-second medians near 32, but its whole-run rate was 27.0 fps at 1 min and 29.1 at 20 and 30 min (minute rates 25.0 to 30.4; no frozen pairs; one dip at 660 to 720 s, cause unknown). Stock Hi FPS on 0.10.0.0 shows the same gap (medians 31 to 32, means 27.8 to 28.4). The gap is captures that are never published. Decide what the page's "Make 32 FPS" should name, and whether to chase the excursions (`docs/FPS_PATCH_LONG_STREAM.md`); a stock Hi FPS long stream is the comparison not yet run.
- [~] The offered 1.3.0.8 copy form (5313f107) has no whole-run (20 s `compact-fps`) measurement; 42.37 expects the same excursions as the op-5 form. Run it. (running: TESTING.md 42.41)
- [~] 0.9.1.0's first patched run (27.8 to 30.8 fps) was not re-measured. 0.10.0.0's 23.4 against 27.4 did not reproduce in 42.37 (stock medians 31.0 to 32.3, patched 32.1 to 32.2); the cause of the old figure is not known. (running: TESTING.md 42.41)
- [~] Modes 4 and 7 (accepted by 1.3.0.8 and 4.8.x): their programs were not read. The 0.x SetIPMode masks were not read. (running: TESTING.md 42.43)
- [ ] 0.3.0.1 mode-8 program not located. 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4 and 0.7.0.7 have their capture programs built at run time, so no patch (a patch would change builder code).
- [?] 0.7.0.8: the table has the index-2 entry, measured on the camera, but slots refuse firmware older than 0.8.0.0, so the page does not offer it. Decide whether slots should accept it (flashing it needs the J-Link today). Owner, 2026-10-19: not now.
- [?] The FF entries (1.3.0.8 FF, 4.16.1.7 FF) are in the table but not offered (stage two for the encrypted FF lines, section 5). Decide whether to stage them. Owner, 2026-10-19: not now.
- [?] Raw (IP mode 0, the app's "Raw") stays at 8 fps on every build: its program averages four captures and no patch edits it. Decide whether to patch it too (one more edit per build, same rule). Owner, 2026-10-19: not now.
- [~] The TypeScript checker cannot stream patched parts through `--flash` (no frames: the emulator attaches the sensor only for a corpus-entry boot). The Python IP rows are the route; the checker's README says so. (running: TESTING.md 42.42)

## 2. Hardware and the J-Link runner

- State (not a task): the owner's Compact PIR206 (chip serial 1013CE098ACA) runs slot A (`ef90c94a`, the table's 1.3.0.0 image, 32 Hz) with word 0. Slot B and recovery R hold `d91284c6` (the 1.3.0.0 32 Hz image that also carries the removed mode-6 edit). Every bank runs at 32 fps. The whole flash is `50e900c2…` (halted read); the 42.29 bench rows, the 42.30 matrix and the 42.31 reset runs left it byte-identical. Normal fps reads right after a whole-flash dump or restore take several reads to settle (42.31: medians 16 to 27 fps on the first reads, then 32.2), so repeat the read before judging it.
- [?] FW-V1 branch `plan-hygiene` (worktree `/private/tmp/claude-501/fwv1-hygiene`, 42.35 and 42.40): every runner's flash-bank needs an explicit `BANK_ADDR`, the 2014-chain runners carry the 2014 bank table, five `build_flash.mjs` targets write and boot the same bank, the `fps_patch_tests.py` docstring matches the table, `jlink_dumps/` is ignored, and the 4.9.1.15 byte count is right. Not merged into FW-V1 `main` (the bench uses that checkout's runner); merging and pushing need the owner's word.
- [~] 19 more 2014-chain FW-V1 `build_flash.mjs` files still carry the 4.x slot table: their default `--flash` writes bank A and sets boot word 1 (bank B). 42.40 fixed the five named targets and lists the 19. (running: TESTING.md 42.46)
- [ ] Bank maps not verified in FW-V1: 42.40 gave the Compact PRO FF 1.0.3.x runners the 2014-chain table and kept the 4.x table for `compact_ff_16hz_1_3_0_8` (the FF platform, 42.11b); no file states either platform's map. The 4.9.1.15 dump's bank B (0x14050000, 4.x map) holds a 1.0.3.2-FF image.
- [?] Serial labels (42.37): `101310HSNEA2` is the ASCII device serial (+16 of the device-identity block at 0x14020000), which the CLI and the page show; `1013CE098ACA` is GetChipID, which the JS checker and the Swift `seek` tool print as "serial" when the USB string is absent (it is on 1.3.0.0). Owner to pick: (A) the checker and Swift show the ASCII serial and print the chip ID as its own field, or (B) they keep it and rename the field "chip id". The checker and Swift change together.
- [~] The first checker connect after a CLI slot write stalled at op 0x56 (0x37 on the op-5 image) until a power cycle (42.37); cause not established. (running: TESTING.md 42.41)
- [ ] The 1.3.0.0 boot-config word is 0. A warm reset can set it to 2 again (the bootloader writes it), and the word itself is not guarded. The warning (42.27 section 6) shows when the word points at R while a patched bank A does not run.

## 3. tv-jc and the macOS app

- Done: `tv-jc` macOS changes (Pro init only on firmware 4.x; `seek stream` prints frozen pairs and changed %) are committed and pushed as `tv-jc` master `d28d2ed` on the owner's decision; `swift test` 5 passed.
- [ ] The owner's workflows in `tv-jc/.github/workflows-disabled/` stay disabled until the owner moves them back.

## 4. Repo state and hygiene

- [?] `refactor/all-firmware-profiles` (all of 42.27 to 42.37 merged on it) is local. The owner keeps it local until they say otherwise (2026-10-19); pushing it and merging to main need the owner's word (the hosted docs bundle in `docs/` is built from this branch). FW-V1 `main` is pushed (`a13c615c6`). All agent branches of 42.27 to 42.37 are merged and their worktrees removed.
- [?] The FF vendor-form write on the FF platform's bootloader (2.0.2.3): the merged branch f8f2f55 refused every bank there; 42.33 dropped that refusal with the rest of the superseded code, so the page allows the vendor-form write on every bootloader, and that write is not measured on 2.0.2.3. Owner to decide: refuse it on 2.0.2.3, or keep it open and run bench row 9 on a 2.0.2.3 camera first.
- [?] The 0.x/1.x profile-level dump refusal (`packages/cli/src/commands/dump.ts:61`) looks unreachable on a real camera: the version refusal at `:47` catches every 0.x/1.x build first, and a camera whose version read never answers is refused earlier by the identity gate (42.38; its test uses a synthetic 2.0.0.0). Owner: keep the guard or remove it.
- [ ] Two stale texts left by 42.38: `packages/core/test/preservation/fps-patch.test.ts:194` says the 1.3.0.8 copy form "has no camera measurement" (42.27 measured it), and TESTING.md 42.27 section 11 says "No cause was found", which 42.37 section 3a answers.

## 5. The slots bench and older open items (42.20 to 42.31)

- [?] The bench's reset check after the 42.31 fix (`waitForReboot` polls every 100 ms while it waits for the camera to leave the bus): only rows 10, 15 and 21 were re-run. Row 27's first-attempt failure in 42.30 is put down to the same missed sample without a trace; the next full matrix run confirms it (about 2 hours on the camera; asked the owner, 2026-10-19). The failure text still names two causes (not rebooted, or not back within 40 s); splitting it is optional. Owner, 2026-10-19: not yet.
- [ ] The bench's row-9 (1.3.0.8 FF) run needs `SEEK_BENCH_FF_RESTORE`, `SEEK_BENCH_FF_PLATFORM` and `SEEK_BENCH_FF_PLAIN`. Without them its page steps do not run and the row fails (42.30 first attempt). Record them in the bench header or README, or make the bench refuse to start without them.
- [~] The verdict table has no per-bank version field; the bench treats the `ownImage` bank's version (row 20's bank B, 1.0.3.2) as a note, not a checked value (42.29). (running: TESTING.md 42.39)
- [~] The Electron windows retain about 200 MB per subject (22 to 30 MB per window; not located); the full matrix needs `NODE_OPTIONS=--max-old-space-size=16384`. (running: TESTING.md 42.45)
- [ ] The 0.x/1.x backup on the bench unit is erased where the bootloader's first 11 KiB are (11,268 bytes; the test pins the gap).
- [ ] 1.3.0.8 FF: stage two for the encrypted lines, a faithful emulator platform, FW-V1 branch `ff-dump-keyed-bootloader` (unmerged); its boot is observed, not proven; Preserve "Read & build" on the emulated 1.3.0.8 FF refuses at the derivation gate and needs a full-flash FF dump in the corpus.
- [ ] Check the 42.44 slots-page change on the camera: after a committed write the page now reads all three banks again before the replug (it used to read back only the written bank). Run a few bench rows (a 2014-chain one and a 4.x one) once the bench is free.
- [~] The frame-rate patch (`patchFps` in `useSlotsPanel.ts`) still drops the bank table after a patch, as the write did before 42.44; and `packages/core/src/protocol/ops.ts:44` says 0x55 and 0x5a are used by the flash path only, while the info read uses them too (42.44). (running: TESTING.md 42.47)
- [?] CLI `info` and the page's Slots tab read through core `readDeviceInfo` (0x55 for selectors 1, 20, 17, 10; 0x5a for the serial; the slots); the page's Info tab reads identity only (42.17, by design). 0x55 latches a RAM selector and 0x5a arms the RAM device-id block; neither writes flash. 42.44 recommends keeping both as they are; owner to confirm.
- [~] An offline dump of a v4 camera is not covered by `e2e:offline`. (running: TESTING.md 42.39)
- [?] The shutter question of 42.15 (a per-frame shutter in mode 6) is moot now the mode-6 patch is gone; the Normal-mode patches left the shutter cycle unchanged in the measurements. Owner to confirm it can be closed.
- [?] The 4.8.1.7 and 4.8.1.9 Key A path is proven on the emulator only (the stock and patched rate, the saved dumps, the Electron button and the restore were never run on a camera).
