/**
 * Namespace `shared`, eesti (et), translated from the English source.
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
  'runPanel.progressLabel': '{label}: edenemine',
  'runPanel.logLabel': '{label}: logi',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… {count} varasem rida kärbitud',
    other: '… {count} varasemat rida kärbitud',
  },
  'runPanel.lineCount': { one: '{count} rida', other: '{count} rida' },

  /* Status lines several panels set. */
  'status.idle': 'Ootel.',
  'status.cancelled': 'Katkestatud.',
  'status.cancelling': 'Katkestamine …',
  'status.failedSeeLog': 'Nurjus — vaadake ülalolevat logi.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'Kaamera on kasutusel teisel vahekaardil või aknas — lõpetage või sulgege see esmalt seal.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote': 'ZIP-fail laaditakse automaatselt alla, enne kui midagi saadetakse.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Seadet pole valitud.',
  'device.disconnected': 'Seade on lahti ühendatud.',
  'device.revoked': 'Luba on tühistatud.',
  'device.unknownProduct': 'tundmatu toode',
  'device.unknownVendor': 'tundmatu tootja',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'Linuxis vajab kaamera udev-reeglit, enne kui brauser selle avada saab:\n\n{rule}\n\nSeejärel eemaldage kaamera ja ühendage uuesti. Snapi ja Flatpaki Chromiumi järgud on toorestest USB-seadmetest sageli liivakastiga eraldatud; usaldusväärne on .deb- või .rpm-järk.',
  'hint.windows':
    'Windowsis peab kaameraga olema seotud WinUSB-draiver, enne kui ükski brauser sellele ligi pääseb. Kasutage programmi Zadig (https://zadig.akeo.ie/): Options → List All Devices, valige kirje, mis kannab teie kaamera nime — näiteks „CompactPRO FF“ —, valige WinUSB ja klõpsake Replace Driver.',
  'hint.holding':
    'Kaamerat hoiab mõni teine programm või süsteemidraiver — USB-liidest saab korraga hoida ainult üks protsess. Sulgege kõik muu, mis kaameraga suhtleb, seejärel eemaldage kaamera ja ühendage uuesti.',
  'hint.recipientFallback':
    'Või seadke lugemissuvandites recipient väärtuseks „device“, mis ei vaja liidese hõivamist.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid':
    'Avage „Suvandid“ ja lugege iga vahemiku kohta väljade all olevat märkust.',
  'hint.usbTimeout':
    'Kaamera võttis päringu vastu, kuid ei vastanud. Eemaldage kaamera ja ühendage uuesti, seejärel proovige väiksemat chunk-väärtust (64 töötab kõikjal).',
  'hint.usbStalled':
    'Kaamera lükkas päringu tagasi. Tavaliselt tähendab see, et selle püsivara seda ei toeta. Leht küsib kaameralt enne lugemist, mis perekonda see kuulub, nii et korduvalt tagasi lükatud päringud tehti just sellele perekonnale, mille kaamera ise teatas. Kontrollige püsivara versiooni vahekaardil „Teave“.',
  'hint.usbNotOpen':
    'Kaamerat hoiab mõni teine programm või süsteemidraiver. Sulgege see või seadke lugemissuvandites recipient väärtuseks „device“, mis ei vaja liidese hõivamist.',
  'hint.usbTransferFailed': 'Eemaldage kaamera ja ühendage uuesti, seejärel proovige uuesti.',
  'hint.deviceMode':
    'Kaamera ei väljunud pildistusrežiimist. Eemaldage see, oodake, kuni toide täielikult kaob, ja ühendage uuesti.',
  'hint.deviceWindow':
    'Selle perekonna selektorikaart ei sobinud kaameraga. Avage vahekaardil 4.x/Nano „Suvandid“ ja vajutage „Loe kõik selektorid“, et näha, mida kaamera tegelikult pakub.',
  'hint.deviceVersionUnknown':
    'Kaamerale ei saadetud midagi, mis võiks seda muuta. Eemaldage see, ühendage uuesti, laske tal käivitumine lõpetada ja proovige uuesti; kaamerat, mis teatab oma püsivara versiooni, loetakse tavapäraselt.',
  'hint.imageMalformed': 'Fail ei ole Seeki dekrüptitud püsivara kujutis.',
  'hint.imageUnsupported': 'Seda kujutist ei saa sellisel kujul kaamera jaoks pakendada.',
  'hint.imageKeyTable':
    'Kujutises pole võtmepaari, mida selle failinimi väidab. Kasutage dekrüptitud faili täpselt sellisena, nagu tõmmis selle kirjutas, ka sama nimega.',
  'hint.flashRefused': 'Kaamerasse ei kirjutatud midagi.',
  'hint.familyUnsupported':
    'Midagi ei loetud ega kirjutatud. Iga vahekaart katab teatud püsivara versioonide vahemiku: 0.x ja 1.x kaamerad kuuluvad vahekaardile „Tõmmis ja dekrüptimine 0.x/1.x“, 4.x ja Nano kaamerad vahekaardile „Tõmmis ja dekrüptimine 4.x/Nano“. Vahekaart „Teave“ ütleb, millisele vahekaardile kaamera kuulub.',
  'hint.firmwareTooOld':
    'Ükski püsivaraperekond ei saa seda järku siin lugeda: selle püsivaral puudub lugemiskäsitleja käsule, millega see vahekaart välkmälu loeb, nii et kaamerale ei saadetud midagi, mida võiks valesti lugeda. Compacti püsivaraga 0.7.0.7 või 0.7.0.8 saab lugeda vahekaardil „Tõmmis ja dekrüptimine 0.x/1.x“. SPI-programmaatoriga või SWD/J-Linki kaudu tehtud tõmmise saab sellel lehel siiski dekrüptida, vahekaardil „Faili/pesa dekrüptimine“.',
  'hint.powerCycle':
    'Selles viisardis: eemaldage kaamera ja ühendage uuesti, vajutage „Ühenda seade“ ja valige kaamera, seejärel alustage sama sammu uuesti. Seanss on siin endiselt laaditud — midagi pole vaja jätkata.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Töötav püsivara',
  'deviceInfo.version': 'Versioon',
  'deviceInfo.family': 'Püsivaraperekond',
  'deviceInfo.build': 'Järk',
  'deviceInfo.bootloader': 'Alglaadur',
  'deviceInfo.platform': 'Platvorm',
  'deviceInfo.serial': 'Seerianumber',
  'deviceInfo.usbLink': 'USB-ühendus',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Käivituskonfiguratsioon',
  'deviceInfo.bootedFrom': 'Käivitatud pesa',
  'deviceInfo.nextStart': 'Järgmine käivitus',
  'deviceInfo.upgradeTarget': 'Uuenduse siht (kaamera enda uuendus)',
  'deviceInfo.bankAt': '{bank} aadressil {address}',
  'deviceInfo.perDeviceKey': 'Seadmevõti',
  'deviceInfo.notProgrammed': 'programmeerimata — kaamera kasutab selle asemel võtit B',
  'deviceInfo.keysTitle': 'Sellest kaamerast loetud võtmed',
  'deviceInfo.foundAt': 'Leitud aadressilt',
  'deviceInfo.flashOffset': 'välkmälu nihe {offset}',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Võti A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Võti B',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**Selle kaamera alglaadur ei tunne võtit, millega on krüptitud kehtiv püsivara kujutis {banks:ine}.** Kujutis on terve ja selle kontrollsumma on õige, kuid pesa kontrollides proovib alglaadur ainult {storeKey:par} ja võtit A, nii et see jätab selle pesa vahele ja käivitab midagi muud.',
    other:
      '**Selle kaamera alglaadur ei tunne võtit, millega on krüptitud kehtivad püsivara kujutised {banks:ine}.** Kujutised on terved ja nende kontrollsummad on õiged, kuid pesa kontrollides proovib alglaadur ainult {storeKey:par} ja võtit A, nii et see jätab need pesad vahele ja käivitab midagi muud.',
  },
  'deviceInfo.orphanIsTarget':
    'Just sellesse pesasse kirjutab uuendus. Selles kaameras töötav rakendus krüptib uuesti selle tundmatu võtmega, nii et **selle lehe kaudu kirjutamine annab järjekordse pesa, mida alglaadur käivitada ei saa** — kaamera käivitub ka edaspidi {bank:ela}. Sellest aitab mööda pesasse otse kirjutamine SPI-programmaatoriga või SWD/J-Linki kaudu.',
  /** deviceInfo.orphanIsTarget's {bank} when the booted bank has no name. A name: a translation may give
   * it case forms ('deviceInfo.otherBank:gen'), like common:bank.*. */
  'deviceInfo.otherBank': 'teine pesa',
  'deviceInfo.otherBank:gen': 'teise pesa',
  'deviceInfo.otherBank:par': 'teist pesa',
  'deviceInfo.otherBank:ill': 'teise pesasse',
  'deviceInfo.otherBank:ine': 'teises pesas',
  'deviceInfo.otherBank:ela': 'teisest pesast',
  'deviceInfo.otherBank:all': 'teisele pesale',
  'deviceInfo.otherBank:ade': 'teisel pesal',
  'deviceInfo.otherBank:abl': 'teiselt pesalt',
  'deviceInfo.otherBank:tra': 'teiseks pesaks',
  'deviceInfo.otherBank:ter': 'teise pesani',
  'deviceInfo.otherBank:ess': 'teise pesana',
  'deviceInfo.otherBank:abe': 'teise pesata',
  'deviceInfo.otherBank:com': 'teise pesaga',
} satisfies Translation<'shared', 'et'>;
