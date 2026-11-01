/**
 * Namespace `decrypt`, lietuvių (lt), translated from the English source.
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
  'status.noFile': 'Failas nepasirinktas.',
  'status.reading': 'Skaitomas failas…',
  'status.notUsable': 'Netinkama išklotinė.',
  'status.building': 'Kuriamas archyvas…',
  'status.nothingDecrypted':
    'Neiššifruotas nė vienas atvaizdas — priežastį rasite žurnale. Manifestas yra atsisiuntimuose.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Baigta — iššifruota lizdų: {done}/{count}. Patikrinkite atsisiuntimus.',
    few: 'Baigta — iššifruota lizdų: {done}/{count}. Patikrinkite atsisiuntimus.',
    many: 'Baigta — iššifruota lizdų: {done}/{count}. Patikrinkite atsisiuntimus.',
    other: 'Baigta — iššifruota lizdų: {done}/{count}. Patikrinkite atsisiuntimus.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Turimos išklotinės iššifravimas',
  'offline.description': 'Visa flash atminties išklotinė, iššifruojama lizdas po lizdo.',
  'offline.intro':
    'Skirtuko 4.x/Nano 2 žingsnis jau iššifruoja viską, ką nuskaito, todėl šios dalies reikia tik tada, jei jūsų flash atminties atvaizdas gautas kitur — ankstesnio nuskaitymo metu, per J-Link ar SPI programatoriumi. Failas skaitomas vietoje ir niekur neįkeliamas. **Ši dalis veikia bet kurioje naršyklėje**, įskaitant Safari ir iOS, nes jai nereikia USB prieigos.',
  'offline.actions': 'Failo iššifravimo veiksmai',
  'offline.choose': 'Pasirinkti išklotinės failą…',
  'offline.panel': 'Iššifravimas be kameros',
  'offline.detectedTitle': 'Aptikta mikroprogramos šeima',
  'offline.detectedIntro':
    'Kamera neprijungta, todėl šeima vertinama pagal pačiame faile esančius atvaizdus. Raktas bet kuriuo atveju išsprendžiamas iš kiekvieno lizdo šifrinio teksto; šis vertinimas tik nustato ataskaitoje nurodomą mikroprogramos šeimą.',
  'offline.scoreBasis': 'pagal faile esančius atvaizdus',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Mikroprogramos lizdo iššifravimas',
  'slot.description': 'Vienas lizdas iš failo: 64 KB, taip, kaip jį saugo kamera.',
  'slot.intro':
    'Pasirinkite failą, kuriame yra vienas mikroprogramos lizdas — 65 536 baitai, taip, kaip jį išsaugo lizdo nuskaitymas skirtuke <link>{tab}</link>, arba 64 KB lizdo adresu iš visos flash atminties išklotinės. Puslapis randa raktą iš paties lizdo baitų, iššifruoja atvaizdą ir pasiūlo jį atsisiųsti, parodydamas raktą, dydį ir SHA-256. Kamera nenaudojama, todėl tai veikia nieko neprijungus.',
  'slot.refusedIntro':
    'Failas, kuris nėra vienas lizdas, kuriame nėra mikroprogramos atvaizdo arba kurio nepavyksta iššifruoti, atmetamas nurodant priežastį. Apie ištrintą lizdą taip ir pranešama — jame nėra ko iššifruoti.',
  'slot.actions': 'Lizdo failo veiksmai',
  'slot.choose': 'Pasirinkti lizdo failą…',
  'slot.decrypting': 'Iššifruojamas {file} …',
  'slot.unreadable': 'Failo nepavyko perskaityti.',
  'slot.notDecrypted':
    'Neiššifruota: {file} nėra mikroprogramos lizdas, kurį šis puslapis gali iššifruoti.',
  'slot.nothingWritten':
    'Niekur nieko neįrašyta. Pasirinkite 64 KB lizdo failą arba visą išklotinę aukščiau esančioje dalyje.',
  'slot.erased': 'Failas {file} yra ištrintas lizdas.',
  'slot.resultTitle': 'Iššifruotas mikroprogramos lizdas',
  'slot.file': 'Failas',
  'slot.fileSize': 'Failo dydis',
  'slot.fileSha': 'Failo SHA-256',
  'slot.imageVersion': 'Atvaizdo versija',
  'slot.imageSize': 'Atvaizdo dydis',
  'slot.imageSha': 'Atvaizdo SHA-256',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Priėmimo suma',
  'slot.notComputed': 'šiai formai neskaičiuojama',
  'slot.family': 'Šeima',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (aptikta pagal atvaizdą)',
  'slot.familyMismatch':
    '{name} — suma neatitinka šios šeimos priėmimo tikslo, todėl paleidyklė tokio atvaizdo nepriimtų',
  'slot.unknown': 'nežinoma',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': 'Raktas',
  'slot.keyPlain': 'nėra: lizde atvaizdas laikomas atviru tekstu (2014 m. neužšifruota grandinė)',
  'slot.keyFfB': '1.3.0.8 FF poros raktas B',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Saugoma kaip',
  'slot.storedAsFfB': 'atvaizdas XOR rakto B srautas, antraštės langas nepakeistas',
  'slot.keyNone': 'nėra',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Rakto forma',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k} — pats atvaizdas šią formą turi vieną kartą, o tai ją ir nurodo',
  'slot.keyFormDefault':
    '{k} — nė viena forma atvaizde nepasitaiko vieną kartą, todėl rodoma šeimos numatytoji',
  'slot.resultActions': 'Iššifruoto atvaizdo veiksmai',
  'slot.download': 'Atsisiųsti {file}',
  'slot.downloadFallback': 'iššifruotą atvaizdą',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Aptikta',
  'detection.score': 'Įvertis',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} iš 1, {basis}',
  'detection.readAs': 'Skaityta kaip',
  'detection.summary': 'Santrauka',
  'detection.why': 'Kodėl:',
  'detection.ambiguous':
    '**Įrodymai neleido nustatyti, kokia tai šeima.** Arba laimėtoja surinko ne daugiau nei bendroji atsarginė parinktis, arba antroji buvo per arti. Iššifravimas nepaveiktas — raktas bet kuriuo atveju išsprendžiamas iš šifrinio teksto, — tačiau ataskaitoje nurodyta šeima ir viskas, kas nuo jos priklauso, yra spėjimas.',
} satisfies Translation<'decrypt', 'lt'>;
