# Plan: what is still to do

Branch `refactor/all-firmware-profiles` is local: nothing on it is pushed, and main is never touched without the owner's explicit word (owner, 2026-10-19: keep it local until the owner says). FW-V1 `main` `fa9b7b126` and tv-jc master `3be18f6` were pushed on the owner's word on 2026-10-19; each later push needs the owner's word again.
Done work is in `TESTING.md` (sections 42.x; the latest merged is 42.70; 42.71 and 42.72 are running) and `FPS_32HZ.md`; this file lists only what is open. Status marks: [ ] open, [~] running, [?] needs the owner.

## 0. Orchestration state (2026-10-19, before a context compaction)

Running agents (Haiku 5.5 xhigh, each in its own worktree under `.claude/worktrees/`; each ends with a TESTING.md section and commits on its `worktree-agent-*` branch):
- 42.68 merged: the e2e Info guard lets the Info read's exact 0x55/0x5A shapes out only while the Info click runs (gate in `e2e/lib/write-guard.ts`); the 4.x test now forbids them outright; pages-emu Info 10 passed; on the camera the Info test passed twice (page read about 4 s) and every page field equals `seek-fw info --json` (platform and USB link are unreadable on the camera itself: 0x55 selectors 20 and 17 stall); end flash byte-identical. Left open: pages-bench part 0 wants baseline `40447c7e` while the bench holds `50e900c2` (it writes its baseline and the run restores); `e2e/lib/camera-bus.ts` (Node bridge) still refuses 0x55/0x5A for every run.
- 42.70 merged (TESTING only): PASS. The `plain-2014` 1.3.0.0 bank written by `build_flash.mjs --flash --slot b` boots: `seek-fw info` 1.3.0.0, cfg0 1, active-slot word 1, booted b; Normal median 8.03 fps with a picture. The new bank B equals the owner's factory bank A (`full_dump_original.bin`, 40447c7e) byte for byte; the bench's bank A differs from factory in 13 bytes (sum word and 9 bytes at 0xb898, inferred to be the 32 Hz patch). End flash byte-identical (50e900c2). Bench left with channel 1 off. Side note for lost frames: its reads count 27 frames per 5-s window (5.4 fps) while the per-second median is 8.0; cause not established.
- FW-V1: `plain-2014` merged into local main as `b4f47a71f` (main is 2 ahead of origin). [?] Push needs the owner's word.
- 42.72, FW-V1, no bench: the hand tools `seek_fw_tool.mjs bank-payload` and `package_image.py --bank-payload` produce the plain bank (byte-equal to `build_flash.mjs`) or refuse on 2014-chain targets; 4.x unchanged. FW-V1 worktree `/private/tmp/claude-501/fwv1-tools`, branch `plain-2014-tools`. Then remove the old `/private/tmp/claude-501/fwv1-plain2014` worktree and the merged `plain-2014` branch.
- 42.66 merged (TESTING section; FW-V1 commit `b2c3c3c09`, now in local main through `b4f47a71f`).
- 42.67 merged (72ee067 to 347fa71): the upgrade warning also when the camera runs R and its upgrade writes B (text says what B holds, from B's verdict on the read; JSON `boot.upgradeTargetRecovery`); the Connect section shows the unlock note from the shared flag; FPS_32HZ.md mode 4/7 line; the three FF-vendor eslint errors. Verified on merged HEAD: core 62, cli camera 27, web 58 tests, bench-lib/verdict 143+6 skipped, tsc core/cli/web/e2e 0, eslint 0.
- README "Firmware and flashing" rewrite merged (cherry-pick of 04ef8c0): describes the Info and slots tabs, every kept claim checked against code; it kept three claims it could not check (the ten-dump byte-identical rebuild, agreement with `seek_fw_tool.mjs`, the 2019-bootloader / 4.9.2.0 story).
- 42.69 merged (2249d48 to 7d299a2): README recovery-case warning and Connect note; FPS_32HZ.md active-slot word and the two identifiers as 42.53/42.56/42.61 measured; the "Key A" wording on the page and README (store key, or the booted bank's key); the CLI bare-name comment; the CLI slot dumps now start `seek-slot-`. Verified: cli slots/args 150, slots-empty emulator 7, web 29, tsc cli/web 0, eslint 0, prettier clean.
- 42.71, no bench: one core function names slot dumps for both the page and the CLI, in the CLI's form (`seek-slot-b-1.3.0.0-<sha8>.bin`, `…-decrypted<keysuffix>.bin`; orchestrator's choice, since the owner wants the page to match the CLI); the stale "bare name is refused" comments in `useSlotsPanel.ts`; README's "2017+ line" named one way.

Open small item: `packages/core/src/workflows/flash.ts` (`writeFirmware`, `prepareImage`) belonged to the removed `#flash` page and no CLI or web source calls it; tests and a few core files still reference it. Remove only after checking what `plain-chain-flash.test.ts` and `upgrade-target.emulator.test.ts` cover through it.

When they finish:
1. Check each report and diff; cherry-pick the commits onto the branch; resolve TESTING.md append conflicts with `python3 /private/tmp/claude-501/-Users-yrambler2001-things-a-noindex-seek-seek-thermal-firmware-backup/82174575-1341-45d6-a306-7518156cd978/scratchpad/resolve_testing.py TESTING.md` (keeps both sides' `### 42.N` sections in number order); run the touched tests, the typecheck and eslint on the merged HEAD; remove the worktree and delete the branch; update this file.
2. After 42.72: merge `plain-2014-tools` into FW-V1 main locally; ask the owner before pushing FW-V1. Then merge `plain-2014` into FW-V1 main locally and ask the owner before pushing.
3. After 42.71 is merged: one agent rebuilds the hosted bundle (`npm run build:docs`, as in 705b5fa), since the page changed in 42.64 and 42.67, and runs `offline-bundle.e2e` with `SEEK_EMU_DIR` and `SEEK_FULL_DUMPS_BY_CAMERA`.
4. Then report to the owner and ask the open [?] items below. Other camera units come after everything else.

## Standing rules

- Orchestrate only: split the work, spawn agents, merge and verify, keep this file, ask the owner. Agents: Haiku 5.5, xhigh, in worktrees, no nested agents; a fresh agent for each follow-up; resume only one that stopped mid-task. Never read agent output files.
- Every agent first runs `git reset --hard refactor/all-firmware-profiles` and makes the `node_modules/@seek-fw/{core,cli,web}` links (`ln -sfn ../../packages/<p>`); other packages resolve from the main checkout's node_modules. Web tests need core's dist (`npm run build --workspace @seek-fw/core`).
- Never run a whole `vitest` (the CLI suite includes the untracked `packages/cli/test/real-camera-probe.test.ts`, which opens the physical camera; keep it untracked and never `git add packages/cli` as a directory). Core unit tests: `npx vitest run --project core <test/...>`. FW-V1 emulator tests need `SEEK_EMU_DIR=/Users/yrambler2001/things/a.noindex/seek/FW-V1/emu`; FW-V1 Python runs with `emu/.venv/bin/python`.
- Camera: switch channel 1 = J-Link, channel 2 = camera (`node switch.js cycle <ch> 3000` in `/Users/yrambler2001/things/a.noindex/usb-port-switch-rp2040`). The J-Link attaches only on its first connection after a channel-1 cycle. Hardware may be used without asking (owner, 2026-10-18). Save a restore image (`dump-spifi-4m-halted`) before any write and byte-compare at the end; restore with `flash-factory-4m-2`. Only one agent uses the bench at a time. CLI slots commands and the page's reads leave the camera unlocked until a power cycle (42.41): power-cycle channel 2 before the fps checker. fps reads after a dump or restore settle only after several reads.
- Commits by the orchestrator end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01XKhSca8W2e3Q8Dcd4CkwCy`; agents use the Haiku 5.5 trailer and the same session line.
- Owner decisions in force:
  - no deprecated names and no backward-compatible CLI;
  - the "Make N FPS" button stays enabled and is never gated; it shows the boot-word warning text when the patch would not take effect (42.27 section 6);
  - a build that is patched but not measured is offered exactly like a measured one, with no "not measured" note; a measured rate different from the target is named (`FPS_MEASURED_HZ`: Compact PRO 4.9.1.15 at 17.7, 42.32);
  - the page and the CLI warn, never gate;
  - the page and the CLI display the same information (the Info tab reads as `seek-fw info`, 42.64);
  - the slots bench judges each subject by the shared verdict table (42.29);
  - the `dump` command's 0.x/1.x refusal stays as a safety net (42.64);
  - the Preserve page keeps its zip step; `FW-V1/targets` holds every reconstructed firmware source.

## 1. Frame rate

Every 8 and 9 fps build with a table entry is offered except the FF entries and 0.7.0.8: stage one (2014 plain chain), stage two (Key A: the Compact 4.8.x and the Compact PRO 4.9.1.15 at 17.7, 4.9.2.0 at 18) and stage three (the Compact PRO 2016 keystream line 1.0.3.0, 1.0.3.2). Bank A, B and R writes are proven on the emulator for all nine stage-two and stage-three builds (42.36). Principle and per-build table: `TESTING.md` 42.27 to 42.29 and `FPS_32HZ.md`.

- [?] Lost captures (owner: work on them). Whole-run rates sit under the per-second medians (42.37, 42.41): patched 1.3.0.0 Normal 30 min 29.1 fps (90%); stock 1.3.0.0 Hi FPS 30 min 30.35 (95%); stock Normal 10 min 7.28 (91% of 8); the 1.3.0.8 copy form over 20 s 24.1 to 25.0 (about 76%). Two causes (42.62): (1) the calibration excursion every 96 captures (3.0 s; `app_init.c:967-970`, mode-8 blocks 9, 10, 11, 7, a type-6 and a type-1 shutter frame) costs 10 captures on patched builds against 5 on stock, reproduced on the emulator; publishing them would change the calibration frames (owner's call; recommendation: leave it); (2) single skips seen only on the camera (patched 137 to 246 a minute, stock 21 to 26), inferred to be the "USB TX not complete, skipping field" path (`app_init.c:955-961`); they grow with the host's wait before each credit, and only one credit can be outstanding. Skip floor (42.65, 60 s, two runs each): a tight libusb C loop 42 and 78 singles a minute (whole run 26.8, 27.2 fps), tight node-usb 178 and 206, 42.62's loops 137 and 246; a faster host lowers them but does not remove them, so they are not only host latency (two runs each is too few to rank C against node). Owner: what "Make 32 FPS" should name.
- [?] Mode 4 streams about 32 fps on stock firmware with no flash write (42.54: stock 1.3.0.0 32.10, 32.20, 26.75 fps over 20 s; stock 1.3.0.8 28.65, 29.35, 31.90; status-0 frames, which the checker now counts, 42.55). Picture (42.58, no scene visible): level like Normal, low temporal noise, no shutter steps in 3.7 s, and a fixed pattern unlike Normal's shutter frame, so a host-side mode-4 stream would need its own flat-field reference. Owner: offer it next to, or instead of, the patch? A run with a scene in view would settle the picture. Mode 7 has no capture program.
- [ ] Builds whose table patch never ran on a camera: 4.8.1.7, 4.8.1.9, 4.16.1.7 FF, 1.3.0.8 FF, the Compact PRO 4.9.2.0, and the Compact 4.8.2.1 (the XR was measured in 42.24; same image, 42.34). Owner: other units after everything else; there will be no Compact PRO 1.0.x unit, so 1.0.3.0 and 1.0.3.2 stay emulator-only. The 4.8.1.7 and 4.8.1.9 Key A path (rate, dumps, the Electron button, the restore) is emulator-only too.
- [~] The booted-bank upgrade warning (42.64, fires when the upgrade target is the booted bank) also under boot word 2, where the camera runs R and its upgrade writes B (owner: yes). (running: 42.67)
- [ ] The active-slot word: selector 10 returns the firmware's roots record and the word is its +8 (42.56): the boot record at 0x10000200 on 2014 and 2016 (the bank that ran), 0x10002118 on 4.9.1.15 (follows the bank that ran), zero on 4.8.2.1 (record not located). Core reports it on 2014, 2016 and 4.9.x and hides it on 4.8.x. Nothing prints it on 4.9.x (the CLI's boot section is 2014-only). Open: the 4.8.2.1 record, the 4.9.1.15 writer, 1.0.3.2 and 1.3.0.8 not run.
- [ ] The "mode 4 is a self-test" comment: fixed in 1.3.0.8, 4.8.1.7, 4.8.1.9 and XR 4.8.2.1; FW-V1's telemetry docs say mode 4 is the self-test on the 4.9 PRO, the 4.18 line and Nano, so the other targets need an emulator mode-4 run first; the text also sits in generated `src/frame.c` and `rpc_cmds.c` of about 20 targets and needs a codegen change.
- [~] `FPS_32HZ.md` (about lines 269 to 271) says mode 4 is not measured on a Compact; it is (42.54, 42.58). (running: 42.67)
- [?] 0.7.0.8 in slots (owner: not now). [?] The FF entries 1.3.0.8 FF and 4.16.1.7 FF (owner: not now). [?] Raw, IP mode 0 (owner: not now).
- Closed (owner): builds that build their capture programs at run time (0.5.0.2 to 0.7.0.7, 0.3.0.1 by inference, 42.53) are not patched; 4.8.1.7 and 4.8.1.9 refuse Hi FPS by their mask; the mode-6 shutter question (42.15) is moot.

## 2. Hardware, the J-Link runner and FW-V1

- State (not a task): the owner's Compact PIR206 (device serial `101310HSNEA2`, chip id `1013CE098ACA`) runs bank A (`ef90c94a`, the table's 1.3.0.0 image, 32 Hz) with boot word 0; bank B and recovery R hold `d91284c6`. The whole flash is `50e900c2…` (halted read); every camera session through 42.62 left it byte-identical.
- [~] FW-V1 2014-chain `build_flash --flash` stages the plain image so the native bootloader takes it (owner: do it; then prove on bank B). (running: 42.66; bank-B camera test after it)
- [~] FW-V1 codegen: the `gen.mjs` `.gitignore` literal gains `jlink_dumps/` (owner: go ahead). (running: 42.66) Also open: main's earlier hand edits to the 1.3.0.0 `jlink-runner.js` (`15e74e942`, `37cf6cfa8`) have no canonical copy; the 25 pending targets cannot be regenerated (the shared `codegen/harness` copies carry the 4.x table).
- [?] 18 FW-V1 2014-chain app targets have no factory-flash reference, so `build_flash` refuses before make (42.49). A corpus donor dump could fill in (the manifest proposes `101310HSNEA2`). Owner's call.
- [ ] FF platform bank maps (42.53): 1.3.0.8 FF on bootloader 2.0.2.3 is the 4.x map; the Compact PRO FF 1.0.3.x is the 2014 map; the Compact PRO FF 4.18.2.0 is the 4.x map; the boot word is at 0x14010000 on all; the runner tables agree. Open: 2.0.2.3's selection did not reproduce on the emulator.
- [~] Checks on the camera (running: 42.65): the checker's serial and chip id line, "did not answer", the 1.3.0.8 default stream exiting 1, 0x5A before the first init; the Info tab against `seek-fw info`; row 9 with no FF variables.
- [ ] The 1.3.0.0 boot-config word is 0. A warm reset can set it to 2 again (the bootloader writes it), and the word is not guarded. The warning (42.27 section 6) shows when the word points at R while a patched bank A does not run.

## 3. tv-jc and the macOS app

- Done: tv-jc master `3be18f6` (the Swift `seek` tool and the app show the device serial and the chip id apart, 42.61) is pushed.
- [ ] The owner's workflows in `tv-jc/.github/workflows-disabled/` stay disabled until the owner moves them back.

## 4. Repo state

- [?] `refactor/all-firmware-profiles` (42.27 to 42.64 merged on it; the hosted bundle `705b5fa` matches up to 42.59) is local; pushing it and merging to main need the owner's word.
- [ ] The FF vendor-form write on bootloader 2.0.2.3 stays open (owner: keep it open); not measured on a 2.0.2.3 camera.

## 5. The slots bench and older items

- [?] The full 28-subject matrix (owner: not yet). It would confirm row 27's 42.30 failure was the reset check's missed sample (fixed in 42.31), and that the 16 GB heap setting is no longer needed (42.45; 39 to 68 MB per subject on the camera in 42.54).
- [~] Row 9 finds and hash-checks its FF files itself (42.60); its camera run is in 42.65. The three old eslint errors in the FF vendor files are in 42.67.
- [ ] 1.3.0.8 FF: stage two for the encrypted lines, a faithful emulator platform, FW-V1 branch `ff-dump-keyed-bootloader` (unmerged); its boot is observed, not proven; Preserve "Read & build" on the emulated 1.3.0.8 FF refuses at the derivation gate and needs a full-flash FF dump in the corpus.
- [~] The page's Info tab now reads as `seek-fw info` does (42.64; about 590 requests on a 4.18.2.0 fake, with the unlock note). Its camera check is in 42.65.
