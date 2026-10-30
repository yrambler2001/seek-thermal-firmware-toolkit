/**
 * Français (fr): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language". Standard French (France), the reader
 * is addressed with "vous" throughout.
 *
 * Glossary (English → français). Use these words everywhere; the notes say why where the choice was not obvious.
 * - firmware → le firmware (what French camera owners and forums say; "micrologiciel" is the official
 *   term but rare and longer); firmware family → famille de firmware; firmware line → lignée;
 *   build → le build ("the 8 Hz build" → le build 8 Hz: two builds can share one version, so
 *   "version" cannot stand for it)
 * - slot, bank → emplacement (both: "bank" is the code's word for the same slot; it is the word
 *   French Android A/B documentation uses). Slot A → Emplacement A / emplacement A; recovery R →
 *   emplacement de secours R. The booted bank → l'emplacement démarré; the bank the camera boots now →
 *   l'emplacement depuis lequel la caméra démarre actuellement; badge "booted now" → démarré; next
 *   start → prochain démarrage; active-slot word → mot de l'emplacement actif
 * - flash → la mémoire flash (la flash in short phrases); the part / the chip → la puce
 * - dump (noun, the file or the whole copy) → le dump (what owners say); dump (verb, buttons) →
 *   extraire / « Extraire »; "Dump & decrypt …" tabs → « Extraire et déchiffrer … »; "Dump all
 *   selectors" → « Extraire tous les sélecteurs »; "Start dump" → « Lancer le dump »
 * - read → lire / lecture; read-back → relecture; whole-flash read (the Preserve "drain") → lecture
 *   complète (chip: « Lecture complète »); image → image (une image de firmware)
 * - write, flash (verb) → écrire / écriture ("Flash decrypted image…" → « Écrire l'image déchiffrée… »);
 *   program → programmer; erase → effacer; commit → validation (valider); stage / staging (how a
 *   write's bytes are sent) → transférer / transfert; payload → données
 * - bootloader → bootloader (as French firmware guides say; "chargeur d'amorçage" is unknown to most
 *   owners); bootable → démarrable; unbootable → impossible à démarrer; boot config → configuration de
 *   démarrage (« Config. de démarrage » as a row label)
 * - key → clé; Key A / Key B → clé A / clé B; per-device key → clé propre à l'appareil; key block 1 →
 *   bloc de clés 1; store key → clé de stockage; check key → clé de vérification; stage key → clé de
 *   transfert; keystream → flux de clé; plaintext → en clair / texte clair; ciphertext → texte chiffré
 * - backup → sauvegarde; full flash backup → sauvegarde complète de la flash; restore → restauration
 * - run (one pass of the 0.x/1.x wizard) → exécution; run file → fichier d'exécution ("session" would
 *   suggest the browser, "passe" reads as "mot de passe")
 * - power cycle → éteindre puis rallumer / remise sous tension; unplug and replug → débrancher puis
 *   rebrancher
 * - frame-rate patch → correctif de fréquence d'images; "Make N FPS" → « Passer à N FPS »; patch
 *   (Preserve's temporary patch, the step chip) → correctif; patch (verb) → corriger; patched → corrigé
 * - acceptance sum → somme de contrôle (the sum the bootloader checks); transfer checksum → somme de
 *   contrôle du transfert; word sum → somme des mots; header / footer → en-tête / pied
 * - selector → sélecteur; read window → fenêtre de lecture; arm (open a window) → ouvrir ("nothing
 *   was armed" → « rien n'a été ouvert »); unlock token → jeton de déverrouillage
 * - tab → onglet; tabs are named by their labels (app:tab.*) in « … », buttons by their own words.
 * Typography: « … » with a no-break space (U+00A0) inside; U+00A0 before ":" and between a number or
 * a {param} and its unit; a narrow no-break space (U+202F) before ";", "!", "?". A `code` span or a
 * {param} before one of these marks gets the same space ("`{x}` :", "{label} :"). Apostrophe ’.
 * Sizes Ko/Mo, bytes o (README, Units); Hz, FPS, ms, Mbit/s as they are. A list or a thousands
 * figure written in the text uses U+202F (65 536).
 * Names in a sentence (README, "Cases", Romance languages): {bank:acc} l'emplacement A, {bank:gen}
 * de l'emplacement A, {bank:dat} à l'emplacement A, {bank:loc} dans l'emplacement A, {bank:ins}
 * L'emplacement A (a sentence that starts with the name); the plain {bank} only where the name
 * stands alone (a label, a row value, after a colon). Keys the same way (la clé A, de la clé A, du
 * bloc de clés 1, au bloc de clés 1).
 * Kept in English: command and register names, family ids (legacy-auth …), CLI options (--resume,
 * --family, allowJump, acknowledgeRisk), the read option names chunk / gap-fill / recipient and their
 * values (interface, device), "stage two", "[inferred]", UNTESTED (with « non testé » next to it), the
 * quoted run-log words "already holds the patched bytes", Zadig's menus.
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

const fr: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };
export default fr;
