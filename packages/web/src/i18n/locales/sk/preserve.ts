/**
 * Namespace `preserve`, slovenčina (sk), translated from the English source: the "Dump & decrypt 0.x/1.x" tab, a guided run that
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
  'how.title': 'Čo očakávať',
  'how.descriptionIdle': 'Pripojte kameru a potom začnite krokom 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Beh {runId}.',
  'how.descriptionRunVersion': 'Beh {runId} — firmvér {version}.',
  'how.restarts':
    'Kamera sa počas každého kroku **reštartuje**. Po reštarte ju Chrome už nespozná (nemá sériové číslo USB), takže vás stránka požiada, aby ste stlačili **Pripojiť zariadenie** a kameru znova vybrali. To je bežný postup — keď to urobíte, krok pokračuje sám.',
  'how.noFile': 'Nevyberáte žiadny súbor s firmvérom: všetko sa číta priamo z kamery.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'Kamera uchováva firmvér v troch **slotoch** ({a}, {b} a {r}). Krok 02 prečíta všetky tri a zistí, z ktorého kamera naštartuje nabudúce; záplata funguje, len ak ju obsahuje práve tento slot. Sloty, ktoré krok 03 záplatuje, volíte vy — predvolene ten, do ktorého vstúpi ďalší štart — a krok 04 vráti každý z nich do pôvodného stavu.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'Po každom kroku prehliadač stiahne **súbor behu** pomenovaný podľa začiatku behu, času uloženia a kroku, kam beh došiel (`{example}`), s jedným priečinkom pre každý krok. Ponechajte si ten najnovší — umožní vám pokračovať neskôr.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**Kroky 03 a 04 zapisujú do pamäte flash kamery** a každý vás najprv požiada o potvrdenie. Kým niektorý z nich beží, nechajte kameru pripojenú (ak vás stránka nepožiada, aby ste ju odpojili a znova pripojili) a počítač zapnutý, najlepšie napájaný zo siete. Prerušený zápis zanechá kameru, ktorú opraví len hardvérový programátor (SPI alebo SWD/J-Link).',
  'how.phone':
    '**Na telefóne:** pred krokom 03 zapnite režim v lietadle a vypnite Wi-Fi aj mobilné dáta, aby hovor ani upozornenie nemohli prehliadač uprostred zápisu odviesť inam — a nechajte obrazovku zapnutú. Keď je stránka otvorená, funguje aj offline.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**Zápis nie je pre tento beh zaznamenaný, takže kroky po ňom sú uzavreté.** V kamere už môže bežať záplatovaný obraz (prerušený zápis), alebo ani nie (zápis vôbec nezačal) — súbor behu nedokáže preukázať, čo z toho platí. Nespúšťajte čítanie celej pamäte flash ani obnovenie na záplatovanej kamere bez zaznamenaného zápisu; cesta ďalej vedie cez krok 03, ktorého kontrola pred zápisom prečíta slot a odmietne ho znova naslepo zapísať. Preskok sa použije, len ak táto kontrola už odmietla so správou *already holds the patched bytes* — a má vlastné dialógové okno.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Čítanie a príprava',
  'phase.readBuild.inSentence': 'čítanie a prípravu',
  'phase.readBuild.description':
    'Prečíta všetko, čo bežná kamera vydá — 31 blokov po 64 KB — a uchová to ako vašu zálohu, prečíta každý slot firmvéru druhýkrát, zistí, z ktorého slotu kamera naštartuje nabudúce, a pripraví malú záplatu, ktorú zapíše ďalší krok. Do kamery sa nič nezapisuje. Zvyčajne to trvá menej ako minútu. Ak kamera cestou potrebuje reštart, stránka vás požiada, aby ste stlačili „Pripojiť zariadenie“ a znova ju vybrali — to sa očakáva.',
  'phase.patchDump.label': 'Zápis a čítanie celej pamäte flash',
  'phase.patchDump.inSentence': 'zápis a čítanie celej pamäte flash',
  'phase.patchDump.description':
    'Zapíše malú dočasnú záplatu do slotov firmvéru zvolených v kroku 02 (predvolene do slotu, z ktorého kamera naštartuje nabudúce), aby kamera mohla vydať celú svoju pamäť flash. Potom sa kamera reštartuje — keď o to stránka požiada, stlačte „Pripojiť zariadenie“ a znova ju vyberte — a prečíta sa celá pamäť flash (4 MB). Krok 04 vráti pôvodný firmvér.',
  'phase.restoreVerify.label': 'Obnovenie a kontrola',
  'phase.restoreVerify.inSentence': 'obnovenie a kontrolu',
  'phase.restoreVerify.description':
    'Zapíše späť váš pôvodný firmvér, reštartuje kameru (keď o to budete požiadaní, stlačte „Pripojiť zariadenie“ a znova ju vyberte) a potom všetko ešte raz prečíta, aby overil, že bajt po bajte zodpovedá zálohe.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Prečíta 31 blokov po 64 KB, ktoré bežná kamera dovolí prečítať, potom prečíta každý slot druhýkrát (obe čítania sa musia bajt po bajte zhodovať), z toho, čo kamera ukladá, získa firmvér každého slotu (dešifrovaný tam, kde je uložený zašifrovane), skontroluje ho a zistí, z ktorého slotu kamera naštartuje nabudúce. Je to jediná kópia tejto kamery v celom behu, vytvorená skôr, než sa čokoľvek zapíše.',
  'step.patch.description':
    'Offline, bez kamery. Zostaví záplatu pre každý slot, ktorý beh môže zapísať: tá umožní čítaniu kamery dosiahnuť na celú pamäť flash (4 MB) a zapisuje sa v podobe, v akej ju kamera ukladá, takže sa zmenia len vlastné bajty záplaty.',
  'step.commit.description':
    'Zápis. Najprv spätne prečíta každý zvolený slot a nezapíše nič, ak každý z nich stále neobsahuje to, čo zaznamenala záloha (zápis, ktorý už prebehol, sa nikdy neopakuje), a potom ich zapíše jeden po druhom, slot, ktorý kamera skúša ako prvý, až nakoniec. Kamera sa tu nereštartuje: reštartuje ju ďalší krok.',
  'step.drain.description':
    'Reštartuje kameru, aby spustila záplatovaný firmvér (asi desať sekúnd mlčí; stránka počká a znova ju nájde), skontroluje, z ktorého slotu naštartovala (slot bez záplaty krok zastaví skôr, než sa čokoľvek prečíta), potom jedným čítaním prečíta celú pamäť flash (4 MB) a do uloženého obrazu vloží zo zálohy pôvodný firmvér každého zapísaného slotu. Nič sa nezapisuje.',
  'step.restore.description':
    'Druhý zápis. Zapíše späť pôvodný firmvér každého zapísaného slotu, kým ešte beží záplatovaný firmvér, a potom kameru reštartuje.',
  'step.verify.description':
    'Po novom štarte znova prečíta 31 blokov, medzi nimi každý slot: 0 rozdielnych bajtov dokazuje, že pamäť flash kamery je bajtovo zhodná so zálohou. Len na čítanie.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Spustiť {phase}',
  'phase.retry': 'Skúsiť znova {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Pokračovať krokom 04: obnoviť sloty',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Preskočiť nezaznamenaný zápis',
  'phase.skipWrite': 'Vynechať zápis — začať čítaním celej pamäte flash',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': 'Akcie: {phase}',
  /* The badges beside the step's title. */
  'badge.writes': 'zapisuje do kamery',
  'badge.running': 'Beží',
  'badge.done': 'Hotovo',
  'badge.plannedStop': 'Zastavené podľa plánu — nasleduje obnovenie',
  'badge.failed': 'Zastavené — pozrite si protokol',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Na rade',
  /* Why the start button is off. */
  'notReady.noRun': 'Dostupné po kroku 02 — ten začne beh.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Dostupné po kroku {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Zatiaľ nepripravené — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Týka sa záplatovanej kamery, kým zápis nie je zaznamenaný — kamera už môže byť záplatovaná. Pozrite si poznámku v časti „{section}“.',
  'phase.noDrain':
    'Čítanie celej pamäte flash neprebehlo — tento krok vráti kameru do pôvodného stavu bez neho. Ak vám na čítaní celej pamäte flash záleží, spustite najprv krok 03.',
  'phase.keepPlugged': 'Kým tento krok neskončí, nechajte kameru pripojenú a počítač zapnutý.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Priebeh',
  'phase.showDetails': 'Zobraziť podrobnosti v protokole',
  'phase.inDetail': 'Čo tento krok podrobne robí',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Ste na rade',
  'yourTurn.reconnect.title': 'Ste na rade: stlačte „Pripojiť zariadenie“ a vyberte kameru.',
  'yourTurn.reconnect.body':
    'Kamera sa podľa plánu reštartovala. Chrome ju sám znova nespozná (nemá sériové číslo USB), takže ju musíte vybrať ešte raz. Krok pokračuje, hneď ako to urobíte.',
  'yourTurn.replug.title':
    'Ste na rade: odpojte kameru, znova ju pripojte a potom stlačte „Pripojiť zariadenie“.',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'Záplata tohto behu vznikla pred opravou čítania, takže kamera potrebuje pred obnovením nové zapnutie. Súbor behu je už uložený.',
  'yourTurn.replugBeforeRestore.title':
    'Pred krokom 04: odpojte kameru, znova ju pripojte a potom stlačte „Pripojiť zariadenie“.',
  'yourTurn.powerCycle.title':
    'Ste na rade: odpojte kameru, znova ju pripojte, stlačte „Pripojiť zariadenie“ — a skúste to znova.',
  'yourTurn.powerCycle.body':
    'Čítacia časť kamery potrebuje nové zapnutie, skôr než ju bude možné znova prečítať. Beh je tu stále načítaný; nič sa nestratilo.',
  'yourTurn.powerCycleAssert.title':
    'Ste na rade: odpojte kameru, znova ju pripojte, stlačte „Pripojiť zariadenie“ — a pokračujte.',
  'yourTurn.powerCycleAssert.body':
    'Posledný pokus o zálohu sa zastavil a kamera potrebuje nové zapnutie, skôr než znova pobeží. Kamera to sama nahlásiť nedokáže, takže tlačidlo nižšie stránke oznámi, že ste to urobili.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Kamera je znova pripojená — dokončiť {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Ktoré sloty krok 03 záplatuje',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Slovo konfigurácie štartu',
  'banks.lastStart': 'Posledný štart',
  'banks.nextStart': 'Ďalší štart',
  'banks.caption': 'Tri sloty firmvéru tak, ako ich prečítal krok 02',
  'banks.col.bank': 'Slot',
  'banks.col.address': 'Adresa',
  'banks.col.holds': 'Čo obsahuje',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'ďalší štart',
  'banks.choiceLabel': 'Sloty na záplatovanie',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'Slot, do ktorého vstúpi ďalší štart',
  'choice.all': 'Všetky sloty',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — neponúka sa',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen': 'Zatiaľ nie je zvolený žiadny slot: {what}. Zvoľte slot podľa názvu vyššie.',
  'banks.writes': 'Krok 03 zapisuje: {what}.',
  'banks.fixed': 'Zápis prebehol, takže voľba je pevná: krok 04 vráti presne tieto sloty.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: neponúka sa — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'nie je aktívny žiadny beh — krok 02 ho začne',
  'banks.refusedBusy': 'beží krok — sloty zvoľte, keď skončí',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'Plán — {build}, záplatuje {banks:acc}',
  'plan.summaryNone': 'Plán — {build}, zatiaľ nie je zvolený žiadny slot',
  'plan.yourCamera': 'vaša kamera',
  'plan.intro':
    'Vypísané z vlastných bajtov kamery. Nič sa nezapíše, kým neprebehne krok 03, a krok 04 vráti každý bajt, ktorý zapíše.',
  /* The rows; their values are core's. */
  'plan.build': 'Zostava',
  'plan.version': 'Verzia firmvéru',
  'plan.written': 'Zapisuje sa',
  'plan.route': 'Kam to ide',
  'plan.restore': 'Obnovenie',
  'plan.wholeFlash': 'Čítanie celej pamäte flash',
  'plan.outro':
    'V podobe, v akej ju kamera ukladá, sa menia tie isté bajty a žiadne iné, takže sa firmvér kamery zmení presne o tento rozdiel a o nič viac.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'Záplata {bank:gen}',
  'bankPlan.titleChosen': '{bank} — zapisuje tento beh',
  'bankPlan.titleNotChosen': '{bank} — nezvolený',
  'bankPlan.source': 'Zdroj obrazu',
  'bankPlan.sourceValue': '{bank} tak, ako je uložený',
  'bankPlan.sourceTwoReads': '{bank} tak, ako je uložený, dve zhodné čítania (sha256 {sha})',
  'bankPlan.edit': 'Úprava obrazu',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) na továrenskom obraze. Jej vyrovnanie, {balance}, je vo vyrovnávacom slove; záplata sa vyrovnáva navyše k nemu a krok 04 vráti obraz aj s touto úpravou.',
  'bankPlan.factorySha': 'sha256 továrenského otvoreného textu',
  'bankPlan.patchedSha': 'sha256 po záplate',
  /** Row label: how many bytes of the bank, as the flash chip stores it, the patch changes. */
  'bankPlan.diffCount': 'Bajty zmenené na čipe flash',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Dĺžka na odovzdanie',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    one: '{size} B, {count} blok',
    few: '{size} B, {count} bloky',
    many: '{size} B, {count} bloku',
    other: '{size} B, {count} blokov',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Vyrovnávacie slovo',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (predtým {balance}, vyrovnanie úpravy)',
  'bankPlan.caption': 'Presné bajty, ktoré záplata mení v {bank:loc}',
  'bankPlan.col.what': 'Čo mení',
  'bankPlan.col.offset': 'Offset',
  'bankPlan.col.before': 'Pred',
  'bankPlan.col.after': 'Po',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Overené — dokonalá zhoda.** Po novom štarte sa kamera prečítala znova: bloky {read}/31, {count} rozdielny bajt. Jej pamäť flash je presne taká, aká bola pred prvým zápisom.',
    few: '**Overené — dokonalá zhoda.** Po novom štarte sa kamera prečítala znova: bloky {read}/31, {count} rozdielne bajty. Jej pamäť flash je presne taká, aká bola pred prvým zápisom.',
    many: '**Overené — dokonalá zhoda.** Po novom štarte sa kamera prečítala znova: bloky {read}/31, {count} rozdielneho bajtu. Jej pamäť flash je presne taká, aká bola pred prvým zápisom.',
    other:
      '**Overené — dokonalá zhoda.** Po novom štarte sa kamera prečítala znova: bloky {read}/31, {count} rozdielnych bajtov. Jej pamäť flash je presne taká, aká bola pred prvým zápisom.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Overené — dokonalá zhoda.** Po novom štarte sa kamera prečítala znova: bloky {read}/31, {count} rozdielny bajt (krátke bloky: {blocks}). Jej pamäť flash je presne taká, aká bola pred prvým zápisom.',
    few: '**Overené — dokonalá zhoda.** Po novom štarte sa kamera prečítala znova: bloky {read}/31, {count} rozdielne bajty (krátke bloky: {blocks}). Jej pamäť flash je presne taká, aká bola pred prvým zápisom.',
    many: '**Overené — dokonalá zhoda.** Po novom štarte sa kamera prečítala znova: bloky {read}/31, {count} rozdielneho bajtu (krátke bloky: {blocks}). Jej pamäť flash je presne taká, aká bola pred prvým zápisom.',
    other:
      '**Overené — dokonalá zhoda.** Po novom štarte sa kamera prečítala znova: bloky {read}/31, {count} rozdielnych bajtov (krátke bloky: {blocks}). Jej pamäť flash je presne taká, aká bola pred prvým zápisom.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**Kontrola našla rozdiely oproti zálohe.** {error}',
  unknownReason: 'neznámy dôvod',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — zapísať do {banks:gen}?',
  'confirm.titleJump': '{phase} — preskočiť nezaznamenaný zápis?',
  'confirm.chosenBanks': 'zvolených slotov',
  'confirm.jump':
    'ZÁPIS NIE JE PRE TENTO BEH ZAZNAMENANÝ a vy tvrdíte, že zápisy prebehli bez svojich kontrolných bodov: krok začne za zápisom namiesto toho, aby zapisoval znova. Vlastné kontroly krokov napriek tomu prebehnú — čítanie verzie, kontroly slotov — a chybný odhad stojí zbytočné čítanie celej pamäte flash, nie zničenú kameru.',
  'confirm.jumpKeepPlugged': 'Kým krok neskončí, nechajte kameru pripojenú a počítač zapnutý.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Tým sa do {banks:gen} zapíše malá záplata. Krok 04 vráti pôvodný obsah. Čítanie celej pamäte flash, ktoré nasleduje, len číta.',
  'confirm.patchInOrder':
    'Tým sa do {banks:gen} zapíše malá záplata, v tomto poradí — slot, ktorý kamera skúša ako prvý, príde na rad posledný. Krok 04 vráti pôvodný obsah. Čítanie celej pamäte flash, ktoré nasleduje, len číta.',
  /* Step 04. */
  'confirm.restore': 'Tým sa do {banks:gen} zapíše späť váš pôvodný firmvér.',
  'confirm.restoreInOrder':
    'Tým sa do {banks:gen} zapíše späť váš pôvodný firmvér, v tomto poradí — slot, ktorý kamera skúša ako prvý, príde na rad prvý.',
  'confirm.keepPlugged':
    'Počas zápisu nechajte kameru pripojenú a počítač zapnutý — prerušený zápis zanechá kameru, ktorú opraví len hardvérový programátor (SPI alebo SWD/J-Link). Na telefóne zapnite režim v lietadle a nechajte obrazovku zapnutú. Kamera sa potom reštartuje; keď o to stránka požiada, stlačte „Pripojiť zariadenie“ a znova ju vyberte. To sa očakáva.',
  'confirm.yesJump': 'Áno — preskočiť zápis',
  'confirm.yesWrite': 'Áno — zapísať do kamery',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'Dôkaz',
  'summary.complete': 'Úplný obraz (4 MB)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'nevytvorené',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'od zálohy sa líši {differing} z {count} bloku: {blocks}',
    few: 'od zálohy sa líši {differing} z {count} blokov: {blocks}',
    many: 'od zálohy sa líši {differing} z {count} bloku: {blocks}',
    other: 'od zálohy sa líši {differing} z {count} blokov: {blocks}',
  },
  'summary.matches': {
    one: 'zhoduje sa so zálohou ({count} blok)',
    few: 'zhoduje sa so zálohou (všetky {count} bloky)',
    many: 'zhoduje sa so zálohou ({count} bloku)',
    other: 'zhoduje sa so zálohou (všetkých {count} blokov)',
  },
  'summary.onlyInFull': 'Len v čítaní celej pamäte flash',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} blok, na ktorý bežné čítanie nedosiahne: {blocks}',
    few: '{count} bloky, na ktoré bežné čítanie nedosiahne: {blocks}',
    many: '{count} bloku, na ktoré bežné čítanie nedosiahne: {blocks}',
    other: '{count} blokov, na ktoré bežné čítanie nedosiahne: {blocks}',
  },
  'summary.rawDump': 'Čítanie celej pamäte flash, tak ako bolo prečítané',
  'summary.rawDumpBadge': 'to isté, so záplatou stále v obraze',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Obraz firmvéru (dešifrovaný, {bank})',
  'summary.verify': 'Kontrola',
  'summary.toolbar': 'Akcie archívu',
  'summary.download': 'Stiahnuť celý archív (súbor behu)',

  /*
   * ---- what the run file holds (views/PreserveView, "What you get") ----
   * The file and folder names in the table stay as they are; {fill} is a byte (0xFF), {original} a file name.
   */
  'output.title': 'Čo dostanete',
  'output.intro':
    'Súbor behu je jeden stiahnutý súbor `{ext}`. Každé uloženie obsahuje všetko, čo beh doteraz vytvoril, s jedným priečinkom pre každý krok:',
  'output.caption': 'Súbory vnútri súboru behu',
  'output.file': 'Súbor',
  'output.what': 'Čo to je',
  'output.runState':
    'záznam behu: načítajte zip na tejto karte, aby ste v behu pokračovali alebo si ho znova prezreli',
  'output.readme': 'čo v zipe je a kde',
  'output.backup':
    'vaša záloha: 31 blokov, ktoré bežná kamera vydá, prečítaných skôr, než sa čokoľvek zapíše, každý na svojej adrese v pamäti flash ({fill} tam, kde sa blok nedá týmto spôsobom prečítať)',
  'output.capture':
    'každý slot firmvéru, ktorý beh môže zapísať, tak ako ho kamera ukladá (a, b alebo r v názve), prečítaný dvakrát so zhodným výsledkom',
  'output.plain': 'firmvér z každého z týchto slotov, dešifrovaný',
  'output.patched':
    'pre každý slot, ktorý beh záplatuje: jeho firmvér s dočasnou záplatou na čítanie',
  'output.decrypted': 'dešifrovaná záloha: firmvér každého slotu a správa o ňom',
  'output.manifest': 'podrobnosti tohto dešifrovania',
  'output.decryptReadme': 'čo toto dešifrovanie obsahuje a aké má obmedzenia',
  'output.pageBuild': 'ktorá zostava tejto stránky beh vykonala',
  'output.dumpPatched':
    'celé 4 MB tak, ako boli prečítané, so záplatou stále v slotoch, do ktorých bola zapísaná',
  'output.dumpOriginal':
    'úplný obraz: celé 4 MB s vráteným pôvodným firmvérom — pôvodná pamäť flash vašej kamery',
  'output.verify':
    '31 blokov prečítaných znova po obnovení, usporiadaných ako záloha; mali by sa s ňou zhodovať',
  'output.grows':
    'Súbor sa objaví, hneď ako prebehne krok, ktorý ho vytvára, takže skorý súbor behu obsahuje len prvý priečinok.',
  'output.keep':
    'Súbor, ktorý si máte ponechať, je `{original}`: celá pamäť flash vašej kamery v pôvodnom stave. Zvyšok ukazuje, ako sa k nemu beh dostal.',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Voliteľné — na neskoršie pokračovanie v behu',
  'runFile.title': 'Súbor behu',
  'runFile.description':
    'Jediný záznam behu. Stiahne sa sám po každom kroku (aj po kroku, ktorý skončil predčasne); ponechajte si ten najnovší. Ak chcete pokračovať neskôr alebo po probléme, načítajte ho tu a stránka nadviaže tam, kde skončila.',
  'runFile.run': 'Beh',
  'runFile.file': 'Súbor',
  'runFile.lastSaved': 'Naposledy uložené',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'po kroku {step} — {at} ({bytes} B)',
  'runFile.nextStep': 'Ďalší krok',
  'runFile.none': 'Nie je aktívny žiadny beh. Krok 02 ho začne, alebo tu načítajte súbor behu.',
  'runFile.toolbar': 'Akcie súboru behu',
  'runFile.load': 'Načítať súbor behu…',
  'runFile.save': 'Znova uložiť súbor behu',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Pokračovanie',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Nie je vybraný žiadny súbor behu.',
  'status.notRun': 'Zatiaľ nespustené.',
  'status.running': 'Beží…',
  'status.runningRestarts': 'Beží — kamera sa počas tohto kroku reštartuje…',
  'status.restarting': 'Kamera sa reštartuje — trvá to asi desať sekúnd…',
  'status.waitConnect': 'Čaká sa na vás — stlačte „Pripojiť zariadenie“ a vyberte kameru…',
  'status.waitPlugBack':
    'Čaká sa na vás — znova pripojte kameru a potom stlačte „Pripojiť zariadenie“…',
  'status.waitReplug': 'Čaká sa na vás — odpojte kameru a znova ju pripojte…',
  'status.back': 'Kamera je späť — pokračuje sa…',
  'status.swapped': 'Zastavené — kamera sa zmenila. Skontrolujte ju a potom spustite krok znova.',
  'status.noRun': 'Žiadny beh.',
  'status.notCreated': 'Nevytvorené — pozrite si protokol vyššie.',
  'status.refused': 'Odmietnuté — zoznam krokov vyššie uvádza, čo chýba.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} — hotovo. Súbor behu v stiahnutých súboroch je aktuálny.',
  'status.doneReplug':
    '{phase} — hotovo a súbor behu je uložený. Pred obnovením: odpojte kameru, znova ju pripojte a stlačte „Pripojiť zariadenie“.',
  'status.backupRefused': 'Odmietnuté — nič sa nezapísalo. Pozrite si protokol vyššie.',
  'status.failed': 'Zlyhalo — pozrite si protokol vyššie.',
  'status.cancelled': 'Zrušené — súbor behu stále uvádza, kde sa beh zastavil.',
  'status.readingFile': 'Číta sa súbor behu…',
  'status.doneEarlier': 'Hotovo skôr — načítané zo súboru behu.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Skôr zlyhalo: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Pokračuje sa od kroku {step}. Zoznam krokov nadviaže odtiaľ.',
  'status.notResumed': 'Nepokračuje sa — pozrite si protokol vyššie.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'je potrebné: {missing}',
  'gate.noRun': 'nie je aktívny žiadny beh — prvý krok beh vytvorí',
  'gate.runDone': 'tento beh je hotový — všetky kroky sú dokončené',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'už hotovo — pokračovanie nadviaže krokom {step}',
  'gate.banksRead': 'sloty, ktoré číta záloha',
  'gate.choice': 'voľba slotov — {why}',
  'gate.bankRefused': '{bank} sa nedá zapísať: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'cesta cez slot na obnovu (táto zostava beží len zo {r:gen}, nie zo {bank:gen})',
  'gate.backupFirst': 'záloha pamäte flash (v tomto kroku beží ako prvá)',
  'gate.backup': 'záloha pamäte flash',
  'gate.patchStep': 'krok záplaty',
  'gate.patchOf': 'záplata {bank:gen}',
  'gate.backupFile': 'súbor s oknami zálohy',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': 'dvojité čítanie {bank:gen}',
  'gate.derived': 'odvodený obraz {bank:gen}',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'krok Zápis (najprv ho spustite alebo v ňom pokračujte)',
  'gate.drainRefused': 'čítanie celej pamäte flash odmietnuté pre {build} — {why}',
  'gate.patchSummary': 'súhrn záplaty {bank:gen} (dĺžka na odovzdanie)',
  'gate.restoreRefused':
    'obnovenie odmietnuté pre {build} — žiadna podoba pôvodného firmvéru sa neuloží späť ako pôvodné bajty; beh skončí s úplným obrazom a záplatou na mieste',
  /* {file} is a file name in the run file. */
  'gate.plaintext': 'továrenský otvorený text {bank:gen} ({file}, z kroku zálohy)',
  'gate.restoreFirst': 'obnovenie (v tomto kroku beží ako prvé)',
  'gate.powerCycle':
    'potvrdenie vypnutia a zapnutia — vypnite a zapnite kameru (odpojte ju a znova pripojte alebo použite jej vypínač) a potom použite ovládací prvok na opätovné spustenie',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'kamera sa nevrátila ani po {minutes} min opakovaných pokusov: {error} — ak sa Chrome na nič neopýtal, znova pripojte kameru a spustite krok znova; ak protokol hovoril, aby ste ju znova pripojili, čakal práve na kliknutie na „Pripojiť zariadenie“',
} satisfies Translation<'preserve', 'sk'>;
