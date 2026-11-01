/**
 * Namespace `decrypt`, slovenčina (sk), translated from the English source.
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
  'status.noFile': 'Nie je vybraný žiadny súbor.',
  'status.reading': 'Číta sa súbor…',
  'status.notUsable': 'Nepoužiteľný výpis.',
  'status.building': 'Zostavuje sa archív…',
  'status.nothingDecrypted':
    'Nedešifroval sa žiadny obraz — dôvod nájdete v protokole. Manifest je v stiahnutých súboroch.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Hotovo — dešifrované sloty: {done}/{count}. Skontrolujte stiahnuté súbory.',
    few: 'Hotovo — dešifrované sloty: {done}/{count}. Skontrolujte stiahnuté súbory.',
    many: 'Hotovo — dešifrované sloty: {done}/{count}. Skontrolujte stiahnuté súbory.',
    other: 'Hotovo — dešifrované sloty: {done}/{count}. Skontrolujte stiahnuté súbory.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Dešifrovanie výpisu, ktorý už máte',
  'offline.description': 'Celý výpis pamäte flash, dešifrovaný slot po slote.',
  'offline.intro':
    'Krok 2 na karte 4.x/Nano už dešifruje všetko, čo prečíta, takže toto potrebujete, len ak váš obraz pamäte flash pochádza odinakiaľ — z predchádzajúceho behu, z J-Linku alebo z programátora SPI. Súbor sa číta lokálne a nikdy sa nenahráva. **Táto časť funguje v každom prehliadači**, vrátane Safari a iOS, pretože nepotrebuje prístup k USB.',
  'offline.actions': 'Akcie offline dešifrovania',
  'offline.choose': 'Vybrať súbor s výpisom…',
  'offline.panel': 'Offline dešifrovanie',
  'offline.detectedTitle': 'Zistená rodina firmvéru',
  'offline.detectedIntro':
    'Nie je pripojená žiadna kamera, takže sa rodina hodnotí podľa obrazov v samotnom súbore. Kľúč sa v oboch prípadoch vypočíta zo šifrovaného textu každého slotu; týmto sa len pomenuje rodina firmvéru v správe.',
  'offline.scoreBasis': 'podľa obrazov v súbore',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Dešifrovanie slotu firmvéru',
  'slot.description': 'Jeden slot zo súboru: 64 KB, tak ako ho kamera ukladá.',
  'slot.intro':
    'Vyberte súbor, ktorý obsahuje jeden slot firmvéru — 65 536 bajtov, tak ako ho uloží výpis slotu na karte <link>{tab}</link>, alebo 64 KB z adresy slotu v celom výpise pamäte flash. Stránka nájde kľúč z vlastných bajtov slotu, dešifruje obraz a ponúkne ho na stiahnutie; zobrazí pritom kľúč, veľkosť a SHA-256. Nepoužíva sa žiadna kamera, takže to funguje, aj keď nič nie je pripojené.',
  'slot.refusedIntro':
    'Súbor, ktorý nie je jedným slotom, neobsahuje obraz firmvéru alebo sa nedá dešifrovať, sa odmietne s uvedením dôvodu. Pri vymazanom slote sa to oznámi a nie je čo dešifrovať.',
  'slot.actions': 'Akcie súboru slotu',
  'slot.choose': 'Vybrať súbor slotu…',
  'slot.decrypting': 'Dešifruje sa {file}…',
  'slot.unreadable': 'Súbor sa nedá prečítať.',
  'slot.notDecrypted':
    'Nedešifrované: {file} nie je slot firmvéru, ktorý táto stránka vie dešifrovať.',
  'slot.nothingWritten':
    'Nikam sa nič nezapísalo. Vyberte súbor slotu s veľkosťou 64 KB alebo celý výpis v časti vyššie.',
  'slot.erased': '{file} je vymazaný slot.',
  'slot.resultTitle': 'Dešifrovaný slot firmvéru',
  'slot.file': 'Súbor',
  'slot.fileSize': 'Veľkosť súboru',
  'slot.fileSha': 'SHA-256 súboru',
  'slot.imageVersion': 'Verzia obrazu',
  'slot.imageSize': 'Veľkosť obrazu',
  'slot.imageSha': 'SHA-256 obrazu',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Kontrolný súčet',
  'slot.notComputed': 'pre túto podobu sa nepočíta',
  'slot.family': 'Rodina',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (zistené z obrazu)',
  'slot.familyMismatch':
    '{name} — súčet nezodpovedá cieľovej hodnote tejto rodiny, takže by bootloader obraz v tomto stave neprijal',
  'slot.unknown': 'neznáma',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': 'Kľúč',
  'slot.keyPlain':
    'žiadny: slot obsahuje obraz v otvorenej podobe (nešifrovaný reťazec z roku 2014)',
  'slot.keyFfB': 'Kľúč B z dvojice 1.3.0.8 FF',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Uložené ako',
  'slot.storedAsFfB': 'obraz XOR prúd kľúča B, okno hlavičky bez zmeny',
  'slot.keyNone': 'žiadny',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Podoba kľúča',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k} — samotný obraz obsahuje túto podobu práve raz, a tým ju určuje',
  'slot.keyFormDefault':
    '{k} — žiadna podoba sa v obraze nevyskytuje práve raz, preto sa zobrazuje predvolená podoba rodiny',
  'slot.resultActions': 'Akcie dešifrovaného obrazu',
  'slot.download': 'Stiahnuť {file}',
  'slot.downloadFallback': 'dešifrovaný obraz',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Zistené',
  'detection.score': 'Skóre',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} z 1, {basis}',
  'detection.readAs': 'Čítané ako',
  'detection.summary': 'Zhrnutie',
  'detection.why': 'Prečo:',
  'detection.ambiguous':
    '**Dôkazy nerozhodli, o ktorú rodinu ide.** Buď víťaz nedosiahol lepšie skóre ako všeobecná záložná možnosť, alebo sa mu druhý v poradí príliš priblížil. Dešifrovanie to neovplyvňuje — kľúč sa v oboch prípadoch vypočíta zo šifrovaného textu — ale rodina uvedená v správe a všetko, čo od nej závisí, je len odhad.',
} satisfies Translation<'decrypt', 'sk'>;
