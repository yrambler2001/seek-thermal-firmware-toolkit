/**
 * Magyar (hu): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language" and "Hungarian". The reader is
 * addressed formally (magázás), as Hungarian software usually does ("Csatlakoztassa a kamerát",
 * "Nyomja meg", "Kattintson"). Hungarian quotation marks („…”) go around button and tab names
 * inside a sentence; the dash between clauses is the spaced en dash ( – ).
 *
 * Glossary (English → magyar). Use these words everywhere; the notes say why where the choice was not obvious.
 * - slot, bank → slot (both: "bank" is the code's word for the same slot; never "bank"). A letter and
 *   a noun are written with a hyphen in Hungarian (like A-vitamin, B-terv): A-slot, B-slot. That also
 *   keeps a label from reading as "a slot" (the slot), which "A slot" would. recovery R → helyreállító
 *   R-slot (label: Helyreállító R-slot): the suffix lands on "slot" for all three names, so one
 *   template serves A, B and R. the booted bank → az indító slot / a slot, amelyről a kamera indult;
 *   the other bank → a másik slot; empty bank → üres slot; last-resort copy → utolsó tartalék másolat
 * - firmware → firmware (a silent final e, so suffixes take a hyphen: firmware-t, firmware-ben,
 *   firmware-rel; compounds firmware-család, firmware-verzió, firmware-slot); build → változat (the
 *   version number stays verzió); line (0.x/1.x line) → sorozat; family → család
 * - flash (the memory) → flash memória; whole-flash read → a teljes flash kiolvasása; dump (verb, the
 *   "Dump" buttons) → kiolvas („Kiolvasás”, „Kiolvasás indítása”, „Minden szelektor kiolvasása”);
 *   dump (noun, the file) → memóriakép (as Windows says for a memory dump); complete image (Preserve)
 *   → teljes memóriakép; read → olvasás / kiolvasás; read-back → visszaolvasás
 * - image (a firmware image) → lemezkép ("kép" alone would read as a picture on a thermal camera's
 *   page); decrypted image → visszafejtett lemezkép; stock/factory image → gyári lemezkép
 * - decrypt → visszafejt / visszafejtés; encrypted → titkosított; plaintext → titkosítatlan;
 *   ciphertext → titkosított szöveg; keystream → kulcsfolyam
 * - write, flash (verb) → ír / írás ("Flash decrypted image" → „Visszafejtett lemezkép írása”);
 *   erase → töröl; commit → véglegesítés; stage / staging → előkészít / előkészítés; payload →
 *   adatcsomag; arm → élesít
 * - boot / start → indul, indít; next start → következő indítás; bootable → indítható; bootloader →
 *   bootloader; boot-config word → indítási konfigurációs szó; active-slot word → az aktív slot szava
 * - key → kulcs; Key A / Key B → A-kulcs / B-kulcs (az A-kulcs, a B-kulcs); per-device key →
 *   eszközkulcs; key block → kulcsblokk (0. kulcsblokk); store key → tárolási kulcs; check key →
 *   ellenőrző kulcs; key pair → kulcspár
 * - backup → biztonsági mentés (mentés for short); full flash backup → teljes flash-mentés; restore →
 *   visszaállítás (only ever of a backup or the original firmware, so it does not clash with
 *   "helyreállító R-slot")
 * - run (one pass of the 0.x/1.x wizard) → futtatás; run file → futtatási fájl; phase → szakasz;
 *   step → lépés (02. lépés); Preserve (the wizard, in core's sentences) → megőrzési futtatás
 * - patch → módosítás, módosít (patched → módosított); frame rate → képkockasebesség; frame-rate
 *   patch → képkockasebesség-módosítás; "Make N FPS" → „N FPS beállítása”; "Make N FPS in every
 *   bank" → „N FPS beállítása minden slotban”
 * - acceptance sum → elfogadási összeg; word sum → szóösszeg; transfer checksum → átviteli
 *   ellenőrzőösszeg; header / footer → fejléc / lábléc
 * - power cycle → ki- és bekapcsolás; unplug and replug → húzza ki és dugja vissza
 * - camera → kamera; tab (the page's) → fül (az Info fülön); a browser tab → lap; tabs are named by
 *   their labels in „…” (app:tab.*)
 * - Sizes: KB and MB (never KiB/MiB), B for bytes, Hz and FPS as they are; a fixed unit takes its
 *   suffix after a hyphen (64 KB-os, 16 Hz-es, {hz} Hz-en, 27 FPS-re). A number never takes a suffix
 *   or an article in a template, since both depend on how the number is read: a version, a size or a
 *   file name goes after a colon or in brackets ("firmware: {version}", "a firmware ({version})").
 *   The one decimal the code formats (the family score, toFixed) keeps its dot: "{score} / 1.00".
 *   "50%" has no space, as Hungarian writes it.
 *
 * Cases around params (../../README.md, "Cases" and "Hungarian"). The article is part of every case
 * form, with B's own form: `{bank:nom}` az A-slot / a B-slot / a helyreállító R-slot, `{bank:acc}`
 * az A-slotot, `{bank:ine}` az A-slotban, `{bank:ill}` az A-slotba, `{bank:ela}` az A-slotból,
 * `{bank:all}` az A-slothoz, `{bank:ade}` az A-slotnál (also "than" after a comparative: nagyobb az
 * A-slotnál), `{bank:ins}` az A-slottal; `{key:ins}` az A-kulccsal. The plain `{bank}` has no article
 * ("A-slot") and is used only where a name stands alone: a cell, a heading, before a colon, in a list
 * after a colon. Since a case form starts with a lower-case article, a sentence never starts with
 * one: the template puts another word first ("Üres az A-slot", "Most az A-slotból indul a kamera").
 * A list takes the case on each name ("az A-slotba, a B-slotba és a helyreállító R-slotba"): with
 * the noun said in every name, standard Hungarian repeats the suffix, so the registry gives no
 * `listCase`. A param that is not always a name (a nested sentence, "egyik slotot sem", a
 * capitalised label) is not declined: the plain form goes before a colon. preserve:confirm.chosenBanks
 * is the illative "a kiválasztott slotokba", because confirm.titleWrite is its only use, as
 * "írás {banks:ill}". core:backup.bank.* say their bank in the accusative, as the objects of
 * backup.plan.* ("újra kiolvassa {banks}"). Plurals: one / other, and a noun after a number stays
 * singular ("2 fájl"), so both forms usually read the same.
 * Kept in English: command and register names, family ids (legacy-auth …), CLI options (--resume,
 * --family, allowJump, acknowledgeRisk), the read option names chunk / gap-fill / recipient and its
 * values interface / device, "stage two", "[inferred]", UNTESTED (with "nem tesztelt" next to it),
 * the quoted run-log words "already holds the patched bytes", Zadig's menus, "subcmd", "wire id".
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

const hu: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };

export default hu;
