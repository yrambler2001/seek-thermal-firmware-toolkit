/**
 * Namespace `decrypt`, eesti (et), translated from the English source.
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
  'status.noFile': 'Faili pole valitud.',
  'status.reading': 'Faili lugemine ...',
  'status.notUsable': 'See ei ole kasutatav tõmmis.',
  'status.building': 'Arhiivi koostamine ...',
  'status.nothingDecrypted':
    'Ühtegi kujutist ei dekrüptitud — põhjuse leiate logist. Manifest on teie allalaadimiste hulgas.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Valmis — dekrüptitud {done}/{count} pesa. Vaadake oma allalaadimisi.',
    other: 'Valmis — dekrüptitud {done}/{count} pesa. Vaadake oma allalaadimisi.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Olemasoleva tõmmise dekrüptimine',
  'offline.description': 'Kogu välkmälu tõmmis, dekrüptitud pesa haaval.',
  'offline.intro':
    '4.x/Nano vahekaardi 2. samm dekrüptib juba kõik, mida see loeb, nii et seda osa on vaja ainult siis, kui teie välkmälu tõmmis pärineb mujalt — varasemast seansist, J-Linkist või SPI-programmaatorist. Fail loetakse kohapeal ja seda ei laadita kunagi üles. **See osa töötab igas brauseris**, ka Safaris ja iOS-is, sest USB-juurdepääsu pole vaja.',
  'offline.actions': 'Tõmmise dekrüptimise toimingud',
  'offline.choose': 'Vali tõmmisefail…',
  'offline.panel': 'Tõmmise dekrüptimine',
  'offline.detectedTitle': 'Tuvastatud püsivaraperekond',
  'offline.detectedIntro':
    'Kaamerat pole ühendatud, nii et perekonda hinnatakse failis olevate kujutiste põhjal. Võti lahendatakse igal juhul iga pesa šifritekstist; see määrab ainult, millist püsivaraperekonda aruanne nimetab.',
  'offline.scoreBasis': 'failis olevate kujutiste põhjal',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Püsivarapesa dekrüptimine',
  'slot.description': 'Üks pesa failist: 64 KB, nii nagu kaamera selle salvestab.',
  'slot.intro':
    'Valige fail, milles on üks püsivarapesa — pesa, 65 536 baiti, nii nagu vahekaardi <link>{tab}</link> pesa tõmmis selle salvestab, või 64 KB pesa aadressilt kogu välkmälu tõmmises. Leht leiab võtme pesa enda baitidest, dekrüptib kujutise ja pakub selle allalaadimiseks, näidates võtit, suurust ja SHA-256. Kaamerat ei kasutata, nii et see töötab ka siis, kui midagi pole ühendatud.',
  'slot.refusedIntro':
    'Failist, mis ei ole üks pesa, ei sisalda püsivara kujutist või ei dekrüptu, keeldutakse ja öeldakse põhjus. Kustutatud pesa kohta öeldakse, et see on kustutatud, ja dekrüptida pole midagi.',
  'slot.actions': 'Pesafaili toimingud',
  'slot.choose': 'Vali pesafail…',
  'slot.decrypting': 'Faili {file} dekrüptimine …',
  'slot.unreadable': 'Faili ei õnnestunud lugeda.',
  'slot.notDecrypted':
    'Ei dekrüptitud: {file} ei ole püsivarapesa, mida see leht dekrüptida oskab.',
  'slot.nothingWritten':
    'Kuhugi ei kirjutatud midagi. Valige 64 KB pesafail või ülalolevas jaotises kogu tõmmis.',
  'slot.erased': '{file} on kustutatud pesa.',
  'slot.resultTitle': 'Dekrüptitud püsivarapesa',
  'slot.file': 'Fail',
  'slot.fileSize': 'Faili suurus',
  'slot.fileSha': 'Faili SHA-256',
  'slot.imageVersion': 'Kujutise versioon',
  'slot.imageSize': 'Kujutise suurus',
  'slot.imageSha': 'Kujutise SHA-256',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Vastuvõtusumma',
  'slot.notComputed': 'selle vormi jaoks arvutamata',
  'slot.family': 'Perekond',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (tuvastatud kujutisest)',
  'slot.familyMismatch':
    '{name} — summa pole selle perekonna vastuvõtu sihtväärtus, nii et alglaadur ei võtaks kujutist sellisena vastu',
  'slot.unknown': 'teadmata',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': 'Võti',
  'slot.keyPlain': 'puudub: pesas on kujutis avatekstina (2014. aasta avatekstiahel)',
  'slot.keyFfB': '1.3.0.8 FF paari võti B',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Salvestatud kujul',
  'slot.storedAsFfB': 'kujutis XOR võtme B võtmevoog, päiseaken muutmata',
  'slot.keyNone': 'puudub',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Võtme vorm',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k} — kujutis ise sisaldab seda vormi üks kord ja see määrab vormi',
  'slot.keyFormDefault':
    '{k} — ükski vorm ei esine kujutises üks kord, nii et näidatakse perekonna vaikevormi',
  'slot.resultActions': 'Dekrüptitud kujutise toimingud',
  'slot.download': 'Laadi alla {file}',
  'slot.downloadFallback': 'dekrüptitud kujutis',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Tuvastatud',
  'detection.score': 'Skoor',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} / 1.00, {basis}',
  'detection.readAs': 'Loetud kui',
  'detection.summary': 'Kokkuvõte',
  'detection.why': 'Põhjus:',
  'detection.ambiguous':
    '**Tõendid ei selgitanud, mis perekonnaga on tegu.** Kas võitja skoor polnud parem kui üldisel varuvariandil või jäi teine kandidaat liiga lähedale. Dekrüptimist see ei mõjuta — võti lahendatakse igal juhul šifritekstist —, kuid aruandes nimetatud perekond ja kõik, mis sellest sõltub, on oletus.',
} satisfies Translation<'decrypt', 'et'>;
