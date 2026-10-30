/**
 * Namespace `info`, українська (uk), translated from the English source.
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
  'status.notRead': 'Ще не зчитано.',
  'status.reading': 'Зчитування ...',
  'status.noVersion': 'Версію не повідомлено.',
  'status.tooOld': 'Зчитано. Прошивка {version} старша за 0.8.0.0 — більше нічого не зчитано.',
  'status.read': 'Зчитано. Прошивка {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Зчитати дані камери',
  'read.description':
    'Лише читання. Запитує в камери, яку прошивку вона виконує, як запускається, які ключі має і що в кожному слоті: те саме зчитування, що й seek-fw info. Нічого не записується.',
  'read.actions': 'Дії зчитування інформації',
  'read.button': 'Зчитати версію прошивки',
  'read.connectFirst': 'Спершу під’єднайте камеру вище, потім натисніть «Зчитати версію прошивки».',
  'read.showDetails': 'Показувати подробиці в журналі',
  'read.panel': 'Версія прошивки',
  'result.title': 'Що повідомляє камера',
  'result.version': 'Версія прошивки',
  'result.build': 'Збірка',
  'result.range': 'Діапазон версій',
  'result.tab': 'Вкладка для цієї камери',
  'result.rangeLegacy': '0.x / 1.x: камери 2014 і 2016 років',
  'result.rangeModern': '2.x і новіші: камери 4.x, Nano і Mosaic',
  'result.rangeUnknown': 'невідомо',
  'result.noVersion':
    '**Камера не повідомила версію прошивки.** Більше нічого не надіслано. Від’єднайте її, під’єднайте знову, дочекайтеся, поки вона повністю запуститься, і зчитайте ще раз.',
  'result.noTab': 'Жодна вкладка не зчитує цю збірку.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Для цієї камери відкрийте вкладку <tab>{tab}</tab>. Перед будь-яким зчитуванням та вкладка ще раз запитує в камери, якого вона сімейства, і відхиляє камеру, що не належить до сімейства, яке вона охоплює.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'Для чого кожна вкладка',
  'tabs.intro':
    'П’ять вкладок, у такому порядку. Кожна — окрема сторінка, а в заголовку видно, на якій ви зараз.',
  'tabs.caption': 'Вкладки: що вони роблять, які камери охоплюють і чи записують у камеру',
  'tabs.tab': 'Вкладка',
  'tabs.does': 'Що робить',
  'tabs.cameras': 'Камери',
  'tabs.writes': 'Записує в камеру?',
  'tabs.info.does':
    'Зчитує те, що повідомляє камера: її прошивку, сімейство, яким вона себе називає, спосіб запуску, ключі та кожен слот. Те саме зчитування, що й seek-fw info. Нічого не записує.',
  'tabs.info.cameras': 'Будь-яка камера Seek, яку може відкрити WebUSB.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Ні.',
  'tabs.preserve.does':
    'Робить повну копію 4 МБ флеш-пам’яті камери, зберігаючи файл прогону після кожного кроку. Щоб прочитати всю пам’ять, тимчасово патчить прошивку, а потім повертає на місце оригінальну прошивку й перевіряє її. Проводить вас через кроки по одному.',
  'tabs.preserve.cameras':
    'Камери з прошивкою 0.x і 1.x: збірки Compact 2014 року, збірки Compact PRO 2016 року (1.0.3.x) і збірка Compact 1.3.0.8 FF (16 Hz).',
  'tabs.preserve.writes':
    'Так, у двох кроках, і перед кожним питає. Повертає камеру в той стан, у якому вона була.',
  'tabs.v4.does':
    'Зчитує всю флеш-пам’ять камери 4.x або Nano і розшифровує знайдені слоти прошивки. Лише читання: надсилає шість команд зчитування і жодної команди запису.',
  'tabs.v4.cameras':
    'Камери з прошивкою 4.x (Compact, Compact PRO, Compact XR), Mosaic (10.x і 2.x) і Nano (42.x і 44.x), від 2018 року.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Ні.',
  'tabs.decrypt.does':
    'Розшифровує файл, який уже є у вас: повний дамп, слот за слотом, або окремий слот прошивки на 64 КБ. Результат можна завантажити.',
  'tabs.decrypt.cameras':
    'Жодних. Камера не потрібна, тож вкладка працює без під’єднаних пристроїв і в будь-якому браузері.',
  'tabs.decrypt.writes': 'Ні. Записує лише файл для завантаження.',
  'tabs.slots.does':
    'Зчитує три слоти прошивки (слот A, слот B і слот відновлення R), показує, що в кожному і з якого з них запускається камера, і може зчитати чи записати один слот за раз.',
  'tabs.slots.cameras': 'Камери з прошивкою 0.8.0.0 і новішою.',
  'tabs.slots.writes': 'Так, по одному слоту за раз, і перед кожним записом питає.',

  /* views/InfoView: where the 2016 and 1.3.0.8 FF builds are. Tab names in ** are the tab labels. */
  'split.title': 'Де збірки 2016 року і 1.3.0.8 FF',
  'split.where':
    'Збірки Compact PRO 2016 року (1.0.3.0 і 1.0.3.2, разом із їхніми варіантами FF) і збірка Compact 1.3.0.8 FF (16 Hz) — **не** камери 4.x, і зчитуються вони не так, як 4.x. Їхній протокол — заблокований протокол 2014–2017 років, а їхня прошивка зберігає слоти під іншим шифром (2016) або як незашифрований ланцюжок 2014 року з маршрутом лише через слот відновлення (FF). Тому вони на вкладці **Дамп і розшифрування 0.x/1.x 2014/2016**, а вкладка 4.x/Nano відхиляє їх ще до будь-якого зчитування.',
  'split.evidence':
    'Докази, що вони працюють на вкладці 0.x/1.x: конвеєр Preserve має похідний патч для кожної з них, і його прогони в емуляторі успішні для обох. Збірка 1.0.3.0 на своєму рідному дампі 2016 року пройшла резервне копіювання, патч, підтвердження запису, повне зчитування, відновлення й перевірку; 1.3.0.8 FF пройшла свій маршрут через слот відновлення. На стендовій камері, Compact PRO 1.0.3.0, зчитування кроку 02 Preserve завершилося без скидання й без запису, а камеру визначено як шифр 2016 року. На цих збірках карту селекторів 4.x відхилено для 38 із 63 селекторів, тож вкладка 4.x могла б повернути для них лише прогалини.',
  /* "There" is the 4.x/Nano tab: the page once had a firmware-family selector there, and it is gone, so no setting routes these builds into the 4.x/Nano read. */
  'split.stay':
    'Тож вони залишаються на вкладці 0.x/1.x, а на вкладці 4.x/Nano немає перемикача сімейства, який відправив би їх туди.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Камера',
  'report.product': 'Продукт',
  'report.manufacturer': 'Виробник',
  'report.serial': 'Серійний номер',
  'report.platform': 'Платформа',
  'report.usbLink': 'З’єднання USB',
  'report.noProduct': '(немає назви продукту)',
  'report.none': '(немає)',
  'report.unreadable': '(не читається)',
  'report.firmware': 'Прошивка',
  'report.running': 'Запущена',
  'report.bootloader': 'Завантажувач',
  'report.family': 'Сімейство прошивок',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Зчитано як',
  'report.detected': 'Визначено',
  'report.boot': 'Запуск',
  'report.booted': 'Запущено з',
  'report.lastStart': 'Останній запуск',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'Запущена (1.3.0.8)',
  'report.nextStart': 'Наступний запуск',
  'report.upgradeTarget': 'Ціль оновлення',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(не запитувалося)',
  'report.targetConfirmed': '{slot} (підтверджено відповіддю камери)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'невідомо: {why}. Для образу FF 16 Hz камера має сказати, яку збірку вона виконує (вкладка слотів про це запитує)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': 'збірка FF 16 Hz 1.3.0.8',
  'report.build8Hz': 'збірка 8 Hz 1.3.0.8',
  'report.keys': 'Ключі',
  'report.slots': 'Слоти',
  'report.slotsCaption':
    'Кожен слот таким, яким його знайшло зчитування. Лише читання: записує вкладка слотів.',
  'report.slot': 'Слот',
  'report.address': 'Адреса',
  'report.version': 'Версія',
  'report.size': 'Розмір',
  'report.key': 'Ключ',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Приймає',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Кінцевий блок',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Запускається',
  'report.bytes': '{count} Б',
  'report.plaintext': 'немає (незашифровано)',
  /** A table value, lower case: "yes". */
  'report.yes': 'так',
  /** A table value, lower case: "no". */
  'report.no': 'ні',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'н/д',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Запис',
  'report.noBankWritten': 'Жоден слот цієї камери не записується:',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'По одному слоту за раз: вкладка слотів записує або патчить один слот цієї камери; кожен слот передається без шифрування: образ як є, без ключа. Перед кожним записом вкладка питає.',
  'report.oneBank.slotKeystream':
    'По одному слоту за раз: вкладка слотів записує або патчить один слот цієї камери; кожен слот передається під власним блоком ключів 0 свого образу. Перед кожним записом вкладка питає.',
  'report.oneBank.keyA':
    'По одному слоту за раз: вкладка слотів записує або патчить один слот цієї камери; кожен слот передається під ключами, отриманими зі слота, з якого запущено камеру, і з робочого застосунку. Перед кожним записом вкладка питає.',
  'report.oneBank.ffVendor':
    'По одному слоту за раз: вкладка слотів записує або патчить один слот цієї камери; кожен слот передається так, як застосунок виробника передає образ FF 16 Hz (образ XOR його власний блок ключів 0), а камера зберігає його під ключем B. Перед кожним записом вкладка питає.',
  'report.refusesEvery': 'Вкладка слотів відхиляє кожен слот цієї камери:',
} satisfies Translation<'info'>;
