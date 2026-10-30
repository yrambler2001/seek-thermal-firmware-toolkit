/**
 * Namespace `decrypt`, Deutsch (de), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/DecryptView.tsx, hooks/useOfflineDecrypt.ts, hooks/useSlotFileDecrypt.ts,
 * components/DetectionBox.tsx, components/FilePickerButton.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useOfflineDecrypt: the status line. */
  'status.noFile': 'Keine Datei gewählt.',
  'status.reading': 'Datei wird gelesen ...',
  'status.notUsable': 'Kein verwendbares Flash-Abbild.',
  'status.building': 'Archiv wird erstellt ...',
  'status.nothingDecrypted':
    'Keine Images entschlüsselt — der Grund steht im Protokoll. Das Manifest liegt in Ihren Downloads.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Fertig — {done}/{count} Slot entschlüsselt. Prüfen Sie Ihre Downloads.',
    other: 'Fertig — {done}/{count} Slots entschlüsselt. Prüfen Sie Ihre Downloads.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Ein vorhandenes Flash-Abbild entschlüsseln',
  'offline.description': 'Ein vollständiges Flash-Abbild, Slot für Slot entschlüsselt.',
  'offline.intro':
    'Schritt 2 im 4.x/Nano-Tab entschlüsselt bereits alles, was er liest. Sie brauchen diesen Teil also nur, wenn Ihr Flash-Abbild aus einer anderen Quelle stammt — einem früheren Durchlauf, J-Link oder einem SPI-Programmiergerät. Die Datei wird lokal gelesen und nie hochgeladen. **Dieser Teil funktioniert in jedem Browser**, auch in Safari und unter iOS, weil er keinen USB-Zugriff braucht.',
  'offline.actions': 'Aktionen zum Offline-Entschlüsseln',
  'offline.choose': 'Flash-Abbild wählen…',
  'offline.panel': 'Offline entschlüsseln',
  'offline.detectedTitle': 'Erkannte Firmware-Familie',
  'offline.detectedIntro':
    'Es ist keine Kamera angeschlossen, daher wird die Familie anhand der Images in der Datei selbst bewertet. Der Schlüssel wird in jedem Fall aus dem Chiffretext jedes Slots berechnet; diese Bewertung bestimmt nur, welche Firmware-Familie im Bericht genannt wird.',
  'offline.scoreBasis': 'anhand der Images in der Datei',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Einen Firmware-Slot entschlüsseln',
  'slot.description': 'Ein Slot aus einer Datei: 64 KB, so wie die Kamera ihn speichert.',
  'slot.intro':
    'Wählen Sie eine Datei, die einen einzelnen Firmware-Slot enthält — einen Slot mit 65.536 Bytes, wie ihn das Auslesen eines Slots im Tab <link>{tab}</link> speichert, oder die 64 KB an der Adresse eines Slots in einem vollständigen Flash-Abbild. Die Seite ermittelt den Schlüssel aus den eigenen Bytes des Slots, entschlüsselt das Image und bietet es zum Download an, zusammen mit Schlüssel, Größe und SHA-256. Es wird keine Kamera verwendet, das funktioniert also auch ohne angeschlossenes Gerät.',
  'slot.refusedIntro':
    'Eine Datei, die nicht genau ein Slot ist, kein Firmware-Image enthält oder sich nicht entschlüsseln lässt, wird mit Begründung abgelehnt. Ein gelöschter Slot wird als solcher gemeldet; es gibt dann nichts zu entschlüsseln.',
  'slot.actions': 'Aktionen zur Slot-Datei',
  'slot.choose': 'Slot-Datei wählen…',
  'slot.decrypting': '{file} wird entschlüsselt …',
  'slot.unreadable': 'Die Datei konnte nicht gelesen werden.',
  'slot.notDecrypted':
    'Nicht entschlüsselt: {file} ist kein Firmware-Slot, den diese Seite entschlüsseln kann.',
  'slot.nothingWritten':
    'Es wurde nirgends etwas geschrieben. Wählen Sie eine 64-KB-Slot-Datei oder im Abschnitt oben ein vollständiges Flash-Abbild.',
  'slot.erased': '{file} ist ein gelöschter Slot.',
  'slot.resultTitle': 'Entschlüsselter Firmware-Slot',
  'slot.file': 'Datei',
  'slot.fileSize': 'Dateigröße',
  'slot.fileSha': 'SHA-256 der Datei',
  'slot.imageVersion': 'Image-Version',
  'slot.imageSize': 'Image-Größe',
  'slot.imageSha': 'SHA-256 des Images',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Prüfsumme',
  'slot.notComputed': 'für diese Form nicht berechnet',
  'slot.family': 'Familie',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (aus dem Image erkannt)',
  'slot.familyMismatch':
    '{name} — die Summe ist nicht der Zielwert der Prüfsumme dieser Familie, der Bootloader würde das Image in dieser Form also nicht annehmen',
  'slot.unknown': 'unbekannt',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': 'Schlüssel',
  'slot.keyPlain': 'keiner: Der Slot enthält das Image im Klartext (die Klartext-Kette von 2014)',
  'slot.keyFfB': 'Schlüssel B des 1.3.0.8-FF-Paars',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Gespeichert als',
  'slot.storedAsFfB':
    'das Image XOR den Schlüsselstrom von Schlüssel B, Header-Fenster unverändert',
  'slot.keyNone': 'keiner',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Schlüsselform',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k} — das Image selbst enthält diese Form genau einmal, das bestimmt sie',
  'slot.keyFormDefault':
    '{k} — keine Form kommt genau einmal im Image vor, daher wird der Standardwert der Familie angezeigt',
  'slot.resultActions': 'Aktionen zum entschlüsselten Image',
  'slot.download': '{file} herunterladen',
  'slot.downloadFallback': 'das entschlüsselte Image',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Erkannt',
  'detection.score': 'Bewertung',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} von 1.00, {basis}',
  'detection.readAs': 'Gelesen als',
  'detection.summary': 'Zusammenfassung',
  'detection.why': 'Begründung:',
  'detection.ambiguous':
    '**Die Hinweise haben nicht eindeutig ergeben, welche Familie das ist.** Entweder hat die führende Familie nicht besser abgeschnitten als der allgemeine Ersatz, oder eine zweite lag zu knapp dahinter, um zu entscheiden. Die Entschlüsselung ist davon nicht betroffen — der Schlüssel wird in jedem Fall aus dem Chiffretext berechnet —, aber die im Bericht genannte Familie und alles, was davon abhängt, ist eine Vermutung.',
} satisfies Translation<'decrypt'>;
