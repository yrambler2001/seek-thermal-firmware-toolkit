/**
 * Namespace `decrypt`, Polski (pl), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/DecryptView.tsx, hooks/useOfflineDecrypt.ts, hooks/useSlotFileDecrypt.ts,
 * components/DetectionBox.tsx, components/FilePickerButton.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useOfflineDecrypt: the status line. */
  'status.noFile': 'Nie wybrano pliku.',
  'status.reading': 'Odczyt pliku ...',
  'status.notUsable': 'To nie jest użyteczny zrzut.',
  'status.building': 'Tworzenie archiwum ...',
  'status.nothingDecrypted':
    'Nie odszyfrowano żadnego obrazu — przyczynę podaje dziennik. Manifest jest w pobranych plikach.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Gotowe — odszyfrowane sloty: {done}/{count}. Sprawdź pobrane pliki.',
    few: 'Gotowe — odszyfrowane sloty: {done}/{count}. Sprawdź pobrane pliki.',
    many: 'Gotowe — odszyfrowane sloty: {done}/{count}. Sprawdź pobrane pliki.',
    other: 'Gotowe — odszyfrowane sloty: {done}/{count}. Sprawdź pobrane pliki.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Odszyfruj zrzut, który już masz',
  'offline.description': 'Cały zrzut pamięci flash, odszyfrowany slot po slocie.',
  'offline.intro':
    'Krok 2 karty 4.x/Nano już odszyfrowuje wszystko, co odczytuje, więc ta część jest potrzebna tylko wtedy, gdy obraz pamięci flash pochodzi skądinąd — z wcześniejszego przebiegu, z J-Link lub z programatora SPI. Plik jest odczytywany lokalnie i nigdy nie jest wysyłany. **Ta część działa w każdej przeglądarce**, także w Safari i w iOS, bo nie potrzebuje dostępu do USB.',
  'offline.actions': 'Działania odszyfrowania offline',
  'offline.choose': 'Wybierz plik zrzutu…',
  'offline.panel': 'Odszyfrowanie offline',
  'offline.detectedTitle': 'Wykryta rodzina firmware',
  'offline.detectedIntro':
    'Kamera nie jest podłączona, więc rodzina jest oceniana na podstawie obrazów w samym pliku. Klucz i tak jest wyznaczany z szyfrogramu każdego slotu; ta ocena służy tylko do nazwania rodziny firmware w raporcie.',
  'offline.scoreBasis': 'na podstawie obrazów w pliku',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Odszyfruj slot firmware',
  'slot.description': 'Jeden slot z pliku: 64 KB, tak jak przechowuje go kamera.',
  'slot.intro':
    'Wybierz plik, który zawiera jeden slot firmware — 65 536 bajtów, tak jak zapisuje go zrzut slotu na karcie <link>{tab}</link>, albo 64 KB spod adresu slotu w zrzucie całej pamięci flash. Strona znajduje klucz na podstawie bajtów samego slotu, odszyfrowuje obraz i udostępnia go do pobrania, pokazując klucz, rozmiar i SHA-256. Kamera nie jest używana, więc działa to bez niczego podłączonego.',
  'slot.refusedIntro':
    'Plik, który nie jest jednym slotem, nie zawiera obrazu firmware albo nie daje się odszyfrować, jest odrzucany z podaniem przyczyny. W przypadku wymazanego slotu strona to zgłasza i nie ma czego odszyfrowywać.',
  'slot.actions': 'Działania na pliku slotu',
  'slot.choose': 'Wybierz plik slotu…',
  'slot.decrypting': 'Odszyfrowywanie {file} …',
  'slot.unreadable': 'Nie udało się odczytać pliku.',
  'slot.notDecrypted':
    'Nie odszyfrowano: {file} nie jest slotem firmware, który ta strona potrafi odszyfrować.',
  'slot.nothingWritten':
    'Nigdzie nic nie zostało zapisane. Wybierz plik slotu 64 KB albo cały zrzut w sekcji powyżej.',
  'slot.erased': '{file} to wymazany slot.',
  'slot.resultTitle': 'Odszyfrowany slot firmware',
  'slot.file': 'Plik',
  'slot.fileSize': 'Rozmiar pliku',
  'slot.fileSha': 'SHA-256 pliku',
  'slot.imageVersion': 'Wersja obrazu',
  'slot.imageSize': 'Rozmiar obrazu',
  'slot.imageSha': 'SHA-256 obrazu',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Suma kontrolna',
  'slot.notComputed': 'nie jest obliczana dla tej postaci',
  'slot.family': 'Rodzina',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (wykryta na podstawie obrazu)',
  'slot.familyMismatch':
    '{name} — suma nie jest wartością docelową tej rodziny, więc bootloader nie przyjąłby obrazu w obecnej postaci',
  'slot.unknown': 'nieznana',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': 'Klucz',
  'slot.keyPlain': 'brak: slot przechowuje obraz jawnie (łańcuch jawnego tekstu z 2014 roku)',
  'slot.keyFfB': 'klucz B z pary 1.3.0.8 FF',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Zapisany jako',
  'slot.storedAsFfB': 'obraz XOR strumień klucza B, okno nagłówka bez zmian',
  'slot.keyNone': 'brak',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Postać klucza',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k} — ta postać występuje w samym obrazie dokładnie raz, co ją wskazuje',
  'slot.keyFormDefault':
    '{k} — żadna postać nie występuje w obrazie dokładnie raz, więc pokazano domyślną dla rodziny',
  'slot.resultActions': 'Działania na odszyfrowanym obrazie',
  'slot.download': 'Pobierz {file}',
  'slot.downloadFallback': 'odszyfrowany obraz',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Wykryto',
  'detection.score': 'Wynik',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} z 1.00, {basis}',
  'detection.readAs': 'Odczytano jako',
  'detection.summary': 'Podsumowanie',
  'detection.why': 'Dlaczego:',
  'detection.ambiguous':
    '**Dowody nie rozstrzygnęły, która to rodzina.** Albo zwycięzca nie wypadł lepiej niż ogólna rodzina zastępcza, albo druga w kolejności była zbyt blisko, aby rozstrzygnąć. Nie wpływa to na odszyfrowanie — klucz i tak jest wyznaczany z szyfrogramu — ale rodzina podana w raporcie i wszystko, co od niej zależy, to przypuszczenie.',
} satisfies Translation<'decrypt', 'pl'>;
