/**
 * Namespace `shared`, українська (uk), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: what several tabs share: components/RunPanel.tsx, Section.tsx, Panel.tsx,
 * KeyValue.tsx, HexBlock.tsx, components/ui/*, hooks/useRunner.ts, useReporter.ts, useDevice.ts,
 * useConnectionTest.ts, lib/camera-lock.ts, download.ts, backup-save.ts, hints.ts, family-line.ts,
 * identify.ts, unlock-seat.ts, webusb.ts, usb-adapter.ts, and components/DeviceInfoPanel.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* RunPanel: the bar, status line and log every long operation has. {label} is the panel's name. */
  'runPanel.percent': '{value}%',
  'runPanel.progressLabel': '{label}: хід виконання',
  'runPanel.logLabel': '{label}: журнал',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… прибрано {count} старіший рядок',
    few: '… прибрано {count} старіші рядки',
    many: '… прибрано {count} старіших рядків',
    other: '… прибрано {count} старішого рядка',
  },
  'runPanel.lineCount': {
    one: '{count} рядок',
    few: '{count} рядки',
    many: '{count} рядків',
    other: '{count} рядка',
  },

  /* Status lines several panels set. */
  'status.idle': 'Очікування.',
  'status.cancelled': 'Скасовано.',
  'status.cancelling': 'Скасування …',
  'status.failedSeeLog': 'Помилка — див. журнал вище.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'Камера зайнята в іншій вкладці чи вікні — спершу завершіть роботу там або закрийте їх.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote':
    'Zip-архів завантажується автоматично, ще до того, як у камеру щось надсилається.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Пристрій не вибрано.',
  'device.disconnected': 'Пристрій від’єднано.',
  'device.revoked': 'Дозвіл відкликано.',
  'device.unknownProduct': 'невідомий продукт',
  'device.unknownVendor': 'невідомий виробник',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'У Linux для камери потрібне правило udev, інакше браузер не зможе її відкрити:\n\n{rule}\n\nПотім від’єднайте й знову під’єднайте камеру. Збірки Chromium у Snap і Flatpak часто ізольовані від прямого доступу до USB-пристроїв; надійна — збірка .deb або .rpm.',
  'hint.windows':
    'У Windows до камери має бути прив’язаний драйвер WinUSB, інакше жоден браузер до неї не дістанеться. Скористайтеся Zadig (https://zadig.akeo.ie/): Options → List All Devices, виберіть запис із назвою вашої камери — наприклад, «CompactPRO FF», — виберіть WinUSB і натисніть Replace Driver.',
  'hint.holding':
    'Камеру утримує інша програма або системний драйвер — USB-інтерфейс одночасно може утримувати лише один процес. Закрийте все інше, що працює з камерою, потім від’єднайте й знову під’єднайте її.',
  'hint.recipientFallback':
    'Або в параметрах зчитування встановіть для recipient значення «device» — тоді захоплювати інтерфейс не потрібно.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid':
    'Відкрийте «Параметри» й перевірте примітку під полями для кожного діапазону.',
  'hint.usbTimeout':
    'Камера прийняла запит, але так і не відповіла. Від’єднайте й знову під’єднайте її, потім спробуйте менший chunk (64 — значення, яке працює всюди).',
  'hint.usbStalled':
    'Камера відхилила запит. Зазвичай це означає, що її прошивка такого запиту не підтримує. Перш ніж щось зчитувати, сторінка запитує в камери, якого вона сімейства, тож запити, які раз у раз відхиляються, зроблено саме для того сімейства, яке назвала сама камера. Перевірте версію прошивки на вкладці «Інформація».',
  'hint.usbNotOpen':
    'Камеру утримує інша програма або системний драйвер. Закрийте її або в параметрах зчитування встановіть для recipient значення «device» — тоді захоплювати інтерфейс не потрібно.',
  'hint.usbTransferFailed': 'Від’єднайте й знову під’єднайте камеру, потім спробуйте ще раз.',
  'hint.deviceMode':
    'Камера не вийшла з режиму зйомки. Від’єднайте її, зачекайте, доки вона повністю вимкнеться, і під’єднайте знову.',
  'hint.deviceWindow':
    'Карта селекторів цього сімейства не збіглася з камерою. На вкладці 4.x/Nano відкрийте «Параметри» й запустіть «Зчитати всі селектори», щоб побачити, що камера насправді надає.',
  'hint.deviceVersionUnknown':
    'Камері не надіслано нічого, що могло б її змінити. Від’єднайте її, під’єднайте знову, дочекайтеся, поки вона повністю запуститься, і спробуйте ще раз; камера, яка повідомляє версію прошивки, зчитується звичайним способом.',
  'hint.imageMalformed': 'Цей файл не є розшифрованим образом прошивки Seek.',
  'hint.imageUnsupported': 'Цей образ не можна підготувати для камери в такому вигляді, як він є.',
  'hint.imageKeyTable':
    'Образ не містить пари ключів, яку вказує назва файлу. Використовуйте розшифрований файл точно таким, яким його зберіг дамп, разом із назвою.',
  'hint.flashRefused': 'У камеру нічого не записано.',
  'hint.familyUnsupported':
    'Нічого не зчитано й не записано. Кожна вкладка охоплює свій діапазон версій прошивки: камери 0.x і 1.x — на «Дамп і розшифрування 0.x/1.x», камери 4.x і Nano — на «Дамп і розшифрування 4.x/Nano». Вкладка «Інформація» підкаже, яка вкладка потрібна камері.',
  'hint.firmwareTooOld':
    'Жодне сімейство прошивок не може зчитати тут цю збірку: у її прошивці немає обробника зчитування для команди, якою ця вкладка читає флеш-пам’ять, тож їй не надіслано нічого, що вона могла б витлумачити хибно. Compact на 0.7.0.7 чи 0.7.0.8 можна зчитати на «Дамп і розшифрування 0.x/1.x». Дамп, знятий програматором SPI або через SWD/J-Link, однаково можна розшифрувати на цій сторінці, у «Розшифрувати файл/слот».',
  'hint.powerCycle':
    'У цьому майстрі: від’єднайте камеру й під’єднайте знову, натисніть «Під’єднати пристрій» і виберіть її, потім почніть той самий крок ще раз. Прогін досі завантажено на сторінці — продовжувати його з файлу не потрібно.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Робоча прошивка',
  'deviceInfo.version': 'Версія',
  'deviceInfo.family': 'Сімейство прошивок',
  'deviceInfo.build': 'Збірка',
  'deviceInfo.bootloader': 'Завантажувач',
  'deviceInfo.platform': 'Платформа',
  'deviceInfo.serial': 'Серійний номер',
  'deviceInfo.usbLink': 'З’єднання USB',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Конфігурація запуску',
  'deviceInfo.bootedFrom': 'Запущено з',
  'deviceInfo.nextStart': 'Наступний запуск',
  'deviceInfo.upgradeTarget': 'Ціль оновлення (власного оновлення камери)',
  'deviceInfo.bankAt': '{bank} за адресою {address}',
  'deviceInfo.perDeviceKey': 'Ключ пристрою',
  'deviceInfo.notProgrammed': 'не запрограмовано — камера замість нього використовує ключ B',
  'deviceInfo.keysTitle': 'Ключі, зчитані з цієї камери',
  'deviceInfo.foundAt': 'Знайдено за адресою',
  'deviceInfo.flashOffset': 'зміщення у флеш-пам’яті {offset}',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Ключ A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Ключ B',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**{banks} містить коректний образ прошивки, зашифрований ключем, якого завантажувач цієї камери не знає.** Образ цілий, і його контрольна сума правильна, але, перевіряючи слот, завантажувач пробує лише {storeKey:acc} і ключ A, тож пропускає його й запускає щось інше.',
    few: '**{banks} містять коректний образ прошивки, зашифрований ключем, якого завантажувач цієї камери не знає.** Образ цілий, і його контрольна сума правильна, але, перевіряючи слот, завантажувач пробує лише {storeKey:acc} і ключ A, тож пропускає їх і запускає щось інше.',
    many: '**{banks} містять коректний образ прошивки, зашифрований ключем, якого завантажувач цієї камери не знає.** Образ цілий, і його контрольна сума правильна, але, перевіряючи слот, завантажувач пробує лише {storeKey:acc} і ключ A, тож пропускає їх і запускає щось інше.',
    other:
      '**{banks} містять коректний образ прошивки, зашифрований ключем, якого завантажувач цієї камери не знає.** Образ цілий, і його контрольна сума правильна, але, перевіряючи слот, завантажувач пробує лише {storeKey:acc} і ключ A, тож пропускає їх і запускає щось інше.',
  },
  'deviceInfo.orphanIsTarget':
    'Саме в цей слот записує оновлення. Застосунок, що працює на цій камері, перешифровує образ цим невідомим ключем, тож **запис через цю сторінку дасть ще один слот, з якого завантажувач не зможе запустити камеру**, — камера й далі запускатиметься зі {bank:gen}. Обійти це можна, записавши слот напряму програматором SPI або через SWD/J-Link.',
  /*
   * Only deviceInfo.orphanIsTarget uses this, as its {bank} when the booted bank has no name. It is a name
   * with case forms; the phrase starts with "слот" so that "зі {bank:gen}" there reads right.
   */
  'deviceInfo.otherBank': 'слот, з якого вона запускається зараз',
  'deviceInfo.otherBank:gen': 'слота, з якого вона запускається зараз',
  'deviceInfo.otherBank:dat': 'слоту, з якого вона запускається зараз',
  'deviceInfo.otherBank:acc': 'слот, з якого вона запускається зараз',
  'deviceInfo.otherBank:ins': 'слотом, з якого вона запускається зараз',
  'deviceInfo.otherBank:loc': 'слоті, з якого вона запускається зараз',
} satisfies Translation<'shared', 'uk'>;
