/**
 * Namespace `info`, română (ro), translated from the English source.
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
  'status.notRead': 'Nu a fost citită încă.',
  'status.reading': 'Se citește ...',
  'status.noVersion': 'Nu s-a raportat nicio versiune.',
  'status.tooOld':
    'Citită. Firmware-ul {version} este mai vechi decât 0.8.0.0 — nu s-a mai citit nimic altceva.',
  'status.read': 'Citită. Firmware {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Citirea camerei',
  'read.description':
    'Doar citire. Întreabă camera ce rulează, cum pornește, ce chei are și ce conține fiecare slot: aceeași citire ca seek-fw info. Nu se scrie nimic.',
  'read.actions': 'Acțiuni Info',
  'read.button': 'Citire versiune firmware',
  'read.connectFirst':
    'Mai întâi conectați camera mai sus, apoi apăsați „Citire versiune firmware”.',
  'read.showDetails': 'Afișare detalii în jurnal',
  'read.panel': 'Versiune firmware',
  'result.title': 'Ce raportează camera',
  'result.version': 'Versiune firmware',
  'result.build': 'Build',
  'result.range': 'Interval de versiuni',
  'result.tab': 'Fila pentru această cameră',
  'result.rangeLegacy': '0.x / 1.x: camerele din 2014 și 2016',
  'result.rangeModern': '2.x și mai noi: camerele 4.x, Nano și Mosaic',
  'result.rangeUnknown': 'necunoscut',
  'result.noVersion':
    '**Camera nu și-a raportat versiunea firmware-ului.** Nu s-a mai trimis nimic altceva. Deconectați-o, conectați-o din nou, lăsați-o să termine pornirea și citiți din nou.',
  'result.noTab': 'Nicio filă nu citește acest build.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Deschideți <tab>{tab}</tab> pentru această cameră. Fila respectivă întreabă din nou camera din ce familie face parte înainte să citească ceva și refuză o cameră care nu este din familia pe care o acoperă.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'La ce folosește fiecare filă',
  'tabs.intro':
    'Cinci file, în această ordine. Fiecare este o pagină separată, iar antetul arată pe care vă aflați.',
  'tabs.caption': 'Filele, ce fac, camerele pe care le acoperă și dacă scriu',
  'tabs.tab': 'Filă',
  'tabs.does': 'Ce face',
  'tabs.cameras': 'Camere',
  'tabs.writes': 'Scrie în cameră?',
  'tabs.info.does':
    'Citește ce raportează camera: firmware-ul, familia drept care se identifică, cum pornește, cheile și fiecare slot. Aceeași citire ca seek-fw info. Nu scrie nimic.',
  'tabs.info.cameras': 'Orice cameră Seek pe care WebUSB o poate deschide.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Nu.',
  'tabs.preserve.does':
    'Face o copie completă a memoriei flash de 4 MB a camerei, cu un fișier de rulare salvat după fiecare pas. Ca să o citească în întregime, aplică temporar un patch firmware-ului, apoi pune la loc firmware-ul original și îl verifică. Vă conduce prin pași, unul câte unul.',
  'tabs.preserve.cameras':
    'Camere cu firmware 0.x și 1.x: build-urile Compact din 2014, build-urile Compact PRO din 2016 (1.0.3.x) și build-ul Compact 1.3.0.8 FF (16 Hz).',
  'tabs.preserve.writes': 'Da, în doi pași, și fiecare întreabă mai întâi. Readuce camera cum era.',
  'tabs.v4.does':
    'Citește întreaga memorie flash a unei camere 4.x sau Nano și decriptează sloturile de firmware pe care le găsește. Doar citire: trimite șase comenzi de citire și nicio scriere.',
  'tabs.v4.cameras':
    'Camere cu firmware 4.x (Compact, Compact PRO, Compact XR), Mosaic (10.x și 2.x) și Nano (42.x și 44.x), din 2018 încoace.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Nu.',
  'tabs.decrypt.does':
    'Decriptează un fișier pe care îl aveți deja: un dump complet, slot cu slot, sau un singur slot de firmware de 64 KB. Rezultatul poate fi descărcat.',
  'tabs.decrypt.cameras':
    'Niciuna. Nu folosește nicio cameră, așa că funcționează fără nimic conectat și în orice browser.',
  'tabs.decrypt.writes': 'Nu. Scrie doar fișierul descărcat.',
  'tabs.slots.does':
    'Citește cele trei sloturi de firmware (slotul A, slotul B și slotul de recuperare R), arată ce conține fiecare și din care pornește camera și poate extrage sau scrie câte un slot pe rând.',
  'tabs.slots.cameras': 'Camere cu firmware 0.8.0.0 sau mai nou.',
  'tabs.slots.writes': 'Da, câte un slot pe rând, și fiecare scriere întreabă mai întâi.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Cameră',
  'report.product': 'Produs',
  'report.manufacturer': 'Producător',
  'report.serial': 'Număr de serie',
  'report.platform': 'Platformă',
  'report.usbLink': 'Legătură USB',
  'report.noProduct': '(fără denumire de produs)',
  'report.none': '(niciuna)',
  'report.unreadable': '(ilizibil)',
  'report.firmware': 'Firmware',
  'report.running': 'În rulare',
  'report.bootloader': 'Bootloader',
  'report.family': 'Familie de firmware',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Citită ca',
  'report.detected': 'Detectată',
  'report.boot': 'Pornire',
  'report.booted': 'Pornită din',
  'report.lastStart': 'Ultima pornire',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'În rulare (1.3.0.8)',
  'report.nextStart': 'Următoarea pornire',
  'report.upgradeTarget': 'Ținta actualizării',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(nu s-a cerut)',
  'report.targetConfirmed': '{slot} (confirmat în comunicația USB)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'necunoscut: {why}. O imagine FF de 16 Hz are nevoie ca camera să spună ce build rulează (fila sloturilor întreabă)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': 'build-ul FF 1.3.0.8 de 16 Hz',
  'report.build8Hz': 'build-ul 1.3.0.8 de 8 Hz',
  'report.keys': 'Chei',
  'report.slots': 'Sloturi',
  'report.slotsCaption':
    'Fiecare slot așa cum l-a găsit citirea. Doar citire: scrierea se face pe fila sloturilor.',
  'report.slot': 'Slot',
  'report.address': 'Adresă',
  'report.version': 'Versiune',
  'report.size': 'Dimensiune',
  'report.key': 'Cheie',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Acceptă',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Footer',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Poate porni',
  'report.bytes': '{count} B',
  'report.plaintext': 'niciuna (necriptat)',
  /** A table value, lower case: "yes". */
  'report.yes': 'da',
  /** A table value, lower case: "no". */
  'report.no': 'nu',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'n/a',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Scriere',
  'report.noBankWritten': 'Nu se scrie niciun slot al acestei camere:',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'Câte un slot pe rând: fila sloturilor scrie sau aplică patch-ul pe câte un slot al acestei camere, fiecare slot fiind transferat necriptat (imaginea ca atare, fără cheie), și fiecare scriere întreabă mai întâi.',
  'report.oneBank.slotKeystream':
    'Câte un slot pe rând: fila sloturilor scrie sau aplică patch-ul pe câte un slot al acestei camere, fiecare slot fiind transferat cu blocul de chei 0 al propriei imagini, și fiecare scriere întreabă mai întâi.',
  'report.oneBank.keyA':
    'Câte un slot pe rând: fila sloturilor scrie sau aplică patch-ul pe câte un slot al acestei camere, fiecare slot fiind transferat cu chei derivate din slotul de pornire și din aplicația care rulează, și fiecare scriere întreabă mai întâi.',
  'report.oneBank.ffVendor':
    'Câte un slot pe rând: fila sloturilor scrie sau aplică patch-ul pe câte un slot al acestei camere, fiecare slot fiind transferat așa cum aplicația producătorului transferă imaginea FF de 16 Hz (imaginea XOR propriul ei bloc de chei 0), stocată de cameră cu cheia B, și fiecare scriere întreabă mai întâi.',
  'report.refusesEvery': 'Fila sloturilor refuză fiecare slot al acestei camere:',
} satisfies Translation<'info', 'ro'>;
