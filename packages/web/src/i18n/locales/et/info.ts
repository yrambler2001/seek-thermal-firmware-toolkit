/**
 * Namespace `info`, eesti (et), translated from the English source.
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
  'status.notRead': 'Pole veel loetud.',
  'status.reading': 'Lugemine ...',
  'status.noVersion': 'Versiooni ei teatatud.',
  'status.tooOld': 'Loetud. Püsivara {version} on vanem kui 0.8.0.0 — muud ei loetud.',
  'status.read': 'Loetud. Püsivara {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Kaamera lugemine',
  'read.description':
    'Ainult lugemine. Küsib kaameralt, mida see käitab, kuidas see käivitub, milliseid võtmeid hoiab ja mida iga pesa sisaldab: sama lugemine nagu seek-fw info. Midagi ei kirjutata.',
  'read.actions': 'Teabe toimingud',
  'read.button': 'Loe püsivara versioon',
  'read.connectFirst': 'Ühendage esmalt ülal kaamera, seejärel vajutage „Loe püsivara versioon“.',
  'read.showDetails': 'Näita üksikasju logis',
  'read.panel': 'Püsivara versioon',
  'result.title': 'Mida kaamera teatab',
  'result.version': 'Püsivara versioon',
  'result.build': 'Järk',
  'result.range': 'Versioonivahemik',
  'result.tab': 'Selle kaamera vahekaart',
  'result.rangeLegacy': '0.x / 1.x: 2014. ja 2016. aasta kaamerad',
  'result.rangeModern': '2.x ja uuemad: 4.x, Nano ja Mosaic kaamerad',
  'result.rangeUnknown': 'teadmata',
  'result.noVersion':
    '**Kaamera ei teatanud oma püsivara versiooni.** Muud ei saadetud. Eemaldage kaamera, ühendage uuesti, laske tal käivitumine lõpetada ja lugege uuesti.',
  'result.noTab': 'Ükski vahekaart seda järku ei loe.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Avage selle kaamera jaoks vahekaart <tab>{tab}</tab>. See vahekaart küsib kaameralt enne lugemist uuesti, mis perekonda see kuulub, ja keeldub kaamerast, mis pole tema perekonnast.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'Milleks iga vahekaart on',
  'tabs.intro':
    'Viis vahekaarti, selles järjekorras. Igaüks on eraldi leht ja päis näitab, millisel te olete.',
  'tabs.caption':
    'Vahekaardid, mida need teevad, milliseid kaameraid katavad ja kas need kirjutavad',
  'tabs.tab': 'Vahekaart',
  'tabs.does': 'Mida teeb',
  'tabs.cameras': 'Kaamerad',
  'tabs.writes': 'Kirjutab kaamerasse?',
  'tabs.info.does':
    'Loeb, mida kaamera teatab: selle püsivara, perekonna, millena kaamera end tutvustab, käivitusviisi, võtmed ja iga pesa. Sama lugemine nagu seek-fw info. Midagi ei kirjutata.',
  'tabs.info.cameras': 'Iga Seeki kaamera, mida WebUSB saab avada.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Ei.',
  'tabs.preserve.does':
    'Teeb kaamera 4 MB välkmälust täieliku koopia ja salvestab pärast iga sammu seansifaili. Kõige lugemiseks paikab see püsivara ajutiselt, seejärel paneb algse püsivara tagasi ja kontrollib seda. Sammud läbitakse ükshaaval.',
  'tabs.preserve.cameras':
    'Kaamerad püsivaraga 0.x ja 1.x: 2014. aasta Compacti järgud, 2016. aasta Compact PRO järgud (1.0.3.x) ja Compacti järk 1.3.0.8 FF (16 Hz).',
  'tabs.preserve.writes':
    'Jah, kahes sammus, ja kumbki küsib enne luba. Lõpuks on kaamera samas olekus nagu enne.',
  'tabs.v4.does':
    'Loeb 4.x või Nano kaamera kogu välkmälu ja dekrüptib leitud püsivarapesad. Ainult lugemine: saadab kuus lugemiskäsku ja mitte ühtegi kirjutamiskäsku.',
  'tabs.v4.cameras':
    'Kaamerad püsivaraga 4.x (Compact, Compact PRO, Compact XR), Mosaic (10.x ja 2.x) ja Nano (42.x ja 44.x), alates 2018. aastast.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Ei.',
  'tabs.decrypt.does':
    'Dekrüptib faili, mis teil juba on: kogu tõmmise pesa haaval või üksiku 64 KB püsivarapesa. Tulemuse saab alla laadida.',
  'tabs.decrypt.cameras':
    'Puuduvad. Kaamerat ei kasutata, nii et see töötab ka siis, kui midagi pole ühendatud, ja igas brauseris.',
  'tabs.decrypt.writes': 'Ei. Kirjutab ainult allalaaditava faili.',
  'tabs.slots.does':
    'Loeb kolme püsivarapesa (pesa A, pesa B ja taastepesa R), näitab, mida igaüks sisaldab ja millisest kaamera käivitub, ning saab korraga teha tõmmise ühest pesast või kirjutada ühte pesasse.',
  'tabs.slots.cameras': 'Kaamerad püsivaraga 0.8.0.0 ja uuem.',
  'tabs.slots.writes': 'Jah, üks pesa korraga, ja iga kirjutamine küsib enne luba.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Kaamera',
  'report.product': 'Toode',
  'report.manufacturer': 'Tootja',
  'report.serial': 'Seerianumber',
  'report.platform': 'Platvorm',
  'report.usbLink': 'USB-ühendus',
  'report.noProduct': '(tootenimi puudub)',
  'report.none': '(puudub)',
  'report.unreadable': '(loetamatu)',
  'report.firmware': 'Püsivara',
  'report.running': 'Töötab',
  'report.bootloader': 'Alglaadur',
  'report.family': 'Püsivaraperekond',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Loetud perekonnana',
  'report.detected': 'Tuvastatud',
  'report.boot': 'Käivitus',
  'report.booted': 'Käivitatud pesa',
  'report.lastStart': 'Viimane käivitus',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'Töötab (1.3.0.8)',
  'report.nextStart': 'Järgmine käivitus',
  'report.upgradeTarget': 'Uuenduse siht',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(ei küsitud)',
  'report.targetConfirmed': '{slot} (ühenduses kinnitatud)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'teadmata: {why}. 16 Hz FF kujutise jaoks peab kaamera ütlema, millist järku see käitab (vahekaart „Püsivarapesad“ küsib seda)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': '16 Hz FF järk 1.3.0.8',
  'report.build8Hz': '8 Hz järk 1.3.0.8',
  'report.keys': 'Võtmed',
  'report.slots': 'Pesad',
  'report.slotsCaption':
    'Iga pesa sellisena, nagu lugemine selle leidis. Ainult lugemine: kirjutab vahekaart „Püsivarapesad“.',
  'report.slot': 'Pesa',
  'report.address': 'Aadress',
  'report.version': 'Versioon',
  'report.size': 'Suurus',
  'report.key': 'Võti',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Aktsepteerib',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Jalus',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Käivitatav',
  'report.bytes': '{count} B',
  'report.plaintext': 'puudub (avatekst)',
  /** A table value, lower case: "yes". */
  'report.yes': 'jah',
  /** A table value, lower case: "no". */
  'report.no': 'ei',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'ei kohaldu',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Kirjutamine',
  'report.noBankWritten': 'Selle kaamera ühtegi pesa ei kirjutata:',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'Üks pesa korraga: vahekaart „Püsivarapesad“ kirjutab või paikab selle kaamera üht pesa, iga pesa valmistatakse ette avatekstina (kujutis sellisena, nagu see on, ilma võtmeta) ja iga kirjutamine küsib enne luba.',
  'report.oneBank.slotKeystream':
    'Üks pesa korraga: vahekaart „Püsivarapesad“ kirjutab või paikab selle kaamera üht pesa, iga pesa valmistatakse ette kujutise enda võtmeplokiga 0 ja iga kirjutamine küsib enne luba.',
  'report.oneBank.keyA':
    'Üks pesa korraga: vahekaart „Püsivarapesad“ kirjutab või paikab selle kaamera üht pesa, iga pesa valmistatakse ette võtmetega, mis on tuletatud käivitatud pesast ja töötavast rakendusest, ja iga kirjutamine küsib enne luba.',
  'report.oneBank.ffVendor':
    'Üks pesa korraga: vahekaart „Püsivarapesad“ kirjutab või paikab selle kaamera üht pesa, iga pesa valmistatakse ette nii, nagu tootja rakendus valmistab ette 16 Hz FF kujutise (kujutis XOR selle enda võtmeplokk 0), kaamera salvestab selle võtmega B, ja iga kirjutamine küsib enne luba.',
  'report.refusesEvery': 'Vahekaart „Püsivarapesad“ keeldub selle kaamera igast pesast:',
} satisfies Translation<'info', 'et'>;
