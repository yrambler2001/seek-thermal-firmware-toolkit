/**
 * Namespace `v4`, română (ro), translated from the English source.
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
  'status.starting': 'Se pornește ...',
  'status.building': 'Se construiește arhiva ...',
  'status.cancelling': 'Se anulează — se va salva tot ce s-a citit până acum ...',
  'status.refused': 'Refuzat — nu s-a citit nimic. Vedeți mesajul de deasupra jurnalului.',
  'status.sweepDone':
    'Gata — selectori activați: {armed}/{total}, cu date: {withData}. Verificați descărcările.',
  'status.sweepDoneCancelled':
    'Gata — selectori activați: {armed}/{total}, cu date: {withData} (anulat). Verificați descărcările.',
  'status.dumpDone': 'Gata — ferestre citite: {read}/{expected}. Verificați descărcările.',
  'status.dumpDoneCancelled':
    'Gata — ferestre citite: {read}/{expected} (anulat). Verificați descărcările.',
  'status.dumpDoneIncomplete':
    'Gata — ferestre citite: {read}/{expected} (incomplet — vedeți jurnalul). Verificați descărcările.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'Camera nu s-a potrivit cu familia 4.x/Nano, iar această filă citește doar familia aceasta. Nu s-a citit nimic. Pentru o cameră 0.x sau 1.x (build-uri din 2014 sau 2016), folosiți „{tab}”.',
  'refusal.otherFamily':
    'Camera pare să fie {name} ({id}), nu o cameră 4.x/Nano, iar această filă citește doar 4.x/Nano. Nu s-a citit nimic. Pentru o cameră 0.x sau 1.x (build-uri din 2014 sau 2016), folosiți „{tab}”.',
  'refusal.legacyLine':
    'Camera rulează {version}, un build 0.x sau 1.x (2014 sau 2016), iar această filă citește doar 4.x/Nano. Nu s-a citit nimic în afară de versiune. Pentru o cameră 0.x sau 1.x, folosiți „{tab}”.',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Extragere',
  'dump.actions': 'Acțiuni de extragere',
  'dump.start': 'Pornire extragere',
  'dump.panel': 'Extragere',
  'dump.how':
    'Ambele întreabă mai întâi camera ce firmware rulează: versiunea, cu `{getInfo}` — singura citire la care orice build Seek răspunde la fel — și, doar dacă acel build poate fi citit prin USB, un `{begin}` simplu și unul cu token, plus o singură citire. Așa află pagina din ce familie face parte camera. Această filă citește doar familia 4.x și Nano. O cameră pe care răspunsurile o plasează în altă parte este refuzată înainte să se citească ceva, iar pagina numește fila potrivită pentru ea. O cameră care nu își raportează versiunea sau rulează un build mai vechi decât 0.8.0.0 nu este citită deloc, iar pagina spune de ce.',
  'dump.modes':
    '**Pornire extragere** citește fiecare bloc la care ajunge tabelul de selectori al build-ului. **Extragerea tuturor selectorilor**, din *Opțiuni* mai jos, încearcă fiecare selector `{begin}` `{first}`–`{last}` și salvează tot ce returnează fiecare — mai lent, dar prinde și blocurile pe care harta întocmită manual le omite.',
  'dump.sweep': 'Extragerea tuturor selectorilor ({first}–{last})',
  'dump.sweepNote':
    'Încearcă fiecare selector și salvează tot ce returnează fiecare. Mai lent decât „Pornire extragere”.',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'Ce primiți',
  'output.intro': 'O singură descărcare `{ext}` care conține:',
  'output.caption': 'Fișierele din arhiva descărcată',
  'output.file': 'Fișier',
  'output.what': 'Ce este',
  'output.flash':
    'imaginea completă a memoriei flash de 4 MB (umplerea golului și tokenul de deblocare, dacă au fost folosite, sunt în manifest.json)',
  'output.windows': 'fiecare bloc de 64 KB exact cum a venit prin USB',
  'output.decrypted': 'fiecare slot cu imagine de firmware, decriptat (dacă s-a găsit o cheie)',
  'output.reports':
    'raport pentru fiecare slot: cheie, locul cheii, familie și cifru, SP, punct de intrare, SHA-256',
  'output.manifest': 'metadate exacte despre citire, goluri și decriptare',
  'output.readme': 'ce este captura și care îi sunt limitele',
  'output.keyFromDump':
    'Cheia este recuperată chiar din dump, așa că nu este nevoie de niciun fișier de cheie sau secret al dispozitivului.',
  'output.bestEffort':
    'Decriptarea rămâne totuși fără garanții. Dacă nu se găsește nicio cheie — de exemplu pe un exemplar al cărui bootloader derivă cheia din OTP-ul cipului, care nu există într-un dump al memoriei flash —, acel slot este pur și simplu sărit, iar restul arhivei nu este afectat.',
  'gap.summary': 'Golul de la {address}',
  'gap.where':
    'Setul de comenzi USB oferă un selector de fereastră de citire pentru fiecare bloc de 64 KB din memoria flash de 4 MB, cu excepția `{range}`. Acel bloc este umplut cu `{fill}` în imaginea combinată și consemnat în `{manifest}`.',
  'gap.costs':
    '**În practică, asta nu vă costă nimic.** Pe majoritatea camerelor, acel bloc este pur și simplu memorie flash ștearsă, care oricum se citește ca `{fill}` — deci umplutura se potrivește cu ce există cu adevărat acolo, iar imaginea este completă.',
  'gap.redundant':
    'Iar când blocul *este* folosit, ce conține este o copie redundantă. Aceste camere păstrează aceeași imagine de firmware în mai multe sloturi de 64 KB: în toate dump-urile cu mai multe sloturi verificate în timpul construirii acestei pagini, toate sloturile s-au decriptat într-un firmware identic octet cu octet — într-un caz, în patru sloturi care fuseseră scrise cu două chei diferite. Pe singurul exemplar văzut cu o imagine reală la `{address}`, aceasta era identică octet cu octet cu copiile de la `{before}` și `{after}`, așa că arhiva conține totuși acel firmware, doar citit de la altă adresă.',
  'gap.fine':
    'Tot din cauza acestei redundanțe este în regulă o cameră a cărei zonă `{address}` se citește ca `{fill}`: firmware-ul care poate porni există în continuare în celelalte sloturi. Oricum, nimic de pe această filă nu scrie în dispozitiv — golul afectează doar fișierul pe care îl descărcați.',
  'gap.complete':
    'Dacă doriți totuși o imagine strict completă, octet cu octet — de exemplu, ca să comparați memoria flash cu o referință —, citiți-o prin SWD/J-Link sau cu un programator SPI.',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': 'Necitită: camera nu a spus ce firmware rulează.',
  'identity.unsupported': 'Necitită: această cameră nu poate fi citită în acest fel.',
  'identity.title': 'Camera detectată',
  'identity.firmware': 'Firmware',
  'identity.scoreBasis': 'din răspunsurile camerei, înainte să se citească vreun slot',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Opțiuni',
  'options.subtitle': '— valorile implicite sunt corecte; nu trebuie să schimbați nimic aici.',
  'options.chunk': 'chunk (octeți control-IN)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'octet gap-fill',
  'options.retries': 'reîncercări pe fereastră',
  'options.retryDelay': 'pauză între reîncercări (ms)',
  'options.recipient': 'recipient (destinatarul transferului de control)',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'auto',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'decriptare firmware',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'da',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'nu',
  'options.help':
    '**chunk** este dimensiunea fiecărei citiri control-IN, cel mult 64: un pachet EP0. O citire mai lungă poate pierde un pachet din cauza ROM-ului de pornire al camerei când camera stă inactivă la o frecvență mică, așa că o valoare mai mare se citește câte 64 de octeți; una mai mică se folosește așa cum este dată, iar dacă o cameră se blochează, pagina coboară singură la o valoare mai mică și continuă. **gap-fill** este octetul scris în singurul bloc de 64 KB la care USB nu ajunge. **recipient** este implicit interface și trece la device dacă browserul nu poate revendica interfața 0 — firmware-ul le acceptă pe amândouă.',
  'options.chunkRange': 'chunk trebuie să fie între 1 și {max}, s-a primit {value}',
  'options.gapFillByte': 'gap-fill trebuie să fie un singur octet, s-a primit {value}',
  'options.retriesMin':
    'numărul de reîncercări trebuie să fie zero sau mai mare, s-a primit {value}',
  'options.retryDelayMin':
    'pauza între reîncercări trebuie să fie zero sau mai mare, s-a primit {value}',
} satisfies Translation<'v4', 'ro'>;
