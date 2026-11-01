/**
 * Namespace `core`, magyar (hu), translated from the English source: sentences that `@seek-fw/core` makes and
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
    'a kamera a következő ki- és bekapcsolásig feloldva marad, és addig más eszközök hibásan olvashatják; mielőtt azokat használná, kapcsolja ki és be',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': 'először {first}, majd {second}, végül {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'nem lett kiolvasva',
  'boot.verdict.checkKeyUnnamed':
    'nem ellenőrizhető: nincs megnevezve a kulcs, amellyel a bootloader a slotokat ellenőrzi',
  'boot.cfg0NotRead':
    'az indítási konfigurációs szó (cfg[0]) nem lett kiolvasva, így nem ismert, melyik slotot futtatja a következő indítás',
  'boot.select.unknown':
    'az indítási konfigurációs szó értéke {word}, így a bootloader először {first:acc} próbálja, de {bank:nom} {verdict}, így nem ismert, melyik slot fut',
  'boot.select.first':
    'az indítási konfigurációs szó értéke {word}, így a bootloader először {first:acc} próbálja, és abban a bootloader által elfogadott lemezkép van',
  'boot.select.second':
    'az indítási konfigurációs szó értéke {word}, így a bootloader először {first:acc} próbálja; {first:ine} nincs a bootloader által elfogadott lemezkép, ezért {second:acc} választja',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'az indítási konfigurációs szó értéke {word}, így a bootloader először {first:acc} próbálja; sem {first:ine}, sem {second:ine} nincs a bootloader által elfogadott lemezkép, ezért {last:acc} indítja el, amelyet nem ellenőriz',
  'boot.select.lastTakes':
    'az indítási konfigurációs szó értéke {word}, így a bootloader először {first:acc} próbálja; sem {first:ine}, sem {second:ine} nincs a bootloader által elfogadott lemezkép, ezért {last:acc} választja, amelyet nem ellenőriz',
  'boot.bootsNow': 'Most {bank:ela} indul a kamera',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'most erről indult',
  'boot.notBooted': 'nem erről indult',
  'boot.unknownWhy.checkKeyUnnamed':
    'ebben az olvasásban nincs megnevezve a kulcs, amellyel a bootloader a slotokat ellenőrzi',
  'boot.unknownWhy.noKeyTable':
    'a bootloader kulcstáblája nem lett kiolvasva, így a kipróbált kulcsok nem nevezhetők meg',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'A kamera {bank:ela} indul. {why}.',
  'fpsBoot.holdsOne':
    '{bank}: képkockasebesség-módosítást tartalmaz, de nem ez a slot fut, így a módosítás nem lép érvénybe.',
  'fpsBoot.holdsTwo':
    '{banks}: képkockasebesség-módosítást tartalmaznak, de egyikük sem fut, így a módosítások nem lépnek érvénybe.',
  'fpsBoot.wouldNotRun':
    'Hiába módosítaná {target:acc}, attól sem az futna, mert a kamera helyette {bank:ela} indul.',
  'fpsBoot.patchRunning':
    'Módosítsa {bank:acc} is (azt, amely fut): ettől lép érvénybe a képkockasebesség-módosítás.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank}: itt nem módosítható ({reason}), ezért egy másik slotban lévő képkockasebesség-módosítás ezen a kamerán nem lép érvénybe.',

  /* ---- backup: the zip saved before a bank write (slots/backup); `{name}` is the bank inside a sentence ("slot B"): each is an item of backup.plan.* ---- */
  'backup.bank.notInPlan': '{name:acc} (nincs benne ennek a változatnak a tervében: a zip jelzi)',
  'backup.bank.unsupported':
    '{name:acc} (ez a változat nem tudja kiolvasni, {reason}: a zip jelzi)',
  'backup.bank.empty':
    '{name:acc} (üres, minden bájtja 0xFF: a zip jelzi, és az írás nem ír felül firmware-t)',
  'backup.bank.unread':
    '{name:acc} (a slotok kiolvasása nem érte el: a zip jelzi, hogy az írás előtti olvasás eléri-e)',
  'backup.bank.noKey':
    '{name:acc} (tárolt formában; az ebben az olvasásban kinyert kulcsok egyike sem nyitja meg, így nincs visszafejtett fájl)',
  'backup.bank.decrypted': '{name:acc} (tárolt formában és visszafejtve)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Mielőtt bármit írna, újra kiolvassa {banks}, és egyetlen zipbe menti, egy feljegyzéssel arról, melyik fájl mi: {file}.',
  'backup.plan.many':
    'Mielőtt bármit írna, újra kiolvassa {banks}, és egyetlen zipbe menti őket, egy feljegyzéssel arról, melyik fájl mi: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'titkosítva, hogy az eszköz az indító slotban lévő kulccsal tárolja',
  'staging.detail.slotKeystreamCiphertext':
    'a lemezkép saját előkészítési kulcsával titkosítva (0. kulcsblokk); a kamera a slot saját kulcsával tárolja',
  'staging.detail.plain': 'titkosítatlanul, rejtjelezés nélkül',
  'staging.detail.keyAKeystream':
    'az 1.3.0.8 FF lemezkép úgy, ahogy a gyártó alkalmazása előkészíti (XOR A-kulcs) – a 16 Hz-es változat a B-kulccsal tárolja, nem ezekkel a bájtokkal',
  'staging.detail.verbatim': 'változatlanul – a bájtok pontosan úgy, ahogy megadták',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'nincs kiolvasva',
  'copy.source.notInPlan': '{name:nom} nincs benne ennek a változatnak a tervében',
  'copy.source.notRead': '{name:nom} nem lett kiolvasva ({reason}), így nincs másolható lemezkép',
  'copy.source.empty': '{name:nom} üres: nincs másolható lemezkép',
  'copy.source.foreign':
    '{name:ine} nincs olyan firmware-lemezkép, amelyet ez az olvasás felismer, így nincs mit másolni',
  'copy.source.noKey':
    'az ebben az olvasásban kinyert kulcsok egyike sem nyitja meg {name:acc}, így nincs másolható visszafejtett lemezkép',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name}, cím: {address}, ahogy a slotok kiolvasása visszafejtette',
  'copy.fromVersion':
    '{name}, cím: {address}, firmware: {version}, ahogy a slotok kiolvasása visszafejtette',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'A lemezkép {name:ela} származik, ahogy a slotok kiolvasása visszafejtette: {size} B, sha256 {sha256}.',
  'copy.noteVersion':
    'A lemezkép {name:ela} származik, ahogy a slotok kiolvasása visszafejtette: firmware {version}, {size} B, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '{name:nom} ({address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where} ebből a teljes flash-mentésből: {file}',
  'restore.fromVersion': '{where} ebből a teljes flash-mentésből: {file}, firmware: {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': '4 MB-os flash-memóriakép',
  'restore.kind.preserve-run': 'megőrzési futtatási fájl',
  'restore.kind.dump': '„4.x/Nano kiolvasása és visszafejtése” zip',
  'restore.kind.all-selectors': '„Minden szelektor kiolvasása” zip',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'lemezkép',
  'restore.decryptedTo.firmware': '{version} firmware',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'A lemezkép forrása a mentésben: {where}, ebben: {file} ({kind}); tárolt sha256: {stored}, visszafejtve: {decrypted}, {size} B (sha256: {sha256}).',
  'restore.note.imageEntry':
    'A lemezkép forrása a mentésben: {where}, ebben: {file} ({kind}, a benne lévő {entry}); tárolt sha256: {stored}, visszafejtve: {decrypted}, {size} B (sha256: {sha256}).',
  'restore.note.readBack':
    'Az írás után a visszaolvasott slotot összeveti a mentésben tárolt slotbájtokkal.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'A mentés azonosítóblokkja ezt a kamerát nevezi meg (sorozatszám: {serial}).',
  'restore.note.sameBytes':
    'Már most is a mentésben tárolt bájtok vannak {name:ine}: az írás ugyanazt a lemezképet teszi vissza.',
  'restore.warn.otherCamera':
    'Ez a mentés egy másik kameráénak tűnik: az azonosítóblokkja szerint a sorozatszám {theirs}, ennek a kamerának pedig {camera}. Csak {name:nom} lemezképe íródik ki; annak a kamerának az azonosítójából és kalibrációjából semmi.',
  'restore.warn.noIdentity':
    'Ennek a mentésnek nincs azonosítóblokkja ezen a címen: {address}, így nem állapítható meg, melyik kamerából olvasták ki.',
  'restore.warn.serialNotRead':
    'A kamera sorozatszáma nem lett kiolvasva, így a mentés (sorozatszám: {serial}) nem vethető össze vele.',
  'restore.warn.otherFirmware':
    'A mentésben {where} firmware-verziója {version}, a kamera viszont ezt futtatja: {camera}; a visszaállítás más firmware-t tesz a slotba.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    'Nem olvasta vissza {bank:acc}, így nem vetette össze a mentéssel.',
  'restore.readBack.equal':
    'A visszaolvasás szerint {bank:nom} bájtról bájtra megegyezik a mentésben tárolttal.',
  'restore.readBack.differs':
    '{bank}: a visszaolvasott bájtok {count} B-ban eltérnek a mentésben tároltaktól (az első eltérés: {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, {bank:ela} származtatva, amelyről a kamera indult',
  'keys.derived.holds':
    '{key} (a tárolási kulcs), {bank:ela} származtatva, amelyről a kamera indult, és amelyben {holds:nom} van',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, az indító slotból származtatva',
  'keys.derived.holdsUnnamed':
    '{key} (a tárolási kulcs), az indító slotból származtatva, amelyben {holds:nom} van',
  'keys.ffVendor.staged':
    'az 1.3.0.8 FF (16 Hz-es) lemezkép úgy, ahogy a gyártó alkalmazása előkészíti: a lemezkép XOR a saját 0. kulcsblokkja (A-kulcs), a fejlécablak változatlanul, bármely slotba; ennek a kamerának a kulcsait nem használja',
  'keys.ffVendor.stored':
    'B-kulcs: a kamera az 1. kulcsblokkal újrakulcsolja a feltöltést, és azzal tárolja a lemezképet',
  'keys.imageBlock0.staged':
    'a lemezkép a saját 0. kulcsblokkjával (a lemezképben érték alapján megtalálva), bármely slotba; ennek a kamerának a kulcsait nem használja',
  'keys.imageBlock0.storedUnnamed':
    'az a kulcs, amellyel a bootloader a slotokat ellenőrzi (ebben az olvasásban nincs megnevezve); a kamera ezzel titkosítja újra a feltöltést',
  'keys.imageBlock0.stored':
    '{key}: ezzel ellenőrzi a bootloader a slotokat; a kamera ezzel titkosítja újra a feltöltést',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED (nem tesztelt): a 16 Hz-es FF változat bootloaderét még egyetlen kamerából sem olvasták ki, így nem ismert, hogy az írt slot elindul-e. A 0.9.0.0-s bootloaderen ennek a lemezképnek egy korábbi formája elindult a helyreállító R-slotból; ez a forma nem fog, mert az a bootloader a helyreállító R-slotot úgy indítja, ahogy tárolva van, dekódolás nélkül.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'A 16 Hz-es FF lemezkép olyan formában kerül elküldésre, amelyet csak a 16 Hz-es {version} változat olvas. Ez a kamera a lemezkép ellenőrzése nélkül ír egy slotot (a firmware forráskódja szerint, és egy 1.3.0.0-s Compact is így tett a próbán), így várhatóan úgy írja a bájtokat, ahogy elküldték: a slot ekkor olyan formában tartalmazza a lemezképet, amelyet ez a kamera nem tud elindítani.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Itt semmi sem állítja, hogy a kamera elindítja.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast': 'A kamera saját válaszai szerint a 16 Hz-es FF változatot futtatja: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'egy slot törlése előtt ellenőrzi az adatcsomagot, és ez az adatcsomag átmegy az ellenőrzésen, így ezeket a bájtokat úgy írhatja, ahogy vannak, a bootloadere által el nem indítható formában: lehet, hogy a slot nem indul el (nem próbálták ki; az írás előtt elmentett biztonsági mentés visszaállítja)',
  'write.ff.outcome.refuses':
    'egy slot törlése előtt ellenőrzi az adatcsomagot, és ez az adatcsomag nem megy át az ellenőrzésen, így várhatóan még azelőtt elutasítja ezt az írást, hogy bármit írna (egy ezt a változatot futtató kamera ugyanígy utasította el ennek a lemezképnek egy korábbi formáját)',
  'write.ff.runsSlow':
    'A kamera a 8 Hz-es {version} változatot futtatja: {why}. Az a változat {outcome}.',
  'write.ff.buildUnknown':
    'A kamera saját válaszaiból nem derül ki, melyik {version} változatot futtatja: {why}. Ha a 16 Hz-es FF változatot futtatja, elfogadja ezt az adatcsomagot. Ha a 8 Hz-eset, az a változat {outcome}.',
  'write.raw.asGiven':
    'Nyers adatcsomag: pontosan úgy kerül elküldésre, ahogy megadták. Itt semmi sem ellenőrzi, hogy indítható-e.',
  'write.raw.ffStagedForm':
    'Ez az adatcsomag az 1.3.0.8 FF előkészített formája (a lemezkép XOR 0. kulcsblokk, szóösszeg 0xFFFF). A kamera a B-kulccsal tárolja a lemezképet, így a visszaolvasást ezekhez a bájtokhoz méri.',
  'write.raw.noStaging':
    'Ez a változat nem nevez meg előkészítési formát a slothoz, így a bootloader ellenőrzései nem adhatók meg.',
  'write.raw.reencrypts':
    'Az eszköz dekódolja ezt az adatcsomagot, és újra titkosítja, amit megtart, így a tárolt bájtok nem jósolhatók meg. A visszaolvasást ahhoz a lemezképhez méri, amelyre visszafejthető, ahol ez megmondható.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'A bootloader elutasítaná ezt az adatcsomagot: {failure}.',
  'write.raw.stageKeyUnchecked':
    'A 2016-os előkészítési kulcs (0. kulcsblokk) nincs benne a nyers bájtokban, így ennek az adatcsomagnak a visszafejtett szóösszegét itt nem ellenőrzi.',
  'write.image.rekeyRisk':
    'Már most is olyan lemezkép van {name:ine}, amelyet a bootloader nem fogad el. Ez az írás ugyanezt az állapotot eredményezi.',
  'write.ack.recovery':
    'Helyreállító R-slot: az írásához el kell fogadnia a kockázatot. Itt semmi sem ellenőrzi, hogy a kamera utána elindul-e.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}. Az írásához el kell fogadnia a kockázatot, és a következő ki- és bekapcsolás után a kamera azt futtatja, ami benne van.',
  'write.ack.bootUnnamed': 'Az indító slot nem nevezhető meg, ezért ezt kell indítónak tekinteni',
  'write.ack.recoveryFallback':
    'A helyreállító R-slot az utolsó tartalék másolat, amelyre a bootloader visszaáll',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'üres/0: előbb az A-slot, aztán a B-slot, végül a helyreállító slot',
  'boot.cfg0.modernB': 'előbb a B-slot, aztán az A-slot, végül a helyreállító slot',
  'boot.cfg0.modernRecovery': 'előbb a helyreállító slot, aztán az A-slot, végül a B-slot',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'nem ismert – {why}',
  'report.nextStart.runs': '{bank} – {why}',
  /** `{verdict}` is one of upgrade.verdict.*. `{name}` here is the bank inside a sentence ("slot B"); in upgrade.verdict.* it starts a sentence ("Slot B"). */
  'upgrade.whileRecovery':
    'A kamera a helyreállító slotjáról fut, és a saját frissítése {name:acc} írja, amely nem fut. {verdict} Ez csak figyelmeztetés: itt semmi sem akadályozza meg a frissítést.',
  'upgrade.verdict.notRead':
    'Ebben az ellenőrzésben {name:nom} nem volt kiolvasható, így nem ismert, mi van benne.',
  'upgrade.verdict.blank': 'Üres {name:nom}, így a frissítés üres slotba ír.',
  'upgrade.verdict.bootableSame':
    'Ugyanaz az indítható lemezkép van {name:ine}, mint a futó slotban, és ezt a frissítés lecseréli. Ha a frissítés félbeszakad, {name:nom} indíthatatlan marad.',
  'upgrade.verdict.bootable':
    '{name}: indítható lemezképet tartalmaz, amelyet a frissítés lecserél. Ha a frissítés félbeszakad, ez a slot indíthatatlan marad.',
  'upgrade.verdict.unknown':
    'Ebben az olvasásban nem ismert, hogy {name:nom} indítható-e, így a frissítés olyan lemezképet is lecserélhet, amelyről a kamera elindulna.',
  'upgrade.verdict.notBootable':
    'Ebben az olvasásban {name:nom} nem látszik indíthatónak, így a frissítés nem cserél le olyan lemezképet, amelyről a kamera elindulna.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} – ezt a slotot indította el a bootloader ennél az indításnál, ahogy maga rögzíti',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'nincs kiolvasva',
  'report.lastStart.noBank': 'a kamera ezt jelenti: {word}, amely egyik slotot sem nevezi meg',
  'report.lastStart.entered':
    'a kamera jelentése szerint {bank:ela} indult (az aktív slot szava: {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'nincs verzió',
  'running.why.otherVersion':
    'a kamera ezt jelenti: {version}, és két változat csak ebből létezik: {only}',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'a kamera nem adta meg a slotonkénti válaszokat (GetFirmwareInfo, 6., 7. és 8. szelektor)',
  'running.why.notRead':
    'egy slot, amelytől a válaszok függnek, nem lett kiolvasva, így a válaszok nem jósolhatók meg',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'a kamera válaszai: {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers}, és éppen ezt válaszolja ezekre a slotokra a 8 Hz-es 1.3.0.8 változat ({predicted})',
  'running.why.ff':
    '{answers}, és éppen ezt válaszolja ezekre a slotokra a 16 Hz-es FF 1.3.0.8 változat ({predicted})',
  'running.why.both':
    '{answers}, és mindkét változat pontosan ezt válaszolja ezekre a slotokra, így a slotok alapján nem különböztethetők meg',
  'running.why.neither':
    '{answers}, ami egyik változattal sem egyezik (8 Hz: {plain}; 16 Hz FF: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'Ennek a lemezképnek a fejléce nem nevez meg firmware-verziót, így nem állapítható meg, hogy azt a változatot tartalmazza-e, amelyet a kamera futtat ({camera}). Ellenőrizze, hogy valóban ezt a lemezképet akarja-e írni.',
  'imageBuild.otherVersion':
    'Ennek a lemezképnek a firmware-verziója {image}; a kamera ezt futtatja: {camera}.',
  'imageBuild.otherVersionTaken':
    'Ennek a lemezképnek a firmware-verziója {image}; a kamera ezt futtatja: {camera}. Ebben a sorozatban a kamera csak azt ellenőrzi, hogy a lemezkép formailag helyes-e (a fejlécét és a szóösszegét), a verzióját nem, így elfogadja ezt a lemezképet, és amikor erről a slotról indul, ezt futtatja: {image}.',
  'imageBuild.otherVersionUnchecked':
    'Ennek a lemezképnek a firmware-verziója {image}; a kamera ezt futtatja: {camera}. Azt még nem ellenőrizték, hogy ez a kamera elfogad-e és futtat-e egy másik változatot.',
  'imageBuild.otherBuild':
    'Ez a lemezkép a 8 Hz-es {version} változat; a kamera a 16 Hz-es {version} FF változatot futtatja. A 16 Hz-es változat véglegesítéskor a saját FF formájához méri az adatcsomagot, és ha nem felel meg, még a slot törlése előtt elutasítja (a forráskódja szerint). A 8 Hz-es változat ráírását kamerán még nem próbálták ki.',
  'imageBuild.runningUnknown':
    'Ez a lemezkép a 8 Hz-es {version} változat. A kamera firmware-e {version}, amelynek 8 Hz-es és 16 Hz-es FF változata is van, és a saját válaszaiból nem derült ki, melyiket futtatja, így nem állapítható meg, hogy ez az ő változata-e.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort':
    'az adatcsomag {size} B, túl rövid ahhoz, hogy fejlécet tartalmazzon a 0x200 címen',
  'bootFail.noMagic':
    'nincs lemezkép-azonosító (magic) a 0x200 címen (talált érték: {found}, a bootloadernek ez kell: {needs})',
  'bootFail.lengthOutside': 'a header.length ({length}) kívül esik az adatcsomagon ({size} B)',
  'bootFail.lengthNotPayload':
    'a header.length ({length}) nem egyezik az adatcsomag hosszával ({size})',
  'bootFail.overStage': '{size} B meghaladja az előkészítési területet ({max} B)',
  'bootFail.plainSum': 'a tárolt szóösszeg {sum}, a 2014-es bootloadernek 0 kell',
  'bootFail.noFooter': 'nincs lábléc itt: {offset}; az adatcsomag itt ér véget: {end}',
  'bootFail.footerNotCode':
    'a lábléc ({offset}) nem „CODE” – a bootloader a szegmentált betöltőjét használja',
  'bootFail.footerLength': 'a lábléc hossza nem egyezik a header.length értékével ({length})',
  'bootFail.keyASum':
    'a kamera A-kulcsával visszafejtve a szóösszeg {sum}, a bootloadernek ez kell: {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'az elfogadási összeggel ellenőrizve',
  'keyConfidence.structural': 'csak a vektortáblával ellenőrizve',
  'keyConfidence.unverified': 'nincs ellenőrizve',
  /** `{sum}` is hex. */
  'keyCheck.family': 'a kulcs az elfogadási összeggel ({sum}) ellenőrizve',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'kulcs: {phrase}; elfogadási összeg: {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'a kamera saját kulcsaival előkészítve',
  'staging.phrase.slotKeystreamCiphertext': 'a lemezkép saját kulcsával előkészítve',
  'staging.phrase.plain': 'titkosítatlanul előkészítve',
  'staging.phrase.keyAKeystream':
    'úgy előkészítve, ahogy a gyártó alkalmazása az FF lemezképet (XOR A-kulcs)',
  'staging.phrase.verbatim': 'úgy elküldve, ahogy megadták',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank, inside the sentence ("slot A"); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    '{size} B véglegesítve {name:ill} ({address}), {staged}; véglegesítési állapot: {status}',
  'written.noReadWindow':
    'ez a változat nem nevez meg olvasási ablakot a slothoz, így semmi sem lett visszaolvasva',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'a visszaolvasás nem sikerült: {error}',
  'written.readBack': 'visszaolvasva {size} B, SHA-256: {sha256}',
  'written.verifyOff': 'az ellenőrzés ki van kapcsolva: a slot nem lett visszaolvasva',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'a terv által a slotra jósolt bájtok (a lemezkép úgy, ahogy a 16 Hz-es változat tárolja, nem az elküldött bájtok)',
  'readBack.reference.asSent':
    'a terv által a slotra jósolt bájtok (a bájtok úgy, ahogy elküldték)',
  'readBack.sizeDiffers':
    'a visszaolvasott adat {size} B, a terv {predictedSize} B-ot jósolt: a slot NEM egyezik a következővel: {reference}',
  'readBack.matchesFolded':
    'a slot úgy tartalmazza a lemezképet, ahogy a 16 Hz-es változat tárolja (nem az elküldött bájtokat), és a slot többi része törölve van',
  'readBack.matches':
    'a slot egyezik a terv által jósolt bájtokkal (a 2014-es titkosítatlan lánc pontosan azt programozza be, amit kap)',
  'readBack.differs': 'a slot NEM egyezik a következővel: {reference} (első eltérés: {offset})',
  'readBack.noHeader':
    'a visszaolvasott adatban nincs lemezképfejléc itt: {offset} (magic: {magic}), így a slot NEM a várt lemezképre fejthető vissza',
  'readBack.lengthDiffers':
    'a visszaolvasott fejléc szerint {length} B, a terv lemezképe {imageLength} B: a slot NEM a várt lemezképre fejthető vissza',
  'readBack.tooShort':
    'a visszaolvasott adat {size} B, túl rövid egy {length} B-os lemezképhez: a slot NEM a várt lemezképre fejthető vissza',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'a visszaolvasásból kinyert kulcsfolyam ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': 'a slot a várt lemezképre fejthető vissza ({length} B), ezzel: {recovered}',
  'readBack.decryptDiffers':
    'a slot NEM a várt lemezképre fejthető vissza: első eltérés a lemezképben itt: {offset}, ezzel: {recovered}',
  'readBack.rawNotCompared':
    'nyers bájtok: a visszaolvasás eredménye megjelenik, de nincs összevetve (ebben a formában a bájtok nem fejthetők vissza előre megjósolható titkosítatlan lemezképpé, és az eszköz újra titkosítja, amit megtart)',
  'readBack.notCompared':
    'összevetés nem volt lehetséges: a terv sem a tárolt bájtokat, sem a titkosítatlan lemezképet nem jósolja meg',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'A-kulcs',
  'keyName.keyA:nom': 'az A-kulcs',
  'keyName.keyA:acc': 'az A-kulcsot',
  'keyName.keyA:dat': 'az A-kulcsnak',
  'keyName.keyA:ins': 'az A-kulccsal',
  'keyName.keyA:ine': 'az A-kulcsban',
  'keyName.keyA:ill': 'az A-kulcsba',
  'keyName.keyA:ela': 'az A-kulcsból',
  'keyName.keyA:sup': 'az A-kulcson',
  'keyName.keyA:sub': 'az A-kulcsra',
  'keyName.keyA:del': 'az A-kulcsról',
  'keyName.keyA:ade': 'az A-kulcsnál',
  'keyName.keyA:all': 'az A-kulcshoz',
  'keyName.keyA:abl': 'az A-kulcstól',
  'keyName.keyA:tra': 'az A-kulccsá',
  'keyName.keyA:ter': 'az A-kulcsig',
  'keyName.keyA:ess': 'az A-kulcsként',
  'keyName.keyA:cau': 'az A-kulcsért',
  'keyName.keyB': 'B-kulcs',
  'keyName.keyB:nom': 'a B-kulcs',
  'keyName.keyB:acc': 'a B-kulcsot',
  'keyName.keyB:dat': 'a B-kulcsnak',
  'keyName.keyB:ins': 'a B-kulccsal',
  'keyName.keyB:ine': 'a B-kulcsban',
  'keyName.keyB:ill': 'a B-kulcsba',
  'keyName.keyB:ela': 'a B-kulcsból',
  'keyName.keyB:sup': 'a B-kulcson',
  'keyName.keyB:sub': 'a B-kulcsra',
  'keyName.keyB:del': 'a B-kulcsról',
  'keyName.keyB:ade': 'a B-kulcsnál',
  'keyName.keyB:all': 'a B-kulcshoz',
  'keyName.keyB:abl': 'a B-kulcstól',
  'keyName.keyB:tra': 'a B-kulccsá',
  'keyName.keyB:ter': 'a B-kulcsig',
  'keyName.keyB:ess': 'a B-kulcsként',
  'keyName.keyB:cau': 'a B-kulcsért',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'eszközkulcs',
  'keyName.perDevice:nom': 'az eszközkulcs',
  'keyName.perDevice:acc': 'az eszközkulcsot',
  'keyName.perDevice:dat': 'az eszközkulcsnak',
  'keyName.perDevice:ins': 'az eszközkulccsal',
  'keyName.perDevice:ine': 'az eszközkulcsban',
  'keyName.perDevice:ill': 'az eszközkulcsba',
  'keyName.perDevice:ela': 'az eszközkulcsból',
  'keyName.perDevice:sup': 'az eszközkulcson',
  'keyName.perDevice:sub': 'az eszközkulcsra',
  'keyName.perDevice:del': 'az eszközkulcsról',
  'keyName.perDevice:ade': 'az eszközkulcsnál',
  'keyName.perDevice:all': 'az eszközkulcshoz',
  'keyName.perDevice:abl': 'az eszközkulcstól',
  'keyName.perDevice:tra': 'az eszközkulccsá',
  'keyName.perDevice:ter': 'az eszközkulcsig',
  'keyName.perDevice:ess': 'az eszközkulcsként',
  'keyName.perDevice:cau': 'az eszközkulcsért',
  'keyName.thePerDevice': 'az eszközkulcs',
  'keyName.thePerDevice:nom': 'az eszközkulcs',
  'keyName.thePerDevice:acc': 'az eszközkulcsot',
  'keyName.thePerDevice:dat': 'az eszközkulcsnak',
  'keyName.thePerDevice:ins': 'az eszközkulccsal',
  'keyName.thePerDevice:ine': 'az eszközkulcsban',
  'keyName.thePerDevice:ill': 'az eszközkulcsba',
  'keyName.thePerDevice:ela': 'az eszközkulcsból',
  'keyName.thePerDevice:sup': 'az eszközkulcson',
  'keyName.thePerDevice:sub': 'az eszközkulcsra',
  'keyName.thePerDevice:del': 'az eszközkulcsról',
  'keyName.thePerDevice:ade': 'az eszközkulcsnál',
  'keyName.thePerDevice:all': 'az eszközkulcshoz',
  'keyName.thePerDevice:abl': 'az eszközkulcstól',
  'keyName.thePerDevice:tra': 'az eszközkulccsá',
  'keyName.thePerDevice:ter': 'az eszközkulcsig',
  'keyName.thePerDevice:ess': 'az eszközkulcsként',
  'keyName.thePerDevice:cau': 'az eszközkulcsért',
  'keyName.applicationKeyA': 'az alkalmazás A-kulcsa',
  'keyName.applicationKeyA:nom': 'az alkalmazás A-kulcsa',
  'keyName.applicationKeyA:acc': 'az alkalmazás A-kulcsát',
  'keyName.applicationKeyA:dat': 'az alkalmazás A-kulcsának',
  'keyName.applicationKeyA:ins': 'az alkalmazás A-kulcsával',
  'keyName.applicationKeyA:ine': 'az alkalmazás A-kulcsában',
  'keyName.applicationKeyA:ill': 'az alkalmazás A-kulcsába',
  'keyName.applicationKeyA:ela': 'az alkalmazás A-kulcsából',
  'keyName.applicationKeyA:sup': 'az alkalmazás A-kulcsán',
  'keyName.applicationKeyA:sub': 'az alkalmazás A-kulcsára',
  'keyName.applicationKeyA:del': 'az alkalmazás A-kulcsáról',
  'keyName.applicationKeyA:ade': 'az alkalmazás A-kulcsánál',
  'keyName.applicationKeyA:all': 'az alkalmazás A-kulcsához',
  'keyName.applicationKeyA:abl': 'az alkalmazás A-kulcsától',
  'keyName.applicationKeyA:tra': 'az alkalmazás A-kulcsává',
  'keyName.applicationKeyA:ter': 'az alkalmazás A-kulcsáig',
  'keyName.applicationKeyA:ess': 'az alkalmazás A-kulcsaként',
  'keyName.applicationKeyA:cau': 'az alkalmazás A-kulcsáért',
  'keyName.applicationKeyB': 'az alkalmazás B-kulcsa',
  'keyName.applicationKeyB:nom': 'az alkalmazás B-kulcsa',
  'keyName.applicationKeyB:acc': 'az alkalmazás B-kulcsát',
  'keyName.applicationKeyB:dat': 'az alkalmazás B-kulcsának',
  'keyName.applicationKeyB:ins': 'az alkalmazás B-kulcsával',
  'keyName.applicationKeyB:ine': 'az alkalmazás B-kulcsában',
  'keyName.applicationKeyB:ill': 'az alkalmazás B-kulcsába',
  'keyName.applicationKeyB:ela': 'az alkalmazás B-kulcsából',
  'keyName.applicationKeyB:sup': 'az alkalmazás B-kulcsán',
  'keyName.applicationKeyB:sub': 'az alkalmazás B-kulcsára',
  'keyName.applicationKeyB:del': 'az alkalmazás B-kulcsáról',
  'keyName.applicationKeyB:ade': 'az alkalmazás B-kulcsánál',
  'keyName.applicationKeyB:all': 'az alkalmazás B-kulcsához',
  'keyName.applicationKeyB:abl': 'az alkalmazás B-kulcsától',
  'keyName.applicationKeyB:tra': 'az alkalmazás B-kulcsává',
  'keyName.applicationKeyB:ter': 'az alkalmazás B-kulcsáig',
  'keyName.applicationKeyB:ess': 'az alkalmazás B-kulcsaként',
  'keyName.applicationKeyB:cau': 'az alkalmazás B-kulcsáért',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': '1. kulcsblokk',
  'keyName.block1:nom': 'az 1. kulcsblokk',
  'keyName.block1:acc': 'az 1. kulcsblokkot',
  'keyName.block1:dat': 'az 1. kulcsblokknak',
  'keyName.block1:ins': 'az 1. kulcsblokkal',
  'keyName.block1:ine': 'az 1. kulcsblokkban',
  'keyName.block1:ill': 'az 1. kulcsblokkba',
  'keyName.block1:ela': 'az 1. kulcsblokkból',
  'keyName.block1:sup': 'az 1. kulcsblokkon',
  'keyName.block1:sub': 'az 1. kulcsblokkra',
  'keyName.block1:del': 'az 1. kulcsblokkról',
  'keyName.block1:ade': 'az 1. kulcsblokknál',
  'keyName.block1:all': 'az 1. kulcsblokkhoz',
  'keyName.block1:abl': 'az 1. kulcsblokktól',
  'keyName.block1:tra': 'az 1. kulcsblokká',
  'keyName.block1:ter': 'az 1. kulcsblokkig',
  'keyName.block1:ess': 'az 1. kulcsblokkként',
  'keyName.block1:cau': 'az 1. kulcsblokkért',
  'keyName.theDeviceKey': 'az eszköz saját kulcsa',
  'keyName.theDeviceKey:nom': 'az eszköz saját kulcsa',
  'keyName.theDeviceKey:acc': 'az eszköz saját kulcsát',
  'keyName.theDeviceKey:dat': 'az eszköz saját kulcsának',
  'keyName.theDeviceKey:ins': 'az eszköz saját kulcsával',
  'keyName.theDeviceKey:ine': 'az eszköz saját kulcsában',
  'keyName.theDeviceKey:ill': 'az eszköz saját kulcsába',
  'keyName.theDeviceKey:ela': 'az eszköz saját kulcsából',
  'keyName.theDeviceKey:sup': 'az eszköz saját kulcsán',
  'keyName.theDeviceKey:sub': 'az eszköz saját kulcsára',
  'keyName.theDeviceKey:del': 'az eszköz saját kulcsáról',
  'keyName.theDeviceKey:ade': 'az eszköz saját kulcsánál',
  'keyName.theDeviceKey:all': 'az eszköz saját kulcsához',
  'keyName.theDeviceKey:abl': 'az eszköz saját kulcsától',
  'keyName.theDeviceKey:tra': 'az eszköz saját kulcsává',
  'keyName.theDeviceKey:ter': 'az eszköz saját kulcsáig',
  'keyName.theDeviceKey:ess': 'az eszköz saját kulcsaként',
  'keyName.theDeviceKey:cau': 'az eszköz saját kulcsáért',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'ismeretlen kulcs',
  'keyName.unknown:nom': 'egy ismeretlen kulcs',
  'keyName.unknown:acc': 'egy ismeretlen kulcsot',
  'keyName.unknown:dat': 'egy ismeretlen kulcsnak',
  'keyName.unknown:ins': 'egy ismeretlen kulccsal',
  'keyName.unknown:ine': 'egy ismeretlen kulcsban',
  'keyName.unknown:ill': 'egy ismeretlen kulcsba',
  'keyName.unknown:ela': 'egy ismeretlen kulcsból',
  'keyName.unknown:sup': 'egy ismeretlen kulcson',
  'keyName.unknown:sub': 'egy ismeretlen kulcsra',
  'keyName.unknown:del': 'egy ismeretlen kulcsról',
  'keyName.unknown:ade': 'egy ismeretlen kulcsnál',
  'keyName.unknown:all': 'egy ismeretlen kulcshoz',
  'keyName.unknown:abl': 'egy ismeretlen kulcstól',
  'keyName.unknown:tra': 'egy ismeretlen kulccsá',
  'keyName.unknown:ter': 'egy ismeretlen kulcsig',
  'keyName.unknown:ess': 'egy ismeretlen kulcsként',
  'keyName.unknown:cau': 'egy ismeretlen kulcsért',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'a 2014-es titkosítatlan lánc: minden slot titkosítatlanul van tárolva, így nincs származtatott feltöltési kulcs; a feltöltés maga a lemezkép, ahogy van',
  'keys.evidence.ffVendor':
    'az 1.3.0.8 FF (16 Hz-es) változat: az ebben az olvasásban megnyitott slotok egyike sincs titkosítatlanul tárolva, így nem látszik, hogy a kamera a 2014-es titkosítatlan láncon van; az FF lemezkép a gyártói formájában íródik, a nyers bájtok úgy kerülnek elküldésre, ahogy megadták, titkosítatlan 8 Hz-es lemezkép pedig nem íródik',
  'keys.evidence.ffUntested':
    'az FF lemezkép írása UNTESTED figyelmeztetéssel érhető el: a gyűjteményben nincs eredeti bootloader ehhez a változathoz, így nincs lemérve, hogy az írt slot elindul-e',
  'keys.evidence.line2016':
    'a 2016-os Compact PRO sorozat: a feltöltés a lemezkép XOR a saját 0. kulcsblokkjának kulcsfolyama (a lemezképben érték alapján megtalálva), így nem ennek a kamerának valamelyik kulcsa állítja elő',
  'keys.evidence.checkKeyUnnamed':
    'a kamera ezzel a kulccsal fejti vissza a feltöltést, és azzal a kulccsal titkosítja újra, amellyel a bootloader a slotokat ellenőrzi; ez a kulcs ebben az olvasásban nincs megnevezve, és az írásnak nincs is rá szüksége: a slotot ahhoz a lemezképhez méri, amelyre visszafejthető',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'a kamera ezzel a kulccsal fejti vissza a feltöltést, és azzal a kulccsal titkosítja újra, amellyel a bootloader a slotokat ellenőrzi; ez a kulcs ebben az olvasásban nincs megnevezve ({why}), és az írásnak nincs is rá szüksége: a slotot ahhoz a lemezképhez méri, amelyre visszafejthető',
  'keys.evidence.checkKeyNamed':
    'a kamera ezzel a kulccsal fejti vissza a feltöltést, és újra titkosítja {key:ins} ({hex}), azzal a kulccsal, amellyel a bootloader a slotokat ellenőrzi, így minden általa írt slot úgy tárolódik, ahogy a bootloader elfogadja',
  'keys.evidence.checkKeyInferred':
    'a kamera ezzel a kulccsal fejti vissza a feltöltést, és újra titkosítja {key:ins} ({hex}), azzal a kulccsal, amellyel a bootloader a slotokat ellenőrzi ({bank:ela} kikövetkeztetve, amelyről a kamera jelentése szerint indult, és amelyet a bootloader ellenőrzés nélkül indított el), így minden általa írt slot úgy tárolódik, ahogy a bootloader elfogadja',
  'keys.evidence.checkKeyNamedFrom':
    'a kamera ezzel a kulccsal fejti vissza a feltöltést, és újra titkosítja {key:ins} ({hex}), azzal a kulccsal, amellyel a bootloader a slotokat ellenőrzi ({bank:nom} alapján megnevezve, amelyről a kamera jelentése szerint indult), így minden általa írt slot úgy tárolódik, ahogy a bootloader elfogadja',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'az indító slot nem nevezhető meg, így nem olvasható ki belőle a kulcs, amellyel a slot tárolva van',
  'keys.refused.notDerived': 'a kulcsok nem származtathatók',
  'keys.refused.notDecrypted':
    '{bank:nom}, amelyről a kamera indult, nem fejthető vissza lemezképpé, így nem olvasható ki a kulcs, amellyel tárolva van',
  'keys.refused.noBootKey':
    '{bank:nom}, amelyről a kamera indult, egyik olyan kulccsal sem fejthető vissza, amelyet a bootloader kipróbál (az A-kulcsával vagy a tárolási kulcsával), így nem olvasható ki belőle a kulcs, amellyel a slot tárolva van',
  'keys.refused.keyNotInTable':
    '{bank:nom}, amelyről a kamera indult, {key:ins} fejthető vissza, de ennek a kamerának a kulcstáblája nem tartalmazza ezt a kulcsot, így nem írható vele',
  'keys.refused.noApplicationPair':
    'a futó alkalmazás ({bank}, firmware: {firmware}) egyik ismert kulcspárt sem tartalmazza (a bootloaderét és a dekódolt alkalmazáspárokat) úgy, hogy mindkét fele pontosan egyszer szerepeljen, így az A-kulcsa nem található meg a lemezképében',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'a futó alkalmazás ({bank}, firmware: {firmware}) egyik ismert kulcspárt sem tartalmazza (a bootloaderét és a dekódolt alkalmazáspárokat) úgy, hogy mindkét fele pontosan egyszer szerepeljen, így az A-kulcsa nem található meg a lemezképében (a bootloader A-kulcsa {count} alkalommal fordul elő, a B-kulcsa {keyB} alkalommal)',
    other:
      'a futó alkalmazás ({bank}, firmware: {firmware}) egyik ismert kulcspárt sem tartalmazza (a bootloaderét és a dekódolt alkalmazáspárokat) úgy, hogy mindkét fele pontosan egyszer szerepeljen, így az A-kulcsa nem található meg a lemezképében (a bootloader A-kulcsa {count} alkalommal fordul elő, a B-kulcsa {keyB} alkalommal)',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'a futó alkalmazás ({bank}, firmware: {firmware}) a beprogramozás előtt a saját kulcsaival ellenőrzi a feltöltést (ennek a változatnak a dekódolt forráskódja az A-kulcsával és a tárolási kulcsával próbálja a feltöltést, ahogy a bootloadere egy slotot), az a kulcs pedig, amellyel az írások tárolnak – {key} ({hex}) –, sem az A-kulcsa, sem a tárolási kulcsa, így a kamera bármilyen törlés előtt 0x50000 kóddal elutasítaná a feltöltést',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'egyik slot sem fejthető vissza a család elfogadási összegére ({family}: {sum})',
  'writeRefusal.keyTable': 'ennek a kamerának a kulcstáblája nem igazolható',
  'writeRefusal.whitening':
    'ennek a kamerának a kulcstáblája K={k} mellett oldható fel, de ez a család ({family}) K={expected} mellett titkosít',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily': 'a jelek szerint ez a kamera {detected}, nem {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'ez a kamera innen nem írható: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'A Seek 2018-as és későbbi változatai (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 és Nano 300. Egy kiolvasás a flash memória 64 blokkjából 63-at olvas ki, anélkül hogy bármit feloldana; ezeken a változatokon egyetlen olvasás sem éri el a {block} címen lévő blokkot. A firmware titkosítva van tárolva. A slotok egyenként íródnak a „Firmware-slotok kezelése” fülön.',
  'family.summary.early':
    'A 0.8.0.0-nál régebbi 2014-es Compactok: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 és 0.7.0.8. A firmware-jük nem tud válaszolni arra az olvasásra, amelyet egy kiolvasás küld, ezért a „Kiolvasás”, a „Minden szelektor kiolvasása”, az Info fül teljes olvasása és a „Firmware-slotok kezelése” fül a verzió kiolvasása után elutasítja őket; a 0.3.0.1-en az a parancs, amellyel egy kiolvasás kezdődik, ehelyett firmware-frissítést készítene elő. A megőrzési futtatás a 0.7.0.7-et és a 0.7.0.8-at egy másik paranccsal olvassa ki, amelyre ez a két változat válaszol. A más módon készült memóriakép a szokásos módon visszafejthető.',
  'family.summary.compact2016':
    'A Compact PRO 1.0.3.x változatai (1.0.3.0 és 1.0.3.2). Pontosan úgy válaszolnak az olvasásokra, mint a 2014-es Compactok, a feloldó tokennel együtt, ezért a verziójuk és a slotjaik tárolási módja alapján különböztethetők meg: titkosítva, míg a 2014-es slotok titkosítatlanok. Egy 1.0.3.x kamerát kezdettől e család szerint olvas ki. A megőrzési futtatás a teljes flash memóriát kiolvassa, a slotok pedig egyenként íródnak a „Firmware-slotok kezelése” fülön.',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    'A 0.8.0.0 és 1.3.0.8 közötti 2014-es Compactok, köztük a 16 Hz-es 1.3.0.8 FF változat. Egy gyári kamera a flash memóriájának kevesebb mint a felét adja ki, egy részét is csak az eszközkészlet által küldött feloldó tokenre; a megőrzési futtatás a többit egy ideiglenes módosítással olvassa ki. A slotok titkosítatlanul vannak tárolva, kivéve az FF változaton. Egy Compact PRO 1.0.3.x kamerát compact-2016-ként olvas ki, és csak akkor sorolja ide, ha egy slot titkosítatlanul van tárolva, vagy a {sum} összegre fejthető vissza, mint az FF változat slotjai. A slotok a „Firmware-slotok kezelése” fülön azokon a változatokon írhatók, amelyeken a megőrzési futtatást lemérték; minden más 0.x vagy 1.x változat csak olvasható.',
  'family.summary.generic':
    'Olyan kamera, amelyre egyik másik család sem illik. A `seek-fw dump` a 4.x blokklistával olvassa ki (a 4.x/Nano fül elutasítja), a visszafejtés pedig magából a lemezképből fejti meg a kulcsot, így egyik sem függ a találgatástól. Egyetlen slot sem íródik: a „Firmware-slotok kezelése” fül elutasítja, amíg a kamera azonosítva nincs.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'a lemezkép fejléce szerint',
  'detect.source.camera': 'a kamera jelentése szerint',
  'detect.plainArmedNotInForce':
    'egy egyszerű, 2 bájtos BeginFirmwareUpgrade élesített egy védett slotot, így a hitelesített olvasási csatorna nincs érvényben',
  'detect.modern.plainRefused':
    'egy védett slot egyszerű, 2 bájtos BeginFirmwareUpgrade parancsát a kamera ELUTASÍTOTTA, amit ebben a sorozatban egyetlen változat sem tesz – a kezelőjében nincs tokenellenőrzés, és minden sloton elfogadja az egyszerű csatornát',
  'detect.modern.authArmed':
    'egy védett slot a 18 bájtos hitelesített szelektoron élesedett; ott semmi sem próbálta az egyszerűt, így ez nem sorolja ki a kamerát ebből a sorozatból',
  'detect.modern.legacyVersion':
    '{said} a firmware {version}, amely a 0.x / 1.x régi sorozatba tartozik (más számozási sorozat, nem egy régebbi 4.x – és az egyik ilyen változat a {sum} összeget is eléri)',
  'detect.modern.noSum':
    'egyik slot sem fejthető vissza arra az elfogadási összegre ({sum}), amelyet ennek a családnak a bootloadere megkövetel',
  'detect.modern.sum': 'egy slot az elfogadási összegre ({sum}) fejthető vissza',
  'detect.modern.version':
    'a firmware ({version}) abba a 2018 utáni sorozatba tartozik, amelyet ez a szelektortérkép lefed (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'egy egyszerű, 2 bájtos BeginFirmwareUpgrade élesített egy védett slotot, így ez nem a zárolt régi firmware',
  'detect.modern.none': 'semmi sem utal arra, hogy ez a kamera a 2018 utáni sorozatba tartozik',
  'detect.early.noVersion':
    'a kamera nem jelentett firmware-verziót, és lemezképfejlécben sem található',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'a firmware ({version}) legalább {first}, így az RPC-táblájában van getter a GetFeaturedFirmwareData parancshoz, és a szokásos olvasási út érvényes',
  'detect.early.older':
    '{said} a firmware {version}, amely régebbi, mint {first} – az első változat, amelynek RPC-metódustáblájában van olvasáskezelő (getter) a GetFeaturedFirmwareData parancshoz',
  'detect.early.noWindow': 'és egyetlen ablak sem volt olvasható, ahogy ez alapján várható',
  'detect.generic.fallback':
    'tartalék: egyik firmware-család sem illett megbízhatóan, így az olvasások elérhetők maradnak, az írások nem',
  'detect.compact2016.early':
    'a firmware ({version}) régebbi a 0.8.0.0-nál, és nincs olvasáskezelője a GetFeaturedFirmwareData parancshoz – ez early-compact, nem ez a család',
  'detect.compact2016.modernSum':
    'egy slot az elfogadási összegre ({sum}) fejthető vissza, amely nem ennek a generációnak a célértéke',
  'detect.compact2016.plainArmed':
    'egy egyszerű, 2 bájtos BeginFirmwareUpgrade élesített egy védett slotot, így ez a kamera nincs azon a zárolt sorozaton, amelyen ez a család a legacy-auth családdal osztozik',
  'detect.compact2016.notLine': 'a firmware ({version}) nem a 0.x / 1.x sorozatba tartozik',
  'detect.compact2016.storedPlain':
    'egy slot titkosítatlanul van tárolva – a kulcsfolyam-megoldás az identitásállapotot adja, így a tárolt szavai MAGUK a lemezkép –, ez a 2014-es titkosítatlan lánc; ennek a generációnak a slotjai valódi kulccsal, xorshift128-cal vannak titkosítva',
  'detect.compact2016.keyedZero':
    'egy valódi xorshift128 kulcsfolyammal tárolt slot az elfogadási összegre ({sum}) fejthető vissza, ez ennek a generációnak a titkosítása',
  'detect.compact2016.zeroSum':
    'egy slot az elfogadási összegre ({sum}) fejthető vissza, amely ennek a generációnak a célértéke',
  'detect.compact2016.refused':
    'és egy védett slot elutasította az egyszerű, 2 bájtos élesítést, ami a zárolt kezelőre vall',
  'detect.compact2016.proLine':
    '{said} a firmware {version}, a 2016-os Compact PRO 1.0.3.x sorozata',
  'detect.compact2016.compactLine':
    '{said} a firmware {version}, egy Compact változat, nem a Compact PRO 1.0.3.x sorozata',
  'detect.compact2016.lockedLine':
    '{said} a firmware {version}, azon a 0.x / 1.x sorozaton, amelyen ez a generáció a zárolt régi firmware-rel osztozik',
  'detect.compact2016.bootloader2016':
    'a bootloader verziója {version}, 2016-os generációs bootloader (az 1.2.0.0-t a Compact PRO 1.0.3.0 alatt mérték; a 2014-es Compacté 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'a bootloader verziója {version}, a 2014-es generáció számozása, nem ennek a generációnak a számozása',
  'detect.compact2016.none':
    'egyik slotról sem volt megfigyelhető, hogy valódi kulccsal nulla elfogadási összegre fejthető vissza',
  'detect.legacy.proLine':
    'de a firmware ({version}) a 2016-os Compact PRO 1.0.3.x sorozata, amelynek slotjai compact-2016 titkosításúak: ennek a családnak az elfogadási ellenőrzése mindegyiken elbukna',
  'detect.legacy.early':
    'a firmware ({version}) régebbi a 0.8.0.0-nál: az RPC-táblájában nincs olvasáskezelő a GetFeaturedFirmwareData parancshoz (a 0.7.0.7 előtt egyáltalán nincs, a 0.7.0.7-en és a 0.7.0.8-on pedig csak setter van) – ez early-compact, nem ez a család',
  'detect.legacy.keyedZero':
    'egy valódi xorshift128 kulcsfolyammal tárolt slot erre fejthető vissza: {zero} – ez a 2016-os Compact PRO titkosítása (compact-2016). Ez a sorozat a slotjait titkosítatlanul, 0 szóösszeggel (a 2014-es lánc) vagy {sum} értékre kulcsolva (Compact 1.3.0.8) tárolja, és az elfogadási ellenőrzése egy ilyen slotot elutasít',
  'detect.legacy.plainChain':
    'egy slot olyan titkosítatlan firmware-ként van tárolva, amelynek szavai 0-ra összegződnek, ahogy a sorozat 2014-es bootloadere elindítja',
  'detect.legacy.refused':
    'a kamera feloldás nélkül kérve nem nyitott meg frissítésre egy zárolt slotot, ahogy csak a firmware-nek ez a generációja tesz',
  'detect.legacy.unlocked':
    'és feloldással kérve megnyitotta ugyanazt a slotot, így az a feloldás, amelyet ez a család küld, az, amelyet ez a kamera ellenőriz',
  'detect.legacy.notLine':
    '{said} a firmware {version}, amely nem a 0.x / 1.x régi sorozatba tartozik',
  'detect.legacy.authOnly':
    'feloldással kérve megnyitott frissítésre egy zárolt slotot, ahogy a firmware-nek ez a generációja teszi; feloldás nélkül nem próbálta, így ez önmagában nem bizonyítja a generációt',
  'detect.legacy.version':
    'a firmware ({version}) a 0.x / 1.x régi sorozatba tartozik, amely más számozási sorozat, mint a 2018 utáni alkalmazásverziók, nem egy régebbi 4.x',
  'detect.legacy.none': 'semmi megfigyelt nem utal a hitelesített olvasási csatornára',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'egy kamerán végzett futtatás után visszatartva: ott a módosítás nem növelte a közzétételi sebességet, és az írás után a zár minden képkockánál működésbe lépett',
  'fps.table.predates':
    'a firmware ({version}) régebbi a 0.8.0.0-nál: az RPC-táblájában nincs olvasáskezelő a GetFeaturedFirmwareData parancshoz, amelyet a slot kiolvasása küld, így a slotok kiolvasása és írása ennek a változatnak egyetlen slotját sem éri el, és a módosítás nem érhető el',
  'fps.table.stageTwoFf':
    'stage two: a 16 Hz-es FF változat úgy van előkészítve, ahogy a gyártó alkalmazása előkészíti (a lemezkép XOR A-kulcs, a B-kulccsal tárolva), nem titkosítatlan bájtokként, így az előkészítési ellenőrzése nincs elvégezve, és a módosítás még nem érhető el',
  'fps.table.stageTwo':
    'stage two: ez a bejegyzés nincs benne a stage-two készletben, így az előkészítési ellenőrzése nincs elvégezve, és a módosítás még nem érhető el',
  'fps.table.notOffered': 'nem érhető el',
  'fps.table.notImage':
    'ez nem firmware-lemezkép, így nem vonatkozik rá képkockasebesség-módosítás',
  'fps.table.otherBuild':
    'a lemezkép változata {image}, de a kamera ezt jelenti: {camera}; a módosítást elutasítja, ahelyett hogy egy nem egyező változatra alkalmazná',
  'fps.table.otherBuildNoVersion':
    'a lemezkép változata {image}, de a kamera nem jelent verziót; a módosítást elutasítja, ahelyett hogy egy nem egyező változatra alkalmazná',
  'fps.table.patched':
    'a képkockasebesség-módosítás már alkalmazva van: ez a lemezkép {hz} Hz-en fut',
  'fps.table.earlierPatch':
    'ez a lemezkép egy korábbi, USB-javítás nélküli {hz} Hz-es képkockasebesség-módosítást tartalmaz, és módosított lemezképre sosem kerül újabb módosítás: állítsa vissza a gyári lemezképet, majd módosítsa azt',
  'fps.table.atRate': 'ez a változat módosítás nélkül is {hz} Hz-en fut',
  'fps.table.not4821':
    'ez a lemezkép a Compact 4.8.2.1 változatot jelenti (vagy a Compact XR 4.8.2.1-et, ugyanazt a változatot), de nem az a gyári lemezkép, amelyhez a képkockasebesség-módosítás készült (f96ac57eda75: 68 bájtos parancsoldalak, 13. állandó oldal), így nem készül hozzá képkockasebesség-módosítás',
  'fps.table.notInTable':
    'ez a lemezkép nincs benne a képkockasebesség-módosítási táblában, így ehhez a változathoz nem készül képkockasebesség-módosítás. A tábla a Compact 0.7.0.8–1.3.0.8 (8 Hz; a 0.7.0.8-at a slotkód elutasítja), 1.3.0.8 (16 Hz FF), 4.8.1.7, 4.8.1.9, 4.8.2.1 és 4.16.1.7 FF változatokat, valamint a Compact PRO 1.0.3.x és 4.9.x változatokat nevezi meg; más változatnak nincs bejegyzése',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'ennek a változatnak a tervében nem szerepel {bank:nom}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank:nom} ezen a változaton nem fogad visszafejtett lemezképet: {reason}',
  'fps.plan.empty': '{bank:ine} nincs módosítható visszafejtett lemezkép (üres)',
  'fps.plan.noImage':
    '{bank:ine} nincs módosítható visszafejtett lemezkép (nem lett kiolvasva, vagy egyik kulcs sem nyitja meg)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    'Az írás {name:ill} megtörtént, de a visszaolvasott adat nem csak a tervezett módon tér el az elmentett slottól, ezért az utána következő slotok nem íródtak.',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build (slots/capability-notes) ----
   * The page shows only this one; it leaves the others out (lib/page-hidden.ts), and the CLI prints them
   * in English. */
  'notes.unverified':
    'Csak olvasható. A slotok elrendezése a zárolt sorozat dekódolt táblája, de ehhez a változathoz még nem mértek előkészítési formát, így nincs tervezett írás.',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'a kamera nem jelentette a firmware-verzióját ({note}); egy parancsszám nem jelenti ugyanazt minden Seek firmware-en – a Compact 0.3.0.1-en a 0x52 wire id, amely egy olvasási ablakot élesít, az EnterBootloaderMode –, így amíg a verzió nem ismert, a GetErrorCode, a GetOperationMode és a GetFirmwareInfo kivételével semmi sem kerül elküldésre: ezekre az olvasásokra minden változat ugyanúgy válaszol',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'a GetFirmwareInfo nem válaszolt ({error}) {reads} olvasás egyikére sem, {spacing} ms-os közökkel, {window} ms-os indulási ablakban; egy még induló kamera ezen belül válaszol',
  'identity.note.neverTwice':
    'a GetFirmwareInfo {reads} olvasás alatt egyszer sem válaszolt kétszer egymás után',
  'identity.note.noAnswer': 'a GetFirmwareInfo nem válaszolt ({error})',
  'identity.note.noAnswerSome':
    'a GetFirmwareInfo nem válaszolt ({error}); {reads} olvasásból {answered} kapott választ, de sosem kettő egymás után, így egyikük sem különböztethető meg egy olyan rekordtól, amelyet egy korábbi parancs hagyott kiválasztva',
  'identity.note.tooShort': {
    one: 'a GetFirmwareInfo {count} bájtot adott vissza, ez kevés egy verzióhoz',
    other: 'a GetFirmwareInfo {count} bájtot adott vissza, ez kevés egy verzióhoz',
  },
  'identity.note.tooShortContext': {
    one: 'a GetFirmwareInfo {count} bájtot adott vissza, ez kevés egy verzióhoz; {context}',
    other: 'a GetFirmwareInfo {count} bájtot adott vissza, ez kevés egy verzióhoz; {context}',
  },
  'identity.note.otherRecord':
    'az első olvasás egy másik rekordot adott vissza ({version}), amelyen egy korábbi parancs hagyta a firmware-info szelektort – ez az olvasás törölte',
  'identity.note.afterStartup': {
    one: 'indulás közben {count} olvasást elutasított, aztán válaszolt',
    other: 'indulás közben {count} olvasást elutasított, aztán válaszolt',
  },
  'identity.predates':
    'a firmware ({version}) régebbi a kiolvasási protokollnál: az RPC-metódustáblájában nincs olvasáskezelő a GetFeaturedFirmwareData parancshoz (a 0.7.0.7-en és a 0.7.0.8-on csak setterként van regisztrálva, előtte pedig a 0x4F wire id az UploadFirmwareRowSize), így vele egyetlen ablak sem olvasható; a 0.3.0.1-en a 0x52 wire id az EnterBootloaderMode, nem a BeginFirmwareUpgrade. A megőrzési futtatás a 0.7.0.7-et és a 0.7.0.8-at ehelyett a 0x58 wire id-vel (GetFeaturedData) olvassa ki',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'a művelet elutasítva ({operation}): {reason}',
  'identity.refusingNoVersion':
    'a művelet elutasítva ({operation}): {reason}. Semmi sem lett élesítve. Húzza ki a kamerát, dugja vissza, várja meg, amíg teljesen elindul, és próbálja újra.',
  'identity.operation.dump': 'kiolvasás',
  'identity.operation.dumpAll': 'minden szelektor kiolvasása',
  'identity.operation.readInfo': 'az eszközadatok kiolvasása',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'a slotokat a biztonsági mentés után kell kiválasztani, mert az olvassa ki őket – előbb futtassa a mentést',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'a slotok nem változtathatók, miután a véglegesítés lefutott vagy megkísérelték: ez a futtatás a következőket írja: {banks}, és a visszaállítás pontosan ezeket teszi vissza',
  'preserve.banks.none': 'egyik slotot sem',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Kiírva.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Kiolvasva. {count}/{of} slot olvasható.',
  'status.readRefused': 'Kiolvasva, de a kamera egyetlen slotja sem írható innen – lásd a naplót.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Firmware-verzió',
  'compare.field.imageId': 'Lemezkép-azonosító',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'Kezdeti SP',
  'compare.field.resetVector': 'Resetvektor',
  'compare.field.size': 'Méret',
  'compare.field.shaExpected': 'A várt titkosítatlan lemezkép SHA-256 értéke',
  'compare.field.sha': 'A lemezkép SHA-256 értéke',
  'compare.field.shaNotStored':
    'A várt titkosítatlan lemezkép SHA-256 értéke (a tárolt bájtok nincsenek megjósolva)',
  'compare.field.key': 'Kulcs',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(nincs lemezkép)',
  'compare.notImage': '(nem lemezkép)',
  'compare.notPredicted': '(nincs megjósolva: az eszköz dönti el, mit tárol)',
  'compare.plaintext': 'nincs (titkosítatlan)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'kétszer egymás után nem volt ugyanúgy kiolvasható',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (a kulcs, amellyel a bootloader a slotokat ellenőrzi, {bank:ela} van kikövetkeztetve, amelyet ellenőrzés nélkül indított el) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered': '{bank}, ahogy a kamera rögzíti (az aktív slot szava: {word})',
  'preserve.lastStart.notRead': 'nem ismert – az aktív slot szava nem volt kiolvasható',
  'preserve.lastStart.noBank':
    'nem ismert – az aktív slot szava {word}, amely egyik slotot sem nevezi meg',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} – {why}',
  'preserve.nextStart.unknown': 'nem ismert – {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'nem íródik – {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'egy lemezkép',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} – írható',
  'preserve.bank.writablePatch': '{build} – írható; a módosítás {count} bájtot változtat meg',
  'preserve.bank.writableEdit': '{build} – írható; tartalmazza: {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} – írható; a módosítás {count} bájtot változtat meg; tartalmazza: {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead':
    'a biztonsági mentés még nem olvasta ki a slotokat, így egyik slot sem választható',
  'preserve.choice.every': 'minden slot, amelyben lemezkép van: {banks}',
  'preserve.choice.everyBlocked':
    'nem minden lemezképet tartalmazó slot írható: {bank:nom} nem írható – {reason}',
  'preserve.choice.noImage': 'egyik slotban sincs olyan lemezkép, amelyet a futtatás írni tud',
  'preserve.choice.nextStart': '{bank}, a következő indításkor ez indul: {why}',
  'preserve.choice.nextStartRefused':
    'a következő indításkor {bank:nom} indul ({why}), de a futtatás nem tudja írni: {reason}',
  'preserve.choice.everyUnknownStart':
    'minden slot, amelyben lemezkép van ({banks}): nem ismert, melyik slot indul a következő indításkor ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'nem ismert, melyik slot indul a következő indításkor ({why}), és {reason}; válasszon slotot név szerint',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank}: nem írható – {reason}',
  'preserve.choice.byName': '{banks}, név szerint választva',
  'preserve.choice.warnNotPatched':
    'A következő indításkor {bank:nom} indul ({why}), és ez a választás nem módosítja: az újraindítás után a kamera annak a slotnak a saját lemezképét futtatja, így a teljes flash kiolvasása leáll, mielőtt bármit kiolvasna. A visszaállítás ettől még minden írt slotot visszatesz.',
  'preserve.choice.warnUnknownStart':
    'Nem ismert, melyik slot indul a következő indításkor ({why}). Ha olyan slot indul, amelyet ez a választás nem módosít, a teljes flash kiolvasása leáll, mielőtt bármit kiolvasna.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'még nem ismert',
  'preserve.build.firmware': '{version} firmware',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'ahogy a kamera tárolja (ez a kamera titkosítatlanul tárolja a firmware-ét)',
  'preserve.stagedForm.oneKey':
    'abban a formában, ahogy a kamera tárolja (a kamera kulcsával titkosítva)',
  'preserve.stagedForm.twoKeys':
    'abban a formában, ahogy a kamera tárolja (a kamera két kulcsával titkosítva)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'minden írt slot pontosan azokat a bájtokat kapja vissza, amelyeket a biztonsági mentés kiolvasott belőle',
  'preserve.restoreForm.factoryStaged':
    'minden írt slot visszakapja az eredeti firmware-ét abban a formában, ahogy a kamera tárolja, így a slot végül bájtra olyan lesz, amilyennek a biztonsági mentés kiolvasta',
  'preserve.restoreForm.none':
    'ezen a változaton nem lehetséges: az eredeti firmware-nek egyik formája sem megy át a kamera saját ellenőrzésén úgy, hogy közben az eredeti bájtokként tárolódjon vissza, így a futtatás a teljes memóriaképpel és a helyén maradó módosítással ér véget',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'ezen a változaton nem lehetséges: a módosított firmware nem tudja kiolvasni a teljes flash memóriát, így a futtatás nem tud teljes memóriaképet adni',
  'preserve.drain.rotated': 'a kamera elforgatva adja ki, és a futtatás visszarendezi',
  'preserve.drain.hazard':
    'a módosítás elkerül egy olyan olvasást, amely ezen a változaton összeomlasztja a kamerát',
  'preserve.drain.whole':
    'a teljes 4 MB-os flash memória egyetlen olvasásban, egyszerre {size} bájt',
  'preserve.drain.wholeNotes':
    'a teljes 4 MB-os flash memória egyetlen olvasásban, egyszerre {size} bájt; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'a kamera olvasási parancsa a teljes 4 MB-os flash memóriát eléri, nem csak az első 64 KB-ot',
  'preserve.site.countPast':
    'az olvasási pozíció 64 KB fölé is számolhat, így az olvasás nem fordul vissza az elejére',
  'preserve.site.keepPosition':
    'megtartja a teljes olvasási pozíciót, amikor minden olvasás után továbblép',
  'preserve.site.savePosition': 'a továbbléptetett olvasási pozíciót teljes egészében elmenti',
  'preserve.site.clearPosition':
    'minden olvasás indulásakor törli a teljes olvasási pozíciót, így a kamera a teljes flash kiolvasása után is olvasható marad',
  'preserve.site.modeTwoGuard':
    'a teljes flash kiolvasása bármely más olvasáshoz hasonlóan indulhat (a gyári firmware elutasítja)',
  'preserve.site.modeTwoIndirection':
    'a teljes flash kiolvasását a flash memória elejére irányítja (a gyári firmware egy olyan értékre irányítja, amely összeomlasztja a kamerát)',
  'preserve.site.armTail':
    'eltávolít egy hívást, amely ezen a változaton lefagyasztja a kamerát, amikor egy olvasás indul',
  'preserve.site.other':
    'megváltoztat egy utasítást, amelyre a teljes flash kiolvasásának szüksége van',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Biztonsági mentés',
  'preserve.step.patch': 'Módosítás',
  'preserve.step.commit': 'Írás',
  'preserve.step.drain': 'Teljes flash kiolvasása',
  'preserve.step.restore': 'Visszaállítás',
  'preserve.step.verify': 'Ellenőrzés',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'a „Módosítás” lépés',
  'preserve.stepId.commit': 'az „Írás” lépés',
  'preserve.stepId.drain': 'a „Teljes flash kiolvasása” lépés',
  'preserve.stepId.restore': 'a „Visszaállítás” lépés',
  'preserve.stepId.verify': 'az „Ellenőrzés” lépés',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: a tervek szerint leállt – a kamera {bank:ela} indult, amelyet ez a futtatás nem módosított, így semmi sem lett kiolvasva.',
  'preserve.result.noReason': 'nincs rögzített ok',
  'preserve.result.stopped': '{label}: leállt – {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none':
    'egyik slotban sincs olyan firmware, amelyet a futtatás módosítani tud',
  'preserve.result.writable.one':
    '{banks:ine} olyan firmware van, amelyet a futtatás módosítani tud',
  'preserve.result.writable.many':
    '{banks:ine} olyan firmware van, amelyet a futtatás módosítani tud',
  'preserve.result.backup':
    '{label}: minden blokk elmentve, amelyet egy szokásos olvasás elér; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'egy nem ismert slot',
  'preserve.result.backupNext':
    '{label}: minden blokk elmentve, amelyet egy szokásos olvasás elér; {writable}; a következő indítás slotja: {next}.',
  'preserve.result.patch': '{label}: elkészült {banks:all}.',
  /** The patch step when every bank was refused: nothing to build for. */
  'preserve.result.patchNone':
    '{label}: nem készült módosítás: egyik slotban sincs olyan firmware, amelyet a futtatás módosítani tud.',
  'preserve.result.patchCount':
    '{label}: elkészült {banks:all}; mindegyikben {count} bájt változik.',
  'preserve.result.commitOne': '{label}: a módosítás beíródott {banks:ill}, és a kamera elfogadta.',
  'preserve.result.commitMany':
    '{label}: a módosítás beíródott {banks:ill}, és a kamera mindegyiket elfogadta.',
  'preserve.result.drainNotRead': '{label}: nincs kiolvasva.',
  'preserve.result.drain':
    '{label}: a teljes 4 MB-os flash memória kiolvasva; a teljes memóriakép sha256 értéke {sha256}.',
  'preserve.result.drainThrough':
    '{label}: a teljes 4 MB-os flash memória kiolvasva {bank:nom} révén; a teljes memóriakép sha256 értéke {sha256}.',
  'preserve.result.restore': '{label}: {banks:nom} visszaírva.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}: {banks:nom} visszaírva, {form}.',
  'preserve.result.verifyDone': '{label}: kész.',
  'preserve.result.verifyIdentical':
    '{label}: {blocks} blokk újraolvasva, 0 bájt eltérés – a kamera flash memóriája bájtra azonos a biztonsági mentéssel.',
  'preserve.result.verifyDiffers': '{label}: {blocks} blokk újraolvasva, {bytes} bájt eltér.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: {blocks} blokk újraolvasva, {bytes} bájt eltér, {count} blokk nem volt olvasható.',
    other:
      '{label}: {blocks} blokk újraolvasva, {bytes} bájt eltér, {count} blokk nem volt olvasható.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Leállt a teljes flash kiolvasása előtt: a kamera olyan slotról indult, amelyet ez a futtatás nem módosított, így semmi sem lett kiolvasva.',
  'preserve.unpatchedStart.next':
    'Következő lépés: a visszaállítás minden írt slotot visszatesz. A teljes flash kiolvasását nem próbálja újra: a kamera ugyanarról a slotról indulna.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Kész – a firmware megőrizve',
  'preserve.done.detail':
    'A teljes memóriakép a kamera teljes eredeti flash memóriája, maga a kamera pedig pontosan olyan, mint előtte.',
  'preserve.done.titleNoImage': 'Kész – a kamera olyan, mint előtte; teljes memóriakép nincs',
  'preserve.done.detailNoImage':
    'A teljes flash kiolvasása nem futott le, így ennek a futtatásnak nincs teljes memóriaképe a flash memóriáról. Minden írt slot vissza lett téve, és azoknak a blokkoknak a friss kiolvasása, amelyeket egy szokásos kiolvasás elér, egyezik a biztonsági mentéssel. A teljes memóriaképhez indítson új futtatást olyan választással, amely tartalmazza a következő indításkor induló slotot.',
  'preserve.done.detailNoImageCount':
    'A teljes flash kiolvasása nem futott le, így ennek a futtatásnak nincs teljes memóriaképe a flash memóriáról. Minden írt slot vissza lett téve, és a szokásos kiolvasás által elért blokkok ({blocks} darab) friss kiolvasása egyezik a biztonsági mentéssel. A teljes memóriaképhez indítson új futtatást olyan választással, amely tartalmazza a következő indításkor induló slotot.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'a kamera ablakolvasójának indításonként korlátozott a kerete, és ezek az olvasások egy kimerült olvasótól jöttek – kapcsolja ki és be a kamerát (húzza ki és dugja vissza, vagy használja a főkapcsolóját), majd futtassa újra: `preserve --resume <run-directory>`. Aláírás: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'a kamera ablakolvasójának indításonként korlátozott a kerete, és ezek az olvasások egy kimerült olvasótól jöttek – kapcsolja ki és be a kamerát (húzza ki és dugja vissza, vagy használja a főkapcsolóját), majd futtassa újra: `preserve --resume <run-directory>`. Aláírás: {signature} – ezekből a bájtokból nem származtatható gyári titkosítatlan tartalom. Minden olvasási módot kipróbált:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'a biztonsági mentés nem tartalmazza {bank:acc} ({address}) – a gyári ablakok nem tudják kiszolgálni',
  'preserve.fail.readsDisagree':
    '{bank:nom} két kiolvasása eltér (sha256 {sha256} kontra {other}) – az a kamera, amely kétszer egymás után sem tudja ugyanúgy kiszolgálni a futó slotját, nem írandó; a rögzítés a visszaállítás forrása és a módosítás származtatásának bemenete',
  'preserve.fail.notFactory':
    '{bank:ine} nem a gyári lemezkép van úgy, ahogy ennek a változatnak a titkosítása tárolja (a várt lemezkép-előtag nem egyezik a rögzítéssel) – elutasítva, mielőtt bármi rögzítésre, pláne írásra kerülne',
  'preserve.fail.ffSum':
    'a módosított firmware abban a formában, ahogy a kamera tárolja, nem megy át ennek a változatnak a saját ellenőrzésén (az összegének {sum} értékűnek kell lennie) – elutasítva, hogy ne küldjön olyan slotot, amelyet a kamera a törlés után elutasítana',
  'preserve.fail.headChanged':
    '{bank:nom} eleje megváltozott a biztonsági mentés óta (sem az eredeti rögzítést, sem a módosított bájtokat nem tartalmazza) – ismeretlen slotállapot felülírása elutasítva; semmi sem íródott. Az eleje hexában: élő {live}, rögzített {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks:ine} már a módosított bájtok vannak – a véglegesítés egy korábbi kísérletben megtörtént, és nem szabad megismételni. Folytassa a teljes flash kiolvasásának lépésénél (--resume), amely a módosított lemezképet indítja, és onnan folytatja.',
  'preserve.fail.landed':
    '{banks:ine} már a módosított bájtok vannak – a véglegesítés egy korábbi kísérletben megtörtént, és nem szabad megismételni. Folytassa a teljes flash kiolvasásának lépésénél (--resume), amely a módosított lemezképet indítja, és onnan folytatja.',
  'preserve.fail.drainRebootRefused':
    'a teljes flash kiolvasásának újraindító parancsát a gazdagép ELUTASÍTOTTA, mielőtt elküldte volna (SecurityError: böngészőszabály vagy tesztvédelem), így a kamera még mindig azt a lemezképet futtatja, amellyel elindult, nem a véglegesített módosítást. A teljes flash kiolvasása csak a módosított lemezkép kiszélesített ablakán át olvas, ezért még bármilyen élesítés előtt leáll; semmi sem lett kiolvasva. Futtassa újra a kiolvasást ott, ahol a gazdagép átengedi az újraindító parancsot.',
  'preserve.fail.shiftedRebootRefused':
    'a teljes flash kiolvasása egy oldallal eltolva tért vissza, és a másik indítást kérő újraindítást a gazdagép ELUTASÍTOTTA, mielőtt elküldte volna (SecurityError: böngészőszabály vagy tesztvédelem) – egy újabb kísérlet ugyanazt az eltolt indítást olvasná ki. Semmi sem lett megtartva; futtassa újra a kiolvasást ott, ahol az újraindítás elküldhető.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'az ellenőrzés {count} eltérő bájtot olvasott {read}/{total} ablakon – a rész újraolvasva nem bájtra azonos a biztonsági mentéssel',
    other:
      'az ellenőrzés {count} eltérő bájtot olvasott {read}/{total} ablakon – a rész újraolvasva nem bájtra azonos a biztonsági mentéssel',
  },
  'preserve.fail.verifyIn': {
    one: 'az ellenőrzés {count} eltérő bájtot olvasott {read}/{total} ablakon (itt: {places}) – a rész újraolvasva nem bájtra azonos a biztonsági mentéssel',
    other:
      'az ellenőrzés {count} eltérő bájtot olvasott {read}/{total} ablakon (itt: {places}) – a rész újraolvasva nem bájtra azonos a biztonsági mentéssel',
  },
  'preserve.fail.verifyShort': {
    one: 'az ellenőrzés {count} eltérő bájtot olvasott {read}/{total} ablakon (rövid ablakok: {short}) – a rész újraolvasva nem bájtra azonos a biztonsági mentéssel',
    other:
      'az ellenőrzés {count} eltérő bájtot olvasott {read}/{total} ablakon (rövid ablakok: {short}) – a rész újraolvasva nem bájtra azonos a biztonsági mentéssel',
  },
  'preserve.fail.verifyInShort': {
    one: 'az ellenőrzés {count} eltérő bájtot olvasott {read}/{total} ablakon (itt: {places}) (rövid ablakok: {short}) – a rész újraolvasva nem bájtra azonos a biztonsági mentéssel',
    other:
      'az ellenőrzés {count} eltérő bájtot olvasott {read}/{total} ablakon (itt: {places}) (rövid ablakok: {short}) – a rész újraolvasva nem bájtra azonos a biztonsági mentéssel',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} ({address})',
  'preserve.fail.bootConfigBlock': 'az indítási konfigurációs blokk',
  'preserve.fail.dataBlock': 'egy adatblokk',

  'preserve.refused.secondRead': 'a második kiolvasás nem sikerült ({error})',
  'preserve.refused.readsDisagree': 'a két kiolvasás eltér (sha256 {sha256} kontra {other})',
  'preserve.refused.erased': 'törölve van',
  'preserve.refused.watchdogMark':
    'a +0x200 címen lévő fejlécszava {word}, ez az a jel, amelyet a bootloader egy indítás elején bekövetkező watchdog-újraindítás után ír a slotra; a bootloader ezt a slotot már nem fogadja el, és a futtatásnak nincs itt módosítható lemezképe',
  'preserve.refused.noHeader': 'nincs lemezképfejléc a +0x200 címen',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    '{image} ({id}) van benne, nem az a változat, amelyet a kamera futtat ({camera})',
  'preserve.refused.otherKey':
    'a bootloader ellenőrzése elutasítja: más kulccsal van tárolva, mint amellyel ennek a kamerának a bootloadere a slotokat ellenőrzi, és a kamerán keresztüli írás azzal a kulccsal tárolná, így a visszaállítás nem tudná visszatenni a pontos bájtjait',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'a kamera firmware-e {camera}, a futtatásé {version} – a módosítás egy változat bájtjaiból származik, és nem szabad másikra küldeni',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'a firmware ({version}) nem 0.x vagy 1.x változat, ez a futtatás pedig csak a 2014-es és 2016-os változatokat kezeli. A verzión kívül semmi sem lett kiolvasva. Ehelyett a „4.x/Nano kiolvasása és visszafejtése” füllel olvassa ki ezt a kamerát: módosítás nélkül olvassa ki a flash memóriát, minden blokkot, kivéve a 0x14060000 címen lévőt, amelyet ezeken a változatokon egyetlen olvasási ablak sem ér el.',
  'preserve.refused.preWidening':
    'a firmware ({version}) régebbi a kiszélesítési módszernél, és a futtatás inkább elutasítja, semhogy felülírjon egy slotot, amelyet nem tud visszaolvasni. Ebben a generációban a kamera a módszerhez szükséges olvasás minden indítási módját elutasítja (a 0.3.0.1-en mérve), az olvasási parancsa nem éri el a flash memória elejét, és az a méret, amelyet a módosítás megváltoztatna, másképp van tárolva. Olyan olvasása sincs, amelyet egy szokásos kiolvasás használhatna. A verzión kívül semmi sem lett kiolvasva.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'ismeretlen lemezképet tartalmaz (sem a gyári {version} firmware-t, sem annak a megőrzési futtatás által ismert módosítását), ezért a megőrzési futtatás nem módosítja és nem teszi vissza',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'ismert képkockasebesség-változatot tartalmaz: a gyári {version} firmware-t {hz} Hz-es képkockasebesség-módosítással. A megőrzési futtatás csak a gyári firmware-t módosítja, módosított lemezképet soha, ezért ezt a slotot nem módosítja és nem teszi vissza',
  'preserve.image.frameRateEarlier':
    'ismert képkockasebesség-változatot tartalmaz: a gyári {version} firmware-t egy korábbi, {hz} Hz-es képkockasebesség-módosítással (még az USB-javítás előttről). A megőrzési futtatás csak a gyári firmware-t módosítja, módosított lemezképet soha, ezért ezt a slotot nem módosítja és nem teszi vissza',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    '{what}. Ha ezt a slotot is bele szeretné venni, előbb írja vissza bele a gyári lemezképet (például egy a módosítás előtt készült teljes flash-mentésből), majd indítson új futtatást',
  'preserve.image.frameRateWords':
    '{what}. Ha ezt a slotot is bele szeretné venni, előbb írja vissza bele a gyári lemezképet (például egy a képkockasebesség-módosítás előtt készült teljes flash-mentésből), majd indítson új futtatást; a képkockasebesség-módosítás utána a gyári lemezképen újra elvégezhető',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name}: {what}. A futtatás ebből a slotból veszi a módosítandó firmware-t, ezért itt leáll, még mielőtt bármi íródna. A kamera megőrzéséhez előbb írja vissza a gyári lemezképet {bank:ill} (például egy a módosítás előtt készült teljes flash-mentésből), majd indítson új futtatást.',
  'preserve.image.frameRateRefusal':
    '{name}: {what}. A futtatás ebből a slotból veszi a módosítandó firmware-t, ezért itt leáll, még mielőtt bármi íródna. A kamera megőrzéséhez előbb írja vissza a gyári lemezképet {bank:ill} (például egy a képkockasebesség-módosítás előtt készült teljes flash-mentésből), majd indítson új futtatást; a képkockasebesség-módosítás utána a gyári lemezképen újra elvégezhető.',
  'preserve.image.otherFirmware':
    '{image} firmware van benne, nem az, amelyet a kamera futtat ({camera})',
  'preserve.image.otherFirmwareRefusal':
    '{name}: {image} firmware van benne, nem az, amelyet a kamera futtat ({camera}), így ennek a futtatásnak nincs ott módosítható lemezképe, és inkább elutasítja, semhogy felülírja.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'nem származtatható belőle olyan lemezkép, amelyet a futtatás módosítani tud ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone': 'ez a futtatás kész – minden lépés befejeződött (futtatás: {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    '{step} már kész ebben a futtatásban (befejezve: {finished}) – a folytatás itt halad tovább: {next}',
  'preserve.gate.stepDoneUnknownTime':
    '{step} már kész ebben a futtatásban (ismeretlen időpontban fejeződött be) – a folytatás itt halad tovább: {next}',
  'preserve.gate.backupRerun':
    'a biztonsági mentés nem futtatható újra: ez a futtatás már befejezte ezeket: {steps}, a következő lépése pedig: {next} – használja a --resume kapcsolót',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'az előző biztonsági mentési kísérlet nem sikerült, és a kamerát KI KELL KAPCSOLNI ÉS BE, mielőtt ez a lépés újra lefut – ugyanabban az indításban egy újrapróbálkozás elavult vagy üres bájtokat olvashat (mérve: egy megismételt mentés a bootloader indulási szavát olvasta ki az indítási konfigurációs rekord helyett). Kapcsolja ki és be a kamerát (húzza ki és dugja vissza, vagy használja a főkapcsolóját), majd futtassa újra a mentést, és amikor kéri, erősítse meg a ki- és bekapcsolást: a futtatás nem látja, hogy megtörtént. A rögzített hiba: {error}',
  'preserve.gate.noErrorText': '(nincs hibaüzenet)',
  'preserve.gate.patchAfterBackup':
    '{step} a biztonsági mentés után fut: a futtatás minden olyan terület memóriaképét, amelyet a gyári terv ki tud olvasni, MÉG MINDEN MÁS ELŐTT elmenti – ez a mentés a kamera egyetlen másolata. Előbb futtassa a „Biztonsági mentés” lépést.',
  'preserve.gate.commitAfterBackup':
    '{step} a biztonsági mentés után fut (lásd a „Módosítás” lépést)',
  'preserve.gate.commitAfterPatch':
    '{step} a „Módosítás” lépés után fut, amely rögzíti, mit készít elő',
  'preserve.gate.commitNeedsPatch':
    '{step} csak akkor futhat, ha elkészült a módosítás {banks:all}, de a „Módosítás” lépés egyet sem rögzített – futtassa újra a „Módosítás” lépést',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step} csak akkor futhat, ha a futtatási könyvtárban megvannak a biztonsági mentés fájljai, de ezek hiányoznak: {files} – nélkülük az írásnak nincs visszaállítási forrása, ezért elutasítja',
  'preserve.gate.drainNoCommit':
    '{step} a MÓDOSÍTOTT részt olvassa a kiszélesített ablakon át, ennek a futtatásnak pedig nincs befejezett írása – a kiolvasás egy gyári kamerán elakadna. Előbb futtassa az írást (vagy folytassa annál), vagy ugorjon kifejezetten tovább (allowJump), ha az írás az ellenőrzőpontja nélkül történt meg.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused':
    'a „Teljes flash kiolvasása” lépés nem fut ezen a változaton ({build}): {note}',
  'preserve.gate.detectedBuild': 'a felismert változat',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'a „Teljes flash kiolvasása” lépés nem fut ezen a változaton ({build}): ha a teljes flash kiolvasása ennek a változatnak a módosítatlan firmware-én indul, a kamera összeomlik (egy olyan értékről olvas, amely nem flash-cím; az emulátoron mérve: 32 KB kiszolgálása után a kamera hibára futott). Az olvasást biztonságossá tevő módosítás helye: {sites}, és nincs azok között a módosítások között, amelyeket ez a futtatás {bank:all} rögzített – a teljes flash kiolvasása előtt futtassa a „Módosítás” lépést (és hajtsa végre az írást).',
  'preserve.gate.drainFiles':
    '{step} csak akkor futhat, ha a futtatási könyvtárban megvan ez: {files} (a kapott memóriaképet minden írt slot rögzítésével utófeldolgozza), de nincs ott',
  'preserve.gate.restoreNoCommit':
    '{step} az eredeti slotokat teszi vissza a módosítás helyére, ennek a futtatásnak pedig nincs befejezett írása – nincs mit visszaállítania. Előbb futtassa az írást (vagy folytassa annál), vagy ugorjon kifejezetten tovább (allowJump), ha egy már módosított kamerát akar visszaállítani.',
  'preserve.gate.restoreNeedsPatch':
    '{step} csak akkor futhat, ha minden írt slothoz megvan a módosítás összefoglalója (az előkészített hosszhoz) – előbb futtassa a „Módosítás” lépést',
  'preserve.gate.restoreNoForm':
    'a „Visszaállítás” lépés nem fut ezen a változaton ({build}): az eredeti firmware-nek egyik formája sem megy át a kamera saját ellenőrzésén úgy, hogy közben az eredeti bájtokként tárolódjon vissza – az eredeti firmware ellenőrzőösszege 0xB7AB9D17 (mérve), nem a kamera által megkövetelt 0xFFFF. Ez a futtatás a teljes memóriaképpel a kézben és a módosítással a helyén ér véget; az eredeti tartalom csak teljes flash-programozóval tehető vissza.',
  'preserve.gate.restoreFiles':
    '{step} csak akkor futhat, ha a futtatási könyvtárban megvan ez: {files} (minden írt slot eredetije a biztonsági mentés lépésből), de nincs ott',
  'preserve.gate.verifyNoRestore':
    '{step} egy friss indítást vet össze a biztonsági mentéssel, ennek a futtatásnak pedig nincs befejezett visszaállítása – egy módosított slot eltérésként jelenne meg. Előbb futtassa a visszaállítást (vagy folytassa annál), vagy ugorjon kifejezetten tovább (allowJump), ha a visszaállítás az ellenőrzőpontja nélkül történt meg.',
  'preserve.gate.verifyNeedsBackup':
    '{step} csak akkor futhat, ha a futtatási könyvtárban megvan ez: {file} (az összevetés referenciája), de nincs ott',
  'preserve.gate.needsBanks':
    '{step} csak akkor futhat, ha megvannak a biztonsági mentés lépés által kiolvasott slotok, de az állapotban egy sincs',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'ehhez a futtatáshoz nincs kiválasztott slot: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank:nom} nem írható: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'ennek a változatnak a módosítása csak a helyreállító R-slotból indul: {note} – a futtatás {bank:acc} írná, ahonnan a bootloader soha nem futtatja',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'a fájl túl kicsi ahhoz, hogy lemezképfejlécet tartalmazzon',
  'slots.image.notWordSized':
    'a lemezkép méretének 4 többszörösének kell lennie (kapott érték: {size} B)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'a lemezkép {size} B; a bootloader minden header.length >= {limit} értéket elutasít, így sosem indulna el',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'nincs lemezképfejléc itt: {at} (magic: {magic}, várt: {expected}) – ennek visszafejtett Seek firmware-lemezképnek kell lennie, nem titkosított slotnak vagy flash-memóriaképnek',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'a kezdeti veremmutató ({address}) nincs az LPC43xx SRAM-jában – ez nem tűnik visszafejtettnek',
  'slots.image.stackUnaligned': 'a kezdeti veremmutató ({address}) nincs szóhatárra igazítva',
  'slots.image.notThumb': 'a resetvektor ({address}) nem Thumb-cím',
  'slots.image.noKeyPair':
    'ennek a fájlnak a neve nem tartalmazza a kulcspárját, és sem ennek a kamerának a kulcspárja, sem egy dekódolt alkalmazáspár nem fordul elő pontosan egyszer a lemezképben, így nem állapítható meg, milyen kulcsokhoz készült a lemezkép. A visszafejtett fájlok neve a bennük lévő kulcsokat tartalmazza.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'a fájlnév szerint az A-kulcs {keyA}, a B-kulcs {keyB}, de {mismatch}. Mindkét kulcsnak pontosan egyszer kell szerepelnie.',
  'slots.image.keyInHeader':
    'ez a lemezkép a {at} címen, a titkosítatlan fejlécablakon belül tárol egy kulcsot – a módosítás elutasítva',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'a fájlnév A- és B-kulcsa átfedő bájtokra mutat itt: {at} és {other} – két különböző, 16 bájtos értéknek kell lenniük',
  'slots.image.retargetLost':
    'az átcélzás után a lemezkép nem pontosan egyszer tartalmazza ennek a kamerának a kulcspárját – elutasítva egy olyan adatcsomag összeállítása, amelynek későbbi frissítéseihez a bootloader nem tudna kulcsot rendelni',
  'slots.image.noStageKey':
    'a lemezkép nem tartalmaz a 2016-os sorozathoz tartozó kulcspárt, így nincs előkészítési kulcs a kódolásához',
  'slots.image.ffSumNoKeys':
    'ennek a lemezképnek a szóösszege a 16 Hz-es FF-re jellemző 0xFFFF, de nem tartalmazza az 1.3.0.8-FF kulcspárt (mindkét felét, egyszer-egyszer), így az előkészített formája nem állítható össze. Semmi sem íródott.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'ez az 1.3.0.8 FF (16 Hz-es) lemezkép, amely a saját A-kulcsos formájában (ff-form.ts) kerül előkészítésre, nem titkosítatlan lemezképként. Semmi sem íródott.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'a terv ehhez a firmware-hez készült: {firmware}, de az elemzés ezt olvassa: {version}. A terv elavult; állítsa össze újra. Semmi sem íródott.',
  'slots.plan.otherFirmwareUnknown':
    'a terv ismeretlen verziójú firmware-hez készült, de az elemzés ezt olvassa: {version}. A terv elavult; állítsa össze újra. Semmi sem íródott.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'a terv ehhez a kamerához készült: {planSerial}, de az elemzés ezt olvassa: {serial}. Az írás itt elutasítva. Semmi sem íródott.',
  'slots.plan.cameraUnknownSerial': 'ismeretlen sorozatszámú kamera',
  'slots.plan.unknownSerial': 'ismeretlen sorozatszám',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, inside the sentence ("slot A"). */
  'slots.plan.otherAddress':
    'a terv célcíme {address}, de ebben a változatban {name:nom} címe {at}',
  'slots.plan.notRead': 'az elemzés már nem olvassa {name:acc}. Semmi sem íródott.',
  'slots.plan.edited':
    'a terv ellenőrzőösszege nem egyezik az adatcsomagjával, tehát a tervet módosították. Semmi sem íródott.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'az adatcsomag {size} B, nagyobb {name:ade}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck': '{risk}. Az írásához acknowledgeRisk: true kell. Semmi sem lett elküldve.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'ez a kamera innen nem fogad titkosítatlanul előkészített lemezképet: {reason}. Semmi sem íródott.',
  'slots.plan.noKeyTable':
    'az elemzés nem nevezi meg ennek a kamerának a bootloader-kulcstábláját, így a lemezkép nem célozható át rá',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'a véglegesítés állapota nem volt kiolvasható a CompleteMemoryUpgrade után, így lehet, hogy {name:nom} csak részben íródott. Mielőtt bármi mást tenne, olvassa ki újra a slotokat, és őrizze meg a memóriaképét.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'a kamera véglegesítéskor elutasította az írást {name:ill} ({status}): {cause}. Semmi sem íródott; a slot változatlan. Mielőtt bármi mást tenne, olvassa ki újra a slotokat.',
  'slots.commit.eraseStage':
    'a CompleteMemoryUpgrade {status} értéket adott vissza ({cause}) {name:nom} esetén: semmi sem lett beprogramozva, de a törlés elkezdődhetett, így a slot részben törölve lehet. Mielőtt bármi mást tenne, olvassa ki újra a slotokat, és őrizze meg a memóriaképét.',
  'slots.commit.partial':
    'a CompleteMemoryUpgrade {status} értéket adott vissza ({cause}) – lehet, hogy {name:nom} csak részben íródott. Mielőtt bármi mást tenne, olvassa ki újra a slotokat, és őrizze meg a memóriaképét.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'a kamera {status} állapotot jelentett {name:nom} előkészítése közben (eltolás: {offset}) – a CompleteMemoryUpgrade előtt megszakítva, így semmi sem íródott a flash memóriába',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum': 'az átviteli ellenőrzőösszeg nem egyezett az előkészített bájtokkal',
  'commit.cause.unsupported':
    'a lemezkép nem volt visszafejthető a kamera kulcsaival, vagy az adattípus elutasítva',
  'commit.cause.acceptance':
    'a lemezképet az elfogadási ellenőrzése elutasította, még mielőtt bármi törlődött volna (az ellenőrzés a változattól függ)',
  'commit.cause.notArmed': 'nem volt élesítve slotfrissítés',
  'commit.cause.eraseFailed': 'a törlési szakasz nem sikerült',
  'commit.cause.programFailed': 'a programozási szakasz nem sikerült',
  'commit.cause.verifyFailed': 'az ellenőrzési szakasz nem sikerült',
  'commit.cause.unknown': 'itt nem ismert állapot',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': 'Önmagára nem másolható {name:nom}. Semmi sem íródott.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Semmi sem íródott.',
  'copy.refused.noPlain': 'Nincs másolható visszafejtett lemezkép {name:ine}. Semmi sem íródott.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file}: ez a ZIP itt nem olvasható ({error}). Semmi sem íródott.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file}: nincs benne teljes flash memória. A ZIP akkor fogadható el, ha egy megőrzési futtatási fájl, amely tartalmazza ezt: {preserve} (miután a teljes kiolvasás lépése lefutott), egy „4.x/Nano kiolvasása és visszafejtése” zip ({dump}) vagy egy „Minden szelektor kiolvasása” zip ({selectors}); ebben a ZIP-ben ez van: {names}. Semmi sem íródott.',
  'restore.refused.noWholeFlashPatched':
    '{file}: nincs benne teljes flash memória. A ZIP akkor fogadható el, ha egy megőrzési futtatási fájl, amely tartalmazza ezt: {preserve} (miután a teljes kiolvasás lépése lefutott), egy „4.x/Nano kiolvasása és visszafejtése” zip ({dump}) vagy egy „Minden szelektor kiolvasása” zip ({selectors}); ebben a ZIP-ben ez van: {names}. A benne lévő {patched} a flash memória a futtatás ideiglenes módosításával, ezért nem fogadható el. Semmi sem íródott.',
  'restore.refused.zipEmpty': 'semmi',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'egy teljes flash-mentés {full} B (4 MB, a teljes chip, amelyet egy J-Link kiolvas); {file} mérete {size} B. Semmi sem íródott.',
  'restore.refused.noBank':
    'ennek a változatnak a tervében nem szerepel {bank:nom}. Semmi sem íródott.',
  'restore.refused.outsideFlash':
    '{name:nom} nincs egy 4 MB-os flash memórián belül. Semmi sem íródott.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    'Nincs kiolvasva {where} abban a memóriaképben, amelyből {file} származik; a manifest.json szerint ez a cím hézag: {address}. Nincs visszaállítható lemezkép. Semmi sem íródott.',
  'restore.refused.gapReason':
    'Nincs kiolvasva {where} abban a memóriaképben, amelyből {file} származik; a manifest.json szerint ez a cím hézag: {address} ({gap}). Nincs visszaállítható lemezkép. Semmi sem íródott.',
  'restore.refused.gapFill':
    'Nincs kiolvasva {where} abban a memóriaképben, amelyből {file} származik; a manifest.json szerint ez a cím hézag: {address}, kitöltés: {fill}. Nincs visszaállítható lemezkép. Semmi sem íródott.',
  'restore.refused.gapReasonFill':
    'Nincs kiolvasva {where} abban a memóriaképben, amelyből {file} származik; a manifest.json szerint ez a cím hézag: {address} ({gap}), kitöltés: {fill}. Nincs visszaállítható lemezkép. Semmi sem íródott.',
  'restore.refused.empty':
    'Üres {where}: minden bájt 0xFF. Egy írás lemezképet programoz be, és nem hagyhat törölve egy slotot, így üres slot írással nem állítható vissza. Semmi sem íródott.',
  'restore.refused.fill':
    'Minden bájt {fill} itt: {where} – ezt a kitöltést írja a memóriakép oda, ahol semmit sem olvasott ki: a memóriakép nem olvasta ki ezt a slotot. Nincs visszaállítható lemezkép. Semmi sem íródott.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    'Ebből a fájlból nem állítható vissza {where}: {why}. Semmi sem íródott.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'ennek a változatnak nincs írási élesítése a slothoz',
  'support.noStagingEmpty':
    'ennek a változatnak nincs előkészítési formája, így üres slotot nem ír',
  'support.buildUnknown': 'a változat ismeretlen',
  'support.unverifiedStaging':
    'ez a változat a zárolt 0.x/1.x sorozatba tartozik, de nem azok közé a változatok közé, amelyeken a megőrzési módosítástáblákat lemérték (0.8.0.0 .. 1.3.0.8 és 1.0.3.0 / 1.0.3.2), így ismeretlen, milyen előkészítési formát fogad a slotja, és semmi sem íródik',
  'support.unknownFamily':
    'a kamera családja nem ismert, így az sem, milyen kulccsal íródnak a slotjai, és a kamera elfogad egy rossz kulccsal írt slotot, aztán nem indul el róla. Olvassa ki és fejtse vissza ezt a kamerát, azonosítsa a memóriakép alapján, majd adja meg a családját a --family kapcsolóval.',
  'support.noReadCommand':
    'a 0.8.0.0-nál régebbi firmware-nek nincs olvasáskezelője a GetFeaturedFirmwareData parancshoz, amellyel egy kiolvasás a flash memóriát olvassa. A 0.7.0.7-en és a 0.7.0.8-on benne van az RPC-metódustáblában a 0x4F helyen, de csak setterként (írókezelőként) van regisztrálva, így a kiolvasás által küldött control-IN olvasás nem továbbítható (a megőrzési futtatás ezt a két változatot ehelyett a 0x58 wire id-vel, GetFeaturedData, olvassa ki); a 0.7.0.7 előtt a 0x4F wire id az UploadFirmwareRowSize, a 0.3.0.1-en pedig a 0x52 wire id – amellyel egy kiolvasás élesít – az EnterBootloaderMode, nem a BeginFirmwareUpgrade: a kamera az alkalmazásában marad, de minden élesítés beállít egy flash-célt, és élesíti az adott változat firmware-frissítési szakaszát (a GetErrorCode ezután 0x00400000-t olvas), ami nem olvasási ablak. A lemezképek saját metódustábláiból nyerték ki, mindkét kezelőoszlopból; lásd: test/firmware/facts.json.',
  'support.noWritePath':
    'ezek a változatok egy régebbi frissítési sorrenddel fogadják az új firmware-t, amelyet ez az eszközkészlet nem küld, és a slotjaikat sosem térképezték fel, így semmi sem íródik.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'a firmware verziója nem volt kiolvasható, így a változat, a slotjai és azok előkészítési formája ismeretlen; semmit sem olvas vagy ír rajta',
  'support.versionNotDotted':
    'a firmware verziója („{version}”) nem pontokkal tagolt verzió, így a változat, a slotjai és azok előkészítési formája ismeretlen; semmit sem olvas vagy ír rajta',
  'support.olderThanFirst':
    'a firmware ({version}) régebbi, mint {first}: az RPC-táblájában nincs olvasáskezelő a GetFeaturedFirmwareData parancshoz, amelyet a slot kiolvasása küld, így sem olvasást, sem írást nem küld neki (a bizonyítékok az early-compact családnál vannak)',
  'support.modernOnLocked':
    'a modern-4x család a 2.x, 4.x, 10.x, 42.x és 44.x változatokat fedi le; {version} a 0.x / 1.x zárolt sorozatba tartozik, amelyhez legacy-auth vagy compact-2016 kell',
  'support.lockedOnModern':
    'a legacy-auth család a 0.x / 1.x zárolt sorozatot fedi le; {version} a modern sorozatba tartozik, amelyhez modern-4x kell',
  'support.notCompactPro':
    'a compact-2016 család a Compact PRO 1.0.3.x sorozatot fedi le; {version} nem tartozik bele',
  'support.earlyCompact':
    'az early-compact család csak azokat a változatokat fedi le, amelyek régebbiek ennél: {first}, {version} pedig a legacy-auth családdal olvasható',
  'support.generic':
    'a kamera családja nincs azonosítva (generic család), így a slotok elrendezése és az előkészítési forma ismeretlen; azonosítsa a kamerát, mielőtt slotot olvasna vagy írna',
  'support.noPlan':
    'ehhez a családhoz nincs slotterv: {family}; a slotok elrendezése és az előkészítési formája nem ismert',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'ennek a változatnak a táblája az egyszerű csatornán nem élesít ilyen módot: {mode} (cím: {address})',
  'support.noArmToken':
    'ennek a változatnak a táblája a tokenes csatornán nem élesít ilyen módot: {mode} (cím: {address})',
  'support.windowElsewhere': '{bank:nom} megőrzési ablaka itt van: {at}, nem itt: {address}',
  'support.noDumpWindow':
    'ennek a változatnak a BeginFirmwareUpgrade táblájában nincs ablak {bank:all} ezen a címen: {address}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused':
    'ez a család ({family}) nem támogatja ezt a műveletet ({capability}): {reason}',
  'support.capability.dump': 'kiolvasás',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': '„Minden szelektor kiolvasása”',
  'support.capability.decrypt': 'visszafejtés',
  'support.capability.deviceInfo': 'az Info fül teljes olvasása',
  'support.capability.flash': 'slotírás',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name:nom} ({address}) ezen a változaton nem olvasható: a szelektortáblájában nincs ott ablak, így semmi sem lett élesítve hozzá',
  'slots.unread.missing': '{name:nom} hiányzik a kamera elemzéséből',
  'slots.unread.notRead': '{name:nom} nem lett kiolvasva',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Semmi sem íródott.',
  'slots.refused.versionUnknown':
    'az elemzés nem mondja meg, milyen firmware-t futtat a kamera, a slotparancsok pedig különböző változatokon mást jelentenek. Olvassa ki újra az eszközadatokat.',
  'slots.refused.versionUnknownWrite':
    'az elemzés nem mondja meg, milyen firmware-t futtat a kamera. Semmi sem íródott.',
  'slots.refused.emptyInput': 'a bemenet üres',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable': '{name:nom} üres, és ezen a változaton nem írható: {reason}',
  'slots.refused.noRaw': '{name:nom} ezen a változaton nem fogad nyers bájtokat: {reason}',
  'slots.refused.noPlain':
    '{name:nom} ezen a változaton nem fogad visszafejtett lemezképet: {reason}',
  'slots.refused.noStaging':
    '{name:all} ezen a változaton nincs előkészítési forma, így nem kódolható hozzá lemezkép',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B hosszabb {name:ade} ({bankSize} B)',
  'slots.refused.imageTooLong': 'a lemezkép {size} B, hosszabb {name:ade} ({bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'a 2014-es bootloader nem fogadja el ennek a változatnak az ellenőrzőösszegét az A- vagy a B-slotban, a helyreállító R-slotot (0x14070000) pedig ellenőrzés nélkül indítja, így a módosítás a helyreállító R-slotba íródik, és sehová máshová',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly': 'ez a változat csak a helyreállító R-slotból fut: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize': 'egy firmware-slot {size} B ({kib} KB); ez a fájl {count} B',
  'decryptFile.erasedBank':
    'üres, nincs mit visszafejteni: minden bájt 0xFF ({size} B, törölt slot)',
  'decryptFile.erasedHeader':
    'törölt: a fejlécablak csupa 0xFF, így a slotban nincs lemezkép; semmi sincs visszafejtve',
  'decryptFile.noHeader':
    'nincs lemezképfejléc (magic: {magic}), így nincs visszafejthető lemezkép',
  'decryptFile.lengthOutOfRange':
    'a header.length ({length}) a tartományon kívül esik; nincs visszafejthető lemezkép',
  'decryptFile.ffKeyB':
    '{size} B visszafejtve az FF 1.3.0.8 B-kulccsal: a lemezkép „lemezkép XOR az 1. kulcsblokkjának kulcsfolyama” formában van tárolva, a fejlécablak változatlanul',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'a kulcs nincs kinyerve: a lemezkép visszafejtve olyan resetvektort ad, amely nem Cortex-M belépési pont (kulcs: {check}); semmi sincs visszafejtve',
  'decryptFile.storedPlain':
    'titkosítatlanul tárolva: a slot úgy tartalmazza a lemezképet, ahogy fut (a 2014-es titkosítatlan lánc, identitás-kulcsfolyam), így nincs kulcs, és a visszafejtett lemezkép maga a lemezkép',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': '{size} B visszafejtve az ebből a slotból kinyert kulccsal ({check})',
  'decryptFile.decryptedNamed':
    '{size} B visszafejtve az ebből a slotból kinyert kulccsal ({check}; ez {key:nom})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'rövid olvasás ({size} B)',
  'read.reason.noParse': 'a lemezképfejléc nem értelmezhető',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'nincs lemezképfejléc (magic: {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'a header.length ({length}) a tartományon kívül esik',
  'read.reason.stopped': 'a slot olvasása leállt itt: {count}/{size} B',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'nem olvasható ezen a firmware-en ({version}): a terve ({table}) nem tartalmaz ablakot ezen a címen: {address}, így semmi sem lett élesítve hozzá',
  'read.reason.notInPlanUnknown':
    'nem olvasható ismeretlen verziójú firmware-en: a terve ({table}) nem tartalmaz ablakot ezen a címen: {address}, így semmi sem lett élesítve hozzá',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'az ablak egy elavult olvasóleíró bájtjait adta ki – a 0. szó {word}, a reset {hex}, ez a 0x14000000 vektortáblája, nem ennek a slotnak a tartalma, így semmit sem elemzett belőle: {remedy}',
  'read.reason.spentReader': 'a kamera slotjai nem voltak kiolvashatók – {remedy}',
  'read.spentRemedy':
    'lehet, hogy az ablakolvasó kimerült ebben az indításban; kapcsolja ki és be a kamerát, és próbálja újra',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'a kamera aktív slotot jelző szava (fw info roots, 10. szelektor) nem volt kiolvasható',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'a kamera aktív slotot jelző szava {word}, amely egyik slotot sem nevezi meg',
  'checkKey.unnamed.cfg0NotRead':
    'az indítási konfigurációs szó nem lett kiolvasva, így nem ismert, hogy a bootloader ellenőrizte-e {bank:acc}, mielőtt elindította',
  'checkKey.unnamed.noZeroSum':
    'a kamera jelentése szerint {bank:ela} indult, de ebben az olvasásban {bank:nom} nem fejthető vissza nulla szóösszegre',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'a kamera jelentése szerint {bank:ela} indult, amelyet az indítási konfigurációs szó ({word}) utolsónak hagy, így a bootloader ellenőrzés nélkül indította el, de ebben az olvasásban {bank:nom} nem fejthető vissza nulla szóösszegre',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (pontszám az olvasás után: {score}, az alábbi jelek alapján)',
  'report.detectedAmbiguous':
    '{family} (pontszám az olvasás után: {score}, az alábbi jelek alapján; nem egyértelmű)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'igen',
  'report.cell.no': 'nem',
  'report.cell.notApplicable': 'n. a.',
  'report.cell.unknown': 'ismeretlen',
  'report.cell.recoveryOnly': 'csak helyreállító',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'fehérítési K',
  'report.keyRow.store': 'tárolási kulcs',
  'report.keyRow.check': 'ellenőrző kulcs',
  'report.keyRow.table': 'kulcstábla',
  'report.keyRow.keys': 'kulcsok',
  'report.keyRow.a': 'A-kulcs',
  'report.keyRow.b': 'B-kulcs',
  'report.keyRow.tableAt': 'a tábla helye',
  'report.key.notIdentified': '(nincs azonosítva)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} jelölt, egyik sincs megerősítve',
    other: '{count} jelölt, egyik sincs megerősítve',
  },
  'report.key.tableAt': '{offset} a bootloader blokkban, egy slottal megerősítve',
  'report.key.plainChain':
    'nincs szükség rá: a slotok titkosítatlan firmware-ként vannak tárolva, így egy slot úgy olvasható és írható, ahogy van',
  'report.key.tableRefused2016':
    'nincs kiolvasva – a bootloader blokkot (0x14000000) ebben a sorozatban minden csatorna elutasítja',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, {bank:nom} alapján megnevezve, amelyről a kamera jelentése szerint a bootloader ellenőrzése után indult',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, {bank:ela} kikövetkeztetve, amelyről a kamera jelentése szerint indult: a bootloader ellenőrzés nélkül indítja ezt a slotot, és azzal a kulccsal futtatja, amellyel a többi slotot ellenőrzi',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' ({pair} 1. blokkja)',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'a Compact PRO 1.0.3.x 9 Hz-es pár',
  'keyPair.cp1032ff': 'a Compact PRO 1.0.3.x FF pár',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'nincs megnevezve – {why}',
  'report.checkKey.couldNotName': 'az olvasás nem tudta megnevezni',
  'report.storeKey.checkKeyUnnamed':
    'az a kulcs, amellyel a bootloader a slotokat ellenőrzi (ebben az olvasásban nincs megnevezve): az alkalmazás minden általa írt slotot ezzel a kulccsal tárol',
  'report.storeKey.checkKey':
    '{key}: az alkalmazás minden általa írt slotot azzal a kulccsal tárol, amellyel a bootloadere ellenőriz',
  'report.storeKey.unknown':
    'ismeretlen – az eszközkulcs helyét tartalmazó bootloader blokk nem lett kiolvasva',
  'report.storeKey.keyBUnidentified':
    'B-kulcs (nincs beprogramozott eszközkulcs; maga a B-kulcs sincs azonosítva)',
  'report.storeKey.keyB': 'B-kulcs (nincs beprogramozott eszközkulcs)',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain': 'titkosítatlanul előkészítve (a lemezkép úgy, ahogy van, kulcs nélkül)',
  'report.staged.slotKeystream': 'a saját lemezképének 0. kulcsblokkjával előkészítve',
  'report.staged.keyA':
    'az indító slotból és a futó alkalmazásból származtatott kulcsokkal előkészítve',
  'report.staged.ffVendor':
    'úgy előkészítve, ahogy a gyártó alkalmazása a 16 Hz-es FF lemezképet (a lemezkép XOR a saját 0. kulcsblokkja), a kamera pedig a B-kulccsal tárolja',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Biztonsági mentés: blokk {address}',
  'progress.backupDone': 'Biztonsági mentés: minden blokk kiolvasva',
  'progress.checkBlock': 'Ellenőrzés: blokk {address}',
  'progress.checkDone': 'Ellenőrzés: minden blokk kiolvasva',
  'progress.writingBank': 'Írás {bank:ill}',
  'progress.restoringBank': 'Visszaállítás {bank:ill}',
  'progress.staged': '{label}: előkészítve {done}/{total} B',
  'progress.wholeFlash': 'Teljes flash kiolvasása: {got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'olvasás: {address} subcmd={subcmd}…',
  'progress.readWindowAuth': 'olvasás: {address} subcmd={subcmd} (auth)…',
  'progress.windowsRead': 'Kész – {ok}/{total} ablak kiolvasva.',
  'progress.readingBank': 'Kiolvasás: {bank}…',
  'progress.analysing': 'Elemzés…',
  'progress.probeSelector': 'szelektor próbája: {selector}…',
  'progress.selectorsArmed': 'Kész – {armed}/{span} szelektor élesítve, ebből adattal: {withData}.',
  'progress.recoveringKey': 'visszafejtés: kulcs kinyerése ehhez: {address}…',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} ({address}, subcmd {subcmd}): nem olvasható – {error}',
  'slots.read.refusedBuild':
    'a firmware-slotok kiolvasása elutasítva: {reason}. A verzió kiolvasásán túl semmi sem lett elküldve, így egyik slothoz sem nyúlt.',
  'slots.backup.notSaved':
    'a biztonsági mentés ({file}) nem lett elmentve, így semmi sem íródott. Írás sosem fut a biztonsági mentés előzetes elmentése nélkül; próbálja újra, amikor menthető.',
  'slots.backup.notSavedWhy':
    'a biztonsági mentés ({file}) nem lett elmentve ({error}), így semmi sem íródott. Írás sosem fut a biztonsági mentés előzetes elmentése nélkül; próbálja újra, amikor menthető.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'nagy sebességű (480 Mbit/s)',
  'usb.speed.full': 'teljes sebességű (12 Mbit/s)',
  'usb.speed.code': 'kód: {code}',
} satisfies Translation<'core', 'hu'>;
