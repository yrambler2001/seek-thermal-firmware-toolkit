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
 * For translators:
 * - A param that is a bank (`{bank}`, `{first}`, `{name}`, `{target}`) arrives
 *   already named in your language from common:bank.* (in-sentence form, or the
 *   label form "Slot A" where the English starts a sentence or names a row).
 * - `{why}`, `{reason}`, `{verdict}` and `{banks}` are other core sentences or
 *   lists, already translated; a `{why}` that starts a sentence arrives with a
 *   capital first letter.
 * - `{word}`, `{offset}`, `{file}`, `{key}`, `{holds}`, `{count}` are values
 *   (hex, a file name, a key's name such as "Key A") and stay as they are.
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
  'fpsBoot.cannotPatch':
    '{bank} cannot be patched here ({reason}), so a frame-rate patch in another bank does not take effect on this camera.',

  /* ---- backup: the zip saved before a bank write (slots/backup) ---- */
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
  'upgrade.targetBooted':
    '{name} is both the bank the camera booted from and the bank its own upgrade writes. An upgrade run from this camera would overwrite the image it is running. This is a warning only: nothing here stops an upgrade.',
  /** `{verdict}` is one of upgrade.verdict.*. */
  'upgrade.whileRecovery':
    'The camera is running its recovery bank, and its own upgrade writes {name}, which it is not running. {verdict} This is a warning only: nothing here stops an upgrade.',
  'upgrade.verdict.notRead':
    '{name} could not be read on this check, so what it holds is not known.',
  'upgrade.verdict.blank': '{name} is blank, so the upgrade writes into an empty bank.',
  'upgrade.verdict.bootableSame':
    '{name} holds the same bootable image as the bank it runs, which the upgrade replaces; if the upgrade stops partway, {name} is left unbootable.',
  'upgrade.verdict.bootable':
    '{name} holds a bootable image, which the upgrade replaces; if the upgrade stops partway, {name} is left unbootable.',
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
  /** `{name}` is a bank (label form); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
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
} as const satisfies NamespaceMessages;
