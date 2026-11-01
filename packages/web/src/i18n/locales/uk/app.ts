/**
 * Namespace `app`, українська (uk), translated from the English source: the shell.
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
  'header.cameraSelected': 'Камеру вибрано',
  'header.noCamera': 'Камеру не вибрано',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB недоступний',
  'header.github': 'Проєкт на GitHub',
  'header.tabs': 'Вкладки',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Інформація',
  'tab.preserve': 'Дамп і розшифрування 0.x/1.x',
  'tab.v4': 'Дамп і розшифрування 4.x/Nano',
  'tab.decrypt': 'Розшифрувати файл/слот',
  'tab.slots': 'Слоти прошивки',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Прошивка Seek Thermal — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Темна тема',
  'theme.followsSystem': 'Як у системі: світла чи темна тема',
  'theme.chosenDiffers': 'Вибрано тут. Перемкніть назад, щоб знову діяло налаштування системи.',
  'theme.chosenSame': 'Вибрано тут; зараз так само, як у налаштуваннях системи',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Мова',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Зчитує дані під’єднаної камери так само, як `seek-fw info`: її прошивку, сімейство, яким вона себе називає, спосіб запуску, ключі та кожен слот. Підказує, яка з інших вкладок їй підходить, і простими словами пояснює, для чого кожна вкладка. **На цій вкладці у флеш-пам’ять нічого не записується.**',
  'intro.preserve':
    'Для камер **0.x і 1.x** (збірки 2014 і 2016 років). Робить **повну** копію 4 МБ флеш-пам’яті камери — разом із частинами, яких звичайний дамп не охоплює, — а потім повертає камеру точно в той стан, у якому вона була. Зберігає резервну копію всього, що можна зчитати, ненадовго змінює прошивку патчем, щоб зчитати решту, зчитує все, відновлює оригінал і перевіряє його. Усе працює локально у вашому браузері. **Два кроки записують у флеш-пам’ять**, і перед кожним із них вас запитають.',
  'intro.v4':
    'Робить копію 4 МБ флеш-пам’яті SPI камери **4.x або Nano** через WebUSB, лише читаючи її, і розшифровує всі знайдені образи прошивки. Усе працює локально у вашому браузері — нічого нікуди не надсилається. **Лише читання:** ця вкладка не надсилає жодної команди запису у флеш-пам’ять, стирання, завантаження в камеру, підтвердження запису чи скидання. Камеру з іншою лінійкою прошивок буде відхилено ще до будь-якого зчитування.',
  'intro.decrypt':
    'Розшифровує прошивку, яка вже є у вас, на цьому комп’ютері: повний дамп флеш-пам’яті або один слот прошивки на 64 КБ. **Камера не потрібна**, тож це працює без під’єднаних пристроїв і в браузерах без доступу до USB. Файл читається тут і нікуди не завантажується.',
  'intro.slots':
    'Зчитує три слоти прошивки камери — слот A, слот B і слот відновлення R — і показує, що в кожному, з якого з них запускається камера і що ця збірка може з ним зробити, а поруч — робочу прошивку пристрою та його ключі. Усе працює локально у вашому браузері. **Ця вкладка записує у флеш-пам’ять:** вона може записати один слот із розшифрованого образу або із сирих байтів і питає перед кожним записом.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**WebUSB недоступний в iOS та iPadOS,** тож цей пристрій не може зчитати флеш-пам’ять камери.',
  'support.ios.body':
    'Safari його не підтримує, а кожен браузер в iOS зобов’язаний використовувати WebKit, тому Chrome і Firefox тут теж не можуть його надати. Жоден прапорець чи розширення цього не змінює. Щоб зчитати камеру, скористайтеся настільним комп’ютером або телефоном Android із кабелем USB-OTG.',
  'support.noWebUsb.title': '**Цей браузер не має доступу до USB-пристроїв.**',
  'support.noWebUsb.body':
    'WebUSB є в Chrome, Edge, Opera та інших браузерах на основі Chromium у Windows, macOS, Linux і Android. Firefox і Safari відмовилися його підтримувати.',
  'support.noWebUsb.insecure':
    'До того ж цю сторінку відкрито не через захищене з’єднання, а це саме по собі блокує WebUSB.',
  'support.insecure.title': '**Незахищене з’єднання.** WebUSB тут вимкнено.',
  'support.insecure.body':
    'Відкрийте цю сторінку через HTTPS або з `http://localhost`. Звичайна адреса в локальній мережі, як-от `http://192.168.1.10:8000`, не підходить.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Вкладкою **{tab}** можна користуватися й далі — вона працює лише з файлом, який ви виберете, і не потребує доступу до USB.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Готово.** Під’єднайте камеру Seek і натисніть *{connect}*.',
  'support.fileProtocol':
    'Сторінку відкрито як локальний файл, тож браузер не запам’ятає пристрій між перезавантаженнями. Це нічим не шкодить.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Примітка: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Під’єднання',
  'connect.actions': 'Дії з пристроєм',
  'connect.connect': 'Під’єднати пристрій',
  'connect.change': 'Змінити пристрій',
  'connect.test': 'Перевірити з’єднання',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Забути пристрій',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Пропонуються всі пристрої Seek Thermal (ідентифікатор виробника USB `{vendor}`) — Compact, Compact PRO, Nano тощо. Виберіть свій у вікні вибору пристрою браузера.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Примітки щодо платформ',
  'platform.macos':
    'Працює одразу в Chrome, Edge чи будь-якому браузері на основі Chromium. Без встановлення драйверів і без прав адміністратора. Спершу закрийте всі інші програми, які вже працюють із камерою, — USB-інтерфейс одночасно може утримувати лише один процес.',
  'platform.linux.access':
    'Надайте своєму користувачеві доступ до пристрою, потім від’єднайте й знову під’єднайте його:',
  'platform.linux.sandbox':
    'Збірки Chromium у Snap і Flatpak часто ізольовані від прямого доступу до USB-пристроїв; надійна — збірка `.deb` або `.rpm`.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'У Windows до камери має бути прив’язаний драйвер WinUSB, інакше жоден браузер до неї не дістанеться. Скористайтеся <zadig>Zadig</zadig>: *Options → List All Devices*, потім у списку виберіть запис із назвою вашої камери — наприклад, `CompactPRO FF`, — виберіть драйвер **WinUSB** і натисніть Replace Driver. Якщо камера з’являється в списку кілька разів, візьміть запис із позначкою *(Interface 0)*. Після цього програми виробника не бачитимуть пристрій, доки ви не повернете драйвер у Диспетчері пристроїв (*Видалити пристрій → Видалити драйвер*, потім від’єднайте й знову під’єднайте камеру).',
  'platform.android':
    'Працює в Chrome для Android із кабелем USB-OTG, якщо телефон може живити камеру через USB. Android надає доступ до USB через власне вікно дозволу. Завантажений файл потрапляє в теку «Завантаження», як і будь-який інший.',
  'platform.ios.name': 'iPhone та iPad',
  'platform.ios.cannot':
    '**Зчитати камеру неможливо**, і це не зміниться. Safari не підтримує WebUSB, а в iOS та iPadOS кожен браузер — зокрема Chrome і Firefox — зобов’язаний використовувати WebKit, тож жоден із них не надає цей API. Немає прапорця, розширення чи застосунку, які б це обійшли. Для зчитування скористайтеся настільним комп’ютером або телефоном Android.',
  'platform.ios.decrypt':
    'А от розшифрування тут працює: щоб розшифрувати наявний дамп, доступ до USB не потрібен, тож це можна зробити з iPhone чи iPad або з Firefox і Safari на комп’ютері.',
} satisfies Translation<'app', 'uk'>;
