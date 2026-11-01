/**
 * Namespace `slots`, čeština (cs), translated from the English source: the firmware-slots tab.
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
  'section.title': 'Práce se sloty firmwaru',
  'section.badge': 'Zapisuje do paměti flash',
  'section.description':
    '„Přečíst sloty“ se zeptá kamery, co v ní běží, přečte její tři sloty firmwaru — {a}, {b} a {r} — a ukáže, co který obsahuje. Čtení a vyčítání nic nemění. Tlačítko zápisu se zeptá dřív, než se odešle jakýkoli bajt.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Tato stránka umí zapisovat do paměti flash kamery.** Zápis smaže jeden slot o velikosti 64 KB a naprogramuje ho. Obraz, který je strukturou platný, ale nepoběží, zanechá kameru v nespustitelném stavu, a bootloader nemá USB — obnovit ji lze jen přes SWD/J-Link nebo programátorem SPI. Nejdřív slot vyčtěte a soubor si ponechte.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Akce slotů',
  'actions.read': 'Přečíst sloty',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Sloty',

  /* Before any read. */
  'empty.connected': 'Stiskněte „Přečíst sloty“.',
  'empty.disconnected': 'Připojte kameru a potom stiskněte „Přečíst sloty“.',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Toto sestavení zde není podporováno, takže se nepřečetl žádný slot a žádný nelze zapsat.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Neidentifikováno: tato stránka nedokáže zjistit, které sestavení v kameře běží.',
  'refusal.notIdentified.body':
    'Kamera nevrátila použitelnou verzi firmwaru, takže se nepřečetl žádný slot a nic nebylo aktivováno. Tato stránka pokrývá sestavení {minVersion} a novější. Sestavení starší než {minVersion} jsou mimo to, co stránka slotů podporuje, takže se kamera s některým z nich zde nikdy nečte.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Pokud v kameře běží podporované sestavení, možná teprve startuje. {hint}',
  'refusal.title': 'Odmítnuto — nic nebylo aktivováno.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Čtení ...',
  'status.readingAgain': 'Sloty se čtou znovu ...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Přečteno. Přečtené sloty: {read}/{count}.',
    few: 'Přečteno. Přečtené sloty: {read}/{count}.',
    many: 'Přečteno. Přečtené sloty: {read}/{count}.',
    other: 'Přečteno. Přečtené sloty: {read}/{count}.',
  },
  'status.unsupported': 'Na tomto sestavení není podporováno — nepřečetl se žádný slot.',
  'status.refused': 'Odmítnuto — nic nebylo aktivováno. Viz zpráva pod protokolem.',
  'status.disconnected': 'Zařízení odpojeno — přečtěte sloty znovu.',
  'status.newDevice': 'Vybráno nové zařízení — přečtěte sloty znovu.',
  'status.dumping': 'Vyčítá se {bank} ...',
  'status.dumped': 'Vyčteno: {bank}.',
  'status.readingImage': 'Čtení obrazu ...',
  'status.ready': 'Připraveno — prohlédněte si plán a potom ho zapište.',
  'status.rejected': 'Odmítnuto — viz protokol výše.',
  'status.writing': 'Zápis ...',
  'status.patching': 'Záplatuje se {bank} ...',
  'status.patchingEvery': 'Záplatují se všechny sloty ...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Zapsáno, ale kontrolní čtení neodpovídá — viz výsledek.',
  'status.written.verified': 'Zapsáno. Slot se čte tak, jak byl zapsán.',
  'status.written.notCompared': 'Zapsáno. Kontrolní čtení se neporovnávalo — viz výsledek.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Záplatováno, ale kontrolní čtení se neliší jen podle plánu — viz výsledek.',
  'status.patched.ok': 'Záplatováno. Slot se čte podle plánu.',
  'status.patched.unchecked': 'Záplatováno. Kontrolní čtení se nekontrolovalo — viz výsledek.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Zastaveno u {bank:gen} — záplatován {count} slot; viz výsledek.',
    few: 'Zastaveno u {bank:gen} — záplatovány {count} sloty; viz výsledek.',
    many: 'Zastaveno u {bank:gen} — záplatováno {count} slotu; viz výsledek.',
    other: 'Zastaveno u {bank:gen} — záplatováno {count} slotů; viz výsledek.',
  },
  'status.every.unchecked': {
    one: 'Záplatován {count} slot, ale kontrolní čtení se neověřilo podle plánu — viz výsledek.',
    few: 'Záplatovány {count} sloty, ale jedno kontrolní čtení se neověřilo podle plánu — viz výsledek.',
    many: 'Záplatováno {count} slotu, ale jedno kontrolní čtení se neověřilo podle plánu — viz výsledek.',
    other:
      'Záplatováno {count} slotů, ale jedno kontrolní čtení se neověřilo podle plánu — viz výsledek.',
  },
  'status.every.ok': {
    one: 'Záplatován {count} slot. Čte se podle plánu.',
    few: 'Záplatovány {count} sloty. Každý se čte podle plánu.',
    many: 'Záplatováno {count} slotu. Každý se čte podle plánu.',
    other: 'Záplatováno {count} slotů. Každý se čte podle plánu.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Zrušeno — nic se nezapsalo.',
  'status.cancelled.one':
    'Zrušeno po odeslání potvrzení zápisu do {bank:gen} — slot může být zapsán jen zčásti. Než se na něj spolehnete, přečtěte ho.',
  'status.cancelled.many':
    'Zrušeno po odeslání potvrzení zápisů do {banks:gen} — každý může být zapsán jen zčásti. Než se na ně spolehnete, přečtěte je.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Nejdřív připojte kameru.',
  'gate.busy': 'Běží jiná operace — počkejte, až skončí.',
  'gate.readFirst': 'Nejdřív přečtěte sloty.',
  'gate.cameraRefused':
    'Do této kamery odsud nelze zapisovat, z důvodu uvedeného v pruhu výše. Nic se neodesílá.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Nepřečteno: {reason}. Než do slotu zapíšete, přečtěte sloty znovu.',
  'gate.notReadNoReason':
    'Nepřečteno: tento slot nebyl přečten. Než do něj zapíšete, přečtěte sloty znovu.',
  'gate.emptyNotWritable':
    'Tento slot je prázdný a na tomto sestavení do něj nelze zapsat: {reason}',
  'gate.noSuchBank': 'Toto sestavení takový slot nemá.',

  /* The bank table. */
  'table.caption':
    'Každý slot firmwaru této kamery — {a}, {b} a {r} — tak, jak byl přečten a zkontrolován v prohlížeči',
  'table.col.bank': 'Slot',
  'table.col.firmware': 'Firmware',
  'table.col.size': 'Velikost',
  'table.col.key': 'Klíč',
  'table.col.bootable': 'Spustitelný',
  'table.col.sha': 'SHA-256 otevřeného textu',
  'table.col.actions': 'Akce',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'nepřečteno — {reason}',
  'table.notReadNoReason': 'nepřečteno — slot nebyl přečten',
  /* A badge: the bank holds no image. */
  'table.empty': 'prázdný',
  'table.emptyNote':
    'Žádný obraz: okno hlavičky tohoto slotu se čte jako samé 0xFF, takže se z něj nic nedešifruje a zápis do něj nepřepíše žádný firmware.',
  /* {reason} is core's. */
  'table.emptyWritable': 'Lze zapsat.',
  'table.emptyNotWritable': 'Na tomto sestavení nelze zapsat: {reason}',
  'table.unknownVersion': 'neznámá verze',
  /* {id} is the image id in hex. */
  'table.imageId': 'obraz {id}',
  'table.noImage': 'žádný obraz',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'slot {size} B',
  'table.imageSize': 'obraz {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'žádný (otevřený text)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— nic ke spuštění',
  'table.boot.bootable': 'spustitelný — bootloader ho přijme',
  'table.boot.notBootable': 'nespustitelný — při startu se přeskočí',
  'table.boot.recoveryOnly':
    'jen pro obnovu — {letterR} se spustí, když {letterA} ani {letterB} neobsahují nic, co bootloader přijme (změřeno na kameře pro dřívější podobu tohoto obrazu); zda se spustí tato podoba, není vyzkoušeno',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'neznámé — {why}',
  /* The row's buttons. */
  'table.dump': 'Vyčíst',
  'table.flashPlain': 'Zapsat dešifrovaný obraz…',
  'table.flashRaw': 'Zapsat surové bajty…',
  'table.restore': 'Obnovit z úplné zálohy paměti flash (.bin nebo .zip)…',
  'table.makeFps': 'Nastavit {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Kopírovat do {bank:gen}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: vypnuto',
  'table.copyNote':
    'Zkopíruje firmware, který tento slot obsahuje, tak jak ho toto čtení dešifrovalo, do slotu, který vyberete, ať v něm je cokoli. Plán si prohlédnete dřív, než se cokoli odešle.',
  'table.restoreNote':
    'Vyberte úplnou zálohu paměti flash: soubor .bin (celý obraz paměti flash o velikosti 4 MB, například čtení přes J-Link) nebo .zip, který ho obsahuje (soubor běhu z karty 0.x/1.x, nebo zip, který uloží „Výpis a dešifrování 4.x/Nano“ či „Vyčíst všechny selektory“). Tento slot se z ní vyřízne, dešifruje a zobrazí jako plán dřív, než se cokoli odešle.',
  'table.fpsNote':
    'Zvýší snímkovou frekvenci tohoto slotu z {fromHz} Hz na {toHz} Hz úpravou jeho bajtů. Slot se nejdřív uloží do staženého souboru zip a dešifrovaný soubor v něm je cesta zpět.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery':
    '{booted} a zároveň slot pro obnovu: zápis do něj vyžaduje další potvrzení.',
  'table.risk.booted': '{booted}: zápis do něj vyžaduje další potvrzení.',
  'table.risk.recovery': '{bank}: zápis do něj vyžaduje další potvrzení.',
  'table.risk.bootUnnamed':
    'Kamera neuvádí svůj spuštěný slot: zápis do něj vyžaduje další potvrzení.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Záplata snímkové frekvence použita: tento obraz běží na {hz} Hz.',
  'fps.earlierPatch':
    'Záplata snímkové frekvence se nenabízí: tento slot obsahuje dřívější záplatu {hz} Hz bez opravy USB. Obnovte původní obraz a potom použijte „Nastavit {hz} FPS“.',
  'fps.atRate': 'Záplata snímkové frekvence není potřeba: toto sestavení už běží na {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Záplata snímkové frekvence se nenabízí: {reason}',
  'fps.readFirst': 'nejdřív přečtěte sloty — záplata se plánuje z vlastního obrazu slotu',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Všechny sloty',
  'everyBank.make': 'Nastavit {hz} FPS ve všech slotech',
  'everyBank.faster': 'Zrychlit všechny sloty',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Záplatuje {order:acc} v jednom potvrzení; každý se nejdřív uloží do jednoho staženého souboru zip a pak se zkontroluje čtením.',
  'everyBank.noteBootedLast':
    'Záplatuje {order:acc} v jednom potvrzení, slot, ze kterého kamera teď startuje, jako poslední; každý se nejdřív uloží do jednoho staženého souboru zip a pak se zkontroluje čtením.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': 'obraz {bank:gen}',
  'what.restore': '{bank:acc} ze souboru {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Připraveno pro {bank:acc} na adrese {address}',
  'preview.file': 'Soubor',
  'preview.source': 'Obraz převzat z',
  'preview.target': 'Cíl',
  'preview.targetEmpty':
    '{bank} je prázdný: neobsahuje žádný obraz, takže tento zápis nepřepíše žádný firmware',
  'preview.readAs': 'Čteno jako',
  'preview.readAs.ff': 'dešifrovaný obraz {version} FF',
  'preview.readAs.plain': 'dešifrovaný obraz',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'surové bajty',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Předání',
  'preview.key': 'Klíč',
  'preview.payload': 'Data',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} B, {count} blok po nejvýš {chunk} B',
    few: '{size} B, {count} bloky po nejvýš {chunk} B',
    many: '{size} B, {count} bloku po nejvýš {chunk} B',
    other: '{size} B, {count} bloků po nejvýš {chunk} B',
  },
  'preview.checksum': 'Kontrolní součet přenosu',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Uloženo po zápisu',
  'preview.storedNotPredicted': 'nepředpovídá se — ověří to kontrolní čtení',
  'preview.storedPredicted': '{size} B (předpověď)',
  'preview.storedKeyB': '{size} B (předpověď) — obraz XOR klíč B, ne samotná data',
  'preview.savedFirst': 'Nejdřív uloženo',
  'preview.compareCaption': 'Co se změní ve {bank:loc}',
  'preview.col.field': 'Pole',
  'preview.col.now': 'Teď',
  'preview.col.after': 'Po zápisu',
  'preview.readFirst': 'Přečtěte si před zápisem:',
  /* {note} is core's note about this write. */
  'preview.note': 'Poznámka: {note}',
  'preview.nothingSent':
    'Do kamery se zatím nic neodeslalo. Zápis pošle tato data do {bank:gen} a potvrdí je.',
  'preview.toolbar': 'Akce zápisu pro {bank:acc}',
  'preview.write': 'Zapsat do {bank:gen}…',
  'preview.discard': 'Zahodit',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Zapsat {what} do {bank:gen} na adrese {address}?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Zápis nahradí firmware, který v kameře teď běží. Pokud nový obraz nepoběží, kamera nemusí vůbec nastartovat.',
  'writeConfirm.recovery':
    '{bank} je slot pro obnovu, poslední záložní kopie, ke které se bootloader vrací. Zápis do něj nechá kameru bez této kopie, dokud ji neobnovíte.',
  'writeConfirm.bootUnnamed':
    'Kamera neuvádí, ze kterého slotu startuje, takže se {bank:nom} bere jako slot, ze kterého teď startuje. Zápis do něj může nahradit firmware, který v kameře běží.',
  'writeConfirm.empty':
    '{bank} je prázdný: neobsahuje žádný obraz, takže se žádný firmware nepřepíše.',
  'writeConfirm.eraseEmpty':
    'Zápis přesto smaže blok paměti flash kamery o velikosti 64 KB ve {bank:loc} (už prázdný) a naprogramuje ho.',
  'writeConfirm.erase':
    'Tím se smaže blok paměti flash kamery o velikosti 64 KB a naprogramuje se ve {bank:loc}.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'Obraz se zapíše s tímto klíčem: {key}. Každý jiný slot se zapisuje stejně.',
  'writeConfirm.backup':
    'Než se cokoli odešle, {bank:nom} se znovu přečte a uloží jako jeden stažený soubor zip: {file}. Najdete ho ve složce se staženými soubory.',
  'writeConfirm.noReset':
    'Neposílá se žádný reset. Aby se slot projevil, kameru potom odpojte a znovu připojte.',
  'writeConfirm.noUsbRecovery':
    'Pokud obraz nepoběží, kameru nelze obnovit přes USB — jen přes SWD/J-Link nebo programátorem SPI.',
  'writeConfirm.ackUnnamed':
    'Rozumím, že kamera neuvádí, ze kterého slotu startuje, takže se tento slot bere jako spuštěný, a že vadný obraz může kameru zanechat v nespustitelném stavu.',
  'writeConfirm.confirm': 'Ano — zapsat do {bank:gen}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Rozumím, že z tohoto slotu kamera teď startuje a že vadný obraz může kameru zanechat v nespustitelném stavu.',
  'ack.recovery':
    'Rozumím, že toto je slot pro obnovu a že vadný obraz zanechá kameru bez poslední záložní kopie.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Nastavit {hz} FPS ve {bank:loc}?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted': '{bootsNow}. Záplatovaný obraz nahradí firmware, který teď běží.',
  'fpsConfirm.recovery':
    '{bank} je slot pro obnovu, poslední záložní kopie, ke které se bootloader vrací.',
  'fpsConfirm.what':
    '{bank} obsahuje firmware {version} a tato úprava nechá jeho obraz běžet na {toHz} Hz místo {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(neznámý)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'Záplata změní {count} bajt obrazu a slovo kontrolního součtu, takže součet, který bootloader kontroluje, zůstane zachován. Dvojice klíčů se nemění.',
    few: 'Záplata změní {count} bajty obrazu a slovo kontrolního součtu, takže součet, který bootloader kontroluje, zůstane zachován. Dvojice klíčů se nemění.',
    many: 'Záplata změní {count} bajtu obrazu a slovo kontrolního součtu, takže součet, který bootloader kontroluje, zůstane zachován. Dvojice klíčů se nemění.',
    other:
      'Záplata změní {count} bajtů obrazu a slovo kontrolního součtu, takže součet, který bootloader kontroluje, zůstane zachován. Dvojice klíčů se nemění.',
  },
  'fpsConfirm.wayBack':
    'Dešifrovaný soubor v tom zipu je cesta zpět: chcete-li záplatu vrátit, zapište ho tlačítkem „Zapsat dešifrovaný obraz“ u {bank:gen}.',
  'fpsConfirm.noReset':
    'Neposílá se žádný reset. Aby se záplatovaný slot projevil, kameru potom odpojte a znovu připojte.',
  'fpsConfirm.ackUnnamed':
    'Rozumím, že kamera neuvádí, ze kterého slotu startuje, takže se tento slot bere jako spuštěný.',
  'fpsConfirm.confirm': 'Ano — záplatovat {bank:acc}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Nastavit {hz} FPS ve všech slotech?',
  'fpsEvery.titleMixed': {
    one: 'Záplatovat snímkovou frekvenci {count} slotu?',
    few: 'Záplatovat snímkovou frekvenci {count} slotů?',
    many: 'Záplatovat snímkovou frekvenci {count} slotu?',
    other: 'Záplatovat snímkovou frekvenci {count} slotů?',
  },
  'fpsEvery.intro': {
    one: 'Tato akce záplatuje {count} slot tam, kde je záplata k dispozici (firmware {version}):',
    few: 'Tato akce záplatuje {count} sloty tam, kde je záplata k dispozici (firmware {version}):',
    many: 'Tato akce záplatuje {count} slotu tam, kde je záplata k dispozici (firmware {version}):',
    other:
      'Tato akce záplatuje {count} slotů tam, kde je záplata k dispozici (firmware {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (slot, ze kterého kamera teď startuje, a zároveň slot pro obnovu)',
  'fpsEvery.role.booted': '{bank} (slot, ze kterého kamera teď startuje)',
  'fpsEvery.role.recovery': '{bank} (slot pro obnovu, poslední záložní kopie)',
  'fpsEvery.role.bootUnnamed': '{bank} (kamera neuvádí, ze kterého slotu startuje)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: z {fromHz} Hz na {toHz} Hz, {count} bajt a slovo kontrolního součtu.',
    few: '{bank}: z {fromHz} Hz na {toHz} Hz, {count} bajty a slovo kontrolního součtu.',
    many: '{bank}: z {fromHz} Hz na {toHz} Hz, {count} bajtu a slovo kontrolního součtu.',
    other: '{bank}: z {fromHz} Hz na {toHz} Hz, {count} bajtů a slovo kontrolního součtu.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Beze změny zůstanou: {others}',
  'fpsEvery.orderOne': 'Zapíše jen {bank:acc} a zkontroluje ho čtením.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Zapisují se v tomto pořadí: {order}. Každý se před dalším zkontroluje čtením a první selhání zastaví zbytek.',
  'fpsEvery.orderBootedLast':
    'Zapisují se v tomto pořadí: {order}. Slot, ze kterého kamera teď startuje, jde poslední, takže se při selhání skončí před ním. Každý se před dalším zkontroluje čtením a první selhání zastaví zbytek.',
  'fpsEvery.wayBack':
    'Dešifrované soubory v tom zipu jsou cesta zpět: chcete-li záplatu slotu vrátit, zapište jeho soubor tlačítkem „Zapsat dešifrovaný obraz“ u toho slotu.',
  'fpsEvery.noReset':
    'Neposílá se žádný reset. Aby se záplatované sloty projevily, kameru potom odpojte a znovu připojte.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Rozumím, že tato akce zapíše {banks} a že vadný obraz může kameru zanechat v nespustitelném stavu.',
  'fpsEvery.confirm': {
    one: 'Ano — záplatovat {count} slot',
    few: 'Ano — záplatovat {count} sloty',
    many: 'Ano — záplatovat {count} slotu',
    other: 'Ano — záplatovat {count} slotů',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: slot se čte tak, jak byl zapsán.',
  'outcome.mismatch': '{bank} — {what}: kontrolní čtení NEODPOVÍDÁ tomu, co bylo zapsáno.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: kontrolní čtení proběhlo, ale neporovnávalo se, takže tento zápis zde není ověřen.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'Potvrzení zápisu v kameře vrátilo stav {status}.',
  'outcome.wasEmpty': '{bank} byl před tímto zápisem prázdný, takže se nepřepsal žádný firmware.',
  'outcome.provenVerified':
    'Zatím prokázáno: data byla odeslána, zápis potvrzen a slot se čte tak, jak byl zapsán. NEPROKÁZÁNO: že bootloader tento slot vybere ani že obraz poběží.',
  'outcome.provenCommitted':
    'Zatím prokázáno: data byla odeslána a zápis potvrzen. NEPROKÁZÁNO: že bootloader tento slot vybere ani že obraz poběží.',
  'outcome.replug':
    '**TEĎ KAMERU ODPOJTE A ZNOVU PŘIPOJTE.** Nebyl odeslán žádný reset, takže se slot projeví až po skutečném vypnutí a zapnutí. Potom sloty přečtěte znovu: rozhodne jen verze a aktivní slot, které kamera nahlásí.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**TEĎ KAMERU ODPOJTE A ZNOVU PŘIPOJTE.** Nebyl odeslán žádný reset. Potom sloty přečtěte znovu.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Nejdřív uloženo jako stažený soubor: {file}.',
  'outcome.wayBackOne':
    'Dešifrovaný soubor v něm je cesta zpět („Zapsat dešifrovaný obraz“ u stejného slotu).',
  'outcome.wayBackMany':
    'Dešifrované soubory v něm jsou cesta zpět („Zapsat dešifrovaný obraz“ u každého slotu).',
  'outcome.checkDownloads': 'Najdete ho ve složce se staženými soubory.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank} — záplatováno z {fromHz} Hz na {toHz} Hz (firmware {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'Kontrolní čtení se od uloženého výpisu liší jen v plánovaném bajtu ({count}), místech úprav a slově součtu.',
    few: 'Kontrolní čtení se od uloženého výpisu liší jen v plánovaných bajtech ({count}), místech úprav a slově součtu.',
    many: 'Kontrolní čtení se od uloženého výpisu liší jen v plánovaných bajtech ({count}), místech úprav a slově součtu.',
    other:
      'Kontrolní čtení se od uloženého výpisu liší jen v plánovaných bajtech ({count}), místech úprav a slově součtu.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'Kontrolní čtení se NELIŠÍ jen podle plánu: neočekávané bajty: {unexpected}, chybějící bajty: {count}.',
    few: 'Kontrolní čtení se NELIŠÍ jen podle plánu: neočekávané bajty: {unexpected}, chybějící bajty: {count}.',
    many: 'Kontrolní čtení se NELIŠÍ jen podle plánu: neočekávané bajty: {unexpected}, chybějící bajty: {count}.',
    other:
      'Kontrolní čtení se NELIŠÍ jen podle plánu: neočekávané bajty: {unexpected}, chybějící bajty: {count}.',
  },
  'fpsOutcome.notTaken': 'Kontrolní čtení neproběhlo, takže záplata zde není zkontrolována.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Všechny sloty: záplatováno {done} z {count}, v tomto pořadí: {order}.',
    few: 'Všechny sloty: záplatováno {done} z {count}, v tomto pořadí: {order}.',
    many: 'Všechny sloty: záplatováno {done} z {count}, v tomto pořadí: {order}.',
    other: 'Všechny sloty: záplatováno {done} z {count}, v tomto pořadí: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'Kontrolní čtení se od uloženého slotu liší jen v plánovaném bajtu ({count}).',
    few: 'Kontrolní čtení se od uloženého slotu liší jen v plánovaných bajtech ({count}).',
    many: 'Kontrolní čtení se od uloženého slotu liší jen v plánovaných bajtech ({count}).',
    other: 'Kontrolní čtení se od uloženého slotu liší jen v plánovaných bajtech ({count}).',
  },
  'fpsEveryOutcome.notTaken': 'Kontrolní čtení neproběhlo.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Zastaveno: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Nezapsáno: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Žádný slot této kamery odsud nelze zapsat.',
  'keys.title': 'Klíče pro zápisy',
  'keys.chain': 'Řetězec',
  'keys.chainPlain':
    'nešifrovaný řetězec z roku 2014: každý slot je uložen v otevřené podobě, takže žádný neobsahuje klíč',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Zapisuje se jako',
  'keys.writtenPlain': 'obraz tak, jak je, bez klíče, do libovolného slotu',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Předává se jako',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Ukládá se jako',
  'keys.refused': 'Odmítnuto',
  'keys.bootedBank': 'Spuštěný slot',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank} obsahuje {key:acc}',
  'keys.theBootedBank': 'spuštěný slot',
  'keys.unnamedKey': 'klíč, který stránka neumí pojmenovat',
  'keys.bootedBanksKey': 'klíč spuštěného slotu',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; každý slot se zapisuje stejně',

  /* "What these buttons do", below the tab. */
  'how.title': 'Co tato tlačítka dělají',
  'how.read': '**Přečíst sloty** a **Vyčíst** v kameře nic nemění.',
  'how.flash':
    '**Zapsat dešifrovaný obraz** vezme obraz v otevřené podobě, před předáním ho zašifruje tak, jak to vyžaduje firmware daného slotu, a zobrazí plán. **Zapsat surové bajty** předá soubor přesně tak, jak je. Ani jedno nic neodešle, dokud to nepotvrdíte.',
  'how.ff':
    'Zápis do slotu {letterR} vyžaduje další potvrzení jako každý zápis do slotu pro obnovu. **Prázdný** slot (okno jeho hlavičky se čte jako samé 0xFF, jako u {b:gen} mnoha kamer z roku 2014) je stav, ne závada. Zapisuje se přesně jako každý jiný slot.',
  'how.copy':
    '**Obnovit z úplné zálohy paměti flash** vezme soubor .bin (celý obraz paměti flash o velikosti 4 MB, například čtení přes J-Link) nebo .zip, který ho obsahuje (soubor běhu z karty 0.x/1.x, nebo zip, který uloží „Výpis a dešifrování 4.x/Nano“ či „Vyčíst všechny selektory“), vyřízne z něj tento slot, dešifruje ho a zobrazí plán; pokud záloha vypadá jako z jiné kamery nebo s jiným firmwarem, plán to uvede.',
  'how.fps':
    '**Nastavit N FPS** v řádku slotu upraví obraz daného slotu na vyšší snímkovou frekvenci a **Nastavit N FPS ve všech slotech** to udělá v jednom potvrzení u každého slotu, kde je záplata k dispozici, se slotem, ze kterého kamera teď startuje, jako posledním. U slotu, kde k dispozici není, stránka řekne proč.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Každý zápis nejdřív uloží svůj slot**: slot se znovu přečte a uloží jako jeden stažený soubor zip pojmenovaný podle času, sériového čísla kamery, firmwaru, slotu a zápisu (například `{example}`), který obsahuje slot tak, jak je uložen, jeho dešifrovaný obraz a poznámku, co který soubor je. Chcete-li se vrátit, zapište dešifrovaný soubor ze zipu tlačítkem **Zapsat dešifrovaný obraz**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Zápis smaže jeden slot o velikosti 64 KB a naprogramuje ho. Bootloader na `{address}` a konfigurace startu se zde nikdy nezapisují a neexistuje žádný ovládací prvek pro volbu aktivního slotu. Slot se projeví až poté, co kameru odpojíte a znovu připojíte.',
} satisfies Translation<'slots', 'cs'>;
