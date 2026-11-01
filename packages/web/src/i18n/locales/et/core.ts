/**
 * Namespace `core`, eesti (et), translated from the English source: sentences that `@seek-fw/core` makes and
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
    'kaamera jääb lukust lahti, kuni selle toide välja ja uuesti sisse lülitatakse, ning muud tööriistad võivad seda seni valesti lugeda; lülitage kaamera toide enne nende kasutamist välja ja uuesti sisse',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': '{first} esimesena, seejärel {second}, seejärel {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'jäi lugemata',
  'boot.verdict.checkKeyUnnamed':
    'jäi kontrollimata: võtit, millega alglaadur pesa kontrollib, ei nimetatud',
  'boot.cfg0NotRead':
    'käivituskonfiguratsiooni sõna (cfg[0]) jäi lugemata, nii et pole teada, milline pesa järgmisel käivitusel tööle hakkab',
  'boot.select.unknown':
    'käivituskonfiguratsiooni sõna on {word}, nii et alglaadur proovib esimesena {first}, kuid {bank} {verdict}, nii et pole teada, milline pesa tööle hakkab',
  'boot.select.first':
    'käivituskonfiguratsiooni sõna on {word}, nii et alglaadur proovib esimesena {first} ja selles on kujutis, mille alglaadur vastu võtab',
  'boot.select.second':
    'käivituskonfiguratsiooni sõna on {word}, nii et alglaadur proovib esimesena {first}; {first:ine} pole kujutist, mille alglaadur vastu võtaks, nii et see valib {second}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'käivituskonfiguratsiooni sõna on {word}, nii et alglaadur proovib esimesena {first}; ei {first:ine} ega {second:ine} ole kujutist, mille alglaadur vastu võtaks, nii et see käivitab {last}, mida see ei kontrolli',
  'boot.select.lastTakes':
    'käivituskonfiguratsiooni sõna on {word}, nii et alglaadur proovib esimesena {first}; ei {first:ine} ega {second:ine} ole kujutist, mille alglaadur vastu võtaks, nii et see valib {last}, mida see ei kontrolli',
  'boot.bootsNow': 'Kaamera käivitub praegu {bank:ela}',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'praegu käivitatud',
  'boot.notBooted': 'pole käivitatud',
  'boot.unknownWhy.checkKeyUnnamed':
    'võtit, millega alglaadur pesa kontrollib, selle lugemisega ei nimetatud',
  'boot.unknownWhy.noKeyTable':
    'alglaaduri võtmetabelit ei loetud, nii et võtmeid, mida see proovib, ei saa nimetada',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'Kaamera käivitub {bank:ela}. {why}.',
  'fpsBoot.holdsOne':
    '{bank} sisaldab kaadrisageduse paika, kuid seda pesa ei käivitata, nii et paik ei rakendu.',
  'fpsBoot.holdsTwo':
    '{banks} sisaldavad kaadrisageduse paiku, kuid kumbagi ei käivitata, nii et paigad ei rakendu.',
  'fpsBoot.wouldNotRun':
    'Kui paigata {target}, ei hakka see tööle, sest kaamera käivitub hoopis {bank:ela}.',
  'fpsBoot.patchRunning':
    'Paigake ka {bank} (töötav pesa): just see paneb kaadrisageduse paiga mõjuma.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank} pole siin paigatav ({reason}), nii et kaadrisageduse paik teises pesas selles kaameras ei rakendu.',

  /* ---- backup: the zip saved before a bank write (slots/backup); `{name}` is the bank inside a sentence ("slot B"): each is an item of backup.plan.* ---- */
  'backup.bank.notInPlan': '{name} (pole selle järgu plaanis: ZIP-failis on see kirjas)',
  'backup.bank.unsupported':
    '{name} (see järk ei saa seda lugeda, {reason}: ZIP-failis on see kirjas)',
  'backup.bank.empty':
    '{name} (tühi, iga bait 0xFF: ZIP-failis on see kirjas ja kirjutamine ei kirjuta üle ühtegi püsivara)',
  'backup.bank.unread':
    '{name} (pesade lugemine sinna ei jõudnud: ZIP-failis on kirjas, kas kirjutamisele eelnev lugemine jõuab)',
  'backup.bank.noKey':
    '{name} (salvestatud kujul; ükski selle lugemisega leitud võti seda ei ava, nii et dekrüptitud faili pole)',
  'backup.bank.decrypted': '{name} (salvestatud kujul ja dekrüptituna)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Enne kui midagi kirjutatakse, loetakse uuesti {banks} ja salvestatakse ühte ZIP-faili koos märkusega, mis iga fail on: {file}.',
  'backup.plan.many':
    'Enne kui midagi kirjutatakse, loetakse uuesti {banks} ja salvestatakse ühte ZIP-faili koos märkusega, mis iga fail on: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'krüptitud nii, et seade salvestab selle võtmega, mis on käivitatud pesas',
  'staging.detail.slotKeystreamCiphertext':
    'krüptitud kujutise enda ettevalmistusvõtmega (võtmeplokk 0); kaamera salvestab selle pesa enda võtmega',
  'staging.detail.plain': 'avatekst, ilma šifrita',
  'staging.detail.keyAKeystream':
    '1.3.0.8 FF kujutis nii, nagu tootja rakendus selle ette valmistab (XOR võti A) — 16 Hz järk salvestab selle võtmega B, mitte neid baite',
  'staging.detail.verbatim': 'muutmata — baidid täpselt sellisena, nagu need anti',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'lugemine puudub',
  'copy.source.notInPlan': '{name} pole selle järgu plaanis',
  'copy.source.notRead': '{name} jäi lugemata ({reason}), nii et kopeeritavat kujutist pole',
  'copy.source.empty': '{name} on tühi: kopeeritavat kujutist pole',
  'copy.source.foreign':
    '{name:ine} pole ühtegi püsivara kujutist, mille see lugemine ära tunneks, nii et kopeerida pole midagi',
  'copy.source.noKey':
    'ükski selle lugemisega leitud võti ei ava {name}, nii et dekrüptitud kujutist kopeerimiseks pole',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} aadressil {address}, nagu pesade lugemine selle dekrüptis',
  'copy.fromVersion':
    '{name} aadressil {address}, püsivara {version}, nagu pesade lugemine selle dekrüptis',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'Kujutis pärineb {name:ela}, nagu pesade lugemine selle dekrüptis: {size} B, sha256 {sha256}.',
  'copy.noteVersion':
    'Kujutis pärineb {name:ela}, nagu pesade lugemine selle dekrüptis: püsivara {version}, {size} B, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': 'varukoopia {name} (aadressil {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where}, täieliku välkmälu varukoopia {file}',
  'restore.fromVersion': '{where}, täieliku välkmälu varukoopia {file}, püsivara {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'välkmälu 4 MB tõmmis',
  'restore.kind.preserve-run': '0.x/1.x vahekaardi seansifail',
  'restore.kind.dump': 'vahekaardi „Tõmmis ja dekrüptimine 4.x/Nano“ ZIP-fail',
  'restore.kind.all-selectors': 'nupu „Loe kõik selektorid“ ZIP-fail',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'kujutis',
  'restore.decryptedTo.firmware': 'püsivara {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'Kujutis on {where} failis {file}, {kind}: salvestatud sha256 {stored}, dekrüptituna {decrypted}, {size} B (sha256 {sha256}).',
  'restore.note.imageEntry':
    'Kujutis on {where} failis {file}, {kind} (selle kirje {entry}): salvestatud sha256 {stored}, dekrüptituna {decrypted}, {size} B (sha256 {sha256}).',
  'restore.note.readBack':
    'Pärast kirjutamist võrreldakse tagasi loetud pesa varukoopia salvestatud pesa baitidega.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'Varukoopia identiteediplokk nimetab seda kaamerat (seerianumber {serial}).',
  'restore.note.sameBytes':
    'Varukoopia salvestatud baidid on juba {name:ine}: kirjutamine paneb tagasi sama kujutise.',
  'restore.warn.otherCamera':
    'See varukoopia näib olevat teise kaamera oma: selle identiteediplokk nimetab seerianumbrit {theirs}, see kaamera on aga {camera}. Kirjutatakse ainult {name} kujutis; teise kaamera identiteedist ega kalibreeringust ei kirjutata midagi.',
  'restore.warn.noIdentity':
    'Selles varukoopias pole aadressil {address} identiteediplokki, nii et ei saa öelda, kelle kaamerast see loeti.',
  'restore.warn.serialNotRead':
    'Kaamera seerianumbrit ei loetud, nii et varukoopiat (seerianumber {serial}) ei saa sellega sobitada.',
  'restore.warn.otherFirmware':
    '{where} sisaldab püsivara {version}, kaamera käitab aga {camera}: taastamine paneb pesasse teise püsivara.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank} jäi tagasi lugemata, nii et seda ei võrrelda varukoopiaga.',
  'restore.readBack.equal':
    '{bank} vastab tagasi lugedes bait-baidilt varukoopia salvestatud baitidele.',
  'restore.readBack.differs':
    '{bank} erineb tagasi lugedes varukoopia salvestatud baitidest {count} B ulatuses (esimene erinevus nihkel {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, tuletatud käivitatud {bank:ela}',
  'keys.derived.holds':
    '{key} (salvestusvõti), tuletatud käivitatud {bank:ela}, milles on {holds:nom}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, tuletatud käivitatud pesast',
  'keys.derived.holdsUnnamed':
    '{key} (salvestusvõti), tuletatud käivitatud pesast, milles on {holds:nom}',
  'keys.ffVendor.staged':
    '1.3.0.8 FF (16 Hz) kujutis nii, nagu tootja rakendus selle ette valmistab: kujutis XOR selle enda võtmeplokk 0 (võti A), päiseaken muutmata, mis tahes pesasse; selle kaamera võtmeid ei kasutata',
  'keys.ffVendor.stored':
    'Võti B: kaamera krüptib üleslaaditu võtmeplokiga 1 ümber ja salvestab kujutise selle võtmega',
  'keys.imageBlock0.staged':
    'kujutis selle enda võtmeplokiga 0 (leitud kujutisest väärtuse järgi), mis tahes pesasse; selle kaamera võtmeid ei kasutata',
  'keys.imageBlock0.storedUnnamed':
    'võti, millega alglaadur pesa kontrollib (selle lugemisega nimetamata); kaamera krüptib üleslaaditu selle võtmega uuesti',
  'keys.imageBlock0.stored':
    '{key}, võti, millega alglaadur pesa kontrollib; kaamera krüptib üleslaaditu selle võtmega uuesti',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED: 16 Hz FF järgu alglaadurit pole ühestki kaamerast loetud, nii et pole teada, kas kirjutatud pesa käivitub. Alglaaduriga 0.9.0.0 käivitus selle kujutise varasem vorm taastepesast R; see vorm ei käivitu, sest see alglaadur käivitab taastepesa R salvestatud kujul, seda dekodeerimata.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    '16 Hz FF kujutis saadetakse kujul, mida loeb ainult 16 Hz järk {version}. See kaamera kirjutab pesa kujutist kontrollimata (nii ütleb selle püsivara lähtekood ja nii tegi katsetamisel 1.3.0.0 Compact), nii et eeldatavasti kirjutab see baidid nii, nagu need saadetakse: pesas on siis kujutis kujul, mida see kaamera käivitada ei saa.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Siin ei väideta, et kaamera selle käivitab.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast': 'Kaamera enda vastuste järgi käitab see 16 Hz FF järku: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'kontrollib andmeid enne pesa kustutamist ja need andmed läbivad selle kontrolli, nii et see võib kirjutada need baidid nii, nagu need on, kujul, mida selle alglaadur käivitada ei saa: pesa ei pruugi käivituda (pole proovitud; enne kirjutamist salvestatud varukoopia paneb selle tagasi)',
  'write.ff.outcome.refuses':
    'kontrollib andmeid enne pesa kustutamist ja need andmed seda kontrolli ei läbi, nii et eeldatavasti keeldub see kirjutamisest enne, kui midagi kirjutab (seda järku käitav kaamera keeldus selle kujutise varasemast vormist samamoodi)',
  'write.ff.runsSlow': 'Kaamera käitab 8 Hz järku {version}: {why}. See järk {outcome}.',
  'write.ff.buildUnknown':
    'Kaamera enda vastused ei ütle, millist järku {version} see käitab: {why}. Kui see käitab 16 Hz FF järku, võtab see need andmed vastu. Kui see käitab 8 Hz järku, siis see järk {outcome}.',
  'write.raw.asGiven':
    'Toorandmed: saadetakse täpselt sellisena, nagu anti. Siin ei kontrollita, kas need on käivitatavad.',
  'write.raw.ffStagedForm':
    'Need andmed on 1.3.0.8 FF ettevalmistatud vorm (kujutis XOR võtmeplokk 0, sõnasumma 0xFFFF). Kaamera salvestab kujutise võtmega B, nii et tagasilugemist kontrollitakse nende baitide järgi.',
  'write.raw.noStaging':
    'See järk ei nimeta pesa jaoks ühtegi ettevalmistusvormi, nii et alglaaduri kontrolle ei saa välja öelda.',
  'write.raw.reencrypts':
    'Seade dekodeerib need andmed ja krüptib säilitatava uuesti, nii et salvestatud baite ei ennustata. Tagasilugemist kontrollitakse kui kujutist, milleks see dekrüptub, kui seda saab öelda.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'Alglaadur lükkaks need andmed tagasi: {failure}.',
  'write.raw.stageKeyUnchecked':
    '2016. aasta ettevalmistusvõtit (võtmeplokk 0) pole toorbaitides, nii et nende andmete dekrüptitud sõnasummat siin ei kontrollita.',
  'write.image.rekeyRisk':
    'Juba praegu on {name:ine} kujutis, mida alglaadur vastu ei võta. See kirjutamine jõuab samasse olekusse.',
  'write.ack.recovery':
    'Taastepesa R: selle kirjutamiseks peate riski kinnitama. Siin ei kontrollita, kas kaamera pärast seda käivitub.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: selle kirjutamiseks peate riski kinnitama ja pärast järgmist toite väljalülitamist käitab kaamera seda, mis selles pesas on.',
  'write.ack.bootUnnamed':
    'Käivitatud pesa ei õnnestunud nimetada, nii et seda pesa käsitletakse käivitatud pesana',
  'write.ack.recoveryFallback': 'Taastepesa R on viimane hädavaru, mille poole alglaadur pöördub',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'tühi/0: eelistab pesa A, siis B, siis taastepesa',
  'boot.cfg0.modernB': 'eelistab pesa B, siis A, siis taastepesa',
  'boot.cfg0.modernRecovery': 'eelistab taastepesa, siis A, siis B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'teadmata — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  /** `{verdict}` is one of upgrade.verdict.*. `{name}` here is the bank inside a sentence ("slot B"); in upgrade.verdict.* it starts a sentence ("Slot B"). */
  'upgrade.whileRecovery':
    'Kaamera töötab taastepesast ja selle enda uuendus kirjutab {name:ill}, millest kaamera ei tööta. {verdict} See on ainult hoiatus: siin ei takistata uuendamist.',
  'upgrade.verdict.notRead':
    '{name} polnud selles kontrollis loetav, nii et pole teada, mis selles on.',
  'upgrade.verdict.blank': '{name} on tühi, nii et uuendus kirjutab tühja pesasse.',
  'upgrade.verdict.bootableSame':
    '{name} sisaldab sama käivitatavat kujutist kui pesa, millest kaamera töötab, ja uuendus asendab selle. Kui uuendus pooleli jääb, pole see pesa enam käivitatav.',
  'upgrade.verdict.bootable':
    '{name} sisaldab käivitatavat kujutist, mille uuendus asendab. Kui uuendus pooleli jääb, pole see pesa enam käivitatav.',
  'upgrade.verdict.unknown':
    '{name} käivitatavus on selle lugemise järgi teadmata, nii et uuendus võib asendada kujutise, mille kaamera käivitaks.',
  'upgrade.verdict.notBootable':
    '{name} pole selle lugemise järgi käivitatav, nii et uuendus ei asenda ühtegi kujutist, mille kaamera käivitaks.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — pesa, kuhu alglaadur sellel käivitusel sisenes, nagu ta selle üles märgib',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'ei loetud',
  'report.lastStart.noBank': 'kaamera teatab {word}, mis ei nimeta ühtegi pesa',
  'report.lastStart.entered': 'kaamera teatab, et sisenes {bank:ill} (aktiivse pesa sõna {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'versioon puudub',
  'running.why.otherVersion': 'kaamera teatab {version} ja kaks järku on ainult versioonil {only}',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'kaamera ei andnud pesade hinnanguid (GetFirmwareInfo selektorid 6, 7, 8)',
  'running.why.notRead':
    'pesa, millest hinnangud sõltuvad, jäi lugemata, nii et vastuseid ei saa ennustada',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'kaamera vastab {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain': '{answers}, mida 8 Hz järk 1.3.0.8 nende pesade kohta vastab ({predicted})',
  'running.why.ff': '{answers}, mida 16 Hz FF järk 1.3.0.8 nende pesade kohta vastab ({predicted})',
  'running.why.both':
    '{answers} ja mõlemad järgud vastavad nende pesade kohta täpselt nii, nii et pesad ei erista neid',
  'running.why.neither': '{answers}, mis ei sobi kummagi järguga (8 Hz: {plain}; 16 Hz FF: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'Selle kujutise päis ei nimeta püsivara versiooni, nii et ei saa öelda, kas see on järk, mida kaamera käitab ({camera}). Kontrollige, et see on kujutis, mida soovite kirjutada.',
  'imageBuild.otherVersion': 'See kujutis on püsivara {image}; kaamera käitab {camera}.',
  'imageBuild.otherVersionTaken':
    'See kujutis on püsivara {image}; kaamera käitab {camera}. Selles liinis kontrollib kaamera ainult, et kujutis oleks korrektne (päis ja sõnasumma), mitte selle versiooni, nii et kaamera võtab kujutise vastu ja sellest pesast käivitudes käitab {image}.',
  'imageBuild.otherVersionUnchecked':
    'See kujutis on püsivara {image}; kaamera käitab {camera}. Pole kontrollitud, kas see kaamera võtab teise järgu vastu ja seda käitab.',
  'imageBuild.otherBuild':
    'See kujutis on 8 Hz järk {version}; kaamera käitab 16 Hz FF järku {version}. 16 Hz järk kontrollib andmeid kinnitamisel oma FF vormi järgi ja keeldub nurjuvatest enne pesa kustutamist (selle lähtekoodi järgi). 8 Hz järgu kirjutamist sellele pole kaameraga proovitud.',
  'imageBuild.runningUnknown':
    'See kujutis on 8 Hz järk {version}. Kaamera käitab versiooni {version}, millel on 8 Hz ja 16 Hz FF järk, ja selle enda vastused ei öelnud, kumba see käitab, nii et ei saa öelda, kas see on tema järk.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': 'andmed on {size} B, liiga lühikesed, et mahutada päist aadressil 0x200',
  'bootFail.noMagic':
    'aadressil 0x200 pole kujutise tunnust (magic; leiti {found}, alglaadur vajab {needs})',
  'bootFail.lengthOutside': 'header.length {length} on väljaspool {size} B andmeid',
  'bootFail.lengthNotPayload': 'header.length {length} ei ole andmete pikkus {size}',
  'bootFail.overStage': '{size} B ületab {max} B ettevalmistusala',
  'bootFail.plainSum': 'salvestatud sõnasumma {sum}, 2014. aasta alglaadur vajab 0',
  'bootFail.noFooter': 'aadressil {offset} pole jalust: andmed lõpevad aadressil {end}',
  'bootFail.footerNotCode':
    'jalus aadressil {offset} ei ole „CODE“ — alglaadur võtab oma segmenteeritud laaduri',
  'bootFail.footerLength': 'jaluse pikkus ei võrdu header.length väärtusega {length}',
  'bootFail.keyASum':
    'selle kaamera võtmega A dekrüptides on sõnasumma {sum}, alglaadur vajab {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'kinnitatud vastuvõtusummaga',
  'keyConfidence.structural': 'kinnitatud ainult vektortabeliga',
  'keyConfidence.unverified': 'kinnitamata',
  /** `{sum}` is hex. */
  'keyCheck.family': 'võti on kinnitatud vastuvõtusummaga {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'võti {phrase}; vastuvõtusumma {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'ette valmistatud kaamera enda võtmetega',
  'staging.phrase.slotKeystreamCiphertext': 'ette valmistatud kujutise enda võtmega',
  'staging.phrase.plain': 'ette valmistatud avatekstina',
  'staging.phrase.keyAKeystream':
    'ette valmistatud nii, nagu tootja rakendus valmistab ette FF kujutise (XOR võti A)',
  'staging.phrase.verbatim': 'saadetud nii, nagu anti',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank, inside the sentence ("slot A"); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    'kinnitati {size} B {name:ill} aadressil {address}, {staged}; kinnitamise olek {status}',
  'written.noReadWindow':
    'see järk ei nimeta pesa jaoks lugemisakent, nii et midagi ei loetud tagasi',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'tagasilugemine nurjus: {error}',
  'written.readBack': 'tagasi loetud {size} B, SHA-256 {sha256}',
  'written.verifyOff': 'kontroll on välja lülitatud: pesa ei loetud tagasi',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'baitidele, mida plaan pesas ennustas (kujutisele sellisena, nagu 16 Hz järk selle salvestab, mitte saadetud baitidele)',
  'readBack.reference.asSent':
    'baitidele, mida plaan pesas ennustas (baitidele sellisena, nagu need saadeti)',
  'readBack.sizeDiffers':
    'tagasi loetud andmed on {size} B, plaan ennustas {predictedSize} B: pesa EI vasta {reference}',
  'readBack.matchesFolded':
    'pesas on kujutis sellisena, nagu 16 Hz järk selle salvestab (mitte saadetud baidid), ja ülejäänud pesa on kustutatud',
  'readBack.matches':
    'pesa vastab baitidele, mida plaan ennustas (2014. aasta avatekstiahel programmeerib täpselt selle, mis talle saadetakse)',
  'readBack.differs': 'pesa EI vasta {reference} (esimene erinevus nihkel {offset})',
  'readBack.noHeader':
    'tagasi loetud andmetes pole nihkel {offset} kujutise päist (magic {magic}), nii et pesa EI dekrüptu oodatud kujutiseks',
  'readBack.lengthDiffers':
    'tagasi loetud päis ütleb {length} B, plaani kujutis on {imageLength} B: pesa EI dekrüptu oodatud kujutiseks',
  'readBack.tooShort':
    'tagasi loetud andmed on {size} B, liiga lühikesed {length} B kujutise jaoks: pesa EI dekrüptu oodatud kujutiseks',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'tagasilugemisest taastatud võtmevooga ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': 'pesa dekrüptub {recovered} oodatud kujutiseks ({length} B)',
  'readBack.decryptDiffers':
    'pesa EI dekrüptu {recovered} oodatud kujutiseks: esimene erinevus kujutise nihkel {offset}',
  'readBack.rawNotCompared':
    'toorbaidid: tagasilugemisest teatatakse, kuid seda ei võrrelda (baidid ei dekrüptu sellel kujul ennustatavaks avatekstiks ja seade krüptib säilitatava uuesti)',
  'readBack.notCompared':
    'võrdlus polnud võimalik: plaan ei ennusta ei salvestatud baite ega avateksti kujutist',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'Võti A',
  'keyName.keyA:nom': 'võti A',
  'keyName.keyA:gen': 'võtme A',
  'keyName.keyA:par': 'võtit A',
  'keyName.keyA:ill': 'võtmesse A',
  'keyName.keyA:ine': 'võtmes A',
  'keyName.keyA:ela': 'võtmest A',
  'keyName.keyA:all': 'võtmele A',
  'keyName.keyA:ade': 'võtmel A',
  'keyName.keyA:abl': 'võtmelt A',
  'keyName.keyA:tra': 'võtmeks A',
  'keyName.keyA:ter': 'võtmeni A',
  'keyName.keyA:ess': 'võtmena A',
  'keyName.keyA:abe': 'võtmeta A',
  'keyName.keyA:com': 'võtmega A',
  'keyName.keyB': 'Võti B',
  'keyName.keyB:nom': 'võti B',
  'keyName.keyB:gen': 'võtme B',
  'keyName.keyB:par': 'võtit B',
  'keyName.keyB:ill': 'võtmesse B',
  'keyName.keyB:ine': 'võtmes B',
  'keyName.keyB:ela': 'võtmest B',
  'keyName.keyB:all': 'võtmele B',
  'keyName.keyB:ade': 'võtmel B',
  'keyName.keyB:abl': 'võtmelt B',
  'keyName.keyB:tra': 'võtmeks B',
  'keyName.keyB:ter': 'võtmeni B',
  'keyName.keyB:ess': 'võtmena B',
  'keyName.keyB:abe': 'võtmeta B',
  'keyName.keyB:com': 'võtmega B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'seadmevõti',
  'keyName.perDevice:gen': 'seadmevõtme',
  'keyName.perDevice:par': 'seadmevõtit',
  'keyName.perDevice:ill': 'seadmevõtmesse',
  'keyName.perDevice:ine': 'seadmevõtmes',
  'keyName.perDevice:ela': 'seadmevõtmest',
  'keyName.perDevice:all': 'seadmevõtmele',
  'keyName.perDevice:ade': 'seadmevõtmel',
  'keyName.perDevice:abl': 'seadmevõtmelt',
  'keyName.perDevice:tra': 'seadmevõtmeks',
  'keyName.perDevice:ter': 'seadmevõtmeni',
  'keyName.perDevice:ess': 'seadmevõtmena',
  'keyName.perDevice:abe': 'seadmevõtmeta',
  'keyName.perDevice:com': 'seadmevõtmega',
  'keyName.thePerDevice': 'seadmevõti',
  'keyName.thePerDevice:gen': 'seadmevõtme',
  'keyName.thePerDevice:par': 'seadmevõtit',
  'keyName.thePerDevice:ill': 'seadmevõtmesse',
  'keyName.thePerDevice:ine': 'seadmevõtmes',
  'keyName.thePerDevice:ela': 'seadmevõtmest',
  'keyName.thePerDevice:all': 'seadmevõtmele',
  'keyName.thePerDevice:ade': 'seadmevõtmel',
  'keyName.thePerDevice:abl': 'seadmevõtmelt',
  'keyName.thePerDevice:tra': 'seadmevõtmeks',
  'keyName.thePerDevice:ter': 'seadmevõtmeni',
  'keyName.thePerDevice:ess': 'seadmevõtmena',
  'keyName.thePerDevice:abe': 'seadmevõtmeta',
  'keyName.thePerDevice:com': 'seadmevõtmega',
  'keyName.applicationKeyA': 'rakenduse võti A',
  'keyName.applicationKeyA:gen': 'rakenduse võtme A',
  'keyName.applicationKeyA:par': 'rakenduse võtit A',
  'keyName.applicationKeyA:ill': 'rakenduse võtmesse A',
  'keyName.applicationKeyA:ine': 'rakenduse võtmes A',
  'keyName.applicationKeyA:ela': 'rakenduse võtmest A',
  'keyName.applicationKeyA:all': 'rakenduse võtmele A',
  'keyName.applicationKeyA:ade': 'rakenduse võtmel A',
  'keyName.applicationKeyA:abl': 'rakenduse võtmelt A',
  'keyName.applicationKeyA:tra': 'rakenduse võtmeks A',
  'keyName.applicationKeyA:ter': 'rakenduse võtmeni A',
  'keyName.applicationKeyA:ess': 'rakenduse võtmena A',
  'keyName.applicationKeyA:abe': 'rakenduse võtmeta A',
  'keyName.applicationKeyA:com': 'rakenduse võtmega A',
  'keyName.applicationKeyB': 'rakenduse võti B',
  'keyName.applicationKeyB:gen': 'rakenduse võtme B',
  'keyName.applicationKeyB:par': 'rakenduse võtit B',
  'keyName.applicationKeyB:ill': 'rakenduse võtmesse B',
  'keyName.applicationKeyB:ine': 'rakenduse võtmes B',
  'keyName.applicationKeyB:ela': 'rakenduse võtmest B',
  'keyName.applicationKeyB:all': 'rakenduse võtmele B',
  'keyName.applicationKeyB:ade': 'rakenduse võtmel B',
  'keyName.applicationKeyB:abl': 'rakenduse võtmelt B',
  'keyName.applicationKeyB:tra': 'rakenduse võtmeks B',
  'keyName.applicationKeyB:ter': 'rakenduse võtmeni B',
  'keyName.applicationKeyB:ess': 'rakenduse võtmena B',
  'keyName.applicationKeyB:abe': 'rakenduse võtmeta B',
  'keyName.applicationKeyB:com': 'rakenduse võtmega B',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'võtmeplokk 1',
  'keyName.block1:gen': 'võtmeploki 1',
  'keyName.block1:par': 'võtmeplokki 1',
  'keyName.block1:ill': 'võtmeplokisse 1',
  'keyName.block1:ine': 'võtmeplokis 1',
  'keyName.block1:ela': 'võtmeplokist 1',
  'keyName.block1:all': 'võtmeplokile 1',
  'keyName.block1:ade': 'võtmeplokil 1',
  'keyName.block1:abl': 'võtmeplokilt 1',
  'keyName.block1:tra': 'võtmeplokiks 1',
  'keyName.block1:ter': 'võtmeplokini 1',
  'keyName.block1:ess': 'võtmeplokina 1',
  'keyName.block1:abe': 'võtmeplokita 1',
  'keyName.block1:com': 'võtmeplokiga 1',
  'keyName.theDeviceKey': 'seadmevõti',
  'keyName.theDeviceKey:gen': 'seadmevõtme',
  'keyName.theDeviceKey:par': 'seadmevõtit',
  'keyName.theDeviceKey:ill': 'seadmevõtmesse',
  'keyName.theDeviceKey:ine': 'seadmevõtmes',
  'keyName.theDeviceKey:ela': 'seadmevõtmest',
  'keyName.theDeviceKey:all': 'seadmevõtmele',
  'keyName.theDeviceKey:ade': 'seadmevõtmel',
  'keyName.theDeviceKey:abl': 'seadmevõtmelt',
  'keyName.theDeviceKey:tra': 'seadmevõtmeks',
  'keyName.theDeviceKey:ter': 'seadmevõtmeni',
  'keyName.theDeviceKey:ess': 'seadmevõtmena',
  'keyName.theDeviceKey:abe': 'seadmevõtmeta',
  'keyName.theDeviceKey:com': 'seadmevõtmega',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'tundmatu võti',
  'keyName.unknown:gen': 'tundmatu võtme',
  'keyName.unknown:par': 'tundmatut võtit',
  'keyName.unknown:ill': 'tundmatusse võtmesse',
  'keyName.unknown:ine': 'tundmatus võtmes',
  'keyName.unknown:ela': 'tundmatust võtmest',
  'keyName.unknown:all': 'tundmatule võtmele',
  'keyName.unknown:ade': 'tundmatul võtmel',
  'keyName.unknown:abl': 'tundmatult võtmelt',
  'keyName.unknown:tra': 'tundmatuks võtmeks',
  'keyName.unknown:ter': 'tundmatu võtmeni',
  'keyName.unknown:ess': 'tundmatu võtmena',
  'keyName.unknown:abe': 'tundmatu võtmeta',
  'keyName.unknown:com': 'tundmatu võtmega',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    '2014. aasta avatekstiahel: iga pesa on salvestatud avatekstina, nii et üleslaadimisvõtit ei tuletata; üles laaditakse kujutis sellisena, nagu see on',
  'keys.evidence.ffVendor':
    '1.3.0.8 FF (16 Hz) järk: ükski selle lugemisega avatud pesa pole salvestatud avatekstina, nii et pole näidatud, et kaamera oleks 2014. aasta avatekstiahelal; FF kujutis kirjutatakse tootja vormis, toorbaidid saadetakse nii, nagu anti, ja avateksti 8 Hz kujutist ei kirjutata',
  'keys.evidence.ffUntested':
    'FF kujutise kirjutamist pakutakse koos hoiatusega UNTESTED: kogus pole selle järgu ehtsat alglaadurit, nii et pole mõõdetud, kas kirjutatud pesa käivitub',
  'keys.evidence.line2016':
    '2016. aasta Compact PRO liin: üles laaditakse kujutis, mis on XOR-itud selle enda võtmeploki 0 võtmevooga (leitud kujutisest väärtuse järgi), nii et selle kaamera võtmeid selleks ei kasutata',
  'keys.evidence.checkKeyUnnamed':
    'kaamera dekrüptib üleslaaditu selle võtmega ja krüptib selle uuesti võtmega, millega alglaadur pesa kontrollib; seda võtit selle lugemisega ei nimetatud ja kirjutamine seda ei vaja: pesa loetakse tagasi kujutisena, milleks see dekrüptub',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'kaamera dekrüptib üleslaaditu selle võtmega ja krüptib selle uuesti võtmega, millega alglaadur pesa kontrollib; seda võtit selle lugemisega ei nimetatud ({why}) ja kirjutamine seda ei vaja: pesa loetakse tagasi kujutisena, milleks see dekrüptub',
  'keys.evidence.checkKeyNamed':
    'kaamera dekrüptib üleslaaditu selle võtmega ja krüptib selle uuesti {key:com} {hex}, millega alglaadur pesa kontrollib, nii et iga pesa, mille kaamera kirjutab, salvestatakse nii, nagu alglaadur selle vastu võtab',
  'keys.evidence.checkKeyInferred':
    'kaamera dekrüptib üleslaaditu selle võtmega ja krüptib selle uuesti {key:com} {hex}, millega alglaadur pesa kontrollib (järeldatud {bank:ela}, kuhu kaamera teatab end sisenenud olevat ja kuhu alglaadur sisenes ilma kontrollita), nii et iga pesa, mille kaamera kirjutab, salvestatakse nii, nagu alglaadur selle vastu võtab',
  'keys.evidence.checkKeyNamedFrom':
    'kaamera dekrüptib üleslaaditu selle võtmega ja krüptib selle uuesti {key:com} {hex}, millega alglaadur pesa kontrollib (nimetatud {bank:ela}, kuhu kaamera teatab end sisenenud olevat), nii et iga pesa, mille kaamera kirjutab, salvestatakse nii, nagu alglaadur selle vastu võtab',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'käivitatud pesa ei õnnestunud nimetada, nii et võtit, millega pesa on salvestatud, ei saa sellest lugeda',
  'keys.refused.notDerived': 'võtmeid ei õnnestunud tuletada',
  'keys.refused.notDecrypted':
    'käivitatud {bank} ei dekrüptu kujutiseks, nii et võtit, millega see on salvestatud, ei saa lugeda',
  'keys.refused.noBootKey':
    'käivitatud {bank} ei dekrüptu ühegi võtmega, mida alglaadur proovib (selle võti A või salvestusvõti), nii et võtit, millega pesa on salvestatud, ei saa sellest lugeda',
  'keys.refused.keyNotInTable':
    'käivitatud {bank} dekrüptub {key:com}, kuid selle kaamera võtmetabelis seda võtit pole, nii et sellega ei saa kirjutada',
  'keys.refused.noApplicationPair':
    'töötav rakendus ({bank}, püsivara {firmware}) ei sisalda ühtegi teadaolevat võtmepaari (alglaaduri ja dekodeeritud rakenduse paarid) nii, et kumbki pool esineks täpselt üks kord, nii et selle võtit A ei saa kujutisest leida',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'töötav rakendus ({bank}, püsivara {firmware}) ei sisalda ühtegi teadaolevat võtmepaari (alglaaduri ja dekodeeritud rakenduse paarid) nii, et kumbki pool esineks täpselt üks kord, nii et selle võtit A ei saa kujutisest leida (alglaaduri võti A esineb {count} kord, selle võti B {keyB})',
    other:
      'töötav rakendus ({bank}, püsivara {firmware}) ei sisalda ühtegi teadaolevat võtmepaari (alglaaduri ja dekodeeritud rakenduse paarid) nii, et kumbki pool esineks täpselt üks kord, nii et selle võtit A ei saa kujutisest leida (alglaaduri võti A esineb {count} korda, selle võti B {keyB})',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'töötav rakendus ({bank}, püsivara {firmware}) kontrollib üleslaaditut enne programmeerimist oma võtmetega (selle järgu dekodeeritud lähtekood proovib üleslaaditut oma võtmega A ja salvestusvõtmega, nagu alglaadur proovib pesa), ja võti, millega kirjutatu salvestatakse, {key:nom} ({hex}), ei ole selle võti A ega salvestusvõti, nii et kaamera keelduks üleslaaditust koodiga 0x50000 enne, kui midagi kustutab',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum': 'ükski pesa ei dekrüptu perekonna {family} vastuvõtusummaks {sum}',
  'writeRefusal.keyTable': 'selle kaamera võtmetabelit ei õnnestunud kinnitada',
  'writeRefusal.whitening':
    'selle kaamera võtmetabel laheneb väärtusega K={k}, kuid {family} krüptib väärtusega K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily':
    'tõendite järgi on see kaamera {detected}, mitte {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'sellesse kaamerasse ei saa siit kirjutada: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Seeki 2018. aasta ja hilisemad järgud (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 ja Nano 300. Tõmmis loeb välkmälu 64 plokist 63 ilma midagi avamata; ükski lugemine ei ulatu nendel järkudel plokini aadressil {block}. Püsivara on salvestatud krüptituna. Pesasid kirjutatakse ükshaaval vahekaardil „Püsivarapesad“.',
  'family.summary.early':
    '2014. aasta Compactid, mis on vanemad kui 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 ja 0.7.0.8. Nende püsivara ei suuda vastata lugemisele, mille tõmmis saadab, nii et „Alusta tõmmist“, „Loe kõik selektorid“, vahekaardi „Teave“ täielik lugemine ja vahekaart „Püsivarapesad“ keelduvad neist pärast versiooni lugemist; versioonil 0.3.0.1 seaks käsk, millega tõmmis algab, hoopis püsivara uuenduse valmis. 0.x/1.x vahekaardi seanss loeb järke 0.7.0.7 ja 0.7.0.8 teise käsuga, millele need kaks järku vastavad. Muul viisil tehtud tõmmis dekrüptub tavapäraselt.',
  'family.summary.compact2016':
    'Compact PRO järgud 1.0.3.x (1.0.3.0 ja 1.0.3.2). Need vastavad lugemistele täpselt nagu 2014. aasta Compactid, kaasa arvatud avamismärk, nii et neid eristatakse versiooni ja pesade salvestusviisi järgi: krüptitult, samas kui 2014. aasta pesad on avatekstina. 1.0.3.x kaamerat loetakse selle perekonnana algusest peale. 0.x/1.x vahekaardi seanss loeb kogu välkmälu ja pesasid kirjutatakse ükshaaval vahekaardil „Püsivarapesad“.',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    '2014. aasta Compactid 0.8.0.0 kuni 1.3.0.8, nende hulgas 16 Hz järk 1.3.0.8 FF. Tehaseseisus kaamera annab välja alla poole oma välkmälust, osa sellest ainult avamismärgiga, mille tööriistakomplekt saadab; 0.x/1.x vahekaardi seanss loeb ülejäänu ajutise paiga kaudu. Pesad on salvestatud avatekstina, välja arvatud FF järgul. Compact PRO 1.0.3.x kaamerat loetakse kui compact-2016 ja see liigub siia ainult siis, kui mõni pesa on salvestatud avatekstina või dekrüptub summaks {sum}, nagu FF järgu pesad. Pesasid kirjutatakse vahekaardil „Püsivarapesad“ nendel järkudel, millel 0.x/1.x vahekaardi seanssi on mõõdetud; iga teist 0.x või 1.x järku ainult loetakse.',
  'family.summary.generic':
    'Kaamera, millele ükski teine perekond ei sobi. `seek-fw dump` loeb seda 4.x plokiloendiga (vahekaart 4.x/Nano sellest keeldub) ja dekrüptimine lahendab võtme kujutisest endast, nii et kumbki ei sõltu oletusest. Ühtegi pesa ei kirjutata: vahekaart „Püsivarapesad“ keeldub sellest, kuni kaamera on tuvastatud.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'kujutise päise järgi',
  'detect.source.camera': 'kaamera teatel',
  'detect.plainArmedNotInForce':
    'tavaline 2-baidine BeginFirmwareUpgrade aktiveeris kaitstud pesa, nii et autenditud lugemiskanal ei kehti',
  'detect.modern.plainRefused':
    'kaitstud pesa tavaline 2-baidine BeginFirmwareUpgrade LÜKATI TAGASI, mida ükski selle liini järk ei tee — selle käsitlejal pole märgikontrolli ja see aktsepteerib tavalist kanalit igas pesas',
  'detect.modern.authArmed':
    'kaitstud pesa aktiveerus 18-baidise autenditud selektoriga; tavalist seal ei proovitud, nii et see ei paiguta kaamerat sellest liinist välja',
  'detect.modern.legacyVersion':
    '{said} on püsivara {version}, mis kuulub 0.x / 1.x pärandliini (teine nummerdusliin, mitte vanem 4.x — ja üks neist järkudest annab samuti summa {sum})',
  'detect.modern.noSum':
    'ükski pesa ei dekrüptu vastuvõtusummaks {sum}, mida selle perekonna alglaadur nõuab',
  'detect.modern.sum': 'pesa dekrüptub vastuvõtusummaks {sum}',
  'detect.modern.version':
    'püsivara {version} kuulub 2018. aasta järgsesse liini, mida see selektorikaart katab (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'tavaline 2-baidine BeginFirmwareUpgrade aktiveeris kaitstud pesa, nii et see pole lukustatud pärandpüsivara',
  'detect.modern.none': 'pole tõendeid, mis paigutaksid kaamera 2018. aasta järgsesse liini',
  'detect.early.noVersion': 'püsivara versiooni ei teatatud ega leitud kujutise päisest',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'püsivara {version} on {first} või uuem, nii et selle RPC-tabelis on GetFeaturedFirmwareData lugemisfunktsioon (getter) ja kehtib tavaline lugemistee',
  'detect.early.older':
    '{said} on püsivara {version}, mis on vanem kui {first} — esimene järk, mille RPC-meetoditabelis on GetFeaturedFirmwareData lugemiskäsitleja (getter)',
  'detect.early.noWindow': 'ja ühtegi akent ei õnnestunud lugeda, mida see ka ennustab',
  'detect.generic.fallback':
    'varuvariant: ükski püsivaraperekond ei sobinud kindlalt, nii et lugemine jääb võimalikuks, kirjutamine mitte',
  'detect.compact2016.early':
    'püsivara {version} on vanem kui 0.8.0.0 ja sellel pole GetFeaturedFirmwareData lugemiskäsitlejat — see on early-compact, mitte see perekond',
  'detect.compact2016.modernSum':
    'pesa dekrüptub vastuvõtusummaks {sum}, mis pole selle põlvkonna sihtväärtus',
  'detect.compact2016.plainArmed':
    'tavaline 2-baidine BeginFirmwareUpgrade aktiveeris kaitstud pesa, nii et see kaamera ei kuulu lukustatud liini, mida see perekond jagab perekonnaga legacy-auth',
  'detect.compact2016.notLine': 'püsivara {version} ei kuulu 0.x / 1.x liini',
  'detect.compact2016.storedPlain':
    'pesa on salvestatud avatekstina — võtmevoo lahendamine annab identsusoleku, nii et salvestatud sõnad ONGI kujutis —, mis on 2014. aasta avatekstiahel; selle põlvkonna pesad on xorshift128 päris võtmega',
  'detect.compact2016.keyedZero':
    'päris xorshift128 võtmevooga salvestatud pesa dekrüptub vastuvõtusummaks {sum}, mis on selle põlvkonna šiffer',
  'detect.compact2016.zeroSum':
    'pesa dekrüptub vastuvõtusummaks {sum}, mis on selle põlvkonna sihtväärtus',
  'detect.compact2016.refused':
    'ja kaitstud pesa keeldus tavalisest 2-baidisest aktiveerimisest, mis on lukustatud käsitleja tunnus',
  'detect.compact2016.proLine':
    '{said} on püsivara {version}, 2016. aasta Compact PRO 1.0.3.x liin',
  'detect.compact2016.compactLine':
    '{said} on püsivara {version}, Compacti järk, mitte Compact PRO 1.0.3.x liin',
  'detect.compact2016.lockedLine':
    '{said} on püsivara {version}, 0.x / 1.x liinil, mida see põlvkond jagab lukustatud pärandpüsivaraga',
  'detect.compact2016.bootloader2016':
    'alglaadur teatab {version}, 2016. aasta põlvkonna alglaadur (1.2.0.0 on mõõdetud Compact PRO 1.0.3.0 all; 2014. aasta Compacti oma on 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'alglaadur teatab {version}, 2014. aasta põlvkonna nummerdus, mitte selle põlvkonna oma',
  'detect.compact2016.none':
    'ühegi pesa puhul ei täheldatud, et see dekrüptuks päris võtmega nullvastuvõtusummaks',
  'detect.legacy.proLine':
    'kuid püsivara {version} on 2016. aasta Compact PRO 1.0.3.x liin, mille pesad kasutavad compact-2016 šifrit: selle perekonna vastuvõtukontroll nurjuks igaühe puhul',
  'detect.legacy.early':
    'püsivara {version} on vanem kui 0.8.0.0: selle RPC-tabelis pole GetFeaturedFirmwareData lugemiskäsitlejat (enne 0.7.0.7 üldse mitte ning 0.7.0.7 ja 0.7.0.8 puhul ainult setter) — see on early-compact, mitte see perekond',
  'detect.legacy.keyedZero':
    'päris xorshift128 võtmevooga salvestatud pesa dekrüptub väärtuseks {zero} — 2016. aasta Compact PRO šiffer (compact-2016). See liin salvestab oma pesad avatekstina sõnasummaga 0 (2014. aasta ahel) või võtmega summale {sum} (Compact 1.3.0.8) ja selle vastuvõtukontroll nurjub sellise pesa puhul',
  'detect.legacy.plainChain':
    'pesa on salvestatud avateksti püsivarana, mille sõnade summa on 0, nagu selle liini 2014. aasta alglaadur seda käivitab',
  'detect.legacy.refused':
    'kaamera keeldus avamast lukustatud pesa uuenduseks, kui seda küsiti ilma avamismärgita, nagu teeb ainult selle põlvkonna püsivara',
  'detect.legacy.unlocked':
    'ja avas sama pesa, kui küsiti avamismärgiga, nii et selle perekonna saadetav avamismärk on just see, mida kaamera kontrollib',
  'detect.legacy.notLine': '{said} on püsivara {version}, mis ei kuulu 0.x / 1.x pärandliini',
  'detect.legacy.authOnly':
    'kaamera avas lukustatud pesa uuenduseks, kui küsiti avamismärgiga, nagu selle põlvkonna püsivara teeb; ilma avamismärgita küsimist ei proovitud, nii et see üksi põlvkonda ei tõesta',
  'detect.legacy.version':
    'püsivara {version} kuulub 0.x / 1.x pärandliini, mis on 2018. aasta järgsetest rakenduse versioonidest erinev nummerdusliin, mitte vanem 4.x',
  'detect.legacy.none': 'miski täheldatu ei viita autenditud lugemiskanalile',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'kõrvale jäetud pärast katset kaameraga: seal ei tõstnud paik avaldamissagedust ja pärast kirjutamist käivitus katik igal kaadril',
  'fps.table.predates':
    'püsivara {version} on vanem kui 0.8.0.0: selle RPC-tabelis pole GetFeaturedFirmwareData lugemiskäsitlejat, käsku, mille pesa lugemine saadab, nii et pesade lugemine ja kirjutamine ei puuduta selle järgu ühtegi pesa ja paika ei pakuta',
  'fps.table.stageTwoFf':
    'stage two: 16 Hz FF järk valmistatakse ette nii, nagu tootja rakendus seda teeb (kujutis XOR võti A, salvestatud võtmega B), mitte avateksti baitidena, nii et selle ettevalmistuse kontrolli pole tehtud ja paika veel ei pakuta',
  'fps.table.stageTwo':
    'stage two: seda kirjet pole stage-two hulgas, nii et selle ettevalmistuse kontrolli pole tehtud ja paika veel ei pakuta',
  'fps.table.notOffered': 'ei pakuta',
  'fps.table.notImage': 'see pole püsivara kujutis, nii et kaadrisageduse paik sellele ei kohaldu',
  'fps.table.otherBuild':
    'kujutis on järk {image}, kuid kaamera teatab {camera}; paigast keeldutakse, selle asemel et rakendada seda järgule, millega see ei sobi',
  'fps.table.otherBuildNoVersion':
    'kujutis on järk {image}, kuid kaamera ei teata versiooni; paigast keeldutakse, selle asemel et rakendada seda järgule, millega see ei sobi',
  'fps.table.patched':
    'kaadrisageduse paik on juba rakendatud: see kujutis töötab sagedusel {hz} Hz',
  'fps.table.earlierPatch':
    'selles kujutises on varasem {hz} Hz kaadrisageduse paik ilma USB paranduseta ja paigatud kujutist ei paigata kunagi uuesti: taastage tehase kujutis, seejärel paigake see',
  'fps.table.atRate': 'see järk töötab juba ilma paigata sagedusel {hz} Hz',
  'fps.table.not4821':
    'see kujutis teatab Compacti järku 4.8.2.1 (või Compact XR 4.8.2.1, sama järk), kuid see pole tehase kujutis, mille jaoks kaadrisageduse paik kirjutati (f96ac57eda75: selle 68-baidised käsulehed, püsiv leht 13), nii et sellele kaadrisageduse paika ei tehta',
  'fps.table.notInTable':
    'seda kujutist pole kaadrisageduse paikade tabelis, nii et selle järgu jaoks kaadrisageduse paika ei tehta. Tabel nimetab Compacti järgud 0.7.0.8 kuni 1.3.0.8 (8 Hz; järgust 0.7.0.8 keeldub pesade kood), 1.3.0.8 (16 Hz FF), 4.8.1.7, 4.8.1.9, 4.8.2.1 ja 4.16.1.7 FF ning Compact PRO järgud 1.0.3.x ja 4.9.x; ühelgi teisel järgul kirjet pole',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'selle järgu plaanis pole {bank}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank} ei saa selles järgus dekrüptitud kujutist vastu võtta: {reason}',
  'fps.plan.empty': '{bank:ine} pole dekrüptitud kujutist, mida paigata (pesa on tühi)',
  'fps.plan.noImage':
    '{bank:ine} pole dekrüptitud kujutist, mida paigata (seda ei loetud või ükski võti seda ei ava)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name} kirjutati, kuid selle tagasilugemine ei erine salvestatud pesast ainult plaanitud viisil, nii et järgmisi pesasid ei kirjutatud',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build (slots/capability-notes) ----
   * The page shows only this one; it leaves the others out (lib/page-hidden.ts), and the CLI prints them
   * in English. */
  'notes.unverified':
    'Ainult lugemine. Pesade paigutus on lukustatud liini dekodeeritud tabel, kuid selle järgu jaoks pole ühtegi ettevalmistusvormi mõõdetud, nii et kirjutamist ei planeerita.',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'kaamera ei teatanud oma püsivara versiooni ({note}); käsunumber ei tähenda igas Seeki püsivaras sama — Compact 0.3.0.1 puhul on käsu id 0x52, mis aktiveerib lugemisakna, EnterBootloaderMode —, nii et kuni versioon pole teada, ei saadeta muud kui GetErrorCode, GetOperationMode ja GetFirmwareInfo, lugemised, millele iga järk vastab ühtmoodi',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo ei vastanud ({error}) ühelegi {reads} lugemisest {spacing} ms vahedega, käivitusaken {window} ms; veel käivituv kaamera vastab selle aja jooksul',
  'identity.note.neverTwice':
    'GetFirmwareInfo ei vastanud {reads} lugemise jooksul kunagi kaks korda järjest',
  'identity.note.noAnswer': 'GetFirmwareInfo ei vastanud ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo ei vastanud ({error}); {reads} lugemisest vastas {answered}, kuid mitte kunagi kaks järjest, nii et ühtegi neist ei saa eristada kirjest, mille mõni varasem käsk valituks jättis',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo vastas {count} baidiga, versiooni jaoks liiga vähe',
    other: 'GetFirmwareInfo vastas {count} baidiga, versiooni jaoks liiga vähe',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo vastas {count} baidiga, versiooni jaoks liiga vähe; {context}',
    other: 'GetFirmwareInfo vastas {count} baidiga, versiooni jaoks liiga vähe; {context}',
  },
  'identity.note.otherRecord':
    'esimene lugemine vastas teise kirjega ({version}), millele mõni varasem käsk oli püsivarateabe selektori jätnud — see lugemine lähtestas selle',
  'identity.note.afterStartup': {
    one: 'kaamera vastas pärast seda, kui oli käivitumise ajal keeldunud {count} lugemisest',
    other: 'kaamera vastas pärast seda, kui oli käivitumise ajal keeldunud {count} lugemisest',
  },
  'identity.predates':
    'püsivara {version} on vanem kui tõmmise protokoll: selle RPC-meetoditabelis pole GetFeaturedFirmwareData lugemiskäsitlejat (0.7.0.7 ja 0.7.0.8 puhul on see registreeritud ainult setterina ja enne seda on käsu id 0x4F UploadFirmwareRowSize), nii et sellega ei saa ühtegi akent lugeda; 0.3.0.1 puhul on käsu id 0x52 EnterBootloaderMode, mitte BeginFirmwareUpgrade. 0.x/1.x vahekaardi seanss loeb järke 0.7.0.7 ja 0.7.0.8 hoopis käsu id 0x58 (GetFeaturedData) kaudu',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'keeldutakse {operation}: {reason}',
  'identity.refusingNoVersion':
    'keeldutakse {operation}: {reason}. Midagi ei aktiveeritud. Eemaldage kaamera, ühendage uuesti, laske tal käivitumine lõpetada ja proovige uuesti.',
  'identity.operation.dump': 'tõmmise tegemisest',
  'identity.operation.dumpAll': 'kõigi selektorite lugemisest',
  'identity.operation.readInfo': 'seadme teabe lugemisest',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'pesad valitakse pärast varundamist, mis need loeb — käivitage esmalt varundamine',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'pesasid ei saa muuta, kui kirjutamine on tehtud või seda on proovitud: selles seansis kirjutatavad pesad on {banks} ja taastamine paneb tagasi täpselt need',
  'preserve.banks.none': 'puuduvad',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Kirjutatud.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Loetud. Loetavaid pesasid: {count}/{of}.',
  'status.readRefused':
    'Loetud, kuid selle kaamera ühtegi pesa ei saa siit kirjutada — vaadake logi.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Püsivara versioon',
  'compare.field.imageId': 'Kujutise ID',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'Algne SP',
  'compare.field.resetVector': 'Lähtestusvektor',
  'compare.field.size': 'Suurus',
  'compare.field.shaExpected': 'Oodatud avateksti kujutise SHA-256',
  'compare.field.sha': 'Kujutise SHA-256',
  'compare.field.shaNotStored':
    'Oodatud avateksti kujutise SHA-256 (salvestatud baite ei ennustata)',
  'compare.field.key': 'Võti',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(kujutis puudub)',
  'compare.notImage': '(pole kujutis)',
  'compare.notPredicted': '(ei ennustata: seade otsustab, mida salvestab)',
  'compare.plaintext': 'puudub (avatekst)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'ei andnud kaks korda sama lugemistulemust',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (võti, millega alglaadur pesa kontrollib, on järeldatud {bank:ela}, kuhu alglaadur sisenes ilma kontrollita) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered':
    '{bank}, nagu kaamera selle üles märgib (aktiivse pesa sõna {word})',
  'preserve.lastStart.notRead': 'teadmata — aktiivse pesa sõna ei õnnestunud lugeda',
  'preserve.lastStart.noBank': 'teadmata — aktiivse pesa sõna on {word}, mis ei nimeta ühtegi pesa',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'teadmata — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'ei kirjutata — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'kujutis',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — saab kirjutada',
  'preserve.bank.writablePatch': '{build} — saab kirjutada; paik muudab {count} baiti',
  'preserve.bank.writableEdit': '{build} — saab kirjutada; sisaldab muudatust {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — saab kirjutada; paik muudab {count} baiti; sisaldab muudatust {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead': 'varundamine pole pesasid veel lugenud, nii et pesa ei saa valida',
  'preserve.choice.every': 'iga pesa, milles on kujutis: {banks}',
  'preserve.choice.everyBlocked':
    'kõiki kujutisega pesasid ei saa kirjutada: {bank} pole kirjutatav — {reason}',
  'preserve.choice.noImage': 'üheski pesas pole kujutist, mida seanss saaks kirjutada',
  'preserve.choice.nextStart': '{bank}, pesa, kuhu järgmine käivitus siseneb: {why}',
  'preserve.choice.nextStartRefused':
    'järgmine käivitus siseneb {bank:ill} ({why}) ja seanss ei saa seda kirjutada: {reason}',
  'preserve.choice.everyUnknownStart':
    'iga pesa, milles on kujutis ({banks}): pole teada, millisesse pesasse järgmine käivitus siseneb ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'pole teada, millisesse pesasse järgmine käivitus siseneb ({why}), ja {reason}; valige pesa nime järgi',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank} pole kirjutatav: {reason}',
  'preserve.choice.byName': '{banks}, nime järgi valitud pesa',
  'preserve.choice.warnNotPatched':
    'Järgmine käivitus siseneb {bank:ill} ({why}) ja see valik seda ei paika: pärast taaskäivitust käitab kaamera selle pesa enda kujutist, nii et kogu välkmälu lugemine peatub enne, kui midagi loeb. Taastamine paneb ikkagi iga kirjutatud pesa tagasi.',
  'preserve.choice.warnUnknownStart':
    'Pole teada, millisesse pesasse järgmine käivitus siseneb ({why}). Kui see siseneb pesasse, mida see valik ei paika, peatub kogu välkmälu lugemine enne, kui midagi loeb.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'veel teadmata',
  'preserve.build.firmware': 'püsivara {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'sellisel kujul, nagu kaamera selle salvestab (see kaamera hoiab oma püsivara krüptimata)',
  'preserve.stagedForm.oneKey': 'kujul, milles kaamera selle salvestab (krüptitud kaamera võtmega)',
  'preserve.stagedForm.twoKeys':
    'kujul, milles kaamera selle salvestab (krüptitud kaamera kahe võtmega)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'iga kirjutatud pesa saab tagasi täpselt need baidid, mille varundamine sellest luges',
  'preserve.restoreForm.factoryStaged':
    'iga kirjutatud pesa saab tagasi oma algse püsivara, kirjutatuna kujul, milles kaamera selle salvestab, nii et pesa on lõpuks bait-baidilt selline, nagu varundamine selle luges',
  'preserve.restoreForm.none':
    'selles järgus pole võimalik: ükski algse püsivara vorm ei läbi kaamera enda kontrolli nii, et salvestuks ka tagasi algsete baitidena, nii et seanss lõpeb täieliku kujutisega ja paik jääb paigale',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'selles järgus pole võimalik: paigatud püsivara ei saa kogu välkmälu lugeda, nii et seansil pole täielikku kujutist anda',
  'preserve.drain.rotated':
    'kaamera annab selle nihutatuna ja seanss seab selle tagasi õigesse järjekorda',
  'preserve.drain.hazard': 'paik väldib selles järgus lugemist, mis kaamera kokku jooksutab',
  'preserve.drain.whole': 'kogu 4 MB välkmälu ühe lugemisega, {size} baiti korraga',
  'preserve.drain.wholeNotes': 'kogu 4 MB välkmälu ühe lugemisega, {size} baiti korraga; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'laseb kaamera lugemiskäsul ulatuda kogu 4 MB välkmäluni, mitte ainult esimese 64 KB-ni',
  'preserve.site.countPast':
    'laseb lugemisasukohal loendada üle 64 KB, nii et lugemine ei hüppa tagasi algusesse',
  'preserve.site.keepPosition':
    'säilitab kogu lugemisasukoha, kui see pärast iga lugemist edasi liigub',
  'preserve.site.savePosition': 'salvestab edasi liikunud lugemisasukoha täielikult',
  'preserve.site.clearPosition':
    'lähtestab kogu lugemisasukoha iga lugemise alguses, nii et kaamerat saab ka pärast kogu välkmälu lugemist lugeda',
  'preserve.site.modeTwoGuard':
    'laseb kogu välkmälu lugemisel alata nagu iga muu lugemine (tehase püsivara tõrjub selle)',
  'preserve.site.modeTwoIndirection':
    'suunab kogu välkmälu lugemise välkmälu algusesse (tehase püsivara suunab selle väärtusele, mis kaamera kokku jooksutab)',
  'preserve.site.armTail':
    'eemaldab kutse, mis paneb kaamera selles järgus lugemise alguses hanguma',
  'preserve.site.other': 'muudab üht käsku, mida kogu välkmälu lugemine vajab',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Varundamine',
  'preserve.step.patch': 'Paikamine',
  'preserve.step.commit': 'Kirjutamine',
  'preserve.step.drain': 'Kogu välkmälu lugemine',
  'preserve.step.restore': 'Taastamine',
  'preserve.step.verify': 'Kontrollimine',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'samm „Paikamine“',
  'preserve.stepId.commit': 'samm „Kirjutamine“',
  'preserve.stepId.drain': 'samm „Kogu välkmälu lugemine“',
  'preserve.stepId.restore': 'samm „Taastamine“',
  'preserve.stepId.verify': 'samm „Kontrollimine“',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: peatati plaanipäraselt — kaamera käivitus {bank:ela}, mida see seanss ei paikanud, nii et midagi ei loetud.',
  'preserve.result.noReason': 'põhjust ei salvestatud',
  'preserve.result.stopped': '{label}: peatati — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none': 'üheski pesas pole püsivara, mida seanss saaks paigata',
  'preserve.result.writable.one': 'seanss saab paigata püsivara {banks:ine}',
  'preserve.result.writable.many': 'seanss saab paigata püsivara {banks:ine}',
  'preserve.result.backup':
    '{label}: kõik plokid, kuhu tavaline lugemine ulatub, salvestati; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'teadmata pesa',
  'preserve.result.backupNext':
    '{label}: kõik plokid, kuhu tavaline lugemine ulatub, salvestati; {writable}; järgmise käivituse pesa: {next}.',
  'preserve.result.patch': '{label}: koostatud {banks:gen} jaoks.',
  /** The patch step when every bank was refused: nothing to build for. */
  'preserve.result.patchNone':
    '{label}: paika ei koostatud: üheski pesas pole püsivara, mida seanss saaks paigata.',
  'preserve.result.patchCount':
    '{label}: koostatud {banks:gen} jaoks; igaühes muutub {count} baiti.',
  'preserve.result.commitOne': '{label}: paik kirjutati {banks:ill} ja kaamera võttis selle vastu.',
  'preserve.result.commitMany':
    '{label}: paik kirjutati {banks:ill} ja kaamera võttis igaühe vastu.',
  'preserve.result.drainNotRead': '{label}: ei loetud.',
  'preserve.result.drain':
    '{label}: kogu 4 MB välkmälu loeti; täieliku kujutise sha256 on {sha256}.',
  'preserve.result.drainThrough':
    '{label}: kogu 4 MB välkmälu loeti {bank:gen} kaudu; täieliku kujutise sha256 on {sha256}.',
  'preserve.result.restore': '{label}: {banks} kirjutati tagasi.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}: {banks} kirjutati tagasi {form}.',
  'preserve.result.verifyDone': '{label}: valmis.',
  'preserve.result.verifyIdentical':
    '{label}: uuesti loeti {blocks} plokki, 0 baiti erineb — kaamera välkmälu on varukoopiaga bait-baidilt identne.',
  'preserve.result.verifyDiffers': '{label}: uuesti loeti {blocks} plokki, {bytes} baiti erineb.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: uuesti loeti {blocks} plokki, {bytes} baiti erineb, {count} plokki ei õnnestunud lugeda.',
    other:
      '{label}: uuesti loeti {blocks} plokki, {bytes} baiti erineb, {count} plokki ei õnnestunud lugeda.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Peatati enne kogu välkmälu lugemist: kaamera käivitus pesast, mida see seanss ei paikanud, nii et midagi ei loetud.',
  'preserve.unpatchedStart.next':
    'Edasi: taastamine paneb iga kirjutatud pesa tagasi. Kogu välkmälu lugemist ei proovita uuesti: kaamera käivituks samast pesast.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Valmis — teie püsivara on säilitatud',
  'preserve.done.detail':
    'Täielik kujutis on kaamera kogu algne välkmälu ja kaamera ise on täpselt endises olekus.',
  'preserve.done.titleNoImage': 'Valmis — kaamera on endises olekus; täielikku kujutist pole',
  'preserve.done.detailNoImage':
    'Kogu välkmälu lugemine ei toimunud, nii et sellel seansil pole välkmälu täielikku kujutist. Iga kirjutatud pesa pandi tagasi ja nende plokkide värske lugemine, kuhu tavaline tõmmis ulatub, vastab varukoopiale. Täieliku kujutise saamiseks alustage uut seanssi valikuga, mis hõlmab pesa, kuhu järgmine käivitus siseneb.',
  'preserve.done.detailNoImageCount':
    'Kogu välkmälu lugemine ei toimunud, nii et sellel seansil pole välkmälu täielikku kujutist. Iga kirjutatud pesa pandi tagasi ja nende {blocks} ploki värske lugemine, kuhu tavaline tõmmis ulatub, vastab varukoopiale. Täieliku kujutise saamiseks alustage uut seanssi valikuga, mis hõlmab pesa, kuhu järgmine käivitus siseneb.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'kaamera akna lugeja on käivituse kohta piiratud ja need lugemised tulid ammendatud lugejalt — lülitage kaamera toide välja ja sisse (eemaldage ja ühendage uuesti või kasutage selle toitelülitit), seejärel käivitage uuesti `preserve --resume <run-directory>`. Signatuur: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'kaamera akna lugeja on käivituse kohta piiratud ja need lugemised tulid ammendatud lugejalt — lülitage kaamera toide välja ja sisse (eemaldage ja ühendage uuesti või kasutage selle toitelülitit), seejärel käivitage uuesti `preserve --resume <run-directory>`. Signatuur: {signature} — nendest baitidest ei saa tehase avateksti tuletada. Proovitud on kõiki lugemisviise:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'varukoopias pole {bank} ({address}) — tehase aknad ei saa seda anda',
  'preserve.fail.readsDisagree':
    '{bank} kaks lugemist ei ühti (sha256 {sha256} vs {other}) — kaamera, mis ei suuda töötavat pesa kaks korda järjest ühtmoodi anda, pole kaamera, millesse kirjutada; salvestis on taastamise allikas ja paiga tuletamise sisend',
  'preserve.fail.notFactory':
    '{bank:ine} pole tehase kujutist sellisena, nagu selle järgu šiffer selle salvestab (oodatud kujutise algus ei vasta salvestisele) — keeldutakse enne, kui midagi salvestatakse, rääkimata kirjutamisest',
  'preserve.fail.ffSum':
    'paigatud püsivara ei läbi kujul, milles kaamera selle salvestab, selle järgu enda kontrolli (summa peab olema {sum}) — keeldutakse saatmast pesa, mille kaamera pärast kustutamist tagasi lükkaks',
  'preserve.fail.headChanged':
    '{bank} algus on pärast varundamist muutunud (selles pole ei algset salvestist ega paigatud baite) — keeldutakse kirjutamast üle tundmatut pesa olekut; midagi ei kirjutatud. Alguse hex: praegu {live} vs salvestis {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    'paigatud baidid on juba {banks:ine} — kirjutamine jõudis kohale eelmisel katsel ja seda ei tohi korrata. Jätkake kogu välkmälu lugemise sammust (--resume), mis käivitab paigatud kujutise ja jätkab sealt.',
  'preserve.fail.landed':
    'paigatud baidid on juba {banks:ine} — kirjutamine jõudis kohale eelmisel katsel ja seda ei tohi korrata. Jätkake kogu välkmälu lugemise sammust (--resume), mis käivitab paigatud kujutise ja jätkab sealt.',
  'preserve.fail.drainRebootRefused':
    'host LÜKKAS kogu välkmälu lugemise taaskäivituskäsu tagasi enne, kui see välja läks (SecurityError: brauseri reegel või testi kaitse), nii et kaamera käitab endiselt kujutist, millega see käivitus, mitte kirjutatud paika. Kogu välkmälu lugemine loeb ainult paigatud kujutise laiendatud akna kaudu, nii et see peatub enne, kui midagi aktiveerib; midagi ei loetud. Käivitage kogu välkmälu lugemine uuesti seal, kus host taaskäivituskäsu läbi laseb.',
  'preserve.fail.shiftedRebootRefused':
    'kogu välkmälu lugemine tuli tagasi ühe lehe võrra nihkes ja taaskäivituse, mis annab uue käivituse, LÜKKAS host tagasi enne, kui see välja läks (SecurityError: brauseri reegel või testi kaitse) — uus katse loeks sama nihkes käivituse. Midagi ei säilitatud; käivitage kogu välkmälu lugemine uuesti seal, kus lähtestuskäsk välja pääseb.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'kontroll: erinevaid baite {count}, akendes {read}/{total} — välkmälu ei loe uuesti varukoopiaga bait-baidilt identselt',
    other:
      'kontroll: erinevaid baite {count}, akendes {read}/{total} — välkmälu ei loe uuesti varukoopiaga bait-baidilt identselt',
  },
  'preserve.fail.verifyIn': {
    one: 'kontroll: erinevaid baite {count}, akendes {read}/{total} (asukohad: {places}) — välkmälu ei loe uuesti varukoopiaga bait-baidilt identselt',
    other:
      'kontroll: erinevaid baite {count}, akendes {read}/{total} (asukohad: {places}) — välkmälu ei loe uuesti varukoopiaga bait-baidilt identselt',
  },
  'preserve.fail.verifyShort': {
    one: 'kontroll: erinevaid baite {count}, akendes {read}/{total} (lühikesed aknad: {short}) — välkmälu ei loe uuesti varukoopiaga bait-baidilt identselt',
    other:
      'kontroll: erinevaid baite {count}, akendes {read}/{total} (lühikesed aknad: {short}) — välkmälu ei loe uuesti varukoopiaga bait-baidilt identselt',
  },
  'preserve.fail.verifyInShort': {
    one: 'kontroll: erinevaid baite {count}, akendes {read}/{total} (asukohad: {places}) (lühikesed aknad: {short}) — välkmälu ei loe uuesti varukoopiaga bait-baidilt identselt',
    other:
      'kontroll: erinevaid baite {count}, akendes {read}/{total} (asukohad: {places}) (lühikesed aknad: {short}) — välkmälu ei loe uuesti varukoopiaga bait-baidilt identselt',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'käivituskonfiguratsiooni plokk',
  'preserve.fail.dataBlock': 'andmeplokk',

  'preserve.refused.secondRead': 'selle teine lugemine nurjus ({error})',
  'preserve.refused.readsDisagree': 'selle kaks lugemist ei ühti (sha256 {sha256} vs {other})',
  'preserve.refused.erased': 'see on kustutatud',
  'preserve.refused.watchdogMark':
    'selle päisesõnas nihkel +0x200 on {word}, märk, mille alglaadur kirjutab pesale pärast valvetaimeri lähtestust käivituse alguses; alglaadur ei võta seda pesa enam vastu ja seansil pole seal kujutist, mida paigata',
  'preserve.refused.noHeader': 'selles pole nihkel +0x200 kujutise päist',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'selles on {image} ({id}), mitte järk, mida kaamera käitab ({camera})',
  'preserve.refused.otherKey':
    'alglaaduri kontroll lükkab selle tagasi: see on salvestatud teise võtmega kui see, millega selle kaamera alglaadur pesasid kontrollib, ja kaamera kaudu kirjutamine salvestaks selle kaamera võtmega, nii et taastamine ei saaks selle täpseid baite tagasi panna',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'kaamera teatab püsivara {camera}, vaja on {version} — paik on tuletatud ühe järgu baitidest ja seda ei tohi saata teisele',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'püsivara {version} pole 0.x ega 1.x järk ja see seanss katab ainult 2014. ja 2016. aasta järke. Peale versiooni ei loetud midagi. Lugege seda kaamerat hoopis vahekaardil „Tõmmis ja dekrüptimine 4.x/Nano“: see loeb välkmälu ilma paigata, iga ploki peale selle, mis on aadressil 0x14060000, kuhu nendel järkudel ükski lugemisaken ei ulatu.',
  'preserve.refused.preWidening':
    'püsivara {version} on vanem kui laiendamise tee ja seanss keeldub, selle asemel et kirjutada üle pesa, mida see ei saa tagasi lugeda. Selles põlvkonnas tõrjub kaamera iga viisi, kuidas teele vajalikku lugemist alustada (mõõdetud versioonil 0.3.0.1), selle lugemiskäsk ei ulatu välkmälu algusesse ja suurus, mida paik muudaks, on salvestatud teisiti. Sellel pole ka lugemist, mida tavaline tõmmis saaks kasutada. Peale versiooni ei loetud midagi.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'sisaldab tundmatut kujutist (mitte tehase püsivara {version} ega selle muudatust, mida 0.x/1.x vahekaart tunneb), nii et 0.x/1.x vahekaart seda ei paika ega pane tagasi',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'sisaldab tuntud kaadrisageduse järku: tehase püsivara {version} koos {hz} Hz kaadrisageduse paigaga. 0.x/1.x vahekaart paikab ainult tehase püsivara, mitte kunagi paigatud kujutist, nii et see ei paika seda pesa ega pane seda tagasi',
  'preserve.image.frameRateEarlier':
    'sisaldab tuntud kaadrisageduse järku: tehase püsivara {version} koos varasema {hz} Hz kaadrisageduse paigaga (tehtud enne, kui USB parandus sellega liideti). 0.x/1.x vahekaart paikab ainult tehase püsivara, mitte kunagi paigatud kujutist, nii et see ei paika seda pesa ega pane seda tagasi',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    'see {what}. Selle pesa kaasamiseks kirjutage sinna esmalt tagasi tehase kujutis (näiteks enne muudatust tehtud täielikust välkmälu varukoopiast), seejärel alustage uut seanssi',
  'preserve.image.frameRateWords':
    'see {what}. Selle pesa kaasamiseks kirjutage sinna esmalt tagasi tehase kujutis (näiteks enne kaadrisageduse paika tehtud täielikust välkmälu varukoopiast), seejärel alustage uut seanssi; kaadrisageduse paiga saab hiljem tehase kujutisele uuesti teha',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name} {what}. Seanss võtab paigatava püsivara sellest pesast, nii et see peatub siin, enne kui midagi kirjutatakse. Selle kaamera säilitamiseks kirjutage esmalt tehase kujutis tagasi {bank:ill} (näiteks enne muudatust tehtud täielikust välkmälu varukoopiast), seejärel alustage uut seanssi.',
  'preserve.image.frameRateRefusal':
    '{name} {what}. Seanss võtab paigatava püsivara sellest pesast, nii et see peatub siin, enne kui midagi kirjutatakse. Selle kaamera säilitamiseks kirjutage esmalt tehase kujutis tagasi {bank:ill} (näiteks enne kaadrisageduse paika tehtud täielikust välkmälu varukoopiast), seejärel alustage uut seanssi; kaadrisageduse paiga saab hiljem tehase kujutisele uuesti teha.',
  'preserve.image.otherFirmware': 'selles on püsivara {image}, mitte {camera}, mida kaamera käitab',
  'preserve.image.otherFirmwareRefusal':
    '{name} sisaldab püsivara {image}, mitte {camera}, mida kaamera käitab, nii et sellel seansil pole seal kujutist, mida paigata, ja see keeldub, selle asemel et seda üle kirjutada.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'sellest ei tulene ühtegi kujutist, mida seanss saaks paigata ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone': 'see seanss on lõpetatud — kõik sammud on tehtud (seanss {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    '{step} on selles seansis juba tehtud (lõpetatud {finished}) — jätkamine algab sammust {next}',
  'preserve.gate.stepDoneUnknownTime':
    '{step} on selles seansis juba tehtud (lõpetamise aeg teadmata) — jätkamine algab sammust {next}',
  'preserve.gate.backupRerun':
    'varundamist ei saa uuesti käivitada: see seanss on juba lõpetanud sammud {steps} ja selle järgmine samm on {next} — kasutage --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'eelmine varundamiskatse nurjus ja kaamera toide tuleb enne selle sammu kordamist VÄLJA JA SISSE LÜLITADA — kordus samal käivitusel võib lugeda vananenud või tühje baite (mõõdetud: korratud varundamine luges käivituskonfiguratsiooni kirje asemel alglaaduri käivitussõna). Lülitage kaamera toide välja ja sisse (eemaldage ja ühendage uuesti või kasutage selle toitelülitit), seejärel käivitage varundamine uuesti ja kinnitage küsimisel, et toide lülitati välja ja sisse: seanss ei näe seda ise. Salvestatud tõrge: {error}',
  'preserve.gate.noErrorText': '(veateade puudub)',
  'preserve.gate.patchAfterBackup':
    '{step} toimub pärast varundamist: seanss teeb tõmmise igast piirkonnast, mida tehase plaan suudab lugeda, ja salvestab selle ENNE, kui midagi muud juhtub — see varukoopia on selle kaamera ainus koopia. Käivitage esmalt samm „Varundamine“.',
  'preserve.gate.commitAfterBackup': '{step} toimub pärast varundamist (vt samm „Paikamine“)',
  'preserve.gate.commitAfterPatch':
    '{step} toimub pärast sammu „Paikamine“, mis salvestab, mida see ette valmistab',
  'preserve.gate.commitNeedsPatch':
    '{step} vajab {banks:gen} paika, kuid samm „Paikamine“ ei salvestanud ühtegi — käivitage samm „Paikamine“ uuesti',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step} vajab seansi kaustas olevaid varukoopiafaile, kuid need puuduvad: {files} — ilma nendeta pole kirjutamisel taastamise allikat, nii et see keeldub',
  'preserve.gate.drainNoCommit':
    '{step} loeb PAIGATUD osa laiendatud akna kaudu, kuid sellel seansil pole lõpetatud kirjutamist — tehase kaameral jääks lugemine seisma. Käivitage esmalt kirjutamine (või jätkake sellest) või hüpake selgesõnaliselt edasi (allowJump), kui kirjutamine jõudis kohale ilma kontrollpunktita.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'kogu välkmälu lugemise samm keeldub ({build}): {note}',
  'preserve.gate.detectedBuild': 'tuvastatud järk',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'kogu välkmälu lugemise samm keeldub ({build}): kogu välkmälu lugemise alustamine selle järgu paikamata püsivaraga jooksutab kaamera kokku (see loeb väärtuselt, mis pole välkmälu aadress; mõõdetud emulaatoril: anti 32 KB, seejärel tekkis kaameras tõrge). Muudatus, mis teeb lugemise ohutuks, asub kohas {sites} ja see pole nende muudatuste hulgas, mille see seanss {bank:gen} jaoks salvestas — käivitage samm „Paikamine“ (ja viige kirjutamine lõpule) enne kogu välkmälu lugemist.',
  'preserve.gate.drainFiles':
    '{step} vajab faili {files} (edastatud tõmmist töödeldakse iga kirjutatud pesa salvestisega) ja seda pole seansi kaustas',
  'preserve.gate.restoreNoCommit':
    '{step} paneb algsed pesad paiga asemele tagasi, kuid sellel seansil pole lõpetatud kirjutamist — pole midagi, mida tagasi võtta. Käivitage esmalt kirjutamine (või jätkake sellest) või hüpake selgesõnaliselt edasi (allowJump), et taastada juba paigatud kaamera.',
  'preserve.gate.restoreNeedsPatch':
    '{step} vajab iga kirjutatud pesa paiga kokkuvõtet (ettevalmistatud pikkuse jaoks) — käivitage esmalt samm „Paikamine“',
  'preserve.gate.restoreNoForm':
    'taastamise samm keeldub ({build}): ükski algse püsivara vorm ei läbi kaamera enda kontrolli nii, et salvestuks ka tagasi algsete baitidena — algse püsivara kontrollsumma on 0xB7AB9D17 (mõõdetud), mitte 0xFFFF, mida kaamera nõuab. See seanss lõpeb täieliku kujutisega käes ja paik jääb paigale; algse sisu saab tagasi panna ainult kogu välkmälu programmaatoriga.',
  'preserve.gate.restoreFiles':
    '{step} vajab faili {files} (iga kirjutatud pesa originaal varundamise sammust) ja seda pole seansi kaustas',
  'preserve.gate.verifyNoRestore':
    '{step} võrdleb värsket käivitust varukoopiaga, kuid sellel seansil pole lõpetatud taastamist — paigatud pesa paistaks erinevustena. Käivitage esmalt taastamine (või jätkake sellest) või hüpake selgesõnaliselt edasi (allowJump), kui taastamine jõudis kohale ilma kontrollpunktita.',
  'preserve.gate.verifyNeedsBackup':
    '{step} vajab faili {file} (võrdluse alus) ja seda pole seansi kaustas',
  'preserve.gate.needsBanks':
    '{step} vajab pesasid, mille varundamise samm luges, kuid olekus neid pole',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'selle seansi jaoks pole pesasid valitud: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank} pole kirjutatav: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'selle järgu paik käivitub ainult taastepesast R: {note} — seanss kirjutaks {bank:ill}, kust alglaadur seda kunagi ei käivita',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'fail on liiga väike, et mahutada kujutise päist',
  'slots.image.notWordSized': 'kujutise suurus peab jaguma 4-ga (saadi {size} B)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'kujutis on {size} B; alglaadur lükkab tagasi iga header.length >= {limit}, nii et see ei käivituks kunagi',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'aadressil {at} pole kujutise päist (magic {magic}, oodati {expected}) — see peab olema Seeki dekrüptitud püsivara kujutis, mitte krüptitud pesa ega välkmälu tõmmis',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'algne pinuviit {address} pole LPC43xx SRAM-is — see ei paista dekrüptitud olevat',
  'slots.image.stackUnaligned': 'algne pinuviit {address} pole sõnale joondatud',
  'slots.image.notThumb': 'lähtestusvektor {address} pole Thumb-aadress',
  'slots.image.noKeyPair':
    'selle faili nimes pole võtmepaari ja kujutises ei esine täpselt üks kord ei selle kaamera paar ega dekodeeritud rakenduse paar, nii et pole võimalik öelda, milliste võtmete jaoks kujutis koostati. Dekrüptitud failid saavad nime nendes sisalduvate võtmete järgi.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'failinimi väidab võtit A {keyA} ja võtit B {keyB}, kuid {mismatch}. Mõlemad võtmed peavad esinema, kumbki täpselt üks kord.',
  'slots.image.keyInHeader':
    'see kujutis hoiab võtit aadressil {at}, avateksti päiseaknas — selle paikamisest keeldutakse',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'failinime võti A ja võti B lahenevad kattuvateks baitideks aadressidel {at} ja {other} — need peavad olema kaks erinevat 16-baidist väärtust',
  'slots.image.retargetLost':
    'pärast ümbersihtimist ei sisalda kujutis selle kaamera võtmepaari täpselt üks kord — keeldutakse koostamast andmeid, mille hilisemaid uuendusi alglaadur ei saaks võtmestada',
  'slots.image.noStageKey':
    'kujutises pole 2016. aasta liini võtmepaari, nii et ettevalmistusvõtit selle kodeerimiseks pole',
  'slots.image.ffSumNoKeys':
    'sellel kujutisel on 16 Hz FF sõnasumma 0xFFFF, kuid selles pole 1.3.0.8-FF võtmepaari (mõlemad pooled, kumbki üks kord), nii et selle ettevalmistatud vormi ei saa koostada. Midagi ei kirjutatud.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'see on 1.3.0.8 FF (16 Hz) kujutis, mis valmistatakse ette oma võtme A vormis (ff-form.ts), mitte avateksti kujutisena. Midagi ei kirjutatud.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'plaan koostati püsivarale {firmware}, kuid analüüs loeb {version}. Plaan on aegunud; koostage see uuesti. Midagi ei kirjutatud.',
  'slots.plan.otherFirmwareUnknown':
    'plaan koostati tundmatu versiooniga püsivarale, kuid analüüs loeb {version}. Plaan on aegunud; koostage see uuesti. Midagi ei kirjutatud.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'plaan koostati kaamerale {planSerial}, kuid analüüs loeb {serial}. Siia kirjutamisest keeldutakse. Midagi ei kirjutatud.',
  'slots.plan.cameraUnknownSerial': 'tundmatu seerianumbriga',
  'slots.plan.unknownSerial': 'tundmatut seerianumbrit',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, inside the sentence ("slot A"). */
  'slots.plan.otherAddress': 'plaani siht on {address}, kuid järgu {name} on aadressil {at}',
  'slots.plan.notRead': 'analüüs ei loe enam {name}. Midagi ei kirjutatud.',
  'slots.plan.edited':
    'plaani kontrollsumma ei vasta selle andmetele, nii et plaani on muudetud. Midagi ei kirjutatud.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'andmed on {size} B, suuremad kui {name}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck':
    '{risk}. Selle kirjutamiseks on vaja acknowledgeRisk: true. Midagi ei saadetud.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'see kaamera ei saa siit avatekstina ettevalmistatud kujutist vastu võtta: {reason}. Midagi ei kirjutatud.',
  'slots.plan.noKeyTable':
    'analüüs ei nimeta selle kaamera alglaaduri võtmetabelit, nii et kujutist ei saa selle jaoks ümber sihtida',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'pärast käsku CompleteMemoryUpgrade ei õnnestunud kinnitamise olekut lugeda, nii et {name} võib olla osaliselt kirjutatud. Lugege pesad enne midagi muud uuesti ja hoidke oma tõmmis alles.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'kaamera keeldus kirjutamast {name:ill} kinnitamisel olekuga {status}: {cause}. Midagi ei kirjutatud; pesa on muutmata. Lugege pesad enne midagi muud uuesti.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade tagastas {name:gen} kohta {status} ({cause}): midagi ei programmeeritud, kuid kustutamine võis alata, nii et pesa võib olla osaliselt kustutatud. Lugege pesad enne midagi muud uuesti ja hoidke oma tõmmis alles.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade tagastas {status} ({cause}) — {name} võib olla osaliselt kirjutatud. Lugege pesad enne midagi muud uuesti ja hoidke oma tõmmis alles.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'kaamera teatas olekust {status} {name:gen} ettevalmistamisel nihkel {offset} — katkestati enne käsku CompleteMemoryUpgrade, nii et välkmällu ei kirjutatud midagi',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum': 'edastuse kontrollsumma ei vastanud ettevalmistatud baitidele',
  'commit.cause.unsupported':
    'kujutis ei dekrüptunud kaamera võtmetega või andmetüübist keeldutakse',
  'commit.cause.acceptance':
    'kujutis lükati selle vastuvõtukontrolliga tagasi enne, kui midagi kustutati (kontroll sõltub järgust)',
  'commit.cause.notArmed': 'ühtegi pesa uuendust polnud aktiveeritud',
  'commit.cause.eraseFailed': 'kustutamise etapp nurjus',
  'commit.cause.programFailed': 'programmeerimise etapp nurjus',
  'commit.cause.verifyFailed': 'kontrollimise etapp nurjus',
  'commit.cause.unknown': 'siin tundmatu olek',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name} ei kopeerita iseendale. Midagi ei kirjutatud.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Midagi ei kirjutatud.',
  'copy.refused.noPlain':
    'Kopeeritavat dekrüptitud kujutist pole {name:ine}. Midagi ei kirjutatud.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} on ZIP-fail, mida siin lugeda ei saa ({error}). Midagi ei kirjutatud.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    'Failis {file} pole kogu välkmälu. ZIP-fail sobib, kui see on 0.x/1.x vahekaardi seansifail, milles on {preserve} (kui selle täieliku tõmmise samm on tehtud), vahekaardi „Tõmmis ja dekrüptimine 4.x/Nano“ ZIP-fail ({dump}) või nupu „Loe kõik selektorid“ ZIP-fail ({selectors}); selle ZIP-faili sisu: {names}. Midagi ei kirjutatud.',
  'restore.refused.noWholeFlashPatched':
    'Failis {file} pole kogu välkmälu. ZIP-fail sobib, kui see on 0.x/1.x vahekaardi seansifail, milles on {preserve} (kui selle täieliku tõmmise samm on tehtud), vahekaardi „Tõmmis ja dekrüptimine 4.x/Nano“ ZIP-fail ({dump}) või nupu „Loe kõik selektorid“ ZIP-fail ({selectors}); selle ZIP-faili sisu: {names}. Selles olev {patched} on välkmälu koos seansi ajutise paigaga, nii et see ei sobi. Midagi ei kirjutatud.',
  'restore.refused.zipEmpty': 'tühi',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'täielik välkmälu varukoopia on {full} B (4 MB, kogu kiip, mille J-Link loeb); {file} on {size} B. Midagi ei kirjutatud.',
  'restore.refused.noBank': 'selle järgu plaanis pole {bank}. Midagi ei kirjutatud.',
  'restore.refused.outsideFlash': '{name} pole 4 MB välkmälu sees. Midagi ei kirjutatud.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    '{where} jäi lugemata tõmmise ajal, millest {file} pärineb: faili manifest.json järgi on {address} tühimik. Taastatavat kujutist pole. Midagi ei kirjutatud.',
  'restore.refused.gapReason':
    '{where} jäi lugemata tõmmise ajal, millest {file} pärineb: faili manifest.json järgi on {address} tühimik ({gap}). Taastatavat kujutist pole. Midagi ei kirjutatud.',
  'restore.refused.gapFill':
    '{where} jäi lugemata tõmmise ajal, millest {file} pärineb: faili manifest.json järgi on {address} tühimik, täidetud väärtusega {fill}. Taastatavat kujutist pole. Midagi ei kirjutatud.',
  'restore.refused.gapReasonFill':
    '{where} jäi lugemata tõmmise ajal, millest {file} pärineb: faili manifest.json järgi on {address} tühimik ({gap}), täidetud väärtusega {fill}. Taastatavat kujutist pole. Midagi ei kirjutatud.',
  'restore.refused.empty':
    '{where} on tühi: iga bait on 0xFF. Kirjutamine programmeerib kujutise ega saa pesa kustutatuks jätta, nii et tühja pesa ei saa kirjutamisega taastada. Midagi ei kirjutatud.',
  'restore.refused.fill':
    '{where} on igas baidis {fill}, täide, mille tõmmis kirjutab sinna, kust see midagi ei lugenud: tõmmis ei lugenud seda pesa. Taastatavat kujutist pole. Midagi ei kirjutatud.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    '{where} pole sellest failist taastatav: {why}. Midagi ei kirjutatud.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'sellel järgul pole pesa jaoks kirjutamise aktiveerimist',
  'support.noStagingEmpty': 'sellel järgul pole ettevalmistusvormi, nii et tühja pesa ei kirjutata',
  'support.buildUnknown': 'järk on teadmata',
  'support.unverifiedStaging':
    'see järk on lukustatud 0.x/1.x liinil, kuid ei kuulu nende järkude hulka, millel 0.x/1.x vahekaardi paikade tabelid on mõõdetud (0.8.0.0 .. 1.3.0.8 ja 1.0.3.0 / 1.0.3.2), nii et selle pesa ettevalmistusvorm on teadmata ja midagi ei kirjutata',
  'support.unknownFamily':
    'kaamera perekond pole teada, nii et pole teada ka võti, millega selle pesad kirjutatakse, ja kaamera võtab vastu vale võtmega kirjutatud pesa ning ei käivitu siis sellest. Tehke kaamerast tõmmis ja dekrüptige see, tuvastage kaamera tõmmise järgi, seejärel nimetage selle perekond valikuga --family.',
  'support.noReadCommand':
    'püsivaral, mis on vanem kui 0.8.0.0, pole GetFeaturedFirmwareData lugemiskäsitlejat, käsku, millega tõmmis välkmälu loeb. Versioonidel 0.7.0.7 ja 0.7.0.8 on see RPC-meetoditabelis kohal 0x4F, kuid registreeritud ainult setterina (kirjutamiskäsitlejana), nii et tõmmise saadetavat control-IN lugemist ei saa suunata (0.x/1.x vahekaardi seanss loeb neid kahte järku hoopis käsu id 0x58, GetFeaturedData, kaudu); enne 0.7.0.7 on käsu id 0x4F UploadFirmwareRowSize ja 0.3.0.1 puhul on käsu id 0x52 — see, millega tõmmis aktiveerib — EnterBootloaderMode, mitte BeginFirmwareUpgrade: kaamera jääb oma rakendusse, kuid iga aktiveerimine seab välkmälu sihi ja aktiveerib selle järgu püsivara uuendamise etapi (GetErrorCode loeb siis 0x00400000), mis pole lugemisaken. Taastatud kujutiste endi meetoditabelitest, mõlemast käsitlejaveerust; vt test/firmware/facts.json.',
  'support.noWritePath':
    'need järgud võtavad uue püsivara vastu vanema uuendusjada kaudu, mida see tööriistakomplekt ei saada, ja nende pesasid pole kunagi kaardistatud, nii et midagi ei kirjutata.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'püsivara versiooni ei õnnestunud lugeda, nii et järk, selle pesad ja nende ettevalmistusvorm on teadmata; sellel ei loeta ega kirjutata midagi',
  'support.versionNotDotted':
    'püsivara versioon „{version}“ pole punktidega versioon, nii et järk, selle pesad ja nende ettevalmistusvorm on teadmata; sellel ei loeta ega kirjutata midagi',
  'support.olderThanFirst':
    'püsivara {version} on vanem kui {first}: selle RPC-tabelis pole GetFeaturedFirmwareData lugemiskäsitlejat, käsku, mille pesa lugemine saadab, nii et sellele ei saadeta ei lugemist ega kirjutamist (tõendid on perekonnal early-compact)',
  'support.modernOnLocked':
    'perekond modern-4x katab versioone 2.x, 4.x, 10.x, 42.x ja 44.x; {version} on 0.x / 1.x lukustatud liinil, mis vajab perekonda legacy-auth või compact-2016',
  'support.lockedOnModern':
    'perekond legacy-auth katab 0.x / 1.x lukustatud liini; {version} on uuel liinil, mis vajab perekonda modern-4x',
  'support.notCompactPro':
    'perekond compact-2016 katab Compact PRO 1.0.3.x liini; {version} sellel ei ole',
  'support.earlyCompact':
    'perekond early-compact katab ainult järke, mis on vanemad kui {first}, ja {version} loetakse perekonnaga legacy-auth',
  'support.generic':
    'kaamera perekond pole tuvastatud (perekond generic), nii et pesade paigutus ja ettevalmistusvorm on teadmata; tuvastage kaamera enne, kui pesa loetakse või kirjutatakse',
  'support.noPlan':
    'perekonnal {family} pole pesaplaani: selle pesade paigutus ja ettevalmistusvorm pole teada',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'selle järgu tabel ei aktiveeri režiimi {mode} aadressil {address} tavalisel kanalil',
  'support.noArmToken':
    'selle järgu tabel ei aktiveeri režiimi {mode} aadressil {address} märgiga kanalil',
  'support.windowElsewhere':
    '0.x/1.x vahekaardi aken {bank:gen} jaoks on aadressil {at}, mitte {address}',
  'support.noDumpWindow':
    'selle järgu BeginFirmwareUpgrade tabelis pole aadressil {address} akent {bank:gen} jaoks',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} ei toeta {capability}: {reason}',
  'support.capability.dump': 'tõmmist',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': 'nuppu „Loe kõik selektorid“',
  'support.capability.decrypt': 'dekrüptimist',
  'support.capability.deviceInfo': 'vahekaardi „Teave“ täielikku lugemist',
  'support.capability.flash': 'pesade kirjutamist',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name} aadressil {address} pole selles järgus loetav: selle selektoritabelis pole seal akent, nii et selle jaoks ei aktiveeritud midagi',
  'slots.unread.missing': '{name} puudub kaamera analüüsist',
  'slots.unread.notRead': '{name} jäi lugemata',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Midagi ei kirjutatud.',
  'slots.refused.versionUnknown':
    'analüüs ei ütle, millist püsivara kaamera käitab, ja pesakäsud tähendavad eri järkudes eri asju. Lugege seadme teave uuesti.',
  'slots.refused.versionUnknownWrite':
    'analüüs ei ütle, millist püsivara kaamera käitab. Midagi ei kirjutatud.',
  'slots.refused.emptyInput': 'sisend on tühi',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable':
    '{name} on tühi ja seda ei saa selles järgus kirjutada: {reason}',
  'slots.refused.noRaw': '{name} ei saa selles järgus toorbaite vastu võtta: {reason}',
  'slots.refused.noPlain': '{name} ei saa selles järgus dekrüptitud kujutist vastu võtta: {reason}',
  'slots.refused.noStaging':
    '{name:ade} pole selles järgus ettevalmistusvormi, nii et kujutist ei saa selle jaoks kodeerida',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B on pikem kui {name} ({bankSize} B)',
  'slots.refused.imageTooLong': 'kujutis on {size} B, pikem kui {name} ({bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    '2014. aasta alglaadur ei võta selle järgu kontrollsummat vastu pesas A ega B ja käivitab taastepesa R (0x14070000) seda kontrollimata, nii et paik kirjutatakse taastepesasse R ja mitte kuhugi mujale',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly': 'see järk töötab ainult taastepesast R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize': 'püsivarapesa on {size} B ({kib} KB); see fail on {count} B',
  'decryptFile.erasedBank':
    'tühi, pole midagi dekrüptida: kõik {size} B loetakse kui 0xFF (kustutatud pesa)',
  'decryptFile.erasedHeader':
    'kustutatud: päiseaken on täielikult 0xFF, nii et pesas pole kujutist; midagi ei dekrüptita',
  'decryptFile.noHeader':
    'kujutise päis puudub (magic {magic}), nii et dekrüptitavat kujutist pole',
  'decryptFile.lengthOutOfRange':
    'header.length {length} on vahemikust väljas; dekrüptitavat kujutist pole',
  'decryptFile.ffKeyB':
    'dekrüptiti {size} B FF 1.3.0.8 võtmega B: kujutis on salvestatud kui kujutis XOR selle võtmeploki 1 võtmevoog, päiseaken muutmata',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'võtit ei taastatud: kujutis dekrüptub lähtestusvektoriks, mis pole Cortex-M sisenemispunkt (võti {check}); midagi ei dekrüptita',
  'decryptFile.storedPlain':
    'salvestatud avatekstina: pesas on kujutis sellisena, nagu see töötab (2014. aasta avatekstiahel, identsusvõtmevoog), nii et võtit pole ja dekrüptitud kujutis on kujutis ise',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 'dekrüptiti {size} B sellest pesast taastatud võtmega ({check})',
  'decryptFile.decryptedNamed':
    'dekrüptiti {size} B sellest pesast taastatud võtmega ({check}; see on {key:nom})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'lühike lugemine ({size} B)',
  'read.reason.noParse': 'kujutise päist ei õnnestunud parsida',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'kujutise päis puudub (magic {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} on vahemikust väljas',
  'read.reason.stopped': 'pesa lugemine peatus kohal {count}/{size} B',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'pole püsivaral {version} loetav: selle plaanis ({table}) pole aadressil {address} akent, nii et selle jaoks ei aktiveeritud midagi',
  'read.reason.notInPlanUnknown':
    'pole tundmatu versiooniga püsivaral loetav: selle plaanis ({table}) pole aadressil {address} akent, nii et selle jaoks ei aktiveeritud midagi',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'aken andis vananenud lugemisdeskriptori baidid — sõna 0 {word} lähtestusega {hex} on aadressi 0x14000000 vektortabel, mitte selle pesa sisu, nii et sellest ei analüüsitud midagi: {remedy}',
  'read.reason.spentReader': 'kaamera pesasid ei õnnestunud lugeda — {remedy}',
  'read.spentRemedy':
    'akna lugeja võib selle käivituse jaoks olla ammendatud; lülitage kaamera toide välja ja sisse ning proovige uuesti',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'kaamera aktiivse pesa sõna (fw info roots, selektor 10) ei õnnestunud lugeda',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'kaamera aktiivse pesa sõna on {word}, mis ei nimeta ühtegi pesa',
  'checkKey.unnamed.cfg0NotRead':
    'käivituskonfiguratsiooni sõna ei loetud, nii et pole teada, kas alglaadur kontrollis {bank} enne sinna sisenemist',
  'checkKey.unnamed.noZeroSum':
    'kaamera teatab, et sisenes {bank:ill}, kuid {bank} ei dekrüptu selle lugemise järgi nullsõnasummaks',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'kaamera teatab, et sisenes {bank:ill}, mille käivituskonfiguratsiooni sõna {word} jätab viimaseks, nii et alglaadur sisenes sinna ilma kontrollita, kuid {bank} ei dekrüptu selle lugemise järgi nullsõnasummaks',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (skoor {score} pärast lugemist, allolevate tõendite põhjal)',
  'report.detectedAmbiguous':
    '{family} (skoor {score} pärast lugemist, allolevate tõendite põhjal; ebaselge)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'jah',
  'report.cell.no': 'ei',
  'report.cell.notApplicable': 'ei kohaldu',
  'report.cell.unknown': 'teadmata',
  'report.cell.recoveryOnly': 'ainult taaste',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'valgendus K',
  'report.keyRow.store': 'salvestusvõti',
  'report.keyRow.check': 'kontrollvõti',
  'report.keyRow.table': 'võtmetabel',
  'report.keyRow.keys': 'võtmed',
  'report.keyRow.a': 'võti A',
  'report.keyRow.b': 'võti B',
  'report.keyRow.tableAt': 'tabel aadressil',
  'report.key.notIdentified': '(tuvastamata)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} kandidaat, ükski pole kinnitatud',
    other: '{count} kandidaati, ükski pole kinnitatud',
  },
  'report.key.tableAt': '{offset} alglaaduri plokis, kinnitatud pesa järgi',
  'report.key.plainChain':
    'pole vaja: pesad on salvestatud avateksti püsivarana, nii et pesa loetakse ja kirjutatakse sellisena, nagu see on',
  'report.key.tableRefused2016':
    'ei loetud — alglaaduri plokist (0x14000000) keeldutakse sellel liinil igal kanalil',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, nimetatud {bank:ela}, kuhu kaamera teatab end sisenenud olevat pärast alglaaduri kontrolli',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, järeldatud {bank:ela}, kuhu kaamera teatab end sisenenud olevat: alglaadur siseneb sellesse pesasse ilma kontrollita ja käitab seda võtmega, millega see teisi pesasid kontrollib',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' ({pair} plokk 1)',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'Compact PRO 1.0.3.x 9 Hz paari',
  'keyPair.cp1032ff': 'Compact PRO 1.0.3.x FF paari',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'nimetamata — {why}',
  'report.checkKey.couldNotName': 'lugemine ei suutnud seda nimetada',
  'report.storeKey.checkKeyUnnamed':
    'võti, millega alglaadur pesa kontrollib (selle lugemisega nimetamata): rakendus salvestab iga kirjutatava pesa selle võtmega',
  'report.storeKey.checkKey':
    '{key}: rakendus salvestab iga kirjutatava pesa võtmega, millega alglaadur kontrollib',
  'report.storeKey.unknown': 'teadmata — alglaaduri plokki, kus asub seadmevõti, ei loetud',
  'report.storeKey.keyBUnidentified':
    'Võti B (seadmevõtit pole programmeeritud; võtit B ennast pole tuvastatud)',
  'report.storeKey.keyB': 'Võti B (seadmevõtit pole programmeeritud)',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain':
    'ette valmistatud avatekstina (kujutis sellisena, nagu see on, ilma võtmeta)',
  'report.staged.slotKeystream': 'ette valmistatud kujutise enda võtmeplokiga 0',
  'report.staged.keyA':
    'ette valmistatud võtmetega, mis on tuletatud käivitatud pesast ja töötavast rakendusest',
  'report.staged.ffVendor':
    'ette valmistatud nii, nagu tootja rakendus valmistab ette 16 Hz FF kujutise (kujutis XOR selle enda võtmeplokk 0), kaamera salvestab selle võtmega B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Varundamine: plokk {address}',
  'progress.backupDone': 'Varundamine: kõik plokid loetud',
  'progress.checkBlock': 'Kontrollimine: plokk {address}',
  'progress.checkDone': 'Kontrollimine: kõik plokid loetud',
  'progress.writingBank': 'Kirjutatakse {bank:ill}',
  'progress.restoringBank': 'Taastatakse {bank}',
  'progress.staged': '{label}: ette valmistatud {done}/{total} B',
  'progress.wholeFlash': 'Kogu välkmälu lugemine: {got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'lugemine {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'lugemine {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Valmis — loetud aknaid: {ok}/{total}.',
  'progress.readingBank': 'Loetakse {bank} ...',
  'progress.analysing': 'Analüüsimine ...',
  'progress.probeSelector': 'selektori {selector} proovimine ...',
  'progress.selectorsArmed':
    'Valmis — aktiveeritud selektoreid: {armed}/{span}, neist andmetega {withData}.',
  'progress.recoveringKey': 'dekrüptimine: aadressi {address} võtme taastamine ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} {address} (subcmd {subcmd}) ei õnnestunud lugeda: {error}',
  'slots.read.refusedBuild':
    'püsivarapesade lugemisest keeldutakse: {reason}. Peale versiooni lugemise ei saadetud midagi, nii et ühtegi pesa ei puudutatud.',
  'slots.backup.notSaved':
    'varukoopiat {file} ei salvestatud, nii et midagi ei kirjutatud. Kirjutamine ei toimu kunagi ilma eelnevalt salvestatud varukoopiata; proovige uuesti, kui selle saab salvestada.',
  'slots.backup.notSavedWhy':
    'varukoopiat {file} ei salvestatud ({error}), nii et midagi ei kirjutatud. Kirjutamine ei toimu kunagi ilma eelnevalt salvestatud varukoopiata; proovige uuesti, kui selle saab salvestada.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'kiire (480 Mbit/s)',
  'usb.speed.full': 'täiskiirus (12 Mbit/s)',
  'usb.speed.code': 'kood {code}',
} satisfies Translation<'core', 'et'>;
