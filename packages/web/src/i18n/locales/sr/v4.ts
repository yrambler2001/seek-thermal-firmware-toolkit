/**
 * Namespace `v4`, srpski (sr), translated from the English source.
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
  'status.starting': 'Pokretanje ...',
  'status.building': 'Pravljenje arhive ...',
  'status.cancelling': 'Otkazivanje — biće sačuvano sve što je dosad pročitano ...',
  'status.refused': 'Odbijeno — ništa nije pročitano. Pogledajte poruku iznad dnevnika.',
  'status.sweepDone':
    'Gotovo — aktivirani selektori: {armed}/{total}, sa podacima: {withData}. Proverite preuzete datoteke.',
  'status.sweepDoneCancelled':
    'Gotovo — aktivirani selektori: {armed}/{total}, sa podacima: {withData} (otkazano). Proverite preuzete datoteke.',
  'status.dumpDone': 'Gotovo — pročitani prozori: {read}/{expected}. Proverite preuzete datoteke.',
  'status.dumpDoneCancelled':
    'Gotovo — pročitani prozori: {read}/{expected} (otkazano). Proverite preuzete datoteke.',
  'status.dumpDoneIncomplete':
    'Gotovo — pročitani prozori: {read}/{expected} (nepotpuno — pogledajte dnevnik). Proverite preuzete datoteke.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'Kamera ne odgovara porodici 4.x/Nano, a ova kartica čita samo tu porodicu. Ništa nije pročitano. Za kameru 0.x ili 1.x (izdanja iz 2014. ili 2016. godine) koristite „{tab}“.',
  'refusal.otherFamily':
    'Kamera izgleda kao {name} ({id}), a ne kao kamera 4.x/Nano, a ova kartica čita samo 4.x/Nano. Ništa nije pročitano. Za kameru 0.x ili 1.x (izdanja iz 2014. ili 2016. godine) koristite „{tab}“.',
  'refusal.legacyLine':
    'Kamera radi sa firmverom {version}, izdanjem 0.x ili 1.x (iz 2014. ili 2016. godine), a ova kartica čita samo 4.x/Nano. Pročitana je samo verzija. Za kameru 0.x ili 1.x koristite „{tab}“.',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Iščitavanje',
  'dump.actions': 'Radnje iščitavanja',
  'dump.start': 'Pokreni iščitavanje',
  'dump.panel': 'Iščitavanje',
  'dump.how':
    'Oba dugmeta prvo pitaju kameru koji firmver radi: njegovu verziju, komandom `{getInfo}` — jedinim čitanjem na koje svako Seek izdanje odgovara na isti način — i, samo ako to izdanje može da se čita preko USB-a, jednom običnom i jednom `{begin}` komandom sa tokenom, uz jedno čitanje. Tako stranica utvrđuje kojoj porodici kamera pripada. Ova kartica čita samo porodicu 4.x i Nano. Kamera koju odgovori svrstaju bilo gde drugde odbija se pre bilo kakvog čitanja, a stranica navodi karticu za nju. Kamera koja ne prijavi verziju, ili radi sa izdanjem starijim od 0.8.0.0, uopšte se ne čita, a stranica kaže zašto.',
  'dump.modes':
    '**Pokreni iščitavanje** čita svaki blok do kog dopire tabela selektora samog izdanja. **Iščitaj sve selektore**, u *Opcijama* ispod, isprobava svaki `{begin}` selektor `{first}`–`{last}` i čuva sve što svaki vrati — sporije, ali hvata i blokove koje odabrana mapa preskače.',
  'dump.sweep': 'Iščitaj sve selektore ({first}–{last})',
  'dump.sweepNote':
    'Isprobava svaki selektor i čuva sve što svaki vrati. Sporije od „Pokreni iščitavanje“.',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'Šta dobijate',
  'output.intro': 'Jedno preuzimanje `{ext}` koje sadrži:',
  'output.caption': 'Datoteke u preuzetoj arhivi',
  'output.file': 'Datoteka',
  'output.what': 'Šta je to',
  'output.flash':
    'sastavljena slika fleša od 4 MB (popuna praznine i token za otključavanje, ako su korišćeni, nalaze se u manifest.json)',
  'output.windows': 'svaki blok od 64 KB tačno onakav kakav je stigao preko USB-a',
  'output.decrypted': 'svaki slot sa slikom firmvera, dešifrovan (ako je ključ pronađen)',
  'output.reports':
    'izveštaj po slotu: ključ, lokacija ključa, porodica i šifra, SP, ulazna tačka, SHA-256',
  'output.manifest': 'tačni metapodaci čitanja, praznine i dešifrovanja',
  'output.readme': 'šta je ovaj snimak i koja su mu ograničenja',
  'output.keyFromDump':
    'Ključ se izračunava iz same kopije fleša, pa nije potrebna datoteka sa ključem ni tajna uređaja.',
  'output.bestEffort':
    'Dešifrovanje i dalje nije zagarantovano. Ako se ključ ne pronađe — na primer na uređaju čiji butloder izvodi ključ iz OTP memorije čipa, koje nema u kopiji fleša — taj slot se jednostavno preskače, a ostatak arhive ostaje netaknut.',
  'gap.summary': 'Praznina na {address}',
  'gap.where':
    'USB skup komandi nudi selektor prozora čitanja za svaki blok od 64 KB u 4 MB fleša osim `{range}`. Taj blok se u objedinjenoj slici popunjava sa `{fill}` i beleži u `{manifest}`.',
  'gap.costs':
    '**U praksi vas to ništa ne košta.** Na većini kamera taj blok je jednostavno obrisan fleš, koji se ionako čita kao `{fill}` — pa se popuna poklapa sa onim što je zaista tamo i slika je potpuna.',
  'gap.redundant':
    'A kada se blok *koristi*, u njemu je dodatna kopija. Ove kamere drže istu sliku firmvera u nekoliko slotova od 64 KB: u svim kopijama fleša sa više slotova proverenim tokom izrade ove stranice svi slotovi su se dešifrovali u bajt po bajt identičan firmver — u jednom slučaju u četiri slota upisana sa dva različita ključa. Na jedinom viđenom uređaju sa pravom slikom na `{address}` ona je bila bajt po bajt ista kao kopije na `{before}` i `{after}`, pa arhiva ipak sadrži taj firmver, samo pročitan sa druge adrese.',
  'gap.fine':
    'Zbog te redundantnosti je u redu i kamera čiji se `{address}` čita kao `{fill}`: firmver za pokretanje i dalje postoji u ostalim slotovima. Ništa na ovoj kartici ionako ne upisuje u uređaj — praznina utiče samo na datoteku koju preuzimate.',
  'gap.complete':
    'Ako vam ipak treba strogo potpuna slika bajt po bajt — na primer da poredite fleš sa referentnim — pročitajte ga preko SWD/J-Link ili SPI programatorom.',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': 'Nije pročitano: kamera nije rekla koji firmver radi.',
  'identity.unsupported': 'Nije pročitano: ova kamera ne može da se čita na ovaj način.',
  'identity.title': 'Prepoznata kamera',
  'identity.firmware': 'Firmver',
  'identity.scoreBasis': 'na osnovu odgovora kamere, pre čitanja bilo kog slota',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Opcije',
  'options.subtitle': '— podrazumevane vrednosti su ispravne; ovde ne morate ništa da menjate.',
  'options.chunk': 'chunk (bajtova po control-IN čitanju)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'gap-fill (bajt za popunu)',
  'options.retries': 'pokušaja po prozoru',
  'options.retryDelay': 'pauza između pokušaja (ms)',
  'options.recipient': 'recipient (primalac kontrolnog prenosa)',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'automatski',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'dešifruj firmver',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'da',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'ne',
  'options.help':
    '**chunk** je veličina svakog control-IN čitanja, najviše 64: jedan EP0 paket. Duže čitanje može da izgubi paket zbog boot ROM-a kamere kada kamera miruje na niskom taktu, pa se veća vrednost čita po 64 bajta; manja se koristi kakva jeste, a ako kamera zastane, stranica sama ide niže i nastavlja. **gap-fill** je bajt koji se upisuje u jedini blok od 64 KB do kog USB ne dopire. **recipient** je podrazumevano interface i prelazi na device ako pregledač ne može da zauzme interfejs 0 — firmver prihvata oba.',
  'options.chunkRange': 'chunk mora biti između 1 i {max}, dobijeno {value}',
  'options.gapFillByte': 'gap-fill mora biti jedan bajt, dobijeno {value}',
  'options.retriesMin': 'broj pokušaja mora biti nula ili više, dobijeno {value}',
  'options.retryDelayMin': 'pauza između pokušaja mora biti nula ili više, dobijeno {value}',
} satisfies Translation<'v4', 'sr'>;
