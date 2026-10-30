/**
 * Namespace `decrypt`, русский (ru), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/DecryptView.tsx, hooks/useOfflineDecrypt.ts, hooks/useSlotFileDecrypt.ts,
 * components/DetectionBox.tsx, components/FilePickerButton.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useOfflineDecrypt: the status line. */
  'status.noFile': 'Файл не выбран.',
  'status.reading': 'Чтение файла ...',
  'status.notUsable': 'Это непригодный дамп.',
  'status.building': 'Сборка архива ...',
  'status.nothingDecrypted':
    'Ни один образ не расшифрован — причина в журнале. Манифест сохранён в загрузках.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Готово — расшифровано слотов: {done}/{count}. Проверьте загрузки.',
    few: 'Готово — расшифровано слотов: {done}/{count}. Проверьте загрузки.',
    many: 'Готово — расшифровано слотов: {done}/{count}. Проверьте загрузки.',
    other: 'Готово — расшифровано слотов: {done}/{count}. Проверьте загрузки.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Расшифровать уже имеющийся дамп',
  'offline.description': 'Полный дамп флеш-памяти, расшифрованный слот за слотом.',
  'offline.intro':
    'Шаг 2 вкладки 4.x/Nano и так расшифровывает всё, что считывает, поэтому этот раздел нужен, только если образ флеш-памяти получен откуда-то ещё — из прошлого прогона, через J-Link или программатором SPI. Файл читается локально и никуда не загружается. **Эта часть работает в любом браузере**, включая Safari и iOS, потому что ей не нужен доступ к USB.',
  'offline.actions': 'Действия расшифровки без камеры',
  'offline.choose': 'Выбрать файл дампа…',
  'offline.panel': 'Расшифровка без камеры',
  'offline.detectedTitle': 'Определённое семейство прошивок',
  'offline.detectedIntro':
    'Камера не подключена, поэтому семейство оценивается по образам в самом файле. Ключ в любом случае вычисляется из шифртекста каждого слота; эта оценка лишь определяет, какое семейство прошивок будет названо в отчёте.',
  'offline.scoreBasis': 'по образам в файле',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Расшифровать слот прошивки',
  'slot.description': 'Один слот из файла: 64 КБ, как его хранит камера.',
  'slot.intro':
    'Выберите файл с одним слотом прошивки — 65 536 байт, как его сохраняет дамп слота на вкладке <link>{tab}</link>, или те 64 КБ по адресу слота, что лежат в полном дампе флеш-памяти. Страница находит ключ по байтам самого слота, расшифровывает образ и предлагает скачать его, показывая ключ, размер и SHA-256. Камера не используется, поэтому всё работает, даже когда ничего не подключено.',
  'slot.refusedIntro':
    'Файл, который не является одним слотом, не содержит образа прошивки или не расшифровывается, отклоняется с указанием причины. Про стёртый слот так и будет сказано: расшифровывать в нём нечего.',
  'slot.actions': 'Действия с файлом слота',
  'slot.choose': 'Выбрать файл слота…',
  'slot.decrypting': 'Расшифровка {file} …',
  'slot.unreadable': 'Не удалось прочитать файл.',
  'slot.notDecrypted':
    'Не расшифровано: {file} не является слотом прошивки, который эта страница может расшифровать.',
  'slot.nothingWritten':
    'Ничего никуда не записано. Выберите файл слота размером 64 КБ или полный дамп в разделе выше.',
  'slot.erased': '{file} — стёртый слот.',
  'slot.resultTitle': 'Расшифрованный слот прошивки',
  'slot.file': 'Файл',
  'slot.fileSize': 'Размер файла',
  'slot.fileSha': 'SHA-256 файла',
  'slot.imageVersion': 'Версия образа',
  'slot.imageSize': 'Размер образа',
  'slot.imageSha': 'SHA-256 образа',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Контрольная сумма',
  'slot.notComputed': 'для этой формы не вычисляется',
  'slot.family': 'Семейство',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (определено по образу)',
  'slot.familyMismatch':
    '{name} — сумма не совпадает с целевым значением этого семейства, поэтому загрузчик не примет образ в таком виде',
  'slot.unknown': 'неизвестно',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} Б',
  'slot.key': 'Ключ',
  'slot.keyPlain': 'нет: слот хранит образ в открытом виде (незашифрованная цепочка 2014 года)',
  'slot.keyFfB': 'ключ B из пары 1.3.0.8 FF',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Хранится как',
  'slot.storedAsFfB': 'образ XOR ключевой поток ключа B, окно заголовка как есть',
  'slot.keyNone': 'нет',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Форма ключа',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k} — сам образ содержит эту форму один раз, что её и определяет',
  'slot.keyFormDefault':
    '{k} — ни одна форма не встречается в образе ровно один раз, поэтому показана форма по умолчанию для семейства',
  'slot.resultActions': 'Действия с расшифрованным образом',
  'slot.download': 'Скачать {file}',
  'slot.downloadFallback': 'расшифрованный образ',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Определено',
  'detection.score': 'Оценка',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} из 1.00, {basis}',
  'detection.readAs': 'Считано как',
  'detection.summary': 'Итог',
  'detection.why': 'Почему:',
  'detection.ambiguous':
    '**По имеющимся данным нельзя точно сказать, какое это семейство.** Либо победитель набрал не больше, чем общий запасной вариант, либо второй претендент оказался слишком близко. На расшифровку это не влияет — ключ в любом случае вычисляется из шифртекста, — но семейство, названное в отчёте, и всё, что от него зависит, — это догадка.',
} satisfies Translation<'decrypt'>;
