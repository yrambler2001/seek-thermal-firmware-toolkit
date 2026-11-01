/**
 * Čeština (cs): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language". The reader is addressed formally
 * (vykání), with the plural imperative usual in Czech software ("Připojte kameru", "Klikněte",
 * "Zkontrolujte"). Czech quotation marks („…“) go around button and tab names inside a sentence.
 *
 * Glossary (English → čeština). Use these words everywhere; the notes say why where the choice was not obvious.
 * - firmware → firmware (masculine, declined: firmwaru, firmwarem); firmware family → rodina firmwaru;
 *   build → sestavení (the version number stays verze); line (0.x/1.x line) → řada
 * - slot, bank → slot (both: "bank" is the code's word for the same slot; never "banka"). Slot A,
 *   Slot B (common:bank.*); inside a sentence slot A. recovery R → slot pro obnovu R: the name starts
 *   with "slot", so every preposition a template writes before a bank name (ve, ze, se, ke) fits
 *   slot A and slot pro obnovu R alike, and only "slot" declines (slotu pro obnovu R, slotem pro
 *   obnovu R). the booted bank → spuštěný slot; booted now → právě spuštěný; the other bank → druhý
 *   slot; empty bank → prázdný slot; last-resort copy → poslední záložní kopie
 * - flash (the memory) → paměť flash; dump (noun) → výpis; dump (verb, the "Dump" buttons) → vyčíst
 *   („Vyčíst“, „Vyčíst všechny selektory“; "Start dump" → „Spustit výpis“); read → číst / čtení;
 *   whole-flash read (Preserve's drain) → čtení celé paměti flash; read-back → kontrolní (zpětné) čtení
 * - image → obraz; decrypted image → dešifrovaný obraz; stock/factory image → původní / tovární obraz;
 *   plaintext → otevřený text / v otevřené podobě; the 2014 plaintext chain → nešifrovaný řetězec z roku
 *   2014; decrypt → dešifrovat; ciphertext → šifrovaný text; keystream → proud klíče
 * - write, flash (verb) → zapsat, zápis ("Flash decrypted image" → „Zapsat dešifrovaný obraz“); erase →
 *   smazat; commit → potvrzení (zápisu); stage / staging → předat / předání (staged as → předává se jako);
 *   payload → data; arm → aktivovat ("nothing was armed" → nic nebylo aktivováno)
 * - boot / start → startovat, nastartovat, spustit; next start → příští start; bootable → spustitelný;
 *   bootloader → bootloader; boot-config word → slovo konfigurace startu; active-slot word → slovo
 *   aktivního slotu
 * - key → klíč; Key A / Key B → klíč A / klíč B (a row label: Klíč A); per-device key → klíč zařízení;
 *   key block → blok klíčů; store key → klíč zápisu; check key → kontrolní klíč; stage key → klíč pro
 *   předání; key pair → dvojice klíčů
 * - backup → záloha; full flash backup → úplná záloha paměti flash; restore → obnovit / obnovení
 *   (only ever of a backup, so it does not clash with "slot pro obnovu R")
 * - run (one pass of the 0.x/1.x wizard) → běh; run file → soubor běhu; step → krok (also where the
 *   English says phase: the page numbers them as steps 02–04); the step chips (core:preserve.step.*)
 *   → Záloha, Záplata, Zápis, Čtení celé paměti flash, Obnovení, Kontrola
 * - patch → záplata, záplatovat; frame-rate patch → záplata snímkové frekvence; frame rate →
 *   snímková frekvence; "Make N FPS" → „Nastavit N FPS“; "Make N FPS in every bank" → „Nastavit N FPS
 *   ve všech slotech“
 * - acceptance sum → kontrolní součet; word sum → součet slov; transfer checksum → kontrolní součet
 *   přenosu; header / footer → hlavička / patička
 * - power cycle → vypnout a znovu zapnout; unplug and replug → odpojit a znovu připojit
 * - selector → selektor; read window → okno čtení; unlock token → odemykací token; corpus → sbírka
 * - camera → kamera; tab → karta (as Czech browsers say); tabs are named by their labels in „…“
 *   (app:tab.*), or short: karta 4.x/Nano, karta 0.x/1.x, karta slotů, karta Info
 * - Sizes: KB and MB (never KiB/MiB) with a space after the number; B, Hz, FPS as they are; a size
 *   used as an adjective is said "o velikosti 64 KB", never glued ("64KB slot"). The one decimal the
 *   code formats itself (the family score, toFixed) keeps its dot, so "z 1" stands for "of 1.00".
 * - Typography: a non-breaking space after the one-letter prepositions and conjunctions (v, k, s, z,
 *   o, u, a, i), as Czech typesetting does; "50 %" with a non-breaking space.
 *
 * Cases around params. A bank or key name is declined with a case selector (../../README.md, "Cases"):
 * `{bank:gen}` ze slotu A / do slotu A, `{bank:dat}` slotu A, `{bank:acc}` slot A, `{bank:ins}` slotem A,
 * `{bank:loc}` ve slotu A; `{key:ins}` klíčem A. The forms are in common.ts (bank.*:case, lower case
 * also for the label forms Slot A / Slot pro obnovu R, since a case form is always said inside a
 * sentence), shared.ts (deviceInfo.otherBank:case, druhý slot) and core.ts (keyName.*:case). The
 * template writes the preposition in its vocalised form, "ve {bank:loc}", "ze {bank:gen}", which is
 * right before slot, slotu pro obnovu, druhém slotu and spuštěném slotu alike. A list ({banks},
 * {order}) takes the case on each name. A plain `{bank}` is the nominative, which is also the
 * accusative of these masculine inanimate nouns. A param that is not always a name (a nested
 * sentence, "žádný slot", a capitalised label) is not declined: the sentence is turned so the
 * nominative fits, or it goes after a colon. preserve:confirm.chosenBanks is the genitive
 * "zvolených slotů", because confirm.titleWrite is its only use, as "zapsat do {banks:gen}".
 * Plurals: one / few / many / other (1 slot, 2–4 sloty, a fraction → slotu, 0 and 5+ slotů); a count
 * whose noun cannot be declined around it is written as a label ("přečtená okna: {read}/{expected}").
 * Kept in English: command and register names, family ids (legacy-auth …), CLI options (--resume,
 * --family, allowJump, acknowledgeRisk), the read option names chunk / gap-fill / recipient and its
 * values interface / device, "stage two", "[inferred]", UNTESTED (with "nevyzkoušeno" next to it),
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

const cs: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };

export default cs;
