/**
 * Namespace `preserve`, română (ro), translated from the English source: the "Dump & decrypt 0.x/1.x" tab, a guided run that
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
  'how.title': 'La ce să vă așteptați',
  'how.descriptionIdle': 'Conectați camera, apoi începeți cu pasul 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Rularea {runId}.',
  'how.descriptionRunVersion': 'Rularea {runId} — firmware {version}.',
  'how.restarts':
    'Camera **repornește** în timpul fiecărui pas. După o repornire, Chrome nu o mai recunoaște (nu are număr de serie USB), așa că pagina vă cere să apăsați **Conectare dispozitiv** și să alegeți din nou camera. Acesta este cursul normal — pasul continuă singur după ce faceți asta.',
  'how.noFile':
    'Nu trebuie să alegeți niciun fișier de firmware: totul este citit chiar din cameră.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'Camera își păstrează firmware-ul în trei **sloturi** ({a:acc}, {b:acc} și {r:acc}). Pasul 02 le citește pe toate trei și află din care va porni camera data viitoare; patch-ul funcționează doar dacă acel slot îl conține. Alegeți sloturile pe care pasul 03 aplică patch-ul — implicit cel în care intră următoarea pornire —, iar pasul 04 le pune pe toate la loc.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'După fiecare pas, browserul descarcă un **fișier de rulare** numit după începutul rulării, ora salvării și pasul atins (`{example}`), cu câte un dosar pentru fiecare pas. Păstrați-l pe cel mai nou — vă permite să continuați mai târziu.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**Pașii 03 și 04 scriu în memoria flash a camerei** și fiecare vă cere mai întâi confirmarea. Cât timp rulează unul dintre ei, țineți camera conectată (cu excepția cazului în care pagina vă cere să o reconectați) și calculatorul pornit, fără să intre în repaus, ideal alimentat de la priză. O scriere întreruptă lasă o cameră pe care doar un programator hardware (SPI sau SWD/J-Link) o mai poate repara.',
  'how.phone':
    '**Pe telefon:** înainte de pasul 03, activați modul avion și opriți Wi-Fi și datele mobile, ca un apel sau o notificare să nu poată scoate browserul din prim-plan în mijlocul unei scrieri — și țineți ecranul aprins. Odată deschisă, pagina funcționează și offline.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**Scrierea nu este consemnată pentru această rulare, așa că pașii de după ea sunt blocați.** Camera poate rula deja imaginea cu patch (o scriere întreruptă) sau nu (scrierea nu a început niciodată) — fișierul de rulare nu poate dovedi care dintre ele. Nu rulați citirea completă sau restaurarea pe o cameră cu patch fără ca scrierea să fie consemnată; calea de urmat este pasul 03, a cărui verificare dinaintea scrierii citește slotul și refuză să-l scrie din nou orbește. Doar dacă acea verificare a refuzat deja cu *already holds the patched bytes* se aplică saltul — și trece prin propria fereastră de dialog.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Citire și pregătire',
  'phase.readBuild.inSentence': 'citire și pregătire',
  'phase.readBuild.description':
    'Citește tot ce lasă să iasă o cameră nemodificată — 31 de blocuri de 64 KB — și le păstrează drept copie de rezervă, citește a doua oară fiecare slot de firmware, află din ce slot va porni camera data viitoare și pregătește micul patch pe care îl scrie pasul următor. Nu se scrie nimic în cameră. De obicei durează sub un minut. Dacă pe parcurs camera are nevoie de o repornire, pagina vă cere să apăsați „Conectare dispozitiv” și să o alegeți din nou — este normal.',
  'phase.patchDump.label': 'Scriere și citire completă',
  'phase.patchDump.inSentence': 'scriere și citire completă',
  'phase.patchDump.description':
    'Scrie un patch mic și temporar în sloturile de firmware alese la pasul 02 (implicit slotul din care camera pornește data viitoare), ca să poată fi citită toată memoria flash. Apoi camera repornește — apăsați „Conectare dispozitiv” și alegeți-o din nou când vă cere pagina — și se citește întreaga memorie flash de 4 MB. Pasul 04 pune la loc firmware-ul original.',
  'phase.restoreVerify.label': 'Restaurare și verificare',
  'phase.restoreVerify.inSentence': 'restaurare și verificare',
  'phase.restoreVerify.description':
    'Scrie la loc firmware-ul original, repornește camera (apăsați „Conectare dispozitiv” și alegeți-o din nou când vi se cere), apoi citește totul încă o dată, ca să verifice că se potrivește octet cu octet cu copia de rezervă.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Citește cele 31 de blocuri de 64 KB pe care le poate citi o cameră nemodificată, apoi citește a doua oară fiecare slot (cele două citiri trebuie să coincidă octet cu octet), scoate firmware-ul fiecărui slot din ce stochează camera (decriptat acolo unde este stocat criptat), îl verifică și află din ce slot va porni camera data viitoare. Aceasta este singura copie a acestei camere din rulare, făcută înainte să se scrie ceva.',
  'step.patch.description':
    'Offline, fără cameră. Construiește patch-ul pentru fiecare slot pe care rularea îl poate scrie: patch-ul permite citirii camerei să ajungă la întreaga memorie flash de 4 MB și este scris în forma în care îl stochează camera, așa că se schimbă doar octeții patch-ului.',
  'step.commit.description':
    'Scrierea. Mai întâi recitește fiecare slot ales și nu scrie nimic decât dacă fiecare conține încă ce a consemnat copia de rezervă (o scriere deja făcută nu se repetă niciodată), apoi le scrie pe rând, iar slotul pe care camera îl încearcă primul este scris ultimul. Camera nu este repornită aici: o repornește pasul următor.',
  'step.drain.description':
    'Repornește camera ca să pornească firmware-ul cu patch (camera nu răspunde aproximativ zece secunde; pagina așteaptă și o găsește din nou), verifică din ce slot a pornit (un slot fără patch oprește pasul înainte să se citească ceva), apoi citește întreaga memorie flash de 4 MB dintr-o dată și pune în imaginea salvată firmware-ul original al fiecărui slot scris, din copia de rezervă. Nu se scrie nimic.',
  'step.restore.description':
    'Cealaltă scriere. Scrie la loc firmware-ul original al fiecărui slot scris cât timp firmware-ul cu patch încă rulează, apoi repornește camera.',
  'step.verify.description':
    'După o pornire nouă, citește din nou cele 31 de blocuri, printre care și fiecare slot: 0 octeți diferiți dovedesc că memoria flash a camerei este identică octet cu octet cu copia de rezervă. Doar citire.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Pornire: {phase}',
  'phase.retry': 'Încercați din nou: {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Mergeți la pasul 04: restaurarea sloturilor',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Treceți peste scrierea neconsemnată',
  'phase.skipWrite': 'Săriți scrierea — începeți cu citirea completă',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': 'Acțiuni: {phase}',
  /* The badges beside the step's title. */
  'badge.writes': 'scrie în cameră',
  'badge.running': 'Rulează',
  'badge.done': 'Gata',
  'badge.plannedStop': 'Oprit conform planului — urmează restaurarea',
  'badge.failed': 'Oprit — vedeți jurnalul',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Urmează',
  /* Why the start button is off. */
  'notReady.noRun': 'Disponibil după pasul 02 — acesta pornește rularea.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Disponibil după pasul {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Încă nu este gata — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Privește camera cu patch cât timp scrierea nu este consemnată — camera poate avea deja patch-ul. Vedeți nota de sub „{section}”.',
  'phase.noDrain':
    'Citirea completă nu a rulat — acest pas readuce camera la starea inițială fără ea. Rulați mai întâi pasul 03, cu excepția cazului în care citirea completă nu contează pentru dumneavoastră.',
  'phase.keepPlugged': 'Țineți camera conectată și calculatorul pornit până se termină acest pas.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Progres',
  'phase.showDetails': 'Afișare detalii în jurnal',
  'phase.inDetail': 'Ce face acest pas, în detaliu',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Rândul dumneavoastră',
  'yourTurn.reconnect.title':
    'Rândul dumneavoastră: apăsați „Conectare dispozitiv” și alegeți camera.',
  'yourTurn.reconnect.body':
    'Camera a repornit, conform planului. Chrome nu o poate recunoaște singur din nou (nu are număr de serie USB), așa că trebuie să o alegeți încă o dată. Pasul continuă imediat ce faceți asta.',
  'yourTurn.replug.title':
    'Rândul dumneavoastră: deconectați camera, conectați-o din nou, apoi apăsați „Conectare dispozitiv”.',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'Patch-ul acestei rulări a fost făcut înainte de corecția cititorului, așa că, înainte de restaurare, camera trebuie deconectată și reconectată. Fișierul de rulare este deja salvat.',
  'yourTurn.replugBeforeRestore.title':
    'Înainte de pasul 04: deconectați camera, conectați-o din nou, apoi apăsați „Conectare dispozitiv”.',
  'yourTurn.powerCycle.title':
    'Rândul dumneavoastră: deconectați camera, conectați-o din nou, apăsați „Conectare dispozitiv” — apoi încercați din nou.',
  'yourTurn.powerCycle.body':
    'Ca să poată fi citită din nou, camera trebuie deconectată și reconectată. Rularea este încă încărcată aici; nu s-a pierdut nimic.',
  'yourTurn.powerCycleAssert.title':
    'Rândul dumneavoastră: deconectați camera, conectați-o din nou, apăsați „Conectare dispozitiv” — apoi continuați.',
  'yourTurn.powerCycleAssert.body':
    'Ultima încercare de copiere de rezervă s-a oprit, iar camera trebuie deconectată și reconectată înainte să ruleze din nou. Camera nu poate raporta singură acest lucru, așa că butonul de mai jos îi spune paginii că ați făcut-o.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Am reconectat-o — continuare: {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Pe ce sloturi aplică patch-ul pasul 03',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Cuvântul de configurare a pornirii',
  'banks.lastStart': 'Ultima pornire',
  'banks.nextStart': 'Următoarea pornire',
  'banks.caption': 'Cele trei sloturi de firmware, așa cum le-a citit pasul 02',
  'banks.col.bank': 'Slot',
  'banks.col.address': 'Adresă',
  'banks.col.holds': 'Ce conține',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'următoarea pornire',
  'banks.choiceLabel': 'Sloturi pentru patch',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'Slotul în care intră următoarea pornire',
  'choice.all': 'Toate sloturile',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — neoferit',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen': 'Încă nu este ales niciun slot: {what}. Alegeți mai sus un slot după nume.',
  'banks.writes': 'Pasul 03 scrie {what}.',
  'banks.fixed':
    'Scrierea a rulat, așa că alegerea este fixată: pasul 04 pune la loc exact aceste sloturi.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: neoferit — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'nu este activă nicio rulare — pasul 02 pornește una',
  'banks.refusedBusy': 'rulează un pas — alegeți sloturile după ce se termină',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'Planul — {build}, patch pe {banks:acc}',
  'plan.summaryNone': 'Planul — {build}, încă niciun slot ales',
  'plan.yourCamera': 'camera dumneavoastră',
  'plan.intro':
    'Afișat pe baza octeților camerei. Nu se scrie nimic până nu rulează pasul 03, iar pasul 04 pune la loc fiecare octet pe care îl scrie acesta.',
  /* The rows; their values are core's. */
  'plan.build': 'Build',
  'plan.version': 'Versiune firmware',
  'plan.written': 'Scris',
  'plan.route': 'Unde ajunge',
  'plan.restore': 'Restaurare',
  'plan.wholeFlash': 'Citire completă',
  'plan.outro':
    'În forma stocată de cameră se schimbă aceiași octeți și niciunul altul, așa că firmware-ul camerei se schimbă exact cu această diferență și cu nimic altceva.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'Patch-ul {bank:gen}',
  'bankPlan.titleChosen': '{bank} — scris de această rulare',
  'bankPlan.titleNotChosen': '{bank} — neales',
  'bankPlan.source': 'Sursa imaginii',
  'bankPlan.sourceValue': '{bank:acc} așa cum este stocat',
  'bankPlan.sourceTwoReads': '{bank:acc} așa cum este stocat, două citiri identice (sha256 {sha})',
  'bankPlan.edit': 'Modificarea imaginii',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}), pe imaginea din fabrică. Valoarea ei de echilibrare, {balance}, se află în cuvântul de ajustare; patch-ul își face echilibrarea peste ea, iar pasul 04 pune imaginea la loc cu tot cu această modificare.',
  'bankPlan.factorySha': 'sha256 al imaginii necriptate din fabrică',
  'bankPlan.patchedSha': 'sha256 cu patch',
  /** Row label: how many bytes of the bank, as the flash chip stores it, the patch changes. */
  'bankPlan.diffCount': 'Octeți modificați în cipul flash',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Lungime transferată',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    one: '{size} B în {count} bucată',
    few: '{size} B în {count} bucăți',
    other: '{size} B în {count} de bucăți',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Cuvânt de echilibrare',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (era {balance}, valoarea de echilibrare a modificării)',
  'bankPlan.caption': 'Octeții exacți pe care îi schimbă patch-ul în {bank:acc}',
  'bankPlan.col.what': 'Ce schimbă',
  'bankPlan.col.offset': 'Offset',
  'bankPlan.col.before': 'Înainte',
  'bankPlan.col.after': 'După',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Verificat — potrivire perfectă.** După o pornire nouă, camera a fost citită din nou: {read}/31 de blocuri, {count} octet diferit. Memoria ei flash este exact cum era înainte de prima scriere.',
    few: '**Verificat — potrivire perfectă.** După o pornire nouă, camera a fost citită din nou: {read}/31 de blocuri, {count} octeți diferiți. Memoria ei flash este exact cum era înainte de prima scriere.',
    other:
      '**Verificat — potrivire perfectă.** După o pornire nouă, camera a fost citită din nou: {read}/31 de blocuri, {count} de octeți diferiți. Memoria ei flash este exact cum era înainte de prima scriere.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Verificat — potrivire perfectă.** După o pornire nouă, camera a fost citită din nou: {read}/31 de blocuri, {count} octet diferit (blocuri incomplete: {blocks}). Memoria ei flash este exact cum era înainte de prima scriere.',
    few: '**Verificat — potrivire perfectă.** După o pornire nouă, camera a fost citită din nou: {read}/31 de blocuri, {count} octeți diferiți (blocuri incomplete: {blocks}). Memoria ei flash este exact cum era înainte de prima scriere.',
    other:
      '**Verificat — potrivire perfectă.** După o pornire nouă, camera a fost citită din nou: {read}/31 de blocuri, {count} de octeți diferiți (blocuri incomplete: {blocks}). Memoria ei flash este exact cum era înainte de prima scriere.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**Verificarea a găsit diferențe față de copia de rezervă.** {error}',
  unknownReason: 'motiv necunoscut',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — scrieți în {banks:acc}?',
  'confirm.titleJump': '{phase} — treceți peste scrierea neconsemnată?',
  'confirm.chosenBanks': 'sloturile alese',
  'confirm.jump':
    'SCRIEREA NU ESTE CONSEMNATĂ pentru această rulare, iar dumneavoastră afirmați că scrierile s-au făcut fără punctele lor de control: pasul începe după scriere, în loc să scrie din nou. Verificările proprii ale pașilor rulează în continuare — citirea versiunii, verificările sloturilor —, iar o presupunere greșită costă o citire completă irosită, nu o cameră care nu mai pornește.',
  'confirm.jumpKeepPlugged':
    'Țineți camera conectată și calculatorul pornit până se termină pasul.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Aceasta scrie un patch mic în {banks:acc}. Pasul 04 pune la loc originalele. Citirea completă care urmează doar citește.',
  'confirm.patchInOrder':
    'Aceasta scrie un patch mic în {banks:acc}, în această ordine — slotul pe care camera îl încearcă primul este scris ultimul. Pasul 04 pune la loc originalele. Citirea completă care urmează doar citește.',
  /* Step 04. */
  'confirm.restore': 'Aceasta scrie la loc firmware-ul original în {banks:acc}.',
  'confirm.restoreInOrder':
    'Aceasta scrie la loc firmware-ul original în {banks:acc}, în această ordine — slotul pe care camera îl încearcă primul este scris primul.',
  'confirm.keepPlugged':
    'Țineți camera conectată și calculatorul pornit cât timp se scrie — o scriere întreruptă lasă o cameră pe care doar un programator hardware (SPI sau SWD/J-Link) o mai poate repara. Pe telefon: modul avion activat și ecranul ținut aprins. Apoi camera repornește; când vă cere pagina, apăsați „Conectare dispozitiv” și alegeți-o din nou. Este normal.',
  'confirm.yesJump': 'Da — salt peste scriere',
  'confirm.yesWrite': 'Da — scriere în cameră',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'Dovada',
  'summary.complete': 'Imaginea completă (4 MB)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'nu a fost produsă',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'diferă de copia de rezervă în {differing} din {count} bloc: {blocks}',
    few: 'diferă de copia de rezervă în {differing} din {count} blocuri: {blocks}',
    other: 'diferă de copia de rezervă în {differing} din {count} de blocuri: {blocks}',
  },
  'summary.matches': {
    one: 'se potrivește cu copia de rezervă ({count} bloc)',
    few: 'se potrivește cu copia de rezervă (toate cele {count} blocuri)',
    other: 'se potrivește cu copia de rezervă (toate cele {count} de blocuri)',
  },
  'summary.onlyInFull': 'Doar în citirea completă',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} bloc la care o citire obișnuită nu ajunge: {blocks}',
    few: '{count} blocuri la care o citire obișnuită nu ajunge: {blocks}',
    other: '{count} de blocuri la care o citire obișnuită nu ajunge: {blocks}',
  },
  'summary.rawDump': 'Citirea completă, așa cum a fost citită',
  'summary.rawDumpBadge': 'la fel, cu patch-ul încă aplicat',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Imaginea de firmware (decriptată, {bank})',
  'summary.verify': 'Verificare',
  'summary.toolbar': 'Acțiuni pentru arhivă',
  'summary.download': 'Descărcare arhivă completă (fișier de rulare)',

  /* ---- what the run file holds (views/PreserveView) ---- */
  'output.title': 'Ce primiți',
  'output.intro':
    'Fișierul de rulare este o singură descărcare `{ext}`. Fiecare salvare conține tot ce a produs rularea până atunci, cu câte un dosar pentru fiecare pas:',
  'output.caption': 'Fișierele din fișierul de rulare',
  'output.file': 'Fișier',
  'output.what': 'Ce este',
  'output.runState':
    'evidența rulării: încărcați arhiva zip în această filă ca să continuați rularea sau ca să o revedeți',
  'output.readme': 'ce se află în arhiva zip și unde',
  'output.backup':
    'copia dumneavoastră de rezervă: cele 31 de blocuri pe care le lasă să iasă o cameră nemodificată, citite înainte să se scrie ceva, fiecare la adresa sa din memoria flash ({fill} unde un bloc nu poate fi citit astfel)',
  'output.capture':
    'fiecare slot de firmware pe care rularea îl poate scrie, așa cum îl păstrează camera (a, b sau r în nume), citit de două ori, cu ambele citiri identice',
  'output.plain': 'firmware-ul din fiecare dintre aceste sloturi, decriptat',
  'output.patched':
    'pentru fiecare slot în care rularea pune patch-ul: firmware-ul său cu patch-ul temporar de citire',
  'output.decrypted':
    'copia de rezervă decriptată: firmware-ul fiecărui slot și un raport despre el',
  'output.manifest': 'detaliile acestei decriptări',
  'output.decryptReadme': 'ce conține această decriptare și care îi sunt limitele',
  'output.pageBuild': 'ce versiune a acestei pagini a făcut rularea',
  'output.dumpPatched':
    'toți cei 4 MB așa cum au fost citiți, cu patch-ul încă în sloturile în care a fost scris',
  'output.dumpOriginal':
    'imaginea completă: toți cei 4 MB cu firmware-ul original pus la loc — memoria flash originală a camerei dumneavoastră',
  'output.verify':
    'cele 31 de blocuri citite din nou după restaurare, așezate ca în copia de rezervă; ar trebui să fie identice cu ea',
  'output.grows':
    'Un fișier apare abia după ce a rulat pasul care îl produce, așa că un fișier de rulare timpuriu conține doar primul dosar.',
  'output.keep':
    'Fișierul de păstrat este `{original}`: întreaga memorie flash a camerei dumneavoastră, așa cum era. Restul arată cum a ajuns rularea acolo.',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Opțional — pentru a continua o rulare mai târziu',
  'runFile.title': 'Fișier de rulare',
  'runFile.description':
    'Singura evidență a rulării. Se descarcă singur după fiecare pas (și după un pas oprit înainte de vreme); păstrați-l pe cel mai nou. Ca să continuați mai târziu sau după o problemă, încărcați-l aici, iar pagina reia de unde a rămas.',
  'runFile.run': 'Rulare',
  'runFile.file': 'Fișier',
  'runFile.lastSaved': 'Ultima salvare',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'după {step} — {at} ({bytes} B)',
  'runFile.nextStep': 'Pasul următor',
  'runFile.none':
    'Nu este activă nicio rulare. Pasul 02 pornește una, sau încărcați aici un fișier de rulare.',
  'runFile.toolbar': 'Acțiuni pentru fișierul de rulare',
  'runFile.load': 'Încărcare fișier de rulare…',
  'runFile.save': 'Salvare din nou a fișierului de rulare',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Reluare',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Niciun fișier de rulare ales.',
  'status.notRun': 'Încă nu a rulat.',
  'status.running': 'Rulează …',
  'status.runningRestarts': 'Rulează — camera repornește în timpul acestui pas …',
  'status.restarting': 'Camera repornește — durează aproximativ zece secunde …',
  'status.waitConnect':
    'Se așteaptă acțiunea dumneavoastră — apăsați „Conectare dispozitiv” și alegeți camera …',
  'status.waitPlugBack':
    'Se așteaptă acțiunea dumneavoastră — conectați din nou camera, apoi apăsați „Conectare dispozitiv” …',
  'status.waitReplug':
    'Se așteaptă acțiunea dumneavoastră — deconectați camera și conectați-o din nou …',
  'status.back': 'Camera a revenit — se continuă …',
  'status.swapped': 'Oprit — camera s-a schimbat. Verificați-o, apoi rulați din nou pasul.',
  'status.noRun': 'Nicio rulare.',
  'status.notCreated': 'Rularea nu a fost creată — vedeți jurnalul de mai sus.',
  'status.refused': 'Refuzat — lista de pași de mai sus spune ce lipsește.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} — gata. Fișierul de rulare din descărcări este la zi.',
  'status.doneReplug':
    '{phase} — gata, iar fișierul de rulare este salvat. Înainte de restaurare: deconectați camera, conectați-o din nou și apăsați „Conectare dispozitiv”.',
  'status.backupRefused': 'Refuzat — nu s-a scris nimic. Vedeți jurnalul de mai sus.',
  'status.failed': 'Eșuat — vedeți jurnalul de mai sus.',
  'status.cancelled': 'Anulat — fișierul de rulare spune în continuare unde s-a oprit rularea.',
  'status.readingFile': 'Se citește fișierul de rulare …',
  'status.doneEarlier': 'Făcut anterior — încărcat din fișierul de rulare.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Eșuat anterior: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Reluat la {step}. Lista de pași continuă de acolo.',
  'status.notResumed': 'Nereluat — vedeți jurnalul de mai sus.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'necesită {missing}',
  'gate.noRun': 'nu este activă nicio rulare — primul pas creează rularea',
  'gate.runDone': 'această rulare s-a încheiat — toți pașii s-au terminat',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'deja făcut — reluarea continuă la {step}',
  'gate.banksRead': 'sloturile pe care le citește copia de rezervă',
  'gate.choice': 'o alegere de sloturi — {why}',
  'gate.bankRefused': '{bank:acc} nu poate fi scris: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'ruta prin slotul de recuperare (acest build rulează doar din {r:acc}, nu din {bank:acc})',
  'gate.backupFirst': 'copia de rezervă a memoriei flash (se face prima în acest pas)',
  'gate.backup': 'copia de rezervă a memoriei flash',
  'gate.patchStep': 'pasul Patch',
  'gate.patchOf': 'patch-ul {bank:gen}',
  'gate.backupFile': 'fișierul cu ferestrele copiei de rezervă',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': 'captura {bank:gen}',
  'gate.derived': 'imaginea derivată a {bank:gen}',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'pasul Scriere (rulați-l sau reluați de la el mai întâi)',
  'gate.drainRefused': 'citirea completă refuză pe {build} — {why}',
  'gate.patchSummary': 'rezumatul patch-ului {bank:gen} (lungimea transferată)',
  'gate.restoreRefused':
    'restaurarea refuză pe {build} — nicio formă a firmware-ului original nu se stochează la loc ca octeții originali; rularea se încheie cu imaginea completă și cu patch-ul rămas aplicat',
  /* {file} is a file name in the run file. */
  'gate.plaintext':
    'imaginea necriptată din fabrică a {bank:gen} ({file}, din pasul de copiere de rezervă)',
  'gate.restoreFirst': 'restaurarea (se face prima în acest pas)',
  'gate.powerCycle':
    'confirmarea că ați oprit și repornit camera — opriți și reporniți alimentarea camerei (deconectați-o și reconectați-o sau folosiți butonul ei de alimentare), apoi folosiți butonul de rulare din nou',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'camera nu a revenit după {minutes} min de reîncercări: {error} — dacă Chrome nu a cerut nimic, reconectați camera și rulați din nou pasul; dacă jurnalul a spus să o reconectați, clicul pe „Conectare dispozitiv” este ceea ce aștepta',
} satisfies Translation<'preserve', 'ro'>;
