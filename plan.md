# Plan (owner asleep from 2026-10-18 ~04:10; ~10 hours, no questions, no waiting)

Branch: `refactor/all-firmware-profiles`. Local commits only. Never push, never touch main.
Agents: Haiku 5.5 xhigh in worktrees, no nested agents, a fresh agent for each follow-up, resume only one that stopped mid-task.
The bench camera (Compact 1.3.0.0, 101310HSNEA2) may be used freely; baseline whole-flash sha256 `40447c7e…eb72`, restore after each use.
Owner decisions in force: no deprecated names and no backward-compatible CLI; the "Make N FPS" button stays enabled with no warning; the Preserve page keeps its zip step as it is; FW-V1/targets holds every reconstructed firmware source.

Status marks: [ ] open, [~] running, [x] done.

## 0. Already done
- [x] Slots page, FF vendor form, plaintext-chain key-derivation fix (see TESTING.md 42.x).
- [x] Stage-one FPS map, flow, button, CLI `slots patch-fps` merged (a568e50); offer re-enabled and the "untested" warnings removed on the owner's word.

## 1. Frame rate: the shutter and the measurer
Finding (TESTING.md 42.15, corrects 42.14): in IP mode 6 (the camera's boot mode) stock publishes 8.11 fps and the 1.3.0.0 16 Hz patch publishes 16.00 fps once the patched image runs. The 8.29 fps of 42.14 was read before the written image ran. The vendor SDK opens the camera in IP mode 8, which the patch does not touch. The per-frame shutter is a mode-6 property, stock and patched; the patch doubles it. The owner has to choose what to do about the shutter (42.15, open item a).
- [x] Source side: `fps_patch.py`, the 1.3.0.0 sources (frame dispatch, `sensor_gpio_control`, the block table), the SDK's mode-8 open. Evidence in TESTING.md 42.15 items 1-8.
- [x] Compact-native capture tool: `e2e/lib/bench/compact-fps/` (frame size, row width, type histogram, capture index, thermal-only rate); 18 unit tests on a recorded fixture; validated on stock (3 runs, 8.11 fps).
- [~] Re-measured on the bench for 1.3.0.0 only (mode 6 stock, patched, restored; mode 8 stock and patched). 1.2.0.0 and 1.3.0.8 are not on the bench.
- [~] Button label: `Make ${toHz} FPS` reads the map's highest target (1.3.0.0 "16", 1.3.0.8 "32"; 1.2.0.0 "16"). The 16 Hz claim is true in mode 6, not mode 8. The offer is enabled as the owner decided; whether to withdraw or relabel it is the owner's decision (42.15 open items).
- [x] TESTING.md 42.15 added; 42.14 carries a correction pointer; this plan updated.

## 2. Restructure the pages and the CLI (no compatibility layer)
Tabs: Info | Dump & decrypt 0.x/1.x 2014/2016 | Dump & decrypt 4.x/Nano | Decrypt File/Slot | Work with firmware slots.
- [x] Info tab: reads the firmware version, says what each tab does (TESTING.md 42.17).
- [x] Preserve page renamed to "Dump & decrypt 0.x/1.x 2014/2016", otherwise unchanged (its first step already reads and saves a zip).
- [x] Dump page becomes "Dump & decrypt 4.x/Nano", v4 only: the firmware-family selector is removed; "Dump all selectors" moves into the options spoiler.
- [x] Decide from the build table and tests whether 2016 and 1.3.0.8 FF run in the Preserve flow. If yes they stay there; if one behaves like v4 it gets a select on the v4 page.
- [x] Decrypt tab: "Decrypt a dump you already have" moves here; new "Decrypt a firmware slot" takes 64 KiB of one slot from a file, no camera.
- [x] "Firmware & flashing" page removed; device info moves to the slots page. Routes, header, titles, tests, docs follow.
- [x] CLI follows the same shape: `info`, `preserve`, `dump`, `decrypt file|slot`, `slots`; old names removed, usage, README and tests rewritten (TESTING.md 42.16).

## 3. Slots page quality
- [x] Wording, empty and refused states, row actions, the device info panel's place (TESTING.md 42.19: one verdict table, the banner and the row controls agree, the writer refuses what the page refuses, the device info names banks as the table does).
- [~] Tests that expect success and tests that expect a denial, with banner assertions (no "cannot be written" banner whenever the plan allows a write): done on the emulator (core table over 26 subjects, CLI, web, Chrome on three cameras) and in TESTING.md 42.19; the real-camera part through the CLI and Electron is not run here (agent C's bench, which may read `e2e/lib/slots-expectations.ts`).

## 3b. Quality of the other pages (Electron tests on the emulator and on the real camera)
- [~] Info, Dump & decrypt 0.x/1.x 2014/2016, Dump & decrypt 4.x/Nano and Decrypt File/Slot each get Electron tests, a pass set and a denial set per page (emulator part done: `npm run e2e:pages:emu`, 42 of 42; TESTING.md 42.18; the real-camera part is not run):
  - emulator: the page drives a corpus camera and the expected result appears (dump zip, decrypted output, version read), plus the refusals (wrong camera line for the tab, unreadable or foreign slot file, no camera where one is needed).
  - real bench camera (Compact 1.3.0.0): the same flows through the page, camera restored to baseline afterwards.
  - banner/text assertions as for the slots page (no wrong refusal banner when the flow is allowed).
- [~] The same flows through the CLI commands, so both entrances are covered (emulator and no-camera part done: `packages/cli/test/pages-emulator.test.ts`, 17 of 17; the real camera is not run).
- [~] Findings from these tests are fixed in the pages (three fixed in 42.18: the 4.x tab and `dump` read a window before refusing a 0.x/1.x camera; `preserve` ran the backup on a 4.x camera with no pointer to the 4.x tab), then the matrix is re-run (emulator re-run done; the real-camera matrix is not).

## 4. Verification
- [ ] Full Electron bench matrix (28 subjects) on the final HEAD, after each stage that changes the page or the plan.
- [ ] Targeted vitest suites, typechecks for core/cli/web/e2e, docs bundle (`npm run build:docs`).
- [ ] Camera restored to baseline at the end.

## 5. Open items carried over (not started)
- Stage two of FPS (encrypted lines), faithful platform for the 1.3.0.8 FF, FW-V1 branch `ff-dump-keyed-bootloader`.
- Preserve Read & build on the emulated 1.3.0.8 FF (image-only, donor-built) refuses at the derivation gate and writes nothing; testing it needs a full-flash FF dump in the corpus (TESTING.md 42.18).
- CLI `info` sends SetFirmwareInfoFeatures (0x55) and SetRAMDataFeatures (0x5a) on its read path, and reads the slots; the web Info sends neither (TESTING.md 42.18, recorded, not changed).

## Log
- 04:10 plan written; FPS merged and enabled.
- 04:15 three agents launched from 72c705f: shutter + Compact measurer (bench), web restructure, CLI restructure; check cron every 10 min.
- 04:20 added item 3b (Electron tests for the other pages, emulator and real camera).
- 04:35 CLI restructured on this branch: `info` (--devices, --profiles), `preserve` (--backup-only, --zip), `dump` (v4 only, --all-selectors), `decrypt file|slot` (new slot form, core decryptSlotFile), `slots`; `flash`, `sweep`, `devices`, `profiles` removed with no alias. TESTING.md 42.16 lists what `flash` did that `slots flash` does not.
- 04:42 CLI branch merged; emulator-cli test now takes the read-only 2014 dump through `preserve --backup-only` and checks that `dump` refuses the camera (emulator-cli, slots.emulator, giveup, slots-empty: 34/34).
- 04:50 42.15: the Compact measurer (e2e/lib/bench/compact-fps) and the frame-rate findings. 1.3.0.0 16 Hz patch measured at 16.00 fps in mode 6 after a power cycle (42.14's 8.29 was pre-restart). Stock mode 6: 8.11 fps, a close and an open stroke per frame (inferred). Vendor SDK mode 8: unaffected by the patch, 6.4 fps thermal with calibration frames about once a second. Candidate C1 (no shutter command, bench only): 32.14 fps, picture not judged. Bank A restored to stock, halted sha = baseline, switch 1=on 2=on. The owner has to decide the offer (42.15 open item a).
- 04:55 shutter/measurer branch merged. Owner's standing decision stands (offer on, no warning); finding recorded in TESTING.md 42.15 for the morning. Next: bench-measure the 1.2.0.0 and 1.3.0.8 entries (their labels 16 and 32 are unmeasured).
- 04:43 web restructure (branch worktree-agent-ae06de44936493a52): five tabs; the 4.x tab is v4-only; 2016 and 1.3.0.8 FF stay on the 0.x/1.x tab (no firmware select added); Decrypt File/Slot decrypts a slot file with no camera; Firmware & flashing removed. Section 2 CLI item and the docs bundle are not done here (TESTING.md 42.17).
- 05:05 web, CLI and measurer branches merged (the Decrypt tab now uses the CLI's decryptSlotFile; web 326/326). Launched A (emulator page tests, non-slots), B (slots page quality + expectation table, emulator), C (bench: FPS map for 1.2.0.0 and 1.3.0.8, real-camera page runs, slots bench). Next after they merge: full 28-subject matrix on the final HEAD, docs bundle rebuild.
- 06:05 agent A (pages, emulator): `npm run e2e:pages:emu` 42 of 42 and `pages-emulator.test.ts` (CLI) 17 of 17 on the final HEAD. Fixed three defects: the 4.x tab and `seek-fw dump` read a window before refusing a 0.x/1.x camera (now refused on the version); `preserve` on a 4.x camera ran the backup and failed without naming the 4.x tab (now refused after the version read). Regression tests and mutation checks in TESTING.md 42.18. Not run: the real camera; the 1.3.0.8 FF Preserve on the emulator fails at the derivation gate (open).
- 06:05 agent A merged: pages-emu Electron 42/42, pages-emulator CLI 17/17; three refuse-before-read defects fixed (4.x tab, `seek-fw dump`, Preserve on a 4.x camera). Recorded: the emulated 1.3.0.8 FF does not complete Read & build on the 0.x/1.x tab (derivation gate refusal, no write); needs a full-flash FF dump.
- 07:25 agent B (slots page quality, branch worktree-agent-a6579665c94f7f24c): one verdict table (`e2e/lib/slots-expectations.ts`, 28 subjects) read by the core emulator test (26 booted, 184/184), the Chrome specs (slots-view 12/12, slots-quality 12/12), web (332/332), CLI (100/100 unit, 23+7 emulator), and core corpus and write suites (all pass). Fixed: the camera-wide banner on the 2016 and FF lines (classic-writer reasons), banner-versus-row contradictions, an unread bank refusing the camera, upgrade-target reasons refusing the page, the writer not applying the camera-wide refusal, empty-bank FPS silence, the keys panel on 2016/FF, device-info bank names, a stale FPS refusal text, and the slots-view spec's expectations. Two table rows corrected to the page's measured verdicts (4.16.1.7 FF refuses all banks; 4.9.1.15 bank B's own-image refusal). Code at 5682c26 (merge), spec fix cff1e83, slots work 91581c5; TESTING.md 42.19. Not run here: the real camera (agent C); the Chrome spec does not boot the two image-only FF rows.
