/**
 * Namespace `slots`, English source: the firmware-slots tab.
 *
 * Owner: phase 2, slots agent.
 * Covers: views/SlotsView.tsx, hooks/useSlotsPanel.ts, components/SlotTable.tsx, SlotFpsConfirm.tsx,
 * SlotFpsEveryConfirm.tsx, SlotWriteConfirm.tsx, SlotFlashPreview.tsx, SlotWriteKeys.tsx.
 * (components/DeviceInfoPanel.tsx is done: its text is in `shared`, deviceInfo.*.)
 *
 * Words used all over this tab:
 * - bank = one of the camera's three firmware slots, A, B and R. R = the recovery slot, the
 *   last-resort copy the bootloader falls back to.
 * - {bank} is a bank's name from common:bank.* ("Slot A", "Recovery R" on its own; "slot A",
 *   "recovery R" inside a sentence). {a}, {b}, {r} are those names inside a sentence; {letter},
 *   {letterA}, {letterB}, {letterR} are the bare letters A, B and R (keep them Latin).
 * - booted = the bank the camera started from (the firmware it runs now).
 * - write / flash = erase a bank and program a new image into it. Commit = the camera's last step of a
 *   write, after which the bank may be changed.
 * - read-back = the bank read again after a write, to compare with what was sent.
 * - "Flash decrypted image", "Read slots", "Dump"… in quotes or bold are this tab's own buttons
 *   (table.flashPlain, actions.read, table.dump): use the same words as those keys.
 * - Hz values, firmware versions (0.8.0.0, 1.3.0.8), 0xFF, .bin/.zip, SWD/J-Link and SPI stay as they
 *   are. Key A / Key B: translate "Key", keep the letter. KiB/MiB are written KB/MB (README, Units).
 *
 * src/i18n/README.md has the conventions.
 */

import type { NamespaceMessages } from '../../types';

