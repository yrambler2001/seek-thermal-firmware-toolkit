/**
 * Namespace `v4`, magyar (hu), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/V4View.tsx, hooks/useDumpPanel.ts, components/CameraIdentity.tsx,
 * components/OptionsDetails.tsx, lib/options.ts.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useDumpPanel: the status line. */
  'status.starting': 'Indítás…',
  'status.building': 'Archívum összeállítása…',
  'status.cancelling': 'Megszakítás – az eddig kiolvasottakat elmenti…',
  'status.refused': 'Elutasítva – semmi sem lett kiolvasva. Lásd a napló feletti üzenetet.',
  'status.sweepDone':
    'Kész – {armed}/{total} szelektor élesítve, ebből adattal: {withData}. Nézze meg a letöltéseit.',
  'status.sweepDoneCancelled':
    'Kész – {armed}/{total} szelektor élesítve, ebből adattal: {withData} (megszakítva). Nézze meg a letöltéseit.',
  'status.dumpDone': 'Kész – kiolvasott ablakok: {read}/{expected}. Nézze meg a letöltéseit.',
  'status.dumpDoneCancelled':
    'Kész – kiolvasott ablakok: {read}/{expected} (megszakítva). Nézze meg a letöltéseit.',
  'status.dumpDoneIncomplete':
    'Kész – kiolvasott ablakok: {read}/{expected} (hiányos – lásd a naplót). Nézze meg a letöltéseit.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'A kamera nem a 4.x/Nano családba tartozik, ez a fül pedig csak ezt a családot olvassa. Semmi sem lett kiolvasva. 0.x vagy 1.x kamerához (2014-es vagy 2016-os változat) használja a(z) „{tab}” fület.',
  'refusal.otherFamily':
    'A kamera {name} ({id}) családúnak tűnik, nem 4.x/Nano kamerának, ez a fül pedig csak 4.x/Nano kamerát olvas. Semmi sem lett kiolvasva. 0.x vagy 1.x kamerához (2014-es vagy 2016-os változat) használja a(z) „{tab}” fület.',
  'refusal.legacyLine':
    'A kamera firmware-e {version}, ez 0.x vagy 1.x változat (2014-es vagy 2016-os), ez a fül pedig csak 4.x/Nano kamerát olvas. A verzión kívül semmi sem lett kiolvasva. 0.x vagy 1.x kamerához használja a(z) „{tab}” fület.',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Kiolvasás',
  'dump.actions': 'Kiolvasási műveletek',
  'dump.start': 'Kiolvasás indítása',
  'dump.panel': 'Kiolvasás',
  'dump.how':
    'Mindkettő először megkérdezi a kamerától, milyen firmware-t futtat: a verzióját a `{getInfo}` paranccsal – ez az egyetlen olvasás, amelyre minden Seek változat ugyanúgy válaszol –, és csak ha az adott változat USB-n keresztül olvasható, egy egyszerű és egy tokent hordozó `{begin}` parancsot és egyetlen olvasást. Ebből tudja meg az oldal, melyik családba tartozik a kamera. Ez a fül csak a 4.x és Nano családot olvassa. Azt a kamerát, amelyet a válaszok máshová sorolnak, még az olvasás előtt elutasítja, és megnevezi a neki való fület. Azt a kamerát, amely nem jelenti a verzióját, vagy a 0.8.0.0-nál régebbi változatot futtat, egyáltalán nem olvassa ki, és megmondja, miért.',
  'dump.modes':
    'A **Kiolvasás indítása** minden blokkot kiolvas, amelyet a változat saját szelektortáblája elér. A lenti *Beállítások* alatt található **Minden szelektor kiolvasása** minden `{begin}` szelektort kipróbál `{first}` és `{last}` között, és elmenti, amit mindegyik visszaad – lassabb, de azokat a blokkokat is rögzíti, amelyeket a válogatott térkép kihagy.',
  'dump.sweep': 'Minden szelektor kiolvasása ({first}–{last})',
  'dump.sweepNote':
    'Minden szelektort kipróbál, és elmenti, amit mindegyik visszaad. Lassabb a „Kiolvasás indítása” műveletnél.',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'Mit kap',
  'output.intro': 'Egyetlen `{ext}` letöltés, amely tartalmazza:',
  'output.caption': 'A letöltött archívumban lévő fájlok',
  'output.file': 'Fájl',
  'output.what': 'Mi ez',
  'output.flash':
    'az összeállított 4 MB-os flash-memóriakép (a hézagkitöltés és a feloldó token, ha volt, a manifest.json fájlban van)',
  'output.windows': 'minden 64 KB-os blokk pontosan úgy, ahogy a vezetéken érkezett',
  'output.decrypted': 'minden firmware-lemezkép slot, visszafejtve (ha kulcs is előkerült)',
  'output.reports':
    'slotonkénti jelentés: kulcs, a kulcs helye, család és titkosítás, SP, belépési pont, SHA-256',
  'output.manifest': 'pontos olvasási, hézag- és visszafejtési metaadatok',
  'output.readme': 'mi a rögzítés, és mik a korlátai',
  'output.keyFromDump':
    'A kulcsot magából a memóriaképből nyeri ki, így nincs szükség kulcsfájlra vagy eszköztitokra.',
  'output.bestEffort':
    'A visszafejtés így is a lehetőségek szerinti legjobb kísérlet. Ha nem kerül elő kulcs – például olyan egységen, amelynek a bootloadere a chip OTP-jéből származtatja a kulcsot, ami nincs benne a flash-memóriaképben –, az a slot egyszerűen kimarad, az archívum többi részét pedig ez nem érinti.',
  'gap.summary': 'A hézag itt: {address}',
  'gap.where':
    'Az USB-parancskészlet a 4 MB-os flash memória minden 64 KB-os blokkjához kínál olvasási ablakszelektort, kivéve ezt: `{range}`. Ezt a blokkot az összefűzött lemezképben `{fill}` tölti ki, és a `{manifest}` fájl rögzíti.',
  'gap.costs':
    '**A gyakorlatban ez semmibe sem kerül.** A legtöbb kamerán ez a blokk egyszerűen törölt flash, amely amúgy is `{fill}` értéket ad olvasáskor – így a kitöltés azzal egyezik, ami valóban ott van, és a lemezkép teljes.',
  'gap.redundant':
    'Ha pedig a blokk *használatban van*, akkor redundáns másolatot tartalmaz. Ezek a kamerák ugyanazt a firmware-lemezképet több 64 KB-os slotban tárolják: az oldal készítése közben ellenőrzött összes többslotos memóriaképben minden slot bájtra azonos firmware-re fejtődött vissza – egy esetben négy slot is, amelyeket két különböző kulccsal írtak. Azon az egyetlen egységen, amelyen valódi lemezkép volt itt: `{address}`, az bájtról bájtra megegyezett a `{before}` és a `{after}` címen lévő másolattal, így az archívum ezt a firmware-t is tartalmazza, csak más címről kiolvasva.',
  'gap.fine':
    'Ugyanez a redundancia az oka annak, hogy rendben van az a kamera, amelynél a `{address}` olvasáskor `{fill}` értéket ad: az indítható firmware a többi slotban továbbra is megvan. Ezen a fülön semmi sem ír az eszközre – a hézag csak a letöltött fájlt érinti.',
  'gap.complete':
    'Ha szigorúan teljes, bájtra pontos lemezképet szeretne – például hogy a flash memóriát egy referenciával vesse össze –, olvassa ki SWD/J-Linken keresztül vagy SPI-programozóval.',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': 'Nincs kiolvasva: a kamera nem mondta meg, milyen firmware-t futtat.',
  'identity.unsupported': 'Nincs kiolvasva: ez a kamera így nem olvasható ki.',
  'identity.title': 'Felismert kamera',
  'identity.firmware': 'Firmware',
  'identity.scoreBasis': 'a kamera válaszai alapján, még mielőtt bármely slot ki lenne olvasva',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Beállítások',
  'options.subtitle': '– az alapértékek helyesek; itt semmit sem kell módosítania.',
  'options.chunk': 'chunk (control-IN bájt)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'gap-fill bájt',
  'options.retries': 'újrapróbálkozás ablakonként',
  'options.retryDelay': 'újrapróbálkozási késleltetés (ms)',
  'options.recipient': 'vezérlőátvitel címzettje (recipient)',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'automatikus',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'firmware visszafejtése',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'igen',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'nem',
  'options.help':
    'A **chunk** az egyes control-IN olvasások mérete, legfeljebb 64: egy EP0 csomag. Egy hosszabb olvasás elveszíthet egy csomagot a kamera boot ROM-ja miatt, amikor a kamera alacsony órajelen üresjáratban van, ezért a nagyobb értéket 64 bájtonként olvassa; a kisebbet úgy használja, ahogy megadták, és ha egy kamera elakad, az oldal magától lejjebb megy, és folytatja. A **gap-fill** az a bájt, amelyet abba az egy 64 KB-os blokkba ír, amelyet az USB nem ér el. A **recipient** alapértéke az interface, és device-ra vált, ha a böngésző nem tudja lefoglalni a 0. interfészt – a firmware mindkettőt elfogadja.',
  'options.chunkRange': 'a chunk értéke 1 és {max} között legyen, a kapott érték: {value}',
  'options.gapFillByte': 'a gap-fill egyetlen bájt legyen, a kapott érték: {value}',
  'options.retriesMin':
    'az újrapróbálkozások száma nulla vagy több legyen, a kapott érték: {value}',
  'options.retryDelayMin':
    'az újrapróbálkozási késleltetés nulla vagy több legyen, a kapott érték: {value}',
} satisfies Translation<'v4', 'hu'>;
