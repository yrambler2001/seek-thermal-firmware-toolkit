/**
 * Namespace `decrypt`, srpski (sr), translated from the English source.
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
  'status.noFile': 'Nije izabrana datoteka.',
  'status.reading': 'Čitanje datoteke ...',
  'status.notUsable': 'Nije upotrebljiva kopija fleša.',
  'status.building': 'Pravljenje arhive ...',
  'status.nothingDecrypted':
    'Nijedna slika nije dešifrovana — razlog je u dnevniku. Manifest je među preuzetim datotekama.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Gotovo — dešifrovani slotovi: {done}/{count}. Proverite preuzete datoteke.',
    few: 'Gotovo — dešifrovani slotovi: {done}/{count}. Proverite preuzete datoteke.',
    other: 'Gotovo — dešifrovani slotovi: {done}/{count}. Proverite preuzete datoteke.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Dešifrujte kopiju fleša koju već imate',
  'offline.description': 'Kopija celog fleša, dešifrovana slot po slot.',
  'offline.intro':
    'Korak 2 kartice 4.x/Nano već dešifruje sve što pročita, pa vam ovo treba samo ako je vaša slika fleša došla odnekud drugde — iz ranijeg iščitavanja, sa J-Linka ili sa SPI programatora. Datoteka se čita lokalno i nikada se ne otprema. **Ovaj deo radi u svakom pregledaču**, uključujući Safari i iOS, jer mu nije potreban pristup USB-u.',
  'offline.actions': 'Radnje dešifrovanja bez kamere',
  'offline.choose': 'Izaberi datoteku kopije…',
  'offline.panel': 'Dešifrovanje bez kamere',
  'offline.detectedTitle': 'Prepoznata porodica firmvera',
  'offline.detectedIntro':
    'Nijedna kamera nije priključena, pa se porodica ocenjuje na osnovu slika u samoj datoteci. Ključ se u svakom slučaju izračunava iz šifrovanog teksta svakog slota; ovo samo određuje naziv porodice firmvera u izveštaju.',
  'offline.scoreBasis': 'na osnovu slika u datoteci',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Dešifrujte slot firmvera',
  'slot.description': 'Jedan slot, iz datoteke: 64 KB, onako kako ga kamera čuva.',
  'slot.intro':
    'Izaberite datoteku koja sadrži jedan slot firmvera — 65.536 bajtova, onako kako ga čuva iščitavanje slota na kartici <link>{tab}</link>, ili 64 KB na adresi slota u kopiji celog fleša. Stranica pronalazi ključ iz sopstvenih bajtova slota, dešifruje sliku i nudi je za preuzimanje, uz prikazan ključ, veličinu i SHA-256. Kamera se ne koristi, pa ovo radi i kada ništa nije priključeno.',
  'slot.refusedIntro':
    'Datoteka koja nije jedan slot, ne sadrži sliku firmvera ili se ne dešifruje odbija se uz navedeni razlog. Za obrisan slot to se i kaže, i nema šta da se dešifruje.',
  'slot.actions': 'Radnje sa datotekom slota',
  'slot.choose': 'Izaberi datoteku slota…',
  'slot.decrypting': 'Dešifrovanje: {file} …',
  'slot.unreadable': 'Datoteka nije mogla da se pročita.',
  'slot.notDecrypted':
    'Nije dešifrovano: {file} nije slot firmvera koji ova stranica može da dešifruje.',
  'slot.nothingWritten':
    'Ništa nije nigde upisano. Izaberite datoteku slota od 64 KB ili celu kopiju fleša u odeljku iznad.',
  'slot.erased': '{file} je obrisan slot.',
  'slot.resultTitle': 'Dešifrovani slot firmvera',
  'slot.file': 'Datoteka',
  'slot.fileSize': 'Veličina datoteke',
  'slot.fileSha': 'SHA-256 datoteke',
  'slot.imageVersion': 'Verzija slike',
  'slot.imageSize': 'Veličina slike',
  'slot.imageSha': 'SHA-256 slike',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Kontrolni zbir',
  'slot.notComputed': 'ne računa se za ovaj oblik',
  'slot.family': 'Porodica',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (prepoznato iz slike)',
  'slot.familyMismatch':
    '{name} — zbir nije ciljna vrednost ove porodice, pa butloder ne bi prihvatio sliku ovakvu kakva je',
  'slot.unknown': 'nepoznato',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': 'Ključ',
  'slot.keyPlain': 'nema: slot sadrži nešifrovanu sliku (nešifrovani lanac iz 2014. godine)',
  'slot.keyFfB': 'Ključ B para 1.3.0.8 FF',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Sačuvano kao',
  'slot.storedAsFfB': 'slika XOR tok ključa B, prozor zaglavlja doslovno',
  'slot.keyNone': 'nema',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Oblik ključa',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k} — sama slika sadrži ovaj oblik tačno jednom, i to ga određuje',
  'slot.keyFormDefault':
    '{k} — nijedan oblik se ne javlja tačno jednom u slici, pa je prikazana podrazumevana vrednost porodice',
  'slot.resultActions': 'Radnje sa dešifrovanom slikom',
  'slot.download': 'Preuzmi {file}',
  'slot.downloadFallback': 'dešifrovanu sliku',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Prepoznato',
  'detection.score': 'Ocena',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} od 1.00, {basis}',
  'detection.readAs': 'Pročitano kao',
  'detection.summary': 'Rezime',
  'detection.why': 'Zašto:',
  'detection.ambiguous':
    '**Dokazi nisu razrešili koja je ovo porodica.** Ili pobednik nije imao bolju ocenu od opšte rezervne porodice, ili je drugoplasirani bio preblizu. Dešifrovanje to ne menja — ključ se u svakom slučaju izračunava iz šifrovanog teksta — ali porodica navedena u izveštaju, i sve što od nje zavisi, samo je pretpostavka.',
} satisfies Translation<'decrypt', 'sr'>;
