/**
 * Namespace `info`, čeština (cs), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/InfoView.tsx, hooks/useInfoPanel.ts, components/CameraReport.tsx (its labels only: the
 * copyable report text stays English).
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useInfoPanel: the status line. */
  'status.notRead': 'Zatím nepřečteno.',
  'status.reading': 'Čtení …',
  'status.noVersion': 'Kamera nenahlásila žádnou verzi.',
  'status.tooOld': 'Přečteno. Firmware {version} je starší než 0.8.0.0 — nic dalšího se nečetlo.',
  'status.read': 'Přečteno. Firmware {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Přečtení kamery',
  'read.description':
    'Jen pro čtení. Zeptá se kamery, co v ní běží, jak startuje, jaké klíče má a co obsahuje každý slot: stejné čtení jako seek-fw info. Nic se nezapisuje.',
  'read.actions': 'Akce karty Info',
  'read.button': 'Přečíst verzi firmwaru',
  'read.connectFirst': 'Nejdřív připojte kameru výše a potom stiskněte „Přečíst verzi firmwaru“.',
  'read.showDetails': 'Zobrazit podrobnosti v protokolu',
  'read.panel': 'Verze firmwaru',
  'result.title': 'Co kamera hlásí',
  'result.version': 'Verze firmwaru',
  'result.build': 'Sestavení',
  'result.range': 'Rozsah verzí',
  'result.tab': 'Karta pro tuto kameru',
  'result.rangeLegacy': '0.x / 1.x: kamery z let 2014 a 2016',
  'result.rangeModern': '2.x a novější: kamery 4.x, Nano a Mosaic',
  'result.rangeUnknown': 'neznámý',
  'result.noVersion':
    '**Kamera nenahlásila verzi firmwaru.** Nic dalšího se neodeslalo. Odpojte ji, znovu ji připojte, nechte ji dokončit start a přečtěte ji znovu.',
  'result.noTab': 'Toto sestavení nečte žádná karta.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Pro tuto kameru otevřete kartu <tab>{tab}</tab>. Ta se kamery před čtením znovu zeptá, do které rodiny patří, a odmítne kameru, která nepatří do rodiny, již pokrývá.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'K čemu slouží jednotlivé karty',
  'tabs.intro':
    'Pět karet v tomto pořadí. Každá je samostatná stránka a záhlaví ukazuje, na které právě jste.',
  'tabs.caption': 'Karty, co dělají, které kamery pokrývají a zda zapisují',
  'tabs.tab': 'Karta',
  'tabs.does': 'Co dělá',
  'tabs.cameras': 'Kamery',
  'tabs.writes': 'Zapisuje do kamery?',
  'tabs.info.does':
    'Přečte, co kamera hlásí: její firmware, rodinu, za kterou se hlásí, jak startuje, její klíče a každý slot. Stejné čtení jako seek-fw info. Nic nezapisuje.',
  'tabs.info.cameras': 'Jakákoli kamera Seek, kterou WebUSB dokáže otevřít.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Ne.',
  'tabs.preserve.does':
    'Pořídí úplnou kopii 4 MB paměti flash kamery a po každém kroku uloží soubor běhu. Aby přečetla všechno, na chvíli firmware záplatuje, potom vrátí původní firmware a zkontroluje ho. Provede vás kroky jeden po druhém.',
  'tabs.preserve.cameras':
    'Kamery s firmwarem 0.x a 1.x: sestavení Compact z roku 2014, sestavení Compact PRO z roku 2016 (1.0.3.x) a sestavení Compact 1.3.0.8 FF (16 Hz).',
  'tabs.preserve.writes':
    'Ano, ve dvou krocích, a každý se nejdřív zeptá. Vrátí kameru do původního stavu.',
  'tabs.v4.does':
    'Přečte celou paměť flash kamery 4.x nebo Nano a dešifruje sloty firmwaru, které najde. Jen pro čtení: posílá šest příkazů ke čtení a žádný zápis.',
  'tabs.v4.cameras':
    'Kamery s firmwarem 4.x (Compact, Compact PRO, Compact XR), Mosaic (10.x a 2.x) a Nano (42.x a 44.x), od roku 2018.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Ne.',
  'tabs.decrypt.does':
    'Dešifruje soubor, který už máte: celý výpis, slot po slotu, nebo samostatný slot firmwaru o velikosti 64 KB. Výsledek lze stáhnout.',
  'tabs.decrypt.cameras':
    'Žádné. Nepoužívá kameru, takže funguje, i když nic není připojeno, a v jakémkoli prohlížeči.',
  'tabs.decrypt.writes': 'Ne. Zapisuje jen stažený soubor.',
  'tabs.slots.does':
    'Přečte tři sloty firmwaru (slot A, slot B a slot pro obnovu R), ukáže, co který obsahuje a ze kterého kamera startuje, a dokáže vyčíst nebo zapsat vždy jeden slot.',
  'tabs.slots.cameras': 'Kamery s firmwarem 0.8.0.0 a novějším.',
  'tabs.slots.writes': 'Ano, vždy jeden slot, a každý zápis se nejdřív zeptá.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Kamera',
  'report.product': 'Produkt',
  'report.manufacturer': 'Výrobce',
  'report.serial': 'Sériové číslo',
  'report.platform': 'Platforma',
  'report.usbLink': 'Připojení USB',
  'report.noProduct': '(bez názvu produktu)',
  'report.none': '(žádný)',
  'report.unreadable': '(nečitelné)',
  'report.firmware': 'Firmware',
  'report.running': 'Běží',
  'report.bootloader': 'Bootloader',
  'report.family': 'Rodina firmwaru',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Čteno jako',
  'report.detected': 'Zjištěno',
  'report.boot': 'Start',
  'report.booted': 'Spuštěno',
  'report.lastStart': 'Poslední start',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'Běží (1.3.0.8)',
  'report.nextStart': 'Příští start',
  'report.upgradeTarget': 'Cíl aktualizace',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(nezjišťováno)',
  'report.targetConfirmed': '{slot} (potvrzeno komunikací s kamerou)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'neznámé: {why}. Obraz 16 Hz FF vyžaduje, aby kamera řekla, které sestavení v ní běží (karta slotů se zeptá)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': 'sestavení 16 Hz FF 1.3.0.8',
  'report.build8Hz': 'sestavení 8 Hz 1.3.0.8',
  'report.keys': 'Klíče',
  'report.slots': 'Sloty',
  'report.slotsCaption': 'Každý slot tak, jak ho čtení našlo. Jen pro čtení: zapisuje karta slotů.',
  'report.slot': 'Slot',
  'report.address': 'Adresa',
  'report.version': 'Verze',
  'report.size': 'Velikost',
  'report.key': 'Klíč',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Přijímá',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Patička',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Spustitelný',
  'report.bytes': '{count} B',
  'report.plaintext': 'žádný (otevřený text)',
  /** A table value, lower case: "yes". */
  'report.yes': 'ano',
  /** A table value, lower case: "no". */
  'report.no': 'ne',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': '—',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Zápis',
  'report.noBankWritten': 'Žádný slot této kamery se nezapisuje:',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'Vždy jeden slot: karta slotů zapisuje nebo záplatuje jeden slot této kamery, každý slot se předává v otevřené podobě (obraz tak, jak je, bez klíče) a každý zápis se nejdřív zeptá.',
  'report.oneBank.slotKeystream':
    'Vždy jeden slot: karta slotů zapisuje nebo záplatuje jeden slot této kamery, každý slot se předává pod vlastním blokem klíčů 0 svého obrazu a každý zápis se nejdřív zeptá.',
  'report.oneBank.keyA':
    'Vždy jeden slot: karta slotů zapisuje nebo záplatuje jeden slot této kamery, každý slot se předává pod klíči odvozenými ze spuštěného slotu a běžící aplikace a každý zápis se nejdřív zeptá.',
  'report.oneBank.ffVendor':
    'Vždy jeden slot: karta slotů zapisuje nebo záplatuje jeden slot této kamery, každý slot se předává tak, jak obraz 16 Hz FF předává aplikace výrobce (obraz XOR jeho vlastní blok klíčů 0), a kamera ho uloží pod klíčem B; každý zápis se nejdřív zeptá.',
  'report.refusesEvery': 'Karta slotů odmítá každý slot této kamery:',
} satisfies Translation<'info', 'cs'>;
