/**
 * Namespace `slots`, eesti (et), translated from the English source: the firmware-slots tab.
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
  'section.title': 'Püsivarapesad',
  'section.badge': 'Kirjutab välkmällu',
  'section.description':
    '„Loe pesad“ küsib kaameralt, mida see käitab, loeb selle kolme püsivarapesa — {a}, {b} ja {r} — ning näitab, mida igaüks sisaldab. Lugemine ja tõmmise tegemine ei muuda midagi. Kirjutamisnupp küsib luba enne, kui ühtki baiti saadetakse.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**See leht saab kirjutada kaamera välkmällu.** Kirjutamine kustutab ühe 64 KB pesa ja programmeerib selle. Struktuurilt korrektne, kuid mittetöötav kujutis jätab kaamera käivitumatuks ja alglaaduril pole USB-d — taastada saab ainult SWD/J-Linki või SPI-programmaatoriga. Tehke esmalt pesast tõmmis ja hoidke fail alles.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Pesade toimingud',
  'actions.read': 'Loe pesad',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Pesad',

  /* Before any read. */
  'empty.connected': 'Vajutage „Loe pesad“.',
  'empty.disconnected': 'Ühendage kaamera, seejärel vajutage „Loe pesad“.',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Seda järku siin ei toetata, nii et ühtegi pesa ei loetud ega saa kirjutada.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Tuvastamata: see leht ei suuda öelda, millist järku kaamera käitab.',
  'refusal.notIdentified.body':
    'Kaamera ei andnud kasutatavat püsivara versiooni, nii et ühtegi pesa ei loetud ja midagi ei aktiveeritud. See leht katab järke {minVersion} ja uuemaid. Järgud enne versiooni {minVersion} jäävad väljapoole seda, mida pesade leht toetab, nii et sellise järguga kaamerat siin kunagi ei loeta.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Kui kaamera käitab toetatud järku, võib see alles käivituda. {hint}',
  'refusal.title': 'Keeldutud — midagi ei aktiveeritud.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Lugemine ...',
  'status.readingAgain': 'Pesade uuesti lugemine ...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Loetud. Pesasid loetud: {read}/{count}.',
    other: 'Loetud. Pesasid loetud: {read}/{count}.',
  },
  'status.unsupported': 'Selles järgus ei toetata — ühtegi pesa ei loetud.',
  'status.refused': 'Keeldutud — midagi ei aktiveeritud. Vaadake logi all olevat teadet.',
  'status.disconnected': 'Seade on lahti ühendatud — lugege pesad uuesti.',
  'status.newDevice': 'Valitud on uus seade — lugege pesad uuesti.',
  'status.dumping': 'Tehakse tõmmist {bank:ela} ...',
  'status.dumped': 'Tõmmis {bank:ela} on tehtud.',
  'status.readingImage': 'Kujutise lugemine ...',
  'status.ready': 'Valmis — vaadake plaan üle, seejärel kirjutage.',
  'status.rejected': 'Tagasi lükatud — vaadake ülalolevat logi.',
  'status.writing': 'Kirjutamine ...',
  'status.patching': 'Paigatakse {bank} ...',
  'status.patchingEvery': 'Paigatakse kõiki pesasid ...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Kirjutatud, kuid tagasilugemine ei ühti — vaadake tulemust.',
  'status.written.verified': 'Kirjutatud. Pesa tagasilugemine vastab kirjutatule.',
  'status.written.notCompared': 'Kirjutatud. Tagasilugemist ei võrreldud — vaadake tulemust.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Paigatud, kuid tagasilugemine ei erine ainult plaanitud viisil — vaadake tulemust.',
  'status.patched.ok': 'Paigatud. Pesa tagasilugemine vastab plaanile.',
  'status.patched.unchecked': 'Paigatud. Tagasilugemist ei kontrollitud — vaadake tulemust.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Peatati {bank:ade} — paigatud pesasid: {count}; vaadake tulemust.',
    other: 'Peatati {bank:ade} — paigatud pesasid: {count}; vaadake tulemust.',
  },
  'status.every.unchecked': {
    one: 'Paigatud pesasid: {count}, kuid üht tagasilugemist ei kontrollitud plaanipäraselt — vaadake tulemust.',
    other:
      'Paigatud pesasid: {count}, kuid üht tagasilugemist ei kontrollitud plaanipäraselt — vaadake tulemust.',
  },
  'status.every.ok': {
    one: 'Paigatud pesasid: {count}. Iga pesa tagasilugemine vastab plaanile.',
    other: 'Paigatud pesasid: {count}. Iga pesa tagasilugemine vastab plaanile.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Katkestatud — midagi ei kirjutatud.',
  'status.cancelled.one':
    'Katkestatud pärast {bank:gen} kinnituskäsu saatmist — pesa võib olla osaliselt kirjutatud. Lugege see enne sellele tuginemist uuesti.',
  'status.cancelled.many':
    'Katkestatud pärast {banks:gen} kinnituskäskude saatmist — igaüks neist võib olla osaliselt kirjutatud. Lugege need enne neile tuginemist uuesti.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Ühendage esmalt kaamera.',
  'gate.busy': 'Käimas on teine toiming — oodake, kuni see lõpeb.',
  'gate.readFirst': 'Lugege esmalt pesad.',
  'gate.cameraRefused':
    'Sellesse kaamerasse ei saa siit kirjutada, põhjus on ülaloleval ribal. Midagi ei saadeta.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Ei loetud: {reason}. Lugege pesad enne selle kirjutamist uuesti.',
  'gate.notReadNoReason':
    'Ei loetud: seda pesa ei loetud. Lugege pesad enne selle kirjutamist uuesti.',
  'gate.emptyNotWritable': 'See pesa on tühi ja seda ei saa selles järgus kirjutada: {reason}',
  'gate.noSuchBank': 'Selles järgus sellist pesa pole.',

  /* The bank table. */
  'table.caption':
    'Selle kaamera iga püsivarapesa — {a}, {b} ja {r} — nagu brauser need luges ja kontrollis',
  'table.col.bank': 'Pesa',
  'table.col.firmware': 'Püsivara',
  'table.col.size': 'Suurus',
  'table.col.key': 'Võti',
  'table.col.bootable': 'Käivitatav',
  'table.col.sha': 'Avateksti SHA-256',
  'table.col.actions': 'Toimingud',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'ei loetud — {reason}',
  'table.notReadNoReason': 'ei loetud — pesa jäi lugemata',
  /* A badge: the bank holds no image. */
  'table.empty': 'tühi',
  'table.emptyNote':
    'Kujutist pole: selle pesa päiseaken on täielikult 0xFF, nii et sellest ei dekrüptita midagi ja selle kirjutamine ei kirjuta üle ühtegi püsivara.',
  /* {reason} is core's. */
  'table.emptyWritable': 'Saab kirjutada.',
  'table.emptyNotWritable': 'Selles järgus ei saa kirjutada: {reason}',
  'table.unknownVersion': 'teadmata versioon',
  /* {id} is the image id in hex. */
  'table.imageId': 'kujutis {id}',
  'table.noImage': 'kujutist pole',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'pesa {size} B',
  'table.imageSize': 'kujutis {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'puudub (avatekst)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— pole midagi käivitada',
  'table.boot.bootable': 'käivitatav — alglaadur võtab selle vastu',
  'table.boot.notBootable': 'pole käivitatav — käivitamisel jäetakse vahele',
  'table.boot.recoveryOnly':
    'ainult taaste — {letterR} käivitub, kui {letterA} ja {letterB} ei sisalda midagi, mida alglaadur vastu võtab (mõõdetud kaameral selle kujutise varasema vormiga); kas see vorm käivitub, on testimata',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'teadmata — {why}',
  /* The row's buttons. */
  'table.dump': 'Tee tõmmis',
  'table.flashPlain': 'Kirjuta dekrüptitud kujutis…',
  'table.flashRaw': 'Kirjuta toorbaidid…',
  'table.restore': 'Taasta täielikust välkmälu varukoopiast (.bin või .zip)…',
  'table.makeFps': 'Sea {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Kopeeri {bank:ill}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: välja lülitatud',
  'table.copyNote':
    'Kopeerib selle pesa püsivara, nagu see lugemine selle dekrüptis, valitud pesasse, ükskõik mis seal praegu on. Enne saatmist vaatate plaani üle.',
  'table.restoreNote':
    'Valige täielik välkmälu varukoopia: .bin (kogu 4 MB välkmälu tõmmis, näiteks J-Linkiga loetud) või .zip, milles see on (0.x/1.x vahekaardi seansifail või ZIP-fail, mille salvestab vahekaart „Tõmmis ja dekrüptimine 4.x/Nano“ või nupp „Loe kõik selektorid“). See pesa lõigatakse sellest välja, dekrüptitakse ja näidatakse plaanina enne, kui midagi saadetakse.',
  'table.fpsNote':
    'Tõstab selle pesa sageduselt {fromHz} Hz sagedusele {toHz} Hz, muutes selle baite. Pesa salvestatakse esmalt ZIP-allalaadimisena ja selles olev dekrüptitud fail on tagasitee.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery': '{booted} ja taastepesa: selle kirjutamine nõuab lisakinnitust.',
  'table.risk.booted': '{booted}: selle kirjutamine nõuab lisakinnitust.',
  'table.risk.recovery': '{bank}: selle kirjutamine nõuab lisakinnitust.',
  'table.risk.bootUnnamed':
    'Kaamera ei nimeta oma käivitatud pesa: selle kirjutamine nõuab lisakinnitust.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Kaadrisageduse paik on rakendatud: see kujutis töötab sagedusel {hz} Hz.',
  'fps.earlierPatch':
    'Kaadrisageduse paika ei pakuta: selles pesas on varasem {hz} Hz paik ilma USB paranduseta. Taastage tehase kujutis, seejärel kasutage nuppu „Sea {hz} FPS“.',
  'fps.atRate': 'Kaadrisageduse paika pole vaja: see järk töötab juba sagedusel {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Kaadrisageduse paika ei pakuta: {reason}',
  'fps.readFirst': 'lugege esmalt pesad — paik planeeritakse pesa enda kujutise põhjal',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Kõik pesad',
  'everyBank.make': 'Sea {hz} FPS igas pesas',
  'everyBank.faster': 'Kiirenda kõiki pesasid',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Paikab ühe kinnitusega {order:gen}; igaüks salvestatakse esmalt ühte ZIP-allalaadimisse ja loetakse tagasi.',
  'everyBank.noteBootedLast':
    'Paikab ühe kinnitusega {order:gen}, praegu käivitatud pesa viimasena; igaüks salvestatakse esmalt ühte ZIP-allalaadimisse ja loetakse tagasi.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': '{bank:gen} kujutis',
  'what.restore': '{bank} failist {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Ette valmistatud {bank:gen} jaoks aadressil {address}',
  'preview.file': 'Fail',
  'preview.source': 'Kujutise allikas',
  'preview.target': 'Siht',
  'preview.targetEmpty':
    '{bank} on tühi: selles pole kujutist, nii et see kirjutamine ei kirjuta üle ühtegi püsivara',
  'preview.readAs': 'Loetud kui',
  'preview.readAs.ff': 'dekrüptitud {version} FF kujutis',
  'preview.readAs.plain': 'dekrüptitud kujutis',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'toorbaidid',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Ettevalmistus',
  'preview.key': 'Võti',
  'preview.payload': 'Andmed',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} B, osi: {count}, igaüks kuni {chunk} B',
    other: '{size} B, osi: {count}, igaüks kuni {chunk} B',
  },
  'preview.checksum': 'Edastuse kontrollsumma',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Pärast salvestatud',
  'preview.storedNotPredicted': 'ei ennustata — kontrolliks on tagasilugemine',
  'preview.storedPredicted': 'ennustatud {size} B',
  'preview.storedKeyB': 'ennustatud {size} B — kujutis XOR võti B, mitte andmed ise',
  'preview.savedFirst': 'Esmalt salvestatud',
  'preview.compareCaption': 'Mis muutub {bank:ine}',
  'preview.col.field': 'Väli',
  'preview.col.now': 'Praegu',
  'preview.col.after': 'Pärast kirjutamist',
  'preview.readFirst': 'Lugege enne kirjutamist:',
  /* {note} is core's note about this write. */
  'preview.note': 'Märkus: {note}',
  'preview.nothingSent':
    'Kaamerale pole veel midagi saadetud. Kirjutamine edastab need andmed {bank:ill} ja kinnitab need.',
  'preview.toolbar': 'Kirjutamistoimingud: {bank}',
  'preview.write': 'Kirjuta {bank:ill}…',
  'preview.discard': 'Hülga',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Kas kirjutada {what} {bank:ill} aadressil {address}?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Selle pesa kirjutamine asendab püsivara, mida kaamera praegu käitab. Kui uus kujutis ei tööta, ei pruugi kaamera üldse käivituda.',
  'writeConfirm.recovery':
    '{bank} on taastepesa, viimane hädavaru, mille poole alglaadur pöördub. Selle kirjutamine jätab kaamera ilma selle varuta, kuni see taastatakse.',
  'writeConfirm.bootUnnamed':
    'Kaamera ei ütle, millisest pesast see käivitub, nii et {bank} käsitletakse praegu käivitatud pesana. Selle kirjutamine võib asendada püsivara, mida kaamera käitab.',
  'writeConfirm.empty':
    '{bank} on tühi: selles pole kujutist, nii et ühtegi püsivara üle ei kirjutata.',
  'writeConfirm.eraseEmpty':
    'Kirjutamine kustutab ikkagi {bank:gen} 64 KB ploki kaamera välkmälus (juba tühi) ja programmeerib selle.',
  'writeConfirm.erase':
    'See kustutab {bank:gen} 64 KB ploki kaamera välkmälus ja programmeerib selle.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'Kujutis kirjutatakse võtmega: {key}. Iga teine pesa kirjutatakse samamoodi.',
  'writeConfirm.backup':
    'Enne kui midagi saadetakse, loetakse {bank} uuesti ja salvestatakse ühe ZIP-allalaadimisena: {file}. Otsige seda oma allalaadimiste kaustast.',
  'writeConfirm.noReset':
    'Lähtestuskäsku ei saadeta. Pärast seda eemaldage kaamera ja ühendage uuesti, et pesa rakenduks.',
  'writeConfirm.noUsbRecovery':
    'Kui kujutis ei tööta, ei saa kaamerat USB kaudu taastada — ainult SWD/J-Linki või SPI-programmaatoriga.',
  'writeConfirm.ackUnnamed':
    'Saan aru, et kaamera ei ütle, millisest pesast see käivitub, nii et seda pesa käsitletakse käivitatud pesana, ja et vigane kujutis võib jätta kaamera käivitumatuks.',
  'writeConfirm.confirm': 'Jah — kirjuta {bank:ill}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Saan aru, et kaamera käivitub praegu sellest pesast ja et vigane kujutis võib jätta kaamera käivitumatuks.',
  'ack.recovery':
    'Saan aru, et see on taastepesa ja et vigane kujutis jätab kaamera ilma viimase hädavaruta.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Kas panna {bank} töötama sagedusel {hz} FPS?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted': '{bootsNow}. Paigatud kujutis asendab püsivara, mida see praegu käitab.',
  'fpsConfirm.recovery': '{bank} on taastepesa, viimane hädavaru, mille poole alglaadur pöördub.',
  'fpsConfirm.what':
    '{bank} sisaldab püsivara {version} ja see muudatus paneb selle kujutise töötama sagedusel {toHz} Hz, mitte {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(teadmata)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'Paik muudab kujutises {count} baidi ja vastuvõtusumma sõna, nii et alglaaduri kontrollitav summa säilib. Võtmepaari ei puudutata.',
    other:
      'Paik muudab kujutises {count} baiti ja vastuvõtusumma sõna, nii et alglaaduri kontrollitav summa säilib. Võtmepaari ei puudutata.',
  },
  'fpsConfirm.wayBack':
    'Selles ZIP-failis olev dekrüptitud fail on tagasitee: paiga tühistamiseks kirjutage see nupuga „Kirjuta dekrüptitud kujutis“ {bank:ill}.',
  'fpsConfirm.noReset':
    'Lähtestuskäsku ei saadeta. Pärast seda eemaldage kaamera ja ühendage uuesti, et paigatud pesa rakenduks.',
  'fpsConfirm.ackUnnamed':
    'Saan aru, et kaamera ei ütle, millisest pesast see käivitub, nii et seda pesa käsitletakse käivitatud pesana.',
  'fpsConfirm.confirm': 'Jah — paika {bank}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Kas panna kõik pesad töötama sagedusel {hz} FPS?',
  'fpsEvery.titleMixed': {
    one: 'Kas paigata {count} pesa kaadrisagedus?',
    other: 'Kas paigata {count} pesa kaadrisagedus?',
  },
  'fpsEvery.intro': {
    one: 'See paikab {count} pesa, milles paik on saadaval (püsivara {version}):',
    other: 'See paikab {count} pesa, milles paik on saadaval (püsivara {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery': '{bank} (pesa, millest kaamera praegu käivitub, ja taastepesa)',
  'fpsEvery.role.booted': '{bank} (pesa, millest kaamera praegu käivitub)',
  'fpsEvery.role.recovery': '{bank} (taastepesa, viimane hädavaru)',
  'fpsEvery.role.bootUnnamed': '{bank} (kaamera ei ütle, millisest pesast see käivitub)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: {fromHz} Hz → {toHz} Hz, {count} bait ja vastuvõtusumma sõna.',
    other: '{bank}: {fromHz} Hz → {toHz} Hz, {count} baiti ja vastuvõtusumma sõna.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Jäävad muutmata: {others}',
  'fpsEvery.orderOne': 'See kirjutab ainult {bank:ill} ja loeb selle tagasi.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Kirjutamise järjekord: {order}. Iga pesa loetakse tagasi enne järgmist ja esimene nurjumine peatab ülejäänud.',
  'fpsEvery.orderBootedLast':
    'Kirjutamise järjekord: {order}. Pesa, millest kaamera praegu käivitub, tuleb viimasena, nii et nurjumine peatab töö enne seda. Iga pesa loetakse tagasi enne järgmist ja esimene nurjumine peatab ülejäänud.',
  'fpsEvery.wayBack':
    'Selles ZIP-failis olevad dekrüptitud failid on tagasitee: pesa paiga tühistamiseks kirjutage selle fail nupuga „Kirjuta dekrüptitud kujutis“ samasse pesasse.',
  'fpsEvery.noReset':
    'Lähtestuskäsku ei saadeta. Pärast seda eemaldage kaamera ja ühendage uuesti, et paigatud pesad rakenduksid.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Saan aru, et vigane kujutis võib jätta kaamera käivitumatuks. Kirjutatakse: {banks}.',
  'fpsEvery.confirm': { one: 'Jah — paika {count} pesa', other: 'Jah — paika {count} pesa' },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: pesa tagasilugemine vastab kirjutatule.',
  'outcome.mismatch': '{bank} — {what}: tagasilugemine EI vasta kirjutatule.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: tagasilugemine tehti, kuid seda ei võrreldud, nii et seda kirjutamist siin ei kontrollita.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'Kaamera kinnitus tagastas oleku {status}.',
  'outcome.wasEmpty':
    '{bank} oli enne seda kirjutamist tühi, nii et ühtegi püsivara üle ei kirjutatud.',
  'outcome.provenVerified':
    'Seni tõestatud: andmed edastati ja kinnitati ning pesa tagasilugemine vastab kirjutatule. POLE tõestatud: et alglaadur valib selle pesa või et kujutis töötab.',
  'outcome.provenCommitted':
    'Seni tõestatud: andmed edastati ja kinnitati. POLE tõestatud: et alglaadur valib selle pesa või et kujutis töötab.',
  'outcome.replug':
    '**NÜÜD EEMALDAGE KAAMERA JA ÜHENDAGE UUESTI.** Lähtestuskäsku ei saadetud, nii et pesa rakendub alles pärast tõelist toite väljalülitamist. Seejärel lugege pesad uuesti: ainult kaamera teatatud versioon ja aktiivne pesa annavad kindla vastuse.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**NÜÜD EEMALDAGE KAAMERA JA ÜHENDAGE UUESTI.** Lähtestuskäsku ei saadetud. Seejärel lugege pesad uuesti.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Esmalt salvestatud allalaadimisena: {file}.',
  'outcome.wayBackOne':
    'Selles olev dekrüptitud fail on tagasitee („Kirjuta dekrüptitud kujutis“ samas pesas).',
  'outcome.wayBackMany':
    'Selles olevad dekrüptitud failid on tagasitee („Kirjuta dekrüptitud kujutis“ igas pesas).',
  'outcome.checkDownloads': 'Otsige seda oma allalaadimiste kaustast.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title':
    '{bank} — paigatud sageduselt {fromHz} Hz sagedusele {toHz} Hz (püsivara {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'Tagasilugemine erineb salvestatud tõmmisest ainult {count} plaanitud baidi, paigakohtade ja summasõna poolest.',
    other:
      'Tagasilugemine erineb salvestatud tõmmisest ainult {count} plaanitud baidi, paigakohtade ja summasõna poolest.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'Tagasilugemine EI erine ainult plaanitud viisil: ootamatuid baite {unexpected}, puuduvaid baite {count}.',
    other:
      'Tagasilugemine EI erine ainult plaanitud viisil: ootamatuid baite {unexpected}, puuduvaid baite {count}.',
  },
  'fpsOutcome.notTaken': 'Tagasilugemist ei tehtud, nii et paika siin ei kontrollita.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Kõik pesad: paigatud {done}/{count}, selles järjekorras: {order}.',
    other: 'Kõik pesad: paigatud {done}/{count}, selles järjekorras: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'Tagasilugemine erineb salvestatud pesast ainult {count} plaanitud baidi poolest.',
    other: 'Tagasilugemine erineb salvestatud pesast ainult {count} plaanitud baidi poolest.',
  },
  'fpsEveryOutcome.notTaken': 'Tagasilugemist ei tehtud.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Peatatud: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Kirjutamata: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Selle kaamera ühtegi pesa ei saa siit kirjutada.',
  'keys.title': 'Kirjutamise võtmed',
  'keys.chain': 'Ahel',
  'keys.chainPlain':
    '2014. aasta avatekstiahel: iga pesa on salvestatud avatekstina, nii et ükski ei sisalda võtit',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Kirjutatakse kujul',
  'keys.writtenPlain': 'kujutis sellisena, nagu see on, ilma võtmeta, mis tahes pesasse',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Ette valmistatud kujul',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Salvestatakse kujul',
  'keys.refused': 'Keeldutud',
  'keys.bootedBank': 'Käivitatud pesa',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank}, milles on {key:nom}',
  'keys.theBootedBank': 'käivitatud pesa',
  'keys.unnamedKey': 'võti, mida leht ei oska nimetada',
  'keys.bootedBanksKey': 'käivitatud pesa võti',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; iga pesa kirjutatakse samamoodi',

  /* "What these buttons do", below the tab. */
  'how.title': 'Mida need nupud teevad',
  'how.read': '**Loe pesad** ja **Tee tõmmis** ei muuda kaameras midagi.',
  'how.flash':
    '**Kirjuta dekrüptitud kujutis** võtab avateksti kujutise, krüptib selle nii, nagu selle pesa püsivara enne ettevalmistust vajab, ja näitab plaani. **Kirjuta toorbaidid** valmistab faili ette täpselt sellisena, nagu see anti. Kumbki ei saada midagi enne, kui kinnitate.',
  'how.ff':
    'Taastepesa {letterR} kirjutamine nõuab lisakinnitust nagu iga taastepesa kirjutamine. **Tühi** pesa (selle päiseaken on täielikult 0xFF, nagu paljude 2014. aasta kaamerate {b} puhul) on olek, mitte viga. Seda kirjutatakse täpselt nagu iga teist pesa.',
  'how.copy':
    '**Taasta täielikust välkmälu varukoopiast** võtab .bin-faili (kogu 4 MB välkmälu tõmmis, näiteks J-Linkiga loetud) või .zip-faili, milles see on (0.x/1.x vahekaardi seansifail või ZIP-fail, mille salvestab vahekaart „Tõmmis ja dekrüptimine 4.x/Nano“ või nupp „Loe kõik selektorid“), lõikab sellest selle pesa välja, dekrüptib selle ja näitab plaani; kui varukoopia näib olevat teise kaamera või teise püsivara oma, öeldakse see plaanis.',
  'how.fps':
    'Pesa real olev **Sea N FPS** muudab selle pesa kujutise kõrgemale kaadrisagedusele ja **Sea N FPS igas pesas** teeb seda ühe kinnitusega igas pesas, kus paik on saadaval, praegu käivitatud pesa viimasena. Pesa kohta, kus see pole saadaval, ütleb leht, miks.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Iga kirjutamine salvestab esmalt oma pesa**: pesa loetakse uuesti ja salvestatakse ühe ZIP-allalaadimisena, mille nimes on aeg, kaamera seerianumber, püsivara, pesa ja kirjutamine (näiteks `{example}`) ning milles on pesa salvestatud kujul, selle dekrüptitud kujutis ja märkus selle kohta, mis iga fail on. Tagasi minekuks kirjutage ZIP-faili dekrüptitud fail nupuga **Kirjuta dekrüptitud kujutis**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Kirjutamine kustutab ühe 64 KB pesa ja programmeerib selle. Alglaadurit aadressil `{address}` ja käivituskonfiguratsiooni siin kunagi ei kirjutata ning aktiivse pesa valimiseks pole juhtelementi. Pesa rakendub alles pärast seda, kui kaamera on eemaldatud ja uuesti ühendatud.',
} satisfies Translation<'slots', 'et'>;
