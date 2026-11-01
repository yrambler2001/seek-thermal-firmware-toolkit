/**
 * Namespace `v4`, latviešu (lv), translated from the English source.
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
  'status.starting': 'Sāk ...',
  'status.building': 'Veido arhīvu ...',
  'status.cancelling': 'Atceļ — tiks saglabāts viss, kas līdz šim nolasīts ...',
  'status.refused': 'Atteikts — nekas netika nolasīts. Skatiet ziņojumu virs žurnāla.',
  'status.sweepDone':
    'Gatavs — aktivizēti selektori: {armed}/{total}, ar datiem: {withData}. Pārbaudiet lejupielādes.',
  'status.sweepDoneCancelled':
    'Gatavs — aktivizēti selektori: {armed}/{total}, ar datiem: {withData} (atcelts). Pārbaudiet lejupielādes.',
  'status.dumpDone': 'Gatavs — nolasīti logi: {read}/{expected}. Pārbaudiet lejupielādes.',
  'status.dumpDoneCancelled':
    'Gatavs — nolasīti logi: {read}/{expected} (atcelts). Pārbaudiet lejupielādes.',
  'status.dumpDoneIncomplete':
    'Gatavs — nolasīti logi: {read}/{expected} (nepilnīgi — skatiet žurnālu). Pārbaudiet lejupielādes.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'Kamera neatbilda 4.x/Nano saimei, un šī cilne lasa tikai šo saimi. Nekas netika nolasīts. 0.x vai 1.x kamerai (2014. vai 2016. gada būvējumi) izmantojiet „{tab}“.',
  'refusal.otherFamily':
    'Kamera izskatās pēc {name} ({id}), nevis pēc 4.x/Nano kameras, un šī cilne lasa tikai 4.x/Nano. Nekas netika nolasīts. 0.x vai 1.x kamerai (2014. vai 2016. gada būvējumi) izmantojiet „{tab}“.',
  'refusal.legacyLine':
    'Kamerā darbojas {version}, 0.x vai 1.x būvējums (2014. vai 2016. gada), un šī cilne lasa tikai 4.x/Nano. Netika nolasīts nekas, izņemot versiju. 0.x vai 1.x kamerai izmantojiet „{tab}“.',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Nolasīšana',
  'dump.actions': 'Nolasīšanas darbības',
  'dump.start': 'Sākt nolasīšanu',
  'dump.panel': 'Nolasīšana',
  'dump.how':
    'Abi režīmi vispirms pajautā kamerai, kādu aparātprogrammatūru tā darbina: tās versiju ar `{getInfo}` — vienīgo nolasīšanu, uz kuru katrs Seek būvējums atbild vienādi —, un, tikai ja šo būvējumu var nolasīt pa USB, vienu vienkāršu un vienu marķieri nesošu `{begin}` un vienu nolasīšanu. Tā lapa nosaka, kurai saimei kamera pieder. Šī cilne lasa tikai 4.x un Nano saimi. Kamera, ko atbildes ierindo jebkur citur, tiek atteikta, pirms kaut kas tiek nolasīts, un lapa nosauc tai paredzēto cilni. Kamera, kas nepaziņo savu versiju vai darbina būvējumu, kas vecāks par 0.8.0.0, netiek nolasīta vispār, un lapa pasaka, kāpēc.',
  'dump.modes':
    '**Sākt nolasīšanu** nolasa katru bloku, ko sasniedz paša būvējuma selektoru tabula. **Nolasīt visus selektorus** sadaļā *Opcijas* zemāk pārbauda katru `{begin}` selektoru `{first}`–`{last}` un saglabā visu, ko katrs atgriež, — tas ir lēnāk, taču notver arī blokus, ko atlasītā karte izlaiž.',
  'dump.sweep': 'Nolasīt visus selektorus ({first}–{last})',
  'dump.sweepNote':
    'Pārbauda katru selektoru un saglabā visu, ko katrs atgriež. Lēnāk nekā „Sākt nolasīšanu“.',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'Ko jūs saņemat',
  'output.intro': 'Viena `{ext}` lejupielāde, kurā ir:',
  'output.caption': 'Faili lejupielādētajā arhīvā',
  'output.file': 'Fails',
  'output.what': 'Kas tas ir',
  'output.flash':
    'salikts 4 MB zibatmiņas attēls (spraugas aizpildījums un atbloķēšanas marķieris, ja tāds izmantots, ir failā manifest.json)',
  'output.windows': 'katrs 64 KB bloks tieši tāds, kāds tas tika saņemts pa USB',
  'output.decrypted':
    'katrs aparātprogrammatūras attēla slots, atšifrēts (ja atslēga tika atrasta)',
  'output.reports':
    'atskaite par katru slotu: atslēga, atslēgas atrašanās vieta, saime un šifrs, SP, ieejas punkts, SHA-256',
  'output.manifest': 'precīzi nolasīšanas, spraugu un atšifrēšanas metadati',
  'output.readme': 'kas ir šis ieraksts un kādi ir tā ierobežojumi',
  'output.keyFromDump':
    'Atslēga tiek atgūta no pašas izmetes, tāpēc nav vajadzīgs ne atslēgas fails, ne ierīces noslēpums.',
  'output.bestEffort':
    'Atšifrēšana joprojām notiek pēc labākās iespējas. Ja atslēga netiek atrasta — piemēram, ierīcē, kuras sāknētājs atvasina atslēgu no mikroshēmas OTP, kas zibatmiņas izmetē nav, — šis slots vienkārši tiek izlaists, un pārējo arhīvu tas neietekmē.',
  'gap.summary': 'Sprauga {address}',
  'gap.where':
    'USB komandu kopa piedāvā lasīšanas loga selektoru katram 4 MB zibatmiņas 64 KB blokam, izņemot `{range}`. Šis bloks apvienotajā attēlā tiek aizpildīts ar `{fill}` un reģistrēts failā `{manifest}`.',
  'gap.costs':
    '**Praksē tas jums neko nemaksā.** Lielākajā daļā kameru šis bloks ir vienkārši izdzēsta zibatmiņa, kas tāpat nolasās kā `{fill}`, — tāpēc aizpildījums atbilst tam, kas tur patiešām ir, un attēls ir pilnīgs.',
  'gap.redundant':
    'Un, ja bloks *tiek* izmantots, tajā glabājas dublikāts. Šīs kameras glabā vienu un to pašu aparātprogrammatūras attēlu vairākos 64 KB slotos: visās vairāku slotu izmetēs, kas tika pārbaudītas, veidojot šo lapu, visi sloti atšifrējās par baitu pa baitam identisku aparātprogrammatūru — vienā gadījumā četros slotos, kas bija ierakstīti ar divām dažādām atslēgām. Vienīgajā ierīcē, kur adresē `{address}` bija īsts attēls, tas baitu pa baitam sakrita ar kopijām adresēs `{before}` un `{after}`, tāpēc arhīvā šī aparātprogrammatūra joprojām ir, tikai nolasīta no citas adreses.',
  'gap.fine':
    'Šī dublēšana ir arī iemesls, kāpēc kamera, kuras `{address}` nolasās kā `{fill}`, ir kārtībā: sāknējamā aparātprogrammatūra joprojām ir pārējos slotos. Nekas šajā cilnē jebkurā gadījumā neraksta ierīcē — sprauga ietekmē tikai lejupielādēto failu.',
  'gap.complete':
    'Ja jums tomēr vajag stingri pilnīgu attēlu baitu pa baitam — piemēram, lai salīdzinātu zibatmiņu ar atsauces attēlu —, nolasiet to pa SWD/J-Link vai ar SPI programmatoru.',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': 'Nav nolasīts: kamera nepateica, kādu aparātprogrammatūru tā darbina.',
  'identity.unsupported': 'Nav nolasīts: šo kameru šādā veidā nevar nolasīt.',
  'identity.title': 'Noteiktā kamera',
  'identity.firmware': 'Aparātprogrammatūra',
  'identity.scoreBasis': 'pēc kameras atbildēm, pirms nolasīts kāds slots',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Opcijas',
  'options.subtitle': '— noklusējuma vērtības ir pareizas; šeit nekas nav jāmaina.',
  'options.chunk': 'chunk (control-IN baiti)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'gap-fill baits',
  'options.retries': 'mēģinājumi katram logam',
  'options.retryDelay': 'pauze starp mēģinājumiem (ms)',
  'options.recipient': 'vadības pārsūtes recipient',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'automātiski',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'atšifrēt aparātprogrammatūru',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'jā',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'nē',
  'options.help':
    '**chunk** ir katras control-IN nolasīšanas izmērs, ne vairāk kā 64: viena EP0 pakete. Garākā nolasīšanā kameras sāknēšanas ROM var pazaudēt paketi, kad kamera dīkstāvē strādā ar zemu takts frekvenci, tāpēc lielāka vērtība tiek lasīta pa 64 baitiem; mazāka tiek izmantota tāda, kāda norādīta, un, ja kamera iestrēgst, lapa pati samazina vērtību un turpina. **gap-fill** ir baits, ko ieraksta vienīgajā 64 KB blokā, ko USB nesasniedz. **recipient** pēc noklusējuma ir interface, un, ja pārlūkprogramma nevar pārņemt saskarni 0, tiek izmantots device — aparātprogrammatūra pieņem abus.',
  'options.chunkRange': 'chunk jābūt no 1 līdz {max}, saņemts {value}',
  'options.gapFillByte': 'gap-fill jābūt vienam baitam, saņemts {value}',
  'options.retriesMin': 'mēģinājumu skaitam jābūt nullei vai vairāk, saņemts {value}',
  'options.retryDelayMin': 'pauzei starp mēģinājumiem jābūt nullei vai vairāk, saņemts {value}',
} satisfies Translation<'v4', 'lv'>;
