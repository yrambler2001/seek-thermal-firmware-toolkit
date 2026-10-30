/**
 * Namespace `core`, Polski (pl), translated from the English source: sentences that `@seek-fw/core` makes and
 * the page shows. A key is a core message code (packages/core/src/message.ts):
 * core gives the page `{ code, params, text }`, and `coreText()`
 * (lib/core-text.ts) renders `core:<code>` with the params. English must
 * render to core's `text` word for word: i18n/core-messages.test.ts renders
 * every key here for representative inputs and compares, so the CLI and the
 * page keep saying the same thing in English. Don't reword a template here
 * without rewording core, and the other way round.
 *
 * For translators (the `core` namespace):
 * - Every value here is a sentence core also prints in English (the CLI, the
 *   logs, the copyable report). Translate the sentence; keep its `{params}`.
 * - Params that arrive ALREADY TRANSLATED (another core message, or a page word):
 *   - a bank: `{bank}`, `{name}`, `{first}`, `{second}`, `{last}`, `{target}`.
 *     Inside a sentence it is "slot A" / "recovery R" (common:bank.*InSentence);
 *     where the English starts a sentence or names a row it is the label form
 *     "Slot A" / "Recovery R". `{first}`/`{second}`/`{last}` in boot.rule may be
 *     a bare letter ("A").
 *   - a key name: `{key}`, `{held}`, `{holds}`, `{masks}` (keyName.*: "Key A",
 *     "per-device key", …; `{masks}` is several, joined with commas).
 *   - a nested sentence: `{why}`, `{reason}`, `{verdict}`, `{risk}`,
 *     `{untested}`, `{outcome}`, `{failure}`, `{answers}`, `{predicted}`,
 *     `{plain}`, `{ff}`, `{reference}`, `{recovered}`, `{check}`, `{phrase}`,
 *     `{staged}`, `{source}`, `{operation}`, `{error}`, `{label}`, `{writable}`,
 *     `{next}`, `{form}`, `{notes}`, `{remedy}`, `{capability}`, `{pair}`
 *     (report.checkKey.pair, or nothing), `{said}` (detect.source.*), `{context}`, and `{note}` in
 *     preserve.refused.recoveryOnly and identity.versionUnknown. Each is another key of
 *     this namespace (the comment above a key says which), already in your
 *     language. A `{why}` that starts a sentence arrives with a capital letter.
 *   - a list: `{banks}`, `{reasons}`, `{masks}`, `{files}`, `{sites}`, `{places}`,
 *     `{context}`, `{notes}` (joined with your common:list.* words; where the
 *     English uses a semicolon, common:list.semicolon; `{reasons}` in
 *     writeRefusal.otherFamily is detect.* sentences).
 * - Params that stay AS THEY ARE: hex values and offsets (`{word}`, `{offset}`,
 *   `{sum}`, `{hex}`, `{address}`, `{at}`, `{status}`, `{magic}`, `{length}`,
 *   `{k}`, `{zero}`, `{block}`), byte counts (`{size}`, `{count}`, `{kib}`), mode numbers (`{mode}`),
 *   a score (`{score}`), firmware versions (`{version}`, `{image}`, `{camera}`,
 *   `{firmware}`, `{builds}`, `{only}`, and `{first}` in support.* and detect.*), file
 *   names (`{file}`), a SHA-256 (`{sha256}`), a selector table's name
 *   (`{table}`) and family names (`{family}`, `{detected}`).
 * - Still English inside a translated sentence (core gives them no code yet):
 *   `{error}` when the error has no code (a USB error, a ZIP reader's error,
 *   a bug, or a refusal only a broken run file reaches, such as the patch
 *   builder's own gates), a read reason (read.reason.*'s place) that came
 *   from such an error, `{signature}` in preserve.fail.* (it describes the
 *   bytes or the wire stall; people paste it to the owner), `{reasons}` in
 *   preserve.fail.spentReaderDerive, `{note}` in preserve.gate.drainRefused,
 *   `{gap}` in restore.refused.gap*, and `{mismatch}` in
 *   slots.image.keyMismatch.
 * - Capitals: keep the English's. A template that starts lower case is said
 *   inside another sentence or after a label ("Note: …", a list item, "Not
 *   read: …"); one that starts upper case stands alone.
 * - Names stay English: command names (GetFirmwareInfo, CompleteMemoryUpgrade,
 *   BeginFirmwareUpgrade), wire ids, mode numbers, header fields
 *   (`header.length`, "CODE"), PRESERVATION.md, UNTESTED.
 *
 * Owner: phase 3 (core messages). Phase 1 put the unlock note here as the
 * first entry.
 */

import type { Translation } from '../../types';

