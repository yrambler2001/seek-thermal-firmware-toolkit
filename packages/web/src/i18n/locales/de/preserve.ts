/**
 * Namespace `preserve`, Deutsch (de), translated from the English source: the "Dump & decrypt 0.x/1.x" tab, a guided run that
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

import type { Translation } from '../../types';

export default {
  /* ---- "What to expect", the first section ---- */
  'how.title': 'Was Sie erwartet',
  'how.descriptionIdle': 'Verbinden Sie die Kamera und beginnen Sie dann mit Schritt 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Durchlauf {runId}.',
  'how.descriptionRunVersion': 'Durchlauf {runId} — Firmware {version}.',
  'how.restarts':
    'Die Kamera wird in jedem Schritt **neu gestartet**. Nach einem Neustart erkennt Chrome sie nicht mehr (sie hat keine USB-Seriennummer), daher bittet die Seite Sie, auf **Gerät verbinden** zu klicken und die Kamera erneut auszuwählen. Das ist der normale Ablauf — der Schritt läuft von selbst weiter, sobald Sie das getan haben.',
  'how.noFile':
    'Es gibt keine Firmware-Datei auszuwählen: Alles wird aus der Kamera selbst gelesen.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'Die Kamera hält ihre Firmware in drei **Slots** ({a}, {b} und {r}). Schritt 02 liest alle drei und ermittelt, aus welchem Slot die Kamera beim nächsten Mal startet; der Patch wirkt nur, wenn dieser Slot ihn enthält. Sie wählen die Slots, die Schritt 03 patcht — standardmäßig den, aus dem der nächste Start erfolgt —, und Schritt 04 stellt jeden davon wieder her.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'Nach jedem Schritt lädt Ihr Browser eine **Durchlaufdatei** herunter, benannt nach dem Beginn des Durchlaufs, der Speicherzeit und dem erreichten Schritt (`{example}`), mit einem Ordner pro Schritt darin. Behalten Sie die neueste — damit können Sie später weitermachen.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**Die Schritte 03 und 04 schreiben in den Flash-Speicher der Kamera**, und jeder bittet Sie vorher um Bestätigung. Während einer von ihnen läuft, lassen Sie die Kamera angeschlossen (außer die Seite bittet Sie, sie neu einzustecken) und den Computer wach, am besten am Netzstrom. Ein unterbrochener Schreibvorgang hinterlässt eine Kamera, die nur noch ein Hardware-Programmiergerät (SPI oder SWD/J-Link) retten kann.',
  'how.phone':
    '**Auf einem Telefon:** Schalten Sie vor Schritt 03 den Flugmodus ein sowie WLAN und mobile Daten aus, damit kein Anruf und keine Benachrichtigung den Browser mitten im Schreiben verdrängt — und lassen Sie den Bildschirm an. Die Seite funktioniert offline weiter, sobald sie geöffnet ist.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**Der Schreibvorgang ist für diesen Durchlauf nicht verzeichnet, daher sind die Schritte danach gesperrt.** Die Kamera führt möglicherweise schon das gepatchte Image aus (ein unterbrochener Schreibvorgang) oder auch nicht (der Schreibvorgang hat nie begonnen) — die Durchlaufdatei kann nicht belegen, was zutrifft. Führen Sie das volle Auslesen oder die Wiederherstellung nicht an einer gepatchten Kamera aus, solange der Schreibvorgang nicht verzeichnet ist. Der Weg nach vorn ist Schritt 03: Seine Prüfung vor dem Schreiben liest den Slot und weigert sich, ihn noch einmal blind zu beschreiben. Nur wenn diese Prüfung bereits mit *already holds the patched bytes* abgelehnt hat, gilt der Sprung — und er läuft über einen eigenen Dialog.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Lesen & vorbereiten',
  'phase.readBuild.inSentence': 'Lesen & vorbereiten',
  'phase.readBuild.description':
    'Liest alles, was eine Kamera im Originalzustand herausgibt — 31 Blöcke zu 64 KB — und bewahrt es als Ihre Sicherung auf, liest jeden Firmware-Slot ein zweites Mal, ermittelt, aus welchem Slot die Kamera beim nächsten Mal startet, und bereitet den kleinen Patch vor, den der nächste Schritt schreibt. Es wird nichts in die Kamera geschrieben. Dauert meist weniger als eine Minute. Wenn die Kamera zwischendurch neu starten muss, bittet die Seite Sie, auf „Gerät verbinden“ zu klicken und sie erneut auszuwählen — das ist so vorgesehen.',
  'phase.patchDump.label': 'Schreiben & volles Auslesen',
  'phase.patchDump.inSentence': 'Schreiben & volles Auslesen',
  'phase.patchDump.description':
    'Schreibt einen kleinen, vorübergehenden Patch in die in Schritt 02 gewählten Firmware-Slots (standardmäßig in den Slot, aus dem die Kamera beim nächsten Mal startet), damit die Kamera ihren gesamten Flash-Speicher herausgibt. Dann startet die Kamera neu — klicken Sie auf „Gerät verbinden“ und wählen Sie sie erneut aus, wenn die Seite darum bittet —, und der gesamte 4-MB-Flash-Speicher wird gelesen. Schritt 04 bringt die Original-Firmware zurück.',
  'phase.restoreVerify.label': 'Wiederherstellen & prüfen',
  'phase.restoreVerify.inSentence': 'Wiederherstellen & prüfen',
  'phase.restoreVerify.description':
    'Schreibt Ihre Original-Firmware zurück, startet die Kamera neu (klicken Sie auf „Gerät verbinden“ und wählen Sie sie erneut aus, wenn Sie darum gebeten werden) und liest dann alles noch einmal, um zu prüfen, dass es Byte für Byte mit der Sicherung übereinstimmt.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Liest die 31 Blöcke zu 64 KB, die eine Kamera im Originalzustand lesen lässt, liest dann jeden Slot ein zweites Mal (beide Lesevorgänge müssen Byte für Byte übereinstimmen), gewinnt die Firmware jedes Slots aus dem, was die Kamera speichert (entschlüsselt, wo sie verschlüsselt gespeichert ist), prüft sie und ermittelt, aus welchem Slot die Kamera als Nächstes startet. Das ist die einzige Kopie dieser Kamera im Durchlauf, erstellt, bevor irgendetwas geschrieben wird.',
  'step.patch.description':
    'Offline, ohne Kamera. Baut den Patch für jeden Slot, den der Durchlauf beschreiben kann: Er lässt den Lesebefehl der Kamera den gesamten 4-MB-Flash-Speicher erreichen und wird in der Form geschrieben, in der die Kamera ihn speichert, sodass sich nur die eigenen Bytes des Patches ändern.',
  'step.commit.description':
    'Der Schreibvorgang. Liest zuerst jeden gewählten Slot zurück und schreibt nichts, wenn nicht jeder noch genau das enthält, was die Sicherung festgehalten hat (ein Schreibvorgang, der schon angekommen ist, wird nie wiederholt). Dann schreibt er jeden Slot, den Slot, den die Kamera zuerst versucht, als letzten. Die Kamera wird hier nicht neu gestartet: Das tut der nächste Schritt.',
  'step.drain.description':
    'Startet die Kamera neu, damit sie die gepatchte Firmware startet (sie ist etwa zehn Sekunden still; die Seite wartet und findet sie wieder), prüft, aus welchem Slot sie gestartet ist (ein Slot ohne den Patch hält den Schritt an, bevor irgendetwas gelesen wird), liest dann den gesamten 4-MB-Flash-Speicher in einem Durchgang und setzt die Original-Firmware jedes beschriebenen Slots, aus der Sicherung, in das gespeicherte Abbild ein. Es wird nichts geschrieben.',
  'step.restore.description':
    'Der andere Schreibvorgang. Schreibt die Original-Firmware jedes beschriebenen Slots zurück, solange die gepatchte Firmware noch läuft, und startet die Kamera dann neu.',
  'step.verify.description':
    'Liest nach einem frischen Start die 31 Blöcke erneut, darunter jeden Slot: 0 abweichende Bytes belegen, dass der Flash-Speicher der Kamera byteidentisch mit der Sicherung ist. Nur Lesen.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': '{phase} starten',
  'phase.retry': '{phase} erneut versuchen',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Weiter zu Schritt 04: Slots wiederherstellen',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Nicht verzeichnetes Schreiben überspringen',
  'phase.skipWrite': 'Schreiben überspringen — mit dem vollen Auslesen beginnen',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': 'Aktionen: {phase}',
  /* The badges beside the step's title. */
  'badge.writes': 'schreibt in die Kamera',
  'badge.running': 'Läuft',
  'badge.done': 'Fertig',
  'badge.plannedStop': 'Wie geplant angehalten — Wiederherstellung folgt',
  'badge.failed': 'Angehalten — siehe Protokoll',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Als Nächstes',
  /* Why the start button is off. */
  'notReady.noRun': 'Verfügbar nach Schritt 02 — er startet den Durchlauf.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Verfügbar nach Schritt {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Noch nicht bereit — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Betrifft die gepatchte Kamera, solange der Schreibvorgang nicht verzeichnet ist — die Kamera ist möglicherweise bereits gepatcht. Siehe den Hinweis unter „{section}“.',
  'phase.noDrain':
    'Das volle Auslesen ist nicht gelaufen — dieser Schritt stellt die Kamera ohne es wieder her. Führen Sie zuerst Schritt 03 aus, es sei denn, das volle Auslesen ist Ihnen nicht wichtig.',
  'phase.keepPlugged':
    'Lassen Sie die Kamera angeschlossen und den Computer wach, bis dieser Schritt fertig ist.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Fortschritt',
  'phase.showDetails': 'Details im Protokoll anzeigen',
  'phase.inDetail': 'Was dieser Schritt im Einzelnen tut',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Sie sind dran',
  'yourTurn.reconnect.title':
    'Sie sind dran: Klicken Sie auf „Gerät verbinden“ und wählen Sie die Kamera aus.',
  'yourTurn.reconnect.body':
    'Die Kamera wurde wie geplant neu gestartet. Chrome kann sie nicht von selbst wiedererkennen (sie hat keine USB-Seriennummer), daher müssen Sie sie noch einmal auswählen. Der Schritt läuft weiter, sobald Sie das tun.',
  'yourTurn.replug.title':
    'Sie sind dran: Ziehen Sie die Kamera ab, stecken Sie sie wieder ein und klicken Sie dann auf „Gerät verbinden“.',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'Der Patch dieses Durchlaufs wurde vor der Lese-Korrektur erstellt, daher muss die Kamera vor der Wiederherstellung frisch eingeschaltet werden. Die Durchlaufdatei ist bereits gespeichert.',
  'yourTurn.replugBeforeRestore.title':
    'Vor Schritt 04: Ziehen Sie die Kamera ab, stecken Sie sie wieder ein und klicken Sie dann auf „Gerät verbinden“.',
  'yourTurn.powerCycle.title':
    'Sie sind dran: Ziehen Sie die Kamera ab, stecken Sie sie wieder ein, klicken Sie auf „Gerät verbinden“ — und versuchen Sie es dann erneut.',
  'yourTurn.powerCycle.body':
    'Die Kamera muss frisch eingeschaltet werden, bevor sie wieder gelesen werden kann. Der Durchlauf ist hier noch geladen; nichts geht verloren.',
  'yourTurn.powerCycleAssert.title':
    'Sie sind dran: Ziehen Sie die Kamera ab, stecken Sie sie wieder ein, klicken Sie auf „Gerät verbinden“ — und fahren Sie dann fort.',
  'yourTurn.powerCycleAssert.body':
    'Der letzte Sicherungsversuch wurde angehalten, und die Kamera muss frisch eingeschaltet werden, bevor er erneut läuft. Die Kamera kann das nicht selbst melden, daher teilen Sie der Seite mit der Schaltfläche unten mit, dass Sie es getan haben.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Neu eingesteckt — weiter mit {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Welche Slots Schritt 03 patcht',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Boot-Konfigurationswort',
  'banks.lastStart': 'Letzter Start',
  'banks.nextStart': 'Nächster Start',
  'banks.caption': 'Die drei Firmware-Slots, wie Schritt 02 sie gelesen hat',
  'banks.col.bank': 'Slot',
  'banks.col.address': 'Adresse',
  'banks.col.holds': 'Inhalt',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'nächster Start',
  'banks.choiceLabel': 'Zu patchende Slots',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'Der Slot des nächsten Starts',
  'choice.all': 'Alle Slots',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — nicht angeboten',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen': 'Noch kein Slot gewählt: {what}. Wählen Sie oben einen Slot mit Namen.',
  'banks.writes': 'Schritt 03 schreibt: {what}.',
  'banks.fixed':
    'Der Schreibvorgang ist gelaufen, daher steht die Auswahl fest: Schritt 04 stellt genau diese Slots wieder her.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: nicht angeboten — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'kein Durchlauf aktiv — Schritt 02 startet einen',
  'banks.refusedBusy': 'ein Schritt läuft — wählen Sie die Slots, wenn er fertig ist',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'Der Plan — {build}, patcht {banks}',
  'plan.summaryNone': 'Der Plan — {build}, noch kein Slot gewählt',
  'plan.yourCamera': 'Ihre Kamera',
  'plan.intro':
    'Aus den eigenen Bytes der Kamera erstellt. Nichts wird geschrieben, bevor Schritt 03 läuft, und Schritt 04 stellt jedes Byte wieder her, das er schreibt.',
  /* The rows; their values are core's. */
  'plan.build': 'Build',
  'plan.version': 'Firmware-Version',
  'plan.written': 'Geschrieben',
  'plan.route': 'Wohin er geht',
  'plan.restore': 'Wiederherstellung',
  'plan.wholeFlash': 'Volles Auslesen',
  'plan.outro':
    'In der Form, die die Kamera speichert, ändern sich dieselben Bytes und keine anderen. Die Firmware der Kamera ändert sich also genau um diesen Unterschied und um nichts sonst.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'Der Patch von {bank}',
  'bankPlan.titleChosen': '{bank} — von diesem Durchlauf beschrieben',
  'bankPlan.titleNotChosen': '{bank} — nicht gewählt',
  'bankPlan.source': 'Quelle des Images',
  'bankPlan.sourceValue': '{bank}, wie gespeichert',
  'bankPlan.sourceTwoReads':
    '{bank}, wie gespeichert, zwei übereinstimmende Lesevorgänge (sha256 {sha})',
  'bankPlan.edit': 'Änderung am Image',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) auf dem Werks-Image. Sein Ausgleich, {balance}, steht im Ausgleichswort; der Patch gleicht darauf aufbauend aus, und Schritt 04 stellt das Image mitsamt der Änderung wieder her.',
  'bankPlan.factorySha': 'sha256 des Werks-Klartexts',
  'bankPlan.patchedSha': 'sha256 gepatcht',
  'bankPlan.diffCount': 'Bytes, die sich im Chip ändern',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Übertragene Länge',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': { one: '{size} B in {count} Teil', other: '{size} B in {count} Teilen' },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Ausgleichswort',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (vorher {balance}, der Ausgleich der Änderung)',
  'bankPlan.caption': 'Die genauen Bytes, die der Patch in {bank} ändert',
  'bankPlan.col.what': 'Was er ändert',
  'bankPlan.col.offset': 'Offset',
  'bankPlan.col.before': 'Vorher',
  'bankPlan.col.after': 'Nachher',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Bestätigt — eine perfekte Übereinstimmung.** Nach einem frischen Start wurde die Kamera erneut gelesen: {read}/31 Blöcke, {count} abweichendes Byte. Ihr Flash-Speicher ist genau so, wie er vor dem ersten Schreibvorgang war.',
    other:
      '**Bestätigt — eine perfekte Übereinstimmung.** Nach einem frischen Start wurde die Kamera erneut gelesen: {read}/31 Blöcke, {count} abweichende Bytes. Ihr Flash-Speicher ist genau so, wie er vor dem ersten Schreibvorgang war.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Bestätigt — eine perfekte Übereinstimmung.** Nach einem frischen Start wurde die Kamera erneut gelesen: {read}/31 Blöcke, {count} abweichendes Byte (kurze Blöcke: {blocks}). Ihr Flash-Speicher ist genau so, wie er vor dem ersten Schreibvorgang war.',
    other:
      '**Bestätigt — eine perfekte Übereinstimmung.** Nach einem frischen Start wurde die Kamera erneut gelesen: {read}/31 Blöcke, {count} abweichende Bytes (kurze Blöcke: {blocks}). Ihr Flash-Speicher ist genau so, wie er vor dem ersten Schreibvorgang war.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**Die Prüfung hat Abweichungen gegenüber der Sicherung gefunden.** {error}',
  unknownReason: 'unbekannter Grund',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — in {banks} schreiben?',
  'confirm.titleJump': '{phase} — nicht verzeichnetes Schreiben überspringen?',
  'confirm.chosenBanks': 'die gewählten Slots',
  'confirm.jump':
    'DER SCHREIBVORGANG IST FÜR DIESEN DURCHLAUF NICHT VERZEICHNET, und Sie versichern, dass die Schreibvorgänge ohne ihre Checkpoints angekommen sind: Der Schritt beginnt nach dem Schreiben, statt erneut zu schreiben. Die eigenen Prüfungen der Schritte laufen trotzdem — das Lesen der Version, die Prüfungen der Slots —, und eine falsche Annahme kostet ein vergebliches volles Auslesen, keine unbrauchbar gemachte Kamera.',
  'confirm.jumpKeepPlugged':
    'Lassen Sie die Kamera angeschlossen und den Computer wach, bis der Schritt fertig ist.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Dies schreibt einen kleinen Patch in {banks}. Schritt 04 stellt die Originale wieder her. Das folgende volle Auslesen liest nur.',
  'confirm.patchInOrder':
    'Dies schreibt einen kleinen Patch in {banks}, in dieser Reihenfolge — der Slot, den die Kamera zuerst versucht, kommt zuletzt. Schritt 04 stellt die Originale wieder her. Das folgende volle Auslesen liest nur.',
  /* Step 04. */
  'confirm.restore': 'Dies schreibt Ihre Original-Firmware zurück in {banks}.',
  'confirm.restoreInOrder':
    'Dies schreibt Ihre Original-Firmware zurück in {banks}, in dieser Reihenfolge — der Slot, den die Kamera zuerst versucht, kommt zuerst.',
  'confirm.keepPlugged':
    'Lassen Sie die Kamera angeschlossen und den Computer wach, solange geschrieben wird — ein unterbrochener Schreibvorgang hinterlässt eine Kamera, die nur noch ein Hardware-Programmiergerät (SPI oder SWD/J-Link) retten kann. Auf einem Telefon: Flugmodus an und den Bildschirm eingeschaltet lassen. Danach startet die Kamera neu; wenn die Seite darum bittet, klicken Sie auf „Gerät verbinden“ und wählen Sie sie erneut aus. Das ist so vorgesehen.',
  'confirm.yesJump': 'Ja — Schreiben überspringen',
  'confirm.yesWrite': 'Ja — in die Kamera schreiben',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'Der Nachweis',
  'summary.complete': 'Vollständiges Abbild (4 MB)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'nicht erzeugt',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'weicht von der Sicherung in {differing} von {count} Block ab: {blocks}',
    other: 'weicht von der Sicherung in {differing} von {count} Blöcken ab: {blocks}',
  },
  'summary.matches': {
    one: 'stimmt mit der Sicherung überein ({count} Block)',
    other: 'stimmt mit der Sicherung überein (alle {count} Blöcke)',
  },
  'summary.onlyInFull': 'Nur im vollen Auslesen',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} Block, den ein normales Lesen nicht erreicht: {blocks}',
    other: '{count} Blöcke, die ein normales Lesen nicht erreicht: {blocks}',
  },
  'summary.rawDump': 'Volles Auslesen, wie gelesen',
  'summary.rawDumpBadge': 'dasselbe, mit dem Patch noch darin',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Firmware-Image (entschlüsselt, {bank})',
  'summary.verify': 'Prüfung',
  'summary.toolbar': 'Archiv-Aktionen',
  'summary.download': 'Gesamtarchiv herunterladen (Durchlaufdatei)',

  /* ---- what the run file holds (views/PreserveView) ---- */
  'output.title': 'Was Sie erhalten',
  'output.intro':
    'Die Durchlaufdatei ist ein einziger `{ext}`-Download. Jede Speicherung enthält alles, was der Durchlauf bis dahin erzeugt hat, mit einem Ordner pro Schritt:',
  'output.caption': 'Dateien in der Durchlaufdatei',
  'output.file': 'Datei',
  'output.what': 'Inhalt',
  'output.runState':
    'der Stand des Durchlaufs: Laden Sie die ZIP-Datei auf diesem Tab, um den Durchlauf fortzusetzen oder ihn noch einmal anzusehen',
  'output.readme': 'was in der ZIP-Datei liegt und wo',
  'output.backup':
    'Ihre Sicherung: die 31 Blöcke, die eine Kamera im Originalzustand herausgibt, gelesen, bevor etwas geschrieben wird, jeder an seiner Flash-Adresse ({fill}, wo ein Block so nicht lesbar ist)',
  'output.capture':
    'jeder Firmware-Slot, den der Durchlauf schreiben kann, so wie die Kamera ihn speichert (a, b oder r im Namen), zweimal gelesen, mit zwei gleichen Ergebnissen',
  'output.plain': 'die Firmware aus jedem dieser Slots, entschlüsselt',
  'output.patched':
    'für jeden Slot, den der Durchlauf patcht: seine Firmware mit dem vorübergehenden Lese-Patch',
  'output.decrypted': 'die Sicherung, entschlüsselt: die Firmware jedes Slots und ein Bericht dazu',
  'output.manifest': 'die Einzelheiten dieser Entschlüsselung',
  'output.decryptReadme': 'was diese Entschlüsselung enthält und wo ihre Grenzen liegen',
  'output.pageBuild': 'welcher Build dieser Seite den Durchlauf ausgeführt hat',
  'output.dumpPatched':
    'die gesamten 4 MB wie gelesen, mit dem Patch noch in den Slots, in die er geschrieben wurde',
  'output.dumpOriginal':
    'das vollständige Abbild: die gesamten 4 MB mit der wieder eingesetzten Original-Firmware — der ursprüngliche Flash-Speicher Ihrer Kamera',
  'output.verify':
    'die 31 Blöcke, nach der Wiederherstellung erneut gelesen und wie die Sicherung angeordnet; sie sollten ihr gleichen',
  'output.grows':
    'Eine Datei ist erst da, wenn der Schritt gelaufen ist, der sie erzeugt; eine frühe Durchlaufdatei enthält also nur den ersten Ordner.',
  'output.keep':
    'Aufbewahren sollten Sie `{original}`: den gesamten Flash-Speicher Ihrer Kamera, wie er war. Der Rest zeigt, wie der Durchlauf dorthin kam.',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Optional — um einen Durchlauf später fortzusetzen',
  'runFile.title': 'Durchlaufdatei',
  'runFile.description':
    'Die einzige Aufzeichnung des Durchlaufs. Sie wird nach jedem Schritt von selbst heruntergeladen (auch nach einem vorzeitig angehaltenen Schritt); behalten Sie die neueste. Um später oder nach einem Problem weiterzumachen, laden Sie sie hier, und die Seite macht dort weiter, wo sie aufgehört hat.',
  'runFile.run': 'Durchlauf',
  'runFile.file': 'Datei',
  'runFile.lastSaved': 'Zuletzt gespeichert',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'nach {step} — {at} ({bytes} B)',
  'runFile.nextStep': 'Nächster Schritt',
  'runFile.none':
    'Kein Durchlauf aktiv. Schritt 02 startet einen, oder laden Sie hier eine Durchlaufdatei.',
  'runFile.toolbar': 'Aktionen zur Durchlaufdatei',
  'runFile.load': 'Durchlaufdatei laden…',
  'runFile.save': 'Durchlaufdatei erneut speichern',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Fortsetzen',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Keine Durchlaufdatei gewählt.',
  'status.notRun': 'Noch nicht ausgeführt.',
  'status.running': 'Läuft …',
  'status.runningRestarts': 'Läuft — die Kamera startet in diesem Schritt neu …',
  'status.restarting': 'Die Kamera startet neu — das dauert etwa zehn Sekunden …',
  'status.waitConnect':
    'Warte auf Sie — klicken Sie auf „Gerät verbinden“ und wählen Sie die Kamera aus …',
  'status.waitPlugBack':
    'Warte auf Sie — stecken Sie die Kamera wieder ein und klicken Sie dann auf „Gerät verbinden“ …',
  'status.waitReplug': 'Warte auf Sie — ziehen Sie die Kamera ab und stecken Sie sie wieder ein …',
  'status.back': 'Die Kamera ist wieder da — es geht weiter …',
  'status.swapped':
    'Angehalten — die Kamera hat gewechselt. Prüfen Sie sie und führen Sie den Schritt dann erneut aus.',
  'status.noRun': 'Kein Durchlauf.',
  'status.notCreated': 'Nicht erstellt — siehe Protokoll oben.',
  'status.refused': 'Abgelehnt — die Schrittliste oben sagt, was fehlt.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} — fertig. Die Durchlaufdatei in Ihren Downloads ist aktuell.',
  'status.doneReplug':
    '{phase} — fertig, und die Durchlaufdatei ist gespeichert. Vor der Wiederherstellung: Ziehen Sie die Kamera ab, stecken Sie sie wieder ein und klicken Sie auf „Gerät verbinden“.',
  'status.backupRefused': 'Abgelehnt — es wurde nichts geschrieben. Siehe Protokoll oben.',
  'status.failed': 'Fehlgeschlagen — siehe Protokoll oben.',
  'status.cancelled':
    'Abgebrochen — die Durchlaufdatei hält weiterhin fest, wo der Durchlauf angehalten hat.',
  'status.readingFile': 'Durchlaufdatei wird gelesen …',
  'status.doneEarlier': 'Bereits früher erledigt — aus der Durchlaufdatei geladen.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Früher fehlgeschlagen: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Bei {step} fortgesetzt. Die Schrittliste macht dort weiter.',
  'status.notResumed': 'Nicht fortgesetzt — siehe Protokoll oben.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'benötigt: {missing}',
  'gate.noRun': 'kein Durchlauf aktiv — der erste Schritt erstellt den Durchlauf',
  'gate.runDone': 'dieser Durchlauf ist abgeschlossen — jeder Schritt ist fertig',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'bereits erledigt — Fortsetzen macht bei {step} weiter',
  'gate.banksRead': 'die Slots, die die Sicherung liest',
  'gate.choice': 'eine Auswahl der Slots — {why}',
  'gate.bankRefused': '{bank} kann nicht beschrieben werden: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'der Weg über den Recovery-Slot (dieser Build läuft nur aus {r}, nicht aus {bank})',
  'gate.backupFirst': 'die Flash-Sicherung (sie läuft in diesem Schritt zuerst)',
  'gate.backup': 'die Flash-Sicherung',
  'gate.patchStep': 'der Patch-Schritt',
  'gate.patchOf': 'der Patch von {bank}',
  'gate.backupFile': 'die Datei mit den Sicherungsfenstern',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': 'die Aufnahme von {bank}',
  'gate.derived': 'das abgeleitete Image von {bank}',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep':
    'der Schritt „Schreiben“ (führen Sie ihn zuerst aus oder setzen Sie bei ihm fort)',
  'gate.drainRefused': 'das volle Auslesen lehnt auf {build} ab — {why}',
  'gate.patchSummary': 'die Patch-Zusammenfassung von {bank} (die übertragene Länge)',
  'gate.restoreRefused':
    'die Wiederherstellung lehnt auf {build} ab — keine Form der Original-Firmware wird wieder als die Original-Bytes gespeichert; der Durchlauf endet mit dem vollständigen Abbild und dem Patch an seinem Platz',
  /* {file} is a file name in the run file. */
  'gate.plaintext': 'der Werks-Klartext von {bank} ({file}, aus dem Sicherungsschritt)',
  'gate.restoreFirst': 'die Wiederherstellung (sie läuft in diesem Schritt zuerst)',
  'gate.powerCycle':
    'die Bestätigung des Aus- und Einschaltens — schalten Sie die Kamera aus und wieder ein (abziehen und wieder einstecken oder ihren Netzschalter verwenden) und verwenden Sie dann die Schaltfläche zum erneuten Ausführen',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'die Kamera ist nach {minutes} Min. wiederholter Versuche nicht zurückgekommen: {error} — wenn Chrome nichts gefragt hat, stecken Sie die Kamera neu ein und führen Sie den Schritt erneut aus; wenn das Protokoll sagte, sie neu zu verbinden, war der Klick auf „Gerät verbinden“ das, worauf gewartet wurde',
} satisfies Translation<'preserve'>;
