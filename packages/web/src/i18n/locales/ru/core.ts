/**
 * Namespace `core`, русский (ru), translated from the English source: sentences that `@seek-fw/core` makes and
 * the page shows. A key is a core message code (packages/core/src/message.ts):
 * core gives the page `{ code, params, text }`, and `coreText()`
 * (lib/core-text.ts) renders `core:<code>` with the params. English must
 * render to core's `text` word for word: i18n/core-messages.test.ts renders
 * every key here for representative inputs and compares, so the CLI and the
 * page keep saying the same thing in English. Don't reword a template here
 * without rewording core, and the other way round.
 *
 * For translators (the `core` namespace):
 * - Every value here is a sentence core also prints in English (the CLI, the
 *   logs, the copyable report). Translate the sentence; keep its `{params}`.
 * - Params that arrive ALREADY TRANSLATED (another core message, or a page word):
 *   - a bank: `{bank}`, `{name}`, `{first}`, `{second}`, `{last}`, `{target}`.
 *     Inside a sentence it is "slot A" / "recovery R" (common:bank.*InSentence);
 *     where the English starts a sentence or names a row it is the label form
 *     "Slot A" / "Recovery R". `{first}`/`{second}`/`{last}` in boot.rule may be
 *     a bare letter ("A").
 *   - a key name: `{key}`, `{held}`, `{holds}`, `{masks}` (keyName.*: "Key A",
 *     "per-device key", …; `{masks}` is several, joined with commas).
 *   - a nested sentence: `{why}`, `{reason}`, `{verdict}`, `{risk}`,
 *     `{untested}`, `{outcome}`, `{failure}`, `{answers}`, `{predicted}`,
 *     `{plain}`, `{ff}`, `{reference}`, `{recovered}`, `{check}`, `{phrase}`,
 *     `{staged}`, `{source}`, `{operation}`, `{error}`, `{label}`, `{writable}`,
 *     `{next}`, `{form}`, `{notes}`, `{remedy}`, `{capability}`, `{pair}`
 *     (report.checkKey.pair, or nothing), `{said}` (detect.source.*), `{context}`, and `{note}` in
 *     preserve.refused.recoveryOnly and identity.versionUnknown. Each is another key of
 *     this namespace (the comment above a key says which), already in your
 *     language. A `{why}` that starts a sentence arrives with a capital letter.
 *   - a list: `{banks}`, `{reasons}`, `{masks}`, `{files}`, `{sites}`, `{places}`,
 *     `{context}`, `{notes}` (joined with your common:list.* words; where the
 *     English uses a semicolon, common:list.semicolon; `{reasons}` in
 *     writeRefusal.otherFamily is detect.* sentences).
 * - Params that stay AS THEY ARE: hex values and offsets (`{word}`, `{offset}`,
 *   `{sum}`, `{hex}`, `{address}`, `{at}`, `{status}`, `{magic}`, `{length}`,
 *   `{k}`, `{zero}`, `{block}`), byte counts (`{size}`, `{count}`, `{kib}`), mode numbers (`{mode}`),
 *   a score (`{score}`), firmware versions (`{version}`, `{image}`, `{camera}`,
 *   `{firmware}`, `{builds}`, `{only}`, and `{first}` in support.* and detect.*), file
 *   names (`{file}`), a SHA-256 (`{sha256}`), a selector table's name
 *   (`{table}`) and family names (`{family}`, `{detected}`).
 * - Still English inside a translated sentence (core gives them no code yet):
 *   `{error}` when the error has no code (a USB error, a ZIP reader's error,
 *   a bug, or a refusal only a broken run file reaches, such as the patch
 *   builder's own gates), a read reason (read.reason.*'s place) that came
 *   from such an error, `{signature}` in preserve.fail.* (it describes the
 *   bytes or the wire stall; people paste it to the owner), `{reasons}` in
 *   preserve.fail.spentReaderDerive, `{note}` in preserve.gate.drainRefused,
 *   `{gap}` in restore.refused.gap*, and `{mismatch}` in
 *   slots.image.keyMismatch.
 * - Capitals: keep the English's. A template that starts lower case is said
 *   inside another sentence or after a label ("Note: …", a list item, "Not
 *   read: …"); one that starts upper case stands alone.
 * - Names stay English: command names (GetFirmwareInfo, CompleteMemoryUpgrade,
 *   BeginFirmwareUpgrade), wire ids, mode numbers, header fields
 *   (`header.length`, "CODE"), PRESERVATION.md, UNTESTED.
 *
 * Owner: phase 3 (core messages). Phase 1 put the unlock note here as the
 * first entry.
 */

import type { Translation } from '../../types';

