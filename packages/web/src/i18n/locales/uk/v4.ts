/**
 * Namespace `v4`, українська (uk), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/V4View.tsx, hooks/useDumpPanel.ts, components/CameraIdentity.tsx,
 * components/OptionsDetails.tsx, lib/options.ts.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useDumpPanel: the status line. */
  'status.starting': 'Починаємо ...',
  'status.building': 'Створення архіву ...',
  'status.cancelling': 'Скасування — буде збережено все, що вже зчитано ...',
  'status.refused': 'Відхилено — нічого не зчитано. Див. повідомлення над журналом.',
  'status.sweepDone':
    'Готово — активовано селекторів: {armed}/{total}, із даними: {withData}. Перевірте завантаження.',
  'status.sweepDoneCancelled':
    'Готово — активовано селекторів: {armed}/{total}, із даними: {withData} (скасовано). Перевірте завантаження.',
  'status.dumpDone': 'Готово — зчитано вікон: {read}/{expected}. Перевірте завантаження.',
  'status.dumpDoneCancelled':
    'Готово — зчитано вікон: {read}/{expected} (скасовано). Перевірте завантаження.',
  'status.dumpDoneIncomplete':
    'Готово — зчитано вікон: {read}/{expected} (неповно — див. журнал). Перевірте завантаження.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'Камера не відповідає сімейству 4.x/Nano, а ця вкладка зчитує лише його. Нічого не зчитано. Для камери 0.x чи 1.x (збірки 2014 або 2016 року) скористайтеся вкладкою «{tab}».',
  'refusal.otherFamily':
    'Камера схожа на {name} ({id}), а не на камеру 4.x/Nano, а ця вкладка зчитує лише 4.x/Nano. Нічого не зчитано. Для камери 0.x чи 1.x (збірки 2014 або 2016 року) скористайтеся вкладкою «{tab}».',
  'refusal.legacyLine':
    'Камера працює на {version} — збірці 0.x або 1.x (2014 чи 2016 року), а ця вкладка зчитує лише 4.x/Nano. Зчитано тільки версію. Для камери 0.x чи 1.x скористайтеся вкладкою «{tab}».',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Дамп',
  'dump.actions': 'Дії з дампом',
  'dump.start': 'Почати дамп',
  'dump.panel': 'Дамп',
  'dump.how':
    'Обидві кнопки спершу запитують у камери, яку прошивку вона виконує: її версію — командою `{getInfo}`, єдиним зчитуванням, на яке кожна збірка Seek відповідає однаково, — і, лише якщо цю збірку можна зчитати через USB, один звичайний і один `{begin}` з токеном та одне зчитування. Так сторінка визначає сімейство камери. Ця вкладка зчитує лише сімейство 4.x і Nano. Камеру, яку відповіді відносять до будь-якого іншого, буде відхилено ще до зчитування, а сторінка назве вкладку для неї. Камера, яка не повідомляє своєї версії або має збірку, старшу за 0.8.0.0, не зчитується взагалі, і сторінка пояснює чому.',
  'dump.modes':
    '**Почати дамп** зчитує всі блоки, до яких дістає власна таблиця селекторів збірки. **Зчитати всі селектори** (у розділі *Параметри* нижче) перебирає всі селектори `{begin}` `{first}`–`{last}` і зберігає все, що повертає кожен із них, — повільніше, зате захоплює й блоки, які пропускає підібрана карта.',
  'dump.sweep': 'Зчитати всі селектори ({first}–{last})',
  'dump.sweepNote':
    'Перебирає всі селектори й зберігає все, що повертає кожен із них. Повільніше, ніж «Почати дамп».',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'Що ви отримаєте',
  'output.intro': 'Один файл `{ext}`, у якому:',
  'output.caption': 'Файли всередині завантаженого архіву',
  'output.file': 'Файл',
  'output.what': 'Що це',
  'output.flash':
    'зібраний образ флеш-пам’яті на 4 МБ (заповнення прогалини і токен розблокування, якщо його використано, — у manifest.json)',
  'output.windows': 'кожен блок на 64 КБ точно так, як його передала камера',
  'output.decrypted': 'кожен слот з образом прошивки, розшифрований (якщо ключ знайдено)',
  'output.reports':
    'звіт для кожного слота: ключ, місце ключа, сімейство й шифр, SP, точка входу, SHA-256',
  'output.manifest': 'точні метадані зчитування, прогалин і розшифрування',
  'output.readme': 'що це за знімок і які в нього обмеження',
  'output.keyFromDump':
    'Ключ відновлюється із самого дампу, тож ні файл ключа, ні секрет пристрою не потрібні.',
  'output.bestEffort':
    'Утім, розшифрування не гарантоване. Якщо ключ не знайдено — наприклад, на пристрої, чий завантажувач виводить ключ з OTP мікросхеми, якої немає в дампі флеш-пам’яті, — цей слот просто пропускається, а решта архіву від цього не страждає.',
  'gap.summary': 'Прогалина {address}',
  'gap.where':
    'Набір команд USB має селектор вікна зчитування для кожного блоку на 64 КБ із 4 МБ флеш-пам’яті, крім `{range}`. Цей блок у зібраному образі заповнено значенням `{fill}` і зазначено в `{manifest}`.',
  'gap.costs':
    '**На практиці це вам нічого не коштує.** У більшості камер цей блок — просто стерта флеш-пам’ять, яка й так читається як `{fill}`, — тож заповнення збігається з тим, що там насправді, і образ повний.',
  'gap.redundant':
    'А коли цей блок *таки* використовується, у ньому лише надлишкова копія. Ці камери зберігають той самий образ прошивки в кількох слотах по 64 КБ: в усіх багатослотових дампах, перевірених під час створення цієї сторінки, усі слоти розшифровувалися в побайтово однакову прошивку — в одному випадку в чотирьох слотах, записаних двома різними ключами. На єдиному пристрої, де за адресою `{address}` був справжній образ, він побайтово збігався з копіями за `{before}` і `{after}`, тож архів однаково містить цю прошивку, просто зчитану з іншої адреси.',
  'gap.fine':
    'Саме через цю надлишковість камера, у якої `{address}` читається як `{fill}`, справна: придатна до запуску прошивка є в інших слотах. До того ж ніщо на цій вкладці не записує в пристрій — прогалина впливає лише на файл, який ви завантажуєте.',
  'gap.complete':
    'Якщо вам потрібен строго повний побайтовий образ — скажімо, щоб порівняти флеш-пам’ять з еталоном, — зчитайте його через SWD/J-Link або програматором SPI.',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': 'Не зчитано: камера не сказала, яку прошивку виконує.',
  'identity.unsupported': 'Не зчитано: цю камеру не можна зчитати таким способом.',
  'identity.title': 'Визначена камера',
  'identity.firmware': 'Прошивка',
  'identity.scoreBasis': 'за відповідями камери, ще до зчитування будь-якого слота',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Параметри',
  'options.subtitle': '— типові значення правильні; тут нічого змінювати не потрібно.',
  'options.chunk': 'chunk (байтів control-IN)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'байт gap-fill',
  'options.retries': 'повторів на вікно',
  'options.retryDelay': 'затримка повтору (мс)',
  'options.recipient': 'recipient (отримувач control-запиту)',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'авто',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'розшифрувати прошивку',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'так',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'ні',
  'options.help':
    '**chunk** — розмір кожного зчитування control-IN, щонайбільше 64: один пакет EP0. Довше зчитування може втратити пакет через boot ROM камери, коли камера простоює на низькій частоті, тож більше значення зчитується по 64 байти; менше використовується як є, а якщо камера зависає, сторінка сама зменшує його й продовжує. **gap-fill** — байт, яким заповнюється єдиний блок на 64 КБ, недосяжний через USB. **recipient** типово має значення interface і переходить на device, якщо браузер не може захопити інтерфейс 0, — прошивка приймає обидва.',
  'options.chunkRange': 'chunk має бути від 1 до {max}, отримано {value}',
  'options.gapFillByte': 'gap-fill має бути одним байтом, отримано {value}',
  'options.retriesMin': 'кількість повторів має бути нуль або більше, отримано {value}',
  'options.retryDelayMin': 'затримка повтору має бути нуль або більше, отримано {value}',
} satisfies Translation<'v4', 'uk'>;
