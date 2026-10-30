/**
 * Namespace `preserve`, English source: the "Dump & decrypt 0.x/1.x 2014/2016" tab, a guided run that
 * backs up the camera, writes a temporary patch so the whole flash can be read, then puts the original
 * firmware back and checks it.
 *
 * Owner: phase 2, preserve agent.
 * Covers: views/PreserveView.tsx, hooks/usePreservePanel.ts, lib/preserve/* (gating.ts, types.ts).
 *
 * Words used all over this tab:
 * - run = one pass of the wizard on one camera, from the backup to the check. Run file = the zip the
 *   browser downloads after every step; it is the run's only record and lets a run continue later.
 * - Step 01 is Connect (shared with the other tabs); the phases are steps 02, 03 and 04. "Step 02"…
 *   keep the two-digit numbers.
 * - bank = one of the camera's three firmware slots, A, B and R (R = recovery). {bank}, {a}, {b}, {r}
 *   and {banks} are names from common:bank.*: "Slot A" / "Recovery R" on their own, "slot A" /
 *   "recovery R" inside a sentence. {banks} is a list of those names ("slot A, slot B and recovery R").
 * - the write = the patch written into the chosen banks (step 03); the restore = the original firmware
 *   written back (step 04); the whole-flash read = reading the full 4 MiB flash once the patch runs.
 * - "Connect device" is the page's connect button (app:connect.connect): use the same words.
 * - The step names on the chips (Backup, Patch, Write, Whole-flash read, Restore, Check) are core's
 *   words, translated in core:preserve.step.*. The sentences core writes ({why}, {reason}, {what},
 *   {build}…) arrive already translated, from the `core` namespace.
 * - SPI, SWD/J-Link, MiB/KiB, sha256, hex values and file names stay as they are.
 *
 * src/i18n/README.md has the conventions.
 */

import type { NamespaceMessages } from '../../types';

