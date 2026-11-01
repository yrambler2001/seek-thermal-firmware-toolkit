/**
 * Namespace `decrypt`, magyar (hu), translated from the English source.
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
  'status.noFile': 'Nincs kiválasztott fájl.',
  'status.reading': 'Fájl olvasása…',
  'status.notUsable': 'Nem használható memóriakép.',
  'status.building': 'Archívum összeállítása…',
  'status.nothingDecrypted':
    'Egyetlen lemezkép sem lett visszafejtve – az okát lásd a naplóban. A manifest a letöltések között van.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Kész – {done}/{count} slot visszafejtve. Nézze meg a letöltéseit.',
    other: 'Kész – {done}/{count} slot visszafejtve. Nézze meg a letöltéseit.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Meglévő memóriakép visszafejtése',
  'offline.description': 'Egy teljes flash-memóriakép, slotonként visszafejtve.',
  'offline.intro':
    'A 4.x/Nano fül 2. lépése már mindent visszafejt, amit kiolvas, így erre csak akkor van szüksége, ha a flash-memóriakép máshonnan származik – egy korábbi futtatásból, J-Linkről vagy SPI-programozóból. A fájlt helyben olvassa be, és sosem tölti fel. **Ez a rész minden böngészőben működik**, a Safariban és iOS-en is, mert nem kell hozzá USB-hozzáférés.',
  'offline.actions': 'Offline visszafejtési műveletek',
  'offline.choose': 'Memóriakép kiválasztása…',
  'offline.panel': 'Offline visszafejtés',
  'offline.detectedTitle': 'Felismert firmware-család',
  'offline.detectedIntro':
    'Nincs csatlakoztatott kamera, ezért a családot magukból a fájlban lévő lemezképekből pontozza. A kulcsot így is, úgy is az egyes slotok titkosított szövegéből fejti meg; ez csak a jelentésben szereplő firmware-családot határozza meg.',
  'offline.scoreBasis': 'a fájlban lévő lemezképek alapján',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Firmware-slot visszafejtése',
  'slot.description': 'Egy slot fájlból: 64 KB, ahogy a kamera tárolja.',
  'slot.intro':
    'Válasszon egy fájlt, amely egyetlen firmware-slotot tartalmaz – egy slotot, 65 536 bájtot, ahogy a(z) <link>{tab}</link> fülön a slot kiolvasása menti, vagy egy teljes flash-memóriaképből egy slot címén kezdődő 64 KB-ot. Az oldal a slot saját bájtjaiból találja meg a kulcsot, visszafejti a lemezképet, és letöltésre kínálja; a kulcs, a méret és az SHA-256 is megjelenik. Nem használ kamerát, így semmit sem kell csatlakoztatni.',
  'slot.refusedIntro':
    'Az olyan fájlt, amely nem egy slot, nem tartalmaz firmware-lemezképet, vagy nem fejthető vissza, az oldal az ok megnevezésével elutasítja. Egy törölt slotról ezt közli, és nincs mit visszafejteni.',
  'slot.actions': 'Slotfájl-műveletek',
  'slot.choose': 'Slotfájl kiválasztása…',
  'slot.decrypting': 'Visszafejtés: {file}…',
  'slot.unreadable': 'A fájl nem olvasható.',
  'slot.notDecrypted':
    'Nincs visszafejtve: {file} – ez nem olyan firmware-slot, amelyet ez az oldal vissza tud fejteni.',
  'slot.nothingWritten':
    'Semmi sem lett sehová írva. Válasszon egy 64 KB-os slotfájlt, vagy egy teljes memóriaképet a fenti részben.',
  'slot.erased': '{file}: törölt slot.',
  'slot.resultTitle': 'Visszafejtett firmware-slot',
  'slot.file': 'Fájl',
  'slot.fileSize': 'Fájlméret',
  'slot.fileSha': 'A fájl SHA-256 értéke',
  'slot.imageVersion': 'A lemezkép verziója',
  'slot.imageSize': 'A lemezkép mérete',
  'slot.imageSha': 'A lemezkép SHA-256 értéke',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Elfogadási összeg',
  'slot.notComputed': 'ennél a formánál nincs kiszámítva',
  'slot.family': 'Család',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (a lemezképből felismerve)',
  'slot.familyMismatch':
    '{name} – az összeg nem egyezik ennek a családnak az elfogadási céljával, így a bootloader ebben a formában nem fogadná el a lemezképet',
  'slot.unknown': 'ismeretlen',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': 'Kulcs',
  'slot.keyPlain':
    'nincs: a slot titkosítatlanul tárolja a lemezképet (a 2014-es titkosítatlan lánc)',
  'slot.keyFfB': 'az 1.3.0.8 FF kulcspár B-kulcsa',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Tárolás módja',
  'slot.storedAsFfB': 'a lemezkép XOR a B-kulcs kulcsfolyama, a fejlécablak változatlanul',
  'slot.keyNone': 'nincs',
  'slot.keyNamed': '{key} – {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Kulcsforma',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k} – ez a forma pontosan egyszer fordul elő a lemezképben, ez azonosítja',
  'slot.keyFormDefault':
    '{k} – egyik forma sem fordul elő pontosan egyszer a lemezképben, ezért a család alapértelmezése látható',
  'slot.resultActions': 'Műveletek a visszafejtett lemezképpel',
  'slot.download': 'Letöltés: {file}',
  'slot.downloadFallback': 'a visszafejtett lemezkép',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Felismert',
  'detection.score': 'Pontszám',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} / 1.00, {basis}',
  'detection.readAs': 'Olvasás mint',
  'detection.summary': 'Összegzés',
  'detection.why': 'Indoklás:',
  'detection.ambiguous':
    '**A jelek alapján nem dönthető el, melyik családról van szó.** Vagy a győztes sem ért el jobb pontszámot az általános tartaléknál, vagy a második túl közel került hozzá. A visszafejtést ez nem érinti – a kulcsot így is, úgy is a titkosított szövegből fejti meg –, de a jelentésben megnevezett család, és minden, ami tőle függ, csak becslés.',
} satisfies Translation<'decrypt', 'hu'>;
