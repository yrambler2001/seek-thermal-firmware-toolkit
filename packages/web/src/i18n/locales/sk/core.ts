/**
 * Namespace `core`, slovenčina (sk), translated from the English source: sentences that `@seek-fw/core` makes and
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
    'kamera zostane odomknutá až do vypnutia a zapnutia a iné nástroje ju dovtedy môžu čítať chybne; skôr než ich použijete, kameru vypnite a zapnite',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': 'najprv {first}, potom {second}, potom {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'sa neprečítal',
  'boot.verdict.checkKeyUnnamed':
    'sa nedal skontrolovať: kľúč, pod ktorým jeho bootloader kontroluje slot, nebol pomenovaný',
  'boot.cfg0NotRead':
    'slovo konfigurácie štartu (cfg[0]) sa neprečítalo, takže nie je známe, z ktorého slotu ďalší štart pobeží',
  'boot.select.unknown':
    'slovo konfigurácie štartu je {word}, takže bootloader skúša najprv {first:acc}, ale {bank} {verdict}, takže nie je známe, ktorý slot pobeží',
  'boot.select.first':
    'slovo konfigurácie štartu je {word}, takže bootloader skúša najprv {first:acc} a ten obsahuje obraz, ktorý bootloader prijme',
  'boot.select.second':
    'slovo konfigurácie štartu je {word}, takže bootloader skúša najprv {first:acc}; {first:nom} neobsahuje žiadny obraz, ktorý bootloader prijme, takže vezme {second:acc}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'slovo konfigurácie štartu je {word}, takže bootloader skúša najprv {first:acc}; {first:nom} ani {second:nom} neobsahuje obraz, ktorý bootloader prijme, takže spustí {last:acc}, ktorý nekontroluje',
  'boot.select.lastTakes':
    'slovo konfigurácie štartu je {word}, takže bootloader skúša najprv {first:acc}; {first:nom} ani {second:nom} neobsahuje obraz, ktorý bootloader prijme, takže vezme {last:acc}, ktorý nekontroluje',
  'boot.bootsNow': '{bank} je slot, z ktorého kamera teraz štartuje',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'práve spustený',
  'boot.notBooted': 'nespustený',
  'boot.unknownWhy.checkKeyUnnamed':
    'kľúč, pod ktorým jeho bootloader kontroluje slot, nebol pri tomto čítaní pomenovaný',
  'boot.unknownWhy.noKeyTable':
    'tabuľka kľúčov bootloadera sa neprečítala, takže kľúče, ktoré skúša, nemožno pomenovať',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'Kamera štartuje zo {bank:gen}. {why}.',
  'fpsBoot.holdsOne':
    '{bank} obsahuje záplatu snímkovej frekvencie, ale nebeží, takže sa záplata neprejaví.',
  'fpsBoot.holdsTwo':
    '{banks} obsahujú záplaty snímkovej frekvencie, ale ani jeden nebeží, takže sa záplaty neprejavia.',
  'fpsBoot.wouldNotRun':
    'Záplatovanie {target:gen} by ho nespustilo, pretože kamera namiesto neho štartuje zo {bank:gen}.',
  'fpsBoot.patchRunning':
    'Záplatujte aj {bank:acc} (slot, ktorý beží): až tým sa záplata snímkovej frekvencie prejaví.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank} sa tu nedá záplatovať ({reason}), takže sa záplata snímkovej frekvencie v inom slote na tejto kamere neprejaví.',

  /* ---- backup: the zip saved before a bank write (slots/backup); `{name}` is the bank inside a sentence ("slot B"): each is an item of backup.plan.* ---- */
  'backup.bank.notInPlan': '{name} (nie je v pláne tejto zostavy: zip to uvádza)',
  'backup.bank.unsupported': '{name} (táto zostava ho nedokáže prečítať, {reason}: zip to uvádza)',
  'backup.bank.empty':
    '{name} (prázdny, každý bajt 0xFF: zip to uvádza a zápis neprepíše žiadny firmvér)',
  'backup.bank.unread':
    '{name} (čítanie slotov sa k nemu nedostalo: zip uvádza, či sa k nemu dostane čítanie pred zápisom)',
  'backup.bank.noKey':
    '{name} (tak, ako je uložený; neotvorí ho žiadny kľúč, ktorý toto čítanie získalo, takže dešifrovaný súbor chýba)',
  'backup.bank.decrypted': '{name} (tak, ako je uložený, a dešifrovaný)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Skôr než sa čokoľvek zapíše, {banks} sa znova prečíta a uloží do jedného zipu s poznámkou, čo ktorý súbor je: {file}.',
  'backup.plan.many':
    'Skôr než sa čokoľvek zapíše, {banks} sa znova prečítajú a uložia do jedného zipu s poznámkou, čo ktorý súbor je: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'zašifrované tak, aby ho zariadenie uložilo pod kľúčom, ktorý obsahuje spustený slot',
  'staging.detail.slotKeystreamCiphertext':
    'zašifrované vlastným kľúčom obrazu na odovzdanie (blok kľúčov 0); kamera ho uloží pod vlastným kľúčom slotu',
  'staging.detail.plain': 'otvorený text, bez šifry',
  'staging.detail.keyAKeystream':
    'obraz 1.3.0.8 FF tak, ako ho odovzdáva aplikácia výrobcu (XOR kľúč A) — zostava 16 Hz ho uloží pod kľúčom B, nie tieto bajty',
  'staging.detail.verbatim': 'bez zmeny — bajty presne tak, ako boli zadané',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'žiadne čítanie',
  'copy.source.notInPlan': '{name} nie je v pláne tejto zostavy',
  'copy.source.notRead': '{name} sa neprečítal ({reason}), takže nie je čo kopírovať',
  'copy.source.empty': '{name} je prázdny: nie je čo kopírovať',
  'copy.source.foreign':
    'v {name:loc} nie je žiadny obraz firmvéru, ktorý toto čítanie rozpozná, takže nie je čo kopírovať',
  'copy.source.noKey':
    '{name:acc} neotvorí žiadny kľúč, ktorý toto čítanie získalo, takže nie je žiadny dešifrovaný obraz na kopírovanie',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} na adrese {address}, tak ako ho dešifrovalo čítanie slotov',
  'copy.fromVersion':
    '{name} na adrese {address}, firmvér {version}, tak ako ho dešifrovalo čítanie slotov',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'Obraz pochádza zo {name:gen}, tak ako ho dešifrovalo čítanie slotov: {size} B, sha256 {sha256}.',
  'copy.noteVersion':
    'Obraz pochádza zo {name:gen}, tak ako ho dešifrovalo čítanie slotov: firmvér {version}, {size} B, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '{name} zo zálohy (na adrese {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where} v úplnej zálohe pamäte flash {file}',
  'restore.fromVersion': '{where} v úplnej zálohe pamäte flash {file}, firmvér {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'obraz pamäte flash s veľkosťou 4 MB',
  'restore.kind.preserve-run': 'súbor behu z karty 0.x/1.x',
  'restore.kind.dump': 'zip z karty „Výpis a dešifrovanie 4.x/Nano“',
  'restore.kind.all-selectors': 'zip z „Vypísať všetky selektory“',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'obraz',
  'restore.decryptedTo.firmware': 'firmvér {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'Obraz: {where} v súbore {file}, {kind}: uložené sha256 {stored}, dešifrované na {decrypted} s veľkosťou {size} B (sha256 {sha256}).',
  'restore.note.imageEntry':
    'Obraz: {where} v súbore {file}, {kind} (položka {entry}): uložené sha256 {stored}, dešifrované na {decrypted} s veľkosťou {size} B (sha256 {sha256}).',
  'restore.note.readBack':
    'Po zápise sa spätne prečítaný slot porovná s bajtmi slotu uloženými v zálohe.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'Identifikačný blok zálohy uvádza túto kameru (sériové číslo {serial}).',
  'restore.note.sameBytes': 'V {name:loc} už sú bajty uložené v zálohe: zápis vráti rovnaký obraz.',
  'restore.warn.otherCamera':
    'Táto záloha vyzerá ako z inej kamery: jej identifikačný blok uvádza sériové číslo {theirs} a táto kamera má {camera}. Zapíše sa len obraz {name:gen}; nič z identity ani kalibrácie tej kamery sa nezapíše.',
  'restore.warn.noIdentity':
    'Táto záloha nemá identifikačný blok na adrese {address}, takže sa nedá zistiť, z koho kamery bola prečítaná.',
  'restore.warn.serialNotRead':
    'Sériové číslo kamery sa neprečítalo, takže zálohu (sériové číslo {serial}) k nej nemožno priradiť.',
  'restore.warn.otherFirmware':
    '{where} obsahuje firmvér {version} a v kamere beží {camera}: obnovenie vloží do slotu iný firmvér.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared': '{bank} sa spätne neprečítal, takže sa so zálohou neporovnáva.',
  'restore.readBack.equal': '{bank} sa spätne číta bajt po bajte tak, ako ho záloha ukladá.',
  'restore.readBack.differs':
    '{bank} sa pri spätnom čítaní líši od bajtov uložených v zálohe: {count} B (prvý na {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, odvodený zo spusteného {bank:gen}',
  'keys.derived.holds':
    '{key} (kľúč zápisu), odvodený zo spusteného {bank:gen}, ktorý obsahuje {holds}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, odvodený zo spusteného slotu',
  'keys.derived.holdsUnnamed':
    '{key} (kľúč zápisu), odvodený zo spusteného slotu, ktorý obsahuje {holds}',
  'keys.ffVendor.staged':
    'obraz 1.3.0.8 FF (16 Hz) tak, ako ho odovzdáva aplikácia výrobcu: obraz XOR jeho vlastný blok kľúčov 0 (kľúč A), okno hlavičky bez zmeny, do ľubovoľného slotu; kľúče tejto kamery sa nepoužívajú',
  'keys.ffVendor.stored':
    'kľúč B: kamera nahrané údaje prešifruje blokom kľúčov 1 a obraz pod ním uloží',
  'keys.imageBlock0.staged':
    'obraz pod jeho vlastným blokom kľúčov 0 (nájdeným v obraze podľa hodnoty), do ľubovoľného slotu; kľúče tejto kamery sa nepoužívajú',
  'keys.imageBlock0.storedUnnamed':
    'kľúč, pod ktorým jej bootloader kontroluje slot (pri tomto čítaní nepomenovaný); kamera pod ním nahrané údaje znova zašifruje',
  'keys.imageBlock0.stored':
    '{key}, kľúč, pod ktorým jej bootloader kontroluje slot; kamera pod ním nahrané údaje znova zašifruje',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED (nevyskúšané): z kamery sa zatiaľ neprečítal žiadny bootloader zostavy 16 Hz FF, takže nie je známe, či zapísaný slot naštartuje. Na bootloaderi 0.9.0.0 skoršia podoba tohto obrazu naštartovala zo slotu na obnovu R; táto podoba nenaštartuje, pretože tento bootloader spúšťa slot na obnovu R tak, ako je uložený, bez dekódovania.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'Obraz 16 Hz FF sa posiela v podobe, ktorú číta len zostava 16 Hz {version}. Táto kamera zapisuje slot bez kontroly obrazu (uvádza to zdrojový kód jej firmvéru a Compact 1.3.0.0 to pri skúške tak urobil), takže sa očakáva, že bajty zapíše tak, ako boli poslané: slot potom obsahuje obraz v podobe, ktorú táto kamera nedokáže spustiť.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Nič tu netvrdí, že ho kamera spustí.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast': 'Vlastné odpovede kamery hovoria, že v nej beží zostava 16 Hz FF: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'kontroluje údaje pred vymazaním slotu a tieto údaje kontrolou prejdú, takže môže tieto bajty zapísať tak, ako sú, v podobe, ktorú jej bootloader nedokáže spustiť: slot nemusí naštartovať (nevyskúšané; záloha uložená pred zápisom ho vráti)',
  'write.ff.outcome.refuses':
    'kontroluje údaje pred vymazaním slotu a tieto údaje kontrolou neprejdú, takže sa očakáva, že tento zápis odmietne skôr, než čokoľvek zapíše (kamera s touto zostavou rovnako odmietla skoršiu podobu tohto obrazu)',
  'write.ff.runsSlow': 'V kamere beží zostava 8 Hz {version}: {why}. Táto zostava {outcome}.',
  'write.ff.buildUnknown':
    'Vlastné odpovede kamery nehovoria, ktorá zostava {version} v nej beží: {why}. Ak v nej beží zostava 16 Hz FF, tieto údaje prijme. Ak v nej beží zostava 8 Hz, táto zostava {outcome}.',
  'write.raw.asGiven':
    'Surové údaje: posielajú sa presne tak, ako boli zadané. Nič tu nekontroluje, či sú spustiteľné.',
  'write.raw.ffStagedForm':
    'Tieto údaje sú podoba 1.3.0.8 FF na odovzdanie (obraz XOR blok kľúčov 0, súčet slov 0xFFFF). Kamera uloží obraz pod kľúčom B, takže sa kontrolné čítanie porovnáva s týmito bajtmi.',
  'write.raw.noStaging':
    'Táto zostava pre slot neuvádza žiadnu podobu odovzdania, takže kontroly bootloadera nemožno určiť.',
  'write.raw.reencrypts':
    'Zariadenie tieto údaje dekóduje a to, čo si ponechá, znova zašifruje, takže uložené bajty nemožno predpovedať. Kontrolné čítanie sa kontroluje ako obraz, na ktorý sa dešifruje, ak sa to dá určiť.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'Bootloader by tieto údaje odmietol: {failure}.',
  'write.raw.stageKeyUnchecked':
    'Kľúč na odovzdanie z roku 2016 (blok kľúčov 0) v surových bajtoch nie je, takže sa dešifrovaný súčet slov týchto údajov tu nekontroluje.',
  'write.image.rekeyRisk':
    'V {name:loc} už je obraz, ktorý bootloader nedokáže prijať. Tento zápis skončí v rovnakom stave.',
  'write.ack.recovery':
    'Slot na obnovu R: zápis doň vyžaduje, aby ste riziko potvrdili. Nič tu nekontroluje, či kamera potom naštartuje.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: zápis doň vyžaduje, aby ste riziko potvrdili, a kamera po ďalšom vypnutí a zapnutí spustí čokoľvek, čo obsahuje.',
  'write.ack.bootUnnamed':
    'Spustený slot sa nepodarilo pomenovať, takže sa tento slot berie ako spustený',
  'write.ack.recoveryFallback':
    'Slot na obnovu R je posledná záložná kópia, ku ktorej sa bootloader vracia',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'prázdne/0: prednosť má slot A, potom B, potom slot na obnovu',
  'boot.cfg0.modernB': 'prednosť má slot B, potom A, potom slot na obnovu',
  'boot.cfg0.modernRecovery': 'prednosť má slot na obnovu, potom A, potom B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'neznáme — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  /** `{verdict}` is one of upgrade.verdict.*. `{name}` here is the bank inside a sentence ("slot B"); in upgrade.verdict.* it starts a sentence ("Slot B"). */
  'upgrade.whileRecovery':
    'Kamera beží zo svojho slotu na obnovu a jej vlastná aktualizácia zapisuje {name}, z ktorého nebeží. {verdict} Je to len varovanie: nič tu aktualizácii nebráni.',
  'upgrade.verdict.notRead':
    '{name} sa pri tejto kontrole nepodarilo prečítať, takže nie je známe, čo obsahuje.',
  'upgrade.verdict.blank': '{name} je prázdny, takže aktualizácia zapisuje do prázdneho slotu.',
  'upgrade.verdict.bootableSame':
    '{name} obsahuje rovnaký spustiteľný obraz ako slot, z ktorého kamera beží, a aktualizácia ho nahradí. {name} zostane nespustiteľný, ak sa aktualizácia zastaví v polovici.',
  'upgrade.verdict.bootable':
    '{name} obsahuje spustiteľný obraz, ktorý aktualizácia nahradí. {name} zostane nespustiteľný, ak sa aktualizácia zastaví v polovici.',
  'upgrade.verdict.unknown':
    '{name}: spustiteľnosť je pri tomto čítaní neznáma, takže aktualizácia môže nahradiť obraz, ktorý by kamera spustila.',
  'upgrade.verdict.notBootable':
    '{name} sa pri tomto čítaní nejaví ako spustiteľný, takže aktualizácia nenahradí žiadny obraz, ktorý by kamera spustila.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — slot, do ktorého bootloader pri tomto štarte vstúpil, ako ho zaznamenáva',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'neprečítané',
  'report.lastStart.noBank': 'kamera hlási {word}, čo neoznačuje žiadny slot',
  'report.lastStart.entered':
    'kamera hlási, že vstúpila do {bank:gen} (slovo aktívneho slotu {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'žiadna verzia',
  'running.why.otherVersion': 'kamera hlási {version} a dve zostavy má len {only}',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'kamera neodpovedala na verdikty slotov (selektory GetFirmwareInfo 6, 7, 8)',
  'running.why.notRead':
    'slot, od ktorého verdikty závisia, sa neprečítal, takže odpovede nemožno predpovedať',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'kamera odpovedá {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain': '{answers}, čo pre tieto sloty zodpovedá zostave 8 Hz 1.3.0.8 ({predicted})',
  'running.why.ff':
    '{answers}, čo pre tieto sloty zodpovedá zostave 16 Hz FF 1.3.0.8 ({predicted})',
  'running.why.both':
    '{answers} a obe zostavy pre tieto sloty odpovedajú presne tak, takže ich sloty nerozlíšia',
  'running.why.neither':
    '{answers}, čo nezodpovedá žiadnej zostave (8 Hz: {plain}; 16 Hz FF: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'Hlavička tohto obrazu neuvádza žiadnu verziu firmvéru, takže sa nedá zistiť, či ide o zostavu, ktorá v kamere beží ({camera}). Skontrolujte, či ide o obraz, ktorý chcete zapísať.',
  'imageBuild.otherVersion': 'Tento obraz je firmvér {image}; v kamere beží {camera}.',
  'imageBuild.otherVersionTaken':
    'Tento obraz je firmvér {image}; v kamere beží {camera}. V tomto rade kamera kontroluje len to, či je obraz správne vytvorený (jeho hlavičku a súčet slov), nie jeho verziu, takže tento obraz prijme, a keď naštartuje z tohto slotu, pobeží {image}.',
  'imageBuild.otherVersionUnchecked':
    'Tento obraz je firmvér {image}; v kamere beží {camera}. Či táto kamera prijme inú zostavu a spustí ju, sa neoverovalo.',
  'imageBuild.otherBuild':
    'Tento obraz je zostava 8 Hz {version}; v kamere beží zostava 16 Hz {version} FF. Zostava 16 Hz pri potvrdení zápisu kontroluje údaje voči svojej vlastnej podobe FF a údaje, ktoré neprejdú, odmietne skôr, než slot vymaže (podľa jej zdrojového kódu). Zápis zostavy 8 Hz do nej sa na kamere nevyskúšal.',
  'imageBuild.runningUnknown':
    'Tento obraz je zostava 8 Hz {version}. V kamere beží verzia {version}, ktorá existuje ako zostava 8 Hz aj ako zostava 16 Hz FF, a jej vlastné odpovede nepovedali, ktorá z nich beží, takže sa nedá zistiť, či ide o jej zostavu.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': 'údaje majú {size} B, čo je príliš málo na hlavičku na 0x200',
  'bootFail.noMagic': 'na 0x200 nie je magic obrazu (nájdené {found}, bootloader vyžaduje {needs})',
  'bootFail.lengthOutside': 'header.length {length} leží mimo údajov s veľkosťou {size} B',
  'bootFail.lengthNotPayload': 'header.length {length} nezodpovedá dĺžke údajov {size}',
  'bootFail.overStage': '{size} B presahuje {max} B na odovzdanie',
  'bootFail.plainSum': 'uložený súčet slov je {sum}, bootloader z roku 2014 vyžaduje 0',
  'bootFail.noFooter': 'na {offset} nie je pätička: údaje končia na {end}',
  'bootFail.footerNotCode':
    'pätička na {offset} nie je „CODE“ — bootloader použije svoj segmentovaný zavádzač',
  'bootFail.footerLength': 'dĺžka pätičky nezodpovedá header.length {length}',
  'bootFail.keyASum':
    'po dešifrovaní kľúčom A tejto kamery je súčet slov {sum}, bootloader vyžaduje {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'overený kontrolným súčtom',
  'keyConfidence.structural': 'overený len tabuľkou vektorov',
  'keyConfidence.unverified': 'neoverený',
  /** `{sum}` is hex. */
  'keyCheck.family': 'kľúč overený kontrolným súčtom {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'kľúč {phrase}; kontrolný súčet {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'odovzdané pod vlastnými kľúčmi kamery',
  'staging.phrase.slotKeystreamCiphertext': 'odovzdané pod vlastným kľúčom obrazu',
  'staging.phrase.plain': 'odovzdané v otvorenej podobe',
  'staging.phrase.keyAKeystream':
    'odovzdané tak, ako obraz FF odovzdáva aplikácia výrobcu (XOR kľúč A)',
  'staging.phrase.verbatim': 'odoslané tak, ako bolo zadané',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank, inside the sentence ("slot A"); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    'zápis {size} B do {name:gen} na adrese {address} potvrdený, {staged}; stav potvrdenia {status}',
  'written.noReadWindow':
    'táto zostava pre slot neuvádza žiadne okno čítania, takže sa nič spätne neprečítalo',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'kontrolné čítanie zlyhalo: {error}',
  'written.readBack': 'spätne prečítané {size} B, SHA-256 {sha256}',
  'written.verifyOff': 'overenie je vypnuté: slot sa spätne nečítal',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'bajty, ktoré mal slot podľa plánu obsahovať (obraz tak, ako ho ukladá zostava 16 Hz, nie odoslané bajty)',
  'readBack.reference.asSent':
    'bajty, ktoré mal slot podľa plánu obsahovať (bajty tak, ako boli odoslané)',
  'readBack.sizeDiffers':
    'kontrolné čítanie má {size} B, plán predpovedal {predictedSize} B: slot NEZODPOVEDÁ očakávaniu — {reference}',
  'readBack.matchesFolded':
    'slot obsahuje obraz tak, ako ho ukladá zostava 16 Hz (nie odoslané bajty), a zvyšok slotu je vymazaný',
  'readBack.matches':
    'slot zodpovedá bajtom, ktoré plán predpovedal (nešifrovaný reťazec z roku 2014 programuje presne to, čo dostane)',
  'readBack.differs': 'slot NEZODPOVEDÁ očakávaniu — {reference} (prvý rozdiel na {offset})',
  'readBack.noHeader':
    'kontrolné čítanie neobsahuje na {offset} hlavičku obrazu (magic {magic}), takže sa slot NEDEŠIFRUJE na očakávaný obraz',
  'readBack.lengthDiffers':
    'hlavička v kontrolnom čítaní uvádza {length} B, obraz podľa plánu má {imageLength} B: slot sa NEDEŠIFRUJE na očakávaný obraz',
  'readBack.tooShort':
    'kontrolné čítanie má {size} B, čo je príliš málo na obraz s veľkosťou {length} B: slot sa NEDEŠIFRUJE na očakávaný obraz',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'prúdu kľúča získaného z kontrolného čítania ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': 'slot sa dešifruje na očakávaný obraz ({length} B) pomocou {recovered}',
  'readBack.decryptDiffers':
    'slot sa NEDEŠIFRUJE na očakávaný obraz: prvý rozdiel na offsete obrazu {offset} pri použití {recovered}',
  'readBack.rawNotCompared':
    'surové bajty: kontrolné čítanie nahlásené, neporovnané (bajty sa v tejto podobe nedešifrujú na predvídateľný otvorený obraz a zariadenie to, čo si ponechá, znova zašifruje)',
  'readBack.notCompared':
    'porovnanie nebolo možné: plán nepredpovedá uložené bajty ani otvorený obraz',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'kľúč A',
  'keyName.keyA:gen': 'kľúča A',
  'keyName.keyA:dat': 'kľúču A',
  'keyName.keyA:acc': 'kľúč A',
  'keyName.keyA:ins': 'kľúčom A',
  'keyName.keyA:loc': 'kľúči A',
  'keyName.keyB': 'kľúč B',
  'keyName.keyB:gen': 'kľúča B',
  'keyName.keyB:dat': 'kľúču B',
  'keyName.keyB:acc': 'kľúč B',
  'keyName.keyB:ins': 'kľúčom B',
  'keyName.keyB:loc': 'kľúči B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'kľúč zariadenia',
  'keyName.perDevice:gen': 'kľúča zariadenia',
  'keyName.perDevice:dat': 'kľúču zariadenia',
  'keyName.perDevice:acc': 'kľúč zariadenia',
  'keyName.perDevice:ins': 'kľúčom zariadenia',
  'keyName.perDevice:loc': 'kľúči zariadenia',
  'keyName.thePerDevice': 'kľúč zariadenia',
  'keyName.thePerDevice:gen': 'kľúča zariadenia',
  'keyName.thePerDevice:dat': 'kľúču zariadenia',
  'keyName.thePerDevice:acc': 'kľúč zariadenia',
  'keyName.thePerDevice:ins': 'kľúčom zariadenia',
  'keyName.thePerDevice:loc': 'kľúči zariadenia',
  'keyName.applicationKeyA': 'kľúč A aplikácie',
  'keyName.applicationKeyA:gen': 'kľúča A aplikácie',
  'keyName.applicationKeyA:dat': 'kľúču A aplikácie',
  'keyName.applicationKeyA:acc': 'kľúč A aplikácie',
  'keyName.applicationKeyA:ins': 'kľúčom A aplikácie',
  'keyName.applicationKeyA:loc': 'kľúči A aplikácie',
  'keyName.applicationKeyB': 'kľúč B aplikácie',
  'keyName.applicationKeyB:gen': 'kľúča B aplikácie',
  'keyName.applicationKeyB:dat': 'kľúču B aplikácie',
  'keyName.applicationKeyB:acc': 'kľúč B aplikácie',
  'keyName.applicationKeyB:ins': 'kľúčom B aplikácie',
  'keyName.applicationKeyB:loc': 'kľúči B aplikácie',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'blok kľúčov 1',
  'keyName.block1:gen': 'bloku kľúčov 1',
  'keyName.block1:dat': 'bloku kľúčov 1',
  'keyName.block1:acc': 'blok kľúčov 1',
  'keyName.block1:ins': 'blokom kľúčov 1',
  'keyName.block1:loc': 'bloku kľúčov 1',
  'keyName.theDeviceKey': 'kľúč zariadenia',
  'keyName.theDeviceKey:gen': 'kľúča zariadenia',
  'keyName.theDeviceKey:dat': 'kľúču zariadenia',
  'keyName.theDeviceKey:acc': 'kľúč zariadenia',
  'keyName.theDeviceKey:ins': 'kľúčom zariadenia',
  'keyName.theDeviceKey:loc': 'kľúči zariadenia',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'neznámy kľúč',
  'keyName.unknown:gen': 'neznámeho kľúča',
  'keyName.unknown:dat': 'neznámemu kľúču',
  'keyName.unknown:acc': 'neznámy kľúč',
  'keyName.unknown:ins': 'neznámym kľúčom',
  'keyName.unknown:loc': 'neznámom kľúči',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'nešifrovaný reťazec z roku 2014: každý slot je uložený v otvorenej podobe, takže sa neodvodzuje žiadny kľúč na nahranie; nahráva sa obraz tak, ako je',
  'keys.evidence.ffVendor':
    'zostava 1.3.0.8 FF (16 Hz): žiadny slot, ktorý toto čítanie otvorilo, nie je uložený v otvorenej podobe, takže sa nepreukazuje, že by kamera bola na nešifrovanom reťazci z roku 2014; obraz FF sa zapisuje v podobe od výrobcu, surové bajty sa posielajú tak, ako boli zadané, a otvorený obraz 8 Hz sa nezapisuje',
  'keys.evidence.ffUntested':
    'zápis obrazu FF sa ponúka s varovaním UNTESTED: v zbierke nie je žiadny skutočný bootloader tejto zostavy, takže sa nezmeralo, či zapísaný slot naštartuje',
  'keys.evidence.line2016':
    'rad Compact PRO z roku 2016: nahrávané údaje sú obraz XOR prúd kľúča jeho vlastného bloku kľúčov 0, nájdeného v obraze podľa hodnoty, takže ich nezostavuje žiadny kľúč tejto kamery',
  'keys.evidence.checkKeyUnnamed':
    'kamera nahrané údaje týmto kľúčom dešifruje a znova ich zašifruje kľúčom, pod ktorým jej bootloader kontroluje slot; ten kľúč nebol pri tomto čítaní pomenovaný a zápis ho nepotrebuje: slot sa spätne prečíta ako obraz, na ktorý sa dešifruje',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'kamera nahrané údaje týmto kľúčom dešifruje a znova ich zašifruje kľúčom, pod ktorým jej bootloader kontroluje slot; ten kľúč nebol pri tomto čítaní pomenovaný ({why}) a zápis ho nepotrebuje: slot sa spätne prečíta ako obraz, na ktorý sa dešifruje',
  'keys.evidence.checkKeyNamed':
    'kamera nahrané údaje týmto kľúčom dešifruje a znova ich zašifruje {key:ins} {hex}, kľúčom, pod ktorým jej bootloader kontroluje slot, takže každý slot, ktorý zapíše, je uložený tak, ako ho bootloader prijme',
  'keys.evidence.checkKeyInferred':
    'kamera nahrané údaje týmto kľúčom dešifruje a znova ich zašifruje {key:ins} {hex}, kľúčom, pod ktorým jej bootloader kontroluje slot (odvodené zo {bank:gen}, slotu, do ktorého podľa kamery vstúpila a do ktorého bootloader vstúpil bez kontroly), takže každý slot, ktorý zapíše, je uložený tak, ako ho bootloader prijme',
  'keys.evidence.checkKeyNamedFrom':
    'kamera nahrané údaje týmto kľúčom dešifruje a znova ich zašifruje {key:ins} {hex}, kľúčom, pod ktorým jej bootloader kontroluje slot (pomenované podľa {bank:gen}, slotu, do ktorého podľa kamery vstúpila), takže každý slot, ktorý zapíše, je uložený tak, ako ho bootloader prijme',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'spustený slot sa nepodarilo pomenovať, takže z neho nemožno prečítať kľúč, pod ktorým je slot uložený',
  'keys.refused.notDerived': 'kľúče sa nepodarilo odvodiť',
  'keys.refused.notDecrypted':
    'spustený {bank} sa nedešifruje na obraz, takže nemožno prečítať kľúč, pod ktorým je uložený',
  'keys.refused.noBootKey':
    'spustený {bank} sa nedešifruje pod žiadnym kľúčom, ktorý bootloader skúša (jeho kľúč A ani jeho kľúč zápisu), takže z neho nemožno prečítať kľúč, pod ktorým je slot uložený',
  'keys.refused.keyNotInTable':
    'spustený {bank} sa dešifruje {key:ins}, ale tabuľka kľúčov tejto kamery tento kľúč neobsahuje, takže pod ním nemožno zapisovať',
  'keys.refused.noApplicationPair':
    'bežiaca aplikácia ({bank}, firmvér {firmware}) neobsahuje žiadnu zo známych dvojíc kľúčov (dvojicu bootloadera ani dekódované dvojice aplikácie) s každou polovicou práve raz, takže jej kľúč A nemožno v jej obraze nájsť',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'bežiaca aplikácia ({bank}, firmvér {firmware}) neobsahuje žiadnu zo známych dvojíc kľúčov (dvojicu bootloadera ani dekódované dvojice aplikácie) s každou polovicou práve raz, takže jej kľúč A nemožno v jej obraze nájsť (kľúč A bootloadera sa vyskytuje {count}-krát, jeho kľúč B {keyB}-krát)',
    few: 'bežiaca aplikácia ({bank}, firmvér {firmware}) neobsahuje žiadnu zo známych dvojíc kľúčov (dvojicu bootloadera ani dekódované dvojice aplikácie) s každou polovicou práve raz, takže jej kľúč A nemožno v jej obraze nájsť (kľúč A bootloadera sa vyskytuje {count}-krát, jeho kľúč B {keyB}-krát)',
    many: 'bežiaca aplikácia ({bank}, firmvér {firmware}) neobsahuje žiadnu zo známych dvojíc kľúčov (dvojicu bootloadera ani dekódované dvojice aplikácie) s každou polovicou práve raz, takže jej kľúč A nemožno v jej obraze nájsť (kľúč A bootloadera sa vyskytuje {count}-krát, jeho kľúč B {keyB}-krát)',
    other:
      'bežiaca aplikácia ({bank}, firmvér {firmware}) neobsahuje žiadnu zo známych dvojíc kľúčov (dvojicu bootloadera ani dekódované dvojice aplikácie) s každou polovicou práve raz, takže jej kľúč A nemožno v jej obraze nájsť (kľúč A bootloadera sa vyskytuje {count}-krát, jeho kľúč B {keyB}-krát)',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'bežiaca aplikácia ({bank}, firmvér {firmware}) kontroluje nahrané údaje pod svojimi vlastnými kľúčmi skôr, než ich naprogramuje (dekódovaný zdrojový kód tejto zostavy skúša nahrané údaje pod svojím kľúčom A a svojím kľúčom zápisu, rovnako ako jej bootloader skúša slot), a kľúč, pod ktorým zápisy ukladajú, {key} ({hex}), nie je ani jej kľúčom A, ani kľúčom zápisu, takže by kamera nahrané údaje odmietla s 0x50000 skôr, než čokoľvek vymaže',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'žiadny slot sa nedešifruje na kontrolný súčet {sum} rodiny {family}',
  'writeRefusal.keyTable': 'tabuľku kľúčov tejto kamery sa nepodarilo potvrdiť',
  'writeRefusal.whitening':
    'tabuľka kľúčov tejto kamery vychádza pod K={k}, ale {family} šifruje pod K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily':
    'dôkazy hovoria, že táto kamera je {detected}, nie {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'do tejto kamery sa odtiaľto nedá zapisovať: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Zostavy Seek z roku 2018 a novšie (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 a Nano 300. Výpis prečíta 63 zo 64 blokov pamäte flash bez toho, aby čokoľvek odomykal; na blok na {block} sa na týchto zostavách žiadne čítanie nedostane. Firmvér je uložený zašifrovane. Sloty sa zapisujú jeden po druhom na karte „Práca so slotmi firmvéru“.',
  'family.summary.early':
    'Kamery Compact z roku 2014 staršie ako 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 a 0.7.0.8. Ich firmvér nevie odpovedať na čítanie, ktoré posiela výpis, takže výpis, „Vypísať všetky selektory“, úplné čítanie na karte Info aj karta „Práca so slotmi firmvéru“ ich po prečítaní verzie odmietnu; na 0.3.0.1 by príkaz, ktorým výpis začína, namiesto toho pripravil aktualizáciu firmvéru. Beh na karte 0.x/1.x číta 0.7.0.7 a 0.7.0.8 iným príkazom, na ktorý tieto dve zostavy odpovedajú. Výpis získaný iným spôsobom sa dešifruje ako zvyčajne.',
  'family.summary.compact2016':
    'Zostavy Compact PRO 1.0.3.x (1.0.3.0 a 1.0.3.2). Na čítanie odpovedajú presne ako kamery Compact z roku 2014, vrátane odomykacieho tokenu, takže sa rozlišujú podľa verzie a podľa toho, ako sú uložené ich sloty: zašifrovane, zatiaľ čo sloty z roku 2014 sú v otvorenej podobe. Kamera 1.0.3.x sa od začiatku číta v rámci tejto rodiny. Beh na karte 0.x/1.x prečíta celú pamäť flash a sloty sa zapisujú jeden po druhom na karte „Práca so slotmi firmvéru“.',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    'Kamery Compact z roku 2014 od 0.8.0.0 do 1.3.0.8, vrátane zostavy 16 Hz 1.3.0.8 FF. Bežná kamera vydá menej ako polovicu svojej pamäte flash, časť z toho len na odomykací token, ktorý súprava nástrojov posiela; beh na karte 0.x/1.x prečíta zvyšok pomocou dočasnej záplaty. Sloty sú uložené v otvorenej podobe, okrem zostavy FF. Kamera Compact PRO 1.0.3.x sa číta ako compact-2016 a sem prejde, len ak je niektorý slot uložený v otvorenej podobe alebo sa dešifruje na {sum}, ako je to pri zostave FF. Sloty sa zapisujú na karte „Práca so slotmi firmvéru“ na zostavách, na ktorých bol beh na karte 0.x/1.x zmeraný; akákoľvek iná zostava 0.x alebo 1.x sa len číta.',
  'family.summary.generic':
    'Kamera, ktorej nezodpovedá žiadna iná rodina. `seek-fw dump` ju číta so zoznamom blokov 4.x (karta 4.x/Nano ju odmietne) a dešifrovanie vypočíta kľúč zo samotného obrazu, takže ani jedno od odhadu nezávisí. Žiadny slot sa nezapisuje: karta „Práca so slotmi firmvéru“ ju odmieta, kým kamera nie je identifikovaná.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'hlavička obrazu uvádza',
  'detect.source.camera': 'kamera hlási',
  'detect.plainArmedNotInForce':
    'obyčajný dvojbajtový BeginFirmwareUpgrade aktivoval chránený slot, takže overený kanál čítania neplatí',
  'detect.modern.plainRefused':
    'obyčajný dvojbajtový BeginFirmwareUpgrade chráneného slotu bol ODMIETNUTÝ, čo žiadna zostava tohto radu nerobí — jeho obsluha nemá kontrolu tokenu a obyčajný kanál prijíma na každom slote',
  'detect.modern.authArmed':
    'chránený slot sa aktivoval na overenom selektore s 18 bajtmi; obyčajný tam nikto neskúšal, takže to túto kameru z tohto radu nevyraďuje',
  'detect.modern.legacyVersion':
    '{said} firmvér {version}, ktorý patrí do staršieho radu 0.x / 1.x (iný číselný rad, nie staršia 4.x — a jedna z tých zostáv tiež dosahuje súčet {sum})',
  'detect.modern.noSum':
    'žiadny slot sa nedešifruje na kontrolný súčet {sum}, ktorý vyžaduje bootloader tejto rodiny',
  'detect.modern.sum': 'slot sa dešifruje na kontrolný súčet {sum}',
  'detect.modern.version':
    'firmvér {version} patrí do radu po roku 2018, ktorý táto mapa selektorov pokrýva (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'obyčajný dvojbajtový BeginFirmwareUpgrade aktivoval chránený slot, takže nejde o zamknutý starší firmvér',
  'detect.modern.none': 'žiadny dôkaz neradí túto kameru do radu po roku 2018',
  'detect.early.noVersion': 'nebola nahlásená ani v hlavičke obrazu nájdená žiadna verzia firmvéru',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'firmvér {version} je {first} alebo novší, takže jeho tabuľka RPC má getter pre GetFeaturedFirmwareData a platí bežná cesta čítania',
  'detect.early.older':
    '{said} firmvér {version}, ktorý je starší ako {first} — prvá zostava, ktorej tabuľka metód RPC má obsluhu čítania (getter) pre GetFeaturedFirmwareData',
  'detect.early.noWindow': 'a nepodarilo sa prečítať žiadne okno, čo zodpovedá tejto predpovedi',
  'detect.generic.fallback':
    'záložná možnosť: žiadna rodina firmvéru nezodpovedala s istotou, takže čítanie zostáva dostupné a zápisy nie',
  'detect.compact2016.early':
    'firmvér {version} je starší ako 0.8.0.0 a nemá obsluhu čítania pre GetFeaturedFirmwareData — to je early-compact, nie táto rodina',
  'detect.compact2016.modernSum':
    'slot sa dešifruje na kontrolný súčet {sum}, ktorý nie je cieľom tejto generácie',
  'detect.compact2016.plainArmed':
    'obyčajný dvojbajtový BeginFirmwareUpgrade aktivoval chránený slot, takže táto kamera nie je na zamknutom rade, ktorý táto rodina zdieľa s legacy-auth',
  'detect.compact2016.notLine': 'firmvér {version} nepatrí do radu 0.x / 1.x',
  'detect.compact2016.storedPlain':
    'slot je uložený v otvorenej podobe — výpočet prúdu kľúča vracia identický stav, takže jeho uložené slová SÚ obraz — čo je nešifrovaný reťazec z roku 2014; sloty tejto generácie sú xorshift128 pod skutočným kľúčom',
  'detect.compact2016.keyedZero':
    'slot uložený pod skutočným prúdom kľúča xorshift128 sa dešifruje na kontrolný súčet {sum}, čo je šifra tejto generácie',
  'detect.compact2016.zeroSum':
    'slot sa dešifruje na kontrolný súčet {sum}, čo je cieľ tejto generácie',
  'detect.compact2016.refused':
    'a chránený slot odmietol obyčajnú dvojbajtovú aktiváciu, čo je zamknutá obsluha',
  'detect.compact2016.proLine':
    '{said} firmvér {version}, rad 1.0.3.x kamery Compact PRO z roku 2016',
  'detect.compact2016.compactLine':
    '{said} firmvér {version}, zostava Compact, nie rad 1.0.3.x kamery Compact PRO',
  'detect.compact2016.lockedLine':
    '{said} firmvér {version}, na rade 0.x / 1.x, ktorý táto generácia zdieľa so zamknutým starším firmvérom',
  'detect.compact2016.bootloader2016':
    'bootloader hlási {version}, bootloader generácie 2016 (1.2.0.0 je zmeraný pod Compact PRO 1.0.3.0; bootloader kamery Compact z roku 2014 je 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'bootloader hlási {version}, číslovanie generácie 2014, nie tejto generácie',
  'detect.compact2016.none':
    'nebol pozorovaný žiadny slot, ktorý by sa pod skutočným kľúčom dešifroval na nulový kontrolný súčet',
  'detect.legacy.proLine':
    'ale firmvér {version} je rad 1.0.3.x kamery Compact PRO z roku 2016, ktorého sloty používajú šifru compact-2016: kontrola prijatia tejto rodiny by pri každom z nich zlyhala',
  'detect.legacy.early':
    'firmvér {version} je starší ako 0.8.0.0: jeho tabuľka RPC nemá obsluhu čítania pre GetFeaturedFirmwareData (pred 0.7.0.7 vôbec žiadnu a na 0.7.0.7 a 0.7.0.8 len setter) — to je early-compact, nie táto rodina',
  'detect.legacy.keyedZero':
    'slot uložený pod skutočným prúdom kľúča xorshift128 sa dešifruje na {zero} — šifra kamery Compact PRO z roku 2016 (compact-2016). Tento rad ukladá svoje sloty v otvorenej podobe so súčtom slov 0 (reťazec z roku 2014) alebo s kľúčom na {sum} (Compact 1.3.0.8) a jeho kontrola prijatia taký slot odmietne',
  'detect.legacy.plainChain':
    'slot je uložený ako otvorený firmvér, ktorého slová dávajú súčet 0, tak ako ho spúšťa bootloader z roku 2014 tohto radu',
  'detect.legacy.refused':
    'kamera odmietla otvoriť zamknutý slot na aktualizáciu, keď bola požiadaná bez odomknutia, ako to robí len táto generácia firmvéru',
  'detect.legacy.unlocked':
    'a ten istý slot otvorila, keď bola požiadaná s odomknutím, takže odomknutie, ktoré táto rodina posiela, je to, ktoré táto kamera kontroluje',
  'detect.legacy.notLine': '{said} firmvér {version}, ktorý nepatrí do staršieho radu 0.x / 1.x',
  'detect.legacy.authOnly':
    'otvorila zamknutý slot na aktualizáciu, keď bola požiadaná s odomknutím, ako to robí táto generácia firmvéru; žiadosť bez odomknutia sa neskúšala, takže to samo osebe generáciu nepreukazuje',
  'detect.legacy.version':
    'firmvér {version} patrí do staršieho radu 0.x / 1.x, čo je iný číselný rad ako verzie aplikácií po roku 2018, nie staršia 4.x',
  'detect.legacy.none': 'nič pozorované neukazuje na overený kanál čítania',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'pozastavené po behu na kamere: tam záplata nezvýšila rýchlosť publikovania snímok a uzávierka cvakala pri každej snímke po zápise',
  'fps.table.predates':
    'firmvér {version} je starší ako 0.8.0.0: jeho tabuľka RPC nemá obsluhu čítania pre GetFeaturedFirmwareData, príkaz, ktorý posiela čítanie slotu, takže čítanie a zápis slotov nepracujú so žiadnym slotom tejto zostavy a záplata sa neponúka',
  'fps.table.stageTwoFf':
    'stage two: zostava 16 Hz FF sa odovzdáva tak, ako ju odovzdáva aplikácia výrobcu (obraz XOR kľúč A, uložený pod kľúčom B), nie ako otvorené bajty, takže sa jej kontrola odovzdania nevykonáva a záplata sa zatiaľ neponúka',
  'fps.table.stageTwo':
    'stage two: táto položka nie je v sade stage two, takže sa jej kontrola odovzdania nevykonáva a záplata sa zatiaľ neponúka',
  'fps.table.notOffered': 'neponúka sa',
  'fps.table.notImage':
    'toto nie je obraz firmvéru, takže sa naň žiadna záplata snímkovej frekvencie nevzťahuje',
  'fps.table.otherBuild':
    'obraz je zostava {image}, ale kamera hlási {camera}; záplata sa radšej odmietne, než aby sa použila na zostavu, ktorej nezodpovedá',
  'fps.table.otherBuildNoVersion':
    'obraz je zostava {image}, ale kamera nehlási žiadnu verziu; záplata sa radšej odmietne, než aby sa použila na zostavu, ktorej nezodpovedá',
  'fps.table.patched': 'záplata snímkovej frekvencie už je použitá: tento obraz beží na {hz} Hz',
  'fps.table.earlierPatch':
    'tento obraz obsahuje skoršiu záplatu snímkovej frekvencie {hz} Hz bez opravy USB a záplata sa nikdy nepoužije na záplatovaný obraz: obnovte pôvodný obraz a potom ho záplatujte',
  'fps.table.atRate': 'táto zostava už beží na {hz} Hz bez záplaty',
  'fps.table.not4821':
    'tento obraz hlási zostavu Compact 4.8.2.1 (alebo Compact XR 4.8.2.1, tú istú zostavu), ale nie je to pôvodný obraz, pre ktorý bola záplata snímkovej frekvencie napísaná (f96ac57eda75: jeho stránky príkazov s 68 bajtmi, stála stránka 13), takže sa preň žiadna záplata snímkovej frekvencie nevytvorí',
  'fps.table.notInTable':
    'tento obraz nie je v tabuľke záplat snímkovej frekvencie, takže sa pre túto zostavu žiadna záplata nevytvorí. Tabuľka uvádza zostavy Compact 0.7.0.8 až 1.3.0.8 (8 Hz; 0.7.0.8 kód slotov odmieta), 1.3.0.8 (16 Hz FF), 4.8.1.7, 4.8.1.9, 4.8.2.1 a 4.16.1.7 FF a zostavy Compact PRO 1.0.3.x a 4.9.x; žiadna iná zostava položku nemá',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'plán tejto zostavy nemá {bank:acc}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank} na tejto zostave nemôže prijať dešifrovaný obraz: {reason}',
  'fps.plan.empty': 'v {bank:loc} nie je žiadny dešifrovaný obraz na záplatovanie (je prázdny)',
  'fps.plan.noImage':
    'v {bank:loc} nie je žiadny dešifrovaný obraz na záplatovanie (neprečítal sa alebo ho neotvorí žiadny kľúč)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name} sa zapísal, ale jeho kontrolné čítanie sa od uloženého slotu nelíši len podľa plánu, takže sa sloty po ňom nezapísali',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build (slots/capability-notes) ----
   * The page shows only this one; it leaves the others out (lib/page-hidden.ts), and the CLI prints them
   * in English. */
  'notes.unverified':
    'Len na čítanie. Rozloženie slotov zodpovedá dekódovanej tabuľke zamknutého radu, ale pre túto zostavu sa nezmerala žiadna podoba odovzdania, takže sa neplánuje žiadny zápis.',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'kamera nenahlásila verziu firmvéru ({note}); číslo príkazu neznamená na každom firmvéri Seek to isté — na Compact 0.3.0.1 je wire id 0x52, id, ktoré aktivuje okno čítania, EnterBootloaderMode — takže kým verzia nie je známa, neposiela sa nič okrem GetErrorCode, GetOperationMode a GetFirmwareInfo, čítaní, na ktoré odpovedá každá zostava rovnako',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo neodpovedal ({error}) na žiadne z {reads} čítaní s odstupom {spacing} ms, v okne štartu {window} ms; kamera, ktorá práve štartuje, v ňom odpovie',
  'identity.note.neverTwice':
    'GetFirmwareInfo nikdy neodpovedal dvakrát po sebe počas {reads} čítaní',
  'identity.note.noAnswer': 'GetFirmwareInfo neodpovedal ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo neodpovedal ({error}); odpovedalo {answered} z {reads} čítaní, nikdy dve po sebe, takže žiadne z nich nemožno odlíšiť od záznamu, ktorý nechal vybraný skorší príkaz',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo vrátil {count} bajt, na verziu príliš málo',
    few: 'GetFirmwareInfo vrátil {count} bajty, na verziu príliš málo',
    many: 'GetFirmwareInfo vrátil {count} bajtu, na verziu príliš málo',
    other: 'GetFirmwareInfo vrátil {count} bajtov, na verziu príliš málo',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo vrátil {count} bajt, na verziu príliš málo; {context}',
    few: 'GetFirmwareInfo vrátil {count} bajty, na verziu príliš málo; {context}',
    many: 'GetFirmwareInfo vrátil {count} bajtu, na verziu príliš málo; {context}',
    other: 'GetFirmwareInfo vrátil {count} bajtov, na verziu príliš málo; {context}',
  },
  'identity.note.otherRecord':
    'prvé čítanie vrátilo iný záznam ({version}), na ktorom skorší príkaz nechal selektor informácií o firmvéri — toto čítanie ho vynulovalo',
  'identity.note.afterStartup': {
    one: 'odpovedal potom, ako počas štartu odmietol {count} čítanie',
    few: 'odpovedal potom, ako počas štartu odmietol {count} čítania',
    many: 'odpovedal potom, ako počas štartu odmietol {count} čítania',
    other: 'odpovedal potom, ako počas štartu odmietol {count} čítaní',
  },
  'identity.predates':
    'firmvér {version} je starší ako protokol výpisu: jeho tabuľka metód RPC nemá obsluhu čítania pre GetFeaturedFirmwareData (na 0.7.0.7 a 0.7.0.8 je zaregistrovaná len ako setter a predtým je wire id 0x4F UploadFirmwareRowSize), takže s ňou nemožno prečítať žiadne okno; na 0.3.0.1 je wire id 0x52 EnterBootloaderMode namiesto BeginFirmwareUpgrade. Beh na karte 0.x/1.x namiesto toho číta 0.7.0.7 a 0.7.0.8 cez wire id 0x58 (GetFeaturedData)',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'odmieta sa {operation}: {reason}',
  'identity.refusingNoVersion':
    'odmieta sa {operation}: {reason}. Nič sa neaktivovalo. Odpojte kameru, znova ju pripojte, nechajte ju dokončiť štart a skúste to znova.',
  'identity.operation.dump': 'výpis',
  'identity.operation.dumpAll': 'vypísanie všetkých selektorov',
  'identity.operation.readInfo': 'čítanie informácií o zariadení',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'sloty sa volia po zálohe, ktorá ich číta — najprv spustite zálohu',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'po prebehnutí alebo pokuse o potvrdenie zápisu už sloty nemožno zmeniť: tento beh zapisuje: {banks}; obnovenie vráti presne tieto sloty',
  'preserve.banks.none': 'žiadny slot',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Zapísané.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Prečítané. Čitateľné sloty: {count}/{of}.',
  'status.readRefused':
    'Prečítané, ale do žiadneho slotu tejto kamery sa odtiaľto nedá zapisovať — pozrite si protokol.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Verzia firmvéru',
  'compare.field.imageId': 'ID obrazu',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'Počiatočný SP',
  'compare.field.resetVector': 'Vektor resetu',
  'compare.field.size': 'Veľkosť',
  'compare.field.shaExpected': 'SHA-256 očakávaného otvoreného obrazu',
  'compare.field.sha': 'SHA-256 obrazu',
  'compare.field.shaNotStored':
    'SHA-256 očakávaného otvoreného obrazu (uložené bajty sa nepredpovedajú)',
  'compare.field.key': 'Kľúč',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(žiadny obraz)',
  'compare.notImage': '(nie je obraz)',
  'compare.notPredicted': '(nepredpovedá sa: o tom, čo uloží, rozhoduje zariadenie)',
  'compare.plaintext': 'žiadny (otvorený text)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'sa nedal dvakrát prečítať rovnako',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (kľúč, pod ktorým bootloader kontroluje slot, je odvodený zo {bank:gen}, do ktorého vstúpil bez kontroly) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered': '{bank}, ako ho kamera zaznamenáva (slovo aktívneho slotu {word})',
  'preserve.lastStart.notRead': 'neznáme — slovo aktívneho slotu sa nepodarilo prečítať',
  'preserve.lastStart.noBank':
    'neznáme — slovo aktívneho slotu je {word}, čo neoznačuje žiadny slot',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'neznáme — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'nezapisuje sa — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'obraz',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — dá sa zapísať',
  'preserve.bank.writablePatch': '{build} — dá sa zapísať; záplata mení {count} B',
  'preserve.bank.writableEdit': '{build} — dá sa zapísať; obsahuje {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — dá sa zapísať; záplata mení {count} B; obsahuje {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead': 'záloha sloty ešte neprečítala, takže nemožno zvoliť žiadny slot',
  'preserve.choice.every': 'každý slot, ktorý obsahuje obraz: {banks}',
  'preserve.choice.everyBlocked':
    'nie každý slot, ktorý obsahuje obraz, sa dá zapísať: {bank} nie — {reason}',
  'preserve.choice.noImage': 'žiadny slot neobsahuje obraz, ktorý by beh mohol zapísať',
  'preserve.choice.nextStart': '{bank}, slot, do ktorého vstúpi ďalší štart: {why}',
  'preserve.choice.nextStartRefused':
    'ďalší štart vstúpi do {bank:gen} ({why}) a beh ho nemôže zapísať: {reason}',
  'preserve.choice.everyUnknownStart':
    'každý slot, ktorý obsahuje obraz ({banks}): nie je známe, do ktorého slotu vstúpi ďalší štart ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'nie je známe, do ktorého slotu vstúpi ďalší štart ({why}), a {reason}; zvoľte slot podľa názvu',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank} sa nedá zapísať: {reason}',
  'preserve.choice.byName': '{banks}, slot zvolený podľa názvu',
  'preserve.choice.warnNotPatched':
    'Ďalší štart vstúpi do {bank:gen} ({why}) a táto voľba ho nezáplatuje: po reštarte kamera spustí vlastný obraz tohto slotu, takže sa čítanie celej pamäte flash zastaví skôr, než čokoľvek prečíta. Obnovenie napriek tomu vráti každý zapísaný slot.',
  'preserve.choice.warnUnknownStart':
    'Nie je známe, do ktorého slotu vstúpi ďalší štart ({why}). Ak vstúpi do slotu, ktorý táto voľba nezáplatuje, čítanie celej pamäte flash sa zastaví skôr, než čokoľvek prečíta.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'zatiaľ neznáme',
  'preserve.build.firmware': 'firmvér {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'tak, ako ho kamera ukladá (táto kamera uchováva firmvér nešifrovaný)',
  'preserve.stagedForm.oneKey': 'v podobe, v akej ho kamera ukladá (zašifrovaný kľúčom kamery)',
  'preserve.stagedForm.twoKeys':
    'v podobe, v akej ho kamera ukladá (zašifrovaný dvoma kľúčmi kamery)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'každý zapísaný slot dostane späť presne tie bajty, ktoré z neho prečítala záloha',
  'preserve.restoreForm.factoryStaged':
    'každý zapísaný slot dostane späť svoj pôvodný firmvér, zapísaný v podobe, v akej ho kamera ukladá, takže slot skončí bajt po bajte tak, ako ho prečítala záloha',
  'preserve.restoreForm.none':
    'na tejto zostave nie je možné: žiadna podoba pôvodného firmvéru neprejde vlastnou kontrolou kamery a zároveň sa neuloží späť ako pôvodné bajty, takže beh skončí s úplným obrazom a záplatou stále na mieste',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'na tejto zostave nie je možné: záplatovaný firmvér nedokáže prečítať celú pamäť flash, takže beh nemá úplný obraz, ktorý by mohol dať',
  'preserve.drain.rotated': 'kamera ju poskytuje pootočenú a beh ju vráti do správneho poradia',
  'preserve.drain.hazard': 'záplata sa na tejto zostave vyhne čítaniu, ktoré kameru zhodí',
  'preserve.drain.whole': 'celá pamäť flash (4 MB) jedným čítaním, po {size} B',
  'preserve.drain.wholeNotes': 'celá pamäť flash (4 MB) jedným čítaním, po {size} B; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'umožní príkazu na čítanie kamery dosiahnuť na celú pamäť flash (4 MB), nie len na prvých 64 KB',
  'preserve.site.countPast':
    'umožní pozícii čítania počítať za 64 KB, aby sa čítanie nevrátilo na začiatok',
  'preserve.site.keepPosition': 'zachová celú pozíciu čítania, keď sa po každom čítaní posunie',
  'preserve.site.savePosition': 'uloží posunutú pozíciu čítania celú',
  'preserve.site.clearPosition':
    'vynuluje celú pozíciu čítania na začiatku každého čítania, aby sa kamera dala prečítať aj po čítaní celej pamäte flash',
  'preserve.site.modeTwoGuard':
    'umožní začať čítanie celej pamäte flash ako akékoľvek iné čítanie (pôvodný firmvér ho odmietne)',
  'preserve.site.modeTwoIndirection':
    'nasmeruje čítanie celej pamäte flash na začiatok pamäte flash (pôvodný firmvér ho smeruje na hodnotu, ktorá kameru zhodí)',
  'preserve.site.armTail':
    'odstráni volanie, ktoré na tejto zostave kameru pri začatí čítania zmrazí',
  'preserve.site.other': 'zmení jednu inštrukciu, ktorú čítanie celej pamäte flash potrebuje',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Záloha',
  'preserve.step.patch': 'Záplata',
  'preserve.step.commit': 'Zápis',
  'preserve.step.drain': 'Čítanie celej pamäte flash',
  'preserve.step.restore': 'Obnovenie',
  'preserve.step.verify': 'Kontrola',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'krok záplata',
  'preserve.stepId.commit': 'krok zápis',
  'preserve.stepId.drain': 'krok čítanie celej pamäte flash',
  'preserve.stepId.restore': 'krok obnovenie',
  'preserve.stepId.verify': 'krok kontrola',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: zastavené podľa plánu — kamera naštartovala zo {bank:gen}, ktorý tento beh nezáplatoval, takže sa nič neprečítalo.',
  'preserve.result.noReason': 'nebol zaznamenaný žiadny dôvod',
  'preserve.result.stopped': '{label}: zastavené — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none': 'žiadny slot neobsahuje firmvér, ktorý by beh mohol záplatovať',
  'preserve.result.writable.one': 'v {banks:loc} je firmvér, ktorý beh môže záplatovať',
  'preserve.result.writable.many': 'v {banks:loc} je firmvér, ktorý beh môže záplatovať',
  'preserve.result.backup':
    '{label}: uložil sa každý blok, na ktorý dosiahne bežné čítanie; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'neznámy slot',
  'preserve.result.backupNext':
    '{label}: uložil sa každý blok, na ktorý dosiahne bežné čítanie; {writable}; ďalší štart: {next}.',
  'preserve.result.patch': '{label}: zostavené pre {banks:acc}.',
  /** The patch step when every bank was refused: nothing to build for. */
  'preserve.result.patchNone':
    '{label}: žiadna záplata sa nezostavila: žiadny slot neobsahuje firmvér, ktorý by beh mohol záplatovať.',
  'preserve.result.patchCount': '{label}: zostavené pre {banks:acc}; v každom sa mení {count} B.',
  'preserve.result.commitOne': '{label}: do {banks:gen} sa zapísala záplata a kamera ju prijala.',
  'preserve.result.commitMany':
    '{label}: do {banks:gen} sa zapísala záplata a kamera ju pri každom prijala.',
  'preserve.result.drainNotRead': '{label}: neprečítané.',
  'preserve.result.drain':
    '{label}: celá pamäť flash (4 MB) prečítaná; úplný obraz má sha256 {sha256}.',
  'preserve.result.drainThrough':
    '{label}: celá pamäť flash (4 MB) prečítaná cez {bank:acc}; úplný obraz má sha256 {sha256}.',
  'preserve.result.restore': '{label}: do {banks:gen} sa zapísal späť pôvodný obsah.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}: do {banks:gen} sa zapísal späť pôvodný obsah, {form}.',
  'preserve.result.verifyDone': '{label}: hotovo.',
  'preserve.result.verifyIdentical':
    '{label}: znova prečítané bloky: {blocks}, rozdielne bajty: 0 — pamäť flash kamery je bajtovo zhodná so zálohou.',
  'preserve.result.verifyDiffers':
    '{label}: znova prečítané bloky: {blocks}, rozdielne bajty: {bytes}.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: znova prečítané bloky: {blocks}, rozdielne bajty: {bytes}, nečitateľné bloky: {count}.',
    few: '{label}: znova prečítané bloky: {blocks}, rozdielne bajty: {bytes}, nečitateľné bloky: {count}.',
    many: '{label}: znova prečítané bloky: {blocks}, rozdielne bajty: {bytes}, nečitateľné bloky: {count}.',
    other:
      '{label}: znova prečítané bloky: {blocks}, rozdielne bajty: {bytes}, nečitateľné bloky: {count}.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Zastavené pred čítaním celej pamäte flash: kamera naštartovala zo slotu, ktorý tento beh nezáplatoval, takže sa nič neprečítalo.',
  'preserve.unpatchedStart.next':
    'Ďalej: obnovenie vráti každý zapísaný slot. Čítanie celej pamäte flash sa znova neskúša: kamera by naštartovala z toho istého slotu.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Hotovo — váš firmvér je zachovaný',
  'preserve.done.detail':
    'Úplný obraz je celá pôvodná pamäť flash kamery a samotná kamera je späť presne v pôvodnom stave.',
  'preserve.done.titleNoImage':
    'Hotovo — kamera je späť v pôvodnom stave; úplný obraz nie je k dispozícii',
  'preserve.done.detailNoImage':
    'Čítanie celej pamäte flash neprebehlo, takže tento beh nemá úplný obraz pamäte flash. Každý zapísaný slot sa vrátil a nové čítanie blokov, na ktoré dosiahne bežný výpis, zodpovedá zálohe. Na úplný obraz spustite nový beh s voľbou, ktorá zahŕňa slot, do ktorého vstúpi ďalší štart.',
  'preserve.done.detailNoImageCount':
    'Čítanie celej pamäte flash neprebehlo, takže tento beh nemá úplný obraz pamäte flash. Každý zapísaný slot sa vrátil a nové čítanie blokov, na ktoré dosiahne bežný výpis (spolu {blocks}), zodpovedá zálohe. Na úplný obraz spustite nový beh s voľbou, ktorá zahŕňa slot, do ktorého vstúpi ďalší štart.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'čítačka okien kamery má na jeden štart obmedzený rozpočet a tieto čítania sa vrátili z vyčerpanej čítačky — vypnite a zapnite kameru (odpojte ju a znova pripojte alebo použite jej vypínač) a potom znova spustite `preserve --resume <run-directory>`. Signatúra: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'čítačka okien kamery má na jeden štart obmedzený rozpočet a tieto čítania sa vrátili z vyčerpanej čítačky — vypnite a zapnite kameru (odpojte ju a znova pripojte alebo použite jej vypínač) a potom znova spustite `preserve --resume <run-directory>`. Signatúra: {signature} — z týchto bajtov nemožno odvodiť žiadny továrenský otvorený text. Vyskúšali sa všetky spôsoby, ako ho prečítať:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'záloha neobsahuje {bank:acc} ({address}) — bežné okná ho nedokážu poskytnúť',
  'preserve.fail.readsDisagree':
    'dve čítania {bank:gen} sa nezhodujú (sha256 {sha256} vs. {other}) — do kamery, ktorá nedokáže dvakrát po sebe rovnako poskytnúť slot, z ktorého beží, sa zapisovať nemá; záznam je zdrojom obnovenia a vstupom na odvodenie záplaty',
  'preserve.fail.notFactory':
    'v {bank:loc} nie je továrenský obraz v podobe, v akej ho ukladá šifra tejto zostavy (očakávaný začiatok obrazu nezodpovedá záznamu) — odmieta sa skôr, než sa čokoľvek zaznamená, nieto ešte zapíše',
  'preserve.fail.ffSum':
    'záplatovaný firmvér v podobe, v akej ho kamera ukladá, neprejde vlastnou kontrolou tejto zostavy (jeho súčet musí byť {sum}) — odmieta sa poslať slot, ktorý by kamera po vymazaní odmietla',
  'preserve.fail.headChanged':
    'začiatok {bank:gen} sa od zálohy zmenil (neobsahuje pôvodný záznam ani záplatované bajty) — odmieta sa zapisovať cez neznámy stav slotu; nič sa nezapísalo. Hex začiatku: aktuálne {live} vs. záznam {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks} už obsahuje záplatované bajty — potvrdenie zápisu prebehlo pri predchádzajúcom pokuse a nesmie sa opakovať. Pokračujte krokom čítania celej pamäte flash (--resume), ktorý spustí záplatovaný obraz a pokračuje odtiaľ.',
  'preserve.fail.landed':
    '{banks} už obsahujú záplatované bajty — potvrdenie zápisu prebehlo pri predchádzajúcom pokuse a nesmie sa opakovať. Pokračujte krokom čítania celej pamäte flash (--resume), ktorý spustí záplatovaný obraz a pokračuje odtiaľ.',
  'preserve.fail.drainRebootRefused':
    'príkaz na reštart v kroku čítania celej pamäte flash hostiteľ ODMIETOL skôr, než odišiel (SecurityError: zásada prehliadača alebo testovacia poistka), takže v kamere stále beží obraz, s ktorým naštartovala, nie potvrdená záplata. Čítanie celej pamäte flash číta len cez rozšírené okno záplatovaného obrazu, takže sa zastaví skôr, než čokoľvek aktivuje; nič sa neprečítalo. Spustite čítanie celej pamäte flash znova tam, kde hostiteľ príkaz na reštart prepustí.',
  'preserve.fail.shiftedRebootRefused':
    'čítanie celej pamäte flash sa vrátilo posunuté o stránku a reštart, ktorý vyvolá ďalší štart, hostiteľ ODMIETOL skôr, než odišiel (SecurityError: zásada prehliadača alebo testovacia poistka) — ďalší pokus by čítal ten istý posunutý štart. Nič sa neuchovalo; spustite čítanie celej pamäte flash znova tam, kde reset môže odísť.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'kontrola našla {count} rozdielny bajt v oknách {read}/{total} — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
    few: 'kontrola našla {count} rozdielne bajty v oknách {read}/{total} — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
    many: 'kontrola našla {count} rozdielneho bajtu v oknách {read}/{total} — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
    other:
      'kontrola našla {count} rozdielnych bajtov v oknách {read}/{total} — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
  },
  'preserve.fail.verifyIn': {
    one: 'kontrola našla {count} rozdielny bajt v oknách {read}/{total} (miesta: {places}) — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
    few: 'kontrola našla {count} rozdielne bajty v oknách {read}/{total} (miesta: {places}) — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
    many: 'kontrola našla {count} rozdielneho bajtu v oknách {read}/{total} (miesta: {places}) — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
    other:
      'kontrola našla {count} rozdielnych bajtov v oknách {read}/{total} (miesta: {places}) — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
  },
  'preserve.fail.verifyShort': {
    one: 'kontrola našla {count} rozdielny bajt v oknách {read}/{total} (krátke okná: {short}) — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
    few: 'kontrola našla {count} rozdielne bajty v oknách {read}/{total} (krátke okná: {short}) — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
    many: 'kontrola našla {count} rozdielneho bajtu v oknách {read}/{total} (krátke okná: {short}) — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
    other:
      'kontrola našla {count} rozdielnych bajtov v oknách {read}/{total} (krátke okná: {short}) — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
  },
  'preserve.fail.verifyInShort': {
    one: 'kontrola našla {count} rozdielny bajt v oknách {read}/{total} (miesta: {places}) (krátke okná: {short}) — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
    few: 'kontrola našla {count} rozdielne bajty v oknách {read}/{total} (miesta: {places}) (krátke okná: {short}) — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
    many: 'kontrola našla {count} rozdielneho bajtu v oknách {read}/{total} (miesta: {places}) (krátke okná: {short}) — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
    other:
      'kontrola našla {count} rozdielnych bajtov v oknách {read}/{total} (miesta: {places}) (krátke okná: {short}) — pamäť sa pri opätovnom čítaní nezhoduje bajt po bajte so zálohou',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'blok konfigurácie štartu',
  'preserve.fail.dataBlock': 'dátový blok',

  'preserve.refused.secondRead': 'jeho druhé čítanie zlyhalo ({error})',
  'preserve.refused.readsDisagree': 'jeho dve čítania sa nezhodujú (sha256 {sha256} vs. {other})',
  'preserve.refused.erased': 'je vymazaný',
  'preserve.refused.watchdogMark':
    'jeho slovo hlavičky na +0x200 obsahuje {word}, značku, ktorú bootloader zapíše cez slot po resete watchdogu na začiatku štartu; bootloader tento slot už neprijíma a beh v ňom nemá obraz na záplatovanie',
  'preserve.refused.noHeader': 'na +0x200 nemá hlavičku obrazu',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'obsahuje {image} ({id}), nie zostavu, ktorá v kamere beží ({camera})',
  'preserve.refused.otherKey':
    'kontrola bootloadera ho odmieta: je uložený pod iným kľúčom, než pod ktorým bootloader tejto kamery kontroluje sloty, a zápis cez kameru by ho uložil pod tým kľúčom, takže by obnovenie nedokázalo vrátiť jeho presné bajty',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'kamera hlási firmvér {camera}, očakáva sa {version} — záplata je odvodená z bajtov jednej zostavy a nesmie sa poslať do inej',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'firmvér {version} nie je zostava 0.x ani 1.x a tento beh pokrýva len zostavy z rokov 2014 a 2016. Okrem verzie sa nič neprečítalo. Túto kameru namiesto toho prečítajte na karte „Výpis a dešifrovanie 4.x/Nano“: prečíta pamäť flash bez záplaty, každý blok okrem toho na 0x14060000, na ktorý na týchto zostavách nedosiahne žiadne okno čítania.',
  'preserve.refused.preWidening':
    'firmvér {version} je starší ako cesta rozšírenia a beh radšej odmietne, než aby zapisoval cez slot, ktorý nedokáže spätne prečítať. Na tejto generácii kamera odmieta každý spôsob začatia čítania, ktorý cesta potrebuje (zmerané na 0.3.0.1), jej príkaz na čítanie nedosiahne na začiatok pamäte flash a veľkosť, ktorú by záplata zmenila, je uložená inak. Nemá ani čítanie, ktoré by mohol použiť bežný výpis. Okrem verzie sa nič neprečítalo.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'obsahuje neznámy obraz (nie pôvodný firmvér {version} ani jeho známu úpravu), takže ho beh nezáplatuje ani nevráti',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'obsahuje známu zostavu so záplatou snímkovej frekvencie: pôvodný firmvér {version} so záplatou snímkovej frekvencie {hz} Hz. Beh záplatuje len pôvodný firmvér, nikdy záplatovaný obraz, takže tento slot nezáplatuje ani nevráti',
  'preserve.image.frameRateEarlier':
    'obsahuje známu zostavu so záplatou snímkovej frekvencie: pôvodný firmvér {version} so skoršou záplatou snímkovej frekvencie {hz} Hz (vytvorenou skôr, než k nej pribudla oprava USB). Beh záplatuje len pôvodný firmvér, nikdy záplatovaný obraz, takže tento slot nezáplatuje ani nevráti',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    '{what}. Ak chcete tento slot zahrnúť, najprv doň zapíšte späť pôvodný obraz (napríklad z úplnej zálohy pamäte flash vytvorenej pred zmenou) a potom spustite nový beh',
  'preserve.image.frameRateWords':
    '{what}. Ak chcete tento slot zahrnúť, najprv doň zapíšte späť pôvodný obraz (napríklad z úplnej zálohy pamäte flash vytvorenej pred záplatou snímkovej frekvencie) a potom spustite nový beh; záplatu snímkovej frekvencie možno na pôvodnom obraze potom vytvoriť znova',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name} {what}. Beh berie firmvér, ktorý záplatuje, z tohto slotu, takže sa zastaví tu, skôr než sa čokoľvek zapíše. Ak chcete túto kameru zachovať, najprv zapíšte späť pôvodný obraz do {bank:gen} (napríklad z úplnej zálohy pamäte flash vytvorenej pred zmenou) a potom spustite nový beh.',
  'preserve.image.frameRateRefusal':
    '{name} {what}. Beh berie firmvér, ktorý záplatuje, z tohto slotu, takže sa zastaví tu, skôr než sa čokoľvek zapíše. Ak chcete túto kameru zachovať, najprv zapíšte späť pôvodný obraz do {bank:gen} (napríklad z úplnej zálohy pamäte flash vytvorenej pred záplatou snímkovej frekvencie) a potom spustite nový beh; záplatu snímkovej frekvencie možno na pôvodnom obraze potom vytvoriť znova.',
  'preserve.image.otherFirmware': 'obsahuje firmvér {image}, nie {camera}, ktorý beží v kamere',
  'preserve.image.otherFirmwareRefusal':
    '{name} obsahuje firmvér {image}, nie {camera}, ktorý beží v kamere, takže tento beh v ňom nemá obraz, ktorý by mohol záplatovať, a radšej odmietne, než aby ho prepísal.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'neodvodzuje sa z neho žiadny obraz, ktorý by beh mohol záplatovať ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone': 'tento beh je hotový — všetky kroky sú dokončené (beh {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    'krok {step} je v tomto behu už hotový (dokončené {finished}) — pokračovanie nadviaže krokom {next}',
  'preserve.gate.stepDoneUnknownTime':
    'krok {step} je v tomto behu už hotový (dokončené v neznámom čase) — pokračovanie nadviaže krokom {next}',
  'preserve.gate.backupRerun':
    'zálohu nemožno spustiť znova: tento beh už dokončil {steps} a jeho ďalší krok je {next} — použite --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'predchádzajúci pokus o zálohu zlyhal a kameru treba VYPNÚŤ A ZNOVA ZAPNÚŤ, skôr než tento krok pobeží znova — opakovanie na tom istom štarte môže prečítať zastarané alebo prázdne bajty (zmerané: opakovaná záloha prečítala namiesto záznamu konfigurácie štartu štartovacie slovo bootloadera). Vypnite a zapnite kameru (odpojte ju a znova pripojte alebo použite jej vypínač), potom spustite zálohu znova a na vyzvanie vypnutie a zapnutie potvrďte: beh to sám nevidí. Zaznamenané zlyhanie: {error}',
  'preserve.gate.noErrorText': '(bez textu chyby)',
  'preserve.gate.patchAfterBackup':
    '{step} beží po zálohe: beh vezme výpis každej oblasti, ktorú dokáže prečítať bežný plán, a uloží ho SKÔR, než sa stane čokoľvek iné — táto záloha je jediná kópia tejto kamery. Najprv spustite krok zálohy.',
  'preserve.gate.commitAfterBackup': '{step} beží po zálohe (pozri krok záplata)',
  'preserve.gate.commitAfterPatch': '{step} beží po kroku záplata, ktorý zaznamená, čo odovzdáva',
  'preserve.gate.commitNeedsPatch':
    '{step} potrebuje záplatu {banks:gen} a krok záplata žiadnu nezaznamenal — spustite krok záplata znova',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step} vyžaduje v adresári behu súbory zálohy a tie chýbajú: {files} — bez nich nemá potvrdenie zápisu zdroj na obnovenie, takže odmieta',
  'preserve.gate.drainNoCommit':
    '{step} číta ZÁPLATOVANÚ časť cez rozšírené okno a tento beh nemá dokončené potvrdenie zápisu — na pôvodnej kamere by sa čítanie zaseklo. Najprv spustite potvrdenie zápisu (alebo v ňom pokračujte), alebo preskočte výslovne (allowJump), ak potvrdenie prebehlo bez svojho kontrolného bodu.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'krok čítania celej pamäte flash odmieta pre {build}: {note}',
  'preserve.gate.detectedBuild': 'zistená zostava',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'krok čítania celej pamäte flash odmieta pre {build}: začatie čítania celej pamäte flash na nezáplatovanom firmvéri tejto zostavy kameru zhodí (číta z hodnoty, ktorá nie je adresou v pamäti flash; zmerané na emulátore: poskytnutých 32 KB, potom kamera spadla). Zmena, ktorá čítanie zabezpečí, je na {sites} a nie je medzi zmenami, ktoré tento beh zaznamenal pre {bank:acc} — pred čítaním celej pamäte flash spustite krok záplata (a dokončite zápis).',
  'preserve.gate.drainFiles':
    '{step} potrebuje {files} (dodaný výpis sa dodatočne spracuje so záznamom každého zapísaného slotu) a v adresári behu to nie je',
  'preserve.gate.restoreNoCommit':
    '{step} vracia pôvodné sloty cez záplatu a tento beh nemá dokončené potvrdenie zápisu — nie je čo vracať. Najprv spustite potvrdenie zápisu (alebo v ňom pokračujte), alebo preskočte výslovne (allowJump), aby ste obnovili už záplatovanú kameru.',
  'preserve.gate.restoreNeedsPatch':
    '{step} potrebuje súhrn záplaty každého zapísaného slotu (kvôli dĺžke na odovzdanie) — najprv spustite krok záplata',
  'preserve.gate.restoreNoForm':
    'krok obnovenia odmieta pre {build}: žiadna podoba pôvodného firmvéru neprejde vlastnou kontrolou kamery a zároveň sa neuloží späť ako pôvodné bajty — kontrolný súčet pôvodného firmvéru je 0xB7AB9D17 (zmerané), nie 0xFFFF, ktoré kamera vyžaduje. Tento beh skončí s úplným obrazom v ruke a záplatou na mieste; pôvodný obsah možno vrátiť len programátorom celej pamäte flash.',
  'preserve.gate.restoreFiles':
    '{step} potrebuje {files} (pôvodný obsah každého zapísaného slotu z kroku zálohy) a v adresári behu to nie je',
  'preserve.gate.verifyNoRestore':
    '{step} porovnáva nový štart so zálohou a tento beh nemá dokončené obnovenie — záplatovaný slot by sa ukázal ako rozdiely. Najprv spustite obnovenie (alebo v ňom pokračujte), alebo preskočte výslovne (allowJump), ak obnovenie prebehlo bez svojho kontrolného bodu.',
  'preserve.gate.verifyNeedsBackup':
    '{step} potrebuje {file} (referenciu na porovnanie) a v adresári behu nie je',
  'preserve.gate.needsBanks':
    '{step} potrebuje sloty, ktoré prečítal krok zálohy, a stav žiadne nemá',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'pre tento beh nie sú zvolené žiadne sloty: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank} sa nedá zapísať: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'záplata tejto zostavy štartuje len zo slotu na obnovu R: {note} — beh by zapísal {bank:acc}, odkiaľ ho bootloader nikdy nespustí',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'súbor je príliš malý na hlavičku obrazu',
  'slots.image.notWordSized': 'veľkosť obrazu musí byť násobkom 4 (zadané {size} B)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'obraz má {size} B; bootloader odmietne akékoľvek header.length >= {limit}, takže by nikdy nenaštartoval',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'na {at} nie je hlavička obrazu (magic {magic}, očakávané {expected}) — musí ísť o dešifrovaný obraz firmvéru Seek, nie o zašifrovaný slot ani výpis pamäte flash',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'počiatočný ukazovateľ zásobníka {address} neleží v SRAM LPC43xx — nevyzerá to ako dešifrovaný obraz',
  'slots.image.stackUnaligned':
    'počiatočný ukazovateľ zásobníka {address} nie je zarovnaný na slovo',
  'slots.image.notThumb': 'vektor resetu {address} nie je adresa Thumb',
  'slots.image.noKeyPair':
    'názov tohto súboru neuvádza jeho dvojicu kľúčov a v obraze sa práve raz nevyskytuje ani dvojica tejto kamery, ani dekódovaná dvojica aplikácie, takže sa nedá zistiť, pre aké kľúče bol obraz zostavený. Dešifrované súbory sa pomenúvajú podľa kľúčov, ktoré obsahujú.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'názov súboru uvádza kľúč A {keyA} a kľúč B {keyB}, ale {mismatch}. Oba kľúče musia byť prítomné, každý práve raz.',
  'slots.image.keyInHeader':
    'tento obraz má kľúč na {at}, vnútri okna nešifrovanej hlavičky — odmieta sa ho záplatovať',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'kľúč A a kľúč B z názvu súboru vychádzajú na prekrývajúce sa bajty na {at} a {other} — musia to byť dve odlišné hodnoty so 16 bajtmi',
  'slots.image.retargetLost':
    'po precielení obraz neobsahuje dvojicu kľúčov tejto kamery práve raz — odmieta sa zostaviť údaje, pre ktorých neskoršie aktualizácie by bootloader nemal kľúč',
  'slots.image.noStageKey':
    'obraz neobsahuje žiadnu dvojicu kľúčov radu 2016, takže nie je kľúč na odovzdanie, ktorým by sa zakódoval',
  'slots.image.ffSumNoKeys':
    'tento obraz má súčet slov 16 Hz FF 0xFFFF, ale neobsahuje dvojicu kľúčov 1.3.0.8-FF (obe polovice, každú raz), takže jeho podobu na odovzdanie nemožno zostaviť. Nič sa nezapísalo.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'toto je obraz 1.3.0.8 FF (16 Hz), ktorý sa odovzdáva vo svojej vlastnej podobe s kľúčom A (ff-form.ts), nie ako otvorený obraz. Nič sa nezapísalo.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'plán bol zostavený pre firmvér {firmware}, ale analýza číta {version}. Plán je zastaraný; zostavte ho znova. Nič sa nezapísalo.',
  'slots.plan.otherFirmwareUnknown':
    'plán bol zostavený pre firmvér neznámej verzie, ale analýza číta {version}. Plán je zastaraný; zostavte ho znova. Nič sa nezapísalo.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'plán bol zostavený pre kameru {planSerial}, ale analýza číta {serial}. Zápis sa tu odmieta. Nič sa nezapísalo.',
  'slots.plan.cameraUnknownSerial': 's neznámym sériovým číslom',
  'slots.plan.unknownSerial': 'neznáme sériové číslo',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, inside the sentence ("slot A"). */
  'slots.plan.otherAddress': 'plán mieri na {address}, ale {name} tejto zostavy je na {at}',
  'slots.plan.notRead': 'analýza už nečíta {name:acc}. Nič sa nezapísalo.',
  'slots.plan.edited':
    'kontrolný súčet plánu nezodpovedá jeho údajom, takže plán bol upravený. Nič sa nezapísalo.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'údaje majú {size} B, viac, než pojme {name}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck': '{risk}. Zápis doň vyžaduje acknowledgeRisk: true. Nič sa neodoslalo.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'táto kamera odtiaľto nemôže prijať obraz odovzdaný v otvorenej podobe: {reason}. Nič sa nezapísalo.',
  'slots.plan.noKeyTable':
    'analýza neuvádza tabuľku kľúčov bootloadera tejto kamery, takže obraz na ňu nemožno precieliť',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'stav potvrdenia sa po CompleteMemoryUpgrade nepodarilo prečítať, takže {name} môže byť zapísaný len čiastočne. Skôr než urobíte čokoľvek ďalšie, prečítajte sloty znova a výpis si ponechajte.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'kamera odmietla zápis do {name:gen} pri potvrdení so stavom {status}: {cause}. Nič sa nezapísalo; slot je bez zmeny. Skôr než urobíte čokoľvek ďalšie, prečítajte sloty znova.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade vrátil {status} ({cause}) pre {name:acc}: nič sa nenaprogramovalo, ale mazanie mohlo začať, takže slot môže byť čiastočne vymazaný. Skôr než urobíte čokoľvek ďalšie, prečítajte sloty znova a výpis si ponechajte.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade vrátil {status} ({cause}) — {name} môže byť zapísaný len čiastočne. Skôr než urobíte čokoľvek ďalšie, prečítajte sloty znova a výpis si ponechajte.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'kamera nahlásila {status} pri odovzdávaní {name:gen} na offsete {offset} — prerušené pred CompleteMemoryUpgrade, takže sa do pamäte flash nič nezapísalo',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum': 'kontrolný súčet prenosu nezodpovedá odovzdaným bajtom',
  'commit.cause.unsupported':
    'obraz sa pod kľúčmi kamery nedešifroval alebo je typ údajov odmietnutý',
  'commit.cause.acceptance':
    'obraz odmietla jeho kontrola prijatia skôr, než sa čokoľvek vymazalo (kontrola závisí od zostavy)',
  'commit.cause.notArmed': 'nebola aktivovaná žiadna aktualizácia slotu',
  'commit.cause.eraseFailed': 'fáza mazania zlyhala',
  'commit.cause.programFailed': 'fáza programovania zlyhala',
  'commit.cause.verifyFailed': 'fáza overenia zlyhala',
  'commit.cause.unknown': 'stav, ktorý tu nie je známy',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name} sa nekopíruje sám na seba. Nič sa nezapísalo.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Nič sa nezapísalo.',
  'copy.refused.noPlain':
    'V {name:loc} nie je žiadny dešifrovaný obraz na kopírovanie. Nič sa nezapísalo.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} je ZIP, ktorý sa tu nedá prečítať ({error}). Nič sa nezapísalo.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} neobsahuje celú pamäť flash. ZIP sa prijme, ak je to súbor behu z karty 0.x/1.x, ktorý obsahuje {preserve} (keď prebehol jeho krok úplného výpisu), zip z karty „Výpis a dešifrovanie 4.x/Nano“ ({dump}) alebo zip z „Vypísať všetky selektory“ ({selectors}); tento ZIP obsahuje {names}. Nič sa nezapísalo.',
  'restore.refused.noWholeFlashPatched':
    '{file} neobsahuje celú pamäť flash. ZIP sa prijme, ak je to súbor behu z karty 0.x/1.x, ktorý obsahuje {preserve} (keď prebehol jeho krok úplného výpisu), zip z karty „Výpis a dešifrovanie 4.x/Nano“ ({dump}) alebo zip z „Vypísať všetky selektory“ ({selectors}); tento ZIP obsahuje {names}. Súbor {patched} v ňom je pamäť flash s dočasnou záplatou behu, takže sa neprijme. Nič sa nezapísalo.',
  'restore.refused.zipEmpty': 'nič',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'úplná záloha pamäte flash má {full} B (4 MB, celý čip, ktorý prečíta J-Link); {file} má {size} B. Nič sa nezapísalo.',
  'restore.refused.noBank': 'plán tejto zostavy nemá {bank:acc}. Nič sa nezapísalo.',
  'restore.refused.outsideFlash':
    '{name} neleží v pamäti flash s veľkosťou 4 MB. Nič sa nezapísalo.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    '{where}: výpis, z ktorého pochádza {file}, ho neprečítal: podľa jeho manifest.json je {address} medzera. Nie je čo obnoviť. Nič sa nezapísalo.',
  'restore.refused.gapReason':
    '{where}: výpis, z ktorého pochádza {file}, ho neprečítal: podľa jeho manifest.json je {address} medzera ({gap}). Nie je čo obnoviť. Nič sa nezapísalo.',
  'restore.refused.gapFill':
    '{where}: výpis, z ktorého pochádza {file}, ho neprečítal: podľa jeho manifest.json je {address} medzera vyplnená hodnotou {fill}. Nie je čo obnoviť. Nič sa nezapísalo.',
  'restore.refused.gapReasonFill':
    '{where}: výpis, z ktorého pochádza {file}, ho neprečítal: podľa jeho manifest.json je {address} medzera ({gap}) vyplnená hodnotou {fill}. Nie je čo obnoviť. Nič sa nezapísalo.',
  'restore.refused.empty':
    '{where} je prázdny: každý bajt je 0xFF. Zápis programuje obraz a nemôže nechať slot vymazaný, takže prázdny slot nemožno obnoviť zápisom. Nič sa nezapísalo.',
  'restore.refused.fill':
    '{where} má v každom bajte {fill}, výplň, ktorú výpis zapisuje tam, kde nič neprečítal: výpis tento slot neprečítal. Nie je čo obnoviť. Nič sa nezapísalo.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    '{where} sa z tohto súboru nedá obnoviť: {why}. Nič sa nezapísalo.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'táto zostava nemá pre slot aktiváciu zápisu',
  'support.noStagingEmpty': 'táto zostava nemá podobu odovzdania, takže sa prázdny slot nezapisuje',
  'support.buildUnknown': 'zostava je neznáma',
  'support.unverifiedStaging':
    'táto zostava je na zamknutom rade 0.x/1.x, ale nepatrí medzi zostavy, na ktorých sa zmerali tabuľky záplat na úplnú zálohu (0.8.0.0 .. 1.3.0.8 a 1.0.3.0 / 1.0.3.2), takže podoba odovzdania jej slotu je neznáma a nič sa nezapisuje',
  'support.unknownFamily':
    'rodina kamery nie je známa, a teda ani kľúč, pod ktorým sa zapisujú jej sloty, a kamera prijme slot zapísaný pod nesprávnym kľúčom a potom z neho nenaštartuje. Vytvorte výpis tejto kamery a dešifrujte ho, identifikujte ju z výpisu a potom uveďte jej rodinu pomocou --family.',
  'support.noReadCommand':
    'firmvér starší ako 0.8.0.0 nemá obsluhu čítania pre GetFeaturedFirmwareData, príkaz, ktorým výpis číta pamäť flash. Na 0.7.0.7 a 0.7.0.8 je v tabuľke metód RPC na 0x4F, ale zaregistrovaný len ako setter (obsluha zápisu), takže čítanie control-IN, ktoré výpis posiela, nemožno obslúžiť (beh na karte 0.x/1.x číta tieto dve zostavy namiesto toho cez wire id 0x58, GetFeaturedData); pred 0.7.0.7 je wire id 0x4F UploadFirmwareRowSize a na 0.3.0.1 je wire id 0x52 — to, ktorým výpis aktivuje — EnterBootloaderMode namiesto BeginFirmwareUpgrade: kamera zostane vo svojej aplikácii, ale každá aktivácia nastaví cieľ v pamäti flash a aktivuje fázu aktualizácie firmvéru danej zostavy (GetErrorCode potom číta 0x00400000), čo nie je okno čítania. Zistené z vlastných tabuliek metód obrazov, z oboch stĺpcov obslúh; pozri test/firmware/facts.json.',
  'support.noWritePath':
    'tieto zostavy prijímajú nový firmvér staršou postupnosťou aktualizácie, ktorú táto súprava nástrojov neposiela, a ich sloty sa nikdy nezmapovali, takže sa nič nezapisuje.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'verziu firmvéru sa nepodarilo prečítať, takže zostava, jej sloty a ich podoba odovzdania sú neznáme; nič sa na nej nečíta ani nezapisuje',
  'support.versionNotDotted':
    'verzia firmvéru „{version}“ nie je verzia s bodkami, takže zostava, jej sloty a ich podoba odovzdania sú neznáme; nič sa na nej nečíta ani nezapisuje',
  'support.olderThanFirst':
    'firmvér {version} je starší ako {first}: jeho tabuľka RPC nemá obsluhu čítania pre GetFeaturedFirmwareData, príkaz, ktorý posiela čítanie slotu, takže sa mu neposiela čítanie ani zápis (dôkazy má early-compact)',
  'support.modernOnLocked':
    'rodina modern-4x pokrýva 2.x, 4.x, 10.x, 42.x a 44.x; {version} je na zamknutom rade 0.x / 1.x, ktorý potrebuje legacy-auth alebo compact-2016',
  'support.lockedOnModern':
    'rodina legacy-auth pokrýva zamknutý rad 0.x / 1.x; {version} je na modernom rade, ktorý potrebuje modern-4x',
  'support.notCompactPro':
    'rodina compact-2016 pokrýva rad Compact PRO 1.0.3.x; {version} na ňom nie je',
  'support.earlyCompact':
    'rodina early-compact pokrýva len zostavy staršie ako {first} a {version} sa číta cez legacy-auth',
  'support.generic':
    'rodina kamery nie je identifikovaná (rodina generic), takže rozloženie slotov a podoba odovzdania sú neznáme; pred čítaním alebo zápisom slotu kameru identifikujte',
  'support.noPlan':
    'pre rodinu {family} neexistuje žiadny plán slotov: rozloženie jej slotov a podoba odovzdania nie sú známe',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'tabuľka tejto zostavy neaktivuje režim {mode} na {address} na obyčajnom kanáli',
  'support.noArmToken':
    'tabuľka tejto zostavy neaktivuje režim {mode} na {address} na kanáli s tokenom',
  'support.windowElsewhere':
    'okno slotu na úplnú zálohu pre {bank:acc} je na {at}, nie na {address}',
  'support.noDumpWindow':
    'tabuľka BeginFirmwareUpgrade tejto zostavy nemá na {address} okno pre {bank:acc}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} nepodporuje {capability}: {reason}',
  'support.capability.dump': 'výpis',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': '„Vypísať všetky selektory“',
  'support.capability.decrypt': 'dešifrovanie',
  'support.capability.deviceInfo': 'úplné čítanie na karte Info',
  'support.capability.flash': 'zápisy slotov',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name} na {address} sa na tejto zostave nedá prečítať: jej tabuľka selektorov tam nemá okno, takže sa preň nič neaktivovalo',
  'slots.unread.missing': '{name} chýba v analýze kamery',
  'slots.unread.notRead': '{name} sa neprečítal',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Nič sa nezapísalo.',
  'slots.refused.versionUnknown':
    'analýza neuvádza, aký firmvér v kamere beží, a príkazy slotov znamenajú na rôznych zostavách rôzne veci. Prečítajte znova informácie o zariadení.',
  'slots.refused.versionUnknownWrite':
    'analýza neuvádza, aký firmvér v kamere beží. Nič sa nezapísalo.',
  'slots.refused.emptyInput': 'vstup je prázdny',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable':
    '{name} je prázdny a na tejto zostave sa doň nedá zapísať: {reason}',
  'slots.refused.noRaw': '{name} na tejto zostave nemôže prijať surové bajty: {reason}',
  'slots.refused.noPlain': '{name} na tejto zostave nemôže prijať dešifrovaný obraz: {reason}',
  'slots.refused.noStaging':
    '{name} nemá na tejto zostave podobu odovzdania, takže preň nemožno obraz zakódovať',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B je viac, než pojme {name} ({bankSize} B)',
  'slots.refused.imageTooLong': 'obraz má {size} B, viac, než pojme {name} ({bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'bootloader z roku 2014 neprijme kontrolný súčet tejto zostavy v slote A ani B a spustí slot na obnovu R (0x14070000) bez kontroly, takže sa záplata zapíše do slotu na obnovu R a nikam inam',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly': 'táto zostava beží len zo slotu na obnovu R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize': 'slot firmvéru má {size} B ({kib} KB); tento súbor má {count} B',
  'decryptFile.erasedBank':
    'prázdny, nie je čo dešifrovať: všetkých {size} B sa číta ako 0xFF (vymazaný slot)',
  'decryptFile.erasedHeader':
    'vymazaný: okno hlavičky obsahuje samé 0xFF, takže slot neobsahuje žiadny obraz; nič sa nedešifruje',
  'decryptFile.noHeader': 'žiadna hlavička obrazu (magic {magic}), takže nie je čo dešifrovať',
  'decryptFile.lengthOutOfRange': 'header.length {length} je mimo rozsahu; nie je čo dešifrovať',
  'decryptFile.ffKeyB':
    'dešifrované {size} B pod kľúčom B FF 1.3.0.8: obraz je uložený ako obraz XOR prúd kľúča jeho bloku kľúčov 1, okno hlavičky bez zmeny',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'kľúč sa nezískal: obraz sa dešifruje na vektor resetu, ktorý nie je vstupným bodom Cortex-M (kľúč {check}); nič sa nedešifruje',
  'decryptFile.storedPlain':
    'uložený v otvorenej podobe: slot obsahuje obraz tak, ako beží (nešifrovaný reťazec z roku 2014, identický prúd kľúča), takže kľúč neexistuje a dešifrovaný obraz je samotný obraz',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 'dešifrované {size} B pod kľúčom získaným z tohto slotu ({check})',
  'decryptFile.decryptedNamed':
    'dešifrované {size} B pod kľúčom získaným z tohto slotu ({check}; je to {key})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'krátke čítanie ({size} B)',
  'read.reason.noParse': 'hlavičku obrazu nemožno spracovať',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'žiadna hlavička obrazu (magic {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} je mimo rozsahu',
  'read.reason.stopped': 'čítanie slotu sa zastavilo na {count}/{size} B',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'na firmvéri {version} nečitateľné: jeho plán ({table}) nemá okno na {address}, takže sa preň nič neaktivovalo',
  'read.reason.notInPlanUnknown':
    'na firmvéri neznámej verzie nečitateľné: jeho plán ({table}) nemá okno na {address}, takže sa preň nič neaktivovalo',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'okno poskytlo bajty zastaraného deskriptora čítačky — slovo 0 {word} s resetom {hex} je tabuľka vektorov na 0x14000000, nie obsah tohto slotu, takže sa z neho nič neanalyzovalo: {remedy}',
  'read.reason.spentReader': 'sloty kamery sa nepodarilo prečítať — {remedy}',
  'read.spentRemedy':
    'čítačka okien môže byť pre tento štart vyčerpaná; vypnite a zapnite kameru a skúste to znova',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'slovo aktívneho slotu kamery (fw info roots, selektor 10) sa nepodarilo prečítať',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'slovo aktívneho slotu kamery je {word}, čo neoznačuje žiadny slot',
  'checkKey.unnamed.cfg0NotRead':
    'slovo konfigurácie štartu sa neprečítalo, takže nie je známe, či bootloader {bank:acc} pred vstupom skontroloval',
  'checkKey.unnamed.noZeroSum':
    'kamera hlási, že vstúpila do {bank:gen}, ale {bank} sa pri tomto čítaní nedešifruje na nulový súčet slov',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'kamera hlási, že vstúpila do {bank:gen}, ktorý slovo konfigurácie štartu {word} necháva ako posledný, takže doň bootloader vstúpil bez kontroly, ale {bank} sa pri tomto čítaní nedešifruje na nulový súčet slov',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (skóre {score} po čítaní, podľa dôkazov nižšie)',
  'report.detectedAmbiguous':
    '{family} (skóre {score} po čítaní, podľa dôkazov nižšie; nejednoznačné)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'áno',
  'report.cell.no': 'nie',
  'report.cell.notApplicable': '—',
  'report.cell.unknown': 'neznáme',
  'report.cell.recoveryOnly': 'len na obnovu',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'konštanta bielenia K',
  'report.keyRow.store': 'kľúč zápisu',
  'report.keyRow.check': 'kontrolný kľúč',
  'report.keyRow.table': 'tabuľka kľúčov',
  'report.keyRow.keys': 'kľúče',
  'report.keyRow.a': 'kľúč A',
  'report.keyRow.b': 'kľúč B',
  'report.keyRow.tableAt': 'tabuľka na',
  'report.key.notIdentified': '(neidentifikované)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} kandidát, žiadny nepotvrdený',
    few: '{count} kandidáti, žiadny nepotvrdený',
    many: '{count} kandidáta, žiadny nepotvrdený',
    other: '{count} kandidátov, žiadny nepotvrdený',
  },
  'report.key.tableAt': '{offset} v bloku bootloadera, potvrdené voči slotu',
  'report.key.plainChain':
    'nie je potrebný: sloty sú uložené ako otvorený firmvér, takže sa slot číta aj zapisuje tak, ako je',
  'report.key.tableRefused2016':
    'neprečítané — blok bootloadera (0x14000000) sa v tomto rade odmieta na každom kanáli',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, pomenované podľa {bank:gen}, slotu, do ktorého podľa kamery vstúpila po kontrole bootloadera',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, odvodené zo {bank:gen}, slotu, do ktorého podľa kamery vstúpila: bootloader do tohto slotu vstupuje bez kontroly a spúšťa ho pod kľúčom, pod ktorým kontroluje ostatné sloty',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' ({pair}, blok 1)',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'dvojica Compact PRO 1.0.3.x 9 Hz',
  'keyPair.cp1032ff': 'dvojica Compact PRO 1.0.3.x FF',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'nepomenovaný — {why}',
  'report.checkKey.couldNotName': 'čítanie ho nedokázalo pomenovať',
  'report.storeKey.checkKeyUnnamed':
    'kľúč, pod ktorým jej bootloader kontroluje slot (pri tomto čítaní nepomenovaný): aplikácia ukladá každý slot, ktorý zapíše, pod týmto kľúčom',
  'report.storeKey.checkKey':
    '{key}: aplikácia ukladá každý slot, ktorý zapíše, pod kľúčom, ktorý kontroluje jej bootloader',
  'report.storeKey.unknown': 'neznámy — blok bootloadera so slotom kľúča zariadenia sa neprečítal',
  'report.storeKey.keyBUnidentified':
    'Kľúč B (kľúč zariadenia nie je naprogramovaný; samotný kľúč B neidentifikovaný)',
  'report.storeKey.keyB': 'Kľúč B (kľúč zariadenia nie je naprogramovaný)',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain': 'odovzdávaný v otvorenej podobe (obraz tak, ako je, bez kľúča)',
  'report.staged.slotKeystream': 'odovzdávaný pod vlastným blokom kľúčov 0 svojho obrazu',
  'report.staged.keyA':
    'odovzdávaný pod kľúčmi odvodenými zo spusteného slotu a bežiacej aplikácie',
  'report.staged.ffVendor':
    'odovzdávaný tak, ako obraz 16 Hz FF odovzdáva aplikácia výrobcu (obraz XOR jeho vlastný blok kľúčov 0), a kamera ho uloží pod kľúčom B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Záloha: blok {address}',
  'progress.backupDone': 'Záloha: prečítané všetky bloky',
  'progress.checkBlock': 'Kontrola: blok {address}',
  'progress.checkDone': 'Kontrola: prečítané všetky bloky',
  'progress.writingBank': 'Zápis do {bank:gen}',
  'progress.restoringBank': 'Obnovenie {bank:gen}',
  'progress.staged': '{label}: odovzdané {done}/{total} B',
  'progress.wholeFlash': 'Čítanie celej pamäte flash: {got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'čítanie {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'čítanie {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Hotovo — prečítané okná: {ok}/{total}.',
  'progress.readingBank': 'Čítanie {bank:gen} ...',
  'progress.analysing': 'Analýza ...',
  'progress.probeSelector': 'skúška selektora {selector} ...',
  'progress.selectorsArmed': 'Hotovo — aktivované selektory: {armed}/{span}, s údajmi: {withData}.',
  'progress.recoveringKey': 'dešifrovanie: získava sa kľúč pre {address} ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} {address} (subcmd {subcmd}) sa nedá prečítať: {error}',
  'slots.read.refusedBuild':
    'čítanie slotov firmvéru sa odmieta: {reason}. Okrem čítania verzie sa nič neodoslalo, takže sa žiadneho slotu nič nedotklo.',
  'slots.backup.notSaved':
    'záloha {file} sa neuložila, takže sa nič nezapísalo. Zápis nikdy neprebehne bez vopred uloženej zálohy; skúste to znova, keď ju bude možné uložiť.',
  'slots.backup.notSavedWhy':
    'záloha {file} sa neuložila ({error}), takže sa nič nezapísalo. Zápis nikdy neprebehne bez vopred uloženej zálohy; skúste to znova, keď ju bude možné uložiť.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'vysoká (480 Mbit/s)',
  'usb.speed.full': 'plná (12 Mbit/s)',
  'usb.speed.code': 'kód {code}',
} satisfies Translation<'core', 'sk'>;
