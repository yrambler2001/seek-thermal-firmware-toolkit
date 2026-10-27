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
                         lists of connected cameras and firmware families (--devices, --families)
  preserve               Dump & decrypt 0.x/1.x 2014/2016: the six-step preservation run.
                         --backup-only is its read-only first step, which saves the zip
  dump                   Dump & decrypt 4.x/Nano: read the whole 4 MiB flash and decrypt it
                         (--all-selectors probes every selector instead)
  decrypt file <dump>    Decrypt File/Slot: decrypt a dump you already have, no camera needed
  decrypt slot <file>    Decrypt File/Slot: decrypt one 64 KiB firmware bank from a file, no camera
  slots list|dump|flash|copy|restore|patch-fps
                         Work with firmware slots: identify, dump, write, copy one bank into
                         another, restore one from a full flash backup, or raise the frame
                         rate of one bank (A, B or R) or of every bank

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

Exit codes: 0 success, 1 the operation failed, 2 bad usage, 3 stopped as planned
(preserve: the run's next step is recorded; resume it), 130 interrupted.
`;

const COMMAND_USAGE: Record<CommandName, string> = {
  info: `seek-fw info — the Info tab: what is this camera running?

Usage
  seek-fw info [--family <id>] [--serial <id>] [--recipient <r>] [--no-probe] [options]
  seek-fw info --devices [--json]
  seek-fw info --families [--json]

Reads the firmware info selectors, the boot config and all three firmware slots,
decrypts them locally and reports the running version, the key table, which slot
booted, which slot an upgrade would write, and whether each slot is merely
decryptable or actually bootable. Read-only: nothing is written to the camera.

  --devices              list the connected Seek cameras and open none. Says so, and
                         exits 0, when there is none
  --families             list the firmware families this build knows and open no camera:
                         what reads each, whether a bank can be written, how the
                         firmware is stored
  --family <id>          act under this family instead of the one the camera answers for
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
  seek-fw preserve [--out <dir>] [--zip <file>] [--bank <choice>] [--backup-only] [--yes] [options]
  seek-fw preserve --resume <dir> [--bank <choice>] [--from-step <id>] [--yes]
  seek-fw preserve --print-state <dir>

The run goes in SIX STEPS, saved after every one so it can be resumed, for a
Compact on 0.x or 1.x firmware (2014) or a Compact Pro on 1.0.3.x (2016), the
builds the patch table covers. Each step's id (for --from-step) and its name:

  backup   Backup: read the 31 blocks a stock camera can read (read-only), then
           read EVERY bank TWICE (the two reads must agree byte for byte), get
           each bank's firmware out of what the camera stores (decrypted where
           it is stored encrypted) and check it, and say which bank the next
           start enters and why: the boot-config word's order, the bank the
           camera reports it entered, and each bank's check. The backup AND the
           dump archive (the banks as plain firmware, reports, manifest) are on
           disk before anything is written.
  patch    Patch: offline, no camera. Build the patch for each bank the run can
           write: it lets the camera's read command reach the whole 4 MiB flash
           and keep its read position, and it is written in the form the camera
           stores it, so only the patch's own bytes change.
  commit   Write: read every chosen bank back (a write that already landed is
           never repeated), then write each one, the bank the bootloader tries
           first last, without restarting the camera in between.
  drain    Whole-flash read: restart the camera so it starts the patched
           firmware (it is silent for about 10 s); the camera's own record says
           which bank it entered, and a bank the run did not patch stops the
           step before anything is read (a planned stop: exit status 3, and the
           restore is next); then read the whole 4 MiB flash in one read.
  restore  Restore: write every written bank's original firmware back, and
           restart the camera.
  verify   Check: after a fresh start, read the 31 blocks again, every bank
           among them: 0 differing bytes proves the camera's flash is
           byte-identical to the backup.

WHICH BANKS (--bank). The patch only runs if the start after the whole-flash
read's restart enters a patched bank, and the bootloader picks that bank: the boot-config word
sets the order (0 or 0xFFFFFFFF: A, B, R; 1: B, A, R; any other word: R, A, B),
the first two are checked and the last is entered unchecked. A watchdog reset
early in a start makes the bootloader mark the bank it entered and set the word
to 2, so recovery R runs. The plan prints the next start and why before the
first write. The choices:
  next-start   the bank the next start enters (the default); when that is not
               known, every bank that holds an image
  a, b, r      one bank by name
  all          every bank that holds an image, so whichever the start enters
               runs the patch; the restore puts all of them back
