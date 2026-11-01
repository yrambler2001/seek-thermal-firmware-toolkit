/**
 * Namespace `slots`, română (ro), translated from the English source: the firmware-slots tab.
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
  'section.title': 'Lucru cu sloturile de firmware',
  'section.badge': 'Scrie în memoria flash',
  'section.description':
    '„Citire sloturi” întreabă camera ce rulează, citește cele trei sloturi de firmware — {a:acc}, {b:acc} și {r:acc} — și arată ce conține fiecare. Citirea și extragerea nu schimbă nimic. Un buton de scriere întreabă înainte să se trimită vreun octet.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Această pagină poate scrie în memoria flash a camerei.** O scriere șterge un slot de 64 KB și îl programează. O imagine corectă ca structură, dar care nu rulează, face ca camera să nu mai poată porni, iar bootloader-ul nu are USB — camera mai poate fi recuperată doar prin SWD/J-Link sau cu un programator SPI. Extrageți mai întâi slotul și păstrați fișierul.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Acțiuni pentru sloturi',
  'actions.read': 'Citire sloturi',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Sloturi',

  /* Before any read. */
  'empty.connected': 'Apăsați „Citire sloturi”.',
  'empty.disconnected': 'Conectați camera, apoi apăsați „Citire sloturi”.',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Acest build nu este acceptat aici, așa că nu s-a citit niciun slot și niciunul nu poate fi scris.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Neidentificat: această pagină nu poate spune ce build rulează camera.',
  'refusal.notIdentified.body':
    'Camera nu a dat o versiune de firmware utilizabilă, așa că nu s-a citit niciun slot și nu s-a activat nimic. Această pagină acoperă build-urile {minVersion} și mai noi. Build-urile anterioare lui {minVersion} sunt în afara a ceea ce acceptă pagina sloturilor, așa că o cameră cu unul dintre ele nu este citită niciodată aici.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Dacă rulează un build acceptat, camera poate fi doar în curs de pornire. {hint}',
  'refusal.title': 'Refuzat — nu s-a activat nimic.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Se citește ...',
  'status.readingAgain': 'Se recitesc sloturile ...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Citire încheiată. {read}/{count} slot citit.',
    few: 'Citire încheiată. {read}/{count} sloturi citite.',
    other: 'Citire încheiată. {read}/{count} de sloturi citite.',
  },
  'status.unsupported': 'Neacceptat pe acest build — nu s-a citit niciun slot.',
  'status.refused': 'Refuzat — nu s-a activat nimic. Vedeți mesajul de sub jurnal.',
  'status.disconnected': 'Dispozitiv deconectat — citiți din nou sloturile.',
  'status.newDevice': 'Dispozitiv nou selectat — citiți din nou sloturile.',
  'status.dumping': 'Se extrage {bank:acc} ...',
  'status.dumped': 'S-a extras {bank:acc}.',
  'status.readingImage': 'Se citește imaginea ...',
  'status.ready': 'Gata — verificați planul, apoi scrieți-l.',
  'status.rejected': 'Respins — vedeți jurnalul de mai sus.',
  'status.writing': 'Se scrie ...',
  'status.patching': 'Se aplică patch-ul pe {bank:acc} ...',
  'status.patchingEvery': 'Se aplică patch-ul pe toate sloturile ...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Scris, dar recitirea nu se potrivește — vedeți rezultatul.',
  'status.written.verified': 'Scris. Slotul recitit este identic cu ce s-a scris.',
  'status.written.notCompared': 'Scris. Recitirea nu a fost comparată — vedeți rezultatul.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Patch aplicat, dar recitirea nu diferă doar așa cum s-a planificat — vedeți rezultatul.',
  'status.patched.ok': 'Patch aplicat. Slotul recitit este cel planificat.',
  'status.patched.unchecked': 'Patch aplicat. Recitirea nu a fost verificată — vedeți rezultatul.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Oprit la {bank:acc} — {count} slot cu patch aplicat; vedeți rezultatul.',
    few: 'Oprit la {bank:acc} — {count} sloturi cu patch aplicat; vedeți rezultatul.',
    other: 'Oprit la {bank:acc} — {count} de sloturi cu patch aplicat; vedeți rezultatul.',
  },
  'status.every.unchecked': {
    one: 'Patch aplicat pe {count} slot, dar o recitire nu a fost verificată conform planului — vedeți rezultatul.',
    few: 'Patch aplicat pe {count} sloturi, dar o recitire nu a fost verificată conform planului — vedeți rezultatul.',
    other:
      'Patch aplicat pe {count} de sloturi, dar o recitire nu a fost verificată conform planului — vedeți rezultatul.',
  },
  'status.every.ok': {
    one: 'Patch aplicat pe {count} slot. Fiecare slot recitit este cel planificat.',
    few: 'Patch aplicat pe {count} sloturi. Fiecare slot recitit este cel planificat.',
    other: 'Patch aplicat pe {count} de sloturi. Fiecare slot recitit este cel planificat.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Anulat — nu s-a scris nimic.',
  'status.cancelled.one':
    'Anulat după ce s-a trimis confirmarea scrierii în {bank:acc} — slotul poate fi scris doar parțial. Citiți-l înainte să vă bazați pe el.',
  'status.cancelled.many':
    'Anulat după ce s-au trimis confirmările scrierii în {banks:acc} — fiecare poate fi scris doar parțial. Citiți-le înainte să vă bazați pe ele.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Conectați mai întâi camera.',
  'gate.busy': 'Rulează altă operație — așteptați să se termine.',
  'gate.readFirst': 'Citiți mai întâi sloturile.',
  'gate.cameraRefused':
    'Această cameră nu poate fi scrisă de aici, din motivul arătat în mesajul de mai sus. Nu se trimite nimic.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Necitit: {reason}. Citiți din nou sloturile înainte să-l scrieți.',
  'gate.notReadNoReason':
    'Necitit: acest slot nu a fost citit. Citiți din nou sloturile înainte să-l scrieți.',
  'gate.emptyNotWritable': 'Acest slot este gol și nu poate fi scris pe acest build: {reason}',
  'gate.noSuchBank': 'Acest build nu are un astfel de slot.',

  /* The bank table. */
  'table.caption':
    'Fiecare slot de firmware al acestei camere — {a:acc}, {b:acc} și {r:acc} — așa cum a fost citit și verificat în browser',
  'table.col.bank': 'Slot',
  'table.col.firmware': 'Firmware',
  'table.col.size': 'Dimensiune',
  'table.col.key': 'Cheie',
  'table.col.bootable': 'Poate porni',
  'table.col.sha': 'SHA-256 (necriptat)',
  'table.col.actions': 'Acțiuni',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'necitit — {reason}',
  'table.notReadNoReason': 'necitit — slotul nu a fost citit',
  /* A badge: the bank holds no image. */
  'table.empty': 'gol',
  'table.emptyNote':
    'Nicio imagine: fereastra antetului acestui slot se citește numai 0xFF, așa că nu se decriptează nimic din el, iar scrierea lui nu suprascrie niciun firmware.',
  /* {reason} is core's. */
  'table.emptyWritable': 'Poate fi scris.',
  'table.emptyNotWritable': 'Nu poate fi scris pe acest build: {reason}',
  'table.unknownVersion': 'versiune necunoscută',
  /* {id} is the image id in hex. */
  'table.imageId': 'imaginea {id}',
  'table.noImage': 'nicio imagine',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'slot de {size} B',
  'table.imageSize': 'imagine de {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'niciuna (necriptat)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— nimic de pornit',
  'table.boot.bootable': 'poate porni — bootloader-ul îl acceptă',
  'table.boot.notBootable': 'nu poate porni — sărit la pornire',
  'table.boot.recoveryOnly':
    'doar recuperare — {letterR} rulează când {letterA} și {letterB} nu conțin nimic din ce acceptă bootloader-ul (măsurat pe o cameră, pentru o formă anterioară a acestei imagini); nu s-a testat dacă această formă pornește',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'necunoscut — {why}',
  /* The row's buttons. */
  'table.dump': 'Extragere',
  'table.flashPlain': 'Scriere imagine decriptată…',
  'table.flashRaw': 'Scriere octeți bruți…',
  'table.restore': 'Restaurare din copia de rezervă (.bin sau .zip)…',
  'table.makeFps': 'Trecere la {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Copiere în {bank:acc}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: dezactivat',
  'table.copyNote':
    'Copiază firmware-ul din acest slot, așa cum l-a decriptat această citire, în slotul pe care îl alegeți, indiferent ce conține acum acel slot. Verificați planul înainte să se trimită ceva.',
  'table.restoreNote':
    'Alegeți o copie de rezervă completă a memoriei flash: un .bin (o imagine completă de 4 MB a memoriei flash, cum ar fi o citire J-Link) sau un .zip care conține una (un fișier de rulare Preserve sau arhiva zip salvată de „Extragere și decriptare 4.x/Nano” ori de „Extragerea tuturor selectorilor”). Acest slot este decupat din ea, decriptat și afișat ca plan înainte să se trimită ceva.',
  'table.fpsNote':
    'Ridică acest slot de la {fromHz} Hz la {toHz} Hz, modificându-i octeții. Slotul este salvat mai întâi, într-o arhivă zip descărcată, iar fișierul decriptat din ea este calea de întoarcere.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery':
    '{booted} și slot de recuperare: scrierea acestuia cere o confirmare suplimentară.',
  'table.risk.booted': '{booted}: scrierea acestuia cere o confirmare suplimentară.',
  'table.risk.recovery': '{bank}: scrierea acestuia cere o confirmare suplimentară.',
  'table.risk.bootUnnamed':
    'Camera nu spune din ce slot pornește: scrierea acestuia cere o confirmare suplimentară.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Patch pentru rata de cadre aplicat: această imagine rulează la {hz} Hz.',
  'fps.earlierPatch':
    'Patch pentru rata de cadre neoferit: acest slot conține un patch anterior de {hz} Hz, fără corecția pentru USB. Restaurați imaginea originală, apoi folosiți „Trecere la {hz} FPS”.',
  'fps.atRate':
    'Nu este nevoie de patch pentru rata de cadre: acest build rulează deja la {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Patch pentru rata de cadre neoferit: {reason}',
  'fps.readFirst':
    'citiți mai întâi sloturile — patch-ul se planifică pornind de la imaginea proprie a slotului',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Toate sloturile',
  'everyBank.make': 'Trecere la {hz} FPS în toate sloturile',
  'everyBank.faster': 'Mai rapid în toate sloturile',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Aplică patch-ul pe {order:acc} cu o singură confirmare; fiecare este salvat mai întâi, într-o singură arhivă zip descărcată, și recitit.',
  'everyBank.noteBootedLast':
    'Aplică patch-ul pe {order:acc} cu o singură confirmare, iar slotul din care pornește camera acum este ultimul; fiecare este salvat mai întâi, într-o singură arhivă zip descărcată, și recitit.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': 'imaginea {bank:gen}',
  'what.restore': '{bank:acc} din {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Scriere pregătită pentru {bank:acc} la {address}',
  'preview.file': 'Fișier',
  'preview.source': 'Imagine luată din',
  'preview.target': 'Țintă',
  'preview.targetEmpty':
    '{bank:ins} este gol: nu conține nicio imagine, așa că această scriere nu suprascrie niciun firmware',
  'preview.readAs': 'Citit ca',
  'preview.readAs.ff': 'o imagine FF {version} decriptată',
  'preview.readAs.plain': 'o imagine decriptată',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'octeți bruți',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Transfer',
  'preview.key': 'Cheie',
  'preview.payload': 'Date trimise',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} B în {count} bucată de cel mult {chunk} B',
    few: '{size} B în {count} bucăți de cel mult {chunk} B',
    other: '{size} B în {count} de bucăți de cel mult {chunk} B',
  },
  'preview.checksum': 'Suma de control a transferului',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Stocat după scriere',
  'preview.storedNotPredicted': 'nu se poate prevedea — verificarea o face recitirea',
  'preview.storedPredicted': '{size} B prevăzuți',
  'preview.storedKeyB': '{size} B prevăzuți — imaginea XOR cheia B, nu datele trimise ca atare',
  'preview.savedFirst': 'Salvat mai întâi',
  'preview.compareCaption': 'Ce se schimbă în {bank:acc}',
  'preview.col.field': 'Câmp',
  'preview.col.now': 'Acum',
  'preview.col.after': 'După scriere',
  'preview.readFirst': 'Citiți înainte de scriere:',
  /* {note} is core's note about this write. */
  'preview.note': 'Notă: {note}',
  'preview.nothingSent':
    'Încă nu s-a trimis nimic către cameră. Scrierea transmite aceste date în {bank:acc} și confirmă scrierea.',
  'preview.toolbar': 'Acțiuni de scriere pentru {bank:acc}',
  'preview.write': 'Scriere în {bank:acc}…',
  'preview.discard': 'Renunțare',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Scrieți {what} în {bank:acc} la {address}?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Scrierea lui înlocuiește firmware-ul pe care camera îl rulează acum. Dacă noua imagine nu rulează, este posibil ca camera să nu mai pornească deloc.',
  'writeConfirm.recovery':
    '{bank:ins} este slotul de recuperare, copia de ultimă instanță la care revine bootloader-ul. Scrierea lui lasă camera fără această copie până când este restaurată.',
  'writeConfirm.bootUnnamed':
    'Camera nu spune din ce slot pornește, așa că {bank:acc} este tratat ca slotul din care pornește acum. Scrierea lui poate înlocui firmware-ul pe care îl rulează camera.',
  'writeConfirm.empty':
    '{bank:ins} este gol: nu conține nicio imagine, așa că nu se suprascrie niciun firmware.',
  'writeConfirm.eraseEmpty':
    'Scrierea șterge totuși blocul de 64 KB al {bank:gen} din memoria flash a camerei (deja gol) și îl programează.',
  'writeConfirm.erase':
    'Aceasta șterge blocul de 64 KB al {bank:gen} din memoria flash a camerei și îl programează.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'Imaginea este scrisă cu {key}. Toate celelalte sloturi sunt scrise la fel.',
  'writeConfirm.backup':
    'Înainte să se trimită ceva, {bank:acc} este citit din nou și salvat ca o singură arhivă zip descărcată: {file}. Verificați dacă a ajuns în dosarul de descărcări.',
  'writeConfirm.noReset':
    'Nu se trimite nicio resetare. După aceea, deconectați și reconectați camera pentru ca slotul să aibă efect.',
  'writeConfirm.noUsbRecovery':
    'Dacă imaginea nu rulează, camera nu poate fi recuperată prin USB — doar prin SWD/J-Link sau cu un programator SPI.',
  'writeConfirm.ackUnnamed':
    'Înțeleg că acest slot este tratat ca slotul de pornire, fiindcă camera nu spune din ce slot pornește, și că o imagine greșită poate face ca camera să nu mai pornească.',
  'writeConfirm.confirm': 'Da — scriere în {bank:acc}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Înțeleg că acesta este slotul din care pornește camera acum și că o imagine greșită poate face ca camera să nu mai pornească.',
  'ack.recovery':
    'Înțeleg că acesta este slotul de recuperare și că o imagine greșită lasă camera fără o copie de ultimă instanță.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Treceți {bank:acc} la {hz} FPS?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted':
    '{bootsNow}. Imaginea cu patch înlocuiește firmware-ul pe care îl rulează acum.',
  'fpsConfirm.recovery':
    '{bank:ins} este slotul de recuperare, copia de ultimă instanță la care revine bootloader-ul.',
  'fpsConfirm.what':
    '{bank:ins} conține firmware-ul {version}, iar această operație face ca imaginea lui să ruleze la {toHz} Hz în loc de {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(necunoscut)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'Patch-ul modifică {count} octet al imaginii și cuvântul sumei de control, astfel încât suma verificată de bootloader se păstrează. Perechea de chei nu este atinsă.',
    few: 'Patch-ul modifică {count} octeți ai imaginii și cuvântul sumei de control, astfel încât suma verificată de bootloader se păstrează. Perechea de chei nu este atinsă.',
    other:
      'Patch-ul modifică {count} de octeți ai imaginii și cuvântul sumei de control, astfel încât suma verificată de bootloader se păstrează. Perechea de chei nu este atinsă.',
  },
  'fpsConfirm.wayBack':
    'Fișierul decriptat din acea arhivă zip este calea de întoarcere: ca să anulați patch-ul, scrieți-l cu „Scriere imagine decriptată” în {bank:acc}.',
  'fpsConfirm.noReset':
    'Nu se trimite nicio resetare. După aceea, deconectați și reconectați camera pentru ca slotul cu patch să aibă efect.',
  'fpsConfirm.ackUnnamed':
    'Înțeleg că acest slot este tratat ca slotul de pornire, fiindcă camera nu spune din ce slot pornește.',
  'fpsConfirm.confirm': 'Da — patch pe {bank:acc}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Treceți toate sloturile la {hz} FPS?',
  'fpsEvery.titleMixed': {
    one: 'Modificați rata de cadre pentru {count} slot?',
    few: 'Modificați rata de cadre pentru {count} sloturi?',
    other: 'Modificați rata de cadre pentru {count} de sloturi?',
  },
  'fpsEvery.intro': {
    one: 'Aceasta aplică patch-ul pe {count} slot în care patch-ul este disponibil (firmware {version}):',
    few: 'Aceasta aplică patch-ul pe {count} sloturi în care patch-ul este disponibil (firmware {version}):',
    other:
      'Aceasta aplică patch-ul pe {count} de sloturi în care patch-ul este disponibil (firmware {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (slotul din care pornește acum această cameră și slotul de recuperare)',
  'fpsEvery.role.booted': '{bank} (slotul din care pornește acum această cameră)',
  'fpsEvery.role.recovery': '{bank} (slotul de recuperare, copia de ultimă instanță)',
  'fpsEvery.role.bootUnnamed': '{bank} (camera nu spune din ce slot pornește)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: de la {fromHz} Hz la {toHz} Hz, {count} octet și cuvântul sumei de control.',
    few: '{bank}: de la {fromHz} Hz la {toHz} Hz, {count} octeți și cuvântul sumei de control.',
    other:
      '{bank}: de la {fromHz} Hz la {toHz} Hz, {count} de octeți și cuvântul sumei de control.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Rămân neschimbate: {others}',
  'fpsEvery.orderOne': 'Scrie doar {bank:acc} și îl recitește.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Sunt scrise în această ordine: {order}. Fiecare este recitit înainte de următorul, iar primul eșec le oprește pe celelalte.',
  'fpsEvery.orderBootedLast':
    'Sunt scrise în această ordine: {order}. Slotul din care pornește camera acum este ultimul, așa că un eșec oprește totul înaintea lui. Fiecare este recitit înainte de următorul, iar primul eșec le oprește pe celelalte.',
  'fpsEvery.wayBack':
    'Fișierele decriptate din acea arhivă zip sunt calea de întoarcere: ca să anulați patch-ul unui slot, scrieți fișierul lui cu „Scriere imagine decriptată” în acel slot.',
  'fpsEvery.noReset':
    'Nu se trimite nicio resetare. După aceea, deconectați și reconectați camera pentru ca sloturile cu patch să aibă efect.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Înțeleg că aceasta scrie {banks} și că o imagine greșită poate face ca camera să nu mai pornească.',
  'fpsEvery.confirm': {
    one: 'Da — patch pe {count} slot',
    few: 'Da — patch pe {count} sloturi',
    other: 'Da — patch pe {count} de sloturi',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank:ins} — {what}: slotul recitit este identic cu ce s-a scris.',
  'outcome.mismatch': '{bank:ins} — {what}: recitirea NU se potrivește cu ce s-a scris.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank:ins} — {what}: recitirea a fost făcută, dar nu a fost comparată, așa că această scriere nu este verificată aici.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'Comanda de confirmare a scrierii a returnat starea {status}.',
  'outcome.wasEmpty':
    '{bank:ins} era gol înainte de această scriere, așa că nu s-a suprascris niciun firmware.',
  'outcome.provenVerified':
    'Dovedit până acum: datele au fost transmise, scrierea a fost confirmată, iar slotul recitit este identic cu ce s-a scris. NU este dovedit: că bootloader-ul va alege acest slot sau că imaginea rulează.',
  'outcome.provenCommitted':
    'Dovedit până acum: datele au fost transmise și scrierea a fost confirmată. NU este dovedit: că bootloader-ul va alege acest slot sau că imaginea rulează.',
  'outcome.replug':
    '**ACUM DECONECTAȚI ȘI RECONECTAȚI CAMERA.** Nu s-a trimis nicio resetare, așa că slotul are efect doar după ce alimentarea camerei este oprită și pornită cu adevărat. Apoi citiți din nou sloturile: doar versiunea și slotul activ raportate de cameră lămuresc lucrurile.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**ACUM DECONECTAȚI ȘI RECONECTAȚI CAMERA.** Nu s-a trimis nicio resetare. Apoi citiți din nou sloturile.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Salvat mai întâi, ca descărcare: {file}.',
  'outcome.wayBackOne':
    'Fișierul decriptat din ea este calea de întoarcere („Scriere imagine decriptată” pe același slot).',
  'outcome.wayBackMany':
    'Fișierele decriptate din ea sunt calea de întoarcere („Scriere imagine decriptată” pe fiecare slot).',
  'outcome.checkDownloads': 'Verificați dacă a ajuns în dosarul de descărcări.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title':
    '{bank:ins} — patch aplicat de la {fromHz} Hz la {toHz} Hz (firmware {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'Recitirea diferă de dump-ul salvat doar la {count} octet planificat: locurile patch-ului și cuvântul sumei.',
    few: 'Recitirea diferă de dump-ul salvat doar la cei {count} octeți planificați: locurile patch-ului și cuvântul sumei.',
    other:
      'Recitirea diferă de dump-ul salvat doar la cei {count} de octeți planificați: locurile patch-ului și cuvântul sumei.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'Recitirea NU diferă doar așa cum s-a planificat: octeți neașteptați: {unexpected}; octeți lipsă: {count}.',
    few: 'Recitirea NU diferă doar așa cum s-a planificat: octeți neașteptați: {unexpected}; octeți lipsă: {count}.',
    other:
      'Recitirea NU diferă doar așa cum s-a planificat: octeți neașteptați: {unexpected}; octeți lipsă: {count}.',
  },
  'fpsOutcome.notTaken': 'Recitirea nu a fost făcută, așa că patch-ul nu este verificat aici.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Toate sloturile: {done} din {count} cu patch aplicat, în această ordine: {order}.',
    few: 'Toate sloturile: {done} din {count} cu patch aplicat, în această ordine: {order}.',
    other: 'Toate sloturile: {done} din {count} cu patch aplicat, în această ordine: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'Recitirea diferă de slotul salvat doar la {count} octet planificat.',
    few: 'Recitirea diferă de slotul salvat doar la cei {count} octeți planificați.',
    other: 'Recitirea diferă de slotul salvat doar la cei {count} de octeți planificați.',
  },
  'fpsEveryOutcome.notTaken': 'Recitirea nu a fost făcută.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Oprit: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Nescrise: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Niciun slot al acestei camere nu poate fi scris de aici.',
  'keys.title': 'Cheile pentru scrieri',
  'keys.chain': 'Lanț',
  'keys.chainPlain':
    'lanțul necriptat din 2014: fiecare slot este stocat necriptat, așa că niciunul nu conține o cheie',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Scris ca',
  'keys.writtenPlain': 'imaginea ca atare, fără cheie, în orice slot',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Transferat ca',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Stocat ca',
  'keys.refused': 'Refuzat',
  'keys.bootedBank': 'Slotul de pornire',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank:acc} conține {key:acc}',
  'keys.theBootedBank': 'slotul de pornire',
  'keys.unnamedKey': 'o cheie pe care pagina nu o poate numi',
  'keys.bootedBanksKey': 'cheia slotului de pornire',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; toate sloturile sunt scrise la fel',

  /* "What these buttons do", below the tab. */
  'how.title': 'Ce fac aceste butoane',
  'how.read': '**Citire sloturi** și **Extragere** nu schimbă nimic în cameră.',
  'how.flash':
    '**Scriere imagine decriptată** ia o imagine necriptată, o criptează așa cum are nevoie firmware-ul acelui slot înainte de transfer și arată planul. **Scriere octeți bruți** transferă fișierul exact așa cum este dat. Niciunul nu trimite nimic până nu confirmați.',
  'how.ff':
    'Scrierea în slotul {letterR} cere confirmarea suplimentară, ca orice scriere în slotul de recuperare. Un slot **gol** (fereastra antetului se citește numai 0xFF, cum este {b:acc} pe multe camere din 2014) este o stare, nu o defecțiune. Se scrie exact ca orice alt slot.',
  'how.copy':
    '**Restaurare din copia de rezervă** ia un .bin (o imagine completă de 4 MB a memoriei flash, cum ar fi o citire J-Link) sau un .zip care conține una (un fișier de rulare Preserve sau arhiva zip salvată de „Extragere și decriptare 4.x/Nano” ori de „Extragerea tuturor selectorilor”), decupează din ea acest slot, îl decriptează și arată planul; dacă o copie de rezervă pare să fie a altei camere sau a altui firmware, planul o spune.',
  'how.fps':
    '**Trecere la N FPS** de pe rândul unui slot modifică imaginea acelui slot pentru o rată de cadre mai mare, iar **Trecere la N FPS în toate sloturile** face același lucru în fiecare slot în care patch-ul este disponibil, cu o singură confirmare, slotul din care pornește camera acum fiind ultimul. Pentru un slot în care nu este disponibil, pagina spune de ce.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Fiecare scriere își salvează mai întâi slotul**: slotul este citit din nou și salvat ca o singură arhivă zip descărcată, numită după oră, numărul de serie al camerei, firmware, slot și scriere (de exemplu `{example}`), care conține slotul așa cum este stocat, imaginea lui decriptată și o notă despre ce este fiecare fișier. Ca să reveniți, scrieți fișierul decriptat din arhivă cu **Scriere imagine decriptată**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'O scriere șterge un slot de 64 KB și îl programează. Bootloader-ul de la `{address}` și configurația de pornire nu sunt scrise niciodată aici și nu există nicio comandă pentru alegerea slotului activ. Slotul are efect doar după ce camera este deconectată și reconectată.',
} satisfies Translation<'slots', 'ro'>;
