/**
 * Namespace `v4`, eesti (et), translated from the English source.
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
  'status.starting': 'Alustamine ...',
  'status.building': 'Arhiivi koostamine ...',
  'status.cancelling': 'Katkestamine — salvestatakse kõik, mis seni loetud ...',
  'status.refused': 'Keeldutud — midagi ei loetud. Vaadake logi kohal olevat teadet.',
  'status.sweepDone':
    'Valmis — aktiveeritud selektoreid: {armed}/{total}, neist andmetega {withData}. Vaadake oma allalaadimisi.',
  'status.sweepDoneCancelled':
    'Valmis — aktiveeritud selektoreid: {armed}/{total}, neist andmetega {withData} (katkestatud). Vaadake oma allalaadimisi.',
  'status.dumpDone': 'Valmis — loetud aknaid: {read}/{expected}. Vaadake oma allalaadimisi.',
  'status.dumpDoneCancelled':
    'Valmis — loetud aknaid: {read}/{expected} (katkestatud). Vaadake oma allalaadimisi.',
  'status.dumpDoneIncomplete':
    'Valmis — loetud aknaid: {read}/{expected} (puudulik — vaadake logi). Vaadake oma allalaadimisi.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'Kaamera ei sobinud 4.x/Nano perekonnaga ja see vahekaart loeb ainult seda perekonda. Midagi ei loetud. 0.x või 1.x kaamera (2014. või 2016. aasta järgud) jaoks kasutage vahekaarti „{tab}“.',
  'refusal.otherFamily':
    'Kaamera näib olevat {name} ({id}), mitte 4.x/Nano kaamera, ja see vahekaart loeb ainult 4.x/Nano kaameraid. Midagi ei loetud. 0.x või 1.x kaamera (2014. või 2016. aasta järgud) jaoks kasutage vahekaarti „{tab}“.',
  'refusal.legacyLine':
    'Kaamera käitab versiooni {version}, mis on 0.x või 1.x järk (2014 või 2016), ja see vahekaart loeb ainult 4.x/Nano kaameraid. Peale versiooni ei loetud midagi. 0.x või 1.x kaamera jaoks kasutage vahekaarti „{tab}“.',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Tõmmis',
  'dump.actions': 'Tõmmise toimingud',
  'dump.start': 'Alusta tõmmist',
  'dump.panel': 'Tõmmis',
  'dump.how':
    'Mõlemad küsivad esmalt kaameralt, millist püsivara see käitab: selle versiooni käsuga `{getInfo}` — see on ainus lugemine, millele iga Seeki järk vastab ühtmoodi — ja ainult siis, kui seda järku saab USB kaudu lugeda, ühe tavalise ja ühe avamismärgiga `{begin}` ning ühe lugemise. Nii saab leht teada, mis perekonda kaamera kuulub. See vahekaart loeb ainult 4.x ja Nano perekonda. Kaamerast, mille vastused paigutavad mujale, keeldutakse enne, kui midagi loetakse, ja leht nimetab sellele sobiva vahekaardi. Kaamerat, mis ei teata oma versiooni või käitab vanemat järku kui 0.8.0.0, ei loeta üldse ja leht ütleb, miks.',
  'dump.modes':
    '**Alusta tõmmist** loeb iga ploki, kuhu järgu enda selektoritabel ulatub. **Loe kõik selektorid** allpool jaotises *Suvandid* proovib läbi iga `{begin}` selektori `{first}`–`{last}` ja salvestab kõik, mida igaüks tagastab — see on aeglasem, kuid hõlmab ka plokke, mille kureeritud kaart vahele jätab.',
  'dump.sweep': 'Loe kõik selektorid ({first}–{last})',
  'dump.sweepNote':
    'Proovib läbi iga selektori ja salvestab kõik, mida igaüks tagastab. Aeglasem kui „Alusta tõmmist“.',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'Mida saate',
  'output.intro': 'Üks allalaaditav `{ext}`-fail, milles on:',
  'output.caption': 'Allalaaditud arhiivis olevad failid',
  'output.file': 'Fail',
  'output.what': 'Mis see on',
  'output.flash':
    'kokkupandud 4 MB välkmälu tõmmis (tühimiku täide ja kasutatud avamismärk on failis manifest.json)',
  'output.windows': 'iga 64 KB plokk täpselt sellisena, nagu see ühendusest tuli',
  'output.decrypted': 'iga püsivara kujutise pesa, dekrüptitud (kui võti leiti)',
  'output.reports':
    'pesa aruanne: võti, võtme asukoht, perekond ja šiffer, SP, sisenemispunkt, SHA-256',
  'output.manifest': 'täpsed lugemise, tühimiku ja dekrüptimise metaandmed',
  'output.readme': 'mis see salvestis on ja millised on selle piirangud',
  'output.keyFromDump':
    'Võti taastatakse tõmmisest endast, nii et võtmefaili ega seadme saladust pole vaja.',
  'output.bestEffort':
    'Dekrüptimine on siiski parima püüdluse põhine. Kui võtit ei leita — näiteks seadmel, mille alglaadur tuletab võtme kiibi OTP-mälust, mida välkmälu tõmmises pole —, jäetakse see pesa lihtsalt vahele ja ülejäänud arhiiv jääb puutumata.',
  'gap.summary': 'Tühimik {address}',
  'gap.where':
    'USB-käsustik pakub lugemisakna selektorit 4 MB välkmälu igale 64 KB plokile, välja arvatud `{range}`. See plokk täidetakse ühendkujutises väärtusega `{fill}` ja märgitakse faili `{manifest}`.',
  'gap.costs':
    '**Praktikas ei maksa see teile midagi.** Enamikul kaameratel on see plokk lihtsalt kustutatud välkmälu, mida loetakse niikuinii kui `{fill}` — nii et täide vastab sellele, mis seal tegelikult on, ja kujutis on täielik.',
  'gap.redundant':
    'Ja kui plokk *on* kasutusel, on selles üleliigne koopia. Need kaamerad hoiavad sama püsivara kujutist mitmes 64 KB pesas: kõigis selle lehe loomisel kontrollitud mitme pesaga tõmmistes dekrüptusid kõik pesad bait-baidilt identseks püsivaraks — ühel juhul neljas pesas, mis olid kirjutatud kahe eri võtmega. Ainsal seadmel, kus aadressil `{address}` oli päris kujutis, oli see bait-baidilt sama mis koopiad aadressidel `{before}` ja `{after}`, nii et arhiivis on see püsivara ikkagi olemas, lihtsalt teiselt aadressilt loetuna.',
  'gap.fine':
    'Sama liiasuse tõttu on korras ka kaamera, mille `{address}` loeb tagasi kui `{fill}`: käivitatav püsivara on endiselt teistes pesades olemas. Sellel vahekaardil ei kirjuta seadmesse niikuinii miski — tühimik mõjutab ainult allalaaditavat faili.',
  'gap.complete':
    'Kui soovite rangelt täielikku bait-baidilist kujutist — näiteks välkmälu võrdlemiseks etaloniga —, lugege see SWD/J-Linki kaudu või SPI-programmaatoriga.',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': 'Ei loetud: kaamera ei öelnud, millist püsivara see käitab.',
  'identity.unsupported': 'Ei loetud: seda kaamerat ei saa sel viisil lugeda.',
  'identity.title': 'Tuvastatud kaamera',
  'identity.firmware': 'Püsivara',
  'identity.scoreBasis': 'kaamera vastuste põhjal, enne ühegi pesa lugemist',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Suvandid',
  'options.subtitle': '— vaikeväärtused on õiged; siin pole vaja midagi muuta.',
  'options.chunk': 'chunk (control-IN baite)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'gap-fill (tühimiku täitebait)',
  'options.retries': 'kordusi akna kohta',
  'options.retryDelay': 'korduse viivitus (ms)',
  'options.recipient': 'recipient (juhtedastuse saaja)',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'automaatne',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'dekrüpti püsivara',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'jah',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'ei',
  'options.help':
    '**chunk** on iga control-IN lugemise suurus, kõige rohkem 64: üks EP0 pakett. Pikema lugemise korral võib kaamera alglaadimis-ROM paketi kaotada, kui kaamera on madalal taktsagedusel jõude, nii et suuremat väärtust loetakse 64 baidi kaupa; väiksemat kasutatakse nii, nagu see on, ja kui kaamera seiskub, läheb leht ise madalamale ja jätkab. **gap-fill** on bait, mis kirjutatakse ainsasse 64 KB plokki, kuhu USB ei ulatu. **recipient** on vaikimisi interface ja lülitub ümber väärtusele device, kui brauser ei saa liidest 0 hõivata — püsivara aktsepteerib mõlemat.',
  'options.chunkRange': 'chunk peab olema vahemikus 1 kuni {max}, saadi {value}',
  'options.gapFillByte': 'gap-fill peab olema üks bait, saadi {value}',
  'options.retriesMin': 'kordusi peab olema null või rohkem, saadi {value}',
  'options.retryDelayMin': 'korduse viivitus peab olema null või rohkem, saadi {value}',
} satisfies Translation<'v4', 'et'>;
