/**
 * Namespace `app`, srpski (sr), translated from the English source: the shell.
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
  title: 'Alati za firmver Seek Thermal',
  'header.cameraSelected': 'Kamera je izabrana',
  'header.noCamera': 'Kamera nije izabrana',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB nije dostupan',
  'header.github': 'Alati na GitHubu',
  'header.tabs': 'Kartice',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Info',
  'tab.preserve': 'Iščitavanje i dešifrovanje 0.x/1.x',
  'tab.v4': 'Iščitavanje i dešifrovanje 4.x/Nano',
  'tab.decrypt': 'Dešifrovanje datoteke/slota',
  'tab.slots': 'Rad sa slotovima firmvera',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Seek Thermal firmver — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Tamna tema',
  'theme.followsSystem': 'Prati svetlu ili tamnu temu vašeg sistema',
  'theme.chosenDiffers': 'Izabrano ovde. Vratite prekidač da biste pratili podešavanje sistema.',
  'theme.chosenSame': 'Izabrano ovde, isto kao trenutno podešavanje sistema',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Jezik',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Čita povezanu kameru kao što to radi `seek-fw info`: njen firmver, porodicu kojom se predstavlja, način pokretanja, ključeve i svaki slot. Kaže vam koja od ostalih kartica je za nju i jednostavnim rečima objašnjava čemu služi svaka kartica. **Na ovoj kartici se ništa ne upisuje u fleš.**',
  'intro.preserve':
    'Za kamere **0.x i 1.x** (izdanja iz 2014. i 2016. godine). Pravi **potpunu** kopiju 4 MB fleš memorije kamere — uključujući delove do kojih obično iščitavanje ne dopire — a zatim vraća kameru tačno u stanje u kom je bila. Pravi rezervnu kopiju onoga što može da pročita, nakratko zakrpi firmver da bi se pročitao i ostatak, iščitava sve, vraća originalni firmver i proverava ga. Sve se izvršava lokalno u vašem pregledaču. **Dva koraka upisuju u fleš**, i svaki vas prvo pita.',
  'intro.v4':
    'Samo čitanjem pravi kopiju 4 MB SPI fleš memorije kamere **4.x ili Nano** preko WebUSB-a i dešifruje sve slike firmvera koje pronađe. Sve se izvršava lokalno u vašem pregledaču — ništa se nigde ne otprema. **Samo čitanje:** ova kartica ne šalje nijednu komandu za upis, brisanje, otpremanje, potvrdu ili resetovanje fleša. Kamera sa drugom linijom firmvera odbija se pre nego što se bilo šta pročita.',
  'intro.decrypt':
    'Dešifruje firmver koji već imate, na ovom računaru: kopiju celog fleša ili jedan slot firmvera od 64 KB. **Kamera se ne koristi**, pa ovo radi i kada ništa nije priključeno, i u pregledačima koji nemaju pristup USB-u. Datoteka se čita ovde i nikada se ne otprema.',
  'intro.slots':
    'Čita tri slota firmvera kamere — slot A, slot B i slot za oporavak R — i pokazuje šta svaki sadrži, iz kog se kamera pokreće i šta se na ovom izdanju može uraditi s njim, uz firmver i ključeve koje uređaj trenutno koristi. Sve se izvršava lokalno u vašem pregledaču. **Ova kartica upisuje u fleš:** može da upiše jedan slot iz dešifrovane slike ili iz sirovih bajtova, i pita pre svakog upisa.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**WebUSB nije dostupan na iOS-u ni na iPadOS-u,** pa ovaj uređaj ne može da čita fleš kamere.',
  'support.ios.body':
    'Safari ga ne podržava, a svaki pregledač na iOS-u mora da koristi WebKit, pa ni Chrome ni Firefox ovde ne mogu da ga ponude. Ne postoji opcija ni proširenje koje to menja. Da biste iščitali kameru, koristite stoni računar ili Android telefon sa USB-OTG kablom.',
  'support.noWebUsb.title': '**Ovaj pregledač ne može da pristupi USB uređajima.**',
  'support.noWebUsb.body':
    'WebUSB je dostupan u pregledačima Chrome, Edge, Opera i drugim pregledačima zasnovanim na Chromiumu, na sistemima Windows, macOS, Linux i Android. Firefox i Safari su odbili da ga podrže.',
  'support.noWebUsb.insecure':
    'Ova stranica uz to nije otvorena preko bezbedne veze, a to samo po sebi blokira WebUSB.',
  'support.insecure.title': '**Nebezbedna veza.** WebUSB je ovde onemogućen.',
  'support.insecure.body':
    'Otvorite ovu stranicu preko HTTPS-a ili sa `http://localhost`. Obična adresa u lokalnoj mreži, kao što je `http://192.168.1.10:8000`, ne ispunjava taj uslov.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'I dalje možete da koristite karticu **{tab}** — ona radi isključivo sa datotekom koju izaberete i ne treba joj pristup USB-u.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Spremno.** Priključite Seek kameru i pritisnite *{connect}*.',
  'support.fileProtocol':
    'Otvoreno kao lokalna datoteka, pa pregledač neće pamtiti uređaj između ponovnih učitavanja. To ne smeta.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Napomena: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Povezivanje',
  'connect.actions': 'Radnje sa uređajem',
  'connect.connect': 'Poveži uređaj',
  'connect.change': 'Promeni uređaj',
  'connect.test': 'Testiraj vezu',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Zaboravi uređaj',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Ponuđen je svaki Seek Thermal uređaj (USB proizvođač `{vendor}`) — Compact, Compact PRO, Nano i drugi. Izaberite svoj u prozoru pregledača za izbor uređaja.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Napomene za platforme',
  'platform.macos':
    'Radi odmah, u pregledaču Chrome, Edge ili bilo kom pregledaču zasnovanom na Chromiumu. Nije potrebna instalacija drajvera ni administratorska prava. Prvo zatvorite svaki drugi program koji već komunicira sa kamerom — samo jedan proces istovremeno može da drži USB interfejs.',
  'platform.linux.access':
    'Dajte svom korisniku pristup uređaju, a zatim ga isključite i ponovo priključite:',
  'platform.linux.sandbox':
    'Snap i Flatpak izdanja Chromiuma često su izolovana od sirovih USB uređaja; pouzdano je izdanje `.deb` ili `.rpm`.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Windows zahteva da WinUSB drajver bude dodeljen kameri pre nego što joj bilo koji pregledač može pristupiti. Koristite <zadig>Zadig</zadig>: *Options → List All Devices*, zatim u padajućoj listi izaberite stavku nazvanu po vašoj kameri — na primer `CompactPRO FF` — izaberite **WinUSB** kao drajver i kliknite Replace Driver. Ako se vaša kamera pojavljuje više puta, uzmite stavku označenu sa *(Interface 0)*. Time se uređaj oduzima softveru proizvođača dok to ne poništite u Upravljaču uređajima (*Deinstaliraj uređaj → Izbriši drajver*, pa ponovo priključite kameru).',
  'platform.android':
    'Radi u pregledaču Chrome za Android sa USB-OTG kablom, pod uslovom da telefon može da napaja kameru preko USB-a. Android odobrava pristup USB-u kroz sopstveni dijalog za dozvole. Preuzeta datoteka završava u fascikli Preuzimanja, kao i svaka druga.',
  'platform.ios.name': 'iPhone i iPad',
  'platform.ios.cannot':
    '**Ne može da čita kameru**, i to se neće promeniti. Safari ne podržava WebUSB, a na iOS-u i iPadOS-u svaki pregledač — uključujući Chrome i Firefox — mora da prikazuje stranice pomoću WebKita, pa nijedan od njih ne nudi taj API. Ne postoji opcija, proširenje ni aplikacija koja to zaobilazi. Za iščitavanje koristite stoni računar ili Android telefon.',
  'platform.ios.decrypt':
    'Opcioni dešifrator ovde ipak radi: za dešifrovanje kopije fleša koju već imate nije potreban pristup USB-u, pa to možete da uradite sa iPhone-a ili iPad-a, ili u pregledačima Firefox i Safari na stonom računaru.',
} satisfies Translation<'app', 'sr'>;