A choice that leaves out the bank the next start enters is warned about and
runs; a bank the run cannot write (erased, another build, the two reads
disagree, stored under another key) is refused with the reason.

THE IMAGE IS THE CAMERA'S OWN — there is no image argument anywhere. The
backup gets each bank's firmware from the bank itself (two agreeing reads; the
2014 Compact stores it unencrypted, the others are decrypted with the camera's
own key, worked out from the backup), checks that its version is the one the
camera reports, and refuses a bank that holds anything but the stock firmware
(a frame-rate build is named, and the stock image goes back first). The
firmware it gets is kept in the run directory, so --resume needs no other
file.

THE RISK, PLAINLY: the write and the restore write BOOT banks. On real hardware a
bank whose write is interrupted fails the bootloader's check; a power loss
mid-write can need an SPI programmer. The backup checkpoint (written before
the first write) and the restore are the mitigation, not a guarantee. Run on
mains power, keep the run directory.

  --bank <choice>        next-start (default), a, b, r or all — which banks the run writes. With
                         --resume, chooses again before the write step has run
  --backup-only          run the read-only backup step and stop. Nothing is written to the camera. The
                         run directory holds the backup; --zip saves it as one file
  --zip <file>           write the run as one zip: preserve_run.json and every checkpoint file
                         the run has produced, the way the web app saves its run file
  --out <dir>            the run directory (default ./preserve-run)
  --yes                  skip the confirmations (required when stdin is not a tty): the one before
                         the camera is touched, and the one at the derived plan, before the first
                         write. --backup-only needs only the first
  --resume <dir>         continue the run in <dir> from its next step
  --from-step <id>       with --resume: start at a chosen step (its id, above). Refused when the
                         step's files are missing from the run directory (the write without the
                         backup files) or the step already completed; jumping past an incomplete
                         write warns loudly and then runs on your explicit assertion that the camera
                         holds the patch (the restore and the check keep their own checks on the
                         camera)
  --print-state <dir>    print the run's state, its next step, and whether the checkpoint files still
                         match what was recorded. Touches no camera
  --serial, --recipient, --chunk  as for the other commands (--chunk sets the whole-flash read's
                         request size)

Interrupted runs: Ctrl-C stops at the next safe point, leaves the previous
checkpoint standing, and exits 130. Re-run the same --resume command to
continue; the interrupted step starts over.

A planned stop: when the start after the whole-flash read's restart enters a
bank this run did not patch (a --bank choice that left out the bank the next
start enters), the read stops before it reads anything, the run records the
restore as its next step, and the command exits 3 (not 1: nothing failed).
Continue with the restore: seek-fw preserve --resume <dir>.

