# Changelog

All notable changes to this project are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- The repository is now `yrambler2001/seek-thermal-firmware-toolkit`, and the page is at https://yrambler2001.github.io/seek-thermal-firmware-toolkit/. The old page address no longer works; links to the old repository address are redirected by GitHub.
- The archives name the toolkit by its new name.

### Added

- A link to the repository in the page's top right corner.

## [2.0.0] - 2026-10-27

The single-file page became a toolkit: one shared core, a web app and a command-line tool that do the same things. It now covers the 2014 to 2017 cameras as well as the 2018-and-later ones.

### Breaking

- The page is now a built web app. GitHub Pages serves it from `docs/`, so the Pages source is the `main` branch, folder `/docs`.
- The page has five tabs, each with its own address: Info (`#/`), Dump & decrypt 0.x/1.x 2014/2016 (`#/preserve`), Dump & decrypt 4.x/Nano (`#/v4`), Decrypt File/Slot (`#/decrypt`) and Work with firmware slots (`#/slots`). The old `#flash` link opens the Info tab.
- The whole-image write of the old "Firmware and flashing" view is gone. Images are written one bank at a time on the Work with firmware slots tab (`seek-fw slots flash`).
- The original single-file page is no longer in the tree. It is kept at tag `v1.0.0`.
- The dump's flash image is `flash_dump_original.bin` (1.0.0: `flash_4m_usb_partial_gap_ff.bin`), and the decrypted files are named after it. **Dump all selectors** saves `flash_dump_all_selectors.bin` (1.0.0: `flash_4m_selectorsweep_gap_ff.bin`), and its `manifest.json` mode is `all-selectors` or `all-selectors-legacy` (1.0.0: `selector-sweep`). The gap fill and whether the unlock token was used are no longer in the names; `manifest.json` records both.

### Added

- **Command-line tool** (`seek-fw`), with one command per tab: `info`, `preserve`, `dump`, `decrypt file`, `decrypt slot` and `slots`. Every command can print JSON (`--json`).
- **Info tab** (`seek-fw info`): what any camera runs — identity, boot config, banks, keys and where an upgrade would go. Before it reads, it asks the camera which protocol it speaks, with read-only requests.
- **The 2014 to 2017 cameras.** Firmware families for the Compact 0.8.0.0 to 1.3.0.8 and the Compact PRO 1.0.3.x, including the 2016 cipher and the 2014 plain chain. The 2016 Compact PRO, which 1.0.0 refused, is now read, decrypted and written.
- **Firmware families.** Every camera is sorted into one of five families, from its own answers and what its banks hold: `modern-4x`, `legacy-auth`, `compact-2016`, `early-compact` (the Compacts before 0.8.0.0) and `generic`. The Info tab and `seek-fw info` name the family; `seek-fw info --families` lists them, and `--family <id>` on `info`, `decrypt` and `slots` names one by hand. The `--json` output and `manifest.json` record it under `family`.
- **Dump & decrypt 0.x/1.x 2014/2016** (`seek-fw preserve`): a guided full-flash preservation run for sixteen builds of the 2014 to 2017 line, in six steps: backup, patch, write, drain, restore and verify. The page groups them into three: read and build, write and whole-flash read, restore and verify. The steps that write ask first. The backup reads every bank twice and compares the reads. A run file saved after every step lets a run resume.
- **Work with firmware slots** (`seek-fw slots`): list, dump, write, copy and restore one bank (Slot A, Slot B or Recovery R) on every build from 0.8.0.0 up. The bank is saved before every write and read back after it. Empty banks are listed and can be written. A bank can be restored from a whole-flash backup, a .bin or a .zip: a 4 MiB flash image, a Preserve run file, or the zip of **Dump & decrypt 4.x/Nano** or **Dump all selectors**. The plan names the kind of file, and warns when the backup looks like another camera's or another firmware.
- **Make N FPS** (`seek-fw slots patch-fps`): raises the frame rate of a bank whose image is known — 32 fps for the Compact 0.8.0.0 to 1.3.0.8 builds on the 2014 chain and for the Compact 4.8.1.7, 4.8.1.9 and 4.8.2.1 (Compact XR 4.8.2.1 too), 18 fps for the Compact PRO 4.9.1.15, 4.9.2.0, 1.0.3.0 and 1.0.3.2. **Make N FPS in every bank** patches every bank in one go, the booted bank last.
- The Compact 1.3.0.8 16 Hz FF image is written the way the vendor app writes it.
- **Decrypt File/Slot** also decrypts a single 64 KiB firmware bank from a file.
- Before every write, the plan says what the camera is expected to do and lists every warning. Risky cases are warnings, not refusals, but nothing is written before its backup is saved.
- A note that the camera stays unlocked until it is power-cycled, on both the page and the CLI.
- The page runs one camera operation at a time across all its tabs and windows.
- An Android phone layout, and `npm run dev:phone` to serve the app to a phone over Wi-Fi.
- **Light and dark themes.** The page follows the system's setting. A switch beside the camera status picks the other theme, and the browser remembers it; picking the system's own theme goes back to following the system.

### Changed

- The page's header says "Seek Thermal Firmware Toolkit", and the browser tab shows the header's thermometer as its icon.
- How a stored key maps to the cipher is worked out from each image, instead of one fixed constant for every image. This fixes the Key A that 1.0.0 reported for the Compact 1.3.0.8 build.
- A dump reads the firmware version first and uses that build's own map of readable blocks. Builds older than 0.8.0.0 have no read command, so the dump refuses them.
- On the 2014 to 2017 line the dump reads `0x14060000`, the block 1.0.0 could not reach, and lists the blocks no request can reach as gaps.
- The archive's `manifest.json` also records the firmware family used, under `family`.

### Development

- A TypeScript workspace with three packages: `@seek-fw/core`, `@seek-fw/cli` and `@seek-fw/web`.
- Unit tests; a test over real camera dumps (the facts are committed, the dumps are not); emulator suites built from the reconstructed firmware; and end-to-end runs in Chrome and Electron, on the emulator or a real camera.
- CI checks formatting, lint, types, tests with coverage, the build, and that `docs/` is up to date.
- `scripts/verify-against-legacy.mjs` compares the core with the 1.0.0 page, read from tag `v1.0.0`.
- The README is rewritten for camera owners: which cameras work, the five tabs with screenshots (`.github/readme/`, made by `npm run screenshots`), and step-by-step frame-rate guides that start with a whole-flash backup. The reference material moved to `HOW_IT_WORKS.md`, `PRESERVATION.md` and `DEVELOPMENT.md`.

### Removed

- `legacy/index.html`, the original single-file page (see tag `v1.0.0`).

## [1.0.0] - 2026-09-01

The original single-file page: `index.html`, run in the browser over WebUSB.

### Added

- Read the 4 MiB SPIFI flash of a Seek Thermal camera, block by block, and save it with the decrypted firmware as one `.zip`.
- Decrypt firmware images by recovering the key from the dump itself, with no key search.
- Offline mode: decrypt a flash image you already have, in any browser and with no camera.
- **Firmware and flashing** view (`#flash`): read what the camera runs, then write a new plaintext firmware image to it through the camera's own upgrade path. This works on the 2018-and-later cameras (Compact, Compact PRO, Compact PRO FF, Compact XR, Nano 300).

[Unreleased]: https://github.com/yrambler2001/seek-thermal-firmware-toolkit/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/yrambler2001/seek-thermal-firmware-toolkit/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/yrambler2001/seek-thermal-firmware-toolkit/releases/tag/v1.0.0
