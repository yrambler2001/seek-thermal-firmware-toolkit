/**
 * Namespace `slots`, latviešu (lv), translated from the English source: the firmware-slots tab.
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
  'section.title': 'Darbs ar aparātprogrammatūras slotiem',
  'section.badge': 'Raksta zibatmiņā',
  'section.description':
    '„Nolasīt slotus“ pajautā kamerai, ko tā darbina, nolasa tās trīs aparātprogrammatūras slotus — {a}, {b} un {r} — un parāda, kas ir katrā. Nolasīšana un kopijas saglabāšana neko nemaina. Ierakstīšanas poga pajautā, pirms tiek nosūtīts kaut viens baits.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Šī lapa var rakstīt kameras zibatmiņā.** Ierakstīšana izdzēš vienu 64 KB slotu un ieraksta to no jauna. Attēls, kas pēc struktūras ir derīgs, bet nedarbojas, atstāj kameru nesāknējamu, un sāknētājam nav USB — to var atkopt tikai pa SWD/J-Link vai ar SPI programmatoru. Vispirms saglabājiet slota kopiju un paturiet failu.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Slotu darbības',
  'actions.read': 'Nolasīt slotus',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Sloti',

  /* Before any read. */
  'empty.connected': 'Nospiediet „Nolasīt slotus“.',
  'empty.disconnected': 'Pievienojiet kameru, pēc tam nospiediet „Nolasīt slotus“.',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Šis būvējums šeit netiek atbalstīts, tāpēc neviens slots netika nolasīts un nevienu nevar ierakstīt.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Nav identificēts: šī lapa nevar noteikt, kādu būvējumu kamera darbina.',
  'refusal.notIdentified.body':
    'Kamera nedeva izmantojamu aparātprogrammatūras versiju, tāpēc neviens slots netika nolasīts un nekas netika aktivizēts. Šī lapa aptver būvējumus no {minVersion} un jaunākus. Būvējumi pirms {minVersion} neietilpst slotu lapas atbalstā, tāpēc kamera ar kādu no tiem šeit netiek nolasīta.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Ja kamera darbina atbalstītu būvējumu, iespējams, tā vēl tikai startē. {hint}',
  'refusal.title': 'Atteikts — nekas netika aktivizēts.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Nolasa ...',
  'status.readingAgain': 'Vēlreiz nolasa slotus ...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    zero: 'Nolasīts. Nolasīti sloti: {read}/{count}.',
    one: 'Nolasīts. Nolasīts slots: {read}/{count}.',
    other: 'Nolasīts. Nolasīti sloti: {read}/{count}.',
  },
  'status.unsupported': 'Šajā būvējumā netiek atbalstīts — neviens slots netika nolasīts.',
  'status.refused': 'Atteikts — nekas netika aktivizēts. Skatiet ziņojumu zem žurnāla.',
  'status.disconnected': 'Ierīce atvienota — nolasiet slotus vēlreiz.',
  'status.newDevice': 'Izvēlēta jauna ierīce — nolasiet slotus vēlreiz.',
  'status.dumping': 'Saglabā {bank:gen} kopiju ...',
  'status.dumped': 'Saglabāta {bank:gen} kopija.',
  'status.readingImage': 'Nolasa attēlu ...',
  'status.ready': 'Gatavs — pārskatiet plānu, pēc tam ierakstiet.',
  'status.rejected': 'Noraidīts — skatiet žurnālu augstāk.',
  'status.writing': 'Ieraksta ...',
  'status.patching': 'Uzliek ielāpu {bank:dat} ...',
  'status.patchingEvery': 'Uzliek ielāpu visiem slotiem ...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Ierakstīts, bet kontrolnolasīšana nesakrīt — skatiet rezultātu.',
  'status.written.verified': 'Ierakstīts. Kontrolnolasīšana sakrīt ar ierakstīto.',
  'status.written.notCompared':
    'Ierakstīts. Kontrolnolasīšana netika salīdzināta — skatiet rezultātu.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Ielāps uzlikts, bet kontrolnolasīšana neatšķiras tikai tā, kā plānots — skatiet rezultātu.',
  'status.patched.ok': 'Ielāps uzlikts. Kontrolnolasīšana atbilst plānam.',
  'status.patched.unchecked':
    'Ielāps uzlikts. Kontrolnolasīšana netika pārbaudīta — skatiet rezultātu.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    zero: 'Apturēts pie {bank:gen} — ielāps uzlikts {count} slotiem; skatiet rezultātu.',
    one: 'Apturēts pie {bank:gen} — ielāps uzlikts {count} slotam; skatiet rezultātu.',
    other: 'Apturēts pie {bank:gen} — ielāps uzlikts {count} slotiem; skatiet rezultātu.',
  },
  'status.every.unchecked': {
    zero: 'Ielāps uzlikts {count} slotiem, bet kāda kontrolnolasīšana netika pārbaudīta, kā plānots — skatiet rezultātu.',
    one: 'Ielāps uzlikts {count} slotam, bet kontrolnolasīšana netika pārbaudīta, kā plānots — skatiet rezultātu.',
    other:
      'Ielāps uzlikts {count} slotiem, bet kāda kontrolnolasīšana netika pārbaudīta, kā plānots — skatiet rezultātu.',
  },
  'status.every.ok': {
    zero: 'Ielāps uzlikts {count} slotiem. Katra kontrolnolasīšana atbilst plānam.',
    one: 'Ielāps uzlikts {count} slotam. Kontrolnolasīšana atbilst plānam.',
    other: 'Ielāps uzlikts {count} slotiem. Katra kontrolnolasīšana atbilst plānam.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Atcelts — nekas netika ierakstīts.',
  'status.cancelled.one':
    'Atcelts pēc tam, kad {bank:dat} jau tika nosūtīta apstiprināšana — slots var būt daļēji ierakstīts. Nolasiet to, pirms uz to paļaujaties.',
  'status.cancelled.many':
    'Atcelts pēc tam, kad apstiprināšana jau tika nosūtīta {banks:dat} — katrs no tiem var būt daļēji ierakstīts. Nolasiet tos, pirms uz tiem paļaujaties.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Vispirms pievienojiet kameru.',
  'gate.busy': 'Notiek cita darbība — pagaidiet, līdz tā beidzas.',
  'gate.readFirst': 'Vispirms nolasiet slotus.',
  'gate.cameraRefused':
    'Šajā kamerā no šejienes nevar ierakstīt — iemesls ir paziņojumā augstāk. Nekas netiek nosūtīts.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Nav nolasīts: {reason}. Pirms ierakstīšanas nolasiet slotus vēlreiz.',
  'gate.notReadNoReason':
    'Nav nolasīts: šis slots netika nolasīts. Pirms ierakstīšanas nolasiet slotus vēlreiz.',
  'gate.emptyNotWritable': 'Šis slots ir tukšs, un šajā būvējumā to nevar ierakstīt: {reason}',
  'gate.noSuchBank': 'Šajā būvējumā tāda slota nav.',

  /* The bank table. */
  'table.caption':
    'Katrs šīs kameras aparātprogrammatūras slots — {a}, {b} un {r} — tāds, kādu to nolasīja un pārbaudīja pārlūkprogramma',
  'table.col.bank': 'Slots',
  'table.col.firmware': 'Aparātprogrammatūra',
  'table.col.size': 'Izmērs',
  'table.col.key': 'Atslēga',
  'table.col.bootable': 'Sāknējams',
  'table.col.sha': 'Atklātā teksta SHA-256',
  'table.col.actions': 'Darbības',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'nav nolasīts — {reason}',
  'table.notReadNoReason': 'nav nolasīts — slots netika nolasīts',
  /* A badge: the bank holds no image. */
  'table.empty': 'tukšs',
  'table.emptyNote':
    'Nav attēla: šī slota galvenes logs nolasās kā tikai 0xFF, tāpēc no tā nekas netiek atšifrēts un, to ierakstot, netiek pārrakstīta neviena aparātprogrammatūra.',
  /* {reason} is core's. */
  'table.emptyWritable': 'Var ierakstīt.',
  'table.emptyNotWritable': 'Šajā būvējumā nevar ierakstīt: {reason}',
  'table.unknownVersion': 'nezināma versija',
  /* {id} is the image id in hex. */
  'table.imageId': 'attēls {id}',
  'table.noImage': 'nav attēla',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'slots: {size} B',
  'table.imageSize': 'attēls: {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'nav (atklāts teksts)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— nav ko sāknēt',
  'table.boot.bootable': 'sāknējams — sāknētājs to pieņem',
  'table.boot.notBootable': 'nav sāknējams — sāknējot tiek izlaists',
  'table.boot.recoveryOnly':
    'tikai atkopšanai — {letterR} tiek palaists, ja {letterA} un {letterB} nav nekā, ko sāknētājs pieņem (izmērīts kamerā ar agrāku šī attēla formu); vai šī forma startē, nav pārbaudīts',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'nezināms — {why}',
  /* The row's buttons. */
  'table.dump': 'Saglabāt kopiju',
  'table.flashPlain': 'Ierakstīt atšifrētu attēlu…',
  'table.flashRaw': 'Ierakstīt neapstrādātus baitus…',
  'table.restore': 'Atjaunot no pilnas zibatmiņas rezerves kopijas (.bin vai .zip)…',
  'table.makeFps': 'Iestatīt {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Kopēt uz {bank:acc}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: nav pieejams',
  'table.copyNote':
    'Kopē šajā slotā esošo aparātprogrammatūru tādu, kādu to atšifrēja šī nolasīšana, jūsu izvēlētajā slotā, lai kas tur pašlaik būtu. Pirms kaut kas tiek nosūtīts, jūs pārskatāt plānu.',
  'table.restoreNote':
    'Izvēlieties pilnu zibatmiņas rezerves kopiju: .bin (visas 4 MB zibatmiņas attēls, piemēram, ar J-Link nolasīts) vai .zip, kurā tāds ir (0.x/1.x cilnes sesijas fails vai ZIP fails, ko saglabā „Nolasīt un atšifrēt 4.x/Nano“ vai „Nolasīt visus selektorus“). Šis slots tiek no tās izgriezts, atšifrēts un parādīts kā plāns, pirms kaut kas tiek nosūtīts.',
  'table.fpsNote':
    'Paaugstina šī slota kadru ātrumu no {fromHz} Hz līdz {toHz} Hz, mainot tā baitus. Slots vispirms tiek saglabāts ZIP lejupielādē, un tajā esošais atšifrētais fails ir ceļš atpakaļ.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery':
    '{booted}, turklāt tas ir atkopšanas slots: tā ierakstīšanai vajag papildu apstiprinājumu.',
  'table.risk.booted': '{booted}: tā ierakstīšanai vajag papildu apstiprinājumu.',
  'table.risk.recovery': '{bank}: tā ierakstīšanai vajag papildu apstiprinājumu.',
  'table.risk.bootUnnamed':
    'Kamera nenosauc slotu, no kura sāknējas: tā ierakstīšanai vajag papildu apstiprinājumu.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Kadru ātruma ielāps uzlikts: šis attēls darbojas ar {hz} Hz.',
  'fps.earlierPatch':
    'Kadru ātruma ielāps netiek piedāvāts: šajā slotā ir agrāks {hz} Hz ielāps bez USB labojuma. Atjaunojiet rūpnīcas attēlu, pēc tam izmantojiet „Iestatīt {hz} FPS“.',
  'fps.atRate': 'Kadru ātruma ielāps nav vajadzīgs: šis būvējums jau darbojas ar {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Kadru ātruma ielāps netiek piedāvāts: {reason}',
  'fps.readFirst': 'vispirms nolasiet slotus — ielāps tiek plānots pēc paša slota attēla',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Visi sloti',
  'everyBank.make': 'Iestatīt {hz} FPS visos slotos',
  'everyBank.faster': 'Paātrināt visus slotus',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Uzliek ielāpu {order:dat} ar vienu apstiprinājumu; katrs slots vispirms tiek saglabāts vienā ZIP lejupielādē un pēc tam nolasīts kontrolei.',
  'everyBank.noteBootedLast':
    'Uzliek ielāpu {order:dat} ar vienu apstiprinājumu, slotu, no kura kamera tagad sāknējas, — pēdējo; katrs slots vispirms tiek saglabāts vienā ZIP lejupielādē un pēc tam nolasīts kontrolei.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': '{bank:gen} attēls',
  'what.restore': '{bank} no faila {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Sagatavots {bank:dat} adresē {address}',
  'preview.file': 'Fails',
  'preview.source': 'Attēla avots',
  'preview.target': 'Mērķis',
  'preview.targetEmpty':
    '{bank} ir tukšs: tajā nav attēla, tāpēc šī ierakstīšana nepārraksta nevienu aparātprogrammatūru',
  'preview.readAs': 'Nolasīts kā',
  'preview.readAs.ff': 'atšifrēts {version} FF attēls',
  'preview.readAs.plain': 'atšifrēts attēls',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'neapstrādāti baiti',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Sagatavošana',
  'preview.key': 'Atslēga',
  'preview.payload': 'Dati',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    zero: '{size} B {count} daļās pa ne vairāk kā {chunk} B',
    one: '{size} B {count} daļā pa ne vairāk kā {chunk} B',
    other: '{size} B {count} daļās pa ne vairāk kā {chunk} B',
  },
  'preview.checksum': 'Pārsūtes kontrolsumma',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Pēc tam glabāsies',
  'preview.storedNotPredicted': 'nav prognozēts — pārbaude ir kontrolnolasīšana',
  'preview.storedPredicted': 'prognozēti {size} B',
  'preview.storedKeyB': 'prognozēti {size} B — attēls XOR atslēga B, nevis paši dati',
  'preview.savedFirst': 'Vispirms saglabāts',
  'preview.compareCaption': 'Kas mainās {bank:loc}',
  'preview.col.field': 'Lauks',
  'preview.col.now': 'Tagad',
  'preview.col.after': 'Pēc ierakstīšanas',
  'preview.readFirst': 'Izlasiet pirms ierakstīšanas:',
  /* {note} is core's note about this write. */
  'preview.note': 'Piezīme: {note}',
  'preview.nothingSent':
    'Kamerai vēl nekas nav nosūtīts. Ierakstot šie dati tiek pārsūtīti uz {bank:acc} un apstiprināti.',
  'preview.toolbar': 'Darbības ierakstīšanai {bank:loc}',
  'preview.write': 'Ierakstīt {bank:loc}…',
  'preview.discard': 'Atmest',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Ierakstīt {bank:loc} adresē {address}: {what}?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Ierakstot tiek aizstāta aparātprogrammatūra, ko kamera darbina tagad. Ja jaunais attēls nedarbojas, kamera var vispār nesāknēties.',
  'writeConfirm.recovery':
    '{bank} ir atkopšanas slots — ārkārtas kopija, uz kuru sāknētājs pārslēdzas pēdējā brīdī. Ierakstot kamera paliek bez šīs kopijas, līdz tā tiek atjaunota.',
  'writeConfirm.bootUnnamed':
    'Kamera nepasaka, no kura slota tā sāknējas, tāpēc {bank} tiek uzskatīts par slotu, no kura tā sāknējas tagad. Ierakstot var tikt aizstāta aparātprogrammatūra, ko kamera darbina.',
  'writeConfirm.empty':
    '{bank} ir tukšs: tajā nav attēla, tāpēc neviena aparātprogrammatūra netiek pārrakstīta.',
  'writeConfirm.eraseEmpty':
    'Ierakstīšana tik un tā izdzēš kameras zibatmiņas 64 KB bloku {bank:loc} (tas jau ir tukšs) un ieraksta to.',
  'writeConfirm.erase':
    'Tiek izdzēsts un no jauna ierakstīts kameras zibatmiņas 64 KB bloks {bank:loc}.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'Attēls tiek ierakstīts ar šādu atslēgu: {key}. Katrs cits slots tiek ierakstīts tāpat.',
  'writeConfirm.backup':
    'Pirms kaut kas tiek nosūtīts, {bank} tiek nolasīts vēlreiz un saglabāts kā viena ZIP lejupielāde: {file}. Meklējiet to lejupielāžu mapē.',
  'writeConfirm.noReset':
    'Atiestatīšanas komanda netiek nosūtīta. Pēc tam atvienojiet kameru un pievienojiet atkal, lai slots stātos spēkā.',
  'writeConfirm.noUsbRecovery':
    'Ja attēls nedarbojas, kameru nevar atkopt pa USB — tikai ar SWD/J-Link vai SPI programmatoru.',
  'writeConfirm.ackUnnamed':
    'Es saprotu, ka kamera nepasaka, no kura slota tā sāknējas, tāpēc šis tiek uzskatīts par sāknēto, un ka slikts attēls var atstāt kameru nesāknējamu.',
  'writeConfirm.confirm': 'Jā — ierakstīt {bank:loc}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Es saprotu, ka tas ir slots, no kura kamera tagad sāknējas, un ka slikts attēls var atstāt kameru nesāknējamu.',
  'ack.recovery':
    'Es saprotu, ka tas ir atkopšanas slots un ka slikts attēls atstāj kameru bez ārkārtas kopijas.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Vai {bank:loc} iestatīt {hz} FPS?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted':
    '{bootsNow}. Attēls ar ielāpu aizstāj aparātprogrammatūru, ko tā darbina tagad.',
  'fpsConfirm.recovery':
    '{bank} ir atkopšanas slots — ārkārtas kopija, uz kuru sāknētājs pārslēdzas pēdējā brīdī.',
  'fpsConfirm.what':
    'Šobrīd {bank:loc} ir aparātprogrammatūra {version}, un šī darbība liek tās attēlam darboties ar {toHz} Hz, nevis {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(nezināma)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    zero: 'Ielāps maina {count} attēla baitu un pieņemšanas summas vārdu, tāpēc summa, ko pārbauda sāknētājs, saglabājas. Atslēgu pāris netiek skarts.',
    one: 'Ielāps maina {count} attēla baitu un pieņemšanas summas vārdu, tāpēc summa, ko pārbauda sāknētājs, saglabājas. Atslēgu pāris netiek skarts.',
    other:
      'Ielāps maina {count} attēla baitus un pieņemšanas summas vārdu, tāpēc summa, ko pārbauda sāknētājs, saglabājas. Atslēgu pāris netiek skarts.',
  },
  'fpsConfirm.wayBack':
    'Šajā ZIP failā esošais atšifrētais fails ir ceļš atpakaļ: lai atsauktu ielāpu, ierakstiet to {bank:loc} ar „Ierakstīt atšifrētu attēlu“.',
  'fpsConfirm.noReset':
    'Atiestatīšanas komanda netiek nosūtīta. Pēc tam atvienojiet kameru un pievienojiet atkal, lai slots ar ielāpu stātos spēkā.',
  'fpsConfirm.ackUnnamed':
    'Es saprotu, ka kamera nepasaka, no kura slota tā sāknējas, tāpēc šis tiek uzskatīts par sāknēto.',
  'fpsConfirm.confirm': 'Jā — uzlikt ielāpu {bank:dat}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Vai visos slotos iestatīt {hz} FPS?',
  'fpsEvery.titleMixed': {
    zero: 'Vai mainīt kadru ātrumu {count} slotos?',
    one: 'Vai mainīt kadru ātrumu {count} slotā?',
    other: 'Vai mainīt kadru ātrumu {count} slotos?',
  },
  'fpsEvery.intro': {
    zero: 'Šī darbība uzliek ielāpu {count} slotiem, kuriem ielāps ir pieejams (aparātprogrammatūra {version}):',
    one: 'Šī darbība uzliek ielāpu {count} slotam, kuram ielāps ir pieejams (aparātprogrammatūra {version}):',
    other:
      'Šī darbība uzliek ielāpu {count} slotiem, kuriem ielāps ir pieejams (aparātprogrammatūra {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (slots, no kura kamera tagad sāknējas, un atkopšanas slots)',
  'fpsEvery.role.booted': '{bank} (slots, no kura kamera tagad sāknējas)',
  'fpsEvery.role.recovery': '{bank} (atkopšanas slots, ārkārtas kopija)',
  'fpsEvery.role.bootUnnamed': '{bank} (kamera nepasaka, no kura slota tā sāknējas)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    zero: '{bank}: no {fromHz} Hz uz {toHz} Hz, {count} baitu un pieņemšanas summas vārds.',
    one: '{bank}: no {fromHz} Hz uz {toHz} Hz, {count} baits un pieņemšanas summas vārds.',
    other: '{bank}: no {fromHz} Hz uz {toHz} Hz, {count} baiti un pieņemšanas summas vārds.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Netiek mainīti: {others}',
  'fpsEvery.orderOne': 'Tā ieraksta tikai {bank:acc} un nolasa to kontrolei.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Ierakstīšanas secība: {order}. Katrs slots tiek nolasīts kontrolei pirms nākamā, un pirmā kļūme aptur pārējos.',
  'fpsEvery.orderBootedLast':
    'Ierakstīšanas secība: {order}. Slots, no kura kamera tagad sāknējas, ir pēdējais, tāpēc kļūmes gadījumā darbs apstājas pirms tā. Katrs slots tiek nolasīts kontrolei pirms nākamā, un pirmā kļūme aptur pārējos.',
  'fpsEvery.wayBack':
    'Šajā ZIP failā esošie atšifrētie faili ir ceļš atpakaļ: lai atsauktu slota ielāpu, ierakstiet tā failu šajā slotā ar „Ierakstīt atšifrētu attēlu“.',
  'fpsEvery.noReset':
    'Atiestatīšanas komanda netiek nosūtīta. Pēc tam atvienojiet kameru un pievienojiet atkal, lai sloti ar ielāpu stātos spēkā.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Es saprotu, ka slikts attēls var atstāt kameru nesāknējamu un ka šī darbība raksta šeit: {banks}.',
  'fpsEvery.confirm': {
    zero: 'Jā — uzlikt ielāpu {count} slotiem',
    one: 'Jā — uzlikt ielāpu {count} slotam',
    other: 'Jā — uzlikt ielāpu {count} slotiem',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: kontrolnolasīšana sakrīt ar ierakstīto.',
  'outcome.mismatch': '{bank} — {what}: kontrolnolasīšana NESAKRĪT ar ierakstīto.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: kontrolnolasīšana tika veikta, bet netika salīdzināta, tāpēc šī ierakstīšana šeit nav pārbaudīta.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'Kameras apstiprināšana atgrieza statusu {status}.',
  'outcome.wasEmpty':
    '{bank} pirms šīs ierakstīšanas bija tukšs, tāpēc neviena aparātprogrammatūra netika pārrakstīta.',
  'outcome.provenVerified':
    'Līdz šim pierādīts: dati tika pārsūtīti un apstiprināti, un kontrolnolasīšana sakrīt ar ierakstīto. NAV pierādīts: ka sāknētājs izvēlēsies šo slotu vai ka attēls darbojas.',
  'outcome.provenCommitted':
    'Līdz šim pierādīts: dati tika pārsūtīti un apstiprināti. NAV pierādīts: ka sāknētājs izvēlēsies šo slotu vai ka attēls darbojas.',
  'outcome.replug':
    '**TAGAD ATVIENOJIET KAMERU UN PIEVIENOJIET ATKAL.** Atiestatīšanas komanda netika nosūtīta, tāpēc slots stājas spēkā tikai pēc īstas barošanas pārslēgšanas. Pēc tam nolasiet slotus vēlreiz: tikai kameras paziņotā versija un aktīvais slots to galīgi apliecina.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**TAGAD ATVIENOJIET KAMERU UN PIEVIENOJIET ATKAL.** Atiestatīšanas komanda netika nosūtīta. Pēc tam nolasiet slotus vēlreiz.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Vispirms saglabāts kā lejupielāde: {file}.',
  'outcome.wayBackOne':
    'Tajā esošais atšifrētais fails ir ceļš atpakaļ („Ierakstīt atšifrētu attēlu“ tajā pašā slotā).',
  'outcome.wayBackMany':
    'Tajā esošie atšifrētie faili ir ceļš atpakaļ („Ierakstīt atšifrētu attēlu“ katrā slotā).',
  'outcome.checkDownloads': 'Meklējiet to lejupielāžu mapē.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title':
    '{bank} — ielāps uzlikts, no {fromHz} Hz uz {toHz} Hz (aparātprogrammatūra {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    zero: 'Kontrolnolasīšana atšķiras no saglabātās izmetes tikai {count} plānotajos baitos, ielāpa vietās un summas vārdā.',
    one: 'Kontrolnolasīšana atšķiras no saglabātās izmetes tikai {count} plānotajā baitā, ielāpa vietās un summas vārdā.',
    other:
      'Kontrolnolasīšana atšķiras no saglabātās izmetes tikai {count} plānotajos baitos, ielāpa vietās un summas vārdā.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    zero: 'Kontrolnolasīšana NEatšķiras tikai tā, kā plānots: neparedzēti baiti: {unexpected}, trūkstoši baiti: {count}.',
    one: 'Kontrolnolasīšana NEatšķiras tikai tā, kā plānots: neparedzēti baiti: {unexpected}, trūkstoši baiti: {count}.',
    other:
      'Kontrolnolasīšana NEatšķiras tikai tā, kā plānots: neparedzēti baiti: {unexpected}, trūkstoši baiti: {count}.',
  },
  'fpsOutcome.notTaken': 'Kontrolnolasīšana netika veikta, tāpēc ielāps šeit nav pārbaudīts.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    zero: 'Visi sloti: ielāps uzlikts {done} no {count}, šādā secībā: {order}.',
    one: 'Visi sloti: ielāps uzlikts {done} no {count}, šādā secībā: {order}.',
    other: 'Visi sloti: ielāps uzlikts {done} no {count}, šādā secībā: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    zero: 'Kontrolnolasīšana atšķiras no saglabātā slota tikai {count} plānotajos baitos.',
    one: 'Kontrolnolasīšana atšķiras no saglabātā slota tikai {count} plānotajā baitā.',
    other: 'Kontrolnolasīšana atšķiras no saglabātā slota tikai {count} plānotajos baitos.',
  },
  'fpsEveryOutcome.notTaken': 'Kontrolnolasīšana netika veikta.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Apturēts: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Nav ierakstīts: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Nevienu šīs kameras slotu no šejienes nevar ierakstīt.',
  'keys.title': 'Ierakstīšanas atslēgas',
  'keys.chain': 'Ķēde',
  'keys.chainPlain':
    '2014. gada atklātā teksta ķēde: katrs slots tiek glabāts atklātā veidā, tāpēc nevienā nav atslēgas',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Ierakstīts kā',
  'keys.writtenPlain': 'attēls tāds, kāds tas ir, bez atslēgas, jebkurā slotā',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Sagatavots ar',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Glabājas ar',
  'keys.refused': 'Atteikts',
  'keys.bootedBank': 'Sāknētais slots',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank}: tajā ir {key:nom}',
  'keys.theBootedBank': 'sāknētais slots',
  'keys.unnamedKey': 'atslēga, ko lapa nevar nosaukt',
  'keys.bootedBanksKey': 'sāknētā slota atslēga',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; katrs slots tiek ierakstīts tāpat',

  /* "What these buttons do", below the tab. */
  'how.title': 'Ko dara šīs pogas',
  'how.read': '**Nolasīt slotus** un **Saglabāt kopiju** kamerā neko nemaina.',
  'how.flash':
    '**Ierakstīt atšifrētu attēlu** ņem atklāta teksta attēlu, pirms sagatavošanas to šifrē tā, kā vajag šī slota aparātprogrammatūrai, un parāda plānu. **Ierakstīt neapstrādātus baitus** sagatavo failu tieši tādu, kāds tas ir. Neviena no tām neko nenosūta, kamēr jūs neapstiprināt.',
  'how.ff':
    '{letterR} ierakstīšanai vajag papildu apstiprinājumu tāpat kā jebkurai atkopšanas slota ierakstīšanai. **Tukšs** slots (tā galvenes logs nolasās kā tikai 0xFF, kā daudzām 2014. gada kamerām {b:loc}) ir stāvoklis, nevis kļūme. To ieraksta tieši tāpat kā jebkuru citu slotu.',
  'how.copy':
    '**Atjaunot no pilnas zibatmiņas rezerves kopijas** ņem .bin (visas 4 MB zibatmiņas attēlu, piemēram, ar J-Link nolasītu) vai .zip, kurā tāds ir (0.x/1.x cilnes sesijas failu vai ZIP failu, ko saglabā „Nolasīt un atšifrēt 4.x/Nano“ vai „Nolasīt visus selektorus“), izgriež no tā šo slotu, atšifrē to un parāda plānu; ja rezerves kopija izskatās pēc citas kameras vai citas aparātprogrammatūras kopijas, plāns to pasaka.',
  'how.fps':
    '**Iestatīt N FPS** slota rindā maina šī slota attēlu uz lielāku kadru ātrumu, un **Iestatīt N FPS visos slotos** to dara katrā slotā, kur ielāps ir pieejams, ar vienu apstiprinājumu, slotu, no kura kamera tagad sāknējas, — pēdējo. Ja slotam ielāps nav pieejams, lapa pasaka, kāpēc.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Katra ierakstīšana vispirms saglabā savu slotu**: slots tiek nolasīts vēlreiz un saglabāts kā viena ZIP lejupielāde, kuras nosaukumā ir laiks, kameras sērijas numurs, aparātprogrammatūra, slots un ierakstīšana (piemēram, `{example}`) un kurā ir slots tāds, kāds tas glabājas, tā atšifrētais attēls un piezīme par to, kas ir katrs fails. Lai atgrieztos, ierakstiet ZIP faila atšifrēto failu ar **Ierakstīt atšifrētu attēlu**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Ierakstīšana izdzēš vienu 64 KB slotu un ieraksta to no jauna. Sāknētājs adresē `{address}` un sāknēšanas konfigurācija šeit nekad netiek rakstīti, un aktīvā slota izvēlei nav vadīklas. Slots stājas spēkā tikai pēc tam, kad kamera ir atvienota un pievienota atkal.',
} satisfies Translation<'slots', 'lv'>;
