/**
 * Namespace `preserve`, magyar (hu), translated from the English source: the "Dump & decrypt 0.x/1.x" tab, a guided run that
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
  'how.title': 'Mire számíthat',
  'how.descriptionIdle': 'Csatlakoztassa a kamerát, majd kezdje a 02. lépéssel.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Futtatás: {runId}.',
  'how.descriptionRunVersion': 'Futtatás: {runId} – firmware: {version}.',
  'how.restarts':
    'A kamera minden lépés közben **újraindul**. Újraindulás után a Chrome már nem ismeri fel (nincs USB-sorozatszáma), ezért az oldal megkéri, hogy nyomja meg az **Eszköz csatlakoztatása** gombot, és válassza ki újra a kamerát. Ez a szokásos menet – ha megteszi, a lépés magától folytatódik.',
  'how.noFile':
    'Nem kell firmware-fájlt választania: minden magából a kamerából kerül kiolvasásra.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'A kamera három **slotban** tárolja a firmware-t ({a:nom}, {b:nom} és {r:nom}). A 02. lépés mindhármat kiolvassa, és megállapítja, melyikről indul legközelebb a kamera; a módosítás csak akkor működik, ha az a slot tartalmazza. Ön választja ki, mely slotokat módosítsa a 03. lépés – alapértelmezés szerint azt, amelyről a következő indítás történik –, és a 04. lépés mindegyiket visszateszi.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'Minden lépés után a böngésző letölt egy **futtatási fájlt**, amelynek neve a futtatás kezdetét, a mentés idejét és az elért lépést tartalmazza (`{example}`), benne lépésenként egy mappával. A legújabbat őrizze meg – ezzel később folytathatja.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**A 03. és a 04. lépés a kamera flash memóriájába ír**, és mindkettő előbb megerősítést kér. Amíg valamelyik fut, hagyja csatlakoztatva a kamerát (hacsak az oldal nem kéri, hogy dugja újra), a számítógépet pedig ébren, lehetőleg hálózati tápról. Egy megszakított írás után a kamerát csak hardveres programozó (SPI vagy SWD/J-Link) tudja helyrehozni.',
  'how.phone':
    '**Telefonon:** a 03. lépés előtt kapcsolja be a repülőgép üzemmódot, és kapcsolja ki a Wi-Fit és a mobiladatot, hogy egy hívás vagy értesítés ne vonja el a böngészőt írás közben – és tartsa bekapcsolva a képernyőt. Az oldal megnyitás után offline is működik.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**Az írás nincs rögzítve ebben a futtatásban, ezért az utána következő lépések zárva vannak.** Lehet, hogy a kamera már a módosított lemezképet futtatja (megszakított írás), de lehet, hogy nem (az írás el sem indult) – a futtatási fájl ezt nem tudja bizonyítani. Rögzített írás nélkül ne futtassa a teljes flash kiolvasását vagy a visszaállítást egy módosított kamerán; a továbblépés útja a 03. lépés, amelynek írás előtti ellenőrzése kiolvassa a slotot, és nem írja újra vakon. Csak ha ez az ellenőrzés már elutasította *already holds the patched bytes* üzenettel, akkor érvényes az átugrás – és annak saját párbeszédablaka van.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Kiolvasás és összeállítás',
  'phase.readBuild.inSentence': 'kiolvasás és összeállítás',
  'phase.readBuild.description':
    'Kiolvas mindent, amit egy gyári kamera kiad – 31 darab 64 KB-os blokkot –, és megőrzi biztonsági mentésként, minden firmware-slotot másodszor is kiolvas, megállapítja, melyik slotról indul legközelebb a kamera, és elkészíti a kis módosítást, amelyet a következő lépés ír. A kamerára semmi sem íródik. Általában egy percnél rövidebb. Ha közben a kamerának újra kell indulnia, az oldal megkéri, hogy nyomja meg az „Eszköz csatlakoztatása” gombot, és válassza ki újra – ez várható.',
  'phase.patchDump.label': 'Írás és teljes flash kiolvasása',
  'phase.patchDump.inSentence': 'írás és teljes flash kiolvasása',
  'phase.patchDump.description':
    'Egy kis, ideiglenes módosítást ír a 02. lépésben kiválasztott firmware-slotokba (alapértelmezés szerint abba, amelyről a kamera legközelebb indul), hogy a kamera a teljes flash memóriáját kiolvashassa. Ezután a kamera újraindul – amikor az oldal kéri, nyomja meg az „Eszköz csatlakoztatása” gombot, és válassza ki újra –, és a teljes 4 MB-os flash memória kiolvasásra kerül. A 04. lépés visszateszi az eredeti firmware-t.',
  'phase.restoreVerify.label': 'Visszaállítás és ellenőrzés',
  'phase.restoreVerify.inSentence': 'visszaállítás és ellenőrzés',
  'phase.restoreVerify.description':
    'Visszaírja az eredeti firmware-t, újraindítja a kamerát (amikor kéri, nyomja meg az „Eszköz csatlakoztatása” gombot, és válassza ki újra), majd még egyszer mindent kiolvas, hogy ellenőrizze: bájtra egyezik-e a biztonsági mentéssel.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Kiolvassa azt a 31 darab 64 KB-os blokkot, amelyet egy gyári kamera kiolvashat, majd minden slotot másodszor is kiolvas (a két olvasásnak bájtra egyeznie kell), minden slot firmware-ét kinyeri abból, amit a kamera tárol (visszafejtve, ahol titkosítva van tárolva), és ellenőrzi, majd megállapítja, melyik slotról indul legközelebb a kamera. Ez a futtatás egyetlen másolata erről a kameráról, még bármilyen írás előtt.',
  'step.patch.description':
    'Offline, kamera nélkül. Elkészíti a módosítást minden olyan slothoz, amelyet a futtatás írni tud: ez lehetővé teszi, hogy a kamera olvasása a teljes 4 MB-os flash memóriát elérje, és abban a formában íródik, ahogy a kamera tárolja, így csak a módosítás saját bájtjai változnak.',
  'step.commit.description':
    'Az írás. Előbb minden kiválasztott slotot visszaolvas, és semmit sem ír, hacsak mindegyik még mindig azt nem tartalmazza, amit a biztonsági mentés rögzített (egy már megtörtént írást sosem ismétel meg), majd mindegyiket kiírja, azt a slotot, amelyet a kamera először próbál, utoljára. A kamera itt nem indul újra: a következő lépés indítja újra.',
  'step.drain.description':
    'Újraindítja a kamerát, hogy a módosított firmware-t indítsa (kb. tíz másodpercig nem jelez; az oldal vár, és újra megtalálja), ellenőrzi, melyik slotról indult (módosítás nélküli slot esetén a lépés még bármilyen olvasás előtt leáll), majd egyetlen olvasással kiolvassa a teljes 4 MB-os flash memóriát, és minden írt slot eredeti firmware-ét a biztonsági mentésből visszateszi az elmentett memóriaképbe. Semmi sem íródik.',
  'step.restore.description':
    'A másik írás. Minden írt slot eredeti firmware-ét visszaírja, amíg a módosított firmware még fut, majd újraindítja a kamerát.',
  'step.verify.description':
    'Friss indítás után újra kiolvassa a 31 blokkot, köztük minden slotot: 0 eltérő bájt bizonyítja, hogy a kamera flash memóriája bájtra azonos a biztonsági mentéssel. Csak olvas.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Indítás: {phase}',
  'phase.retry': 'Újrapróbálás: {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Tovább a 04. lépésre: a slotok visszaállítása',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'A nem rögzített írás átugrása',
  'phase.skipWrite': 'Az írás kihagyása – kezdés a teljes flash kiolvasásával',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': '{phase} – műveletek',
  /* The badges beside the step's title. */
  'badge.writes': 'ír a kamerára',
  'badge.running': 'Fut',
  'badge.done': 'Kész',
  'badge.plannedStop': 'Tervezetten leállt – a visszaállítás következik',
  'badge.failed': 'Leállt – lásd a naplót',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Következik',
  /* Why the start button is off. */
  'notReady.noRun': 'A 02. lépés után érhető el – az indítja a futtatást.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'A {step}. lépés után érhető el ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Még nem áll készen – {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'A módosított kamerát érinti, amíg az írás nincs rögzítve – lehet, hogy a kamera már módosítva van. Lásd a „{section}” alatti megjegyzést.',
  'phase.noDrain':
    'A teljes flash kiolvasása nem futott le – ez a lépés nélküle teszi vissza a kamerát. Előbb futtassa a 03. lépést, hacsak a teljes flash kiolvasása nem közömbös Önnek.',
  'phase.keepPlugged':
    'Hagyja csatlakoztatva a kamerát és ébren a számítógépet, amíg ez a lépés be nem fejeződik.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Előrehaladás',
  'phase.showDetails': 'Részletek a naplóban',
  'phase.inDetail': 'Mit csinál ez a lépés, részletesen',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Önön a sor',
  'yourTurn.reconnect.title':
    'Önön a sor: nyomja meg az „Eszköz csatlakoztatása” gombot, és válassza ki a kamerát.',
  'yourTurn.reconnect.body':
    'A kamera a terv szerint újraindult. A Chrome magától nem ismeri fel újra (nincs USB-sorozatszáma), ezért Önnek kell még egyszer kiválasztania. A lépés azonnal folytatódik, amint megteszi.',
  'yourTurn.replug.title':
    'Önön a sor: húzza ki a kamerát, dugja vissza, majd nyomja meg az „Eszköz csatlakoztatása” gombot.',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'Ennek a futtatásnak a módosítása még az olvasójavítás előtt készült, ezért a kamerának a visszaállítás előtt friss bekapcsolás kell. A futtatási fájl már el van mentve.',
  'yourTurn.replugBeforeRestore.title':
    'A 04. lépés előtt: húzza ki a kamerát, dugja vissza, majd nyomja meg az „Eszköz csatlakoztatása” gombot.',
  'yourTurn.powerCycle.title':
    'Önön a sor: húzza ki a kamerát, dugja vissza, nyomja meg az „Eszköz csatlakoztatása” gombot – majd próbálja újra.',
  'yourTurn.powerCycle.body':
    'A kamera olvasójának friss bekapcsolás kell, mielőtt újra olvasható lenne. A futtatás továbbra is be van töltve; semmi sem veszett el.',
  'yourTurn.powerCycleAssert.title':
    'Önön a sor: húzza ki a kamerát, dugja vissza, nyomja meg az „Eszköz csatlakoztatása” gombot – majd folytassa.',
  'yourTurn.powerCycleAssert.body':
    'Az utolsó biztonsági mentési kísérlet leállt, és a kamerának friss bekapcsolás kell, mielőtt újra futna. Ezt a kamera magától nem tudja jelezni, ezért a lenti gombbal közli az oldallal, hogy megtette.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Visszadugtam – folytatás: {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Mely slotokat módosítja a 03. lépés',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Indítási konfigurációs szó',
  'banks.lastStart': 'Legutóbbi indítás',
  'banks.nextStart': 'Következő indítás',
  'banks.caption': 'A három firmware-slot, ahogy a 02. lépés kiolvasta',
  'banks.col.bank': 'Slot',
  'banks.col.address': 'Cím',
  'banks.col.holds': 'Tartalom',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'következő indítás',
  'banks.choiceLabel': 'Módosítandó slotok',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'A következő indításkor induló slot',
  'choice.all': 'Minden slot',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} – {banks}',
  'choice.notOffered': '{choice} – nem érhető el',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen': 'Még nincs kiválasztott slot: {what}. Fent válasszon slotot név szerint.',
  'banks.writes': 'A 03. lépés ezt írja: {what}.',
  'banks.fixed':
    'Az írás lefutott, így a választás rögzített: a 04. lépés pontosan ezeket a slotokat teszi vissza.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: nem érhető el – {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'nincs aktív futtatás – a 02. lépés indít egyet',
  'banks.refusedBusy': 'egy lépés fut – a slotokat a befejezése után válassza ki',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'A terv – {build}, módosítja: {banks}',
  'plan.summaryNone': 'A terv – {build}, még nincs kiválasztott slot',
  'plan.yourCamera': 'az Ön kamerája',
  'plan.intro':
    'A kamera saját bájtjaiból kiírva. Amíg a 03. lépés nem fut, semmi sem íródik, és a 04. lépés minden általa írt bájtot visszatesz.',
  /* The rows; their values are core's. */
  'plan.build': 'Változat',
  'plan.version': 'Firmware-verzió',
  'plan.written': 'Írás',
  'plan.route': 'Hová kerül',
  'plan.restore': 'Visszaállítás',
  'plan.wholeFlash': 'Teljes flash kiolvasása',
  'plan.outro':
    'Abban a formában, ahogy a kamera tárol, ugyanezek a bájtok változnak, és semmi más, így a kamera firmware-e pontosan ennyivel változik, és semmi mással.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'Módosítás: {bank}',
  'bankPlan.titleChosen': '{bank} – ez a futtatás írja',
  'bankPlan.titleNotChosen': '{bank} – nincs kiválasztva',
  'bankPlan.source': 'A lemezkép forrása',
  'bankPlan.sourceValue': '{bank}, tárolt formában',
  'bankPlan.sourceTwoReads': '{bank}, tárolt formában, két egyező olvasás (sha256 {sha})',
  'bankPlan.edit': 'Lemezkép-szerkesztés',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) a gyári lemezképen. Az egyensúlya ({balance}) a kiegyenlítő szóban van; a módosítás erre építve egyensúlyoz, és a 04. lépés a szerkesztéssel együtt teszi vissza a lemezképet.',
  'bankPlan.factorySha': 'Gyári titkosítatlan sha256',
  'bankPlan.patchedSha': 'Módosított sha256',
  /** Row label: how many bytes of the bank, as the flash chip stores it, the patch changes. */
  'bankPlan.diffCount': 'Megváltozott bájtok a flashchipen',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Előkészített hossz',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    one: '{size} B, {count} darabban',
    other: '{size} B, {count} darabban',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Kiegyenlítő szó',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (korábban {balance}, a szerkesztés egyensúlya)',
  'bankPlan.caption': 'A pontos bájtok, amelyeket a módosítás megváltoztat {bank:ine}',
  'bankPlan.col.what': 'Mit változtat',
  'bankPlan.col.offset': 'Eltolás',
  'bankPlan.col.before': 'Előtte',
  'bankPlan.col.after': 'Utána',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Ellenőrizve – tökéletes egyezés.** Friss indítás után a kamera újra ki lett olvasva: {read}/31 blokk, {count} eltérő bájt. A flash memóriája pontosan olyan, mint az első írás előtt.',
    other:
      '**Ellenőrizve – tökéletes egyezés.** Friss indítás után a kamera újra ki lett olvasva: {read}/31 blokk, {count} eltérő bájt. A flash memóriája pontosan olyan, mint az első írás előtt.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Ellenőrizve – tökéletes egyezés.** Friss indítás után a kamera újra ki lett olvasva: {read}/31 blokk, {count} eltérő bájt (rövid blokkok: {blocks}). A flash memóriája pontosan olyan, mint az első írás előtt.',
    other:
      '**Ellenőrizve – tökéletes egyezés.** Friss indítás után a kamera újra ki lett olvasva: {read}/31 blokk, {count} eltérő bájt (rövid blokkok: {blocks}). A flash memóriája pontosan olyan, mint az első írás előtt.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**Az ellenőrzés eltéréseket talált a biztonsági mentéshez képest.** {error}',
  unknownReason: 'ismeretlen ok',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} – írás {banks:ill}?',
  'confirm.titleJump': '{phase} – átugorja a nem rögzített írást?',
  'confirm.chosenBanks': 'a kiválasztott slotokba',
  'confirm.jump':
    'AZ ÍRÁS NINCS RÖGZÍTVE ebben a futtatásban, és Ön azt állítja, hogy az írások az ellenőrzőpontjuk nélkül megtörténtek: a lépés az írás után indul, ahelyett hogy újra írna. A lépések saját ellenőrzései így is lefutnak – a verzió kiolvasása, a slotok ellenőrzése –, és egy rossz feltételezés csak egy elvesztegetett teljes flash kiolvasásba kerül, nem egy tönkretett kamerába.',
  'confirm.jumpKeepPlugged':
    'Hagyja csatlakoztatva a kamerát és ébren a számítógépet, amíg a lépés be nem fejeződik.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Ez egy kis módosítást ír {banks:ill}. A 04. lépés visszateszi az eredetieket. Az utána következő teljes flash kiolvasás csak olvas.',
  'confirm.patchInOrder':
    'Ez egy kis módosítást ír {banks:ill}, ebben a sorrendben – az a slot, amelyet a kamera először próbál, az utolsó. A 04. lépés visszateszi az eredetieket. Az utána következő teljes flash kiolvasás csak olvas.',
  /* Step 04. */
  'confirm.restore': 'Ez visszaírja az eredeti firmware-t {banks:ill}.',
  'confirm.restoreInOrder':
    'Ez visszaírja az eredeti firmware-t {banks:ill}, ebben a sorrendben – az a slot, amelyet a kamera először próbál, az első.',
  'confirm.keepPlugged':
    'Írás közben hagyja csatlakoztatva a kamerát és ébren a számítógépet – egy megszakított írás után a kamerát csak hardveres programozó (SPI vagy SWD/J-Link) tudja helyrehozni. Telefonon: repülőgép üzemmód be, a képernyő bekapcsolva. A kamera ezután újraindul; amikor az oldal kéri, nyomja meg az „Eszköz csatlakoztatása” gombot, és válassza ki újra. Ez várható.',
  'confirm.yesJump': 'Igen – az írás átugrása',
  'confirm.yesWrite': 'Igen – írás a kamerára',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'A bizonyíték',
  'summary.complete': 'Teljes memóriakép (4 MB)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'nem készült',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: '{count} blokkból {differing} eltér a biztonsági mentéstől: {blocks}',
    other: '{count} blokkból {differing} eltér a biztonsági mentéstől: {blocks}',
  },
  'summary.matches': {
    one: 'egyezik a biztonsági mentéssel ({count} blokk)',
    other: 'egyezik a biztonsági mentéssel (mindegyik blokk, összesen {count})',
  },
  'summary.onlyInFull': 'Csak a teljes flash kiolvasásában',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} blokk, amelyet egy gyári olvasás nem ér el: {blocks}',
    other: '{count} blokk, amelyet egy gyári olvasás nem ér el: {blocks}',
  },
  'summary.rawDump': 'Teljes flash kiolvasása, ahogy kiolvasta',
  'summary.rawDumpBadge': 'ugyanaz, a módosítással együtt',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Firmware-lemezkép (visszafejtve, {bank})',
  'summary.verify': 'Ellenőrzés',
  'summary.toolbar': 'Archívumműveletek',
  'summary.download': 'A teljes archívum letöltése (futtatási fájl)',

  /*
   * ---- what the run file holds (views/PreserveView, "What you get") ----
   * The file and folder names in the table stay as they are; {fill} is a byte (0xFF), {original} a file name.
   */
  'output.title': 'Mit kap',
  'output.intro':
    'A futtatási fájl egyetlen `{ext}` letöltés. Minden mentés tartalmazza mindazt, amit a futtatás addig létrehozott, lépésenként egy mappával:',
  'output.caption': 'A futtatási fájlban lévő fájlok',
  'output.file': 'Fájl',
  'output.what': 'Mi ez',
  'output.runState':
    'a futtatás nyilvántartása: töltse be a zipet ezen a fülön a futtatás folytatásához vagy újbóli megtekintéséhez',
  'output.readme': 'mi van a zipben, és hol',
  'output.backup':
    'a biztonsági mentése: az a 31 blokk, amelyet egy gyári kamera kiad, bármilyen írás előtt kiolvasva, mindegyik a saját flash-címén ({fill} ott, ahol egy blokk így nem olvasható)',
  'output.capture':
    'minden firmware-slot, amelyet a futtatás írni tud, úgy, ahogy a kamera tárolja (a névben a, b vagy r), kétszer kiolvasva, egyező olvasásokkal',
  'output.plain': 'mindegyik slot firmware-e, visszafejtve',
  'output.patched':
    'minden slothoz, amelyet a futtatás módosít: a firmware-e az ideiglenes olvasási módosítással',
  'output.decrypted':
    'a visszafejtett biztonsági mentés: minden slot firmware-e és egy jelentés róla',
  'output.manifest': 'a visszafejtés részletei',
  'output.decryptReadme': 'mit tartalmaz a visszafejtés, és mik a korlátai',
  'output.pageBuild': 'az oldal melyik változata futtatta a futtatást',
  'output.dumpPatched':
    'a teljes 4 MB úgy, ahogy kiolvasta, a módosítással azokban a slotokban, ahová íródott',
  'output.dumpOriginal':
    'a teljes memóriakép: a teljes 4 MB a visszatett eredeti firmware-rel – a kamera eredeti flash memóriája',
  'output.verify':
    'a visszaállítás után újra kiolvasott 31 blokk, a biztonsági mentéshez hasonlóan elrendezve; egyezniük kell vele',
  'output.grows':
    'Egy fájl akkor jelenik meg, amikor az azt létrehozó lépés lefutott, így egy korai futtatási fájl csak az első mappát tartalmazza.',
  'output.keep':
    'A megőrzendő fájl: `{original}` – a kamera teljes flash memóriája úgy, ahogy volt. A többi azt mutatja, hogyan jutott el ide a futtatás.',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Nem kötelező – egy futtatás későbbi folytatásához',
  'runFile.title': 'Futtatási fájl',
  'runFile.description':
    'A futtatás egyetlen nyilvántartása. Minden lépés után magától letöltődik (és egy korán leállt lépés után is); a legújabbat őrizze meg. A későbbi folytatáshoz vagy egy probléma után töltse be itt, és az oldal ott folytatja, ahol abbahagyta.',
  'runFile.run': 'Futtatás',
  'runFile.file': 'Fájl',
  'runFile.lastSaved': 'Utolsó mentés',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': '{step} után – {at} ({bytes} B)',
  'runFile.nextStep': 'Következő lépés',
  'runFile.none':
    'Nincs aktív futtatás. A 02. lépés indít egyet, vagy töltsön be itt egy futtatási fájlt.',
  'runFile.toolbar': 'Futtatási fájl műveletei',
  'runFile.load': 'Futtatási fájl betöltése…',
  'runFile.save': 'A futtatási fájl újbóli mentése',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Folytatás',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Nincs kiválasztott futtatási fájl.',
  'status.notRun': 'Még nem futott.',
  'status.running': 'Fut…',
  'status.runningRestarts': 'Fut – a kamera e lépés közben újraindul…',
  'status.restarting': 'A kamera újraindul – ez kb. tíz másodpercig tart…',
  'status.waitConnect':
    'Önre vár – nyomja meg az „Eszköz csatlakoztatása” gombot, és válassza ki a kamerát…',
  'status.waitPlugBack':
    'Önre vár – dugja vissza a kamerát, majd nyomja meg az „Eszköz csatlakoztatása” gombot…',
  'status.waitReplug': 'Önre vár – húzza ki a kamerát, és dugja vissza…',
  'status.back': 'A kamera visszatért – folytatás…',
  'status.swapped': 'Leállt – a kamera megváltozott. Ellenőrizze, majd futtassa újra a szakaszt.',
  'status.noRun': 'Nincs futtatás.',
  'status.notCreated': 'Nem jött létre – lásd a fenti naplót.',
  'status.refused': 'Elutasítva – a fenti szakaszlista megmondja, mi hiányzik.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} – kész. A letöltések között lévő futtatási fájl naprakész.',
  'status.doneReplug':
    '{phase} – kész, és a futtatási fájl el van mentve. A visszaállítás előtt: húzza ki a kamerát, dugja vissza, és nyomja meg az „Eszköz csatlakoztatása” gombot.',
  'status.backupRefused': 'Elutasítva – semmi sem íródott. Lásd a fenti naplót.',
  'status.failed': 'Sikertelen – lásd a fenti naplót.',
  'status.cancelled':
    'Megszakítva – a futtatási fájl továbbra is mutatja, hol állt meg a futtatás.',
  'status.readingFile': 'Futtatási fájl olvasása…',
  'status.doneEarlier': 'Korábban elkészült – a futtatási fájlból betöltve.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Korábban sikertelen: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Folytatva itt: {step}. A szakaszlista innen halad tovább.',
  'status.notResumed': 'Nincs folytatva – lásd a fenti naplót.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'szükséges: {missing}',
  'gate.noRun': 'nincs aktív futtatás – az első szakasz hozza létre a futtatást',
  'gate.runDone': 'ez a futtatás kész – minden szakasz befejeződött',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'már kész – a folytatás itt halad tovább: {step}',
  'gate.banksRead': 'a biztonsági mentés által kiolvasott slotok',
  'gate.choice': 'a slotok kiválasztása – {why}',
  'gate.bankRefused': '{bank:nom} nem írható: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute': 'a helyreállító slot útja (ez a változat csak {r:ela} fut, nem {bank:ela})',
  'gate.backupFirst': 'a flash biztonsági mentése (ebben a szakaszban ez fut először)',
  'gate.backup': 'a flash biztonsági mentése',
  'gate.patchStep': 'a „Módosítás” lépés',
  'gate.patchOf': '{bank:nom} módosítása',
  'gate.backupFile': 'a biztonsági mentés ablakfájlja',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': '{bank:nom} rögzítése',
  'gate.derived': '{bank:nom} származtatott lemezképe',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'az „Írás” lépés (előbb futtassa, vagy folytassa annál)',
  'gate.drainRefused': 'a teljes flash kiolvasása nem fut ezen a változaton ({build}) – {why}',
  'gate.patchSummary': '{bank:nom} módosításának összefoglalója (az előkészített hossz)',
  'gate.restoreRefused':
    'a visszaállítás nem fut ezen a változaton ({build}) – az eredeti firmware-nek egyik formája sem tárolódik vissza az eredeti bájtokként; a futtatás a teljes memóriaképpel és a helyén maradó módosítással ér véget',
  /* {file} is a file name in the run file. */
  'gate.plaintext':
    '{bank:nom} gyári titkosítatlan tartalma ({file}, a biztonsági mentés lépésből)',
  'gate.restoreFirst': 'a visszaállítás (ebben a szakaszban ez fut először)',
  'gate.powerCycle':
    'a ki- és bekapcsolás megerősítése – kapcsolja ki és be a kamerát (húzza ki és dugja vissza, vagy használja a főkapcsolóját), majd használja az újrafuttatás gombját',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'a kamera {minutes} perc újrapróbálkozás után sem tért vissza: {error} – ha a Chrome semmit sem kérdezett, dugja újra a kamerát, és futtassa újra a szakaszt; ha a napló az újracsatlakoztatást kérte, az „Eszköz csatlakoztatása” gombra kattintásra várt',
} satisfies Translation<'preserve', 'hu'>;
