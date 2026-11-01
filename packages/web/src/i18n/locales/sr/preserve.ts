/**
 * Namespace `preserve`, srpski (sr), translated from the English source: the "Dump & decrypt 0.x/1.x" tab, a guided run that
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
  'how.title': 'Šta da očekujete',
  'how.descriptionIdle': 'Povežite kameru, pa počnite od koraka 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Sesija {runId}.',
  'how.descriptionRunVersion': 'Sesija {runId} — firmver {version}.',
  'how.restarts':
    'Kamera se **ponovo pokreće** tokom svakog koraka. Posle ponovnog pokretanja Chrome je više ne prepoznaje (nema USB serijski broj), pa stranica traži da pritisnete **Poveži uređaj** i ponovo izaberete kameru. To je uobičajen tok — korak se sam nastavlja čim to uradite.',
  'how.noFile': 'Nema datoteke firmvera koju treba izabrati: sve se čita iz same kamere.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'Kamera čuva firmver u tri **slota** ({a}, {b} i {r}). Korak 02 čita sva tri i utvrđuje iz kog će se kamera sledeći put pokrenuti; zakrpa radi samo ako je u tom slotu. Vi birate slotove koje korak 03 krpi — podrazumevano onaj u koji ulazi sledeće pokretanje — a korak 04 vraća svaki od njih.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'Posle svakog koraka vaš pregledač preuzima **datoteku sesije** nazvanu po početku sesije, vremenu čuvanja i koraku do kog je stigla (`{example}`), sa po jednom fasciklom za svaki korak. Sačuvajte najnoviju — ona vam omogućava da nastavite kasnije.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**Koraci 03 i 04 upisuju u fleš kamere**, i svaki od vas prvo traži potvrdu. Dok jedan od njih traje, držite kameru priključenu (osim ako stranica ne zatraži da je ponovo priključite) i računar budan, najbolje na mrežnom napajanju. Prekinut upis ostavlja kameru koju može da popravi samo hardverski programator (SPI ili SWD/J-Link).',
  'how.phone':
    '**Na telefonu:** pre koraka 03 uključite režim rada u avionu i isključite Wi-Fi i mobilne podatke, da poziv ili obaveštenje ne bi odvukli pregledač usred upisa — i držite ekran uključen. Kada je jednom otvorena, stranica radi i bez mreže.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**Upis nije zabeležen za ovu sesiju, pa su koraci posle njega zatvoreni.** Kamera možda već pokreće zakrpljenu sliku (prekinut upis), a možda i ne (upis nije ni počeo) — datoteka sesije ne može da dokaže šta je od toga. Ne pokrećite čitanje celog fleša ni vraćanje na zakrpljenoj kameri bez zabeleženog upisa; put napred je korak 03, čija provera pre upisa čita slot i odbija da ga ponovo upiše naslepo. Preskok važi samo ako je ta provera već odbila sa porukom *already holds the patched bytes* — i ide kroz sopstveni dijalog.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Čitanje i priprema',
  'phase.readBuild.inSentence': 'čitanje i pripremu',
  'phase.readBuild.description':
    'Čita sve što obična kamera daje — 31 blok od 64 KB — i čuva to kao vašu rezervnu kopiju, još jednom čita svaki slot firmvera, utvrđuje iz kog slota će se kamera sledeći put pokrenuti i priprema malu zakrpu koju upisuje sledeći korak. Ništa se ne upisuje u kameru. Obično traje manje od minuta. Ako kamera usput treba da se ponovo pokrene, stranica traži da pritisnete „Poveži uređaj“ i ponovo je izaberete — to je očekivano.',
  'phase.patchDump.label': 'Upis i čitanje celog fleša',
  'phase.patchDump.inSentence': 'upis i čitanje celog fleša',
  'phase.patchDump.description':
    'Upisuje malu, privremenu zakrpu u slotove firmvera izabrane u koraku 02 (podrazumevano u slot iz kog se kamera sledeći put pokreće), da bi kamera mogla da iščita ceo svoj fleš. Zatim se kamera ponovo pokreće — pritisnite „Poveži uređaj“ i ponovo je izaberite kada stranica zatraži — i čita se ceo fleš od 4 MB. Korak 04 vraća originalni firmver.',
  'phase.restoreVerify.label': 'Vraćanje i provera',
  'phase.restoreVerify.inSentence': 'vraćanje i proveru',
  'phase.restoreVerify.description':
    'Vraća vaš originalni firmver, ponovo pokreće kameru (pritisnite „Poveži uređaj“ i ponovo je izaberite kada se zatraži), a zatim još jednom čita sve da proveri da li se bajt po bajt poklapa sa rezervnom kopijom.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Čita 31 blok od 64 KB koje obična kamera može da pročita, zatim još jednom čita svaki slot (dva čitanja moraju se bajt po bajt poklopiti), izvlači firmver svakog slota iz onoga što kamera čuva (dešifrovan tamo gde se čuva šifrovan) i proverava ga, i utvrđuje iz kog slota se kamera sledeći put pokreće. Ovo je jedina kopija ove kamere u sesiji, napravljena pre bilo kakvog upisa.',
  'step.patch.description':
    'Lokalno, bez kamere. Pravi zakrpu za svaki slot koji sesija može da upiše: ona omogućava da čitanje kamere dopre do celog fleša od 4 MB, i upisuje se u obliku u kom je kamera čuva, pa se menjaju samo sopstveni bajtovi zakrpe.',
  'step.commit.description':
    'Upis. Prvo ponovo čita svaki izabrani slot i ne upisuje ništa ako svaki i dalje ne sadrži ono što je rezervna kopija zabeležila (upis koji je već uspeo nikada se ne ponavlja), zatim upisuje svaki od njih, a slot koji kamera prvi isprobava poslednji. Kamera se ovde ne pokreće ponovo: to radi sledeći korak.',
  'step.drain.description':
    'Ponovo pokreće kameru da bi pokrenula zakrpljeni firmver (desetak sekundi se ne javlja; stranica čeka i ponovo je pronalazi), proverava iz kog slota se pokrenula (slot bez zakrpe zaustavlja korak pre bilo kakvog čitanja), zatim jednim čitanjem čita ceo fleš od 4 MB i u sačuvanu sliku stavlja originalni firmver svakog upisanog slota, iz rezervne kopije. Ništa se ne upisuje.',
  'step.restore.description':
    'Drugi upis. Vraća originalni firmver svakog upisanog slota dok zakrpljeni firmver još radi, a zatim ponovo pokreće kameru.',
  'step.verify.description':
    'Posle novog pokretanja ponovo čita 31 blok, među njima i svaki slot: 0 različitih bajtova dokazuje da je fleš kamere bajt po bajt identičan rezervnoj kopiji. Samo čitanje.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Pokreni {phase}',
  'phase.retry': 'Ponovo pokušaj {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Nastavi na korak 04: vraćanje slotova',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Preskoči nezabeleženi upis',
  'phase.skipWrite': 'Preskoči upis — počni od čitanja celog fleša',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': 'Radnje: {phase}',
  /* The badges beside the step's title. */
  'badge.writes': 'upisuje u kameru',
  'badge.running': 'U toku',
  'badge.done': 'Gotovo',
  'badge.plannedStop': 'Zaustavljeno po planu — sledi vraćanje',
  'badge.failed': 'Zaustavljeno — pogledajte dnevnik',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Sledeće',
  /* Why the start button is off. */
  'notReady.noRun': 'Dostupno posle koraka 02 — on započinje sesiju.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Dostupno posle koraka {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Još nije spremno — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Odnosi se na zakrpljenu kameru dok upis nije zabeležen — kamera je možda već zakrpljena. Pogledajte napomenu u odeljku „{section}“.',
  'phase.noDrain':
    'Čitanje celog fleša nije izvršeno — ovaj korak vraća kameru bez njega. Prvo pokrenite korak 03, osim ako vam čitanje celog fleša nije važno.',
  'phase.keepPlugged': 'Držite kameru priključenu, a računar budan dok se ovaj korak ne završi.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Napredak',
  'phase.showDetails': 'Prikaži detalje u dnevniku',
  'phase.inDetail': 'Šta ovaj korak radi, detaljno',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Vaš red',
  'yourTurn.reconnect.title': 'Vaš red: pritisnite „Poveži uređaj“ i izaberite kameru.',
  'yourTurn.reconnect.body':
    'Kamera se ponovo pokrenula, kako je planirano. Chrome ne može sam da je ponovo prepozna (nema USB serijski broj), pa treba da je još jednom izaberete. Korak se nastavlja čim to uradite.',
  'yourTurn.replug.title':
    'Vaš red: isključite kameru, ponovo je priključite, pa pritisnite „Poveži uređaj“.',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'Zakrpa ove sesije napravljena je pre ispravke čitača, pa kamera pre vraćanja treba da se ponovo uključi. Datoteka sesije je već sačuvana.',
  'yourTurn.replugBeforeRestore.title':
    'Pre koraka 04: isključite kameru, ponovo je priključite, pa pritisnite „Poveži uređaj“.',
  'yourTurn.powerCycle.title':
    'Vaš red: isključite kameru, ponovo je priključite, pritisnite „Poveži uređaj“ — pa pokušajte ponovo.',
  'yourTurn.powerCycle.body':
    'Čitaču kamere treba novo uključivanje pre nego što kamera ponovo može da se čita. Sesija je i dalje učitana ovde; ništa nije izgubljeno.',
  'yourTurn.powerCycleAssert.title':
    'Vaš red: isključite kameru, ponovo je priključite, pritisnite „Poveži uređaj“ — pa nastavite.',
  'yourTurn.powerCycleAssert.body':
    'Poslednji pokušaj pravljenja rezervne kopije se zaustavio, a kamera treba novo uključivanje pre nego što ponovo krene. Kamera to ne može sama da prijavi, pa dugme ispod javlja stranici da ste to uradili.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Kamera je ponovo priključena — nastavi {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Koje slotove krpi korak 03',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Reč konfiguracije pokretanja',
  'banks.lastStart': 'Poslednje pokretanje',
  'banks.nextStart': 'Sledeće pokretanje',
  'banks.caption': 'Tri slota firmvera, onako kako ih je pročitao korak 02',
  'banks.col.bank': 'Slot',
  'banks.col.address': 'Adresa',
  'banks.col.holds': 'Šta sadrži',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'sledeće pokretanje',
  'banks.choiceLabel': 'Slotovi za krpljenje',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'Slot u koji ulazi sledeće pokretanje',
  'choice.all': 'Svi slotovi',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — nije ponuđeno',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen': 'Još nijedan slot nije izabran: {what}. Izaberite slot po imenu iznad.',
  'banks.writes': 'Korak 03 upisuje: {what}.',
  'banks.fixed': 'Upis je izvršen, pa je izbor konačan: korak 04 vraća tačno ove slotove.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: nije ponuđeno — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'nijedna sesija nije aktivna — korak 02 je započinje',
  'banks.refusedBusy': 'korak je u toku — izaberite slotove kada se završi',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'Plan — {build}, krpi {banks:acc}',
  'plan.summaryNone': 'Plan — {build}, još nijedan slot nije izabran',
  'plan.yourCamera': 'vaša kamera',
  'plan.intro':
    'Ispisano iz sopstvenih bajtova kamere. Ništa se ne upisuje dok se ne pokrene korak 03, a korak 04 vraća svaki bajt koji on upiše.',
  /* The rows; their values are core's. */
  'plan.build': 'Izdanje',
  'plan.version': 'Verzija firmvera',
  'plan.written': 'Upisuje se',
  'plan.route': 'Kuda ide',
  'plan.restore': 'Vraćanje',
  'plan.wholeFlash': 'Čitanje celog fleša',
  'plan.outro':
    'U obliku u kom ih kamera čuva menjaju se isti bajtovi i nijedan drugi, pa se firmver kamere menja tačno za ovu razliku i ništa više.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'Zakrpa {bank:gen}',
  'bankPlan.titleChosen': '{bank} — upisuje ga ova sesija',
  'bankPlan.titleNotChosen': '{bank} — nije izabran',
  'bankPlan.source': 'Izvor slike',
  'bankPlan.sourceValue': '{bank}, onako kako je sačuvan',
  'bankPlan.sourceTwoReads': '{bank}, onako kako je sačuvan, dva podudarna čitanja (sha256 {sha})',
  'bankPlan.edit': 'Izmena slike',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) na fabričkoj slici. Njen balans, {balance}, nalazi se u reči za podešavanje; zakrpa se balansira povrh njega, a korak 04 vraća sliku sa tom izmenom.',
  'bankPlan.factorySha': 'sha256 fabričke nešifrovane slike',
  'bankPlan.patchedSha': 'sha256 zakrpljene slike',
  /** Row label: how many bytes of the bank, as the flash chip stores it, the patch changes. */
  'bankPlan.diffCount': 'Bajtova promenjenih na fleš čipu',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Dužina pripreme',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    one: '{size} B u {count} delu',
    few: '{size} B u {count} dela',
    other: '{size} B u {count} delova',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Reč za balansiranje',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (bilo je {balance}, balans izmene)',
  'bankPlan.caption': 'Tačni bajtovi koje zakrpa menja u {bank:loc}',
  'bankPlan.col.what': 'Šta menja',
  'bankPlan.col.offset': 'Pomeraj',
  'bankPlan.col.before': 'Pre',
  'bankPlan.col.after': 'Posle',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Provereno — savršeno poklapanje.** Posle novog pokretanja kamera je ponovo pročitana: blokovi: {read}/31, različiti bajtovi: {count}. Njen fleš je tačno onakav kakav je bio pre prvog upisa.',
    few: '**Provereno — savršeno poklapanje.** Posle novog pokretanja kamera je ponovo pročitana: blokovi: {read}/31, različiti bajtovi: {count}. Njen fleš je tačno onakav kakav je bio pre prvog upisa.',
    other:
      '**Provereno — savršeno poklapanje.** Posle novog pokretanja kamera je ponovo pročitana: blokovi: {read}/31, različiti bajtovi: {count}. Njen fleš je tačno onakav kakav je bio pre prvog upisa.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Provereno — savršeno poklapanje.** Posle novog pokretanja kamera je ponovo pročitana: blokovi: {read}/31, različiti bajtovi: {count} (kratki blokovi: {blocks}). Njen fleš je tačno onakav kakav je bio pre prvog upisa.',
    few: '**Provereno — savršeno poklapanje.** Posle novog pokretanja kamera je ponovo pročitana: blokovi: {read}/31, različiti bajtovi: {count} (kratki blokovi: {blocks}). Njen fleš je tačno onakav kakav je bio pre prvog upisa.',
    other:
      '**Provereno — savršeno poklapanje.** Posle novog pokretanja kamera je ponovo pročitana: blokovi: {read}/31, različiti bajtovi: {count} (kratki blokovi: {blocks}). Njen fleš je tačno onakav kakav je bio pre prvog upisa.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**Provera je pronašla razlike u odnosu na rezervnu kopiju.** {error}',
  unknownReason: 'nepoznat razlog',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — upisati u {banks:acc}?',
  'confirm.titleJump': '{phase} — preskočiti nezabeleženi upis?',
  'confirm.chosenBanks': 'izabrane slotove',
  'confirm.jump':
    'UPIS NIJE ZABELEŽEN za ovu sesiju, a vi tvrdite da su upisi uspeli bez svojih kontrolnih tačaka: korak počinje posle upisa umesto da ponovo upisuje. Sopstvene provere koraka se i dalje izvršavaju — čitanje verzije, provere slotova — a pogrešna pretpostavka košta jedno uzaludno čitanje celog fleša, a ne uništenu kameru.',
  'confirm.jumpKeepPlugged': 'Držite kameru priključenu, a računar budan dok se korak ne završi.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Ovo upisuje malu zakrpu u {banks:acc}. Korak 04 vraća originale. Čitanje celog fleša koje sledi samo čita.',
  'confirm.patchInOrder':
    'Ovo upisuje malu zakrpu u {banks:acc}, tim redom — slot koji kamera prvi isprobava ide poslednji. Korak 04 vraća originale. Čitanje celog fleša koje sledi samo čita.',
  /* Step 04. */
  'confirm.restore': 'Ovo vraća vaš originalni firmver u {banks:acc}.',
  'confirm.restoreInOrder':
    'Ovo vraća vaš originalni firmver u {banks:acc}, tim redom — slot koji kamera prvi isprobava ide prvi.',
  'confirm.keepPlugged':
    'Držite kameru priključenu, a računar budan dok traje upis — prekinut upis ostavlja kameru koju može da popravi samo hardverski programator (SPI ili SWD/J-Link). Na telefonu: uključen režim rada u avionu i ekran stalno uključen. Kamera se zatim ponovo pokreće; kada stranica zatraži, pritisnite „Poveži uređaj“ i ponovo je izaberite. To je očekivano.',
  'confirm.yesJump': 'Da — preskoči upis',
  'confirm.yesWrite': 'Da — upiši u kameru',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'Dokaz',
  'summary.complete': 'Potpuna slika (4 MB)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'nije napravljeno',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'razlikuje se od rezervne kopije u {differing} od {count} bloka: {blocks}',
    few: 'razlikuje se od rezervne kopije u {differing} od {count} bloka: {blocks}',
    other: 'razlikuje se od rezervne kopije u {differing} od {count} blokova: {blocks}',
  },
  'summary.matches': {
    one: 'poklapa se sa rezervnom kopijom (ukupno {count} blok)',
    few: 'poklapa se sa rezervnom kopijom (ukupno {count} bloka)',
    other: 'poklapa se sa rezervnom kopijom (ukupno {count} blokova)',
  },
  'summary.onlyInFull': 'Samo u čitanju celog fleša',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} blok do kog obično čitanje ne dopire: {blocks}',
    few: '{count} bloka do kojih obično čitanje ne dopire: {blocks}',
    other: '{count} blokova do kojih obično čitanje ne dopire: {blocks}',
  },
  'summary.rawDump': 'Čitanje celog fleša, onako kako je pročitano',
  'summary.rawDumpBadge': 'isto, sa zakrpom još unutra',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Slika firmvera (dešifrovana, {bank})',
  'summary.verify': 'Provera',
  'summary.toolbar': 'Radnje sa arhivom',
  'summary.download': 'Preuzmi celu arhivu (datoteku sesije)',

  /*
   * ---- what the run file holds (views/PreserveView, "What you get") ----
   * The file and folder names in the table stay as they are; {fill} is a byte (0xFF), {original} a file name.
   */
  'output.title': 'Šta dobijate',
  'output.intro':
    'Datoteka sesije je jedno preuzimanje `{ext}`. Svako čuvanje sadrži sve što je sesija dosad napravila, sa po jednom fasciklom za svaki korak:',
  'output.caption': 'Datoteke u datoteci sesije',
  'output.file': 'Datoteka',
  'output.what': 'Šta je to',
  'output.runState':
    'zapis sesije: učitajte zip na ovoj kartici da nastavite sesiju ili da je ponovo pregledate',
  'output.readme': 'šta je u zipu i gde',
  'output.backup':
    'vaša rezervna kopija: 31 blok koji obična kamera daje, pročitan pre bilo kakvog upisa, svaki na svojoj adresi u flešu ({fill} gde blok ne može da se pročita na ovaj način)',
  'output.capture':
    'svaki slot firmvera koji sesija može da upiše, onako kako ga kamera čuva (a, b ili r u imenu), pročitan dvaput, sa oba čitanja ista',
  'output.plain': 'firmver iz svakog od tih slotova, dešifrovan',
  'output.patched':
    'za svaki slot koji sesija krpi: njegov firmver sa privremenom zakrpom za čitanje',
  'output.decrypted': 'dešifrovana rezervna kopija: firmver svakog slota i izveštaj o njemu',
  'output.manifest': 'detalji tog dešifrovanja',
  'output.decryptReadme': 'šta to dešifrovanje sadrži i koja su mu ograničenja',
  'output.pageBuild': 'koje izdanje ove stranice je izvršilo sesiju',
  'output.dumpPatched':
    'ceo fleš od 4 MB onako kako je pročitan, sa zakrpom još u slotovima u koje je upisana',
  'output.dumpOriginal':
    'potpuna slika: ceo fleš od 4 MB sa vraćenim originalnim firmverom — originalni fleš vaše kamere',
  'output.verify':
    '31 blok ponovo pročitan posle vraćanja, raspoređen kao rezervna kopija; treba da se poklapa sa njom',
  'output.grows':
    'Datoteka se pojavljuje tek kada se izvrši korak koji je pravi, pa rana datoteka sesije sadrži samo prvu fasciklu.',
  'output.keep':
    'Datoteka koju treba sačuvati je `{original}`: ceo fleš vaše kamere onakav kakav je bio. Ostalo pokazuje kako je sesija do toga došla.',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Opciono — za kasniji nastavak sesije',
  'runFile.title': 'Datoteka sesije',
  'runFile.description':
    'Jedini zapis sesije. Preuzima se sama posle svakog koraka (i posle koraka koji se ranije zaustavio); sačuvajte najnoviju. Da biste nastavili kasnije, ili posle problema, učitajte je ovde i stranica nastavlja tamo gde je stala.',
  'runFile.run': 'Sesija',
  'runFile.file': 'Datoteka',
  'runFile.lastSaved': 'Poslednje čuvanje',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'posle koraka {step} — {at} ({bytes} B)',
  'runFile.nextStep': 'Sledeći korak',
  'runFile.none':
    'Nijedna sesija nije aktivna. Korak 02 je započinje, ili ovde učitajte datoteku sesije.',
  'runFile.toolbar': 'Radnje sa datotekom sesije',
  'runFile.load': 'Učitaj datoteku sesije…',
  'runFile.save': 'Ponovo sačuvaj datoteku sesije',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Nastavak',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Nije izabrana datoteka sesije.',
  'status.notRun': 'Još nije pokrenuto.',
  'status.running': 'U toku …',
  'status.runningRestarts': 'U toku — kamera se tokom ovog koraka ponovo pokreće …',
  'status.restarting': 'Kamera se ponovo pokreće — to traje desetak sekundi …',
  'status.waitConnect': 'Čeka se na vas — pritisnite „Poveži uređaj“ i izaberite kameru …',
  'status.waitPlugBack':
    'Čeka se na vas — ponovo priključite kameru, pa pritisnite „Poveži uređaj“ …',
  'status.waitReplug': 'Čeka se na vas — isključite kameru i ponovo je priključite …',
  'status.back': 'Kamera se vratila — nastavlja se …',
  'status.swapped': 'Zaustavljeno — kamera je promenjena. Proverite je, pa ponovo pokrenite fazu.',
  'status.noRun': 'Nema sesije.',
  'status.notCreated': 'Nije napravljeno — pogledajte dnevnik iznad.',
  'status.refused': 'Odbijeno — spisak faza iznad kaže šta nedostaje.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} — gotovo. Datoteka sesije u preuzetim datotekama je ažurna.',
  'status.doneReplug':
    '{phase} — gotovo, i datoteka sesije je sačuvana. Pre vraćanja: isključite kameru, ponovo je priključite i pritisnite „Poveži uređaj“.',
  'status.backupRefused': 'Odbijeno — ništa nije upisano. Pogledajte dnevnik iznad.',
  'status.failed': 'Nije uspelo — pogledajte dnevnik iznad.',
  'status.cancelled': 'Otkazano — datoteka sesije i dalje beleži gde se sesija zaustavila.',
  'status.readingFile': 'Čitanje datoteke sesije …',
  'status.doneEarlier': 'Završeno ranije — učitano iz datoteke sesije.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Ranije nije uspelo: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Nastavljeno od koraka {step}. Spisak faza nastavlja odatle.',
  'status.notResumed': 'Nije nastavljeno — pogledajte dnevnik iznad.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'nedostaje: {missing}',
  'gate.noRun': 'nijedna sesija nije aktivna — prva faza pravi sesiju',
  'gate.runDone': 'ova sesija je završena — sve faze su obavljene',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'već obavljeno — nastavak ide od koraka {step}',
  'gate.banksRead': 'slotovi koje rezervna kopija čita',
  'gate.choice': 'izbor slotova — {why}',
  'gate.bankRefused': '{bank} ne može da se upiše: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'put preko slota za oporavak (ovo izdanje se pokreće samo iz {r:gen}, a ne iz {bank:gen})',
  'gate.backupFirst': 'rezervna kopija fleša (u ovoj fazi ide prva)',
  'gate.backup': 'rezervna kopija fleša',
  'gate.patchStep': 'korak zakrpe',
  'gate.patchOf': 'zakrpa {bank:gen}',
  'gate.backupFile': 'datoteka sa prozorima rezervne kopije',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': 'dvostruko čitanje {bank:gen}',
  'gate.derived': 'izvedena slika {bank:gen}',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'korak „Upis“ (prvo ga pokrenite ili nastavite od njega)',
  'gate.drainRefused': 'čitanje celog fleša nije moguće ({build}) — {why}',
  'gate.patchSummary': 'rezime zakrpe {bank:gen} (dužina pripreme)',
  'gate.restoreRefused':
    'vraćanje nije moguće ({build}) — nijedan oblik originalnog firmvera se ne čuva nazad kao originalni bajtovi; sesija se završava potpunom slikom, sa zakrpom na mestu',
  /* {file} is a file name in the run file. */
  'gate.plaintext': 'fabrička nešifrovana slika {bank:gen} ({file}, iz koraka rezervne kopije)',
  'gate.restoreFirst': 'vraćanje (u ovoj fazi ide prvo)',
  'gate.powerCycle':
    'potvrda isključivanja napajanja — isključite i ponovo uključite kameru (izvucite je i ponovo priključite ili upotrebite njen prekidač za napajanje), pa upotrebite kontrolu za ponovno pokretanje',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'kamera se nije vratila posle {minutes} min ponovnih pokušaja: {error} — ako Chrome ništa nije pitao, ponovo priključite kameru i ponovo pokrenite fazu; ako je dnevnik rekao da je ponovo povežete, čekao se upravo klik na „Poveži uređaj“',
} satisfies Translation<'preserve', 'sr'>;