Exit status: 0 the run (or --backup-only's backup) finished, 1 a step failed or
was refused, 2 bad usage, 3 stopped as planned (resume it to go on), 130
interrupted.

Artifacts in the run directory: preserve_run.json (the state, rewritten after
every step), preserve_backup_windows.bin, and per bank the run can write
preserve_bank_<a|b|r>_capture.bin (its two agreeing reads),
preserve_bank_<a|b|r>_plain.bin (its firmware, as plain bytes) and
preserve_bank_<a|b|r>_patched.bin; preserve_dump_patched.bin (the whole flash
as read, with the patch in it), preserve_dump_original.bin (the complete image,
with the original firmware put back in), preserve_verify_windows.bin (the
verify step's second read of the 31 blocks),
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
  seek-fw decrypt file <dump> [--out <dir> | --zip <file>] [--family <id>]
  seek-fw decrypt slot <file> [--out <dir> | --zip <file>] [--family <id>]

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

  --family <id>          decrypt under this family instead of the one the file's own
                         images point to
  --out <dir> | --zip <file>  where the output goes (default: a timestamped directory)

${EVERY_COMMAND}
`,
  slots: `seek-fw slots — the Work with firmware slots tab: the three banks, one at a time

Usage
  seek-fw slots list [--serial <id>] [--json]
  seek-fw slots dump <a|b|r> [--out <dir> | --zip <file>] [options]
  seek-fw slots flash <a|b|r> <file> [--raw] [--yes] [--acknowledge-risk]
                                     [--no-verify] [--dry-run] [--dump-dir <dir>] [options]
  seek-fw slots copy <from> <to> [--yes] [--acknowledge-risk] [--no-verify]
                                 [--dry-run] [--dump-dir <dir>] [options]
  seek-fw slots restore <a|b|r> <full-flash-file> [--yes] [--acknowledge-risk]
                                 [--no-verify] [--dry-run] [--dump-dir <dir>] [options]
  seek-fw slots patch-fps <a|b|r|all> [--write] [--yes] [--acknowledge-risk]
                                      [--no-verify] [--dump-dir <dir>] [options]

Banks: the locked 0.x/1.x line (the 2014 chain, and the 2016 keystream line of
1.0.3.0 and 1.0.3.2) has slot A at 0x14050000, slot B at 0x14060000 and recovery R
at 0x14070000. The 4.x line (Compact 4.8.x, Compact PRO 4.9.x) has slot A at
0x14030000, slot B at 0x14050000 and recovery R at 0x14070000. Builds
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
  copy     write bank <to> with the firmware bank <from> holds, as the slots read
           decrypted it, staged as any decrypted image is; whatever <to> holds now
  restore  write one bank as a full flash backup holds it, a .bin or a .zip: a
           whole 4 MiB flash image (such as a J-Link read), or a .zip that holds
           one: a Preserve run file (preserve_dump_original.bin), or the zip a
           Dump & decrypt 4.x/Nano (flash_dump_original.bin) or a Dump all
           selectors (flash_dump_all_selectors.bin) saves. The bank is cut out at
           its address, decrypted, planned and written, and the read-back is
           compared with the backup's stored bytes. A backup from another camera,
           or of another firmware, is a warning; a bank that is empty in the
           backup, or that the dump did not read, cannot be restored by a write
  patch-fps  raise the bank's frame rate by editing its bytes. To 32 fps: the Compact 0.8.0.0,
           0.9.0.2, 0.9.0.6, 0.9.0.7, 0.9.1.0, 0.10.0.0, 1.0.0.0, 1.2.0.0, 1.3.0.0 and 1.3.0.8
           builds on the plain 2014 chain, and the Compact 4.8.1.7, 4.8.1.9 and 4.8.2.1 (the
           Compact XR 4.8.2.1 too) builds under Key A. To 18 fps: the Compact PRO 4.9.1.15
           and 4.9.2.0 builds under Key A, and the Compact PRO 1.0.3.0 and 1.0.3.2 builds on
           the 2016 keystream line. Other lines
           refuse with the reason. 'all' patches every bank that offers it, in one
           confirmation, the bank the camera boots now last; the first failure stops
           the rest. A dry run unless --write: it prints the plan and sends nothing.
           --write writes the patched image and reads it back (on Key A and on the
           2016 keystream line, the read-back is checked as the decrypted image).

Every write (flash, copy, restore, patch-fps --write) saves its bank first, as
one zip: seek_backup_<time>_<serial>_v<firmware>_bank-<bank>_<write>.zip, the
same zip the page downloads, holding the bank as stored, its decrypted image and
a note of what each file is. The write waits for the zip to be on disk.

  --dump-dir <dir>       flash, copy, restore, patch-fps: the folder the backup zip is saved
                         into before the write (default: the current directory; an existing
                         file is never replaced)
  --write                patch-fps: send the patch. Without it the command is a dry run
  --raw                  flash: the file is prepared bytes, staged verbatim
  --acknowledge-risk     flash, copy, restore, patch-fps: needed to write the bank the camera
                         boots now, or recovery R. Without it the write is refused, and nothing
                         is sent
  --no-verify            flash, copy, restore, patch-fps: skip the read-back after the commit
  --dry-run              flash, copy, restore: print the plan and send nothing to the bank
  --yes                  flash, copy, restore, patch-fps --write: skip the confirmation
                         (required when stdin is not a tty)
  --family <id>          act under this family instead of the one the camera answers for
  --out <dir> | --zip <file>  dump: where the bank goes

An EMPTY bank (its header window reads as all 0xFF, as on many 2014 cameras'
slot B) is a state, not an error. list shows it as 'empty'; dump returns the raw
64 KiB of 0xFF (seek-slot-<bank>-empty-<sha8>.bin) and says there is nothing to
decrypt; flash writes it like any other bank, and the plan says nothing is
overwritten. To give it the firmware another bank holds, copy that bank into it
(seek-fw slots copy <from> <to>).

After a flash, unplug the camera and plug it back in: a bank is only used when
the camera boots, so the new image runs after the next start.

${EVERY_COMMAND}
`,
};

export function usageFor(command: CommandName | null): string {
  return command === null ? MAIN_USAGE : COMMAND_USAGE[command];
}
