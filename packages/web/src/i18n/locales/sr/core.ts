/**
 * Namespace `core`, srpski (sr), translated from the English source: sentences that `@seek-fw/core` makes and
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
    'kamera ostaje otključana dok joj se ne isključi napajanje, a drugi alati je do tada mogu pogrešno pročitati; isključite je i ponovo uključite pre nego što ih upotrebite',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': 'prvo {first}, zatim {second}, zatim {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'nije pročitan',
  'boot.verdict.checkKeyUnnamed':
    'nije mogao da se proveri: ključ pod kojim njegov butloder proverava slot nije imenovan',
  'boot.cfg0NotRead':
    'reč konfiguracije pokretanja (cfg[0]) nije pročitana, pa nije poznato iz kog slota se kamera sledeći put pokreće',
  'boot.select.unknown':
    'reč konfiguracije pokretanja je {word}, pa butloder prvo isprobava {first}, ali {bank} {verdict}, pa nije poznato koji se slot pokreće',
  'boot.select.first':
    'reč konfiguracije pokretanja je {word}, pa butloder prvo isprobava {first}, a on sadrži sliku koju butloder prihvata',
  'boot.select.second':
    'reč konfiguracije pokretanja je {word}, pa butloder prvo isprobava {first}; {first} ne sadrži sliku koju butloder prihvata, pa uzima {second}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'reč konfiguracije pokretanja je {word}, pa butloder prvo isprobava {first}; ni {first} ni {second} ne sadrži sliku koju butloder prihvata, pa pokreće {last}, koji ne proverava',
  'boot.select.lastTakes':
    'reč konfiguracije pokretanja je {word}, pa butloder prvo isprobava {first}; ni {first} ni {second} ne sadrži sliku koju butloder prihvata, pa uzima {last}, koji ne proverava',
  'boot.bootsNow': '{bank} je slot iz kog se kamera sada pokreće',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'sada pokrenut',
  'boot.notBooted': 'nije pokrenut',
  'boot.unknownWhy.checkKeyUnnamed':
    'ključ pod kojim njegov butloder proverava slot nije imenovan pri ovom čitanju',
  'boot.unknownWhy.noKeyTable':
    'tabela ključeva butlodera nije pročitana, pa ključevi koje isprobava ne mogu da se imenuju',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'Kamera se pokreće iz {bank:gen}. {why}.',
  'fpsBoot.holdsOne':
    '{bank}: sadrži zakrpu brzine kadrova, ali se ne pokreće, pa zakrpa ne deluje.',
  'fpsBoot.holdsTwo':
    '{banks} sadrže zakrpe brzine kadrova, ali se nijedan ne pokreće, pa zakrpe ne deluju.',
  'fpsBoot.wouldNotRun':
    'Krpljenje {target:gen} ne bi učinilo da se on pokreće, jer se kamera umesto toga pokreće iz {bank:gen}.',
  'fpsBoot.patchRunning':
    'Zakrpite i {bank} (slot koji se pokreće): tek tada zakrpa brzine kadrova deluje.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank}: ne može da se zakrpi ovde ({reason}), pa zakrpa brzine kadrova u drugom slotu ne deluje na ovoj kameri.',

  /* ---- backup: the zip saved before a bank write (slots/backup); `{name}` is the bank inside a sentence ("slot B"): each is an item of backup.plan.* ---- */
  'backup.bank.notInPlan': '{name} (nije u planu ovog izdanja: zip to navodi)',
  'backup.bank.unsupported': '{name} (ovo izdanje ne može da ga pročita, {reason}: zip to navodi)',
  'backup.bank.empty':
    '{name} (prazan, svaki bajt 0xFF: zip to navodi, a upis ne prepisuje nikakav firmver)',
  'backup.bank.unread':
    '{name} (čitanje slotova nije stiglo do njega: zip navodi da li čitanje pre upisa stiže)',
  'backup.bank.noKey':
    '{name} (onako kako je sačuvan; ne otvara ga nijedan ključ koji je ovo čitanje pronašlo, pa nema dešifrovane datoteke)',
  'backup.bank.decrypted': '{name} (onako kako je sačuvan, i dešifrovan)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Pre bilo kakvog upisa, {banks} se ponovo čita i čuva u jednom zipu uz belešku o tome šta je koja datoteka: {file}.',
  'backup.plan.many':
    'Pre bilo kakvog upisa, {banks} se ponovo čitaju i čuvaju u jednom zipu uz belešku o tome šta je koja datoteka: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'šifrovano tako da ga uređaj čuva pod ključem koji sadrži pokrenuti slot',
  'staging.detail.slotKeystreamCiphertext':
    'šifrovano sopstvenim ključem za pripremu slike (blok ključeva 0); kamera ga čuva pod sopstvenim ključem slota',
  'staging.detail.plain': 'nešifrovano, bez šifre',
  'staging.detail.keyAKeystream':
    'slika 1.3.0.8 FF onako kako je priprema aplikacija proizvođača (XOR ključ A) — izdanje od 16 Hz je čuva pod ključem B, a ne ove bajtove',
  'staging.detail.verbatim': 'doslovno — bajtovi tačno onakvi kakvi su dati',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'nema čitanja',
  'copy.source.notInPlan': '{name} nije u planu ovog izdanja',
  'copy.source.notRead': '{name} nije pročitan ({reason}), pa nema slike za kopiranje',
  'copy.source.empty': '{name} je prazan: nema slike za kopiranje',
  'copy.source.foreign':
    '{name} ne sadrži sliku firmvera koju ovo čitanje prepoznaje, pa nema šta da se kopira',
  'copy.source.noKey':
    'nijedan ključ koji je ovo čitanje pronašlo ne otvara {name}, pa nema dešifrovane slike za kopiranje',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} na adresi {address}, onako kako ga je čitanje slotova dešifrovalo',
  'copy.fromVersion':
    '{name} na adresi {address}, firmver {version}, onako kako ga je čitanje slotova dešifrovalo',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'Slika je iz {name:gen}, onako kako ju je čitanje slotova dešifrovalo: {size} B, sha256 {sha256}.',
  'copy.noteVersion':
    'Slika je iz {name:gen}, onako kako ju je čitanje slotova dešifrovalo: firmver {version}, {size} B, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '{name} rezervne kopije (na adresi {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where} u potpunoj rezervnoj kopiji fleša {file}',
  'restore.fromVersion': '{where} u potpunoj rezervnoj kopiji fleša {file}, firmver {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'slika fleša od 4 MB',
  'restore.kind.preserve-run': 'datoteka sesije sa kartice 0.x/1.x',
  'restore.kind.dump': 'zip sa kartice „Iščitavanje i dešifrovanje 4.x/Nano“',
  'restore.kind.all-selectors': 'zip dugmeta „Iščitaj sve selektore“',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'sliku',
  'restore.decryptedTo.firmware': 'firmver {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'Izvor slike: {where} u datoteci {file} ({kind}): sačuvani sha256 {stored}, dešifrovano u {decrypted} od {size} B (sha256 {sha256}).',
  'restore.note.imageEntry':
    'Izvor slike: {where} u datoteci {file} ({kind}, unutrašnja datoteka {entry}): sačuvani sha256 {stored}, dešifrovano u {decrypted} od {size} B (sha256 {sha256}).',
  'restore.note.readBack':
    'Posle upisa, kontrolno pročitan slot se upoređuje sa bajtovima slota sačuvanim u rezervnoj kopiji.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'Identifikacioni blok rezervne kopije navodi ovu kameru (serijski broj {serial}).',
  'restore.note.sameBytes':
    '{name} već sadrži bajtove sačuvane u rezervnoj kopiji: upis vraća istu sliku.',
  'restore.warn.otherCamera':
    'Ova rezervna kopija izgleda kao da je sa druge kamere: njen identifikacioni blok navodi serijski broj {theirs}, a ova kamera je {camera}. Upisuje se samo slika {name:gen}; ništa od identiteta ili kalibracije te kamere se ne upisuje.',
  'restore.warn.noIdentity':
    'Ova rezervna kopija nema identifikacioni blok na {address}, pa ne može da se utvrdi sa čije kamere je pročitana.',
  'restore.warn.serialNotRead':
    'Serijski broj kamere nije pročitan, pa rezervna kopija (serijski broj {serial}) ne može da se uporedi sa njom.',
  'restore.warn.otherFirmware':
    '{where} sadrži firmver {version}, a kamera radi sa {camera}: vraćanje stavlja drugi firmver u slot.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank} nije kontrolno pročitan, pa se ne upoređuje sa rezervnom kopijom.',
  'restore.readBack.equal':
    '{bank} se pri kontrolnom čitanju bajt po bajt poklapa sa rezervnom kopijom.',
  'restore.readBack.differs':
    '{bank}: kontrolno čitanje se razlikuje od bajtova sačuvanih u rezervnoj kopiji u {count} B (prva razlika na {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, izveden iz pokrenutog {bank:gen}',
  'keys.derived.holds':
    '{key} (ključ za čuvanje), izveden iz pokrenutog {bank:gen}, koji sadrži {holds}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, izveden iz pokrenutog slota',
  'keys.derived.holdsUnnamed':
    '{key} (ključ za čuvanje), izveden iz pokrenutog slota, koji sadrži {holds}',
  'keys.ffVendor.staged':
    'slika 1.3.0.8 FF (16 Hz) onako kako je priprema aplikacija proizvođača: slika XOR njen sopstveni blok ključeva 0 (ključ A), prozor zaglavlja doslovno, u bilo koji slot; ključevi ove kamere se ne koriste',
  'keys.ffVendor.stored':
    'Ključ B: kamera ponovo šifruje otpremljene podatke blokom ključeva 1 i čuva sliku pod njim',
  'keys.imageBlock0.staged':
    'slika pod sopstvenim blokom ključeva 0 (pronađenim u slici po vrednosti), u bilo koji slot; ključevi ove kamere se ne koriste',
  'keys.imageBlock0.storedUnnamed':
    'ključ pod kojim njen butloder proverava slot (nije imenovan pri ovom čitanju); kamera pod njim ponovo šifruje otpremljene podatke',
  'keys.imageBlock0.stored':
    '{key}, ključ pod kojim njen butloder proverava slot; kamera pod njim ponovo šifruje otpremljene podatke',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED (nije testirano): nijedan butloder izdanja 16 Hz FF nije pročitan sa kamere, pa nije poznato da li se upisani slot pokreće. Na butloderu 0.9.0.0 raniji oblik ove slike pokretao se iz slota za oporavak R; ovaj oblik neće, jer taj butloder pokreće slot za oporavak R onakav kakav je sačuvan, bez dekodiranja.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'Slika 16 Hz FF šalje se u obliku koji čita samo izdanje {version} od 16 Hz. Ova kamera upisuje slot bez provere slike (tako kaže izvorni kôd njenog firmvera, i tako je uradio Compact sa 1.3.0.0 kada je isprobano), pa se očekuje da upiše bajtove onakve kakvi su poslati: slot tada sadrži sliku u obliku koji ova kamera ne može da pokrene.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Ništa ovde ne tvrdi da je kamera pokreće.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast': 'Sopstveni odgovori kamere kažu da radi sa izdanjem 16 Hz FF: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'proverava podatke pre nego što obriše slot, a ovi podaci prolaze tu proveru, pa može da upiše ove bajtove onakve kakvi jesu, u obliku koji njegov butloder ne može da pokrene: slot se možda neće pokretati (nije isprobano; rezervna kopija sačuvana pre upisa ga vraća)',
  'write.ff.outcome.refuses':
    'proverava podatke pre nego što obriše slot, a ovi podaci ne prolaze tu proveru, pa se očekuje da odbije ovaj upis pre nego što bilo šta upiše (kamera sa tim izdanjem je na isti način odbila raniji oblik ove slike)',
  'write.ff.runsSlow': 'Kamera radi sa izdanjem {version} od 8 Hz: {why}. To izdanje {outcome}.',
  'write.ff.buildUnknown':
    'Sopstveni odgovori kamere ne kažu sa kojim izdanjem {version} radi: {why}. Ako radi sa izdanjem 16 Hz FF, prihvata ove podatke. Ako radi sa izdanjem od 8 Hz, to izdanje {outcome}.',
  'write.raw.asGiven':
    'Sirovi podaci: šalju se tačno onakvi kakvi su dati. Ništa ovde ne proverava da li mogu da se pokrenu.',
  'write.raw.ffStagedForm':
    'Ovi podaci su pripremljeni oblik 1.3.0.8 FF (slika XOR blok ključeva 0, zbir reči 0xFFFF). Kamera čuva sliku pod ključem B, pa se kontrolno čitanje proverava prema tim bajtovima.',
  'write.raw.noStaging':
    'Ovo izdanje ne navodi oblik pripreme za slot, pa provere butlodera ne mogu da se navedu.',
  'write.raw.reencrypts':
    'Uređaj dekodira ove podatke i ponovo šifruje ono što čuva, pa sačuvani bajtovi nisu predviđeni. Kontrolno čitanje se proverava kao slika u koju se dešifruje, gde to može da se kaže.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'Butloder bi odbio ove podatke: {failure}.',
  'write.raw.stageKeyUnchecked':
    'Ključ za pripremu iz 2016. godine (blok ključeva 0) nije u sirovim bajtovima, pa se dešifrovani zbir reči ovih podataka ovde ne proverava.',
  'write.image.rekeyRisk':
    '{name} već sadrži sliku koju butloder ne može da prihvati. Ovaj upis dovodi do istog stanja.',
  'write.ack.recovery':
    'Slot za oporavak R: upis u njega traži da potvrdite rizik. Ništa ovde ne proverava da li se kamera posle toga pokreće.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: upis u njega traži da potvrdite rizik, a kamera posle sledećeg isključivanja napajanja pokreće šta god on sadrži.',
  'write.ack.bootUnnamed': 'Pokrenuti slot nije mogao da se imenuje, pa se ovaj smatra pokrenutim',
  'write.ack.recoveryFallback':
    'Slot za oporavak R je krajnja rezervna kopija kojoj se butloder vraća',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'prazno/0: prednost ima slot A, zatim B, zatim slot za oporavak',
  'boot.cfg0.modernB': 'prednost ima slot B, zatim A, zatim slot za oporavak',
  'boot.cfg0.modernRecovery': 'prednost ima slot za oporavak, zatim A, zatim B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'nije poznato — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  /** `{verdict}` is one of upgrade.verdict.*. `{name}` here is the bank inside a sentence ("slot B"); in upgrade.verdict.* it starts a sentence ("Slot B"). */
  'upgrade.whileRecovery':
    'Kamera radi iz svog slota za oporavak, a njena sopstvena nadogradnja upisuje u {name}, iz kog ne radi. {verdict} Ovo je samo upozorenje: ništa ovde ne sprečava nadogradnju.',
  'upgrade.verdict.notRead':
    '{name} nije mogao da se pročita pri ovoj proveri, pa nije poznato šta sadrži.',
  'upgrade.verdict.blank': '{name} je prazan, pa nadogradnja upisuje u prazan slot.',
  'upgrade.verdict.bootableSame':
    '{name} sadrži istu ispravnu sliku za pokretanje kao slot iz kog kamera radi, a nadogradnja je zamenjuje. {name} ostaje neupotrebljiv za pokretanje ako se nadogradnja prekine na pola.',
  'upgrade.verdict.bootable':
    '{name} sadrži ispravnu sliku za pokretanje, a nadogradnja je zamenjuje. {name} ostaje neupotrebljiv za pokretanje ako se nadogradnja prekine na pola.',
  'upgrade.verdict.unknown':
    '{name}: pri ovom čitanju nije poznato da li može da se pokrene, pa nadogradnja može da zameni sliku koju bi kamera pokrenula.',
  'upgrade.verdict.notBootable':
    '{name} se pri ovom čitanju ne prikazuje kao slot koji može da se pokrene, pa nadogradnja ne zamenjuje nijednu sliku koju bi kamera pokrenula.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — slot u koji je butloder ušao pri ovom pokretanju, kako ga beleži',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'nije pročitano',
  'report.lastStart.noBank': 'kamera prijavljuje {word}, što ne označava nijedan slot',
  'report.lastStart.entered': 'kamera prijavljuje da je ušla u {bank} (reč aktivnog slota {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'nema verzije',
  'running.why.otherVersion': 'kamera prijavljuje {version}, a samo {only} ima dva izdanja',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'kamera nije odgovorila na ocene slotova (GetFirmwareInfo, selektori 6, 7, 8)',
  'running.why.notRead':
    'slot od kog ocene zavise nije pročitan, pa odgovori ne mogu da se predvide',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'kamera odgovara {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers}, što je odgovor izdanja 1.3.0.8 od 8 Hz za ove slotove ({predicted})',
  'running.why.ff':
    '{answers}, što je odgovor izdanja 1.3.0.8 FF od 16 Hz za ove slotove ({predicted})',
  'running.why.both':
    '{answers}, a oba izdanja za ove slotove odgovaraju upravo tako, pa ih slotovi ne razlikuju',
  'running.why.neither':
    '{answers}, što ne odgovara nijednom izdanju (8 Hz: {plain}; 16 Hz FF: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'Zaglavlje ove slike ne navodi verziju firmvera, pa ne može da se utvrdi da li je to izdanje sa kojim kamera radi ({camera}). Proverite da li je to slika koju nameravate da upišete.',
  'imageBuild.otherVersion': 'Ova slika je firmver {image}; kamera radi sa {camera}.',
  'imageBuild.otherVersionTaken':
    'Ova slika je firmver {image}; kamera radi sa {camera}. Na ovoj liniji kamera proverava samo da li je slika ispravno oblikovana (zaglavlje i zbir reči), a ne njenu verziju, pa prihvata ovu sliku, i kada se pokrene iz ovog slota, radi sa {image}.',
  'imageBuild.otherVersionUnchecked':
    'Ova slika je firmver {image}; kamera radi sa {camera}. Nije provereno da li ova kamera prihvata drugo izdanje i da li ga pokreće.',
  'imageBuild.otherBuild':
    'Ova slika je izdanje {version} od 8 Hz; kamera radi sa izdanjem {version} FF od 16 Hz. Izdanje od 16 Hz pri potvrdi upisa proverava podatke prema sopstvenom FF obliku i odbija one koji ne prođu, pre nego što obriše slot (prema njegovom izvornom kôdu). Upis izdanja od 8 Hz u njega nije isproban na kameri.',
  'imageBuild.runningUnknown':
    'Ova slika je izdanje {version} od 8 Hz. Kamera radi sa {version}, koje postoji kao izdanje od 8 Hz i kao izdanje FF od 16 Hz, a njeni sopstveni odgovori nisu rekli sa kojim radi, pa ne može da se utvrdi da li je ovo njeno izdanje.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': 'podaci imaju {size} B, premalo da bi sadržali zaglavlje na 0x200',
  'bootFail.noMagic':
    'nema magične reči slike na 0x200 (pronađeno {found}, butloderu treba {needs})',
  'bootFail.lengthOutside': 'header.length {length} je izvan podataka od {size} B',
  'bootFail.lengthNotPayload': 'header.length {length} nije dužina podataka {size}',
  'bootFail.overStage': '{size} B je više od {max} B koliko prima priprema',
  'bootFail.plainSum': 'sačuvani zbir reči je {sum}, a butloderu iz 2014. treba 0',
  'bootFail.noFooter': 'nema podnožja na {offset}: podaci se završavaju na {end}',
  'bootFail.footerNotCode':
    'podnožje na {offset} nije „CODE“ — butloder uzima svoj segmentirani učitavač',
  'bootFail.footerLength': 'dužina podnožja nije jednaka header.length {length}',
  'bootFail.keyASum':
    'dešifrovano ključem A ove kamere zbir reči je {sum}, a butloderu treba {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'potvrđen kontrolnim zbirom',
  'keyConfidence.structural': 'potvrđen samo tabelom vektora',
  'keyConfidence.unverified': 'nije potvrđen',
  /** `{sum}` is hex. */
  'keyCheck.family': 'ključ potvrđen kontrolnim zbirom {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'ključ {phrase}; kontrolni zbir {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'pripremljeno pod sopstvenim ključevima kamere',
  'staging.phrase.slotKeystreamCiphertext': 'pripremljeno pod sopstvenim ključem slike',
  'staging.phrase.plain': 'pripremljeno nešifrovano',
  'staging.phrase.keyAKeystream':
    'pripremljeno onako kako aplikacija proizvođača priprema FF sliku (XOR ključ A)',
  'staging.phrase.verbatim': 'poslato kako je dato',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank, inside the sentence ("slot A"); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    'upisano i potvrđeno {size} B u {name} na adresi {address}, {staged}; status potvrde {status}',
  'written.noReadWindow':
    'ovo izdanje ne navodi prozor čitanja za slot, pa ništa nije kontrolno pročitano',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'kontrolno čitanje nije uspelo: {error}',
  'written.readBack': 'kontrolno pročitano {size} B, SHA-256 {sha256}',
  'written.verifyOff': 'provera je isključena: slot nije kontrolno pročitan',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'bajtovima za koje je plan predvideo da će ih slot sadržati (slikom onako kako je čuva izdanje od 16 Hz, a ne poslatim bajtovima)',
  'readBack.reference.asSent':
    'bajtovima za koje je plan predvideo da će ih slot sadržati (bajtovima onakvim kakvi su poslati)',
  'readBack.sizeDiffers':
    'kontrolno čitanje ima {size} B, a plan je predvideo {predictedSize} B: slot se NE poklapa sa {reference}',
  'readBack.matchesFolded':
    'slot sadrži sliku onako kako je čuva izdanje od 16 Hz (a ne poslate bajtove), a ostatak slota je obrisan',
  'readBack.matches':
    'slot se poklapa sa bajtovima koje je plan predvideo (nešifrovani lanac iz 2014. programira tačno ono što mu se pošalje)',
  'readBack.differs': 'slot se NE poklapa sa {reference} (prva razlika na {offset})',
  'readBack.noHeader':
    'kontrolno čitanje ne sadrži zaglavlje slike na {offset} (magična reč {magic}), pa se slot NE dešifruje u očekivanu sliku',
  'readBack.lengthDiffers':
    'zaglavlje kontrolnog čitanja navodi {length} B, a slika iz plana ima {imageLength} B: slot se NE dešifruje u očekivanu sliku',
  'readBack.tooShort':
    'kontrolno čitanje ima {size} B, premalo za sliku od {length} B: slot se NE dešifruje u očekivanu sliku',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'tokom ključa izračunatim iz kontrolnog čitanja ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': 'slot se dešifruje u očekivanu sliku ({length} B) pod {recovered}',
  'readBack.decryptDiffers':
    'slot se NE dešifruje u očekivanu sliku: prva razlika na pomeraju slike {offset} pod {recovered}',
  'readBack.rawNotCompared':
    'sirovi bajtovi: kontrolno čitanje je prijavljeno, ali nije upoređeno (bajtovi se ne dešifruju u nešifrovanu sliku koja u ovom obliku može da se predvidi, a uređaj ponovo šifruje ono što čuva)',
  'readBack.notCompared':
    'poređenje nije bilo moguće: plan ne predviđa ni sačuvane bajtove ni nešifrovanu sliku',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'ključ A',
  'keyName.keyA:gen': 'ključa A',
  'keyName.keyA:dat': 'ključu A',
  'keyName.keyA:acc': 'ključ A',
  'keyName.keyA:ins': 'ključem A',
  'keyName.keyA:loc': 'ključu A',
  'keyName.keyB': 'ključ B',
  'keyName.keyB:gen': 'ključa B',
  'keyName.keyB:dat': 'ključu B',
  'keyName.keyB:acc': 'ključ B',
  'keyName.keyB:ins': 'ključem B',
  'keyName.keyB:loc': 'ključu B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'ključ uređaja',
  'keyName.perDevice:gen': 'ključa uređaja',
  'keyName.perDevice:dat': 'ključu uređaja',
  'keyName.perDevice:acc': 'ključ uređaja',
  'keyName.perDevice:ins': 'ključem uređaja',
  'keyName.perDevice:loc': 'ključu uređaja',
  'keyName.thePerDevice': 'ključ uređaja',
  'keyName.thePerDevice:gen': 'ključa uređaja',
  'keyName.thePerDevice:dat': 'ključu uređaja',
  'keyName.thePerDevice:acc': 'ključ uređaja',
  'keyName.thePerDevice:ins': 'ključem uređaja',
  'keyName.thePerDevice:loc': 'ključu uređaja',
  'keyName.applicationKeyA': 'ključ A aplikacije',
  'keyName.applicationKeyA:gen': 'ključa A aplikacije',
  'keyName.applicationKeyA:dat': 'ključu A aplikacije',
  'keyName.applicationKeyA:acc': 'ključ A aplikacije',
  'keyName.applicationKeyA:ins': 'ključem A aplikacije',
  'keyName.applicationKeyA:loc': 'ključu A aplikacije',
  'keyName.applicationKeyB': 'ključ B aplikacije',
  'keyName.applicationKeyB:gen': 'ključa B aplikacije',
  'keyName.applicationKeyB:dat': 'ključu B aplikacije',
  'keyName.applicationKeyB:acc': 'ključ B aplikacije',
  'keyName.applicationKeyB:ins': 'ključem B aplikacije',
  'keyName.applicationKeyB:loc': 'ključu B aplikacije',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'blok ključeva 1',
  'keyName.block1:gen': 'bloka ključeva 1',
  'keyName.block1:dat': 'bloku ključeva 1',
  'keyName.block1:acc': 'blok ključeva 1',
  'keyName.block1:ins': 'blokom ključeva 1',
  'keyName.block1:loc': 'bloku ključeva 1',
  'keyName.theDeviceKey': 'ključ uređaja',
  'keyName.theDeviceKey:gen': 'ključa uređaja',
  'keyName.theDeviceKey:dat': 'ključu uređaja',
  'keyName.theDeviceKey:acc': 'ključ uređaja',
  'keyName.theDeviceKey:ins': 'ključem uređaja',
  'keyName.theDeviceKey:loc': 'ključu uređaja',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'nepoznat ključ',
  'keyName.unknown:gen': 'nepoznatog ključa',
  'keyName.unknown:dat': 'nepoznatom ključu',
  'keyName.unknown:acc': 'nepoznat ključ',
  'keyName.unknown:ins': 'nepoznatim ključem',
  'keyName.unknown:loc': 'nepoznatom ključu',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'nešifrovani lanac iz 2014. godine: svaki slot se čuva nešifrovan, pa se ne izvodi ključ za otpremanje; otpremljeni podaci su slika kakva jeste',
  'keys.evidence.ffVendor':
    'izdanje 1.3.0.8 FF (16 Hz): nijedan slot koji je ovo čitanje otvorilo nije sačuvan nešifrovan, pa se ne pokazuje da je kamera na nešifrovanom lancu iz 2014. godine; FF slika se upisuje u obliku proizvođača, sirovi bajtovi se šalju kako su dati, a nešifrovana slika od 8 Hz se ne upisuje',
  'keys.evidence.ffUntested':
    'upis FF slike nudi se uz upozorenje UNTESTED: u zbirci nema pravog butlodera za ovo izdanje, pa nije izmereno da li se upisani slot pokreće',
  'keys.evidence.line2016':
    'linija Compact PRO iz 2016. godine: otpremljeni podaci su slika XOR tok ključa njenog sopstvenog bloka ključeva 0, pronađenog u slici po vrednosti, pa ih ne pravi nijedan ključ ove kamere',
  'keys.evidence.checkKeyUnnamed':
    'kamera dešifruje otpremljene podatke tim ključem i ponovo ih šifruje ključem pod kojim njen butloder proverava slot; taj ključ nije imenovan pri ovom čitanju, a upisu nije potreban: slot se kontrolno čita kao slika u koju se dešifruje',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'kamera dešifruje otpremljene podatke tim ključem i ponovo ih šifruje ključem pod kojim njen butloder proverava slot; taj ključ nije imenovan pri ovom čitanju ({why}), a upisu nije potreban: slot se kontrolno čita kao slika u koju se dešifruje',
  'keys.evidence.checkKeyNamed':
    'kamera dešifruje otpremljene podatke tim ključem i ponovo ih šifruje {key:ins} {hex}, ključem pod kojim njen butloder proverava slot, pa se svaki slot koji ona upiše čuva onako kako ga butloder prihvata',
  'keys.evidence.checkKeyInferred':
    'kamera dešifruje otpremljene podatke tim ključem i ponovo ih šifruje {key:ins} {hex}, ključem pod kojim njen butloder proverava slot (zaključeno iz {bank:gen}, slota u koji kamera prijavljuje da je ušla, a u koji je butloder ušao bez provere), pa se svaki slot koji ona upiše čuva onako kako ga butloder prihvata',
  'keys.evidence.checkKeyNamedFrom':
    'kamera dešifruje otpremljene podatke tim ključem i ponovo ih šifruje {key:ins} {hex}, ključem pod kojim njen butloder proverava slot (imenovano na osnovu {bank:gen}, slota u koji kamera prijavljuje da je ušla), pa se svaki slot koji ona upiše čuva onako kako ga butloder prihvata',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'pokrenuti slot nije mogao da se imenuje, pa ključ pod kojim se slot čuva ne može da se pročita iz njega',
  'keys.refused.notDerived': 'ključevi nisu mogli da se izvedu',
  'keys.refused.notDecrypted':
    'pokrenuti {bank} se ne dešifruje u sliku, pa ključ pod kojim se čuva ne može da se pročita',
  'keys.refused.noBootKey':
    'pokrenuti {bank} se ne dešifruje nijednim ključem koji butloder isprobava (njegovim ključem A ni ključem za čuvanje), pa ključ pod kojim se slot čuva ne može da se pročita iz njega',
  'keys.refused.keyNotInTable':
    'pokrenuti {bank} se dešifruje {key:ins}, ali tabela ključeva ove kamere ne sadrži taj ključ, pa ne može da se upisuje pod njim',
  'keys.refused.noApplicationPair':
    'aktivna aplikacija ({bank}, firmver {firmware}) ne sadrži nijedan od poznatih parova ključeva (par butlodera i dekodirane parove aplikacija), svaku polovinu tačno jednom, pa njen ključ A ne može da se pronađe u njenoj slici',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'aktivna aplikacija ({bank}, firmver {firmware}) ne sadrži nijedan od poznatih parova ključeva (par butlodera i dekodirane parove aplikacija), svaku polovinu tačno jednom, pa njen ključ A ne može da se pronađe u njenoj slici (ključ A butlodera javlja se {count} put, njegov ključ B {keyB})',
    few: 'aktivna aplikacija ({bank}, firmver {firmware}) ne sadrži nijedan od poznatih parova ključeva (par butlodera i dekodirane parove aplikacija), svaku polovinu tačno jednom, pa njen ključ A ne može da se pronađe u njenoj slici (ključ A butlodera javlja se {count} puta, njegov ključ B {keyB})',
    other:
      'aktivna aplikacija ({bank}, firmver {firmware}) ne sadrži nijedan od poznatih parova ključeva (par butlodera i dekodirane parove aplikacija), svaku polovinu tačno jednom, pa njen ključ A ne može da se pronađe u njenoj slici (ključ A butlodera javlja se {count} puta, njegov ključ B {keyB})',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'aktivna aplikacija ({bank}, firmver {firmware}) proverava otpremljene podatke pod sopstvenim ključevima pre nego što ih programira (dekodirani izvorni kôd ovog izdanja isprobava otpremljene podatke pod svojim ključem A i ključem za čuvanje, kao što njen butloder isprobava slot), a ključ pod kojim upisi čuvaju, {key} ({hex}), nije ni njen ključ A ni ključ za čuvanje, pa bi kamera odbila otpremljene podatke sa 0x50000 pre nego što bilo šta obriše',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'nijedan slot se ne dešifruje u kontrolni zbir {sum} porodice {family}',
  'writeRefusal.keyTable': 'tabela ključeva ove kamere nije mogla da se potvrdi',
  'writeRefusal.whitening':
    'tabela ključeva ove kamere razrešava se pod K={k}, ali {family} šifruje pod K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily': 'dokazi kažu da je ova kamera {detected}, a ne {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'u ovu kameru ne može da se upisuje odavde: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Seek izdanja iz 2018. i kasnija (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 i Nano 300. Iščitavanje čita 63 od 64 bloka fleša bez ikakvog otključavanja; nijedno čitanje na ovim izdanjima ne dopire do bloka na {block}. Firmver se čuva šifrovan. Slotovi se upisuju jedan po jedan na kartici „Rad sa slotovima firmvera“.',
  'family.summary.early':
    'Compact kamere iz 2014. godine starije od 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 i 0.7.0.8. Njihov firmver ne može da odgovori na čitanje koje šalje iščitavanje, pa ih „Pokreni iščitavanje“, „Iščitaj sve selektore“, potpuno čitanje kartice Info i kartica „Rad sa slotovima firmvera“ odbijaju posle čitanja verzije; na 0.3.0.1 bi komanda kojom iščitavanje počinje umesto toga pripremila nadogradnju firmvera. Sesija na kartici 0.x/1.x čita 0.7.0.7 i 0.7.0.8 drugom komandom na koju ta dva izdanja odgovaraju. Kopija fleša napravljena na drugi način dešifruje se kao i obično.',
  'family.summary.compact2016':
    'Izdanja Compact PRO 1.0.3.x (1.0.3.0 i 1.0.3.2). Na čitanja odgovaraju tačno kao Compact kamere iz 2014. godine, uključujući token za otključavanje, pa se razlikuju po verziji i po tome kako čuvaju slotove: šifrovano, dok su slotovi iz 2014. godine nešifrovani. Kamera 1.0.3.x čita se pod ovom porodicom od početka. Sesija na kartici 0.x/1.x čita ceo fleš, a slotovi se upisuju jedan po jedan na kartici „Rad sa slotovima firmvera“.',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    'Compact kamere iz 2014. godine od 0.8.0.0 do 1.3.0.8, među njima i izdanje 1.3.0.8 FF od 16 Hz. Obična kamera daje manje od polovine svog fleša, deo samo uz token za otključavanje koji alati šalju; sesija na kartici 0.x/1.x čita ostatak preko privremene zakrpe. Slotovi se čuvaju nešifrovani, osim na izdanju FF. Kamera Compact PRO 1.0.3.x čita se kao compact-2016 i prelazi ovde samo kada je slot sačuvan nešifrovan ili se dešifruje u {sum}, kao kod izdanja FF. Slotovi se upisuju na kartici „Rad sa slotovima firmvera“ na izdanjima na kojima je sesija na kartici 0.x/1.x izmerena; svako drugo izdanje 0.x ili 1.x se samo čita.',
  'family.summary.generic':
    'Kamera kojoj ne odgovara nijedna druga porodica. `seek-fw dump` je čita listom blokova za 4.x (kartica 4.x/Nano je odbija), a dešifrovanje izračunava ključ iz same slike, pa ni jedno ni drugo ne zavisi od pretpostavke. Nijedan slot se ne upisuje: kartica „Rad sa slotovima firmvera“ je odbija dok se kamera ne prepozna.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'zaglavlje slike navodi',
  'detect.source.camera': 'kamera prijavljuje',
  'detect.plainArmedNotInForce':
    'obična 2-bajtna komanda BeginFirmwareUpgrade aktivirala je zaštićeni slot, pa autentifikovani kanal čitanja nije na snazi',
  'detect.modern.plainRefused':
    'obična 2-bajtna komanda BeginFirmwareUpgrade za zaštićeni slot je ODBIJENA, što ne radi nijedno izdanje na ovoj liniji — njegova obrada nema proveru tokena i prihvata običan kanal na svakom slotu',
  'detect.modern.authArmed':
    'zaštićeni slot je aktiviran na 18-bajtnom autentifikovanom selektoru; tu niko nije isprobao običan, pa to ne smešta ovu kameru van ove linije',
  'detect.modern.legacyVersion':
    '{said} firmver {version}, koji je na staroj liniji 0.x / 1.x (drugačija linija numerisanja, a ne starija 4.x — i jedno od tih izdanja takođe daje zbir {sum})',
  'detect.modern.noSum':
    'nijedan slot se ne dešifruje u kontrolni zbir {sum} koji zahteva butloder ove porodice',
  'detect.modern.sum': 'jedan slot se dešifruje u kontrolni zbir {sum}',
  'detect.modern.version':
    'firmver {version} je na liniji posle 2018. godine koju pokriva ova mapa selektora (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'obična 2-bajtna komanda BeginFirmwareUpgrade aktivirala je zaštićeni slot, pa ovo nije zaključani stari firmver',
  'detect.modern.none': 'nema dokaza da je ova kamera na liniji posle 2018. godine',
  'detect.early.noVersion':
    'nijedna verzija firmvera nije prijavljena niti pronađena u zaglavlju slike',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'firmver {version} je {first} ili noviji, pa njegova RPC tabela ima getter za GetFeaturedFirmwareData i važi običan put čitanja',
  'detect.early.older':
    '{said} firmver {version}, koji je stariji od {first} — prvog izdanja čija tabela RPC metoda ima obradu čitanja (getter) za GetFeaturedFirmwareData',
  'detect.early.noWindow': 'i nijedan prozor nije mogao da se pročita, upravo kako to predviđa',
  'detect.generic.fallback':
    'rezervna varijanta: nijedna porodica firmvera nije pouzdano prepoznata, pa čitanja ostaju dostupna, a upisi ne',
  'detect.compact2016.early':
    'firmver {version} je stariji od 0.8.0.0 i nema obradu čitanja za GetFeaturedFirmwareData — to je early-compact, a ne ova porodica',
  'detect.compact2016.modernSum':
    'jedan slot se dešifruje u kontrolni zbir {sum}, koji nije cilj ove generacije',
  'detect.compact2016.plainArmed':
    'obična 2-bajtna komanda BeginFirmwareUpgrade aktivirala je zaštićeni slot, pa ova kamera nije na zaključanoj liniji koju ova porodica deli sa legacy-auth',
  'detect.compact2016.notLine': 'firmver {version} nije na liniji 0.x / 1.x',
  'detect.compact2016.storedPlain':
    'jedan slot je sačuvan nešifrovan — rešavanje toka ključa vraća stanje identiteta, pa su njegove sačuvane reči UPRAVO slika — a to je nešifrovani lanac iz 2014. godine; slotovi ove generacije su xorshift128 pod pravim ključem',
  'detect.compact2016.keyedZero':
    'slot sačuvan pod pravim xorshift128 tokom ključa dešifruje se u kontrolni zbir {sum}, a to je šifra ove generacije',
  'detect.compact2016.zeroSum':
    'jedan slot se dešifruje u kontrolni zbir {sum}, a to je cilj ove generacije',
  'detect.compact2016.refused':
    'i zaštićeni slot je odbio običnu 2-bajtnu aktivaciju, a to je zaključana obrada',
  'detect.compact2016.proLine':
    '{said} firmver {version}, sa linije 1.0.3.x kamere Compact PRO iz 2016. godine',
  'detect.compact2016.compactLine':
    '{said} firmver {version}, izdanje za Compact, a ne sa linije 1.0.3.x kamere Compact PRO',
  'detect.compact2016.lockedLine':
    '{said} firmver {version}, na liniji 0.x / 1.x koju ova generacija deli sa zaključanim starim firmverom',
  'detect.compact2016.bootloader2016':
    'butloder prijavljuje {version}, butloder generacije iz 2016. godine (1.2.0.0 je izmeren uz Compact PRO 1.0.3.0; butloder kamere Compact iz 2014. godine je 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'butloder prijavljuje {version}, po numeraciji generacije iz 2014. godine, a ne ove generacije',
  'detect.compact2016.none':
    'nije primećen nijedan slot koji se pod pravim ključem dešifruje u nulti kontrolni zbir',
  'detect.legacy.proLine':
    'ali firmver {version} je sa linije 1.0.3.x kamere Compact PRO iz 2016. godine, čiji slotovi koriste šifru compact-2016: provera prihvatanja ove porodice ne bi prošla ni za jedan od njih',
  'detect.legacy.early':
    'firmver {version} je stariji od 0.8.0.0: njegova RPC tabela nema obradu čitanja za GetFeaturedFirmwareData (pre 0.7.0.7 nikakvu, a na 0.7.0.7 i 0.7.0.8 samo setter) — to je early-compact, a ne ova porodica',
  'detect.legacy.keyedZero':
    'slot sačuvan pod pravim xorshift128 tokom ključa dešifruje se u {zero} — šifra kamere Compact PRO iz 2016. godine (compact-2016). Ova linija čuva svoje slotove nešifrovane sa zbirom reči 0 (lanac iz 2014. godine) ili usklađene na {sum} (Compact 1.3.0.8), a njena provera prihvatanja ne prolazi za takav slot',
  'detect.legacy.plainChain':
    'slot je sačuvan kao nešifrovani firmver čije se reči sabiraju u 0, onako kako ga pokreće butloder ove linije iz 2014. godine',
  'detect.legacy.refused':
    'kamera je odbila da otvori zaključani slot za nadogradnju kada je to traženo bez otključavanja, kao što radi samo ova generacija firmvera',
  'detect.legacy.unlocked':
    'i otvorila je isti slot kada je to traženo uz otključavanje, pa je otključavanje koje ova porodica šalje upravo ono koje ova kamera proverava',
  'detect.legacy.notLine': '{said} firmver {version}, koji nije na staroj liniji 0.x / 1.x',
  'detect.legacy.authOnly':
    'otvorila je zaključani slot za nadogradnju kada je to traženo uz otključavanje, kao što radi ova generacija firmvera; traženje bez otključavanja nije isprobano, pa samo ovo ne dokazuje generaciju',
  'detect.legacy.version':
    'firmver {version} je na staroj liniji 0.x / 1.x, koja je drugačija linija numerisanja od verzija aplikacija posle 2018. godine, a ne starija 4.x',
  'detect.legacy.none': 'ništa primećeno ne ukazuje na autentifikovani kanal čitanja',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'zadržano posle probe na kameri: tamo zakrpa nije povećala brzinu objavljivanja kadrova, a zatvarač je posle upisa okidao na svakom kadru',
  'fps.table.predates':
    'firmver {version} je stariji od 0.8.0.0: njegova RPC tabela nema obradu čitanja za GetFeaturedFirmwareData, komandu koju šalje čitanje slota, pa čitanje i upis slotova ne rade ni sa jednim slotom tog izdanja, i zakrpa se ne nudi',
  'fps.table.stageTwoFf':
    'stage two: izdanje 16 Hz FF priprema se onako kako ga priprema aplikacija proizvođača (slika XOR ključ A, čuvana pod ključem B), a ne kao nešifrovani bajtovi, pa njegova provera pripreme nije urađena i zakrpa se još ne nudi',
  'fps.table.stageTwo':
    'stage two: ova stavka nije u skupu stage two, pa njena provera pripreme nije urađena i zakrpa se još ne nudi',
  'fps.table.notOffered': 'nije ponuđeno',
  'fps.table.notImage':
    'ovo nije slika firmvera, pa se na nju ne odnosi nijedna zakrpa brzine kadrova',
  'fps.table.otherBuild':
    'slika je izdanje {image}, ali kamera prijavljuje {camera}; zakrpa se odbija umesto da se primeni na izdanje kojem ne odgovara',
  'fps.table.otherBuildNoVersion':
    'slika je izdanje {image}, ali kamera ne prijavljuje verziju; zakrpa se odbija umesto da se primeni na izdanje kojem ne odgovara',
  'fps.table.patched': 'zakrpa brzine kadrova je već primenjena: ova slika radi na {hz} Hz',
  'fps.table.earlierPatch':
    'ova slika sadrži raniju zakrpu brzine kadrova za {hz} Hz bez USB ispravke, a zakrpa se nikada ne primenjuje na zakrpljenu sliku: vratite originalnu sliku, pa je zakrpite',
  'fps.table.atRate': 'ovo izdanje već radi na {hz} Hz bez zakrpe',
  'fps.table.not4821':
    'ova slika prijavljuje izdanje Compact 4.8.2.1 (ili Compact XR 4.8.2.1, isto izdanje), ali nije originalna slika za koju je zakrpa brzine kadrova napisana (f96ac57eda75: njene komandne stranice od 68 bajtova, stabilna stranica 13), pa se za nju ne pravi zakrpa brzine kadrova',
  'fps.table.notInTable':
    'ova slika nije u tabeli zakrpa brzine kadrova, pa se za ovo izdanje ne pravi zakrpa brzine kadrova. Tabela navodi izdanja Compact od 0.7.0.8 do 1.3.0.8 (8 Hz; 0.7.0.8 odbija kôd za slotove), 1.3.0.8 (16 Hz FF), 4.8.1.7, 4.8.1.9, 4.8.2.1 i 4.16.1.7 FF i izdanja Compact PRO 1.0.3.x i 4.9.x; nijedno drugo izdanje nema stavku',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'plan ovog izdanja nema {bank}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank} ne može da primi dešifrovanu sliku na ovom izdanju: {reason}',
  'fps.plan.empty': '{bank} nema dešifrovanu sliku za krpljenje (prazan je)',
  'fps.plan.noImage':
    '{bank} nema dešifrovanu sliku za krpljenje (nije pročitan ili ga ne otvara nijedan ključ)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name} je upisan, ali se njegovo kontrolno čitanje ne razlikuje od sačuvanog slota samo onako kako je planirano, pa slotovi posle njega nisu upisani',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build (slots/capability-notes) ----
   * The page shows only this one; it leaves the others out (lib/page-hidden.ts), and the CLI prints them
   * in English. */
  'notes.unverified':
    'Samo čitanje. Raspored slotova je dekodirana tabela zaključane linije, ali za ovo izdanje nije izmeren nijedan oblik pripreme, pa nijedan upis nije planiran.',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'kamera nije prijavila verziju firmvera ({note}); broj komande ne znači isto na svakom Seek firmveru — na Compact 0.3.0.1 wire id 0x52, id koji aktivira prozor čitanja, jeste EnterBootloaderMode — pa dok verzija nije poznata, ne šalje se ništa osim GetErrorCode, GetOperationMode i GetFirmwareInfo, čitanja na koja svako izdanje odgovara na isti način',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo nije odgovorio ({error}) ni na jedno od {reads} čitanja u razmaku od {spacing} ms, u prozoru pokretanja od {window} ms; kamera koja se još pokreće odgovara u tom roku',
  'identity.note.neverTwice':
    'GetFirmwareInfo u {reads} čitanja nijednom nije odgovorio dvaput zaredom',
  'identity.note.noAnswer': 'GetFirmwareInfo nije odgovorio ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo nije odgovorio ({error}); odgovoreno je na {answered} od {reads} čitanja, nikada dva zaredom, pa nijedno od njih ne može da se razlikuje od zapisa koji je ranija komanda ostavila izabranim',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo je vratio {count} bajt, premalo za verziju',
    few: 'GetFirmwareInfo je vratio {count} bajta, premalo za verziju',
    other: 'GetFirmwareInfo je vratio {count} bajtova, premalo za verziju',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo je vratio {count} bajt, premalo za verziju; {context}',
    few: 'GetFirmwareInfo je vratio {count} bajta, premalo za verziju; {context}',
    other: 'GetFirmwareInfo je vratio {count} bajtova, premalo za verziju; {context}',
  },
  'identity.note.otherRecord':
    'prvo čitanje vratilo je drugi zapis ({version}), na kojem je ranija komanda ostavila selektor informacija o firmveru — to čitanje ga je poništilo',
  'identity.note.afterStartup': {
    one: 'odgovorio je posle {count} odbijenog čitanja tokom pokretanja',
    few: 'odgovorio je posle {count} odbijena čitanja tokom pokretanja',
    other: 'odgovorio je posle {count} odbijenih čitanja tokom pokretanja',
  },
  'identity.predates':
    'firmver {version} je stariji od protokola za iščitavanje: njegova tabela RPC metoda nema obradu čitanja za GetFeaturedFirmwareData (na 0.7.0.7 i 0.7.0.8 registrovana je samo kao setter, a pre toga wire id 0x4F je UploadFirmwareRowSize), pa se njom ne može pročitati nijedan prozor; na 0.3.0.1 wire id 0x52 je EnterBootloaderMode umesto BeginFirmwareUpgrade. Sesija na kartici 0.x/1.x umesto toga čita 0.7.0.7 i 0.7.0.8 preko wire id 0x58 (GetFeaturedData)',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'odbija se {operation}: {reason}',
  'identity.refusingNoVersion':
    'odbija se {operation}: {reason}. Ništa nije aktivirano. Isključite kameru, ponovo je priključite, sačekajte da se potpuno pokrene i pokušajte ponovo.',
  'identity.operation.dump': 'iščitavanje',
  'identity.operation.dumpAll': 'iščitavanje svih selektora',
  'identity.operation.readInfo': 'čitanje informacija o uređaju',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'slotovi se biraju posle rezervne kopije, koja ih čita — prvo napravite rezervnu kopiju',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'slotovi ne mogu da se promene kada je potvrda upisa izvršena ili pokušana: ova sesija upisuje: {banks}, a vraćanje vraća tačno njih',
  'preserve.banks.none': 'nijedan slot',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Upisano.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Pročitano. Čitljivi slotovi: {count}/{of}.',
  'status.readRefused':
    'Pročitano, ali nijedan slot ove kamere ne može da se upiše odavde — pogledajte dnevnik.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Verzija firmvera',
  'compare.field.imageId': 'ID slike',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'Početni SP',
  'compare.field.resetVector': 'Vektor resetovanja',
  'compare.field.size': 'Veličina',
  'compare.field.shaExpected': 'SHA-256 očekivane nešifrovane slike',
  'compare.field.sha': 'SHA-256 slike',
  'compare.field.shaNotStored':
    'SHA-256 očekivane nešifrovane slike (sačuvani bajtovi nisu predviđeni)',
  'compare.field.key': 'Ključ',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(nema slike)',
  'compare.notImage': '(nije slika)',
  'compare.notPredicted': '(nije predviđeno: uređaj odlučuje šta čuva)',
  'compare.plaintext': 'nema (nešifrovano)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'nije mogao dvaput da se pročita na isti način',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (ključ pod kojim butloder proverava slot zaključen je iz {bank:gen}, u koji je ušao bez provere) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered': '{bank}, kako ga kamera beleži (reč aktivnog slota {word})',
  'preserve.lastStart.notRead': 'nije poznato — reč aktivnog slota nije mogla da se pročita',
  'preserve.lastStart.noBank':
    'nije poznato — reč aktivnog slota je {word}, što ne označava nijedan slot',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'nije poznato — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'ne upisuje se — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'slika',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — može da se upiše',
  'preserve.bank.writablePatch': '{build} — može da se upiše; zakrpa menja {count} B',
  'preserve.bank.writableEdit': '{build} — može da se upiše; sadrži {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — može da se upiše; zakrpa menja {count} B; sadrži {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead':
    'rezervna kopija još nije pročitala slotove, pa nijedan slot ne može da se izabere',
  'preserve.choice.every': 'svaki slot koji sadrži sliku: {banks}',
  'preserve.choice.everyBlocked':
    'ne mogu da se upišu svi slotovi koji sadrže sliku: {bank} ne može — {reason}',
  'preserve.choice.noImage': 'nijedan slot ne sadrži sliku koju sesija može da upiše',
  'preserve.choice.nextStart': '{bank}, slot u koji ulazi sledeće pokretanje: {why}',
  'preserve.choice.nextStartRefused':
    'sledeće pokretanje ulazi u {bank} ({why}), a sesija ne može da ga upiše: {reason}',
  'preserve.choice.everyUnknownStart':
    'svaki slot koji sadrži sliku ({banks}): nije poznato u koji slot ulazi sledeće pokretanje ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'nije poznato u koji slot ulazi sledeće pokretanje ({why}), a {reason}; izaberite slot po imenu',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank} ne može da se upiše: {reason}',
  'preserve.choice.byName': '{banks}, slot izabran po imenu',
  'preserve.choice.warnNotPatched':
    'Sledeće pokretanje ulazi u {bank} ({why}), a ovaj izbor ga ne krpi: posle ponovnog pokretanja kamera pokreće sopstvenu sliku tog slota, pa se čitanje celog fleša zaustavlja pre nego što bilo šta pročita. Vraćanje i dalje vraća svaki upisani slot.',
  'preserve.choice.warnUnknownStart':
    'Nije poznato u koji slot ulazi sledeće pokretanje ({why}). Ako uđe u slot koji ovaj izbor ne krpi, čitanje celog fleša se zaustavlja pre nego što bilo šta pročita.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'još nije poznato',
  'preserve.build.firmware': 'firmver {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain': 'onako kako ga kamera čuva (ova kamera čuva firmver nešifrovan)',
  'preserve.stagedForm.oneKey': 'u obliku u kom ga kamera čuva (šifrovan ključem kamere)',
  'preserve.stagedForm.twoKeys': 'u obliku u kom ga kamera čuva (šifrovan sa dva ključa kamere)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'svaki upisani slot dobija nazad tačno one bajtove koje je rezervna kopija iz njega pročitala',
  'preserve.restoreForm.factoryStaged':
    'svaki upisani slot dobija nazad svoj originalni firmver, upisan u obliku u kom ga kamera čuva, pa slot na kraju bajt po bajt odgovara onome što je rezervna kopija pročitala',
  'preserve.restoreForm.none':
    'nije moguće na ovom izdanju: nijedan oblik originalnog firmvera ne prolazi sopstvenu proveru kamere i istovremeno se čuva kao originalni bajtovi, pa se sesija završava potpunom slikom, a zakrpa ostaje na mestu',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'nije moguće na ovom izdanju: zakrpljeni firmver ne može da pročita ceo fleš, pa sesija nema potpunu sliku koju bi dala',
  'preserve.drain.rotated': 'kamera ga daje rotiranog, a sesija ga vraća u pravi redosled',
  'preserve.drain.hazard': 'zakrpa na ovom izdanju izbegava čitanje koje ruši kameru',
  'preserve.drain.whole': 'ceo fleš od 4 MB jednim čitanjem, po {size} B',
  'preserve.drain.wholeNotes': 'ceo fleš od 4 MB jednim čitanjem, po {size} B; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'omogućava da komanda za čitanje kamere dopre do celog fleša od 4 MB, a ne samo do prvih 64 KB',
  'preserve.site.countPast':
    'omogućava da pozicija čitanja broji preko 64 KB, pa se čitanje ne vraća na početak',
  'preserve.site.keepPosition':
    'zadržava celu poziciju čitanja kada se ona pomeri posle svakog čitanja',
  'preserve.site.savePosition': 'čuva pomerenu poziciju čitanja u celosti',
  'preserve.site.clearPosition':
    'briše celu poziciju čitanja svaki put kada čitanje počne, pa kamera i dalje može da se čita posle čitanja celog fleša',
  'preserve.site.modeTwoGuard':
    'omogućava da čitanje celog fleša počne kao svako drugo čitanje (originalni firmver ga odbija)',
  'preserve.site.modeTwoIndirection':
    'usmerava čitanje celog fleša na početak fleša (originalni firmver ga usmerava na vrednost koja ruši kameru)',
  'preserve.site.armTail': 'uklanja poziv koji zamrzava kameru kada čitanje počne na ovom izdanju',
  'preserve.site.other': 'menja jednu instrukciju koja je potrebna čitanju celog fleša',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Rezervna kopija',
  'preserve.step.patch': 'Zakrpa',
  'preserve.step.commit': 'Upis',
  'preserve.step.drain': 'Čitanje celog fleša',
  'preserve.step.restore': 'Vraćanje',
  'preserve.step.verify': 'Provera',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'korak „Zakrpa“',
  'preserve.stepId.commit': 'korak „Upis“',
  'preserve.stepId.drain': 'korak „Čitanje celog fleša“',
  'preserve.stepId.restore': 'korak „Vraćanje“',
  'preserve.stepId.verify': 'korak „Provera“',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: zaustavljeno po planu — kamera je pokrenula {bank}, koji ova sesija nije zakrpila, pa ništa nije pročitano.',
  'preserve.result.noReason': 'razlog nije zabeležen',
  'preserve.result.stopped': '{label}: zaustavljeno — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none': 'nijedan slot ne sadrži firmver koji sesija može da zakrpi',
  'preserve.result.writable.one': '{banks} sadrži firmver koji sesija može da zakrpi',
  'preserve.result.writable.many': '{banks} sadrže firmver koji sesija može da zakrpi',
  'preserve.result.backup':
    '{label}: sačuvan je svaki blok do kog dopire obično čitanje; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'slot koji nije poznat',
  'preserve.result.backupNext':
    '{label}: sačuvan je svaki blok do kog dopire obično čitanje; {writable}; sledeće pokretanje ulazi u {next}.',
  'preserve.result.patch': '{label}: napravljena za {banks}.',
  /** The patch step when every bank was refused: nothing to build for. */
  'preserve.result.patchNone':
    '{label}: nije napravljena, jer nijedan slot ne sadrži firmver koji sesija može da zakrpi.',
  'preserve.result.patchCount': '{label}: napravljena za {banks}; u svakom se menja {count} B.',
  'preserve.result.commitOne': '{label}: {banks} upisan sa zakrpom, i kamera ga je prihvatila.',
  'preserve.result.commitMany':
    '{label}: {banks} upisani sa zakrpom, i kamera je prihvatila svaki od njih.',
  'preserve.result.drainNotRead': '{label}: nije pročitano.',
  'preserve.result.drain':
    '{label}: pročitan je ceo fleš od 4 MB; potpuna slika ima sha256 {sha256}.',
  'preserve.result.drainThrough':
    '{label}: pročitan je ceo fleš od 4 MB preko {bank:gen}; potpuna slika ima sha256 {sha256}.',
  'preserve.result.restore': '{label}: {banks} — vraćeno.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}: {banks} — vraćeno {form}.',
  'preserve.result.verifyDone': '{label}: gotovo.',
  'preserve.result.verifyIdentical':
    '{label}: ponovo pročitani blokovi: {blocks}, različiti bajtovi: 0 — fleš kamere je bajt po bajt identičan rezervnoj kopiji.',
  'preserve.result.verifyDiffers':
    '{label}: ponovo pročitani blokovi: {blocks}, različiti bajtovi: {bytes}.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: ponovo pročitani blokovi: {blocks}, različiti bajtovi: {bytes}, blokovi koji nisu mogli da se pročitaju: {count}.',
    few: '{label}: ponovo pročitani blokovi: {blocks}, različiti bajtovi: {bytes}, blokovi koji nisu mogli da se pročitaju: {count}.',
    other:
      '{label}: ponovo pročitani blokovi: {blocks}, različiti bajtovi: {bytes}, blokovi koji nisu mogli da se pročitaju: {count}.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Zaustavljeno pre čitanja celog fleša: kamera je pokrenula slot koji ova sesija nije zakrpila, pa ništa nije pročitano.',
  'preserve.unpatchedStart.next':
    'Sledeće: vraćanje vraća svaki upisani slot. Čitanje celog fleša se ne pokušava ponovo: kamera bi pokrenula isti slot.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Gotovo — vaš firmver je sačuvan',
  'preserve.done.detail':
    'Potpuna slika je ceo originalni fleš kamere, a sama kamera je vraćena tačno u stanje u kom je bila.',
  'preserve.done.titleNoImage': 'Gotovo — kamera je vraćena u prethodno stanje; nema potpune slike',
  'preserve.done.detailNoImage':
    'Čitanje celog fleša nije izvršeno, pa ova sesija nema potpunu sliku fleša. Svaki upisani slot je vraćen, a novo čitanje blokova do kojih dopire obično iščitavanje poklapa se sa rezervnom kopijom. Za potpunu sliku pokrenite novu sesiju sa izborom koji uključuje slot u koji ulazi sledeće pokretanje.',
  'preserve.done.detailNoImageCount':
    'Čitanje celog fleša nije izvršeno, pa ova sesija nema potpunu sliku fleša. Svaki upisani slot je vraćen, a novo čitanje blokova do kojih dopire obično iščitavanje (ukupno: {blocks}) poklapa se sa rezervnom kopijom. Za potpunu sliku pokrenite novu sesiju sa izborom koji uključuje slot u koji ulazi sledeće pokretanje.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'čitač prozora kamere ima ograničen broj čitanja po pokretanju, a ova čitanja su stigla od istrošenog čitača — isključite i ponovo uključite kameru (izvucite je i ponovo priključite ili upotrebite njen prekidač za napajanje), pa ponovo pokrenite `preserve --resume <run-directory>`. Potpis: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'čitač prozora kamere ima ograničen broj čitanja po pokretanju, a ova čitanja su stigla od istrošenog čitača — isključite i ponovo uključite kameru (izvucite je i ponovo priključite ili upotrebite njen prekidač za napajanje), pa ponovo pokrenite `preserve --resume <run-directory>`. Potpis: {signature} — iz ovih bajtova ne može da se izvede fabrička nešifrovana slika. Isprobani su svi načini da se ona pročita:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'rezervna kopija ne sadrži {bank} ({address}) — originalni prozori ne mogu da ga daju',
  'preserve.fail.readsDisagree':
    'dva čitanja {bank:gen} se ne slažu (sha256 {sha256} naspram {other}) — kamera koja ne može dvaput zaredom da da slot iz kog radi nije kamera u koju treba upisivati; snimak je izvor za vraćanje i ulaz za izvođenje zakrpe',
  'preserve.fail.notFactory':
    '{bank} ne sadrži fabričku sliku onako kako je čuva šifra ovog izdanja (očekivani početak slike ne odgovara snimku) — odbija se pre nego što se bilo šta zabeleži, a kamoli upiše',
  'preserve.fail.ffSum':
    'zakrpljeni firmver, u obliku u kom ga kamera čuva, ne prolazi sopstvenu proveru ovog izdanja (zbir mora biti {sum}) — odbija se slanje slota koji bi kamera odbacila posle brisanja',
  'preserve.fail.headChanged':
    'početak {bank:gen} promenio se od rezervne kopije (ne sadrži ni originalni snimak ni zakrpljene bajtove) — odbija se upis preko nepoznatog stanja slota; ništa nije upisano. Heks početka: trenutno {live} naspram snimka {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks} već sadrži zakrpljene bajtove — potvrda upisa je uspela u prethodnom pokušaju i ne sme da se ponovi. Nastavite od koraka čitanja celog fleša (--resume), koji pokreće zakrpljenu sliku i nastavlja odatle.',
  'preserve.fail.landed':
    '{banks} već sadrže zakrpljene bajtove — potvrda upisa je uspela u prethodnom pokušaju i ne sme da se ponovi. Nastavite od koraka čitanja celog fleša (--resume), koji pokreće zakrpljenu sliku i nastavlja odatle.',
  'preserve.fail.drainRebootRefused':
    'komandu za ponovno pokretanje u koraku čitanja celog fleša domaćin je ODBIO pre nego što je poslata (SecurityError: pravilo pregledača ili zaštita testa), pa kamera i dalje radi sa slikom sa kojom se pokrenula, a ne sa potvrđenom zakrpom. Čitanje celog fleša čita samo kroz prošireni prozor zakrpljene slike, pa se zaustavlja pre nego što bilo šta aktivira; ništa nije pročitano. Ponovo pokrenite čitanje celog fleša tamo gde domaćin propušta komandu za ponovno pokretanje.',
  'preserve.fail.shiftedRebootRefused':
    'čitanje celog fleša vratilo se pomereno za jednu stranicu, a ponovno pokretanje koje daje novo pokretanje domaćin je ODBIO pre nego što je poslato (SecurityError: pravilo pregledača ili zaštita testa) — novi pokušaj bi pročitao isto pomereno pokretanje. Ništa nije zadržano; ponovo pokrenite čitanje celog fleša tamo gde resetovanje može da prođe.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'provera je pročitala {count} različit bajt u {read}/{total} prozora — čip se pri ponovnom čitanju ne poklapa bajt po bajt sa rezervnom kopijom',
    few: 'provera je pročitala {count} različita bajta u {read}/{total} prozora — čip se pri ponovnom čitanju ne poklapa bajt po bajt sa rezervnom kopijom',
    other:
      'provera je pročitala {count} različitih bajtova u {read}/{total} prozora — čip se pri ponovnom čitanju ne poklapa bajt po bajt sa rezervnom kopijom',
  },
  'preserve.fail.verifyIn': {
    one: 'provera je pročitala {count} različit bajt u {read}/{total} prozora (mesta: {places}) — čip se pri ponovnom čitanju ne poklapa bajt po bajt sa rezervnom kopijom',
    few: 'provera je pročitala {count} različita bajta u {read}/{total} prozora (mesta: {places}) — čip se pri ponovnom čitanju ne poklapa bajt po bajt sa rezervnom kopijom',
    other:
      'provera je pročitala {count} različitih bajtova u {read}/{total} prozora (mesta: {places}) — čip se pri ponovnom čitanju ne poklapa bajt po bajt sa rezervnom kopijom',
  },
  'preserve.fail.verifyShort': {
    one: 'provera je pročitala {count} različit bajt u {read}/{total} prozora (kratki prozori: {short}) — čip se pri ponovnom čitanju ne poklapa bajt po bajt sa rezervnom kopijom',
    few: 'provera je pročitala {count} različita bajta u {read}/{total} prozora (kratki prozori: {short}) — čip se pri ponovnom čitanju ne poklapa bajt po bajt sa rezervnom kopijom',
    other:
      'provera je pročitala {count} različitih bajtova u {read}/{total} prozora (kratki prozori: {short}) — čip se pri ponovnom čitanju ne poklapa bajt po bajt sa rezervnom kopijom',
  },
  'preserve.fail.verifyInShort': {
    one: 'provera je pročitala {count} različit bajt u {read}/{total} prozora (mesta: {places}) (kratki prozori: {short}) — čip se pri ponovnom čitanju ne poklapa bajt po bajt sa rezervnom kopijom',
    few: 'provera je pročitala {count} različita bajta u {read}/{total} prozora (mesta: {places}) (kratki prozori: {short}) — čip se pri ponovnom čitanju ne poklapa bajt po bajt sa rezervnom kopijom',
    other:
      'provera je pročitala {count} različitih bajtova u {read}/{total} prozora (mesta: {places}) (kratki prozori: {short}) — čip se pri ponovnom čitanju ne poklapa bajt po bajt sa rezervnom kopijom',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'blok konfiguracije pokretanja',
  'preserve.fail.dataBlock': 'blok podataka',

  'preserve.refused.secondRead': 'njegovo drugo čitanje nije uspelo ({error})',
  'preserve.refused.readsDisagree':
    'njegova dva čitanja se ne slažu (sha256 {sha256} naspram {other})',
  'preserve.refused.erased': 'obrisan je',
  'preserve.refused.watchdogMark':
    'njegova reč zaglavlja na +0x200 sadrži {word}, oznaku koju butloder upisuje preko slota posle resetovanja watchdog tajmera rano u pokretanju; butloder više ne prihvata ovaj slot, a sesija tu nema sliku za krpljenje',
  'preserve.refused.noHeader': 'ne sadrži zaglavlje slike na +0x200',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'sadrži {image} ({id}), a ne izdanje sa kojim kamera radi ({camera})',
  'preserve.refused.otherKey':
    'provera butlodera ga odbija: sačuvan je pod drugim ključem, a ne onim pod kojim butloder ove kamere proverava slotove, a upis preko kamere bi ga sačuvao pod tim ključem, pa vraćanje ne bi moglo da vrati njegove tačne bajtove',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'kamera prijavljuje firmver {camera}, a očekuje se {version} — zakrpa je izvedena iz bajtova jednog izdanja i ne sme da se pošalje drugom',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'firmver {version} nije izdanje 0.x ili 1.x, a ova sesija pokriva samo izdanja iz 2014. i 2016. godine. Ništa osim verzije nije pročitano. Ovu kameru umesto toga pročitajte na kartici „Iščitavanje i dešifrovanje 4.x/Nano“: ona čita fleš bez zakrpe, svaki blok osim onog na 0x14060000, do kog na tim izdanjima ne dopire nijedan prozor čitanja.',
  'preserve.refused.preWidening':
    'firmver {version} je stariji od puta proširenja, a sesija radije odbija nego da upisuje preko slota koji ne može kontrolno da pročita. Na ovoj generaciji kamera odbija svaki način pokretanja čitanja koji je tom putu potreban (izmereno na 0.3.0.1), njena komanda za čitanje ne dopire do početka fleša, a veličina koju bi zakrpa menjala čuva se na drugačiji način. Nema ni čitanje koje bi standardno iščitavanje moglo da koristi. Ništa osim verzije nije pročitano.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'sadrži nepoznatu sliku (ni originalni firmver {version}, ni njegovu izmenu koju sesija poznaje), pa sesija ne krpi i ne vraća taj slot',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'sadrži poznato izdanje sa zakrpom brzine kadrova: originalni firmver {version} sa zakrpom brzine kadrova za {hz} Hz. Sesija krpi samo originalni firmver, nikada zakrpljenu sliku, pa ne krpi i ne vraća ovaj slot',
  'preserve.image.frameRateEarlier':
    'sadrži poznato izdanje sa zakrpom brzine kadrova: originalni firmver {version} sa ranijom zakrpom brzine kadrova za {hz} Hz (napravljenom pre nego što joj je dodata USB ispravka). Sesija krpi samo originalni firmver, nikada zakrpljenu sliku, pa ne krpi i ne vraća ovaj slot',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    '{what}. Da biste uključili ovaj slot, prvo u njega vratite originalnu sliku (na primer iz potpune rezervne kopije fleša napravljene pre izmene), pa pokrenite novu sesiju',
  'preserve.image.frameRateWords':
    '{what}. Da biste uključili ovaj slot, prvo u njega vratite originalnu sliku (na primer iz potpune rezervne kopije fleša napravljene pre zakrpe brzine kadrova), pa pokrenite novu sesiju; zakrpa brzine kadrova posle toga može ponovo da se napravi na originalnoj slici',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name} {what}. Sesija uzima firmver koji krpi iz ovog slota, pa se ovde zaustavlja, pre nego što se bilo šta upiše. Da biste sačuvali ovu kameru, prvo vratite originalnu sliku u {bank} (na primer iz potpune rezervne kopije fleša napravljene pre izmene), pa pokrenite novu sesiju.',
  'preserve.image.frameRateRefusal':
    '{name} {what}. Sesija uzima firmver koji krpi iz ovog slota, pa se ovde zaustavlja, pre nego što se bilo šta upiše. Da biste sačuvali ovu kameru, prvo vratite originalnu sliku u {bank} (na primer iz potpune rezervne kopije fleša napravljene pre zakrpe brzine kadrova), pa pokrenite novu sesiju; zakrpa brzine kadrova posle toga može ponovo da se napravi na originalnoj slici.',
  'preserve.image.otherFirmware': 'sadrži firmver {image}, a ne {camera} sa kojim kamera radi',
  'preserve.image.otherFirmwareRefusal':
    '{name} sadrži firmver {image}, a ne {camera} sa kojim kamera radi, pa ova sesija tu nema sliku koju može da zakrpi i radije odbija nego da upiše preko nje.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'iz njega se ne izvodi nijedna slika koju sesija može da zakrpi ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone': 'ova sesija je završena — svi koraci su obavljeni (sesija {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    'korak {step} je već obavljen u ovoj sesiji (završen {finished}) — nastavak ide od koraka {next}',
  'preserve.gate.stepDoneUnknownTime':
    'korak {step} je već obavljen u ovoj sesiji (završen u nepoznato vreme) — nastavak ide od koraka {next}',
  'preserve.gate.backupRerun':
    'rezervna kopija ne može ponovo da se pokrene: ova sesija je već obavila {steps}, a njen sledeći korak je {next} — upotrebite --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'prethodni pokušaj pravljenja rezervne kopije nije uspeo, a napajanje kamere MORA da se isključi i ponovo uključi pre nego što se ovaj korak ponovo pokrene — ponovni pokušaj u istom pokretanju može da pročita zastarele ili prazne bajtove (izmereno: ponovljena rezervna kopija pročitala je reč pokretanja butlodera umesto zapisa konfiguracije pokretanja). Isključite i ponovo uključite kameru (izvucite je i ponovo priključite ili upotrebite njen prekidač za napajanje), pa ponovo napravite rezervnu kopiju i potvrdite isključivanje napajanja kada se zatraži: sesija ne može da vidi da se to dogodilo. Zabeležena greška: {error}',
  'preserve.gate.noErrorText': '(nema teksta greške)',
  'preserve.gate.patchAfterBackup':
    '{step} ide posle rezervne kopije: sesija uzima kopiju svakog područja koje originalni plan može da pročita i čuva je PRE nego što se bilo šta drugo dogodi — ta rezervna kopija je jedina kopija ove kamere. Prvo pokrenite korak „Rezervna kopija“.',
  'preserve.gate.commitAfterBackup': '{step} ide posle rezervne kopije (pogledajte korak „Zakrpa“)',
  'preserve.gate.commitAfterPatch': '{step} ide posle koraka „Zakrpa“, koji beleži šta priprema',
  'preserve.gate.commitNeedsPatch':
    '{step} zahteva zakrpu za {banks}, a korak „Zakrpa“ nije zabeležio nijednu — ponovo pokrenite korak „Zakrpa“',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step} zahteva datoteke rezervne kopije u direktorijumu sesije, a one nedostaju: {files} — bez njih potvrda upisa nema izvor za vraćanje, pa odbija',
  'preserve.gate.drainNoCommit':
    '{step} čita ZAKRPLJENI deo kroz prošireni prozor, a ova sesija nema obavljenu potvrdu upisa — čitanje celog fleša bi zastalo na originalnoj kameri. Prvo pokrenite korak „Upis“ (ili nastavite od njega), ili izričito preskočite (allowJump) ako je upis uspeo bez svoje kontrolne tačke.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'korak „Čitanje celog fleša“ odbija ovo izdanje ({build}): {note}',
  'preserve.gate.detectedBuild': 'prepoznato izdanje',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'korak „Čitanje celog fleša“ odbija ovo izdanje ({build}): pokretanje čitanja celog fleša na nezakrpljenom firmveru ovog izdanja ruši kameru (čita sa vrednosti koja nije adresa u flešu; izmereno na emulatoru: predato 32 KB, zatim je kamera pala). Izmena koja čitanje čini bezbednim nalazi se na {sites} i nije među izmenama koje je ova sesija zabeležila za {bank} — pokrenite korak „Zakrpa“ (i uspešno upišite) pre čitanja celog fleša.',
  'preserve.gate.drainFiles':
    '{step} zahteva {files} (predata kopija se naknadno obrađuje snimkom svakog upisanog slota), a toga nema u direktorijumu sesije',
  'preserve.gate.restoreNoCommit':
    '{step} vraća originalne slotove preko zakrpe, a ova sesija nema obavljenu potvrdu upisa — nema šta da vraća. Prvo pokrenite korak „Upis“ (ili nastavite od njega), ili izričito preskočite (allowJump) da biste vratili već zakrpljenu kameru.',
  'preserve.gate.restoreNeedsPatch':
    '{step} zahteva rezime zakrpe svakog upisanog slota (zbog dužine pripreme) — prvo pokrenite korak „Zakrpa“',
  'preserve.gate.restoreNoForm':
    'korak „Vraćanje“ odbija ovo izdanje ({build}): nijedan oblik originalnog firmvera ne prolazi sopstvenu proveru kamere i istovremeno se čuva kao originalni bajtovi — kontrolni zbir originalnog firmvera je 0xB7AB9D17 (izmereno), a ne 0xFFFF koji kamera zahteva. Ova sesija se završava potpunom slikom u rukama i zakrpom na mestu; originalni sadržaj može da se vrati samo programatorom celog fleša.',
  'preserve.gate.restoreFiles':
    '{step} zahteva {files} (original svakog upisanog slota, iz koraka rezervne kopije), a toga nema u direktorijumu sesije',
  'preserve.gate.verifyNoRestore':
    '{step} upoređuje novo pokretanje sa rezervnom kopijom, a ova sesija nema obavljeno vraćanje — zakrpljeni slot bi se pokazao kao razlike. Prvo pokrenite korak „Vraćanje“ (ili nastavite od njega), ili izričito preskočite (allowJump) ako je vraćanje uspelo bez svoje kontrolne tačke.',
  'preserve.gate.verifyNeedsBackup':
    '{step} zahteva {file} (referencu za poređenje), a toga nema u direktorijumu sesije',
  'preserve.gate.needsBanks':
    '{step} zahteva slotove koje je pročitao korak rezervne kopije, a stanje ih nema',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'za ovu sesiju nije izabran nijedan slot: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank} ne može da se upiše: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'zakrpa ovog izdanja pokreće se samo iz slota za oporavak R: {note} — sesija bi upisala u {bank}, odakle je butloder nikada ne pokreće',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'datoteka je premala da bi sadržala zaglavlje slike',
  'slots.image.notWordSized': 'veličina slike mora biti deljiva sa 4 (dobijeno {size} B)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'slika ima {size} B; butloder odbija svaki header.length >= {limit}, pa se nikada ne bi pokrenula',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'nema zaglavlja slike na {at} (magična reč {magic}, očekivano {expected}) — ovo mora biti dešifrovana slika Seek firmvera, a ne šifrovani slot ili kopija fleša',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'početni pokazivač steka {address} nije u LPC43xx SRAM — ovo ne izgleda dešifrovano',
  'slots.image.stackUnaligned': 'početni pokazivač steka {address} nije poravnat na reč',
  'slots.image.notThumb': 'vektor resetovanja {address} nije Thumb adresa',
  'slots.image.noKeyPair':
    'ime ove datoteke ne sadrži njen par ključeva, a ni par ove kamere ni dekodirani par aplikacije ne javlja se u slici tačno jednom, pa nema načina da se zna za koje ključeve je slika napravljena. Dešifrovane datoteke dobijaju imena po ključevima koje sadrže.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'ime datoteke navodi ključ A {keyA} i ključ B {keyB}, ali {mismatch}. Oba ključa moraju biti prisutna, svaki tačno jednom.',
  'slots.image.keyInHeader':
    'ova slika drži ključ na {at}, unutar nešifrovanog prozora zaglavlja — odbija se krpljenje',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'ključ A i ključ B iz imena datoteke odgovaraju preklapajućim bajtovima na {at} i {other} — moraju biti dve različite 16-bajtne vrednosti',
  'slots.image.retargetLost':
    'posle preusmeravanja slika ne sadrži par ključeva ove kamere tačno jednom — odbija se pravljenje podataka za čije kasnije nadogradnje butloder ne bi mogao da odredi ključ',
  'slots.image.noStageKey':
    'slika ne sadrži nijedan par ključeva linije iz 2016. godine, pa nema ključa za pripremu kojim bi se kodirala',
  'slots.image.ffSumNoKeys':
    'ova slika ima zbir reči 0xFFFF izdanja 16 Hz FF, ali ne sadrži par ključeva 1.3.0.8-FF (obe polovine, svaku jednom), pa njen pripremljeni oblik ne može da se napravi. Ništa nije upisano.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'ovo je slika 1.3.0.8 FF (16 Hz), koja se priprema u sopstvenom obliku sa ključem A (ff-form.ts), a ne kao nešifrovana slika. Ništa nije upisano.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'plan je napravljen za firmver {firmware}, ali analiza čita {version}. Plan je zastareo; napravite ga ponovo. Ništa nije upisano.',
  'slots.plan.otherFirmwareUnknown':
    'plan je napravljen za firmver nepoznate verzije, ali analiza čita {version}. Plan je zastareo; napravite ga ponovo. Ništa nije upisano.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'plan je napravljen za kameru {planSerial}, ali analiza čita {serial}. Upis se ovde odbija. Ništa nije upisano.',
  'slots.plan.cameraUnknownSerial': 'nepoznatog serijskog broja',
  'slots.plan.unknownSerial': 'nepoznat serijski broj',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, inside the sentence ("slot A"). */
  'slots.plan.otherAddress': 'plan cilja {address}, ali je {name} ovog izdanja na {at}',
  'slots.plan.notRead': 'analiza više ne čita {name}. Ništa nije upisano.',
  'slots.plan.edited':
    'kontrolni zbir plana ne odgovara njegovim podacima, pa je plan izmenjen. Ništa nije upisano.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'podaci imaju {size} B, više nego što staje u {name}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck': '{risk}. Za upis je potrebno acknowledgeRisk: true. Ništa nije poslato.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'ova kamera odavde ne može da primi nešifrovano pripremljenu sliku: {reason}. Ništa nije upisano.',
  'slots.plan.noKeyTable':
    'analiza ne navodi tabelu ključeva butlodera ove kamere, pa slika ne može da se preusmeri na nju',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'status potvrde nije mogao da se pročita posle CompleteMemoryUpgrade, pa je {name} možda delimično upisan. Ponovo pročitajte slotove pre bilo čega drugog i sačuvajte svoju kopiju fleša.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'kamera je odbila upis u {name} pri potvrdi sa {status}: {cause}. Ništa nije upisano; slot je nepromenjen. Ponovo pročitajte slotove pre bilo čega drugog.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade je vratio {status} ({cause}) za {name}: ništa nije programirano, ali je brisanje možda počelo, pa slot može biti delimično obrisan. Ponovo pročitajte slotove pre bilo čega drugog i sačuvajte svoju kopiju fleša.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade je vratio {status} ({cause}) — {name} je možda delimično upisan. Ponovo pročitajte slotove pre bilo čega drugog i sačuvajte svoju kopiju fleša.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'kamera je prijavila {status} tokom pripreme {name:gen} na pomeraju {offset} — prekinuto pre CompleteMemoryUpgrade, pa ništa nije upisano u fleš',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum': 'kontrolni zbir prenosa nije odgovarao pripremljenim bajtovima',
  'commit.cause.unsupported':
    'slika se nije dešifrovala ključevima kamere, ili je tip podataka odbijen',
  'commit.cause.acceptance':
    'sliku je odbila provera prihvatanja pre nego što je bilo šta obrisano (provera zavisi od izdanja)',
  'commit.cause.notArmed': 'nijedna nadogradnja slota nije bila aktivirana',
  'commit.cause.eraseFailed': 'faza brisanja nije uspela',
  'commit.cause.programFailed': 'faza programiranja nije uspela',
  'commit.cause.verifyFailed': 'faza provere nije uspela',
  'commit.cause.unknown': 'status koji ovde nije poznat',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name} se ne kopira sam u sebe. Ništa nije upisano.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Ništa nije upisano.',
  'copy.refused.noPlain': '{name} nema dešifrovanu sliku za kopiranje. Ništa nije upisano.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} je ZIP koji ovde ne može da se pročita ({error}). Ništa nije upisano.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} ne sadrži ceo fleš. ZIP se prihvata kada je to datoteka sesije sa kartice 0.x/1.x koja sadrži {preserve} (pošto se izvrši njen korak potpunog čitanja), zip sa kartice „Iščitavanje i dešifrovanje 4.x/Nano“ ({dump}) ili zip dugmeta „Iščitaj sve selektore“ ({selectors}); ovaj ZIP sadrži: {names}. Ništa nije upisano.',
  'restore.refused.noWholeFlashPatched':
    '{file} ne sadrži ceo fleš. ZIP se prihvata kada je to datoteka sesije sa kartice 0.x/1.x koja sadrži {preserve} (pošto se izvrši njen korak potpunog čitanja), zip sa kartice „Iščitavanje i dešifrovanje 4.x/Nano“ ({dump}) ili zip dugmeta „Iščitaj sve selektore“ ({selectors}); ovaj ZIP sadrži: {names}. Datoteka {patched} u njemu je fleš sa privremenom zakrpom sesije, pa se ne prihvata. Ništa nije upisano.',
  'restore.refused.zipEmpty': 'ništa',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'potpuna rezervna kopija fleša ima {full} B (4 MB, ceo čip koji J-Link čita); {file} ima {size} B. Ništa nije upisano.',
  'restore.refused.noBank': 'plan ovog izdanja nema {bank}. Ništa nije upisano.',
  'restore.refused.outsideFlash': '{name} nije unutar fleša od 4 MB. Ništa nije upisano.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    '{where} nije pročitan u kopiji iz koje potiče {file}: prema njenom manifest.json, {address} je praznina. Nema slike za vraćanje. Ništa nije upisano.',
  'restore.refused.gapReason':
    '{where} nije pročitan u kopiji iz koje potiče {file}: prema njenom manifest.json, {address} je praznina ({gap}). Nema slike za vraćanje. Ništa nije upisano.',
  'restore.refused.gapFill':
    '{where} nije pročitan u kopiji iz koje potiče {file}: prema njenom manifest.json, {address} je praznina, popunjena sa {fill}. Nema slike za vraćanje. Ništa nije upisano.',
  'restore.refused.gapReasonFill':
    '{where} nije pročitan u kopiji iz koje potiče {file}: prema njenom manifest.json, {address} je praznina ({gap}), popunjena sa {fill}. Nema slike za vraćanje. Ništa nije upisano.',
  'restore.refused.empty':
    '{where} je prazan: svaki bajt je 0xFF. Upis programira sliku i ne može da ostavi slot obrisan, pa prazan slot ne može da se vrati upisom. Ništa nije upisano.',
  'restore.refused.fill':
    '{where} u svakom bajtu ima {fill}, vrednost kojom kopija popunjava ono što nije pročitala: kopija nije pročitala ovaj slot. Nema slike za vraćanje. Ništa nije upisano.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    '{where} ne može da se vrati iz ove datoteke: {why}. Ništa nije upisano.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'ovo izdanje nema aktivaciju upisa za slot',
  'support.noStagingEmpty': 'ovo izdanje nema oblik pripreme, pa se prazan slot ne upisuje',
  'support.buildUnknown': 'izdanje nije poznato',
  'support.unverifiedStaging':
    'ovo izdanje je na zaključanoj liniji 0.x/1.x, ali nije jedno od izdanja na kojima su izmerene tabele zakrpa za kopiranje celog fleša (0.8.0.0 .. 1.3.0.8 i 1.0.3.0 / 1.0.3.2), pa oblik pripreme koji njegov slot prima nije poznat i ništa se ne upisuje',
  'support.unknownFamily':
    'porodica kamere nije poznata, pa ni ključ pod kojim se upisuju njeni slotovi, a kamera prihvata slot upisan pogrešnim ključem i onda neće da se pokrene iz njega. Iščitajte i dešifrujte ovu kameru, prepoznajte je iz kopije fleša, pa navedite njenu porodicu opcijom --family.',
  'support.noReadCommand':
    'firmver stariji od 0.8.0.0 nema obradu čitanja za GetFeaturedFirmwareData, komandu kojom iščitavanje čita fleš. Na 0.7.0.7 i 0.7.0.8 ona je u tabeli RPC metoda na 0x4F, ali registrovana samo kao setter (obrada upisa), pa control-IN čitanje koje šalje iščitavanje ne može da se prosledi (sesija na kartici 0.x/1.x umesto toga čita ta dva izdanja preko wire id 0x58, GetFeaturedData); pre 0.7.0.7 wire id 0x4F je UploadFirmwareRowSize, a na 0.3.0.1 wire id 0x52 — onaj kojim iščitavanje aktivira prozor — jeste EnterBootloaderMode umesto BeginFirmwareUpgrade: kamera ostaje u svojoj aplikaciji, ali svaka aktivacija postavlja cilj u flešu i aktivira fazu nadogradnje firmvera tog izdanja (GetErrorCode tada čita 0x00400000), što nije prozor čitanja. Izvučeno iz sopstvenih tabela metoda slika, obe kolone obrada; pogledajte test/firmware/facts.json.',
  'support.noWritePath':
    'ova izdanja primaju novi firmver starijim redosledom nadogradnje koji ovi alati ne šalju, a njihovi slotovi nikada nisu mapirani, pa se ništa ne upisuje.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'verzija firmvera nije mogla da se pročita, pa izdanje, njegovi slotovi i njihov oblik pripreme nisu poznati; na njemu se ništa ne čita i ne upisuje',
  'support.versionNotDotted':
    'verzija firmvera „{version}“ nije verzija sa tačkama, pa izdanje, njegovi slotovi i njihov oblik pripreme nisu poznati; na njemu se ništa ne čita i ne upisuje',
  'support.olderThanFirst':
    'firmver {version} je stariji od {first}: njegova RPC tabela nema obradu čitanja za GetFeaturedFirmwareData, komandu koju šalje čitanje slota, pa mu se ne šalje ni čitanje ni upis (dokazi su kod early-compact)',
  'support.modernOnLocked':
    'porodica modern-4x pokriva 2.x, 4.x, 10.x, 42.x i 44.x; {version} je na zaključanoj liniji 0.x / 1.x, kojoj treba legacy-auth ili compact-2016',
  'support.lockedOnModern':
    'porodica legacy-auth pokriva zaključanu liniju 0.x / 1.x; {version} je na modernoj liniji, kojoj treba modern-4x',
  'support.notCompactPro':
    'porodica compact-2016 pokriva liniju Compact PRO 1.0.3.x; {version} nije na njoj',
  'support.earlyCompact':
    'porodica early-compact pokriva samo izdanja starija od {first}, a {version} se čita kroz legacy-auth',
  'support.generic':
    'porodica kamere nije prepoznata (porodica generic), pa raspored slotova i oblik pripreme nisu poznati; prepoznajte kameru pre nego što se slot pročita ili upiše',
  'support.noPlan':
    'za porodicu {family} ne postoji plan slotova: njen raspored slotova i oblik pripreme nisu poznati',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'tabela ovog izdanja ne aktivira režim {mode} na {address} preko običnog kanala',
  'support.noArmToken':
    'tabela ovog izdanja ne aktivira režim {mode} na {address} preko kanala sa tokenom',
  'support.windowElsewhere':
    'prozor slota za kopiranje celog fleša za {bank} je na {at}, a ne na {address}',
  'support.noDumpWindow':
    'tabela BeginFirmwareUpgrade ovog izdanja nema prozor na {address} za {bank}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} ne podržava {capability}: {reason}',
  'support.capability.dump': 'iščitavanje',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': '„Iščitaj sve selektore“',
  'support.capability.decrypt': 'dešifrovanje',
  'support.capability.deviceInfo': 'potpuno čitanje kartice Info',
  'support.capability.flash': 'upise u slotove',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name} na {address} nije čitljiv na ovom izdanju: njegova tabela selektora tu nema prozor, pa za njega ništa nije aktivirano',
  'slots.unread.missing': '{name} nedostaje u analizi kamere',
  'slots.unread.notRead': '{name} nije pročitan',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Ništa nije upisano.',
  'slots.refused.versionUnknown':
    'analiza ne kaže sa kojim firmverom kamera radi, a komande za slotove znače različite stvari na različitim izdanjima. Ponovo pročitajte informacije o uređaju.',
  'slots.refused.versionUnknownWrite':
    'analiza ne kaže sa kojim firmverom kamera radi. Ništa nije upisano.',
  'slots.refused.emptyInput': 'ulaz je prazan',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable':
    '{name} je prazan i ne može da se upiše na ovom izdanju: {reason}',
  'slots.refused.noRaw': '{name} ne može da primi sirove bajtove na ovom izdanju: {reason}',
  'slots.refused.noPlain': '{name} ne može da primi dešifrovanu sliku na ovom izdanju: {reason}',
  'slots.refused.noStaging':
    '{name} nema oblik pripreme na ovom izdanju, pa slika ne može da se kodira za njega',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B ne staje u {name} ({bankSize} B)',
  'slots.refused.imageTooLong': 'slika ima {size} B i ne staje u {name} ({bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'butloder iz 2014. godine ne prihvata kontrolni zbir ovog izdanja u slotu A ili B, a slot za oporavak R (0x14070000) pokreće bez provere, pa se zakrpa upisuje u slot za oporavak R i nigde drugde',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly': 'ovo izdanje radi samo iz slota za oporavak R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize': 'slot firmvera ima {size} B ({kib} KB); ova datoteka ima {count} B',
  'decryptFile.erasedBank':
    'prazan, nema šta da se dešifruje: svih {size} B čita se kao 0xFF (obrisan slot)',
  'decryptFile.erasedHeader':
    'obrisan: prozor zaglavlja je sav 0xFF, pa slot ne sadrži sliku; ništa se ne dešifruje',
  'decryptFile.noHeader':
    'nema zaglavlja slike (magična reč {magic}), pa nema slike za dešifrovanje',
  'decryptFile.lengthOutOfRange':
    'header.length {length} je izvan opsega; nema slike za dešifrovanje',
  'decryptFile.ffKeyB':
    'dešifrovano {size} B ključem B za FF 1.3.0.8: slika se čuva kao slika XOR tok ključa njenog bloka ključeva 1, prozor zaglavlja doslovno',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'ključ nije pronađen: slika se dešifruje u vektor resetovanja koji nije Cortex-M ulazna tačka (ključ {check}); ništa se ne dešifruje',
  'decryptFile.storedPlain':
    'sačuvano nešifrovano: slot sadrži sliku onakvu kakva radi (nešifrovani lanac iz 2014. godine, tok ključa identiteta), pa nema ključa, a dešifrovana slika je sama slika',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 'dešifrovano {size} B ključem izračunatim iz ovog slota ({check})',
  'decryptFile.decryptedNamed':
    'dešifrovano {size} B ključem izračunatim iz ovog slota ({check}; to je {key})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'kratko čitanje ({size} B)',
  'read.reason.noParse': 'zaglavlje slike nije moglo da se raščlani',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'nema zaglavlja slike (magična reč {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} je izvan opsega',
  'read.reason.stopped': 'čitanje slota zaustavljeno je na {count}/{size} B',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'nije čitljivo na firmveru {version}: njegov plan ({table}) nema prozor na {address}, pa za njega ništa nije aktivirano',
  'read.reason.notInPlanUnknown':
    'nije čitljivo na firmveru nepoznate verzije: njegov plan ({table}) nema prozor na {address}, pa za njega ništa nije aktivirano',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'prozor je dao bajtove zastarelog deskriptora čitača — reč 0 {word} sa resetovanjem {hex} je tabela vektora za 0x14000000, a ne sadržaj ovog slota, pa iz nje ništa nije analizirano: {remedy}',
  'read.reason.spentReader': 'slotovi kamere nisu mogli da se pročitaju — {remedy}',
  'read.spentRemedy':
    'čitač prozora je možda istrošen za ovo pokretanje; isključite i ponovo uključite kameru i pokušajte ponovo',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'reč aktivnog slota kamere (koreni fw info, selektor 10) nije mogla da se pročita',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'reč aktivnog slota kamere je {word}, što ne označava nijedan slot',
  'checkKey.unnamed.cfg0NotRead':
    'reč konfiguracije pokretanja nije pročitana, pa nije poznato da li je butloder proverio {bank} pre nego što je ušao u njega',
  'checkKey.unnamed.noZeroSum':
    'kamera prijavljuje da je ušla u {bank}, ali se {bank} pri ovom čitanju ne dešifruje u nulti zbir reči',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'kamera prijavljuje da je ušla u {bank}, koji reč konfiguracije pokretanja {word} ostavlja za kraj, pa je butloder ušao u njega bez provere, ali se {bank} pri ovom čitanju ne dešifruje u nulti zbir reči',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (ocena {score} posle čitanja, na osnovu dokaza ispod)',
  'report.detectedAmbiguous':
    '{family} (ocena {score} posle čitanja, na osnovu dokaza ispod; nejasno)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'da',
  'report.cell.no': 'ne',
  'report.cell.notApplicable': 'n/p',
  'report.cell.unknown': 'nepoznato',
  'report.cell.recoveryOnly': 'samo za oporavak',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'K za izbeljivanje',
  'report.keyRow.store': 'ključ za čuvanje',
  'report.keyRow.check': 'ključ za proveru',
  'report.keyRow.table': 'tabela ključeva',
  'report.keyRow.keys': 'ključevi',
  'report.keyRow.a': 'ključ A',
  'report.keyRow.b': 'ključ B',
  'report.keyRow.tableAt': 'tabela na',
  'report.key.notIdentified': '(nije prepoznat)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} kandidat, nijedan nije potvrđen',
    few: '{count} kandidata, nijedan nije potvrđen',
    other: '{count} kandidata, nijedan nije potvrđen',
  },
  'report.key.tableAt': '{offset} u bloku butlodera, potvrđeno prema slotu',
  'report.key.plainChain':
    'nije potreban: slotovi se čuvaju kao nešifrovani firmver, pa se slot čita i upisuje kakav jeste',
  'report.key.tableRefused2016':
    'nije pročitano — blok butlodera (0x14000000) odbija se na svakom kanalu na ovoj liniji',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, imenovan na osnovu {bank:gen}, slota u koji kamera prijavljuje da je ušla posle provere butlodera',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, zaključen iz {bank:gen}, slota u koji kamera prijavljuje da je ušla: butloder u taj slot ulazi bez provere i pokreće ga pod ključem pod kojim proverava ostale slotove',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' ({pair}, blok 1)',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'par Compact PRO 1.0.3.x 9 Hz',
  'keyPair.cp1032ff': 'par Compact PRO 1.0.3.x FF',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'nije imenovan — {why}',
  'report.checkKey.couldNotName': 'čitanje nije moglo da ga imenuje',
  'report.storeKey.checkKeyUnnamed':
    'ključ pod kojim njen butloder proverava slot (nije imenovan pri ovom čitanju): aplikacija svaki slot koji upiše čuva pod tim ključem',
  'report.storeKey.checkKey':
    '{key}: aplikacija svaki slot koji upiše čuva pod ključem koji proverava njen butloder',
  'report.storeKey.unknown': 'nepoznato — blok butlodera sa mestom za ključ uređaja nije pročitan',
  'report.storeKey.keyBUnidentified':
    'Ključ B (ključ uređaja nije programiran; sam ključ B nije prepoznat)',
  'report.storeKey.keyB': 'Ključ B (ključ uređaja nije programiran)',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain': 'pripremljen nešifrovan (slika kakva jeste, bez ključa)',
  'report.staged.slotKeystream': 'pripremljen pod blokom ključeva 0 sopstvene slike',
  'report.staged.keyA':
    'pripremljen pod ključevima izvedenim iz pokrenutog slota i aktivne aplikacije',
  'report.staged.ffVendor':
    'pripremljen onako kako aplikacija proizvođača priprema sliku 16 Hz FF (slika XOR njen sopstveni blok ključeva 0), a kamera ga čuva pod ključem B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Rezervna kopija: blok {address}',
  'progress.backupDone': 'Rezervna kopija: pročitan je svaki blok',
  'progress.checkBlock': 'Provera: blok {address}',
  'progress.checkDone': 'Provera: pročitan je svaki blok',
  'progress.writingBank': 'Upisivanje {bank:gen}',
  'progress.restoringBank': 'Vraćanje {bank:gen}',
  'progress.staged': '{label}: pripremljeno {done}/{total} B',
  'progress.wholeFlash': 'Čitanje celog fleša: {got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'čitanje {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'čitanje {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Gotovo — pročitani prozori: {ok}/{total}.',
  'progress.readingBank': 'Čitanje {bank:gen} ...',
  'progress.analysing': 'Analiza ...',
  'progress.probeSelector': 'isprobavanje selektora {selector} ...',
  'progress.selectorsArmed':
    'Gotovo — aktivirani selektori: {armed}/{span}, sa podacima: {withData}.',
  'progress.recoveringKey': 'dešifrovanje: izračunavanje ključa za {address} ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} {address} (subcmd {subcmd}) nije mogao da se pročita: {error}',
  'slots.read.refusedBuild':
    'odbija se čitanje slotova firmvera: {reason}. Ništa osim čitanja verzije nije poslato, pa nijedan slot nije diran.',
  'slots.backup.notSaved':
    'rezervna kopija {file} nije sačuvana, pa ništa nije upisano. Upis se nikada ne izvršava bez prethodno sačuvane rezervne kopije; pokušajte ponovo kada bude mogla da se sačuva.',
  'slots.backup.notSavedWhy':
    'rezervna kopija {file} nije sačuvana ({error}), pa ništa nije upisano. Upis se nikada ne izvršava bez prethodno sačuvane rezervne kopije; pokušajte ponovo kada bude mogla da se sačuva.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'visoka (480 Mbit/s)',
  'usb.speed.full': 'puna (12 Mbit/s)',
  'usb.speed.code': 'kôd {code}',
} satisfies Translation<'core', 'sr'>;
