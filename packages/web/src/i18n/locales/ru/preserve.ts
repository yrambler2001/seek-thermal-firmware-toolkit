/**
 * Namespace `preserve`, русский (ru), translated from the English source: the "Dump & decrypt 0.x/1.x" tab, a guided run that
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
  'how.title': 'Чего ожидать',
  'how.descriptionIdle': 'Подключите камеру, затем начните с шага 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Прогон {runId}.',
  'how.descriptionRunVersion': 'Прогон {runId} — прошивка {version}.',
  'how.restarts':
    'Во время каждого шага камера **перезапускается**. После перезапуска Chrome её больше не узнаёт (у неё нет серийного номера USB), поэтому страница просит вас нажать **Подключить устройство** и снова выбрать камеру. Это нормальный ход работы — после этого шаг продолжится сам.',
  'how.noFile': 'Файл прошивки выбирать не нужно: всё считывается с самой камеры.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'Камера хранит прошивку в трёх **слотах** ({a}, {b} и {r}). Шаг 02 считывает все три и определяет, с какого из них камера запустится в следующий раз; патч работает, только если он записан в этот слот. Вы выбираете слоты, которые патчит шаг 03, — по умолчанию тот, с которого пойдёт следующий запуск, — а шаг 04 возвращает на место каждый из них.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'После каждого шага браузер скачивает **файл прогона**, в имени которого время начала прогона, время сохранения и достигнутый шаг (`{example}`), а внутри — по папке на каждый шаг. Храните самый новый — по нему можно продолжить позже.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**Шаги 03 и 04 записывают во флеш-память камеры**, и перед каждым из них страница просит подтверждения. Пока один из них выполняется, не отключайте камеру (если только страница не попросит переподключить её) и не давайте компьютеру уснуть; лучше всего — с питанием от сети. Прерванная запись оставляет камеру, которую исправит только аппаратный программатор (SPI или SWD/J-Link).',
  'how.phone':
    '**На телефоне:** перед шагом 03 включите режим полёта и отключите Wi-Fi и мобильные данные, чтобы звонок или уведомление не увели браузер посреди записи, — и не давайте экрану погаснуть. Открытая страница продолжает работать без сети.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**Запись для этого прогона не зафиксирована, поэтому следующие за ней шаги закрыты.** Камера может уже работать на пропатченном образе (запись прервалась), а может и нет (запись так и не началась) — по файлу прогона этого не доказать. Не запускайте полное считывание и восстановление на пропатченной камере, пока запись не зафиксирована; путь вперёд — шаг 03: его проверка перед записью считывает слот и не даст записать его вслепую ещё раз. Переход вперёд применяется, только если эта проверка уже отказала с сообщением *already holds the patched bytes*, — и через собственный диалог.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Считывание и сборка',
  'phase.readBuild.inSentence': 'считывание и сборку',
  'phase.readBuild.description':
    'Считывает всё, что отдаёт заводская камера, — 31 блок по 64 КБ — и сохраняет это как вашу резервную копию, считывает каждый слот прошивки второй раз, определяет, с какого слота камера запустится в следующий раз, и готовит небольшой патч, который запишет следующий шаг. В камеру ничего не записывается. Обычно меньше минуты. Если по ходу камере понадобится перезапуск, страница попросит нажать «Подключить устройство» и снова выбрать её — так и должно быть.',
  'phase.patchDump.label': 'Запись и полное считывание',
  'phase.patchDump.inSentence': 'запись и полное считывание',
  'phase.patchDump.description':
    'Записывает небольшой временный патч в слоты прошивки, выбранные на шаге 02 (по умолчанию в слот, с которого камера запустится в следующий раз), чтобы можно было считать всю её флеш-память. Затем камера перезапускается — когда страница попросит, нажмите «Подключить устройство» и снова выберите её, — и считываются все 4 МБ флеш-памяти. Шаг 04 возвращает исходную прошивку на место.',
  'phase.restoreVerify.label': 'Восстановление и сверка',
  'phase.restoreVerify.inSentence': 'восстановление и сверку',
  'phase.restoreVerify.description':
    'Записывает вашу исходную прошивку обратно, перезапускает камеру (когда попросят, нажмите «Подключить устройство» и снова выберите её), затем ещё раз всё считывает и проверяет, что всё побайтно совпадает с резервной копией.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Считывает 31 блок по 64 КБ, доступный заводской камере, затем второй раз считывает каждый слот (оба считывания должны побайтно совпасть), извлекает прошивку каждого слота из того, что хранит камера (расшифровывая, если она хранится зашифрованной), проверяет её и определяет, с какого слота камера запустится в следующий раз. Это единственная копия этой камеры в прогоне, снятая до того, как что-либо будет записано.',
  'step.patch.description':
    'Без камеры. Собирает патч для каждого слота, который прогон может записать: патч позволяет чтению камеры достать всю флеш-память 4 МБ и записывается в той форме, в какой его хранит камера, так что меняются только байты самого патча.',
  'step.commit.description':
    'Запись. Сначала заново считывает каждый выбранный слот и ничего не записывает, если хоть один из них уже не содержит того, что зафиксировала резервная копия (уже состоявшаяся запись никогда не повторяется), затем записывает каждый из них, причём слот, который камера пробует первым, — последним. Здесь камера не перезапускается: её перезапускает следующий шаг.',
  'step.drain.description':
    'Перезапускает камеру, чтобы она запустила пропатченную прошивку (около десяти секунд она молчит; страница ждёт и снова её находит), проверяет, с какого слота она запустилась (слот без патча останавливает шаг до какого-либо считывания), затем считывает всю флеш-память 4 МБ за одно чтение и вставляет в сохранённый образ исходную прошивку каждого записанного слота из резервной копии. Ничего не записывается.',
  'step.restore.description':
    'Вторая запись. Записывает обратно исходную прошивку каждого записанного слота, пока ещё работает пропатченная прошивка, затем перезапускает камеру.',
  'step.verify.description':
    'После нового включения снова считывает 31 блок, в том числе все слоты: 0 различающихся байтов доказывает, что флеш-память камеры побайтно совпадает с резервной копией. Только чтение.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Начать {phase}',
  'phase.retry': 'Повторить {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Перейти к шагу 04: восстановить слоты',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Пройти мимо незафиксированной записи',
  'phase.skipWrite': 'Пропустить запись — начать с полного считывания',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': 'Действия этапа «{phase}»',
  /* The badges beside the step's title. */
  'badge.writes': 'пишет в камеру',
  'badge.running': 'Выполняется',
  'badge.done': 'Готово',
  'badge.plannedStop': 'Остановлено по плану — дальше восстановление',
  'badge.failed': 'Остановлено — смотрите журнал',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Следующий',
  /* Why the start button is off. */
  'notReady.noRun': 'Станет доступно после шага 02 — он начинает прогон.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Станет доступно после шага {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Пока не готово — {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Касается пропатченной камеры, пока запись не зафиксирована: камера, возможно, уже пропатчена. Смотрите примечание в разделе «{section}».',
  'phase.noDrain':
    'Полное считывание не выполнялось — этот шаг вернёт камеру в исходное состояние без него. Сначала выполните шаг 03, если только полное считывание вам не важно.',
  'phase.keepPlugged':
    'Не отключайте камеру и не давайте компьютеру уснуть, пока этот шаг не завершится.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Ход выполнения',
  'phase.showDetails': 'Подробности в журнале',
  'phase.inDetail': 'Что делает этот шаг, подробно',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Ваш ход',
  'yourTurn.reconnect.title': 'Ваш ход: нажмите «Подключить устройство» и выберите камеру.',
  'yourTurn.reconnect.body':
    'Камера перезапустилась, как и было задумано. Chrome не может сам снова её узнать (у неё нет серийного номера USB), поэтому вам нужно выбрать её ещё раз. Шаг продолжится, как только вы это сделаете.',
  'yourTurn.replug.title':
    'Ваш ход: отключите камеру, подключите её снова, затем нажмите «Подключить устройство».',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'Патч этого прогона сделан до исправления чтения, поэтому перед восстановлением камеру нужно заново включить. Файл прогона уже сохранён.',
  'yourTurn.replugBeforeRestore.title':
    'Перед шагом 04: отключите камеру, подключите её снова, затем нажмите «Подключить устройство».',
  'yourTurn.powerCycle.title':
    'Ваш ход: отключите камеру, подключите её снова, нажмите «Подключить устройство» — и попробуйте ещё раз.',
  'yourTurn.powerCycle.body':
    'Чтобы камеру можно было считать снова, её нужно заново включить. Прогон по-прежнему загружен здесь; ничего не потеряно.',
  'yourTurn.powerCycleAssert.title':
    'Ваш ход: отключите камеру, подключите её снова, нажмите «Подключить устройство» — и продолжите.',
  'yourTurn.powerCycleAssert.body':
    'Последняя попытка резервного копирования остановилась, и перед следующим запуском камеру нужно заново включить. Сама камера сообщить об этом не может, поэтому кнопка ниже говорит странице, что вы это сделали.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Камера переподключена — продолжить {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'Какие слоты патчит шаг 03',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Слово конфигурации запуска',
  'banks.lastStart': 'Последний запуск',
  'banks.nextStart': 'Следующий запуск',
  'banks.caption': 'Три слота прошивки в том виде, в каком их считал шаг 02',
  'banks.col.bank': 'Слот',
  'banks.col.address': 'Адрес',
  'banks.col.holds': 'Что в нём',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'следующий запуск',
  'banks.choiceLabel': 'Слоты для патча',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'Слот следующего запуска',
  'choice.all': 'Все слоты',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — не предлагается',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen': 'Слот пока не выбран: {what}. Выберите слот по имени выше.',
  'banks.writes': 'Шаг 03 записывает: {what}.',
  'banks.fixed':
    'Запись уже выполнена, поэтому выбор зафиксирован: шаг 04 вернёт на место именно эти слоты.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: не предлагается — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'нет активного прогона — его начинает шаг 02',
  'banks.refusedBusy': 'выполняется шаг — выберите слоты, когда он закончится',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'План — {build}, патчит {banks:acc}',
  'plan.summaryNone': 'План — {build}, слот ещё не выбран',
  'plan.yourCamera': 'ваша камера',
  'plan.intro':
    'Составлен по собственным байтам камеры. Ничего не записывается, пока не выполнен шаг 03, а шаг 04 возвращает на место каждый записанный им байт.',
  /* The rows; their values are core's. */
  'plan.build': 'Сборка',
  'plan.version': 'Версия прошивки',
  'plan.written': 'Записывается',
  'plan.route': 'Куда пишется',
  'plan.restore': 'Восстановление',
  'plan.wholeFlash': 'Полное считывание',
  'plan.outro':
    'В той форме, в какой хранит камера, меняются те же байты и никакие другие, так что прошивка камеры меняется ровно на эту разницу и ни на что больше.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'Патч {bank:gen}',
  'bankPlan.titleChosen': '{bank} — записывается этим прогоном',
  'bankPlan.titleNotChosen': '{bank} — не выбран',
  'bankPlan.source': 'Источник образа',
  'bankPlan.sourceValue': '{bank} в том виде, в каком хранится',
  'bankPlan.sourceTwoReads':
    '{bank} в том виде, в каком хранится, два совпавших считывания (sha256 {sha})',
  'bankPlan.edit': 'Правка образа',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) поверх заводского образа. Её балансировка, {balance}, находится в слове коррекции; патч балансируется поверх неё, а шаг 04 возвращает образ вместе с этой правкой.',
  'bankPlan.factorySha': 'sha256 заводского незашифрованного образа',
  'bankPlan.patchedSha': 'sha256 после патча',
  'bankPlan.diffCount': 'Меняющиеся байты в микросхеме',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Длина для передачи',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    one: '{size} Б в {count} порции',
    few: '{size} Б в {count} порциях',
    many: '{size} Б в {count} порциях',
    other: '{size} Б в {count} порциях',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Слово балансировки',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (было {balance}, балансировка правки)',
  'bankPlan.caption': 'Точные байты, которые патч меняет в {bank:loc}',
  'bankPlan.col.what': 'Что меняет',
  'bankPlan.col.offset': 'Смещение',
  'bankPlan.col.before': 'До',
  'bankPlan.col.after': 'После',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Сверка пройдена — полное совпадение.** После нового включения камера считана ещё раз: блоков {read}/31, различается {count} байт. Её флеш-память ровно такая же, какой была до первой записи.',
    few: '**Сверка пройдена — полное совпадение.** После нового включения камера считана ещё раз: блоков {read}/31, различаются {count} байта. Её флеш-память ровно такая же, какой была до первой записи.',
    many: '**Сверка пройдена — полное совпадение.** После нового включения камера считана ещё раз: блоков {read}/31, различается {count} байт. Её флеш-память ровно такая же, какой была до первой записи.',
    other:
      '**Сверка пройдена — полное совпадение.** После нового включения камера считана ещё раз: блоков {read}/31, различающихся байтов: {count}. Её флеш-память ровно такая же, какой была до первой записи.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Сверка пройдена — полное совпадение.** После нового включения камера считана ещё раз: блоков {read}/31, различается {count} байт (короткие блоки: {blocks}). Её флеш-память ровно такая же, какой была до первой записи.',
    few: '**Сверка пройдена — полное совпадение.** После нового включения камера считана ещё раз: блоков {read}/31, различаются {count} байта (короткие блоки: {blocks}). Её флеш-память ровно такая же, какой была до первой записи.',
    many: '**Сверка пройдена — полное совпадение.** После нового включения камера считана ещё раз: блоков {read}/31, различается {count} байт (короткие блоки: {blocks}). Её флеш-память ровно такая же, какой была до первой записи.',
    other:
      '**Сверка пройдена — полное совпадение.** После нового включения камера считана ещё раз: блоков {read}/31, различающихся байтов: {count} (короткие блоки: {blocks}). Её флеш-память ровно такая же, какой была до первой записи.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**Сверка нашла отличия от резервной копии.** {error}',
  unknownReason: 'причина неизвестна',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase} — записать в {banks:acc}?',
  'confirm.titleJump': '{phase} — пройти мимо незафиксированной записи?',
  'confirm.chosenBanks': 'выбранные слоты',
  'confirm.jump':
    'ЗАПИСЬ ДЛЯ ЭТОГО ПРОГОНА НЕ ЗАФИКСИРОВАНА, и вы утверждаете, что запись состоялась без своих контрольных точек: шаг начнётся после записи, а не запишет ещё раз. Собственные проверки шагов всё равно выполняются — чтение версии, проверки слотов, — и ошибочное предположение обойдётся впустую потраченным полным считыванием, а не камерой, которая перестала запускаться.',
  'confirm.jumpKeepPlugged':
    'Не отключайте камеру и не давайте компьютеру уснуть, пока шаг не завершится.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Это записывает небольшой патч в {banks:acc}. Шаг 04 вернёт исходные образы на место. Следующее за этим полное считывание только читает.',
  'confirm.patchInOrder':
    'Это записывает небольшой патч в {banks:acc}, в таком порядке: слот, который камера пробует первым, идёт последним. Шаг 04 вернёт исходные образы на место. Следующее за этим полное считывание только читает.',
  /* Step 04. */
  'confirm.restore': 'Это записывает вашу исходную прошивку обратно в {banks:acc}.',
  'confirm.restoreInOrder':
    'Это записывает вашу исходную прошивку обратно в {banks:acc}, в таком порядке: слот, который камера пробует первым, идёт первым.',
  'confirm.keepPlugged':
    'Пока идёт запись, не отключайте камеру и не давайте компьютеру уснуть: прерванная запись оставляет камеру, которую исправит только аппаратный программатор (SPI или SWD/J-Link). На телефоне — режим полёта и не гаснущий экран. Затем камера перезапустится; когда страница попросит, нажмите «Подключить устройство» и снова выберите её. Так и должно быть.',
  'confirm.yesJump': 'Да — пройти мимо записи',
  'confirm.yesWrite': 'Да — записать в камеру',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'Доказательство',
  'summary.complete': 'Полный образ (4 МБ)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'не создан',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'отличается от резервной копии в {differing} из {count} блока: {blocks}',
    few: 'отличается от резервной копии в {differing} из {count} блоков: {blocks}',
    many: 'отличается от резервной копии в {differing} из {count} блоков: {blocks}',
    other: 'отличается от резервной копии в {differing} из {count} блока: {blocks}',
  },
  'summary.matches': {
    one: 'совпадает с резервной копией ({count} блок)',
    few: 'совпадает с резервной копией (все {count} блока)',
    many: 'совпадает с резервной копией (все {count} блоков)',
    other: 'совпадает с резервной копией (все {count} блока)',
  },
  'summary.onlyInFull': 'Есть только в полном считывании',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} блок, недоступный обычному считыванию: {blocks}',
    few: '{count} блока, недоступных обычному считыванию: {blocks}',
    many: '{count} блоков, недоступных обычному считыванию: {blocks}',
    other: '{count} блока, недоступных обычному считыванию: {blocks}',
  },
  'summary.rawDump': 'Полное считывание, как считано',
  'summary.rawDumpBadge': 'то же, но с ещё не убранным патчем',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Образ прошивки (расшифрованный, {bank})',
  'summary.verify': 'Сверка',
  'summary.toolbar': 'Действия с архивом',
  'summary.download': 'Скачать полный архив (файл прогона)',

  /* ---- what the run file holds (views/PreserveView) ---- */
  'output.title': 'Что вы получите',
  'output.intro':
    'Файл прогона — это одна загрузка `{ext}`. Каждое сохранение содержит всё, что прогон успел создать, по одной папке на шаг:',
  'output.caption': 'Файлы в файле прогона',
  'output.file': 'Файл',
  'output.what': 'Что это',
  'output.runState':
    'запись о прогоне: загрузите этот zip на этой вкладке, чтобы продолжить прогон или снова его посмотреть',
  'output.readme': 'что лежит в zip-архиве и где',
  'output.backup':
    'ваша резервная копия: 31 блок, который отдаёт заводская камера, считанный до любой записи, каждый по своему адресу во флеш-памяти ({fill} там, где блок так прочитать нельзя)',
  'output.capture':
    'каждый слот прошивки, который прогон может записать, в том виде, в каком его хранит камера (a, b или r в имени), считанный дважды с совпавшими результатами',
  'output.plain': 'прошивка из каждого из этих слотов, расшифрованная',
  'output.patched':
    'для каждого слота, который прогон патчит: его прошивка с временным патчем для чтения',
  'output.decrypted': 'расшифрованная резервная копия: прошивка каждого слота и отчёт о ней',
  'output.manifest': 'подробности этой расшифровки',
  'output.decryptReadme': 'что содержит эта расшифровка и каковы её ограничения',
  'output.pageBuild': 'какая сборка этой страницы выполнила прогон',
  'output.dumpPatched':
    'все 4 МБ в том виде, в каком они считаны, с патчем, который ещё остаётся в записанных слотах',
  'output.dumpOriginal':
    'полный образ: все 4 МБ с возвращённой на место исходной прошивкой — исходная флеш-память вашей камеры',
  'output.verify':
    '31 блок, считанный повторно после восстановления и разложенный так же, как резервная копия; он должен с ней совпадать',
  'output.grows':
    'Файл появляется только после того, как выполнен создающий его шаг, поэтому ранний файл прогона содержит только первую папку.',
  'output.keep':
    'Сохраните `{original}`: это вся флеш-память вашей камеры в исходном виде. Остальное показывает, как прогон к этому пришёл.',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Необязательно — чтобы продолжить прогон позже',
  'runFile.title': 'Файл прогона',
  'runFile.description':
    'Единственная запись прогона. Он скачивается сам после каждого шага (и после шага, остановившегося раньше времени); храните самый новый. Чтобы продолжить позже или после сбоя, загрузите его здесь, и страница продолжит с того места, где остановилась.',
  'runFile.run': 'Прогон',
  'runFile.file': 'Файл',
  'runFile.lastSaved': 'Последнее сохранение',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'после {step} — {at} ({bytes} Б)',
  'runFile.nextStep': 'Следующий шаг',
  'runFile.none': 'Нет активного прогона. Его начинает шаг 02, или загрузите файл прогона здесь.',
  'runFile.toolbar': 'Действия с файлом прогона',
  'runFile.load': 'Загрузить файл прогона…',
  'runFile.save': 'Сохранить файл прогона ещё раз',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Продолжение',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'Файл прогона не выбран.',
  'status.notRun': 'Ещё не выполнялось.',
  'status.running': 'Выполняется …',
  'status.runningRestarts': 'Выполняется — во время этого шага камера перезапускается …',
  'status.restarting': 'Камера перезапускается — это займёт около десяти секунд …',
  'status.waitConnect': 'Ждём вас — нажмите «Подключить устройство» и выберите камеру …',
  'status.waitPlugBack':
    'Ждём вас — снова подключите камеру, затем нажмите «Подключить устройство» …',
  'status.waitReplug': 'Ждём вас — отключите камеру и подключите её снова …',
  'status.back': 'Камера снова на связи — продолжаем …',
  'status.swapped': 'Остановлено — камера сменилась. Проверьте её, затем запустите этап ещё раз.',
  'status.noRun': 'Прогона нет.',
  'status.notCreated': 'Не создан — смотрите журнал выше.',
  'status.refused': 'Отказ — чего не хватает, сказано в списке этапов выше.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase} — готово. Файл прогона в загрузках актуален.',
  'status.doneReplug':
    '{phase} — готово, файл прогона сохранён. Перед восстановлением: отключите камеру, подключите её снова и нажмите «Подключить устройство».',
  'status.backupRefused': 'Отказ — ничего не записано. Смотрите журнал выше.',
  'status.failed': 'Ошибка — смотрите журнал выше.',
  'status.cancelled': 'Отменено — файл прогона по-прежнему указывает, где прогон остановился.',
  'status.readingFile': 'Чтение файла прогона …',
  'status.doneEarlier': 'Выполнено ранее — загружено из файла прогона.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Ранее завершилось ошибкой: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Продолжено с {step}. Список этапов продолжается оттуда.',
  'status.notResumed': 'Не продолжено — смотрите журнал выше.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'нужно: {missing}',
  'gate.noRun': 'нет активного прогона — его создаёт первый этап',
  'gate.runDone': 'этот прогон завершён — все этапы выполнены',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'уже выполнено — продолжение начнётся с {step}',
  'gate.banksRead': 'слоты, которые считывает резервное копирование',
  'gate.choice': 'выбор слотов — {why}',
  'gate.bankRefused': '{bank} нельзя записать: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'маршрут через слот восстановления (эта сборка запускается только со {r:gen}, а не со {bank:gen})',
  'gate.backupFirst': 'резервная копия флеш-памяти (на этом этапе она делается первой)',
  'gate.backup': 'резервная копия флеш-памяти',
  'gate.patchStep': 'шаг патча',
  'gate.patchOf': 'патч {bank:gen}',
  'gate.backupFile': 'файл окон резервной копии',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': 'снимок {bank:gen}',
  'gate.derived': 'выведенный образ {bank:gen}',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'шаг «Запись» (сначала выполните его или продолжите с него)',
  'gate.drainRefused': 'полное считывание отказывает на {build} — {why}',
  'gate.patchSummary': 'сводка патча {bank:gen} (длина для передачи)',
  'gate.restoreRefused':
    'восстановление отказывает на {build} — ни одна форма исходной прошивки не сохраняется обратно в виде исходных байтов; прогон заканчивается полным образом и оставленным на месте патчем',
  /* {file} is a file name in the run file. */
  'gate.plaintext':
    'заводской незашифрованный образ {bank:gen} ({file}, из шага резервного копирования)',
  'gate.restoreFirst': 'восстановление (на этом этапе оно выполняется первым)',
  'gate.powerCycle':
    'подтверждение перезапуска питания — выключите и снова включите питание камеры (отключите и снова подключите её или воспользуйтесь её выключателем), затем нажмите кнопку повторного запуска',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'камера не вернулась после {minutes} мин повторных попыток: {error} — если Chrome ничего не спросил, переподключите камеру и запустите этап ещё раз; если журнал просил подключить её заново, ждали именно нажатия «Подключить устройство»',
} satisfies Translation<'preserve'>;
