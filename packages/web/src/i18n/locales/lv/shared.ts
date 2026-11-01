/**
 * Namespace `shared`, latviešu (lv), translated from the English source.
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
  'runPanel.progressLabel': '{label}: izpilde',
  'runPanel.logLabel': '{label}: žurnāls',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    zero: '… izlaists {count} agrāku rindu',
    one: '… izlaista {count} agrāka rinda',
    other: '… izlaistas {count} agrākas rindas',
  },
  'runPanel.lineCount': { zero: '{count} rindu', one: '{count} rinda', other: '{count} rindas' },

  /* Status lines several panels set. */
  'status.idle': 'Dīkstāvē.',
  'status.cancelled': 'Atcelts.',
  'status.cancelling': 'Atceļ …',
  'status.failedSeeLog': 'Neizdevās — skatiet žurnālu augstāk.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'Kamera tiek izmantota citā cilnē vai logā — vispirms pabeidziet vai aizveriet to tur.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote': 'ZIP fails tiek lejupielādēts automātiski, pirms kaut kas tiek nosūtīts.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Ierīce nav izvēlēta.',
  'device.disconnected': 'Ierīce atvienota.',
  'device.revoked': 'Atļauja atsaukta.',
  'device.unknownProduct': 'nezināms produkts',
  'device.unknownVendor': 'nezināms ražotājs',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'Operētājsistēmā Linux kamerai ir vajadzīgs udev noteikums, pirms pārlūkprogramma to var atvērt:\n\n{rule}\n\nPēc tam atvienojiet kameru un pievienojiet atkal. Snap un Flatpak Chromium būvējumi bieži ir smilškastē nošķirti no tiešas piekļuves USB ierīcēm; uzticams ir .deb vai .rpm būvējums.',
  'hint.windows':
    'Operētājsistēmā Windows kamerai ir jāpiesaista WinUSB draiveris, pirms jebkura pārlūkprogramma tai var piekļūt. Izmantojiet Zadig (https://zadig.akeo.ie/): Options → List All Devices, izvēlieties ierakstu, kas nosaukts jūsu kameras vārdā, — piemēram, „CompactPRO FF“ —, izvēlieties WinUSB un noklikšķiniet uz Replace Driver.',
  'hint.holding':
    'Kameru tur cita programma vai sistēmas draiveris — USB saskarni vienlaikus var turēt tikai viens process. Aizveriet visu pārējo, kas ar to sazinās, pēc tam atvienojiet kameru un pievienojiet atkal.',
  'hint.recipientFallback':
    'Vai arī nolasīšanas opcijās iestatiet recipient uz „device“; tad saskarne nav jāpārņem.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid':
    'Atveriet „Opcijas“ un izlasiet piezīmi zem laukiem par katra lauka diapazonu.',
  'hint.usbTimeout':
    'Kamera pieņēma pieprasījumu, bet tā arī neatbildēja. Atvienojiet to un pievienojiet atkal, pēc tam mēģiniet mazāku chunk vērtību (64 der visur).',
  'hint.usbStalled':
    'Kamera noraidīja pieprasījumu. Parasti tas nozīmē, ka tās aparātprogrammatūra to neatbalsta. Pirms kaut ko nolasīt, lapa pajautā kamerai, kurai saimei tā pieder, tāpēc pieprasījumi, kas tiek atkārtoti noraidīti, bija paredzēti tieši tai saimei, ko kamera nosauca pati. Pārbaudiet aparātprogrammatūras versiju cilnē „Informācija“.',
  'hint.usbNotOpen':
    'Kameru tur cita programma vai sistēmas draiveris. Aizveriet to vai nolasīšanas opcijās iestatiet recipient uz „device“; tad saskarne nav jāpārņem.',
  'hint.usbTransferFailed': 'Atvienojiet kameru un pievienojiet atkal, pēc tam mēģiniet vēlreiz.',
  'hint.deviceMode':
    'Kamera neizgāja no attēlveidošanas režīma. Atvienojiet to, pagaidiet, līdz tā pilnībā izslēdzas, un pievienojiet atkal.',
  'hint.deviceWindow':
    'Šīs saimes selektoru karte neatbilda kamerai. Cilnē 4.x/Nano atveriet „Opcijas“ un palaidiet „Nolasīt visus selektorus“, lai redzētu, ko kamera patiesībā piedāvā.',
  'hint.deviceVersionUnknown':
    'Nekas, kas varētu mainīt kameru, netika nosūtīts. Atvienojiet to, pievienojiet atkal, ļaujiet tai pilnībā startēt un mēģiniet vēlreiz; kamera, kas paziņo savu aparātprogrammatūras versiju, tiek nolasīta kā parasti.',
  'hint.imageMalformed': 'Fails nav atšifrēts Seek aparātprogrammatūras attēls.',
  'hint.imageUnsupported': 'Šo attēlu nevar sagatavot kamerai tādu, kāds tas ir.',
  'hint.imageKeyTable':
    'Attēlā nav tā atslēgu pāra, kas norādīts faila nosaukumā. Izmantojiet atšifrēto failu tieši tādu, kādu to ierakstīja nolasīšana, arī ar to pašu nosaukumu.',
  'hint.flashRefused': 'Kamerā nekas netika ierakstīts.',
  'hint.familyUnsupported':
    'Nekas netika ne nolasīts, ne ierakstīts. Katra cilne aptver savu aparātprogrammatūras versiju diapazonu: 0.x un 1.x kamerām ir „Nolasīt un atšifrēt 0.x/1.x“, 4.x un Nano kamerām — „Nolasīt un atšifrēt 4.x/Nano“. Cilne „Informācija“ pasaka, kura cilne der kamerai.',
  'hint.firmwareTooOld':
    'Neviena aparātprogrammatūras saime šeit nevar nolasīt šo būvējumu: tā aparātprogrammatūrai nav lasīšanas apstrādātāja komandai, ar kuru šī cilne lasa zibatmiņu, tāpēc tai netika nosūtīts nekas, ko varētu nolasīt kļūdaini. Compact ar 0.7.0.7 vai 0.7.0.8 var nolasīt cilnē „Nolasīt un atšifrēt 0.x/1.x“. Izmeti, kas iegūta ar SPI programmatoru vai pa SWD/J-Link, šajā lapā joprojām var atšifrēt cilnē „Atšifrēt failu/slotu“.',
  'hint.powerCycle':
    'Šajā vednī: atvienojiet kameru un pievienojiet atkal, nospiediet „Pievienot ierīci“ un izvēlieties to, pēc tam sāciet to pašu soli vēlreiz. Sesija joprojām ir ielādēta šeit — nekas nav jāatsāk.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Darbojošā aparātprogrammatūra',
  'deviceInfo.version': 'Versija',
  'deviceInfo.family': 'Aparātprogrammatūras saime',
  'deviceInfo.build': 'Būvējums',
  'deviceInfo.bootloader': 'Sāknētājs',
  'deviceInfo.platform': 'Platforma',
  'deviceInfo.serial': 'Sērijas numurs',
  'deviceInfo.usbLink': 'USB savienojums',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Sāknēšanas konfigurācija',
  'deviceInfo.bootedFrom': 'Sāknēta no',
  'deviceInfo.nextStart': 'Nākamā sāknēšana',
  'deviceInfo.upgradeTarget': 'Jaunināšanas mērķis (kameras pašas jaunināšanai)',
  'deviceInfo.bankAt': '{bank} adresē {address}',
  'deviceInfo.perDeviceKey': 'Ierīces atslēga',
  'deviceInfo.notProgrammed': 'nav ieprogrammēta — kamera izmanto atslēgu B',
  'deviceInfo.keysTitle': 'No šīs kameras nolasītās atslēgas',
  'deviceInfo.foundAt': 'Atrašanās vieta',
  'deviceInfo.flashOffset': 'zibatmiņas nobīde {offset}',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Atslēga A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Atslēga B',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    zero: '**Aparātprogrammatūras attēli {banks:loc} ir derīgi, bet šifrēti ar atslēgu, ko šīs kameras sāknētājs nezina.** Attēli ir neskarti un to kontrolsummas ir pareizas, taču sāknētājs, pārbaudot slotu, mēģina tikai {storeKey:acc} un atslēgu A, tāpēc tos izlaiž un sāknē ko citu.',
    one: '**Aparātprogrammatūras attēls {banks:loc} ir derīgs, bet šifrēts ar atslēgu, ko šīs kameras sāknētājs nezina.** Attēls ir neskarts un tā kontrolsumma ir pareiza, taču sāknētājs, pārbaudot slotu, mēģina tikai {storeKey:acc} un atslēgu A, tāpēc to izlaiž un sāknē ko citu.',
    other:
      '**Aparātprogrammatūras attēli {banks:loc} ir derīgi, bet šifrēti ar atslēgu, ko šīs kameras sāknētājs nezina.** Attēli ir neskarti un to kontrolsummas ir pareizas, taču sāknētājs, pārbaudot slotu, mēģina tikai {storeKey:acc} un atslēgu A, tāpēc tos izlaiž un sāknē ko citu.',
  },
  'deviceInfo.orphanIsTarget':
    'Tieši šo slotu ieraksta jaunināšana. Šajā kamerā strādājošā lietotne šifrē atkārtoti ar šo nezināmo atslēgu, tāpēc **ierakstīšana caur šo lapu radīs vēl vienu slotu, ko sāknētājs nevar sāknēt** — kamera turpinās strādāt no {bank:gen}. Risinājums ir ierakstīt slotu tieši ar SPI programmatoru vai pa SWD/J-Link.',
  /** deviceInfo.orphanIsTarget's {bank} when the booted bank has no name. A name: a translation may give
   * it case forms ('deviceInfo.otherBank:gen'), like common:bank.*. */
  'deviceInfo.otherBank': 'otrs slots',
  'deviceInfo.otherBank:gen': 'otra slota',
  'deviceInfo.otherBank:dat': 'otram slotam',
  'deviceInfo.otherBank:acc': 'otru slotu',
  'deviceInfo.otherBank:ins': 'ar otru slotu',
  'deviceInfo.otherBank:loc': 'otrā slotā',
} satisfies Translation<'shared', 'lv'>;
