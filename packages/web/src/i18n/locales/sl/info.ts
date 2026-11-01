/**
 * Namespace `info`, slovenščina (sl), translated from the English source.
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
  'status.notRead': 'Še ni prebrano.',
  'status.reading': 'Branje …',
  'status.noVersion': 'Različica ni bila sporočena.',
  'status.tooOld':
    'Prebrano. Vdelana programska oprema {version} je starejša od 0.8.0.0 — nič drugega ni bilo prebrano.',
  'status.read': 'Prebrano. Vdelana programska oprema {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Branje kamere',
  'read.description':
    'Samo branje. Kamero vpraša, kaj poganja, kako se zažene, katere ključe ima in kaj je v vsaki reži: enako branje kot seek-fw info. Nič se ne zapiše.',
  'read.actions': 'Dejanja za informacije',
  'read.button': 'Preberi različico vdelane programske opreme',
  'read.connectFirst':
    'Najprej zgoraj povežite kamero, nato pritisnite „Preberi različico vdelane programske opreme“.',
  'read.showDetails': 'Pokaži podrobnosti v dnevniku',
  'read.panel': 'Različica vdelane programske opreme',
  'result.title': 'Kaj sporoča kamera',
  'result.version': 'Različica vdelane programske opreme',
  'result.build': 'Izdaja',
  'result.range': 'Obseg različic',
  'result.tab': 'Zavihek za to kamero',
  'result.rangeLegacy': '0.x / 1.x: kamere iz let 2014 in 2016',
  'result.rangeModern': '2.x in novejše: kamere 4.x, Nano in Mosaic',
  'result.rangeUnknown': 'neznano',
  'result.noVersion':
    '**Kamera ni sporočila različice vdelane programske opreme.** Nič drugega ni bilo poslano. Odklopite jo, znova priklopite, počakajte, da se zažene do konca, in jo preberite znova.',
  'result.noTab': 'Te izdaje ne bere noben zavihek.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Za to kamero odprite <tab>{tab}</tab>. Ta zavihek kamero pred branjem znova vpraša, katere družine je, in zavrne kamero, ki ni iz družine, ki jo pokriva.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'Čemu je namenjen vsak zavihek',
  'tabs.intro':
    'Pet zavihkov v tem vrstnem redu. Vsak je svoja stran, glava pa pokaže, na katerem ste.',
  'tabs.caption': 'Zavihki, kaj počnejo, katere kamere pokrivajo in ali pišejo v kamero',
  'tabs.tab': 'Zavihek',
  'tabs.does': 'Kaj naredi',
  'tabs.cameras': 'Kamere',
  'tabs.writes': 'Piše v kamero?',
  'tabs.info.does':
    'Prebere, kar sporoča kamera: njeno vdelano programsko opremo, družino, kot katera se odziva, način zagona, ključe in vse reže. Enako branje kot seek-fw info. Ne zapiše ničesar.',
  'tabs.info.cameras': 'Vsaka kamera Seek, ki jo WebUSB lahko odpre.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Ne.',
  'tabs.preserve.does':
    'Naredi popolno kopijo 4 MB bliskovnega pomnilnika kamere in po vsakem koraku shrani datoteko izvedbe. Da lahko prebere vse, za nekaj časa popravi vdelano programsko opremo, nato povrne izvirno vdelano programsko opremo in jo preveri. Korake izvaja enega za drugim.',
  'tabs.preserve.cameras':
    'Kamere z vdelano programsko opremo 0.x in 1.x: izdaje za Compact iz leta 2014, izdaje za Compact PRO iz leta 2016 (1.0.3.x) in izdaja 1.3.0.8 FF (16 Hz) za Compact.',
  'tabs.preserve.writes': 'Da, v dveh korakih, in vsak prej vpraša. Kamero vrne v prvotno stanje.',
  'tabs.v4.does':
    'Prebere celoten bliskovni pomnilnik kamere 4.x ali Nano in dešifrira reže vdelane programske opreme, ki jih najde. Samo branje: pošlje šest ukazov za branje in nobenega za zapis.',
  'tabs.v4.cameras':
    'Kamere z vdelano programsko opremo 4.x (Compact, Compact PRO, Compact XR), Mosaic (10.x in 2.x) in Nano (42.x in 44.x), od leta 2018 naprej.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Ne.',
  'tabs.decrypt.does':
    'Dešifrira datoteko, ki jo že imate: celoten izpis, režo za režo, ali posamezno režo vdelane programske opreme velikosti 64 KB. Rezultat lahko prenesete.',
  'tabs.decrypt.cameras':
    'Nobene. Kamere ne uporablja, zato deluje brez priključene naprave in v vsakem brskalniku.',
  'tabs.decrypt.writes': 'Ne. Zapiše le preneseno datoteko.',
  'tabs.slots.does':
    'Prebere tri reže vdelane programske opreme (režo A, režo B in obnovitveno režo R), pokaže, kaj je v vsaki in iz katere se kamera zažene, ter lahko izpiše ali zapiše po eno režo naenkrat.',
  'tabs.slots.cameras': 'Kamere z vdelano programsko opremo 0.8.0.0 in novejšo.',
  'tabs.slots.writes': 'Da, po eno režo naenkrat, in vsak zapis prej vpraša.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Kamera',
  'report.product': 'Izdelek',
  'report.manufacturer': 'Proizvajalec',
  'report.serial': 'Serijska številka',
  'report.platform': 'Platforma',
  'report.usbLink': 'Povezava USB',
  'report.noProduct': '(ni niza izdelka)',
  'report.none': '(brez)',
  'report.unreadable': '(neberljivo)',
  'report.firmware': 'Vdelana programska oprema',
  'report.running': 'Teče',
  'report.bootloader': 'Zagonski nalagalnik',
  'report.family': 'Družina vdelane programske opreme',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Prebrano kot',
  'report.detected': 'Zaznano',
  'report.boot': 'Zagon',
  'report.booted': 'Zagnano',
  'report.lastStart': 'Zadnji zagon',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'Teče (1.3.0.8)',
  'report.nextStart': 'Naslednji zagon',
  'report.upgradeTarget': 'Cilj nadgradnje',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(ni bilo vprašano)',
  'report.targetConfirmed': '{slot} (potrjeno na povezavi)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'ni znano: {why}. Slika 16 Hz FF zahteva, da kamera pove, katero izdajo poganja (zavihek z režami jo vpraša)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': 'izdaja 1.3.0.8 FF (16 Hz)',
  'report.build8Hz': 'izdaja 1.3.0.8 (8 Hz)',
  'report.keys': 'Ključi',
  'report.slots': 'Reže',
  'report.slotsCaption': 'Vsaka reža, kot jo je našlo branje. Samo branje: piše zavihek z režami.',
  'report.slot': 'Reža',
  'report.address': 'Naslov',
  'report.version': 'Različica',
  'report.size': 'Velikost',
  'report.key': 'Ključ',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Sprejema',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Noga',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Zagonska',
  'report.bytes': '{count} B',
  'report.plaintext': 'brez (nešifrirano)',
  /** A table value, lower case: "yes". */
  'report.yes': 'da',
  /** A table value, lower case: "no". */
  'report.no': 'ne',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'n/p',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Zapisovanje',
  'report.noBankWritten': 'V nobeno režo te kamere se ne piše:',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'Po eno režo naenkrat: zavihek z režami zapiše ali popravi eno režo te kamere, vsaka reža je pripravljena nešifrirana (slika, kakršna je, brez ključa), in vsak zapis prej vpraša.',
  'report.oneBank.slotKeystream':
    'Po eno režo naenkrat: zavihek z režami zapiše ali popravi eno režo te kamere, vsaka reža je šifrirana z blokom ključev 0 lastne slike, in vsak zapis prej vpraša.',
  'report.oneBank.keyA':
    'Po eno režo naenkrat: zavihek z režami zapiše ali popravi eno režo te kamere, vsaka reža je šifrirana s ključi, izpeljanimi iz zagnane reže in delujoče aplikacije, in vsak zapis prej vpraša.',
  'report.oneBank.ffVendor':
    'Po eno režo naenkrat: zavihek z režami zapiše ali popravi eno režo te kamere, vsaka reža je pripravljena tako, kot proizvajalčeva aplikacija pripravi sliko 16 Hz FF (slika XOR njen lastni blok ključev 0), kamera pa jo shrani pod ključem B, in vsak zapis prej vpraša.',
  'report.refusesEvery': 'Zavihek z režami zavrne vsako režo te kamere:',
} satisfies Translation<'info', 'sl'>;
