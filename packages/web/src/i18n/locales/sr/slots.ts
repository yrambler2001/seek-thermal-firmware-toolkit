/**
 * Namespace `slots`, srpski (sr), translated from the English source: the firmware-slots tab.
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
  'section.title': 'Rad sa slotovima firmvera',
  'section.badge': 'Upisuje u fleš',
  'section.description':
    '„Pročitaj slotove“ pita kameru koji firmver radi, čita njena tri slota firmvera — {a}, {b} i {r} — i pokazuje šta svaki sadrži. Čitanje i iščitavanje ništa ne menjaju. Dugme za upis pita pre nego što se pošalje bilo koji bajt.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Ova stranica može da upisuje u fleš kamere.** Upis briše jedan slot od 64 KB i programira ga. Slika koja je strukturno ispravna, ali ne radi, ostavlja kameru bez mogućnosti pokretanja, a butloder nema USB — oporaviti je mogu samo SWD/J-Link ili SPI programator. Prvo iščitajte slot i sačuvajte datoteku.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Radnje sa slotovima',
  'actions.read': 'Pročitaj slotove',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Slotovi',

  /* Before any read. */
  'empty.connected': 'Pritisnite „Pročitaj slotove“.',
  'empty.disconnected': 'Povežite kameru, pa pritisnite „Pročitaj slotove“.',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Ovo izdanje ovde nije podržano, pa nijedan slot nije pročitan i nijedan ne može da se upiše.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Nije prepoznato: ova stranica ne može da utvrdi koje izdanje kamera pokreće.',
  'refusal.notIdentified.body':
    'Kamera nije dala upotrebljivu verziju firmvera, pa nijedan slot nije pročitan i ništa nije aktivirano. Ova stranica pokriva izdanja {minVersion} i novija. Izdanja pre {minVersion} su van onoga što stranica sa slotovima podržava, pa se kamera sa nekim od njih ovde nikada ne čita.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Ako kamera radi sa podržanim izdanjem, možda se tek pokreće. {hint}',
  'refusal.title': 'Odbijeno — ništa nije aktivirano.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Čitanje ...',
  'status.readingAgain': 'Ponovno čitanje slotova ...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Pročitano. Pročitani slotovi: {read}/{count}.',
    few: 'Pročitano. Pročitani slotovi: {read}/{count}.',
    other: 'Pročitano. Pročitani slotovi: {read}/{count}.',
  },
  'status.unsupported': 'Nije podržano na ovom izdanju — nijedan slot nije pročitan.',
  'status.refused': 'Odbijeno — ništa nije aktivirano. Pogledajte poruku ispod dnevnika.',
  'status.disconnected': 'Veza sa uređajem je prekinuta — ponovo pročitajte slotove.',
  'status.newDevice': 'Izabran je novi uređaj — ponovo pročitajte slotove.',
  'status.dumping': 'Iščitavanje {bank:gen} ...',
  'status.dumped': 'Iščitan je {bank}.',
  'status.readingImage': 'Čitanje slike ...',
  'status.ready': 'Spremno — pregledajte plan, pa ga upišite.',
  'status.rejected': 'Odbijeno — pogledajte dnevnik iznad.',
  'status.writing': 'Upisivanje ...',
  'status.patching': 'Krpljenje {bank:gen} ...',
  'status.patchingEvery': 'Krpljenje svih slotova ...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Upisano, ali se kontrolno čitanje ne poklapa — pogledajte rezultat.',
  'status.written.verified': 'Upisano. Slot se pri kontrolnom čitanju poklapa sa upisanim.',
  'status.written.notCompared': 'Upisano. Kontrolno čitanje nije upoređeno — pogledajte rezultat.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Zakrpljeno, ali se kontrolno čitanje ne razlikuje samo onako kako je planirano — pogledajte rezultat.',
  'status.patched.ok': 'Zakrpljeno. Kontrolno čitanje odgovara planu.',
  'status.patched.unchecked': 'Zakrpljeno. Kontrolno čitanje nije provereno — pogledajte rezultat.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Zaustavljeno kod {bank:gen} — zakrpljen je {count} slot; pogledajte rezultat.',
    few: 'Zaustavljeno kod {bank:gen} — zakrpljena su {count} slota; pogledajte rezultat.',
    other: 'Zaustavljeno kod {bank:gen} — zakrpljeno je {count} slotova; pogledajte rezultat.',
  },
  'status.every.unchecked': {
    one: 'Zakrpljen je {count} slot, ali jedno kontrolno čitanje nije provereno kako je planirano — pogledajte rezultat.',
    few: 'Zakrpljena su {count} slota, ali jedno kontrolno čitanje nije provereno kako je planirano — pogledajte rezultat.',
    other:
      'Zakrpljeno je {count} slotova, ali jedno kontrolno čitanje nije provereno kako je planirano — pogledajte rezultat.',
  },
  'status.every.ok': {
    one: 'Zakrpljen je {count} slot. Kontrolno čitanje odgovara planu.',
    few: 'Zakrpljena su {count} slota. Kontrolno čitanje svakog od njih odgovara planu.',
    other: 'Zakrpljeno je {count} slotova. Kontrolno čitanje svakog od njih odgovara planu.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Otkazano — ništa nije upisano.',
  'status.cancelled.one':
    'Otkazano posle slanja potvrde upisa u {bank:acc} — slot je možda delimično upisan. Pročitajte ga pre nego što se na njega oslonite.',
  'status.cancelled.many':
    'Otkazano posle slanja potvrda upisa u {banks:acc} — svaki je možda delimično upisan. Pročitajte ih pre nego što se na njih oslonite.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Prvo povežite kameru.',
  'gate.busy': 'Druga operacija je u toku — sačekajte da se završi.',
  'gate.readFirst': 'Prvo pročitajte slotove.',
  'gate.cameraRefused':
    'U ovu kameru ne može da se upisuje odavde, iz razloga navedenog u obaveštenju iznad. Ništa se ne šalje.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Nije pročitan: {reason}. Ponovo pročitajte slotove pre upisa u njega.',
  'gate.notReadNoReason':
    'Nije pročitan: ovaj slot nije pročitan. Ponovo pročitajte slotove pre upisa u njega.',
  'gate.emptyNotWritable': 'Ovaj slot je prazan i ne može da se upiše na ovom izdanju: {reason}',
  'gate.noSuchBank': 'Ovo izdanje nema takav slot.',

  /* The bank table. */
  'table.caption':
    'Svaki slot firmvera na ovoj kameri — {a}, {b} i {r} — pročitan i proveren u pregledaču',
  'table.col.bank': 'Slot',
  'table.col.firmware': 'Firmver',
  'table.col.size': 'Veličina',
  'table.col.key': 'Ključ',
  'table.col.bootable': 'Pokreće se',
  'table.col.sha': 'SHA-256 nešifrovane slike',
  'table.col.actions': 'Radnje',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'nije pročitan — {reason}',
  'table.notReadNoReason': 'nije pročitan — slot nije pročitan',
  /* A badge: the bank holds no image. */
  'table.empty': 'prazan',
  'table.emptyNote':
    'Nema slike: prozor zaglavlja ovog slota čita se kao sve 0xFF, pa se iz njega ništa ne dešifruje, a upis u njega ne prepisuje nikakav firmver.',
  /* {reason} is core's. */
  'table.emptyWritable': 'Može da se upiše.',
  'table.emptyNotWritable': 'Ne može da se upiše na ovom izdanju: {reason}',
  'table.unknownVersion': 'nepoznata verzija',
  /* {id} is the image id in hex. */
  'table.imageId': 'slika {id}',
  'table.noImage': 'nema slike',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'slot od {size} B',
  'table.imageSize': 'slika od {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'nema (nešifrovano)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— nema šta da se pokrene',
  'table.boot.bootable': 'pokreće se — butloder ga prihvata',
  'table.boot.notBootable': 'ne pokreće se — preskače se pri pokretanju',
  'table.boot.recoveryOnly':
    'samo za oporavak — {letterR} se pokreće kada {letterA} i {letterB} ne sadrže ništa što butloder prihvata (izmereno na kameri za raniji oblik ove slike); da li se ovaj oblik pokreće, nije testirano',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'nepoznato — {why}',
  /* The row's buttons. */
  'table.dump': 'Iščitaj',
  'table.flashPlain': 'Upiši dešifrovanu sliku…',
  'table.flashRaw': 'Upiši sirove bajtove…',
  'table.restore': 'Vrati iz potpune rezervne kopije fleša (.bin ili .zip)…',
  'table.makeFps': 'Ubrzaj na {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Kopiraj u {bank:acc}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: isključeno',
  'table.copyNote':
    'Kopira firmver koji ovaj slot sadrži, onako kako ga je ovo čitanje dešifrovalo, u slot koji izaberete, šta god taj slot sada sadržao. Plan pregledate pre nego što se bilo šta pošalje.',
  'table.restoreNote':
    'Izaberite potpunu rezervnu kopiju fleša: .bin (celu sliku fleša od 4 MB, na primer čitanje preko J-Linka) ili .zip koji je sadrži (datoteku sesije sa kartice 0.x/1.x ili zip koji sačuvaju „Iščitavanje i dešifrovanje 4.x/Nano“ ili „Iščitaj sve selektore“). Ovaj slot se iseca iz nje, dešifruje i prikazuje kao plan pre nego što se bilo šta pošalje.',
  'table.fpsNote':
    'Podiže ovaj slot sa {fromHz} Hz na {toHz} Hz izmenom njegovih bajtova. Slot se prvo čuva, u zip preuzimanju, a dešifrovana datoteka u njemu je put nazad.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery': '{booted}, i slot za oporavak: upis u njega traži dodatnu potvrdu.',
  'table.risk.booted': '{booted}: upis u njega traži dodatnu potvrdu.',
  'table.risk.recovery': '{bank}: upis u njega traži dodatnu potvrdu.',
  'table.risk.bootUnnamed':
    'Kamera ne navodi iz kog slota se pokreće: upis u njega traži dodatnu potvrdu.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Zakrpa brzine kadrova je primenjena: ova slika radi na {hz} Hz.',
  'fps.earlierPatch':
    'Zakrpa brzine kadrova nije ponuđena: ovaj slot sadrži raniju zakrpu za {hz} Hz bez USB ispravke. Vratite originalnu sliku, pa kliknite „Ubrzaj na {hz} FPS“.',
  'fps.atRate': 'Zakrpa brzine kadrova nije potrebna: ovo izdanje već radi na {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Zakrpa brzine kadrova nije ponuđena: {reason}',
  'fps.readFirst': 'prvo pročitajte slotove — zakrpa se planira iz sopstvene slike slota',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Svi slotovi',
  'everyBank.make': 'Ubrzaj na {hz} FPS u svim slotovima',
  'everyBank.faster': 'Ubrzaj sve slotove',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Krpi {order:acc} uz jednu potvrdu; svaki se prvo čuva, u jednom zip preuzimanju, i kontrolno čita.',
  'everyBank.noteBootedLast':
    'Krpi {order:acc} uz jednu potvrdu, a slot iz kog se kamera sada pokreće poslednji; svaki se prvo čuva, u jednom zip preuzimanju, i kontrolno čita.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': 'slika {bank:gen}',
  'what.restore': '{bank:nom} iz {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Pripremljeno za {bank:acc} na adresi {address}',
  'preview.file': 'Datoteka',
  'preview.source': 'Slika uzeta iz',
  'preview.target': 'Cilj',
  'preview.targetEmpty':
    '{bank} je prazan: ne sadrži sliku, pa ovaj upis ne prepisuje nikakav firmver',
  'preview.readAs': 'Pročitano kao',
  'preview.readAs.ff': 'dešifrovana slika {version} FF',
  'preview.readAs.plain': 'dešifrovana slika',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'sirovi bajtovi',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Priprema',
  'preview.key': 'Ključ',
  'preview.payload': 'Podaci',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} B u {count} delu od najviše {chunk} B',
    few: '{size} B u {count} dela od najviše {chunk} B',
    other: '{size} B u {count} delova od najviše {chunk} B',
  },
  'preview.checksum': 'Kontrolni zbir prenosa',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Sačuvano posle upisa',
  'preview.storedNotPredicted': 'nije predviđeno — kontrolno čitanje je provera',
  'preview.storedPredicted': 'predviđeno {size} B',
  'preview.storedKeyB': 'predviđeno {size} B — slika XOR ključ B, a ne sami podaci',
  'preview.savedFirst': 'Prvo sačuvano',
  'preview.compareCaption': 'Šta se menja u {bank:loc}',
  'preview.col.field': 'Polje',
  'preview.col.now': 'Sada',
  'preview.col.after': 'Posle upisa',
  'preview.readFirst': 'Pročitajte pre upisa:',
  /* {note} is core's note about this write. */
  'preview.note': 'Napomena: {note}',
  'preview.nothingSent':
    'Kameri još ništa nije poslato. Upis šalje ove podatke u {bank:acc} i potvrđuje ih.',
  'preview.toolbar': 'Radnje upisa za {bank:acc}',
  'preview.write': 'Upiši u {bank:acc}…',
  'preview.discard': 'Odbaci',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Da li da se {what} upiše u {bank:acc} na adresi {address}?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Upis zamenjuje firmver koji kamera sada pokreće. Ako nova slika ne radi, kamera možda uopšte neće moći da se pokrene.',
  'writeConfirm.recovery':
    '{bank} je slot za oporavak, krajnja rezervna kopija kojoj se butloder vraća. Upis ostavlja kameru bez te kopije dok se ona ne vrati.',
  'writeConfirm.bootUnnamed':
    'Kamera ne kaže iz kog slota se pokreće, pa se {bank} smatra slotom iz kog se sada pokreće. Upis može da zameni firmver koji kamera sada pokreće.',
  'writeConfirm.empty': '{bank} je prazan: ne sadrži sliku, pa se nijedan firmver ne prepisuje.',
  'writeConfirm.eraseEmpty':
    'Upis ipak briše blok fleša kamere od 64 KB u {bank:loc} (već prazan) i programira ga.',
  'writeConfirm.erase': 'Ovo briše blok fleša kamere od 64 KB i programira ga u {bank:loc}.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'Ključ kojim se slika upisuje: {key}. Svaki drugi slot se upisuje na isti način.',
  'writeConfirm.backup':
    'Pre nego što se bilo šta pošalje, {bank} se ponovo čita i čuva kao jedno zip preuzimanje: {file}. Potražite ga u fascikli za preuzimanja.',
  'writeConfirm.noReset':
    'Komanda za resetovanje se ne šalje. Posle toga isključite i ponovo priključite kameru da bi slot stupio na snagu.',
  'writeConfirm.noUsbRecovery':
    'Ako slika ne radi, kamera ne može da se oporavi preko USB-a — samo pomoću SWD/J-Link ili SPI programatora.',
  'writeConfirm.ackUnnamed':
    'Razumem da kamera ne kaže iz kog slota se pokreće, pa se ovaj smatra pokrenutim, i da loša slika može da onemogući pokretanje kamere.',
  'writeConfirm.confirm': 'Da — upiši u {bank:acc}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Razumem da je ovo slot iz kog se kamera sada pokreće i da loša slika može da onemogući pokretanje kamere.',
  'ack.recovery':
    'Razumem da je ovo slot za oporavak i da loša slika ostavlja kameru bez krajnje rezervne kopije.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Ubrzati {bank:acc} na {hz} FPS?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted': '{bootsNow}. Zakrpljena slika zamenjuje firmver koji kamera sada pokreće.',
  'fpsConfirm.recovery':
    '{bank} je slot za oporavak, krajnja rezervna kopija kojoj se butloder vraća.',
  'fpsConfirm.what':
    '{bank} sadrži firmver {version}, a ovo podešava njegovu sliku da radi na {toHz} Hz umesto na {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(nepoznato)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'Zakrpa menja {count} bajt slike i reč kontrolnog zbira, pa zbir koji butloder proverava ostaje isti. Par ključeva se ne dira.',
    few: 'Zakrpa menja {count} bajta slike i reč kontrolnog zbira, pa zbir koji butloder proverava ostaje isti. Par ključeva se ne dira.',
    other:
      'Zakrpa menja {count} bajtova slike i reč kontrolnog zbira, pa zbir koji butloder proverava ostaje isti. Par ključeva se ne dira.',
  },
  'fpsConfirm.wayBack':
    'Dešifrovana datoteka u tom zipu je put nazad: da biste poništili zakrpu, upišite je u {bank:acc} dugmetom „Upiši dešifrovanu sliku“.',
  'fpsConfirm.noReset':
    'Komanda za resetovanje se ne šalje. Posle toga isključite i ponovo priključite kameru da bi zakrpljeni slot stupio na snagu.',
  'fpsConfirm.ackUnnamed':
    'Razumem da kamera ne kaže iz kog slota se pokreće, pa se ovaj smatra pokrenutim.',
  'fpsConfirm.confirm': 'Da — zakrpi {bank:acc}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Ubrzati sve slotove na {hz} FPS?',
  'fpsEvery.titleMixed': {
    one: 'Zakrpiti brzinu kadrova za {count} slot?',
    few: 'Zakrpiti brzinu kadrova za {count} slota?',
    other: 'Zakrpiti brzinu kadrova za {count} slotova?',
  },
  'fpsEvery.intro': {
    one: 'Ovo krpi {count} slot u kom je zakrpa dostupna (firmver {version}):',
    few: 'Ovo krpi {count} slota u kojima je zakrpa dostupna (firmver {version}):',
    other: 'Ovo krpi {count} slotova u kojima je zakrpa dostupna (firmver {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (slot iz kog se ova kamera sada pokreće, i slot za oporavak)',
  'fpsEvery.role.booted': '{bank} (slot iz kog se ova kamera sada pokreće)',
  'fpsEvery.role.recovery': '{bank} (slot za oporavak, krajnja rezervna kopija)',
  'fpsEvery.role.bootUnnamed': '{bank} (kamera ne kaže iz kog slota se pokreće)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: sa {fromHz} Hz na {toHz} Hz, {count} bajt i reč kontrolnog zbira.',
    few: '{bank}: sa {fromHz} Hz na {toHz} Hz, {count} bajta i reč kontrolnog zbira.',
    other: '{bank}: sa {fromHz} Hz na {toHz} Hz, {count} bajtova i reč kontrolnog zbira.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Ostaju kakvi jesu: {others}',
  'fpsEvery.orderOne': 'Upisuje samo {bank:acc} i kontrolno ga čita.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Upisuju se ovim redom: {order:nom}. Svaki se kontrolno čita pre sledećeg, a prva greška zaustavlja ostale.',
  'fpsEvery.orderBootedLast':
    'Upisuju se ovim redom: {order:nom}. Slot iz kog se kamera sada pokreće ide poslednji, pa greška zaustavlja rad pre njega. Svaki se kontrolno čita pre sledećeg, a prva greška zaustavlja ostale.',
  'fpsEvery.wayBack':
    'Dešifrovane datoteke u tom zipu su put nazad: da biste poništili zakrpu nekog slota, upišite njegovu datoteku u taj slot dugmetom „Upiši dešifrovanu sliku“.',
  'fpsEvery.noReset':
    'Komanda za resetovanje se ne šalje. Posle toga isključite i ponovo priključite kameru da bi zakrpljeni slotovi stupili na snagu.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Razumem da se ovim upisuje: {banks}, i da loša slika može da onemogući pokretanje kamere.',
  'fpsEvery.confirm': {
    one: 'Da — zakrpi {count} slot',
    few: 'Da — zakrpi {count} slota',
    other: 'Da — zakrpi {count} slotova',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: slot se pri kontrolnom čitanju poklapa sa upisanim.',
  'outcome.mismatch': '{bank} — {what}: kontrolno čitanje se NE poklapa sa upisanim.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: kontrolno čitanje je obavljeno, ali nije upoređeno, pa ovaj upis ovde nije proveren.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'Potvrda upisa u kameri vratila je status {status}.',
  'outcome.wasEmpty': '{bank} je pre ovog upisa bio prazan, pa nijedan firmver nije prepisan.',
  'outcome.provenVerified':
    'Dosad dokazano: podaci su poslati i potvrđeni, a slot se pri kontrolnom čitanju poklapa sa upisanim. NIJE dokazano: da će butloder izabrati ovaj slot ni da slika radi.',
  'outcome.provenCommitted':
    'Dosad dokazano: podaci su poslati i potvrđeni. NIJE dokazano: da će butloder izabrati ovaj slot ni da slika radi.',
  'outcome.replug':
    '**SADA ISKLJUČITE I PONOVO PRIKLJUČITE KAMERU.** Komanda za resetovanje nije poslata, pa slot stupa na snagu tek posle pravog isključivanja napajanja. Zatim ponovo pročitajte slotove: jedino verzija i aktivni slot koje kamera prijavi to razrešavaju.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**SADA ISKLJUČITE I PONOVO PRIKLJUČITE KAMERU.** Komanda za resetovanje nije poslata. Zatim ponovo pročitajte slotove.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Prvo sačuvano, kao preuzimanje: {file}.',
  'outcome.wayBackOne':
    'Dešifrovana datoteka u njemu je put nazad („Upiši dešifrovanu sliku“ u isti slot).',
  'outcome.wayBackMany':
    'Dešifrovane datoteke u njemu su put nazad („Upiši dešifrovanu sliku“ u svaki slot).',
  'outcome.checkDownloads': 'Potražite ga u fascikli za preuzimanja.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank} — zakrpljen sa {fromHz} Hz na {toHz} Hz (firmver {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'Kontrolno čitanje se od sačuvane kopije razlikuje samo u {count} planiranom bajtu, mestima i reči zbira.',
    few: 'Kontrolno čitanje se od sačuvane kopije razlikuje samo u {count} planirana bajta, mestima i reči zbira.',
    other:
      'Kontrolno čitanje se od sačuvane kopije razlikuje samo u {count} planiranih bajtova, mestima i reči zbira.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'Kontrolno čitanje se NE razlikuje samo onako kako je planirano: neočekivani bajtovi: {unexpected}, nedostajući bajtovi: {count}.',
    few: 'Kontrolno čitanje se NE razlikuje samo onako kako je planirano: neočekivani bajtovi: {unexpected}, nedostajući bajtovi: {count}.',
    other:
      'Kontrolno čitanje se NE razlikuje samo onako kako je planirano: neočekivani bajtovi: {unexpected}, nedostajući bajtovi: {count}.',
  },
  'fpsOutcome.notTaken': 'Kontrolno čitanje nije obavljeno, pa zakrpa ovde nije proverena.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Svi slotovi: zakrpljeno {done} od {count}, ovim redom: {order}.',
    few: 'Svi slotovi: zakrpljeno {done} od {count}, ovim redom: {order}.',
    other: 'Svi slotovi: zakrpljeno {done} od {count}, ovim redom: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'Kontrolno čitanje se od sačuvanog slota razlikuje samo u {count} planiranom bajtu.',
    few: 'Kontrolno čitanje se od sačuvanog slota razlikuje samo u {count} planirana bajta.',
    other: 'Kontrolno čitanje se od sačuvanog slota razlikuje samo u {count} planiranih bajtova.',
  },
  'fpsEveryOutcome.notTaken': 'Kontrolno čitanje nije obavljeno.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Zaustavljeno: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Nije upisano: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Nijedan slot ove kamere ne može da se upiše odavde.',
  'keys.title': 'Ključevi za upis',
  'keys.chain': 'Lanac',
  'keys.chainPlain':
    'nešifrovani lanac iz 2014. godine: svaki slot se čuva nešifrovan, pa nijedan ne sadrži ključ',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Upisuje se kao',
  'keys.writtenPlain': 'slika kakva jeste, bez ključa, u bilo koji slot',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Priprema kao',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Čuva se kao',
  'keys.refused': 'Odbijeno',
  'keys.bootedBank': 'Pokrenuti slot',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank} sadrži {key:acc}',
  'keys.theBootedBank': 'pokrenuti slot',
  'keys.unnamedKey': 'ključ koji stranica ne ume da imenuje',
  'keys.bootedBanksKey': 'ključ pokrenutog slota',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; svaki slot se upisuje na isti način',

  /* "What these buttons do", below the tab. */
  'how.title': 'Šta rade ova dugmad',
  'how.read': '**Pročitaj slotove** i **Iščitaj** ništa ne menjaju u kameri.',
  'how.flash':
    '**Upiši dešifrovanu sliku** uzima nešifrovanu sliku, šifruje je onako kako firmveru tog slota treba pre pripreme i prikazuje plan. **Upiši sirove bajtove** priprema datoteku tačno onakvu kakva je data. Nijedno ne šalje ništa dok ne potvrdite.',
  'how.ff':
    'Upis u slot {letterR} traži dodatnu potvrdu, kao svaki upis u slot za oporavak. **Prazan** slot (njegov prozor zaglavlja čita se kao sve 0xFF, kao {b} na mnogim kamerama iz 2014. godine) je stanje, a ne greška. Upisuje se tačno kao svaki drugi slot.',
  'how.copy':
    '**Vrati iz potpune rezervne kopije fleša** uzima .bin (celu sliku fleša od 4 MB, na primer čitanje preko J-Linka) ili .zip koji je sadrži (datoteku sesije sa kartice 0.x/1.x ili zip koji sačuvaju „Iščitavanje i dešifrovanje 4.x/Nano“ ili „Iščitaj sve selektore“), iseca ovaj slot iz nje, dešifruje ga i prikazuje plan; ako rezervna kopija izgleda kao da je sa druge kamere ili sa drugog firmvera, plan to kaže.',
  'how.fps':
    '**Ubrzaj na N FPS** u redu slota menja sliku tog slota na veću brzinu kadrova, a **Ubrzaj na N FPS u svim slotovima** to radi u svakom slotu u kom je zakrpa dostupna, uz jednu potvrdu, a slot iz kog se kamera sada pokreće poslednji. Za slot u kom nije dostupna, stranica kaže zašto.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Svaki upis prvo čuva svoj slot**: slot se ponovo čita i čuva kao jedno zip preuzimanje, nazvano po vremenu, serijskom broju kamere, firmveru, slotu i upisu (na primer `{example}`), koje sadrži slot onako kako je sačuvan, njegovu dešifrovanu sliku i belešku o tome šta je koja datoteka. Da biste se vratili, upišite dešifrovanu datoteku iz zipa dugmetom **Upiši dešifrovanu sliku**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Upis briše jedan slot od 64 KB i programira ga. Butloder na `{address}` i konfiguracija pokretanja ovde se nikada ne upisuju, i ne postoji kontrola za izbor aktivnog slota. Slot stupa na snagu tek kada se kamera isključi i ponovo priključi.',
} satisfies Translation<'slots', 'sr'>;
