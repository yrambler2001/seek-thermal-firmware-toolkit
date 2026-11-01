/**
 * Namespace `app`, latviešu (lv), translated from the English source: the shell.
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
  title: 'Seek Thermal aparātprogrammatūras rīkkopa',
  'header.cameraSelected': 'Kamera izvēlēta',
  'header.noCamera': 'Kamera nav izvēlēta',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB nav pieejams',
  'header.github': 'Rīkkopa vietnē GitHub',
  'header.tabs': 'Cilnes',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Informācija',
  'tab.preserve': 'Nolasīt un atšifrēt 0.x/1.x',
  'tab.v4': 'Nolasīt un atšifrēt 4.x/Nano',
  'tab.decrypt': 'Atšifrēt failu/slotu',
  'tab.slots': 'Darbs ar aparātprogrammatūras slotiem',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Seek Thermal aparātprogrammatūra — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Tumšais motīvs',
  'theme.followsSystem': 'Seko jūsu sistēmas gaišā vai tumšā režīma iestatījumam',
  'theme.chosenDiffers': 'Izvēlēts šeit. Pārslēdziet atpakaļ, lai sekotu sistēmas iestatījumam.',
  'theme.chosenSame': 'Izvēlēts šeit; pašlaik tāds pats kā sistēmas iestatījums',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Valoda',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Nolasa pievienoto kameru tāpat kā `seek-fw info`: tās aparātprogrammatūru, saimi, kurai tā atbilst, sāknēšanas veidu, atslēgas un katru slotu. Pasaka, kura no pārējām cilnēm to aptver, un vienkāršiem vārdiem izskaidro, kam paredzēta katra cilne. **Šajā cilnē zibatmiņā nekas netiek ierakstīts.**',
  'intro.preserve':
    'Kamerām ar **0.x un 1.x** (2014. un 2016. gada būvējumi). Izveido **pilnu** kameras 4 MB zibatmiņas kopiju — arī tās daļas, ko parasta nolasīšana nesasniedz, — un pēc tam atjauno kameru tieši tādu, kāda tā bija. Tā saglabā rezerves kopiju no tā, ko var nolasīt, uz īsu brīdi uzliek aparātprogrammatūrai ielāpu, lai varētu nolasīt pārējo, nolasa visu, atjauno oriģinālu un to pārbauda. Viss notiek lokāli jūsu pārlūkprogrammā. **Divi soļi raksta zibatmiņā**, un katrs vispirms jums pajautā.',
  'intro.v4':
    'Tikai lasot, izveido **4.x vai Nano** kameras 4 MB SPI zibatmiņas kopiju, izmantojot WebUSB, un atšifrē visus atrastos aparātprogrammatūras attēlus. Viss notiek lokāli jūsu pārlūkprogrammā — nekas netiek nekur augšupielādēts. **Tikai lasīšana:** šī cilne nesūta nevienu zibatmiņas rakstīšanas, dzēšanas, augšupielādes, apstiprināšanas (commit) vai atiestatīšanas komandu. Kamera ar citu aparātprogrammatūras līniju tiek atteikta, pirms kaut kas tiek nolasīts.',
  'intro.decrypt':
    'Atšifrē aparātprogrammatūru, kas jums jau ir, šajā datorā: visas zibatmiņas izmeti vai vienu 64 KB aparātprogrammatūras slotu. **Kamera netiek izmantota**, tāpēc tas darbojas arī tad, ja nekas nav pievienots, un pārlūkprogrammās bez USB piekļuves. Fails tiek nolasīts šeit un nekad netiek augšupielādēts.',
  'intro.slots':
    'Nolasa trīs kameras aparātprogrammatūras slotus — slotu A, slotu B un atkopšanas slotu R — un parāda, kas ir katrā, no kura kamera sāknējas un ko šis būvējums ar to var izdarīt, un blakus tiem — ierīcē strādājošo aparātprogrammatūru un atslēgas. Viss notiek lokāli jūsu pārlūkprogrammā. **Šī cilne raksta zibatmiņā:** tā var ierakstīt vienu slotu no atšifrēta attēla vai no neapstrādātiem baitiem un pirms katras ierakstīšanas pajautā.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**WebUSB nav pieejams iOS un iPadOS,** tāpēc šī ierīce nevar nolasīt kameras zibatmiņu.',
  'support.ios.body':
    'Safari to neatbalsta, un katrai iOS pārlūkprogrammai ir jāizmanto WebKit, tāpēc arī Chrome un Firefox šeit to nevar piedāvāt. Nav neviena karodziņa vai paplašinājuma, kas to mainītu. Lai nolasītu kameru, izmantojiet galddatoru vai Android tālruni ar USB-OTG kabeli.',
  'support.noWebUsb.title': '**Šī pārlūkprogramma nevar piekļūt USB ierīcēm.**',
  'support.noWebUsb.body':
    'WebUSB ir pieejams pārlūkprogrammās Chrome, Edge, Opera un citās Chromium pārlūkprogrammās operētājsistēmās Windows, macOS, Linux un Android. Gan Firefox, gan Safari ir atteikušies to ieviest.',
  'support.noWebUsb.insecure':
    'Turklāt šī lapa netiek pasniegta pa drošu savienojumu, un tas jau pats par sevi bloķē WebUSB.',
  'support.insecure.title': '**Nedrošs savienojums.** WebUSB šeit ir atspējots.',
  'support.insecure.body':
    'Atveriet šo lapu, izmantojot HTTPS, vai no `http://localhost`. Parasta lokālā tīkla adrese, piemēram, `http://192.168.1.10:8000`, neder.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Jūs joprojām varat izmantot cilni **{tab}** — tā strādā tikai ar jūsu izvēlētu failu, un tai nav vajadzīga USB piekļuve.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Gatavs.** Pievienojiet savu Seek kameru un nospiediet *{connect}*.',
  'support.fileProtocol':
    'Lapa atvērta kā lokāls fails, tāpēc pārlūkprogramma starp pārlādēm neatcerēsies ierīci. Tas nekaitē.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Piezīme: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Pievienošana',
  'connect.actions': 'Ierīces darbības',
  'connect.connect': 'Pievienot ierīci',
  'connect.change': 'Mainīt ierīci',
  'connect.test': 'Pārbaudīt savienojumu',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Aizmirst ierīci',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Tiek piedāvāta jebkura Seek Thermal ierīce (USB ražotājs `{vendor}`) — Compact, Compact PRO, Nano un citas. Izvēlieties savējo pārlūkprogrammas ierīču izvēles logā.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Piezīmes par platformām',
  'platform.macos':
    'Darbojas uzreiz pārlūkprogrammā Chrome, Edge vai jebkurā Chromium pārlūkprogrammā. Nav jāinstalē draiveris, nav vajadzīgas administratora tiesības. Vispirms aizveriet jebkuru citu programmu, kas jau sazinās ar kameru, — USB saskarni vienlaikus var turēt tikai viens process.',
  'platform.linux.access':
    'Piešķiriet savam lietotājam piekļuvi ierīcei, pēc tam atvienojiet to un pievienojiet atkal:',
  'platform.linux.sandbox':
    'Snap un Flatpak Chromium būvējumi bieži ir smilškastē nošķirti no tiešas piekļuves USB ierīcēm; uzticams ir `.deb` vai `.rpm` būvējums.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Operētājsistēmā Windows kamerai ir jāpiesaista WinUSB draiveris, pirms jebkura pārlūkprogramma tai var piekļūt. Izmantojiet <zadig>Zadig</zadig>: *Options → List All Devices*, tad nolaižamajā sarakstā izvēlieties ierakstu, kas nosaukts jūsu kameras vārdā, — piemēram, `CompactPRO FF` —, kā draiveri izvēlieties **WinUSB** un noklikšķiniet uz Replace Driver. Ja jūsu kamera sarakstā ir vairāk nekā vienu reizi, ņemiet ierakstu ar atzīmi *(Interface 0)*. Pēc tam ierīce vairs nav pieejama ražotāja programmatūrai, līdz jūs to atjaunojat ierīču pārvaldniekā (*Atinstalēt ierīci → noņemt draiveri*, pēc tam pievienojiet kameru atkal).',
  'platform.android':
    'Darbojas pārlūkprogrammā Chrome operētājsistēmā Android ar USB-OTG kabeli, ja vien tālrunis var nodrošināt kamerai barošanu. Android piešķir USB piekļuvi ar savu atļauju dialogu. Lejupielāde nonāk mapē Lejupielādes tāpat kā jebkurš cits fails.',
  'platform.ios.name': 'iPhone un iPad',
  'platform.ios.cannot':
    '**Nevar nolasīt kameru**, un tas nemainīsies. Safari neatbalsta WebUSB, un iOS un iPadOS katrai pārlūkprogrammai — arī Chrome un Firefox — lapas jāattēlo ar WebKit, tāpēc neviena no tām šo API nepiedāvā. Nav neviena karodziņa, paplašinājuma vai lietotnes, kas to apietu. Lai nolasītu kameru, izmantojiet galddatoru vai Android tālruni.',
  'platform.ios.decrypt':
    'Neobligātais atšifrētājs šeit gan darbojas: lai atšifrētu jau esošu izmeti, USB piekļuve nav vajadzīga, tāpēc to var izdarīt no iPhone vai iPad, kā arī no Firefox un Safari galddatorā.',
} satisfies Translation<'app', 'lv'>;
