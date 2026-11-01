/**
 * Namespace `decrypt`, čeština (cs), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/DecryptView.tsx, hooks/useOfflineDecrypt.ts, hooks/useSlotFileDecrypt.ts,
 * components/DetectionBox.tsx, components/FilePickerButton.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useOfflineDecrypt: the status line. */
  'status.noFile': 'Není vybrán žádný soubor.',
  'status.reading': 'Čtení souboru …',
  'status.notUsable': 'Nepoužitelný výpis.',
  'status.building': 'Sestavování archivu …',
  'status.nothingDecrypted':
    'Nebyl dešifrován žádný obraz — důvod najdete v protokolu. Manifest je ve stažených souborech.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Hotovo — dešifrováno slotů: {done}/{count}. Zkontrolujte stažené soubory.',
    few: 'Hotovo — dešifrováno slotů: {done}/{count}. Zkontrolujte stažené soubory.',
    many: 'Hotovo — dešifrováno slotů: {done}/{count}. Zkontrolujte stažené soubory.',
    other: 'Hotovo — dešifrováno slotů: {done}/{count}. Zkontrolujte stažené soubory.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Dešifrování výpisu, který už máte',
  'offline.description': 'Celý výpis paměti flash, dešifrovaný slot po slotu.',
  'offline.intro':
    'Krok 2 na kartě 4.x/Nano už dešifruje vše, co přečte, takže tohle potřebujete, jen pokud váš obraz paměti flash pochází odjinud — z dřívějšího běhu, z J-Linku nebo z programátoru SPI. Soubor se čte místně a nikdy se nenahrává. **Tato část funguje v každém prohlížeči**, včetně Safari a iOS, protože nepotřebuje přístup k USB.',
  'offline.actions': 'Akce offline dešifrování',
  'offline.choose': 'Vybrat soubor s výpisem…',
  'offline.panel': 'Offline dešifrování',
  'offline.detectedTitle': 'Zjištěná rodina firmwaru',
  'offline.detectedIntro':
    'Není připojena žádná kamera, takže se rodina hodnotí podle obrazů v samotném souboru. Klíč se v obou případech vypočte ze šifrovaného textu každého slotu; tímto se jen pojmenuje rodina firmwaru ve zprávě.',
  'offline.scoreBasis': 'podle obrazů v souboru',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Dešifrování slotu firmwaru',
  'slot.description': 'Jeden slot ze souboru: 64 KB, tak jak ho kamera ukládá.',
  'slot.intro':
    'Vyberte soubor, který obsahuje jeden slot firmwaru — 65 536 bajtů, tak jak ho uloží výpis slotu na kartě <link>{tab}</link>, nebo 64 KB z adresy slotu v celém výpisu paměti flash. Stránka najde klíč z vlastních bajtů slotu, dešifruje obraz a nabídne ho ke stažení; zobrazí přitom klíč, velikost a SHA-256. Nepoužívá se žádná kamera, takže to funguje, i když nic není připojeno.',
  'slot.refusedIntro':
    'Soubor, který není jedním slotem, neobsahuje obraz firmwaru nebo se nedá dešifrovat, je odmítnut s uvedením důvodu. U smazaného slotu se to oznámí a není co dešifrovat.',
  'slot.actions': 'Akce souboru slotu',
  'slot.choose': 'Vybrat soubor slotu…',
  'slot.decrypting': 'Dešifruje se {file} …',
  'slot.unreadable': 'Soubor nelze přečíst.',
  'slot.notDecrypted':
    'Nedešifrováno: {file} není slot firmwaru, který tato stránka umí dešifrovat.',
  'slot.nothingWritten':
    'Nikam se nic nezapsalo. Vyberte soubor slotu o velikosti 64 KB nebo celý výpis v části výše.',
  'slot.erased': '{file} je smazaný slot.',
  'slot.resultTitle': 'Dešifrovaný slot firmwaru',
  'slot.file': 'Soubor',
  'slot.fileSize': 'Velikost souboru',
  'slot.fileSha': 'SHA-256 souboru',
  'slot.imageVersion': 'Verze obrazu',
  'slot.imageSize': 'Velikost obrazu',
  'slot.imageSha': 'SHA-256 obrazu',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Kontrolní součet',
  'slot.notComputed': 'pro tuto podobu se nepočítá',
  'slot.family': 'Rodina',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (zjištěno z obrazu)',
  'slot.familyMismatch':
    '{name} — součet neodpovídá cílové hodnotě této rodiny, takže by bootloader obraz v tomto stavu nepřijal',
  'slot.unknown': 'neznámá',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': 'Klíč',
  'slot.keyPlain': 'žádný: slot obsahuje obraz v otevřené podobě (nešifrovaný řetězec z roku 2014)',
  'slot.keyFfB': 'Klíč B z dvojice 1.3.0.8 FF',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Uloženo jako',
  'slot.storedAsFfB': 'obraz XOR proud klíče B, okno hlavičky beze změny',
  'slot.keyNone': 'žádný',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Podoba klíče',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k} — samotný obraz obsahuje tuto podobu právě jednou, a tím ji určuje',
  'slot.keyFormDefault':
    '{k} — žádná podoba se v obrazu nevyskytuje právě jednou, proto je zobrazena výchozí podoba rodiny',
  'slot.resultActions': 'Akce dešifrovaného obrazu',
  'slot.download': 'Stáhnout {file}',
  'slot.downloadFallback': 'dešifrovaný obraz',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Zjištěno',
  'detection.score': 'Skóre',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} z 1, {basis}',
  'detection.readAs': 'Čteno jako',
  'detection.summary': 'Shrnutí',
  'detection.why': 'Proč:',
  'detection.ambiguous':
    '**Důkazy nerozhodly, o kterou rodinu jde.** Buď vítěz nedosáhl lepšího skóre než obecná záložní varianta, nebo se mu druhý v pořadí příliš přiblížil. Dešifrování to neovlivňuje — klíč se v obou případech vypočte ze šifrovaného textu — ale rodina uvedená ve zprávě a vše, co na ní závisí, je jen odhad.',
} satisfies Translation<'decrypt', 'cs'>;
