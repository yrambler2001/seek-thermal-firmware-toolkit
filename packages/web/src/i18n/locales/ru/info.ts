/**
 * Namespace `info`, русский (ru), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/InfoView.tsx, hooks/useInfoPanel.ts, components/CameraReport.tsx (its labels only: the
 * copyable report text stays English).
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useInfoPanel: the status line. */
  'status.notRead': 'Ещё не считано.',
  'status.reading': 'Считывание ...',
  'status.noVersion': 'Версия не получена.',
  'status.tooOld': 'Считано. Прошивка {version} старше 0.8.0.0 — больше ничего не считывалось.',
  'status.read': 'Считано. Прошивка {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Считать камеру',
  'read.description':
    'Только чтение. Спрашивает камеру, что на ней работает, как она запускается, какие ключи в ней хранятся и что лежит в каждом слоте: то же считывание, что и seek-fw info. Ничего не записывается.',
  'read.actions': 'Действия: сведения',
  'read.button': 'Считать версию прошивки',
  'read.connectFirst': 'Сначала подключите камеру выше, затем нажмите «Считать версию прошивки».',
  'read.showDetails': 'Подробности в журнале',
  'read.panel': 'Версия прошивки',
  'result.title': 'Что сообщает камера',
  'result.version': 'Версия прошивки',
  'result.build': 'Сборка',
  'result.range': 'Диапазон версий',
  'result.tab': 'Вкладка для этой камеры',
  'result.rangeLegacy': '0.x / 1.x: камеры 2014 и 2016 годов',
  'result.rangeModern': '2.x и новее: камеры 4.x, Nano и Mosaic',
  'result.rangeUnknown': 'неизвестно',
  'result.noVersion':
    '**Камера не сообщила версию прошивки.** Больше ничего не отправлено. Отключите её, подключите снова, дождитесь окончания запуска и считайте ещё раз.',
  'result.noTab': 'Ни одна вкладка не считывает эту сборку.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Для этой камеры откройте вкладку <tab>{tab}</tab>. Прежде чем что-либо считать, эта вкладка ещё раз спрашивает камеру, к какому семейству она относится, и отказывает камере не своего семейства.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'Для чего каждая вкладка',
  'tabs.intro':
    'Пять вкладок, в таком порядке. Каждая — отдельная страница, а в заголовке видно, на какой вы сейчас.',
  'tabs.caption': 'Вкладки: что делают, какие камеры охватывают и пишут ли в камеру',
  'tabs.tab': 'Вкладка',
  'tabs.does': 'Что делает',
  'tabs.cameras': 'Камеры',
  'tabs.writes': 'Пишет в камеру?',
  'tabs.info.does':
    'Считывает то, что сообщает камера: её прошивку, семейство, которым она себя называет, способ запуска, ключи и каждый слот. То же считывание, что и seek-fw info. Ничего не записывает.',
  'tabs.info.cameras': 'Любая камера Seek, которую может открыть WebUSB.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Нет.',
  'tabs.preserve.does':
    'Делает полную копию 4 МБ флеш-памяти камеры, сохраняя файл прогона после каждого шага, и может вернуть на место пропатченную прошивку. Проводит по шагам по одному.',
  'tabs.preserve.cameras':
    'Камеры с прошивкой 0.x и 1.x: сборки Compact 2014 года, сборки Compact PRO 2016 года (1.0.3.x) и сборка Compact 1.3.0.8 FF (16 Hz).',
  'tabs.preserve.writes':
    'Да, в два шага, и перед каждым спрашивает. Возвращает камеру в прежнее состояние.',
  'tabs.v4.does':
    'Считывает всю флеш-память камеры 4.x или Nano и расшифровывает найденные слоты прошивки. Только чтение: отправляет шесть команд чтения и ни одной команды записи.',
  'tabs.v4.cameras':
    'Камеры с прошивкой 4.x (Compact, Compact PRO, Compact XR), Mosaic (10.x и 2.x) и Nano (42.x и 44.x), начиная с 2018 года.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Нет.',
  'tabs.decrypt.does':
    'Расшифровывает уже имеющийся у вас файл: полный дамп — слот за слотом — или отдельный слот прошивки размером 64 КБ. Результат можно скачать.',
  'tabs.decrypt.cameras':
    'Никакие. Камера не нужна, поэтому вкладка работает, когда ничего не подключено, и в любом браузере.',
  'tabs.decrypt.writes': 'Нет. Записывает только скачиваемый файл.',
  'tabs.slots.does':
    'Считывает три слота прошивки (слот A, слот B и слот восстановления R), показывает, что в каждом из них и с какого запускается камера, и может снять дамп или записать по одному слоту за раз.',
  'tabs.slots.cameras': 'Камеры с прошивкой 0.8.0.0 и новее.',
  'tabs.slots.writes': 'Да, по одному слоту за раз, и перед каждой записью спрашивает.',

  /* views/InfoView: where the 2016 and 1.3.0.8 FF builds are. Tab names in ** are the tab labels. */
  'split.title': 'Где сборки 2016 года и 1.3.0.8 FF',
  'split.where':
    'Сборки Compact PRO 2016 года (1.0.3.0 и 1.0.3.2, включая их варианты FF) и сборка Compact 1.3.0.8 FF (16 Hz) — **не** камеры 4.x, и считываются они не так. У них закрытый протокол 2014–2017 годов, а слоты их прошивка хранит под другим шифром (2016) или как незашифрованную цепочку 2014 года с маршрутом только через слот восстановления (FF). Поэтому они на вкладке **Дамп и расшифровка 0.x/1.x 2014/2016**, а вкладка 4.x/Nano отказывает им до того, как что-либо считает.',
  'split.evidence':
    'Чем подтверждено, что они работают на вкладке 0.x/1.x: у конвейера Preserve есть выведенный патч для каждой из них, и его прогоны на эмуляторе проходят для обеих. Сборка 1.0.3.0 на своём родном дампе 2016 года прошла резервное копирование, патч, подтверждение записи, полное считывание, восстановление и сверку; 1.3.0.8 FF прошла свой маршрут через слот восстановления. На стендовой камере, Compact PRO 1.0.3.0, считывание шага 02 Preserve завершилось без сброса и без записи, а камера была опознана как камера с шифром 2016 года. На этих сборках карта селекторов 4.x отклоняется для 38 из 63 селекторов, так что вкладка 4.x могла бы вернуть для них только пропуски.',
  /* "There" is the 4.x/Nano tab: the page once had a firmware-family selector there, and it is gone, so no setting routes these builds into the 4.x/Nano read. */
  'split.stay':
    'Поэтому они остаются на вкладке 0.x/1.x, а на вкладке 4.x/Nano нет выбора семейства, который отправил бы их туда.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Камера',
  'report.product': 'Продукт',
  'report.manufacturer': 'Производитель',
  'report.serial': 'Серийный номер',
  'report.platform': 'Платформа',
  'report.usbLink': 'Связь USB',
  'report.noProduct': '(нет строки продукта)',
  'report.none': '(нет)',
  'report.unreadable': '(не читается)',
  'report.firmware': 'Прошивка',
  'report.running': 'Работает',
  'report.bootloader': 'Загрузчик',
  'report.family': 'Семейство прошивок',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Считано как',
  'report.detected': 'Определено',
  'report.boot': 'Запуск',
  'report.booted': 'Запущена с',
  'report.lastStart': 'Последний запуск',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'Работает (1.3.0.8)',
  'report.nextStart': 'Следующий запуск',
  'report.upgradeTarget': 'Цель обновления',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(не запрашивалось)',
  'report.targetConfirmed': '{slot} (подтверждено камерой)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'неизвестно: {why}. Для образа FF 16 Hz камера должна сообщить, какая сборка на ней работает (вкладка слотов это спрашивает)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': 'сборка FF 16 Hz 1.3.0.8',
  'report.build8Hz': 'сборка 8 Hz 1.3.0.8',
  'report.keys': 'Ключи',
  'report.slots': 'Слоты',
  'report.slotsCaption':
    'Каждый слот в том виде, в каком его нашло считывание. Только чтение: пишет вкладка слотов.',
  'report.slot': 'Слот',
  'report.address': 'Адрес',
  'report.version': 'Версия',
  'report.size': 'Размер',
  'report.key': 'Ключ',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Принимает',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Концевик',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Запускается',
  'report.bytes': '{count} Б',
  'report.plaintext': 'нет (не зашифрован)',
  /** A table value, lower case: "yes". */
  'report.yes': 'да',
  /** A table value, lower case: "no". */
  'report.no': 'нет',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'н/д',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Запись',
  'report.noBankWritten': 'Ни один слот этой камеры не записывается:',
  /* {staged} is core's phrase for how a bank is written. */
  'report.oneBank':
    'По одному слоту за раз: вкладка слотов записывает или патчит один слот этой камеры, каждый слот {staged}, и перед каждой записью спрашивает.',
  'report.refusesEvery': 'Вкладка слотов отказывает в записи каждому слоту этой камеры:',
} satisfies Translation<'info'>;
