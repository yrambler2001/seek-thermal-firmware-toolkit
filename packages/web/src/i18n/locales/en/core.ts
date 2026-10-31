/**
 * Namespace `core`, English source: sentences that `@seek-fw/core` makes and
 * the page shows. A key is a core message code (packages/core/src/message.ts):
 * core gives the page `{ code, params, text }`, and `coreText()`
 * (lib/core-text.ts) renders `core:<code>` with the params. English must
 * render to core's `text` word for word: i18n/core-messages.test.ts renders
 * every key here for representative inputs and compares, so the CLI and the
 * page keep saying the same thing in English. Don't reword a template here
 * without rewording core, and the other way round.
 *
 * For translators (the `core` namespace):
 * - Every value here is a sentence core also prints in English (the CLI, the
 *   logs, the copyable report). Translate the sentence; keep its `{params}`.
 * - Params that arrive ALREADY TRANSLATED (another core message, or a page word):
 *   - a bank: `{bank}`, `{name}`, `{first}`, `{second}`, `{last}`, `{target}`.
 *     Inside a sentence it is "slot A" / "recovery R" (common:bank.*InSentence);
 *     where the English starts a sentence or names a row it is the label form
 *     "Slot A" / "Recovery R". `{first}`/`{second}`/`{last}` in boot.rule may be
 *     a bare letter ("A").
 *   - a key name: `{key}`, `{held}`, `{holds}`, `{masks}` (keyName.*: "Key A",
 *     "per-device key", …; `{masks}` is several, joined with commas).
 *   - a nested sentence: `{why}`, `{reason}`, `{verdict}`, `{risk}`,
 *     `{untested}`, `{outcome}`, `{failure}`, `{answers}`, `{predicted}`,
 *     `{plain}`, `{ff}`, `{reference}`, `{recovered}`, `{check}`, `{phrase}`,
 *     `{staged}`, `{source}`, `{operation}`, `{error}`, `{label}`, `{writable}`,
 *     `{next}`, `{form}`, `{notes}`, `{remedy}`, `{capability}`, `{pair}`
 *     (report.checkKey.pair, or nothing), `{said}` (detect.source.*), `{context}`, and `{note}` in
 *     preserve.refused.recoveryOnly and identity.versionUnknown. Each is another key of
 *     this namespace (the comment above a key says which), already in your
 *     language. A `{why}` that starts a sentence arrives with a capital letter.
 *   - a list: `{banks}`, `{reasons}`, `{masks}`, `{files}`, `{sites}`, `{places}`,
 *     `{context}`, `{notes}` (joined with your common:list.* words; where the
 *     English uses a semicolon, common:list.semicolon; `{reasons}` in
 *     writeRefusal.otherFamily is detect.* sentences).
 * - Params that stay AS THEY ARE: hex values and offsets (`{word}`, `{offset}`,
 *   `{sum}`, `{hex}`, `{address}`, `{at}`, `{status}`, `{magic}`, `{length}`,
 *   `{k}`, `{zero}`, `{block}`), byte counts (`{size}`, `{count}`, `{kib}`), mode numbers (`{mode}`),
 *   a score (`{score}`), firmware versions (`{version}`, `{image}`, `{camera}`,
 *   `{firmware}`, `{builds}`, `{only}`, and `{first}` in support.* and detect.*), file
 *   names (`{file}`), a SHA-256 (`{sha256}`), a selector table's name
 *   (`{table}`) and family names (`{family}`, `{detected}`).
 * - Still English inside a translated sentence (core gives them no code yet):
 *   `{error}` when the error has no code (a USB error, a ZIP reader's error,
 *   a bug, or a refusal only a broken run file reaches, such as the patch
 *   builder's own gates), a read reason (read.reason.*'s place) that came
 *   from such an error, `{signature}` in preserve.fail.* (it describes the
 *   bytes or the wire stall; people paste it to the owner), `{reasons}` in
 *   preserve.fail.spentReaderDerive, `{note}` in preserve.gate.drainRefused,
 *   `{gap}` in restore.refused.gap*, and `{mismatch}` in
 *   slots.image.keyMismatch.
 * - Capitals: keep the English's. A template that starts lower case is said
 *   inside another sentence or after a label ("Note: …", a list item, "Not
 *   read: …"); one that starts upper case stands alone.
 * - Names stay English: command names (GetFirmwareInfo, CompleteMemoryUpgrade,
 *   BeginFirmwareUpgrade), wire ids, mode numbers, header fields
 *   (`header.length`, "CODE"), PRESERVATION.md, UNTESTED.
 *
 * Owner: phase 3 (core messages). Phase 1 put the unlock note here as the
 * first entry.
 */

import type { NamespaceMessages } from '../../types';

