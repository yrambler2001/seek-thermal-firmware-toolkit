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
Finding on the bench: stock 8.11 fps, patched 8.29 fps, owner heard the shutter fires every frame. `measure_fps.py` was built for the PRO (PID 0x0011, 342x260) and never validated on the Compact (PID 0x0010).
- [ ] Source side: read `FW-V1/targets/compact_8hz_1_3_0_0` (and `_1_3_0_8`, `compact_pro_9hz_*`) to find what drives the shutter and the frame period, and what `fps_patch.py` really changes.
- [ ] A Compact-native capture tool in this repo (rate, frame-type histogram, shutter frames), validated on stock first.
- [ ] Re-measure stock and patched on the bench; settle what the patch does; report the rate per build (1.2.0.0 and 1.3.0.0 only have a 16 Hz entry in the Python).
- [ ] Button label shows the map's real rate. TESTING.md section and this plan updated.

## 2. Restructure the pages and the CLI (no compatibility layer)
Tabs: Info | Dump & decrypt 0.x/1.x 2014/2016 | Dump & decrypt 4.x/Nano | Decrypt File/Slot | Work with firmware slots.
- [ ] Info tab: reads the firmware version, says what each tab does.
- [ ] Preserve page renamed to "Dump & decrypt 0.x/1.x 2014/2016", otherwise unchanged (its first step already reads and saves a zip).
- [ ] Dump page becomes "Dump & decrypt 4.x/Nano", v4 only: the firmware-family selector is removed; "Dump all selectors" moves into the options spoiler.
- [ ] Decide from the build table and tests whether 2016 and 1.3.0.8 FF run in the Preserve flow. If yes they stay there; if one behaves like v4 it gets a select on the v4 page.
- [ ] Decrypt tab: "Decrypt a dump you already have" moves here; new "Decrypt a firmware slot" takes 64 KiB of one slot from a file, no camera.
- [ ] "Firmware & flashing" page removed; device info moves to the slots page. Routes, header, titles, tests, docs follow.
- [x] CLI follows the same shape: `info`, `preserve`, `dump`, `decrypt file|slot`, `slots`; old names removed, usage, README and tests rewritten (TESTING.md 42.16).

## 3. Slots page quality
- [ ] Wording, empty and refused states, row actions, the device info panel's place.
- [ ] Tests that expect success and tests that expect a denial, on the emulator (core, CLI, web) and on the real camera through the CLI and Electron, with banner assertions (no "cannot be written" banner whenever the plan allows a write).

## 3b. Quality of the other pages (Electron tests on the emulator and on the real camera)
- [ ] Info, Dump & decrypt 0.x/1.x 2014/2016, Dump & decrypt 4.x/Nano and Decrypt File/Slot each get Electron tests, a pass set and a denial set per page:
  - emulator: the page drives a corpus camera and the expected result appears (dump zip, decrypted output, version read), plus the refusals (wrong camera line for the tab, unreadable or foreign slot file, no camera where one is needed).
  - real bench camera (Compact 1.3.0.0): the same flows through the page, camera restored to baseline afterwards.
  - banner/text assertions as for the slots page (no wrong refusal banner when the flow is allowed).
- [ ] The same flows through the CLI commands, so both entrances are covered.
- [ ] Findings from these tests are fixed in the pages, then the matrix is re-run.

## 4. Verification
- [ ] Full Electron bench matrix (28 subjects) on the final HEAD, after each stage that changes the page or the plan.
- [ ] Targeted vitest suites, typechecks for core/cli/web/e2e, docs bundle (`npm run build:docs`).
- [ ] Camera restored to baseline at the end.

## 5. Open items carried over (not started)
- Stage two of FPS (encrypted lines), faithful platform for the 1.3.0.8 FF, FW-V1 branch `ff-dump-keyed-bootloader`.

## Log
- 04:10 plan written; FPS merged and enabled.
- 04:15 three agents launched from 72c705f: shutter + Compact measurer (bench), web restructure, CLI restructure; check cron every 10 min.
- 04:20 added item 3b (Electron tests for the other pages, emulator and real camera).
- 04:35 CLI restructured on this branch: `info` (--devices, --profiles), `preserve` (--backup-only, --zip), `dump` (v4 only, --all-selectors), `decrypt file|slot` (new slot form, core decryptSlotFile), `slots`; `flash`, `sweep`, `devices`, `profiles` removed with no alias. TESTING.md 42.16 lists what `flash` did that `slots flash` does not.
