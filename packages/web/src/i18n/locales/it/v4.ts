/**
 * Namespace `v4`, italiano (it), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/V4View.tsx, hooks/useDumpPanel.ts, components/CameraIdentity.tsx,
 * components/OptionsDetails.tsx, lib/options.ts.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useDumpPanel: the status line. */
  'status.starting': 'Avvio in corso…',
  'status.building': 'Creazione dell’archivio in corso…',
  'status.cancelling': 'Annullamento in corso: verrà salvato quanto letto finora…',
  'status.refused': 'Rifiutata: non è stato letto nulla. Vedi il messaggio sopra il registro.',
  'status.sweepDone':
    'Fatto: {armed}/{total} selettori aperti, {withData} con dati. Controlla i tuoi download.',
  'status.sweepDoneCancelled':
    'Fatto: {armed}/{total} selettori aperti, {withData} con dati (annullato). Controlla i tuoi download.',
  'status.dumpDone': 'Fatto: {read}/{expected} finestre lette. Controlla i tuoi download.',
  'status.dumpDoneCancelled':
    'Fatto: {read}/{expected} finestre lette (annullato). Controlla i tuoi download.',
  'status.dumpDoneIncomplete':
    'Fatto: {read}/{expected} finestre lette (incompleto, vedi il registro). Controlla i tuoi download.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'La termocamera non corrisponde alla famiglia 4.x/Nano, e questa scheda legge solo quella famiglia. Non è stato letto nulla. Per una termocamera 0.x o 1.x (build del 2014 o del 2016), usa «{tab}».',
  'refusal.otherFamily':
    'La termocamera sembra una {name} ({id}), non una termocamera 4.x/Nano, e questa scheda legge solo 4.x/Nano. Non è stato letto nulla. Per una termocamera 0.x o 1.x (build del 2014 o del 2016), usa «{tab}».',
  'refusal.legacyLine':
    'La termocamera esegue {version}, una build 0.x o 1.x (2014 o 2016), e questa scheda legge solo 4.x/Nano. Non è stato letto nulla oltre alla versione. Per una termocamera 0.x o 1.x, usa «{tab}».',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Dump',
  'dump.actions': 'Azioni di dump',
  'dump.start': 'Avvia il dump',
  'dump.panel': 'Dump',
  'dump.how':
    'Entrambi chiedono prima alla termocamera quale firmware esegue: la versione, con `{getInfo}` (l’unica lettura a cui ogni build Seek risponde allo stesso modo) e, solo se quella build si può leggere tramite USB, un `{begin}` semplice, uno con token e una sola lettura. È così che la pagina capisce di quale famiglia è la termocamera. Questa scheda legge solo la famiglia 4.x e Nano. Una termocamera che secondo le risposte appartiene a un’altra famiglia viene rifiutata prima di leggere qualsiasi cosa, e la pagina indica la scheda giusta. Una termocamera che non comunica la versione, o che esegue una build precedente a 0.8.0.0, non viene letta affatto, e la pagina dice perché.',
  'dump.modes':
    '**Avvia il dump** legge ogni blocco raggiunto dalla tabella dei selettori della build stessa. **Estrai tutti i selettori**, in *Opzioni* qui sotto, prova ogni selettore `{begin}` da `{first}` a `{last}` e salva ciò che restituisce ciascuno: è più lento, ma cattura anche i blocchi che la mappa curata salta.',
  'dump.sweep': 'Estrai tutti i selettori ({first}–{last})',
  'dump.sweepNote':
    'Prova ogni selettore e salva ciò che restituisce ciascuno. Più lento di Avvia il dump.',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'Cosa ottieni',
  'output.intro': 'Un unico download `{ext}` che contiene:',
  'output.caption': 'File contenuti nell’archivio scaricato',
  'output.file': 'File',
  'output.what': 'Cos’è',
  'output.flash':
    'l’immagine completa della flash da 4 MB (il riempimento del vuoto e il token di sblocco, se usato, sono in manifest.json)',
  'output.windows': 'ogni blocco da 64 KB esattamente come è arrivato via USB',
  'output.decrypted':
    'ogni slot con un’immagine del firmware, decifrato (se è stata trovata una chiave)',
  'output.reports':
    'rapporto per slot: chiave, posizione della chiave, famiglia e cifrario, SP, entry, SHA-256',
  'output.manifest': 'metadati esatti di lettura, vuoti e decifratura',
  'output.readme': 'cos’è l’acquisizione e quali sono i suoi limiti',
  'output.keyFromDump':
    'La chiave viene ricavata dal dump stesso, quindi non servono file di chiavi né segreti del dispositivo.',
  'output.bestEffort':
    'La decifratura resta comunque un tentativo. Se non si trova una chiave, per esempio su un esemplare il cui bootloader ricava la chiave dall’OTP del chip, che non è presente in un dump della flash, quello slot viene semplicemente saltato e il resto dell’archivio non ne risente.',
  'gap.summary': 'Il vuoto a {address}',
  'gap.where':
    'Il set di comandi USB offre un selettore di finestra di lettura per ogni blocco da 64 KB della flash da 4 MB, tranne `{range}`. Quel blocco viene riempito con `{fill}` nell’immagine combinata e annotato in `{manifest}`.',
  'gap.costs':
    '**In pratica non ti costa nulla.** Sulla maggior parte delle termocamere quel blocco è semplicemente flash cancellata, che si legge comunque come `{fill}`: il riempimento corrisponde a ciò che c’è davvero e l’immagine è completa.',
  'gap.redundant':
    'E quando il blocco *è* in uso, ciò che contiene è una copia ridondante. Queste termocamere tengono la stessa immagine del firmware in diversi slot da 64 KB: in ogni dump con più slot controllato durante la creazione di questa pagina, tutti gli slot sono stati decifrati in un firmware identico byte per byte, in un caso su quattro slot scritti con due chiavi diverse. Sull’unico esemplare visto con un’immagine vera a `{address}`, era identica byte per byte alle copie a `{before}` e `{after}`, quindi l’archivio contiene comunque quel firmware, solo letto da un altro indirizzo.',
  'gap.fine':
    'È per questa ridondanza che una termocamera il cui `{address}` si rilegge come `{fill}` non ha problemi: il firmware avviabile esiste ancora negli altri slot. In ogni caso niente in questa scheda scrive nel dispositivo: il vuoto riguarda solo il file che scarichi.',
  'gap.complete':
    'Se vuoi davvero un’immagine completa byte per byte, per esempio per confrontare la flash con un riferimento, leggila tramite SWD/J-Link o con un programmatore SPI.',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': 'Non letta: la termocamera non ha detto quale firmware esegue.',
  'identity.unsupported': 'Non letta: questa termocamera non si può leggere in questo modo.',
  'identity.title': 'Termocamera rilevata',
  'identity.firmware': 'Firmware',
  'identity.scoreBasis': 'dalle risposte della termocamera, prima di leggere qualsiasi slot',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Opzioni',
  'options.subtitle': '— i valori predefiniti sono corretti; qui non devi cambiare nulla.',
  'options.chunk': 'chunk (byte control-IN)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'byte di gap-fill',
  'options.retries': 'tentativi per finestra',
  'options.retryDelay': 'pausa tra i tentativi (ms)',
  'options.recipient': 'recipient del trasferimento di controllo',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'automatico',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'decifra il firmware',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'sì',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'no',
  'options.help':
    '**chunk** è la dimensione di ogni lettura control-IN, al massimo 64: un pacchetto EP0. Una lettura più lunga può perdere un pacchetto nella ROM di avvio della termocamera quando questa è inattiva a una frequenza bassa, quindi un valore più grande viene letto 64 byte alla volta; uno più piccolo viene usato così com’è, e se una termocamera si blocca la pagina scende da sola a un valore più basso e continua. **gap-fill** è il byte scritto nell’unico blocco da 64 KB che USB non raggiunge. **recipient** vale interface per impostazione predefinita e passa a device se il browser non riesce ad acquisire l’interfaccia 0: il firmware accetta entrambi.',
  'options.chunkRange': 'chunk deve essere tra 1 e {max}, ricevuto {value}',
  'options.gapFillByte': 'gap-fill deve essere un singolo byte, ricevuto {value}',
  'options.retriesMin': 'i tentativi devono essere zero o più, ricevuto {value}',
  'options.retryDelayMin': 'la pausa tra i tentativi deve essere zero o più, ricevuto {value}',
} satisfies Translation<'v4', 'it'>;
