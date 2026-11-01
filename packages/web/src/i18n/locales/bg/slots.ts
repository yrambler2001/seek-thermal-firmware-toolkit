/**
 * Namespace `slots`, български (bg), translated from the English source: the firmware-slots tab.
 *
 * Owner: phase 2, slots agent.
 * Covers: views/SlotsView.tsx, hooks/useSlotsPanel.ts, components/SlotTable.tsx, SlotFpsConfirm.tsx,
 * SlotFpsEveryConfirm.tsx, SlotWriteConfirm.tsx, SlotFlashPreview.tsx, SlotWriteKeys.tsx.
 * (components/DeviceInfoPanel.tsx is done: its text is in `shared`, deviceInfo.*.)
 *
 * Words used all over this tab:
 * - bank = one of the camera's three firmware slots, A, B and R. R = the recovery slot, the
 *   last-resort copy the bootloader falls back to.
 * - {bank} is a bank's name from common:bank.* ("Slot A", "Recovery R" on its own; "slot A",
 *   "recovery R" inside a sentence). {a}, {b}, {r} are those names inside a sentence; {letter},
 *   {letterA}, {letterB}, {letterR} are the bare letters A, B and R (keep them Latin).
 * - booted = the bank the camera started from (the firmware it runs now).
 * - write / flash = erase a bank and program a new image into it. Commit = the camera's last step of a
 *   write, after which the bank may be changed.
 * - read-back = the bank read again after a write, to compare with what was sent.
 * - "Flash decrypted image", "Read slots", "Dump"… in quotes or bold are this tab's own buttons
 *   (table.flashPlain, actions.read, table.dump): use the same words as those keys.
 * - Hz values, firmware versions (0.8.0.0, 1.3.0.8), 0xFF, .bin/.zip, SWD/J-Link and SPI stay as they
 *   are. Key A / Key B: translate "Key", keep the letter. KiB/MiB are written KB/MB (README, Units).
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* The section: its heading, badge and one-line summary. */
  'section.title': 'Работа със слотовете на фърмуера',
  'section.badge': 'Записва във флаш паметта',
  'section.description':
    '„Четене на слотовете“ пита камерата какво изпълнява, чете трите ѝ слота на фърмуера — {a}, {b} и {r} — и показва какво съдържа всеки. Четенето и дъмпът не променят нищо. Бутонът за запис пита, преди да бъде изпратен и един байт.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Тази страница може да записва във флаш паметта на камерата.** Записът изтрива един слот от 64 КБ и го програмира. Образ, който е структурно валиден, но не работи, оставя камерата неспособна да стартира, а буутлоудърът няма USB — само SWD/J-Link или SPI програматор може да я възстанови. Първо направете дъмп на слота и запазете файла.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Действия със слотовете',
  'actions.read': 'Четене на слотовете',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Слотове',

  /* Before any read. */
  'empty.connected': 'Натиснете „Четене на слотовете“.',
  'empty.disconnected': 'Свържете камерата, след това натиснете „Четене на слотовете“.',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Тази компилация не се поддържа тук, затова не е прочетен нито един слот и не може да бъде записан нито един.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Неразпозната: страницата не може да определи коя компилация изпълнява камерата.',
  'refusal.notIdentified.body':
    'Камерата не даде използваема версия на фърмуера, затова не е прочетен нито един слот и нищо не е активирано. Тази страница покрива компилации {minVersion} и по-нови. Компилациите преди {minVersion} са извън това, което поддържа страницата със слотовете, така че камера с такава компилация никога не се чете тук.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Ако камерата изпълнява поддържана компилация, може би тя просто още стартира. {hint}',
  'refusal.title': 'Отказано — нищо не е активирано.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Четене ...',
  'status.readingAgain': 'Повторно четене на слотовете ...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Прочетено. Прочетен слот: {read}/{count}.',
    other: 'Прочетено. Прочетени слотове: {read}/{count}.',
  },
  'status.unsupported': 'Не се поддържа за тази компилация — не е прочетен нито един слот.',
  'status.refused': 'Отказано — нищо не е активирано. Вижте съобщението под журнала.',
  'status.disconnected': 'Устройството е изключено — прочетете слотовете отново.',
  'status.newDevice': 'Избрано е ново устройство — прочетете слотовете отново.',
  'status.dumping': 'Дъмп на {bank:acc} ...',
  'status.dumped': 'Направен е дъмп на {bank:acc}.',
  'status.readingImage': 'Четене на образа ...',
  'status.ready': 'Готово — прегледайте плана, след това го запишете.',
  'status.rejected': 'Отхвърлено — вижте журнала по-горе.',
  'status.writing': 'Записване ...',
  'status.patching': 'Прилагане на пач към {bank:acc} ...',
  'status.patchingEvery': 'Прилагане на пач към всички слотове ...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Записано, но контролното прочитане не съвпада — вижте резултата.',
  'status.written.verified': 'Записано. Слотът се прочита така, както е записан.',
  'status.written.notCompared': 'Записано. Контролното прочитане не е сравнено — вижте резултата.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Пачът е приложен, но контролното прочитане не се различава само според плана — вижте резултата.',
  'status.patched.ok': 'Пачът е приложен. Слотът се прочита така, както е планирано.',
  'status.patched.unchecked':
    'Пачът е приложен. Контролното прочитане не е проверено — вижте резултата.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Спряно при {bank:acc} — пач е приложен към {count} слот; вижте резултата.',
    other: 'Спряно при {bank:acc} — пач е приложен към {count} слота; вижте резултата.',
  },
  'status.every.unchecked': {
    one: 'Пач е приложен към {count} слот, но едно контролно прочитане не е проверено според плана — вижте резултата.',
    other:
      'Пач е приложен към {count} слота, но едно контролно прочитане не е проверено според плана — вижте резултата.',
  },
  'status.every.ok': {
    one: 'Пач е приложен към {count} слот. Той се прочита така, както е планирано.',
    other: 'Пач е приложен към {count} слота. Всеки се прочита така, както е планирано.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Отменено — нищо не е записано.',
  'status.cancelled.one':
    'Отменено след изпращането на потвърждението на записа в {bank:acc} — слотът може да е записан частично. Прочетете го, преди да разчитате на него.',
  'status.cancelled.many':
    'Отменено след изпращането на потвържденията на записите в {banks:acc} — всеки от тях може да е записан частично. Прочетете ги, преди да разчитате на тях.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Първо свържете камерата.',
  'gate.busy': 'Изпълнява се друга операция — изчакайте я да завърши.',
  'gate.readFirst': 'Първо прочетете слотовете.',
  'gate.cameraRefused':
    'Тази камера не може да бъде записвана оттук по причината в съобщението по-горе. Нищо не се изпраща.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Не е прочетен: {reason}. Прочетете слотовете отново, преди да го записвате.',
  'gate.notReadNoReason':
    'Не е прочетен: този слот не е прочетен. Прочетете слотовете отново, преди да го записвате.',
  'gate.emptyNotWritable':
    'Този слот е празен и не може да бъде записан на тази компилация: {reason}',
  'gate.noSuchBank': 'Тази компилация няма такъв слот.',

  /* The bank table. */
  'table.caption':
    'Всеки слот на фърмуера на тази камера — {a}, {b} и {r} — прочетен и проверен в браузъра',
  'table.col.bank': 'Слот',
  'table.col.firmware': 'Фърмуер',
  'table.col.size': 'Размер',
  'table.col.key': 'Ключ',
  'table.col.bootable': 'Стартира',
  'table.col.sha': 'SHA-256 на нешифрования образ',
  'table.col.actions': 'Действия',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'не е прочетен — {reason}',
  'table.notReadNoReason': 'не е прочетен — слотът не е прочетен',
  /* A badge: the bank holds no image. */
  'table.empty': 'празен',
  'table.emptyNote':
    'Няма образ: прозорецът на заглавието на този слот се чете изцяло като 0xFF, така че от него не се дешифрира нищо, а записът в него не презаписва фърмуер.',
  /* {reason} is core's. */
  'table.emptyWritable': 'Може да бъде записан.',
  'table.emptyNotWritable': 'Не може да бъде записан на тази компилация: {reason}',
  'table.unknownVersion': 'неизвестна версия',
  /* {id} is the image id in hex. */
  'table.imageId': 'образ {id}',
  'table.noImage': 'няма образ',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'слот от {size} Б',
  'table.imageSize': 'образ от {size} Б',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'няма (нешифрован)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— няма какво да стартира',
  'table.boot.bootable': 'стартира — буутлоудърът го приема',
  'table.boot.notBootable': 'не стартира — пропуска се при стартиране',
  'table.boot.recoveryOnly':
    'само за възстановяване — {letterR} се стартира, когато {letterA} и {letterB} не съдържат нищо, което буутлоудърът приема (измерено на камера за по-ранна форма на този образ); дали тази форма стартира, не е проверено',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'неизвестно — {why}',
  /* The row's buttons. */
  'table.dump': 'Дъмп',
  'table.flashPlain': 'Запис на дешифриран образ…',
  'table.flashRaw': 'Запис на сурови байтове…',
  'table.restore': 'Възстановяване от пълно резервно копие на флаш паметта (.bin или .zip)…',
  'table.makeFps': 'Ускоряване до {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Копиране в {bank:acc}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: изключено',
  'table.copyNote':
    'Копира фърмуера, който съдържа този слот, както го е дешифрирало това четене, в слота, който изберете, независимо какво има в него сега. Преглеждате плана, преди да се изпрати каквото и да е.',
  'table.restoreNote':
    'Изберете пълно резервно копие на флаш паметта: .bin (цял образ на флаш паметта от 4 МБ, например прочетен с J-Link) или .zip, който съдържа такъв (файл на сесия на Preserve или zip, запазен от „Дъмп и дешифриране 4.x/Nano“ или от „Дъмп на всички селектори“). Този слот се изрязва от него, дешифрира се и се показва като план, преди да се изпрати каквото и да е.',
  'table.fpsNote':
    'Повишава този слот от {fromHz} Hz на {toHz} Hz, като променя байтовете му. Първо слотът се запазва в изтегляне на zip, а дешифрираният файл в него е пътят назад.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery':
    '{booted} и слот за възстановяване: записът му изисква допълнително потвърждение.',
  'table.risk.booted': '{booted}: записът му изисква допълнително потвърждение.',
  'table.risk.recovery': '{bank}: записът му изисква допълнително потвърждение.',
  'table.risk.bootUnnamed':
    'Камерата не посочва слота, от който е стартирала: записът му изисква допълнително потвърждение.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Пачът за кадрова честота е приложен: този образ работи на {hz} Hz.',
  'fps.earlierPatch':
    'Пач за кадрова честота не се предлага: в този слот има по-ранен пач за {hz} Hz без поправката за USB. Възстановете заводския образ, след това използвайте „Ускоряване до {hz} FPS“.',
  'fps.atRate': 'Не е нужен пач за кадрова честота: тази компилация вече работи на {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Пач за кадрова честота не се предлага: {reason}',
  'fps.readFirst': 'първо прочетете слотовете — пачът се планира по собствения образ на слота',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Всички слотове',
  'everyBank.make': 'Ускоряване до {hz} FPS във всички слотове',
  'everyBank.faster': 'Ускоряване на всички слотове',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Прилага пач към {order:acc} с едно потвърждение; всеки първо се запазва в едно изтегляне на zip и се прочита отново.',
  'everyBank.noteBootedLast':
    'Прилага пач към {order:acc} с едно потвърждение, като слотът, от който камерата стартира сега, е последен; всеки първо се запазва в едно изтегляне на zip и се прочита отново.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': 'копието на {bank:acc}',
  'what.restore': 'съдържанието на {bank:acc} от {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Подготвено за {bank:acc} на адрес {address}',
  'preview.file': 'Файл',
  'preview.source': 'Образът е взет от',
  'preview.target': 'Цел',
  'preview.targetEmpty':
    '{bank:ins} е празен: в него няма образ, така че този запис не презаписва фърмуер',
  'preview.readAs': 'Прочетен като',
  'preview.readAs.ff': 'дешифриран образ FF {version}',
  'preview.readAs.plain': 'дешифриран образ',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'сурови байтове',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Изпращане',
  'preview.key': 'Ключ',
  'preview.payload': 'Данни',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} Б в {count} порция до {chunk} Б',
    other: '{size} Б в {count} порции до {chunk} Б',
  },
  'preview.checksum': 'Контролна сума на предаването',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Съхранено след това',
  'preview.storedNotPredicted': 'не е предвидено — проверката е контролното прочитане',
  'preview.storedPredicted': 'предвидени {size} Б',
  'preview.storedKeyB': 'предвидени {size} Б — образът XOR ключ B, а не самите данни',
  'preview.savedFirst': 'Запазено предварително',
  'preview.compareCaption': 'Какво се променя в {bank:acc}',
  'preview.col.field': 'Поле',
  'preview.col.now': 'Сега',
  'preview.col.after': 'След записа',
  'preview.readFirst': 'Прочетете преди записа:',
  /* {note} is core's note about this write. */
  'preview.note': 'Забележка: {note}',
  'preview.nothingSent':
    'Към камерата още не е изпратено нищо. Записът изпраща тези данни към {bank:acc} и ги потвърждава.',
  'preview.toolbar': 'Действия за запис в {bank:acc}',
  'preview.write': 'Запис в {bank:acc}…',
  'preview.discard': 'Отхвърляне',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Да се запише ли {what} в {bank:acc} на адрес {address}?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Записът в този слот заменя фърмуера, който камерата изпълнява сега. Ако новият образ не работи, камерата може изобщо да не стартира.',
  'writeConfirm.recovery':
    '{bank:ins} е слотът за възстановяване — копието за краен случай, към което прибягва буутлоудърът. Записът му оставя камерата без това копие, докато то не бъде възстановено.',
  'writeConfirm.bootUnnamed':
    'Камерата не казва от кой слот стартира, затова {bank:nom} се приема за слота, от който тя стартира сега. Записът му може да замени фърмуера, който камерата изпълнява.',
  'writeConfirm.empty': '{bank:ins} е празен: в него няма образ, така че не се презаписва фърмуер.',
  'writeConfirm.eraseEmpty':
    'Записът все пак изтрива блока от 64 КБ на флаш паметта на камерата на мястото на {bank:acc} (вече празен) и го програмира.',
  'writeConfirm.erase':
    'Това изтрива блок от 64 КБ на флаш паметта на камерата и го програмира на мястото на {bank:acc}.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine': 'Образът се записва с {key}. Всеки друг слот се записва по същия начин.',
  'writeConfirm.backup':
    'Преди да се изпрати каквото и да е, {bank:nom} се прочита отново и се запазва като едно изтегляне на zip: {file}. Потърсете го в папката за изтегляния.',
  'writeConfirm.noReset':
    'Не се изпраща команда за рестартиране. След това изключете камерата и я включете отново, за да влезе слотът в сила.',
  'writeConfirm.noUsbRecovery':
    'Ако образът не работи, камерата не може да бъде възстановена през USB — само със SWD/J-Link или SPI програматор.',
  'writeConfirm.ackUnnamed':
    'Разбирам, че камерата не казва от кой слот стартира, затова този слот се приема за слота, от който е стартирала, и че лош образ може да остави камерата неспособна да стартира.',
  'writeConfirm.confirm': 'Да — запис в {bank:acc}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Разбирам, че това е слотът, от който камерата стартира сега, и че лош образ може да остави камерата неспособна да стартира.',
  'ack.recovery':
    'Разбирам, че това е слотът за възстановяване и че лош образ оставя камерата без копие за краен случай.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Да се ускори ли {bank:nom} до {hz} FPS?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted': '{bootsNow}. Образът с пача заменя фърмуера, който камерата изпълнява сега.',
  'fpsConfirm.recovery':
    '{bank:ins} е слотът за възстановяване — копието за краен случай, към което прибягва буутлоудърът.',
  'fpsConfirm.what':
    'В {bank:acc} има фърмуер {version} и това кара образа му да работи на {toHz} Hz вместо на {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(неизвестен)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'Пачът променя {count} байт от образа и думата на контролната сума за приемане, така че сумата, която проверява буутлоудърът, се запазва. Двойката ключове не се променя.',
    other:
      'Пачът променя {count} байта от образа и думата на контролната сума за приемане, така че сумата, която проверява буутлоудърът, се запазва. Двойката ключове не се променя.',
  },
  'fpsConfirm.wayBack':
    'Дешифрираният файл в този zip е пътят назад: за да отмените пача, запишете го с „Запис на дешифриран образ“ в {bank:acc}.',
  'fpsConfirm.noReset':
    'Не се изпраща команда за рестартиране. След това изключете камерата и я включете отново, за да влезе в сила слотът с пача.',
  'fpsConfirm.ackUnnamed':
    'Разбирам, че камерата не казва от кой слот стартира, затова този слот се приема за слота, от който е стартирала.',
  'fpsConfirm.confirm': 'Да — прилагане на пача към {bank:acc}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Да се ускорят ли всички слотове до {hz} FPS?',
  'fpsEvery.titleMixed': {
    one: 'Да се приложи ли пач за кадровата честота към {count} слот?',
    other: 'Да се приложи ли пач за кадровата честота към {count} слота?',
  },
  'fpsEvery.intro': {
    one: 'Това прилага пач към {count} слот, за който пачът е наличен (фърмуер {version}):',
    other: 'Това прилага пач към {count} слота, за които пачът е наличен (фърмуер {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (слотът, от който камерата стартира сега, и слотът за възстановяване)',
  'fpsEvery.role.booted': '{bank} (слотът, от който камерата стартира сега)',
  'fpsEvery.role.recovery': '{bank} (слотът за възстановяване, копието за краен случай)',
  'fpsEvery.role.bootUnnamed': '{bank} (камерата не казва от кой слот стартира)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: от {fromHz} Hz на {toHz} Hz, {count} байт и думата на контролната сума.',
    other: '{bank}: от {fromHz} Hz на {toHz} Hz, {count} байта и думата на контролната сума.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Остават непроменени: {others}',
  'fpsEvery.orderOne': 'Записва само {bank:acc} и го прочита отново.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Записват се в този ред: {order:nom}. Всеки се прочита отново преди следващия, а първата грешка спира останалите.',
  'fpsEvery.orderBootedLast':
    'Записват се в този ред: {order:nom}. Слотът, от който камерата стартира сега, е последен, така че при грешка записът спира преди него. Всеки се прочита отново преди следващия, а първата грешка спира останалите.',
  'fpsEvery.wayBack':
    'Дешифрираните файлове в този zip са пътят назад: за да отмените пача на даден слот, запишете неговия файл с „Запис на дешифриран образ“ в този слот.',
  'fpsEvery.noReset':
    'Не се изпраща команда за рестартиране. След това изключете камерата и я включете отново, за да влязат в сила слотовете с пача.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Разбирам, че това записва: {banks}, и че лош образ може да остави камерата неспособна да стартира.',
  'fpsEvery.confirm': {
    one: 'Да — прилагане на пача към {count} слот',
    other: 'Да — прилагане на пача към {count} слота',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: слотът се прочита така, както е записан.',
  'outcome.mismatch': '{bank} — {what}: контролното прочитане НЕ съвпада със записаното.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: контролното прочитане е направено, но не е сравнено, така че този запис не е проверен тук.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'Потвърждението на записа (commit) от камерата върна статус {status}.',
  'outcome.wasEmpty': '{bank:ins} беше празен преди този запис, така че не е презаписан фърмуер.',
  'outcome.provenVerified':
    'Доказано досега: данните са изпратени и записът е потвърден, а слотът се прочита така, както е записан. НЕ е доказано: че буутлоудърът ще избере този слот или че образът работи.',
  'outcome.provenCommitted':
    'Доказано досега: данните са изпратени и записът е потвърден. НЕ е доказано: че буутлоудърът ще избере този слот или че образът работи.',
  'outcome.replug':
    '**СЕГА ИЗКЛЮЧЕТЕ КАМЕРАТА И Я ВКЛЮЧЕТЕ ОТНОВО.** Не е изпратена команда за рестартиране, така че слотът влиза в сила само след истинско изключване и включване на захранването. След това прочетете слотовете отново: само версията и активният слот, които камерата съобщава, решават въпроса.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**СЕГА ИЗКЛЮЧЕТЕ КАМЕРАТА И Я ВКЛЮЧЕТЕ ОТНОВО.** Не е изпратена команда за рестартиране. След това прочетете слотовете отново.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Запазено предварително, като изтегляне: {file}.',
  'outcome.wayBackOne':
    'Дешифрираният файл в него е пътят назад („Запис на дешифриран образ“ в същия слот).',
  'outcome.wayBackMany':
    'Дешифрираните файлове в него са пътят назад („Запис на дешифриран образ“ във всеки слот).',
  'outcome.checkDownloads': 'Потърсете го в папката за изтегляния.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank} — пач от {fromHz} Hz на {toHz} Hz (фърмуер {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'Контролното прочитане се различава от запазения дъмп само в {count} планиран байт, местата на пача и думата на сумата.',
    other:
      'Контролното прочитане се различава от запазения дъмп само в {count} планирани байта, местата на пача и думата на сумата.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'Контролното прочитане НЕ се различава само според плана: неочаквани байтове: {unexpected}, липсващи: {count}.',
    other:
      'Контролното прочитане НЕ се различава само според плана: неочаквани байтове: {unexpected}, липсващи: {count}.',
  },
  'fpsOutcome.notTaken': 'Не е направено контролно прочитане, така че пачът не е проверен тук.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Всички слотове: пач е приложен към {done} от {count}, в този ред: {order}.',
    other: 'Всички слотове: пач е приложен към {done} от {count}, в този ред: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'Контролното прочитане се различава от запазения слот само в {count} планиран байт.',
    other: 'Контролното прочитане се различава от запазения слот само в {count} планирани байта.',
  },
  'fpsEveryOutcome.notTaken': 'Не е направено контролно прочитане.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Спряно: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Не са записани: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Нито един слот на тази камера не може да бъде записан оттук.',
  'keys.title': 'Ключове за записите',
  'keys.chain': 'Верига',
  'keys.chainPlain':
    'нешифрованата верига от 2014 г.: всеки слот се съхранява в открит вид, така че никой не съдържа ключ',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Записва се като',
  'keys.writtenPlain': 'образът такъв, какъвто е, без ключ, във всеки слот',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Изпраща се като',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Съхранява се като',
  'keys.refused': 'Отказано',
  'keys.bootedBank': 'Слот, от който е стартирала',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank} съдържа {key:acc}',
  'keys.theBootedBank': 'слотът, от който е стартирала камерата',
  'keys.unnamedKey': 'ключ, който страницата не може да назове',
  'keys.bootedBanksKey': 'ключът на слота, от който е стартирала камерата',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; всеки слот се записва по същия начин',

  /* "What these buttons do", below the tab. */
  'how.title': 'Какво правят тези бутони',
  'how.read': '**Четене на слотовете** и **Дъмп** не променят нищо в камерата.',
  'how.flash':
    '**Запис на дешифриран образ** взима нешифрован образ, шифрира го така, както изисква фърмуерът на този слот, преди да бъде изпратен, и показва плана. **Запис на сурови байтове** изпраща файла точно такъв, какъвто е. Нито един от двата не изпраща нищо, докато не потвърдите.',
  'how.ff':
    'Записът в {letterR} изисква допълнителното потвърждение като всеки запис в слота за възстановяване. **Празен** слот (прозорецът на заглавието му се чете изцяло като 0xFF, както в {b:acc} на много камери от 2014 г.) е състояние, а не повреда. Той се записва точно като всеки друг слот.',
  'how.copy':
    '**Възстановяване от пълно резервно копие на флаш паметта** взима .bin (цял образ на флаш паметта от 4 МБ, например прочетен с J-Link) или .zip, който съдържа такъв (файл на сесия на Preserve или zip, запазен от „Дъмп и дешифриране 4.x/Nano“ или от „Дъмп на всички селектори“), изрязва от него този слот, дешифрира го и показва плана; ако резервното копие изглежда като от друга камера или с друг фърмуер, това се казва в плана.',
  'how.fps':
    '**Ускоряване до N FPS** в реда на даден слот променя образа на този слот за по-висока кадрова честота, а **Ускоряване до N FPS във всички слотове** прави това за всеки слот, за който пачът е наличен, с едно потвърждение, като слотът, от който камерата стартира сега, е последен. За слот, за който пачът не е наличен, страницата казва защо.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Всеки запис първо запазва своя слот**: слотът се прочита отново и се запазва като едно изтегляне на zip, наименувано с часа, серийния номер на камерата, фърмуера, слота и записа (например `{example}`), което съдържа слота такъв, какъвто е съхранен, дешифрирания му образ и бележка какво е всеки файл. За да се върнете назад, запишете дешифрирания файл от zip архива с **Запис на дешифриран образ**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Записът изтрива един слот от 64 КБ и го програмира. Буутлоудърът на `{address}` и конфигурацията на стартирането никога не се записват тук и няма контрола за избор на активния слот. Слотът влиза в сила едва след като камерата бъде изключена и включена отново.',
} satisfies Translation<'slots', 'bg'>;
