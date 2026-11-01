/**
 * Namespace `core`, slovenščina (sl), translated from the English source: sentences that `@seek-fw/core` makes and
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
    'kamera ostane odklenjena do izklopa in vklopa, druga orodja pa jo lahko do takrat napačno preberejo; preden jih uporabite, kamero izklopite in znova vklopite',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': 'najprej {first}, nato {second}, nato {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'ni bila prebrana',
  'boot.verdict.checkKeyUnnamed':
    'se ni dala preveriti: ključ, s katerim njen zagonski nalagalnik preverja režo, ni bil poimenovan',
  'boot.cfg0NotRead':
    'beseda zagonske konfiguracije (cfg[0]) ni bila prebrana, zato ni znano, iz katere reže se kamera zažene ob naslednjem zagonu',
  'boot.select.unknown':
    'beseda zagonske konfiguracije je {word}, zato zagonski nalagalnik najprej poskusi {first:acc}, vendar {bank} {verdict}, zato ni znano, katera reža teče',
  'boot.select.first':
    'beseda zagonske konfiguracije je {word}, zato zagonski nalagalnik najprej poskusi {first:acc}, ta pa vsebuje sliko, ki jo zagonski nalagalnik sprejme',
  'boot.select.second':
    'beseda zagonske konfiguracije je {word}, zato zagonski nalagalnik najprej poskusi {first:acc}; {first} ne vsebuje slike, ki bi jo zagonski nalagalnik sprejel, zato vzame {second:acc}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'beseda zagonske konfiguracije je {word}, zato zagonski nalagalnik najprej poskusi {first:acc}; niti {first} niti {second} ne vsebuje slike, ki bi jo zagonski nalagalnik sprejel, zato zažene {last:acc}, ki je ne preverja',
  'boot.select.lastTakes':
    'beseda zagonske konfiguracije je {word}, zato zagonski nalagalnik najprej poskusi {first:acc}; niti {first} niti {second} ne vsebuje slike, ki bi jo zagonski nalagalnik sprejel, zato vzame {last:acc}, ki je ne preverja',
  'boot.bootsNow': 'Kamera se zdaj zažene iz {bank:gen}',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'zdaj zagnana',
  'boot.notBooted': 'ni zagnana',
  'boot.unknownWhy.checkKeyUnnamed':
    'ključ, s katerim njen zagonski nalagalnik preverja režo, pri tem branju ni bil poimenovan',
  'boot.unknownWhy.noKeyTable':
    'tabela ključev zagonskega nalagalnika ni bila prebrana, zato ključev, ki jih poskuša, ni mogoče poimenovati',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'Kamera se zažene iz {bank:gen}. {why}.',
  'fpsBoot.holdsOne':
    '{bank}: vsebuje popravek hitrosti sličic, vendar se ne zažene, zato popravek ne začne veljati.',
  'fpsBoot.holdsTwo':
    '{banks}: obe vsebujeta popravek hitrosti sličic, vendar se nobena ne zažene, zato popravka ne začneta veljati.',
  'fpsBoot.wouldNotRun':
    'Popravek {target:gen} ne bi poskrbel, da se zažene, ker se kamera namesto nje zažene iz {bank:gen}.',
  'fpsBoot.patchRunning':
    'Popravite tudi {bank:acc} (režo, ki teče): šele to poskrbi, da popravek hitrosti sličic začne veljati.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank}: tukaj je ni mogoče popraviti ({reason}), zato popravek hitrosti sličic v drugi reži v tej kameri ne začne veljati.',

  /* ---- backup: the zip saved before a bank write (slots/backup); `{name}` is the bank inside a sentence ("slot B"): each is an item of backup.plan.* ---- */
  'backup.bank.notInPlan': '{name:acc} (ni v načrtu te izdaje: zip to navaja)',
  'backup.bank.unsupported': '{name:acc} (ta izdaja je ne more prebrati, {reason}: zip to navaja)',
  'backup.bank.empty':
    '{name:acc} (prazna, vsi bajti so 0xFF: zip to navaja, zapis pa ne prepiše nobene vdelane programske opreme)',
  'backup.bank.unread':
    '{name:acc} (branje rež je ni doseglo: zip navaja, ali jo doseže branje pred zapisom)',
  'backup.bank.noKey':
    '{name:acc} (kot je shranjena; noben ključ, ki ga je obnovilo to branje, je ne odpre, zato dešifrirane datoteke ni)',
  'backup.bank.decrypted': '{name:acc} (kot je shranjena, in dešifrirana)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Preden se karkoli zapiše, stran znova prebere {banks} in rezultat shrani v en zip z opombo, kaj je posamezna datoteka: {file}.',
  'backup.plan.many':
    'Preden se karkoli zapiše, stran znova prebere {banks} in rezultat shrani v en zip z opombo, kaj je posamezna datoteka: {file}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'šifrirano tako, da ga naprava shrani pod ključem, ki ga vsebuje zagnana reža',
  'staging.detail.slotKeystreamCiphertext':
    'šifrirano z lastnim ključem za pripravo slike (blok ključev 0); kamera ga shrani pod lastnim ključem reže',
  'staging.detail.plain': 'nešifrirano, brez šifre',
  'staging.detail.keyAKeystream':
    'slika 1.3.0.8 FF, kot jo pripravi proizvajalčeva aplikacija (XOR ključ A) — izdaja 16 Hz jo shrani pod ključem B, ne kot te bajte',
  'staging.detail.verbatim': 'dobesedno — bajti natanko taki, kot so podani',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'ni branja',
  'copy.source.notInPlan': '{name} ni v načrtu te izdaje',
  'copy.source.notRead': '{name} ni bila prebrana ({reason}), zato ni slike za kopiranje',
  'copy.source.empty': '{name} je prazna: ni slike za kopiranje',
  'copy.source.foreign':
    '{name} ne vsebuje slike vdelane programske opreme, ki bi jo to branje prepoznalo, zato ni ničesar za kopiranje',
  'copy.source.noKey':
    'noben ključ, ki ga je obnovilo to branje, ne odpre {name:gen}, zato ni dešifrirane slike za kopiranje',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} na naslovu {address}, kot jo je dešifriralo branje rež',
  'copy.fromVersion':
    '{name} na naslovu {address}, vdelana programska oprema {version}, kot jo je dešifriralo branje rež',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'Slika je iz {name:gen}, kot jo je dešifriralo branje rež: {size} B, sha256 {sha256}.',
  'copy.noteVersion':
    'Slika je iz {name:gen}, kot jo je dešifriralo branje rež: vdelana programska oprema {version}, {size} B, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '{name} (na naslovu {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where} v polni varnostni kopiji {file}',
  'restore.fromVersion':
    '{where} v polni varnostni kopiji {file}, vdelana programska oprema {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'slika bliskovnega pomnilnika velikosti 4 MB',
  'restore.kind.preserve-run': 'datoteka izvedbe zavihka 0.x/1.x',
  'restore.kind.dump': 'zip zavihka „Izpis in dešifriranje 4.x/Nano“',
  'restore.kind.all-selectors': 'zip gumba „Izpiši vse selektorje“',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'sliko',
  'restore.decryptedTo.firmware': 'vdelano programsko opremo {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'Vir slike: {where} v datoteki {file}, {kind}: shranjeni sha256 {stored}, dešifrirano v {decrypted} velikosti {size} B (sha256 {sha256}).',
  'restore.note.imageEntry':
    'Vir slike: {where} v datoteki {file}, {kind} (vnos {entry}): shranjeni sha256 {stored}, dešifrirano v {decrypted} velikosti {size} B (sha256 {sha256}).',
  'restore.note.readBack':
    'Po zapisu se kontrolno prebrana reža primerja s shranjenimi bajti reže v varnostni kopiji.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'Identifikacijski blok varnostne kopije navaja to kamero (serijska številka {serial}).',
  'restore.note.sameBytes':
    '{name} že vsebuje shranjene bajte varnostne kopije: zapis vrne isto sliko.',
  'restore.warn.otherCamera':
    'Ta varnostna kopija je videti kot kopija druge kamere: njen identifikacijski blok navaja serijsko številko {theirs}, ta kamera pa je {camera}. Zapiše se samo slika {name:gen}; nič od identitete ali kalibracije tiste kamere.',
  'restore.warn.noIdentity':
    'Ta varnostna kopija nima identifikacijskega bloka na naslovu {address}, zato ni mogoče ugotoviti, s katere kamere je bila prebrana.',
  'restore.warn.serialNotRead':
    'Serijska številka kamere ni bila prebrana, zato varnostne kopije (serijska številka {serial}) ni mogoče povezati z njo.',
  'restore.warn.otherFirmware':
    'V varnostni kopiji vsebuje {where} vdelano programsko opremo {version}, kamera pa poganja {camera}: obnovitev v režo vnese drugo vdelano programsko opremo.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank} ni bila kontrolno prebrana, zato se ne primerja z varnostno kopijo.',
  'restore.readBack.equal':
    '{bank} se pri kontrolnem branju bajt za bajtom ujema s tem, kar hrani varnostna kopija.',
  'restore.readBack.differs':
    '{bank}: kontrolno branje se od shranjenih bajtov varnostne kopije razlikuje v {count} B (prvič na {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key}, izpeljan iz zagnane {bank:gen}',
  'keys.derived.holds':
    '{key} (ključ zapisa), izpeljan iz zagnane {bank:gen}, ki vsebuje {holds:acc}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key}, izpeljan iz zagnane reže',
  'keys.derived.holdsUnnamed':
    '{key} (ključ zapisa), izpeljan iz zagnane reže, ki vsebuje {holds:acc}',
  'keys.ffVendor.staged':
    'slika 1.3.0.8 FF (16 Hz), kot jo pripravi proizvajalčeva aplikacija: slika XOR njen lastni blok ključev 0 (ključ A), okno glave dobesedno, v katero koli režo; ključi te kamere se ne uporabijo',
  'keys.ffVendor.stored':
    'Ključ B: kamera preneseno vsebino znova šifrira z blokom ključev 1 in pod njim shrani sliko',
  'keys.imageBlock0.staged':
    'slika pod lastnim blokom ključev 0 (najdenim v sliki po vrednosti), v katero koli režo; ključi te kamere se ne uporabijo',
  'keys.imageBlock0.storedUnnamed':
    'ključ, s katerim njen zagonski nalagalnik preverja režo (pri tem branju ni poimenovan); kamera preneseno vsebino znova šifrira z njim',
  'keys.imageBlock0.stored':
    '{key}, ključ, s katerim njen zagonski nalagalnik preverja režo; kamera preneseno vsebino znova šifrira z njim',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED (nepreizkušeno): iz nobene kamere še ni bil prebran zagonski nalagalnik izdaje 16 Hz FF, zato ni znano, ali se zapisana reža zažene. Na zagonskem nalagalniku 0.9.0.0 se je starejša oblika te slike zagnala iz obnovitvene reže R; ta oblika se ne bo, ker ta zagonski nalagalnik obnovitveno režo R zažene takšno, kot je shranjena, ne da bi jo dekodiral.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'Slika 16 Hz FF se pošlje v obliki, ki jo bere le izdaja 16 Hz {version}. Ta kamera zapiše režo, ne da bi preverila sliko (tako pravi izvorna koda njene vdelane programske opreme in tako je ravnal Compact z 1.3.0.0, ko je bil preizkušen), zato je pričakovati, da bo bajte zapisala takšne, kot so poslani: reža potem vsebuje sliko v obliki, ki je ta kamera ne more zagnati.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Nič tukaj ne trdi, da jo kamera zažene.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast': 'Lastni odgovori kamere pravijo, da poganja izdajo 16 Hz FF: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'pred brisanjem reže preveri vsebino, ta vsebina pa to preverjanje prestane, zato lahko te bajte zapiše takšne, kot so, v obliki, ki je njen zagonski nalagalnik ne more zagnati: reža se morda ne bo zagnala (ni preizkušeno; varnostna kopija, shranjena pred zapisom, jo povrne)',
  'write.ff.outcome.refuses':
    'pred brisanjem reže preveri vsebino, ta vsebina pa tega preverjanja ne prestane, zato je pričakovati, da bo ta zapis zavrnila, preden karkoli zapiše (kamera s to izdajo je starejšo obliko te slike zavrnila na enak način)',
  'write.ff.runsSlow': 'Kamera poganja izdajo 8 Hz {version}: {why}. Ta izdaja {outcome}.',
  'write.ff.buildUnknown':
    'Lastni odgovori kamere ne povedo, katero izdajo {version} poganja: {why}. Če poganja izdajo 16 Hz FF, to vsebino sprejme. Če poganja izdajo 8 Hz, ta izdaja {outcome}.',
  'write.raw.asGiven':
    'Surova vsebina: poslana natanko takšna, kot je podana. Nič tukaj ne preveri, ali je zagonska.',
  'write.raw.ffStagedForm':
    'Ta vsebina je pripravljena oblika 1.3.0.8 FF (slika XOR blok ključev 0, vsota besed 0xFFFF). Kamera sliko shrani pod ključem B, zato se kontrolno branje preveri glede na te bajte.',
  'write.raw.noStaging':
    'Ta izdaja za režo ne navaja nobene oblike priprave, zato preverjanj zagonskega nalagalnika ni mogoče navesti.',
  'write.raw.reencrypts':
    'Naprava to vsebino dekodira in to, kar obdrži, znova šifrira, zato shranjeni bajti niso napovedani. Kontrolno branje se preveri kot slika, v katero se dešifrira, kjer je to mogoče povedati.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'Zagonski nalagalnik bi to vsebino zavrnil: {failure}.',
  'write.raw.stageKeyUnchecked':
    'Ključa za pripravo iz leta 2016 (blok ključev 0) v surovih bajtih ni, zato dešifrirana vsota besed te vsebine tukaj ni preverjena.',
  'write.image.rekeyRisk':
    '{name} že vsebuje sliko, ki je zagonski nalagalnik ne more sprejeti. Ta zapis pripelje v enako stanje.',
  'write.ack.recovery':
    'Obnovitvena reža R: zapis vanjo zahteva, da potrdite tveganje. Nič tukaj ne preveri, ali se kamera nato zažene.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: zapis vanjo zahteva, da potrdite tveganje, kamera pa po naslednjem izklopu in vklopu zažene, kar koli bo v njej.',
  'write.ack.bootUnnamed':
    'Zagnane reže ni bilo mogoče poimenovati, zato se ta obravnava kot zagnana',
  'write.ack.recoveryFallback':
    'Obnovitvena reža R je zadnja rezervna kopija, h kateri se zateče zagonski nalagalnik',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank': 'prazno/0: najprej reža A, nato B, nato obnovitvena',
  'boot.cfg0.modernB': 'najprej reža B, nato A, nato obnovitvena',
  'boot.cfg0.modernRecovery': 'najprej obnovitvena, nato A, nato B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'ni znano — {why}',
  'report.nextStart.runs': '{bank} — {why}',
  /** `{verdict}` is one of upgrade.verdict.*. `{name}` here is the bank inside a sentence ("slot B"); in upgrade.verdict.* it starts a sentence ("Slot B"). */
  'upgrade.whileRecovery':
    'Kamera poganja svojo obnovitveno režo, njena lastna nadgradnja pa piše v {name:acc}, ki je ne poganja. {verdict} To je le opozorilo: nič tukaj ne ustavi nadgradnje.',
  'upgrade.verdict.notRead':
    'Pri tem preverjanju {name:gen} ni bilo mogoče prebrati, zato ni znano, kaj vsebuje.',
  'upgrade.verdict.blank': '{name} je prazna, zato nadgradnja piše v prazno režo.',
  'upgrade.verdict.bootableSame':
    '{name} vsebuje isto zagonsko sliko kot reža, ki teče, in nadgradnja jo zamenja. Če se nadgradnja ustavi sredi poti, {name:nom} ostane nezagonska.',
  'upgrade.verdict.bootable':
    '{name}: vsebuje zagonsko sliko, ki jo nadgradnja zamenja. Če se nadgradnja ustavi sredi poti, ta reža ostane nezagonska.',
  'upgrade.verdict.unknown':
    'Zagonskost {name:gen} pri tem branju ni znana, zato lahko nadgradnja zamenja sliko, ki bi jo kamera zagnala.',
  'upgrade.verdict.notBootable':
    '{name} pri tem branju ni prikazana kot zagonska, zato nadgradnja ne zamenja nobene slike, ki bi jo kamera zagnala.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — reža, v katero je zagonski nalagalnik vstopil ob tem zagonu, kot jo beleži',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'ni prebrano',
  'report.lastStart.noBank': 'kamera sporoča {word}, kar ne označuje nobene reže',
  'report.lastStart.entered':
    'kamera sporoča, da je vstopila v {bank:acc} (beseda aktivne reže {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'brez različice',
  'running.why.otherVersion': 'kamera sporoča {version}, dve izdaji pa ima samo {only}',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'kamera ni odgovorila na ocene rež (selektorji GetFirmwareInfo 6, 7, 8)',
  'running.why.notRead':
    'reža, od katere so odvisne ocene, ni bila prebrana, zato odgovorov ni mogoče napovedati',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'kamera odgovori {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain': '{answers}, kar izdaja 8 Hz 1.3.0.8 odgovori za te reže ({predicted})',
  'running.why.ff': '{answers}, kar izdaja 16 Hz FF 1.3.0.8 odgovori za te reže ({predicted})',
  'running.why.both':
    '{answers}, obe izdaji pa za te reže odgovorita natanko tako, zato ju reže ne ločijo',
  'running.why.neither':
    '{answers}, kar se ne ujema z nobeno izdajo (8 Hz: {plain}; 16 Hz FF: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'Glava te slike ne navaja različice vdelane programske opreme, zato ni mogoče ugotoviti, ali je to izdaja, ki jo poganja kamera ({camera}). Preverite, ali je to slika, ki jo želite zapisati.',
  'imageBuild.otherVersion':
    'Ta slika je vdelana programska oprema {image}; kamera poganja {camera}.',
  'imageBuild.otherVersionTaken':
    'Ta slika je vdelana programska oprema {image}; kamera poganja {camera}. V tej seriji kamera preveri le, ali je slika pravilno oblikovana (njena glava in vsota besed), ne pa njene različice, zato to sliko sprejme in ko se zažene iz te reže, poganja {image}.',
  'imageBuild.otherVersionUnchecked':
    'Ta slika je vdelana programska oprema {image}; kamera poganja {camera}. Ali ta kamera sprejme drugo izdajo in jo poganja, ni bilo preverjeno.',
  'imageBuild.otherBuild':
    'Ta slika je izdaja 8 Hz {version}; kamera poganja izdajo 16 Hz {version} FF. Izdaja 16 Hz ob potrditvi preveri vsebino glede na lastno obliko FF in zavrne tisto, ki ne ustreza, preden izbriše režo (iz njene izvorne kode). Zapis izdaje 8 Hz vanjo na kameri še ni bil preizkušen.',
  'imageBuild.runningUnknown':
    'Ta slika je izdaja 8 Hz {version}. Kamera poganja {version}, ki obstaja kot izdaja 8 Hz in kot izdaja 16 Hz FF, njeni lastni odgovori pa niso povedali, katero poganja, zato ni mogoče ugotoviti, ali je to njena izdaja.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort': 'vsebina ima {size} B, kar je premalo za glavo na 0x200',
  'bootFail.noMagic':
    'na 0x200 ni magične vrednosti slike (najdeno {found}, zagonski nalagalnik potrebuje {needs})',
  'bootFail.lengthOutside': 'header.length {length} je zunaj vsebine velikosti {size} B',
  'bootFail.lengthNotPayload': 'header.length {length} ni dolžina vsebine {size}',
  'bootFail.overStage': '{size} B je več od {max} B, kolikor jih dopušča priprava',
  'bootFail.plainSum': 'shranjena vsota besed {sum}, zagonski nalagalnik iz leta 2014 potrebuje 0',
  'bootFail.noFooter': 'na {offset} ni noge: vsebina se konča na {end}',
  'bootFail.footerNotCode':
    'noga na {offset} ni „CODE“ — zagonski nalagalnik vzame svoj segmentirani nalagalnik',
  'bootFail.footerLength': 'dolžina noge ni enaka header.length {length}',
  'bootFail.keyASum':
    'dešifrirano s ključem A te kamere je vsota besed {sum}, zagonski nalagalnik potrebuje {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'preverjen s kontrolno vsoto za sprejem',
  'keyConfidence.structural': 'preverjen samo s tabelo vektorjev',
  'keyConfidence.unverified': 'ni preverjen',
  /** `{sum}` is hex. */
  'keyCheck.family': 'ključ preverjen s kontrolno vsoto za sprejem {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'ključ {phrase}; kontrolna vsota za sprejem {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'pripravljeno pod lastnimi ključi kamere',
  'staging.phrase.slotKeystreamCiphertext': 'pripravljeno pod lastnim ključem slike',
  'staging.phrase.plain': 'pripravljeno nešifrirano',
  'staging.phrase.keyAKeystream':
    'pripravljeno tako, kot proizvajalčeva aplikacija pripravi sliko FF (XOR ključ A)',
  'staging.phrase.verbatim': 'poslano, kot je podano',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank, inside the sentence ("slot A"); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    '{size} B potrjeno v {name:acc} na naslovu {address}, {staged}; stanje potrditve {status}',
  'written.noReadWindow':
    'ta izdaja za režo ne navaja nobenega bralnega okna, zato nič ni bilo kontrolno prebrano',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'kontrolno branje ni uspelo: {error}',
  'written.readBack': 'kontrolno prebranih {size} B, SHA-256 {sha256}',
  'written.verifyOff': 'preverjanje je izklopljeno: reža ni bila kontrolno prebrana',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'z bajti, za katere je načrt napovedal, da bodo v reži (slika, kot jo shrani izdaja 16 Hz, ne poslani bajti)',
  'readBack.reference.asSent':
    'z bajti, za katere je načrt napovedal, da bodo v reži (bajti, kot so bili poslani)',
  'readBack.sizeDiffers':
    'kontrolno branje ima {size} B, načrt je napovedal {predictedSize} B: reža se NE ujema {reference}',
  'readBack.matchesFolded':
    'reža vsebuje sliko, kot jo shrani izdaja 16 Hz (ne poslanih bajtov), preostanek reže pa je izbrisan',
  'readBack.matches':
    'reža se ujema z bajti, ki jih je napovedal načrt (nešifrirana veriga iz leta 2014 programira natanko to, kar prejme)',
  'readBack.differs': 'reža se NE ujema {reference} (prva razlika na {offset})',
  'readBack.noHeader':
    'kontrolno branje na {offset} ne vsebuje glave slike (magična vrednost {magic}), zato se reža NE dešifrira v pričakovano sliko',
  'readBack.lengthDiffers':
    'glava kontrolnega branja navaja {length} B, slika iz načrta ima {imageLength} B: reža se NE dešifrira v pričakovano sliko',
  'readBack.tooShort':
    'kontrolno branje ima {size} B, kar je premalo za sliko velikosti {length} B: reža se NE dešifrira v pričakovano sliko',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 's tokom ključa, obnovljenim iz kontrolnega branja ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts': 'reža se dešifrira v pričakovano sliko ({length} B) {recovered}',
  'readBack.decryptDiffers':
    'reža se NE dešifrira v pričakovano sliko: prva razlika na odmiku slike {offset} {recovered}',
  'readBack.rawNotCompared':
    'surovi bajti: kontrolno branje sporočeno, ne primerjano (bajti se v tej obliki ne dešifrirajo v nešifrirano sliko, ki bi jo bilo mogoče napovedati, naprava pa to, kar obdrži, znova šifrira)',
  'readBack.notCompared':
    'primerjava ni bila mogoča: načrt ne napove niti shranjenih bajtov niti nešifrirane slike',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'ključ A',
  'keyName.keyA:nom': 'ključ A',
  'keyName.keyA:gen': 'ključa A',
  'keyName.keyA:dat': 'ključu A',
  'keyName.keyA:acc': 'ključ A',
  'keyName.keyA:ins': 'ključem A',
  'keyName.keyA:loc': 'ključu A',
  'keyName.keyB': 'ključ B',
  'keyName.keyB:nom': 'ključ B',
  'keyName.keyB:gen': 'ključa B',
  'keyName.keyB:dat': 'ključu B',
  'keyName.keyB:acc': 'ključ B',
  'keyName.keyB:ins': 'ključem B',
  'keyName.keyB:loc': 'ključu B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'ključ naprave',
  'keyName.perDevice:nom': 'ključ naprave',
  'keyName.perDevice:gen': 'ključa naprave',
  'keyName.perDevice:dat': 'ključu naprave',
  'keyName.perDevice:acc': 'ključ naprave',
  'keyName.perDevice:ins': 'ključem naprave',
  'keyName.perDevice:loc': 'ključu naprave',
  'keyName.thePerDevice': 'ključ naprave',
  'keyName.thePerDevice:nom': 'ključ naprave',
  'keyName.thePerDevice:gen': 'ključa naprave',
  'keyName.thePerDevice:dat': 'ključu naprave',
  'keyName.thePerDevice:acc': 'ključ naprave',
  'keyName.thePerDevice:ins': 'ključem naprave',
  'keyName.thePerDevice:loc': 'ključu naprave',
  'keyName.applicationKeyA': 'ključ A aplikacije',
  'keyName.applicationKeyA:nom': 'ključ A aplikacije',
  'keyName.applicationKeyA:gen': 'ključa A aplikacije',
  'keyName.applicationKeyA:dat': 'ključu A aplikacije',
  'keyName.applicationKeyA:acc': 'ključ A aplikacije',
  'keyName.applicationKeyA:ins': 'ključem A aplikacije',
  'keyName.applicationKeyA:loc': 'ključu A aplikacije',
  'keyName.applicationKeyB': 'ključ B aplikacije',
  'keyName.applicationKeyB:nom': 'ključ B aplikacije',
  'keyName.applicationKeyB:gen': 'ključa B aplikacije',
  'keyName.applicationKeyB:dat': 'ključu B aplikacije',
  'keyName.applicationKeyB:acc': 'ključ B aplikacije',
  'keyName.applicationKeyB:ins': 'ključem B aplikacije',
  'keyName.applicationKeyB:loc': 'ključu B aplikacije',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'blok ključev 1',
  'keyName.block1:nom': 'blok ključev 1',
  'keyName.block1:gen': 'bloka ključev 1',
  'keyName.block1:dat': 'bloku ključev 1',
  'keyName.block1:acc': 'blok ključev 1',
  'keyName.block1:ins': 'blokom ključev 1',
  'keyName.block1:loc': 'bloku ključev 1',
  'keyName.theDeviceKey': 'ključ naprave',
  'keyName.theDeviceKey:nom': 'ključ naprave',
  'keyName.theDeviceKey:gen': 'ključa naprave',
  'keyName.theDeviceKey:dat': 'ključu naprave',
  'keyName.theDeviceKey:acc': 'ključ naprave',
  'keyName.theDeviceKey:ins': 'ključem naprave',
  'keyName.theDeviceKey:loc': 'ključu naprave',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'neznan ključ',
  'keyName.unknown:nom': 'neznan ključ',
  'keyName.unknown:gen': 'neznanega ključa',
  'keyName.unknown:dat': 'neznanemu ključu',
  'keyName.unknown:acc': 'neznan ključ',
  'keyName.unknown:ins': 'neznanim ključem',
  'keyName.unknown:loc': 'neznanem ključu',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'nešifrirana veriga iz leta 2014: vse reže so shranjene nešifrirane, zato se ključ za prenos ne izpelje; prenos je slika, kakršna je',
  'keys.evidence.ffVendor':
    'izdaja 1.3.0.8 FF (16 Hz): nobena reža, ki jo je odprlo to branje, ni shranjena nešifrirana, zato ni dokazano, da je kamera na nešifrirani verigi iz leta 2014; slika FF se zapiše v obliki proizvajalca, surovi bajti se pošljejo, kot so podani, nešifrirana slika 8 Hz pa se ne zapiše',
  'keys.evidence.ffUntested':
    'zapis slike FF je na voljo z opozorilom UNTESTED (nepreizkušeno): v zbirki ni pristnega zagonskega nalagalnika te izdaje, zato ni izmerjeno, ali se zapisana reža zažene',
  'keys.evidence.line2016':
    'serija Compact PRO iz leta 2016: prenos je slika, XOR-ana s tokom ključa njenega lastnega bloka ključev 0, najdenega v sliki po vrednosti, zato ga ne sestavi noben ključ te kamere',
  'keys.evidence.checkKeyUnnamed':
    'kamera prenos dešifrira s tem ključem in ga znova šifrira s ključem, s katerim njen zagonski nalagalnik preverja režo; ta ključ pri tem branju ni bil poimenovan in zapis ga ne potrebuje: reža se kontrolno prebere kot slika, v katero se dešifrira',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'kamera prenos dešifrira s tem ključem in ga znova šifrira s ključem, s katerim njen zagonski nalagalnik preverja režo; ta ključ pri tem branju ni bil poimenovan ({why}) in zapis ga ne potrebuje: reža se kontrolno prebere kot slika, v katero se dešifrira',
  'keys.evidence.checkKeyNamed':
    'kamera prenos dešifrira s tem ključem in ga znova šifrira pod {key:ins} {hex}, ključem, s katerim njen zagonski nalagalnik preverja režo, zato je vsaka reža, ki jo zapiše, shranjena tako, kot jo zagonski nalagalnik sprejme',
  'keys.evidence.checkKeyInferred':
    'kamera prenos dešifrira s tem ključem in ga znova šifrira pod {key:ins} {hex}, ključem, s katerim njen zagonski nalagalnik preverja režo (sklepano iz {bank:gen}, reže, v katero je po sporočilu kamere vstopila in v katero je zagonski nalagalnik vstopil brez preverjanja), zato je vsaka reža, ki jo zapiše, shranjena tako, kot jo zagonski nalagalnik sprejme',
  'keys.evidence.checkKeyNamedFrom':
    'kamera prenos dešifrira s tem ključem in ga znova šifrira pod {key:ins} {hex}, ključem, s katerim njen zagonski nalagalnik preverja režo (določen iz {bank:gen}, reže, v katero je po sporočilu kamere vstopila), zato je vsaka reža, ki jo zapiše, shranjena tako, kot jo zagonski nalagalnik sprejme',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'zagnane reže ni bilo mogoče poimenovati, zato iz nje ni mogoče prebrati ključa, pod katerim je reža shranjena',
  'keys.refused.notDerived': 'ključev ni bilo mogoče izpeljati',
  'keys.refused.notDecrypted':
    'zagnana {bank:nom} se ne dešifrira v sliko, zato ključa, pod katerim je shranjena, ni mogoče prebrati',
  'keys.refused.noBootKey':
    'zagnana {bank:nom} se ne dešifrira pod nobenim ključem, ki ga poskusi zagonski nalagalnik (njegov ključ A ali ključ zapisa), zato iz nje ni mogoče prebrati ključa, pod katerim je reža shranjena',
  'keys.refused.keyNotInTable':
    'zagnana {bank:nom} se dešifrira pod {key:ins}, vendar tabela ključev te kamere tega ključa ne vsebuje, zato pod njim ni mogoče pisati',
  'keys.refused.noApplicationPair':
    'delujoča aplikacija ({bank}, vdelana programska oprema {firmware}) ne vsebuje nobenega od znanih parov ključev (para zagonskega nalagalnika in dekodiranih parov aplikacije), vsake polovice natanko enkrat, zato njenega ključa A v njeni sliki ni mogoče najti',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'delujoča aplikacija ({bank}, vdelana programska oprema {firmware}) ne vsebuje nobenega od znanih parov ključev (para zagonskega nalagalnika in dekodiranih parov aplikacije), vsake polovice natanko enkrat, zato njenega ključa A v njeni sliki ni mogoče najti (ključ A zagonskega nalagalnika se pojavi {count}-krat, njegov ključ B {keyB}-krat)',
    two: 'delujoča aplikacija ({bank}, vdelana programska oprema {firmware}) ne vsebuje nobenega od znanih parov ključev (para zagonskega nalagalnika in dekodiranih parov aplikacije), vsake polovice natanko enkrat, zato njenega ključa A v njeni sliki ni mogoče najti (ključ A zagonskega nalagalnika se pojavi {count}-krat, njegov ključ B {keyB}-krat)',
    few: 'delujoča aplikacija ({bank}, vdelana programska oprema {firmware}) ne vsebuje nobenega od znanih parov ključev (para zagonskega nalagalnika in dekodiranih parov aplikacije), vsake polovice natanko enkrat, zato njenega ključa A v njeni sliki ni mogoče najti (ključ A zagonskega nalagalnika se pojavi {count}-krat, njegov ključ B {keyB}-krat)',
    other:
      'delujoča aplikacija ({bank}, vdelana programska oprema {firmware}) ne vsebuje nobenega od znanih parov ključev (para zagonskega nalagalnika in dekodiranih parov aplikacije), vsake polovice natanko enkrat, zato njenega ključa A v njeni sliki ni mogoče najti (ključ A zagonskega nalagalnika se pojavi {count}-krat, njegov ključ B {keyB}-krat)',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'delujoča aplikacija ({bank}, vdelana programska oprema {firmware}) prenos pred programiranjem preveri pod lastnimi ključi (dekodirana izvorna koda te izdaje prenos poskusi pod svojim ključem A in ključem zapisa, kot zagonski nalagalnik poskusi režo), ključ, pod katerim se shranjujejo zapisi, {key} ({hex}), pa ni niti njen ključ A niti njen ključ zapisa, zato bi kamera prenos zavrnila z 0x50000, preden bi karkoli izbrisala',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'nobena reža se ne dešifrira v kontrolno vsoto za sprejem {sum} družine {family}',
  'writeRefusal.keyTable': 'tabele ključev te kamere ni bilo mogoče potrditi',
  'writeRefusal.whitening':
    'tabela ključev te kamere se razreši pri K={k}, {family} pa šifrira pri K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily': 'dokazi pravijo, da je ta kamera {detected}, ne {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'v to kamero od tukaj ni mogoče pisati: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Izdaje Seek iz leta 2018 in novejše (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 in Nano 300. Izpis prebere 63 od 64 blokov bliskovnega pomnilnika, ne da bi karkoli odklenil; v teh izdajah nobeno branje ne doseže bloka na {block}. Vdelana programska oprema je shranjena šifrirana. Reže se zapisujejo po ena naenkrat na zavihku „Delo z režami vdelane programske opreme“.',
  'family.summary.early':
    'Kamere Compact iz leta 2014, starejše od 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 in 0.7.0.8. Njihova vdelana programska oprema ne zna odgovoriti na branje, ki ga pošlje izpis, zato jih „Izpis“, „Izpiši vse selektorje“, polno branje na zavihku Informacije in zavihek „Delo z režami vdelane programske opreme“ po branju različice zavrnejo; na 0.3.0.1 bi ukaz, s katerim se izpis začne, namesto tega pripravil nadgradnjo vdelane programske opreme. Izvedba na zavihku 0.x/1.x prebere 0.7.0.7 in 0.7.0.8 prek drugega ukaza, na katerega ti dve izdaji odgovorita. Izpis, narejen na drug način, se dešifrira kot običajno.',
  'family.summary.compact2016':
    'Izdaje Compact PRO 1.0.3.x (1.0.3.0 in 1.0.3.2). Na branja odgovarjajo natanko tako kot kamere Compact iz leta 2014, vključno z odklepnim žetonom, zato se ločijo po različici in po tem, kako so shranjene njihove reže: šifrirane, medtem ko so reže iz leta 2014 nešifrirane. Kamera 1.0.3.x se od začetka bere v okviru te družine. Izvedba na zavihku 0.x/1.x prebere celoten bliskovni pomnilnik, reže pa se zapisujejo po ena naenkrat na zavihku „Delo z režami vdelane programske opreme“.',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    'Kamere Compact iz leta 2014 od 0.8.0.0 do 1.3.0.8, med njimi izdaja 1.3.0.8 FF (16 Hz). Tovarniška kamera izda manj kot polovico svojega bliskovnega pomnilnika, del tega le z odklepnim žetonom, ki ga pošljejo orodja; izvedba na zavihku 0.x/1.x preostanek prebere prek začasnega popravka. Reže so shranjene nešifrirane, razen pri izdaji FF. Kamera Compact PRO 1.0.3.x se bere kot compact-2016 in se sem premakne le, če je reža shranjena nešifrirana ali se dešifrira v {sum}, kot se reže izdaje FF. Reže se na zavihku „Delo z režami vdelane programske opreme“ zapisujejo v izdajah, na katerih je bila izmerjena izvedba na zavihku 0.x/1.x; vse druge izdaje 0.x ali 1.x se samo berejo.',
  'family.summary.generic':
    'Kamera, s katero se ne ujema nobena druga družina. `seek-fw dump` jo prebere s seznamom blokov za 4.x (zavihek 4.x/Nano jo zavrne), dešifriranje pa ključ izračuna iz same slike, zato nobeno od obeh ni odvisno od ugibanja. Nobena reža se ne zapiše: zavihek „Delo z režami vdelane programske opreme“ jo zavrača, dokler kamera ni prepoznana.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'glava slike navaja',
  'detect.source.camera': 'kamera sporoča',
  'detect.plainArmedNotInForce':
    'navaden 2-bajtni BeginFirmwareUpgrade je aktiviral zaščiteno režo, zato overjeni bralni kanal ne velja',
  'detect.modern.plainRefused':
    'navaden 2-bajtni BeginFirmwareUpgrade zaščitene reže je bil ZAVRNJEN, česar ne naredi nobena izdaja v tej seriji — njen obdelovalnik nima preverjanja žetona in sprejme navadni kanal na vsaki reži',
  'detect.modern.authArmed':
    'zaščitena reža se je aktivirala na 18-bajtnem overjenem selektorju; navadnega tam nič ni poskusilo, zato to kamere ne uvršča zunaj te serije',
  'detect.modern.legacyVersion':
    '{said} vdelano programsko opremo {version}, ki je v stari seriji 0.x / 1.x (drugo zaporedje številčenja, ne starejša 4.x — in ena od teh izdaj prav tako doseže vsoto {sum})',
  'detect.modern.noSum':
    'nobena reža se ne dešifrira v kontrolno vsoto za sprejem {sum}, ki jo zahteva zagonski nalagalnik te družine',
  'detect.modern.sum': 'reža se dešifrira v kontrolno vsoto za sprejem {sum}',
  'detect.modern.version':
    'vdelana programska oprema {version} je v seriji po letu 2018, ki jo pokriva ta zemljevid selektorjev (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'navaden 2-bajtni BeginFirmwareUpgrade je aktiviral zaščiteno režo, zato to ni zaklenjena stara vdelana programska oprema',
  'detect.modern.none': 'ni dokazov, ki bi to kamero uvrščali v serijo po letu 2018',
  'detect.early.noVersion':
    'nobena različica vdelane programske opreme ni bila sporočena ali najdena v glavi slike',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'vdelana programska oprema {version} je {first} ali novejša, zato ima njena tabela RPC bralnik (getter) za GetFeaturedFirmwareData in velja običajna pot branja',
  'detect.early.older':
    '{said} vdelano programsko opremo {version}, ki je starejša od {first} — prve izdaje, katere tabela metod RPC ima bralni obdelovalnik (getter) za GetFeaturedFirmwareData',
  'detect.early.noWindow': 'in nobenega okna ni bilo mogoče prebrati, kar to tudi napoveduje',
  'detect.generic.fallback':
    'nadomestna možnost: nobena družina vdelane programske opreme se ni zanesljivo ujemala, zato branja ostanejo na voljo, zapisi pa ne',
  'detect.compact2016.early':
    'vdelana programska oprema {version} je starejša od 0.8.0.0 in nima bralnega obdelovalnika za GetFeaturedFirmwareData — to je early-compact, ne ta družina',
  'detect.compact2016.modernSum':
    'reža se dešifrira v kontrolno vsoto za sprejem {sum}, ki ni cilj te generacije',
  'detect.compact2016.plainArmed':
    'navaden 2-bajtni BeginFirmwareUpgrade je aktiviral zaščiteno režo, zato ta kamera ni v zaklenjeni seriji, ki si jo ta družina deli z legacy-auth',
  'detect.compact2016.notLine': 'vdelana programska oprema {version} ni v seriji 0.x / 1.x',
  'detect.compact2016.storedPlain':
    'reža je shranjena nešifrirana — izračun toka ključa vrne identitetno stanje, zato so njene shranjene besede SAMA slika — kar je nešifrirana veriga iz leta 2014; reže te generacije so xorshift128 pod pravim ključem',
  'detect.compact2016.keyedZero':
    'reža, shranjena pod pravim tokom ključa xorshift128, se dešifrira v kontrolno vsoto za sprejem {sum}, kar je šifra te generacije',
  'detect.compact2016.zeroSum':
    'reža se dešifrira v kontrolno vsoto za sprejem {sum}, kar je cilj te generacije',
  'detect.compact2016.refused':
    'in zaščitena reža je zavrnila navadno 2-bajtno aktivacijo, kar je zaklenjeni obdelovalnik',
  'detect.compact2016.proLine':
    '{said} vdelano programsko opremo {version}, serijo 1.0.3.x kamere Compact PRO iz leta 2016',
  'detect.compact2016.compactLine':
    '{said} vdelano programsko opremo {version}, izdajo za Compact, ne serijo 1.0.3.x kamere Compact PRO',
  'detect.compact2016.lockedLine':
    '{said} vdelano programsko opremo {version}, v seriji 0.x / 1.x, ki si jo ta generacija deli z zaklenjeno staro vdelano programsko opremo',
  'detect.compact2016.bootloader2016':
    'zagonski nalagalnik sporoča {version}, zagonski nalagalnik generacije 2016 (1.2.0.0 je izmerjen pri Compact PRO 1.0.3.0; zagonski nalagalnik kamere Compact iz leta 2014 je 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'zagonski nalagalnik sporoča {version}, številčenje generacije 2014, ne te generacije',
  'detect.compact2016.none':
    'nobena reža ni bila opažena, da bi se pod pravim ključem dešifrirala v ničelno kontrolno vsoto za sprejem',
  'detect.legacy.proLine':
    'vendar je vdelana programska oprema {version} serija 1.0.3.x kamere Compact PRO iz leta 2016, katere reže uporabljajo šifro compact-2016: preverjanje sprejema te družine bi pri vsaki od njih spodletelo',
  'detect.legacy.early':
    'vdelana programska oprema {version} je starejša od 0.8.0.0: njena tabela RPC nima bralnega obdelovalnika za GetFeaturedFirmwareData (pred 0.7.0.7 sploh nobenega, na 0.7.0.7 in 0.7.0.8 pa le setter) — to je early-compact, ne ta družina',
  'detect.legacy.keyedZero':
    'reža, shranjena pod pravim tokom ključa xorshift128, se dešifrira v {zero} — šifra kamere Compact PRO iz leta 2016 (compact-2016). Ta serija hrani svoje reže nešifrirane z vsoto besed 0 (veriga iz leta 2014) ali s ključem na {sum} (Compact 1.3.0.8), njeno preverjanje sprejema pa takšno režo zavrne',
  'detect.legacy.plainChain':
    'reža je shranjena kot nešifrirana vdelana programska oprema, katere besede se seštejejo v 0, kot jo zažene zagonski nalagalnik te serije iz leta 2014',
  'detect.legacy.refused':
    'kamera je zavrnila odprtje zaklenjene reže za nadgradnjo, ko je bila zaprošena brez odklepa, kar naredi le ta generacija vdelane programske opreme',
  'detect.legacy.unlocked':
    'in isto režo je odprla, ko je bila zaprošena z odklepom, zato je odklep, ki ga pošlje ta družina, tisti, ki ga preverja ta kamera',
  'detect.legacy.notLine':
    '{said} vdelano programsko opremo {version}, ki ni v stari seriji 0.x / 1.x',
  'detect.legacy.authOnly':
    'zaklenjeno režo je za nadgradnjo odprla, ko je bila zaprošena z odklepom, kot to naredi ta generacija vdelane programske opreme; prošnja brez odklepa ni bila preizkušena, zato to samo po sebi ne dokazuje generacije',
  'detect.legacy.version':
    'vdelana programska oprema {version} je v stari seriji 0.x / 1.x, ki je drugo zaporedje številčenja kot različice aplikacij po letu 2018, ne starejša 4.x',
  'detect.legacy.none': 'nič opaženega ne kaže na overjeni bralni kanal',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'zadržano po izvedbi na kameri: tam popravek ni dvignil hitrosti objave, zaklop pa se je po zapisu sprožil ob vsaki sličici',
  'fps.table.predates':
    'vdelana programska oprema {version} je starejša od 0.8.0.0: njena tabela RPC nima bralnega obdelovalnika za GetFeaturedFirmwareData, ukaza, ki ga pošlje branje reže, zato branje in zapis rež ne dosežeta nobene reže te izdaje, popravek pa ni na voljo',
  'fps.table.stageTwoFf':
    'stage two: izdaja 16 Hz FF je pripravljena tako, kot jo pripravi proizvajalčeva aplikacija (slika XOR ključ A, shranjena pod ključem B), ne kot nešifrirani bajti, zato njeno preverjanje priprave ni opravljeno in popravek še ni na voljo',
  'fps.table.stageTwo':
    'stage two: ta vnos ni v naboru stage two, zato njegovo preverjanje priprave ni opravljeno in popravek še ni na voljo',
  'fps.table.notOffered': 'ni na voljo',
  'fps.table.notImage':
    'to ni slika vdelane programske opreme, zato zanjo ne velja noben popravek hitrosti sličic',
  'fps.table.otherBuild':
    'slika je izdaja {image}, kamera pa sporoča {camera}; popravek je zavrnjen, namesto da bi bil uporabljen na izdaji, s katero se ne ujema',
  'fps.table.otherBuildNoVersion':
    'slika je izdaja {image}, kamera pa ne sporoča različice; popravek je zavrnjen, namesto da bi bil uporabljen na izdaji, s katero se ne ujema',
  'fps.table.patched': 'popravek hitrosti sličic je že uporabljen: ta slika teče pri {hz} Hz',
  'fps.table.earlierPatch':
    'ta slika vsebuje starejši popravek hitrosti sličic za {hz} Hz brez rešitve za USB, popravek pa se nikoli ne uporabi na že popravljeni sliki: obnovite tovarniško sliko, nato jo popravite',
  'fps.table.atRate': 'ta izdaja že teče pri {hz} Hz brez popravka',
  'fps.table.not4821':
    'ta slika sporoča izdajo Compact 4.8.2.1 (ali Compact XR 4.8.2.1, isto izdajo), vendar ni tovarniška slika, za katero je bil napisan popravek hitrosti sličic (f96ac57eda75: njene 68-bajtne strani ukazov, stalna stran 13), zato zanjo ni narejen noben popravek hitrosti sličic',
  'fps.table.notInTable':
    'te slike ni v tabeli popravkov hitrosti sličic, zato za to izdajo ni narejen noben popravek hitrosti sličic. Tabela navaja izdaje Compact 0.7.0.8 do 1.3.0.8 (8 Hz; 0.7.0.8 koda za reže zavrne), 1.3.0.8 (16 Hz FF), 4.8.1.7, 4.8.1.9, 4.8.2.1 in 4.16.1.7 FF ter izdaji Compact PRO 1.0.3.x in 4.9.x; nobena druga izdaja nima vnosa',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'načrt te izdaje nima {bank:gen}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain': '{bank} v tej izdaji ne more sprejeti dešifrirane slike: {reason}',
  'fps.plan.empty': '{bank} nima dešifrirane slike za popravek (prazna je)',
  'fps.plan.noImage':
    '{bank} nima dešifrirane slike za popravek (ni bila prebrana ali je noben ključ ne odpre)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name} je bila zapisana, vendar se njeno kontrolno branje ne razlikuje od shranjene reže samo tako, kot je bilo načrtovano, zato je bilo zapisovanje ustavljeno pred naslednjimi režami',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build (slots/capability-notes) ----
   * The page shows only this one; it leaves the others out (lib/page-hidden.ts), and the CLI prints them
   * in English. */
  'notes.unverified':
    'Samo branje. Razporeditev rež je dekodirana tabela zaklenjene serije, vendar za to izdajo ni bila izmerjena nobena oblika priprave, zato zapis ni načrtovan.',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'kamera ni sporočila različice vdelane programske opreme ({note}); številka ukaza ne pomeni enakega v vsaki vdelani programski opremi Seek — na Compact 0.3.0.1 je wire id 0x52, ki aktivira bralno okno, EnterBootloaderMode — zato se, dokler različica ni znana, ne pošlje nič razen GetErrorCode, GetOperationMode in GetFirmwareInfo, branj, na katera vsaka izdaja odgovori enako',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo ni odgovoril ({error}) na nobeno od {reads} branj v razmiku {spacing} ms, v zagonskem oknu {window} ms; kamera, ki se še zaganja, v tem času odgovori',
  'identity.note.neverTwice':
    'GetFirmwareInfo v {reads} branjih nikoli ni odgovoril dvakrat zapored',
  'identity.note.noAnswer': 'GetFirmwareInfo ni odgovoril ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo ni odgovoril ({error}); odgovorilo je {answered} od {reads} branj, nikoli dve zapored, zato nobenega od njih ni mogoče ločiti od zapisa, ki ga je izbranega pustil prejšnji ukaz',
  'identity.note.tooShort': {
    one: 'odgovor ukaza GetFirmwareInfo je imel {count} bajt, kar je premalo za različico',
    two: 'odgovor ukaza GetFirmwareInfo je imel {count} bajta, kar je premalo za različico',
    few: 'odgovor ukaza GetFirmwareInfo je imel {count} bajte, kar je premalo za različico',
    other: 'odgovor ukaza GetFirmwareInfo je imel {count} bajtov, kar je premalo za različico',
  },
  'identity.note.tooShortContext': {
    one: 'odgovor ukaza GetFirmwareInfo je imel {count} bajt, kar je premalo za različico; {context}',
    two: 'odgovor ukaza GetFirmwareInfo je imel {count} bajta, kar je premalo za različico; {context}',
    few: 'odgovor ukaza GetFirmwareInfo je imel {count} bajte, kar je premalo za različico; {context}',
    other:
      'odgovor ukaza GetFirmwareInfo je imel {count} bajtov, kar je premalo za različico; {context}',
  },
  'identity.note.otherRecord':
    'prvo branje je odgovorilo z drugim zapisom ({version}), na katerem je selektor podatkov o vdelani programski opremi pustil prejšnji ukaz — to branje ga je počistilo',
  'identity.note.afterStartup': {
    one: 'odgovoril je, potem ko je med zagonom zavrnil {count} branje',
    two: 'odgovoril je, potem ko je med zagonom zavrnil {count} branji',
    few: 'odgovoril je, potem ko je med zagonom zavrnil {count} branja',
    other: 'odgovoril je, potem ko je med zagonom zavrnil {count} branj',
  },
  'identity.predates':
    'vdelana programska oprema {version} je starejša od protokola za izpis: njena tabela metod RPC nima bralnega obdelovalnika za GetFeaturedFirmwareData (na 0.7.0.7 in 0.7.0.8 je registriran le kot setter, pred tem pa je wire id 0x4F UploadFirmwareRowSize), zato z njim ni mogoče prebrati nobenega okna; na 0.3.0.1 je wire id 0x52 EnterBootloaderMode namesto BeginFirmwareUpgrade. Izvedba na zavihku 0.x/1.x namesto tega prebere 0.7.0.7 in 0.7.0.8 prek wire id 0x58 (GetFeaturedData)',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': '{operation} — zavrnjeno: {reason}',
  'identity.refusingNoVersion':
    '{operation} — zavrnjeno: {reason}. Nič ni bilo aktivirano. Odklopite kamero, jo znova priklopite, počakajte, da se zažene do konca, in poskusite znova.',
  'identity.operation.dump': 'izpis',
  'identity.operation.dumpAll': 'izpis vseh selektorjev',
  'identity.operation.readInfo': 'branje podatkov o napravi',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'reže se izberejo po varnostni kopiji, ki jih prebere — najprej izvedite varnostno kopijo',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'rež ni več mogoče spremeniti, ko se je potrditev zapisa izvedla ali bila poskušena: ta izvedba piše v: {banks}, obnovitev pa povrne natanko te',
  'preserve.banks.none': 'nobena reža',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Zapisano.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Prebrano. Berljive reže: {count}/{of}.',
  'status.readRefused':
    'Prebrano, vendar nobene reže te kamere ni mogoče zapisati od tukaj — glejte dnevnik.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Različica vdelane programske opreme',
  'compare.field.imageId': 'ID slike',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'Začetni SP',
  'compare.field.resetVector': 'Vektor ponastavitve',
  'compare.field.size': 'Velikost',
  'compare.field.shaExpected': 'SHA-256 pričakovane nešifrirane slike',
  'compare.field.sha': 'SHA-256 slike',
  'compare.field.shaNotStored':
    'SHA-256 pričakovane nešifrirane slike (shranjeni bajti niso napovedani)',
  'compare.field.key': 'Ključ',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(ni slike)',
  'compare.notImage': '(ni slika)',
  'compare.notPredicted': '(ni napovedano: naprava odloči, kaj shrani)',
  'compare.plaintext': 'brez (nešifrirano)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'se ni dala dvakrat prebrati enako',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (ključ, s katerim zagonski nalagalnik preverja režo, je sklepan iz {bank:gen}, v katero je vstopil brez preverjanja) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered': '{bank}, kot jo beleži kamera (beseda aktivne reže {word})',
  'preserve.lastStart.notRead': 'ni znano — besede aktivne reže ni bilo mogoče prebrati',
  'preserve.lastStart.noBank':
    'ni znano — beseda aktivne reže je {word}, kar ne označuje nobene reže',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'ni znano — {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'ni zapisano — {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'slika',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build} — mogoče zapisati',
  'preserve.bank.writablePatch':
    '{build} — mogoče zapisati; bajti, ki jih spremeni popravek: {count}',
  'preserve.bank.writableEdit': '{build} — mogoče zapisati; vsebuje {edit}',
  'preserve.bank.writablePatchEdit':
    '{build} — mogoče zapisati; bajti, ki jih spremeni popravek: {count}; vsebuje {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead':
    'varnostna kopija še ni prebrala rež, zato ni mogoče izbrati nobene reže',
  'preserve.choice.every': 'vse reže, ki vsebujejo sliko: {banks}',
  'preserve.choice.everyBlocked':
    'vseh rež, ki vsebujejo sliko, ni mogoče zapisati: {bank:gen} ni mogoče zapisati — {reason}',
  'preserve.choice.noImage': 'nobena reža ne vsebuje slike, ki bi jo izvedba lahko zapisala',
  'preserve.choice.nextStart': '{bank}, reža, iz katere se kamera zažene naslednjič: {why}',
  'preserve.choice.nextStartRefused':
    'kamera se naslednjič zažene iz {bank:gen} ({why}), izvedba pa je ne more zapisati: {reason}',
  'preserve.choice.everyUnknownStart':
    'vse reže, ki vsebujejo sliko ({banks}): ni znano, iz katere reže se kamera zažene naslednjič ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'ni znano, iz katere reže se kamera zažene naslednjič ({why}), in {reason}; izberite režo po imenu',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': '{bank:gen} ni mogoče zapisati: {reason}',
  'preserve.choice.byName': '{banks}, reža, izbrana po imenu',
  'preserve.choice.warnNotPatched':
    'Kamera se naslednjič zažene iz {bank:gen} ({why}), ta izbira pa je ne popravi: po ponovnem zagonu kamera poganja lastno sliko te reže, zato se branje celotnega pomnilnika ustavi, preden karkoli prebere. Obnovitev še vedno povrne vse zapisane reže.',
  'preserve.choice.warnUnknownStart':
    'Ni znano, iz katere reže se kamera zažene naslednjič ({why}). Če se zažene iz reže, ki je ta izbira ne popravi, se branje celotnega pomnilnika ustavi, preden karkoli prebere.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'še ni znano',
  'preserve.build.firmware': 'vdelana programska oprema {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'kot jo hrani kamera (ta kamera hrani vdelano programsko opremo nešifrirano)',
  'preserve.stagedForm.oneKey': 'v obliki, v kateri jo hrani kamera (šifrirano s ključem kamere)',
  'preserve.stagedForm.twoKeys':
    'v obliki, v kateri jo hrani kamera (šifrirano z dvema ključema kamere)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'vsaka zapisana reža dobi nazaj natanko tiste bajte, ki jih je iz nje prebrala varnostna kopija',
  'preserve.restoreForm.factoryStaged':
    'vsaka zapisana reža dobi nazaj svojo izvirno vdelano programsko opremo, zapisano v obliki, v kateri jo hrani kamera, tako da je reža na koncu bajt za bajtom takšna, kot jo je prebrala varnostna kopija',
  'preserve.restoreForm.none':
    'v tej izdaji ni mogoče: nobena oblika izvirne vdelane programske opreme ne prestane lastnega preverjanja kamere in se hkrati ne shrani nazaj kot izvirni bajti, zato se izvedba konča s celotno sliko in s popravkom še na mestu',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'v tej izdaji ni mogoče: popravljena vdelana programska oprema ne more prebrati celotnega bliskovnega pomnilnika, zato izvedba nima celotne slike',
  'preserve.drain.rotated': 'kamera ga posreduje zamaknjenega, izvedba pa ga uredi nazaj',
  'preserve.drain.hazard': 'popravek se izogne branju, ki v tej izdaji sesuje kamero',
  'preserve.drain.whole':
    'celoten 4 MB bliskovni pomnilnik v enem branju, po {size} bajtov naenkrat',
  'preserve.drain.wholeNotes':
    'celoten 4 MB bliskovni pomnilnik v enem branju, po {size} bajtov naenkrat; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'omogoči, da bralni ukaz kamere doseže celoten 4 MB bliskovni pomnilnik, ne le prvih 64 KB',
  'preserve.site.countPast':
    'omogoči, da položaj branja šteje čez 64 KB, tako da se branje ne vrne na začetek',
  'preserve.site.keepPosition':
    'ohrani celoten položaj branja, ko se po vsakem branju premakne naprej',
  'preserve.site.savePosition': 'v celoti shrani premaknjeni položaj branja',
  'preserve.site.clearPosition':
    'ob vsakem začetku branja počisti celoten položaj branja, tako da je kamero mogoče brati tudi po branju celotnega pomnilnika',
  'preserve.site.modeTwoGuard':
    'omogoči, da se branje celotnega pomnilnika začne kot vsako drugo branje (tovarniška vdelana programska oprema ga zavrne)',
  'preserve.site.modeTwoIndirection':
    'branje celotnega pomnilnika usmeri na začetek bliskovnega pomnilnika (tovarniška vdelana programska oprema ga usmeri na vrednost, ki sesuje kamero)',
  'preserve.site.armTail': 'odstrani klic, ki v tej izdaji zamrzne kamero, ko se branje začne',
  'preserve.site.other': 'spremeni en strojni ukaz, ki ga potrebuje branje celotnega pomnilnika',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Varnostna kopija',
  'preserve.step.patch': 'Popravek',
  'preserve.step.commit': 'Zapis',
  'preserve.step.drain': 'Branje celotnega pomnilnika',
  'preserve.step.restore': 'Obnovitev',
  'preserve.step.verify': 'Preverjanje',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'korak popravka',
  'preserve.stepId.commit': 'korak zapisa',
  'preserve.stepId.drain': 'korak branja celotnega pomnilnika',
  'preserve.stepId.restore': 'korak obnovitve',
  'preserve.stepId.verify': 'korak preverjanja',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: ustavljeno po načrtu — kamera je zagnala {bank:acc}, ki je ta izvedba ni popravila, zato ni bilo prebrano nič.',
  'preserve.result.noReason': 'razlog ni bil zabeležen',
  'preserve.result.stopped': '{label}: ustavljeno — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none':
    'nobena reža ne vsebuje vdelane programske opreme, ki bi jo izvedba lahko popravila',
  'preserve.result.writable.one': 'izvedba lahko popravi vdelano programsko opremo v {banks:loc}',
  'preserve.result.writable.many':
    'izvedba lahko popravi vdelano programsko opremo v teh režah: {banks}',
  'preserve.result.backup':
    '{label}: shranjen je vsak blok, ki ga doseže običajno branje; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'reža, ki ni znana',
  'preserve.result.backupNext':
    '{label}: shranjen je vsak blok, ki ga doseže običajno branje; {writable}; naslednji zagon: {next}.',
  'preserve.result.patch': '{label}: pripravljeno za {banks:acc}.',
  /** The patch step when every bank was refused: nothing to build for. */
  'preserve.result.patchNone':
    '{label}: noben popravek ni bil pripravljen: nobena reža ne vsebuje vdelane programske opreme, ki bi jo izvedba lahko popravila.',
  'preserve.result.patchCount':
    '{label}: pripravljeno za {banks:acc}; število spremenjenih bajtov v vsaki: {count}.',
  'preserve.result.commitOne': '{label}: popravek je zapisan v {banks:acc}, kamera ga je sprejela.',
  'preserve.result.commitMany':
    '{label}: popravek je zapisan v {banks:acc}, kamera ga je sprejela v vsaki.',
  'preserve.result.drainNotRead': '{label}: ni prebrano.',
  'preserve.result.drain':
    '{label}: prebran je celoten 4 MB bliskovni pomnilnik; celotna slika ima sha256 {sha256}.',
  'preserve.result.drainThrough':
    '{label}: celoten 4 MB bliskovni pomnilnik je prebran prek {bank:gen}; celotna slika ima sha256 {sha256}.',
  'preserve.result.restore':
    '{label}: izvirna vdelana programska oprema je zapisana nazaj v {banks:acc}.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm':
    '{label}: izvirna vdelana programska oprema je zapisana nazaj v {banks:acc}, {form}.',
  'preserve.result.verifyDone': '{label}: končano.',
  'preserve.result.verifyIdentical':
    '{label}: znova prebrani bloki: {blocks}, 0 različnih bajtov — bliskovni pomnilnik kamere je bajt za bajtom enak varnostni kopiji.',
  'preserve.result.verifyDiffers':
    '{label}: znova prebrani bloki: {blocks}, različni bajti: {bytes}.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: znova prebrani bloki: {blocks}, različni bajti: {bytes}, {count} bloka ni bilo mogoče prebrati.',
    two: '{label}: znova prebrani bloki: {blocks}, različni bajti: {bytes}, {count} blokov ni bilo mogoče prebrati.',
    few: '{label}: znova prebrani bloki: {blocks}, različni bajti: {bytes}, {count} blokov ni bilo mogoče prebrati.',
    other:
      '{label}: znova prebrani bloki: {blocks}, različni bajti: {bytes}, {count} blokov ni bilo mogoče prebrati.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Ustavljeno pred branjem celotnega pomnilnika: kamera je zagnala režo, ki je ta izvedba ni popravila, zato ni bilo prebrano nič.',
  'preserve.unpatchedStart.next':
    'Naprej: obnovitev povrne vse zapisane reže. Branje celotnega pomnilnika se ne poskusi znova: kamera bi zagnala isto režo.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Končano — vaša vdelana programska oprema je ohranjena',
  'preserve.done.detail':
    'Celotna slika je ves izvirni bliskovni pomnilnik kamere, kamera pa je spet natanko takšna, kot je bila.',
  'preserve.done.titleNoImage': 'Končano — kamera je spet takšna, kot je bila; celotne slike ni',
  'preserve.done.detailNoImage':
    'Branje celotnega pomnilnika se ni izvedlo, zato ta izvedba nima celotne slike bliskovnega pomnilnika. Vse zapisane reže so bile povrnjene, sveže branje blokov, ki jih doseže običajni izpis, pa se ujema z varnostno kopijo. Za celotno sliko začnite novo izvedbo z izbiro, ki vključuje režo, iz katere se kamera zažene naslednjič.',
  'preserve.done.detailNoImageCount':
    'Branje celotnega pomnilnika se ni izvedlo, zato ta izvedba nima celotne slike bliskovnega pomnilnika. Vse zapisane reže so bile povrnjene, sveže branje {blocks} blokov, ki jih doseže običajni izpis, pa se ujema z varnostno kopijo. Za celotno sliko začnite novo izvedbo z izbiro, ki vključuje režo, iz katere se kamera zažene naslednjič.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'bralnik oken kamere ima omejitev na zagon in ta branja so prišla iz izčrpanega bralnika — kamero izklopite in vklopite (odklopite in znova priklopite ali uporabite njeno stikalo za vklop), nato znova zaženite `preserve --resume <run-directory>`. Podpis: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'bralnik oken kamere ima omejitev na zagon in ta branja so prišla iz izčrpanega bralnika — kamero izklopite in vklopite (odklopite in znova priklopite ali uporabite njeno stikalo za vklop), nato znova zaženite `preserve --resume <run-directory>`. Podpis: {signature} — iz teh bajtov ni mogoče izpeljati tovarniške nešifrirane slike. Preizkušeni so bili vsi načini branja:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'varnostna kopija ne vsebuje {bank:gen} ({address}) — tovarniška okna je ne morejo posredovati',
  'preserve.fail.readsDisagree':
    'branji {bank:gen} se ne ujemata (sha256 {sha256} proti {other}) — kamera, ki reže, iz katere teče, ne more dvakrat zapored posredovati enako, ni kamera, v katero bi pisali; zajem je vir za obnovitev in vhod za izpeljavo popravka',
  'preserve.fail.notFactory':
    '{bank} ne vsebuje tovarniške slike, kot jo shrani šifra te izdaje (pričakovani začetek slike se ne ujema z zajemom) — zavrnjeno, preden se karkoli zabeleži, kaj šele zapiše',
  'preserve.fail.ffSum':
    'popravljena vdelana programska oprema v obliki, v kateri jo hrani kamera, ne prestane lastnega preverjanja te izdaje (njena vsota mora biti {sum}) — zavrnjeno, da se ne pošlje reža, ki bi jo kamera po brisanju zavrnila',
  'preserve.fail.headChanged':
    'začetek {bank:gen} se je od varnostne kopije spremenil (ne vsebuje niti izvirnega zajema niti popravljenih bajtov) — zapis čez neznano stanje reže je zavrnjen; nič ni bilo zapisano. Začetek v šestnajstiškem zapisu: zdaj {live}, v zajemu {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    'V {banks:loc} so popravljeni bajti že zapisani — potrditev zapisa je uspela v prejšnjem poskusu in se ne sme ponoviti. Nadaljujte pri koraku branja celotnega pomnilnika (--resume), ki zažene popravljeno sliko in nadaljuje od tam.',
  'preserve.fail.landed':
    'V {banks:loc} so popravljeni bajti že zapisani — potrditev zapisa je uspela v prejšnjem poskusu in se ne sme ponoviti. Nadaljujte pri koraku branja celotnega pomnilnika (--resume), ki zažene popravljeno sliko in nadaljuje od tam.',
  'preserve.fail.drainRebootRefused':
    'gostitelj je ukaz za ponovni zagon v koraku branja celotnega pomnilnika ZAVRNIL, preden je bil poslan (SecurityError: pravilnik brskalnika ali testna zaščita), zato kamera še vedno poganja sliko, s katero se je zagnala, ne potrjenega popravka. Branje celotnega pomnilnika bere le skozi razširjeno okno popravljene slike, zato se ustavi, preden karkoli aktivira; nič ni bilo prebrano. Branje celotnega pomnilnika znova zaženite tam, kjer gostitelj prepusti ukaz za ponovni zagon.',
  'preserve.fail.shiftedRebootRefused':
    'branje celotnega pomnilnika se je vrnilo za eno stran zamaknjeno, ponovni zagon za nov zagon pa je gostitelj ZAVRNIL, preden je bil poslan (SecurityError: pravilnik brskalnika ali testna zaščita) — nov poskus bi prebral isti zamaknjeni zagon. Nič ni bilo shranjeno; branje celotnega pomnilnika znova zaženite tam, kjer lahko ponastavitev odide.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'preverjanje je prebralo {count} različen bajt v {read}/{total} oknih — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
    two: 'preverjanje je prebralo {count} različna bajta v {read}/{total} oknih — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
    few: 'preverjanje je prebralo {count} različne bajte v {read}/{total} oknih — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
    other:
      'preverjanje je prebralo {count} različnih bajtov v {read}/{total} oknih — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
  },
  'preserve.fail.verifyIn': {
    one: 'preverjanje je prebralo {count} različen bajt v {read}/{total} oknih (mesta: {places}) — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
    two: 'preverjanje je prebralo {count} različna bajta v {read}/{total} oknih (mesta: {places}) — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
    few: 'preverjanje je prebralo {count} različne bajte v {read}/{total} oknih (mesta: {places}) — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
    other:
      'preverjanje je prebralo {count} različnih bajtov v {read}/{total} oknih (mesta: {places}) — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
  },
  'preserve.fail.verifyShort': {
    one: 'preverjanje je prebralo {count} različen bajt v {read}/{total} oknih (kratka okna: {short}) — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
    two: 'preverjanje je prebralo {count} različna bajta v {read}/{total} oknih (kratka okna: {short}) — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
    few: 'preverjanje je prebralo {count} različne bajte v {read}/{total} oknih (kratka okna: {short}) — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
    other:
      'preverjanje je prebralo {count} različnih bajtov v {read}/{total} oknih (kratka okna: {short}) — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
  },
  'preserve.fail.verifyInShort': {
    one: 'preverjanje je prebralo {count} različen bajt v {read}/{total} oknih (mesta: {places}) (kratka okna: {short}) — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
    two: 'preverjanje je prebralo {count} različna bajta v {read}/{total} oknih (mesta: {places}) (kratka okna: {short}) — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
    few: 'preverjanje je prebralo {count} različne bajte v {read}/{total} oknih (mesta: {places}) (kratka okna: {short}) — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
    other:
      'preverjanje je prebralo {count} različnih bajtov v {read}/{total} oknih (mesta: {places}) (kratka okna: {short}) — del se pri ponovnem branju ne ujema z varnostno kopijo bajt za bajtom',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'blok zagonske konfiguracije',
  'preserve.fail.dataBlock': 'podatkovni blok',

  'preserve.refused.secondRead': 'njeno drugo branje ni uspelo ({error})',
  'preserve.refused.readsDisagree': 'njeni branji se ne ujemata (sha256 {sha256} proti {other})',
  'preserve.refused.erased': 'izbrisana je',
  'preserve.refused.watchdogMark':
    'njena beseda glave na +0x200 vsebuje {word}, oznako, ki jo zagonski nalagalnik zapiše čez režo po ponastavitvi nadzornika (watchdog) zgodaj med zagonom; zagonski nalagalnik te reže ne sprejme več, izvedba pa tam nima slike za popravek',
  'preserve.refused.noHeader': 'na +0x200 ne vsebuje glave slike',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'vsebuje {image} ({id}), ne izdaje, ki jo poganja kamera ({camera})',
  'preserve.refused.otherKey':
    'preverjanje zagonskega nalagalnika jo zavrne: shranjena je pod drugim ključem kot tistim, s katerim zagonski nalagalnik te kamere preverja reže, zapis prek kamere pa bi jo shranil pod tem ključem, zato obnovitev ne bi mogla vrniti njenih točnih bajtov',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'kamera sporoča vdelano programsko opremo {camera}, pričakovana je {version} — popravek je izpeljan iz bajtov ene izdaje in se ne sme poslati drugi',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'vdelana programska oprema {version} ni izdaja 0.x ali 1.x, ta izvedba pa pokriva le izdaje iz let 2014 in 2016. Razen različice ni bilo prebrano nič. To kamero namesto tega preberite na zavihku „Izpis in dešifriranje 4.x/Nano“: ta bliskovni pomnilnik prebere brez popravka, vse bloke razen tistega na 0x14060000, ki ga v teh izdajah ne doseže nobeno bralno okno.',
  'preserve.refused.preWidening':
    'vdelana programska oprema {version} je starejša od poti razširitve, izvedba pa raje zavrne, kot da bi pisala čez režo, ki je ne more kontrolno prebrati. V tej generaciji kamera zavrne vsak način začetka branja, ki ga pot potrebuje (izmerjeno na 0.3.0.1), njen bralni ukaz ne doseže začetka bliskovnega pomnilnika, velikost, ki bi jo popravek spremenil, pa je shranjena drugače. Prav tako nima branja, ki bi ga lahko uporabil običajni izpis. Razen različice ni bilo prebrano nič.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'vsebuje neznano sliko (ne tovarniške vdelane programske opreme {version} niti njene spremembe, ki bi jo ta zavihek poznal), zato je izvedba ne popravi in ne povrne',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'vsebuje znano izdajo s popravkom hitrosti sličic: tovarniško vdelano programsko opremo {version} s popravkom hitrosti sličic za {hz} Hz. Izvedba popravi le tovarniško vdelano programsko opremo, nikoli že popravljene slike, zato te reže ne popravi in ne povrne',
  'preserve.image.frameRateEarlier':
    'vsebuje znano izdajo s popravkom hitrosti sličic: tovarniško vdelano programsko opremo {version} s starejšim popravkom hitrosti sličic za {hz} Hz (narejenim, preden se mu je pridružila rešitev za USB). Izvedba popravi le tovarniško vdelano programsko opremo, nikoli že popravljene slike, zato te reže ne popravi in ne povrne',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    'ta reža {what}. Če želite vključiti to režo, vanjo najprej zapišite nazaj tovarniško sliko (na primer iz polne varnostne kopije, narejene pred spremembo), nato začnite novo izvedbo',
  'preserve.image.frameRateWords':
    'ta reža {what}. Če želite vključiti to režo, vanjo najprej zapišite nazaj tovarniško sliko (na primer iz polne varnostne kopije, narejene pred popravkom hitrosti sličic), nato začnite novo izvedbo; popravek hitrosti sličic lahko na tovarniški sliki pozneje naredite znova',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name} {what}. Izvedba vzame vdelano programsko opremo, ki jo popravi, iz te reže, zato se ustavi tukaj, preden se karkoli zapiše. Če želite ohraniti to kamero, najprej zapišite tovarniško sliko nazaj v {bank:acc} (na primer iz polne varnostne kopije, narejene pred spremembo), nato začnite novo izvedbo.',
  'preserve.image.frameRateRefusal':
    '{name} {what}. Izvedba vzame vdelano programsko opremo, ki jo popravi, iz te reže, zato se ustavi tukaj, preden se karkoli zapiše. Če želite ohraniti to kamero, najprej zapišite tovarniško sliko nazaj v {bank:acc} (na primer iz polne varnostne kopije, narejene pred popravkom hitrosti sličic), nato začnite novo izvedbo; popravek hitrosti sličic lahko na tovarniški sliki pozneje naredite znova.',
  'preserve.image.otherFirmware':
    'vsebuje vdelano programsko opremo {image}, ne {camera}, ki jo poganja kamera',
  'preserve.image.otherFirmwareRefusal':
    '{name} vsebuje vdelano programsko opremo {image}, ne {camera}, ki jo poganja kamera, zato ta izvedba tam nima slike, ki bi jo lahko popravila, in raje zavrne, kot da bi pisala čeznjo.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'iz nje ni mogoče izpeljati nobene slike, ki bi jo izvedba lahko popravila ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone': 'ta izvedba je končana — vsi koraki so opravljeni (izvedba {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    'korak {step} je v tej izvedbi že opravljen (končan {finished}) — nadaljevanje se začne pri {next}',
  'preserve.gate.stepDoneUnknownTime':
    'korak {step} je v tej izvedbi že opravljen (ob neznanem času) — nadaljevanje se začne pri {next}',
  'preserve.gate.backupRerun':
    'varnostne kopije ni mogoče znova izvesti: ta izvedba je že opravila {steps}, njen naslednji korak pa je {next} — uporabite --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'prejšnji poskus varnostne kopije ni uspel, kamero pa je treba IZKLOPITI IN VKLOPITI, preden se ta korak znova izvede — ponovni poskus v istem zagonu lahko prebere zastarele ali prazne bajte (izmerjeno: ponovljena varnostna kopija je namesto zapisa zagonske konfiguracije prebrala zagonsko besedo zagonskega nalagalnika). Kamero izklopite in vklopite (odklopite in znova priklopite ali uporabite njeno stikalo za vklop), nato znova izvedite varnostno kopijo in ob vprašanju potrdite izklop in vklop: izvedba tega ne more videti. Zabeležena napaka: {error}',
  'preserve.gate.noErrorText': '(ni besedila napake)',
  'preserve.gate.patchAfterBackup':
    '{step} se izvede po varnostni kopiji: izvedba vzame izpis vseh območij, ki jih lahko prebere tovarniški načrt, in ga shrani, PREDEN se zgodi karkoli drugega — ta varnostna kopija je edina kopija te kamere. Najprej izvedite korak varnostne kopije.',
  'preserve.gate.commitAfterBackup': '{step} se izvede po varnostni kopiji (glejte korak popravka)',
  'preserve.gate.commitAfterPatch':
    '{step} se izvede po koraku popravka, ki zabeleži, kaj pripravi',
  'preserve.gate.commitNeedsPatch':
    '{step} potrebuje popravek {banks:gen}, korak popravka pa ni zabeležil nobenega — znova izvedite korak popravka',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step} zahteva datoteke varnostne kopije v imeniku izvedbe, ki pa manjkajo: {files} — brez njih potrditev zapisa nima vira za obnovitev, zato zavrne',
  'preserve.gate.drainNoCommit':
    '{step} bere POPRAVLJENI del skozi razširjeno okno, ta izvedba pa nima dokončane potrditve zapisa — branje celotnega pomnilnika bi se na tovarniški kameri zataknilo. Najprej izvedite potrditev zapisa (ali pri njej nadaljujte) ali pa izrecno preskočite (allowJump), če je potrditev uspela brez kontrolne točke.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'korak branja celotnega pomnilnika tukaj zavrne ({build}): {note}',
  'preserve.gate.detectedBuild': 'zaznana izdaja',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'korak branja celotnega pomnilnika tukaj zavrne ({build}): začetek branja celotnega pomnilnika na nepopravljeni vdelani programski opremi te izdaje sesuje kamero (bere z vrednosti, ki ni naslov v bliskovnem pomnilniku; izmerjeno na emulatorju: posredovanih 32 KB, nato je kamera odpovedala). Sprememba, ki branje naredi varno, je na {sites} in ni med spremembami, ki jih je ta izvedba zabeležila za {bank:acc} — pred branjem celotnega pomnilnika izvedite korak popravka (in uspešno zapišite).',
  'preserve.gate.drainFiles':
    '{step} potrebuje {files} (dostavljeni izpis se naknadno obdela z zajemom vsake zapisane reže), tega pa ni v imeniku izvedbe',
  'preserve.gate.restoreNoCommit':
    '{step} povrne izvirne reže čez popravek, ta izvedba pa nima dokončane potrditve zapisa — ni ničesar, kar bi lahko razveljavil. Najprej izvedite potrditev zapisa (ali pri njej nadaljujte) ali pa izrecno preskočite (allowJump), da obnovite že popravljeno kamero.',
  'preserve.gate.restoreNeedsPatch':
    '{step} potrebuje povzetek popravka vsake zapisane reže (za dolžino prenosa) — najprej izvedite korak popravka',
  'preserve.gate.restoreNoForm':
    'korak obnovitve tukaj zavrne ({build}): nobena oblika izvirne vdelane programske opreme ne prestane lastnega preverjanja kamere in se hkrati ne shrani nazaj kot izvirni bajti — kontrolna vsota izvirne vdelane programske opreme je 0xB7AB9D17 (izmerjeno), ne 0xFFFF, ki jo zahteva kamera. Ta izvedba se konča s celotno sliko v rokah in s popravkom na mestu; izvirno vsebino je mogoče vrniti le s programatorjem za celoten bliskovni pomnilnik.',
  'preserve.gate.restoreFiles':
    '{step} potrebuje {files} (izvirnik vsake zapisane reže iz koraka varnostne kopije), tega pa ni v imeniku izvedbe',
  'preserve.gate.verifyNoRestore':
    '{step} primerja svež zagon z varnostno kopijo, ta izvedba pa nima dokončane obnovitve — popravljena reža bi se pokazala kot razlike. Najprej izvedite obnovitev (ali pri njej nadaljujte) ali pa izrecno preskočite (allowJump), če je obnovitev uspela brez kontrolne točke.',
  'preserve.gate.verifyNeedsBackup':
    '{step} potrebuje {file} (referenco za primerjavo), tega pa ni v imeniku izvedbe',
  'preserve.gate.needsBanks':
    '{step} potrebuje reže, ki jih je prebral korak varnostne kopije, stanje pa jih nima',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'za to izvedbo ni izbrana nobena reža: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': '{bank:gen} ni mogoče zapisati: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'popravek te izdaje se zažene le iz obnovitvene reže R: {note} — izvedba bi pisala v {bank:acc}, iz katere je zagonski nalagalnik nikoli ne zažene',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'datoteka je premajhna za glavo slike',
  'slots.image.notWordSized': 'velikost slike mora biti večkratnik 4 (dobljeno {size} B)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'slika ima {size} B; zagonski nalagalnik zavrne vsak header.length >= {limit}, zato se ne bi nikoli zagnala',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'na {at} ni glave slike (magična vrednost {magic}, pričakovana {expected}) — to mora biti dešifrirana slika vdelane programske opreme Seek, ne šifrirana reža ali izpis bliskovnega pomnilnika',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'začetni kazalec sklada {address} ni v SRAM čipa LPC43xx — to ni videti dešifrirano',
  'slots.image.stackUnaligned': 'začetni kazalec sklada {address} ni poravnan na besedo',
  'slots.image.notThumb': 'vektor ponastavitve {address} ni naslov Thumb',
  'slots.image.noKeyPair':
    'ime te datoteke ne vsebuje para ključev, v sliki pa se niti par te kamere niti dekodirani par aplikacije ne pojavi natanko enkrat, zato ni mogoče ugotoviti, za katere ključe je bila slika narejena. Dešifrirane datoteke dobijo ime po ključih, ki jih vsebujejo.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'ime datoteke navaja ključ A {keyA} in ključ B {keyB}, vendar {mismatch}. Oba ključa morata biti prisotna, vsak natanko enkrat.',
  'slots.image.keyInHeader':
    'ta slika hrani ključ na {at}, znotraj nešifriranega okna glave — popravljanje je zavrnjeno',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'ključa A in B iz imena datoteke se razrešita v prekrivajoče se bajte na {at} in {other} — biti morata dve različni 16-bajtni vrednosti',
  'slots.image.retargetLost':
    'po preusmeritvi slika ne vsebuje para ključev te kamere natanko enkrat — zavrnjeno je sestavljanje vsebine, za katero zagonski nalagalnik poznejšim nadgradnjam ne bi mogel določiti ključa',
  'slots.image.noStageKey':
    'slika ne vsebuje nobenega para ključev serije 2016, zato ni ključa za pripravo, s katerim bi jo kodirali',
  'slots.image.ffSumNoKeys':
    'ta slika ima vsoto besed 16 Hz FF 0xFFFF, vendar ne vsebuje para ključev 1.3.0.8-FF (obeh polovic, vsake enkrat), zato njene pripravljene oblike ni mogoče sestaviti. Nič ni bilo zapisano.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'to je slika 1.3.0.8 FF (16 Hz), ki se pripravi v lastni obliki s ključem A (ff-form.ts), ne kot nešifrirana slika. Nič ni bilo zapisano.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'načrt je bil sestavljen za vdelano programsko opremo {firmware}, analiza pa bere {version}. Načrt je zastarel; sestavite ga znova. Nič ni bilo zapisano.',
  'slots.plan.otherFirmwareUnknown':
    'načrt je bil sestavljen za vdelano programsko opremo neznane različice, analiza pa bere {version}. Načrt je zastarel; sestavite ga znova. Nič ni bilo zapisano.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'načrt je bil sestavljen za kamero {planSerial}, analiza pa bere {serial}. Zapis tukaj je zavrnjen. Nič ni bilo zapisano.',
  'slots.plan.cameraUnknownSerial': 'z neznano serijsko številko',
  'slots.plan.unknownSerial': 'neznano serijsko številko',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, inside the sentence ("slot A"). */
  'slots.plan.otherAddress': 'načrt cilja na {address}, {name} te izdaje pa je na {at}',
  'slots.plan.notRead': 'analiza ne bere več {name:gen}. Nič ni bilo zapisano.',
  'slots.plan.edited':
    'kontrolna vsota načrta se ne ujema z njegovo vsebino, zato je bil načrt spremenjen. Nič ni bilo zapisano.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'vsebina ima {size} B in je večja od {name:gen}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck': '{risk}. Zapis zahteva acknowledgeRisk: true. Nič ni bilo poslano.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'ta kamera od tukaj ne more sprejeti nešifrirano pripravljene slike: {reason}. Nič ni bilo zapisano.',
  'slots.plan.noKeyTable':
    'analiza ne navaja tabele ključev zagonskega nalagalnika te kamere, zato slike ni mogoče preusmeriti nanjo',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'stanja potrditve po CompleteMemoryUpgrade ni bilo mogoče prebrati, zato je {name} morda delno zapisana. Pred vsem drugim znova preberite reže in obdržite svoj izpis.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'kamera je zapis v {name:acc} ob potrditvi zavrnila s stanjem {status}: {cause}. Nič ni bilo zapisano; reža je nespremenjena. Pred vsem drugim znova preberite reže.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade je za {name:acc} vrnil {status} ({cause}): nič ni bilo programirano, vendar se je brisanje morda začelo, zato je reža morda delno izbrisana. Pred vsem drugim znova preberite reže in obdržite svoj izpis.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade je vrnil {status} ({cause}) — {name} je morda delno zapisana. Pred vsem drugim znova preberite reže in obdržite svoj izpis.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'kamera je med pripravo {name:gen} na odmiku {offset} sporočila {status} — prekinjeno pred CompleteMemoryUpgrade, zato v bliskovni pomnilnik ni bilo zapisano nič',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum': 'kontrolna vsota prenosa se ni ujemala s pripravljenimi bajti',
  'commit.cause.unsupported':
    'slika se ni dešifrirala s ključi kamere ali pa je vrsta podatkov zavrnjena',
  'commit.cause.acceptance':
    'sliko je zavrnilo njeno preverjanje sprejema, preden je bilo karkoli izbrisano (preverjanje je odvisno od izdaje)',
  'commit.cause.notArmed': 'nobena nadgradnja reže ni bila aktivirana',
  'commit.cause.eraseFailed': 'faza brisanja ni uspela',
  'commit.cause.programFailed': 'faza programiranja ni uspela',
  'commit.cause.verifyFailed': 'faza preverjanja ni uspela',
  'commit.cause.unknown': 'stanje, ki tukaj ni znano',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name} se ne kopira sama vase. Nič ni bilo zapisano.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. Nič ni bilo zapisano.',
  'copy.refused.noPlain': '{name} nima dešifrirane slike za kopiranje. Nič ni bilo zapisano.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} je ZIP, ki ga tukaj ni mogoče prebrati ({error}). Nič ni bilo zapisano.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} ne vsebuje celotnega bliskovnega pomnilnika. ZIP je sprejet, če je datoteka izvedbe zavihka 0.x/1.x, ki vsebuje {preserve} (ko se je izvedel njen korak polnega izpisa), zip zavihka „Izpis in dešifriranje 4.x/Nano“ ({dump}) ali zip gumba „Izpiši vse selektorje“ ({selectors}); vsebina tega ZIP-a: {names}. Nič ni bilo zapisano.',
  'restore.refused.noWholeFlashPatched':
    '{file} ne vsebuje celotnega bliskovnega pomnilnika. ZIP je sprejet, če je datoteka izvedbe zavihka 0.x/1.x, ki vsebuje {preserve} (ko se je izvedel njen korak polnega izpisa), zip zavihka „Izpis in dešifriranje 4.x/Nano“ ({dump}) ali zip gumba „Izpiši vse selektorje“ ({selectors}); vsebina tega ZIP-a: {names}. Datoteka {patched} v njem je bliskovni pomnilnik z začasnim popravkom izvedbe, zato ni sprejeta. Nič ni bilo zapisano.',
  'restore.refused.zipEmpty': 'nič',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'polna varnostna kopija bliskovnega pomnilnika ima {full} B (4 MB, ves del, ki ga prebere J-Link); {file} ima {size} B. Nič ni bilo zapisano.',
  'restore.refused.noBank': 'načrt te izdaje nima {bank:gen}. Nič ni bilo zapisano.',
  'restore.refused.outsideFlash':
    '{name} ni znotraj 4 MB bliskovnega pomnilnika. Nič ni bilo zapisano.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    'Izpis, iz katerega izvira {file}, ni prebral tega mesta: {where}; po njegovem manifest.json je {address} vrzel. Ni slike za obnovitev. Nič ni bilo zapisano.',
  'restore.refused.gapReason':
    'Izpis, iz katerega izvira {file}, ni prebral tega mesta: {where}; po njegovem manifest.json je {address} vrzel ({gap}). Ni slike za obnovitev. Nič ni bilo zapisano.',
  'restore.refused.gapFill':
    'Izpis, iz katerega izvira {file}, ni prebral tega mesta: {where}; po njegovem manifest.json je {address} vrzel, zapolnjena z {fill}. Ni slike za obnovitev. Nič ni bilo zapisano.',
  'restore.refused.gapReasonFill':
    'Izpis, iz katerega izvira {file}, ni prebral tega mesta: {where}; po njegovem manifest.json je {address} vrzel ({gap}), zapolnjena z {fill}. Ni slike za obnovitev. Nič ni bilo zapisano.',
  'restore.refused.empty':
    'Prazna je {where}: vsi bajti so 0xFF. Zapis programira sliko in reže ne more pustiti izbrisane, zato prazne reže ni mogoče obnoviti z zapisom. Nič ni bilo zapisano.',
  'restore.refused.fill':
    'Vsak bajt je {fill}: {where} vsebuje polnilo, ki ga izpis zapiše tam, kjer ni prebral ničesar — izpis te reže ni prebral. Ni slike za obnovitev. Nič ni bilo zapisano.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    'Iz te datoteke ni mogoče obnoviti tega mesta: {where} — {why}. Nič ni bilo zapisano.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'ta izdaja nima aktivacije zapisa za režo',
  'support.noStagingEmpty': 'ta izdaja nima oblike priprave, zato se prazna reža ne zapiše',
  'support.buildUnknown': 'izdaja ni znana',
  'support.unverifiedStaging':
    'ta izdaja je v zaklenjeni seriji 0.x/1.x, vendar ni ena od izdaj, na katerih so bile izmerjene tabele popravkov za ohranjanje (0.8.0.0 .. 1.3.0.8 in 1.0.3.0 / 1.0.3.2), zato oblika priprave njene reže ni znana in nič se ne zapiše',
  'support.unknownFamily':
    'družina kamere ni znana, zato tudi ne ključ, pod katerim se zapisujejo njene reže, kamera pa sprejme režo, zapisano pod napačnim ključem, in se potem iz nje ne zažene. To kamero izpišite in dešifrirajte, jo prepoznajte iz izpisa, nato njeno družino navedite z --family.',
  'support.noReadCommand':
    'vdelana programska oprema, starejša od 0.8.0.0, nima bralnega obdelovalnika za GetFeaturedFirmwareData, ukaz, s katerim izpis bere bliskovni pomnilnik. Na 0.7.0.7 in 0.7.0.8 je v tabeli metod RPC na 0x4F, vendar registriran le kot setter (obdelovalnik zapisa), zato branja control-IN, ki ga pošlje izpis, ni mogoče usmeriti (izvedba na zavihku 0.x/1.x namesto tega bere ti dve izdaji prek wire id 0x58, GetFeaturedData); pred 0.7.0.7 je wire id 0x4F UploadFirmwareRowSize, na 0.3.0.1 pa je wire id 0x52 — tisti, s katerim izpis aktivira — EnterBootloaderMode namesto BeginFirmwareUpgrade: kamera ostane v svoji aplikaciji, vendar vsaka aktivacija nastavi cilj v bliskovnem pomnilniku in aktivira fazo nadgradnje vdelane programske opreme te izdaje (GetErrorCode nato prebere 0x00400000), kar ni bralno okno. Pridobljeno iz lastnih tabel metod slik, iz obeh stolpcev obdelovalnikov; glejte test/firmware/facts.json.',
  'support.noWritePath':
    'te izdaje sprejmejo novo vdelano programsko opremo prek starejšega zaporedja nadgradnje, ki ga ta orodja ne pošiljajo, njihove reže pa niso bile nikoli preslikane, zato se nič ne zapiše.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'različice vdelane programske opreme ni bilo mogoče prebrati, zato izdaja, njene reže in njihova oblika priprave niso znani; na njej se nič ne bere in ne zapisuje',
  'support.versionNotDotted':
    'različica vdelane programske opreme „{version}“ ni različica s pikami, zato izdaja, njene reže in njihova oblika priprave niso znani; na njej se nič ne bere in ne zapisuje',
  'support.olderThanFirst':
    'vdelana programska oprema {version} je starejša od {first}: njena tabela RPC nima bralnega obdelovalnika za GetFeaturedFirmwareData, ukaza, ki ga pošlje branje reže, zato se ji ne pošlje niti branje niti zapis (dokaze ima early-compact)',
  'support.modernOnLocked':
    'družina modern-4x pokriva 2.x, 4.x, 10.x, 42.x in 44.x; {version} je v zaklenjeni seriji 0.x / 1.x, ki potrebuje legacy-auth ali compact-2016',
  'support.lockedOnModern':
    'družina legacy-auth pokriva zaklenjeno serijo 0.x / 1.x; {version} je v sodobni seriji, ki potrebuje modern-4x',
  'support.notCompactPro':
    'družina compact-2016 pokriva serijo Compact PRO 1.0.3.x; {version} ni v njej',
  'support.earlyCompact':
    'družina early-compact pokriva le izdaje, starejše od {first}, {version} pa se bere prek legacy-auth',
  'support.generic':
    'družina kamere ni prepoznana (družina generic), zato razporeditev rež in oblika priprave nista znani; kamero prepoznajte, preden se reža bere ali zapiše',
  'support.noPlan':
    'za družino {family} ne obstaja noben načrt rež: njena razporeditev rež in oblika priprave nista znani',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'tabela te izdaje ne aktivira načina {mode} na {address} na navadnem kanalu',
  'support.noArmToken':
    'tabela te izdaje ne aktivira načina {mode} na {address} na kanalu z žetonom',
  'support.windowElsewhere': 'okno za ohranjanje {bank:gen} je na {at}, ne na {address}',
  'support.noDumpWindow':
    'tabela BeginFirmwareUpgrade te izdaje nima okna na {address} za {bank:acc}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} ne podpira {capability}: {reason}',
  'support.capability.dump': 'izpisa',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': '„Izpiši vse selektorje“',
  'support.capability.decrypt': 'dešifriranja',
  'support.capability.deviceInfo': 'polnega branja na zavihku Informacije',
  'support.capability.flash': 'zapisov v reže',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name} na {address} v tej izdaji ni berljiva: tabela selektorjev te izdaje tam nima okna, zato zanjo ni bilo nič aktivirano',
  'slots.unread.missing': '{name} manjka v analizi kamere',
  'slots.unread.notRead': '{name} ni bila prebrana',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. Nič ni bilo zapisano.',
  'slots.refused.versionUnknown':
    'analiza ne pove, katero vdelano programsko opremo poganja kamera, ukazi za reže pa v različnih izdajah pomenijo različno. Znova preberite podatke o napravi.',
  'slots.refused.versionUnknownWrite':
    'analiza ne pove, katero vdelano programsko opremo poganja kamera. Nič ni bilo zapisano.',
  'slots.refused.emptyInput': 'vhod je prazen',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable':
    '{name} je prazna in je v tej izdaji ni mogoče zapisati: {reason}',
  'slots.refused.noRaw': '{name} v tej izdaji ne more sprejeti surovih bajtov: {reason}',
  'slots.refused.noPlain': '{name} v tej izdaji ne more sprejeti dešifrirane slike: {reason}',
  'slots.refused.noStaging':
    '{name} v tej izdaji nima oblike priprave, zato slike zanjo ni mogoče kodirati',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B je več od velikosti {name:gen} ({bankSize} B)',
  'slots.refused.imageTooLong':
    'slika ima {size} B, kar je več od velikosti {name:gen} ({bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'zagonski nalagalnik iz leta 2014 v reži A ali B ne sprejme kontrolne vsote te izdaje, obnovitveno režo R (0x14070000) pa zažene brez preverjanja, zato se popravek zapiše v obnovitveno režo R in nikamor drugam',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly': 'ta izdaja teče le iz obnovitvene reže R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize':
    'reža vdelane programske opreme ima {size} B ({kib} KB); ta datoteka ima {count} B',
  'decryptFile.erasedBank':
    'prazna, ničesar za dešifriranje: vseh {size} B se bere kot 0xFF (izbrisana reža)',
  'decryptFile.erasedHeader':
    'izbrisana: okno glave je sam 0xFF, zato reža ne vsebuje slike; nič se ne dešifrira',
  'decryptFile.noHeader':
    'ni glave slike (magična vrednost {magic}), zato ni slike za dešifriranje',
  'decryptFile.lengthOutOfRange':
    'header.length {length} je zunaj obsega; ni slike za dešifriranje',
  'decryptFile.ffKeyB':
    'dešifriranih {size} B pod ključem B FF 1.3.0.8: slika je shranjena kot slika XOR tok ključa njenega bloka ključev 1, okno glave dobesedno',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'ključ ni obnovljen: slika se dešifrira v vektor ponastavitve, ki ni vstopna točka Cortex-M (ključ {check}); nič se ne dešifrira',
  'decryptFile.storedPlain':
    'shranjeno nešifrirano: reža vsebuje sliko, kakršna teče (nešifrirana veriga iz leta 2014, identitetni tok ključa), zato ključa ni in dešifrirana slika je slika sama',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 'dešifriranih {size} B pod ključem, obnovljenim iz te reže ({check})',
  'decryptFile.decryptedNamed':
    'dešifriranih {size} B pod ključem, obnovljenim iz te reže ({check}; to je {key})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'kratko branje ({size} B)',
  'read.reason.noParse': 'glave slike ni bilo mogoče razčleniti',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'ni glave slike (magična vrednost {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} je zunaj obsega',
  'read.reason.stopped': 'branje reže se je ustavilo pri {count}/{size} B',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'v vdelani programski opremi {version} ni berljivo: njen načrt ({table}) nima okna na {address}, zato zanj ni bilo nič aktivirano',
  'read.reason.notInPlanUnknown':
    'v vdelani programski opremi neznane različice ni berljivo: njen načrt ({table}) nima okna na {address}, zato zanj ni bilo nič aktivirano',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'okno je posredovalo bajte zastarelega deskriptorja bralnika — beseda 0 {word} s ponastavitvijo {hex} je tabela vektorjev naslova 0x14000000, ne vsebina te reže, zato iz nje ni bilo nič analizirano: {remedy}',
  'read.reason.spentReader': 'rež kamere ni bilo mogoče prebrati — {remedy}',
  'read.spentRemedy':
    'bralnik oken je morda za ta zagon izčrpan; kamero izklopite in vklopite ter poskusite znova',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'besede aktivne reže kamere (fw info roots, selektor 10) ni bilo mogoče prebrati',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'beseda aktivne reže kamere je {word}, kar ne označuje nobene reže',
  'checkKey.unnamed.cfg0NotRead':
    'beseda zagonske konfiguracije ni bila prebrana, zato ni znano, ali je zagonski nalagalnik preveril {bank:acc}, preden je vstopil vanjo',
  'checkKey.unnamed.noZeroSum':
    'kamera sporoča, da je vstopila v {bank:acc}, vendar se {bank} pri tem branju ne dešifrira v ničelno vsoto besed',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'kamera sporoča, da je vstopila v {bank:acc}, ki jo beseda zagonske konfiguracije {word} pusti za zadnjo, zato je zagonski nalagalnik vstopil vanjo brez preverjanja, vendar se {bank} pri tem branju ne dešifrira v ničelno vsoto besed',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (ocena {score} po branju, iz spodnjih dokazov)',
  'report.detectedAmbiguous': '{family} (ocena {score} po branju, iz spodnjih dokazov; nejasno)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'da',
  'report.cell.no': 'ne',
  'report.cell.notApplicable': 'n/p',
  'report.cell.unknown': 'neznano',
  'report.cell.recoveryOnly': 'samo za obnovitev',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'belilna konstanta K',
  'report.keyRow.store': 'ključ zapisa',
  'report.keyRow.check': 'kontrolni ključ',
  'report.keyRow.table': 'tabela ključev',
  'report.keyRow.keys': 'ključi',
  'report.keyRow.a': 'ključ A',
  'report.keyRow.b': 'ključ B',
  'report.keyRow.tableAt': 'tabela na',
  'report.key.notIdentified': '(ni prepoznano)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} kandidat, noben potrjen',
    two: '{count} kandidata, noben potrjen',
    few: '{count} kandidati, noben potrjen',
    other: '{count} kandidatov, noben potrjen',
  },
  'report.key.tableAt': '{offset} v bloku zagonskega nalagalnika, potrjeno glede na režo',
  'report.key.plainChain':
    'ni potreben: reže so shranjene kot nešifrirana vdelana programska oprema, zato se reža bere in zapisuje takšna, kot je',
  'report.key.tableRefused2016':
    'ni prebrano — blok zagonskega nalagalnika (0x14000000) je v tej seriji zavrnjen na vsakem kanalu',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, določen iz {bank:gen}, reže, v katero je po sporočilu kamere vstopila po preverjanju zagonskega nalagalnika',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, sklepan iz {bank:gen}, reže, v katero je po sporočilu kamere vstopila: zagonski nalagalnik vstopi v to režo brez preverjanja in jo zažene pod ključem, s katerim preverja druge reže',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' (blok 1 {pair})',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'para Compact PRO 1.0.3.x 9 Hz',
  'keyPair.cp1032ff': 'para Compact PRO 1.0.3.x FF',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'ni poimenovan — {why}',
  'report.checkKey.couldNotName': 'branje ga ni moglo poimenovati',
  'report.storeKey.checkKeyUnnamed':
    'ključ, s katerim njen zagonski nalagalnik preverja režo (pri tem branju ni poimenovan): aplikacija vsako režo, ki jo zapiše, shrani pod tem ključem',
  'report.storeKey.checkKey':
    '{key}: aplikacija vsako režo, ki jo zapiše, shrani pod ključem, s katerim preverja njen zagonski nalagalnik',
  'report.storeKey.unknown':
    'neznano — blok zagonskega nalagalnika, ki vsebuje mesto za ključ naprave, ni bil prebran',
  'report.storeKey.keyBUnidentified':
    'ključ B (ključ naprave ni programiran; sam ključ B ni prepoznan)',
  'report.storeKey.keyB': 'ključ B (ključ naprave ni programiran)',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain': 'pripravljena nešifrirano (slika, kakršna je, brez ključa)',
  'report.staged.slotKeystream': 'pripravljena pod lastnim blokom ključev 0 svoje slike',
  'report.staged.keyA':
    'pripravljena pod ključi, izpeljanimi iz zagnane reže in delujoče aplikacije',
  'report.staged.ffVendor':
    'pripravljena tako, kot proizvajalčeva aplikacija pripravi sliko 16 Hz FF (slika XOR njen lastni blok ključev 0), kamera pa jo shrani pod ključem B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Varnostna kopija: blok {address}',
  'progress.backupDone': 'Varnostna kopija: vsi bloki prebrani',
  'progress.checkBlock': 'Preverjanje: blok {address}',
  'progress.checkDone': 'Preverjanje: vsi bloki prebrani',
  'progress.writingBank': 'Zapisovanje {bank:gen}',
  'progress.restoringBank': 'Obnavljanje {bank:gen}',
  'progress.staged': '{label}: pripravljeno {done}/{total} B',
  'progress.wholeFlash': 'Branje celotnega pomnilnika: {got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'branje {address} subcmd={subcmd} ...',
  'progress.readWindowAuth': 'branje {address} subcmd={subcmd} (auth) ...',
  'progress.windowsRead': 'Končano — prebrana okna: {ok}/{total}.',
  'progress.readingBank': 'Branje {bank:gen} ...',
  'progress.analysing': 'Analiziranje ...',
  'progress.probeSelector': 'preizkus selektorja {selector} ...',
  'progress.selectorsArmed':
    'Končano — aktivirani selektorji: {armed}/{span}, s podatki: {withData}.',
  'progress.recoveringKey': 'dešifriranje: obnavljanje ključa za {address} ...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': 'Ni bilo mogoče prebrati {bank:gen} {address} (subcmd {subcmd}): {error}',
  'slots.read.refusedBuild':
    'branje rež vdelane programske opreme je zavrnjeno: {reason}. Razen branja različice ni bilo poslano nič, zato se nobena reža ni spremenila.',
  'slots.backup.notSaved':
    'varnostna kopija {file} ni bila shranjena, zato ni bilo zapisano nič. Zapis se nikoli ne izvede, ne da bi bila prej shranjena njegova varnostna kopija; poskusite znova, ko jo bo mogoče shraniti.',
  'slots.backup.notSavedWhy':
    'varnostna kopija {file} ni bila shranjena ({error}), zato ni bilo zapisano nič. Zapis se nikoli ne izvede, ne da bi bila prej shranjena njegova varnostna kopija; poskusite znova, ko jo bo mogoče shraniti.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'visoka (480 Mbit/s)',
  'usb.speed.full': 'polna (12 Mbit/s)',
  'usb.speed.code': 'koda {code}',
} satisfies Translation<'core', 'sl'>;
