/**
 * Namespace `info`, български (bg), translated from the English source.
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
  'status.notRead': 'Още не е прочетено.',
  'status.reading': 'Четене…',
  'status.noVersion': 'Не е съобщена версия.',
  'status.tooOld':
    'Прочетено. Фърмуерът {version} е по-стар от 0.8.0.0 — нищо друго не е прочетено.',
  'status.read': 'Прочетено. Фърмуер {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Прочитане на камерата',
  'read.description':
    'Само четене. Пита камерата какво изпълнява, как стартира, кои ключове има и какво съдържа всеки слот: същото четене като seek-fw info. Нищо не се записва.',
  'read.actions': 'Действия за информацията',
  'read.button': 'Четене на версията на фърмуера',
  'read.connectFirst':
    'Първо свържете камерата по-горе, след това натиснете „Четене на версията на фърмуера“.',
  'read.showDetails': 'Подробности в журнала',
  'read.panel': 'Версия на фърмуера',
  'result.title': 'Какво съобщава камерата',
  'result.version': 'Версия на фърмуера',
  'result.build': 'Компилация',
  'result.range': 'Диапазон на версиите',
  'result.tab': 'Раздел за тази камера',
  'result.rangeLegacy': '0.x / 1.x: камерите от 2014 и 2016 г.',
  'result.rangeModern': '2.x и по-нови: камерите с 4.x, Nano и Mosaic',
  'result.rangeUnknown': 'неизвестен',
  'result.noVersion':
    '**Камерата не съобщи версията на фърмуера си.** Нищо друго не е изпратено. Изключете я, включете я отново, изчакайте да завърши стартирането и прочетете отново.',
  'result.noTab': 'Нито един раздел не чете тази компилация.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Отворете <tab>{tab}</tab> за тази камера. Този раздел отново пита камерата от кое семейство е, преди да прочете каквото и да е, и отказва камера, която не е от семейството, за което е.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'За какво служи всеки раздел',
  'tabs.intro':
    'Пет раздела, в този ред. Всеки е отделна страница, а заглавната лента показва в кой се намирате.',
  'tabs.caption': 'Разделите, какво правят, кои камери покриват и дали записват',
  'tabs.tab': 'Раздел',
  'tabs.does': 'Какво прави',
  'tabs.cameras': 'Камери',
  'tabs.writes': 'Записва ли в камерата?',
  'tabs.info.does':
    'Чете това, което съобщава камерата: фърмуера ѝ, семейството, като което се представя, как стартира, ключовете ѝ и всеки слот. Същото четене като seek-fw info. Не записва нищо.',
  'tabs.info.cameras': 'Всяка камера Seek, която WebUSB може да отвори.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Не.',
  'tabs.preserve.does':
    'Прави пълно копие на флаш паметта на камерата (4 МБ), като след всяка стъпка запазва файл на сесията. За да прочете цялата памет, временно прилага пач към фърмуера, след това връща оригиналния фърмуер и го проверява. Минава през стъпките една по една.',
  'tabs.preserve.cameras':
    'Камери с фърмуер 0.x и 1.x: компилациите на Compact от 2014 г., компилациите на Compact PRO от 2016 г. (1.0.3.x) и компилацията 1.3.0.8 FF (16 Hz) на Compact.',
  'tabs.preserve.writes':
    'Да, в две стъпки, и всяка първо пита. Връща камерата в състоянието, в което е била.',
  'tabs.v4.does':
    'Чете цялата флаш памет на камера с 4.x или Nano и дешифрира слотовете на фърмуера, които открие. Само четене: изпраща шест команди за четене и нито една за запис.',
  'tabs.v4.cameras':
    'Камери с фърмуер 4.x (Compact, Compact PRO, Compact XR), Mosaic (10.x и 2.x) и Nano (42.x и 44.x), от 2018 г. нататък.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Не.',
  'tabs.decrypt.does':
    'Дешифрира файл, който вече имате: цял дъмп, слот по слот, или отделен слот на фърмуера от 64 КБ. Резултатът може да бъде изтеглен.',
  'tabs.decrypt.cameras':
    'Никакви. Не използва камера, затова работи и без нищо включено, и във всеки браузър.',
  'tabs.decrypt.writes': 'Не. Записва само изтегления файл.',
  'tabs.slots.does':
    'Чете трите слота на фърмуера (слот A, слот B и слот за възстановяване R), показва какво съдържа всеки и от кой стартира камерата и може да направи дъмп или запис на един слот наведнъж.',
  'tabs.slots.cameras': 'Камери с фърмуер 0.8.0.0 и по-нов.',
  'tabs.slots.writes': 'Да, по един слот наведнъж, и всеки запис първо пита.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Камера',
  'report.product': 'Продукт',
  'report.manufacturer': 'Производител',
  'report.serial': 'Сериен номер',
  'report.platform': 'Платформа',
  'report.usbLink': 'USB връзка',
  'report.noProduct': '(няма име на продукта)',
  'report.none': '(няма)',
  'report.unreadable': '(не се чете)',
  'report.firmware': 'Фърмуер',
  'report.running': 'Работещ',
  'report.bootloader': 'Буутлоудър',
  'report.family': 'Семейство фърмуер',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Прочетено като',
  'report.detected': 'Разпознато',
  'report.boot': 'Стартиране',
  'report.booted': 'Стартирана от',
  'report.lastStart': 'Последно стартиране',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'Работеща компилация (1.3.0.8)',
  'report.nextStart': 'Следващо стартиране',
  'report.upgradeTarget': 'Цел на обновяването',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(не е питана)',
  'report.targetConfirmed': '{slot} (потвърдено по USB)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'неизвестна: {why}. За образ FF 16 Hz камерата трябва да каже коя компилация изпълнява (разделът със слотовете я пита)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': 'компилацията FF 16 Hz 1.3.0.8',
  'report.build8Hz': 'компилацията 8 Hz 1.3.0.8',
  'report.keys': 'Ключове',
  'report.slots': 'Слотове',
  'report.slotsCaption':
    'Всеки слот такъв, какъвто го е намерило четенето. Само четене: записва разделът със слотовете.',
  'report.slot': 'Слот',
  'report.address': 'Адрес',
  'report.version': 'Версия',
  'report.size': 'Размер',
  'report.key': 'Ключ',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Приема',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Краен блок',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Стартира',
  'report.bytes': '{count} Б',
  'report.plaintext': 'няма (нешифрован)',
  /** A table value, lower case: "yes". */
  'report.yes': 'да',
  /** A table value, lower case: "no". */
  'report.no': 'не',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'н/п',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Запис',
  'report.noBankWritten': 'Не се записва нито един слот на тази камера:',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'По един слот наведнъж: разделът със слотовете записва или пачва по един слот на тази камера, като всеки слот се изпраща в открит вид (образът такъв, какъвто е, без ключ), и всеки запис първо пита.',
  'report.oneBank.slotKeystream':
    'По един слот наведнъж: разделът със слотовете записва или пачва по един слот на тази камера, като всеки слот се изпраща шифриран с блока с ключове 0 на собствения си образ, и всеки запис първо пита.',
  'report.oneBank.keyA':
    'По един слот наведнъж: разделът със слотовете записва или пачва по един слот на тази камера, като всеки слот се изпраща шифриран с ключове, получени от слота, от който е стартирала камерата, и от работещото приложение, и всеки запис първо пита.',
  'report.oneBank.ffVendor':
    'По един слот наведнъж: разделът със слотовете записва или пачва по един слот на тази камера, като всеки слот се изпраща така, както фирменото приложение изпраща образа FF 16 Hz (образът XOR собствения му блок с ключове 0), а камерата го съхранява с ключ B, и всеки запис първо пита.',
  'report.refusesEvery': 'Разделът със слотовете отказва всеки слот на тази камера:',
} satisfies Translation<'info', 'bg'>;
