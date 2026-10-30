/**
 * Polski (pl): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language". The reader is addressed in the
 * second person singular with the imperative usual in Polish software ("Odłącz kamerę", "Kliknij"),
 * never "Pan/Pani"; Polish quotation marks („…”) go around button and tab names inside a sentence.
 *
 * Glossary (English → polski). Use these words everywhere; the notes say why where the choice was not obvious.
 * - firmware → firmware (uninflected, masculine where an adjective needs a gender: "oryginalny firmware";
 *   "oprogramowanie układowe" is correct but heavy for a manual); firmware family → rodzina firmware;
 *   build → kompilacja ("the 8 Hz build" → kompilacja 8 Hz; "wersja" is kept for the version number)
 * - slot, bank → slot (both: "bank" is the code's word for the same slot). Slot A, Slot B, Slot
 *   odzyskiwania R (common:bank.*); inside a sentence slot A, slot odzyskiwania R. the booted bank →
 *   uruchomiony slot; booted now → uruchomiony teraz; empty bank → pusty slot; last-resort copy →
 *   ostatnia kopia awaryjna
 * - flash (the memory) → pamięć flash; dump (noun) → zrzut; dump (verb, the "Dump" button) → zrzucić /
 *   „Zrzuć”; read → odczytać / odczyt; whole-flash read (Preserve's drain) → pełny odczyt (pamięci flash)
 * - image → obraz; decrypted image → odszyfrowany obraz; stock/factory image → oryginalny / fabryczny
 *   obraz; plaintext → jawny tekst / postać jawna; decrypt → odszyfrować
 * - write, flash (verb) → zapisać, zapis ("Flash decrypted image" → „Zapisz odszyfrowany obraz”);
 *   "write to slot A" → "zapisać w slocie A" (see Cases below); erase → wymazać; commit → zatwierdzenie;
 *   read-back → odczyt kontrolny; save a file (backup zip) → zachować / plik do pobrania, so "zapisać"
 *   mostly means writing to the camera
 * - boot / start → uruchomić (się), start; next start → następne uruchomienie; bootable → startuje /
 *   uruchamialny; bootloader → bootloader; boot-config word → słowo konfiguracji startu; active-slot
 *   word → słowo aktywnego slotu
 * - key → klucz; Key A / Key B → klucz A / klucz B; per-device key → klucz urządzenia; key block →
 *   blok kluczy; store key → klucz zapisu; check key → klucz sprawdzający; stage key → klucz
 *   przesyłania; keystream → strumień klucza; ciphertext → szyfrogram
 * - backup → kopia zapasowa; full flash backup → pełna kopia zapasowa pamięci flash
 * - run (one pass of the 0.x/1.x wizard) → przebieg; run file → plik przebiegu (the zip that records one
 *   przebieg and lets it continue; "sesja" would suggest a browser session); step → krok; phase → etap
 * - power cycle → wyłączyć i włączyć ponownie; unplug and replug → odłączyć i podłączyć ponownie
 * - frame-rate patch → łatka liczby klatek; "Make N FPS" → „Ustaw N FPS”; patch (verb) → załatać / łatać
 * - acceptance sum → suma kontrolna (the sum the bootloader checks); word sum → suma słów; transfer
 *   checksum → suma kontrolna transmisji; header / footer → nagłówek / stopka
 * - stage / staging → przesyłać / postać przesyłania; payload → (przesyłane) dane
 * - restore → przywrócić / przywrócenie; verify, check → weryfikacja, sprawdzenie
 * - selector → selektor; read window → okno odczytu; arm → aktywować ("nothing was armed" → „nic nie
 *   zostało aktywowane”); unlock token → token odblokowania; mode N → tryb N; corpus → zbiór
 * - tab → karta (as Polish browsers say); tabs are named by their labels in „…” (app:tab.*), or short:
 *   karta 4.x/Nano, karta 0.x/1.x, karta slotów, karta „Info”.
 * - Sizes: KB and MB (never KiB/MiB) with a space after the number; B, Hz, FPS as they are.
 *
 * Cases around params. A bank or key name is declined with a case selector (../../README.md, "Cases"):
 * `{bank:gen}` ze slotu A, `{bank:dat}` slotowi A, `{bank:acc}` slot A, `{bank:ins}` slotem A,
 * `{bank:loc}` w slocie A; `{key:ins}` pod kluczem A, `{masks:gen}` strumienie klucza A. The forms are
 * in common.ts (bank.*:case, lower case also for the label forms Slot A / Slot odzyskiwania R, since a
 * case form is always said inside a sentence) and core.ts (keyName.*:case). Write the case the grammar
 * needs ("Zapisz w {bank:loc}", "Kopiuj do {bank:gen}", "zapisywany pod {key:ins}", "Nie zapisano
 * {banks:gen}"), never a colon or brackets around the name. A list ({banks}, {order}) takes the case on
 * each name. A plain `{bank}` is the nominative, which is also the accusative of these masculine
 * inanimate nouns. A param that is not a name (a nested sentence such as {recovered}, or "wybrane
 * sloty" in confirm.chosenBanks) cannot be declined: there the sentence is turned round or keeps the
 * accusative ("zapisać na {banks}").
 * Plurals: one / few / many / other (1 slot, 2–4 sloty, 5+ slotów, a fraction → slotu); a count whose
 * noun cannot be declined around it is written as a label ("odczytane okna: {read}/{expected}").
 * Kept in English: command and register names, family ids (legacy-auth …), CLI options (--resume,
 * --family, allowJump, acknowledgeRisk), the read option names chunk / gap-fill / recipient, "stage two",
 * "[inferred]", UNTESTED (with "nieprzetestowane" next to it), the quoted run-log words "already holds
 * the patched bytes", Zadig's menus, "subcmd".
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

const pl: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };

export default pl;
