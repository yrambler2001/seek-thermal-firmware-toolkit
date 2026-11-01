/**
 * Namespace `shared`, srpski (sr), translated from the English source.
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
  'runPanel.progressLabel': 'Napredak: {label}',
  'runPanel.logLabel': 'Dnevnik: {label}',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… uklonjen je {count} raniji red',
    few: '… uklonjena su {count} ranija reda',
    other: '… uklonjeno je {count} ranijih redova',
  },
  'runPanel.lineCount': { one: '{count} red', few: '{count} reda', other: '{count} redova' },

  /* Status lines several panels set. */
  'status.idle': 'Na čekanju.',
  'status.cancelled': 'Otkazano.',
  'status.cancelling': 'Otkazivanje …',
  'status.failedSeeLog': 'Nije uspelo — pogledajte dnevnik iznad.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'Kamera se koristi u drugoj kartici ili prozoru — prvo završite ili zatvorite rad tamo.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote': 'Zip arhiva se preuzima automatski, pre nego što se bilo šta pošalje.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Nijedan uređaj nije izabran.',
  'device.disconnected': 'Veza sa uređajem je prekinuta.',
  'device.revoked': 'Dozvola je opozvana.',
  'device.unknownProduct': 'nepoznat proizvod',
  'device.unknownVendor': 'nepoznat proizvođač',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'Na Linuxu kamera zahteva udev pravilo pre nego što pregledač može da je otvori:\n\n{rule}\n\nZatim isključite i ponovo priključite kameru. Snap i Flatpak izdanja Chromiuma često su izolovana od sirovih USB uređaja; pouzdano je izdanje .deb ili .rpm.',
  'hint.windows':
    'Windows zahteva da WinUSB drajver bude dodeljen kameri pre nego što joj bilo koji pregledač može pristupiti. Koristite Zadig (https://zadig.akeo.ie/): Options → List All Devices, izaberite stavku nazvanu po vašoj kameri — na primer „CompactPRO FF“ — izaberite WinUSB i kliknite Replace Driver.',
  'hint.holding':
    'Drugi program ili sistemski drajver drži kameru — samo jedan proces istovremeno može da drži USB interfejs. Zatvorite sve ostalo što komunicira sa njom, a zatim isključite i ponovo priključite kameru.',
  'hint.recipientFallback':
    'Ili u opcijama čitanja postavite recipient na „device“, za šta nije potrebno zauzeti interfejs.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid':
    'Otvorite „Opcije“ i pogledajte napomenu ispod polja o dozvoljenom opsegu svakog od njih.',
  'hint.usbTimeout':
    'Kamera je prihvatila zahtev i nikada nije odgovorila. Isključite je i ponovo priključite, pa pokušajte sa manjom vrednošću chunk (64 je vrednost koja radi svuda).',
  'hint.usbStalled':
    'Kamera je odbila zahtev. To obično znači da ga njen firmver ne podržava. Stranica pre bilo kakvog čitanja pita kameru koja je porodica, pa su zahtevi koji se i dalje odbijaju napravljeni za porodicu koju je sama kamera prijavila. Proverite verziju firmvera na kartici Info.',
  'hint.usbNotOpen':
    'Drugi program ili sistemski drajver drži kameru. Zatvorite ga ili u opcijama čitanja postavite recipient na „device“, za šta nije potrebno zauzeti interfejs.',
  'hint.usbTransferFailed': 'Isključite i ponovo priključite kameru, pa pokušajte ponovo.',
  'hint.deviceMode':
    'Kamera nije htela da izađe iz režima snimanja. Isključite je, sačekajte da se potpuno ugasi i ponovo je priključite.',
  'hint.deviceWindow':
    'Mapa selektora koju ova porodica koristi ne odgovara kameri. Na kartici 4.x/Nano otvorite Opcije i pokrenite „Iščitaj sve selektore“ da vidite šta kamera zaista nudi.',
  'hint.deviceVersionUnknown':
    'Ništa što bi moglo da promeni kameru nije poslato. Isključite je, ponovo je priključite, sačekajte da se potpuno pokrene i pokušajte ponovo; kamera koja prijavi verziju firmvera čita se normalno.',
  'hint.imageMalformed': 'Datoteka nije dešifrovana slika Seek firmvera.',
  'hint.imageUnsupported': 'Ova slika ne može da se pripremi za kameru takva kakva je.',
  'hint.imageKeyTable':
    'Slika ne sadrži par ključeva koji navodi njeno ime datoteke. Koristite dešifrovanu datoteku tačno onakvu kakvu je iščitavanje zapisalo, zajedno sa imenom.',
  'hint.flashRefused': 'Ništa nije upisano u kameru.',
  'hint.familyUnsupported':
    'Ništa nije pročitano ni upisano. Svaka kartica pokriva opseg verzija firmvera: kamere 0.x i 1.x idu na karticu „Iščitavanje i dešifrovanje 0.x/1.x“, kamere 4.x i Nano na „Iščitavanje i dešifrovanje 4.x/Nano“. Kartica Info kaže na koju karticu kamera ide.',
  'hint.firmwareTooOld':
    'Nijedna porodica firmvera ovde ne može da pročita ovo izdanje: njegov firmver nema obradu za komandu kojom ova kartica čita fleš, pa mu nije poslato ništa što bi moglo biti pogrešno pročitano. Compact sa 0.7.0.7 ili 0.7.0.8 može da se pročita na kartici „Iščitavanje i dešifrovanje 0.x/1.x“. Kopija fleša napravljena SPI programatorom ili preko SWD/J-Link može se i dalje dešifrovati na ovoj stranici, na kartici „Dešifrovanje datoteke/slota“.',
  'hint.powerCycle':
    'U ovom čarobnjaku: isključite kameru i ponovo je priključite, pritisnite „Poveži uređaj“ i izaberite je, pa ponovo pokrenite isti korak. Sesija je i dalje učitana ovde — nema šta da se nastavlja.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Aktivni firmver',
  'deviceInfo.version': 'Verzija',
  'deviceInfo.family': 'Porodica firmvera',
  'deviceInfo.build': 'Izdanje',
  'deviceInfo.bootloader': 'Butloder',
  'deviceInfo.platform': 'Platforma',
  'deviceInfo.serial': 'Serijski broj',
  'deviceInfo.usbLink': 'USB veza',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Konfiguracija pokretanja',
  'deviceInfo.bootedFrom': 'Pokrenuto iz',
  'deviceInfo.nextStart': 'Sledeće pokretanje',
  'deviceInfo.upgradeTarget': 'Cilj nadogradnje (sopstvene nadogradnje kamere)',
  'deviceInfo.bankAt': '{bank} na adresi {address}',
  'deviceInfo.perDeviceKey': 'Ključ uređaja',
  'deviceInfo.notProgrammed': 'nije programiran — kamera prelazi na ključ B',
  'deviceInfo.keysTitle': 'Ključevi pročitani iz ove kamere',
  'deviceInfo.foundAt': 'Pronađen na',
  'deviceInfo.flashOffset': 'pomeraj u flešu {offset}',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Ključ A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Ključ B',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**U {banks:loc} nalazi se ispravna slika firmvera šifrovana ključem koji butloder ove kamere ne poznaje.** Slika je netaknuta i njen kontrolni zbir je ispravan, ali butloder pri proveri slota isprobava samo {storeKey:acc} i ključ A, pa ga preskače i pokreće nešto drugo.',
    few: '**U {banks:loc} nalazi se po jedna ispravna slika firmvera šifrovana ključem koji butloder ove kamere ne poznaje.** Slike su netaknute i njihovi kontrolni zbirovi su ispravni, ali butloder pri proveri slota isprobava samo {storeKey:acc} i ključ A, pa ih preskače i pokreće nešto drugo.',
    other:
      '**U {banks:loc} nalazi se po jedna ispravna slika firmvera šifrovana ključem koji butloder ove kamere ne poznaje.** Slike su netaknute i njihovi kontrolni zbirovi su ispravni, ali butloder pri proveri slota isprobava samo {storeKey:acc} i ključ A, pa ih preskače i pokreće nešto drugo.',
  },
  'deviceInfo.orphanIsTarget':
    'To je slot u koji upisuje nadogradnja. Aplikacija koja radi na ovoj kameri ponovo šifruje tim nepoznatim ključem, pa će **upis preko ove stranice napraviti još jedan slot koji butloder ne može da pokrene** — kamera će nastaviti da radi iz {bank:gen}. Rešenje je da se slot upiše direktno, SPI programatorom ili preko SWD/J-Link.',
  /** deviceInfo.orphanIsTarget's {bank} when the booted bank has no name. A name: a translation may give
   * it case forms ('deviceInfo.otherBank:gen'), like common:bank.*. */
  'deviceInfo.otherBank': 'drugi slot',
  'deviceInfo.otherBank:nom': 'drugi slot',
  'deviceInfo.otherBank:gen': 'drugog slota',
  'deviceInfo.otherBank:dat': 'drugom slotu',
  'deviceInfo.otherBank:acc': 'drugi slot',
  'deviceInfo.otherBank:ins': 'drugim slotom',
  'deviceInfo.otherBank:loc': 'drugom slotu',
} satisfies Translation<'shared', 'sr'>;
