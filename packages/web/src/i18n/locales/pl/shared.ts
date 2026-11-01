/**
 * Namespace `shared`, Polski (pl), translated from the English source.
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
  'runPanel.progressLabel': '{label} — postęp',
  'runPanel.logLabel': '{label} — dziennik',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… usunięto {count} wcześniejszy wiersz',
    few: '… usunięto {count} wcześniejsze wiersze',
    many: '… usunięto {count} wcześniejszych wierszy',
    other: '… usunięto {count} wcześniejszego wiersza',
  },
  'runPanel.lineCount': {
    one: '{count} wiersz',
    few: '{count} wiersze',
    many: '{count} wierszy',
    other: '{count} wiersza',
  },

  /* Status lines several panels set. */
  'status.idle': 'Bezczynny.',
  'status.cancelled': 'Anulowano.',
  'status.cancelling': 'Anulowanie …',
  'status.failedSeeLog': 'Niepowodzenie — zobacz dziennik powyżej.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'Kamera jest używana w innej karcie lub oknie przeglądarki — najpierw zakończ tam pracę lub je zamknij.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote': 'Plik zip jest pobierany automatycznie, zanim cokolwiek zostanie wysłane.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Nie wybrano urządzenia.',
  'device.disconnected': 'Urządzenie odłączone.',
  'device.revoked': 'Cofnięto uprawnienie.',
  'device.unknownProduct': 'nieznany produkt',
  'device.unknownVendor': 'nieznany producent',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'W Linuksie kamera wymaga reguły udev, zanim przeglądarka będzie mogła ją otworzyć:\n\n{rule}\n\nNastępnie odłącz kamerę i podłącz ją ponownie. Wersje Chromium ze Snap i Flatpak często są odcięte piaskownicą od surowych urządzeń USB; niezawodna jest wersja .deb lub .rpm.',
  'hint.windows':
    'Windows wymaga, aby do kamery był przypisany sterownik WinUSB, zanim jakakolwiek przeglądarka będzie mogła się z nią połączyć. Użyj programu Zadig (https://zadig.akeo.ie/): Options → List All Devices, wybierz pozycję nazwaną tak jak kamera — na przykład „CompactPRO FF” — wybierz WinUSB i kliknij Replace Driver.',
  'hint.holding':
    'Inny program lub sterownik systemowy zajmuje kamerę — interfejs USB może naraz zajmować tylko jeden proces. Zamknij wszystko inne, co się z nią komunikuje, a potem odłącz kamerę i podłącz ją ponownie.',
  'hint.recipientFallback':
    'Możesz też w opcjach odczytu ustawić recipient na „device”; wtedy interfejs nie musi być zajęty.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid':
    'Otwórz „Opcje” i sprawdź uwagę pod polami, aby poznać zakres każdego z nich.',
  'hint.usbTimeout':
    'Kamera przyjęła żądanie i nigdy nie odpowiedziała. Odłącz ją i podłącz ponownie, a potem spróbuj z mniejszym chunk (64 to wartość, która działa wszędzie).',
  'hint.usbStalled':
    'Kamera odrzuciła żądanie. Zwykle oznacza to, że jej firmware go nie obsługuje. Strona pyta kamerę o jej rodzinę, zanim cokolwiek odczyta, więc żądania, które są wciąż odrzucane, zostały wysłane dla rodziny podanej przez samą kamerę. Sprawdź wersję firmware na karcie „Info”.',
  'hint.usbNotOpen':
    'Inny program lub sterownik systemowy zajmuje kamerę. Zamknij go albo ustaw w opcjach odczytu recipient na „device”; wtedy interfejs nie musi być zajęty.',
  'hint.usbTransferFailed': 'Odłącz kamerę i podłącz ją ponownie, a potem spróbuj jeszcze raz.',
  'hint.deviceMode':
    'Kamera nie chciała wyjść z trybu obrazowania. Odłącz ją, zaczekaj, aż całkowicie się wyłączy, i podłącz ją ponownie.',
  'hint.deviceWindow':
    'Mapa selektorów używana przez tę rodzinę nie pasowała do kamery. Na karcie 4.x/Nano otwórz „Opcje” i uruchom „Zrzuć wszystkie selektory”, aby zobaczyć, co kamera faktycznie udostępnia.',
  'hint.deviceVersionUnknown':
    'Nie wysłano niczego, co mogłoby zmienić kamerę. Odłącz ją, podłącz ponownie, zaczekaj, aż skończy się uruchamiać, i spróbuj jeszcze raz; kamera, która podaje swoją wersję firmware, jest odczytywana normalnie.',
  'hint.imageMalformed': 'Ten plik nie jest odszyfrowanym obrazem firmware Seek.',
  'hint.imageUnsupported': 'Tego obrazu nie da się w obecnej postaci przygotować dla kamery.',
  'hint.imageKeyTable':
    'Obraz nie zawiera pary kluczy, którą podaje jego nazwa pliku. Użyj odszyfrowanego pliku dokładnie w takiej postaci, w jakiej zapisał go zrzut, łącznie z nazwą.',
  'hint.flashRefused': 'Do kamery nic nie zostało zapisane.',
  'hint.familyUnsupported':
    'Nic nie zostało odczytane ani zapisane. Każda karta obsługuje pewien zakres wersji firmware: kamery 0.x i 1.x obsługuje „Zrzut i odszyfrowanie 0.x/1.x”, kamery 4.x i Nano — „Zrzut i odszyfrowanie 4.x/Nano”. Karta „Info” podaje, która karta jest właściwa dla kamery.',
  'hint.firmwareTooOld':
    'Żadna rodzina firmware nie może tu odczytać tej kompilacji: jej firmware nie obsługuje polecenia, którym ta karta odczytuje pamięć flash, więc nie wysłano do niej niczego, co mogłoby zostać błędnie odczytane. Kamerę Compact z wersją 0.7.0.7 lub 0.7.0.8 można odczytać na karcie „Zrzut i odszyfrowanie 0.x/1.x”. Zrzut wykonany programatorem SPI lub przez SWD/J-Link nadal można odszyfrować na tej stronie, na karcie „Odszyfruj plik/slot”.',
  'hint.powerCycle':
    'W tym kreatorze: odłącz kamerę i podłącz ją ponownie, naciśnij „Połącz urządzenie” i wybierz ją, a potem uruchom ten sam krok jeszcze raz. Przebieg jest nadal wczytany — nie ma czego wznawiać.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Działający firmware',
  'deviceInfo.version': 'Wersja',
  'deviceInfo.family': 'Rodzina firmware',
  'deviceInfo.build': 'Kompilacja',
  'deviceInfo.bootloader': 'Bootloader',
  'deviceInfo.platform': 'Platforma',
  'deviceInfo.serial': 'Numer seryjny',
  'deviceInfo.usbLink': 'Łącze USB',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Konfiguracja startu',
  'deviceInfo.bootedFrom': 'Uruchomiony slot',
  'deviceInfo.nextStart': 'Następne uruchomienie',
  'deviceInfo.upgradeTarget': 'Cel aktualizacji (własnej)',
  'deviceInfo.bankAt': '{bank} pod adresem {address}',
  'deviceInfo.perDeviceKey': 'Klucz urządzenia',
  'deviceInfo.notProgrammed': 'niezaprogramowany — kamera używa wtedy klucza B',
  'deviceInfo.keysTitle': 'Klucze odczytane z tej kamery',
  'deviceInfo.foundAt': 'Położenie',
  'deviceInfo.flashOffset': 'przesunięcie w pamięci flash {offset}',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Klucz A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Klucz B',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**{banks} zawiera prawidłowy obraz firmware zaszyfrowany kluczem, którego bootloader tej kamery nie zna.** Obraz jest nienaruszony, a jego suma kontrolna jest poprawna, ale przy sprawdzaniu slotu bootloader bierze pod uwagę tylko {storeKey} i klucz A, więc pomija ten slot i uruchamia coś innego.',
    few: '**{banks} zawierają prawidłowy obraz firmware zaszyfrowany kluczem, którego bootloader tej kamery nie zna.** Obraz jest nienaruszony, a jego suma kontrolna jest poprawna, ale przy sprawdzaniu slotu bootloader bierze pod uwagę tylko {storeKey} i klucz A, więc pomija te sloty i uruchamia coś innego.',
    many: '**{banks} zawierają prawidłowy obraz firmware zaszyfrowany kluczem, którego bootloader tej kamery nie zna.** Obraz jest nienaruszony, a jego suma kontrolna jest poprawna, ale przy sprawdzaniu slotu bootloader bierze pod uwagę tylko {storeKey} i klucz A, więc pomija te sloty i uruchamia coś innego.',
    other:
      '**{banks} zawierają prawidłowy obraz firmware zaszyfrowany kluczem, którego bootloader tej kamery nie zna.** Obraz jest nienaruszony, a jego suma kontrolna jest poprawna, ale przy sprawdzaniu slotu bootloader bierze pod uwagę tylko {storeKey} i klucz A, więc pomija te sloty i uruchamia coś innego.',
  },
  'deviceInfo.orphanIsTarget':
    'To ten slot zapisuje aktualizacja. Aplikacja działająca na tej kamerze szyfruje ponownie tym nieznanym kluczem, więc **zapis przez tę stronę da kolejny slot, którego bootloader nie uruchomi** — kamera nadal będzie uruchamiać {bank}. Obejściem jest zapis slotu bezpośrednio programatorem SPI lub przez SWD/J-Link.',
  'deviceInfo.otherBank': 'drugi slot',
} satisfies Translation<'shared', 'pl'>;
