/**
 * Namespace `preserve`, українська (uk), translated from the English source: the "Dump & decrypt 0.x/1.x" tab, a guided run that
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
  'how.title': 'Чого очікувати',
  'how.descriptionIdle': 'Під’єднайте камеру, потім почніть із кроку 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Прогін {runId}.',
  'how.descriptionRunVersion': 'Прогін {runId} — прошивка {version}.',
  'how.restarts':
    'Під час кожного кроку камера **перезапускається**. Після перезапуску Chrome її більше не впізнає (вона не має серійного номера USB), тож сторінка попросить вас натиснути **Під’єднати пристрій** і знову вибрати камеру. Це звичайний перебіг — після цього крок продовжиться сам.',
  'how.noFile': 'Файл прошивки вибирати не потрібно: усе зчитується із самої камери.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'Камера зберігає прошивку в трьох **слотах** ({a}, {b} і {r}). Крок 02 зчитує всі три й визначає, з якого з них камера запуститься наступного разу; патч працює, лише якщо він у цьому слоті. Ви вибираєте слоти, які пропатчує крок 03, — типово той, з якого відбудеться наступний запуск, — а крок 04 відновлює кожен із них.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'Після кожного кроку браузер завантажує **файл прогону**, названий за часом початку прогону, часом збереження й досягнутим кроком (`{example}`), з окремою текою для кожного кроку всередині. Зберігайте найновіший — він дає змогу продовжити пізніше.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**Кроки 03 і 04 записують у флеш-пам’ять камери**, і перед кожним вас попросять підтвердити. Поки виконується будь-який із них, не від’єднуйте камеру (хіба що сторінка попросить її перепід’єднати) і не давайте комп’ютеру заснути; найкраще, щоб він живився від мережі. Після перерваного запису камеру зможе відновити лише апаратний програматор (SPI або SWD/J-Link).',
  'how.phone':
    '**На телефоні:** перед кроком 03 увімкніть режим польоту й вимкніть Wi-Fi та мобільні дані, щоб дзвінок чи сповіщення не відволікли браузер посеред запису, — і не давайте екрану вимкнутися. Відкрита сторінка працює й без мережі.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**Запис для цього прогону не зафіксовано, тож наступні кроки закрито.** Камера може вже працювати з пропатченим образом (запис перервався), а може й ні (запис так і не почався) — файл прогону не може довести, як саме. Не запускайте повне зчитування чи відновлення на пропатченій камері без зафіксованого запису; шлях уперед — крок 03: його перевірка перед записом зчитує слот і відмовляється вдруге записувати його наосліп. Лише якщо ця перевірка вже відмовила з повідомленням *already holds the patched bytes*, можна пройти повз запис — і для цього є окреме вікно підтвердження.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Зчитування й підготовка',
  'phase.readBuild.inSentence': 'зчитування й підготовку',
  'phase.readBuild.description':
    'Зчитує все, що віддає камера із заводською прошивкою, — 31 блок по 64 КБ — і зберігає це як вашу резервну копію, удруге зчитує кожен слот прошивки, визначає, з якого слота камера запуститься наступного разу, і готує невеликий патч, який записує наступний крок. У камеру нічого не записується. Зазвичай менш ніж хвилина. Якщо камері знадобиться перезапуск, сторінка попросить вас натиснути «Під’єднати пристрій» і знову вибрати її — так і має бути.',
  'phase.patchDump.label': 'Запис і повне зчитування',
  'phase.patchDump.inSentence': 'запис і повне зчитування',
  'phase.patchDump.description':
    'Записує невеликий тимчасовий патч у слоти прошивки, вибрані на кроці 02 (типово — у слот, з якого камера запуститься наступного разу), щоб камера могла віддати всю свою флеш-пам’ять. Потім камера перезапускається — коли сторінка попросить, натисніть «Під’єднати пристрій» і знову виберіть її — і зчитується вся флеш-пам’ять на 4 МБ. Крок 04 повертає оригінальну прошивку.',
  'phase.restoreVerify.label': 'Відновлення й перевірка',
  'phase.restoreVerify.inSentence': 'відновлення й перевірку',
  'phase.restoreVerify.description':
    'Записує назад вашу оригінальну прошивку, перезапускає камеру (коли попросять, натисніть «Під’єднати пристрій» і знову виберіть її), а потім ще раз зчитує все, щоб перевірити, що воно побайтово збігається з резервною копією.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Зчитує 31 блок по 64 КБ, доступні на камері із заводською прошивкою, потім удруге зчитує кожен слот (обидва зчитування мають побайтово збігтися), дістає прошивку кожного слота з того, що зберігає камера (розшифровує, якщо вона зберігається зашифрованою), перевіряє її і визначає, з якого слота камера запуститься наступного разу. Це єдина копія цієї камери в прогоні, знята до будь-якого запису.',
  'step.patch.description':
    'Офлайн, без камери. Будує патч для кожного слота, який прогін може записати: патч дає змогу зчитати всю флеш-пам’ять на 4 МБ, і записується він у тій формі, у якій його зберігає камера, тож змінюються лише байти самого патча.',
  'step.commit.description':
    'Запис. Спершу ще раз зчитує кожен вибраний слот і нічого не записує, якщо хоч один із них уже не містить того, що зафіксувала резервна копія (запис, який уже відбувся, ніколи не повторюється), потім записує кожен, а слот, який камера пробує першим, — останнім. Камера тут не перезапускається: її перезапускає наступний крок.',
  'step.drain.description':
    'Перезапускає камеру, щоб вона запустила пропатчену прошивку (близько десяти секунд камера мовчить; сторінка чекає й знаходить її знову), перевіряє, з якого слота вона запустилася (слот без патча зупиняє крок ще до будь-якого зчитування), потім зчитує всю флеш-пам’ять на 4 МБ за одне зчитування й вставляє у збережений образ оригінальну прошивку кожного записаного слота з резервної копії. Нічого не записується.',
  'step.restore.description':
    'Другий запис. Записує назад оригінальну прошивку кожного записаного слота, поки ще працює пропатчена прошивка, потім перезапускає камеру.',
  'step.verify.description':
    'Після нового запуску знову зчитує 31 блок, серед яких і всі слоти: 0 відмінних байтів доводить, що флеш-пам’ять камери побайтово ідентична резервній копії. Лише читання.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Почати {phase}',
  'phase.retry': 'Повторити {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Перейти до кроку 04: відновити слоти',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Пройти повз незафіксований запис',
  'phase.skipWrite': 'Пропустити запис — почати з повного зчитування',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': '{phase}: дії',
  /* The badges beside the step's title. */
  'badge.writes': 'записує в камеру',
  'badge.running': 'Виконується',
  'badge.done': 'Готово',
  'badge.plannedStop': 'Зупинено за планом — далі відновлення',
  'badge.failed': 'Зупинено — див. журнал',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Наступний',
  /* Why the start button is off. */
  'notReady.noRun': 'Доступно після кроку 02 — він починає прогін.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Доступно після кроку {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Ще не готово — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Стосується пропатченої камери, поки запис не зафіксовано, — камера, можливо, вже пропатчена. Див. примітку під «{section}».',
  'phase.noDrain':
    'Повне зчитування не виконувалося — цей крок поверне камеру в попередній стан без нього. Спершу виконайте крок 03, хіба що повне зчитування вам не потрібне.',
  'phase.keepPlugged':
    'Не від’єднуйте камеру й не давайте комп’ютеру заснути, доки цей крок не завершиться.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Хід виконання',
  'phase.showDetails': 'Показувати подробиці в журналі',
  'phase.inDetail': 'Що робить цей крок, докладно',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Ваша черга',
  'yourTurn.reconnect.title': 'Ваша черга: натисніть «Під’єднати пристрій» і виберіть камеру.',
  'yourTurn.reconnect.body':
    'Камера перезапустилася, як і заплановано. Chrome не може сам упізнати її знову (вона не має серійного номера USB), тож вам треба вибрати її ще раз. Щойно ви це зробите, крок продовжиться.',
  'yourTurn.replug.title':
    'Ваша черга: від’єднайте камеру, під’єднайте її знову, потім натисніть «Під’єднати пристрій».',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'Патч цього прогону створено до виправлення зчитувача, тож перед відновленням камеру треба наново ввімкнути. Файл прогону вже збережено.',
  'yourTurn.replugBeforeRestore.title':
    'Перед кроком 04: від’єднайте камеру, під’єднайте її знову, потім натисніть «Під’єднати пристрій».',
  'yourTurn.powerCycle.title':
    'Ваша черга: від’єднайте камеру, під’єднайте її знову, натисніть «Під’єднати пристрій» — і спробуйте ще раз.',
  'yourTurn.powerCycle.body':
    'Камеру треба наново ввімкнути, інакше її зчитувач не зможе зчитати її знову. Прогін досі завантажено тут; нічого не втрачено.',
  'yourTurn.powerCycleAssert.title':
    'Ваша черга: від’єднайте камеру, під’єднайте її знову, натисніть «Під’єднати пристрій» — потім продовжуйте.',
  'yourTurn.powerCycleAssert.body':
    'Остання спроба резервного копіювання зупинилася, і камеру треба наново ввімкнути, перш ніж вона запрацює знову. Сама камера про це повідомити не може, тож кнопка нижче повідомляє сторінці, що ви це зробили.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Камеру перепід’єднано — продовжити {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Які слоти пропатчує крок 03',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Слово конфігурації запуску',
  'banks.lastStart': 'Останній запуск',
  'banks.nextStart': 'Наступний запуск',
  'banks.caption': 'Три слоти прошивки, як їх зчитав крок 02',
  'banks.col.bank': 'Слот',
  'banks.col.address': 'Адреса',
  'banks.col.holds': 'Що містить',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'наступний запуск',
  'banks.choiceLabel': 'Слоти для патча',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'Слот наступного запуску',
  'choice.all': 'Усі слоти',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — недоступно',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen': 'Слот ще не вибрано: {what}. Виберіть слот за назвою вище.',
  'banks.writes': 'Крок 03 записує {what}.',
  'banks.fixed': 'Запис уже виконано, тож вибір зафіксовано: крок 04 відновить саме ці слоти.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: недоступно — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'немає активного прогону — його починає крок 02',
  'banks.refusedBusy': 'виконується крок — виберіть слоти, коли він завершиться',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'План — {build}, патч для {banks:gen}',
  'plan.summaryNone': 'План — {build}, слот ще не вибрано',
  'plan.yourCamera': 'ваша камера',
  'plan.intro':
    'Виведено з байтів самої камери. Нічого не записується, доки не виконано крок 03, а крок 04 повертає на місце кожен записаний ним байт.',
  /* The rows; their values are core's. */
  'plan.build': 'Збірка',
  'plan.version': 'Версія прошивки',
  'plan.written': 'Записується',
  'plan.route': 'Куди',
  'plan.restore': 'Відновлення',
  'plan.wholeFlash': 'Повне зчитування',
  'plan.outro':
    'У формі, у якій зберігає камера, змінюються ті самі байти й жодні інші, тож прошивка камери змінюється рівно на цю різницю й ні на що більше.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'Патч {bank:gen}',
  'bankPlan.titleChosen': '{bank} — записує цей прогін',
  'bankPlan.titleNotChosen': '{bank} — не вибрано',
  'bankPlan.source': 'Джерело образу',
  'bankPlan.sourceValue': '{bank} у збереженому вигляді',
  'bankPlan.sourceTwoReads': '{bank} у збереженому вигляді, два однакові зчитування (sha256 {sha})',
  'bankPlan.edit': 'Зміна образу',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) у заводському образі. Її баланс, {balance}, — у слові коригування; патч балансується поверх нього, а крок 04 повертає образ разом із цією зміною.',
  'bankPlan.factorySha': 'sha256 заводського образу',
  'bankPlan.patchedSha': 'sha256 після патча',
  'bankPlan.diffCount': 'Змінені байти на мікросхемі',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Довжина для передавання',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    one: '{size} Б, {count} частина',
    few: '{size} Б, {count} частини',
    many: '{size} Б, {count} частин',
    other: '{size} Б, {count} частини',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Слово балансу',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (було {balance}, баланс зміни)',
  'bankPlan.caption': 'Точні байти, які патч змінює в {bank:loc}',
  'bankPlan.col.what': 'Що змінює',
  'bankPlan.col.offset': 'Зміщення',
  'bankPlan.col.before': 'До',
  'bankPlan.col.after': 'Після',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Перевірено — повний збіг.** Після нового запуску камеру зчитано ще раз: блоків {read}/31, відмінних байтів: {count}. Її флеш-пам’ять точно така, якою була до першого запису.',
    few: '**Перевірено — повний збіг.** Після нового запуску камеру зчитано ще раз: блоків {read}/31, відмінних байтів: {count}. Її флеш-пам’ять точно така, якою була до першого запису.',
    many: '**Перевірено — повний збіг.** Після нового запуску камеру зчитано ще раз: блоків {read}/31, відмінних байтів: {count}. Її флеш-пам’ять точно така, якою була до першого запису.',
    other:
      '**Перевірено — повний збіг.** Після нового запуску камеру зчитано ще раз: блоків {read}/31, відмінних байтів: {count}. Її флеш-пам’ять точно така, якою була до першого запису.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Перевірено — повний збіг.** Після нового запуску камеру зчитано ще раз: блоків {read}/31, відмінних байтів: {count} (короткі блоки: {blocks}). Її флеш-пам’ять точно така, якою була до першого запису.',
    few: '**Перевірено — повний збіг.** Після нового запуску камеру зчитано ще раз: блоків {read}/31, відмінних байтів: {count} (короткі блоки: {blocks}). Її флеш-пам’ять точно така, якою була до першого запису.',
    many: '**Перевірено — повний збіг.** Після нового запуску камеру зчитано ще раз: блоків {read}/31, відмінних байтів: {count} (короткі блоки: {blocks}). Її флеш-пам’ять точно така, якою була до першого запису.',
    other:
      '**Перевірено — повний збіг.** Після нового запуску камеру зчитано ще раз: блоків {read}/31, відмінних байтів: {count} (короткі блоки: {blocks}). Її флеш-пам’ять точно така, якою була до першого запису.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**Перевірка виявила відмінності від резервної копії.** {error}',
  unknownReason: 'невідома причина',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — записати в {banks:acc}?',
  'confirm.titleJump': '{phase} — пройти повз незафіксований запис?',
  'confirm.chosenBanks': 'вибрані слоти',
  'confirm.jump':
    'ЗАПИС ДЛЯ ЦЬОГО ПРОГОНУ НЕ ЗАФІКСОВАНО, і ви стверджуєте, що записи відбулися без своїх контрольних точок: крок почнеться після запису, а не запише ще раз. Власні перевірки кроків однаково виконуються — зчитування версії, перевірки слотів, — і хибне припущення коштуватиме лише марного повного зчитування, а не зіпсованої камери.',
  'confirm.jumpKeepPlugged':
    'Не від’єднуйте камеру й не давайте комп’ютеру заснути, доки крок не завершиться.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Це записує невеликий патч у {banks:acc}. Крок 04 поверне оригінали. Повне зчитування, що йде далі, лише читає.',
  'confirm.patchInOrder':
    'Це записує невеликий патч у {banks:acc}, саме в такому порядку — слот, який камера пробує першим, іде останнім. Крок 04 поверне оригінали. Повне зчитування, що йде далі, лише читає.',
  /* Step 04. */
  'confirm.restore': 'Це записує вашу оригінальну прошивку назад у {banks:acc}.',
  'confirm.restoreInOrder':
    'Це записує вашу оригінальну прошивку назад у {banks:acc}, саме в такому порядку — слот, який камера пробує першим, іде першим.',
  'confirm.keepPlugged':
    'Не від’єднуйте камеру й не давайте комп’ютеру заснути під час запису — після перерваного запису камеру зможе відновити лише апаратний програматор (SPI або SWD/J-Link). На телефоні ввімкніть режим польоту й не давайте екрану вимкнутися. Потім камера перезапуститься; коли сторінка попросить, натисніть «Під’єднати пристрій» і знову виберіть її. Так і має бути.',
  'confirm.yesJump': 'Так — пройти повз запис',
  'confirm.yesWrite': 'Так — записати в камеру',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'Доказ',
  'summary.complete': 'Повний образ (4 МБ)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'не створено',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'відрізняється від резервної копії в {differing} із {count} блока: {blocks}',
    few: 'відрізняється від резервної копії в {differing} із {count} блоків: {blocks}',
    many: 'відрізняється від резервної копії в {differing} із {count} блоків: {blocks}',
    other: 'відрізняється від резервної копії в {differing} із {count} блоків: {blocks}',
  },
  'summary.matches': {
    one: 'збігається з резервною копією ({count} блок)',
    few: 'збігається з резервною копією (усі {count} блоки)',
    many: 'збігається з резервною копією (усі {count} блоків)',
    other: 'збігається з резервною копією (усі {count} блока)',
  },
  'summary.onlyInFull': 'Лише в повному зчитуванні',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} блок, недосяжний для звичайного зчитування: {blocks}',
    few: '{count} блоки, недосяжні для звичайного зчитування: {blocks}',
    many: '{count} блоків, недосяжних для звичайного зчитування: {blocks}',
    other: '{count} блока, недосяжні для звичайного зчитування: {blocks}',
  },
  'summary.rawDump': 'Повне зчитування, як є',
  'summary.rawDumpBadge': 'те саме, але з патчем',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Образ прошивки (розшифрований, {bank})',
  'summary.verify': 'Перевірка',
  'summary.toolbar': 'Дії з архівом',
  'summary.download': 'Завантажити повний архів (файл прогону)',

  /* ---- what the run file holds (views/PreserveView) ---- */
  'output.title': 'Що ви отримаєте',
  'output.intro':
    'Файл прогону — це одне завантаження `{ext}`. Кожне збереження містить усе, що прогін створив на той момент, по одній теці на крок:',
  'output.caption': 'Файли у файлі прогону',
  'output.file': 'Файл',
  'output.what': 'Що це',
  'output.runState':
    'запис про прогін: завантажте цей zip на цій вкладці, щоб продовжити прогін або знову його переглянути',
  'output.readme': 'що лежить у zip-архіві та де',
  'output.backup':
    'ваша резервна копія: 31 блок, який віддає камера із заводською прошивкою, зчитаний до будь-якого запису, кожен за своєю адресою у флеш-пам’яті ({fill} там, де блок так зчитати не можна)',
  'output.capture':
    'кожен слот прошивки, який прогін може записати, у тому вигляді, у якому його зберігає камера (a, b або r в імені), зчитаний двічі зі збіжними результатами',
  'output.plain': 'прошивка з кожного з цих слотів, розшифрована',
  'output.patched':
    'для кожного слота, який прогін патчить: його прошивка з тимчасовим патчем для читання',
  'output.decrypted': 'розшифрована резервна копія: прошивка кожного слота і звіт про неї',
  'output.manifest': 'подробиці цього розшифрування',
  'output.decryptReadme': 'що містить це розшифрування і які в нього обмеження',
  'output.pageBuild': 'яка збірка цієї сторінки виконала прогін',
  'output.dumpPatched':
    'усі 4 МБ так, як їх зчитано, з патчем, що досі лишається в записаних слотах',
  'output.dumpOriginal':
    'повний образ: усі 4 МБ із поверненою на місце оригінальною прошивкою — оригінальна флеш-пам’ять вашої камери',
  'output.verify':
    '31 блок, зчитаний повторно після відновлення і розкладений так само, як резервна копія; він має з нею збігатися',
  'output.grows':
    'Файл з’являється лише після того, як виконано крок, що його створює, тож ранній файл прогону містить лише першу теку.',
  'output.keep':
    'Збережіть `{original}`: це вся флеш-пам’ять вашої камери в початковому вигляді. Решта показує, як прогін до цього дійшов.',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Необов’язково — щоб продовжити прогін пізніше',
  'runFile.title': 'Файл прогону',
  'runFile.description':
    'Єдиний запис прогону. Він завантажується сам після кожного кроку (і після кроку, що зупинився раніше часу); зберігайте найновіший. Щоб продовжити пізніше чи після проблеми, відкрийте його тут, і сторінка продовжить з того місця, де зупинилася.',
  'runFile.run': 'Прогін',
  'runFile.file': 'Файл',
  'runFile.lastSaved': 'Востаннє збережено',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'після {step} — {at} ({bytes} Б)',
  'runFile.nextStep': 'Наступний крок',
  'runFile.none': 'Немає активного прогону. Його починає крок 02, або відкрийте файл прогону тут.',
  'runFile.toolbar': 'Дії з файлом прогону',
  'runFile.load': 'Відкрити файл прогону…',
  'runFile.save': 'Зберегти файл прогону ще раз',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Продовження',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Файл прогону не вибрано.',
  'status.notRun': 'Ще не виконувалося.',
  'status.running': 'Виконується …',
  'status.runningRestarts': 'Виконується — під час цього кроку камера перезапускається …',
  'status.restarting': 'Камера перезапускається — це займає близько десяти секунд …',
  'status.waitConnect': 'Чекаємо на вас — натисніть «Під’єднати пристрій» і виберіть камеру …',
  'status.waitPlugBack':
    'Чекаємо на вас — під’єднайте камеру знову, потім натисніть «Під’єднати пристрій» …',
  'status.waitReplug': 'Чекаємо на вас — від’єднайте камеру й під’єднайте знову …',
  'status.back': 'Камера повернулася — продовжуємо …',
  'status.swapped': 'Зупинено — камеру змінено. Перевірте її, потім запустіть етап ще раз.',
  'status.noRun': 'Немає прогону.',
  'status.notCreated': 'Не створено — див. журнал вище.',
  'status.refused': 'Відхилено — у списку етапів вище сказано, чого бракує.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} — готово. Файл прогону у ваших завантаженнях актуальний.',
  'status.doneReplug':
    '{phase} — готово, файл прогону збережено. Перед відновленням: від’єднайте камеру, під’єднайте знову й натисніть «Під’єднати пристрій».',
  'status.backupRefused': 'Відхилено — нічого не записано. Див. журнал вище.',
  'status.failed': 'Помилка — див. журнал вище.',
  'status.cancelled': 'Скасовано — файл прогону й далі показує, де прогін зупинився.',
  'status.readingFile': 'Читання файлу прогону …',
  'status.doneEarlier': 'Виконано раніше — завантажено з файлу прогону.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Раніше завершилося помилкою: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Продовжено з {step}. Список етапів продовжується звідти.',
  'status.notResumed': 'Не продовжено — див. журнал вище.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'потрібно: {missing}',
  'gate.noRun': 'немає активного прогону — його створює перший етап',
  'gate.runDone': 'цей прогін завершено — усі етапи виконано',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'уже виконано — продовження почнеться з {step}',
  'gate.banksRead': 'слоти, які зчитує резервне копіювання',
  'gate.choice': 'вибір слотів — {why}',
  'gate.bankRefused': '{bank} не можна записати: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'маршрут через слот відновлення (ця збірка запускається лише зі {r:gen}, а не зі {bank:gen})',
  'gate.backupFirst': 'резервна копія флеш-пам’яті (вона виконується першою на цьому етапі)',
  'gate.backup': 'резервна копія флеш-пам’яті',
  'gate.patchStep': 'крок патча',
  'gate.patchOf': 'патч {bank:gen}',
  'gate.backupFile': 'файл вікон резервної копії',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': 'знімок {bank:gen}',
  'gate.derived': 'отриманий образ {bank:gen}',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'крок «Запис» (спершу виконайте його або продовжте з нього)',
  'gate.drainRefused': 'повне зчитування відмовляє (збірка: {build}) — {why}',
  'gate.patchSummary': 'підсумок патча {bank:gen} (довжина для передавання)',
  'gate.restoreRefused':
    'відновлення відмовляє (збірка: {build}) — жодна форма оригінальної прошивки не зберігається назад як оригінальні байти; прогін завершується повним образом, а патч лишається на місці',
  /* {file} is a file name in the run file. */
  'gate.plaintext':
    'заводський розшифрований образ {bank:gen} ({file}, із кроку резервного копіювання)',
  'gate.restoreFirst': 'відновлення (воно виконується першим на цьому етапі)',
  'gate.powerCycle':
    'підтвердження, що живлення вимикали — вимкніть і ввімкніть живлення камери (від’єднайте й під’єднайте її знову або скористайтеся її вимикачем), потім скористайтеся кнопкою повторного запуску',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'камера не повернулася після {minutes} хв спроб: {error} — якщо Chrome нічого не запитував, перепід’єднайте камеру й запустіть етап ще раз; якщо журнал просив під’єднати її знову, сторінка чекала саме натискання «Під’єднати пристрій»',
} satisfies Translation<'preserve', 'uk'>;
