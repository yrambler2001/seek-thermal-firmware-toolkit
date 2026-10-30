/**
 * Namespace `app`, русский (ru), translated from the English source: the shell.
 *
 * Owner: phase 1. Covers App.tsx, main.tsx, components/AppHeader.tsx,
 * ThemeSwitch.tsx (+ lib/theme.ts), LanguageSwitch.tsx, lib/routing.ts (tab
 * labels and the document title), SupportBanner.tsx (+ lib/support.ts),
 * UnlockNote.tsx, ConnectSection.tsx and PlatformNotes.tsx.
 *
 * Several of these sentences are pinned word for word by safety-copy.test.tsx.
 */

import type { Translation } from '../../types';

export default {
  /* ---- header ---- */
  title: 'Seek Thermal Firmware Toolkit',
  'header.cameraSelected': 'Камера выбрана',
  'header.noCamera': 'Камера не выбрана',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB недоступен',
  'header.github': 'Проект на GitHub',
  'header.tabs': 'Вкладки',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Сведения',
  'tab.preserve': 'Дамп и расшифровка 0.x/1.x 2014/2016',
  'tab.v4': 'Дамп и расшифровка 4.x/Nano',
  'tab.decrypt': 'Расшифровать файл/слот',
  'tab.slots': 'Слоты прошивки',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Прошивка Seek Thermal — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Тёмная тема',
  'theme.followsSystem': 'Как в системе: светлая или тёмная тема',
  'theme.chosenDiffers':
    'Выбрано здесь. Переключите обратно, чтобы снова следовать настройке системы.',
  'theme.chosenSame': 'Выбрано здесь; сейчас совпадает с настройкой системы',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Язык',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Считывает подключённую камеру так же, как `seek-fw info`: её прошивку, семейство, которым она себя называет, способ запуска, ключи и каждый слот. Подсказывает, какая из остальных вкладок ей подходит, и простыми словами объясняет, для чего нужна каждая вкладка. **На этой вкладке во флеш-память ничего не записывается.**',
  'intro.preserve':
    'Для камер **0.x и 1.x** (сборки 2014 и 2016 годов). Делает **полную** копию 4 МБ флеш-памяти камеры, включая области, до которых обычный дамп не достаёт, а затем возвращает камеру точно в исходное состояние. Сначала сохраняет всё, что можно считать, ненадолго патчит прошивку, чтобы считать остальное, снимает полный дамп, восстанавливает исходную прошивку и сверяет её. Всё выполняется локально в вашем браузере. **Два шага записывают во флеш-память**, и перед каждым из них страница спрашивает вас.',
  'intro.v4':
    'Делает копию 4 МБ SPI-флеш-памяти камеры **4.x или Nano** через WebUSB только для чтения и расшифровывает найденные в ней образы прошивки. Всё выполняется локально в вашем браузере — ничего никуда не загружается. **Только чтение:** эта вкладка не отправляет ни команд записи, стирания, загрузки, подтверждения записи, ни команды сброса. Камера с прошивкой другой линейки получает отказ до того, как что-либо будет считано.',
  'intro.decrypt':
    'Расшифровывает прошивку, которая у вас уже есть, прямо на этом компьютере: полный дамп флеш-памяти или один слот прошивки размером 64 КБ. **Камера не используется**, поэтому всё работает, даже когда ничего не подключено, и в браузерах без доступа к USB. Файл читается здесь и никуда не загружается.',
  'intro.slots':
    'Считывает три слота прошивки камеры — слот A, слот B и слот восстановления R — и показывает, что в каждом из них, с какого запускается камера и что эта сборка может с ним сделать; рядом — работающая прошивка устройства и его ключи. Всё выполняется локально в вашем браузере. **Эта вкладка записывает во флеш-память:** она может записать один слот из расшифрованного образа или из сырых байтов и спрашивает перед каждой записью.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**WebUSB недоступен в iOS и iPadOS,** поэтому с этого устройства нельзя считать флеш-память камеры.',
  'support.ios.body':
    'Safari его не поддерживает, а все браузеры в iOS обязаны использовать WebKit, поэтому Chrome и Firefox здесь тоже не могут его предоставить. Нет ни флага, ни расширения, которые это меняют. Чтобы снять дамп камеры, используйте настольный компьютер или телефон Android с кабелем USB-OTG.',
  'support.noWebUsb.title': '**Этот браузер не может обращаться к USB-устройствам.**',
  'support.noWebUsb.body':
    'WebUSB есть в Chrome, Edge, Opera и других браузерах на Chromium в Windows, macOS, Linux и Android. Firefox и Safari отказались его поддерживать.',
  'support.noWebUsb.insecure':
    'Кроме того, страница открыта не через защищённое соединение, а это само по себе блокирует WebUSB.',
  'support.insecure.title': '**Незащищённое соединение.** WebUSB здесь отключён.',
  'support.insecure.body':
    'Откройте эту страницу по HTTPS или с `http://localhost`. Обычный адрес в локальной сети, например `http://192.168.1.10:8000`, не подходит.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Вкладкой «**{tab}**» пользоваться всё равно можно — она работает только с выбранным вами файлом и не требует доступа к USB.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Готово.** Подключите камеру Seek и нажмите *{connect}*.',
  'support.fileProtocol':
    'Страница открыта как локальный файл, поэтому браузер не запомнит устройство между перезагрузками. Это не страшно.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Примечание: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Подключение',
  'connect.actions': 'Действия с устройством',
  'connect.connect': 'Подключить устройство',
  'connect.change': 'Сменить устройство',
  'connect.test': 'Проверить связь',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Забыть устройство',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Предлагается любое устройство Seek Thermal (USB vendor `{vendor}`) — Compact, Compact PRO, Nano и другие. Выберите своё в окне выбора устройства браузера.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Особенности платформ',
  'platform.macos':
    'Работает сразу в Chrome, Edge или любом браузере на Chromium. Без установки драйверов и без прав администратора. Сначала закройте все программы, которые уже работают с камерой: USB-интерфейс может занимать только один процесс.',
  'platform.linux.access':
    'Дайте своему пользователю доступ к устройству, затем отключите и снова подключите его:',
  'platform.linux.sandbox':
    'Сборки Chromium из Snap и Flatpak часто изолированы от USB-устройств; надёжный вариант — сборка из `.deb` или `.rpm`.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'В Windows к камере должен быть привязан драйвер WinUSB, прежде чем к ней сможет обратиться любой браузер. Используйте <zadig>Zadig</zadig>: *Options → List All Devices*, затем в выпадающем списке выберите пункт с названием вашей камеры — например, `CompactPRO FF`, — укажите драйвер **WinUSB** и нажмите Replace Driver. Если камера встречается в списке несколько раз, выберите пункт с пометкой *(Interface 0)*. После этого фирменная программа не сможет работать с устройством, пока вы не вернёте драйвер в диспетчере устройств (*Удалить устройство → Удалить драйвер*, затем переподключите камеру).',
  'platform.android':
    'Работает в Chrome для Android с кабелем USB-OTG, если телефон может питать камеру по шине USB. Доступ к USB Android выдаёт через собственное окно разрешений. Скачанный файл попадает в папку «Загрузки», как любой другой.',
  'platform.ios.name': 'iPhone и iPad',
  'platform.ios.cannot':
    '**Считать камеру нельзя**, и это не изменится. Safari не поддерживает WebUSB, а в iOS и iPadOS все браузеры, включая Chrome и Firefox, обязаны использовать WebKit, поэтому ни один из них не даёт доступа к этому API. Нет ни флага, ни расширения, ни приложения, которые это обходят. Для снятия дампа используйте настольный компьютер или телефон Android.',
  'platform.ios.decrypt':
    'Расшифровка здесь работает: расшифровать уже имеющийся дамп можно без доступа к USB, поэтому это можно сделать с iPhone или iPad, а также в Firefox и Safari на компьютере.',
} satisfies Translation<'app'>;
