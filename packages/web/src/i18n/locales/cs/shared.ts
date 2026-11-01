/**
 * Namespace `shared`, čeština (cs), translated from the English source.
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
  'runPanel.percent': '{value} %',
  'runPanel.progressLabel': 'Průběh: {label}',
  'runPanel.logLabel': 'Protokol: {label}',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… vynechán {count} starší řádek',
    few: '… vynechány {count} starší řádky',
    many: '… vynecháno {count} staršího řádku',
    other: '… vynecháno {count} starších řádků',
  },
  'runPanel.lineCount': {
    one: '{count} řádek',
    few: '{count} řádky',
    many: '{count} řádku',
    other: '{count} řádků',
  },

  /* Status lines several panels set. */
  'status.idle': 'Nic neběží.',
  'status.cancelled': 'Zrušeno.',
  'status.cancelling': 'Ruší se …',
  'status.failedSeeLog': 'Selhalo — viz protokol výše.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'Kamera se používá na jiné kartě nebo v jiném okně — nejdřív tam práci dokončete nebo ji zavřete.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote': 'Soubor zip se stáhne automaticky, ještě než se cokoli odešle.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Není vybráno žádné zařízení.',
  'device.disconnected': 'Zařízení bylo odpojeno.',
  'device.revoked': 'Oprávnění bylo odvoláno.',
  'device.unknownProduct': 'neznámý produkt',
  'device.unknownVendor': 'neznámý výrobce',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'V Linuxu potřebuje kamera pravidlo udev, než ji prohlížeč dokáže otevřít:\n\n{rule}\n\nPotom kameru odpojte a znovu připojte. Sestavení Chromia ze Snapu a Flatpaku bývají v sandboxu odříznutá od přímého přístupu k zařízením USB; spolehlivé je sestavení .deb nebo .rpm.',
  'hint.windows':
    'Windows potřebují, aby byl ke kameře přiřazen ovladač WinUSB, než se k ní dostane jakýkoli prohlížeč. Použijte Zadig (https://zadig.akeo.ie/): Options → List All Devices, vyberte položku pojmenovanou podle vaší kamery — například „CompactPRO FF“ — zvolte WinUSB a klikněte na Replace Driver.',
  'hint.holding':
    'Kameru drží jiný program nebo systémový ovladač — rozhraní USB může mít v jednu chvíli jen jeden proces. Ukončete vše ostatní, co s ní komunikuje, a potom kameru odpojte a znovu připojte.',
  'hint.recipientFallback':
    'Nebo v možnostech čtení nastavte recipient na „device“; pak rozhraní nemusí být zabrané.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid':
    'Otevřete „Možnosti“ a u každého pole zkontrolujte poznámku s povoleným rozsahem.',
  'hint.usbTimeout':
    'Kamera požadavek přijala, ale nikdy neodpověděla. Odpojte ji, znovu ji připojte a pak zkuste menší chunk (64 je hodnota, která funguje všude).',
  'hint.usbStalled':
    'Kamera požadavek odmítla. Obvykle to znamená, že ho její firmware nepodporuje. Stránka se kamery před jakýmkoli čtením zeptá, do které rodiny patří, takže požadavky, které jsou dál odmítány, byly vytvořeny pro rodinu, kterou nahlásila sama kamera. Zkontrolujte verzi firmwaru na kartě Info.',
  'hint.usbNotOpen':
    'Kameru drží jiný program nebo systémový ovladač. Zavřete ho, nebo v možnostech čtení nastavte recipient na „device“; pak rozhraní nemusí být zabrané.',
  'hint.usbTransferFailed': 'Odpojte kameru, znovu ji připojte a zkuste to znovu.',
  'hint.deviceMode':
    'Kamera neopustila režim snímání. Odpojte ji, počkejte, až se úplně vypne, a znovu ji připojte.',
  'hint.deviceWindow':
    'Mapa selektorů, kterou tato rodina používá, kameře neodpovídá. Na kartě 4.x/Nano otevřete Možnosti a spusťte „Vyčíst všechny selektory“, abyste viděli, co kamera skutečně nabízí.',
  'hint.deviceVersionUnknown':
    'Nebylo odesláno nic, co by mohlo kameru změnit. Odpojte ji, znovu ji připojte, nechte ji dokončit start a zkuste to znovu; kamera, která nahlásí verzi firmwaru, se přečte normálně.',
  'hint.imageMalformed': 'Soubor není dešifrovaný obraz firmwaru Seek.',
  'hint.imageUnsupported': 'Tento obraz nelze pro kameru zabalit tak, jak je.',
  'hint.imageKeyTable':
    'Obraz neobsahuje dvojici klíčů, kterou uvádí jeho název souboru. Použijte dešifrovaný soubor přesně tak, jak ho výpis uložil, i s jeho názvem.',
  'hint.flashRefused': 'Do kamery se nic nezapsalo.',
  'hint.familyUnsupported':
    'Nic se nepřečetlo ani nezapsalo. Každá karta pokrývá určitý rozsah verzí firmwaru: kamery 0.x a 1.x patří na „Výpis a dešifrování 0.x/1.x“, kamery 4.x a Nano na „Výpis a dešifrování 4.x/Nano“. Karta Info řekne, na kterou kartu kamera patří.',
  'hint.firmwareTooOld':
    'Žádná rodina firmwaru zde toto sestavení nepřečte: jeho firmware nemá obsluhu čtení pro příkaz, kterým tato karta čte paměť flash, takže mu nebylo posláno nic, co by se mohlo přečíst chybně. Compact s verzí 0.7.0.7 nebo 0.7.0.8 lze přečíst na kartě „Výpis a dešifrování 0.x/1.x“. Výpis pořízený programátorem SPI nebo přes SWD/J-Link lze na této stránce přesto dešifrovat, v části „Dešifrovat soubor/slot“.',
  'hint.powerCycle':
    'V tomto průvodci: odpojte kameru a znovu ji připojte, stiskněte „Připojit zařízení“ a vyberte ji, potom spusťte stejný krok znovu. Běh je tu stále načtený — není na co navazovat.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Běžící firmware',
  'deviceInfo.version': 'Verze',
  'deviceInfo.family': 'Rodina firmwaru',
  'deviceInfo.build': 'Sestavení',
  'deviceInfo.bootloader': 'Bootloader',
  'deviceInfo.platform': 'Platforma',
  'deviceInfo.serial': 'Sériové číslo',
  'deviceInfo.usbLink': 'Připojení USB',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Konfigurace startu',
  'deviceInfo.bootedFrom': 'Spuštěno z',
  'deviceInfo.nextStart': 'Příští start',
  'deviceInfo.upgradeTarget': 'Cíl aktualizace (vlastní aktualizace kamery)',
  'deviceInfo.bankAt': '{bank} na adrese {address}',
  'deviceInfo.perDeviceKey': 'Klíč zařízení',
  'deviceInfo.notProgrammed': 'nenaprogramován — kamera použije klíč B',
  'deviceInfo.keysTitle': 'Klíče přečtené z této kamery',
  'deviceInfo.foundAt': 'Nalezeno na',
  'deviceInfo.flashOffset': 'offset v paměti flash {offset}',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Klíč A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Klíč B',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**{banks} obsahuje platný obraz firmwaru zašifrovaný klíčem, který bootloader této kamery nezná.** Obraz je neporušený a jeho kontrolní součet je správný, ale bootloader při kontrole slotu zkouší jen {storeKey:acc} a klíč A, takže ho přeskočí a spustí něco jiného.',
    few: '**{banks} obsahují platné obrazy firmwaru zašifrované klíčem, který bootloader této kamery nezná.** Obrazy jsou neporušené a jejich kontrolní součty jsou správné, ale bootloader při kontrole slotu zkouší jen {storeKey:acc} a klíč A, takže je přeskočí a spustí něco jiného.',
    many: '**{banks} obsahují platné obrazy firmwaru zašifrované klíčem, který bootloader této kamery nezná.** Obrazy jsou neporušené a jejich kontrolní součty jsou správné, ale bootloader při kontrole slotu zkouší jen {storeKey:acc} a klíč A, takže je přeskočí a spustí něco jiného.',
    other:
      '**{banks} obsahují platné obrazy firmwaru zašifrované klíčem, který bootloader této kamery nezná.** Obrazy jsou neporušené a jejich kontrolní součty jsou správné, ale bootloader při kontrole slotu zkouší jen {storeKey:acc} a klíč A, takže je přeskočí a spustí něco jiného.',
  },
  'deviceInfo.orphanIsTarget':
    'To je slot, do kterého zapisuje aktualizace. Aplikace běžící v této kameře šifruje znovu tímto neznámým klíčem, takže **zápis přes tuto stránku vytvoří další slot, ze kterého bootloader nedokáže nastartovat** — kamera poběží dál ze {bank:gen}. Obejít to lze přímým zápisem slotu programátorem SPI nebo přes SWD/J-Link.',
  /** deviceInfo.orphanIsTarget's {bank} when the booted bank has no name. A name: a translation may give
   * it case forms ('deviceInfo.otherBank:gen'), like common:bank.*. */
  'deviceInfo.otherBank': 'druhý slot',
  'deviceInfo.otherBank:gen': 'druhého slotu',
  'deviceInfo.otherBank:dat': 'druhému slotu',
  'deviceInfo.otherBank:acc': 'druhý slot',
  'deviceInfo.otherBank:ins': 'druhým slotem',
  'deviceInfo.otherBank:loc': 'druhém slotu',
} satisfies Translation<'shared', 'cs'>;
