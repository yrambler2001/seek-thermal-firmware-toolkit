/**
 * Namespace `info`, Deutsch (de), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/InfoView.tsx, hooks/useInfoPanel.ts, components/CameraReport.tsx (its labels only: the
 * copyable report text stays English).
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useInfoPanel: the status line. */
  'status.notRead': 'Noch nicht gelesen.',
  'status.reading': 'Wird gelesen ...',
  'status.noVersion': 'Keine Version gemeldet.',
  'status.tooOld':
    'Gelesen. Firmware {version} ist älter als 0.8.0.0 — sonst wurde nichts gelesen.',
  'status.read': 'Gelesen. Firmware {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Die Kamera lesen',
  'read.description':
    'Nur Lesen. Fragt die Kamera, was sie ausführt, wie sie startet, welche Schlüssel sie hat und was jeder Slot enthält: dasselbe Lesen wie seek-fw info. Es wird nichts geschrieben.',
  'read.actions': 'Info-Aktionen',
  'read.button': 'Firmware-Version lesen',
  'read.connectFirst':
    'Verbinden Sie zuerst oben die Kamera und klicken Sie dann auf „Firmware-Version lesen“.',
  'read.showDetails': 'Details im Protokoll anzeigen',
  'read.panel': 'Firmware-Version',
  'result.title': 'Was die Kamera meldet',
  'result.version': 'Firmware-Version',
  'result.build': 'Build',
  'result.range': 'Versionsbereich',
  'result.tab': 'Tab für diese Kamera',
  'result.rangeLegacy': '0.x / 1.x: die Kameras von 2014 und 2016',
  'result.rangeModern': '2.x und neuer: die Kameras mit 4.x, Nano und Mosaic',
  'result.rangeUnknown': 'unbekannt',
  'result.noVersion':
    '**Die Kamera hat ihre Firmware-Version nicht gemeldet.** Sonst wurde nichts gesendet. Ziehen Sie sie ab, stecken Sie sie wieder ein, lassen Sie sie fertig starten und lesen Sie erneut.',
  'result.noTab': 'Kein Tab liest diesen Build.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Öffnen Sie für diese Kamera <tab>{tab}</tab>. Dieser Tab fragt die Kamera vor jedem Lesen noch einmal nach ihrer Familie und lehnt eine Kamera ab, die nicht zu der Familie gehört, für die er gedacht ist.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'Wofür jeder Tab da ist',
  'tabs.intro':
    'Fünf Tabs, in dieser Reihenfolge. Jeder ist eine eigene Seite, und die Kopfzeile zeigt, in welchem Sie sich befinden.',
  'tabs.caption': 'Die Tabs, was sie tun, welche Kameras sie abdecken und ob sie schreiben',
  'tabs.tab': 'Tab',
  'tabs.does': 'Was er tut',
  'tabs.cameras': 'Kameras',
  'tabs.writes': 'Schreibt in die Kamera?',
  'tabs.info.does':
    'Liest, was die Kamera meldet: ihre Firmware, die Familie, als die sie sich meldet, wie sie startet, ihre Schlüssel und jeden Slot. Dasselbe Lesen wie seek-fw info. Er schreibt nichts.',
  'tabs.info.cameras': 'Jede Seek-Kamera, die WebUSB öffnen kann.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Nein.',
  'tabs.preserve.does':
    'Erstellt eine vollständige Kopie des 4 MB großen Flash-Speichers der Kamera und speichert nach jedem Schritt eine Durchlaufdatei. Um alles lesen zu können, patcht er die Firmware vorübergehend, bringt danach die ursprüngliche Firmware zurück und prüft sie. Er führt Schritt für Schritt durch den Ablauf.',
  'tabs.preserve.cameras':
    'Kameras mit Firmware 0.x und 1.x: die Compact-Builds von 2014, die Compact-PRO-Builds von 2016 (1.0.3.x) und der Compact-Build 1.3.0.8 FF (16 Hz).',
  'tabs.preserve.writes':
    'Ja, in zwei Schritten, und jeder fragt vorher nach. Er stellt die Kamera wieder so her, wie sie war.',
  'tabs.v4.does':
    'Liest den gesamten Flash-Speicher einer Kamera mit 4.x oder Nano und entschlüsselt die gefundenen Firmware-Slots. Nur Lesen: Er sendet sechs Lesebefehle und keinen Schreibbefehl.',
  'tabs.v4.cameras':
    'Kameras mit Firmware 4.x (Compact, Compact PRO, Compact XR), Mosaic (10.x und 2.x) und Nano (42.x und 44.x), ab 2018.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Nein.',
  'tabs.decrypt.does':
    'Entschlüsselt eine Datei, die Sie bereits haben: ein vollständiges Flash-Abbild, Slot für Slot, oder einen einzelnen 64-KB-Firmware-Slot. Das Ergebnis kann heruntergeladen werden.',
  'tabs.decrypt.cameras':
    'Keine. Er verwendet keine Kamera, funktioniert also ohne angeschlossenes Gerät und in jedem Browser.',
  'tabs.decrypt.writes': 'Nein. Er schreibt nur den Download.',
  'tabs.slots.does':
    'Liest die drei Firmware-Slots (Slot A, Slot B und Recovery-Slot R), zeigt, was jeder enthält und aus welchem die Kamera startet, und kann jeweils einen Slot auslesen oder beschreiben.',
  'tabs.slots.cameras': 'Kameras mit Firmware 0.8.0.0 und neuer.',
  'tabs.slots.writes': 'Ja, jeweils einen Slot, und jeder Schreibvorgang fragt vorher nach.',

  /* views/InfoView: where the 2016 and 1.3.0.8 FF builds are. Tab names in ** are the tab labels. */
  'split.title': 'Wo die Builds von 2016 und 1.3.0.8 FF zu finden sind',
  'split.where':
    'Die Compact-PRO-Builds von 2016 (1.0.3.0 und 1.0.3.2, einschließlich ihrer FF-Varianten) und der Compact-Build 1.3.0.8 FF (16 Hz) sind **keine** 4.x-Kameras und werden auch nicht wie eine gelesen. Ihr Protokoll ist das gesperrte von 2014–2017, und ihre Firmware speichert die Slots mit einer anderen Verschlüsselung (2016) oder als Klartext-Kette von 2014 mit einem Weg nur über den Recovery-Slot (FF). Sie gehören deshalb zu **Auslesen & entschlüsseln 0.x/1.x 2014/2016**, und der 4.x/Nano-Tab lehnt sie ab, bevor er irgendetwas liest.',
  'split.evidence':
    'Der Nachweis, dass sie im 0.x/1.x-Tab funktionieren: Die Preserve-Pipeline hat für jeden von ihnen einen abgeleiteten Patch, und ihre Emulator-Läufe sind für beide erfolgreich. Der Build 1.0.3.0 hat auf seinem nativen Flash-Abbild von 2016 Sicherung, Patch, Commit, vollständiges Auslesen, Wiederherstellung und Prüfung durchlaufen; der 1.3.0.8 FF hat seinen Weg über den Recovery-Slot durchlaufen. Auf der Testkamera, einer Compact PRO 1.0.3.0, wurde das Lesen in Preserve-Schritt 02 ohne Reset und ohne Schreiben abgeschlossen, und die Kamera wurde als 2016er-Verschlüsselung erkannt. Auf diesen Builds wird die 4.x-Selektortabelle bei 38 ihrer 63 Selektoren abgelehnt, der 4.x-Tab könnte für sie also nur Lücken liefern.',
  /* "There" is the 4.x/Nano tab: the page once had a firmware-family selector there, and it is gone, so no setting routes these builds into the 4.x/Nano read. */
  'split.stay':
    'Sie bleiben deshalb im 0.x/1.x-Tab, und der 4.x/Nano-Tab hat keine Auswahl der Firmware-Familie, über die sie dort gelesen würden.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Kamera',
  'report.product': 'Produkt',
  'report.manufacturer': 'Hersteller',
  'report.serial': 'Seriennummer',
  'report.platform': 'Plattform',
  'report.usbLink': 'USB-Verbindung',
  'report.noProduct': '(kein Produktname)',
  'report.none': '(keiner)',
  'report.unreadable': '(nicht lesbar)',
  'report.firmware': 'Firmware',
  'report.running': 'Laufend',
  'report.bootloader': 'Bootloader',
  'report.family': 'Firmware-Familie',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Gelesen als',
  'report.detected': 'Erkannt',
  'report.boot': 'Start',
  'report.booted': 'Gestartet',
  'report.lastStart': 'Letzter Start',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'Laufend (1.3.0.8)',
  'report.nextStart': 'Nächster Start',
  'report.upgradeTarget': 'Upgrade-Ziel',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(nicht abgefragt)',
  'report.targetConfirmed': '{slot} (über USB bestätigt)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'unbekannt: {why}. Für ein 16-Hz-FF-Image muss die Kamera sagen, welchen Build sie ausführt (der Slots-Tab fragt danach)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': 'der 16-Hz-FF-Build 1.3.0.8',
  'report.build8Hz': 'der 8-Hz-Build 1.3.0.8',
  'report.keys': 'Schlüssel',
  'report.slots': 'Slots',
  'report.slotsCaption':
    'Jeder Slot so, wie das Lesen ihn vorgefunden hat. Nur Lesen: Geschrieben wird im Slots-Tab.',
  'report.slot': 'Slot',
  'report.address': 'Adresse',
  'report.version': 'Version',
  'report.size': 'Größe',
  'report.key': 'Schlüssel',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Akzeptiert',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Footer',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Startfähig',
  'report.bytes': '{count} B',
  'report.plaintext': 'keiner (Klartext)',
  /** A table value, lower case: "yes". */
  'report.yes': 'ja',
  /** A table value, lower case: "no". */
  'report.no': 'nein',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'k. A.',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Schreiben',
  'report.noBankWritten': 'Kein Slot dieser Kamera wird beschrieben:',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'Ein Slot nach dem anderen: Der Slots-Tab beschreibt oder patcht jeweils einen Slot dieser Kamera; jeder Slot wird unverschlüsselt übertragen (das Image, wie es ist, ohne Schlüssel); und jeder Schreibvorgang fragt vorher nach.',
  'report.oneBank.slotKeystream':
    'Ein Slot nach dem anderen: Der Slots-Tab beschreibt oder patcht jeweils einen Slot dieser Kamera; jeder Slot wird unter dem eigenen Schlüsselblock 0 seines Images übertragen; und jeder Schreibvorgang fragt vorher nach.',
  'report.oneBank.keyA':
    'Ein Slot nach dem anderen: Der Slots-Tab beschreibt oder patcht jeweils einen Slot dieser Kamera; jeder Slot wird unter Schlüsseln übertragen, die vom gestarteten Slot und der laufenden Anwendung abgeleitet sind; und jeder Schreibvorgang fragt vorher nach.',
  'report.oneBank.ffVendor':
    'Ein Slot nach dem anderen: Der Slots-Tab beschreibt oder patcht jeweils einen Slot dieser Kamera; jeder Slot wird so übertragen, wie die Hersteller-App das 16-Hz-FF-Image überträgt (das Image XOR seinen eigenen Schlüsselblock 0), und von der Kamera unter Schlüssel B gespeichert; und jeder Schreibvorgang fragt vorher nach.',
  'report.refusesEvery': 'Der Slots-Tab lehnt jeden Slot dieser Kamera ab:',
} satisfies Translation<'info'>;
