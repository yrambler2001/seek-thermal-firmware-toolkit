/**
 * Latviešu (lv): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language". The reader is addressed formally, with
 * the plural imperative usual in Latvian software ("Pievienojiet kameru", "Noklikšķiniet", "Pārbaudiet");
 * buttons are infinitives, as in Latvian Windows ("Atcelt", "Pievienot ierīci", "Nolasīt slotus").
 * Latvian quotation marks („…“) go around button and tab names inside a sentence.
 *
 * Glossary (English → latviešu). Use these words everywhere; the notes say why where the choice was not obvious.
 * - slot, bank → slots (both: "bank" is the code's word for the same slot). Slot A → Slots A (common:bank.*),
 *   inside a sentence slots A. "Slots" is what Latvian technical writing says for a slot (atmiņas slots,
 *   SIM kartes slots); "ligzda" is a socket or port, not a firmware copy. recovery R → atkopšanas slots R
 *   ("atkopšana" is Windows' word for recovery): the name ends in "slots", so the case ending lands on the
 *   same noun for A, B and R (slotā A, atkopšanas slotā R; no slota A, no atkopšanas slota R). the other
 *   bank → otrs slots; the booted bank → sāknētais slots; empty bank → tukšs slots; the last-resort copy →
 *   ārkārtas kopija (so it does not clash with the backup's "rezerves kopija")
 * - firmware → aparātprogrammatūra (the term Latvian standards and Microsoft use); firmware family →
 *   aparātprogrammatūras saime; build → būvējums; line → līnija; legacy → mantotā
 * - bootloader → sāknētājs (as Latvian Linux texts say); boot → sāknēt, sāknēties (Windows' "sāknēšana");
 *   booted → sāknēts; next start → nākamā sāknēšana; bootable → sāknējams; boot-config word → sāknēšanas
 *   konfigurācijas vārds; active-slot word → aktīvā slota vārds; "the bootloader entered/started slot A" →
 *   sāknētājs palaida slotu A
 * - flash (the memory) → zibatmiņa (zibatmiņas, zibatmiņā); whole-flash read (the drain) → visas zibatmiņas
 *   nolasīšana; read-back → kontrolnolasīšana (the result: kontrolnolasījums)
 * - dump (noun) → izmete (as Windows says "atmiņas izmete"; izmetes fails); dump (verb, the 4.x tab's buttons)
 *   → nolasīt ("Start dump" → „Sākt nolasīšanu“, "Dump all selectors" → „Nolasīt visus selektorus“, the tabs
 *   "Dump & decrypt …" → „Nolasīt un atšifrēt …“); the Slots tab's "Dump" button → „Saglabāt kopiju“ (it saves
 *   one bank to a file)
 * - image → attēls (as "diska attēls"); decrypted image → atšifrēts attēls; stock image → rūpnīcas attēls;
 *   plaintext → atklāts teksts; decrypt → atšifrēt; keystream → atslēgu plūsma; payload → dati
 * - write, flash (verb) → ierakstīt, ierakstīšana ("Flash decrypted image" → „Ierakstīt atšifrētu attēlu“);
 *   "write to slot A" → ierakstīt slotā A (locative); erase → dzēst; commit → apstiprināšana (the Preserve
 *   step "Write" → „Ierakstīšana“); stage / staging → sagatavot / sagatavošana; arm → aktivizēt
 * - key → atslēga (feminine); Key A / Key B → atslēga A / atslēga B (row label Atslēga A); per-device key →
 *   ierīces atslēga; key block → atslēgu bloks (masculine); store key → glabāšanas atslēga; check key →
 *   pārbaudes atslēga. Key names mix genders, so a template never makes a participle agree with {key}: it
 *   says "ko atvasina", "to nosaka" instead.
 * - backup → rezerves kopija; restore → atjaunot / atjaunošana (only ever of a backup); recovery → atkopšana
 * - run (one pass of the 0.x/1.x wizard) → sesija; run file → sesijas fails; step → solis ("02. solis");
 *   phase → posms; the step chips (core:preserve.step.*) → Rezerves kopija, Ielāps, Ierakstīšana, Visas
 *   zibatmiņas nolasīšana, Atjaunošana, Pārbaude; "Preserve" in core's sentences → 0.x/1.x cilne
 * - patch → ielāps; to patch → uzlikt ielāpu (+ dative: "uzlikt ielāpu slotam A"); frame-rate patch → kadru
 *   ātruma ielāps; frame rate → kadru ātrums; "Make N FPS" → „Iestatīt N FPS“; "Make N FPS in every bank" →
 *   „Iestatīt N FPS visos slotos“
 * - acceptance sum → pieņemšanas summa; word sum → vārdu summa; transfer checksum → pārsūtes kontrolsumma;
 *   header / footer → galvene / kājene; wire id → pārraides id
 * - camera → kamera; tab → cilne (as Latvian browsers say); tabs are named by their labels in „…“ (app:tab.*),
 *   or short: cilne 4.x/Nano, slotu cilne, 0.x/1.x cilne, cilne „Informācija“; browser → pārlūkprogramma
 * - power cycle → izslēgt un ieslēgt (barošanas pārslēgšana); unplug and replug → atvienot un pievienot atkal
 * - The 4.x options keep their CLI names (chunk, gap-fill, recipient) and the recipient values interface and
 *   device, as the hints that name them do.
 * - Sizes: KB and MB (never KiB/MiB), B for bytes, Hz and FPS as they are; "65 536" with a no-break space.
 *   The percent sign follows the number directly ("50%"). The family score (toFixed) keeps its dot.
 *
 * Cases around params. Latvian has no article; a bank or key name is declined with a case selector
 * (../../README.md, "Cases"): `{bank:gen}` no slota A, `{bank:dat}` slotam A (ielāps slotam A), `{bank:acc}`
 * uz slotu A / palaida slotu A, `{bank:loc}` slotā A (in, into: "ierakstīt slotā A"). The instrumental is "ar"
 * + the accusative in the singular, so `:ins` is that whole phrase ("ar slotu A", "ar atslēgu A"); the
 * templates write "ar {key:acc}" themselves. The forms are in common.ts (bank.*:case, with a lower-case `:nom`
 * on the label forms for a name inside a sentence), shared.ts (deviceInfo.otherBank:case, otrs slots) and
 * core.ts (keyName.*:case, with `:nom` on Key A / Key B). A list ({banks}, {order}) takes the case on each name.
 * A declined name never opens a sentence (it would be lower case): the template puts another word first
 * ("Kamera tagad sāknējas no {bank:gen}", "Saglabāta {bank:gen} kopija"), or keeps the plain name as the
 * subject with "satur" (contains) in place of "in slot A there is". A param that is not always a name
 * (fpsBoot.holdsOne, fpsBoot.holdsTwo, fpsBoot.cannotPatch, upgrade.verdict.*, restore.readBack.differs,
 * keys.bootedHolds, {next}, {build}) stays plain, before a colon or in brackets. {what} in writeConfirm.title
 * cannot be declined, so it stands after a colon in the nominative; preserve:confirm.chosenBanks is the
 * locative "izvēlētajos slotos", for confirm.titleWrite's "ierakstīt …"; phase.*.inSentence is the accusative
 * the start and retry buttons need („Sākt nolasīšanu un sagatavošanu“); keyPair.* is the genitive
 * report.checkKey.pair needs ("Compact PRO 1.0.3.x 9 Hz pāra bloks 1"); support.capability.* is the accusative
 * after "neatbalsta"; readBack.reference.* is the dative after "neatbilst"; readBack.recovered carries its "ar".
 * core:boot.bootsNow and write.ack.bootUnnamed are capitalised sentences, since they open write.ack.risk and
 * the confirmations. "I replugged it" is impersonal ("Kamera pievienota atkal — turpināt …").
 * Plurals: zero / one / other (0, 10–20, 30 … failu, the genitive plural; 1, 21, 31 … fails; 2–9, 22–29 …
 * faili). A count that is the object takes the matching accusative ("1 baitu", "2 baitus", "10 baitu"), after
 * "ar" or in the dative the plural ("ar 10 baitiem"). Where the count cannot agree with the noun, the sentence
 * says it as a label ("nolasīti logi: 3/64").
 */

import type { Dictionary } from '../../types';
import app from './app';
import common from './common';
import core from './core';
import decrypt from './decrypt';
import info from './info';
import preserve from './preserve';
import shared from './shared';
import slots from './slots';
import v4 from './v4';

const lv: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };

export default lv;
