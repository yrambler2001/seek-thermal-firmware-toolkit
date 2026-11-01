/**
 * Namespace `shared`, lietuvių (lt), translated from the English source.
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
  'runPanel.progressLabel': '{label}: eiga',
  'runPanel.logLabel': '{label}: žurnalas',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… pašalinta {count} ankstesnė eilutė',
    few: '… pašalintos {count} ankstesnės eilutės',
    many: '… pašalinta {count} ankstesnės eilutės',
    other: '… pašalinta {count} ankstesnių eilučių',
  },
  'runPanel.lineCount': {
    one: '{count} eilutė',
    few: '{count} eilutės',
    many: '{count} eilutės',
    other: '{count} eilučių',
  },

  /* Status lines several panels set. */
  'status.idle': 'Laukiama.',
  'status.cancelled': 'Atšaukta.',
  'status.cancelling': 'Atšaukiama…',
  'status.failedSeeLog': 'Nepavyko — žr. žurnalą aukščiau.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'Kamera naudojama kitame skirtuke ar lange — pirmiausia ten baikite darbą arba jį uždarykite.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote': 'ZIP failas atsisiunčiamas automatiškai, prieš ką nors išsiunčiant.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Įrenginys nepasirinktas.',
  'device.disconnected': 'Įrenginys atjungtas.',
  'device.revoked': 'Leidimas atšauktas.',
  'device.unknownProduct': 'nežinomas gaminys',
  'device.unknownVendor': 'nežinomas gamintojas',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'Linux sistemoje kamerai reikia udev taisyklės, kad naršyklė galėtų ją atidaryti:\n\n{rule}\n\nTada atjunkite ir vėl prijunkite kamerą. Snap ir Flatpak Chromium versijos dažnai izoliuotos nuo tiesioginės prieigos prie USB įrenginių; patikima yra .deb arba .rpm versija.',
  'hint.windows':
    'Windows sistemoje prie kameros turi būti priskirta WinUSB tvarkyklė, kitaip jos nepasieks jokia naršyklė. Naudokite Zadig (https://zadig.akeo.ie/): Options → List All Devices, pasirinkite įrašą, pavadintą jūsų kameros vardu — pavyzdžiui, „CompactPRO FF“, — pasirinkite WinUSB ir spustelėkite Replace Driver.',
  'hint.holding':
    'Kamerą laiko užėmusi kita programa arba sistemos tvarkyklė — USB sąsają vienu metu gali naudoti tik vienas procesas. Išjunkite visa kita, kas su ja bendrauja, tada atjunkite ir vėl prijunkite kamerą.',
  'hint.recipientFallback':
    'Arba skaitymo parinktyse nustatykite recipient į „device“; tada sąsajos užimti nereikia.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid':
    'Atverkite „Parinktys“ ir perskaitykite pastabą po laukais: joje nurodyti leistini intervalai.',
  'hint.usbTimeout':
    'Kamera priėmė užklausą, bet taip ir neatsakė. Atjunkite ją ir vėl prijunkite, tada bandykite mažesnį chunk (64 veikia visur).',
  'hint.usbStalled':
    'Kamera atmetė užklausą. Paprastai tai reiškia, kad jos mikroprograma šios užklausos nepalaiko. Prieš ką nors skaitydamas puslapis paklausia kameros, kuriai šeimai ji priklauso, todėl nuolat atmetamos užklausos buvo skirtos tai šeimai, kurią nurodė pati kamera. Patikrinkite mikroprogramos versiją skirtuke „Informacija“.',
  'hint.usbNotOpen':
    'Kamerą laiko užėmusi kita programa arba sistemos tvarkyklė. Uždarykite ją arba skaitymo parinktyse nustatykite recipient į „device“; tada sąsajos užimti nereikia.',
  'hint.usbTransferFailed': 'Atjunkite ir vėl prijunkite kamerą, tada bandykite dar kartą.',
  'hint.deviceMode':
    'Kamera neišėjo iš vaizdavimo režimo. Atjunkite ją, palaukite, kol ji visiškai išsijungs, ir vėl prijunkite.',
  'hint.deviceWindow':
    'Šios šeimos selektorių žemėlapis neatitiko kameros. Skirtuke 4.x/Nano atverkite „Parinktys“ ir paleiskite „Nuskaityti visus selektorius“, kad pamatytumėte, ką kamera iš tikrųjų pateikia.',
  'hint.deviceVersionUnknown':
    'Nieko, kas galėtų pakeisti kamerą, nebuvo išsiųsta. Atjunkite ją, vėl prijunkite, leiskite jai iki galo pasileisti ir bandykite dar kartą; kamera, kuri nurodo savo mikroprogramos versiją, nuskaitoma įprastai.',
  'hint.imageMalformed': 'Failas nėra iššifruotas Seek mikroprogramos atvaizdas.',
  'hint.imageUnsupported': 'Šio atvaizdo tokio, koks jis yra, kamerai paruošti negalima.',
  'hint.imageKeyTable':
    'Atvaizde nėra raktų poros, kurią nurodo jo failo pavadinimas. Naudokite iššifruotą failą lygiai tokį, kokį įrašė nuskaitymas, ir su tuo pačiu pavadinimu.',
  'hint.flashRefused': 'Į kamerą nieko neįrašyta.',
  'hint.familyUnsupported':
    'Nieko nenuskaityta ir neįrašyta. Kiekvienas skirtukas skirtas tam tikram mikroprogramos versijų intervalui: 0.x ir 1.x kameros — skirtukui „Nuskaityti ir iššifruoti 0.x/1.x“, 4.x ir Nano kameros — skirtukui „Nuskaityti ir iššifruoti 4.x/Nano“. Skirtukas „Informacija“ nurodo, kuriam skirtukui priklauso kamera.',
  'hint.firmwareTooOld':
    'Jokia mikroprogramos šeima čia negali nuskaityti šio leidimo: jo mikroprograma neapdoroja komandos, kuria šis skirtukas skaito flash atmintį, todėl jai nebuvo išsiųsta nieko, kas galėtų būti perskaityta klaidingai. Compact su 0.7.0.7 arba 0.7.0.8 galima nuskaityti skirtuke „Nuskaityti ir iššifruoti 0.x/1.x“. Išklotinę, padarytą SPI programatoriumi arba per SWD/J-Link, vis tiek galima iššifruoti šiame puslapyje, skirtuke „Iššifruoti failą/lizdą“.',
  'hint.powerCycle':
    'Šiame vedlyje: atjunkite kamerą ir vėl ją prijunkite, spustelėkite „Prijungti įrenginį“ ir ją pasirinkite, tada vėl pradėkite tą patį žingsnį. Seansas vis dar įkeltas čia — nieko tęsti nereikia.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Veikianti mikroprograma',
  'deviceInfo.version': 'Versija',
  'deviceInfo.family': 'Mikroprogramos šeima',
  'deviceInfo.build': 'Leidimas',
  'deviceInfo.bootloader': 'Paleidyklė',
  'deviceInfo.platform': 'Platforma',
  'deviceInfo.serial': 'Serijos numeris',
  'deviceInfo.usbLink': 'USB ryšys',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Paleidimo konfigūracija',
  'deviceInfo.bootedFrom': 'Paleista iš',
  'deviceInfo.nextStart': 'Kitas paleidimas',
  'deviceInfo.upgradeTarget': 'Atnaujinimo tikslas (pačios kameros atnaujinimas)',
  'deviceInfo.bankAt': '{bank} adresu {address}',
  'deviceInfo.perDeviceKey': 'Įrenginio raktas',
  'deviceInfo.notProgrammed': 'neužprogramuotas — kamera naudoja raktą B',
  'deviceInfo.keysTitle': 'Iš šios kameros nuskaityti raktai',
  'deviceInfo.foundAt': 'Rasta adresu',
  'deviceInfo.flashOffset': 'flash poslinkis {offset}',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Raktas A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Raktas B',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**Galiojantis mikroprogramos atvaizdas, užšifruotas šios kameros paleidyklei nežinomu raktu, yra {banks:loc}.** Atvaizdas nepažeistas ir jo kontrolinė suma teisinga, tačiau tikrindama lizdą paleidyklė bando tik {storeKey:acc} ir raktą A, todėl jį praleidžia ir paleidžia ką nors kita.',
    few: '**Galiojantys mikroprogramos atvaizdai, užšifruoti šios kameros paleidyklei nežinomu raktu, yra {banks:loc}.** Atvaizdai nepažeisti ir jų kontrolinės sumos teisingos, tačiau tikrindama lizdą paleidyklė bando tik {storeKey:acc} ir raktą A, todėl juos praleidžia ir paleidžia ką nors kita.',
    many: '**Galiojantys mikroprogramos atvaizdai, užšifruoti šios kameros paleidyklei nežinomu raktu, yra {banks:loc}.** Atvaizdai nepažeisti ir jų kontrolinės sumos teisingos, tačiau tikrindama lizdą paleidyklė bando tik {storeKey:acc} ir raktą A, todėl juos praleidžia ir paleidžia ką nors kita.',
    other:
      '**Galiojantys mikroprogramos atvaizdai, užšifruoti šios kameros paleidyklei nežinomu raktu, yra {banks:loc}.** Atvaizdai nepažeisti ir jų kontrolinės sumos teisingos, tačiau tikrindama lizdą paleidyklė bando tik {storeKey:acc} ir raktą A, todėl juos praleidžia ir paleidžia ką nors kita.',
  },
  'deviceInfo.orphanIsTarget':
    'Būtent į šį lizdą rašo atnaujinimas. Šioje kameroje veikianti programa iš naujo užšifruoja tuo nežinomu raktu, todėl **įrašius per šį puslapį atsiras dar vienas lizdas, kurio paleidyklė negali paleisti**, o kamera ir toliau veiks iš {bank:gen}. Tai apeiti galima įrašius lizdą tiesiogiai SPI programatoriumi arba per SWD/J-Link.',
  /** deviceInfo.orphanIsTarget's {bank} when the booted bank has no name. A name: a translation may give
   * it case forms ('deviceInfo.otherBank:gen'), like common:bank.*. */
  'deviceInfo.otherBank': 'kitas lizdas',
  'deviceInfo.otherBank:nom': 'kitas lizdas',
  'deviceInfo.otherBank:gen': 'kito lizdo',
  'deviceInfo.otherBank:dat': 'kitam lizdui',
  'deviceInfo.otherBank:acc': 'kitą lizdą',
  'deviceInfo.otherBank:ins': 'kitu lizdu',
  'deviceInfo.otherBank:loc': 'kitame lizde',
} satisfies Translation<'shared', 'lt'>;
