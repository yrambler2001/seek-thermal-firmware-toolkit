/**
 * Namespace `slots`, українська (uk), translated from the English source: the firmware-slots tab.
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
  'section.title': 'Робота зі слотами прошивки',
  'section.badge': 'Записує у флеш-пам’ять',
  'section.description':
    'Кнопка «Зчитати слоти» запитує в камери, яку прошивку вона виконує, зчитує три її слоти прошивки — {a}, {b} і {r} — і показує, що в кожному. Зчитування й дамп нічого не змінюють. Кнопка запису питає, перш ніж надіслати хоч один байт.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Ця сторінка може записувати у флеш-пам’ять камери.** Запис стирає один слот на 64 КБ і програмує його заново. Образ, правильний за структурою, але непрацездатний, залишить камеру такою, що не запускається, а завантажувач не працює з USB — відновити камеру можна лише через SWD/J-Link або програматором SPI. Спершу зробіть дамп слота й збережіть файл.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Дії зі слотами',
  'actions.read': 'Зчитати слоти',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Слоти',

  /* Before any read. */
  'empty.connected':
    'Натисніть «Зчитати слоти». Спершу камеру запитають, яку збірку вона виконує, і на збірці, яку ця сторінка не підтримує, нічого не буде активовано.',
  'empty.disconnected': 'Під’єднайте камеру, потім натисніть «Зчитати слоти».',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Ця збірка тут не підтримується, тож жоден слот не зчитано і жоден не можна записати.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Не визначено: сторінка не може встановити, яку збірку виконує камера.',
  'refusal.notIdentified.body':
    'Камера не повідомила придатної версії прошивки, тож жоден слот не зчитано й нічого не активовано. Ця сторінка охоплює збірки {minVersion} і новіші. Збірки до {minVersion} сторінка слотів не підтримує, тож камеру з такою збіркою тут ніколи не зчитують.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Якщо камера має підтримувану збірку, можливо, вона ще запускається. {hint}',
  'refusal.title': 'Відхилено — нічого не активовано.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Зчитування ...',
  'status.readingAgain': 'Повторне зчитування слотів ...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Зчитування завершено. Зчитано слотів: {read}/{count}.',
    few: 'Зчитування завершено. Зчитано слотів: {read}/{count}.',
    many: 'Зчитування завершено. Зчитано слотів: {read}/{count}.',
    other: 'Зчитування завершено. Зчитано слотів: {read}/{count}.',
  },
  'status.unsupported': 'На цій збірці не підтримується — жоден слот не зчитано.',
  'status.refused': 'Відхилено — нічого не активовано. Див. повідомлення під журналом.',
  'status.disconnected': 'Пристрій від’єднано — зчитайте слоти ще раз.',
  'status.newDevice': 'Вибрано новий пристрій — зчитайте слоти ще раз.',
  'status.dumping': 'Дамп {bank:gen} ...',
  'status.dumped': 'Дамп {bank:gen} знято.',
  'status.readingImage': 'Читання образу ...',
  'status.ready': 'Готово — перегляньте план, потім запишіть.',
  'status.rejected': 'Відхилено — див. журнал вище.',
  'status.writing': 'Запис ...',
  'status.patching': 'Патч {bank:gen} ...',
  'status.patchingEvery': 'Патч усіх слотів ...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Записано, але контрольне зчитування не збігається — див. результат.',
  'status.written.verified': 'Записано. Контрольне зчитування збігається із записаним.',
  'status.written.notCompared':
    'Записано. Контрольне зчитування не порівнювалося — див. результат.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Пропатчено, але контрольне зчитування відрізняється не лише так, як заплановано, — див. результат.',
  'status.patched.ok': 'Пропатчено. Контрольне зчитування відповідає плану.',
  'status.patched.unchecked': 'Пропатчено. Контрольне зчитування не перевірено — див. результат.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Зупинено на {bank:loc} — пропатчено слотів: {count}; див. результат.',
    few: 'Зупинено на {bank:loc} — пропатчено слотів: {count}; див. результат.',
    many: 'Зупинено на {bank:loc} — пропатчено слотів: {count}; див. результат.',
    other: 'Зупинено на {bank:loc} — пропатчено слотів: {count}; див. результат.',
  },
  'status.every.unchecked': {
    one: 'Пропатчено слотів: {count}, але одне з контрольних зчитувань не перевірено за планом — див. результат.',
    few: 'Пропатчено слотів: {count}, але одне з контрольних зчитувань не перевірено за планом — див. результат.',
    many: 'Пропатчено слотів: {count}, але одне з контрольних зчитувань не перевірено за планом — див. результат.',
    other:
      'Пропатчено слотів: {count}, але одне з контрольних зчитувань не перевірено за планом — див. результат.',
  },
  'status.every.ok': {
    one: 'Пропатчено слотів: {count}. Контрольне зчитування кожного відповідає плану.',
    few: 'Пропатчено слотів: {count}. Контрольне зчитування кожного відповідає плану.',
    many: 'Пропатчено слотів: {count}. Контрольне зчитування кожного відповідає плану.',
    other: 'Пропатчено слотів: {count}. Контрольне зчитування кожного відповідає плану.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Скасовано — нічого не записано.',
  'status.cancelled.one':
    'Скасовано після того, як надіслано підтвердження запису в {bank:acc}, — слот міг бути записаний частково. Зчитайте його, перш ніж на нього покладатися.',
  'status.cancelled.many':
    'Скасовано після того, як надіслано підтвердження запису в {banks:acc}, — кожен із них міг бути записаний частково. Зчитайте їх, перш ніж на них покладатися.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Спершу під’єднайте камеру.',
  'gate.busy': 'Виконується інша операція — дочекайтеся її завершення.',
  'gate.readFirst': 'Спершу зчитайте слоти.',
  'gate.cameraRefused':
    'Цю камеру не можна записати звідси — причина в повідомленні вище. Нічого не надсилається.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Не зчитано: {reason}. Перед записом зчитайте слоти ще раз.',
  'gate.notReadNoReason':
    'Не зчитано: цей слот не зчитувався. Перед записом зчитайте слоти ще раз.',
  'gate.emptyNotWritable': 'Цей слот порожній, і на цій збірці його не можна записати: {reason}',
  'gate.noSuchBank': 'У цій збірці такого слота немає.',

  /* The bank table. */
  'table.caption':
    'Кожен слот прошивки цієї камери — {a}, {b} і {r} — таким, яким його зчитано й перевірено в браузері',
  'table.col.bank': 'Слот',
  'table.col.firmware': 'Прошивка',
  'table.col.size': 'Розмір',
  'table.col.key': 'Ключ',
  'table.col.bootable': 'Запуск',
  'table.col.sha': 'SHA-256 розшифрованого',
  'table.col.actions': 'Дії',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'не зчитано — {reason}',
  'table.notReadNoReason': 'не зчитано — слот не зчитувався',
  /* A badge: the bank holds no image. */
  'table.empty': 'порожній',
  'table.emptyNote':
    'Образу немає: вікно заголовка цього слота читається як суцільні 0xFF, тож із нього нічого не розшифровується, а запис у нього не перезаписує жодної прошивки.',
  /* {why} and {reason} are core's. */
  'table.emptyWritable': 'Можна записати. {why}',
  'table.emptyNotWritable': 'На цій збірці не можна записати: {reason}',
  'table.unknownVersion': 'невідома версія',
  /* {id} is the image id in hex. */
  'table.imageId': 'образ {id}',
  'table.noImage': 'немає образу',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'слот {size} Б',
  'table.imageSize': 'образ {size} Б',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'немає (незашифровано)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— нічого запускати',
  'table.boot.bootable': 'запускається — завантажувач має для нього ключ',
  'table.boot.notBootable': 'не запускається — під час запуску пропускається',
  'table.boot.recoveryOnly':
    'лише як слот відновлення — слот {letterR} запускається, коли в слотах {letterA} і {letterB} немає нічого, що приймає завантажувач (виміряно на камері для ранішої форми цього образу); чи запускається ця форма, не перевірено',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'невідомо — {why}',
  /* The row's buttons. */
  'table.dump': 'Дамп',
  'table.flashPlain': 'Записати розшифрований образ…',
  'table.flashRaw': 'Записати сирі байти…',
  'table.restore': 'Відновити з повної резервної копії флеш-пам’яті (.bin або .zip)…',
  'table.makeFps': 'Зробити {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Копіювати в {bank:acc}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: недоступно',
  'table.copyNote':
    'Копіює прошивку з цього слота, як її розшифрувало це зчитування, у вибраний вами слот, хоч би що в ньому зараз було. Перш ніж щось буде надіслано, ви переглянете план.',
  'table.restoreNote':
    'Виберіть повну резервну копію флеш-пам’яті: .bin (цілий образ флеш-пам’яті на 4 МБ, наприклад зчитаний через J-Link) або .zip, що його містить (файл прогону Preserve або zip, який зберігає «Дамп і розшифрування 4.x/Nano» чи «Зчитати всі селектори»). З нього вирізається цей слот, розшифровується й показується як план, перш ніж щось буде надіслано.',
  'table.fpsNote':
    'Підвищує частоту цього слота з {fromHz} Hz до {toHz} Hz, змінюючи його байти. Спершу слот зберігається в zip-архів для завантаження, і розшифрований файл у ньому — шлях назад.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery':
    '{booted}, а також це слот відновлення: запис у нього потребує додаткового підтвердження.',
  'table.risk.booted': '{booted}: запис у нього потребує додаткового підтвердження.',
  'table.risk.recovery': '{bank}: запис у нього потребує додаткового підтвердження.',
  'table.risk.bootUnnamed':
    'Камера не називає слот, з якого запущена: запис у нього потребує додаткового підтвердження.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Патч частоти кадрів застосовано: цей образ працює на {hz} Hz.',
  'fps.earlierPatch':
    'Патч частоти кадрів не пропонується: у цьому слоті ранніший патч {hz} Hz без виправлення USB. Відновіть заводський образ, потім натисніть «Зробити {hz} FPS».',
  'fps.atRate': 'Патч частоти кадрів не потрібен: ця збірка вже працює на {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Патч частоти кадрів не пропонується: {reason}',
  'fps.readFirst': 'спершу зчитайте слоти — патч розраховується з власного образу слота',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Усі слоти',
  'everyBank.make': 'Зробити {hz} FPS в усіх слотах',
  'everyBank.faster': 'Пришвидшити всі слоти',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Пропатчує {order:acc} за одне підтвердження; кожен спершу зберігається в один zip-архів для завантаження, а після запису зчитується для контролю.',
  'everyBank.noteBootedLast':
    'Пропатчує {order:acc} за одне підтвердження, а слот, з якого камера запущена зараз, — останнім; кожен спершу зберігається в один zip-архів для завантаження, а після запису зчитується для контролю.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': 'образ {bank:gen}',
  'what.restore': '{bank} з файлу {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Підготовлено для {bank:gen} за адресою {address}',
  'preview.file': 'Файл',
  'preview.source': 'Звідки взято образ',
  'preview.target': 'Ціль',
  'preview.targetEmpty':
    '{bank} порожній: у ньому немає образу, тож цей запис не перезапише жодної прошивки',
  'preview.readAs': 'Прочитано як',
  'preview.readAs.ff': 'розшифрований образ FF {version}',
  'preview.readAs.plain': 'розшифрований образ',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'сирі байти',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Передавання',
  'preview.key': 'Ключ',
  'preview.payload': 'Дані',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} Б, {count} частина до {chunk} Б',
    few: '{size} Б, {count} частини до {chunk} Б',
    many: '{size} Б, {count} частин до {chunk} Б',
    other: '{size} Б, {count} частини до {chunk} Б',
  },
  'preview.checksum': 'Контрольна сума передачі',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Зберігатиметься після запису',
  'preview.storedNotPredicted': 'не передбачено — перевіркою є контрольне зчитування',
  'preview.storedPredicted': 'передбачено {size} Б',
  'preview.storedKeyB': 'передбачено {size} Б — образ XOR ключ B, а не самі передані дані',
  'preview.savedFirst': 'Спершу збережено',
  'preview.compareCaption': 'Що зміниться в {bank:loc}',
  'preview.col.field': 'Поле',
  'preview.col.now': 'Зараз',
  'preview.col.after': 'Після запису',
  'preview.readFirst': 'Прочитайте перед записом:',
  /* {note} is core's note about this write. */
  'preview.note': 'Примітка: {note}',
  'preview.nothingSent':
    'У камеру ще нічого не надіслано. Запис передасть ці дані в {bank:acc} і підтвердить запис.',
  'preview.toolbar': 'Дії запису для {bank:gen}',
  'preview.write': 'Записати в {bank:acc}…',
  'preview.discard': 'Відкинути',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Записати {what} у {bank:acc} за адресою {address}?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Запис у нього замінить прошивку, з якою камера працює зараз. Якщо новий образ не запуститься, камера може взагалі не запуститися.',
  'writeConfirm.recovery':
    '{bank} — слот відновлення, остання резервна копія, до якої вдається завантажувач. Запис у нього залишить камеру без цієї копії, доки її не буде відновлено.',
  'writeConfirm.bootUnnamed':
    'Камера не повідомляє, з якого слота запускається, тож {bank} вважається тим, з якого вона запущена зараз. Запис у нього може замінити прошивку, з якою працює камера.',
  'writeConfirm.empty':
    '{bank} порожній: у ньому немає образу, тож жодна прошивка не буде перезаписана.',
  'writeConfirm.eraseEmpty':
    'Запис однаково стирає блок флеш-пам’яті камери на 64 КБ у {bank:loc} (він уже чистий) і програмує його.',
  'writeConfirm.erase':
    'Це стирає блок флеш-пам’яті камери на 64 КБ у {bank:loc} і програмує його.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'Образ записується під таким ключем: {key}. Кожен інший слот записується так само.',
  'writeConfirm.backup':
    'Перш ніж щось буде надіслано, {bank} буде зчитано ще раз і збережено як один zip-архів для завантаження: {file}. Перевірте, чи він є в теці завантажень.',
  'writeConfirm.noReset':
    'Скидання не надсилається. Потім від’єднайте й знову під’єднайте камеру, щоб слот почав діяти.',
  'writeConfirm.noUsbRecovery':
    'Якщо образ не запуститься, відновити камеру через USB не вдасться — лише через SWD/J-Link або програматором SPI.',
  'writeConfirm.ackUnnamed':
    'Я розумію, що камера не повідомляє, з якого слота запускається, тож цей слот вважається тим, з якого її запущено, і що поганий образ може залишити камеру такою, що не запускається.',
  'writeConfirm.confirm': 'Так — записати в {bank:acc}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Я розумію, що з цього слота камера запущена зараз і що поганий образ може залишити камеру такою, що не запускається.',
  'ack.recovery':
    'Я розумію, що це слот відновлення і що поганий образ залишить камеру без останньої резервної копії.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Перевести {bank:acc} на {hz} FPS?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted': '{bootsNow}. Пропатчений образ замінить прошивку, з якою вона працює зараз.',
  'fpsConfirm.recovery':
    '{bank} — слот відновлення, остання резервна копія, до якої вдається завантажувач.',
  'fpsConfirm.what':
    'У {bank:loc} прошивка {version}, і ця зміна змусить її образ працювати на {toHz} Hz замість {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(невідома)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'Патч змінює {count} байт образу і слово контрольної суми, тож сума, яку перевіряє завантажувач, лишається правильною. Пари ключів патч не торкається.',
    few: 'Патч змінює {count} байти образу і слово контрольної суми, тож сума, яку перевіряє завантажувач, лишається правильною. Пари ключів патч не торкається.',
    many: 'Патч змінює {count} байтів образу і слово контрольної суми, тож сума, яку перевіряє завантажувач, лишається правильною. Пари ключів патч не торкається.',
    other:
      'Патч змінює {count} байта образу і слово контрольної суми, тож сума, яку перевіряє завантажувач, лишається правильною. Пари ключів патч не торкається.',
  },
  'fpsConfirm.wayBack':
    'Розшифрований файл у цьому zip-архіві — шлях назад: щоб скасувати патч, запишіть його кнопкою «Записати розшифрований образ» у {bank:acc}.',
  'fpsConfirm.noReset':
    'Скидання не надсилається. Потім від’єднайте й знову під’єднайте камеру, щоб пропатчений слот почав діяти.',
  'fpsConfirm.ackUnnamed':
    'Я розумію, що камера не повідомляє, з якого слота запускається, тож цей слот вважається тим, з якого її запущено.',
  'fpsConfirm.confirm': 'Так — пропатчити {bank:acc}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Перевести всі слоти на {hz} FPS?',
  'fpsEvery.titleMixed': {
    one: 'Змінити частоту кадрів у {count} слоті?',
    few: 'Змінити частоту кадрів у {count} слотах?',
    many: 'Змінити частоту кадрів у {count} слотах?',
    other: 'Змінити частоту кадрів у {count} слотах?',
  },
  'fpsEvery.intro': {
    one: 'Буде пропатчено {count} слот із прошивкою {version}, для якого це доступно:',
    few: 'Буде пропатчено {count} слоти із прошивкою {version}, для яких це доступно:',
    many: 'Буде пропатчено {count} слотів із прошивкою {version}, для яких це доступно:',
    other: 'Буде пропатчено {count} слота із прошивкою {version}, для яких це доступно:',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (слот, з якого камера запущена зараз, і слот відновлення)',
  'fpsEvery.role.booted': '{bank} (слот, з якого камера запущена зараз)',
  'fpsEvery.role.recovery': '{bank} (слот відновлення, остання резервна копія)',
  'fpsEvery.role.bootUnnamed': '{bank} (камера не повідомляє, з якого слота запускається)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: з {fromHz} Hz на {toHz} Hz, {count} байт і слово контрольної суми.',
    few: '{bank}: з {fromHz} Hz на {toHz} Hz, {count} байти і слово контрольної суми.',
    many: '{bank}: з {fromHz} Hz на {toHz} Hz, {count} байтів і слово контрольної суми.',
    other: '{bank}: з {fromHz} Hz на {toHz} Hz, {count} байта і слово контрольної суми.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Залишаються без змін: {others}',
  'fpsEvery.orderOne': 'Записує лише {bank:acc} і зчитує його для контролю.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Вони записуються в такому порядку: {order}. Кожен зчитується для контролю перед наступним, і перша ж помилка зупиняє решту.',
  'fpsEvery.orderBootedLast':
    'Вони записуються в такому порядку: {order}. Слот, з якого камера запущена зараз, іде останнім, тож у разі помилки до нього не дійде. Кожен зчитується для контролю перед наступним, і перша ж помилка зупиняє решту.',
  'fpsEvery.wayBack':
    'Розшифровані файли в цьому zip-архіві — шлях назад: щоб скасувати патч слота, запишіть його файл кнопкою «Записати розшифрований образ» у той самий слот.',
  'fpsEvery.noReset':
    'Скидання не надсилається. Потім від’єднайте й знову під’єднайте камеру, щоб пропатчені слоти почали діяти.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Я розумію, що буде записано {banks} і що поганий образ може залишити камеру такою, що не запускається.',
  'fpsEvery.confirm': {
    one: 'Так — пропатчити {count} слот',
    few: 'Так — пропатчити {count} слоти',
    many: 'Так — пропатчити {count} слотів',
    other: 'Так — пропатчити {count} слота',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: контрольне зчитування збігається із записаним.',
  'outcome.mismatch': '{bank} — {what}: контрольне зчитування НЕ збігається із записаним.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: контрольне зчитування виконано, але не порівняно, тож цей запис тут не перевірено.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'Підтвердження запису в камері повернуло статус {status}.',
  'outcome.wasEmpty': '{bank} перед цим записом був порожній, тож жодну прошивку не перезаписано.',
  'outcome.provenVerified':
    'Наразі доведено: дані передано, запис підтверджено, і контрольне зчитування слота збігається із записаним. НЕ доведено: що завантажувач вибере цей слот і що образ запуститься.',
  'outcome.provenCommitted':
    'Наразі доведено: дані передано й запис підтверджено. НЕ доведено: що завантажувач вибере цей слот і що образ запуститься.',
  'outcome.replug':
    '**ТЕПЕР ВІД’ЄДНАЙТЕ Й ЗНОВУ ПІД’ЄДНАЙТЕ КАМЕРУ.** Скидання не надсилалося, тож слот почне діяти лише після справжнього вимкнення й увімкнення живлення. Потім зчитайте слоти ще раз: остаточно це підтвердять лише версія й активний слот, які повідомить камера.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**ТЕПЕР ВІД’ЄДНАЙТЕ Й ЗНОВУ ПІД’ЄДНАЙТЕ КАМЕРУ.** Скидання не надсилалося. Потім зчитайте слоти ще раз.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Спершу збережено як завантаження: {file}.',
  'outcome.wayBackOne':
    'Розшифрований файл у ньому — шлях назад («Записати розшифрований образ» у той самий слот).',
  'outcome.wayBackMany':
    'Розшифровані файли в ньому — шлях назад («Записати розшифрований образ» у кожен слот).',
  'outcome.checkDownloads': 'Перевірте, чи він є в теці завантажень.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank} — пропатчено з {fromHz} Hz на {toHz} Hz (прошивка {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'Контрольне зчитування відрізняється від збереженого дампу лише в {count} запланованому байті: у місцях патча і в слові суми.',
    few: 'Контрольне зчитування відрізняється від збереженого дампу лише в {count} запланованих байтах: у місцях патча і в слові суми.',
    many: 'Контрольне зчитування відрізняється від збереженого дампу лише в {count} запланованих байтах: у місцях патча і в слові суми.',
    other:
      'Контрольне зчитування відрізняється від збереженого дампу лише в {count} запланованих байтах: у місцях патча і в слові суми.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'Контрольне зчитування відрізняється НЕ лише так, як заплановано: неочікуваних байтів — {unexpected}, відсутніх — {count}.',
    few: 'Контрольне зчитування відрізняється НЕ лише так, як заплановано: неочікуваних байтів — {unexpected}, відсутніх — {count}.',
    many: 'Контрольне зчитування відрізняється НЕ лише так, як заплановано: неочікуваних байтів — {unexpected}, відсутніх — {count}.',
    other:
      'Контрольне зчитування відрізняється НЕ лише так, як заплановано: неочікуваних байтів — {unexpected}, відсутніх — {count}.',
  },
  'fpsOutcome.notTaken': 'Контрольне зчитування не виконано, тож патч тут не перевірено.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Усі слоти: пропатчено {done} із {count}, у такому порядку: {order}.',
    few: 'Усі слоти: пропатчено {done} із {count}, у такому порядку: {order}.',
    many: 'Усі слоти: пропатчено {done} із {count}, у такому порядку: {order}.',
    other: 'Усі слоти: пропатчено {done} із {count}, у такому порядку: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'Контрольне зчитування відрізняється від збереженого слота лише в {count} запланованому байті.',
    few: 'Контрольне зчитування відрізняється від збереженого слота лише в {count} запланованих байтах.',
    many: 'Контрольне зчитування відрізняється від збереженого слота лише в {count} запланованих байтах.',
    other:
      'Контрольне зчитування відрізняється від збереженого слота лише в {count} запланованих байтах.',
  },
  'fpsEveryOutcome.notTaken': 'Контрольне зчитування не виконано.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Зупинено: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Не записано: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Жоден слот цієї камери не можна записати звідси.',
  'keys.title': 'Ключі для запису',
  'keys.chain': 'Ланцюжок',
  'keys.chainPlain':
    'незашифрований ланцюжок 2014 року: кожен слот зберігається незашифрованим, тож жоден не має ключа',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Записується як',
  'keys.writtenPlain': 'образ як є, без ключа, у будь-який слот',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Передається як',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Зберігається як',
  'keys.refused': 'Відхилено',
  'keys.bootedBank': 'Слот запуску',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank} містить {key:acc}',
  'keys.theBootedBank': 'слот, з якого запущено камеру',
  'keys.unnamedKey': 'ключ, який сторінка не може назвати',
  'keys.bootedBanksKey': 'ключ слота, з якого запущено камеру',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; кожен слот записується так само',

  /* "What these buttons do", below the tab. */
  'how.title': 'Що роблять ці кнопки',
  'how.read':
    '**Зчитати слоти** і **Дамп** нічого не змінюють у камері. Насамперед камеру запитують, яку збірку вона виконує; про збірку, старшу за {minVersion}, буде повідомлено, а її слоти не зчитуватимуться.',
  'how.flash':
    '**Записати розшифрований образ** бере незашифрований образ, шифрує його так, як потрібно прошивці цього слота, перш ніж передати, і показує план. **Записати сирі байти** передає файл точно таким, як він є. Жодна з цих кнопок нічого не надсилає, доки ви не підтвердите.',
  /* FF = the 16 Hz "FF" build of the Compact; the vendor app = Seek's own phone app. */
  'how.ff':
    'Compact на 1.3.0.8 може мати збірку 8 Hz або збірку FF 16 Hz, і обидві повідомляють ту саму версію. Камера розрізняє їх сама: її власна відповідь для кожного слота каже, чи приймає його застосунок, який відповідає, а відповіді кожної збірки можна передбачити. Образ 8 Hz записується в будь-який слот. Образ FF передається так, як його передає застосунок виробника (образ XOR ключ A), а збірка 16 Hz зберігає його під ключем B, у будь-якому слоті. Сторінка його не відхиляє: ще до підтвердження план каже, що камера, як очікується, з ним зробить (збірка 8 Hz відхиляє його під час підтвердження запису, а камера з іншою версією програмує його таким, яким він надісланий, і запустити його не може). Чи запускається образ FF, НЕ ПЕРЕВІРЕНО: серед зібраних образів немає справжнього завантажувача цієї збірки. Запис у слот {letterR} потребує додаткового підтвердження, як і будь-який запис у слот відновлення. **Порожній** слот (його вікно заголовка читається як суцільні 0xFF, як {b} на багатьох камерах 2014 року) — це стан, а не несправність. Його дамп — сирі 64 КБ із 0xFF, розшифровувати нічого, і записується він точно так само, як будь-який інший слот; план і підтвердження кажуть, що жодна прошивка не перезаписується.',
  /* {copyA}, {copyB}, {copyR} are the three copy buttons' own labels (table.copyTo: "Copy to slot A"…). */
  'how.copy':
    '**{copyA}**, **{copyB}** і **{copyR}** у рядку слота записують прошивку з цього слота, як її розшифрувало це зчитування, в інший слот, хоч би що в ньому зараз було. Образ передається так само, як будь-який розшифрований образ, тож план і підтвердження такі самі, як для файлу. **Відновити з повної резервної копії флеш-пам’яті** бере .bin (цілий образ флеш-пам’яті на 4 МБ, наприклад зчитаний через J-Link) або .zip, що його містить (файл прогону Preserve або zip, який зберігає «Дамп і розшифрування 4.x/Nano» чи «Зчитати всі селектори»), вирізає з нього цей слот, розшифровує його й показує план; якщо резервна копія схожа на копію іншої камери чи іншої прошивки, план про це скаже. Слот, порожній у резервній копії або не зчитаний дампом, не можна відновити записом, і сторінка про це повідомить.',
  'how.fps':
    '**Зробити N FPS** у рядку слота змінює образ цього слота на вищу частоту кадрів, а **Зробити N FPS в усіх слотах** робить це з кожним слотом, де це доступно, за одне підтвердження, причому слот, з якого камера запущена зараз, — останнім. Для слота, де це недоступно, сказано чому.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Кожен запис спершу зберігає свій слот**: слот зчитується ще раз і зберігається як один zip-архів для завантаження з назвою, що містить час, серійний номер камери, прошивку, слот і вид запису (наприклад, `{example}`); у ньому — слот у тому вигляді, як він зберігається, його розшифрований образ і примітка про те, що це за файли. Запис чекає, доки почнеться завантаження. Браузер не повідомляє, коли завантаження потрапляє на диск, тож перевірте теку завантажень. Щоб повернутися назад, запишіть розшифрований файл із zip-архіву кнопкою **Записати розшифрований образ**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Запис стирає один слот на 64 КБ і програмує його заново. Завантажувач за адресою `{address}` і конфігурація запуску тут ніколи не записуються, і немає жодного елемента керування для вибору активного слота. Слот починає діяти лише після того, як камеру від’єднають і знову під’єднають.',
} satisfies Translation<'slots'>;
