/**
 * Namespace `app`, magyar (hu), translated from the English source: the shell.
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
  title: 'Seek Thermal firmware-eszközkészlet',
  'header.cameraSelected': 'Kamera kiválasztva',
  'header.noCamera': 'Nincs kiválasztott kamera',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'Az USB nem érhető el',
  'header.github': 'Az eszközkészlet a GitHubon',
  'header.tabs': 'Fülek',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Info',
  'tab.preserve': '0.x/1.x kiolvasása és visszafejtése',
  'tab.v4': '4.x/Nano kiolvasása és visszafejtése',
  'tab.decrypt': 'Fájl/slot visszafejtése',
  'tab.slots': 'Firmware-slotok kezelése',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Seek Thermal firmware – {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Sötét téma',
  'theme.followsSystem': 'A rendszer világos vagy sötét beállítását követi',
  'theme.chosenDiffers':
    'Itt választotta. Váltson vissza, ha a rendszer beállítását szeretné követni.',
  'theme.chosenSame': 'Itt választotta; most megegyezik a rendszer beállításával',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Nyelv',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Úgy olvassa ki a csatlakoztatott kamerát, ahogy a `seek-fw info`: a firmware-t, a családot, amelyként válaszol, az indítás módját, a kulcsait és minden slotot. Megmondja, melyik másik fül foglalkozik vele, és közérthetően elmagyarázza, mire való az egyes fül. **Ezen a fülön semmi sem kerül a flash memóriába.**',
  'intro.preserve':
    '**0.x és 1.x** kamerákhoz (a 2014-es és a 2016-os változatok). **Teljes** másolatot készít a kamera 4 MB-os flash memóriájáról – azokkal a részekkel együtt is, amelyeket egy szokásos kiolvasás nem ér el –, majd pontosan olyan állapotba hozza vissza a kamerát, amilyenben volt. Elmenti, amit ki tud olvasni, rövid időre módosítja a firmware-t, hogy a többi is olvasható legyen, mindent kiolvas, visszaállítja az eredetit, és ellenőrzi. Minden helyben, a böngészőben fut. **Két lépés ír a flash memóriába**, és mindkettő előbb rákérdez.',
  'intro.v4':
    'Csak olvasható másolatot készít egy **4.x vagy Nano** kamera 4 MB-os SPI flash memóriájáról WebUSB-n keresztül, és visszafejti a benne talált firmware-lemezképeket. Minden helyben, a böngészőben fut – semmi sem kerül feltöltésre. **Csak olvas:** ez a fül nem küld flash írási, törlési, feltöltési, véglegesítési vagy újraindítási parancsot. Más firmware-sorozatú kamerát még az olvasás előtt elutasít.',
  'intro.decrypt':
    'A már meglévő firmware-t fejti vissza ezen a számítógépen: egy teljes flash-memóriaképet vagy egyetlen 64 KB-os firmware-slotot. **Nem használ kamerát**, így semmit sem kell csatlakoztatni, és USB-hozzáférés nélküli böngészőben is működik. A fájlt itt olvassa be, és sosem tölti fel.',
  'intro.slots':
    'Kiolvassa a kamera három firmware-slotját – az A-slotot, a B-slotot és a helyreállító R-slotot –, és megmutatja, mit tartalmaz mindegyik, melyikről indul a kamera, és mit tud vele kezdeni ez a változat; mellettük az eszközön futó firmware és a kulcsok láthatók. Minden helyben, a böngészőben fut. **Ez a fül ír a flash memóriába:** egy slotba visszafejtett lemezképet vagy nyers bájtokat tud írni, és minden írás előtt rákérdez.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**Az iOS és az iPadOS nem támogatja a WebUSB-t,** ezért ez az eszköz nem tudja kiolvasni a kamera flash memóriáját.',
  'support.ios.body':
    'A Safari nem valósítja meg, és iOS-en minden böngészőnek a WebKitet kell használnia, így a Chrome és a Firefox sem kínálhatja itt. Ezen semmilyen kapcsoló vagy bővítmény nem változtat. A kamera kiolvasásához asztali számítógépet vagy USB-OTG kábellel csatlakoztatott Android telefont használjon.',
  'support.noWebUsb.title': '**Ez a böngésző nem fér hozzá az USB-eszközökhöz.**',
  'support.noWebUsb.body':
    'A WebUSB a Chrome-ban, az Edge-ben, az Operában és más Chromium-alapú böngészőkben érhető el Windowson, macOS-en, Linuxon és Androidon. A Firefox és a Safari fejlesztői elutasították a megvalósítását.',
  'support.noWebUsb.insecure':
    'Ezt az oldalt ráadásul nem biztonságos kapcsolaton keresztül szolgálják ki, ami már önmagában letiltja a WebUSB-t.',
  'support.insecure.title': '**Nem biztonságos kapcsolat.** A WebUSB itt le van tiltva.',
  'support.insecure.body':
    'Nyissa meg az oldalt HTTPS-en keresztül vagy a `http://localhost` címről. Egy egyszerű helyi hálózati cím, például `http://192.168.1.10:8000`, nem megfelelő.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'A(z) **{tab}** fület továbbra is használhatja – az teljes egészében egy Ön által kiválasztott fájlon dolgozik, és nincs szüksége USB-hozzáférésre.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready':
    '**Kész.** Csatlakoztassa a Seek kamerát, és nyomja meg a(z) *{connect}* gombot.',
  'support.fileProtocol':
    'Helyi fájlként nyitotta meg, ezért a böngésző újratöltéskor nem emlékszik az eszközre. Ez nem okoz gondot.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Megjegyzés: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Csatlakozás',
  'connect.actions': 'Eszközműveletek',
  'connect.connect': 'Eszköz csatlakoztatása',
  'connect.change': 'Eszköz cseréje',
  'connect.test': 'Kapcsolat tesztelése',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Eszköz elfelejtése',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Minden Seek Thermal eszköz megjelenik a listában (USB-gyártóazonosító: `{vendor}`) – Compact, Compact PRO, Nano és a többi. Válassza ki a sajátját a böngésző eszközválasztójában.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Megjegyzések platformonként',
  'platform.macos':
    'Azonnal működik a Chrome-ban, az Edge-ben vagy bármely Chromium-alapú böngészőben. Nem kell illesztőprogramot telepíteni, és rendszergazdai jog sem kell. Előbb lépjen ki minden olyan programból, amely már kommunikál a kamerával – az USB-interfészt egyszerre csak egy folyamat foglalhatja le.',
  'platform.linux.access':
    'Adjon hozzáférést a felhasználójának az eszközhöz, majd húzza ki és dugja vissza:',
  'platform.linux.sandbox':
    'A Snap és a Flatpak Chromium-csomagok gyakran el vannak zárva a nyers USB-eszközöktől; a `.deb` vagy az `.rpm` csomag a megbízható.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Windowson a WinUSB illesztőprogramot kell a kamerához rendelni, mielőtt bármely böngésző elérhetné. Használja a <zadig>Zadig</zadig> programot: *Options → List All Devices*, majd a legördülő listában válassza a kamerájáról elnevezett bejegyzést – például `CompactPRO FF` –, illesztőprogramként a **WinUSB**-t, és kattintson a Replace Driver gombra. Ha a kamera többször is szerepel, az *(Interface 0)* jelölésű bejegyzést válassza. Ezzel az eszköz a gyártó szoftvere számára elérhetetlenné válik, amíg az Eszközkezelőben vissza nem állítja (*Eszköz eltávolítása → Illesztőprogram törlése*, majd dugja vissza).',
  'platform.android':
    'Androidon a Chrome-ban működik USB-OTG kábellel, ha a telefon el tudja látni tápellátással a kamerát. Az Android saját engedélykérő ablakában adja meg az USB-hozzáférést. A letöltés a Letöltések mappába kerül, mint bármely más fájl.',
  'platform.ios.name': 'iPhone és iPad',
  'platform.ios.cannot':
    '**Nem tud kamerát kiolvasni**, és ez nem is fog változni. A Safari nem valósítja meg a WebUSB-t, iOS-en és iPadOS-en pedig minden böngészőnek – a Chrome-nak és a Firefoxnak is – a WebKittel kell megjelenítenie, ezért egyik sem kínálja ezt az API-t. Nincs olyan kapcsoló, bővítmény vagy alkalmazás, amely megkerülné. A kiolvasáshoz asztali gépet vagy Android telefont használjon.',
  'platform.ios.decrypt':
    'A visszafejtő viszont itt is működik: egy meglévő memóriakép visszafejtéséhez nem kell USB-hozzáférés, így ezt iPhone-ról vagy iPadről, illetve asztali gépen Firefoxból és Safariból is elvégezheti.',
} satisfies Translation<'app', 'hu'>;
