/**
 * Namespace `shared`, română (ro), translated from the English source.
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
  'runPanel.percent': '{value}%',
  'runPanel.progressLabel': 'Progres: {label}',
  'runPanel.logLabel': 'Jurnal: {label}',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… {count} linie anterioară eliminată',
    few: '… {count} linii anterioare eliminate',
    other: '… {count} de linii anterioare eliminate',
  },
  'runPanel.lineCount': { one: '{count} linie', few: '{count} linii', other: '{count} de linii' },

  /* Status lines several panels set. */
  'status.idle': 'În așteptare.',
  'status.cancelled': 'Anulat.',
  'status.cancelling': 'Se anulează …',
  'status.failedSeeLog': 'Eșuat — vedeți jurnalul de mai sus.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'Camera este folosită în altă filă sau fereastră — terminați sau închideți mai întâi acolo.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote': 'Arhiva zip se descarcă automat, înainte să se trimită ceva.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Niciun dispozitiv selectat.',
  'device.disconnected': 'Dispozitiv deconectat.',
  'device.revoked': 'Permisiune revocată.',
  'device.unknownProduct': 'produs necunoscut',
  'device.unknownVendor': 'producător necunoscut',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'Pe Linux, camera are nevoie de o regulă udev înainte ca browserul să o poată deschide:\n\n{rule}\n\nApoi deconectați și reconectați camera. Versiunile Snap și Flatpak ale Chromium sunt adesea izolate de dispozitivele USB brute; versiunea .deb sau .rpm este cea de încredere.',
  'hint.windows':
    'Pe Windows, driverul WinUSB trebuie asociat camerei înainte ca vreun browser să poată ajunge la ea. Folosiți Zadig (https://zadig.akeo.ie/): Options → List All Devices, alegeți intrarea care poartă numele camerei — de exemplu „CompactPRO FF” —, alegeți WinUSB și faceți clic pe Replace Driver.',
  'hint.holding':
    'Un alt program sau un driver de sistem ține ocupată camera — un singur proces poate ține interfața USB la un moment dat. Închideți orice altceva comunică cu ea, apoi deconectați și reconectați camera.',
  'hint.recipientFallback':
    'Sau setați recipient la „device” în opțiunile de citire; așa nu este nevoie ca interfața să fie revendicată.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid':
    'Deschideți „Opțiuni” și citiți nota de sub câmpuri pentru fiecare interval.',
  'hint.usbTimeout':
    'Camera a acceptat cererea și nu a mai răspuns. Deconectați-o și reconectați-o, apoi încercați o valoare chunk mai mică (64 este valoarea care merge peste tot).',
  'hint.usbStalled':
    'Camera a respins cererea. De obicei, asta înseamnă că firmware-ul ei nu o acceptă. Pagina întreabă camera din ce familie face parte înainte să citească ceva, așa că cererile care tot sunt respinse au fost făcute pentru familia raportată chiar de cameră. Verificați versiunea firmware-ului pe fila Info.',
  'hint.usbNotOpen':
    'Un alt program sau un driver de sistem ține ocupată camera. Închideți-l sau setați recipient la „device” în opțiunile de citire; așa nu este nevoie ca interfața să fie revendicată.',
  'hint.usbTransferFailed': 'Deconectați și reconectați camera, apoi încercați din nou.',
  'hint.deviceMode':
    'Camera nu a ieșit din modul de imagine. Deconectați-o, așteptați să se oprească de tot și conectați-o din nou.',
  'hint.deviceWindow':
    'Harta de selectori folosită de această familie nu s-a potrivit cu camera. Pe fila 4.x/Nano, deschideți Opțiuni și rulați „Extragerea tuturor selectorilor” ca să vedeți ce oferă de fapt camera.',
  'hint.deviceVersionUnknown':
    'Nu s-a trimis nimic care ar putea modifica camera. Deconectați-o, conectați-o din nou, lăsați-o să termine pornirea și încercați din nou; o cameră care își raportează versiunea firmware-ului este citită normal.',
  'hint.imageMalformed': 'Fișierul nu este o imagine de firmware Seek decriptată.',
  'hint.imageUnsupported': 'Această imagine nu poate fi împachetată pentru cameră așa cum este.',
  'hint.imageKeyTable':
    'Imaginea nu conține perechea de chei pe care o indică numele fișierului. Folosiți fișierul decriptat exact așa cum a fost salvat la extragere, cu tot cu nume.',
  'hint.flashRefused': 'Nu s-a scris nimic în cameră.',
  'hint.familyUnsupported':
    'Nu s-a citit și nu s-a scris nimic. Fiecare filă acoperă un interval de versiuni de firmware: camerele 0.x și 1.x merg la „Extragere și decriptare 0.x/1.x”, camerele 4.x și Nano la „Extragere și decriptare 4.x/Nano”. Fila Info spune la ce filă merge camera.',
  'hint.firmwareTooOld':
    'Nicio familie de firmware nu poate citi aici acest build: firmware-ul lui nu are o rutină de citire pentru comanda cu care această filă citește memoria flash, așa că nu i s-a trimis nimic ce ar putea fi citit greșit. Un Compact cu 0.7.0.7 sau 0.7.0.8 poate fi citit pe „Extragere și decriptare 0.x/1.x”. Un dump făcut cu un programator SPI sau prin SWD/J-Link poate fi totuși decriptat pe această pagină, la „Decriptare fișier/slot”.',
  'hint.powerCycle':
    'În acest asistent: deconectați camera și conectați-o din nou, apăsați „Conectare dispozitiv” și alegeți-o, apoi porniți din nou același pas. Rularea este încă încărcată aici — nu este nimic de reluat.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Firmware în rulare',
  'deviceInfo.version': 'Versiune',
  'deviceInfo.family': 'Familie de firmware',
  'deviceInfo.build': 'Build',
  'deviceInfo.bootloader': 'Bootloader',
  'deviceInfo.platform': 'Platformă',
  'deviceInfo.serial': 'Număr de serie',
  'deviceInfo.usbLink': 'Legătură USB',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Config. de pornire',
  'deviceInfo.bootedFrom': 'Pornită din',
  'deviceInfo.nextStart': 'Următoarea pornire',
  'deviceInfo.upgradeTarget': 'Ținta actualizării (propria actualizare)',
  'deviceInfo.bankAt': '{bank} la {address}',
  'deviceInfo.perDeviceKey': 'Cheia proprie a dispozitivului',
  'deviceInfo.notProgrammed': 'neprogramată — camera folosește în schimb cheia B',
  'deviceInfo.keysTitle': 'Chei citite din această cameră',
  'deviceInfo.foundAt': 'Găsită la',
  'deviceInfo.flashOffset': 'offsetul {offset} din memoria flash',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Cheia A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Cheia B',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**În {banks:acc} se află o imagine de firmware validă, criptată cu o cheie pe care bootloader-ul acestei camere nu o cunoaște.** Imaginea este intactă și suma ei de control este corectă, dar bootloader-ul încearcă doar {storeKey:acc} și cheia A când verifică un slot, așa că îl sare și pornește altceva.',
    few: '**În {banks:acc} se află câte o imagine de firmware validă, criptată cu o cheie pe care bootloader-ul acestei camere nu o cunoaște.** Imaginile sunt intacte și sumele lor de control sunt corecte, dar bootloader-ul încearcă doar {storeKey:acc} și cheia A când verifică un slot, așa că le sare și pornește altceva.',
    other:
      '**În {banks:acc} se află câte o imagine de firmware validă, criptată cu o cheie pe care bootloader-ul acestei camere nu o cunoaște.** Imaginile sunt intacte și sumele lor de control sunt corecte, dar bootloader-ul încearcă doar {storeKey:acc} și cheia A când verifică un slot, așa că le sare și pornește altceva.',
  },
  'deviceInfo.orphanIsTarget':
    'Acesta este slotul pe care îl scrie o actualizare. Aplicația care rulează pe această cameră recriptează cu acea cheie necunoscută, așa că **o scriere prin această pagină va produce încă un slot din care bootloader-ul nu poate porni** — camera va continua să ruleze din {bank:acc}. Soluția este să scrieți slotul direct, cu un programator SPI sau prin SWD/J-Link.',
  /** deviceInfo.orphanIsTarget's {bank} when the booted bank has no name. A name: a translation may give
   * it case forms ('deviceInfo.otherBank:gen'), like common:bank.*. */
  'deviceInfo.otherBank': 'celălalt slot',
  'deviceInfo.otherBank:acc': 'celălalt slot',
  'deviceInfo.otherBank:gen': 'celuilalt slot',
  'deviceInfo.otherBank:dat': 'celuilalt slot',
  'deviceInfo.otherBank:loc': 'în celălalt slot',
  'deviceInfo.otherBank:ins': 'Celălalt slot',
} satisfies Translation<'shared', 'ro'>;
