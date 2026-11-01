/**
 * Namespace `preserve`, lietuvių (lt), translated from the English source: the "Dump & decrypt 0.x/1.x" tab, a guided run that
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
  'how.title': 'Ko tikėtis',
  'how.descriptionIdle': 'Prijunkite kamerą, tada pradėkite nuo 02 žingsnio.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Seansas {runId}.',
  'how.descriptionRunVersion': 'Seansas {runId} — mikroprograma {version}.',
  'how.restarts':
    'Kiekvieno žingsnio metu kamera **pasileidžia iš naujo**. Po to Chrome jos nebeatpažįsta (ji neturi USB serijos numerio), todėl puslapis paprašo spustelėti **Prijungti įrenginį** ir vėl pasirinkti kamerą. Taip ir turi būti — tai padarius, žingsnis tęsiasi savaime.',
  'how.noFile': 'Nereikia rinktis jokio mikroprogramos failo: viskas nuskaitoma iš pačios kameros.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'Kamera savo mikroprogramą laiko trijuose **lizduose** ({a}, {b} ir {r}). 02 žingsnis nuskaito visus tris ir nustato, iš kurio kamera pasileis kitą kartą; pataisa veikia tik tada, jei ji yra tame lizde. Jūs pasirenkate, kuriuos lizdus pataiso 03 žingsnis, — pagal numatymą tą, kurį paleis kitas paleidimas, — o 04 žingsnis kiekvieną iš jų grąžina.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'Po kiekvieno žingsnio naršyklė atsisiunčia **seanso failą**, pavadintą pagal seanso pradžią, išsaugojimo laiką ir pasiektą žingsnį (`{example}`), su atskiru aplanku kiekvienam žingsniui. Pasilikite naujausią — su juo galėsite tęsti vėliau.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**03 ir 04 žingsniai rašo į kameros flash atmintį**, ir prieš kiekvieną jūsų paprašoma patvirtinti. Kol vienas iš jų vyksta, laikykite kamerą prijungtą, o kompiuterį — neužmigusį (nebent puslapis paprašys kamerą prijungti iš naujo), geriausia prijungtą prie elektros tinklo. Nutrauktas įrašymas palieka kamerą, kurią sutaisyti galima tik aparatiniu programatoriumi (SPI arba SWD/J-Link).',
  'how.phone':
    '**Telefone:** prieš 03 žingsnį įjunkite lėktuvo režimą ir išjunkite Wi-Fi bei mobiliuosius duomenis, kad skambutis ar pranešimas neištrauktų naršyklės įrašymo viduryje, — ir neleiskite ekranui užgesti. Atvertas puslapis toliau veikia ir be ryšio.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**Šio seanso įrašymas neužfiksuotas, todėl tolesni žingsniai uždaryti.** Kamera jau gali vykdyti pataisytą atvaizdą (nutrauktas įrašymas), o gali ir ne (įrašymas taip ir neprasidėjo) — seanso failas negali įrodyti, kuris variantas teisingas. Nevykdykite visos flash atminties nuskaitymo ar atkūrimo pataisytai kamerai be užfiksuoto įrašymo; kelias pirmyn — 03 žingsnis, kurio patikra prieš įrašymą nuskaito lizdą ir atsisako aklai jį įrašyti dar kartą. Tik jei ta patikra jau atsisakė su *already holds the patched bytes*, galima peršokti — ir tai daroma per atskirą dialogo langą.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Nuskaitymas ir paruošimas',
  'phase.readBuild.inSentence': 'nuskaitymą ir paruošimą',
  'phase.readBuild.description':
    'Nuskaito viską, ką atiduoda gamyklinė kamera — 31 bloką po 64 KB — ir išsaugo kaip jūsų atsarginę kopiją, antrą kartą nuskaito kiekvieną mikroprogramos lizdą, nustato, iš kurio lizdo kamera pasileis kitą kartą, ir paruošia nedidelę pataisą, kurią įrašys kitas žingsnis. Į kamerą nieko nerašoma. Paprastai trunka mažiau nei minutę. Jei pakeliui kamerą reikės paleisti iš naujo, puslapis paprašys spustelėti „Prijungti įrenginį“ ir ją vėl pasirinkti — taip ir turi būti.',
  'phase.patchDump.label': 'Įrašymas ir visos flash atminties nuskaitymas',
  'phase.patchDump.inSentence': 'įrašymą ir visos flash atminties nuskaitymą',
  'phase.patchDump.description':
    'Įrašo nedidelę laikiną pataisą į 02 žingsnyje pasirinktus mikroprogramos lizdus (pagal numatymą — į lizdą, iš kurio kamera pasileis kitą kartą), kad būtų galima perskaityti visą jos flash atmintį. Tada kamera pasileidžia iš naujo — kai puslapis paprašys, spustelėkite „Prijungti įrenginį“ ir ją vėl pasirinkite, — ir nuskaitoma visa 4 MB flash atmintis. 04 žingsnis grąžina originalią mikroprogramą.',
  'phase.restoreVerify.label': 'Atkūrimas ir patikra',
  'phase.restoreVerify.inSentence': 'atkūrimą ir patikrą',
  'phase.restoreVerify.description':
    'Įrašo atgal jūsų originalią mikroprogramą, paleidžia kamerą iš naujo (paprašyti spustelėkite „Prijungti įrenginį“ ir ją vėl pasirinkite), tada dar kartą viską nuskaito ir patikrina, ar baitas į baitą sutampa su atsargine kopija.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Nuskaito 31 bloką po 64 KB, kuriuos gali perskaityti gamyklinė kamera, tada antrą kartą nuskaito kiekvieną lizdą (abu skaitymai turi sutapti baitas į baitą), išima kiekvieno lizdo mikroprogramą iš to, ką saugo kamera (iššifruodamas, jei ji saugoma užšifruota), ją patikrina ir nustato, kurį lizdą kamera paleis kitą kartą. Tai vienintelė seanso šios kameros kopija, padaryta prieš ką nors įrašant.',
  'step.patch.description':
    'Be ryšio, be kameros. Sukuria pataisą kiekvienam lizdui, kurį seansas gali įrašyti: ji leidžia kameros skaitymui pasiekti visą 4 MB flash atmintį ir įrašoma tokia forma, kokia ją saugo kamera, todėl pasikeičia tik pačios pataisos baitai.',
  'step.commit.description':
    'Įrašymas. Pirmiausia nuskaito kiekvieną pasirinktą lizdą ir nieko neįrašo, jei kuriame nors nebėra to, ką užrašė atsarginė kopija (jau pavykęs įrašymas niekada nekartojamas), tada įrašo kiekvieną iš jų, o lizdą, kurį kamera bando pirmiausia, — paskutinį. Čia kamera iš naujo nepaleidžiama: ją paleidžia kitas žingsnis.',
  'step.drain.description':
    'Paleidžia kamerą iš naujo, kad ji paleistų pataisytą mikroprogramą (apie dešimt sekundžių ji tyli; puslapis laukia ir ją vėl suranda), patikrina, iš kurio lizdo ji pasileido (lizdas be pataisos sustabdo žingsnį dar prieš ką nors nuskaitant), tada vienu skaitymu nuskaito visą 4 MB flash atmintį ir į išsaugotą atvaizdą įdeda kiekvieno įrašyto lizdo originalią mikroprogramą iš atsarginės kopijos. Niekas neįrašoma.',
  'step.restore.description':
    'Antrasis įrašymas. Kol dar veikia pataisyta mikroprograma, įrašo atgal kiekvieno įrašyto lizdo originalią mikroprogramą, tada paleidžia kamerą iš naujo.',
  'step.verify.description':
    'Po naujo paleidimo dar kartą nuskaito 31 bloką, tarp jų ir kiekvieną lizdą: 0 besiskiriančių baitų įrodo, kad kameros flash atmintis baitas į baitą sutampa su atsargine kopija. Tik skaitymas.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Pradėti {phase}',
  'phase.retry': 'Kartoti {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Pereiti prie 04 žingsnio: atkurti lizdus',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Peršokti neužfiksuotą įrašymą',
  'phase.skipWrite': 'Praleisti įrašymą — pradėti nuo visos flash atminties nuskaitymo',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': '{phase}: veiksmai',
  /* The badges beside the step's title. */
  'badge.writes': 'rašo į kamerą',
  'badge.running': 'Vykdoma',
  'badge.done': 'Atlikta',
  'badge.plannedStop': 'Sustabdyta, kaip planuota — toliau atkūrimas',
  'badge.failed': 'Sustabdyta — žr. žurnalą',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Toliau',
  /* Why the start button is off. */
  'notReady.noRun': 'Bus galima po 02 žingsnio — jis pradeda seansą.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Bus galima po {step} žingsnio ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Dar neparengta — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Susiję su pataisyta kamera, kol įrašymas neužfiksuotas — kamera jau gali būti pataisyta. Žr. pastabą skyriuje „{section}“.',
  'phase.noDrain':
    'Visos flash atminties nuskaitymas neatliktas — šis žingsnis grąžina kamerą be jo. Pirmiausia atlikite 03 žingsnį, nebent visos flash atminties nuskaitymas jums nesvarbus.',
  'phase.keepPlugged':
    'Kol šis žingsnis baigsis, laikykite kamerą prijungtą, o kompiuterį — neužmigusį.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Eiga',
  'phase.showDetails': 'Rodyti išsamią informaciją žurnale',
  'phase.inDetail': 'Ką šis žingsnis daro, išsamiai',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Jūsų eilė',
  'yourTurn.reconnect.title': 'Jūsų eilė: spustelėkite „Prijungti įrenginį“ ir pasirinkite kamerą.',
  'yourTurn.reconnect.body':
    'Kamera pasileido iš naujo, kaip planuota. Chrome negali pati jos vėl atpažinti (ji neturi USB serijos numerio), todėl reikia, kad ją dar kartą pasirinktumėte. Tai padarius, žingsnis iškart tęsiasi.',
  'yourTurn.replug.title':
    'Jūsų eilė: atjunkite kamerą, vėl ją prijunkite, tada spustelėkite „Prijungti įrenginį“.',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'Šio seanso pataisa sukurta prieš skaitytuvo pataisymą, todėl prieš atkūrimą kamerą reikia iš naujo įjungti. Seanso failas jau išsaugotas.',
  'yourTurn.replugBeforeRestore.title':
    'Prieš 04 žingsnį: atjunkite kamerą, vėl ją prijunkite, tada spustelėkite „Prijungti įrenginį“.',
  'yourTurn.powerCycle.title':
    'Jūsų eilė: atjunkite kamerą, vėl ją prijunkite, spustelėkite „Prijungti įrenginį“ — tada bandykite dar kartą.',
  'yourTurn.powerCycle.body':
    'Kameros skaitytuvą reikia iš naujo įjungti, kad jį vėl būtų galima skaityti. Seansas vis dar įkeltas čia; niekas neprarasta.',
  'yourTurn.powerCycleAssert.title':
    'Jūsų eilė: atjunkite kamerą, vėl ją prijunkite, spustelėkite „Prijungti įrenginį“ — tada tęskite.',
  'yourTurn.powerCycleAssert.body':
    'Paskutinis atsarginės kopijos bandymas sustojo, ir prieš jį kartojant kamerą reikia iš naujo įjungti. Kamera pati apie tai pranešti negali, todėl mygtukas žemiau praneša puslapiui, kad tai padarėte.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Prijungiau iš naujo — tęsti {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Kuriuos lizdus pataiso 03 žingsnis',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Paleidimo konfigūracijos žodis',
  'banks.lastStart': 'Paskutinis paleidimas',
  'banks.nextStart': 'Kitas paleidimas',
  'banks.caption': 'Trys mikroprogramos lizdai, kokius juos nuskaitė 02 žingsnis',
  'banks.col.bank': 'Lizdas',
  'banks.col.address': 'Adresas',
  'banks.col.holds': 'Kas jame yra',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'kitas paleidimas',
  'banks.choiceLabel': 'Taisomi lizdai',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'Lizdas, kurį paleis kitas paleidimas',
  'choice.all': 'Visi lizdai',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — nesiūloma',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen':
    'Lizdas dar nepasirinktas: {what}. Aukščiau pasirinkite lizdą pagal pavadinimą.',
  'banks.writes': '03 žingsnis įrašo: {what}.',
  'banks.fixed':
    'Įrašymas atliktas, todėl pasirinkimas nebekeičiamas: 04 žingsnis grąžina būtent šiuos lizdus.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: nesiūloma — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'nėra aktyvaus seanso — jį pradeda 02 žingsnis',
  'banks.refusedBusy': 'vykdomas žingsnis — lizdus pasirinkite, kai jis baigsis',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'Planas — {build}, taisoma: {banks}',
  'plan.summaryNone': 'Planas — {build}, lizdas dar nepasirinktas',
  'plan.yourCamera': 'jūsų kamera',
  'plan.intro':
    'Sudaryta pagal pačios kameros baitus. Niekas neįrašoma, kol nevykdomas 03 žingsnis, o 04 žingsnis grąžina kiekvieną jo įrašytą baitą.',
  /* The rows; their values are core's. */
  'plan.build': 'Leidimas',
  'plan.version': 'Mikroprogramos versija',
  'plan.written': 'Įrašoma',
  'plan.route': 'Kur įrašoma',
  'plan.restore': 'Atkūrimas',
  'plan.wholeFlash': 'Visos flash atminties nuskaitymas',
  'plan.outro':
    'Kameros saugoma forma keičiasi tie patys baitai ir jokie kiti, todėl kameros mikroprograma pasikeičia lygiai šiuo skirtumu ir niekuo daugiau.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': '{bank:gen} pataisa',
  'bankPlan.titleChosen': '{bank} — įrašomas šio seanso',
  'bankPlan.titleNotChosen': '{bank} — nepasirinktas',
  'bankPlan.source': 'Atvaizdo šaltinis',
  'bankPlan.sourceValue': '{bank}, toks, koks saugomas',
  'bankPlan.sourceTwoReads': '{bank}, toks, koks saugomas, du sutampantys skaitymai (sha256 {sha})',
  'bankPlan.edit': 'Atvaizdo pakeitimas',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) gamykliniame atvaizde. Jo balansas {balance} yra koregavimo žodyje; pataisa balansuojama ant jo, o 04 žingsnis grąžina atvaizdą su pakeitimu.',
  'bankPlan.factorySha': 'Gamyklinio atviro teksto sha256',
  'bankPlan.patchedSha': 'Pataisyto atvaizdo sha256',
  /** Row label: how many bytes of the bank, as the flash chip stores it, the patch changes. */
  'bankPlan.diffCount': 'Pakeista baitų flash luste',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Paruoštas ilgis',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    one: '{size} B per {count} dalį',
    few: '{size} B per {count} dalis',
    many: '{size} B per {count} dalies',
    other: '{size} B per {count} dalių',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Balansavimo žodis',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (buvo {balance}, pakeitimo balansas)',
  'bankPlan.caption': 'Tikslūs baitai, kuriuos pataisa pakeičia {bank:loc}',
  'bankPlan.col.what': 'Ką keičia',
  'bankPlan.col.offset': 'Poslinkis',
  'bankPlan.col.before': 'Prieš',
  'bankPlan.col.after': 'Po',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Patikrinta — visiškas atitikimas.** Po naujo paleidimo kamera nuskaityta dar kartą: blokai {read}/31, {count} besiskiriantis baitas. Jos flash atmintis lygiai tokia, kokia buvo prieš pirmąjį įrašymą.',
    few: '**Patikrinta — visiškas atitikimas.** Po naujo paleidimo kamera nuskaityta dar kartą: blokai {read}/31, {count} besiskiriantys baitai. Jos flash atmintis lygiai tokia, kokia buvo prieš pirmąjį įrašymą.',
    many: '**Patikrinta — visiškas atitikimas.** Po naujo paleidimo kamera nuskaityta dar kartą: blokai {read}/31, {count} besiskiriančio baito. Jos flash atmintis lygiai tokia, kokia buvo prieš pirmąjį įrašymą.',
    other:
      '**Patikrinta — visiškas atitikimas.** Po naujo paleidimo kamera nuskaityta dar kartą: blokai {read}/31, {count} besiskiriančių baitų. Jos flash atmintis lygiai tokia, kokia buvo prieš pirmąjį įrašymą.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Patikrinta — visiškas atitikimas.** Po naujo paleidimo kamera nuskaityta dar kartą: blokai {read}/31, {count} besiskiriantis baitas (trumpi blokai: {blocks}). Jos flash atmintis lygiai tokia, kokia buvo prieš pirmąjį įrašymą.',
    few: '**Patikrinta — visiškas atitikimas.** Po naujo paleidimo kamera nuskaityta dar kartą: blokai {read}/31, {count} besiskiriantys baitai (trumpi blokai: {blocks}). Jos flash atmintis lygiai tokia, kokia buvo prieš pirmąjį įrašymą.',
    many: '**Patikrinta — visiškas atitikimas.** Po naujo paleidimo kamera nuskaityta dar kartą: blokai {read}/31, {count} besiskiriančio baito (trumpi blokai: {blocks}). Jos flash atmintis lygiai tokia, kokia buvo prieš pirmąjį įrašymą.',
    other:
      '**Patikrinta — visiškas atitikimas.** Po naujo paleidimo kamera nuskaityta dar kartą: blokai {read}/31, {count} besiskiriančių baitų (trumpi blokai: {blocks}). Jos flash atmintis lygiai tokia, kokia buvo prieš pirmąjį įrašymą.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**Patikra rado skirtumų, palyginti su atsargine kopija.** {error}',
  unknownReason: 'nežinoma priežastis',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — įrašyti į {banks:acc}?',
  'confirm.titleJump': '{phase} — peršokti neužfiksuotą įrašymą?',
  'confirm.chosenBanks': 'pasirinktus lizdus',
  'confirm.jump':
    'ŠIO SEANSO ĮRAŠYMAS NEUŽFIKSUOTAS, o jūs tvirtinate, kad įrašymai pavyko be savo kontrolinių taškų: žingsnis pradedamas po įrašymo, užuot rašius dar kartą. Pačių žingsnių patikros vis tiek atliekamos — versijos skaitymas, lizdų patikros, — o klaidingas spėjimas kainuoja tik veltui atliktą visos flash atminties nuskaitymą, o ne sugadintą kamerą.',
  'confirm.jumpKeepPlugged':
    'Kol žingsnis baigsis, laikykite kamerą prijungtą, o kompiuterį — neužmigusį.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Bus įrašyta nedidelė pataisa į {banks:acc}. 04 žingsnis grąžins originalus. Po to vykdomas visos flash atminties nuskaitymas tik skaito.',
  'confirm.patchInOrder':
    'Bus įrašyta nedidelė pataisa į {banks:acc}, šia tvarka — lizdas, kurį kamera bando pirmiausia, įrašomas paskutinis. 04 žingsnis grąžins originalus. Po to vykdomas visos flash atminties nuskaitymas tik skaito.',
  /* Step 04. */
  'confirm.restore': 'Jūsų originali mikroprograma bus įrašyta atgal į {banks:acc}.',
  'confirm.restoreInOrder':
    'Jūsų originali mikroprograma bus įrašyta atgal į {banks:acc}, šia tvarka — lizdas, kurį kamera bando pirmiausia, įrašomas pirmas.',
  'confirm.keepPlugged':
    'Kol vyksta įrašymas, laikykite kamerą prijungtą, o kompiuterį — neužmigusį: nutrauktas įrašymas palieka kamerą, kurią sutaisyti galima tik aparatiniu programatoriumi (SPI arba SWD/J-Link). Telefone įjunkite lėktuvo režimą ir neleiskite ekranui užgesti. Tada kamera pasileidžia iš naujo; kai puslapis paprašys, spustelėkite „Prijungti įrenginį“ ir vėl ją pasirinkite. Taip ir turi būti.',
  'confirm.yesJump': 'Taip — peršokti įrašymą',
  'confirm.yesWrite': 'Taip — rašyti į kamerą',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'Įrodymas',
  'summary.complete': 'Pilnas atvaizdas (4 MB)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'nesukurtas',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'nuo atsarginės kopijos skiriasi {differing} iš {count} bloko: {blocks}',
    few: 'nuo atsarginės kopijos skiriasi {differing} iš {count} blokų: {blocks}',
    many: 'nuo atsarginės kopijos skiriasi {differing} iš {count} bloko: {blocks}',
    other: 'nuo atsarginės kopijos skiriasi {differing} iš {count} blokų: {blocks}',
  },
  'summary.matches': {
    one: 'sutampa su atsargine kopija ({count} blokas)',
    few: 'sutampa su atsargine kopija (visi {count} blokai)',
    many: 'sutampa su atsargine kopija (visi {count} bloko)',
    other: 'sutampa su atsargine kopija (visi {count} blokų)',
  },
  'summary.onlyInFull': 'Tik visos flash atminties nuskaityme',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} blokas, kurio nepasiekia įprastas skaitymas: {blocks}',
    few: '{count} blokai, kurių nepasiekia įprastas skaitymas: {blocks}',
    many: '{count} bloko, kurio nepasiekia įprastas skaitymas: {blocks}',
    other: '{count} blokų, kurių nepasiekia įprastas skaitymas: {blocks}',
  },
  'summary.rawDump': 'Visos flash atminties nuskaitymas, toks, koks perskaitytas',
  'summary.rawDumpBadge': 'tas pats, su vis dar esančia pataisa',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Mikroprogramos atvaizdas (iššifruotas, {bank})',
  'summary.verify': 'Patikra',
  'summary.toolbar': 'Archyvo veiksmai',
  'summary.download': 'Atsisiųsti visą archyvą (seanso failą)',

  /*
   * ---- what the run file holds (views/PreserveView, "What you get") ----
   * The file and folder names in the table stay as they are; {fill} is a byte (0xFF), {original} a file name.
   */
  'output.title': 'Ką gausite',
  'output.intro':
    'Seanso failas yra vienas atsisiunčiamas `{ext}` failas. Kiekvienas išsaugojimas apima viską, ką seansas iki šiol sukūrė, po vieną aplanką kiekvienam žingsniui:',
  'output.caption': 'Seanso failo turinys',
  'output.file': 'Failas',
  'output.what': 'Kas tai yra',
  'output.runState':
    'seanso įrašas: įkelkite ZIP failą šiame skirtuke, kad tęstumėte seansą arba jį vėl peržiūrėtumėte',
  'output.readme': 'kas yra ZIP faile ir kur',
  'output.backup':
    'jūsų atsarginė kopija: 31 blokas, kurį atiduoda gamyklinė kamera, nuskaitytas prieš ką nors įrašant, kiekvienas savo flash atminties adresu ({fill} ten, kur bloko šiuo būdu perskaityti negalima)',
  'output.capture':
    'kiekvienas mikroprogramos lizdas, kurį seansas gali įrašyti, toks, kokį saugo kamera (pavadinime a, b arba r), nuskaitytas du kartus, abu skaitymai vienodi',
  'output.plain': 'kiekvieno iš tų lizdų mikroprograma, iššifruota',
  'output.patched':
    'kiekvienam seanso taisomam lizdui: jo mikroprograma su laikina skaitymo pataisa',
  'output.decrypted': 'iššifruota atsarginė kopija: kiekvieno lizdo mikroprograma ir jos ataskaita',
  'output.manifest': 'to iššifravimo duomenys',
  'output.decryptReadme': 'kas yra tame iššifravime ir kokie jo apribojimai',
  'output.pageBuild': 'kuris šio puslapio leidimas vykdė seansą',
  'output.dumpPatched':
    'visi 4 MB taip, kaip perskaityti, su pataisa lizduose, į kuriuos ji įrašyta',
  'output.dumpOriginal':
    'pilnas atvaizdas: visi 4 MB su grąžinta originalia mikroprograma — originali jūsų kameros flash atmintis',
  'output.verify':
    'po atkūrimo dar kartą nuskaityti 31 blokas, išdėstyti kaip atsarginė kopija; jie turėtų su ja sutapti',
  'output.grows':
    'Failas atsiranda tada, kai atliekamas jį kuriantis žingsnis, todėl ankstyvame seanso faile yra tik pirmasis aplankas.',
  'output.keep':
    'Pasilikti reikia failą `{original}`: visą jūsų kameros flash atmintį tokią, kokia ji buvo. Kiti failai rodo, kaip seansas iki to priėjo.',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Pasirinktinai — norint tęsti seansą vėliau',
  'runFile.title': 'Seanso failas',
  'runFile.description':
    'Vienintelis seanso įrašas. Jis atsisiunčiamas savaime po kiekvieno žingsnio (ir po anksčiau laiko sustojusio žingsnio); pasilikite naujausią. Norėdami tęsti vėliau arba po problemos, įkelkite jį čia, ir puslapis tęs nuo ten, kur sustojo.',
  'runFile.run': 'Seansas',
  'runFile.file': 'Failas',
  'runFile.lastSaved': 'Paskutinį kartą išsaugota',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'po {step} — {at} ({bytes} B)',
  'runFile.nextStep': 'Kitas žingsnis',
  'runFile.none': 'Aktyvaus seanso nėra. Jį pradeda 02 žingsnis, arba įkelkite seanso failą čia.',
  'runFile.toolbar': 'Seanso failo veiksmai',
  'runFile.load': 'Įkelti seanso failą…',
  'runFile.save': 'Vėl išsaugoti seanso failą',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Tęsimas',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Seanso failas nepasirinktas.',
  'status.notRun': 'Dar nevykdyta.',
  'status.running': 'Vykdoma…',
  'status.runningRestarts': 'Vykdoma — šio žingsnio metu kamera pasileidžia iš naujo…',
  'status.restarting': 'Kamera pasileidžia iš naujo — tai užtrunka apie dešimt sekundžių…',
  'status.waitConnect': 'Laukiama jūsų — spustelėkite „Prijungti įrenginį“ ir pasirinkite kamerą…',
  'status.waitPlugBack':
    'Laukiama jūsų — vėl prijunkite kamerą, tada spustelėkite „Prijungti įrenginį“…',
  'status.waitReplug': 'Laukiama jūsų — atjunkite kamerą ir vėl ją prijunkite…',
  'status.back': 'Kamera grįžo — tęsiama…',
  'status.swapped':
    'Sustabdyta — kamera pasikeitė. Patikrinkite ją, tada paleiskite etapą dar kartą.',
  'status.noRun': 'Seanso nėra.',
  'status.notCreated': 'Nesukurta — žr. žurnalą aukščiau.',
  'status.refused': 'Atmesta — aukščiau esančiame etapų sąraše nurodyta, ko trūksta.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} — atlikta. Atsisiuntimuose esantis seanso failas atnaujintas.',
  'status.doneReplug':
    '{phase} — atlikta, seanso failas išsaugotas. Prieš atkūrimą atjunkite kamerą, vėl ją prijunkite ir spustelėkite „Prijungti įrenginį“.',
  'status.backupRefused': 'Atmesta — nieko neįrašyta. Žr. žurnalą aukščiau.',
  'status.failed': 'Nepavyko — žr. žurnalą aukščiau.',
  'status.cancelled': 'Atšaukta — seanso faile vis dar nurodyta, kur seansas sustojo.',
  'status.readingFile': 'Skaitomas seanso failas…',
  'status.doneEarlier': 'Atlikta anksčiau — įkelta iš seanso failo.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Anksčiau nepavyko: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Tęsiama nuo {step}. Etapų sąrašas tęsia nuo ten.',
  'status.notResumed': 'Netęsiama — žr. žurnalą aukščiau.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'reikia: {missing}',
  'gate.noRun': 'nėra aktyvaus seanso — seansą sukuria pirmasis etapas',
  'gate.runDone': 'šis seansas baigtas — atlikti visi etapai',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'jau atlikta — tęsiama nuo {step}',
  'gate.banksRead': 'lizdai, kuriuos nuskaito atsarginė kopija',
  'gate.choice': 'lizdų pasirinkimas — {why}',
  'gate.bankRefused': '{bank}: įrašyti negalima — {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'atkūrimo lizdo kelias (šis leidimas veikia tik iš {r:gen}, ne iš {bank:gen})',
  'gate.backupFirst': 'flash atminties atsarginė kopija (šiame etape ji atliekama pirmiausia)',
  'gate.backup': 'flash atminties atsarginė kopija',
  'gate.patchStep': 'žingsnis „Pataisa“',
  'gate.patchOf': '{bank:gen} pataisa',
  'gate.backupFile': 'atsarginės kopijos langų failas',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': '{bank:gen} įrašas',
  'gate.derived': '{bank:gen} išvestas atvaizdas',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'žingsnis „Įrašymas“ (pirmiausia jį atlikite arba tęskite nuo jo)',
  'gate.drainRefused': 'visos flash atminties nuskaitymas šiam leidimui atsisako ({build}) — {why}',
  'gate.patchSummary': '{bank:gen} pataisos santrauka (paruoštas ilgis)',
  'gate.restoreRefused':
    'atkūrimas šiam leidimui atsisako ({build}) — jokia originalios mikroprogramos forma neišsaugoma kaip originalūs baitai; seansas baigiasi su pilnu atvaizdu ir pataisa vietoje',
  /* {file} is a file name in the run file. */
  'gate.plaintext':
    '{bank:gen} gamyklinis atviras tekstas ({file}, iš atsarginės kopijos žingsnio)',
  'gate.restoreFirst': 'atkūrimas (šiame etape jis atliekamas pirmiausia)',
  'gate.powerCycle':
    'maitinimo išjungimo ir įjungimo patvirtinimas — išjunkite ir vėl įjunkite kamerą (atjunkite ir vėl prijunkite arba naudokite jos maitinimo jungiklį), tada naudokite pakartojimo valdiklį',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'kamera negrįžo po {minutes} min. bandymų: {error} — jei Chrome nieko neklausė, iš naujo prijunkite kamerą ir vėl paleiskite etapą; jei žurnale buvo nurodyta ją prijungti iš naujo, būtent „Prijungti įrenginį“ paspaudimo ir buvo laukiama',
} satisfies Translation<'preserve', 'lt'>;
