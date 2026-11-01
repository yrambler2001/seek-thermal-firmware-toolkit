/**
 * Namespace `app`, български (bg), translated from the English source: the shell.
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
  title: 'Инструменти за фърмуера на Seek Thermal',
  'header.cameraSelected': 'Избрана камера',
  'header.noCamera': 'Няма избрана камера',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB не е достъпен',
  'header.github': 'Инструментите в GitHub',
  'header.tabs': 'Раздели',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Информация',
  'tab.preserve': 'Дъмп и дешифриране 0.x/1.x',
  'tab.v4': 'Дъмп и дешифриране 4.x/Nano',
  'tab.decrypt': 'Дешифриране на файл/слот',
  'tab.slots': 'Работа със слотовете на фърмуера',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Фърмуер на Seek Thermal — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Тъмна тема',
  'theme.followsSystem': 'Следва светлата или тъмната настройка на системата ви',
  'theme.chosenDiffers':
    'Избрано тук. Превключете обратно, за да следва настройката на системата ви.',
  'theme.chosenSame': 'Избрано тук, същото като текущата настройка на системата ви',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Език',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Чете свързаната камера така, както го прави `seek-fw info`: фърмуера ѝ, семейството, като което се представя, как стартира, ключовете ѝ и всеки слот. Казва ви кой от другите раздели е за нея и обяснява с прости думи за какво служи всеки раздел. **В този раздел нищо не се записва във флаш паметта.**',
  'intro.preserve':
    'За камери с **0.x и 1.x** (компилациите от 2014 и 2016 г.). Прави **пълно** копие на флаш паметта на камерата (4 МБ) — включително частите, до които обикновеният дъмп не стига — и след това връща камерата точно в състоянието, в което е била. Прави резервно копие на това, което може да прочете, временно прилага пач към фърмуера, за да може да се прочете останалото, прави дъмп на всичко, възстановява оригинала и го проверява. Всичко се изпълнява локално в браузъра ви. **Две от стъпките записват във флаш паметта** и всяка от тях първо ви пита.',
  'intro.v4':
    'Прави копие на SPI флаш паметта (4 МБ) на камера с **4.x или Nano** през WebUSB, само с четене, и дешифрира всички образи на фърмуера, които открие. Всичко се изпълнява локално в браузъра ви — нищо не се качва никъде. **Само четене:** този раздел не изпраща команда за запис, изтриване, качване, потвърждаване (commit) или рестартиране. Камера с фърмуер от друга линия се отказва, преди да се прочете каквото и да е.',
  'intro.decrypt':
    'Дешифрира фърмуер, който вече имате, на този компютър: цял дъмп на флаш паметта или един слот на фърмуера от 64 КБ. **Не се използва камера**, така че това работи и без нищо включено, и в браузъри без достъп до USB. Файлът се чете тук и никога не се качва.',
  'intro.slots':
    'Чете трите слота на фърмуера на камерата — слот A, слот B и слот за възстановяване R — и показва какво съдържа всеки от тях, от кой стартира камерата и какво може да направи с него тази компилация, а до тях — работещия фърмуер и ключовете на устройството. Всичко се изпълнява локално в браузъра ви. **Този раздел записва във флаш паметта:** може да запише един слот от дешифриран образ или от сурови байтове и пита преди всеки запис.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**WebUSB не е наличен в iOS и iPadOS,** затова това устройство не може да чете флаш паметта на камера.',
  'support.ios.body':
    'Safari не го поддържа, а всеки браузър за iOS е длъжен да използва WebKit, така че и Chrome, и Firefox тук не могат да го предоставят. Няма флаг или разширение, което да промени това. За да направите дъмп на камера, използвайте настолен компютър или телефон с Android и USB-OTG кабел.',
  'support.noWebUsb.title': '**Този браузър няма достъп до USB устройства.**',
  'support.noWebUsb.body':
    'WebUSB е наличен в Chrome, Edge, Opera и други браузъри на базата на Chromium под Windows, macOS, Linux и Android. Firefox и Safari са отказали да го поддържат.',
  'support.noWebUsb.insecure':
    'Освен това страницата не се зарежда през защитена връзка, което само по себе си блокира WebUSB.',
  'support.insecure.title': '**Незащитена връзка.** Тук WebUSB е изключен.',
  'support.insecure.body':
    'Отворете страницата през HTTPS или от `http://localhost`. Обикновен адрес в локалната мрежа, като `http://192.168.1.10:8000`, не става.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Все пак можете да използвате раздела **{tab}** — той работи изцяло с файл, който изберете, и не се нуждае от достъп до USB.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Готово.** Включете камерата Seek и натиснете *{connect}*.',
  'support.fileProtocol':
    'Страницата е отворена като локален файл, затова браузърът няма да запомни устройството между презарежданията. Това не вреди.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Забележка: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Свързване',
  'connect.actions': 'Действия с устройството',
  'connect.connect': 'Свързване на устройство',
  'connect.change': 'Смяна на устройството',
  'connect.test': 'Проверка на връзката',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Забравяне на устройството',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Предлага се всяко устройство на Seek Thermal (USB идентификатор на производителя `{vendor}`) — Compact, Compact PRO, Nano и т.н. Изберете своето в прозореца на браузъра за избор на устройство.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Бележки за платформите',
  'platform.macos':
    'Работи веднага в Chrome, Edge или друг браузър на базата на Chromium. Без инсталиране на драйвер, без администраторски права. Първо затворете всяка друга програма, която вече комуникира с камерата — само един процес може да държи USB интерфейса в даден момент.',
  'platform.linux.access':
    'Дайте на потребителя си достъп до устройството, след това го изключете и включете отново:',
  'platform.linux.sandbox':
    'Версиите на Chromium от Snap и Flatpak често са изолирани от суровите USB устройства; надеждната версия е `.deb` или `.rpm`.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Под Windows към камерата трябва да е закачен драйверът WinUSB, преди който и да е браузър да стигне до нея. Използвайте <zadig>Zadig</zadig>: *Options → List All Devices*, след това в падащия списък изберете записа с името на камерата ви — например `CompactPRO FF` — изберете **WinUSB** за драйвер и щракнете Replace Driver. Ако камерата ви се появява повече от веднъж, вземете записа с означение *(Interface 0)*. Така устройството се отнема от софтуера на производителя, докато не върнете промяната в диспечера на устройствата (*Деинсталиране на устройство → Изтриване на драйвера*, след което включете камерата отново).',
  'platform.android':
    'Работи в Chrome за Android с USB-OTG кабел, ако телефонът може да захранва камерата през шината. Android дава достъп до USB чрез собствения си диалог за разрешение. Изтегленото отива в папката „Изтегляния“ като всеки друг файл.',
  'platform.ios.name': 'iPhone и iPad',
  'platform.ios.cannot':
    '**Не може да чете камера** и това няма да се промени. Safari не поддържа WebUSB, а в iOS и iPadOS всеки браузър — включително Chrome и Firefox — е длъжен да използва WebKit, така че никой от тях не предоставя този API. Няма флаг, разширение или приложение, което да го заобиколи. За дъмп използвайте настолен компютър или телефон с Android.',
  'platform.ios.decrypt':
    'Допълнителният дешифратор тук работи: дешифрирането на дъмп, който вече имате, не изисква достъп до USB, така че можете да го направите от iPhone или iPad, или от Firefox и Safari на настолен компютър.',
} satisfies Translation<'app', 'bg'>;
