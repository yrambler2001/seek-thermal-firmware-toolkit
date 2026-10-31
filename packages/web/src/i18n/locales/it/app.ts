/**
 * Namespace `app`, italiano (it), translated from the English source: the shell.
 *
 * Owner: phase 1. Covers App.tsx, main.tsx, components/AppHeader.tsx,
 * ThemeSwitch.tsx (+ lib/theme.ts), LanguageSwitch.tsx, lib/routing.ts (tab
 * labels and the document title), SupportBanner.tsx (+ lib/support.ts),
 * UnlockNote.tsx, ConnectSection.tsx and PlatformNotes.tsx.
 *
 * Several of these sentences are pinned word for word by safety-copy.test.tsx.
 */

import type { Translation } from '../../types';

export default {
  /* ---- header ---- */
  title: 'Strumenti per il firmware Seek Thermal',
  'header.cameraSelected': 'Termocamera selezionata',
  'header.noCamera': 'Nessuna termocamera selezionata',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB non disponibile',
  'header.github': 'Gli strumenti su GitHub',
  'header.tabs': 'Schede',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Info',
  'tab.preserve': 'Estrai e decifra 0.x/1.x',
  'tab.v4': 'Estrai e decifra 4.x/Nano',
  'tab.decrypt': 'Decifra file/slot',
  'tab.slots': 'Gestisci gli slot del firmware',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Firmware Seek Thermal — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Tema scuro',
  'theme.followsSystem': 'Segue l’impostazione chiara o scura del sistema',
  'theme.chosenDiffers':
    'Scelto qui. Riporta l’interruttore indietro per seguire l’impostazione del sistema.',
  'theme.chosenSame': 'Scelto qui, uguale all’impostazione attuale del sistema',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Lingua',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Legge la termocamera collegata come fa `seek-fw info`: il firmware, la famiglia con cui risponde, come si avvia, le chiavi e ogni slot. Ti dice quale delle altre schede la copre e spiega a parole semplici a cosa serve ogni scheda. **In questa scheda non viene scritto nulla nella memoria flash.**',
  'intro.preserve':
    'Per le termocamere **0.x e 1.x** (le build del 2014 e del 2016). Crea una copia **completa** della memoria flash da 4 MB della termocamera, comprese le parti che un dump normale non raggiunge, e poi rimette la termocamera esattamente com’era. Fa il backup di ciò che riesce a leggere, applica per poco tempo una patch al firmware perché si possa leggere il resto, estrae tutto, ripristina l’originale e lo verifica. Tutto avviene in locale nel browser. **Due dei passaggi scrivono nella memoria flash**, e ognuno ti chiede conferma prima.',
  'intro.v4':
    'Crea una copia in sola lettura della memoria flash SPI da 4 MB di una termocamera **4.x o Nano** tramite WebUSB e decifra le immagini del firmware che trova. Tutto avviene in locale nel browser: non viene caricato nulla da nessuna parte. **Sola lettura:** questa scheda non invia alcun comando di scrittura, cancellazione, caricamento, conferma o reset della flash. Una termocamera con un’altra linea di firmware viene rifiutata prima di leggere qualsiasi cosa.',
  'intro.decrypt':
    'Decifra un firmware che hai già, su questo computer: un dump completo della flash o un singolo slot del firmware da 64 KB. **Non serve nessuna termocamera**, quindi funziona senza nulla collegato e anche nei browser senza accesso USB. Il file viene letto qui e non viene mai caricato.',
  'intro.slots':
    'Legge i tre slot del firmware della termocamera (slot A, slot B e slot di recupero R) e mostra cosa contiene ciascuno, da quale si avvia la termocamera e cosa può farci questa build, con accanto il firmware in esecuzione e le chiavi del dispositivo. Tutto avviene in locale nel browser. **Questa scheda scrive nella memoria flash:** può scrivere uno slot da un’immagine decifrata o da byte grezzi, e chiede conferma prima di ogni scrittura.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**WebUSB non è disponibile su iOS e iPadOS,** quindi questo dispositivo non può leggere la flash di una termocamera.',
  'support.ios.body':
    'Safari non lo implementa e ogni browser per iOS è obbligato a usare WebKit, quindi nemmeno Chrome e Firefox possono offrirlo qui. Nessun flag o estensione cambia le cose. Per fare il dump di una termocamera usa un computer desktop o un telefono Android con un cavo USB-OTG.',
  'support.noWebUsb.title': '**Questo browser non può accedere ai dispositivi USB.**',
  'support.noWebUsb.body':
    'WebUSB è disponibile in Chrome, Edge, Opera e negli altri browser basati su Chromium per Windows, macOS, Linux e Android. Firefox e Safari hanno entrambi scelto di non implementarlo.',
  'support.noWebUsb.insecure':
    'Inoltre questa pagina non arriva tramite una connessione sicura, e questo da solo blocca WebUSB.',
  'support.insecure.title': '**Connessione non sicura.** Qui WebUSB è disattivato.',
  'support.insecure.body':
    'Apri questa pagina tramite HTTPS o da `http://localhost`. Un semplice indirizzo di rete locale come `http://192.168.1.10:8000` non basta.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Puoi comunque usare la scheda **{tab}**: funziona interamente su un file che scegli e non ha bisogno dell’accesso USB.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Pronto.** Collega la tua termocamera Seek e premi *{connect}*.',
  'support.fileProtocol':
    'Pagina aperta come file locale, quindi il browser non ricorderà il dispositivo tra un ricaricamento e l’altro. Non è un problema.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Nota: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Collegamento',
  'connect.actions': 'Azioni sul dispositivo',
  'connect.connect': 'Collega dispositivo',
  'connect.change': 'Cambia dispositivo',
  'connect.test': 'Prova connessione',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Dimentica dispositivo',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Viene proposto qualsiasi dispositivo Seek Thermal (vendor USB `{vendor}`): Compact, Compact PRO, Nano e così via. Scegli il tuo nella finestra di selezione dei dispositivi del browser.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Note per piattaforma',
  'platform.macos':
    'Funziona subito in Chrome, Edge o qualsiasi browser Chromium. Nessun driver da installare, nessun diritto di amministratore. Prima chiudi qualsiasi altro programma che stia già comunicando con la termocamera: un solo processo alla volta può tenere l’interfaccia USB.',
  'platform.linux.access':
    'Dai al tuo utente l’accesso al dispositivo, poi scollegalo e ricollegalo:',
  'platform.linux.sandbox':
    'Le build di Chromium in Snap e Flatpak sono spesso isolate dai dispositivi USB grezzi; la build `.deb` o `.rpm` è quella affidabile.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Windows ha bisogno del driver WinUSB associato alla termocamera prima che un browser possa raggiungerla. Usa <zadig>Zadig</zadig>: *Options → List All Devices*, poi nel menu a tendina scegli la voce che porta il nome della tua termocamera, per esempio `CompactPRO FF`, scegli **WinUSB** come driver e fai clic su Replace Driver. Se la termocamera compare più di una volta, prendi la voce con *(Interface 0)*. Così il dispositivo non è più disponibile per il software del produttore finché non annulli la modifica in Gestione dispositivi (*Disinstalla dispositivo → Elimina il driver*, poi ricollega).',
  'platform.android':
    'Funziona in Chrome per Android con un cavo USB-OTG, purché il telefono possa alimentare la termocamera tramite il bus. Android concede l’accesso USB con una sua finestra di autorizzazione. Il file scaricato finisce nella cartella Download come qualsiasi altro file.',
  'platform.ios.name': 'iPhone e iPad',
  'platform.ios.cannot':
    '**Non può leggere una termocamera**, e non cambierà. Safari non implementa WebUSB e su iOS e iPadOS ogni browser, compresi Chrome e Firefox, è obbligato a usare WebKit, quindi nessuno di loro offre questa API. Nessun flag, estensione o app la aggira. Per il dump usa un computer desktop o un telefono Android.',
  'platform.ios.decrypt':
    'Il decifratore opzionale invece funziona: decifrare un dump che hai già non richiede l’accesso USB, quindi puoi farlo da un iPhone o un iPad, oppure da Firefox e Safari sul desktop.',
} satisfies Translation<'app'>;
