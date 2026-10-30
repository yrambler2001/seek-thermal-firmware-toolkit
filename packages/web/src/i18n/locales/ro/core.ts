/**
 * Namespace `core`, română (ro), translated from the English source: sentences that `@seek-fw/core` makes and
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
    'camera rămâne deblocată până la o oprire și repornire a alimentării, iar până atunci alte instrumente o pot citi greșit; opriți-o și reporniți-o înainte să le folosiți',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': '{first} primul, apoi {second}, apoi {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'nu a fost citit',
  'boot.verdict.checkKeyUnnamed':
    'nu a putut fi verificat: cheia cu care bootloader-ul lui verifică un slot nu a fost numită',
  'boot.cfg0NotRead':
    'cuvântul de configurare a pornirii (cfg[0]) nu a fost citit, așa că nu se știe ce slot rulează la următoarea pornire',
  'boot.select.unknown':
    'cuvântul de configurare a pornirii este {word}, așa că bootloader-ul încearcă mai întâi {first:acc}, dar {bank:acc} {verdict}, așa că nu se știe ce slot rulează',
  'boot.select.first':
    'cuvântul de configurare a pornirii este {word}, așa că bootloader-ul încearcă mai întâi {first:acc}, iar acesta conține o imagine pe care bootloader-ul o acceptă',
  'boot.select.second':
    'cuvântul de configurare a pornirii este {word}, așa că bootloader-ul încearcă mai întâi {first:acc}; {first:acc} nu conține nicio imagine pe care bootloader-ul o acceptă, așa că alege {second:acc}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'cuvântul de configurare a pornirii este {word}, așa că bootloader-ul încearcă mai întâi {first:acc}; nici {first:acc}, nici {second:acc} nu conține o imagine pe care bootloader-ul o acceptă, așa că pornește {last:acc}, pe care nu îl verifică',
  'boot.select.lastTakes':
    'cuvântul de configurare a pornirii este {word}, așa că bootloader-ul încearcă mai întâi {first:acc}; nici {first:acc}, nici {second:acc} nu conține o imagine pe care bootloader-ul o acceptă, așa că alege {last:acc}, pe care nu îl verifică',
  'boot.bootsNow': '{bank:ins} este slotul din care pornește camera acum',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'pornit acum',
  'boot.notBooted': 'nepornit',
  'boot.unknownWhy.checkKeyUnnamed':
    'cheia cu care bootloader-ul lui verifică un slot nu a fost numită la această citire',
  'boot.unknownWhy.noKeyTable':
    'tabelul de chei al bootloader-ului nu a fost citit, așa că cheile pe care le încearcă nu pot fi numite',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'Camera pornește din {bank:acc}. {why}.',
  'fpsBoot.holdsOne':
    '{bank}: conține un patch pentru rata de cadre, dar slotul nu rulează, așa că patch-ul nu are efect.',
  'fpsBoot.holdsTwo':
    '{banks}: conțin patch-uri pentru rata de cadre, dar niciunul nu rulează, așa că patch-urile nu au efect.',
  'fpsBoot.wouldNotRun':
    'Un patch aplicat pe {target:acc} nu l-ar face să ruleze, pentru că camera pornește în schimb din {bank:acc}.',
  'fpsBoot.patchRunning':
    'Aplicați patch-ul și pe {bank:acc} (slotul care rulează): așa intră în vigoare patch-ul pentru rata de cadre.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank}: nu poate primi patch-ul aici ({reason}), așa că un patch pentru rata de cadre în alt slot nu are efect pe această cameră.',

  /* ---- backup: the zip saved before a bank write (slots/backup); `{name}` is the bank inside a sentence ("slot B"): each is an item of backup.plan.* ---- */
  'backup.bank.notInPlan': '{name:acc} (nu este în planul acestui build: arhiva zip o spune)',
  'backup.bank.unsupported':
    '{name:acc} (acest build nu îl poate citi, {reason}: arhiva zip o spune)',
  'backup.bank.empty':
    '{name:acc} (gol, fiecare octet 0xFF: arhiva zip o spune, iar scrierea nu suprascrie niciun firmware)',
  'backup.bank.unread':
    '{name:acc} (citirea sloturilor nu a ajuns la el: arhiva zip spune dacă ajunge citirea dinaintea scrierii)',
  'backup.bank.noKey':
    '{name:acc} (așa cum este stocat; nicio cheie recuperată de această citire nu îl deschide, așa că nu există fișier decriptat)',
  'backup.bank.decrypted': '{name:acc} (așa cum este stocat și decriptat)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Înainte să se scrie ceva, {banks} este citit din nou și salvat într-o singură arhivă zip, cu o notă despre ce este fiecare fișier: {file}.',
  'backup.plan.many':
    'Înainte să se scrie ceva, {banks} sunt citite din nou și salvate într-o singură arhivă zip, cu o notă despre ce este fiecare fișier: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'criptat astfel încât dispozitivul să îl stocheze cu cheia pe care o conține slotul de pornire',
  'staging.detail.slotKeystreamCiphertext':
    'criptat cu propria cheie de transfer a imaginii (blocul de chei 0); camera îl stochează cu cheia proprie a slotului',
  'staging.detail.plain': 'necriptat, fără cifru',
  'staging.detail.keyAKeystream':
    'imaginea 1.3.0.8 FF așa cum o transferă aplicația producătorului (XOR cheia A) — build-ul de 16 Hz o stochează cu cheia B, nu acești octeți',
  'staging.detail.verbatim': 'ca atare — octeții exact cum au fost dați',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'nicio citire',
  'copy.source.notInPlan': '{name:acc} nu este în planul acestui build',
  'copy.source.notRead':
    '{name:acc} nu a fost citit ({reason}), așa că nu există nicio imagine de copiat',
  'copy.source.empty': '{name:acc} este gol: nu există nicio imagine de copiat',
  'copy.source.foreign':
    '{name:acc} nu conține nicio imagine de firmware pe care această citire să o recunoască, așa că nu este nimic de copiat',
  'copy.source.noKey':
    'nicio cheie recuperată de această citire nu deschide {name:acc}, așa că nu există nicio imagine decriptată de copiat',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} la {address}, așa cum l-a decriptat citirea sloturilor',
  'copy.fromVersion':
    '{name} la {address}, firmware {version}, așa cum l-a decriptat citirea sloturilor',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'Imaginea este a {name:gen}, așa cum a decriptat-o citirea sloturilor: {size} B, sha256 {sha256}.',
  'copy.noteVersion':
    'Imaginea este a {name:gen}, așa cum a decriptat-o citirea sloturilor: firmware {version}, {size} B, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '{name:acc} din copia de rezervă (la {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where}, în copia de rezervă completă {file}',
  'restore.fromVersion': '{where}, în copia de rezervă completă {file}, firmware {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'o imagine a memoriei flash de 4 MB',
  'restore.kind.preserve-run': 'un fișier de rulare Preserve',
  'restore.kind.dump': 'o arhivă zip „Extragere și decriptare 4.x/Nano”',
  'restore.kind.all-selectors': 'o arhivă zip „Extragerea tuturor selectorilor”',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'o imagine',
  'restore.decryptedTo.firmware': 'firmware-ul {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'Imaginea este {where} din {file}, {kind}: sha256 stocat {stored}, decriptată ca {decrypted} de {size} B (sha256 {sha256}).',
  'restore.note.imageEntry':
    'Imaginea este {where} din {file}, {kind} ({entry} din ea): sha256 stocat {stored}, decriptată ca {decrypted} de {size} B (sha256 {sha256}).',
  'restore.note.readBack':
    'După scriere, slotul recitit este comparat cu octeții slotului stocați în copia de rezervă.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'Blocul de identitate al copiei de rezervă numește această cameră (număr de serie {serial}).',
  'restore.note.sameBytes':
    '{name:ins} conține deja octeții stocați în copia de rezervă: scrierea pune la loc aceeași imagine.',
  'restore.warn.otherCamera':
    'Această copie de rezervă pare să fie a altei camere: blocul ei de identitate numește numărul de serie {theirs}, iar această cameră are {camera}. Se scrie doar imaginea {name:gen}; nimic din identitatea sau calibrarea acelei camere.',
  'restore.warn.noIdentity':
    'Această copie de rezervă nu are bloc de identitate la {address}, așa că nu se poate spune din ce cameră a fost citită.',
  'restore.warn.serialNotRead':
    'Numărul de serie al camerei nu a fost citit, așa că copia de rezervă (număr de serie {serial}) nu poate fi asociată cu ea.',
  'restore.warn.otherFirmware':
    'Firmware-ul din {where} este {version}, iar camera rulează {camera}: restaurarea pune alt firmware în slot.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank:ins} nu a fost recitit, așa că nu este comparat cu copia de rezervă.',
  'restore.readBack.equal':
    'Recitirea {bank:gen} este identică octet cu octet cu ce stochează copia de rezervă.',
  'restore.readBack.differs':
    '{bank}: recitirea diferă de octeții stocați în copia de rezervă în {count} B (primul la {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, derivată din slotul de pornire ({bank})',
  'keys.derived.holds':
    '{key} (cheia de stocare), derivată din slotul de pornire ({bank}), care conține {holds:acc}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, derivată din slotul de pornire',
  'keys.derived.holdsUnnamed':
    '{key} (cheia de stocare), derivată din slotul de pornire, care conține {holds:acc}',
  'keys.ffVendor.staged':
    'imaginea 1.3.0.8 FF (16 Hz) așa cum o transferă aplicația producătorului: imaginea XOR propriul ei bloc de chei 0 (cheia A), fereastra antetului neschimbată, în orice slot; cheile acestei camere nu sunt folosite',
  'keys.ffVendor.stored':
    'cheia B: camera recriptează datele încărcate cu blocul de chei 1 și stochează imaginea cu acesta',
  'keys.imageBlock0.staged':
    'imaginea cu propriul ei bloc de chei 0 (găsit în imagine după valoare), în orice slot; cheile acestei camere nu sunt folosite',
  'keys.imageBlock0.storedUnnamed':
    'cheia cu care bootloader-ul ei verifică un slot (nenumită la această citire); camera recriptează datele încărcate cu ea',
  'keys.imageBlock0.stored':
    '{key}, cheia cu care bootloader-ul ei verifică un slot; camera recriptează datele încărcate cu ea',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED (netestat): niciun bootloader al build-ului FF de 16 Hz nu a fost citit dintr-o cameră, așa că nu se știe dacă slotul scris pornește. Pe bootloader-ul 0.9.0.0, o formă anterioară a acestei imagini a pornit din slotul de recuperare R; această formă nu va porni, pentru că acel bootloader pornește slotul de recuperare R așa cum este stocat, fără să-l decodeze.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'Imaginea FF de 16 Hz este trimisă în forma pe care o citește doar build-ul {version} de 16 Hz. Această cameră scrie un slot fără să verifice imaginea (așa spune codul sursă al firmware-ului ei, și așa a făcut un Compact 1.3.0.0 când s-a încercat), deci este de așteptat să scrie octeții așa cum sunt trimiși: slotul va conține atunci imaginea într-o formă pe care această cameră nu o poate porni.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Nimic de aici nu afirmă că camera îl pornește.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast': 'Răspunsurile camerei spun că rulează build-ul FF de 16 Hz: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'verifică datele trimise înainte să șteargă un slot, iar aceste date trec verificarea, așa că poate scrie acești octeți ca atare, într-o formă pe care bootloader-ul ei nu o poate porni: slotul poate să nu pornească (neîncercat; copia de rezervă salvată înainte de scriere îl pune la loc)',
  'write.ff.outcome.refuses':
    'verifică datele trimise înainte să șteargă un slot, iar aceste date nu trec verificarea, așa că este de așteptat să refuze această scriere înainte să scrie ceva (o cameră cu acel build a refuzat la fel o formă anterioară a acestei imagini)',
  'write.ff.runsSlow': 'Camera rulează build-ul {version} de 8 Hz: {why}. Acel build {outcome}.',
  'write.ff.buildUnknown':
    'Răspunsurile camerei nu spun ce build {version} rulează: {why}. Dacă rulează build-ul FF de 16 Hz, acceptă aceste date. Dacă rulează build-ul de 8 Hz, acel build {outcome}.',
  'write.raw.asGiven':
    'Date brute: trimise exact așa cum au fost date. Nimic de aici nu verifică dacă pot porni.',
  'write.raw.ffStagedForm':
    'Aceste date sunt forma de transfer 1.3.0.8 FF (imaginea XOR blocul de chei 0, suma cuvintelor 0xFFFF). Camera stochează imaginea cu cheia B, așa că recitirea este verificată față de acei octeți.',
  'write.raw.noStaging':
    'Acest build nu numește nicio formă de transfer pentru slot, așa că verificările bootloader-ului nu pot fi stabilite.',
  'write.raw.reencrypts':
    'Dispozitivul decodează aceste date și recriptează ce păstrează, așa că octeții stocați nu pot fi prevăzuți. Recitirea este verificată ca imaginea în care se decriptează, acolo unde se poate spune.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'Bootloader-ul ar respinge aceste date: {failure}.',
  'write.raw.stageKeyUnchecked':
    'Cheia de transfer din 2016 (blocul de chei 0) nu se află în octeții bruți, așa că suma cuvintelor decriptate a acestor date nu este verificată aici.',
  'write.image.rekeyRisk':
    '{name:ins} conține deja o imagine pe care bootloader-ul nu o poate accepta. Această scriere ajunge în aceeași stare.',
  'write.ack.recovery':
    'Slotul de recuperare R: scrierea lui vă cere să confirmați că acceptați riscul. Nimic de aici nu verifică dacă după aceea camera pornește.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: scrierea lui vă cere să confirmați că acceptați riscul, iar camera rulează orice conține acesta după următoarea oprire și repornire a alimentării.',
  'write.ack.bootUnnamed':
    'slotul de pornire nu a putut fi numit, așa că acesta este tratat ca slotul de pornire',
  'write.ack.recoveryFallback':
    'Slotul de recuperare R este copia de ultimă instanță la care revine bootloader-ul',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'gol/0: întâi slotul A, apoi B, apoi recuperarea',
  'boot.cfg0.modernB': 'întâi slotul B, apoi A, apoi recuperarea',
  'boot.cfg0.modernRecovery': 'întâi recuperarea, apoi A, apoi B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'necunoscut — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  'upgrade.targetBooted':
    '{name:ins} este atât slotul din care a pornit camera, cât și slotul pe care îl scrie propria ei actualizare. O actualizare pornită de pe această cameră ar suprascrie imaginea pe care o rulează. Este doar un avertisment: nimic de aici nu oprește o actualizare.',
  /** `{verdict}` is one of upgrade.verdict.*. `{name}` here is the bank inside a sentence ("slot B"); in upgrade.targetBooted and upgrade.verdict.* it starts a sentence ("Slot B"). */
  'upgrade.whileRecovery':
    'Camera rulează din slotul ei de recuperare, iar propria ei actualizare scrie în {name:acc}, din care nu rulează. {verdict} Este doar un avertisment: nimic de aici nu oprește o actualizare.',
  'upgrade.verdict.notRead':
    '{name:ins} nu a putut fi citit la această verificare, așa că nu se știe ce conține.',
  'upgrade.verdict.blank': '{name:ins} este gol, așa că actualizarea scrie într-un slot gol.',
  'upgrade.verdict.bootableSame':
    '{name:ins} conține aceeași imagine care poate porni ca slotul din care rulează camera, iar actualizarea o înlocuiește. Dacă actualizarea se oprește la jumătate, {name:acc} nu va mai putea porni.',
  'upgrade.verdict.bootable':
    '{name}: conține o imagine care poate porni, pe care actualizarea o înlocuiește. Dacă actualizarea se oprește la jumătate, slotul nu va mai putea porni.',
  'upgrade.verdict.unknown':
    'La această citire nu se știe dacă {name:acc} poate porni, așa că actualizarea poate înlocui o imagine din care camera ar porni.',
  'upgrade.verdict.notBootable':
    '{name:ins} nu apare ca putând porni la această citire, așa că actualizarea nu înlocuiește nicio imagine din care camera ar porni.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — slotul în care a intrat bootloader-ul la această pornire, așa cum îl consemnează',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'necitit',
  'report.lastStart.noBank': 'camera raportează {word}, care nu numește niciun slot',
  'report.lastStart.entered':
    'camera raportează că a intrat {bank:loc} (cuvântul slotului activ {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'nicio versiune',
  'running.why.otherVersion': 'camera raportează {version}, iar doar {only} are două build-uri',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'camera nu a răspuns la verdictele pentru sloturi (selectorii GetFirmwareInfo 6, 7, 8)',
  'running.why.notRead':
    'un slot de care depind verdictele nu a fost citit, așa că răspunsurile nu pot fi prezise',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'camera răspunde {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers}, adică ce răspunde build-ul 1.3.0.8 de 8 Hz pentru aceste sloturi ({predicted})',
  'running.why.ff':
    '{answers}, adică ce răspunde build-ul FF 1.3.0.8 de 16 Hz pentru aceste sloturi ({predicted})',
  'running.why.both':
    '{answers}, iar ambele build-uri răspund exact așa pentru aceste sloturi, deci sloturile nu le deosebesc',
  'running.why.neither':
    '{answers}, ceea ce nu se potrivește cu niciun build (8 Hz: {plain}; 16 Hz FF: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'Antetul acestei imagini nu numește nicio versiune de firmware, așa că nu se poate spune dacă este build-ul pe care îl rulează camera ({camera}). Verificați că este imaginea pe care vreți să o scrieți.',
  'imageBuild.otherVersion': 'Această imagine este firmware-ul {image}; camera rulează {camera}.',
  'imageBuild.otherVersionTaken':
    'Această imagine este firmware-ul {image}; camera rulează {camera}. Pe această linie, camera verifică doar dacă o imagine este bine formată (antetul și suma cuvintelor), nu și versiunea ei, așa că acceptă această imagine, iar când pornește din acest slot rulează {image}.',
  'imageBuild.otherVersionUnchecked':
    'Această imagine este firmware-ul {image}; camera rulează {camera}. Nu s-a verificat dacă această cameră acceptă un build diferit și dacă îl rulează.',
  'imageBuild.otherBuild':
    'Această imagine este build-ul {version} de 8 Hz; camera rulează build-ul FF {version} de 16 Hz. Build-ul de 16 Hz verifică datele trimise față de propria formă FF la confirmarea scrierii și le refuză pe cele care nu trec, înainte să șteargă slotul (conform codului său sursă). Scrierea build-ului de 8 Hz pe o astfel de cameră nu a fost încercată.',
  'imageBuild.runningUnknown':
    'Această imagine este build-ul {version} de 8 Hz. Camera rulează {version}, care există ca build de 8 Hz și ca build FF de 16 Hz, iar propriile ei răspunsuri nu au spus pe care îl rulează, așa că nu se poate spune dacă acesta este build-ul ei.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': 'datele au {size} B, prea puțin ca să conțină un antet la 0x200',
  'bootFail.noMagic':
    'nicio valoare magic de imagine la 0x200 (s-a găsit {found}, bootloader-ul are nevoie de {needs})',
  'bootFail.lengthOutside': 'header.length {length} depășește datele de {size} B',
  'bootFail.lengthNotPayload': 'header.length {length} nu este lungimea datelor, {size}',
  'bootFail.overStage': '{size} B depășește limita de transfer de {max} B',
  'bootFail.plainSum':
    'suma cuvintelor stocată este {sum}, iar bootloader-ul din 2014 are nevoie de 0',
  'bootFail.noFooter': 'niciun footer la {offset}: datele se termină la {end}',
  'bootFail.footerNotCode':
    'footerul de la {offset} nu este „CODE” — bootloader-ul ia încărcătorul lui segmentat',
  'bootFail.footerLength': 'lungimea din footer nu este egală cu header.length {length}',
  'bootFail.keyASum':
    'decriptată cu cheia A a acestei camere, suma cuvintelor este {sum}, iar bootloader-ul are nevoie de {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'verificată prin suma de control',
  'keyConfidence.structural': 'verificată doar prin tabelul de vectori',
  'keyConfidence.unverified': 'neverificată',
  /** `{sum}` is hex. */
  'keyCheck.family': 'cheie verificată prin suma de control {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'cheie {phrase}; suma de control {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'transferat cu cheile proprii ale camerei',
  'staging.phrase.slotKeystreamCiphertext': 'transferat cu cheia proprie a imaginii',
  'staging.phrase.plain': 'transferat necriptat',
  'staging.phrase.keyAKeystream':
    'transferat așa cum aplicația producătorului transferă imaginea FF (XOR cheia A)',
  'staging.phrase.verbatim': 'trimis așa cum a fost dat',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank, inside the sentence ("slot A"); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    'scriere confirmată: {size} B {name:loc} la {address}, {staged}; starea confirmării {status}',
  'written.noReadWindow':
    'acest build nu numește nicio fereastră de citire pentru slot, așa că nu s-a recitit nimic',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'recitirea a eșuat: {error}',
  'written.readBack': 's-au recitit {size} B, SHA-256 {sha256}',
  'written.verifyOff': 'verificarea este dezactivată: slotul nu a fost recitit',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'octeții pe care planul a prevăzut că îi va conține slotul (imaginea așa cum o stochează build-ul de 16 Hz, nu octeții trimiși)',
  'readBack.reference.asSent':
    'octeții pe care planul a prevăzut că îi va conține slotul (octeții așa cum au fost trimiși)',
  'readBack.sizeDiffers':
    'recitirea are {size} B, planul a prevăzut {predictedSize} B: slotul NU se potrivește cu {reference}',
  'readBack.matchesFolded':
    'slotul conține imaginea așa cum o stochează build-ul de 16 Hz (nu octeții trimiși), iar restul slotului este șters',
  'readBack.matches':
    'slotul se potrivește cu octeții prevăzuți de plan (lanțul necriptat din 2014 programează exact ce i se trimite)',
  'readBack.differs': 'slotul NU se potrivește cu {reference} (prima diferență la {offset})',
  'readBack.noHeader':
    'recitirea nu conține niciun antet de imagine la {offset} (magic {magic}), așa că slotul NU se decriptează în imaginea așteptată',
  'readBack.lengthDiffers':
    'antetul recitirii indică {length} B, imaginea din plan are {imageLength} B: slotul NU se decriptează în imaginea așteptată',
  'readBack.tooShort':
    'recitirea are {size} B, prea puțin pentru o imagine de {length} B: slotul NU se decriptează în imaginea așteptată',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'fluxul de cheie recuperat din recitire ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': 'slotul se decriptează în imaginea așteptată ({length} B) cu {recovered}',
  'readBack.decryptDiffers':
    'slotul NU se decriptează în imaginea așteptată: prima diferență la offsetul {offset} din imagine, cu {recovered}',
  'readBack.rawNotCompared':
    'octeți bruți: recitirea este raportată, nu comparată (octeții nu se decriptează într-o imagine necriptată care să poată fi prevăzută în această formă, iar dispozitivul recriptează ce păstrează)',
  'readBack.notCompared':
    'nu a fost posibilă nicio comparație: planul nu prevede nici octeții stocați, nici imaginea necriptată',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'cheia A',
  'keyName.keyA:acc': 'cheia A',
  'keyName.keyA:gen': 'cheii A',
  'keyName.keyA:dat': 'cheii A',
  'keyName.keyA:loc': 'în cheia A',
  'keyName.keyA:ins': 'Cheia A',
  'keyName.keyB': 'cheia B',
  'keyName.keyB:acc': 'cheia B',
  'keyName.keyB:gen': 'cheii B',
  'keyName.keyB:dat': 'cheii B',
  'keyName.keyB:loc': 'în cheia B',
  'keyName.keyB:ins': 'Cheia B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'cheia proprie a dispozitivului',
  'keyName.perDevice:acc': 'cheia proprie a dispozitivului',
  'keyName.perDevice:gen': 'cheii proprii a dispozitivului',
  'keyName.perDevice:dat': 'cheii proprii a dispozitivului',
  'keyName.perDevice:loc': 'în cheia proprie a dispozitivului',
  'keyName.perDevice:ins': 'Cheia proprie a dispozitivului',
  'keyName.thePerDevice': 'cheia proprie a dispozitivului',
  'keyName.thePerDevice:acc': 'cheia proprie a dispozitivului',
  'keyName.thePerDevice:gen': 'cheii proprii a dispozitivului',
  'keyName.thePerDevice:dat': 'cheii proprii a dispozitivului',
  'keyName.thePerDevice:loc': 'în cheia proprie a dispozitivului',
  'keyName.thePerDevice:ins': 'Cheia proprie a dispozitivului',
  'keyName.applicationKeyA': 'cheia A a aplicației',
  'keyName.applicationKeyA:acc': 'cheia A a aplicației',
  'keyName.applicationKeyA:gen': 'cheii A a aplicației',
  'keyName.applicationKeyA:dat': 'cheii A a aplicației',
  'keyName.applicationKeyA:loc': 'în cheia A a aplicației',
  'keyName.applicationKeyA:ins': 'Cheia A a aplicației',
  'keyName.applicationKeyB': 'cheia B a aplicației',
  'keyName.applicationKeyB:acc': 'cheia B a aplicației',
  'keyName.applicationKeyB:gen': 'cheii B a aplicației',
  'keyName.applicationKeyB:dat': 'cheii B a aplicației',
  'keyName.applicationKeyB:loc': 'în cheia B a aplicației',
  'keyName.applicationKeyB:ins': 'Cheia B a aplicației',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'blocul de chei 1',
  'keyName.block1:acc': 'blocul de chei 1',
  'keyName.block1:gen': 'blocului de chei 1',
  'keyName.block1:dat': 'blocului de chei 1',
  'keyName.block1:loc': 'în blocul de chei 1',
  'keyName.block1:ins': 'Blocul de chei 1',
  'keyName.theDeviceKey': 'cheia dispozitivului',
  'keyName.theDeviceKey:acc': 'cheia dispozitivului',
  'keyName.theDeviceKey:gen': 'cheii dispozitivului',
  'keyName.theDeviceKey:dat': 'cheii dispozitivului',
  'keyName.theDeviceKey:loc': 'în cheia dispozitivului',
  'keyName.theDeviceKey:ins': 'Cheia dispozitivului',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'cheie necunoscută',
  'keyName.unknown:acc': 'o cheie necunoscută',
  'keyName.unknown:gen': 'unei chei necunoscute',
  'keyName.unknown:dat': 'unei chei necunoscute',
  'keyName.unknown:loc': 'într-o cheie necunoscută',
  'keyName.unknown:ins': 'O cheie necunoscută',
  'keys.noKnownKey': 'nicio cheie cunoscută',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'lanțul necriptat din 2014: fiecare slot este stocat necriptat, așa că nu se derivă nicio cheie de încărcare; datele încărcate sunt imaginea ca atare',
  'keys.evidence.ffVendor':
    'build-ul 1.3.0.8 FF (16 Hz): niciun slot deschis de această citire nu este stocat necriptat, așa că nu reiese că această cameră folosește lanțul necriptat din 2014; imaginea FF este scrisă în forma producătorului, octeții bruți sunt trimiși așa cum au fost dați, iar o imagine necriptată de 8 Hz nu este scrisă',
  'keys.evidence.ffUntested':
    'scrierea imaginii FF este oferită cu avertismentul ei UNTESTED (netestat): corpusul nu conține niciun bootloader original pentru acest build, așa că nu s-a măsurat dacă slotul scris pornește',
  'keys.evidence.line2016':
    'linia Compact PRO din 2016: datele încărcate sunt imaginea combinată prin XOR cu fluxul de cheie al propriului ei bloc de chei 0, găsit în imagine după valoare, așa că nicio cheie a acestei camere nu le construiește',
  'keys.evidence.checkKeyUnnamed':
    'camera decriptează datele încărcate cu acea cheie și le recriptează cu cheia cu care bootloader-ul ei verifică un slot; acea cheie nu a fost numită la această citire, iar scrierea nu are nevoie de ea: slotul este recitit ca imaginea în care se decriptează',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'camera decriptează datele încărcate cu acea cheie și le recriptează cu cheia cu care bootloader-ul ei verifică un slot; acea cheie nu a fost numită la această citire ({why}), iar scrierea nu are nevoie de ea: slotul este recitit ca imaginea în care se decriptează',
  'keys.evidence.checkKeyNamed':
    'camera decriptează datele încărcate cu acea cheie și le recriptează cu {key:acc} {hex}, cheia cu care bootloader-ul ei verifică un slot, așa că fiecare slot pe care îl scrie este stocat așa cum îl acceptă bootloader-ul',
  'keys.evidence.checkKeyInferred':
    'camera decriptează datele încărcate cu acea cheie și le recriptează cu {key:acc} {hex}, cheia cu care bootloader-ul ei verifică un slot (dedusă din {bank:acc}, slotul în care camera raportează că a intrat, în care bootloader-ul a intrat fără verificare), așa că fiecare slot pe care îl scrie este stocat așa cum îl acceptă bootloader-ul',
  'keys.evidence.checkKeyNamedFrom':
    'camera decriptează datele încărcate cu acea cheie și le recriptează cu {key:acc} {hex}, cheia cu care bootloader-ul ei verifică un slot (numită pe baza {bank:gen}, slotul în care camera raportează că a intrat), așa că fiecare slot pe care îl scrie este stocat așa cum îl acceptă bootloader-ul',
  /** `{source}` is keys.source.*. */
  'keys.evidence.applicationKeyA':
    'aplicația care rulează ({bank}, firmware {firmware}) conține cheia ei A {keyA} la {keyAAt}, din {source}',
  'keys.evidence.applicationKeys':
    'aplicația care rulează ({bank}, firmware {firmware}) conține cheia ei A {keyA} la {keyAAt}, din {source}, și cheia ei B {keyB} la {keyBAt}',
  'keys.source.keyTable': 'tabelul de chei al bootloader-ului',
  /** `{builds}`: firmware versions. */
  'keys.source.applicationPair': 'perechea decodată a aplicației din {builds}',
  'keys.evidence.perDevice':
    'este programată o cheie proprie a dispozitivului, așa că aplicația recriptează cu ea',
  'keys.evidence.noPerDevice':
    'nu este programată nicio cheie proprie a dispozitivului, așa că aplicația recriptează cu propria ei cheie B',
  'keys.evidence.storeKey':
    'cheia de stocare a aplicației este {key:acc} din bootloader ({hex}), așa că scrierile stochează fiecare slot cu această cheie; slotul de pornire, {bank:acc}, conține {held:acc}, o cheie pe care bootloader-ul o acceptă și ea',
  'keys.evidence.bootedKey':
    'slotul de pornire, {bank:acc}, se decriptează cu {key:acc} ({hex}), o cheie pe care bootloader-ul o încearcă; cheia de stocare a aplicației nu este cea a bootloader-ului, așa că scrierile stochează fiecare slot cu cheia slotului de pornire',
  /** `{masks}`: key names joined with commas. */
  'keys.evidence.masks':
    'datele încărcate sunt imaginea XOR fluxurile de cheie ale acestor chei: {masks}; dispozitivul stochează imaginea cu {key:acc}',
  /** `{held}` is a key name or keys.noKnownKey (a sentence, not a name: it takes no case). */
  'keys.evidence.otherBank':
    '{bank:ins} se decriptează cu: {held}; este scris cu {key:acc} după aceeași regulă și recitit pentru verificare',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'slotul de pornire nu a putut fi numit, așa că din el nu se poate citi cheia cu care este stocat slotul',
  'keys.refused.notDerived': 'cheile nu au putut fi derivate',
  'keys.refused.notDecrypted':
    'slotul de pornire, {bank:acc}, nu se decriptează într-o imagine, așa că nu se poate citi cheia cu care este stocat',
  'keys.refused.noBootKey':
    'slotul de pornire, {bank:acc}, nu se decriptează cu nicio cheie pe care o încearcă bootloader-ul (cheia lui A sau cheia lui de stocare), așa că din el nu se poate citi cheia cu care este stocat slotul',
  'keys.refused.keyNotInTable':
    'slotul de pornire, {bank:acc}, se decriptează cu {key:acc}, dar tabelul de chei al acestei camere nu conține această cheie, așa că nu se poate scrie cu ea',
  'keys.refused.noApplicationPair':
    'aplicația care rulează ({bank}, firmware {firmware}) nu conține niciuna dintre perechile de chei cunoscute (a bootloader-ului și perechile decodate ale aplicației), fiecare jumătate exact o dată, așa că cheia ei A nu poate fi găsită în imagine',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'aplicația care rulează ({bank}, firmware {firmware}) nu conține niciuna dintre perechile de chei cunoscute (a bootloader-ului și perechile decodate ale aplicației), fiecare jumătate exact o dată, așa că cheia ei A nu poate fi găsită în imagine (de câte ori apare cheia A a bootloader-ului: {count}; cheia lui B: {keyB})',
    few: 'aplicația care rulează ({bank}, firmware {firmware}) nu conține niciuna dintre perechile de chei cunoscute (a bootloader-ului și perechile decodate ale aplicației), fiecare jumătate exact o dată, așa că cheia ei A nu poate fi găsită în imagine (de câte ori apare cheia A a bootloader-ului: {count}; cheia lui B: {keyB})',
    other:
      'aplicația care rulează ({bank}, firmware {firmware}) nu conține niciuna dintre perechile de chei cunoscute (a bootloader-ului și perechile decodate ale aplicației), fiecare jumătate exact o dată, așa că cheia ei A nu poate fi găsită în imagine (de câte ori apare cheia A a bootloader-ului: {count}; cheia lui B: {keyB})',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'aplicația care rulează ({bank}, firmware {firmware}) verifică datele încărcate cu propriile chei înainte să le programeze (sursa decodată a acestui build încearcă datele cu cheia ei A și cu cheia ei de stocare, așa cum bootloader-ul ei încearcă un slot), iar cheia cu care stochează scrierile, {key} ({hex}), nu este nici cheia ei A, nici cheia ei de stocare, așa că camera ar refuza datele încărcate cu 0x50000 înainte să șteargă ceva',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'niciun slot nu se decriptează la suma de control {sum} a familiei {family}',
  'writeRefusal.keyTable': 'tabelul de chei al acestei camere nu a putut fi confirmat',
  'writeRefusal.whitening':
    'tabelul de chei al acestei camere se rezolvă cu K={k}, dar {family} criptează cu K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily':
    'dovezile spun că această cameră este {detected}, nu {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'această cameră nu poate fi scrisă de aici: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Build-urile Seek din 2018 încoace (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 și Nano 300. O extragere citește 63 din cele 64 de blocuri ale memoriei flash fără să deblocheze nimic; pe aceste build-uri nicio citire nu ajunge la blocul de la {block}. Firmware-ul este stocat criptat. Sloturile se scriu câte unul pe rând, pe fila „Lucru cu sloturile de firmware”.',
  'family.summary.early':
    'Camerele Compact din 2014 mai vechi decât 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 și 0.7.0.8. Firmware-ul lor nu poate răspunde la citirea pe care o trimite o extragere, așa că „Extragere”, „Extragerea tuturor selectorilor”, citirea completă din fila Info și fila „Lucru cu sloturile de firmware” le refuză după ce citesc versiunea; pe 0.3.0.1, comanda cu care începe o extragere ar pregăti în schimb o actualizare de firmware. Rularea Preserve citește 0.7.0.7 și 0.7.0.8 printr-o altă comandă la care răspund aceste două build-uri. Un dump făcut pe altă cale se decriptează ca de obicei.',
  'family.summary.compact2016':
    'Build-urile Compact PRO 1.0.3.x (1.0.3.0 și 1.0.3.2). Răspund la citiri exact ca modelele Compact din 2014, inclusiv tokenul de deblocare, așa că se deosebesc după versiune și după felul în care își stochează sloturile: criptat, pe când sloturile din 2014 sunt necriptate. O cameră 1.0.3.x este citită cu această familie de la început. Rularea Preserve citește întreaga memorie flash, iar sloturile se scriu câte unul pe rând, pe fila „Lucru cu sloturile de firmware”.',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    'Camerele Compact din 2014 cu 0.8.0.0 până la 1.3.0.8, printre ele și build-ul FF 1.3.0.8 de 16 Hz. O cameră nemodificată lasă să iasă mai puțin de jumătate din memoria ei flash, o parte doar în schimbul unui token de deblocare pe care îl trimit instrumentele; rularea Preserve citește restul printr-un patch temporar. Sloturile sunt stocate necriptat, cu excepția build-ului FF. O cameră Compact PRO 1.0.3.x este citită ca compact-2016 și trece aici doar când un slot este stocat necriptat sau se decriptează la {sum}, cum fac cele ale build-ului FF. Sloturile se scriu pe fila „Lucru cu sloturile de firmware” pe build-urile pe care s-a măsurat rularea Preserve; orice alt build 0.x sau 1.x este doar citit.',
  'family.summary.generic':
    'O cameră cu care nu se potrivește nicio altă familie. `seek-fw dump` o citește cu lista de blocuri 4.x (fila 4.x/Nano o refuză), iar o decriptare calculează cheia chiar din imagine, așa că niciuna nu depinde de presupunere. Nu se scrie niciun slot: fila „Lucru cu sloturile de firmware” o refuză până când camera este identificată.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'antetul imaginii indică',
  'detect.source.camera': 'camera raportează',
  'detect.plainArmedNotInForce':
    'un BeginFirmwareUpgrade simplu de 2 octeți a activat un slot protejat, așa că canalul de citire autentificat nu este în vigoare',
  'detect.modern.plainRefused':
    'un BeginFirmwareUpgrade simplu de 2 octeți pentru un slot protejat a fost REFUZAT, ceea ce nu face niciun build de pe această linie — rutina lui nu verifică niciun token și acceptă canalul simplu pe orice slot',
  'detect.modern.authArmed':
    'un slot protejat s-a activat cu selectorul autentificat de 18 octeți; nimic nu l-a încercat acolo pe cel simplu, așa că asta nu scoate această cameră de pe această linie',
  'detect.modern.legacyVersion':
    '{said} firmware-ul {version}, care este pe linia veche 0.x / 1.x (o altă linie de numerotare, nu un 4.x mai vechi — și unul dintre acele build-uri atinge și el suma {sum})',
  'detect.modern.noSum':
    'niciun slot nu se decriptează la suma de control {sum} pe care o cere bootloader-ul acestei familii',
  'detect.modern.sum': 'un slot se decriptează la suma de control {sum}',
  'detect.modern.version':
    'firmware-ul {version} este pe linia de după 2018 pe care o acoperă această hartă de selectori (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'un BeginFirmwareUpgrade simplu de 2 octeți a activat un slot protejat, deci acesta nu este firmware-ul vechi blocat',
  'detect.modern.none': 'nicio dovadă care să plaseze această cameră pe linia de după 2018',
  'detect.early.noVersion':
    'nu s-a raportat nicio versiune de firmware și nu s-a găsit niciuna într-un antet de imagine',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'firmware-ul {version} este {first} sau mai nou, așa că tabelul lui RPC are un getter pentru GetFeaturedFirmwareData și se aplică calea obișnuită de citire',
  'detect.early.older':
    '{said} firmware-ul {version}, care este mai vechi decât {first} — primul build al cărui tabel de metode RPC are o rutină de citire (getter) pentru GetFeaturedFirmwareData',
  'detect.early.noWindow': 'și nu s-a putut citi nicio fereastră, exact cum prezice acest lucru',
  'detect.generic.fallback':
    'variantă de rezervă: nicio familie de firmware nu s-a potrivit cu încredere, așa că citirile rămân disponibile, iar scrierile nu',
  'detect.compact2016.early':
    'firmware-ul {version} este mai vechi decât 0.8.0.0 și nu are rutină de citire pentru GetFeaturedFirmwareData — aceasta este early-compact, nu această familie',
  'detect.compact2016.modernSum':
    'un slot se decriptează la suma de control {sum}, care nu este ținta acestei generații',
  'detect.compact2016.plainArmed':
    'un BeginFirmwareUpgrade simplu de 2 octeți a activat un slot protejat, așa că această cameră nu este pe linia blocată pe care această familie o împarte cu legacy-auth',
  'detect.compact2016.notLine': 'firmware-ul {version} nu este pe linia 0.x / 1.x',
  'detect.compact2016.storedPlain':
    'un slot este stocat necriptat — calculul fluxului de cheie dă starea identitate, deci cuvintele stocate SUNT imaginea —, ceea ce înseamnă lanțul necriptat din 2014; sloturile acestei generații sunt xorshift128 cu o cheie reală',
  'detect.compact2016.keyedZero':
    'un slot stocat cu un flux de cheie xorshift128 real se decriptează la suma de control {sum}, care este cifrul acestei generații',
  'detect.compact2016.zeroSum':
    'un slot se decriptează la suma de control {sum}, care este ținta acestei generații',
  'detect.compact2016.refused':
    'iar un slot protejat a refuzat activarea simplă de 2 octeți, ceea ce face rutina blocată',
  'detect.compact2016.proLine':
    '{said} firmware-ul {version}, linia 1.0.3.x a modelului Compact PRO din 2016',
  'detect.compact2016.compactLine':
    '{said} firmware-ul {version}, un build Compact, nu linia 1.0.3.x a modelului Compact PRO',
  'detect.compact2016.lockedLine':
    '{said} firmware-ul {version}, de pe linia 0.x / 1.x pe care această generație o împarte cu firmware-ul vechi blocat',
  'detect.compact2016.bootloader2016':
    'bootloader-ul raportează {version}, un bootloader din generația 2016 (1.2.0.0 este măsurat sub Compact PRO 1.0.3.0; cel al modelului Compact din 2014 este 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'bootloader-ul raportează {version}, numerotarea generației 2014, nu a acestei generații',
  'detect.compact2016.none':
    'nu s-a observat niciun slot care să se decripteze la o sumă de control zero cu o cheie reală',
  'detect.legacy.proLine':
    'dar firmware-ul {version} este linia 1.0.3.x a modelului Compact PRO din 2016, ale cărei sloturi folosesc cifrul compact-2016: verificarea de acceptare a acestei familii ar eșua pentru fiecare dintre ele',
  'detect.legacy.early':
    'firmware-ul {version} este mai vechi decât 0.8.0.0: tabelul lui RPC nu are rutină de citire pentru GetFeaturedFirmwareData (deloc înainte de 0.7.0.7 și doar un setter pe 0.7.0.7 și 0.7.0.8) — aceasta este early-compact, nu această familie',
  'detect.legacy.keyedZero':
    'un slot stocat cu un flux de cheie xorshift128 real se decriptează la {zero} — cifrul modelului Compact PRO din 2016 (compact-2016). Această linie își stochează sloturile necriptat, cu suma cuvintelor 0 (lanțul din 2014), sau cu cheie, la {sum} (Compact 1.3.0.8), iar verificarea ei de acceptare respinge un astfel de slot',
  'detect.legacy.plainChain':
    'un slot este stocat ca firmware necriptat ale cărui cuvinte au suma 0, așa cum îl pornește bootloader-ul din 2014 al acestei linii',
  'detect.legacy.refused':
    'camera a refuzat să deschidă un slot blocat pentru o actualizare când i s-a cerut fără deblocare, așa cum face doar această generație de firmware',
  'detect.legacy.unlocked':
    'și a deschis același slot când i s-a cerut cu deblocare, deci deblocarea pe care o trimite această familie este cea pe care o verifică această cameră',
  'detect.legacy.notLine': '{said} firmware-ul {version}, care nu este pe linia veche 0.x / 1.x',
  'detect.legacy.authOnly':
    'a deschis un slot blocat pentru o actualizare când i s-a cerut cu deblocare, așa cum face această generație de firmware; cererea fără deblocare nu a fost încercată, așa că doar asta nu dovedește generația',
  'detect.legacy.version':
    'firmware-ul {version} este pe linia veche 0.x / 1.x, care este o altă linie de numerotare decât versiunile de aplicație de după 2018, nu un 4.x mai vechi',
  'detect.legacy.none': 'nimic din ce s-a observat nu indică canalul de citire autentificat',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{id}`: the table entry's name; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'retras după o rulare pe o cameră: acolo patch-ul nu a crescut rata de publicare, iar obturatorul s-a declanșat la fiecare cadru după scriere',
  'fps.table.predates':
    'firmware-ul {version} este mai vechi decât 0.8.0.0: tabelul lui RPC nu are rutină de citire pentru GetFeaturedFirmwareData, comanda pe care o trimite citirea unui slot, așa că citirea și scrierea sloturilor nu ating niciun slot al acestui build, iar patch-ul nu este oferit',
  'fps.table.stageTwoFf':
    'stage two: build-ul FF de 16 Hz este transferat așa cum îl transferă aplicația producătorului (imaginea XOR cheia A, stocată cu cheia B), nu ca octeți necriptați, așa că verificarea transferului lui nu este făcută, iar patch-ul nu este oferit încă',
  'fps.table.stageTwo':
    'stage two: această intrare nu este în setul stage two, așa că verificarea transferului ei nu este făcută, iar patch-ul nu este oferit încă',
  'fps.table.notOffered': 'neoferit',
  'fps.table.notImage':
    'aceasta nu este o imagine de firmware, așa că nu i se aplică niciun patch pentru rata de cadre',
  'fps.table.otherBuild':
    'imaginea este build-ul {image} („{id}”), dar camera raportează {camera}; patch-ul este refuzat, nu aplicat unui build cu care nu se potrivește',
  'fps.table.otherBuildNoVersion':
    'imaginea este build-ul {image} („{id}”), dar camera nu raportează nicio versiune; patch-ul este refuzat, nu aplicat unui build cu care nu se potrivește',
  'fps.table.patched':
    'patch-ul pentru rata de cadre este deja aplicat: această imagine rulează la {hz} Hz',
  'fps.table.earlierPatch':
    'această imagine conține un patch anterior pentru rata de cadre de {hz} Hz, fără corecția pentru USB, iar un patch nu se aplică niciodată peste o imagine cu patch: restaurați imaginea originală, apoi aplicați-i patch-ul',
  'fps.table.atRate': 'acest build rulează deja la {hz} Hz fără patch',
  'fps.table.not4821':
    'această imagine raportează build-ul Compact 4.8.2.1 (sau Compact XR 4.8.2.1, același build), dar nu este imaginea originală pentru care a fost scris patch-ul pentru rata de cadre (f96ac57eda75: paginile ei de comenzi de 68 de octeți, pagina stabilă 13), așa că nu se face niciun patch pentru rata de cadre pentru ea',
  'fps.table.notInTable':
    'această imagine nu este în tabelul de patch-uri pentru rata de cadre, așa că nu se face niciun patch pentru acest build. Tabelul cuprinde build-urile Compact 0.7.0.8 până la 1.3.0.8 (8 Hz; 0.7.0.8 este refuzat de codul pentru sloturi), 1.3.0.8 (16 Hz FF), 4.8.1.7, 4.8.1.9, 4.8.2.1 și 4.16.1.7 FF și build-urile Compact PRO 1.0.3.x și 4.9.x; niciun alt build nu are o intrare',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'planul acestui build nu are {bank:acc}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank:acc} nu poate primi o imagine decriptată pe acest build: {reason}',
  'fps.plan.empty':
    '{bank:acc} nu are nicio imagine decriptată căreia să i se aplice patch-ul (este gol)',
  'fps.plan.noImage':
    '{bank:acc} nu are nicio imagine decriptată căreia să i se aplice patch-ul (nu a fost citit sau nicio cheie nu îl deschide)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name:ins} a fost scris, dar recitirea lui nu diferă de slotul salvat doar așa cum s-a planificat, așa că sloturile de după el nu au fost scrise',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build, a bank or an empty bank (slots/capability-notes) ----
   * Mode numbers, addresses, version numbers and command names (CompleteMemoryUpgrade, BeginFirmwareUpgrade,
   * EP0, PRESERVATION.md) are names: keep them. `{untested}` is notes.ffBootUntested. */
  /** "This line" is the firmware line (the 2014 0.x/1.x builds, as in notes.token), not a line of text: on these builds, the bank the page or the CLI calls booted is the one the camera entered at its last start. */
  'notes.lockedBootWord':
    'Slotul de pornire numit pe această linie de firmware este slotul în care a intrat camera la ultima pornire, așa cum îl consemnează cuvântul slotului activ (0 slotul A, 1 slotul B, 2 slotul de recuperare R). Următoarea pornire este stabilită de cuvântul de configurare a pornirii: 0 sau 0xFFFFFFFF aleg întâi A, 1 întâi B, orice altă valoare întâi slotul de recuperare R. Slotul de recuperare R rulează ori de câte ori A și B nu conțin nimic din ce acceptă bootloader-ul din 2014 (un slot ale cărui cuvinte au suma 0), indiferent ce conține R (măsurat pe o cameră).',
  /** "This line" is the firmware line (the 2016 Compact PRO 1.0.3.x builds), not a line of text: on these builds, the bank the page or the CLI calls booted is the one the camera entered at its last start. */
  'notes.locked2016BootWord':
    'Slotul de pornire numit pe această linie de firmware este slotul în care a intrat camera la ultima pornire, așa cum îl consemnează bootloader-ul în cuvântul slotului activ (0 slotul A, 1 slotul B, 2 slotul de recuperare R). Următoarea pornire este stabilită de cuvântul de configurare a pornirii: 0 sau 0xFFFFFFFF aleg întâi A, 1 întâi B, orice altă valoare întâi slotul de recuperare R. Bootloader-ul din 2016 acceptă un slot doar când acesta se decriptează la o sumă a cuvintelor 0 cu cheia cu care verifică un slot (blocul de chei 1 pe bootloader-ul lui 1.2.0.0), iar ultimul slot din această ordine rulează neverificat când celelalte două eșuează. Citirea numește acea cheie pe baza slotului în care a intrat camera, pentru că blocul bootloader-ului care o conține este refuzat pe orice canal (măsurat pe o cameră).',
  'notes.ep0of1032':
    '1.0.3.2: sesiunile EP0 se întrerup la aproximativ 64 până la 81 KB, iar 128 B este unitatea de citire fără pierderi, așa că un slot de 64 KB pe sesiune este limita măsurată. O citire completă a cipului este refuzată pe acest build (PRESERVATION.md: nu există citire completă cu o singură activare). Extragerea unui slot citește câte un slot pe rând, în cereri de 64 de octeți.',
  'notes.token':
    'Sloturile sunt blocate pe această linie de firmware: camera deschide un slot pentru scriere doar când i se cere cu deblocarea liniei, care este aceeași în toate cele 22 de imagini de firmware consemnate ale acestei linii. O cameră cu altă deblocare își refuză sloturile.',
  'notes.staging.lockedPlain':
    'Transfer: imaginea însăși, cel mult 56 KB (cât acceptă camera la o singură scriere). Scrierea șterge slotul de 64 KB și scrie exact acei octeți, iar restul slotului rămâne șters. Bootloader-ul pornește un slot doar când cuvintele lui au suma 0, așa că imaginea este echilibrată la această sumă înainte să fie trimisă.',
  'notes.staging.locked2016':
    'Transfer: imaginea, combinată prin XOR cu fluxul de cheie xorshift128 al PROPRIULUI ei bloc de chei 0 (cheia de transfer, găsită în imagine după valoare), doar lungimea imaginii (cel mult 0xE000 B). Dispozitivul decriptează datele cu acea cheie și le stochează cu cheia cu care bootloader-ul lui verifică un slot (blocul de chei 1), așa că octeții stocați nu sunt cei transferați. Nu se citește nimic din slotul țintă pentru transfer: fluxul de cheie al slotului este folosit doar la recitirea slotului.',
  'notes.staging.modern':
    'Transfer: întregul slot de 64 KB, imagine + umplutură 0xFF + footer „CODE”. Imaginea este combinată prin XOR cu fluxurile de cheie care fac ca cele două treceri proprii ale aplicației care rulează să o stocheze cu cheia pe care o conține slotul de pornire: când comanda de confirmare (CompleteMemoryUpgrade) primește tipul de date 7, 8 sau 9, aplicația decriptează datele încărcate cu cheia ei A, le recriptează cu cheia ei de stocare și programează slotul. Footerul este cel care permite bootloader-ului să accepte slotul, așa că un slot fără el este refuzat.',
  'notes.modernGap':
    'Slotul B este 0x14050000 pe această linie de firmware (modul 8). Niciun selector nu ajunge la 0x14060000 pe vreun build 2.x, 4.x, 10.x, 42.x sau 44.x (decodat din cele 14 imagini din corpus de după 2018), așa că acolo nu se află niciun slot. Dispunerea cu 0x14060000 aparține liniei blocate 0.x/1.x.',
  'notes.modernNamedWrite':
    'Scrierile numite (modurile 7 până la 9) sunt decodate din firmware. Emulatorul scrie A, B și R prin ele pe build-urile 4.x, iar pe o cameră, slotul A al unui Compact XR 4.8.2.1 a fost scris prin modul 7 de patch-ul pentru rata de cadre. O scriere de slot nu activează niciodată modul 0, ținta actualizării.',
  'notes.unverified':
    'Doar citire. Dispunerea sloturilor este tabelul decodat al liniei blocate, dar pentru acest build nu s-a măsurat nicio formă de transfer, așa că nu se planifică nicio scriere.',
  'notes.empty.plain':
    'Un slot gol primește o imagine exact ca unul folosit. Lanțul necriptat transferă octeții imaginii ca atare, fără cheie, iar confirmarea scrierii șterge mai întâi blocul, așa că nu se citește nimic din slotul țintă. Măsurat pe un Compact: o imagine scrisă într-un slot B gol s-a recitit identic, iar B a pornit singur.',
  'notes.empty.modern':
    'Un slot gol primește o imagine exact ca unul folosit. Datele sunt criptate cu chei derivate din slotul de pornire și din aplicația care rulează, nu din slotul țintă, iar dispozitivul le recriptează și șterge blocul fără să-l citească. Footerul este copiat dintr-un slot care are unul valid, altfel este construit gol. Dovedit pe emulator; încă nemăsurat pe o cameră.',
  'notes.empty.locked2016':
    'Un slot gol primește o imagine exact ca unul folosit. Cheia de transfer este blocul de chei 0 al perechii proprii a IMAGINII, nu o cheie citită din slotul țintă, iar dispozitivul decriptează datele cu ea, le stochează cu propria lui cheie și șterge blocul fără să-l citească. Dovedit pe emulator; încă nemăsurat pe o cameră.',
  'notes.mode2of080':
    '0.8.0.0: modul 2 (0x14000000) poate bloca acest build — o citire activată iese din SRAM (PRESERVATION.md). O citire sau o scriere de slot activează doar modurile 7 până la 9, niciodată modul 2.',
  'notes.keyPairs2016':
    'Build-urile de 9 Hz ale versiunilor 1.0.3.0 și 1.0.3.2 au o pereche de chei comună, iar build-urile FF au alta. Șirul de versiune nu le deosebește, așa că fluxul de cheie este recuperat chiar din slot, iar imaginea proprie a slotului decide.',
  'notes.board1030':
    'Aplicația 1.0.3.0 repornește pe orice placă în afară de cea a modelului Compact Pro, așa că o placă Compact o rulează doar cu patch-ul pentru placă în sloturile ei.',
  'notes.bank.modernA':
    'Scris printr-o activare de slot pe care harta modernă o omite; un Compact XR 4.8.2.1 a acceptat o scriere prin ea, pe o cameră.',
  'notes.bank.recovery2016':
    'Măsurat pe un Compact PRO 1.0.3.0: slotul de recuperare R a acceptat propria imagine, o modificare de un octet și octeții bruți așa cum au fost trimiși, fiecare scris fără eroare.',
  'notes.bank.ff1308A':
    'Imaginea 1.3.0.8 FF (16 Hz) ajunge aici în forma în care o trimite aplicația producătorului, iar camera o stochează cu propria ei cheie. Bootloader-ul din 2014 pornește un slot doar când cuvintele lui au suma 0, așa că îl sare pe acesta la pornire; dacă build-ul de 16 Hz pornește din slotul A este UNTESTED (netestat). Imaginea de 8 Hz este scrisă ca atare.',
  'notes.bank.ff1308B':
    'Imaginea 1.3.0.8 FF (16 Hz) ajunge aici în forma în care o trimite aplicația producătorului, iar camera o stochează cu propria ei cheie. Bootloader-ul din 2014 pornește un slot doar când cuvintele lui au suma 0, așa că îl sare pe acesta la pornire; dacă build-ul de 16 Hz pornește din slotul B este UNTESTED (netestat). Imaginea de 8 Hz este scrisă ca atare.',
  'notes.bank.ff1308R':
    'Imaginea 1.3.0.8 FF (16 Hz) ajunge aici în forma în care o trimite aplicația producătorului, iar camera o stochează cu propria ei cheie. Bootloader-ul 0.9.0.0 pornește slotul de recuperare R așa cum este stocat, fără să-l decodeze, așa că această formă s-ar putea să nu pornească: UNTESTED (netestat), iar o formă anterioară a acestei imagini a pornit de aici (măsurat pe o cameră). Imaginea de 8 Hz este scrisă ca atare.',
  'notes.product.4_8_2_1':
    'Compact 4.8.2.1 și Compact XR 4.8.2.1 (o singură imagine): harta modernă cu 63 de ferestre; emulatorul a confirmat 63 din 63 de ferestre pe dump-ul complet al modelului Compact și pe cel al modelului Compact XR.',
  'notes.product.10_9_1_31':
    'Mosaic 320x240 10.9.1.31: harta modernă cu 63 de ferestre, fiecare fereastră confirmată prin măsurare pe emulator.',
  'notes.product.2_27_1_33':
    'Mosaic 320x240 FF 2.27.1.33: harta modernă cu 63 de ferestre, fiecare fereastră confirmată prin măsurare pe emulator.',
  'notes.product.42_32_3_10':
    'Nano 200 42.32.3.10: harta modernă cu 63 de ferestre, fiecare fereastră confirmată prin măsurare pe emulator. Comanda lui de confirmare (CompleteMemoryUpgrade) nu are rutină pentru tipul de date 32, pe care o scriere prin modul 7, 8 sau 9 nu îl cere niciodată.',
  'notes.product.44_27_3_10':
    'Nano 300 44.27.3.10: harta modernă cu 63 de ferestre, fiecare fereastră confirmată prin măsurare pe emulator. Comanda lui de activare (BeginFirmwareUpgrade) refuză, ca prim argument greșit, un tip de date dincolo de intervalul pe care îl acceptă (0x7F), iar modurile 7 până la 9 sunt în acest interval.',
  'notes.ff1308':
    '1.3.0.8-FF (16 Hz) raportează aceeași versiune ca build-ul de 8 Hz. Citirea le deosebește pe baza camerei: camera spune, slot cu slot, dacă aplicația ei acceptă slotul, iar fiecare build își prezice propriile răspunsuri din sloturi. Imaginea FF este trimisă în forma în care o trimite aplicația producătorului, iar camera o stochează cu propria ei cheie. Ea merge în slotul A, slotul B sau slotul de recuperare R. Build-ul de 8 Hz ar trebui să o refuze înainte să scrie ceva; cât timp răspunsurile camerei nu pot deosebi build-urile, planul spune ce face fiecare build cu ea. {untested}',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'camera nu și-a raportat versiunea firmware-ului ({note}); un număr de comandă nu înseamnă același lucru pe orice firmware Seek — pe Compact 0.3.0.1, wire id 0x52, id-ul care activează o fereastră de citire, este EnterBootloaderMode —, așa că, până nu se cunoaște versiunea, nu se trimite nimic în afară de GetErrorCode, GetOperationMode și GetFirmwareInfo, citirile la care orice build răspunde la fel',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo nu a răspuns ({error}) la niciuna dintre citiri ({reads}, la {spacing} ms una de alta), într-o fereastră de pornire de {window} ms; o cameră care încă pornește răspunde în acest interval',
  'identity.note.neverTwice':
    'GetFirmwareInfo nu a răspuns niciodată de două ori la rând (citiri: {reads})',
  'identity.note.noAnswer': 'GetFirmwareInfo nu a răspuns ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo nu a răspuns ({error}); citiri cu răspuns: {answered} din {reads}, niciodată două la rând, așa că niciuna nu poate fi deosebită de o înregistrare lăsată selectată de o comandă anterioară',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo a răspuns cu {count} octet, prea puțin pentru o versiune',
    few: 'GetFirmwareInfo a răspuns cu {count} octeți, prea puțin pentru o versiune',
    other: 'GetFirmwareInfo a răspuns cu {count} de octeți, prea puțin pentru o versiune',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo a răspuns cu {count} octet, prea puțin pentru o versiune; {context}',
    few: 'GetFirmwareInfo a răspuns cu {count} octeți, prea puțin pentru o versiune; {context}',
    other:
      'GetFirmwareInfo a răspuns cu {count} de octeți, prea puțin pentru o versiune; {context}',
  },
  'identity.note.otherRecord':
    'prima citire a răspuns cu altă înregistrare ({version}), rămasă selectată în selectorul de informații despre firmware de la o comandă anterioară — acea citire a șters-o',
  'identity.note.afterStartup': {
    one: 'a răspuns după ce a refuzat {count} citire în timpul pornirii',
    few: 'a răspuns după ce a refuzat {count} citiri în timpul pornirii',
    other: 'a răspuns după ce a refuzat {count} de citiri în timpul pornirii',
  },
  'identity.predates':
    'firmware-ul {version} este anterior protocolului de extragere: tabelul lui de metode RPC nu are rutină de citire pentru GetFeaturedFirmwareData (pe 0.7.0.7 și 0.7.0.8 este înregistrată doar ca setter, iar înainte de acestea wire id 0x4F este UploadFirmwareRowSize), așa că nu se poate citi nicio fereastră cu ea; pe 0.3.0.1, wire id 0x52 este EnterBootloaderMode, nu BeginFirmwareUpgrade. Rularea Preserve citește în schimb 0.7.0.7 și 0.7.0.8 prin wire id 0x58 (GetFeaturedData)',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'se refuză {operation}: {reason}',
  'identity.refusingNoVersion':
    'se refuză {operation}: {reason}. Nu s-a activat nimic. Deconectați camera, conectați-o din nou, lăsați-o să termine pornirea și încercați din nou.',
  'identity.operation.dump': 'extragerea',
  'identity.operation.dumpAll': 'extragerea tuturor selectorilor',
  'identity.operation.readInfo': 'citirea informațiilor despre dispozitiv',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'sloturile se aleg după copia de rezervă, care le citește — rulați mai întâi copia de rezervă',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'sloturile nu se mai pot schimba după ce confirmarea scrierii a rulat sau a fost încercată: această rulare scrie: {banks}, iar restaurarea le pune la loc exact pe acestea',
  'preserve.banks.none': 'niciun slot',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Scris.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Citire încheiată. {count}/{of} sloturi pot fi citite.',
  'status.readRefused':
    'Citire încheiată, dar niciun slot al acestei camere nu poate fi scris de aici — vedeți jurnalul.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Versiune firmware',
  'compare.field.imageId': 'Id imagine',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'SP inițial',
  'compare.field.resetVector': 'Vector de reset',
  'compare.field.size': 'Dimensiune',
  'compare.field.shaExpected': 'SHA-256 al imaginii necriptate așteptate',
  'compare.field.sha': 'SHA-256 al imaginii',
  'compare.field.shaNotStored':
    'SHA-256 al imaginii necriptate așteptate (octeții stocați nu pot fi prevăzuți)',
  'compare.field.key': 'Cheie',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(nicio imagine)',
  'compare.notImage': '(nu este o imagine)',
  'compare.notPredicted': '(nu se poate prevedea: dispozitivul decide ce stochează)',
  'compare.plaintext': 'niciuna (necriptat)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'nu a putut fi citit la fel de două ori',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (cheia cu care bootloader-ul verifică un slot este dedusă din {bank:acc}, în care a intrat fără verificare) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered':
    '{bank}, așa cum îl consemnează camera (cuvântul slotului activ {word})',
  'preserve.lastStart.notRead': 'necunoscut — cuvântul slotului activ nu a putut fi citit',
  'preserve.lastStart.noBank':
    'necunoscut — cuvântul slotului activ este {word}, care nu numește niciun slot',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'necunoscut — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'nu se scrie — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'o imagine',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — se poate scrie',
  'preserve.bank.writablePatch': '{build} — se poate scrie; octeți schimbați de patch: {count}',
  'preserve.bank.writableEdit': '{build} — se poate scrie; conține {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — se poate scrie; octeți schimbați de patch: {count}; conține {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead':
    'copia de rezervă nu a citit încă sloturile, așa că nu se poate alege niciun slot',
  'preserve.choice.every': 'toate sloturile care conțin o imagine: {banks}',
  'preserve.choice.everyBlocked':
    'nu se pot scrie toate sloturile care conțin o imagine: {bank:acc} nu poate fi scris — {reason}',
  'preserve.choice.noImage': 'niciun slot nu conține o imagine pe care rularea o poate scrie',
  'preserve.choice.nextStart': '{bank}, slotul în care intră următoarea pornire: {why}',
  'preserve.choice.nextStartRefused':
    'următoarea pornire intră {bank:loc} ({why}), iar rularea nu îl poate scrie: {reason}',
  'preserve.choice.everyUnknownStart':
    'toate sloturile care conțin o imagine ({banks}): nu se știe în ce slot intră următoarea pornire ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'nu se știe în ce slot intră următoarea pornire ({why}), iar {reason}; alegeți un slot după nume',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank:acc} nu poate fi scris: {reason}',
  'preserve.choice.byName': '{banks}, slotul ales după nume',
  'preserve.choice.warnNotPatched':
    'Următoarea pornire intră {bank:loc} ({why}), iar această alegere nu îi aplică patch-ul: după repornire, camera rulează imaginea proprie a acelui slot, așa că citirea completă se oprește înainte să citească ceva. Restaurarea pune totuși la loc fiecare slot scris.',
  'preserve.choice.warnUnknownStart':
    'Nu se știe în ce slot intră următoarea pornire ({why}). Dacă intră într-un slot căruia această alegere nu îi aplică patch-ul, citirea completă se oprește înainte să citească ceva.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'încă necunoscut',
  'preserve.build.firmware': 'firmware {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'așa cum îl stochează camera (această cameră își păstrează firmware-ul necriptat)',
  'preserve.stagedForm.oneKey': 'în forma în care îl stochează camera (criptat cu cheia camerei)',
  'preserve.stagedForm.twoKeys':
    'în forma în care îl stochează camera (criptat cu cele două chei ale camerei)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'fiecare slot scris primește înapoi exact octeții pe care i-a citit din el copia de rezervă',
  'preserve.restoreForm.factoryStaged':
    'fiecare slot scris primește înapoi firmware-ul original, scris în forma în care îl stochează camera, astfel încât slotul ajunge octet cu octet cum l-a citit copia de rezervă',
  'preserve.restoreForm.none':
    'nu este posibilă pe acest build: nicio formă a firmware-ului original nu trece de verificarea proprie a camerei și nu se stochează totodată la loc ca octeții originali, așa că rularea se încheie cu imaginea completă și cu patch-ul încă aplicat',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'nu este posibilă pe acest build: firmware-ul cu patch nu poate citi întreaga memorie flash, așa că rularea nu are nicio imagine completă de oferit',
  'preserve.drain.rotated': 'camera o livrează rotită, iar rularea o pune la loc în ordine',
  'preserve.drain.hazard': 'patch-ul evită o citire care, pe acest build, blochează camera',
  'preserve.drain.whole':
    'întreaga memorie flash de 4 MB dintr-o singură citire, în bucăți de {size} B',
  'preserve.drain.wholeNotes':
    'întreaga memorie flash de 4 MB dintr-o singură citire, în bucăți de {size} B; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'permite comenzii de citire a camerei să ajungă la întreaga memorie flash de 4 MB, nu doar la primii 64 KB',
  'preserve.site.countPast':
    'permite poziției de citire să treacă de 64 KB, ca o citire să nu revină la început',
  'preserve.site.keepPosition':
    'păstrează întreaga poziție de citire când avansează după fiecare citire',
  'preserve.site.savePosition': 'salvează integral poziția de citire avansată',
  'preserve.site.clearPosition':
    'șterge întreaga poziție de citire de fiecare dată când începe o citire, ca camera să poată fi citită și după citirea completă',
  'preserve.site.modeTwoGuard':
    'permite citirii complete să înceapă ca orice altă citire (firmware-ul original o respinge)',
  'preserve.site.modeTwoIndirection':
    'îndreaptă citirea completă spre începutul memoriei flash (firmware-ul original o îndreaptă spre o valoare care blochează camera)',
  'preserve.site.armTail':
    'elimină un apel care blochează camera când începe o citire pe acest build',
  'preserve.site.other': 'schimbă o instrucțiune de care are nevoie citirea completă',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Copie de rezervă',
  'preserve.step.patch': 'Patch',
  'preserve.step.commit': 'Scriere',
  'preserve.step.drain': 'Citire completă',
  'preserve.step.restore': 'Restaurare',
  'preserve.step.verify': 'Verificare',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'pasul Patch',
  'preserve.stepId.commit': 'pasul Scriere',
  'preserve.stepId.drain': 'pasul Citire completă',
  'preserve.stepId.restore': 'pasul Restaurare',
  'preserve.stepId.verify': 'pasul Verificare',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: oprit conform planului — camera a pornit din {bank:acc}, căruia această rulare nu i-a aplicat patch-ul, așa că nu s-a citit nimic.',
  'preserve.result.noReason': 'nu s-a consemnat niciun motiv',
  'preserve.result.stopped': '{label}: oprit — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none':
    'niciun slot nu conține firmware căruia rularea să-i poată aplica patch-ul',
  'preserve.result.writable.one':
    '{banks:acc} conține firmware căruia rularea îi poate aplica patch-ul',
  'preserve.result.writable.many':
    '{banks:acc} conțin firmware căruia rularea îi poate aplica patch-ul',
  'preserve.result.backup':
    '{label}: s-a salvat fiecare bloc la care ajunge o citire obișnuită; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'un slot necunoscut',
  'preserve.result.backupNext':
    '{label}: s-a salvat fiecare bloc la care ajunge o citire obișnuită; {writable}; următoarea pornire intră în: {next}.',
  'preserve.result.patch': '{label}: construit pentru {banks:acc}.',
  /** The patch step when every bank was refused: nothing to build for. */
  'preserve.result.patchNone':
    '{label}: nu s-a construit niciun patch: niciun slot nu conține firmware căruia rularea să-i poată aplica patch-ul.',
  'preserve.result.patchCount':
    '{label}: construit pentru {banks:acc}; octeți schimbați în fiecare: {count}.',
  'preserve.result.commitOne':
    '{label}: {banks:acc} a fost scris cu patch-ul, iar camera a acceptat scrierea.',
  'preserve.result.commitMany':
    '{label}: {banks:acc} au fost scrise cu patch-ul, iar camera a acceptat fiecare scriere.',
  'preserve.result.drainNotRead': '{label}: necitit.',
  'preserve.result.drain':
    '{label}: întreaga memorie flash de 4 MB a fost citită; imaginea completă are sha256 {sha256}.',
  'preserve.result.drainThrough':
    '{label}: întreaga memorie flash de 4 MB a fost citită prin {bank:acc}; imaginea completă are sha256 {sha256}.',
  'preserve.result.restore': '{label}: firmware-ul original a fost scris la loc {banks:loc}.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm':
    '{label}: firmware-ul original a fost scris la loc {banks:loc}, {form}.',
  'preserve.result.verifyDone': '{label}: gata.',
  'preserve.result.verifyIdentical':
    '{label}: blocuri recitite: {blocks}, 0 octeți diferiți — memoria flash a camerei este identică octet cu octet cu copia de rezervă.',
  'preserve.result.verifyDiffers': '{label}: blocuri recitite: {blocks}, octeți diferiți: {bytes}.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: blocuri recitite: {blocks}, octeți diferiți: {bytes}, blocuri care nu au putut fi citite: {count}.',
    few: '{label}: blocuri recitite: {blocks}, octeți diferiți: {bytes}, blocuri care nu au putut fi citite: {count}.',
    other:
      '{label}: blocuri recitite: {blocks}, octeți diferiți: {bytes}, blocuri care nu au putut fi citite: {count}.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Oprit înainte de citirea completă: camera a pornit dintr-un slot căruia această rulare nu i-a aplicat patch-ul, așa că nu s-a citit nimic.',
  'preserve.unpatchedStart.next':
    'Urmează: restaurarea pune la loc fiecare slot scris. Citirea completă nu se mai încearcă: camera ar porni din același slot.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Gata — firmware-ul dumneavoastră este salvat',
  'preserve.done.detail':
    'Imaginea completă este întreaga memorie flash originală a camerei, iar camera însăși este exact cum era.',
  'preserve.done.titleNoImage': 'Gata — camera este cum era; nu există imagine completă',
  'preserve.done.detailNoImage':
    'Citirea completă nu a rulat, așa că această rulare nu are o imagine completă a memoriei flash. Fiecare slot scris a fost pus la loc, iar o citire nouă a blocurilor la care ajunge un dump obișnuit se potrivește cu copia de rezervă. Pentru imaginea completă, porniți o rulare nouă cu o alegere care include slotul în care intră următoarea pornire.',
  'preserve.done.detailNoImageCount':
    'Citirea completă nu a rulat, așa că această rulare nu are o imagine completă a memoriei flash. Fiecare slot scris a fost pus la loc, iar o citire nouă a blocurilor ({blocks}) la care ajunge un dump obișnuit se potrivește cu copia de rezervă. Pentru imaginea completă, porniți o rulare nouă cu o alegere care include slotul în care intră următoarea pornire.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'cititorul de ferestre al camerei are un buget pentru fiecare pornire, iar aceste citiri au venit de la un cititor epuizat — opriți și reporniți camera (deconectați-o și reconectați-o sau folosiți butonul ei de alimentare), apoi rulați din nou `preserve --resume <run-directory>`. Semnătură: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'cititorul de ferestre al camerei are un buget pentru fiecare pornire, iar aceste citiri au venit de la un cititor epuizat — opriți și reporniți camera (deconectați-o și reconectați-o sau folosiți butonul ei de alimentare), apoi rulați din nou `preserve --resume <run-directory>`. Semnătură: {signature} — din acești octeți nu se poate deriva nicio imagine necriptată din fabrică. S-au încercat toate căile de a o citi:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'copia de rezervă nu conține {bank:acc} ({address}) — ferestrele obișnuite nu îl pot livra',
  'preserve.fail.readsDisagree':
    'cele două citiri ale {bank:gen} nu coincid (sha256 {sha256} față de {other}) — o cameră care nu poate livra de două ori la rând slotul din care rulează nu este o cameră în care să se scrie; captura este sursa restaurării și datele de intrare pentru derivarea patch-ului',
  'preserve.fail.notFactory':
    '{bank:acc} nu conține imaginea din fabrică așa cum o stochează cifrul acestui build (prefixul de imagine așteptat nu se potrivește cu captura) — se refuză înainte să se consemneze ceva, darămite să se scrie',
  'preserve.fail.ffSum':
    'firmware-ul cu patch, în forma în care îl stochează camera, nu trece de verificarea proprie a acestui build (suma lui trebuie să fie {sum}) — se refuză trimiterea unui slot pe care camera l-ar respinge după ștergere',
  'preserve.fail.headChanged':
    'începutul {bank:gen} s-a schimbat de la copia de rezervă (nu conține nici captura originală, nici octeții cu patch) — se refuză scrierea peste o stare necunoscută a slotului; nu s-a scris nimic. Hex de început: actual {live} față de captură {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks:acc} conține deja octeții cu patch — scrierea a reușit la o încercare anterioară și nu trebuie repetată. Reluați de la pasul de citire completă (--resume), care pornește imaginea cu patch și continuă de acolo.',
  'preserve.fail.landed':
    '{banks:acc} conțin deja octeții cu patch — scrierea a reușit la o încercare anterioară și nu trebuie repetată. Reluați de la pasul de citire completă (--resume), care pornește imaginea cu patch și continuă de acolo.',
  'preserve.fail.drainRebootRefused':
    'comanda de repornire a citirii complete a fost REFUZATĂ de gazdă înainte să plece (o SecurityError: o politică a browserului sau o protecție de test), așa că camera rulează în continuare imaginea cu care a pornit, nu patch-ul scris. Citirea completă citește doar prin fereastra lărgită a imaginii cu patch, așa că se oprește înainte să activeze ceva; nu s-a citit nimic. Rulați din nou citirea completă acolo unde gazda lasă să treacă comanda de repornire.',
  'preserve.fail.shiftedRebootRefused':
    'citirea completă a revenit decalată cu o pagină, iar repornirea care dă o altă pornire a fost REFUZATĂ de gazdă înainte să plece (o SecurityError: o politică a browserului sau o protecție de test) — o altă încercare ar citi aceeași pornire decalată. Nu s-a păstrat nimic; rulați din nou citirea completă acolo unde resetarea poate pleca.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'verificarea a citit {count} octet diferit în {read}/{total} ferestre — cipul nu se recitește identic octet cu octet cu copia de rezervă',
    few: 'verificarea a citit {count} octeți diferiți în {read}/{total} ferestre — cipul nu se recitește identic octet cu octet cu copia de rezervă',
    other:
      'verificarea a citit {count} de octeți diferiți în {read}/{total} ferestre — cipul nu se recitește identic octet cu octet cu copia de rezervă',
  },
  'preserve.fail.verifyIn': {
    one: 'verificarea a citit {count} octet diferit în {read}/{total} ferestre (în {places}) — cipul nu se recitește identic octet cu octet cu copia de rezervă',
    few: 'verificarea a citit {count} octeți diferiți în {read}/{total} ferestre (în {places}) — cipul nu se recitește identic octet cu octet cu copia de rezervă',
    other:
      'verificarea a citit {count} de octeți diferiți în {read}/{total} ferestre (în {places}) — cipul nu se recitește identic octet cu octet cu copia de rezervă',
  },
  'preserve.fail.verifyShort': {
    one: 'verificarea a citit {count} octet diferit în {read}/{total} ferestre (ferestre incomplete: {short}) — cipul nu se recitește identic octet cu octet cu copia de rezervă',
    few: 'verificarea a citit {count} octeți diferiți în {read}/{total} ferestre (ferestre incomplete: {short}) — cipul nu se recitește identic octet cu octet cu copia de rezervă',
    other:
      'verificarea a citit {count} de octeți diferiți în {read}/{total} ferestre (ferestre incomplete: {short}) — cipul nu se recitește identic octet cu octet cu copia de rezervă',
  },
  'preserve.fail.verifyInShort': {
    one: 'verificarea a citit {count} octet diferit în {read}/{total} ferestre (în {places}) (ferestre incomplete: {short}) — cipul nu se recitește identic octet cu octet cu copia de rezervă',
    few: 'verificarea a citit {count} octeți diferiți în {read}/{total} ferestre (în {places}) (ferestre incomplete: {short}) — cipul nu se recitește identic octet cu octet cu copia de rezervă',
    other:
      'verificarea a citit {count} de octeți diferiți în {read}/{total} ferestre (în {places}) (ferestre incomplete: {short}) — cipul nu se recitește identic octet cu octet cu copia de rezervă',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'blocul de configurare a pornirii',
  'preserve.fail.dataBlock': 'un bloc de date',

  'preserve.refused.secondRead': 'a doua lui citire a eșuat ({error})',
  'preserve.refused.readsDisagree':
    'cele două citiri ale lui nu coincid (sha256 {sha256} față de {other})',
  'preserve.refused.erased': 'este șters',
  'preserve.refused.watchdogMark':
    'cuvântul lui de antet de la +0x200 conține {word}, marcajul pe care bootloader-ul îl scrie peste un slot după o resetare de watchdog la începutul unei porniri; bootloader-ul nu mai acceptă acest slot, iar rularea nu are acolo nicio imagine căreia să-i aplice patch-ul',
  'preserve.refused.noHeader': 'nu conține niciun antet de imagine la +0x200',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'conține {image} ({id}), nu build-ul pe care îl rulează camera ({camera})',
  'preserve.refused.otherKey':
    'verificarea bootloader-ului îl refuză: este stocat cu altă cheie decât cea cu care bootloader-ul acestei camere verifică sloturile, iar o scriere prin cameră l-ar stoca cu acea cheie, așa că restaurarea nu i-ar putea pune la loc exact octeții',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'camera raportează firmware-ul {camera}, iar rularea are nevoie de {version} — patch-ul este derivat din octeții unui build și nu trebuie trimis altuia',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'firmware-ul {version} nu este un build 0.x sau 1.x, iar această rulare acoperă doar build-urile din 2014 și 2016. Nu s-a citit nimic în afară de versiune. Citiți în schimb această cameră cu „Extragere și decriptare 4.x/Nano”: ea citește memoria flash fără patch, fiecare bloc în afară de cel de la 0x14060000, la care nu ajunge nicio fereastră de citire pe acele build-uri.',
  'preserve.refused.preWidening':
    'firmware-ul {version} este anterior rutei de lărgire, iar rularea refuză în loc să scrie peste un slot pe care nu îl poate reciti. Pe această generație, camera respinge orice mod de a porni citirea de care are nevoie ruta (măsurat pe 0.3.0.1), comanda ei de citire nu ajunge la începutul memoriei flash, iar dimensiunea pe care ar schimba-o patch-ul este stocată altfel. Nu are nici vreo citire pe care să o poată folosi un dump obișnuit. Nu s-a citit nimic în afară de versiune.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'conține o imagine necunoscută (nici firmware-ul original {version}, nici o modificare a lui pe care Preserve o cunoaște), așa că Preserve nu aplică patch-ul acestui slot și nici nu îl pune la loc',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'conține un build cunoscut pentru rata de cadre: firmware-ul original {version} cu patch-ul pentru rata de cadre de {hz} Hz. Preserve aplică patch-ul doar pe firmware-ul original, niciodată pe o imagine cu patch, așa că nu aplică patch-ul acestui slot și nici nu îl pune la loc',
  'preserve.image.frameRateEarlier':
    'conține un build cunoscut pentru rata de cadre: firmware-ul original {version} cu un patch anterior de {hz} Hz pentru rata de cadre (făcut înainte să i se adauge corecția pentru USB). Preserve aplică patch-ul doar pe firmware-ul original, niciodată pe o imagine cu patch, așa că nu aplică patch-ul acestui slot și nici nu îl pune la loc',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    'slotul {what}. Ca să includeți acest slot, scrieți mai întâi la loc imaginea originală în el (de exemplu, dintr-o copie de rezervă completă a memoriei flash făcută înainte de modificare), apoi porniți o rulare nouă',
  'preserve.image.frameRateWords':
    'slotul {what}. Ca să includeți acest slot, scrieți mai întâi la loc imaginea originală în el (de exemplu, dintr-o copie de rezervă completă a memoriei flash făcută înainte de patch-ul pentru rata de cadre), apoi porniți o rulare nouă; patch-ul pentru rata de cadre poate fi aplicat din nou pe imaginea originală după aceea',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name:ins} {what}. Rularea ia din acest slot firmware-ul căruia îi aplică patch-ul, așa că se oprește aici, înainte să se scrie ceva. Ca să păstrați firmware-ul acestei camere, scrieți mai întâi la loc imaginea originală {bank:loc} (de exemplu, dintr-o copie de rezervă completă a memoriei flash făcută înainte de modificare), apoi porniți o rulare nouă.',
  'preserve.image.frameRateRefusal':
    '{name:ins} {what}. Rularea ia din acest slot firmware-ul căruia îi aplică patch-ul, așa că se oprește aici, înainte să se scrie ceva. Ca să păstrați firmware-ul acestei camere, scrieți mai întâi la loc imaginea originală {bank:loc} (de exemplu, dintr-o copie de rezervă completă a memoriei flash făcută înainte de patch-ul pentru rata de cadre), apoi porniți o rulare nouă; patch-ul pentru rata de cadre poate fi aplicat din nou pe imaginea originală după aceea.',
  'preserve.image.otherFirmware':
    'conține firmware-ul {image}, nu {camera}, pe care îl rulează camera',
  'preserve.image.otherFirmwareRefusal':
    '{name:ins} conține firmware-ul {image}, nu {camera}, pe care îl rulează camera, așa că această rulare nu are acolo nicio imagine căreia să-i poată aplica patch-ul și refuză în loc să scrie peste ea.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'din el nu se derivă nicio imagine căreia rularea să-i poată aplica patch-ul ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone': 'această rulare s-a încheiat — toți pașii s-au terminat (rularea {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    '{step} este deja făcut în această rulare (terminat la {finished}) — reluarea continuă la {next}',
  'preserve.gate.stepDoneUnknownTime':
    '{step} este deja făcut în această rulare (terminat la o oră necunoscută) — reluarea continuă la {next}',
  'preserve.gate.backupRerun':
    'copia de rezervă nu poate rula din nou: această rulare a terminat deja {steps}, iar pasul ei următor este {next} — folosiți --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'încercarea anterioară de copiere de rezervă a eșuat, iar camera trebuie OPRITĂ ȘI REPORNITĂ înainte ca acest pas să ruleze din nou — o reîncercare în aceeași pornire poate citi octeți vechi sau goi (măsurat: o copiere de rezervă reîncercată a citit cuvântul de pornire al bootloader-ului în locul înregistrării de configurare a pornirii). Opriți și reporniți camera (deconectați-o și reconectați-o sau folosiți butonul ei de alimentare), apoi rulați din nou copia de rezervă și confirmați oprirea și repornirea când vi se cere: rularea nu poate vedea acest lucru. Eșecul consemnat: {error}',
  'preserve.gate.noErrorText': '(fără text de eroare)',
  'preserve.gate.patchAfterBackup':
    '{step} rulează după copia de rezervă: rularea face dump-ul fiecărei regiuni pe care o poate citi planul obișnuit și îl salvează ÎNAINTE să se întâmple orice altceva — acea copie de rezervă este singura copie a acestei camere. Rulați mai întâi pasul de copiere de rezervă.',
  'preserve.gate.commitAfterBackup': '{step} rulează după copia de rezervă (vedeți pasul Patch)',
  'preserve.gate.commitAfterPatch':
    '{step} rulează după pasul Patch, care consemnează ce transferă',
  'preserve.gate.commitNeedsPatch':
    '{step} are nevoie de patch-ul {banks:gen}, iar pasul Patch nu a consemnat niciunul — rulați din nou pasul Patch',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step} are nevoie de fișierele copiei de rezervă din directorul rulării, iar acestea lipsesc: {files} — fără ele, o scriere nu are sursă pentru restaurare, așa că refuză',
  'preserve.gate.drainNoCommit':
    '{step} citește cipul CU PATCH prin fereastra lărgită, iar această rulare nu are nicio scriere încheiată — citirea completă s-ar bloca pe o cameră nemodificată. Rulați mai întâi pasul Scriere (sau reluați de la el) ori faceți explicit saltul (allowJump) dacă scrierea s-a făcut fără punctul ei de control.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'pasul Citire completă refuză pe {build}: {note}',
  'preserve.gate.detectedBuild': 'build-ul detectat',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'pasul Citire completă refuză pe {build}: pornirea citirii complete pe firmware-ul fără patch al acestui build blochează camera (citește de la o valoare care nu este o adresă din memoria flash; măsurat pe emulator: s-au livrat 32 KB, apoi camera a dat eroare). Modificarea care face citirea sigură se află la {sites} și nu este printre modificările pe care această rulare le-a consemnat pentru {bank:acc} — rulați pasul Patch (și duceți scrierea la capăt) înainte de citirea completă.',
  'preserve.gate.drainFiles':
    '{step} are nevoie de {files} (dump-ul livrat este prelucrat cu captura fiecărui slot scris), iar acesta nu se află în directorul rulării',
  'preserve.gate.restoreNoCommit':
    '{step} pune la loc sloturile originale peste patch, iar această rulare nu are nicio scriere încheiată — nu are ce să anuleze. Rulați mai întâi pasul Scriere (sau reluați de la el) ori faceți explicit saltul (allowJump) pentru a restaura o cameră care are deja patch-ul.',
  'preserve.gate.restoreNeedsPatch':
    '{step} are nevoie de rezumatul patch-ului fiecărui slot scris (pentru lungimea transferată) — rulați mai întâi pasul Patch',
  'preserve.gate.restoreNoForm':
    'pasul Restaurare refuză pe {build}: nicio formă a firmware-ului original nu trece de verificarea proprie a camerei și nu se stochează totodată la loc ca octeții originali — suma de control a firmware-ului original este 0xB7AB9D17 (măsurat), nu 0xFFFF, cât cere camera. Această rulare se încheie cu imaginea completă în mână și cu patch-ul aplicat; conținutul original poate fi pus la loc doar cu un programator pentru întreaga memorie flash.',
  'preserve.gate.restoreFiles':
    '{step} are nevoie de {files} (originalul fiecărui slot scris, din pasul de copiere de rezervă), iar acesta nu se află în directorul rulării',
  'preserve.gate.verifyNoRestore':
    '{step} compară o pornire nouă cu copia de rezervă, iar această rulare nu are nicio restaurare încheiată — un slot cu patch ar apărea ca diferențe. Rulați mai întâi restaurarea (sau reluați de la ea) ori faceți explicit saltul (allowJump) dacă restaurarea s-a făcut fără punctul ei de control.',
  'preserve.gate.verifyNeedsBackup':
    '{step} are nevoie de {file} (referința comparației), iar acesta nu se află în directorul rulării',
  'preserve.gate.needsBanks':
    '{step} are nevoie de sloturile citite de pasul de copiere de rezervă, iar starea nu are niciunul',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'nu este ales niciun slot pentru această rulare: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank:acc} nu poate fi scris: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'patch-ul acestui build pornește doar din slotul de recuperare R: {note} — rularea ar scrie în {bank:acc}, de unde bootloader-ul nu îl pornește niciodată',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'fișierul este prea mic ca să conțină un antet de imagine',
  'slots.image.notWordSized':
    'dimensiunea imaginii trebuie să fie multiplu de 4 (s-au primit {size} B)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'imaginea are {size} B; bootloader-ul respinge orice header.length >= {limit}, așa că nu ar porni niciodată',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'niciun antet de imagine la {at} (magic {magic}, așteptat {expected}) — trebuie să fie o imagine de firmware Seek decriptată, nu un slot criptat sau un dump al memoriei flash',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'pointerul de stivă inițial {address} nu este în SRAM-ul LPC43xx — imaginea nu pare decriptată',
  'slots.image.stackUnaligned': 'pointerul de stivă inițial {address} nu este aliniat la cuvânt',
  'slots.image.notThumb': 'vectorul de reset {address} nu este o adresă Thumb',
  'slots.image.noKeyPair':
    'numele acestui fișier nu conține perechea lui de chei, iar nici perechea acestei camere, nici o pereche decodată a aplicației nu apare în imagine exact o dată, așa că nu se poate ști pentru ce chei a fost construită imaginea. Fișierele decriptate primesc nume care conțin cheile lor.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'numele fișierului indică cheia A {keyA} și cheia B {keyB}, dar {mismatch}. Ambele chei trebuie să fie prezente, fiecare exact o dată.',
  'slots.image.keyInHeader':
    'această imagine păstrează o cheie la {at}, în fereastra necriptată a antetului — se refuză aplicarea patch-ului',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'cheia A și cheia B din numele fișierului corespund unor octeți care se suprapun, la {at} și {other} — trebuie să fie două valori distincte de 16 octeți',
  'slots.image.retargetLost':
    'după redirecționare, imaginea nu conține perechea de chei a acestei camere exact o dată — se refuză construirea unor date pentru care bootloader-ul nu ar putea stabili cheia la actualizările ulterioare',
  'slots.image.noStageKey':
    'imaginea nu conține nicio pereche de chei a liniei din 2016, așa că nu există nicio cheie de transfer cu care să fie codată',
  'slots.image.ffSumNoKeys':
    'această imagine are suma cuvintelor 0xFFFF a build-ului FF de 16 Hz, dar nu conține perechea de chei 1.3.0.8-FF (ambele jumătăți, fiecare o dată), așa că forma ei de transfer nu poate fi construită. Nu s-a scris nimic.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'aceasta este imaginea 1.3.0.8 FF (16 Hz), care se transferă în propria ei formă cu cheia A (ff-form.ts), nu ca imagine necriptată. Nu s-a scris nimic.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'planul a fost construit pentru firmware-ul {firmware}, dar analiza citește {version}. Planul este învechit; construiți-l din nou. Nu s-a scris nimic.',
  'slots.plan.otherFirmwareUnknown':
    'planul a fost construit pentru un firmware cu versiune necunoscută, dar analiza citește {version}. Planul este învechit; construiți-l din nou. Nu s-a scris nimic.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'planul a fost construit pentru camera {planSerial}, dar analiza citește {serial}. Se refuză scrierea aici. Nu s-a scris nimic.',
  'slots.plan.cameraUnknownSerial': 'cu număr de serie necunoscut',
  'slots.plan.unknownSerial': 'un număr de serie necunoscut',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, inside the sentence ("slot A"). */
  'slots.plan.otherAddress': 'planul vizează {address}, dar {name:acc} al build-ului este la {at}',
  'slots.plan.notRead': 'analiza nu mai citește {name:acc}. Nu s-a scris nimic.',
  'slots.plan.edited':
    'suma de control a planului nu se potrivește cu datele lui, deci planul a fost modificat. Nu s-a scris nimic.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'datele au {size} B, mai mult decât încape {name:loc}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck': '{risk}. Scrierea lui necesită acknowledgeRisk: true. Nu s-a trimis nimic.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'această cameră nu poate primi de aici o imagine transferată necriptat: {reason}. Nu s-a scris nimic.',
  'slots.plan.noKeyTable':
    'analiza nu numește tabelul de chei al bootloader-ului acestei camere, așa că imaginea nu poate fi redirecționată spre el',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'starea confirmării nu a putut fi citită după CompleteMemoryUpgrade, așa că {name:acc} poate fi scris parțial. Citiți din nou sloturile înainte să faceți orice altceva și păstrați dump-ul.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'camera a refuzat scrierea {name:loc} la confirmare, cu {status}: {cause}. Nu s-a scris nimic; slotul este neschimbat. Citiți din nou sloturile înainte să faceți orice altceva.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade a returnat {status} ({cause}) pentru {name:acc}: nu s-a programat nimic, dar ștergerea poate să fi început, așa că slotul poate fi parțial șters. Citiți din nou sloturile înainte să faceți orice altceva și păstrați dump-ul.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade a returnat {status} ({cause}) — {name:acc} poate fi scris parțial. Citiți din nou sloturile înainte să faceți orice altceva și păstrați dump-ul.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'camera a raportat {status} în timpul transferului {name:gen}, la offsetul {offset} — oprit înainte de CompleteMemoryUpgrade, așa că nu s-a scris nimic în memoria flash',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum':
    'suma de control a transferului nu s-a potrivit cu octeții transferați',
  'commit.cause.unsupported':
    'imaginea nu s-a decriptat cu cheile camerei sau tipul de date este refuzat',
  'commit.cause.acceptance':
    'imaginea a fost refuzată de verificarea ei de acceptare înainte să se șteargă ceva (verificarea depinde de build)',
  'commit.cause.notArmed': 'nu a fost activată nicio actualizare de slot',
  'commit.cause.eraseFailed': 'etapa de ștergere a eșuat',
  'commit.cause.programFailed': 'etapa de programare a eșuat',
  'commit.cause.verifyFailed': 'etapa de verificare a eșuat',
  'commit.cause.unknown': 'o stare necunoscută aici',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name:ins} nu se copiază peste el însuși. Nu s-a scris nimic.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Nu s-a scris nimic.',
  'copy.refused.noPlain':
    '{name:ins} nu are nicio imagine decriptată de copiat. Nu s-a scris nimic.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} este un ZIP care nu poate fi citit aici ({error}). Nu s-a scris nimic.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} nu conține o memorie flash completă. Un ZIP este acceptat când este un fișier de rulare Preserve care conține {preserve} (după ce pasul lui de citire completă a rulat), o arhivă zip „Extragere și decriptare 4.x/Nano” ({dump}) sau o arhivă zip „Extragerea tuturor selectorilor” ({selectors}); acest ZIP conține {names}. Nu s-a scris nimic.',
  'restore.refused.noWholeFlashPatched':
    '{file} nu conține o memorie flash completă. Un ZIP este acceptat când este un fișier de rulare Preserve care conține {preserve} (după ce pasul lui de citire completă a rulat), o arhivă zip „Extragere și decriptare 4.x/Nano” ({dump}) sau o arhivă zip „Extragerea tuturor selectorilor” ({selectors}); acest ZIP conține {names}. Fișierul {patched} din el este memoria flash cu patch-ul temporar al rulării, așa că nu este acceptat. Nu s-a scris nimic.',
  'restore.refused.zipEmpty': 'nimic',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'o copie de rezervă completă a memoriei flash are {full} B (4 MB, întregul cip, cum îl citește J-Link); {file} are {size} B. Nu s-a scris nimic.',
  'restore.refused.noBank': 'planul acestui build nu are {bank:acc}. Nu s-a scris nimic.',
  'restore.refused.outsideFlash':
    '{name:ins} nu se află într-o memorie flash de 4 MB. Nu s-a scris nimic.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    'Dump-ul din care provine {file} nu a citit {where}: conform manifest.json, {address} este un gol. Nu există nicio imagine de restaurat. Nu s-a scris nimic.',
  'restore.refused.gapReason':
    'Dump-ul din care provine {file} nu a citit {where}: conform manifest.json, {address} este un gol ({gap}). Nu există nicio imagine de restaurat. Nu s-a scris nimic.',
  'restore.refused.gapFill':
    'Dump-ul din care provine {file} nu a citit {where}: conform manifest.json, {address} este un gol, umplut cu {fill}. Nu există nicio imagine de restaurat. Nu s-a scris nimic.',
  'restore.refused.gapReasonFill':
    'Dump-ul din care provine {file} nu a citit {where}: conform manifest.json, {address} este un gol ({gap}), umplut cu {fill}. Nu există nicio imagine de restaurat. Nu s-a scris nimic.',
  'restore.refused.empty':
    'Nu se poate restaura {where}: este gol, fiecare octet este 0xFF. O scriere programează o imagine și nu poate lăsa un slot șters, așa că un slot gol nu poate fi restaurat printr-o scriere. Nu s-a scris nimic.',
  'restore.refused.fill':
    'Nu se poate restaura {where}: fiecare octet este {fill}, umplutura pe care dump-ul o scrie acolo unde nu a citit nimic, deci dump-ul nu a citit acest slot. Nu există nicio imagine de restaurat. Nu s-a scris nimic.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    'Nu se poate restaura {where} din acest fișier: {why}. Nu s-a scris nimic.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'acest build nu are activare de scriere pentru slot',
  'support.noStagingEmpty':
    'acest build nu are nicio formă de transfer, așa că un slot gol nu se scrie',
  'support.buildUnknown': 'build-ul este necunoscut',
  'support.unverifiedStaging':
    'acest build este pe linia blocată 0.x/1.x, dar nu este unul dintre build-urile pe care s-au măsurat tabelele de patch-uri Preserve (0.8.0.0 .. 1.3.0.8 și 1.0.3.0 / 1.0.3.2), așa că forma de transfer pe care o primește slotul lui este necunoscută și nu se scrie nimic',
  'support.unknownFamily':
    'familia camerei nu este cunoscută, deci nici cheia cu care se scriu sloturile ei, iar o cameră acceptă un slot scris cu o cheie greșită și apoi nu mai pornește din el. Extrageți și decriptați această cameră, identificați-o din dump, apoi numiți-i familia cu --family.',
  'support.noReadCommand':
    'firmware-ul mai vechi decât 0.8.0.0 nu are rutină de citire pentru GetFeaturedFirmwareData, comanda cu care un dump citește memoria flash. Pe 0.7.0.7 și 0.7.0.8, ea se află în tabelul de metode RPC la 0x4F, dar este înregistrată doar ca setter (rutină de scriere), așa că citirea control-IN pe care o trimite un dump nu poate fi tratată (rularea Preserve citește în schimb aceste două build-uri prin wire id 0x58, GetFeaturedData); înainte de 0.7.0.7, wire id 0x4F este UploadFirmwareRowSize, iar pe 0.3.0.1 wire id 0x52 — cel cu care activează un dump — este EnterBootloaderMode, nu BeginFirmwareUpgrade: camera rămâne în aplicație, dar fiecare activare setează o țintă în memoria flash și activează etapa de actualizare de firmware a acelui build (GetErrorCode citește apoi 0x00400000), ceea ce nu este o fereastră de citire. Recuperat din tabelele de metode proprii ale imaginilor, ambele coloane de rutine; vedeți test/firmware/facts.json.',
  'support.noWritePath':
    'aceste build-uri primesc firmware nou printr-o secvență de actualizare mai veche pe care aceste instrumente nu o trimit, iar sloturile lor nu au fost cartografiate niciodată, așa că nu se scrie nimic.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'versiunea firmware-ului nu a putut fi citită, așa că build-ul, sloturile lui și forma lor de transfer sunt necunoscute; nu se citește și nu se scrie nimic pe el',
  'support.versionNotDotted':
    'versiunea de firmware „{version}” nu este o versiune cu puncte, așa că build-ul, sloturile lui și forma lor de transfer sunt necunoscute; nu se citește și nu se scrie nimic pe el',
  'support.olderThanFirst':
    'firmware-ul {version} este mai vechi decât {first}: tabelul lui RPC nu are rutină de citire pentru GetFeaturedFirmwareData, comanda pe care o trimite citirea unui slot, așa că nu i se trimite nici citire, nici scriere (dovezile sunt la early-compact)',
  'support.modernOnLocked':
    'familia modern-4x acoperă 2.x, 4.x, 10.x, 42.x și 44.x; {version} este pe linia blocată 0.x / 1.x, care are nevoie de legacy-auth sau compact-2016',
  'support.lockedOnModern':
    'familia legacy-auth acoperă linia blocată 0.x / 1.x; {version} este pe linia modernă, care are nevoie de modern-4x',
  'support.notCompactPro':
    'familia compact-2016 acoperă linia Compact PRO 1.0.3.x; {version} nu este pe ea',
  'support.earlyCompact':
    'familia early-compact acoperă doar build-urile mai vechi decât {first}, iar {version} este citit prin legacy-auth',
  'support.generic':
    'familia camerei nu este identificată (familia generic), așa că dispunerea sloturilor și forma de transfer sunt necunoscute; identificați camera înainte ca un slot să fie citit sau scris',
  'support.noPlan':
    'nu există niciun plan de sloturi pentru familia {family}: dispunerea sloturilor și forma de transfer nu sunt cunoscute',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'tabelul acestui build nu activează modul {mode} la {address} pe canalul simplu',
  'support.noArmToken':
    'tabelul acestui build nu activează modul {mode} la {address} pe canalul cu token',
  'support.windowElsewhere': 'fereastra Preserve pentru {bank:acc} este la {at}, nu la {address}',
  'support.noDumpWindow':
    'tabelul BeginFirmwareUpgrade al acestui build nu are nicio fereastră la {address} pentru {bank:acc}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} nu acceptă {capability}: {reason}',
  'support.capability.dump': 'extragerea',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': '„Extragerea tuturor selectorilor”',
  'support.capability.decrypt': 'decriptarea',
  'support.capability.deviceInfo': 'citirea completă din fila Info',
  'support.capability.flash': 'scrierea sloturilor',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name} de la {address} nu poate fi citit pe acest build: tabelul lui de selectori nu are nicio fereastră acolo, așa că nu s-a activat nimic pentru el',
  'slots.unread.missing': '{name} lipsește din analiza camerei',
  'slots.unread.notRead': '{name} nu a fost citit',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Nu s-a scris nimic.',
  'slots.refused.versionUnknown':
    'analiza nu spune ce firmware rulează camera, iar comenzile pentru sloturi înseamnă lucruri diferite pe build-uri diferite. Citiți din nou informațiile despre dispozitiv.',
  'slots.refused.versionUnknownWrite':
    'analiza nu spune ce firmware rulează camera. Nu s-a scris nimic.',
  'slots.refused.emptyInput': 'datele de intrare sunt goale',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable': '{name} este gol și nu poate fi scris pe acest build: {reason}',
  'slots.refused.noRaw': '{name} nu poate primi octeți bruți pe acest build: {reason}',
  'slots.refused.noPlain': '{name} nu poate primi o imagine decriptată pe acest build: {reason}',
  'slots.refused.noStaging':
    '{name} nu are nicio formă de transfer pe acest build, așa că nu se poate coda o imagine pentru el',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B depășește dimensiunea pentru {name} ({bankSize} B)',
  'slots.refused.imageTooLong':
    'imaginea are {size} B și depășește dimensiunea pentru {name} ({bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'bootloader-ul din 2014 nu acceptă suma de control a acestui build în slotul A sau B și pornește slotul de recuperare R (0x14070000) fără să-l verifice, așa că patch-ul este scris în slotul de recuperare R și nicăieri altundeva',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly': 'acest build rulează doar din slotul de recuperare R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize':
    'un slot de firmware are {size} B ({kib} KB); acest fișier are {count} B',
  'decryptFile.erasedBank':
    'gol, nimic de decriptat: toți cei {size} B se citesc ca 0xFF (un slot șters)',
  'decryptFile.erasedHeader':
    'șters: fereastra antetului este numai 0xFF, așa că slotul nu conține nicio imagine; nu se decriptează nimic',
  'decryptFile.noHeader':
    'niciun antet de imagine (magic {magic}), așa că nu există nicio imagine de decriptat',
  'decryptFile.lengthOutOfRange':
    'header.length {length} este în afara intervalului; nicio imagine de decriptat',
  'decryptFile.ffKeyB':
    's-au decriptat {size} B cu cheia B FF 1.3.0.8: imaginea este stocată ca imaginea XOR fluxul de cheie al blocului ei de chei 1, cu fereastra antetului neschimbată',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'cheie nerecuperată: imaginea se decriptează într-un vector de reset care nu este un punct de intrare Cortex-M (cheie {check}); nu se decriptează nimic',
  'decryptFile.storedPlain':
    'stocat necriptat: slotul conține imaginea așa cum rulează (lanțul necriptat din 2014, un flux de cheie identitate), așa că nu există cheie, iar imaginea decriptată este chiar imaginea',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 's-au decriptat {size} B cu cheia recuperată din acest slot ({check})',
  'decryptFile.decryptedNamed':
    's-au decriptat {size} B cu cheia recuperată din acest slot ({check}; este {key:acc})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'citire incompletă ({size} B)',
  'read.reason.noParse': 'antetul imaginii nu a putut fi analizat',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'niciun antet de imagine (magic {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} este în afara intervalului',
  'read.reason.stopped': 'citirea slotului s-a oprit la {count}/{size} B',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'nu poate fi citit pe firmware-ul {version}: planul lui ({table}) nu are nicio fereastră la {address}, așa că nu s-a activat nimic pentru el',
  'read.reason.notInPlanUnknown':
    'nu poate fi citit pe un firmware cu versiune necunoscută: planul lui ({table}) nu are nicio fereastră la {address}, așa că nu s-a activat nimic pentru el',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'fereastra a livrat octeții unui descriptor de cititor vechi — cuvântul 0 {word} cu reset {hex} este tabelul de vectori de la 0x14000000, nu conținutul acestui slot, așa că nu s-a analizat nimic din el: {remedy}',
  'read.reason.spentReader': 'sloturile camerei nu au putut fi citite — {remedy}',
  'read.spentRemedy':
    'cititorul de ferestre poate fi epuizat pentru această pornire; opriți și reporniți camera și încercați din nou',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'cuvântul slotului activ al camerei (fw info roots, selectorul 10) nu a putut fi citit',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'cuvântul slotului activ al camerei este {word}, care nu numește niciun slot',
  'checkKey.unnamed.cfg0NotRead':
    'cuvântul de configurare a pornirii nu a fost citit, așa că nu se știe dacă bootloader-ul a verificat {bank:acc} înainte să intre în el',
  'checkKey.unnamed.noZeroSum':
    'camera raportează că a intrat {bank:loc}, dar {bank:acc} nu se decriptează la o sumă a cuvintelor zero la această citire',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'camera raportează că a intrat {bank:loc}, pe care cuvântul de configurare a pornirii {word} îl lasă la urmă, așa că bootloader-ul a intrat în el fără verificare, dar {bank:acc} nu se decriptează la o sumă a cuvintelor zero la această citire',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (scor {score} după citire, pe baza dovezilor de mai jos)',
  'report.detectedAmbiguous':
    '{family} (scor {score} după citire, pe baza dovezilor de mai jos; ambiguu)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'da',
  'report.cell.no': 'nu',
  'report.cell.notApplicable': 'n/a',
  'report.cell.unknown': 'necunoscut',
  'report.cell.recoveryOnly': 'doar recuperare',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'constanta de albire K',
  'report.keyRow.store': 'cheie de stocare',
  'report.keyRow.check': 'cheie de verificare',
  'report.keyRow.table': 'tabel de chei',
  'report.keyRow.keys': 'chei',
  'report.keyRow.a': 'cheia A',
  'report.keyRow.b': 'cheia B',
  'report.keyRow.tableAt': 'tabel la',
  'report.key.notIdentified': '(neidentificat)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} candidat, niciunul confirmat',
    few: '{count} candidați, niciunul confirmat',
    other: '{count} de candidați, niciunul confirmat',
  },
  'report.key.tableAt': '{offset} în blocul bootloader-ului, confirmat cu un slot',
  'report.key.plainChain':
    'nu este nevoie: sloturile sunt stocate ca firmware necriptat, așa că un slot se citește și se scrie ca atare',
  'report.key.tableRefused2016':
    'necitit — blocul bootloader-ului (0x14000000) este refuzat pe orice canal pe această linie de firmware',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, numită pe baza {bank:gen}, slotul în care camera raportează că a intrat după verificarea bootloader-ului',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, dedusă din {bank:acc}, slotul în care camera raportează că a intrat: bootloader-ul intră în acel slot fără verificare și îl rulează cu cheia cu care verifică celelalte sloturi',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' (blocul 1 din {pair})',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'perechea Compact PRO 1.0.3.x 9 Hz',
  'keyPair.cp1032ff': 'perechea Compact PRO 1.0.3.x FF',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'nenumită — {why}',
  'report.checkKey.couldNotName': 'citirea nu a putut-o numi',
  'report.storeKey.checkKeyUnnamed':
    'cheia cu care bootloader-ul ei verifică un slot (nenumită la această citire): aplicația stochează cu această cheie fiecare slot pe care îl scrie',
  'report.storeKey.checkKey':
    '{key}: aplicația stochează fiecare slot pe care îl scrie cu cheia pe care o verifică bootloader-ul ei',
  'report.storeKey.unknown':
    'necunoscută — blocul bootloader-ului care conține locul cheii proprii a dispozitivului nu a fost citit',
  'report.storeKey.keyBUnidentified':
    'cheia B (nicio cheie proprie a dispozitivului programată; cheia B însăși neidentificată)',
  'report.storeKey.keyB': 'cheia B (nicio cheie proprie a dispozitivului programată)',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain': 'transferat necriptat (imaginea ca atare, fără cheie)',
  'report.staged.slotKeystream': 'transferat cu blocul de chei 0 al propriei imagini',
  'report.staged.keyA':
    'transferat cu chei derivate din slotul de pornire și din aplicația care rulează',
  'report.staged.ffVendor':
    'transferat așa cum aplicația producătorului transferă imaginea FF de 16 Hz (imaginea XOR propriul ei bloc de chei 0), stocat de cameră cu cheia B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Copie de rezervă: blocul {address}',
  'progress.backupDone': 'Copie de rezervă: toate blocurile citite',
  'progress.checkBlock': 'Verificare: blocul {address}',
  'progress.checkDone': 'Verificare: toate blocurile citite',
  'progress.writingBank': 'Se scrie {bank:acc}',
  'progress.restoringBank': 'Se restaurează {bank:acc}',
  'progress.staged': '{label}: transferat {done}/{total} B',
  'progress.wholeFlash': 'Citire completă: {got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'citire {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'citire {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Gata — ferestre citite: {ok}/{total}.',
  'progress.readingBank': 'Se citește {bank:acc} ...',
  'progress.analysing': 'Se analizează ...',
  'progress.probeSelector': 'se încearcă selectorul {selector} ...',
  'progress.selectorsArmed': 'Gata — selectori activați: {armed}/{span}, cu date: {withData}.',
  'progress.recoveringKey': 'decriptare: se recuperează cheia pentru {address} ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} {address} (subcmd {subcmd}) nu a putut fi citit: {error}',
  'slots.read.refusedBuild':
    'se refuză citirea sloturilor de firmware: {reason}. Nu s-a trimis nimic în afară de citirea versiunii, așa că niciun slot nu a fost atins.',
  'slots.backup.notSaved':
    'copia de rezervă {file} nu a fost salvată, așa că nu s-a scris nimic. O scriere nu rulează niciodată fără să-și fi salvat mai întâi copia de rezervă; încercați din nou când aceasta poate fi salvată.',
  'slots.backup.notSavedWhy':
    'copia de rezervă {file} nu a fost salvată ({error}), așa că nu s-a scris nimic. O scriere nu rulează niciodată fără să-și fi salvat mai întâi copia de rezervă; încercați din nou când aceasta poate fi salvată.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'viteză mare (480 Mbit/s)',
  'usb.speed.full': 'viteză completă (12 Mbit/s)',
  'usb.speed.code': 'cod {code}',
} satisfies Translation<'core'>;