export default {
  /** `UNLOCK_POWER_CYCLE_NOTE`; the page shows it as "Note: …." (app:unlockNote). */
  'unlock.powerCycleNote':
    'камера остаётся разблокированной до выключения питания, и до тех пор другие программы могут считывать её неверно; прежде чем ими пользоваться, выключите и снова включите её питание',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': 'сначала {first}, затем {second}, затем {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'не был считан',
  'boot.verdict.checkKeyUnnamed':
    'не удалось проверить: ключ, под которым загрузчик проверяет слот, не назван',
  'boot.cfg0NotRead':
    'слово конфигурации запуска (cfg[0]) не считано, поэтому неизвестно, с какого слота пойдёт следующий запуск',
  'boot.select.unknown':
    'слово конфигурации запуска — {word}, поэтому загрузчик сначала пробует {first:acc}, но {bank} {verdict}, поэтому неизвестно, какой слот запустится',
  'boot.select.first':
    'слово конфигурации запуска — {word}, поэтому загрузчик сначала пробует {first:acc}, и в нём есть образ, который загрузчик принимает',
  'boot.select.second':
    'слово конфигурации запуска — {word}, поэтому загрузчик сначала пробует {first:acc}; в {first:loc} нет образа, который загрузчик принимает, поэтому он берёт {second:acc}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'слово конфигурации запуска — {word}, поэтому загрузчик сначала пробует {first:acc}; ни в {first:loc}, ни в {second:loc} нет образа, который загрузчик принимает, поэтому он запускает {last:acc}, который не проверяет',
  'boot.select.lastTakes':
    'слово конфигурации запуска — {word}, поэтому загрузчик сначала пробует {first:acc}; ни в {first:loc}, ни в {second:loc} нет образа, который загрузчик принимает, поэтому он берёт {last:acc}, который не проверяет',
  'boot.bootsNow': '{bank} — слот, с которого камера запущена сейчас',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'запущен сейчас',
  'boot.notBooted': 'не запущен',
  'boot.unknownWhy.checkKeyUnnamed':
    'ключ, под которым загрузчик проверяет слот, в этом считывании не назван',
  'boot.unknownWhy.noKeyTable':
    'таблица ключей загрузчика не считана, поэтому ключи, которые он пробует, назвать нельзя',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'Камера запускается со {bank:gen}. {why}.',
  'fpsBoot.holdsOne':
    '{bank} содержит патч частоты кадров, но этот слот не запускается, поэтому патч не действует.',
  'fpsBoot.holdsTwo':
    '{banks} содержат патчи частоты кадров, но ни один из этих слотов не запускается, поэтому патчи не действуют.',
  'fpsBoot.wouldNotRun':
    'Патч {target:gen} не заставит его запускаться, потому что камера запускается со {bank:gen}.',
  'fpsBoot.patchRunning':
    'Пропатчите и {bank:acc} (слот, который запускается): именно так патч частоты кадров начнёт действовать.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank} здесь пропатчить нельзя ({reason}), поэтому патч частоты кадров в другом слоте на этой камере не действует.',

  /* ---- backup: the zip saved before a bank write (slots/backup) ---- */
  'backup.bank.notInPlan': '{name} (нет в плане этой сборки: это указано в zip-архиве)',
  'backup.bank.unsupported':
    '{name} (эта сборка не может его считать, {reason}: это указано в zip-архиве)',
  'backup.bank.empty':
    '{name} (пуст, каждый байт 0xFF: это указано в zip-архиве, и запись не перезаписывает никакую прошивку)',
  'backup.bank.unread':
    '{name} (считывание слотов до него не дошло: в zip-архиве указано, дошло ли считывание перед записью)',
  'backup.bank.noKey':
    '{name} (как хранится; ни один ключ, восстановленный этим считыванием, его не открывает, поэтому расшифрованного файла нет)',
  'backup.bank.decrypted': '{name} (как хранится и в расшифрованном виде)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Прежде чем что-либо будет записано, {banks} заново считывается и сохраняется в один zip-архив с пояснением к каждому файлу: {file}.',
  'backup.plan.many':
    'Прежде чем что-либо будет записано, {banks} заново считываются и сохраняются в один zip-архив с пояснением к каждому файлу: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'зашифрован так, что устройство хранит его под ключом слота, с которого запущена камера',
  'staging.detail.slotKeystreamCiphertext':
    'зашифрован собственным ключом передачи образа (блок ключей 0); камера хранит его под собственным ключом слота',
  'staging.detail.plain': 'не зашифрован, без шифра',
  'staging.detail.keyAKeystream':
    'образ 1.3.0.8 FF в том виде, в каком его передаёт фирменное приложение (XOR ключ A), — сборка 16 Hz хранит под ключом B сам образ, а не эти байты',
  'staging.detail.verbatim': 'как есть — байты ровно в том виде, в каком даны',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'нет считывания',
  'copy.source.notInPlan': '{name} нет в плане этой сборки',
  'copy.source.notRead': '{name} не был считан ({reason}), поэтому нет образа для копирования',
  'copy.source.empty': '{name} пуст: нет образа для копирования',
  'copy.source.foreign':
    'в {name:loc} нет образа прошивки, который распознаёт это считывание, поэтому копировать нечего',
  'copy.source.noKey':
    'ни один ключ, восстановленный этим считыванием, не открывает {name:acc}, поэтому нет расшифрованного образа для копирования',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} по адресу {address}, в том виде, в каком его расшифровало считывание слотов',
  'copy.fromVersion':
    '{name} по адресу {address}, прошивка {version}, в том виде, в каком его расшифровало считывание слотов',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'Образ взят из {name:gen} в том виде, в каком его расшифровало считывание слотов: {size} Б, sha256 {sha256}.',
  'copy.noteVersion':
    'Образ взят из {name:gen} в том виде, в каком его расшифровало считывание слотов: прошивка {version}, {size} Б, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's Slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '{name} из резервной копии (по адресу {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where}, полная резервная копия флеш-памяти {file}',
  'restore.fromVersion': '{where}, полная резервная копия флеш-памяти {file}, прошивка {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'образ флеш-памяти 4 МБ',
  'restore.kind.preserve-run': 'файл прогона Preserve',
  'restore.kind.dump': 'zip-архив «Дамп и расшифровка 4.x/Nano»',
  'restore.kind.all-selectors': 'zip-архив «Дамп всех селекторов»',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'образ',
  'restore.decryptedTo.firmware': 'прошивку {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'Образ — {where}, файл {file} ({kind}): sha256 хранимых байтов {stored}, расшифрован в {decrypted} размером {size} Б (sha256 {sha256}).',
  'restore.note.imageEntry':
    'Образ — {where}, файл {file} ({kind}, внутри — {entry}): sha256 хранимых байтов {stored}, расшифрован в {decrypted} размером {size} Б (sha256 {sha256}).',
  'restore.note.readBack':
    'После записи результат контрольного считывания слота сравнивается с хранимыми байтами слота из резервной копии.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'Идентификационный блок резервной копии называет эту камеру (серийный номер {serial}).',
  'restore.note.sameBytes':
    'В {name:loc} уже лежат хранимые байты из резервной копии: запись вернёт на место тот же образ.',
  'restore.warn.otherCamera':
    'Похоже, эта резервная копия от другой камеры: её идентификационный блок называет серийный номер {theirs}, а у этой камеры — {camera}. Записывается только образ {name:gen}; ничего из идентификационных данных или калибровки той камеры не записывается.',
  'restore.warn.noIdentity':
    'В этой резервной копии нет идентификационного блока по адресу {address}, поэтому нельзя сказать, с какой камеры она считана.',
  'restore.warn.serialNotRead':
    'Серийный номер камеры не считан, поэтому резервную копию (серийный номер {serial}) нельзя с ней сопоставить.',
  'restore.warn.otherFirmware':
    '{where}: прошивка {version}, а на камере работает {camera}; восстановление запишет в слот другую прошивку.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank} не считывался для контроля, поэтому не сравнивается с резервной копией.',
  'restore.readBack.equal':
    '{bank}: контрольное считывание побайтно совпадает с тем, что хранит резервная копия.',
  'restore.readBack.differs':
    '{bank}: контрольное считывание отличается от хранимых байтов резервной копии в {count} Б (первое отличие по адресу {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, выведен из {bank:gen}, с которого запущена камера',
  'keys.derived.holds':
    '{key} (ключ хранения), выведен из {bank:gen}, с которого запущена камера; в этом слоте {holds}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, выведен из слота, с которого запущена камера',
  'keys.derived.holdsUnnamed':
    '{key} (ключ хранения), выведен из слота, с которого запущена камера; в этом слоте {holds}',
  'keys.ffVendor.staged':
    'образ 1.3.0.8 FF (16 Hz) в том виде, в каком его передаёт фирменное приложение: образ XOR его собственный блок ключей 0 (ключ A), окно заголовка как есть, в любой слот; ключи этой камеры не используются',
  'keys.ffVendor.stored':
    'ключ B: камера перешифровывает загрузку блоком ключей 1 и хранит образ под ним',
  'keys.imageBlock0.staged':
    'образ под его собственным блоком ключей 0 (найден в образе по значению), в любой слот; ключи этой камеры не используются',
  'keys.imageBlock0.storedUnnamed':
    'ключ, под которым загрузчик проверяет слот (в этом считывании не назван); камера перешифровывает загрузку под ним',
  'keys.imageBlock0.stored':
    '{key} — ключ, под которым загрузчик проверяет слот; камера перешифровывает загрузку под ним',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED (не проверено): загрузчик сборки FF 16 Hz ни разу не был считан с камеры, поэтому неизвестно, запустится ли записанный слот. На загрузчике 0.9.0.0 более ранняя форма этого образа запускалась со слота восстановления R; эта форма не запустится, потому что этот загрузчик запускает слот восстановления R в том виде, в каком он хранится, не декодируя его.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'Образ FF 16 Hz отправляется в форме, которую читает только сборка 16 Hz {version}. Эта камера записывает слот, не проверяя образ (так сказано в исходном коде её прошивки, и так поступил Compact 1.3.0.0 при проверке), поэтому ожидается, что она запишет байты в том виде, в каком они отправлены: тогда в слоте окажется образ в форме, которую эта камера запустить не может.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Здесь ничто не утверждает, что камера его запустит.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast':
    'Собственные ответы камеры говорят, что на ней работает сборка FF 16 Hz: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'проверяет данные перед стиранием слота, и эти данные проверку проходят, поэтому она может записать эти байты как есть, в форме, которую её загрузчик запустить не может: слот может не запуститься (не проверялось; резервная копия, сохранённая перед записью, вернёт его)',
  'write.ff.outcome.refuses':
    'проверяет данные перед стиранием слота, и эти данные проверку не проходят, поэтому ожидается, что она отклонит эту запись, ничего не записав (камера с этой сборкой так же отклонила более раннюю форму этого образа)',
  'write.ff.runsSlow': 'На камере работает сборка 8 Hz {version}: {why}. Эта сборка {outcome}.',
  'write.ff.buildUnknown':
    'Собственные ответы камеры не говорят, какая сборка {version} на ней работает: {why}. Если это сборка FF 16 Hz, она примет эти данные. Если это сборка 8 Hz, эта сборка {outcome}.',
  'write.raw.asGiven':
    'Сырые данные: отправляются ровно в том виде, в каком даны. Здесь ничто не проверяет, что они запустятся.',
  'write.raw.ffStagedForm':
    'Эти данные — форма передачи 1.3.0.8 FF (образ XOR блок ключей 0, сумма слов 0xFFFF). Камера хранит образ под ключом B, поэтому контрольное считывание сверяется с этими байтами.',
  'write.raw.noStaging':
    'Эта сборка не называет форму передачи для слота, поэтому о проверках загрузчика ничего сказать нельзя.',
  'write.raw.reencrypts':
    'Устройство декодирует эти данные и перешифровывает то, что хранит, поэтому хранимые байты не предсказываются. Контрольное считывание сверяется как образ, в который оно расшифровывается, там, где это можно определить.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'Загрузчик отклонил бы эти данные: {failure}.',
  'write.raw.stageKeyUnchecked':
    'Ключа передачи 2016 года (блок ключей 0) в сырых байтах нет, поэтому сумма слов этих данных после расшифровки здесь не проверяется.',
  'write.image.rekeyRisk':
    'В {name:loc} уже есть образ, который загрузчик не может принять. После этой записи будет то же самое.',
  'write.ack.recovery':
    'Слот восстановления R: для записи нужно подтвердить, что вы понимаете риск. Здесь ничто не проверяет, что камера после этого запустится.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: для записи нужно подтвердить, что вы понимаете риск, а после следующего выключения и включения питания камера запустит то, что в нём окажется.',
  'write.ack.bootUnnamed':
    'слот, с которого запущена камера, назвать не удалось, поэтому этот слот считается слотом, с которого она запущена',
  'write.ack.recoveryFallback':
    'Слот восстановления R — последняя резервная копия, к которой обращается загрузчик',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'пусто/0: сначала слот A, затем B, затем слот восстановления',
  'boot.cfg0.modernB': 'сначала слот B, затем A, затем слот восстановления',
  'boot.cfg0.modernRecovery': 'сначала слот восстановления, затем A, затем B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'неизвестно — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  /** `{verdict}` is one of upgrade.verdict.*. */
  'upgrade.whileRecovery':
    'Камера работает со своего слота восстановления, а её собственное обновление пишет в {name}, с которого она не работает. {verdict} Это только предупреждение: здесь ничто не мешает обновлению.',
  'upgrade.verdict.notRead':
    '{name} не удалось считать при этой проверке, поэтому неизвестно, что в нём.',
  'upgrade.verdict.blank': '{name} пуст, поэтому обновление пишет в пустой слот.',
  'upgrade.verdict.bootableSame':
    '{name} содержит тот же запускаемый образ, что и слот, с которого камера работает, и обновление его заменит. {name} останется незапускаемым, если обновление прервётся.',
  'upgrade.verdict.bootable':
    '{name} содержит запускаемый образ, который обновление заменит. {name} останется незапускаемым, если обновление прервётся.',
  'upgrade.verdict.unknown':
    'По этому считыванию неизвестно, запускается ли {name}, поэтому обновление может заменить образ, который камера запустила бы.',
  'upgrade.verdict.notBootable':
    'По этому считыванию {name} не значится запускаемым, поэтому обновление не заменит образа, который камера запустила бы.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — слот, в который загрузчик вошёл при этом запуске, по его собственной записи',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'не считано',
  'report.lastStart.noBank': 'камера сообщает {word}, а это значение не называет ни одного слота',
  'report.lastStart.entered':
    'камера сообщает, что вошла в {bank:acc} (слово активного слота {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'нет версии',
  'running.why.otherVersion': 'камера сообщает {version}, а две сборки есть только у {only}',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'камера не ответила на вопрос о слотах (селекторы GetFirmwareInfo 6, 7, 8)',
  'running.why.notRead':
    'слот, от которого зависят ответы, не был считан, поэтому ответы нельзя предсказать',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'камера отвечает {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers}, и именно так отвечает для этих слотов сборка 8 Hz 1.3.0.8 ({predicted})',
  'running.why.ff':
    '{answers}, и именно так отвечает для этих слотов сборка FF 16 Hz 1.3.0.8 ({predicted})',
  'running.why.both':
    '{answers}, и обе сборки отвечают для этих слотов именно так, поэтому по слотам их не различить',
  'running.why.neither':
    '{answers}, что не совпадает ни с одной сборкой (8 Hz: {plain}; FF 16 Hz: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'В заголовке этого образа не указана версия прошивки, поэтому нельзя сказать, та ли это сборка, что работает на камере ({camera}). Проверьте, что это тот образ, который вы хотите записать.',
  'imageBuild.otherVersion': 'Этот образ — прошивка {image}; на камере работает {camera}.',
  'imageBuild.otherVersionTaken':
    'Этот образ — прошивка {image}; на камере работает {camera}. На этой линейке камера проверяет только, что образ правильно сформирован (его заголовок и сумму слов), но не его версию, поэтому она примет этот образ и, запустившись с этого слота, будет работать на {image}.',
  'imageBuild.otherVersionUnchecked':
    'Этот образ — прошивка {image}; на камере работает {camera}. Принимает ли эта камера другую сборку и запускает ли её, не проверялось.',
  'imageBuild.otherBuild':
    'Этот образ — сборка 8 Hz {version}; на камере работает сборка 16 Hz {version} FF. Сборка 16 Hz при подтверждении записи сверяет данные со своей формой FF и отклоняет не прошедшие проверку ещё до стирания слота (по её исходному коду). Запись сборки 8 Hz на такую камеру не проверялась.',
  'imageBuild.runningUnknown':
    'Этот образ — сборка 8 Hz {version}. На камере работает {version}, у которой есть сборка 8 Hz и сборка FF 16 Hz, а собственные ответы камеры не сказали, какая из них работает, поэтому нельзя сказать, её ли это сборка.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort':
    'размер данных {size} Б — слишком мало, чтобы вместить заголовок по адресу 0x200',
  'bootFail.noMagic':
    'нет сигнатуры образа по адресу 0x200 (найдено {found}, загрузчику нужно {needs})',
  'bootFail.lengthOutside': 'header.length {length} выходит за пределы данных размером {size} Б',
  'bootFail.lengthNotPayload': 'header.length {length} не равно длине данных {size}',
  'bootFail.overStage': '{size} Б больше предела передачи {max} Б',
  'bootFail.plainSum': 'хранимая сумма слов {sum}, а загрузчику 2014 года нужно 0',
  'bootFail.noFooter': 'нет концевого блока по адресу {offset}: данные заканчиваются на {end}',
  'bootFail.footerNotCode':
    'концевой блок по адресу {offset} — не "CODE", и загрузчик примет его за свой сегментированный загрузчик',
  'bootFail.footerLength': 'длина концевого блока не равна header.length {length}',
  'bootFail.keyASum':
    'после расшифровки ключом A этой камеры сумма слов равна {sum}, а загрузчику нужно {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'проверен контрольной суммой',
  'keyConfidence.structural': 'проверен только по таблице векторов',
  'keyConfidence.unverified': 'не проверен',
  /** `{sum}` is hex. */
  'keyCheck.family': 'ключ проверен контрольной суммой {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'ключ {phrase}; контрольная сумма {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'передан под собственными ключами камеры',
  'staging.phrase.slotKeystreamCiphertext': 'передан под собственным ключом образа',
  'staging.phrase.plain': 'передан незашифрованным',
  'staging.phrase.keyAKeystream':
    'передан так же, как фирменное приложение передаёт образ FF (XOR ключ A)',
  'staging.phrase.verbatim': 'отправлен как есть',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank (label form); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    'записано и подтверждено {size} Б в {name:acc} по адресу {address}, {staged}; статус подтверждения записи {status}',
  'written.noReadWindow':
    'эта сборка не называет окно чтения для слота, поэтому контрольного считывания не было',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'контрольное считывание не удалось: {error}',
  'written.readBack': 'контрольно считано {size} Б, SHA-256 {sha256}',
  'written.verifyOff': 'сверка отключена: контрольного считывания слота не было',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'байтами, которые, по плану, должны оказаться в слоте (образ в том виде, в каком его хранит сборка 16 Hz, а не отправленные байты)',
  'readBack.reference.asSent':
    'байтами, которые, по плану, должны оказаться в слоте (байты в том виде, в каком они отправлены)',
  'readBack.sizeDiffers':
    'контрольное считывание дало {size} Б, а план предсказывал {predictedSize} Б: слот НЕ совпадает с {reference}',
  'readBack.matchesFolded':
    'в слоте образ в том виде, в каком его хранит сборка 16 Hz (а не отправленные байты), а остальная часть слота стёрта',
  'readBack.matches':
    'слот совпадает с байтами, предсказанными планом (незашифрованная цепочка 2014 года программирует ровно то, что ей отправлено)',
  'readBack.differs': 'слот НЕ совпадает с {reference} (первое отличие по адресу {offset})',
  'readBack.noHeader':
    'в контрольном считывании нет заголовка образа по адресу {offset} (сигнатура {magic}), поэтому слот НЕ расшифровывается в ожидаемый образ',
  'readBack.lengthDiffers':
    'по заголовку контрольного считывания длина {length} Б, а образ плана — {imageLength} Б: слот НЕ расшифровывается в ожидаемый образ',
  'readBack.tooShort':
    'контрольное считывание — {size} Б, слишком мало для образа размером {length} Б: слот НЕ расшифровывается в ожидаемый образ',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'ключевым потоком, восстановленным из контрольного считывания ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': 'слот расшифровывается в ожидаемый образ ({length} Б) {recovered}',
  'readBack.decryptDiffers':
    'слот НЕ расшифровывается в ожидаемый образ: первое отличие по смещению {offset} в образе при расшифровке {recovered}',
  'readBack.rawNotCompared':
    'сырые байты: результат контрольного считывания показан, но не сравнивался (в этой форме байты не расшифровываются в предсказуемый незашифрованный образ, а устройство перешифровывает то, что хранит)',
  'readBack.notCompared':
    'сравнение невозможно: план не предсказывает ни хранимые байты, ни незашифрованный образ',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'ключ A',
  'keyName.keyA:gen': 'ключа A',
  'keyName.keyA:dat': 'ключу A',
  'keyName.keyA:acc': 'ключ A',
  'keyName.keyA:ins': 'ключом A',
  'keyName.keyA:loc': 'ключе A',
  'keyName.keyB': 'ключ B',
  'keyName.keyB:gen': 'ключа B',
  'keyName.keyB:dat': 'ключу B',
  'keyName.keyB:acc': 'ключ B',
  'keyName.keyB:ins': 'ключом B',
  'keyName.keyB:loc': 'ключе B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'ключ устройства',
  'keyName.perDevice:gen': 'ключа устройства',
  'keyName.perDevice:dat': 'ключу устройства',
  'keyName.perDevice:acc': 'ключ устройства',
  'keyName.perDevice:ins': 'ключом устройства',
  'keyName.perDevice:loc': 'ключе устройства',
  'keyName.thePerDevice': 'ключ устройства',
  'keyName.thePerDevice:gen': 'ключа устройства',
  'keyName.thePerDevice:dat': 'ключу устройства',
  'keyName.thePerDevice:acc': 'ключ устройства',
  'keyName.thePerDevice:ins': 'ключом устройства',
  'keyName.thePerDevice:loc': 'ключе устройства',
  'keyName.applicationKeyA': 'ключ A приложения',
  'keyName.applicationKeyA:gen': 'ключа A приложения',
  'keyName.applicationKeyA:dat': 'ключу A приложения',
  'keyName.applicationKeyA:acc': 'ключ A приложения',
  'keyName.applicationKeyA:ins': 'ключом A приложения',
  'keyName.applicationKeyA:loc': 'ключе A приложения',
  'keyName.applicationKeyB': 'ключ B приложения',
  'keyName.applicationKeyB:gen': 'ключа B приложения',
  'keyName.applicationKeyB:dat': 'ключу B приложения',
  'keyName.applicationKeyB:acc': 'ключ B приложения',
  'keyName.applicationKeyB:ins': 'ключом B приложения',
  'keyName.applicationKeyB:loc': 'ключе B приложения',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'блок ключей 1',
  'keyName.block1:gen': 'блока ключей 1',
  'keyName.block1:dat': 'блоку ключей 1',
  'keyName.block1:acc': 'блок ключей 1',
  'keyName.block1:ins': 'блоком ключей 1',
  'keyName.block1:loc': 'блоке ключей 1',
  'keyName.theDeviceKey': 'ключ устройства',
  'keyName.theDeviceKey:gen': 'ключа устройства',
  'keyName.theDeviceKey:dat': 'ключу устройства',
  'keyName.theDeviceKey:acc': 'ключ устройства',
  'keyName.theDeviceKey:ins': 'ключом устройства',
  'keyName.theDeviceKey:loc': 'ключе устройства',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'неизвестный ключ',
  'keyName.unknown:gen': 'неизвестного ключа',
  'keyName.unknown:dat': 'неизвестному ключу',
  'keyName.unknown:acc': 'неизвестный ключ',
  'keyName.unknown:ins': 'неизвестным ключом',
  'keyName.unknown:loc': 'неизвестном ключе',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'незашифрованная цепочка 2014 года: каждый слот хранится открыто, поэтому ключ загрузки не выводится; загрузка — это образ как есть',
  'keys.evidence.ffVendor':
    'сборка 1.3.0.8 FF (16 Hz): ни один слот, открытый этим считыванием, не хранится открыто, поэтому не видно, что камера на незашифрованной цепочке 2014 года; образ FF записывается в фирменной форме, сырые байты отправляются как есть, а незашифрованный образ 8 Hz не записывается',
  'keys.evidence.ffUntested':
    'запись образа FF предлагается с предупреждением UNTESTED (не проверено): настоящего загрузчика этой сборки среди собранных образов нет, поэтому запустится ли записанный слот, не измерялось',
  'keys.evidence.line2016':
    'линейка Compact PRO 2016 года: загрузка — это образ XOR ключевой поток его собственного блока ключей 0, найденного в образе по значению, поэтому ни один ключ этой камеры для неё не нужен',
  'keys.evidence.checkKeyUnnamed':
    'камера расшифровывает загрузку этим ключом и перешифровывает её под ключом, которым загрузчик проверяет слоты; в этом считывании этот ключ не назван, и для записи он не нужен: при контрольном считывании слот проверяется как образ, в который он расшифровывается',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'камера расшифровывает загрузку этим ключом и перешифровывает её под ключом, которым загрузчик проверяет слоты; в этом считывании этот ключ не назван ({why}), и для записи он не нужен: при контрольном считывании слот проверяется как образ, в который он расшифровывается',
  'keys.evidence.checkKeyNamed':
    'камера расшифровывает загрузку этим ключом и перешифровывает её под {key:ins} {hex} — ключом, которым загрузчик проверяет слоты, поэтому каждый записанный ею слот хранится так, как его принимает загрузчик',
  'keys.evidence.checkKeyInferred':
    'камера расшифровывает загрузку этим ключом и перешифровывает её под {key:ins} {hex} — ключом, которым загрузчик проверяет слоты (выведен из {bank:gen} — слота, в который, по словам камеры, она вошла и в который загрузчик вошёл без проверки), поэтому каждый записанный ею слот хранится так, как его принимает загрузчик',
  'keys.evidence.checkKeyNamedFrom':
    'камера расшифровывает загрузку этим ключом и перешифровывает её под {key:ins} {hex} — ключом, которым загрузчик проверяет слоты (назван по {bank:dat} — слоту, в который, по словам камеры, она вошла), поэтому каждый записанный ею слот хранится так, как его принимает загрузчик',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'слот, с которого запущена камера, назвать не удалось, поэтому ключ, под которым хранится слот, из него не прочитать',
  'keys.refused.notDerived': 'ключи не удалось вывести',
  'keys.refused.notDecrypted':
    '{bank}, с которого запущена камера, не расшифровывается в образ, поэтому ключ, под которым он хранится, не прочитать',
  'keys.refused.noBootKey':
    '{bank}, с которого запущена камера, не расшифровывается ни одним ключом, который пробует загрузчик (его ключом A или ключом хранения), поэтому ключ, под которым хранится слот, из него не прочитать',
  'keys.refused.keyNotInTable':
    '{bank}, с которого запущена камера, расшифровывается {key:ins}, но в таблице ключей этой камеры такого ключа нет, поэтому записать под ним нельзя',
  'keys.refused.noApplicationPair':
    'работающее приложение ({bank}, прошивка {firmware}) не содержит ни одной из известных пар ключей (пары загрузчика и декодированные пары приложений) так, чтобы каждая половина встречалась ровно один раз, поэтому его ключ A в образе не найти',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'работающее приложение ({bank}, прошивка {firmware}) не содержит ни одной из известных пар ключей (пары загрузчика и декодированные пары приложений) так, чтобы каждая половина встречалась ровно один раз, поэтому его ключ A в образе не найти (ключ A загрузчика встречается {count} раз, его ключ B — {keyB})',
    few: 'работающее приложение ({bank}, прошивка {firmware}) не содержит ни одной из известных пар ключей (пары загрузчика и декодированные пары приложений) так, чтобы каждая половина встречалась ровно один раз, поэтому его ключ A в образе не найти (ключ A загрузчика встречается {count} раза, его ключ B — {keyB})',
    many: 'работающее приложение ({bank}, прошивка {firmware}) не содержит ни одной из известных пар ключей (пары загрузчика и декодированные пары приложений) так, чтобы каждая половина встречалась ровно один раз, поэтому его ключ A в образе не найти (ключ A загрузчика встречается {count} раз, его ключ B — {keyB})',
    other:
      'работающее приложение ({bank}, прошивка {firmware}) не содержит ни одной из известных пар ключей (пары загрузчика и декодированные пары приложений) так, чтобы каждая половина встречалась ровно один раз, поэтому его ключ A в образе не найти (ключ A загрузчика встречается {count} раза, его ключ B — {keyB})',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'работающее приложение ({bank}, прошивка {firmware}) проверяет загрузку своими ключами, прежде чем её программировать (декодированный исходный код этой сборки пробует загрузку под своим ключом A и своим ключом хранения, как её загрузчик пробует слот), а ключ, под которым хранят записи, {key} ({hex}), — не её ключ A и не её ключ хранения, поэтому камера отклонила бы загрузку с 0x50000, ещё ничего не стерев',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'ни один слот не расшифровывается в контрольную сумму {sum} семейства {family}',
  'writeRefusal.keyTable': 'таблицу ключей этой камеры не удалось подтвердить',
  'writeRefusal.whitening':
    'таблица ключей этой камеры разрешается при K={k}, а {family} шифрует при K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily':
    'по имеющимся данным эта камера — {detected}, а не {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'в эту камеру нельзя записывать отсюда: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Сборки Seek 2018 года и новее (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 и Nano 300. Дамп считывает 63 из 64 блоков флеш-памяти, ничего не разблокируя; ни одно чтение на этих сборках не достаёт блок по адресу {block}. Прошивка хранится зашифрованной. Слоты записываются по одному на вкладке «Слоты прошивки».',
  'family.summary.early':
    'Compact 2014 года старше 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 и 0.7.0.8. Их прошивка не может ответить на чтение, которое отправляет дамп, поэтому «Дамп», «Дамп всех селекторов», полное считывание вкладки «Сведения» и вкладка «Слоты прошивки» отказывают им, прочитав версию; на 0.3.0.1 команда, с которой начинается дамп, вместо этого подготовила бы обновление прошивки. Прогон Preserve считывает 0.7.0.7 и 0.7.0.8 через другую команду, на которую отвечают эти две сборки. Дамп, снятый другим способом, расшифровывается как обычно.',
  'family.summary.compact2016':
    'Сборки Compact PRO 1.0.3.x (1.0.3.0 и 1.0.3.2). На чтение они отвечают точно так же, как Compact 2014 года, включая токен разблокировки, поэтому их различают по версии и по тому, как хранятся их слоты: зашифрованными, тогда как слоты 2014 года хранятся открыто. Камера 1.0.3.x с самого начала считывается как это семейство. Прогон Preserve считывает всю флеш-память, а слоты записываются по одному на вкладке «Слоты прошивки».',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    'Compact 2014 года от 0.8.0.0 до 1.3.0.8, в том числе сборка 1.3.0.8 FF 16 Hz. Заводская камера отдаёт меньше половины своей флеш-памяти, причём часть — только по токену разблокировки, который отправляет программа; остальное прогон Preserve считывает через временный патч. Слоты хранятся открыто, кроме сборки FF. Камера Compact PRO 1.0.3.x считывается как compact-2016 и переходит сюда, только если какой-либо её слот хранится открыто или расшифровывается в {sum}, как слоты сборки FF. На вкладке «Слоты прошивки» слоты записываются на тех сборках, на которых измерялся прогон Preserve; любая другая сборка 0.x или 1.x только считывается.',
  'family.summary.generic':
    'Камера, которой не подходит ни одно другое семейство. `seek-fw dump` считывает её по списку блоков 4.x (вкладка 4.x/Nano ей отказывает), а расшифровка вычисляет ключ из самого образа, так что ни то, ни другое от догадки не зависит. Ни один слот не записывается: вкладка «Слоты прошивки» отказывает, пока камера не опознана.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'заголовок образа сообщает',
  'detect.source.camera': 'камера сообщает',
  'detect.plainArmedNotInForce':
    'простой 2-байтовый BeginFirmwareUpgrade активировал защищённый слот, значит, аутентифицированный канал чтения не действует',
  'detect.modern.plainRefused':
    'простой 2-байтовый BeginFirmwareUpgrade для защищённого слота был ОТКЛОНЁН, чего не делает ни одна сборка этой линейки: её обработчик не проверяет токен и принимает простой канал на любом слоте',
  'detect.modern.authArmed':
    'защищённый слот активирован 18-байтовым аутентифицированным селектором; простой там не пробовали, так что это не выводит камеру за пределы этой линейки',
  'detect.modern.legacyVersion':
    '{said}: прошивка {version}, это устаревшая линейка 0.x / 1.x (другая нумерация, а не более старая 4.x, — и одна из тех сборок тоже даёт сумму {sum})',
  'detect.modern.noSum':
    'ни один слот не расшифровывается в контрольную сумму {sum}, которую требует загрузчик этого семейства',
  'detect.modern.sum': 'слот расшифровывается в контрольную сумму {sum}',
  'detect.modern.version':
    'прошивка {version} относится к линейке после 2018 года, которую охватывает эта карта селекторов (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'простой 2-байтовый BeginFirmwareUpgrade активировал защищённый слот, значит, это не закрытая устаревшая прошивка',
  'detect.modern.none': 'нет данных, относящих эту камеру к линейке после 2018 года',
  'detect.early.noVersion': 'версия прошивки не сообщена и не найдена в заголовке образа',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'прошивка {version} — {first} или новее, поэтому в её таблице RPC есть геттер для GetFeaturedFirmwareData и действует обычный путь чтения',
  'detect.early.older':
    '{said}: прошивка {version}, она старше {first} — первой сборки, в таблице методов RPC которой есть обработчик чтения (геттер) для GetFeaturedFirmwareData',
  'detect.early.noWindow': 'и ни одно окно не удалось считать, что это и предсказывает',
  'detect.generic.fallback':
    'запасной вариант: ни одно семейство прошивок не подошло уверенно, поэтому чтение остаётся доступным, а запись — нет',
  'detect.compact2016.early':
    'прошивка {version} старше 0.8.0.0, и в ней нет обработчика чтения для GetFeaturedFirmwareData — это early-compact, а не это семейство',
  'detect.compact2016.modernSum':
    'слот расшифровывается в контрольную сумму {sum}, а это не цель этого поколения',
  'detect.compact2016.plainArmed':
    'простой 2-байтовый BeginFirmwareUpgrade активировал защищённый слот, значит, эта камера не на закрытой линейке, общей для этого семейства и legacy-auth',
  'detect.compact2016.notLine': 'прошивка {version} не относится к линейке 0.x / 1.x',
  'detect.compact2016.storedPlain':
    'слот хранится открыто — вычисление ключевого потока возвращает тождественное состояние, так что хранимые слова И ЕСТЬ образ, — а это незашифрованная цепочка 2014 года; слоты этого поколения зашифрованы xorshift128 под настоящим ключом',
  'detect.compact2016.keyedZero':
    'слот, хранимый под настоящим ключевым потоком xorshift128, расшифровывается в контрольную сумму {sum}, а это шифр этого поколения',
  'detect.compact2016.zeroSum':
    'слот расшифровывается в контрольную сумму {sum}, а это цель этого поколения',
  'detect.compact2016.refused':
    'и защищённый слот отклонил простую 2-байтовую активацию, как это делает закрытый обработчик',
  'detect.compact2016.proLine': '{said}: прошивка {version}, линейка 1.0.3.x Compact PRO 2016 года',
  'detect.compact2016.compactLine':
    '{said}: прошивка {version}, сборка Compact, а не линейка 1.0.3.x Compact PRO',
  'detect.compact2016.lockedLine':
    '{said}: прошивка {version}, на линейке 0.x / 1.x, общей для этого поколения и закрытой устаревшей прошивки',
  'detect.compact2016.bootloader2016':
    'загрузчик сообщает {version} — загрузчик поколения 2016 года (1.2.0.0 измерен на Compact PRO 1.0.3.0; у Compact 2014 года — 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'загрузчик сообщает {version} — это нумерация поколения 2014 года, а не этого поколения',
  'detect.compact2016.none':
    'не замечено, чтобы какой-либо слот расшифровывался в нулевую контрольную сумму под настоящим ключом',
  'detect.legacy.proLine':
    'но прошивка {version} — линейка 1.0.3.x Compact PRO 2016 года, слоты которой зашифрованы шифром compact-2016: проверка контрольной суммы этого семейства отвергла бы каждый из них',
  'detect.legacy.early':
    'прошивка {version} старше 0.8.0.0: в её таблице RPC нет обработчика чтения для GetFeaturedFirmwareData (до 0.7.0.7 его нет вовсе, а на 0.7.0.7 и 0.7.0.8 есть только сеттер) — это early-compact, а не это семейство',
  'detect.legacy.keyedZero':
    'слот, хранимый под настоящим ключевым потоком xorshift128, расшифровывается в {zero} — это шифр Compact PRO 2016 года (compact-2016). Эта линейка хранит слоты открыто с суммой слов 0 (цепочка 2014 года) или под ключом с суммой {sum} (Compact 1.3.0.8), и её проверка контрольной суммы такой слот отвергает',
  'detect.legacy.plainChain':
    'слот хранится как незашифрованная прошивка с суммой слов 0 — в таком виде его запускает загрузчик 2014 года этой линейки',
  'detect.legacy.refused':
    'камера отказалась открыть закрытый слот для обновления, когда её попросили без разблокировки, — так делает только это поколение прошивки',
  'detect.legacy.unlocked':
    'и открыла тот же слот, когда её попросили с разблокировкой, значит, разблокировка, которую отправляет это семейство, — та, которую проверяет эта камера',
  'detect.legacy.notLine':
    '{said}: прошивка {version}, которая не относится к устаревшей линейке 0.x / 1.x',
  'detect.legacy.authOnly':
    'она открыла закрытый слот для обновления, когда её попросили с разблокировкой, как делает это поколение прошивки; без разблокировки не пробовали, так что само по себе это поколение не доказывает',
  'detect.legacy.version':
    'прошивка {version} относится к устаревшей линейке 0.x / 1.x — это другая нумерация, чем у версий приложений после 2018 года, а не более старая 4.x',
  'detect.legacy.none': 'ничто из замеченного не указывает на аутентифицированный канал чтения',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'отозван после прогона на камере: там патч не поднял частоту выдачи кадров, а затвор после записи срабатывал на каждом кадре',
  'fps.table.predates':
    'прошивка {version} старше 0.8.0.0: в её таблице RPC нет обработчика чтения для GetFeaturedFirmwareData — команды, которую отправляет чтение слота, — поэтому слоты этой сборки не считываются и не записываются, и патч не предлагается',
  'fps.table.stageTwoFf':
    'stage two: сборка FF 16 Hz передаётся так, как её передаёт фирменное приложение (образ XOR ключ A, хранится под ключом B), а не в виде незашифрованных байтов, поэтому проверка её передачи не выполнена и патч пока не предлагается',
  'fps.table.stageTwo':
    'stage two: этой записи нет в наборе stage two, поэтому проверка её передачи не выполнена и патч пока не предлагается',
  'fps.table.notOffered': 'не предлагается',
  'fps.table.notImage': 'это не образ прошивки, поэтому патч частоты кадров к нему не применим',
  'fps.table.otherBuild':
    'образ — сборка {image}, а камера сообщает {camera}; патч отклонён, а не применён к сборке, которой он не соответствует',
  'fps.table.otherBuildNoVersion':
    'образ — сборка {image}, а камера не сообщает версию; патч отклонён, а не применён к сборке, которой он не соответствует',
  'fps.table.patched': 'патч частоты кадров уже применён: этот образ работает на {hz} Hz',
  'fps.table.earlierPatch':
    'в этом образе более ранний патч частоты кадров на {hz} Hz без исправления USB, а к пропатченному образу патч никогда не применяется: восстановите заводской образ, затем пропатчите его',
  'fps.table.atRate': 'эта сборка уже работает на {hz} Hz без патча',
  'fps.table.not4821':
    'этот образ сообщает сборку Compact 4.8.2.1 (или Compact XR 4.8.2.1, это та же сборка), но это не тот заводской образ, для которого написан патч частоты кадров (f96ac57eda75: его командные страницы по 68 байт, стабильная страница 13), поэтому патч частоты кадров для него не делается',
  'fps.table.notInTable':
    'этого образа нет в таблице патчей частоты кадров, поэтому для этой сборки патч не делается. В таблице есть сборки Compact от 0.7.0.8 до 1.3.0.8 (8 Hz; 0.7.0.8 отклоняет код слотов), 1.3.0.8 (FF 16 Hz), 4.8.1.7, 4.8.1.9, 4.8.2.1 и 4.16.1.7 FF и сборки Compact PRO 1.0.3.x и 4.9.x; у других сборок записей нет',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'в плане этой сборки нет {bank:gen}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank} не может принять расшифрованный образ на этой сборке: {reason}',
  'fps.plan.empty': 'в {bank:loc} нет расшифрованного образа для патча (слот пуст)',
  'fps.plan.noImage':
    'в {bank:loc} нет расшифрованного образа для патча (слот не считан или ни один ключ его не открывает)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name} записан, но его контрольное считывание отличается от сохранённого слота не только так, как планировалось, поэтому следующие за ним слоты не записаны',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build (slots/capability-notes) ----
   * The page shows only this one; it leaves the others out (lib/page-hidden.ts), and the CLI prints them
   * in English. */
  'notes.unverified':
    'Только чтение. Раскладка слотов — декодированная таблица закрытой линейки, но ни одна форма передачи для этой сборки не измерена, поэтому запись не планируется.',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'камера не сообщила версию прошивки ({note}); номер команды значит не одно и то же на всех прошивках Seek — на Compact 0.3.0.1 wire id 0x52, который активирует окно чтения, означает EnterBootloaderMode, — поэтому, пока версия не известна, не отправляется ничего, кроме GetErrorCode, GetOperationMode и GetFirmwareInfo — чтений, на которые все сборки отвечают одинаково',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo не ответила ({error}) ни на одно из {reads} чтений с интервалом {spacing} мс в окне запуска {window} мс; камера, которая ещё запускается, отвечает в его пределах',
  'identity.note.neverTwice': 'GetFirmwareInfo ни разу не ответила дважды подряд за {reads} чтений',
  'identity.note.noAnswer': 'GetFirmwareInfo не ответила ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo не ответила ({error}); ответили {answered} из {reads} чтений, но ни разу два подряд, поэтому ни один ответ нельзя отличить от записи, на которой селектор оставила предыдущая команда',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo вернула {count} байт — слишком мало для версии',
    few: 'GetFirmwareInfo вернула {count} байта — слишком мало для версии',
    many: 'GetFirmwareInfo вернула {count} байт — слишком мало для версии',
    other: 'GetFirmwareInfo вернула {count} байта — слишком мало для версии',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo вернула {count} байт — слишком мало для версии; {context}',
    few: 'GetFirmwareInfo вернула {count} байта — слишком мало для версии; {context}',
    many: 'GetFirmwareInfo вернула {count} байт — слишком мало для версии; {context}',
    other: 'GetFirmwareInfo вернула {count} байта — слишком мало для версии; {context}',
  },
  'identity.note.otherRecord':
    'первое чтение вернуло другую запись ({version}), на которой предыдущая команда оставила селектор сведений о прошивке, — это чтение его сбросило',
  'identity.note.afterStartup': {
    one: 'она ответила, отклонив во время запуска {count} чтение',
    few: 'она ответила, отклонив во время запуска {count} чтения',
    many: 'она ответила, отклонив во время запуска {count} чтений',
    other: 'она ответила, отклонив во время запуска {count} чтения',
  },
  'identity.predates':
    'прошивка {version} старше протокола дампа: в её таблице методов RPC нет обработчика чтения для GetFeaturedFirmwareData (на 0.7.0.7 и 0.7.0.8 он зарегистрирован только как сеттер, а до них wire id 0x4F — это UploadFirmwareRowSize), поэтому ни одно окно им не считать; на 0.3.0.1 wire id 0x52 — это EnterBootloaderMode, а не BeginFirmwareUpgrade. Прогон Preserve вместо этого считывает 0.7.0.7 и 0.7.0.8 через wire id 0x58 (GetFeaturedData)',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'отказ в операции «{operation}»: {reason}',
  'identity.refusingNoVersion':
    'отказ в операции «{operation}»: {reason}. Ничего не активировано. Отключите камеру, подключите её снова, дождитесь окончания запуска и попробуйте ещё раз.',
  'identity.operation.dump': 'дамп',
  'identity.operation.dumpAll': 'дамп всех селекторов',
  'identity.operation.readInfo': 'чтение сведений об устройстве',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'слоты выбираются после резервного копирования, которое их считывает, — сначала выполните резервное копирование',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'слоты нельзя изменить после того, как запись выполнена или была попытка её выполнить: этот прогон записывает {banks}, и восстановление вернёт на место именно их',
  'preserve.banks.none': 'ни одного слота',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Записано.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Считано. Доступно для чтения слотов: {count}/{of}.',
  'status.readRefused':
    'Считано, но ни один слот этой камеры нельзя записать отсюда — смотрите журнал.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Версия прошивки',
  'compare.field.imageId': 'ID образа',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'Начальный SP',
  'compare.field.resetVector': 'Вектор сброса',
  'compare.field.size': 'Размер',
  'compare.field.shaExpected': 'SHA-256 ожидаемого незашифрованного образа',
  'compare.field.sha': 'SHA-256 образа',
  'compare.field.shaNotStored':
    'SHA-256 ожидаемого незашифрованного образа (хранимые байты не предсказываются)',
  'compare.field.key': 'Ключ',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(нет образа)',
  'compare.notImage': '(не образ)',
  'compare.notPredicted': '(не предсказывается: что хранить, решает устройство)',
  'compare.plaintext': 'нет (не зашифрован)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'не удалось дважды считать одинаково',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (ключ, которым загрузчик проверяет слоты, выведен из {bank:gen}, в который загрузчик вошёл без проверки) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered': '{bank}, по записи камеры (слово активного слота {word})',
  'preserve.lastStart.notRead': 'неизвестно — слово активного слота не удалось считать',
  'preserve.lastStart.noBank':
    'неизвестно — слово активного слота равно {word}, а это не номер слота',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'неизвестно — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'не записывается — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'образ',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — можно записать',
  'preserve.bank.writablePatch': '{build} — можно записать; патч меняет байтов: {count}',
  'preserve.bank.writableEdit': '{build} — можно записать; содержит {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — можно записать; патч меняет байтов: {count}; содержит {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead':
    'резервное копирование ещё не считало слоты, поэтому выбрать слот нельзя',
  'preserve.choice.every': 'каждый слот, в котором есть образ: {banks}',
  'preserve.choice.everyBlocked':
    'записать каждый слот, в котором есть образ, нельзя: {bank} нельзя — {reason}',
  'preserve.choice.noImage': 'ни в одном слоте нет образа, который прогон может записать',
  'preserve.choice.nextStart': '{bank} — слот следующего запуска: {why}',
  'preserve.choice.nextStartRefused':
    'следующий запуск пойдёт со {bank:gen} ({why}), а записать его прогон не может: {reason}',
  'preserve.choice.everyUnknownStart':
    'каждый слот, в котором есть образ ({banks}): с какого слота пойдёт следующий запуск, неизвестно ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'с какого слота пойдёт следующий запуск, неизвестно ({why}), и {reason}; выберите слот по имени',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank} нельзя записать: {reason}',
  'preserve.choice.byName': '{banks} — слот, выбранный по имени',
  'preserve.choice.warnNotPatched':
    'Следующий запуск пойдёт со {bank:gen} ({why}), а этот выбор его не патчит: после перезапуска камера запустит собственный образ этого слота, поэтому полное считывание остановится, ничего не считав. Восстановление всё равно вернёт на место каждый записанный слот.',
  'preserve.choice.warnUnknownStart':
    'С какого слота пойдёт следующий запуск, неизвестно ({why}). Если со слота, который этот выбор не патчит, полное считывание остановится, ничего не считав.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'пока неизвестна',
  'preserve.build.firmware': 'прошивка {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'в том виде, в каком её хранит камера (эта камера хранит прошивку незашифрованной)',
  'preserve.stagedForm.oneKey':
    'в той форме, в какой её хранит камера (зашифрованной ключом камеры)',
  'preserve.stagedForm.twoKeys':
    'в той форме, в какой её хранит камера (зашифрованной двумя ключами камеры)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'каждый записанный слот получает обратно ровно те байты, которые из него считало резервное копирование',
  'preserve.restoreForm.factoryStaged':
    'каждый записанный слот получает обратно свою исходную прошивку, записанную в той форме, в какой её хранит камера, так что в итоге слот побайтно совпадает с тем, что считало резервное копирование',
  'preserve.restoreForm.none':
    'на этой сборке невозможно: ни одна форма исходной прошивки не проходит собственную проверку камеры и при этом не сохраняется обратно в виде исходных байтов, поэтому прогон заканчивается полным образом и оставленным на месте патчем',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'на этой сборке невозможно: пропатченная прошивка не может считать всю флеш-память, поэтому полного образа у прогона не будет',
  'preserve.drain.rotated': 'камера отдаёт её со сдвигом, и прогон восстанавливает порядок',
  'preserve.drain.hazard': 'патч обходит чтение, которое на этой сборке приводит к сбою камеры',
  'preserve.drain.whole': 'вся флеш-память 4 МБ за одно чтение, порциями по {size} Б',
  'preserve.drain.wholeNotes': 'вся флеш-память 4 МБ за одно чтение, порциями по {size} Б; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'позволяет команде чтения камеры достать всю флеш-память 4 МБ, а не только первые 64 КБ',
  'preserve.site.countPast':
    'позволяет позиции чтения уйти дальше 64 КБ, чтобы чтение не возвращалось к началу',
  'preserve.site.keepPosition':
    'сохраняет позицию чтения целиком, когда она сдвигается после каждого чтения',
  'preserve.site.savePosition': 'сохраняет сдвинутую позицию чтения целиком',
  'preserve.site.clearPosition':
    'сбрасывает позицию чтения целиком в начале каждого чтения, чтобы камеру можно было считывать и после полного считывания',
  'preserve.site.modeTwoGuard':
    'позволяет полному считыванию начаться как любому другому чтению (заводская прошивка его не допускает)',
  'preserve.site.modeTwoIndirection':
    'направляет полное считывание на начало флеш-памяти (заводская прошивка направляет его на значение, из-за которого камера падает)',
  'preserve.site.armTail':
    'убирает вызов, который на этой сборке подвешивает камеру в начале чтения',
  'preserve.site.other': 'меняет одну инструкцию, нужную для полного считывания',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Резервная копия',
  'preserve.step.patch': 'Патч',
  'preserve.step.commit': 'Запись',
  'preserve.step.drain': 'Полное считывание',
  'preserve.step.restore': 'Восстановление',
  'preserve.step.verify': 'Сверка',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'шаг «Патч»',
  'preserve.stepId.commit': 'шаг «Запись»',
  'preserve.stepId.drain': 'шаг «Полное считывание»',
  'preserve.stepId.restore': 'шаг «Восстановление»',
  'preserve.stepId.verify': 'шаг «Сверка»',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: остановлено по плану — камера запустилась со {bank:gen}, который этот прогон не патчил, поэтому ничего не считано.',
  'preserve.result.noReason': 'причина не записана',
  'preserve.result.stopped': '{label}: остановлено — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none': 'ни в одном слоте нет прошивки, которую прогон может пропатчить',
  'preserve.result.writable.one': 'в {banks:loc} есть прошивка, которую прогон может пропатчить',
  'preserve.result.writable.many': 'в {banks:loc} есть прошивка, которую прогон может пропатчить',
  'preserve.result.backup':
    '{label}: сохранён каждый блок, до которого достаёт обычное считывание; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'неизвестный слот',
  'preserve.result.backupNext':
    '{label}: сохранён каждый блок, до которого достаёт обычное считывание; {writable}; следующий запуск: {next}.',
  'preserve.result.patch': '{label}: собран для {banks:gen}.',
  'preserve.result.patchNone':
    '{label}: патч не собран: ни в одном слоте нет прошивки, которую прогон может пропатчить.',
  'preserve.result.patchCount':
    '{label}: собран для {banks:gen}; в каждом меняется байтов: {count}.',
  'preserve.result.commitOne': '{label}: в {banks:acc} записан патч, и камера его приняла.',
  'preserve.result.commitMany': '{label}: в {banks:acc} записан патч, и камера приняла каждый.',
  'preserve.result.drainNotRead': '{label}: не считано.',
  'preserve.result.drain':
    '{label}: считана вся флеш-память 4 МБ; sha256 полного образа — {sha256}.',
  'preserve.result.drainThrough':
    '{label}: вся флеш-память 4 МБ считана через {bank:acc}; sha256 полного образа — {sha256}.',
  'preserve.result.restore': '{label}: прошивка в {banks:loc} записана обратно.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}: прошивка в {banks:loc} записана обратно {form}.',
  'preserve.result.verifyDone': '{label}: готово.',
  'preserve.result.verifyIdentical':
    '{label}: блоков считано повторно: {blocks}, различающихся байтов: 0 — флеш-память камеры побайтно совпадает с резервной копией.',
  'preserve.result.verifyDiffers':
    '{label}: блоков считано повторно: {blocks}, различающихся байтов: {bytes}.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: блоков считано повторно: {blocks}, различающихся байтов: {bytes}, не удалось считать {count} блок.',
    few: '{label}: блоков считано повторно: {blocks}, различающихся байтов: {bytes}, не удалось считать {count} блока.',
    many: '{label}: блоков считано повторно: {blocks}, различающихся байтов: {bytes}, не удалось считать {count} блоков.',
    other:
      '{label}: блоков считано повторно: {blocks}, различающихся байтов: {bytes}, не удалось считать блоков: {count}.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Остановлено перед полным считыванием: камера запустилась со слота, который этот прогон не патчил, поэтому ничего не считано.',
  'preserve.unpatchedStart.next':
    'Дальше: восстановление вернёт на место каждый записанный слот. Полное считывание повторно не выполняется: камера запустилась бы с того же слота.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Готово — ваша прошивка сохранена',
  'preserve.done.detail':
    'Полный образ — это вся исходная флеш-память камеры, а сама камера возвращена точно в прежнее состояние.',
  'preserve.done.titleNoImage':
    'Готово — камера возвращена в прежнее состояние; полного образа нет',
  'preserve.done.detailNoImage':
    'Полное считывание не выполнялось, поэтому у этого прогона нет полного образа флеш-памяти. Каждый записанный слот возвращён на место, и новое считывание блоков, доступных обычному дампу, совпадает с резервной копией. Чтобы получить полный образ, начните новый прогон с выбором, который включает слот следующего запуска.',
  'preserve.done.detailNoImageCount':
    'Полное считывание не выполнялось, поэтому у этого прогона нет полного образа флеш-памяти. Каждый записанный слот возвращён на место, и новое считывание блоков, доступных обычному дампу ({blocks}), совпадает с резервной копией. Чтобы получить полный образ, начните новый прогон с выбором, который включает слот следующего запуска.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'считыватель окон камеры ограничен одним запуском, и эти данные пришли от исчерпанного считывателя — выключите и снова включите питание камеры (отключите и снова подключите её или воспользуйтесь её выключателем), затем снова запустите `preserve --resume <run-directory>`. Сигнатура: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'считыватель окон камеры ограничен одним запуском, и эти данные пришли от исчерпанного считывателя — выключите и снова включите питание камеры (отключите и снова подключите её или воспользуйтесь её выключателем), затем снова запустите `preserve --resume <run-directory>`. Сигнатура: {signature} — из этих байтов нельзя вывести заводской незашифрованный образ. Опробованы все способы его прочитать:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'в резервной копии нет {bank:gen} ({address}) — заводские окна не могут его отдать',
  'preserve.fail.readsDisagree':
    'два считывания {bank:gen} не совпадают (sha256 {sha256} и {other}) — в камеру, которая не может дважды подряд одинаково отдать слот, с которого работает, писать нельзя; снимок служит источником для восстановления и исходными данными для вывода патча',
  'preserve.fail.notFactory':
    'в {bank:loc} нет заводского образа в том виде, в каком его хранит шифр этой сборки (ожидаемое начало образа не совпадает со снимком), — отказ ещё до того, как что-либо будет зафиксировано, не говоря уже о записи',
  'preserve.fail.ffSum':
    'пропатченная прошивка в той форме, в какой её хранит камера, не проходит собственную проверку этой сборки (её сумма должна быть {sum}) — отказ отправлять слот, который камера отклонила бы после стирания',
  'preserve.fail.headChanged':
    'начало {bank:gen} изменилось после резервного копирования (там нет ни исходного снимка, ни пропатченных байтов) — отказ записывать поверх неизвестного состояния слота; ничего не записано. Начало в hex: сейчас {live}, в снимке {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks} уже содержит пропатченные байты — запись состоялась в предыдущей попытке, и повторять её нельзя. Продолжите с шага полного считывания (--resume): он запускает пропатченный образ и продолжает оттуда.',
  'preserve.fail.landed':
    '{banks} уже содержат пропатченные байты — запись состоялась в предыдущей попытке, и повторять её нельзя. Продолжите с шага полного считывания (--resume): он запускает пропатченный образ и продолжает оттуда.',
  'preserve.fail.drainRebootRefused':
    'команду перезагрузки для полного считывания ОТКЛОНИЛА сама среда ещё до отправки (SecurityError: политика браузера или защита теста), поэтому камера по-прежнему работает на образе, с которым запустилась, а не на записанном патче. Полное считывание читает только через расширенное окно пропатченного образа, поэтому останавливается, ничего не активировав; ничего не считано. Запустите полное считывание снова там, где среда пропускает команду перезапуска.',
  'preserve.fail.shiftedRebootRefused':
    'полное считывание вернулось со сдвигом на одну страницу, а перезагрузку, которая даёт новый запуск, ОТКЛОНИЛА сама среда ещё до отправки (SecurityError: политика браузера или защита теста), — ещё одна попытка считала бы тот же сдвинутый запуск. Ничего не сохранено; запустите полное считывание снова там, где сброс может уйти.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'сверка насчитала {count} различающийся байт в {read}/{total} окнах — при повторном чтении микросхема не совпадает побайтно с резервной копией',
    few: 'сверка насчитала {count} различающихся байта в {read}/{total} окнах — при повторном чтении микросхема не совпадает побайтно с резервной копией',
    many: 'сверка насчитала {count} различающихся байт в {read}/{total} окнах — при повторном чтении микросхема не совпадает побайтно с резервной копией',
    other:
      'сверка насчитала различающихся байтов: {count} в {read}/{total} окнах — при повторном чтении микросхема не совпадает побайтно с резервной копией',
  },
  'preserve.fail.verifyIn': {
    one: 'сверка насчитала {count} различающийся байт в {read}/{total} окнах (места: {places}) — при повторном чтении микросхема не совпадает побайтно с резервной копией',
    few: 'сверка насчитала {count} различающихся байта в {read}/{total} окнах (места: {places}) — при повторном чтении микросхема не совпадает побайтно с резервной копией',
    many: 'сверка насчитала {count} различающихся байт в {read}/{total} окнах (места: {places}) — при повторном чтении микросхема не совпадает побайтно с резервной копией',
    other:
      'сверка насчитала различающихся байтов: {count} в {read}/{total} окнах (места: {places}) — при повторном чтении микросхема не совпадает побайтно с резервной копией',
  },
  'preserve.fail.verifyShort': {
    one: 'сверка насчитала {count} различающийся байт в {read}/{total} окнах (короткие окна: {short}) — при повторном чтении микросхема не совпадает побайтно с резервной копией',
    few: 'сверка насчитала {count} различающихся байта в {read}/{total} окнах (короткие окна: {short}) — при повторном чтении микросхема не совпадает побайтно с резервной копией',
    many: 'сверка насчитала {count} различающихся байт в {read}/{total} окнах (короткие окна: {short}) — при повторном чтении микросхема не совпадает побайтно с резервной копией',
    other:
      'сверка насчитала различающихся байтов: {count} в {read}/{total} окнах (короткие окна: {short}) — при повторном чтении микросхема не совпадает побайтно с резервной копией',
  },
  'preserve.fail.verifyInShort': {
    one: 'сверка насчитала {count} различающийся байт в {read}/{total} окнах (места: {places}) (короткие окна: {short}) — при повторном чтении микросхема не совпадает побайтно с резервной копией',
    few: 'сверка насчитала {count} различающихся байта в {read}/{total} окнах (места: {places}) (короткие окна: {short}) — при повторном чтении микросхема не совпадает побайтно с резервной копией',
    many: 'сверка насчитала {count} различающихся байт в {read}/{total} окнах (места: {places}) (короткие окна: {short}) — при повторном чтении микросхема не совпадает побайтно с резервной копией',
    other:
      'сверка насчитала различающихся байтов: {count} в {read}/{total} окнах (места: {places}) (короткие окна: {short}) — при повторном чтении микросхема не совпадает побайтно с резервной копией',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'блок конфигурации запуска',
  'preserve.fail.dataBlock': 'блок данных',

  'preserve.refused.secondRead': 'его второе считывание не удалось ({error})',
  'preserve.refused.readsDisagree': 'два его считывания не совпадают (sha256 {sha256} и {other})',
  'preserve.refused.erased': 'он стёрт',
  'preserve.refused.watchdogMark':
    'его слово заголовка по смещению +0x200 содержит {word} — метку, которую загрузчик пишет поверх слота после сброса по сторожевому таймеру в начале запуска; загрузчик больше не принимает этот слот, и у прогона нет в нём образа для патча',
  'preserve.refused.noHeader': 'в нём нет заголовка образа по смещению +0x200',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'в нём {image} ({id}), а не сборка, которая работает на камере ({camera})',
  'preserve.refused.otherKey':
    'проверка загрузчика его отвергает: он хранится под другим ключом, чем тот, которым загрузчик этой камеры проверяет слоты, а запись через камеру сохранила бы его под тем ключом, поэтому восстановление не смогло бы вернуть его точные байты',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'камера сообщает прошивку {camera}, а нужна {version} — патч выведен из байтов одной сборки и не должен отправляться в другую',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'прошивка {version} — не сборка 0.x или 1.x, а этот прогон охватывает только сборки 2014 и 2016 годов. Кроме версии, ничего не считано. Считайте эту камеру на вкладке «Дамп и расшифровка 4.x/Nano»: она считывает флеш-память без патча, каждый блок, кроме блока по адресу 0x14060000, до которого на этих сборках не достаёт ни одно окно чтения.',
  'preserve.refused.preWidening':
    'прошивка {version} старше маршрута расширения, и прогон отказывает, чтобы не писать поверх слота, который не сможет считать обратно. На этом поколении камера отвергает все способы начать чтение, нужное этому маршруту (измерено на 0.3.0.1), её команда чтения не достаёт до начала флеш-памяти, а размер, который изменил бы патч, хранится по-другому. Чтения, которым мог бы воспользоваться обычный дамп, у неё тоже нет. Кроме версии, ничего не считано.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'содержит неизвестный образ (не заводскую прошивку {version} и не известное Preserve её изменение), поэтому Preserve его не патчит и на место не возвращает',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'содержит известную сборку с другой частотой кадров: заводскую прошивку {version} с патчем частоты кадров {hz} Hz. Preserve патчит только заводскую прошивку, никогда не пропатченный образ, поэтому этот слот не патчит и на место не возвращает',
  'preserve.image.frameRateEarlier':
    'содержит известную сборку с другой частотой кадров: заводскую прошивку {version} с более ранним патчем частоты кадров {hz} Hz (сделанным до того, как в него вошло исправление USB). Preserve патчит только заводскую прошивку, никогда не пропатченный образ, поэтому этот слот не патчит и на место не возвращает',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    'он {what}. Чтобы включить этот слот, сначала запишите в него заводской образ (например, из полной резервной копии флеш-памяти, снятой до изменения), затем начните новый прогон',
  'preserve.image.frameRateWords':
    'он {what}. Чтобы включить этот слот, сначала запишите в него заводской образ (например, из полной резервной копии флеш-памяти, снятой до патча частоты кадров), затем начните новый прогон; патч частоты кадров потом можно снова сделать на заводском образе',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name} {what}. Прогон берёт прошивку для патча из этого слота, поэтому останавливается здесь, ещё до какой-либо записи. Чтобы сохранить эту камеру, сначала запишите заводской образ обратно в {bank:acc} (например, из полной резервной копии флеш-памяти, снятой до изменения), затем начните новый прогон.',
  'preserve.image.frameRateRefusal':
    '{name} {what}. Прогон берёт прошивку для патча из этого слота, поэтому останавливается здесь, ещё до какой-либо записи. Чтобы сохранить эту камеру, сначала запишите заводской образ обратно в {bank:acc} (например, из полной резервной копии флеш-памяти, снятой до патча частоты кадров), затем начните новый прогон; патч частоты кадров потом можно снова сделать на заводском образе.',
  'preserve.image.otherFirmware':
    'он содержит прошивку {image}, а не {camera}, которая работает на камере',
  'preserve.image.otherFirmwareRefusal':
    '{name} содержит прошивку {image}, а не {camera}, которая работает на камере, поэтому у этого прогона нет там образа, который можно пропатчить, и он отказывает, чтобы не писать поверх него.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage': 'из него не выводится образ, который прогон может пропатчить ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone': 'этот прогон завершён — все шаги выполнены (прогон {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    '{step} в этом прогоне уже выполнен (завершён {finished}) — продолжение начнётся с {next}',
  'preserve.gate.stepDoneUnknownTime':
    '{step} в этом прогоне уже выполнен (время завершения неизвестно) — продолжение начнётся с {next}',
  'preserve.gate.backupRerun':
    'резервное копирование нельзя запустить повторно: этот прогон уже выполнил {steps}, и его следующий шаг — {next}; используйте --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'предыдущая попытка резервного копирования не удалась, и перед повторным запуском этого шага камеру нужно ВЫКЛЮЧИТЬ И СНОВА ВКЛЮЧИТЬ — повтор на том же запуске может считать устаревшие или пустые байты (измерено: при повторном резервном копировании вместо записи конфигурации запуска было считано стартовое слово загрузчика). Выключите и снова включите питание камеры (отключите и снова подключите её или воспользуйтесь её выключателем), затем снова запустите резервное копирование и подтвердите перезапуск питания, когда вас спросят: прогон не может этого увидеть. Записанная ошибка: {error}',
  'preserve.gate.noErrorText': '(текста ошибки нет)',
  'preserve.gate.patchAfterBackup':
    '{step} выполняется после резервного копирования: прогон снимает дамп каждой области, которую может считать заводской план, и сохраняет его ДО всего остального — эта резервная копия единственная копия этой камеры. Сначала выполните шаг резервного копирования.',
  'preserve.gate.commitAfterBackup':
    '{step} выполняется после резервного копирования (смотрите шаг патча)',
  'preserve.gate.commitAfterPatch':
    '{step} выполняется после шага патча, который фиксирует, что будет передано',
  'preserve.gate.commitNeedsPatch':
    '{step}: нужен патч {banks:gen}, а шаг патча его не зафиксировал — выполните шаг патча ещё раз',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step}: в каталоге прогона нужны файлы резервной копии, а их нет: {files} — без них у записи нет источника для восстановления, поэтому она отказывает',
  'preserve.gate.drainNoCommit':
    '{step} читает ПРОПАТЧЕННУЮ микросхему через расширенное окно, а в этом прогоне нет завершённой записи — на заводской камере полное считывание зависло бы. Сначала выполните запись (или продолжите с неё) либо явно перейдите вперёд (allowJump), если запись состоялась без своей контрольной точки.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'шаг полного считывания отказывает на {build}: {note}',
  'preserve.gate.detectedBuild': 'обнаруженной сборке',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'шаг полного считывания отказывает на {build}: запуск полного считывания на непропатченной прошивке этой сборки приводит к сбою камеры (она читает по значению, которое не является адресом флеш-памяти; измерено на эмуляторе: отдано 32 КБ, затем камера упала). Изменение, которое делает чтение безопасным, находится по адресу {sites}, и его нет среди изменений, зафиксированных этим прогоном для {bank:gen}, — выполните шаг патча (и доведите запись до конца) перед полным считыванием.',
  'preserve.gate.drainFiles':
    '{step}: нужен {files} (полученный дамп дорабатывается снимком каждого записанного слота), а в каталоге прогона его нет',
  'preserve.gate.restoreNoCommit':
    '{step} возвращает исходные слоты поверх патча, а в этом прогоне нет завершённой записи — откатывать нечего. Сначала выполните запись (или продолжите с неё) либо явно перейдите вперёд (allowJump), чтобы восстановить уже пропатченную камеру.',
  'preserve.gate.restoreNeedsPatch':
    '{step}: нужна сводка патча каждого записанного слота (для длины передачи) — сначала выполните шаг патча',
  'preserve.gate.restoreNoForm':
    'шаг восстановления отказывает на {build}: ни одна форма исходной прошивки не проходит собственную проверку камеры и при этом не сохраняется обратно в виде исходных байтов — контрольная сумма исходной прошивки 0xB7AB9D17 (измерено), а не 0xFFFF, которой требует камера. Этот прогон заканчивается полным образом на руках и оставленным на месте патчем; исходное содержимое можно вернуть только программатором всей флеш-памяти.',
  'preserve.gate.restoreFiles':
    '{step}: нужен {files} (исходный образ каждого записанного слота из шага резервного копирования), а в каталоге прогона его нет',
  'preserve.gate.verifyNoRestore':
    '{step} сравнивает новый запуск с резервной копией, а в этом прогоне нет завершённого восстановления — пропатченный слот показал бы различия. Сначала выполните восстановление (или продолжите с него) либо явно перейдите вперёд (allowJump), если восстановление состоялось без своей контрольной точки.',
  'preserve.gate.verifyNeedsBackup':
    '{step}: нужен {file} (эталон для сравнения), а в каталоге прогона его нет',
  'preserve.gate.needsBanks':
    '{step}: нужны слоты, считанные шагом резервного копирования, а в состоянии их нет',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'для этого прогона не выбран ни один слот: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank} нельзя записать: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'патч этой сборки запускается только со слота восстановления R: {note} — прогон записал бы {bank:acc}, откуда загрузчик его никогда не запускает',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'файл слишком мал, чтобы вместить заголовок образа',
  'slots.image.notWordSized': 'размер образа должен быть кратен 4 (получено {size} Б)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'образ — {size} Б; загрузчик отвергает любой header.length >= {limit}, поэтому образ никогда не запустится',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'нет заголовка образа по адресу {at} (сигнатура {magic}, ожидалось {expected}) — нужен расшифрованный образ прошивки Seek, а не зашифрованный слот или дамп флеш-памяти',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'начальный указатель стека {address} не в SRAM LPC43xx — образ не похож на расшифрованный',
  'slots.image.stackUnaligned': 'начальный указатель стека {address} не выровнен по слову',
  'slots.image.notThumb': 'вектор сброса {address} — не адрес Thumb',
  'slots.image.noKeyPair':
    'в имени этого файла нет его пары ключей, а ни пара этой камеры, ни декодированная пара приложения не встречается в образе ровно один раз, поэтому нельзя понять, для каких ключей собран образ. Расшифрованные файлы получают имена с ключами, которые они содержат.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'имя файла указывает ключ A {keyA} и ключ B {keyB}, но {mismatch}. Оба ключа должны присутствовать, каждый ровно один раз.',
  'slots.image.keyInHeader':
    'этот образ хранит ключ по адресу {at}, внутри открытого окна заголовка, — отказ его патчить',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'ключ A и ключ B из имени файла приходятся на перекрывающиеся байты по адресам {at} и {other} — это должны быть два разных 16-байтовых значения',
  'slots.image.retargetLost':
    'после перенастройки образ не содержит пару ключей этой камеры ровно один раз — отказ собирать данные, для последующих обновлений которых загрузчик не смог бы подобрать ключ',
  'slots.image.noStageKey':
    'образ не содержит ни одной пары ключей линейки 2016 года, поэтому нет ключа передачи, чтобы его закодировать',
  'slots.image.ffSumNoKeys':
    'у этого образа сумма слов FF 16 Hz 0xFFFF, но он не содержит пару ключей 1.3.0.8-FF (обе половины, каждую по одному разу), поэтому его форму передачи не собрать. Ничего не записано.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'это образ 1.3.0.8 FF (16 Hz), который передаётся в собственной форме с ключом A (ff-form.ts), а не как незашифрованный образ. Ничего не записано.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'план собран для прошивки {firmware}, а анализ показывает {version}. План устарел; соберите его заново. Ничего не записано.',
  'slots.plan.otherFirmwareUnknown':
    'план собран для прошивки неизвестной версии, а анализ показывает {version}. План устарел; соберите его заново. Ничего не записано.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'план собран для камеры {planSerial}, а анализ показывает {serial}. Записывать его сюда отказано. Ничего не записано.',
  'slots.plan.cameraUnknownSerial': 'с неизвестным серийным номером',
  'slots.plan.unknownSerial': 'неизвестный серийный номер',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, as a label. */
  'slots.plan.otherAddress':
    'план нацелен на {address}, а {name} этой сборки находится по адресу {at}',
  'slots.plan.notRead': 'анализ больше не считывает {name:acc}. Ничего не записано.',
  'slots.plan.edited':
    'контрольная сумма плана не совпадает с его данными, значит, план изменён. Ничего не записано.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'данные имеют размер {size} Б и выходят за пределы {name:gen}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck': '{risk}. Для записи нужно acknowledgeRisk: true. Ничего не отправлено.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'эта камера не может принять отсюда образ с незашифрованной передачей: {reason}. Ничего не записано.',
  'slots.plan.noKeyTable':
    'анализ не называет таблицу ключей загрузчика этой камеры, поэтому образ нельзя под неё перенастроить',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'статус подтверждения записи не удалось прочитать после CompleteMemoryUpgrade, поэтому {name} мог быть записан частично. Прежде чем делать что-либо ещё, считайте слоты заново и сохраните свой дамп.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'камера отклонила запись в {name:acc} при подтверждении со статусом {status}: {cause}. Ничего не записано; слот не изменился. Прежде чем делать что-либо ещё, считайте слоты заново.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade вернула {status} ({cause}) для {name:gen}: ничего не запрограммировано, но стирание могло начаться, поэтому слот может быть частично стёрт. Прежде чем делать что-либо ещё, считайте слоты заново и сохраните свой дамп.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade вернула {status} ({cause}) — {name} мог быть записан частично. Прежде чем делать что-либо ещё, считайте слоты заново и сохраните свой дамп.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'камера сообщила {status} во время передачи {name:gen} по смещению {offset} — прервано до CompleteMemoryUpgrade, поэтому во флеш-память ничего не записано',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum': 'контрольная сумма передачи не совпала с переданными байтами',
  'commit.cause.unsupported': 'образ не расшифровался ключами камеры, или тип данных отклонён',
  'commit.cause.acceptance':
    'образ отклонён проверкой контрольной суммы ещё до какого-либо стирания (проверка зависит от сборки)',
  'commit.cause.notArmed': 'обновление слота не было активировано',
  'commit.cause.eraseFailed': 'этап стирания не удался',
  'commit.cause.programFailed': 'этап программирования не удался',
  'commit.cause.verifyFailed': 'этап проверки не удался',
  'commit.cause.unknown': 'статус, неизвестный здесь',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name} не копируется сам в себя. Ничего не записано.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Ничего не записано.',
  'copy.refused.noPlain':
    'в {name:loc} нет расшифрованного образа для копирования. Ничего не записано.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} — ZIP, который здесь не прочитать ({error}). Ничего не записано.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    'в {file} нет полной флеш-памяти. ZIP принимается, если это файл прогона Preserve с {preserve} (после того как выполнен его шаг полного дампа), zip-архив «Дамп и расшифровка 4.x/Nano» ({dump}) или zip-архив «Дамп всех селекторов» ({selectors}); в этом ZIP — {names}. Ничего не записано.',
  'restore.refused.noWholeFlashPatched':
    'в {file} нет полной флеш-памяти. ZIP принимается, если это файл прогона Preserve с {preserve} (после того как выполнен его шаг полного дампа), zip-архив «Дамп и расшифровка 4.x/Nano» ({dump}) или zip-архив «Дамп всех селекторов» ({selectors}); в этом ZIP — {names}. Его {patched} — это флеш-память с временным патчем прогона, поэтому он не принимается. Ничего не записано.',
  'restore.refused.zipEmpty': 'ничего',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'полная резервная копия флеш-памяти занимает {full} Б (4 МБ, вся микросхема, которую считывает J-Link); {file} — {size} Б. Ничего не записано.',
  'restore.refused.noBank': 'в плане этой сборки нет {bank:gen}. Ничего не записано.',
  'restore.refused.outsideFlash': '{name} не лежит внутри флеш-памяти 4 МБ. Ничего не записано.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    '{where} не был считан дампом, из которого взят {file}: по его manifest.json, {address} — пропуск. Образа для восстановления нет. Ничего не записано.',
  'restore.refused.gapReason':
    '{where} не был считан дампом, из которого взят {file}: по его manifest.json, {address} — пропуск ({gap}). Образа для восстановления нет. Ничего не записано.',
  'restore.refused.gapFill':
    '{where} не был считан дампом, из которого взят {file}: по его manifest.json, {address} — пропуск, заполненный {fill}. Образа для восстановления нет. Ничего не записано.',
  'restore.refused.gapReasonFill':
    '{where} не был считан дампом, из которого взят {file}: по его manifest.json, {address} — пропуск ({gap}), заполненный {fill}. Образа для восстановления нет. Ничего не записано.',
  'restore.refused.empty':
    '{where} пуст: каждый байт — 0xFF. Запись программирует образ и не может оставить слот стёртым, поэтому пустой слот записью не восстановить. Ничего не записано.',
  'restore.refused.fill':
    '{where} сплошь состоит из {fill}, а это заполнитель, который дамп пишет там, где ничего не считал: дамп не считывал этот слот. Образа для восстановления нет. Ничего не записано.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    '{where} нельзя восстановить из этого файла: {why}. Ничего не записано.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'у этой сборки нет активации записи для этого слота',
  'support.noStagingEmpty': 'у этой сборки нет формы передачи, поэтому пустой слот не записывается',
  'support.buildUnknown': 'сборка неизвестна',
  'support.unverifiedStaging':
    'эта сборка — на закрытой линейке 0.x/1.x, но не из тех, на которых измерялись таблицы патча Preserve (0.8.0.0 .. 1.3.0.8 и 1.0.3.0 / 1.0.3.2), поэтому форма передачи для её слота неизвестна и ничего не записывается',
  'support.unknownFamily':
    'семейство камеры неизвестно, а значит, неизвестен и ключ, под которым записываются её слоты, а камера принимает слот, записанный не под тем ключом, и потом с него не запускается. Снимите дамп этой камеры и расшифруйте его, определите по дампу её семейство, затем укажите его через --family.',
  'support.noReadCommand':
    'у прошивки старше 0.8.0.0 нет обработчика чтения для GetFeaturedFirmwareData — команды, которой дамп читает флеш-память. На 0.7.0.7 и 0.7.0.8 она есть в таблице методов RPC по 0x4F, но зарегистрирована только как сеттер (обработчик записи), поэтому чтение control-IN, которое отправляет дамп, не может быть обработано (прогон Preserve вместо этого считывает эти две сборки через wire id 0x58, GetFeaturedData); до 0.7.0.7 wire id 0x4F — это UploadFirmwareRowSize, а на 0.3.0.1 wire id 0x52, которым дамп активирует окно, — это EnterBootloaderMode, а не BeginFirmwareUpgrade: камера остаётся в своём приложении, но каждая активация задаёт цель во флеш-памяти и запускает этап обновления прошивки этой сборки (GetErrorCode затем возвращает 0x00400000), а это не окно чтения. Восстановлено по собственным таблицам методов образов, оба столбца обработчиков; смотрите test/firmware/facts.json.',
  'support.noWritePath':
    'эти сборки принимают новую прошивку через более старую последовательность обновления, которую эта программа не отправляет, а их слоты никогда не были размечены, поэтому ничего не записывается.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'версию прошивки не удалось прочитать, поэтому сборка, её слоты и их форма передачи неизвестны; на ней ничего не считывается и не записывается',
  'support.versionNotDotted':
    'версия прошивки «{version}» не записана числами через точку, поэтому сборка, её слоты и их форма передачи неизвестны; на ней ничего не считывается и не записывается',
  'support.olderThanFirst':
    'прошивка {version} старше {first}: в её таблице RPC нет обработчика чтения для GetFeaturedFirmwareData — команды, которую отправляет чтение слота, — поэтому ей не отправляется ни чтение, ни запись (доказательства — в early-compact)',
  'support.modernOnLocked':
    'семейство modern-4x охватывает 2.x, 4.x, 10.x, 42.x и 44.x; {version} — на закрытой линейке 0.x / 1.x, для которой нужно legacy-auth или compact-2016',
  'support.lockedOnModern':
    'семейство legacy-auth охватывает закрытую линейку 0.x / 1.x; {version} — на современной линейке, для которой нужно modern-4x',
  'support.notCompactPro':
    'семейство compact-2016 охватывает линейку Compact PRO 1.0.3.x; {version} к ней не относится',
  'support.earlyCompact':
    'семейство early-compact охватывает только сборки старше {first}, а {version} считывается через legacy-auth',
  'support.generic':
    'семейство камеры не определено (семейство generic), поэтому раскладка слотов и форма передачи неизвестны; определите камеру, прежде чем считывать или записывать слот',
  'support.noPlan':
    'для семейства {family} нет плана слотов: его раскладка слотов и форма передачи неизвестны',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'таблица этой сборки не активирует режим {mode} по адресу {address} по простому каналу',
  'support.noArmToken':
    'таблица этой сборки не активирует режим {mode} по адресу {address} по каналу с токеном',
  'support.windowElsewhere':
    'окно слота Preserve для {bank:gen} находится по адресу {at}, а не {address}',
  'support.noDumpWindow':
    'в таблице BeginFirmwareUpgrade этой сборки нет окна по адресу {address} для {bank:gen}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} не поддерживает: {capability} — {reason}',
  'support.capability.dump': 'дамп',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': 'Дамп всех селекторов',
  'support.capability.decrypt': 'расшифровка',
  'support.capability.deviceInfo': 'полное считывание вкладки «Сведения»',
  'support.capability.flash': 'запись слотов',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name} по адресу {address} на этой сборке не читается: в её таблице селекторов там нет окна, поэтому для него ничего не активировано',
  'slots.unread.missing': '{name} отсутствует в анализе камеры',
  'slots.unread.notRead': '{name} не был считан',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Ничего не записано.',
  'slots.refused.versionUnknown':
    'анализ не говорит, какая прошивка работает на камере, а команды слотов на разных сборках значат разное. Считайте сведения об устройстве заново.',
  'slots.refused.versionUnknownWrite':
    'анализ не говорит, какая прошивка работает на камере. Ничего не записано.',
  'slots.refused.emptyInput': 'входные данные пусты',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable': '{name} пуст, и на этой сборке его нельзя записать: {reason}',
  'slots.refused.noRaw': '{name} не может принять сырые байты на этой сборке: {reason}',
  'slots.refused.noPlain': '{name} не может принять расшифрованный образ на этой сборке: {reason}',
  'slots.refused.noStaging':
    'у {name:gen} нет формы передачи на этой сборке, поэтому образ для него не закодировать',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} Б — больше, чем вмещает {name} ({bankSize} Б)',
  'slots.refused.imageTooLong': 'образ — {size} Б, больше, чем вмещает {name} ({bankSize} Б)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'загрузчик 2014 года не принимает контрольную сумму этой сборки в слоте A или B и запускает слот восстановления R (0x14070000) без проверки, поэтому патч записывается в слот восстановления R и больше никуда',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly':
    'эта сборка запускается только со слота восстановления R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize': 'слот прошивки занимает {size} Б ({kib} КБ); этот файл — {count} Б',
  'decryptFile.erasedBank':
    'пуст, расшифровывать нечего: все {size} Б читаются как 0xFF (стёртый слот)',
  'decryptFile.erasedHeader':
    'стёрт: окно заголовка сплошь 0xFF, поэтому в слоте нет образа; ничего не расшифровано',
  'decryptFile.noHeader': 'нет заголовка образа (сигнатура {magic}), поэтому расшифровывать нечего',
  'decryptFile.lengthOutOfRange':
    'header.length {length} вне допустимого диапазона; расшифровывать нечего',
  'decryptFile.ffKeyB':
    'расшифровано {size} Б ключом B FF 1.3.0.8: образ хранится как образ XOR ключевой поток его блока ключей 1, окно заголовка как есть',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'ключ не восстановлен: образ расшифровывается в вектор сброса, который не является точкой входа Cortex-M (ключ {check}); ничего не расшифровано',
  'decryptFile.storedPlain':
    'хранится открыто: слот содержит образ в том виде, в каком он работает (незашифрованная цепочка 2014 года, тождественный ключевой поток), поэтому ключа нет, а расшифрованный образ — это сам образ',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 'расшифровано {size} Б ключом, восстановленным из этого слота ({check})',
  'decryptFile.decryptedNamed':
    'расшифровано {size} Б ключом, восстановленным из этого слота ({check}; это {key})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'короткое чтение ({size} Б)',
  'read.reason.noParse': 'не удалось разобрать заголовок образа',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'нет заголовка образа (сигнатура {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} вне допустимого диапазона',
  'read.reason.stopped': 'чтение слота остановилось на {count}/{size} Б',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'не читается на прошивке {version}: в её плане ({table}) нет окна по адресу {address}, поэтому для него ничего не активировано',
  'read.reason.notInPlanUnknown':
    'не читается на прошивке неизвестной версии: в её плане ({table}) нет окна по адресу {address}, поэтому для него ничего не активировано',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'окно отдало байты устаревшего дескриптора считывателя — слово 0 {word} с вектором сброса {hex} — это таблица векторов 0x14000000, а не содержимое этого слота, поэтому из него ничего не анализировалось: {remedy}',
  'read.reason.spentReader': 'слоты камеры не удалось считать — {remedy}',
  'read.spentRemedy':
    'считыватель окон, возможно, исчерпан на этот запуск; выключите и снова включите питание камеры и повторите',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'слово активного слота камеры (корни fw info, селектор 10) не удалось считать',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'слово активного слота камеры равно {word}, а это не номер слота',
  'checkKey.unnamed.cfg0NotRead':
    'слово конфигурации запуска не считано, поэтому неизвестно, проверял ли загрузчик {bank:acc}, прежде чем в него войти',
  'checkKey.unnamed.noZeroSum':
    'камера сообщает, что вошла в {bank:acc}, но в этом считывании {bank} не расшифровывается в нулевую сумму слов',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'камера сообщает, что вошла в {bank:acc}, который слово конфигурации запуска {word} оставляет напоследок, поэтому загрузчик вошёл в него без проверки, но в этом считывании {bank} не расшифровывается в нулевую сумму слов',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (оценка {score} после считывания, по данным ниже)',
  'report.detectedAmbiguous':
    '{family} (оценка {score} после считывания, по данным ниже; неоднозначно)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'да',
  'report.cell.no': 'нет',
  'report.cell.notApplicable': 'н/д',
  'report.cell.unknown': 'неизвестно',
  'report.cell.recoveryOnly': 'только восстановление',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'константа отбеливания K',
  'report.keyRow.store': 'ключ хранения',
  'report.keyRow.check': 'ключ проверки',
  'report.keyRow.table': 'таблица ключей',
  'report.keyRow.keys': 'ключи',
  'report.keyRow.a': 'ключ A',
  'report.keyRow.b': 'ключ B',
  'report.keyRow.tableAt': 'адрес таблицы',
  'report.key.notIdentified': '(не определён)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} кандидат, ни один не подтверждён',
    few: '{count} кандидата, ни один не подтверждён',
    many: '{count} кандидатов, ни один не подтверждён',
    other: '{count} кандидата, ни один не подтверждён',
  },
  'report.key.tableAt': '{offset} в блоке загрузчика, подтверждено по слоту',
  'report.key.plainChain':
    'не нужны: слоты хранятся как незашифрованная прошивка, поэтому слот считывается и записывается как есть',
  'report.key.tableRefused2016':
    'не считана — блок загрузчика (0x14000000) на этой линейке отклоняется на всех каналах',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, назван по {bank:dat} — слоту, в который, по словам камеры, она вошла после проверки загрузчика',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, выведен из {bank:gen} — слота, в который, по словам камеры, она вошла: загрузчик входит в этот слот без проверки и запускает его под ключом, которым проверяет остальные слоты',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' (блок 1; {pair})',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'пара Compact PRO 1.0.3.x 9 Hz',
  'keyPair.cp1032ff': 'пара Compact PRO 1.0.3.x FF',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'не назван — {why}',
  'report.checkKey.couldNotName': 'считывание не смогло его назвать',
  'report.storeKey.checkKeyUnnamed':
    'ключ, которым загрузчик проверяет слоты (в этом считывании не назван): приложение хранит под этим ключом каждый записываемый слот',
  'report.storeKey.checkKey':
    '{key}: приложение хранит каждый записываемый слот под ключом, которым проверяет загрузчик',
  'report.storeKey.unknown': 'неизвестно — блок загрузчика с ячейкой ключа устройства не считан',
  'report.storeKey.keyBUnidentified':
    'Ключ B (ключ устройства не запрограммирован; сам ключ B не определён)',
  'report.storeKey.keyB': 'Ключ B (ключ устройства не запрограммирован)',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain': 'передаётся незашифрованным (образ как есть, без ключа)',
  'report.staged.slotKeystream': 'передаётся под собственным блоком ключей 0 своего образа',
  'report.staged.keyA':
    'передаётся под ключами, выведенными из слота, с которого запущена камера, и из работающего приложения',
  'report.staged.ffVendor':
    'передаётся так, как фирменное приложение передаёт образ FF 16 Hz (образ XOR его собственный блок ключей 0), а камера хранит его под ключом B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Резервная копия: блок {address}',
  'progress.backupDone': 'Резервная копия: все блоки считаны',
  'progress.checkBlock': 'Сверка: блок {address}',
  'progress.checkDone': 'Сверка: все блоки считаны',
  'progress.writingBank': 'Запись {bank:gen}',
  'progress.restoringBank': 'Восстановление {bank:gen}',
  'progress.staged': '{label}: передано {done}/{total} Б',
  'progress.wholeFlash': 'Полное считывание: {got}/{total} Б',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'чтение {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'чтение {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Готово — считано окон: {ok}/{total}.',
  'progress.readingBank': 'Считывание {bank:gen} ...',
  'progress.analysing': 'Анализ ...',
  'progress.probeSelector': 'проверка селектора {selector} ...',
  'progress.selectorsArmed':
    'Готово — активировано селекторов: {armed}/{span}, с данными: {withData}.',
  'progress.recoveringKey': 'расшифровка: восстановление ключа для {address} ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} {address} (subcmd {subcmd}) не удалось считать: {error}',
  'slots.read.refusedBuild':
    'отказ считывать слоты прошивки: {reason}. Кроме чтения версии, ничего не отправлено, поэтому ни один слот не затронут.',
  'slots.backup.notSaved':
    'резервная копия {file} не сохранена, поэтому ничего не записано. Запись никогда не выполняется, пока её резервная копия не сохранена; попробуйте ещё раз, когда сохранение станет возможным.',
  'slots.backup.notSavedWhy':
    'резервная копия {file} не сохранена ({error}), поэтому ничего не записано. Запись никогда не выполняется, пока её резервная копия не сохранена; попробуйте ещё раз, когда сохранение станет возможным.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'высокая скорость (480 Mbit/s)',
  'usb.speed.full': 'полная скорость (12 Mbit/s)',
  'usb.speed.code': 'код {code}',
} satisfies Translation<'core'>;