export default {
  /** `UNLOCK_POWER_CYCLE_NOTE`; the page shows it as "Note: …." (app:unlockNote). */
  'unlock.powerCycleNote':
    'kamera pozostaje odblokowana do wyłączenia i ponownego włączenia zasilania, a do tego czasu inne narzędzia mogą ją błędnie odczytywać; zanim ich użyjesz, wyłącz ją i włącz ponownie',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': 'najpierw {first}, potem {second}, potem {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'nie został odczytany',
  'boot.verdict.checkKeyUnnamed':
    'nie mógł zostać sprawdzony: nie podano klucza, którym jego bootloader sprawdza slot',
  'boot.cfg0NotRead':
    'słowo konfiguracji startu (cfg[0]) nie zostało odczytane, więc nie wiadomo, który slot uruchomi następny start',
  'boot.select.unknown':
    'słowo konfiguracji startu ma wartość {word}, więc bootloader sprawdza najpierw {first}, ale {bank} {verdict}, więc nie wiadomo, który slot zostanie uruchomiony',
  'boot.select.first':
    'słowo konfiguracji startu ma wartość {word}, więc bootloader sprawdza najpierw {first}, a ten zawiera obraz, który bootloader przyjmuje',
  'boot.select.second':
    'słowo konfiguracji startu ma wartość {word}, więc bootloader sprawdza najpierw {first}; {first} nie zawiera obrazu, który bootloader przyjmuje, więc wybiera {second}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'słowo konfiguracji startu ma wartość {word}, więc bootloader sprawdza najpierw {first}; ani {first}, ani {second} nie zawiera obrazu, który bootloader przyjmuje, więc uruchamia {last}, którego nie sprawdza',
  'boot.select.lastTakes':
    'słowo konfiguracji startu ma wartość {word}, więc bootloader sprawdza najpierw {first}; ani {first}, ani {second} nie zawiera obrazu, który bootloader przyjmuje, więc wybiera {last}, którego nie sprawdza',
  'boot.bootsNow': '{bank} to slot, z którego kamera teraz się uruchamia',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'uruchomiony teraz',
  'boot.notBooted': 'nieuruchomiony',
  'boot.unknownWhy.checkKeyUnnamed':
    'ten odczyt nie podał klucza, którym jej bootloader sprawdza slot',
  'boot.unknownWhy.noKeyTable':
    'tabela kluczy bootloadera nie została odczytana, więc nie da się podać kluczy, które sprawdza',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'Kamera uruchamia {bank}. {why}.',
  'fpsBoot.holdsOne':
    '{bank} zawiera łatkę liczby klatek, ale ten slot nie jest uruchamiany, więc łatka nie obowiązuje.',
  'fpsBoot.holdsTwo':
    '{banks} zawierają łatki liczby klatek, ale żaden z nich nie jest uruchamiany, więc łatki nie obowiązują.',
  'fpsBoot.wouldNotRun':
    'Łatka na {target} nie sprawi, że ten slot zacznie działać, bo kamera uruchamia zamiast niego {bank}.',
  'fpsBoot.patchRunning':
    'Załataj też {bank} (slot, który działa): dopiero to sprawia, że łatka liczby klatek zaczyna obowiązywać.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank} nie może zostać tu załatany ({reason}), więc łatka liczby klatek w innym slocie nie obowiązuje w tej kamerze.',

  /* ---- backup: the zip saved before a bank write (slots/backup) ---- */
  'backup.bank.notInPlan': '{name} (nie należy do planu tej kompilacji: plik zip to odnotowuje)',
  'backup.bank.unsupported':
    '{name} (ta kompilacja nie może go odczytać, {reason}: plik zip to odnotowuje)',
  'backup.bank.empty':
    '{name} (pusty, każdy bajt to 0xFF: plik zip to odnotowuje, a zapis nie nadpisuje żadnego firmware)',
  'backup.bank.unread':
    '{name} (odczyt slotów do niego nie dotarł: plik zip odnotowuje, czy dotarł odczyt przed zapisem)',
  'backup.bank.noKey':
    '{name} (w postaci przechowywanej; żaden klucz odzyskany przez ten odczyt go nie otwiera, więc nie ma odszyfrowanego pliku)',
  'backup.bank.decrypted': '{name} (w postaci przechowywanej i odszyfrowanej)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Zanim cokolwiek zostanie zapisane, {banks} zostanie ponownie odczytany i zachowany w jednym pliku zip wraz z opisem każdego pliku: {file}.',
  'backup.plan.many':
    'Zanim cokolwiek zostanie zapisane, {banks} zostaną ponownie odczytane i zachowane w jednym pliku zip wraz z opisem każdego pliku: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'zaszyfrowane tak, aby urządzenie przechowywało je pod kluczem, który zawiera uruchomiony slot',
  'staging.detail.slotKeystreamCiphertext':
    'zaszyfrowane własnym kluczem przesyłania obrazu (blok kluczy 0); kamera przechowuje je pod własnym kluczem slotu',
  'staging.detail.plain': 'jawny tekst, bez szyfru',
  'staging.detail.keyAKeystream':
    'obraz 1.3.0.8 FF w postaci, w jakiej przesyła go aplikacja producenta (XOR klucz A) — kompilacja 16 Hz przechowuje go pod kluczem B, a nie jako te bajty',
  'staging.detail.verbatim': 'bez zmian — bajty dokładnie w podanej postaci',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'brak odczytu',
  'copy.source.notInPlan': '{name} nie należy do planu tej kompilacji',
  'copy.source.notRead':
    '{name} nie został odczytany ({reason}), więc nie ma obrazu do skopiowania',
  'copy.source.empty': '{name} jest pusty: nie ma obrazu do skopiowania',
  'copy.source.foreign':
    '{name} nie zawiera obrazu firmware rozpoznanego przez ten odczyt, więc nie ma czego kopiować',
  'copy.source.noKey':
    '{name}: żaden klucz odzyskany przez ten odczyt go nie otwiera, więc nie ma odszyfrowanego obrazu do skopiowania',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} pod adresem {address}, w postaci odszyfrowanej przez odczyt slotów',
  'copy.fromVersion':
    '{name} pod adresem {address}, firmware {version}, w postaci odszyfrowanej przez odczyt slotów',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'Obraz pochodzi ze {name:gen}, w postaci odszyfrowanej przez odczyt slotów: {size} B, sha256 {sha256}.',
  'copy.noteVersion':
    'Obraz pochodzi ze {name:gen}, w postaci odszyfrowanej przez odczyt slotów: firmware {version}, {size} B, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's Slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '{name} z kopii zapasowej (pod adresem {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where} w pełnej kopii zapasowej pamięci flash {file}',
  'restore.fromVersion':
    '{where} w pełnej kopii zapasowej pamięci flash {file}, firmware {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'obraz pamięci flash 4 MB',
  'restore.kind.preserve-run': 'plik przebiegu Preserve',
  'restore.kind.dump': 'plik zip z „Zrzut i odszyfrowanie 4.x/Nano”',
  'restore.kind.all-selectors': 'plik zip z „Zrzuć wszystkie selektory”',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'obraz',
  'restore.decryptedTo.firmware': 'firmware {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'Obraz: {where} w {file} ({kind}): sha256 w postaci przechowywanej {stored}, po odszyfrowaniu: {decrypted}, {size} B (sha256 {sha256}).',
  'restore.note.imageEntry':
    'Obraz: {where} w {file} ({kind}, plik {entry}): sha256 w postaci przechowywanej {stored}, po odszyfrowaniu: {decrypted}, {size} B (sha256 {sha256}).',
  'restore.note.readBack':
    'Po zapisie odczyt kontrolny slotu jest porównywany z bajtami slotu zapisanymi w kopii zapasowej.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'Blok tożsamości kopii zapasowej wskazuje tę kamerę (numer seryjny {serial}).',
  'restore.note.sameBytes':
    '{name} już zawiera bajty zapisane w kopii zapasowej: zapis przywraca ten sam obraz.',
  'restore.warn.otherCamera':
    'Ta kopia zapasowa wygląda na pochodzącą z innej kamery: jej blok tożsamości podaje numer seryjny {theirs}, a ta kamera ma {camera}. Zapisywany jest tylko obraz {name:gen}; nic z tożsamości ani kalibracji tamtej kamery nie jest zapisywane.',
  'restore.warn.noIdentity':
    'Ta kopia zapasowa nie ma bloku tożsamości pod adresem {address}, więc nie da się ustalić, z czyjej kamery została odczytana.',
  'restore.warn.serialNotRead':
    'Numer seryjny kamery nie został odczytany, więc nie da się dopasować do niej kopii zapasowej (numer seryjny {serial}).',
  'restore.warn.otherFirmware':
    '{where} zawiera firmware {version}, a kamera ma {camera}: przywrócenie umieści w slocie inny firmware.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank} nie został odczytany kontrolnie, więc nie jest porównywany z kopią zapasową.',
  'restore.readBack.equal':
    'Odczyt kontrolny: {bank} zgadza się bajt w bajt z zawartością kopii zapasowej.',
  'restore.readBack.differs':
    'Odczyt kontrolny: {bank} różni się od bajtów zapisanych w kopii zapasowej w {count} B (pierwsza różnica pod {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, wyprowadzony z uruchomionego {bank:gen}',
  'keys.derived.holds':
    '{key} (klucz zapisu), wyprowadzony z uruchomionego {bank:gen}, który zawiera {holds}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, wyprowadzony z uruchomionego slotu',
  'keys.derived.holdsUnnamed':
    '{key} (klucz zapisu), wyprowadzony z uruchomionego slotu, który zawiera {holds}',
  'keys.ffVendor.staged':
    'obraz 1.3.0.8 FF (16 Hz) w postaci, w jakiej przesyła go aplikacja producenta: obraz XOR jego własny blok kluczy 0 (klucz A), okno nagłówka bez zmian, na dowolny slot; klucze tej kamery nie są używane',
  'keys.ffVendor.stored':
    'Klucz B: kamera ponownie szyfruje przesłane dane blokiem kluczy 1 i pod nim przechowuje obraz',
  'keys.imageBlock0.staged':
    'obraz zaszyfrowany własnym blokiem kluczy 0 (znalezionym w obrazie po wartości), na dowolny slot; klucze tej kamery nie są używane',
  'keys.imageBlock0.storedUnnamed':
    'klucz, którym bootloader sprawdza slot (ten odczyt go nie podał); kamera ponownie szyfruje nim przesłane dane',
  'keys.imageBlock0.stored':
    '{key}, klucz, którym bootloader sprawdza slot; kamera ponownie szyfruje nim przesłane dane',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED (nieprzetestowane): z żadnej kamery nie odczytano bootloadera kompilacji 16 Hz FF, więc nie wiadomo, czy zapisany slot się uruchomi. Na bootloaderze 0.9.0.0 wcześniejsza postać tego obrazu uruchomiła się ze slotu odzyskiwania R; ta postać się nie uruchomi, bo ten bootloader uruchamia slot odzyskiwania R w postaci przechowywanej, bez dekodowania.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'Obraz 16 Hz FF jest wysyłany w postaci, którą odczytuje tylko kompilacja 16 Hz {version}. Ta kamera zapisuje slot bez sprawdzania obrazu (tak wynika z kodu źródłowego jej firmware i tak zachował się Compact 1.3.0.0 podczas próby), więc należy się spodziewać, że zapisze bajty tak, jak zostały wysłane: slot będzie wtedy zawierał obraz w postaci, której ta kamera nie potrafi uruchomić.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Nic tutaj nie twierdzi, że kamera go uruchomi.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast':
    'Odpowiedzi samej kamery mówią, że działa na niej kompilacja 16 Hz FF: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'sprawdza przesłane dane, zanim wymaże slot, a te dane przechodzą to sprawdzenie, więc może zapisać te bajty bez zmian, w postaci, której jej bootloader nie potrafi uruchomić: slot może się nie uruchomić (nie próbowano; kopia zapasowa zachowana przed zapisem go przywraca)',
  'write.ff.outcome.refuses':
    'sprawdza przesłane dane, zanim wymaże slot, a te dane nie przechodzą tego sprawdzenia, więc należy się spodziewać, że odrzuci ten zapis, zanim cokolwiek zapisze (kamera z tą kompilacją odrzuciła w ten sam sposób wcześniejszą postać tego obrazu)',
  'write.ff.runsSlow':
    'Na kamerze działa kompilacja 8 Hz {version}: {why}. Ta kompilacja {outcome}.',
  'write.ff.buildUnknown':
    'Odpowiedzi samej kamery nie mówią, która kompilacja {version} na niej działa: {why}. Jeśli działa kompilacja 16 Hz FF, przyjmie te dane. Jeśli działa kompilacja 8 Hz, ta kompilacja {outcome}.',
  'write.raw.asGiven':
    'Surowe dane: wysyłane dokładnie w podanej postaci. Nic tutaj nie sprawdza, czy da się je uruchomić.',
  'write.raw.ffStagedForm':
    'Te dane to postać przesyłania 1.3.0.8 FF (obraz XOR blok kluczy 0, suma słów 0xFFFF). Kamera przechowuje obraz pod kluczem B, więc odczyt kontrolny jest porównywany z tymi bajtami.',
  'write.raw.noStaging':
    'Ta kompilacja nie podaje postaci przesyłania dla tego slotu, więc nie da się określić sprawdzeń bootloadera.',
  'write.raw.reencrypts':
    'Urządzenie dekoduje te dane i ponownie szyfruje to, co zachowuje, więc przechowywanych bajtów nie da się przewidzieć. Odczyt kontrolny jest sprawdzany jako obraz, do którego się odszyfrowuje, tam gdzie da się to określić.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'Bootloader odrzuciłby te dane: {failure}.',
  'write.raw.stageKeyUnchecked':
    'Klucza przesyłania z 2016 roku (blok kluczy 0) nie ma w surowych bajtach, więc suma słów tych danych po odszyfrowaniu nie jest tu sprawdzana.',
  'write.image.rekeyRisk':
    '{name} już zawiera obraz, którego bootloader nie może przyjąć. Ten zapis kończy się w tym samym stanie.',
  'write.ack.recovery':
    'Slot odzyskiwania R: zapis wymaga potwierdzenia ryzyka. Nic tutaj nie sprawdza, czy kamera potem się uruchomi.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: zapis wymaga potwierdzenia ryzyka, a po następnym wyłączeniu i włączeniu kamera uruchomi to, co będzie w nim zapisane.',
  'write.ack.bootUnnamed':
    'nie udało się ustalić uruchomionego slotu, więc ten slot jest traktowany jako uruchomiony',
  'write.ack.recoveryFallback':
    'Slot odzyskiwania R to ostatnia kopia awaryjna, do której wraca bootloader',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'puste/0: najpierw slot A, potem B, potem slot odzyskiwania',
  'boot.cfg0.modernB': 'najpierw slot B, potem A, potem slot odzyskiwania',
  'boot.cfg0.modernRecovery': 'najpierw slot odzyskiwania, potem A, potem B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'nieznane — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  'upgrade.targetBooted':
    '{name} jest zarówno slotem, z którego kamera się uruchomiła, jak i slotem, który zapisuje jej własna aktualizacja. Aktualizacja uruchomiona z tej kamery nadpisałaby działający obraz. To tylko ostrzeżenie: nic tutaj nie blokuje aktualizacji.',
  /** `{verdict}` is one of upgrade.verdict.*. */
  'upgrade.whileRecovery':
    'Kamera działa ze swojego slotu odzyskiwania, a jej własna aktualizacja zapisuje {name}, którego nie uruchamia. {verdict} To tylko ostrzeżenie: nic tutaj nie blokuje aktualizacji.',
  'upgrade.verdict.notRead':
    '{name} nie dał się odczytać przy tym sprawdzeniu, więc nie wiadomo, co zawiera.',
  'upgrade.verdict.blank': '{name} jest pusty, więc aktualizacja zapisuje do pustego slotu.',
  'upgrade.verdict.bootableSame':
    '{name} zawiera ten sam uruchamialny obraz co działający slot, a aktualizacja go zastępuje; jeśli aktualizacja zatrzyma się w połowie, {name} nie będzie się dało uruchomić.',
  'upgrade.verdict.bootable':
    '{name} zawiera uruchamialny obraz, który aktualizacja zastępuje; jeśli aktualizacja zatrzyma się w połowie, {name} nie będzie się dało uruchomić.',
  'upgrade.verdict.unknown':
    '{name}: w tym odczycie nie wiadomo, czy da się go uruchomić, więc aktualizacja może zastąpić obraz, który kamera by uruchomiła.',
  'upgrade.verdict.notBootable':
    '{name} nie jest w tym odczycie oznaczony jako uruchamialny, więc aktualizacja nie zastępuje żadnego obrazu, który kamera by uruchomiła.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — slot, do którego bootloader wszedł przy tym uruchomieniu, według jego własnego zapisu',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'nie odczytano',
  'report.lastStart.noBank': 'kamera podaje {word}, co nie wskazuje żadnego slotu',
  'report.lastStart.entered': 'kamera podaje, że uruchomiła {bank} (słowo aktywnego slotu {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'brak wersji',
  'running.why.otherVersion': 'kamera podaje {version}, a dwie kompilacje ma tylko wersja {only}',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'kamera nie odpowiedziała na pytania o sloty (selektory GetFirmwareInfo 6, 7, 8)',
  'running.why.notRead':
    'slot, od którego zależą odpowiedzi, nie został odczytany, więc nie da się ich przewidzieć',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'kamera odpowiada {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers}, czyli tak, jak dla tych slotów odpowiada kompilacja 8 Hz 1.3.0.8 ({predicted})',
  'running.why.ff':
    '{answers}, czyli tak, jak dla tych slotów odpowiada kompilacja 16 Hz FF 1.3.0.8 ({predicted})',
  'running.why.both':
    '{answers}, a obie kompilacje odpowiadają dla tych slotów dokładnie tak samo, więc sloty ich nie rozróżniają',
  'running.why.neither':
    '{answers}, co nie pasuje do żadnej kompilacji (8 Hz: {plain}; 16 Hz FF: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'Nagłówek tego obrazu nie podaje wersji firmware, więc nie da się ustalić, czy to kompilacja, którą uruchamia kamera ({camera}). Sprawdź, czy to obraz, który zamierzasz zapisać.',
  'imageBuild.otherVersion': 'Ten obraz to firmware {image}; kamera ma {camera}.',
  'imageBuild.otherVersionTaken':
    'Ten obraz to firmware {image}; kamera ma {camera}. W tej linii kamera sprawdza tylko, czy obraz jest poprawnie zbudowany (nagłówek i suma słów), a nie jego wersję, więc przyjmie ten obraz, a gdy uruchomi się z tego slotu, będzie działać {image}.',
  'imageBuild.otherVersionUnchecked':
    'Ten obraz to firmware {image}; kamera ma {camera}. Nie sprawdzono, czy ta kamera przyjmie inną kompilację i ją uruchomi.',
  'imageBuild.otherBuild':
    'Ten obraz to kompilacja 8 Hz {version}; na kamerze działa kompilacja 16 Hz {version} FF. Kompilacja 16 Hz przy zatwierdzaniu sprawdza przesłane dane względem własnej postaci FF i odrzuca dane, które nie przejdą sprawdzenia, zanim wymaże slot (według jej kodu źródłowego). Zapisu kompilacji 8 Hz na taką kamerę nie próbowano.',
  'imageBuild.runningUnknown':
    'Ten obraz to kompilacja 8 Hz {version}. Kamera ma wersję {version}, która występuje jako kompilacja 8 Hz i 16 Hz FF, a jej własne odpowiedzi nie wskazały, która z nich działa, więc nie da się ustalić, czy to jej kompilacja.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': 'dane mają {size} B, za mało, aby pod 0x200 zmieścił się nagłówek',
  'bootFail.noMagic':
    'brak sygnatury obrazu pod 0x200 (znaleziono {found}, bootloader wymaga {needs})',
  'bootFail.lengthOutside': 'header.length {length} wykracza poza dane o rozmiarze {size} B',
  'bootFail.lengthNotPayload': 'header.length {length} nie jest równe długości danych {size}',
  'bootFail.overStage': '{size} B przekracza limit przesyłania {max} B',
  'bootFail.plainSum': 'zapisana suma słów {sum}, bootloader z 2014 roku wymaga 0',
  'bootFail.noFooter': 'brak stopki pod {offset}: dane kończą się pod {end}',
  'bootFail.footerNotCode':
    'stopka pod {offset} nie jest „CODE” — bootloader wybiera swój segmentowy program ładujący',
  'bootFail.footerLength': 'długość stopki nie jest równa header.length {length}',
  'bootFail.keyASum':
    'po odszyfrowaniu kluczem A tej kamery suma słów wynosi {sum}, bootloader wymaga {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'zweryfikowany sumą kontrolną',
  'keyConfidence.structural': 'zweryfikowany tylko tabelą wektorów',
  'keyConfidence.unverified': 'niezweryfikowany',
  /** `{sum}` is hex. */
  'keyCheck.family': 'klucz zweryfikowany sumą kontrolną {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'klucz {phrase}; suma kontrolna {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'z szyfrowaniem własnymi kluczami kamery',
  'staging.phrase.slotKeystreamCiphertext': 'z szyfrowaniem własnym kluczem obrazu',
  'staging.phrase.plain': 'bez szyfrowania',
  'staging.phrase.keyAKeystream':
    'w postaci, w jakiej aplikacja producenta przesyła obraz FF (XOR klucz A)',
  'staging.phrase.verbatim': 'bez zmian',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank (label form); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    'zatwierdzono {size} B na {name} pod adresem {address}, {staged}; stan zatwierdzenia {status}',
  'written.noReadWindow':
    'ta kompilacja nie podaje okna odczytu dla tego slotu, więc nic nie zostało odczytane kontrolnie',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'odczyt kontrolny nie powiódł się: {error}',
  'written.readBack': 'odczyt kontrolny: {size} B, SHA-256 {sha256}',
  'written.verifyOff': 'weryfikacja jest wyłączona: slot nie został odczytany kontrolnie',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'bajty, które według planu miał zawierać slot (obraz w postaci przechowywanej przez kompilację 16 Hz, a nie wysłane bajty)',
  'readBack.reference.asSent':
    'bajty, które według planu miał zawierać slot (bajty w postaci, w jakiej zostały wysłane)',
  'readBack.sizeDiffers':
    'odczyt kontrolny ma {size} B, plan przewidywał {predictedSize} B: slot NIE zgadza się z tym, czego oczekiwano — {reference}',
  'readBack.matchesFolded':
    'slot zawiera obraz w postaci przechowywanej przez kompilację 16 Hz (a nie wysłane bajty), a reszta slotu jest wymazana',
  'readBack.matches':
    'slot zgadza się z bajtami przewidzianymi w planie (łańcuch jawnego tekstu z 2014 roku programuje dokładnie to, co otrzymuje)',
  'readBack.differs':
    'slot NIE zgadza się z tym, czego oczekiwano — {reference} (pierwsza różnica pod {offset})',
  'readBack.noHeader':
    'odczyt kontrolny nie zawiera nagłówka obrazu pod {offset} (sygnatura {magic}), więc slot NIE odszyfrowuje się do oczekiwanego obrazu',
  'readBack.lengthDiffers':
    'nagłówek odczytu kontrolnego podaje {length} B, a obraz z planu ma {imageLength} B: slot NIE odszyfrowuje się do oczekiwanego obrazu',
  'readBack.tooShort':
    'odczyt kontrolny ma {size} B, za mało na obraz o rozmiarze {length} B: slot NIE odszyfrowuje się do oczekiwanego obrazu',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'strumień klucza odtworzony z odczytu kontrolnego ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts':
    'slot odszyfrowuje się do oczekiwanego obrazu ({length} B) przy użyciu: {recovered}',
  'readBack.decryptDiffers':
    'slot NIE odszyfrowuje się do oczekiwanego obrazu: pierwsza różnica pod przesunięciem {offset} w obrazie przy użyciu: {recovered}',
  'readBack.rawNotCompared':
    'surowe bajty: odczyt kontrolny podany, nieporównany (w tej postaci bajty nie odszyfrowują się do przewidywalnego obrazu jawnego, a urządzenie ponownie szyfruje to, co zachowuje)',
  'readBack.notCompared':
    'porównanie nie było możliwe: plan nie przewiduje ani przechowywanych bajtów, ani obrazu jawnego',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'klucz A',
  'keyName.keyA:gen': 'klucza A',
  'keyName.keyA:dat': 'kluczowi A',
  'keyName.keyA:acc': 'klucz A',
  'keyName.keyA:ins': 'kluczem A',
  'keyName.keyA:loc': 'kluczu A',
  'keyName.keyB': 'klucz B',
  'keyName.keyB:gen': 'klucza B',
  'keyName.keyB:dat': 'kluczowi B',
  'keyName.keyB:acc': 'klucz B',
  'keyName.keyB:ins': 'kluczem B',
  'keyName.keyB:loc': 'kluczu B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'klucz urządzenia',
  'keyName.perDevice:gen': 'klucza urządzenia',
  'keyName.perDevice:dat': 'kluczowi urządzenia',
  'keyName.perDevice:acc': 'klucz urządzenia',
  'keyName.perDevice:ins': 'kluczem urządzenia',
  'keyName.perDevice:loc': 'kluczu urządzenia',
  'keyName.thePerDevice': 'klucz urządzenia',
  'keyName.thePerDevice:gen': 'klucza urządzenia',
  'keyName.thePerDevice:dat': 'kluczowi urządzenia',
  'keyName.thePerDevice:acc': 'klucz urządzenia',
  'keyName.thePerDevice:ins': 'kluczem urządzenia',
  'keyName.thePerDevice:loc': 'kluczu urządzenia',
  'keyName.applicationKeyA': 'klucz A aplikacji',
  'keyName.applicationKeyA:gen': 'klucza A aplikacji',
  'keyName.applicationKeyA:dat': 'kluczowi A aplikacji',
  'keyName.applicationKeyA:acc': 'klucz A aplikacji',
  'keyName.applicationKeyA:ins': 'kluczem A aplikacji',
  'keyName.applicationKeyA:loc': 'kluczu A aplikacji',
  'keyName.applicationKeyB': 'klucz B aplikacji',
  'keyName.applicationKeyB:gen': 'klucza B aplikacji',
  'keyName.applicationKeyB:dat': 'kluczowi B aplikacji',
  'keyName.applicationKeyB:acc': 'klucz B aplikacji',
  'keyName.applicationKeyB:ins': 'kluczem B aplikacji',
  'keyName.applicationKeyB:loc': 'kluczu B aplikacji',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'blok kluczy 1',
  'keyName.block1:gen': 'bloku kluczy 1',
  'keyName.block1:dat': 'blokowi kluczy 1',
  'keyName.block1:acc': 'blok kluczy 1',
  'keyName.block1:ins': 'blokiem kluczy 1',
  'keyName.block1:loc': 'bloku kluczy 1',
  'keyName.theDeviceKey': 'klucz urządzenia',
  'keyName.theDeviceKey:gen': 'klucza urządzenia',
  'keyName.theDeviceKey:dat': 'kluczowi urządzenia',
  'keyName.theDeviceKey:acc': 'klucz urządzenia',
  'keyName.theDeviceKey:ins': 'kluczem urządzenia',
  'keyName.theDeviceKey:loc': 'kluczu urządzenia',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'nieznany klucz',
  'keyName.unknown:gen': 'nieznanego klucza',
  'keyName.unknown:dat': 'nieznanemu kluczowi',
  'keyName.unknown:acc': 'nieznany klucz',
  'keyName.unknown:ins': 'nieznanym kluczem',
  'keyName.unknown:loc': 'nieznanym kluczu',
  'keys.noKnownKey': 'brak znanego klucza',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'łańcuch jawnego tekstu z 2014 roku: każdy slot jest przechowywany jawnie, więc nie jest wyprowadzany żaden klucz przesyłania; przesyłane dane to obraz bez zmian',
  'keys.evidence.ffVendor':
    'kompilacja 1.3.0.8 FF (16 Hz): żaden slot otwarty przez ten odczyt nie jest przechowywany jawnie, więc nie wykazano, że kamera należy do łańcucha jawnego tekstu z 2014 roku; obraz FF jest zapisywany w postaci producenta, surowe bajty są wysyłane bez zmian, a jawny obraz 8 Hz nie jest zapisywany',
  'keys.evidence.ffUntested':
    'zapis obrazu FF jest dostępny z ostrzeżeniem UNTESTED (nieprzetestowane): w zbiorze nie ma prawdziwego bootloadera tej kompilacji, więc nie zmierzono, czy zapisany slot się uruchamia',
  'keys.evidence.line2016':
    'linia Compact PRO z 2016 roku: przesyłane dane to obraz XOR strumień klucza jego własnego bloku kluczy 0, znalezionego w obrazie po wartości, więc nie tworzy ich żaden klucz tej kamery',
  'keys.evidence.checkKeyUnnamed':
    'kamera odszyfrowuje przesłane dane tym kluczem i ponownie szyfruje je kluczem, którym jej bootloader sprawdza slot; ten odczyt nie podał tego klucza, a zapis go nie potrzebuje: slot jest odczytywany kontrolnie jako obraz, do którego się odszyfrowuje',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'kamera odszyfrowuje przesłane dane tym kluczem i ponownie szyfruje je kluczem, którym jej bootloader sprawdza slot; ten odczyt nie podał tego klucza ({why}), a zapis go nie potrzebuje: slot jest odczytywany kontrolnie jako obraz, do którego się odszyfrowuje',
  'keys.evidence.checkKeyNamed':
    'kamera odszyfrowuje przesłane dane tym kluczem i ponownie szyfruje je kluczem, którym jej bootloader sprawdza slot — {key} {hex} — więc każdy zapisany przez nią slot jest przechowywany tak, jak przyjmuje go bootloader',
  'keys.evidence.checkKeyInferred':
    'kamera odszyfrowuje przesłane dane tym kluczem i ponownie szyfruje je {key:ins} {hex}, kluczem, którym jej bootloader sprawdza slot (wywnioskowanym ze {bank:gen}, slotu, który według kamery uruchomiła, a do którego bootloader wszedł bez sprawdzenia), więc każdy zapisany przez nią slot jest przechowywany tak, jak przyjmuje go bootloader',
  'keys.evidence.checkKeyNamedFrom':
    'kamera odszyfrowuje przesłane dane tym kluczem i ponownie szyfruje je {key:ins} {hex}, kluczem, którym jej bootloader sprawdza slot (wskazanym na podstawie {bank:gen}, slotu, który według kamery uruchomiła), więc każdy zapisany przez nią slot jest przechowywany tak, jak przyjmuje go bootloader',
  /** `{source}` is keys.source.*. */
  'keys.evidence.applicationKeyA':
    'działająca aplikacja ({bank}, firmware {firmware}) zawiera swój klucz A {keyA} pod {keyAAt} (źródło: {source})',
  'keys.evidence.applicationKeys':
    'działająca aplikacja ({bank}, firmware {firmware}) zawiera swój klucz A {keyA} pod {keyAAt} (źródło: {source}) i swój klucz B {keyB} pod {keyBAt}',
  'keys.source.keyTable': 'tabela kluczy bootloadera',
  /** `{builds}`: firmware versions. */
  'keys.source.applicationPair': 'zdekodowana para kluczy aplikacji z {builds}',
  'keys.evidence.perDevice':
    'klucz urządzenia jest zaprogramowany, więc aplikacja ponownie szyfruje nim dane',
  'keys.evidence.noPerDevice':
    'klucz urządzenia nie jest zaprogramowany, więc aplikacja ponownie szyfruje dane własnym kluczem B',
  'keys.evidence.storeKey':
    'klucz zapisu aplikacji to {key} bootloadera ({hex}), więc zapisy przechowują pod nim każdy slot; uruchomiony {bank} zawiera {held}, który bootloader również akceptuje',
  'keys.evidence.bootedKey':
    'uruchomiony {bank} odszyfrowuje się {key:ins} ({hex}), kluczem, który sprawdza bootloader; klucz zapisu aplikacji nie jest kluczem bootloadera, więc zapisy przechowują każdy slot pod kluczem uruchomionego slotu',
  /** `{masks}`: key names joined with commas. */
  'keys.evidence.masks':
    'przesyłane dane to obraz XOR strumienie {masks:gen}; urządzenie przechowuje obraz pod {key:ins}',
  /** `{held}` is a key name or keys.noKnownKey. */
  'keys.evidence.otherBank':
    '{bank} odszyfrowuje się {held:ins}; według tej samej zasady jest zapisywany pod {key:ins} i odczytywany kontrolnie',
  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'nie udało się ustalić uruchomionego slotu, więc nie da się z niego odczytać klucza, pod którym slot jest przechowywany',
  'keys.refused.notDerived': 'nie udało się wyprowadzić kluczy',
  'keys.refused.notDecrypted':
    'uruchomiony {bank} nie odszyfrowuje się do obrazu, więc nie da się odczytać klucza, pod którym jest przechowywany',
  'keys.refused.noBootKey':
    'uruchomiony {bank} nie odszyfrowuje się żadnym kluczem, który sprawdza bootloader (jego kluczem A ani kluczem zapisu), więc nie da się z niego odczytać klucza, pod którym slot jest przechowywany',
  'keys.refused.keyNotInTable':
    'uruchomiony {bank} odszyfrowuje się {key:ins}, ale tabela kluczy tej kamery nie zawiera tego klucza, więc nie da się pod nim zapisać',
  'keys.refused.noApplicationPair':
    'działająca aplikacja ({bank}, firmware {firmware}) nie zawiera żadnej ze znanych par kluczy (pary bootloadera ani zdekodowanych par aplikacji) z każdą połową dokładnie raz, więc nie da się zlokalizować jej klucza A w jej obrazie',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'działająca aplikacja ({bank}, firmware {firmware}) nie zawiera żadnej ze znanych par kluczy (pary bootloadera ani zdekodowanych par aplikacji) z każdą połową dokładnie raz, więc nie da się zlokalizować jej klucza A w jej obrazie (klucz A bootloadera występuje {count} raz, jego klucz B — {keyB})',
    few: 'działająca aplikacja ({bank}, firmware {firmware}) nie zawiera żadnej ze znanych par kluczy (pary bootloadera ani zdekodowanych par aplikacji) z każdą połową dokładnie raz, więc nie da się zlokalizować jej klucza A w jej obrazie (klucz A bootloadera występuje {count} razy, jego klucz B — {keyB})',
    many: 'działająca aplikacja ({bank}, firmware {firmware}) nie zawiera żadnej ze znanych par kluczy (pary bootloadera ani zdekodowanych par aplikacji) z każdą połową dokładnie raz, więc nie da się zlokalizować jej klucza A w jej obrazie (klucz A bootloadera występuje {count} razy, jego klucz B — {keyB})',
    other:
      'działająca aplikacja ({bank}, firmware {firmware}) nie zawiera żadnej ze znanych par kluczy (pary bootloadera ani zdekodowanych par aplikacji) z każdą połową dokładnie raz, więc nie da się zlokalizować jej klucza A w jej obrazie (klucz A bootloadera występuje {count} raza, jego klucz B — {keyB})',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'działająca aplikacja ({bank}, firmware {firmware}) sprawdza przesłane dane własnymi kluczami, zanim je zaprogramuje (zdekodowany kod źródłowy tej kompilacji sprawdza je jej kluczem A i kluczem zapisu, tak jak bootloader sprawdza slot), a klucz, pod którym przechowują zapisy, {key} ({hex}), nie jest ani jej kluczem A, ani kluczem zapisu, więc kamera odrzuciłaby przesłane dane ze stanem 0x50000, zanim cokolwiek wymaże',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'żaden slot nie odszyfrowuje się do sumy kontrolnej {sum} rodziny {family}',
  'writeRefusal.keyTable': 'nie udało się potwierdzić tabeli kluczy tej kamery',
  'writeRefusal.whitening':
    'tabela kluczy tej kamery rozwiązuje się przy K={k}, ale {family} szyfruje przy K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily':
    'dowody wskazują, że ta kamera to {detected}, a nie {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'tej kamery nie można stąd zapisać: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Kompilacje Seek z 2018 roku i nowsze (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 i Nano 300. Zrzut odczytuje 63 z 64 bloków pamięci flash bez odblokowywania czegokolwiek; w tych kompilacjach żaden odczyt nie sięga bloku pod {block}. Firmware jest przechowywany w postaci zaszyfrowanej. Sloty są zapisywane pojedynczo na karcie „Sloty firmware”.',
  'family.summary.early':
    'Kamery Compact z 2014 roku starsze niż 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 i 0.7.0.8. Ich firmware nie potrafi odpowiedzieć na odczyt wysyłany przez zrzut, więc „Zrzut”, „Zrzuć wszystkie selektory”, pełny odczyt na karcie „Info” i karta „Sloty firmware” odrzucają je po odczytaniu wersji; w 0.3.0.1 polecenie, od którego zaczyna się zrzut, zamiast tego przygotowałoby aktualizację firmware. Przebieg Preserve odczytuje 0.7.0.7 i 0.7.0.8 innym poleceniem, na które te dwie kompilacje odpowiadają. Zrzut wykonany w inny sposób odszyfrowuje się normalnie.',
  'family.summary.compact2016':
    'Kompilacje Compact PRO 1.0.3.x (1.0.3.0 i 1.0.3.2). Odpowiadają na odczyty dokładnie tak jak kamery Compact z 2014 roku, łącznie z tokenem odblokowania, więc rozróżnia się je po wersji i po sposobie przechowywania slotów: w postaci zaszyfrowanej, podczas gdy sloty z 2014 roku są jawne. Kamera 1.0.3.x jest od początku odczytywana jako ta rodzina. Przebieg Preserve odczytuje całą pamięć flash, a sloty są zapisywane pojedynczo na karcie „Sloty firmware”.',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    'Kamery Compact z 2014 roku od 0.8.0.0 do 1.3.0.8, w tym kompilacja 1.3.0.8 FF 16 Hz. Kamera w oryginalnym stanie udostępnia mniej niż połowę pamięci flash, część z niej tylko po wysłaniu przez toolkit tokenu odblokowania; przebieg Preserve odczytuje resztę za pomocą tymczasowej łatki. Sloty są przechowywane jawnie, z wyjątkiem kompilacji FF. Kamera Compact PRO 1.0.3.x jest odczytywana jako compact-2016 i trafia tutaj tylko wtedy, gdy slot jest przechowywany jawnie lub odszyfrowuje się do {sum}, tak jak sloty kompilacji FF. Sloty są zapisywane na karcie „Sloty firmware” w kompilacjach, na których zmierzono przebieg Preserve; każda inna kompilacja 0.x lub 1.x jest tylko odczytywana.',
  'family.summary.generic':
    'Kamera, do której nie pasuje żadna inna rodzina. `seek-fw dump` odczytuje ją listą bloków 4.x (karta 4.x/Nano ją odrzuca), a odszyfrowanie wyznacza klucz z samego obrazu, więc żadne z nich nie zależy od tego przypuszczenia. Żaden slot nie jest zapisywany: karta „Sloty firmware” odrzuca kamerę, dopóki nie zostanie rozpoznana.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'nagłówek obrazu podaje',
  'detect.source.camera': 'kamera podaje',
  'detect.plainArmedNotInForce':
    'zwykłe 2-bajtowe BeginFirmwareUpgrade aktywowało chroniony slot, więc uwierzytelniony kanał odczytu nie obowiązuje',
  'detect.modern.plainRefused':
    'zwykłe 2-bajtowe BeginFirmwareUpgrade chronionego slotu zostało ODRZUCONE, czego nie robi żadna kompilacja tej linii — jej procedura obsługi nie sprawdza tokenu i przyjmuje zwykły kanał dla każdego slotu',
  'detect.modern.authArmed':
    'chroniony slot został aktywowany 18-bajtowym uwierzytelnionym selektorem; nic nie próbowało tam zwykłego, więc to nie wyklucza tej kamery z tej linii',
  'detect.modern.legacyVersion':
    '{said} firmware {version}, który należy do linii legacy 0.x / 1.x (to inna linia numeracji, a nie starsze 4.x — i jedna z tych kompilacji też daje sumę {sum})',
  'detect.modern.noSum':
    'żaden slot nie odszyfrowuje się do sumy kontrolnej {sum}, której wymaga bootloader tej rodziny',
  'detect.modern.sum': 'slot odszyfrowuje się do sumy kontrolnej {sum}',
  'detect.modern.version':
    'firmware {version} należy do linii z 2018 roku i nowszej, którą obejmuje ta mapa selektorów (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'zwykłe 2-bajtowe BeginFirmwareUpgrade aktywowało chroniony slot, więc to nie jest zablokowany firmware legacy',
  'detect.modern.none': 'brak dowodów, że ta kamera należy do linii z 2018 roku i nowszej',
  'detect.early.noVersion': 'wersja firmware nie została podana ani znaleziona w nagłówku obrazu',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'firmware {version} to {first} lub nowszy, więc jego tabela RPC ma getter dla GetFeaturedFirmwareData i obowiązuje zwykła ścieżka odczytu',
  'detect.early.older':
    '{said} firmware {version}, starszy niż {first} — pierwsza kompilacja, której tabela metod RPC ma procedurę odczytu (getter) dla GetFeaturedFirmwareData',
  'detect.early.noWindow':
    'i nie udało się odczytać żadnego okna, co jest zgodne z tym przewidywaniem',
  'detect.generic.fallback':
    'rodzina zastępcza: żadna rodzina firmware nie pasowała z pewnością, więc odczyty pozostają dostępne, a zapisy nie',
  'detect.compact2016.early':
    'firmware {version} jest starszy niż 0.8.0.0 i nie ma procedury odczytu dla GetFeaturedFirmwareData — to early-compact, a nie ta rodzina',
  'detect.compact2016.modernSum':
    'slot odszyfrowuje się do sumy kontrolnej {sum}, która nie jest wartością docelową tej generacji',
  'detect.compact2016.plainArmed':
    'zwykłe 2-bajtowe BeginFirmwareUpgrade aktywowało chroniony slot, więc ta kamera nie należy do zablokowanej linii, którą ta rodzina dzieli z legacy-auth',
  'detect.compact2016.notLine': 'firmware {version} nie należy do linii 0.x / 1.x',
  'detect.compact2016.storedPlain':
    'slot jest przechowywany jawnie — wyznaczenie strumienia klucza zwraca stan tożsamościowy, więc przechowywane słowa SĄ obrazem — a to łańcuch jawnego tekstu z 2014 roku; sloty tej generacji to xorshift128 z prawdziwym kluczem',
  'detect.compact2016.keyedZero':
    'slot przechowywany z prawdziwym strumieniem klucza xorshift128 odszyfrowuje się do sumy kontrolnej {sum}, co jest szyfrem tej generacji',
  'detect.compact2016.zeroSum':
    'slot odszyfrowuje się do sumy kontrolnej {sum}, która jest wartością docelową tej generacji',
  'detect.compact2016.refused':
    'a chroniony slot odrzucił zwykłe 2-bajtowe aktywowanie, co jest zablokowaną procedurą obsługi',
  'detect.compact2016.proLine':
    '{said} firmware {version}, linia 1.0.3.x kamery Compact PRO z 2016 roku',
  'detect.compact2016.compactLine':
    '{said} firmware {version}, kompilacja Compact, a nie linia 1.0.3.x kamery Compact PRO',
  'detect.compact2016.lockedLine':
    '{said} firmware {version}, z linii 0.x / 1.x, którą ta generacja dzieli z zablokowanym firmware legacy',
  'detect.compact2016.bootloader2016':
    'bootloader podaje {version}, bootloader generacji 2016 (1.2.0.0 zmierzono pod Compact PRO 1.0.3.0; Compact z 2014 roku ma 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'bootloader podaje {version}, numerację generacji 2014, a nie tej generacji',
  'detect.compact2016.none':
    'nie zaobserwowano slotu, który z prawdziwym kluczem odszyfrowuje się do zerowej sumy kontrolnej',
  'detect.legacy.proLine':
    'ale firmware {version} należy do linii 1.0.3.x kamery Compact PRO z 2016 roku, której sloty używają szyfru compact-2016: sprawdzenie akceptacji tej rodziny nie przeszłoby dla żadnego z nich',
  'detect.legacy.early':
    'firmware {version} jest starszy niż 0.8.0.0: jego tabela RPC nie ma procedury odczytu dla GetFeaturedFirmwareData (przed 0.7.0.7 nie ma żadnej, a w 0.7.0.7 i 0.7.0.8 jest tylko setter) — to early-compact, a nie ta rodzina',
  'detect.legacy.keyedZero':
    'slot przechowywany z prawdziwym strumieniem klucza xorshift128 odszyfrowuje się do {zero} — szyfr kamery Compact PRO z 2016 roku (compact-2016). Ta linia przechowuje sloty jawnie z sumą słów 0 (łańcuch z 2014 roku) lub z kluczem do {sum} (Compact 1.3.0.8), a jej sprawdzenie akceptacji odrzuca taki slot',
  'detect.legacy.plainChain':
    'slot jest przechowywany jako jawny firmware, którego słowa sumują się do 0, tak jak uruchamia go bootloader z 2014 roku tej linii',
  'detect.legacy.refused':
    'kamera odmówiła otwarcia zablokowanego slotu do aktualizacji, gdy poproszono bez odblokowania, co robi tylko ta generacja firmware',
  'detect.legacy.unlocked':
    'i otworzyła ten sam slot, gdy poproszono z odblokowaniem, więc odblokowanie wysyłane przez tę rodzinę jest tym, które sprawdza ta kamera',
  'detect.legacy.notLine': '{said} firmware {version}, który nie należy do linii legacy 0.x / 1.x',
  'detect.legacy.authOnly':
    'otworzyła zablokowany slot do aktualizacji, gdy poproszono z odblokowaniem, tak jak robi ta generacja firmware; prośby bez odblokowania nie próbowano, więc samo to nie dowodzi generacji',
  'detect.legacy.version':
    'firmware {version} należy do linii legacy 0.x / 1.x, która jest inną linią numeracji niż wersje aplikacji z 2018 roku i nowsze, a nie starszym 4.x',
  'detect.legacy.none': 'nic z zaobserwowanego nie wskazuje na uwierzytelniony kanał odczytu',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{id}`: the table entry's name; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'wstrzymana po próbie na kamerze: tam łatka nie podniosła liczby publikowanych klatek, a migawka wyzwalała się przy każdej klatce po zapisie',
  'fps.table.predates':
    'firmware {version} jest starszy niż 0.8.0.0: jego tabela RPC nie ma procedury odczytu dla GetFeaturedFirmwareData, polecenia wysyłanego przez odczyt slotu, więc odczyt i zapis slotów nie obejmują żadnego slotu tej kompilacji, a łatka nie jest dostępna',
  'fps.table.stageTwoFf':
    'stage two (drugi etap): kompilacja 16 Hz FF jest przesyłana tak, jak przesyła ją aplikacja producenta (obraz XOR klucz A, przechowywany pod kluczem B), a nie jako jawne bajty, więc jej sprawdzenie przesyłania nie zostało wykonane i łatka nie jest jeszcze dostępna',
  'fps.table.stageTwo':
    'stage two (drugi etap): ta pozycja nie należy do zestawu stage two, więc jej sprawdzenie przesyłania nie zostało wykonane i łatka nie jest jeszcze dostępna',
  'fps.table.notOffered': 'niedostępna',
  'fps.table.notImage': 'to nie jest obraz firmware, więc nie dotyczy go żadna łatka liczby klatek',
  'fps.table.otherBuild':
    'obraz to kompilacja {image} („{id}”), ale kamera podaje {camera}; łatka jest odrzucana, zamiast nałożyć ją na kompilację, do której nie pasuje',
  'fps.table.otherBuildNoVersion':
    'obraz to kompilacja {image} („{id}”), ale kamera nie podaje wersji; łatka jest odrzucana, zamiast nałożyć ją na kompilację, do której nie pasuje',
  'fps.table.patched': 'łatka liczby klatek jest już nałożona: ten obraz działa z {hz} Hz',
  'fps.table.earlierPatch':
    'ten obraz zawiera wcześniejszą łatkę liczby klatek {hz} Hz bez poprawki USB, a łatki nigdy nie nakłada się na załatany obraz: przywróć oryginalny obraz, a potem go załataj',
  'fps.table.atRate': 'ta kompilacja już działa z {hz} Hz bez łatki',
  'fps.table.not4821':
    'ten obraz podaje kompilację Compact 4.8.2.1 (lub Compact XR 4.8.2.1, tę samą kompilację), ale nie jest oryginalnym obrazem, dla którego napisano łatkę liczby klatek (f96ac57eda75: jego 68-bajtowe strony poleceń, stała strona 13), więc nie powstaje dla niego żadna łatka liczby klatek',
  'fps.table.notInTable':
    'tego obrazu nie ma w tabeli łatek liczby klatek, więc dla tej kompilacji nie powstaje żadna łatka. Tabela obejmuje kompilacje Compact od 0.7.0.8 do 1.3.0.8 (8 Hz; 0.7.0.8 odrzuca kod slotów), 1.3.0.8 (16 Hz FF), 4.8.1.7, 4.8.1.9, 4.8.2.1 i 4.16.1.7 FF oraz kompilacje Compact PRO 1.0.3.x i 4.9.x; żadna inna kompilacja nie ma pozycji',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'plan tej kompilacji nie obejmuje {bank:gen}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank} nie może przyjąć odszyfrowanego obrazu w tej kompilacji: {reason}',
  'fps.plan.empty': '{bank} nie ma odszyfrowanego obrazu do załatania (jest pusty)',
  'fps.plan.noImage':
    '{bank} nie ma odszyfrowanego obrazu do załatania (nie został odczytany albo nie otwiera go żaden klucz)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name} został zapisany, ale jego odczyt kontrolny nie różni się od zachowanego slotu tylko w zaplanowany sposób, więc kolejne sloty nie zostały zapisane',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build, a bank or an empty bank (slots/capability-notes) ----
   * Mode numbers, addresses, version numbers and command names (CompleteMemoryUpgrade, BeginFirmwareUpgrade,
   * EP0, PRESERVATION.md) are names: keep them. `{untested}` is notes.ffBootUntested. */
  /** "This line" is the firmware line (the 2014 0.x/1.x builds, as in notes.token), not a line of text: on these builds, the bank the page or the CLI calls booted is the one the camera entered at its last start. */
  'notes.lockedBootWord':
    'Uruchomiony slot wskazany w tej linii to slot, który kamera uruchomiła przy ostatnim starcie, zgodnie z zapisem w słowie aktywnego slotu (0 slot A, 1 slot B, 2 slot odzyskiwania R). Następny start określa słowo konfiguracji startu: 0 lub 0xFFFFFFFF wybiera najpierw A, 1 najpierw B, każda inna wartość najpierw slot odzyskiwania R. Slot odzyskiwania R uruchamia się zawsze, gdy A i B nie zawierają niczego, co przyjmuje bootloader z 2014 roku (slotu, którego słowa sumują się do 0), niezależnie od zawartości R (zmierzono na kamerze).',
  /** "This line" is the firmware line (the 2016 Compact PRO 1.0.3.x builds), not a line of text: on these builds, the bank the page or the CLI calls booted is the one the camera entered at its last start. */
  'notes.locked2016BootWord':
    'Uruchomiony slot wskazany w tej linii to slot, który kamera uruchomiła przy ostatnim starcie, zgodnie z zapisem bootloadera w słowie aktywnego slotu (0 slot A, 1 slot B, 2 slot odzyskiwania R). Następny start określa słowo konfiguracji startu: 0 lub 0xFFFFFFFF wybiera najpierw A, 1 najpierw B, każda inna wartość najpierw slot odzyskiwania R. Bootloader z 2016 roku przyjmuje slot tylko wtedy, gdy ten odszyfrowuje się do sumy słów 0 kluczem, którym bootloader sprawdza slot (blok kluczy 1 w bootloaderze 1.2.0.0), a ostatni slot w tej kolejności uruchamia się bez sprawdzenia, gdy dwa pozostałe zawiodą. Odczyt wskazuje ten klucz na podstawie slotu, który kamera uruchomiła, bo blok bootloadera, który go zawiera, jest odrzucany na każdym kanale (zmierzono na kamerze).',
  'notes.ep0of1032':
    '1.0.3.2: sesje EP0 kończą się po około 64–81 KB, a 128 B to bezstratna jednostka odczytu, więc zmierzony limit to jeden slot 64 KB na sesję. Pełny odczyt całego układu jest w tej kompilacji odrzucany (PRESERVATION.md: nie ma pełnego odczytu jednym aktywowaniem). Zrzut slotu odczytuje jeden slot naraz, w porcjach po 64 bajty.',
  'notes.token':
    'Sloty są w tej linii zablokowane: kamera otwiera slot do zapisu tylko wtedy, gdy prośba zawiera odblokowanie tej linii, które jest takie samo we wszystkich 22 zarejestrowanych obrazach firmware tej linii. Kamera z innym odblokowaniem odrzuca swoje sloty.',
  'notes.staging.lockedPlain':
    'Przesyłane: sam obraz, najwyżej 56 KB (tyle, ile kamera przyjmuje w jednym zapisie). Zapis wymazuje slot 64 KB i zapisuje dokładnie te bajty, a reszta slotu odczytuje się jako wymazana. Bootloader uruchamia slot tylko wtedy, gdy jego słowa sumują się do 0, więc obraz jest wyrównywany do tej sumy przed wysłaniem.',
  'notes.staging.locked2016':
    'Przesyłane: obraz XOR strumień klucza xorshift128 jego WŁASNEGO bloku kluczy 0 (klucza przesyłania, znalezionego w obrazie po wartości), tylko długość obrazu (najwyżej 0xE000 bajtów). Urządzenie odszyfrowuje dane tym kluczem i przechowuje je pod kluczem, którym bootloader sprawdza slot (blok kluczy 1), więc przechowywane bajty nie są przesłanymi. Do przesłania nic nie jest odczytywane ze slotu docelowego: strumień klucza slotu służy tylko do odczytu kontrolnego.',
  'notes.staging.modern':
    'Przesyłane: cały slot 64 KB, obraz + dopełnienie 0xFF + stopka „CODE”. Obraz jest XOR-owany ze strumieniami kluczy, dzięki którym dwa własne przebiegi działającej aplikacji umieszczają go pod kluczem, który zawiera uruchomiony slot: gdy polecenie zatwierdzenia (CompleteMemoryUpgrade) przyjmuje typ danych 7, 8 lub 9, aplikacja odszyfrowuje przesłane dane swoim kluczem A, szyfruje je ponownie kluczem zapisu i programuje slot. Stopka pozwala bootloaderowi przyjąć slot, więc slot bez niej jest odrzucany.',
  'notes.modernGap':
    'Slot B to w tej linii 0x14050000 (tryb 8). Żaden selektor nie sięga 0x14060000 w żadnej kompilacji 2.x, 4.x, 10.x, 42.x ani 44.x (zdekodowano z 14 obrazów zbioru z 2018 roku i nowszych), więc nie ma tam żadnego slotu. Układ 0x14060000 należy do zablokowanej linii 0.x/1.x.',
  'notes.modernNamedWrite':
    'Zapisy nazwane (tryby 7–9) są zdekodowane z firmware. Emulator zapisuje przez nie A, B i R w kompilacjach 4.x, a na kamerze slot A kamery Compact XR 4.8.2.1 został zapisany przez tryb 7 łatką liczby klatek. Zapis slotu nigdy nie aktywuje trybu 0, celu aktualizacji.',
  'notes.unverified':
    'Tylko odczyt. Układ slotów to zdekodowana tabela zablokowanej linii, ale dla tej kompilacji nie zmierzono żadnej postaci przesyłania, więc żaden zapis nie jest planowany.',
  'notes.empty.plain':
    'Pusty slot przyjmuje obraz dokładnie tak samo jak używany. Łańcuch jawnego tekstu przesyła bajty obrazu bez zmian, bez klucza, a zatwierdzenie najpierw wymazuje blok, więc nic nie jest odczytywane ze slotu docelowego. Zmierzono na kamerze Compact: obraz zapisany do pustego slotu B odczytał się identycznie, a B uruchomił się samodzielnie.',
  'notes.empty.modern':
    'Pusty slot przyjmuje obraz dokładnie tak samo jak używany. Dane są szyfrowane kluczami wyprowadzonymi z uruchomionego slotu i działającej aplikacji, a nie ze slotu docelowego, a urządzenie szyfruje je ponownie i wymazuje blok bez odczytywania go. Stopka jest kopiowana ze slotu, który ma prawidłową, a w przeciwnym razie budowana pusta. Potwierdzone w emulatorze; jeszcze niezmierzone na kamerze.',
  'notes.empty.locked2016':
    'Pusty slot przyjmuje obraz dokładnie tak samo jak używany. Klucz przesyłania to blok kluczy 0 własnej pary OBRAZU, a nie klucz odczytany ze slotu docelowego; urządzenie odszyfrowuje nim dane, przechowuje je pod własnym kluczem i wymazuje blok bez odczytywania go. Potwierdzone w emulatorze; jeszcze niezmierzone na kamerze.',
  'notes.mode2of080':
    '0.8.0.0: tryb 2 (0x14000000) grozi w tej kompilacji awarią, aktywowany odczyt wychodzi poza SRAM (PRESERVATION.md). Odczyt lub zapis slotu aktywuje tylko tryby 7–9 i nigdy trybu 2.',
  'notes.keyPairs2016':
    'Kompilacje 9 Hz wersji 1.0.3.0 i 1.0.3.2 mają wspólną parę kluczy, a kompilacje FF inną. Ciąg wersji ich nie rozróżnia, więc strumień klucza jest odtwarzany z samego slotu, a rozstrzyga własny obraz slotu.',
  'notes.board1030':
    'Aplikacja 1.0.3.0 uruchamia się ponownie na każdej płycie poza płytą Compact Pro, więc płyta Compact uruchamia ją tylko z łatką płyty w slotach.',
  'notes.bank.modernA':
    'Zapisywany przez aktywowanie slotu pominięte w nowoczesnej mapie; Compact XR 4.8.2.1 przyjął przez nie zapis na kamerze.',
  'notes.bank.recovery2016':
    'Zmierzono na Compact PRO 1.0.3.0: slot odzyskiwania R przyjął własny obraz, zmianę jednego bajtu i surowe bajty w przesłanej postaci, każde zapisane bez błędu.',
  'notes.bank.ff1308A':
    'Obraz 1.3.0.8 FF (16 Hz) trafia tutaj w postaci, w jakiej wysyła go aplikacja producenta, a kamera przechowuje go pod własnym kluczem. Bootloader z 2014 roku uruchamia slot tylko wtedy, gdy jego słowa sumują się do 0, więc przy starcie pomija ten slot; czy kompilacja 16 Hz uruchamia się ze slotu A, jest UNTESTED (nieprzetestowane). Obraz 8 Hz jest zapisywany bez zmian.',
  'notes.bank.ff1308B':
    'Obraz 1.3.0.8 FF (16 Hz) trafia tutaj w postaci, w jakiej wysyła go aplikacja producenta, a kamera przechowuje go pod własnym kluczem. Bootloader z 2014 roku uruchamia slot tylko wtedy, gdy jego słowa sumują się do 0, więc przy starcie pomija ten slot; czy kompilacja 16 Hz uruchamia się ze slotu B, jest UNTESTED (nieprzetestowane). Obraz 8 Hz jest zapisywany bez zmian.',
  'notes.bank.ff1308R':
    'Obraz 1.3.0.8 FF (16 Hz) trafia tutaj w postaci, w jakiej wysyła go aplikacja producenta, a kamera przechowuje go pod własnym kluczem. Bootloader 0.9.0.0 uruchamia slot odzyskiwania R w postaci przechowywanej, bez dekodowania, więc ta postać może się nie uruchomić: UNTESTED (nieprzetestowane), a wcześniejsza postać tego obrazu uruchomiła się stąd (zmierzono na kamerze). Obraz 8 Hz jest zapisywany bez zmian.',
  'notes.product.4_8_2_1':
    'Compact 4.8.2.1 i Compact XR 4.8.2.1 (jeden obraz): nowoczesna mapa 63 okien; emulator potwierdził 63 z 63 okien na pełnym zrzucie kamery Compact i kamery Compact XR.',
  'notes.product.10_9_1_31':
    'Mosaic 320x240 10.9.1.31: nowoczesna mapa 63 okien; zmierzono, że emulator potwierdza każde okno.',
  'notes.product.2_27_1_33':
    'Mosaic 320x240 FF 2.27.1.33: nowoczesna mapa 63 okien; zmierzono, że emulator potwierdza każde okno.',
  'notes.product.42_32_3_10':
    'Nano 200 42.32.3.10: nowoczesna mapa 63 okien; zmierzono, że emulator potwierdza każde okno. Jej polecenie zatwierdzenia (CompleteMemoryUpgrade) nie obsługuje typu danych 32, o który zapis przez tryb 7, 8 lub 9 nigdy nie prosi.',
  'notes.product.44_27_3_10':
    'Nano 300 44.27.3.10: nowoczesna mapa 63 okien; zmierzono, że emulator potwierdza każde okno. Jej polecenie aktywowania (BeginFirmwareUpgrade) odrzuca typ danych spoza akceptowanego zakresu (0x7F) jako błędny pierwszy argument, a tryby 7–9 mieszczą się w tym zakresie.',
  'notes.ff1308':
    '1.3.0.8-FF (16 Hz) podaje tę samą wersję co kompilacja 8 Hz. Odczyt rozróżnia je na podstawie kamery: kamera mówi, slot po slocie, czy jej aplikacja przyjmuje dany slot, a każda kompilacja przewiduje własne odpowiedzi na podstawie slotów. Obraz FF jest wysyłany w postaci, w jakiej wysyła go aplikacja producenta, a kamera przechowuje go pod własnym kluczem. Trafia do slotu A, slotu B lub slotu odzyskiwania R. Należy się spodziewać, że kompilacja 8 Hz odrzuci go, zanim cokolwiek zapisze; dopóki odpowiedzi kamery nie rozróżniają kompilacji, plan mówi, co każda z nich z nim zrobi. {untested}',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'kamera nie podała swojej wersji firmware ({note}); numer polecenia nie znaczy tego samego w każdym firmware Seek — w Compact 0.3.0.1 wire id 0x52, czyli id aktywujące okno odczytu, to EnterBootloaderMode — więc dopóki wersja nie jest znana, wysyłane są tylko GetErrorCode, GetOperationMode i GetFirmwareInfo, odczyty, na które każda kompilacja odpowiada tak samo',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo nie odpowiedziało ({error}) na żaden z {reads} odczytów w odstępach {spacing} ms, w oknie uruchamiania {window} ms; kamera, która wciąż się uruchamia, odpowiada w tym czasie',
  'identity.note.neverTwice':
    'GetFirmwareInfo ani razu nie odpowiedziało dwa razy z rzędu w {reads} odczytach',
  'identity.note.noAnswer': 'GetFirmwareInfo nie odpowiedziało ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo nie odpowiedziało ({error}); odpowiedzi: {answered} z {reads} odczytów, nigdy dwie z rzędu, więc żadnej z nich nie da się odróżnić od rekordu pozostawionego przez wcześniejsze polecenie',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo zwróciło {count} bajt, za mało na wersję',
    few: 'GetFirmwareInfo zwróciło {count} bajty, za mało na wersję',
    many: 'GetFirmwareInfo zwróciło {count} bajtów, za mało na wersję',
    other: 'GetFirmwareInfo zwróciło {count} bajta, za mało na wersję',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo zwróciło {count} bajt, za mało na wersję; {context}',
    few: 'GetFirmwareInfo zwróciło {count} bajty, za mało na wersję; {context}',
    many: 'GetFirmwareInfo zwróciło {count} bajtów, za mało na wersję; {context}',
    other: 'GetFirmwareInfo zwróciło {count} bajta, za mało na wersję; {context}',
  },
  'identity.note.otherRecord':
    'pierwszy odczyt zwrócił inny rekord ({version}), na którym wcześniejsze polecenie zostawiło selektor informacji o firmware — ten odczyt go wyczyścił',
  'identity.note.afterStartup': {
    one: 'odpowiedziało dopiero po odrzuceniu {count} odczytu podczas uruchamiania',
    few: 'odpowiedziało dopiero po odrzuceniu {count} odczytów podczas uruchamiania',
    many: 'odpowiedziało dopiero po odrzuceniu {count} odczytów podczas uruchamiania',
    other: 'odpowiedziało dopiero po odrzuceniu {count} odczytu podczas uruchamiania',
  },
  'identity.predates':
    'firmware {version} jest starszy niż protokół zrzutu: jego tabela metod RPC nie ma procedury odczytu dla GetFeaturedFirmwareData (w 0.7.0.7 i 0.7.0.8 jest zarejestrowana tylko jako setter, a wcześniej wire id 0x4F to UploadFirmwareRowSize), więc nie da się nią odczytać żadnego okna; w 0.3.0.1 wire id 0x52 to EnterBootloaderMode, a nie BeginFirmwareUpgrade. Przebieg Preserve odczytuje zamiast tego 0.7.0.7 i 0.7.0.8 przez wire id 0x58 (GetFeaturedData)',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'odmowa ({operation}): {reason}',
  'identity.refusingNoVersion':
    'odmowa ({operation}): {reason}. Nic nie zostało aktywowane. Odłącz kamerę, podłącz ją ponownie, zaczekaj, aż skończy się uruchamiać, i spróbuj jeszcze raz.',
  'identity.operation.dump': 'zrzut',
  'identity.operation.dumpAll': 'zrzut wszystkich selektorów',
  'identity.operation.readInfo': 'odczyt informacji o urządzeniu',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'sloty wybiera się po kopii zapasowej, która je odczytuje — najpierw wykonaj kopię zapasową',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'sloty nie mogą się zmienić po wykonaniu lub próbie zatwierdzenia: sloty zapisywane w tym przebiegu: {banks}; przywrócenie przywraca dokładnie te',
  'preserve.banks.none': 'brak',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Zapisano.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Odczytano. Sloty do odczytu: {count}/{of}.',
  'status.readRefused':
    'Odczytano, ale żadnego slotu tej kamery nie można stąd zapisać — zobacz dziennik.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Wersja firmware',
  'compare.field.imageId': 'Id obrazu',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'Początkowy SP',
  'compare.field.resetVector': 'Wektor resetu',
  'compare.field.size': 'Rozmiar',
  'compare.field.shaExpected': 'SHA-256 oczekiwanego obrazu jawnego',
  'compare.field.sha': 'SHA-256 obrazu',
  'compare.field.shaNotStored':
    'SHA-256 oczekiwanego obrazu jawnego (przechowywane bajty nieprzewidywane)',
  'compare.field.key': 'Klucz',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(brak obrazu)',
  'compare.notImage': '(to nie obraz)',
  'compare.notPredicted': '(nieprzewidywane: urządzenie decyduje, co przechowuje)',
  'compare.plaintext': 'brak (jawny tekst)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'nie dał się odczytać dwa razy tak samo',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (klucz, którym bootloader sprawdza slot, wywnioskowano ze {bank:gen}, do którego bootloader wszedł bez sprawdzenia) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered': '{bank} według zapisu kamery (słowo aktywnego slotu {word})',
  'preserve.lastStart.notRead': 'nieznane — nie udało się odczytać słowa aktywnego slotu',
  'preserve.lastStart.noBank':
    'nieznane — słowo aktywnego slotu ma wartość {word}, która nie wskazuje żadnego slotu',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'nieznane — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'nie zostanie zapisany — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'obraz',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — można zapisać',
  'preserve.bank.writablePatch': '{build} — można zapisać; łatka zmienia bajtów: {count}',
  'preserve.bank.writableEdit': '{build} — można zapisać; zawiera {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — można zapisać; łatka zmienia bajtów: {count}; zawiera {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead':
    'kopia zapasowa nie odczytała jeszcze slotów, więc nie można wybrać żadnego slotu',
  'preserve.choice.every': 'każdy slot zawierający obraz: {banks}',
  'preserve.choice.everyBlocked':
    'nie wszystkie sloty zawierające obraz da się zapisać: {bank} nie może zostać zapisany — {reason}',
  'preserve.choice.noImage': 'żaden slot nie zawiera obrazu, który przebieg może zapisać',
  'preserve.choice.nextStart': '{bank}, slot następnego uruchomienia: {why}',
  'preserve.choice.nextStartRefused':
    'slot następnego uruchomienia to {bank} ({why}), a przebieg nie może go zapisać: {reason}',
  'preserve.choice.everyUnknownStart':
    'każdy slot zawierający obraz ({banks}): nie wiadomo, z którego slotu nastąpi następne uruchomienie ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'nie wiadomo, z którego slotu nastąpi następne uruchomienie ({why}), a {reason}; wybierz slot z nazwy',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank} nie może zostać zapisany: {reason}',
  'preserve.choice.byName': '{banks}, slot wybrany z nazwy',
  'preserve.choice.warnNotPatched':
    'Slot następnego uruchomienia to {bank} ({why}), a ten wybór go nie łata: po ponownym uruchomieniu kamera uruchomi własny obraz tego slotu, więc pełny odczyt pamięci flash zatrzyma się, zanim cokolwiek odczyta. Przywrócenie i tak przywraca każdy zapisany slot.',
  'preserve.choice.warnUnknownStart':
    'Nie wiadomo, z którego slotu nastąpi następne uruchomienie ({why}). Jeśli będzie to slot, którego ten wybór nie łata, pełny odczyt pamięci flash zatrzyma się, zanim cokolwiek odczyta.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'jeszcze nieznana',
  'preserve.build.firmware': 'firmware {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'w postaci przechowywanej przez kamerę (ta kamera przechowuje firmware bez szyfrowania)',
  'preserve.stagedForm.oneKey':
    'w postaci przechowywanej przez kamerę (zaszyfrowany kluczem kamery)',
  'preserve.stagedForm.twoKeys':
    'w postaci przechowywanej przez kamerę (zaszyfrowany dwoma kluczami kamery)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'każdy zapisany slot otrzymuje z powrotem dokładnie te bajty, które odczytała z niego kopia zapasowa',
  'preserve.restoreForm.factoryStaged':
    'każdy zapisany slot otrzymuje z powrotem oryginalny firmware, zapisany w postaci przechowywanej przez kamerę, więc slot kończy bajt w bajt taki, jak odczytała go kopia zapasowa',
  'preserve.restoreForm.none':
    'niemożliwe w tej kompilacji: żadna postać oryginalnego firmware nie przechodzi własnego sprawdzenia kamery i jednocześnie nie zapisuje się z powrotem jako oryginalne bajty, więc przebieg kończy się pełnym obrazem i wciąż obecną łatką',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'niemożliwe w tej kompilacji: załatany firmware nie potrafi odczytać całej pamięci flash, więc przebieg nie ma pełnego obrazu do przekazania',
  'preserve.drain.rotated':
    'kamera podaje ją przesuniętą cyklicznie, a przebieg przywraca kolejność',
  'preserve.drain.hazard': 'łatka omija odczyt, który w tej kompilacji powoduje awarię kamery',
  'preserve.drain.whole': 'całe 4 MB pamięci flash jednym odczytem, po {size} bajtów naraz',
  'preserve.drain.wholeNotes':
    'całe 4 MB pamięci flash jednym odczytem, po {size} bajtów naraz; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'pozwala poleceniu odczytu kamery sięgnąć do całych 4 MB pamięci flash, a nie tylko do pierwszych 64 KB',
  'preserve.site.countPast':
    'pozwala pozycji odczytu przekroczyć 64 KB, aby odczyt nie wracał na początek',
  'preserve.site.keepPosition':
    'zachowuje pełną pozycję odczytu, gdy przesuwa się ona po każdym odczycie',
  'preserve.site.savePosition': 'zapisuje w całości przesuniętą pozycję odczytu',
  'preserve.site.clearPosition':
    'zeruje całą pozycję odczytu przy każdym rozpoczęciu odczytu, aby kamerę dało się odczytać także po pełnym odczycie pamięci flash',
  'preserve.site.modeTwoGuard':
    'pozwala rozpocząć pełny odczyt pamięci flash jak każdy inny odczyt (oryginalny firmware go odrzuca)',
  'preserve.site.modeTwoIndirection':
    'kieruje pełny odczyt pamięci flash na początek pamięci (oryginalny firmware kieruje go na wartość, która powoduje awarię kamery)',
  'preserve.site.armTail':
    'usuwa wywołanie, które w tej kompilacji zawiesza kamerę przy rozpoczęciu odczytu',
  'preserve.site.other': 'zmienia jedną instrukcję potrzebną do pełnego odczytu pamięci flash',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Kopia zapasowa',
  'preserve.step.patch': 'Łatka',
  'preserve.step.commit': 'Zapis',
  'preserve.step.drain': 'Pełny odczyt',
  'preserve.step.restore': 'Przywrócenie',
  'preserve.step.verify': 'Sprawdzenie',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'krok „Łatka”',
  'preserve.stepId.commit': 'krok „Zapis”',
  'preserve.stepId.drain': 'pełny odczyt',
  'preserve.stepId.restore': 'przywrócenie',
  'preserve.stepId.verify': 'sprawdzenie',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: zatrzymano zgodnie z planem — kamera uruchomiła {bank}, którego ten przebieg nie załatał, więc nic nie zostało odczytane.',
  'preserve.result.noReason': 'nie zarejestrowano przyczyny',
  'preserve.result.stopped': '{label}: zatrzymano — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none': 'żaden slot nie zawiera firmware, który przebieg może załatać',
  'preserve.result.writable.one': '{banks} zawiera firmware, który przebieg może załatać',
  'preserve.result.writable.many': '{banks} zawierają firmware, który przebieg może załatać',
  'preserve.result.backup':
    '{label}: zachowano każdy blok, do którego sięga zwykły odczyt; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'nieznany slot',
  'preserve.result.backupNext':
    '{label}: zachowano każdy blok, do którego sięga zwykły odczyt; {writable}; slot następnego uruchomienia: {next}.',
  'preserve.result.patch': '{label}: łatka przygotowana — {banks}.',
  'preserve.result.patchCount':
    '{label}: łatka przygotowana — {banks}; w każdym zmienia się bajtów: {count}.',
  'preserve.result.commitOne': '{label}: {banks} — zapisano z łatką, a kamera ją przyjęła.',
  'preserve.result.commitMany':
    '{label}: {banks} — zapisano z łatką, a kamera przyjęła każdy z nich.',
  'preserve.result.drainNotRead': '{label}: nie odczytano.',
  'preserve.result.drain':
    '{label}: odczytano całe 4 MB pamięci flash; pełny obraz ma sha256 {sha256}.',
  'preserve.result.drainThrough':
    '{label}: odczytano całe 4 MB pamięci flash przez {bank}; pełny obraz ma sha256 {sha256}.',
  'preserve.result.restore': '{label}: {banks} — zapisano z powrotem.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}: {banks} — zapisano z powrotem {form}.',
  'preserve.result.verifyDone': '{label}: gotowe.',
  'preserve.result.verifyIdentical':
    '{label}: ponownie odczytane bloki: {blocks}, różniące się bajty: 0 — pamięć flash kamery jest identyczna co do bajtu z kopią zapasową.',
  'preserve.result.verifyDiffers':
    '{label}: ponownie odczytane bloki: {blocks}, różniące się bajty: {bytes}.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: ponownie odczytane bloki: {blocks}, różniące się bajty: {bytes}; nie udało się odczytać {count} bloku.',
    few: '{label}: ponownie odczytane bloki: {blocks}, różniące się bajty: {bytes}; nie udało się odczytać {count} bloków.',
    many: '{label}: ponownie odczytane bloki: {blocks}, różniące się bajty: {bytes}; nie udało się odczytać {count} bloków.',
    other:
      '{label}: ponownie odczytane bloki: {blocks}, różniące się bajty: {bytes}; nie udało się odczytać {count} bloku.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Zatrzymano przed pełnym odczytem pamięci flash: kamera uruchomiła slot, którego ten przebieg nie załatał, więc nic nie zostało odczytane.',
  'preserve.unpatchedStart.next':
    'Dalej: przywrócenie przywraca każdy zapisany slot. Pełny odczyt nie jest ponawiany: kamera uruchomiłaby ten sam slot.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Gotowe — firmware został zachowany',
  'preserve.done.detail':
    'Pełny obraz to cała oryginalna pamięć flash kamery, a sama kamera jest dokładnie w takim stanie jak wcześniej.',
  'preserve.done.titleNoImage': 'Gotowe — kamera jest w poprzednim stanie; pełnego obrazu nie ma',
  'preserve.done.detailNoImage':
    'Pełny odczyt pamięci flash nie został wykonany, więc ten przebieg nie ma pełnego obrazu pamięci flash. Każdy zapisany slot został przywrócony, a świeży odczyt bloków, do których sięga zwykły zrzut, zgadza się z kopią zapasową. Aby uzyskać pełny obraz, rozpocznij nowy przebieg z wyborem obejmującym slot następnego uruchomienia.',
  'preserve.done.detailNoImageCount':
    'Pełny odczyt pamięci flash nie został wykonany, więc ten przebieg nie ma pełnego obrazu pamięci flash. Każdy zapisany slot został przywrócony, a świeży odczyt bloków, do których sięga zwykły zrzut (liczba bloków: {blocks}), zgadza się z kopią zapasową. Aby uzyskać pełny obraz, rozpocznij nowy przebieg z wyborem obejmującym slot następnego uruchomienia.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'czytnik okien kamery ma limit na jedno uruchomienie, a te odczyty zwrócił wyczerpany czytnik — wyłącz kamerę i włącz ją ponownie (odłącz ją i podłącz albo użyj jej wyłącznika), a potem uruchom ponownie `preserve --resume <run-directory>`. Sygnatura: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'czytnik okien kamery ma limit na jedno uruchomienie, a te odczyty zwrócił wyczerpany czytnik — wyłącz kamerę i włącz ją ponownie (odłącz ją i podłącz albo użyj jej wyłącznika), a potem uruchom ponownie `preserve --resume <run-directory>`. Sygnatura: {signature} — z tych bajtów nie da się wyprowadzić fabrycznego jawnego tekstu. Wypróbowano każdy sposób odczytu:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'kopia zapasowa nie zawiera {bank:gen} ({address}) — oryginalne okna nie mogą go podać',
  'preserve.fail.readsDisagree':
    '{bank}: dwa odczyty się różnią (sha256 {sha256} i {other}) — do kamery, która nie potrafi dwa razy z rzędu podać tego samego uruchomionego slotu, nie należy zapisywać; przechwycone dane są źródłem przywrócenia i danymi wejściowymi do wyprowadzenia łatki',
  'preserve.fail.notFactory':
    '{bank} nie zawiera obrazu fabrycznego w postaci, w jakiej przechowuje go szyfr tej kompilacji (oczekiwany początek obrazu nie zgadza się z przechwyconymi danymi) — odmowa, zanim cokolwiek zostanie zarejestrowane, a tym bardziej zapisane',
  'preserve.fail.ffSum':
    'załatany firmware w postaci przechowywanej przez kamerę nie przechodzi własnego sprawdzenia tej kompilacji (suma musi wynosić {sum}) — odmowa wysłania slotu, który kamera odrzuciłaby po wymazaniu',
  'preserve.fail.headChanged':
    '{bank}: początek slotu zmienił się od wykonania kopii zapasowej (nie zawiera ani oryginalnych przechwyconych danych, ani załatanych bajtów) — odmowa zapisu na nieznany stan slotu; nic nie zostało zapisane. Początek w hex: obecnie {live}, w przechwyconych danych {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks} już zawiera załatane bajty — zatwierdzenie wykonało się w poprzedniej próbie i nie wolno go powtarzać. Wznów od kroku pełnego odczytu (--resume), który uruchamia załatany obraz i kontynuuje od tego miejsca.',
  'preserve.fail.landed':
    '{banks} już zawierają załatane bajty — zatwierdzenie wykonało się w poprzedniej próbie i nie wolno go powtarzać. Wznów od kroku pełnego odczytu (--resume), który uruchamia załatany obraz i kontynuuje od tego miejsca.',
  'preserve.fail.drainRebootRefused':
    'polecenie ponownego uruchomienia przed pełnym odczytem zostało ODRZUCONE przez hosta, zanim zostało wysłane (SecurityError: zasada przeglądarki lub zabezpieczenie testowe), więc kamera nadal działa na obrazie, z którym się uruchomiła, a nie na zatwierdzonej łatce. Pełny odczyt czyta tylko przez poszerzone okno załatanego obrazu, więc zatrzymuje się, zanim cokolwiek aktywuje; nic nie zostało odczytane. Uruchom pełny odczyt ponownie tam, gdzie host przepuszcza polecenie ponownego uruchomienia.',
  'preserve.fail.shiftedRebootRefused':
    'pełny odczyt wrócił przesunięty o jedną stronę w górę, a ponowne uruchomienie, które daje kolejny start, zostało ODRZUCONE przez hosta, zanim zostało wysłane (SecurityError: zasada przeglądarki lub zabezpieczenie testowe) — kolejna próba odczytałaby ten sam przesunięty start. Nic nie zachowano; uruchom pełny odczyt ponownie tam, gdzie reset może zostać wysłany.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'weryfikacja odczytała {count} różniący się bajt w oknach {read}/{total} — układ nie odczytuje się ponownie identycznie z kopią zapasową',
    few: 'weryfikacja odczytała {count} różniące się bajty w oknach {read}/{total} — układ nie odczytuje się ponownie identycznie z kopią zapasową',
    many: 'weryfikacja odczytała {count} różniących się bajtów w oknach {read}/{total} — układ nie odczytuje się ponownie identycznie z kopią zapasową',
    other:
      'weryfikacja odczytała {count} różniącego się bajta w oknach {read}/{total} — układ nie odczytuje się ponownie identycznie z kopią zapasową',
  },
  'preserve.fail.verifyIn': {
    one: 'weryfikacja odczytała {count} różniący się bajt w oknach {read}/{total} (w: {places}) — układ nie odczytuje się ponownie identycznie z kopią zapasową',
    few: 'weryfikacja odczytała {count} różniące się bajty w oknach {read}/{total} (w: {places}) — układ nie odczytuje się ponownie identycznie z kopią zapasową',
    many: 'weryfikacja odczytała {count} różniących się bajtów w oknach {read}/{total} (w: {places}) — układ nie odczytuje się ponownie identycznie z kopią zapasową',
    other:
      'weryfikacja odczytała {count} różniącego się bajta w oknach {read}/{total} (w: {places}) — układ nie odczytuje się ponownie identycznie z kopią zapasową',
  },
  'preserve.fail.verifyShort': {
    one: 'weryfikacja odczytała {count} różniący się bajt w oknach {read}/{total} (krótkie okna: {short}) — układ nie odczytuje się ponownie identycznie z kopią zapasową',
    few: 'weryfikacja odczytała {count} różniące się bajty w oknach {read}/{total} (krótkie okna: {short}) — układ nie odczytuje się ponownie identycznie z kopią zapasową',
    many: 'weryfikacja odczytała {count} różniących się bajtów w oknach {read}/{total} (krótkie okna: {short}) — układ nie odczytuje się ponownie identycznie z kopią zapasową',
    other:
      'weryfikacja odczytała {count} różniącego się bajta w oknach {read}/{total} (krótkie okna: {short}) — układ nie odczytuje się ponownie identycznie z kopią zapasową',
  },
  'preserve.fail.verifyInShort': {
    one: 'weryfikacja odczytała {count} różniący się bajt w oknach {read}/{total} (w: {places}) (krótkie okna: {short}) — układ nie odczytuje się ponownie identycznie z kopią zapasową',
    few: 'weryfikacja odczytała {count} różniące się bajty w oknach {read}/{total} (w: {places}) (krótkie okna: {short}) — układ nie odczytuje się ponownie identycznie z kopią zapasową',
    many: 'weryfikacja odczytała {count} różniących się bajtów w oknach {read}/{total} (w: {places}) (krótkie okna: {short}) — układ nie odczytuje się ponownie identycznie z kopią zapasową',
    other:
      'weryfikacja odczytała {count} różniącego się bajta w oknach {read}/{total} (w: {places}) (krótkie okna: {short}) — układ nie odczytuje się ponownie identycznie z kopią zapasową',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'blok konfiguracji startu',
  'preserve.fail.dataBlock': 'blok danych',

  'preserve.refused.secondRead': 'jego drugi odczyt nie powiódł się ({error})',
  'preserve.refused.readsDisagree': 'jego dwa odczyty się różnią (sha256 {sha256} i {other})',
  'preserve.refused.erased': 'jest wymazany',
  'preserve.refused.watchdogMark':
    'jego słowo nagłówka pod +0x200 zawiera {word}, znacznik, który bootloader zapisuje w slocie po resecie watchdoga na początku startu; bootloader nie przyjmuje już tego slotu, a przebieg nie ma tam obrazu do załatania',
  'preserve.refused.noHeader': 'nie zawiera nagłówka obrazu pod +0x200',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'zawiera {image} ({id}), a nie kompilację, którą uruchamia kamera ({camera})',
  'preserve.refused.otherKey':
    'sprawdzenie bootloadera go odrzuca: jest przechowywany pod innym kluczem niż ten, którym bootloader tej kamery sprawdza sloty, a zapis przez kamerę przechowałby go pod tamtym kluczem, więc przywrócenie nie mogłoby przywrócić jego dokładnych bajtów',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'kamera podaje firmware {camera}, wymagany jest {version} — łatka jest wyprowadzona z bajtów jednej kompilacji i nie wolno jej wysyłać do innej',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'firmware {version} nie jest kompilacją 0.x ani 1.x, a ten przebieg obejmuje tylko kompilacje z 2014 i 2016 roku. Poza wersją nic nie zostało odczytane. Zamiast tego odczytaj tę kamerę na karcie „Zrzut i odszyfrowanie 4.x/Nano”: odczytuje ona pamięć flash bez łatki, każdy blok z wyjątkiem tego pod 0x14060000, do którego w tych kompilacjach nie sięga żadne okno odczytu.',
  'preserve.refused.preWidening':
    'firmware {version} jest starszy niż metoda poszerzenia, a przebieg odmawia zamiast zapisywać slot, którego nie może odczytać kontrolnie. W tej generacji kamera odrzuca każdy sposób rozpoczęcia odczytu, którego wymaga ta metoda (zmierzono na 0.3.0.1), jej polecenie odczytu nie sięga początku pamięci flash, a rozmiar, który zmieniłaby łatka, jest przechowywany w inny sposób. Nie ma też odczytu, którego mógłby użyć standardowy zrzut. Poza wersją nic nie zostało odczytane.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'zawiera nieznany obraz (nie oryginalny firmware {version} ani znaną Preserve jego modyfikację), więc Preserve go nie łata ani nie przywraca',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'zawiera znaną kompilację ze zmienioną liczbą klatek: oryginalny firmware {version} z łatką liczby klatek {hz} Hz. Preserve łata tylko oryginalny firmware, nigdy załatany obraz, więc nie łata tego slotu ani go nie przywraca',
  'preserve.image.frameRateEarlier':
    'zawiera znaną kompilację ze zmienioną liczbą klatek: oryginalny firmware {version} z wcześniejszą łatką liczby klatek {hz} Hz (sprzed dołączenia poprawki USB). Preserve łata tylko oryginalny firmware, nigdy załatany obraz, więc nie łata tego slotu ani go nie przywraca',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    'slot {what}. Aby uwzględnić ten slot, najpierw zapisz na niego z powrotem oryginalny obraz (na przykład z pełnej kopii zapasowej pamięci flash wykonanej przed zmianą), a potem rozpocznij nowy przebieg',
  'preserve.image.frameRateWords':
    'slot {what}. Aby uwzględnić ten slot, najpierw zapisz na niego z powrotem oryginalny obraz (na przykład z pełnej kopii zapasowej pamięci flash wykonanej przed łatką liczby klatek), a potem rozpocznij nowy przebieg; łatkę liczby klatek można potem nałożyć ponownie na oryginalny obraz',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name} {what}. Przebieg pobiera łatany firmware z tego slotu, więc zatrzymuje się tutaj, zanim cokolwiek zostanie zapisane. Aby zachować tę kamerę, najpierw zapisz z powrotem oryginalny obraz w {bank:loc} (na przykład z pełnej kopii zapasowej pamięci flash wykonanej przed zmianą), a potem rozpocznij nowy przebieg.',
  'preserve.image.frameRateRefusal':
    '{name} {what}. Przebieg pobiera łatany firmware z tego slotu, więc zatrzymuje się tutaj, zanim cokolwiek zostanie zapisane. Aby zachować tę kamerę, najpierw zapisz z powrotem oryginalny obraz w {bank:loc} (na przykład z pełnej kopii zapasowej pamięci flash wykonanej przed łatką liczby klatek), a potem rozpocznij nowy przebieg; łatkę liczby klatek można potem nałożyć ponownie na oryginalny obraz.',
  'preserve.image.otherFirmware':
    'zawiera firmware {image}, a nie {camera}, który działa na kamerze',
  'preserve.image.otherFirmwareRefusal':
    '{name} zawiera firmware {image}, a nie {camera}, który działa na kamerze, więc ten przebieg nie ma tam obrazu, który mógłby załatać, i odmawia zamiast go nadpisywać.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'nie da się z niego wyprowadzić obrazu, który przebieg mógłby załatać ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** `{step}`, `{next}`, `{steps}`: the run's step ids (backup, patch, commit, drain, restore, verify), as the CLI names them: keep them. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone':
    'ten przebieg jest zakończony — wszystkie kroki wykonano (przebieg {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    'krok {step} jest już wykonany w tym przebiegu (zakończono {finished}) — wznowienie kontynuuje od kroku {next}',
  'preserve.gate.stepDoneUnknownTime':
    'krok {step} jest już wykonany w tym przebiegu (czas zakończenia nieznany) — wznowienie kontynuuje od kroku {next}',
  'preserve.gate.backupRerun':
    'kopii zapasowej nie można wykonać ponownie: ten przebieg ma już wykonane kroki {steps}, a jego następny krok to {next} — użyj --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'poprzednia próba kopii zapasowej nie powiodła się, a przed ponownym wykonaniem tego kroku kamerę trzeba WYŁĄCZYĆ I WŁĄCZYĆ PONOWNIE — ponowna próba przy tym samym uruchomieniu może odczytać nieaktualne lub puste bajty (zmierzono: ponowiona kopia zapasowa odczytała słowo startowe bootloadera zamiast rekordu konfiguracji startu). Wyłącz kamerę i włącz ją ponownie (odłącz ją i podłącz albo użyj jej wyłącznika), a potem wykonaj kopię zapasową jeszcze raz i potwierdź wyłączenie i włączenie, gdy pojawi się pytanie: przebieg nie widzi, że to nastąpiło. Zarejestrowany błąd: {error}',
  'preserve.gate.noErrorText': '(brak opisu błędu)',
  'preserve.gate.patchAfterBackup':
    '{step} wykonuje się po kopii zapasowej: przebieg pobiera zrzut każdego obszaru, który może odczytać oryginalny plan, i zapisuje go TRWALE, ZANIM stanie się cokolwiek innego — ta kopia zapasowa to jedyna kopia tej kamery. Najpierw wykonaj krok kopii zapasowej.',
  'preserve.gate.commitAfterBackup': '{step} wykonuje się po kopii zapasowej (zobacz krok „Łatka”)',
  'preserve.gate.commitAfterPatch':
    '{step} wykonuje się po kroku „Łatka”, który rejestruje, co przesyła',
  'preserve.gate.commitNeedsPatch':
    '{step} wymaga łatki ({banks}), a krok „Łatka” żadnej nie zarejestrował — wykonaj krok „Łatka” ponownie',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step} wymaga plików kopii zapasowej w katalogu przebiegu, a ich brakuje: {files} — bez nich zapis nie ma źródła przywrócenia, więc odmawia',
  'preserve.gate.drainNoCommit':
    '{step} czyta ZAŁATANY układ przez poszerzone okno, a ten przebieg nie ma zakończonego zatwierdzenia — na oryginalnej kamerze pełny odczyt by się zawiesił. Najpierw wykonaj zatwierdzenie (lub wznów od niego) albo przeskocz jawnie (allowJump), jeśli zatwierdzenie wykonało się bez punktu kontrolnego.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'krok pełnego odczytu odmawia dla tej kompilacji ({build}): {note}',
  'preserve.gate.detectedBuild': 'wykryta kompilacja',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'krok pełnego odczytu odmawia dla tej kompilacji ({build}): rozpoczęcie pełnego odczytu pamięci flash na niezałatanym firmware tej kompilacji powoduje awarię kamery (czyta z wartości, która nie jest adresem w pamięci flash; zmierzono w emulatorze: podano 32 KB, potem nastąpiła awaria kamery). Zmiana, która czyni odczyt bezpiecznym, jest pod {sites}, a nie ma jej wśród zmian zarejestrowanych w tym przebiegu ({bank}) — przed pełnym odczytem wykonaj krok „Łatka” (i doprowadź zapis do końca).',
  'preserve.gate.drainFiles':
    '{step} wymaga {files} (dostarczony zrzut jest uzupełniany przechwyconymi danymi każdego zapisanego slotu), a nie ma tego w katalogu przebiegu',
  'preserve.gate.restoreNoCommit':
    '{step} zapisuje oryginalne sloty z powrotem na łatkę, a ten przebieg nie ma zakończonego zatwierdzenia — nie ma czego cofać. Najpierw wykonaj zatwierdzenie (lub wznów od niego) albo przeskocz jawnie (allowJump), aby przywrócić już załataną kamerę.',
  'preserve.gate.restoreNeedsPatch':
    '{step} wymaga podsumowania łatki każdego zapisanego slotu (dla długości przesyłanych danych) — najpierw wykonaj krok „Łatka”',
  'preserve.gate.restoreNoForm':
    'krok przywrócenia odmawia dla tej kompilacji ({build}): żadna postać oryginalnego firmware nie przechodzi własnego sprawdzenia kamery i jednocześnie nie zapisuje się z powrotem jako oryginalne bajty — suma kontrolna oryginalnego firmware to 0xB7AB9D17 (zmierzono), a nie wymagane przez kamerę 0xFFFF. Ten przebieg kończy się pełnym obrazem i łatką na miejscu; oryginalną zawartość można przywrócić tylko programatorem całej pamięci flash.',
  'preserve.gate.restoreFiles':
    '{step} wymaga {files} (oryginału każdego zapisanego slotu z kroku kopii zapasowej), a nie ma tego w katalogu przebiegu',
  'preserve.gate.verifyNoRestore':
    '{step} porównuje świeży start z kopią zapasową, a ten przebieg nie ma zakończonego przywrócenia — załatany slot pokazałby się jako różnice. Najpierw wykonaj przywrócenie (lub wznów od niego) albo przeskocz jawnie (allowJump), jeśli przywrócenie wykonało się bez punktu kontrolnego.',
  'preserve.gate.verifyNeedsBackup':
    '{step} wymaga {file} (wzorca do porównania), a nie ma go w katalogu przebiegu',
  'preserve.gate.needsBanks':
    'krok {step} wymaga slotów odczytanych w kroku kopii zapasowej, a stan ich nie zawiera',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'dla tego przebiegu nie wybrano slotów: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank} nie może zostać zapisany: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'łatka tej kompilacji uruchamia się tylko ze slotu odzyskiwania R: {note} — przebieg zapisałby {bank}, z którego bootloader nigdy jej nie uruchamia',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'plik jest za mały, aby zmieścić nagłówek obrazu',
  'slots.image.notWordSized': 'rozmiar obrazu musi być wielokrotnością 4 (jest {size} B)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'obraz ma {size} B; bootloader odrzuca każde header.length >= {limit}, więc nigdy by się nie uruchomił',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'brak nagłówka obrazu pod {at} (sygnatura {magic}, oczekiwano {expected}) — musi to być odszyfrowany obraz firmware Seek, a nie zaszyfrowany slot ani zrzut pamięci flash',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'początkowy wskaźnik stosu {address} nie wskazuje SRAM układu LPC43xx — to nie wygląda na odszyfrowany obraz',
  'slots.image.stackUnaligned': 'początkowy wskaźnik stosu {address} nie jest wyrównany do słowa',
  'slots.image.notThumb': 'wektor resetu {address} nie jest adresem Thumb',
  'slots.image.noKeyPair':
    'nazwa tego pliku nie zawiera jego pary kluczy, a w obrazie nie występuje dokładnie raz ani para kluczy tej kamery, ani zdekodowana para aplikacji, więc nie da się ustalić, dla których kluczy zbudowano obraz. Odszyfrowane pliki otrzymują nazwy zawierające ich klucze.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'nazwa pliku podaje klucz A {keyA} i klucz B {keyB}, ale {mismatch}. Oba klucze muszą występować, każdy dokładnie raz.',
  'slots.image.keyInHeader':
    'ten obraz przechowuje klucz pod {at}, w jawnym oknie nagłówka — odmowa nałożenia łatki',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'klucz A i klucz B z nazwy pliku wskazują nakładające się bajty pod {at} i {other} — muszą to być dwie różne wartości 16-bajtowe',
  'slots.image.retargetLost':
    'po przeniesieniu obraz nie zawiera pary kluczy tej kamery dokładnie raz — odmowa zbudowania danych, dla których bootloader nie mógłby dobrać klucza przy późniejszych aktualizacjach',
  'slots.image.noStageKey':
    'obraz nie zawiera pary kluczy linii z 2016 roku, więc nie ma klucza przesyłania, którym można by go zakodować',
  'slots.image.ffSumNoKeys':
    'ten obraz ma sumę słów 16 Hz FF 0xFFFF, ale nie zawiera pary kluczy 1.3.0.8-FF (obu połówek, każdej raz), więc nie da się zbudować jego postaci przesyłania. Nic nie zostało zapisane.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'to obraz 1.3.0.8 FF (16 Hz), który jest przesyłany we własnej postaci z kluczem A (ff-form.ts), a nie jako jawny obraz. Nic nie zostało zapisane.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'plan przygotowano dla firmware {firmware}, ale analiza odczytuje {version}. Plan jest nieaktualny; przygotuj go ponownie. Nic nie zostało zapisane.',
  'slots.plan.otherFirmwareUnknown':
    'plan przygotowano dla firmware w nieznanej wersji, ale analiza odczytuje {version}. Plan jest nieaktualny; przygotuj go ponownie. Nic nie zostało zapisane.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'plan przygotowano dla kamery {planSerial}, ale analiza odczytuje {serial}. Odmowa zapisu tutaj. Nic nie zostało zapisane.',
  'slots.plan.cameraUnknownSerial': 'o nieznanym numerze seryjnym',
  'slots.plan.unknownSerial': 'nieznany numer seryjny',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, as a label. */
  'slots.plan.otherAddress':
    'plan dotyczy adresu {address}, ale w tej kompilacji {name} jest pod {at}',
  'slots.plan.notRead': 'analiza nie odczytuje już {name:gen}. Nic nie zostało zapisane.',
  'slots.plan.edited':
    'suma kontrolna planu nie zgadza się z jego danymi, więc plan został zmieniony. Nic nie zostało zapisane.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'dane mają {size} B i wykraczają poza {name}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck': '{risk}. Zapis wymaga acknowledgeRisk: true. Nic nie zostało wysłane.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'ta kamera nie może stąd przyjąć obrazu przesłanego jawnie: {reason}. Nic nie zostało zapisane.',
  'slots.plan.noKeyTable':
    'analiza nie wskazuje tabeli kluczy bootloadera tej kamery, więc nie da się przenieść na nią obrazu',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, as a label. CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'po CompleteMemoryUpgrade nie udało się odczytać stanu zatwierdzenia, więc {name} może być zapisany częściowo. Zanim zrobisz cokolwiek innego, odczytaj sloty ponownie i zachowaj swój zrzut.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'kamera odrzuciła zapis na {name} przy zatwierdzeniu ze stanem {status}: {cause}. Nic nie zostało zapisane. Slot jest bez zmian. Zanim zrobisz cokolwiek innego, odczytaj sloty ponownie.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade zwróciło {status} ({cause}) — {name}: nic nie zostało zaprogramowane, ale wymazywanie mogło się rozpocząć, więc slot może być częściowo wymazany. Zanim zrobisz cokolwiek innego, odczytaj sloty ponownie i zachowaj swój zrzut.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade zwróciło {status} ({cause}) — {name} może być zapisany częściowo. Zanim zrobisz cokolwiek innego, odczytaj sloty ponownie i zachowaj swój zrzut.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'kamera zgłosiła {status} podczas przesyłania na {name} pod przesunięciem {offset} — przerwano przed CompleteMemoryUpgrade, więc nic nie zostało zapisane do pamięci flash',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum': 'suma kontrolna transmisji nie zgadzała się z przesłanymi bajtami',
  'commit.cause.unsupported':
    'obraz nie odszyfrował się kluczami kamery albo typ danych został odrzucony',
  'commit.cause.acceptance':
    'obraz został odrzucony przez sprawdzenie akceptacji, zanim cokolwiek zostało wymazane (sprawdzenie zależy od kompilacji)',
  'commit.cause.notArmed': 'nie aktywowano aktualizacji żadnego slotu',
  'commit.cause.eraseFailed': 'etap wymazywania się nie powiódł',
  'commit.cause.programFailed': 'etap programowania się nie powiódł',
  'commit.cause.verifyFailed': 'etap weryfikacji się nie powiódł',
  'commit.cause.unknown': 'stan nieznany tutaj',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name} nie jest kopiowany sam na siebie. Nic nie zostało zapisane.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Nic nie zostało zapisane.',
  'copy.refused.noPlain':
    '{name} nie ma odszyfrowanego obrazu do skopiowania. Nic nie zostało zapisane.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} to plik ZIP, którego nie da się tu odczytać ({error}). Nic nie zostało zapisane.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} nie zawiera całej pamięci flash. Plik ZIP jest przyjmowany, jeśli jest plikiem przebiegu Preserve zawierającym {preserve} (po wykonaniu kroku pełnego zrzutu), plikiem zip z „Zrzut i odszyfrowanie 4.x/Nano” ({dump}) lub plikiem zip z „Zrzuć wszystkie selektory” ({selectors}); ten ZIP zawiera: {names}. Nic nie zostało zapisane.',
  'restore.refused.noWholeFlashPatched':
    '{file} nie zawiera całej pamięci flash. Plik ZIP jest przyjmowany, jeśli jest plikiem przebiegu Preserve zawierającym {preserve} (po wykonaniu kroku pełnego zrzutu), plikiem zip z „Zrzut i odszyfrowanie 4.x/Nano” ({dump}) lub plikiem zip z „Zrzuć wszystkie selektory” ({selectors}); ten ZIP zawiera: {names}. Jego {patched} to pamięć flash z tymczasową łatką przebiegu, więc nie jest przyjmowany. Nic nie zostało zapisane.',
  'restore.refused.zipEmpty': 'nic',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'pełna kopia zapasowa pamięci flash ma {full} B (4 MB, cały układ odczytywany przez J-Link); {file} ma {size} B. Nic nie zostało zapisane.',
  'restore.refused.noBank':
    'plan tej kompilacji nie obejmuje {bank:gen}. Nic nie zostało zapisane.',
  'restore.refused.outsideFlash':
    '{name} nie mieści się w 4 MB pamięci flash. Nic nie zostało zapisane.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    '{where} nie został odczytany przez zrzut, z którego pochodzi {file}: według jego manifest.json {address} to luka. Nie ma obrazu do przywrócenia. Nic nie zostało zapisane.',
  'restore.refused.gapReason':
    '{where} nie został odczytany przez zrzut, z którego pochodzi {file}: według jego manifest.json {address} to luka ({gap}). Nie ma obrazu do przywrócenia. Nic nie zostało zapisane.',
  'restore.refused.gapFill':
    '{where} nie został odczytany przez zrzut, z którego pochodzi {file}: według jego manifest.json {address} to luka, wypełniona wartością {fill}. Nie ma obrazu do przywrócenia. Nic nie zostało zapisane.',
  'restore.refused.gapReasonFill':
    '{where} nie został odczytany przez zrzut, z którego pochodzi {file}: według jego manifest.json {address} to luka ({gap}), wypełniona wartością {fill}. Nie ma obrazu do przywrócenia. Nic nie zostało zapisane.',
  'restore.refused.empty':
    '{where} jest pusty: każdy bajt to 0xFF. Zapis programuje obraz i nie może pozostawić slotu wymazanego, więc pustego slotu nie da się przywrócić zapisem. Nic nie zostało zapisane.',
  'restore.refused.fill':
    '{where} ma w każdym bajcie wartość {fill}, którą zrzut wpisuje tam, gdzie nic nie odczytał: zrzut nie odczytał tego slotu. Nie ma obrazu do przywrócenia. Nic nie zostało zapisane.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    '{where} nie może zostać przywrócony z tego pliku: {why}. Nic nie zostało zapisane.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'ta kompilacja nie ma aktywowania zapisu dla tego slotu',
  'support.noStagingEmpty':
    'ta kompilacja nie ma postaci przesyłania, więc pusty slot nie jest zapisywany',
  'support.buildUnknown': 'kompilacja jest nieznana',
  'support.unverifiedStaging':
    'ta kompilacja należy do zablokowanej linii 0.x/1.x, ale nie jest jedną z kompilacji, na których zmierzono tabele łatek Preserve (0.8.0.0 .. 1.3.0.8 oraz 1.0.3.0 / 1.0.3.2), więc postać przesyłania jej slotów jest nieznana i nic nie jest zapisywane',
  'support.unknownFamily':
    'rodzina kamery jest nieznana, więc nieznany jest też klucz, pod którym zapisywane są jej sloty, a kamera przyjmuje slot zapisany pod złym kluczem, po czym nie uruchamia się z niego. Zrób zrzut tej kamery i go odszyfruj, rozpoznaj ją na podstawie zrzutu, a potem podaj jej rodzinę opcją --family.',
  'support.noReadCommand':
    'firmware starszy niż 0.8.0.0 nie ma procedury odczytu dla GetFeaturedFirmwareData, polecenia, którym zrzut odczytuje pamięć flash. W 0.7.0.7 i 0.7.0.8 jest ono w tabeli metod RPC pod 0x4F, ale zarejestrowane tylko jako setter (procedura zapisu), więc odczytu control-IN wysyłanego przez zrzut nie da się obsłużyć (przebieg Preserve odczytuje te dwie kompilacje zamiast tego przez wire id 0x58, GetFeaturedData); przed 0.7.0.7 wire id 0x4F to UploadFirmwareRowSize, a w 0.3.0.1 wire id 0x52 — to, którym zrzut aktywuje okno — to EnterBootloaderMode, a nie BeginFirmwareUpgrade: kamera pozostaje w swojej aplikacji, ale każde aktywowanie ustawia cel w pamięci flash i uruchamia etap aktualizacji firmware tej kompilacji (GetErrorCode odczytuje wtedy 0x00400000), co nie jest oknem odczytu. Odtworzono z własnych tabel metod obrazów, obu kolumn procedur; zobacz test/firmware/facts.json.',
  'support.noWritePath':
    'te kompilacje przyjmują nowy firmware starszą sekwencją aktualizacji, której ten toolkit nie wysyła, a ich sloty nigdy nie zostały zmapowane, więc nic nie jest zapisywane.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'nie udało się odczytać wersji firmware, więc kompilacja, jej sloty i ich postać przesyłania są nieznane; nic nie jest na niej odczytywane ani zapisywane',
  'support.versionNotDotted':
    'wersja firmware „{version}” nie jest wersją z kropkami, więc kompilacja, jej sloty i ich postać przesyłania są nieznane; nic nie jest na niej odczytywane ani zapisywane',
  'support.olderThanFirst':
    'firmware {version} jest starszy niż {first}: jego tabela RPC nie ma procedury odczytu dla GetFeaturedFirmwareData, polecenia wysyłanego przez odczyt slotu, więc nie jest do niego wysyłany ani odczyt, ani zapis (dowody zawiera early-compact)',
  'support.modernOnLocked':
    'rodzina modern-4x obejmuje 2.x, 4.x, 10.x, 42.x i 44.x; {version} należy do zablokowanej linii 0.x / 1.x, która wymaga legacy-auth lub compact-2016',
  'support.lockedOnModern':
    'rodzina legacy-auth obejmuje zablokowaną linię 0.x / 1.x; {version} należy do nowoczesnej linii, która wymaga modern-4x',
  'support.notCompactPro':
    'rodzina compact-2016 obejmuje linię Compact PRO 1.0.3.x; {version} do niej nie należy',
  'support.earlyCompact':
    'rodzina early-compact obejmuje tylko kompilacje starsze niż {first}, a {version} jest odczytywany przez legacy-auth',
  'support.generic':
    'rodzina kamery nie jest rozpoznana (rodzina generic), więc układ slotów i postać przesyłania są nieznane; rozpoznaj kamerę, zanim slot zostanie odczytany lub zapisany',
  'support.noPlan':
    'dla rodziny {family} nie ma planu slotów: jej układ slotów i postać przesyłania są nieznane',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'tabela tej kompilacji nie aktywuje trybu {mode} pod {address} na zwykłym kanale',
  'support.noArmToken':
    'tabela tej kompilacji nie aktywuje trybu {mode} pod {address} na kanale z tokenem',
  'support.windowElsewhere':
    'okno, przez które Preserve czyta {bank}, jest pod {at}, a nie pod {address}',
  'support.noDumpWindow':
    'tabela BeginFirmwareUpgrade tej kompilacji nie ma okna pod {address}, przez które można by odczytać {bank}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} nie obsługuje funkcji „{capability}”: {reason}',
  'support.capability.dump': 'zrzut',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': 'Zrzuć wszystkie selektory',
  'support.capability.decrypt': 'odszyfrowanie',
  'support.capability.deviceInfo': 'pełny odczyt na karcie Info',
  'support.capability.flash': 'zapis slotów',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name} pod {address} nie daje się odczytać w tej kompilacji: jej tabela selektorów nie ma tam okna, więc nic dla niego nie zostało aktywowane',
  'slots.unread.missing': '{name} nie występuje w analizie kamery',
  'slots.unread.notRead': '{name} nie został odczytany',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Nic nie zostało zapisane.',
  'slots.refused.versionUnknown':
    'analiza nie podaje, jaki firmware działa na kamerze, a polecenia slotów znaczą co innego w różnych kompilacjach. Odczytaj ponownie informacje o urządzeniu.',
  'slots.refused.versionUnknownWrite':
    'analiza nie podaje, jaki firmware działa na kamerze. Nic nie zostało zapisane.',
  'slots.refused.emptyInput': 'dane wejściowe są puste',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable':
    '{name} jest pusty i w tej kompilacji nie można go zapisać: {reason}',
  'slots.refused.noRaw': '{name} nie może w tej kompilacji przyjąć surowych bajtów: {reason}',
  'slots.refused.noPlain':
    '{name} nie może w tej kompilacji przyjąć odszyfrowanego obrazu: {reason}',
  'slots.refused.noStaging':
    '{name} nie ma w tej kompilacji postaci przesyłania, więc nie da się dla niego zakodować obrazu',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B to więcej, niż mieści {name} ({bankSize} B)',
  'slots.refused.imageTooLong': 'obraz ma {size} B, więcej, niż mieści {name} ({bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'bootloader z 2014 roku nie przyjmuje sumy kontrolnej tej kompilacji w slocie A ani B i uruchamia slot odzyskiwania R (0x14070000) bez sprawdzenia, więc łatka jest zapisywana w slocie odzyskiwania R i nigdzie indziej',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly':
    'ta kompilacja uruchamia się tylko ze slotu odzyskiwania R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize': 'slot firmware ma {size} B ({kib} KB); ten plik ma {count} B',
  'decryptFile.erasedBank':
    'pusty, nie ma czego odszyfrować: wszystkie {size} B odczytują się jako 0xFF (wymazany slot)',
  'decryptFile.erasedHeader':
    'wymazany: okno nagłówka to same 0xFF, więc slot nie zawiera obrazu; nic nie jest odszyfrowywane',
  'decryptFile.noHeader':
    'brak nagłówka obrazu (sygnatura {magic}), więc nie ma obrazu do odszyfrowania',
  'decryptFile.lengthOutOfRange':
    'header.length {length} jest poza zakresem; brak obrazu do odszyfrowania',
  'decryptFile.ffKeyB':
    'odszyfrowano {size} B kluczem B FF 1.3.0.8: obraz jest przechowywany jako obraz XOR strumień klucza jego bloku kluczy 1, okno nagłówka bez zmian',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'nie odtworzono klucza: obraz odszyfrowuje się do wektora resetu, który nie jest punktem wejścia Cortex-M (klucz {check}); nic nie jest odszyfrowywane',
  'decryptFile.storedPlain':
    'przechowywany jawnie: slot zawiera obraz w postaci, w jakiej działa (łańcuch jawnego tekstu z 2014 roku, tożsamościowy strumień klucza), więc nie ma klucza, a odszyfrowany obraz to sam obraz',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 'odszyfrowano {size} B kluczem odtworzonym z tego slotu ({check})',
  'decryptFile.decryptedNamed':
    'odszyfrowano {size} B kluczem odtworzonym z tego slotu ({check}; to {key})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'niepełny odczyt ({size} B)',
  'read.reason.noParse': 'nie udało się przeanalizować nagłówka obrazu',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'brak nagłówka obrazu (sygnatura {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} jest poza zakresem',
  'read.reason.stopped': 'odczyt slotu zatrzymał się na {count}/{size} B',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'nie daje się odczytać w firmware {version}: jego plan ({table}) nie ma okna pod {address}, więc nic dla niego nie zostało aktywowane',
  'read.reason.notInPlanUnknown':
    'nie daje się odczytać w firmware w nieznanej wersji: jego plan ({table}) nie ma okna pod {address}, więc nic dla niego nie zostało aktywowane',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'okno podało bajty nieaktualnego deskryptora czytnika — słowo 0 {word} z resetem {hex} to tabela wektorów 0x14000000, a nie zawartość tego slotu, więc nic z niego nie analizowano: {remedy}',
  'read.reason.spentReader': 'nie udało się odczytać slotów kamery — {remedy}',
  'read.spentRemedy':
    'czytnik okien mógł się wyczerpać w tym uruchomieniu; wyłącz kamerę, włącz ją ponownie i spróbuj jeszcze raz',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'nie udało się odczytać słowa aktywnego slotu kamery (korzenie fw info, selektor 10)',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'słowo aktywnego slotu kamery ma wartość {word}, która nie wskazuje żadnego slotu',
  'checkKey.unnamed.cfg0NotRead':
    'słowo konfiguracji startu nie zostało odczytane, więc nie wiadomo, czy bootloader sprawdził {bank}, zanim do niego wszedł',
  'checkKey.unnamed.noZeroSum':
    'kamera podaje, że uruchomiła {bank}, ale w tym odczycie {bank} nie odszyfrowuje się do zerowej sumy słów',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'kamera podaje, że uruchomiła {bank}, który słowo konfiguracji startu {word} zostawia na koniec, więc bootloader wszedł do niego bez sprawdzenia, ale w tym odczycie {bank} nie odszyfrowuje się do zerowej sumy słów',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (wynik {score} po odczycie, na podstawie poniższych dowodów)',
  'report.detectedAmbiguous':
    '{family} (wynik {score} po odczycie, na podstawie poniższych dowodów; niejednoznaczne)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'tak',
  'report.cell.no': 'nie',
  'report.cell.notApplicable': 'nd.',
  'report.cell.unknown': 'nieznane',
  'report.cell.recoveryOnly': 'tylko odzyskiwanie',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'K wybielania',
  'report.keyRow.store': 'klucz zapisu',
  'report.keyRow.check': 'klucz sprawdzający',
  'report.keyRow.table': 'tabela kluczy',
  'report.keyRow.keys': 'klucze',
  'report.keyRow.a': 'klucz A',
  'report.keyRow.b': 'klucz B',
  'report.keyRow.tableAt': 'tabela pod',
  'report.key.notIdentified': '(nierozpoznany)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} kandydat, niepotwierdzony',
    few: '{count} kandydaci, żaden niepotwierdzony',
    many: '{count} kandydatów, żaden niepotwierdzony',
    other: '{count} kandydata, żaden niepotwierdzony',
  },
  'report.key.tableAt': '{offset} w bloku bootloadera, potwierdzona na slocie',
  'report.key.plainChain':
    'niepotrzebny: sloty są przechowywane jako jawny firmware, więc slot jest odczytywany i zapisywany bez zmian',
  'report.key.tableRefused2016':
    'nie odczytano — blok bootloadera (0x14000000) jest w tej linii odrzucany na każdym kanale',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, wskazany na podstawie {bank:gen}, slotu, który według kamery uruchomiła po sprawdzeniu przez bootloader',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, wywnioskowany ze {bank:gen}, slotu, który według kamery uruchomiła; bootloader wchodzi do tego slotu bez sprawdzenia i uruchamia go pod kluczem, którym sprawdza pozostałe sloty',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' (blok 1, {pair})',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'para Compact PRO 1.0.3.x 9 Hz',
  'keyPair.cp1032ff': 'para Compact PRO 1.0.3.x FF',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'niewskazany — {why}',
  'report.checkKey.couldNotName': 'odczyt nie potrafił go wskazać',
  'report.storeKey.checkKeyUnnamed':
    'klucz, którym bootloader sprawdza slot (ten odczyt go nie podał): aplikacja przechowuje pod tym kluczem każdy zapisywany slot',
  'report.storeKey.checkKey':
    '{key}: aplikacja przechowuje każdy zapisywany slot pod kluczem, który sprawdza jej bootloader',
  'report.storeKey.unknown':
    'nieznany — blok bootloadera zawierający miejsce na klucz urządzenia nie został odczytany',
  'report.storeKey.keyBUnidentified':
    'klucz B (klucz urządzenia niezaprogramowany; sam klucz B nierozpoznany)',
  'report.storeKey.keyB': 'klucz B (klucz urządzenia niezaprogramowany)',
  /** How each bank is staged: said after "each bank" (info:report.oneBank). */
  'report.staged.plain': 'przesyłany jawnie (obraz bez zmian, bez klucza)',
  'report.staged.slotKeystream': 'przesyłany z szyfrowaniem własnym blokiem kluczy 0 obrazu',
  'report.staged.keyA':
    'przesyłany z szyfrowaniem kluczami wyprowadzonymi z uruchomionego slotu i działającej aplikacji',
  'report.staged.ffVendor':
    'przesyłany tak, jak aplikacja producenta przesyła obraz 16 Hz FF (obraz XOR jego własny blok kluczy 0), i przechowywany przez kamerę pod kluczem B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Kopia zapasowa: blok {address}',
  'progress.backupDone': 'Kopia zapasowa: odczytano każdy blok',
  'progress.checkBlock': 'Sprawdzenie: blok {address}',
  'progress.checkDone': 'Sprawdzenie: odczytano każdy blok',
  'progress.writingBank': 'Zapisywanie {bank:gen}',
  'progress.restoringBank': 'Przywracanie {bank:gen}',
  'progress.staged': '{label}: przesłano {done}/{total} B',
  'progress.wholeFlash': 'Pełny odczyt: {got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'odczyt {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'odczyt {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Gotowe — odczytane okna: {ok}/{total}.',
  'progress.readingBank': 'Odczyt {bank:gen} ...',
  'progress.analysing': 'Analiza ...',
  'progress.probeSelector': 'sprawdzanie selektora {selector} ...',
  'progress.selectorsArmed': 'Gotowe — aktywowane selektory: {armed}/{span}, z danymi: {withData}.',
  'progress.recoveringKey': 'odszyfrowanie: odtwarzanie klucza dla {address} ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} {address} (subcmd {subcmd}) nie dał się odczytać: {error}',
  'slots.read.refusedBuild':
    'odmowa odczytu slotów firmware: {reason}. Poza odczytem wersji nic nie zostało wysłane, więc żaden slot nie został naruszony.',
  'slots.backup.notSaved':
    'kopia zapasowa {file} nie została zachowana, więc nic nie zostało zapisane. Zapis nigdy nie jest wykonywany bez wcześniej zachowanej kopii zapasowej; spróbuj ponownie, gdy będzie można ją zachować.',
  'slots.backup.notSavedWhy':
    'kopia zapasowa {file} nie została zachowana ({error}), więc nic nie zostało zapisane. Zapis nigdy nie jest wykonywany bez wcześniej zachowanej kopii zapasowej; spróbuj ponownie, gdy będzie można ją zachować.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'high speed (480 Mbit/s)',
  'usb.speed.full': 'full speed (12 Mbit/s)',
  'usb.speed.code': 'kod {code}',
} satisfies Translation<'core'>;
