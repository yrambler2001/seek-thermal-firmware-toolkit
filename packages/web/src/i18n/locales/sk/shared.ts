/**
 * Namespace `shared`, slovenčina (sk), translated from the English source.
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
  'runPanel.progressLabel': 'Priebeh: {label}',
  'runPanel.logLabel': 'Protokol: {label}',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… vynechal sa {count} starší riadok',
    few: '… vynechali sa {count} staršie riadky',
    many: '… vynechalo sa {count} staršieho riadka',
    other: '… vynechalo sa {count} starších riadkov',
  },
  'runPanel.lineCount': {
    one: '{count} riadok',
    few: '{count} riadky',
    many: '{count} riadka',
    other: '{count} riadkov',
  },

  /* Status lines several panels set. */
  'status.idle': 'Nič nebeží.',
  'status.cancelled': 'Zrušené.',
  'status.cancelling': 'Ruší sa…',
  'status.failedSeeLog': 'Zlyhalo — pozrite si protokol vyššie.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'Kamera sa používa na inej karte alebo v inom okne — najprv tam prácu dokončite alebo ju zatvorte.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote': 'Súbor zip sa stiahne automaticky, ešte predtým, ako sa čokoľvek odošle.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Nie je vybrané žiadne zariadenie.',
  'device.disconnected': 'Zariadenie bolo odpojené.',
  'device.revoked': 'Povolenie bolo odvolané.',
  'device.unknownProduct': 'neznámy produkt',
  'device.unknownVendor': 'neznámy výrobca',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'V Linuxe potrebuje kamera pravidlo udev, aby ju prehliadač mohol otvoriť:\n\n{rule}\n\nPotom kameru odpojte a znova pripojte. Zostavy Chromia zo Snapu a Flatpaku bývajú v sandboxe odrezané od priameho prístupu k zariadeniam USB; spoľahlivá je zostava .deb alebo .rpm.',
  'hint.windows':
    'Windows potrebuje, aby bol ku kamere priradený ovládač WinUSB, skôr než sa k nej dostane akýkoľvek prehliadač. Použite Zadig (https://zadig.akeo.ie/): Options → List All Devices, vyberte položku pomenovanú podľa vašej kamery — napríklad „CompactPRO FF“ — zvoľte WinUSB a kliknite na Replace Driver.',
  'hint.holding':
    'Kameru drží iný program alebo systémový ovládač — rozhranie USB môže mať v jednej chvíli len jeden proces. Ukončite všetko ostatné, čo s ňou komunikuje, a potom kameru odpojte a znova pripojte.',
  'hint.recipientFallback':
    'Alebo v možnostiach čítania nastavte recipient na „device“; vtedy rozhranie nemusí byť vyhradené.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid':
    'Otvorte „Možnosti“ a pri každom poli skontrolujte poznámku s povoleným rozsahom.',
  'hint.usbTimeout':
    'Kamera požiadavku prijala, ale nikdy neodpovedala. Odpojte ju, znova ju pripojte a potom skúste menší chunk (64 je hodnota, ktorá funguje všade).',
  'hint.usbStalled':
    'Kamera požiadavku odmietla. Zvyčajne to znamená, že ju jej firmvér nepodporuje. Stránka sa kamery pred akýmkoľvek čítaním opýta, do ktorej rodiny patrí, takže požiadavky, ktoré sa ďalej odmietajú, boli vytvorené pre rodinu, ktorú nahlásila samotná kamera. Skontrolujte verziu firmvéru na karte Info.',
  'hint.usbNotOpen':
    'Kameru drží iný program alebo systémový ovládač. Zatvorte ho alebo v možnostiach čítania nastavte recipient na „device“; vtedy rozhranie nemusí byť vyhradené.',
  'hint.usbTransferFailed': 'Odpojte kameru, znova ju pripojte a skúste to znova.',
  'hint.deviceMode':
    'Kamera neopustila režim snímania. Odpojte ju, počkajte, kým sa úplne vypne, a znova ju pripojte.',
  'hint.deviceWindow':
    'Mapa selektorov, ktorú táto rodina používa, nezodpovedá kamere. Na karte 4.x/Nano otvorte Možnosti a spustite „Vypísať všetky selektory“, aby ste videli, čo kamera skutočne ponúka.',
  'hint.deviceVersionUnknown':
    'Neodoslalo sa nič, čo by mohlo kameru zmeniť. Odpojte ju, znova ju pripojte, nechajte ju dokončiť štart a skúste to znova; kamera, ktorá nahlási verziu firmvéru, sa prečíta normálne.',
  'hint.imageMalformed': 'Súbor nie je dešifrovaný obraz firmvéru Seek.',
  'hint.imageUnsupported': 'Tento obraz sa nedá pre kameru zabaliť tak, ako je.',
  'hint.imageKeyTable':
    'Obraz neobsahuje dvojicu kľúčov, ktorú uvádza jeho názov súboru. Použite dešifrovaný súbor presne tak, ako ho výpis uložil, aj s jeho názvom.',
  'hint.flashRefused': 'Do kamery sa nič nezapísalo.',
  'hint.familyUnsupported':
    'Nič sa neprečítalo ani nezapísalo. Každá karta pokrýva určitý rozsah verzií firmvéru: kamery 0.x a 1.x patria na kartu „Výpis a dešifrovanie 0.x/1.x“, kamery 4.x a Nano na kartu „Výpis a dešifrovanie 4.x/Nano“. Karta Info povie, na ktorú kartu kamera patrí.',
  'hint.firmwareTooOld':
    'Žiadna rodina firmvéru tu túto zostavu neprečíta: jej firmvér nemá obsluhu čítania pre príkaz, ktorým táto karta číta pamäť flash, takže sa jej neposlalo nič, čo by sa mohlo prečítať chybne. Compact s verziou 0.7.0.7 alebo 0.7.0.8 sa dá prečítať na karte „Výpis a dešifrovanie 0.x/1.x“. Výpis získaný programátorom SPI alebo cez SWD/J-Link sa na tejto stránke dá napriek tomu dešifrovať, v časti „Dešifrovať súbor/slot“.',
  'hint.powerCycle':
    'V tomto sprievodcovi: odpojte kameru a znova ju pripojte, stlačte „Pripojiť zariadenie“ a vyberte ju, potom spustite ten istý krok znova. Beh je tu stále načítaný — nie je na čo nadväzovať.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Bežiaci firmvér',
  'deviceInfo.version': 'Verzia',
  'deviceInfo.family': 'Rodina firmvéru',
  'deviceInfo.build': 'Zostava',
  'deviceInfo.bootloader': 'Bootloader',
  'deviceInfo.platform': 'Platforma',
  'deviceInfo.serial': 'Sériové číslo',
  'deviceInfo.usbLink': 'Pripojenie USB',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Konfigurácia štartu',
  'deviceInfo.bootedFrom': 'Spustené z',
  'deviceInfo.nextStart': 'Ďalší štart',
  'deviceInfo.upgradeTarget': 'Cieľ aktualizácie (vlastná aktualizácia kamery)',
  'deviceInfo.bankAt': '{bank} na adrese {address}',
  'deviceInfo.perDeviceKey': 'Kľúč zariadenia',
  'deviceInfo.notProgrammed': 'nenaprogramovaný — kamera použije kľúč B',
  'deviceInfo.keysTitle': 'Kľúče prečítané z tejto kamery',
  'deviceInfo.foundAt': 'Nájdené na',
  'deviceInfo.flashOffset': 'offset v pamäti flash {offset}',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Kľúč A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Kľúč B',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**{banks} obsahuje platný obraz firmvéru zašifrovaný kľúčom, ktorý bootloader tejto kamery nepozná.** Obraz je neporušený a jeho kontrolný súčet je správny, ale bootloader pri kontrole slotu skúša len {storeKey:acc} a kľúč A, takže ho preskočí a spustí niečo iné.',
    few: '**{banks} obsahujú platné obrazy firmvéru zašifrované kľúčom, ktorý bootloader tejto kamery nepozná.** Obrazy sú neporušené a ich kontrolné súčty sú správne, ale bootloader pri kontrole slotu skúša len {storeKey:acc} a kľúč A, takže ich preskočí a spustí niečo iné.',
    many: '**{banks} obsahujú platné obrazy firmvéru zašifrované kľúčom, ktorý bootloader tejto kamery nepozná.** Obrazy sú neporušené a ich kontrolné súčty sú správne, ale bootloader pri kontrole slotu skúša len {storeKey:acc} a kľúč A, takže ich preskočí a spustí niečo iné.',
    other:
      '**{banks} obsahujú platné obrazy firmvéru zašifrované kľúčom, ktorý bootloader tejto kamery nepozná.** Obrazy sú neporušené a ich kontrolné súčty sú správne, ale bootloader pri kontrole slotu skúša len {storeKey:acc} a kľúč A, takže ich preskočí a spustí niečo iné.',
  },
  'deviceInfo.orphanIsTarget':
    'To je slot, do ktorého zapisuje aktualizácia. Aplikácia bežiaca v tejto kamere šifruje znova týmto neznámym kľúčom, takže **zápis cez túto stránku vytvorí ďalší slot, z ktorého bootloader nedokáže naštartovať** — kamera bude naďalej spúšťať {bank:acc}. Obísť sa to dá priamym zápisom slotu programátorom SPI alebo cez SWD/J-Link.',
  /** deviceInfo.orphanIsTarget's {bank} when the booted bank has no name. A name: a translation may give
   * it case forms ('deviceInfo.otherBank:gen'), like common:bank.*. */
  'deviceInfo.otherBank': 'druhý slot',
  'deviceInfo.otherBank:gen': 'druhého slotu',
  'deviceInfo.otherBank:dat': 'druhému slotu',
  'deviceInfo.otherBank:acc': 'druhý slot',
  'deviceInfo.otherBank:ins': 'druhým slotom',
  'deviceInfo.otherBank:loc': 'druhom slote',
} satisfies Translation<'shared', 'sk'>;
