/**
 * Namespace `shared`, български (bg), translated from the English source.
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
  'runPanel.progressLabel': 'Напредък: {label}',
  'runPanel.logLabel': 'Журнал: {label}',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… {count} по-ранен ред е премахнат',
    other: '… {count} по-ранни реда са премахнати',
  },
  'runPanel.lineCount': { one: '{count} ред', other: '{count} реда' },

  /* Status lines several panels set. */
  'status.idle': 'В готовност.',
  'status.cancelled': 'Отменено.',
  'status.cancelling': 'Отменя се …',
  'status.failedSeeLog': 'Неуспех — вижте журнала по-горе.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'Камерата се използва в друг раздел или прозорец — първо завършете или го затворете там.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote': 'Zip архивът се изтегля автоматично, преди да се изпрати каквото и да е.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Няма избрано устройство.',
  'device.disconnected': 'Устройството е изключено.',
  'device.revoked': 'Разрешението е отменено.',
  'device.unknownProduct': 'неизвестен продукт',
  'device.unknownVendor': 'неизвестен производител',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'Под Linux камерата се нуждае от udev правило, преди браузърът да може да я отвори:\n\n{rule}\n\nСлед това изключете камерата и я включете отново. Версиите на Chromium от Snap и Flatpak често са изолирани от суровите USB устройства; надеждната версия е .deb или .rpm.',
  'hint.windows':
    'Под Windows към камерата трябва да е закачен драйверът WinUSB, преди който и да е браузър да стигне до нея. Използвайте Zadig (https://zadig.akeo.ie/): Options → List All Devices, изберете записа с името на камерата ви — например „CompactPRO FF“ — изберете WinUSB и щракнете Replace Driver.',
  'hint.holding':
    'Друга програма или системен драйвер държи камерата — само един процес може да държи USB интерфейса в даден момент. Затворете всичко друго, което комуникира с нея, след това изключете камерата и я включете отново.',
  'hint.recipientFallback':
    'Или задайте recipient на „device“ в настройките за четене — така не е нужно интерфейсът да бъде зает.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid':
    'Отворете „Настройки“ и проверете бележката под полетата за допустимите стойности на всяко.',
  'hint.usbTimeout':
    'Камерата прие заявката, но така и не отговори. Изключете я и я включете отново, след това опитайте с по-малък chunk (64 е стойността, която работи навсякъде).',
  'hint.usbStalled':
    'Камерата отхвърли заявката. Обикновено това означава, че фърмуерът ѝ не я поддържа. Страницата пита камерата от кое семейство е, преди да прочете каквото и да е, така че заявките, които продължават да се отхвърлят, са направени за семейството, което е съобщила самата камера. Проверете версията на фърмуера в раздела „Информация“.',
  'hint.usbNotOpen':
    'Друга програма или системен драйвер държи камерата. Затворете я или задайте recipient на „device“ в настройките за четене — така не е нужно интерфейсът да бъде зает.',
  'hint.usbTransferFailed': 'Изключете камерата и я включете отново, след това опитайте пак.',
  'hint.deviceMode':
    'Камерата не излезе от режима на снимане. Изключете я, изчакайте да изгасне напълно и я включете отново.',
  'hint.deviceWindow':
    'Картата на селекторите, която използва това семейство, не съвпадна с камерата. В раздела 4.x/Nano отворете „Настройки“ и изпълнете „Дъмп на всички селектори“, за да видите какво всъщност предоставя камерата.',
  'hint.deviceVersionUnknown':
    'Не е изпратено нищо, което би могло да промени камерата. Изключете я, включете я отново, изчакайте да завърши стартирането и опитайте пак; камера, която съобщава версията на фърмуера си, се чете нормално.',
  'hint.imageMalformed': 'Файлът не е дешифриран образ на фърмуер на Seek.',
  'hint.imageUnsupported': 'Този образ не може да бъде пакетиран за камерата в този вид.',
  'hint.imageKeyTable':
    'Образът не съдържа двойката ключове, посочена в името на файла. Използвайте дешифрирания файл точно както го е записал дъмпът, включително името.',
  'hint.flashRefused': 'В камерата не е записано нищо.',
  'hint.familyUnsupported':
    'Нищо не е прочетено или записано. Всеки раздел покрива определен диапазон от версии на фърмуера: камерите с 0.x и 1.x са за „Дъмп и дешифриране 0.x/1.x“, камерите с 4.x и Nano — за „Дъмп и дешифриране 4.x/Nano“. Разделът „Информация“ казва за кой раздел е камерата.',
  'hint.firmwareTooOld':
    'Нито едно семейство фърмуер не може да прочете тази компилация тук: фърмуерът ѝ няма обработчик за командата, с която този раздел чете флаш паметта, затова не ѝ е изпратено нищо, което би могло да бъде прочетено погрешно. Compact с 0.7.0.7 или 0.7.0.8 може да бъде прочетен в „Дъмп и дешифриране 0.x/1.x“. Дъмп, направен със SPI програматор или през SWD/J-Link, все пак може да бъде дешифриран на тази страница, в „Дешифриране на файл/слот“.',
  'hint.powerCycle':
    'В този съветник: изключете камерата и я включете отново, натиснете „Свързване на устройство“ и я изберете, след това започнете същата стъпка отново. Сесията все още е заредена тук — няма какво да се продължава.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Работещ фърмуер',
  'deviceInfo.version': 'Версия',
  'deviceInfo.family': 'Семейство фърмуер',
  'deviceInfo.build': 'Компилация',
  'deviceInfo.bootloader': 'Буутлоудър',
  'deviceInfo.platform': 'Платформа',
  'deviceInfo.serial': 'Сериен номер',
  'deviceInfo.usbLink': 'USB връзка',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Конфигурация на стартирането',
  'deviceInfo.bootedFrom': 'Стартирана от',
  'deviceInfo.nextStart': 'Следващо стартиране',
  'deviceInfo.upgradeTarget': 'Цел на обновяването (собственото ѝ обновяване)',
  'deviceInfo.bankAt': '{bank} на адрес {address}',
  'deviceInfo.perDeviceKey': 'Ключ на устройството',
  'deviceInfo.notProgrammed': 'не е програмиран — камерата използва ключ B',
  'deviceInfo.keysTitle': 'Ключове, прочетени от тази камера',
  'deviceInfo.foundAt': 'Намерен на',
  'deviceInfo.flashOffset': 'отместване във флаш паметта {offset}',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Ключ A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Ключ B',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**В {banks:acc} има валиден образ на фърмуер, шифриран с ключ, който буутлоудърът на тази камера не познава.** Образът е цял и контролната му сума е вярна, но при проверка на слот буутлоудърът опитва само {storeKey:acc} и ключа A, затова го пропуска и стартира нещо друго.',
    other:
      '**В {banks:acc} има по един валиден образ на фърмуер, шифриран с ключ, който буутлоудърът на тази камера не познава.** Образите са цели и контролните им суми са верни, но при проверка на слот буутлоудърът опитва само {storeKey:acc} и ключа A, затова ги пропуска и стартира нещо друго.',
  },
  'deviceInfo.orphanIsTarget':
    'Това е слотът, в който записва обновяването. Приложението, което работи на тази камера, шифрира повторно с този неизвестен ключ, така че **записът през тази страница ще създаде още един слот, от който буутлоудърът не може да стартира** — камерата ще продължи да работи от {bank:acc}. Това се заобикаля, като слотът се запише директно със SPI програматор или през SWD/J-Link.',
  /** deviceInfo.orphanIsTarget's {bank} when the booted bank has no name. A name: a translation may give
   * it case forms ('deviceInfo.otherBank:gen'), like common:bank.*. */
  'deviceInfo.otherBank': 'другият слот',
  'deviceInfo.otherBank:nom': 'другият слот',
  'deviceInfo.otherBank:acc': 'другия слот',
  'deviceInfo.otherBank:ins': 'Другият слот',
} satisfies Translation<'shared', 'bg'>;
