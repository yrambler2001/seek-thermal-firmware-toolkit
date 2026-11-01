/**
 * Srpski (sr): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language". Latin script only (gajica: č ć đ
 * š ž, dž lj nj), never Cyrillic, in the ekavian standard of Serbia (mesto, pre, uređaj); the
 * registry tags the page sr-Latn.
 *
 * Register: the reader is addressed formally, with the plural imperative ("Povežite kameru",
 * "Kliknite", "Pročitajte"), and vi/vaš in lower case, as Serbian software writes it. Button, menu
 * and tab labels are the short singular imperative or a verbal noun, as Serbian Windows and Office
 * label commands ("Poveži uređaj", "Otkaži", "Pročitaj slotove", "Iščitavanje i dešifrovanje
 * 4.x/Nano"). A sentence that names a button or a tab quotes its label word for word in „…“.
 *
 * Glossary (English → srpski). Use these words everywhere.
 * - slot, bank → slot (m; slota, slotu, slotom; pl. slotovi, slotova); never "banka". Slot A, Slot B
 *   (common:bank.*); inside a sentence slot A. recovery R → slot za oporavak R (label: Slot za
 *   oporavak R): the name starts with "slot", so every preposition a template writes before a bank
 *   name (u, iz, sa, za, od, kod) fits slot A, slot za oporavak R and drugi slot alike, and only
 *   "slot" declines (slota za oporavak R, slotom za oporavak R). the other bank → drugi slot; the
 *   booted bank → pokrenuti slot / slot iz kog se kamera sada pokreće; booted now → sada pokrenut;
 *   empty bank → prazan slot; last-resort copy → krajnja rezervna kopija
 * - firmware → firmver (m; firmvera, firmverom); firmware family → porodica firmvera; build →
 *   izdanje (the number stays verzija); line (0.x/1.x line) → linija
 * - bootloader → butloder (m; butlodera), transliterated like firmver and softver
 * - flash (the memory) → fleš (m; fleša, u flešu), fleš memorija; write / flash (verb) → upisati,
 *   upis ("Flash decrypted image" → „Upiši dešifrovanu sliku“); erase → obrisati; commit → potvrda
 *   upisa; stage / staging → pripremiti / priprema; payload → podaci; arm → aktivirati
 * - dump (verb, the buttons) → iščitati, iščitavanje („Iščitaj“, „Pokreni iščitavanje“, „Iščitaj
 *   sve selektore“); dump (the file) → kopija fleša (kopija celog fleša, kopija slota); read →
 *   čitati, čitanje; whole-flash read → čitanje celog fleša; read-back → kontrolno čitanje
 * - image → slika (as in slika diska); decrypted image → dešifrovana slika; stock / factory image →
 *   originalna / fabrička slika; plaintext → nešifrovano; the 2014 plaintext chain → nešifrovani
 *   lanac iz 2014. godine; decrypt → dešifrovati, dešifrovanje; keystream → tok ključa
 * - key → ključ (m); Key A / Key B → ključ A / ključ B (a row label: Ključ A); per-device key →
 *   ključ uređaja; key block → blok ključeva; store key → ključ za čuvanje; check key → ključ za
 *   proveru; stage key → ključ za pripremu; key pair → par ključeva; acceptance sum → kontrolni
 *   zbir; word sum → zbir reči; transfer checksum → kontrolni zbir prenosa; header / footer →
 *   zaglavlje / podnožje
 * - boot / start → pokrenuti (se), pokretanje; next start → sledeće pokretanje; bootable → može da
 *   se pokrene, ispravna slika za pokretanje (the column „Pokreće se“); unbootable → neupotrebljiv
 *   za pokretanje, onemogućeno pokretanje kamere
 * - backup → rezervna kopija (always with "rezervna", so it never blurs into kopija fleša); full
 *   flash backup → potpuna rezervna kopija fleša; restore → vratiti, vraćanje (only ever of a
 *   backup, so it never clashes with "oporavak", which is R's word)
 * - run (one pass of the 0.x/1.x wizard) → sesija; run file → datoteka sesije; step → korak; the
 *   step chips (core:preserve.step.*) → Rezervna kopija, Zakrpa, Upis, Čitanje celog fleša,
 *   Vraćanje, Provera
 * - patch → zakrpa, (za)krpiti; frame-rate patch → zakrpa brzine kadrova; frame rate → brzina
 *   kadrova; "Make N FPS" → „Ubrzaj na N FPS“; "Make N FPS in every bank" → „Ubrzaj na N FPS u
 *   svim slotovima“
 * - power cycle → isključiti i ponovo uključiti; unplug and replug → isključiti i ponovo priključiti
 * - camera → kamera; tab → kartica (as Serbian browsers say); short names: kartica slotova, kartica
 *   4.x/Nano, kartica 0.x/1.x, kartica Info; file → datoteka (1 datoteka, 2 datoteke, 5 datoteka);
 *   browser → pregledač; download → preuzimanje; log → dnevnik
 * - Sizes: KB, MB, B (never KiB/MiB), with a space after the number; Hz and FPS as they are; a size
 *   used as an adjective is "od 64 KB" ("blok od 64 KB"). A byte count written in the text takes the
 *   Serbian dot for thousands (65.536); the family score (toFixed) keeps its decimal point ("0.87 od
 *   1.00").
 * - Typography: Serbian quotation marks „…“ around button and tab names; "50 %" with a no-break
 *   space; years as ordinals ("iz 2014. godine").
 *
 * Cases around params (../../README.md, "Cases"): `{bank:gen}` iz slota A, `{bank:dat}` slotu A,
 * `{bank:acc}` u slot A, `{bank:ins}` sa slotom A, `{bank:loc}` u slotu A; `{key:ins}` ključem A.
 * The forms are in common.ts (bank.*:case, lower case also on the label forms, with a lower-case
 * :nom there for a label said inside a sentence), shared.ts (deviceInfo.otherBank:case, drugi slot)
 * and core.ts (keyName.*:case). Every bank and key name is masculine and inanimate, so its accusative
 * is its plain form: core templates write a plain {bank} where the accusative is meant and decline
 * only gen, dat, ins and loc. A list ({banks}, {order}) takes the case on each name. A param that is
 * not always a name (a nested sentence, "nijedan slot", a capitalised label) stays plain, in the
 * nominative or before a colon (fpsBoot.holdsOne, fpsBoot.cannotPatch, restore.readBack.differs,
 * upgrade.verdict.unknown, keys.bootedHolds, {next}). preserve:confirm.chosenBanks is the accusative
 * "izabrane slotove", because confirm.titleWrite says "upisati u {banks:acc}"; phase.*.inSentence is
 * the accusative ("čitanje i pripremu") that phase.start and phase.retry need; slots:what.copy is a
 * nominative ("slika slota A"), so writeConfirm.title is turned to "Da li da se {what} upiše u …".
 * Plurals: one / few / other (1, 21 slot; 2–4, 22–24 slota; 0, 5–20, 25… slotova); a count whose
 * noun cannot agree is written as a label ("pročitani prozori: {read}/{expected}").
 * Kept in English: command and register names, family ids (legacy-auth …), CLI options (--resume,
 * --family, allowJump, acknowledgeRisk), the read option names chunk / gap-fill / recipient and
 * their values interface / device, "stage two", "[inferred]", UNTESTED (with "nije testirano" next
 * to it), the quoted run-log words "already holds the patched bytes", Zadig's menus, "subcmd",
 * "wire id".
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

const sr: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };

export default sr;
