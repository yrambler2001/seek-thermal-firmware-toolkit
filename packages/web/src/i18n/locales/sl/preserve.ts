/**
 * Namespace `preserve`, slovenščina (sl), translated from the English source: the "Dump & decrypt 0.x/1.x" tab, a guided run that
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
  'how.title': 'Kaj pričakovati',
  'how.descriptionIdle': 'Povežite kamero, nato začnite s korakom 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Izvedba {runId}.',
  'how.descriptionRunVersion': 'Izvedba {runId} — vdelana programska oprema {version}.',
  'how.restarts':
    'Kamera se med vsakim korakom **znova zažene**. Po ponovnem zagonu je Chrome ne prepozna več (nima serijske številke USB), zato vas stran prosi, da pritisnete **Poveži napravo** in znova izberete kamero. To je običajen potek — korak se nato nadaljuje sam.',
  'how.noFile':
    'Ni datoteke z vdelano programsko opremo, ki bi jo morali izbrati: vse se prebere iz same kamere.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'Kamera hrani vdelano programsko opremo v treh **režah** ({a}, {b} in {r}). Korak 02 prebere vse tri in ugotovi, iz katere se bo kamera zagnala naslednjič; popravek deluje le, če je v tej reži. Izberete, katere reže popravi korak 03 — privzeto tisto, iz katere se kamera zažene naslednjič — korak 04 pa povrne vse.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'Po vsakem koraku brskalnik prenese **datoteko izvedbe**, poimenovano po začetku izvedbe, času shranjevanja in doseženem koraku (`{example}`), z eno mapo za vsak korak. Obdržite najnovejšo — z njo lahko nadaljujete pozneje.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**Koraka 03 in 04 pišeta v bliskovni pomnilnik kamere** in vsak vas prej prosi za potrditev. Medtem ko teče eden od njiju, naj bo kamera priključena (razen če vas stran prosi, da jo znova priklopite), računalnik pa buden, najbolje priključen na omrežno napajanje. Po prekinjenem zapisu lahko kamero popravi le strojni programator (SPI ali SWD/J-Link).',
  'how.phone':
    '**Na telefonu:** pred korakom 03 vklopite način za letalo ter izklopite Wi-Fi in mobilne podatke, da klic ali obvestilo med zapisom ne odvleče brskalnika — in naj zaslon ostane vklopljen. Ko je stran odprta, deluje tudi brez povezave.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**Zapis za to izvedbo ni zabeležen, zato so koraki za njim zaprti.** Kamera morda že poganja popravljeno sliko (prekinjen zapis) ali pa ne (zapis se ni nikoli začel) — datoteka izvedbe ne more dokazati, kaj velja. Ne zaganjajte branja celotnega pomnilnika ali obnovitve na popravljeni kameri, če zapis ni zabeležen; pot naprej je korak 03, katerega preverjanje pred zapisom prebere režo in je ne bo znova slepo zapisalo. Samo če je to preverjanje že zavrnilo zapis s sporočilom *already holds the patched bytes*, velja preskok — in ta ima svoje pogovorno okno.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Branje in priprava',
  'phase.readBuild.inSentence': 'branje in pripravo',
  'phase.readBuild.description':
    'Prebere vse, kar tovarniška kamera izda — 31 blokov po 64 KB — in to shrani kot vašo varnostno kopijo, vsako režo vdelane programske opreme prebere še drugič, ugotovi, iz katere reže se bo kamera zagnala naslednjič, in pripravi majhen popravek, ki ga zapiše naslednji korak. V kamero se ne zapiše nič. Običajno traja manj kot minuto. Če se mora kamera vmes znova zagnati, vas stran prosi, da pritisnete „Poveži napravo“ in jo znova izberete — to je pričakovano.',
  'phase.patchDump.label': 'Zapis in branje celotnega pomnilnika',
  'phase.patchDump.inSentence': 'zapis in branje celotnega pomnilnika',
  'phase.patchDump.description':
    'V reže vdelane programske opreme, izbrane v koraku 02 (privzeto v režo, iz katere se kamera zažene naslednjič), zapiše majhen začasen popravek, da kamera lahko izda ves svoj bliskovni pomnilnik. Nato se kamera znova zažene — ko vas stran prosi, pritisnite „Poveži napravo“ in jo znova izberite — in prebere se celoten 4 MB bliskovni pomnilnik. Korak 04 povrne izvirno vdelano programsko opremo.',
  'phase.restoreVerify.label': 'Obnovitev in preverjanje',
  'phase.restoreVerify.inSentence': 'obnovitev in preverjanje',
  'phase.restoreVerify.description':
    'Zapiše nazaj vašo izvirno vdelano programsko opremo, znova zažene kamero (ko vas stran prosi, pritisnite „Poveži napravo“ in jo znova izberite), nato še enkrat prebere vse in preveri, ali se bajt za bajtom ujema z varnostno kopijo.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Prebere 31 blokov po 64 KB, ki jih lahko prebere tovarniška kamera, nato vsako režo prebere še drugič (obe branji se morata ujemati bajt za bajtom), iz tega, kar kamera hrani, izlušči vdelano programsko opremo vsake reže (dešifrira jo, kjer je shranjena šifrirana) in jo preveri ter ugotovi, iz katere reže se kamera zažene naslednjič. To je edina kopija te kamere v tej izvedbi, narejena, preden se karkoli zapiše.',
  'step.patch.description':
    'Brez povezave, brez kamere. Pripravi popravek za vsako režo, ki jo izvedba lahko zapiše: z njim branje kamere doseže celoten 4 MB bliskovni pomnilnik, zapiše pa se v obliki, v kateri ga kamera hrani, tako da se spremenijo le bajti samega popravka.',
  'step.commit.description':
    'Zapis. Najprej znova prebere vse izbrane reže in ne zapiše ničesar, razen če je v vsaki še vedno to, kar je zabeležila varnostna kopija (zapis, ki je že uspel, se nikoli ne ponovi), nato zapiše vsako od njih, režo, ki jo kamera poskusi najprej, pa zadnjo. Kamera se tukaj ne zažene znova: to stori naslednji korak.',
  'step.drain.description':
    'Kamero znova zažene, da zažene popravljeno vdelano programsko opremo (približno deset sekund je tiho; stran počaka in jo znova najde), preveri, iz katere reže se je zagnala (reža brez popravka ustavi korak, preden se karkoli prebere), nato v enem branju prebere celoten 4 MB bliskovni pomnilnik in v shranjeno sliko vstavi izvirno vdelano programsko opremo vsake zapisane reže iz varnostne kopije. Nič se ne zapiše.',
  'step.restore.description':
    'Drugi zapis. Medtem ko še teče popravljena vdelana programska oprema, zapiše nazaj izvirno vdelano programsko opremo vsake zapisane reže, nato kamero znova zažene.',
  'step.verify.description':
    'Po svežem zagonu znova prebere 31 blokov, med njimi vse reže: 0 različnih bajtov dokazuje, da je bliskovni pomnilnik kamere bajt za bajtom enak varnostni kopiji. Samo branje.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Začni {phase}',
  'phase.retry': 'Znova poskusi {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Nadaljuj s korakom 04: obnovi reže',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Preskoči nezabeleženi zapis',
  'phase.skipWrite': 'Preskoči zapis — začni z branjem celotnega pomnilnika',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': 'Dejanja: {phase}',
  /* The badges beside the step's title. */
  'badge.writes': 'piše v kamero',
  'badge.running': 'Teče',
  'badge.done': 'Končano',
  'badge.plannedStop': 'Ustavljeno po načrtu — sledi obnovitev',
  'badge.failed': 'Ustavljeno — glejte dnevnik',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Naslednji',
  /* Why the start button is off. */
  'notReady.noRun': 'Na voljo po koraku 02 — ta začne izvedbo.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Na voljo po koraku {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Še ni pripravljeno — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Velja za popravljeno kamero, dokler zapis ni zabeležen — kamera je morda že popravljena. Glejte opombo pod „{section}“.',
  'phase.noDrain':
    'Branje celotnega pomnilnika se ni izvedlo — ta korak kamero povrne brez njega. Najprej zaženite korak 03, razen če vam branje celotnega pomnilnika ni pomembno.',
  'phase.keepPlugged':
    'Kamera naj bo priključena, računalnik pa buden, dokler se ta korak ne konča.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Napredek',
  'phase.showDetails': 'Pokaži podrobnosti v dnevniku',
  'phase.inDetail': 'Kaj ta korak naredi, podrobno',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Na vrsti ste',
  'yourTurn.reconnect.title': 'Na vrsti ste: pritisnite „Poveži napravo“ in izberite kamero.',
  'yourTurn.reconnect.body':
    'Kamera se je po načrtu znova zagnala. Chrome je sam ne more znova prepoznati (nima serijske številke USB), zato jo morate še enkrat izbrati. Korak se nadaljuje takoj, ko to storite.',
  'yourTurn.replug.title':
    'Na vrsti ste: odklopite kamero, jo znova priklopite in pritisnite „Poveži napravo“.',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'Popravek te izvedbe je bil narejen pred popravkom bralnika, zato kamera pred obnovitvijo potrebuje svež vklop. Datoteka izvedbe je že shranjena.',
  'yourTurn.replugBeforeRestore.title':
    'Pred korakom 04: odklopite kamero, jo znova priklopite in pritisnite „Poveži napravo“.',
  'yourTurn.powerCycle.title':
    'Na vrsti ste: odklopite kamero, jo znova priklopite, pritisnite „Poveži napravo“ — nato poskusite znova.',
  'yourTurn.powerCycle.body':
    'Kamera potrebuje svež vklop, preden jo je mogoče znova brati. Izvedba je tukaj še vedno naložena; nič ni izgubljeno.',
  'yourTurn.powerCycleAssert.title':
    'Na vrsti ste: odklopite kamero, jo znova priklopite, pritisnite „Poveži napravo“ — nato nadaljujte.',
  'yourTurn.powerCycleAssert.body':
    'Zadnji poskus varnostne kopije se je ustavil, kamera pa pred ponovnim zagonom potrebuje svež vklop. Kamera tega ne more sporočiti sama, zato gumb spodaj strani pove, da ste to storili.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Kamera je znova priklopljena — nadaljuj {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Katere reže popravi korak 03',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Beseda zagonske konfiguracije',
  'banks.lastStart': 'Zadnji zagon',
  'banks.nextStart': 'Naslednji zagon',
  'banks.caption': 'Tri reže vdelane programske opreme, kot jih je prebral korak 02',
  'banks.col.bank': 'Reža',
  'banks.col.address': 'Naslov',
  'banks.col.holds': 'Vsebina',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'naslednji zagon',
  'banks.choiceLabel': 'Reže za popravek',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'Reža, iz katere se kamera zažene naslednjič',
  'choice.all': 'Vse reže',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — ni na voljo',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen': 'Nobena reža še ni izbrana: {what}. Zgoraj izberite režo po imenu.',
  'banks.writes': 'Korak 03 zapiše: {what}.',
  'banks.fixed':
    'Zapis se je že izvedel, zato je izbira določena: korak 04 povrne natanko te reže.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: ni na voljo — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'nobena izvedba ni dejavna — korak 02 jo začne',
  'banks.refusedBusy': 'korak teče — reže izberite, ko se konča',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'Načrt — {build}, popravi {banks:acc}',
  'plan.summaryNone': 'Načrt — {build}, nobena reža še ni izbrana',
  'plan.yourCamera': 'vaša kamera',
  'plan.intro':
    'Izpisano iz lastnih bajtov kamere. Nič se ne zapiše, dokler se ne izvede korak 03, korak 04 pa povrne vsak bajt, ki ga zapiše.',
  /* The rows; their values are core's. */
  'plan.build': 'Izdaja',
  'plan.version': 'Različica vdelane programske opreme',
  'plan.written': 'Zapisano',
  'plan.route': 'Kam gre',
  'plan.restore': 'Obnovitev',
  'plan.wholeFlash': 'Branje celotnega pomnilnika',
  'plan.outro':
    'V obliki, ki jo hrani kamera, se spremenijo isti bajti in nobeni drugi, zato se vdelana programska oprema kamere spremeni natanko za to razliko in nič drugega.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'Popravek {bank:gen}',
  'bankPlan.titleChosen': '{bank} — zapiše jo ta izvedba',
  'bankPlan.titleNotChosen': '{bank} — ni izbrana',
  'bankPlan.source': 'Vir slike',
  'bankPlan.sourceValue': '{bank:nom}, kot je shranjena',
  'bankPlan.sourceTwoReads': '{bank:nom}, kot je shranjena, dve ujemajoči se branji (sha256 {sha})',
  'bankPlan.edit': 'Sprememba slike',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) na tovarniški sliki. Njena izravnava, {balance}, je v besedi za prilagoditev; popravek se izravna povrh nje, korak 04 pa sliko povrne s to spremembo.',
  'bankPlan.factorySha': 'Tovarniška nešifrirana slika, sha256',
  'bankPlan.patchedSha': 'Popravljena slika, sha256',
  /** Row label: how many bytes of the bank, as the flash chip stores it, the patch changes. */
  'bankPlan.diffCount': 'Spremenjeni bajti na bliskovnem čipu',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Dolžina za prenos',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    one: '{size} B v {count} kosu',
    two: '{size} B v {count} kosih',
    few: '{size} B v {count} kosih',
    other: '{size} B v {count} kosih',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Beseda za izravnavo',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (prej {balance}, izravnava spremembe)',
  'bankPlan.caption': 'Točni bajti, ki jih popravek spremeni v {bank:loc}',
  'bankPlan.col.what': 'Kaj spremeni',
  'bankPlan.col.offset': 'Odmik',
  'bankPlan.col.before': 'Prej',
  'bankPlan.col.after': 'Potem',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Preverjeno — popolno ujemanje.** Po svežem zagonu je bila kamera znova prebrana: {read}/31 blokov, {count} različen bajt. Njen bliskovni pomnilnik je natanko takšen, kot je bil pred prvim zapisom.',
    two: '**Preverjeno — popolno ujemanje.** Po svežem zagonu je bila kamera znova prebrana: {read}/31 blokov, {count} različna bajta. Njen bliskovni pomnilnik je natanko takšen, kot je bil pred prvim zapisom.',
    few: '**Preverjeno — popolno ujemanje.** Po svežem zagonu je bila kamera znova prebrana: {read}/31 blokov, {count} različni bajti. Njen bliskovni pomnilnik je natanko takšen, kot je bil pred prvim zapisom.',
    other:
      '**Preverjeno — popolno ujemanje.** Po svežem zagonu je bila kamera znova prebrana: {read}/31 blokov, {count} različnih bajtov. Njen bliskovni pomnilnik je natanko takšen, kot je bil pred prvim zapisom.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Preverjeno — popolno ujemanje.** Po svežem zagonu je bila kamera znova prebrana: {read}/31 blokov, {count} različen bajt (kratki bloki: {blocks}). Njen bliskovni pomnilnik je natanko takšen, kot je bil pred prvim zapisom.',
    two: '**Preverjeno — popolno ujemanje.** Po svežem zagonu je bila kamera znova prebrana: {read}/31 blokov, {count} različna bajta (kratki bloki: {blocks}). Njen bliskovni pomnilnik je natanko takšen, kot je bil pred prvim zapisom.',
    few: '**Preverjeno — popolno ujemanje.** Po svežem zagonu je bila kamera znova prebrana: {read}/31 blokov, {count} različni bajti (kratki bloki: {blocks}). Njen bliskovni pomnilnik je natanko takšen, kot je bil pred prvim zapisom.',
    other:
      '**Preverjeno — popolno ujemanje.** Po svežem zagonu je bila kamera znova prebrana: {read}/31 blokov, {count} različnih bajtov (kratki bloki: {blocks}). Njen bliskovni pomnilnik je natanko takšen, kot je bil pred prvim zapisom.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**Preverjanje je odkrilo razlike glede na varnostno kopijo.** {error}',
  unknownReason: 'neznan razlog',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — zapis v {banks:acc}?',
  'confirm.titleJump': '{phase} — preskok nezabeleženega zapisa?',
  'confirm.chosenBanks': 'izbrane reže',
  'confirm.jump':
    'ZAPIS ZA TO IZVEDBO NI ZABELEŽEN, vi pa zatrjujete, da je zapis uspel brez kontrolnih točk: korak se začne za zapisom, namesto da bi znova pisal. Lastna preverjanja korakov še vedno tečejo — branje različice, preverjanja rež — in napačna domneva stane zapravljeno branje celotnega pomnilnika, ne uničene kamere.',
  'confirm.jumpKeepPlugged':
    'Kamera naj bo priključena, računalnik pa buden, dokler se korak ne konča.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'S tem se v {banks:acc} zapiše majhen popravek. Korak 04 povrne izvirnike. Branje celotnega pomnilnika, ki sledi, samo bere.',
  'confirm.patchInOrder':
    'S tem se v {banks:acc} zapiše majhen popravek, v tem vrstnem redu — reža, ki jo kamera poskusi najprej, je zadnja. Korak 04 povrne izvirnike. Branje celotnega pomnilnika, ki sledi, samo bere.',
  /* Step 04. */
  'confirm.restore': 'S tem se vaša izvirna vdelana programska oprema zapiše nazaj v {banks:acc}.',
  'confirm.restoreInOrder':
    'S tem se vaša izvirna vdelana programska oprema zapiše nazaj v {banks:acc}, v tem vrstnem redu — reža, ki jo kamera poskusi najprej, je prva.',
  'confirm.keepPlugged':
    'Med zapisovanjem naj bo kamera priključena, računalnik pa buden — po prekinjenem zapisu lahko kamero popravi le strojni programator (SPI ali SWD/J-Link). Na telefonu vklopite način za letalo in pustite zaslon vklopljen. Kamera se nato znova zažene; ko vas stran prosi, pritisnite „Poveži napravo“ in jo znova izberite. To je pričakovano.',
  'confirm.yesJump': 'Da — preskoči zapis',
  'confirm.yesWrite': 'Da — zapiši v kamero',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'Dokaz',
  'summary.complete': 'Celotna slika (4 MB)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'ni bila ustvarjena',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'od varnostne kopije se razlikuje v {differing} od {count} bloka: {blocks}',
    two: 'od varnostne kopije se razlikuje v {differing} od {count} blokov: {blocks}',
    few: 'od varnostne kopije se razlikuje v {differing} od {count} blokov: {blocks}',
    other: 'od varnostne kopije se razlikuje v {differing} od {count} blokov: {blocks}',
  },
  'summary.matches': {
    one: 'ujema se z varnostno kopijo ({count} blok)',
    two: 'ujema se z varnostno kopijo (vsa {count} bloka)',
    few: 'ujema se z varnostno kopijo (vsi {count} bloki)',
    other: 'ujema se z varnostno kopijo (vseh {count} blokov)',
  },
  'summary.onlyInFull': 'Samo v branju celotnega pomnilnika',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} blok, ki ga običajno branje ne doseže: {blocks}',
    two: '{count} bloka, ki ju običajno branje ne doseže: {blocks}',
    few: '{count} bloki, ki jih običajno branje ne doseže: {blocks}',
    other: '{count} blokov, ki jih običajno branje ne doseže: {blocks}',
  },
  'summary.rawDump': 'Branje celotnega pomnilnika, kot je bilo prebrano',
  'summary.rawDumpBadge': 'enako, s popravkom še na mestu',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Slika vdelane programske opreme (dešifrirana, {bank})',
  'summary.verify': 'Preverjanje',
  'summary.toolbar': 'Dejanja z arhivom',
  'summary.download': 'Prenesi celoten arhiv (datoteko izvedbe)',

  /*
   * ---- what the run file holds (views/PreserveView, "What you get") ----
   * The file and folder names in the table stay as they are; {fill} is a byte (0xFF), {original} a file name.
   */
  'output.title': 'Kaj dobite',
  'output.intro':
    'Datoteka izvedbe je en sam prenos `{ext}`. Vsako shranjevanje vsebuje vse, kar je izvedba doslej ustvarila, z eno mapo za vsak korak:',
  'output.caption': 'Datoteke v datoteki izvedbe',
  'output.file': 'Datoteka',
  'output.what': 'Kaj je to',
  'output.runState':
    'zapis izvedbe: naložite zip na tem zavihku, da nadaljujete izvedbo ali si jo znova ogledate',
  'output.readme': 'kaj je v zipu in kje',
  'output.backup':
    'vaša varnostna kopija: 31 blokov, ki jih izda tovarniška kamera, prebranih, preden se karkoli zapiše, vsak na svojem naslovu v bliskovnem pomnilniku ({fill}, kjer bloka ni mogoče prebrati na ta način)',
  'output.capture':
    'vsaka reža vdelane programske opreme, ki jo izvedba lahko zapiše, kot jo hrani kamera (a, b ali r v imenu), prebrana dvakrat z enakima branjema',
  'output.plain': 'vdelana programska oprema iz vsake od teh rež, dešifrirana',
  'output.patched':
    'za vsako režo, ki jo izvedba popravi: njena vdelana programska oprema z začasnim popravkom za branje',
  'output.decrypted':
    'dešifrirana varnostna kopija: vdelana programska oprema vsake reže in poročilo o njej',
  'output.manifest': 'podrobnosti tega dešifriranja',
  'output.decryptReadme': 'kaj vsebuje to dešifriranje in kje so njegove meje',
  'output.pageBuild': 'katera različica te strani je opravila izvedbo',
  'output.dumpPatched':
    'celotni 4 MB, kot so bili prebrani, s popravkom še v režah, v katere je bil zapisan',
  'output.dumpOriginal':
    'celotna slika: celotni 4 MB s povrnjeno izvirno vdelano programsko opremo — izvirni bliskovni pomnilnik vaše kamere',
  'output.verify':
    '31 blokov, znova prebranih po obnovitvi, razporejenih kot v varnostni kopiji; morali bi se ujemati z njo',
  'output.grows':
    'Datoteka se pojavi, ko se izvede korak, ki jo ustvari, zato zgodnja datoteka izvedbe vsebuje le prvo mapo.',
  'output.keep':
    'Datoteka, ki jo obdržite, je `{original}`: celoten bliskovni pomnilnik vaše kamere, kakršen je bil. Preostanek kaže, kako je izvedba prišla do tja.',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Neobvezno — za poznejše nadaljevanje izvedbe',
  'runFile.title': 'Datoteka izvedbe',
  'runFile.description':
    'Edini zapis izvedbe. Prenese se samodejno po vsakem koraku (in po koraku, ki se je ustavil predčasno); obdržite najnovejšo. Če želite nadaljevati pozneje ali po težavi, jo naložite tukaj in stran nadaljuje, kjer je ostala.',
  'runFile.run': 'Izvedba',
  'runFile.file': 'Datoteka',
  'runFile.lastSaved': 'Nazadnje shranjeno',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'po koraku {step} — {at} ({bytes} B)',
  'runFile.nextStep': 'Naslednji korak',
  'runFile.none':
    'Nobena izvedba ni dejavna. Korak 02 jo začne, lahko pa tukaj naložite datoteko izvedbe.',
  'runFile.toolbar': 'Dejanja z datoteko izvedbe',
  'runFile.load': 'Naloži datoteko izvedbe…',
  'runFile.save': 'Znova shrani datoteko izvedbe',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Nadaljevanje',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Nobena datoteka izvedbe ni izbrana.',
  'status.notRun': 'Še ni izvedeno.',
  'status.running': 'Teče …',
  'status.runningRestarts': 'Teče — kamera se med tem korakom znova zažene …',
  'status.restarting': 'Kamera se znova zaganja — to traja približno deset sekund …',
  'status.waitConnect': 'Čakanje na vas — pritisnite „Poveži napravo“ in izberite kamero …',
  'status.waitPlugBack':
    'Čakanje na vas — znova priklopite kamero, nato pritisnite „Poveži napravo“ …',
  'status.waitReplug': 'Čakanje na vas — odklopite kamero in jo znova priklopite …',
  'status.back': 'Kamera je spet tu — nadaljevanje …',
  'status.swapped': 'Ustavljeno — kamera se je zamenjala. Preverite jo, nato znova zaženite korak.',
  'status.noRun': 'Ni izvedbe.',
  'status.notCreated': 'Ni ustvarjeno — glejte dnevnik zgoraj.',
  'status.refused': 'Zavrnjeno — seznam korakov zgoraj pove, kaj manjka.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} — končano. Datoteka izvedbe med prenosi je posodobljena.',
  'status.doneReplug':
    '{phase} — končano, datoteka izvedbe je shranjena. Pred obnovitvijo: odklopite kamero, jo znova priklopite in pritisnite „Poveži napravo“.',
  'status.backupRefused': 'Zavrnjeno — nič ni bilo zapisano. Glejte dnevnik zgoraj.',
  'status.failed': 'Ni uspelo — glejte dnevnik zgoraj.',
  'status.cancelled': 'Preklicano — datoteka izvedbe še vedno pove, kje se je izvedba ustavila.',
  'status.readingFile': 'Branje datoteke izvedbe …',
  'status.doneEarlier': 'Končano že prej — naloženo iz datoteke izvedbe.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Prej ni uspelo: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Nadaljevano pri {step}. Seznam korakov nadaljuje od tam.',
  'status.notResumed': 'Ni nadaljevano — glejte dnevnik zgoraj.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'potrebno je še: {missing}',
  'gate.noRun': 'nobena izvedba ni dejavna — prvi korak ustvari izvedbo',
  'gate.runDone': 'ta izvedba je končana — vsi koraki so opravljeni',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'že opravljeno — nadaljevanje začne pri {step}',
  'gate.banksRead': 'reže, ki jih prebere varnostna kopija',
  'gate.choice': 'izbira rež — {why}',
  'gate.bankRefused': '{bank:gen} ni mogoče zapisati: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'pot prek obnovitvene reže (ta izdaja teče le iz {r:gen}, ne iz {bank:gen})',
  'gate.backupFirst': 'varnostna kopija bliskovnega pomnilnika (v tem koraku se izvede prva)',
  'gate.backup': 'varnostna kopija bliskovnega pomnilnika',
  'gate.patchStep': 'korak s popravkom',
  'gate.patchOf': 'popravek {bank:gen}',
  'gate.backupFile': 'datoteka z okni varnostne kopije',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': 'zajem {bank:gen}',
  'gate.derived': 'izpeljana slika {bank:gen}',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'korak Zapis (najprej ga izvedite ali pri njem nadaljujte)',
  'gate.drainRefused': 'branje celotnega pomnilnika tukaj ni mogoče ({build}) — {why}',
  'gate.patchSummary': 'povzetek popravka {bank:gen} (dolžina za prenos)',
  'gate.restoreRefused':
    'obnovitev tukaj ni mogoča ({build}) — nobena oblika izvirne vdelane programske opreme se ne shrani nazaj kot izvirni bajti; izvedba se konča s celotno sliko in s popravkom na mestu',
  /* {file} is a file name in the run file. */
  'gate.plaintext': 'tovarniška nešifrirana slika {bank:gen} ({file}, iz koraka varnostne kopije)',
  'gate.restoreFirst': 'obnovitev (v tem koraku se izvede prva)',
  'gate.powerCycle':
    'potrditev izklopa in vklopa — kamero izklopite in vklopite (odklopite in znova priklopite ali uporabite njeno stikalo za vklop), nato uporabite gumb za ponovni zagon koraka',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'kamere po {minutes} min ponovnih poskusov ni bilo nazaj: {error} — če Chrome ni ničesar vprašal, kamero znova priklopite in ponovno zaženite korak; če je dnevnik rekel, da jo znova povežete, je čakal prav na klik „Poveži napravo“',
} satisfies Translation<'preserve', 'sl'>;
