/**
 * Namespace `slots`, magyar (hu), translated from the English source: the firmware-slots tab.
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
  'section.title': 'Firmware-slotok kezelése',
  'section.badge': 'Ír a flash memóriába',
  'section.description':
    'A „Slotok kiolvasása” megkérdezi a kamerától, mit futtat, kiolvassa a három firmware-slotját – {a:acc}, {b:acc} és {r:acc} –, és megmutatja, mit tartalmaz mindegyik. Az olvasás és a kiolvasás semmin sem változtat. Az írási gombok bármely bájt elküldése előtt rákérdeznek.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Ez az oldal írni tud a kamera flash memóriájába.** Egy írás töröl egy 64 KB-os slotot, és beprogramozza. Egy formailag érvényes, de nem futó lemezkép indíthatatlanná teszi a kamerát, a bootloadernek pedig nincs USB-je – csak SWD/J-Link vagy SPI-programozó tudja helyreállítani. Előbb olvassa ki a slotot, és őrizze meg a fájlt.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Slotműveletek',
  'actions.read': 'Slotok kiolvasása',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Slotok',

  /* Before any read. */
  'empty.connected': 'Nyomja meg a „Slotok kiolvasása” gombot.',
  'empty.disconnected': 'Csatlakoztassa a kamerát, majd nyomja meg a „Slotok kiolvasása” gombot.',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Ezt a változatot itt nem támogatja, ezért egyetlen slot sem lett kiolvasva, és egyik sem írható.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Nincs azonosítva: ez az oldal nem tudja megállapítani, milyen változatot futtat a kamera.',
  'refusal.notIdentified.body':
    'A kamera nem adott használható firmware-verziót, ezért egyetlen slot sem lett kiolvasva, és semmi sem lett élesítve. Ez az oldal a {minVersion} és újabb változatokat kezeli. A {minVersion} előtti változatok kívül esnek azon, amit a slotok oldal támogat, így egy ilyet futtató kamerát itt sosem olvas ki.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Ha a kamera támogatott változatot futtat, lehet, hogy még csak most indul. {hint}',
  'refusal.title': 'Elutasítva – semmi sem lett élesítve.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Olvasás…',
  'status.readingAgain': 'A slotok újraolvasása…',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Kiolvasva. {read}/{count} slot kiolvasva.',
    other: 'Kiolvasva. {read}/{count} slot kiolvasva.',
  },
  'status.unsupported': 'Ezen a változaton nem támogatott – egyetlen slot sem lett kiolvasva.',
  'status.refused': 'Elutasítva – semmi sem lett élesítve. Lásd a napló alatti üzenetet.',
  'status.disconnected': 'Az eszköz leválasztva – olvassa ki újra a slotokat.',
  'status.newDevice': 'Új eszköz kiválasztva – olvassa ki újra a slotokat.',
  'status.dumping': 'Kiolvasás: {bank}…',
  'status.dumped': 'Kiolvasva: {bank}.',
  'status.readingImage': 'Lemezkép olvasása…',
  'status.ready': 'Kész – nézze át a tervet, majd írja ki.',
  'status.rejected': 'Elutasítva – lásd a fenti naplót.',
  'status.writing': 'Írás…',
  'status.patching': 'Módosítás: {bank}…',
  'status.patchingEvery': 'Minden slot módosítása…',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Kiírva, de a visszaolvasás nem egyezik – lásd az eredményt.',
  'status.written.verified': 'Kiírva. A slot visszaolvasva megegyezik a kiírttal.',
  'status.written.notCompared': 'Kiírva. A visszaolvasás nem lett összevetve – lásd az eredményt.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Módosítva, de a visszaolvasás nem csak a tervezett módon tér el – lásd az eredményt.',
  'status.patched.ok': 'Módosítva. A slot visszaolvasása a tervnek megfelelő.',
  'status.patched.unchecked':
    'Módosítva. A visszaolvasás nem lett ellenőrizve – lásd az eredményt.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Megállt {bank:ade} – {count} slot módosítva; lásd az eredményt.',
    other: 'Megállt {bank:ade} – {count} slot módosítva; lásd az eredményt.',
  },
  'status.every.unchecked': {
    one: '{count} slot módosítva, de egy visszaolvasás nem lett a tervezett módon ellenőrizve – lásd az eredményt.',
    other:
      '{count} slot módosítva, de egy visszaolvasás nem lett a tervezett módon ellenőrizve – lásd az eredményt.',
  },
  'status.every.ok': {
    one: '{count} slot módosítva. Mindegyik visszaolvasása a tervnek megfelelő.',
    other: '{count} slot módosítva. Mindegyik visszaolvasása a tervnek megfelelő.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Megszakítva – semmi sem íródott.',
  'status.cancelled.one':
    'Megszakítva {bank:nom} véglegesítésének elküldése után – lehet, hogy a slot részben íródott. Mielőtt számítana rá, olvassa ki.',
  'status.cancelled.many':
    'Megszakítva {banks:nom} véglegesítésének elküldése után – lehet, hogy mindegyik részben íródott. Mielőtt számítana rájuk, olvassa ki őket.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Előbb csatlakoztassa a kamerát.',
  'gate.busy': 'Egy másik művelet fut – várja meg, amíg befejeződik.',
  'gate.readFirst': 'Előbb olvassa ki a slotokat.',
  'gate.cameraRefused':
    'Ez a kamera innen nem írható, a fenti sávban olvasható ok miatt. Semmi sem kerül elküldésre.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Nincs kiolvasva: {reason}. Írás előtt olvassa ki újra a slotokat.',
  'gate.notReadNoReason':
    'Nincs kiolvasva: ez a slot nem lett kiolvasva. Írás előtt olvassa ki újra a slotokat.',
  'gate.emptyNotWritable': 'Ez a slot üres, és ezen a változaton nem írható: {reason}',
  'gate.noSuchBank': 'Ebben a változatban nincs ilyen slot.',

  /* The bank table. */
  'table.caption':
    'A kamera minden firmware-slotja – {a:nom}, {b:nom} és {r:nom} – úgy, ahogy a böngésző kiolvasta és ellenőrizte',
  'table.col.bank': 'Slot',
  'table.col.firmware': 'Firmware',
  'table.col.size': 'Méret',
  'table.col.key': 'Kulcs',
  'table.col.bootable': 'Indítható',
  'table.col.sha': 'A titkosítatlan tartalom SHA-256 értéke',
  'table.col.actions': 'Műveletek',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'nincs kiolvasva – {reason}',
  'table.notReadNoReason': 'nincs kiolvasva – a slot nem lett kiolvasva',
  /* A badge: the bank holds no image. */
  'table.empty': 'üres',
  'table.emptyNote':
    'Nincs lemezkép: ennek a slotnak a fejlécablaka csupa 0xFF, így semmi sem fejthető vissza belőle, és az írása nem ír felül firmware-t.',
  /* {reason} is core's. */
  'table.emptyWritable': 'Írható.',
  'table.emptyNotWritable': 'Ezen a változaton nem írható: {reason}',
  'table.unknownVersion': 'ismeretlen verzió',
  /* {id} is the image id in hex. */
  'table.imageId': 'lemezkép: {id}',
  'table.noImage': 'nincs lemezkép',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': '{size} B-os slot',
  'table.imageSize': 'lemezkép: {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'nincs (titkosítatlan)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '– nincs mit indítani',
  'table.boot.bootable': 'indítható – a bootloader elfogadja',
  'table.boot.notBootable': 'nem indítható – indításkor kimarad',
  'table.boot.recoveryOnly':
    'csak helyreállító – {letterR} akkor fut, ha sem {letterA}, sem {letterB} nem tartalmaz semmi olyat, amit a bootloader elfogad (egy kamerán mérve, ennek a lemezképnek egy korábbi formájával); hogy ez a forma elindul-e, nincs kipróbálva',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'ismeretlen – {why}',
  /* The row's buttons. */
  'table.dump': 'Kiolvasás',
  'table.flashPlain': 'Visszafejtett lemezkép írása…',
  'table.flashRaw': 'Nyers bájtok írása…',
  'table.restore': 'Visszaállítás teljes flash-mentésből (.bin vagy .zip)…',
  'table.makeFps': '{hz} FPS beállítása',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Másolás {bank:ill}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: kikapcsolva',
  'table.copyNote':
    'Átmásolja a slotban lévő firmware-t – úgy, ahogy ez az olvasás visszafejtette – a kiválasztott slotba, bármi legyen is most abban. Bármi elküldése előtt átnézheti a tervet.',
  'table.restoreNote':
    'Válasszon egy teljes flash-mentést: egy .bin fájlt (egy teljes 4 MB-os flash-memóriakép, például egy J-Link olvasás) vagy egy ilyet tartalmazó .zip fájlt (megőrzési futtatási fájl, vagy a „4.x/Nano kiolvasása és visszafejtése” vagy a „Minden szelektor kiolvasása” által mentett zip). Ezt a slotot kivágja belőle, visszafejti, és tervként megmutatja, mielőtt bármit elküldene.',
  'table.fpsNote':
    'A bájtjai szerkesztésével {fromHz} Hz-ről {toHz} Hz-re emeli ezt a slotot. A slotot előbb elmenti egy zip letöltésbe, és a benne lévő visszafejtett fájl jelenti a visszautat.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery':
    '{booted}, és helyreállító slot: az írásához külön megerősítés kell.',
  'table.risk.booted': '{booted}: az írásához külön megerősítés kell.',
  'table.risk.recovery': '{bank}: az írásához külön megerősítés kell.',
  'table.risk.bootUnnamed':
    'A kamera nem nevezi meg, melyik slotról indult: az írásához külön megerősítés kell.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Képkockasebesség-módosítás alkalmazva: ez a lemezkép {hz} Hz-en fut.',
  'fps.earlierPatch':
    'Képkockasebesség-módosítás nem érhető el: ez a slot egy korábbi, USB-javítás nélküli {hz} Hz-es módosítást tartalmaz. Állítsa vissza a gyári lemezképet, majd használja a „{hz} FPS beállítása” gombot.',
  'fps.atRate': 'Nincs szükség képkockasebesség-módosításra: ez a változat már {hz} Hz-en fut.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Képkockasebesség-módosítás nem érhető el: {reason}',
  'fps.readFirst':
    'előbb olvassa ki a slotokat – a módosítás a slot saját lemezképe alapján készül',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Minden slot',
  'everyBank.make': '{hz} FPS beállítása minden slotban',
  'everyBank.faster': 'Minden slot gyorsítása',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Egyetlen megerősítéssel módosítja {order:acc}; mindegyiket előbb elmenti egyetlen zip letöltésbe, és visszaolvassa.',
  'everyBank.noteBootedLast':
    'Egyetlen megerősítéssel módosítja {order:acc}, azt a slotot, amelyről a kamera most indul, utoljára; mindegyiket előbb elmenti egyetlen zip letöltésbe, és visszaolvassa.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': '{bank:nom} lemezképe',
  'what.restore': '{bank:nom} a mentésből ({file})',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Előkészítve {bank:all} ({address})',
  'preview.file': 'Fájl',
  'preview.source': 'A lemezkép forrása',
  'preview.target': 'Cél',
  'preview.targetEmpty':
    'Üres {bank:nom}: nincs benne lemezkép, így ez az írás nem ír felül firmware-t',
  'preview.readAs': 'Olvasás módja',
  'preview.readAs.ff': 'visszafejtett {version} FF lemezkép',
  'preview.readAs.plain': 'visszafejtett lemezkép',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'nyers bájtok',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Előkészítés',
  'preview.key': 'Kulcs',
  'preview.payload': 'Adatcsomag',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} B, {count} darabban, darabonként legfeljebb {chunk} B',
    other: '{size} B, {count} darabban, darabonként legfeljebb {chunk} B',
  },
  'preview.checksum': 'Átviteli ellenőrzőösszeg',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Tárolva utána',
  'preview.storedNotPredicted': 'nincs megjósolva – a visszaolvasás az ellenőrzés',
  'preview.storedPredicted': '{size} B megjósolva',
  'preview.storedKeyB': '{size} B megjósolva – a lemezkép XOR B-kulcs, nem maga az adatcsomag',
  'preview.savedFirst': 'Előbb elmentve',
  'preview.compareCaption': 'Mi változik {bank:ine}',
  'preview.col.field': 'Mező',
  'preview.col.now': 'Most',
  'preview.col.after': 'Az írás után',
  'preview.readFirst': 'Írás előtt olvassa el:',
  /* {note} is core's note about this write. */
  'preview.note': 'Megjegyzés: {note}',
  'preview.nothingSent':
    'Még semmi sem került elküldésre a kamerának. Az írás ezt az adatcsomagot {bank:ill} továbbítja, és véglegesíti.',
  'preview.toolbar': 'Írási műveletek – {bank}',
  'preview.write': 'Írás {bank:ill}…',
  'preview.discard': 'Elvetés',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Kiírja {bank:ill} ({address}) ezt: {what}?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Az írása lecseréli azt a firmware-t, amelyet a kamera most futtat. Ha az új lemezkép nem fut, lehet, hogy a kamera egyáltalán nem indul el.',
  'writeConfirm.recovery':
    'Ez az utolsó tartalék másolat ({bank}), amelyre a bootloader visszaáll. Az írása után a kamera addig e másolat nélkül marad, amíg vissza nem állítja.',
  'writeConfirm.bootUnnamed':
    'A kamera nem mondja meg, melyik slotról indul, ezért {bank:acc} kell a most futó slotnak tekinteni. Az írása lecserélheti azt a firmware-t, amelyet a kamera futtat.',
  'writeConfirm.empty': 'Üres {bank:nom}: nincs benne lemezkép, így nem ír felül firmware-t.',
  'writeConfirm.eraseEmpty':
    'Az írás ettől még törli a kamera flash memóriájának {bank:nom} helyén lévő 64 KB-os blokkját (amely már üres), és beprogramozza.',
  'writeConfirm.erase':
    'Ez törli a kamera flash memóriájának egy 64 KB-os blokkját {bank:nom} helyén, és beprogramozza.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'A lemezkép ezzel a kulccsal íródik: {key}. Minden más slot ugyanígy íródik.',
  'writeConfirm.backup':
    'Mielőtt bármi elküldésre kerülne, újra kiolvassa {bank:acc}, és egyetlen zip letöltésként menti: {file}. Keresse a letöltések mappájában.',
  'writeConfirm.noReset':
    'Nem küld újraindítást. Utána húzza ki és dugja vissza a kamerát, hogy a slot érvénybe lépjen.',
  'writeConfirm.noUsbRecovery':
    'Ha a lemezkép nem fut, a kamera USB-n keresztül nem állítható helyre – csak SWD/J-Linkkel vagy SPI-programozóval.',
  'writeConfirm.ackUnnamed':
    'Tudomásul veszem, hogy a kamera nem mondja meg, melyik slotról indul, ezért ezt kell a most futónak tekinteni, és hogy egy hibás lemezkép indíthatatlanná teheti a kamerát.',
  'writeConfirm.confirm': 'Igen – írás {bank:ill}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Tudomásul veszem, hogy a kamera most erről a slotról indul, és hogy egy hibás lemezkép indíthatatlanná teheti a kamerát.',
  'ack.recovery':
    'Tudomásul veszem, hogy ez a helyreállító slot, és hogy egy hibás lemezkép után a kamera utolsó tartalék másolat nélkül marad.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Átállítja {bank:acc} {hz} FPS-re?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted': '{bootsNow}. A módosított lemezkép lecseréli a most futó firmware-t.',
  'fpsConfirm.recovery': 'Ez az utolsó tartalék másolat ({bank}), amelyre a bootloader visszaáll.',
  'fpsConfirm.what':
    'Jelenleg {bank:ine} {version} firmware van, és ez a módosítás a lemezképét {fromHz} Hz helyett {toHz} Hz-en futtatja.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(ismeretlen)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'A módosítás a lemezkép {count} bájtját és az elfogadási összeg szavát változtatja meg, így a bootloader által ellenőrzött összeg megmarad. A kulcspárhoz nem nyúl.',
    other:
      'A módosítás a lemezkép {count} bájtját és az elfogadási összeg szavát változtatja meg, így a bootloader által ellenőrzött összeg megmarad. A kulcspárhoz nem nyúl.',
  },
  'fpsConfirm.wayBack':
    'Abban a zipben a visszafejtett fájl jelenti a visszautat: a módosítás visszavonásához írja ki a „Visszafejtett lemezkép írása” gombbal {bank:ill}.',
  'fpsConfirm.noReset':
    'Nem küld újraindítást. Utána húzza ki és dugja vissza a kamerát, hogy a módosított slot érvénybe lépjen.',
  'fpsConfirm.ackUnnamed':
    'Tudomásul veszem, hogy a kamera nem mondja meg, melyik slotról indul, ezért ezt kell a most futónak tekinteni.',
  'fpsConfirm.confirm': 'Igen – {bank:nom} módosítása',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Minden slotot {hz} FPS-re állít?',
  'fpsEvery.titleMixed': {
    one: '{count} slot képkockasebességét módosítja?',
    other: '{count} slot képkockasebességét módosítja?',
  },
  'fpsEvery.intro': {
    one: 'Ez {count} slotot módosít, ahol a módosítás elérhető (firmware: {version}):',
    other: 'Ez {count} slotot módosít, ahol a módosítás elérhető (firmware: {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery': '{bank} (erről indul most a kamera, és ez a helyreállító slot)',
  'fpsEvery.role.booted': '{bank} (erről indul most a kamera)',
  'fpsEvery.role.recovery': '{bank} (a helyreállító slot, az utolsó tartalék másolat)',
  'fpsEvery.role.bootUnnamed': '{bank} (a kamera nem mondja meg, melyik slotról indul)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: {fromHz} Hz-ről {toHz} Hz-re, {count} bájt és az elfogadási összeg szava.',
    other: '{bank}: {fromHz} Hz-ről {toHz} Hz-re, {count} bájt és az elfogadási összeg szava.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Változatlanul marad: {others}',
  'fpsEvery.orderOne': 'Csak {bank:acc} írja, és visszaolvassa.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Ebben a sorrendben írja őket: {order}. Mindegyiket visszaolvassa a következő előtt, és az első hiba leállítja a többit.',
  'fpsEvery.orderBootedLast':
    'Ebben a sorrendben írja őket: {order}. A most futó slot az utolsó, így egy hiba még előtte leállítja. Mindegyiket visszaolvassa a következő előtt, és az első hiba leállítja a többit.',
  'fpsEvery.wayBack':
    'Abban a zipben a visszafejtett fájlok jelentik a visszautat: egy slot módosításának visszavonásához írja ki annak fájlját a „Visszafejtett lemezkép írása” gombbal abba a slotba.',
  'fpsEvery.noReset':
    'Nem küld újraindítást. Utána húzza ki és dugja vissza a kamerát, hogy a módosított slotok érvénybe lépjenek.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Tudomásul veszem, hogy ez a következőket írja: {banks}, és hogy egy hibás lemezkép indíthatatlanná teheti a kamerát.',
  'fpsEvery.confirm': {
    one: 'Igen – {count} slot módosítása',
    other: 'Igen – {count} slot módosítása',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} – {what}: a slot visszaolvasva megegyezik a kiírttal.',
  'outcome.mismatch': '{bank} – {what}: a visszaolvasás NEM egyezik a kiírttal.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} – {what}: a visszaolvasás megtörtént, de nem lett összevetve, így ez az írás itt nincs ellenőrizve.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'A kamera véglegesítése ezt az állapotot adta vissza: {status}.',
  'outcome.wasEmpty': 'Ez előtt az írás előtt {bank:nom} üres volt, így nem írt felül firmware-t.',
  'outcome.provenVerified':
    'Eddig bizonyított: az adatcsomag továbbítva és véglegesítve, a slot visszaolvasva megegyezik a kiírttal. NEM bizonyított: hogy a bootloader ezt a slotot választja, vagy hogy a lemezkép fut.',
  'outcome.provenCommitted':
    'Eddig bizonyított: az adatcsomag továbbítva és véglegesítve. NEM bizonyított: hogy a bootloader ezt a slotot választja, vagy hogy a lemezkép fut.',
  'outcome.replug':
    '**MOST HÚZZA KI ÉS DUGJA VISSZA A KAMERÁT.** Nem ment újraindítás, így a slot csak egy valódi ki- és bekapcsolás után lép érvénybe. Utána olvassa ki újra a slotokat: csak a kamera által jelentett verzió és aktív slot dönti el.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**MOST HÚZZA KI ÉS DUGJA VISSZA A KAMERÁT.** Nem ment újraindítás. Utána olvassa ki újra a slotokat.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Előbb elmentve, letöltésként: {file}.',
  'outcome.wayBackOne':
    'A benne lévő visszafejtett fájl jelenti a visszautat („Visszafejtett lemezkép írása” ugyanabba a slotba).',
  'outcome.wayBackMany':
    'A benne lévő visszafejtett fájlok jelentik a visszautat („Visszafejtett lemezkép írása” mindegyik slotba).',
  'outcome.checkDownloads': 'Keresse a letöltések mappájában.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank} – módosítva {fromHz} Hz-ről {toHz} Hz-re (firmware: {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'A visszaolvasás csak a tervezett {count} bájtnál, a módosítási helyeken és az összegszónál tér el az elmentett memóriaképtől.',
    other:
      'A visszaolvasás csak a tervezett {count} bájtnál, a módosítási helyeken és az összegszónál tér el az elmentett memóriaképtől.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'A visszaolvasás NEM csak a tervezett módon tér el: {unexpected} váratlan és {count} hiányzó bájt.',
    other:
      'A visszaolvasás NEM csak a tervezett módon tér el: {unexpected} váratlan és {count} hiányzó bájt.',
  },
  'fpsOutcome.notTaken': 'A visszaolvasás nem történt meg, így a módosítás itt nincs ellenőrizve.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Minden slot: {done}/{count} módosítva, ebben a sorrendben: {order}.',
    other: 'Minden slot: {done}/{count} módosítva, ebben a sorrendben: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'A visszaolvasás csak a tervezett {count} bájtnál tér el az elmentett slottól.',
    other: 'A visszaolvasás csak a tervezett {count} bájtnál tér el az elmentett slottól.',
  },
  'fpsEveryOutcome.notTaken': 'A visszaolvasás nem történt meg.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Leállt: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Nem íródott: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'A kamera egyetlen slotja sem írható innen.',
  'keys.title': 'Az írások kulcsai',
  'keys.chain': 'Lánc',
  'keys.chainPlain':
    'a 2014-es titkosítatlan lánc: minden slot titkosítatlanul van tárolva, így egyikben sincs kulcs',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Írás módja',
  'keys.writtenPlain': 'a lemezkép úgy, ahogy van, kulcs nélkül, bármely slotba',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Előkészítés módja',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Tárolás módja',
  'keys.refused': 'Elutasítva',
  'keys.bootedBank': 'Indító slot',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank}: {key:nom} van benne',
  'keys.theBootedBank': 'az indító slot',
  'keys.unnamedKey': 'egy kulcs, amelyet az oldal nem tud megnevezni',
  'keys.bootedBanksKey': 'az indító slot kulcsa',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; minden slot ugyanígy íródik',

  /* "What these buttons do", below the tab. */
  'how.title': 'Mit csinálnak ezek a gombok',
  'how.read': 'A **Slotok kiolvasása** és a **Kiolvasás** semmin sem változtat a kamerában.',
  'how.flash':
    'A **Visszafejtett lemezkép írása** titkosítatlan lemezképet vesz, az előkészítés előtt úgy titkosítja, ahogy az adott slot firmware-e megkívánja, és megmutatja a tervet. A **Nyers bájtok írása** a fájlt pontosan úgy készíti elő, ahogy megadták. Egyik sem küld semmit, amíg meg nem erősíti.',
  'how.ff':
    'Az {letterR}-slot írásához ugyanúgy külön megerősítés kell, mint bármely helyreállító írásnál. Az **üres** slot (fejlécablaka csupa 0xFF, ahogy sok 2014-es kamerán {b:nom} is) állapot, nem hiba. Pontosan úgy íródik, mint bármely más slot.',
  'how.copy':
    'A **Visszaállítás teljes flash-mentésből** egy .bin fájlt (egy teljes 4 MB-os flash-memóriakép, például egy J-Link olvasás) vagy egy ilyet tartalmazó .zip fájlt (megőrzési futtatási fájl, vagy a „4.x/Nano kiolvasása és visszafejtése” vagy a „Minden szelektor kiolvasása” által mentett zip) fogad, kivágja belőle ezt a slotot, visszafejti, és megmutatja a tervet; ha a mentés egy másik kameráénak vagy más firmware-nek tűnik, a terv ezt jelzi.',
  'how.fps':
    'Egy slot sorában az **N FPS beállítása** nagyobb képkockasebességre szerkeszti a slot lemezképét, az **N FPS beállítása minden slotban** pedig minden olyan slotra elvégzi, ahol a módosítás elérhető, egyetlen megerősítéssel, a most futó slotot utoljára. Ahol nem érhető el, az oldal megmondja, miért.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Minden írás előbb elmenti a slotját**: a slotot újra kiolvassa, és egyetlen zip letöltésként menti, amelynek neve tartalmazza az időt, a kamera sorozatszámát, a firmware-t, a slotot és az írást (például `{example}`), benne pedig ott van a slot tárolt formában, a visszafejtett lemezképe és egy feljegyzés arról, melyik fájl mi. A visszalépéshez írja ki a zip visszafejtett fájlját a **Visszafejtett lemezkép írása** gombbal.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Egy írás töröl egy 64 KB-os slotot, és beprogramozza. A `{address}` címen lévő bootloadert és az indítási konfigurációt itt soha nem írja, és nincs olyan vezérlő, amellyel az aktív slot kiválasztható. A slot csak azután lép érvénybe, hogy a kamerát kihúzta és visszadugta.',
} satisfies Translation<'slots', 'hu'>;
