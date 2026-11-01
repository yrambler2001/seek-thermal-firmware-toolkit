/**
 * Namespace `v4`, čeština (cs), translated from the English source.
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
  'status.starting': 'Spouští se …',
  'status.building': 'Sestavování archivu …',
  'status.cancelling': 'Ruší se — uloží se vše, co se dosud přečetlo …',
  'status.refused': 'Odmítnuto — nic se nečetlo. Viz zpráva nad protokolem.',
  'status.sweepDone':
    'Hotovo — aktivované selektory: {armed}/{total}, s daty: {withData}. Zkontrolujte stažené soubory.',
  'status.sweepDoneCancelled':
    'Hotovo — aktivované selektory: {armed}/{total}, s daty: {withData} (zrušeno). Zkontrolujte stažené soubory.',
  'status.dumpDone': 'Hotovo — přečtená okna: {read}/{expected}. Zkontrolujte stažené soubory.',
  'status.dumpDoneCancelled':
    'Hotovo — přečtená okna: {read}/{expected} (zrušeno). Zkontrolujte stažené soubory.',
  'status.dumpDoneIncomplete':
    'Hotovo — přečtená okna: {read}/{expected} (neúplné — viz protokol). Zkontrolujte stažené soubory.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'Kamera neodpovídá rodině 4.x/Nano a tato karta čte jen tuto rodinu. Nic se nečetlo. Pro kameru 0.x nebo 1.x (sestavení z let 2014 nebo 2016) použijte kartu „{tab}“.',
  'refusal.otherFamily':
    'Kamera vypadá jako {name} ({id}), ne jako kamera 4.x/Nano, a tato karta čte jen 4.x/Nano. Nic se nečetlo. Pro kameru 0.x nebo 1.x (sestavení z let 2014 nebo 2016) použijte kartu „{tab}“.',
  'refusal.legacyLine':
    'Kamera používá {version}, sestavení 0.x nebo 1.x (2014 nebo 2016), a tato karta čte jen 4.x/Nano. Kromě verze se nic nečetlo. Pro kameru 0.x nebo 1.x použijte kartu „{tab}“.',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Výpis',
  'dump.actions': 'Akce výpisu',
  'dump.start': 'Spustit výpis',
  'dump.panel': 'Výpis',
  'dump.how':
    'Oba se nejdřív kamery zeptají, jaký firmware v ní běží: na verzi pomocí `{getInfo}` — jediného čtení, na které odpovídá každé sestavení Seek stejně — a jen pokud lze toto sestavení číst přes USB, ještě jedním prostým a jedním `{begin}` s tokenem a jedním čtením. Tak stránka pozná, do které rodiny kamera patří. Tato karta čte jen rodinu 4.x a Nano. Kamera, kterou odpovědi zařadí kamkoli jinam, je odmítnuta dřív, než se cokoli přečte, a stránka uvede kartu, která je pro ni. Kamera, která nenahlásí svou verzi nebo používá sestavení starší než 0.8.0.0, se nečte vůbec a stránka řekne proč.',
  'dump.modes':
    '**Spustit výpis** přečte každý blok, na který dosáhne tabulka selektorů daného sestavení. **Vyčíst všechny selektory** v části *Možnosti* níže vyzkouší každý selektor `{begin}` `{first}`–`{last}` a uloží vše, co který vrátí — pomaleji, ale zachytí i bloky, které vybraná mapa vynechává.',
  'dump.sweep': 'Vyčíst všechny selektory ({first}–{last})',
  'dump.sweepNote':
    'Vyzkouší každý selektor a uloží vše, co který vrátí. Pomalejší než „Spustit výpis“.',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'Co dostanete',
  'output.intro': 'Jeden stažený soubor `{ext}`, který obsahuje:',
  'output.caption': 'Soubory ve staženém archivu',
  'output.file': 'Soubor',
  'output.what': 'Co to je',
  'output.flash':
    'sestavený obraz paměti flash o velikosti 4 MB (výplň mezery a odemykací token, pokud byl použit, jsou v manifest.json)',
  'output.windows': 'každý blok o velikosti 64 KB přesně tak, jak přišel z kamery',
  'output.decrypted': 'každý slot s obrazem firmwaru, dešifrovaný (pokud se našel klíč)',
  'output.reports':
    'zpráva ke každému slotu: klíč, umístění klíče, rodina a šifra, SP, vstupní bod, SHA-256',
  'output.manifest': 'přesná metadata čtení, mezery a dešifrování',
  'output.readme': 'co záznam obsahuje a jaká má omezení',
  'output.keyFromDump':
    'Klíč se získá ze samotného výpisu, takže není potřeba žádný soubor s klíčem ani tajemství zařízení.',
  'output.bestEffort':
    'Dešifrování je přesto jen pokus bez záruky. Pokud se klíč nenajde — například u kusu, jehož bootloader odvozuje klíč z OTP čipu, která ve výpisu paměti flash není — ten slot se jednoduše přeskočí a zbytku archivu se to nedotkne.',
  'gap.summary': 'Mezera na adrese {address}',
  'gap.where':
    'Sada příkazů USB nabízí selektor okna čtení pro každý blok o velikosti 64 KB ze 4 MB paměti flash kromě `{range}`. Tento blok je ve spojeném obrazu vyplněn hodnotou `{fill}` a zaznamenán v `{manifest}`.',
  'gap.costs':
    '**V praxi vás to nic nestojí.** Na většině kamer je tento blok prostě smazaná paměť flash, která se stejně čte jako `{fill}` — výplň tedy odpovídá tomu, co tam skutečně je, a obraz je úplný.',
  'gap.redundant':
    'A když se blok *používá*, obsahuje nadbytečnou kopii. Tyto kamery uchovávají stejný obraz firmwaru v několika slotech o velikosti 64 KB: ve všech výpisech s více sloty, které se při vývoji této stránky kontrolovaly, se všechny sloty dešifrovaly na bajtově shodný firmware — v jednom případě ve čtyřech slotech zapsaných dvěma různými klíči. Na jediném kusu, který měl na `{address}` skutečný obraz, byl bajt po bajtu stejný jako kopie na `{before}` a `{after}`, takže archiv tento firmware stále obsahuje, jen přečtený z jiné adresy.',
  'gap.fine':
    'Díky této nadbytečnosti je také v pořádku kamera, jejíž `{address}` se čte jako `{fill}`: spustitelný firmware stále existuje v ostatních slotech. Na této kartě se do zařízení v žádném případě nic nezapisuje — mezera se týká jen souboru, který stáhnete.',
  'gap.complete':
    'Pokud opravdu chcete striktně úplný obraz bajt po bajtu — třeba pro porovnání paměti flash s referencí — přečtěte ji přes SWD/J-Link nebo programátorem SPI.',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': 'Nepřečteno: kamera neřekla, jaký firmware v ní běží.',
  'identity.unsupported': 'Nepřečteno: tuto kameru nelze tímto způsobem přečíst.',
  'identity.title': 'Zjištěná kamera',
  'identity.firmware': 'Firmware',
  'identity.scoreBasis': 'podle odpovědí kamery, ještě před čtením jakéhokoli slotu',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Možnosti',
  'options.subtitle': '— výchozí hodnoty jsou správné; nic zde měnit nemusíte.',
  'options.chunk': 'chunk (bajty control-IN)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'bajt gap-fill',
  'options.retries': 'opakování na okno',
  'options.retryDelay': 'prodleva před opakováním (ms)',
  'options.recipient': 'recipient řídicího přenosu',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'automaticky',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'dešifrovat firmware',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'ano',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'ne',
  'options.help':
    '**chunk** je velikost každého čtení control-IN, nejvýš 64: jeden paket EP0. Při delším čtení může boot ROM kamery ztratit paket, když kamera běží nečinně s nízkým taktem, takže větší hodnota se čte po 64 bajtech; menší se použije, jak je, a pokud se kamera zasekne, stránka sama sníží hodnotu a pokračuje. **gap-fill** je bajt zapsaný do jediného bloku o velikosti 64 KB, na který USB nedosáhne. **recipient** je ve výchozím stavu interface a přejde na device, pokud prohlížeč nemůže zabrat rozhraní 0 — firmware přijímá obojí.',
  'options.chunkRange': 'chunk musí být v rozsahu 1 až {max}, zadáno {value}',
  'options.gapFillByte': 'gap-fill musí být jeden bajt, zadáno {value}',
  'options.retriesMin': 'počet opakování musí být nula nebo víc, zadáno {value}',
  'options.retryDelayMin': 'prodleva před opakováním musí být nula nebo víc, zadáno {value}',
} satisfies Translation<'v4', 'cs'>;
