/**
 * Namespace `decrypt`, latviešu (lv), translated from the English source.
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
  'status.noFile': 'Fails nav izvēlēts.',
  'status.reading': 'Nolasa failu ...',
  'status.notUsable': 'Nav izmantojama izmete.',
  'status.building': 'Veido arhīvu ...',
  'status.nothingDecrypted':
    'Neviens attēls netika atšifrēts — iemeslu skatiet žurnālā. Manifests ir jūsu lejupielādēs.',
  /* {count} is the number of slots found. */
  'status.done': {
    zero: 'Gatavs — atšifrēti sloti: {done}/{count}. Pārbaudiet lejupielādes.',
    one: 'Gatavs — atšifrēts slots: {done}/{count}. Pārbaudiet lejupielādes.',
    other: 'Gatavs — atšifrēti sloti: {done}/{count}. Pārbaudiet lejupielādes.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Atšifrēt jau esošu izmeti',
  'offline.description': 'Visas zibatmiņas izmete, atšifrēta pa slotiem.',
  'offline.intro':
    'Cilnes 4.x/Nano 2. solis jau atšifrē visu, ko nolasa, tāpēc šis jums vajadzīgs tikai tad, ja zibatmiņas attēls iegūts citur — agrākā nolasīšanā, ar J-Link vai SPI programmatoru. Fails tiek nolasīts lokāli un nekad netiek augšupielādēts. **Šī daļa darbojas jebkurā pārlūkprogrammā**, arī Safari un iOS, jo tai nav vajadzīga USB piekļuve.',
  'offline.actions': 'Bezsaistes atšifrēšanas darbības',
  'offline.choose': 'Izvēlēties izmetes failu…',
  'offline.panel': 'Bezsaistes atšifrēšana',
  'offline.detectedTitle': 'Noteiktā aparātprogrammatūras saime',
  'offline.detectedIntro':
    'Kamera nav pievienota, tāpēc saime tiek novērtēta pēc pašā failā esošajiem attēliem. Atslēga jebkurā gadījumā tiek atrisināta no katra slota šifrteksta; šis novērtējums tikai nosaka aparātprogrammatūras saimes nosaukumu atskaitē.',
  'offline.scoreBasis': 'pēc failā esošajiem attēliem',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Atšifrēt aparātprogrammatūras slotu',
  'slot.description': 'Viens slots no faila: 64 KB, kā to glabā kamera.',
  'slot.intro':
    'Izvēlieties failu, kurā ir viens aparātprogrammatūras slots — 65 536 baiti, kā slota izmeti saglabā cilne <link>{tab}</link>, vai 64 KB no slota adreses visas zibatmiņas izmetē. Lapa atrod atslēgu pēc paša slota baitiem, atšifrē attēlu un piedāvā to lejupielādei, parādot atslēgu, izmēru un SHA-256. Kamera netiek izmantota, tāpēc tas darbojas arī tad, ja nekas nav pievienots.',
  'slot.refusedIntro':
    'Fails, kas nav viens slots, kurā nav aparātprogrammatūras attēla vai kas neatšifrējas, tiek noraidīts, norādot iemeslu. Par izdzēstu slotu lapa pasaka, ka tas ir izdzēsts un tajā nav ko atšifrēt.',
  'slot.actions': 'Slota faila darbības',
  'slot.choose': 'Izvēlēties slota failu…',
  'slot.decrypting': 'Atšifrē {file} …',
  'slot.unreadable': 'Failu nevarēja nolasīt.',
  'slot.notDecrypted':
    'Nav atšifrēts: {file} nav aparātprogrammatūras slots, ko šī lapa var atšifrēt.',
  'slot.nothingWritten':
    'Nekur nekas netika ierakstīts. Izvēlieties 64 KB slota failu vai visu izmeti sadaļā augstāk.',
  'slot.erased': '{file} ir izdzēsts slots.',
  'slot.resultTitle': 'Atšifrētais aparātprogrammatūras slots',
  'slot.file': 'Fails',
  'slot.fileSize': 'Faila izmērs',
  'slot.fileSha': 'Faila SHA-256',
  'slot.imageVersion': 'Attēla versija',
  'slot.imageSize': 'Attēla izmērs',
  'slot.imageSha': 'Attēla SHA-256',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Pieņemšanas summa',
  'slot.notComputed': 'šai formai netiek aprēķināta',
  'slot.family': 'Saime',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (noteikta pēc attēla)',
  'slot.familyMismatch':
    '{name} — summa nav šīs saimes pieņemšanas mērķis, tāpēc sāknētājs šo attēlu tādu, kāds tas ir, nepieņemtu',
  'slot.unknown': 'nezināma',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': 'Atslēga',
  'slot.keyPlain': 'nav: slotā attēls glabājas atklātā veidā (2014. gada atklātā teksta ķēde)',
  'slot.keyFfB': '1.3.0.8 FF pāra atslēga B',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Glabāts kā',
  'slot.storedAsFfB': 'attēls XOR atslēgas B atslēgu plūsma, galvenes logs nemainīts',
  'slot.keyNone': 'nav',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Atslēgas forma',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k} — pats attēls satur šo formu tieši vienreiz, un tas to nosaka',
  'slot.keyFormDefault':
    '{k} — neviena forma attēlā neparādās tieši vienreiz, tāpēc parādīta saimes noklusējuma forma',
  'slot.resultActions': 'Atšifrētā attēla darbības',
  'slot.download': 'Lejupielādēt {file}',
  'slot.downloadFallback': 'atšifrēto attēlu',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Noteikts',
  'detection.score': 'Novērtējums',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} no 1.00, {basis}',
  'detection.readAs': 'Nolasīts kā',
  'detection.summary': 'Kopsavilkums',
  'detection.why': 'Kāpēc:',
  'detection.ambiguous':
    '**Pierādījumi nenoteica, kura saime tā ir.** Vai nu uzvarētājs nebija labāks par vispārīgo rezerves variantu, vai arī otrais kandidāts bija pārāk tuvu. Atšifrēšanu tas neietekmē — atslēga jebkurā gadījumā tiek atrisināta no šifrteksta —, taču atskaitē nosauktā saime un viss, kas no tās atkarīgs, ir minējums.',
} satisfies Translation<'decrypt', 'lv'>;
