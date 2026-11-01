/**
 * Namespace `v4`, slovenščina (sl), translated from the English source.
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
  'status.starting': 'Zaganjanje …',
  'status.building': 'Sestavljanje arhiva …',
  'status.cancelling': 'Preklicevanje — shranjeno bo vse, kar je bilo doslej prebrano …',
  'status.refused': 'Zavrnjeno — nič ni bilo prebrano. Glejte sporočilo nad dnevnikom.',
  'status.sweepDone':
    'Končano — aktivirani selektorji: {armed}/{total}, s podatki: {withData}. Preverite prenesene datoteke.',
  'status.sweepDoneCancelled':
    'Končano — aktivirani selektorji: {armed}/{total}, s podatki: {withData} (preklicano). Preverite prenesene datoteke.',
  'status.dumpDone': 'Končano — prebrana okna: {read}/{expected}. Preverite prenesene datoteke.',
  'status.dumpDoneCancelled':
    'Končano — prebrana okna: {read}/{expected} (preklicano). Preverite prenesene datoteke.',
  'status.dumpDoneIncomplete':
    'Končano — prebrana okna: {read}/{expected} (nepopolno — glejte dnevnik). Preverite prenesene datoteke.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'Kamera se ne ujema z družino 4.x/Nano, ta zavihek pa bere samo to družino. Nič ni bilo prebrano. Za kamero 0.x ali 1.x (izdaje iz let 2014 ali 2016) uporabite „{tab}“.',
  'refusal.otherFamily':
    'Kamera je videti kot {name} ({id}), ne kot kamera 4.x/Nano, ta zavihek pa bere samo 4.x/Nano. Nič ni bilo prebrano. Za kamero 0.x ali 1.x (izdaje iz let 2014 ali 2016) uporabite „{tab}“.',
  'refusal.legacyLine':
    'Kamera poganja {version}, izdajo 0.x ali 1.x (iz leta 2014 ali 2016), ta zavihek pa bere samo 4.x/Nano. Razen različice ni bilo prebrano nič. Za kamero 0.x ali 1.x uporabite „{tab}“.',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Izpis',
  'dump.actions': 'Dejanja za izpis',
  'dump.start': 'Začni izpis',
  'dump.panel': 'Izpis',
  'dump.how':
    'Oba najprej vprašata kamero, katero vdelano programsko opremo poganja: njeno različico z `{getInfo}` — edinim branjem, na katero vsaka izdaja Seek odgovori enako — in, samo če je to izdajo mogoče brati prek USB, en navaden in en `{begin}` z žetonom ter eno samo branje. Tako stran ugotovi, katere družine je kamera. Ta zavihek bere samo družino 4.x in Nano. Kamera, ki jo odgovori uvrstijo kamor koli drugam, je zavrnjena, preden se karkoli prebere, stran pa navede zavihek zanjo. Kamera, ki ne sporoči svoje različice ali poganja izdajo, starejšo od 0.8.0.0, se sploh ne prebere, stran pa pove zakaj.',
  'dump.modes':
    '**Začni izpis** prebere vsak blok, ki ga doseže tabela selektorjev te izdaje. **Izpiši vse selektorje** v razdelku *Možnosti* spodaj preizkusi vsak selektor `{begin}` `{first}`–`{last}` in shrani, kar koli vrne — počasneje, a zajame tudi bloke, ki jih izbrani zemljevid preskoči.',
  'dump.sweep': 'Izpiši vse selektorje ({first}–{last})',
  'dump.sweepNote':
    'Preizkusi vsak selektor in shrani, kar koli vrne. Počasneje kot „Začni izpis“.',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'Kaj dobite',
  'output.intro': 'En prenos `{ext}`, ki vsebuje:',
  'output.caption': 'Datoteke v prenesenem arhivu',
  'output.file': 'Datoteka',
  'output.what': 'Kaj je to',
  'output.flash':
    'sestavljena slika 4 MB bliskovnega pomnilnika (zapolnitev vrzeli in odklepni žeton, če je bil uporabljen, sta v manifest.json)',
  'output.windows': 'vsak blok velikosti 64 KB natanko tak, kot je prišel po povezavi',
  'output.decrypted':
    'vsaka reža s sliko vdelane programske opreme, dešifrirana (če je bil najden ključ)',
  'output.reports':
    'poročilo za vsako režo: ključ, mesto ključa, družina in šifra, SP, vstopna točka, SHA-256',
  'output.manifest': 'natančni metapodatki branja, vrzeli in dešifriranja',
  'output.readme': 'kaj je ta zajem in kje so njegove meje',
  'output.keyFromDump':
    'Ključ se pridobi iz samega izpisa, zato datoteka s ključem ali skrivnost naprave ni potrebna.',
  'output.bestEffort':
    'Dešifriranje še vedno poteka po najboljših močeh. Če ključa ni mogoče najti — na primer pri enoti, katere zagonski nalagalnik izpelje ključ iz čipovega OTP, ki ga v izpisu bliskovnega pomnilnika ni — se ta reža preprosto preskoči, preostanek arhiva pa ostane nespremenjen.',
  'gap.summary': 'Vrzel na {address}',
  'gap.where':
    'Nabor ukazov USB ponuja selektor bralnega okna za vsak blok velikosti 64 KB v 4 MB bliskovnega pomnilnika razen za `{range}`. Ta blok je v združeni sliki zapolnjen z `{fill}` in zabeležen v `{manifest}`.',
  'gap.costs':
    '**V praksi vas to ne stane nič.** Pri večini kamer je ta blok preprosto izbrisan bliskovni pomnilnik, ki se tako ali tako bere kot `{fill}` — zato se polnilo ujema s tem, kar je dejansko tam, in slika je popolna.',
  'gap.redundant':
    'Kadar pa je blok *v uporabi*, je v njem odvečna kopija. Te kamere hranijo isto sliko vdelane programske opreme v več režah velikosti 64 KB: v vseh izpisih z več režami, preverjenih med izdelavo te strani, so se vse reže dešifrirale v bajt za bajtom enako vdelano programsko opremo — v enem primeru v štirih režah, ki so bile zapisane z dvema različnima ključema. Na edini enoti, pri kateri je bila na `{address}` prava slika, je bila ta bajt za bajtom enaka kopijama na `{before}` in `{after}`, zato arhiv to vdelano programsko opremo še vedno vsebuje, le prebrano z drugega naslova.',
  'gap.fine':
    'Ta odvečnost je tudi razlog, da je kamera, pri kateri se `{address}` prebere kot `{fill}`, v redu: zagonska vdelana programska oprema še vedno obstaja v drugih režah. Nič na tem zavihku tako ali tako ne piše v napravo — vrzel vpliva le na datoteko, ki jo prenesete.',
  'gap.complete':
    'Če želite strogo popolno sliko bajt za bajtom — na primer za primerjavo bliskovnega pomnilnika z referenco — jo preberite prek SWD/J-Link ali s programatorjem SPI.',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown':
    'Ni prebrano: kamera ni povedala, katero vdelano programsko opremo poganja.',
  'identity.unsupported': 'Ni prebrano: te kamere ni mogoče brati na ta način.',
  'identity.title': 'Zaznana kamera',
  'identity.firmware': 'Vdelana programska oprema',
  'identity.scoreBasis': 'iz odgovorov kamere, preden se prebere katera koli reža',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Možnosti',
  'options.subtitle': '— privzete vrednosti so pravilne; tukaj vam ni treba ničesar spreminjati.',
  'options.chunk': 'chunk (bajti na branje control-IN)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'gap-fill (bajt za zapolnitev vrzeli)',
  'options.retries': 'ponovitve na okno',
  'options.retryDelay': 'zakasnitev ponovitve (ms)',
  'options.recipient': 'recipient (prejemnik krmilnega prenosa)',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'samodejno',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'dešifriraj vdelano programsko opremo',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'da',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'ne',
  'options.help':
    '**chunk** je velikost vsakega branja control-IN, največ 64: en paket EP0. Pri daljšem branju lahko zagonski ROM kamere izgubi paket, ko kamera miruje pri nizki taktni frekvenci, zato se večja vrednost bere po 64 bajtov naenkrat; manjša se uporabi takšna, kot je, in če se kamera zatakne, stran sama zniža vrednost in nadaljuje. **gap-fill** je bajt, zapisan v edini blok velikosti 64 KB, ki ga USB ne doseže. **recipient** je privzeto interface in preklopi na device, če brskalnik ne more zasesti vmesnika 0 — vdelana programska oprema sprejme oboje.',
  'options.chunkRange': 'chunk mora biti med 1 in {max}, dobljeno {value}',
  'options.gapFillByte': 'gap-fill mora biti en sam bajt, dobljeno {value}',
  'options.retriesMin': 'število ponovitev mora biti nič ali več, dobljeno {value}',
  'options.retryDelayMin': 'zakasnitev ponovitve mora biti nič ali več, dobljeno {value}',
} satisfies Translation<'v4', 'sl'>;
