/**
 * Namespace `shared`, Deutsch (de), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: what several tabs share: components/RunPanel.tsx, Section.tsx, Panel.tsx,
 * KeyValue.tsx, HexBlock.tsx, components/ui/*, hooks/useRunner.ts, useReporter.ts, useDevice.ts,
 * useConnectionTest.ts, lib/camera-lock.ts, download.ts, backup-save.ts, hints.ts, family-line.ts,
 * identify.ts, unlock-seat.ts, webusb.ts, usb-adapter.ts, and components/DeviceInfoPanel.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* RunPanel: the bar, status line and log every long operation has. {label} is the panel's name. */
  'runPanel.percent': '{value} %',
  'runPanel.progressLabel': '{label}: Fortschritt',
  'runPanel.logLabel': '{label}: Protokoll',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… {count} ältere Zeile ausgeblendet',
    other: '… {count} ältere Zeilen ausgeblendet',
  },
  'runPanel.lineCount': { one: '{count} Zeile', other: '{count} Zeilen' },

  /* Status lines several panels set. */
  'status.idle': 'Bereit.',
  'status.cancelled': 'Abgebrochen.',
  'status.cancelling': 'Wird abgebrochen …',
  'status.failedSeeLog': 'Fehlgeschlagen — siehe Protokoll oben.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'Die Kamera wird in einem anderen Browser-Tab oder Fenster verwendet — beenden oder schließen Sie den Vorgang dort zuerst.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote':
    'Die ZIP-Datei wird automatisch heruntergeladen, bevor irgendetwas gesendet wird. Ein Browser meldet nicht, wann ein Download auf dem Datenträger angekommen ist. Prüfen Sie daher Ihren Download-Ordner, bevor Sie sich auf die Datei verlassen.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Kein Gerät ausgewählt.',
  'device.disconnected': 'Gerät getrennt.',
  'device.revoked': 'Berechtigung entzogen.',
  'device.unknownProduct': 'unbekanntes Produkt',
  'device.unknownVendor': 'unbekannter Hersteller',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'Unter Linux braucht die Kamera eine udev-Regel, bevor der Browser sie öffnen kann:\n\n{rule}\n\nZiehen Sie die Kamera danach ab und stecken Sie sie wieder ein. Chromium aus Snap oder Flatpak ist oft per Sandbox von direktem USB-Zugriff abgeschnitten; das .deb- oder .rpm-Paket ist die zuverlässige Wahl.',
  'hint.windows':
    'Unter Windows muss der WinUSB-Treiber an die Kamera gebunden sein, bevor irgendein Browser sie erreichen kann. Verwenden Sie Zadig (https://zadig.akeo.ie/): Options → List All Devices, wählen Sie den Eintrag, der nach Ihrer Kamera benannt ist — zum Beispiel „CompactPRO FF“ —, wählen Sie WinUSB und klicken Sie auf Replace Driver.',
  'hint.holding':
    'Ein anderes Programm oder ein Systemtreiber belegt die Kamera — die USB-Schnittstelle kann jeweils nur ein Prozess belegen. Beenden Sie alles andere, was mit der Kamera kommuniziert, ziehen Sie sie dann ab und stecken Sie sie wieder ein.',
  'hint.recipientFallback':
    'Oder stellen Sie in den Optionen den Empfänger (recipient) auf „Gerät“; dafür muss die Schnittstelle nicht belegt werden.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid':
    'Öffnen Sie „Optionen“ und lesen Sie den Hinweis unter den Feldern zum zulässigen Bereich.',
  'hint.usbTimeout':
    'Die Kamera hat die Anfrage angenommen und nie geantwortet. Ziehen Sie sie ab, stecken Sie sie wieder ein und versuchen Sie es dann mit einem kleineren chunk (64 ist der Wert, der überall funktioniert).',
  'hint.usbStalled':
    'Die Kamera hat die Anfrage abgelehnt. Meist bedeutet das, dass ihre Firmware sie nicht unterstützt. Die Seite fragt die Kamera vor jedem Lesen nach ihrer Familie. Anfragen, die weiter abgelehnt werden, galten also der Familie, die die Kamera selbst gemeldet hat. Prüfen Sie die Firmware-Version im Tab „Info“.',
  'hint.usbNotOpen':
    'Ein anderes Programm oder ein Systemtreiber belegt die Kamera. Schließen Sie es, oder stellen Sie in den Optionen den Empfänger (recipient) auf „Gerät“; dafür muss die Schnittstelle nicht belegt werden.',
  'hint.usbTransferFailed':
    'Ziehen Sie die Kamera ab, stecken Sie sie wieder ein und versuchen Sie es erneut.',
  'hint.deviceMode':
    'Die Kamera hat den Bildmodus nicht verlassen. Ziehen Sie sie ab, warten Sie, bis sie sich vollständig ausgeschaltet hat, und stecken Sie sie wieder ein.',
  'hint.deviceWindow':
    'Die Selektortabelle dieser Familie passte nicht zur Kamera. Öffnen Sie im 4.x/Nano-Tab die „Optionen“ und führen Sie „Alle Selektoren auslesen“ aus, um zu sehen, was die Kamera tatsächlich bereitstellt.',
  'hint.deviceVersionUnknown':
    'Es wurde nichts gesendet, was die Kamera verändern könnte. Ziehen Sie sie ab, stecken Sie sie wieder ein, lassen Sie sie fertig starten und versuchen Sie es erneut; eine Kamera, die ihre Firmware-Version meldet, wird normal gelesen.',
  'hint.imageMalformed': 'Die Datei ist kein entschlüsseltes Seek-Firmware-Image.',
  'hint.imageUnsupported':
    'Dieses Image kann in seiner jetzigen Form nicht für die Kamera aufbereitet werden.',
  'hint.imageKeyTable':
    'Das Image enthält nicht das Schlüsselpaar, das sein Dateiname angibt. Verwenden Sie die entschlüsselte Datei genau so, wie das Auslesen sie gespeichert hat, auch mit unverändertem Namen.',
  'hint.flashRefused': 'Es wurde nichts in die Kamera geschrieben.',
  'hint.familyUnsupported':
    'Es wurde nichts gelesen oder geschrieben. Jeder Tab deckt einen Bereich von Firmware-Versionen ab: Kameras mit 0.x und 1.x gehören zu „Auslesen & entschlüsseln 0.x/1.x 2014/2016“, Kameras mit 4.x und Nano zu „Auslesen & entschlüsseln 4.x/Nano“. Der Tab „Info“ sagt, zu welchem Tab die Kamera gehört.',
  'hint.firmwareTooOld':
    'Keine Firmware-Familie kann diesen Build hier lesen: Seine Firmware hat keinen Lese-Handler für den Befehl, mit dem dieser Tab den Flash-Speicher liest. Deshalb wurde nichts an sie gesendet, was falsch gelesen werden könnte. Eine Compact mit 0.7.0.7 oder 0.7.0.8 lässt sich unter „Auslesen & entschlüsseln 0.x/1.x 2014/2016“ lesen. Ein Flash-Abbild, das mit einem SPI-Programmiergerät oder über SWD/J-Link erstellt wurde, kann auf dieser Seite trotzdem entschlüsselt werden, unter „Datei/Slot entschlüsseln“.',
  'hint.powerCycle':
    'In diesem Assistenten: Ziehen Sie die Kamera ab und stecken Sie sie wieder ein, klicken Sie auf „Gerät verbinden“ und wählen Sie sie aus, und starten Sie dann denselben Schritt noch einmal. Der Durchlauf ist hier noch geladen — es gibt nichts fortzusetzen.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Laufende Firmware',
  'deviceInfo.version': 'Version',
  'deviceInfo.family': 'Firmware-Familie',
  'deviceInfo.build': 'Build',
  'deviceInfo.bootloader': 'Bootloader',
  'deviceInfo.platform': 'Plattform',
  'deviceInfo.serial': 'Seriennummer',
  'deviceInfo.usbLink': 'USB-Verbindung',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Boot-Konfiguration',
  'deviceInfo.bootedFrom': 'Gestartet aus',
  'deviceInfo.nextStart': 'Nächster Start',
  'deviceInfo.upgradeTarget': 'Upgrade-Ziel (eigenes Upgrade)',
  'deviceInfo.bankAt': '{bank} bei {address}',
  'deviceInfo.perDeviceKey': 'Geräteschlüssel',
  'deviceInfo.notProgrammed': 'nicht programmiert — die Kamera verwendet ersatzweise Schlüssel B',
  'deviceInfo.keysTitle': 'Aus dieser Kamera gelesene Schlüssel',
  'deviceInfo.foundAt': 'Gefunden bei',
  'deviceInfo.flashOffset': 'Flash-Offset {offset}',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Schlüssel A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Schlüssel B',
  'deviceInfo.keysConfirmed':
    'Bestätigt durch Abgleich mit dem Schlüsselstrom-Zustand eines Slots, der aus dem Chiffretext selbst gewonnen wurde. Ein Upload wird so gebaut, dass jeder Slot ihn unter dem Speicherschlüssel des Bootloaders ({storeKey}) ablegt, oder unter dem eigenen Schlüssel des gestarteten Slots, wo der Speicherschlüssel der Anwendung ein anderer ist.',
  'deviceInfo.keysDecrypted':
    'Jeder Slot wurde im Browser entschlüsselt, indem sein Schlüsselstrom aus seinen eigenen Reset-Vektoren berechnet wurde, deren Klartext bekanntermaßen null ist. Entschlüsseln ist nicht dasselbe wie Starten: Der Bootloader probiert immer nur {storeKey} und Schlüssel A. Ein Slot, der unter einem anderen Schlüssel geschrieben wurde, hat deshalb eine fehlerfreie Prüfsumme und wird trotzdem übersprungen. Es wurde nichts geschrieben.',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**{banks} enthält ein gültiges Firmware-Image, das mit einem Schlüssel verschlüsselt ist, den der Bootloader dieser Kamera nicht kennt.** Das Image ist intakt und seine Prüfsumme stimmt, aber der Bootloader probiert beim Prüfen eines Slots nur {storeKey} und Schlüssel A. Deshalb überspringt er ihn und startet etwas anderes.',
    other:
      '**{banks} enthalten jeweils ein gültiges Firmware-Image, das mit einem Schlüssel verschlüsselt ist, den der Bootloader dieser Kamera nicht kennt.** Die Images sind intakt und ihre Prüfsummen stimmen, aber der Bootloader probiert beim Prüfen eines Slots nur {storeKey} und Schlüssel A. Deshalb überspringt er sie und startet etwas anderes.',
  },
  'deviceInfo.orphanIsTarget':
    'Das ist der Slot, in den ein Upgrade schreibt. Die Anwendung, die auf dieser Kamera läuft, verschlüsselt mit diesem unbekannten Schlüssel neu. **Ein Schreiben über diese Seite erzeugt deshalb nur einen weiteren Slot, aus dem der Bootloader nicht starten kann** — in Betrieb bleibt {bank}. Der Ausweg ist, den Slot direkt mit einem SPI-Programmiergerät oder über SWD/J-Link zu schreiben.',
  'deviceInfo.otherBank': 'der andere Slot',
} satisfies Translation<'shared'>;
