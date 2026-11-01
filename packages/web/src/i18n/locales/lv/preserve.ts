/**
 * Namespace `preserve`, latviešu (lv), translated from the English source: the "Dump & decrypt 0.x/1.x" tab, a guided run that
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
  'how.title': 'Kas jāgaida',
  'how.descriptionIdle': 'Pievienojiet kameru, pēc tam sāciet ar 02. soli.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Sesija {runId}.',
  'how.descriptionRunVersion': 'Sesija {runId} — aparātprogrammatūra {version}.',
  'how.restarts':
    'Katrā solī kamera **restartējas**. Pēc restartēšanas Chrome to vairs neatpazīst (tai nav USB sērijas numura), tāpēc lapa lūdz jūs nospiest **Pievienot ierīci** un vēlreiz izvēlēties kameru. Tā tam jābūt — kad to izdarāt, solis turpinās pats.',
  'how.noFile':
    'Nav jāizvēlas neviens aparātprogrammatūras fails: viss tiek nolasīts no pašas kameras.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'Kamera glabā savu aparātprogrammatūru trīs **slotos** ({a}, {b} un {r}). 02. solis nolasa visus trīs un nosaka, no kura kamera sāknēsies nākamreiz; ielāps darbojas tikai tad, ja tas ir šajā slotā. Jūs izvēlaties slotus, kuriem 03. solis uzliek ielāpu, — pēc noklusējuma to, no kura notiks nākamā sāknēšana, — un 04. solis atjauno tos visus.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'Pēc katra soļa jūsu pārlūkprogramma lejupielādē **sesijas failu**, kura nosaukumā ir sesijas sākums, saglabāšanas laiks un sasniegtais solis (`{example}`) un kurā katram solim ir sava mape. Paturiet jaunāko — ar to varēsiet turpināt vēlāk.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**03. un 04. solis raksta kameras zibatmiņā**, un katrs vispirms lūdz apstiprinājumu. Kamēr kāds no tiem darbojas, turiet kameru pievienotu (ja vien lapa nelūdz to atvienot un pievienot atkal) un datoru nomodā, vēlams pieslēgtu elektrotīklam. Pārtraukta ierakstīšana atstāj kameru, ko var salabot tikai ar aparatūras programmatoru (SPI vai SWD/J-Link).',
  'how.phone':
    '**Tālrunī:** pirms 03. soļa ieslēdziet lidojuma režīmu un izslēdziet Wi-Fi un mobilos datus, lai zvans vai paziņojums nevarētu ierakstīšanas vidū novērst pārlūkprogrammu, — un turiet ekrānu ieslēgtu. Kad lapa ir atvērta, tā turpina darboties bezsaistē.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**Šai sesijai ierakstīšana nav reģistrēta, tāpēc nākamie soļi ir slēgti.** Kamera, iespējams, jau darbina attēlu ar ielāpu (pārtraukta ierakstīšana), vai arī ne (ierakstīšana nemaz nesākās) — sesijas fails nevar pierādīt, kurš no variantiem ir patiess. Nepalaidiet visas zibatmiņas nolasīšanu vai atjaunošanu kamerai ar ielāpu, ja ierakstīšana nav reģistrēta; ceļš uz priekšu ir 03. solis, kura pārbaude pirms ierakstīšanas nolasa slotu un atsakās to vēlreiz ierakstīt uz labu laimi. Tikai tad, ja šī pārbaude jau ir atteikusi ar *already holds the patched bytes*, var izmantot pārlēcienu — un tam ir savs dialogs.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Nolasīšana un sagatavošana',
  'phase.readBuild.inSentence': 'nolasīšanu un sagatavošanu',
  'phase.readBuild.description':
    'Nolasa visu, ko izdod rūpnīcas stāvoklī esoša kamera — 31 bloku pa 64 KB —, un patur to kā jūsu rezerves kopiju, otrreiz nolasa katru aparātprogrammatūras slotu, nosaka, no kura slota kamera sāknēsies nākamreiz, un sagatavo nelielo ielāpu, ko ieraksta nākamais solis. Kamerā nekas netiek ierakstīts. Parasti tas aizņem mazāk par minūti. Ja pa ceļam kamera jārestartē, lapa lūdz jūs nospiest „Pievienot ierīci“ un izvēlēties to vēlreiz — tā tam jābūt.',
  'phase.patchDump.label': 'Ierakstīšana un visas zibatmiņas nolasīšana',
  'phase.patchDump.inSentence': 'ierakstīšanu un visas zibatmiņas nolasīšanu',
  'phase.patchDump.description':
    'Ieraksta nelielu pagaidu ielāpu 02. solī izvēlētajos aparātprogrammatūras slotos (pēc noklusējuma tajā, no kura kamera sāknēsies nākamreiz), lai kamera varētu nolasīt visu savu zibatmiņu. Pēc tam kamera restartējas — kad lapa lūdz, nospiediet „Pievienot ierīci“ un izvēlieties to vēlreiz —, un tiek nolasīta visa 4 MB zibatmiņa. 04. solis atliek atpakaļ oriģinālo aparātprogrammatūru.',
  'phase.restoreVerify.label': 'Atjaunošana un pārbaude',
  'phase.restoreVerify.inSentence': 'atjaunošanu un pārbaudi',
  'phase.restoreVerify.description':
    'Ieraksta atpakaļ jūsu oriģinālo aparātprogrammatūru, restartē kameru (kad lūgts, nospiediet „Pievienot ierīci“ un izvēlieties to vēlreiz), pēc tam vēlreiz nolasa visu, lai pārbaudītu, vai tas baitu pa baitam sakrīt ar rezerves kopiju.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Nolasa 31 bloku pa 64 KB, ko var nolasīt rūpnīcas stāvoklī esoša kamera, pēc tam otrreiz nolasa katru slotu (abām nolasīšanām jāsakrīt baitu pa baitam), iegūst katra slota aparātprogrammatūru no tā, ko kamera glabā (atšifrējot, ja tā glabājas šifrēta), un to pārbauda, kā arī nosaka, no kura slota kamera sāknēsies nākamreiz. Šī ir sesijas vienīgā šīs kameras kopija, kas iegūta, pirms kaut kas tiek ierakstīts.',
  'step.patch.description':
    'Bezsaistē, bez kameras. Izveido ielāpu katram slotam, ko sesija var ierakstīt: ar to kameras nolasīšana sasniedz visu 4 MB zibatmiņu, un tas tiek ierakstīts tādā formā, kādā kamera to glabā, tāpēc mainās tikai paša ielāpa baiti.',
  'step.commit.description':
    'Ierakstīšana. Vispirms nolasa katru izvēlēto slotu un neko neieraksta, ja katrā joprojām nav tā, ko reģistrēja rezerves kopija (jau notikusi ierakstīšana nekad netiek atkārtota), pēc tam ieraksta katru, slotu, ko kamera mēģina pirmo, — pēdējo. Kamera šeit netiek restartēta: to restartē nākamais solis.',
  'step.drain.description':
    'Restartē kameru, lai tā palaistu aparātprogrammatūru ar ielāpu (apmēram desmit sekundes tā klusē; lapa gaida un atrod to atkal), pārbauda, no kura slota tā sāknējās (slots bez ielāpa aptur soli, pirms kaut kas tiek nolasīts), pēc tam ar vienu nolasīšanu nolasa visu 4 MB zibatmiņu un saglabātajā attēlā ieliek katra ierakstītā slota oriģinālo aparātprogrammatūru no rezerves kopijas. Nekas netiek ierakstīts.',
  'step.restore.description':
    'Otrā ierakstīšana. Kamēr vēl darbojas aparātprogrammatūra ar ielāpu, ieraksta atpakaļ katra ierakstītā slota oriģinālo aparātprogrammatūru, pēc tam restartē kameru.',
  'step.verify.description':
    'Pēc jaunas palaišanas vēlreiz nolasa 31 bloku, starp tiem katru slotu: 0 atšķirīgu baitu pierāda, ka kameras zibatmiņa baitu pa baitam sakrīt ar rezerves kopiju. Tikai lasīšana.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Sākt {phase}',
  'phase.retry': 'Atkārtot {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Turpināt ar 04. soli: atjaunot slotus',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Pārlēkt pāri nereģistrētajai ierakstīšanai',
  'phase.skipWrite': 'Izlaist ierakstīšanu — sākt ar visas zibatmiņas nolasīšanu',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': '{phase}: darbības',
  /* The badges beside the step's title. */
  'badge.writes': 'raksta kamerā',
  'badge.running': 'Darbojas',
  'badge.done': 'Gatavs',
  'badge.plannedStop': 'Apturēts, kā plānots — nākamā ir atjaunošana',
  'badge.failed': 'Apturēts — skatiet žurnālu',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Nākamais',
  /* Why the start button is off. */
  'notReady.noRun': 'Pieejams pēc 02. soļa — tas sāk sesiju.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Pieejams pēc {step}. soļa ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Vēl nav gatavs — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Attiecas uz kameru ar ielāpu, kamēr ierakstīšana nav reģistrēta, — kamerai, iespējams, jau ir ielāps. Skatiet piezīmi sadaļā „{section}“.',
  'phase.noDrain':
    'Visas zibatmiņas nolasīšana nav notikusi — šis solis atjauno kameru bez tās. Vispirms palaidiet 03. soli, ja vien visas zibatmiņas nolasīšana jums nav svarīga.',
  'phase.keepPlugged': 'Līdz šī soļa beigām turiet kameru pievienotu un datoru nomodā.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Izpilde',
  'phase.showDetails': 'Rādīt sīkāku informāciju žurnālā',
  'phase.inDetail': 'Ko šis solis dara, sīkāk',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Jūsu kārta',
  'yourTurn.reconnect.title': 'Jūsu kārta: nospiediet „Pievienot ierīci“ un izvēlieties kameru.',
  'yourTurn.reconnect.body':
    'Kamera restartējās, kā plānots. Chrome pats to vēlreiz atpazīt nevar (tai nav USB sērijas numura), tāpēc jums tā jāizvēlas vēlreiz. Tiklīdz to izdarāt, solis turpinās.',
  'yourTurn.replug.title':
    'Jūsu kārta: atvienojiet kameru, pievienojiet to atkal, pēc tam nospiediet „Pievienot ierīci“.',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'Šīs sesijas ielāps tika izveidots pirms lasītāja labojuma, tāpēc pirms atjaunošanas kamera ir no jauna jāieslēdz. Sesijas fails jau ir saglabāts.',
  'yourTurn.replugBeforeRestore.title':
    'Pirms 04. soļa: atvienojiet kameru, pievienojiet to atkal, pēc tam nospiediet „Pievienot ierīci“.',
  'yourTurn.powerCycle.title':
    'Jūsu kārta: atvienojiet kameru, pievienojiet to atkal, nospiediet „Pievienot ierīci“ — un mēģiniet vēlreiz.',
  'yourTurn.powerCycle.body':
    'Lai kameru varētu nolasīt vēlreiz, tās lasītājam vajag jaunu ieslēgšanu. Sesija joprojām ir ielādēta šeit; nekas nav zudis.',
  'yourTurn.powerCycleAssert.title':
    'Jūsu kārta: atvienojiet kameru, pievienojiet to atkal, nospiediet „Pievienot ierīci“ — un turpiniet.',
  'yourTurn.powerCycleAssert.body':
    'Pēdējais rezerves kopijas mēģinājums apstājās, un pirms nākamās palaišanas kamera ir no jauna jāieslēdz. Kamera pati to paziņot nevar, tāpēc ar pogu zemāk jūs lapai pasakāt, ka esat to izdarījuši.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Kamera pievienota atkal — turpināt {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Kuriem slotiem 03. solis uzliek ielāpu',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Sāknēšanas konfigurācijas vārds',
  'banks.lastStart': 'Pēdējā sāknēšana',
  'banks.nextStart': 'Nākamā sāknēšana',
  'banks.caption': 'Trīs aparātprogrammatūras sloti, kā tos nolasīja 02. solis',
  'banks.col.bank': 'Slots',
  'banks.col.address': 'Adrese',
  'banks.col.holds': 'Kas tajā ir',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'nākamā sāknēšana',
  'banks.choiceLabel': 'Sloti ielāpam',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'Slots, no kura notiks nākamā sāknēšana',
  'choice.all': 'Visi sloti',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — netiek piedāvāts',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen':
    'Neviens slots vēl nav izvēlēts: {what}. Izvēlieties slotu pēc nosaukuma augstāk.',
  'banks.writes': '03. solis ieraksta: {what}.',
  'banks.fixed':
    'Ierakstīšana ir notikusi, tāpēc izvēle ir fiksēta: 04. solis atjauno tieši šos slotus.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: netiek piedāvāts — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'nav aktīvas sesijas — to sāk 02. solis',
  'banks.refusedBusy': 'darbojas kāds solis — izvēlieties slotus, kad tas būs beidzies',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'Plāns — {build}, ielāps {banks:dat}',
  'plan.summaryNone': 'Plāns — {build}, slots vēl nav izvēlēts',
  'plan.yourCamera': 'jūsu kamera',
  'plan.intro':
    'Izveidots no pašas kameras baitiem. Nekas netiek ierakstīts, kamēr nav palaists 03. solis, un 04. solis atliek atpakaļ katru tā ierakstīto baitu.',
  /* The rows; their values are core's. */
  'plan.build': 'Būvējums',
  'plan.version': 'Aparātprogrammatūras versija',
  'plan.written': 'Ierakstīts',
  'plan.route': 'Kur tas nonāk',
  'plan.restore': 'Atjaunošana',
  'plan.wholeFlash': 'Visas zibatmiņas nolasīšana',
  'plan.outro':
    'Formā, kādā kamera glabā, mainās tie paši baiti un neviens cits, tāpēc kameras aparātprogrammatūra mainās tieši par šo atšķirību un neko vairāk.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'Ielāps {bank:dat}',
  'bankPlan.titleChosen': '{bank} — ieraksta šī sesija',
  'bankPlan.titleNotChosen': '{bank} — nav izvēlēts',
  'bankPlan.source': 'Attēla avots',
  'bankPlan.sourceValue': '{bank} tāds, kāds tas glabājas',
  'bankPlan.sourceTwoReads':
    '{bank} tāds, kāds tas glabājas, divas sakrītošas nolasīšanas (sha256 {sha})',
  'bankPlan.edit': 'Attēla labojums',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) rūpnīcas attēlā. Tā līdzsvars {balance} ir korekcijas vārdā; ielāps līdzsvaro papildus tam, un 04. solis atjauno attēlu ar šo labojumu.',
  'bankPlan.factorySha': 'Rūpnīcas atklātā teksta sha256',
  'bankPlan.patchedSha': 'Ar ielāpu: sha256',
  /** Row label: how many bytes of the bank, as the flash chip stores it, the patch changes. */
  'bankPlan.diffCount': 'Mainītie baiti zibatmiņas mikroshēmā',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Sagatavotais garums',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    zero: '{size} B {count} daļās',
    one: '{size} B {count} daļā',
    other: '{size} B {count} daļās',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Līdzsvarošanas vārds',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (bija {balance}, labojuma līdzsvars)',
  'bankPlan.caption': 'Precīzi baiti, ko ielāps maina {bank:loc}',
  'bankPlan.col.what': 'Ko tas maina',
  'bankPlan.col.offset': 'Nobīde',
  'bankPlan.col.before': 'Pirms',
  'bankPlan.col.after': 'Pēc',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    zero: '**Pārbaudīts — pilnīga sakritība.** Pēc jaunas palaišanas kamera tika nolasīta vēlreiz: bloki {read}/31, {count} atšķirīgu baitu. Tās zibatmiņa ir tieši tāda, kāda tā bija pirms pirmās ierakstīšanas.',
    one: '**Pārbaudīts — pilnīga sakritība.** Pēc jaunas palaišanas kamera tika nolasīta vēlreiz: bloki {read}/31, {count} atšķirīgs baits. Tās zibatmiņa ir tieši tāda, kāda tā bija pirms pirmās ierakstīšanas.',
    other:
      '**Pārbaudīts — pilnīga sakritība.** Pēc jaunas palaišanas kamera tika nolasīta vēlreiz: bloki {read}/31, {count} atšķirīgi baiti. Tās zibatmiņa ir tieši tāda, kāda tā bija pirms pirmās ierakstīšanas.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    zero: '**Pārbaudīts — pilnīga sakritība.** Pēc jaunas palaišanas kamera tika nolasīta vēlreiz: bloki {read}/31, {count} atšķirīgu baitu (īsi bloki: {blocks}). Tās zibatmiņa ir tieši tāda, kāda tā bija pirms pirmās ierakstīšanas.',
    one: '**Pārbaudīts — pilnīga sakritība.** Pēc jaunas palaišanas kamera tika nolasīta vēlreiz: bloki {read}/31, {count} atšķirīgs baits (īsi bloki: {blocks}). Tās zibatmiņa ir tieši tāda, kāda tā bija pirms pirmās ierakstīšanas.',
    other:
      '**Pārbaudīts — pilnīga sakritība.** Pēc jaunas palaišanas kamera tika nolasīta vēlreiz: bloki {read}/31, {count} atšķirīgi baiti (īsi bloki: {blocks}). Tās zibatmiņa ir tieši tāda, kāda tā bija pirms pirmās ierakstīšanas.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**Pārbaude atrada atšķirības salīdzinājumā ar rezerves kopiju.** {error}',
  unknownReason: 'nezināms iemesls',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — ierakstīt {banks:loc}?',
  'confirm.titleJump': '{phase} — pārlēkt pāri nereģistrētajai ierakstīšanai?',
  'confirm.chosenBanks': 'izvēlētajos slotos',
  'confirm.jump':
    'IERAKSTĪŠANA ŠAI SESIJAI NAV REĢISTRĒTA, un jūs apgalvojat, ka ierakstīšana notika bez kontrolpunktiem: solis sākas aiz ierakstīšanas, nevis raksta vēlreiz. Soļu pašu pārbaudes joprojām notiek — versijas nolasīšana, slotu pārbaudes —, un kļūdains minējums maksā veltīgu visas zibatmiņas nolasīšanu, nevis sabojātu kameru.',
  'confirm.jumpKeepPlugged': 'Līdz soļa beigām turiet kameru pievienotu un datoru nomodā.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Tiek ierakstīts neliels ielāps {banks:loc}. 04. solis atliek atpakaļ oriģinālus. Sekojošā visas zibatmiņas nolasīšana tikai lasa.',
  'confirm.patchInOrder':
    'Tiek ierakstīts neliels ielāps {banks:loc}, šādā secībā — slots, ko kamera mēģina pirmo, ir pēdējais. 04. solis atliek atpakaļ oriģinālus. Sekojošā visas zibatmiņas nolasīšana tikai lasa.',
  /* Step 04. */
  'confirm.restore': 'Jūsu oriģinālā aparātprogrammatūra tiek ierakstīta atpakaļ {banks:loc}.',
  'confirm.restoreInOrder':
    'Jūsu oriģinālā aparātprogrammatūra tiek ierakstīta atpakaļ {banks:loc}, šādā secībā — slots, ko kamera mēģina pirmo, ir pirmais.',
  'confirm.keepPlugged':
    'Kamēr notiek ierakstīšana, turiet kameru pievienotu un datoru nomodā — pārtraukta ierakstīšana atstāj kameru, ko var salabot tikai ar aparatūras programmatoru (SPI vai SWD/J-Link). Tālrunī ieslēdziet lidojuma režīmu un turiet ekrānu ieslēgtu. Pēc tam kamera restartējas; kad lapa lūdz, nospiediet „Pievienot ierīci“ un izvēlieties to vēlreiz. Tā tam jābūt.',
  'confirm.yesJump': 'Jā — pārlēkt pāri ierakstīšanai',
  'confirm.yesWrite': 'Jā — rakstīt kamerā',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'Pierādījums',
  'summary.complete': 'Pilns attēls (4 MB)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'nav izveidots',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    zero: 'salīdzinot ar rezerves kopiju, atšķiras {differing} no {count} blokiem: {blocks}',
    one: 'salīdzinot ar rezerves kopiju, atšķiras {differing} no {count} bloka: {blocks}',
    other: 'salīdzinot ar rezerves kopiju, atšķiras {differing} no {count} blokiem: {blocks}',
  },
  'summary.matches': {
    zero: 'sakrīt ar rezerves kopiju (visi bloki: {count})',
    one: 'sakrīt ar rezerves kopiju (visi bloki: {count})',
    other: 'sakrīt ar rezerves kopiju (visi bloki: {count})',
  },
  'summary.onlyInFull': 'Tikai visas zibatmiņas nolasīšanā',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    zero: '{count} bloku, ko parasta nolasīšana nesasniedz: {blocks}',
    one: '{count} bloks, ko parasta nolasīšana nesasniedz: {blocks}',
    other: '{count} bloki, ko parasta nolasīšana nesasniedz: {blocks}',
  },
  'summary.rawDump': 'Visas zibatmiņas nolasīšana, kā nolasīts',
  'summary.rawDumpBadge': 'tas pats, ar ielāpu vēl vietā',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Aparātprogrammatūras attēls (atšifrēts, {bank})',
  'summary.verify': 'Pārbaude',
  'summary.toolbar': 'Arhīva darbības',
  'summary.download': 'Lejupielādēt pilnu arhīvu (sesijas failu)',

  /*
   * ---- what the run file holds (views/PreserveView, "What you get") ----
   * The file and folder names in the table stay as they are; {fill} is a byte (0xFF), {original} a file name.
   */
  'output.title': 'Ko jūs saņemat',
  'output.intro':
    'Sesijas fails ir viena `{ext}` lejupielāde. Katrā saglabāšanā ir viss, ko sesija līdz tam izveidojusi, un katram solim ir sava mape:',
  'output.caption': 'Faili sesijas failā',
  'output.file': 'Fails',
  'output.what': 'Kas tas ir',
  'output.runState':
    'sesijas ieraksts: ielādējiet ZIP failu šajā cilnē, lai turpinātu sesiju vai to vēlreiz apskatītu',
  'output.readme': 'kas ir ZIP failā un kur',
  'output.backup':
    'jūsu rezerves kopija: 31 bloks, ko izdod rūpnīcas stāvoklī esoša kamera, nolasīti, pirms kaut kas tiek ierakstīts, katrs savā zibatmiņas adresē ({fill}, ja bloku šādi nevar nolasīt)',
  'output.capture':
    'katrs aparātprogrammatūras slots, ko sesija var ierakstīt, tāds, kādu to glabā kamera (nosaukumā a, b vai r), nolasīts divreiz, un abas nolasīšanas sakrīt',
  'output.plain': 'katra šī slota aparātprogrammatūra, atšifrēta',
  'output.patched':
    'katram slotam, kuram sesija uzliek ielāpu: tā aparātprogrammatūra ar pagaidu lasīšanas ielāpu',
  'output.decrypted':
    'atšifrētā rezerves kopija: katra slota aparātprogrammatūra un atskaite par to',
  'output.manifest': 'šīs atšifrēšanas sīkāka informācija',
  'output.decryptReadme': 'kas ir šajā atšifrējumā un kādi ir tā ierobežojumi',
  'output.pageBuild': 'kurš šīs lapas būvējums palaida sesiju',
  'output.dumpPatched':
    'visi 4 MB, kā nolasīti, ar ielāpu vēl tajos slotos, kuros tas tika ierakstīts',
  'output.dumpOriginal':
    'pilns attēls: visi 4 MB ar atjaunotu oriģinālo aparātprogrammatūru — jūsu kameras oriģinālā zibatmiņa',
  'output.verify':
    '31 bloks, pēc atjaunošanas nolasīti vēlreiz un izkārtoti kā rezerves kopijā; tiem jāsakrīt ar to',
  'output.grows':
    'Fails parādās, kad ir palaists solis, kas to izveido, tāpēc agrīnā sesijas failā ir tikai pirmā mape.',
  'output.keep':
    'Paturamais fails ir `{original}`: visa jūsu kameras zibatmiņa tāda, kāda tā bija. Pārējie parāda, kā sesija līdz tam nonāca.',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Neobligāti — lai turpinātu sesiju vēlāk',
  'runFile.title': 'Sesijas fails',
  'runFile.description':
    'Sesijas vienīgais ieraksts. Tas tiek lejupielādēts pats pēc katra soļa (arī pēc soļa, kas apstājās priekšlaicīgi); paturiet jaunāko. Lai turpinātu vēlāk vai pēc problēmas, ielādējiet to šeit, un lapa turpinās no vietas, kur apstājās.',
  'runFile.run': 'Sesija',
  'runFile.file': 'Fails',
  'runFile.lastSaved': 'Pēdējoreiz saglabāts',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'pēc {step} — {at} ({bytes} B)',
  'runFile.nextStep': 'Nākamais solis',
  'runFile.none': 'Nav aktīvas sesijas. To sāk 02. solis, vai arī ielādējiet sesijas failu šeit.',
  'runFile.toolbar': 'Sesijas faila darbības',
  'runFile.load': 'Ielādēt sesijas failu…',
  'runFile.save': 'Saglabāt sesijas failu vēlreiz',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Atsākšana',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Sesijas fails nav izvēlēts.',
  'status.notRun': 'Vēl nav palaists.',
  'status.running': 'Darbojas …',
  'status.runningRestarts': 'Darbojas — šī soļa laikā kamera restartējas …',
  'status.restarting': 'Kamera restartējas — tas aizņem apmēram desmit sekundes …',
  'status.waitConnect': 'Gaida jūs — nospiediet „Pievienot ierīci“ un izvēlieties kameru …',
  'status.waitPlugBack':
    'Gaida jūs — pievienojiet kameru atkal, pēc tam nospiediet „Pievienot ierīci“ …',
  'status.waitReplug': 'Gaida jūs — atvienojiet kameru un pievienojiet to atkal …',
  'status.back': 'Kamera ir atpakaļ — turpina …',
  'status.swapped': 'Apturēts — kamera nomainījās. Pārbaudiet to, pēc tam palaidiet posmu vēlreiz.',
  'status.noRun': 'Nav sesijas.',
  'status.notCreated': 'Nav izveidota — skatiet žurnālu augstāk.',
  'status.refused': 'Atteikts — posmu saraksts augstāk pasaka, ko trūkst.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} — gatavs. Sesijas fails jūsu lejupielādēs ir aktuāls.',
  'status.doneReplug':
    '{phase} — gatavs, un sesijas fails ir saglabāts. Pirms atjaunošanas: atvienojiet kameru, pievienojiet to atkal un nospiediet „Pievienot ierīci“.',
  'status.backupRefused': 'Atteikts — nekas netika ierakstīts. Skatiet žurnālu augstāk.',
  'status.failed': 'Neizdevās — skatiet žurnālu augstāk.',
  'status.cancelled': 'Atcelts — sesijas fails joprojām rāda, kur sesija apstājās.',
  'status.readingFile': 'Nolasa sesijas failu …',
  'status.doneEarlier': 'Izpildīts agrāk — ielādēts no sesijas faila.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Agrāk neizdevās: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Atsākts ar {step}. Posmu saraksts turpina no turienes.',
  'status.notResumed': 'Nav atsākts — skatiet žurnālu augstāk.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'vajag: {missing}',
  'gate.noRun': 'nav aktīvas sesijas — sesiju izveido pirmais posms',
  'gate.runDone': 'šī sesija ir pabeigta — visi posmi izpildīti',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'jau izpildīts — atsākšana turpina ar {step}',
  'gate.banksRead': 'sloti, ko nolasa rezerves kopija',
  'gate.choice': 'slotu izvēle — {why}',
  'gate.bankRefused': '{bank:acc} nevar ierakstīt: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'atkopšanas slota ceļš (šis būvējums darbojas tikai no {r:gen}, nevis no {bank:gen})',
  'gate.backupFirst': 'zibatmiņas rezerves kopija (šajā posmā tā notiek pirmā)',
  'gate.backup': 'zibatmiņas rezerves kopija',
  'gate.patchStep': 'ielāpa solis',
  'gate.patchOf': '{bank:gen} ielāps',
  'gate.backupFile': 'rezerves kopijas logu fails',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': '{bank:gen} divkāršā nolasīšana',
  'gate.derived': '{bank:gen} atvasinātais attēls',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'solis „Ierakstīšana“ (vispirms palaidiet to vai atsāciet ar to)',
  'gate.drainRefused': 'visas zibatmiņas nolasīšana atsakās darboties ({build}) — {why}',
  'gate.patchSummary': '{bank:gen} ielāpa kopsavilkums (sagatavotais garums)',
  'gate.restoreRefused':
    'atjaunošana atsakās darboties ({build}) — neviena oriģinālās aparātprogrammatūras forma netiek saglabāta atpakaļ kā oriģinālie baiti; sesija beidzas ar pilnu attēlu un ielāpu vietā',
  /* {file} is a file name in the run file. */
  'gate.plaintext': '{bank:gen} rūpnīcas atklātais teksts ({file}, no rezerves kopijas soļa)',
  'gate.restoreFirst': 'atjaunošana (šajā posmā tā notiek pirmā)',
  'gate.powerCycle':
    'apliecinājums par barošanas pārslēgšanu — izslēdziet un ieslēdziet kameru (atvienojiet un pievienojiet atkal vai izmantojiet tās barošanas slēdzi), pēc tam izmantojiet atkārtotas palaišanas vadīklu',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'kamera neatgriezās pēc {minutes} min atkārtotiem mēģinājumiem: {error} — ja Chrome neko nejautāja, pievienojiet kameru atkal un palaidiet posmu vēlreiz; ja žurnāls lika to pievienot no jauna, tad tieši klikšķi uz „Pievienot ierīci“ tas gaidīja',
} satisfies Translation<'preserve', 'lv'>;
