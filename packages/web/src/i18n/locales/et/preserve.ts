/**
 * Namespace `preserve`, eesti (et), translated from the English source: the "Dump & decrypt 0.x/1.x" tab, a guided run that
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
  'how.title': 'Mida oodata',
  'how.descriptionIdle': 'Ühendage kaamera, seejärel alustage sammust 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Seanss {runId}.',
  'how.descriptionRunVersion': 'Seanss {runId} — püsivara {version}.',
  'how.restarts':
    'Kaamera **taaskäivitub** iga sammu ajal. Pärast taaskäivitust ei tunne Chrome seda enam ära (sellel pole USB-seerianumbrit), nii et leht palub teil vajutada **Ühenda seade** ja kaamera uuesti valida. See on tavaline käik — samm jätkub pärast seda iseenesest.',
  'how.noFile': 'Püsivarafaili pole vaja valida: kõik loetakse kaamerast endast.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'Kaamera hoiab oma püsivara kolmes **pesas** ({a}, {b} ja {r}). Samm 02 loeb kõik kolm ja selgitab välja, millisest neist kaamera järgmisel korral käivitub; paik töötab ainult siis, kui see on selles pesas. Teie valite pesad, mida samm 03 paikab — vaikimisi selle, kuhu järgmine käivitus siseneb —, ja samm 04 paneb need kõik tagasi.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'Pärast iga sammu laadib brauser alla **seansifaili**, mille nimes on seansi algus, salvestamise aeg ja samm, milleni jõuti (`{example}`), ning milles on iga sammu jaoks oma kaust. Hoidke alles uusim — sellega saate hiljem jätkata.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**Sammud 03 ja 04 kirjutavad kaamera välkmällu** ja kumbki palub enne kinnitust. Kui üks neist töötab, hoidke kaamera ühendatud (kui leht ei palu seda uuesti ühendada) ja arvuti ärkvel, soovitatavalt vooluvõrgus. Katkenud kirjutamise järel saab kaamerat parandada ainult riistvaraprogrammaatoriga (SPI või SWD/J-Link).',
  'how.phone':
    '**Telefonis:** lülitage enne sammu 03 sisse lennukirežiim ning välja Wi-Fi ja mobiilne andmeside, et kõne või teavitus ei saaks brauserit kirjutamise ajal eemale tõmmata — ja hoidke ekraan sees. Kui leht on avatud, töötab see ka võrguühenduseta.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**Kirjutamist pole selle seansi kohta salvestatud, nii et sellele järgnevad sammud on suletud.** Kaamera võib juba käitada paigatud kujutist (katkenud kirjutamine) või mitte (kirjutamine ei alanudki) — seansifail ei suuda tõestada, kumb. Ärge käivitage kogu välkmälu lugemist ega taastamist paigatud kaameral, kui kirjutamist pole salvestatud; edasi saab sammuga 03, mille kontroll enne kirjutamist loeb pesa ja keeldub seda pimesi uuesti kirjutamast. Ainult siis, kui see kontroll on juba keeldunud teatega *already holds the patched bytes*, kehtib edasihüpe — ja see käib läbi oma dialoogi.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Lugemine ja ettevalmistus',
  'phase.readBuild.inSentence': 'lugemist ja ettevalmistust',
  'phase.readBuild.description':
    'Loeb kõik, mida tehaseseisus kaamera välja annab — 31 plokki, igaüks 64 KB — ja hoiab selle teie varukoopiana, loeb iga püsivarapesa teist korda, selgitab välja, millisest pesast kaamera järgmisel korral käivitub, ja valmistab ette väikese paiga, mille järgmine samm kirjutab. Kaamerasse ei kirjutata midagi. Tavaliselt alla minuti. Kui kaamera vahepeal taaskäivitust vajab, palub leht teil vajutada „Ühenda seade“ ja kaamera uuesti valida — see on oodatud.',
  'phase.patchDump.label': 'Kirjutamine ja kogu välkmälu lugemine',
  'phase.patchDump.inSentence': 'kirjutamist ja kogu välkmälu lugemist',
  'phase.patchDump.description':
    'Kirjutab väikese ajutise paiga sammus 02 valitud püsivarapesadesse (vaikimisi pesasse, millest kaamera järgmisel korral käivitub), et kaamera saaks kogu oma välkmälu välja lugeda. Seejärel kaamera taaskäivitub — vajutage „Ühenda seade“ ja valige kaamera uuesti, kui leht palub — ning loetakse kogu 4 MB välkmälu. Samm 04 paneb algse püsivara tagasi.',
  'phase.restoreVerify.label': 'Taastamine ja kontroll',
  'phase.restoreVerify.inSentence': 'taastamist ja kontrolli',
  'phase.restoreVerify.description':
    'Kirjutab teie algse püsivara tagasi, taaskäivitab kaamera (vajutage „Ühenda seade“ ja valige kaamera uuesti, kui palutakse), seejärel loeb kõik veel kord, et kontrollida, kas see vastab varukoopiale bait-baidilt.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Loeb 31 plokki (igaüks 64 KB), mida tehaseseisus kaamera lubab lugeda, seejärel loeb iga pesa teist korda (kaks lugemist peavad bait-baidilt ühtima), võtab iga pesa püsivara välja sellest, mida kaamera salvestab (dekrüptib, kui see on salvestatud krüptituna), ja kontrollib seda ning selgitab välja, millisest pesast kaamera järgmisena käivitub. See on seansi ainus koopia sellest kaamerast, tehtud enne, kui midagi kirjutatakse.',
  'step.patch.description':
    'Ilma kaamerata. Koostab paiga igale pesale, mida seanss saab kirjutada: paik laseb kaamera lugemisel ulatuda kogu 4 MB välkmäluni ja see kirjutatakse kujul, milles kaamera selle salvestab, nii et muutuvad ainult paiga enda baidid.',
  'step.commit.description':
    'Kirjutamine. Loeb esmalt iga valitud pesa tagasi ega kirjuta midagi, kui igaüks neist ei sisalda endiselt seda, mille varundamine salvestas (juba kohale jõudnud kirjutamist ei korrata kunagi), seejärel kirjutab igaühe, pesa, mida kaamera esimesena proovib, viimasena. Kaamerat siin ei taaskäivitata: järgmine samm taaskäivitab selle.',
  'step.drain.description':
    'Taaskäivitab kaamera, et see käivitaks paigatud püsivara (see on umbes kümme sekundit vait; leht ootab ja leiab selle uuesti), kontrollib, millisest pesast see käivitus (pesa ilma paigata peatab sammu enne, kui midagi loetakse), seejärel loeb kogu 4 MB välkmälu ühe lugemisega ja paneb salvestatud kujutisse iga kirjutatud pesa algse püsivara varukoopiast. Midagi ei kirjutata.',
  'step.restore.description':
    'Teine kirjutamine. Kirjutab iga kirjutatud pesa algse püsivara tagasi, kuni paigatud püsivara veel töötab, seejärel taaskäivitab kaamera.',
  'step.verify.description':
    'Pärast uut käivitust loeb uuesti 31 plokki, nende hulgas iga pesa: 0 erinevat baiti tõestab, et kaamera välkmälu on varukoopiaga bait-baidilt identne. Ainult lugemine.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Alusta {phase}',
  'phase.retry': 'Proovi {phase} uuesti',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Mine edasi sammu 04 juurde: taasta pesad',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Mine salvestamata kirjutamisest mööda',
  'phase.skipWrite': 'Jäta kirjutamine vahele — alusta kogu välkmälu lugemisest',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': '{phase}: toimingud',
  /* The badges beside the step's title. */
  'badge.writes': 'kirjutab kaamerasse',
  'badge.running': 'Töötab',
  'badge.done': 'Valmis',
  'badge.plannedStop': 'Peatati plaanipäraselt — järgmisena taastamine',
  'badge.failed': 'Peatus — vaadake logi',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Järgmisena',
  /* Why the start button is off. */
  'notReady.noRun': 'Saadaval pärast sammu 02 — see alustab seanssi.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Saadaval pärast sammu {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Pole veel valmis — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Puudutab paigatud kaamerat, kuni kirjutamist pole salvestatud — kaamera võib olla juba paigatud. Vaadake märkust jaotises „{section}“.',
  'phase.noDrain':
    'Kogu välkmälu lugemine pole toimunud — see samm paneb kaamera tagasi ilma selleta. Käivitage esmalt samm 03, kui kogu välkmälu lugemine pole teile ükskõik.',
  'phase.keepPlugged': 'Hoidke kaamera ühendatud ja arvuti ärkvel, kuni see samm lõpeb.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Edenemine',
  'phase.showDetails': 'Näita üksikasju logis',
  'phase.inDetail': 'Mida see samm täpsemalt teeb',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Teie kord',
  'yourTurn.reconnect.title': 'Teie kord: vajutage „Ühenda seade“ ja valige kaamera.',
  'yourTurn.reconnect.body':
    'Kaamera taaskäivitus plaanipäraselt. Chrome ei suuda seda iseenesest uuesti ära tunda (sellel pole USB-seerianumbrit), nii et peate selle veel kord valima. Samm jätkub kohe, kui seda teete.',
  'yourTurn.replug.title':
    'Teie kord: eemaldage kaamera, ühendage see uuesti, seejärel vajutage „Ühenda seade“.',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'Selle seansi paik tehti enne lugeja parandust, nii et kaamera vajab enne taastamist uut sisselülitamist. Seansifail on juba salvestatud.',
  'yourTurn.replugBeforeRestore.title':
    'Enne sammu 04: eemaldage kaamera, ühendage see uuesti, seejärel vajutage „Ühenda seade“.',
  'yourTurn.powerCycle.title':
    'Teie kord: eemaldage kaamera, ühendage see uuesti, vajutage „Ühenda seade“ — seejärel proovige uuesti.',
  'yourTurn.powerCycle.body':
    'Kaamera lugeja vajab uut sisselülitamist, enne kui seda saab uuesti lugeda. Seanss on siin endiselt laaditud; midagi pole kadunud.',
  'yourTurn.powerCycleAssert.title':
    'Teie kord: eemaldage kaamera, ühendage see uuesti, vajutage „Ühenda seade“ — seejärel jätkake.',
  'yourTurn.powerCycleAssert.body':
    'Viimane varundamiskatse peatus ja kaamera vajab enne uut katset uut sisselülitamist. Kaamera ei saa sellest ise teada anda, nii et allolev nupp ütleb lehele, et tegite seda.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Kaamera on uuesti ühendatud — jätka {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Milliseid pesasid samm 03 paikab',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Käivituskonfiguratsiooni sõna',
  'banks.lastStart': 'Viimane käivitus',
  'banks.nextStart': 'Järgmine käivitus',
  'banks.caption': 'Kolm püsivarapesa, nagu samm 02 need luges',
  'banks.col.bank': 'Pesa',
  'banks.col.address': 'Aadress',
  'banks.col.holds': 'Mis selles on',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'järgmine käivitus',
  'banks.choiceLabel': 'Paigatavad pesad',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'Pesa, kuhu järgmine käivitus siseneb',
  'choice.all': 'Kõik pesad',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — ei pakuta',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen': 'Ühtegi pesa pole veel valitud: {what}. Valige ülal pesa nime järgi.',
  'banks.writes': 'Samm 03 kirjutab: {what}.',
  'banks.fixed':
    'Kirjutamine on toimunud, nii et valik on lukus: samm 04 paneb tagasi täpselt need pesad.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: ei pakuta — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'ükski seanss pole aktiivne — samm 02 alustab seanssi',
  'banks.refusedBusy': 'samm on käimas — valige pesad, kui see on lõppenud',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'Plaan — {build}, paigatakse {banks}',
  'plan.summaryNone': 'Plaan — {build}, ühtegi pesa pole veel valitud',
  'plan.yourCamera': 'teie kaamera',
  'plan.intro':
    'Koostatud kaamera enda baitide põhjal. Midagi ei kirjutata enne, kui samm 03 töötab, ja samm 04 paneb iga kirjutatud baidi tagasi.',
  /* The rows; their values are core's. */
  'plan.build': 'Järk',
  'plan.version': 'Püsivara versioon',
  'plan.written': 'Kirjutatakse',
  'plan.route': 'Kuhu see läheb',
  'plan.restore': 'Taastamine',
  'plan.wholeFlash': 'Kogu välkmälu lugemine',
  'plan.outro':
    'Kujul, milles kaamera salvestab, muutuvad needsamad baidid ja mitte ükski muu, nii et kaamera püsivara muutub täpselt selle erinevuse võrra ja mitte millegi muu võrra.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'Paik: {bank}',
  'bankPlan.titleChosen': '{bank} — see seanss kirjutab selle',
  'bankPlan.titleNotChosen': '{bank} — pole valitud',
  'bankPlan.source': 'Kujutise allikas',
  'bankPlan.sourceValue': '{bank} salvestatud kujul',
  'bankPlan.sourceTwoReads': '{bank} salvestatud kujul, kaks ühtivat lugemist (sha256 {sha})',
  'bankPlan.edit': 'Kujutise muudatus',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) tehase kujutisel. Selle tasakaal {balance} on kohandussõnas; paik tasakaalustab selle peal ja samm 04 paneb kujutise tagasi koos muudatusega.',
  'bankPlan.factorySha': 'Tehase avateksti sha256',
  'bankPlan.patchedSha': 'Paigatud sha256',
  /** Row label: how many bytes of the bank, as the flash chip stores it, the patch changes. */
  'bankPlan.diffCount': 'Välkmälukiibil muudetud baidid',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Ettevalmistatud pikkus',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': { one: '{size} B, osi: {count}', other: '{size} B, osi: {count}' },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Tasakaalustussõna',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (oli {balance}, muudatuse tasakaal)',
  'bankPlan.caption': 'Täpsed baidid, mida paik {bank:ine} muudab',
  'bankPlan.col.what': 'Mida muudab',
  'bankPlan.col.offset': 'Nihe',
  'bankPlan.col.before': 'Enne',
  'bankPlan.col.after': 'Pärast',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Kontrollitud — täielik vaste.** Pärast uut käivitust loeti kaamerat uuesti: plokke {read}/31, erinevaid baite {count}. Selle välkmälu on täpselt selline, nagu see oli enne esimest kirjutamist.',
    other:
      '**Kontrollitud — täielik vaste.** Pärast uut käivitust loeti kaamerat uuesti: plokke {read}/31, erinevaid baite {count}. Selle välkmälu on täpselt selline, nagu see oli enne esimest kirjutamist.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Kontrollitud — täielik vaste.** Pärast uut käivitust loeti kaamerat uuesti: plokke {read}/31, erinevaid baite {count} (lühikesed plokid: {blocks}). Selle välkmälu on täpselt selline, nagu see oli enne esimest kirjutamist.',
    other:
      '**Kontrollitud — täielik vaste.** Pärast uut käivitust loeti kaamerat uuesti: plokke {read}/31, erinevaid baite {count} (lühikesed plokid: {blocks}). Selle välkmälu on täpselt selline, nagu see oli enne esimest kirjutamist.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**Kontroll leidis erinevusi võrreldes varukoopiaga.** {error}',
  unknownReason: 'teadmata põhjus',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — kas kirjutada {banks:ill}?',
  'confirm.titleJump': '{phase} — kas minna salvestamata kirjutamisest mööda?',
  'confirm.chosenBanks': 'valitud pesadesse',
  'confirm.jump':
    'KIRJUTAMIST POLE selle seansi kohta SALVESTATUD ja te kinnitate, et kirjutamised jõudsid kohale ilma kontrollpunktideta: samm algab kirjutamisest edasi, selle asemel et uuesti kirjutada. Sammude enda kontrollid töötavad ikkagi — versiooni lugemine, pesade kontrollid — ja vale oletus maksab raisatud kogu välkmälu lugemise, mitte rikutud kaamera.',
  'confirm.jumpKeepPlugged': 'Hoidke kaamera ühendatud ja arvuti ärkvel, kuni samm lõpeb.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'See kirjutab väikese paiga {banks:ill}. Samm 04 paneb originaalid tagasi. Järgnev kogu välkmälu lugemine ainult loeb.',
  'confirm.patchInOrder':
    'See kirjutab väikese paiga {banks:ill}, selles järjekorras — pesa, mida kaamera esimesena proovib, tuleb viimasena. Samm 04 paneb originaalid tagasi. Järgnev kogu välkmälu lugemine ainult loeb.',
  /* Step 04. */
  'confirm.restore': 'See kirjutab teie algse püsivara tagasi {banks:ill}.',
  'confirm.restoreInOrder':
    'See kirjutab teie algse püsivara tagasi {banks:ill}, selles järjekorras — pesa, mida kaamera esimesena proovib, tuleb esimesena.',
  'confirm.keepPlugged':
    'Hoidke kaamera ühendatud ja arvuti ärkvel, kuni see kirjutab — katkenud kirjutamise järel saab kaamerat parandada ainult riistvaraprogrammaatoriga (SPI või SWD/J-Link). Telefonis lülitage sisse lennukirežiim ja hoidke ekraan sees. Seejärel kaamera taaskäivitub; kui leht palub, vajutage „Ühenda seade“ ja valige kaamera uuesti. See on oodatud.',
  'confirm.yesJump': 'Jah — mine kirjutamisest mööda',
  'confirm.yesWrite': 'Jah — kirjuta kaamerasse',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'Tõend',
  'summary.complete': 'Täielik kujutis (4 MB)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'ei loodud',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'erineb varukoopiast, erinevaid plokke {differing}/{count}: {blocks}',
    other: 'erineb varukoopiast, erinevaid plokke {differing}/{count}: {blocks}',
  },
  'summary.matches': {
    one: 'vastab varukoopiale ({count} plokk)',
    other: 'vastab varukoopiale (kõik {count} plokki)',
  },
  'summary.onlyInFull': 'Ainult kogu välkmälu lugemises',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} plokk, kuhu tavaline lugemine ei ulatu: {blocks}',
    other: '{count} plokki, kuhu tavaline lugemine ei ulatu: {blocks}',
  },
  'summary.rawDump': 'Kogu välkmälu lugemine, nagu loeti',
  'summary.rawDumpBadge': 'sama, paik veel sees',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Püsivara kujutis (dekrüptitud, {bank})',
  'summary.verify': 'Kontroll',
  'summary.toolbar': 'Arhiivi toimingud',
  'summary.download': 'Laadi alla kogu arhiiv (seansifail)',

  /*
   * ---- what the run file holds (views/PreserveView, "What you get") ----
   * The file and folder names in the table stay as they are; {fill} is a byte (0xFF), {original} a file name.
   */
  'output.title': 'Mida saate',
  'output.intro':
    'Seansifail on üks allalaaditav `{ext}`-fail. Iga salvestus sisaldab kõike, mida seanss on seni loonud, iga sammu jaoks oma kaustas:',
  'output.caption': 'Seansifailis olevad failid',
  'output.file': 'Fail',
  'output.what': 'Mis see on',
  'output.runState':
    'seansi kirje: laadige ZIP-fail sellel vahekaardil, et seanssi jätkata või see uuesti üle vaadata',
  'output.readme': 'mis ZIP-failis on ja kus',
  'output.backup':
    'teie varukoopia: 31 plokki, mida tehaseseisus kaamera välja annab, loetud enne, kui midagi kirjutatakse, igaüks oma välkmälu aadressil ({fill} seal, kus plokki sel viisil lugeda ei saa)',
  'output.capture':
    'iga püsivarapesa, mida seanss saab kirjutada, sellisena, nagu kaamera selle salvestab (nimes a, b või r), loetud kaks korda ja mõlemad lugemised samad',
  'output.plain': 'nende pesade püsivara, dekrüptitud',
  'output.patched':
    'iga pesa kohta, mida seanss paikab: selle püsivara koos ajutise lugemispaigaga',
  'output.decrypted': 'dekrüptitud varukoopia: iga pesa püsivara ja aruanne selle kohta',
  'output.manifest': 'selle dekrüptimise üksikasjad',
  'output.decryptReadme': 'mis selles dekrüptimises on ja millised on selle piirangud',
  'output.pageBuild': 'selle lehe järk, mis seanssi käitas',
  'output.dumpPatched': 'kogu 4 MB loetud kujul, paik veel nendes pesades, kuhu see kirjutati',
  'output.dumpOriginal':
    'täielik kujutis: kogu 4 MB koos tagasi pandud algse püsivaraga — teie kaamera algne välkmälu',
  'output.verify':
    'pärast taastamist uuesti loetud 31 plokki, paigutatud nagu varukoopia; need peaksid sellega ühtima',
  'output.grows':
    'Fail ilmub siis, kui seda loov samm on töötanud, nii et varajases seansifailis on ainult esimene kaust.',
  'output.keep':
    'Alles tuleb hoida faili `{original}`: teie kaamera kogu välkmälu sellisena, nagu see oli. Ülejäänu näitab, kuidas seanss selleni jõudis.',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Valikuline — seansi hilisemaks jätkamiseks',
  'runFile.title': 'Seansifail',
  'runFile.description':
    'Seansi ainus kirje. See laaditakse pärast iga sammu (ja pärast varakult peatunud sammu) ise alla; hoidke alles uusim. Hiljem või pärast probleemi jätkamiseks laadige see siin ja leht jätkab sealt, kus pooleli jäi.',
  'runFile.run': 'Seanss',
  'runFile.file': 'Fail',
  'runFile.lastSaved': 'Viimati salvestatud',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'pärast sammu {step} — {at} ({bytes} B)',
  'runFile.nextStep': 'Järgmine samm',
  'runFile.none':
    'Ükski seanss pole aktiivne. Samm 02 alustab seanssi või laadige siin seansifail.',
  'runFile.toolbar': 'Seansifaili toimingud',
  'runFile.load': 'Laadi seansifail…',
  'runFile.save': 'Salvesta seansifail uuesti',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Jätkamine',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Seansifaili pole valitud.',
  'status.notRun': 'Pole veel käivitatud.',
  'status.running': 'Töötab …',
  'status.runningRestarts': 'Töötab — kaamera taaskäivitub selle sammu ajal …',
  'status.restarting': 'Kaamera taaskäivitub — see võtab umbes kümme sekundit …',
  'status.waitConnect': 'Ootab teid — vajutage „Ühenda seade“ ja valige kaamera …',
  'status.waitPlugBack': 'Ootab teid — ühendage kaamera uuesti, seejärel vajutage „Ühenda seade“ …',
  'status.waitReplug': 'Ootab teid — eemaldage kaamera ja ühendage see uuesti …',
  'status.back': 'Kaamera on tagasi — jätkamine …',
  'status.swapped':
    'Peatatud — kaamera vahetus. Kontrollige seda, seejärel käivitage etapp uuesti.',
  'status.noRun': 'Seanss puudub.',
  'status.notCreated': 'Ei loodud — vaadake ülalolevat logi.',
  'status.refused': 'Keeldutud — ülalolev etappide loend ütleb, mis puudub.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} — valmis. Teie allalaadimistes olev seansifail on ajakohane.',
  'status.doneReplug':
    '{phase} — valmis ja seansifail on salvestatud. Enne taastamist: eemaldage kaamera, ühendage see uuesti ja vajutage „Ühenda seade“.',
  'status.backupRefused': 'Keeldutud — midagi ei kirjutatud. Vaadake ülalolevat logi.',
  'status.failed': 'Nurjus — vaadake ülalolevat logi.',
  'status.cancelled': 'Katkestatud — seansifail ütleb endiselt, kus seanss peatus.',
  'status.readingFile': 'Seansifaili lugemine …',
  'status.doneEarlier': 'Tehtud varem — laaditud seansifailist.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Nurjus varem: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Jätkati sammust {step}. Etappide loend jätkab sealt.',
  'status.notResumed': 'Ei jätkatud — vaadake ülalolevat logi.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'vaja on: {missing}',
  'gate.noRun': 'ükski seanss pole aktiivne — esimene etapp loob seansi',
  'gate.runDone': 'see seanss on lõpetatud — kõik etapid on tehtud',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'juba tehtud — jätkamine algab sammust {step}',
  'gate.banksRead': 'pesad, mille varundamine loeb',
  'gate.choice': 'pesade valik — {why}',
  'gate.bankRefused': '{bank} pole kirjutatav: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute': 'taastepesa tee (see järk töötab ainult {r:ela}, mitte {bank:ela})',
  'gate.backupFirst': 'välkmälu varukoopia (see tehakse selles etapis esimesena)',
  'gate.backup': 'välkmälu varukoopia',
  'gate.patchStep': 'paikamise samm',
  'gate.patchOf': '{bank:gen} paik',
  'gate.backupFile': 'varukoopia akende fail',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': '{bank:gen} salvestis',
  'gate.derived': '{bank:gen} tuletatud kujutis',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'samm „Kirjutamine“ (käivitage see esmalt või jätkake sellest)',
  'gate.drainRefused': 'kogu välkmälu lugemine keeldub ({build}) — {why}',
  'gate.patchSummary': '{bank:gen} paiga kokkuvõte (ettevalmistatud pikkus)',
  'gate.restoreRefused':
    'taastamine keeldub ({build}) — ükski algse püsivara vorm ei salvestu tagasi algsete baitidena; seanss lõpeb täieliku kujutisega ja paik jääb paigale',
  /* {file} is a file name in the run file. */
  'gate.plaintext': '{bank:gen} tehase avatekst ({file}, varundamise sammust)',
  'gate.restoreFirst': 'taastamine (see tehakse selles etapis esimesena)',
  'gate.powerCycle':
    'toite välja- ja sisselülitamise kinnitus — lülitage kaamera toide välja ja sisse (eemaldage ja ühendage uuesti või kasutage selle toitelülitit), seejärel kasutage uuesti käivitamise nuppu',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'kaamera ei tulnud tagasi pärast {minutes} min proovimist: {error} — kui Chrome midagi ei küsinud, ühendage kaamera uuesti ja käivitage etapp uuesti; kui logi ütles, et see tuleb uuesti ühendada, ootas see just klõpsu nupul „Ühenda seade“',
} satisfies Translation<'preserve', 'et'>;
