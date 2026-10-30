/**
 * Namespace `decrypt`, română (ro), translated from the English source.
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
  'status.noFile': 'Niciun fișier ales.',
  'status.reading': 'Se citește fișierul ...',
  'status.notUsable': 'Nu este un dump utilizabil.',
  'status.building': 'Se construiește arhiva ...',
  'status.nothingDecrypted':
    'Nicio imagine decriptată — motivul este în jurnal. Manifestul este în descărcări.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Gata — {done}/{count} slot decriptat. Verificați descărcările.',
    few: 'Gata — {done}/{count} sloturi decriptate. Verificați descărcările.',
    other: 'Gata — {done}/{count} de sloturi decriptate. Verificați descărcările.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Decriptarea unui dump pe care îl aveți deja',
  'offline.description': 'Un dump complet al memoriei flash, decriptat slot cu slot.',
  'offline.intro':
    'Pasul 2 al filei 4.x/Nano decriptează deja tot ce citește, așa că aveți nevoie de această parte doar dacă imaginea memoriei flash vine din altă parte — o rulare anterioară, J-Link sau un programator SPI. Fișierul este citit local și nu este încărcat niciodată. **Această parte funcționează în orice browser**, inclusiv Safari și iOS, pentru că nu are nevoie de acces la USB.',
  'offline.actions': 'Acțiuni de decriptare offline',
  'offline.choose': 'Alegeți fișierul dump…',
  'offline.panel': 'Decriptare offline',
  'offline.detectedTitle': 'Familia de firmware detectată',
  'offline.detectedIntro':
    'Nu este conectată nicio cameră, așa că familia este evaluată din imaginile din fișier. Cheia se calculează oricum din textul criptat al fiecărui slot; de aici vine doar numele familiei de firmware din raport.',
  'offline.scoreBasis': 'din imaginile din fișier',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Decriptarea unui slot de firmware',
  'slot.description': 'Un slot, dintr-un fișier: 64 KB, așa cum îl stochează camera.',
  'slot.intro':
    'Alegeți un fișier care conține un singur slot de firmware — 65.536 de octeți, așa cum îl salvează extragerea unui slot pe fila <link>{tab}</link>, sau cei 64 KB de la adresa unui slot dintr-un dump complet al memoriei flash. Pagina găsește cheia din octeții slotului, decriptează imaginea și v-o oferă pentru descărcare, cu cheia, dimensiunea și SHA-256 afișate. Nu se folosește nicio cameră, așa că funcționează fără nimic conectat.',
  'slot.refusedIntro':
    'Un fișier care nu este un singur slot, nu conține nicio imagine de firmware sau nu se decriptează este refuzat, cu motivul. Pentru un slot șters se afișează acest lucru: nu are nimic de decriptat.',
  'slot.actions': 'Acțiuni pentru fișierul slotului',
  'slot.choose': 'Alegeți fișierul slotului…',
  'slot.decrypting': 'Se decriptează {file} …',
  'slot.unreadable': 'Fișierul nu a putut fi citit.',
  'slot.notDecrypted':
    'Nedecriptat: {file} nu este un slot de firmware pe care această pagină îl poate decripta.',
  'slot.nothingWritten':
    'Nu s-a scris nimic nicăieri. Alegeți un fișier de slot de 64 KB sau un dump complet în secțiunea de mai sus.',
  'slot.erased': '{file} este un slot șters.',
  'slot.resultTitle': 'Slot de firmware decriptat',
  'slot.file': 'Fișier',
  'slot.fileSize': 'Dimensiunea fișierului',
  'slot.fileSha': 'SHA-256 al fișierului',
  'slot.imageVersion': 'Versiunea imaginii',
  'slot.imageSize': 'Dimensiunea imaginii',
  'slot.imageSha': 'SHA-256 al imaginii',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Suma de control',
  'slot.notComputed': 'necalculată pentru această formă',
  'slot.family': 'Familie',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (detectată din imagine)',
  'slot.familyMismatch':
    '{name} — suma nu este ținta de acceptare a acestei familii, deci bootloader-ul nu ar accepta imaginea așa cum este',
  'slot.unknown': 'necunoscută',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': 'Cheie',
  'slot.keyPlain': 'niciuna: slotul conține imaginea necriptată (lanțul necriptat din 2014)',
  'slot.keyFfB': 'Cheia B din perechea 1.3.0.8 FF',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Stocată ca',
  'slot.storedAsFfB': 'imaginea XOR fluxul de cheie al cheii B, cu fereastra antetului neschimbată',
  'slot.keyNone': 'niciuna',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Forma cheii',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce':
    '{k} — imaginea însăși conține această formă o singură dată, ceea ce o identifică',
  'slot.keyFormDefault':
    '{k} — nicio formă nu apare o singură dată în imagine, așa că se afișează forma implicită a familiei',
  'slot.resultActions': 'Acțiuni pentru imaginea decriptată',
  'slot.download': 'Descărcare {file}',
  'slot.downloadFallback': 'imaginea decriptată',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Detectată',
  'detection.score': 'Scor',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} din 1.00, {basis}',
  'detection.readAs': 'Citită ca',
  'detection.summary': 'Rezumat',
  'detection.why': 'De ce:',
  'detection.ambiguous':
    '**Dovezile nu au stabilit ce familie este aceasta.** Fie câștigătoarea nu a obținut un scor mai bun decât varianta generică de rezervă, fie a doua clasată a fost prea aproape ca să se poată decide. Decriptarea nu este afectată — cheia se calculează oricum din textul criptat —, dar familia numită în raport, și tot ce depinde de ea, este o presupunere.',
} satisfies Translation<'decrypt'>;
