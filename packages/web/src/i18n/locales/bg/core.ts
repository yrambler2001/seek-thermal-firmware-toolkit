/**
 * Namespace `core`, български (bg), translated from the English source: sentences that `@seek-fw/core` makes and
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
    'камерата остава отключена до изключване на захранването и дотогава други инструменти може да я прочетат погрешно; изключете и включете захранването ѝ, преди да ги използвате',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': 'първо {first}, след това {second}, накрая {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'не е прочетен',
  'boot.verdict.checkKeyUnnamed':
    'не можа да бъде проверен: ключът, с който буутлоудърът му проверява слотовете, не е посочен',
  'boot.cfg0NotRead':
    'думата за конфигурация на стартирането (cfg[0]) не е прочетена, така че не е известно от кой слот ще е следващото стартиране',
  'boot.select.unknown':
    'думата за конфигурация на стартирането е {word}, така че буутлоудърът опитва първо {first:acc}, но {bank:nom} {verdict}, така че не е известно кой слот се стартира',
  'boot.select.first':
    'думата за конфигурация на стартирането е {word}, така че буутлоудърът опитва първо {first:acc} и в него има образ, който буутлоудърът приема',
  'boot.select.second':
    'думата за конфигурация на стартирането е {word}, така че буутлоудърът опитва първо {first:acc}; в {first:acc} няма образ, който буутлоудърът приема, затова взима {second:acc}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'думата за конфигурация на стартирането е {word}, така че буутлоудърът опитва първо {first:acc}; в {first:acc} и в {second:acc} няма образ, който буутлоудърът приема, затова стартира {last:acc}, който не проверява',
  'boot.select.lastTakes':
    'думата за конфигурация на стартирането е {word}, така че буутлоудърът опитва първо {first:acc}; в {first:acc} и в {second:acc} няма образ, който буутлоудърът приема, затова взима {last:acc}, който не проверява',
  'boot.bootsNow': 'Камерата стартира сега от {bank:acc}',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'стартиран сега',
  'boot.notBooted': 'не е стартиран',
  'boot.unknownWhy.checkKeyUnnamed':
    'ключът, с който буутлоудърът проверява слотовете, не е посочен при това четене',
  'boot.unknownWhy.noKeyTable':
    'таблицата с ключове на буутлоудъра не е прочетена, така че ключовете, които той опитва, не могат да бъдат посочени',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'Камерата стартира от {bank:acc}. {why}.',
  'fpsBoot.holdsOne':
    '{bank}: съдържа пач за кадровата честота, но не се стартира, така че пачът не действа.',
  'fpsBoot.holdsTwo':
    '{banks}: съдържат пачове за кадровата честота, но нито един от тях не се стартира, така че пачовете не действат.',
  'fpsBoot.wouldNotRun':
    'Пач в {target:acc} няма да накара камерата да стартира от него, защото тя стартира от {bank:acc}.',
  'fpsBoot.patchRunning':
    'Приложете пач и към {bank:acc} (слота, който се стартира): така пачът за кадровата честота ще подейства.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank}: тук не може да се приложи пач ({reason}), така че пач за кадровата честота в друг слот не действа на тази камера.',

  /* ---- backup: the zip saved before a bank write (slots/backup); `{name}` is the bank inside a sentence ("slot B"): each is an item of backup.plan.* ---- */
  'backup.bank.notInPlan': '{name:nom} (не е в плана на тази компилация: zip архивът го отбелязва)',
  'backup.bank.unsupported':
    '{name:nom} (тази компилация не може да го прочете, {reason}: zip архивът го отбелязва)',
  'backup.bank.empty':
    '{name:nom} (празен, всеки байт е 0xFF: zip архивът го отбелязва, а записът не презаписва фърмуер)',
  'backup.bank.unread':
    '{name:nom} (четенето на слотовете не е стигнало до него: zip архивът отбелязва дали четенето преди записа стига)',
  'backup.bank.noKey':
    '{name:nom} (както е съхранен; нито един ключ, получен при това четене, не го отваря, така че няма дешифриран файл)',
  'backup.bank.decrypted': '{name:nom} (както е съхранен, и дешифриран)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Преди да бъде записано каквото и да е, {banks} се прочита отново и се запазва в един zip заедно с бележка какво е всеки файл: {file}.',
  'backup.plan.many':
    'Преди да бъде записано каквото и да е, {banks} се прочитат отново и се запазват в един zip заедно с бележка какво е всеки файл: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'шифрирано така, че устройството да го съхрани с ключа, който има слотът, от който е стартирала камерата',
  'staging.detail.slotKeystreamCiphertext':
    'шифрирано със собствения ключ за изпращане на образа (блок с ключове 0); камерата го съхранява със собствения ключ на слота',
  'staging.detail.plain': 'в открит вид, без шифриране',
  'staging.detail.keyAKeystream':
    'образът 1.3.0.8 FF така, както го изпраща фирменото приложение (XOR ключ A) — компилацията 16 Hz го съхранява с ключ B, а не тези байтове',
  'staging.detail.verbatim': 'дословно — байтовете точно както са дадени',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'няма четене',
  'copy.source.notInPlan': '{name:nom} не е в плана на тази компилация',
  'copy.source.notRead': '{name:nom} не е прочетен ({reason}), така че няма образ за копиране',
  'copy.source.empty': '{name:nom} е празен: няма образ за копиране',
  'copy.source.foreign':
    'в {name:acc} няма образ на фърмуер, който това четене разпознава, така че няма какво да се копира',
  'copy.source.noKey':
    'нито един ключ, получен при това четене, не отваря {name:acc}, така че няма дешифриран образ за копиране',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} на адрес {address}, както го е дешифрирало четенето на слотовете',
  'copy.fromVersion':
    '{name} на адрес {address}, фърмуер {version}, както го е дешифрирало четенето на слотовете',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'Образът е от {name:acc}, както го е дешифрирало четенето на слотовете: {size} Б, sha256 {sha256}.',
  'copy.noteVersion':
    'Образът е от {name:acc}, както го е дешифрирало четенето на слотовете: фърмуер {version}, {size} Б, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '{name:acc} от резервното копие (на адрес {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where} в пълното резервно копие на флаш паметта {file}',
  'restore.fromVersion':
    '{where} в пълното резервно копие на флаш паметта {file}, фърмуер {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'образ на флаш памет от 4 МБ',
  'restore.kind.preserve-run': 'файл на сесия на Preserve',
  'restore.kind.dump': 'zip от „Дъмп и дешифриране 4.x/Nano“',
  'restore.kind.all-selectors': 'zip от „Дъмп на всички селектори“',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'образ',
  'restore.decryptedTo.firmware': 'фърмуер {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'Образът е от {where} в {file}, {kind}: съхранен sha256 {stored}, дешифриран до {decrypted} от {size} Б (sha256 {sha256}).',
  'restore.note.imageEntry':
    'Образът е от {where} в {file}, {kind} (файлът {entry} в него): съхранен sha256 {stored}, дешифриран до {decrypted} от {size} Б (sha256 {sha256}).',
  'restore.note.readBack':
    'След записа прочетеният обратно слот се сравнява със съхранените байтове на слота в резервното копие.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'Блокът за идентификация на резервното копие посочва тази камера (сериен номер {serial}).',
  'restore.note.sameBytes':
    '{name:ins} вече съдържа съхранените байтове от резервното копие: записът връща същия образ.',
  'restore.warn.otherCamera':
    'Това резервно копие изглежда като от друга камера: блокът му за идентификация посочва сериен номер {theirs}, а тази камера е {camera}. Записва се само образът от {name:acc}; нищо от идентификацията или калибрирането на онази камера не се записва.',
  'restore.warn.noIdentity':
    'Това резервно копие няма блок за идентификация на адрес {address}, така че не може да се каже от чия камера е прочетено.',
  'restore.warn.serialNotRead':
    'Серийният номер на камерата не е прочетен, така че резервното копие (сериен номер {serial}) не може да бъде съпоставено с нея.',
  'restore.warn.otherFirmware':
    'В {where} има фърмуер {version}, а камерата изпълнява {camera}: възстановяването поставя друг фърмуер в слота.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank:ins} не е прочетен обратно, така че не се сравнява с резервното копие.',
  'restore.readBack.equal':
    '{bank:ins} се прочита байт по байт така, както го съхранява резервното копие.',
  'restore.readBack.differs':
    '{bank}: при обратното прочитане се различава от съхранените байтове на резервното копие в {count} Б (първата разлика е на {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, получен от {bank:acc}, от който е стартирала камерата',
  'keys.derived.holds':
    '{key} (ключът за съхранение), получен от {bank:acc}, от който е стартирала камерата и който съдържа {holds:acc}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, получен от слота, от който е стартирала камерата',
  'keys.derived.holdsUnnamed':
    '{key} (ключът за съхранение), получен от слота, от който е стартирала камерата и който съдържа {holds:acc}',
  'keys.ffVendor.staged':
    'образът 1.3.0.8 FF (16 Hz) така, както го изпраща фирменото приложение: образът XOR собствения му блок с ключове 0 (ключ A), прозорецът на заглавието — непроменен, във всеки слот; ключовете на тази камера не се използват',
  'keys.ffVendor.stored':
    'Ключ B: камерата прешифрова каченото с блок с ключове 1 и съхранява образа с него',
  'keys.imageBlock0.staged':
    'образът със собствения му блок с ключове 0 (намерен в образа по стойност), във всеки слот; ключовете на тази камера не се използват',
  'keys.imageBlock0.storedUnnamed':
    'ключът, с който буутлоудърът проверява слотовете (не е посочен при това четене); камерата шифрира каченото повторно с него',
  'keys.imageBlock0.stored':
    '{key} — ключът, с който буутлоудърът проверява слотовете; камерата шифрира каченото повторно с него',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED (не е проверено): от камера не е прочетен буутлоудър на компилацията FF 16 Hz, така че не е известно дали записаният слот стартира. При буутлоудъра 0.9.0.0 по-ранна форма на този образ стартираше от слота за възстановяване R; тази форма няма да стартира, защото този буутлоудър стартира слота за възстановяване R такъв, какъвто е съхранен, без да го декодира.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'Образът FF 16 Hz се изпраща във формата, която чете само компилацията 16 Hz {version}. Тази камера записва слот, без да проверява образа (така казва изходният код на фърмуера ѝ, а Compact с 1.3.0.0 направи точно това при опит), така че се очаква да запише байтовете такива, каквито са изпратени: тогава слотът съдържа образа във форма, от която тази камера не може да стартира.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Нищо тук не твърди, че камерата го стартира.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast':
    'Собствените отговори на камерата казват, че тя изпълнява компилацията FF 16 Hz: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'проверява данните, преди да изтрие слот, и тези данни минават проверката, така че може да запише тези байтове такива, каквито са, във форма, от която буутлоудърът ѝ не може да стартира: слотът може да не стартира (не е изпробвано; резервното копие, запазено преди записа, го връща)',
  'write.ff.outcome.refuses':
    'проверява данните, преди да изтрие слот, и тези данни не минават проверката, така че се очаква да откаже този запис, преди да запише каквото и да е (камера с тази компилация отказа по-ранна форма на този образ по същия начин)',
  'write.ff.runsSlow':
    'Камерата изпълнява компилацията 8 Hz {version}: {why}. Тази компилация {outcome}.',
  'write.ff.buildUnknown':
    'Собствените отговори на камерата не казват коя компилация {version} изпълнява: {why}. Ако изпълнява компилацията FF 16 Hz, тя приема тези данни. Ако изпълнява компилацията 8 Hz, тази компилация {outcome}.',
  'write.raw.asGiven':
    'Сурови данни: изпращат се точно както са дадени. Нищо тук не проверява дали от тях може да се стартира.',
  'write.raw.ffStagedForm':
    'Тези данни са формата за изпращане на 1.3.0.8 FF (образът XOR блок с ключове 0, сума на думите 0xFFFF). Камерата съхранява образа с ключ B, така че контролното прочитане се сравнява с тези байтове.',
  'write.raw.noStaging':
    'Тази компилация не посочва форма за изпращане за слота, така че проверките на буутлоудъра не могат да бъдат определени.',
  'write.raw.reencrypts':
    'Устройството декодира тези данни и шифрира повторно това, което пази, така че съхранените байтове не могат да бъдат предвидени. Контролното прочитане се проверява като образа, до който се дешифрира, където това може да се каже.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'Буутлоудърът би отхвърлил тези данни: {failure}.',
  'write.raw.stageKeyUnchecked':
    'Ключът за изпращане от 2016 г. (блок с ключове 0) не е в суровите байтове, така че сумата на думите на дешифрираните данни не се проверява тук.',
  'write.image.rekeyRisk':
    'В {name:acc} вече има образ, който буутлоудърът не може да приеме. Този запис води до същото състояние.',
  'write.ack.recovery':
    'Слот за възстановяване R: записът му изисква да потвърдите риска. Нищо тук не проверява дали камерата стартира след това.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: записът изисква да потвърдите риска, а след следващото изключване и включване на захранването камерата изпълнява каквото има в слота.',
  'write.ack.bootUnnamed':
    'слотът, от който е стартирала камерата, не можа да бъде посочен, затова този слот се приема за него',
  'write.ack.recoveryFallback':
    'Слотът за възстановяване R е копието за краен случай, към което прибягва буутлоудърът',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank':
    'празно/0: предпочита слот A, след това B, след това слота за възстановяване',
  'boot.cfg0.modernB': 'предпочита слот B, след това A, след това слота за възстановяване',
  'boot.cfg0.modernRecovery': 'предпочита слота за възстановяване, след това A, след това B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'неизвестно — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  /** `{verdict}` is one of upgrade.verdict.*. `{name}` here is the bank inside a sentence ("slot B"); in upgrade.verdict.* it starts a sentence ("Slot B"). */
  'upgrade.whileRecovery':
    'Камерата работи от слота си за възстановяване, а собственото ѝ обновяване записва в {name:acc}, от който тя не работи. {verdict} Това е само предупреждение: нищо тук не спира обновяване.',
  'upgrade.verdict.notRead':
    '{name:ins} не можа да бъде прочетен при тази проверка, така че не е известно какво съдържа.',
  'upgrade.verdict.blank': '{name:ins} е празен, така че обновяването записва в празен слот.',
  'upgrade.verdict.bootableSame':
    'В {name:acc} има същият образ, годен за стартиране, като в слота, от който работи камерата, и обновяването го заменя. Ако обновяването спре по средата, в {name:acc} не остава образ, от който да се стартира.',
  'upgrade.verdict.bootable':
    '{name}: съдържа образ, годен за стартиране, който обновяването заменя. Ако обновяването спре по средата, този слот остава негоден за стартиране.',
  'upgrade.verdict.unknown':
    'Дали {name:nom} е годен за стартиране, е неизвестно при това четене, така че обновяването може да замени образ, от който камерата би стартирала.',
  'upgrade.verdict.notBootable':
    '{name:ins} не е показан като годен за стартиране при това четене, така че обновяването не заменя образ, от който камерата би стартирала.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — слотът, в който буутлоудърът е влязъл при това стартиране, както го отбелязва',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'не е прочетено',
  'report.lastStart.noBank': 'камерата съобщава {word}, което не посочва слот',
  'report.lastStart.entered':
    'камерата съобщава, че е влязла в {bank:acc} (дума на активния слот {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'няма версия',
  'running.why.otherVersion': 'камерата съобщава {version}, а само {only} има две компилации',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'камерата не отговори на оценките за слотовете (селектори 6, 7, 8 на GetFirmwareInfo)',
  'running.why.notRead':
    'слот, от който зависят оценките, не е прочетен, така че отговорите не могат да бъдат предвидени',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'камерата отговаря {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers}, което е отговорът на компилацията 8 Hz 1.3.0.8 за тези слотове ({predicted})',
  'running.why.ff':
    '{answers}, което е отговорът на компилацията FF 16 Hz 1.3.0.8 за тези слотове ({predicted})',
  'running.why.both':
    '{answers}, и двете компилации отговарят точно така за тези слотове, така че слотовете не ги различават',
  'running.why.neither':
    '{answers}, което не съвпада с никоя от компилациите (8 Hz: {plain}; FF 16 Hz: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'Заглавието на този образ не посочва версия на фърмуера, така че не може да се каже дали това е компилацията, която изпълнява камерата ({camera}). Проверете дали това е образът, който искате да запишете.',
  'imageBuild.otherVersion': 'Този образ е фърмуер {image}; камерата изпълнява {camera}.',
  'imageBuild.otherVersionTaken':
    'Този образ е фърмуер {image}; камерата изпълнява {camera}. На тази линия камерата проверява само дали образът е правилно оформен (заглавието и сумата на думите), а не версията му, така че приема този образ и когато стартира от този слот, изпълнява {image}.',
  'imageBuild.otherVersionUnchecked':
    'Този образ е фърмуер {image}; камерата изпълнява {camera}. Дали тази камера приема различна компилация и я изпълнява, не е проверено.',
  'imageBuild.otherBuild':
    'Този образ е компилацията 8 Hz {version}; камерата изпълнява компилацията FF 16 Hz {version}. Компилацията 16 Hz проверява данните спрямо собствената си форма FF, когато записът се потвърждава, и отказва данни, които не минават, преди да изтрие слота (според изходния ѝ код). Записът на компилацията 8 Hz в нея не е изпробван на камера.',
  'imageBuild.runningUnknown':
    'Този образ е компилацията 8 Hz {version}. Камерата изпълнява {version}, която съществува като компилация 8 Hz и FF 16 Hz, а собствените ѝ отговори не казаха коя от тях изпълнява, така че не може да се каже дали това е нейната компилация.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': 'данните са {size} Б — твърде кратки, за да съдържат заглавие на 0x200',
  'bootFail.noMagic':
    'няма сигнатура на образ на 0x200 (намерено {found}, буутлоудърът изисква {needs})',
  'bootFail.lengthOutside': 'header.length {length} е извън данните от {size} Б',
  'bootFail.lengthNotPayload': 'header.length {length} не е дължината на данните {size}',
  'bootFail.overStage': '{size} Б надхвърлят границата за изпращане от {max} Б',
  'bootFail.plainSum': 'съхранена сума на думите {sum}, буутлоудърът от 2014 г. изисква 0',
  'bootFail.noFooter': 'няма краен блок на {offset}: данните свършват на {end}',
  'bootFail.footerNotCode':
    'крайният блок на {offset} не е „CODE“ — буутлоудърът взима своя сегментиран зареждач',
  'bootFail.footerLength': 'дължината на крайния блок не е равна на header.length {length}',
  'bootFail.keyASum':
    'при дешифриране с ключ A на тази камера сумата на думите е {sum}, буутлоудърът изисква {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'потвърден чрез контролната сума за приемане',
  'keyConfidence.structural': 'потвърден само чрез таблицата с вектори',
  'keyConfidence.unverified': 'непотвърден',
  /** `{sum}` is hex. */
  'keyCheck.family': 'ключ, потвърден чрез контролната сума за приемане {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'ключ — {phrase}; контролна сума за приемане {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'изпратени със собствените ключове на камерата',
  'staging.phrase.slotKeystreamCiphertext': 'изпратени със собствения ключ на образа',
  'staging.phrase.plain': 'изпратени в открит вид',
  'staging.phrase.keyAKeystream':
    'изпратени така, както фирменото приложение изпраща образа FF (XOR ключ A)',
  'staging.phrase.verbatim': 'изпратени както са дадени',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank, inside the sentence ("slot A"); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    'записани и потвърдени {size} Б в {name:acc} на адрес {address}, {staged}; статус на потвърждението {status}',
  'written.noReadWindow':
    'тази компилация не посочва прозорец за четене за слота, така че нищо не е прочетено обратно',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'контролното прочитане не успя: {error}',
  'written.readBack': 'прочетени обратно {size} Б, SHA-256 {sha256}',
  'written.verifyOff': 'проверката е изключена: слотът не е прочетен обратно',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'байтовете, които планът предвиждаше, че слотът ще съдържа (образа така, както го съхранява компилацията 16 Hz, а не изпратените байтове)',
  'readBack.reference.asSent':
    'байтовете, които планът предвиждаше, че слотът ще съдържа (байтовете такива, каквито са изпратени)',
  'readBack.sizeDiffers':
    'контролното прочитане е {size} Б, а планът предвиждаше {predictedSize} Б: слотът НЕ съвпада с {reference}',
  'readBack.matchesFolded':
    'слотът съдържа образа така, както го съхранява компилацията 16 Hz (а не изпратените байтове), а останалата част от слота е изтрита',
  'readBack.matches':
    'слотът съвпада с байтовете, предвидени от плана (нешифрованата верига от 2014 г. програмира точно това, което ѝ е изпратено)',
  'readBack.differs': 'слотът НЕ съвпада с {reference} (първа разлика на {offset})',
  'readBack.noHeader':
    'контролното прочитане не съдържа заглавие на образ на {offset} (сигнатура {magic}), така че слотът НЕ се дешифрира до очаквания образ',
  'readBack.lengthDiffers':
    'заглавието от контролното прочитане казва {length} Б, а образът по плана е {imageLength} Б: слотът НЕ се дешифрира до очаквания образ',
  'readBack.tooShort':
    'контролното прочитане е {size} Б — твърде кратко за образ от {length} Б: слотът НЕ се дешифрира до очаквания образ',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'ключовия поток, извлечен от контролното прочитане ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': 'слотът се дешифрира до очаквания образ ({length} Б) с {recovered}',
  'readBack.decryptDiffers':
    'слотът НЕ се дешифрира до очаквания образ: първа разлика при отместване {offset} в образа с {recovered}',
  'readBack.rawNotCompared':
    'сурови байтове: контролното прочитане е отчетено, но не е сравнено (байтовете не се дешифрират до нешифрован образ, който може да бъде предвиден в тази форма, а устройството шифрира повторно това, което пази)',
  'readBack.notCompared':
    'не беше възможно сравнение: планът не предвижда нито съхранените байтове, нито нешифрования образ',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'ключ A',
  'keyName.keyA:nom': 'ключът A',
  'keyName.keyA:acc': 'ключа A',
  'keyName.keyA:ins': 'Ключът A',
  'keyName.keyB': 'ключ B',
  'keyName.keyB:nom': 'ключът B',
  'keyName.keyB:acc': 'ключа B',
  'keyName.keyB:ins': 'Ключът B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'ключ на устройството',
  'keyName.perDevice:nom': 'ключът на устройството',
  'keyName.perDevice:acc': 'ключа на устройството',
  'keyName.perDevice:ins': 'Ключът на устройството',
  'keyName.thePerDevice': 'ключът на устройството',
  'keyName.thePerDevice:nom': 'ключът на устройството',
  'keyName.thePerDevice:acc': 'ключа на устройството',
  'keyName.thePerDevice:ins': 'Ключът на устройството',
  'keyName.applicationKeyA': 'ключът A на приложението',
  'keyName.applicationKeyA:nom': 'ключът A на приложението',
  'keyName.applicationKeyA:acc': 'ключа A на приложението',
  'keyName.applicationKeyA:ins': 'Ключът A на приложението',
  'keyName.applicationKeyB': 'ключът B на приложението',
  'keyName.applicationKeyB:nom': 'ключът B на приложението',
  'keyName.applicationKeyB:acc': 'ключа B на приложението',
  'keyName.applicationKeyB:ins': 'Ключът B на приложението',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'блок с ключове 1',
  'keyName.block1:nom': 'блокът с ключове 1',
  'keyName.block1:acc': 'блока с ключове 1',
  'keyName.block1:ins': 'Блокът с ключове 1',
  'keyName.theDeviceKey': 'ключът на устройството',
  'keyName.theDeviceKey:nom': 'ключът на устройството',
  'keyName.theDeviceKey:acc': 'ключа на устройството',
  'keyName.theDeviceKey:ins': 'Ключът на устройството',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'неизвестен ключ',
  'keyName.unknown:ins': 'Неизвестен ключ',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'нешифрованата верига от 2014 г.: всеки слот се съхранява в открит вид, така че не се извлича ключ за качване; каченото е образът такъв, какъвто е',
  'keys.evidence.ffVendor':
    'компилацията 1.3.0.8 FF (16 Hz): нито един слот, отворен при това четене, не е съхранен в открит вид, така че не е показано, че камерата е на нешифрованата верига от 2014 г.; образът FF се записва във фирмената си форма, суровите байтове се изпращат както са дадени, а нешифрован образ 8 Hz не се записва',
  'keys.evidence.ffUntested':
    'записът на образа FF се предлага с предупреждението UNTESTED (не е проверено): в събраните образи няма истински буутлоудър за тази компилация, така че дали записаният слот стартира, не е измерено',
  'keys.evidence.line2016':
    'линията Compact PRO от 2016 г.: каченото е образът XOR ключовия поток на собствения му блок с ключове 0, намерен в образа по стойност, така че никой ключ на тази камера не го изгражда',
  'keys.evidence.checkKeyUnnamed':
    'камерата дешифрира каченото с този ключ и го шифрира повторно с ключа, с който буутлоудърът ѝ проверява слотовете; този ключ не е посочен при това четене и записът не се нуждае от него: слотът се прочита обратно като образа, до който се дешифрира',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'камерата дешифрира каченото с този ключ и го шифрира повторно с ключа, с който буутлоудърът ѝ проверява слотовете; този ключ не е посочен при това четене ({why}) и записът не се нуждае от него: слотът се прочита обратно като образа, до който се дешифрира',
  'keys.evidence.checkKeyNamed':
    'камерата дешифрира каченото с този ключ и го шифрира повторно с {key:acc} {hex} — ключа, с който буутлоудърът ѝ проверява слотовете, така че всеки слот, който записва, се съхранява така, както го приема буутлоудърът',
  'keys.evidence.checkKeyInferred':
    'камерата дешифрира каченото с този ключ и го шифрира повторно с {key:acc} {hex} — ключа, с който буутлоудърът ѝ проверява слотовете (изведен от {bank:acc}, слота, в който камерата съобщава, че е влязла и в който буутлоудърът е влязъл без проверката си), така че всеки слот, който записва, се съхранява така, както го приема буутлоудърът',
  'keys.evidence.checkKeyNamedFrom':
    'камерата дешифрира каченото с този ключ и го шифрира повторно с {key:acc} {hex} — ключа, с който буутлоудърът ѝ проверява слотовете (посочен от {bank:acc}, слота, в който камерата съобщава, че е влязла), така че всеки слот, който записва, се съхранява така, както го приема буутлоудърът',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'слотът, от който е стартирала камерата, не можа да бъде посочен, така че ключът, с който се съхранява слотът, не може да бъде прочетен от него',
  'keys.refused.notDerived': 'ключовете не можаха да бъдат извлечени',
  'keys.refused.notDecrypted':
    '{bank:nom}, от който е стартирала камерата, не се дешифрира до образ, така че ключът, с който е съхранен, не може да бъде прочетен',
  'keys.refused.noBootKey':
    '{bank:nom}, от който е стартирала камерата, не се дешифрира с нито един ключ, който буутлоудърът опитва (неговия ключ A или ключа му за съхранение), така че ключът, с който е съхранен слотът, не може да бъде прочетен от него',
  'keys.refused.keyNotInTable':
    '{bank:nom}, от който е стартирала камерата, се дешифрира с {key:acc}, но таблицата с ключове на тази камера не съдържа този ключ, така че не може да се записва с него',
  'keys.refused.noApplicationPair':
    'работещото приложение ({bank}, фърмуер {firmware}) не съдържа нито една от известните двойки ключове (на буутлоудъра и декодираните двойки на приложението), всяка половина точно веднъж, така че ключът му A не може да бъде намерен в образа му',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'работещото приложение ({bank}, фърмуер {firmware}) не съдържа нито една от известните двойки ключове (на буутлоудъра и декодираните двойки на приложението), всяка половина точно веднъж, така че ключът му A не може да бъде намерен в образа му (ключът A на буутлоудъра се среща {count} път, ключът му B — {keyB})',
    other:
      'работещото приложение ({bank}, фърмуер {firmware}) не съдържа нито една от известните двойки ключове (на буутлоудъра и декодираните двойки на приложението), всяка половина точно веднъж, така че ключът му A не може да бъде намерен в образа му (ключът A на буутлоудъра се среща {count} пъти, ключът му B — {keyB})',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'работещото приложение ({bank}, фърмуер {firmware}) проверява каченото със собствените си ключове, преди да го програмира (декодираният изходен код на тази компилация опитва каченото с ключа му A и ключа му за съхранение, както буутлоудърът му опитва слот), а ключът, с който съхраняват записите, {key} ({hex}), не е нито ключът му A, нито ключът му за съхранение, така че камерата би отказала каченото с 0x50000, преди да изтрие каквото и да е',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'нито един слот не се дешифрира до контролната сума за приемане {sum} на {family}',
  'writeRefusal.keyTable': 'таблицата с ключове на тази камера не можа да бъде потвърдена',
  'writeRefusal.whitening':
    'таблицата с ключове на тази камера се разрешава при K={k}, но {family} шифрира при K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily':
    'данните показват, че тази камера е {detected}, а не {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'тази камера не може да бъде записвана оттук: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Компилациите на Seek от 2018 г. и по-нови (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 и Nano 300. Дъмпът чете 63 от 64-те блока на флаш паметта, без да отключва нищо; при тези компилации никое четене не стига до блока на {block}. Фърмуерът се съхранява шифриран. Слотовете се записват по един в раздела „Работа със слотовете на фърмуера“.',
  'family.summary.early':
    'Камерите Compact от 2014 г. с версии, по-стари от 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 и 0.7.0.8. Фърмуерът им не може да отговори на четенето, което изпраща дъмпът, затова „Дъмп“, „Дъмп на всички селектори“, пълното четене в раздела „Информация“ и разделът „Работа със слотовете на фърмуера“ ги отказват, след като прочетат версията; при 0.3.0.1 командата, с която започва дъмпът, вместо това би подготвила обновяване на фърмуера. Сесията на Preserve чете 0.7.0.7 и 0.7.0.8 чрез друга команда, на която тези две компилации отговарят. Дъмп, направен по друг начин, се дешифрира както обикновено.',
  'family.summary.compact2016':
    'Компилациите 1.0.3.x на Compact PRO (1.0.3.0 и 1.0.3.2). Те отговарят на четенията точно като камерите Compact от 2014 г., включително токена за отключване, затова се различават по версията и по начина, по който се съхраняват слотовете им: шифровани, докато слотовете от 2014 г. са в открит вид. Камера с 1.0.3.x се чете с това семейство от самото начало. Сесията на Preserve чете цялата флаш памет, а слотовете се записват по един в раздела „Работа със слотовете на фърмуера“.',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    'Камерите Compact от 2014 г. с 0.8.0.0 до 1.3.0.8, сред тях и компилацията 1.3.0.8 FF (16 Hz). Заводската камера позволява да се прочете по-малко от половината ѝ флаш памет, част от нея само срещу токен за отключване, който инструментите изпращат; сесията на Preserve прочита останалото чрез временен пач. Слотовете се съхраняват в открит вид, освен при компилацията FF. Камера Compact PRO с 1.0.3.x се чете като compact-2016 и минава тук само когато слот е съхранен в открит вид или се дешифрира до {sum}, както тези на компилацията FF. Слотовете се записват в раздела „Работа със слотовете на фърмуера“ при компилациите, на които е измерена сесията на Preserve; всяка друга компилация 0.x или 1.x само се чете.',
  'family.summary.generic':
    'Камера, на която не съответства никое друго семейство. `seek-fw dump` я чете със списъка с блокове за 4.x (разделът 4.x/Nano я отказва), а дешифрирането извлича ключа от самия образ, така че нито едното, нито другото зависи от предположението. Не се записва слот: разделът „Работа със слотовете на фърмуера“ я отказва, докато камерата не бъде разпозната.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'заглавието на образа казва',
  'detect.source.camera': 'камерата съобщава',
  'detect.plainArmedNotInForce':
    'обикновен 2-байтов BeginFirmwareUpgrade активира защитен слот, така че удостовереният канал за четене не е в сила',
  'detect.modern.plainRefused':
    'обикновен 2-байтов BeginFirmwareUpgrade за защитен слот беше ОТКАЗАН, което не прави нито една компилация на тази линия — обработчикът ѝ няма проверка на токен и приема обикновения канал за всеки слот',
  'detect.modern.authArmed':
    'защитен слот се активира с 18-байтовия удостоверен селектор; обикновеният не е опитван там, така че това не изважда тази камера от тази линия',
  'detect.modern.legacyVersion':
    '{said} фърмуер {version}, който е от линията 0.x / 1.x (различна линия на номериране, а не по-стар 4.x — и една от тези компилации също дава сумата {sum})',
  'detect.modern.noSum':
    'нито един слот не се дешифрира до контролната сума за приемане {sum}, която изисква буутлоудърът на това семейство',
  'detect.modern.sum': 'слот се дешифрира до контролната сума за приемане {sum}',
  'detect.modern.version':
    'фърмуерът {version} е от линията след 2018 г., която покрива тази карта на селекторите (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'обикновен 2-байтов BeginFirmwareUpgrade активира защитен слот, така че това не е заключеният стар фърмуер',
  'detect.modern.none': 'няма данни, които да поставят тази камера на линията след 2018 г.',
  'detect.early.noVersion':
    'не е съобщена версия на фърмуера и такава не е намерена в заглавие на образ',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'фърмуерът {version} е {first} или по-нов, така че таблицата му RPC има getter за GetFeaturedFirmwareData и се прилага обикновеният път за четене',
  'detect.early.older':
    '{said} фърмуер {version}, който е по-стар от {first} — първата компилация, чиято таблица с RPC методи има обработчик за четене (getter) за GetFeaturedFirmwareData',
  'detect.early.noWindow':
    'и не можа да бъде прочетен нито един прозорец — точно това, което то предсказва',
  'detect.generic.fallback':
    'резервен вариант: нито едно семейство фърмуер не съвпадна уверено, така че четенето остава достъпно, а записът — не',
  'detect.compact2016.early':
    'фърмуерът {version} е по-стар от 0.8.0.0 и няма обработчик за четене за GetFeaturedFirmwareData — това е early-compact, а не това семейство',
  'detect.compact2016.modernSum':
    'слот се дешифрира до контролната сума за приемане {sum}, която не е целевата за това поколение',
  'detect.compact2016.plainArmed':
    'обикновен 2-байтов BeginFirmwareUpgrade активира защитен слот, така че тази камера не е на заключената линия, която това семейство споделя с legacy-auth',
  'detect.compact2016.notLine': 'фърмуерът {version} не е от линията 0.x / 1.x',
  'detect.compact2016.storedPlain':
    'слот е съхранен в открит вид — решаването за ключовия поток връща състоянието на идентичност, така че съхранените му думи СА образът — а това е нешифрованата верига от 2014 г.; слотовете на това поколение са xorshift128 с истински ключ',
  'detect.compact2016.keyedZero':
    'слот, съхранен с истински ключов поток xorshift128, се дешифрира до контролната сума за приемане {sum}, а това е шифърът на това поколение',
  'detect.compact2016.zeroSum':
    'слот се дешифрира до контролната сума за приемане {sum}, която е целевата за това поколение',
  'detect.compact2016.refused':
    'и защитен слот отказа обикновеното 2-байтово активиране, а така прави заключеният обработчик',
  'detect.compact2016.proLine':
    '{said} фърмуер {version} — линията 1.0.3.x на Compact PRO от 2016 г.',
  'detect.compact2016.compactLine':
    '{said} фърмуер {version} — компилация на Compact, а не линията 1.0.3.x на Compact PRO',
  'detect.compact2016.lockedLine':
    '{said} фърмуер {version} — от линията 0.x / 1.x, която това поколение споделя със заключения стар фърмуер',
  'detect.compact2016.bootloader2016':
    'буутлоудърът съобщава {version} — буутлоудър от поколението 2016 (1.2.0.0 е измерен при Compact PRO 1.0.3.0; този на Compact от 2014 г. е 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'буутлоудърът съобщава {version} — номерацията на поколението 2014, а не на това поколение',
  'detect.compact2016.none':
    'не е наблюдаван слот, който да се дешифрира до нулева контролна сума за приемане с истински ключ',
  'detect.legacy.proLine':
    'но фърмуерът {version} е от линията 1.0.3.x на Compact PRO от 2016 г., чиито слотове са с шифъра на compact-2016: проверката за приемане на това семейство би отхвърлила всеки от тях',
  'detect.legacy.early':
    'фърмуерът {version} е по-стар от 0.8.0.0: таблицата му RPC няма обработчик за четене за GetFeaturedFirmwareData (изобщо няма преди 0.7.0.7, а на 0.7.0.7 и 0.7.0.8 има само setter) — това е early-compact, а не това семейство',
  'detect.legacy.keyedZero':
    'слот, съхранен с истински ключов поток xorshift128, се дешифрира до {zero} — шифъра на Compact PRO от 2016 г. (compact-2016). Тази линия съхранява слотовете си в открит вид със сума на думите 0 (веригата от 2014 г.) или с ключ до {sum} (Compact 1.3.0.8), а проверката ѝ за приемане отхвърля такъв слот',
  'detect.legacy.plainChain':
    'слот е съхранен като нешифрован фърмуер, чиито думи дават сума 0, както го стартира буутлоудърът от 2014 г. на тази линия',
  'detect.legacy.refused':
    'камерата отказа да отвори заключен слот за обновяване, когато беше помолена без отключване, както прави само това поколение фърмуер',
  'detect.legacy.unlocked':
    'и отвори същия слот, когато беше помолена с отключване, така че отключването, което изпраща това семейство, е това, което проверява тази камера',
  'detect.legacy.notLine': '{said} фърмуер {version}, който не е от старата линия 0.x / 1.x',
  'detect.legacy.authOnly':
    'тя отвори заключен слот за обновяване, когато беше помолена с отключване, както прави това поколение фърмуер; молба без отключване не е опитвана, така че само това не доказва поколението',
  'detect.legacy.version':
    'фърмуерът {version} е от старата линия 0.x / 1.x, която е различна линия на номериране от версиите на приложението след 2018 г., а не по-стар 4.x',
  'detect.legacy.none': 'нищо наблюдавано не сочи към удостоверения канал за четене',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'задържан след опит на камера: там пачът не повиши честотата на публикуване, а затворът се задействаше при всеки кадър след записа',
  'fps.table.predates':
    'фърмуерът {version} е по-стар от 0.8.0.0: таблицата му RPC няма обработчик за четене за GetFeaturedFirmwareData — командата, която изпраща четенето на слот, — така че четенето и записът на слотовете не обхващат нито един слот на компилацията и пачът не се предлага',
  'fps.table.stageTwoFf':
    'stage two: компилацията FF 16 Hz се изпраща така, както я изпраща фирменото приложение (образът XOR ключ A, съхранен с ключ B), а не като нешифровани байтове, така че проверката ѝ при изпращане не е направена и пачът още не се предлага',
  'fps.table.stageTwo':
    'stage two: този запис не е в набора за stage two, така че проверката му при изпращане не е направена и пачът още не се предлага',
  'fps.table.notOffered': 'не се предлага',
  'fps.table.notImage':
    'това не е образ на фърмуер, така че към него не се прилага пач за кадровата честота',
  'fps.table.otherBuild':
    'образът е компилацията {image}, но камерата съобщава {camera}; пачът се отхвърля, вместо да се приложи към компилация, с която не съвпада',
  'fps.table.otherBuildNoVersion':
    'образът е компилацията {image}, но камерата не съобщава версия; пачът се отхвърля, вместо да се приложи към компилация, с която не съвпада',
  'fps.table.patched': 'пачът за кадровата честота вече е приложен: този образ работи на {hz} Hz',
  'fps.table.earlierPatch':
    'този образ съдържа по-ранен пач за кадрова честота {hz} Hz без поправката за USB, а пач никога не се прилага към образ с пач: възстановете заводския образ, след това приложете пача',
  'fps.table.atRate': 'тази компилация вече работи на {hz} Hz без пач',
  'fps.table.not4821':
    'този образ съобщава компилацията 4.8.2.1 на Compact (или 4.8.2.1 на Compact XR, същата компилация), но не е заводският образ, за който е написан пачът за кадровата честота (f96ac57eda75: 68-байтовите му страници с команди, стабилна страница 13), така че за него не се прави пач за кадровата честота',
  'fps.table.notInTable':
    'този образ не е в таблицата с пачове за кадровата честота, така че за тази компилация не се прави пач. Таблицата съдържа компилациите на Compact от 0.7.0.8 до 1.3.0.8 (8 Hz; 0.7.0.8 се отхвърля от кода за слотовете), 1.3.0.8 (FF 16 Hz), 4.8.1.7, 4.8.1.9, 4.8.2.1 и 4.16.1.7 FF и компилациите на Compact PRO 1.0.3.x и 4.9.x; никоя друга компилация няма запис',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'в плана на тази компилация няма {bank}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank:nom} не може да приеме дешифриран образ на тази компилация: {reason}',
  'fps.plan.empty': 'в {bank:acc} няма дешифриран образ за пач (празен е)',
  'fps.plan.noImage':
    'в {bank:acc} няма дешифриран образ за пач (не е прочетен или никой ключ не го отваря)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name:ins} е записан, но контролното му прочитане не се различава от запазения слот само според плана, така че слотовете след него не са записани',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build (slots/capability-notes) ----
   * The page shows only this one; it leaves the others out (lib/page-hidden.ts), and the CLI prints them
   * in English. */
  'notes.unverified':
    'Само четене. Подредбата на слотовете е декодираната таблица на заключената линия, но за тази компилация не е измерена форма за изпращане, така че не се планира запис.',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'камерата не съобщи версията на фърмуера си ({note}); номерът на една команда не означава едно и също на всеки фърмуер на Seek — на Compact 0.3.0.1 wire id 0x52, идентификаторът, който активира прозорец за четене, е EnterBootloaderMode — затова, докато версията не е известна, не се изпраща нищо освен GetErrorCode, GetOperationMode и GetFirmwareInfo — четенията, на които всяка компилация отговаря по един и същи начин',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo не отговори ({error}) при нито едно от {reads} четения през {spacing} мс — прозорец за стартиране от {window} мс; камера, която още стартира, отговаря в него',
  'identity.note.neverTwice':
    'GetFirmwareInfo нито веднъж не отговори два пъти подред при {reads} четения',
  'identity.note.noAnswer': 'GetFirmwareInfo не отговори ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo не отговори ({error}); отговориха {answered} от {reads} четения, но никога две подред, така че нито едно от тях не може да се различи от запис, оставен избран от по-ранна команда',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo върна {count} байт — твърде малко за версия',
    other: 'GetFirmwareInfo върна {count} байта — твърде малко за версия',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo върна {count} байт — твърде малко за версия; {context}',
    other: 'GetFirmwareInfo върна {count} байта — твърде малко за версия; {context}',
  },
  'identity.note.otherRecord':
    'първото четене върна друг запис ({version}), на който по-ранна команда беше оставила селектора за информация за фърмуера — това четене го изчисти',
  'identity.note.afterStartup': {
    one: 'тя отговори, след като отказа {count} четене по време на стартирането',
    other: 'тя отговори, след като отказа {count} четения по време на стартирането',
  },
  'identity.predates':
    'фърмуерът {version} е по-стар от протокола за дъмп: таблицата му с RPC методи няма обработчик за четене за GetFeaturedFirmwareData (на 0.7.0.7 и 0.7.0.8 той е регистриран само като setter, а преди това wire id 0x4F е UploadFirmwareRowSize), така че с него не може да се прочете нито един прозорец; на 0.3.0.1 wire id 0x52 е EnterBootloaderMode, а не BeginFirmwareUpgrade. Сесията на Preserve чете 0.7.0.7 и 0.7.0.8 вместо това чрез wire id 0x58 (GetFeaturedData)',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'отхвърля се {operation}: {reason}',
  'identity.refusingNoVersion':
    'отхвърля се {operation}: {reason}. Нищо не е активирано. Изключете камерата, включете я отново, изчакайте да завърши стартирането и опитайте пак.',
  'identity.operation.dump': 'дъмпът',
  'identity.operation.dumpAll': 'дъмпът на всички селектори',
  'identity.operation.readInfo': 'четенето на информацията за устройството',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'слотовете се избират след резервното копие, което ги чете — първо изпълнете резервното копие',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'слотовете не могат да се променят, след като записът е изпълнен или опитан: тази сесия записва: {banks}, а възстановяването връща точно тях',
  'preserve.banks.none': 'нито един слот',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Записано.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Прочетено. Четими слотове: {count}/{of}.',
  'status.readRefused':
    'Прочетено, но нито един слот на тази камера не може да бъде записан оттук — вижте журнала.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Версия на фърмуера',
  'compare.field.imageId': 'Идентификатор на образа',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'Начален SP',
  'compare.field.resetVector': 'Вектор за нулиране',
  'compare.field.size': 'Размер',
  'compare.field.shaExpected': 'SHA-256 на очаквания нешифрован образ',
  'compare.field.sha': 'SHA-256 на образа',
  'compare.field.shaNotStored':
    'SHA-256 на очаквания нешифрован образ (съхранените байтове не са предвидени)',
  'compare.field.key': 'Ключ',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(няма образ)',
  'compare.notImage': '(не е образ)',
  'compare.notPredicted': '(не е предвидено: устройството решава какво да съхрани)',
  'compare.plaintext': 'няма (нешифрован)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'не можа да бъде прочетен по един и същи начин два пъти',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (ключът, с който буутлоудърът проверява слотовете, е изведен от {bank:acc}, в който той е влязъл без проверката си) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered':
    '{bank}, както го отбелязва камерата (дума на активния слот {word})',
  'preserve.lastStart.notRead': 'неизвестно — думата на активния слот не можа да бъде прочетена',
  'preserve.lastStart.noBank':
    'неизвестно — думата на активния слот е {word}, което не посочва слот',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'неизвестно — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'не се записва — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'образ',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — може да бъде записан',
  'preserve.bank.writablePatch': '{build} — може да бъде записан; пачът променя байтове: {count}',
  'preserve.bank.writableEdit': '{build} — може да бъде записан; съдържа {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — може да бъде записан; пачът променя байтове: {count}; съдържа {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead':
    'резервното копие още не е прочело слотовете, така че не може да бъде избран слот',
  'preserve.choice.every': 'всеки слот, който съдържа образ: {banks}',
  'preserve.choice.everyBlocked':
    'не всеки слот с образ може да бъде записан: {bank:nom} не може — {reason}',
  'preserve.choice.noImage': 'нито един слот не съдържа образ, който сесията може да запише',
  'preserve.choice.nextStart': '{bank} — слотът за следващото стартиране: {why}',
  'preserve.choice.nextStartRefused':
    'следващото стартиране е от {bank:acc} ({why}), а сесията не може да го запише: {reason}',
  'preserve.choice.everyUnknownStart':
    'всеки слот, който съдържа образ ({banks}): не е известно от кой слот ще е следващото стартиране ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'не е известно от кой слот ще е следващото стартиране ({why}), и {reason}; изберете слот по име',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank:nom} не може да бъде записан: {reason}',
  'preserve.choice.byName': '{banks} — избор по име',
  'preserve.choice.warnNotPatched':
    'Следващото стартиране е от {bank:acc} ({why}), а този избор не прилага пач към него: след рестартирането камерата изпълнява собствения образ на този слот, така че пълното четене спира, преди да прочете каквото и да е. Възстановяването все пак връща всеки записан слот.',
  'preserve.choice.warnUnknownStart':
    'Не е известно от кой слот ще е следващото стартиране ({why}). Ако то е от слот, към който този избор не прилага пач, пълното четене спира, преди да прочете каквото и да е.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'още неизвестна',
  'preserve.build.firmware': 'фърмуер {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'така, както го съхранява камерата (тази камера пази фърмуера си нешифрован)',
  'preserve.stagedForm.oneKey':
    'във формата, в която го съхранява камерата (шифриран с ключа на камерата)',
  'preserve.stagedForm.twoKeys':
    'във формата, в която го съхранява камерата (шифриран с двата ключа на камерата)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'всеки записан слот получава обратно точните байтове, които резервното копие е прочело от него',
  'preserve.restoreForm.factoryStaged':
    'всеки записан слот получава обратно оригиналния си фърмуер, записан във формата, в която го съхранява камерата, така че слотът завършва байт по байт такъв, какъвто го е прочело резервното копие',
  'preserve.restoreForm.none':
    'невъзможно за тази компилация: никоя форма на оригиналния фърмуер не минава собствената проверка на камерата и същевременно не се съхранява обратно като оригиналните байтове, така че сесията завършва с пълния образ и с пача все още на място',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'невъзможно за тази компилация: фърмуерът с пача не може да прочете цялата флаш памет, така че сесията няма пълен образ, който да даде',
  'preserve.drain.rotated': 'камерата я подава завъртяна, а сесията я подрежда отново',
  'preserve.drain.hazard': 'пачът избягва четене, което на тази компилация срива камерата',
  'preserve.drain.whole': 'цялата флаш памет (4 МБ) с едно четене, по {size} байта наведнъж',
  'preserve.drain.wholeNotes':
    'цялата флаш памет (4 МБ) с едно четене, по {size} байта наведнъж; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'позволява на командата за четене на камерата да стигне до цялата флаш памет (4 МБ), а не само до първите 64 КБ',
  'preserve.site.countPast':
    'позволява на позицията за четене да брои след 64 КБ, така че четенето да не се връща в началото',
  'preserve.site.keepPosition':
    'запазва цялата позиция за четене, когато тя се премества след всяко четене',
  'preserve.site.savePosition': 'записва изцяло преместената позиция за четене',
  'preserve.site.clearPosition':
    'изчиства цялата позиция за четене при всяко започване на четене, така че камерата да може да се чете и след пълното четене',
  'preserve.site.modeTwoGuard':
    'позволява на пълното четене да започне като всяко друго четене (заводският фърмуер го отклонява)',
  'preserve.site.modeTwoIndirection':
    'насочва пълното четене към началото на флаш паметта (заводският фърмуер го насочва към стойност, която срива камерата)',
  'preserve.site.armTail':
    'премахва извикване, което замразява камерата, когато на тази компилация започне четене',
  'preserve.site.other': 'променя една инструкция, от която се нуждае пълното четене',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Резервно копие',
  'preserve.step.patch': 'Пач',
  'preserve.step.commit': 'Запис',
  'preserve.step.drain': 'Пълно четене',
  'preserve.step.restore': 'Възстановяване',
  'preserve.step.verify': 'Проверка',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'стъпката „Пач“',
  'preserve.stepId.commit': 'стъпката „Запис“',
  'preserve.stepId.drain': 'стъпката „Пълно четене“',
  'preserve.stepId.restore': 'стъпката „Възстановяване“',
  'preserve.stepId.verify': 'стъпката „Проверка“',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: спряно по план — камерата стартира от {bank:acc}, към който тази сесия не е приложила пач, така че нищо не е прочетено.',
  'preserve.result.noReason': 'не е записана причина',
  'preserve.result.stopped': '{label}: спряно — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none':
    'нито един слот не съдържа фърмуер, към който сесията може да приложи пач',
  'preserve.result.writable.one':
    '{banks:nom} съдържа фърмуер, към който сесията може да приложи пач',
  'preserve.result.writable.many':
    '{banks:nom} съдържат фърмуер, към който сесията може да приложи пач',
  'preserve.result.backup':
    '{label}: запазен е всеки блок, до който стига обикновеното четене; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'слот, който не е известен',
  'preserve.result.backupNext':
    '{label}: запазен е всеки блок, до който стига обикновеното четене; {writable}; следващото стартиране е от: {next}.',
  'preserve.result.patch': '{label}: подготвен за {banks:acc}.',
  /** The patch step when every bank was refused: nothing to build for. */
  'preserve.result.patchNone':
    '{label}: не е подготвен пач: нито един слот не съдържа фърмуер, към който сесията може да приложи пач.',
  'preserve.result.patchCount':
    '{label}: подготвен за {banks:acc}; във всеки се променят байтове: {count}.',
  'preserve.result.commitOne': '{label}: {banks:nom} е записан с пача и камерата го прие.',
  'preserve.result.commitMany':
    '{label}: {banks:nom} са записани с пача и камерата прие всеки от тях.',
  'preserve.result.drainNotRead': '{label}: не е прочетено.',
  'preserve.result.drain':
    '{label}: цялата флаш памет (4 МБ) е прочетена; пълният образ има sha256 {sha256}.',
  'preserve.result.drainThrough':
    '{label}: цялата флаш памет (4 МБ) е прочетена чрез {bank:acc}; пълният образ има sha256 {sha256}.',
  'preserve.result.restore': '{label}: оригиналът е върнат в {banks:acc}.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}: оригиналът е върнат в {banks:acc} {form}.',
  'preserve.result.verifyDone': '{label}: готово.',
  'preserve.result.verifyIdentical':
    '{label}: прочетени отново блокове: {blocks}, различаващи се байтове: 0 — флаш паметта на камерата е байт по байт същата като резервното копие.',
  'preserve.result.verifyDiffers':
    '{label}: прочетени отново блокове: {blocks}, различаващи се байтове: {bytes}.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: прочетени отново блокове: {blocks}, различаващи се байтове: {bytes}, {count} блок не можа да бъде прочетен.',
    other:
      '{label}: прочетени отново блокове: {blocks}, различаващи се байтове: {bytes}, {count} блока не можаха да бъдат прочетени.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Спряно преди пълното четене: камерата стартира от слот, към който тази сесия не е приложила пач, така че нищо не е прочетено.',
  'preserve.unpatchedStart.next':
    'Следва: възстановяването връща всеки записан слот. Пълното четене не се опитва отново: камерата би стартирала от същия слот.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Готово — фърмуерът ви е съхранен',
  'preserve.done.detail':
    'Пълният образ е цялата оригинална флаш памет на камерата, а самата камера е върната точно в предишното си състояние.',
  'preserve.done.titleNoImage':
    'Готово — камерата е върната в предишното си състояние; няма пълен образ',
  'preserve.done.detailNoImage':
    'Пълното четене не беше изпълнено, така че тази сесия няма пълен образ на флаш паметта. Всеки записан слот е върнат, а ново четене на блоковете, до които стига обикновеният дъмп, съвпада с резервното копие. За пълен образ започнете нова сесия с избор, който включва слота за следващото стартиране.',
  'preserve.done.detailNoImageCount':
    'Пълното четене не беше изпълнено, така че тази сесия няма пълен образ на флаш паметта. Всеки записан слот е върнат, а ново четене на {blocks} блока, до които стига обикновеният дъмп, съвпада с резервното копие. За пълен образ започнете нова сесия с избор, който включва слота за следващото стартиране.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'четецът на прозорци на камерата има ограничен бюджет за всяко стартиране и тези четения са дошли от изчерпан четец — изключете и включете захранването на камерата (извадете кабела и го поставете отново или използвайте бутона ѝ за захранване), след това изпълнете отново `preserve --resume <run-directory>`. Сигнатура: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'четецът на прозорци на камерата има ограничен бюджет за всяко стартиране и тези четения са дошли от изчерпан четец — изключете и включете захранването на камерата (извадете кабела и го поставете отново или използвайте бутона ѝ за захранване), след това изпълнете отново `preserve --resume <run-directory>`. Сигнатура: {signature} — от тези байтове не може да се извлече заводски нешифрован образ. Опитан е всеки начин за прочитането му:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'резервното копие не съдържа {bank:acc} ({address}) — заводските прозорци не могат да го подадат',
  'preserve.fail.readsDisagree':
    'двете прочитания на {bank:acc} не съвпадат (sha256 {sha256} срещу {other}) — камера, която не може да подаде два пъти подред слота, от който работи, не е камера, в която да се записва; прочетеното е източникът за възстановяване и входните данни за извличането на пача',
  'preserve.fail.notFactory':
    '{bank:ins} не съдържа заводския образ така, както го съхранява шифърът на тази компилация (очакваното начало на образа не съвпада с прочетеното) — отказ, преди да бъде отбелязано, а още по-малко записано каквото и да е',
  'preserve.fail.ffSum':
    'фърмуерът с пача във формата, в която го съхранява камерата, не минава собствената проверка на тази компилация (сумата му трябва да е {sum}) — отказ да се изпрати слот, който камерата би отхвърлила след изтриването',
  'preserve.fail.headChanged':
    'началото на {bank:acc} се е променило след резервното копие (не съдържа нито оригиналното прочитане, нито байтовете с пача) — отказ да се записва върху неизвестно състояние на слота; нищо не е записано. Начало в hex: сега {live} срещу прочетеното {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    'В {banks:acc} вече има байтовете с пача — записът е минал при предишен опит и не трябва да се повтаря. Продължете от стъпката за пълно четене (--resume), която стартира образа с пача и продължава оттам.',
  'preserve.fail.landed':
    'В {banks:acc} вече има байтовете с пача — записът е минал при предишен опит и не трябва да се повтаря. Продължете от стъпката за пълно четене (--resume), която стартира образа с пача и продължава оттам.',
  'preserve.fail.drainRebootRefused':
    'командата за рестартиране на пълното четене беше ОТКАЗАНА от хоста, преди да излезе (SecurityError: правило на браузъра или защита в тест), така че камерата все още изпълнява образа, с който е стартирала, а не записания пач. Пълното четене чете само през разширения прозорец на образа с пача, така че спира, преди да активира каквото и да е; нищо не е прочетено. Изпълнете пълното четене отново там, където хостът пропуска командата за рестартиране.',
  'preserve.fail.shiftedRebootRefused':
    'пълното четене се върна с една страница по-високо, а рестартирането за ново стартиране беше ОТКАЗАНО от хоста, преди да излезе (SecurityError: правило на браузъра или защита в тест) — нов опит би прочел същото изместено стартиране. Нищо не е запазено; изпълнете пълното четене отново там, където командата за рестартиране може да излезе.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'проверката прочете {count} различаващ се байт (прозорци: {read}/{total}) — паметта не се препрочита байт по байт еднаква с резервното копие',
    other:
      'проверката прочете {count} различаващи се байта (прозорци: {read}/{total}) — паметта не се препрочита байт по байт еднаква с резервното копие',
  },
  'preserve.fail.verifyIn': {
    one: 'проверката прочете {count} различаващ се байт (прозорци: {read}/{total}; в {places}) — паметта не се препрочита байт по байт еднаква с резервното копие',
    other:
      'проверката прочете {count} различаващи се байта (прозорци: {read}/{total}; в {places}) — паметта не се препрочита байт по байт еднаква с резервното копие',
  },
  'preserve.fail.verifyShort': {
    one: 'проверката прочете {count} различаващ се байт (прозорци: {read}/{total}; къси прозорци: {short}) — паметта не се препрочита байт по байт еднаква с резервното копие',
    other:
      'проверката прочете {count} различаващи се байта (прозорци: {read}/{total}; къси прозорци: {short}) — паметта не се препрочита байт по байт еднаква с резервното копие',
  },
  'preserve.fail.verifyInShort': {
    one: 'проверката прочете {count} различаващ се байт (прозорци: {read}/{total}; в {places}; къси прозорци: {short}) — паметта не се препрочита байт по байт еднаква с резервното копие',
    other:
      'проверката прочете {count} различаващи се байта (прозорци: {read}/{total}; в {places}; къси прозорци: {short}) — паметта не се препрочита байт по байт еднаква с резервното копие',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'блока за конфигурация на стартирането',
  'preserve.fail.dataBlock': 'блок с данни',

  'preserve.refused.secondRead': 'второто му прочитане не успя ({error})',
  'preserve.refused.readsDisagree':
    'двете му прочитания не съвпадат (sha256 {sha256} срещу {other})',
  'preserve.refused.erased': 'изтрит е',
  'preserve.refused.watchdogMark':
    'думата в заглавието му на +0x200 съдържа {word} — знака, който буутлоудърът записва върху слот след нулиране от watchdog в началото на стартирането; буутлоудърът вече не приема този слот и сесията няма образ, към който да приложи пач там',
  'preserve.refused.noHeader': 'няма заглавие на образ на +0x200',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'съдържа {image} ({id}), а не компилацията, която изпълнява камерата ({camera})',
  'preserve.refused.otherKey':
    'проверката на буутлоудъра го отхвърля: той е съхранен с друг ключ, а не с този, с който буутлоудърът на тази камера проверява слотовете, а запис през камерата би го съхранил с онзи ключ, така че възстановяването не би могло да върне точните му байтове',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'камерата съобщава фърмуер {camera}, а е нужен {version} — пачът е извлечен от байтовете на една компилация и не трябва да се изпраща на друга',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'фърмуерът {version} не е компилация 0.x или 1.x, а тази сесия покрива само компилациите от 2014 и 2016 г. Не е прочетено нищо освен версията. Вместо това прочетете тази камера с „Дъмп и дешифриране 4.x/Nano“: той чете флаш паметта без пач, всеки блок освен този на 0x14060000, до който на тези компилации не стига никой прозорец за четене.',
  'preserve.refused.preWidening':
    'фърмуерът {version} е по-стар от пътя за разширяване и сесията отказва, вместо да записва върху слот, който не може да прочете обратно. При това поколение камерата отклонява всеки начин за започване на четенето, от който се нуждае пътят (измерено на 0.3.0.1), командата ѝ за четене не стига до началото на флаш паметта, а размерът, който пачът би променил, се съхранява по различен начин. Тя няма и четене, което стандартен дъмп може да използва. Не е прочетено нищо освен версията.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'съдържа неизвестен образ (не заводския фърмуер {version}, нито негова промяна, която Preserve познава), така че Preserve не му прилага пач и не го връща',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'съдържа известна компилация с кадрова честота: заводския фърмуер {version} с пач за кадрова честота {hz} Hz. Preserve прилага пач само към заводския фърмуер, никога към образ с пач, така че не прилага пач към този слот и не го връща',
  'preserve.image.frameRateEarlier':
    'съдържа известна компилация с кадрова честота: заводския фърмуер {version} с по-ранен пач за кадрова честота {hz} Hz (направен преди към него да бъде добавена поправката за USB). Preserve прилага пач само към заводския фърмуер, никога към образ с пач, така че не прилага пач към този слот и не го връща',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    'слотът {what}. За да включите този слот, първо запишете в него заводския образ (например от пълно резервно копие на флаш паметта, направено преди промяната), след това започнете нова сесия',
  'preserve.image.frameRateWords':
    'слотът {what}. За да включите този слот, първо запишете в него заводския образ (например от пълно резервно копие на флаш паметта, направено преди пача за кадрова честота), след това започнете нова сесия; пачът за кадрова честота може да бъде направен отново върху заводския образ след това',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name:ins} {what}. Сесията взима фърмуера, към който прилага пач, от този слот, така че спира тук, преди да бъде записано каквото и да е. За да съхраните тази камера, първо запишете заводския образ в {bank:acc} (например от пълно резервно копие на флаш паметта, направено преди промяната), след това започнете нова сесия.',
  'preserve.image.frameRateRefusal':
    '{name:ins} {what}. Сесията взима фърмуера, към който прилага пач, от този слот, така че спира тук, преди да бъде записано каквото и да е. За да съхраните тази камера, първо запишете заводския образ в {bank:acc} (например от пълно резервно копие на флаш паметта, направено преди пача за кадрова честота), след това започнете нова сесия; пачът за кадрова честота може да бъде направен отново върху заводския образ след това.',
  'preserve.image.otherFirmware':
    'съдържа фърмуер {image}, а не {camera}, който изпълнява камерата',
  'preserve.image.otherFirmwareRefusal':
    '{name:ins} съдържа фърмуер {image}, а не {camera}, който изпълнява камерата, така че тази сесия няма образ, към който да приложи пач там, и отказва, вместо да записва върху него.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'от него не може да се извлече образ, към който сесията да приложи пач ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone': 'тази сесия е завършена — всички стъпки са изпълнени (сесия {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    'стъпката {step} вече е изпълнена в тази сесия (завършена {finished}) — продължаването започва от {next}',
  'preserve.gate.stepDoneUnknownTime':
    'стъпката {step} вече е изпълнена в тази сесия (завършена в неизвестен момент) — продължаването започва от {next}',
  'preserve.gate.backupRerun':
    'резервното копие не може да се изпълни отново: тази сесия вече е завършила {steps} и следващата ѝ стъпка е {next} — използвайте --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'предишният опит за резервно копие не успя и захранването на камерата трябва да бъде ИЗКЛЮЧЕНО И ВКЛЮЧЕНО, преди тази стъпка да се изпълни отново — повторен опит при същото стартиране може да прочете остарели или празни байтове (измерено: повторено резервно копие прочете думата за стартиране на буутлоудъра вместо записа за конфигурация на стартирането). Изключете и включете захранването на камерата (извадете кабела и го поставете отново или използвайте бутона ѝ за захранване), след това изпълнете резервното копие отново и потвърдете изключването, когато бъдете попитани: сесията не може да види това. Записаната грешка: {error}',
  'preserve.gate.noErrorText': '(няма текст на грешката)',
  'preserve.gate.patchAfterBackup':
    '{step} се изпълнява след резервното копие: сесията взима дъмпа на всяка област, която заводският план може да прочете, и го запазва, ПРЕДИ да се случи каквото и да е друго — това резервно копие е единственото копие на тази камера. Първо изпълнете стъпката за резервно копие.',
  'preserve.gate.commitAfterBackup':
    '{step} се изпълнява след резервното копие (вижте стъпката „Пач“)',
  'preserve.gate.commitAfterPatch':
    '{step} се изпълнява след стъпката „Пач“, която отбелязва какво изпраща',
  'preserve.gate.commitNeedsPatch':
    '{step} се нуждае от пача за {banks:acc}, а стъпката „Пач“ не е отбелязала нито един — изпълнете стъпката „Пач“ отново',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step} изисква файловете на резервното копие в директорията на сесията, а те липсват: {files} — без тях записът няма източник за възстановяване, затова отказва',
  'preserve.gate.drainNoCommit':
    '{step} чете частта С ПАЧ през разширения прозорец, а тази сесия няма завършен запис — пълното четене би блокирало на заводска камера. Първо изпълнете записа (или продължете от него) или прескочете изрично (allowJump), ако записът е минал без контролната си точка.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'стъпката за пълно четене отказва за {build}: {note}',
  'preserve.gate.detectedBuild': 'разпознатата компилация',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'стъпката за пълно четене отказва за {build}: започването на пълното четене на фърмуера на тази компилация без пач срива камерата (тя чете от стойност, която не е адрес във флаш паметта; измерено на емулатора: подадени 32 КБ, след което камерата се срина). Промяната, която прави четенето безопасно, е на {sites} и не е сред промените, които тази сесия е отбелязала за {bank:acc} — изпълнете стъпката „Пач“ (и направете записа) преди пълното четене.',
  'preserve.gate.drainFiles':
    '{step} се нуждае от {files} (полученият дъмп се обработва допълнително с прочитането на всеки записан слот), а го няма в директорията на сесията',
  'preserve.gate.restoreNoCommit':
    '{step} връща оригиналните слотове върху пача, а тази сесия няма завършен запис — няма какво да се връща. Първо изпълнете записа (или продължете от него) или прескочете изрично (allowJump), за да възстановите камера, която вече е с пач.',
  'preserve.gate.restoreNeedsPatch':
    '{step} се нуждае от обобщението на пача за всеки записан слот (за дължината за изпращане) — първо изпълнете стъпката „Пач“',
  'preserve.gate.restoreNoForm':
    'стъпката за възстановяване отказва за {build}: никоя форма на оригиналния фърмуер не минава собствената проверка на камерата и същевременно не се съхранява обратно като оригиналните байтове — контролната сума на оригиналния фърмуер е 0xB7AB9D17 (измерено), а не 0xFFFF, която камерата изисква. Тази сесия завършва с пълния образ в ръка и с пача на място; оригиналното съдържание може да бъде върнато само с програматор за цялата флаш памет.',
  'preserve.gate.restoreFiles':
    '{step} се нуждае от {files} (оригинала на всеки записан слот от стъпката за резервно копие), а го няма в директорията на сесията',
  'preserve.gate.verifyNoRestore':
    '{step} сравнява ново стартиране с резервното копие, а тази сесия няма завършено възстановяване — слот с пач би се показал като разлики. Първо изпълнете възстановяването (или продължете от него) или прескочете изрично (allowJump), ако възстановяването е минало без контролната си точка.',
  'preserve.gate.verifyNeedsBackup':
    '{step} се нуждае от {file} (еталона за сравнението), а го няма в директорията на сесията',
  'preserve.gate.needsBanks':
    '{step} се нуждае от слотовете, прочетени от стъпката за резервно копие, а в състоянието няма такива',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'за тази сесия не са избрани слотове: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank:nom} не може да бъде записан: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'пачът на тази компилация стартира само от слота за възстановяване R: {note} — сесията би записала в {bank:acc}, откъдето буутлоудърът никога не го стартира',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'файлът е твърде малък, за да съдържа заглавие на образ',
  'slots.image.notWordSized': 'размерът на образа трябва да е кратен на 4 (получено {size} Б)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'образът е {size} Б; буутлоудърът отхвърля всяко header.length >= {limit}, така че никога не би стартирал',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'няма заглавие на образ на {at} (сигнатура {magic}, очаквано {expected}) — това трябва да е дешифриран образ на фърмуер на Seek, а не шифриран слот или дъмп на флаш паметта',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'началният указател на стека {address} не е в SRAM на LPC43xx — това не изглежда дешифрирано',
  'slots.image.stackUnaligned': 'началният указател на стека {address} не е подравнен по дума',
  'slots.image.notThumb': 'векторът за нулиране {address} не е адрес Thumb',
  'slots.image.noKeyPair':
    'името на този файл не съдържа двойката му ключове, а в образа нито двойката на тази камера, нито декодирана двойка на приложение се среща точно веднъж, така че не може да се каже за кои ключове е изграден образът. Дешифрираните файлове излизат с имена, съдържащи ключовете им.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'името на файла твърди ключ A {keyA} и ключ B {keyB}, но {mismatch}. И двата ключа трябва да присъстват, всеки точно веднъж.',
  'slots.image.keyInHeader':
    'този образ пази ключ на {at}, вътре в нешифрования прозорец на заглавието — отказ да му се приложи пач',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'ключ A и ключ B от името на файла сочат към припокриващи се байтове на {at} и {other} — те трябва да са две различни 16-байтови стойности',
  'slots.image.retargetLost':
    'след пренасочването образът не съдържа двойката ключове на тази камера точно веднъж — отказ да се изгради пакет, за чиито следващи обновявания буутлоудърът не би могъл да намери ключ',
  'slots.image.noStageKey':
    'образът не съдържа двойка ключове от линията 2016, така че няма ключ за изпращане, с който да бъде кодиран',
  'slots.image.ffSumNoKeys':
    'този образ има сумата на думите 0xFFFF на FF 16 Hz, но не съдържа двойката ключове на 1.3.0.8-FF (двете половини, всяка веднъж), така че формата му за изпращане не може да бъде изградена. Нищо не е записано.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'това е образът 1.3.0.8 FF (16 Hz), който се изпраща в собствената си форма с ключ A (ff-form.ts), а не като нешифрован образ. Нищо не е записано.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'планът е изграден за фърмуер {firmware}, а анализът чете {version}. Планът е остарял; изградете го отново. Нищо не е записано.',
  'slots.plan.otherFirmwareUnknown':
    'планът е изграден за фърмуер с неизвестна версия, а анализът чете {version}. Планът е остарял; изградете го отново. Нищо не е записано.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'планът е изграден за камера {planSerial}, а анализът чете {serial}. Отказ да се запише тук. Нищо не е записано.',
  'slots.plan.cameraUnknownSerial': 'с неизвестен сериен номер',
  'slots.plan.unknownSerial': 'неизвестен сериен номер',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, inside the sentence ("slot A"). */
  'slots.plan.otherAddress':
    'планът е насочен към {address}, но {name:nom} на компилацията е на {at}',
  'slots.plan.notRead': 'анализът вече не чете {name:acc}. Нищо не е записано.',
  'slots.plan.edited':
    'контролната сума на плана не съвпада с данните му, така че планът е редактиран. Нищо не е записано.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'данните са {size} Б — надхвърлят размера на {name:acc}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck': '{risk}. Записът изисква acknowledgeRisk: true. Нищо не е изпратено.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'тази камера не може да приеме оттук образ, изпратен в открит вид: {reason}. Нищо не е записано.',
  'slots.plan.noKeyTable':
    'анализът не посочва таблицата с ключове на буутлоудъра на тази камера, така че образът не може да бъде пренасочен към нея',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'статусът на потвърждението не можа да бъде прочетен след CompleteMemoryUpgrade, така че {name:nom} може да е записан частично. Прочетете слотовете отново, преди да направите каквото и да е друго, и пазете дъмпа си.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'камерата отказа записа в {name:acc} при потвърждението със статус {status}: {cause}. Нищо не е записано; слотът е непроменен. Прочетете слотовете отново, преди да направите каквото и да е друго.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade върна {status} ({cause}) за {name:acc}: нищо не е програмирано, но изтриването може да е започнало, така че слотът може да е частично изтрит. Прочетете слотовете отново, преди да направите каквото и да е друго, и пазете дъмпа си.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade върна {status} ({cause}) — {name:nom} може да е записан частично. Прочетете слотовете отново, преди да направите каквото и да е друго, и пазете дъмпа си.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'камерата съобщи {status} при изпращането на {name:acc} при отместване {offset} — прекратено преди CompleteMemoryUpgrade, така че нищо не е записано във флаш паметта',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum': 'контролната сума на предаването не съвпадна с изпратените байтове',
  'commit.cause.unsupported':
    'образът не се дешифрира с ключовете на камерата или типът данни е отказан',
  'commit.cause.acceptance':
    'образът е отказан от проверката си за приемане, преди да бъде изтрито каквото и да е (проверката зависи от компилацията)',
  'commit.cause.notArmed': 'не е активирано обновяване на слот',
  'commit.cause.eraseFailed': 'етапът на изтриване не успя',
  'commit.cause.programFailed': 'етапът на програмиране не успя',
  'commit.cause.verifyFailed': 'етапът на проверка не успя',
  'commit.cause.unknown': 'статус, който тук не е известен',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name:ins} не се копира върху себе си. Нищо не е записано.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Нищо не е записано.',
  'copy.refused.noPlain': 'В {name:acc} няма дешифриран образ за копиране. Нищо не е записано.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} е ZIP, който не може да бъде прочетен тук ({error}). Нищо не е записано.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} не съдържа цялата флаш памет. ZIP се приема, когато е файл на сесия на Preserve, който съдържа {preserve} (след като стъпката му за пълен дъмп е изпълнена), zip от „Дъмп и дешифриране 4.x/Nano“ ({dump}) или zip от „Дъмп на всички селектори“ ({selectors}); съдържанието на този ZIP: {names}. Нищо не е записано.',
  'restore.refused.noWholeFlashPatched':
    '{file} не съдържа цялата флаш памет. ZIP се приема, когато е файл на сесия на Preserve, който съдържа {preserve} (след като стъпката му за пълен дъмп е изпълнена), zip от „Дъмп и дешифриране 4.x/Nano“ ({dump}) или zip от „Дъмп на всички селектори“ ({selectors}); съдържанието на този ZIP: {names}. Файлът {patched} в него е флаш паметта с временния пач на сесията, затова не се приема. Нищо не е записано.',
  'restore.refused.zipEmpty': 'няма файлове',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'пълното резервно копие на флаш паметта е {full} Б (4 МБ — цялата памет, която чете J-Link); {file} е {size} Б. Нищо не е записано.',
  'restore.refused.noBank': 'в плана на тази компилация няма {bank}. Нищо не е записано.',
  'restore.refused.outsideFlash':
    '{name:ins} не е в рамките на флаш памет от 4 МБ. Нищо не е записано.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    'Дъмпът, от който идва {file}, не е прочел {where}: според неговия manifest.json {address} е празнина. Няма образ за възстановяване. Нищо не е записано.',
  'restore.refused.gapReason':
    'Дъмпът, от който идва {file}, не е прочел {where}: според неговия manifest.json {address} е празнина ({gap}). Няма образ за възстановяване. Нищо не е записано.',
  'restore.refused.gapFill':
    'Дъмпът, от който идва {file}, не е прочел {where}: според неговия manifest.json {address} е празнина, запълнена с {fill}. Няма образ за възстановяване. Нищо не е записано.',
  'restore.refused.gapReasonFill':
    'Дъмпът, от който идва {file}, не е прочел {where}: според неговия manifest.json {address} е празнина ({gap}), запълнена с {fill}. Няма образ за възстановяване. Нищо не е записано.',
  'restore.refused.empty':
    'В {where} няма данни: всеки байт е 0xFF. Записът програмира образ и не може да остави слот изтрит, така че празен слот не може да бъде възстановен със запис. Нищо не е записано.',
  'restore.refused.fill':
    'В {where} всеки байт е {fill} — запълването, което дъмпът записва там, където не е прочел нищо: дъмпът не е прочел този слот. Няма образ за възстановяване. Нищо не е записано.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    'Съдържанието на {where} не може да бъде възстановено от този файл: {why}. Нищо не е записано.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'тази компилация няма активиране за запис за слота',
  'support.noStagingEmpty':
    'тази компилация няма форма за изпращане, така че празен слот не се записва',
  'support.buildUnknown': 'компилацията е неизвестна',
  'support.unverifiedStaging':
    'тази компилация е от заключената линия 0.x/1.x, но не е сред компилациите, на които са измерени таблиците с пачове за съхраняване (0.8.0.0 .. 1.3.0.8 и 1.0.3.0 / 1.0.3.2), така че формата за изпращане на слота ѝ е неизвестна и нищо не се записва',
  'support.unknownFamily':
    'семейството на камерата не е известно, а следователно и ключът, с който се записват слотовете ѝ, а камерата приема слот, записан с грешен ключ, и след това не стартира от него. Направете дъмп и дешифрирайте тази камера, разпознайте я по дъмпа, след това посочете семейството ѝ с --family.',
  'support.noReadCommand':
    'фърмуерът, по-стар от 0.8.0.0, няма обработчик за четене за GetFeaturedFirmwareData — командата, с която дъмпът чете флаш паметта. На 0.7.0.7 и 0.7.0.8 тя е в таблицата с RPC методи на 0x4F, но е регистрирана само като setter (обработчик за запис), така че четенето control-IN, което изпраща дъмпът, не може да бъде обработено (сесията на Preserve чете тези две компилации вместо това чрез wire id 0x58, GetFeaturedData); преди 0.7.0.7 wire id 0x4F е UploadFirmwareRowSize, а на 0.3.0.1 wire id 0x52 — този, с който дъмпът активира — е EnterBootloaderMode, а не BeginFirmwareUpgrade: камерата остава в приложението си, но всяко активиране задава цел във флаш паметта и активира етапа на обновяване на фърмуера на тази компилация (след това GetErrorCode чете 0x00400000), което не е прозорец за четене. Извлечено от собствените таблици с методи на образите, и двете колони с обработчици; вижте test/firmware/facts.json.',
  'support.noWritePath':
    'тези компилации приемат нов фърмуер чрез по-стара последователност за обновяване, която тези инструменти не изпращат, а слотовете им никога не са картографирани, така че нищо не се записва.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'версията на фърмуера не можа да бъде прочетена, така че компилацията, слотовете ѝ и формата им за изпращане са неизвестни; нищо не се чете и не се записва на нея',
  'support.versionNotDotted':
    'версията на фърмуера „{version}“ не е версия с точки, така че компилацията, слотовете ѝ и формата им за изпращане са неизвестни; нищо не се чете и не се записва на нея',
  'support.olderThanFirst':
    'фърмуерът {version} е по-стар от {first}: таблицата му RPC няма обработчик за четене за GetFeaturedFirmwareData — командата, която изпраща четенето на слот, — така че към него не се изпраща нито четене, нито запис (early-compact има доказателствата)',
  'support.modernOnLocked':
    'семейството modern-4x покрива 2.x, 4.x, 10.x, 42.x и 44.x; {version} е от заключената линия 0.x / 1.x, за която е нужно legacy-auth или compact-2016',
  'support.lockedOnModern':
    'семейството legacy-auth покрива заключената линия 0.x / 1.x; {version} е от модерната линия, за която е нужно modern-4x',
  'support.notCompactPro':
    'семейството compact-2016 покрива линията 1.0.3.x на Compact PRO; {version} не е от нея',
  'support.earlyCompact':
    'семейството early-compact покрива само компилациите, по-стари от {first}, а {version} се чете чрез legacy-auth',
  'support.generic':
    'семейството на камерата не е разпознато (семейство generic), така че подредбата на слотовете и формата за изпращане са неизвестни; разпознайте камерата, преди да бъде прочетен или записан слот',
  'support.noPlan':
    'няма план на слотовете за семейството {family}: подредбата на слотовете и формата за изпращане не са известни',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'таблицата на тази компилация не активира режим {mode} на {address} по обикновения канал',
  'support.noArmToken':
    'таблицата на тази компилация не активира режим {mode} на {address} по канала с токен',
  'support.windowElsewhere': 'прозорецът за съхраняване на {bank:acc} е на {at}, а не на {address}',
  'support.noDumpWindow':
    'таблицата BeginFirmwareUpgrade на тази компилация няма прозорец на {address} за {bank:acc}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} не поддържа {capability}: {reason}',
  'support.capability.dump': 'дъмп',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': '„Дъмп на всички селектори“',
  'support.capability.decrypt': 'дешифриране',
  'support.capability.deviceInfo': 'пълното четене в раздела „Информация“',
  'support.capability.flash': 'запис на слотове',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name:nom} на {address} не може да се чете на тази компилация: таблицата ѝ със селектори няма прозорец там, така че нищо не е активирано за него',
  'slots.unread.missing': '{name:nom} липсва в анализа на камерата',
  'slots.unread.notRead': '{name:nom} не е прочетен',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Нищо не е записано.',
  'slots.refused.versionUnknown':
    'анализът не казва кой фърмуер изпълнява камерата, а командите за слотовете означават различни неща на различни компилации. Прочетете отново информацията за устройството.',
  'slots.refused.versionUnknownWrite':
    'анализът не казва кой фърмуер изпълнява камерата. Нищо не е записано.',
  'slots.refused.emptyInput': 'входните данни са празни',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable':
    '{name:ins} е празен и не може да бъде записан на тази компилация: {reason}',
  'slots.refused.noRaw': '{name:ins} не може да приеме сурови байтове на тази компилация: {reason}',
  'slots.refused.noPlain':
    '{name:ins} не може да приеме дешифриран образ на тази компилация: {reason}',
  'slots.refused.noStaging':
    '{name:ins} няма форма за изпращане на тази компилация, така че за него не може да бъде кодиран образ',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} Б надхвърлят размера на {name:acc} ({bankSize} Б)',
  'slots.refused.imageTooLong':
    'образът е {size} Б — надхвърля размера на {name:acc} ({bankSize} Б)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'буутлоудърът от 2014 г. не приема контролната сума на тази компилация в слот A или B и стартира слота за възстановяване R (0x14070000), без да го проверява, затова пачът се записва в слота за възстановяване R и никъде другаде',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly':
    'тази компилация работи само от слота за възстановяване R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize': 'слотът на фърмуера е {size} Б ({kib} КБ); този файл е {count} Б',
  'decryptFile.erasedBank':
    'празен, няма какво да се дешифрира: всички {size} Б се четат като 0xFF (изтрит слот)',
  'decryptFile.erasedHeader':
    'изтрит: прозорецът на заглавието е изцяло 0xFF, така че слотът не съдържа образ; нищо не се дешифрира',
  'decryptFile.noHeader':
    'няма заглавие на образ (сигнатура {magic}), така че няма образ за дешифриране',
  'decryptFile.lengthOutOfRange':
    'header.length {length} е извън допустимото; няма образ за дешифриране',
  'decryptFile.ffKeyB':
    'дешифрирани {size} Б с ключ B на FF 1.3.0.8: образът е съхранен като образа XOR ключовия поток на блока му с ключове 1, прозорецът на заглавието — непроменен',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'ключът не е извлечен: образът се дешифрира до вектор за нулиране, който не е входна точка на Cortex-M (ключ {check}); нищо не се дешифрира',
  'decryptFile.storedPlain':
    'съхранен в открит вид: слотът съдържа образа такъв, какъвто се изпълнява (нешифрованата верига от 2014 г., ключов поток на идентичност), така че няма ключ, а дешифрираният образ е самият образ',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 'дешифрирани {size} Б с ключа, извлечен от този слот ({check})',
  'decryptFile.decryptedNamed':
    'дешифрирани {size} Б с ключа, извлечен от този слот ({check}; това е {key:nom})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'кратко четене ({size} Б)',
  'read.reason.noParse': 'заглавието на образа не можа да бъде разчетено',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'няма заглавие на образ (сигнатура {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} е извън допустимото',
  'read.reason.stopped': 'четенето на слота спря на {count}/{size} Б',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'не може да се чете на фърмуер {version}: планът му ({table}) няма прозорец на {address}, така че нищо не е активирано за него',
  'read.reason.notInPlanUnknown':
    'не може да се чете на фърмуер с неизвестна версия: планът му ({table}) няма прозорец на {address}, така че нищо не е активирано за него',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'прозорецът подаде байтовете на остарял дескриптор на четеца — дума 0 {word} с нулиране {hex} е таблицата с вектори на 0x14000000, а не съдържанието на този слот, така че нищо не е анализирано от него: {remedy}',
  'read.reason.spentReader': 'слотовете на камерата не можаха да бъдат прочетени — {remedy}',
  'read.spentRemedy':
    'четецът на прозорци може да е изчерпан за това стартиране; изключете и включете захранването на камерата и опитайте отново',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'думата на активния слот на камерата (fw info roots, селектор 10) не можа да бъде прочетена',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'думата на активния слот на камерата е {word}, което не посочва слот',
  'checkKey.unnamed.cfg0NotRead':
    'думата за конфигурация на стартирането не е прочетена, така че не е известно дали буутлоудърът е проверил {bank:acc}, преди да влезе в него',
  'checkKey.unnamed.noZeroSum':
    'камерата съобщава, че е влязла в {bank:acc}, но при това четене {bank:nom} не се дешифрира до нулева сума на думите',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'камерата съобщава, че е влязла в {bank:acc}, който думата за конфигурация на стартирането {word} оставя за последен, така че буутлоудърът е влязъл в него без проверката си, но при това четене {bank:nom} не се дешифрира до нулева сума на думите',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (оценка {score} след четенето, по данните по-долу)',
  'report.detectedAmbiguous':
    '{family} (оценка {score} след четенето, по данните по-долу; нееднозначно)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'да',
  'report.cell.no': 'не',
  'report.cell.notApplicable': 'н/п',
  'report.cell.unknown': 'неизвестно',
  'report.cell.recoveryOnly': 'само за възстановяване',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'константа K за избелване',
  'report.keyRow.store': 'ключ за съхранение',
  'report.keyRow.check': 'ключ за проверка',
  'report.keyRow.table': 'таблица с ключове',
  'report.keyRow.keys': 'ключове',
  'report.keyRow.a': 'ключ A',
  'report.keyRow.b': 'ключ B',
  'report.keyRow.tableAt': 'таблица на',
  'report.key.notIdentified': '(не е разпознат)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} кандидат, никой не е потвърден',
    other: '{count} кандидата, никой не е потвърден',
  },
  'report.key.tableAt': '{offset} в блока на буутлоудъра, потвърдено спрямо слот',
  'report.key.plainChain':
    'не е нужен: слотовете се съхраняват като нешифрован фърмуер, така че слотът се чете и записва такъв, какъвто е',
  'report.key.tableRefused2016':
    'не е прочетена — блокът на буутлоудъра (0x14000000) се отхвърля по всеки канал на тази линия',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, посочен от {bank:acc} — слота, в който камерата съобщава, че е влязла след проверката на буутлоудъра',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, изведен от {bank:acc} — слота, в който камерата съобщава, че е влязла: буутлоудърът влиза в този слот без проверката си и го изпълнява с ключа, с който проверява другите слотове',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' (блок 1 на {pair})',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'двойката на Compact PRO 1.0.3.x 9 Hz',
  'keyPair.cp1032ff': 'двойката на Compact PRO 1.0.3.x FF',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'не е посочен — {why}',
  'report.checkKey.couldNotName': 'четенето не можа да го посочи',
  'report.storeKey.checkKeyUnnamed':
    'ключът, с който буутлоудърът проверява слотовете (не е посочен при това четене): приложението съхранява с този ключ всеки слот, който записва',
  'report.storeKey.checkKey':
    '{key}: приложението съхранява всеки слот, който записва, с ключа, с който проверява буутлоудърът му',
  'report.storeKey.unknown':
    'неизвестен — блокът на буутлоудъра, който съдържа мястото за ключа на устройството, не е прочетен',
  'report.storeKey.keyBUnidentified':
    'Ключ B (не е програмиран ключ на устройството; самият ключ B не е разпознат)',
  'report.storeKey.keyB': 'Ключ B (не е програмиран ключ на устройството)',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain': 'се изпраща в открит вид (образът такъв, какъвто е, без ключ)',
  'report.staged.slotKeystream': 'се изпраща шифриран с блока с ключове 0 на собствения си образ',
  'report.staged.keyA':
    'се изпраща шифриран с ключове, получени от слота, от който е стартирала камерата, и от работещото приложение',
  'report.staged.ffVendor':
    'се изпраща така, както фирменото приложение изпраща образа FF 16 Hz (образът XOR собствения му блок с ключове 0), а камерата го съхранява с ключ B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Резервно копие: блок {address}',
  'progress.backupDone': 'Резервно копие: всички блокове са прочетени',
  'progress.checkBlock': 'Проверка: блок {address}',
  'progress.checkDone': 'Проверка: всички блокове са прочетени',
  'progress.writingBank': 'Запис в {bank:acc}',
  'progress.restoringBank': 'Възстановяване на {bank:acc}',
  'progress.staged': '{label}: изпратени {done}/{total} Б',
  'progress.wholeFlash': 'Пълно четене: {got}/{total} Б',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'четене на {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'четене на {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Готово — прочетени прозорци: {ok}/{total}.',
  'progress.readingBank': 'Четене на {bank:acc} ...',
  'progress.analysing': 'Анализиране ...',
  'progress.probeSelector': 'проверка на селектор {selector} ...',
  'progress.selectorsArmed': 'Готово — активирани селектори: {armed}/{span}, с данни: {withData}.',
  'progress.recoveringKey': 'дешифриране: извличане на ключа за {address} ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} {address} (subcmd {subcmd}) не можа да бъде прочетен: {error}',
  'slots.read.refusedBuild':
    'отхвърля се четенето на слотовете на фърмуера: {reason}. Не е изпратено нищо освен четенето на версията, така че никой слот не е засегнат.',
  'slots.backup.notSaved':
    'резервното копие {file} не е запазено, така че нищо не е записано. Запис никога не се изпълнява, без първо да е запазено резервното му копие; опитайте пак, когато то може да бъде запазено.',
  'slots.backup.notSavedWhy':
    'резервното копие {file} не е запазено ({error}), така че нищо не е записано. Запис никога не се изпълнява, без първо да е запазено резервното му копие; опитайте пак, когато то може да бъде запазено.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'висока (480 Mbit/s)',
  'usb.speed.full': 'пълна (12 Mbit/s)',
  'usb.speed.code': 'код {code}',
} satisfies Translation<'core', 'bg'>;
