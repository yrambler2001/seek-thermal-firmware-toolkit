/**
 * Namespace `shared`, italiano (it), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: what several tabs share: components/RunPanel.tsx, Section.tsx, Panel.tsx,
 * KeyValue.tsx, HexBlock.tsx, components/ui/*, hooks/useRunner.ts, useReporter.ts, useDevice.ts,
 * useConnectionTest.ts, lib/camera-lock.ts, download.ts, backup-save.ts, hints.ts, family-line.ts,
 * identify.ts, unlock-seat.ts, webusb.ts, usb-adapter.ts, and components/DeviceInfoPanel.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* RunPanel: the bar, status line and log every long operation has. {label} is the panel's name. */
  'runPanel.percent': '{value}%',
  'runPanel.progressLabel': '{label}: avanzamento',
  'runPanel.logLabel': '{label}: registro',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… {count} riga precedente rimossa',
    many: '… {count} di righe precedenti rimosse',
    other: '… {count} righe precedenti rimosse',
  },
  'runPanel.lineCount': { one: '{count} riga', many: '{count} di righe', other: '{count} righe' },

  /* Status lines several panels set. */
  'status.idle': 'In attesa.',
  'status.cancelled': 'Annullato.',
  'status.cancelling': 'Annullamento in corso…',
  'status.failedSeeLog': 'Non riuscito: vedi il registro qui sopra.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'La termocamera è in uso in un’altra scheda o finestra: prima termina lì o chiudila.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote': 'Lo zip viene scaricato automaticamente, prima di inviare qualsiasi cosa.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Nessun dispositivo selezionato.',
  'device.disconnected': 'Dispositivo scollegato.',
  'device.revoked': 'Autorizzazione revocata.',
  'device.unknownProduct': 'prodotto sconosciuto',
  'device.unknownVendor': 'produttore sconosciuto',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'Su Linux la termocamera ha bisogno di una regola udev prima che il browser possa aprirla:\n\n{rule}\n\nPoi scollega e ricollega la termocamera. Le build di Chromium in Snap e Flatpak sono spesso isolate dai dispositivi USB grezzi; la build .deb o .rpm è quella affidabile.',
  'hint.windows':
    'Windows ha bisogno del driver WinUSB associato alla termocamera prima che un browser possa raggiungerla. Usa Zadig (https://zadig.akeo.ie/): Options → List All Devices, scegli la voce che porta il nome della tua termocamera, per esempio «CompactPRO FF», scegli WinUSB e fai clic su Replace Driver.',
  'hint.holding':
    'Un altro programma o un driver di sistema sta tenendo occupata la termocamera: un solo processo alla volta può tenere l’interfaccia USB. Chiudi qualsiasi altro programma che la stia usando, poi scollega e ricollega la termocamera.',
  'hint.recipientFallback':
    'Oppure imposta recipient su «device» nelle opzioni di lettura: così non serve acquisire l’interfaccia.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid': 'Apri «Opzioni» e controlla la nota sotto i campi per ciascun intervallo.',
  'hint.usbTimeout':
    'La termocamera ha accettato la richiesta e non ha mai risposto. Scollegala e ricollegala, poi prova con un chunk più piccolo (64 è il valore che funziona ovunque).',
  'hint.usbStalled':
    'La termocamera ha rifiutato la richiesta. Di solito vuol dire che il suo firmware non la supporta. La pagina chiede alla termocamera di quale famiglia è prima di leggere qualsiasi cosa, quindi le richieste che continuano a essere rifiutate erano fatte per la famiglia indicata dalla termocamera stessa. Controlla la versione del firmware nella scheda Info.',
  'hint.usbNotOpen':
    'Un altro programma o un driver di sistema sta tenendo occupata la termocamera. Chiudilo, oppure imposta recipient su «device» nelle opzioni di lettura: così non serve acquisire l’interfaccia.',
  'hint.usbTransferFailed': 'Scollega e ricollega la termocamera, poi riprova.',
  'hint.deviceMode':
    'La termocamera non è voluta uscire dalla modalità di acquisizione delle immagini. Scollegala, aspetta che si spenga del tutto e ricollegala.',
  'hint.deviceWindow':
    'La mappa dei selettori usata da questa famiglia non corrisponde alla termocamera. Nella scheda 4.x/Nano apri Opzioni ed esegui «Estrai tutti i selettori» per vedere cosa espone davvero la termocamera.',
  'hint.deviceVersionUnknown':
    'Non è stato inviato nulla che potesse modificare la termocamera. Scollegala, ricollegala, lascia che finisca di avviarsi e riprova; una termocamera che comunica la versione del firmware viene letta normalmente.',
  'hint.imageMalformed': 'Il file non è un’immagine del firmware Seek decifrata.',
  'hint.imageUnsupported':
    'Questa immagine non può essere preparata per la termocamera così com’è.',
  'hint.imageKeyTable':
    'L’immagine non contiene la coppia di chiavi indicata dal suo nome file. Usa il file decifrato esattamente come l’ha scritto il dump, nome compreso.',
  'hint.flashRefused': 'Non è stato scritto nulla nella termocamera.',
  'hint.familyUnsupported':
    'Non è stato letto né scritto nulla. Ogni scheda copre un intervallo di versioni del firmware: le termocamere 0.x e 1.x vanno in «Estrai e decifra 0.x/1.x», quelle 4.x e Nano in «Estrai e decifra 4.x/Nano». La scheda Info dice in quale scheda va la termocamera.',
  'hint.firmwareTooOld':
    'Nessuna famiglia di firmware può leggere questa build qui: il suo firmware non ha un gestore di lettura per il comando con cui questa scheda legge la flash, quindi non le è stato inviato nulla che potesse essere letto male. Una Compact con 0.7.0.7 o 0.7.0.8 si può leggere in «Estrai e decifra 0.x/1.x». Un dump fatto con un programmatore SPI o tramite SWD/J-Link si può comunque decifrare in questa pagina, in «Decifra file/slot».',
  'hint.powerCycle':
    'In questa procedura: scollega la termocamera e ricollegala, premi «Collega dispositivo» e selezionala, poi avvia di nuovo lo stesso passaggio. L’esecuzione è ancora caricata qui: non c’è nulla da riprendere.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Firmware in esecuzione',
  'deviceInfo.version': 'Versione',
  'deviceInfo.family': 'Famiglia di firmware',
  'deviceInfo.build': 'Build',
  'deviceInfo.bootloader': 'Bootloader',
  'deviceInfo.platform': 'Piattaforma',
  'deviceInfo.serial': 'Numero di serie',
  'deviceInfo.usbLink': 'Collegamento USB',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Config. di avvio',
  'deviceInfo.bootedFrom': 'Avviata da',
  'deviceInfo.nextStart': 'Prossimo avvio',
  'deviceInfo.upgradeTarget': 'Destinazione del suo aggiornamento',
  'deviceInfo.bankAt': '{bank} all’indirizzo {address}',
  'deviceInfo.perDeviceKey': 'Chiave propria del dispositivo',
  'deviceInfo.notProgrammed': 'non programmata: la termocamera ripiega sulla chiave B',
  'deviceInfo.keysTitle': 'Chiavi lette da questa termocamera',
  'deviceInfo.foundAt': 'Posizione',
  'deviceInfo.flashOffset': 'offset {offset} nella flash',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Chiave A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Chiave B',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**{banks:ins} contiene un’immagine del firmware valida, cifrata con una chiave che il bootloader di questa termocamera non conosce.** L’immagine è integra e la sua somma di controllo è corretta, ma quando controlla uno slot il bootloader prova solo {storeKey:acc} e la chiave A, quindi lo salta e avvia qualcos’altro.',
    many: '**Ognuno di questi slot contiene un’immagine del firmware valida, cifrata con una chiave che il bootloader di questa termocamera non conosce: {banks}.** Le immagini sono integre e le loro somme di controllo sono corrette, ma quando controlla uno slot il bootloader prova solo {storeKey:acc} e la chiave A, quindi li salta e avvia qualcos’altro.',
    other:
      '**Ognuno di questi slot contiene un’immagine del firmware valida, cifrata con una chiave che il bootloader di questa termocamera non conosce: {banks}.** Le immagini sono integre e le loro somme di controllo sono corrette, ma quando controlla uno slot il bootloader prova solo {storeKey:acc} e la chiave A, quindi li salta e avvia qualcos’altro.',
  },
  'deviceInfo.orphanIsTarget':
    'È lo slot in cui scrive un aggiornamento. L’applicazione in esecuzione su questa termocamera cifra di nuovo con quella chiave sconosciuta, quindi **scrivere tramite questa pagina produrrà un altro slot che il bootloader non può avviare**: la termocamera continuerà a eseguire {bank:acc}. Per aggirare il problema, scrivi lo slot direttamente con un programmatore SPI o tramite SWD/J-Link.',
  /** deviceInfo.orphanIsTarget's {bank} when the booted bank has no name. A name: a translation may give
   * it case forms ('deviceInfo.otherBank:gen'), like common:bank.*. */
  'deviceInfo.otherBank': 'l’altro slot',
  'deviceInfo.otherBank:acc': 'l’altro slot',
  'deviceInfo.otherBank:gen': 'dell’altro slot',
  'deviceInfo.otherBank:dat': 'all’altro slot',
  'deviceInfo.otherBank:loc': 'nell’altro slot',
  'deviceInfo.otherBank:ins': 'L’altro slot',
} satisfies Translation<'shared'>;
