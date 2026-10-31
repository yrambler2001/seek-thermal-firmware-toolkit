/**
 * Namespace `info`, Polski (pl), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/InfoView.tsx, hooks/useInfoPanel.ts, components/CameraReport.tsx (its labels only: the
 * copyable report text stays English).
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useInfoPanel: the status line. */
  'status.notRead': 'Jeszcze nie odczytano.',
  'status.reading': 'Odczyt ...',
  'status.noVersion': 'Kamera nie podała wersji.',
  'status.tooOld':
    'Odczytano. Firmware {version} jest starszy niż 0.8.0.0 — nic więcej nie odczytano.',
  'status.read': 'Odczytano. Firmware {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Odczytaj kamerę',
  'read.description':
    'Tylko odczyt. Pyta kamerę, jaki firmware działa, jak się uruchamia, jakie ma klucze i co zawiera każdy slot: ten sam odczyt co seek-fw info. Nic nie jest zapisywane.',
  'read.actions': 'Działania karty Info',
  'read.button': 'Odczytaj wersję firmware',
  'read.connectFirst':
    'Najpierw połącz kamerę powyżej, a potem naciśnij „Odczytaj wersję firmware”.',
  'read.showDetails': 'Pokaż szczegóły w dzienniku',
  'read.panel': 'Wersja firmware',
  'result.title': 'Co podaje kamera',
  'result.version': 'Wersja firmware',
  'result.build': 'Kompilacja',
  'result.range': 'Zakres wersji',
  'result.tab': 'Karta dla tej kamery',
  'result.rangeLegacy': '0.x / 1.x: kamery z 2014 i 2016 roku',
  'result.rangeModern': '2.x i nowsze: kamery 4.x, Nano i Mosaic',
  'result.rangeUnknown': 'nieznany',
  'result.noVersion':
    '**Kamera nie podała swojej wersji firmware.** Nic więcej nie zostało wysłane. Odłącz ją, podłącz ponownie, zaczekaj, aż skończy się uruchamiać, i odczytaj jeszcze raz.',
  'result.noTab': 'Żadna karta nie odczytuje tej kompilacji.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Dla tej kamery otwórz kartę <tab>{tab}</tab>. Ta karta jeszcze raz pyta kamerę o jej rodzinę, zanim cokolwiek odczyta, i odrzuca kamerę spoza obsługiwanej rodziny.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'Do czego służy każda karta',
  'tabs.intro':
    'Pięć kart, w tej kolejności. Każda jest osobną stroną, a nagłówek pokazuje, na której jesteś.',
  'tabs.caption': 'Karty: co robią, jakie kamery obsługują i czy zapisują',
  'tabs.tab': 'Karta',
  'tabs.does': 'Co robi',
  'tabs.cameras': 'Kamery',
  'tabs.writes': 'Zapisuje do kamery?',
  'tabs.info.does':
    'Odczytuje to, co podaje kamera: jej firmware, rodzinę, jako która odpowiada, sposób uruchamiania, klucze i każdy slot. Ten sam odczyt co seek-fw info. Niczego nie zapisuje.',
  'tabs.info.cameras': 'Każda kamera Seek, którą WebUSB może otworzyć.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Nie.',
  'tabs.preserve.does':
    'Tworzy pełną kopię 4 MB pamięci flash kamery, z plikiem przebiegu zapisywanym po każdym kroku. Aby odczytać całą pamięć, na pewien czas łata firmware, a potem przywraca oryginalny firmware i go sprawdza. Prowadzi przez kroki jeden po drugim.',
  'tabs.preserve.cameras':
    'Kamery z firmware 0.x i 1.x: kompilacje Compact z 2014 roku, kompilacje Compact PRO z 2016 roku (1.0.3.x) oraz kompilacja Compact 1.3.0.8 FF (16 Hz).',
  'tabs.preserve.writes':
    'Tak, w dwóch krokach, i każdy najpierw pyta. Przywraca kamerę do poprzedniego stanu.',
  'tabs.v4.does':
    'Odczytuje całą pamięć flash kamery 4.x lub Nano i odszyfrowuje znalezione sloty firmware. Tylko odczyt: wysyła sześć poleceń odczytu i żadnego zapisu.',
  'tabs.v4.cameras':
    'Kamery z firmware 4.x (Compact, Compact PRO, Compact XR), Mosaic (10.x i 2.x) i Nano (42.x i 44.x), od 2018 roku.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Nie.',
  'tabs.decrypt.does':
    'Odszyfrowuje plik, który już masz: cały zrzut, slot po slocie, albo pojedynczy 64 KB slot firmware. Wynik można pobrać.',
  'tabs.decrypt.cameras':
    'Żadne. Nie używa kamery, więc działa bez niczego podłączonego i w każdej przeglądarce.',
  'tabs.decrypt.writes': 'Nie. Zapisuje tylko pobierany plik.',
  'tabs.slots.does':
    'Odczytuje trzy sloty firmware (slot A, slot B i slot odzyskiwania R), pokazuje, co zawiera każdy z nich i z którego kamera się uruchamia, i może zrzucić lub zapisać jeden slot naraz.',
  'tabs.slots.cameras': 'Kamery z firmware 0.8.0.0 i nowszym.',
  'tabs.slots.writes': 'Tak, jeden slot naraz, i każdy zapis najpierw pyta.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Kamera',
  'report.product': 'Produkt',
  'report.manufacturer': 'Producent',
  'report.serial': 'Numer seryjny',
  'report.platform': 'Platforma',
  'report.usbLink': 'Łącze USB',
  'report.noProduct': '(brak nazwy produktu)',
  'report.none': '(brak)',
  'report.unreadable': '(nieczytelne)',
  'report.firmware': 'Firmware',
  'report.running': 'Działający',
  'report.bootloader': 'Bootloader',
  'report.family': 'Rodzina firmware',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Odczytano jako',
  'report.detected': 'Wykryto',
  'report.boot': 'Uruchamianie',
  'report.booted': 'Uruchomiony',
  'report.lastStart': 'Ostatnie uruchomienie',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'Działający (1.3.0.8)',
  'report.nextStart': 'Następne uruchomienie',
  'report.upgradeTarget': 'Cel aktualizacji',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(nie sprawdzono)',
  'report.targetConfirmed': '{slot} (potwierdzone w komunikacji USB)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'nieznana: {why}. Obraz 16 Hz FF wymaga, aby kamera podała, którą kompilację uruchamia (karta slotów o to pyta)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': 'kompilacja 16 Hz FF 1.3.0.8',
  'report.build8Hz': 'kompilacja 8 Hz 1.3.0.8',
  'report.keys': 'Klucze',
  'report.slots': 'Sloty',
  'report.slotsCaption':
    'Każdy slot w stanie, w jakim zastał go odczyt. Tylko odczyt: zapisuje karta slotów.',
  'report.slot': 'Slot',
  'report.address': 'Adres',
  'report.version': 'Wersja',
  'report.size': 'Rozmiar',
  'report.key': 'Klucz',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Akceptuje',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Stopka',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Startuje',
  'report.bytes': '{count} B',
  'report.plaintext': 'brak (jawny tekst)',
  /** A table value, lower case: "yes". */
  'report.yes': 'tak',
  /** A table value, lower case: "no". */
  'report.no': 'nie',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'nd.',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Zapis',
  'report.noBankWritten': 'Żaden slot tej kamery nie jest zapisywany:',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'Jeden slot naraz: karta slotów zapisuje lub łata jeden slot tej kamery; każdy slot jest przesyłany jawnie (obraz bez zmian, bez klucza); a każdy zapis najpierw pyta.',
  'report.oneBank.slotKeystream':
    'Jeden slot naraz: karta slotów zapisuje lub łata jeden slot tej kamery; każdy slot jest przesyłany z szyfrowaniem własnym blokiem kluczy 0 obrazu; a każdy zapis najpierw pyta.',
  'report.oneBank.keyA':
    'Jeden slot naraz: karta slotów zapisuje lub łata jeden slot tej kamery; każdy slot jest przesyłany z szyfrowaniem kluczami wyprowadzonymi z uruchomionego slotu i działającej aplikacji; a każdy zapis najpierw pyta.',
  'report.oneBank.ffVendor':
    'Jeden slot naraz: karta slotów zapisuje lub łata jeden slot tej kamery; każdy slot jest przesyłany tak, jak aplikacja producenta przesyła obraz 16 Hz FF (obraz XOR jego własny blok kluczy 0), i przechowywany przez kamerę pod kluczem B; a każdy zapis najpierw pyta.',
  'report.refusesEvery': 'Karta slotów odrzuca każdy slot tej kamery:',
} satisfies Translation<'info'>;
