/**
 * Namespace `decrypt`, slovenščina (sl), translated from the English source.
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
  'status.noFile': 'Nobena datoteka ni izbrana.',
  'status.reading': 'Branje datoteke …',
  'status.notUsable': 'To ni uporaben izpis.',
  'status.building': 'Sestavljanje arhiva …',
  'status.nothingDecrypted':
    'Nobena slika ni dešifrirana — razlog je v dnevniku. Manifest je med prenesenimi datotekami.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Končano — dešifrirana reža: {done}/{count}. Preverite prenesene datoteke.',
    two: 'Končano — dešifrirani reži: {done}/{count}. Preverite prenesene datoteke.',
    few: 'Končano — dešifrirane reže: {done}/{count}. Preverite prenesene datoteke.',
    other: 'Končano — dešifrirane reže: {done}/{count}. Preverite prenesene datoteke.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Dešifriranje izpisa, ki ga že imate',
  'offline.description': 'Celoten izpis bliskovnega pomnilnika, dešifriran režo za režo.',
  'offline.intro':
    'Korak 2 na zavihku 4.x/Nano že dešifrira vse, kar prebere, zato to potrebujete le, če je vaša slika bliskovnega pomnilnika prišla od drugod — iz prejšnjega izpisa, prek J-Link ali s programatorjem SPI. Datoteka se prebere lokalno in se nikoli ne naloži. **Ta del deluje v vsakem brskalniku**, tudi v Safariju in v iOS, ker ne potrebuje dostopa do USB.',
  'offline.actions': 'Dejanja za dešifriranje brez povezave',
  'offline.choose': 'Izberi datoteko izpisa…',
  'offline.panel': 'Dešifriranje brez povezave',
  'offline.detectedTitle': 'Zaznana družina vdelane programske opreme',
  'offline.detectedIntro':
    'Kamera ni priključena, zato se družina oceni iz slik v sami datoteki. Ključ se v vsakem primeru izračuna iz šifriranega besedila vsake reže; ta ocena določi le ime družine vdelane programske opreme v poročilu.',
  'offline.scoreBasis': 'iz slik v datoteki',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Dešifriranje reže vdelane programske opreme',
  'slot.description': 'Ena reža iz datoteke: 64 KB, kot jo shrani kamera.',
  'slot.intro':
    'Izberite datoteko z eno režo vdelane programske opreme — 65.536 bajtov, kot jo shrani izpis reže na zavihku <link>{tab}</link>, ali 64 KB na naslovu reže v izpisu celotnega bliskovnega pomnilnika. Stran najde ključ iz bajtov same reže, dešifrira sliko in jo ponudi za prenos ter pri tem pokaže ključ, velikost in SHA-256. Kamera ni potrebna, zato to deluje brez priključene naprave.',
  'slot.refusedIntro':
    'Datoteka, ki ni ena reža, ne vsebuje slike vdelane programske opreme ali se ne dešifrira, je zavrnjena z navedbo razloga. Pri izbrisani reži je to navedeno in ni ničesar za dešifriranje.',
  'slot.actions': 'Dejanja za datoteko reže',
  'slot.choose': 'Izberi datoteko reže…',
  'slot.decrypting': 'Dešifriranje datoteke {file} …',
  'slot.unreadable': 'Datoteke ni bilo mogoče prebrati.',
  'slot.notDecrypted':
    'Ni dešifrirano: {file} ni reža vdelane programske opreme, ki bi jo ta stran lahko dešifrirala.',
  'slot.nothingWritten':
    'Nikamor ni bilo zapisano nič. Izberite datoteko reže velikosti 64 KB ali celoten izpis v razdelku zgoraj.',
  'slot.erased': '{file} je izbrisana reža.',
  'slot.resultTitle': 'Dešifrirana reža vdelane programske opreme',
  'slot.file': 'Datoteka',
  'slot.fileSize': 'Velikost datoteke',
  'slot.fileSha': 'SHA-256 datoteke',
  'slot.imageVersion': 'Različica slike',
  'slot.imageSize': 'Velikost slike',
  'slot.imageSha': 'SHA-256 slike',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Kontrolna vsota za sprejem',
  'slot.notComputed': 'za to obliko se ne izračuna',
  'slot.family': 'Družina',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (zaznano iz slike)',
  'slot.familyMismatch':
    '{name} — vsota ni ciljna vrednost sprejema te družine, zato zagonski nalagalnik slike v tej obliki ne bi sprejel',
  'slot.unknown': 'neznano',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': 'Ključ',
  'slot.keyPlain': 'brez: reža vsebuje sliko nešifrirano (nešifrirana veriga iz leta 2014)',
  'slot.keyFfB': 'Ključ B para 1.3.0.8 FF',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Shranjeno kot',
  'slot.storedAsFfB': 'slika XOR tok ključa B, okno glave dobesedno',
  'slot.keyNone': 'brez',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Oblika ključa',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k} — slika sama vsebuje to obliko natanko enkrat, kar jo določa',
  'slot.keyFormDefault':
    '{k} — nobena oblika se v sliki ne pojavi natanko enkrat, zato je prikazana privzeta oblika družine',
  'slot.resultActions': 'Dejanja z dešifrirano sliko',
  'slot.download': 'Prenesi {file}',
  'slot.downloadFallback': 'dešifrirano sliko',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Zaznano',
  'detection.score': 'Ocena',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} od 1.00, {basis}',
  'detection.readAs': 'Prebrano kot',
  'detection.summary': 'Povzetek',
  'detection.why': 'Zakaj:',
  'detection.ambiguous':
    '**Dokazi niso razrešili, katera družina je to.** Zmagovalec ni dosegel boljše ocene od splošne nadomestne možnosti ali pa se mu je drugouvrščeni preveč približal. Dešifriranje to ne prizadene — ključ se v vsakem primeru izračuna iz šifriranega besedila — vendar sta družina, navedena v poročilu, in vse, kar je odvisno od nje, le ugibanje.',
} satisfies Translation<'decrypt', 'sl'>;
