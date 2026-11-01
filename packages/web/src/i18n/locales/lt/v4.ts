/**
 * Namespace `v4`, lietuvių (lt), translated from the English source.
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
  'status.starting': 'Pradedama…',
  'status.building': 'Kuriamas archyvas…',
  'status.cancelling': 'Atšaukiama — bus išsaugota tai, kas jau nuskaityta…',
  'status.refused': 'Atmesta — nieko nenuskaityta. Žr. pranešimą virš žurnalo.',
  'status.sweepDone':
    'Baigta — aktyvuota selektorių: {armed}/{total}, su duomenimis: {withData}. Patikrinkite atsisiuntimus.',
  'status.sweepDoneCancelled':
    'Baigta — aktyvuota selektorių: {armed}/{total}, su duomenimis: {withData} (atšaukta). Patikrinkite atsisiuntimus.',
  'status.dumpDone': 'Baigta — nuskaityta langų: {read}/{expected}. Patikrinkite atsisiuntimus.',
  'status.dumpDoneCancelled':
    'Baigta — nuskaityta langų: {read}/{expected} (atšaukta). Patikrinkite atsisiuntimus.',
  'status.dumpDoneIncomplete':
    'Baigta — nuskaityta langų: {read}/{expected} (nepilnai — žr. žurnalą). Patikrinkite atsisiuntimus.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'Kamera neatitiko 4.x/Nano šeimos, o šis skirtukas skaito tik šią šeimą. Niekas nenuskaityta. 0.x arba 1.x kamerai (2014 ar 2016 m. leidimai) naudokite skirtuką „{tab}“.',
  'refusal.otherFamily':
    'Kamera panaši į {name} ({id}), ne į 4.x/Nano kamerą, o šis skirtukas skaito tik 4.x/Nano. Niekas nenuskaityta. 0.x arba 1.x kamerai (2014 ar 2016 m. leidimai) naudokite skirtuką „{tab}“.',
  'refusal.legacyLine':
    'Kamera vykdo {version} — 0.x arba 1.x leidimą (2014 ar 2016 m.), o šis skirtukas skaito tik 4.x/Nano. Nuskaityta tik versija. 0.x arba 1.x kamerai naudokite skirtuką „{tab}“.',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Nuskaitymas',
  'dump.actions': 'Nuskaitymo veiksmai',
  'dump.start': 'Pradėti nuskaitymą',
  'dump.panel': 'Nuskaitymas',
  'dump.how':
    'Abu mygtukai pirmiausia paklausia kameros, kokią mikroprogramą ji vykdo: jos versijos — su `{getInfo}`, vieninteliu skaitymu, į kurį kiekvienas Seek leidimas atsako vienodai, — ir, tik jei tą leidimą galima nuskaityti per USB, siunčia vieną paprastą ir vieną žetoną turintį `{begin}` bei vieną skaitymą. Taip puslapis nustato, kuriai šeimai priklauso kamera. Šis skirtukas skaito tik 4.x ir Nano šeimą. Kamera, kurią atsakymai priskiria kitur, atmetama dar prieš ką nors nuskaitant, o puslapis nurodo jai skirtą skirtuką. Kamera, kuri nenurodo savo versijos arba vykdo senesnį nei 0.8.0.0 leidimą, visai neskaitoma, ir puslapis paaiškina kodėl.',
  'dump.modes':
    '**Pradėti nuskaitymą** nuskaito kiekvieną bloką, kurį pasiekia paties leidimo selektorių lentelė. **Nuskaityti visus selektorius** (žemiau, skiltyje *Parinktys*) išbando kiekvieną `{begin}` selektorių `{first}`–`{last}` ir išsaugo viską, ką kiekvienas grąžina — lėčiau, bet taip užfiksuojami ir blokai, kuriuos atrinktas žemėlapis praleidžia.',
  'dump.sweep': 'Nuskaityti visus selektorius ({first}–{last})',
  'dump.sweepNote':
    'Išbando kiekvieną selektorių ir išsaugo viską, ką kiekvienas grąžina. Lėčiau nei „Pradėti nuskaitymą“.',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'Ką gausite',
  'output.intro': 'Vienas atsisiunčiamas `{ext}` failas, kuriame yra:',
  'output.caption': 'Atsisiųsto archyvo failai',
  'output.file': 'Failas',
  'output.what': 'Kas tai yra',
  'output.flash':
    'sujungtas 4 MB flash atminties atvaizdas (tarpo užpildas ir atrakinimo žetonas, jei jis naudotas, nurodyti manifest.json)',
  'output.windows': 'kiekvienas 64 KB blokas lygiai toks, koks atėjo per USB',
  'output.decrypted': 'kiekvienas mikroprogramos atvaizdo lizdas, iššifruotas (jei rastas raktas)',
  'output.reports':
    'kiekvieno lizdo ataskaita: raktas, rakto vieta, šeima ir šifras, SP, įėjimo taškas, SHA-256',
  'output.manifest': 'tikslūs skaitymo, tarpų ir iššifravimo metaduomenys',
  'output.readme': 'kas yra šis įrašas ir kokie jo apribojimai',
  'output.keyFromDump':
    'Raktas atkuriamas iš pačios išklotinės, todėl rakto failo ar įrenginio paslapties nereikia.',
  'output.bestEffort':
    'Iššifruojama tiek, kiek įmanoma. Jei raktas nerandamas — pavyzdžiui, įrenginyje, kurio paleidyklė raktą gauna iš lusto OTP, o jo flash atminties išklotinėje nėra, — tas lizdas tiesiog praleidžiamas, o likusi archyvo dalis nepaveikiama.',
  'gap.summary': 'Tarpas ties {address}',
  'gap.where':
    'USB komandų rinkinys turi skaitymo lango selektorių kiekvienam 4 MB flash atminties 64 KB blokui, išskyrus `{range}`. Sujungtame atvaizde tas blokas užpildomas `{fill}`, o tai užfiksuojama `{manifest}`.',
  'gap.costs':
    '**Praktiškai tai jums nieko nekainuoja.** Daugumoje kamerų tas blokas yra tiesiog ištrinta flash atmintis, kuri ir taip skaitoma kaip `{fill}` — taigi užpildas atitinka tai, kas ten iš tikrųjų yra, ir atvaizdas yra pilnas.',
  'gap.redundant':
    'O kai blokas *yra* naudojamas, jame laikoma perteklinė kopija. Šios kameros tą patį mikroprogramos atvaizdą laiko keliuose 64 KB lizduose: visose kelių lizdų išklotinėse, patikrintose kuriant šį puslapį, visi lizdai buvo iššifruoti į baitas į baitą identišką mikroprogramą — vienu atveju net keturi lizdai, įrašyti dviem skirtingais raktais. Vieninteliame matytame įrenginyje su tikru atvaizdu adresu `{address}` jis baitas į baitą sutapo su kopijomis adresais `{before}` ir `{after}`, todėl archyve ta mikroprograma vis tiek yra, tik nuskaityta iš kito adreso.',
  'gap.fine':
    'Dėl to paties pertekliškumo kamera, kurios `{address}` skaitomas kaip `{fill}`, yra tvarkinga: paleidžiama mikroprograma vis tiek yra kituose lizduose. Šiame skirtuke niekas jokiu atveju nerašo į įrenginį — tarpas paveikia tik atsisiunčiamą failą.',
  'gap.complete':
    'Jei vis dėlto norite griežtai pilno, baitas į baitą tikslaus atvaizdo — pavyzdžiui, palyginti flash atmintį su etalonu, — nuskaitykite ją per SWD/J-Link arba SPI programatoriumi.',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': 'Nenuskaityta: kamera nenurodė, kokią mikroprogramą vykdo.',
  'identity.unsupported': 'Nenuskaityta: šios kameros taip nuskaityti negalima.',
  'identity.title': 'Aptikta kamera',
  'identity.firmware': 'Mikroprograma',
  'identity.scoreBasis': 'pagal kameros atsakymus, prieš nuskaitant bet kurį lizdą',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Parinktys',
  'options.subtitle': '— numatytosios reikšmės teisingos; čia nieko keisti nereikia.',
  'options.chunk': 'chunk (control-IN baitai)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'gap-fill baitas',
  'options.retries': 'pakartojimai vienam langui',
  'options.retryDelay': 'pakartojimo delsa (ms)',
  'options.recipient': 'valdymo perdavimo recipient',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'auto',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'iššifruoti mikroprogramą',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'taip',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'ne',
  'options.help':
    '**chunk** — kiekvieno control-IN skaitymo dydis, ne daugiau kaip 64: vienas EP0 paketas. Skaitant ilgiau, kameros paleidimo ROM gali prarasti paketą, kai kamera laukia veikdama žemu taktu, todėl didesnė reikšmė skaitoma po 64 baitus; mažesnė naudojama tokia, kokia nurodyta, o jei kamera užstringa, puslapis pats sumažina reikšmę ir tęsia. **gap-fill** — baitas, įrašomas į vienintelį 64 KB bloką, kurio USB nepasiekia. **recipient** pagal numatymą yra interface, o jei naršyklė negali užimti sąsajos 0, naudojamas device — mikroprograma priima abu.',
  'options.chunkRange': 'chunk turi būti nuo 1 iki {max}, gauta {value}',
  'options.gapFillByte': 'gap-fill turi būti vienas baitas, gauta {value}',
  'options.retriesMin': 'pakartojimų turi būti nulis arba daugiau, gauta {value}',
  'options.retryDelayMin': 'pakartojimo delsa turi būti nulis arba daugiau, gauta {value}',
} satisfies Translation<'v4', 'lt'>;
