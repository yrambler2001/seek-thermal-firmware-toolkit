/**
 * Namespace `v4`, slovenčina (sk), translated from the English source.
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
  'status.starting': 'Spúšťa sa…',
  'status.building': 'Zostavuje sa archív…',
  'status.cancelling': 'Ruší sa — uloží sa všetko, čo sa doteraz prečítalo…',
  'status.refused': 'Odmietnuté — nič sa nečítalo. Pozrite si správu nad protokolom.',
  'status.sweepDone':
    'Hotovo — aktivované selektory: {armed}/{total}, s údajmi: {withData}. Skontrolujte stiahnuté súbory.',
  'status.sweepDoneCancelled':
    'Hotovo — aktivované selektory: {armed}/{total}, s údajmi: {withData} (zrušené). Skontrolujte stiahnuté súbory.',
  'status.dumpDone': 'Hotovo — prečítané okná: {read}/{expected}. Skontrolujte stiahnuté súbory.',
  'status.dumpDoneCancelled':
    'Hotovo — prečítané okná: {read}/{expected} (zrušené). Skontrolujte stiahnuté súbory.',
  'status.dumpDoneIncomplete':
    'Hotovo — prečítané okná: {read}/{expected} (neúplné — pozrite si protokol). Skontrolujte stiahnuté súbory.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'Kamera nezodpovedá rodine 4.x/Nano a táto karta číta len túto rodinu. Nič sa nečítalo. Pre kameru 0.x alebo 1.x (zostavy z rokov 2014 alebo 2016) použite kartu „{tab}“.',
  'refusal.otherFamily':
    'Kamera vyzerá ako {name} ({id}), nie ako kamera 4.x/Nano, a táto karta číta len 4.x/Nano. Nič sa nečítalo. Pre kameru 0.x alebo 1.x (zostavy z rokov 2014 alebo 2016) použite kartu „{tab}“.',
  'refusal.legacyLine':
    'Kamera používa {version}, zostavu 0.x alebo 1.x (2014 alebo 2016), a táto karta číta len 4.x/Nano. Okrem verzie sa nič nečítalo. Pre kameru 0.x alebo 1.x použite kartu „{tab}“.',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Výpis',
  'dump.actions': 'Akcie výpisu',
  'dump.start': 'Spustiť výpis',
  'dump.panel': 'Výpis',
  'dump.how':
    'Oba spôsoby sa najprv kamery opýtajú, aký firmvér v nej beží: na verziu pomocou `{getInfo}` — jediného čítania, na ktoré odpovedá každá zostava Seek rovnako — a len ak sa dá táto zostava čítať cez USB, ešte jedným obyčajným a jedným `{begin}` s tokenom a jedným čítaním. Tak stránka zistí, do ktorej rodiny kamera patrí. Táto karta číta len rodinu 4.x a Nano. Kamera, ktorú odpovede zaradia kamkoľvek inam, sa odmietne skôr, než sa čokoľvek prečíta, a stránka uvedie kartu, ktorá je pre ňu. Kamera, ktorá nenahlási svoju verziu alebo používa zostavu staršiu ako 0.8.0.0, sa nečíta vôbec a stránka povie prečo.',
  'dump.modes':
    '**Spustiť výpis** prečíta každý blok, na ktorý dosiahne tabuľka selektorov danej zostavy. **Vypísať všetky selektory** v časti *Možnosti* nižšie vyskúša každý selektor `{begin}` `{first}`–`{last}` a uloží všetko, čo ktorý vráti — pomalšie, ale zachytí aj bloky, ktoré vybraná mapa vynecháva.',
  'dump.sweep': 'Vypísať všetky selektory ({first}–{last})',
  'dump.sweepNote':
    'Vyskúša každý selektor a uloží všetko, čo ktorý vráti. Pomalšie ako „Spustiť výpis“.',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'Čo dostanete',
  'output.intro': 'Jeden stiahnutý súbor `{ext}`, ktorý obsahuje:',
  'output.caption': 'Súbory v stiahnutom archíve',
  'output.file': 'Súbor',
  'output.what': 'Čo to je',
  'output.flash':
    'zostavený obraz pamäte flash s veľkosťou 4 MB (výplň medzery a odomykací token, ak bol použitý, sú v manifest.json)',
  'output.windows': 'každý blok s veľkosťou 64 KB presne tak, ako prišiel z kamery',
  'output.decrypted': 'každý slot s obrazom firmvéru, dešifrovaný (ak sa našiel kľúč)',
  'output.reports':
    'správa ku každému slotu: kľúč, umiestnenie kľúča, rodina a šifra, SP, vstupný bod, SHA-256',
  'output.manifest': 'presné metadáta čítania, medzery a dešifrovania',
  'output.readme': 'čo záznam obsahuje a aké má obmedzenia',
  'output.keyFromDump':
    'Kľúč sa získa zo samotného výpisu, takže nie je potrebný žiadny súbor s kľúčom ani tajomstvo zariadenia.',
  'output.bestEffort':
    'Dešifrovanie je napriek tomu len pokus bez záruky. Ak sa kľúč nenájde — napríklad pri kuse, ktorého bootloader odvodzuje kľúč z OTP čipu, ktorá vo výpise pamäte flash nie je — ten slot sa jednoducho preskočí a zvyšku archívu sa to nedotkne.',
  'gap.summary': 'Medzera na adrese {address}',
  'gap.where':
    'Sada príkazov USB ponúka selektor okna čítania pre každý blok s veľkosťou 64 KB zo 4 MB pamäte flash okrem `{range}`. Tento blok je v spojenom obraze vyplnený hodnotou `{fill}` a zaznamenaný v `{manifest}`.',
  'gap.costs':
    '**V praxi vás to nič nestojí.** Na väčšine kamier je tento blok jednoducho vymazaná pamäť flash, ktorá sa aj tak číta ako `{fill}` — výplň teda zodpovedá tomu, čo tam skutočne je, a obraz je úplný.',
  'gap.redundant':
    'A keď sa blok *používa*, obsahuje nadbytočnú kópiu. Tieto kamery uchovávajú rovnaký obraz firmvéru v niekoľkých slotoch s veľkosťou 64 KB: vo všetkých výpisoch s viacerými slotmi, ktoré sa pri vývoji tejto stránky kontrolovali, sa všetky sloty dešifrovali na bajtovo zhodný firmvér — v jednom prípade v štyroch slotoch zapísaných dvoma rôznymi kľúčmi. Na jedinom kuse, ktorý mal na `{address}` skutočný obraz, bol bajt po bajte rovnaký ako kópie na `{before}` a `{after}`, takže archív tento firmvér stále obsahuje, len prečítaný z inej adresy.',
  'gap.fine':
    'Vďaka tejto nadbytočnosti je tiež v poriadku kamera, ktorej `{address}` sa číta ako `{fill}`: spustiteľný firmvér stále existuje v ostatných slotoch. Na tejto karte sa do zariadenia v žiadnom prípade nič nezapisuje — medzera sa týka len súboru, ktorý stiahnete.',
  'gap.complete':
    'Ak naozaj chcete striktne úplný obraz bajt po bajte — napríklad na porovnanie pamäte flash s referenciou — prečítajte ju cez SWD/J-Link alebo programátorom SPI.',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': 'Neprečítané: kamera nepovedala, aký firmvér v nej beží.',
  'identity.unsupported': 'Neprečítané: túto kameru nie je možné týmto spôsobom prečítať.',
  'identity.title': 'Zistená kamera',
  'identity.firmware': 'Firmvér',
  'identity.scoreBasis': 'podľa odpovedí kamery, ešte pred čítaním akéhokoľvek slotu',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Možnosti',
  'options.subtitle': '— predvolené hodnoty sú správne; nič tu meniť nemusíte.',
  'options.chunk': 'chunk (bajty control-IN)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'bajt gap-fill',
  'options.retries': 'opakovania na okno',
  'options.retryDelay': 'oneskorenie pred opakovaním (ms)',
  'options.recipient': 'recipient riadiaceho prenosu',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'automaticky',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'dešifrovať firmvér',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'áno',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'nie',
  'options.help':
    '**chunk** je veľkosť každého čítania control-IN, najviac 64: jeden paket EP0. Pri dlhšom čítaní môže boot ROM kamery stratiť paket, keď kamera nečinne beží s nízkym taktom, takže väčšia hodnota sa číta po 64 bajtoch; menšia sa použije tak, ako je, a ak sa kamera zasekne, stránka sama zníži hodnotu a pokračuje. **gap-fill** je bajt zapísaný do jediného bloku s veľkosťou 64 KB, na ktorý USB nedosiahne. **recipient** je predvolene interface a prejde na device, ak prehliadač nemôže vyhradiť rozhranie 0 — firmvér prijíma oboje.',
  'options.chunkRange': 'chunk musí byť v rozsahu 1 až {max}, zadané {value}',
  'options.gapFillByte': 'gap-fill musí byť jeden bajt, zadané {value}',
  'options.retriesMin': 'počet opakovaní musí byť nula alebo viac, zadané {value}',
  'options.retryDelayMin': 'oneskorenie pred opakovaním musí byť nula alebo viac, zadané {value}',
} satisfies Translation<'v4', 'sk'>;
