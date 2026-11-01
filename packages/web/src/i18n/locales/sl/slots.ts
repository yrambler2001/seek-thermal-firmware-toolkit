/**
 * Namespace `slots`, slovenščina (sl), translated from the English source: the firmware-slots tab.
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
  'section.title': 'Delo z režami vdelane programske opreme',
  'section.badge': 'Piše v bliskovni pomnilnik',
  'section.description':
    'Gumb „Preberi reže“ kamero vpraša, kaj poganja, prebere njene tri reže vdelane programske opreme — {a:acc}, {b:acc} in {r:acc} — in pokaže, kaj je v vsaki. Branje in izpis ne spremenita ničesar. Gumb za zapis vpraša, preden se pošlje en sam bajt.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Ta stran lahko piše v bliskovni pomnilnik kamere.** Zapis izbriše eno režo velikosti 64 KB in jo znova programira. Slika, ki je strukturno veljavna, a ne deluje, pusti kamero brez možnosti zagona, zagonski nalagalnik pa nima USB — kamero je mogoče obnoviti le prek SWD/J-Link ali s programatorjem SPI. Najprej izpišite režo in shranite datoteko.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Dejanja z režami',
  'actions.read': 'Preberi reže',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Reže',

  /* Before any read. */
  'empty.connected': 'Pritisnite „Preberi reže“.',
  'empty.disconnected': 'Povežite kamero, nato pritisnite „Preberi reže“.',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Ta izdaja tukaj ni podprta, zato ni bila prebrana nobena reža in nobene ni mogoče zapisati.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Ni prepoznano: ta stran ne more ugotoviti, katero izdajo poganja kamera.',
  'refusal.notIdentified.body':
    'Kamera ni sporočila uporabne različice vdelane programske opreme, zato ni bila prebrana nobena reža in nič ni bilo aktivirano. Ta stran pokriva izdaje {minVersion} in novejše. Izdaje pred {minVersion} so zunaj tega, kar podpira stran z režami, zato se kamera z eno od njih tukaj nikoli ne prebere.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint': 'Če kamera poganja podprto izdajo, se morda šele zaganja. {hint}',
  'refusal.title': 'Zavrnjeno — nič ni bilo aktivirano.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Branje ...',
  'status.readingAgain': 'Ponovno branje rež ...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Prebrano. Prebrana reža: {read}/{count}.',
    two: 'Prebrano. Prebrani reži: {read}/{count}.',
    few: 'Prebrano. Prebrane reže: {read}/{count}.',
    other: 'Prebrano. Prebrane reže: {read}/{count}.',
  },
  'status.unsupported': 'V tej izdaji ni podprto — nobena reža ni bila prebrana.',
  'status.refused': 'Zavrnjeno — nič ni bilo aktivirano. Glejte sporočilo pod dnevnikom.',
  'status.disconnected': 'Naprava je odklopljena — znova preberite reže.',
  'status.newDevice': 'Izbrana je nova naprava — znova preberite reže.',
  'status.dumping': 'Izpisovanje {bank:gen} ...',
  'status.dumped': 'Izpisana je {bank}.',
  'status.readingImage': 'Branje slike ...',
  'status.ready': 'Pripravljeno — preglejte načrt, nato ga zapišite.',
  'status.rejected': 'Zavrnjeno — glejte dnevnik zgoraj.',
  'status.writing': 'Zapisovanje ...',
  'status.patching': 'Popravljanje {bank:gen} ...',
  'status.patchingEvery': 'Popravljanje vseh rež ...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Zapisano, vendar se kontrolno branje ne ujema — glejte rezultat.',
  'status.written.verified': 'Zapisano. Kontrolno branje reže se ujema z zapisanim.',
  'status.written.notCompared': 'Zapisano. Kontrolno branje ni bilo primerjano — glejte rezultat.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Popravljeno, vendar se kontrolno branje ne razlikuje samo tako, kot je bilo načrtovano — glejte rezultat.',
  'status.patched.ok': 'Popravljeno. Kontrolno branje reže je tako, kot je bilo načrtovano.',
  'status.patched.unchecked': 'Popravljeno. Kontrolno branje ni bilo preverjeno — glejte rezultat.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Ustavljeno pri {bank:loc} — popravljena je {count} reža; glejte rezultat.',
    two: 'Ustavljeno pri {bank:loc} — popravljeni sta {count} reži; glejte rezultat.',
    few: 'Ustavljeno pri {bank:loc} — popravljene so {count} reže; glejte rezultat.',
    other: 'Ustavljeno pri {bank:loc} — popravljenih je {count} rež; glejte rezultat.',
  },
  'status.every.unchecked': {
    one: 'Popravljena je {count} reža, vendar eno od kontrolnih branj ni bilo preverjeno, kot je bilo načrtovano — glejte rezultat.',
    two: 'Popravljeni sta {count} reži, vendar eno od kontrolnih branj ni bilo preverjeno, kot je bilo načrtovano — glejte rezultat.',
    few: 'Popravljene so {count} reže, vendar eno od kontrolnih branj ni bilo preverjeno, kot je bilo načrtovano — glejte rezultat.',
    other:
      'Popravljenih je {count} rež, vendar eno od kontrolnih branj ni bilo preverjeno, kot je bilo načrtovano — glejte rezultat.',
  },
  'status.every.ok': {
    one: 'Popravljena je {count} reža. Kontrolno branje je tako, kot je bilo načrtovano.',
    two: 'Popravljeni sta {count} reži. Kontrolno branje vsake je tako, kot je bilo načrtovano.',
    few: 'Popravljene so {count} reže. Kontrolno branje vsake je tako, kot je bilo načrtovano.',
    other: 'Popravljenih je {count} rež. Kontrolno branje vsake je tako, kot je bilo načrtovano.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Preklicano — nič ni bilo zapisano.',
  'status.cancelled.one':
    'Preklicano po tem, ko je bila poslana potrditev zapisa v {bank:acc} — reža je morda delno zapisana. Preberite jo, preden se zanesete nanjo.',
  'status.cancelled.many':
    'Preklicano po pošiljanju potrditev zapisa v {banks:acc} — vsaka od teh rež je morda delno zapisana. Preberite vsako, preden se zanesete nanjo.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Najprej povežite kamero.',
  'gate.busy': 'Teče druga operacija — počakajte, da se konča.',
  'gate.readFirst': 'Najprej preberite reže.',
  'gate.cameraRefused':
    'V to kamero od tukaj ni mogoče pisati iz razloga, navedenega v pasici zgoraj. Nič se ne pošlje.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Ni prebrano: {reason}. Pred zapisom znova preberite reže.',
  'gate.notReadNoReason':
    'Ni prebrano: ta reža ni bila prebrana. Pred zapisom znova preberite reže.',
  'gate.emptyNotWritable': 'Ta reža je prazna in je v tej izdaji ni mogoče zapisati: {reason}',
  'gate.noSuchBank': 'Ta izdaja nima takšne reže.',

  /* The bank table. */
  'table.caption':
    'Vse reže vdelane programske opreme v tej kameri — {a}, {b} in {r} — kot so bile prebrane in preverjene v brskalniku',
  'table.col.bank': 'Reža',
  'table.col.firmware': 'Vdelana programska oprema',
  'table.col.size': 'Velikost',
  'table.col.key': 'Ključ',
  'table.col.bootable': 'Zagonska',
  'table.col.sha': 'SHA-256 nešifrirane slike',
  'table.col.actions': 'Dejanja',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'ni prebrano — {reason}',
  'table.notReadNoReason': 'ni prebrano — reža ni bila prebrana',
  /* A badge: the bank holds no image. */
  'table.empty': 'prazna',
  'table.emptyNote':
    'Ni slike: okno glave te reže se bere kot sam 0xFF, zato se iz nje nič ne dešifrira, zapis vanjo pa ne prepiše nobene vdelane programske opreme.',
  /* {reason} is core's. */
  'table.emptyWritable': 'Vanjo je mogoče pisati.',
  'table.emptyNotWritable': 'V tej izdaji je ni mogoče zapisati: {reason}',
  'table.unknownVersion': 'neznana različica',
  /* {id} is the image id in hex. */
  'table.imageId': 'slika {id}',
  'table.noImage': 'ni slike',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'reža {size} B',
  'table.imageSize': 'slika {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'brez (nešifrirano)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— ničesar za zagon',
  'table.boot.bootable': 'zagonska — zagonski nalagalnik jo sprejme',
  'table.boot.notBootable': 'ni zagonska — pri zagonu se preskoči',
  'table.boot.recoveryOnly':
    'samo za obnovitev — {letterR} se zažene, ko {letterA} in {letterB} ne vsebujeta ničesar, kar bi zagonski nalagalnik sprejel (izmerjeno na kameri za starejšo obliko te slike); ali se ta oblika zažene, ni preizkušeno',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'neznano — {why}',
  /* The row's buttons. */
  'table.dump': 'Izpiši',
  'table.flashPlain': 'Zapiši dešifrirano sliko…',
  'table.flashRaw': 'Zapiši surove bajte…',
  'table.restore': 'Obnovi iz polne varnostne kopije (.bin ali .zip)…',
  'table.makeFps': 'Nastavi {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Kopiraj v {bank:acc}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: onemogočeno',
  'table.copyNote':
    'Kopira vdelano programsko opremo iz te reže, kot jo je dešifriralo to branje, v režo, ki jo izberete, ne glede na to, kaj je v njej zdaj. Načrt pregledate, preden se karkoli pošlje.',
  'table.restoreNote':
    'Izberite polno varnostno kopijo bliskovnega pomnilnika: datoteko .bin (celotno 4 MB sliko bliskovnega pomnilnika, na primer branje prek J-Link) ali .zip, ki jo vsebuje (datoteko izvedbe zavihka 0.x/1.x ali zip, ki ga shrani „Izpis in dešifriranje 4.x/Nano“ ali „Izpiši vse selektorje“). Ta reža se izreže iz nje, dešifrira in prikaže kot načrt, preden se karkoli pošlje.',
  'table.fpsNote':
    'S spremembo bajtov poskrbi, da ta reža namesto pri {fromHz} Hz teče pri {toHz} Hz. Reža se najprej shrani v prenos zip, dešifrirana datoteka v njem pa je pot nazaj.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery': '{booted} in obnovitvena: zapis vanjo zahteva dodatno potrditev.',
  'table.risk.booted': '{booted}: zapis vanjo zahteva dodatno potrditev.',
  'table.risk.recovery': '{bank}: zapis vanjo zahteva dodatno potrditev.',
  'table.risk.bootUnnamed':
    'Kamera ne pove, iz katere reže se zažene: zapis v to režo zahteva dodatno potrditev.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Popravek hitrosti sličic je uporabljen: ta slika teče pri {hz} Hz.',
  'fps.earlierPatch':
    'Popravek hitrosti sličic ni na voljo: ta reža vsebuje starejši popravek za {hz} Hz brez rešitve za USB. Obnovite tovarniško sliko, nato uporabite „Nastavi {hz} FPS“.',
  'fps.atRate': 'Popravek hitrosti sličic ni potreben: ta izdaja že teče pri {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Popravek hitrosti sličic ni na voljo: {reason}',
  'fps.readFirst': 'najprej preberite reže — popravek se načrtuje iz slike same reže',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Vse reže',
  'everyBank.make': 'Nastavi {hz} FPS v vseh režah',
  'everyBank.faster': 'Pospeši vse reže',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Popravi {order:acc} z eno potrditvijo; vsaka se najprej shrani v en prenos zip in nato kontrolno prebere.',
  'everyBank.noteBootedLast':
    'Popravi {order:acc} z eno potrditvijo, pri čemer je reža, iz katere se kamera zdaj zažene, zadnja; vsaka se najprej shrani v en prenos zip in nato kontrolno prebere.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': 'slika {bank:gen}',
  'what.restore': '{bank:nom} iz datoteke {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Pripravljeno za {bank:acc} na naslovu {address}',
  'preview.file': 'Datoteka',
  'preview.source': 'Slika vzeta iz',
  'preview.target': 'Cilj',
  'preview.targetEmpty':
    '{bank} je prazna: ne vsebuje slike, zato ta zapis ne prepiše nobene vdelane programske opreme',
  'preview.readAs': 'Prebrano kot',
  'preview.readAs.ff': 'dešifrirana slika {version} FF',
  'preview.readAs.plain': 'dešifrirana slika',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'surovi bajti',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Priprava',
  'preview.key': 'Ključ',
  'preview.payload': 'Vsebina prenosa',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} B v {count} kosu po največ {chunk} B',
    two: '{size} B v {count} kosih po največ {chunk} B',
    few: '{size} B v {count} kosih po največ {chunk} B',
    other: '{size} B v {count} kosih po največ {chunk} B',
  },
  'preview.checksum': 'Kontrolna vsota prenosa',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Shranjeno po zapisu',
  'preview.storedNotPredicted': 'ni napovedano — preverjanje je kontrolno branje',
  'preview.storedPredicted': 'napovedano {size} B',
  'preview.storedKeyB': 'napovedano {size} B — slika XOR ključ B, ne sama vsebina prenosa',
  'preview.savedFirst': 'Najprej shranjeno',
  'preview.compareCaption': 'Kaj se spremeni v {bank:loc}',
  'preview.col.field': 'Polje',
  'preview.col.now': 'Zdaj',
  'preview.col.after': 'Po zapisu',
  'preview.readFirst': 'Preberite pred zapisom:',
  /* {note} is core's note about this write. */
  'preview.note': 'Opomba: {note}',
  'preview.nothingSent':
    'Kameri še ni bilo poslano nič. Zapis to vsebino prenese v {bank:acc} in jo potrdi.',
  'preview.toolbar': 'Dejanja zapisa za {bank:acc}',
  'preview.write': 'Zapiši v {bank:acc}…',
  'preview.discard': 'Zavrzi',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Zapis v {bank:acc} na naslovu {address}: {what}?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Zapis zamenja vdelano programsko opremo, ki jo kamera zdaj poganja. Če nova slika ne deluje, se kamera morda sploh ne bo zagnala.',
  'writeConfirm.recovery':
    '{bank} je obnovitvena reža, zadnja rezervna kopija, h kateri se zateče zagonski nalagalnik. Zapis pusti kamero brez te kopije, dokler je ne obnovite.',
  'writeConfirm.bootUnnamed':
    'Kamera ne pove, iz katere reže se zažene, zato se {bank:nom} obravnava kot reža, iz katere se zdaj zažene. Zapis lahko zamenja vdelano programsko opremo, ki jo kamera poganja.',
  'writeConfirm.empty':
    '{bank} je prazna: ne vsebuje slike, zato se ne prepiše nobena vdelana programska oprema.',
  'writeConfirm.eraseEmpty':
    'Zapis kljub temu izbriše blok velikosti 64 KB v bliskovnem pomnilniku kamere na mestu {bank:gen} (ki je že prazen) in ga programira.',
  'writeConfirm.erase':
    'S tem se izbriše blok velikosti 64 KB v bliskovnem pomnilniku kamere in se na mestu {bank:gen} znova programira.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine': 'Ključ za zapis slike: {key}. Vse druge reže se zapišejo na enak način.',
  'writeConfirm.backup':
    'Preden se karkoli pošlje, se {bank:nom} znova prebere in shrani kot en prenos zip: {file}. Poiščite ga v mapi s prenosi.',
  'writeConfirm.noReset':
    'Ponastavitev se ne pošlje. Nato kamero odklopite in znova priklopite, da reža začne veljati.',
  'writeConfirm.noUsbRecovery':
    'Če slika ne deluje, kamere ni mogoče obnoviti prek USB — le prek SWD/J-Link ali s programatorjem SPI.',
  'writeConfirm.ackUnnamed':
    'Razumem, da kamera ne pove, iz katere reže se zažene, zato se ta obravnava kot zagnana, in da lahko slaba slika kamero pusti brez možnosti zagona.',
  'writeConfirm.confirm': 'Da — zapiši v {bank:acc}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Razumem, da je to reža, iz katere se kamera zdaj zažene, in da lahko slaba slika kamero pusti brez možnosti zagona.',
  'ack.recovery':
    'Razumem, da je to obnovitvena reža in da slaba slika kamero pusti brez zadnje rezervne kopije.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Želite, da {bank:nom} teče pri {hz} FPS?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted':
    '{bootsNow}. Popravljena slika zamenja vdelano programsko opremo, ki jo zdaj poganja.',
  'fpsConfirm.recovery':
    '{bank} je obnovitvena reža, zadnja rezervna kopija, h kateri se zateče zagonski nalagalnik.',
  'fpsConfirm.what':
    '{bank} vsebuje vdelano programsko opremo {version}, s tem pa bo njena slika tekla pri {toHz} Hz namesto pri {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(neznana)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'Popravek spremeni {count} bajt slike in besedo kontrolne vsote za sprejem, tako da vsota, ki jo preverja zagonski nalagalnik, ostane enaka. Para ključev se ne dotakne.',
    two: 'Popravek spremeni {count} bajta slike in besedo kontrolne vsote za sprejem, tako da vsota, ki jo preverja zagonski nalagalnik, ostane enaka. Para ključev se ne dotakne.',
    few: 'Popravek spremeni {count} bajte slike in besedo kontrolne vsote za sprejem, tako da vsota, ki jo preverja zagonski nalagalnik, ostane enaka. Para ključev se ne dotakne.',
    other:
      'Popravek spremeni {count} bajtov slike in besedo kontrolne vsote za sprejem, tako da vsota, ki jo preverja zagonski nalagalnik, ostane enaka. Para ključev se ne dotakne.',
  },
  'fpsConfirm.wayBack':
    'Dešifrirana datoteka v tem zipu je pot nazaj: če želite popravek razveljaviti, jo z gumbom „Zapiši dešifrirano sliko“ zapišite v {bank:acc}.',
  'fpsConfirm.noReset':
    'Ponastavitev se ne pošlje. Nato kamero odklopite in znova priklopite, da popravljena reža začne veljati.',
  'fpsConfirm.ackUnnamed':
    'Razumem, da kamera ne pove, iz katere reže se zažene, zato se ta obravnava kot zagnana.',
  'fpsConfirm.confirm': 'Da — popravi {bank:acc}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Želite, da vse reže tečejo pri {hz} FPS?',
  'fpsEvery.titleMixed': {
    one: 'Želite popraviti hitrost sličic v {count} reži?',
    two: 'Želite popraviti hitrost sličic v {count} režah?',
    few: 'Želite popraviti hitrost sličic v {count} režah?',
    other: 'Želite popraviti hitrost sličic v {count} režah?',
  },
  'fpsEvery.intro': {
    one: 'S tem se popravi {count} reža, za katero je popravek na voljo (vdelana programska oprema {version}):',
    two: 'S tem se popravita {count} reži, za kateri je popravek na voljo (vdelana programska oprema {version}):',
    few: 'S tem se popravijo {count} reže, za katere je popravek na voljo (vdelana programska oprema {version}):',
    other:
      'S tem se popravi {count} rež, za katere je popravek na voljo (vdelana programska oprema {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (reža, iz katere se kamera zdaj zažene, in obnovitvena reža)',
  'fpsEvery.role.booted': '{bank} (reža, iz katere se kamera zdaj zažene)',
  'fpsEvery.role.recovery': '{bank} (obnovitvena reža, zadnja rezervna kopija)',
  'fpsEvery.role.bootUnnamed': '{bank} (kamera ne pove, iz katere reže se zažene)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: {fromHz} Hz → {toHz} Hz, {count} bajt in beseda kontrolne vsote za sprejem.',
    two: '{bank}: {fromHz} Hz → {toHz} Hz, {count} bajta in beseda kontrolne vsote za sprejem.',
    few: '{bank}: {fromHz} Hz → {toHz} Hz, {count} bajti in beseda kontrolne vsote za sprejem.',
    other: '{bank}: {fromHz} Hz → {toHz} Hz, {count} bajtov in beseda kontrolne vsote za sprejem.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Brez sprememb: {others}',
  'fpsEvery.orderOne': 'Zapiše samo {bank:acc} in jo kontrolno prebere.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Vrstni red zapisovanja: {order:nom}. Vsaka reža se kontrolno prebere pred naslednjo, prva napaka pa ustavi preostale.',
  'fpsEvery.orderBootedLast':
    'Vrstni red zapisovanja: {order:nom}. Reža, iz katere se kamera zdaj zažene, je zadnja, tako da se ob napaki postopek ustavi pred njo. Vsaka reža se kontrolno prebere pred naslednjo, prva napaka pa ustavi preostale.',
  'fpsEvery.wayBack':
    'Dešifrirane datoteke v tem zipu so pot nazaj: če želite razveljaviti popravek reže, z gumbom „Zapiši dešifrirano sliko“ zapišite njeno datoteko v to režo.',
  'fpsEvery.noReset':
    'Ponastavitev se ne pošlje. Nato kamero odklopite in znova priklopite, da popravljena vdelana programska oprema začne veljati.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Razumem, da ta zapis zajame: {banks}, in da lahko slaba slika kamero pusti brez možnosti zagona.',
  'fpsEvery.confirm': {
    one: 'Da — popravi {count} režo',
    two: 'Da — popravi {count} reži',
    few: 'Da — popravi {count} reže',
    other: 'Da — popravi {count} rež',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: kontrolno branje reže se ujema z zapisanim.',
  'outcome.mismatch': '{bank} — {what}: kontrolno branje se NE ujema z zapisanim.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: kontrolno branje je bilo opravljeno, a ne primerjano, zato ta zapis tukaj ni preverjen.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'Potrditev zapisa v kameri je vrnila stanje {status}.',
  'outcome.wasEmpty':
    '{bank} je bila pred tem zapisom prazna, zato ni bila prepisana nobena vdelana programska oprema.',
  'outcome.provenVerified':
    'Doslej dokazano: vsebina je bila prenesena in potrjena, kontrolno branje reže pa se ujema z zapisanim. NI dokazano: da bo zagonski nalagalnik izbral to režo, niti da slika deluje.',
  'outcome.provenCommitted':
    'Doslej dokazano: vsebina je bila prenesena in potrjena. NI dokazano: da bo zagonski nalagalnik izbral to režo, niti da slika deluje.',
  'outcome.replug':
    '**ZDAJ KAMERO ODKLOPITE IN ZNOVA PRIKLOPITE.** Ponastavitev ni bila poslana, zato reža začne veljati šele po pravem izklopu in vklopu. Nato znova preberite reže: edino, kar to dokončno potrdi, sta različica in aktivna reža, ki ju sporoči kamera.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**ZDAJ KAMERO ODKLOPITE IN ZNOVA PRIKLOPITE.** Ponastavitev ni bila poslana. Nato znova preberite reže.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Najprej shranjeno kot prenos: {file}.',
  'outcome.wayBackOne':
    'Dešifrirana datoteka v njem je pot nazaj („Zapiši dešifrirano sliko“ v isto režo).',
  'outcome.wayBackMany':
    'Dešifrirane datoteke v njem so pot nazaj („Zapiši dešifrirano sliko“ v vsako režo).',
  'outcome.checkDownloads': 'Poiščite ga v mapi s prenosi.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title':
    '{bank} — popravljena: {fromHz} Hz → {toHz} Hz (vdelana programska oprema {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'Kontrolno branje se od shranjenega izpisa razlikuje samo v {count} načrtovanem bajtu, na mestih popravka in v besedi vsote.',
    two: 'Kontrolno branje se od shranjenega izpisa razlikuje samo v {count} načrtovanih bajtih, na mestih popravka in v besedi vsote.',
    few: 'Kontrolno branje se od shranjenega izpisa razlikuje samo v {count} načrtovanih bajtih, na mestih popravka in v besedi vsote.',
    other:
      'Kontrolno branje se od shranjenega izpisa razlikuje samo v {count} načrtovanih bajtih, na mestih popravka in v besedi vsote.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'Kontrolno branje se NE razlikuje samo tako, kot je bilo načrtovano: nepričakovani bajti: {unexpected}, manjkajoči bajti: {count}.',
    two: 'Kontrolno branje se NE razlikuje samo tako, kot je bilo načrtovano: nepričakovani bajti: {unexpected}, manjkajoči bajti: {count}.',
    few: 'Kontrolno branje se NE razlikuje samo tako, kot je bilo načrtovano: nepričakovani bajti: {unexpected}, manjkajoči bajti: {count}.',
    other:
      'Kontrolno branje se NE razlikuje samo tako, kot je bilo načrtovano: nepričakovani bajti: {unexpected}, manjkajoči bajti: {count}.',
  },
  'fpsOutcome.notTaken': 'Kontrolno branje ni bilo opravljeno, zato popravek tukaj ni preverjen.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Vse reže — popravljeno: {done} od {count}, v tem vrstnem redu: {order}.',
    two: 'Vse reže — popravljeno: {done} od {count}, v tem vrstnem redu: {order}.',
    few: 'Vse reže — popravljeno: {done} od {count}, v tem vrstnem redu: {order}.',
    other: 'Vse reže — popravljeno: {done} od {count}, v tem vrstnem redu: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'Kontrolno branje se od shranjene reže razlikuje samo v {count} načrtovanem bajtu.',
    two: 'Kontrolno branje se od shranjene reže razlikuje samo v {count} načrtovanih bajtih.',
    few: 'Kontrolno branje se od shranjene reže razlikuje samo v {count} načrtovanih bajtih.',
    other: 'Kontrolno branje se od shranjene reže razlikuje samo v {count} načrtovanih bajtih.',
  },
  'fpsEveryOutcome.notTaken': 'Kontrolno branje ni bilo opravljeno.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Ustavljeno: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Ni zapisano: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Nobene reže te kamere ni mogoče zapisati od tukaj.',
  'keys.title': 'Ključi za zapise',
  'keys.chain': 'Veriga',
  'keys.chainPlain':
    'nešifrirana veriga iz leta 2014: vse reže so shranjene nešifrirane, zato nobena ne vsebuje ključa',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Zapisano kot',
  'keys.writtenPlain': 'slika, kakršna je, brez ključa, v katero koli režo',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Pripravljeno kot',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Shranjeno kot',
  'keys.refused': 'Zavrnjeno',
  'keys.bootedBank': 'Zagnana reža',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank} vsebuje {key:acc}',
  'keys.theBootedBank': 'zagnana reža',
  'keys.unnamedKey': 'ključ, ki ga stran ne zna poimenovati',
  'keys.bootedBanksKey': 'ključ zagnane reže',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; vse reže se zapišejo na enak način',

  /* "What these buttons do", below the tab. */
  'how.title': 'Kaj počnejo ti gumbi',
  'how.read': '**Preberi reže** in **Izpiši** v kameri ne spremenita ničesar.',
  'how.flash':
    '**Zapiši dešifrirano sliko** vzame nešifrirano sliko, jo pred pripravo šifrira tako, kot to zahteva vdelana programska oprema te reže, in pokaže načrt. **Zapiši surove bajte** pripravi datoteko natanko tako, kot je podana. Nobeden od obeh ne pošlje ničesar, dokler ne potrdite.',
  'how.ff':
    'Zapis v režo {letterR} zahteva dodatno potrditev kot vsak zapis v obnovitveno režo. **Prazna** reža (njeno okno glave se bere kot sam 0xFF, kot pri {b:loc} mnogih kamer iz leta 2014) je stanje, ne napaka. Zapiše se natanko tako kot vsaka druga reža.',
  'how.copy':
    '**Obnovi iz polne varnostne kopije** vzame datoteko .bin (celotno 4 MB sliko bliskovnega pomnilnika, na primer branje prek J-Link) ali .zip, ki jo vsebuje (datoteko izvedbe zavihka 0.x/1.x ali zip, ki ga shrani „Izpis in dešifriranje 4.x/Nano“ ali „Izpiši vse selektorje“), iz nje izreže to režo, jo dešifrira in pokaže načrt; če je varnostna kopija videti kot kopija druge kamere ali druge vdelane programske opreme, načrt to pove.',
  'how.fps':
    '**Nastavi N FPS** v vrstici reže spremeni sliko te reže na višjo hitrost sličic, **Nastavi N FPS v vseh režah** pa to z eno potrditvijo naredi v vseh režah, za katere je popravek na voljo, pri čemer je reža, iz katere se kamera zdaj zažene, zadnja. Za režo, kjer popravek ni na voljo, stran pove zakaj.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Vsak zapis najprej shrani svojo režo**: reža se znova prebere in shrani kot en prenos zip, poimenovan s časom, serijsko številko kamere, vdelano programsko opremo, režo in zapisom (na primer `{example}`), ki vsebuje režo, kot je shranjena, njeno dešifrirano sliko in opombo, kaj je posamezna datoteka. Za vrnitev zapišite dešifrirano datoteko iz zipa z gumbom **Zapiši dešifrirano sliko**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Zapis izbriše eno režo velikosti 64 KB in jo znova programira. Zagonski nalagalnik na `{address}` in zagonska konfiguracija se tukaj nikoli ne zapišeta, izbire aktivne reže pa ni. Reža začne veljati šele, ko kamero odklopite in znova priklopite.',
} satisfies Translation<'slots', 'sl'>;
