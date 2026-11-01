/**
 * Namespace `preserve`, български (bg), translated from the English source: the "Dump & decrypt 0.x/1.x" tab, a guided run that
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
  'how.title': 'Какво да очаквате',
  'how.descriptionIdle': 'Свържете камерата, след това започнете от стъпка 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Сесия {runId}.',
  'how.descriptionRunVersion': 'Сесия {runId} — фърмуер {version}.',
  'how.restarts':
    'Камерата се **рестартира** по време на всяка стъпка. След рестартиране Chrome вече не я разпознава (тя няма сериен номер за USB), затова страницата ви моли да натиснете **Свързване на устройство** и да изберете камерата отново. Това е нормалният ход — стъпката продължава сама, щом го направите.',
  'how.noFile': 'Няма файл с фърмуер за избиране: всичко се чете от самата камера.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'Камерата пази фърмуера си в три **слота** ({a}, {b} и {r}). Стъпка 02 чете и трите и определя от кой камерата ще стартира следващия път; пачът работи само ако е в този слот. Вие избирате слотовете, към които стъпка 03 прилага пач — по подразбиране този, от който ще е следващото стартиране, — а стъпка 04 връща всеки от тях.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'След всяка стъпка браузърът ви изтегля **файл на сесията**, наименуван по началото на сесията, часа на запазване и достигнатата стъпка (`{example}`), с по една папка за всяка стъпка вътре. Пазете най-новия — с него можете да продължите по-късно.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**Стъпки 03 и 04 записват във флаш паметта на камерата** и всяка първо ви моли за потвърждение. Докато някоя от тях се изпълнява, дръжте камерата включена (освен ако страницата не ви помоли да я изключите и включите отново), а компютъра — буден, по възможност захранван от мрежата. Прекъснат запис оставя камера, която може да бъде поправена само с хардуерен програматор (SPI или SWD/J-Link).',
  'how.phone':
    '**На телефон:** преди стъпка 03 включете самолетния режим и изключете Wi-Fi и мобилните данни, за да не може обаждане или известие да отвлече браузъра по време на запис — и дръжте екрана включен. Щом е отворена, страницата продължава да работи и офлайн.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**Записът не е отбелязан за тази сесия, затова стъпките след него са затворени.** Камерата може вече да изпълнява образа с пача (прекъснат запис) или да не го изпълнява (записът изобщо не е започнал) — файлът на сесията не може да докаже кое от двете. Не изпълнявайте пълното четене или възстановяването на камера с пач, без записът да е отбелязан; пътят напред е стъпка 03, чиято проверка преди записа чете слота и отказва да го запише отново на сляпо. Само ако тази проверка вече е отказала с *already holds the patched bytes*, се прилага прескачането — и то минава през собствен диалог.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Четене и подготовка',
  'phase.readBuild.inSentence': 'четене и подготовка',
  'phase.readBuild.description':
    'Чете всичко, което заводската камера позволява — 31 блока от 64 КБ — и го пази като ваше резервно копие, чете всеки слот на фърмуера втори път, определя от кой слот камерата ще стартира следващия път и подготвя малкия пач, който записва следващата стъпка. В камерата не се записва нищо. Обикновено отнема под минута. Ако по пътя камерата трябва да се рестартира, страницата ви моли да натиснете „Свързване на устройство“ и да я изберете отново — това е очаквано.',
  'phase.patchDump.label': 'Запис и пълно четене',
  'phase.patchDump.inSentence': 'запис и пълно четене',
  'phase.patchDump.description':
    'Записва малък временен пач в слотовете на фърмуера, избрани в стъпка 02 (по подразбиране слота, от който камерата ще стартира следващия път), за да може тя да прочете цялата си флаш памет. След това камерата се рестартира — натиснете „Свързване на устройство“ и я изберете отново, когато страницата ви помоли — и се прочита цялата флаш памет (4 МБ). Стъпка 04 връща оригиналния фърмуер.',
  'phase.restoreVerify.label': 'Възстановяване и проверка',
  'phase.restoreVerify.inSentence': 'възстановяване и проверка',
  'phase.restoreVerify.description':
    'Записва обратно оригиналния ви фърмуер, рестартира камерата (натиснете „Свързване на устройство“ и я изберете отново, когато бъдете помолени), след което прочита всичко още веднъж, за да провери, че съвпада с резервното копие байт по байт.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Чете 31-те блока от 64 КБ, които заводската камера позволява да бъдат прочетени, след това чете всеки слот втори път (двете четения трябва да съвпаднат байт по байт), извлича фърмуера на всеки слот от това, което съхранява камерата (дешифриран, ако е съхранен шифриран), проверява го и определя от кой слот камерата ще стартира следващия път. Това е единственото копие на тази камера в сесията, направено преди да бъде записано каквото и да е.',
  'step.patch.description':
    'Офлайн, без камера. Подготвя пача за всеки слот, който сесията може да запише: той позволява на четенето на камерата да стигне до цялата флаш памет (4 МБ) и се записва във формата, в която камерата го съхранява, така че се променят само собствените байтове на пача.',
  'step.commit.description':
    'Записът. Първо прочита обратно всеки избран слот и не записва нищо, освен ако всеки все още съдържа това, което е отбелязано в резервното копие (запис, който вече е минал, никога не се повтаря), след това записва всеки от тях, като слотът, който камерата опитва първи, е последен. Камерата не се рестартира тук: следващата стъпка я рестартира.',
  'step.drain.description':
    'Рестартира камерата, за да стартира фърмуера с пача (тя мълчи около десет секунди; страницата изчаква и я намира отново), проверява от кой слот е стартирала (слот без пача спира стъпката, преди да се прочете каквото и да е), след това прочита цялата флаш памет (4 МБ) с едно четене и поставя в запазения образ оригиналния фърмуер на всеки записан слот от резервното копие. Нищо не се записва.',
  'step.restore.description':
    'Другият запис. Записва обратно оригиналния фърмуер на всеки записан слот, докато фърмуерът с пача още работи, след това рестартира камерата.',
  'step.verify.description':
    'След ново стартиране чете отново 31-те блока, сред които е и всеки слот: 0 различаващи се байта доказват, че флаш паметта на камерата е байт по байт същата като резервното копие. Само четене.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Стартиране: {phase}',
  'phase.retry': 'Нов опит: {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Към стъпка 04: възстановяване на слотовете',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Прескачане на неотбелязания запис',
  'phase.skipWrite': 'Без запис — започване от пълното четене',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': 'Действия: {phase}',
  /* The badges beside the step's title. */
  'badge.writes': 'записва в камерата',
  'badge.running': 'Изпълнява се',
  'badge.done': 'Готово',
  'badge.plannedStop': 'Спряно по план — следва възстановяването',
  'badge.failed': 'Спряно — вижте журнала',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Следваща',
  /* Why the start button is off. */
  'notReady.noRun': 'Достъпно след стъпка 02 — тя започва сесията.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Достъпно след стъпка {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Още не е готово — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Засяга камерата с пач, докато записът не е отбелязан — камерата може вече да е с пач. Вижте бележката под „{section}“.',
  'phase.noDrain':
    'Пълното четене не е изпълнено — тази стъпка връща камерата без него. Първо изпълнете стъпка 03, освен ако пълното четене не е важно за вас.',
  'phase.keepPlugged': 'Дръжте камерата включена и компютъра буден, докато тази стъпка не завърши.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Напредък',
  'phase.showDetails': 'Подробности в журнала',
  'phase.inDetail': 'Какво прави тази стъпка, подробно',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Ваш ред',
  'yourTurn.reconnect.title': 'Ваш ред: натиснете „Свързване на устройство“ и изберете камерата.',
  'yourTurn.reconnect.body':
    'Камерата се рестартира, както е планирано. Chrome не може сам да я разпознае отново (тя няма сериен номер за USB), затова трябва да я изберете още веднъж. Стъпката продължава веднага щом го направите.',
  'yourTurn.replug.title':
    'Ваш ред: изключете камерата, включете я отново, след това натиснете „Свързване на устройство“.',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'Пачът на тази сесия е направен преди поправката на четенето, затова камерата трябва да бъде включена наново преди възстановяването. Файлът на сесията вече е запазен.',
  'yourTurn.replugBeforeRestore.title':
    'Преди стъпка 04: изключете камерата, включете я отново, след това натиснете „Свързване на устройство“.',
  'yourTurn.powerCycle.title':
    'Ваш ред: изключете камерата, включете я отново, натиснете „Свързване на устройство“ — след това опитайте пак.',
  'yourTurn.powerCycle.body':
    'Четенето на камерата изисква тя да бъде включена наново, преди да може да бъде прочетена отново. Сесията все още е заредена тук; нищо не е загубено.',
  'yourTurn.powerCycleAssert.title':
    'Ваш ред: изключете камерата, включете я отново, натиснете „Свързване на устройство“ — след това продължете.',
  'yourTurn.powerCycleAssert.body':
    'Последният опит за резервно копие спря и камерата трябва да бъде включена наново, преди да работи отново. Камерата не може сама да съобщи това, затова бутонът по-долу казва на страницата, че сте го направили.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Включих я отново — продължаване: {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Към кои слотове стъпка 03 прилага пач',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Дума за конфигурация на стартирането',
  'banks.lastStart': 'Последно стартиране',
  'banks.nextStart': 'Следващо стартиране',
  'banks.caption': 'Трите слота на фърмуера, както ги е прочела стъпка 02',
  'banks.col.bank': 'Слот',
  'banks.col.address': 'Адрес',
  'banks.col.holds': 'Какво съдържа',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'следващо стартиране',
  'banks.choiceLabel': 'Слотове за пач',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'Слотът за следващото стартиране',
  'choice.all': 'Всички слотове',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — не се предлага',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen': 'Още не е избран слот: {what}. Изберете слот по име по-горе.',
  'banks.writes': 'Стъпка 03 записва: {what}.',
  'banks.fixed':
    'Записът е изпълнен, затова изборът е окончателен: стъпка 04 връща точно тези слотове.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: не се предлага — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'няма активна сесия — стъпка 02 започва такава',
  'banks.refusedBusy': 'изпълнява се стъпка — изберете слотовете, след като тя завърши',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'Планът — {build}, пач в {banks:acc}',
  'plan.summaryNone': 'Планът — {build}, още не е избран слот',
  'plan.yourCamera': 'вашата камера',
  'plan.intro':
    'Изготвен от собствените байтове на камерата. Нищо не се записва, докато не се изпълни стъпка 03, а стъпка 04 връща обратно всеки байт, който тя записва.',
  /* The rows; their values are core's. */
  'plan.build': 'Компилация',
  'plan.version': 'Версия на фърмуера',
  'plan.written': 'Записва се',
  'plan.route': 'Къде отива',
  'plan.restore': 'Възстановяване',
  'plan.wholeFlash': 'Пълно четене',
  'plan.outro':
    'Във формата, в която камерата съхранява данните, се променят същите байтове и никои други, така че фърмуерът на камерата се променя точно с тази разлика и с нищо друго.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'Пачът за {bank:acc}',
  'bankPlan.titleChosen': '{bank} — записва се от тази сесия',
  'bankPlan.titleNotChosen': '{bank} — не е избран',
  'bankPlan.source': 'Източник на образа',
  'bankPlan.sourceValue': '{bank}, както е съхранен',
  'bankPlan.sourceTwoReads': '{bank}, както е съхранен, две съвпадащи прочитания (sha256 {sha})',
  'bankPlan.edit': 'Промяна на образа',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) върху заводския образ. Балансът ѝ, {balance}, е в думата за корекция; пачът се балансира върху него, а стъпка 04 връща образа с тази промяна.',
  'bankPlan.factorySha': 'sha256 на заводския нешифрован образ',
  'bankPlan.patchedSha': 'sha256 с пача',
  /** Row label: how many bytes of the bank, as the flash chip stores it, the patch changes. */
  'bankPlan.diffCount': 'Променени байтове във флаш чипа',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Дължина за изпращане',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': { one: '{size} Б в {count} порция', other: '{size} Б в {count} порции' },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Дума за балансиране',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (беше {balance}, балансът на промяната)',
  'bankPlan.caption': 'Точните байтове, които пачът променя в {bank:acc}',
  'bankPlan.col.what': 'Какво променя',
  'bankPlan.col.offset': 'Отместване',
  'bankPlan.col.before': 'Преди',
  'bankPlan.col.after': 'След',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Проверено — пълно съвпадение.** След ново стартиране камерата беше прочетена отново: {read}/31 блока, {count} различаващ се байт. Флаш паметта ѝ е точно такава, каквато беше преди първия запис.',
    other:
      '**Проверено — пълно съвпадение.** След ново стартиране камерата беше прочетена отново: {read}/31 блока, {count} различаващи се байта. Флаш паметта ѝ е точно такава, каквато беше преди първия запис.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Проверено — пълно съвпадение.** След ново стартиране камерата беше прочетена отново: {read}/31 блока, {count} различаващ се байт (къси блокове: {blocks}). Флаш паметта ѝ е точно такава, каквато беше преди първия запис.',
    other:
      '**Проверено — пълно съвпадение.** След ново стартиране камерата беше прочетена отново: {read}/31 блока, {count} различаващи се байта (къси блокове: {blocks}). Флаш паметта ѝ е точно такава, каквато беше преди първия запис.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**Проверката откри разлики спрямо резервното копие.** {error}',
  unknownReason: 'неизвестна причина',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — запис в {banks:acc}?',
  'confirm.titleJump': '{phase} — прескачане на неотбелязания запис?',
  'confirm.chosenBanks': 'избраните слотове',
  'confirm.jump':
    'ЗАПИСЪТ НЕ Е ОТБЕЛЯЗАН за тази сесия и вие твърдите, че записите са минали без контролните си точки: стъпката започва след записа, вместо да записва отново. Собствените проверки на стъпките пак се изпълняват — четенето на версията, проверките на слотовете — и грешното предположение струва едно пропиляно пълно четене, а не повредена камера.',
  'confirm.jumpKeepPlugged':
    'Дръжте камерата включена и компютъра буден, докато стъпката не завърши.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Това записва малък пач в {banks:acc}. Стъпка 04 връща оригиналите. Пълното четене след това само чете.',
  'confirm.patchInOrder':
    'Това записва малък пач в {banks:acc}, в този ред — слотът, който камерата опитва първи, е последен. Стъпка 04 връща оригиналите. Пълното четене след това само чете.',
  /* Step 04. */
  'confirm.restore': 'Това записва обратно оригиналния ви фърмуер в {banks:acc}.',
  'confirm.restoreInOrder':
    'Това записва обратно оригиналния ви фърмуер в {banks:acc}, в този ред — слотът, който камерата опитва първи, е пръв.',
  'confirm.keepPlugged':
    'Дръжте камерата включена и компютъра буден, докато трае записът — прекъснат запис оставя камера, която може да бъде поправена само с хардуерен програматор (SPI или SWD/J-Link). На телефон: самолетен режим и включен екран. След това камерата се рестартира; когато страницата ви помоли, натиснете „Свързване на устройство“ и я изберете отново. Това е очаквано.',
  'confirm.yesJump': 'Да — прескачане на записа',
  'confirm.yesWrite': 'Да — запис в камерата',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'Доказателството',
  'summary.complete': 'Пълен образ (4 МБ)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'не е създаден',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'се различава от резервното копие в {differing} от {count} блок: {blocks}',
    other: 'се различава от резервното копие в {differing} от {count} блока: {blocks}',
  },
  'summary.matches': {
    one: 'съвпада с резервното копие ({count} блок)',
    other: 'съвпада с резервното копие (всички {count} блока)',
  },
  'summary.onlyInFull': 'Само в пълното четене',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} блок, до който обикновеното четене не стига: {blocks}',
    other: '{count} блока, до които обикновеното четене не стига: {blocks}',
  },
  'summary.rawDump': 'Пълното четене, както е прочетено',
  'summary.rawDumpBadge': 'същото, още с пача',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Образ на фърмуера (дешифриран, {bank})',
  'summary.verify': 'Проверка',
  'summary.toolbar': 'Действия с архива',
  'summary.download': 'Изтегляне на целия архив (файла на сесията)',

  /*
   * ---- what the run file holds (views/PreserveView, "What you get") ----
   * The file and folder names in the table stay as they are; {fill} is a byte (0xFF), {original} a file name.
   */
  'output.title': 'Какво получавате',
  'output.intro':
    'Файлът на сесията е едно изтегляне `{ext}`. Всяко запазване съдържа всичко, което сесията е създала досега, с по една папка за всяка стъпка:',
  'output.caption': 'Файлове във файла на сесията',
  'output.file': 'Файл',
  'output.what': 'Какво е',
  'output.runState':
    'записът на сесията: заредете zip архива в този раздел, за да продължите сесията или да я разгледате отново',
  'output.readme': 'какво има в zip архива и къде',
  'output.backup':
    'вашето резервно копие: 31-те блока, които заводската камера позволява, прочетени преди да бъде записано каквото и да е, всеки на адреса си във флаш паметта ({fill}, където блок не може да бъде прочетен по този начин)',
  'output.capture':
    'всеки слот на фърмуера, който сесията може да запише, както го съхранява камерата (a, b или r в името), прочетен два пъти с еднакъв резултат',
  'output.plain': 'фърмуерът от всеки от тези слотове, дешифриран',
  'output.patched':
    'за всеки слот, към който сесията прилага пач: фърмуерът му с временния пач за четене',
  'output.decrypted': 'дешифрираното резервно копие: фърмуерът на всеки слот и отчет за него',
  'output.manifest': 'подробностите за това дешифриране',
  'output.decryptReadme': 'какво съдържа това дешифриране и какви са ограниченията му',
  'output.pageBuild': 'коя версия на тази страница е изпълнила сесията',
  'output.dumpPatched':
    'целите 4 МБ, както са прочетени, с пача все още в слотовете, в които е записан',
  'output.dumpOriginal':
    'пълният образ: целите 4 МБ с върнат оригинален фърмуер — оригиналната флаш памет на вашата камера',
  'output.verify':
    '31-те блока, прочетени отново след възстановяването, подредени като резервното копие; те трябва да съвпадат с него',
  'output.grows':
    'Файлът се появява, след като стъпката, която го създава, е изпълнена, така че ранният файл на сесията съдържа само първата папка.',
  'output.keep':
    'Файлът, който трябва да пазите, е `{original}`: цялата флаш памет на камерата ви такава, каквато беше. Останалото показва как сесията е стигнала дотам.',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'По избор — за да продължите сесия по-късно',
  'runFile.title': 'Файл на сесията',
  'runFile.description':
    'Единственият запис на сесията. Изтегля се сам след всяка стъпка (и след стъпка, спряла по-рано); пазете най-новия. За да продължите по-късно или след проблем, заредете го тук и страницата продължава оттам, докъдето е стигнала.',
  'runFile.run': 'Сесия',
  'runFile.file': 'Файл',
  'runFile.lastSaved': 'Последно запазване',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'след {step} — {at} ({bytes} Б)',
  'runFile.nextStep': 'Следваща стъпка',
  'runFile.none': 'Няма активна сесия. Стъпка 02 започва такава, или заредете файл на сесията тук.',
  'runFile.toolbar': 'Действия с файла на сесията',
  'runFile.load': 'Зареждане на файл на сесията…',
  'runFile.save': 'Повторно запазване на файла на сесията',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Продължаване',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Не е избран файл на сесията.',
  'status.notRun': 'Още не е изпълнено.',
  'status.running': 'Изпълнява се …',
  'status.runningRestarts': 'Изпълнява се — камерата се рестартира по време на тази стъпка …',
  'status.restarting': 'Камерата се рестартира — това отнема около десет секунди …',
  'status.waitConnect': 'Ваш ред — натиснете „Свързване на устройство“ и изберете камерата …',
  'status.waitPlugBack':
    'Ваш ред — включете камерата отново, след това натиснете „Свързване на устройство“ …',
  'status.waitReplug': 'Ваш ред — изключете камерата и я включете отново …',
  'status.back': 'Камерата се върна — продължава се …',
  'status.swapped':
    'Спряно — камерата е сменена. Проверете я, след това изпълнете стъпката отново.',
  'status.noRun': 'Няма сесия.',
  'status.notCreated': 'Не е създадена — вижте журнала по-горе.',
  'status.refused': 'Отказано — списъкът със стъпки по-горе казва какво липсва.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} — готово. Файлът на сесията в изтеглените файлове е актуален.',
  'status.doneReplug':
    '{phase} — готово, файлът на сесията е запазен. Преди възстановяването: изключете камерата, включете я отново и натиснете „Свързване на устройство“.',
  'status.backupRefused': 'Отказано — нищо не е записано. Вижте журнала по-горе.',
  'status.failed': 'Неуспех — вижте журнала по-горе.',
  'status.cancelled': 'Отменено — файлът на сесията все още показва докъде е стигнала сесията.',
  'status.readingFile': 'Четене на файла на сесията …',
  'status.doneEarlier': 'Изпълнено по-рано — заредено от файла на сесията.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Неуспешно по-рано: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Продължено от {step}. Списъкът със стъпки продължава оттам.',
  'status.notResumed': 'Не е продължено — вижте журнала по-горе.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'нужни са: {missing}',
  'gate.noRun': 'няма активна сесия — първата стъпка я създава',
  'gate.runDone': 'тази сесия е завършена — всички стъпки са изпълнени',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'вече е направено — продължаването започва от {step}',
  'gate.banksRead': 'слотовете, които чете резервното копие',
  'gate.choice': 'избор на слотове — {why}',
  'gate.bankRefused': '{bank:nom} не може да бъде записан: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'пътят през слота за възстановяване (тази компилация работи само от {r:acc}, а не от {bank:acc})',
  'gate.backupFirst': 'резервното копие на флаш паметта (то се изпълнява първо в тази стъпка)',
  'gate.backup': 'резервното копие на флаш паметта',
  'gate.patchStep': 'стъпката за пача',
  'gate.patchOf': 'пачът за {bank:acc}',
  'gate.backupFile': 'файлът с прозорците на резервното копие',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': 'двете прочитания на {bank:acc}',
  'gate.derived': 'извлеченият образ на {bank:acc}',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'стъпката „Запис“ (първо я изпълнете или продължете от нея)',
  'gate.drainRefused': 'пълното четене отказва за {build} — {why}',
  'gate.patchSummary': 'обобщението на пача за {bank:acc} (дължината за изпращане)',
  'gate.restoreRefused':
    'възстановяването отказва за {build} — никоя форма на оригиналния фърмуер не се съхранява обратно като оригиналните байтове; сесията завършва с пълния образ и с пача на място',
  /* {file} is a file name in the run file. */
  'gate.plaintext':
    'заводският нешифрован образ на {bank:acc} ({file}, от стъпката за резервно копие)',
  'gate.restoreFirst': 'възстановяването (то се изпълнява първо в тази стъпка)',
  'gate.powerCycle':
    'потвърждението, че захранването е изключено и включено — изключете и включете камерата (извадете кабела и го поставете отново или използвайте бутона ѝ за захранване), след това използвайте бутона за повторно изпълнение',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'камерата не се върна след {minutes} мин опити: {error} — ако Chrome не попита нищо, изключете камерата, включете я отново и изпълнете стъпката отново; ако журналът е казал да я свържете отново, точно щракването върху „Свързване на устройство“ е това, което се чакаше',
} satisfies Translation<'preserve', 'bg'>;
