/**
 * Namespace `preserve`, Polski (pl), translated from the English source: the "Dump & decrypt 0.x/1.x 2014/2016" tab, a guided run that
 * backs up the camera, writes a temporary patch so the whole flash can be read, then puts the original
 * firmware back and checks it.
 *
 * Owner: phase 2, preserve agent.
 * Covers: views/PreserveView.tsx, hooks/usePreservePanel.ts, lib/preserve/* (gating.ts, types.ts).
 *
 * Words used all over this tab:
 * - run = one pass of the wizard on one camera, from the backup to the check. Run file = the zip the
 *   browser downloads after every step; it is the run's only record and lets a run continue later.
 * - Step 01 is Connect (shared with the other tabs); the phases are steps 02, 03 and 04. "Step 02"…
 *   keep the two-digit numbers.
 * - bank = one of the camera's three firmware slots, A, B and R (R = recovery). {bank}, {a}, {b}, {r}
 *   and {banks} are names from common:bank.*: "Slot A" / "Recovery R" on their own, "slot A" /
 *   "recovery R" inside a sentence. {banks} is a list of those names ("slot A, slot B and recovery R").
 * - the write = the patch written into the chosen banks (step 03); the restore = the original firmware
 *   written back (step 04); the whole-flash read = reading the full 4 MiB flash once the patch runs.
 * - "Connect device" is the page's connect button (app:connect.connect): use the same words.
 * - The step names on the chips (Backup, Patch, Write, Whole-flash read, Restore, Check) are core's
 *   words, translated in core:preserve.step.*. The sentences core writes ({why}, {reason}, {what},
 *   {build}…) arrive already translated, from the `core` namespace.
 * - SPI, SWD/J-Link, MiB/KiB, sha256, hex values and file names stay as they are.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* ---- "What to expect", the first section ---- */
  'how.title': 'Czego się spodziewać',
  'how.descriptionIdle': 'Połącz kamerę, a potem zacznij od kroku 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Przebieg {runId}.',
  'how.descriptionRunVersion': 'Przebieg {runId} — firmware {version}.',
  'how.restarts':
    'Kamera **uruchamia się ponownie** w trakcie każdego kroku. Po ponownym uruchomieniu Chrome już jej nie rozpoznaje (nie ma ona numeru seryjnego USB), więc strona prosi o naciśnięcie **Połącz urządzenie** i ponowne wybranie kamery. To normalny przebieg — potem krok sam działa dalej.',
  'how.noFile': 'Nie trzeba wybierać pliku firmware: wszystko jest odczytywane z samej kamery.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'Kamera przechowuje firmware w trzech **slotach** ({a}, {b} i {r}). Krok 02 odczytuje wszystkie trzy i ustala, z którego kamera uruchomi się następnym razem; łatka działa tylko wtedy, gdy zawiera ją ten slot. Sloty, które łata krok 03, wybierasz sam — domyślnie ten, z którego nastąpi następne uruchomienie — a krok 04 przywraca każdy z nich.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'Po każdym kroku przeglądarka pobiera **plik przebiegu** nazwany od początku przebiegu, czasu zapisu i osiągniętego kroku (`{example}`), z jednym folderem na każdy krok w środku. Zachowaj najnowszy — pozwala kontynuować później.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**Kroki 03 i 04 zapisują do pamięci flash kamery** i każdy z nich najpierw prosi o potwierdzenie. Gdy jeden z nich działa, nie odłączaj kamery (chyba że strona o to poprosi) i nie pozwól komputerowi zasnąć, najlepiej zasilaj go z sieci. Przerwany zapis pozostawia kamerę, którą naprawi tylko programator sprzętowy (SPI lub SWD/J-Link).',
  'how.phone':
    '**Na telefonie:** przed krokiem 03 włącz tryb samolotowy i wyłącz Wi-Fi oraz dane komórkowe, aby połączenie lub powiadomienie nie oderwało przeglądarki w trakcie zapisu — i nie pozwól, aby ekran się wyłączył. Po otwarciu strona działa dalej bez sieci.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**Zapis nie jest zarejestrowany w tym przebiegu, więc kroki po nim są zablokowane.** Kamera może już uruchamiać załatany obraz (przerwany zapis) albo nie (zapis w ogóle się nie rozpoczął) — plik przebiegu nie może tego rozstrzygnąć. Nie uruchamiaj pełnego odczytu pamięci flash ani przywracania na załatanej kamerze, jeśli zapis nie jest zarejestrowany; dalsza droga to krok 03, którego sprawdzenie przed zapisem odczytuje slot i odmawia ponownego zapisu na ślepo. Tylko jeśli to sprawdzenie już odmówiło z komunikatem *already holds the patched bytes*, można przeskoczyć dalej — i to przez osobne okno dialogowe.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Odczyt i przygotowanie',
  'phase.readBuild.inSentence': 'odczyt i przygotowanie',
  'phase.readBuild.description':
    'Odczytuje wszystko, co udostępnia kamera w oryginalnym stanie — 31 bloków po 64 KB — i zachowuje to jako kopię zapasową, odczytuje każdy slot firmware drugi raz, ustala, z którego slotu kamera uruchomi się następnym razem, i przygotowuje małą łatkę, którą zapisuje następny krok. Do kamery nic nie jest zapisywane. Zwykle trwa to krócej niż minutę. Jeśli po drodze kamera musi się ponownie uruchomić, strona prosi o naciśnięcie „Połącz urządzenie” i ponowne jej wybranie — tak ma być.',
  'phase.patchDump.label': 'Zapis i pełny odczyt',
  'phase.patchDump.inSentence': 'zapis i pełny odczyt',
  'phase.patchDump.description':
    'Zapisuje małą, tymczasową łatkę w slotach firmware wybranych w kroku 02 (domyślnie w slocie, z którego kamera uruchomi się następnym razem), aby można było odczytać całą jej pamięć flash. Potem kamera uruchamia się ponownie — gdy strona poprosi, naciśnij „Połącz urządzenie” i wybierz ją jeszcze raz — i odczytywane są całe 4 MB pamięci flash. Krok 04 przywraca oryginalny firmware.',
  'phase.restoreVerify.label': 'Przywrócenie i sprawdzenie',
  'phase.restoreVerify.inSentence': 'przywrócenie i sprawdzenie',
  'phase.restoreVerify.description':
    'Zapisuje z powrotem oryginalny firmware, uruchamia kamerę ponownie (gdy pojawi się prośba, naciśnij „Połącz urządzenie” i wybierz ją jeszcze raz), a potem odczytuje wszystko jeszcze raz, aby sprawdzić, czy zgadza się z kopią zapasową bajt w bajt.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Odczytuje 31 bloków po 64 KB, które da się odczytać z kamery w oryginalnym stanie, potem odczytuje każdy slot drugi raz (oba odczyty muszą się zgadzać bajt w bajt), wydobywa firmware każdego slotu z tego, co przechowuje kamera (odszyfrowując tam, gdzie jest przechowywany w postaci zaszyfrowanej), i go sprawdza, a także ustala, z którego slotu kamera uruchomi się następnym razem. To jedyna kopia tej kamery w przebiegu, wykonana, zanim cokolwiek zostanie zapisane.',
  'step.patch.description':
    'Offline, bez kamery. Przygotowuje łatkę dla każdego slotu, który przebieg może zapisać: pozwala ona odczytowi kamery sięgnąć do całych 4 MB pamięci flash i jest zapisywana w postaci, w jakiej przechowuje ją kamera, więc zmieniają się tylko bajty samej łatki.',
  'step.commit.description':
    'Zapis. Najpierw odczytuje każdy wybrany slot i nic nie zapisuje, jeśli którykolwiek nie zawiera już tego, co zarejestrowała kopia zapasowa (zapis, który już się wykonał, nigdy nie jest powtarzany), potem zapisuje każdy z nich, a slot, który kamera próbuje jako pierwszy, na końcu. Kamera nie jest tu uruchamiana ponownie: robi to następny krok.',
  'step.drain.description':
    'Uruchamia kamerę ponownie, aby uruchomiła załatany firmware (przez około dziesięć sekund nie odpowiada; strona czeka i znajduje ją ponownie), sprawdza, z którego slotu się uruchomiła (slot bez łatki zatrzymuje krok, zanim cokolwiek zostanie odczytane), potem odczytuje całe 4 MB pamięci flash jednym odczytem i wstawia do zachowanego obrazu oryginalny firmware każdego zapisanego slotu z kopii zapasowej. Nic nie jest zapisywane.',
  'step.restore.description':
    'Drugi zapis. Zapisuje z powrotem oryginalny firmware każdego zapisanego slotu, póki działa jeszcze załatany firmware, a potem uruchamia kamerę ponownie.',
  'step.verify.description':
    'Po świeżym uruchomieniu odczytuje ponownie 31 bloków, a wśród nich każdy slot: 0 różniących się bajtów dowodzi, że pamięć flash kamery jest identyczna co do bajtu z kopią zapasową. Tylko odczyt.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Rozpocznij {phase}',
  'phase.retry': 'Ponów {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Przejdź do kroku 04: przywróć sloty',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Pomiń niezarejestrowany zapis',
  'phase.skipWrite': 'Pomiń zapis — zacznij od pełnego odczytu',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': 'Działania: {phase}',
  /* The badges beside the step's title. */
  'badge.writes': 'zapisuje do kamery',
  'badge.running': 'W toku',
  'badge.done': 'Gotowe',
  'badge.plannedStop': 'Zatrzymano zgodnie z planem — teraz przywrócenie',
  'badge.failed': 'Zatrzymano — zobacz dziennik',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Następny',
  /* Why the start button is off. */
  'notReady.noRun': 'Dostępne po kroku 02 — on rozpoczyna przebieg.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Dostępne po kroku {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Jeszcze niegotowe — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Dotyczy załatanej kamery, gdy zapis nie jest zarejestrowany — kamera może już być załatana. Zobacz uwagę w sekcji „{section}”.',
  'phase.noDrain':
    'Pełny odczyt pamięci flash nie został wykonany — ten krok przywraca kamerę bez niego. Najpierw wykonaj krok 03, chyba że pełny odczyt nie ma dla Ciebie znaczenia.',
  'phase.keepPlugged':
    'Nie odłączaj kamery i nie pozwól komputerowi zasnąć, dopóki ten krok się nie zakończy.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Postęp',
  'phase.showDetails': 'Pokaż szczegóły w dzienniku',
  'phase.inDetail': 'Co dokładnie robi ten krok',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Twoja kolej',
  'yourTurn.reconnect.title': 'Twoja kolej: naciśnij „Połącz urządzenie” i wybierz kamerę.',
  'yourTurn.reconnect.body':
    'Kamera uruchomiła się ponownie, zgodnie z planem. Chrome nie potrafi sam jej ponownie rozpoznać (nie ma ona numeru seryjnego USB), więc trzeba ją wybrać jeszcze raz. Krok działa dalej, gdy tylko to zrobisz.',
  'yourTurn.replug.title':
    'Twoja kolej: odłącz kamerę, podłącz ją ponownie, a potem naciśnij „Połącz urządzenie”.',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'Łatka tego przebiegu powstała przed poprawką czytnika, więc przed przywróceniem kamera musi zostać świeżo włączona. Plik przebiegu jest już zapisany.',
  'yourTurn.replugBeforeRestore.title':
    'Przed krokiem 04: odłącz kamerę, podłącz ją ponownie, a potem naciśnij „Połącz urządzenie”.',
  'yourTurn.powerCycle.title':
    'Twoja kolej: odłącz kamerę, podłącz ją ponownie, naciśnij „Połącz urządzenie” — a potem spróbuj jeszcze raz.',
  'yourTurn.powerCycle.body':
    'Czytnik kamery wymaga świeżego włączenia, zanim będzie można ją znowu odczytać. Przebieg jest nadal wczytany; nic nie przepadło.',
  'yourTurn.powerCycleAssert.title':
    'Twoja kolej: odłącz kamerę, podłącz ją ponownie, naciśnij „Połącz urządzenie” — a potem kontynuuj.',
  'yourTurn.powerCycleAssert.body':
    'Ostatnia próba kopii zapasowej została przerwana, a kamera wymaga świeżego włączenia, zanim zadziała ponownie. Kamera nie potrafi tego sama zgłosić, więc przycisk poniżej informuje stronę, że zostało to zrobione.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Podłączono ponownie — kontynuuj {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Które sloty łata krok 03',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Słowo konfiguracji startu',
  'banks.lastStart': 'Ostatnie uruchomienie',
  'banks.nextStart': 'Następne uruchomienie',
  'banks.caption': 'Trzy sloty firmware w postaci odczytanej w kroku 02',
  'banks.col.bank': 'Slot',
  'banks.col.address': 'Adres',
  'banks.col.holds': 'Zawartość',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'następne uruchomienie',
  'banks.choiceLabel': 'Sloty do załatania',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'Slot następnego uruchomienia',
  'choice.all': 'Wszystkie sloty',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — niedostępne',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen': 'Nie wybrano jeszcze slotu: {what}. Wybierz slot z nazwy powyżej.',
  'banks.writes': 'Krok 03 zapisze: {what}.',
  'banks.fixed':
    'Zapis został wykonany, więc wybór jest ustalony: krok 04 przywróci dokładnie te sloty.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: niedostępne — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'żaden przebieg nie jest aktywny — rozpoczyna go krok 02',
  'banks.refusedBusy': 'trwa krok — wybierz sloty, gdy się zakończy',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'Plan — {build}, łata {banks}',
  'plan.summaryNone': 'Plan — {build}, nie wybrano jeszcze slotu',
  'plan.yourCamera': 'Twoja kamera',
  'plan.intro':
    'Na podstawie bajtów samej kamery. Nic nie jest zapisywane, dopóki nie zostanie wykonany krok 03, a krok 04 przywraca każdy zapisany bajt.',
  /* The rows; their values are core's. */
  'plan.build': 'Kompilacja',
  'plan.version': 'Wersja firmware',
  'plan.written': 'Zapisywane',
  'plan.route': 'Dokąd trafia',
  'plan.restore': 'Przywrócenie',
  'plan.wholeFlash': 'Pełny odczyt pamięci flash',
  'plan.outro':
    'W postaci przechowywanej przez kamerę zmieniają się te same bajty i żadne inne, więc firmware kamery zmienia się dokładnie o tę różnicę i nic więcej.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'Łatka: {bank}',
  'bankPlan.titleChosen': '{bank} — zapisywany w tym przebiegu',
  'bankPlan.titleNotChosen': '{bank} — niewybrany',
  'bankPlan.source': 'Źródło obrazu',
  'bankPlan.sourceValue': '{bank} w postaci przechowywanej',
  'bankPlan.sourceTwoReads': '{bank} w postaci przechowywanej, dwa zgodne odczyty (sha256 {sha})',
  'bankPlan.edit': 'Zmiana obrazu',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) w obrazie fabrycznym. Jej wyrównanie, {balance}, jest w słowie korekty; łatka wyrównuje sumę ponad nim, a krok 04 przywraca obraz razem z tą zmianą.',
  'bankPlan.factorySha': 'sha256 fabrycznego jawnego tekstu',
  'bankPlan.patchedSha': 'sha256 po łatce',
  'bankPlan.diffCount': 'Bajty zmieniane w układzie',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Długość przesyłanych danych',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    one: '{size} B w {count} porcji',
    few: '{size} B w {count} porcjach',
    many: '{size} B w {count} porcjach',
    other: '{size} B w {count} porcji',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Słowo wyrównania',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (było {balance}, wyrównanie zmiany)',
  'bankPlan.caption': 'Dokładne bajty zmieniane przez łatkę — {bank}',
  'bankPlan.col.what': 'Co zmienia',
  'bankPlan.col.offset': 'Przesunięcie',
  'bankPlan.col.before': 'Przed',
  'bankPlan.col.after': 'Po',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Zweryfikowano — pełna zgodność.** Po świeżym uruchomieniu kamera została odczytana ponownie: bloki {read}/31, różniące się bajty: {count}. Jej pamięć flash jest dokładnie taka, jak przed pierwszym zapisem.',
    few: '**Zweryfikowano — pełna zgodność.** Po świeżym uruchomieniu kamera została odczytana ponownie: bloki {read}/31, różniące się bajty: {count}. Jej pamięć flash jest dokładnie taka, jak przed pierwszym zapisem.',
    many: '**Zweryfikowano — pełna zgodność.** Po świeżym uruchomieniu kamera została odczytana ponownie: bloki {read}/31, różniące się bajty: {count}. Jej pamięć flash jest dokładnie taka, jak przed pierwszym zapisem.',
    other:
      '**Zweryfikowano — pełna zgodność.** Po świeżym uruchomieniu kamera została odczytana ponownie: bloki {read}/31, różniące się bajty: {count}. Jej pamięć flash jest dokładnie taka, jak przed pierwszym zapisem.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Zweryfikowano — pełna zgodność.** Po świeżym uruchomieniu kamera została odczytana ponownie: bloki {read}/31, różniące się bajty: {count} (krótkie bloki: {blocks}). Jej pamięć flash jest dokładnie taka, jak przed pierwszym zapisem.',
    few: '**Zweryfikowano — pełna zgodność.** Po świeżym uruchomieniu kamera została odczytana ponownie: bloki {read}/31, różniące się bajty: {count} (krótkie bloki: {blocks}). Jej pamięć flash jest dokładnie taka, jak przed pierwszym zapisem.',
    many: '**Zweryfikowano — pełna zgodność.** Po świeżym uruchomieniu kamera została odczytana ponownie: bloki {read}/31, różniące się bajty: {count} (krótkie bloki: {blocks}). Jej pamięć flash jest dokładnie taka, jak przed pierwszym zapisem.',
    other:
      '**Zweryfikowano — pełna zgodność.** Po świeżym uruchomieniu kamera została odczytana ponownie: bloki {read}/31, różniące się bajty: {count} (krótkie bloki: {blocks}). Jej pamięć flash jest dokładnie taka, jak przed pierwszym zapisem.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**Sprawdzenie wykazało różnice względem kopii zapasowej.** {error}',
  unknownReason: 'nieznana przyczyna',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — zapisać na {banks}?',
  'confirm.titleJump': '{phase} — pominąć niezarejestrowany zapis?',
  'confirm.chosenBanks': 'wybrane sloty',
  'confirm.jump':
    'ZAPIS NIE JEST ZAREJESTROWANY w tym przebiegu, a stwierdzasz, że zapisy się wykonały, choć brak ich punktów kontrolnych: krok zaczyna się za zapisem, zamiast zapisywać ponownie. Własne sprawdzenia kroków nadal działają — odczyt wersji, sprawdzenia slotów — a błędne założenie kosztuje zmarnowany pełny odczyt pamięci flash, a nie trwale unieruchomioną kamerę.',
  'confirm.jumpKeepPlugged':
    'Nie odłączaj kamery i nie pozwól komputerowi zasnąć, dopóki krok się nie zakończy.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Mała łatka zostanie zapisana na {banks}. Krok 04 przywraca oryginały. Następujący potem pełny odczyt pamięci flash tylko odczytuje.',
  'confirm.patchInOrder':
    'Mała łatka zostanie zapisana na {banks}, w tej kolejności — slot, który kamera próbuje jako pierwszy, na końcu. Krok 04 przywraca oryginały. Następujący potem pełny odczyt pamięci flash tylko odczytuje.',
  /* Step 04. */
  'confirm.restore': 'Oryginalny firmware zostanie zapisany z powrotem na {banks}.',
  'confirm.restoreInOrder':
    'Oryginalny firmware zostanie zapisany z powrotem na {banks}, w tej kolejności — slot, który kamera próbuje jako pierwszy, jako pierwszy.',
  'confirm.keepPlugged':
    'Podczas zapisu nie odłączaj kamery i nie pozwól komputerowi zasnąć — przerwany zapis pozostawia kamerę, którą naprawi tylko programator sprzętowy (SPI lub SWD/J-Link). Na telefonie włącz tryb samolotowy i nie pozwól, aby ekran się wyłączył. Potem kamera uruchomi się ponownie; gdy strona poprosi, naciśnij „Połącz urządzenie” i wybierz ją jeszcze raz. Tak ma być.',
  'confirm.yesJump': 'Tak — pomiń zapis',
  'confirm.yesWrite': 'Tak — zapisz do kamery',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'Dowód',
  'summary.complete': 'Pełny obraz (4 MB)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'nie utworzono',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'różni się od kopii zapasowej w {differing} z {count} bloku: {blocks}',
    few: 'różni się od kopii zapasowej w {differing} z {count} bloków: {blocks}',
    many: 'różni się od kopii zapasowej w {differing} z {count} bloków: {blocks}',
    other: 'różni się od kopii zapasowej w {differing} z {count} bloku: {blocks}',
  },
  'summary.matches': {
    one: 'zgadza się z kopią zapasową w jej {count} bloku',
    few: 'zgadza się z kopią zapasową we wszystkich {count} blokach',
    many: 'zgadza się z kopią zapasową we wszystkich {count} blokach',
    other: 'zgadza się z kopią zapasową we wszystkich {count} bloku',
  },
  'summary.onlyInFull': 'Tylko w pełnym odczycie pamięci flash',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} blok, do którego nie sięga zwykły odczyt: {blocks}',
    few: '{count} bloki, do których nie sięga zwykły odczyt: {blocks}',
    many: '{count} bloków, do których nie sięga zwykły odczyt: {blocks}',
    other: '{count} bloku, do których nie sięga zwykły odczyt: {blocks}',
  },
  'summary.rawDump': 'Pełny odczyt pamięci flash, w postaci odczytanej',
  'summary.rawDumpBadge': 'to samo, z wciąż obecną łatką',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Obraz firmware (odszyfrowany, {bank})',
  'summary.verify': 'Weryfikacja',
  'summary.toolbar': 'Działania na archiwum',
  'summary.download': 'Pobierz pełne archiwum (plik przebiegu)',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Opcjonalnie — aby kontynuować przebieg później',
  'runFile.title': 'Plik przebiegu',
  'runFile.description':
    'Jedyny zapis przebiegu. Pobiera się sam po każdym kroku (także po kroku, który zatrzymał się wcześniej); zachowaj najnowszy. Aby kontynuować później albo po problemie, wczytaj go tutaj, a strona podejmie pracę w miejscu, w którym ją przerwano.',
  'runFile.run': 'Przebieg',
  'runFile.file': 'Plik',
  'runFile.lastSaved': 'Ostatni zapis',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'po {step} — {at} ({bytes} B)',
  'runFile.nextStep': 'Następny krok',
  'runFile.none':
    'Żaden przebieg nie jest aktywny. Rozpoczyna go krok 02; można też wczytać tu plik przebiegu.',
  'runFile.toolbar': 'Działania na pliku przebiegu',
  'runFile.load': 'Wczytaj plik przebiegu…',
  'runFile.save': 'Zapisz plik przebiegu ponownie',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Wznowienie',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Nie wybrano pliku przebiegu.',
  'status.notRun': 'Jeszcze nie uruchomiono.',
  'status.running': 'W toku …',
  'status.runningRestarts': 'W toku — kamera uruchamia się ponownie w trakcie tego kroku …',
  'status.restarting': 'Kamera uruchamia się ponownie — trwa to około dziesięciu sekund …',
  'status.waitConnect': 'Czekam na Ciebie — naciśnij „Połącz urządzenie” i wybierz kamerę …',
  'status.waitPlugBack':
    'Czekam na Ciebie — podłącz kamerę ponownie, a potem naciśnij „Połącz urządzenie” …',
  'status.waitReplug': 'Czekam na Ciebie — odłącz kamerę i podłącz ją ponownie …',
  'status.back': 'Kamera wróciła — kontynuowanie …',
  'status.swapped': 'Zatrzymano — kamera się zmieniła. Sprawdź ją, a potem uruchom etap ponownie.',
  'status.noRun': 'Brak przebiegu.',
  'status.notCreated': 'Nie utworzono — zobacz dziennik powyżej.',
  'status.refused': 'Odmowa — lista etapów powyżej podaje, czego brakuje.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} — gotowe. Plik przebiegu w pobranych plikach jest aktualny.',
  'status.doneReplug':
    '{phase} — gotowe, plik przebiegu jest zapisany. Przed przywróceniem: odłącz kamerę, podłącz ją ponownie i naciśnij „Połącz urządzenie”.',
  'status.backupRefused': 'Odmowa — nic nie zostało zapisane. Zobacz dziennik powyżej.',
  'status.failed': 'Niepowodzenie — zobacz dziennik powyżej.',
  'status.cancelled': 'Anulowano — plik przebiegu nadal mówi, gdzie przebieg się zatrzymał.',
  'status.readingFile': 'Odczyt pliku przebiegu …',
  'status.doneEarlier': 'Wykonano wcześniej — wczytano z pliku przebiegu.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Wcześniej nie powiodło się: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Wznowiono od {step}. Lista etapów kontynuuje od tego miejsca.',
  'status.notResumed': 'Nie wznowiono — zobacz dziennik powyżej.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'wymaga: {missing}',
  'gate.noRun': 'żaden przebieg nie jest aktywny — tworzy go pierwszy etap',
  'gate.runDone': 'ten przebieg jest zakończony — wszystkie etapy wykonano',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'już wykonano — wznowienie kontynuuje od {step}',
  'gate.banksRead': 'sloty odczytywane przez kopię zapasową',
  'gate.choice': 'wybór slotów — {why}',
  'gate.bankRefused': '{bank} nie może zostać zapisany: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'droga przez slot odzyskiwania (w tej kompilacji startuje tylko {r}, a nie {bank})',
  'gate.backupFirst': 'kopia zapasowa pamięci flash (wykonywana jako pierwsza w tym etapie)',
  'gate.backup': 'kopia zapasowa pamięci flash',
  'gate.patchStep': 'krok łatki',
  'gate.patchOf': 'łatka ({bank})',
  'gate.backupFile': 'plik okien kopii zapasowej',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': 'przechwycone dane ({bank})',
  'gate.derived': 'wyprowadzony obraz ({bank})',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'krok „Zapis” (najpierw wykonaj go lub wznów od niego)',
  'gate.drainRefused':
    'pełny odczyt pamięci flash jest niedostępny dla tej kompilacji ({build}) — {why}',
  'gate.patchSummary': 'podsumowanie łatki ({bank}; długość przesyłanych danych)',
  'gate.restoreRefused':
    'przywracanie jest niedostępne dla tej kompilacji ({build}) — żadna postać oryginalnego firmware nie zapisuje się z powrotem jako oryginalne bajty; przebieg kończy się pełnym obrazem i łatką na miejscu',
  /* {file} is a file name in the run file. */
  'gate.plaintext': 'fabryczny jawny tekst ({bank}; {file}, z kroku kopii zapasowej)',
  'gate.restoreFirst': 'przywrócenie (wykonywane jako pierwsze w tym etapie)',
  'gate.powerCycle':
    'potwierdzenie wyłączenia i włączenia — wyłącz i włącz kamerę ponownie (odłącz ją i podłącz albo użyj jej wyłącznika), a potem użyj przycisku ponownego uruchomienia',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'kamera nie wróciła po {minutes} min ponawiania prób: {error} — jeśli Chrome o nic nie pytał, podłącz kamerę ponownie i uruchom etap jeszcze raz; jeśli dziennik kazał połączyć ją ponownie, czekał na kliknięcie „Połącz urządzenie”',
} satisfies Translation<'preserve'>;
