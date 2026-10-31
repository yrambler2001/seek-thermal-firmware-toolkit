/**
 * Namespace `slots`, русский (ru), translated from the English source: the firmware-slots tab.
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
  'section.title': 'Работа со слотами прошивки',
  'section.badge': 'Пишет во флеш-память',
  'section.description':
    '«Считать слоты» спрашивает камеру, какая прошивка на ней работает, считывает три её слота прошивки — {a}, {b} и {r} — и показывает, что в каждом из них. Считывание и дамп ничего не меняют. Кнопка записи спрашивает вас, прежде чем будет отправлен хоть один байт.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Эта страница может записывать во флеш-память камеры.** Запись стирает один слот размером 64 КБ и программирует его заново. Образ, корректный по структуре, но неработающий, оставляет камеру незапускаемой, а у загрузчика нет USB — восстановить её можно только через SWD/J-Link или программатором SPI. Сначала снимите дамп слота и сохраните файл.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Действия со слотами',
  'actions.read': 'Считать слоты',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Слоты',

  /* Before any read. */
  'empty.connected':
    'Нажмите «Считать слоты». Сначала камеру спросят, какая сборка на ней работает, и на сборке, которую эта страница не поддерживает, ничего не будет активировано.',
  'empty.disconnected': 'Подключите камеру, затем нажмите «Считать слоты».',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Эта сборка здесь не поддерживается, поэтому ни один слот не считан и ни один нельзя записать.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Не опознано: эта страница не может определить, какая сборка работает на камере.',
  'refusal.notIdentified.body':
    'Камера не сообщила пригодную версию прошивки, поэтому ни один слот не считан и ничего не активировано. Эта страница охватывает сборки {minVersion} и новее. Сборки до {minVersion} не поддерживаются страницей слотов, поэтому камера с такой сборкой здесь никогда не считывается.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Если на камере поддерживаемая сборка, возможно, она ещё запускается. {hint}',
  'refusal.title': 'Отказ — ничего не активировано.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Считывание ...',
  'status.readingAgain': 'Повторное считывание слотов ...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Считано. Слотов считано: {read}/{count}.',
    few: 'Считано. Слотов считано: {read}/{count}.',
    many: 'Считано. Слотов считано: {read}/{count}.',
    other: 'Считано. Слотов считано: {read}/{count}.',
  },
  'status.unsupported': 'Не поддерживается на этой сборке — ни один слот не считан.',
  'status.refused': 'Отказ — ничего не активировано. Смотрите сообщение под журналом.',
  'status.disconnected': 'Устройство отключено — считайте слоты заново.',
  'status.newDevice': 'Выбрано новое устройство — считайте слоты заново.',
  'status.dumping': 'Дамп {bank:gen} ...',
  'status.dumped': 'Дамп {bank:gen} готов.',
  'status.readingImage': 'Чтение образа ...',
  'status.ready': 'Готово — проверьте план, затем запишите.',
  'status.rejected': 'Отклонено — смотрите журнал выше.',
  'status.writing': 'Запись ...',
  'status.patching': 'Патч {bank:gen} ...',
  'status.patchingEvery': 'Патч всех слотов ...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch':
    'Записано, но контрольное считывание не совпадает — смотрите результат.',
  'status.written.verified': 'Записано. Контрольное считывание совпадает с записанным.',
  'status.written.notCompared':
    'Записано. Контрольное считывание не сравнивалось — смотрите результат.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Пропатчено, но контрольное считывание отличается не только так, как планировалось, — смотрите результат.',
  'status.patched.ok': 'Пропатчено. Контрольное считывание соответствует плану.',
  'status.patched.unchecked':
    'Пропатчено. Контрольное считывание не проверялось — смотрите результат.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Остановлено на {bank:loc} — пропатчен {count} слот; смотрите результат.',
    few: 'Остановлено на {bank:loc} — пропатчено {count} слота; смотрите результат.',
    many: 'Остановлено на {bank:loc} — пропатчено {count} слотов; смотрите результат.',
    other: 'Остановлено на {bank:loc} — пропатчено слотов: {count}; смотрите результат.',
  },
  'status.every.unchecked': {
    one: 'Пропатчен {count} слот, но одно из контрольных считываний не проверено по плану — смотрите результат.',
    few: 'Пропатчено {count} слота, но одно из контрольных считываний не проверено по плану — смотрите результат.',
    many: 'Пропатчено {count} слотов, но одно из контрольных считываний не проверено по плану — смотрите результат.',
    other:
      'Пропатчено слотов: {count}, но одно из контрольных считываний не проверено по плану — смотрите результат.',
  },
  'status.every.ok': {
    one: 'Пропатчен {count} слот. Контрольное считывание соответствует плану.',
    few: 'Пропатчено {count} слота. Контрольное считывание каждого соответствует плану.',
    many: 'Пропатчено {count} слотов. Контрольное считывание каждого соответствует плану.',
    other: 'Пропатчено слотов: {count}. Контрольное считывание каждого соответствует плану.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Отменено — ничего не записано.',
  'status.cancelled.one':
    'Отменено после того, как подтверждение записи в {bank:acc} уже было отправлено, — слот может быть записан частично. Считайте его, прежде чем на него полагаться.',
  'status.cancelled.many':
    'Отменено после того, как подтверждения записи в {banks:acc} уже были отправлены, — каждый из них может быть записан частично. Считайте их, прежде чем на них полагаться.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Сначала подключите камеру.',
  'gate.busy': 'Выполняется другая операция — дождитесь её завершения.',
  'gate.readFirst': 'Сначала считайте слоты.',
  'gate.cameraRefused':
    'В эту камеру нельзя записывать отсюда по причине, указанной в сообщении выше. Ничего не отправляется.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Не считан: {reason}. Перед записью считайте слоты заново.',
  'gate.notReadNoReason':
    'Не считан: этот слот не был считан. Перед записью считайте слоты заново.',
  'gate.emptyNotWritable': 'Этот слот пуст, и на этой сборке его нельзя записать: {reason}',
  'gate.noSuchBank': 'В этой сборке нет такого слота.',

  /* The bank table. */
  'table.caption':
    'Каждый слот прошивки этой камеры — {a}, {b} и {r} — в том виде, в каком он считан и проверен в браузере',
  'table.col.bank': 'Слот',
  'table.col.firmware': 'Прошивка',
  'table.col.size': 'Размер',
  'table.col.key': 'Ключ',
  'table.col.bootable': 'Запускается',
  'table.col.sha': 'SHA-256 незашифрованного',
  'table.col.actions': 'Действия',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'не считан — {reason}',
  'table.notReadNoReason': 'не считан — слот не был считан',
  /* A badge: the bank holds no image. */
  'table.empty': 'пусто',
  'table.emptyNote':
    'Образа нет: окно заголовка этого слота читается как сплошные 0xFF, поэтому из него ничего не расшифровывается, а запись в него не перезаписывает никакую прошивку.',
  /* {why} and {reason} are core's. */
  'table.emptyWritable': 'Можно записать. {why}',
  'table.emptyNotWritable': 'На этой сборке записать нельзя: {reason}',
  'table.unknownVersion': 'версия неизвестна',
  /* {id} is the image id in hex. */
  'table.imageId': 'образ {id}',
  'table.noImage': 'нет образа',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'слот {size} Б',
  'table.imageSize': 'образ {size} Б',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'нет (не зашифрован)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— запускать нечего',
  'table.boot.bootable': 'запускается — загрузчик его принимает',
  'table.boot.notBootable': 'не запускается — пропускается при запуске',
  'table.boot.recoveryOnly':
    'только восстановление — {letterR} запускается, когда ни {letterA}, ни {letterB} не содержат ничего, что принял бы загрузчик (измерено на камере для более ранней формы этого образа); запустится ли эта форма, не проверено',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'неизвестно — {why}',
  /* The row's buttons. */
  'table.dump': 'Дамп',
  'table.flashPlain': 'Записать расшифрованный образ…',
  'table.flashRaw': 'Записать сырые байты…',
  'table.restore': 'Восстановить из полной резервной копии флеш-памяти (.bin или .zip)…',
  'table.makeFps': 'Сделать {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Копировать в {bank:acc}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: недоступно',
  'table.copyNote':
    'Копирует прошивку из этого слота — в том виде, в каком её расшифровало это считывание, — в выбранный вами слот, что бы в нём сейчас ни было. Прежде чем что-либо будет отправлено, вы проверите план.',
  'table.restoreNote':
    'Выберите полную резервную копию флеш-памяти: .bin (весь образ флеш-памяти 4 МБ, например считанный через J-Link) или .zip, в котором он лежит (файл прогона Preserve или zip, который сохраняет «Дамп и расшифровка 4.x/Nano» или «Дамп всех селекторов»). Этот слот вырезается из неё, расшифровывается и показывается в виде плана, прежде чем что-либо будет отправлено.',
  'table.fpsNote':
    'Поднимает частоту этого слота с {fromHz} Hz до {toHz} Hz, изменяя его байты. Сначала слот сохраняется в zip-архиве, который скачивается, и расшифрованный файл в нём — путь назад.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery':
    '{booted}, и это слот восстановления: для записи нужно дополнительное подтверждение.',
  'table.risk.booted': '{booted}: для записи нужно дополнительное подтверждение.',
  'table.risk.recovery': '{bank}: для записи нужно дополнительное подтверждение.',
  'table.risk.bootUnnamed':
    'Камера не называет слот, с которого запущена: для записи нужно дополнительное подтверждение.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Патч частоты кадров применён: этот образ работает на {hz} Hz.',
  'fps.earlierPatch':
    'Патч частоты кадров не предлагается: в этом слоте более ранний патч на {hz} Hz без исправления USB. Восстановите заводской образ, затем нажмите «Сделать {hz} FPS».',
  'fps.atRate': 'Патч частоты кадров не нужен: эта сборка уже работает на {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Патч частоты кадров не предлагается: {reason}',
  'fps.readFirst': 'сначала считайте слоты — патч планируется по собственному образу слота',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Все слоты',
  'everyBank.make': 'Сделать {hz} FPS во всех слотах',
  'everyBank.faster': 'Ускорить все слоты',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Патчит {order} с одним подтверждением; каждый слот сначала сохраняется в один скачиваемый zip-архив, а после записи считывается для контроля.',
  'everyBank.noteBootedLast':
    'Патчит {order} с одним подтверждением, слот, с которого камера запущена сейчас, — последним; каждый слот сначала сохраняется в один скачиваемый zip-архив, а после записи считывается для контроля.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': 'образ {bank:gen}',
  'what.restore': '{bank} из {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Подготовлено для {bank:gen} по адресу {address}',
  'preview.file': 'Файл',
  'preview.source': 'Откуда образ',
  'preview.target': 'Цель',
  'preview.targetEmpty':
    '{bank} пуст: в нём нет образа, поэтому эта запись не перезапишет никакую прошивку',
  'preview.readAs': 'Прочитан как',
  'preview.readAs.ff': 'расшифрованный образ {version} FF',
  'preview.readAs.plain': 'расшифрованный образ',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'сырые байты',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Передача',
  'preview.key': 'Ключ',
  'preview.payload': 'Данные',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} Б в {count} порции до {chunk} Б',
    few: '{size} Б в {count} порциях до {chunk} Б',
    many: '{size} Б в {count} порциях до {chunk} Б',
    other: '{size} Б в {count} порциях до {chunk} Б',
  },
  'preview.checksum': 'Контрольная сумма передачи',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Будет храниться',
  'preview.storedNotPredicted': 'не предсказывается — проверкой служит контрольное считывание',
  'preview.storedPredicted': 'ожидается {size} Б',
  'preview.storedKeyB': 'ожидается {size} Б — образ XOR ключ B, а не сами передаваемые данные',
  'preview.savedFirst': 'Сначала сохраняется',
  'preview.compareCaption': 'Что изменится в {bank:loc}',
  'preview.col.field': 'Поле',
  'preview.col.now': 'Сейчас',
  'preview.col.after': 'После записи',
  'preview.readFirst': 'Прочитайте перед записью:',
  /* {note} is core's note about this write. */
  'preview.note': 'Примечание: {note}',
  'preview.nothingSent':
    'В камеру пока ничего не отправлено. Запись передаст эти данные в {bank:acc} и подтвердит запись.',
  'preview.toolbar': 'Действия записи для {bank:gen}',
  'preview.write': 'Записать в {bank:acc}…',
  'preview.discard': 'Отбросить',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Записать {what} в {bank:acc} по адресу {address}?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Запись заменит прошивку, которая сейчас работает на камере. Если новый образ не заработает, камера может вообще не запуститься.',
  'writeConfirm.recovery':
    '{bank} — слот восстановления, последняя резервная копия, к которой обращается загрузчик. После записи у камеры не будет этой копии, пока её не восстановят.',
  'writeConfirm.bootUnnamed':
    'Камера не сообщает, с какого слота запущена, поэтому {bank} считается слотом, с которого она запущена сейчас. Запись может заменить прошивку, которая работает на камере.',
  'writeConfirm.empty':
    '{bank} пуст: в нём нет образа, поэтому никакая прошивка не перезаписывается.',
  'writeConfirm.eraseEmpty':
    'Запись всё равно стирает блок флеш-памяти камеры размером 64 КБ в {bank:loc} (уже пустой) и программирует его.',
  'writeConfirm.erase':
    'Это стирает блок флеш-памяти камеры размером 64 КБ и программирует его в {bank:loc}.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'Образ записывается под ключом: {key}. Все остальные слоты записываются так же.',
  'writeConfirm.backup':
    'Прежде чем что-либо будет отправлено, {bank} считывается заново и сохраняется в один скачиваемый zip-архив: {file}. Проверьте, что он появился в папке загрузок.',
  'writeConfirm.noReset':
    'Команда сброса не отправляется. Чтобы слот вступил в силу, после записи отключите и снова подключите камеру.',
  'writeConfirm.noUsbRecovery':
    'Если образ не заработает, восстановить камеру через USB будет нельзя — только через SWD/J-Link или программатором SPI.',
  'writeConfirm.ackUnnamed':
    'Я понимаю, что камера не сообщает, с какого слота запущена, поэтому этот слот считается слотом, с которого она запущена, и что неудачный образ может оставить камеру незапускаемой.',
  'writeConfirm.confirm': 'Да — записать в {bank:acc}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Я понимаю, что это слот, с которого камера запущена сейчас, и что неудачный образ может оставить камеру незапускаемой.',
  'ack.recovery':
    'Я понимаю, что это слот восстановления и что неудачный образ оставит камеру без последней резервной копии.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Перевести {bank} на {hz} FPS?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted':
    '{bootsNow}. Пропатченный образ заменит прошивку, которая на нём сейчас работает.',
  'fpsConfirm.recovery':
    '{bank} — слот восстановления, последняя резервная копия, к которой обращается загрузчик.',
  'fpsConfirm.what':
    'В {bank:loc} прошивка {version}, и этот патч заставит её образ работать на {toHz} Hz вместо {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(неизвестна)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'Патч меняет {count} байт образа и слово контрольной суммы, так что сумма, которую проверяет загрузчик, сохраняется. Пара ключей не затрагивается.',
    few: 'Патч меняет {count} байта образа и слово контрольной суммы, так что сумма, которую проверяет загрузчик, сохраняется. Пара ключей не затрагивается.',
    many: 'Патч меняет {count} байт образа и слово контрольной суммы, так что сумма, которую проверяет загрузчик, сохраняется. Пара ключей не затрагивается.',
    other:
      'Патч меняет {count} байта образа и слово контрольной суммы, так что сумма, которую проверяет загрузчик, сохраняется. Пара ключей не затрагивается.',
  },
  'fpsConfirm.wayBack':
    'Расшифрованный файл в этом zip-архиве — путь назад: чтобы отменить патч, запишите его кнопкой «Записать расшифрованный образ» в {bank:acc}.',
  'fpsConfirm.noReset':
    'Команда сброса не отправляется. Чтобы пропатченный слот вступил в силу, после записи отключите и снова подключите камеру.',
  'fpsConfirm.ackUnnamed':
    'Я понимаю, что камера не сообщает, с какого слота запущена, поэтому этот слот считается слотом, с которого она запущена.',
  'fpsConfirm.confirm': 'Да — пропатчить {bank:acc}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Перевести все слоты на {hz} FPS?',
  'fpsEvery.titleMixed': {
    one: 'Пропатчить частоту кадров {count} слота?',
    few: 'Пропатчить частоту кадров {count} слотов?',
    many: 'Пропатчить частоту кадров {count} слотов?',
    other: 'Пропатчить частоту кадров {count} слота?',
  },
  'fpsEvery.intro': {
    one: 'Будет пропатчен {count} слот, где патч доступен (прошивка {version}):',
    few: 'Будут пропатчены {count} слота, где патч доступен (прошивка {version}):',
    many: 'Будут пропатчены {count} слотов, где патч доступен (прошивка {version}):',
    other: 'Будут пропатчены слоты, где патч доступен ({count}; прошивка {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (слот, с которого камера запущена сейчас, и слот восстановления)',
  'fpsEvery.role.booted': '{bank} (слот, с которого камера запущена сейчас)',
  'fpsEvery.role.recovery': '{bank} (слот восстановления, последняя резервная копия)',
  'fpsEvery.role.bootUnnamed': '{bank} (камера не сообщает, с какого слота запущена)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: с {fromHz} Hz до {toHz} Hz, {count} байт и слово контрольной суммы.',
    few: '{bank}: с {fromHz} Hz до {toHz} Hz, {count} байта и слово контрольной суммы.',
    many: '{bank}: с {fromHz} Hz до {toHz} Hz, {count} байт и слово контрольной суммы.',
    other: '{bank}: с {fromHz} Hz до {toHz} Hz, {count} байта и слово контрольной суммы.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Остаются как есть: {others}',
  'fpsEvery.orderOne': 'Записывается только {bank}, затем он считывается для контроля.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Слоты записываются в таком порядке: {order}. Каждый считывается для контроля до записи следующего, и первая же ошибка останавливает остальные.',
  'fpsEvery.orderBootedLast':
    'Слоты записываются в таком порядке: {order}. Слот, с которого камера запущена сейчас, идёт последним, так что ошибка остановит запись до него. Каждый считывается для контроля до записи следующего, и первая же ошибка останавливает остальные.',
  'fpsEvery.wayBack':
    'Расшифрованные файлы в этом zip-архиве — путь назад: чтобы отменить патч слота, запишите его файл кнопкой «Записать расшифрованный образ» в этот же слот.',
  'fpsEvery.noReset':
    'Команда сброса не отправляется. Чтобы пропатченные слоты вступили в силу, после записи отключите и снова подключите камеру.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Я понимаю, что будут записаны слоты: {banks}, и что неудачный образ может оставить камеру незапускаемой.',
  'fpsEvery.confirm': {
    one: 'Да — пропатчить {count} слот',
    few: 'Да — пропатчить {count} слота',
    many: 'Да — пропатчить {count} слотов',
    other: 'Да — пропатчить {count} слота',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: контрольное считывание совпадает с записанным.',
  'outcome.mismatch': '{bank} — {what}: контрольное считывание НЕ совпадает с записанным.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: контрольное считывание выполнено, но не сравнивалось, поэтому здесь эта запись не проверена.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'Подтверждение записи в камере вернуло статус {status}.',
  'outcome.wasEmpty': 'До этой записи {bank} был пуст, поэтому никакая прошивка не перезаписана.',
  'outcome.provenVerified':
    'Пока доказано: данные переданы, запись подтверждена, контрольное считывание совпадает с записанным. НЕ доказано: что загрузчик выберет этот слот и что образ заработает.',
  'outcome.provenCommitted':
    'Пока доказано: данные переданы, запись подтверждена. НЕ доказано: что загрузчик выберет этот слот и что образ заработает.',
  'outcome.replug':
    '**ТЕПЕРЬ ОТКЛЮЧИТЕ И СНОВА ПОДКЛЮЧИТЕ КАМЕРУ.** Команда сброса не отправлялась, поэтому слот вступит в силу только после настоящего выключения и включения питания. Затем считайте слоты заново: только версия и активный слот, о которых сообщит камера, решают этот вопрос.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**ТЕПЕРЬ ОТКЛЮЧИТЕ И СНОВА ПОДКЛЮЧИТЕ КАМЕРУ.** Команда сброса не отправлялась. Затем считайте слоты заново.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Сначала сохранено, как загрузка: {file}.',
  'outcome.wayBackOne':
    'Расшифрованный файл в нём — путь назад («Записать расшифрованный образ» в тот же слот).',
  'outcome.wayBackMany':
    'Расшифрованные файлы в нём — путь назад («Записать расшифрованный образ» в каждый слот).',
  'outcome.checkDownloads': 'Проверьте, что он появился в папке загрузок.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank} — пропатчен с {fromHz} Hz на {toHz} Hz (прошивка {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'Контрольное считывание отличается от сохранённого дампа только {count} запланированным байтом: места патча и слово суммы.',
    few: 'Контрольное считывание отличается от сохранённого дампа только {count} запланированными байтами: места патча и слово суммы.',
    many: 'Контрольное считывание отличается от сохранённого дампа только {count} запланированными байтами: места патча и слово суммы.',
    other:
      'Контрольное считывание отличается от сохранённого дампа только запланированными байтами ({count}): места патча и слово суммы.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'Контрольное считывание отличается НЕ только так, как планировалось: неожиданных байтов — {unexpected}, недостающих — {count}.',
    few: 'Контрольное считывание отличается НЕ только так, как планировалось: неожиданных байтов — {unexpected}, недостающих — {count}.',
    many: 'Контрольное считывание отличается НЕ только так, как планировалось: неожиданных байтов — {unexpected}, недостающих — {count}.',
    other:
      'Контрольное считывание отличается НЕ только так, как планировалось: неожиданных байтов — {unexpected}, недостающих — {count}.',
  },
  'fpsOutcome.notTaken': 'Контрольное считывание не выполнялось, поэтому здесь патч не проверен.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Все слоты: пропатчено {done} из {count}, в таком порядке: {order}.',
    few: 'Все слоты: пропатчено {done} из {count}, в таком порядке: {order}.',
    many: 'Все слоты: пропатчено {done} из {count}, в таком порядке: {order}.',
    other: 'Все слоты: пропатчено {done} из {count}, в таком порядке: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'Контрольное считывание отличается от сохранённого слота только {count} запланированным байтом.',
    few: 'Контрольное считывание отличается от сохранённого слота только {count} запланированными байтами.',
    many: 'Контрольное считывание отличается от сохранённого слота только {count} запланированными байтами.',
    other:
      'Контрольное считывание отличается от сохранённого слота только запланированными байтами ({count}).',
  },
  'fpsEveryOutcome.notTaken': 'Контрольное считывание не выполнялось.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Остановлено: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Не записаны: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Ни один слот этой камеры нельзя записать отсюда.',
  'keys.title': 'Ключи для записи',
  'keys.chain': 'Цепочка',
  'keys.chainPlain':
    'незашифрованная цепочка 2014 года: каждый слот хранится открыто, поэтому ключа нет ни в одном',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Записывается как',
  'keys.writtenPlain': 'образ как есть, без ключа, в любой слот',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Передаётся как',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Хранится как',
  'keys.refused': 'Отказ',
  'keys.bootedBank': 'Запущена со слота',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank} содержит {key:acc}',
  'keys.theBootedBank': 'слот, с которого запущена камера',
  'keys.unnamedKey': 'ключ, который страница не может назвать',
  'keys.bootedBanksKey': 'ключ слота, с которого запущена камера',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; все слоты записываются так же',

  /* "What these buttons do", below the tab. */
  'how.title': 'Что делают эти кнопки',
  'how.read': '**Считать слоты** и **Дамп** ничего не меняют в камере.',
  'how.flash':
    '**Записать расшифрованный образ** берёт незашифрованный образ, перед передачей шифрует его так, как нужно прошивке этого слота, и показывает план. **Записать сырые байты** передаёт файл ровно в том виде, в каком он дан. Ни то, ни другое ничего не отправляет, пока вы не подтвердите.',
  'how.ff':
    'Запись в {letterR} требует дополнительного подтверждения, как любая запись в слот восстановления. **Пустой** слот (окно его заголовка читается как сплошные 0xFF, как {b} у многих камер 2014 года) — это состояние, а не неисправность. Записывается он точно так же, как любой другой слот.',
  'how.copy':
    '**Восстановить из полной резервной копии флеш-памяти** берёт .bin (весь образ флеш-памяти 4 МБ, например считанный через J-Link) или .zip, в котором он лежит (файл прогона Preserve или zip, который сохраняет «Дамп и расшифровка 4.x/Nano» или «Дамп всех селекторов»), вырезает из него этот слот, расшифровывает его и показывает план; если резервная копия похожа на копию другой камеры или другой прошивки, план об этом скажет.',
  'how.fps':
    '**Сделать N FPS** в строке слота изменяет образ этого слота на более высокую частоту кадров, а **Сделать N FPS во всех слотах** делает это со всеми слотами, где патч доступен, с одним подтверждением, причём слот, с которого камера запущена сейчас, — последним. Для слота, где патч недоступен, страница объясняет почему.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Каждая запись сначала сохраняет свой слот**: слот считывается заново и сохраняется в один скачиваемый zip-архив, в имени которого время, серийный номер камеры, прошивка, слот и вид записи (например, `{example}`); в нём — слот в том виде, в каком он хранится, его расшифрованный образ и пояснение к каждому файлу. Чтобы вернуться назад, запишите расшифрованный файл из zip-архива кнопкой **Записать расшифрованный образ**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Запись стирает один слот размером 64 КБ и программирует его заново. Загрузчик по адресу `{address}` и конфигурация запуска здесь никогда не записываются, и выбрать активный слот здесь нельзя. Слот вступает в силу только после того, как камеру отключат и снова подключат.',
} satisfies Translation<'slots'>;
