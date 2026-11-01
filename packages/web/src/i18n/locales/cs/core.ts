/**
 * Namespace `core`, čeština (cs), translated from the English source: sentences that `@seek-fw/core` makes and
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
    'kamera zůstane odemčená až do vypnutí a zapnutí a jiné nástroje ji do té doby mohou číst chybně; než je použijete, kameru vypněte a zapněte',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': 'nejdřív {first}, potom {second}, potom {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'nebyl přečten',
  'boot.verdict.checkKeyUnnamed':
    'nešel zkontrolovat: klíč, pod kterým jeho bootloader kontroluje slot, nebyl pojmenován',
  'boot.cfg0NotRead':
    'slovo konfigurace startu (cfg[0]) nebylo přečteno, takže není známo, ze kterého slotu příští start poběží',
  'boot.select.unknown':
    'slovo konfigurace startu je {word}, takže bootloader zkouší nejdřív {first:acc}, ale {bank} {verdict}, takže není známo, který slot poběží',
  'boot.select.first':
    'slovo konfigurace startu je {word}, takže bootloader zkouší nejdřív {first:acc} a ten obsahuje obraz, který bootloader přijme',
  'boot.select.second':
    'slovo konfigurace startu je {word}, takže bootloader zkouší nejdřív {first:acc}; {first:nom} neobsahuje žádný obraz, který bootloader přijme, takže vezme {second:acc}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'slovo konfigurace startu je {word}, takže bootloader zkouší nejdřív {first:acc}; {first:nom} ani {second:nom} neobsahuje obraz, který bootloader přijme, takže spustí {last:acc}, který nekontroluje',
  'boot.select.lastTakes':
    'slovo konfigurace startu je {word}, takže bootloader zkouší nejdřív {first:acc}; {first:nom} ani {second:nom} neobsahuje obraz, který bootloader přijme, takže vezme {last:acc}, který nekontroluje',
  'boot.bootsNow': '{bank} je slot, ze kterého kamera teď startuje',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'právě spuštěný',
  'boot.notBooted': 'nespuštěný',
  'boot.unknownWhy.checkKeyUnnamed':
    'klíč, pod kterým jeho bootloader kontroluje slot, nebyl při tomto čtení pojmenován',
  'boot.unknownWhy.noKeyTable':
    'tabulka klíčů bootloaderu nebyla přečtena, takže klíče, které zkouší, nelze pojmenovat',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'Kamera startuje ze {bank:gen}. {why}.',
  'fpsBoot.holdsOne':
    '{bank} obsahuje záplatu snímkové frekvence, ale neběží, takže se záplata neprojeví.',
  'fpsBoot.holdsTwo':
    '{banks} obsahují záplaty snímkové frekvence, ale ani jeden neběží, takže se záplaty neprojeví.',
  'fpsBoot.wouldNotRun':
    'Záplatování {target:gen} by ho nespustilo, protože kamera místo něj startuje ze {bank:gen}.',
  'fpsBoot.patchRunning':
    'Záplatujte také {bank:acc} (slot, který běží): teprve tím se záplata snímkové frekvence projeví.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank} zde nelze záplatovat ({reason}), takže se záplata snímkové frekvence v jiném slotu na této kameře neprojeví.',

  /* ---- backup: the zip saved before a bank write (slots/backup); `{name}` is the bank inside a sentence ("slot B"): each is an item of backup.plan.* ---- */
  'backup.bank.notInPlan': '{name} (není v plánu tohoto sestavení: zip to uvádí)',
  'backup.bank.unsupported': '{name} (toto sestavení ho nedokáže přečíst, {reason}: zip to uvádí)',
  'backup.bank.empty':
    '{name} (prázdný, každý bajt 0xFF: zip to uvádí a zápis nepřepíše žádný firmware)',
  'backup.bank.unread':
    '{name} (čtení slotů se k němu nedostalo: zip uvádí, zda se k němu dostane čtení před zápisem)',
  'backup.bank.noKey':
    '{name} (tak, jak je uložen; neotevře ho žádný klíč, který toto čtení získalo, takže dešifrovaný soubor chybí)',
  'backup.bank.decrypted': '{name} (tak, jak je uložen, a dešifrovaný)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Než se cokoli zapíše, {banks} se znovu přečte a uloží do jednoho zipu s poznámkou, co který soubor je: {file}.',
  'backup.plan.many':
    'Než se cokoli zapíše, {banks} se znovu přečtou a uloží do jednoho zipu s poznámkou, co který soubor je: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'zašifrováno tak, aby ho zařízení uložilo pod klíčem, který obsahuje spuštěný slot',
  'staging.detail.slotKeystreamCiphertext':
    'zašifrováno vlastním klíčem pro předání obrazu (blok klíčů 0); kamera ho uloží pod vlastním klíčem slotu',
  'staging.detail.plain': 'otevřený text, bez šifry',
  'staging.detail.keyAKeystream':
    'obraz 1.3.0.8 FF tak, jak ho předává aplikace výrobce (XOR klíč A) — sestavení 16 Hz ho uloží pod klíčem B, ne tyto bajty',
  'staging.detail.verbatim': 'beze změny — bajty přesně tak, jak byly zadány',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'žádné čtení',
  'copy.source.notInPlan': '{name} není v plánu tohoto sestavení',
  'copy.source.notRead': '{name} nebyl přečten ({reason}), takže není co kopírovat',
  'copy.source.empty': '{name} je prázdný: není co kopírovat',
  'copy.source.foreign':
    've {name:loc} není žádný obraz firmwaru, který toto čtení rozpozná, takže není co kopírovat',
  'copy.source.noKey':
    '{name:acc} neotevře žádný klíč, který toto čtení získalo, takže není žádný dešifrovaný obraz ke kopírování',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} na adrese {address}, tak jak ho dešifrovalo čtení slotů',
  'copy.fromVersion':
    '{name} na adrese {address}, firmware {version}, tak jak ho dešifrovalo čtení slotů',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'Obraz pochází ze {name:gen}, tak jak ho dešifrovalo čtení slotů: {size} B, sha256 {sha256}.',
  'copy.noteVersion':
    'Obraz pochází ze {name:gen}, tak jak ho dešifrovalo čtení slotů: firmware {version}, {size} B, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '{name} ze zálohy (na adrese {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where} v úplné záloze paměti flash {file}',
  'restore.fromVersion': '{where} v úplné záloze paměti flash {file}, firmware {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'obraz paměti flash o velikosti 4 MB',
  'restore.kind.preserve-run': 'soubor běhu z karty 0.x/1.x',
  'restore.kind.dump': 'zip z karty „Výpis a dešifrování 4.x/Nano“',
  'restore.kind.all-selectors': 'zip z „Vyčíst všechny selektory“',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'obraz',
  'restore.decryptedTo.firmware': 'firmware {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'Obraz: {where} v souboru {file}, {kind}: uložené sha256 {stored}, dešifrováno na {decrypted} o velikosti {size} B (sha256 {sha256}).',
  'restore.note.imageEntry':
    'Obraz: {where} v souboru {file}, {kind} (položka {entry}): uložené sha256 {stored}, dešifrováno na {decrypted} o velikosti {size} B (sha256 {sha256}).',
  'restore.note.readBack':
    'Po zápisu se zpětně přečtený slot porovná s bajty slotu uloženými v záloze.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'Identifikační blok zálohy uvádí tuto kameru (sériové číslo {serial}).',
  'restore.note.sameBytes':
    'Ve {name:loc} už jsou bajty uložené v záloze: zápis vrátí stejný obraz.',
  'restore.warn.otherCamera':
    'Tato záloha vypadá jako z jiné kamery: její identifikační blok uvádí sériové číslo {theirs} a tato kamera má {camera}. Zapíše se jen obraz {name:gen}; nic z identity ani kalibrace té kamery se nezapíše.',
  'restore.warn.noIdentity':
    'Tato záloha nemá identifikační blok na adrese {address}, takže nelze zjistit, z čí kamery byla přečtena.',
  'restore.warn.serialNotRead':
    'Sériové číslo kamery nebylo přečteno, takže zálohu (sériové číslo {serial}) k ní nelze přiřadit.',
  'restore.warn.otherFirmware':
    '{where} obsahuje firmware {version} a v kameře běží {camera}: obnovení vloží do slotu jiný firmware.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared': '{bank} nebyl zpětně přečten, takže se se zálohou neporovnává.',
  'restore.readBack.equal': '{bank} se zpětně čte bajt po bajtu tak, jak ho záloha ukládá.',
  'restore.readBack.differs':
    '{bank} se při zpětném čtení liší od bajtů uložených v záloze: {count} B (první na {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, odvozený ze spuštěného {bank:gen}',
  'keys.derived.holds':
    '{key} (klíč zápisu), odvozený ze spuštěného {bank:gen}, který obsahuje {holds}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, odvozený ze spuštěného slotu',
  'keys.derived.holdsUnnamed':
    '{key} (klíč zápisu), odvozený ze spuštěného slotu, který obsahuje {holds}',
  'keys.ffVendor.staged':
    'obraz 1.3.0.8 FF (16 Hz) tak, jak ho předává aplikace výrobce: obraz XOR jeho vlastní blok klíčů 0 (klíč A), okno hlavičky beze změny, do libovolného slotu; klíče této kamery se nepoužívají',
  'keys.ffVendor.stored':
    'klíč B: kamera nahraná data přešifruje blokem klíčů 1 a obraz pod ním uloží',
  'keys.imageBlock0.staged':
    'obraz pod jeho vlastním blokem klíčů 0 (nalezeným v obrazu podle hodnoty), do libovolného slotu; klíče této kamery se nepoužívají',
  'keys.imageBlock0.storedUnnamed':
    'klíč, pod kterým její bootloader kontroluje slot (při tomto čtení nepojmenovaný); kamera pod ním nahraná data znovu zašifruje',
  'keys.imageBlock0.stored':
    '{key}, klíč, pod kterým její bootloader kontroluje slot; kamera pod ním nahraná data znovu zašifruje',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED (nevyzkoušeno): z kamery dosud nebyl přečten žádný bootloader sestavení 16 Hz FF, takže není známo, zda zapsaný slot nastartuje. Na bootloaderu 0.9.0.0 dřívější podoba tohoto obrazu nastartovala ze slotu pro obnovu R; tato podoba nenastartuje, protože tento bootloader spouští slot pro obnovu R tak, jak je uložen, bez dekódování.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'Obraz 16 Hz FF se posílá v podobě, kterou čte jen sestavení 16 Hz {version}. Tato kamera zapisuje slot bez kontroly obrazu (uvádí to zdrojový kód jejího firmwaru a Compact 1.3.0.0 to při zkoušce tak udělal), takže se očekává, že bajty zapíše tak, jak byly poslány: slot pak obsahuje obraz v podobě, kterou tato kamera nedokáže spustit.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Nic zde netvrdí, že ho kamera spustí.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast': 'Vlastní odpovědi kamery říkají, že v ní běží sestavení 16 Hz FF: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'kontroluje data před smazáním slotu a tato data kontrolou projdou, takže může tyto bajty zapsat tak, jak jsou, v podobě, kterou její bootloader nedokáže spustit: slot nemusí nastartovat (nevyzkoušeno; záloha uložená před zápisem ho vrátí)',
  'write.ff.outcome.refuses':
    'kontroluje data před smazáním slotu a tato data kontrolou neprojdou, takže se očekává, že tento zápis odmítne dřív, než cokoli zapíše (kamera s tímto sestavením stejně odmítla dřívější podobu tohoto obrazu)',
  'write.ff.runsSlow': 'V kameře běží sestavení 8 Hz {version}: {why}. Toto sestavení {outcome}.',
  'write.ff.buildUnknown':
    'Vlastní odpovědi kamery neříkají, které sestavení {version} v ní běží: {why}. Pokud v ní běží sestavení 16 Hz FF, tato data přijme. Pokud v ní běží sestavení 8 Hz, toto sestavení {outcome}.',
  'write.raw.asGiven':
    'Surová data: posílají se přesně tak, jak byla zadána. Nic zde nekontroluje, zda jsou spustitelná.',
  'write.raw.ffStagedForm':
    'Tato data jsou podoba 1.3.0.8 FF pro předání (obraz XOR blok klíčů 0, součet slov 0xFFFF). Kamera uloží obraz pod klíčem B, takže se kontrolní čtení porovnává s těmito bajty.',
  'write.raw.noStaging':
    'Toto sestavení pro slot neuvádí žádnou podobu předání, takže kontroly bootloaderu nelze určit.',
  'write.raw.reencrypts':
    'Zařízení tato data dekóduje a to, co si ponechá, znovu zašifruje, takže uložené bajty nelze předpovědět. Kontrolní čtení se kontroluje jako obraz, na který se dešifruje, pokud to lze určit.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'Bootloader by tato data odmítl: {failure}.',
  'write.raw.stageKeyUnchecked':
    'Klíč pro předání z roku 2016 (blok klíčů 0) v surových bajtech není, takže se dešifrovaný součet slov těchto dat zde nekontroluje.',
  'write.image.rekeyRisk':
    'Ve {name:loc} už je obraz, který bootloader nedokáže přijmout. Tento zápis skončí ve stejném stavu.',
  'write.ack.recovery':
    'Slot pro obnovu R: zápis do něj vyžaduje, abyste riziko potvrdili. Nic zde nekontroluje, zda kamera potom nastartuje.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: zápis do něj vyžaduje, abyste riziko potvrdili, a kamera po příštím vypnutí a zapnutí spustí cokoli, co obsahuje.',
  'write.ack.bootUnnamed':
    'spuštěný slot se nepodařilo pojmenovat, takže se tento slot bere jako spuštěný',
  'write.ack.recoveryFallback':
    'Slot pro obnovu R je poslední záložní kopie, ke které se bootloader vrací',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'prázdné/0: přednost má slot A, pak B, pak slot pro obnovu',
  'boot.cfg0.modernB': 'přednost má slot B, pak A, pak slot pro obnovu',
  'boot.cfg0.modernRecovery': 'přednost má slot pro obnovu, pak A, pak B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'neznámé — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  /** `{verdict}` is one of upgrade.verdict.*. `{name}` here is the bank inside a sentence ("slot B"); in upgrade.verdict.* it starts a sentence ("Slot B"). */
  'upgrade.whileRecovery':
    'Kamera běží ze svého slotu pro obnovu a její vlastní aktualizace zapisuje {name}, ze kterého neběží. {verdict} Je to jen varování: nic zde aktualizaci nebrání.',
  'upgrade.verdict.notRead':
    '{name} se při této kontrole nepodařilo přečíst, takže není známo, co obsahuje.',
  'upgrade.verdict.blank': '{name} je prázdný, takže aktualizace zapisuje do prázdného slotu.',
  'upgrade.verdict.bootableSame':
    '{name} obsahuje stejný spustitelný obraz jako slot, ze kterého kamera běží, a aktualizace ho nahradí. {name} zůstane nespustitelný, pokud se aktualizace zastaví v půli.',
  'upgrade.verdict.bootable':
    '{name} obsahuje spustitelný obraz, který aktualizace nahradí. {name} zůstane nespustitelný, pokud se aktualizace zastaví v půli.',
  'upgrade.verdict.unknown':
    '{name}: spustitelnost je při tomto čtení neznámá, takže aktualizace může nahradit obraz, který by kamera spustila.',
  'upgrade.verdict.notBootable':
    '{name} se při tomto čtení nejeví jako spustitelný, takže aktualizace nenahradí žádný obraz, který by kamera spustila.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — slot, do kterého bootloader při tomto startu vstoupil, jak ho zaznamenává',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'nepřečteno',
  'report.lastStart.noBank': 'kamera hlásí {word}, což neoznačuje žádný slot',
  'report.lastStart.entered':
    'kamera hlásí, že vstoupila do {bank:gen} (slovo aktivního slotu {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'žádná verze',
  'running.why.otherVersion': 'kamera hlásí {version} a dvě sestavení má jen {only}',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'kamera neodpověděla na verdikty slotů (selektory GetFirmwareInfo 6, 7, 8)',
  'running.why.notRead':
    'slot, na kterém verdikty závisí, nebyl přečten, takže odpovědi nelze předpovědět',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'kamera odpovídá {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers}, což pro tyto sloty odpovídá sestavení 8 Hz 1.3.0.8 ({predicted})',
  'running.why.ff':
    '{answers}, což pro tyto sloty odpovídá sestavení 16 Hz FF 1.3.0.8 ({predicted})',
  'running.why.both':
    '{answers} a obě sestavení pro tyto sloty odpovídají přesně tak, takže je sloty nerozliší',
  'running.why.neither':
    '{answers}, což neodpovídá žádnému sestavení (8 Hz: {plain}; 16 Hz FF: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'Hlavička tohoto obrazu neuvádí žádnou verzi firmwaru, takže nelze zjistit, zda jde o sestavení, které v kameře běží ({camera}). Zkontrolujte, že jde o obraz, který chcete zapsat.',
  'imageBuild.otherVersion': 'Tento obraz je firmware {image}; v kameře běží {camera}.',
  'imageBuild.otherVersionTaken':
    'Tento obraz je firmware {image}; v kameře běží {camera}. Na této řadě kamera kontroluje jen to, zda je obraz správně utvořený (jeho hlavičku a součet slov), ne jeho verzi, takže tento obraz přijme, a když nastartuje z tohoto slotu, poběží {image}.',
  'imageBuild.otherVersionUnchecked':
    'Tento obraz je firmware {image}; v kameře běží {camera}. Zda tato kamera přijme jiné sestavení a spustí ho, nebylo ověřeno.',
  'imageBuild.otherBuild':
    'Tento obraz je sestavení 8 Hz {version}; v kameře běží sestavení 16 Hz {version} FF. Sestavení 16 Hz při potvrzení zápisu kontroluje data proti své vlastní podobě FF a data, která neprojdou, odmítne dřív, než slot smaže (podle jeho zdrojového kódu). Zápis sestavení 8 Hz do něj nebyl na kameře vyzkoušen.',
  'imageBuild.runningUnknown':
    'Tento obraz je sestavení 8 Hz {version}. V kameře běží {version}, které existuje jako sestavení 8 Hz a 16 Hz FF, a její vlastní odpovědi neřekly, které z nich běží, takže nelze zjistit, zda jde o její sestavení.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': 'data mají {size} B, což je příliš málo na hlavičku na 0x200',
  'bootFail.noMagic': 'na 0x200 není magic obrazu (nalezeno {found}, bootloader vyžaduje {needs})',
  'bootFail.lengthOutside': 'header.length {length} leží mimo data o velikosti {size} B',
  'bootFail.lengthNotPayload': 'header.length {length} neodpovídá délce dat {size}',
  'bootFail.overStage': '{size} B přesahuje {max} B pro předání',
  'bootFail.plainSum': 'uložený součet slov je {sum}, bootloader z roku 2014 vyžaduje 0',
  'bootFail.noFooter': 'na {offset} není patička: data končí na {end}',
  'bootFail.footerNotCode':
    'patička na {offset} není „CODE“ — bootloader použije svůj segmentovaný zavaděč',
  'bootFail.footerLength': 'délka patičky neodpovídá header.length {length}',
  'bootFail.keyASum':
    'po dešifrování klíčem A této kamery je součet slov {sum}, bootloader vyžaduje {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'ověřen kontrolním součtem',
  'keyConfidence.structural': 'ověřen jen tabulkou vektorů',
  'keyConfidence.unverified': 'neověřen',
  /** `{sum}` is hex. */
  'keyCheck.family': 'klíč ověřen kontrolním součtem {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'klíč {phrase}; kontrolní součet {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'předáno pod vlastními klíči kamery',
  'staging.phrase.slotKeystreamCiphertext': 'předáno pod vlastním klíčem obrazu',
  'staging.phrase.plain': 'předáno v otevřené podobě',
  'staging.phrase.keyAKeystream': 'předáno tak, jak obraz FF předává aplikace výrobce (XOR klíč A)',
  'staging.phrase.verbatim': 'odesláno tak, jak bylo zadáno',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank, inside the sentence ("slot A"); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    'do {name:gen} na adrese {address} potvrzeno {size} B, {staged}; stav potvrzení {status}',
  'written.noReadWindow':
    'toto sestavení pro slot neuvádí žádné okno čtení, takže se nic zpětně nepřečetlo',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'kontrolní čtení selhalo: {error}',
  'written.readBack': 'zpětně přečteno {size} B, SHA-256 {sha256}',
  'written.verifyOff': 'ověření je vypnuté: slot se zpětně nečetl',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'bajty, které měl slot podle plánu obsahovat (obraz tak, jak ho ukládá sestavení 16 Hz, ne odeslané bajty)',
  'readBack.reference.asSent':
    'bajty, které měl slot podle plánu obsahovat (bajty tak, jak byly odeslány)',
  'readBack.sizeDiffers':
    'kontrolní čtení má {size} B, plán předpověděl {predictedSize} B: slot NEODPOVÍDÁ tomu, co bylo očekáváno — {reference}',
  'readBack.matchesFolded':
    'slot obsahuje obraz tak, jak ho ukládá sestavení 16 Hz (ne odeslané bajty), a zbytek slotu je smazaný',
  'readBack.matches':
    'slot odpovídá bajtům, které plán předpověděl (nešifrovaný řetězec z roku 2014 programuje přesně to, co dostane)',
  'readBack.differs':
    'slot NEODPOVÍDÁ tomu, co bylo očekáváno — {reference} (první rozdíl na {offset})',
  'readBack.noHeader':
    'kontrolní čtení neobsahuje na {offset} hlavičku obrazu (magic {magic}), takže se slot NEDEŠIFRUJE na očekávaný obraz',
  'readBack.lengthDiffers':
    'hlavička v kontrolním čtení uvádí {length} B, obraz podle plánu má {imageLength} B: slot se NEDEŠIFRUJE na očekávaný obraz',
  'readBack.tooShort':
    'kontrolní čtení má {size} B, což je příliš málo pro obraz o {length} B: slot se NEDEŠIFRUJE na očekávaný obraz',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'proudu klíče získaného z kontrolního čtení ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': 'slot se dešifruje na očekávaný obraz ({length} B) pomocí {recovered}',
  'readBack.decryptDiffers':
    'slot se NEDEŠIFRUJE na očekávaný obraz: první rozdíl na offsetu obrazu {offset} při použití {recovered}',
  'readBack.rawNotCompared':
    'surové bajty: kontrolní čtení nahlášeno, neporovnáno (bajty se v této podobě nedešifrují na předvídatelný otevřený obraz a zařízení to, co si ponechá, znovu zašifruje)',
  'readBack.notCompared':
    'porovnání nebylo možné: plán nepředpovídá uložené bajty ani otevřený obraz',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'klíč A',
  'keyName.keyA:gen': 'klíče A',
  'keyName.keyA:dat': 'klíči A',
  'keyName.keyA:acc': 'klíč A',
  'keyName.keyA:ins': 'klíčem A',
  'keyName.keyA:loc': 'klíči A',
  'keyName.keyB': 'klíč B',
  'keyName.keyB:gen': 'klíče B',
  'keyName.keyB:dat': 'klíči B',
  'keyName.keyB:acc': 'klíč B',
  'keyName.keyB:ins': 'klíčem B',
  'keyName.keyB:loc': 'klíči B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'klíč zařízení',
  'keyName.perDevice:gen': 'klíče zařízení',
  'keyName.perDevice:dat': 'klíči zařízení',
  'keyName.perDevice:acc': 'klíč zařízení',
  'keyName.perDevice:ins': 'klíčem zařízení',
  'keyName.perDevice:loc': 'klíči zařízení',
  'keyName.thePerDevice': 'klíč zařízení',
  'keyName.thePerDevice:gen': 'klíče zařízení',
  'keyName.thePerDevice:dat': 'klíči zařízení',
  'keyName.thePerDevice:acc': 'klíč zařízení',
  'keyName.thePerDevice:ins': 'klíčem zařízení',
  'keyName.thePerDevice:loc': 'klíči zařízení',
  'keyName.applicationKeyA': 'klíč A aplikace',
  'keyName.applicationKeyA:gen': 'klíče A aplikace',
  'keyName.applicationKeyA:dat': 'klíči A aplikace',
  'keyName.applicationKeyA:acc': 'klíč A aplikace',
  'keyName.applicationKeyA:ins': 'klíčem A aplikace',
  'keyName.applicationKeyA:loc': 'klíči A aplikace',
  'keyName.applicationKeyB': 'klíč B aplikace',
  'keyName.applicationKeyB:gen': 'klíče B aplikace',
  'keyName.applicationKeyB:dat': 'klíči B aplikace',
  'keyName.applicationKeyB:acc': 'klíč B aplikace',
  'keyName.applicationKeyB:ins': 'klíčem B aplikace',
  'keyName.applicationKeyB:loc': 'klíči B aplikace',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'blok klíčů 1',
  'keyName.block1:gen': 'bloku klíčů 1',
  'keyName.block1:dat': 'bloku klíčů 1',
  'keyName.block1:acc': 'blok klíčů 1',
  'keyName.block1:ins': 'blokem klíčů 1',
  'keyName.block1:loc': 'bloku klíčů 1',
  'keyName.theDeviceKey': 'klíč zařízení',
  'keyName.theDeviceKey:gen': 'klíče zařízení',
  'keyName.theDeviceKey:dat': 'klíči zařízení',
  'keyName.theDeviceKey:acc': 'klíč zařízení',
  'keyName.theDeviceKey:ins': 'klíčem zařízení',
  'keyName.theDeviceKey:loc': 'klíči zařízení',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'neznámý klíč',
  'keyName.unknown:gen': 'neznámého klíče',
  'keyName.unknown:dat': 'neznámému klíči',
  'keyName.unknown:acc': 'neznámý klíč',
  'keyName.unknown:ins': 'neznámým klíčem',
  'keyName.unknown:loc': 'neznámém klíči',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'nešifrovaný řetězec z roku 2014: každý slot je uložen v otevřené podobě, takže se neodvozuje žádný klíč pro nahrání; nahrává se obraz tak, jak je',
  'keys.evidence.ffVendor':
    'sestavení 1.3.0.8 FF (16 Hz): žádný slot, který toto čtení otevřelo, není uložen v otevřené podobě, takže se neprokazuje, že by kamera byla na nešifrovaném řetězci z roku 2014; obraz FF se zapisuje v podobě od výrobce, surové bajty se posílají tak, jak byly zadány, a otevřený obraz 8 Hz se nezapisuje',
  'keys.evidence.ffUntested':
    'zápis obrazu FF se nabízí s varováním UNTESTED: ve sbírce není žádný skutečný bootloader tohoto sestavení, takže není změřeno, zda zapsaný slot nastartuje',
  'keys.evidence.line2016':
    'řada Compact PRO z roku 2016: nahrávaná data jsou obraz XOR proud klíče jeho vlastního bloku klíčů 0, nalezeného v obrazu podle hodnoty, takže je nesestavuje žádný klíč této kamery',
  'keys.evidence.checkKeyUnnamed':
    'kamera nahraná data tímto klíčem dešifruje a znovu je zašifruje klíčem, pod kterým její bootloader kontroluje slot; ten klíč nebyl při tomto čtení pojmenován a zápis ho nepotřebuje: slot se zpětně přečte jako obraz, na který se dešifruje',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'kamera nahraná data tímto klíčem dešifruje a znovu je zašifruje klíčem, pod kterým její bootloader kontroluje slot; ten klíč nebyl při tomto čtení pojmenován ({why}) a zápis ho nepotřebuje: slot se zpětně přečte jako obraz, na který se dešifruje',
  'keys.evidence.checkKeyNamed':
    'kamera nahraná data tímto klíčem dešifruje a znovu je zašifruje {key:ins} {hex}, klíčem, pod kterým její bootloader kontroluje slot, takže každý slot, který zapíše, je uložen tak, jak ho bootloader přijme',
  'keys.evidence.checkKeyInferred':
    'kamera nahraná data tímto klíčem dešifruje a znovu je zašifruje {key:ins} {hex}, klíčem, pod kterým její bootloader kontroluje slot (odvozeno ze {bank:gen}, slotu, do kterého podle kamery vstoupila a do kterého bootloader vstoupil bez kontroly), takže každý slot, který zapíše, je uložen tak, jak ho bootloader přijme',
  'keys.evidence.checkKeyNamedFrom':
    'kamera nahraná data tímto klíčem dešifruje a znovu je zašifruje {key:ins} {hex}, klíčem, pod kterým její bootloader kontroluje slot (pojmenováno podle {bank:gen}, slotu, do kterého podle kamery vstoupila), takže každý slot, který zapíše, je uložen tak, jak ho bootloader přijme',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'spuštěný slot se nepodařilo pojmenovat, takže z něj nelze přečíst klíč, pod kterým je slot uložen',
  'keys.refused.notDerived': 'klíče se nepodařilo odvodit',
  'keys.refused.notDecrypted':
    'spuštěný {bank} se nedešifruje na obraz, takže nelze přečíst klíč, pod kterým je uložen',
  'keys.refused.noBootKey':
    'spuštěný {bank} se nedešifruje pod žádným klíčem, který bootloader zkouší (jeho klíč A nebo jeho klíč zápisu), takže z něj nelze přečíst klíč, pod kterým je slot uložen',
  'keys.refused.keyNotInTable':
    'spuštěný {bank} se dešifruje {key:ins}, ale tabulka klíčů této kamery tento klíč neobsahuje, takže pod ním nelze zapisovat',
  'keys.refused.noApplicationPair':
    'běžící aplikace ({bank}, firmware {firmware}) neobsahuje žádnou ze známých dvojic klíčů (dvojici bootloaderu ani dekódované dvojice aplikace) s každou polovinou právě jednou, takže její klíč A nelze v jejím obrazu najít',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'běžící aplikace ({bank}, firmware {firmware}) neobsahuje žádnou ze známých dvojic klíčů (dvojici bootloaderu ani dekódované dvojice aplikace) s každou polovinou právě jednou, takže její klíč A nelze v jejím obrazu najít (klíč A bootloaderu se vyskytuje {count}krát, jeho klíč B {keyB}krát)',
    few: 'běžící aplikace ({bank}, firmware {firmware}) neobsahuje žádnou ze známých dvojic klíčů (dvojici bootloaderu ani dekódované dvojice aplikace) s každou polovinou právě jednou, takže její klíč A nelze v jejím obrazu najít (klíč A bootloaderu se vyskytuje {count}krát, jeho klíč B {keyB}krát)',
    many: 'běžící aplikace ({bank}, firmware {firmware}) neobsahuje žádnou ze známých dvojic klíčů (dvojici bootloaderu ani dekódované dvojice aplikace) s každou polovinou právě jednou, takže její klíč A nelze v jejím obrazu najít (klíč A bootloaderu se vyskytuje {count}krát, jeho klíč B {keyB}krát)',
    other:
      'běžící aplikace ({bank}, firmware {firmware}) neobsahuje žádnou ze známých dvojic klíčů (dvojici bootloaderu ani dekódované dvojice aplikace) s každou polovinou právě jednou, takže její klíč A nelze v jejím obrazu najít (klíč A bootloaderu se vyskytuje {count}krát, jeho klíč B {keyB}krát)',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'běžící aplikace ({bank}, firmware {firmware}) kontroluje nahraná data pod svými vlastními klíči dřív, než je naprogramuje (dekódovaný zdrojový kód tohoto sestavení zkouší nahraná data pod svým klíčem A a svým klíčem zápisu, stejně jako její bootloader zkouší slot), a klíč, pod kterým zápisy ukládají, {key} ({hex}), není ani jejím klíčem A, ani klíčem zápisu, takže by kamera nahraná data odmítla s 0x50000 dřív, než cokoli smaže',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'žádný slot se nedešifruje na kontrolní součet {sum} rodiny {family}',
  'writeRefusal.keyTable': 'tabulku klíčů této kamery se nepodařilo potvrdit',
  'writeRefusal.whitening':
    'tabulka klíčů této kamery vychází pod K={k}, ale {family} šifruje pod K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily':
    'důkazy říkají, že tato kamera je {detected}, ne {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'do této kamery odsud nelze zapisovat: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Sestavení Seek z roku 2018 a novější (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 a Nano 300. Výpis přečte 63 ze 64 bloků paměti flash, aniž by cokoli odemykal; na blok na {block} se na těchto sestaveních žádné čtení nedostane. Firmware je uložen zašifrovaně. Sloty se zapisují jeden po druhém na kartě „Práce se sloty firmwaru“.',
  'family.summary.early':
    'Kamery Compact z roku 2014 starší než 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 a 0.7.0.8. Jejich firmware neumí odpovědět na čtení, které posílá výpis, takže výpis, „Vyčíst všechny selektory“, úplné čtení na kartě Info i karta „Práce se sloty firmwaru“ je po přečtení verze odmítnou; na 0.3.0.1 by příkaz, kterým výpis začíná, místo toho připravil aktualizaci firmwaru. Běh na kartě 0.x/1.x čte 0.7.0.7 a 0.7.0.8 jiným příkazem, na který tato dvě sestavení odpovídají. Výpis pořízený jinou cestou se dešifruje jako obvykle.',
  'family.summary.compact2016':
    'Sestavení Compact PRO 1.0.3.x (1.0.3.0 a 1.0.3.2). Na čtení odpovídají přesně jako kamery Compact z roku 2014, včetně odemykacího tokenu, takže se rozlišují podle verze a podle toho, jak jsou uloženy jejich sloty: zašifrovaně, zatímco sloty z roku 2014 jsou v otevřené podobě. Kamera 1.0.3.x se od začátku čte v rámci této rodiny. Běh na kartě 0.x/1.x přečte celou paměť flash a sloty se zapisují jeden po druhém na kartě „Práce se sloty firmwaru“.',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    'Kamery Compact z roku 2014 od 0.8.0.0 do 1.3.0.8, včetně sestavení 16 Hz 1.3.0.8 FF. Běžná kamera vydá méně než polovinu své paměti flash, část z toho jen na odemykací token, který sada nástrojů posílá; běh na kartě 0.x/1.x přečte zbytek pomocí dočasné záplaty. Sloty jsou uloženy v otevřené podobě, kromě sestavení FF. Kamera Compact PRO 1.0.3.x se čte jako compact-2016 a sem přejde, jen pokud je některý slot uložen v otevřené podobě nebo se dešifruje na {sum}, jako je tomu u sestavení FF. Sloty se zapisují na kartě „Práce se sloty firmwaru“ na sestaveních, na kterých byl běh na kartě 0.x/1.x změřen; jakékoli jiné sestavení 0.x nebo 1.x se jen čte.',
  'family.summary.generic':
    'Kamera, které neodpovídá žádná jiná rodina. `seek-fw dump` ji čte se seznamem bloků 4.x (karta 4.x/Nano ji odmítne) a dešifrování vypočte klíč ze samotného obrazu, takže ani jedno na odhadu nezávisí. Žádný slot se nezapisuje: karta „Práce se sloty firmwaru“ ji odmítá, dokud kamera není identifikována.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'hlavička obrazu uvádí',
  'detect.source.camera': 'kamera hlásí',
  'detect.plainArmedNotInForce':
    'prostý dvoubajtový BeginFirmwareUpgrade aktivoval chráněný slot, takže ověřený kanál čtení neplatí',
  'detect.modern.plainRefused':
    'prostý dvoubajtový BeginFirmwareUpgrade chráněného slotu byl ODMÍTNUT, což žádné sestavení této řady nedělá — jeho obsluha nemá kontrolu tokenu a prostý kanál přijímá na každém slotu',
  'detect.modern.authArmed':
    'chráněný slot se aktivoval na ověřeném selektoru o 18 bajtech; prostý tam nikdo nezkoušel, takže to tuto kameru z této řady nevyřazuje',
  'detect.modern.legacyVersion':
    '{said} firmware {version}, který patří do starší řady 0.x / 1.x (jiná číselná řada, ne starší 4.x — a jedno z těch sestavení také dosahuje součtu {sum})',
  'detect.modern.noSum':
    'žádný slot se nedešifruje na kontrolní součet {sum}, který vyžaduje bootloader této rodiny',
  'detect.modern.sum': 'slot se dešifruje na kontrolní součet {sum}',
  'detect.modern.version':
    'firmware {version} patří do řady po roce 2018, kterou tato mapa selektorů pokrývá (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'prostý dvoubajtový BeginFirmwareUpgrade aktivoval chráněný slot, takže nejde o zamčený starší firmware',
  'detect.modern.none': 'žádný důkaz neřadí tuto kameru do řady po roce 2018',
  'detect.early.noVersion': 'nebyla nahlášena ani v hlavičce obrazu nalezena žádná verze firmwaru',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'firmware {version} je {first} nebo novější, takže jeho tabulka RPC má getter pro GetFeaturedFirmwareData a platí běžná cesta čtení',
  'detect.early.older':
    '{said} firmware {version}, který je starší než {first} — první sestavení, jehož tabulka metod RPC má obsluhu čtení (getter) pro GetFeaturedFirmwareData',
  'detect.early.noWindow': 'a nepodařilo se přečíst žádné okno, což odpovídá této předpovědi',
  'detect.generic.fallback':
    'záložní varianta: žádná rodina firmwaru neodpovídala s jistotou, takže čtení zůstává dostupné a zápisy ne',
  'detect.compact2016.early':
    'firmware {version} je starší než 0.8.0.0 a nemá obsluhu čtení pro GetFeaturedFirmwareData — to je early-compact, ne tato rodina',
  'detect.compact2016.modernSum':
    'slot se dešifruje na kontrolní součet {sum}, který není cílem této generace',
  'detect.compact2016.plainArmed':
    'prostý dvoubajtový BeginFirmwareUpgrade aktivoval chráněný slot, takže tato kamera není na zamčené řadě, kterou tato rodina sdílí s legacy-auth',
  'detect.compact2016.notLine': 'firmware {version} nepatří do řady 0.x / 1.x',
  'detect.compact2016.storedPlain':
    'slot je uložen v otevřené podobě — výpočet proudu klíče vrací identický stav, takže jeho uložená slova JSOU obraz — což je nešifrovaný řetězec z roku 2014; sloty této generace jsou xorshift128 pod skutečným klíčem',
  'detect.compact2016.keyedZero':
    'slot uložený pod skutečným proudem klíče xorshift128 se dešifruje na kontrolní součet {sum}, což je šifra této generace',
  'detect.compact2016.zeroSum':
    'slot se dešifruje na kontrolní součet {sum}, což je cíl této generace',
  'detect.compact2016.refused':
    'a chráněný slot odmítl prostou dvoubajtovou aktivaci, což je zamčená obsluha',
  'detect.compact2016.proLine':
    '{said} firmware {version}, řada 1.0.3.x kamery Compact PRO z roku 2016',
  'detect.compact2016.compactLine':
    '{said} firmware {version}, sestavení Compact, ne řada 1.0.3.x kamery Compact PRO',
  'detect.compact2016.lockedLine':
    '{said} firmware {version}, na řadě 0.x / 1.x, kterou tato generace sdílí se zamčeným starším firmwarem',
  'detect.compact2016.bootloader2016':
    'bootloader hlásí {version}, bootloader generace 2016 (1.2.0.0 je změřen pod Compact PRO 1.0.3.0; bootloader kamery Compact z roku 2014 je 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'bootloader hlásí {version}, číslování generace 2014, ne této generace',
  'detect.compact2016.none':
    'nebyl pozorován žádný slot, který by se pod skutečným klíčem dešifroval na nulový kontrolní součet',
  'detect.legacy.proLine':
    'ale firmware {version} je řada 1.0.3.x kamery Compact PRO z roku 2016, jejíž sloty používají šifru compact-2016: kontrola přijetí této rodiny by u každého z nich selhala',
  'detect.legacy.early':
    'firmware {version} je starší než 0.8.0.0: jeho tabulka RPC nemá obsluhu čtení pro GetFeaturedFirmwareData (před 0.7.0.7 vůbec žádnou a na 0.7.0.7 a 0.7.0.8 jen setter) — to je early-compact, ne tato rodina',
  'detect.legacy.keyedZero':
    'slot uložený pod skutečným proudem klíče xorshift128 se dešifruje na {zero} — šifra kamery Compact PRO z roku 2016 (compact-2016). Tato řada ukládá své sloty v otevřené podobě se součtem slov 0 (řetězec z roku 2014) nebo s klíčem na {sum} (Compact 1.3.0.8) a její kontrola přijetí takový slot odmítne',
  'detect.legacy.plainChain':
    'slot je uložen jako otevřený firmware, jehož slova dávají součet 0, tak jak ho spouští bootloader z roku 2014 této řady',
  'detect.legacy.refused':
    'kamera odmítla otevřít zamčený slot pro aktualizaci, když byla požádána bez odemknutí, jak to dělá jen tato generace firmwaru',
  'detect.legacy.unlocked':
    'a stejný slot otevřela, když byla požádána s odemknutím, takže odemknutí, které tato rodina posílá, je to, které tato kamera kontroluje',
  'detect.legacy.notLine': '{said} firmware {version}, který nepatří do starší řady 0.x / 1.x',
  'detect.legacy.authOnly':
    'otevřela zamčený slot pro aktualizaci, když byla požádána s odemknutím, jak to dělá tato generace firmwaru; žádost bez odemknutí se nezkoušela, takže to samo o sobě generaci neprokazuje',
  'detect.legacy.version':
    'firmware {version} patří do starší řady 0.x / 1.x, což je jiná číselná řada než verze aplikací po roce 2018, ne starší 4.x',
  'detect.legacy.none': 'nic pozorovaného neukazuje na ověřený kanál čtení',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'pozastaveno po běhu na kameře: tam záplata nezvýšila rychlost publikování snímků a závěrka cvakala při každém snímku po zápisu',
  'fps.table.predates':
    'firmware {version} je starší než 0.8.0.0: jeho tabulka RPC nemá obsluhu čtení pro GetFeaturedFirmwareData, příkaz, který posílá čtení slotu, takže čtení a zápis slotů nepracují s žádným slotem tohoto sestavení a záplata se nenabízí',
  'fps.table.stageTwoFf':
    'stage two: sestavení 16 Hz FF se předává tak, jak ho předává aplikace výrobce (obraz XOR klíč A, uložený pod klíčem B), ne jako otevřené bajty, takže se jeho kontrola předání neprovádí a záplata se zatím nenabízí',
  'fps.table.stageTwo':
    'stage two: tato položka není v sadě stage two, takže se její kontrola předání neprovádí a záplata se zatím nenabízí',
  'fps.table.notOffered': 'nenabízí se',
  'fps.table.notImage':
    'toto není obraz firmwaru, takže se na něj žádná záplata snímkové frekvence nevztahuje',
  'fps.table.otherBuild':
    'obraz je sestavení {image}, ale kamera hlásí {camera}; záplata se raději odmítne, než aby se použila na sestavení, kterému neodpovídá',
  'fps.table.otherBuildNoVersion':
    'obraz je sestavení {image}, ale kamera nehlásí žádnou verzi; záplata se raději odmítne, než aby se použila na sestavení, kterému neodpovídá',
  'fps.table.patched': 'záplata snímkové frekvence už je použita: tento obraz běží na {hz} Hz',
  'fps.table.earlierPatch':
    'tento obraz obsahuje dřívější záplatu snímkové frekvence {hz} Hz bez opravy USB a záplata se nikdy nepoužije na záplatovaný obraz: obnovte původní obraz a potom ho záplatujte',
  'fps.table.atRate': 'toto sestavení už běží na {hz} Hz bez záplaty',
  'fps.table.not4821':
    'tento obraz hlásí sestavení Compact 4.8.2.1 (nebo Compact XR 4.8.2.1, stejné sestavení), ale není to původní obraz, pro který byla záplata snímkové frekvence napsána (f96ac57eda75: jeho stránky příkazů o 68 bajtech, stálá stránka 13), takže se pro něj žádná záplata snímkové frekvence nevytvoří',
  'fps.table.notInTable':
    'tento obraz není v tabulce záplat snímkové frekvence, takže se pro toto sestavení žádná záplata nevytvoří. Tabulka uvádí sestavení Compact 0.7.0.8 až 1.3.0.8 (8 Hz; 0.7.0.8 kód slotů odmítá), 1.3.0.8 (16 Hz FF), 4.8.1.7, 4.8.1.9, 4.8.2.1 a 4.16.1.7 FF a sestavení Compact PRO 1.0.3.x a 4.9.x; žádné jiné sestavení položku nemá',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'plán tohoto sestavení nemá {bank:acc}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank} na tomto sestavení nemůže přijmout dešifrovaný obraz: {reason}',
  'fps.plan.empty': 've {bank:loc} není žádný dešifrovaný obraz k záplatování (je prázdný)',
  'fps.plan.noImage':
    've {bank:loc} není žádný dešifrovaný obraz k záplatování (nebyl přečten nebo ho neotevře žádný klíč)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name} byl zapsán, ale jeho kontrolní čtení se od uloženého slotu neliší jen podle plánu, takže se sloty po něm nezapsaly',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build (slots/capability-notes) ----
   * The page shows only this one; it leaves the others out (lib/page-hidden.ts), and the CLI prints them
   * in English. */
  'notes.unverified':
    'Jen pro čtení. Rozložení slotů odpovídá dekódované tabulce zamčené řady, ale pro toto sestavení nebyla změřena žádná podoba předání, takže se neplánuje žádný zápis.',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'kamera nenahlásila verzi firmwaru ({note}); číslo příkazu neznamená na každém firmwaru Seek totéž — na Compact 0.3.0.1 je wire id 0x52, id, které aktivuje okno čtení, EnterBootloaderMode — takže dokud verze není známa, neposílá se nic kromě GetErrorCode, GetOperationMode a GetFirmwareInfo, čtení, na která odpovídá každé sestavení stejně',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo neodpověděl ({error}) na žádné z {reads} čtení s odstupem {spacing} ms, v okně startu {window} ms; kamera, která teprve startuje, v něm odpoví',
  'identity.note.neverTwice':
    'GetFirmwareInfo nikdy neodpověděl dvakrát po sobě během {reads} čtení',
  'identity.note.noAnswer': 'GetFirmwareInfo neodpověděl ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo neodpověděl ({error}); odpovědělo {answered} z {reads} čtení, nikdy dvě po sobě, takže žádné z nich nelze odlišit od záznamu, který nechal vybraný dřívější příkaz',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo vrátil {count} bajt, na verzi příliš málo',
    few: 'GetFirmwareInfo vrátil {count} bajty, na verzi příliš málo',
    many: 'GetFirmwareInfo vrátil {count} bajtu, na verzi příliš málo',
    other: 'GetFirmwareInfo vrátil {count} bajtů, na verzi příliš málo',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo vrátil {count} bajt, na verzi příliš málo; {context}',
    few: 'GetFirmwareInfo vrátil {count} bajty, na verzi příliš málo; {context}',
    many: 'GetFirmwareInfo vrátil {count} bajtu, na verzi příliš málo; {context}',
    other: 'GetFirmwareInfo vrátil {count} bajtů, na verzi příliš málo; {context}',
  },
  'identity.note.otherRecord':
    'první čtení vrátilo jiný záznam ({version}), na kterém dřívější příkaz nechal selektor informací o firmwaru — toto čtení ho vynulovalo',
  'identity.note.afterStartup': {
    one: 'odpověděl poté, co během startu odmítl {count} čtení',
    few: 'odpověděl poté, co během startu odmítl {count} čtení',
    many: 'odpověděl poté, co během startu odmítl {count} čtení',
    other: 'odpověděl poté, co během startu odmítl {count} čtení',
  },
  'identity.predates':
    'firmware {version} je starší než protokol výpisu: jeho tabulka metod RPC nemá obsluhu čtení pro GetFeaturedFirmwareData (na 0.7.0.7 a 0.7.0.8 je zaregistrována jen jako setter a předtím je wire id 0x4F UploadFirmwareRowSize), takže s ní nelze přečíst žádné okno; na 0.3.0.1 je wire id 0x52 EnterBootloaderMode místo BeginFirmwareUpgrade. Běh na kartě 0.x/1.x místo toho čte 0.7.0.7 a 0.7.0.8 přes wire id 0x58 (GetFeaturedData)',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'odmítá se {operation}: {reason}',
  'identity.refusingNoVersion':
    'odmítá se {operation}: {reason}. Nic nebylo aktivováno. Odpojte kameru, znovu ji připojte, nechte ji dokončit start a zkuste to znovu.',
  'identity.operation.dump': 'výpis',
  'identity.operation.dumpAll': 'vyčtení všech selektorů',
  'identity.operation.readInfo': 'čtení informací o zařízení',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup': 'sloty se volí po záloze, která je čte — nejdřív spusťte zálohu',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'po proběhnutí nebo pokusu o potvrzení zápisu už sloty nelze změnit: tento běh zapisuje: {banks}; obnovení vrátí přesně tyto sloty',
  'preserve.banks.none': 'žádný slot',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Zapsáno.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Přečteno. Čitelné sloty: {count}/{of}.',
  'status.readRefused':
    'Přečteno, ale do žádného slotu této kamery odsud nelze zapisovat — viz protokol.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Verze firmwaru',
  'compare.field.imageId': 'ID obrazu',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'Počáteční SP',
  'compare.field.resetVector': 'Vektor resetu',
  'compare.field.size': 'Velikost',
  'compare.field.shaExpected': 'SHA-256 očekávaného otevřeného obrazu',
  'compare.field.sha': 'SHA-256 obrazu',
  'compare.field.shaNotStored':
    'SHA-256 očekávaného otevřeného obrazu (uložené bajty se nepředpovídají)',
  'compare.field.key': 'Klíč',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(žádný obraz)',
  'compare.notImage': '(není obraz)',
  'compare.notPredicted': '(nepředpovídá se: o tom, co uloží, rozhoduje zařízení)',
  'compare.plaintext': 'žádný (otevřený text)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'nešel dvakrát přečíst stejně',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (klíč, pod kterým bootloader kontroluje slot, je odvozen ze {bank:gen}, do kterého vstoupil bez kontroly) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered': '{bank}, jak ho kamera zaznamenává (slovo aktivního slotu {word})',
  'preserve.lastStart.notRead': 'neznámé — slovo aktivního slotu se nepodařilo přečíst',
  'preserve.lastStart.noBank':
    'neznámé — slovo aktivního slotu je {word}, což neoznačuje žádný slot',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'neznámé — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'nezapisuje se — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'obraz',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — lze zapsat',
  'preserve.bank.writablePatch': '{build} — lze zapsat; záplata mění {count} B',
  'preserve.bank.writableEdit': '{build} — lze zapsat; obsahuje {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — lze zapsat; záplata mění {count} B; obsahuje {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead': 'záloha sloty ještě nepřečetla, takže nelze zvolit žádný slot',
  'preserve.choice.every': 'každý slot, který obsahuje obraz: {banks}',
  'preserve.choice.everyBlocked':
    'ne každý slot, který obsahuje obraz, lze zapsat: {bank} nelze — {reason}',
  'preserve.choice.noImage': 'žádný slot neobsahuje obraz, který by běh mohl zapsat',
  'preserve.choice.nextStart': '{bank}, slot, do kterého vstoupí příští start: {why}',
  'preserve.choice.nextStartRefused':
    'příští start vstoupí do {bank:gen} ({why}) a běh ho nemůže zapsat: {reason}',
  'preserve.choice.everyUnknownStart':
    'každý slot, který obsahuje obraz ({banks}): není známo, do kterého slotu vstoupí příští start ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'není známo, do kterého slotu vstoupí příští start ({why}), a {reason}; zvolte slot podle názvu',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank} nelze zapsat: {reason}',
  'preserve.choice.byName': '{banks}, slot zvolený podle názvu',
  'preserve.choice.warnNotPatched':
    'Příští start vstoupí do {bank:gen} ({why}) a tato volba ho nezáplatuje: po restartu kamera spustí vlastní obraz tohoto slotu, takže se čtení celé paměti flash zastaví dřív, než cokoli přečte. Obnovení přesto vrátí každý zapsaný slot.',
  'preserve.choice.warnUnknownStart':
    'Není známo, do kterého slotu vstoupí příští start ({why}). Pokud vstoupí do slotu, který tato volba nezáplatuje, čtení celé paměti flash se zastaví dřív, než cokoli přečte.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'zatím neznámé',
  'preserve.build.firmware': 'firmware {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'tak, jak ho kamera ukládá (tato kamera uchovává firmware nešifrovaný)',
  'preserve.stagedForm.oneKey': 'v podobě, v jaké ho kamera ukládá (zašifrovaný klíčem kamery)',
  'preserve.stagedForm.twoKeys':
    'v podobě, v jaké ho kamera ukládá (zašifrovaný dvěma klíči kamery)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'každý zapsaný slot dostane zpět přesně ty bajty, které z něj přečetla záloha',
  'preserve.restoreForm.factoryStaged':
    'každý zapsaný slot dostane zpět svůj původní firmware, zapsaný v podobě, v jaké ho kamera ukládá, takže slot skončí bajt po bajtu tak, jak ho přečetla záloha',
  'preserve.restoreForm.none':
    'na tomto sestavení není možné: žádná podoba původního firmwaru neprojde vlastní kontrolou kamery a zároveň se neuloží zpět jako původní bajty, takže běh skončí s úplným obrazem a záplatou stále na místě',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'na tomto sestavení není možné: záplatovaný firmware nedokáže přečíst celou paměť flash, takže běh nemá úplný obraz, který by mohl dát',
  'preserve.drain.rotated': 'kamera ji poskytuje pootočenou a běh ji vrátí do správného pořadí',
  'preserve.drain.hazard': 'záplata se na tomto sestavení vyhne čtení, které kameru shodí',
  'preserve.drain.whole': 'celá paměť flash (4 MB) jedním čtením, po {size} B',
  'preserve.drain.wholeNotes': 'celá paměť flash (4 MB) jedním čtením, po {size} B; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'umožní příkazu ke čtení kamery dosáhnout na celou paměť flash (4 MB), ne jen na prvních 64 KB',
  'preserve.site.countPast':
    'umožní pozici čtení počítat za 64 KB, aby se čtení nevrátilo na začátek',
  'preserve.site.keepPosition': 'zachová celou pozici čtení, když se po každém čtení posune',
  'preserve.site.savePosition': 'uloží posunutou pozici čtení celou',
  'preserve.site.clearPosition':
    'vynuluje celou pozici čtení na začátku každého čtení, aby šla kamera přečíst i po čtení celé paměti flash',
  'preserve.site.modeTwoGuard':
    'umožní zahájit čtení celé paměti flash jako jakékoli jiné čtení (původní firmware ho odmítne)',
  'preserve.site.modeTwoIndirection':
    'nasměruje čtení celé paměti flash na začátek paměti flash (původní firmware ho směruje na hodnotu, která kameru shodí)',
  'preserve.site.armTail':
    'odstraní volání, které na tomto sestavení kameru při zahájení čtení zmrazí',
  'preserve.site.other': 'změní jednu instrukci, kterou čtení celé paměti flash potřebuje',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Záloha',
  'preserve.step.patch': 'Záplata',
  'preserve.step.commit': 'Zápis',
  'preserve.step.drain': 'Čtení celé paměti flash',
  'preserve.step.restore': 'Obnovení',
  'preserve.step.verify': 'Kontrola',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'krok záplata',
  'preserve.stepId.commit': 'krok zápis',
  'preserve.stepId.drain': 'krok čtení celé paměti flash',
  'preserve.stepId.restore': 'krok obnovení',
  'preserve.stepId.verify': 'krok kontrola',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: zastaveno podle plánu — kamera nastartovala ze {bank:gen}, který tento běh nezáplatoval, takže se nic nepřečetlo.',
  'preserve.result.noReason': 'nebyl zaznamenán žádný důvod',
  'preserve.result.stopped': '{label}: zastaveno — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none': 'žádný slot neobsahuje firmware, který by běh mohl záplatovat',
  'preserve.result.writable.one': 've {banks:loc} je firmware, který běh může záplatovat',
  'preserve.result.writable.many': 've {banks:loc} je firmware, který běh může záplatovat',
  'preserve.result.backup': '{label}: uložen každý blok, na který dosáhne běžné čtení; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'neznámý slot',
  'preserve.result.backupNext':
    '{label}: uložen každý blok, na který dosáhne běžné čtení; {writable}; příští start: {next}.',
  'preserve.result.patch': '{label}: sestaveno pro {banks:acc}.',
  /** The patch step when every bank was refused: nothing to build for. */
  'preserve.result.patchNone':
    '{label}: žádná záplata nebyla sestavena: žádný slot neobsahuje firmware, který by běh mohl záplatovat.',
  'preserve.result.patchCount': '{label}: sestaveno pro {banks:acc}; v každém se mění {count} B.',
  'preserve.result.commitOne': '{label}: do {banks:gen} zapsána záplata a kamera ji přijala.',
  'preserve.result.commitMany':
    '{label}: do {banks:gen} zapsána záplata a kamera ji u každého přijala.',
  'preserve.result.drainNotRead': '{label}: nepřečteno.',
  'preserve.result.drain':
    '{label}: celá paměť flash (4 MB) přečtena; úplný obraz má sha256 {sha256}.',
  'preserve.result.drainThrough':
    '{label}: celá paměť flash (4 MB) přečtena přes {bank:acc}; úplný obraz má sha256 {sha256}.',
  'preserve.result.restore': '{label}: do {banks:gen} zapsán zpět původní obsah.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm': '{label}: do {banks:gen} zapsán zpět původní obsah, {form}.',
  'preserve.result.verifyDone': '{label}: hotovo.',
  'preserve.result.verifyIdentical':
    '{label}: znovu přečteno bloků: {blocks}, rozdílných bajtů: 0 — paměť flash kamery je bajtově shodná se zálohou.',
  'preserve.result.verifyDiffers':
    '{label}: znovu přečteno bloků: {blocks}, rozdílných bajtů: {bytes}.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: znovu přečteno bloků: {blocks}, rozdílných bajtů: {bytes}, nečitelných bloků: {count}.',
    few: '{label}: znovu přečteno bloků: {blocks}, rozdílných bajtů: {bytes}, nečitelných bloků: {count}.',
    many: '{label}: znovu přečteno bloků: {blocks}, rozdílných bajtů: {bytes}, nečitelných bloků: {count}.',
    other:
      '{label}: znovu přečteno bloků: {blocks}, rozdílných bajtů: {bytes}, nečitelných bloků: {count}.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Zastaveno před čtením celé paměti flash: kamera nastartovala ze slotu, který tento běh nezáplatoval, takže se nic nepřečetlo.',
  'preserve.unpatchedStart.next':
    'Dále: obnovení vrátí každý zapsaný slot. Čtení celé paměti flash se znovu nezkouší: kamera by nastartovala ze stejného slotu.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Hotovo — váš firmware je zachován',
  'preserve.done.detail':
    'Úplný obraz je celá původní paměť flash kamery a samotná kamera je zpět přesně v původním stavu.',
  'preserve.done.titleNoImage':
    'Hotovo — kamera je zpět v původním stavu; úplný obraz není k dispozici',
  'preserve.done.detailNoImage':
    'Čtení celé paměti flash neproběhlo, takže tento běh nemá úplný obraz paměti flash. Každý zapsaný slot byl vrácen a nové čtení bloků, na které dosáhne běžný výpis, odpovídá záloze. Pro úplný obraz spusťte nový běh s volbou, která zahrnuje slot, do kterého vstoupí příští start.',
  'preserve.done.detailNoImageCount':
    'Čtení celé paměti flash neproběhlo, takže tento běh nemá úplný obraz paměti flash. Každý zapsaný slot byl vrácen a nové čtení bloků, na které dosáhne běžný výpis (celkem {blocks}), odpovídá záloze. Pro úplný obraz spusťte nový běh s volbou, která zahrnuje slot, do kterého vstoupí příští start.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'čtečka oken kamery má na jeden start omezený rozpočet a tato čtení se vrátila z vyčerpané čtečky — vypněte a zapněte kameru (odpojte ji a znovu připojte, nebo použijte její vypínač) a potom znovu spusťte `preserve --resume <run-directory>`. Signatura: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'čtečka oken kamery má na jeden start omezený rozpočet a tato čtení se vrátila z vyčerpané čtečky — vypněte a zapněte kameru (odpojte ji a znovu připojte, nebo použijte její vypínač) a potom znovu spusťte `preserve --resume <run-directory>`. Signatura: {signature} — z těchto bajtů nelze odvodit žádný tovární otevřený text. Vyzkoušely se všechny způsoby, jak ho přečíst:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'záloha neobsahuje {bank:acc} ({address}) — běžná okna ho nedokážou poskytnout',
  'preserve.fail.readsDisagree':
    'dvě čtení {bank:gen} se neshodují (sha256 {sha256} vs. {other}) — do kamery, která nedokáže dvakrát po sobě stejně poskytnout slot, ze kterého běží, se zapisovat nemá; záznam je zdrojem obnovení a vstupem pro odvození záplaty',
  'preserve.fail.notFactory':
    've {bank:loc} není tovární obraz v podobě, v jaké ho ukládá šifra tohoto sestavení (očekávaný začátek obrazu neodpovídá záznamu) — odmítá se dřív, než se cokoli zaznamená, natož zapíše',
  'preserve.fail.ffSum':
    'záplatovaný firmware v podobě, v jaké ho kamera ukládá, neprojde vlastní kontrolou tohoto sestavení (jeho součet musí být {sum}) — odmítá se poslat slot, který by kamera po smazání odmítla',
  'preserve.fail.headChanged':
    'začátek {bank:gen} se od zálohy změnil (neobsahuje původní záznam ani záplatované bajty) — odmítá se zapisovat přes neznámý stav slotu; nic se nezapsalo. Hex začátku: aktuálně {live} vs. záznam {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks} už obsahuje záplatované bajty — potvrzení zápisu proběhlo při předchozím pokusu a nesmí se opakovat. Pokračujte krokem čtení celé paměti flash (--resume), který spustí záplatovaný obraz a pokračuje odtud.',
  'preserve.fail.landed':
    '{banks} už obsahují záplatované bajty — potvrzení zápisu proběhlo při předchozím pokusu a nesmí se opakovat. Pokračujte krokem čtení celé paměti flash (--resume), který spustí záplatovaný obraz a pokračuje odtud.',
  'preserve.fail.drainRebootRefused':
    'příkaz k restartu v kroku čtení celé paměti flash hostitel ODMÍTL dřív, než odešel (SecurityError: zásada prohlížeče nebo testovací pojistka), takže v kameře stále běží obraz, se kterým nastartovala, ne potvrzená záplata. Čtení celé paměti flash čte jen přes rozšířené okno záplatovaného obrazu, takže se zastaví dřív, než cokoli aktivuje; nic se nepřečetlo. Spusťte čtení celé paměti flash znovu tam, kde hostitel příkaz k restartu propustí.',
  'preserve.fail.shiftedRebootRefused':
    'čtení celé paměti flash se vrátilo o stránku posunuté a restart, který vyvolá další start, hostitel ODMÍTL dřív, než odešel (SecurityError: zásada prohlížeče nebo testovací pojistka) — další pokus by četl stejný posunutý start. Nic se neuchovalo; spusťte čtení celé paměti flash znovu tam, kde reset může odejít.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'kontrola našla {count} rozdílný bajt v oknech {read}/{total} — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
    few: 'kontrola našla {count} rozdílné bajty v oknech {read}/{total} — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
    many: 'kontrola našla {count} rozdílného bajtu v oknech {read}/{total} — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
    other:
      'kontrola našla {count} rozdílných bajtů v oknech {read}/{total} — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
  },
  'preserve.fail.verifyIn': {
    one: 'kontrola našla {count} rozdílný bajt v oknech {read}/{total} (místa: {places}) — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
    few: 'kontrola našla {count} rozdílné bajty v oknech {read}/{total} (místa: {places}) — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
    many: 'kontrola našla {count} rozdílného bajtu v oknech {read}/{total} (místa: {places}) — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
    other:
      'kontrola našla {count} rozdílných bajtů v oknech {read}/{total} (místa: {places}) — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
  },
  'preserve.fail.verifyShort': {
    one: 'kontrola našla {count} rozdílný bajt v oknech {read}/{total} (krátká okna: {short}) — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
    few: 'kontrola našla {count} rozdílné bajty v oknech {read}/{total} (krátká okna: {short}) — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
    many: 'kontrola našla {count} rozdílného bajtu v oknech {read}/{total} (krátká okna: {short}) — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
    other:
      'kontrola našla {count} rozdílných bajtů v oknech {read}/{total} (krátká okna: {short}) — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
  },
  'preserve.fail.verifyInShort': {
    one: 'kontrola našla {count} rozdílný bajt v oknech {read}/{total} (místa: {places}) (krátká okna: {short}) — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
    few: 'kontrola našla {count} rozdílné bajty v oknech {read}/{total} (místa: {places}) (krátká okna: {short}) — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
    many: 'kontrola našla {count} rozdílného bajtu v oknech {read}/{total} (místa: {places}) (krátká okna: {short}) — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
    other:
      'kontrola našla {count} rozdílných bajtů v oknech {read}/{total} (místa: {places}) (krátká okna: {short}) — paměť se při opětovném čtení neshoduje bajt po bajtu se zálohou',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'blok konfigurace startu',
  'preserve.fail.dataBlock': 'datový blok',

  'preserve.refused.secondRead': 'jeho druhé čtení selhalo ({error})',
  'preserve.refused.readsDisagree': 'jeho dvě čtení se neshodují (sha256 {sha256} vs. {other})',
  'preserve.refused.erased': 'je smazaný',
  'preserve.refused.watchdogMark':
    'jeho slovo hlavičky na +0x200 obsahuje {word}, značku, kterou bootloader zapíše přes slot po resetu watchdogu na začátku startu; bootloader tento slot už nepřijímá a běh v něm nemá obraz k záplatování',
  'preserve.refused.noHeader': 'na +0x200 nemá hlavičku obrazu',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'obsahuje {image} ({id}), ne sestavení, které v kameře běží ({camera})',
  'preserve.refused.otherKey':
    'kontrola bootloaderu ho odmítá: je uložen pod jiným klíčem, než pod kterým bootloader této kamery kontroluje sloty, a zápis přes kameru by ho uložil pod tím klíčem, takže by obnovení nedokázalo vrátit jeho přesné bajty',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'kamera hlásí firmware {camera}, očekává se {version} — záplata je odvozena z bajtů jednoho sestavení a nesmí se poslat do jiného',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'firmware {version} není sestavení 0.x ani 1.x a tento běh pokrývá jen sestavení z let 2014 a 2016. Kromě verze se nic nepřečetlo. Tuto kameru místo toho přečtěte na kartě „Výpis a dešifrování 4.x/Nano“: přečte paměť flash bez záplaty, každý blok kromě toho na 0x14060000, na který na těchto sestaveních nedosáhne žádné okno čtení.',
  'preserve.refused.preWidening':
    'firmware {version} je starší než cesta rozšíření a běh raději odmítne, než aby zapisoval přes slot, který nedokáže zpětně přečíst. Na této generaci kamera odmítá každý způsob zahájení čtení, který cesta potřebuje (změřeno na 0.3.0.1), její příkaz ke čtení nedosáhne na začátek paměti flash a velikost, kterou by záplata změnila, je uložena jinak. Nemá ani čtení, které by mohl použít běžný výpis. Kromě verze se nic nepřečetlo.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'obsahuje neznámý obraz (ne původní firmware {version} ani jeho známou úpravu), takže ho běh nezáplatuje ani nevrátí',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'obsahuje známé sestavení se záplatou snímkové frekvence: původní firmware {version} se záplatou snímkové frekvence {hz} Hz. Běh záplatuje jen původní firmware, nikdy záplatovaný obraz, takže tento slot nezáplatuje ani nevrátí',
  'preserve.image.frameRateEarlier':
    'obsahuje známé sestavení se záplatou snímkové frekvence: původní firmware {version} s dřívější záplatou snímkové frekvence {hz} Hz (vytvořenou dřív, než k ní přibyla oprava USB). Běh záplatuje jen původní firmware, nikdy záplatovaný obraz, takže tento slot nezáplatuje ani nevrátí',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    '{what}. Chcete-li tento slot zahrnout, nejdřív do něj zapište zpět původní obraz (například z úplné zálohy paměti flash pořízené před změnou) a potom spusťte nový běh',
  'preserve.image.frameRateWords':
    '{what}. Chcete-li tento slot zahrnout, nejdřív do něj zapište zpět původní obraz (například z úplné zálohy paměti flash pořízené před záplatou snímkové frekvence) a potom spusťte nový běh; záplatu snímkové frekvence lze na původním obrazu potom vytvořit znovu',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name} {what}. Běh bere firmware, který záplatuje, z tohoto slotu, takže se zastaví tady, dřív než se cokoli zapíše. Chcete-li tuto kameru zachovat, nejdřív zapište zpět původní obraz do {bank:gen} (například z úplné zálohy paměti flash pořízené před změnou) a potom spusťte nový běh.',
  'preserve.image.frameRateRefusal':
    '{name} {what}. Běh bere firmware, který záplatuje, z tohoto slotu, takže se zastaví tady, dřív než se cokoli zapíše. Chcete-li tuto kameru zachovat, nejdřív zapište zpět původní obraz do {bank:gen} (například z úplné zálohy paměti flash pořízené před záplatou snímkové frekvence) a potom spusťte nový běh; záplatu snímkové frekvence lze na původním obrazu potom vytvořit znovu.',
  'preserve.image.otherFirmware': 'obsahuje firmware {image}, ne {camera}, který běží v kameře',
  'preserve.image.otherFirmwareRefusal':
    '{name} obsahuje firmware {image}, ne {camera}, který běží v kameře, takže tento běh v něm nemá obraz, který by mohl záplatovat, a raději odmítne, než aby ho přepsal.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'neodvozuje se z něj žádný obraz, který by běh mohl záplatovat ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone': 'tento běh je hotový — všechny kroky dokončeny (běh {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    'krok {step} je v tomto běhu už hotový (dokončeno {finished}) — pokračování naváže krokem {next}',
  'preserve.gate.stepDoneUnknownTime':
    'krok {step} je v tomto běhu už hotový (dokončeno v neznámém čase) — pokračování naváže krokem {next}',
  'preserve.gate.backupRerun':
    'zálohu nelze spustit znovu: tento běh už dokončil {steps} a jeho další krok je {next} — použijte --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'předchozí pokus o zálohu selhal a kameru je nutné VYPNOUT A ZNOVU ZAPNOUT, než tento krok poběží znovu — opakování na stejném startu může přečíst zastaralé nebo prázdné bajty (změřeno: opakovaná záloha přečetla místo záznamu konfigurace startu startovací slovo bootloaderu). Vypněte a zapněte kameru (odpojte ji a znovu připojte, nebo použijte její vypínač), potom spusťte zálohu znovu a na vyzvání vypnutí a zapnutí potvrďte: běh to sám nevidí. Zaznamenané selhání: {error}',
  'preserve.gate.noErrorText': '(bez textu chyby)',
  'preserve.gate.patchAfterBackup':
    '{step} běží po záloze: běh vezme výpis každé oblasti, kterou dokáže přečíst běžný plán, a uloží ho DŘÍV, než se stane cokoli jiného — tato záloha je jediná kopie této kamery. Nejdřív spusťte krok zálohy.',
  'preserve.gate.commitAfterBackup': '{step} běží po záloze (viz krok záplata)',
  'preserve.gate.commitAfterPatch': '{step} běží po kroku záplata, který zaznamená, co předává',
  'preserve.gate.commitNeedsPatch':
    '{step} potřebuje záplatu {banks:gen} a krok záplata žádnou nezaznamenal — spusťte krok záplata znovu',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step} vyžaduje v adresáři běhu soubory zálohy a ty chybí: {files} — bez nich nemá potvrzení zápisu zdroj pro obnovení, takže odmítá',
  'preserve.gate.drainNoCommit':
    '{step} čte ZÁPLATOVANOU část přes rozšířené okno a tento běh nemá dokončené potvrzení zápisu — na původní kameře by se čtení zaseklo. Nejdřív spusťte potvrzení zápisu (nebo v něm pokračujte), nebo přeskočte výslovně (allowJump), pokud potvrzení proběhlo bez svého kontrolního bodu.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'krok čtení celé paměti flash odmítá pro {build}: {note}',
  'preserve.gate.detectedBuild': 'zjištěné sestavení',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'krok čtení celé paměti flash odmítá pro {build}: zahájení čtení celé paměti flash na nezáplatovaném firmwaru tohoto sestavení kameru shodí (čte z hodnoty, která není adresou v paměti flash; změřeno na emulátoru: poskytnuto 32 KB, pak kamera spadla). Změna, která čtení zabezpečí, je na {sites} a není mezi změnami, které tento běh zaznamenal pro {bank:acc} — před čtením celé paměti flash spusťte krok záplata (a dokončete zápis).',
  'preserve.gate.drainFiles':
    '{step} potřebuje {files} (dodaný výpis se dodatečně zpracuje se záznamem každého zapsaného slotu) a v adresáři běhu to není',
  'preserve.gate.restoreNoCommit':
    '{step} vrací původní sloty přes záplatu a tento běh nemá dokončené potvrzení zápisu — není co vracet. Nejdřív spusťte potvrzení zápisu (nebo v něm pokračujte), nebo přeskočte výslovně (allowJump), abyste obnovili už záplatovanou kameru.',
  'preserve.gate.restoreNeedsPatch':
    '{step} potřebuje souhrn záplaty každého zapsaného slotu (kvůli délce k předání) — nejdřív spusťte krok záplata',
  'preserve.gate.restoreNoForm':
    'krok obnovení odmítá pro {build}: žádná podoba původního firmwaru neprojde vlastní kontrolou kamery a zároveň se neuloží zpět jako původní bajty — kontrolní součet původního firmwaru je 0xB7AB9D17 (změřeno), ne 0xFFFF, které kamera vyžaduje. Tento běh skončí s úplným obrazem v ruce a záplatou na místě; původní obsah lze vrátit jen programátorem celé paměti flash.',
  'preserve.gate.restoreFiles':
    '{step} potřebuje {files} (původní obsah každého zapsaného slotu z kroku zálohy) a v adresáři běhu to není',
  'preserve.gate.verifyNoRestore':
    '{step} porovnává nový start se zálohou a tento běh nemá dokončené obnovení — záplatovaný slot by se ukázal jako rozdíly. Nejdřív spusťte obnovení (nebo v něm pokračujte), nebo přeskočte výslovně (allowJump), pokud obnovení proběhlo bez svého kontrolního bodu.',
  'preserve.gate.verifyNeedsBackup':
    '{step} potřebuje {file} (referenci pro porovnání) a v adresáři běhu není',
  'preserve.gate.needsBanks':
    '{step} potřebuje sloty, které přečetl krok zálohy, a stav žádné nemá',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'pro tento běh nejsou zvoleny žádné sloty: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank} nelze zapsat: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'záplata tohoto sestavení startuje jen ze slotu pro obnovu R: {note} — běh by zapsal {bank:acc}, odkud ho bootloader nikdy nespustí',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'soubor je příliš malý na hlavičku obrazu',
  'slots.image.notWordSized': 'velikost obrazu musí být násobkem 4 (zadáno {size} B)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'obraz má {size} B; bootloader odmítne jakékoli header.length >= {limit}, takže by nikdy nenastartoval',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'na {at} není hlavička obrazu (magic {magic}, očekáváno {expected}) — musí jít o dešifrovaný obraz firmwaru Seek, ne o zašifrovaný slot ani výpis paměti flash',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'počáteční ukazatel zásobníku {address} neleží v SRAM LPC43xx — nevypadá to jako dešifrovaný obraz',
  'slots.image.stackUnaligned': 'počáteční ukazatel zásobníku {address} není zarovnán na slovo',
  'slots.image.notThumb': 'vektor resetu {address} není adresa Thumb',
  'slots.image.noKeyPair':
    'název tohoto souboru neuvádí jeho dvojici klíčů a v obrazu se právě jednou nevyskytuje ani dvojice této kamery, ani dekódovaná dvojice aplikace, takže nelze zjistit, pro jaké klíče byl obraz sestaven. Dešifrované soubory se pojmenovávají podle klíčů, které obsahují.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'název souboru uvádí klíč A {keyA} a klíč B {keyB}, ale {mismatch}. Oba klíče musí být přítomny, každý právě jednou.',
  'slots.image.keyInHeader':
    'tento obraz má klíč na {at}, uvnitř okna nešifrované hlavičky — odmítá se ho záplatovat',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'klíč A a klíč B z názvu souboru vycházejí na překrývající se bajty na {at} a {other} — musí to být dvě odlišné hodnoty o 16 bajtech',
  'slots.image.retargetLost':
    'po přecílení obraz neobsahuje dvojici klíčů této kamery právě jednou — odmítá se sestavit data, pro jejichž pozdější aktualizace by bootloader neměl klíč',
  'slots.image.noStageKey':
    'obraz neobsahuje žádnou dvojici klíčů řady 2016, takže není klíč pro předání, kterým by se zakódoval',
  'slots.image.ffSumNoKeys':
    'tento obraz má součet slov 16 Hz FF 0xFFFF, ale neobsahuje dvojici klíčů 1.3.0.8-FF (obě poloviny, každou jednou), takže jeho podobu pro předání nelze sestavit. Nic se nezapsalo.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'toto je obraz 1.3.0.8 FF (16 Hz), který se předává ve své vlastní podobě s klíčem A (ff-form.ts), ne jako otevřený obraz. Nic se nezapsalo.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'plán byl sestaven pro firmware {firmware}, ale analýza čte {version}. Plán je zastaralý; sestavte ho znovu. Nic se nezapsalo.',
  'slots.plan.otherFirmwareUnknown':
    'plán byl sestaven pro firmware neznámé verze, ale analýza čte {version}. Plán je zastaralý; sestavte ho znovu. Nic se nezapsalo.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'plán byl sestaven pro kameru {planSerial}, ale analýza čte {serial}. Zápis se zde odmítá. Nic se nezapsalo.',
  'slots.plan.cameraUnknownSerial': 's neznámým sériovým číslem',
  'slots.plan.unknownSerial': 'neznámé sériové číslo',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, inside the sentence ("slot A"). */
  'slots.plan.otherAddress': 'plán míří na {address}, ale {name} tohoto sestavení je na {at}',
  'slots.plan.notRead': 'analýza už nečte {name:acc}. Nic se nezapsalo.',
  'slots.plan.edited':
    'kontrolní součet plánu neodpovídá jeho datům, takže byl plán upraven. Nic se nezapsalo.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'data mají {size} B, víc, než pojme {name}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck': '{risk}. Zápis do něj vyžaduje acknowledgeRisk: true. Nic se neodeslalo.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'tato kamera odsud nemůže přijmout obraz předaný v otevřené podobě: {reason}. Nic se nezapsalo.',
  'slots.plan.noKeyTable':
    'analýza neuvádí tabulku klíčů bootloaderu této kamery, takže obraz na ni nelze přecílit',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'stav potvrzení se po CompleteMemoryUpgrade nepodařilo přečíst, takže {name} může být zapsán jen zčásti. Než uděláte cokoli dalšího, přečtěte sloty znovu a výpis si ponechte.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'kamera odmítla zápis do {name:gen} při potvrzení se stavem {status}: {cause}. Nic se nezapsalo; slot je beze změny. Než uděláte cokoli dalšího, přečtěte sloty znovu.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade vrátil {status} ({cause}) pro {name:acc}: nic se nenaprogramovalo, ale mazání mohlo začít, takže slot může být zčásti smazaný. Než uděláte cokoli dalšího, přečtěte sloty znovu a výpis si ponechte.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade vrátil {status} ({cause}) — {name} může být zapsán jen zčásti. Než uděláte cokoli dalšího, přečtěte sloty znovu a výpis si ponechte.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'kamera nahlásila {status} při předávání {name:gen} na offsetu {offset} — přerušeno před CompleteMemoryUpgrade, takže se do paměti flash nic nezapsalo',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum': 'kontrolní součet přenosu neodpovídá předaným bajtům',
  'commit.cause.unsupported': 'obraz se pod klíči kamery nedešifroval nebo je typ dat odmítnut',
  'commit.cause.acceptance':
    'obraz odmítla jeho kontrola přijetí dřív, než se cokoli smazalo (kontrola závisí na sestavení)',
  'commit.cause.notArmed': 'nebyla aktivována žádná aktualizace slotu',
  'commit.cause.eraseFailed': 'fáze mazání selhala',
  'commit.cause.programFailed': 'fáze programování selhala',
  'commit.cause.verifyFailed': 'fáze ověření selhala',
  'commit.cause.unknown': 'stav, který zde není znám',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name} se nekopíruje sám na sebe. Nic se nezapsalo.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Nic se nezapsalo.',
  'copy.refused.noPlain':
    'Ve {name:loc} není žádný dešifrovaný obraz ke kopírování. Nic se nezapsalo.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} je ZIP, který zde nelze přečíst ({error}). Nic se nezapsalo.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} neobsahuje celou paměť flash. ZIP se přijme, pokud je to soubor běhu z karty 0.x/1.x, který obsahuje {preserve} (jakmile proběhl jeho krok úplného výpisu), zip z karty „Výpis a dešifrování 4.x/Nano“ ({dump}) nebo zip z „Vyčíst všechny selektory“ ({selectors}); tento ZIP obsahuje {names}. Nic se nezapsalo.',
  'restore.refused.noWholeFlashPatched':
    '{file} neobsahuje celou paměť flash. ZIP se přijme, pokud je to soubor běhu z karty 0.x/1.x, který obsahuje {preserve} (jakmile proběhl jeho krok úplného výpisu), zip z karty „Výpis a dešifrování 4.x/Nano“ ({dump}) nebo zip z „Vyčíst všechny selektory“ ({selectors}); tento ZIP obsahuje {names}. Soubor {patched} v něm je paměť flash s dočasnou záplatou běhu, takže se nepřijme. Nic se nezapsalo.',
  'restore.refused.zipEmpty': 'nic',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'úplná záloha paměti flash má {full} B (4 MB, celý čip, který přečte J-Link); {file} má {size} B. Nic se nezapsalo.',
  'restore.refused.noBank': 'plán tohoto sestavení nemá {bank:acc}. Nic se nezapsalo.',
  'restore.refused.outsideFlash':
    '{name} neleží v paměti flash o velikosti 4 MB. Nic se nezapsalo.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    '{where}: výpis, ze kterého pochází {file}, ho nepřečetl: podle jeho manifest.json je {address} mezera. Není co obnovit. Nic se nezapsalo.',
  'restore.refused.gapReason':
    '{where}: výpis, ze kterého pochází {file}, ho nepřečetl: podle jeho manifest.json je {address} mezera ({gap}). Není co obnovit. Nic se nezapsalo.',
  'restore.refused.gapFill':
    '{where}: výpis, ze kterého pochází {file}, ho nepřečetl: podle jeho manifest.json je {address} mezera vyplněná hodnotou {fill}. Není co obnovit. Nic se nezapsalo.',
  'restore.refused.gapReasonFill':
    '{where}: výpis, ze kterého pochází {file}, ho nepřečetl: podle jeho manifest.json je {address} mezera ({gap}) vyplněná hodnotou {fill}. Není co obnovit. Nic se nezapsalo.',
  'restore.refused.empty':
    '{where} je prázdný: každý bajt je 0xFF. Zápis programuje obraz a nemůže nechat slot smazaný, takže prázdný slot nelze obnovit zápisem. Nic se nezapsalo.',
  'restore.refused.fill':
    '{where} má v každém bajtu {fill}, výplň, kterou výpis zapisuje tam, kde nic nepřečetl: výpis tento slot nepřečetl. Není co obnovit. Nic se nezapsalo.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    '{where} nelze z tohoto souboru obnovit: {why}. Nic se nezapsalo.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'toto sestavení nemá pro slot aktivaci zápisu',
  'support.noStagingEmpty': 'toto sestavení nemá podobu předání, takže se prázdný slot nezapisuje',
  'support.buildUnknown': 'sestavení je neznámé',
  'support.unverifiedStaging':
    'toto sestavení je na zamčené řadě 0.x/1.x, ale nepatří mezi sestavení, na kterých byly změřeny tabulky záplat pro úplnou zálohu (0.8.0.0 .. 1.3.0.8 a 1.0.3.0 / 1.0.3.2), takže podoba předání jeho slotu je neznámá a nic se nezapisuje',
  'support.unknownFamily':
    'rodina kamery není známa, a tedy ani klíč, pod kterým se zapisují její sloty, a kamera přijme slot zapsaný pod špatným klíčem a pak z něj nenastartuje. Pořiďte výpis této kamery a dešifrujte ho, identifikujte ji z výpisu a potom uveďte její rodinu pomocí --family.',
  'support.noReadCommand':
    'firmware starší než 0.8.0.0 nemá obsluhu čtení pro GetFeaturedFirmwareData, příkaz, kterým výpis čte paměť flash. Na 0.7.0.7 a 0.7.0.8 je v tabulce metod RPC na 0x4F, ale zaregistrován jen jako setter (obsluha zápisu), takže čtení control-IN, které výpis posílá, nelze obsloužit (běh na kartě 0.x/1.x čte tato dvě sestavení místo toho přes wire id 0x58, GetFeaturedData); před 0.7.0.7 je wire id 0x4F UploadFirmwareRowSize a na 0.3.0.1 je wire id 0x52 — to, kterým výpis aktivuje — EnterBootloaderMode místo BeginFirmwareUpgrade: kamera zůstane ve své aplikaci, ale každá aktivace nastaví cíl v paměti flash a aktivuje fázi aktualizace firmwaru daného sestavení (GetErrorCode pak čte 0x00400000), což není okno čtení. Zjištěno z vlastních tabulek metod obrazů, z obou sloupců obsluh; viz test/firmware/facts.json.',
  'support.noWritePath':
    'tato sestavení přijímají nový firmware starší posloupností aktualizace, kterou tato sada nástrojů neposílá, a jejich sloty nebyly nikdy zmapovány, takže se nic nezapisuje.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'verzi firmwaru se nepodařilo přečíst, takže sestavení, jeho sloty a jejich podoba předání jsou neznámé; nic se na něm nečte ani nezapisuje',
  'support.versionNotDotted':
    'verze firmwaru „{version}“ není verze s tečkami, takže sestavení, jeho sloty a jejich podoba předání jsou neznámé; nic se na něm nečte ani nezapisuje',
  'support.olderThanFirst':
    'firmware {version} je starší než {first}: jeho tabulka RPC nemá obsluhu čtení pro GetFeaturedFirmwareData, příkaz, který posílá čtení slotu, takže se mu neposílá čtení ani zápis (důkazy má early-compact)',
  'support.modernOnLocked':
    'rodina modern-4x pokrývá 2.x, 4.x, 10.x, 42.x a 44.x; {version} je na zamčené řadě 0.x / 1.x, která potřebuje legacy-auth nebo compact-2016',
  'support.lockedOnModern':
    'rodina legacy-auth pokrývá zamčenou řadu 0.x / 1.x; {version} je na moderní řadě, která potřebuje modern-4x',
  'support.notCompactPro':
    'rodina compact-2016 pokrývá řadu Compact PRO 1.0.3.x; {version} na ní není',
  'support.earlyCompact':
    'rodina early-compact pokrývá jen sestavení starší než {first} a {version} se čte přes legacy-auth',
  'support.generic':
    'rodina kamery není identifikována (rodina generic), takže rozložení slotů a podoba předání jsou neznámé; před čtením nebo zápisem slotu kameru identifikujte',
  'support.noPlan':
    'pro rodinu {family} neexistuje žádný plán slotů: rozložení jejích slotů a podoba předání nejsou známy',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'tabulka tohoto sestavení neaktivuje režim {mode} na {address} na prostém kanálu',
  'support.noArmToken':
    'tabulka tohoto sestavení neaktivuje režim {mode} na {address} na kanálu s tokenem',
  'support.windowElsewhere':
    'okno slotu pro úplnou zálohu pro {bank:acc} je na {at}, ne na {address}',
  'support.noDumpWindow':
    'tabulka BeginFirmwareUpgrade tohoto sestavení nemá na {address} okno pro {bank:acc}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} nepodporuje {capability}: {reason}',
  'support.capability.dump': 'výpis',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': '„Vyčíst všechny selektory“',
  'support.capability.decrypt': 'dešifrování',
  'support.capability.deviceInfo': 'úplné čtení na kartě Info',
  'support.capability.flash': 'zápisy slotů',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name} na {address} na tomto sestavení nelze přečíst: jeho tabulka selektorů tam nemá okno, takže se pro něj nic neaktivovalo',
  'slots.unread.missing': '{name} chybí v analýze kamery',
  'slots.unread.notRead': '{name} nebyl přečten',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Nic se nezapsalo.',
  'slots.refused.versionUnknown':
    'analýza neuvádí, jaký firmware v kameře běží, a příkazy slotů znamenají na různých sestaveních různé věci. Přečtěte znovu informace o zařízení.',
  'slots.refused.versionUnknownWrite':
    'analýza neuvádí, jaký firmware v kameře běží. Nic se nezapsalo.',
  'slots.refused.emptyInput': 'vstup je prázdný',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable':
    '{name} je prázdný a na tomto sestavení do něj nelze zapsat: {reason}',
  'slots.refused.noRaw': '{name} na tomto sestavení nemůže přijmout surové bajty: {reason}',
  'slots.refused.noPlain': '{name} na tomto sestavení nemůže přijmout dešifrovaný obraz: {reason}',
  'slots.refused.noStaging':
    '{name} nemá na tomto sestavení podobu předání, takže pro něj nelze obraz zakódovat',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B je víc, než pojme {name} ({bankSize} B)',
  'slots.refused.imageTooLong': 'obraz má {size} B, víc, než pojme {name} ({bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'bootloader z roku 2014 nepřijme kontrolní součet tohoto sestavení ve slotu A ani B a spustí slot pro obnovu R (0x14070000) bez kontroly, takže se záplata zapíše do slotu pro obnovu R a nikam jinam',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly': 'toto sestavení běží jen ze slotu pro obnovu R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize': 'slot firmwaru má {size} B ({kib} KB); tento soubor má {count} B',
  'decryptFile.erasedBank':
    'prázdný, není co dešifrovat: všech {size} B se čte jako 0xFF (smazaný slot)',
  'decryptFile.erasedHeader':
    'smazaný: okno hlavičky obsahuje samé 0xFF, takže slot neobsahuje žádný obraz; nic se nedešifruje',
  'decryptFile.noHeader': 'žádná hlavička obrazu (magic {magic}), takže není co dešifrovat',
  'decryptFile.lengthOutOfRange': 'header.length {length} je mimo rozsah; není co dešifrovat',
  'decryptFile.ffKeyB':
    'dešifrováno {size} B pod klíčem B FF 1.3.0.8: obraz je uložen jako obraz XOR proud klíče jeho bloku klíčů 1, okno hlavičky beze změny',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'klíč nebyl získán: obraz se dešifruje na vektor resetu, který není vstupním bodem Cortex-M (klíč {check}); nic se nedešifruje',
  'decryptFile.storedPlain':
    'uložen v otevřené podobě: slot obsahuje obraz tak, jak běží (nešifrovaný řetězec z roku 2014, identický proud klíče), takže klíč neexistuje a dešifrovaný obraz je samotný obraz',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 'dešifrováno {size} B pod klíčem získaným z tohoto slotu ({check})',
  'decryptFile.decryptedNamed':
    'dešifrováno {size} B pod klíčem získaným z tohoto slotu ({check}; je to {key})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'krátké čtení ({size} B)',
  'read.reason.noParse': 'hlavičku obrazu nelze zpracovat',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'žádná hlavička obrazu (magic {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} je mimo rozsah',
  'read.reason.stopped': 'čtení slotu se zastavilo na {count}/{size} B',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'na firmwaru {version} nečitelné: jeho plán ({table}) nemá okno na {address}, takže se pro něj nic neaktivovalo',
  'read.reason.notInPlanUnknown':
    'na firmwaru neznámé verze nečitelné: jeho plán ({table}) nemá okno na {address}, takže se pro něj nic neaktivovalo',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'okno poskytlo bajty zastaralého deskriptoru čtečky — slovo 0 {word} s resetem {hex} je tabulka vektorů na 0x14000000, ne obsah tohoto slotu, takže se z něj nic neanalyzovalo: {remedy}',
  'read.reason.spentReader': 'sloty kamery se nepodařilo přečíst — {remedy}',
  'read.spentRemedy':
    'čtečka oken může být pro tento start vyčerpaná; vypněte a zapněte kameru a zkuste to znovu',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'slovo aktivního slotu kamery (fw info roots, selektor 10) se nepodařilo přečíst',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'slovo aktivního slotu kamery je {word}, což neoznačuje žádný slot',
  'checkKey.unnamed.cfg0NotRead':
    'slovo konfigurace startu nebylo přečteno, takže není známo, zda bootloader {bank:acc} před vstupem zkontroloval',
  'checkKey.unnamed.noZeroSum':
    'kamera hlásí, že vstoupila do {bank:gen}, ale {bank} se při tomto čtení nedešifruje na nulový součet slov',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'kamera hlásí, že vstoupila do {bank:gen}, který slovo konfigurace startu {word} nechává jako poslední, takže do něj bootloader vstoupil bez kontroly, ale {bank} se při tomto čtení nedešifruje na nulový součet slov',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (skóre {score} po čtení, podle důkazů níže)',
  'report.detectedAmbiguous': '{family} (skóre {score} po čtení, podle důkazů níže; nejednoznačné)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'ano',
  'report.cell.no': 'ne',
  'report.cell.notApplicable': '—',
  'report.cell.unknown': 'neznámé',
  'report.cell.recoveryOnly': 'jen pro obnovu',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'bělicí konstanta K',
  'report.keyRow.store': 'klíč zápisu',
  'report.keyRow.check': 'kontrolní klíč',
  'report.keyRow.table': 'tabulka klíčů',
  'report.keyRow.keys': 'klíče',
  'report.keyRow.a': 'klíč A',
  'report.keyRow.b': 'klíč B',
  'report.keyRow.tableAt': 'tabulka na',
  'report.key.notIdentified': '(neidentifikováno)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} kandidát, žádný nepotvrzen',
    few: '{count} kandidáti, žádný nepotvrzen',
    many: '{count} kandidáta, žádný nepotvrzen',
    other: '{count} kandidátů, žádný nepotvrzen',
  },
  'report.key.tableAt': '{offset} v bloku bootloaderu, potvrzeno vůči slotu',
  'report.key.plainChain':
    'není potřeba: sloty jsou uloženy jako otevřený firmware, takže se slot čte i zapisuje tak, jak je',
  'report.key.tableRefused2016':
    'nepřečteno — blok bootloaderu (0x14000000) se na této řadě odmítá na každém kanálu',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, pojmenováno podle {bank:gen}, slotu, do kterého podle kamery vstoupila po kontrole bootloaderu',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, odvozeno ze {bank:gen}, slotu, do kterého podle kamery vstoupila: bootloader do tohoto slotu vstupuje bez kontroly a spouští ho pod klíčem, pod kterým kontroluje ostatní sloty',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' ({pair}, blok 1)',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'dvojice Compact PRO 1.0.3.x 9 Hz',
  'keyPair.cp1032ff': 'dvojice Compact PRO 1.0.3.x FF',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'nepojmenován — {why}',
  'report.checkKey.couldNotName': 'čtení ho nedokázalo pojmenovat',
  'report.storeKey.checkKeyUnnamed':
    'klíč, pod kterým její bootloader kontroluje slot (při tomto čtení nepojmenovaný): aplikace ukládá každý slot, který zapíše, pod tímto klíčem',
  'report.storeKey.checkKey':
    '{key}: aplikace ukládá každý slot, který zapíše, pod klíčem, který kontroluje její bootloader',
  'report.storeKey.unknown': 'neznámý — blok bootloaderu se slotem klíče zařízení nebyl přečten',
  'report.storeKey.keyBUnidentified':
    'Klíč B (klíč zařízení není naprogramován; samotný klíč B neidentifikován)',
  'report.storeKey.keyB': 'Klíč B (klíč zařízení není naprogramován)',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain': 'předáván v otevřené podobě (obraz tak, jak je, bez klíče)',
  'report.staged.slotKeystream': 'předáván pod vlastním blokem klíčů 0 svého obrazu',
  'report.staged.keyA': 'předáván pod klíči odvozenými ze spuštěného slotu a běžící aplikace',
  'report.staged.ffVendor':
    'předáván tak, jak obraz 16 Hz FF předává aplikace výrobce (obraz XOR jeho vlastní blok klíčů 0), a kamera ho uloží pod klíčem B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Záloha: blok {address}',
  'progress.backupDone': 'Záloha: přečteny všechny bloky',
  'progress.checkBlock': 'Kontrola: blok {address}',
  'progress.checkDone': 'Kontrola: přečteny všechny bloky',
  'progress.writingBank': 'Zápis do {bank:gen}',
  'progress.restoringBank': 'Obnovení {bank:gen}',
  'progress.staged': '{label}: předáno {done}/{total} B',
  'progress.wholeFlash': 'Čtení celé paměti flash: {got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'čtení {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'čtení {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Hotovo — přečtená okna: {ok}/{total}.',
  'progress.readingBank': 'Čtení {bank:gen} ...',
  'progress.analysing': 'Analýza ...',
  'progress.probeSelector': 'zkouška selektoru {selector} ...',
  'progress.selectorsArmed': 'Hotovo — aktivované selektory: {armed}/{span}, s daty: {withData}.',
  'progress.recoveringKey': 'dešifrování: získává se klíč pro {address} ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank} {address} (subcmd {subcmd}) nelze přečíst: {error}',
  'slots.read.refusedBuild':
    'čtení slotů firmwaru se odmítá: {reason}. Kromě čtení verze se nic neodeslalo, takže se žádného slotu nic nedotklo.',
  'slots.backup.notSaved':
    'záloha {file} nebyla uložena, takže se nic nezapsalo. Zápis nikdy neproběhne bez předem uložené zálohy; zkuste to znovu, až ji bude možné uložit.',
  'slots.backup.notSavedWhy':
    'záloha {file} nebyla uložena ({error}), takže se nic nezapsalo. Zápis nikdy neproběhne bez předem uložené zálohy; zkuste to znovu, až ji bude možné uložit.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'vysoká (480 Mbit/s)',
  'usb.speed.full': 'plná (12 Mbit/s)',
  'usb.speed.code': 'kód {code}',
} satisfies Translation<'core', 'cs'>;
