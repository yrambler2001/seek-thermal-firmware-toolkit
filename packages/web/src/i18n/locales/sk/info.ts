/**
 * Namespace `info`, slovenčina (sk), translated from the English source.
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
  'status.notRead': 'Zatiaľ neprečítané.',
  'status.reading': 'Číta sa…',
  'status.noVersion': 'Kamera nenahlásila žiadnu verziu.',
  'status.tooOld': 'Prečítané. Firmvér {version} je starší ako 0.8.0.0 — nič ďalšie sa nečítalo.',
  'status.read': 'Prečítané. Firmvér {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Prečítanie kamery',
  'read.description':
    'Len na čítanie. Opýta sa kamery, čo v nej beží, ako štartuje, aké kľúče má a čo obsahuje každý slot: rovnaké čítanie ako seek-fw info. Nič sa nezapisuje.',
  'read.actions': 'Akcie karty Info',
  'read.button': 'Prečítať verziu firmvéru',
  'read.connectFirst': 'Najprv pripojte kameru vyššie a potom stlačte „Prečítať verziu firmvéru“.',
  'read.showDetails': 'Zobraziť podrobnosti v protokole',
  'read.panel': 'Verzia firmvéru',
  'result.title': 'Čo kamera hlási',
  'result.version': 'Verzia firmvéru',
  'result.build': 'Zostava',
  'result.range': 'Rozsah verzií',
  'result.tab': 'Karta pre túto kameru',
  'result.rangeLegacy': '0.x / 1.x: kamery z rokov 2014 a 2016',
  'result.rangeModern': '2.x a novšie: kamery 4.x, Nano a Mosaic',
  'result.rangeUnknown': 'neznámy',
  'result.noVersion':
    '**Kamera nenahlásila verziu firmvéru.** Nič ďalšie sa neodoslalo. Odpojte ju, znova ju pripojte, nechajte ju dokončiť štart a prečítajte ju znova.',
  'result.noTab': 'Túto zostavu nečíta žiadna karta.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Pre túto kameru otvorte kartu <tab>{tab}</tab>. Tá sa kamery pred čítaním znova opýta, do ktorej rodiny patrí, a odmietne kameru, ktorá nepatrí do rodiny, ktorú pokrýva.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'Na čo slúžia jednotlivé karty',
  'tabs.intro':
    'Päť kariet v tomto poradí. Každá je samostatná stránka a hlavička ukazuje, na ktorej práve ste.',
  'tabs.caption': 'Karty, čo robia, ktoré kamery pokrývajú a či zapisujú',
  'tabs.tab': 'Karta',
  'tabs.does': 'Čo robí',
  'tabs.cameras': 'Kamery',
  'tabs.writes': 'Zapisuje do kamery?',
  'tabs.info.does':
    'Prečíta, čo kamera hlási: jej firmvér, rodinu, ku ktorej sa hlási, ako štartuje, jej kľúče a každý slot. Rovnaké čítanie ako seek-fw info. Nič nezapisuje.',
  'tabs.info.cameras': 'Akákoľvek kamera Seek, ktorú WebUSB dokáže otvoriť.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Nie.',
  'tabs.preserve.does':
    'Vytvorí úplnú kópiu 4 MB pamäte flash kamery a po každom kroku uloží súbor behu. Aby prečítala všetko, na chvíľu firmvér záplatuje, potom vráti pôvodný firmvér a skontroluje ho. Prevedie vás krokmi jeden po druhom.',
  'tabs.preserve.cameras':
    'Kamery s firmvérom 0.x a 1.x: zostavy Compact z roku 2014, zostavy Compact PRO z roku 2016 (1.0.3.x) a zostava Compact 1.3.0.8 FF (16 Hz).',
  'tabs.preserve.writes':
    'Áno, v dvoch krokoch, a každý sa najprv opýta. Vráti kameru do pôvodného stavu.',
  'tabs.v4.does':
    'Prečíta celú pamäť flash kamery 4.x alebo Nano a dešifruje sloty firmvéru, ktoré nájde. Len na čítanie: posiela šesť príkazov na čítanie a žiadny zápis.',
  'tabs.v4.cameras':
    'Kamery s firmvérom 4.x (Compact, Compact PRO, Compact XR), Mosaic (10.x a 2.x) a Nano (42.x a 44.x), od roku 2018.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Nie.',
  'tabs.decrypt.does':
    'Dešifruje súbor, ktorý už máte: celý výpis, slot po slote, alebo samostatný slot firmvéru s veľkosťou 64 KB. Výsledok sa dá stiahnuť.',
  'tabs.decrypt.cameras':
    'Žiadne. Nepoužíva kameru, takže funguje, aj keď nič nie je pripojené, a v akomkoľvek prehliadači.',
  'tabs.decrypt.writes': 'Nie. Zapisuje len stiahnutý súbor.',
  'tabs.slots.does':
    'Prečíta tri sloty firmvéru (slot A, slot B a slot na obnovu R), ukáže, čo ktorý obsahuje a z ktorého kamera štartuje, a dokáže vypísať alebo zapísať vždy jeden slot.',
  'tabs.slots.cameras': 'Kamery s firmvérom 0.8.0.0 a novším.',
  'tabs.slots.writes': 'Áno, vždy jeden slot, a každý zápis sa najprv opýta.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Kamera',
  'report.product': 'Produkt',
  'report.manufacturer': 'Výrobca',
  'report.serial': 'Sériové číslo',
  'report.platform': 'Platforma',
  'report.usbLink': 'Pripojenie USB',
  'report.noProduct': '(bez názvu produktu)',
  'report.none': '(žiadny)',
  'report.unreadable': '(nečitateľné)',
  'report.firmware': 'Firmvér',
  'report.running': 'Beží',
  'report.bootloader': 'Bootloader',
  'report.family': 'Rodina firmvéru',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Čítané ako',
  'report.detected': 'Zistené',
  'report.boot': 'Štart',
  'report.booted': 'Spustené',
  'report.lastStart': 'Posledný štart',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'Beží (1.3.0.8)',
  'report.nextStart': 'Ďalší štart',
  'report.upgradeTarget': 'Cieľ aktualizácie',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(nezisťované)',
  'report.targetConfirmed': '{slot} (potvrdené komunikáciou s kamerou)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'neznáme: {why}. Obraz 16 Hz FF vyžaduje, aby kamera povedala, ktorá zostava v nej beží (karta slotov sa opýta)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': 'zostava 16 Hz FF 1.3.0.8',
  'report.build8Hz': 'zostava 8 Hz 1.3.0.8',
  'report.keys': 'Kľúče',
  'report.slots': 'Sloty',
  'report.slotsCaption':
    'Každý slot tak, ako ho čítanie našlo. Len na čítanie: zapisuje karta slotov.',
  'report.slot': 'Slot',
  'report.address': 'Adresa',
  'report.version': 'Verzia',
  'report.size': 'Veľkosť',
  'report.key': 'Kľúč',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Prijíma',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Pätička',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Spustiteľný',
  'report.bytes': '{count} B',
  'report.plaintext': 'žiadny (otvorený text)',
  /** A table value, lower case: "yes". */
  'report.yes': 'áno',
  /** A table value, lower case: "no". */
  'report.no': 'nie',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': '—',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Zápis',
  'report.noBankWritten': 'Žiadny slot tejto kamery sa nezapisuje:',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'Vždy jeden slot: karta slotov zapisuje alebo záplatuje jeden slot tejto kamery, každý slot sa odovzdáva v otvorenej podobe (obraz tak, ako je, bez kľúča) a každý zápis sa najprv opýta.',
  'report.oneBank.slotKeystream':
    'Vždy jeden slot: karta slotov zapisuje alebo záplatuje jeden slot tejto kamery, každý slot sa odovzdáva pod vlastným blokom kľúčov 0 svojho obrazu a každý zápis sa najprv opýta.',
  'report.oneBank.keyA':
    'Vždy jeden slot: karta slotov zapisuje alebo záplatuje jeden slot tejto kamery, každý slot sa odovzdáva pod kľúčmi odvodenými zo spusteného slotu a bežiacej aplikácie a každý zápis sa najprv opýta.',
  'report.oneBank.ffVendor':
    'Vždy jeden slot: karta slotov zapisuje alebo záplatuje jeden slot tejto kamery, každý slot sa odovzdáva tak, ako obraz 16 Hz FF odovzdáva aplikácia výrobcu (obraz XOR jeho vlastný blok kľúčov 0), a kamera ho uloží pod kľúčom B; každý zápis sa najprv opýta.',
  'report.refusesEvery': 'Karta slotov odmieta každý slot tejto kamery:',
} satisfies Translation<'info', 'sk'>;
