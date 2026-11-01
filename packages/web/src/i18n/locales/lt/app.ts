/**
 * Namespace `app`, lietuvių (lt), translated from the English source: the shell.
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
  title: 'Seek Thermal mikroprogramos įrankių rinkinys',
  'header.cameraSelected': 'Kamera pasirinkta',
  'header.noCamera': 'Kamera nepasirinkta',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB nepasiekiamas',
  'header.github': 'Įrankių rinkinys „GitHub“ svetainėje',
  'header.tabs': 'Skirtukai',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Informacija',
  'tab.preserve': 'Nuskaityti ir iššifruoti 0.x/1.x',
  'tab.v4': 'Nuskaityti ir iššifruoti 4.x/Nano',
  'tab.decrypt': 'Iššifruoti failą/lizdą',
  'tab.slots': 'Darbas su mikroprogramos lizdais',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Seek Thermal mikroprograma — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Tamsi tema',
  'theme.followsSystem': 'Atitinka jūsų sistemos šviesios ar tamsios temos nustatymą',
  'theme.chosenDiffers':
    'Pasirinkta čia. Perjunkite atgal, kad tema vėl atitiktų sistemos nustatymą.',
  'theme.chosenSame': 'Pasirinkta čia, kaip ir dabartinis jūsų sistemos nustatymas',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Kalba',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Nuskaito prijungtą kamerą taip pat, kaip `seek-fw info`: jos mikroprogramą, šeimą, kuria ji prisistato, kaip ji pasileidžia, jos raktus ir kiekvieną lizdą. Nurodo, kuris iš kitų skirtukų jai skirtas, ir paprastai paaiškina, kam skirtas kiekvienas skirtukas. **Šiame skirtuke į flash atmintį nieko nerašoma.**',
  'intro.preserve':
    'Skirta **0.x ir 1.x** kameroms (2014 ir 2016 m. leidimams). Sukuria **visą** kameros 4 MB flash atminties kopiją — įskaitant dalis, kurių įprastas nuskaitymas nepasiekia, — ir tada grąžina kamerą lygiai į tokią būseną, kokia ji buvo. Pasidaro atsarginę kopiją to, ką gali perskaityti, trumpam pataiso mikroprogramą, kad būtų galima perskaityti ir likusią dalį, nuskaito viską, atkuria originalą ir jį patikrina. Viskas vyksta vietoje, jūsų naršyklėje. **Du žingsniai rašo į flash atmintį**, ir prieš kiekvieną jūsų paklausiama.',
  'intro.v4':
    'Per WebUSB tik skaitydamas sukuria **4.x arba Nano** kameros 4 MB SPI flash atminties kopiją ir iššifruoja visus rastus mikroprogramos atvaizdus. Viskas vyksta vietoje, jūsų naršyklėje — niekas niekur neįkeliama. **Tik skaitymas:** šis skirtukas nesiunčia jokių flash įrašymo, trynimo, įkėlimo, patvirtinimo ar paleidimo iš naujo komandų. Kitos mikroprogramos linijos kamera atmetama dar prieš ką nors nuskaitant.',
  'intro.decrypt':
    'Iššifruoja jau turimą mikroprogramą šiame kompiuteryje: visą flash atminties išklotinę arba vieną 64 KB mikroprogramos lizdą. **Kamera nenaudojama**, todėl tai veikia ir nieko neprijungus, ir naršyklėse be USB prieigos. Failas skaitomas čia ir niekur neįkeliamas.',
  'intro.slots':
    'Nuskaito tris kameros mikroprogramos lizdus — lizdą A, lizdą B ir atkūrimo lizdą R — ir parodo, kas kiekviename yra, iš kurio kamera pasileidžia ir ką su juo gali padaryti šis leidimas, o šalia — įrenginyje veikiančią mikroprogramą ir raktus. Viskas vyksta vietoje, jūsų naršyklėje. **Šis skirtukas rašo į flash atmintį:** jis gali įrašyti vieną lizdą iš iššifruoto atvaizdo arba iš neapdorotų baitų ir prieš kiekvieną įrašymą paklausia.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**iOS ir iPadOS sistemose WebUSB nepasiekiamas,** todėl šiuo įrenginiu kameros flash atminties nuskaityti negalima.',
  'support.ios.body':
    'Safari jo nepalaiko, o visos iOS naršyklės privalo naudoti WebKit, todėl ir Chrome bei Firefox čia jo pateikti negali. Nėra jokios vėliavėlės ar plėtinio, kuris tai pakeistų. Norėdami nuskaityti kamerą, naudokite stalinį kompiuterį arba Android telefoną su USB-OTG kabeliu.',
  'support.noWebUsb.title': '**Ši naršyklė negali pasiekti USB įrenginių.**',
  'support.noWebUsb.body':
    'WebUSB veikia Chrome, Edge, Opera ir kitose Chromium naršyklėse Windows, macOS, Linux ir Android sistemose. Firefox ir Safari jo diegti atsisakė.',
  'support.noWebUsb.insecure':
    'Be to, šis puslapis pateikiamas ne saugiu ryšiu, o tai jau savaime blokuoja WebUSB.',
  'support.insecure.title': '**Nesaugus ryšys.** WebUSB čia išjungtas.',
  'support.insecure.body':
    'Atverkite šį puslapį per HTTPS arba iš `http://localhost`. Paprastas vietinio tinklo adresas, pavyzdžiui, `http://192.168.1.10:8000`, netinka.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Vis tiek galite naudoti skirtuką **{tab}** — jis veikia tik su jūsų pasirinktu failu ir USB prieigos nereikalauja.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Pasiruošta.** Prijunkite Seek kamerą ir spustelėkite *{connect}*.',
  'support.fileProtocol':
    'Atverta kaip vietinis failas, todėl naršyklė neprisimins įrenginio, kai puslapis bus įkeltas iš naujo. Tai nekenksminga.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Pastaba: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Prijungimas',
  'connect.actions': 'Įrenginio veiksmai',
  'connect.connect': 'Prijungti įrenginį',
  'connect.change': 'Keisti įrenginį',
  'connect.test': 'Tikrinti ryšį',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Pamiršti įrenginį',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Siūlomas bet kuris Seek Thermal įrenginys (USB gamintojas `{vendor}`) — Compact, Compact PRO, Nano ir kiti. Pasirinkite savąjį naršyklės įrenginių sąraše.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Pastabos apie platformas',
  'platform.macos':
    'Veikia iškart Chrome, Edge ar bet kurioje kitoje Chromium naršyklėje. Nereikia diegti tvarkyklės ir nereikia administratoriaus teisių. Pirmiausia išjunkite kitas programas, kurios jau bendrauja su kamera — USB sąsają vienu metu gali naudoti tik vienas procesas.',
  'platform.linux.access':
    'Suteikite savo naudotojui prieigą prie įrenginio, tada jį atjunkite ir vėl prijunkite:',
  'platform.linux.sandbox':
    'Snap ir Flatpak Chromium versijos dažnai izoliuotos nuo tiesioginės prieigos prie USB įrenginių; patikima yra `.deb` arba `.rpm` versija.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Windows sistemoje prie kameros turi būti priskirta WinUSB tvarkyklė, kitaip jos nepasieks jokia naršyklė. Naudokite <zadig>Zadig</zadig>: *Options → List All Devices*, tada išskleidžiamajame sąraše pasirinkite įrašą, pavadintą jūsų kameros vardu — pavyzdžiui, `CompactPRO FF`, — kaip tvarkyklę pasirinkite **WinUSB** ir spustelėkite Replace Driver. Jei kamera rodoma daugiau nei kartą, rinkitės įrašą su žyma *(Interface 0)*. Taip įrenginys atimamas iš gamintojo programinės įrangos, kol to neatšauksite įrenginių tvarkytuvėje (*Šalinti įrenginį → Naikinti tvarkyklę*, tada vėl prijunkite).',
  'platform.android':
    'Veikia Chrome naršyklėje Android įrenginyje su USB-OTG kabeliu, jei telefonas gali tiekti kamerai maitinimą. Android USB prieigą suteikia savo leidimų dialogo lange. Atsisiųstas failas atsiduria aplanke „Atsisiuntimai“, kaip ir bet kuris kitas failas.',
  'platform.ios.name': 'iPhone ir iPad',
  'platform.ios.cannot':
    '**Kameros nuskaityti negalima**, ir tai nepasikeis. Safari nepalaiko WebUSB, o iOS ir iPadOS sistemose visos naršyklės — įskaitant Chrome ir Firefox — privalo naudoti WebKit, todėl nė viena šios API nepateikia. Nėra jokios vėliavėlės, plėtinio ar programėlės, kuri tai apeitų. Nuskaitymui naudokite stalinį kompiuterį arba Android telefoną.',
  'platform.ios.decrypt':
    'Pasirenkamas iššifravimas čia veikia: jau turimai išklotinei iššifruoti USB prieigos nereikia, todėl tai galite atlikti iš iPhone ar iPad arba stalinio kompiuterio Firefox ir Safari naršyklėse.',
} satisfies Translation<'app', 'lt'>;
