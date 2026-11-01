/**
 * Eesti (et): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language". The reader is addressed formally, with
 * the plural imperative usual in Estonian software ("Ühendage kaamera", "Vajutage", "Lugege pesad uuesti");
 * buttons and menu items are the singular imperative, as in Estonian Windows ("Loobu", "Ühenda seade",
 * "Loe pesad", "Kirjuta pesasse A…"). The tick boxes speak for the reader in the first person ("Saan aru, et
 * …"); "I replugged it" is impersonal ("Kaamera on uuesti ühendatud — jätka …"). Estonian quotation marks
 * („…“) go around button and tab names inside a sentence; a tab is named by its label ("vahekaart „Teave“").
 *
 * Glossary (English → eesti). Use these words everywhere; the notes say why where the choice was not obvious.
 * - slot, bank → pesa (both: "bank" is the code's word for the same slot; "pesa" is what Estonian says for a
 *   hardware slot, as in mälupesa, SIM-kaardi pesa). Slot A → Pesa A (common:bank.*), inside a sentence pesa A.
 *   recovery R → taastepesa R ("taaste" is Windows' word for recovery: taastekeskkond, taastedraiv), so the
 *   ending lands on the same noun for A, B and R (pesas A, taastepesas R; pesasse A, taastepesasse R). the
 *   other bank → teine pesa; the booted bank → käivitatud pesa; empty → tühi; the last-resort copy → viimane
 *   hädavaru (so it does not clash with the backup, varukoopia)
 * - firmware → püsivara; firmware family → püsivaraperekond (perekond); build → järk (as Microsoft says for a
 *   build); line → liin; legacy → pärand- (pärandliin, pärandpüsivara); stock / factory → tehase (tehase
 *   kujutis, tehase püsivara); a stock camera → tehaseseisus kaamera
 * - bootloader → alglaadur; boot / start → käivituma, käivitama (the camera boots slot A → kaamera käivitub
 *   pesast A); booted → käivitatud; next start → järgmine käivitus; bootable → käivitatav; boot-config word →
 *   käivituskonfiguratsiooni sõna; active-slot word → aktiivse pesa sõna; "the bootloader entered slot A" →
 *   alglaadur sisenes pesasse A
 * - flash (the memory) → välkmälu (välkmällu, välkmälus); whole-flash read (the drain) → kogu välkmälu
 *   lugemine; read-back → tagasilugemine
 * - dump (noun) → tõmmis (as in mälutõmmis); dump (verb) → teha tõmmis; "Start dump" → „Alusta tõmmist“;
 *   "Dump all selectors" → „Loe kõik selektorid“; the tabs "Dump & decrypt …" → „Tõmmis ja dekrüptimine …“;
 *   the Slots tab's "Dump" button → „Tee tõmmis“ (it saves one bank to a file)
 * - image → kujutis (püsivara kujutis), kept apart from the dump (tõmmis); decrypted image → dekrüptitud
 *   kujutis; plaintext → avatekst; decrypt → dekrüptima (dekrüptimine); keystream → võtmevoog; payload →
 *   andmed; header / footer → päis / jalus; header window → päiseaken
 * - write, flash (verb) → kirjutama, into a slot with the illative ("kirjutage pesasse A"); "Flash decrypted
 *   image" → „Kirjuta dekrüptitud kujutis“; erase → kustutama; commit (the camera's last step) → kinnitama,
 *   kinnitamine; the Preserve step "Write" → „Kirjutamine“; stage / staging → ette valmistama /
 *   ettevalmistus; arm → aktiveerima
 * - key → võti; Key A / Key B → võti A / võti B (row label Võti A); per-device key → seadmevõti; key block →
 *   võtmeplokk; store key → salvestusvõti; check key → kontrollvõti; key pair → võtmepaar; unlock token →
 *   avamismärk
 * - backup → varukoopia (to back up: varundama, varundamine); restore → taastama / taastamine; recovery →
 *   taaste (only in taastepesa)
 * - run (one pass of the 0.x/1.x wizard) → seanss; run file → seansifail; step → samm ("samm 02"); phase →
 *   etapp; the step chips (core:preserve.step.*) → Varundamine, Paikamine, Kirjutamine, Kogu välkmälu
 *   lugemine, Taastamine, Kontrollimine; a step named in a gate sentence → samm „Paikamine“ (preserve.stepId.*);
 *   "Preserve" in core's sentences → 0.x/1.x vahekaart
 * - patch → paik; to patch → paikama (paikab, paigata, paigatud; button „Paika pesa A“); frame-rate patch →
 *   kaadrisageduse paik; frame rate → kaadrisagedus; "Make N FPS" → „Sea N FPS“; "Make N FPS in every bank"
 *   → „Sea N FPS igas pesas“
 * - acceptance sum → vastuvõtusumma; word sum → sõnasumma; transfer checksum → edastuse kontrollsumma;
 *   wire id → käsu id; selector → selektor; window → aken
 * - camera → kaamera; tab → vahekaart (as Estonian browsers say); browser → brauser; power cycle → toide
 *   välja ja uuesti sisse lülitada; unplug and replug → eemaldada ja uuesti ühendada
 * - The 4.x options keep their CLI names (chunk, gap-fill, recipient) and the recipient values interface and
 *   device, as the hints that name them do. "UNTESTED", "[inferred]" and "stage two" stay as core writes them.
 * - Sizes: KB and MB (never KiB/MiB), B for bytes, Hz and FPS as they are; "65 536" with a no-break space.
 *   The percent sign follows the number directly ("50%"). The family score (toFixed) keeps its dot and is
 *   written "0.87 / 1.00", so no ending goes on a number.
 *
 * Cases around params. Estonian puts the case on the noun ("pesas A", "võtmega A"); a template asks for it
 * with a selector (../../README.md, "Cases"): `:ill` into (kirjutage pesasse A), `:ine` in (pesas A pole
 * kujutist), `:ela` from (käivitub pesast A), `:ade` has (pesal A pole ettevalmistusvormi), `:gen` before a
 * postposition (pesa A jaoks, pesa A kaudu) and for the possessor, `:com` with (võtmega A), `:par` after a
 * negation or a partial action (proovib võtit A), `:nom` a lower-case subject inside a sentence. "pesa" has
 * the same nominative, genitive and partitive, so a bank there stays plain; a key does not ("võti A", "võtme
 * A", "võtit A"). The forms are in common.ts (bank.*:case; the label forms' case forms and `:nom` are lower
 * case), shared.ts (deviceInfo.otherBank:case, teine pesa) and core.ts (keyName.*:case, with `:nom` on Key A /
 * Key B). A list takes the case on each name ("pesasse A, pesasse B ja taastepesasse R"), except the
 * terminative, essive, abessive and comitative, which go on the last name only (`listCase` in ../../languages.ts).
 * A declined name never opens a sentence (it would be lower case): the template puts another word first
 * ("Kaamera käivitub praegu pesast A", "Kirjutatakse pesasse A"), or keeps the plain name as the subject
 * ("Pesa A sisaldab …"). A param that is not always a name (fpsBoot.holdsOne, fpsBoot.holdsTwo,
 * fpsBoot.cannotPatch, upgrade.verdict.*, restore.readBack.differs, keys.bootedHolds' bank, {next}, {build})
 * stays plain, as the subject or before a colon; a bare letter ({first} in boot.rule, {letterR}) takes no
 * ending. {what} in writeConfirm.title is the nominative object of "Kas kirjutada …?"; what.copy is "pesa A
 * kujutis"; preserve:confirm.chosenBanks is the illative "valitud pesadesse", for confirm.titleWrite's
 * "kirjutada …"; phase.*.inSentence is the partitive the start and retry buttons need („Alusta lugemist ja
 * ettevalmistust“); keyPair.* is the genitive report.checkKey.pair needs ("Compact PRO 1.0.3.x 9 Hz paari
 * plokk 1"); support.capability.* is the partitive after "ei toeta"; readBack.reference.* is the allative
 * after "ei vasta"; readBack.recovered carries its comitative ("… võtmevooga"); identity.operation.* is the
 * elative after "keeldutakse". core:boot.bootsNow and write.ack.bootUnnamed are capitalised sentences, since
 * they open write.ack.risk and the confirmations. A verb never agrees with a list of slots that may hold two
 * or three names: such sentences say "seanss saab paigata püsivara pesas A ja pesas B" or put the list after
 * a colon. Plurals: one / other; a noun after a number is the partitive singular ("2 faili", "5 pesa"), so
 * one and other often differ only in the noun ("1 fail", "2 faili"); where the count cannot agree, the
 * sentence says it as a label ("loetud aknaid: 3/64").
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

const et: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };

export default et;
