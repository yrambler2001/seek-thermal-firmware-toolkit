/**
 * Namespace `app`, eesti (et), translated from the English source: the shell.
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
  title: 'Seek Thermali püsivara tööriistakomplekt',
  'header.cameraSelected': 'Kaamera valitud',
  'header.noCamera': 'Kaamerat pole valitud',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB pole saadaval',
  'header.github': 'Tööriistakomplekt GitHubis',
  'header.tabs': 'Vahekaardid',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Teave',
  'tab.preserve': 'Tõmmis ja dekrüptimine 0.x/1.x',
  'tab.v4': 'Tõmmis ja dekrüptimine 4.x/Nano',
  'tab.decrypt': 'Faili/pesa dekrüptimine',
  'tab.slots': 'Püsivarapesad',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Seek Thermali püsivara — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Tume teema',
  'theme.followsSystem': 'Järgib süsteemi heleda või tumeda teema sätet',
  'theme.chosenDiffers': 'Valitud siin. Lülitage tagasi, et järgida süsteemi sätet.',
  'theme.chosenSame': 'Valitud siin, praegu sama mis süsteemi säte',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Keel',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Loeb ühendatud kaamerat samamoodi nagu `seek-fw info`: selle püsivara, perekonna, millena kaamera end tutvustab, käivitusviisi, võtmed ja iga pesa. Ütleb, milline teine vahekaart seda kaamerat katab, ja selgitab lihtsate sõnadega, milleks iga vahekaart on. **Sellel vahekaardil välkmällu midagi ei kirjutata.**',
  'intro.preserve':
    'Kaameratele **0.x ja 1.x** (2014. ja 2016. aasta järgud). Teeb kaamera 4 MB välkmälust **täieliku** koopia — ka osadest, kuhu tavaline tõmmis ei ulatu — ja seab seejärel kaamera täpselt endisesse olekusse tagasi. See varundab, mida saab lugeda, paikab püsivara korraks, et ülejäänu oleks loetav, teeb kõigest tõmmise, taastab originaali ja kontrollib seda. Kõik toimub kohapeal teie brauseris. **Kaks sammu kirjutavad välkmällu** ja kumbki küsib enne luba.',
  'intro.v4':
    'Teeb **4.x või Nano** kaamera 4 MB SPI-välkmälust WebUSB kaudu koopia ainult lugedes ja dekrüptib kõik leitud püsivara kujutised. Kõik toimub kohapeal teie brauseris — midagi ei laadita kuhugi üles. **Ainult lugemine:** see vahekaart ei saada ühtegi välkmälu kirjutamise, kustutamise, üleslaadimise, kinnitamise ega lähtestamise käsku. Muu püsivaraliiniga kaamerast keeldutakse enne, kui midagi loetakse.',
  'intro.decrypt':
    'Dekrüptib püsivara, mis teil juba on, selles arvutis: kogu välkmälu tõmmise või ühe 64 KB püsivarapesa. **Kaamerat ei kasutata**, nii et see töötab ka siis, kui midagi pole ühendatud, ja brauserites, millel USB-juurdepääs puudub. Fail loetakse siin ja seda ei laadita kunagi üles.',
  'intro.slots':
    'Loeb kaamera kolme püsivarapesa — pesa A, pesa B ja taastepesa R — ning näitab, mida igaüks sisaldab, millisest kaamera käivitub ja mida see järk sellega teha saab, ning nende kõrval seadme töötavat püsivara ja võtmeid. Kõik toimub kohapeal teie brauseris. **See vahekaart kirjutab välkmällu:** see saab kirjutada ühte pesasse dekrüptitud kujutise või toorbaidid ning küsib enne iga kirjutamist.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**WebUSB pole iOS-is ega iPadOS-is saadaval,** seega ei saa see seade kaamera välkmälu lugeda.',
  'support.ios.body':
    'Safari seda ei toeta ja iga iOS-i brauser peab kasutama WebKiti, nii et ka Chrome ja Firefox ei saa seda siin pakkuda. Ükski lipp ega laiendus seda ei muuda. Kaamerast tõmmise tegemiseks kasutage lauaarvutit või USB-OTG-kaabliga Android-telefoni.',
  'support.noWebUsb.title': '**See brauser ei pääse USB-seadmetele juurde.**',
  'support.noWebUsb.body':
    "WebUSB on saadaval Chrome'is, Edge'is, Operas ja teistes Chromiumi brauserites Windowsis, macOS-is, Linuxis ja Androidis. Firefox ja Safari on mõlemad keeldunud seda toetamast.",
  'support.noWebUsb.insecure':
    'Seda lehte ei edastata ka turvalise ühenduse kaudu, mis juba üksi blokeerib WebUSB.',
  'support.insecure.title': '**Ebaturvaline ühendus.** WebUSB on siin keelatud.',
  'support.insecure.body':
    'Avage see leht HTTPS-i kaudu või aadressilt `http://localhost`. Tavaline kohtvõrgu aadress, näiteks `http://192.168.1.10:8000`, ei sobi.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Vahekaarti **{tab}** saate siiski kasutada — see töötab täielikult teie valitud failiga ega vaja USB-juurdepääsu.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Valmis.** Ühendage Seeki kaamera ja vajutage *{connect}*.',
  'support.fileProtocol':
    'Avatud kohaliku failina, nii et brauser ei mäleta seadet lehe uuesti laadimisel. See on kahjutu.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Märkus: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Ühendamine',
  'connect.actions': 'Seadme toimingud',
  'connect.connect': 'Ühenda seade',
  'connect.change': 'Vaheta seade',
  'connect.test': 'Testi ühendust',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Unusta seade',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Pakutakse kõiki Seek Thermali seadmeid (USB tootja `{vendor}`) — Compact, Compact PRO, Nano jne. Valige oma seade brauseri seadmevalijas.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Märkused platvormide kohta',
  'platform.macos':
    "Töötab kohe Chrome'is, Edge'is või mis tahes Chromiumi brauseris. Draiverit ega administraatoriõigusi pole vaja. Sulgege esmalt kõik muud programmid, mis kaameraga juba suhtlevad — USB-liidest saab korraga hoida ainult üks protsess.",
  'platform.linux.access':
    'Andke oma kasutajale seadmele juurdepääs, seejärel eemaldage seade ja ühendage uuesti:',
  'platform.linux.sandbox':
    'Snapi ja Flatpaki Chromiumi järgud on toorestest USB-seadmetest sageli liivakastiga eraldatud; usaldusväärne on `.deb`- või `.rpm`-järk.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Windowsis peab kaameraga olema seotud WinUSB-draiver, enne kui ükski brauser sellele ligi pääseb. Kasutage programmi <zadig>Zadig</zadig>: *Options → List All Devices*, seejärel valige ripploendist kirje, mis kannab teie kaamera nime — näiteks `CompactPRO FF` —, valige draiveriks **WinUSB** ja klõpsake Replace Driver. Kui kaamera on loendis mitu korda, võtke kirje märgisega *(Interface 0)*. Seejärel ei saa tootja tarkvara seadet kasutada, kuni võtate muudatuse seadmehalduris tagasi (*Desinstalli seade → Kustuta draiver*, seejärel ühendage uuesti).',
  'platform.android':
    "Töötab Androidi Chrome'is USB-OTG-kaabliga, kui telefon suudab kaamerale toidet anda. Android annab USB-juurdepääsu oma loadialoogi kaudu. Allalaaditud fail jõuab kausta Allalaadimised nagu iga teine fail.",
  'platform.ios.name': 'iPhone ja iPad',
  'platform.ios.cannot':
    '**Kaamerat lugeda ei saa** ja see ei muutu. Safari ei toeta WebUSB-d ning iOS-is ja iPadOS-is peab iga brauser — ka Chrome ja Firefox — kasutama kuvamiseks WebKiti, nii et ükski neist seda API-t ei paku. Ükski lipp, laiendus ega rakendus ei aita sellest mööda. Tõmmise tegemiseks kasutage lauaarvutit või Android-telefoni.',
  'platform.ios.decrypt':
    "Valikuline dekrüptija töötab siin siiski: olemasoleva tõmmise dekrüptimiseks pole USB-juurdepääsu vaja, nii et seda saab teha iPhone'is või iPadis või ka lauaarvuti Firefoxis ja Safaris.",
} satisfies Translation<'app', 'et'>;
