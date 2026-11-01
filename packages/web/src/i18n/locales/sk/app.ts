/**
 * Namespace `app`, slovenčina (sk), translated from the English source: the shell.
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
  title: 'Súprava nástrojov pre firmvér Seek Thermal',
  'header.cameraSelected': 'Kamera vybraná',
  'header.noCamera': 'Nie je vybraná žiadna kamera',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB nie je k dispozícii',
  'header.github': 'Súprava nástrojov na GitHube',
  'header.tabs': 'Karty',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Info',
  'tab.preserve': 'Výpis a dešifrovanie 0.x/1.x',
  'tab.v4': 'Výpis a dešifrovanie 4.x/Nano',
  'tab.decrypt': 'Dešifrovať súbor/slot',
  'tab.slots': 'Práca so slotmi firmvéru',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Firmvér Seek Thermal — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Tmavý motív',
  'theme.followsSystem': 'Riadi sa svetlým alebo tmavým nastavením vášho systému',
  'theme.chosenDiffers': 'Zvolené tu. Prepnite späť, aby sa motív riadil nastavením systému.',
  'theme.chosenSame': 'Zvolené tu, rovnako ako je teraz nastavený váš systém',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Jazyk',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Prečíta pripojenú kameru rovnako ako `seek-fw info`: jej firmvér, rodinu, ku ktorej sa hlási, ako štartuje, jej kľúče a každý slot. Povie vám, ktorá z ostatných kariet ju pokrýva, a jednoducho vysvetlí, na čo ktorá karta slúži. **Na tejto karte sa do pamäte flash nič nezapisuje.**',
  'intro.preserve':
    'Pre kamery **0.x a 1.x** (zostavy z rokov 2014 a 2016). Vytvorí **úplnú** kópiu 4 MB pamäte flash kamery — vrátane častí, na ktoré bežný výpis nedosiahne — a potom kameru vráti presne do pôvodného stavu. Zálohuje, čo dokáže prečítať, na chvíľu firmvér záplatuje, aby sa dal prečítať aj zvyšok, vypíše všetko, obnoví pôvodný firmvér a skontroluje ho. Všetko beží lokálne vo vašom prehliadači. **Dva z krokov zapisujú do pamäte flash** a každý sa vás najprv opýta.',
  'intro.v4':
    'Vytvorí cez WebUSB kópiu 4 MB pamäte SPI flash kamery **4.x alebo Nano** len na čítanie a dešifruje všetky obrazy firmvéru, ktoré v nej nájde. Všetko beží lokálne vo vašom prehliadači — nič sa nikam nenahráva. **Len na čítanie:** táto karta neposiela žiadny príkaz na zápis, mazanie, nahranie, potvrdenie ani reset pamäte flash. Kamera s iným radom firmvéru sa odmietne skôr, než sa čokoľvek prečíta.',
  'intro.decrypt':
    'Dešifruje firmvér, ktorý už máte, priamo na tomto počítači: celý výpis pamäte flash alebo jeden slot firmvéru s veľkosťou 64 KB. **Nepoužíva sa žiadna kamera**, takže to funguje, aj keď nič nie je pripojené, a tiež v prehliadačoch bez prístupu k USB. Súbor sa číta tu a nikdy sa nenahráva.',
  'intro.slots':
    'Prečíta tri sloty firmvéru kamery — slot A, slot B a slot na obnovu R — a ukáže, čo ktorý obsahuje, z ktorého kamera štartuje a čo s ním táto zostava dokáže, a vedľa nich bežiaci firmvér zariadenia a jeho kľúče. Všetko beží lokálne vo vašom prehliadači. **Táto karta zapisuje do pamäte flash:** dokáže zapísať jeden slot z dešifrovaného obrazu alebo zo surových bajtov a pred každým zápisom sa opýta.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**WebUSB nie je v iOS ani iPadOS k dispozícii,** takže toto zariadenie nedokáže čítať pamäť flash kamery.',
  'support.ios.body':
    'Safari ho neimplementuje a každý prehliadač v iOS musí používať WebKit, takže ho nemôžu sprístupniť ani Chrome a Firefox. Neexistuje žiadny príznak ani rozšírenie, ktoré by to zmenilo. Na výpis kamery použite stolný počítač alebo telefón s Androidom a kábel USB-OTG.',
  'support.noWebUsb.title': '**Tento prehliadač nemá prístup k zariadeniam USB.**',
  'support.noWebUsb.body':
    'WebUSB je k dispozícii v prehliadačoch Chrome, Edge, Opera a ďalších prehliadačoch založených na Chromiu vo Windows, macOS, Linuxe a Androide. Firefox aj Safari jeho implementáciu odmietli.',
  'support.noWebUsb.insecure':
    'Táto stránka navyše nie je načítaná cez zabezpečené pripojenie, čo WebUSB blokuje samo osebe.',
  'support.insecure.title': '**Nezabezpečené pripojenie.** WebUSB je tu vypnuté.',
  'support.insecure.body':
    'Otvorte túto stránku cez HTTPS alebo z `http://localhost`. Obyčajná adresa v miestnej sieti, napríklad `http://192.168.1.10:8000`, nestačí.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Stále môžete použiť kartu **{tab}** — tá pracuje len so súborom, ktorý vyberiete, a nepotrebuje prístup k USB.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Pripravené.** Pripojte kameru Seek a stlačte *{connect}*.',
  'support.fileProtocol':
    'Stránka je otvorená ako lokálny súbor, takže si prehliadač zariadenie medzi načítaniami nezapamätá. To nevadí.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Poznámka: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Pripojenie',
  'connect.actions': 'Akcie zariadenia',
  'connect.connect': 'Pripojiť zariadenie',
  'connect.change': 'Zmeniť zariadenie',
  'connect.test': 'Otestovať pripojenie',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Zabudnúť zariadenie',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Ponúka sa akékoľvek zariadenie Seek Thermal (výrobca USB `{vendor}`) — Compact, Compact PRO, Nano a ďalšie. Vyberte to svoje v dialógovom okne prehliadača na výber zariadenia.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Poznámky k platformám',
  'platform.macos':
    'Funguje hneď v prehliadačoch Chrome, Edge alebo akomkoľvek inom prehliadači založenom na Chromiu. Žiadna inštalácia ovládača, žiadne práva správcu. Najprv ukončite každý iný program, ktorý už s kamerou komunikuje — rozhranie USB môže mať v jednej chvíli len jeden proces.',
  'platform.linux.access':
    'Dajte svojmu používateľovi prístup k zariadeniu a potom ho odpojte a znova pripojte:',
  'platform.linux.sandbox':
    'Zostavy Chromia zo Snapu a Flatpaku bývajú v sandboxe odrezané od priameho prístupu k zariadeniam USB; spoľahlivá je zostava `.deb` alebo `.rpm`.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Windows potrebuje, aby bol ku kamere priradený ovládač WinUSB, skôr než sa k nej dostane akýkoľvek prehliadač. Použite <zadig>Zadig</zadig>: *Options → List All Devices*, potom v rozbaľovacom zozname vyberte položku pomenovanú podľa vašej kamery — napríklad `CompactPRO FF` — ako ovládač zvoľte **WinUSB** a kliknite na Replace Driver. Ak sa kamera zobrazí viackrát, vyberte položku označenú *(Interface 0)*. Zariadenie potom prestane fungovať so softvérom výrobcu, kým zmenu nevrátite v Správcovi zariadení (*Odinštalovať zariadenie → Odstrániť ovládač*, potom kameru znova pripojte).',
  'platform.android':
    'Funguje v Chrome pre Android s káblom USB-OTG, ak telefón dokáže kameru napájať zo zbernice. Android povoľuje prístup k USB vlastným dialógovým oknom povolení. Stiahnutý súbor sa uloží do priečinka Stiahnuté súbory ako každý iný.',
  'platform.ios.name': 'iPhone a iPad',
  'platform.ios.cannot':
    '**Kameru nie je možné prečítať** a nezmení sa to. Safari WebUSB neimplementuje a v iOS a iPadOS musí každý prehliadač — vrátane Chromu a Firefoxu — vykresľovať pomocou WebKitu, takže žiadny z nich toto API nesprístupní. Neexistuje žiadny príznak, rozšírenie ani aplikácia, ktoré by to obišli. Na výpis použite stolný počítač alebo telefón s Androidom.',
  'platform.ios.decrypt':
    'Voliteľné dešifrovanie tu však funguje: dešifrovanie výpisu, ktorý už máte, nepotrebuje prístup k USB, takže to zvládnete z iPhonu alebo iPadu, alebo z Firefoxu a Safari na stolnom počítači.',
} satisfies Translation<'app', 'sk'>;
