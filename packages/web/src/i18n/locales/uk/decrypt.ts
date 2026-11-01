/**
 * Namespace `decrypt`, українська (uk), translated from the English source.
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
  'status.noFile': 'Файл не вибрано.',
  'status.reading': 'Читання файлу ...',
  'status.notUsable': 'Цей дамп непридатний.',
  'status.building': 'Створення архіву ...',
  'status.nothingDecrypted':
    'Жоден образ не розшифровано — причину див. у журналі. Маніфест — у ваших завантаженнях.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Готово — розшифровано слотів: {done}/{count}. Перевірте завантаження.',
    few: 'Готово — розшифровано слотів: {done}/{count}. Перевірте завантаження.',
    many: 'Готово — розшифровано слотів: {done}/{count}. Перевірте завантаження.',
    other: 'Готово — розшифровано слотів: {done}/{count}. Перевірте завантаження.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Розшифрувати наявний дамп',
  'offline.description': 'Повний дамп флеш-пам’яті, розшифрований слот за слотом.',
  'offline.intro':
    'Крок 2 вкладки 4.x/Nano і так розшифровує все, що зчитує, тож це потрібно, лише якщо ваш образ флеш-пам’яті взято деінде — з попереднього зчитування, з J-Link чи з програматора SPI. Файл читається локально й нікуди не завантажується. **Ця частина працює в будь-якому браузері**, зокрема в Safari та на iOS, бо їй не потрібен доступ до USB.',
  'offline.actions': 'Дії офлайн-розшифрування',
  'offline.choose': 'Вибрати файл дампу…',
  'offline.panel': 'Офлайн-розшифрування',
  'offline.detectedTitle': 'Визначене сімейство прошивок',
  'offline.detectedIntro':
    'Камеру не під’єднано, тож сімейство оцінюється за образами в самому файлі. Ключ у будь-якому разі обчислюється із шифротексту кожного слота; ця оцінка лише називає сімейство прошивок у звіті.',
  'offline.scoreBasis': 'за образами у файлі',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Розшифрувати слот прошивки',
  'slot.description': 'Один слот із файлу: 64 КБ, як його зберігає камера.',
  'slot.intro':
    'Виберіть файл з одним слотом прошивки — 65 536 байтів, як його зберігає зчитування слота на вкладці <link>{tab}</link>, або 64 КБ за адресою слота з повного дампу флеш-пам’яті. Сторінка знаходить ключ за власними байтами слота, розшифровує образ і пропонує його завантажити, показуючи ключ, розмір і SHA-256. Камера не потрібна, тож це працює без під’єднаних пристроїв.',
  'slot.refusedIntro':
    'Файл, який не є одним слотом, не містить образу прошивки або не розшифровується, відхиляється із зазначенням причини. Про стертий слот так і буде сказано: розшифровувати в ньому нічого.',
  'slot.actions': 'Дії з файлом слота',
  'slot.choose': 'Вибрати файл слота…',
  'slot.decrypting': 'Розшифрування {file} …',
  'slot.unreadable': 'Не вдалося прочитати файл.',
  'slot.notDecrypted':
    'Не розшифровано: {file} — не слот прошивки, який ця сторінка може розшифрувати.',
  'slot.nothingWritten':
    'Нічого й ніде не записано. Виберіть файл слота на 64 КБ або повний дамп у розділі вище.',
  'slot.erased': '{file} — стертий слот.',
  'slot.resultTitle': 'Розшифрований слот прошивки',
  'slot.file': 'Файл',
  'slot.fileSize': 'Розмір файлу',
  'slot.fileSha': 'SHA-256 файлу',
  'slot.imageVersion': 'Версія образу',
  'slot.imageSize': 'Розмір образу',
  'slot.imageSha': 'SHA-256 образу',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Контрольна сума',
  'slot.notComputed': 'для цієї форми не обчислюється',
  'slot.family': 'Сімейство',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (визначено за образом)',
  'slot.familyMismatch':
    '{name} — сума не та, яку приймає завантажувач цього сімейства, тож у такому вигляді він образ не прийняв би',
  'slot.unknown': 'невідомо',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} Б',
  'slot.key': 'Ключ',
  'slot.keyPlain': 'немає: слот зберігає образ незашифрованим (незашифрований ланцюжок 2014 року)',
  'slot.keyFfB': 'Ключ B пари 1.3.0.8 FF',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Як зберігається',
  'slot.storedAsFfB': 'образ XOR потік ключа B, вікно заголовка без змін',
  'slot.keyNone': 'немає',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Форма ключа',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k} — сам образ містить цю форму рівно один раз, і це її визначає',
  'slot.keyFormDefault':
    '{k} — жодна форма не трапляється в образі рівно один раз, тож показано типову для сімейства',
  'slot.resultActions': 'Дії з розшифрованим образом',
  'slot.download': 'Завантажити {file}',
  'slot.downloadFallback': 'розшифрований образ',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Визначено',
  'detection.score': 'Оцінка',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} з 1.00, {basis}',
  'detection.readAs': 'Зчитано як',
  'detection.summary': 'Підсумок',
  'detection.why': 'Чому:',
  'detection.ambiguous':
    '**Докази не дали змоги встановити, яке це сімейство.** Або переможець набрав не більше, ніж загальний запасний варіант, або другий кандидат надто близько, щоб обрати. На розшифрування це не впливає — ключ у будь-якому разі обчислюється із шифротексту, — але сімейство, назване у звіті, і все, що від нього залежить, — лише припущення.',
} satisfies Translation<'decrypt', 'uk'>;