export default {
  /* The section: its heading, badge and one-line summary. */
  'section.title': 'Work with firmware slots',
  'section.badge': 'Writes to flash',
  'section.description':
    'Read slots asks the camera what it runs and reads its three firmware banks — {a}, {b} and {r} — and shows what each holds. Reading and dumping change nothing. A flash button asks before any byte is sent.',
  /* The red warning at the top of the tab. */
  'section.danger':
    "**This page can write to the camera's flash.** A write erases one 64 KiB bank and programs it. An image that is structurally valid but does not run leaves the camera unbootable, and the bootloader has no USB — only SWD/J-Link or an SPI programmer can recover it. Dump the bank first and keep the file.",

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Slot actions',
  'actions.read': 'Read slots',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Slots',

  /* Before any read. */
  'empty.connected':
    'Press Read slots. The camera is asked which build it runs first, and nothing is armed on a build this page does not support.',
  'empty.disconnected': 'Connect the camera, then press Read slots.',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'This build is not supported here, so no bank was read and none can be written.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Not identified: this page cannot tell which build the camera runs.',
  'refusal.notIdentified.body':
    'The camera gave no usable firmware version, so no bank was read and nothing was armed. This page covers builds {minVersion} and newer. Builds before {minVersion} are outside what the slots page supports, so a camera on one of them is never read here.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'If the camera runs a supported build, it may only be starting up. {hint}',
  'refusal.title': 'Refused — nothing was armed.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Reading ...',
  'status.readingAgain': 'Reading the banks again ...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Read. {read}/{count} bank read.',
    other: 'Read. {read}/{count} banks read.',
  },
  'status.unsupported': 'Not supported on this build — no bank was read.',
  'status.refused': 'Refused — nothing was armed. See the message below the log.',
  'status.disconnected': 'Device disconnected — read the slots again.',
  'status.newDevice': 'New device selected — read the slots again.',
  'status.dumping': 'Dumping {bank} ...',
  'status.dumped': 'Dumped {bank}.',
  'status.readingImage': 'Reading image ...',
  'status.ready': 'Ready — review the plan, then write it.',
  'status.rejected': 'Rejected — see the log above.',
  'status.writing': 'Writing ...',
  'status.patching': 'Patching {bank} ...',
  'status.patchingEvery': 'Patching every bank ...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Written, but the read-back does not match — see the result.',
  'status.written.verified': 'Written. The bank reads back as written.',
  'status.written.notCompared': 'Written. The read-back was not compared — see the result.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Patched, but the read-back does not differ only as planned — see the result.',
  'status.patched.ok': 'Patched. The bank reads back as planned.',
  'status.patched.unchecked': 'Patched. The read-back was not checked — see the result.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Stopped at {bank} — {count} bank patched; see the result.',
    other: 'Stopped at {bank} — {count} banks patched; see the result.',
  },
  'status.every.unchecked': {
    one: 'Patched {count} bank, but a read-back was not checked as planned — see the result.',
    other: 'Patched {count} banks, but a read-back was not checked as planned — see the result.',
  },
  'status.every.ok': {
    one: 'Patched {count} bank. Each reads back as planned.',
    other: 'Patched {count} banks. Each reads back as planned.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Cancelled — nothing was written.',
  'status.cancelled.one':
    'Cancelled after the commit to {bank} was sent — the bank may be partly written. Read it before relying on it.',
  'status.cancelled.many':
    'Cancelled after the commits to {banks} were sent — each may be partly written. Read them before relying on them.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Connect the camera first.',
  'gate.busy': 'Another operation is running — wait for it to finish.',
  'gate.readFirst': 'Read the slots first.',
  'gate.cameraRefused':
    'This camera cannot be written from here, for the reason in the banner above. Nothing is sent.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Not read: {reason}. Read the slots again before writing it.',
  'gate.notReadNoReason':
    'Not read: this bank was not read. Read the slots again before writing it.',
  'gate.emptyNotWritable': 'This bank is empty and cannot be written on this build: {reason}',
  'gate.noSuchBank': 'This build has no such bank.',

  /* The bank table. */
  'table.caption':
    'Each firmware bank on this camera — {a}, {b} and {r} — as read and checked in the browser',
  'table.col.bank': 'Bank',
  'table.col.firmware': 'Firmware',
  'table.col.size': 'Size',
  'table.col.key': 'Key',
  'table.col.bootable': 'Bootable',
  'table.col.sha': 'SHA-256 of plaintext',
  'table.col.actions': 'Actions',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'not read — {reason}',
  'table.notReadNoReason': 'not read — the bank was not read',
  /* A badge: the bank holds no image. */
  'table.empty': 'empty',
  'table.emptyNote':
    "No image: this bank's header window reads as all 0xFF, so nothing is decrypted from it and writing it overwrites no firmware.",
  /* {why} and {reason} are core's. */
  'table.emptyWritable': 'Can be written. {why}',
  'table.emptyNotWritable': 'Cannot be written on this build: {reason}',
  'table.unknownVersion': 'unknown version',
  /* {id} is the image id in hex. */
  'table.imageId': 'image {id}',
  'table.noImage': 'no image',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': '{size} B bank',
  'table.imageSize': 'image {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'none (plaintext)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— nothing to boot',
  'table.boot.bootable': 'bootable — the bootloader can key it',
  'table.boot.notBootable': 'not bootable — skipped at boot',
  'table.boot.recoveryOnly':
    'recovery only — {letterR} runs when {letterA} and {letterB} hold nothing the bootloader takes (measured on a camera for an earlier form of this image); whether this form starts is untested',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'unknown — {why}',
  /* The row's buttons. */
  'table.dump': 'Dump',
  'table.flashPlain': 'Flash decrypted image…',
  'table.flashRaw': 'Flash raw bytes…',
  'table.restore': 'Restore from full flash backup (.bin or .zip)…',
  'table.makeFps': 'Make {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Copy to {bank}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: off',
  'table.copyNote':
    'Copies the firmware this bank holds, as this read decrypted it, into the bank you pick, whatever that bank holds now. You review the plan before anything is sent.',
  'table.restoreNote':
    'Pick a full flash backup: a .bin (a whole 4 MiB flash image, such as a J-Link read) or a .zip that holds one (a Preserve run file, or the zip a Dump & decrypt 4.x/Nano or a Dump all selectors saves). This bank is cut out of it, decrypted, and shown as a plan before anything is sent.',
  'table.fpsNote':
    'Raises this bank from {fromHz} Hz to {toHz} Hz by editing its bytes. The bank is saved first, in a zip download, and the decrypted file in it is the way back.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery': '{booted}, and recovery: writing it asks for an extra confirmation.',
  'table.risk.booted': '{booted}: writing it asks for an extra confirmation.',
  'table.risk.recovery': '{bank}: writing it asks for an extra confirmation.',
  'table.risk.bootUnnamed':
    'The camera does not name its booted bank: writing it asks for an extra confirmation.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Frame-rate patch applied: this image runs at {hz} Hz.',
  'fps.earlierPatch':
    'Frame-rate patch not offered: this bank holds an earlier {hz} Hz patch without the USB fix. Restore the stock image, then Make {hz} FPS.',
  'fps.atRate': 'No frame-rate patch needed: this build already runs at {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Frame-rate patch not offered: {reason}',
  'fps.readFirst': 'read the slots first — the patch is planned from the bank’s own image',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Every bank',
  'everyBank.make': 'Make {hz} FPS in every bank',
  'everyBank.faster': 'Make every bank faster',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Patches {order} in one confirmation; each is saved first, in one zip download, and read back.',
  'everyBank.noteBootedLast':
    'Patches {order} in one confirmation, the bank the camera boots now last; each is saved first, in one zip download, and read back.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': "{bank}'s image",
  'what.restore': '{bank} of {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Prepared for {bank} at {address}',
  'preview.file': 'File',
  'preview.source': 'Image taken from',
  'preview.target': 'Target',
  'preview.targetEmpty': '{bank} is empty: it holds no image, so this write overwrites no firmware',
  'preview.readAs': 'Read as',
  'preview.readAs.ff': 'a decrypted {version} FF image',
  'preview.readAs.plain': 'a decrypted image',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'raw bytes',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Staging',
  'preview.key': 'Key',
  'preview.payload': 'Payload',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} B in {count} chunk of up to {chunk} B',
    other: '{size} B in {count} chunks of up to {chunk} B',
  },
  'preview.checksum': 'Transfer checksum',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Stored afterwards',
  'preview.storedNotPredicted': 'not predicted — the read-back is the check',
  'preview.storedPredicted': '{size} B predicted',
  'preview.storedKeyB': '{size} B predicted — the image XOR Key B, not the payload itself',
  'preview.savedFirst': 'Saved first',
  'preview.compareCaption': 'What changes in {bank}',
  'preview.col.field': 'Field',
  'preview.col.now': 'Now',
  'preview.col.after': 'After the write',
  'preview.readFirst': 'Read before writing:',
  /* {note} is core's note about this write. */
  'preview.note': 'Note: {note}',
  'preview.nothingSent':
    'Nothing has been sent to the camera yet. Writing streams this payload to {bank} and commits it.',
  'preview.toolbar': 'Write actions for {bank}',
  'preview.write': 'Write to {bank}…',
  'preview.discard': 'Discard',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Write {what} to {bank} at {address}?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Writing it replaces the firmware the camera is running now. If the new image does not run, the camera may not boot at all.',
  'writeConfirm.recovery':
    '{bank} is the recovery bank, the last-resort copy the bootloader falls back to. Writing it leaves the camera without that copy until it is restored.',
  'writeConfirm.bootUnnamed':
    'The camera does not say which bank it boots, so {bank} is treated as the bank it boots now. Writing it can replace the firmware the camera is running.',
  'writeConfirm.empty': '{bank} is empty: it holds no image, so no firmware is overwritten.',
  'writeConfirm.eraseEmpty':
    "The write still erases the 64 KiB block of the camera's flash at {bank} (already blank) and programs it.",
  'writeConfirm.erase':
    "This erases a 64 KiB block of the camera's flash and programs it at {bank}.",
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'The image is written under {key}. Every other bank is written the same way.',
  'writeConfirm.backup':
    'Before anything is sent, {bank} is read again and saved as one zip download: {file}. Check your downloads folder for it.',
  'writeConfirm.noReset':
    'No reset is sent. Unplug and replug the camera afterwards for the bank to take effect.',
  'writeConfirm.noUsbRecovery':
    'If the image does not run, the camera cannot be recovered over USB — only with SWD/J-Link or an SPI programmer.',
  'writeConfirm.ackUnnamed':
    'I understand the camera does not say which bank it boots, so this one is treated as the booted one, and that a bad image can leave the camera unbootable.',
  'writeConfirm.confirm': 'Yes — write to {bank}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'I understand this is the bank the camera boots now, and that a bad image can leave the camera unbootable.',
  'ack.recovery':
    'I understand this is the recovery bank, and that a bad image leaves the camera without a last-resort copy.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Make {bank} run at {hz} FPS?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted': '{bootsNow}. The patched image replaces the firmware it runs now.',
  'fpsConfirm.recovery':
    '{bank} is the recovery bank, the last-resort copy the bootloader falls back to.',
  'fpsConfirm.what':
    '{bank} holds firmware {version}, and this makes its image run at {toHz} Hz instead of {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(unknown)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'The patch changes {count} byte of the image and the acceptance-sum word, so the sum the bootloader checks is kept. The key pair is not touched.',
    other:
      'The patch changes {count} bytes of the image and the acceptance-sum word, so the sum the bootloader checks is kept. The key pair is not touched.',
  },
  'fpsConfirm.wayBack':
    'The decrypted file in that zip is the way back: to undo the patch, write it with "Flash decrypted image" on {bank}.',
  'fpsConfirm.noReset':
    'No reset is sent. Unplug and replug the camera afterwards for the patched bank to take effect.',
  'fpsConfirm.ackUnnamed':
    'I understand the camera does not say which bank it boots, so this one is treated as the booted one.',
  'fpsConfirm.confirm': 'Yes — patch {bank}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Make every bank run at {hz} FPS?',
  'fpsEvery.titleMixed': {
    one: 'Patch the frame rate of {count} bank?',
    other: 'Patch the frame rate of {count} banks?',
  },
  'fpsEvery.intro': {
    one: 'This patches {count} bank where the patch is available, of firmware {version}:',
    other: 'This patches {count} banks where the patch is available, of firmware {version}:',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery': '{bank} (the bank this camera boots now, and the recovery bank)',
  'fpsEvery.role.booted': '{bank} (the bank this camera boots now)',
  'fpsEvery.role.recovery': '{bank} (the recovery bank, the last-resort copy)',
  'fpsEvery.role.bootUnnamed': '{bank} (the camera does not say which bank it boots)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: {fromHz} Hz to {toHz} Hz, {count} byte and the acceptance-sum word.',
    other: '{bank}: {fromHz} Hz to {toHz} Hz, {count} bytes and the acceptance-sum word.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Left as they are: {others}',
  'fpsEvery.orderOne': 'It writes {bank} alone, and reads it back.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'They are written in this order: {order}. Each is read back before the next, and the first failure stops the rest.',
  'fpsEvery.orderBootedLast':
    'They are written in this order: {order}. The bank the camera boots now goes last, so a failure stops before it. Each is read back before the next, and the first failure stops the rest.',
  'fpsEvery.wayBack':
    'The decrypted files in that zip are the way back: to undo the patch of a bank, write its file with "Flash decrypted image" on that bank.',
  'fpsEvery.noReset':
    'No reset is sent. Unplug and replug the camera afterwards for the patched banks to take effect.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'I understand this writes {banks}, and that a bad image can leave the camera unbootable.',
  'fpsEvery.confirm': { one: 'Yes — patch {count} bank', other: 'Yes — patch {count} banks' },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: the bank reads back as written.',
  'outcome.mismatch': '{bank} — {what}: the read-back does NOT match what was written.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: the read-back was taken but not compared, so this write is not verified here.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': "The camera's commit returned status {status}.",
  'outcome.wasEmpty': '{bank} was empty before this write, so no firmware was overwritten.',
  'outcome.provenVerified':
    'Proven so far: the payload was streamed and committed, and the bank reads back as written. NOT proven: that the bootloader will select this bank, or that the image runs.',
  'outcome.provenCommitted':
    'Proven so far: the payload was streamed and committed. NOT proven: that the bootloader will select this bank, or that the image runs.',
  'outcome.replug':
    '**NOW UNPLUG AND REPLUG THE CAMERA.** No reset was sent, so the bank only takes effect after a real power cycle. Then read the slots again: the version and the active bank the camera reports are the only thing that settles it.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**NOW UNPLUG AND REPLUG THE CAMERA.** No reset was sent. Then read the slots again.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Saved first, as a download: {file}.',
  'outcome.wayBackOne':
    'The decrypted file in it is the way back ("Flash decrypted image" on the same bank).',
  'outcome.wayBackMany':
    'The decrypted files in it are the way back ("Flash decrypted image" on each bank).',
  'outcome.checkDownloads': 'Check your downloads folder for it.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank} — patched from {fromHz} Hz to {toHz} Hz (firmware {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'The read-back differs from the saved dump only at the {count} planned byte, the sites and the sum word.',
    other:
      'The read-back differs from the saved dump only at the {count} planned bytes, the sites and the sum word.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'The read-back does NOT differ only as planned: {unexpected} unexpected and {count} missing byte.',
    other:
      'The read-back does NOT differ only as planned: {unexpected} unexpected and {count} missing bytes.',
  },
  'fpsOutcome.notTaken': 'The read-back was not taken, so the patch is not checked here.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Every bank: {done} of {count} patched, in this order: {order}.',
    other: 'Every bank: {done} of {count} patched, in this order: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'The read-back differs from the saved bank only at the {count} planned byte.',
    other: 'The read-back differs from the saved bank only at the {count} planned bytes.',
  },
  'fpsEveryOutcome.notTaken': 'The read-back was not taken.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Stopped: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Not written: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'No bank of this camera can be written from here.',
  'keys.title': 'Keys for the writes',
  'keys.chain': 'Chain',
  'keys.chainPlain': 'the 2014 plaintext chain: every bank is stored plain, so none holds a key',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Written as',
  'keys.writtenPlain': 'the image as it is, with no key, to any bank',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Staged as',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Stored as',
  'keys.refused': 'Refused',
  'keys.bootedBank': 'Booted bank',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank} holds {key}',
  'keys.theBootedBank': 'the booted bank',
  'keys.unnamedKey': 'a key the page cannot name',
  'keys.bootedBanksKey': 'the booted bank’s key',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; every bank is written the same way',

  /* "What these buttons do", below the tab. */
  'how.title': 'What these buttons do',
  'how.read':
    '**Read slots** and **Dump** change nothing in the camera. The camera is asked which build it runs before anything else; a build older than {minVersion} is reported, and its banks are not read.',
  'how.flash':
    "**Flash decrypted image** takes a plaintext image, encrypts it the way that bank's firmware needs before it is staged, and shows the plan. **Flash raw bytes** stages the file exactly as given. Neither sends anything until you confirm.",
  /* FF = the 16 Hz "FF" build of the Compact; the vendor app = Seek's own phone app. */
  'how.ff':
    "A Compact on 1.3.0.8 can be the 8 Hz build or the 16 Hz FF build, and both report the same version. The camera tells them apart itself: its own answer for each bank says whether the application that answers takes it, and each build predicts its answers. The 8 Hz image goes to any bank. The FF image is staged the way the vendor app stages it (the image XOR Key A), and the 16 Hz build stores it under Key B, to any bank. The page does not refuse it: the plan says, before you confirm, what the camera is expected to do with it (the 8 Hz build refuses it at commit, and a camera on another version programs it as it is sent, which it cannot start). Whether the FF image boots is UNTESTED: no genuine bootloader for this build is in the corpus. Writing {letterR} asks for the extra confirmation like any recovery write. An **empty** bank (its header window reads as all 0xFF, as on many 2014 cameras' {b}) is a state, not a fault. It dumps as the raw 64 KiB of 0xFF with nothing to decrypt, and it is written exactly like any other bank; the plan and the confirmation say that no firmware is overwritten.",
  /* {copyA}, {copyB}, {copyR} are the three copy buttons' own labels (table.copyTo: "Copy to slot A"…). */
  'how.copy':
    "**{copyA}**, **{copyB}** and **{copyR}** on a bank row write the firmware that bank holds, as this read decrypted it, into the other bank, whatever it holds now. The image is staged as any decrypted image is, so the plan and the confirmation are the same as for a file. **Restore from full flash backup** takes a .bin (a whole 4 MiB flash image, such as a J-Link read) or a .zip that holds one (a Preserve run file, or the zip a Dump & decrypt 4.x/Nano or a Dump all selectors saves), cuts this bank out of it, decrypts it, and shows the plan; a backup that looks like another camera's, or another firmware, is said in the plan. A bank that is empty in the backup, or that the dump did not read, cannot be restored by a write, and the page says so.",
  'how.fps':
    "**Make N FPS** on a bank row edits that bank's image to a higher frame rate, and **Make N FPS in every bank** does it to every bank where the patch is available, in one confirmation, the bank the camera boots now last. For a bank where it is not available, the page says why.",
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    "**Every write saves its bank first**: the bank is read again and saved as one zip download, named with the time, the camera's serial, the firmware, the bank and the write (for example `{example}`), holding the bank as stored, its decrypted image and a note of what each file is. The write waits until the download has started. A browser gives no word when a download reaches the disk, so check your downloads folder. To go back, write the zip's decrypted file with **Flash decrypted image**.",
  /* {address} is the bootloader's flash address. */
  'how.write':
    'A write erases one 64 KiB bank and programs it. The bootloader at `{address}` and the boot config are never written here, and there is no control for choosing the active bank. The bank takes effect only after the camera is unplugged and replugged.',
} as const satisfies NamespaceMessages;