export default {
  /* ---- "What to expect", the first section ---- */
  'how.title': 'What to expect',
  'how.descriptionIdle': 'Connect the camera, then start at step 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Run {runId}.',
  'how.descriptionRunVersion': 'Run {runId} — firmware {version}.',
  'how.restarts':
    'The camera **restarts** during each step. After a restart Chrome no longer recognises it (it has no USB serial number), so the page asks you to press **Connect device** and pick the camera again. That is the normal flow — the step carries on by itself once you do.',
  'how.noFile': 'There is no firmware file to pick: everything is read from the camera itself.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'The camera keeps its firmware in three **banks** ({a}, {b} and {r}). Step 02 reads all three and works out which one the camera starts from next; the patch only works if that bank holds it. You choose the banks step 03 patches — by default the one the next start enters — and step 04 puts every one of them back.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    "After every step your browser downloads a **run file** named after the run's start, the save time and the step it reached (`{example}`), with one folder per step inside. Keep the newest one — it lets you continue later.",
  /* The amber warning under the list. */
  'how.writeWarning':
    "**Steps 03 and 04 write to the camera's flash**, and each asks you to confirm first. While one of them runs, keep the camera plugged in (unless the page asks you to replug it) and the computer awake, ideally on mains power. An interrupted write leaves a camera that only a hardware programmer (SPI or SWD/J-Link) can fix.",
  'how.phone':
    '**On a phone:** before step 03, turn on airplane mode and switch off Wi-Fi and mobile data, so a call or a notification cannot pull the browser away mid-write — and keep the screen on. The page keeps working offline once it is open.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**The write is not on record for this run, so the steps after it are shut.** The camera may already be running the patched image (an interrupted write) or may not (the write never started) — the run file cannot prove which. Do not run the whole-flash read or the restore against a patched camera without the write on record; the way forward is step 03, whose check before the write reads the bank and refuses to write it blindly again. Only if that check has already refused with *already holds the patched bytes* does the jump apply — and it goes through its own dialog.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Read & build',
  'phase.readBuild.inSentence': 'read & build',
  'phase.readBuild.description':
    'Reads everything a stock camera lets out — 31 blocks of 64 KiB — and keeps it as your backup, reads each firmware bank a second time, works out which bank the camera starts from next time, and prepares the small patch the next step writes. Nothing is written to the camera. Usually under a minute. If the camera needs a restart along the way, the page asks you to press "Connect device" and pick it again — that is expected.',
  'phase.patchDump.label': 'Write & whole-flash read',
  'phase.patchDump.inSentence': 'write & whole-flash read',
  'phase.patchDump.description':
    'Writes a small, temporary patch into the firmware banks chosen in step 02 (by default the bank the camera starts from next), so it can read out all of its flash. Then the camera restarts — press "Connect device" and pick it again when the page asks — and the whole 4 MiB flash is read. Step 04 puts the original firmware back.',
  'phase.restoreVerify.label': 'Restore & verify',
  'phase.restoreVerify.inSentence': 'restore & verify',
  'phase.restoreVerify.description':
    'Writes your original firmware back, restarts the camera (press "Connect device" and pick it again when asked), then reads everything once more to check it matches the backup byte for byte.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Reads the 31 blocks of 64 KiB a stock camera can read, then reads every bank a second time (the two reads must agree byte for byte), gets each bank’s firmware out of what the camera stores (decrypted where it is stored encrypted) and checks it, and works out which bank the camera starts next. This is the run’s only copy of this camera, taken before anything is written.',
  'step.patch.description':
    'Offline, no camera. Builds the patch for each bank the run can write: it lets the camera’s read reach the whole 4 MiB flash, and it is written in the form the camera stores it, so only the patch’s own bytes change.',
  'step.commit.description':
    'The write. Reads every chosen bank back first and writes nothing unless each still holds what the backup recorded (a write that already landed is never repeated), then writes each one, the bank the camera tries first last. The camera is not restarted here: the next step restarts it.',
  'step.drain.description':
    'Restarts the camera so it starts the patched firmware (it is silent for about ten seconds; the page waits and finds it again), checks which bank it started from (a bank without the patch stops the step before anything is read), then reads the whole 4 MiB flash in one read and puts each written bank’s original firmware, from the backup, into the saved image. Nothing is written.',
  'step.restore.description':
    'The other write. Writes each written bank’s original firmware back while the patched firmware still runs, then restarts the camera.',
  'step.verify.description':
    'After a fresh start, reads the 31 blocks again, every bank among them: 0 differing bytes proves the camera’s flash is byte-identical to the backup. Read-only.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Start {phase}',
  'phase.retry': 'Try {phase} again',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Go on to step 04: restore the banks',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Run past the unrecorded write',
  'phase.skipWrite': 'Skip the write — start at the whole-flash read',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': '{phase} actions',
  /* The badges beside the step's title. */
  'badge.writes': 'writes to the camera',
  'badge.running': 'Running',
  'badge.done': 'Done',
  'badge.plannedStop': 'Stopped as planned — the restore is next',
  'badge.failed': 'Stopped — see the log',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Up next',
  /* Why the start button is off. */
  'notReady.noRun': 'Available after step 02 — it starts the run.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Available after step {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Not ready yet — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Concerns the patched camera while the write is not on record — the camera may already be patched. See the note under “{section}”.',
  'phase.noDrain':
    'The whole-flash read has not run — this step puts the camera back without it. Run step 03 first unless the whole-flash read does not matter to you.',
  'phase.keepPlugged':
    'Keep the camera plugged in and the computer awake until this step finishes.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Progress',
  'phase.showDetails': 'Show details in the log',
  'phase.inDetail': 'What this step does, in detail',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Your turn',
  'yourTurn.reconnect.title': 'Your turn: press Connect device and pick the camera.',
  'yourTurn.reconnect.body':
    'The camera restarted, as planned. Chrome cannot recognise it again by itself (it has no USB serial number), so it needs you to pick it once more. The step carries on as soon as you do.',
  'yourTurn.replug.title':
    'Your turn: unplug the camera, plug it back in, then press Connect device.',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'This run’s patch was made before the reader fix, so the camera needs a fresh power-up before the restore. The run file is already saved.',
  'yourTurn.replugBeforeRestore.title':
    'Before step 04: unplug the camera, plug it back in, then press Connect device.',
  'yourTurn.powerCycle.title':
    'Your turn: unplug the camera, plug it back in, press Connect device — then try again.',
  'yourTurn.powerCycle.body':
    'The camera’s reader needs a fresh power-up before it can be read again. The run is still loaded here; nothing is lost.',
  'yourTurn.powerCycleAssert.title':
    'Your turn: unplug the camera, plug it back in, press Connect device — then continue.',
  'yourTurn.powerCycleAssert.body':
    'The last backup attempt stopped, and the camera needs a fresh power-up before it runs again. The camera cannot report that by itself, so the button below tells the page you did it.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'I replugged it — continue {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Which banks step 03 patches',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Boot-config word',
  'banks.lastStart': 'Last start',
  'banks.nextStart': 'Next start',
  'banks.caption': 'The three firmware banks, as step 02 read them',
  'banks.col.bank': 'Bank',
  'banks.col.address': 'Address',
  'banks.col.holds': 'What it holds',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'next start',
  'banks.choiceLabel': 'Banks to patch',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'The bank the next start enters',
  'choice.all': 'Every bank',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — not offered',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen': 'No bank is chosen yet: {what}. Choose a bank by name above.',
  'banks.writes': 'Step 03 writes {what}.',
  'banks.fixed':
    'The write has run, so the choice is fixed: step 04 puts back exactly these banks.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: not offered — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'no run is active — step 02 starts one',
  'banks.refusedBusy': 'a step is running — choose the banks once it has finished',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'The plan — {build}, patches {banks}',
  'plan.summaryNone': 'The plan — {build}, no bank chosen yet',
  'plan.yourCamera': 'your camera',
  'plan.intro':
    "Printed from the camera's own bytes. Nothing is written until step 03 runs, and step 04 puts every byte it writes back.",
  /* The rows; their values are core's. */
  'plan.build': 'Build',
  'plan.version': 'Firmware version',
  'plan.written': 'Written',
  'plan.route': 'Where it goes',
  'plan.restore': 'Restore',
  'plan.wholeFlash': 'Whole-flash read',
  'plan.outro':
    "In the form the camera stores, the same bytes change and no others, so the camera's firmware changes by exactly this difference and nothing else.",
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'The patch of {bank}',
  'bankPlan.titleChosen': '{bank} — written by this run',
  'bankPlan.titleNotChosen': '{bank} — not chosen',
  'bankPlan.source': 'Image source',
  'bankPlan.sourceValue': '{bank} as stored',
  'bankPlan.sourceTwoReads': '{bank} as stored, two agreeing reads (sha256 {sha})',
  'bankPlan.edit': 'Image edit',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) on the factory image. Its balance, {balance}, is in the adjust word; the patch balances on top of it, and step 04 puts the image back with the edit.',
  'bankPlan.factorySha': 'Factory plaintext sha256',
  'bankPlan.patchedSha': 'Patched sha256',
  'bankPlan.diffCount': 'Bytes that move on the part',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Staged length',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    one: '{size} B in {count} chunk',
    other: '{size} B in {count} chunks',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Rebalance word',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (was {balance}, the edit’s balance)',
  'bankPlan.caption': 'The exact bytes the patch moves in {bank}',
  'bankPlan.col.what': 'What it changes',
  'bankPlan.col.offset': 'Offset',
  'bankPlan.col.before': 'Before',
  'bankPlan.col.after': 'After',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Verified — a perfect match.** After a fresh start the camera was read again: {read}/31 blocks, {count} differing byte. Its flash is exactly what it was before the first write.',
    other:
      '**Verified — a perfect match.** After a fresh start the camera was read again: {read}/31 blocks, {count} differing bytes. Its flash is exactly what it was before the first write.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Verified — a perfect match.** After a fresh start the camera was read again: {read}/31 blocks, {count} differing byte (short blocks: {blocks}). Its flash is exactly what it was before the first write.',
    other:
      '**Verified — a perfect match.** After a fresh start the camera was read again: {read}/31 blocks, {count} differing bytes (short blocks: {blocks}). Its flash is exactly what it was before the first write.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**The check found differences against the backup.** {error}',
  unknownReason: 'unknown reason',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — write to {banks}?',
  'confirm.titleJump': '{phase} — jump past the unrecorded write?',
  'confirm.chosenBanks': 'the chosen banks',
  'confirm.jump':
    "THE WRITE IS NOT ON RECORD for this run, and you are asserting that the writes landed without their checkpoints: the step starts past the write instead of writing again. The steps' own checks still run — the version read, the bank checks — and a wrong guess costs a wasted whole-flash read, not a bricked camera.",
  'confirm.jumpKeepPlugged':
    'Keep the camera plugged in and the computer awake until the step finishes.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'This writes a small patch into {banks}. Step 04 puts the originals back. The whole-flash read that follows only reads.',
  'confirm.patchInOrder':
    'This writes a small patch into {banks}, in that order — the bank the camera tries first goes last. Step 04 puts the originals back. The whole-flash read that follows only reads.',
  /* Step 04. */
  'confirm.restore': 'This writes your original firmware back into {banks}.',
  'confirm.restoreInOrder':
    'This writes your original firmware back into {banks}, in that order — the bank the camera tries first goes first.',
  'confirm.keepPlugged':
    'Keep the camera plugged in and the computer awake while it writes — an interrupted write leaves a camera that only a hardware programmer (SPI or SWD/J-Link) can fix. On a phone, airplane mode on and the screen kept on. The camera then restarts; when the page asks, press Connect device and pick it again. That is expected.',
  'confirm.yesJump': 'Yes — jump past the write',
  'confirm.yesWrite': 'Yes — write to the camera',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'The proof',
  'summary.complete': 'Complete image (4 MiB)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'not produced',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'differs from the backup in {differing} of {count} block: {blocks}',
    other: 'differs from the backup in {differing} of {count} blocks: {blocks}',
  },
  'summary.matches': {
    one: 'matches the backup on its {count} block',
    other: 'matches the backup on all {count} blocks',
  },
  'summary.onlyInFull': 'Only in the whole-flash read',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} block a stock read cannot reach: {blocks}',
    other: '{count} blocks a stock read cannot reach: {blocks}',
  },
  'summary.rawDump': 'Whole-flash read, as read',
  'summary.rawDumpBadge': 'the same, with the patch still in',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Firmware image (decrypted, {bank})',
  'summary.verify': 'Verify',
  'summary.toolbar': 'Archive actions',
  'summary.download': 'Download the full archive (run file)',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Optional — to continue a run later',
  'runFile.title': 'Run file',
  'runFile.description':
    "The run's only record. It downloads by itself after every step (and after a step that stopped early); keep the newest one. To continue later, or after a problem, load it here and the page picks up where it left off.",
  'runFile.run': 'Run',
  'runFile.file': 'File',
  'runFile.lastSaved': 'Last saved',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'after {step} — {at} ({bytes} B)',
  'runFile.nextStep': 'Next step',
  'runFile.none': 'No run is active. Step 02 starts one, or load a run file here.',
  'runFile.toolbar': 'Run file actions',
  'runFile.load': 'Load a run file…',
  'runFile.save': 'Save the run file again',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Resume',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'No run file chosen.',
  'status.notRun': 'Not run yet.',
  'status.running': 'Running …',
  'status.runningRestarts': 'Running — the camera restarts during this step …',
  'status.restarting': 'The camera is restarting — this takes about ten seconds …',
  'status.waitConnect': 'Waiting for you — press "Connect device" and pick the camera …',
  'status.waitPlugBack': 'Waiting for you — plug the camera back in, then press "Connect device" …',
  'status.waitReplug': 'Waiting for you — unplug the camera and plug it back in …',
  'status.back': 'The camera is back — continuing …',
  'status.swapped': 'Stopped — the camera changed. Check it, then run the phase again.',
  'status.noRun': 'No run.',
  'status.notCreated': 'Not created — see the log above.',
  'status.refused': 'Refused — the phase list above says what is missing.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} — done. The run file in your downloads is up to date.',
  'status.doneReplug':
    '{phase} — done, and the run file is saved. Before the restore: unplug the camera, plug it back in and press "Connect device".',
  'status.backupRefused': 'Refused — nothing was written. See the log above.',
  'status.failed': 'Failed — see the log above.',
  'status.cancelled': 'Cancelled — the run file still says where the run stopped.',
  'status.readingFile': 'Reading run file …',
  'status.doneEarlier': 'Done earlier — loaded from the run file.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Failed earlier: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Resumed at {step}. The phase list picks up from there.',
  'status.notResumed': 'Not resumed — see the log above.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'needs {missing}',
  'gate.noRun': 'no run is active — the first phase creates the run',
  'gate.runDone': 'this run is done — every phase completed',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'already done — resume continues at {step}',
  'gate.banksRead': 'the banks the backup reads',
  'gate.choice': 'a choice of banks — {why}',
  'gate.bankRefused': '{bank} cannot be written: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute': 'the recovery-slot route (this build runs only from {r}, not {bank})',
  'gate.backupFirst': 'the flash backup (it runs first in this phase)',
  'gate.backup': 'the flash backup',
  'gate.patchStep': 'the patch step',
  'gate.patchOf': 'the patch of {bank}',
  'gate.backupFile': 'the backup windows file',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': '{bank}’s capture',
  'gate.derived': '{bank}’s derived image',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'the Write step (run or resume at it first)',
  'gate.drainRefused': 'the whole-flash read refuses on {build} — {why}',
  'gate.patchSummary': 'the patch summary of {bank} (the staged length)',
  'gate.restoreRefused':
    'the restore refuses on {build} — no form of the original firmware stores back as the original bytes; the run ends with the complete image and the patch in place',
  /* {file} is a file name in the run file. */
  'gate.plaintext': '{bank}’s factory plaintext ({file}, from the backup step)',
  'gate.restoreFirst': 'the restore (it runs first in this phase)',
  'gate.powerCycle':
    'the power-cycle assertion — power-cycle the camera (unplug and replug it, or use its power switch), then use the re-run control',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'the camera did not come back after {minutes} min of retrying: {error} — if Chrome asked nothing, replug the camera and run the phase again; if the log said to re-connect it, the "Connect device" click is what it was waiting for',
} as const satisfies NamespaceMessages;
