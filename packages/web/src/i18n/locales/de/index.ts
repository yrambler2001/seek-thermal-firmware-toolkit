/**
 * Deutsch (de): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language". The reader is addressed with "Sie"
 * throughout; German quotation marks („…“) are used around button and tab names inside a sentence.
 *
 * Glossary (English → Deutsch). Use these words everywhere; the notes say why where the choice was not obvious.
 * - firmware → Firmware; firmware family → Firmware-Familie; firmware line ("the 0.x/1.x line") →
 *   Firmware-Linie / Linie; build → Build (der Build: "the 8 Hz build" → der 8-Hz-Build)
 * - slot, bank → Slot (der Slot, both: "bank" is the code's word for the same slot; "Steckplatz" is
 *   hardware). Slot A, Slot B, Recovery-Slot R (label and sentence alike: German capitalises nouns).
 *   A bank name is used without an article ("in Slot A", "aus Slot A"), so it fits every case.
 *   the booted bank → der gestartete Slot; empty bank → leerer Slot; the recovery bank, the
 *   last-resort copy → der Recovery-Slot, die letzte Rückfallkopie
 * - flash (the memory) → Flash-Speicher (Flash- in compounds); dump (noun, a flash dump file) →
 *   Flash-Abbild / Abbild; dump (verb, button "Dump") → auslesen / „Auslesen“; read → lesen
 * - image (firmware image) → Image (das Image; "Abbild" is kept for the whole-flash file so the two
 *   never mix); decrypted image → entschlüsseltes Image; stock/factory image → Original-Image /
 *   Werks-Image; raw bytes → Rohdaten
 * - write, flash (verb), program → schreiben / beschreiben (a slot), programmieren for the chip step;
 *   erase → löschen; commit → Commit (the write's final command; also "per Commit"); read-back →
 *   Rücklesen / die zurückgelesenen Daten
 * - boot / start → starten; next start → nächster Start; last start → letzter Start; bootable →
 *   startfähig; unbootable → startunfähig; bootloader → Bootloader; enter a bank (bootloader) →
 *   anspringen; boot config / boot-config word → Boot-Konfiguration / Boot-Konfigurationswort;
 *   active-slot word → Aktiv-Slot-Wort
 * - key → Schlüssel; Key A / Key B → Schlüssel A / Schlüssel B; per-device key → Geräteschlüssel (a
 *   noun with no adjective ending, so it fits every case); key block 0 → Schlüsselblock 0; store key →
 *   Speicherschlüssel; check key → Prüfschlüssel; keystream → Schlüsselstrom; plaintext → Klartext;
 *   ciphertext → Chiffretext; stage key → Übertragungsschlüssel
 * - backup → Sicherung; full flash backup → (vollständige) Flash-Sicherung; back up → sichern
 * - run (one pass of the 0.x/1.x wizard) → Durchlauf; run file → Durchlaufdatei ("Sitzung" would
 *   suggest a browser session; the file is the record of one Durchlauf); the preservation run →
 *   der Preserve-Durchlauf (Preserve stays as the wizard's name)
 * - power cycle → aus- und wieder einschalten (never "Stromzyklus"); unplug and replug → abziehen und
 *   wieder einstecken; a fresh power-up → frisch eingeschaltet
 * - frame-rate patch → Bildraten-Patch; "Make N FPS" → „Auf N FPS umstellen“; patch (verb) → patchen
 * - acceptance sum → Prüfsumme (the sum the bootloader checks); acceptance check → Annahmeprüfung;
 *   word sum → Wortsumme; transfer checksum → Übertragungs-Prüfsumme (hyphenated so a narrow cell can wrap); header / footer → Header / Footer
 * - stage / staging (how a write's bytes are sent) → übertragen / Übertragung, Übertragungsform;
 *   payload → Nutzdaten
 * - whole-flash read (the Preserve "drain") → volles Auslesen (chip: „Volles Auslesen“); restore →
 *   Wiederherstellung / wiederherstellen ("recovery" stays Recovery, so the two never mix); verify,
 *   check → Prüfung / prüfen
 * - selector → Selektor; read window → Lesefenster; arm (open a window) → öffnen ("nothing was armed"
 *   → „es wurde kein Fenster geöffnet“); selectors armed (a count) → Selektoren aktiviert
 * - unlock token → Entsperr-Token; wire id → Wire-ID; mode N → Modus N; corpus → Sammlung
 * - Tabs are named by their labels in „…“ (app:tab.*), or short: der 4.x/Nano-Tab, der 0.x/1.x-Tab,
 *   der Slots-Tab, der Tab „Info“. Buttons are quoted in their own words („Gerät verbinden“,
 *   „Slots lesen“, „Entschlüsseltes Image schreiben“).
 * - Sizes: KB and MB (never KiB/MiB), with a space after the number, or hyphenated in a compound
 *   ("64-KB-Slot"); B, Hz, FPS as they are; 65.536 with a German thousands dot where English wrote it.
 * Kept in English: command and register names, family ids (legacy-auth …), CLI options (--resume,
 * --family, allowJump, acknowledgeRisk), the read option names chunk / gap-fill / recipient, "stage two",
 * "[inferred]", UNTESTED (with "ungetestet" next to it), the quoted run-log words "already holds the
 * patched bytes", Zadig's menus.
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

const de: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };
export default de;
