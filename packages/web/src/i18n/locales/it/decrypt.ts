/**
 * Namespace `decrypt`, italiano (it), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/DecryptView.tsx, hooks/useOfflineDecrypt.ts, hooks/useSlotFileDecrypt.ts,
 * components/DetectionBox.tsx, components/FilePickerButton.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useOfflineDecrypt: the status line. */
  'status.noFile': 'Nessun file scelto.',
  'status.reading': 'Lettura del file in corso…',
  'status.notUsable': 'Non è un dump utilizzabile.',
  'status.building': 'Creazione dell’archivio in corso…',
  'status.nothingDecrypted':
    'Nessuna immagine decifrata: il motivo è nel registro. Il manifest è nei tuoi download.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Fatto: {done}/{count} slot decifrato. Controlla i tuoi download.',
    many: 'Fatto: {done}/{count} di slot decifrati. Controlla i tuoi download.',
    other: 'Fatto: {done}/{count} slot decifrati. Controlla i tuoi download.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Decifra un dump che hai già',
  'offline.description': 'Un dump completo della flash, decifrato slot per slot.',
  'offline.intro':
    'Il passaggio 2 della scheda 4.x/Nano decifra già tutto ciò che legge, quindi questa parte ti serve solo se l’immagine della flash viene da altrove: un’esecuzione precedente, J-Link o un programmatore SPI. Il file viene letto in locale e non viene mai caricato. **Questa parte funziona in tutti i browser**, compresi Safari e iOS, perché non richiede l’accesso USB.',
  'offline.actions': 'Azioni di decifratura offline',
  'offline.choose': 'Scegli il file del dump…',
  'offline.panel': 'Decifratura offline',
  'offline.detectedTitle': 'Famiglia di firmware rilevata',
  'offline.detectedIntro':
    'Non c’è nessuna termocamera collegata, quindi la famiglia viene valutata dalle immagini contenute nel file stesso. La chiave viene comunque ricavata dal testo cifrato di ogni slot; questa valutazione serve solo a dare il nome della famiglia di firmware nel rapporto.',
  'offline.scoreBasis': 'dalle immagini nel file',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Decifra uno slot del firmware',
  'slot.description': 'Uno slot, da un file: 64 KB, come lo conserva la termocamera.',
  'slot.intro':
    'Scegli un file che contiene un solo slot del firmware: 65.536 byte, come lo salva il dump di uno slot nella scheda <link>{tab}</link>, oppure i 64 KB all’indirizzo di uno slot in un dump completo della flash. La pagina trova la chiave dai byte dello slot stesso, decifra l’immagine e te la offre da scaricare, mostrando la chiave, la dimensione e lo SHA-256. Non serve nessuna termocamera, quindi funziona senza nulla collegato.',
  'slot.refusedIntro':
    'Un file che non è un singolo slot, che non contiene un’immagine del firmware o che non si decifra viene rifiutato, con il motivo. Uno slot cancellato viene indicato come tale e non c’è nulla da decifrare.',
  'slot.actions': 'Azioni sul file dello slot',
  'slot.choose': 'Scegli il file dello slot…',
  'slot.decrypting': 'Decifratura di {file} in corso…',
  'slot.unreadable': 'Non è stato possibile leggere il file.',
  'slot.notDecrypted':
    'Non decifrato: {file} non è uno slot del firmware che questa pagina sa decifrare.',
  'slot.nothingWritten':
    'Non è stato scritto nulla da nessuna parte. Scegli un file di uno slot da 64 KB, oppure un dump completo nella sezione qui sopra.',
  'slot.erased': '{file} è uno slot cancellato.',
  'slot.resultTitle': 'Slot del firmware decifrato',
  'slot.file': 'File',
  'slot.fileSize': 'Dimensione del file',
  'slot.fileSha': 'SHA-256 del file',
  'slot.imageVersion': 'Versione dell’immagine',
  'slot.imageSize': 'Dimensione dell’immagine',
  'slot.imageSha': 'SHA-256 dell’immagine',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Somma di controllo',
  'slot.notComputed': 'non calcolata per questa forma',
  'slot.family': 'Famiglia',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (rilevata dall’immagine)',
  'slot.familyMismatch':
    '{name}: la somma non è il valore che questa famiglia accetta, quindi il bootloader non accetterebbe l’immagine così com’è',
  'slot.unknown': 'sconosciuta',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': 'Chiave',
  'slot.keyPlain': 'nessuna: lo slot contiene l’immagine in chiaro (la catena in chiaro del 2014)',
  'slot.keyFfB': 'Chiave B della coppia 1.3.0.8 FF',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Conservata come',
  'slot.storedAsFfB':
    'l’immagine in XOR con il flusso di chiave della chiave B, finestra dell’intestazione invariata',
  'slot.keyNone': 'nessuna',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Forma della chiave',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce':
    '{k}: l’immagine stessa contiene questa forma una sola volta, e questo la identifica',
  'slot.keyFormDefault':
    '{k}: nessuna forma compare una sola volta nell’immagine, quindi viene mostrata quella predefinita della famiglia',
  'slot.resultActions': 'Azioni sull’immagine decifrata',
  'slot.download': 'Scarica {file}',
  'slot.downloadFallback': 'l’immagine decifrata',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Rilevata',
  'detection.score': 'Punteggio',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} su 1.00, {basis}',
  'detection.readAs': 'Letta come',
  'detection.summary': 'Riepilogo',
  'detection.why': 'Perché:',
  'detection.ambiguous':
    '**Gli indizi non hanno stabilito di quale famiglia si tratti.** O la vincitrice non ha ottenuto un punteggio migliore della soluzione generica di ripiego, o la seconda le è arrivata troppo vicino per decidere. La decifratura non ne risente, perché la chiave viene comunque ricavata dal testo cifrato, ma la famiglia indicata nel rapporto, e tutto ciò che dipende da essa, è un’ipotesi.',
} satisfies Translation<'decrypt', 'it'>;
