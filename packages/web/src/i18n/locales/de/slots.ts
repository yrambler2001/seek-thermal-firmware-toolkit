/**
 * Namespace `slots`, Deutsch (de), translated from the English source: the firmware-slots tab.
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

import type { Translation } from '../../types';

export default {
  /* The section: its heading, badge and one-line summary. */
  'section.title': 'Firmware-Slots bearbeiten',
  'section.badge': 'Schreibt in den Flash',
  'section.description':
    '„Slots lesen“ fragt die Kamera, was sie ausführt, liest ihre drei Firmware-Slots — {a}, {b} und {r} — und zeigt, was jeder enthält. Lesen und Auslesen ändern nichts. Jede Schaltfläche zum Schreiben fragt nach, bevor auch nur ein Byte gesendet wird.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Diese Seite kann in den Flash-Speicher der Kamera schreiben.** Ein Schreibvorgang löscht einen 64-KB-Slot und programmiert ihn neu. Ein Image, das formal gültig ist, aber nicht läuft, macht die Kamera startunfähig, und der Bootloader hat kein USB — dann können nur SWD/J-Link oder ein SPI-Programmiergerät sie wiederherstellen. Lesen Sie den Slot vorher aus und bewahren Sie die Datei auf.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Slot-Aktionen',
  'actions.read': 'Slots lesen',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Slots',

  /* Before any read. */
  'empty.connected':
    'Klicken Sie auf „Slots lesen“. Die Kamera wird zuerst gefragt, welchen Build sie ausführt, und auf einem Build, den diese Seite nicht unterstützt, wird kein Fenster geöffnet.',
  'empty.disconnected': 'Verbinden Sie die Kamera und klicken Sie dann auf „Slots lesen“.',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Dieser Build wird hier nicht unterstützt. Es wurde kein Slot gelesen, und keiner kann beschrieben werden.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Nicht erkannt: Diese Seite kann nicht feststellen, welchen Build die Kamera ausführt.',
  'refusal.notIdentified.body':
    'Die Kamera hat keine verwendbare Firmware-Version geliefert, daher wurde kein Slot gelesen und kein Fenster geöffnet. Diese Seite deckt Builds ab {minVersion} ab. Builds vor {minVersion} liegen außerhalb dessen, was die Slots-Seite unterstützt; eine Kamera mit einem solchen Build wird hier nie gelesen.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Wenn die Kamera einen unterstützten Build ausführt, startet sie vielleicht gerade noch. {hint}',
  'refusal.title': 'Abgelehnt — es wurde kein Fenster geöffnet.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Wird gelesen ...',
  'status.readingAgain': 'Die Slots werden erneut gelesen ...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Gelesen. {read}/{count} Slot gelesen.',
    other: 'Gelesen. {read}/{count} Slots gelesen.',
  },
  'status.unsupported': 'Auf diesem Build nicht unterstützt — es wurde kein Slot gelesen.',
  'status.refused':
    'Abgelehnt — es wurde kein Fenster geöffnet. Siehe die Meldung unter dem Protokoll.',
  'status.disconnected': 'Gerät getrennt — lesen Sie die Slots erneut.',
  'status.newDevice': 'Neues Gerät ausgewählt — lesen Sie die Slots erneut.',
  'status.dumping': '{bank} wird ausgelesen ...',
  'status.dumped': '{bank} ausgelesen.',
  'status.readingImage': 'Image wird gelesen ...',
  'status.ready': 'Bereit — prüfen Sie den Plan und schreiben Sie ihn dann.',
  'status.rejected': 'Zurückgewiesen — siehe Protokoll oben.',
  'status.writing': 'Wird geschrieben ...',
  'status.patching': '{bank} wird gepatcht ...',
  'status.patchingEvery': 'Alle Slots werden gepatcht ...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch':
    'Geschrieben, aber die zurückgelesenen Daten stimmen nicht überein — siehe Ergebnis.',
  'status.written.verified':
    'Geschrieben. Der Slot liest sich so zurück, wie er geschrieben wurde.',
  'status.written.notCompared':
    'Geschrieben. Die zurückgelesenen Daten wurden nicht verglichen — siehe Ergebnis.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Gepatcht, aber die zurückgelesenen Daten weichen nicht nur wie geplant ab — siehe Ergebnis.',
  'status.patched.ok': 'Gepatcht. Die zurückgelesenen Daten entsprechen dem Plan.',
  'status.patched.unchecked':
    'Gepatcht. Die zurückgelesenen Daten wurden nicht geprüft — siehe Ergebnis.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Angehalten bei {bank} — {count} Slot gepatcht; siehe Ergebnis.',
    other: 'Angehalten bei {bank} — {count} Slots gepatcht; siehe Ergebnis.',
  },
  'status.every.unchecked': {
    one: '{count} Slot gepatcht, aber ein Rücklesen wurde nicht wie geplant geprüft — siehe Ergebnis.',
    other:
      '{count} Slots gepatcht, aber ein Rücklesen wurde nicht wie geplant geprüft — siehe Ergebnis.',
  },
  'status.every.ok': {
    one: '{count} Slot gepatcht. Die zurückgelesenen Daten entsprechen dem Plan.',
    other: '{count} Slots gepatcht. Die zurückgelesenen Daten entsprechen jeweils dem Plan.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Abgebrochen — es wurde nichts geschrieben.',
  'status.cancelled.one':
    'Abgebrochen, nachdem der Commit für {bank} gesendet wurde — der Slot ist möglicherweise nur teilweise beschrieben. Lesen Sie ihn, bevor Sie sich auf ihn verlassen.',
  'status.cancelled.many':
    'Abgebrochen, nachdem die Commits für {banks} gesendet wurden — jeder davon ist möglicherweise nur teilweise beschrieben. Lesen Sie sie, bevor Sie sich auf sie verlassen.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Verbinden Sie zuerst die Kamera.',
  'gate.busy': 'Ein anderer Vorgang läuft — warten Sie, bis er fertig ist.',
  'gate.readFirst': 'Lesen Sie zuerst die Slots.',
  'gate.cameraRefused':
    'Diese Kamera kann von hier aus nicht beschrieben werden, aus dem Grund im Hinweis oben. Es wird nichts gesendet.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead':
    'Nicht gelesen: {reason}. Lesen Sie die Slots erneut, bevor Sie diesen Slot beschreiben.',
  'gate.notReadNoReason':
    'Nicht gelesen: Dieser Slot wurde nicht gelesen. Lesen Sie die Slots erneut, bevor Sie ihn beschreiben.',
  'gate.emptyNotWritable':
    'Dieser Slot ist leer und kann auf diesem Build nicht beschrieben werden: {reason}',
  'gate.noSuchBank': 'Diesen Slot gibt es auf diesem Build nicht.',

  /* The bank table. */
  'table.caption':
    'Jeder Firmware-Slot dieser Kamera — {a}, {b} und {r} — so, wie er im Browser gelesen und geprüft wurde',
  'table.col.bank': 'Slot',
  'table.col.firmware': 'Firmware',
  'table.col.size': 'Größe',
  'table.col.key': 'Schlüssel',
  'table.col.bootable': 'Startfähig',
  'table.col.sha': 'SHA-256 des Klartexts',
  'table.col.actions': 'Aktionen',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'nicht gelesen — {reason}',
  'table.notReadNoReason': 'nicht gelesen — der Slot wurde nicht gelesen',
  /* A badge: the bank holds no image. */
  'table.empty': 'leer',
  'table.emptyNote':
    'Kein Image: Das Header-Fenster dieses Slots liest sich vollständig als 0xFF. Daraus wird nichts entschlüsselt, und ein Schreiben überschreibt keine Firmware.',
  /* {why} and {reason} are core's. */
  'table.emptyWritable': 'Kann beschrieben werden. {why}',
  'table.emptyNotWritable': 'Kann auf diesem Build nicht beschrieben werden: {reason}',
  'table.unknownVersion': 'unbekannte Version',
  /* {id} is the image id in hex. */
  'table.imageId': 'Image {id}',
  'table.noImage': 'kein Image',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'Slot mit {size} B',
  'table.imageSize': 'Image {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'keiner (Klartext)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— nichts zu starten',
  'table.boot.bootable': 'startfähig — der Bootloader nimmt ihn an',
  'table.boot.notBootable': 'nicht startfähig — wird beim Start übersprungen',
  'table.boot.recoveryOnly':
    'nur Recovery — {letterR} läuft, wenn {letterA} und {letterB} nichts enthalten, was der Bootloader annimmt (an einer Kamera für eine frühere Form dieses Images gemessen); ob diese Form startet, ist ungetestet',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'unbekannt — {why}',
  /* The row's buttons. */
  'table.dump': 'Auslesen',
  'table.flashPlain': 'Entschlüsseltes Image schreiben…',
  'table.flashRaw': 'Rohdaten schreiben…',
  'table.restore': 'Aus Flash-Sicherung wiederherstellen (.bin oder .zip)…',
  'table.makeFps': 'Auf {hz} FPS umstellen',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Nach {bank} kopieren',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: aus',
  'table.copyNote':
    'Kopiert die Firmware dieses Slots, so wie dieses Lesen sie entschlüsselt hat, in den Slot, den Sie wählen, egal was dieser jetzt enthält. Sie prüfen den Plan, bevor irgendetwas gesendet wird.',
  'table.restoreNote':
    'Wählen Sie eine vollständige Flash-Sicherung: eine .bin (ein ganzes 4-MB-Flash-Abbild, etwa ein Auslesen mit J-Link) oder eine .zip, die eines enthält (eine Preserve-Durchlaufdatei oder die ZIP-Datei, die „Auslesen & entschlüsseln 4.x/Nano“ oder „Alle Selektoren auslesen“ speichert). Dieser Slot wird daraus herausgeschnitten, entschlüsselt und als Plan angezeigt, bevor irgendetwas gesendet wird.',
  'table.fpsNote':
    'Hebt diesen Slot von {fromHz} Hz auf {toHz} Hz an, indem seine Bytes bearbeitet werden. Der Slot wird zuerst gesichert, als ZIP-Download, und die entschlüsselte Datei darin ist der Weg zurück.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery':
    '{booted} und Recovery-Slot: Das Schreiben verlangt eine zusätzliche Bestätigung.',
  'table.risk.booted': '{booted}: Das Schreiben verlangt eine zusätzliche Bestätigung.',
  'table.risk.recovery': '{bank}: Das Schreiben verlangt eine zusätzliche Bestätigung.',
  'table.risk.bootUnnamed':
    'Die Kamera nennt den Slot nicht, aus dem sie gestartet ist: Das Schreiben verlangt eine zusätzliche Bestätigung.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Bildraten-Patch angewendet: Dieses Image läuft mit {hz} Hz.',
  'fps.earlierPatch':
    'Bildraten-Patch nicht angeboten: Dieser Slot enthält einen früheren {hz}-Hz-Patch ohne die USB-Korrektur. Stellen Sie das Original-Image wieder her und verwenden Sie dann „Auf {hz} FPS umstellen“.',
  'fps.atRate': 'Kein Bildraten-Patch nötig: Dieser Build läuft bereits mit {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Bildraten-Patch nicht angeboten: {reason}',
  'fps.readFirst':
    'lesen Sie zuerst die Slots — der Patch wird aus dem eigenen Image des Slots geplant',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Alle Slots',
  'everyBank.make': 'Alle Slots auf {hz} FPS umstellen',
  'everyBank.faster': 'Alle Slots schneller machen',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Patcht {order} mit einer einzigen Bestätigung. Jeder Slot wird zuerst gesichert, in einem gemeinsamen ZIP-Download, und danach zurückgelesen.',
  'everyBank.noteBootedLast':
    'Patcht {order} mit einer einzigen Bestätigung, den Slot, aus dem die Kamera jetzt startet, als letzten. Jeder Slot wird zuerst gesichert, in einem gemeinsamen ZIP-Download, und danach zurückgelesen.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': 'das Image von {bank}',
  'what.restore': '{bank} aus {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Vorbereitet für {bank} bei {address}',
  'preview.file': 'Datei',
  'preview.source': 'Image stammt aus',
  'preview.target': 'Ziel',
  'preview.targetEmpty':
    '{bank} ist leer: Er enthält kein Image, dieser Schreibvorgang überschreibt also keine Firmware',
  'preview.readAs': 'Gelesen als',
  'preview.readAs.ff': 'ein entschlüsseltes {version}-FF-Image',
  'preview.readAs.plain': 'ein entschlüsseltes Image',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'Rohdaten',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Übertragung',
  'preview.key': 'Schlüssel',
  'preview.payload': 'Nutzdaten',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} B in {count} Teil zu höchstens {chunk} B',
    other: '{size} B in {count} Teilen zu je höchstens {chunk} B',
  },
  'preview.checksum': 'Übertragungs-Prüfsumme',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Danach gespeichert',
  'preview.storedNotPredicted': 'nicht vorhergesagt — das Rücklesen ist die Prüfung',
  'preview.storedPredicted': '{size} B vorhergesagt',
  'preview.storedKeyB':
    '{size} B vorhergesagt — das Image XOR Schlüssel B, nicht die Nutzdaten selbst',
  'preview.savedFirst': 'Vorher gesichert',
  'preview.compareCaption': 'Was sich in {bank} ändert',
  'preview.col.field': 'Feld',
  'preview.col.now': 'Jetzt',
  'preview.col.after': 'Nach dem Schreiben',
  'preview.readFirst': 'Vor dem Schreiben lesen:',
  /* {note} is core's note about this write. */
  'preview.note': 'Hinweis: {note}',
  'preview.nothingSent':
    'Es wurde noch nichts an die Kamera gesendet. Beim Schreiben werden diese Nutzdaten an {bank} übertragen und mit einem Commit abgeschlossen.',
  'preview.toolbar': 'Schreibaktionen für {bank}',
  'preview.write': 'In {bank} schreiben…',
  'preview.discard': 'Verwerfen',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': '{what} in {bank} bei {address} schreiben?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Das Schreiben ersetzt die Firmware, die die Kamera gerade ausführt. Wenn das neue Image nicht läuft, startet die Kamera möglicherweise gar nicht mehr.',
  'writeConfirm.recovery':
    '{bank} ist der Recovery-Slot, die letzte Rückfallkopie, auf die der Bootloader zurückgreift. Nach dem Schreiben ist die Kamera ohne diese Kopie, bis sie wiederhergestellt ist.',
  'writeConfirm.bootUnnamed':
    'Die Kamera sagt nicht, aus welchem Slot sie startet, daher wird {bank} als der Slot behandelt, aus dem sie jetzt startet. Das Schreiben kann die Firmware ersetzen, die die Kamera gerade ausführt.',
  'writeConfirm.empty':
    '{bank} ist leer: Er enthält kein Image, es wird also keine Firmware überschrieben.',
  'writeConfirm.eraseEmpty':
    'Der Schreibvorgang löscht trotzdem den 64-KB-Block des Flash-Speichers der Kamera bei {bank} (der schon leer ist) und programmiert ihn.',
  'writeConfirm.erase':
    'Dabei wird ein 64-KB-Block des Flash-Speichers der Kamera gelöscht und bei {bank} neu programmiert.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'Das Image wird unter {key} geschrieben. Jeder andere Slot wird genauso geschrieben.',
  'writeConfirm.backup':
    'Bevor irgendetwas gesendet wird, wird {bank} erneut gelesen und als ein ZIP-Download gespeichert: {file}. Prüfen Sie Ihren Download-Ordner darauf.',
  'writeConfirm.noReset':
    'Es wird kein Reset gesendet. Ziehen Sie die Kamera danach ab und stecken Sie sie wieder ein, damit der Slot wirksam wird.',
  'writeConfirm.noUsbRecovery':
    'Wenn das Image nicht läuft, kann die Kamera nicht über USB wiederhergestellt werden — nur mit SWD/J-Link oder einem SPI-Programmiergerät.',
  'writeConfirm.ackUnnamed':
    'Mir ist bewusst, dass die Kamera nicht sagt, aus welchem Slot sie startet, dass dieser hier daher als der gestartete Slot behandelt wird und dass ein fehlerhaftes Image die Kamera startunfähig machen kann.',
  'writeConfirm.confirm': 'Ja — in {bank} schreiben',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Mir ist bewusst, dass dies der Slot ist, aus dem die Kamera jetzt startet, und dass ein fehlerhaftes Image die Kamera startunfähig machen kann.',
  'ack.recovery':
    'Mir ist bewusst, dass dies der Recovery-Slot ist und dass ein fehlerhaftes Image die Kamera ohne letzte Rückfallkopie lässt.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': '{bank} auf {hz} FPS umstellen?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted':
    '{bootsNow}. Das gepatchte Image ersetzt die Firmware, die die Kamera jetzt ausführt.',
  'fpsConfirm.recovery':
    '{bank} ist der Recovery-Slot, die letzte Rückfallkopie, auf die der Bootloader zurückgreift.',
  'fpsConfirm.what':
    '{bank} enthält Firmware {version}, und dies lässt sein Image mit {toHz} Hz statt mit {fromHz} Hz laufen.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(unbekannt)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'Der Patch ändert {count} Byte des Images und das Prüfsummenwort, sodass die Summe, die der Bootloader prüft, erhalten bleibt. Das Schlüsselpaar wird nicht angetastet.',
    other:
      'Der Patch ändert {count} Bytes des Images und das Prüfsummenwort, sodass die Summe, die der Bootloader prüft, erhalten bleibt. Das Schlüsselpaar wird nicht angetastet.',
  },
  'fpsConfirm.wayBack':
    'Die entschlüsselte Datei in dieser ZIP-Datei ist der Weg zurück: Um den Patch rückgängig zu machen, schreiben Sie sie mit „Entschlüsseltes Image schreiben“ in {bank}.',
  'fpsConfirm.noReset':
    'Es wird kein Reset gesendet. Ziehen Sie die Kamera danach ab und stecken Sie sie wieder ein, damit der gepatchte Slot wirksam wird.',
  'fpsConfirm.ackUnnamed':
    'Mir ist bewusst, dass die Kamera nicht sagt, aus welchem Slot sie startet, und dass dieser hier daher als der gestartete Slot behandelt wird.',
  'fpsConfirm.confirm': 'Ja — {bank} patchen',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Alle Slots auf {hz} FPS umstellen?',
  'fpsEvery.titleMixed': {
    one: 'Die Bildrate von {count} Slot patchen?',
    other: 'Die Bildrate von {count} Slots patchen?',
  },
  'fpsEvery.intro': {
    one: 'Dies patcht {count} Slot, für den der Patch verfügbar ist (Firmware {version}):',
    other: 'Dies patcht {count} Slots, für die der Patch verfügbar ist (Firmware {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (der Slot, aus dem diese Kamera jetzt startet, und der Recovery-Slot)',
  'fpsEvery.role.booted': '{bank} (der Slot, aus dem diese Kamera jetzt startet)',
  'fpsEvery.role.recovery': '{bank} (der Recovery-Slot, die letzte Rückfallkopie)',
  'fpsEvery.role.bootUnnamed': '{bank} (die Kamera sagt nicht, aus welchem Slot sie startet)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: {fromHz} Hz auf {toHz} Hz, {count} Byte und das Prüfsummenwort.',
    other: '{bank}: {fromHz} Hz auf {toHz} Hz, {count} Bytes und das Prüfsummenwort.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Unverändert bleiben: {others}',
  'fpsEvery.orderOne': 'Es wird nur {bank} geschrieben und danach zurückgelesen.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Sie werden in dieser Reihenfolge geschrieben: {order}. Jeder Slot wird zurückgelesen, bevor der nächste folgt, und der erste Fehler hält den Rest an.',
  'fpsEvery.orderBootedLast':
    'Sie werden in dieser Reihenfolge geschrieben: {order}. Der Slot, aus dem die Kamera jetzt startet, kommt zuletzt, sodass ein Fehler vor ihm anhält. Jeder Slot wird zurückgelesen, bevor der nächste folgt, und der erste Fehler hält den Rest an.',
  'fpsEvery.wayBack':
    'Die entschlüsselten Dateien in dieser ZIP-Datei sind der Weg zurück: Um den Patch eines Slots rückgängig zu machen, schreiben Sie seine Datei mit „Entschlüsseltes Image schreiben“ in diesen Slot.',
  'fpsEvery.noReset':
    'Es wird kein Reset gesendet. Ziehen Sie die Kamera danach ab und stecken Sie sie wieder ein, damit die gepatchten Slots wirksam werden.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Mir ist bewusst, dass dies Folgendes beschreibt: {banks}, und dass ein fehlerhaftes Image die Kamera startunfähig machen kann.',
  'fpsEvery.confirm': { one: 'Ja — {count} Slot patchen', other: 'Ja — {count} Slots patchen' },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: Der Slot liest sich so zurück, wie er geschrieben wurde.',
  'outcome.mismatch':
    '{bank} — {what}: Die zurückgelesenen Daten stimmen NICHT mit dem Geschriebenen überein.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: Der Slot wurde zurückgelesen, aber nicht verglichen; dieser Schreibvorgang ist hier also nicht bestätigt.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'Der Commit der Kamera hat den Status {status} zurückgegeben.',
  'outcome.wasEmpty':
    '{bank} war vor diesem Schreibvorgang leer, es wurde also keine Firmware überschrieben.',
  'outcome.provenVerified':
    'Bisher nachgewiesen: Die Nutzdaten wurden übertragen und mit einem Commit abgeschlossen, und der Slot liest sich so zurück, wie er geschrieben wurde. NICHT nachgewiesen: dass der Bootloader diesen Slot wählt oder dass das Image läuft.',
  'outcome.provenCommitted':
    'Bisher nachgewiesen: Die Nutzdaten wurden übertragen und mit einem Commit abgeschlossen. NICHT nachgewiesen: dass der Bootloader diesen Slot wählt oder dass das Image läuft.',
  'outcome.replug':
    '**ZIEHEN SIE DIE KAMERA JETZT AB UND STECKEN SIE SIE WIEDER EIN.** Es wurde kein Reset gesendet, daher wird der Slot erst nach einem echten Aus- und Wiedereinschalten wirksam. Lesen Sie danach die Slots erneut: Nur die Version und der aktive Slot, die die Kamera dann meldet, geben darüber Gewissheit.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**ZIEHEN SIE DIE KAMERA JETZT AB UND STECKEN SIE SIE WIEDER EIN.** Es wurde kein Reset gesendet. Lesen Sie danach die Slots erneut.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Vorher gesichert, als Download: {file}.',
  'outcome.wayBackOne':
    'Die entschlüsselte Datei darin ist der Weg zurück („Entschlüsseltes Image schreiben“ auf demselben Slot).',
  'outcome.wayBackMany':
    'Die entschlüsselten Dateien darin sind der Weg zurück („Entschlüsseltes Image schreiben“ auf jedem Slot).',
  'outcome.checkDownloads': 'Prüfen Sie Ihren Download-Ordner darauf.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank} — von {fromHz} Hz auf {toHz} Hz gepatcht (Firmware {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'Die zurückgelesenen Daten weichen von der gesicherten Kopie nur an {count} geplanten Byte ab: an den Patch-Stellen und am Summenwort.',
    other:
      'Die zurückgelesenen Daten weichen von der gesicherten Kopie nur an den {count} geplanten Bytes ab: an den Patch-Stellen und am Summenwort.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'Die zurückgelesenen Daten weichen NICHT nur wie geplant ab: {unexpected} unerwartete und {count} fehlendes Byte.',
    other:
      'Die zurückgelesenen Daten weichen NICHT nur wie geplant ab: {unexpected} unerwartete und {count} fehlende Bytes.',
  },
  'fpsOutcome.notTaken': 'Es wurde nicht zurückgelesen, der Patch ist hier also nicht geprüft.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Alle Slots: {done} von {count} gepatcht, in dieser Reihenfolge: {order}.',
    other: 'Alle Slots: {done} von {count} gepatcht, in dieser Reihenfolge: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'Die zurückgelesenen Daten weichen vom gesicherten Slot nur an {count} geplanten Byte ab.',
    other:
      'Die zurückgelesenen Daten weichen vom gesicherten Slot nur an den {count} geplanten Bytes ab.',
  },
  'fpsEveryOutcome.notTaken': 'Es wurde nicht zurückgelesen.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Angehalten: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Nicht geschrieben: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Kein Slot dieser Kamera kann von hier aus beschrieben werden.',
  'keys.title': 'Schlüssel für die Schreibvorgänge',
  'keys.chain': 'Kette',
  'keys.chainPlain':
    'die Klartext-Kette von 2014: Jeder Slot ist im Klartext gespeichert, keiner enthält also einen Schlüssel',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Geschrieben als',
  'keys.writtenPlain': 'das Image, wie es ist, ohne Schlüssel, in jeden Slot',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Übertragen als',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Gespeichert als',
  'keys.refused': 'Abgelehnt',
  'keys.bootedBank': 'Gestarteter Slot',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank} enthält {key}',
  'keys.theBootedBank': 'der gestartete Slot',
  'keys.unnamedKey': 'einen Schlüssel, den die Seite nicht benennen kann',
  'keys.bootedBanksKey': 'der Schlüssel des gestarteten Slots',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; jeder Slot wird genauso geschrieben',

  /* "What these buttons do", below the tab. */
  'how.title': 'Was diese Schaltflächen tun',
  'how.read':
    '**Slots lesen** und **Auslesen** ändern nichts an der Kamera. Die Kamera wird vor allem anderen gefragt, welchen Build sie ausführt; ein Build älter als {minVersion} wird gemeldet, und seine Slots werden nicht gelesen.',
  'how.flash':
    '**Entschlüsseltes Image schreiben** nimmt ein Klartext-Image, verschlüsselt es so, wie die Firmware dieses Slots es braucht, bevor es übertragen wird, und zeigt den Plan. **Rohdaten schreiben** überträgt die Datei genau so, wie sie ist. Keine der beiden sendet etwas, bevor Sie bestätigen.',
  /* FF = the 16 Hz "FF" build of the Compact; the vendor app = Seek's own phone app. */
  'how.ff':
    'Eine Compact mit 1.3.0.8 kann der 8-Hz-Build oder der 16-Hz-FF-Build sein, und beide melden dieselbe Version. Die Kamera unterscheidet sie selbst: Ihre eigene Antwort für jeden Slot sagt, ob die antwortende Anwendung ihn annimmt, und für jeden Build lassen sich seine Antworten vorhersagen. Das 8-Hz-Image kann in jeden Slot. Das FF-Image wird so übertragen, wie die Hersteller-App es überträgt (das Image XOR Schlüssel A), und der 16-Hz-Build speichert es unter Schlüssel B, in jedem Slot. Die Seite lehnt es nicht ab: Der Plan sagt, bevor Sie bestätigen, was die Kamera voraussichtlich damit tut (der 8-Hz-Build lehnt es beim Commit ab, und eine Kamera mit einer anderen Version programmiert es so, wie es gesendet wird, und kann es dann nicht starten). Ob das FF-Image startet, ist UNTESTED (ungetestet): Für diesen Build liegt kein echter Bootloader in der Sammlung vor. Ein Schreiben in {letterR} verlangt wie jedes Schreiben in den Recovery-Slot die zusätzliche Bestätigung. Ein **leerer** Slot (sein Header-Fenster liest sich vollständig als 0xFF, wie bei {b} vieler Kameras von 2014) ist ein Zustand, kein Fehler. Er wird als die rohen 64 KB aus 0xFF ausgelesen, ohne etwas zu entschlüsseln, und genauso beschrieben wie jeder andere Slot; Plan und Bestätigung sagen, dass keine Firmware überschrieben wird.',
  /* {copyA}, {copyB}, {copyR} are the three copy buttons' own labels (table.copyTo: "Copy to slot A"…). */
  'how.copy':
    '**{copyA}**, **{copyB}** und **{copyR}** in einer Slot-Zeile schreiben die Firmware dieses Slots, so wie dieses Lesen sie entschlüsselt hat, in den anderen Slot, egal was dieser jetzt enthält. Das Image wird übertragen wie jedes entschlüsselte Image, Plan und Bestätigung sind also dieselben wie bei einer Datei. **Aus Flash-Sicherung wiederherstellen** nimmt eine .bin (ein ganzes 4-MB-Flash-Abbild, etwa ein Auslesen mit J-Link) oder eine .zip, die eines enthält (eine Preserve-Durchlaufdatei oder die ZIP-Datei, die „Auslesen & entschlüsseln 4.x/Nano“ oder „Alle Selektoren auslesen“ speichert), schneidet diesen Slot daraus heraus, entschlüsselt ihn und zeigt den Plan; sieht eine Sicherung nach einer anderen Kamera oder einer anderen Firmware aus, steht das im Plan. Ein Slot, der in der Sicherung leer ist oder den das Auslesen nicht gelesen hat, kann nicht durch einen Schreibvorgang wiederhergestellt werden, und die Seite sagt das.',
  'how.fps':
    '**Auf N FPS umstellen** in einer Slot-Zeile bearbeitet das Image dieses Slots auf eine höhere Bildrate, und **Alle Slots auf N FPS umstellen** tut das mit jedem Slot, für den der Patch verfügbar ist, mit einer einzigen Bestätigung, den Slot, aus dem die Kamera jetzt startet, als letzten. Für einen Slot, für den er nicht verfügbar ist, nennt die Seite den Grund.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Jeder Schreibvorgang sichert zuerst seinen Slot**: Der Slot wird erneut gelesen und als ein ZIP-Download gespeichert, benannt nach Uhrzeit, Seriennummer der Kamera, Firmware, Slot und Schreibvorgang (zum Beispiel `{example}`). Er enthält den Slot, wie er gespeichert ist, sein entschlüsseltes Image und eine Notiz, was jede Datei ist. Der Schreibvorgang wartet, bis der Download begonnen hat. Ein Browser meldet nicht, wann ein Download auf dem Datenträger angekommen ist, prüfen Sie daher Ihren Download-Ordner. Um zurückzugehen, schreiben Sie die entschlüsselte Datei aus der ZIP-Datei mit **Entschlüsseltes Image schreiben**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Ein Schreibvorgang löscht einen 64-KB-Slot und programmiert ihn. Der Bootloader bei `{address}` und die Boot-Konfiguration werden hier nie geschrieben, und es gibt kein Bedienelement, um den aktiven Slot zu wählen. Der Slot wird erst wirksam, nachdem die Kamera abgezogen und wieder eingesteckt wurde.',
} satisfies Translation<'slots'>;
