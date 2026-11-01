/**
 * Namespace `shared`, magyar (hu), translated from the English source.
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
  'runPanel.progressLabel': '{label} – előrehaladás',
  'runPanel.logLabel': '{label} – napló',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… {count} korábbi sor levágva',
    other: '… {count} korábbi sor levágva',
  },
  'runPanel.lineCount': { one: '{count} sor', other: '{count} sor' },

  /* Status lines several panels set. */
  'status.idle': 'Tétlen.',
  'status.cancelled': 'Megszakítva.',
  'status.cancelling': 'Megszakítás…',
  'status.failedSeeLog': 'Sikertelen – lásd a fenti naplót.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'A kamerát egy másik lap vagy ablak használja – előbb ott fejezze be vagy zárja be.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote': 'A zip automatikusan letöltődik, még mielőtt bármi elküldésre kerülne.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Nincs kiválasztott eszköz.',
  'device.disconnected': 'Az eszköz leválasztva.',
  'device.revoked': 'Az engedély visszavonva.',
  'device.unknownProduct': 'ismeretlen termék',
  'device.unknownVendor': 'ismeretlen gyártó',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'Linuxon a kamerához udev-szabály kell, mielőtt a böngésző megnyithatná:\n\n{rule}\n\nEzután húzza ki és dugja vissza a kamerát. A Snap és a Flatpak Chromium-csomagok gyakran el vannak zárva a nyers USB-eszközöktől; a .deb vagy az .rpm csomag a megbízható.',
  'hint.windows':
    'Windowson a WinUSB illesztőprogramot kell a kamerához rendelni, mielőtt bármely böngésző elérhetné. Használja a Zadig programot (https://zadig.akeo.ie/): Options → List All Devices, válassza a kamerájáról elnevezett bejegyzést – például „CompactPRO FF” –, válassza a WinUSB-t, és kattintson a Replace Driver gombra.',
  'hint.holding':
    'Egy másik program vagy egy rendszer-illesztőprogram foglalja a kamerát – az USB-interfészt egyszerre csak egy folyamat foglalhatja le. Lépjen ki minden mással, ami kommunikál vele, majd húzza ki és dugja vissza a kamerát.',
  'hint.recipientFallback':
    'Vagy az olvasási beállításokban állítsa a recipient beállítást „device” értékre, amelyhez nem kell lefoglalni az interfészt.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid':
    'Nyissa meg a „Beállítások” részt, és nézze meg a mezők alatti megjegyzést az egyes tartományokról.',
  'hint.usbTimeout':
    'A kamera elfogadta a kérést, de sosem válaszolt. Húzza ki és dugja vissza, majd próbálja kisebb chunk értékkel (a 64 mindenhol működik).',
  'hint.usbStalled':
    'A kamera elutasította a kérést. Ez általában azt jelenti, hogy a firmware-e nem támogatja. Az oldal bármilyen olvasás előtt megkérdezi a kamerától, melyik családba tartozik, így a folyamatosan elutasított kérések a kamera által jelentett családnak szóltak. Ellenőrizze a firmware verzióját az Info fülön.',
  'hint.usbNotOpen':
    'Egy másik program vagy egy rendszer-illesztőprogram foglalja a kamerát. Zárja be, vagy az olvasási beállításokban állítsa a recipient beállítást „device” értékre, amelyhez nem kell lefoglalni az interfészt.',
  'hint.usbTransferFailed': 'Húzza ki és dugja vissza a kamerát, majd próbálja újra.',
  'hint.deviceMode':
    'A kamera nem lépett ki a képalkotó módból. Húzza ki, várja meg, amíg teljesen kikapcsol, majd dugja vissza.',
  'hint.deviceWindow':
    'A család által használt szelektortérkép nem illett a kamerához. A 4.x/Nano fülön nyissa meg a Beállításokat, és futtassa a „Minden szelektor kiolvasása” műveletet, hogy lássa, mit kínál valójában a kamera.',
  'hint.deviceVersionUnknown':
    'Semmi olyat nem küldött, ami megváltoztathatná a kamerát. Húzza ki, dugja vissza, várja meg, amíg teljesen elindul, és próbálja újra; a firmware-verzióját jelentő kamerát a szokásos módon olvassa ki.',
  'hint.imageMalformed': 'A fájl nem visszafejtett Seek firmware-lemezkép.',
  'hint.imageUnsupported': 'Ez a lemezkép ebben a formában nem csomagolható a kamera számára.',
  'hint.imageKeyTable':
    'A lemezkép nem azt a kulcspárt hordozza, amelyet a fájlneve állít. A visszafejtett fájlt pontosan úgy használja, ahogy a kiolvasás megírta, a nevével együtt.',
  'hint.flashRefused': 'Semmi sem került a kamerára.',
  'hint.familyUnsupported':
    'Semmi sem lett kiolvasva vagy írva. Minden fül a firmware-verziók egy tartományát kezeli: a 0.x és 1.x kamerák a „0.x/1.x kiolvasása és visszafejtése”, a 4.x és Nano kamerák a „4.x/Nano kiolvasása és visszafejtése” fülre valók. Az Info fül megmondja, melyik fülre való a kamera.',
  'hint.firmwareTooOld':
    'Itt egyetlen firmware-család sem tudja kiolvasni ezt a változatot: a firmware-ében nincs olvasáskezelő ahhoz a parancshoz, amellyel ez a fül a flash memóriát olvassa, ezért semmi olyat nem küldött neki, amit félreolvashatna. A 0.7.0.7-es vagy 0.7.0.8-as Compact a „0.x/1.x kiolvasása és visszafejtése” fülön olvasható ki. Az SPI-programozóval vagy SWD/J-Linken keresztül készült memóriakép ezen az oldalon is visszafejthető, a „Fájl/slot visszafejtése” fülön.',
  'hint.powerCycle':
    'Ebben a varázslóban: húzza ki a kamerát, dugja vissza, nyomja meg az „Eszköz csatlakoztatása” gombot, válassza ki a kamerát, majd indítsa újra ugyanazt a lépést. A futtatás továbbra is be van töltve – nincs mit folytatni.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Futó firmware',
  'deviceInfo.version': 'Verzió',
  'deviceInfo.family': 'Firmware-család',
  'deviceInfo.build': 'Változat',
  'deviceInfo.bootloader': 'Bootloader',
  'deviceInfo.platform': 'Platform',
  'deviceInfo.serial': 'Sorozatszám',
  'deviceInfo.usbLink': 'USB-kapcsolat',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Indítási konfiguráció',
  'deviceInfo.bootedFrom': 'Erről indult',
  'deviceInfo.nextStart': 'Következő indítás',
  'deviceInfo.upgradeTarget': 'Frissítési cél (a saját frissítéséé)',
  'deviceInfo.bankAt': '{bank}, cím: {address}',
  'deviceInfo.perDeviceKey': 'Eszközkulcs',
  'deviceInfo.notProgrammed': 'nincs beprogramozva – a kamera a B-kulcsra tér vissza',
  'deviceInfo.keysTitle': 'A kamerából kiolvasott kulcsok',
  'deviceInfo.foundAt': 'Helye',
  'deviceInfo.flashOffset': 'flash eltolás: {offset}',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'A-kulcs',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'B-kulcs',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**Érvényes firmware-lemezkép van {banks:ine}, amelyet a kamera bootloadere számára ismeretlen kulccsal titkosítottak.** A lemezkép ép, és az ellenőrzőösszege is helyes, de a bootloader egy slot ellenőrzésekor csak {storeKey:acc} és az A-kulcsot próbálja ki, ezért átugorja, és valami mást indít el.',
    other:
      '**Érvényes firmware-lemezképek vannak {banks:ine}, amelyeket a kamera bootloadere számára ismeretlen kulccsal titkosítottak.** A lemezképek épek, és az ellenőrzőösszegük is helyes, de a bootloader egy slot ellenőrzésekor csak {storeKey:acc} és az A-kulcsot próbálja ki, ezért átugorja őket, és valami mást indít el.',
  },
  'deviceInfo.orphanIsTarget':
    'Ez az a slot, amelyet a frissítés ír. A kamerán futó alkalmazás ezzel az ismeretlen kulccsal titkosít újra, ezért **az ezen az oldalon keresztüli írás egy újabb, a bootloader által nem indítható slotot eredményez** – a kamera továbbra is {bank:ela} fog indulni. A megoldás a slot közvetlen írása SPI-programozóval vagy SWD/J-Linken keresztül.',
  /** deviceInfo.orphanIsTarget's {bank} when the booted bank has no name. A name: a translation may give
   * it case forms ('deviceInfo.otherBank:gen'), like common:bank.*. */
  'deviceInfo.otherBank': 'a másik slot',
  'deviceInfo.otherBank:nom': 'a másik slot',
  'deviceInfo.otherBank:acc': 'a másik slotot',
  'deviceInfo.otherBank:dat': 'a másik slotnak',
  'deviceInfo.otherBank:ins': 'a másik slottal',
  'deviceInfo.otherBank:ine': 'a másik slotban',
  'deviceInfo.otherBank:ill': 'a másik slotba',
  'deviceInfo.otherBank:ela': 'a másik slotból',
  'deviceInfo.otherBank:sup': 'a másik sloton',
  'deviceInfo.otherBank:sub': 'a másik slotra',
  'deviceInfo.otherBank:del': 'a másik slotról',
  'deviceInfo.otherBank:ade': 'a másik slotnál',
  'deviceInfo.otherBank:all': 'a másik slothoz',
  'deviceInfo.otherBank:abl': 'a másik slottól',
  'deviceInfo.otherBank:tra': 'a másik slottá',
  'deviceInfo.otherBank:ter': 'a másik slotig',
  'deviceInfo.otherBank:ess': 'a másik slotként',
  'deviceInfo.otherBank:cau': 'a másik slotért',
} satisfies Translation<'shared', 'hu'>;
