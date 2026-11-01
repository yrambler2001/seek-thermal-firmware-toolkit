/**
 * Namespace `slots`, lietuvių (lt), translated from the English source: the firmware-slots tab.
 *
 * Owner: phase 2, slots agent.
 * Covers: views/SlotsView.tsx, hooks/useSlotsPanel.ts, components/SlotTable.tsx, SlotFpsConfirm.tsx,
 * SlotFpsEveryConfirm.tsx, SlotWriteConfirm.tsx, SlotFlashPreview.tsx, SlotWriteKeys.tsx.
 * (components/DeviceInfoPanel.tsx is done: its text is in `shared`, deviceInfo.*.)
 *
 * Words used all over this tab:
 * - bank = one of the camera's three firmware slots, A, B and R. R = the recovery slot, the
 *   last-resort copy the bootloader falls back to.
 * - {bank} is a bank's name from common:bank.* ("Slot A", "Recovery R" on its own; "slot A",
 *   "recovery R" inside a sentence). {a}, {b}, {r} are those names inside a sentence; {letter},
 *   {letterA}, {letterB}, {letterR} are the bare letters A, B and R (keep them Latin).
 * - booted = the bank the camera started from (the firmware it runs now).
 * - write / flash = erase a bank and program a new image into it. Commit = the camera's last step of a
 *   write, after which the bank may be changed.
 * - read-back = the bank read again after a write, to compare with what was sent.
 * - "Flash decrypted image", "Read slots", "Dump"… in quotes or bold are this tab's own buttons
 *   (table.flashPlain, actions.read, table.dump): use the same words as those keys.
 * - Hz values, firmware versions (0.8.0.0, 1.3.0.8), 0xFF, .bin/.zip, SWD/J-Link and SPI stay as they
 *   are. Key A / Key B: translate "Key", keep the letter. KiB/MiB are written KB/MB (README, Units).
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* The section: its heading, badge and one-line summary. */
  'section.title': 'Darbas su mikroprogramos lizdais',
  'section.badge': 'Rašo į flash atmintį',
  'section.description':
    '„Nuskaityti lizdus“ paklausia kameros, ką ji vykdo, nuskaito tris jos mikroprogramos lizdus — {a:acc}, {b:acc} ir {r:acc} — ir parodo, kas kiekviename yra. Skaitymas ir kopijos išsaugojimas nieko nekeičia. Įrašymo mygtukas paklausia prieš išsiunčiant bet kurį baitą.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Šis puslapis gali rašyti į kameros flash atmintį.** Įrašymas ištrina vieną 64 KB lizdą ir jį užprogramuoja. Struktūriškai teisingas, bet neveikiantis atvaizdas palieka kamerą nepasileidžiančią, o paleidyklė neturi USB — ją atkurti galima tik per SWD/J-Link arba SPI programatoriumi. Pirmiausia išsaugokite lizdo kopiją ir pasilikite failą.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Lizdų veiksmai',
  'actions.read': 'Nuskaityti lizdus',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Lizdai',

  /* Before any read. */
  'empty.connected': 'Spustelėkite „Nuskaityti lizdus“.',
  'empty.disconnected': 'Prijunkite kamerą, tada spustelėkite „Nuskaityti lizdus“.',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Šis leidimas čia nepalaikomas, todėl joks lizdas nenuskaitytas ir nė vieno negalima įrašyti.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Neatpažinta: šis puslapis negali nustatyti, kokį leidimą vykdo kamera.',
  'refusal.notIdentified.body':
    'Kamera nepateikė tinkamos mikroprogramos versijos, todėl joks lizdas nenuskaitytas ir niekas neaktyvuota. Šis puslapis skirtas {minVersion} ir naujesniems leidimams. Senesni nei {minVersion} leidimai nepatenka į tai, ką palaiko lizdų puslapis, todėl kamera su tokiu leidimu čia niekada neskaitoma.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Jei kamera vykdo palaikomą leidimą, ji galbūt tik pasileidžia. {hint}',
  'refusal.title': 'Atmesta — niekas neaktyvuota.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Skaitoma ...',
  'status.readingAgain': 'Lizdai skaitomi iš naujo ...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Nuskaityta. Nuskaityta lizdų: {read}/{count}.',
    few: 'Nuskaityta. Nuskaityta lizdų: {read}/{count}.',
    many: 'Nuskaityta. Nuskaityta lizdų: {read}/{count}.',
    other: 'Nuskaityta. Nuskaityta lizdų: {read}/{count}.',
  },
  'status.unsupported': 'Šiame leidime nepalaikoma — joks lizdas nenuskaitytas.',
  'status.refused': 'Atmesta — niekas neaktyvuota. Žr. pranešimą po žurnalu.',
  'status.disconnected': 'Įrenginys atjungtas — nuskaitykite lizdus iš naujo.',
  'status.newDevice': 'Pasirinktas naujas įrenginys — nuskaitykite lizdus iš naujo.',
  'status.dumping': 'Išsaugoma {bank:gen} kopija ...',
  'status.dumped': 'Išsaugota {bank:gen} kopija.',
  'status.readingImage': 'Skaitomas atvaizdas ...',
  'status.ready': 'Paruošta — peržiūrėkite planą, tada jį įrašykite.',
  'status.rejected': 'Atmesta — žr. žurnalą aukščiau.',
  'status.writing': 'Įrašoma ...',
  'status.patching': 'Taisomas {bank:nom} ...',
  'status.patchingEvery': 'Taisomi visi lizdai ...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Įrašyta, bet kontrolinis nuskaitymas nesutampa — žr. rezultatą.',
  'status.written.verified': 'Įrašyta. Lizdas nuskaitomas toks, koks įrašytas.',
  'status.written.notCompared': 'Įrašyta. Kontrolinis nuskaitymas nepalygintas — žr. rezultatą.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Pataisyta, bet kontrolinis nuskaitymas skiriasi ne tik taip, kaip planuota — žr. rezultatą.',
  'status.patched.ok': 'Pataisyta. Lizdas nuskaitomas toks, koks planuotas.',
  'status.patched.unchecked': 'Pataisyta. Kontrolinis nuskaitymas nepatikrintas — žr. rezultatą.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Sustota ties {bank:ins} — pataisytas {count} lizdas; žr. rezultatą.',
    few: 'Sustota ties {bank:ins} — pataisyti {count} lizdai; žr. rezultatą.',
    many: 'Sustota ties {bank:ins} — pataisyta {count} lizdo; žr. rezultatą.',
    other: 'Sustota ties {bank:ins} — pataisyta {count} lizdų; žr. rezultatą.',
  },
  'status.every.unchecked': {
    one: 'Pataisytas {count} lizdas, bet kontrolinis nuskaitymas nepatikrintas, kaip planuota — žr. rezultatą.',
    few: 'Pataisyti {count} lizdai, bet vienas kontrolinis nuskaitymas nepatikrintas, kaip planuota — žr. rezultatą.',
    many: 'Pataisyta {count} lizdo, bet vienas kontrolinis nuskaitymas nepatikrintas, kaip planuota — žr. rezultatą.',
    other:
      'Pataisyta {count} lizdų, bet vienas kontrolinis nuskaitymas nepatikrintas, kaip planuota — žr. rezultatą.',
  },
  'status.every.ok': {
    one: 'Pataisytas {count} lizdas. Jis nuskaitomas toks, koks planuotas.',
    few: 'Pataisyti {count} lizdai. Kiekvienas nuskaitomas toks, koks planuotas.',
    many: 'Pataisyta {count} lizdo. Kiekvienas nuskaitomas toks, koks planuotas.',
    other: 'Pataisyta {count} lizdų. Kiekvienas nuskaitomas toks, koks planuotas.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Atšaukta — nieko neįrašyta.',
  'status.cancelled.one':
    'Atšaukta po to, kai {bank:dat} buvo išsiųstas patvirtinimas — lizdas gali būti įrašytas iš dalies. Prieš juo pasikliaudami, jį nuskaitykite.',
  'status.cancelled.many':
    'Atšaukta po to, kai {banks:dat} buvo išsiųsti patvirtinimai — kiekvienas gali būti įrašytas iš dalies. Prieš jais pasikliaudami, juos nuskaitykite.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Pirmiausia prijunkite kamerą.',
  'gate.busy': 'Vykdoma kita operacija — palaukite, kol ji baigsis.',
  'gate.readFirst': 'Pirmiausia nuskaitykite lizdus.',
  'gate.cameraRefused':
    'Šios kameros iš čia įrašyti negalima dėl priežasties, nurodytos pranešime aukščiau. Niekas nesiunčiama.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Nenuskaityta: {reason}. Prieš įrašydami nuskaitykite lizdus iš naujo.',
  'gate.notReadNoReason':
    'Nenuskaityta: šis lizdas nebuvo nuskaitytas. Prieš įrašydami nuskaitykite lizdus iš naujo.',
  'gate.emptyNotWritable': 'Šis lizdas tuščias, ir šiame leidime jo įrašyti negalima: {reason}',
  'gate.noSuchBank': 'Šiame leidime tokio lizdo nėra.',

  /* The bank table. */
  'table.caption':
    'Kiekvienas šios kameros mikroprogramos lizdas — {a}, {b} ir {r} — toks, koks nuskaitytas ir patikrintas naršyklėje',
  'table.col.bank': 'Lizdas',
  'table.col.firmware': 'Mikroprograma',
  'table.col.size': 'Dydis',
  'table.col.key': 'Raktas',
  'table.col.bootable': 'Paleidžiamas',
  'table.col.sha': 'Atviro teksto SHA-256',
  'table.col.actions': 'Veiksmai',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'nenuskaityta — {reason}',
  'table.notReadNoReason': 'nenuskaityta — lizdas nebuvo nuskaitytas',
  /* A badge: the bank holds no image. */
  'table.empty': 'tuščias',
  'table.emptyNote':
    'Atvaizdo nėra: šio lizdo antraštės langas skaitomas kaip vien 0xFF, todėl iš jo nieko neiššifruojama, o jį įrašant neperrašoma jokia mikroprograma.',
  /* {reason} is core's. */
  'table.emptyWritable': 'Galima įrašyti.',
  'table.emptyNotWritable': 'Šiame leidime įrašyti negalima: {reason}',
  'table.unknownVersion': 'nežinoma versija',
  /* {id} is the image id in hex. */
  'table.imageId': 'atvaizdas {id}',
  'table.noImage': 'atvaizdo nėra',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'lizdo dydis {size} B',
  'table.imageSize': 'atvaizdo dydis {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'nėra (atviras tekstas)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— nėra ko paleisti',
  'table.boot.bootable': 'paleidžiamas — paleidyklė jį priima',
  'table.boot.notBootable': 'nepaleidžiamas — paleidžiant praleidžiamas',
  'table.boot.recoveryOnly':
    'tik atkūrimui — {letterR} paleidžiamas, kai lizduose {letterA} ir {letterB} nėra nieko, ką priimtų paleidyklė (išmatuota kameroje su ankstesne šio atvaizdo forma); ar ši forma pasileidžia, nepatikrinta',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'nežinoma — {why}',
  /* The row's buttons. */
  'table.dump': 'Išsaugoti kopiją',
  'table.flashPlain': 'Įrašyti iššifruotą atvaizdą…',
  'table.flashRaw': 'Įrašyti neapdorotus baitus…',
  'table.restore': 'Atkurti iš visos flash atminties atsarginės kopijos (.bin arba .zip)…',
  'table.makeFps': 'Nustatyti {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Kopijuoti į {bank:acc}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: išjungta',
  'table.copyNote':
    'Nukopijuoja šiame lizde esančią mikroprogramą, tokią, kokią iššifravo šis nuskaitymas, į jūsų pasirinktą lizdą, kad ir kas jame dabar būtų. Prieš ką nors išsiunčiant peržiūrėsite planą.',
  'table.restoreNote':
    'Pasirinkite visos flash atminties atsarginę kopiją: .bin (visas 4 MB flash atminties atvaizdas, pavyzdžiui, nuskaitytas per J-Link) arba .zip, kuriame toks yra (0.x/1.x skirtuko seanso failas arba ZIP, kurį išsaugo „Nuskaityti ir iššifruoti 4.x/Nano“ ar „Nuskaityti visus selektorius“). Iš jo iškerpamas šis lizdas, iššifruojamas ir parodomas kaip planas prieš ką nors išsiunčiant.',
  'table.fpsNote':
    'Pakelia šio lizdo dažnį nuo {fromHz} Hz iki {toHz} Hz, keisdamas jo baitus. Pirmiausia lizdas išsaugomas atsisiunčiamame ZIP faile, o jame esantis iššifruotas failas leidžia grįžti atgal.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery':
    '{booted}, ir tai atkūrimo lizdas: jį įrašant prašoma papildomo patvirtinimo.',
  'table.risk.booted': '{booted}: jį įrašant prašoma papildomo patvirtinimo.',
  'table.risk.recovery': '{bank}: jį įrašant prašoma papildomo patvirtinimo.',
  'table.risk.bootUnnamed':
    'Kamera nenurodo, iš kurio lizdo pasileido: šį lizdą įrašant prašoma papildomo patvirtinimo.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Kadrų dažnio pataisa pritaikyta: šis atvaizdas veikia {hz} Hz dažniu.',
  'fps.earlierPatch':
    'Kadrų dažnio pataisa nesiūloma: šiame lizde yra ankstesnė {hz} Hz pataisa be USB pataisymo. Atkurkite gamyklinį atvaizdą, tada spustelėkite „Nustatyti {hz} FPS“.',
  'fps.atRate': 'Kadrų dažnio pataisos nereikia: šis leidimas jau veikia {hz} Hz dažniu.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Kadrų dažnio pataisa nesiūloma: {reason}',
  'fps.readFirst':
    'pirmiausia nuskaitykite lizdus — pataisa planuojama pagal paties lizdo atvaizdą',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Visi lizdai',
  'everyBank.make': 'Nustatyti {hz} FPS visuose lizduose',
  'everyBank.faster': 'Pagreitinti visus lizdus',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Pataiso {order:acc} vienu patvirtinimu; kiekvienas pirmiausia išsaugomas viename atsisiunčiamame ZIP faile ir patikrinamas kontroliniu nuskaitymu.',
  'everyBank.noteBootedLast':
    'Pataiso {order:acc} vienu patvirtinimu, o lizdą, iš kurio kamera dabar pasileidžia, — paskutinį; kiekvienas pirmiausia išsaugomas viename atsisiunčiamame ZIP faile ir patikrinamas kontroliniu nuskaitymu.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': '{bank:gen} atvaizdas',
  'what.restore': 'failo {file} {bank:nom}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Paruošta {bank:dat} adresu {address}',
  'preview.file': 'Failas',
  'preview.source': 'Atvaizdas paimtas iš',
  'preview.target': 'Paskirtis',
  'preview.targetEmpty':
    '{bank} tuščias: jame nėra atvaizdo, todėl šis įrašymas neperrašo jokios mikroprogramos',
  'preview.readAs': 'Skaityta kaip',
  'preview.readAs.ff': 'iššifruotas {version} FF atvaizdas',
  'preview.readAs.plain': 'iššifruotas atvaizdas',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'neapdoroti baitai',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Paruošimas',
  'preview.key': 'Raktas',
  'preview.payload': 'Duomenys',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} B per {count} dalį iki {chunk} B',
    few: '{size} B per {count} dalis iki {chunk} B',
    many: '{size} B per {count} dalies iki {chunk} B',
    other: '{size} B per {count} dalių iki {chunk} B',
  },
  'preview.checksum': 'Perdavimo kontrolinė suma',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Bus saugoma',
  'preview.storedNotPredicted': 'nenuspėta — patikra yra kontrolinis nuskaitymas',
  'preview.storedPredicted': 'numatoma {size} B',
  'preview.storedKeyB': 'numatoma {size} B — atvaizdas XOR raktas B, o ne patys duomenys',
  'preview.savedFirst': 'Pirmiausia išsaugoma',
  'preview.compareCaption': 'Kas pasikeis {bank:loc}',
  'preview.col.field': 'Laukas',
  'preview.col.now': 'Dabar',
  'preview.col.after': 'Po įrašymo',
  'preview.readFirst': 'Perskaitykite prieš įrašydami:',
  /* {note} is core's note about this write. */
  'preview.note': 'Pastaba: {note}',
  'preview.nothingSent':
    'Kamerai dar niekas neišsiųsta. Įrašant šie duomenys siunčiami į {bank:acc} ir patvirtinami.',
  'preview.toolbar': '{bank:gen} įrašymo veiksmai',
  'preview.write': 'Įrašyti į {bank:acc}…',
  'preview.discard': 'Atmesti',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Įrašyti į {bank:acc} adresu {address} ({what})?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Jį įrašius bus pakeista šiuo metu kameroje veikianti mikroprograma. Jei naujas atvaizdas neveiks, kamera gali visai nepasileisti.',
  'writeConfirm.recovery':
    '{bank} — paskutinė rezervinė kopija, į kurią paleidyklė grįžta, kai kiti lizdai netinka. Jį įrašius, kamera liks be šios kopijos, kol ji nebus atkurta.',
  'writeConfirm.bootUnnamed':
    'Kamera nenurodo, iš kurio lizdo pasileidžia, todėl {bank:nom} laikomas lizdu, iš kurio ji dabar pasileidžia. Jį įrašius gali būti pakeista kameroje veikianti mikroprograma.',
  'writeConfirm.empty':
    '{bank} tuščias: jame nėra atvaizdo, todėl jokia mikroprograma neperrašoma.',
  'writeConfirm.eraseEmpty':
    'Įrašymas vis tiek ištrina 64 KB kameros flash atminties bloką {bank:loc} (jau tuščią) ir jį užprogramuoja.',
  'writeConfirm.erase':
    'Tai ištrina 64 KB kameros flash atminties bloką ir jį užprogramuoja {bank:loc}.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine': 'Atvaizdo įrašymo raktas: {key}. Visi kiti lizdai įrašomi taip pat.',
  'writeConfirm.backup':
    'Prieš ką nors išsiunčiant, {bank:nom} nuskaitomas dar kartą ir išsaugomas kaip vienas atsisiunčiamas ZIP failas: {file}. Ieškokite jo atsisiuntimų aplanke.',
  'writeConfirm.noReset':
    'Paleidimo iš naujo komanda nesiunčiama. Po to atjunkite ir vėl prijunkite kamerą, kad lizdas imtų veikti.',
  'writeConfirm.noUsbRecovery':
    'Jei atvaizdas neveiks, kameros per USB atkurti nepavyks — tik per SWD/J-Link arba SPI programatoriumi.',
  'writeConfirm.ackUnnamed':
    'Suprantu, kad kamera nenurodo, iš kurio lizdo pasileidžia, todėl šis laikomas paleistu, ir kad blogas atvaizdas gali palikti kamerą nepasileidžiančią.',
  'writeConfirm.confirm': 'Taip — įrašyti į {bank:acc}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Suprantu, kad tai lizdas, iš kurio kamera dabar pasileidžia, ir kad blogas atvaizdas gali palikti kamerą nepasileidžiančią.',
  'ack.recovery':
    'Suprantu, kad tai atkūrimo lizdas ir kad blogas atvaizdas palieka kamerą be paskutinės rezervinės kopijos.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Nustatyti {hz} FPS {bank:dat}?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted':
    '{bootsNow}. Pataisytas atvaizdas pakeis šiuo metu veikiančią mikroprogramą.',
  'fpsConfirm.recovery':
    '{bank} — paskutinė rezervinė kopija, į kurią paleidyklė grįžta, kai kiti lizdai netinka.',
  'fpsConfirm.what':
    'Mikroprograma {version}, esanti {bank:loc}, po šio pakeitimo veiks {toHz} Hz, o ne {fromHz} Hz dažniu.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(nežinoma)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'Pataisa pakeičia {count} atvaizdo baitą ir priėmimo sumos žodį, todėl paleidyklės tikrinama suma išlieka. Raktų pora nekeičiama.',
    few: 'Pataisa pakeičia {count} atvaizdo baitus ir priėmimo sumos žodį, todėl paleidyklės tikrinama suma išlieka. Raktų pora nekeičiama.',
    many: 'Pataisa pakeičia {count} atvaizdo baito ir priėmimo sumos žodį, todėl paleidyklės tikrinama suma išlieka. Raktų pora nekeičiama.',
    other:
      'Pataisa pakeičia {count} atvaizdo baitų ir priėmimo sumos žodį, todėl paleidyklės tikrinama suma išlieka. Raktų pora nekeičiama.',
  },
  'fpsConfirm.wayBack':
    'Tame ZIP faile esantis iššifruotas failas leidžia grįžti atgal: norėdami atšaukti pataisą, įrašykite jį mygtuku „Įrašyti iššifruotą atvaizdą“ į {bank:acc}.',
  'fpsConfirm.noReset':
    'Paleidimo iš naujo komanda nesiunčiama. Po to atjunkite ir vėl prijunkite kamerą, kad pataisytas lizdas imtų veikti.',
  'fpsConfirm.ackUnnamed':
    'Suprantu, kad kamera nenurodo, iš kurio lizdo pasileidžia, todėl šis laikomas paleistu.',
  'fpsConfirm.confirm': 'Taip — pataisyti {bank:acc}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Nustatyti {hz} FPS visuose lizduose?',
  'fpsEvery.titleMixed': {
    one: 'Pataisyti {count} lizdo kadrų dažnį?',
    few: 'Pataisyti {count} lizdų kadrų dažnį?',
    many: 'Pataisyti {count} lizdo kadrų dažnį?',
    other: 'Pataisyti {count} lizdų kadrų dažnį?',
  },
  'fpsEvery.intro': {
    one: 'Bus pataisytas {count} lizdas, kuriam pataisa yra (mikroprograma {version}):',
    few: 'Bus pataisyti {count} lizdai, kuriems pataisa yra (mikroprograma {version}):',
    many: 'Bus pataisyta {count} lizdo, kuriems pataisa yra (mikroprograma {version}):',
    other: 'Bus pataisyta {count} lizdų, kuriems pataisa yra (mikroprograma {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (lizdas, iš kurio ši kamera dabar pasileidžia, ir atkūrimo lizdas)',
  'fpsEvery.role.booted': '{bank} (lizdas, iš kurio ši kamera dabar pasileidžia)',
  'fpsEvery.role.recovery': '{bank} (atkūrimo lizdas, paskutinė rezervinė kopija)',
  'fpsEvery.role.bootUnnamed': '{bank} (kamera nenurodo, iš kurio lizdo pasileidžia)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: nuo {fromHz} Hz iki {toHz} Hz, {count} baitas ir priėmimo sumos žodis.',
    few: '{bank}: nuo {fromHz} Hz iki {toHz} Hz, {count} baitai ir priėmimo sumos žodis.',
    many: '{bank}: nuo {fromHz} Hz iki {toHz} Hz, {count} baito ir priėmimo sumos žodis.',
    other: '{bank}: nuo {fromHz} Hz iki {toHz} Hz, {count} baitų ir priėmimo sumos žodis.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Paliekami kaip yra: {others}',
  'fpsEvery.orderOne': 'Įrašomas tik {bank:nom}, tada jis patikrinamas kontroliniu nuskaitymu.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Jie įrašomi šia tvarka: {order}. Kiekvienas patikrinamas kontroliniu nuskaitymu prieš kitą, o pirmoji nesėkmė sustabdo likusius.',
  'fpsEvery.orderBootedLast':
    'Jie įrašomi šia tvarka: {order}. Lizdas, iš kurio kamera dabar pasileidžia, įrašomas paskutinis, todėl nesėkmės atveju iki jo neprieinama. Kiekvienas patikrinamas kontroliniu nuskaitymu prieš kitą, o pirmoji nesėkmė sustabdo likusius.',
  'fpsEvery.wayBack':
    'Tame ZIP faile esantys iššifruoti failai leidžia grįžti atgal: norėdami atšaukti lizdo pataisą, įrašykite jo failą mygtuku „Įrašyti iššifruotą atvaizdą“ į tą lizdą.',
  'fpsEvery.noReset':
    'Paleidimo iš naujo komanda nesiunčiama. Po to atjunkite ir vėl prijunkite kamerą, kad pataisyti lizdai imtų veikti.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Suprantu, kad bus įrašyti šie lizdai: {banks}, ir kad blogas atvaizdas gali palikti kamerą nepasileidžiančią.',
  'fpsEvery.confirm': {
    one: 'Taip — pataisyti {count} lizdą',
    few: 'Taip — pataisyti {count} lizdus',
    many: 'Taip — pataisyti {count} lizdo',
    other: 'Taip — pataisyti {count} lizdų',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: lizdas nuskaitomas toks, koks įrašytas.',
  'outcome.mismatch': '{bank} — {what}: kontrolinis nuskaitymas NESUTAMPA su tuo, kas įrašyta.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: kontrolinis nuskaitymas atliktas, bet nepalygintas, todėl šis įrašymas čia nepatvirtintas.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'Kameros patvirtinimas grąžino būseną {status}.',
  'outcome.wasEmpty':
    '{bank} prieš šį įrašymą buvo tuščias, todėl jokia mikroprograma neperrašyta.',
  'outcome.provenVerified':
    'Kol kas įrodyta: duomenys išsiųsti ir patvirtinti, o lizdas nuskaitomas toks, koks įrašytas. NEĮRODYTA: kad paleidyklė pasirinks šį lizdą arba kad atvaizdas veiks.',
  'outcome.provenCommitted':
    'Kol kas įrodyta: duomenys išsiųsti ir patvirtinti. NEĮRODYTA: kad paleidyklė pasirinks šį lizdą arba kad atvaizdas veiks.',
  'outcome.replug':
    '**DABAR ATJUNKITE IR VĖL PRIJUNKITE KAMERĄ.** Paleidimo iš naujo komanda nebuvo išsiųsta, todėl lizdas įsigalios tik tikrai išjungus ir vėl įjungus maitinimą. Tada nuskaitykite lizdus iš naujo: tik kameros nurodyta versija ir aktyvus lizdas tai galutinai patvirtina.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**DABAR ATJUNKITE IR VĖL PRIJUNKITE KAMERĄ.** Paleidimo iš naujo komanda nebuvo išsiųsta. Tada nuskaitykite lizdus iš naujo.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Pirmiausia išsaugota kaip atsisiųstas failas: {file}.',
  'outcome.wayBackOne':
    'Jame esantis iššifruotas failas leidžia grįžti atgal („Įrašyti iššifruotą atvaizdą“ tame pačiame lizde).',
  'outcome.wayBackMany':
    'Jame esantys iššifruoti failai leidžia grįžti atgal („Įrašyti iššifruotą atvaizdą“ kiekviename lizde).',
  'outcome.checkDownloads': 'Ieškokite jo atsisiuntimų aplanke.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank} — pataisyta nuo {fromHz} Hz iki {toHz} Hz (mikroprograma {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'Kontrolinis nuskaitymas nuo išsaugotos kopijos skiriasi tik planuotais baitais ({count}), vietomis ir sumos žodžiu.',
    few: 'Kontrolinis nuskaitymas nuo išsaugotos kopijos skiriasi tik planuotais baitais ({count}), vietomis ir sumos žodžiu.',
    many: 'Kontrolinis nuskaitymas nuo išsaugotos kopijos skiriasi tik planuotais baitais ({count}), vietomis ir sumos žodžiu.',
    other:
      'Kontrolinis nuskaitymas nuo išsaugotos kopijos skiriasi tik planuotais baitais ({count}), vietomis ir sumos žodžiu.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'Kontrolinis nuskaitymas skiriasi NE tik taip, kaip planuota: netikėtų baitų — {unexpected}, trūkstamų — {count}.',
    few: 'Kontrolinis nuskaitymas skiriasi NE tik taip, kaip planuota: netikėtų baitų — {unexpected}, trūkstamų — {count}.',
    many: 'Kontrolinis nuskaitymas skiriasi NE tik taip, kaip planuota: netikėtų baitų — {unexpected}, trūkstamų — {count}.',
    other:
      'Kontrolinis nuskaitymas skiriasi NE tik taip, kaip planuota: netikėtų baitų — {unexpected}, trūkstamų — {count}.',
  },
  'fpsOutcome.notTaken': 'Kontrolinis nuskaitymas neatliktas, todėl pataisa čia nepatikrinta.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Visi lizdai: pataisyta {done} iš {count}, šia tvarka: {order}.',
    few: 'Visi lizdai: pataisyta {done} iš {count}, šia tvarka: {order}.',
    many: 'Visi lizdai: pataisyta {done} iš {count}, šia tvarka: {order}.',
    other: 'Visi lizdai: pataisyta {done} iš {count}, šia tvarka: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'Kontrolinis nuskaitymas nuo išsaugoto lizdo skiriasi tik planuotais baitais ({count}).',
    few: 'Kontrolinis nuskaitymas nuo išsaugoto lizdo skiriasi tik planuotais baitais ({count}).',
    many: 'Kontrolinis nuskaitymas nuo išsaugoto lizdo skiriasi tik planuotais baitais ({count}).',
    other: 'Kontrolinis nuskaitymas nuo išsaugoto lizdo skiriasi tik planuotais baitais ({count}).',
  },
  'fpsEveryOutcome.notTaken': 'Kontrolinis nuskaitymas neatliktas.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Sustabdyta: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Neįrašyta: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Iš čia negalima įrašyti nė vieno šios kameros lizdo.',
  'keys.title': 'Įrašymo raktai',
  'keys.chain': 'Grandinė',
  'keys.chainPlain':
    '2014 m. neužšifruota grandinė: kiekvienas lizdas saugomas neužšifruotas, todėl nė viename nėra rakto',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Įrašoma kaip',
  'keys.writtenPlain': 'atvaizdas toks, koks yra, be rakto, į bet kurį lizdą',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Paruošiama kaip',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Saugoma kaip',
  'keys.refused': 'Atmesta',
  'keys.bootedBank': 'Paleistas lizdas',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank}: {key}',
  'keys.theBootedBank': 'paleistas lizdas',
  'keys.unnamedKey': 'raktas, kurio puslapis negali įvardyti',
  'keys.bootedBanksKey': 'paleisto lizdo raktas',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; visi lizdai įrašomi taip pat',

  /* "What these buttons do", below the tab. */
  'how.title': 'Ką daro šie mygtukai',
  'how.read': '**Nuskaityti lizdus** ir **Išsaugoti kopiją** kameroje nieko nekeičia.',
  'how.flash':
    '**Įrašyti iššifruotą atvaizdą** paima atviro teksto atvaizdą, prieš paruošdamas jį užšifruoja taip, kaip reikia to lizdo mikroprogramai, ir parodo planą. **Įrašyti neapdorotus baitus** paruošia failą lygiai tokį, koks pateiktas. Nė vienas mygtukas nieko nesiunčia, kol nepatvirtinate.',
  'how.ff':
    'Įrašant atkūrimo lizdą {letterR} prašoma papildomo patvirtinimo, kaip ir per bet kurį atkūrimo lizdo įrašymą. **Tuščias** lizdas (jo antraštės langas skaitomas kaip vien 0xFF, kaip daugelio 2014 m. kamerų {b:loc}) yra būsena, o ne gedimas. Jis įrašomas lygiai taip pat, kaip bet kuris kitas lizdas.',
  'how.copy':
    '**Atkurti iš visos flash atminties atsarginės kopijos** paima .bin (visą 4 MB flash atminties atvaizdą, pavyzdžiui, nuskaitytą per J-Link) arba jį turintį .zip (0.x/1.x skirtuko seanso failą arba ZIP, kurį išsaugo „Nuskaityti ir iššifruoti 4.x/Nano“ ar „Nuskaityti visus selektorius“), iškerpa iš jo šį lizdą, iššifruoja ir parodo planą; jei atsarginė kopija atrodo kaip kitos kameros ar kitos mikroprogramos, tai nurodoma plane.',
  'how.fps':
    '**Nustatyti N FPS** lizdo eilutėje pakeičia to lizdo atvaizdą, kad kadrų dažnis būtų didesnis, o **Nustatyti N FPS visuose lizduose** tai padaro visuose lizduose, kuriems pataisa yra, vienu patvirtinimu, o lizdą, iš kurio kamera dabar pasileidžia, — paskutinį. Jei lizdui pataisos nėra, puslapis paaiškina kodėl.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Kiekvienas įrašymas pirmiausia išsaugo savo lizdą**: lizdas nuskaitomas dar kartą ir išsaugomas kaip vienas atsisiunčiamas ZIP failas, kurio pavadinime yra laikas, kameros serijos numeris, mikroprograma, lizdas ir įrašymas (pavyzdžiui, `{example}`), o jame — lizdas toks, koks saugomas, jo iššifruotas atvaizdas ir pastaba, kas yra kiekvienas failas. Norėdami grįžti atgal, įrašykite ZIP faile esantį iššifruotą failą mygtuku **Įrašyti iššifruotą atvaizdą**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Įrašymas ištrina vieną 64 KB lizdą ir jį užprogramuoja. Paleidyklė adresu `{address}` ir paleidimo konfigūracija čia niekada neįrašomos, ir nėra jokio valdiklio aktyviam lizdui pasirinkti. Lizdas įsigalioja tik kamerą atjungus ir vėl prijungus.',
} satisfies Translation<'slots', 'lt'>;
