/**
 * Namespace `slots`, Polski (pl), translated from the English source: the firmware-slots tab.
 *
 * Owner: phase 2, slots agent.
 * Covers: views/SlotsView.tsx, hooks/useSlotsPanel.ts, components/SlotTable.tsx, SlotFpsConfirm.tsx,
 * SlotFpsEveryConfirm.tsx, SlotWriteConfirm.tsx, SlotFlashPreview.tsx, SlotWriteKeys.tsx.
 * (components/DeviceInfoPanel.tsx is done: its text is in `shared`, deviceInfo.*.)
 *
 * Words used all over this tab:
 * - bank = one of the camera's three firmware slots, A, B and R. R = the recovery slot, the
 *   last-resort copy the bootloader falls back to.
 * - {bank} is a bank's name from common:bank.* ("Slot A", "Recovery R" on its own; "slot A",
 *   "recovery R" inside a sentence). {a}, {b}, {r} are those names inside a sentence; {letter},
 *   {letterA}, {letterB}, {letterR} are the bare letters A, B and R (keep them Latin).
 * - booted = the bank the camera started from (the firmware it runs now).
 * - write / flash = erase a bank and program a new image into it. Commit = the camera's last step of a
 *   write, after which the bank may be changed.
 * - read-back = the bank read again after a write, to compare with what was sent.
 * - "Flash decrypted image", "Read slots", "Dump"… in quotes or bold are this tab's own buttons
 *   (table.flashPlain, actions.read, table.dump): use the same words as those keys.
 * - Hz values, firmware versions (0.8.0.0, 1.3.0.8), 0xFF, .bin/.zip, SWD/J-Link and SPI stay as they
 *   are. Key A / Key B: translate "Key", keep the letter. KiB/MiB are written KB/MB (README, Units).
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* The section: its heading, badge and one-line summary. */
  'section.title': 'Sloty firmware',
  'section.badge': 'Zapisuje do pamięci flash',
  'section.description':
    '„Odczytaj sloty” pyta kamerę, jaki firmware działa, odczytuje jej trzy sloty firmware — {a}, {b} i {r} — i pokazuje, co zawiera każdy z nich. Odczyt i zrzut niczego nie zmieniają. Przycisk zapisu pyta, zanim zostanie wysłany jakikolwiek bajt.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Ta strona może zapisywać do pamięci flash kamery.** Zapis wymazuje jeden 64 KB slot i programuje go od nowa. Obraz poprawny pod względem struktury, który jednak nie działa, sprawi, że kamera przestanie się uruchamiać, a bootloader nie obsługuje USB — przywrócić ją można tylko przez SWD/J-Link lub programatorem SPI. Najpierw zrób zrzut slotu i zachowaj plik.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Działania na slotach',
  'actions.read': 'Odczytaj sloty',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Sloty',

  /* Before any read. */
  'empty.connected': 'Naciśnij „Odczytaj sloty”.',
  'empty.disconnected': 'Połącz kamerę, a potem naciśnij „Odczytaj sloty”.',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Ta kompilacja nie jest tu obsługiwana, więc żaden slot nie został odczytany i żadnego nie można zapisać.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Nie rozpoznano: ta strona nie potrafi ustalić, jaką kompilację uruchamia kamera.',
  'refusal.notIdentified.body':
    'Kamera nie podała użytecznej wersji firmware, więc żaden slot nie został odczytany i nic nie zostało aktywowane. Ta strona obsługuje kompilacje {minVersion} i nowsze. Kompilacje starsze niż {minVersion} wykraczają poza to, co obsługuje strona slotów, więc kamera z jedną z nich nigdy nie jest tu odczytywana.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Jeśli kamera ma obsługiwaną kompilację, może się dopiero uruchamiać. {hint}',
  'refusal.title': 'Odmowa — nic nie zostało aktywowane.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Odczyt ...',
  'status.readingAgain': 'Ponowny odczyt slotów ...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Odczytano. Odczytane sloty: {read}/{count}.',
    few: 'Odczytano. Odczytane sloty: {read}/{count}.',
    many: 'Odczytano. Odczytane sloty: {read}/{count}.',
    other: 'Odczytano. Odczytane sloty: {read}/{count}.',
  },
  'status.unsupported': 'Nieobsługiwane w tej kompilacji — żaden slot nie został odczytany.',
  'status.refused': 'Odmowa — nic nie zostało aktywowane. Zobacz komunikat pod dziennikiem.',
  'status.disconnected': 'Urządzenie odłączone — odczytaj sloty ponownie.',
  'status.newDevice': 'Wybrano nowe urządzenie — odczytaj sloty ponownie.',
  'status.dumping': 'Zrzucanie {bank:gen} ...',
  'status.dumped': 'Zrzucono {bank:acc}.',
  'status.readingImage': 'Odczyt obrazu ...',
  'status.ready': 'Gotowe — przejrzyj plan, a potem go zapisz.',
  'status.rejected': 'Odrzucono — zobacz dziennik powyżej.',
  'status.writing': 'Zapisywanie ...',
  'status.patching': 'Łatanie {bank:gen} ...',
  'status.patchingEvery': 'Łatanie wszystkich slotów ...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Zapisano, ale odczyt kontrolny się nie zgadza — zobacz wynik.',
  'status.written.verified': 'Zapisano. Odczyt kontrolny zgadza się z zapisem.',
  'status.written.notCompared': 'Zapisano. Odczytu kontrolnego nie porównano — zobacz wynik.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Załatano, ale odczyt kontrolny nie różni się tylko w zaplanowany sposób — zobacz wynik.',
  'status.patched.ok': 'Załatano. Odczyt kontrolny zgadza się z planem.',
  'status.patched.unchecked': 'Załatano. Odczytu kontrolnego nie sprawdzono — zobacz wynik.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Zatrzymano na {bank:loc} — załatano {count} slot; zobacz wynik.',
    few: 'Zatrzymano na {bank:loc} — załatano {count} sloty; zobacz wynik.',
    many: 'Zatrzymano na {bank:loc} — załatano {count} slotów; zobacz wynik.',
    other: 'Zatrzymano na {bank:loc} — załatano {count} slotu; zobacz wynik.',
  },
  'status.every.unchecked': {
    one: 'Załatano {count} slot, ale jeden z odczytów kontrolnych nie został sprawdzony zgodnie z planem — zobacz wynik.',
    few: 'Załatano {count} sloty, ale jeden z odczytów kontrolnych nie został sprawdzony zgodnie z planem — zobacz wynik.',
    many: 'Załatano {count} slotów, ale jeden z odczytów kontrolnych nie został sprawdzony zgodnie z planem — zobacz wynik.',
    other:
      'Załatano {count} slotu, ale jeden z odczytów kontrolnych nie został sprawdzony zgodnie z planem — zobacz wynik.',
  },
  'status.every.ok': {
    one: 'Załatano {count} slot. Każdy odczyt kontrolny zgadza się z planem.',
    few: 'Załatano {count} sloty. Każdy odczyt kontrolny zgadza się z planem.',
    many: 'Załatano {count} slotów. Każdy odczyt kontrolny zgadza się z planem.',
    other: 'Załatano {count} slotu. Każdy odczyt kontrolny zgadza się z planem.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Anulowano — nic nie zostało zapisane.',
  'status.cancelled.one':
    'Anulowano po wysłaniu zatwierdzenia zapisu do {bank:gen} — slot może być zapisany tylko częściowo. Odczytaj go, zanim zaczniesz na nim polegać.',
  'status.cancelled.many':
    'Anulowano po wysłaniu zatwierdzeń zapisu do {banks:gen} — każdy z nich może być zapisany tylko częściowo. Odczytaj je, zanim zaczniesz na nich polegać.',
  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Najpierw połącz kamerę.',
  'gate.busy': 'Trwa inna operacja — zaczekaj, aż się zakończy.',
  'gate.readFirst': 'Najpierw odczytaj sloty.',
  'gate.cameraRefused':
    'Tej kamery nie można stąd zapisać — przyczynę podaje komunikat powyżej. Nic nie jest wysyłane.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Nie odczytano: {reason}. Przed zapisem odczytaj sloty ponownie.',
  'gate.notReadNoReason':
    'Nie odczytano: ten slot nie został odczytany. Przed zapisem odczytaj sloty ponownie.',
  'gate.emptyNotWritable': 'Ten slot jest pusty i w tej kompilacji nie można go zapisać: {reason}',
  'gate.noSuchBank': 'Ta kompilacja nie ma takiego slotu.',

  /* The bank table. */
  'table.caption':
    'Każdy slot firmware tej kamery — {a}, {b} i {r} — odczytany i sprawdzony w przeglądarce',
  'table.col.bank': 'Slot',
  'table.col.firmware': 'Firmware',
  'table.col.size': 'Rozmiar',
  'table.col.key': 'Klucz',
  'table.col.bootable': 'Startuje',
  'table.col.sha': 'SHA-256 jawnego tekstu',
  'table.col.actions': 'Działania',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'nie odczytano — {reason}',
  'table.notReadNoReason': 'nie odczytano — slot nie został odczytany',
  /* A badge: the bank holds no image. */
  'table.empty': 'pusty',
  'table.emptyNote':
    'Brak obrazu: okno nagłówka tego slotu odczytuje się jako same 0xFF, więc nic z niego nie jest odszyfrowywane, a jego zapis nie nadpisuje żadnego firmware.',
  /* {reason} is core's. */
  'table.emptyWritable': 'Można zapisać.',
  'table.emptyNotWritable': 'W tej kompilacji nie można zapisać: {reason}',
  'table.unknownVersion': 'nieznana wersja',
  /* {id} is the image id in hex. */
  'table.imageId': 'obraz {id}',
  'table.noImage': 'brak obrazu',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'slot {size} B',
  'table.imageSize': 'obraz {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'brak (jawny tekst)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— nie ma czego uruchomić',
  'table.boot.bootable': 'startuje — bootloader go przyjmuje',
  'table.boot.notBootable': 'nie startuje — pomijany przy uruchamianiu',
  'table.boot.recoveryOnly':
    'tylko odzyskiwanie — slot {letterR} uruchamia się, gdy sloty {letterA} i {letterB} nie zawierają niczego, co przyjmie bootloader (zmierzono na kamerze dla wcześniejszej postaci tego obrazu); czy ta postać się uruchamia, nie zostało przetestowane',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'nieznane — {why}',
  /* The row's buttons. */
  'table.dump': 'Zrzuć',
  'table.flashPlain': 'Zapisz odszyfrowany obraz…',
  'table.flashRaw': 'Zapisz surowe bajty…',
  'table.restore': 'Przywróć z pełnej kopii pamięci flash (.bin lub .zip)…',
  'table.makeFps': 'Ustaw {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Kopiuj do {bank:gen}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: wyłączone',
  'table.copyNote':
    'Kopiuje firmware, który zawiera ten slot, w postaci odszyfrowanej przez ten odczyt, do wybranego slotu, niezależnie od tego, co ten slot teraz zawiera. Plan można przejrzeć, zanim cokolwiek zostanie wysłane.',
  'table.restoreNote':
    'Wybierz pełną kopię zapasową pamięci flash: plik .bin (cały 4 MB obraz pamięci flash, na przykład odczyt przez J-Link) lub plik .zip, który go zawiera (plik przebiegu Preserve albo zip zapisany przez „Zrzut i odszyfrowanie 4.x/Nano” lub „Zrzuć wszystkie selektory”). Ten slot zostanie z niego wycięty, odszyfrowany i pokazany jako plan, zanim cokolwiek zostanie wysłane.',
  'table.fpsNote':
    'Podnosi liczbę klatek tego slotu z {fromHz} Hz do {toHz} Hz przez edycję jego bajtów. Slot jest najpierw zachowywany w pliku zip do pobrania, a odszyfrowany plik w środku pozwala wrócić do poprzedniego stanu.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery':
    '{booted}, a zarazem slot odzyskiwania: zapis wymaga dodatkowego potwierdzenia.',
  'table.risk.booted': '{booted}: zapis wymaga dodatkowego potwierdzenia.',
  'table.risk.recovery': '{bank}: zapis wymaga dodatkowego potwierdzenia.',
  'table.risk.bootUnnamed':
    'Kamera nie podaje, z którego slotu się uruchamia: zapis wymaga dodatkowego potwierdzenia.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Łatka liczby klatek nałożona: ten obraz działa z {hz} Hz.',
  'fps.earlierPatch':
    'Łatka liczby klatek niedostępna: ten slot zawiera wcześniejszą łatkę {hz} Hz bez poprawki USB. Przywróć oryginalny obraz, a potem użyj „Ustaw {hz} FPS”.',
  'fps.atRate': 'Łatka liczby klatek niepotrzebna: ta kompilacja już działa z {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Łatka liczby klatek niedostępna: {reason}',
  'fps.readFirst':
    'najpierw odczytaj sloty — łatka jest planowana na podstawie obrazu samego slotu',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Wszystkie sloty',
  'everyBank.make': 'Ustaw {hz} FPS we wszystkich slotach',
  'everyBank.faster': 'Przyspiesz wszystkie sloty',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Łata {order} w ramach jednego potwierdzenia; każdy slot jest najpierw zachowywany w jednym pliku zip do pobrania, a po zapisie odczytywany kontrolnie.',
  'everyBank.noteBootedLast':
    'Łata {order} w ramach jednego potwierdzenia, a slot, z którego kamera teraz się uruchamia, na końcu; każdy slot jest najpierw zachowywany w jednym pliku zip do pobrania, a po zapisie odczytywany kontrolnie.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': 'obraz {bank:gen}',
  'what.restore': '{bank} z pliku {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Zapis przygotowany dla {bank:gen} pod adresem {address}',
  'preview.file': 'Plik',
  'preview.source': 'Źródło obrazu',
  'preview.target': 'Cel',
  'preview.targetEmpty':
    '{bank} jest pusty: nie zawiera obrazu, więc ten zapis nie nadpisze żadnego firmware',
  'preview.readAs': 'Odczytano jako',
  'preview.readAs.ff': 'odszyfrowany obraz {version} FF',
  'preview.readAs.plain': 'odszyfrowany obraz',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'surowe bajty',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Forma przesyłania',
  'preview.key': 'Klucz',
  'preview.payload': 'Przesyłane dane',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} B w {count} porcji po maks. {chunk} B',
    few: '{size} B w {count} porcjach po maks. {chunk} B',
    many: '{size} B w {count} porcjach po maks. {chunk} B',
    other: '{size} B w {count} porcji po maks. {chunk} B',
  },
  'preview.checksum': 'Suma kontrolna transmisji',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Zawartość po zapisie',
  'preview.storedNotPredicted': 'nieprzewidywana — sprawdzeniem jest odczyt kontrolny',
  'preview.storedPredicted': 'przewidywane {size} B',
  'preview.storedKeyB': 'przewidywane {size} B — obraz XOR klucz B, a nie same przesyłane dane',
  'preview.savedFirst': 'Kopia przed zapisem',
  'preview.compareCaption': 'Co się zmieni w {bank:loc}',
  'preview.col.field': 'Pole',
  'preview.col.now': 'Teraz',
  'preview.col.after': 'Po zapisie',
  'preview.readFirst': 'Przeczytaj przed zapisem:',
  /* {note} is core's note about this write. */
  'preview.note': 'Uwaga: {note}',
  'preview.nothingSent':
    'Do kamery nic jeszcze nie zostało wysłane. Zapis prześle te dane do {bank:gen} i je zatwierdzi.',
  'preview.toolbar': 'Działania zapisu dla {bank:gen}',
  'preview.write': 'Zapisz w {bank:loc}…',
  'preview.discard': 'Odrzuć',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Zapisać {what} w {bank:loc} pod adresem {address}?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Zapis zastąpi firmware, który kamera teraz uruchamia. Jeśli nowy obraz nie zadziała, kamera może w ogóle się nie uruchomić.',
  'writeConfirm.recovery':
    '{bank} to slot odzyskiwania, ostatnia kopia awaryjna, do której wraca bootloader. Po zapisie kamera nie będzie miała tej kopii, dopóki nie zostanie ona przywrócona.',
  'writeConfirm.bootUnnamed':
    'Kamera nie podaje, z którego slotu się uruchamia, więc {bank} jest traktowany jako slot, z którego uruchamia się teraz. Zapis może zastąpić firmware, który kamera uruchamia.',
  'writeConfirm.empty':
    '{bank} jest pusty: nie zawiera obrazu, więc żaden firmware nie zostanie nadpisany.',
  'writeConfirm.eraseEmpty':
    'Zapis mimo to wymaże blok 64 KB pamięci flash kamery w {bank:loc} (już pusty) i zaprogramuje go od nowa.',
  'writeConfirm.erase':
    'To wymaże blok 64 KB pamięci flash kamery w {bank:loc} i zaprogramuje go od nowa.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'Obraz zostanie zapisany z kluczem: {key}. Każdy inny slot jest zapisywany tak samo.',
  'writeConfirm.backup':
    'Zanim cokolwiek zostanie wysłane, {bank} zostanie ponownie odczytany i zachowany jako jeden plik zip do pobrania: {file}. Sprawdź, czy jest w folderze pobranych plików.',
  'writeConfirm.noReset':
    'Reset nie jest wysyłany. Potem odłącz kamerę i podłącz ją ponownie, aby slot zaczął obowiązywać.',
  'writeConfirm.noUsbRecovery':
    'Jeśli obraz nie zadziała, kamery nie da się przywrócić przez USB — tylko przez SWD/J-Link lub programatorem SPI.',
  'writeConfirm.ackUnnamed':
    'Rozumiem, że kamera nie podaje, z którego slotu się uruchamia, więc ten slot jest traktowany jako uruchomiony, i że wadliwy obraz może sprawić, że kamera przestanie się uruchamiać.',
  'writeConfirm.confirm': 'Tak — zapisz w {bank:loc}',
  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Rozumiem, że z tego slotu kamera teraz się uruchamia i że wadliwy obraz może sprawić, że kamera przestanie się uruchamiać.',
  'ack.recovery':
    'Rozumiem, że to slot odzyskiwania i że wadliwy obraz pozostawi kamerę bez ostatniej kopii awaryjnej.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Przełączyć {bank} na {hz} FPS?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted': '{bootsNow}. Załatany obraz zastąpi firmware, który kamera teraz uruchamia.',
  'fpsConfirm.recovery':
    '{bank} to slot odzyskiwania, ostatnia kopia awaryjna, do której wraca bootloader.',
  'fpsConfirm.what':
    '{bank} zawiera firmware {version}, a ta zmiana sprawi, że jego obraz będzie działać z {toHz} Hz zamiast {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(nieznany)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'Łatka zmienia {count} bajt obrazu i słowo sumy kontrolnej, więc suma sprawdzana przez bootloader pozostaje zachowana. Para kluczy nie jest zmieniana.',
    few: 'Łatka zmienia {count} bajty obrazu i słowo sumy kontrolnej, więc suma sprawdzana przez bootloader pozostaje zachowana. Para kluczy nie jest zmieniana.',
    many: 'Łatka zmienia {count} bajtów obrazu i słowo sumy kontrolnej, więc suma sprawdzana przez bootloader pozostaje zachowana. Para kluczy nie jest zmieniana.',
    other:
      'Łatka zmienia {count} bajta obrazu i słowo sumy kontrolnej, więc suma sprawdzana przez bootloader pozostaje zachowana. Para kluczy nie jest zmieniana.',
  },
  'fpsConfirm.wayBack':
    'Odszyfrowany plik w tym pliku zip pozwala wrócić do poprzedniego stanu: aby cofnąć łatkę, zapisz go w {bank:loc} przyciskiem „Zapisz odszyfrowany obraz”.',
  'fpsConfirm.noReset':
    'Reset nie jest wysyłany. Potem odłącz kamerę i podłącz ją ponownie, aby załatany slot zaczął obowiązywać.',
  'fpsConfirm.ackUnnamed':
    'Rozumiem, że kamera nie podaje, z którego slotu się uruchamia, więc ten slot jest traktowany jako uruchomiony.',
  'fpsConfirm.confirm': 'Tak — załataj {bank}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Przełączyć wszystkie sloty na {hz} FPS?',
  'fpsEvery.titleMixed': {
    one: 'Zmienić liczbę klatek w {count} slocie?',
    few: 'Zmienić liczbę klatek w {count} slotach?',
    many: 'Zmienić liczbę klatek w {count} slotach?',
    other: 'Zmienić liczbę klatek w {count} slotu?',
  },
  'fpsEvery.intro': {
    one: 'Łatka obejmie {count} slot, dla którego jest dostępna (firmware {version}):',
    few: 'Łatka obejmie {count} sloty, dla których jest dostępna (firmware {version}):',
    many: 'Łatka obejmie {count} slotów, dla których jest dostępna (firmware {version}):',
    other: 'Łatka obejmie {count} slotu, dla których jest dostępna (firmware {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (slot, z którego kamera teraz się uruchamia, a zarazem slot odzyskiwania)',
  'fpsEvery.role.booted': '{bank} (slot, z którego kamera teraz się uruchamia)',
  'fpsEvery.role.recovery': '{bank} (slot odzyskiwania, ostatnia kopia awaryjna)',
  'fpsEvery.role.bootUnnamed': '{bank} (kamera nie podaje, z którego slotu się uruchamia)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: z {fromHz} Hz na {toHz} Hz, {count} bajt i słowo sumy kontrolnej.',
    few: '{bank}: z {fromHz} Hz na {toHz} Hz, {count} bajty i słowo sumy kontrolnej.',
    many: '{bank}: z {fromHz} Hz na {toHz} Hz, {count} bajtów i słowo sumy kontrolnej.',
    other: '{bank}: z {fromHz} Hz na {toHz} Hz, {count} bajta i słowo sumy kontrolnej.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Bez zmian: {others}',
  'fpsEvery.orderOne': 'Zapisuje tylko {bank} i odczytuje go kontrolnie.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Kolejność zapisu: {order}. Każdy slot jest odczytywany kontrolnie przed następnym, a pierwszy błąd zatrzymuje pozostałe.',
  'fpsEvery.orderBootedLast':
    'Kolejność zapisu: {order}. Slot, z którego kamera teraz się uruchamia, jest ostatni, więc błąd zatrzyma zapis przed nim. Każdy slot jest odczytywany kontrolnie przed następnym, a pierwszy błąd zatrzymuje pozostałe.',
  'fpsEvery.wayBack':
    'Odszyfrowane pliki w tym pliku zip pozwalają wrócić do poprzedniego stanu: aby cofnąć łatkę slotu, zapisz jego plik przyciskiem „Zapisz odszyfrowany obraz” na ten slot.',
  'fpsEvery.noReset':
    'Reset nie jest wysyłany. Potem odłącz kamerę i podłącz ją ponownie, aby załatane sloty zaczęły obowiązywać.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Rozumiem, że zapis obejmie {banks} i że wadliwy obraz może sprawić, że kamera przestanie się uruchamiać.',
  'fpsEvery.confirm': {
    one: 'Tak — załataj {count} slot',
    few: 'Tak — załataj {count} sloty',
    many: 'Tak — załataj {count} slotów',
    other: 'Tak — załataj {count} slotu',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: odczyt kontrolny zgadza się z zapisem.',
  'outcome.mismatch': '{bank} — {what}: odczyt kontrolny NIE zgadza się z tym, co zapisano.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: odczyt kontrolny wykonano, ale go nie porównano, więc ten zapis nie jest tu zweryfikowany.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'Zatwierdzenie w kamerze zwróciło stan {status}.',
  'outcome.wasEmpty':
    '{bank} był pusty przed tym zapisem, więc żaden firmware nie został nadpisany.',
  'outcome.provenVerified':
    'Dotąd udowodniono: dane zostały przesłane i zatwierdzone, a odczyt kontrolny zgadza się z zapisem. NIE udowodniono: że bootloader wybierze ten slot ani że obraz działa.',
  'outcome.provenCommitted':
    'Dotąd udowodniono: dane zostały przesłane i zatwierdzone. NIE udowodniono: że bootloader wybierze ten slot ani że obraz działa.',
  'outcome.replug':
    '**TERAZ ODŁĄCZ KAMERĘ I PODŁĄCZ JĄ PONOWNIE.** Reset nie został wysłany, więc slot zacznie obowiązywać dopiero po prawdziwym wyłączeniu i ponownym włączeniu zasilania. Potem odczytaj sloty ponownie: rozstrzygają to tylko wersja i aktywny slot, które poda kamera.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**TERAZ ODŁĄCZ KAMERĘ I PODŁĄCZ JĄ PONOWNIE.** Reset nie został wysłany. Potem odczytaj sloty ponownie.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Najpierw zachowano jako plik do pobrania: {file}.',
  'outcome.wayBackOne':
    'Odszyfrowany plik w środku pozwala wrócić do poprzedniego stanu („Zapisz odszyfrowany obraz” na ten sam slot).',
  'outcome.wayBackMany':
    'Odszyfrowane pliki w środku pozwalają wrócić do poprzedniego stanu („Zapisz odszyfrowany obraz” na każdy slot).',
  'outcome.checkDownloads': 'Sprawdź, czy jest w folderze pobranych plików.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank} — załatano z {fromHz} Hz na {toHz} Hz (firmware {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'Odczyt kontrolny różni się od zachowanego zrzutu tylko w {count} zaplanowanym bajcie, w miejscach łatki i w słowie sumy.',
    few: 'Odczyt kontrolny różni się od zachowanego zrzutu tylko w {count} zaplanowanych bajtach, w miejscach łatki i w słowie sumy.',
    many: 'Odczyt kontrolny różni się od zachowanego zrzutu tylko w {count} zaplanowanych bajtach, w miejscach łatki i w słowie sumy.',
    other:
      'Odczyt kontrolny różni się od zachowanego zrzutu tylko w {count} zaplanowanego bajta, w miejscach łatki i w słowie sumy.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'Odczyt kontrolny NIE różni się tylko w zaplanowany sposób: nieoczekiwane bajty: {unexpected}, brakujące bajty: {count}.',
    few: 'Odczyt kontrolny NIE różni się tylko w zaplanowany sposób: nieoczekiwane bajty: {unexpected}, brakujące bajty: {count}.',
    many: 'Odczyt kontrolny NIE różni się tylko w zaplanowany sposób: nieoczekiwane bajty: {unexpected}, brakujące bajty: {count}.',
    other:
      'Odczyt kontrolny NIE różni się tylko w zaplanowany sposób: nieoczekiwane bajty: {unexpected}, brakujące bajty: {count}.',
  },
  'fpsOutcome.notTaken': 'Odczytu kontrolnego nie wykonano, więc łatka nie jest tu sprawdzona.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Wszystkie sloty: załatano {done} z {count}, w tej kolejności: {order}.',
    few: 'Wszystkie sloty: załatano {done} z {count}, w tej kolejności: {order}.',
    many: 'Wszystkie sloty: załatano {done} z {count}, w tej kolejności: {order}.',
    other: 'Wszystkie sloty: załatano {done} z {count}, w tej kolejności: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'Odczyt kontrolny różni się od zachowanego slotu tylko w {count} zaplanowanym bajcie.',
    few: 'Odczyt kontrolny różni się od zachowanego slotu tylko w {count} zaplanowanych bajtach.',
    many: 'Odczyt kontrolny różni się od zachowanego slotu tylko w {count} zaplanowanych bajtach.',
    other: 'Odczyt kontrolny różni się od zachowanego slotu tylko w {count} zaplanowanego bajta.',
  },
  'fpsEveryOutcome.notTaken': 'Odczytu kontrolnego nie wykonano.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Zatrzymano: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Nie zapisano {banks:gen}.',
  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Żadnego slotu tej kamery nie można stąd zapisać.',
  'keys.title': 'Klucze używane przy zapisie',
  'keys.chain': 'Łańcuch',
  'keys.chainPlain':
    'łańcuch jawnego tekstu z 2014 roku: każdy slot jest przechowywany jawnie, więc żaden nie zawiera klucza',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Zapisywany jako',
  'keys.writtenPlain': 'obraz bez zmian, bez klucza, na dowolny slot',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Przesyłany jako',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Przechowywany jako',
  'keys.refused': 'Odmowa',
  'keys.bootedBank': 'Uruchomiony slot',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank} zawiera {key}',
  'keys.theBootedBank': 'uruchomiony slot',
  'keys.unnamedKey': 'klucz, którego strona nie potrafi nazwać',
  'keys.bootedBanksKey': 'klucz uruchomionego slotu',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; każdy slot jest zapisywany tak samo',

  /* "What these buttons do", below the tab. */
  'how.title': 'Co robią te przyciski',
  'how.read': '**Odczytaj sloty** i **Zrzuć** niczego w kamerze nie zmieniają.',
  'how.flash':
    '**Zapisz odszyfrowany obraz** przyjmuje obraz w postaci jawnej, szyfruje go tak, jak wymaga firmware danego slotu, zanim zostanie przesłany, i pokazuje plan. **Zapisz surowe bajty** przesyła plik dokładnie w takiej postaci, w jakiej go podano. Żaden z nich niczego nie wysyła, dopóki nie potwierdzisz.',
  'how.ff':
    'Zapis do slotu {letterR} wymaga dodatkowego potwierdzenia, jak każdy zapis do slotu odzyskiwania. **Pusty** slot (jego okno nagłówka odczytuje się jako same 0xFF, jak {b} w wielu kamerach z 2014 roku) to stan, a nie usterka. Zapisuje się go dokładnie tak jak każdy inny slot.',
  'how.copy':
    '**Przywróć z pełnej kopii pamięci flash** przyjmuje plik .bin (cały 4 MB obraz pamięci flash, na przykład odczyt przez J-Link) lub plik .zip, który go zawiera (plik przebiegu Preserve albo zip zapisany przez „Zrzut i odszyfrowanie 4.x/Nano” lub „Zrzuć wszystkie selektory”), wycina z niego ten slot, odszyfrowuje go i pokazuje plan; jeśli kopia wygląda na pochodzącą z innej kamery albo z innego firmware, plan to podaje.',
  'how.fps':
    '**Ustaw N FPS** w wierszu slotu zmienia obraz tego slotu na wyższą liczbę klatek, a **Ustaw N FPS we wszystkich slotach** robi to w każdym slocie, dla którego łatka jest dostępna, w ramach jednego potwierdzenia, przy czym slot, z którego kamera teraz się uruchamia, jest ostatni. Dla slotu, dla którego łatka nie jest dostępna, strona podaje przyczynę.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Każdy zapis najpierw zachowuje swój slot**: slot jest odczytywany ponownie i zachowywany jako jeden plik zip do pobrania, z nazwą zawierającą czas, numer seryjny kamery, firmware, slot i rodzaj zapisu (na przykład `{example}`); zawiera on slot w postaci przechowywanej, jego odszyfrowany obraz i opis każdego pliku. Aby wrócić do poprzedniego stanu, zapisz odszyfrowany plik z archiwum przyciskiem **Zapisz odszyfrowany obraz**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Zapis wymazuje jeden 64 KB slot i programuje go od nowa. Bootloader pod `{address}` i konfiguracja startu nigdy nie są tu zapisywane, a strona nie ma żadnej opcji wyboru aktywnego slotu. Slot zaczyna obowiązywać dopiero po odłączeniu i ponownym podłączeniu kamery.',
} satisfies Translation<'slots', 'pl'>;
