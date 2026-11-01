/**
 * Namespace `info`, latviešu (lv), translated from the English source.
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
  'status.notRead': 'Vēl nav nolasīts.',
  'status.reading': 'Nolasa ...',
  'status.noVersion': 'Versija netika paziņota.',
  'status.tooOld':
    'Nolasīts. Aparātprogrammatūra {version} ir vecāka par 0.8.0.0 — nekas cits netika nolasīts.',
  'status.read': 'Nolasīts. Aparātprogrammatūra {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Nolasīt kameru',
  'read.description':
    'Tikai lasīšana. Pajautā kamerai, ko tā darbina, kā tā sāknējas, kādas atslēgas tajā ir un kas ir katrā slotā: tā pati nolasīšana kā seek-fw info. Nekas netiek ierakstīts.',
  'read.actions': 'Informācijas darbības',
  'read.button': 'Nolasīt aparātprogrammatūras versiju',
  'read.connectFirst':
    'Vispirms pievienojiet kameru augstāk, pēc tam nospiediet „Nolasīt aparātprogrammatūras versiju“.',
  'read.showDetails': 'Rādīt sīkāku informāciju žurnālā',
  'read.panel': 'Aparātprogrammatūras versija',
  'result.title': 'Ko kamera paziņo',
  'result.version': 'Aparātprogrammatūras versija',
  'result.build': 'Būvējums',
  'result.range': 'Versiju diapazons',
  'result.tab': 'Cilne šai kamerai',
  'result.rangeLegacy': '0.x / 1.x: 2014. un 2016. gada kameras',
  'result.rangeModern': '2.x un jaunākas: 4.x, Nano un Mosaic kameras',
  'result.rangeUnknown': 'nezināms',
  'result.noVersion':
    '**Kamera nepaziņoja savu aparātprogrammatūras versiju.** Nekas cits netika nosūtīts. Atvienojiet to, pievienojiet atkal, ļaujiet tai pilnībā startēt un nolasiet vēlreiz.',
  'result.noTab': 'Neviena cilne nenolasa šo būvējumu.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Šai kamerai atveriet cilni <tab>{tab}</tab>. Pirms kaut ko nolasīt, šī cilne vēlreiz pajautā kamerai, kurai saimei tā pieder, un nepieņem kameru, kas nepieder tās aptvertajai saimei.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'Kam paredzēta katra cilne',
  'tabs.intro':
    'Piecas cilnes šādā secībā. Katra ir atsevišķa lapa, un galvenē redzams, kurā no tām atrodaties.',
  'tabs.caption': 'Cilnes, ko tās dara, kuras kameras aptver un vai tās raksta kamerā',
  'tabs.tab': 'Cilne',
  'tabs.does': 'Ko tā dara',
  'tabs.cameras': 'Kameras',
  'tabs.writes': 'Raksta kamerā?',
  'tabs.info.does':
    'Nolasa, ko kamera paziņo: tās aparātprogrammatūru, saimi, kurai tā atbilst, sāknēšanas veidu, atslēgas un katru slotu. Tā pati nolasīšana kā seek-fw info. Neko neieraksta.',
  'tabs.info.cameras': 'Jebkura Seek kamera, ko WebUSB var atvērt.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Nē.',
  'tabs.preserve.does':
    'Izveido pilnu kameras 4 MB zibatmiņas kopiju un pēc katra soļa saglabā sesijas failu. Lai nolasītu visu, tā uz laiku uzliek aparātprogrammatūrai ielāpu, pēc tam atliek atpakaļ oriģinālo aparātprogrammatūru un to pārbauda. Soļi tiek veikti pa vienam.',
  'tabs.preserve.cameras':
    'Kameras ar 0.x un 1.x aparātprogrammatūru: 2014. gada Compact būvējumi, 2016. gada Compact PRO būvējumi (1.0.3.x) un Compact būvējums 1.3.0.8 FF (16 Hz).',
  'tabs.preserve.writes':
    'Jā, divos soļos, un katrs vispirms pajautā. Kamera tiek atjaunota tāda, kāda tā bija.',
  'tabs.v4.does':
    'Nolasa visu 4.x vai Nano kameras zibatmiņu un atšifrē atrastos aparātprogrammatūras slotus. Tikai lasīšana: nosūta sešas lasīšanas komandas un nevienu rakstīšanas komandu.',
  'tabs.v4.cameras':
    'Kameras ar 4.x aparātprogrammatūru (Compact, Compact PRO, Compact XR), Mosaic (10.x un 2.x) un Nano (42.x un 44.x), sākot no 2018. gada.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Nē.',
  'tabs.decrypt.does':
    'Atšifrē failu, kas jums jau ir: visu izmeti pa slotiem vai vienu 64 KB aparātprogrammatūras slotu atsevišķi. Rezultātu var lejupielādēt.',
  'tabs.decrypt.cameras':
    'Nekādas. Kamera netiek izmantota, tāpēc tas darbojas, ja nekas nav pievienots, un jebkurā pārlūkprogrammā.',
  'tabs.decrypt.writes': 'Nē. Tā raksta tikai lejupielādi.',
  'tabs.slots.does':
    'Nolasa trīs aparātprogrammatūras slotus (slotu A, slotu B un atkopšanas slotu R), parāda, kas ir katrā un no kura kamera sāknējas, un var saglabāt vai ierakstīt pa vienam slotam.',
  'tabs.slots.cameras': 'Kameras ar 0.8.0.0 un jaunāku aparātprogrammatūru.',
  'tabs.slots.writes': 'Jā, pa vienam slotam, un katra ierakstīšana vispirms pajautā.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Kamera',
  'report.product': 'Produkts',
  'report.manufacturer': 'Ražotājs',
  'report.serial': 'Sērijas numurs',
  'report.platform': 'Platforma',
  'report.usbLink': 'USB savienojums',
  'report.noProduct': '(nav produkta nosaukuma)',
  'report.none': '(nav)',
  'report.unreadable': '(nav nolasāms)',
  'report.firmware': 'Aparātprogrammatūra',
  'report.running': 'Darbojas',
  'report.bootloader': 'Sāknētājs',
  'report.family': 'Aparātprogrammatūras saime',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Nolasīts kā',
  'report.detected': 'Noteikts',
  'report.boot': 'Sāknēšana',
  'report.booted': 'Sāknēts',
  'report.lastStart': 'Pēdējā sāknēšana',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'Darbojas (1.3.0.8)',
  'report.nextStart': 'Nākamā sāknēšana',
  'report.upgradeTarget': 'Jaunināšanas mērķis',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(netika vaicāts)',
  'report.targetConfirmed': '{slot} (apstiprināts USB apmaiņā)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'nav zināms: {why}. 16 Hz FF attēlam vajag, lai kamera pasaka, kuru būvējumu tā darbina (slotu cilne to pajautā)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': '16 Hz FF būvējums 1.3.0.8',
  'report.build8Hz': '8 Hz būvējums 1.3.0.8',
  'report.keys': 'Atslēgas',
  'report.slots': 'Sloti',
  'report.slotsCaption':
    'Katrs slots tāds, kādu to atrada nolasīšana. Tikai lasīšana: raksta slotu cilne.',
  'report.slot': 'Slots',
  'report.address': 'Adrese',
  'report.version': 'Versija',
  'report.size': 'Izmērs',
  'report.key': 'Atslēga',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Pieņem',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Kājene',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Sāknējams',
  'report.bytes': '{count} B',
  'report.plaintext': 'nav (atklāts teksts)',
  /** A table value, lower case: "yes". */
  'report.yes': 'jā',
  /** A table value, lower case: "no". */
  'report.no': 'nē',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'neattiecas',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Ierakstīšana',
  'report.noBankWritten': 'Neviens šīs kameras slots netiek ierakstīts:',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'Pa vienam slotam: slotu cilne ieraksta vienu šīs kameras slotu vai uzliek tam ielāpu, katru slotu sagatavojot atklātā veidā (attēlu tādu, kāds tas ir, bez atslēgas), un katra ierakstīšana vispirms pajautā.',
  'report.oneBank.slotKeystream':
    'Pa vienam slotam: slotu cilne ieraksta vienu šīs kameras slotu vai uzliek tam ielāpu, katru slotu sagatavojot ar sava attēla atslēgu bloku 0, un katra ierakstīšana vispirms pajautā.',
  'report.oneBank.keyA':
    'Pa vienam slotam: slotu cilne ieraksta vienu šīs kameras slotu vai uzliek tam ielāpu, katru slotu sagatavojot ar atslēgām, kas atvasinātas no sāknētā slota un darbojošās lietotnes, un katra ierakstīšana vispirms pajautā.',
  'report.oneBank.ffVendor':
    'Pa vienam slotam: slotu cilne ieraksta vienu šīs kameras slotu vai uzliek tam ielāpu, katru slotu sagatavojot tā, kā ražotāja lietotne sagatavo 16 Hz FF attēlu (attēls XOR tā paša atslēgu bloks 0), ko kamera glabā ar atslēgu B, un katra ierakstīšana vispirms pajautā.',
  'report.refusesEvery': 'Slotu cilne nepieņem nevienu šīs kameras slotu:',
} satisfies Translation<'info', 'lv'>;
