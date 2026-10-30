/**
 * Română (ro): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language". Standard Romanian, with the
 * comma-below letters ș ț Ș Ț (never the cedilla ş ţ). The reader is addressed with the polite
 * imperative usual in Romanian software ("Conectați camera", "Apăsați …", "Verificați …"); buttons
 * are short nouns, as in Romanian Windows and Android ("Conectare dispozitiv", "Citire sloturi",
 * "Anulare"), and a sentence names them in „ ” with the same words.
 *
 * Glossary (English → română). Use these words everywhere; the notes say why where the choice was not obvious.
 * - camera → camera (feminine: camera, camerei); a Compact → un Compact
 * - firmware → firmware-ul (gen. firmware-ului); firmware family → familie de firmware; firmware line →
 *   linie de firmware
 * - build → build-ul (pl. build-urile): two builds can share one version, so "versiune" cannot stand for it,
 *   and "compilare" reads as the act of compiling; Romanian firmware talk says "build"
 * - slot, bank → slotul (pl. sloturile; both: "bank" is the code's word for the same slot). Slot A as a
 *   label → Slot A, in a sentence → slotul A; recovery R → slotul de recuperare R (label: Recuperare R).
 *   Booted bank → slotul de pornire ("the slot the camera booted from"); next start → următoarea pornire;
 *   badge "booted now" → pornit acum; active-slot word → cuvântul slotului activ
 * - flash → memoria flash (flash in short labels); the part / the chip → cipul
 * - dump (noun, the file or the whole copy) → dump-ul (pl. dump-urile); dump (verb, the buttons and
 *   tabs) → a extrage / extragere: "Dump & decrypt …" → „Extragere și decriptare …”, "Start dump" →
 *   „Pornire extragere”, "Dump all selectors" → „Extragerea tuturor selectorilor”, the row button
 *   "Dump" → „Extragere”
 * - read → a citi / citire; read-back → recitire; whole-flash read (the Preserve "drain") → citire
 *   completă; image → imaginea (de firmware)
 * - write, flash (verb) → a scrie / scriere ("Flash decrypted image…" → „Scriere imagine
 *   decriptată…"); program → a programa; erase → a șterge / ștergere; commit → confirmarea scrierii
 *   (the Preserve step chip "Write" → Scriere); stage / staging → a transfera / transfer; payload →
 *   datele (trimise); armed (a window opened) → activat
 * - decrypt → a decripta / decriptare; encrypt → a cripta; plaintext → necriptat (imaginea necriptată);
 *   ciphertext → textul criptat; keystream → fluxul de cheie; cipher → cifrul
 * - bootloader → bootloader-ul; bootable → poate porni; unbootable → "camera nu mai poate porni";
 *   boot config → configurația de pornire (label „Config. de pornire”); boot-config word → cuvântul de
 *   configurare a pornirii
 * - key → cheia; Key A / Key B → cheia A / cheia B; per-device key → cheia proprie a dispozitivului;
 *   key block 1 → blocul de chei 1; store key → cheia de stocare; check key → cheia de verificare;
 *   stage key → cheia de transfer; "under Key A" → "cu cheia A"
 * - backup → copia de rezervă (full flash backup → copia de rezervă completă a memoriei flash);
 *   restore → a restaura / restaurare; the zip → arhiva zip
 * - run (one pass of the 0.x/1.x wizard) → rulare; run file → fișier de rulare; step → pas (Step 02 →
 *   pasul 02); Preserve (the pipeline's name) stays Preserve
 * - power cycle → oprirea și repornirea alimentării / "opriți și reporniți camera"; unplug and replug
 *   → deconectați și reconectați camera
 * - frame-rate patch → patch pentru rata de cadre (patch-ul, neuter); "Make N FPS" → „Trecere la N
 *   FPS"; patch (verb) → a aplica patch-ul; patched → cu patch
 * - acceptance sum → suma de control; transfer checksum → suma de control a transferului; word sum →
 *   suma cuvintelor; header / footer → antet / footer
 * - selector → selector; read window → fereastră de citire; unlock token → token de deblocare
 * - tab → filă (pl. file); tabs are named by their labels in „ ”, the Slots tab informally "fila
 *   sloturilor"
 * Typography: „…” quotation marks; no space before ":", ";", "!", "?". Sizes KB/MB and bytes B with a
 * space before the unit (README, Units); in prose bytes are "octeți". Hz, FPS, ms, Mbit/s as they are.
 * Plurals: one, few (0, 2–19 and endings 01–19) and other, which takes "de": "20 de sloturi". Where a
 * number sits in a sentence that has no plural forms, the count follows a label ("octeți schimbați: 40").
 * Names in a sentence (README, "Cases", Romanian): the article is at the end of the noun and there is no
 * contraction with a preposition, so {bank:acc} "slotul A" serves after any preposition that takes the
 * accusative ("din slotul A", "în slotul A", "pe slotul A"); {bank:gen} = {bank:dat} "slotului A"
 * (genitive-dative), with "al/a/ai/ale" written in the template where the grammar needs it ("o copie a
 * slotului A"); {bank:loc} "în slotul A"; {bank:ins} "Slotul A" for a sentence start. The plain
 * in-sentence name already carries the article ("slotul A"); the label is "Slot A". Keys the same way:
 * cheia A / cheii A, blocul de chei 1 / blocului de chei 1, o cheie necunoscută / unei chei necunoscute.
 * Kept in English: command and register names, wire ids, family ids (legacy-auth …), CLI options
 * (--resume, --family, allowJump, acknowledgeRisk), the read option names chunk / gap-fill / recipient and
 * their values (interface, device), "stage two", "[inferred]", "magic", UNTESTED (with "netestat" next to
 * it), the quoted run-log words "already holds the patched bytes", Zadig's menus.
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

const ro: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };
export default ro;
