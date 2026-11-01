/**
 * Namespace `app`, čeština (cs), translated from the English source: the shell.
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
  title: 'Sada nástrojů pro firmware Seek Thermal',
  'header.cameraSelected': 'Kamera vybrána',
  'header.noCamera': 'Není vybrána žádná kamera',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB není k dispozici',
  'header.github': 'Sada nástrojů na GitHubu',
  'header.tabs': 'Karty',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Info',
  'tab.preserve': 'Výpis a dešifrování 0.x/1.x',
  'tab.v4': 'Výpis a dešifrování 4.x/Nano',
  'tab.decrypt': 'Dešifrovat soubor/slot',
  'tab.slots': 'Práce se sloty firmwaru',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Firmware Seek Thermal — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Tmavý motiv',
  'theme.followsSystem': 'Řídí se světlým nebo tmavým nastavením vašeho systému',
  'theme.chosenDiffers': 'Zvoleno zde. Přepněte zpět, aby se motiv řídil nastavením systému.',
  'theme.chosenSame': 'Zvoleno zde, stejně jako je teď nastaven váš systém',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Jazyk',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Přečte připojenou kameru stejně jako `seek-fw info`: její firmware, rodinu, za kterou se hlásí, jak startuje, její klíče a každý slot. Řekne vám, která z ostatních karet ji pokrývá, a jednoduše vysvětlí, k čemu která karta slouží. **Na této kartě se do paměti flash nic nezapisuje.**',
  'intro.preserve':
    'Pro kamery **0.x a 1.x** (sestavení z let 2014 a 2016). Pořídí **úplnou** kopii 4 MB paměti flash kamery — včetně částí, na které běžný výpis nedosáhne — a potom kameru vrátí přesně do původního stavu. Zálohuje, co dokáže přečíst, na chvíli firmware záplatuje, aby šel přečíst i zbytek, vyčte vše, obnoví původní firmware a zkontroluje ho. Vše běží místně ve vašem prohlížeči. **Dva z kroků zapisují do paměti flash** a každý se vás nejdřív zeptá.',
  'intro.v4':
    'Pořídí přes WebUSB kopii 4 MB paměti SPI flash kamery **4.x nebo Nano** jen pro čtení a dešifruje všechny obrazy firmwaru, které v ní najde. Vše běží místně ve vašem prohlížeči — nic se nikam nenahrává. **Jen pro čtení:** tato karta neposílá žádný příkaz k zápisu, mazání, nahrání, potvrzení ani resetu paměti flash. Kamera s jinou řadou firmwaru je odmítnuta dřív, než se cokoli přečte.',
  'intro.decrypt':
    'Dešifruje firmware, který už máte, přímo na tomto počítači: celý výpis paměti flash nebo jeden slot firmwaru o velikosti 64 KB. **Nepoužívá se žádná kamera**, takže to funguje, i když nic není připojeno, a také v prohlížečích bez přístupu k USB. Soubor se čte zde a nikdy se nenahrává.',
  'intro.slots':
    'Přečte tři sloty firmwaru kamery — slot A, slot B a slot pro obnovu R — a ukáže, co který obsahuje, ze kterého kamera startuje a co s ním toto sestavení dokáže, a vedle nich běžící firmware zařízení a jeho klíče. Vše běží místně ve vašem prohlížeči. **Tato karta zapisuje do paměti flash:** dokáže zapsat jeden slot z dešifrovaného obrazu nebo ze surových bajtů a před každým zápisem se zeptá.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**WebUSB není v iOS ani iPadOS k dispozici,** takže toto zařízení nedokáže číst paměť flash kamery.',
  'support.ios.body':
    'Safari ho neimplementuje a každý prohlížeč v iOS musí používat WebKit, takže ho nemohou zpřístupnit ani Chrome a Firefox. Neexistuje žádný příznak ani rozšíření, které by to změnilo. K výpisu kamery použijte stolní počítač nebo telefon s Androidem a kabel USB-OTG.',
  'support.noWebUsb.title': '**Tento prohlížeč nemá přístup k zařízením USB.**',
  'support.noWebUsb.body':
    'WebUSB je k dispozici v prohlížečích Chrome, Edge, Opera a dalších prohlížečích založených na Chromiu ve Windows, macOS, Linuxu a Androidu. Firefox i Safari jeho implementaci odmítly.',
  'support.noWebUsb.insecure':
    'Tato stránka navíc není načtena přes zabezpečené připojení, což WebUSB blokuje samo o sobě.',
  'support.insecure.title': '**Nezabezpečené připojení.** WebUSB je zde vypnuté.',
  'support.insecure.body':
    'Otevřete tuto stránku přes HTTPS nebo z `http://localhost`. Obyčejná adresa v místní síti, například `http://192.168.1.10:8000`, nestačí.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Stále můžete použít kartu **{tab}** — ta pracuje jen se souborem, který vyberete, a nepotřebuje přístup k USB.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Připraveno.** Připojte kameru Seek a stiskněte *{connect}*.',
  'support.fileProtocol':
    'Stránka je otevřená jako místní soubor, takže si prohlížeč zařízení mezi načteními nezapamatuje. To nevadí.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Poznámka: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Připojení',
  'connect.actions': 'Akce zařízení',
  'connect.connect': 'Připojit zařízení',
  'connect.change': 'Změnit zařízení',
  'connect.test': 'Otestovat připojení',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Zapomenout zařízení',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Nabízí se jakékoli zařízení Seek Thermal (výrobce USB `{vendor}`) — Compact, Compact PRO, Nano a další. Vyberte to své v dialogu prohlížeče pro výběr zařízení.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Poznámky k platformám',
  'platform.macos':
    'Funguje hned v prohlížečích Chrome, Edge nebo jakémkoli jiném prohlížeči založeném na Chromiu. Žádná instalace ovladače, žádná práva správce. Nejdřív ukončete každý jiný program, který už s kamerou komunikuje — rozhraní USB může mít v jednu chvíli jen jeden proces.',
  'platform.linux.access':
    'Dejte svému uživateli přístup k zařízení a pak ho odpojte a znovu připojte:',
  'platform.linux.sandbox':
    'Sestavení Chromia ze Snapu a Flatpaku bývají v sandboxu odříznutá od přímého přístupu k zařízením USB; spolehlivé je sestavení `.deb` nebo `.rpm`.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Windows potřebují, aby byl ke kameře přiřazen ovladač WinUSB, než se k ní dostane jakýkoli prohlížeč. Použijte <zadig>Zadig</zadig>: *Options → List All Devices*, pak v rozbalovacím seznamu vyberte položku pojmenovanou podle vaší kamery — například `CompactPRO FF` — jako ovladač zvolte **WinUSB** a klikněte na Replace Driver. Pokud se kamera objeví víckrát, vyberte položku označenou *(Interface 0)*. Tím zařízení přestane fungovat se softwarem výrobce, dokud změnu nevrátíte ve Správci zařízení (*Odinstalovat zařízení → Odstranit ovladač*, potom kameru znovu připojte).',
  'platform.android':
    'Funguje v Chromu pro Android s kabelem USB-OTG, pokud telefon dokáže kameru napájet ze sběrnice. Android povoluje přístup k USB vlastním dialogem oprávnění. Stažený soubor se uloží do složky Stažené soubory jako každý jiný.',
  'platform.ios.name': 'iPhone a iPad',
  'platform.ios.cannot':
    '**Kameru přečíst nelze** a nezmění se to. Safari WebUSB neimplementuje a v iOS a iPadOS musí každý prohlížeč — včetně Chromu a Firefoxu — vykreslovat pomocí WebKitu, takže žádný z nich toto API nezpřístupní. Neexistuje žádný příznak, rozšíření ani aplikace, které by to obešly. K výpisu použijte stolní počítač nebo telefon s Androidem.',
  'platform.ios.decrypt':
    'Volitelné dešifrování zde ale funguje: dešifrování výpisu, který už máte, nepotřebuje přístup k USB, takže to zvládnete z iPhonu nebo iPadu, nebo z Firefoxu a Safari na stolním počítači.',
} satisfies Translation<'app', 'cs'>;
