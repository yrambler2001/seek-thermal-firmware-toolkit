/**
 * Help text. The commands are the web app's tabs, one each, and every command's
 * block names the options that command takes (cli.ts refuses the others).
 */

export const COMMAND_NAMES = ['info', 'preserve', 'dump', 'decrypt', 'slots'] as const;

export type CommandName = (typeof COMMAND_NAMES)[number];

export function isCommandName(value: string): value is CommandName {
  return (COMMAND_NAMES as readonly string[]).includes(value);
}

const EVERY_COMMAND = `Every command takes
  --json                 one JSON document on stdout (--help and --version too)
  --quiet                no progress bar and no log lines
  --verbose              show detail lines and full stack traces
  --no-color             never emit ANSI colour
  -h, --help             show this command's help
  -V, --version          print the version`;

export const MAIN_USAGE = `seek-fw — dump, decrypt and reflash Seek Thermal camera firmware

Usage
  seek-fw <command> [options]

Commands: one for each tab of the web app
  info                   Info: the firmware version and identity of the camera, and the
                         lists of connected cameras and firmware families (--devices, --profiles)
  preserve               Dump & decrypt 0.x/1.x 2014/2016: the six-step preservation run.
                         --backup-only is its read-only first step, which saves the zip
  dump                   Dump & decrypt 4.x/Nano: read the whole 4 MiB flash and decrypt it
                         (--all-selectors probes every selector instead)
  decrypt file <dump>    Decrypt File/Slot: decrypt a dump you already have, no camera needed
  decrypt slot <file>    Decrypt File/Slot: decrypt one 64 KiB firmware bank from a file, no camera
  slots list|dump|flash|patch-fps
                         Work with firmware slots: identify, dump, write, or raise the frame
                         rate of one bank (A, B or R)

Run \`seek-fw <command> --help\` for the options each command takes.

${EVERY_COMMAND}

Examples
  seek-fw info --json | jq .firmware
  seek-fw dump --out ./my-camera
  seek-fw preserve --backup-only --zip ./backup.zip
  seek-fw decrypt file flash_4m.bin --out ./decrypted
  seek-fw decrypt slot slot-a.bin --out ./decrypted
  seek-fw slots flash b image-KeyA-....-KeyB-....bin --yes

Under --json stdout carries exactly one JSON document, --help and --version
included, and every human line goes to stderr.

Exit codes: 0 success, 1 the operation failed, 2 bad usage, 130 interrupted.
`;

