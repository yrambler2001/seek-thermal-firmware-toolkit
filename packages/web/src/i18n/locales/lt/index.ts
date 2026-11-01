/**
 * Lietuvių (lt): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language". The reader is addressed formally, with
 * the plural imperative usual in Lithuanian software ("Prijunkite kamerą", "Spustelėkite", "Patikrinkite");
 * buttons are infinitives ("Prijungti įrenginį", "Nuskaityti lizdus"). Lithuanian quotation marks („…“)
 * go around button and tab names inside a sentence.
 *
 * Glossary (English → lietuvių). Use these words everywhere; the notes say why where the choice was not obvious.
 * - slot, bank → lizdas (both: "bank" is the code's word for the same slot). Slot A → Lizdas A (common:bank.*),
 *   inside a sentence lizdas A. "Lizdas" is the established Lithuanian word for a hardware slot (atminties
 *   lizdas, SIM kortelės lizdas); the informal "slotas" is not used. recovery R → atkūrimo lizdas R: the name
 *   ends in "lizdas", so the case ending lands on the same noun for A, B and R (lizde A, atkūrimo lizde R).
 *   the other bank → kitas lizdas; the booted bank → paleistas lizdas; empty bank → tuščias lizdas; the
 *   last-resort copy → paskutinė rezervinė kopija ("rezervinė", so it does not clash with the backup's
 *   "atsarginė kopija")
 * - firmware → mikroprograma (the short term Lithuanian technical writing uses; "programinė aparatinė įranga"
 *   is too long for every sentence); firmware family → mikroprogramos šeima; build → leidimas; line → linija
 * - bootloader → paleidyklė (as Lithuanian Linux and GRUB texts say); boot / start → paleisti, pasileisti;
 *   next start → kitas paleidimas; bootable → paleidžiamas; boot-config word → paleidimo konfigūracijos
 *   žodis; active-slot word → aktyvaus lizdo žodis
 * - flash (the memory) → flash atmintis (flash atminties, flash atmintyje); whole-flash read (the drain) →
 *   visos flash atminties nuskaitymas; read-back → kontrolinis nuskaitymas
 * - dump (noun) → išklotinė (the Lithuanian term, as in "išklotinės failas"); dump (verb, the 4.x tab's
 *   buttons) → nuskaityti ("Start dump" → „Pradėti nuskaitymą“, "Dump all selectors" → „Nuskaityti visus
 *   selektorius“); the Slots tab's "Dump" button → „Išsaugoti kopiją“ (it saves one bank to a file)
 * - image → atvaizdas; decrypted image → iššifruotas atvaizdas; stock image → gamyklinis atvaizdas;
 *   plaintext → atviras tekstas; decrypt → iššifruoti; keystream → rakto srautas
 * - write, flash (verb) → įrašyti, įrašymas ("Flash decrypted image" → „Įrašyti iššifruotą atvaizdą“);
 *   erase → ištrinti; commit → patvirtinimas (the Preserve step "Write" → „Įrašymas“); stage / staging →
 *   paruošti / paruošimas; payload → duomenys; arm → aktyvuoti
 * - key → raktas; Key A / Key B → raktas A / raktas B (row label Raktas A); per-device key → įrenginio
 *   raktas; key block → rakto blokas; store key → saugojimo raktas; check key → tikrinimo raktas
 * - backup → atsarginė kopija; restore → atkurti / atkūrimas (only ever of a backup)
 * - run (one pass of the 0.x/1.x wizard) → seansas; run file → seanso failas; step → žingsnis ("02
 *   žingsnis"); phase → etapas; the step chips (core:preserve.step.*) → Atsarginė kopija, Pataisa, Įrašymas,
 *   Visos flash atminties nuskaitymas, Atkūrimas, Patikra
 * - patch → pataisa, pataisyti / taisyti; frame-rate patch → kadrų dažnio pataisa; frame rate → kadrų dažnis;
 *   "Make N FPS" → „Nustatyti N FPS“; "Make N FPS in every bank" → „Nustatyti N FPS visuose lizduose“
 * - acceptance sum → priėmimo suma; word sum → žodžių suma; transfer checksum → perdavimo kontrolinė suma;
 *   header / footer → antraštė / poraštė
 * - camera → kamera; tab → skirtukas (as Lithuanian browsers say); tabs are named by their labels in „…“
 *   (app:tab.*), or short: skirtukas 4.x/Nano, lizdų skirtukas, skirtukas „Informacija“
 * - power cycle → išjungti ir vėl įjungti; unplug and replug → atjungti ir vėl prijungti
 * - Sizes: KB and MB (never KiB/MiB), B for bytes, Hz and FPS as they are. Percent with a space ("50 %").
 *   The family score (toFixed) keeps its dot, so the template says "iš 1" rather than a decimal of its own.
 *
 * Cases around params. A bank or key name is declined with a case selector (../../README.md, "Cases"):
 * `{bank:gen}` iš lizdo A, `{bank:dat}` lizdui A, `{bank:acc}` į lizdą A, `{bank:ins}` ties lizdu A,
 * `{bank:loc}` lizde A (the locative, no preposition); `{key:ins}` raktu A. "Into" is "į" + `:acc`, never an
 * illative. The forms are in common.ts (bank.*:case, with a lower-case `:nom` on the label forms for a subject
 * inside a sentence), shared.ts (deviceInfo.otherBank:case, kitas lizdas) and core.ts (keyName.*:case). A list
 * ({banks}, {order}) takes the case on each name. A declined name never opens a sentence (it would be lower
 * case): the template puts another word first. A param that is not always a name (fpsBoot.holdsOne,
 * fpsBoot.cannotPatch, upgrade.verdict.*, restore.readBack.differs, keys.bootedHolds, {next}) stays plain,
 * before a colon or as a subject. {what} in writeConfirm.title cannot be declined, so it stands in brackets
 * in the nominative; preserve:confirm.chosenBanks is the accusative "pasirinktus lizdus", for
 * confirm.titleWrite's "įrašyti į …"; phase.*.inSentence is the accusative the start and retry buttons need
 * („Pradėti nuskaitymą ir paruošimą“). core:boot.bootsNow and write.ack.bootUnnamed are capitalised
 * sentences, since they open write.ack.risk and the confirmations.
 * Plurals: one / few / many / other (1, 21 failas; 2–9, 22–29 failai; a fraction failo; 0, 10–20, 30 failų).
 * Where the count cannot agree with the noun, the sentence says it as a label ("nuskaityta langų: 3/64").
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

const lt: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };

export default lt;
