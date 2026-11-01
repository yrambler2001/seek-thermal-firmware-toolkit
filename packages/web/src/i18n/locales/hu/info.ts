/**
 * Namespace `info`, magyar (hu), translated from the English source.
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
  'status.notRead': 'Még nincs kiolvasva.',
  'status.reading': 'Olvasás…',
  'status.noVersion': 'Nem jelentett verziót.',
  'status.tooOld':
    'Kiolvasva. A firmware ({version}) régebbi a 0.8.0.0-nál – más nem lett kiolvasva.',
  'status.read': 'Kiolvasva. Firmware: {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'A kamera kiolvasása',
  'read.description':
    'Csak olvas. Megkérdezi a kamerától, mit futtat, hogyan indul, milyen kulcsai vannak, és mit tartalmaz az egyes slot: ugyanaz az olvasás, mint a seek-fw info. Semmit sem ír.',
  'read.actions': 'Info műveletek',
  'read.button': 'Firmware-verzió kiolvasása',
  'read.connectFirst':
    'Előbb csatlakoztassa a kamerát fent, majd nyomja meg a „Firmware-verzió kiolvasása” gombot.',
  'read.showDetails': 'Részletek a naplóban',
  'read.panel': 'Firmware-verzió',
  'result.title': 'Amit a kamera jelent',
  'result.version': 'Firmware-verzió',
  'result.build': 'Változat',
  'result.range': 'Verziótartomány',
  'result.tab': 'A kamerához tartozó fül',
  'result.rangeLegacy': '0.x / 1.x: a 2014-es és a 2016-os kamerák',
  'result.rangeModern': '2.x és újabb: a 4.x, Nano és Mosaic kamerák',
  'result.rangeUnknown': 'ismeretlen',
  'result.noVersion':
    '**A kamera nem jelentette a firmware-verzióját.** Más nem lett elküldve. Húzza ki, dugja vissza, várja meg, amíg teljesen elindul, és olvassa ki újra.',
  'result.noTab': 'Ezt a változatot egyik fül sem olvassa.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Nyissa meg ehhez a kamerához ezt a fület: <tab>{tab}</tab>. Az a fül bármilyen olvasás előtt újra megkérdezi a kamerától, melyik családba tartozik, és elutasítja azt a kamerát, amely nem az általa kezelt családba tartozik.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'Mire való az egyes fül',
  'tabs.intro':
    'Öt fül, ebben a sorrendben. Mindegyik önálló oldal, és a fejléc mutatja, melyiken áll.',
  'tabs.caption': 'A fülek, a feladatuk, a kezelt kamerák, és hogy írnak-e',
  'tabs.tab': 'Fül',
  'tabs.does': 'Mit csinál',
  'tabs.cameras': 'Kamerák',
  'tabs.writes': 'Ír a kamerára?',
  'tabs.info.does':
    'Kiolvassa, amit a kamera jelent: a firmware-t, a családot, amelyként válaszol, az indítás módját, a kulcsait és minden slotot. Ugyanaz az olvasás, mint a seek-fw info. Semmit sem ír.',
  'tabs.info.cameras': 'Bármely Seek kamera, amelyet a WebUSB meg tud nyitni.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Nem.',
  'tabs.preserve.does':
    'Teljes másolatot készít a kamera 4 MB-os flash memóriájáról, és minden lépés után futtatási fájlt ment. Hogy az egészet kiolvashassa, egy időre módosítja a firmware-t, majd visszateszi az eredeti firmware-t, és ellenőrzi. Egyenként végigvezet a lépéseken.',
  'tabs.preserve.cameras':
    '0.x és 1.x firmware-es kamerák: a 2014-es Compact változatok, a 2016-os Compact PRO változatok (1.0.3.x) és az 1.3.0.8-as FF (16 Hz-es) Compact változat.',
  'tabs.preserve.writes':
    'Igen, két lépésben, és mindkettő előbb rákérdez. A kamerát az eredeti állapotába hozza vissza.',
  'tabs.v4.does':
    'Kiolvassa egy 4.x vagy Nano kamera teljes flash memóriáját, és visszafejti a talált firmware-slotokat. Csak olvas: hat olvasási parancsot küld, írásit egyet sem.',
  'tabs.v4.cameras':
    '4.x firmware-es kamerák (Compact, Compact PRO, Compact XR), Mosaic (10.x és 2.x) és Nano (42.x és 44.x), 2018-tól.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Nem.',
  'tabs.decrypt.does':
    'Egy már meglévő fájlt fejt vissza: egy teljes memóriaképet slotonként, vagy egyetlen 64 KB-os firmware-slotot önmagában. Az eredmény letölthető.',
  'tabs.decrypt.cameras':
    'Egyik sem. Nem használ kamerát, így semmit sem kell csatlakoztatni, és bármely böngészőben működik.',
  'tabs.decrypt.writes': 'Nem. Csak a letöltést írja.',
  'tabs.slots.does':
    'Kiolvassa a három firmware-slotot (az A-slotot, a B-slotot és a helyreállító R-slotot), megmutatja, mit tartalmaz mindegyik, és melyikről indul a kamera, és egyszerre egy slotot tud kiolvasni vagy írni.',
  'tabs.slots.cameras': '0.8.0.0-s és újabb firmware-es kamerák.',
  'tabs.slots.writes': 'Igen, egyszerre egy slotot, és minden írás előbb rákérdez.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Kamera',
  'report.product': 'Termék',
  'report.manufacturer': 'Gyártó',
  'report.serial': 'Sorozatszám',
  'report.platform': 'Platform',
  'report.usbLink': 'USB-kapcsolat',
  'report.noProduct': '(nincs termékazonosító)',
  'report.none': '(nincs)',
  'report.unreadable': '(olvashatatlan)',
  'report.firmware': 'Firmware',
  'report.running': 'Futó',
  'report.bootloader': 'Bootloader',
  'report.family': 'Firmware-család',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Olvasás ezzel',
  'report.detected': 'Felismert',
  'report.boot': 'Indítás',
  'report.booted': 'Erről indult',
  'report.lastStart': 'Legutóbbi indítás',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'Futó (1.3.0.8)',
  'report.nextStart': 'Következő indítás',
  'report.upgradeTarget': 'Frissítési cél',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(nem kérdezte le)',
  'report.targetConfirmed': '{slot} (a kommunikációban megerősítve)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'nem ismert: {why}. A 16 Hz-es FF lemezképhez a kamerának meg kell mondania, melyik változatot futtatja (a slotok fül ezt megkérdezi)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': 'a 16 Hz-es FF 1.3.0.8 változat',
  'report.build8Hz': 'a 8 Hz-es 1.3.0.8 változat',
  'report.keys': 'Kulcsok',
  'report.slots': 'Slotok',
  'report.slotsCaption': 'Minden slot úgy, ahogy az olvasás találta. Csak olvas: a slotok fül ír.',
  'report.slot': 'Slot',
  'report.address': 'Cím',
  'report.version': 'Verzió',
  'report.size': 'Méret',
  'report.key': 'Kulcs',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Elfogadja',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Lábléc',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Indítható',
  'report.bytes': '{count} B',
  'report.plaintext': 'nincs (titkosítatlan)',
  /** A table value, lower case: "yes". */
  'report.yes': 'igen',
  /** A table value, lower case: "no". */
  'report.no': 'nem',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'n. a.',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Írás',
  'report.noBankWritten': 'A kamera egyetlen slotja sem írható:',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'Egyszerre egy slot: a slotok fül a kamera egy slotját írja vagy módosítja, minden slotot titkosítatlanul előkészítve (a lemezképet úgy, ahogy van, kulcs nélkül), és minden írás előbb rákérdez.',
  'report.oneBank.slotKeystream':
    'Egyszerre egy slot: a slotok fül a kamera egy slotját írja vagy módosítja, minden slotot a saját lemezképének 0. kulcsblokkjával előkészítve, és minden írás előbb rákérdez.',
  'report.oneBank.keyA':
    'Egyszerre egy slot: a slotok fül a kamera egy slotját írja vagy módosítja, minden slotot az indító slotból és a futó alkalmazásból származtatott kulcsokkal előkészítve, és minden írás előbb rákérdez.',
  'report.oneBank.ffVendor':
    'Egyszerre egy slot: a slotok fül a kamera egy slotját írja vagy módosítja, minden slotot úgy előkészítve, ahogy a gyártó alkalmazása a 16 Hz-es FF lemezképet (a lemezkép XOR a saját 0. kulcsblokkja), amelyet a kamera a B-kulccsal tárol, és minden írás előbb rákérdez.',
  'report.refusesEvery': 'A slotok fül a kamera minden slotját elutasítja:',
} satisfies Translation<'info', 'hu'>;
