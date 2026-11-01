/**
 * Namespace `preserve`, čeština (cs), translated from the English source: the "Dump & decrypt 0.x/1.x" tab, a guided run that
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
  'how.title': 'Co očekávat',
  'how.descriptionIdle': 'Připojte kameru a potom začněte krokem 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Běh {runId}.',
  'how.descriptionRunVersion': 'Běh {runId} — firmware {version}.',
  'how.restarts':
    'Kamera se během každého kroku **restartuje**. Po restartu ji Chrome už nepozná (nemá sériové číslo USB), takže vás stránka požádá, abyste stiskli **Připojit zařízení** a kameru znovu vybrali. To je běžný postup — jakmile to uděláte, krok pokračuje sám.',
  'how.noFile': 'Nevybíráte žádný soubor s firmwarem: vše se čte přímo z kamery.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'Kamera uchovává firmware ve třech **slotech** ({a}, {b} a {r}). Krok 02 přečte všechny tři a zjistí, ze kterého kamera nastartuje příště; záplata funguje, jen pokud ji obsahuje právě tento slot. Sloty, které krok 03 záplatuje, volíte vy — ve výchozím stavu ten, do kterého vstoupí příští start — a krok 04 vrátí každý z nich do původního stavu.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'Po každém kroku prohlížeč stáhne **soubor běhu** pojmenovaný podle začátku běhu, času uložení a kroku, kam běh došel (`{example}`), s jednou složkou pro každý krok. Ponechte si ten nejnovější — umožní vám pokračovat později.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**Kroky 03 a 04 zapisují do paměti flash kamery** a každý vás nejdřív požádá o potvrzení. Zatímco některý z nich běží, nechte kameru připojenou (pokud vás stránka nepožádá, abyste ji odpojili a znovu připojili) a počítač vzhůru, nejlépe napájený ze sítě. Přerušený zápis zanechá kameru, kterou opraví jen hardwarový programátor (SPI nebo SWD/J-Link).',
  'how.phone':
    '**Na telefonu:** před krokem 03 zapněte režim letadla a vypněte Wi-Fi i mobilní data, aby hovor ani oznámení nemohly prohlížeč uprostřed zápisu odvést jinam — a nechte obrazovku zapnutou. Jakmile je stránka otevřená, funguje i offline.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**Zápis není pro tento běh zaznamenán, takže kroky po něm jsou uzavřené.** V kameře už může běžet záplatovaný obraz (přerušený zápis), nebo také ne (zápis vůbec nezačal) — soubor běhu nedokáže prokázat, co z toho platí. Nespouštějte čtení celé paměti flash ani obnovení na záplatované kameře bez zaznamenaného zápisu; cesta dál vede přes krok 03, jehož kontrola před zápisem přečte slot a odmítne ho znovu naslepo zapsat. Přeskok se použije, jen pokud tato kontrola už odmítla se zprávou *already holds the patched bytes* — a má vlastní dialog.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Čtení a příprava',
  'phase.readBuild.inSentence': 'čtení a přípravu',
  'phase.readBuild.description':
    'Přečte vše, co běžná kamera vydá — 31 bloků po 64 KB — a uchová to jako vaši zálohu, přečte každý slot firmwaru podruhé, zjistí, ze kterého slotu kamera nastartuje příště, a připraví malou záplatu, kterou zapíše další krok. Do kamery se nic nezapisuje. Obvykle to trvá méně než minutu. Pokud kamera cestou potřebuje restart, stránka vás požádá, abyste stiskli „Připojit zařízení“ a znovu ji vybrali — to se očekává.',
  'phase.patchDump.label': 'Zápis a čtení celé paměti flash',
  'phase.patchDump.inSentence': 'zápis a čtení celé paměti flash',
  'phase.patchDump.description':
    'Zapíše malou dočasnou záplatu do slotů firmwaru zvolených v kroku 02 (ve výchozím stavu do slotu, ze kterého kamera nastartuje příště), aby kamera mohla vydat celou svou paměť flash. Potom se kamera restartuje — až o to stránka požádá, stiskněte „Připojit zařízení“ a znovu ji vyberte — a přečte se celá paměť flash (4 MB). Krok 04 vrátí původní firmware.',
  'phase.restoreVerify.label': 'Obnovení a kontrola',
  'phase.restoreVerify.inSentence': 'obnovení a kontrolu',
  'phase.restoreVerify.description':
    'Zapíše zpět váš původní firmware, restartuje kameru (až o to budete požádáni, stiskněte „Připojit zařízení“ a znovu ji vyberte) a potom vše ještě jednou přečte, aby ověřil, že bajt po bajtu odpovídá záloze.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Přečte 31 bloků po 64 KB, které běžná kamera dovolí přečíst, potom přečte každý slot podruhé (obě čtení se musí bajt po bajtu shodovat), z toho, co kamera ukládá, získá firmware každého slotu (dešifrovaný tam, kde je uložen zašifrovaně) a zkontroluje ho a zjistí, ze kterého slotu kamera nastartuje příště. Je to jediná kopie této kamery v celém běhu, pořízená dřív, než se cokoli zapíše.',
  'step.patch.description':
    'Offline, bez kamery. Sestaví záplatu pro každý slot, který běh může zapsat: ta umožní čtení kamery dosáhnout na celou paměť flash (4 MB) a zapisuje se v podobě, v jaké ji kamera ukládá, takže se změní jen vlastní bajty záplaty.',
  'step.commit.description':
    'Zápis. Nejdřív zpětně přečte každý zvolený slot a nezapíše nic, pokud každý z nich stále neobsahuje to, co zaznamenala záloha (zápis, který už proběhl, se nikdy neopakuje), a potom je zapíše jeden po druhém, slot, který kamera zkouší jako první, až nakonec. Kamera se zde nerestartuje: restartuje ji další krok.',
  'step.drain.description':
    'Restartuje kameru, aby spustila záplatovaný firmware (asi deset sekund mlčí; stránka počká a znovu ji najde), zkontroluje, ze kterého slotu nastartovala (slot bez záplaty krok zastaví dřív, než se cokoli přečte), potom jedním čtením přečte celou paměť flash (4 MB) a do uloženého obrazu vloží ze zálohy původní firmware každého zapsaného slotu. Nic se nezapisuje.',
  'step.restore.description':
    'Druhý zápis. Zapíše zpět původní firmware každého zapsaného slotu, dokud ještě běží záplatovaný firmware, a potom kameru restartuje.',
  'step.verify.description':
    'Po novém startu znovu přečte 31 bloků, mezi nimi každý slot: 0 rozdílných bajtů dokazuje, že paměť flash kamery je bajtově shodná se zálohou. Jen pro čtení.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Spustit {phase}',
  'phase.retry': 'Zkusit znovu {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Pokračovat krokem 04: obnovit sloty',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Přeskočit nezaznamenaný zápis',
  'phase.skipWrite': 'Vynechat zápis — začít čtením celé paměti flash',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': 'Akce: {phase}',
  /* The badges beside the step's title. */
  'badge.writes': 'zapisuje do kamery',
  'badge.running': 'Běží',
  'badge.done': 'Hotovo',
  'badge.plannedStop': 'Zastaveno podle plánu — následuje obnovení',
  'badge.failed': 'Zastaveno — viz protokol',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Na řadě',
  /* Why the start button is off. */
  'notReady.noRun': 'Dostupné po kroku 02 — ten zahájí běh.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Dostupné po kroku {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Zatím nepřipraveno — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Týká se záplatované kamery, dokud zápis není zaznamenán — kamera už může být záplatovaná. Viz poznámka v části „{section}“.',
  'phase.noDrain':
    'Čtení celé paměti flash neproběhlo — tento krok vrátí kameru do původního stavu bez něj. Pokud vám na čtení celé paměti flash záleží, spusťte nejdřív krok 03.',
  'phase.keepPlugged': 'Dokud tento krok neskončí, nechte kameru připojenou a počítač vzhůru.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Průběh',
  'phase.showDetails': 'Zobrazit podrobnosti v protokolu',
  'phase.inDetail': 'Co tento krok podrobně dělá',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Jste na řadě',
  'yourTurn.reconnect.title': 'Jste na řadě: stiskněte „Připojit zařízení“ a vyberte kameru.',
  'yourTurn.reconnect.body':
    'Kamera se podle plánu restartovala. Chrome ji sám znovu nepozná (nemá sériové číslo USB), takže ji musíte vybrat ještě jednou. Krok pokračuje, jakmile to uděláte.',
  'yourTurn.replug.title':
    'Jste na řadě: odpojte kameru, znovu ji připojte a potom stiskněte „Připojit zařízení“.',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'Záplata tohoto běhu vznikla před opravou čtení, takže kamera potřebuje před obnovením nové zapnutí. Soubor běhu je už uložen.',
  'yourTurn.replugBeforeRestore.title':
    'Před krokem 04: odpojte kameru, znovu ji připojte a potom stiskněte „Připojit zařízení“.',
  'yourTurn.powerCycle.title':
    'Jste na řadě: odpojte kameru, znovu ji připojte, stiskněte „Připojit zařízení“ — a zkuste to znovu.',
  'yourTurn.powerCycle.body':
    'Čtecí část kamery potřebuje nové zapnutí, než ji půjde znovu přečíst. Běh je tu stále načtený; nic se neztratilo.',
  'yourTurn.powerCycleAssert.title':
    'Jste na řadě: odpojte kameru, znovu ji připojte, stiskněte „Připojit zařízení“ — a pokračujte.',
  'yourTurn.powerCycleAssert.body':
    'Poslední pokus o zálohu se zastavil a kamera potřebuje nové zapnutí, než poběží znovu. Kamera to sama nahlásit nedokáže, takže tlačítko níže stránce oznámí, že jste to udělali.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Kamera je znovu připojená — dokončit {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Které sloty krok 03 záplatuje',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Slovo konfigurace startu',
  'banks.lastStart': 'Poslední start',
  'banks.nextStart': 'Příští start',
  'banks.caption': 'Tři sloty firmwaru tak, jak je přečetl krok 02',
  'banks.col.bank': 'Slot',
  'banks.col.address': 'Adresa',
  'banks.col.holds': 'Co obsahuje',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'příští start',
  'banks.choiceLabel': 'Sloty k záplatování',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'Slot, do kterého vstoupí příští start',
  'choice.all': 'Všechny sloty',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — nenabízí se',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen': 'Zatím není zvolen žádný slot: {what}. Zvolte slot podle názvu výše.',
  'banks.writes': 'Krok 03 zapisuje: {what}.',
  'banks.fixed': 'Zápis proběhl, takže volba je pevná: krok 04 vrátí přesně tyto sloty.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: nenabízí se — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'není aktivní žádný běh — krok 02 ho zahájí',
  'banks.refusedBusy': 'běží krok — sloty zvolte, až skončí',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'Plán — {build}, záplatuje {banks:acc}',
  'plan.summaryNone': 'Plán — {build}, zatím není zvolen žádný slot',
  'plan.yourCamera': 'vaše kamera',
  'plan.intro':
    'Vypsáno z vlastních bajtů kamery. Nic se nezapíše, dokud neproběhne krok 03, a krok 04 vrátí každý bajt, který zapíše.',
  /* The rows; their values are core's. */
  'plan.build': 'Sestavení',
  'plan.version': 'Verze firmwaru',
  'plan.written': 'Zapisuje se',
  'plan.route': 'Kam to jde',
  'plan.restore': 'Obnovení',
  'plan.wholeFlash': 'Čtení celé paměti flash',
  'plan.outro':
    'V podobě, v jaké ji kamera ukládá, se mění tytéž bajty a žádné jiné, takže se firmware kamery změní přesně o tento rozdíl a o nic víc.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'Záplata {bank:gen}',
  'bankPlan.titleChosen': '{bank} — zapisuje tento běh',
  'bankPlan.titleNotChosen': '{bank} — nezvolen',
  'bankPlan.source': 'Zdroj obrazu',
  'bankPlan.sourceValue': '{bank} tak, jak je uložen',
  'bankPlan.sourceTwoReads': '{bank} tak, jak je uložen, dvě shodná čtení (sha256 {sha})',
  'bankPlan.edit': 'Úprava obrazu',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) na továrním obrazu. Její vyrovnání, {balance}, je ve vyrovnávacím slově; záplata se vyrovnává navíc k němu a krok 04 vrátí obraz i s touto úpravou.',
  'bankPlan.factorySha': 'sha256 továrního otevřeného textu',
  'bankPlan.patchedSha': 'sha256 po záplatě',
  /** Row label: how many bytes of the bank, as the flash chip stores it, the patch changes. */
  'bankPlan.diffCount': 'Bajty změněné na čipu flash',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Délka k předání',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    one: '{size} B, {count} blok',
    few: '{size} B, {count} bloky',
    many: '{size} B, {count} bloku',
    other: '{size} B, {count} bloků',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Vyrovnávací slovo',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (dříve {balance}, vyrovnání úpravy)',
  'bankPlan.caption': 'Přesné bajty, které záplata mění ve {bank:loc}',
  'bankPlan.col.what': 'Co mění',
  'bankPlan.col.offset': 'Offset',
  'bankPlan.col.before': 'Před',
  'bankPlan.col.after': 'Po',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Ověřeno — dokonalá shoda.** Po novém startu se kamera přečetla znovu: bloky {read}/31, {count} rozdílný bajt. Její paměť flash je přesně taková, jaká byla před prvním zápisem.',
    few: '**Ověřeno — dokonalá shoda.** Po novém startu se kamera přečetla znovu: bloky {read}/31, {count} rozdílné bajty. Její paměť flash je přesně taková, jaká byla před prvním zápisem.',
    many: '**Ověřeno — dokonalá shoda.** Po novém startu se kamera přečetla znovu: bloky {read}/31, {count} rozdílného bajtu. Její paměť flash je přesně taková, jaká byla před prvním zápisem.',
    other:
      '**Ověřeno — dokonalá shoda.** Po novém startu se kamera přečetla znovu: bloky {read}/31, {count} rozdílných bajtů. Její paměť flash je přesně taková, jaká byla před prvním zápisem.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Ověřeno — dokonalá shoda.** Po novém startu se kamera přečetla znovu: bloky {read}/31, {count} rozdílný bajt (krátké bloky: {blocks}). Její paměť flash je přesně taková, jaká byla před prvním zápisem.',
    few: '**Ověřeno — dokonalá shoda.** Po novém startu se kamera přečetla znovu: bloky {read}/31, {count} rozdílné bajty (krátké bloky: {blocks}). Její paměť flash je přesně taková, jaká byla před prvním zápisem.',
    many: '**Ověřeno — dokonalá shoda.** Po novém startu se kamera přečetla znovu: bloky {read}/31, {count} rozdílného bajtu (krátké bloky: {blocks}). Její paměť flash je přesně taková, jaká byla před prvním zápisem.',
    other:
      '**Ověřeno — dokonalá shoda.** Po novém startu se kamera přečetla znovu: bloky {read}/31, {count} rozdílných bajtů (krátké bloky: {blocks}). Její paměť flash je přesně taková, jaká byla před prvním zápisem.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**Kontrola našla rozdíly oproti záloze.** {error}',
  unknownReason: 'neznámý důvod',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — zapsat do {banks:gen}?',
  'confirm.titleJump': '{phase} — přeskočit nezaznamenaný zápis?',
  'confirm.chosenBanks': 'zvolených slotů',
  'confirm.jump':
    'ZÁPIS NENÍ PRO TENTO BĚH ZAZNAMENÁN a vy tvrdíte, že zápisy proběhly bez svých kontrolních bodů: krok začne za zápisem, místo aby zapisoval znovu. Vlastní kontroly kroků přesto proběhnou — čtení verze, kontroly slotů — a chybný odhad stojí zbytečné čtení celé paměti flash, ne zničenou kameru.',
  'confirm.jumpKeepPlugged': 'Dokud krok neskončí, nechte kameru připojenou a počítač vzhůru.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Tím se do {banks:gen} zapíše malá záplata. Krok 04 vrátí původní obsah. Čtení celé paměti flash, které následuje, jen čte.',
  'confirm.patchInOrder':
    'Tím se do {banks:gen} zapíše malá záplata, v tomto pořadí — slot, který kamera zkouší jako první, přijde na řadu poslední. Krok 04 vrátí původní obsah. Čtení celé paměti flash, které následuje, jen čte.',
  /* Step 04. */
  'confirm.restore': 'Tím se do {banks:gen} zapíše zpět váš původní firmware.',
  'confirm.restoreInOrder':
    'Tím se do {banks:gen} zapíše zpět váš původní firmware, v tomto pořadí — slot, který kamera zkouší jako první, přijde na řadu první.',
  'confirm.keepPlugged':
    'Během zápisu nechte kameru připojenou a počítač vzhůru — přerušený zápis zanechá kameru, kterou opraví jen hardwarový programátor (SPI nebo SWD/J-Link). Na telefonu zapněte režim letadla a nechte obrazovku zapnutou. Kamera se potom restartuje; až o to stránka požádá, stiskněte „Připojit zařízení“ a znovu ji vyberte. To se očekává.',
  'confirm.yesJump': 'Ano — přeskočit zápis',
  'confirm.yesWrite': 'Ano — zapsat do kamery',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'Důkaz',
  'summary.complete': 'Úplný obraz (4 MB)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'nevytvořeno',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'od zálohy se liší {differing} z {count} bloku: {blocks}',
    few: 'od zálohy se liší {differing} z {count} bloků: {blocks}',
    many: 'od zálohy se liší {differing} z {count} bloku: {blocks}',
    other: 'od zálohy se liší {differing} z {count} bloků: {blocks}',
  },
  'summary.matches': {
    one: 'shoduje se se zálohou ({count} blok)',
    few: 'shoduje se se zálohou (všechny {count} bloky)',
    many: 'shoduje se se zálohou ({count} bloku)',
    other: 'shoduje se se zálohou (všech {count} bloků)',
  },
  'summary.onlyInFull': 'Jen ve čtení celé paměti flash',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} blok, na který běžné čtení nedosáhne: {blocks}',
    few: '{count} bloky, na které běžné čtení nedosáhne: {blocks}',
    many: '{count} bloku, na které běžné čtení nedosáhne: {blocks}',
    other: '{count} bloků, na které běžné čtení nedosáhne: {blocks}',
  },
  'summary.rawDump': 'Čtení celé paměti flash, tak jak bylo přečteno',
  'summary.rawDumpBadge': 'totéž, se záplatou stále v obrazu',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Obraz firmwaru (dešifrovaný, {bank})',
  'summary.verify': 'Kontrola',
  'summary.toolbar': 'Akce archivu',
  'summary.download': 'Stáhnout celý archiv (soubor běhu)',

  /*
   * ---- what the run file holds (views/PreserveView, "What you get") ----
   * The file and folder names in the table stay as they are; {fill} is a byte (0xFF), {original} a file name.
   */
  'output.title': 'Co dostanete',
  'output.intro':
    'Soubor běhu je jeden stažený soubor `{ext}`. Každé uložení obsahuje vše, co běh dosud vytvořil, s jednou složkou pro každý krok:',
  'output.caption': 'Soubory uvnitř souboru běhu',
  'output.file': 'Soubor',
  'output.what': 'Co to je',
  'output.runState':
    'záznam běhu: načtěte zip na této kartě, abyste v běhu pokračovali nebo si ho znovu prohlédli',
  'output.readme': 'co v zipu je a kde',
  'output.backup':
    'vaše záloha: 31 bloků, které běžná kamera vydá, přečtených dřív, než se cokoli zapíše, každý na své adrese v paměti flash ({fill} tam, kde blok nelze tímto způsobem přečíst)',
  'output.capture':
    'každý slot firmwaru, který běh může zapsat, tak jak ho kamera ukládá (a, b nebo r v názvu), přečtený dvakrát se shodným výsledkem',
  'output.plain': 'firmware z každého z těchto slotů, dešifrovaný',
  'output.patched':
    'pro každý slot, který běh záplatuje: jeho firmware s dočasnou záplatou pro čtení',
  'output.decrypted': 'dešifrovaná záloha: firmware každého slotu a zpráva o něm',
  'output.manifest': 'podrobnosti tohoto dešifrování',
  'output.decryptReadme': 'co toto dešifrování obsahuje a jaká má omezení',
  'output.pageBuild': 'které sestavení této stránky běh provedlo',
  'output.dumpPatched':
    'celé 4 MB tak, jak byly přečteny, se záplatou stále ve slotech, do kterých byla zapsána',
  'output.dumpOriginal':
    'úplný obraz: celé 4 MB s vráceným původním firmwarem — původní paměť flash vaší kamery',
  'output.verify':
    '31 bloků přečtených znovu po obnovení, uspořádaných jako záloha; měly by se s ní shodovat',
  'output.grows':
    'Soubor se objeví, jakmile proběhne krok, který ho vytváří, takže raný soubor běhu obsahuje jen první složku.',
  'output.keep':
    'Soubor, který si máte ponechat, je `{original}`: celá paměť flash vaší kamery v původním stavu. Zbytek ukazuje, jak se k němu běh dostal.',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Volitelné — k pozdějšímu pokračování v běhu',
  'runFile.title': 'Soubor běhu',
  'runFile.description':
    'Jediný záznam běhu. Stáhne se sám po každém kroku (i po kroku, který skončil předčasně); ponechte si ten nejnovější. Chcete-li pokračovat později nebo po problému, načtěte ho zde a stránka naváže tam, kde skončila.',
  'runFile.run': 'Běh',
  'runFile.file': 'Soubor',
  'runFile.lastSaved': 'Naposledy uloženo',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'po kroku {step} — {at} ({bytes} B)',
  'runFile.nextStep': 'Další krok',
  'runFile.none': 'Není aktivní žádný běh. Krok 02 ho zahájí, nebo zde načtěte soubor běhu.',
  'runFile.toolbar': 'Akce souboru běhu',
  'runFile.load': 'Načíst soubor běhu…',
  'runFile.save': 'Znovu uložit soubor běhu',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Pokračování',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Není vybrán žádný soubor běhu.',
  'status.notRun': 'Zatím nespuštěno.',
  'status.running': 'Běží …',
  'status.runningRestarts': 'Běží — kamera se během tohoto kroku restartuje …',
  'status.restarting': 'Kamera se restartuje — trvá to asi deset sekund …',
  'status.waitConnect': 'Čeká se na vás — stiskněte „Připojit zařízení“ a vyberte kameru …',
  'status.waitPlugBack':
    'Čeká se na vás — znovu připojte kameru a potom stiskněte „Připojit zařízení“ …',
  'status.waitReplug': 'Čeká se na vás — odpojte kameru a znovu ji připojte …',
  'status.back': 'Kamera je zpět — pokračuje se …',
  'status.swapped': 'Zastaveno — kamera se změnila. Zkontrolujte ji a potom spusťte krok znovu.',
  'status.noRun': 'Žádný běh.',
  'status.notCreated': 'Nevytvořeno — viz protokol výše.',
  'status.refused': 'Odmítnuto — seznam kroků výše uvádí, co chybí.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} — hotovo. Soubor běhu ve stažených souborech je aktuální.',
  'status.doneReplug':
    '{phase} — hotovo a soubor běhu je uložen. Před obnovením: odpojte kameru, znovu ji připojte a stiskněte „Připojit zařízení“.',
  'status.backupRefused': 'Odmítnuto — nic se nezapsalo. Viz protokol výše.',
  'status.failed': 'Selhalo — viz protokol výše.',
  'status.cancelled': 'Zrušeno — soubor běhu stále uvádí, kde se běh zastavil.',
  'status.readingFile': 'Čtení souboru běhu …',
  'status.doneEarlier': 'Hotovo dříve — načteno ze souboru běhu.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Dříve selhalo: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Pokračuje se od kroku {step}. Seznam kroků naváže odtud.',
  'status.notResumed': 'Nepokračuje se — viz protokol výše.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'je potřeba: {missing}',
  'gate.noRun': 'není aktivní žádný běh — první krok běh vytvoří',
  'gate.runDone': 'tento běh je hotový — všechny kroky jsou dokončené',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'už hotovo — pokračování naváže krokem {step}',
  'gate.banksRead': 'sloty, které čte záloha',
  'gate.choice': 'volba slotů — {why}',
  'gate.bankRefused': '{bank} nelze zapsat: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'cesta přes slot pro obnovu (toto sestavení běží jen ze {r:gen}, ne ze {bank:gen})',
  'gate.backupFirst': 'záloha paměti flash (v tomto kroku běží jako první)',
  'gate.backup': 'záloha paměti flash',
  'gate.patchStep': 'krok záplaty',
  'gate.patchOf': 'záplata {bank:gen}',
  'gate.backupFile': 'soubor s okny zálohy',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': 'dvojí čtení {bank:gen}',
  'gate.derived': 'odvozený obraz {bank:gen}',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'krok Zápis (nejdřív ho spusťte nebo v něm pokračujte)',
  'gate.drainRefused': 'čtení celé paměti flash odmítnuto pro {build} — {why}',
  'gate.patchSummary': 'souhrn záplaty {bank:gen} (délka k předání)',
  'gate.restoreRefused':
    'obnovení odmítnuto pro {build} — žádná podoba původního firmwaru se neuloží zpět jako původní bajty; běh skončí s úplným obrazem a záplatou na místě',
  /* {file} is a file name in the run file. */
  'gate.plaintext': 'tovární otevřený text {bank:gen} ({file}, z kroku zálohy)',
  'gate.restoreFirst': 'obnovení (v tomto kroku běží jako první)',
  'gate.powerCycle':
    'potvrzení vypnutí a zapnutí — vypněte a zapněte kameru (odpojte ji a znovu připojte, nebo použijte její vypínač) a potom použijte ovládací prvek pro opakované spuštění',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'kamera se nevrátila ani po {minutes} min opakovaných pokusů: {error} — pokud se Chrome na nic nezeptal, znovu připojte kameru a spusťte krok znovu; pokud protokol říkal, ať ji znovu připojíte, čekal právě na kliknutí na „Připojit zařízení“',
} satisfies Translation<'preserve', 'cs'>;
