/**
 * Namespace `info`, srpski (sr), translated from the English source.
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
  'status.notRead': 'Još nije pročitano.',
  'status.reading': 'Čitanje ...',
  'status.noVersion': 'Verzija nije prijavljena.',
  'status.tooOld':
    'Pročitano. Firmver {version} je stariji od 0.8.0.0 — ništa drugo nije pročitano.',
  'status.read': 'Pročitano. Firmver {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Čitanje kamere',
  'read.description':
    'Samo čitanje. Pita kameru koji firmver radi, kako se pokreće, koje ključeve ima i šta sadrži svaki slot: isto čitanje kao seek-fw info. Ništa se ne upisuje.',
  'read.actions': 'Radnje za Info',
  'read.button': 'Pročitaj verziju firmvera',
  'read.connectFirst': 'Prvo povežite kameru iznad, pa pritisnite „Pročitaj verziju firmvera“.',
  'read.showDetails': 'Prikaži detalje u dnevniku',
  'read.panel': 'Verzija firmvera',
  'result.title': 'Šta kamera prijavljuje',
  'result.version': 'Verzija firmvera',
  'result.build': 'Izdanje',
  'result.range': 'Opseg verzija',
  'result.tab': 'Kartica za ovu kameru',
  'result.rangeLegacy': '0.x / 1.x: kamere iz 2014. i 2016. godine',
  'result.rangeModern': '2.x i novije: kamere 4.x, Nano i Mosaic',
  'result.rangeUnknown': 'nepoznato',
  'result.noVersion':
    '**Kamera nije prijavila verziju firmvera.** Ništa drugo nije poslato. Isključite je, ponovo je priključite, sačekajte da se potpuno pokrene i ponovo pročitajte.',
  'result.noTab': 'Nijedna kartica ne čita ovo izdanje.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Otvorite karticu <tab>{tab}</tab> za ovu kameru. Ta kartica pre bilo kakvog čitanja ponovo pita kameru koja je porodica i odbija kameru koja ne pripada porodici koju pokriva.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'Čemu služi svaka kartica',
  'tabs.intro':
    'Pet kartica, ovim redom. Svaka je posebna stranica, a zaglavlje pokazuje na kojoj ste.',
  'tabs.caption': 'Kartice, šta rade, koje kamere pokrivaju i da li upisuju',
  'tabs.tab': 'Kartica',
  'tabs.does': 'Šta radi',
  'tabs.cameras': 'Kamere',
  'tabs.writes': 'Upisuje u kameru?',
  'tabs.info.does':
    'Čita šta kamera prijavljuje: firmver, porodicu kojom se predstavlja, način pokretanja, ključeve i svaki slot. Isto čitanje kao seek-fw info. Ništa ne upisuje.',
  'tabs.info.cameras': 'Svaka Seek kamera koju WebUSB može da otvori.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Ne.',
  'tabs.preserve.does':
    'Pravi potpunu kopiju 4 MB fleš memorije kamere, uz datoteku sesije sačuvanu posle svakog koraka. Da bi sve pročitala, privremeno zakrpi firmver, a zatim vraća originalni firmver i proverava ga. Vodi vas kroz korake jedan po jedan.',
  'tabs.preserve.cameras':
    'Kamere sa firmverom 0.x i 1.x: izdanja za Compact iz 2014. godine, izdanja za Compact PRO iz 2016. godine (1.0.3.x) i izdanje 1.3.0.8 FF (16 Hz) za Compact.',
  'tabs.preserve.writes':
    'Da, u dva koraka, i svaki prvo pita. Vraća kameru u stanje u kom je bila.',
  'tabs.v4.does':
    'Čita ceo fleš kamere 4.x ili Nano i dešifruje slotove firmvera koje pronađe. Samo čitanje: šalje šest komandi za čitanje i nijednu za upis.',
  'tabs.v4.cameras':
    'Kamere sa firmverom 4.x (Compact, Compact PRO, Compact XR), Mosaic (10.x i 2.x) i Nano (42.x i 44.x), od 2018. godine.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Ne.',
  'tabs.decrypt.does':
    'Dešifruje datoteku koju već imate: celu kopiju fleša, slot po slot, ili samo jedan slot firmvera od 64 KB. Rezultat može da se preuzme.',
  'tabs.decrypt.cameras':
    'Nijedna. Ne koristi kameru, pa radi i kada ništa nije priključeno, u bilo kom pregledaču.',
  'tabs.decrypt.writes': 'Ne. Upisuje samo preuzetu datoteku.',
  'tabs.slots.does':
    'Čita tri slota firmvera (slot A, slot B i slot za oporavak R), pokazuje šta svaki sadrži i iz kog se kamera pokreće, i može da iščita ili upiše po jedan slot.',
  'tabs.slots.cameras': 'Kamere sa firmverom 0.8.0.0 i novijim.',
  'tabs.slots.writes': 'Da, po jedan slot, i svaki upis prvo pita.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Kamera',
  'report.product': 'Proizvod',
  'report.manufacturer': 'Proizvođač',
  'report.serial': 'Serijski broj',
  'report.platform': 'Platforma',
  'report.usbLink': 'USB veza',
  'report.noProduct': '(nema naziva proizvoda)',
  'report.none': '(nema)',
  'report.unreadable': '(nečitljivo)',
  'report.firmware': 'Firmver',
  'report.running': 'Pokrenut',
  'report.bootloader': 'Butloder',
  'report.family': 'Porodica firmvera',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Pročitano kao',
  'report.detected': 'Prepoznato',
  'report.boot': 'Pokretanje',
  'report.booted': 'Pokrenuto iz',
  'report.lastStart': 'Poslednje pokretanje',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'Pokrenut (1.3.0.8)',
  'report.nextStart': 'Sledeće pokretanje',
  'report.upgradeTarget': 'Cilj nadogradnje',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(nije pitano)',
  'report.targetConfirmed': '{slot} (potvrđeno u USB prenosu)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'nije poznato: {why}. Slika 16 Hz FF zahteva da kamera kaže koje izdanje pokreće (kartica slotova to pita)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': 'izdanje 1.3.0.8 FF od 16 Hz',
  'report.build8Hz': 'izdanje 1.3.0.8 od 8 Hz',
  'report.keys': 'Ključevi',
  'report.slots': 'Slotovi',
  'report.slotsCaption':
    'Svaki slot onako kako ga je čitanje zateklo. Samo čitanje: upisuje kartica slotova.',
  'report.slot': 'Slot',
  'report.address': 'Adresa',
  'report.version': 'Verzija',
  'report.size': 'Veličina',
  'report.key': 'Ključ',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Prihvata',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Podnožje',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Pokreće se',
  'report.bytes': '{count} B',
  'report.plaintext': 'nema (nešifrovano)',
  /** A table value, lower case: "yes". */
  'report.yes': 'da',
  /** A table value, lower case: "no". */
  'report.no': 'ne',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'n/p',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Upis',
  'report.noBankWritten': 'Nijedan slot ove kamere se ne upisuje:',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'Po jedan slot: kartica slotova upisuje ili krpi po jedan slot ove kamere, svaki slot pripremljen nešifrovan (slika kakva jeste, bez ključa), i svaki upis prvo pita.',
  'report.oneBank.slotKeystream':
    'Po jedan slot: kartica slotova upisuje ili krpi po jedan slot ove kamere, svaki slot pripremljen pod blokom ključeva 0 sopstvene slike, i svaki upis prvo pita.',
  'report.oneBank.keyA':
    'Po jedan slot: kartica slotova upisuje ili krpi po jedan slot ove kamere, svaki slot pripremljen pod ključevima izvedenim iz pokrenutog slota i aktivne aplikacije, i svaki upis prvo pita.',
  'report.oneBank.ffVendor':
    'Po jedan slot: kartica slotova upisuje ili krpi po jedan slot ove kamere, svaki slot pripremljen onako kako aplikacija proizvođača priprema sliku 16 Hz FF (slika XOR njen sopstveni blok ključeva 0), koju kamera čuva pod ključem B, i svaki upis prvo pita.',
  'report.refusesEvery': 'Kartica slotova odbija svaki slot ove kamere:',
} satisfies Translation<'info', 'sr'>;
