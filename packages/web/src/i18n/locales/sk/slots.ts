/**
 * Namespace `slots`, slovenčina (sk), translated from the English source: the firmware-slots tab.
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
  'section.title': 'Práca so slotmi firmvéru',
  'section.badge': 'Zapisuje do pamäte flash',
  'section.description':
    '„Prečítať sloty“ sa opýta kamery, čo v nej beží, prečíta jej tri sloty firmvéru — {a}, {b} a {r} — a ukáže, čo ktorý obsahuje. Čítanie a vypisovanie nič nemenia. Tlačidlo zápisu sa opýta skôr, než sa odošle akýkoľvek bajt.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Táto stránka dokáže zapisovať do pamäte flash kamery.** Zápis vymaže jeden slot s veľkosťou 64 KB a naprogramuje ho. Obraz, ktorý je štrukturálne platný, ale nebude bežať, zanechá kameru v nespustiteľnom stave, a bootloader nemá USB — obnoviť ju možno len cez SWD/J-Link alebo programátorom SPI. Najprv slot vypíšte a súbor si ponechajte.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Akcie slotov',
  'actions.read': 'Prečítať sloty',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Sloty',

  /* Before any read. */
  'empty.connected': 'Stlačte „Prečítať sloty“.',
  'empty.disconnected': 'Pripojte kameru a potom stlačte „Prečítať sloty“.',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Táto zostava tu nie je podporovaná, takže sa neprečítal žiadny slot a žiadny sa nedá zapísať.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Neidentifikované: táto stránka nedokáže zistiť, ktorá zostava v kamere beží.',
  'refusal.notIdentified.body':
    'Kamera nevrátila použiteľnú verziu firmvéru, takže sa neprečítal žiadny slot a nič sa neaktivovalo. Táto stránka pokrýva zostavy {minVersion} a novšie. Zostavy staršie ako {minVersion} sú mimo toho, čo stránka slotov podporuje, takže kamera s niektorou z nich sa tu nikdy nečíta.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Ak v kamere beží podporovaná zostava, možno práve štartuje. {hint}',
  'refusal.title': 'Odmietnuté — nič sa neaktivovalo.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Číta sa ...',
  'status.readingAgain': 'Sloty sa čítajú znova ...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Prečítané. Prečítané sloty: {read}/{count}.',
    few: 'Prečítané. Prečítané sloty: {read}/{count}.',
    many: 'Prečítané. Prečítané sloty: {read}/{count}.',
    other: 'Prečítané. Prečítané sloty: {read}/{count}.',
  },
  'status.unsupported': 'Na tejto zostave nie je podporované — neprečítal sa žiadny slot.',
  'status.refused': 'Odmietnuté — nič sa neaktivovalo. Pozrite si správu pod protokolom.',
  'status.disconnected': 'Zariadenie odpojené — prečítajte sloty znova.',
  'status.newDevice': 'Vybrané nové zariadenie — prečítajte sloty znova.',
  'status.dumping': 'Vypisuje sa {bank} ...',
  'status.dumped': 'Vypísané: {bank}.',
  'status.readingImage': 'Číta sa obraz ...',
  'status.ready': 'Pripravené — prezrite si plán a potom ho zapíšte.',
  'status.rejected': 'Odmietnuté — pozrite si protokol vyššie.',
  'status.writing': 'Zapisuje sa ...',
  'status.patching': 'Záplatuje sa {bank} ...',
  'status.patchingEvery': 'Záplatujú sa všetky sloty ...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Zapísané, ale kontrolné čítanie nezodpovedá — pozrite si výsledok.',
  'status.written.verified': 'Zapísané. Slot sa číta tak, ako bol zapísaný.',
  'status.written.notCompared':
    'Zapísané. Kontrolné čítanie sa neporovnávalo — pozrite si výsledok.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Záplatované, ale kontrolné čítanie sa nelíši len podľa plánu — pozrite si výsledok.',
  'status.patched.ok': 'Záplatované. Slot sa číta podľa plánu.',
  'status.patched.unchecked':
    'Záplatované. Kontrolné čítanie sa nekontrolovalo — pozrite si výsledok.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Zastavené pri {bank:loc} — záplatoval sa {count} slot; pozrite si výsledok.',
    few: 'Zastavené pri {bank:loc} — záplatovali sa {count} sloty; pozrite si výsledok.',
    many: 'Zastavené pri {bank:loc} — záplatovalo sa {count} slotu; pozrite si výsledok.',
    other: 'Zastavené pri {bank:loc} — záplatovalo sa {count} slotov; pozrite si výsledok.',
  },
  'status.every.unchecked': {
    one: 'Záplatoval sa {count} slot, ale kontrolné čítanie sa neoverilo podľa plánu — pozrite si výsledok.',
    few: 'Záplatovali sa {count} sloty, ale jedno kontrolné čítanie sa neoverilo podľa plánu — pozrite si výsledok.',
    many: 'Záplatovalo sa {count} slotu, ale jedno kontrolné čítanie sa neoverilo podľa plánu — pozrite si výsledok.',
    other:
      'Záplatovalo sa {count} slotov, ale jedno kontrolné čítanie sa neoverilo podľa plánu — pozrite si výsledok.',
  },
  'status.every.ok': {
    one: 'Záplatoval sa {count} slot. Číta sa podľa plánu.',
    few: 'Záplatovali sa {count} sloty. Každý sa číta podľa plánu.',
    many: 'Záplatovalo sa {count} slotu. Každý sa číta podľa plánu.',
    other: 'Záplatovalo sa {count} slotov. Každý sa číta podľa plánu.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Zrušené — nič sa nezapísalo.',
  'status.cancelled.one':
    'Zrušené po odoslaní potvrdenia zápisu do {bank:gen} — slot môže byť zapísaný len čiastočne. Skôr než sa naň spoľahnete, prečítajte ho.',
  'status.cancelled.many':
    'Zrušené po odoslaní potvrdení zápisov do {banks:gen} — každý môže byť zapísaný len čiastočne. Skôr než sa na ne spoľahnete, prečítajte ich.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Najprv pripojte kameru.',
  'gate.busy': 'Beží iná operácia — počkajte, kým skončí.',
  'gate.readFirst': 'Najprv prečítajte sloty.',
  'gate.cameraRefused':
    'Do tejto kamery sa odtiaľto nedá zapisovať, z dôvodu uvedeného v oznámení vyššie. Nič sa neodosiela.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Neprečítané: {reason}. Skôr než do slotu zapíšete, prečítajte sloty znova.',
  'gate.notReadNoReason':
    'Neprečítané: tento slot sa neprečítal. Skôr než doň zapíšete, prečítajte sloty znova.',
  'gate.emptyNotWritable': 'Tento slot je prázdny a na tejto zostave sa doň nedá zapísať: {reason}',
  'gate.noSuchBank': 'Táto zostava taký slot nemá.',

  /* The bank table. */
  'table.caption':
    'Každý slot firmvéru tejto kamery — {a}, {b} a {r} — tak, ako bol prečítaný a skontrolovaný v prehliadači',
  'table.col.bank': 'Slot',
  'table.col.firmware': 'Firmvér',
  'table.col.size': 'Veľkosť',
  'table.col.key': 'Kľúč',
  'table.col.bootable': 'Spustiteľný',
  'table.col.sha': 'SHA-256 otvoreného textu',
  'table.col.actions': 'Akcie',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'neprečítané — {reason}',
  'table.notReadNoReason': 'neprečítané — slot sa neprečítal',
  /* A badge: the bank holds no image. */
  'table.empty': 'prázdny',
  'table.emptyNote':
    'Žiadny obraz: okno hlavičky tohto slotu sa číta ako samé 0xFF, takže sa z neho nič nedešifruje a zápis doň neprepíše žiadny firmvér.',
  /* {reason} is core's. */
  'table.emptyWritable': 'Dá sa zapísať.',
  'table.emptyNotWritable': 'Na tejto zostave sa nedá zapísať: {reason}',
  'table.unknownVersion': 'neznáma verzia',
  /* {id} is the image id in hex. */
  'table.imageId': 'obraz {id}',
  'table.noImage': 'žiadny obraz',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'slot {size} B',
  'table.imageSize': 'obraz {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'žiadny (otvorený text)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— nič na spustenie',
  'table.boot.bootable': 'spustiteľný — bootloader ho prijme',
  'table.boot.notBootable': 'nespustiteľný — pri štarte sa preskočí',
  'table.boot.recoveryOnly':
    'len na obnovu — {letterR} sa spustí, keď {letterA} ani {letterB} neobsahujú nič, čo bootloader prijme (namerané na kamere pre skoršiu podobu tohto obrazu); či sa spustí táto podoba, nie je vyskúšané',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'neznáme — {why}',
  /* The row's buttons. */
  'table.dump': 'Vypísať',
  'table.flashPlain': 'Zapísať dešifrovaný obraz…',
  'table.flashRaw': 'Zapísať surové bajty…',
  'table.restore': 'Obnoviť z úplnej zálohy pamäte flash (.bin alebo .zip)…',
  'table.makeFps': 'Nastaviť {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Kopírovať do {bank:gen}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: vypnuté',
  'table.copyNote':
    'Skopíruje firmvér, ktorý tento slot obsahuje, tak ako ho toto čítanie dešifrovalo, do slotu, ktorý vyberiete, nech je v ňom čokoľvek. Plán si prezriete skôr, než sa čokoľvek odošle.',
  'table.restoreNote':
    'Vyberte úplnú zálohu pamäte flash: súbor .bin (celý obraz pamäte flash s veľkosťou 4 MB, napríklad čítanie cez J-Link) alebo .zip, ktorý ho obsahuje (súbor behu z karty 0.x/1.x alebo zip, ktorý uloží „Výpis a dešifrovanie 4.x/Nano“ či „Vypísať všetky selektory“). Tento slot sa z nej vyreže, dešifruje a zobrazí ako plán skôr, než sa čokoľvek odošle.',
  'table.fpsNote':
    'Zvýši snímkovú frekvenciu tohto slotu z {fromHz} Hz na {toHz} Hz úpravou jeho bajtov. Slot sa najprv uloží do stiahnutého súboru zip a dešifrovaný súbor v ňom je cesta späť.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery':
    '{booted} a zároveň slot na obnovu: zápis doň vyžaduje ďalšie potvrdenie.',
  'table.risk.booted': '{booted}: zápis doň vyžaduje ďalšie potvrdenie.',
  'table.risk.recovery': '{bank}: zápis doň vyžaduje ďalšie potvrdenie.',
  'table.risk.bootUnnamed':
    'Kamera neuvádza svoj spustený slot: zápis doň vyžaduje ďalšie potvrdenie.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Záplata snímkovej frekvencie je použitá: tento obraz beží na {hz} Hz.',
  'fps.earlierPatch':
    'Záplata snímkovej frekvencie sa neponúka: tento slot obsahuje skoršiu záplatu {hz} Hz bez opravy USB. Obnovte pôvodný obraz a potom použite „Nastaviť {hz} FPS“.',
  'fps.atRate': 'Záplata snímkovej frekvencie nie je potrebná: táto zostava už beží na {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Záplata snímkovej frekvencie sa neponúka: {reason}',
  'fps.readFirst': 'najprv prečítajte sloty — záplata sa plánuje z vlastného obrazu slotu',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Všetky sloty',
  'everyBank.make': 'Nastaviť {hz} FPS vo všetkých slotoch',
  'everyBank.faster': 'Zrýchliť všetky sloty',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Záplatuje {order:acc} v jednom potvrdení; každý sa najprv uloží do jedného stiahnutého súboru zip a potom sa skontroluje čítaním.',
  'everyBank.noteBootedLast':
    'Záplatuje {order:acc} v jednom potvrdení, slot, z ktorého kamera teraz štartuje, ako posledný; každý sa najprv uloží do jedného stiahnutého súboru zip a potom sa skontroluje čítaním.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': 'obraz {bank:gen}',
  'what.restore': '{bank:acc} zo súboru {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Pripravené pre {bank:acc} na adrese {address}',
  'preview.file': 'Súbor',
  'preview.source': 'Obraz prevzatý z',
  'preview.target': 'Cieľ',
  'preview.targetEmpty':
    '{bank} je prázdny: neobsahuje žiadny obraz, takže tento zápis neprepíše žiadny firmvér',
  'preview.readAs': 'Čítané ako',
  'preview.readAs.ff': 'dešifrovaný obraz {version} FF',
  'preview.readAs.plain': 'dešifrovaný obraz',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'surové bajty',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Odovzdanie',
  'preview.key': 'Kľúč',
  'preview.payload': 'Údaje',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} B, {count} blok po najviac {chunk} B',
    few: '{size} B, {count} bloky po najviac {chunk} B',
    many: '{size} B, {count} bloku po najviac {chunk} B',
    other: '{size} B, {count} blokov po najviac {chunk} B',
  },
  'preview.checksum': 'Kontrolný súčet prenosu',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Uložené po zápise',
  'preview.storedNotPredicted': 'nepredpovedá sa — overí to kontrolné čítanie',
  'preview.storedPredicted': '{size} B (predpoveď)',
  'preview.storedKeyB': '{size} B (predpoveď) — obraz XOR kľúč B, nie samotné údaje',
  'preview.savedFirst': 'Najprv uložené',
  'preview.compareCaption': 'Čo sa zmení v {bank:loc}',
  'preview.col.field': 'Pole',
  'preview.col.now': 'Teraz',
  'preview.col.after': 'Po zápise',
  'preview.readFirst': 'Prečítajte si pred zápisom:',
  /* {note} is core's note about this write. */
  'preview.note': 'Poznámka: {note}',
  'preview.nothingSent':
    'Do kamery sa zatiaľ nič neodoslalo. Zápis pošle tieto údaje do {bank:gen} a potvrdí ich.',
  'preview.toolbar': 'Akcie zápisu pre {bank:acc}',
  'preview.write': 'Zapísať do {bank:gen}…',
  'preview.discard': 'Zahodiť',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Zapísať {what} do {bank:gen} na adrese {address}?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Zápis nahradí firmvér, ktorý v kamere teraz beží. Ak nový obraz nebude bežať, kamera nemusí vôbec naštartovať.',
  'writeConfirm.recovery':
    '{bank} je slot na obnovu, posledná záložná kópia, ku ktorej sa bootloader vracia. Zápis doň nechá kameru bez tejto kópie, kým ju neobnovíte.',
  'writeConfirm.bootUnnamed':
    'Kamera neuvádza, z ktorého slotu štartuje, takže sa {bank:nom} berie ako slot, z ktorého teraz štartuje. Zápis doň môže nahradiť firmvér, ktorý v kamere beží.',
  'writeConfirm.empty':
    '{bank} je prázdny: neobsahuje žiadny obraz, takže sa žiadny firmvér neprepíše.',
  'writeConfirm.eraseEmpty':
    'Zápis napriek tomu vymaže blok pamäte flash kamery s veľkosťou 64 KB v {bank:loc} (už prázdny) a naprogramuje ho.',
  'writeConfirm.erase':
    'Tým sa vymaže blok pamäte flash kamery s veľkosťou 64 KB a naprogramuje sa v {bank:loc}.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'Obraz sa zapíše s týmto kľúčom: {key}. Každý iný slot sa zapisuje rovnako.',
  'writeConfirm.backup':
    'Skôr než sa čokoľvek odošle, {bank:nom} sa znova prečíta a uloží ako jeden stiahnutý súbor zip: {file}. Nájdete ho v priečinku so stiahnutými súbormi.',
  'writeConfirm.noReset':
    'Neposiela sa žiadny reset. Aby sa slot prejavil, kameru potom odpojte a znova pripojte.',
  'writeConfirm.noUsbRecovery':
    'Ak obraz nebude bežať, kameru nie je možné obnoviť cez USB — len cez SWD/J-Link alebo programátorom SPI.',
  'writeConfirm.ackUnnamed':
    'Rozumiem, že kamera neuvádza, z ktorého slotu štartuje, takže sa tento slot berie ako spustený, a že chybný obraz môže kameru zanechať v nespustiteľnom stave.',
  'writeConfirm.confirm': 'Áno — zapísať do {bank:gen}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Rozumiem, že z tohto slotu kamera teraz štartuje a že chybný obraz môže kameru zanechať v nespustiteľnom stave.',
  'ack.recovery':
    'Rozumiem, že toto je slot na obnovu a že chybný obraz zanechá kameru bez poslednej záložnej kópie.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Nastaviť {hz} FPS v {bank:loc}?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted': '{bootsNow}. Záplatovaný obraz nahradí firmvér, ktorý teraz beží.',
  'fpsConfirm.recovery':
    '{bank} je slot na obnovu, posledná záložná kópia, ku ktorej sa bootloader vracia.',
  'fpsConfirm.what':
    '{bank} obsahuje firmvér {version} a táto úprava nechá jeho obraz bežať na {toHz} Hz namiesto {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(neznámy)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'Záplata zmení {count} bajt obrazu a slovo kontrolného súčtu, takže súčet, ktorý bootloader kontroluje, zostane zachovaný. Dvojica kľúčov sa nemení.',
    few: 'Záplata zmení {count} bajty obrazu a slovo kontrolného súčtu, takže súčet, ktorý bootloader kontroluje, zostane zachovaný. Dvojica kľúčov sa nemení.',
    many: 'Záplata zmení {count} bajtu obrazu a slovo kontrolného súčtu, takže súčet, ktorý bootloader kontroluje, zostane zachovaný. Dvojica kľúčov sa nemení.',
    other:
      'Záplata zmení {count} bajtov obrazu a slovo kontrolného súčtu, takže súčet, ktorý bootloader kontroluje, zostane zachovaný. Dvojica kľúčov sa nemení.',
  },
  'fpsConfirm.wayBack':
    'Dešifrovaný súbor v tom zipe je cesta späť: ak chcete záplatu vrátiť, zapíšte ho tlačidlom „Zapísať dešifrovaný obraz“ pri {bank:loc}.',
  'fpsConfirm.noReset':
    'Neposiela sa žiadny reset. Aby sa záplatovaný slot prejavil, kameru potom odpojte a znova pripojte.',
  'fpsConfirm.ackUnnamed':
    'Rozumiem, že kamera neuvádza, z ktorého slotu štartuje, takže sa tento slot berie ako spustený.',
  'fpsConfirm.confirm': 'Áno — záplatovať {bank:acc}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Nastaviť {hz} FPS vo všetkých slotoch?',
  'fpsEvery.titleMixed': {
    one: 'Záplatovať snímkovú frekvenciu {count} slotu?',
    few: 'Záplatovať snímkovú frekvenciu {count} slotov?',
    many: 'Záplatovať snímkovú frekvenciu {count} slotu?',
    other: 'Záplatovať snímkovú frekvenciu {count} slotov?',
  },
  'fpsEvery.intro': {
    one: 'Táto akcia záplatuje {count} slot tam, kde je záplata k dispozícii (firmvér {version}):',
    few: 'Táto akcia záplatuje {count} sloty tam, kde je záplata k dispozícii (firmvér {version}):',
    many: 'Táto akcia záplatuje {count} slotu tam, kde je záplata k dispozícii (firmvér {version}):',
    other:
      'Táto akcia záplatuje {count} slotov tam, kde je záplata k dispozícii (firmvér {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (slot, z ktorého kamera teraz štartuje, a zároveň slot na obnovu)',
  'fpsEvery.role.booted': '{bank} (slot, z ktorého kamera teraz štartuje)',
  'fpsEvery.role.recovery': '{bank} (slot na obnovu, posledná záložná kópia)',
  'fpsEvery.role.bootUnnamed': '{bank} (kamera neuvádza, z ktorého slotu štartuje)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: z {fromHz} Hz na {toHz} Hz, {count} bajt a slovo kontrolného súčtu.',
    few: '{bank}: z {fromHz} Hz na {toHz} Hz, {count} bajty a slovo kontrolného súčtu.',
    many: '{bank}: z {fromHz} Hz na {toHz} Hz, {count} bajtu a slovo kontrolného súčtu.',
    other: '{bank}: z {fromHz} Hz na {toHz} Hz, {count} bajtov a slovo kontrolného súčtu.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Bez zmeny zostanú: {others}',
  'fpsEvery.orderOne': 'Zapíše len {bank:acc} a skontroluje ho čítaním.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Zapisujú sa v tomto poradí: {order}. Každý sa pred ďalším skontroluje čítaním a prvé zlyhanie zastaví zvyšok.',
  'fpsEvery.orderBootedLast':
    'Zapisujú sa v tomto poradí: {order}. Slot, z ktorého kamera teraz štartuje, ide posledný, takže pri zlyhaní sa skončí pred ním. Každý sa pred ďalším skontroluje čítaním a prvé zlyhanie zastaví zvyšok.',
  'fpsEvery.wayBack':
    'Dešifrované súbory v tom zipe sú cesta späť: ak chcete záplatu slotu vrátiť, zapíšte jeho súbor tlačidlom „Zapísať dešifrovaný obraz“ pri tom slote.',
  'fpsEvery.noReset':
    'Neposiela sa žiadny reset. Aby sa záplatované sloty prejavili, kameru potom odpojte a znova pripojte.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Rozumiem, že táto akcia zapíše {banks} a že chybný obraz môže kameru zanechať v nespustiteľnom stave.',
  'fpsEvery.confirm': {
    one: 'Áno — záplatovať {count} slot',
    few: 'Áno — záplatovať {count} sloty',
    many: 'Áno — záplatovať {count} slotu',
    other: 'Áno — záplatovať {count} slotov',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: slot sa číta tak, ako bol zapísaný.',
  'outcome.mismatch': '{bank} — {what}: kontrolné čítanie NEZODPOVEDÁ tomu, čo sa zapísalo.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: kontrolné čítanie prebehlo, ale neporovnávalo sa, takže tento zápis tu nie je overený.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'Potvrdenie zápisu v kamere vrátilo stav {status}.',
  'outcome.wasEmpty': '{bank} bol pred týmto zápisom prázdny, takže sa neprepísal žiadny firmvér.',
  'outcome.provenVerified':
    'Zatiaľ preukázané: údaje sa odoslali, zápis sa potvrdil a slot sa číta tak, ako bol zapísaný. NEPREUKÁZANÉ: že bootloader tento slot vyberie ani že obraz bude bežať.',
  'outcome.provenCommitted':
    'Zatiaľ preukázané: údaje sa odoslali a zápis sa potvrdil. NEPREUKÁZANÉ: že bootloader tento slot vyberie ani že obraz bude bežať.',
  'outcome.replug':
    '**TERAZ KAMERU ODPOJTE A ZNOVA PRIPOJTE.** Neodoslal sa žiadny reset, takže sa slot prejaví až po skutočnom vypnutí a zapnutí. Potom sloty prečítajte znova: rozhodne len verzia a aktívny slot, ktoré kamera nahlási.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**TERAZ KAMERU ODPOJTE A ZNOVA PRIPOJTE.** Neodoslal sa žiadny reset. Potom sloty prečítajte znova.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Najprv uložené ako stiahnutý súbor: {file}.',
  'outcome.wayBackOne':
    'Dešifrovaný súbor v ňom je cesta späť („Zapísať dešifrovaný obraz“ pri tom istom slote).',
  'outcome.wayBackMany':
    'Dešifrované súbory v ňom sú cesta späť („Zapísať dešifrovaný obraz“ pri každom slote).',
  'outcome.checkDownloads': 'Nájdete ho v priečinku so stiahnutými súbormi.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank} — záplatované z {fromHz} Hz na {toHz} Hz (firmvér {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'Kontrolné čítanie sa od uloženého výpisu líši len v plánovanom bajte ({count}), miestach úprav a slove súčtu.',
    few: 'Kontrolné čítanie sa od uloženého výpisu líši len v plánovaných bajtoch ({count}), miestach úprav a slove súčtu.',
    many: 'Kontrolné čítanie sa od uloženého výpisu líši len v plánovaných bajtoch ({count}), miestach úprav a slove súčtu.',
    other:
      'Kontrolné čítanie sa od uloženého výpisu líši len v plánovaných bajtoch ({count}), miestach úprav a slove súčtu.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'Kontrolné čítanie sa NELÍŠI len podľa plánu: neočakávané bajty: {unexpected}, chýbajúce bajty: {count}.',
    few: 'Kontrolné čítanie sa NELÍŠI len podľa plánu: neočakávané bajty: {unexpected}, chýbajúce bajty: {count}.',
    many: 'Kontrolné čítanie sa NELÍŠI len podľa plánu: neočakávané bajty: {unexpected}, chýbajúce bajty: {count}.',
    other:
      'Kontrolné čítanie sa NELÍŠI len podľa plánu: neočakávané bajty: {unexpected}, chýbajúce bajty: {count}.',
  },
  'fpsOutcome.notTaken': 'Kontrolné čítanie neprebehlo, takže záplata tu nie je skontrolovaná.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Všetky sloty: záplatované {done} z {count}, v tomto poradí: {order}.',
    few: 'Všetky sloty: záplatované {done} z {count}, v tomto poradí: {order}.',
    many: 'Všetky sloty: záplatované {done} z {count}, v tomto poradí: {order}.',
    other: 'Všetky sloty: záplatované {done} z {count}, v tomto poradí: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'Kontrolné čítanie sa od uloženého slotu líši len v plánovanom bajte ({count}).',
    few: 'Kontrolné čítanie sa od uloženého slotu líši len v plánovaných bajtoch ({count}).',
    many: 'Kontrolné čítanie sa od uloženého slotu líši len v plánovaných bajtoch ({count}).',
    other: 'Kontrolné čítanie sa od uloženého slotu líši len v plánovaných bajtoch ({count}).',
  },
  'fpsEveryOutcome.notTaken': 'Kontrolné čítanie neprebehlo.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Zastavené: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Nezapísané: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Žiadny slot tejto kamery sa odtiaľto nedá zapísať.',
  'keys.title': 'Kľúče na zápisy',
  'keys.chain': 'Reťazec',
  'keys.chainPlain':
    'nešifrovaný reťazec z roku 2014: každý slot je uložený v otvorenej podobe, takže žiadny neobsahuje kľúč',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Zapisuje sa ako',
  'keys.writtenPlain': 'obraz tak, ako je, bez kľúča, do ľubovoľného slotu',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Odovzdáva sa ako',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Ukladá sa ako',
  'keys.refused': 'Odmietnuté',
  'keys.bootedBank': 'Spustený slot',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank} obsahuje {key:acc}',
  'keys.theBootedBank': 'spustený slot',
  'keys.unnamedKey': 'kľúč, ktorý stránka nevie pomenovať',
  'keys.bootedBanksKey': 'kľúč spusteného slotu',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; každý slot sa zapisuje rovnako',

  /* "What these buttons do", below the tab. */
  'how.title': 'Čo robia tieto tlačidlá',
  'how.read': '**Prečítať sloty** a **Vypísať** v kamere nič nemenia.',
  'how.flash':
    '**Zapísať dešifrovaný obraz** vezme obraz v otvorenej podobe, pred odovzdaním ho zašifruje tak, ako to vyžaduje firmvér daného slotu, a zobrazí plán. **Zapísať surové bajty** odovzdá súbor presne tak, ako je. Ani jedno nič neodošle, kým to nepotvrdíte.',
  'how.ff':
    'Zápis do slotu {letterR} vyžaduje ďalšie potvrdenie ako každý zápis do slotu na obnovu. **Prázdny** slot (okno jeho hlavičky sa číta ako samé 0xFF, ako pri {b:loc} mnohých kamier z roku 2014) je stav, nie porucha. Zapisuje sa presne ako každý iný slot.',
  'how.copy':
    '**Obnoviť z úplnej zálohy pamäte flash** vezme súbor .bin (celý obraz pamäte flash s veľkosťou 4 MB, napríklad čítanie cez J-Link) alebo .zip, ktorý ho obsahuje (súbor behu z karty 0.x/1.x alebo zip, ktorý uloží „Výpis a dešifrovanie 4.x/Nano“ či „Vypísať všetky selektory“), vyreže z neho tento slot, dešifruje ho a zobrazí plán; ak záloha vyzerá ako z inej kamery alebo s iným firmvérom, plán to uvedie.',
  'how.fps':
    '**Nastaviť N FPS** v riadku slotu upraví obraz daného slotu na vyššiu snímkovú frekvenciu a **Nastaviť N FPS vo všetkých slotoch** to urobí v jednom potvrdení pri každom slote, kde je záplata k dispozícii, so slotom, z ktorého kamera teraz štartuje, ako posledným. Pri slote, kde k dispozícii nie je, stránka povie prečo.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Každý zápis najprv uloží svoj slot**: slot sa znova prečíta a uloží ako jeden stiahnutý súbor zip pomenovaný podľa času, sériového čísla kamery, firmvéru, slotu a zápisu (napríklad `{example}`), ktorý obsahuje slot tak, ako je uložený, jeho dešifrovaný obraz a poznámku, čo ktorý súbor je. Ak sa chcete vrátiť, zapíšte dešifrovaný súbor zo zipu tlačidlom **Zapísať dešifrovaný obraz**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Zápis vymaže jeden slot s veľkosťou 64 KB a naprogramuje ho. Bootloader na `{address}` a konfigurácia štartu sa tu nikdy nezapisujú a neexistuje žiadny ovládací prvok na voľbu aktívneho slotu. Slot sa prejaví až po odpojení a opätovnom pripojení kamery.',
} satisfies Translation<'slots', 'sk'>;
