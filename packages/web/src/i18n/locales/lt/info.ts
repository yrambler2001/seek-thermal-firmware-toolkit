/**
 * Namespace `info`, lietuvių (lt), translated from the English source.
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
  'status.notRead': 'Dar nenuskaityta.',
  'status.reading': 'Skaitoma…',
  'status.noVersion': 'Versija nenurodyta.',
  'status.tooOld':
    'Nuskaityta. Mikroprograma {version} senesnė nei 0.8.0.0 — daugiau nieko nenuskaityta.',
  'status.read': 'Nuskaityta. Mikroprograma {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Kameros nuskaitymas',
  'read.description':
    'Tik skaitymas. Paklausia kameros, ką ji vykdo, kaip pasileidžia, kokius raktus turi ir kas yra kiekviename lizde: tas pats nuskaitymas kaip seek-fw info. Niekas neįrašoma.',
  'read.actions': 'Informacijos veiksmai',
  'read.button': 'Nuskaityti mikroprogramos versiją',
  'read.connectFirst':
    'Pirmiausia prijunkite kamerą aukščiau, tada spustelėkite „Nuskaityti mikroprogramos versiją“.',
  'read.showDetails': 'Rodyti išsamią informaciją žurnale',
  'read.panel': 'Mikroprogramos versija',
  'result.title': 'Ką nurodo kamera',
  'result.version': 'Mikroprogramos versija',
  'result.build': 'Leidimas',
  'result.range': 'Versijų intervalas',
  'result.tab': 'Šios kameros skirtukas',
  'result.rangeLegacy': '0.x / 1.x: 2014 ir 2016 m. kameros',
  'result.rangeModern': '2.x ir naujesnės: 4.x, Nano ir Mosaic kameros',
  'result.rangeUnknown': 'nežinomas',
  'result.noVersion':
    '**Kamera nenurodė savo mikroprogramos versijos.** Daugiau nieko nebuvo išsiųsta. Atjunkite ją, vėl prijunkite, leiskite jai iki galo pasileisti ir nuskaitykite dar kartą.',
  'result.noTab': 'Šio leidimo neskaito nė vienas skirtukas.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Šiai kamerai atverkite skirtuką <tab>{tab}</tab>. Tas skirtukas prieš ką nors skaitydamas dar kartą paklausia kameros, kuriai šeimai ji priklauso, ir atmeta kamerą, kuri nėra jo šeimos.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'Kam skirtas kiekvienas skirtukas',
  'tabs.intro':
    'Penki skirtukai, šia tvarka. Kiekvienas yra atskiras puslapis, o antraštėje matyti, kuriame esate.',
  'tabs.caption': 'Skirtukai, ką jie daro, kokioms kameroms skirti ir ar jie rašo',
  'tabs.tab': 'Skirtukas',
  'tabs.does': 'Ką daro',
  'tabs.cameras': 'Kameros',
  'tabs.writes': 'Rašo į kamerą?',
  'tabs.info.does':
    'Nuskaito, ką nurodo kamera: jos mikroprogramą, šeimą, kuria ji prisistato, kaip pasileidžia, jos raktus ir kiekvieną lizdą. Tas pats nuskaitymas kaip seek-fw info. Nieko nerašo.',
  'tabs.info.cameras': 'Bet kuri Seek kamera, kurią gali atidaryti WebUSB.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Ne.',
  'tabs.preserve.does':
    'Sukuria visą kameros 4 MB flash atminties kopiją ir po kiekvieno žingsnio išsaugo seanso failą. Kad perskaitytų viską, laikinai pataiso mikroprogramą, tada grąžina originalią mikroprogramą ir ją patikrina. Žingsnius atlieka po vieną.',
  'tabs.preserve.cameras':
    'Kameros su 0.x ir 1.x mikroprograma: 2014 m. Compact leidimai, 2016 m. Compact PRO leidimai (1.0.3.x) ir Compact leidimas 1.3.0.8 FF (16 Hz).',
  'tabs.preserve.writes':
    'Taip, dviem žingsniais, ir prieš kiekvieną paklausia. Grąžina kamerą į buvusią būseną.',
  'tabs.v4.does':
    'Nuskaito visą 4.x arba Nano kameros flash atmintį ir iššifruoja rastus mikroprogramos lizdus. Tik skaitymas: siunčia šešias skaitymo komandas ir nė vienos rašymo komandos.',
  'tabs.v4.cameras':
    'Kameros su 4.x mikroprograma (Compact, Compact PRO, Compact XR), Mosaic (10.x ir 2.x) ir Nano (42.x ir 44.x), nuo 2018 m.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Ne.',
  'tabs.decrypt.does':
    'Iššifruoja jau turimą failą: visą išklotinę, lizdą po lizdo, arba vieną atskirą 64 KB mikroprogramos lizdą. Rezultatą galima atsisiųsti.',
  'tabs.decrypt.cameras':
    'Jokių. Kamera nenaudojama, todėl veikia nieko neprijungus ir bet kurioje naršyklėje.',
  'tabs.decrypt.writes': 'Ne. Įrašo tik atsisiunčiamą failą.',
  'tabs.slots.does':
    'Nuskaito tris mikroprogramos lizdus (lizdą A, lizdą B ir atkūrimo lizdą R), parodo, kas kiekviename yra ir iš kurio kamera pasileidžia, ir gali nuskaityti arba įrašyti po vieną lizdą.',
  'tabs.slots.cameras': 'Kameros su 0.8.0.0 ir naujesne mikroprograma.',
  'tabs.slots.writes': 'Taip, po vieną lizdą, ir prieš kiekvieną įrašymą paklausia.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Kamera',
  'report.product': 'Gaminys',
  'report.manufacturer': 'Gamintojas',
  'report.serial': 'Serijos numeris',
  'report.platform': 'Platforma',
  'report.usbLink': 'USB ryšys',
  'report.noProduct': '(gaminio pavadinimo nėra)',
  'report.none': '(nėra)',
  'report.unreadable': '(neperskaitoma)',
  'report.firmware': 'Mikroprograma',
  'report.running': 'Veikia',
  'report.bootloader': 'Paleidyklė',
  'report.family': 'Mikroprogramos šeima',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Skaityta kaip',
  'report.detected': 'Aptikta',
  'report.boot': 'Paleidimas',
  'report.booted': 'Paleista',
  'report.lastStart': 'Paskutinis paleidimas',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'Veikia (1.3.0.8)',
  'report.nextStart': 'Kitas paleidimas',
  'report.upgradeTarget': 'Atnaujinimo tikslas',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(neklausta)',
  'report.targetConfirmed': '{slot} (patvirtinta per USB)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'nežinoma: {why}. 16 Hz FF atvaizdui reikia, kad kamera nurodytų, kurį leidimą ji vykdo (to klausia lizdų skirtukas)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': '16 Hz FF 1.3.0.8 leidimas',
  'report.build8Hz': '8 Hz 1.3.0.8 leidimas',
  'report.keys': 'Raktai',
  'report.slots': 'Lizdai',
  'report.slotsCaption':
    'Kiekvienas lizdas toks, kokį rado nuskaitymas. Tik skaitymas: rašo lizdų skirtukas.',
  'report.slot': 'Lizdas',
  'report.address': 'Adresas',
  'report.version': 'Versija',
  'report.size': 'Dydis',
  'report.key': 'Raktas',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Priima',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Poraštė',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Paleidžiamas',
  'report.bytes': '{count} B',
  'report.plaintext': 'nėra (atviras tekstas)',
  /** A table value, lower case: "yes". */
  'report.yes': 'taip',
  /** A table value, lower case: "no". */
  'report.no': 'ne',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'netaikoma',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Įrašymas',
  'report.noBankWritten': 'Joks šios kameros lizdas nerašomas:',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'Po vieną lizdą: lizdų skirtukas įrašo arba pataiso po vieną šios kameros lizdą, kiekvienas lizdas paruošiamas neužšifruotas (atvaizdas toks, koks yra, be rakto), ir prieš kiekvieną įrašymą paklausiama.',
  'report.oneBank.slotKeystream':
    'Po vieną lizdą: lizdų skirtukas įrašo arba pataiso po vieną šios kameros lizdą, kiekvienas lizdas paruošiamas su paties atvaizdo rakto bloku 0, ir prieš kiekvieną įrašymą paklausiama.',
  'report.oneBank.keyA':
    'Po vieną lizdą: lizdų skirtukas įrašo arba pataiso po vieną šios kameros lizdą, kiekvienas lizdas paruošiamas su raktais, gautais iš paleisto lizdo ir veikiančios programos, ir prieš kiekvieną įrašymą paklausiama.',
  'report.oneBank.ffVendor':
    'Po vieną lizdą: lizdų skirtukas įrašo arba pataiso po vieną šios kameros lizdą, kiekvienas lizdas paruošiamas taip, kaip gamintojo programa paruošia 16 Hz FF atvaizdą (atvaizdas XOR jo paties rakto blokas 0), o kamera jį saugo su raktu B, ir prieš kiekvieną įrašymą paklausiama.',
  'report.refusesEvery': 'Lizdų skirtukas atmeta kiekvieną šios kameros lizdą:',
} satisfies Translation<'info', 'lt'>;
