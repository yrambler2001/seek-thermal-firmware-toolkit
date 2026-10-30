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
 *     (report.checkKey.pair, or nothing), and `{note}` in
 *     preserve.refused.recoveryOnly. Each is another key of
 *     this namespace (the comment above a key says which), already in your
 *     language. A `{why}` that starts a sentence arrives with a capital letter.
 *   - a list: `{banks}`, `{reasons}` (joined with your common:list.* words, or
 *     "; " where the English uses a semicolon).
 * - Params that stay AS THEY ARE: hex values and offsets (`{word}`, `{offset}`,
 *   `{sum}`, `{hex}`, `{address}`, `{at}`, `{status}`, `{magic}`, `{length}`,
 *   `{k}`), byte counts (`{size}`, `{count}`, `{kib}`), mode numbers (`{mode}`),
 *   a score (`{score}`), firmware versions (`{version}`, `{image}`, `{camera}`,
 *   `{firmware}`, `{builds}`, `{only}`, and `{first}` in support.*), file
 *   names (`{file}`), a SHA-256 (`{sha256}`), a selector table's name
 *   (`{table}`) and family names (`{family}`, `{detected}`).
 * - Still English inside a translated sentence (core gives them no code yet):
 *   `{reason}` in fpsBoot.cannotPatch (the patch table's reason); `{note}` in
 *   identity.versionUnknown; `{reasons}` in writeRefusal.otherFamily (the
 *   detection's evidence); `{error}` when the error has no code, and a read
 *   reason (read.reason.*'s place) that came from such an error.
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
  'keys.noKnownKey': 'no known key',

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
  /** `{source}` is keys.source.*. */
  'keys.evidence.applicationKeyA':
    'the running application ({bank}, firmware {firmware}) carries its Key A {keyA} at {keyAAt}, from {source}',
  'keys.evidence.applicationKeys':
    'the running application ({bank}, firmware {firmware}) carries its Key A {keyA} at {keyAAt}, from {source}, and its Key B {keyB} at {keyBAt}',
  'keys.source.keyTable': "the bootloader's key table",
  /** `{builds}`: firmware versions. */
  'keys.source.applicationPair': 'the decoded application pair of {builds}',
  'keys.evidence.perDevice':
    'a per-device key is programmed, so the application re-encrypts under it',
  'keys.evidence.noPerDevice':
    'no per-device key is programmed, so the application re-encrypts under its own Key B',
  'keys.evidence.storeKey':
    "the application's store key is the bootloader's {key} ({hex}), so the writes store every bank under it; the booted {bank} holds {held}, which the bootloader accepts as well",
  'keys.evidence.bootedKey':
    "the booted {bank} decrypts under {key} ({hex}), a key the bootloader tries; the application's store key is not the bootloader's, so the writes store every bank under the booted bank’s key",
  /** `{masks}`: key names joined with commas. */
  'keys.evidence.masks':
    'the upload is the image XOR the keystreams of {masks}; the device stores the image under {key}',
  /** `{held}` is a key name or keys.noKnownKey. */
  'keys.evidence.otherBank':
    '{bank} decrypts under {held}; it is written under {key} by the same rule, and read back to check',

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
  /** `{keyA}`, `{keyB}`: how many times each key occurs. */
  'keys.refused.noApplicationPairCounted':
    "the running application ({bank}, firmware {firmware}) carries none of the known key pairs (the bootloader's and the decoded application pairs), each half exactly once, so its Key A cannot be located in its image (the bootloader's Key A occurs {keyA} time(s), its Key B {keyB})",
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'the running application ({bank}, firmware {firmware}) checks an upload under its own keys before it programs it (the decoded source of this build tries the upload under its Key A and its store key, as its bootloader tries a bank), and the key the writes store under, {key} ({hex}), is neither its Key A nor its store key, so the camera would refuse the upload with 0x50000 before erasing anything',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum': "no slot decrypts to {family}'s {sum} acceptance sum",
  'writeRefusal.keyTable': "this camera's key table could not be confirmed",
  'writeRefusal.whitening':
    "this camera's key table resolves under K={k} but {family} encrypts under K={expected}",
  /** `{reasons}`: the detection's evidence, joined with "; " (English: detection has no codes yet). */
  'writeRefusal.otherFamily':
    'the evidence says this camera is {detected}, not {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with "; ". */
  'writeRefusal.camera': 'this camera cannot be written from here: {reasons}',

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

  /* ---- notes: what the read measured about a build, a bank or an empty bank (slots/capability-notes) ----
   * Mode numbers, addresses, version numbers and command names (CompleteMemoryUpgrade, BeginFirmwareUpgrade,
   * EP0, PRESERVATION.md) are names: keep them. `{untested}` is notes.ffBootUntested. */
  'notes.lockedBootWord':
    'The booted bank named on this line is the bank the camera entered at its last start, as the active-slot word records it (0 slot A, 1 slot B, 2 recovery R). The next start is set by the boot-config word: 0 or 0xFFFFFFFF choose A first, 1 B first, any other value recovery R first. Recovery R runs whenever A and B hold nothing the 2014 bootloader takes (a bank whose words sum to 0), whatever R holds (measured on a camera).',
  'notes.locked2016BootWord':
    'The booted bank named on this line is the bank the camera entered at its last start, as the bootloader records it in the active-slot word (0 slot A, 1 slot B, 2 recovery R). The next start is set by the boot-config word: 0 or 0xFFFFFFFF choose A first, 1 B first, any other value recovery R first. The 2016 bootloader takes a bank only when it decrypts to a word sum of 0 under the key it checks a bank under (key block 1 on its 1.2.0.0 bootloader), and the last bank of that order runs unchecked when the other two fail. The read names that key from the bank the camera entered, because the bootloader block that holds it is refused on every channel (measured on a camera).',
  'notes.ep0of1032':
    '1.0.3.2: EP0 sessions die at about 64 to 81 KB and 128 B is the lossless read unit, so one 64 KiB bank per session is the measured limit. A whole-part drain is refused on this build (PRESERVATION.md: no single-arm drain exists). The slot dump reads one bank at a time, in 64-byte asks.',
  'notes.token':
    'Banks are locked on this line: the camera opens a bank for a write only when it is asked with the line’s unlock, which is the same in all 22 firmware images of this line on record. A camera with another unlock refuses its banks.',
  'notes.staging.lockedPlain':
    'Staged: the image itself, at most 56 KiB (the most the camera takes in one write). The write erases the 64 KiB bank and writes exactly those bytes, and the rest of the bank reads erased. The bootloader starts a bank only when its words sum to 0, so the image is balanced to that sum before it is sent.',
  'notes.staging.locked2016':
    'Staged: the image, XORed with the xorshift128 keystream of its OWN key block 0 (the stage key, found in the image by value), image length only (at most 0xE000 bytes). The device decrypts the payload with that key and stores it under the key its bootloader checks a bank under (key block 1), so the stored bytes are not the staged ones. Nothing is read from the target bank to stage it: the bank’s keystream is used only to read the bank back.',
  'notes.staging.modern':
    'Staged: the whole 64 KiB bank, image + 0xFF pad + "CODE" footer. The image is XORed with the keystreams that make the running application’s own two passes land it under the key the booted bank holds: when the commit command (CompleteMemoryUpgrade) takes data type 7, 8 or 9, the application decrypts the upload with its Key A, re-encrypts it under its store key and programs the bank. The footer is what lets the bootloader take the bank, so a bank short of it is refused.',
  'notes.modernGap':
    'Slot B is 0x14050000 on this line (mode 8). No selector reaches 0x14060000 on any 2.x, 4.x, 10.x, 42.x or 44.x build (decoded from the 14 post-2018 corpus images), so no bank sits there. The 0x14060000 layout belongs to the locked 0.x/1.x line.',
  'notes.modernNamedWrite':
    'Named writes (modes 7 to 9) are decoded from the firmware. The emulator writes A, B and R through them on the 4.x builds, and on a camera slot A of a Compact XR 4.8.2.1 was written through mode 7 by the frame-rate patch. A slot write never arms mode 0, the upgrade target.',
  'notes.unverified':
    'Read only. The bank layout is the locked line’s decoded table, but no staging form has been measured for this build, so no write is planned.',
  'notes.empty.plain':
    'An empty bank takes an image exactly as a used one does. The plaintext chain stages the image bytes as they are, with no key, and the commit erases the block first, so nothing is read from the target bank. Measured on a Compact: an image written into an empty slot B read back identical, and B booted alone.',
  'notes.empty.modern':
    'An empty bank takes an image exactly as a used one does. The payload is encrypted under keys derived from the booted bank and the running application, not from the target bank, and the device re-keys it and erases the block without reading it. The footer is copied from a bank that holds a valid one, else built blank. Proven on the emulator; not yet measured on a camera.',
  'notes.empty.locked2016':
    'An empty bank takes an image exactly as a used one does. The stage key is key block 0 of the IMAGE’s own pair, not a key read from the target bank, and the device decrypts the payload with it, stores it under its own key and erases the block without reading it. Proven on the emulator; not yet measured on a camera.',
  'notes.mode2of080':
    '0.8.0.0: mode 2 (0x14000000) is a crash hazard on this build, an armed read walks off SRAM (PRESERVATION.md). A slot read or write arms modes 7 to 9 only and never mode 2.',
  'notes.keyPairs2016':
    'The 9 Hz builds of 1.0.3.0 and 1.0.3.2 share one key pair, and the FF builds share another. The version string does not tell them apart, so the keystream is recovered from the bank itself and the bank’s own image decides.',
  'notes.board1030':
    'The 1.0.3.0 app reboots on any board but the Compact Pro’s, so a Compact board runs it only with the board patch in its banks.',
  'notes.bank.modernA':
    'Written through a bank arm the modern map leaves out; a Compact XR 4.8.2.1 took a write through it on a camera.',
  'notes.bank.recovery2016':
    'Measured on a Compact PRO 1.0.3.0: recovery R took its own image, a one-byte change and the raw bytes as they were sent, each written without an error.',
  'notes.bank.ff1308A':
    'The 1.3.0.8 FF (16 Hz) image goes here in the form the vendor app sends it, and the camera stores it under its own key. The 2014 bootloader starts a bank only when its words sum to 0, so it passes this one over at boot; whether the 16 Hz build starts from slot A is UNTESTED. The 8 Hz image is written as it is.',
  'notes.bank.ff1308B':
    'The 1.3.0.8 FF (16 Hz) image goes here in the form the vendor app sends it, and the camera stores it under its own key. The 2014 bootloader starts a bank only when its words sum to 0, so it passes this one over at boot; whether the 16 Hz build starts from slot B is UNTESTED. The 8 Hz image is written as it is.',
  'notes.bank.ff1308R':
    'The 1.3.0.8 FF (16 Hz) image goes here in the form the vendor app sends it, and the camera stores it under its own key. The 0.9.0.0 bootloader starts recovery R as it is stored, without decoding it, so this form may not start: UNTESTED, and an earlier form of this image did start from here (measured on a camera). The 8 Hz image is written as it is.',
  'notes.product.4_8_2_1':
    'Compact 4.8.2.1 and Compact XR 4.8.2.1 (one image): the modern 63-window map; the emulator confirmed 63 of 63 windows on the Compact’s full dump and on the Compact XR’s.',
  'notes.product.10_9_1_31':
    'Mosaic 320x240 10.9.1.31: the modern 63-window map, measured confirming every window on the emulator.',
  'notes.product.2_27_1_33':
    'Mosaic 320x240 FF 2.27.1.33: the modern 63-window map, measured confirming every window on the emulator.',
  'notes.product.42_32_3_10':
    'Nano 200 42.32.3.10: the modern 63-window map, measured confirming every window on the emulator. Its commit command (CompleteMemoryUpgrade) has no handler for data type 32, which a write through mode 7, 8 or 9 never asks for.',
  'notes.product.44_27_3_10':
    'Nano 300 44.27.3.10: the modern 63-window map, measured confirming every window on the emulator. Its arm command (BeginFirmwareUpgrade) refuses a data type past the span it accepts (0x7F) as a bad first argument, and modes 7 to 9 are inside that span.',
  'notes.ff1308':
    "1.3.0.8-FF (16 Hz) reports the same version as the 8 Hz build. The read tells them apart from the camera: the camera says, bank by bank, whether its application takes the bank, and each build predicts its own answers from the banks. The FF image is sent in the form the vendor app sends it, and the camera stores it under its own key. It goes to slot A, slot B or recovery R. The 8 Hz build is expected to refuse it before it writes anything; while the camera's answers cannot tell the builds apart, the plan says what each build does with it. {untested}",

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: the version read's own account (English). Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'the camera did not report its firmware version ({note}); a command number does not mean the same thing on every Seek firmware — on Compact 0.3.0.1 wire id 0x52, the id that arms a read window, is EnterBootloaderMode — so until the version is known nothing is sent but GetErrorCode, GetOperationMode and GetFirmwareInfo, the reads every build answers the same way',
  'identity.predates':
    'firmware {version} predates the dump protocol: its RPC method table has no read handler for GetFeaturedFirmwareData (on 0.7.0.7 and 0.7.0.8 it is registered as a setter only, and before that wire id 0x4F is UploadFirmwareRowSize), so no window can be read with it; on 0.3.0.1 wire id 0x52 is EnterBootloaderMode rather than BeginFirmwareUpgrade. The preservation run reads 0.7.0.7 and 0.7.0.8 through wire id 0x58 (GetFeaturedData) instead',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'refusing to {operation}: {reason}',
  'identity.refusingNoVersion':
    'refusing to {operation}: {reason}. Nothing was armed. Unplug the camera, let it finish starting up, plug it back in and try again.',
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
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with "; ". */
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
  'preserve.result.verifyDiffersUnread':
    '{label}: {blocks} blocks read again, {bytes} bytes differ, {unread} block(s) could not be read.',
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
  'slots.refused.rawTooLong': '{size} B is longer than the {name} bank ({bankSize} B)',
  'slots.refused.imageTooLong': 'image is {size} B, longer than the {name} bank ({bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'the 2014 bootloader does not take this build’s check sum in slot A or B, and starts recovery R (0x14070000) without checking it, so the patch is written into recovery R and nowhere else',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly': 'this build runs only from recovery R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size as "64 KiB". */
  'decryptFile.wrongSize': 'a firmware bank is {size} B ({kib}); this file is {count} B',
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
  'report.key.candidates': '{count} candidate(s), none confirmed',
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
  /** Starts with a space; `{pair}` is an image pair's name (stays as it is). */
  'report.checkKey.pair': " ({pair}'s block 1)",
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
  /** How each bank is staged: said after "each bank" (info:report.oneBank). */
  'report.staged.plain': 'staged plain (the image as it is, with no key)',
  'report.staged.slotKeystream': "staged under its image's own key block 0",
  'report.staged.keyA':
    'staged under keys derived from the booted bank and the running application',
  'report.staged.ffVendor':
    'staged as the vendor app stages the 16 Hz FF image (the image XOR its own key block 0), stored by the camera under Key B',
} as const satisfies NamespaceMessages;