export default {
  /** `UNLOCK_POWER_CYCLE_NOTE`; the page shows it as "Note: …." (app:unlockNote). */
  'unlock.powerCycleNote':
    'the camera stays unlocked until a power cycle, and other tools may misread it until then; power-cycle it before you use them',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': '{first} first, then {second}, then {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'was not read',
  'boot.verdict.checkKeyUnnamed':
    'could not be checked: the key its bootloader checks a bank under was not named',
  'boot.cfg0NotRead':
    'the boot-config word (cfg[0]) was not read, so the bank the next start runs is not known',
  'boot.select.unknown':
    'the boot-config word is {word}, so the bootloader tries {first} first, but {bank} {verdict}, so the bank that runs is not known',
  'boot.select.first':
    'the boot-config word is {word}, so the bootloader tries {first} first, and it holds an image the bootloader accepts',
  'boot.select.second':
    'the boot-config word is {word}, so the bootloader tries {first} first; {first} holds no image the bootloader accepts, so it takes {second}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'the boot-config word is {word}, so the bootloader tries {first} first; neither {first} nor {second} holds an image the bootloader accepts, so it boots {last}, which it does not check',
  'boot.select.lastTakes':
    'the boot-config word is {word}, so the bootloader tries {first} first; neither {first} nor {second} holds an image the bootloader accepts, so it takes {last}, which it does not check',
  'boot.bootsNow': '{bank} is the bank the camera boots now',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'booted now',
  'boot.notBooted': 'not booted',
  'boot.unknownWhy.checkKeyUnnamed':
    'the key its bootloader checks a bank under was not named on this read',
  'boot.unknownWhy.noKeyTable':
    "the bootloader's key table was not read, so the keys it tries cannot be named",

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'The camera boots {bank}. {why}.',
  'fpsBoot.holdsOne':
    '{bank} holds a frame-rate patch, but it does not run, so the patch does not take effect.',
  'fpsBoot.holdsTwo':
    '{banks} hold frame-rate patches, but neither runs, so the patches do not take effect.',
  'fpsBoot.wouldNotRun':
    'Patching {target} would not make it run, because the camera boots {bank} instead.',
  'fpsBoot.patchRunning':
    'Patch {bank} too (the bank that runs): that is what makes the frame-rate patch take effect.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank} cannot be patched here ({reason}), so a frame-rate patch in another bank does not take effect on this camera.',

  /* ---- backup: the zip saved before a bank write (slots/backup); `{name}` is the bank inside a sentence ("slot B"): each is an item of backup.plan.* ---- */
  'backup.bank.notInPlan': "{name} (not in this build's plan: the zip says so)",
  'backup.bank.unsupported': '{name} (this build cannot read it, {reason}: the zip says so)',
  'backup.bank.empty':
    '{name} (empty, every byte 0xFF: the zip says so, and the write overwrites no firmware)',
  'backup.bank.unread':
    '{name} (the slots read did not reach it: the zip says whether the read before the write does)',
  'backup.bank.noKey':
    '{name} (as stored; no key this read recovered opens it, so there is no decrypted file)',
  'backup.bank.decrypted': '{name} (as stored, and decrypted)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Before anything is written, {banks} is read again and saved in one zip with a note of what each file is: {file}.',
  'backup.plan.many':
    'Before anything is written, {banks} are read again and saved in one zip with a note of what each file is: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'encrypted so the device stores it under the key the booted bank holds',
  'staging.detail.slotKeystreamCiphertext':
    "encrypted under the image's own stage key (key block 0); the camera stores it under the bank's own key",
  'staging.detail.plain': 'plaintext, no cipher',
  'staging.detail.keyAKeystream':
    'the 1.3.0.8 FF image as the vendor app stages it (XOR Key A) — the 16 Hz build stores it under Key B, not these bytes',
  'staging.detail.verbatim': 'verbatim — the bytes exactly as given',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'no read',
  'copy.source.notInPlan': "{name} is not in this build's plan",
  'copy.source.notRead': '{name} was not read ({reason}), so there is no image to copy',
  'copy.source.empty': '{name} is empty: there is no image to copy',
  'copy.source.foreign':
    '{name} holds no firmware image this read recognises, so there is nothing to copy',
  'copy.source.noKey':
    'no key this read recovered opens {name}, so there is no decrypted image to copy',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} at {address}, as the slots read decrypted it',
  'copy.fromVersion': '{name} at {address}, firmware {version}, as the slots read decrypted it',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note': "The image is {name}'s, as the slots read decrypted it: {size} B, sha256 {sha256}.",
  'copy.noteVersion':
    "The image is {name}'s, as the slots read decrypted it: firmware {version}, {size} B, sha256 {sha256}.",

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': "the backup's {name} (at {address})",
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where} in the full flash backup {file}',
  'restore.fromVersion': '{where} in the full flash backup {file}, firmware {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'a 4 MiB flash image',
  'restore.kind.preserve-run': 'a Preserve run file',
  'restore.kind.dump': 'a Dump & decrypt 4.x/Nano zip',
  'restore.kind.all-selectors': 'a Dump all selectors zip',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'an image',
  'restore.decryptedTo.firmware': 'firmware {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'The image is {where} in {file}, {kind}: stored sha256 {stored}, decrypted to {decrypted} of {size} B (sha256 {sha256}).',
  'restore.note.imageEntry':
    'The image is {where} in {file}, {kind} (its {entry}): stored sha256 {stored}, decrypted to {decrypted} of {size} B (sha256 {sha256}).',
  'restore.note.readBack':
    'After the write, the bank read back is compared with the backup’s stored bank bytes.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera': "The backup's identity block names this camera (serial {serial}).",
  'restore.note.sameBytes':
    "{name} holds the backup's stored bytes already: the write puts the same image back.",
  'restore.warn.otherCamera':
    "This backup looks like another camera's: its identity block names serial {theirs}, and this camera is {camera}. Only {name}'s image is written; nothing of that camera's identity or calibration is.",
  'restore.warn.noIdentity':
    'This backup has no identity block at {address}, so it cannot be told whose camera it was read from.',
  'restore.warn.serialNotRead':
    "The camera's serial was not read, so the backup (serial {serial}) cannot be matched to it.",
  'restore.warn.otherFirmware':
    '{where} holds firmware {version}, and the camera runs {camera}: the restore puts another firmware in the bank.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank} was not read back, so it is not compared with the backup.',
  'restore.readBack.equal': '{bank} reads back byte for byte as the backup stores it.',
  'restore.readBack.differs':
    "{bank} reads back different from the backup's stored bytes in {count} B (first at {offset}).",

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, derived from the booted {bank}',
  'keys.derived.holds':
    '{key} (the store key), derived from the booted {bank}, which holds {holds}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, derived from the booted bank',
  'keys.derived.holdsUnnamed':
    '{key} (the store key), derived from the booted bank, which holds {holds}',
  'keys.ffVendor.staged':
    "the 1.3.0.8 FF (16 Hz) image as the vendor app stages it: the image XOR its own key block 0 (Key A), header window verbatim, to any bank; this camera's keys are not used",
  'keys.ffVendor.stored':
    'Key B: the camera re-keys the upload with key block 1 and stores the image under it',
  'keys.imageBlock0.staged':
    "the image under its own key block 0 (found in the image by value), to any bank; this camera's keys are not used",
  'keys.imageBlock0.storedUnnamed':
    'the key its bootloader checks a bank under (not named on this read); the camera re-encrypts the upload under it',
  'keys.imageBlock0.stored':
    '{key}, the key its bootloader checks a bank under; the camera re-encrypts the upload under it',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED: no bootloader of the 16 Hz FF build has been read from a camera, so whether the written bank starts is not known. On the 0.9.0.0 bootloader an earlier form of this image started from recovery R; this form will not, because that bootloader starts recovery R as it is stored, without decoding it.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'The 16 Hz FF image is sent in the form only the 16 Hz {version} build reads. This camera writes a bank without checking the image (its firmware source says so, and a 1.3.0.0 Compact did so when tried), so it is expected to write the bytes as they are sent: the bank then holds the image in a form this camera cannot start.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Nothing here claims the camera starts it.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast': "The camera's own answers say it runs the 16 Hz FF build: {why}.",
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'checks a payload before it erases a bank, and this payload passes that check, so it may write these bytes as they are, in a form its bootloader cannot start: the bank may not start (not tried; the backup saved before the write puts it back)',
  'write.ff.outcome.refuses':
    'checks a payload before it erases a bank, and this payload fails that check, so it is expected to refuse this write before it writes anything (a camera running that build refused an earlier form of this image the same way)',
  'write.ff.runsSlow': 'The camera runs the 8 Hz {version} build: {why}. That build {outcome}.',
  'write.ff.buildUnknown':
    "The camera's own answers do not say which {version} build it runs: {why}. If it runs the 16 Hz FF build, it takes this payload. If it runs the 8 Hz build, that build {outcome}.",
  'write.raw.asGiven':
    'Raw payload: sent exactly as given. Nothing here checks that it is bootable.',
  'write.raw.ffStagedForm':
    'This payload is the 1.3.0.8 FF staged form (the image XOR key block 0, word sum 0xFFFF). The camera stores the image under Key B, so the read-back is checked against those bytes.',
  'write.raw.noStaging':
    'This build names no staging form for the slot, so the bootloader checks cannot be stated.',
  'write.raw.reencrypts':
    'The device decodes this payload and re-encrypts what it keeps, so the stored bytes are not predicted. The read-back is checked as the image it decrypts to, where that can be said.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'The bootloader would reject this payload: {failure}.',
  'write.raw.stageKeyUnchecked':
    "The 2016 stage key (key block 0) is not in raw bytes, so this payload's decrypted word sum is not checked here.",
  'write.image.rekeyRisk':
    '{name} already holds an image the bootloader cannot take. This write lands in the same state.',
  'write.ack.recovery':
    'Recovery R: writing it asks you to acknowledge the risk. Nothing here checks that the camera boots afterwards.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: writing it asks you to acknowledge the risk, and the camera runs whatever it holds after the next power cycle.',
  'write.ack.bootUnnamed':
    'the booted bank could not be named, so this one is treated as the booted one',
  'write.ack.recoveryFallback': 'Recovery R is the last-resort copy the bootloader falls back to',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'blank/0: prefer slot A, then B, then recovery',
  'boot.cfg0.modernB': 'prefer slot B, then A, then recovery',
  'boot.cfg0.modernRecovery': 'prefer recovery, then A, then B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'not known — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  /** `{verdict}` is one of upgrade.verdict.*. `{name}` here is the bank inside a sentence ("slot B"); in upgrade.verdict.* it starts a sentence ("Slot B"). */
  'upgrade.whileRecovery':
    'The camera is running its recovery bank, and its own upgrade writes {name}, which it is not running. {verdict} This is a warning only: nothing here stops an upgrade.',
  'upgrade.verdict.notRead':
    '{name} could not be read on this check, so what it holds is not known.',
  'upgrade.verdict.blank': '{name} is blank, so the upgrade writes into an empty bank.',
  'upgrade.verdict.bootableSame':
    '{name} holds the same bootable image as the bank it runs, which the upgrade replaces. {name} is left unbootable if the upgrade stops partway.',
  'upgrade.verdict.bootable':
    '{name} holds a bootable image, which the upgrade replaces. {name} is left unbootable if the upgrade stops partway.',
  'upgrade.verdict.unknown':
    "{name}'s bootability is unknown on this read, so the upgrade may replace an image the camera would boot.",
  'upgrade.verdict.notBootable':
    '{name} is not shown as bootable on this read, so the upgrade replaces no image the camera would boot.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — the bank the bootloader entered at this start, as it records it',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'not read',
  'report.lastStart.noBank': 'the camera reports {word}, which names no bank',
  'report.lastStart.entered': 'the camera reports it entered {bank} (active-slot word {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'no version',
  'running.why.otherVersion': 'the camera reports {version}, and only {only} has two builds',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'the camera did not answer the bank verdicts (GetFirmwareInfo selectors 6, 7, 8)',
  'running.why.notRead':
    'a bank the verdicts depend on was not read, so the answers cannot be predicted',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'the camera answers {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers}, which is what the 8 Hz 1.3.0.8 build answers for these banks ({predicted})',
  'running.why.ff':
    '{answers}, which is what the 16 Hz FF 1.3.0.8 build answers for these banks ({predicted})',
  'running.why.both':
    '{answers}, and both builds answer exactly that for these banks, so the banks do not tell them apart',
  'running.why.neither': '{answers}, which matches neither build (8 Hz: {plain}; 16 Hz FF: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    "This image's header names no firmware version, so whether it is the build the camera runs ({camera}) cannot be told. Check that it is the image you mean to write.",
  'imageBuild.otherVersion': 'This image is firmware {image}; the camera runs {camera}.',
  'imageBuild.otherVersionTaken':
    'This image is firmware {image}; the camera runs {camera}. On this line the camera checks only that an image is well formed (its header and word sum), not its version, so it takes this image, and when it starts from this bank it runs {image}.',
  'imageBuild.otherVersionUnchecked':
    'This image is firmware {image}; the camera runs {camera}. Whether this camera takes a different build, and runs it, has not been checked.',
  'imageBuild.otherBuild':
    'This image is the 8 Hz {version} build; the camera runs the 16 Hz {version} FF build. The 16 Hz build checks a payload against its own FF form when it is committed and refuses one that fails, before it erases the bank (from its source). Writing the 8 Hz build to it has not been tried on a camera.',
  'imageBuild.runningUnknown':
    'This image is the 8 Hz {version} build. The camera runs {version}, which comes as an 8 Hz and a 16 Hz FF build, and its own answers did not say which one it runs, so whether this is its build cannot be told.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': 'the payload is {size} B, too short to hold a header at 0x200',
  'bootFail.noMagic': 'no image magic at 0x200 (found {found}, the bootloader needs {needs})',
  'bootFail.lengthOutside': 'header.length {length} is outside the {size} B payload',
  'bootFail.lengthNotPayload': 'header.length {length} is not the payload length {size}',
  'bootFail.overStage': '{size} B is over the {max} B stage',
  'bootFail.plainSum': 'stored word sum {sum}, the 2014 bootloader needs 0',
  'bootFail.noFooter': 'no footer at {offset}: the payload ends at {end}',
  'bootFail.footerNotCode':
    'footer at {offset} is not "CODE" — the bootloader takes its segmented loader',
  'bootFail.footerLength': 'footer length does not equal header.length {length}',
  'bootFail.keyASum':
    "decrypted under this camera's Key A the word sum is {sum}, the bootloader needs {needs}",

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'verified by the acceptance sum',
  'keyConfidence.structural': 'verified by the vector table only',
  'keyConfidence.unverified': 'not verified',
  /** `{sum}` is hex. */
  'keyCheck.family': 'key verified by the acceptance sum {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'key {phrase}; acceptance sum {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': "staged under the camera's own keys",
  'staging.phrase.slotKeystreamCiphertext': "staged under the image's own key",
  'staging.phrase.plain': 'staged plain',
  'staging.phrase.keyAKeystream': 'staged as the vendor app stages the FF image (XOR Key A)',
  'staging.phrase.verbatim': 'sent as given',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank, inside the sentence ("slot A"); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    'committed {size} B to {name} at {address}, {staged}; commit status {status}',
  'written.noReadWindow': 'this build names no read window for the bank, so nothing was read back',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'the read-back failed: {error}',
  'written.readBack': 'read back {size} B, SHA-256 {sha256}',
  'written.verifyOff': 'verify is off: the bank was not read back',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'the bytes the plan predicted the bank would hold (the image as the 16 Hz build stores it, not the bytes sent)',
  'readBack.reference.asSent':
    'the bytes the plan predicted the bank would hold (the bytes as they were sent)',
  'readBack.sizeDiffers':
    'the read-back is {size} B, the plan predicted {predictedSize} B: the bank does NOT match {reference}',
  'readBack.matchesFolded':
    'the bank holds the image as the 16 Hz build stores it (not the bytes sent), and the rest of the bank is erased',
  'readBack.matches':
    'the bank matches the bytes the plan predicted (the 2014 plain chain programs exactly what it is sent)',
  'readBack.differs': 'the bank does NOT match {reference} (first difference at {offset})',
  'readBack.noHeader':
    'the read-back holds no image header at {offset} (magic {magic}), so the bank does NOT decrypt to the expected image',
  'readBack.lengthDiffers':
    "the read-back's header says {length} B, the plan's image is {imageLength} B: the bank does NOT decrypt to the expected image",
  'readBack.tooShort':
    'the read-back is {size} B, too short for a {length} B image: the bank does NOT decrypt to the expected image',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'keystream recovered from the read-back ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': 'the bank decrypts to the expected image ({length} B) under the {recovered}',
  'readBack.decryptDiffers':
    'the bank does NOT decrypt to the expected image: first difference at image offset {offset} under the {recovered}',
  'readBack.rawNotCompared':
    'raw bytes: read-back reported, not compared (the bytes do not decrypt to a plain image that can be predicted on this form, and the device re-encrypts what it keeps)',
  'readBack.notCompared':
    'no comparison was possible: the plan predicts neither the stored bytes nor the plain image',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'Key A',
  'keyName.keyB': 'Key B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'per-device key',
  'keyName.thePerDevice': 'the per-device key',
  'keyName.applicationKeyA': "the application's Key A",
  'keyName.applicationKeyB': "the application's Key B",
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'key block 1',
  'keyName.theDeviceKey': 'the device key',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'unknown key',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'the 2014 plaintext chain: every bank is stored plain, so no upload key is derived; the upload is the image as it is',
  'keys.evidence.ffVendor':
    'the 1.3.0.8 FF (16 Hz) build: no bank this read opened is stored plain, so the camera is not shown to be on the 2014 plaintext chain; the FF image is written in its vendor form, raw bytes are sent as given, and a plain 8 Hz image is not written',
  'keys.evidence.ffUntested':
    'a write of the FF image is offered with its UNTESTED warning: no genuine bootloader for this build is in the corpus, so whether the written bank boots is not measured',
  'keys.evidence.line2016':
    'the 2016 Compact PRO line: an upload is the image XORed with the keystream of its own key block 0, found in the image by value, so no key of this camera builds it',
  'keys.evidence.checkKeyUnnamed':
    'the camera decrypts the upload with that key and re-encrypts it under the key its bootloader checks a bank under; that key was not named on this read, and the write does not need it: the bank is read back as the image it decrypts to',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'the camera decrypts the upload with that key and re-encrypts it under the key its bootloader checks a bank under; that key was not named on this read ({why}), and the write does not need it: the bank is read back as the image it decrypts to',
  'keys.evidence.checkKeyNamed':
    'the camera decrypts the upload with that key and re-encrypts it under {key} {hex}, the key its bootloader checks a bank under, so every bank it writes is stored the way the bootloader takes it',
  'keys.evidence.checkKeyInferred':
    'the camera decrypts the upload with that key and re-encrypts it under {key} {hex}, the key its bootloader checks a bank under (inferred from {bank}, the bank the camera reports it entered, which the bootloader entered without its check), so every bank it writes is stored the way the bootloader takes it',
  'keys.evidence.checkKeyNamedFrom':
    'the camera decrypts the upload with that key and re-encrypts it under {key} {hex}, the key its bootloader checks a bank under (named from {bank}, the bank the camera reports it entered), so every bank it writes is stored the way the bootloader takes it',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'the booted bank could not be named, so the key the bank is stored under cannot be read from it',
  'keys.refused.notDerived': 'the keys could not be derived',
  'keys.refused.notDecrypted':
    'the booted {bank} does not decrypt to an image, so the key it is stored under cannot be read',
  'keys.refused.noBootKey':
    'the booted {bank} decrypts under no key the bootloader tries (its Key A, or its store key), so the key the bank is stored under cannot be read from it',
  'keys.refused.keyNotInTable':
    "the booted {bank} decrypts under {key}, but this camera's key table does not carry that key, so it cannot be written under it",
  'keys.refused.noApplicationPair':
    "the running application ({bank}, firmware {firmware}) carries none of the known key pairs (the bootloader's and the decoded application pairs), each half exactly once, so its Key A cannot be located in its image",
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: "the running application ({bank}, firmware {firmware}) carries none of the known key pairs (the bootloader's and the decoded application pairs), each half exactly once, so its Key A cannot be located in its image (the bootloader's Key A occurs {count} time, its Key B {keyB})",
    other:
      "the running application ({bank}, firmware {firmware}) carries none of the known key pairs (the bootloader's and the decoded application pairs), each half exactly once, so its Key A cannot be located in its image (the bootloader's Key A occurs {count} times, its Key B {keyB})",
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'the running application ({bank}, firmware {firmware}) checks an upload under its own keys before it programs it (the decoded source of this build tries the upload under its Key A and its store key, as its bootloader tries a bank), and the key the writes store under, {key} ({hex}), is neither its Key A nor its store key, so the camera would refuse the upload with 0x50000 before erasing anything',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum': "no slot decrypts to {family}'s {sum} acceptance sum",
  'writeRefusal.keyTable': "this camera's key table could not be confirmed",
  'writeRefusal.whitening':
    "this camera's key table resolves under K={k} but {family} encrypts under K={expected}",
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily':
    'the evidence says this camera is {detected}, not {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'this camera cannot be written from here: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    "Seek's 2018 and later builds (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 and Nano 300. A dump reads 63 of the 64 blocks of flash without unlocking anything; no read reaches the block at {block} on these builds. The firmware is stored encrypted. Banks are written one at a time on the Work with firmware slots tab.",
  'family.summary.early':
    "The 2014 Compacts older than 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 and 0.7.0.8. Their firmware cannot answer the read a dump sends, so Dump, Dump all selectors, the Info tab's full read and the Work with firmware slots tab refuse them after reading the version; on 0.3.0.1 the command a dump starts with would set up a firmware upgrade instead. The preservation run reads 0.7.0.7 and 0.7.0.8 through another command those two builds answer. A dump taken another way decrypts as usual.",
  'family.summary.compact2016':
    'The Compact PRO 1.0.3.x builds (1.0.3.0 and 1.0.3.2). They answer reads exactly as the 2014 Compacts do, unlock token included, so they are told apart by their version and by how their banks are stored: encrypted, where the 2014 banks are plain. A 1.0.3.x camera is read under this family from the start. The preservation run reads the whole flash, and banks are written one at a time on the Work with firmware slots tab.',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    "The 2014 Compacts 0.8.0.0 to 1.3.0.8, the 16 Hz 1.3.0.8 FF build among them. A stock camera lets out under half of its flash, some of it only to an unlock token the toolkit sends; the preservation run reads the rest through a temporary patch. Banks are stored plain, except on the FF build. A Compact PRO 1.0.3.x camera is read as compact-2016, and moves here only when a bank is stored plain or decrypts to {sum}, as the FF build's do. Banks are written on the Work with firmware slots tab on the builds the preservation run was measured on; any other 0.x or 1.x build is read only.",
  'family.summary.generic':
    'A camera no other family matches. `seek-fw dump` reads it with the 4.x block list (the 4.x/Nano tab refuses it), and a decrypt solves the key from the image itself, so neither depends on the guess. No bank is written: the Work with firmware slots tab refuses it until the camera is identified.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'the image header says',
  'detect.source.camera': 'the camera reports',
  'detect.plainArmedNotInForce':
    'a plain 2-byte BeginFirmwareUpgrade armed a protected bank, so the authenticated read channel is not in force',
  'detect.modern.plainRefused':
    'a plain 2-byte BeginFirmwareUpgrade of a protected bank was REFUSED, which no build on this line does — its handler has no token check and accepts the plain channel on every bank',
  'detect.modern.authArmed':
    'a protected bank armed on the 18-byte authenticated selector; nothing tried the plain one there, so that does not place this camera off this line',
  'detect.modern.legacyVersion':
    '{said} firmware {version}, which is on the 0.x / 1.x legacy line (a different numbering line, not an older 4.x — and one of those builds hits the {sum} sum too)',
  'detect.modern.noSum':
    "no slot decrypts to the {sum} acceptance sum this family's bootloader demands",
  'detect.modern.sum': 'a slot decrypts to the {sum} acceptance sum',
  'detect.modern.version':
    'firmware {version} is on the post-2018 line this selector map covers (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'a plain 2-byte BeginFirmwareUpgrade armed a protected bank, so this is not the locked legacy firmware',
  'detect.modern.none': 'no evidence placing this camera on the post-2018 line',
  'detect.early.noVersion': 'no firmware version was reported or found in an image header',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'firmware {version} is {first} or later, so its RPC table has a getter for GetFeaturedFirmwareData and the ordinary read path applies',
  'detect.early.older':
    '{said} firmware {version}, which is older than {first} — the first build whose RPC method table has a read handler (getter) for GetFeaturedFirmwareData',
  'detect.early.noWindow': 'and no window could be read, which is what that predicts',
  'detect.generic.fallback':
    'fallback: no firmware family matched confidently, so reads stay available and writes do not',
  'detect.compact2016.early':
    'firmware {version} is older than 0.8.0.0 and has no read handler for GetFeaturedFirmwareData — that is early-compact, not this family',
  'detect.compact2016.modernSum':
    "a slot decrypts to the {sum} acceptance sum, which is not this generation's target",
  'detect.compact2016.plainArmed':
    'a plain 2-byte BeginFirmwareUpgrade armed a protected bank, so this camera is not on the locked line this family shares with legacy-auth',
  'detect.compact2016.notLine': 'firmware {version} is not on the 0.x / 1.x line',
  'detect.compact2016.storedPlain':
    "a slot is stored plain — the keystream solve returns the identity state, so its stored words ARE the image — which is the 2014 plaintext chain; this generation's banks are xorshift128 under a real key",
  'detect.compact2016.keyedZero':
    "a slot stored under a real xorshift128 keystream decrypts to the {sum} acceptance sum, which is this generation's cipher",
  'detect.compact2016.zeroSum':
    "a slot decrypts to the {sum} acceptance sum, which is this generation's target",
  'detect.compact2016.refused':
    'and a protected bank refused the plain 2-byte arm, which is the locked handler',
  'detect.compact2016.proLine': "{said} firmware {version}, the 2016 Compact PRO's 1.0.3.x line",
  'detect.compact2016.compactLine':
    "{said} firmware {version}, a Compact build, not the Compact PRO's 1.0.3.x line",
  'detect.compact2016.lockedLine':
    '{said} firmware {version}, on the 0.x / 1.x line this generation shares with the locked legacy firmware',
  'detect.compact2016.bootloader2016':
    "the bootloader reports {version}, a 2016-generation bootloader (1.2.0.0 is measured under Compact PRO 1.0.3.0; the 2014 Compact's is 0.9.0.0)",
  'detect.compact2016.bootloader2014':
    "the bootloader reports {version}, the 2014 generation's numbering, not this generation's",
  'detect.compact2016.none':
    'no slot was observed decrypting to a zero acceptance sum under a real key',
  'detect.legacy.proLine':
    "but firmware {version} is the 2016 Compact PRO's 1.0.3.x line, whose banks are compact-2016's cipher: this family's acceptance check would fail every one of them",
  'detect.legacy.early':
    'firmware {version} is older than 0.8.0.0: its RPC table has no read handler for GetFeaturedFirmwareData (none at all before 0.7.0.7, and a setter only on 0.7.0.7 and 0.7.0.8) — that is early-compact, not this family',
  'detect.legacy.keyedZero':
    "a slot stored under a real xorshift128 keystream decrypts to {zero} — the 2016 Compact PRO's cipher (compact-2016). This line stores its banks plain with a word sum of 0 (the 2014 chain) or keyed to {sum} (Compact 1.3.0.8), and its acceptance check fails such a slot",
  'detect.legacy.plainChain':
    'a bank is stored as plain firmware whose words sum to 0, as the 2014 bootloader of this line boots it',
  'detect.legacy.refused':
    'the camera refused to open a locked bank for an upgrade when asked without the unlock, as only this generation of firmware does',
  'detect.legacy.unlocked':
    'and it opened the same bank when asked with the unlock, so the unlock this family sends is the one this camera checks',
  'detect.legacy.notLine': '{said} firmware {version}, which is not on the 0.x / 1.x legacy line',
  'detect.legacy.authOnly':
    'it opened a locked bank for an upgrade when asked with the unlock, as this generation of firmware does; asking without the unlock was not tried, so this alone does not prove the generation',
  'detect.legacy.version':
    'firmware {version} is on the 0.x / 1.x legacy line, which is a different numbering line from the post-2018 application versions, not an older 4.x',
  'detect.legacy.none': 'nothing observed points at the authenticated read channel',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'withheld after a run on a camera: there the patch did not raise the publish rate, and the shutter fired on every frame after the write',
  'fps.table.predates':
    'firmware {version} is older than 0.8.0.0: its RPC table has no read handler for GetFeaturedFirmwareData, the command a slot read sends, so the slots read and write no bank of the build, and the patch is not offered',
  'fps.table.stageTwoFf':
    'stage two: the 16 Hz FF build is staged as the vendor app stages it (the image XOR Key A, stored under Key B), not as plain bytes, so its staging check is not done and the patch is not offered yet',
  'fps.table.stageTwo':
    'stage two: this entry is not in the stage-two set, so its staging check is not done and the patch is not offered yet',
  'fps.table.notOffered': 'not offered',
  'fps.table.notImage': 'this is not a firmware image, so no frame-rate patch applies to it',
  'fps.table.otherBuild':
    'the image is the {image} build, but the camera reports {camera}; the patch is refused rather than applied to a build it does not match',
  'fps.table.otherBuildNoVersion':
    'the image is the {image} build, but the camera reports no version; the patch is refused rather than applied to a build it does not match',
  'fps.table.patched': 'the frame-rate patch is already applied: this image runs at {hz} Hz',
  'fps.table.earlierPatch':
    'this image holds an earlier {hz} Hz frame-rate patch without the USB fix, and a patch is never applied to a patched image: restore the stock image, then patch it',
  'fps.table.atRate': 'this build already runs at {hz} Hz without a patch',
  'fps.table.not4821':
    'this image reports the Compact 4.8.2.1 build (or the Compact XR 4.8.2.1, the same build) but is not the stock image the frame-rate patch was written for (f96ac57eda75: its 68-byte command pages, steady page 13), so no frame-rate patch is made for it',
  'fps.table.notInTable':
    'this image is not in the frame-rate patch table, so no frame-rate patch is made for this build. The table names the Compact 0.7.0.8 to 1.3.0.8 (8 Hz; 0.7.0.8 is refused by the slots code), 1.3.0.8 (16 Hz FF), 4.8.1.7, 4.8.1.9, 4.8.2.1 and 4.16.1.7 FF builds and the Compact PRO 1.0.3.x and 4.9.x builds; no other build has an entry',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': "this build's plan has no {bank}",
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank} cannot take a decrypted image on this build: {reason}',
  'fps.plan.empty': '{bank} has no decrypted image to patch (it is empty)',
  'fps.plan.noImage': '{bank} has no decrypted image to patch (it was not read or no key opens it)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name} was written, but its read-back does not differ from the saved bank only as planned, so the banks after it were not written',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build (slots/capability-notes) ----
   * The page shows only this one; it leaves the others out (lib/page-hidden.ts), and the CLI prints them
   * in English. */
  'notes.unverified':
    'Read only. The bank layout is the locked line’s decoded table, but no staging form has been measured for this build, so no write is planned.',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'the camera did not report its firmware version ({note}); a command number does not mean the same thing on every Seek firmware — on Compact 0.3.0.1 wire id 0x52, the id that arms a read window, is EnterBootloaderMode — so until the version is known nothing is sent but GetErrorCode, GetOperationMode and GetFirmwareInfo, the reads every build answers the same way',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo did not answer ({error}) on any of {reads} reads {spacing} ms apart, a start-up window of {window} ms; a camera still starting up answers within it',
  'identity.note.neverTwice': 'GetFirmwareInfo was never answered twice in a row in {reads} reads',
  'identity.note.noAnswer': 'GetFirmwareInfo did not answer ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo did not answer ({error}); {answered} of {reads} reads answered, never two in a row, so none of them can be told from a record an earlier command left selected',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo answered {count} byte, too few for a version',
    other: 'GetFirmwareInfo answered {count} bytes, too few for a version',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo answered {count} byte, too few for a version; {context}',
    other: 'GetFirmwareInfo answered {count} bytes, too few for a version; {context}',
  },
  'identity.note.otherRecord':
    'the first read answered a different record ({version}), which an earlier command had left the firmware-info selector on — that read cleared it',
  'identity.note.afterStartup': {
    one: 'it answered after refusing {count} read while starting up',
    other: 'it answered after refusing {count} reads while starting up',
  },
  'identity.predates':
    'firmware {version} predates the dump protocol: its RPC method table has no read handler for GetFeaturedFirmwareData (on 0.7.0.7 and 0.7.0.8 it is registered as a setter only, and before that wire id 0x4F is UploadFirmwareRowSize), so no window can be read with it; on 0.3.0.1 wire id 0x52 is EnterBootloaderMode rather than BeginFirmwareUpgrade. The preservation run reads 0.7.0.7 and 0.7.0.8 through wire id 0x58 (GetFeaturedData) instead',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'refusing to {operation}: {reason}',
  'identity.refusingNoVersion':
    'refusing to {operation}: {reason}. Nothing was armed. Unplug the camera, plug it back in, let it finish starting up and try again.',
  'identity.operation.dump': 'dump',
  'identity.operation.dumpAll': 'dump all selectors',
  'identity.operation.readInfo': 'read the device info',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'the banks are chosen after the backup, which reads them — run the backup first',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'the banks cannot change once the commit has run or been tried: this run writes {banks}, and the restore puts back exactly those',
  'preserve.banks.none': 'no bank',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Written.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Read. {count}/{of} slots readable.',
  'status.readRefused': 'Read, but no bank of this camera can be written from here — see the log.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Firmware version',
  'compare.field.imageId': 'Image id',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'Initial SP',
  'compare.field.resetVector': 'Reset vector',
  'compare.field.size': 'Size',
  'compare.field.shaExpected': 'SHA-256 of the expected plain image',
  'compare.field.sha': 'SHA-256 of the image',
  'compare.field.shaNotStored': 'SHA-256 of the expected plain image (stored bytes not predicted)',
  'compare.field.key': 'Key',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(no image)',
  'compare.notImage': '(not an image)',
  'compare.notPredicted': '(not predicted: the device decides what it stores)',
  'compare.plaintext': 'none (plaintext)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'could not be read the same way twice',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (the key the bootloader checks a bank under is inferred from {bank}, which it entered without its check) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered': '{bank}, as the camera records it (active-slot word {word})',
  'preserve.lastStart.notRead': 'not known — the active-slot word could not be read',
  'preserve.lastStart.noBank': 'not known — the active-slot word is {word}, which names no bank',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'not known — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'not written — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'an image',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — can be written',
  'preserve.bank.writablePatch': '{build} — can be written; the patch changes {count} bytes',
  'preserve.bank.writableEdit': '{build} — can be written; carries {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — can be written; the patch changes {count} bytes; carries {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead': 'the backup has not read the banks yet, so no bank can be chosen',
  'preserve.choice.every': 'every bank that holds an image: {banks}',
  'preserve.choice.everyBlocked':
    'every bank that holds an image cannot be written: {bank} cannot — {reason}',
  'preserve.choice.noImage': 'no bank holds an image the run can write',
  'preserve.choice.nextStart': '{bank}, the bank the next start enters: {why}',
  'preserve.choice.nextStartRefused':
    'the next start enters {bank} ({why}), and the run cannot write it: {reason}',
  'preserve.choice.everyUnknownStart':
    'every bank that holds an image ({banks}): which bank the next start enters is not known ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'which bank the next start enters is not known ({why}), and {reason}; choose a bank by name',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank} cannot be written: {reason}',
  'preserve.choice.byName': '{banks}, the bank chosen by name',
  'preserve.choice.warnNotPatched':
    'The next start enters {bank} ({why}), and this choice does not patch it: after the restart the camera runs that bank’s own image, so the whole-flash read stops before it reads anything. The restore still puts every written bank back.',
  'preserve.choice.warnUnknownStart':
    'Which bank the next start enters is not known ({why}). If it enters a bank this choice does not patch, the whole-flash read stops before it reads anything.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'not known yet',
  'preserve.build.firmware': 'firmware {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'as the camera stores it (this camera keeps its firmware unencrypted)',
  'preserve.stagedForm.oneKey':
    "in the form the camera stores it (encrypted under the camera's key)",
  'preserve.stagedForm.twoKeys':
    "in the form the camera stores it (encrypted under the camera's two keys)",
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'each written bank gets back the exact bytes the backup read from it',
  'preserve.restoreForm.factoryStaged':
    'each written bank gets back its original firmware, written in the form the camera stores it, so the bank ends byte for byte as the backup read it',
  'preserve.restoreForm.none':
    'not possible on this build: no form of the original firmware passes the camera’s own check and also stores back as the original bytes, so the run ends with the complete image and the patch still in place',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'not possible on this build: the patched firmware cannot read the whole flash, so the run has no complete image to give',
  'preserve.drain.rotated': 'the camera serves it rotated, and the run puts it back in order',
  'preserve.drain.hazard': 'the patch avoids a read on this build that crashes the camera',
  'preserve.drain.whole': 'the whole 4 MiB flash in one read, {size} bytes at a time',
  'preserve.drain.wholeNotes': 'the whole 4 MiB flash in one read, {size} bytes at a time; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    "lets the camera's read command reach the whole 4 MiB flash, not just the first 64 KiB",
  'preserve.site.countPast':
    'lets the read position count past 64 KiB, so a read does not wrap back to the start',
  'preserve.site.keepPosition': 'keeps the whole read position when it moves on after each read',
  'preserve.site.savePosition': 'saves the moved-on read position in full',
  'preserve.site.clearPosition':
    'clears the whole read position each time a read starts, so the camera can still be read after the whole-flash read',
  'preserve.site.modeTwoGuard':
    'lets the whole-flash read start like any other read (the stock firmware turns it away)',
  'preserve.site.modeTwoIndirection':
    'points the whole-flash read at the start of the flash (the stock firmware points it at a value that crashes the camera)',
  'preserve.site.armTail':
    'removes a call that freezes the camera when a read starts on this build',
  'preserve.site.other': 'changes one instruction the whole-flash read needs',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Backup',
  'preserve.step.patch': 'Patch',
  'preserve.step.commit': 'Write',
  'preserve.step.drain': 'Whole-flash read',
  'preserve.step.restore': 'Restore',
  'preserve.step.verify': 'Check',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'patch',
  'preserve.stepId.commit': 'commit',
  'preserve.stepId.drain': 'drain',
  'preserve.stepId.restore': 'restore',
  'preserve.stepId.verify': 'verify',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: stopped as planned — the camera started {bank}, which this run did not patch, so nothing was read.',
  'preserve.result.noReason': 'no reason was recorded',
  'preserve.result.stopped': '{label}: stopped — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none': 'no bank holds firmware the run can patch',
  'preserve.result.writable.one': '{banks} holds firmware the run can patch',
  'preserve.result.writable.many': '{banks} hold firmware the run can patch',
  'preserve.result.backup': '{label}: every block a normal read reaches was saved; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'a bank that is not known',
  'preserve.result.backupNext':
    '{label}: every block a normal read reaches was saved; {writable}; the next start enters {next}.',
  'preserve.result.patch': '{label}: built for {banks}.',
  /** The patch step when every bank was refused: nothing to build for. */
  'preserve.result.patchNone':
    '{label}: no patch was built: no bank holds firmware the run can patch.',
  'preserve.result.patchCount': '{label}: built for {banks}; {count} bytes change in each.',
  'preserve.result.commitOne':
    '{label}: {banks} written with the patch, and the camera accepted it.',
  'preserve.result.commitMany':
    '{label}: {banks} written with the patch, and the camera accepted each.',
  'preserve.result.drainNotRead': '{label}: not read.',
  'preserve.result.drain':
    '{label}: the whole 4 MiB flash was read; the complete image has sha256 {sha256}.',
  'preserve.result.drainThrough':
    '{label}: the whole 4 MiB flash was read through {bank}; the complete image has sha256 {sha256}.',
  'preserve.result.restore': '{label}: {banks} written back.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}: {banks} written back {form}.',
  'preserve.result.verifyDone': '{label}: done.',
  'preserve.result.verifyIdentical':
    "{label}: {blocks} blocks read again, 0 bytes differ — the camera's flash is byte-identical to the backup.",
  'preserve.result.verifyDiffers': '{label}: {blocks} blocks read again, {bytes} bytes differ.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: {blocks} blocks read again, {bytes} bytes differ, {count} block could not be read.',
    other:
      '{label}: {blocks} blocks read again, {bytes} bytes differ, {count} blocks could not be read.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Stopped before the whole-flash read: the camera started a bank this run did not patch, so nothing was read.',
  'preserve.unpatchedStart.next':
    'Next: the restore puts every written bank back. The whole-flash read is not tried again: the camera would start the same bank.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Done — your firmware is preserved',
  'preserve.done.detail':
    "The complete image is the camera's whole original flash, and the camera itself is back exactly as it was.",
  'preserve.done.titleNoImage': 'Done — the camera is back as it was; there is no complete image',
  'preserve.done.detailNoImage':
    'The whole-flash read did not run, so this run has no complete image of the flash. Every written bank was put back, and a fresh read of the blocks a normal dump reaches matches the backup. For the complete image, start a new run with a choice that includes the bank the next start enters.',
  'preserve.done.detailNoImageCount':
    'The whole-flash read did not run, so this run has no complete image of the flash. Every written bank was put back, and a fresh read of the {blocks} blocks a normal dump reaches matches the backup. For the complete image, start a new run with a choice that includes the bank the next start enters.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'the camera’s window reader is budgeted per boot and these reads came back from a spent reader — power-cycle the camera (unplug and replug it, or use its power switch), then re-run `preserve --resume <run-directory>`. Signature: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'the camera’s window reader is budgeted per boot and these reads came back from a spent reader — power-cycle the camera (unplug and replug it, or use its power switch), then re-run `preserve --resume <run-directory>`. Signature: {signature} — no factory plaintext can be derived from these bytes. Every way to read it was tried:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'the backup does not hold {bank} ({address}) — the stock windows cannot serve it',
  'preserve.fail.readsDisagree':
    'the two reads of {bank} disagree (sha256 {sha256} vs {other}) — a camera that cannot serve the bank it runs twice in a row is not a camera to write to; the capture is the restore source and the patch’s derivation input',
  'preserve.fail.notFactory':
    '{bank} does not hold the factory image as this build’s cipher stores it (the expected image prefix does not match the capture) — refusing before anything is recorded, let alone written',
  'preserve.fail.ffSum':
    'the patched firmware, in the form the camera stores it, does not pass this build’s own check (its sum must be {sum}) — refusing to send a bank the camera would reject after the erase',
  'preserve.fail.headChanged':
    "{bank}'s head changed since the backup (it holds neither the original capture nor the patched bytes) — refusing to write over an unknown bank state; nothing was written. Head hex: live {live} vs capture {capture}",
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks} already holds the patched bytes — the commit landed in a previous attempt and must not be replayed. Resume at the drain step (--resume), which boots the patched image and continues from there.',
  'preserve.fail.landed':
    '{banks} already hold the patched bytes — the commit landed in a previous attempt and must not be replayed. Resume at the drain step (--resume), which boots the patched image and continues from there.',
  'preserve.fail.drainRebootRefused':
    'the drain’s reboot command was REFUSED by the host before it left (a SecurityError: a browser policy or a test guard), so the camera still runs the image it booted with, not the committed patch. The drain reads only through the patched image’s widened window, so it stops before arming anything; nothing was read. Run the drain again where the host lets the restart command through.',
  'preserve.fail.shiftedRebootRefused':
    'the drain came back one page high, and the reboot that takes another boot was REFUSED by the host before it left (a SecurityError: a browser policy or a test guard) — another attempt would drain the same shifted boot. Nothing was kept; run the drain again where the reset can go out.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'the verify read {count} differing byte over {read}/{total} windows — the part does not re-read byte-identical to the backup',
    other:
      'the verify read {count} differing bytes over {read}/{total} windows — the part does not re-read byte-identical to the backup',
  },
  'preserve.fail.verifyIn': {
    one: 'the verify read {count} differing byte over {read}/{total} windows (in {places}) — the part does not re-read byte-identical to the backup',
    other:
      'the verify read {count} differing bytes over {read}/{total} windows (in {places}) — the part does not re-read byte-identical to the backup',
  },
  'preserve.fail.verifyShort': {
    one: 'the verify read {count} differing byte over {read}/{total} windows (short windows: {short}) — the part does not re-read byte-identical to the backup',
    other:
      'the verify read {count} differing bytes over {read}/{total} windows (short windows: {short}) — the part does not re-read byte-identical to the backup',
  },
  'preserve.fail.verifyInShort': {
    one: 'the verify read {count} differing byte over {read}/{total} windows (in {places}) (short windows: {short}) — the part does not re-read byte-identical to the backup',
    other:
      'the verify read {count} differing bytes over {read}/{total} windows (in {places}) (short windows: {short}) — the part does not re-read byte-identical to the backup',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'the boot-config block',
  'preserve.fail.dataBlock': 'a data block',

  'preserve.refused.secondRead': 'its second read failed ({error})',
  'preserve.refused.readsDisagree': 'its two reads disagree (sha256 {sha256} vs {other})',
  'preserve.refused.erased': 'it is erased',
  'preserve.refused.watchdogMark':
    'its header word at +0x200 holds {word}, the mark the bootloader writes over a bank after a watchdog reset early in a start; the bootloader no longer takes this bank, and the run has no image to patch there',
  'preserve.refused.noHeader': 'it holds no image header at +0x200',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'it holds {image} ({id}), not the build the camera runs ({camera})',
  'preserve.refused.otherKey':
    'the bootloader’s check refuses it: it is stored under another key than the one this camera’s bootloader checks banks under, and a write through the camera would store it under that key, so the restore could not put its exact bytes back',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    "the camera reports firmware {camera}, want {version} — the patch is derived from one build's bytes and must not be sent to another",
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'firmware {version} is not a 0.x or 1.x build, and this run covers only the 2014 and 2016 builds. Nothing was read beyond the version. Read this camera with Dump & decrypt for 4.x and Nano instead: it reads the flash without a patch, every block but the one at 0x14060000, which no read window reaches on those builds.',
  'preserve.refused.preWidening':
    'firmware {version} predates the widening route, and the run refuses rather than write over a bank it cannot read back. On this generation the camera turns away every way of starting the read the route needs (measured on 0.3.0.1), its read command does not reach the start of the flash, and the size the patch would change is stored in a different way. It has no read a standard dump can use either. Nothing was read beyond the version.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'holds an unknown image (not the stock {version} firmware, nor a change to it that Preserve knows), so Preserve does not patch it or put it back',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'holds a known frame-rate build: the stock {version} firmware with the {hz} Hz frame-rate patch. Preserve patches only the stock firmware, never a patched image, so it does not patch this bank or put it back',
  'preserve.image.frameRateEarlier':
    'holds a known frame-rate build: the stock {version} firmware with an earlier {hz} Hz frame-rate patch (made before the USB fix joined it). Preserve patches only the stock firmware, never a patched image, so it does not patch this bank or put it back',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    'it {what}. To include this bank, write the stock image back to it first (for example from a full flash backup taken before the change), then start a new run',
  'preserve.image.frameRateWords':
    'it {what}. To include this bank, write the stock image back to it first (for example from a full flash backup taken before the frame-rate patch), then start a new run; the frame-rate patch can be made again on the stock image afterwards',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name} {what}. The run takes the firmware it patches from this bank, so it stops here, before anything is written. To preserve this camera, write the stock image back to {bank} first (for example from a full flash backup taken before the change), then start a new run.',
  'preserve.image.frameRateRefusal':
    '{name} {what}. The run takes the firmware it patches from this bank, so it stops here, before anything is written. To preserve this camera, write the stock image back to {bank} first (for example from a full flash backup taken before the frame-rate patch), then start a new run; the frame-rate patch can be made again on the stock image afterwards.',
  'preserve.image.otherFirmware': 'it holds firmware {image}, not the {camera} the camera runs',
  'preserve.image.otherFirmwareRefusal':
    '{name} holds firmware {image}, not the {camera} the camera runs, so this run has no image it can patch there and refuses rather than write over it.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage': 'no image the run can patch derives from it ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone': 'this run is done — every step completed (run {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    '{step} is already done in this run (finished {finished}) — resume continues at {next}',
  'preserve.gate.stepDoneUnknownTime':
    '{step} is already done in this run (finished at an unknown time) — resume continues at {next}',
  'preserve.gate.backupRerun':
    'the backup cannot re-run: this run has already completed {steps} and its next step is {next} — use --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'the previous backup attempt failed, and the camera must be POWER-CYCLED before this step runs again — a retry on the same start can read stale or blank bytes (measured: a retried backup read the bootloader’s start-up word in place of the boot-config record). Power-cycle the camera (unplug and replug it, or use its power switch), then run the backup again and confirm the power cycle when asked: the run cannot see it happen. The recorded failure: {error}',
  'preserve.gate.noErrorText': '(no error text)',
  'preserve.gate.patchAfterBackup':
    '{step} runs after the backup: the run takes the dump of every region the stock plan can read and persists it BEFORE anything else happens — that backup is the only copy of this camera. Run the backup step first.',
  'preserve.gate.commitAfterBackup': '{step} runs after the backup (see the patch step)',
  'preserve.gate.commitAfterPatch':
    '{step} runs after the patch step, which records what it stages',
  'preserve.gate.commitNeedsPatch':
    '{step} needs the patch of {banks}, and the patch step recorded none — run the patch step again',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step} requires the backup files in the run directory and they are missing: {files} — without them a commit has no restore source, so it refuses',
  'preserve.gate.drainNoCommit':
    '{step} reads the PATCHED part through the widened window, and this run has no completed commit — the drain would stall on a stock camera. Run (or resume at) the commit first, or jump explicitly (allowJump) if the commit landed without its checkpoint.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'the drain step refuses on {build}: {note}',
  'preserve.gate.detectedBuild': 'the detected build',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'the drain step refuses on {build}: starting the whole-flash read on this build’s unpatched firmware crashes the camera (it reads from a value that is not a flash address; measured on the emulator: 32 KiB served, then the camera faulted). The change that makes the read safe is at {sites}, and it is not among the changes this run recorded for {bank} — run the patch step (and land the write) before the whole-flash read.',
  'preserve.gate.drainFiles':
    '{step} needs {files} (the delivered dump is post-processed with each written bank’s capture) and it is not in the run directory',
  'preserve.gate.restoreNoCommit':
    '{step} puts the original banks back over the patch, and this run has no completed commit — there is nothing it can be reverting. Run (or resume at) the commit first, or jump explicitly (allowJump) to restore an already-patched camera.',
  'preserve.gate.restoreNeedsPatch':
    '{step} needs each written bank’s patch summary (for the staged length) — run the patch step first',
  'preserve.gate.restoreNoForm':
    'the restore step refuses on {build}: no form of the original firmware passes the camera’s own check and also stores back as the original bytes — the original firmware’s check sum is 0xB7AB9D17 (measured), not the 0xFFFF the camera demands. This run ends with the complete image in hand and the patch in place; the original content can only go back with a full-flash programmer.',
  'preserve.gate.restoreFiles':
    '{step} needs {files} (the original of each written bank, from the backup step) and it is not in the run directory',
  'preserve.gate.verifyNoRestore':
    '{step} compares a fresh boot against the backup, and this run has no completed restore — a patched bank would show as diffs. Run (or resume at) the restore first, or jump explicitly (allowJump) if the restore landed without its checkpoint.',
  'preserve.gate.verifyNeedsBackup':
    "{step} needs {file} (the comparison's reference) and it is not in the run directory",
  'preserve.gate.needsBanks': '{step} needs the banks the backup step read, and the state has none',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'no banks are chosen for this run: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank} cannot be written: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    "this build's patch boots from recovery R only: {note} — the run would write {bank}, where the bootloader never runs it",
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'file is too small to hold an image header',
  'slots.image.notWordSized': 'image size must be a multiple of 4 (got {size} B)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'image is {size} B; the bootloader rejects any header.length >= {limit}, so it would never boot',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'no image header at {at} (magic {magic}, expected {expected}) — this must be a decrypted Seek firmware image, not an encrypted slot or a flash dump',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'initial stack pointer {address} is not in LPC43xx SRAM — this does not look decrypted',
  'slots.image.stackUnaligned': 'initial stack pointer {address} is not word-aligned',
  'slots.image.notThumb': 'reset vector {address} is not a Thumb address',
  'slots.image.noKeyPair':
    "this file's name does not carry its key pair, and neither this camera's pair nor a decoded application pair occurs in the image exactly once, so there is no telling which keys the image was built for. Decrypted files come out named with the keys they contain.",
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'the filename claims Key A {keyA} and Key B {keyB}, but {mismatch}. Both keys must be present, exactly once each.',
  'slots.image.keyInHeader':
    'this image keeps a key at {at}, inside the cleartext header window — refusing to patch it',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    "the filename's Key A and Key B resolve to overlapping bytes at {at} and {other} — they must be two distinct 16-byte values",
  'slots.image.retargetLost':
    "after retargeting, the image does not carry this camera's key pair exactly once — refusing to build a payload whose later upgrades the bootloader could not key",
  'slots.image.noStageKey':
    'the image carries no key pair of the 2016 line, so there is no stage key to encode it with',
  'slots.image.ffSumNoKeys':
    'this image has the 16 Hz FF word sum 0xFFFF but does not carry the 1.3.0.8-FF key pair (both halves, once each), so its staged form cannot be built. Nothing was written.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'this is the 1.3.0.8 FF (16 Hz) image, which is staged in its own Key A form (ff-form.ts), not as a plain image. Nothing was written.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'the plan was built for firmware {firmware}, but the analysis reads {version}. The plan is stale; build it again. Nothing was written.',
  'slots.plan.otherFirmwareUnknown':
    'the plan was built for firmware of unknown version, but the analysis reads {version}. The plan is stale; build it again. Nothing was written.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'the plan was built for camera {planSerial}, but the analysis reads {serial}. Refusing to write it here. Nothing was written.',
  'slots.plan.cameraUnknownSerial': 'of unknown serial',
  'slots.plan.unknownSerial': 'an unknown serial',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, inside the sentence ("slot A"). */
  'slots.plan.otherAddress': "the plan targets {address}, but the build's {name} is at {at}",
  'slots.plan.notRead': 'the analysis no longer reads {name}. Nothing was written.',
  'slots.plan.edited':
    'the plan checksum does not match its payload, so the plan was edited. Nothing was written.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'the payload is {size} B, larger than {name}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck': '{risk}. Writing it needs acknowledgeRisk: true. Nothing was sent.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'this camera cannot take a plain-staged image from here: {reason}. Nothing was written.',
  'slots.plan.noKeyTable':
    "the analysis does not name this camera's bootloader key table, so the image cannot be retargeted to it",
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'the commit status could not be read after CompleteMemoryUpgrade, so {name} may be partially written. Read the banks again before doing anything else, and keep your dump.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'the camera refused the write to {name} at commit with {status}: {cause}. Nothing was written; the bank is unchanged. Read the banks again before doing anything else.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade returned {status} ({cause}) for {name}: nothing was programmed, but the erase may have started, so the bank may be partly erased. Read the banks again before doing anything else, and keep your dump.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade returned {status} ({cause}) — {name} may be partially written. Read the banks again before doing anything else, and keep your dump.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'the camera reported {status} while staging {name} at offset {offset} — aborted before CompleteMemoryUpgrade, so nothing was written to flash',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum': 'the transfer checksum did not match the staged bytes',
  'commit.cause.unsupported':
    "the image did not decrypt under the camera's keys, or the data type is refused",
  'commit.cause.acceptance':
    'the image was refused by its acceptance check before anything was erased (the check depends on the build)',
  'commit.cause.notArmed': 'no bank upgrade was armed',
  'commit.cause.eraseFailed': 'the erase stage failed',
  'commit.cause.programFailed': 'the program stage failed',
  'commit.cause.verifyFailed': 'the verify stage failed',
  'commit.cause.unknown': 'a status not known here',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name} is not copied onto itself. Nothing was written.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Nothing was written.',
  'copy.refused.noPlain': '{name} has no decrypted image to copy. Nothing was written.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} is a ZIP that cannot be read here ({error}). Nothing was written.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} holds no whole flash. A ZIP is taken when it is a Preserve run file that holds {preserve} (once its full-dump step has run), a Dump & decrypt 4.x/Nano zip ({dump}) or a Dump all selectors zip ({selectors}); this ZIP holds {names}. Nothing was written.',
  'restore.refused.noWholeFlashPatched':
    "{file} holds no whole flash. A ZIP is taken when it is a Preserve run file that holds {preserve} (once its full-dump step has run), a Dump & decrypt 4.x/Nano zip ({dump}) or a Dump all selectors zip ({selectors}); this ZIP holds {names}. Its {patched} is the flash with the run's temporary patch in it, so it is not taken. Nothing was written.",
  'restore.refused.zipEmpty': 'nothing',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'a full flash backup is {full} B (4 MiB, the whole part a J-Link reads); {file} is {size} B. Nothing was written.',
  'restore.refused.noBank': "this build's plan has no {bank}. Nothing was written.",
  'restore.refused.outsideFlash': '{name} is not inside a 4 MiB flash. Nothing was written.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    '{where} was not read by the dump {file} comes from: by its manifest.json, {address} is a gap. There is no image to restore. Nothing was written.',
  'restore.refused.gapReason':
    '{where} was not read by the dump {file} comes from: by its manifest.json, {address} is a gap ({gap}). There is no image to restore. Nothing was written.',
  'restore.refused.gapFill':
    '{where} was not read by the dump {file} comes from: by its manifest.json, {address} is a gap, filled with {fill}. There is no image to restore. Nothing was written.',
  'restore.refused.gapReasonFill':
    '{where} was not read by the dump {file} comes from: by its manifest.json, {address} is a gap ({gap}), filled with {fill}. There is no image to restore. Nothing was written.',
  'restore.refused.empty':
    '{where} is empty: every byte is 0xFF. A write programs an image and cannot leave a bank erased, so an empty bank cannot be restored by a write. Nothing was written.',
  'restore.refused.fill':
    '{where} is {fill} in every byte, the fill the dump writes where it read nothing: the dump did not read this bank. There is no image to restore. Nothing was written.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    '{where} cannot be restored from this file: {why}. Nothing was written.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'this build has no write arm for the bank',
  'support.noStagingEmpty': 'this build has no staging form, so an empty bank is not written',
  'support.buildUnknown': 'the build is unknown',
  'support.unverifiedStaging':
    'this build is on the locked 0.x/1.x line but is not one of the builds the preservation patch tables were measured on (0.8.0.0 .. 1.3.0.8 and 1.0.3.0 / 1.0.3.2), so the staging form its bank takes is unknown and nothing is written',
  'support.unknownFamily':
    "the camera's family is not known, so neither is the key its banks are written under, and a camera takes a bank written under the wrong key and then will not start from it. Dump and decrypt this camera, identify it from the dump, then name its family with --family.",
  'support.noReadCommand':
    "firmware older than 0.8.0.0 has no read handler for GetFeaturedFirmwareData, the command a dump reads flash with. On 0.7.0.7 and 0.7.0.8 it is in the RPC method table at 0x4F but registered as a setter (write handler) only, so the control-IN read a dump sends cannot be dispatched (the preservation run reads those two builds through wire id 0x58, GetFeaturedData, instead); before 0.7.0.7 wire id 0x4F is UploadFirmwareRowSize, and on 0.3.0.1 wire id 0x52 — the one a dump arms with — is EnterBootloaderMode rather than BeginFirmwareUpgrade: the camera stays in its application, but every arm sets a flash target and arms that build's firmware-upgrade stage (GetErrorCode then reads 0x00400000), which is not a read window. Recovered from the images' own method tables, both handler columns; see test/firmware/facts.json.",
  'support.noWritePath':
    'these builds take new firmware through an older upgrade sequence that this toolkit does not send, and their banks were never mapped, so nothing is written.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'the firmware version could not be read, so the build, its banks and their staging form are unknown; nothing is read or written on it',
  'support.versionNotDotted':
    'firmware version "{version}" is not a dotted version, so the build, its banks and their staging form are unknown; nothing is read or written on it',
  'support.olderThanFirst':
    'firmware {version} is older than {first}: its RPC table has no read handler for GetFeaturedFirmwareData, the command a slot read sends, so neither a read nor a write is sent to it (early-compact has the evidence)',
  'support.modernOnLocked':
    'family modern-4x covers 2.x, 4.x, 10.x, 42.x and 44.x; {version} is on the 0.x / 1.x locked line, which needs legacy-auth or compact-2016',
  'support.lockedOnModern':
    'family legacy-auth covers the 0.x / 1.x locked line; {version} is on the modern line, which needs modern-4x',
  'support.notCompactPro':
    'family compact-2016 covers the Compact PRO 1.0.3.x line; {version} is not on it',
  'support.earlyCompact':
    'family early-compact covers the builds older than {first} only, and {version} is read through legacy-auth',
  'support.generic':
    'the camera family is not identified (family generic), so the bank layout and the staging form are unknown; identify the camera before a slot is read or written',
  'support.noPlan':
    'no slot plan exists for family {family}: its bank layout and staging form are not known',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    "this build's table does not arm mode {mode} at {address} on the plain channel",
  'support.noArmToken':
    "this build's table does not arm mode {mode} at {address} on the token channel",
  'support.windowElsewhere': 'the preservation bank window for {bank} is at {at}, not {address}',
  'support.noDumpWindow':
    "this build's BeginFirmwareUpgrade table has no window at {address} for {bank}",
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} does not support {capability}: {reason}',
  'support.capability.dump': 'dump',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': 'Dump all selectors',
  'support.capability.decrypt': 'decrypt',
  'support.capability.deviceInfo': "the Info tab's full read",
  'support.capability.flash': 'bank writes',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name} at {address} is not readable on this build: its selector table has no window there, so nothing was armed for it',
  'slots.unread.missing': '{name} is missing from the camera analysis',
  'slots.unread.notRead': '{name} was not read',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Nothing was written.',
  'slots.refused.versionUnknown':
    'the analysis does not say which firmware the camera runs, and the slot commands mean different things on different builds. Read the device info again.',
  'slots.refused.versionUnknownWrite':
    'the analysis does not say which firmware the camera runs. Nothing was written.',
  'slots.refused.emptyInput': 'the input is empty',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable': '{name} is empty and cannot be written on this build: {reason}',
  'slots.refused.noRaw': '{name} cannot take raw bytes on this build: {reason}',
  'slots.refused.noPlain': '{name} cannot take a decrypted image on this build: {reason}',
  'slots.refused.noStaging':
    '{name} has no staging form on this build, so an image cannot be encoded for it',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B is longer than {name} ({bankSize} B)',
  'slots.refused.imageTooLong': 'image is {size} B, longer than {name} ({bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'the 2014 bootloader does not take this build’s check sum in slot A or B, and starts recovery R (0x14070000) without checking it, so the patch is written into recovery R and nowhere else',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly': 'this build runs only from recovery R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize': 'a firmware bank is {size} B ({kib} KiB); this file is {count} B',
  'decryptFile.erasedBank': 'empty, nothing to decrypt: all {size} B read as 0xFF (an erased bank)',
  'decryptFile.erasedHeader':
    'erased: the header window is all 0xFF, so the bank holds no image; nothing is decrypted',
  'decryptFile.noHeader': 'no image header (magic {magic}), so there is no image to decrypt',
  'decryptFile.lengthOutOfRange': 'header.length {length} is out of range; no image to decrypt',
  'decryptFile.ffKeyB':
    'decrypted {size} B under FF 1.3.0.8 Key B: the image is stored as the image XOR its key block 1 keystream, header window verbatim',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'key not recovered: the image decrypts to a reset vector that is not a Cortex-M entry (key {check}); nothing is decrypted',
  'decryptFile.storedPlain':
    'stored plain: the bank holds the image as it runs (the 2014 plaintext chain, an identity keystream), so there is no key and the decrypted image is the image itself',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 'decrypted {size} B under the key recovered from this bank ({check})',
  'decryptFile.decryptedNamed':
    'decrypted {size} B under the key recovered from this bank ({check}; it is {key})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'short read ({size} B)',
  'read.reason.noParse': 'could not parse an image header',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'no image header (magic {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} is out of range',
  'read.reason.stopped': 'bank read stopped at {count}/{size} B',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'not readable on firmware {version}: its plan ({table}) has no window at {address}, so nothing was armed for it',
  'read.reason.notInPlanUnknown':
    'not readable on firmware of unknown version: its plan ({table}) has no window at {address}, so nothing was armed for it',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    "the window served a stale reader descriptor's bytes — word 0 {word} with reset {hex} is 0x14000000's vector table, not this bank's content, so nothing was analysed from it: {remedy}",
  'read.reason.spentReader': "the camera's slots could not be read — {remedy}",
  'read.spentRemedy':
    'the window reader may be spent for this boot; power-cycle the camera and retry',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    "the camera's active-slot word (fw info roots, selector 10) could not be read",
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    "the camera's active-slot word is {word}, which names no bank",
  'checkKey.unnamed.cfg0NotRead':
    'the boot-config word was not read, so whether the bootloader checked {bank} before it entered it is not known',
  'checkKey.unnamed.noZeroSum':
    'the camera reports it entered {bank}, but {bank} does not decrypt to a zero word sum on this read',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'the camera reports it entered {bank}, which the boot-config word {word} leaves to last, so the bootloader entered it without its check, but {bank} does not decrypt to a zero word sum on this read',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (score {score} after the read, from the evidence below)',
  'report.detectedAmbiguous':
    '{family} (score {score} after the read, from the evidence below; ambiguous)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'yes',
  'report.cell.no': 'no',
  'report.cell.notApplicable': 'n/a',
  'report.cell.unknown': 'unknown',
  'report.cell.recoveryOnly': 'recovery only',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'whitening K',
  'report.keyRow.store': 'store key',
  'report.keyRow.check': 'check key',
  'report.keyRow.table': 'key table',
  'report.keyRow.keys': 'keys',
  'report.keyRow.a': 'key A',
  'report.keyRow.b': 'key B',
  'report.keyRow.tableAt': 'table at',
  'report.key.notIdentified': '(not identified)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} candidate, none confirmed',
    other: '{count} candidates, none confirmed',
  },
  'report.key.tableAt': '{offset} in the bootloader block, confirmed against a slot',
  'report.key.plainChain':
    'none needed: the banks are stored as plain firmware, so a bank is read and written as it is',
  'report.key.tableRefused2016':
    'not read — the bootloader block (0x14000000) is refused on every channel on this line',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    "{key} {hex}{pair}, named from {bank}, the bank the camera reports it entered after the bootloader's check",
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, inferred from {bank}, the bank the camera reports it entered: the bootloader enters that bank without its check, and runs it under the key it checks the other banks under',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': " ({pair}'s block 1)",
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'the Compact PRO 1.0.3.x 9 Hz pair',
  'keyPair.cp1032ff': 'the Compact PRO 1.0.3.x FF pair',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'not named — {why}',
  'report.checkKey.couldNotName': 'the read could not name it',
  'report.storeKey.checkKeyUnnamed':
    'the key its bootloader checks a bank under (not named on this read): the application stores every bank it writes under that key',
  'report.storeKey.checkKey':
    '{key}: the application stores every bank it writes under the key its bootloader checks',
  'report.storeKey.unknown':
    'unknown — the bootloader block holding the per-device key slot was not read',
  'report.storeKey.keyBUnidentified':
    'Key B (no per-device key programmed; Key B itself not identified)',
  'report.storeKey.keyB': 'Key B (no per-device key programmed)',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain': 'staged plain (the image as it is, with no key)',
  'report.staged.slotKeystream': "staged under its image's own key block 0",
  'report.staged.keyA':
    'staged under keys derived from the booted bank and the running application',
  'report.staged.ffVendor':
    'staged as the vendor app stages the 16 Hz FF image (the image XOR its own key block 0), stored by the camera under Key B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Backup: block {address}',
  'progress.backupDone': 'Backup: every block read',
  'progress.checkBlock': 'Check: block {address}',
  'progress.checkDone': 'Check: every block read',
  'progress.writingBank': 'Writing {bank}',
  'progress.restoringBank': 'Restoring {bank}',
  'progress.staged': '{label}: staged {done}/{total} B',
  'progress.wholeFlash': 'Whole-flash read: {got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'read {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'read {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Done — {ok}/{total} windows read.',
  'progress.readingBank': 'Reading {bank} ...',
  'progress.analysing': 'Analysing ...',
  'progress.probeSelector': 'probe selector {selector} ...',
  'progress.selectorsArmed': 'Done — {armed}/{span} selectors armed, {withData} with data.',
  'progress.recoveringKey': 'decrypt: recovering key for {address} ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} {address} (subcmd {subcmd}) could not be read: {error}',
  'slots.read.refusedBuild':
    'refusing to read the firmware slots: {reason}. Nothing beyond the version read was sent, so no bank was touched.',
  'slots.backup.notSaved':
    'the backup {file} was not saved, so nothing was written. A write never runs without its backup saved first; try again once it can be saved.',
  'slots.backup.notSavedWhy':
    'the backup {file} was not saved ({error}), so nothing was written. A write never runs without its backup saved first; try again once it can be saved.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'high (480 Mbit/s)',
  'usb.speed.full': 'full (12 Mbit/s)',
  'usb.speed.code': 'code {code}',
} as const satisfies NamespaceMessages;
