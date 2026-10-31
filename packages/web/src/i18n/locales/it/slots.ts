/**
 * Namespace `slots`, italiano (it), translated from the English source: the firmware-slots tab.
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
  'section.title': 'Gestisci gli slot del firmware',
  'section.badge': 'Scrive nella flash',
  'section.description':
    'Il pulsante Leggi slot chiede alla termocamera cosa esegue, legge i suoi tre slot del firmware ({a}, {b} e {r}) e mostra cosa contiene ciascuno. Leggere ed estrarre non cambia nulla. Un pulsante di scrittura chiede conferma prima che venga inviato qualsiasi byte.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Questa pagina può scrivere nella memoria flash della termocamera.** Una scrittura cancella uno slot da 64 KB e lo programma. Un’immagine strutturalmente valida che però non funziona rende impossibile l’avvio della termocamera, e il bootloader non ha USB: solo SWD/J-Link o un programmatore SPI possono recuperarla. Prima fai il dump dello slot e conserva il file.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Azioni sugli slot',
  'actions.read': 'Leggi slot',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Slot',

  /* Before any read. */
  'empty.connected': 'Premi Leggi slot.',
  'empty.disconnected': 'Collega la termocamera, poi premi Leggi slot.',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Questa build non è supportata qui, quindi nessuno slot è stato letto e nessuno può essere scritto.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Non identificata: questa pagina non riesce a capire quale build esegue la termocamera.',
  'refusal.notIdentified.body':
    'La termocamera non ha fornito una versione del firmware utilizzabile, quindi nessuno slot è stato letto e non è stato aperto nulla. Questa pagina copre le build {minVersion} e successive. Le build precedenti a {minVersion} sono fuori da ciò che la pagina degli slot supporta, quindi una termocamera con una di quelle build non viene mai letta qui.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Se la termocamera esegue una build supportata, forse si sta solo avviando. {hint}',
  'refusal.title': 'Rifiutata: non è stato aperto nulla.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Lettura in corso ...',
  'status.readingAgain': 'Nuova lettura degli slot in corso ...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Letto. {read}/{count} slot letto.',
    many: 'Letto. {read}/{count} di slot letti.',
    other: 'Letto. {read}/{count} slot letti.',
  },
  'status.unsupported': 'Non supportata su questa build: nessuno slot è stato letto.',
  'status.refused': 'Rifiutata: non è stato aperto nulla. Vedi il messaggio sotto il registro.',
  'status.disconnected': 'Dispositivo scollegato: leggi di nuovo gli slot.',
  'status.newDevice': 'Nuovo dispositivo selezionato: leggi di nuovo gli slot.',
  'status.dumping': 'Dump {bank:gen} in corso ...',
  'status.dumped': 'Dump {bank:gen} completato.',
  'status.readingImage': 'Lettura dell’immagine in corso ...',
  'status.ready': 'Pronto: controlla il piano, poi avvia la scrittura.',
  'status.rejected': 'Rifiutato: vedi il registro qui sopra.',
  'status.writing': 'Scrittura in corso ...',
  'status.patching': 'Applicazione della patch {bank:dat} in corso ...',
  'status.patchingEvery': 'Applicazione della patch a ogni slot in corso ...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Scritto, ma la rilettura non corrisponde: vedi il risultato.',
  'status.written.verified': 'Scritto. La rilettura dello slot corrisponde a quanto scritto.',
  'status.written.notCompared': 'Scritto. La rilettura non è stata confrontata: vedi il risultato.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Patch applicata, ma la rilettura non differisce solo come previsto: vedi il risultato.',
  'status.patched.ok': 'Patch applicata. La rilettura dello slot è come previsto.',
  'status.patched.unchecked':
    'Patch applicata. La rilettura non è stata controllata: vedi il risultato.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Interrotto {bank:dat}: patch applicata a {count} slot; vedi il risultato.',
    many: 'Interrotto {bank:dat}: patch applicata a {count} di slot; vedi il risultato.',
    other: 'Interrotto {bank:dat}: patch applicata a {count} slot; vedi il risultato.',
  },
  'status.every.unchecked': {
    one: 'Patch applicata a {count} slot, ma una rilettura non è stata controllata come previsto: vedi il risultato.',
    many: 'Patch applicata a {count} di slot, ma una rilettura non è stata controllata come previsto: vedi il risultato.',
    other:
      'Patch applicata a {count} slot, ma una rilettura non è stata controllata come previsto: vedi il risultato.',
  },
  'status.every.ok': {
    one: 'Patch applicata a {count} slot. La rilettura è come previsto.',
    many: 'Patch applicata a {count} di slot. Ogni rilettura è come previsto.',
    other: 'Patch applicata a {count} slot. Ogni rilettura è come previsto.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Annullato: non è stato scritto nulla.',
  'status.cancelled.one':
    'Annullato dopo l’invio della conferma della scrittura {bank:gen}: lo slot potrebbe essere scritto solo in parte. Leggilo prima di farci affidamento.',
  'status.cancelled.many':
    'Annullato dopo l’invio delle conferme della scrittura {banks:gen}: ognuno potrebbe essere scritto solo in parte. Leggili prima di farci affidamento.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Prima collega la termocamera.',
  'gate.busy': 'È in corso un’altra operazione: aspetta che finisca.',
  'gate.readFirst': 'Prima leggi gli slot.',
  'gate.cameraRefused':
    'Su questa termocamera non si può scrivere da qui, per il motivo indicato nel riquadro qui sopra. Non viene inviato nulla.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Non letto: {reason}. Leggi di nuovo gli slot prima di scriverlo.',
  'gate.notReadNoReason':
    'Non letto: questo slot non è stato letto. Leggi di nuovo gli slot prima di scriverlo.',
  'gate.emptyNotWritable': 'Questo slot è vuoto e non può essere scritto su questa build: {reason}',
  'gate.noSuchBank': 'Questa build non ha uno slot del genere.',

  /* The bank table. */
  'table.caption':
    'Ogni slot del firmware di questa termocamera ({a}, {b} e {r}), come letto e controllato nel browser',
  'table.col.bank': 'Slot',
  'table.col.firmware': 'Firmware',
  'table.col.size': 'Dimensione',
  'table.col.key': 'Chiave',
  'table.col.bootable': 'Avviabile',
  'table.col.sha': 'SHA-256 in chiaro',
  'table.col.actions': 'Azioni',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'non letto: {reason}',
  'table.notReadNoReason': 'non letto: lo slot non è stato letto',
  /* A badge: the bank holds no image. */
  'table.empty': 'vuoto',
  'table.emptyNote':
    'Nessuna immagine: la finestra dell’intestazione di questo slot si legge tutta come 0xFF, quindi non viene decifrato nulla e scriverlo non sovrascrive alcun firmware.',
  /* {reason} is core's. */
  'table.emptyWritable': 'Può essere scritto.',
  'table.emptyNotWritable': 'Non può essere scritto su questa build: {reason}',
  'table.unknownVersion': 'versione sconosciuta',
  /* {id} is the image id in hex. */
  'table.imageId': 'immagine {id}',
  'table.noImage': 'nessuna immagine',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'slot da {size} B',
  'table.imageSize': 'immagine da {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'nessuna (in chiaro)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— niente da avviare',
  'table.boot.bootable': 'avviabile: il bootloader lo accetta',
  'table.boot.notBootable': 'non avviabile: saltato all’avvio',
  'table.boot.recoveryOnly':
    'solo recupero: {letterR} viene eseguito quando {letterA} e {letterB} non contengono nulla che il bootloader accetti (misurato su una termocamera per una forma precedente di questa immagine); non è stato testato se questa forma si avvii',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'sconosciuto: {why}',
  /* The row's buttons. */
  'table.dump': 'Estrai',
  'table.flashPlain': 'Scrivi immagine decifrata…',
  'table.flashRaw': 'Scrivi byte grezzi…',
  'table.restore': 'Ripristina da backup completo della flash (.bin o .zip)…',
  'table.makeFps': 'Passa a {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Copia {bank:loc}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: disattivato',
  'table.copyNote':
    'Copia il firmware contenuto in questo slot, come l’ha decifrato questa lettura, nello slot che scegli, qualunque cosa contenga ora. Prima di inviare qualsiasi cosa, potrai controllare il piano.',
  'table.restoreNote':
    'Scegli un backup completo della flash: un .bin (un’intera immagine della flash da 4 MB, come una lettura J-Link) o un .zip che ne contenga uno (un file di esecuzione di Preserve, oppure lo zip salvato da Estrai e decifra 4.x/Nano o da Estrai tutti i selettori). Questo slot viene ritagliato dal file, decifrato e mostrato come piano prima di inviare qualsiasi cosa.',
  'table.fpsNote':
    'Porta questo slot da {fromHz} Hz a {toHz} Hz modificandone i byte. Prima lo slot viene salvato in uno zip scaricato, e il file decifrato al suo interno è la via per tornare indietro.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery': '{booted}, e di recupero: scriverlo richiede una conferma in più.',
  'table.risk.booted': '{booted}: scriverlo richiede una conferma in più.',
  'table.risk.recovery': '{bank}: scriverlo richiede una conferma in più.',
  'table.risk.bootUnnamed':
    'La termocamera non indica lo slot avviato: scriverlo richiede una conferma in più.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied':
    'Patch della frequenza dei fotogrammi applicata: questa immagine funziona a {hz} Hz.',
  'fps.earlierPatch':
    'Patch della frequenza dei fotogrammi non proposta: questo slot contiene una patch precedente a {hz} Hz senza la correzione USB. Ripristina l’immagine originale, poi usa Passa a {hz} FPS.',
  'fps.atRate':
    'Nessuna patch della frequenza dei fotogrammi necessaria: questa build funziona già a {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Patch della frequenza dei fotogrammi non proposta: {reason}',
  'fps.readFirst':
    'prima leggi gli slot: la patch si prepara a partire dall’immagine dello slot stesso',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Tutti gli slot',
  'everyBank.make': 'Passa a {hz} FPS in ogni slot',
  'everyBank.faster': 'Rendi più veloce ogni slot',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Applica la patch {order:dat} con una sola conferma; ognuno viene prima salvato, in un unico zip scaricato, e poi riletto.',
  'everyBank.noteBootedLast':
    'Applica la patch {order:dat} con una sola conferma, per ultimo lo slot da cui la termocamera si avvia ora; ognuno viene prima salvato, in un unico zip scaricato, e poi riletto.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': 'l’immagine {bank:gen}',
  'what.restore': '{bank:acc} di {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Preparato per {bank:acc} all’indirizzo {address}',
  'preview.file': 'File',
  'preview.source': 'Immagine presa da',
  'preview.target': 'Destinazione',
  'preview.targetEmpty':
    '{bank:ins} è vuoto: non contiene immagini, quindi questa scrittura non sovrascrive alcun firmware',
  'preview.readAs': 'Letto come',
  'preview.readAs.ff': 'un’immagine FF {version} decifrata',
  'preview.readAs.plain': 'un’immagine decifrata',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'byte grezzi',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Trasferimento',
  'preview.key': 'Chiave',
  'preview.payload': 'Dati',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} B in {count} blocco da al massimo {chunk} B',
    many: '{size} B in {count} di blocchi da al massimo {chunk} B',
    other: '{size} B in {count} blocchi da al massimo {chunk} B',
  },
  'preview.checksum': 'Somma di controllo del trasferimento',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Contenuto dopo la scrittura',
  'preview.storedNotPredicted': 'non previsto: la verifica è la rilettura',
  'preview.storedPredicted': '{size} B previsti',
  'preview.storedKeyB': '{size} B previsti: l’immagine in XOR con la chiave B, non i dati stessi',
  'preview.savedFirst': 'Salvato prima',
  'preview.compareCaption': 'Cosa cambia {bank:loc}',
  'preview.col.field': 'Campo',
  'preview.col.now': 'Ora',
  'preview.col.after': 'Dopo la scrittura',
  'preview.readFirst': 'Da leggere prima di scrivere:',
  /* {note} is core's note about this write. */
  'preview.note': 'Nota: {note}',
  'preview.nothingSent':
    'Alla termocamera non è stato ancora inviato nulla. La scrittura trasmette questi dati {bank:dat} e conferma la scrittura.',
  'preview.toolbar': 'Azioni di scrittura per {bank:acc}',
  'preview.write': 'Scrivi {bank:loc}…',
  'preview.discard': 'Scarta',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Scrivere {what} {bank:loc} all’indirizzo {address}?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Scriverlo sostituisce il firmware che la termocamera sta eseguendo ora. Se la nuova immagine non funziona, la termocamera potrebbe non avviarsi più.',
  'writeConfirm.recovery':
    '{bank:ins} è lo slot di recupero, la copia di ultima istanza su cui ripiega il bootloader. Scriverlo lascia la termocamera senza quella copia finché non viene ripristinata.',
  'writeConfirm.bootUnnamed':
    'La termocamera non dice da quale slot si avvia, quindi {bank:acc} viene trattato come lo slot da cui si avvia ora. Scriverlo può sostituire il firmware che la termocamera sta eseguendo.',
  'writeConfirm.empty':
    '{bank:ins} è vuoto: non contiene immagini, quindi non viene sovrascritto alcun firmware.',
  'writeConfirm.eraseEmpty':
    'La scrittura cancella comunque il blocco da 64 KB della memoria flash della termocamera corrispondente {bank:dat} (già vuoto) e lo programma.',
  'writeConfirm.erase':
    'Questa operazione cancella un blocco da 64 KB della memoria flash della termocamera, quello {bank:gen}, e lo programma.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'L’immagine viene scritta con {key}. Ogni altro slot viene scritto allo stesso modo.',
  'writeConfirm.backup':
    'Prima di inviare qualsiasi cosa, {bank:acc} viene letto di nuovo e salvato in un unico zip scaricato: {file}. Controlla che sia nella cartella dei download.',
  'writeConfirm.noReset':
    'Non viene inviato alcun reset. Dopo, scollega e ricollega la termocamera perché lo slot abbia effetto.',
  'writeConfirm.noUsbRecovery':
    'Se l’immagine non funziona, la termocamera non può essere recuperata tramite USB, ma solo con SWD/J-Link o un programmatore SPI.',
  'writeConfirm.ackUnnamed':
    'Ho capito che la termocamera non dice da quale slot si avvia, quindi questo viene trattato come quello avviato, e che un’immagine difettosa può rendere impossibile l’avvio della termocamera.',
  'writeConfirm.confirm': 'Sì, scrivi {bank:loc}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Ho capito che questo è lo slot da cui la termocamera si avvia ora e che un’immagine difettosa può rendere impossibile l’avvio della termocamera.',
  'ack.recovery':
    'Ho capito che questo è lo slot di recupero e che un’immagine difettosa lascia la termocamera senza una copia di ultima istanza.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Far funzionare {bank:acc} a {hz} FPS?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted':
    '{bootsNow}. L’immagine con la patch sostituisce il firmware che la termocamera esegue ora.',
  'fpsConfirm.recovery':
    '{bank:ins} è lo slot di recupero, la copia di ultima istanza su cui ripiega il bootloader.',
  'fpsConfirm.what':
    '{bank:ins} contiene il firmware {version}, e questa operazione fa funzionare la sua immagine a {toHz} Hz invece che a {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(sconosciuta)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'La patch cambia {count} byte dell’immagine e la parola della somma di controllo, così la somma che il bootloader controlla resta valida. La coppia di chiavi non viene toccata.',
    many: 'La patch cambia {count} di byte dell’immagine e la parola della somma di controllo, così la somma che il bootloader controlla resta valida. La coppia di chiavi non viene toccata.',
    other:
      'La patch cambia {count} byte dell’immagine e la parola della somma di controllo, così la somma che il bootloader controlla resta valida. La coppia di chiavi non viene toccata.',
  },
  'fpsConfirm.wayBack':
    'Il file decifrato in quello zip è la via per tornare indietro: per annullare la patch, scrivilo {bank:loc} con «Scrivi immagine decifrata».',
  'fpsConfirm.noReset':
    'Non viene inviato alcun reset. Dopo, scollega e ricollega la termocamera perché lo slot con la patch abbia effetto.',
  'fpsConfirm.ackUnnamed':
    'Ho capito che la termocamera non dice da quale slot si avvia, quindi questo viene trattato come quello avviato.',
  'fpsConfirm.confirm': 'Sì, applica la patch {bank:dat}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Far funzionare ogni slot a {hz} FPS?',
  'fpsEvery.titleMixed': {
    one: 'Applicare la patch della frequenza dei fotogrammi a {count} slot?',
    many: 'Applicare la patch della frequenza dei fotogrammi a {count} di slot?',
    other: 'Applicare la patch della frequenza dei fotogrammi a {count} slot?',
  },
  'fpsEvery.intro': {
    one: 'Questa operazione applica la patch a {count} slot per cui è disponibile (firmware {version}):',
    many: 'Questa operazione applica la patch a {count} di slot per cui è disponibile (firmware {version}):',
    other:
      'Questa operazione applica la patch a {count} slot per cui è disponibile (firmware {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (lo slot da cui questa termocamera si avvia ora, e lo slot di recupero)',
  'fpsEvery.role.booted': '{bank} (lo slot da cui questa termocamera si avvia ora)',
  'fpsEvery.role.recovery': '{bank} (lo slot di recupero, la copia di ultima istanza)',
  'fpsEvery.role.bootUnnamed': '{bank} (la termocamera non dice da quale slot si avvia)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: da {fromHz} Hz a {toHz} Hz, {count} byte e la parola della somma di controllo.',
    many: '{bank}: da {fromHz} Hz a {toHz} Hz, {count} di byte e la parola della somma di controllo.',
    other: '{bank}: da {fromHz} Hz a {toHz} Hz, {count} byte e la parola della somma di controllo.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Lasciati come sono: {others}',
  'fpsEvery.orderOne': 'Scrive solo {bank:acc} e lo rilegge.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Vengono scritti in quest’ordine: {order}. Ognuno viene riletto prima del successivo, e il primo errore ferma il resto.',
  'fpsEvery.orderBootedLast':
    'Vengono scritti in quest’ordine: {order}. Lo slot da cui la termocamera si avvia ora va per ultimo, così un errore ferma tutto prima di arrivarci. Ognuno viene riletto prima del successivo, e il primo errore ferma il resto.',
  'fpsEvery.wayBack':
    'I file decifrati in quello zip sono la via per tornare indietro: per annullare la patch di uno slot, scrivi il suo file in quello slot con «Scrivi immagine decifrata».',
  'fpsEvery.noReset':
    'Non viene inviato alcun reset. Dopo, scollega e ricollega la termocamera perché gli slot con la patch abbiano effetto.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Ho capito cosa scrive questa operazione ({banks}) e che un’immagine difettosa può rendere impossibile l’avvio della termocamera.',
  'fpsEvery.confirm': {
    one: 'Sì, applica la patch a {count} slot',
    many: 'Sì, applica la patch a {count} di slot',
    other: 'Sì, applica la patch a {count} slot',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: la rilettura dello slot corrisponde a quanto scritto.',
  'outcome.mismatch': '{bank} — {what}: la rilettura NON corrisponde a quanto scritto.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: la rilettura è stata fatta ma non confrontata, quindi questa scrittura qui non è verificata.',
  /* {status} is a hex status code. */
  'outcome.commitStatus':
    'La conferma della scrittura sulla termocamera ha restituito lo stato {status}.',
  'outcome.wasEmpty':
    '{bank:ins} era vuoto prima di questa scrittura, quindi non è stato sovrascritto alcun firmware.',
  'outcome.provenVerified':
    'Dimostrato finora: i dati sono stati trasmessi e la scrittura confermata, e la rilettura dello slot corrisponde a quanto scritto. NON dimostrato: che il bootloader sceglierà questo slot, o che l’immagine funzioni.',
  'outcome.provenCommitted':
    'Dimostrato finora: i dati sono stati trasmessi e la scrittura confermata. NON dimostrato: che il bootloader sceglierà questo slot, o che l’immagine funzioni.',
  'outcome.replug':
    '**ORA SCOLLEGA E RICOLLEGA LA TERMOCAMERA.** Non è stato inviato alcun reset, quindi lo slot ha effetto solo dopo averla davvero spenta e riaccesa. Poi leggi di nuovo gli slot: solo la versione e lo slot attivo comunicati dalla termocamera danno la conferma.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**ORA SCOLLEGA E RICOLLEGA LA TERMOCAMERA.** Non è stato inviato alcun reset. Poi leggi di nuovo gli slot.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Salvato prima, come download: {file}.',
  'outcome.wayBackOne':
    'Il file decifrato al suo interno è la via per tornare indietro («Scrivi immagine decifrata» sullo stesso slot).',
  'outcome.wayBackMany':
    'I file decifrati al suo interno sono la via per tornare indietro («Scrivi immagine decifrata» su ogni slot).',
  'outcome.checkDownloads': 'Controlla che sia nella cartella dei download.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank} — patch applicata da {fromHz} Hz a {toHz} Hz (firmware {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'La rilettura differisce dal dump salvato solo nel {count} byte previsto, nei punti della patch e nella parola della somma.',
    many: 'La rilettura differisce dal dump salvato solo nei {count} di byte previsti, nei punti della patch e nella parola della somma.',
    other:
      'La rilettura differisce dal dump salvato solo nei {count} byte previsti, nei punti della patch e nella parola della somma.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'La rilettura NON differisce solo come previsto: {unexpected} byte inattesi e {count} byte mancante.',
    many: 'La rilettura NON differisce solo come previsto: {unexpected} byte inattesi e {count} di byte mancanti.',
    other:
      'La rilettura NON differisce solo come previsto: {unexpected} byte inattesi e {count} byte mancanti.',
  },
  'fpsOutcome.notTaken': 'La rilettura non è stata fatta, quindi qui la patch non è verificata.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Ogni slot: patch applicata a {done} su {count}, in quest’ordine: {order}.',
    many: 'Ogni slot: patch applicata a {done} su {count}, in quest’ordine: {order}.',
    other: 'Ogni slot: patch applicata a {done} su {count}, in quest’ordine: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'La rilettura differisce dallo slot salvato solo nel {count} byte previsto.',
    many: 'La rilettura differisce dallo slot salvato solo nei {count} di byte previsti.',
    other: 'La rilettura differisce dallo slot salvato solo nei {count} byte previsti.',
  },
  'fpsEveryOutcome.notTaken': 'La rilettura non è stata fatta.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Interrotto: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Non scritti: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Nessuno slot di questa termocamera può essere scritto da qui.',
  'keys.title': 'Chiavi per le scritture',
  'keys.chain': 'Catena',
  'keys.chainPlain':
    'la catena in chiaro del 2014: ogni slot è conservato in chiaro, quindi nessuno contiene una chiave',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Scritto come',
  'keys.writtenPlain': 'l’immagine così com’è, senza chiave, in qualsiasi slot',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Trasferito come',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Conservato come',
  'keys.refused': 'Rifiutato',
  'keys.bootedBank': 'Slot avviato',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank:ins} contiene {key:acc}',
  'keys.theBootedBank': 'lo slot avviato',
  'keys.unnamedKey': 'una chiave che la pagina non sa indicare',
  'keys.bootedBanksKey': 'la chiave dello slot avviato',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; ogni slot viene scritto allo stesso modo',

  /* "What these buttons do", below the tab. */
  'how.title': 'Cosa fanno questi pulsanti',
  'how.read': '**Leggi slot** ed **Estrai** non cambiano nulla nella termocamera.',
  'how.flash':
    '**Scrivi immagine decifrata** prende un’immagine in chiaro, la cifra come richiede il firmware di quello slot prima del trasferimento e mostra il piano. **Scrivi byte grezzi** trasferisce il file esattamente com’è. Nessuno dei due invia nulla finché non confermi.',
  'how.ff':
    'Scrivere {letterR} richiede la conferma in più, come ogni scrittura dello slot di recupero. Uno slot **vuoto** (la finestra dell’intestazione si legge tutta come 0xFF, come {b:loc} di molte termocamere del 2014) è uno stato, non un guasto. Si scrive esattamente come qualsiasi altro slot.',
  'how.copy':
    '**Ripristina da backup completo della flash** prende un .bin (un’intera immagine della flash da 4 MB, come una lettura J-Link) o un .zip che ne contenga uno (un file di esecuzione di Preserve, oppure lo zip salvato da Estrai e decifra 4.x/Nano o da Estrai tutti i selettori), ne ritaglia questo slot, lo decifra e mostra il piano; se il backup sembra di un’altra termocamera o di un altro firmware, il piano lo dice.',
  'how.fps':
    '**Passa a N FPS** sulla riga di uno slot modifica l’immagine di quello slot portandola a una frequenza dei fotogrammi più alta, e **Passa a N FPS in ogni slot** fa lo stesso su ogni slot per cui è disponibile, con una sola conferma, per ultimo lo slot da cui la termocamera si avvia ora. Se per uno slot la patch non è disponibile, la pagina dice perché.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Ogni scrittura salva prima il suo slot**: lo slot viene letto di nuovo e salvato in un unico zip scaricato, con un nome che contiene l’ora, il numero di serie della termocamera, il firmware, lo slot e la scrittura (per esempio `{example}`), e che contiene lo slot così come è conservato, la sua immagine decifrata e una nota su cosa sia ciascun file. Per tornare indietro, scrivi il file decifrato dello zip con **Scrivi immagine decifrata**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Una scrittura cancella uno slot da 64 KB e lo programma. Il bootloader a `{address}` e la configurazione di avvio qui non vengono mai scritti, e non c’è alcun comando per scegliere lo slot attivo. Lo slot ha effetto solo dopo che la termocamera è stata scollegata e ricollegata.',
} satisfies Translation<'slots'>;
