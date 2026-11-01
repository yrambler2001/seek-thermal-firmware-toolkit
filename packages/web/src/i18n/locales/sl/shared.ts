/**
 * Namespace `shared`, slovenščina (sl), translated from the English source.
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
  'runPanel.progressLabel': 'Napredek: {label}',
  'runPanel.logLabel': 'Dnevnik: {label}',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… {count} starejša vrstica izpuščena',
    two: '… {count} starejši vrstici izpuščeni',
    few: '… {count} starejše vrstice izpuščene',
    other: '… {count} starejših vrstic izpuščenih',
  },
  'runPanel.lineCount': {
    one: '{count} vrstica',
    two: '{count} vrstici',
    few: '{count} vrstice',
    other: '{count} vrstic',
  },

  /* Status lines several panels set. */
  'status.idle': 'V mirovanju.',
  'status.cancelled': 'Preklicano.',
  'status.cancelling': 'Preklicevanje …',
  'status.failedSeeLog': 'Ni uspelo — glejte dnevnik zgoraj.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'Kamera je v uporabi v drugem zavihku ali oknu — najprej tam končajte ali ga zaprite.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote': 'Datoteka zip se prenese samodejno, preden se karkoli pošlje.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Nobena naprava ni izbrana.',
  'device.disconnected': 'Naprava je odklopljena.',
  'device.revoked': 'Dovoljenje je preklicano.',
  'device.unknownProduct': 'neznan izdelek',
  'device.unknownVendor': 'neznan proizvajalec',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'V Linuxu kamera potrebuje pravilo udev, preden jo lahko brskalnik odpre:\n\n{rule}\n\nNato kamero odklopite in znova priklopite. Različice Chromiuma iz paketov Snap in Flatpak so pogosto v peskovniku brez dostopa do surovih naprav USB; zanesljiva je različica .deb ali .rpm.',
  'hint.windows':
    'Windows potrebuje gonilnik WinUSB, vezan na kamero, preden jo lahko doseže kateri koli brskalnik. Uporabite Zadig (https://zadig.akeo.ie/): Options → List All Devices, izberite vnos, poimenovan po vaši kameri — na primer „CompactPRO FF“ — izberite WinUSB in kliknite Replace Driver.',
  'hint.holding':
    'Kamero zaseda drug program ali sistemski gonilnik — vmesnik USB lahko hkrati zaseda le en proces. Zaprite vse drugo, kar komunicira z njo, nato kamero odklopite in znova priklopite.',
  'hint.recipientFallback':
    'Lahko pa v možnostih branja nastavite recipient na „device“, kar ne zahteva zasedbe vmesnika.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid': 'Odprite „Možnosti“ in preverite opombo pod polji za vsak obseg.',
  'hint.usbTimeout':
    'Kamera je sprejela zahtevo, odgovora pa ni bilo. Odklopite jo in znova priklopite, nato poskusite z manjšo vrednostjo chunk (64 je vrednost, ki deluje povsod).',
  'hint.usbStalled':
    'Kamera je zahtevo zavrnila. To običajno pomeni, da je njena vdelana programska oprema ne podpira. Stran kamero vpraša, katere družine je, preden karkoli prebere, zato so bile zahteve, ki so vedno znova zavrnjene, narejene za družino, ki jo je sporočila kamera sama. Preverite različico vdelane programske opreme na zavihku Informacije.',
  'hint.usbNotOpen':
    'Kamero zaseda drug program ali sistemski gonilnik. Zaprite ga ali v možnostih branja nastavite recipient na „device“, kar ne zahteva zasedbe vmesnika.',
  'hint.usbTransferFailed': 'Kamero odklopite in znova priklopite, nato poskusite znova.',
  'hint.deviceMode':
    'Kamera ni hotela zapustiti načina zajemanja slike. Odklopite jo, počakajte, da se popolnoma izklopi, in jo znova priklopite.',
  'hint.deviceWindow':
    'Zemljevid selektorjev, ki ga uporablja ta družina, se ne ujema s kamero. Na zavihku 4.x/Nano odprite Možnosti in zaženite „Izpiši vse selektorje“, da vidite, kaj kamera dejansko ponuja.',
  'hint.deviceVersionUnknown':
    'Nič, kar bi lahko spremenilo kamero, ni bilo poslano. Odklopite jo, znova priklopite, počakajte, da se zažene do konca, in poskusite znova; kamera, ki sporoči različico vdelane programske opreme, se prebere normalno.',
  'hint.imageMalformed': 'Datoteka ni dešifrirana slika vdelane programske opreme Seek.',
  'hint.imageUnsupported': 'Te slike ni mogoče pripraviti za kamero takšne, kot je.',
  'hint.imageKeyTable':
    'Slika ne vsebuje para ključev, ki ga navaja ime datoteke. Uporabite dešifrirano datoteko natanko tako, kot jo je zapisal izpis, vključno z imenom.',
  'hint.flashRefused': 'V kamero ni bilo zapisano nič.',
  'hint.familyUnsupported':
    'Nič ni bilo prebrano ali zapisano. Vsak zavihek pokriva svoj obseg različic vdelane programske opreme: kamere 0.x in 1.x sodijo na zavihek „Izpis in dešifriranje 0.x/1.x“, kamere 4.x in Nano na „Izpis in dešifriranje 4.x/Nano“. Zavihek Informacije pove, na kateri zavihek sodi kamera.',
  'hint.firmwareTooOld':
    'Nobena družina vdelane programske opreme tukaj ne more prebrati te izdaje: njena vdelana programska oprema nima obdelovalnika za ukaz, s katerim ta zavihek bere bliskovni pomnilnik, zato ji ni bilo poslano nič, kar bi se lahko napačno prebralo. Compact z 0.7.0.7 ali 0.7.0.8 lahko preberete na zavihku „Izpis in dešifriranje 0.x/1.x“. Izpis, narejen s programatorjem SPI ali prek SWD/J-Link, lahko na tej strani še vedno dešifrirate pod „Dešifriranje datoteke/reže“.',
  'hint.powerCycle':
    'V tem čarovniku: kamero odklopite in znova priklopite, pritisnite „Poveži napravo“ in jo izberite, nato znova zaženite isti korak. Izvedba je tukaj še vedno naložena — ničesar ni treba nadaljevati.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Delujoča vdelana programska oprema',
  'deviceInfo.version': 'Različica',
  'deviceInfo.family': 'Družina vdelane programske opreme',
  'deviceInfo.build': 'Izdaja',
  'deviceInfo.bootloader': 'Zagonski nalagalnik',
  'deviceInfo.platform': 'Platforma',
  'deviceInfo.serial': 'Serijska številka',
  'deviceInfo.usbLink': 'Povezava USB',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Zagonska konfiguracija',
  'deviceInfo.bootedFrom': 'Zagnano iz',
  'deviceInfo.nextStart': 'Naslednji zagon',
  'deviceInfo.upgradeTarget': 'Cilj lastne nadgradnje kamere',
  'deviceInfo.bankAt': '{bank} na naslovu {address}',
  'deviceInfo.perDeviceKey': 'Ključ naprave',
  'deviceInfo.notProgrammed': 'ni programiran — kamera namesto njega uporabi ključ B',
  'deviceInfo.keysTitle': 'Ključi, prebrani iz te kamere',
  'deviceInfo.foundAt': 'Najdeno na',
  'deviceInfo.flashOffset': 'odmik v bliskovnem pomnilniku {offset}',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Ključ A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Ključ B',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**Veljavno sliko vdelane programske opreme, šifrirano s ključem, ki ga zagonski nalagalnik te kamere ne pozna, vsebuje {banks}.** Slika je nepoškodovana in njena kontrolna vsota je pravilna, vendar zagonski nalagalnik pri preverjanju reže poskusi le {storeKey:acc} in ključ A, zato jo preskoči in zažene nekaj drugega.',
    two: '**Veljavno sliko vdelane programske opreme, šifrirano s ključem, ki ga zagonski nalagalnik te kamere ne pozna, vsebujeta {banks}.** Sliki sta nepoškodovani in njuni kontrolni vsoti sta pravilni, vendar zagonski nalagalnik pri preverjanju reže poskusi le {storeKey:acc} in ključ A, zato ju preskoči in zažene nekaj drugega.',
    few: '**Veljavno sliko vdelane programske opreme, šifrirano s ključem, ki ga zagonski nalagalnik te kamere ne pozna, vsebujejo {banks}.** Slike so nepoškodovane in njihove kontrolne vsote so pravilne, vendar zagonski nalagalnik pri preverjanju reže poskusi le {storeKey:acc} in ključ A, zato jih preskoči in zažene nekaj drugega.',
    other:
      '**Veljavno sliko vdelane programske opreme, šifrirano s ključem, ki ga zagonski nalagalnik te kamere ne pozna, vsebujejo {banks}.** Slike so nepoškodovane in njihove kontrolne vsote so pravilne, vendar zagonski nalagalnik pri preverjanju reže poskusi le {storeKey:acc} in ključ A, zato jih preskoči in zažene nekaj drugega.',
  },
  'deviceInfo.orphanIsTarget':
    'To je reža, v katero piše nadgradnja. Aplikacija, ki teče v tej kameri, znova šifrira s tem neznanim ključem, zato **bo zapis prek te strani ustvaril še eno režo, ki je zagonski nalagalnik ne more zagnati** — kamera se bo še naprej zaganjala iz {bank:gen}. Rešitev je neposreden zapis v režo s programatorjem SPI ali prek SWD/J-Link.',
  /** deviceInfo.orphanIsTarget's {bank} when the booted bank has no name. A name: a translation may give
   * it case forms ('deviceInfo.otherBank:gen'), like common:bank.*. */
  'deviceInfo.otherBank': 'druga reža',
  'deviceInfo.otherBank:nom': 'druga reža',
  'deviceInfo.otherBank:gen': 'druge reže',
  'deviceInfo.otherBank:dat': 'drugi reži',
  'deviceInfo.otherBank:acc': 'drugo režo',
  'deviceInfo.otherBank:ins': 'drugo režo',
  'deviceInfo.otherBank:loc': 'drugi reži',
} satisfies Translation<'shared', 'sl'>;
