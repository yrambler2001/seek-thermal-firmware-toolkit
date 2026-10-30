/**
 * Namespace `v4`, English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/V4View.tsx, hooks/useDumpPanel.ts, components/CameraIdentity.tsx,
 * components/OpcodeTable.tsx, components/OptionsDetails.tsx, lib/options.ts.
 *
 * src/i18n/README.md has the conventions.
 */

import type { NamespaceMessages } from '../../types';

export default {
  /* hooks/useDumpPanel: the status line. */
  'status.starting': 'Starting ...',
  'status.building': 'Building archive ...',
  'status.cancelling': 'Cancelling — will save whatever has been read so far ...',
  'status.refused': 'Refused — nothing was read. See the message above the log.',
  'status.sweepDone':
    'Done — {armed}/{total} selectors armed, {withData} with data. Check your downloads.',
  'status.sweepDoneCancelled':
    'Done — {armed}/{total} selectors armed, {withData} with data (cancelled). Check your downloads.',
  'status.dumpDone': 'Done — {read}/{expected} windows read. Check your downloads.',
  'status.dumpDoneCancelled':
    'Done — {read}/{expected} windows read (cancelled). Check your downloads.',
  'status.dumpDoneIncomplete':
    'Done — {read}/{expected} windows read (incomplete — see the log). Check your downloads.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'The camera did not match the 4.x/Nano family, and this tab reads only that family. Nothing was read. For a 0.x or 1.x camera (2014 or 2016 builds), use "{tab}".',
  'refusal.otherFamily':
    'The camera looks like {name} ({id}), not a 4.x/Nano camera, and this tab reads only 4.x/Nano. Nothing was read. For a 0.x or 1.x camera (2014 or 2016 builds), use "{tab}".',
  'refusal.legacyLine':
    'The camera runs {version}, a 0.x or 1.x build (2014 or 2016), and this tab reads only 4.x/Nano. Nothing was read but the version. For a 0.x or 1.x camera, use "{tab}".',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Dump',
  'dump.actions': 'Dump actions',
  'dump.start': 'Start dump',
  'dump.panel': 'Dump',
  'dump.how':
    'Both first ask the camera which firmware it runs: its version, with `{getInfo}` — the one read every Seek build answers the same way — and, only if that build can be read over USB, one plain and one token-carrying `{begin}` and a single read. That is how the page tells which family the camera is. This tab reads the 4.x and Nano family only. A camera the answers place anywhere else is refused before anything is read, and the page names the tab for it. A camera that does not report its version, or runs a build older than 0.8.0.0, is not read at all, and the page says why.',
  'dump.modes':
    "**Start dump** reads every block the build's own selector table reaches. **Dump all selectors**, in *Options* below, probes every `{begin}` selector `{first}`–`{last}` and saves whatever each one returns — slower, but it also captures blocks the curated map skips.",
  'dump.sweep': 'Dump all selectors ({first}–{last})',
  'dump.sweepNote':
    'Probes every selector and saves whatever each one returns. Slower than Start dump.',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'What you get',
  'output.intro': 'A single `{ext}` download containing:',
  'output.caption': 'Files inside the downloaded archive',
  'output.file': 'File',
  'output.what': 'What it is',
  'output.flash':
    'the assembled 4 MiB flash image (the gap fill and the unlock token, if used, are in manifest.json)',
  'output.windows': 'each 64 KiB block exactly as it came off the wire',
  'output.decrypted': 'every firmware image slot, decrypted (if a key was found)',
  'output.reports': 'per-slot report: key, key location, family and cipher, SP, entry, SHA-256',
  'output.manifest': 'exact read/gap/decryption metadata',
  'output.readme': 'what the capture is and what its limits are',
  'output.keyFromDump':
    'The key is recovered from the dump itself, so no key file or device secret is needed.',
  'output.bestEffort':
    'Decryption is still best-effort. If no key is found — for example on a unit whose bootloader derives the key from chip OTP, which is not present in a flash dump — that slot is simply skipped and the rest of the archive is unaffected.',

  /* views/V4View: the read-only guarantee. Command names are params, in `code`. <link> wraps the Slots tab's name. */
  'readonly.title': 'Read-only guarantee',
  'readonly.intro':
    'This page can issue exactly six vendor commands. That is its entire vocabulary — there is no code path to anything else:',
  'readonly.caption': 'The six read-only vendor commands',
  'readonly.absent':
    '`{setData}`, `{complete}`, `{reset}` and every upload, commit and erase command are absent from this view. `{usbReset}` is never called either; the retry path just closes and reopens the handle. Decryption happens entirely in memory on the copy in your browser and never touches the device.',
  'readonly.writing':
    'Writing to the camera lives on another tab, <link>{tab}</link>, which writes one bank at a time and asks before every write. Nothing on *this* tab can reach those commands.',
  'readonly.firstReads':
    'Until the camera has reported its firmware version, only three of the six are sent, and only as reads: `{getInfo}`, `{getMode}` and `{getError}`. They are the reads that sit at the same command number, with the same meaning, in all 36 firmware images examined; a command number does not mean the same thing on every build, so nothing else goes out until the build is known.',
  'gap.summary': 'The {address} gap',
  'gap.where':
    'The USB command set exposes a read-window selector for every 64 KiB block of the 4 MiB flash except `{range}`. That block is filled with `{fill}` in the combined image and recorded in `{manifest}`.',
  'gap.costs':
    '**In practice this costs you nothing.** On most cameras that block is simply erased flash, which reads as `{fill}` anyway — so the filler matches what is really there and the image is complete.',
  'gap.redundant':
    'And when the block *is* in use, what it holds is a redundant copy. These cameras keep the same firmware image in several 64 KiB slots: across every multi-slot dump checked while building this page, all slots decrypted to byte-identical firmware — in one case across four slots that had been written with two different keys. On the one unit seen with a real image at `{address}`, it was byte-for-byte the same as the copies at `{before}` and `{after}`, so the archive still contains that firmware, just read from a different address.',
  'gap.fine':
    'That redundancy is also why a camera whose `{address}` reads back as `{fill}` is fine: the bootable firmware still exists in the other slots. Nothing on this page writes to the device in any case — the gap affects only the file you download.',
  'gap.complete':
    'If you do want a strictly complete byte-for-byte image — to diff flash against a reference, say — read it over SWD/J-Link or with an SPI programmer.',

  /* components/OpcodeTable. Opcodes, names and IN/OUT stay as they are. */
  'opcodes.opcode': 'Opcode',
  'opcodes.name': 'Name',
  'opcodes.dir': 'Dir',
  'opcodes.why': 'Why it is used',
  'opcodes.getInfo':
    "the running firmware version, read first: it decides which build's selector table the dump uses, and a camera that does not report one is not read",
  'opcodes.getError': 'check status after each step',
  'opcodes.setMode': 'only to select mode 0, and only if not already there',
  'opcodes.getMode': 'read the current mode',
  'opcodes.getData': 'the actual flash read',
  'opcodes.begin':
    'volatile read-window selector only — it selects which 64 KiB block the next reads return, and writes nothing',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': 'Not read: the camera did not say which firmware it runs.',
  'identity.unsupported': 'Not read: this camera cannot be read this way.',
  'identity.title': 'Detected camera',
  'identity.firmware': 'Firmware',
  'identity.scoreBasis': "from the camera's answers, before any bank is read",

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Options',
  'options.subtitle': '— the defaults are correct; you do not need to change anything here.',
  'options.chunk': 'chunk (control-IN bytes)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'gap-fill byte',
  'options.retries': 'retries per window',
  'options.retryDelay': 'retry delay (ms)',
  'options.recipient': 'control transfer recipient',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'auto',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'decrypt firmware',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'yes',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'no',
  'options.help':
    "**chunk** is the size of each control-IN read, at most 64: one EP0 packet. A longer read can lose a packet to the camera's boot ROM when the camera idles at a low clock, so a larger value is read 64 bytes at a time; a smaller one is used as given, and if a camera stalls the page drops lower on its own and carries on. **gap-fill** is the byte written into the one 64 KiB block USB cannot reach. **recipient** defaults to interface and falls back to device if the browser cannot claim interface 0 — the firmware accepts both.",
  'options.chunkRange': 'chunk must be between 1 and {max}, got {value}',
  'options.gapFillByte': 'gap-fill must be a single byte, got {value}',
  'options.retriesMin': 'retries must be zero or more, got {value}',
  'options.retryDelayMin': 'retry delay must be zero or more, got {value}',
} as const satisfies NamespaceMessages;
