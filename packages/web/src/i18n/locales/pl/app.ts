/**
 * Namespace `app`, Polski (pl), translated from the English source: the shell.
 *
 * Owner: phase 1. Covers App.tsx, main.tsx, components/AppHeader.tsx,
 * ThemeSwitch.tsx (+ lib/theme.ts), LanguageSwitch.tsx, lib/routing.ts (tab
 * labels and the document title), SupportBanner.tsx (+ lib/support.ts),
 * UnlockNote.tsx, ConnectSection.tsx and PlatformNotes.tsx.
 *
 * Several of these sentences are pinned word for word by safety-copy.test.tsx.
 */

import type { Translation } from '../../types';

export default {
  /* ---- header ---- */
  title: 'Seek Thermal Firmware Toolkit',
  'header.cameraSelected': 'Wybrano kamerę',
  'header.noCamera': 'Nie wybrano kamery',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB niedostępne',
  'header.github': 'Toolkit w serwisie GitHub',
  'header.tabs': 'Karty',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Info',
  'tab.preserve': 'Zrzut i odszyfrowanie 0.x/1.x',
  'tab.v4': 'Zrzut i odszyfrowanie 4.x/Nano',
  'tab.decrypt': 'Odszyfruj plik/slot',
  'tab.slots': 'Sloty firmware',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Seek Thermal Firmware — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Ciemny motyw',
  'theme.followsSystem': 'Zgodnie z jasnym lub ciemnym ustawieniem systemu',
  'theme.chosenDiffers': 'Wybrano tutaj. Przełącz z powrotem, aby stosować ustawienie systemu.',
  'theme.chosenSame': 'Wybrano tutaj; obecnie tak samo jak w ustawieniu systemu',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Język',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Odczytuje podłączoną kamerę tak samo jak `seek-fw info`: jej firmware, rodzinę, jako która odpowiada, sposób uruchamiania, klucze i każdy slot. Wskazuje, która z pozostałych kart ją obsługuje, i prostymi słowami wyjaśnia, do czego służy każda karta. **Na tej karcie nic nie jest zapisywane do pamięci flash.**',
  'intro.preserve':
    'Dla kamer **0.x i 1.x** (kompilacje z 2014 i 2016 roku). Tworzy **pełną** kopię 4 MB pamięci flash kamery — łącznie z częściami, do których zwykły zrzut nie sięga — a potem przywraca kamerę dokładnie do stanu sprzed operacji. Robi kopię zapasową tego, co da się odczytać, na chwilę modyfikuje firmware, aby odczytać resztę, zrzuca całość, przywraca oryginał i go sprawdza. Wszystko działa lokalnie w przeglądarce. **Dwa z kroków zapisują do pamięci flash** i każdy z nich najpierw pyta o zgodę.',
  'intro.v4':
    'Tworzy kopię 4 MB pamięci flash SPI kamery **4.x lub Nano** przez WebUSB, tylko odczytując, i odszyfrowuje znalezione obrazy firmware. Wszystko działa lokalnie w przeglądarce — nic nie jest nigdzie wysyłane. **Tylko odczyt:** ta karta nie wysyła żadnego polecenia zapisu, kasowania, przesyłania, zatwierdzenia ani resetu pamięci flash. Kamera z inną linią firmware jest odrzucana, zanim cokolwiek zostanie odczytane.',
  'intro.decrypt':
    'Odszyfrowuje firmware, który już masz, na tym komputerze: cały zrzut pamięci flash albo jeden 64 KB slot firmware. **Kamera nie jest używana**, więc działa to bez niczego podłączonego i w przeglądarkach bez dostępu do USB. Plik jest odczytywany tutaj i nigdy nie jest wysyłany.',
  'intro.slots':
    'Odczytuje trzy sloty firmware kamery — slot A, slot B i slot odzyskiwania R — i pokazuje, co zawiera każdy z nich, z którego kamera się uruchamia i co ta kompilacja może z nim zrobić, a obok działający firmware urządzenia i jego klucze. Wszystko działa lokalnie w przeglądarce. **Ta karta zapisuje do pamięci flash:** może zapisać jeden slot odszyfrowanym obrazem lub surowymi bajtami i pyta przed każdym zapisem.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**WebUSB nie jest dostępne w systemach iOS i iPadOS,** więc to urządzenie nie może odczytać pamięci flash kamery.',
  'support.ios.body':
    'Safari go nie obsługuje, a każda przeglądarka w iOS musi korzystać z WebKit, więc Chrome i Firefox również nie mogą go tu udostępnić. Żadna flaga ani rozszerzenie tego nie zmienia. Aby zrobić zrzut kamery, użyj komputera stacjonarnego lub telefonu z Androidem i kabla USB-OTG.',
  'support.noWebUsb.title': '**Ta przeglądarka nie ma dostępu do urządzeń USB.**',
  'support.noWebUsb.body':
    'WebUSB jest dostępne w Chrome, Edge, Opera i innych przeglądarkach opartych na Chromium w systemach Windows, macOS, Linux i Android. Firefox i Safari odmówiły jego obsługi.',
  'support.noWebUsb.insecure':
    'Ta strona nie jest też serwowana przez bezpieczne połączenie, co samo w sobie blokuje WebUSB.',
  'support.insecure.title': '**Niezabezpieczone połączenie.** WebUSB jest tu wyłączone.',
  'support.insecure.body':
    'Otwórz tę stronę przez HTTPS lub z `http://localhost`. Zwykły adres w sieci lokalnej, taki jak `http://192.168.1.10:8000`, się nie kwalifikuje.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Nadal możesz używać karty **{tab}** — działa ona wyłącznie na wybranym pliku i nie potrzebuje dostępu do USB.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Gotowe.** Podłącz kamerę Seek i naciśnij *{connect}*.',
  'support.fileProtocol':
    'Otwarto jako plik lokalny, więc przeglądarka nie zapamięta urządzenia między przeładowaniami. To nieszkodliwe.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Uwaga: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Połączenie',
  'connect.actions': 'Działania na urządzeniu',
  'connect.connect': 'Połącz urządzenie',
  'connect.change': 'Zmień urządzenie',
  'connect.test': 'Sprawdź połączenie',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Zapomnij urządzenie',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Oferowane jest każde urządzenie Seek Thermal (producent USB `{vendor}`) — Compact, Compact PRO, Nano i inne. Wybierz swoje w oknie wyboru urządzeń przeglądarki.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Uwagi dotyczące platform',
  'platform.macos':
    'Działa od razu w Chrome, Edge lub dowolnej przeglądarce opartej na Chromium. Bez instalowania sterownika i bez uprawnień administratora. Najpierw zamknij każdy inny program, który już komunikuje się z kamerą — interfejs USB może naraz zajmować tylko jeden proces.',
  'platform.linux.access':
    'Nadaj swojemu użytkownikowi dostęp do urządzenia, a potem odłącz je i podłącz ponownie:',
  'platform.linux.sandbox':
    'Wersje Chromium ze Snap i Flatpak często są odcięte piaskownicą od surowych urządzeń USB; niezawodna jest wersja `.deb` lub `.rpm`.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Windows wymaga, aby do kamery był przypisany sterownik WinUSB, zanim jakakolwiek przeglądarka będzie mogła się z nią połączyć. Użyj programu <zadig>Zadig</zadig>: *Options → List All Devices*, następnie na liście rozwijanej wybierz pozycję nazwaną tak jak Twoja kamera — na przykład `CompactPRO FF` — wybierz **WinUSB** jako sterownik i kliknij Replace Driver. Jeśli kamera pojawia się więcej niż raz, wybierz pozycję oznaczoną *(Interface 0)*. Odbiera to urządzenie oprogramowaniu producenta, dopóki nie cofniesz zmiany w Menedżerze urządzeń (*Odinstaluj urządzenie → Usuń sterownik*, potem podłącz ponownie).',
  'platform.android':
    'Działa w Chrome na Androidzie z kablem USB-OTG, o ile telefon może zasilać kamerę przez USB. Android przyznaje dostęp do USB we własnym oknie uprawnień. Pobrany plik trafia do folderu Pobrane jak każdy inny.',
  'platform.ios.name': 'iPhone i iPad',
  'platform.ios.cannot':
    '**Nie może odczytać kamery** i to się nie zmieni. Safari nie obsługuje WebUSB, a w iOS i iPadOS każda przeglądarka — łącznie z Chrome i Firefoksem — musi renderować za pomocą WebKit, więc żadna z nich nie udostępnia tego API. Nie ma flagi, rozszerzenia ani aplikacji, które by to obeszły. Do zrzutu użyj komputera stacjonarnego lub telefonu z Androidem.',
  'platform.ios.decrypt':
    'Opcjonalne odszyfrowywanie działa tutaj: odszyfrowanie zrzutu, który już masz, nie wymaga dostępu do USB, więc można to zrobić z iPhone’a lub iPada albo z Firefoksa i Safari na komputerze.',
} satisfies Translation<'app', 'pl'>;
