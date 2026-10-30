/**
 * Namespace `shared`, русский (ru), translated from the English source.
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
  'runPanel.progressLabel': '{label}: ход выполнения',
  'runPanel.logLabel': '{label}: журнал',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… скрыта {count} более ранняя строка',
    few: '… скрыто {count} более ранние строки',
    many: '… скрыто {count} более ранних строк',
    other: '… скрыто более ранних строк: {count}',
  },
  'runPanel.lineCount': {
    one: '{count} строка',
    few: '{count} строки',
    many: '{count} строк',
    other: '{count} строки',
  },

  /* Status lines several panels set. */
  'status.idle': 'Ожидание.',
  'status.cancelled': 'Отменено.',
  'status.cancelling': 'Отмена …',
  'status.failedSeeLog': 'Ошибка — смотрите журнал выше.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'Камера занята в другой вкладке или окне — сначала завершите работу там или закройте её.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote':
    'Zip-архив скачивается автоматически, до того как что-либо будет отправлено. Браузер не сообщает, когда загрузка оказалась на диске, поэтому, прежде чем на неё полагаться, найдите её в папке загрузок.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Устройство не выбрано.',
  'device.disconnected': 'Устройство отключено.',
  'device.revoked': 'Разрешение отозвано.',
  'device.unknownProduct': 'неизвестный продукт',
  'device.unknownVendor': 'неизвестный производитель',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'В Linux камере нужно правило udev, иначе браузер не сможет её открыть:\n\n{rule}\n\nЗатем отключите и снова подключите камеру. Сборки Chromium из Snap и Flatpak часто изолированы от USB-устройств; надёжный вариант — сборка из .deb или .rpm.',
  'hint.windows':
    'В Windows к камере должен быть привязан драйвер WinUSB, прежде чем к ней сможет обратиться любой браузер. Используйте Zadig (https://zadig.akeo.ie/): Options → List All Devices, выберите пункт с названием вашей камеры — например, «CompactPRO FF», — укажите WinUSB и нажмите Replace Driver.',
  'hint.holding':
    'Камеру занимает другая программа или системный драйвер, а USB-интерфейс может занимать только один процесс. Закройте всё остальное, что с ней работает, затем отключите и снова подключите камеру.',
  'hint.recipientFallback':
    'Или укажите в параметрах чтения recipient = «device»: так захватывать интерфейс не нужно.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid':
    'Откройте «Параметры» и проверьте подсказку под полями для каждого диапазона.',
  'hint.usbTimeout':
    'Камера приняла запрос, но так и не ответила. Отключите и снова подключите её, затем попробуйте меньший chunk (64 работает везде).',
  'hint.usbStalled':
    'Камера отклонила запрос. Обычно это значит, что её прошивка его не поддерживает. Прежде чем что-либо считать, страница спрашивает камеру, к какому семейству она относится, поэтому запросы, которые продолжают отклоняться, были сделаны для семейства, о котором сообщила сама камера. Проверьте версию прошивки на вкладке «Сведения».',
  'hint.usbNotOpen':
    'Камеру занимает другая программа или системный драйвер. Закройте её или укажите в параметрах чтения recipient = «device»: так захватывать интерфейс не нужно.',
  'hint.usbTransferFailed': 'Отключите и снова подключите камеру, затем попробуйте ещё раз.',
  'hint.deviceMode':
    'Камера не вышла из режима съёмки. Отключите её, дождитесь, пока она полностью выключится, и подключите снова.',
  'hint.deviceWindow':
    'Карта селекторов этого семейства не подошла камере. На вкладке 4.x/Nano откройте «Параметры» и запустите «Считать все селекторы», чтобы увидеть, что на самом деле отдаёт камера.',
  'hint.deviceVersionUnknown':
    'Ничего, что могло бы изменить камеру, не отправлено. Отключите её, подключите снова, дождитесь окончания запуска и попробуйте ещё раз; камера, которая сообщает версию прошивки, считывается как обычно.',
  'hint.imageMalformed': 'Этот файл не является расшифрованным образом прошивки Seek.',
  'hint.imageUnsupported': 'Этот образ нельзя подготовить для камеры в нынешнем виде.',
  'hint.imageKeyTable':
    'В образе нет той пары ключей, которую указывает имя файла. Используйте расшифрованный файл ровно в том виде, в каком его записал дамп, вместе с именем.',
  'hint.flashRefused': 'В камеру ничего не записано.',
  'hint.familyUnsupported':
    'Ничего не считано и не записано. Каждая вкладка отвечает за свой диапазон версий прошивки: камеры 0.x и 1.x — на вкладку «Дамп и расшифровка 0.x/1.x 2014/2016», камеры 4.x и Nano — на «Дамп и расшифровка 4.x/Nano». Какая вкладка подходит камере, подскажет вкладка «Сведения».',
  'hint.firmwareTooOld':
    'Ни одно семейство прошивок не может считать эту сборку здесь: в её прошивке нет обработчика той команды чтения, которой эта вкладка читает флеш-память, поэтому ей не отправлено ничего, что могло бы быть прочитано неверно. Compact на 0.7.0.7 или 0.7.0.8 можно считать на вкладке «Дамп и расшифровка 0.x/1.x 2014/2016». Дамп, снятый программатором SPI или через SWD/J-Link, всё равно можно расшифровать на этой странице, на вкладке «Расшифровать файл/слот».',
  'hint.powerCycle':
    'В этом мастере: отключите камеру и подключите её снова, нажмите «Подключить устройство», выберите её и запустите тот же шаг ещё раз. Прогон по-прежнему загружен здесь — продолжать нечего.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Работающая прошивка',
  'deviceInfo.version': 'Версия',
  'deviceInfo.family': 'Семейство прошивок',
  'deviceInfo.build': 'Сборка',
  'deviceInfo.bootloader': 'Загрузчик',
  'deviceInfo.platform': 'Платформа',
  'deviceInfo.serial': 'Серийный номер',
  'deviceInfo.usbLink': 'Связь USB',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Конфигурация запуска',
  'deviceInfo.bootedFrom': 'Запущена с',
  'deviceInfo.nextStart': 'Следующий запуск',
  'deviceInfo.upgradeTarget': 'Цель обновления (собственного)',
  'deviceInfo.bankAt': '{bank} по адресу {address}',
  'deviceInfo.perDeviceKey': 'Ключ устройства',
  'deviceInfo.notProgrammed': 'не запрограммирован — камера использует ключ B',
  'deviceInfo.keysTitle': 'Ключи, считанные с этой камеры',
  'deviceInfo.foundAt': 'Где найден',
  'deviceInfo.flashOffset': 'смещение во флеш-памяти {offset}',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Ключ A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Ключ B',
  'deviceInfo.keysConfirmed':
    'Подтверждено совпадением с состоянием ключевого потока слота, восстановленным из самого шифртекста. Загрузка собирается так, чтобы каждый слот хранил её под ключом хранения загрузчика ({storeKey}) или под собственным ключом слота, с которого запущена камера, если ключ хранения приложения другой.',
  'deviceInfo.keysDecrypted':
    'Каждый слот расшифрован в браузере: его ключевой поток вычислен по его собственным векторам сброса, про которые известно, что они нулевые. Расшифровать — не то же самое, что запустить: загрузчик пробует только {storeKey:acc} и ключ A, поэтому слот, записанный под любым другим ключом, проходит проверку контрольной суммы и всё равно пропускается. Ничего не записано.',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**{banks} содержит корректный образ прошивки, зашифрованный ключом, которого загрузчик этой камеры не знает.** Образ цел, и его контрольная сумма верна, но при проверке слота загрузчик пробует только {storeKey:acc} и ключ A, поэтому пропускает его и запускает что-то другое.',
    few: '**{banks} содержат корректный образ прошивки, зашифрованный ключом, которого загрузчик этой камеры не знает.** Образ цел, и его контрольная сумма верна, но при проверке слота загрузчик пробует только {storeKey:acc} и ключ A, поэтому пропускает их и запускает что-то другое.',
    many: '**{banks} содержат корректный образ прошивки, зашифрованный ключом, которого загрузчик этой камеры не знает.** Образ цел, и его контрольная сумма верна, но при проверке слота загрузчик пробует только {storeKey:acc} и ключ A, поэтому пропускает их и запускает что-то другое.',
    other:
      '**{banks} содержат корректный образ прошивки, зашифрованный ключом, которого загрузчик этой камеры не знает.** Образ цел, и его контрольная сумма верна, но при проверке слота загрузчик пробует только {storeKey:acc} и ключ A, поэтому пропускает их и запускает что-то другое.',
  },
  'deviceInfo.orphanIsTarget':
    'Именно в этот слот пишет обновление. Приложение, работающее на этой камере, перешифровывает образ этим неизвестным ключом, поэтому **запись через эту страницу даст ещё один слот, с которого загрузчик не сможет запустить камеру**, — камера так и будет запускаться со {bank:gen}. Обойти это можно, записав слот напрямую программатором SPI или через SWD/J-Link.',
  /** deviceInfo.orphanIsTarget's {bank} when the booted bank has no name. A name: a translation may give
   * it case forms ('deviceInfo.otherBank:gen'), like common:bank.*. */
  'deviceInfo.otherBank': 'слот, с которого она запускается сейчас',
  'deviceInfo.otherBank:gen': 'слота, с которого она запускается сейчас',
  'deviceInfo.otherBank:dat': 'слоту, с которого она запускается сейчас',
  'deviceInfo.otherBank:acc': 'слот, с которого она запускается сейчас',
  'deviceInfo.otherBank:ins': 'слотом, с которого она запускается сейчас',
  'deviceInfo.otherBank:loc': 'слоте, с которого она запускается сейчас',
} satisfies Translation<'shared'>;
