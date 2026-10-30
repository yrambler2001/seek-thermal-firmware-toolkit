/**
 * Namespace `v4`, Deutsch (de), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/V4View.tsx, hooks/useDumpPanel.ts, components/CameraIdentity.tsx,
 * components/OpcodeTable.tsx, components/OptionsDetails.tsx, lib/options.ts.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useDumpPanel: the status line. */
  'status.starting': 'Wird gestartet ...',
  'status.building': 'Archiv wird erstellt ...',
  'status.cancelling': 'Wird abgebrochen — alles bisher Gelesene wird gespeichert ...',
  'status.refused': 'Abgelehnt — es wurde nichts gelesen. Siehe die Meldung über dem Protokoll.',
  'status.sweepDone':
    'Fertig — {armed}/{total} Selektoren aktiviert, {withData} mit Daten. Prüfen Sie Ihre Downloads.',
  'status.sweepDoneCancelled':
    'Fertig — {armed}/{total} Selektoren aktiviert, {withData} mit Daten (abgebrochen). Prüfen Sie Ihre Downloads.',
  'status.dumpDone': 'Fertig — {read}/{expected} Fenster gelesen. Prüfen Sie Ihre Downloads.',
  'status.dumpDoneCancelled':
    'Fertig — {read}/{expected} Fenster gelesen (abgebrochen). Prüfen Sie Ihre Downloads.',
  'status.dumpDoneIncomplete':
    'Fertig — {read}/{expected} Fenster gelesen (unvollständig — siehe Protokoll). Prüfen Sie Ihre Downloads.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'Die Kamera passte nicht zur Familie 4.x/Nano, und dieser Tab liest nur diese Familie. Es wurde nichts gelesen. Für eine Kamera mit 0.x oder 1.x (Builds von 2014 oder 2016) verwenden Sie „{tab}“.',
  'refusal.otherFamily':
    'Die Kamera sieht nach {name} ({id}) aus, nicht nach einer 4.x/Nano-Kamera, und dieser Tab liest nur 4.x/Nano. Es wurde nichts gelesen. Für eine Kamera mit 0.x oder 1.x (Builds von 2014 oder 2016) verwenden Sie „{tab}“.',
  'refusal.legacyLine':
    'Die Kamera führt {version} aus, einen Build mit 0.x oder 1.x (2014 oder 2016), und dieser Tab liest nur 4.x/Nano. Außer der Version wurde nichts gelesen. Für eine Kamera mit 0.x oder 1.x verwenden Sie „{tab}“.',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Auslesen',
  'dump.actions': 'Aktionen zum Auslesen',
  'dump.start': 'Auslesen starten',
  'dump.panel': 'Auslesen',
  'dump.how':
    'Beide fragen die Kamera zuerst, welche Firmware sie ausführt: ihre Version, mit `{getInfo}` — dem einen Lesebefehl, den jeder Seek-Build gleich beantwortet — und, nur wenn dieser Build über USB gelesen werden kann, je ein einfaches und ein Token-tragendes `{begin}` sowie ein einzelnes Lesen. So erkennt die Seite, welcher Familie die Kamera angehört. Dieser Tab liest nur die Familie 4.x und Nano. Eine Kamera, die die Antworten anderswo einordnen, wird abgelehnt, bevor irgendetwas gelesen wird, und die Seite nennt den passenden Tab. Eine Kamera, die ihre Version nicht meldet oder einen Build älter als 0.8.0.0 ausführt, wird gar nicht gelesen, und die Seite sagt, warum.',
  'dump.modes':
    '**Auslesen starten** liest jeden Block, den die eigene Selektortabelle des Builds erreicht. **Alle Selektoren auslesen** unter *Optionen* weiter unten probiert jeden `{begin}`-Selektor `{first}`–`{last}` und speichert, was jeder zurückgibt — langsamer, erfasst aber auch Blöcke, die die kuratierte Tabelle auslässt.',
  'dump.sweep': 'Alle Selektoren auslesen ({first}–{last})',
  'dump.sweepNote':
    'Probiert jeden Selektor und speichert, was jeder zurückgibt. Langsamer als „Auslesen starten“.',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'Was Sie erhalten',
  'output.intro': 'Einen einzigen `{ext}`-Download mit:',
  'output.caption': 'Dateien im heruntergeladenen Archiv',
  'output.file': 'Datei',
  'output.what': 'Inhalt',
  'output.flash':
    'das zusammengesetzte 4-MB-Flash-Abbild (die Lückenfüllung und, falls verwendet, das Entsperr-Token stehen in manifest.json)',
  'output.windows': 'jeder 64-KB-Block genau so, wie er über USB kam',
  'output.decrypted':
    'jeder Slot mit Firmware-Image, entschlüsselt (falls ein Schlüssel gefunden wurde)',
  'output.reports':
    'Bericht pro Slot: Schlüssel, Fundort des Schlüssels, Familie und Verschlüsselung, SP, Einsprungadresse, SHA-256',
  'output.manifest': 'genaue Metadaten zu Lesen, Lücken und Entschlüsselung',
  'output.readme': 'was die Aufnahme ist und wo ihre Grenzen liegen',
  'output.keyFromDump':
    'Der Schlüssel wird aus dem Flash-Abbild selbst gewonnen, es ist also weder eine Schlüsseldatei noch ein Gerätegeheimnis nötig.',
  'output.bestEffort':
    'Die Entschlüsselung bleibt trotzdem ohne Gewähr. Wird kein Schlüssel gefunden — zum Beispiel bei einem Gerät, dessen Bootloader den Schlüssel aus dem OTP-Speicher des Chips ableitet, der in einem Flash-Abbild nicht enthalten ist —, wird dieser Slot einfach übersprungen, und der Rest des Archivs ist nicht betroffen.',

  /* views/V4View: the read-only guarantee. Command names are params, in `code`. <link> wraps the Slots tab's name. */
  'readonly.title': 'Nur-Lese-Garantie',
  'readonly.intro':
    'Dieser Tab kann genau sechs Herstellerbefehle senden. Das ist sein gesamter Wortschatz — es gibt keinen Codepfad zu irgendetwas anderem:',
  'readonly.caption': 'Die sechs reinen Lese-Herstellerbefehle',
  'readonly.absent':
    '`{setData}`, `{complete}`, `{reset}` und alle Befehle zum Hochladen, Committen und Löschen fehlen in dieser Ansicht. Auch `{usbReset}` wird nie aufgerufen; bei einem erneuten Versuch wird die Verbindung nur geschlossen und neu geöffnet. Die Entschlüsselung geschieht vollständig im Arbeitsspeicher, an der Kopie in Ihrem Browser, und berührt das Gerät nie.',
  'readonly.writing':
    'Das Schreiben in die Kamera liegt in einem anderen Tab, <link>{tab}</link>, der jeweils einen Slot schreibt und vor jedem Schreibvorgang nachfragt. Nichts in *diesem* Tab kann diese Befehle erreichen.',
  'readonly.firstReads':
    'Bis die Kamera ihre Firmware-Version gemeldet hat, werden nur drei der sechs gesendet, und nur als Lesevorgänge: `{getInfo}`, `{getMode}` und `{getError}`. Das sind die Lesebefehle, die in allen 36 untersuchten Firmware-Images dieselbe Befehlsnummer mit derselben Bedeutung haben. Eine Befehlsnummer bedeutet nicht in jedem Build dasselbe, daher geht nichts anderes hinaus, bis der Build bekannt ist.',
  'gap.summary': 'Die Lücke bei {address}',
  'gap.where':
    'Der USB-Befehlssatz bietet einen Selektor für das Lesefenster für jeden 64-KB-Block des 4 MB großen Flash-Speichers außer `{range}`. Dieser Block wird im zusammengesetzten Abbild mit `{fill}` gefüllt und in `{manifest}` vermerkt.',
  'gap.costs':
    '**In der Praxis kostet Sie das nichts.** Bei den meisten Kameras ist dieser Block einfach gelöschter Flash-Speicher, der ohnehin als `{fill}` gelesen wird — die Füllung entspricht also dem, was wirklich dort steht, und das Abbild ist vollständig.',
  'gap.redundant':
    'Und wenn der Block *doch* belegt ist, enthält er eine redundante Kopie. Diese Kameras halten dasselbe Firmware-Image in mehreren 64-KB-Slots: In jedem Flash-Abbild mit mehreren Slots, das bei der Entwicklung dieser Seite geprüft wurde, ergaben alle Slots entschlüsselt byteidentische Firmware — in einem Fall über vier Slots hinweg, die mit zwei verschiedenen Schlüsseln geschrieben worden waren. Auf dem einen Gerät mit einem echten Image bei `{address}` war es Byte für Byte gleich den Kopien bei `{before}` und `{after}`. Das Archiv enthält diese Firmware also trotzdem, nur von einer anderen Adresse gelesen.',
  'gap.fine':
    'Diese Redundanz ist auch der Grund, warum eine Kamera, deren `{address}` als `{fill}` gelesen wird, in Ordnung ist: Die startfähige Firmware ist in den anderen Slots weiterhin vorhanden. Nichts in diesem Tab schreibt ohnehin in das Gerät — die Lücke betrifft nur die Datei, die Sie herunterladen.',
  'gap.complete':
    'Wenn Sie wirklich ein streng vollständiges Abbild Byte für Byte brauchen — etwa um den Flash-Speicher mit einer Referenz zu vergleichen —, lesen Sie ihn über SWD/J-Link oder mit einem SPI-Programmiergerät.',

  /* components/OpcodeTable. Opcodes, names and IN/OUT stay as they are. */
  'opcodes.opcode': 'Opcode',
  'opcodes.name': 'Name',
  'opcodes.dir': 'Richtung',
  'opcodes.why': 'Wozu er dient',
  'opcodes.getInfo':
    'die laufende Firmware-Version, zuerst gelesen: Sie entscheidet, welche Selektortabelle das Auslesen verwendet, und eine Kamera, die keine meldet, wird nicht gelesen',
  'opcodes.getError': 'Status nach jedem Schritt prüfen',
  'opcodes.setMode': 'nur um Modus 0 zu wählen, und nur, wenn er nicht schon aktiv ist',
  'opcodes.getMode': 'den aktuellen Modus lesen',
  'opcodes.getData': 'das eigentliche Lesen des Flash-Speichers',
  'opcodes.begin':
    'nur flüchtiger Selektor für das Lesefenster — er wählt, welchen 64-KB-Block die nächsten Lesevorgänge liefern, und schreibt nichts',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown':
    'Nicht gelesen: Die Kamera hat nicht gesagt, welche Firmware sie ausführt.',
  'identity.unsupported': 'Nicht gelesen: Diese Kamera kann auf diese Weise nicht gelesen werden.',
  'identity.title': 'Erkannte Kamera',
  'identity.firmware': 'Firmware',
  'identity.scoreBasis': 'anhand der Antworten der Kamera, bevor ein Slot gelesen wird',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Optionen',
  'options.subtitle': '— die Standardwerte sind richtig; hier müssen Sie nichts ändern.',
  'options.chunk': 'chunk (Control-IN-Bytes)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'gap-fill-Byte',
  'options.retries': 'Wiederholungen pro Fenster',
  'options.retryDelay': 'Wartezeit vor Wiederholung (ms)',
  'options.recipient': 'Empfänger der Control-Übertragung',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'automatisch',
  'options.recipientInterface': 'Schnittstelle ({requestTypes})',
  'options.recipientDevice': 'Gerät ({requestTypes})',
  'options.decrypt': 'Firmware entschlüsseln',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'ja',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'nein',
  'options.help':
    '**chunk** ist die Größe jedes Control-IN-Lesevorgangs, höchstens 64: ein EP0-Paket. Bei einem längeren Lesevorgang kann ein Paket an das Boot-ROM der Kamera verloren gehen, wenn die Kamera im Leerlauf mit niedrigem Takt läuft; ein größerer Wert wird daher in Schritten von 64 Bytes gelesen. Ein kleinerer Wert wird wie angegeben verwendet, und wenn eine Kamera die Anfrage blockiert, geht die Seite von sich aus tiefer und macht weiter. **gap-fill** ist das Byte, das in den einen 64-KB-Block geschrieben wird, den USB nicht erreicht. **recipient** (der Empfänger) steht standardmäßig auf Schnittstelle und weicht auf Gerät aus, wenn der Browser Interface 0 nicht belegen kann — die Firmware akzeptiert beides.',
  'options.chunkRange': 'chunk muss zwischen 1 und {max} liegen, erhalten: {value}',
  'options.gapFillByte': 'gap-fill muss ein einzelnes Byte sein, erhalten: {value}',
  'options.retriesMin': 'Wiederholungen müssen null oder mehr sein, erhalten: {value}',
  'options.retryDelayMin': 'Wartezeit muss null oder mehr sein, erhalten: {value}',
} satisfies Translation<'v4'>;
