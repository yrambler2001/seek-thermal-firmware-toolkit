/**
 * Namespace `core`, lietuvių (lt), translated from the English source: sentences that `@seek-fw/core` makes and
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
    'kamera lieka atrakinta, kol jos maitinimas bus išjungtas ir vėl įjungtas, o kiti įrankiai iki tol gali ją nuskaityti klaidingai; prieš juos naudodami išjunkite ir vėl įjunkite kamerą',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': 'pirmiausia {first}, tada {second}, tada {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'nebuvo nuskaitytas',
  'boot.verdict.checkKeyUnnamed':
    'nepavyko patikrinti: nenurodytas raktas, kuriuo paleidyklė tikrina lizdą',
  'boot.cfg0NotRead':
    'paleidimo konfigūracijos žodis (cfg[0]) nenuskaitytas, todėl nežinoma, kurį lizdą paleis kitas paleidimas',
  'boot.select.unknown':
    'paleidimo konfigūracijos žodis yra {word}, todėl paleidyklė pirmiausia bando {first:acc}, bet {bank} {verdict}, todėl nežinoma, kuris lizdas veikia',
  'boot.select.first':
    'paleidimo konfigūracijos žodis yra {word}, todėl paleidyklė pirmiausia bando {first:acc}, ir jame yra paleidyklės priimamas atvaizdas',
  'boot.select.second':
    'paleidimo konfigūracijos žodis yra {word}, todėl paleidyklė pirmiausia bando {first:acc}; {first:loc} nėra paleidyklės priimamo atvaizdo, todėl ji ima {second:acc}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'paleidimo konfigūracijos žodis yra {word}, todėl paleidyklė pirmiausia bando {first:acc}; nei {first:loc}, nei {second:loc} nėra paleidyklės priimamo atvaizdo, todėl ji paleidžia {last:acc}, kurio netikrina',
  'boot.select.lastTakes':
    'paleidimo konfigūracijos žodis yra {word}, todėl paleidyklė pirmiausia bando {first:acc}; nei {first:loc}, nei {second:loc} nėra paleidyklės priimamo atvaizdo, todėl ji ima {last:acc}, kurio netikrina',
  'boot.bootsNow': 'Kamera dabar pasileidžia iš {bank:gen}',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'paleistas dabar',
  'boot.notBooted': 'nepaleistas',
  'boot.unknownWhy.checkKeyUnnamed':
    'šiame nuskaityme nenurodytas raktas, kuriuo paleidyklė tikrina lizdą',
  'boot.unknownWhy.noKeyTable':
    'paleidyklės raktų lentelė nenuskaityta, todėl jos bandomų raktų įvardyti negalima',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'Kamera pasileidžia iš {bank:gen}. {why}.',
  'fpsBoot.holdsOne':
    '{bank}: jame yra kadrų dažnio pataisa, bet jis neveikia, todėl pataisa neįsigalioja.',
  'fpsBoot.holdsTwo':
    '{banks}: juose yra kadrų dažnio pataisos, bet nė vienas jų neveikia, todėl pataisos neįsigalioja.',
  'fpsBoot.wouldNotRun':
    'Pataisius {target:acc}, jis neimtų veikti, nes kamera vietoj jo pasileidžia iš {bank:gen}.',
  'fpsBoot.patchRunning':
    'Pataisykite ir {bank:acc} (veikiantį lizdą): tik taip kadrų dažnio pataisa įsigalios.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank}: čia jo pataisyti negalima ({reason}), todėl kadrų dažnio pataisa kitame lizde šioje kameroje neįsigalioja.',

  /* ---- backup: the zip saved before a bank write (slots/backup); `{name}` is the bank inside a sentence ("slot B"): each is an item of backup.plan.* ---- */
  'backup.bank.notInPlan': '{name} (nėra šio leidimo plane: tai nurodyta ZIP faile)',
  'backup.bank.unsupported':
    '{name} (šis leidimas negali jo nuskaityti, {reason}: tai nurodyta ZIP faile)',
  'backup.bank.empty':
    '{name} (tuščias, visi baitai 0xFF: tai nurodyta ZIP faile, o įrašymas neperrašo jokios mikroprogramos)',
  'backup.bank.unread':
    '{name} (lizdų nuskaitymas jo nepasiekė: ZIP faile nurodyta, ar jį pasiekia nuskaitymas prieš įrašymą)',
  'backup.bank.noKey':
    '{name} (toks, koks saugomas; jo neatidaro nė vienas šio nuskaitymo atkurtas raktas, todėl iššifruoto failo nėra)',
  'backup.bank.decrypted': '{name} (toks, koks saugomas, ir iššifruotas)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Prieš ką nors įrašant, {banks} dar kartą nuskaitomas ir išsaugomas viename ZIP faile su pastaba, kas yra kiekvienas failas: {file}.',
  'backup.plan.many':
    'Prieš ką nors įrašant, {banks} dar kartą nuskaitomi ir išsaugomi viename ZIP faile su pastaba, kas yra kiekvienas failas: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext': 'užšifruota taip, kad įrenginys saugotų su paleisto lizdo raktu',
  'staging.detail.slotKeystreamCiphertext':
    'užšifruota paties atvaizdo paruošimo raktu (rakto blokas 0); kamera saugo atvaizdą su paties lizdo raktu',
  'staging.detail.plain': 'atviras tekstas, be šifro',
  'staging.detail.keyAKeystream':
    '1.3.0.8 FF atvaizdas, paruoštas taip, kaip jį paruošia gamintojo programa (XOR raktas A) — 16 Hz leidimas jį saugo su raktu B, o ne šiais baitais',
  'staging.detail.verbatim': 'nepakeista — baitai lygiai tokie, kokie pateikti',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'nenuskaityta',
  'copy.source.notInPlan': '{name} nėra šio leidimo plane',
  'copy.source.notRead':
    '{name} nenuskaitytas ({reason}), todėl nėra atvaizdo, kurį būtų galima kopijuoti',
  'copy.source.empty': '{name} tuščias: nėra atvaizdo, kurį būtų galima kopijuoti',
  'copy.source.foreign':
    '{name:loc} nėra šio nuskaitymo atpažįstamo mikroprogramos atvaizdo, todėl nėra ką kopijuoti',
  'copy.source.noKey':
    'nė vienas šio nuskaitymo atkurtas raktas neatidaro {name:gen}, todėl nėra iššifruoto atvaizdo, kurį būtų galima kopijuoti',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} adresu {address}, toks, kokį iššifravo lizdų nuskaitymas',
  'copy.fromVersion':
    '{name} adresu {address}, mikroprograma {version}, toks, kokį iššifravo lizdų nuskaitymas',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'Atvaizdas paimtas iš {name:gen}, toks, kokį iššifravo lizdų nuskaitymas: {size} B, sha256 {sha256}.',
  'copy.noteVersion':
    'Atvaizdas paimtas iš {name:gen}, toks, kokį iššifravo lizdų nuskaitymas: mikroprograma {version}, {size} B, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': 'atsarginės kopijos {name} (adresu {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where}, iš visos flash atminties atsarginės kopijos {file}',
  'restore.fromVersion':
    '{where}, iš visos flash atminties atsarginės kopijos {file}, mikroprograma {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': '4 MB flash atminties atvaizdas',
  'restore.kind.preserve-run': '0.x/1.x skirtuko seanso failas',
  'restore.kind.dump': '„Nuskaityti ir iššifruoti 4.x/Nano“ ZIP failas',
  'restore.kind.all-selectors': '„Nuskaityti visus selektorius“ ZIP failas',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'atvaizdą',
  'restore.decryptedTo.firmware': 'mikroprogramą {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'Atvaizdas: {where} faile {file}, {kind}: saugomo sha256 {stored}, iššifruota į {decrypted}, {size} B (sha256 {sha256}).',
  'restore.note.imageEntry':
    'Atvaizdas: {where} faile {file}, {kind} (jo {entry}): saugomo sha256 {stored}, iššifruota į {decrypted}, {size} B (sha256 {sha256}).',
  'restore.note.readBack':
    'Po įrašymo kontroliniu nuskaitymu gautas lizdas palyginamas su atsarginėje kopijoje saugomais lizdo baitais.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'Atsarginės kopijos tapatybės bloke nurodyta ši kamera (serijos numeris {serial}).',
  'restore.note.sameBytes':
    'Atsarginėje kopijoje saugomi baitai jau yra {name:loc}: įrašymas grąžina tą patį atvaizdą.',
  'restore.warn.otherCamera':
    'Ši atsarginė kopija atrodo kaip kitos kameros: jos tapatybės bloke nurodytas serijos numeris {theirs}, o šios kameros — {camera}. Įrašomas tik {name:gen} atvaizdas; nieko iš tos kameros tapatybės ar kalibravimo neįrašoma.',
  'restore.warn.noIdentity':
    'Šioje atsarginėje kopijoje adresu {address} nėra tapatybės bloko, todėl negalima nustatyti, iš kurios kameros ji nuskaityta.',
  'restore.warn.serialNotRead':
    'Kameros serijos numeris nenuskaitytas, todėl atsarginės kopijos (serijos numeris {serial}) negalima su ja susieti.',
  'restore.warn.otherFirmware':
    'Šaltinyje ({where}) yra mikroprograma {version}, o kamera vykdo {camera}: atkūrimas įrašo į lizdą kitą mikroprogramą.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank} nebuvo nuskaitytas kontroliniu nuskaitymu, todėl nepalygintas su atsargine kopija.',
  'restore.readBack.equal': '{bank} nuskaitomas baitas į baitą toks, kokį saugo atsarginė kopija.',
  'restore.readBack.differs':
    '{bank}: kontrolinis nuskaitymas nuo atsarginėje kopijoje saugomų baitų skiriasi {count} B (pirmas skirtumas ties {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, gautas iš paleisto {bank:gen}',
  'keys.derived.holds':
    '{key} (saugojimo raktas), gautas iš paleisto {bank:gen}, kuriame yra {holds}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, gautas iš paleisto lizdo',
  'keys.derived.holdsUnnamed':
    '{key} (saugojimo raktas), gautas iš paleisto lizdo, kuriame yra {holds}',
  'keys.ffVendor.staged':
    '1.3.0.8 FF (16 Hz) atvaizdas, paruoštas taip, kaip jį paruošia gamintojo programa: atvaizdas XOR jo paties rakto blokas 0 (raktas A), antraštės langas nepakeistas, į bet kurį lizdą; šios kameros raktai nenaudojami',
  'keys.ffVendor.stored':
    'Raktas B: kamera perkoduoja įkeltus duomenis rakto bloku 1 ir saugo atvaizdą su juo',
  'keys.imageBlock0.staged':
    'atvaizdas su paties rakto bloku 0 (rastu atvaizde pagal reikšmę), į bet kurį lizdą; šios kameros raktai nenaudojami',
  'keys.imageBlock0.storedUnnamed':
    'raktas, kuriuo paleidyklė tikrina lizdą (šiame nuskaityme neįvardytas); kamera įkeltus duomenis iš naujo užšifruoja juo',
  'keys.imageBlock0.stored':
    '{key} — raktas, kuriuo paleidyklė tikrina lizdą; kamera įkeltus duomenis iš naujo užšifruoja juo',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED: iš kameros dar nenuskaityta nė viena 16 Hz FF leidimo paleidyklė, todėl nežinoma, ar įrašytas lizdas pasileidžia. Su 0.9.0.0 paleidykle ankstesnė šio atvaizdo forma pasileido iš atkūrimo lizdo R; ši forma nepasileis, nes ta paleidyklė atkūrimo lizdą R paleidžia tokį, koks jis saugomas, jo neiškoduodama.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    '16 Hz FF atvaizdas siunčiamas tokia forma, kurią skaito tik 16 Hz {version} leidimas. Ši kamera įrašo lizdą netikrindama atvaizdo (taip rodo jos mikroprogramos šaltinis, ir taip pasielgė bandytas 1.3.0.0 Compact), todėl tikimasi, kad ji įrašys baitus tokius, kokie išsiųsti: tada lizde bus atvaizdas tokia forma, kurios ši kamera negali paleisti.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Niekas čia neteigia, kad kamera jį paleidžia.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast': 'Pačios kameros atsakymai rodo, kad ji vykdo 16 Hz FF leidimą: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'tikrina duomenis prieš ištrindamas lizdą, ir šie duomenys tą patikrą praeina, todėl jis gali įrašyti šiuos baitus tokius, kokie yra, tokia forma, kurios jo paleidyklė negali paleisti: lizdas gali nepasileisti (neišbandyta; prieš įrašymą išsaugota atsarginė kopija jį grąžina)',
  'write.ff.outcome.refuses':
    'tikrina duomenis prieš ištrindamas lizdą, o šie duomenys tos patikros nepraeina, todėl tikimasi, kad jis atmes šį įrašymą dar prieš ką nors įrašydamas (kamera su tuo leidimu taip pat atmetė ankstesnę šio atvaizdo formą)',
  'write.ff.runsSlow': 'Kamera vykdo 8 Hz {version} leidimą: {why}. Tas leidimas {outcome}.',
  'write.ff.buildUnknown':
    'Pačios kameros atsakymai nerodo, kurį {version} leidimą ji vykdo: {why}. Jei ji vykdo 16 Hz FF leidimą, šiuos duomenis ji priima. Jei ji vykdo 8 Hz leidimą, tas leidimas {outcome}.',
  'write.raw.asGiven':
    'Neapdoroti duomenys: siunčiami lygiai tokie, kokie pateikti. Niekas čia netikrina, ar jie paleidžiami.',
  'write.raw.ffStagedForm':
    'Šie duomenys yra 1.3.0.8 FF paruošta forma (atvaizdas XOR rakto blokas 0, žodžių suma 0xFFFF). Kamera atvaizdą saugo su raktu B, todėl kontrolinis nuskaitymas tikrinamas pagal tuos baitus.',
  'write.raw.noStaging':
    'Šis leidimas nenurodo lizdo paruošimo formos, todėl paleidyklės patikrų nurodyti negalima.',
  'write.raw.reencrypts':
    'Įrenginys iškoduoja šiuos duomenis ir iš naujo užšifruoja tai, ką išsaugo, todėl saugomi baitai nenuspėjami. Kontrolinis nuskaitymas tikrinamas kaip atvaizdas, į kurį jis iššifruojamas, jei tai įmanoma nustatyti.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'Paleidyklė šiuos duomenis atmestų: {failure}.',
  'write.raw.stageKeyUnchecked':
    '2016 m. paruošimo rakto (rakto blokas 0) neapdorotuose baituose nėra, todėl šių duomenų iššifruota žodžių suma čia netikrinama.',
  'write.image.rekeyRisk':
    '{name} jau turi atvaizdą, kurio paleidyklė negali priimti. Po šio įrašymo būsena bus tokia pati.',
  'write.ack.recovery':
    'Atkūrimo lizdas R: jį įrašant prašoma patvirtinti riziką. Niekas čia netikrina, ar kamera po to pasileis.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: jį įrašant prašoma patvirtinti riziką, o po kito maitinimo išjungimo ir įjungimo kamera paleis tai, kas jame bus.',
  'write.ack.bootUnnamed': 'Paleisto lizdo įvardyti nepavyko, todėl šis laikomas paleistu',
  'write.ack.recoveryFallback':
    'Atkūrimo lizdas R yra paskutinė rezervinė kopija, į kurią grįžta paleidyklė',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'tuščias/0: pirmiausia lizdas A, tada B, tada atkūrimo',
  'boot.cfg0.modernB': 'pirmiausia lizdas B, tada A, tada atkūrimo',
  'boot.cfg0.modernRecovery': 'pirmiausia atkūrimo, tada A, tada B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'nežinoma — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  /** `{verdict}` is one of upgrade.verdict.*. `{name}` here is the bank inside a sentence ("slot B"); in upgrade.verdict.* it starts a sentence ("Slot B"). */
  'upgrade.whileRecovery':
    'Kamera vykdo savo atkūrimo lizdą, o jos pačios atnaujinimas rašo į {name:acc}, kurio ji nevykdo. {verdict} Tai tik įspėjimas: niekas čia atnaujinimo nesustabdo.',
  'upgrade.verdict.notRead':
    '{name}: šios patikros metu jo nepavyko nuskaityti, todėl nežinoma, kas jame yra.',
  'upgrade.verdict.blank': '{name} tuščias, todėl atnaujinimas rašo į tuščią lizdą.',
  'upgrade.verdict.bootableSame':
    '{name} turi tą patį paleidžiamą atvaizdą kaip ir veikiantis lizdas, o atnaujinimas jį pakeičia. Jei atnaujinimas sustos pusiaukelėje, {name:nom} liks nepaleidžiamas.',
  'upgrade.verdict.bootable':
    '{name} turi paleidžiamą atvaizdą, kurį atnaujinimas pakeičia. Jei atnaujinimas sustos pusiaukelėje, jis liks nepaleidžiamas.',
  'upgrade.verdict.unknown':
    '{name}: šiame nuskaityme nežinoma, ar jis paleidžiamas, todėl atnaujinimas gali pakeisti atvaizdą, kurį kamera paleistų.',
  'upgrade.verdict.notBootable':
    '{name} šiame nuskaityme nerodomas kaip paleidžiamas, todėl atnaujinimas nepakeičia jokio atvaizdo, kurį kamera paleistų.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — lizdas, kurį paleidyklė paleido šį kartą, pagal jos pačios įrašą',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'nenuskaityta',
  'report.lastStart.noBank': 'kamera nurodo {word}, o tai neatitinka jokio lizdo',
  'report.lastStart.entered': 'kamera nurodo, kad paleido {bank:acc} (aktyvaus lizdo žodis {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'versijos nėra',
  'running.why.otherVersion': 'kamera nurodo {version}, o du leidimus turi tik {only}',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'kamera neatsakė į lizdų verdiktų užklausas (GetFirmwareInfo selektoriai 6, 7, 8)',
  'running.why.notRead':
    'lizdas, nuo kurio priklauso verdiktai, nenuskaitytas, todėl atsakymų nuspėti negalima',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'kamera atsako {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers}, ir būtent taip šiems lizdams atsako 8 Hz 1.3.0.8 leidimas ({predicted})',
  'running.why.ff':
    '{answers}, ir būtent taip šiems lizdams atsako 16 Hz FF 1.3.0.8 leidimas ({predicted})',
  'running.why.both':
    '{answers}, ir abu leidimai šiems lizdams atsako lygiai taip pat, todėl pagal lizdus jų atskirti negalima',
  'running.why.neither':
    '{answers}, ir tai neatitinka nė vieno leidimo (8 Hz: {plain}; 16 Hz FF: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'Šio atvaizdo antraštėje nenurodyta mikroprogramos versija, todėl negalima nustatyti, ar tai kameros vykdomas leidimas ({camera}). Patikrinkite, ar tai tas atvaizdas, kurį norite įrašyti.',
  'imageBuild.otherVersion': 'Šis atvaizdas yra mikroprograma {image}; kamera vykdo {camera}.',
  'imageBuild.otherVersionTaken':
    'Šis atvaizdas yra mikroprograma {image}; kamera vykdo {camera}. Šioje linijoje kamera tikrina tik, ar atvaizdas tinkamos struktūros (jo antraštę ir žodžių sumą), o ne jo versiją, todėl ji šį atvaizdą priima ir, pasileidusi iš šio lizdo, vykdo {image}.',
  'imageBuild.otherVersionUnchecked':
    'Šis atvaizdas yra mikroprograma {image}; kamera vykdo {camera}. Ar ši kamera priima kitą leidimą ir jį vykdo, nepatikrinta.',
  'imageBuild.otherBuild':
    'Šis atvaizdas yra 8 Hz {version} leidimas; kamera vykdo 16 Hz {version} FF leidimą. 16 Hz leidimas patvirtinimo metu tikrina duomenis pagal savo FF formą ir netinkančius atmeta dar prieš ištrindamas lizdą (pagal jo šaltinį). 8 Hz leidimo įrašymas į ją kameroje neišbandytas.',
  'imageBuild.runningUnknown':
    'Šis atvaizdas yra 8 Hz {version} leidimas. Kamera vykdo {version}, kuris būna 8 Hz ir 16 Hz FF leidimo, o jos pačios atsakymai nenurodė, kurį ji vykdo, todėl negalima nustatyti, ar tai jos leidimas.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': 'duomenys yra {size} B — per trumpi, kad tilptų antraštė adresu 0x200',
  'bootFail.noMagic':
    'adresu 0x200 nėra atvaizdo žymės (rasta {found}, paleidyklei reikia {needs})',
  'bootFail.lengthOutside': 'header.length {length} išeina už {size} B duomenų ribų',
  'bootFail.lengthNotPayload': 'header.length {length} nelygus duomenų ilgiui {size}',
  'bootFail.overStage': '{size} B viršija {max} B paruošimo sritį',
  'bootFail.plainSum': 'saugoma žodžių suma {sum}, 2014 m. paleidyklei reikia 0',
  'bootFail.noFooter': 'adresu {offset} nėra poraštės: duomenys baigiasi ties {end}',
  'bootFail.footerNotCode':
    'poraštė adresu {offset} nėra „CODE“ — paleidyklė ima savo segmentuotą įkėlėją',
  'bootFail.footerLength': 'poraštės ilgis nelygus header.length {length}',
  'bootFail.keyASum':
    'iššifravus šios kameros raktu A, žodžių suma yra {sum}, paleidyklei reikia {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'patvirtintas priėmimo suma',
  'keyConfidence.structural': 'patvirtintas tik pagal vektorių lentelę',
  'keyConfidence.unverified': 'nepatvirtintas',
  /** `{sum}` is hex. */
  'keyCheck.family': 'raktas patvirtintas priėmimo suma {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'raktas {phrase}; priėmimo suma {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'paruošta su pačios kameros raktais',
  'staging.phrase.slotKeystreamCiphertext': 'paruošta su paties atvaizdo raktu',
  'staging.phrase.plain': 'paruošta neužšifruota',
  'staging.phrase.keyAKeystream':
    'paruošta taip, kaip FF atvaizdą paruošia gamintojo programa (XOR raktas A)',
  'staging.phrase.verbatim': 'išsiųsta tokia, kokia pateikta',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank, inside the sentence ("slot A"); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    'patvirtinta {size} B į {name:acc} adresu {address}, {staged}; patvirtinimo būsena {status}',
  'written.noReadWindow':
    'šis leidimas nenurodo lizdo skaitymo lango, todėl kontrolinis nuskaitymas neatliktas',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'kontrolinis nuskaitymas nepavyko: {error}',
  'written.readBack': 'kontroliniu nuskaitymu gauta {size} B, SHA-256 {sha256}',
  'written.verifyOff': 'patikra išjungta: lizdas nebuvo nuskaitytas kontroliniu nuskaitymu',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'baitais, kuriuos pagal planą turėjo turėti lizdas (atvaizdas taip, kaip jį saugo 16 Hz leidimas, o ne išsiųsti baitai)',
  'readBack.reference.asSent':
    'baitais, kuriuos pagal planą turėjo turėti lizdas (baitai tokie, kokie išsiųsti)',
  'readBack.sizeDiffers':
    'kontrolinis nuskaitymas yra {size} B, planas numatė {predictedSize} B: lizdas NESUTAMPA su {reference}',
  'readBack.matchesFolded':
    'lizde yra atvaizdas taip, kaip jį saugo 16 Hz leidimas (ne išsiųsti baitai), o likusi lizdo dalis ištrinta',
  'readBack.matches':
    'lizdas sutampa su baitais, kuriuos numatė planas (2014 m. neužšifruota grandinė užprogramuoja lygiai tai, kas jai išsiųsta)',
  'readBack.differs': 'lizdas NESUTAMPA su {reference} (pirmas skirtumas ties {offset})',
  'readBack.noHeader':
    'kontroliniame nuskaityme adresu {offset} nėra atvaizdo antraštės (žymė {magic}), todėl lizdas NEIŠŠIFRUOJAMAS į laukiamą atvaizdą',
  'readBack.lengthDiffers':
    'kontrolinio nuskaitymo antraštėje nurodyta {length} B, plano atvaizdas yra {imageLength} B: lizdas NEIŠŠIFRUOJAMAS į laukiamą atvaizdą',
  'readBack.tooShort':
    'kontrolinis nuskaitymas yra {size} B — per trumpas {length} B atvaizdui: lizdas NEIŠŠIFRUOJAMAS į laukiamą atvaizdą',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'iš kontrolinio nuskaitymo atkurtu rakto srautu ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': 'lizdas iššifruojamas į laukiamą atvaizdą ({length} B) {recovered}',
  'readBack.decryptDiffers':
    'lizdas NEIŠŠIFRUOJAMAS į laukiamą atvaizdą: pirmas skirtumas ties atvaizdo poslinkiu {offset}, iššifruojant {recovered}',
  'readBack.rawNotCompared':
    'neapdoroti baitai: kontrolinis nuskaitymas pateiktas, bet nepalygintas (šios formos baitai neiššifruojami į nuspėjamą atvirą atvaizdą, o įrenginys tai, ką išsaugo, iš naujo užšifruoja)',
  'readBack.notCompared':
    'palyginti nebuvo įmanoma: planas nenumato nei saugomų baitų, nei atviro atvaizdo',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'raktas A',
  'keyName.keyA:gen': 'rakto A',
  'keyName.keyA:dat': 'raktui A',
  'keyName.keyA:acc': 'raktą A',
  'keyName.keyA:ins': 'raktu A',
  'keyName.keyA:loc': 'rakte A',
  'keyName.keyB': 'raktas B',
  'keyName.keyB:gen': 'rakto B',
  'keyName.keyB:dat': 'raktui B',
  'keyName.keyB:acc': 'raktą B',
  'keyName.keyB:ins': 'raktu B',
  'keyName.keyB:loc': 'rakte B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'įrenginio raktas',
  'keyName.perDevice:gen': 'įrenginio rakto',
  'keyName.perDevice:dat': 'įrenginio raktui',
  'keyName.perDevice:acc': 'įrenginio raktą',
  'keyName.perDevice:ins': 'įrenginio raktu',
  'keyName.perDevice:loc': 'įrenginio rakte',
  'keyName.thePerDevice': 'įrenginio raktas',
  'keyName.thePerDevice:gen': 'įrenginio rakto',
  'keyName.thePerDevice:dat': 'įrenginio raktui',
  'keyName.thePerDevice:acc': 'įrenginio raktą',
  'keyName.thePerDevice:ins': 'įrenginio raktu',
  'keyName.thePerDevice:loc': 'įrenginio rakte',
  'keyName.applicationKeyA': 'programos raktas A',
  'keyName.applicationKeyA:gen': 'programos rakto A',
  'keyName.applicationKeyA:dat': 'programos raktui A',
  'keyName.applicationKeyA:acc': 'programos raktą A',
  'keyName.applicationKeyA:ins': 'programos raktu A',
  'keyName.applicationKeyA:loc': 'programos rakte A',
  'keyName.applicationKeyB': 'programos raktas B',
  'keyName.applicationKeyB:gen': 'programos rakto B',
  'keyName.applicationKeyB:dat': 'programos raktui B',
  'keyName.applicationKeyB:acc': 'programos raktą B',
  'keyName.applicationKeyB:ins': 'programos raktu B',
  'keyName.applicationKeyB:loc': 'programos rakte B',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'rakto blokas 1',
  'keyName.block1:gen': 'rakto bloko 1',
  'keyName.block1:dat': 'rakto blokui 1',
  'keyName.block1:acc': 'rakto bloką 1',
  'keyName.block1:ins': 'rakto bloku 1',
  'keyName.block1:loc': 'rakto bloke 1',
  'keyName.theDeviceKey': 'įrenginio raktas',
  'keyName.theDeviceKey:gen': 'įrenginio rakto',
  'keyName.theDeviceKey:dat': 'įrenginio raktui',
  'keyName.theDeviceKey:acc': 'įrenginio raktą',
  'keyName.theDeviceKey:ins': 'įrenginio raktu',
  'keyName.theDeviceKey:loc': 'įrenginio rakte',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'nežinomas raktas',
  'keyName.unknown:gen': 'nežinomo rakto',
  'keyName.unknown:dat': 'nežinomam raktui',
  'keyName.unknown:acc': 'nežinomą raktą',
  'keyName.unknown:ins': 'nežinomu raktu',
  'keyName.unknown:loc': 'nežinomame rakte',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    '2014 m. neužšifruota grandinė: kiekvienas lizdas saugomas neužšifruotas, todėl įkėlimo raktas negaunamas; įkeliamas atvaizdas toks, koks yra',
  'keys.evidence.ffVendor':
    '1.3.0.8 FF (16 Hz) leidimas: nė vienas šio nuskaitymo atidarytas lizdas nesaugomas neužšifruotas, todėl neparodyta, kad kamera naudoja 2014 m. neužšifruotą grandinę; FF atvaizdas įrašomas gamintojo forma, neapdoroti baitai siunčiami tokie, kokie pateikti, o neužšifruotas 8 Hz atvaizdas neįrašomas',
  'keys.evidence.ffUntested':
    'FF atvaizdo įrašymas siūlomas su įspėjimu UNTESTED: rinkinyje nėra tikros šio leidimo paleidyklės, todėl neišmatuota, ar įrašytas lizdas pasileidžia',
  'keys.evidence.line2016':
    '2016 m. Compact PRO linija: įkeliamas atvaizdas, sujungtas XOR su jo paties rakto bloko 0 srautu (rastu atvaizde pagal reikšmę), todėl jo nesukuria nė vienas šios kameros raktas',
  'keys.evidence.checkKeyUnnamed':
    'kamera įkeltus duomenis iššifruoja tuo raktu ir iš naujo užšifruoja raktu, kuriuo paleidyklė tikrina lizdą; tas raktas šiame nuskaityme neįvardytas, o įrašymui jo nereikia: lizdas tikrinamas kontroliniu nuskaitymu kaip atvaizdas, į kurį jis iššifruojamas',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'kamera įkeltus duomenis iššifruoja tuo raktu ir iš naujo užšifruoja raktu, kuriuo paleidyklė tikrina lizdą; tas raktas šiame nuskaityme neįvardytas ({why}), o įrašymui jo nereikia: lizdas tikrinamas kontroliniu nuskaitymu kaip atvaizdas, į kurį jis iššifruojamas',
  'keys.evidence.checkKeyNamed':
    'kamera įkeltus duomenis iššifruoja tuo raktu ir iš naujo užšifruoja {key:ins} {hex} — raktu, kuriuo paleidyklė tikrina lizdą, todėl kiekvienas jos įrašomas lizdas saugomas taip, kaip jį priima paleidyklė',
  'keys.evidence.checkKeyInferred':
    'kamera įkeltus duomenis iššifruoja tuo raktu ir iš naujo užšifruoja {key:ins} {hex} — raktu, kuriuo paleidyklė tikrina lizdą (nustatyta pagal {bank:acc} — lizdą, kurį, kameros teigimu, ji paleido ir kurį paleidyklė paleido be patikros), todėl kiekvienas jos įrašomas lizdas saugomas taip, kaip jį priima paleidyklė',
  'keys.evidence.checkKeyNamedFrom':
    'kamera įkeltus duomenis iššifruoja tuo raktu ir iš naujo užšifruoja {key:ins} {hex} — raktu, kuriuo paleidyklė tikrina lizdą (įvardyta pagal {bank:acc} — lizdą, kurį, kameros teigimu, ji paleido), todėl kiekvienas jos įrašomas lizdas saugomas taip, kaip jį priima paleidyklė',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'paleisto lizdo įvardyti nepavyko, todėl iš jo negalima nuskaityti rakto, su kuriuo saugomas lizdas',
  'keys.refused.notDerived': 'raktų gauti nepavyko',
  'keys.refused.notDecrypted':
    'paleistas {bank:nom} neiššifruojamas į atvaizdą, todėl rakto, su kuriuo jis saugomas, nuskaityti negalima',
  'keys.refused.noBootKey':
    'paleistas {bank:nom} neiššifruojamas nė vienu raktu, kurį bando paleidyklė (jos raktu A ar saugojimo raktu), todėl rakto, su kuriuo saugomas lizdas, iš jo nuskaityti negalima',
  'keys.refused.keyNotInTable':
    'paleistas {bank:nom} iššifruojamas {key:ins}, bet šios kameros raktų lentelėje to rakto nėra, todėl juo įrašyti negalima',
  'keys.refused.noApplicationPair':
    'veikiančioje programoje ({bank}, mikroprograma {firmware}) nėra nė vienos žinomos raktų poros (paleidyklės ir iškoduotų programos porų), kurios kiekviena pusė būtų lygiai vieną kartą, todėl jos rakto A atvaizde rasti negalima',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'veikiančioje programoje ({bank}, mikroprograma {firmware}) nėra nė vienos žinomos raktų poros (paleidyklės ir iškoduotų programos porų), kurios kiekviena pusė būtų lygiai vieną kartą, todėl jos rakto A atvaizde rasti negalima (paleidyklės raktas A pasitaiko {count} kartą, jos raktas B — {keyB})',
    few: 'veikiančioje programoje ({bank}, mikroprograma {firmware}) nėra nė vienos žinomos raktų poros (paleidyklės ir iškoduotų programos porų), kurios kiekviena pusė būtų lygiai vieną kartą, todėl jos rakto A atvaizde rasti negalima (paleidyklės raktas A pasitaiko {count} kartus, jos raktas B — {keyB})',
    many: 'veikiančioje programoje ({bank}, mikroprograma {firmware}) nėra nė vienos žinomos raktų poros (paleidyklės ir iškoduotų programos porų), kurios kiekviena pusė būtų lygiai vieną kartą, todėl jos rakto A atvaizde rasti negalima (paleidyklės raktas A pasitaiko {count} karto, jos raktas B — {keyB})',
    other:
      'veikiančioje programoje ({bank}, mikroprograma {firmware}) nėra nė vienos žinomos raktų poros (paleidyklės ir iškoduotų programos porų), kurios kiekviena pusė būtų lygiai vieną kartą, todėl jos rakto A atvaizde rasti negalima (paleidyklės raktas A pasitaiko {count} kartų, jos raktas B — {keyB})',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'veikianti programa ({bank}, mikroprograma {firmware}) tikrina įkeliamus duomenis savo raktais prieš juos užprogramuodama (iškoduotas šio leidimo šaltinis bando įkeliamus duomenis jos raktu A ir saugojimo raktu, kaip paleidyklė bando lizdą), o raktas, su kuriuo saugo įrašymai, {key} ({hex}), nėra nei jos raktas A, nei saugojimo raktas, todėl kamera atmestų įkeliamus duomenis su 0x50000 dar prieš ką nors ištrindama',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'nė vienas lizdas neiššifruojamas į šeimos {family} priėmimo sumą {sum}',
  'writeRefusal.keyTable': 'šios kameros raktų lentelės patvirtinti nepavyko',
  'writeRefusal.whitening':
    'šios kameros raktų lentelė išsprendžiama su K={k}, bet {family} šifruoja su K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily':
    'įrodymai rodo, kad ši kamera yra {detected}, o ne {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'šios kameros iš čia įrašyti negalima: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Seek 2018 m. ir vėlesni leidimai (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 ir Nano 300. Nuskaitymas perskaito 63 iš 64 flash atminties blokų nieko neatrakindamas; šiuose leidimuose joks skaitymas nepasiekia bloko adresu {block}. Mikroprograma saugoma užšifruota. Lizdai įrašomi po vieną skirtuke „Darbas su mikroprogramos lizdais“.',
  'family.summary.early':
    '2014 m. Compact kameros, senesnės nei 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 ir 0.7.0.8. Jų mikroprograma negali atsakyti į nuskaitymo siunčiamą skaitymo užklausą, todėl „Pradėti nuskaitymą“, „Nuskaityti visus selektorius“, skirtuko „Informacija“ pilnas nuskaitymas ir skirtukas „Darbas su mikroprogramos lizdais“ jas atmeta, perskaitę versiją; 0.3.0.1 leidime komanda, kuria pradedamas nuskaitymas, vietoj to parengtų mikroprogramos atnaujinimą. Išsaugojimo seansas 0.7.0.7 ir 0.7.0.8 perskaito per kitą komandą, į kurią šie du leidimai atsako. Kitu būdu padaryta išklotinė iššifruojama įprastai.',
  'family.summary.compact2016':
    'Compact PRO 1.0.3.x leidimai (1.0.3.0 ir 1.0.3.2). Į skaitymo užklausas jie atsako lygiai taip pat kaip 2014 m. Compact, įskaitant atrakinimo žetoną, todėl atskiriami pagal versiją ir pagal tai, kaip saugomi jų lizdai: užšifruoti, o 2014 m. lizdai — neužšifruoti. 1.0.3.x kamera nuo pat pradžių skaitoma kaip šios šeimos. Išsaugojimo seansas perskaito visą flash atmintį, o lizdai įrašomi po vieną skirtuke „Darbas su mikroprogramos lizdais“.',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    '2014 m. Compact kameros nuo 0.8.0.0 iki 1.3.0.8, tarp jų ir 16 Hz 1.3.0.8 FF leidimas. Gamyklinė kamera atiduoda mažiau nei pusę savo flash atminties, dalį jos — tik gavusi įrankių rinkinio siunčiamą atrakinimo žetoną; išsaugojimo seansas likusią dalį perskaito per laikiną pataisą. Lizdai saugomi neužšifruoti, išskyrus FF leidimą. Compact PRO 1.0.3.x kamera skaitoma kaip compact-2016 ir čia pereina tik tada, kai lizdas saugomas neužšifruotas arba iššifruojamas į {sum}, kaip FF leidimo lizdai. Lizdai įrašomi skirtuke „Darbas su mikroprogramos lizdais“ tuose leidimuose, kuriuose išmatuotas išsaugojimo seansas; bet kuris kitas 0.x ar 1.x leidimas tik skaitomas.',
  'family.summary.generic':
    'Kamera, kurios neatitinka jokia kita šeima. `seek-fw dump` ją nuskaito pagal 4.x blokų sąrašą (skirtukas 4.x/Nano ją atmeta), o iššifravimas raktą išsprendžia iš paties atvaizdo, todėl nei vienas, nei kitas nuo spėjimo nepriklauso. Joks lizdas neįrašomas: skirtukas „Darbas su mikroprogramos lizdais“ ją atmeta, kol kamera nebus atpažinta.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'atvaizdo antraštėje nurodyta',
  'detect.source.camera': 'kameros nurodyta',
  'detect.plainArmedNotInForce':
    'paprastas 2 baitų BeginFirmwareUpgrade aktyvavo apsaugotą lizdą, todėl autentifikuoto skaitymo kanalas negalioja',
  'detect.modern.plainRefused':
    'paprastas 2 baitų apsaugoto lizdo BeginFirmwareUpgrade buvo ATMESTAS, o to nedaro joks šios linijos leidimas — jo doroklė netikrina žetono ir priima paprastą kanalą kiekviename lizde',
  'detect.modern.authArmed':
    'apsaugotas lizdas aktyvuotas 18 baitų autentifikuotu selektoriumi; paprastas ten nebandytas, todėl tai nerodo, kad kamera ne šios linijos',
  'detect.modern.legacyVersion':
    '{said} mikroprograma {version}, priklausanti 0.x / 1.x senajai linijai (tai kita numeravimo linija, o ne senesnė 4.x, — ir vienas iš tų leidimų taip pat pasiekia sumą {sum})',
  'detect.modern.noSum':
    'nė vienas lizdas neiššifruojamas į priėmimo sumą {sum}, kurios reikalauja šios šeimos paleidyklė',
  'detect.modern.sum': 'lizdas iššifruojamas į priėmimo sumą {sum}',
  'detect.modern.version':
    'mikroprograma {version} priklauso po 2018 m. linijai, kurią apima šis selektorių žemėlapis (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'paprastas 2 baitų BeginFirmwareUpgrade aktyvavo apsaugotą lizdą, todėl tai nėra užrakinta senoji mikroprograma',
  'detect.modern.none': 'nėra įrodymų, kad ši kamera priklauso po 2018 m. linijai',
  'detect.early.noVersion': 'mikroprogramos versija nebuvo nurodyta ir nerasta atvaizdo antraštėje',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'mikroprograma {version} yra {first} ar naujesnė, todėl jos RPC lentelėje yra GetFeaturedFirmwareData skaitymo funkcija ir galioja įprastas skaitymo kelias',
  'detect.early.older':
    '{said} mikroprograma {version}, senesnė nei {first} — pirmasis leidimas, kurio RPC metodų lentelėje yra GetFeaturedFirmwareData skaitymo doroklė (getter)',
  'detect.early.noWindow': 'ir nepavyko perskaityti nė vieno lango, kaip ir prognozuojama',
  'detect.generic.fallback':
    'atsarginis variantas: jokia mikroprogramos šeima užtikrintai neatitiko, todėl skaitymas lieka galimas, o rašymas — ne',
  'detect.compact2016.early':
    'mikroprograma {version} senesnė nei 0.8.0.0 ir neturi GetFeaturedFirmwareData skaitymo doroklės — tai early-compact, o ne ši šeima',
  'detect.compact2016.modernSum':
    'lizdas iššifruojamas į priėmimo sumą {sum}, kuri nėra šios kartos tikslas',
  'detect.compact2016.plainArmed':
    'paprastas 2 baitų BeginFirmwareUpgrade aktyvavo apsaugotą lizdą, todėl ši kamera nepriklauso užrakintai linijai, kurią ši šeima dalijasi su legacy-auth',
  'detect.compact2016.notLine': 'mikroprograma {version} nepriklauso 0.x / 1.x linijai',
  'detect.compact2016.storedPlain':
    'lizdas saugomas neužšifruotas — rakto srauto sprendimas grąžina tapatumo būseną, todėl jo saugomi žodžiai IR YRA atvaizdas, — o tai 2014 m. neužšifruota grandinė; šios kartos lizdai yra xorshift128 su tikru raktu',
  'detect.compact2016.keyedZero':
    'lizdas, saugomas su tikru xorshift128 rakto srautu, iššifruojamas į priėmimo sumą {sum}, o tai šios kartos šifras',
  'detect.compact2016.zeroSum':
    'lizdas iššifruojamas į priėmimo sumą {sum}, kuri yra šios kartos tikslas',
  'detect.compact2016.refused':
    'ir apsaugotas lizdas atmetė paprastą 2 baitų aktyvavimą, o tai užrakinta doroklė',
  'detect.compact2016.proLine':
    '{said} mikroprograma {version}, 2016 m. Compact PRO 1.0.3.x linija',
  'detect.compact2016.compactLine':
    '{said} mikroprograma {version}, Compact leidimas, o ne Compact PRO 1.0.3.x linija',
  'detect.compact2016.lockedLine':
    '{said} mikroprograma {version}, 0.x / 1.x linijoje, kurią ši karta dalijasi su užrakinta senąja mikroprograma',
  'detect.compact2016.bootloader2016':
    'paleidyklė nurodo {version} — 2016 m. kartos paleidyklė (1.2.0.0 išmatuota su Compact PRO 1.0.3.0; 2014 m. Compact paleidyklė yra 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'paleidyklė nurodo {version} — 2014 m. kartos numeraciją, o ne šios kartos',
  'detect.compact2016.none':
    'nepastebėta, kad kuris nors lizdas su tikru raktu būtų iššifruotas į nulinę priėmimo sumą',
  'detect.legacy.proLine':
    'bet mikroprograma {version} yra 2016 m. Compact PRO 1.0.3.x linija, kurios lizdai naudoja compact-2016 šifrą: šios šeimos priėmimo patikra atmestų kiekvieną iš jų',
  'detect.legacy.early':
    'mikroprograma {version} senesnė nei 0.8.0.0: jos RPC lentelėje nėra GetFeaturedFirmwareData skaitymo doroklės (iki 0.7.0.7 jos visai nėra, o 0.7.0.7 ir 0.7.0.8 yra tik rašymo funkcija) — tai early-compact, o ne ši šeima',
  'detect.legacy.keyedZero':
    'lizdas, saugomas su tikru xorshift128 rakto srautu, iššifruojamas į {zero} — tai 2016 m. Compact PRO šifras (compact-2016). Ši linija savo lizdus saugo neužšifruotus su žodžių suma 0 (2014 m. grandinė) arba užšifruotus iki {sum} (Compact 1.3.0.8), o jos priėmimo patikra tokį lizdą atmeta',
  'detect.legacy.plainChain':
    'lizdas saugomas kaip neužšifruota mikroprograma, kurios žodžių suma lygi 0, nes taip jį paleidžia šios linijos 2014 m. paleidyklė',
  'detect.legacy.refused':
    'kamera atsisakė atidaryti užrakintą lizdą atnaujinimui, kai buvo paprašyta be atrakinimo, kaip daro tik šios kartos mikroprograma',
  'detect.legacy.unlocked':
    'ir atidarė tą patį lizdą, kai buvo paprašyta su atrakinimu, todėl šios šeimos siunčiamas atrakinimas yra tas, kurį tikrina ši kamera',
  'detect.legacy.notLine':
    '{said} mikroprograma {version}, kuri nepriklauso 0.x / 1.x senajai linijai',
  'detect.legacy.authOnly':
    'ji atidarė užrakintą lizdą atnaujinimui, kai buvo paprašyta su atrakinimu, kaip daro šios kartos mikroprograma; prašymas be atrakinimo nebandytas, todėl vien tai kartos neįrodo',
  'detect.legacy.version':
    'mikroprograma {version} priklauso 0.x / 1.x senajai linijai — tai kita numeravimo linija nei po 2018 m. programų versijos, o ne senesnė 4.x',
  'detect.legacy.none': 'niekas iš to, kas pastebėta, nerodo autentifikuoto skaitymo kanalo',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'sulaikyta po bandymo kameroje: ten pataisa nepadidino publikavimo dažnio, o po įrašymo užraktas suveikdavo kiekviename kadre',
  'fps.table.predates':
    'mikroprograma {version} senesnė nei 0.8.0.0: jos RPC lentelėje nėra GetFeaturedFirmwareData — komandos, kurią siunčia lizdo skaitymas, — skaitymo doroklės, todėl lizdų skirtukas neskaito ir nerašo jokio šio leidimo lizdo, o pataisa nesiūloma',
  'fps.table.stageTwoFf':
    'stage two: 16 Hz FF leidimas paruošiamas taip, kaip jį paruošia gamintojo programa (atvaizdas XOR raktas A, saugomas su raktu B), o ne kaip neužšifruoti baitai, todėl jo paruošimo patikra neatlikta ir pataisa kol kas nesiūloma',
  'fps.table.stageTwo':
    'stage two: šio įrašo nėra stage two rinkinyje, todėl jo paruošimo patikra neatlikta ir pataisa kol kas nesiūloma',
  'fps.table.notOffered': 'nesiūloma',
  'fps.table.notImage':
    'tai nėra mikroprogramos atvaizdas, todėl jam netaikoma jokia kadrų dažnio pataisa',
  'fps.table.otherBuild':
    'atvaizdas yra {image} leidimas, bet kamera nurodo {camera}; pataisa atmetama, o ne pritaikoma jo neatitinkančiam leidimui',
  'fps.table.otherBuildNoVersion':
    'atvaizdas yra {image} leidimas, bet kamera versijos nenurodo; pataisa atmetama, o ne pritaikoma jo neatitinkančiam leidimui',
  'fps.table.patched': 'kadrų dažnio pataisa jau pritaikyta: šis atvaizdas veikia {hz} Hz dažniu',
  'fps.table.earlierPatch':
    'šiame atvaizde yra ankstesnė {hz} Hz kadrų dažnio pataisa be USB pataisymo, o pataisa niekada netaikoma pataisytam atvaizdui: atkurkite gamyklinį atvaizdą, tada jį pataisykite',
  'fps.table.atRate': 'šis leidimas jau veikia {hz} Hz dažniu be pataisos',
  'fps.table.not4821':
    'šis atvaizdas nurodo Compact 4.8.2.1 leidimą (arba Compact XR 4.8.2.1, tą patį leidimą), bet tai nėra gamyklinis atvaizdas, kuriam parašyta kadrų dažnio pataisa (f96ac57eda75: 68 baitų komandų puslapiai, pastovus puslapis 13), todėl kadrų dažnio pataisa jam nekuriama',
  'fps.table.notInTable':
    'šio atvaizdo nėra kadrų dažnio pataisų lentelėje, todėl šiam leidimui kadrų dažnio pataisa nekuriama. Lentelėje yra Compact 0.7.0.8–1.3.0.8 (8 Hz; 0.7.0.8 atmeta lizdų kodas), 1.3.0.8 (16 Hz FF), 4.8.1.7, 4.8.1.9, 4.8.2.1 ir 4.16.1.7 FF leidimai bei Compact PRO 1.0.3.x ir 4.9.x leidimai; joks kitas leidimas įrašo neturi',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'šio leidimo plane nėra {bank:gen}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank} šiame leidime negali priimti iššifruoto atvaizdo: {reason}',
  'fps.plan.empty': '{bank:loc} nėra iššifruoto atvaizdo, kurį būtų galima pataisyti (jis tuščias)',
  'fps.plan.noImage':
    '{bank:loc} nėra iššifruoto atvaizdo, kurį būtų galima pataisyti (jis nenuskaitytas arba jo neatidaro joks raktas)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name} įrašytas, bet jo kontrolinis nuskaitymas nuo išsaugoto lizdo skiriasi ne tik taip, kaip planuota, todėl po jo einantys lizdai neįrašyti',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build (slots/capability-notes) ----
   * The page shows only this one; it leaves the others out (lib/page-hidden.ts), and the CLI prints them
   * in English. */
  'notes.unverified':
    'Tik skaitymas. Lizdų išdėstymas paimtas iš užrakintos linijos iškoduotos lentelės, bet šiam leidimui neišmatuota jokia paruošimo forma, todėl įrašymas neplanuojamas.',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'kamera nenurodė savo mikroprogramos versijos ({note}); komandos numeris ne visose Seek mikroprogramose reiškia tą patį — Compact 0.3.0.1 leidime wire id 0x52, kuriuo aktyvuojamas skaitymo langas, yra EnterBootloaderMode, — todėl, kol versija nežinoma, siunčiamos tik GetErrorCode, GetOperationMode ir GetFirmwareInfo — skaitymo užklausos, į kurias kiekvienas leidimas atsako vienodai',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo neatsakė ({error}) nė į vieną skaitymą (skaitymų: {reads}, kas {spacing} ms), t. y. per {window} ms paleidimo langą; dar besileidžianti kamera per jį atsako',
  'identity.note.neverTwice':
    'GetFirmwareInfo nė karto neatsakė du kartus iš eilės (skaitymų: {reads})',
  'identity.note.noAnswer': 'GetFirmwareInfo neatsakė ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo neatsakė ({error}); atsakyta į {answered} iš {reads} skaitymų, bet niekada du kartus iš eilės, todėl nė vieno atsakymo negalima atskirti nuo įrašo, kurį pasirinktą paliko ankstesnė komanda',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo grąžino {count} baitą — per mažai versijai',
    few: 'GetFirmwareInfo grąžino {count} baitus — per mažai versijai',
    many: 'GetFirmwareInfo grąžino {count} baito — per mažai versijai',
    other: 'GetFirmwareInfo grąžino {count} baitų — per mažai versijai',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo grąžino {count} baitą — per mažai versijai; {context}',
    few: 'GetFirmwareInfo grąžino {count} baitus — per mažai versijai; {context}',
    many: 'GetFirmwareInfo grąžino {count} baito — per mažai versijai; {context}',
    other: 'GetFirmwareInfo grąžino {count} baitų — per mažai versijai; {context}',
  },
  'identity.note.otherRecord':
    'pirmasis skaitymas grąžino kitą įrašą ({version}), ties kuriuo ankstesnė komanda paliko mikroprogramos informacijos selektorių, — tas skaitymas jį išvalė',
  'identity.note.afterStartup': {
    one: 'ji atsakė, paleidimo metu atmetusi {count} skaitymą',
    few: 'ji atsakė, paleidimo metu atmetusi {count} skaitymus',
    many: 'ji atsakė, paleidimo metu atmetusi {count} skaitymo',
    other: 'ji atsakė, paleidimo metu atmetusi {count} skaitymų',
  },
  'identity.predates':
    'mikroprograma {version} senesnė už nuskaitymo protokolą: jos RPC metodų lentelėje nėra GetFeaturedFirmwareData skaitymo doroklės (0.7.0.7 ir 0.7.0.8 ji užregistruota tik kaip rašymo funkcija, o dar anksčiau wire id 0x4F yra UploadFirmwareRowSize), todėl ja negalima perskaityti jokio lango; 0.3.0.1 leidime wire id 0x52 yra EnterBootloaderMode, o ne BeginFirmwareUpgrade. Išsaugojimo seansas 0.7.0.7 ir 0.7.0.8 vietoj to perskaito per wire id 0x58 (GetFeaturedData)',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'atsisakoma {operation}: {reason}',
  'identity.refusingNoVersion':
    'atsisakoma {operation}: {reason}. Niekas neaktyvuota. Atjunkite kamerą, vėl prijunkite, leiskite jai iki galo pasileisti ir bandykite dar kartą.',
  'identity.operation.dump': 'nuskaityti',
  'identity.operation.dumpAll': 'nuskaityti visus selektorius',
  'identity.operation.readInfo': 'nuskaityti įrenginio informaciją',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'lizdai pasirenkami po atsarginės kopijos, kuri juos nuskaito, — pirmiausia atlikite atsarginės kopijos žingsnį',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'lizdų nebegalima keisti, kai įrašymas jau atliktas ar bandytas: šio seanso įrašomi lizdai — {banks}, ir atkūrimas grąžina būtent juos',
  'preserve.banks.none': 'nė vienas',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Įrašyta.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Nuskaityta. Perskaitomų lizdų: {count}/{of}.',
  'status.readRefused':
    'Nuskaityta, bet iš čia negalima įrašyti nė vieno šios kameros lizdo — žr. žurnalą.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Mikroprogramos versija',
  'compare.field.imageId': 'Atvaizdo ID',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'Pradinis SP',
  'compare.field.resetVector': 'Atstatymo vektorius',
  'compare.field.size': 'Dydis',
  'compare.field.shaExpected': 'Laukiamo atviro atvaizdo SHA-256',
  'compare.field.sha': 'Atvaizdo SHA-256',
  'compare.field.shaNotStored': 'Laukiamo atviro atvaizdo SHA-256 (saugomi baitai nenuspėjami)',
  'compare.field.key': 'Raktas',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(atvaizdo nėra)',
  'compare.notImage': '(ne atvaizdas)',
  'compare.notPredicted': '(nenuspėjama: ką saugoti, sprendžia įrenginys)',
  'compare.plaintext': 'nėra (atviras tekstas)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'nepavyko du kartus perskaityti vienodai',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (raktas, kuriuo paleidyklė tikrina lizdą, nustatytas pagal {bank:acc}, kurį ji paleido be patikros) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered': '{bank}, kaip jį užrašo kamera (aktyvaus lizdo žodis {word})',
  'preserve.lastStart.notRead': 'nežinoma — aktyvaus lizdo žodžio nepavyko nuskaityti',
  'preserve.lastStart.noBank':
    'nežinoma — aktyvaus lizdo žodis yra {word}, o tai neatitinka jokio lizdo',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'nežinoma — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'neįrašomas — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'atvaizdas',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — galima įrašyti',
  'preserve.bank.writablePatch': '{build} — galima įrašyti; pataisa pakeičia {count} B',
  'preserve.bank.writableEdit': '{build} — galima įrašyti; pritaikytas pakeitimas: {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — galima įrašyti; pataisa pakeičia {count} B; pritaikytas pakeitimas: {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead':
    'atsarginė kopija dar nenuskaitė lizdų, todėl negalima pasirinkti nė vieno lizdo',
  'preserve.choice.every': 'kiekvienas lizdas, kuriame yra atvaizdas: {banks}',
  'preserve.choice.everyBlocked':
    'visų lizdų, kuriuose yra atvaizdas, įrašyti negalima: {bank} — negalima, nes {reason}',
  'preserve.choice.noImage': 'nė viename lizde nėra atvaizdo, kurį seansas galėtų įrašyti',
  'preserve.choice.nextStart': '{bank} — lizdas, kurį paleis kitas paleidimas: {why}',
  'preserve.choice.nextStartRefused':
    'kitas paleidimas paleis {bank:acc} ({why}), o seansas jo įrašyti negali: {reason}',
  'preserve.choice.everyUnknownStart':
    'kiekvienas lizdas, kuriame yra atvaizdas ({banks}): nežinoma, kurį lizdą paleis kitas paleidimas ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'nežinoma, kurį lizdą paleis kitas paleidimas ({why}), ir {reason}; pasirinkite lizdą pagal pavadinimą',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank}: įrašyti negalima — {reason}',
  'preserve.choice.byName': '{banks} — pasirinkta pagal pavadinimą',
  'preserve.choice.warnNotPatched':
    'Kitas paleidimas paleis {bank:acc} ({why}), o šis pasirinkimas jo nepataiso: po paleidimo iš naujo kamera vykdys paties lizdo atvaizdą, todėl visos flash atminties nuskaitymas sustos dar nieko neperskaitęs. Atkūrimas vis tiek grąžins kiekvieną įrašytą lizdą.',
  'preserve.choice.warnUnknownStart':
    'Nežinoma, kurį lizdą paleis kitas paleidimas ({why}). Jei jis paleis lizdą, kurio šis pasirinkimas nepataiso, visos flash atminties nuskaitymas sustos dar nieko neperskaitęs.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'dar nežinomas',
  'preserve.build.firmware': 'mikroprograma {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'taip, kaip jį saugo kamera (ši kamera savo mikroprogramą laiko neužšifruotą)',
  'preserve.stagedForm.oneKey': 'tokia forma, kokia jį saugo kamera (užšifruotą kameros raktu)',
  'preserve.stagedForm.twoKeys':
    'tokia forma, kokia jį saugo kamera (užšifruotą dviem kameros raktais)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'kiekvienam įrašytam lizdui grąžinami lygiai tie baitai, kuriuos iš jo nuskaitė atsarginė kopija',
  'preserve.restoreForm.factoryStaged':
    'kiekvienam įrašytam lizdui grąžinama jo originali mikroprograma, įrašyta tokia forma, kokia ją saugo kamera, todėl galiausiai lizdas baitas į baitą toks, kokį nuskaitė atsarginė kopija',
  'preserve.restoreForm.none':
    'šiame leidime neįmanoma: jokia originalios mikroprogramos forma nepraeina pačios kameros patikros ir kartu neišsaugoma kaip originalūs baitai, todėl seansas baigiasi su pilnu atvaizdu, o pataisa lieka vietoje',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'šiame leidime neįmanoma: pataisyta mikroprograma negali perskaityti visos flash atminties, todėl seansas neturi pilno atvaizdo',
  'preserve.drain.rotated': 'kamera ją pateikia pasuktą, o seansas sudeda ją atgal į tvarką',
  'preserve.drain.hazard': 'pataisa šiame leidime išvengia skaitymo, dėl kurio kamera užstringa',
  'preserve.drain.whole': 'visa 4 MB flash atmintis vienu skaitymu, po {size} B',
  'preserve.drain.wholeNotes': 'visa 4 MB flash atmintis vienu skaitymu, po {size} B; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'leidžia kameros skaitymo komandai pasiekti visą 4 MB flash atmintį, o ne tik pirmuosius 64 KB',
  'preserve.site.countPast':
    'leidžia skaitymo pozicijai skaičiuoti toliau nei 64 KB, kad skaitymas negrįžtų į pradžią',
  'preserve.site.keepPosition':
    'išlaiko visą skaitymo poziciją, kai ji pasislenka po kiekvieno skaitymo',
  'preserve.site.savePosition': 'išsaugo visą pasislinkusią skaitymo poziciją',
  'preserve.site.clearPosition':
    'išvalo visą skaitymo poziciją kiekvieną kartą, kai prasideda skaitymas, kad po visos flash atminties nuskaitymo kamerą vis dar būtų galima skaityti',
  'preserve.site.modeTwoGuard':
    'leidžia visos flash atminties nuskaitymui prasidėti kaip bet kuriam kitam skaitymui (gamyklinė mikroprograma jį atmeta)',
  'preserve.site.modeTwoIndirection':
    'nukreipia visos flash atminties nuskaitymą į flash atminties pradžią (gamyklinė mikroprograma jį nukreipia į reikšmę, dėl kurios kamera užstringa)',
  'preserve.site.armTail':
    'pašalina iškvietimą, kuris šiame leidime užšaldo kamerą, kai prasideda skaitymas',
  'preserve.site.other':
    'pakeičia vieną instrukciją, kurios reikia visos flash atminties nuskaitymui',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Atsarginė kopija',
  'preserve.step.patch': 'Pataisa',
  'preserve.step.commit': 'Įrašymas',
  'preserve.step.drain': 'Visos flash atminties nuskaitymas',
  'preserve.step.restore': 'Atkūrimas',
  'preserve.step.verify': 'Patikra',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'žingsnis „Pataisa“',
  'preserve.stepId.commit': 'žingsnis „Įrašymas“',
  'preserve.stepId.drain': 'žingsnis „Visos flash atminties nuskaitymas“',
  'preserve.stepId.restore': 'žingsnis „Atkūrimas“',
  'preserve.stepId.verify': 'žingsnis „Patikra“',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: sustabdyta, kaip planuota — kamera paleido {bank:acc}, kurio šis seansas nepataisė, todėl nieko neperskaityta.',
  'preserve.result.noReason': 'priežastis neužrašyta',
  'preserve.result.stopped': '{label}: sustabdyta — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none':
    'nė viename lizde nėra mikroprogramos, kurią seansas galėtų pataisyti',
  'preserve.result.writable.one': '{banks:loc} yra mikroprograma, kurią seansas gali pataisyti',
  'preserve.result.writable.many': '{banks:loc} yra mikroprograma, kurią seansas gali pataisyti',
  'preserve.result.backup':
    '{label}: išsaugotas kiekvienas blokas, kurį pasiekia įprastas skaitymas; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'nežinomas lizdas',
  'preserve.result.backupNext':
    '{label}: išsaugotas kiekvienas blokas, kurį pasiekia įprastas skaitymas; {writable}; kitas paleidimas paleis: {next}.',
  'preserve.result.patch': '{label}: sukurta {banks:dat}.',
  /** The patch step when every bank was refused: nothing to build for. */
  'preserve.result.patchNone':
    '{label}: pataisa nesukurta: nė viename lizde nėra mikroprogramos, kurią seansas galėtų pataisyti.',
  'preserve.result.patchCount': '{label}: sukurta {banks:dat}; kiekviename pakinta {count} B.',
  'preserve.result.commitOne': '{label}: {banks} įrašytas su pataisa, ir kamera ją priėmė.',
  'preserve.result.commitMany': '{label}: {banks} įrašyti su pataisa, ir kamera priėmė kiekvieną.',
  'preserve.result.drainNotRead': '{label}: neperskaityta.',
  'preserve.result.drain':
    '{label}: perskaityta visa 4 MB flash atmintis; pilno atvaizdo sha256 {sha256}.',
  'preserve.result.drainThrough':
    '{label}: visa 4 MB flash atmintis perskaityta per {bank:acc}; pilno atvaizdo sha256 {sha256}.',
  'preserve.result.restore': '{label}: {banks} — įrašyta atgal.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}: {banks} — įrašyta atgal {form}.',
  'preserve.result.verifyDone': '{label}: atlikta.',
  'preserve.result.verifyIdentical':
    '{label}: dar kartą perskaityta blokų: {blocks}, skiriasi 0 baitų — kameros flash atmintis baitas į baitą sutampa su atsargine kopija.',
  'preserve.result.verifyDiffers':
    '{label}: dar kartą perskaityta blokų: {blocks}, besiskiriančių baitų: {bytes}.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: dar kartą perskaityta blokų: {blocks}, besiskiriančių baitų: {bytes}, neperskaitytų blokų: {count}.',
    few: '{label}: dar kartą perskaityta blokų: {blocks}, besiskiriančių baitų: {bytes}, neperskaitytų blokų: {count}.',
    many: '{label}: dar kartą perskaityta blokų: {blocks}, besiskiriančių baitų: {bytes}, neperskaitytų blokų: {count}.',
    other:
      '{label}: dar kartą perskaityta blokų: {blocks}, besiskiriančių baitų: {bytes}, neperskaitytų blokų: {count}.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Sustabdyta prieš visos flash atminties nuskaitymą: kamera paleido lizdą, kurio šis seansas nepataisė, todėl nieko neperskaityta.',
  'preserve.unpatchedStart.next':
    'Toliau: atkūrimas grąžina kiekvieną įrašytą lizdą. Visos flash atminties nuskaitymas iš naujo nebandomas: kamera paleistų tą patį lizdą.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Baigta — jūsų mikroprograma išsaugota',
  'preserve.done.detail':
    'Pilnas atvaizdas yra visa originali kameros flash atmintis, o pati kamera grąžinta lygiai į tokią būseną, kokia buvo.',
  'preserve.done.titleNoImage': 'Baigta — kamera grąžinta į buvusią būseną; pilno atvaizdo nėra',
  'preserve.done.detailNoImage':
    'Visos flash atminties nuskaitymas nebuvo atliktas, todėl šis seansas neturi pilno flash atminties atvaizdo. Kiekvienas įrašytas lizdas grąžintas, o naujai perskaityti blokai, kuriuos pasiekia įprastas nuskaitymas, sutampa su atsargine kopija. Norėdami gauti pilną atvaizdą, pradėkite naują seansą ir pasirinkite taip, kad būtų įtrauktas lizdas, kurį paleis kitas paleidimas.',
  'preserve.done.detailNoImageCount':
    'Visos flash atminties nuskaitymas nebuvo atliktas, todėl šis seansas neturi pilno flash atminties atvaizdo. Kiekvienas įrašytas lizdas grąžintas, o naujai perskaityti blokai, kuriuos pasiekia įprastas nuskaitymas (blokų: {blocks}), sutampa su atsargine kopija. Norėdami gauti pilną atvaizdą, pradėkite naują seansą ir pasirinkite taip, kad būtų įtrauktas lizdas, kurį paleis kitas paleidimas.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'kameros langų skaitytuvas turi ribotą biudžetą vienam paleidimui, ir šie skaitymai grįžo iš išnaudoto skaitytuvo — išjunkite ir vėl įjunkite kamerą (atjunkite ir vėl prijunkite arba naudokite jos maitinimo jungiklį), tada iš naujo paleiskite `preserve --resume <run-directory>`. Parašas: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'kameros langų skaitytuvas turi ribotą biudžetą vienam paleidimui, ir šie skaitymai grįžo iš išnaudoto skaitytuvo — išjunkite ir vėl įjunkite kamerą (atjunkite ir vėl prijunkite arba naudokite jos maitinimo jungiklį), tada iš naujo paleiskite `preserve --resume <run-directory>`. Parašas: {signature} — iš šių baitų negalima gauti gamyklinio atviro teksto. Išbandyti visi skaitymo būdai:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'atsarginėje kopijoje nėra {bank:gen} ({address}) — gamykliniai langai jo pateikti negali',
  'preserve.fail.readsDisagree':
    'du {bank:gen} skaitymai nesutampa (sha256 {sha256} ir {other}) — kamera, kuri negali du kartus iš eilės vienodai pateikti savo vykdomo lizdo, nėra kamera, į kurią galima rašyti; įrašas yra atkūrimo šaltinis ir pataisos išvedimo įvestis',
  'preserve.fail.notFactory':
    '{bank:loc} nėra gamyklinio atvaizdo taip, kaip jį saugo šio leidimo šifras (laukiama atvaizdo pradžia nesutampa su įrašu) — atsisakoma dar prieš ką nors užrašant, juo labiau įrašant',
  'preserve.fail.ffSum':
    'pataisyta mikroprograma ta forma, kuria ją saugo kamera, nepraeina paties leidimo patikros (jos suma turi būti {sum}) — atsisakoma siųsti lizdą, kurį kamera atmestų po ištrynimo',
  'preserve.fail.headChanged':
    '{bank:gen} pradžia pasikeitė nuo atsarginės kopijos (joje nėra nei originalaus įrašo, nei pataisytų baitų) — atsisakoma rašyti ant nežinomos lizdo būsenos; niekas neįrašyta. Pradžios hex: dabar {live}, įraše {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks:loc} jau yra pataisyti baitai — įrašymas pavyko ankstesniu bandymu ir negali būti kartojamas. Tęskite nuo visos flash atminties nuskaitymo žingsnio (--resume), kuris paleidžia pataisytą atvaizdą ir tęsia nuo ten.',
  'preserve.fail.landed':
    '{banks:loc} jau yra pataisyti baitai — įrašymas pavyko ankstesniu bandymu ir negali būti kartojamas. Tęskite nuo visos flash atminties nuskaitymo žingsnio (--resume), kuris paleidžia pataisytą atvaizdą ir tęsia nuo ten.',
  'preserve.fail.drainRebootRefused':
    'visos flash atminties nuskaitymo paleidimo iš naujo komandą ATMETĖ pagrindinė sistema dar prieš jai išeinant (SecurityError: naršyklės politika arba testo apsauga), todėl kamera vis dar vykdo atvaizdą, su kuriuo pasileido, o ne įrašytą pataisą. Visos flash atminties nuskaitymas skaito tik per pataisyto atvaizdo išplėstą langą, todėl sustoja dar nieko neaktyvavęs; niekas neperskaityta. Paleiskite visos flash atminties nuskaitymą dar kartą ten, kur pagrindinė sistema praleidžia paleidimo iš naujo komandą.',
  'preserve.fail.shiftedRebootRefused':
    'visos flash atminties nuskaitymas grįžo vienu puslapiu aukščiau, o paleidimo iš naujo komandą, kuri suteikia kitą paleidimą, ATMETĖ pagrindinė sistema dar prieš jai išeinant (SecurityError: naršyklės politika arba testo apsauga) — kitas bandymas nuskaitytų tą patį paslinktą paleidimą. Niekas neišsaugota; paleiskite visos flash atminties nuskaitymą dar kartą ten, kur atstatymo komanda gali išeiti.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'patikra rado {count} besiskiriantį baitą per langus ({read}/{total}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
    few: 'patikra rado {count} besiskiriančius baitus per langus ({read}/{total}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
    many: 'patikra rado {count} besiskiriančio baito per langus ({read}/{total}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
    other:
      'patikra rado {count} besiskiriančių baitų per langus ({read}/{total}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
  },
  'preserve.fail.verifyIn': {
    one: 'patikra rado {count} besiskiriantį baitą per langus ({read}/{total}) (vietose: {places}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
    few: 'patikra rado {count} besiskiriančius baitus per langus ({read}/{total}) (vietose: {places}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
    many: 'patikra rado {count} besiskiriančio baito per langus ({read}/{total}) (vietose: {places}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
    other:
      'patikra rado {count} besiskiriančių baitų per langus ({read}/{total}) (vietose: {places}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
  },
  'preserve.fail.verifyShort': {
    one: 'patikra rado {count} besiskiriantį baitą per langus ({read}/{total}) (trumpi langai: {short}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
    few: 'patikra rado {count} besiskiriančius baitus per langus ({read}/{total}) (trumpi langai: {short}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
    many: 'patikra rado {count} besiskiriančio baito per langus ({read}/{total}) (trumpi langai: {short}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
    other:
      'patikra rado {count} besiskiriančių baitų per langus ({read}/{total}) (trumpi langai: {short}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
  },
  'preserve.fail.verifyInShort': {
    one: 'patikra rado {count} besiskiriantį baitą per langus ({read}/{total}) (vietose: {places}) (trumpi langai: {short}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
    few: 'patikra rado {count} besiskiriančius baitus per langus ({read}/{total}) (vietose: {places}) (trumpi langai: {short}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
    many: 'patikra rado {count} besiskiriančio baito per langus ({read}/{total}) (vietose: {places}) (trumpi langai: {short}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
    other:
      'patikra rado {count} besiskiriančių baitų per langus ({read}/{total}) (vietose: {places}) (trumpi langai: {short}) — dalis pakartotinai perskaityta ne baitas į baitą tokia pati kaip atsarginėje kopijoje',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'paleidimo konfigūracijos blokas',
  'preserve.fail.dataBlock': 'duomenų blokas',

  'preserve.refused.secondRead': 'jo antrasis skaitymas nepavyko ({error})',
  'preserve.refused.readsDisagree': 'du jo skaitymai nesutampa (sha256 {sha256} ir {other})',
  'preserve.refused.erased': 'jis ištrintas',
  'preserve.refused.watchdogMark':
    'jo antraštės žodyje ties +0x200 yra {word} — žymė, kurią paleidyklė užrašo ant lizdo po sargybinio laikmačio (watchdog) atstatymo paleidimo pradžioje; paleidyklė šio lizdo nebepriima, o seansas neturi ten atvaizdo, kurį galėtų pataisyti',
  'preserve.refused.noHeader': 'jame nėra atvaizdo antraštės ties +0x200',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'jame yra {image} ({id}), o ne kameros vykdomas leidimas ({camera})',
  'preserve.refused.otherKey':
    'paleidyklės patikra jį atmeta: jis saugomas su kitu raktu nei tas, kuriuo šios kameros paleidyklė tikrina lizdus, o įrašymas per kamerą jį išsaugotų su tuo raktu, todėl atkūrimas negalėtų grąžinti tikslių jo baitų',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'kamera nurodo mikroprogramą {camera}, reikia {version} — pataisa išvesta iš vieno leidimo baitų ir negali būti siunčiama kitam',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'mikroprograma {version} nėra 0.x ar 1.x leidimas, o šis seansas apima tik 2014 ir 2016 m. leidimus. Be versijos niekas nenuskaityta. Šią kamerą nuskaitykite skirtuke „Nuskaityti ir iššifruoti 4.x/Nano“: jis nuskaito flash atmintį be pataisos, visus blokus, išskyrus esantį adresu 0x14060000, kurio tuose leidimuose nepasiekia joks skaitymo langas.',
  'preserve.refused.preWidening':
    'mikroprograma {version} senesnė už išplėtimo būdą, ir seansas atsisako, užuot rašęs ant lizdo, kurio negali perskaityti atgal. Šioje kartoje kamera atmeta kiekvieną būdą pradėti skaitymą, kurio reikia šiam būdui (išmatuota su 0.3.0.1), jos skaitymo komanda nepasiekia flash atminties pradžios, o dydis, kurį pakeistų pataisa, saugomas kitaip. Ji taip pat neturi skaitymo, kurį galėtų naudoti įprastas nuskaitymas. Be versijos niekas nenuskaityta.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'turi nežinomą atvaizdą (ne gamyklinę {version} mikroprogramą ir ne seansui žinomą jos pakeitimą), todėl seansas jo netaiso ir negrąžina',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'turi žinomą kadrų dažnio leidimą: gamyklinę {version} mikroprogramą su {hz} Hz kadrų dažnio pataisa. Seansas taiso tik gamyklinę mikroprogramą, niekada pataisyto atvaizdo, todėl šio lizdo netaiso ir negrąžina',
  'preserve.image.frameRateEarlier':
    'turi žinomą kadrų dažnio leidimą: gamyklinę {version} mikroprogramą su ankstesne {hz} Hz kadrų dažnio pataisa (padaryta dar prieš prie jos prisijungiant USB pataisymui). Seansas taiso tik gamyklinę mikroprogramą, niekada pataisyto atvaizdo, todėl šio lizdo netaiso ir negrąžina',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    'jis {what}. Norėdami įtraukti šį lizdą, pirmiausia įrašykite į jį gamyklinį atvaizdą (pavyzdžiui, iš visos flash atminties atsarginės kopijos, padarytos prieš pakeitimą), tada pradėkite naują seansą',
  'preserve.image.frameRateWords':
    'jis {what}. Norėdami įtraukti šį lizdą, pirmiausia įrašykite į jį gamyklinį atvaizdą (pavyzdžiui, iš visos flash atminties atsarginės kopijos, padarytos prieš kadrų dažnio pataisą), tada pradėkite naują seansą; kadrų dažnio pataisą vėliau galima vėl pritaikyti gamykliniam atvaizdui',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name} {what}. Seansas taisomą mikroprogramą ima iš šio lizdo, todėl sustoja čia, dar prieš ką nors įrašydamas. Norėdami išsaugoti šią kamerą, pirmiausia įrašykite gamyklinį atvaizdą atgal į {bank:acc} (pavyzdžiui, iš visos flash atminties atsarginės kopijos, padarytos prieš pakeitimą), tada pradėkite naują seansą.',
  'preserve.image.frameRateRefusal':
    '{name} {what}. Seansas taisomą mikroprogramą ima iš šio lizdo, todėl sustoja čia, dar prieš ką nors įrašydamas. Norėdami išsaugoti šią kamerą, pirmiausia įrašykite gamyklinį atvaizdą atgal į {bank:acc} (pavyzdžiui, iš visos flash atminties atsarginės kopijos, padarytos prieš kadrų dažnio pataisą), tada pradėkite naują seansą; kadrų dažnio pataisą vėliau galima vėl pritaikyti gamykliniam atvaizdui.',
  'preserve.image.otherFirmware':
    'jame yra mikroprograma {image}, o ne {camera}, kurią vykdo kamera',
  'preserve.image.otherFirmwareRefusal':
    '{name} turi mikroprogramą {image}, o ne {camera}, kurią vykdo kamera, todėl šis seansas neturi ten atvaizdo, kurį galėtų pataisyti, ir atsisako, užuot rašęs ant jo.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'iš jo negaunamas joks atvaizdas, kurį seansas galėtų pataisyti ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone': 'šis seansas baigtas — atlikti visi žingsniai (seansas {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    'žingsnis {step} šiame seanse jau atliktas (baigtas {finished}) — tęsiama nuo {next}',
  'preserve.gate.stepDoneUnknownTime':
    'žingsnis {step} šiame seanse jau atliktas (baigimo laikas nežinomas) — tęsiama nuo {next}',
  'preserve.gate.backupRerun':
    'atsarginės kopijos žingsnio kartoti negalima: šis seansas jau atliko {steps}, o kitas jo žingsnis yra {next} — naudokite --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'ankstesnis atsarginės kopijos bandymas nepavyko, todėl prieš vėl atliekant šį žingsnį kamerą BŪTINA IŠJUNGTI IR VĖL ĮJUNGTI — kartojant tame pačiame paleidime galima nuskaityti pasenusius ar tuščius baitus (išmatuota: pakartota atsarginė kopija vietoj paleidimo konfigūracijos įrašo nuskaitė paleidyklės paleidimo žodį). Išjunkite ir vėl įjunkite kamerą (atjunkite ir vėl prijunkite arba naudokite jos maitinimo jungiklį), tada vėl atlikite atsarginę kopiją ir, paklausti, patvirtinkite maitinimo išjungimą ir įjungimą: seansas negali to pamatyti. Užrašyta klaida: {error}',
  'preserve.gate.noErrorText': '(klaidos teksto nėra)',
  'preserve.gate.patchAfterBackup':
    '{step} atliekamas po atsarginės kopijos: seansas nuskaito kiekvieną sritį, kurią gali perskaityti gamyklinis planas, ir ją išsaugo PRIEŠ bet ką kita — ta atsarginė kopija yra vienintelė šios kameros kopija. Pirmiausia atlikite atsarginės kopijos žingsnį.',
  'preserve.gate.commitAfterBackup':
    '{step} atliekamas po atsarginės kopijos (žr. žingsnį „Pataisa“)',
  'preserve.gate.commitAfterPatch':
    '{step} atliekamas po žingsnio „Pataisa“, kuris užrašo, ką jis paruošia',
  'preserve.gate.commitNeedsPatch':
    '{step} negali būti atliktas be {banks:gen} pataisos, o žingsnis „Pataisa“ jos neužrašė — atlikite žingsnį „Pataisa“ dar kartą',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step} negali būti atliktas be atsarginės kopijos failų seanso kataloge, o jų trūksta: {files} — be jų įrašymas neturi atkūrimo šaltinio, todėl atsisako',
  'preserve.gate.drainNoCommit':
    '{step} skaito PATAISYTĄ dalį per išplėstą langą, o šis seansas neturi užbaigto įrašymo — su gamykline kamera visos flash atminties nuskaitymas užstrigtų. Pirmiausia atlikite įrašymą (arba tęskite nuo jo) arba peršokite aiškiai (allowJump), jei įrašymas pavyko be savo kontrolinio taško.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused':
    'visos flash atminties nuskaitymo žingsnis šiam leidimui atsisako ({build}): {note}',
  'preserve.gate.detectedBuild': 'aptiktas leidimas',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'visos flash atminties nuskaitymo žingsnis šiam leidimui atsisako ({build}): pradėjus visos flash atminties nuskaitymą nepataisytoje šio leidimo mikroprogramoje, kamera užstringa (ji skaito iš reikšmės, kuri nėra flash atminties adresas; išmatuota emuliatoriumi: pateikta 32 KB, tada kamera sutriko). Pakeitimas, dėl kurio skaitymas tampa saugus, yra adresu {sites}, ir jo nėra tarp pakeitimų, kuriuos šis seansas užrašė {bank:dat} — prieš visos flash atminties nuskaitymą atlikite žingsnį „Pataisa“ (ir įrašymą).',
  'preserve.gate.drainFiles':
    '{step} negali būti atliktas be {files} (pristatyta išklotinė apdorojama su kiekvieno įrašyto lizdo įrašu), o jo seanso kataloge nėra',
  'preserve.gate.restoreNoCommit':
    '{step} grąžina originalius lizdus ant pataisos, o šis seansas neturi užbaigto įrašymo — nėra ką atšaukti. Pirmiausia atlikite įrašymą (arba tęskite nuo jo) arba peršokite aiškiai (allowJump), jei norite atkurti jau pataisytą kamerą.',
  'preserve.gate.restoreNeedsPatch':
    '{step} negali būti atliktas be kiekvieno įrašyto lizdo pataisos santraukos (dėl paruošto ilgio) — pirmiausia atlikite žingsnį „Pataisa“',
  'preserve.gate.restoreNoForm':
    'atkūrimo žingsnis šiam leidimui atsisako ({build}): jokia originalios mikroprogramos forma nepraeina pačios kameros patikros ir kartu neišsaugoma kaip originalūs baitai — originalios mikroprogramos kontrolinė suma yra 0xB7AB9D17 (išmatuota), o ne kameros reikalaujama 0xFFFF. Šis seansas baigiasi su pilnu atvaizdu rankose ir pataisa vietoje; originalų turinį grąžinti galima tik visos flash atminties programatoriumi.',
  'preserve.gate.restoreFiles':
    '{step} negali būti atliktas be {files} (kiekvieno įrašyto lizdo originalas iš atsarginės kopijos žingsnio), o jo seanso kataloge nėra',
  'preserve.gate.verifyNoRestore':
    '{step} palygina naują paleidimą su atsargine kopija, o šis seansas neturi užbaigto atkūrimo — pataisytas lizdas būtų rodomas kaip skirtumai. Pirmiausia atlikite atkūrimą (arba tęskite nuo jo) arba peršokite aiškiai (allowJump), jei atkūrimas pavyko be savo kontrolinio taško.',
  'preserve.gate.verifyNeedsBackup':
    '{step} negali būti atliktas be {file} (palyginimo etalono), o jo seanso kataloge nėra',
  'preserve.gate.needsBanks':
    '{step} negali būti atliktas be lizdų, kuriuos nuskaitė atsarginės kopijos žingsnis, o būsenoje jų nėra',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'šiam seansui nepasirinkta jokių lizdų: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank}: įrašyti negalima — {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'šio leidimo pataisa pasileidžia tik iš atkūrimo lizdo R: {note} — seansas įrašytų į {bank:acc}, iš kurio paleidyklė jo niekada nepaleidžia',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'failas per mažas, kad tilptų atvaizdo antraštė',
  'slots.image.notWordSized': 'atvaizdo dydis turi būti 4 kartotinis (gauta {size} B)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'atvaizdas yra {size} B; paleidyklė atmeta bet kokį header.length >= {limit}, todėl jis niekada nepasileistų',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'adresu {at} nėra atvaizdo antraštės (žymė {magic}, laukta {expected}) — tai turi būti iššifruotas Seek mikroprogramos atvaizdas, o ne užšifruotas lizdas ar flash atminties išklotinė',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'pradinė steko rodyklė {address} nėra LPC43xx SRAM srityje — tai neatrodo iššifruota',
  'slots.image.stackUnaligned': 'pradinė steko rodyklė {address} nesulygiuota pagal žodį',
  'slots.image.notThumb': 'atstatymo vektorius {address} nėra Thumb adresas',
  'slots.image.noKeyPair':
    'šio failo pavadinime nėra jo raktų poros, o atvaizde lygiai vieną kartą nepasitaiko nei šios kameros pora, nei iškoduota programos pora, todėl negalima nustatyti, kokiems raktams atvaizdas sukurtas. Iššifruoti failai pavadinami pagal juose esančius raktus.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'failo pavadinime nurodytas raktas A {keyA} ir raktas B {keyB}, bet {mismatch}. Abu raktai turi būti, kiekvienas lygiai vieną kartą.',
  'slots.image.keyInHeader':
    'šis atvaizdas laiko raktą adresu {at}, atviro teksto antraštės lange — atsisakoma jį taisyti',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'failo pavadinimo raktas A ir raktas B atitinka persidengiančius baitus adresais {at} ir {other} — tai turi būti dvi skirtingos 16 baitų reikšmės',
  'slots.image.retargetLost':
    'po perkėlimo atvaizde šios kameros raktų pora nepasitaiko lygiai vieną kartą — atsisakoma kurti duomenis, kurių vėlesniems atnaujinimams paleidyklė negalėtų parinkti rakto',
  'slots.image.noStageKey':
    'atvaizde nėra 2016 m. linijos raktų poros, todėl nėra paruošimo rakto, kuriuo jį koduoti',
  'slots.image.ffSumNoKeys':
    'šio atvaizdo žodžių suma yra 16 Hz FF 0xFFFF, bet jame nėra 1.3.0.8-FF raktų poros (abiejų pusių, po vieną kartą), todėl jo paruoštos formos sukurti negalima. Niekas neįrašyta.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'tai 1.3.0.8 FF (16 Hz) atvaizdas, kuris paruošiamas savo rakto A forma (ff-form.ts), o ne kaip neužšifruotas atvaizdas. Niekas neįrašyta.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'planas sukurtas mikroprogramai {firmware}, bet analizė rodo {version}. Planas pasenęs; sukurkite jį iš naujo. Niekas neįrašyta.',
  'slots.plan.otherFirmwareUnknown':
    'planas sukurtas nežinomos versijos mikroprogramai, bet analizė rodo {version}. Planas pasenęs; sukurkite jį iš naujo. Niekas neįrašyta.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'planas sukurtas kamerai (serijos numeris: {planSerial}), bet analizė rodo {serial}. Atsisakoma jį čia įrašyti. Niekas neįrašyta.',
  'slots.plan.cameraUnknownSerial': 'nežinomas',
  'slots.plan.unknownSerial': 'nežinomą serijos numerį',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, inside the sentence ("slot A"). */
  'slots.plan.otherAddress':
    'planas skirtas adresui {address}, bet šio leidimo {name} yra adresu {at}',
  'slots.plan.notRead': 'analizė nebeskaito {name:gen}. Niekas neįrašyta.',
  'slots.plan.edited':
    'plano kontrolinė suma neatitinka jo duomenų, todėl planas buvo pakeistas. Niekas neįrašyta.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'duomenys yra {size} B — daugiau, nei talpina {name}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck':
    '{risk}. Jį įrašyti galima tik su acknowledgeRisk: true. Niekas neišsiųsta.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'ši kamera iš čia negali priimti neužšifruoto paruošto atvaizdo: {reason}. Niekas neįrašyta.',
  'slots.plan.noKeyTable':
    'analizė neįvardija šios kameros paleidyklės raktų lentelės, todėl atvaizdo negalima jai pritaikyti',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'po CompleteMemoryUpgrade nepavyko nuskaityti patvirtinimo būsenos, todėl {name:nom} gali būti įrašytas iš dalies. Prieš darydami ką nors kita, dar kartą nuskaitykite lizdus ir pasilikite išsaugotą kopiją.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'kamera atmetė įrašymą į {name:acc} patvirtinimo metu su {status}: {cause}. Niekas neįrašyta; lizdas nepakeistas. Prieš darydami ką nors kita, dar kartą nuskaitykite lizdus.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade grąžino {status} ({cause}) {name:dat}: niekas neužprogramuota, bet ištrynimas galėjo prasidėti, todėl lizdas gali būti iš dalies ištrintas. Prieš darydami ką nors kita, dar kartą nuskaitykite lizdus ir pasilikite išsaugotą kopiją.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade grąžino {status} ({cause}) — {name:nom} gali būti įrašytas iš dalies. Prieš darydami ką nors kita, dar kartą nuskaitykite lizdus ir pasilikite išsaugotą kopiją.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'kamera nurodė {status} ruošiant {name:acc} ties poslinkiu {offset} — nutraukta prieš CompleteMemoryUpgrade, todėl į flash atmintį niekas neįrašyta',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum': 'perdavimo kontrolinė suma neatitiko paruoštų baitų',
  'commit.cause.unsupported': 'atvaizdas neiššifruotas kameros raktais arba duomenų tipas atmestas',
  'commit.cause.acceptance':
    'atvaizdą atmetė jo priėmimo patikra dar prieš ką nors ištrinant (patikra priklauso nuo leidimo)',
  'commit.cause.notArmed': 'joks lizdo atnaujinimas nebuvo aktyvuotas',
  'commit.cause.eraseFailed': 'ištrynimo etapas nepavyko',
  'commit.cause.programFailed': 'programavimo etapas nepavyko',
  'commit.cause.verifyFailed': 'patikros etapas nepavyko',
  'commit.cause.unknown': 'čia nežinoma būsena',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name} nekopijuojamas į save patį. Niekas neįrašyta.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Niekas neįrašyta.',
  'copy.refused.noPlain':
    '{name} neturi iššifruoto atvaizdo, kurį būtų galima kopijuoti. Niekas neįrašyta.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} yra ZIP failas, kurio čia perskaityti negalima ({error}). Niekas neįrašyta.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} neturi visos flash atminties. ZIP failas priimamas, jei tai 0.x/1.x skirtuko seanso failas, kuriame yra {preserve} (kai jo pilno nuskaitymo žingsnis jau atliktas), „Nuskaityti ir iššifruoti 4.x/Nano“ ZIP failas ({dump}) arba „Nuskaityti visus selektorius“ ZIP failas ({selectors}); šiame ZIP faile yra: {names}. Niekas neįrašyta.',
  'restore.refused.noWholeFlashPatched':
    '{file} neturi visos flash atminties. ZIP failas priimamas, jei tai 0.x/1.x skirtuko seanso failas, kuriame yra {preserve} (kai jo pilno nuskaitymo žingsnis jau atliktas), „Nuskaityti ir iššifruoti 4.x/Nano“ ZIP failas ({dump}) arba „Nuskaityti visus selektorius“ ZIP failas ({selectors}); šiame ZIP faile yra: {names}. Jame esantis {patched} yra flash atmintis su laikina seanso pataisa, todėl jis nepriimamas. Niekas neįrašyta.',
  'restore.refused.zipEmpty': 'nieko',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'visos flash atminties atsarginė kopija yra {full} B (4 MB — visa lusto talpa, kurią nuskaito J-Link); {file} yra {size} B. Niekas neįrašyta.',
  'restore.refused.noBank': 'šio leidimo plane nėra {bank:gen}. Niekas neįrašyta.',
  'restore.refused.outsideFlash': '{name} nėra 4 MB flash atminties ribose. Niekas neįrašyta.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    'Šaltinis ({where}) nebuvo nuskaitytas išklotinėje, iš kurios gautas {file}: pagal jos manifest.json, {address} yra tarpas. Nėra atvaizdo, kurį būtų galima atkurti. Niekas neįrašyta.',
  'restore.refused.gapReason':
    'Šaltinis ({where}) nebuvo nuskaitytas išklotinėje, iš kurios gautas {file}: pagal jos manifest.json, {address} yra tarpas ({gap}). Nėra atvaizdo, kurį būtų galima atkurti. Niekas neįrašyta.',
  'restore.refused.gapFill':
    'Šaltinis ({where}) nebuvo nuskaitytas išklotinėje, iš kurios gautas {file}: pagal jos manifest.json, {address} yra tarpas, užpildytas {fill}. Nėra atvaizdo, kurį būtų galima atkurti. Niekas neįrašyta.',
  'restore.refused.gapReasonFill':
    'Šaltinis ({where}) nebuvo nuskaitytas išklotinėje, iš kurios gautas {file}: pagal jos manifest.json, {address} yra tarpas ({gap}), užpildytas {fill}. Nėra atvaizdo, kurį būtų galima atkurti. Niekas neįrašyta.',
  'restore.refused.empty':
    'Šaltinis ({where}) tuščias: kiekvienas baitas yra 0xFF. Įrašymas užprogramuoja atvaizdą ir negali palikti lizdo ištrinto, todėl tuščio lizdo įrašymu atkurti negalima. Niekas neįrašyta.',
  'restore.refused.fill':
    'Šaltinyje ({where}) kiekvienas baitas yra {fill} — užpildas, kurį išklotinė įrašo ten, kur nieko neperskaitė: išklotinė šio lizdo nenuskaitė. Nėra atvaizdo, kurį būtų galima atkurti. Niekas neįrašyta.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    'Šaltinio ({where}) iš šio failo atkurti negalima: {why}. Niekas neįrašyta.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'šis leidimas neturi lizdo rašymo aktyvavimo',
  'support.noStagingEmpty': 'šis leidimas neturi paruošimo formos, todėl tuščias lizdas neįrašomas',
  'support.buildUnknown': 'leidimas nežinomas',
  'support.unverifiedStaging':
    'šis leidimas priklauso užrakintai 0.x/1.x linijai, bet nėra vienas iš leidimų, kuriuose buvo išmatuotos išsaugojimo pataisų lentelės (0.8.0.0 .. 1.3.0.8 ir 1.0.3.0 / 1.0.3.2), todėl jo lizdo paruošimo forma nežinoma ir niekas neįrašoma',
  'support.unknownFamily':
    'kameros šeima nežinoma, todėl nežinomas ir raktas, su kuriuo įrašomi jos lizdai, o kamera priima lizdą, įrašytą netinkamu raktu, ir tada iš jo nepasileidžia. Nuskaitykite ir iššifruokite šią kamerą, atpažinkite ją iš išklotinės, tada nurodykite jos šeimą su --family.',
  'support.noReadCommand':
    'senesnė nei 0.8.0.0 mikroprograma neturi GetFeaturedFirmwareData — komandos, kuria nuskaitymas skaito flash atmintį, — skaitymo doroklės. 0.7.0.7 ir 0.7.0.8 leidimuose ji yra RPC metodų lentelėje ties 0x4F, bet užregistruota tik kaip rašymo funkcija (setter), todėl nuskaitymo siunčiamo control-IN skaitymo negalima perduoti (išsaugojimo seansas šiuos du leidimus vietoj to skaito per wire id 0x58, GetFeaturedData); iki 0.7.0.7 wire id 0x4F yra UploadFirmwareRowSize, o 0.3.0.1 leidime wire id 0x52 — tas, kuriuo nuskaitymas aktyvuoja, — yra EnterBootloaderMode, o ne BeginFirmwareUpgrade: kamera lieka savo programoje, bet kiekvienas aktyvavimas nustato flash tikslą ir aktyvuoja to leidimo mikroprogramos atnaujinimo etapą (tada GetErrorCode grąžina 0x00400000), o tai nėra skaitymo langas. Atkurta iš pačių atvaizdų metodų lentelių, abiejų doroklių stulpelių; žr. test/firmware/facts.json.',
  'support.noWritePath':
    'šie leidimai naują mikroprogramą gauna per senesnę atnaujinimo seką, kurios šis įrankių rinkinys nesiunčia, o jų lizdai niekada nebuvo išnagrinėti, todėl niekas neįrašoma.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'mikroprogramos versijos nepavyko nuskaityti, todėl leidimas, jo lizdai ir jų paruošimo forma nežinomi; jame niekas neskaitoma ir nerašoma',
  'support.versionNotDotted':
    'mikroprogramos versija „{version}“ nėra taškais atskirta versija, todėl leidimas, jo lizdai ir jų paruošimo forma nežinomi; jame niekas neskaitoma ir nerašoma',
  'support.olderThanFirst':
    'mikroprograma {version} senesnė nei {first}: jos RPC lentelėje nėra GetFeaturedFirmwareData — komandos, kurią siunčia lizdo skaitymas, — skaitymo doroklės, todėl jai nesiunčiamas nei skaitymas, nei rašymas (įrodymai — early-compact)',
  'support.modernOnLocked':
    'šeima modern-4x apima 2.x, 4.x, 10.x, 42.x ir 44.x; {version} priklauso 0.x / 1.x užrakintai linijai, kuriai reikia legacy-auth arba compact-2016',
  'support.lockedOnModern':
    'šeima legacy-auth apima 0.x / 1.x užrakintą liniją; {version} priklauso naujajai linijai, kuriai reikia modern-4x',
  'support.notCompactPro':
    'šeima compact-2016 apima Compact PRO 1.0.3.x liniją; {version} jai nepriklauso',
  'support.earlyCompact':
    'šeima early-compact apima tik senesnius nei {first} leidimus, o {version} skaitomas per legacy-auth',
  'support.generic':
    'kameros šeima neatpažinta (šeima generic), todėl lizdų išdėstymas ir paruošimo forma nežinomi; atpažinkite kamerą prieš skaitydami ar rašydami lizdą',
  'support.noPlan':
    'šeimai {family} lizdų plano nėra: jos lizdų išdėstymas ir paruošimo forma nežinomi',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'šio leidimo lentelė neaktyvuoja režimo {mode} adresu {address} paprastu kanalu',
  'support.noArmToken':
    'šio leidimo lentelė neaktyvuoja režimo {mode} adresu {address} žetono kanalu',
  'support.windowElsewhere': 'išsaugojimo lizdo langas {bank:dat} yra adresu {at}, o ne {address}',
  'support.noDumpWindow':
    'šio leidimo BeginFirmwareUpgrade lentelėje nėra lango adresu {address} {bank:dat}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} nepalaiko šios galimybės — {capability}: {reason}',
  'support.capability.dump': 'nuskaitymas',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': 'Nuskaityti visus selektorius',
  'support.capability.decrypt': 'iššifravimas',
  'support.capability.deviceInfo': 'skirtuko „Informacija“ pilnas nuskaitymas',
  'support.capability.flash': 'lizdų įrašymas',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name} adresu {address} šiame leidime neperskaitomas: jo selektorių lentelėje ten nėra lango, todėl jam niekas neaktyvuota',
  'slots.unread.missing': '{name} nerastas kameros analizėje',
  'slots.unread.notRead': '{name} nenuskaitytas',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Niekas neįrašyta.',
  'slots.refused.versionUnknown':
    'analizė nenurodo, kokią mikroprogramą vykdo kamera, o lizdų komandos skirtinguose leidimuose reiškia skirtingus dalykus. Dar kartą nuskaitykite įrenginio informaciją.',
  'slots.refused.versionUnknownWrite':
    'analizė nenurodo, kokią mikroprogramą vykdo kamera. Niekas neįrašyta.',
  'slots.refused.emptyInput': 'įvestis tuščia',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable':
    '{name} tuščias, ir šiame leidime jo įrašyti negalima: {reason}',
  'slots.refused.noRaw': '{name} šiame leidime negali priimti neapdorotų baitų: {reason}',
  'slots.refused.noPlain': '{name} šiame leidime negali priimti iššifruoto atvaizdo: {reason}',
  'slots.refused.noStaging':
    '{name} šiame leidime neturi paruošimo formos, todėl atvaizdo jam užkoduoti negalima',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B — daugiau, nei talpina {name} ({bankSize} B)',
  'slots.refused.imageTooLong':
    'atvaizdas yra {size} B — daugiau, nei talpina {name} ({bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    '2014 m. paleidyklė nepriima šio leidimo kontrolinės sumos lizde A ar B ir paleidžia atkūrimo lizdą R (0x14070000) jo netikrindama, todėl pataisa įrašoma į atkūrimo lizdą R ir niekur kitur',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly': 'šis leidimas veikia tik iš atkūrimo lizdo R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize':
    'mikroprogramos lizdas yra {size} B ({kib} KB); šis failas yra {count} B',
  'decryptFile.erasedBank':
    'tuščias, nėra ką iššifruoti: visi {size} B skaitomi kaip 0xFF (ištrintas lizdas)',
  'decryptFile.erasedHeader':
    'ištrintas: antraštės langas vien 0xFF, todėl lizde nėra atvaizdo; niekas neiššifruojama',
  'decryptFile.noHeader': 'nėra atvaizdo antraštės (žymė {magic}), todėl nėra ką iššifruoti',
  'decryptFile.lengthOutOfRange':
    'header.length {length} už leistino intervalo ribų; nėra ką iššifruoti',
  'decryptFile.ffKeyB':
    'iššifruota {size} B su FF 1.3.0.8 raktu B: atvaizdas saugomas kaip atvaizdas XOR jo rakto bloko 1 srautas, antraštės langas nepakeistas',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'raktas neatkurtas: atvaizdas iššifruojamas į atstatymo vektorių, kuris nėra Cortex-M įėjimo taškas (raktas {check}); niekas neiššifruojama',
  'decryptFile.storedPlain':
    'saugoma neužšifruota: lizde atvaizdas laikomas toks, koks veikia (2014 m. neužšifruota grandinė, tapatusis rakto srautas), todėl rakto nėra, o iššifruotas atvaizdas yra pats atvaizdas',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 'iššifruota {size} B raktu, atkurtu iš šio lizdo ({check})',
  'decryptFile.decryptedNamed':
    'iššifruota {size} B raktu, atkurtu iš šio lizdo ({check}; tai {key})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'trumpas skaitymas ({size} B)',
  'read.reason.noParse': 'nepavyko išnagrinėti atvaizdo antraštės',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'nėra atvaizdo antraštės (žymė {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} už leistino intervalo ribų',
  'read.reason.stopped': 'lizdo skaitymas sustojo ties {count}/{size} B',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'mikroprogramoje {version} neperskaitomas: jos plane ({table}) nėra lango adresu {address}, todėl jam niekas neaktyvuota',
  'read.reason.notInPlanUnknown':
    'nežinomos versijos mikroprogramoje neperskaitomas: jos plane ({table}) nėra lango adresu {address}, todėl jam niekas neaktyvuota',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'langas pateikė pasenusio skaitytuvo deskriptoriaus baitus — žodis 0 {word} su atstatymu {hex} yra 0x14000000 vektorių lentelė, o ne šio lizdo turinys, todėl iš jo niekas neanalizuota: {remedy}',
  'read.reason.spentReader': 'kameros lizdų nepavyko nuskaityti — {remedy}',
  'read.spentRemedy':
    'langų skaitytuvas šiam paleidimui galėjo būti išnaudotas; išjunkite ir vėl įjunkite kamerą ir bandykite dar kartą',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'kameros aktyvaus lizdo žodžio (fw info roots, selektorius 10) nepavyko nuskaityti',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'kameros aktyvaus lizdo žodis yra {word}, o tai neatitinka jokio lizdo',
  'checkKey.unnamed.cfg0NotRead':
    'paleidimo konfigūracijos žodis nenuskaitytas, todėl nežinoma, ar paleidyklė patikrino {bank:acc} prieš jį paleisdama',
  'checkKey.unnamed.noZeroSum':
    'kamera nurodo, kad paleido {bank:acc}, bet šiame nuskaityme {bank:nom} neiššifruojamas į nulinę žodžių sumą',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'kamera nurodo, kad paleido {bank:acc}, kurį paleidimo konfigūracijos žodis {word} palieka paskutiniam, todėl paleidyklė jį paleido be patikros, bet šiame nuskaityme {bank:nom} neiššifruojamas į nulinę žodžių sumą',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (įvertis {score} po nuskaitymo, pagal toliau pateiktus įrodymus)',
  'report.detectedAmbiguous':
    '{family} (įvertis {score} po nuskaitymo, pagal toliau pateiktus įrodymus; dviprasmiška)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'taip',
  'report.cell.no': 'ne',
  'report.cell.notApplicable': 'netaikoma',
  'report.cell.unknown': 'nežinoma',
  'report.cell.recoveryOnly': 'tik atkūrimui',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'balinimo konstanta K',
  'report.keyRow.store': 'saugojimo raktas',
  'report.keyRow.check': 'tikrinimo raktas',
  'report.keyRow.table': 'raktų lentelė',
  'report.keyRow.keys': 'raktai',
  'report.keyRow.a': 'raktas A',
  'report.keyRow.b': 'raktas B',
  'report.keyRow.tableAt': 'lentelė adresu',
  'report.key.notIdentified': '(neatpažinta)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} kandidatas, nė vienas nepatvirtintas',
    few: '{count} kandidatai, nė vienas nepatvirtintas',
    many: '{count} kandidato, nė vienas nepatvirtintas',
    other: '{count} kandidatų, nė vienas nepatvirtintas',
  },
  'report.key.tableAt': '{offset} paleidyklės bloke, patvirtinta pagal lizdą',
  'report.key.plainChain':
    'nereikia: lizdai saugomi kaip neužšifruota mikroprograma, todėl lizdas skaitomas ir rašomas toks, koks yra',
  'report.key.tableRefused2016':
    'nenuskaityta — šioje linijoje paleidyklės blokas (0x14000000) atmetamas kiekvienu kanalu',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, įvardytas pagal {bank:acc} — lizdą, kurį, kameros teigimu, ji paleido po paleidyklės patikros',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, nustatytas pagal {bank:acc} — lizdą, kurį, kameros teigimu, ji paleido: paleidyklė tą lizdą paleidžia be patikros ir vykdo jį su raktu, kuriuo tikrina kitus lizdus',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' ({pair} blokas 1)',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'Compact PRO 1.0.3.x 9 Hz poros',
  'keyPair.cp1032ff': 'Compact PRO 1.0.3.x FF poros',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'neįvardytas — {why}',
  'report.checkKey.couldNotName': 'nuskaitymas negalėjo jo įvardyti',
  'report.storeKey.checkKeyUnnamed':
    'raktas, kuriuo paleidyklė tikrina lizdą (šiame nuskaityme neįvardytas): programa kiekvieną įrašomą lizdą saugo su tuo raktu',
  'report.storeKey.checkKey':
    '{key}: programa kiekvieną įrašomą lizdą saugo su raktu, kuriuo tikrina jos paleidyklė',
  'report.storeKey.unknown':
    'nežinomas — paleidyklės blokas, kuriame yra įrenginio rakto vieta, nenuskaitytas',
  'report.storeKey.keyBUnidentified':
    'Raktas B (įrenginio raktas neužprogramuotas; pats raktas B neatpažintas)',
  'report.storeKey.keyB': 'Raktas B (įrenginio raktas neužprogramuotas)',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain': 'paruošiamas neužšifruotas (atvaizdas toks, koks yra, be rakto)',
  'report.staged.slotKeystream': 'paruošiamas su paties atvaizdo rakto bloku 0',
  'report.staged.keyA':
    'paruošiamas su raktais, gautais iš paleisto lizdo ir veikiančios programos',
  'report.staged.ffVendor':
    'paruošiamas taip, kaip gamintojo programa paruošia 16 Hz FF atvaizdą (atvaizdas XOR jo paties rakto blokas 0), o kamera jį saugo su raktu B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Atsarginė kopija: blokas {address}',
  'progress.backupDone': 'Atsarginė kopija: perskaityti visi blokai',
  'progress.checkBlock': 'Patikra: blokas {address}',
  'progress.checkDone': 'Patikra: perskaityti visi blokai',
  'progress.writingBank': 'Įrašomas {bank:nom}',
  'progress.restoringBank': 'Atkuriamas {bank:nom}',
  'progress.staged': '{label}: paruošta {done}/{total} B',
  'progress.wholeFlash': 'Visos flash atminties nuskaitymas: {got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'skaitoma {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'skaitoma {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Baigta — nuskaityta langų: {ok}/{total}.',
  'progress.readingBank': 'Skaitomas {bank:nom} ...',
  'progress.analysing': 'Analizuojama ...',
  'progress.probeSelector': 'tikrinamas selektorius {selector} ...',
  'progress.selectorsArmed':
    'Baigta — aktyvuota selektorių: {armed}/{span}, su duomenimis: {withData}.',
  'progress.recoveringKey': 'iššifravimas: atkuriamas raktas adresui {address} ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} {address} (subcmd {subcmd}): nuskaityti nepavyko — {error}',
  'slots.read.refusedBuild':
    'atsisakoma skaityti mikroprogramos lizdus: {reason}. Be versijos skaitymo niekas nebuvo išsiųsta, todėl jokio lizdo nepaliesta.',
  'slots.backup.notSaved':
    'atsarginė kopija {file} neišsaugota, todėl niekas neįrašyta. Įrašymas niekada nevykdomas, kol pirmiausia neišsaugota jo atsarginė kopija; bandykite dar kartą, kai ją bus galima išsaugoti.',
  'slots.backup.notSavedWhy':
    'atsarginė kopija {file} neišsaugota ({error}), todėl niekas neįrašyta. Įrašymas niekada nevykdomas, kol pirmiausia neišsaugota jo atsarginė kopija; bandykite dar kartą, kai ją bus galima išsaugoti.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'didelė sparta (480 Mbit/s)',
  'usb.speed.full': 'visa sparta (12 Mbit/s)',
  'usb.speed.code': 'kodas {code}',
} satisfies Translation<'core', 'lt'>;
