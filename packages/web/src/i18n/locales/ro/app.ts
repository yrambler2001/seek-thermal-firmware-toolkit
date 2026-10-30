/**
 * Namespace `app`, română (ro), translated from the English source: the shell.
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
  title: 'Instrumente pentru firmware Seek Thermal',
  'header.cameraSelected': 'Cameră selectată',
  'header.noCamera': 'Nicio cameră selectată',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB indisponibil',
  'header.github': 'Instrumentele pe GitHub',
  'header.tabs': 'Filele paginii',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Info',
  'tab.preserve': 'Extragere și decriptare 0.x/1.x 2014/2016',
  'tab.v4': 'Extragere și decriptare 4.x/Nano',
  'tab.decrypt': 'Decriptare fișier/slot',
  'tab.slots': 'Lucru cu sloturile de firmware',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Firmware Seek Thermal — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Temă întunecată',
  'theme.followsSystem': 'Urmează setarea de temă luminoasă sau întunecată a sistemului',
  'theme.chosenDiffers': 'Aleasă aici. Comutați din nou ca să urmeze setarea sistemului.',
  'theme.chosenSame': 'Aleasă aici, la fel ca setarea actuală a sistemului',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Limbă',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Citește camera conectată la fel ca `seek-fw info`: firmware-ul, familia drept care se identifică, cum pornește, cheile și fiecare slot. Vă spune care dintre celelalte file o acoperă și explică pe înțeles la ce folosește fiecare filă. **Pe această filă nu se scrie nimic în memoria flash.**',
  'intro.preserve':
    'Pentru camerele **0.x și 1.x** (build-urile din 2014 și 2016). Face o copie **completă** a memoriei flash de 4 MB a camerei — inclusiv părțile la care un dump obișnuit nu ajunge — și apoi readuce camera exact cum era. Salvează ce poate citi, aplică pentru scurt timp un patch firmware-ului ca să poată fi citit și restul, extrage tot, restaurează originalul și îl verifică. Totul rulează local, în browserul dumneavoastră. **Doi dintre pași scriu în memoria flash** și fiecare vă întreabă mai întâi.',
  'intro.v4':
    'Face o copie, doar prin citire, a memoriei flash SPI de 4 MB a unei camere **4.x sau Nano** prin WebUSB și decriptează toate imaginile de firmware pe care le găsește. Totul rulează local, în browserul dumneavoastră — nu se încarcă nimic nicăieri. **Doar citire:** această filă nu trimite nicio comandă de scriere, ștergere, încărcare, confirmare sau resetare a memoriei flash. O cameră cu altă linie de firmware este refuzată înainte să se citească ceva.',
  'intro.decrypt':
    'Decriptează firmware pe care îl aveți deja, pe acest calculator: un dump complet al memoriei flash sau un singur slot de firmware de 64 KB. **Nu se folosește nicio cameră**, așa că funcționează fără nimic conectat și în browserele care nu au acces la USB. Fișierul este citit aici și nu este încărcat niciodată.',
  'intro.slots':
    'Citește cele trei sloturi de firmware ale camerei — slotul A, slotul B și slotul de recuperare R — și arată ce conține fiecare, din care pornește camera și ce permite acest build să facă cu el, alături de firmware-ul care rulează pe dispozitiv și de chei. Totul rulează local, în browserul dumneavoastră. **Această filă scrie în memoria flash:** poate scrie un slot dintr-o imagine decriptată sau din octeți bruți și vă întreabă înainte de fiecare scriere.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**WebUSB nu este disponibil pe iOS sau iPadOS,** așa că acest dispozitiv nu poate citi memoria flash a unei camere.',
  'support.ios.body':
    'Safari nu îl implementează, iar orice browser de pe iOS este obligat să folosească WebKit, așa că nici Chrome și Firefox nu îl pot oferi aici. Nu există nicio setare sau extensie care să schimbe asta. Pentru a extrage memoria unei camere, folosiți un calculator desktop sau un telefon Android cu un cablu USB-OTG.',
  'support.noWebUsb.title': '**Acest browser nu poate accesa dispozitive USB.**',
  'support.noWebUsb.body':
    'WebUSB este disponibil în Chrome, Edge, Opera și alte browsere Chromium pe Windows, macOS, Linux și Android. Firefox și Safari au refuzat amândouă să îl implementeze.',
  'support.noWebUsb.insecure':
    'În plus, această pagină nu este servită printr-o conexiune securizată, ceea ce, singur, blochează WebUSB.',
  'support.insecure.title': '**Conexiune nesecurizată.** WebUSB este dezactivat aici.',
  'support.insecure.body':
    'Deschideți această pagină prin HTTPS sau de la `http://localhost`. O simplă adresă din rețeaua locală, cum ar fi `http://192.168.1.10:8000`, nu este suficientă.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Puteți folosi în continuare fila **{tab}** — ea lucrează în întregime cu un fișier pe care îl alegeți și nu are nevoie de acces la USB.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Gata.** Conectați camera Seek și apăsați *{connect}*.',
  'support.fileProtocol':
    'Pagina este deschisă ca fișier local, așa că browserul nu va reține dispozitivul între reîncărcări. Acest lucru nu face niciun rău.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Notă: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Conectare',
  'connect.actions': 'Acțiuni pentru dispozitiv',
  'connect.connect': 'Conectare dispozitiv',
  'connect.change': 'Schimbare dispozitiv',
  'connect.test': 'Testare conexiune',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Uitați dispozitivul',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Este oferit orice dispozitiv Seek Thermal (ID de producător USB `{vendor}`) — Compact, Compact PRO, Nano și așa mai departe. Alegeți-l pe al dumneavoastră în fereastra de selecție a dispozitivelor din browser.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Note despre platforme',
  'platform.macos':
    'Funcționează direct în Chrome, Edge sau orice browser Chromium. Fără instalare de driver, fără drepturi de administrator. Mai întâi închideți orice alt program care comunică deja cu camera — un singur proces poate ține interfața USB la un moment dat.',
  'platform.linux.access':
    'Dați utilizatorului dumneavoastră acces la dispozitiv, apoi deconectați-l și reconectați-l:',
  'platform.linux.sandbox':
    'Versiunile Snap și Flatpak ale Chromium sunt adesea izolate de dispozitivele USB brute; versiunea `.deb` sau `.rpm` este cea de încredere.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Pe Windows, driverul WinUSB trebuie asociat camerei înainte ca vreun browser să poată ajunge la ea. Folosiți <zadig>Zadig</zadig>: *Options → List All Devices*, apoi în lista derulantă alegeți intrarea care poartă numele camerei — de exemplu `CompactPRO FF` —, alegeți **WinUSB** ca driver și faceți clic pe Replace Driver. Dacă camera apare de mai multe ori, luați intrarea marcată *(Interface 0)*. Astfel, software-ul producătorului nu mai poate folosi dispozitivul până când reveniți la driverul anterior în Manager dispozitive (*Dezinstalare dispozitiv → Ștergere driver*, apoi reconectați camera).',
  'platform.android':
    'Funcționează în Chrome pentru Android cu un cablu USB-OTG, cu condiția ca telefonul să poată alimenta camera prin USB. Android acordă accesul la USB prin propria fereastră de permisiune. Fișierul descărcat ajunge în dosarul Descărcări, ca orice alt fișier.',
  'platform.ios.name': 'iPhone și iPad',
  'platform.ios.cannot':
    '**Nu poate citi o cameră**, iar acest lucru nu se va schimba. Safari nu implementează WebUSB, iar pe iOS și iPadOS orice browser — inclusiv Chrome și Firefox — este obligat să folosească WebKit, așa că niciunul nu oferă această interfață. Nu există nicio setare, extensie sau aplicație care să ocolească asta. Pentru extragere folosiți un calculator desktop sau un telefon Android.',
  'platform.ios.decrypt':
    'Decriptorul opțional funcționează aici: decriptarea unui dump pe care îl aveți deja nu are nevoie de acces la USB, așa că o puteți face de pe un iPhone sau iPad, ori din Firefox și Safari pe desktop.',
} satisfies Translation<'app'>;
