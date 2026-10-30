/**
 * Namespace `info`, italiano (it), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/InfoView.tsx, hooks/useInfoPanel.ts, components/CameraReport.tsx (its labels only: the
 * copyable report text stays English).
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useInfoPanel: the status line. */
  'status.notRead': 'Non ancora letto.',
  'status.reading': 'Lettura in corso…',
  'status.noVersion': 'Nessuna versione comunicata.',
  'status.tooOld':
    'Letto. Il firmware {version} è precedente a 0.8.0.0: non è stato letto nient’altro.',
  'status.read': 'Letto. Firmware {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Leggi la termocamera',
  'read.description':
    'Sola lettura. Chiede alla termocamera cosa esegue, come si avvia, quali chiavi contiene e cosa contiene ogni slot: la stessa lettura di seek-fw info. Non viene scritto nulla.',
  'read.actions': 'Azioni di Info',
  'read.button': 'Leggi versione firmware',
  'read.connectFirst': 'Prima collega la termocamera qui sopra, poi premi Leggi versione firmware.',
  'read.showDetails': 'Mostra i dettagli nel registro',
  'read.panel': 'Versione del firmware',
  'result.title': 'Cosa comunica la termocamera',
  'result.version': 'Versione del firmware',
  'result.build': 'Build',
  'result.range': 'Intervallo di versioni',
  'result.tab': 'Scheda per questa termocamera',
  'result.rangeLegacy': '0.x / 1.x: le termocamere del 2014 e del 2016',
  'result.rangeModern': '2.x e successive: le termocamere 4.x, Nano e Mosaic',
  'result.rangeUnknown': 'sconosciuto',
  'result.noVersion':
    '**La termocamera non ha comunicato la versione del firmware.** Non è stato inviato nient’altro. Scollegala, ricollegala, lascia che finisca di avviarsi e leggi di nuovo.',
  'result.noTab': 'Nessuna scheda legge questa build.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Apri <tab>{tab}</tab> per questa termocamera. Quella scheda chiede di nuovo alla termocamera di quale famiglia è prima di leggere qualsiasi cosa e rifiuta una termocamera che non appartiene alla famiglia che copre.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'A cosa serve ogni scheda',
  'tabs.intro':
    'Cinque schede, in quest’ordine. Ognuna è una pagina a sé, e l’intestazione mostra in quale ti trovi.',
  'tabs.caption': 'Le schede, cosa fanno, le termocamere che coprono e se scrivono',
  'tabs.tab': 'Scheda',
  'tabs.does': 'Cosa fa',
  'tabs.cameras': 'Termocamere',
  'tabs.writes': 'Scrive nella termocamera?',
  'tabs.info.does':
    'Legge ciò che comunica la termocamera: il firmware, la famiglia con cui risponde, come si avvia, le chiavi e ogni slot. La stessa lettura di seek-fw info. Non scrive nulla.',
  'tabs.info.cameras': 'Qualsiasi termocamera Seek che WebUSB riesce ad aprire.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'No.',
  'tabs.preserve.does':
    'Crea una copia completa della memoria flash da 4 MB della termocamera, salvando un file di esecuzione dopo ogni passaggio, e può rimettere al suo posto un firmware con patch. Ti guida nei passaggi uno alla volta.',
  'tabs.preserve.cameras':
    'Termocamere con firmware 0.x e 1.x: le build Compact del 2014, le build Compact PRO del 2016 (1.0.3.x) e la build Compact 1.3.0.8 FF (16 Hz).',
  'tabs.preserve.writes':
    'Sì, in due passaggi, e ognuno chiede prima conferma. Rimette la termocamera com’era.',
  'tabs.v4.does':
    'Legge l’intera flash di una termocamera 4.x o Nano e decifra gli slot del firmware che trova. Sola lettura: invia sei comandi di lettura e nessuna scrittura.',
  'tabs.v4.cameras':
    'Termocamere con firmware 4.x (Compact, Compact PRO, Compact XR), Mosaic (10.x e 2.x) e Nano (42.x e 44.x), dal 2018 in poi.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'No.',
  'tabs.decrypt.does':
    'Decifra un file che hai già: un dump completo, slot per slot, oppure un singolo slot del firmware da 64 KB. Il risultato si può scaricare.',
  'tabs.decrypt.cameras':
    'Nessuna. Non usa alcuna termocamera, quindi funziona senza nulla collegato e in qualsiasi browser.',
  'tabs.decrypt.writes': 'No. Scrive solo il file scaricato.',
  'tabs.slots.does':
    'Legge i tre slot del firmware (slot A, slot B e slot di recupero R), mostra cosa contiene ciascuno e da quale si avvia la termocamera, e può estrarre o scrivere uno slot alla volta.',
  'tabs.slots.cameras': 'Termocamere con firmware 0.8.0.0 o successivo.',
  'tabs.slots.writes': 'Sì, uno slot alla volta, e ogni scrittura chiede prima conferma.',

  /* views/InfoView: where the 2016 and 1.3.0.8 FF builds are. Tab names in ** are the tab labels. */
  'split.title': 'Dove si trovano le build 2016 e 1.3.0.8 FF',
  'split.where':
    'Le build Compact PRO del 2016 (1.0.3.0 e 1.0.3.2, comprese le varianti FF) e la build Compact 1.3.0.8 FF (16 Hz) **non** sono termocamere 4.x e non si leggono come tali. Il loro protocollo è quello bloccato del 2014–2017, e il loro firmware conserva gli slot con un cifrario diverso (2016) oppure come la catena in chiaro del 2014, con un percorso che passa solo dal recupero (FF). Per questo si trovano in **Estrai e decifra 0.x/1.x 2014/2016**, e la scheda 4.x/Nano le rifiuta prima di leggere qualsiasi cosa.',
  'split.evidence':
    'Le prove che funzionano nella scheda 0.x/1.x: la procedura Preserve ha una patch ricavata per ciascuna di esse, e le sue esecuzioni nell’emulatore sono verdi per entrambe. La build 1.0.3.0 sul suo dump nativo del 2016 ha superato backup, patch, conferma, lettura completa, ripristino e verifica; la 1.3.0.8 FF ha seguito il suo percorso di recupero. Sulla termocamera di prova, una Compact PRO 1.0.3.0, la lettura del passaggio 02 di Preserve è terminata senza reset e senza scrittura, e la termocamera è stata riconosciuta con il cifrario del 2016. Su queste build la mappa dei selettori 4.x viene rifiutata per 38 dei suoi 63 selettori, quindi la scheda 4.x potrebbe restituire per questi solo lacune.',
  /* "There" is the 4.x/Nano tab: the page once had a firmware-family selector there, and it is gone, so no setting routes these builds into the 4.x/Nano read. */
  'split.stay':
    'Per questo restano nella scheda 0.x/1.x, e la scheda 4.x/Nano non ha un selettore di famiglia che le manderebbe lì.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Termocamera',
  'report.product': 'Prodotto',
  'report.manufacturer': 'Produttore',
  'report.serial': 'Numero di serie',
  'report.platform': 'Piattaforma',
  'report.usbLink': 'Collegamento USB',
  'report.noProduct': '(nessuna stringa di prodotto)',
  'report.none': '(nessuno)',
  'report.unreadable': '(illeggibile)',
  'report.firmware': 'Firmware',
  'report.running': 'In esecuzione',
  'report.bootloader': 'Bootloader',
  'report.family': 'Famiglia di firmware',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Letta come',
  'report.detected': 'Rilevata',
  'report.boot': 'Avvio',
  'report.booted': 'Slot avviato',
  'report.lastStart': 'Ultimo avvio',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'In esecuzione (1.3.0.8)',
  'report.nextStart': 'Prossimo avvio',
  'report.upgradeTarget': 'Destinazione aggiornamento',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(non richiesta)',
  'report.targetConfirmed': '{slot} (confermato via USB)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'non nota: {why}. Un’immagine FF a 16 Hz richiede che la termocamera dica quale build esegue (la scheda degli slot lo chiede)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': 'la build 1.3.0.8 FF a 16 Hz',
  'report.build8Hz': 'la build 1.3.0.8 a 8 Hz',
  'report.keys': 'Chiavi',
  'report.slots': 'Slot',
  'report.slotsCaption':
    'Ogni slot come l’ha trovato la lettura. Sola lettura: a scrivere è la scheda degli slot.',
  'report.slot': 'Slot',
  'report.address': 'Indirizzo',
  'report.version': 'Versione',
  'report.size': 'Dimensione',
  'report.key': 'Chiave',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Accetta',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Footer',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Avviabile',
  'report.bytes': '{count} B',
  'report.plaintext': 'nessuna (in chiaro)',
  /** A table value, lower case: "yes". */
  'report.yes': 'sì',
  /** A table value, lower case: "no". */
  'report.no': 'no',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'n/d',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Scrittura',
  'report.noBankWritten': 'Nessuno slot di questa termocamera viene scritto:',
  /* {staged} is core's phrase for how a bank is written. */
  'report.oneBank':
    'Uno slot alla volta: la scheda degli slot scrive o modifica con una patch uno slot di questa termocamera, ogni slot {staged}, e ogni scrittura chiede prima conferma.',
  'report.refusesEvery': 'La scheda degli slot rifiuta ogni slot di questa termocamera:',
} satisfies Translation<'info'>;
