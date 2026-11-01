/**
 * Namespace `core`, latviešu (lv), translated from the English source: sentences that `@seek-fw/core` makes and
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
    'kamera paliek atbloķēta līdz barošanas pārslēgšanai, un līdz tam citi rīki to var nolasīt kļūdaini; pirms to izmantošanas izslēdziet un ieslēdziet kameru',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': 'vispirms {first}, pēc tam {second}, tad {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'netika nolasīts',
  'boot.verdict.checkKeyUnnamed':
    'nevarēja pārbaudīt: atslēga, ar kuru tā sāknētājs pārbauda slotu, netika nosaukta',
  'boot.cfg0NotRead':
    'sāknēšanas konfigurācijas vārds (cfg[0]) netika nolasīts, tāpēc nav zināms, kuru slotu palaidīs nākamā sāknēšana',
  'boot.select.unknown':
    'sāknēšanas konfigurācijas vārds ir {word}, tāpēc sāknētājs vispirms mēģina {first:acc}, bet {bank} {verdict}, tāpēc nav zināms, kurš slots tiek palaists',
  'boot.select.first':
    'sāknēšanas konfigurācijas vārds ir {word}, tāpēc sāknētājs vispirms mēģina {first:acc}, un tajā ir attēls, ko sāknētājs pieņem',
  'boot.select.second':
    'sāknēšanas konfigurācijas vārds ir {word}, tāpēc sāknētājs vispirms mēģina {first:acc}; {first:loc} nav attēla, ko sāknētājs pieņem, tāpēc tas ņem {second:acc}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'sāknēšanas konfigurācijas vārds ir {word}, tāpēc sāknētājs vispirms mēģina {first:acc}; ne {first:loc}, ne {second:loc} nav attēla, ko sāknētājs pieņem, tāpēc tas sāknē {last:acc}, ko tas nepārbauda',
  'boot.select.lastTakes':
    'sāknēšanas konfigurācijas vārds ir {word}, tāpēc sāknētājs vispirms mēģina {first:acc}; ne {first:loc}, ne {second:loc} nav attēla, ko sāknētājs pieņem, tāpēc tas ņem {last:acc}, ko tas nepārbauda',
  'boot.bootsNow': 'Kamera tagad sāknējas no {bank:gen}',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'sāknēts tagad',
  'boot.notBooted': 'nav sāknēts',
  'boot.unknownWhy.checkKeyUnnamed':
    'atslēga, ar kuru tā sāknētājs pārbauda slotu, šajā nolasīšanā netika nosaukta',
  'boot.unknownWhy.noKeyTable':
    'sāknētāja atslēgu tabula netika nolasīta, tāpēc atslēgas, ko tas mēģina, nevar nosaukt',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'Kamera sāknējas no {bank:gen}. {why}.',
  'fpsBoot.holdsOne':
    '{bank}: tajā ir kadru ātruma ielāps, bet šis slots netiek palaists, tāpēc ielāps nestājas spēkā.',
  'fpsBoot.holdsTwo':
    '{banks}: tajos ir kadru ātruma ielāpi, bet neviens no šiem slotiem netiek palaists, tāpēc ielāpi nestājas spēkā.',
  'fpsBoot.wouldNotRun':
    'Ielāps {target:dat} neliktu tam darboties, jo kamera tā vietā sāknējas no {bank:gen}.',
  'fpsBoot.patchRunning':
    'Uzlieciet ielāpu arī {bank:dat} (slotam, kas darbojas): tieši tas liek kadru ātruma ielāpam stāties spēkā.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank}: šeit nevar uzlikt ielāpu ({reason}), tāpēc kadru ātruma ielāps citā slotā šajā kamerā nestājas spēkā.',

  /* ---- backup: the zip saved before a bank write (slots/backup); `{name}` is the bank inside a sentence ("slot B"): each is an item of backup.plan.* ---- */
  'backup.bank.notInPlan': '{name} (nav šī būvējuma plānā: ZIP failā tas norādīts)',
  'backup.bank.unsupported':
    '{name} (šis būvējums to nevar nolasīt, {reason}: ZIP failā tas norādīts)',
  'backup.bank.empty':
    '{name} (tukšs, katrs baits 0xFF: ZIP failā tas norādīts, un ierakstīšana nepārraksta nevienu aparātprogrammatūru)',
  'backup.bank.unread':
    '{name} (slotu nolasīšana to nesasniedza: ZIP failā norādīts, vai to sasniedz nolasīšana pirms ierakstīšanas)',
  'backup.bank.noKey':
    '{name} (tāds, kāds glabājas; neviena šīs nolasīšanas atgūtā atslēga to neatver, tāpēc atšifrēta faila nav)',
  'backup.bank.decrypted': '{name} (tāds, kāds glabājas, un atšifrēts)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Pirms kaut kas tiek ierakstīts, vēlreiz tiek nolasīts un vienā ZIP failā ar piezīmi par katru failu saglabāts {banks}: {file}.',
  'backup.plan.many':
    'Pirms kaut kas tiek ierakstīts, vēlreiz tiek nolasīti un vienā ZIP failā ar piezīmi par katru failu saglabāti {banks}: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'šifrēts tā, lai ierīce to glabātu ar atslēgu, kas ir sāknētajā slotā',
  'staging.detail.slotKeystreamCiphertext':
    'šifrēts ar paša attēla sagatavošanas atslēgu (atslēgu bloks 0); kamera to glabā ar paša slota atslēgu',
  'staging.detail.plain': 'atklāts teksts, bez šifra',
  'staging.detail.keyAKeystream':
    '1.3.0.8 FF attēls tā, kā to sagatavo ražotāja lietotne (XOR atslēga A), — 16 Hz būvējums to glabā ar atslēgu B, nevis šos baitus',
  'staging.detail.verbatim': 'burtiski — baiti tieši tādi, kādi doti',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'nav nolasīts',
  'copy.source.notInPlan': '{name} nav šī būvējuma plānā',
  'copy.source.notRead': '{name} netika nolasīts ({reason}), tāpēc nav attēla, ko kopēt',
  'copy.source.empty': '{name} ir tukšs: nav attēla, ko kopēt',
  'copy.source.foreign':
    '{name} nesatur nevienu aparātprogrammatūras attēlu, ko šī nolasīšana atpazīst, tāpēc nav ko kopēt',
  'copy.source.noKey':
    '{name} neatveras ne ar vienu atslēgu, ko atguva šī nolasīšana, tāpēc nav atšifrēta attēla, ko kopēt',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} adresē {address}, kā to atšifrēja slotu nolasīšana',
  'copy.fromVersion':
    '{name} adresē {address}, aparātprogrammatūra {version}, kā to atšifrēja slotu nolasīšana',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'Attēls ir no {name:gen}, kā to atšifrēja slotu nolasīšana: {size} B, sha256 {sha256}.',
  'copy.noteVersion':
    'Attēls ir no {name:gen}, kā to atšifrēja slotu nolasīšana: aparātprogrammatūra {version}, {size} B, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': 'rezerves kopijas {name} (adresē {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where} pilnajā zibatmiņas rezerves kopijā {file}',
  'restore.fromVersion':
    '{where} pilnajā zibatmiņas rezerves kopijā {file}, aparātprogrammatūra {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': '4 MB zibatmiņas attēls',
  'restore.kind.preserve-run': '0.x/1.x cilnes sesijas fails',
  'restore.kind.dump': '„Nolasīt un atšifrēt 4.x/Nano“ ZIP fails',
  'restore.kind.all-selectors': '„Nolasīt visus selektorus“ ZIP fails',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'attēlu',
  'restore.decryptedTo.firmware': 'aparātprogrammatūru {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'Attēls: {where}, fails {file}, {kind}; glabātais sha256 {stored}, atšifrēts par {decrypted} ({size} B, sha256 {sha256}).',
  'restore.note.imageEntry':
    'Attēls: {where}, fails {file}, {kind} (tā {entry}); glabātais sha256 {stored}, atšifrēts par {decrypted} ({size} B, sha256 {sha256}).',
  'restore.note.readBack':
    'Pēc ierakstīšanas kontrolei nolasītais slots tiek salīdzināts ar rezerves kopijā glabātajiem slota baitiem.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'Rezerves kopijas identitātes bloks nosauc šo kameru (sērijas numurs {serial}).',
  'restore.note.sameBytes':
    '{name} jau satur rezerves kopijā glabātos baitus: ierakstīšana atliek atpakaļ to pašu attēlu.',
  'restore.warn.otherCamera':
    'Šī rezerves kopija izskatās pēc citas kameras kopijas: tās identitātes bloks nosauc sērijas numuru {theirs}, bet šī kamera ir {camera}. Tiek ierakstīts tikai {name:gen} attēls; nekas no tās kameras identitātes vai kalibrācijas netiek ierakstīts.',
  'restore.warn.noIdentity':
    'Šai rezerves kopijai adresē {address} nav identitātes bloka, tāpēc nevar noteikt, no kuras kameras tā nolasīta.',
  'restore.warn.serialNotRead':
    'Kameras sērijas numurs netika nolasīts, tāpēc rezerves kopiju (sērijas numurs {serial}) nevar ar to salīdzināt.',
  'restore.warn.otherFirmware':
    '{where} satur aparātprogrammatūru {version}, bet kamera darbina {camera}: atjaunošana ieliek slotā citu aparātprogrammatūru.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank} netika nolasīts kontrolei, tāpēc tas netiek salīdzināts ar rezerves kopiju.',
  'restore.readBack.equal': '{bank} kontrolnolasīšanā baitu pa baitam sakrīt ar rezerves kopiju.',
  'restore.readBack.differs':
    '{bank}: kontrolnolasīšana atšķiras no rezerves kopijā glabātajiem baitiem {count} B apjomā (pirmā atšķirība adresē {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, ko atvasina no sāknētā {bank:gen}',
  'keys.derived.holds':
    '{key} (glabāšanas atslēga), ko atvasina no sāknētā {bank:gen}, kurā ir {holds:nom}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, ko atvasina no sāknētā slota',
  'keys.derived.holdsUnnamed':
    '{key} (glabāšanas atslēga), ko atvasina no sāknētā slota, kurā ir {holds:nom}',
  'keys.ffVendor.staged':
    '1.3.0.8 FF (16 Hz) attēls tā, kā to sagatavo ražotāja lietotne: attēls XOR tā paša atslēgu bloks 0 (atslēga A), galvenes logs nemainīts, jebkurā slotā; šīs kameras atslēgas netiek izmantotas',
  'keys.ffVendor.stored':
    'Atslēga B: kamera pārkodē augšupielādi ar atslēgu bloku 1 un glabā attēlu ar to',
  'keys.imageBlock0.staged':
    'attēls ar tā paša atslēgu bloku 0 (atrasts attēlā pēc vērtības), jebkurā slotā; šīs kameras atslēgas netiek izmantotas',
  'keys.imageBlock0.storedUnnamed':
    'atslēga, ar kuru tā sāknētājs pārbauda slotu (šajā nolasīšanā nav nosaukta); kamera ar to atkārtoti šifrē augšupielādi',
  'keys.imageBlock0.stored':
    '{key} — atslēga, ar kuru tā sāknētājs pārbauda slotu; kamera ar to atkārtoti šifrē augšupielādi',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED: neviens 16 Hz FF būvējuma sāknētājs nav nolasīts no kameras, tāpēc nav zināms, vai ierakstītais slots startē. Ar 0.9.0.0 sāknētāju agrāka šī attēla forma startēja no atkopšanas slota R; šī forma nestartēs, jo šis sāknētājs startē atkopšanas slotu R tādu, kāds tas glabājas, to neatkodējot.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    '16 Hz FF attēls tiek nosūtīts formā, ko nolasa tikai 16 Hz {version} būvējums. Šī kamera ieraksta slotu, nepārbaudot attēlu (tā liecina tās aparātprogrammatūras pirmkods, un tā rīkojās 1.3.0.0 Compact, kad to izmēģināja), tāpēc paredzams, ka tā ierakstīs baitus tādus, kādi tie nosūtīti: tad slotā būs attēls formā, ko šī kamera nevar startēt.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Nekas šeit neapgalvo, ka kamera to startē.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast': 'Kameras pašas atbildes rāda, ka tā darbina 16 Hz FF būvējumu: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'pārbauda datus, pirms izdzēš slotu, un šie dati pārbaudi iztur, tāpēc tas var ierakstīt šos baitus tādus, kādi tie ir, formā, ko tā sāknētājs nevar startēt: slots var nestartēt (nav izmēģināts; pirms ierakstīšanas saglabātā rezerves kopija to atjauno)',
  'write.ff.outcome.refuses':
    'pārbauda datus, pirms izdzēš slotu, un šie dati pārbaudi neiztur, tāpēc paredzams, ka tas atteiks šo ierakstīšanu, pirms kaut ko ieraksta (kamera ar šo būvējumu tieši tāpat atteica agrāku šī attēla formu)',
  'write.ff.runsSlow': 'Kamera darbina 8 Hz {version} būvējumu: {why}. Šis būvējums {outcome}.',
  'write.ff.buildUnknown':
    'Kameras pašas atbildes nepasaka, kuru {version} būvējumu tā darbina: {why}. Ja tā darbina 16 Hz FF būvējumu, tā šos datus pieņem. Ja tā darbina 8 Hz būvējumu, šis būvējums {outcome}.',
  'write.raw.asGiven':
    'Neapstrādāti dati: nosūtīti tieši tādi, kādi doti. Nekas šeit nepārbauda, vai tie ir sāknējami.',
  'write.raw.ffStagedForm':
    'Šie dati ir 1.3.0.8 FF sagatavotā forma (attēls XOR atslēgu bloks 0, vārdu summa 0xFFFF). Kamera glabā attēlu ar atslēgu B, tāpēc kontrolnolasīšana tiek salīdzināta ar šiem baitiem.',
  'write.raw.noStaging':
    'Šis būvējums slotam nenosauc sagatavošanas formu, tāpēc sāknētāja pārbaudes nevar noteikt.',
  'write.raw.reencrypts':
    'Ierīce atkodē šos datus un atkārtoti šifrē to, ko patur, tāpēc glabātie baiti nav prognozējami. Kontrolnolasīšana tiek pārbaudīta kā attēls, par ko tā atšifrējas, ja to var noteikt.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'Sāknētājs šos datus noraidītu: {failure}.',
  'write.raw.stageKeyUnchecked':
    '2016. gada sagatavošanas atslēgas (atslēgu bloks 0) neapstrādātajos baitos nav, tāpēc šo datu atšifrētā vārdu summa šeit netiek pārbaudīta.',
  'write.image.rekeyRisk':
    '{name} jau satur attēlu, ko sāknētājs nevar pieņemt. Šī ierakstīšana noved pie tā paša stāvokļa.',
  'write.ack.recovery':
    'Atkopšanas slots R: tā ierakstīšanai jāapstiprina risks. Nekas šeit nepārbauda, vai kamera pēc tam sāknējas.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: šī slota ierakstīšanai jāapstiprina risks, un pēc nākamās barošanas pārslēgšanas kamera darbinās to, kas tajā būs.',
  'write.ack.bootUnnamed': 'Sāknēto slotu nevarēja nosaukt, tāpēc šis tiek uzskatīts par sāknēto',
  'write.ack.recoveryFallback':
    'Atkopšanas slots R ir ārkārtas kopija, uz kuru sāknētājs pārslēdzas pēdējā brīdī',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'tukšs/0: priekšroka slotam A, pēc tam B, tad atkopšanas slotam',
  'boot.cfg0.modernB': 'priekšroka slotam B, pēc tam A, tad atkopšanas slotam',
  'boot.cfg0.modernRecovery': 'priekšroka atkopšanas slotam, pēc tam A, tad B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'nav zināms — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  /** `{verdict}` is one of upgrade.verdict.*. `{name}` here is the bank inside a sentence ("slot B"); in upgrade.verdict.* it starts a sentence ("Slot B"). */
  'upgrade.whileRecovery':
    'Kamera darbina savu atkopšanas slotu, un tās pašas jaunināšana raksta {name:loc}, kuru tā nedarbina. {verdict} Šis ir tikai brīdinājums: nekas šeit neaptur jaunināšanu.',
  'upgrade.verdict.notRead': '{name} šajā pārbaudē netika nolasīts, tāpēc nav zināms, kas tajā ir.',
  'upgrade.verdict.blank': '{name} ir tukšs, tāpēc jaunināšana raksta tukšā slotā.',
  'upgrade.verdict.bootableSame':
    '{name} satur to pašu sāknējamo attēlu, kas ir slotā, ko tā darbina, un jaunināšana to aizstāj. Ja jaunināšana apstājas pusceļā, {name:nom} paliek nesāknējams.',
  'upgrade.verdict.bootable':
    '{name} satur sāknējamu attēlu, ko jaunināšana aizstāj. Ja jaunināšana apstājas pusceļā, šis slots paliek nesāknējams.',
  'upgrade.verdict.unknown':
    '{name}: sāknējamība šajā nolasīšanā nav zināma, tāpēc jaunināšana var aizstāt attēlu, ko kamera sāknētu.',
  'upgrade.verdict.notBootable':
    '{name} šajā nolasīšanā nav parādīts kā sāknējams, tāpēc jaunināšana neaizstāj nevienu attēlu, ko kamera sāknētu.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — slots, ko sāknētājs palaida šajā sāknēšanā, kā tas to reģistrē',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'nav nolasīts',
  'report.lastStart.noBank': 'kamera paziņo {word}, kas nenosauc nevienu slotu',
  'report.lastStart.entered': 'kamera paziņo, ka palaida {bank:acc} (aktīvā slota vārds {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'nav versijas',
  'running.why.otherVersion': 'kamera paziņo {version}, bet divi būvējumi ir tikai versijai {only}',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'kamera neatbildēja uz slotu verdiktiem (GetFirmwareInfo selektori 6, 7, 8)',
  'running.why.notRead':
    'slots, no kura atkarīgi verdikti, netika nolasīts, tāpēc atbildes nevar prognozēt',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'kameras atbildes: {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers}, un tieši tā šiem slotiem atbild 8 Hz 1.3.0.8 būvējums ({predicted})',
  'running.why.ff':
    '{answers}, un tieši tā šiem slotiem atbild 16 Hz FF 1.3.0.8 būvējums ({predicted})',
  'running.why.both':
    '{answers}, un abi būvējumi šiem slotiem atbild tieši tā, tāpēc sloti tos neatšķir',
  'running.why.neither':
    '{answers}, un tas neatbilst nevienam būvējumam (8 Hz: {plain}; 16 Hz FF: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'Šī attēla galvene nenosauc aparātprogrammatūras versiju, tāpēc nevar noteikt, vai tas ir būvējums, ko kamera darbina ({camera}). Pārbaudiet, vai tas ir attēls, ko vēlaties ierakstīt.',
  'imageBuild.otherVersion': 'Šis attēls ir aparātprogrammatūra {image}; kamera darbina {camera}.',
  'imageBuild.otherVersionTaken':
    'Šis attēls ir aparātprogrammatūra {image}; kamera darbina {camera}. Šajā līnijā kamera pārbauda tikai to, vai attēls ir pareizi veidots (tā galveni un vārdu summu), nevis tā versiju, tāpēc tā šo attēlu pieņem, un, startējot no šī slota, tā darbina {image}.',
  'imageBuild.otherVersionUnchecked':
    'Šis attēls ir aparātprogrammatūra {image}; kamera darbina {camera}. Vai šī kamera pieņem citu būvējumu un to darbina, nav pārbaudīts.',
  'imageBuild.otherBuild':
    'Šis attēls ir 8 Hz {version} būvējums; kamera darbina 16 Hz {version} FF būvējumu. 16 Hz būvējums apstiprināšanas brīdī pārbauda datus pret savu FF formu un tos, kas pārbaudi neiztur, atsaka, pirms izdzēš slotu (pēc tā pirmkoda). 8 Hz būvējuma ierakstīšana tajā kamerā nav izmēģināta.',
  'imageBuild.runningUnknown':
    'Šis attēls ir 8 Hz {version} būvējums. Kamera darbina {version}, kas pastāv kā 8 Hz un 16 Hz FF būvējums, un tās pašas atbildes nepateica, kuru no tiem tā darbina, tāpēc nevar noteikt, vai šis ir tās būvējums.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': 'dati ir {size} B — par īsu, lai saturētu galveni adresē 0x200',
  'bootFail.noMagic':
    'adresē 0x200 nav attēla maģiskā skaitļa (atrasts {found}, sāknētājam vajag {needs})',
  'bootFail.lengthOutside': 'header.length {length} ir ārpus {size} B datiem',
  'bootFail.lengthNotPayload': 'header.length {length} nav datu garums {size}',
  'bootFail.overStage': '{size} B pārsniedz {max} B sagatavošanas apgabalu',
  'bootFail.plainSum': 'glabātā vārdu summa {sum}, 2014. gada sāknētājam vajag 0',
  'bootFail.noFooter': 'adresē {offset} nav kājenes: dati beidzas adresē {end}',
  'bootFail.footerNotCode':
    'kājene adresē {offset} nav „CODE“ — sāknētājs izmanto savu segmentēto ielādētāju',
  'bootFail.footerLength': 'kājenes garums nav vienāds ar header.length {length}',
  'bootFail.keyASum':
    'atšifrējot ar šīs kameras atslēgu A, vārdu summa ir {sum}, sāknētājam vajag {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'pārbaudīta ar pieņemšanas summu',
  'keyConfidence.structural': 'pārbaudīta tikai ar vektoru tabulu',
  'keyConfidence.unverified': 'nav pārbaudīta',
  /** `{sum}` is hex. */
  'keyCheck.family': 'atslēga pārbaudīta ar pieņemšanas summu {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'atslēga {phrase}; pieņemšanas summa {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'sagatavots ar kameras pašas atslēgām',
  'staging.phrase.slotKeystreamCiphertext': 'sagatavots ar attēla paša atslēgu',
  'staging.phrase.plain': 'sagatavots atklātā veidā',
  'staging.phrase.keyAKeystream':
    'sagatavots tā, kā ražotāja lietotne sagatavo FF attēlu (XOR atslēga A)',
  'staging.phrase.verbatim': 'nosūtīts tāds, kāds dots',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank, inside the sentence ("slot A"); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    '{size} B apstiprināti {name:loc} adresē {address} (ieraksts {staged}); apstiprināšanas statuss {status}',
  'written.noReadWindow':
    'šis būvējums slotam nenosauc lasīšanas logu, tāpēc nekas netika nolasīts kontrolei',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'kontrolnolasīšana neizdevās: {error}',
  'written.readBack': 'kontrolei nolasīti {size} B, SHA-256 {sha256}',
  'written.verifyOff': 'pārbaude izslēgta: slots netika nolasīts kontrolei',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'baitiem, kas pēc plāna prognozes būs slotā (attēls tāds, kādu to glabā 16 Hz būvējums, nevis nosūtītie baiti)',
  'readBack.reference.asSent':
    'baitiem, kas pēc plāna prognozes būs slotā (baiti tādi, kādi tie tika nosūtīti)',
  'readBack.sizeDiffers':
    'kontrolnolasījums ir {size} B, plāns prognozēja {predictedSize} B: slots NEATBILST {reference}',
  'readBack.matchesFolded':
    'slotā ir attēls tāds, kādu to glabā 16 Hz būvējums (nevis nosūtītie baiti), un pārējā slota daļa ir izdzēsta',
  'readBack.matches':
    'slots atbilst baitiem, ko prognozēja plāns (2014. gada atklātā ķēde ieprogrammē tieši to, kas nosūtīts)',
  'readBack.differs': 'slots NEATBILST {reference} (pirmā atšķirība adresē {offset})',
  'readBack.noHeader':
    'kontrolnolasījumā adresē {offset} nav attēla galvenes (maģiskais skaitlis {magic}), tāpēc slots NEATŠIFRĒJAS par gaidīto attēlu',
  'readBack.lengthDiffers':
    'kontrolnolasījuma galvene norāda {length} B, plāna attēls ir {imageLength} B: slots NEATŠIFRĒJAS par gaidīto attēlu',
  'readBack.tooShort':
    'kontrolnolasījums ir {size} B, par īsu {length} B attēlam: slots NEATŠIFRĒJAS par gaidīto attēlu',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'ar atslēgu plūsmu, kas atgūta no kontrolnolasījuma ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': 'slots atšifrējas par gaidīto attēlu ({length} B) {recovered}',
  'readBack.decryptDiffers':
    'slots NEATŠIFRĒJAS par gaidīto attēlu: pirmā atšķirība attēla nobīdē {offset} {recovered}',
  'readBack.rawNotCompared':
    'neapstrādāti baiti: kontrolnolasījums paziņots, bet nav salīdzināts (šajā formā baiti neatšifrējas par prognozējamu atklātu attēlu, un ierīce atkārtoti šifrē to, ko patur)',
  'readBack.notCompared':
    'salīdzināt nebija iespējams: plāns neprognozē ne glabātos baitus, ne atklāto attēlu',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'Atslēga A',
  'keyName.keyA:nom': 'atslēga A',
  'keyName.keyA:gen': 'atslēgas A',
  'keyName.keyA:dat': 'atslēgai A',
  'keyName.keyA:acc': 'atslēgu A',
  'keyName.keyA:ins': 'ar atslēgu A',
  'keyName.keyA:loc': 'atslēgā A',
  'keyName.keyB': 'Atslēga B',
  'keyName.keyB:nom': 'atslēga B',
  'keyName.keyB:gen': 'atslēgas B',
  'keyName.keyB:dat': 'atslēgai B',
  'keyName.keyB:acc': 'atslēgu B',
  'keyName.keyB:ins': 'ar atslēgu B',
  'keyName.keyB:loc': 'atslēgā B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'ierīces atslēga',
  'keyName.perDevice:gen': 'ierīces atslēgas',
  'keyName.perDevice:dat': 'ierīces atslēgai',
  'keyName.perDevice:acc': 'ierīces atslēgu',
  'keyName.perDevice:ins': 'ar ierīces atslēgu',
  'keyName.perDevice:loc': 'ierīces atslēgā',
  'keyName.thePerDevice': 'ierīces atslēga',
  'keyName.thePerDevice:gen': 'ierīces atslēgas',
  'keyName.thePerDevice:dat': 'ierīces atslēgai',
  'keyName.thePerDevice:acc': 'ierīces atslēgu',
  'keyName.thePerDevice:ins': 'ar ierīces atslēgu',
  'keyName.thePerDevice:loc': 'ierīces atslēgā',
  'keyName.applicationKeyA': 'lietotnes atslēga A',
  'keyName.applicationKeyA:gen': 'lietotnes atslēgas A',
  'keyName.applicationKeyA:dat': 'lietotnes atslēgai A',
  'keyName.applicationKeyA:acc': 'lietotnes atslēgu A',
  'keyName.applicationKeyA:ins': 'ar lietotnes atslēgu A',
  'keyName.applicationKeyA:loc': 'lietotnes atslēgā A',
  'keyName.applicationKeyB': 'lietotnes atslēga B',
  'keyName.applicationKeyB:gen': 'lietotnes atslēgas B',
  'keyName.applicationKeyB:dat': 'lietotnes atslēgai B',
  'keyName.applicationKeyB:acc': 'lietotnes atslēgu B',
  'keyName.applicationKeyB:ins': 'ar lietotnes atslēgu B',
  'keyName.applicationKeyB:loc': 'lietotnes atslēgā B',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'atslēgu bloks 1',
  'keyName.block1:gen': 'atslēgu bloka 1',
  'keyName.block1:dat': 'atslēgu blokam 1',
  'keyName.block1:acc': 'atslēgu bloku 1',
  'keyName.block1:ins': 'ar atslēgu bloku 1',
  'keyName.block1:loc': 'atslēgu blokā 1',
  'keyName.theDeviceKey': 'ierīces atslēga',
  'keyName.theDeviceKey:gen': 'ierīces atslēgas',
  'keyName.theDeviceKey:dat': 'ierīces atslēgai',
  'keyName.theDeviceKey:acc': 'ierīces atslēgu',
  'keyName.theDeviceKey:ins': 'ar ierīces atslēgu',
  'keyName.theDeviceKey:loc': 'ierīces atslēgā',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'nezināma atslēga',
  'keyName.unknown:gen': 'nezināmas atslēgas',
  'keyName.unknown:dat': 'nezināmai atslēgai',
  'keyName.unknown:acc': 'nezināmu atslēgu',
  'keyName.unknown:ins': 'ar nezināmu atslēgu',
  'keyName.unknown:loc': 'nezināmā atslēgā',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    '2014. gada atklātā teksta ķēde: katrs slots glabājas atklātā veidā, tāpēc augšupielādes atslēga netiek atvasināta; augšupielāde ir attēls tāds, kāds tas ir',
  'keys.evidence.ffVendor':
    '1.3.0.8 FF (16 Hz) būvējums: neviens šajā nolasīšanā atvērtais slots neglabājas atklātā veidā, tāpēc nav pierādīts, ka kamera ir 2014. gada atklātā teksta ķēdē; FF attēls tiek ierakstīts ražotāja formā, neapstrādāti baiti tiek nosūtīti tādi, kādi doti, un atklāts 8 Hz attēls netiek ierakstīts',
  'keys.evidence.ffUntested':
    'FF attēla ierakstīšana tiek piedāvāta ar brīdinājumu UNTESTED: korpusā nav īsta šī būvējuma sāknētāja, tāpēc nav izmērīts, vai ierakstītais slots sāknējas',
  'keys.evidence.line2016':
    '2016. gada Compact PRO līnija: augšupielāde ir attēls XOR tā paša atslēgu bloka 0 atslēgu plūsma, kas atrasta attēlā pēc vērtības, tāpēc to neveido neviena šīs kameras atslēga',
  'keys.evidence.checkKeyUnnamed':
    'kamera atšifrē augšupielādi ar šo atslēgu un atkārtoti šifrē to ar atslēgu, ar kuru tās sāknētājs pārbauda slotu; šajā nolasīšanā šī atslēga netika nosaukta, un ierakstīšanai tā nav vajadzīga: slots tiek nolasīts kontrolei kā attēls, par ko tas atšifrējas',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'kamera atšifrē augšupielādi ar šo atslēgu un atkārtoti šifrē to ar atslēgu, ar kuru tās sāknētājs pārbauda slotu; šajā nolasīšanā šī atslēga netika nosaukta ({why}), un ierakstīšanai tā nav vajadzīga: slots tiek nolasīts kontrolei kā attēls, par ko tas atšifrējas',
  'keys.evidence.checkKeyNamed':
    'kamera atšifrē augšupielādi ar šo atslēgu un atkārtoti šifrē to ar {key:acc} {hex} — atslēgu, ar kuru tās sāknētājs pārbauda slotu, — tāpēc katrs tās ierakstītais slots glabājas tā, kā to pieņem sāknētājs',
  'keys.evidence.checkKeyInferred':
    'kamera atšifrē augšupielādi ar šo atslēgu un atkārtoti šifrē to ar {key:acc} {hex} — atslēgu, ar kuru tās sāknētājs pārbauda slotu (to secina no {bank:gen}, slota, ko kamera, pēc tās ziņām, palaida un ko sāknētājs palaida bez pārbaudes), — tāpēc katrs tās ierakstītais slots glabājas tā, kā to pieņem sāknētājs',
  'keys.evidence.checkKeyNamedFrom':
    'kamera atšifrē augšupielādi ar šo atslēgu un atkārtoti šifrē to ar {key:acc} {hex} — atslēgu, ar kuru tās sāknētājs pārbauda slotu (to nosaka pēc {bank:gen}, slota, ko kamera, pēc tās ziņām, palaida), — tāpēc katrs tās ierakstītais slots glabājas tā, kā to pieņem sāknētājs',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'sāknēto slotu nevarēja nosaukt, tāpēc atslēgu, ar kuru slots glabājas, nevar no tā nolasīt',
  'keys.refused.notDerived': 'atslēgas nevarēja atvasināt',
  'keys.refused.notDecrypted':
    'sāknētais {bank:nom} neatšifrējas par attēlu, tāpēc atslēgu, ar kuru tas glabājas, nevar nolasīt',
  'keys.refused.noBootKey':
    'sāknētais {bank:nom} neatšifrējas ne ar vienu atslēgu, ko mēģina sāknētājs (tā atslēgu A vai glabāšanas atslēgu), tāpēc atslēgu, ar kuru slots glabājas, nevar no tā nolasīt',
  'keys.refused.keyNotInTable':
    'sāknētais {bank:nom} atšifrējas ar {key:acc}, bet šīs kameras atslēgu tabulā šīs atslēgas nav, tāpēc ar to nevar ierakstīt',
  'keys.refused.noApplicationPair':
    'darbojošā lietotne ({bank}, aparātprogrammatūra {firmware}) nesatur nevienu no zināmajiem atslēgu pāriem (sāknētāja un atkodētos lietotnes pārus) tā, lai katra puse būtu tieši vienreiz, tāpēc tās atslēgu A attēlā nevar atrast',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    zero: 'darbojošā lietotne ({bank}, aparātprogrammatūra {firmware}) nesatur nevienu no zināmajiem atslēgu pāriem (sāknētāja un atkodētos lietotnes pārus) tā, lai katra puse būtu tieši vienreiz, tāpēc tās atslēgu A attēlā nevar atrast (sāknētāja atslēga A sastopama {count} reižu, tā atslēga B — {keyB})',
    one: 'darbojošā lietotne ({bank}, aparātprogrammatūra {firmware}) nesatur nevienu no zināmajiem atslēgu pāriem (sāknētāja un atkodētos lietotnes pārus) tā, lai katra puse būtu tieši vienreiz, tāpēc tās atslēgu A attēlā nevar atrast (sāknētāja atslēga A sastopama {count} reizi, tā atslēga B — {keyB})',
    other:
      'darbojošā lietotne ({bank}, aparātprogrammatūra {firmware}) nesatur nevienu no zināmajiem atslēgu pāriem (sāknētāja un atkodētos lietotnes pārus) tā, lai katra puse būtu tieši vienreiz, tāpēc tās atslēgu A attēlā nevar atrast (sāknētāja atslēga A sastopama {count} reizes, tā atslēga B — {keyB})',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'darbojošā lietotne ({bank}, aparātprogrammatūra {firmware}) pirms ieprogrammēšanas pārbauda augšupielādi ar savām atslēgām (šī būvējuma atkodētais pirmkods mēģina augšupielādi ar tās atslēgu A un glabāšanas atslēgu, tāpat kā tās sāknētājs mēģina slotu), bet atslēga, ar kuru glabājas ieraksti, {key:nom} ({hex}), nav ne tās atslēga A, ne glabāšanas atslēga, tāpēc kamera atteiktu augšupielādi ar 0x50000, pirms kaut ko izdzēš',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'neviens slots neatšifrējas par saimes {family} pieņemšanas summu {sum}',
  'writeRefusal.keyTable': 'šīs kameras atslēgu tabulu nevarēja apstiprināt',
  'writeRefusal.whitening':
    'šīs kameras atslēgu tabula atrisinās ar K={k}, bet {family} šifrē ar K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily':
    'pierādījumi rāda, ka šī kamera ir {detected}, nevis {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'šajā kamerā no šejienes nevar ierakstīt: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Seek 2018. gada un jaunāki būvējumi (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 un Nano 300. Nolasīšana nolasa 63 no 64 zibatmiņas blokiem, neko neatbloķējot; šajos būvējumos neviena nolasīšana nesasniedz bloku adresē {block}. Aparātprogrammatūra glabājas šifrēta. Slotus pa vienam ieraksta cilnē „Darbs ar aparātprogrammatūras slotiem“.',
  'family.summary.early':
    '2014. gada Compact kameras, kas vecākas par 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 un 0.7.0.8. To aparātprogrammatūra nevar atbildēt uz lasīšanas komandu, ko sūta nolasīšana, tāpēc „Sākt nolasīšanu“, „Nolasīt visus selektorus“, cilnes „Informācija“ pilnā nolasīšana un cilne „Darbs ar aparātprogrammatūras slotiem“ pēc versijas nolasīšanas tās nepieņem; ar 0.3.0.1 komanda, ar kuru sākas nolasīšana, tā vietā sagatavotu aparātprogrammatūras jaunināšanu. 0.x/1.x cilnes sesija nolasa 0.7.0.7 un 0.7.0.8 ar citu komandu, uz kuru šie divi būvējumi atbild. Citādi iegūta izmete atšifrējas kā parasti.',
  'family.summary.compact2016':
    'Compact PRO 1.0.3.x būvējumi (1.0.3.0 un 1.0.3.2). Uz nolasīšanu tie atbild tieši tāpat kā 2014. gada Compact, ieskaitot atbloķēšanas marķieri, tāpēc tos atšķir pēc versijas un pēc tā, kā glabājas to sloti: šifrēti, kamēr 2014. gada sloti ir atklāti. 1.0.3.x kamera jau no sākuma tiek nolasīta kā šīs saimes kamera. 0.x/1.x cilnes sesija nolasa visu zibatmiņu, un slotus pa vienam ieraksta cilnē „Darbs ar aparātprogrammatūras slotiem“.',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    '2014. gada Compact no 0.8.0.0 līdz 1.3.0.8, ieskaitot 16 Hz 1.3.0.8 FF būvējumu. Rūpnīcas stāvoklī esoša kamera izdod mazāk par pusi savas zibatmiņas, daļu no tās tikai pēc atbloķēšanas marķiera, ko sūta rīkkopa; 0.x/1.x cilnes sesija pārējo nolasa ar pagaidu ielāpu. Sloti glabājas atklātā veidā, izņemot FF būvējumu. Compact PRO 1.0.3.x kamera tiek nolasīta kā compact-2016 un pāriet uz šejieni tikai tad, ja kāds slots glabājas atklātā veidā vai atšifrējas par {sum}, kā tas ir FF būvējumam. Slotus ieraksta cilnē „Darbs ar aparātprogrammatūras slotiem“ tajos būvējumos, ar kuriem 0.x/1.x cilnes sesija tika izmērīta; jebkurš cits 0.x vai 1.x būvējums tiek tikai nolasīts.',
  'family.summary.generic':
    'Kamera, kurai neatbilst neviena cita saime. `seek-fw dump` to nolasa ar 4.x bloku sarakstu (cilne 4.x/Nano to nepieņem), un atšifrēšana atrisina atslēgu no paša attēla, tāpēc neviens no tiem nav atkarīgs no minējuma. Neviens slots netiek ierakstīts: cilne „Darbs ar aparātprogrammatūras slotiem“ to nepieņem, kamēr kamera nav identificēta.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'attēla galvene norāda',
  'detect.source.camera': 'kamera paziņo',
  'detect.plainArmedNotInForce':
    'vienkāršs 2 baitu BeginFirmwareUpgrade aktivizēja aizsargātu slotu, tātad autentificētais lasīšanas kanāls nav spēkā',
  'detect.modern.plainRefused':
    'vienkāršs 2 baitu BeginFirmwareUpgrade aizsargātam slotam tika ATTEIKTS, ko nedara neviens šīs līnijas būvējums — tā apstrādātājam nav marķiera pārbaudes, un tas pieņem vienkāršo kanālu katram slotam',
  'detect.modern.authArmed':
    'aizsargāts slots tika aktivizēts ar 18 baitu autentificēto selektoru; vienkāršo tur neviens nemēģināja, tāpēc tas nenovieto šo kameru ārpus šīs līnijas',
  'detect.modern.legacyVersion':
    '{said} aparātprogrammatūru {version}, kas ir 0.x / 1.x mantotajā līnijā (cita numerācijas līnija, nevis vecāka 4.x — un viens no šiem būvējumiem arī sasniedz summu {sum})',
  'detect.modern.noSum':
    'neviens slots neatšifrējas par pieņemšanas summu {sum}, ko pieprasa šīs saimes sāknētājs',
  'detect.modern.sum': 'kāds slots atšifrējas par pieņemšanas summu {sum}',
  'detect.modern.version':
    'aparātprogrammatūra {version} ir pēc 2018. gada līnijā, ko aptver šī selektoru karte (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'vienkāršs 2 baitu BeginFirmwareUpgrade aktivizēja aizsargātu slotu, tātad šī nav bloķētā mantotā aparātprogrammatūra',
  'detect.modern.none': 'nav pierādījumu, kas novietotu šo kameru pēc 2018. gada līnijā',
  'detect.early.noVersion':
    'aparātprogrammatūras versija netika ne paziņota, ne atrasta attēla galvenē',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'aparātprogrammatūra {version} ir {first} vai jaunāka, tāpēc tās RPC tabulā ir GetFeaturedFirmwareData lasītājs un darbojas parastais lasīšanas ceļš',
  'detect.early.older':
    '{said} aparātprogrammatūru {version}, kas ir vecāka par {first} — pirmo būvējumu, kura RPC metožu tabulā ir GetFeaturedFirmwareData lasīšanas apstrādātājs (getter)',
  'detect.early.noWindow': 'un neviens logs netika nolasīts, kā to arī paredz šis secinājums',
  'detect.generic.fallback':
    'rezerves variants: neviena aparātprogrammatūras saime pārliecinoši neatbilda, tāpēc nolasīšana paliek pieejama, bet ierakstīšana ne',
  'detect.compact2016.early':
    'aparātprogrammatūra {version} ir vecāka par 0.8.0.0, un tai nav GetFeaturedFirmwareData lasīšanas apstrādātāja — tā ir early-compact, nevis šī saime',
  'detect.compact2016.modernSum':
    'kāds slots atšifrējas par pieņemšanas summu {sum}, kas nav šīs paaudzes mērķis',
  'detect.compact2016.plainArmed':
    'vienkāršs 2 baitu BeginFirmwareUpgrade aktivizēja aizsargātu slotu, tātad šī kamera nav bloķētajā līnijā, kas šai saimei kopīga ar legacy-auth',
  'detect.compact2016.notLine': 'aparātprogrammatūra {version} nav 0.x / 1.x līnijā',
  'detect.compact2016.storedPlain':
    'kāds slots glabājas atklātā veidā — atslēgu plūsmas atrisinājums atgriež identitātes stāvokli, tātad tā glabātie vārdi IR attēls —, un tā ir 2014. gada atklātā teksta ķēde; šīs paaudzes sloti ir xorshift128 ar īstu atslēgu',
  'detect.compact2016.keyedZero':
    'slots, kas glabājas ar īstu xorshift128 atslēgu plūsmu, atšifrējas par pieņemšanas summu {sum}, un tas ir šīs paaudzes šifrs',
  'detect.compact2016.zeroSum':
    'kāds slots atšifrējas par pieņemšanas summu {sum}, kas ir šīs paaudzes mērķis',
  'detect.compact2016.refused':
    'un aizsargāts slots atteica vienkāršo 2 baitu aktivizēšanu, kas raksturīgi bloķētajam apstrādātājam',
  'detect.compact2016.proLine':
    '{said} aparātprogrammatūru {version} — 2016. gada Compact PRO 1.0.3.x līniju',
  'detect.compact2016.compactLine':
    '{said} aparātprogrammatūru {version} — Compact būvējumu, nevis Compact PRO 1.0.3.x līniju',
  'detect.compact2016.lockedLine':
    '{said} aparātprogrammatūru {version}, kas ir 0.x / 1.x līnijā, ko šī paaudze dala ar bloķēto mantoto aparātprogrammatūru',
  'detect.compact2016.bootloader2016':
    'sāknētājs paziņo {version} — 2016. gada paaudzes sāknētājs (1.2.0.0 ir izmērīts ar Compact PRO 1.0.3.0; 2014. gada Compact sāknētājs ir 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'sāknētājs paziņo {version} — 2014. gada paaudzes numerāciju, nevis šīs paaudzes',
  'detect.compact2016.none':
    'netika novērots neviens slots, kas ar īstu atslēgu atšifrētos par nulles pieņemšanas summu',
  'detect.legacy.proLine':
    'bet aparātprogrammatūra {version} ir 2016. gada Compact PRO 1.0.3.x līnija, kuras sloti izmanto compact-2016 šifru: šīs saimes pieņemšanas pārbaude neizturētu nevienu no tiem',
  'detect.legacy.early':
    'aparātprogrammatūra {version} ir vecāka par 0.8.0.0: tās RPC tabulā nav GetFeaturedFirmwareData lasīšanas apstrādātāja (pirms 0.7.0.7 vispār nav, bet 0.7.0.7 un 0.7.0.8 ir tikai iestatītājs) — tā ir early-compact, nevis šī saime',
  'detect.legacy.keyedZero':
    'slots, kas glabājas ar īstu xorshift128 atslēgu plūsmu, atšifrējas par {zero} — 2016. gada Compact PRO šifrs (compact-2016). Šī līnija glabā savus slotus atklātā veidā ar vārdu summu 0 (2014. gada ķēde) vai ar atslēgu uz {sum} (Compact 1.3.0.8), un tās pieņemšanas pārbaude tādu slotu neiztur',
  'detect.legacy.plainChain':
    'slots glabājas kā atklāta aparātprogrammatūra, kuras vārdu summa ir 0, tā, kā to sāknē šīs līnijas 2014. gada sāknētājs',
  'detect.legacy.refused':
    'kamera atteicās atvērt bloķētu slotu jaunināšanai, kad to lūdza bez atbloķēšanas, kā to dara tikai šīs paaudzes aparātprogrammatūra',
  'detect.legacy.unlocked':
    'un tā atvēra to pašu slotu, kad to lūdza ar atbloķēšanu, tātad atbloķēšana, ko sūta šī saime, ir tā, ko pārbauda šī kamera',
  'detect.legacy.notLine':
    '{said} aparātprogrammatūru {version}, kas nav 0.x / 1.x mantotajā līnijā',
  'detect.legacy.authOnly':
    'tā atvēra bloķētu slotu jaunināšanai, kad to lūdza ar atbloķēšanu, kā to dara šīs paaudzes aparātprogrammatūra; lūgums bez atbloķēšanas netika izmēģināts, tāpēc tas vien nepierāda paaudzi',
  'detect.legacy.version':
    'aparātprogrammatūra {version} ir 0.x / 1.x mantotajā līnijā, kas ir cita numerācijas līnija nekā pēc 2018. gada lietotņu versijas, nevis vecāka 4.x',
  'detect.legacy.none': 'nekas novērotais nenorāda uz autentificēto lasīšanas kanālu',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'aizturēts pēc izmēģinājuma kamerā: tur ielāps nepaaugstināja publicēšanas ātrumu, un pēc ierakstīšanas slēdzis nostrādāja katrā kadrā',
  'fps.table.predates':
    'aparātprogrammatūra {version} ir vecāka par 0.8.0.0: tās RPC tabulā nav GetFeaturedFirmwareData lasīšanas apstrādātāja — komandas, ko sūta slota nolasīšana, — tāpēc slotu cilne nenolasa un neieraksta nevienu šī būvējuma slotu, un ielāps netiek piedāvāts',
  'fps.table.stageTwoFf':
    'stage two: 16 Hz FF būvējums tiek sagatavots tā, kā to sagatavo ražotāja lietotne (attēls XOR atslēga A, glabāts ar atslēgu B), nevis kā atklāti baiti, tāpēc tā sagatavošanas pārbaude nav veikta un ielāps vēl netiek piedāvāts',
  'fps.table.stageTwo':
    'stage two: šis ieraksts nav stage-two kopā, tāpēc tā sagatavošanas pārbaude nav veikta un ielāps vēl netiek piedāvāts',
  'fps.table.notOffered': 'netiek piedāvāts',
  'fps.table.notImage':
    'šis nav aparātprogrammatūras attēls, tāpēc kadru ātruma ielāps uz to neattiecas',
  'fps.table.otherBuild':
    'attēls ir {image} būvējums, bet kamera paziņo {camera}; ielāps tiek atteikts, nevis uzlikts būvējumam, kuram tas neatbilst',
  'fps.table.otherBuildNoVersion':
    'attēls ir {image} būvējums, bet kamera nepaziņo versiju; ielāps tiek atteikts, nevis uzlikts būvējumam, kuram tas neatbilst',
  'fps.table.patched': 'kadru ātruma ielāps jau ir uzlikts: šis attēls darbojas ar {hz} Hz',
  'fps.table.earlierPatch':
    'šajā attēlā ir agrāks {hz} Hz kadru ātruma ielāps bez USB labojuma, un ielāps nekad netiek uzlikts attēlam, kuram jau ir ielāps: atjaunojiet rūpnīcas attēlu, pēc tam uzlieciet tam ielāpu',
  'fps.table.atRate': 'šis būvējums jau bez ielāpa darbojas ar {hz} Hz',
  'fps.table.not4821':
    'šis attēls paziņo par Compact 4.8.2.1 būvējumu (vai Compact XR 4.8.2.1, tas pats būvējums), bet nav tas rūpnīcas attēls, kuram kadru ātruma ielāps tika rakstīts (f96ac57eda75: tā 68 baitu komandu lapas, stabilā lapa 13), tāpēc tam kadru ātruma ielāps netiek veidots',
  'fps.table.notInTable':
    'šī attēla nav kadru ātruma ielāpu tabulā, tāpēc šim būvējumam kadru ātruma ielāps netiek veidots. Tabulā ir Compact 0.7.0.8 līdz 1.3.0.8 (8 Hz; 0.7.0.8 slotu kods nepieņem), 1.3.0.8 (16 Hz FF), 4.8.1.7, 4.8.1.9, 4.8.2.1 un 4.16.1.7 FF būvējumi un Compact PRO 1.0.3.x un 4.9.x būvējumi; nevienam citam būvējumam ieraksta nav',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'šī būvējuma plānā nav {bank:gen}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank} šajā būvējumā nevar pieņemt atšifrētu attēlu: {reason}',
  'fps.plan.empty': '{bank:loc} nav atšifrēta attēla, kam uzlikt ielāpu (slots ir tukšs)',
  'fps.plan.noImage':
    '{bank:loc} nav atšifrēta attēla, kam uzlikt ielāpu (tas netika nolasīts, vai neviena atslēga to neatver)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name} tika ierakstīts, bet tā kontrolnolasīšana atšķiras no saglabātā slota ne tikai plānotajā veidā, tāpēc nākamie sloti netika ierakstīti',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build (slots/capability-notes) ----
   * The page shows only this one; it leaves the others out (lib/page-hidden.ts), and the CLI prints them
   * in English. */
  'notes.unverified':
    'Tikai lasīšana. Slotu izkārtojums ir bloķētās līnijas atkodētā tabula, bet šim būvējumam nav izmērīta neviena sagatavošanas forma, tāpēc ierakstīšana netiek plānota.',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'kamera nepaziņoja savu aparātprogrammatūras versiju ({note}); komandas numurs ne katrā Seek aparātprogrammatūrā nozīmē to pašu — Compact 0.3.0.1 pārraides id 0x52, kas aktivizē lasīšanas logu, ir EnterBootloaderMode —, tāpēc, kamēr versija nav zināma, tiek sūtītas tikai GetErrorCode, GetOperationMode un GetFirmwareInfo — nolasīšanas, uz kurām katrs būvējums atbild vienādi',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo neatbildēja ({error}) nevienā no {reads} nolasīšanām ar {spacing} ms intervālu, {window} ms palaišanas logā; kamera, kas vēl startē, šajā logā atbild',
  'identity.note.neverTwice':
    'GetFirmwareInfo ne reizi neatbildēja divreiz pēc kārtas {reads} nolasīšanās',
  'identity.note.noAnswer': 'GetFirmwareInfo neatbildēja ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo neatbildēja ({error}); atbildēja {answered} no {reads} nolasīšanām, nekad divas pēc kārtas, tāpēc nevienu no tām nevar atšķirt no ieraksta, ko atlasītu atstāja kāda agrāka komanda',
  'identity.note.tooShort': {
    zero: 'GetFirmwareInfo atbildēja ar {count} baitiem — par maz versijai',
    one: 'GetFirmwareInfo atbildēja ar {count} baitu — par maz versijai',
    other: 'GetFirmwareInfo atbildēja ar {count} baitiem — par maz versijai',
  },
  'identity.note.tooShortContext': {
    zero: 'GetFirmwareInfo atbildēja ar {count} baitiem — par maz versijai; {context}',
    one: 'GetFirmwareInfo atbildēja ar {count} baitu — par maz versijai; {context}',
    other: 'GetFirmwareInfo atbildēja ar {count} baitiem — par maz versijai; {context}',
  },
  'identity.note.otherRecord':
    'pirmā nolasīšana atbildēja ar citu ierakstu ({version}), uz kuru kāda agrāka komanda bija atstājusi aparātprogrammatūras informācijas selektoru, — šī nolasīšana to notīrīja',
  'identity.note.afterStartup': {
    zero: 'tā atbildēja pēc tam, kad startēšanas laikā bija atteikusi {count} nolasīšanu',
    one: 'tā atbildēja pēc tam, kad startēšanas laikā bija atteikusi {count} nolasīšanu',
    other: 'tā atbildēja pēc tam, kad startēšanas laikā bija atteikusi {count} nolasīšanas',
  },
  'identity.predates':
    'aparātprogrammatūra {version} ir vecāka par izmetes protokolu: tās RPC metožu tabulā nav GetFeaturedFirmwareData lasīšanas apstrādātāja (0.7.0.7 un 0.7.0.8 tas ir reģistrēts tikai kā iestatītājs, bet pirms tam pārraides id 0x4F ir UploadFirmwareRowSize), tāpēc ar to nevar nolasīt nevienu logu; 0.3.0.1 pārraides id 0x52 ir EnterBootloaderMode, nevis BeginFirmwareUpgrade. 0.x/1.x cilnes sesija tā vietā nolasa 0.7.0.7 un 0.7.0.8 ar pārraides id 0x58 (GetFeaturedData)',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': '{operation} atteikta: {reason}',
  'identity.refusingNoVersion':
    '{operation} atteikta: {reason}. Nekas netika aktivizēts. Atvienojiet kameru, pievienojiet to atkal, ļaujiet tai pilnībā startēt un mēģiniet vēlreiz.',
  'identity.operation.dump': 'nolasīšana',
  'identity.operation.dumpAll': 'visu selektoru nolasīšana',
  'identity.operation.readInfo': 'ierīces informācijas nolasīšana',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'slotus izvēlas pēc rezerves kopijas, kas tos nolasa, — vispirms palaidiet rezerves kopiju',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'slotus nevar mainīt, kad ierakstīšana ir notikusi vai mēģināta: šīs sesijas ierakstīšanas mērķis — {banks}, un atjaunošana atliek atpakaļ tieši tos',
  'preserve.banks.none': 'neviens slots',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Ierakstīts.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Nolasīts. Nolasāmi sloti: {count}/{of}.',
  'status.readRefused':
    'Nolasīts, bet nevienu šīs kameras slotu no šejienes nevar ierakstīt — skatiet žurnālu.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Aparātprogrammatūras versija',
  'compare.field.imageId': 'Attēla id',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'Sākotnējais SP',
  'compare.field.resetVector': 'Atiestates vektors',
  'compare.field.size': 'Izmērs',
  'compare.field.shaExpected': 'Gaidītā atklātā attēla SHA-256',
  'compare.field.sha': 'Attēla SHA-256',
  'compare.field.shaNotStored': 'Gaidītā atklātā attēla SHA-256 (glabātie baiti nav prognozēti)',
  'compare.field.key': 'Atslēga',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(nav attēla)',
  'compare.notImage': '(nav attēls)',
  'compare.notPredicted': '(nav prognozēts: ierīce izlemj, ko glabāt)',
  'compare.plaintext': 'nav (atklāts teksts)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'nevarēja divreiz nolasīt vienādi',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (atslēgu, ar kuru sāknētājs pārbauda slotu, secina no {bank:gen}, ko tas palaida bez pārbaudes) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered': '{bank}, kā to reģistrē kamera (aktīvā slota vārds {word})',
  'preserve.lastStart.notRead': 'nav zināms — aktīvā slota vārdu nevarēja nolasīt',
  'preserve.lastStart.noBank':
    'nav zināms — aktīvā slota vārds ir {word}, kas nenosauc nevienu slotu',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'nav zināms — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'netiek ierakstīts — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'attēls',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — var ierakstīt',
  'preserve.bank.writablePatch': '{build} — var ierakstīt; ielāps maina baitus: {count}',
  'preserve.bank.writableEdit': '{build} — var ierakstīt; satur {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — var ierakstīt; ielāps maina baitus: {count}; satur {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead':
    'rezerves kopija vēl nav nolasījusi slotus, tāpēc nevienu slotu nevar izvēlēties',
  'preserve.choice.every': 'katrs slots, kurā ir attēls: {banks}',
  'preserve.choice.everyBlocked':
    'ne katru slotu, kurā ir attēls, var ierakstīt: {bank} nevar — {reason}',
  'preserve.choice.noImage': 'nevienā slotā nav attēla, ko sesija var ierakstīt',
  'preserve.choice.nextStart': '{bank} — slots, no kura notiks nākamā sāknēšana: {why}',
  'preserve.choice.nextStartRefused':
    'nākamā sāknēšana palaidīs {bank:acc} ({why}), un sesija to nevar ierakstīt: {reason}',
  'preserve.choice.everyUnknownStart':
    'katrs slots, kurā ir attēls ({banks}): nav zināms, no kura slota notiks nākamā sāknēšana ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'nav zināms, no kura slota notiks nākamā sāknēšana ({why}), un {reason}; izvēlieties slotu pēc nosaukuma',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank}: nevar ierakstīt — {reason}',
  'preserve.choice.byName': '{banks} (izvēle pēc nosaukuma)',
  'preserve.choice.warnNotPatched':
    'Nākamā sāknēšana palaidīs {bank:acc} ({why}), un šī izvēle tam neuzliek ielāpu: pēc restartēšanas kamera darbina šī slota oriģinālo attēlu, tāpēc visas zibatmiņas nolasīšana apstājas, pirms kaut ko nolasa. Atjaunošana joprojām atliek atpakaļ katru ierakstīto slotu.',
  'preserve.choice.warnUnknownStart':
    'Nav zināms, no kura slota notiks nākamā sāknēšana ({why}). Ja tā notiks no slota, kuram šī izvēle neuzliek ielāpu, visas zibatmiņas nolasīšana apstāsies, pirms kaut ko nolasīs.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'vēl nav zināms',
  'preserve.build.firmware': 'aparātprogrammatūra {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'tādā veidā, kādā to glabā kamera (šī kamera glabā aparātprogrammatūru nešifrētu)',
  'preserve.stagedForm.oneKey': 'formā, kādā to glabā kamera (šifrēts ar kameras atslēgu)',
  'preserve.stagedForm.twoKeys': 'formā, kādā to glabā kamera (šifrēts ar abām kameras atslēgām)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'katrs ierakstītais slots saņem atpakaļ tieši tos baitus, ko rezerves kopija no tā nolasīja',
  'preserve.restoreForm.factoryStaged':
    'katrs ierakstītais slots saņem atpakaļ savu oriģinālo aparātprogrammatūru, kas ierakstīta formā, kādā to glabā kamera, tāpēc slots beigās baitu pa baitam sakrīt ar to, ko nolasīja rezerves kopija',
  'preserve.restoreForm.none':
    'šajā būvējumā nav iespējams: neviena oriģinālās aparātprogrammatūras forma neiztur kameras pašas pārbaudi un vienlaikus netiek saglabāta kā oriģinālie baiti, tāpēc sesija beidzas ar pilnu attēlu un ielāpu joprojām vietā',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'šajā būvējumā nav iespējams: aparātprogrammatūra ar ielāpu nevar nolasīt visu zibatmiņu, tāpēc sesijai nav pilna attēla, ko dot',
  'preserve.drain.rotated':
    'kamera to pasniedz pagrieztu, un sesija to saliek atpakaļ pareizā secībā',
  'preserve.drain.hazard': 'ielāps izvairās no nolasīšanas, kas šajā būvējumā avarē kameru',
  'preserve.drain.whole': 'visa 4 MB zibatmiņa vienā nolasīšanā, pa {size} baitiem',
  'preserve.drain.wholeNotes': 'visa 4 MB zibatmiņa vienā nolasīšanā, pa {size} baitiem; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'ļauj kameras lasīšanas komandai sasniegt visu 4 MB zibatmiņu, ne tikai pirmos 64 KB',
  'preserve.site.countPast':
    'ļauj lasīšanas pozīcijai skaitīt tālāk par 64 KB, lai nolasīšana neatgrieztos sākumā',
  'preserve.site.keepPosition':
    'saglabā visu lasīšanas pozīciju, kad tā pēc katras nolasīšanas virzās tālāk',
  'preserve.site.savePosition': 'pilnībā saglabā pavirzīto lasīšanas pozīciju',
  'preserve.site.clearPosition':
    'katras nolasīšanas sākumā notīra visu lasīšanas pozīciju, lai kameru pēc visas zibatmiņas nolasīšanas joprojām varētu nolasīt',
  'preserve.site.modeTwoGuard':
    'ļauj visas zibatmiņas nolasīšanai sākties kā jebkurai citai nolasīšanai (rūpnīcas aparātprogrammatūra to noraida)',
  'preserve.site.modeTwoIndirection':
    'novirza visas zibatmiņas nolasīšanu uz zibatmiņas sākumu (rūpnīcas aparātprogrammatūra to novirza uz vērtību, kas avarē kameru)',
  'preserve.site.armTail': 'noņem izsaukumu, kas šajā būvējumā nolasīšanas sākumā sasaldē kameru',
  'preserve.site.other': 'maina vienu instrukciju, kas vajadzīga visas zibatmiņas nolasīšanai',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Rezerves kopija',
  'preserve.step.patch': 'Ielāps',
  'preserve.step.commit': 'Ierakstīšana',
  'preserve.step.drain': 'Visas zibatmiņas nolasīšana',
  'preserve.step.restore': 'Atjaunošana',
  'preserve.step.verify': 'Pārbaude',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'ielāpa solis',
  'preserve.stepId.commit': 'ierakstīšanas solis',
  'preserve.stepId.drain': 'visas zibatmiņas nolasīšanas solis',
  'preserve.stepId.restore': 'atjaunošanas solis',
  'preserve.stepId.verify': 'pārbaudes solis',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: apturēts, kā plānots — kamera palaida {bank:acc}, kuram šī sesija nebija uzlikusi ielāpu, tāpēc nekas netika nolasīts.',
  'preserve.result.noReason': 'iemesls netika reģistrēts',
  'preserve.result.stopped': '{label}: apturēts — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none':
    'nevienā slotā nav aparātprogrammatūras, kurai sesija var uzlikt ielāpu',
  'preserve.result.writable.one':
    'aparātprogrammatūra, kurai sesija var uzlikt ielāpu, ir {banks:loc}',
  'preserve.result.writable.many':
    'aparātprogrammatūra, kurai sesija var uzlikt ielāpu, ir {banks:loc}',
  'preserve.result.backup':
    '{label}: saglabāts katrs bloks, ko sasniedz parasta nolasīšana; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'slots, kas nav zināms',
  'preserve.result.backupNext':
    '{label}: saglabāts katrs bloks, ko sasniedz parasta nolasīšana; {writable}; nākamā sāknēšana: {next}.',
  'preserve.result.patch': '{label}: izveidots {banks:dat}.',
  /** The patch step when every bank was refused: nothing to build for. */
  'preserve.result.patchNone':
    '{label}: ielāps netika izveidots: nevienā slotā nav aparātprogrammatūras, kurai sesija var uzlikt ielāpu.',
  'preserve.result.patchCount':
    '{label}: izveidots {banks:dat}; mainīto baitu skaits katrā: {count}.',
  'preserve.result.commitOne': '{label}: {banks} ierakstīts ar ielāpu, un kamera to pieņēma.',
  'preserve.result.commitMany': '{label}: {banks} ierakstīti ar ielāpu, un kamera pieņēma katru.',
  'preserve.result.drainNotRead': '{label}: nav nolasīts.',
  'preserve.result.drain':
    '{label}: nolasīta visa 4 MB zibatmiņa; pilnā attēla sha256 ir {sha256}.',
  'preserve.result.drainThrough':
    '{label}: visa 4 MB zibatmiņa nolasīta caur {bank:acc}; pilnā attēla sha256 ir {sha256}.',
  'preserve.result.restore': '{label}: ierakstīts atpakaļ: {banks}.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}: ierakstīts atpakaļ {form}: {banks}.',
  'preserve.result.verifyDone': '{label}: gatavs.',
  'preserve.result.verifyIdentical':
    '{label}: vēlreiz nolasīti bloki: {blocks}, atšķiras 0 baitu — kameras zibatmiņa baitu pa baitam sakrīt ar rezerves kopiju.',
  'preserve.result.verifyDiffers':
    '{label}: vēlreiz nolasīti bloki: {blocks}, atšķirīgi baiti: {bytes}.',
  'preserve.result.verifyDiffersUnread': {
    zero: '{label}: vēlreiz nolasīti bloki: {blocks}, atšķirīgi baiti: {bytes}, {count} bloku nevarēja nolasīt.',
    one: '{label}: vēlreiz nolasīti bloki: {blocks}, atšķirīgi baiti: {bytes}, {count} bloku nevarēja nolasīt.',
    other:
      '{label}: vēlreiz nolasīti bloki: {blocks}, atšķirīgi baiti: {bytes}, {count} blokus nevarēja nolasīt.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Apturēts pirms visas zibatmiņas nolasīšanas: kamera palaida slotu, kuram šī sesija nebija uzlikusi ielāpu, tāpēc nekas netika nolasīts.',
  'preserve.unpatchedStart.next':
    'Tālāk: atjaunošana atliek atpakaļ katru ierakstīto slotu. Visas zibatmiņas nolasīšana netiek mēģināta vēlreiz: kamera palaistu to pašu slotu.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Gatavs — jūsu aparātprogrammatūra ir saglabāta',
  'preserve.done.detail':
    'Pilnais attēls ir visa kameras oriģinālā zibatmiņa, un pati kamera ir atjaunota tieši tāda, kāda tā bija.',
  'preserve.done.titleNoImage': 'Gatavs — kamera ir atjaunota, kāda tā bija; pilna attēla nav',
  'preserve.done.detailNoImage':
    'Visas zibatmiņas nolasīšana nenotika, tāpēc šai sesijai nav pilna zibatmiņas attēla. Katrs ierakstītais slots tika atjaunots, un jauna to bloku nolasīšana, ko sasniedz parasta izmete, sakrīt ar rezerves kopiju. Lai iegūtu pilnu attēlu, sāciet jaunu sesiju ar izvēli, kas ietver slotu, no kura notiks nākamā sāknēšana.',
  'preserve.done.detailNoImageCount':
    'Visas zibatmiņas nolasīšana nenotika, tāpēc šai sesijai nav pilna zibatmiņas attēla. Katrs ierakstītais slots tika atjaunots, un jauna to bloku nolasīšana, ko sasniedz parasta izmete (bloku skaits: {blocks}), sakrīt ar rezerves kopiju. Lai iegūtu pilnu attēlu, sāciet jaunu sesiju ar izvēli, kas ietver slotu, no kura notiks nākamā sāknēšana.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'kameras logu lasītājam ir ierobežojums vienai palaišanai, un šīs nolasīšanas atgriezās no izsmelta lasītāja — izslēdziet un ieslēdziet kameru (atvienojiet un pievienojiet atkal vai izmantojiet tās barošanas slēdzi), pēc tam vēlreiz palaidiet `preserve --resume <run-directory>`. Paraksts: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'kameras logu lasītājam ir ierobežojums vienai palaišanai, un šīs nolasīšanas atgriezās no izsmelta lasītāja — izslēdziet un ieslēdziet kameru (atvienojiet un pievienojiet atkal vai izmantojiet tās barošanas slēdzi), pēc tam vēlreiz palaidiet `preserve --resume <run-directory>`. Paraksts: {signature} — no šiem baitiem nevar atvasināt rūpnīcas atklāto tekstu. Tika izmēģināts katrs veids, kā to nolasīt:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'rezerves kopijā nav {bank:gen} ({address}) — rūpnīcas logi to nevar pasniegt',
  'preserve.fail.readsDisagree':
    'abas {bank:gen} nolasīšanas nesakrīt (sha256 {sha256} pret {other}) — kamera, kas nevar divreiz pēc kārtas pasniegt slotu, ko tā darbina, nav kamera, kurā rakstīt; šī nolasīšana ir atjaunošanas avots un ielāpa atvasināšanas ievade',
  'preserve.fail.notFactory':
    '{bank:loc} nav rūpnīcas attēla tādā formā, kādā to glabā šī būvējuma šifrs (gaidītais attēla sākums neatbilst nolasītajam), — atteikts, pirms kaut kas tiek reģistrēts, nemaz nerunājot par ierakstīšanu',
  'preserve.fail.ffSum':
    'aparātprogrammatūra ar ielāpu formā, kādā to glabā kamera, neiztur šī būvējuma pašas pārbaudi (tās summai jābūt {sum}) — atteikts nosūtīt slotu, ko kamera pēc dzēšanas noraidītu',
  'preserve.fail.headChanged':
    '{bank:gen} sākums kopš rezerves kopijas ir mainījies (tajā nav ne oriģinālās nolasītās versijas, ne baitu ar ielāpu) — atteikts rakstīt pāri nezināmam slota stāvoklim; nekas netika ierakstīts. Sākuma hex: tagad {live} pret nolasīto {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    'baiti ar ielāpu jau ir {banks:loc} — ierakstīšana notika iepriekšējā mēģinājumā, un to nedrīkst atkārtot. Atsāciet ar visas zibatmiņas nolasīšanas soli (--resume), kas sāknē attēlu ar ielāpu un turpina no turienes.',
  'preserve.fail.landed':
    'baiti ar ielāpu jau ir {banks:loc} — ierakstīšana notika iepriekšējā mēģinājumā, un to nedrīkst atkārtot. Atsāciet ar visas zibatmiņas nolasīšanas soli (--resume), kas sāknē attēlu ar ielāpu un turpina no turienes.',
  'preserve.fail.drainRebootRefused':
    'visas zibatmiņas nolasīšanas restartēšanas komandu resursdators ATTEICA, pirms tā tika nosūtīta (SecurityError: pārlūkprogrammas politika vai testa aizsargs), tāpēc kamera joprojām darbina attēlu, ar kuru tā sāknējās, nevis apstiprināto ielāpu. Visas zibatmiņas nolasīšana lasa tikai caur attēla ar ielāpu paplašināto logu, tāpēc tā apstājas, pirms kaut ko aktivizē; nekas netika nolasīts. Palaidiet visas zibatmiņas nolasīšanu vēlreiz tur, kur resursdators ļauj restartēšanas komandai iziet cauri.',
  'preserve.fail.shiftedRebootRefused':
    'visas zibatmiņas nolasīšana atgriezās par vienu lapu augstāk, un restartēšanu, kas dod citu palaišanu, resursdators ATTEICA, pirms tā tika nosūtīta (SecurityError: pārlūkprogrammas politika vai testa aizsargs) — vēl viens mēģinājums nolasītu to pašu nobīdīto palaišanu. Nekas netika saglabāts; palaidiet visas zibatmiņas nolasīšanu vēlreiz tur, kur atiestatīšana var iziet cauri.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    zero: 'pārbaudē {read}/{total} logos nolasīts {count} atšķirīgu baitu — mikroshēma atkārtotā nolasīšanā nav baitu pa baitam identiska rezerves kopijai',
    one: 'pārbaudē {read}/{total} logos nolasīts {count} atšķirīgs baits — mikroshēma atkārtotā nolasīšanā nav baitu pa baitam identiska rezerves kopijai',
    other:
      'pārbaudē {read}/{total} logos nolasīti {count} atšķirīgi baiti — mikroshēma atkārtotā nolasīšanā nav baitu pa baitam identiska rezerves kopijai',
  },
  'preserve.fail.verifyIn': {
    zero: 'pārbaudē {read}/{total} logos nolasīts {count} atšķirīgu baitu (vietās: {places}) — mikroshēma atkārtotā nolasīšanā nav baitu pa baitam identiska rezerves kopijai',
    one: 'pārbaudē {read}/{total} logos nolasīts {count} atšķirīgs baits (vietās: {places}) — mikroshēma atkārtotā nolasīšanā nav baitu pa baitam identiska rezerves kopijai',
    other:
      'pārbaudē {read}/{total} logos nolasīti {count} atšķirīgi baiti (vietās: {places}) — mikroshēma atkārtotā nolasīšanā nav baitu pa baitam identiska rezerves kopijai',
  },
  'preserve.fail.verifyShort': {
    zero: 'pārbaudē {read}/{total} logos nolasīts {count} atšķirīgu baitu (īsi logi: {short}) — mikroshēma atkārtotā nolasīšanā nav baitu pa baitam identiska rezerves kopijai',
    one: 'pārbaudē {read}/{total} logos nolasīts {count} atšķirīgs baits (īsi logi: {short}) — mikroshēma atkārtotā nolasīšanā nav baitu pa baitam identiska rezerves kopijai',
    other:
      'pārbaudē {read}/{total} logos nolasīti {count} atšķirīgi baiti (īsi logi: {short}) — mikroshēma atkārtotā nolasīšanā nav baitu pa baitam identiska rezerves kopijai',
  },
  'preserve.fail.verifyInShort': {
    zero: 'pārbaudē {read}/{total} logos nolasīts {count} atšķirīgu baitu (vietās: {places}) (īsi logi: {short}) — mikroshēma atkārtotā nolasīšanā nav baitu pa baitam identiska rezerves kopijai',
    one: 'pārbaudē {read}/{total} logos nolasīts {count} atšķirīgs baits (vietās: {places}) (īsi logi: {short}) — mikroshēma atkārtotā nolasīšanā nav baitu pa baitam identiska rezerves kopijai',
    other:
      'pārbaudē {read}/{total} logos nolasīti {count} atšķirīgi baiti (vietās: {places}) (īsi logi: {short}) — mikroshēma atkārtotā nolasīšanā nav baitu pa baitam identiska rezerves kopijai',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'sāknēšanas konfigurācijas bloks',
  'preserve.fail.dataBlock': 'datu bloks',

  'preserve.refused.secondRead': 'tā otrā nolasīšana neizdevās ({error})',
  'preserve.refused.readsDisagree': 'tā abas nolasīšanas nesakrīt (sha256 {sha256} pret {other})',
  'preserve.refused.erased': 'tas ir izdzēsts',
  'preserve.refused.watchdogMark':
    'tā galvenes vārds +0x200 satur {word} — atzīmi, ko sāknētājs ieraksta pāri slotam pēc sargtaimera (watchdog) atiestates palaišanas sākumā; sāknētājs šo slotu vairs nepieņem, un sesijai tur nav attēla, kam uzlikt ielāpu',
  'preserve.refused.noHeader': 'tajā +0x200 nav attēla galvenes',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'tajā ir {image} ({id}), nevis būvējums, ko darbina kamera ({camera})',
  'preserve.refused.otherKey':
    'sāknētāja pārbaude to nepieņem: tas glabājas ar citu atslēgu, nevis to, ar kuru šīs kameras sāknētājs pārbauda slotus, un ierakstīšana caur kameru to saglabātu ar to atslēgu, tāpēc atjaunošana nevarētu atlikt atpakaļ tā precīzos baitus',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'kamera paziņo aparātprogrammatūru {camera}, vajag {version} — ielāps ir atvasināts no viena būvējuma baitiem, un to nedrīkst sūtīt citam',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'aparātprogrammatūra {version} nav 0.x vai 1.x būvējums, un šī sesija aptver tikai 2014. un 2016. gada būvējumus. Netika nolasīts nekas, izņemot versiju. Tā vietā nolasiet šo kameru ar „Nolasīt un atšifrēt 4.x/Nano“: tā nolasa zibatmiņu bez ielāpa, katru bloku, izņemot to, kas adresē 0x14060000, ko šajos būvējumos nesasniedz neviens lasīšanas logs.',
  'preserve.refused.preWidening':
    'aparātprogrammatūra {version} ir vecāka par paplašināšanas ceļu, un sesija atsakās, nevis raksta pāri slotam, ko tā nevar nolasīt atpakaļ. Šajā paaudzē kamera noraida katru veidu, kā sākt šim ceļam vajadzīgo nolasīšanu (izmērīts ar 0.3.0.1), tās lasīšanas komanda nesasniedz zibatmiņas sākumu, un izmērs, ko ielāps mainītu, glabājas citādi. Tai nav arī nolasīšanas, ko varētu izmantot standarta izmete. Netika nolasīts nekas, izņemot versiju.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'satur nezināmu attēlu (nevis rūpnīcas {version} aparātprogrammatūru, nedz tās izmaiņu, ko zina 0.x/1.x cilne), tāpēc 0.x/1.x cilne tam neuzliek ielāpu un to neatjauno',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'satur zināmu kadru ātruma būvējumu: rūpnīcas {version} aparātprogrammatūru ar {hz} Hz kadru ātruma ielāpu. 0.x/1.x cilne uzliek ielāpu tikai rūpnīcas aparātprogrammatūrai, nekad attēlam, kuram jau ir ielāps, tāpēc tā šim slotam neuzliek ielāpu un to neatjauno',
  'preserve.image.frameRateEarlier':
    'satur zināmu kadru ātruma būvējumu: rūpnīcas {version} aparātprogrammatūru ar agrāku {hz} Hz kadru ātruma ielāpu (izveidotu, pirms tam pievienoja USB labojumu). 0.x/1.x cilne uzliek ielāpu tikai rūpnīcas aparātprogrammatūrai, nekad attēlam, kuram jau ir ielāps, tāpēc tā šim slotam neuzliek ielāpu un to neatjauno',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    'tas {what}. Lai iekļautu šo slotu, vispirms ierakstiet tajā atpakaļ rūpnīcas attēlu (piemēram, no pilnas zibatmiņas rezerves kopijas, kas iegūta pirms izmaiņām), pēc tam sāciet jaunu sesiju',
  'preserve.image.frameRateWords':
    'tas {what}. Lai iekļautu šo slotu, vispirms ierakstiet tajā atpakaļ rūpnīcas attēlu (piemēram, no pilnas zibatmiņas rezerves kopijas, kas iegūta pirms kadru ātruma ielāpa), pēc tam sāciet jaunu sesiju; kadru ātruma ielāpu pēc tam var atkal uzlikt rūpnīcas attēlam',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name} {what}. Sesija ņem aparātprogrammatūru, kurai uzliek ielāpu, no šī slota, tāpēc tā apstājas šeit, pirms kaut kas tiek ierakstīts. Lai saglabātu šīs kameras aparātprogrammatūru, vispirms ierakstiet {bank:loc} atpakaļ rūpnīcas attēlu (piemēram, no pilnas zibatmiņas rezerves kopijas, kas iegūta pirms izmaiņām), pēc tam sāciet jaunu sesiju.',
  'preserve.image.frameRateRefusal':
    '{name} {what}. Sesija ņem aparātprogrammatūru, kurai uzliek ielāpu, no šī slota, tāpēc tā apstājas šeit, pirms kaut kas tiek ierakstīts. Lai saglabātu šīs kameras aparātprogrammatūru, vispirms ierakstiet {bank:loc} atpakaļ rūpnīcas attēlu (piemēram, no pilnas zibatmiņas rezerves kopijas, kas iegūta pirms kadru ātruma ielāpa), pēc tam sāciet jaunu sesiju; kadru ātruma ielāpu pēc tam var atkal uzlikt rūpnīcas attēlam.',
  'preserve.image.otherFirmware':
    'tajā ir aparātprogrammatūra {image}, nevis {camera}, ko darbina kamera',
  'preserve.image.otherFirmwareRefusal':
    '{name} satur aparātprogrammatūru {image}, nevis {camera}, ko darbina kamera, tāpēc šai sesijai tur nav attēla, kam uzlikt ielāpu, un tā atsakās rakstīt tam pāri.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'no tā neatvasinās neviens attēls, kam sesija var uzlikt ielāpu ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone': 'šī sesija ir pabeigta — visi soļi izpildīti (sesija {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    '{step} šajā sesijā jau ir izpildīts (pabeigts {finished}) — atsākšana turpina ar {next}',
  'preserve.gate.stepDoneUnknownTime':
    '{step} šajā sesijā jau ir izpildīts (nezināmā laikā) — atsākšana turpina ar {next}',
  'preserve.gate.backupRerun':
    'rezerves kopiju nevar palaist vēlreiz: šī sesija jau ir pabeigusi {steps}, un tās nākamais solis ir {next} — izmantojiet --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'iepriekšējais rezerves kopijas mēģinājums neizdevās, un kameras barošana ir JĀPĀRSLĒDZ, pirms šis solis tiek palaists vēlreiz — atkārtojums tajā pašā palaišanā var nolasīt novecojušus vai tukšus baitus (izmērīts: atkārtota rezerves kopija nolasīja sāknētāja startēšanas vārdu sāknēšanas konfigurācijas ieraksta vietā). Izslēdziet un ieslēdziet kameru (atvienojiet un pievienojiet atkal vai izmantojiet tās barošanas slēdzi), pēc tam vēlreiz palaidiet rezerves kopiju un, kad tiek jautāts, apstipriniet barošanas pārslēgšanu: sesija to nevar redzēt. Reģistrētā kļūme: {error}',
  'preserve.gate.noErrorText': '(nav kļūdas teksta)',
  'preserve.gate.patchAfterBackup':
    '{step} notiek pēc rezerves kopijas: sesija nolasa katru apgabalu, ko var nolasīt rūpnīcas plāns, un saglabā to, PIRMS notiek jebkas cits — šī rezerves kopija ir vienīgā šīs kameras kopija. Vispirms palaidiet rezerves kopijas soli.',
  'preserve.gate.commitAfterBackup': '{step} notiek pēc rezerves kopijas (skatiet ielāpa soli)',
  'preserve.gate.commitAfterPatch': '{step} notiek pēc ielāpa soļa, kas reģistrē, ko tas sagatavo',
  'preserve.gate.commitNeedsPatch':
    '{step}: vajadzīgs {banks:gen} ielāps, bet ielāpa solis nav reģistrējis nevienu — palaidiet ielāpa soli vēlreiz',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step}: sesijas mapē trūkst vajadzīgo rezerves kopijas failu: {files} — bez tiem ierakstīšanai nav atjaunošanas avota, tāpēc tā atsakās darboties',
  'preserve.gate.drainNoCommit':
    '{step} lasa daļu AR IELĀPU caur paplašināto logu, bet šai sesijai nav pabeigtas ierakstīšanas — visas zibatmiņas nolasīšana rūpnīcas stāvokļa kamerā iestrēgtu. Vispirms palaidiet ierakstīšanu (vai atsāciet ar to) vai skaidri pārlēciet (allowJump), ja ierakstīšana notika bez kontrolpunkta.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused':
    'visas zibatmiņas nolasīšanas solis atsakās darboties ({build}): {note}',
  'preserve.gate.detectedBuild': 'noteiktais būvējums',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'visas zibatmiņas nolasīšanas solis atsakās darboties ({build}): visas zibatmiņas nolasīšanas sākšana šī būvējuma aparātprogrammatūrā bez ielāpa avarē kameru (tā lasa no vērtības, kas nav zibatmiņas adrese; izmērīts emulatorā: pasniegti 32 KB, pēc tam kamerā radās kļūme). Izmaiņa, kas padara nolasīšanu drošu, atrodas adresēs {sites}, un tā nav starp izmaiņām, ko šī sesija reģistrēja {bank:dat} — pirms visas zibatmiņas nolasīšanas palaidiet ielāpa soli (un pabeidziet ierakstīšanu).',
  'preserve.gate.drainFiles':
    '{step}: vajag {files} (piegādātā izmete tiek apstrādāta ar katra ierakstītā slota nolasījumu), bet tā nav sesijas mapē',
  'preserve.gate.restoreNoCommit':
    '{step} atliek atpakaļ oriģinālos slotus pāri ielāpam, bet šai sesijai nav pabeigtas ierakstīšanas — nav nekā, ko tas varētu atsaukt. Vispirms palaidiet ierakstīšanu (vai atsāciet ar to) vai skaidri pārlēciet (allowJump), lai atjaunotu kameru, kurai jau ir ielāps.',
  'preserve.gate.restoreNeedsPatch':
    '{step}: vajag katra ierakstītā slota ielāpa kopsavilkumu (sagatavotajam garumam) — vispirms palaidiet ielāpa soli',
  'preserve.gate.restoreNoForm':
    'atjaunošanas solis atsakās darboties ({build}): neviena oriģinālās aparātprogrammatūras forma neiztur kameras pašas pārbaudi un vienlaikus netiek saglabāta kā oriģinālie baiti — oriģinālās aparātprogrammatūras kontrolsumma ir 0xB7AB9D17 (izmērīts), nevis 0xFFFF, ko pieprasa kamera. Šī sesija beidzas ar pilnu attēlu rokās un ielāpu vietā; oriģinālo saturu var atlikt atpakaļ tikai ar visas zibatmiņas programmatoru.',
  'preserve.gate.restoreFiles':
    '{step}: vajag {files} (katra ierakstītā slota oriģinālu no rezerves kopijas soļa), bet tā nav sesijas mapē',
  'preserve.gate.verifyNoRestore':
    '{step} salīdzina jaunu palaišanu ar rezerves kopiju, bet šai sesijai nav pabeigtas atjaunošanas — slots ar ielāpu parādītos kā atšķirības. Vispirms palaidiet atjaunošanu (vai atsāciet ar to) vai skaidri pārlēciet (allowJump), ja atjaunošana notika bez kontrolpunkta.',
  'preserve.gate.verifyNeedsBackup':
    '{step}: vajag {file} (salīdzinājuma atsauci), bet tā nav sesijas mapē',
  'preserve.gate.needsBanks':
    '{step}: vajag slotus, ko nolasīja rezerves kopijas solis, bet stāvoklī to nav',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'šai sesijai nav izvēlēts neviens slots: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank}: nevar ierakstīt — {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'šī būvējuma ielāps sāknējas tikai no atkopšanas slota R: {note} — sesija ierakstītu {bank:loc}, no kura sāknētājs to nekad nepalaiž',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'fails ir par mazu, lai saturētu attēla galveni',
  'slots.image.notWordSized': 'attēla izmēram jābūt 4 daudzkārtnim (saņemts {size} B)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'attēls ir {size} B; sāknētājs noraida jebkuru header.length >= {limit}, tāpēc tas nekad nesāknētos',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'adresē {at} nav attēla galvenes (maģiskais skaitlis {magic}, gaidīts {expected}) — tam jābūt atšifrētam Seek aparātprogrammatūras attēlam, nevis šifrētam slotam vai zibatmiņas izmetei',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'sākotnējais steka rādītājs {address} nav LPC43xx SRAM atmiņā — tas neizskatās atšifrēts',
  'slots.image.stackUnaligned': 'sākotnējais steka rādītājs {address} nav izlīdzināts pēc vārda',
  'slots.image.notThumb': 'atiestates vektors {address} nav Thumb adrese',
  'slots.image.noKeyPair':
    'šī faila nosaukumā nav tā atslēgu pāra, un attēlā tieši vienreiz nav ne šīs kameras pāra, ne atkodēta lietotnes pāra, tāpēc nevar noteikt, kurām atslēgām attēls tika veidots. Atšifrētie faili tiek nosaukti pēc tajos esošajām atslēgām.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'faila nosaukums norāda atslēgu A {keyA} un atslēgu B {keyB}, bet {mismatch}. Abām atslēgām jābūt klāt, katrai tieši vienreiz.',
  'slots.image.keyInHeader':
    'šis attēls glabā atslēgu adresē {at}, atklātajā galvenes logā — atteikts uzlikt tam ielāpu',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'faila nosaukuma atslēga A un atslēga B atrisinās par pārklājošiem baitiem adresēs {at} un {other} — tām jābūt divām atšķirīgām 16 baitu vērtībām',
  'slots.image.retargetLost':
    'pēc pārmērķēšanas attēlā šīs kameras atslēgu pāris nav tieši vienreiz — atteikts veidot datus, kuru vēlākajām jaunināšanām sāknētājs nevarētu piemeklēt atslēgu',
  'slots.image.noStageKey':
    'attēlā nav neviena 2016. gada līnijas atslēgu pāra, tāpēc nav sagatavošanas atslēgas, ar ko to kodēt',
  'slots.image.ffSumNoKeys':
    'šim attēlam ir 16 Hz FF vārdu summa 0xFFFF, bet tajā nav 1.3.0.8-FF atslēgu pāra (abas puses, katra vienreiz), tāpēc tā sagatavoto formu nevar izveidot. Nekas netika ierakstīts.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'šis ir 1.3.0.8 FF (16 Hz) attēls, ko sagatavo tā paša atslēgas A formā (ff-form.ts), nevis kā atklātu attēlu. Nekas netika ierakstīts.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'plāns tika izveidots aparātprogrammatūrai {firmware}, bet analīze nolasa {version}. Plāns ir novecojis; izveidojiet to vēlreiz. Nekas netika ierakstīts.',
  'slots.plan.otherFirmwareUnknown':
    'plāns tika izveidots nezināmas versijas aparātprogrammatūrai, bet analīze nolasa {version}. Plāns ir novecojis; izveidojiet to vēlreiz. Nekas netika ierakstīts.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'plāns tika izveidots kamerai {planSerial}, bet analīze nolasa {serial}. Atteikts to šeit ierakstīt. Nekas netika ierakstīts.',
  'slots.plan.cameraUnknownSerial': 'ar nezināmu sērijas numuru',
  'slots.plan.unknownSerial': 'nezināmu sērijas numuru',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, inside the sentence ("slot A"). */
  'slots.plan.otherAddress': 'plāna mērķis ir {address}, bet būvējuma {name} atrodas adresē {at}',
  'slots.plan.notRead': 'analīze vairs nenolasa {name:acc}. Nekas netika ierakstīts.',
  'slots.plan.edited':
    'plāna kontrolsumma neatbilst tā datiem, tātad plāns ir rediģēts. Nekas netika ierakstīts.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'dati ir {size} B — vairāk, nekā ietilpst slotā ({name})',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck':
    '{risk}. Lai to ierakstītu, vajag acknowledgeRisk: true. Nekas netika nosūtīts.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'šī kamera no šejienes nevar pieņemt atklāti sagatavotu attēlu: {reason}. Nekas netika ierakstīts.',
  'slots.plan.noKeyTable':
    'analīze nenosauc šīs kameras sāknētāja atslēgu tabulu, tāpēc attēlu nevar tai pārmērķēt',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'pēc CompleteMemoryUpgrade apstiprināšanas statusu nevarēja nolasīt, tāpēc {name:nom} var būt daļēji ierakstīts. Pirms darāt jebko citu, nolasiet slotus vēlreiz un paturiet savu izmeti.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'kamera atteica ierakstīšanu {name:loc} apstiprināšanas brīdī ar {status}: {cause}. Nekas netika ierakstīts; slots nav mainīts. Pirms darāt jebko citu, nolasiet slotus vēlreiz.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade atgrieza {status} ({cause}) {name:dat}: nekas netika ieprogrammēts, bet dzēšana, iespējams, sākās, tāpēc slots var būt daļēji izdzēsts. Pirms darāt jebko citu, nolasiet slotus vēlreiz un paturiet savu izmeti.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade atgrieza {status} ({cause}) — {name:nom} var būt daļēji ierakstīts. Pirms darāt jebko citu, nolasiet slotus vēlreiz un paturiet savu izmeti.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'kamera paziņoja {status}, sagatavojot {name:acc} nobīdē {offset}, — pārtraukts pirms CompleteMemoryUpgrade, tāpēc zibatmiņā nekas netika ierakstīts',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum': 'pārsūtes kontrolsumma neatbilda sagatavotajiem baitiem',
  'commit.cause.unsupported':
    'attēls neatšifrējās ar kameras atslēgām, vai datu tips tiek atteikts',
  'commit.cause.acceptance':
    'attēlu noraidīja tā pieņemšanas pārbaude, pirms kaut kas tika izdzēsts (pārbaude atkarīga no būvējuma)',
  'commit.cause.notArmed': 'neviena slota jaunināšana nebija aktivizēta',
  'commit.cause.eraseFailed': 'dzēšanas posms neizdevās',
  'commit.cause.programFailed': 'programmēšanas posms neizdevās',
  'commit.cause.verifyFailed': 'pārbaudes posms neizdevās',
  'commit.cause.unknown': 'šeit nezināms statuss',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name} netiek kopēts pats uz sevi. Nekas netika ierakstīts.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Nekas netika ierakstīts.',
  'copy.refused.noPlain': '{name} nesatur atšifrētu attēlu, ko kopēt. Nekas netika ierakstīts.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} ir ZIP fails, ko šeit nevar nolasīt ({error}). Nekas netika ierakstīts.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} nesatur visu zibatmiņu. ZIP fails tiek pieņemts, ja tas ir 0.x/1.x cilnes sesijas fails, kurā ir {preserve} (kad ir notikusi tā pilnās izmetes darbība), „Nolasīt un atšifrēt 4.x/Nano“ ZIP fails ({dump}) vai „Nolasīt visus selektorus“ ZIP fails ({selectors}); šī ZIP faila saturs: {names}. Nekas netika ierakstīts.',
  'restore.refused.noWholeFlashPatched':
    '{file} nesatur visu zibatmiņu. ZIP fails tiek pieņemts, ja tas ir 0.x/1.x cilnes sesijas fails, kurā ir {preserve} (kad ir notikusi tā pilnās izmetes darbība), „Nolasīt un atšifrēt 4.x/Nano“ ZIP fails ({dump}) vai „Nolasīt visus selektorus“ ZIP fails ({selectors}); šī ZIP faila saturs: {names}. Tā {patched} ir zibatmiņa ar sesijas pagaidu ielāpu, tāpēc tas netiek pieņemts. Nekas netika ierakstīts.',
  'restore.refused.zipEmpty': 'tukšs',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'pilna zibatmiņas rezerves kopija ir {full} B (4 MB — visa mikroshēma, ko nolasa J-Link); {file} ir {size} B. Nekas netika ierakstīts.',
  'restore.refused.noBank': 'šī būvējuma plānā nav {bank:gen}. Nekas netika ierakstīts.',
  'restore.refused.outsideFlash': '{name} nav 4 MB zibatmiņas robežās. Nekas netika ierakstīts.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    '{where} netika nolasīts izmetē, no kuras nāk {file}: saskaņā ar tās manifest.json {address} ir sprauga. Nav attēla, ko atjaunot. Nekas netika ierakstīts.',
  'restore.refused.gapReason':
    '{where} netika nolasīts izmetē, no kuras nāk {file}: saskaņā ar tās manifest.json {address} ir sprauga ({gap}). Nav attēla, ko atjaunot. Nekas netika ierakstīts.',
  'restore.refused.gapFill':
    '{where} netika nolasīts izmetē, no kuras nāk {file}: saskaņā ar tās manifest.json {address} ir sprauga, aizpildīta ar {fill}. Nav attēla, ko atjaunot. Nekas netika ierakstīts.',
  'restore.refused.gapReasonFill':
    '{where} netika nolasīts izmetē, no kuras nāk {file}: saskaņā ar tās manifest.json {address} ir sprauga ({gap}), aizpildīta ar {fill}. Nav attēla, ko atjaunot. Nekas netika ierakstīts.',
  'restore.refused.empty':
    '{where} ir tukšs: katrs baits ir 0xFF. Ierakstīšana ieprogrammē attēlu un nevar atstāt slotu izdzēstu, tāpēc tukšu slotu nevar atjaunot ar ierakstīšanu. Nekas netika ierakstīts.',
  'restore.refused.fill':
    '{where} katrā baitā ir {fill} — aizpildījums, ko izmete raksta tur, kur neko nenolasīja: izmete šo slotu nenolasīja. Nav attēla, ko atjaunot. Nekas netika ierakstīts.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    '{where}: no šī faila to nevar atjaunot — {why}. Nekas netika ierakstīts.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'šim būvējumam slotam nav rakstīšanas aktivizēšanas',
  'support.noStagingEmpty':
    'šim būvējumam nav sagatavošanas formas, tāpēc tukšs slots netiek ierakstīts',
  'support.buildUnknown': 'būvējums nav zināms',
  'support.unverifiedStaging':
    'šis būvējums ir bloķētajā 0.x/1.x līnijā, bet nav viens no būvējumiem, ar kuriem tika izmērītas saglabāšanas ielāpu tabulas (0.8.0.0 .. 1.3.0.8 un 1.0.3.0 / 1.0.3.2), tāpēc tā slota sagatavošanas forma nav zināma, un nekas netiek ierakstīts',
  'support.unknownFamily':
    'kameras saime nav zināma, tāpēc nav zināma arī atslēga, ar kuru tiek ierakstīti tās sloti, bet kamera pieņem slotu, kas ierakstīts ar nepareizu atslēgu, un pēc tam no tā nestartē. Nolasiet un atšifrējiet šo kameru, identificējiet to pēc izmetes, pēc tam norādiet tās saimi ar --family.',
  'support.noReadCommand':
    'aparātprogrammatūrai, kas vecāka par 0.8.0.0, nav GetFeaturedFirmwareData lasīšanas apstrādātāja — komandas, ar kuru izmete lasa zibatmiņu. 0.7.0.7 un 0.7.0.8 tā ir RPC metožu tabulā adresē 0x4F, bet reģistrēta tikai kā iestatītājs (rakstīšanas apstrādātājs), tāpēc control-IN nolasīšanu, ko sūta izmete, nevar nodot apstrādei (0.x/1.x cilnes sesija šos divus būvējumus nolasa ar pārraides id 0x58, GetFeaturedData); pirms 0.7.0.7 pārraides id 0x4F ir UploadFirmwareRowSize, bet 0.3.0.1 pārraides id 0x52 — tas, ar kuru izmete aktivizē, — ir EnterBootloaderMode, nevis BeginFirmwareUpgrade: kamera paliek savā lietotnē, bet katra aktivizēšana iestata zibatmiņas mērķi un aktivizē šī būvējuma aparātprogrammatūras jaunināšanas posmu (GetErrorCode pēc tam nolasa 0x00400000), un tas nav lasīšanas logs. Atgūts no pašu attēlu metožu tabulām, abām apstrādātāju kolonnām; skatiet test/firmware/facts.json.',
  'support.noWritePath':
    'šie būvējumi saņem jaunu aparātprogrammatūru ar vecāku jaunināšanas secību, ko šī rīkkopa nesūta, un to sloti nekad netika kartēti, tāpēc nekas netiek ierakstīts.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'aparātprogrammatūras versiju nevarēja nolasīt, tāpēc būvējums, tā sloti un to sagatavošanas forma nav zināmi; tajā nekas netiek ne nolasīts, ne ierakstīts',
  'support.versionNotDotted':
    'aparātprogrammatūras versija „{version}“ nav ar punktiem dalīta versija, tāpēc būvējums, tā sloti un to sagatavošanas forma nav zināmi; tajā nekas netiek ne nolasīts, ne ierakstīts',
  'support.olderThanFirst':
    'aparātprogrammatūra {version} ir vecāka par {first}: tās RPC tabulā nav GetFeaturedFirmwareData lasīšanas apstrādātāja — komandas, ko sūta slota nolasīšana, — tāpēc tai netiek sūtīta ne nolasīšana, ne ierakstīšana (pierādījumi ir saimē early-compact)',
  'support.modernOnLocked':
    'saime modern-4x aptver 2.x, 4.x, 10.x, 42.x un 44.x; {version} ir 0.x / 1.x bloķētajā līnijā, kurai vajag legacy-auth vai compact-2016',
  'support.lockedOnModern':
    'saime legacy-auth aptver 0.x / 1.x bloķēto līniju; {version} ir modernajā līnijā, kurai vajag modern-4x',
  'support.notCompactPro':
    'saime compact-2016 aptver Compact PRO 1.0.3.x līniju; {version} tajā nav',
  'support.earlyCompact':
    'saime early-compact aptver tikai būvējumus, kas vecāki par {first}, un {version} tiek nolasīta ar legacy-auth',
  'support.generic':
    'kameras saime nav identificēta (saime generic), tāpēc slotu izkārtojums un sagatavošanas forma nav zināmi; identificējiet kameru, pirms kāds slots tiek nolasīts vai ierakstīts',
  'support.noPlan':
    'saimei {family} nav slotu plāna: tās slotu izkārtojums un sagatavošanas forma nav zināmi',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'šī būvējuma tabula neaktivizē režīmu {mode} adresē {address} vienkāršajā kanālā',
  'support.noArmToken':
    'šī būvējuma tabula neaktivizē režīmu {mode} adresē {address} marķiera kanālā',
  'support.windowElsewhere': 'saglabāšanas slota logs {bank:dat} ir adresē {at}, nevis {address}',
  'support.noDumpWindow':
    'šī būvējuma BeginFirmwareUpgrade tabulā nav loga adresē {address} {bank:dat}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} neatbalsta {capability}: {reason}',
  'support.capability.dump': 'nolasīšanu',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': '„Nolasīt visus selektorus“',
  'support.capability.decrypt': 'atšifrēšanu',
  'support.capability.deviceInfo': 'cilnes „Informācija“ pilno nolasīšanu',
  'support.capability.flash': 'slotu ierakstīšanu',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name} adresē {address} šajā būvējumā nav nolasāms: tā selektoru tabulā tur nav loga, tāpēc tam nekas netika aktivizēts',
  'slots.unread.missing': '{name} trūkst kameras analīzē',
  'slots.unread.notRead': '{name} netika nolasīts',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Nekas netika ierakstīts.',
  'slots.refused.versionUnknown':
    'analīze nepasaka, kādu aparātprogrammatūru darbina kamera, un slotu komandas dažādos būvējumos nozīmē dažādas lietas. Nolasiet ierīces informāciju vēlreiz.',
  'slots.refused.versionUnknownWrite':
    'analīze nepasaka, kādu aparātprogrammatūru darbina kamera. Nekas netika ierakstīts.',
  'slots.refused.emptyInput': 'ievade ir tukša',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable':
    '{name} ir tukšs, un šajā būvējumā to nevar ierakstīt: {reason}',
  'slots.refused.noRaw': '{name} šajā būvējumā nevar pieņemt neapstrādātus baitus: {reason}',
  'slots.refused.noPlain': '{name} šajā būvējumā nevar pieņemt atšifrētu attēlu: {reason}',
  'slots.refused.noStaging':
    '{name}: šajā būvējumā nav sagatavošanas formas, tāpēc tam nevar kodēt attēlu',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B — vairāk, nekā ietilpst slotā ({name}, {bankSize} B)',
  'slots.refused.imageTooLong':
    'attēls ir {size} B — vairāk, nekā ietilpst slotā ({name}, {bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    '2014. gada sāknētājs nepieņem šī būvējuma kontrolsummu slotā A vai B un palaiž atkopšanas slotu R (0x14070000), to nepārbaudot, tāpēc ielāps tiek ierakstīts atkopšanas slotā R un nekur citur',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly': 'šis būvējums darbojas tikai no atkopšanas slota R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize':
    'aparātprogrammatūras slots ir {size} B ({kib} KB); šis fails ir {count} B',
  'decryptFile.erasedBank':
    'tukšs, nav ko atšifrēt: visi {size} B nolasās kā 0xFF (izdzēsts slots)',
  'decryptFile.erasedHeader':
    'izdzēsts: galvenes logs ir tikai 0xFF, tāpēc slotā nav attēla; nekas netiek atšifrēts',
  'decryptFile.noHeader':
    'nav attēla galvenes (maģiskais skaitlis {magic}), tāpēc nav attēla, ko atšifrēt',
  'decryptFile.lengthOutOfRange':
    'header.length {length} ir ārpus diapazona; nav attēla, ko atšifrēt',
  'decryptFile.ffKeyB':
    'atšifrēti {size} B ar FF 1.3.0.8 atslēgu B: attēls glabājas kā attēls XOR tā atslēgu bloka 1 atslēgu plūsma, galvenes logs nemainīts',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'atslēga nav atgūta: attēls atšifrējas par atiestates vektoru, kas nav Cortex-M ieejas punkts (atslēga {check}); nekas netiek atšifrēts',
  'decryptFile.storedPlain':
    'glabājas atklātā veidā: slotā attēls ir tāds, kāds tas darbojas (2014. gada atklātā teksta ķēde, identitātes atslēgu plūsma), tāpēc atslēgas nav un atšifrētais attēls ir pats attēls',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 'atšifrēti {size} B ar atslēgu, kas atgūta no šī slota ({check})',
  'decryptFile.decryptedNamed':
    'atšifrēti {size} B ar atslēgu, kas atgūta no šī slota ({check}; tā ir {key:nom})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'īsa nolasīšana ({size} B)',
  'read.reason.noParse': 'nevarēja parsēt attēla galveni',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'nav attēla galvenes (maģiskais skaitlis {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} ir ārpus diapazona',
  'read.reason.stopped': 'slota nolasīšana apstājās pie {count}/{size} B',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'nav nolasāms aparātprogrammatūrā {version}: tās plānā ({table}) nav loga adresē {address}, tāpēc tam nekas netika aktivizēts',
  'read.reason.notInPlanUnknown':
    'nav nolasāms nezināmas versijas aparātprogrammatūrā: tās plānā ({table}) nav loga adresē {address}, tāpēc tam nekas netika aktivizēts',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'logs pasniedza novecojuša lasītāja deskriptora baitus — vārds 0 {word} ar atiestati {hex} ir 0x14000000 vektoru tabula, nevis šī slota saturs, tāpēc no tā nekas netika analizēts: {remedy}',
  'read.reason.spentReader': 'kameras slotus nevarēja nolasīt — {remedy}',
  'read.spentRemedy':
    'loga lasītājs šajā palaišanā, iespējams, ir izsmelts; izslēdziet un ieslēdziet kameru un mēģiniet vēlreiz',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'kameras aktīvā slota vārdu (fw info roots, selektors 10) nevarēja nolasīt',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'kameras aktīvā slota vārds ir {word}, kas nenosauc nevienu slotu',
  'checkKey.unnamed.cfg0NotRead':
    'sāknēšanas konfigurācijas vārds netika nolasīts, tāpēc nav zināms, vai sāknētājs pārbaudīja {bank:acc}, pirms to palaida',
  'checkKey.unnamed.noZeroSum':
    'kamera paziņo, ka palaida {bank:acc}, bet {bank:nom} šajā nolasīšanā neatšifrējas par nulles vārdu summu',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'kamera paziņo, ka palaida {bank:acc}, ko sāknēšanas konfigurācijas vārds {word} atstāj pēdējo, tāpēc sāknētājs to palaida bez pārbaudes, bet {bank:nom} šajā nolasīšanā neatšifrējas par nulles vārdu summu',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected':
    '{family} (novērtējums {score} pēc nolasīšanas, pēc tālāk minētajiem pierādījumiem)',
  'report.detectedAmbiguous':
    '{family} (novērtējums {score} pēc nolasīšanas, pēc tālāk minētajiem pierādījumiem; neviennozīmīgs)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'jā',
  'report.cell.no': 'nē',
  'report.cell.notApplicable': 'neattiecas',
  'report.cell.unknown': 'nezināms',
  'report.cell.recoveryOnly': 'tikai atkopšanai',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'balināšanas K',
  'report.keyRow.store': 'glabāšanas atslēga',
  'report.keyRow.check': 'pārbaudes atslēga',
  'report.keyRow.table': 'atslēgu tabula',
  'report.keyRow.keys': 'atslēgas',
  'report.keyRow.a': 'atslēga A',
  'report.keyRow.b': 'atslēga B',
  'report.keyRow.tableAt': 'tabula adresē',
  'report.key.notIdentified': '(nav identificēta)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    zero: '{count} kandidātu, neviens nav apstiprināts',
    one: '{count} kandidāts, nav apstiprināts',
    other: '{count} kandidāti, neviens nav apstiprināts',
  },
  'report.key.tableAt': '{offset} sāknētāja blokā, apstiprināta pret slotu',
  'report.key.plainChain':
    'nav vajadzīga: sloti glabājas kā atklāta aparātprogrammatūra, tāpēc slotu nolasa un ieraksta tādu, kāds tas ir',
  'report.key.tableRefused2016':
    'nav nolasīta — sāknētāja bloks (0x14000000) šajā līnijā tiek atteikts katrā kanālā',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}; to nosaka pēc {bank:gen} — slota, ko kamera, pēc tās ziņām, palaida pēc sāknētāja pārbaudes',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}; to secina no {bank:gen} — slota, ko kamera, pēc tās ziņām, palaida: sāknētājs palaiž šo slotu bez pārbaudes un darbina to ar atslēgu, ar kuru pārbauda pārējos slotus',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' ({pair} bloks 1)',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'Compact PRO 1.0.3.x 9 Hz pāra',
  'keyPair.cp1032ff': 'Compact PRO 1.0.3.x FF pāra',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'nav nosaukta — {why}',
  'report.checkKey.couldNotName': 'nolasīšana to nevarēja nosaukt',
  'report.storeKey.checkKeyUnnamed':
    'atslēga, ar kuru tā sāknētājs pārbauda slotu (šajā nolasīšanā nav nosaukta): lietotne katru ierakstīto slotu glabā ar šo atslēgu',
  'report.storeKey.checkKey':
    '{key}: lietotne katru ierakstīto slotu glabā ar atslēgu, ar kuru pārbauda tās sāknētājs',
  'report.storeKey.unknown':
    'nezināma — sāknētāja bloks, kurā ir ierīces atslēgas vieta, netika nolasīts',
  'report.storeKey.keyBUnidentified':
    'Atslēga B (ierīces atslēga nav ieprogrammēta; pati atslēga B nav identificēta)',
  'report.storeKey.keyB': 'Atslēga B (ierīces atslēga nav ieprogrammēta)',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain': 'sagatavots atklātā veidā (attēls tāds, kāds tas ir, bez atslēgas)',
  'report.staged.slotKeystream': 'sagatavots ar sava attēla atslēgu bloku 0',
  'report.staged.keyA':
    'sagatavots ar atslēgām, kas atvasinātas no sāknētā slota un darbojošās lietotnes',
  'report.staged.ffVendor':
    'sagatavots tā, kā ražotāja lietotne sagatavo 16 Hz FF attēlu (attēls XOR tā paša atslēgu bloks 0), un kamera to glabā ar atslēgu B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Rezerves kopija: bloks {address}',
  'progress.backupDone': 'Rezerves kopija: nolasīti visi bloki',
  'progress.checkBlock': 'Pārbaude: bloks {address}',
  'progress.checkDone': 'Pārbaude: nolasīti visi bloki',
  'progress.writingBank': 'Ieraksta {bank:loc}',
  'progress.restoringBank': 'Atjauno {bank:acc}',
  'progress.staged': '{label}: sagatavoti {done}/{total} B',
  'progress.wholeFlash': 'Visas zibatmiņas nolasīšana: {got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'nolasa {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'nolasa {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Gatavs — nolasīti logi: {ok}/{total}.',
  'progress.readingBank': 'Nolasa {bank:acc} ...',
  'progress.analysing': 'Analizē ...',
  'progress.probeSelector': 'pārbauda selektoru {selector} ...',
  'progress.selectorsArmed':
    'Gatavs — aktivizēti selektori: {armed}/{span}, ar datiem: {withData}.',
  'progress.recoveringKey': 'atšifrēšana: atgūst atslēgu adresei {address} ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} {address} (subcmd {subcmd}): nevarēja nolasīt — {error}',
  'slots.read.refusedBuild':
    'atteikts nolasīt aparātprogrammatūras slotus: {reason}. Pēc versijas nolasīšanas nekas netika nosūtīts, tāpēc neviens slots netika skarts.',
  'slots.backup.notSaved':
    'rezerves kopija {file} netika saglabāta, tāpēc nekas netika ierakstīts. Ierakstīšana nekad nenotiek, pirms nav saglabāta tās rezerves kopija; mēģiniet vēlreiz, kad to varēs saglabāt.',
  'slots.backup.notSavedWhy':
    'rezerves kopija {file} netika saglabāta ({error}), tāpēc nekas netika ierakstīts. Ierakstīšana nekad nenotiek, pirms nav saglabāta tās rezerves kopija; mēģiniet vēlreiz, kad to varēs saglabāt.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'liels ātrums (480 Mbit/s)',
  'usb.speed.full': 'pilns ātrums (12 Mbit/s)',
  'usb.speed.code': 'kods {code}',
} satisfies Translation<'core', 'lv'>;
