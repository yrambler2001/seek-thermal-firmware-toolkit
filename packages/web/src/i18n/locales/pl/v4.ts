/**
 * Namespace `v4`, Polski (pl), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/V4View.tsx, hooks/useDumpPanel.ts, components/CameraIdentity.tsx,
 * components/OptionsDetails.tsx, lib/options.ts.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useDumpPanel: the status line. */
  'status.starting': 'Uruchamianie ...',
  'status.building': 'Tworzenie archiwum ...',
  'status.cancelling': 'Anulowanie — to, co już odczytano, zostanie zapisane ...',
  'status.refused': 'Odmowa — nic nie zostało odczytane. Zobacz komunikat nad dziennikiem.',
  'status.sweepDone':
    'Gotowe — aktywowane selektory: {armed}/{total}, z danymi: {withData}. Sprawdź pobrane pliki.',
  'status.sweepDoneCancelled':
    'Gotowe — aktywowane selektory: {armed}/{total}, z danymi: {withData} (anulowano). Sprawdź pobrane pliki.',
  'status.dumpDone': 'Gotowe — odczytane okna: {read}/{expected}. Sprawdź pobrane pliki.',
  'status.dumpDoneCancelled':
    'Gotowe — odczytane okna: {read}/{expected} (anulowano). Sprawdź pobrane pliki.',
  'status.dumpDoneIncomplete':
    'Gotowe — odczytane okna: {read}/{expected} (niekompletne — zobacz dziennik). Sprawdź pobrane pliki.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'Kamera nie pasuje do rodziny 4.x/Nano, a ta karta odczytuje tylko tę rodzinę. Nic nie zostało odczytane. Dla kamery 0.x lub 1.x (kompilacje z 2014 lub 2016 roku) użyj karty „{tab}”.',
  'refusal.otherFamily':
    'Kamera wygląda na {name} ({id}), a nie na kamerę 4.x/Nano, a ta karta odczytuje tylko 4.x/Nano. Nic nie zostało odczytane. Dla kamery 0.x lub 1.x (kompilacje z 2014 lub 2016 roku) użyj karty „{tab}”.',
  'refusal.legacyLine':
    'Kamera ma firmware {version}, kompilację 0.x lub 1.x (z 2014 lub 2016 roku), a ta karta odczytuje tylko 4.x/Nano. Odczytano tylko wersję. Dla kamery 0.x lub 1.x użyj karty „{tab}”.',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Zrzut',
  'dump.actions': 'Działania zrzutu',
  'dump.start': 'Rozpocznij zrzut',
  'dump.panel': 'Zrzut',
  'dump.how':
    'Oba najpierw pytają kamerę, jaki firmware działa: o wersję, poleceniem `{getInfo}` — tym odczytem, na który każda kompilacja Seek odpowiada tak samo — oraz, tylko jeśli tę kompilację da się odczytać przez USB, jednym zwykłym i jednym niosącym token `{begin}` i pojedynczym odczytem. Tak strona ustala, do której rodziny należy kamera. Ta karta odczytuje tylko rodzinę 4.x i Nano. Kamera, którą odpowiedzi umieszczają gdziekolwiek indziej, jest odrzucana, zanim cokolwiek zostanie odczytane, a strona podaje właściwą dla niej kartę. Kamera, która nie podaje swojej wersji albo ma kompilację starszą niż 0.8.0.0, w ogóle nie jest odczytywana, a strona wyjaśnia dlaczego.',
  'dump.modes':
    '**Rozpocznij zrzut** odczytuje każdy blok, do którego sięga własna tabela selektorów kompilacji. **Zrzuć wszystkie selektory**, w sekcji *Opcje* poniżej, sprawdza każdy selektor `{begin}` od `{first}` do `{last}` i zapisuje to, co każdy zwróci — wolniej, ale obejmuje też bloki pomijane przez opracowaną mapę.',
  'dump.sweep': 'Zrzuć wszystkie selektory ({first}–{last})',
  'dump.sweepNote':
    'Sprawdza każdy selektor i zapisuje to, co każdy zwróci. Wolniejsze niż „Rozpocznij zrzut”.',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'Co otrzymujesz',
  'output.intro': 'Jeden plik `{ext}` do pobrania, zawierający:',
  'output.caption': 'Pliki w pobranym archiwum',
  'output.file': 'Plik',
  'output.what': 'Co to jest',
  'output.flash':
    'złożony obraz 4 MB pamięci flash (wypełnienie luki i token odblokowania, jeśli był użyty, są w manifest.json)',
  'output.windows': 'każdy blok 64 KB dokładnie tak, jak przyszedł przez USB',
  'output.decrypted': 'każdy slot z obrazem firmware, odszyfrowany (jeśli znaleziono klucz)',
  'output.reports':
    'raport dla każdego slotu: klucz, położenie klucza, rodzina i szyfr, SP, punkt wejścia, SHA-256',
  'output.manifest': 'dokładne metadane odczytu, luki i odszyfrowania',
  'output.readme': 'czym jest ten zapis i jakie ma ograniczenia',
  'output.keyFromDump':
    'Klucz jest odtwarzany z samego zrzutu, więc nie jest potrzebny plik klucza ani sekret urządzenia.',
  'output.bestEffort':
    'Odszyfrowanie nadal działa na zasadzie „w miarę możliwości”. Jeśli klucz nie zostanie znaleziony — na przykład w egzemplarzu, którego bootloader wyprowadza klucz z pamięci OTP układu, nieobecnej w zrzucie pamięci flash — ten slot jest po prostu pomijany, a reszta archiwum pozostaje bez zmian.',
  'gap.summary': 'Luka {address}',
  'gap.where':
    'Zestaw poleceń USB udostępnia selektor okna odczytu dla każdego bloku 64 KB z 4 MB pamięci flash z wyjątkiem `{range}`. Ten blok jest w połączonym obrazie wypełniony wartością `{fill}` i odnotowany w `{manifest}`.',
  'gap.costs':
    '**W praktyce nic to nie kosztuje.** W większości kamer ten blok to po prostu wymazana pamięć flash, która i tak odczytuje się jako `{fill}` — więc wypełnienie zgadza się z tym, co naprawdę tam jest, a obraz jest kompletny.',
  'gap.redundant':
    'A gdy blok *jest* używany, jego zawartość to nadmiarowa kopia. Te kamery przechowują ten sam obraz firmware w kilku 64 KB slotach: we wszystkich zrzutach wieloslotowych sprawdzonych przy tworzeniu tej strony wszystkie sloty odszyfrowały się do identycznego co do bajtu firmware — w jednym przypadku w czterech slotach zapisanych dwoma różnymi kluczami. W jedynym egzemplarzu z prawdziwym obrazem pod `{address}` był on bajt w bajt taki sam jak kopie pod `{before}` i `{after}`, więc archiwum i tak zawiera ten firmware, tyle że odczytany spod innego adresu.',
  'gap.fine':
    'Ta nadmiarowość wyjaśnia też, dlaczego kamera, której `{address}` odczytuje się jako `{fill}`, jest w porządku: firmware zdolny do uruchomienia nadal istnieje w pozostałych slotach. Tak czy inaczej nic na tej karcie nie zapisuje do urządzenia — luka dotyczy tylko pobieranego pliku.',
  'gap.complete':
    'Jeśli naprawdę potrzebny jest ściśle kompletny obraz bajt w bajt — na przykład do porównania pamięci flash z wzorcem — odczytaj pamięć flash przez SWD/J-Link lub programatorem SPI.',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': 'Nie odczytano: kamera nie podała, jaki firmware działa.',
  'identity.unsupported': 'Nie odczytano: tej kamery nie da się odczytać w ten sposób.',
  'identity.title': 'Wykryta kamera',
  'identity.firmware': 'Firmware',
  'identity.scoreBasis': 'na podstawie odpowiedzi kamery, zanim odczytano jakikolwiek slot',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Opcje',
  'options.subtitle': '— wartości domyślne są poprawne; nie trzeba tu niczego zmieniać.',
  'options.chunk': 'chunk (bajty control-IN)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'bajt gap-fill',
  'options.retries': 'ponowienia na okno',
  'options.retryDelay': 'opóźnienie ponowienia (ms)',
  'options.recipient': 'recipient transferu kontrolnego',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'automatycznie',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'odszyfrowanie firmware',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'tak',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'nie',
  'options.help':
    '**chunk** to rozmiar każdego odczytu control-IN, najwyżej 64: jeden pakiet EP0. Przy dłuższym odczycie boot ROM kamery może zgubić pakiet, gdy kamera pracuje bezczynnie z niskim taktowaniem, więc większa wartość jest odczytywana po 64 bajty; mniejsza jest używana bez zmian, a jeśli kamera się zatrzyma, strona sama zmniejsza wartość i kontynuuje. **gap-fill** to bajt wpisywany w jedyny blok 64 KB, do którego USB nie sięga. **recipient** domyślnie to interface; jeśli przeglądarka nie może zająć interfejsu 0, strona przechodzi na device — firmware akceptuje oba.',
  'options.chunkRange': 'chunk musi mieścić się w zakresie od 1 do {max}, podano {value}',
  'options.gapFillByte': 'gap-fill musi być pojedynczym bajtem, podano {value}',
  'options.retriesMin': 'liczba ponowień musi wynosić zero lub więcej, podano {value}',
  'options.retryDelayMin': 'opóźnienie ponowienia musi wynosić zero lub więcej, podano {value}',
} satisfies Translation<'v4', 'pl'>;
