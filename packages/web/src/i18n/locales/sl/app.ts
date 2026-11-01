/**
 * Namespace `app`, slovenščina (sl), translated from the English source: the shell.
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
  title: 'Orodja za vdelano programsko opremo Seek Thermal',
  'header.cameraSelected': 'Kamera je izbrana',
  'header.noCamera': 'Nobena kamera ni izbrana',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB ni na voljo',
  'header.github': 'Orodja na GitHubu',
  'header.tabs': 'Zavihki',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Informacije',
  'tab.preserve': 'Izpis in dešifriranje 0.x/1.x',
  'tab.v4': 'Izpis in dešifriranje 4.x/Nano',
  'tab.decrypt': 'Dešifriranje datoteke/reže',
  'tab.slots': 'Delo z režami vdelane programske opreme',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Vdelana programska oprema Seek Thermal — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Temna tema',
  'theme.followsSystem': 'Sledi svetli ali temni nastavitvi vašega sistema',
  'theme.chosenDiffers': 'Izbrano tukaj. Preklopite nazaj, da bo sledila nastavitvi sistema.',
  'theme.chosenSame': 'Izbrano tukaj, enako kot trenutna nastavitev sistema',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Jezik',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Prebere povezano kamero tako, kot to stori `seek-fw info`: njeno vdelano programsko opremo, družino, kot katera se odziva, način zagona, ključe in vse reže. Pove, kateri od drugih zavihkov jo pokriva, in z enostavnimi besedami razloži, čemu je namenjen vsak zavihek. **Na tem zavihku se v bliskovni pomnilnik ne zapiše nič.**',
  'intro.preserve':
    'Za kamere **0.x in 1.x** (izdaje iz let 2014 in 2016). Naredi **popolno** kopijo 4 MB bliskovnega pomnilnika kamere — vključno z deli, ki jih običajni izpis ne doseže — nato pa kamero vrne natanko v prvotno stanje. Shrani varnostno kopijo vsega, kar lahko prebere, za kratek čas popravi vdelano programsko opremo, da lahko prebere še preostanek, izpiše vse, povrne izvirnik in ga preveri. Vse teče lokalno v vašem brskalniku. **Dva od korakov pišeta v bliskovni pomnilnik** in vsak vas prej vpraša.',
  'intro.v4':
    'Prek WebUSB naredi kopijo 4 MB bliskovnega pomnilnika SPI kamere **4.x ali Nano**, samo z branjem, in dešifrira vse slike vdelane programske opreme, ki jih najde. Vse teče lokalno v vašem brskalniku — nič se ne naloži nikamor. **Samo branje:** ta zavihek ne pošlje nobenega ukaza za zapis, brisanje, nalaganje, potrditev ali ponastavitev bliskovnega pomnilnika. Kamera z drugo serijo vdelane programske opreme je zavrnjena, preden se karkoli prebere.',
  'intro.decrypt':
    'Dešifrira vdelano programsko opremo, ki jo že imate, na tem računalniku: celoten izpis bliskovnega pomnilnika ali eno režo vdelane programske opreme velikosti 64 KB. **Kamera ni potrebna**, zato to deluje brez priključene naprave in tudi v brskalnikih brez dostopa do USB. Datoteka se prebere tukaj in se nikoli ne naloži.',
  'intro.slots':
    'Prebere tri reže vdelane programske opreme v kameri — režo A, režo B in obnovitveno režo R — in pokaže, kaj je v vsaki, iz katere se kamera zažene in kaj ta izdaja zmore z njo, poleg tega pa še vdelano programsko opremo, ki teče v napravi, in njene ključe. Vse teče lokalno v vašem brskalniku. **Ta zavihek piše v bliskovni pomnilnik:** v eno režo lahko zapiše dešifrirano sliko ali surove bajte in vas vpraša pred vsakim zapisom.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**WebUSB v sistemih iOS in iPadOS ni na voljo,** zato ta naprava ne more brati bliskovnega pomnilnika kamere.',
  'support.ios.body':
    'Safari ga ne podpira, vsi brskalniki v iOS pa morajo uporabljati WebKit, zato ga tudi Chrome in Firefox tukaj ne moreta ponuditi. Nobena zastavica ali razširitev tega ne spremeni. Za izpis kamere uporabite namizni računalnik ali telefon Android s kablom USB-OTG.',
  'support.noWebUsb.title': '**Ta brskalnik nima dostopa do naprav USB.**',
  'support.noWebUsb.body':
    'WebUSB je na voljo v brskalnikih Chrome, Edge, Opera in drugih brskalnikih Chromium v sistemih Windows, macOS, Linux in Android. Firefox in Safari sta se oba odločila, da ga ne bosta podprla.',
  'support.noWebUsb.insecure':
    'Ta stran poleg tega ni postrežena prek varne povezave, kar že samo po sebi onemogoči WebUSB.',
  'support.insecure.title': '**Povezava ni varna.** WebUSB je tukaj onemogočen.',
  'support.insecure.body':
    'Odprite to stran prek HTTPS ali z naslova `http://localhost`. Navaden naslov v lokalnem omrežju, kot je `http://192.168.1.10:8000`, ne zadošča.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Še vedno lahko uporabite zavihek **{tab}** — ta deluje v celoti na datoteki, ki jo izberete, in ne potrebuje dostopa do USB.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Pripravljeno.** Priključite kamero Seek in pritisnite *{connect}*.',
  'support.fileProtocol':
    'Stran je odprta kot lokalna datoteka, zato si brskalnik med ponovnimi nalaganji ne bo zapomnil naprave. To ni škodljivo.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Opomba: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Povezava',
  'connect.actions': 'Dejanja z napravo',
  'connect.connect': 'Poveži napravo',
  'connect.change': 'Zamenjaj napravo',
  'connect.test': 'Preizkusi povezavo',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Pozabi napravo',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Ponujena je vsaka naprava Seek Thermal (proizvajalec USB `{vendor}`) — Compact, Compact PRO, Nano in druge. Svojo izberite v brskalnikovem oknu za izbiro naprave.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Opombe za posamezne sisteme',
  'platform.macos':
    'Deluje takoj v brskalnikih Chrome, Edge ali katerem koli drugem brskalniku Chromium. Brez namestitve gonilnika, brez skrbniških pravic. Najprej zaprite vse druge programe, ki že komunicirajo s kamero — vmesnik USB lahko hkrati zaseda le en proces.',
  'platform.linux.access':
    'Svojemu uporabniku dajte dostop do naprave, nato jo odklopite in znova priklopite:',
  'platform.linux.sandbox':
    'Različice Chromiuma iz paketov Snap in Flatpak so pogosto v peskovniku brez dostopa do surovih naprav USB; zanesljiva je različica `.deb` ali `.rpm`.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Windows potrebuje gonilnik WinUSB, vezan na kamero, preden jo lahko doseže kateri koli brskalnik. Uporabite <zadig>Zadig</zadig>: *Options → List All Devices*, nato v spustnem seznamu izberite vnos, poimenovan po vaši kameri — na primer `CompactPRO FF` — kot gonilnik izberite **WinUSB** in kliknite Replace Driver. Če je kamera navedena večkrat, vzemite vnos z oznako *(Interface 0)*. S tem napravo odvzamete programski opremi proizvajalca, dokler tega ne razveljavite v upravitelju naprav (*Odstrani napravo → Izbriši gonilnik*, nato napravo znova priklopite).',
  'platform.android':
    'Deluje v brskalniku Chrome za Android s kablom USB-OTG, če telefon lahko kameri zagotovi napajanje prek vodila. Android dostop do USB odobri v svojem pogovornem oknu za dovoljenja. Prenesena datoteka se shrani v mapo Prenosi kot vsaka druga datoteka.',
  'platform.ios.name': 'iPhone in iPad',
  'platform.ios.cannot':
    '**Kamere ne more brati** in to se ne bo spremenilo. Safari ne podpira WebUSB, v sistemih iOS in iPadOS pa morajo vsi brskalniki — tudi Chrome in Firefox — za prikaz uporabljati WebKit, zato nobeden od njih ne ponuja tega vmesnika API. Nobena zastavica, razširitev ali aplikacija tega ne zaobide. Za izpis uporabite namizni računalnik ali telefon Android.',
  'platform.ios.decrypt':
    'Neobvezni dešifrirnik tukaj deluje: za dešifriranje izpisa, ki ga že imate, dostop do USB ni potreben, zato lahko to storite z iPhona ali iPada ali v brskalnikih Firefox in Safari na namiznem računalniku.',
} satisfies Translation<'app', 'sl'>;