const COMMAND_USAGE: Record<CommandName, string> = {
  info: `seek-fw info — the Info tab: what is this camera running?

Usage
  seek-fw info [--profile <id>] [--serial <id>] [--recipient <r>] [--no-probe] [options]
  seek-fw info --devices [--json]
  seek-fw info --profiles [--json]

Reads the firmware info selectors, the boot config and all three firmware slots,
decrypts them locally and reports the running version, the key table, which slot
booted, which slot an upgrade would write, and whether each slot is merely
decryptable or actually bootable. Read-only: nothing is written to the camera.

  --devices              list the connected Seek cameras and open none. Says so, and
                         exits 0, when there is none
  --profiles             list the firmware families this build knows and open no camera
  --profile <id>         act under this family instead of the one the camera answers for
  --serial <id>          pick one camera when several are attached
  --recipient <r>        interface | device | auto (default auto)
  --no-probe             do not ask the camera which protocol it speaks first
  --chunk <n>            control-IN request size, at most 64 (default 64)
  --gap-fill <byte>      fill byte for unreachable blocks (default 0xff)
  --retries <n>          per-window retry count (default 2)
  --retry-delay <ms>     pause between window retries (default 500)

${EVERY_COMMAND}
`,
  preserve: `seek-fw preserve — the Dump & decrypt tab for 0.x/1.x 2014/2016

Usage
  seek-fw preserve [--out <dir>] [--zip <file>] [--backup-only] [--yes] [options]
  seek-fw preserve --resume <dir> [--from-step <id>] [--yes]
  seek-fw preserve --print-state <dir>

The pipeline runs as SIX RESUMABLE STEPS, checkpointed after every one, for a
v1 locked-line camera (Compact 1.0.0.0 / 1.2.0.0 / 1.3.0.0 and the other
builds the patch table covers):

  backup   read the 31 windows a stock camera can serve (read-only), name the
           ACTIVE boot slot, read its image TWICE (two independent captures
           that must agree byte for byte — a disagreement refuses the run),
           derive the factory plaintext from that capture, gate it, and write
           the backup AND the standard dump archive (decrypted slots, reports,
           manifest) built from it. The user's pre-flash dump of every
           reachable region — on disk before anything write-shaped can run.
  patch    offline, no device: derive the in-place patch (the reader-window
           widening and cursor fix, conjugated later into the slot's
           ciphertext so exactly the enumerated bytes change).
  commit   read the bank back (a commit that already landed is never
           replayed), stage image-length-only, and commit — on a session
           that never resets.
  drain    the reset that boots the patched image (with its retry ladder for
           the ~10 s of silence a reboot costs), then the whole 4 MiB through
           the widened window, drained FIRST on its own single arm.
  restore  stage the original bank content back, verbatim, and reset.
  verify   a fresh boot re-reads the 31 windows: 0 differing bytes proves the
           camera's flash came back byte-identical.

THE IMAGE IS THE CAMERA'S OWN — there is no image argument anywhere. The
backup step derives the factory plaintext from the camera's active slot
(two agreeing reads; identity on the 2014 plain chain, the build family's
keystream solver on a cipher family), checks the derived image's header
version against what the camera reports, and refuses an already-patched bank
at the before-byte gates. The derived image is a run artifact, so --resume
needs no file but the run directory.

THE RISK, PLAINLY: commit and restore write the ACTIVE boot slot. On real
hardware an interrupted write there has no bootable fallback — a power loss
mid-commit needs an SPI programmer. The backup checkpoint (written before the
first write) and the restore are the mitigation, not a guarantee. Run on mains
power, keep the run directory.

  --backup-only          run the read-only backup step and stop. Nothing is written to the
                         camera. The run directory holds the backup; --zip saves it as one file
  --zip <file>           write the run as one zip: preserve_run.json and every checkpoint file
                         the run has produced, the way the web app saves its run file
  --out <dir>            the run directory (default ./preserve-run)
  --yes                  skip the confirmations (required when stdin is not a tty): the one before
                         the camera is touched, and the one at the derived plan, before the first
                         write. --backup-only needs only the first
  --resume <dir>         continue the run in <dir> from its next step
  --from-step <id>       with --resume: start at a chosen step. Refused when the step's files are
                         missing from the run directory (commit without the backup files) or the step
                         already completed; jumping past an incomplete commit warns loudly and then
                         runs on your explicit assertion that the camera is in the patched state (the
                         restore and verify keep their own wire-side checks)
  --print-state <dir>    print the run's state, its next step, and whether the checkpoint files still
                         match what was recorded. Touches no camera
  --serial, --recipient, --chunk  as for the other commands (--chunk sets the drain's read size)

Interrupted runs: Ctrl-C stops at the next safe point, leaves the previous
checkpoint standing, and exits 130. Re-run the same --resume command to
continue; the interrupted step starts over.

Artifacts in the run directory: preserve_run.json (the state, rewritten after
every step), preserve_backup_windows.bin, preserve_bank_capture.bin,
preserve_image_plain.bin (the factory plaintext derived from the capture),
preserve_patch_plain_patched.bin, preserve_dump_postwrite.bin (the patched
part), preserve_dump_original.bin (the delivered, original-content image),
manifest.json and README.md (the backup's dump archive) plus the decrypted
slots under decrypted/.

${EVERY_COMMAND}
`,
  dump: `seek-fw dump — the Dump & decrypt tab for 4.x and Nano

Usage
  seek-fw dump [--out <dir> | --zip <file>] [--all-selectors] [options]

Asks the camera which build it runs, reads the whole 4 MiB flash through that
build's own BeginFirmwareUpgrade selector map, assembles the image and decrypts
whatever firmware slots it contains. There is no family to pick: the camera's
own answers choose it. A camera of the locked 2014–2017 line (Legacy, Compact
2014, Compact PRO 2016) is refused here, before anything is read; its flow is
\`seek-fw preserve\`.

  --all-selectors        probe every BeginFirmwareUpgrade selector (0x00–0xFF) and record
                         what each one exposes, instead of reading the map. For a camera
                         whose selector map is not known. Read-only; stalls are expected
                         and are recorded, not treated as errors
  --no-decrypt           dump the flash but skip the decryption stage
  --out <dir> | --zip <file>  where the archive goes (default: a timestamped directory)
  --serial <id>          pick one camera when several are attached
  --recipient <r>        interface | device | auto (default auto)
  --no-probe             do not ask the camera which protocol it speaks first
  --chunk <n>            control-IN request size, at most 64 (default 64)
  --gap-fill <byte>      fill byte for unreachable blocks (default 0xff)
  --retries <n>          per-window retry count (default 2)
  --retry-delay <ms>     pause between window retries (default 500)

Ctrl-C stops the read and still writes what was read; the archive is marked
partial and the exit code is 130.

${EVERY_COMMAND}
`,
  decrypt: `seek-fw decrypt — the Decrypt File/Slot tab

Usage
  seek-fw decrypt file <dump> [--out <dir> | --zip <file>] [--profile <id>]
  seek-fw decrypt slot <file> [--out <dir> | --zip <file>] [--profile <id>]

Needs no camera, no USB permission and no driver. Both forms recover each
image's key by cryptanalysis (not by searching for a stored key) and write the
plaintext with a report.

  file   a whole dump: scans it for firmware image slots, decrypts each one, and
         writes the per-slot images, the reports and the key log. A file with no
         image in it is reported as such and exits 0.
  slot   one 64 KiB firmware bank, as a slot read stores it. Writes the decrypted
         image (<name>-decrypted.bin, when one decrypts) and <name>-report.txt, which
         says the key's identity, the image's version and the sizes and sha256 values.
         An erased bank is reported as empty and exits 0. A file that is not exactly
         64 KiB is refused. A bank that holds no image, or whose key does not recover,
         writes the report and exits 1.

  --profile <id>         decrypt under this family instead of the one the file's own
                         images point to
  --out <dir> | --zip <file>  where the output goes (default: a timestamped directory)

${EVERY_COMMAND}
`,
  slots: `seek-fw slots — the Work with firmware slots tab: the three banks, one at a time

Usage
  seek-fw slots list [--serial <id>] [--json]
  seek-fw slots dump <a|b|r> [--out <dir> | --zip <file>] [options]
  seek-fw slots flash <a|b|r> <file> [--raw] [--yes] [--acknowledge-risk]
                                     [--no-verify] [--dry-run] [options]
  seek-fw slots patch-fps <a|b|r> [--dump-dir <dir>] [--write] [--yes]
                                  [--acknowledge-risk] [--no-verify] [options]

Banks: the locked 0.x/1.x line (the 2014 chain, and the 2016 keystream line of
1.0.3.0 and 1.0.3.2) has A 0x14050000, B 0x14060000 and R 0x14070000. The 4.x line
(Compact 4.8.x, Compact PRO 4.9.x) has A 0x14030000, B 0x14050000 and R 0x14070000,
where R is the recovery bank (the locked line's roles are not decoded). Builds
0.8.0.0 and newer only; an older build is reported as unsupported and is never
tried. The bootloader and the boot-config block are not banks and are never written.

  list     the camera, each bank's address, whether the camera boots it, its
           version, key and bootability, and what this build can do with each
  dump     read one bank as stored: seek-slot-<bank>-<version>-<sha8>.bin, and the
           decrypted image beside it when its key recovers (-decrypted.bin)
  flash    write one bank. The default image is a DECRYPTED image, encrypted the
           way that bank's firmware needs; --raw sends the bytes verbatim. The
           plan is shown and the write asked for, unless --yes. It writes the bank
           you name and does not repoint the camera's boot choice
  patch-fps  raise the bank's frame rate by editing its bytes. To 32 fps: the Compact 0.8.0.0,
           0.9.0.2, 0.9.0.6, 0.9.0.7, 0.9.1.0, 0.10.0.0, 1.0.0.0, 1.2.0.0, 1.3.0.0 and 1.3.0.8
           builds on the plain 2014 chain, and the Compact 4.8.1.7, 4.8.1.9 and 4.8.2.1 (the
           Compact XR 4.8.2.1 too) builds under Key A. To 18 fps: the Compact PRO 4.9.1.15
           and 4.9.2.0 builds under Key A, and the Compact PRO 1.0.3.0 and 1.0.3.2 builds on
           the 2016 keystream line. Other lines
           refuse with the reason. A dry run unless --write: it prints the plan and sends nothing. --write saves the bank (raw and decrypted) into
           --dump-dir FIRST, then writes the patched image and reads it back (on Key A and on
           the 2016 keystream line, the read-back is checked as the decrypted image).

  --dump-dir <dir>       patch-fps: the folder the pre-patch dump is saved into (required with
                         --write; an existing dump there is never replaced)
  --write                patch-fps: send the patch. Without it the command is a dry run
  --raw                  flash: the file is prepared bytes, staged verbatim
  --acknowledge-risk     flash: needed to write the bank the camera boots now, or bank R.
                         Without it the write is refused, and nothing is sent
  --no-verify            flash, patch-fps: skip the read-back after the commit
  --dry-run              flash: print the plan and send nothing to the bank
  --running-16hz         flash: say the camera runs the 16 Hz FF 1.3.0.8 build; used only
                         when its own answers cannot say which build runs. A wrong choice is
                         refused by the camera (0x70100) before anything is programmed
  --yes                  flash, patch-fps --write: skip the confirmation (required when stdin
                         is not a tty)
  --profile <id>         act under this family instead of the one the camera answers for
  --out <dir> | --zip <file>  dump: where the bank goes

An EMPTY bank (its header window reads as all 0xFF, as on many 2014 cameras'
bank B) is a state, not an error. list shows it as 'empty'; dump returns the raw
64 KiB of 0xFF (seek-slot-<bank>-empty-<sha8>.bin) and says there is nothing to
decrypt; flash writes it like any other bank, and the plan says nothing is
overwritten. To give it the firmware another bank holds, dump that bank and
flash the -decrypted file it writes.

After a flash, unplug the camera and plug it back in: a bank is only used when
the camera boots, so the new image runs after the next start.

${EVERY_COMMAND}
`,
};

export function usageFor(command: CommandName | null): string {
  return command === null ? MAIN_USAGE : COMMAND_USAGE[command];
}
