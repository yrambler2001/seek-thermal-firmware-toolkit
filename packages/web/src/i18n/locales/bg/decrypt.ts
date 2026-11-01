/**
 * Namespace `decrypt`, български (bg), translated from the English source.
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
  'status.noFile': 'Не е избран файл.',
  'status.reading': 'Четене на файла…',
  'status.notUsable': 'Не е използваем дъмп.',
  'status.building': 'Създаване на архива…',
  'status.nothingDecrypted':
    'Не е дешифриран нито един образ — причината е в журнала. Манифестът е в изтеглените файлове.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Готово — дешифриран слот: {done}/{count}. Проверете изтеглените файлове.',
    other: 'Готово — дешифрирани слотове: {done}/{count}. Проверете изтеглените файлове.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Дешифриране на дъмп, който вече имате',
  'offline.description': 'Цял дъмп на флаш паметта, дешифриран слот по слот.',
  'offline.intro':
    'Стъпка 2 в раздела 4.x/Nano вече дешифрира всичко, което прочете, така че това ви трябва само ако образът на флаш паметта е дошъл от другаде — от по-ранно четене, от J-Link или от SPI програматор. Файлът се чете локално и никога не се качва. **Тази част работи във всеки браузър**, включително Safari и iOS, защото не изисква достъп до USB.',
  'offline.actions': 'Действия за офлайн дешифриране',
  'offline.choose': 'Избор на файл с дъмп…',
  'offline.panel': 'Офлайн дешифриране',
  'offline.detectedTitle': 'Разпознато семейство фърмуер',
  'offline.detectedIntro':
    'Няма свързана камера, затова семейството се оценява по образите в самия файл. Ключът и в двата случая се извлича от шифрирания текст на всеки слот; от това зависи само името на семейството фърмуер в отчета.',
  'offline.scoreBasis': 'по образите във файла',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Дешифриране на слот на фърмуера',
  'slot.description': 'Един слот, от файл: 64 КБ, както ги съхранява камерата.',
  'slot.intro':
    'Изберете файл, който съдържа един слот на фърмуера — 65 536 байта, както ги запазва дъмпът на слот в раздела <link>{tab}</link>, или 64-те КБ на адреса на слота в дъмп на цялата флаш памет. Страницата намира ключа от собствените байтове на слота, дешифрира образа и го предлага за изтегляне, като показва ключа, размера и SHA-256. Не се използва камера, така че това работи и без нищо включено.',
  'slot.refusedIntro':
    'Файл, който не е един слот, не съдържа образ на фърмуер или не се дешифрира, се отказва, като се посочва причината. За изтрит слот се казва, че е изтрит, и в него няма какво да се дешифрира.',
  'slot.actions': 'Действия с файла на слота',
  'slot.choose': 'Избор на файл със слот…',
  'slot.decrypting': 'Дешифриране на {file} …',
  'slot.unreadable': 'Файлът не можа да бъде прочетен.',
  'slot.notDecrypted':
    'Не е дешифриран: {file} не е слот на фърмуера, който тази страница може да дешифрира.',
  'slot.nothingWritten':
    'Нищо не е записано никъде. Изберете файл със слот от 64 КБ или цял дъмп в частта по-горе.',
  'slot.erased': '{file} е изтрит слот.',
  'slot.resultTitle': 'Дешифриран слот на фърмуера',
  'slot.file': 'Файл',
  'slot.fileSize': 'Размер на файла',
  'slot.fileSha': 'SHA-256 на файла',
  'slot.imageVersion': 'Версия на образа',
  'slot.imageSize': 'Размер на образа',
  'slot.imageSha': 'SHA-256 на образа',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Контролна сума за приемане',
  'slot.notComputed': 'не се изчислява за тази форма',
  'slot.family': 'Семейство',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (разпознато по образа)',
  'slot.familyMismatch':
    '{name} — сумата не е целевата стойност за приемане на това семейство, така че буутлоудърът не би приел образа в този вид',
  'slot.unknown': 'неизвестно',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} Б',
  'slot.key': 'Ключ',
  'slot.keyPlain': 'няма: слотът съдържа образа в открит вид (нешифрованата верига от 2014 г.)',
  'slot.keyFfB': 'Ключ B от двойката на 1.3.0.8 FF',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Съхранен като',
  'slot.storedAsFfB': 'образът XOR ключовия поток на ключ B, прозорецът на заглавието — непроменен',
  'slot.keyNone': 'няма',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Форма на ключа',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k} — самият образ съдържа тази форма веднъж, което я определя',
  'slot.keyFormDefault':
    '{k} — нито една форма не се среща веднъж в образа, затова е показана стандартната за семейството',
  'slot.resultActions': 'Действия с дешифрирания образ',
  'slot.download': 'Изтегляне на {file}',
  'slot.downloadFallback': 'дешифрирания образ',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Разпознато',
  'detection.score': 'Оценка',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} от 1.00, {basis}',
  'detection.readAs': 'Прочетено като',
  'detection.summary': 'Обобщение',
  'detection.why': 'Защо:',
  'detection.ambiguous':
    '**Данните не показаха еднозначно кое е семейството.** Или победителят не е получил по-добра оценка от общия резервен вариант, или вторият е твърде близо до него. Дешифрирането не е засегнато — ключът и в двата случая се извлича от шифрирания текст, — но семейството, посочено в отчета, и всичко, което зависи от него, е предположение.',
} satisfies Translation<'decrypt', 'bg'>;
