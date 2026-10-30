/**
 * Namespace `core`, українська (uk), translated from the English source: sentences that `@seek-fw/core` makes and
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
    'камера лишається розблокованою до вимкнення живлення, і доти інші програми можуть зчитувати її неправильно; перш ніж ними користуватися, вимкніть і ввімкніть її живлення',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': 'спершу {first}, потім {second}, потім {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'не зчитано',
  'boot.verdict.checkKeyUnnamed':
    'не вдалося перевірити: ключ, під яким її завантажувач перевіряє слот, не названо',
  'boot.cfg0NotRead':
    'слово конфігурації запуску (cfg[0]) не зчитано, тож невідомо, з якого слота відбудеться наступний запуск',
  'boot.select.unknown':
    'слово конфігурації запуску — {word}, тож завантажувач спершу пробує {first}, але {bank} {verdict}, тож невідомо, з якого слота відбудеться запуск',
  'boot.select.first':
    'слово конфігурації запуску — {word}, тож завантажувач спершу пробує {first}, і в ньому є образ, який завантажувач приймає',
  'boot.select.second':
    'слово конфігурації запуску — {word}, тож завантажувач спершу пробує {first}; у {first:loc} немає образу, який приймає завантажувач, тож він бере {second}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'слово конфігурації запуску — {word}, тож завантажувач спершу пробує {first}; ні в {first:loc}, ні в {second:loc} немає образу, який приймає завантажувач, тож він запускає {last}, якого не перевіряє',
  'boot.select.lastTakes':
    'слово конфігурації запуску — {word}, тож завантажувач спершу пробує {first}; ні в {first:loc}, ні в {second:loc} немає образу, який приймає завантажувач, тож він бере {last}, якого не перевіряє',
  'boot.bootsNow': '{bank} — слот, з якого камера запущена зараз',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'запущений зараз',
  'boot.notBooted': 'не запущений',
  'boot.unknownWhy.checkKeyUnnamed':
    'ключ, під яким її завантажувач перевіряє слот, під час цього зчитування не названо',
  'boot.unknownWhy.noKeyTable':
    'таблицю ключів завантажувача не зчитано, тож ключі, які він пробує, назвати не можна',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'Камера запускається з {bank:gen}. {why}.',
  'fpsBoot.holdsOne': '{bank} містить патч частоти кадрів, але не запускається, тож патч не діє.',
  'fpsBoot.holdsTwo':
    '{banks} містять патчі частоти кадрів, але жоден із них не запускається, тож патчі не діють.',
  'fpsBoot.wouldNotRun':
    'Патч {target:gen} не змусить його запускатися, бо камера натомість запускається з {bank:gen}.',
  'fpsBoot.patchRunning':
    'Пропатчте також {bank:acc} (той, що запускається): саме це змушує патч частоти кадрів діяти.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank} тут не можна пропатчити ({reason}), тож патч частоти кадрів в іншому слоті на цій камері не діє.',

  /* ---- backup: the zip saved before a bank write (slots/backup) ---- */
  'backup.bank.notInPlan': '{name} (не входить до плану цієї збірки: у zip-архіві про це сказано)',
  'backup.bank.unsupported':
    '{name} (ця збірка не може його зчитати, {reason}: у zip-архіві про це сказано)',
  'backup.bank.empty':
    '{name} (порожній, усі байти 0xFF: у zip-архіві про це сказано, і запис не перезапише жодної прошивки)',
  'backup.bank.unread':
    '{name} (зчитування слотів до нього не дійшло: у zip-архіві сказано, чи дійде до нього зчитування перед записом)',
  'backup.bank.noKey':
    '{name} (у збереженому вигляді; жоден ключ, відновлений цим зчитуванням, його не відкриває, тож розшифрованого файлу немає)',
  'backup.bank.decrypted': '{name} (у збереженому вигляді й розшифрований)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Перш ніж щось буде записано, {banks} буде зчитано ще раз і збережено в одному zip-архіві з приміткою про те, що це за файли: {file}.',
  'backup.plan.many':
    'Перш ніж щось буде записано, {banks} буде зчитано ще раз і збережено в одному zip-архіві з приміткою про те, що це за файли: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'зашифровано так, щоб пристрій зберіг його під ключем, який має слот, з якого запущено камеру',
  'staging.detail.slotKeystreamCiphertext':
    'зашифровано власним ключем передавання образу (блок ключів 0); камера зберігає його під власним ключем слота',
  'staging.detail.plain': 'незашифровано, без шифру',
  'staging.detail.keyAKeystream':
    'образ 1.3.0.8 FF у тому вигляді, як його передає застосунок виробника (XOR ключ A), — збірка 16 Hz зберігає його під ключем B, а не ці байти',
  'staging.detail.verbatim': 'без змін — байти точно такі, як надано',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'немає зчитування',
  'copy.source.notInPlan': '{name} не входить до плану цієї збірки',
  'copy.source.notRead': '{name} не зчитано ({reason}), тож немає образу для копіювання',
  'copy.source.empty': '{name} порожній: немає образу для копіювання',
  'copy.source.foreign':
    '{name} не містить образу прошивки, який розпізнає це зчитування, тож копіювати нічого',
  'copy.source.noKey':
    'жоден ключ, відновлений цим зчитуванням, не відкриває {name:acc}, тож немає розшифрованого образу для копіювання',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} за адресою {address}, як його розшифрувало зчитування слотів',
  'copy.fromVersion':
    '{name} за адресою {address}, прошивка {version}, як її розшифрувало зчитування слотів',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'Образ — із {name:gen}, як його розшифрувало зчитування слотів: {size} Б, sha256 {sha256}.',
  'copy.noteVersion':
    'Образ — із {name:gen}, як його розшифрувало зчитування слотів: прошивка {version}, {size} Б, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's Slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '{name} резервної копії (за адресою {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where} — повна резервна копія флеш-пам’яті {file}',
  'restore.fromVersion': '{where} — повна резервна копія флеш-пам’яті {file}, прошивка {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'образ флеш-пам’яті на 4 МБ',
  'restore.kind.preserve-run': 'файл прогону Preserve',
  'restore.kind.dump': 'zip-архів «Дамп і розшифрування 4.x/Nano»',
  'restore.kind.all-selectors': 'zip-архів «Зчитати всі селектори»',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'образ',
  'restore.decryptedTo.firmware': 'прошивку {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'Образ — це {where} у файлі {file} ({kind}): збережений sha256 {stored}, розшифровано в {decrypted} на {size} Б (sha256 {sha256}).',
  'restore.note.imageEntry':
    'Образ — це {where} у файлі {file} ({kind}, його {entry}): збережений sha256 {stored}, розшифровано в {decrypted} на {size} Б (sha256 {sha256}).',
  'restore.note.readBack':
    'Після запису контрольне зчитування слота порівнюється зі збереженими в резервній копії байтами слота.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'Ідентифікаційний блок резервної копії називає цю камеру (серійний номер {serial}).',
  'restore.note.sameBytes':
    '{name} уже містить збережені в резервній копії байти: запис поверне той самий образ.',
  'restore.warn.otherCamera':
    'Ця резервна копія схожа на копію іншої камери: її ідентифікаційний блок називає серійний номер {theirs}, а в цієї камери — {camera}. Записується лише образ {name:gen}; нічого з ідентифікаційних даних чи калібрування тієї камери не записується.',
  'restore.warn.noIdentity':
    'Ця резервна копія не має ідентифікаційного блоку за адресою {address}, тож неможливо визначити, з якої камери її зчитано.',
  'restore.warn.serialNotRead':
    'Серійний номер камери не зчитано, тож резервну копію (серійний номер {serial}) не можна з нею зіставити.',
  'restore.warn.otherFirmware':
    '{where} містить прошивку {version}, а камера працює на {camera}: відновлення запише в слот іншу прошивку.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank} не зчитано для контролю, тож його не порівняно з резервною копією.',
  'restore.readBack.equal':
    '{bank} під час контрольного зчитування побайтово збігається з тим, що зберігає резервна копія.',
  'restore.readBack.differs':
    '{bank} під час контрольного зчитування відрізняється від збережених у резервній копії байтів на {count} Б (перша відмінність за зміщенням {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, отриманий зі {bank:gen}, з якого запущено камеру',
  'keys.derived.holds':
    '{key} (ключ зберігання), отриманий зі {bank:gen}, з якого запущено камеру і який містить {holds:acc}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, отриманий зі слота, з якого запущено камеру',
  'keys.derived.holdsUnnamed':
    '{key} (ключ зберігання), отриманий зі слота, з якого запущено камеру і який містить {holds:acc}',
  'keys.ffVendor.staged':
    'образ 1.3.0.8 FF (16 Hz) у тому вигляді, як його передає застосунок виробника: образ XOR його власний блок ключів 0 (ключ A), вікно заголовка без змін, у будь-який слот; ключі цієї камери не використовуються',
  'keys.ffVendor.stored':
    'ключ B: камера перешифровує отримані дані блоком ключів 1 і зберігає образ під ним',
  'keys.imageBlock0.staged':
    'образ під його власним блоком ключів 0 (знайденим в образі за значенням), у будь-який слот; ключі цієї камери не використовуються',
  'keys.imageBlock0.storedUnnamed':
    'ключ, під яким її завантажувач перевіряє слот (під час цього зчитування не названо); камера перешифровує отримані дані під ним',
  'keys.imageBlock0.stored':
    '{key} — ключ, під яким її завантажувач перевіряє слот; камера перешифровує отримані дані під ним',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED (не перевірено): жоден завантажувач збірки FF 16 Hz ще не зчитано з камери, тож невідомо, чи запуститься записаний слот. На завантажувачі 0.9.0.0 ранніша форма цього образу запускалася зі слота відновлення R; ця форма не запуститься, бо той завантажувач запускає слот відновлення R у збереженому вигляді, не декодуючи його.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'Образ FF 16 Hz надсилається у формі, яку читає лише збірка 16 Hz {version}. Ця камера записує слот, не перевіряючи образ (так сказано в джерельному коді її прошивки, і Compact 1.3.0.0 так і зробив під час спроби), тож очікується, що вона запише байти такими, як їх надіслано: тоді слот міститиме образ у формі, яку ця камера не може запустити.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Ніщо тут не стверджує, що камера його запустить.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast': 'Власні відповіді камери кажуть, що вона виконує збірку FF 16 Hz: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'перевіряє дані перед стиранням слота, і ці дані проходять перевірку, тож вона може записати ці байти як є, у формі, яку її завантажувач не може запустити: слот може не запуститися (не перевірялося; резервна копія, збережена перед записом, поверне його)',
  'write.ff.outcome.refuses':
    'перевіряє дані перед стиранням слота, і ці дані перевірку не проходять, тож очікується, що вона відхилить цей запис, ще нічого не записавши (камера з цією збіркою так само відхилила ранішу форму цього образу)',
  'write.ff.runsSlow': 'Камера виконує збірку 8 Hz {version}: {why}. Ця збірка {outcome}.',
  'write.ff.buildUnknown':
    'Власні відповіді камери не кажуть, яку збірку {version} вона виконує: {why}. Якщо це збірка FF 16 Hz, вона прийме ці дані. Якщо це збірка 8 Hz, ця збірка {outcome}.',
  'write.raw.asGiven':
    'Сирі дані: надсилаються точно такими, як надано. Ніщо тут не перевіряє, що з них можна запуститися.',
  'write.raw.ffStagedForm':
    'Ці дані — форма передавання 1.3.0.8 FF (образ XOR блок ключів 0, сума слів 0xFFFF). Камера зберігає образ під ключем B, тож контрольне зчитування звіряється з тими байтами.',
  'write.raw.noStaging':
    'Ця збірка не називає форми передавання для слота, тож про перевірки завантажувача нічого сказати не можна.',
  'write.raw.reencrypts':
    'Пристрій декодує ці дані й перешифровує те, що зберігає, тож збережені байти не передбачено. Контрольне зчитування перевіряється як образ, у який воно розшифровується, там, де це можна визначити.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'Завантажувач відхилив би ці дані: {failure}.',
  'write.raw.stageKeyUnchecked':
    'Ключа передавання 2016 року (блок ключів 0) у сирих байтах немає, тож суму слів розшифрованих даних тут не перевірено.',
  'write.image.rekeyRisk':
    '{name} уже містить образ, який завантажувач не може прийняти. Після цього запису стан буде той самий.',
  'write.ack.recovery':
    'Слот відновлення R: запис у нього вимагає від вас підтвердити ризик. Ніщо тут не перевіряє, що камера потім запуститься.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: запис у нього вимагає від вас підтвердити ризик, і після наступного вимкнення й увімкнення живлення камера запустить те, що в ньому буде.',
  'write.ack.bootUnnamed':
    'слот, з якого запущено камеру, назвати не вдалося, тож цей слот вважається тим, з якого її запущено',
  'write.ack.recoveryFallback':
    'Слот відновлення R — остання резервна копія, до якої вдається завантажувач',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'порожнє/0: спершу слот A, потім B, потім слот відновлення',
  'boot.cfg0.modernB': 'спершу слот B, потім A, потім слот відновлення',
  'boot.cfg0.modernRecovery': 'спершу слот відновлення, потім A, потім B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'невідомо — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  'upgrade.targetBooted':
    '{name} — водночас слот, з якого запущено камеру, і слот, у який записує її власне оновлення. Оновлення, запущене з цієї камери, перезаписало б образ, з яким вона працює. Це лише попередження: ніщо тут не блокує оновлення.',
  /** `{verdict}` is one of upgrade.verdict.*. */
  'upgrade.whileRecovery':
    'Камера працює зі свого слота відновлення, а її власне оновлення записує в {name:acc}, з якого вона не працює. {verdict} Це лише попередження: ніщо тут не блокує оновлення.',
  'upgrade.verdict.notRead':
    '{name} не вдалося зчитати під час цієї перевірки, тож невідомо, що в ньому.',
  'upgrade.verdict.blank': '{name} порожній, тож оновлення запише в порожній слот.',
  'upgrade.verdict.bootableSame':
    '{name} містить той самий придатний до запуску образ, що й слот, з якого працює камера, і оновлення його замінить; якщо оновлення зупиниться посередині, {name} залишиться непридатним до запуску.',
  'upgrade.verdict.bootable':
    '{name} містить придатний до запуску образ, який оновлення замінить; якщо оновлення зупиниться посередині, {name} залишиться непридатним до запуску.',
  'upgrade.verdict.unknown':
    'Чи придатний {name} до запуску, з цього зчитування невідомо, тож оновлення може замінити образ, з якого камера запустилася б.',
  'upgrade.verdict.notBootable':
    '{name} у цьому зчитуванні не позначено як придатний до запуску, тож оновлення не замінить образу, з якого камера запустилася б.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — слот, у який увійшов завантажувач під час цього запуску, як він це фіксує',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'не зчитано',
  'report.lastStart.noBank': 'камера повідомляє {word}, що не відповідає жодному слоту',
  'report.lastStart.entered':
    'камера повідомляє, що запустилася з {bank:gen} (слово активного слота {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'немає версії',
  'running.why.otherVersion': 'камера повідомляє {version}, а дві збірки має лише {only}',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'камера не відповіла на вердикти слотів (селектори GetFirmwareInfo 6, 7, 8)',
  'running.why.notRead':
    'слот, від якого залежать вердикти, не зчитано, тож відповіді неможливо передбачити',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'камера відповідає {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers} — саме так відповідає для цих слотів збірка 8 Hz 1.3.0.8 ({predicted})',
  'running.why.ff':
    '{answers} — саме так відповідає для цих слотів збірка FF 16 Hz 1.3.0.8 ({predicted})',
  'running.why.both':
    '{answers}, і обидві збірки відповідають для цих слотів саме так, тож слоти їх не розрізняють',
  'running.why.neither':
    '{answers}, що не збігається з жодною збіркою (8 Hz: {plain}; FF 16 Hz: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'Заголовок цього образу не називає версії прошивки, тож неможливо сказати, чи це та збірка, яку виконує камера ({camera}). Перевірте, що це саме той образ, який ви хочете записати.',
  'imageBuild.otherVersion': 'Цей образ — прошивка {image}; камера працює на {camera}.',
  'imageBuild.otherVersionTaken':
    'Цей образ — прошивка {image}; камера працює на {camera}. У цій лінійці камера перевіряє лише, що образ правильно сформований (заголовок і сума слів), а не його версію, тож вона прийме цей образ і, запустившись із цього слота, працюватиме на {image}.',
  'imageBuild.otherVersionUnchecked':
    'Цей образ — прошивка {image}; камера працює на {camera}. Чи приймає ця камера іншу збірку і чи запускає її, не перевірялося.',
  'imageBuild.otherBuild':
    'Цей образ — збірка 8 Hz {version}; камера виконує збірку FF 16 Hz {version}. Під час підтвердження запису збірка 16 Hz звіряє дані з власною формою FF і відхиляє ті, що не проходять, ще до стирання слота (так у її джерельному коді). Запис збірки 8 Hz на таку камеру не пробували.',
  'imageBuild.runningUnknown':
    'Цей образ — збірка 8 Hz {version}. Камера працює на {version}, яка буває у збірках 8 Hz і FF 16 Hz, а її власні відповіді не сказали, яку саме вона виконує, тож неможливо визначити, чи це її збірка.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': 'дані мають {size} Б — замало, щоб вмістити заголовок за 0x200',
  'bootFail.noMagic':
    'немає сигнатури образу за 0x200 (знайдено {found}, завантажувачу потрібно {needs})',
  'bootFail.lengthOutside': 'header.length {length} виходить за межі даних на {size} Б',
  'bootFail.lengthNotPayload': 'header.length {length} не дорівнює довжині даних {size}',
  'bootFail.overStage': '{size} Б перевищує буфер передавання на {max} Б',
  'bootFail.plainSum': 'збережена сума слів {sum}, а завантажувачу 2014 року потрібно 0',
  'bootFail.noFooter': 'немає кінцевого блоку за {offset}: дані закінчуються на {end}',
  'bootFail.footerNotCode':
    'кінцевий блок за {offset} — не «CODE», а завантажувач приймає свій сегментований завантажувальний код',
  'bootFail.footerLength': 'довжина кінцевого блоку не дорівнює header.length {length}',
  'bootFail.keyASum':
    'після розшифрування ключем A цієї камери сума слів — {sum}, а завантажувачу потрібно {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'перевірено контрольною сумою',
  'keyConfidence.structural': 'перевірено лише таблицею векторів',
  'keyConfidence.unverified': 'не перевірено',
  /** `{sum}` is hex. */
  'keyCheck.family': 'ключ перевірено контрольною сумою {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'ключ {phrase}; контрольна сума {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'передавання під власними ключами камери',
  'staging.phrase.slotKeystreamCiphertext': 'передавання під власним ключем образу',
  'staging.phrase.plain': 'передавання без шифрування',
  'staging.phrase.keyAKeystream':
    'передавання так, як застосунок виробника передає образ FF (XOR ключ A)',
  'staging.phrase.verbatim': 'надіслано як є',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank (label form); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    'записано {size} Б у {name:acc} за адресою {address} ({staged}); статус підтвердження запису {status}',
  'written.noReadWindow':
    'ця збірка не називає вікна зчитування для слота, тож контрольного зчитування не було',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'контрольне зчитування не вдалося: {error}',
  'written.readBack': 'зчитано для контролю {size} Б, SHA-256 {sha256}',
  'written.verifyOff': 'перевірку вимкнено: слот не зчитано для контролю',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'байтами, які за планом мав містити слот (образ так, як його зберігає збірка 16 Hz, а не надіслані байти)',
  'readBack.reference.asSent':
    'байтами, які за планом мав містити слот (байти такі, як їх надіслано)',
  'readBack.sizeDiffers':
    'контрольне зчитування має {size} Б, план передбачав {predictedSize} Б: слот НЕ збігається з {reference}',
  'readBack.matchesFolded':
    'слот містить образ так, як його зберігає збірка 16 Hz (а не надіслані байти), а решту слота стерто',
  'readBack.matches':
    'слот збігається з байтами, які передбачав план (незашифрований ланцюжок 2014 року програмує саме те, що йому надіслано)',
  'readBack.differs': 'слот НЕ збігається з {reference} (перша відмінність за зміщенням {offset})',
  'readBack.noHeader':
    'контрольне зчитування не містить заголовка образу за зміщенням {offset} (сигнатура {magic}), тож слот НЕ розшифровується в очікуваний образ',
  'readBack.lengthDiffers':
    'заголовок контрольного зчитування вказує {length} Б, а образ плану має {imageLength} Б: слот НЕ розшифровується в очікуваний образ',
  'readBack.tooShort':
    'контрольне зчитування має {size} Б — замало для образу на {length} Б: слот НЕ розшифровується в очікуваний образ',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'потоком ключа, відновленим із контрольного зчитування ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': 'слот розшифровується в очікуваний образ ({length} Б) {recovered}',
  'readBack.decryptDiffers':
    'слот НЕ розшифровується в очікуваний образ: перша відмінність за зміщенням {offset} в образі під час розшифрування {recovered}',
  'readBack.rawNotCompared':
    'сирі байти: контрольне зчитування показано, але не порівняно (ці байти не розшифровуються в незашифрований образ, який можна передбачити для цієї форми, а пристрій перешифровує те, що зберігає)',
  'readBack.notCompared':
    'порівняння неможливе: план не передбачає ні збережених байтів, ні незашифрованого образу',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'ключ A',
  'keyName.keyA:gen': 'ключа A',
  'keyName.keyA:dat': 'ключу A',
  'keyName.keyA:acc': 'ключ A',
  'keyName.keyA:ins': 'ключем A',
  'keyName.keyA:loc': 'ключі A',
  'keyName.keyB': 'ключ B',
  'keyName.keyB:gen': 'ключа B',
  'keyName.keyB:dat': 'ключу B',
  'keyName.keyB:acc': 'ключ B',
  'keyName.keyB:ins': 'ключем B',
  'keyName.keyB:loc': 'ключі B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'ключ пристрою',
  'keyName.perDevice:gen': 'ключа пристрою',
  'keyName.perDevice:dat': 'ключу пристрою',
  'keyName.perDevice:acc': 'ключ пристрою',
  'keyName.perDevice:ins': 'ключем пристрою',
  'keyName.perDevice:loc': 'ключі пристрою',
  'keyName.thePerDevice': 'ключ пристрою',
  'keyName.thePerDevice:gen': 'ключа пристрою',
  'keyName.thePerDevice:dat': 'ключу пристрою',
  'keyName.thePerDevice:acc': 'ключ пристрою',
  'keyName.thePerDevice:ins': 'ключем пристрою',
  'keyName.thePerDevice:loc': 'ключі пристрою',
  'keyName.applicationKeyA': 'ключ A застосунку',
  'keyName.applicationKeyA:gen': 'ключа A застосунку',
  'keyName.applicationKeyA:dat': 'ключу A застосунку',
  'keyName.applicationKeyA:acc': 'ключ A застосунку',
  'keyName.applicationKeyA:ins': 'ключем A застосунку',
  'keyName.applicationKeyA:loc': 'ключі A застосунку',
  'keyName.applicationKeyB': 'ключ B застосунку',
  'keyName.applicationKeyB:gen': 'ключа B застосунку',
  'keyName.applicationKeyB:dat': 'ключу B застосунку',
  'keyName.applicationKeyB:acc': 'ключ B застосунку',
  'keyName.applicationKeyB:ins': 'ключем B застосунку',
  'keyName.applicationKeyB:loc': 'ключі B застосунку',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'блок ключів 1',
  'keyName.block1:gen': 'блока ключів 1',
  'keyName.block1:dat': 'блоку ключів 1',
  'keyName.block1:acc': 'блок ключів 1',
  'keyName.block1:ins': 'блоком ключів 1',
  'keyName.block1:loc': 'блоці ключів 1',
  'keyName.theDeviceKey': 'ключ пристрою',
  'keyName.theDeviceKey:gen': 'ключа пристрою',
  'keyName.theDeviceKey:dat': 'ключу пристрою',
  'keyName.theDeviceKey:acc': 'ключ пристрою',
  'keyName.theDeviceKey:ins': 'ключем пристрою',
  'keyName.theDeviceKey:loc': 'ключі пристрою',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'невідомий ключ',
  'keyName.unknown:gen': 'невідомого ключа',
  'keyName.unknown:dat': 'невідомому ключу',
  'keyName.unknown:acc': 'невідомий ключ',
  'keyName.unknown:ins': 'невідомим ключем',
  'keyName.unknown:loc': 'невідомому ключі',
  'keys.noKnownKey': 'невідомий',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'незашифрований ланцюжок 2014 року: кожен слот зберігається незашифрованим, тож ключ для передавання не виводиться; передається сам образ як є',
  'keys.evidence.ffVendor':
    'збірка 1.3.0.8 FF (16 Hz): жоден слот, відкритий цим зчитуванням, не зберігається незашифрованим, тож не показано, що камера на незашифрованому ланцюжку 2014 року; образ FF записується у формі виробника, сирі байти надсилаються як є, а незашифрований образ 8 Hz не записується',
  'keys.evidence.ffUntested':
    'запис образу FF пропонується з попередженням UNTESTED (не перевірено): серед зібраних образів немає справжнього завантажувача цієї збірки, тож чи запуститься записаний слот, не виміряно',
  'keys.evidence.line2016':
    'лінійка Compact PRO 2016 року: дані для передавання — це образ XOR потік ключа його власного блока ключів 0, знайденого в образі за значенням, тож жоден ключ цієї камери для цього не потрібен',
  'keys.evidence.checkKeyUnnamed':
    'камера розшифровує отримані дані цим ключем і перешифровує їх під ключем, під яким її завантажувач перевіряє слот; під час цього зчитування цей ключ не названо, і для запису він не потрібен: слот зчитується для контролю як образ, у який він розшифровується',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'камера розшифровує отримані дані цим ключем і перешифровує їх під ключем, під яким її завантажувач перевіряє слот; під час цього зчитування цей ключ не названо ({why}), і для запису він не потрібен: слот зчитується для контролю як образ, у який він розшифровується',
  'keys.evidence.checkKeyNamed':
    'камера розшифровує отримані дані цим ключем і перешифровує їх під {key:ins} {hex} — ключем, під яким її завантажувач перевіряє слот, — тож кожен записаний нею слот зберігається так, як його приймає завантажувач',
  'keys.evidence.checkKeyInferred':
    'камера розшифровує отримані дані цим ключем і перешифровує їх під {key:ins} {hex} — ключем, під яким її завантажувач перевіряє слот (виведено з {bank:gen} — слота, з якого, за словами камери, вона запустилася і в який завантажувач увійшов без своєї перевірки), — тож кожен записаний нею слот зберігається так, як його приймає завантажувач',
  'keys.evidence.checkKeyNamedFrom':
    'камера розшифровує отримані дані цим ключем і перешифровує їх під {key:ins} {hex} — ключем, під яким її завантажувач перевіряє слот (визначено з {bank:gen} — слота, з якого, за словами камери, вона запустилася), — тож кожен записаний нею слот зберігається так, як його приймає завантажувач',
  /** `{source}` is keys.source.*. */
  'keys.evidence.applicationKeyA':
    'робочий застосунок ({bank}, прошивка {firmware}) містить свій ключ A {keyA} за адресою {keyAAt}; джерело — {source}',
  'keys.evidence.applicationKeys':
    'робочий застосунок ({bank}, прошивка {firmware}) містить свій ключ A {keyA} за адресою {keyAAt} (джерело — {source}) і свій ключ B {keyB} за адресою {keyBAt}',
  'keys.source.keyTable': 'таблиця ключів завантажувача',
  /** `{builds}`: firmware versions. */
  'keys.source.applicationPair': 'декодована пара ключів застосунку {builds}',
  'keys.evidence.perDevice':
    'ключ пристрою запрограмовано, тож застосунок перешифровує дані під ним',
  'keys.evidence.noPerDevice':
    'ключ пристрою не запрограмовано, тож застосунок перешифровує дані під власним ключем B',
  'keys.evidence.storeKey':
    'ключ зберігання застосунку — це {key} завантажувача ({hex}), тож записи зберігають кожен слот під ним; {bank}, з якого запущено камеру, містить {held:acc}, який завантажувач теж приймає',
  'keys.evidence.bootedKey':
    '{bank}, з якого запущено камеру, розшифровується {key:ins} ({hex}) — ключем, який пробує завантажувач; ключ зберігання застосунку — не той, що в завантажувача, тож записи зберігають кожен слот під ключем слота, з якого запущено камеру',
  /** `{masks}`: key names joined with commas. */
  'keys.evidence.masks':
    'дані для передавання — це образ XOR потоки ключів {masks:gen}; пристрій зберігає образ під {key:ins}',
  /** `{held}` is a key name or keys.noKnownKey. */
  'keys.evidence.otherBank':
    '{bank}: ключ розшифрування — {held}; за тим самим правилом слот записується під {key:ins} і для перевірки зчитується знову',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'слот, з якого запущено камеру, назвати не вдалося, тож ключ, під яким зберігається слот, із нього не зчитати',
  'keys.refused.notDerived': 'ключі не вдалося отримати',
  'keys.refused.notDecrypted':
    '{bank}, з якого запущено камеру, не розшифровується в образ, тож ключ, під яким він зберігається, не зчитати',
  'keys.refused.noBootKey':
    '{bank}, з якого запущено камеру, не розшифровується жодним ключем, який пробує завантажувач (його ключем A чи ключем зберігання), тож ключ, під яким зберігається слот, із нього не зчитати',
  'keys.refused.keyNotInTable':
    '{bank}, з якого запущено камеру, розшифровується {key:ins}, але таблиця ключів цієї камери цього ключа не містить, тож записати під ним не можна',
  'keys.refused.noApplicationPair':
    'робочий застосунок ({bank}, прошивка {firmware}) не містить жодної з відомих пар ключів (пари завантажувача й декодованих пар застосунку) так, щоб кожна половина траплялася рівно один раз, тож його ключ A неможливо знайти в його образі',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'робочий застосунок ({bank}, прошивка {firmware}) не містить жодної з відомих пар ключів (пари завантажувача й декодованих пар застосунку) так, щоб кожна половина траплялася рівно один раз, тож його ключ A неможливо знайти в його образі (ключ A завантажувача трапляється {count} раз, його ключ B — {keyB})',
    few: 'робочий застосунок ({bank}, прошивка {firmware}) не містить жодної з відомих пар ключів (пари завантажувача й декодованих пар застосунку) так, щоб кожна половина траплялася рівно один раз, тож його ключ A неможливо знайти в його образі (ключ A завантажувача трапляється {count} рази, його ключ B — {keyB})',
    many: 'робочий застосунок ({bank}, прошивка {firmware}) не містить жодної з відомих пар ключів (пари завантажувача й декодованих пар застосунку) так, щоб кожна половина траплялася рівно один раз, тож його ключ A неможливо знайти в його образі (ключ A завантажувача трапляється {count} разів, його ключ B — {keyB})',
    other:
      'робочий застосунок ({bank}, прошивка {firmware}) не містить жодної з відомих пар ключів (пари завантажувача й декодованих пар застосунку) так, щоб кожна половина траплялася рівно один раз, тож його ключ A неможливо знайти в його образі (ключ A завантажувача трапляється {count} раза, його ключ B — {keyB})',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'робочий застосунок ({bank}, прошивка {firmware}) перевіряє отримані дані під власними ключами, перш ніж їх програмувати (декодований код цієї збірки пробує дані під своїм ключем A і своїм ключем зберігання, як її завантажувач пробує слот), а ключ, під яким зберігаються записи, {key} ({hex}), — не її ключ A і не її ключ зберігання, тож камера відхилила б дані з 0x50000, ще нічого не стерши',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'жоден слот не розшифровується в контрольну суму {sum} сімейства {family}',
  'writeRefusal.keyTable': 'таблицю ключів цієї камери не вдалося підтвердити',
  'writeRefusal.whitening':
    'таблиця ключів цієї камери розв’язується при K={k}, але {family} шифрує при K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily': 'за доказами, ця камера — {detected}, а не {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'цю камеру не можна записати звідси: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Збірки Seek 2018 року й новіші (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 і Nano 300. Дамп зчитує 63 з 64 блоків флеш-пам’яті без жодного розблокування; на цих збірках жодне зчитування не досягає блоку за адресою {block}. Прошивка зберігається зашифрованою. Слоти записуються по одному на вкладці «Слоти прошивки».',
  'family.summary.early':
    'Compact 2014 року, старші за 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 і 0.7.0.8. Їхня прошивка не може відповісти на зчитування, яке надсилає дамп, тож «Дамп», «Зчитати всі селектори», повне зчитування на вкладці «Інформація» і вкладка «Слоти прошивки» відхиляють їх після зчитування версії; на 0.3.0.1 команда, з якої починається дамп, натомість підготувала б оновлення прошивки. Прогін Preserve зчитує 0.7.0.7 і 0.7.0.8 іншою командою, на яку ці дві збірки відповідають. Дамп, знятий іншим способом, розшифровується як завжди.',
  'family.summary.compact2016':
    'Збірки Compact PRO 1.0.3.x (1.0.3.0 і 1.0.3.2). На зчитування вони відповідають точно так, як Compact 2014 року, разом із токеном розблокування, тож їх розрізняють за версією і за тим, як зберігаються їхні слоти: зашифрованими, тоді як слоти 2014 року — незашифровані. Камеру 1.0.3.x від самого початку зчитують як це сімейство. Прогін Preserve зчитує всю флеш-пам’ять, а слоти записуються по одному на вкладці «Слоти прошивки».',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    'Compact 2014 року від 0.8.0.0 до 1.3.0.8, серед них збірка FF 16 Hz 1.3.0.8. Камера із заводською прошивкою віддає менше половини своєї флеш-пам’яті, частину — лише за токеном розблокування, який надсилає інструмент; решту прогін Preserve зчитує через тимчасовий патч. Слоти зберігаються незашифрованими, крім збірки FF. Камеру Compact PRO 1.0.3.x зчитують як compact-2016, а сюди вона переходить, лише якщо якийсь слот зберігається незашифрованим або розшифровується в {sum}, як у збірки FF. Слоти записуються на вкладці «Слоти прошивки» на тих збірках, на яких прогін Preserve було виміряно; будь-яка інша збірка 0.x чи 1.x лише зчитується.',
  'family.summary.generic':
    'Камера, якій не відповідає жодне інше сімейство. `seek-fw dump` зчитує її за списком блоків 4.x (вкладка 4.x/Nano її відхиляє), а розшифрування обчислює ключ із самого образу, тож ні те, ні інше не залежить від припущення. Жоден слот не записується: вкладка «Слоти прошивки» відхиляє її, доки камеру не визначено.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'за заголовком образу',
  'detect.source.camera': 'за повідомленням камери',
  'detect.plainArmedNotInForce':
    'звичайний 2-байтовий BeginFirmwareUpgrade активував захищений слот, тож автентифікований канал зчитування не діє',
  'detect.modern.plainRefused':
    'звичайний 2-байтовий BeginFirmwareUpgrade захищеного слота було ВІДХИЛЕНО, чого не робить жодна збірка цієї лінійки — її обробник не перевіряє токен і приймає звичайний канал на кожному слоті',
  'detect.modern.authArmed':
    'захищений слот активовано 18-байтовим автентифікованим селектором; звичайного там ніхто не пробував, тож це не виключає камеру з цієї лінійки',
  'detect.modern.legacyVersion':
    '{said}, прошивка {version} — це стара лінійка 0.x / 1.x (інша нумерація, а не старіша 4.x, — і одна з тих збірок теж дає суму {sum})',
  'detect.modern.noSum':
    'жоден слот не розшифровується в контрольну суму {sum}, якої вимагає завантажувач цього сімейства',
  'detect.modern.sum': 'слот розшифровується в контрольну суму {sum}',
  'detect.modern.version':
    'прошивка {version} належить до лінійки після 2018 року, яку охоплює ця карта селекторів (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'звичайний 2-байтовий BeginFirmwareUpgrade активував захищений слот, тож це не заблокована стара прошивка',
  'detect.modern.none': 'немає доказів, що ця камера належить до лінійки після 2018 року',
  'detect.early.noVersion': 'версію прошивки не повідомлено й не знайдено в заголовку образу',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'прошивка {version} — {first} або новіша, тож її таблиця RPC має getter для GetFeaturedFirmwareData, і діє звичайний шлях зчитування',
  'detect.early.older':
    '{said}, прошивка {version} — старша за {first}, першу збірку, у таблиці методів RPC якої є обробник зчитування (getter) для GetFeaturedFirmwareData',
  'detect.early.noWindow': 'і жодне вікно не вдалося зчитати — саме це й передбачається',
  'detect.generic.fallback':
    'запасний варіант: жодне сімейство прошивок не збіглося впевнено, тож зчитування лишаються доступними, а запис — ні',
  'detect.compact2016.early':
    'прошивка {version} старша за 0.8.0.0 і не має обробника зчитування для GetFeaturedFirmwareData — це early-compact, а не це сімейство',
  'detect.compact2016.modernSum':
    'слот розшифровується в контрольну суму {sum}, яка не є цільовою для цього покоління',
  'detect.compact2016.plainArmed':
    'звичайний 2-байтовий BeginFirmwareUpgrade активував захищений слот, тож ця камера не належить до заблокованої лінійки, спільної для цього сімейства й legacy-auth',
  'detect.compact2016.notLine': 'прошивка {version} не належить до лінійки 0.x / 1.x',
  'detect.compact2016.storedPlain':
    'слот зберігається незашифрованим — обчислення потоку ключа дає тотожний стан, тож збережені слова Є образом, — а це незашифрований ланцюжок 2014 року; слоти цього покоління — xorshift128 під справжнім ключем',
  'detect.compact2016.keyedZero':
    'слот, збережений під справжнім потоком ключа xorshift128, розшифровується в контрольну суму {sum} — це шифр цього покоління',
  'detect.compact2016.zeroSum':
    'слот розшифровується в контрольну суму {sum} — це цільове значення цього покоління',
  'detect.compact2016.refused':
    'і захищений слот відхилив звичайну 2-байтову активацію — це заблокований обробник',
  'detect.compact2016.proLine':
    '{said}, прошивка {version} — лінійка 1.0.3.x Compact PRO 2016 року',
  'detect.compact2016.compactLine':
    '{said}, прошивка {version} — збірка Compact, а не лінійка 1.0.3.x Compact PRO',
  'detect.compact2016.lockedLine':
    '{said}, прошивка {version} — лінійка 0.x / 1.x, спільна для цього покоління і заблокованої старої прошивки',
  'detect.compact2016.bootloader2016':
    'завантажувач повідомляє {version} — завантажувач покоління 2016 року (1.2.0.0 виміряно під Compact PRO 1.0.3.0; у Compact 2014 року — 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'завантажувач повідомляє {version} — це нумерація покоління 2014 року, а не цього',
  'detect.compact2016.none':
    'не помічено, щоб хоч один слот розшифровувався в нульову контрольну суму під справжнім ключем',
  'detect.legacy.proLine':
    'але прошивка {version} — лінійка 1.0.3.x Compact PRO 2016 року, слоти якої мають шифр compact-2016: перевірка контрольної суми цього сімейства не пропустить жодного з них',
  'detect.legacy.early':
    'прошивка {version} старша за 0.8.0.0: її таблиця RPC не має обробника зчитування для GetFeaturedFirmwareData (до 0.7.0.7 його немає взагалі, а на 0.7.0.7 і 0.7.0.8 є лише setter) — це early-compact, а не це сімейство',
  'detect.legacy.keyedZero':
    'слот, збережений під справжнім потоком ключа xorshift128, розшифровується в {zero} — це шифр Compact PRO 2016 року (compact-2016). Ця лінійка зберігає слоти незашифрованими із сумою слів 0 (ланцюжок 2014 року) або з ключем до {sum} (Compact 1.3.0.8), і її перевірка контрольної суми такий слот не пропускає',
  'detect.legacy.plainChain':
    'слот зберігається як незашифрована прошивка, сума слів якої дорівнює 0, — так її запускає завантажувач 2014 року цієї лінійки',
  'detect.legacy.refused':
    'камера відмовилася відкрити заблокований слот для оновлення, коли її просили без розблокування, — так робить лише це покоління прошивки',
  'detect.legacy.unlocked':
    'і відкрила той самий слот, коли її попросили з розблокуванням, тож розблокування, яке надсилає це сімейство, — саме те, яке перевіряє ця камера',
  'detect.legacy.notLine': '{said}, прошивка {version} — не належить до старої лінійки 0.x / 1.x',
  'detect.legacy.authOnly':
    'вона відкрила заблокований слот для оновлення, коли її попросили з розблокуванням, як робить це покоління прошивки; без розблокування не пробували, тож лише цього недостатньо, щоб довести покоління',
  'detect.legacy.version':
    'прошивка {version} належить до старої лінійки 0.x / 1.x — це інша нумерація, ніж у версій застосунку після 2018 року, а не старіша 4.x',
  'detect.legacy.none': 'ніщо зі спостереженого не вказує на автентифікований канал зчитування',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{id}`: the table entry's name; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'відкликано після прогону на камері: там патч не підвищив частоту публікації кадрів, а затвор спрацьовував на кожному кадрі після запису',
  'fps.table.predates':
    'прошивка {version} старша за 0.8.0.0: її таблиця RPC не має обробника зчитування для GetFeaturedFirmwareData — команди, яку надсилає зчитування слота, — тож сторінка слотів не зчитує й не записує жодного слота цієї збірки, і патч не пропонується',
  'fps.table.stageTwoFf':
    'stage two: збірка FF 16 Hz передається так, як її передає застосунок виробника (образ XOR ключ A, зберігається під ключем B), а не як звичайні байти, тож її перевірку передавання не виконано, і патч поки не пропонується',
  'fps.table.stageTwo':
    'stage two: цього запису немає в наборі stage two, тож його перевірку передавання не виконано, і патч поки не пропонується',
  'fps.table.notOffered': 'не пропонується',
  'fps.table.notImage': 'це не образ прошивки, тож патч частоти кадрів до нього не застосовується',
  'fps.table.otherBuild':
    'образ — збірка {image} («{id}»), але камера повідомляє {camera}; патч відхилено, щоб не застосувати його до збірки, якій він не відповідає',
  'fps.table.otherBuildNoVersion':
    'образ — збірка {image} («{id}»), але камера не повідомляє версії; патч відхилено, щоб не застосувати його до збірки, якій він не відповідає',
  'fps.table.patched': 'патч частоти кадрів уже застосовано: цей образ працює на {hz} Hz',
  'fps.table.earlierPatch':
    'цей образ містить ранніший патч частоти кадрів {hz} Hz без виправлення USB, а патч ніколи не застосовується до пропатченого образу: відновіть заводський образ, потім пропатчте його',
  'fps.table.atRate': 'ця збірка вже працює на {hz} Hz без патча',
  'fps.table.not4821':
    'цей образ повідомляє збірку Compact 4.8.2.1 (або Compact XR 4.8.2.1, ту саму збірку), але це не той заводський образ, для якого написано патч частоти кадрів (f96ac57eda75: його 68-байтові сторінки команд, стабільна сторінка 13), тож патч частоти кадрів для нього не створюється',
  'fps.table.notInTable':
    'цього образу немає в таблиці патчів частоти кадрів, тож для цієї збірки патч не створюється. Таблиця містить збірки Compact від 0.7.0.8 до 1.3.0.8 (8 Hz; 0.7.0.8 відхиляє код слотів), 1.3.0.8 (FF 16 Hz), 4.8.1.7, 4.8.1.9, 4.8.2.1 і 4.16.1.7 FF та збірки Compact PRO 1.0.3.x і 4.9.x; інших збірок у ній немає',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'план цієї збірки не має {bank:gen}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank} не може прийняти розшифрований образ на цій збірці: {reason}',
  'fps.plan.empty': '{bank} не має розшифрованого образу для патча (він порожній)',
  'fps.plan.noImage':
    '{bank} не має розшифрованого образу для патча (його не зчитано, або жоден ключ його не відкриває)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name} записано, але його контрольне зчитування відрізняється від збереженого слота не лише так, як заплановано, тож наступні слоти не записано',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build, a bank or an empty bank (slots/capability-notes) ----
   * Mode numbers, addresses, version numbers and command names (CompleteMemoryUpgrade, BeginFirmwareUpgrade,
   * EP0, PRESERVATION.md) are names: keep them. `{untested}` is notes.ffBootUntested. */
  /** "This line" is the firmware line (the 2014 0.x/1.x builds, as in notes.token), not a line of text: on these builds, the bank the page or the CLI calls booted is the one the camera entered at its last start. */
  'notes.lockedBootWord':
    'Слот, названий запущеним на цій лінійці прошивок, — це слот, з якого камера запустилася востаннє, як його фіксує слово активного слота (0 — слот A, 1 — слот B, 2 — слот відновлення R). Наступний запуск задає слово конфігурації запуску: 0 або 0xFFFFFFFF — спершу A, 1 — спершу B, будь-яке інше значення — спершу слот відновлення R. Слот відновлення R запускається щоразу, коли в A і B немає нічого, що приймає завантажувач 2014 року (слота, сума слів якого дорівнює 0), хоч би що містив R (виміряно на камері).',
  /** "This line" is the firmware line (the 2016 Compact PRO 1.0.3.x builds), not a line of text: on these builds, the bank the page or the CLI calls booted is the one the camera entered at its last start. */
  'notes.locked2016BootWord':
    'Слот, названий запущеним на цій лінійці прошивок, — це слот, з якого камера запустилася востаннє, як завантажувач фіксує його в слові активного слота (0 — слот A, 1 — слот B, 2 — слот відновлення R). Наступний запуск задає слово конфігурації запуску: 0 або 0xFFFFFFFF — спершу A, 1 — спершу B, будь-яке інше значення — спершу слот відновлення R. Завантажувач 2016 року приймає слот, лише якщо той розшифровується в суму слів 0 під ключем, під яким він перевіряє слот (блок ключів 1 на завантажувачі 1.2.0.0), а останній слот цього порядку запускається без перевірки, коли два інші не проходять. Зчитування визначає цей ключ зі слота, з якого запустилася камера, бо блок завантажувача, що його містить, відхиляється на кожному каналі (виміряно на камері).',
  'notes.ep0of1032':
    '1.0.3.2: сеанси EP0 обриваються приблизно на 64–81 КБ, а 128 Б — одиниця зчитування без втрат, тож виміряна межа — один слот на 64 КБ за сеанс. Повне зчитування всієї мікросхеми на цій збірці відхиляється (PRESERVATION.md: повного зчитування за одну активацію не існує). Дамп слота зчитує по одному слоту, запитами по 64 байти.',
  'notes.token':
    'На цій лінійці слоти заблоковані: камера відкриває слот для запису, лише якщо її попросити з розблокуванням цієї лінійки, а воно однакове в усіх 22 відомих образах прошивки цієї лінійки. Камера з іншим розблокуванням відхиляє свої слоти.',
  'notes.staging.lockedPlain':
    'Передається: сам образ, щонайбільше 56 КБ (найбільше, що камера приймає за один запис). Запис стирає слот на 64 КБ і записує саме ці байти, а решта слота читається як стерта. Завантажувач запускає слот, лише якщо сума його слів дорівнює 0, тож перед надсиланням образ балансується до цієї суми.',
  'notes.staging.locked2016':
    'Передається: образ, XOR із потоком ключа xorshift128 його ВЛАСНОГО блока ключів 0 (ключ передавання, знайдений в образі за значенням), лише довжина образу (щонайбільше 0xE000 байтів). Пристрій розшифровує дані цим ключем і зберігає їх під ключем, під яким його завантажувач перевіряє слот (блок ключів 1), тож збережені байти — не ті, що передано. Для передавання з цільового слота нічого не зчитується: потік ключа слота використовується лише для контрольного зчитування.',
  'notes.staging.modern':
    'Передається: увесь слот на 64 КБ — образ + заповнення 0xFF + кінцевий блок «CODE». Образ XOR із потоками ключів, завдяки яким два власні проходи робочого застосунку зберігають його під ключем, що його має слот, з якого запущено камеру: коли команда підтвердження запису (CompleteMemoryUpgrade) приймає тип даних 7, 8 або 9, застосунок розшифровує отримані дані своїм ключем A, перешифровує їх під своїм ключем зберігання й програмує слот. Саме кінцевий блок дає змогу завантажувачу прийняти слот, тож слот без нього відхиляється.',
  'notes.modernGap':
    'Слот B на цій лінійці — 0x14050000 (режим 8). Жоден селектор не досягає 0x14060000 на жодній збірці 2.x, 4.x, 10.x, 42.x чи 44.x (декодовано з 14 зібраних образів після 2018 року), тож слота там немає. Розкладка з 0x14060000 належить заблокованій лінійці 0.x/1.x.',
  'notes.modernNamedWrite':
    'Іменовані записи (режими 7–9) декодовано з прошивки. Емулятор записує через них A, B і R на збірках 4.x, а на камері слот A Compact XR 4.8.2.1 записано через режим 7 патчем частоти кадрів. Запис слота ніколи не активує режим 0 — ціль оновлення.',
  'notes.unverified':
    'Лише зчитування. Розкладка слотів — декодована таблиця заблокованої лінійки, але для цієї збірки не виміряно жодної форми передавання, тож запис не планується.',
  'notes.empty.plain':
    'Порожній слот приймає образ точно так само, як зайнятий. Незашифрований ланцюжок передає байти образу як є, без ключа, а підтвердження запису спершу стирає блок, тож із цільового слота нічого не зчитується. Виміряно на Compact: образ, записаний у порожній слот B, під час контрольного зчитування збігся, і камера запустилася лише з B.',
  'notes.empty.modern':
    'Порожній слот приймає образ точно так само, як зайнятий. Дані шифруються ключами, отриманими зі слота, з якого запущено камеру, і з робочого застосунку, а не з цільового слота, а пристрій перешифровує їх і стирає блок, не зчитуючи його. Кінцевий блок копіюється зі слота, що має правильний, інакше створюється порожнім. Доведено на емуляторі; на камері ще не виміряно.',
  'notes.empty.locked2016':
    'Порожній слот приймає образ точно так само, як зайнятий. Ключ передавання — блок ключів 0 власної пари ОБРАЗУ, а не ключ, зчитаний із цільового слота, і пристрій розшифровує ним дані, зберігає їх під власним ключем і стирає блок, не зчитуючи його. Доведено на емуляторі; на камері ще не виміряно.',
  'notes.mode2of080':
    '0.8.0.0: режим 2 (0x14000000) на цій збірці загрожує збоєм — активоване зчитування виходить за межі SRAM (PRESERVATION.md). Зчитування чи запис слота активує лише режими 7–9 і ніколи — режим 2.',
  'notes.keyPairs2016':
    'Збірки 9 Hz 1.0.3.0 і 1.0.3.2 мають спільну пару ключів, а збірки FF — іншу. Рядок версії їх не розрізняє, тож потік ключа відновлюється із самого слота, і вирішує власний образ слота.',
  'notes.board1030':
    'Застосунок 1.0.3.0 перезавантажується на будь-якій платі, крім плати Compact Pro, тож плата Compact виконує його лише з патчем плати у своїх слотах.',
  'notes.bank.modernA':
    'Записується через активацію слота, якої немає в сучасній карті; Compact XR 4.8.2.1 прийняв через неї запис на камері.',
  'notes.bank.recovery2016':
    'Виміряно на Compact PRO 1.0.3.0: слот відновлення R прийняв власний образ, зміну одного байта й сирі байти в тому вигляді, як їх надіслано, — кожен запис без помилки.',
  'notes.bank.ff1308A':
    'Образ 1.3.0.8 FF (16 Hz) потрапляє сюди у формі, у якій його надсилає застосунок виробника, і камера зберігає його під власним ключем. Завантажувач 2014 року запускає слот, лише якщо сума його слів дорівнює 0, тож під час запуску пропускає цей слот; чи запускається збірка 16 Hz зі слота A — UNTESTED (не перевірено). Образ 8 Hz записується як є.',
  'notes.bank.ff1308B':
    'Образ 1.3.0.8 FF (16 Hz) потрапляє сюди у формі, у якій його надсилає застосунок виробника, і камера зберігає його під власним ключем. Завантажувач 2014 року запускає слот, лише якщо сума його слів дорівнює 0, тож під час запуску пропускає цей слот; чи запускається збірка 16 Hz зі слота B — UNTESTED (не перевірено). Образ 8 Hz записується як є.',
  'notes.bank.ff1308R':
    'Образ 1.3.0.8 FF (16 Hz) потрапляє сюди у формі, у якій його надсилає застосунок виробника, і камера зберігає його під власним ключем. Завантажувач 0.9.0.0 запускає слот відновлення R у збереженому вигляді, не декодуючи його, тож ця форма може не запуститися: UNTESTED (не перевірено), хоча ранніша форма цього образу звідси запускалася (виміряно на камері). Образ 8 Hz записується як є.',
  'notes.product.4_8_2_1':
    'Compact 4.8.2.1 і Compact XR 4.8.2.1 (один образ): сучасна карта на 63 вікна; емулятор підтвердив 63 з 63 вікон на повному дампі Compact і на дампі Compact XR.',
  'notes.product.10_9_1_31':
    'Mosaic 320x240 10.9.1.31: сучасна карта на 63 вікна; на емуляторі виміряно, що підтверджується кожне вікно.',
  'notes.product.2_27_1_33':
    'Mosaic 320x240 FF 2.27.1.33: сучасна карта на 63 вікна; на емуляторі виміряно, що підтверджується кожне вікно.',
  'notes.product.42_32_3_10':
    'Nano 200 42.32.3.10: сучасна карта на 63 вікна; на емуляторі виміряно, що підтверджується кожне вікно. Її команда підтвердження запису (CompleteMemoryUpgrade) не має обробника для типу даних 32, якого запис через режим 7, 8 чи 9 ніколи не запитує.',
  'notes.product.44_27_3_10':
    'Nano 300 44.27.3.10: сучасна карта на 63 вікна; на емуляторі виміряно, що підтверджується кожне вікно. Її команда активації (BeginFirmwareUpgrade) відхиляє тип даних поза прийнятним діапазоном (0x7F) як хибний перший аргумент, а режими 7–9 лежать у цьому діапазоні.',
  'notes.ff1308':
    '1.3.0.8-FF (16 Hz) повідомляє ту саму версію, що й збірка 8 Hz. Зчитування розрізняє їх за камерою: камера для кожного слота каже, чи приймає його застосунок, а відповіді кожної збірки можна передбачити за слотами. Образ FF надсилається у формі, у якій його надсилає застосунок виробника, і камера зберігає його під власним ключем. Він іде в слот A, слот B чи слот відновлення R. Очікується, що збірка 8 Hz відхилить його, ще нічого не записавши; поки відповіді камери не розрізняють збірок, план каже, що з ним зробить кожна збірка. {untested}',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'камера не повідомила версію прошивки ({note}); номер команди означає не те саме в кожній прошивці Seek — на Compact 0.3.0.1 wire id 0x52, який активує вікно зчитування, — це EnterBootloaderMode, — тож доки версія невідома, надсилаються лише GetErrorCode, GetOperationMode і GetFirmwareInfo — зчитування, на які кожна збірка відповідає однаково',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo не відповіла ({error}) на жодне з {reads} зчитувань з інтервалом {spacing} мс — це вікно запуску в {window} мс; камера, яка ще запускається, відповідає в його межах',
  'identity.note.neverTwice':
    'GetFirmwareInfo жодного разу не відповіла двічі поспіль за {reads} зчитувань',
  'identity.note.noAnswer': 'GetFirmwareInfo не відповіла ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo не відповіла ({error}); відповіли {answered} з {reads} зчитувань, жодного разу двічі поспіль, тож жодну з відповідей не можна відрізнити від запису, який залишила вибраним попередня команда',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo повернула {count} байт — замало для версії',
    few: 'GetFirmwareInfo повернула {count} байти — замало для версії',
    many: 'GetFirmwareInfo повернула {count} байтів — замало для версії',
    other: 'GetFirmwareInfo повернула {count} байта — замало для версії',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo повернула {count} байт — замало для версії; {context}',
    few: 'GetFirmwareInfo повернула {count} байти — замало для версії; {context}',
    many: 'GetFirmwareInfo повернула {count} байтів — замало для версії; {context}',
    other: 'GetFirmwareInfo повернула {count} байта — замало для версії; {context}',
  },
  'identity.note.otherRecord':
    'перше зчитування повернуло інший запис ({version}), на якому попередня команда залишила селектор firmware-info, — це зчитування його скинуло',
  'identity.note.afterStartup': {
    one: 'вона відповіла після того, як відхилила {count} зчитування під час запуску',
    few: 'вона відповіла після того, як відхилила {count} зчитування під час запуску',
    many: 'вона відповіла після того, як відхилила {count} зчитувань під час запуску',
    other: 'вона відповіла після того, як відхилила {count} зчитування під час запуску',
  },
  'identity.predates':
    'прошивка {version} старша за протокол дампу: її таблиця методів RPC не має обробника зчитування для GetFeaturedFirmwareData (на 0.7.0.7 і 0.7.0.8 він зареєстрований лише як setter, а до того wire id 0x4F — це UploadFirmwareRowSize), тож жодне вікно ним не зчитати; на 0.3.0.1 wire id 0x52 — це EnterBootloaderMode, а не BeginFirmwareUpgrade. Прогін Preserve натомість зчитує 0.7.0.7 і 0.7.0.8 через wire id 0x58 (GetFeaturedData)',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': '{operation} відхилено: {reason}',
  'identity.refusingNoVersion':
    '{operation} відхилено: {reason}. Нічого не активовано. Від’єднайте камеру, під’єднайте знову, дочекайтеся, поки вона повністю запуститься, і спробуйте ще раз.',
  'identity.operation.dump': 'дамп',
  'identity.operation.dumpAll': 'зчитування всіх селекторів',
  'identity.operation.readInfo': 'зчитування інформації про пристрій',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'слоти вибирають після резервного копіювання, яке їх зчитує, — спершу виконайте резервне копіювання',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'слоти не можна змінити, щойно підтвердження запису виконано чи була спроба його виконати: слоти, які записує цей прогін: {banks}; відновлення повертає саме їх',
  'preserve.banks.none': 'жодного',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Записано.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Зчитано. Доступно для зчитування слотів: {count}/{of}.',
  'status.readRefused':
    'Зчитано, але жоден слот цієї камери не можна записати звідси — див. журнал.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Версія прошивки',
  'compare.field.imageId': 'Ідентифікатор образу',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'Початковий SP',
  'compare.field.resetVector': 'Вектор скидання',
  'compare.field.size': 'Розмір',
  'compare.field.shaExpected': 'SHA-256 очікуваного розшифрованого образу',
  'compare.field.sha': 'SHA-256 образу',
  'compare.field.shaNotStored':
    'SHA-256 очікуваного розшифрованого образу (збережені байти не передбачено)',
  'compare.field.key': 'Ключ',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(немає образу)',
  'compare.notImage': '(не образ)',
  'compare.notPredicted': '(не передбачено: що зберігати, вирішує пристрій)',
  'compare.plaintext': 'немає (незашифровано)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'не вдалося двічі зчитати однаково',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (ключ, під яким завантажувач перевіряє слот, виведено з {bank:gen}, у який він увійшов без перевірки) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered': '{bank}, як це фіксує камера (слово активного слота {word})',
  'preserve.lastStart.notRead': 'невідомо — слово активного слота не вдалося зчитати',
  'preserve.lastStart.noBank':
    'невідомо — слово активного слота {word}, що не відповідає жодному слоту',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'невідомо — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'не записується — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'образ',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — можна записати',
  'preserve.bank.writablePatch': '{build} — можна записати; патч змінює байтів: {count}',
  'preserve.bank.writableEdit': '{build} — можна записати; містить {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — можна записати; патч змінює байтів: {count}; містить {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead':
    'резервне копіювання ще не зчитало слоти, тож жоден слот не можна вибрати',
  'preserve.choice.every': 'усі слоти з образом: {banks}',
  'preserve.choice.everyBlocked':
    'усі слоти з образом записати не можна: {bank} не можна — {reason}',
  'preserve.choice.noImage': 'жоден слот не містить образу, який прогін може записати',
  'preserve.choice.nextStart': '{bank} — слот, з якого відбудеться наступний запуск: {why}',
  'preserve.choice.nextStartRefused':
    'наступний запуск відбудеться з {bank:gen} ({why}), а прогін не може його записати: {reason}',
  'preserve.choice.everyUnknownStart':
    'усі слоти з образом ({banks}): невідомо, з якого слота відбудеться наступний запуск ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'невідомо, з якого слота відбудеться наступний запуск ({why}), і {reason}; виберіть слот за назвою',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank} не можна записати: {reason}',
  'preserve.choice.byName': '{banks} — слот, вибраний за назвою',
  'preserve.choice.warnNotPatched':
    'Наступний запуск відбудеться з {bank:gen} ({why}), а цей вибір його не пропатчує: після перезапуску камера запустить власний образ цього слота, тож повне зчитування зупиниться, нічого не зчитавши. Відновлення однаково поверне кожен записаний слот.',
  'preserve.choice.warnUnknownStart':
    'Невідомо, з якого слота відбудеться наступний запуск ({why}). Якщо це буде слот, який цей вибір не пропатчує, повне зчитування зупиниться, нічого не зчитавши.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'ще невідомо',
  'preserve.build.firmware': 'прошивка {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'у тому вигляді, у якому його зберігає камера (ця камера зберігає прошивку незашифрованою)',
  'preserve.stagedForm.oneKey':
    'у тому вигляді, у якому його зберігає камера (зашифрованим ключем камери)',
  'preserve.stagedForm.twoKeys':
    'у тому вигляді, у якому його зберігає камера (зашифрованим двома ключами камери)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'кожен записаний слот отримує назад точно ті байти, які з нього зчитала резервна копія',
  'preserve.restoreForm.factoryStaged':
    'кожен записаний слот отримує назад свою оригінальну прошивку, записану у формі, у якій її зберігає камера, тож у підсумку слот побайтово такий, яким його зчитала резервна копія',
  'preserve.restoreForm.none':
    'неможливо на цій збірці: жодна форма оригінальної прошивки не проходить власну перевірку камери й водночас не зберігається назад як оригінальні байти, тож прогін завершується повним образом, а патч лишається на місці',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'неможливо на цій збірці: пропатчена прошивка не може зчитати всю флеш-пам’ять, тож прогін не дасть повного образу',
  'preserve.drain.rotated': 'камера віддає її зі зсувом, і прогін відновлює порядок',
  'preserve.drain.hazard': 'патч обходить зчитування, яке на цій збірці спричиняє збій камери',
  'preserve.drain.whole': 'уся флеш-пам’ять на 4 МБ за одне зчитування, порціями по {size} Б',
  'preserve.drain.wholeNotes':
    'уся флеш-пам’ять на 4 МБ за одне зчитування, порціями по {size} Б; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'дає команді зчитування камери доступ до всієї флеш-пам’яті на 4 МБ, а не лише до перших 64 КБ',
  'preserve.site.countPast':
    'дає змогу позиції зчитування рахувати далі 64 КБ, щоб зчитування не поверталося на початок',
  'preserve.site.keepPosition':
    'зберігає повну позицію зчитування, коли вона зсувається після кожного зчитування',
  'preserve.site.savePosition': 'зберігає зсунуту позицію зчитування повністю',
  'preserve.site.clearPosition':
    'очищає всю позицію зчитування на початку кожного зчитування, щоб камеру можна було зчитувати й після повного зчитування',
  'preserve.site.modeTwoGuard':
    'дає змогу повному зчитуванню починатися, як і будь-якому іншому (заводська прошивка його не допускає)',
  'preserve.site.modeTwoIndirection':
    'спрямовує повне зчитування на початок флеш-пам’яті (заводська прошивка спрямовує його на значення, яке спричиняє збій камери)',
  'preserve.site.armTail':
    'прибирає виклик, який на цій збірці заморожує камеру на початку зчитування',
  'preserve.site.other': 'змінює одну інструкцію, потрібну для повного зчитування',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Резервне копіювання',
  'preserve.step.patch': 'Патч',
  'preserve.step.commit': 'Запис',
  'preserve.step.drain': 'Повне зчитування',
  'preserve.step.restore': 'Відновлення',
  'preserve.step.verify': 'Перевірка',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'крок «Патч»',
  'preserve.stepId.commit': 'крок «Запис»',
  'preserve.stepId.drain': 'крок «Повне зчитування»',
  'preserve.stepId.restore': 'крок «Відновлення»',
  'preserve.stepId.verify': 'крок «Перевірка»',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: зупинено за планом — камера запустила {bank:acc}, який цей прогін не пропатчував, тож нічого не зчитано.',
  'preserve.result.noReason': 'причину не зафіксовано',
  'preserve.result.stopped': '{label}: зупинено — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none': 'жоден слот не містить прошивки, яку прогін може пропатчити',
  'preserve.result.writable.one': '{banks} містить прошивку, яку прогін може пропатчити',
  'preserve.result.writable.many': '{banks} містять прошивку, яку прогін може пропатчити',
  'preserve.result.backup':
    '{label}: збережено кожен блок, доступний звичайному зчитуванню; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'невідомий слот',
  'preserve.result.backupNext':
    '{label}: збережено кожен блок, доступний звичайному зчитуванню; {writable}; наступний запуск: {next}.',
  'preserve.result.patch': '{label}: створено для слотів: {banks}.',
  'preserve.result.patchCount':
    '{label}: створено для {banks:gen}; у кожному змінюється байтів: {count}.',
  'preserve.result.commitOne': '{label}: {banks} записано з патчем, і камера його прийняла.',
  'preserve.result.commitMany': '{label}: {banks} записано з патчем, і камера прийняла кожен.',
  'preserve.result.drainNotRead': '{label}: не зчитано.',
  'preserve.result.drain':
    '{label}: зчитано всю флеш-пам’ять на 4 МБ; sha256 повного образу — {sha256}.',
  'preserve.result.drainThrough':
    '{label}: зчитано всю флеш-пам’ять на 4 МБ через {bank:acc}; sha256 повного образу — {sha256}.',
  'preserve.result.restore': '{label}: {banks} записано назад.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}: {banks} записано назад {form}.',
  'preserve.result.verifyDone': '{label}: готово.',
  'preserve.result.verifyIdentical':
    '{label}: ще раз зчитано блоків: {blocks}, відмінних байтів 0 — флеш-пам’ять камери побайтово ідентична резервній копії.',
  'preserve.result.verifyDiffers':
    '{label}: ще раз зчитано блоків: {blocks}, відмінних байтів: {bytes}.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: ще раз зчитано блоків: {blocks}, відмінних байтів: {bytes}, не вдалося зчитати блоків: {count}.',
    few: '{label}: ще раз зчитано блоків: {blocks}, відмінних байтів: {bytes}, не вдалося зчитати блоків: {count}.',
    many: '{label}: ще раз зчитано блоків: {blocks}, відмінних байтів: {bytes}, не вдалося зчитати блоків: {count}.',
    other:
      '{label}: ще раз зчитано блоків: {blocks}, відмінних байтів: {bytes}, не вдалося зчитати блоків: {count}.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Зупинено перед повним зчитуванням: камера запустила слот, який цей прогін не пропатчував, тож нічого не зчитано.',
  'preserve.unpatchedStart.next':
    'Далі: відновлення поверне кожен записаний слот. Повне зчитування більше не пробується: камера запустила б той самий слот.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Готово — вашу прошивку збережено',
  'preserve.done.detail':
    'Повний образ — це вся оригінальна флеш-пам’ять камери, а сама камера повернулася точно в той стан, у якому була.',
  'preserve.done.titleNoImage':
    'Готово — камера повернулася в попередній стан; повного образу немає',
  'preserve.done.detailNoImage':
    'Повне зчитування не виконувалося, тож у цього прогону немає повного образу флеш-пам’яті. Кожен записаний слот повернуто, а нове зчитування блоків, доступних звичайному дампу, збігається з резервною копією. Щоб отримати повний образ, почніть новий прогін із вибором, який включає слот наступного запуску.',
  'preserve.done.detailNoImageCount':
    'Повне зчитування не виконувалося, тож у цього прогону немає повного образу флеш-пам’яті. Кожен записаний слот повернуто, а нове зчитування блоків, доступних звичайному дампу (їх {blocks}), збігається з резервною копією. Щоб отримати повний образ, почніть новий прогін із вибором, який включає слот наступного запуску.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'зчитувач вікон камери має обмежений ресурс на кожен запуск, і ці зчитування повернулися від вичерпаного зчитувача — вимкніть і ввімкніть живлення камери (від’єднайте й під’єднайте її знову або скористайтеся її вимикачем), потім знову запустіть `preserve --resume <run-directory>`. Сигнатура: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'зчитувач вікон камери має обмежений ресурс на кожен запуск, і ці зчитування повернулися від вичерпаного зчитувача — вимкніть і ввімкніть живлення камери (від’єднайте й під’єднайте її знову або скористайтеся її вимикачем), потім знову запустіть `preserve --resume <run-directory>`. Сигнатура: {signature} — із цих байтів не вдається отримати заводський розшифрований образ. Випробувано кожен спосіб його зчитати:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'резервна копія не містить {bank:gen} ({address}) — заводські вікна не можуть його віддати',
  'preserve.fail.readsDisagree':
    'два зчитування {bank:gen} не збігаються (sha256 {sha256} проти {other}) — у камеру, яка не може двічі поспіль однаково віддати слот, з якого працює, записувати не можна; знімок — джерело для відновлення і вхідні дані для обчислення патча',
  'preserve.fail.notFactory':
    '{bank} не містить заводського образу в тому вигляді, як його зберігає шифр цієї збірки (очікуваний початок образу не збігається зі знімком), — відмова ще до того, як щось буде зафіксовано, а тим паче записано',
  'preserve.fail.ffSum':
    'пропатчена прошивка у формі, у якій її зберігає камера, не проходить власну перевірку цієї збірки (її сума має бути {sum}) — відмова надсилати слот, який камера відхилила б уже після стирання',
  'preserve.fail.headChanged':
    'початок {bank:gen} змінився після резервного копіювання (він не містить ні оригінального знімка, ні пропатчених байтів) — відмова записувати поверх невідомого стану слота; нічого не записано. Початок у hex: зараз {live}, у знімку {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks} уже містить пропатчені байти — підтвердження запису відбулося під час попередньої спроби, і повторювати його не можна. Продовжте з кроку повного зчитування (--resume), який запустить пропатчений образ і продовжить звідти.',
  'preserve.fail.landed':
    '{banks} уже містять пропатчені байти — підтвердження запису відбулося під час попередньої спроби, і повторювати його не можна. Продовжте з кроку повного зчитування (--resume), який запустить пропатчений образ і продовжить звідти.',
  'preserve.fail.drainRebootRefused':
    'команду перезапуску для повного зчитування хост ВІДХИЛИВ ще до відправлення (SecurityError: політика браузера або захист тесту), тож камера досі працює з образом, з яким запустилася, а не із записаним патчем. Повне зчитування читає лише через розширене вікно пропатченого образу, тож воно зупиняється, нічого не активувавши; нічого не зчитано. Запустіть повне зчитування ще раз там, де хост пропускає команду перезапуску.',
  'preserve.fail.shiftedRebootRefused':
    'повне зчитування повернулося зі зсувом на одну сторінку вгору, а перезапуск, потрібний для нового запуску, хост ВІДХИЛИВ ще до відправлення (SecurityError: політика браузера або захист тесту) — ще одна спроба зчитала б той самий зсунутий запуск. Нічого не збережено; запустіть повне зчитування ще раз там, де скидання може пройти.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
    few: 'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
    many: 'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
    other:
      'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
  },
  'preserve.fail.verifyIn': {
    one: 'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах (місця: {places}) — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
    few: 'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах (місця: {places}) — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
    many: 'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах (місця: {places}) — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
    other:
      'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах (місця: {places}) — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
  },
  'preserve.fail.verifyShort': {
    one: 'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах (короткі вікна: {short}) — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
    few: 'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах (короткі вікна: {short}) — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
    many: 'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах (короткі вікна: {short}) — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
    other:
      'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах (короткі вікна: {short}) — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
  },
  'preserve.fail.verifyInShort': {
    one: 'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах (місця: {places}) (короткі вікна: {short}) — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
    few: 'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах (місця: {places}) (короткі вікна: {short}) — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
    many: 'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах (місця: {places}) (короткі вікна: {short}) — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
    other:
      'перевірка зчитала відмінних байтів: {count} у {read}/{total} вікнах (місця: {places}) (короткі вікна: {short}) — повторне зчитування мікросхеми не побайтово ідентичне резервній копії',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'блок конфігурації запуску',
  'preserve.fail.dataBlock': 'блок даних',

  'preserve.refused.secondRead': 'його друге зчитування не вдалося ({error})',
  'preserve.refused.readsDisagree':
    'два його зчитування не збігаються (sha256 {sha256} проти {other})',
  'preserve.refused.erased': 'він стертий',
  'preserve.refused.watchdogMark':
    'його слово заголовка за +0x200 містить {word} — позначку, яку завантажувач записує поверх слота після скидання сторожовим таймером на початку запуску; завантажувач більше не приймає цей слот, і прогін не має там образу для патча',
  'preserve.refused.noHeader': 'він не містить заголовка образу за +0x200',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'він містить {image} ({id}), а не збірку, яку виконує камера ({camera})',
  'preserve.refused.otherKey':
    'перевірка завантажувача його відхиляє: він зберігається під іншим ключем, ніж той, під яким завантажувач цієї камери перевіряє слоти, а запис через камеру зберіг би його під тим ключем, тож відновлення не змогло б повернути його точні байти',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'камера повідомляє прошивку {camera}, а потрібна {version} — патч обчислено з байтів однієї збірки, і надсилати його в іншу не можна',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'прошивка {version} — не збірка 0.x чи 1.x, а цей прогін охоплює лише збірки 2014 і 2016 років. Крім версії, нічого не зчитано. Натомість зчитайте цю камеру на вкладці «Дамп і розшифрування 4.x/Nano»: вона зчитує флеш-пам’ять без патча, кожен блок, крім блоку за адресою 0x14060000, до якого на цих збірках не дістає жодне вікно зчитування.',
  'preserve.refused.preWidening':
    'прошивка {version} старша за маршрут розширення, і прогін відмовляється, щоб не записувати поверх слота, який він не може зчитати для контролю. На цьому поколінні камера відкидає кожен спосіб почати зчитування, потрібний цьому маршрутові (виміряно на 0.3.0.1), її команда зчитування не дістає до початку флеш-пам’яті, а розмір, який змінив би патч, зберігається інакше. Зчитування, яким міг би скористатися звичайний дамп, у неї теж немає. Крім версії, нічого не зчитано.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'містить невідомий образ (не заводську прошивку {version} і не відому Preserve її зміну), тож Preserve його не патчить і не повертає',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'містить відому збірку зі зміненою частотою кадрів: заводську прошивку {version} з патчем частоти кадрів {hz} Hz. Preserve патчить лише заводську прошивку, ніколи не пропатчений образ, тож цей слот він не патчить і не повертає',
  'preserve.image.frameRateEarlier':
    'містить відому збірку зі зміненою частотою кадрів: заводську прошивку {version} з ранішим патчем частоти кадрів {hz} Hz (зробленим до того, як до нього додали виправлення USB). Preserve патчить лише заводську прошивку, ніколи не пропатчений образ, тож цей слот він не патчить і не повертає',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    'він {what}. Щоб включити цей слот, спершу запишіть у нього заводський образ (наприклад, із повної резервної копії флеш-пам’яті, знятої до зміни), потім почніть новий прогін',
  'preserve.image.frameRateWords':
    'він {what}. Щоб включити цей слот, спершу запишіть у нього заводський образ (наприклад, із повної резервної копії флеш-пам’яті, знятої до патча частоти кадрів), потім почніть новий прогін; патч частоти кадрів можна буде знову зробити на заводському образі пізніше',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name} {what}. Прогін бере прошивку, яку патчить, із цього слота, тож зупиняється тут, ще до будь-якого запису. Щоб зберегти цю камеру, спершу запишіть заводський образ у {bank:acc} (наприклад, із повної резервної копії флеш-пам’яті, знятої до зміни), потім почніть новий прогін.',
  'preserve.image.frameRateRefusal':
    '{name} {what}. Прогін бере прошивку, яку патчить, із цього слота, тож зупиняється тут, ще до будь-якого запису. Щоб зберегти цю камеру, спершу запишіть заводський образ у {bank:acc} (наприклад, із повної резервної копії флеш-пам’яті, знятої до патча частоти кадрів), потім почніть новий прогін; патч частоти кадрів можна буде знову зробити на заводському образі пізніше.',
  'preserve.image.otherFirmware': 'він містить прошивку {image}, а не {camera}, яку виконує камера',
  'preserve.image.otherFirmwareRefusal':
    '{name} містить прошивку {image}, а не {camera}, яку виконує камера, тож у цього прогону немає там образу для патча, і він відмовляється записувати поверх нього.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage': 'з нього не виходить образу, який прогін може пропатчити ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** `{step}`, `{next}`, `{steps}`: the run's step ids (backup, patch, commit, drain, restore, verify), as the CLI names them: keep them. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone': 'цей прогін завершено — усі кроки виконано (прогін {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    'крок {step} у цьому прогоні вже виконано (завершено {finished}) — продовження почнеться з {next}',
  'preserve.gate.stepDoneUnknownTime':
    'крок {step} у цьому прогоні вже виконано (час завершення невідомий) — продовження почнеться з {next}',
  'preserve.gate.backupRerun':
    'резервне копіювання не можна повторити: цей прогін уже виконав {steps}, і його наступний крок — {next}; скористайтеся --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'попередня спроба резервного копіювання не вдалася, і перед повторним запуском цього кроку камеру треба ВИМКНУТИ Й УВІМКНУТИ — повтор на тому самому запуску може зчитати застарілі або порожні байти (виміряно: повторне резервне копіювання зчитало стартове слово завантажувача замість запису конфігурації запуску). Вимкніть і ввімкніть живлення камери (від’єднайте й під’єднайте її знову або скористайтеся її вимикачем), потім знову запустіть резервне копіювання й підтвердьте вимкнення живлення, коли попросять: прогін не може сам побачити, що це сталося. Зафіксована помилка: {error}',
  'preserve.gate.noErrorText': '(немає тексту помилки)',
  'preserve.gate.patchAfterBackup':
    '{step} виконується після резервного копіювання: прогін бере дамп кожної області, яку може зчитати заводський план, і зберігає його ДО будь-чого іншого — ця резервна копія є єдиною копією цієї камери. Спершу виконайте крок резервного копіювання.',
  'preserve.gate.commitAfterBackup':
    '{step} виконується після резервного копіювання (див. крок «Патч»)',
  'preserve.gate.commitAfterPatch':
    '{step} виконується після кроку «Патч», який фіксує, що він передає',
  'preserve.gate.commitNeedsPatch':
    '{step} потребує патча для {banks:gen}, а крок «Патч» не зафіксував жодного — виконайте крок «Патч» ще раз',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step} потребує файлів резервної копії в теці прогону, а їх немає: {files} — без них підтвердженню запису нема з чого відновлювати, тож воно відмовляється',
  'preserve.gate.drainNoCommit':
    '{step} зчитує ПРОПАТЧЕНУ мікросхему через розширене вікно, а цей прогін не має завершеного підтвердження запису — на заводській камері повне зчитування зависло б. Спершу виконайте крок «Запис» (або продовжте з нього) чи явно перейдіть далі (allowJump), якщо запис відбувся без своєї контрольної точки.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'крок «Повне зчитування» відмовляє (збірка: {build}): {note}',
  'preserve.gate.detectedBuild': 'визначена збірка',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'крок «Повне зчитування» відмовляє (збірка: {build}): запуск повного зчитування на непропатченій прошивці цієї збірки спричиняє збій камери (вона читає зі значення, яке не є адресою флеш-пам’яті; виміряно на емуляторі: віддано 32 КБ, потім камера збоїть). Зміна, яка робить зчитування безпечним, — за адресою {sites}, і її немає серед змін, які цей прогін зафіксував для {bank:gen}, — виконайте крок «Патч» (і завершіть запис) перед повним зчитуванням.',
  'preserve.gate.drainFiles':
    '{step} потребує {files} (отриманий дамп доопрацьовується зі знімком кожного записаного слота), а цього немає в теці прогону',
  'preserve.gate.restoreNoCommit':
    '{step} повертає оригінальні слоти поверх патча, а цей прогін не має завершеного підтвердження запису — повертати нема чого. Спершу виконайте крок «Запис» (або продовжте з нього) чи явно перейдіть далі (allowJump), щоб відновити вже пропатчену камеру.',
  'preserve.gate.restoreNeedsPatch':
    '{step} потребує підсумку патча кожного записаного слота (для довжини передавання) — спершу виконайте крок «Патч»',
  'preserve.gate.restoreNoForm':
    'крок «Відновлення» відмовляє (збірка: {build}): жодна форма оригінальної прошивки не проходить власну перевірку камери й водночас не зберігається назад як оригінальні байти — контрольна сума оригінальної прошивки 0xB7AB9D17 (виміряно), а не 0xFFFF, якої вимагає камера. Цей прогін завершується з повним образом на руках і патчем на місці; оригінальний вміст можна повернути лише програматором усієї флеш-пам’яті.',
  'preserve.gate.restoreFiles':
    '{step} потребує {files} (оригінал кожного записаного слота з кроку резервного копіювання), а цього немає в теці прогону',
  'preserve.gate.verifyNoRestore':
    '{step} порівнює новий запуск із резервною копією, а цей прогін не має завершеного відновлення — пропатчений слот показав би відмінності. Спершу виконайте відновлення (або продовжте з нього) чи явно перейдіть далі (allowJump), якщо відновлення відбулося без своєї контрольної точки.',
  'preserve.gate.verifyNeedsBackup':
    '{step} потребує {file} (еталон для порівняння), а його немає в теці прогону',
  'preserve.gate.needsBanks':
    '{step} потребує слотів, які зчитав крок резервного копіювання, а в стані їх немає',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'для цього прогону не вибрано жодного слота: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank} не можна записати: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'патч цієї збірки запускається лише зі слота відновлення R: {note} — прогін записав би {bank:acc}, звідки завантажувач його ніколи не запускає',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'файл замалий, щоб містити заголовок образу',
  'slots.image.notWordSized': 'розмір образу має бути кратним 4 (отримано {size} Б)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'образ має {size} Б; завантажувач відхиляє будь-який header.length >= {limit}, тож такий образ ніколи не запуститься',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'немає заголовка образу за {at} (сигнатура {magic}, очікувано {expected}) — це має бути розшифрований образ прошивки Seek, а не зашифрований слот чи дамп флеш-пам’яті',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'початковий вказівник стека {address} не в SRAM LPC43xx — це не схоже на розшифрований образ',
  'slots.image.stackUnaligned': 'початковий вказівник стека {address} не вирівняний за словом',
  'slots.image.notThumb': 'вектор скидання {address} — не адреса Thumb',
  'slots.image.noKeyPair':
    'назва цього файлу не містить його пари ключів, а в образі рівно один раз не трапляється ні пара цієї камери, ні декодована пара застосунку, тож неможливо визначити, для яких ключів зібрано образ. Розшифровані файли отримують назви з ключами, які вони містять.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'назва файлу вказує ключ A {keyA} і ключ B {keyB}, але {mismatch}. Обидва ключі мають бути присутні, кожен рівно один раз.',
  'slots.image.keyInHeader':
    'цей образ тримає ключ за {at}, усередині відкритого вікна заголовка — відмова його патчити',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'ключ A і ключ B з назви файлу вказують на байти, що перекриваються, за {at} і {other} — це мають бути два різні 16-байтові значення',
  'slots.image.retargetLost':
    'після перенацілення образ не містить пари ключів цієї камери рівно один раз — відмова будувати дані, для подальших оновлень яких завантажувач не зміг би підібрати ключ',
  'slots.image.noStageKey':
    'образ не містить жодної пари ключів лінійки 2016 року, тож немає ключа передавання, щоб його закодувати',
  'slots.image.ffSumNoKeys':
    'цей образ має суму слів FF 16 Hz 0xFFFF, але не містить пари ключів 1.3.0.8-FF (обидві половини, кожну один раз), тож його форму для передавання неможливо побудувати. Нічого не записано.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'це образ 1.3.0.8 FF (16 Hz), який передається у власній формі ключа A (ff-form.ts), а не як незашифрований образ. Нічого не записано.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'план побудовано для прошивки {firmware}, але аналіз зчитує {version}. План застарів; побудуйте його знову. Нічого не записано.',
  'slots.plan.otherFirmwareUnknown':
    'план побудовано для прошивки невідомої версії, але аналіз зчитує {version}. План застарів; побудуйте його знову. Нічого не записано.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'план побудовано для камери {planSerial}, але аналіз зчитує {serial}. Відмова записувати його тут. Нічого не записано.',
  'slots.plan.cameraUnknownSerial': 'з невідомим серійним номером',
  'slots.plan.unknownSerial': 'невідомий серійний номер',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, as a label. */
  'slots.plan.otherAddress':
    'план націлений на {address}, але {name} цієї збірки — за адресою {at}',
  'slots.plan.notRead': 'аналіз більше не зчитує {name}. Нічого не записано.',
  'slots.plan.edited':
    'контрольна сума плану не відповідає його даним, тож план змінено. Нічого не записано.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'дані мають {size} Б — це поза межами {name:gen}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck': '{risk}. Для запису потрібен acknowledgeRisk: true. Нічого не надіслано.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'ця камера не може прийняти звідси незашифрований образ для передавання: {reason}. Нічого не записано.',
  'slots.plan.noKeyTable':
    'аналіз не називає таблиці ключів завантажувача цієї камери, тож образ неможливо під неї перенацілити',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, as a label. CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'статус підтвердження запису не вдалося зчитати після CompleteMemoryUpgrade, тож {name} міг бути записаний частково. Перш ніж робити щось інше, зчитайте слоти ще раз і збережіть свій дамп.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'камера відхилила запис у {name:acc} під час підтвердження зі статусом {status}: {cause}. Нічого не записано; слот не змінено. Перш ніж робити щось інше, зчитайте слоти ще раз.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade повернула {status} ({cause}) для {name:gen}: нічого не запрограмовано, але стирання могло початися, тож слот може бути частково стертий. Перш ніж робити щось інше, зчитайте слоти ще раз і збережіть свій дамп.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade повернула {status} ({cause}) — {name} міг бути записаний частково. Перш ніж робити щось інше, зчитайте слоти ще раз і збережіть свій дамп.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'камера повідомила {status} під час передавання {name:gen} за зміщенням {offset} — перервано до CompleteMemoryUpgrade, тож у флеш-пам’ять нічого не записано',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum': 'контрольна сума передачі не збіглася з переданими байтами',
  'commit.cause.unsupported': 'образ не розшифрувався ключами камери, або тип даних відхилено',
  'commit.cause.acceptance':
    'образ відхилила його перевірка контрольної суми ще до будь-якого стирання (перевірка залежить від збірки)',
  'commit.cause.notArmed': 'оновлення слота не було активовано',
  'commit.cause.eraseFailed': 'етап стирання не вдався',
  'commit.cause.programFailed': 'етап програмування не вдався',
  'commit.cause.verifyFailed': 'етап перевірки не вдався',
  'commit.cause.unknown': 'статус, невідомий тут',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name} не копіюється сам у себе. Нічого не записано.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Нічого не записано.',
  'copy.refused.noPlain': '{name} не має розшифрованого образу для копіювання. Нічого не записано.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} — ZIP, який тут неможливо прочитати ({error}). Нічого не записано.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} не містить повної флеш-пам’яті. ZIP приймається, якщо це файл прогону Preserve, що містить {preserve} (після того, як виконано його крок повного дампу), zip «Дамп і розшифрування 4.x/Nano» ({dump}) або zip «Зчитати всі селектори» ({selectors}); цей ZIP містить {names}. Нічого не записано.',
  'restore.refused.noWholeFlashPatched':
    '{file} не містить повної флеш-пам’яті. ZIP приймається, якщо це файл прогону Preserve, що містить {preserve} (після того, як виконано його крок повного дампу), zip «Дамп і розшифрування 4.x/Nano» ({dump}) або zip «Зчитати всі селектори» ({selectors}); цей ZIP містить {names}. Його {patched} — це флеш-пам’ять із тимчасовим патчем прогону, тож його не прийнято. Нічого не записано.',
  'restore.refused.zipEmpty': 'нічого',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'повна резервна копія флеш-пам’яті має {full} Б (4 МБ — уся мікросхема, яку зчитує J-Link); {file} має {size} Б. Нічого не записано.',
  'restore.refused.noBank': 'план цієї збірки не має {bank:gen}. Нічого не записано.',
  'restore.refused.outsideFlash':
    '{name} не лежить у межах флеш-пам’яті на 4 МБ. Нічого не записано.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    '{where} не зчитано дампом, з якого походить {file}: за його manifest.json, {address} — прогалина. Образу для відновлення немає. Нічого не записано.',
  'restore.refused.gapReason':
    '{where} не зчитано дампом, з якого походить {file}: за його manifest.json, {address} — прогалина ({gap}). Образу для відновлення немає. Нічого не записано.',
  'restore.refused.gapFill':
    '{where} не зчитано дампом, з якого походить {file}: за його manifest.json, {address} — прогалина, заповнена значенням {fill}. Образу для відновлення немає. Нічого не записано.',
  'restore.refused.gapReasonFill':
    '{where} не зчитано дампом, з якого походить {file}: за його manifest.json, {address} — прогалина ({gap}), заповнена значенням {fill}. Образу для відновлення немає. Нічого не записано.',
  'restore.refused.empty':
    '{where} порожній: кожен байт — 0xFF. Запис програмує образ і не може залишити слот стертим, тож порожній слот не можна відновити записом. Нічого не записано.',
  'restore.refused.fill':
    '{where} має значення {fill} у кожному байті — це заповнення, яке дамп записує там, де нічого не зчитав: дамп не зчитував цей слот. Образу для відновлення немає. Нічого не записано.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    '{where} неможливо відновити з цього файлу: {why}. Нічого не записано.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'ця збірка не має активації запису для цього слота',
  'support.noStagingEmpty': 'ця збірка не має форми передавання, тож порожній слот не записується',
  'support.buildUnknown': 'збірка невідома',
  'support.unverifiedStaging':
    'ця збірка належить до заблокованої лінійки 0.x/1.x, але не є однією зі збірок, на яких вимірювали таблиці патчів Preserve (0.8.0.0 .. 1.3.0.8 і 1.0.3.0 / 1.0.3.2), тож форма передавання для її слота невідома, і нічого не записується',
  'support.unknownFamily':
    'сімейство камери невідоме, а отже, невідомий і ключ, під яким записуються її слоти, а камера приймає слот, записаний під хибним ключем, і потім не запускається з нього. Зчитайте й розшифруйте цю камеру, визначте її за дампом, потім укажіть її сімейство через --family.',
  'support.noReadCommand':
    'прошивка, старша за 0.8.0.0, не має обробника зчитування для GetFeaturedFirmwareData — команди, якою дамп читає флеш-пам’ять. На 0.7.0.7 і 0.7.0.8 ця команда є в таблиці методів RPC за 0x4F, але зареєстрована лише як setter (обробник запису), тож зчитування control-IN, яке надсилає дамп, не може бути оброблене (прогін Preserve натомість зчитує ці дві збірки через wire id 0x58, GetFeaturedData); до 0.7.0.7 wire id 0x4F — це UploadFirmwareRowSize, а на 0.3.0.1 wire id 0x52 — той, яким дамп активує зчитування, — це EnterBootloaderMode, а не BeginFirmwareUpgrade: камера лишається у своєму застосунку, але кожна активація задає ціль у флеш-пам’яті й активує етап оновлення прошивки цієї збірки (GetErrorCode потім читає 0x00400000), а це не вікно зчитування. Відновлено з власних таблиць методів образів, з обох стовпців обробників; див. test/firmware/facts.json.',
  'support.noWritePath':
    'ці збірки приймають нову прошивку через старішу послідовність оновлення, якої цей інструмент не надсилає, а їхні слоти ніколи не було розмічено, тож нічого не записується.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'версію прошивки не вдалося зчитати, тож збірка, її слоти та їхня форма передавання невідомі; на ній нічого не зчитується й не записується',
  'support.versionNotDotted':
    'версія прошивки «{version}» не є версією з крапками, тож збірка, її слоти та їхня форма передавання невідомі; на ній нічого не зчитується й не записується',
  'support.olderThanFirst':
    'прошивка {version} старша за {first}: її таблиця RPC не має обробника зчитування для GetFeaturedFirmwareData — команди, яку надсилає зчитування слота, — тож їй не надсилається ні зчитування, ні запис (докази — в early-compact)',
  'support.modernOnLocked':
    'сімейство modern-4x охоплює 2.x, 4.x, 10.x, 42.x і 44.x; {version} належить до заблокованої лінійки 0.x / 1.x, для якої потрібне legacy-auth або compact-2016',
  'support.lockedOnModern':
    'сімейство legacy-auth охоплює заблоковану лінійку 0.x / 1.x; {version} належить до сучасної лінійки, для якої потрібне modern-4x',
  'support.notCompactPro':
    'сімейство compact-2016 охоплює лінійку Compact PRO 1.0.3.x; {version} до неї не належить',
  'support.earlyCompact':
    'сімейство early-compact охоплює лише збірки, старші за {first}, а {version} зчитується через legacy-auth',
  'support.generic':
    'сімейство камери не визначено (сімейство generic), тож розкладка слотів і форма передавання невідомі; визначте камеру, перш ніж зчитувати чи записувати слот',
  'support.noPlan':
    'для сімейства {family} немає плану слотів: його розкладка слотів і форма передавання невідомі',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'таблиця цієї збірки не активує режим {mode} за адресою {address} у звичайному каналі',
  'support.noArmToken':
    'таблиця цієї збірки не активує режим {mode} за адресою {address} у каналі з токеном',
  'support.windowElsewhere': 'вікно Preserve для {bank:gen} — за адресою {at}, а не {address}',
  'support.noDumpWindow':
    'таблиця BeginFirmwareUpgrade цієї збірки не має вікна за адресою {address} для {bank:gen}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family}: не підтримується {capability} — {reason}',
  'support.capability.dump': 'дамп',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': '«Зчитати всі селектори»',
  'support.capability.decrypt': 'розшифрування',
  'support.capability.deviceInfo': 'повне зчитування на вкладці «Інформація»',
  'support.capability.flash': 'запис слотів',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name} за адресою {address} на цій збірці не читається: її таблиця селекторів не має там вікна, тож для нього нічого не активовано',
  'slots.unread.missing': 'в аналізі камери відсутній {name}',
  'slots.unread.notRead': '{name} не зчитано',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Нічого не записано.',
  'slots.refused.versionUnknown':
    'аналіз не каже, яку прошивку виконує камера, а команди слотів на різних збірках означають різне. Зчитайте інформацію про пристрій ще раз.',
  'slots.refused.versionUnknownWrite':
    'аналіз не каже, яку прошивку виконує камера. Нічого не записано.',
  'slots.refused.emptyInput': 'вхідні дані порожні',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable':
    '{name} порожній, і на цій збірці його не можна записати: {reason}',
  'slots.refused.noRaw': '{name} не може прийняти сирі байти на цій збірці: {reason}',
  'slots.refused.noPlain': '{name} не може прийняти розшифрований образ на цій збірці: {reason}',
  'slots.refused.noStaging':
    '{name} не має форми передавання на цій збірці, тож образ неможливо для нього закодувати',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} Б — більше, ніж уміщує {name} ({bankSize} Б)',
  'slots.refused.imageTooLong': 'образ має {size} Б — більше, ніж уміщує {name} ({bankSize} Б)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'завантажувач 2014 року не приймає контрольну суму цієї збірки в слоті A чи B і запускає слот відновлення R (0x14070000) без перевірки, тож патч записується в слот відновлення R і більше нікуди',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly': 'ця збірка запускається лише зі слота відновлення R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize': 'слот прошивки має {size} Б ({kib} КБ); цей файл має {count} Б',
  'decryptFile.erasedBank':
    'порожній, розшифровувати нічого: усі {size} Б читаються як 0xFF (стертий слот)',
  'decryptFile.erasedHeader':
    'стертий: вікно заголовка суцільно 0xFF, тож слот не містить образу; нічого не розшифровано',
  'decryptFile.noHeader': 'немає заголовка образу (сигнатура {magic}), тож розшифровувати нічого',
  'decryptFile.lengthOutOfRange':
    'header.length {length} поза допустимими межами; образу для розшифрування немає',
  'decryptFile.ffKeyB':
    'розшифровано {size} Б ключем B FF 1.3.0.8: образ зберігається як образ XOR потік ключа його блока ключів 1, вікно заголовка без змін',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'ключ не відновлено: образ розшифровується у вектор скидання, який не є точкою входу Cortex-M (ключ {check}); нічого не розшифровано',
  'decryptFile.storedPlain':
    'зберігається незашифрованим: слот містить образ у робочому вигляді (незашифрований ланцюжок 2014 року, тотожний потік ключа), тож ключа немає, а розшифрований образ — це сам образ',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 'розшифровано {size} Б ключем, відновленим із цього слота ({check})',
  'decryptFile.decryptedNamed':
    'розшифровано {size} Б ключем, відновленим із цього слота ({check}; це {key})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'неповне зчитування ({size} Б)',
  'read.reason.noParse': 'не вдалося розібрати заголовок образу',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'немає заголовка образу (сигнатура {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} поза допустимими межами',
  'read.reason.stopped': 'зчитування слота зупинилося на {count}/{size} Б',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'не читається на прошивці {version}: її план ({table}) не має вікна за адресою {address}, тож для нього нічого не активовано',
  'read.reason.notInPlanUnknown':
    'не читається на прошивці невідомої версії: її план ({table}) не має вікна за адресою {address}, тож для нього нічого не активовано',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'вікно віддало байти застарілого дескриптора зчитувача — слово 0 {word} зі скиданням {hex} — це таблиця векторів 0x14000000, а не вміст цього слота, тож із нього нічого не аналізувалося: {remedy}',
  'read.reason.spentReader': 'слоти камери не вдалося зчитати — {remedy}',
  'read.spentRemedy':
    'зчитувач вікон, можливо, вичерпано для цього запуску; вимкніть і ввімкніть живлення камери й спробуйте ще раз',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'слово активного слота камери (fw info roots, селектор 10) не вдалося зчитати',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'слово активного слота камери — {word}, що не відповідає жодному слоту',
  'checkKey.unnamed.cfg0NotRead':
    'слово конфігурації запуску не зчитано, тож невідомо, чи перевірив завантажувач {bank:acc}, перш ніж увійти в нього',
  'checkKey.unnamed.noZeroSum':
    'камера повідомляє, що запустилася з {bank:gen}, але під час цього зчитування {bank} не розшифровується в нульову суму слів',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'камера повідомляє, що запустилася з {bank:gen}, який слово конфігурації запуску {word} залишає на останнє, тож завантажувач увійшов у нього без перевірки, але під час цього зчитування {bank} не розшифровується в нульову суму слів',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (оцінка {score} після зчитування, за доказами нижче)',
  'report.detectedAmbiguous':
    '{family} (оцінка {score} після зчитування, за доказами нижче; неоднозначно)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'так',
  'report.cell.no': 'ні',
  'report.cell.notApplicable': 'н/д',
  'report.cell.unknown': 'невідомо',
  'report.cell.recoveryOnly': 'лише відновлення',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'K відбілювання',
  'report.keyRow.store': 'ключ зберігання',
  'report.keyRow.check': 'ключ перевірки',
  'report.keyRow.table': 'таблиця ключів',
  'report.keyRow.keys': 'ключі',
  'report.keyRow.a': 'ключ A',
  'report.keyRow.b': 'ключ B',
  'report.keyRow.tableAt': 'таблиця за адресою',
  'report.key.notIdentified': '(не визначено)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} кандидат, жоден не підтверджено',
    few: '{count} кандидати, жоден не підтверджено',
    many: '{count} кандидатів, жоден не підтверджено',
    other: '{count} кандидата, жоден не підтверджено',
  },
  'report.key.tableAt': '{offset} у блоці завантажувача, підтверджено за слотом',
  'report.key.plainChain':
    'не потрібен: слоти зберігаються як незашифрована прошивка, тож слот зчитується й записується як є',
  'report.key.tableRefused2016':
    'не зчитано — блок завантажувача (0x14000000) на цій лінійці відхиляється на кожному каналі',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, визначено з {bank:gen} — слота, у який, за словами камери, вона ввійшла після перевірки завантажувача',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, виведено з {bank:gen} — слота, у який, за словами камери, вона ввійшла: завантажувач входить у цей слот без перевірки й запускає його під ключем, під яким перевіряє інші слоти',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' (блок 1: {pair})',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'пара Compact PRO 1.0.3.x 9 Hz',
  'keyPair.cp1032ff': 'пара Compact PRO 1.0.3.x FF',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'не названо — {why}',
  'report.checkKey.couldNotName': 'зчитування не змогло його назвати',
  'report.storeKey.checkKeyUnnamed':
    'ключ, під яким її завантажувач перевіряє слот (під час цього зчитування не названо): застосунок зберігає кожен записаний ним слот під цим ключем',
  'report.storeKey.checkKey':
    '{key}: застосунок зберігає кожен записаний ним слот під ключем, який перевіряє її завантажувач',
  'report.storeKey.unknown': 'невідомо — блок завантажувача з коміркою ключа пристрою не зчитано',
  'report.storeKey.keyBUnidentified':
    'ключ B (ключ пристрою не запрограмовано; сам ключ B не визначено)',
  'report.storeKey.keyB': 'ключ B (ключ пристрою не запрограмовано)',
  /** How each bank is staged: said after "each bank" (info:report.oneBank). */
  'report.staged.plain': 'передавання без шифрування (образ як є, без ключа)',
  'report.staged.slotKeystream': 'передавання під власним блоком ключів 0 образу',
  'report.staged.keyA':
    'передавання під ключами, отриманими зі слота, з якого запущено камеру, і з робочого застосунку',
  'report.staged.ffVendor':
    'передавання так, як застосунок виробника передає образ FF 16 Hz (образ XOR його власний блок ключів 0), а камера зберігає його під ключем B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Резервне копіювання: блок {address}',
  'progress.backupDone': 'Резервне копіювання: усі блоки зчитано',
  'progress.checkBlock': 'Перевірка: блок {address}',
  'progress.checkDone': 'Перевірка: усі блоки зчитано',
  'progress.writingBank': 'Запис {bank:gen}',
  'progress.restoringBank': 'Відновлення {bank:gen}',
  'progress.staged': '{label}: передано {done}/{total} Б',
  'progress.wholeFlash': 'Повне зчитування: {got}/{total} Б',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'зчитування {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'зчитування {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Готово — зчитано вікон: {ok}/{total}.',
  'progress.readingBank': 'Зчитування {bank:gen} ...',
  'progress.analysing': 'Аналіз ...',
  'progress.probeSelector': 'перевірка селектора {selector} ...',
  'progress.selectorsArmed':
    'Готово — активовано селекторів: {armed}/{span}, із даними: {withData}.',
  'progress.recoveringKey': 'розшифрування: відновлення ключа для {address} ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} {address} (subcmd {subcmd}) не вдалося зчитати: {error}',
  'slots.read.refusedBuild':
    'відмова зчитувати слоти прошивки: {reason}. Крім зчитування версії, нічого не надіслано, тож жодного слота не торкалися.',
  'slots.backup.notSaved':
    'резервну копію {file} не збережено, тож нічого не записано. Запис ніколи не виконується, доки не збережено його резервну копію; спробуйте ще раз, коли її можна буде зберегти.',
  'slots.backup.notSavedWhy':
    'резервну копію {file} не збережено ({error}), тож нічого не записано. Запис ніколи не виконується, доки не збережено його резервну копію; спробуйте ще раз, коли її можна буде зберегти.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'висока (480 Mbit/s)',
  'usb.speed.full': 'повна (12 Mbit/s)',
  'usb.speed.code': 'код {code}',
} satisfies Translation<'core'>;
