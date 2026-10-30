/**
 * Italiano (it): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language". Standard Italian; the reader is
 * addressed with the informal "tu" imperative throughout ("Collega la termocamera", "Premi …"), as
 * Italian software interfaces and their manuals do today; "Lei" would read as a bank letter here.
 *
 * Glossary (English → italiano). Use these words everywhere; the notes say why where the choice was not obvious.
 * - camera → la termocamera (it is a thermal camera; "fotocamera" is a photo camera, "telecamera" a
 *   video camera). A Compact, a Compact PRO → una Compact (feminine, as the camera)
 * - firmware → il firmware; firmware family → famiglia di firmware; firmware line → linea (di
 *   firmware); build → la build (two builds can share one version, so "versione" cannot stand for it)
 * - slot, bank → lo slot (both: "bank" is the code's word for the same slot; "slot" is what Italian
 *   tech writing says, "lo slot", plural "gli slot"). Slot A → Slot A / slot A; recovery R → slot di
 *   recupero R ("recupero", not "ripristino": restore is "ripristino" and the two must not meet in one
 *   sentence, as in "Ripristina lo slot di recupero R"). Booted bank → lo slot avviato; badge "booted
 *   now" → avviato ora; next start → prossimo avvio; active-slot word → parola dello slot attivo
 * - flash → la memoria flash (la flash in short phrases); the part / the chip → il chip
 * - dump (noun, the file or the whole copy) → il dump; dump (verb, buttons) → estrarre / «Estrai»;
 *   "Dump & decrypt …" tabs → «Estrai e decifra …»; "Dump all selectors" → «Estrai tutti i
 *   selettori»; "Start dump" → «Avvia il dump»
 * - read → leggere / lettura; read-back → rilettura; whole-flash read (the Preserve "drain") → lettura
 *   completa; image → l'immagine (del firmware)
 * - write, flash (verb) → scrivere / scrittura ("Flash decrypted image…" → «Scrivi immagine
 *   decifrata…»); program → programmare; erase → cancellare; commit → conferma della scrittura
 *   (confermare la scrittura; the Preserve step chip "Write" → Scrittura); stage / staging (how a
 *   write's bytes are sent) → trasferire / trasferimento; payload → dati
 * - decrypt → decifrare / decifratura; encrypt → cifrare; plaintext → in chiaro; ciphertext → testo
 *   cifrato; keystream → flusso di chiave
 * - bootloader → bootloader; bootable → avviabile; unbootable → non avviabile, or "rende impossibile
 *   l'avvio della termocamera"; boot config → configurazione di avvio («Config. di avvio» as a label)
 * - key → chiave; Key A / Key B → chiave A / chiave B; per-device key → chiave propria del
 *   dispositivo; key block 1 → blocco di chiavi 1; store key → chiave di archiviazione; check key →
 *   chiave di verifica; stage key → chiave di trasferimento
 * - backup → il backup (what Italian owners and software say); full flash backup → backup completo
 *   della flash; restore → ripristino / ripristinare
 * - run (one pass of the 0.x/1.x wizard) → esecuzione; run file → file di esecuzione
 * - power cycle → spegnere e riaccendere; unplug and replug → scollegare e ricollegare
 * - frame-rate patch → patch della frequenza dei fotogrammi (la patch, feminine); "Make N FPS" →
 *   «Passa a N FPS»; patch (verb) → applicare la patch; patched → con la patch
 * - acceptance sum → somma di controllo; transfer checksum → somma di controllo del trasferimento;
 *   word sum → somma delle parole; header / footer → intestazione / footer
 * - selector → selettore; read window → finestra di lettura; arm (open a window) → aprire;
 *   unlock token → token di sblocco
 * - tab → scheda; tabs are named by their labels (app:tab.*), buttons by their own words, in « »
 *   where a sentence needs to set them apart.
 * Typography: standard Italian, no space before ":", ";", "!", "?". Quotation marks « » (caporali),
 * no spaces inside. Apostrophe ’ (U+2019) everywhere, elisions included (l’immagine, dell’immagine).
 * Sizes KB/MB and bytes B with a space before the unit (README, Units); Hz, FPS, ms, Mbit/s as they
 * are. Plurals: one, many ("1000000 di file") and other.
 * Names in a sentence (README, "Cases", Romance languages): "slot" takes "lo", so every bank name has
 * the same five forms: {bank:acc} lo slot A, {bank:gen} dello slot A, {bank:dat} allo slot A,
 * {bank:loc} nello slot A, {bank:ins} Lo slot A (a sentence that starts with the name); the plain
 * {bank} only where the name stands alone (a label, a row value, after a colon, in brackets). Keys
 * the same way (la chiave A, della chiave A, alla chiave A, nella chiave A; il blocco di chiavi 1,
 * del blocco …). Italian also contracts "da" (dallo) and "su" (sullo), which the five selectors do
 * not carry: "from slot A" is said with "in base allo slot A" ({bank:dat}), "dallo slot avviato
 * ({bank})", or "quella dello slot A"; "on slot A" with "nello slot A" ({bank:loc}).
 * Kept in English: command and register names, family ids (legacy-auth …), CLI options (--resume,
 * --family, allowJump, acknowledgeRisk), the read option names chunk / gap-fill / recipient and their
 * values (interface, device), "stage two", "[inferred]", "wire id", "magic", UNTESTED (with «non
 * testato» next to it), the quoted run-log words "already holds the patched bytes", Zadig's menus.
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

const it: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };
export default it;
