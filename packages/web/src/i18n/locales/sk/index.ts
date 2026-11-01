/**
 * Slovenčina (sk): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language". The reader is addressed formally
 * (vykanie), with the plural imperative usual in Slovak software ("Pripojte kameru", "Kliknite",
 * "Stlačte", "Skontrolujte"). Slovak quotation marks („…“) go around button and tab names inside a
 * sentence. Written as Slovak, not as Czech respelled: súbor, tlačidlo, pamäť, priečinok, zostava.
 *
 * Glossary (English → slovenčina). Use these words everywhere; the notes say why where the choice was not obvious.
 * - firmware → firmvér (the Slovak spelling, declined: firmvéru, firmvérom, vo firmvéri); firmware family →
 *   rodina firmvéru; build → zostava (as Slovak Windows says "zostava" for a build; the version number stays
 *   verzia); line (0.x/1.x line) → rad (masculine: v tomto rade, iný rad)
 * - slot, bank → slot (both: "bank" is the code's word for the same slot; never "banka"). Slot A, Slot B
 *   (common:bank.*); inside a sentence slot A. recovery R → slot na obnovu R: the name starts with "slot",
 *   so every preposition a template writes before a bank name (v, zo, do, so, pri, k) fits slot A and slot
 *   na obnovu R alike, and only "slot" declines (slotu na obnovu R, slotom na obnovu R, v slote na obnovu R).
 *   Plural: sloty, slotov, slotmi. the booted bank → spustený slot; booted now → práve spustený; the other
 *   bank → druhý slot; empty bank → prázdny slot; last-resort copy → posledná záložná kópia
 * - flash (the memory) → pamäť flash (pamäte, pamäti, pamäťou); dump (noun) → výpis; dump (verb, the "Dump"
 *   buttons) → vypísať („Vypísať“, „Vypísať všetky selektory“; "Start dump" → „Spustiť výpis“), never
 *   "vyčítať", which means "to reproach" in Slovak; read → čítať / čítanie; whole-flash read (Preserve's
 *   drain) → čítanie celej pamäte flash; read-back → kontrolné (spätné) čítanie
 * - image → obraz; decrypted image → dešifrovaný obraz; stock/factory image → pôvodný / továrenský obraz;
 *   plaintext → otvorený text / v otvorenej podobe; the 2014 plaintext chain → nešifrovaný reťazec z roku
 *   2014; decrypt → dešifrovať; ciphertext → šifrovaný text; keystream → prúd kľúča
 * - write, flash (verb) → zapísať, zápis ("Flash decrypted image" → „Zapísať dešifrovaný obraz“); erase →
 *   vymazať; commit → potvrdenie (zápisu); stage / staging → odovzdať / odovzdanie (staged as → odovzdáva sa
 *   ako); payload → údaje; arm → aktivovať ("nothing was armed" → nič sa neaktivovalo)
 * - boot / start → štartovať, naštartovať, spustiť; next start → ďalší štart; bootable → spustiteľný;
 *   bootloader → bootloader (bootloadera, v bootloaderi); boot-config word → slovo konfigurácie štartu;
 *   active-slot word → slovo aktívneho slotu
 * - key → kľúč; Key A / Key B → kľúč A / kľúč B (a row label: Kľúč A); per-device key → kľúč zariadenia;
 *   key block → blok kľúčov; store key → kľúč zápisu; check key → kontrolný kľúč; stage key → kľúč na
 *   odovzdanie; key pair → dvojica kľúčov
 * - backup → záloha; full flash backup → úplná záloha pamäte flash; restore → obnoviť / obnovenie (only
 *   ever of a backup, so it does not clash with "slot na obnovu R")
 * - run (one pass of the 0.x/1.x wizard) → beh; run file → súbor behu; step → krok (also where the English
 *   says phase: the page numbers them as steps 02–04); the step chips (core:preserve.step.*) → Záloha,
 *   Záplata, Zápis, Čítanie celej pamäte flash, Obnovenie, Kontrola
 * - patch → záplata, záplatovať; frame-rate patch → záplata snímkovej frekvencie; frame rate → snímková
 *   frekvencia; "Make N FPS" → „Nastaviť N FPS“; "Make N FPS in every bank" → „Nastaviť N FPS vo všetkých
 *   slotoch“
 * - acceptance sum → kontrolný súčet; word sum → súčet slov; transfer checksum → kontrolný súčet prenosu;
 *   header / footer → hlavička / pätička
 * - power cycle → vypnúť a znova zapnúť; unplug and replug → odpojiť a znova pripojiť
 * - selector → selektor; read window → okno čítania; unlock token → odomykací token; corpus → zbierka;
 *   log → protokol; download (the file) → stiahnutý súbor; downloads folder → priečinok so stiahnutými súbormi
 * - camera → kamera; tab → karta (as Slovak browsers say); tabs are named by their labels in „…“ (app:tab.*),
 *   or short: karta 4.x/Nano, karta 0.x/1.x, karta slotov, karta Info
 * - Sizes: KB and MB (never KiB/MiB) with a space after the number; B, Hz, FPS as they are; a size used as an
 *   adjective is said "s veľkosťou 64 KB", never glued ("64KB slot"). The one decimal the code formats itself
 *   (the family score, toFixed) keeps its dot, so "z 1" stands for "of 1.00".
 * - Typography: a non-breaking space after the one-letter prepositions and conjunctions (v, k, s, z, o, u, a,
 *   i), as Slovak typesetting does; "50 %" with a space; the ellipsis right after the word ("Číta sa…"), except
 *   where a comment asks to keep the English " ...".
 *
 * Cases around params. A bank or key name is declined with a case selector (../../README.md, "Cases"):
 * `{bank:gen}` zo slotu A / do slotu A, `{bank:dat}` slotu A, `{bank:acc}` slot A, `{bank:ins}` slotom A,
 * `{bank:loc}` v slote A / pri slote A; `{key:ins}` kľúčom A. The forms are in common.ts (bank.*:case, lower
 * case also for the label forms Slot A / Slot na obnovu R, since a case form is always said inside a sentence),
 * shared.ts (deviceInfo.otherBank:case, druhý slot) and core.ts (keyName.*:case). The template writes the
 * preposition in the form "slot" needs: "zo {bank:gen}", "so {bank:ins}", "v {bank:loc}", which is right for
 * slot, slotu na obnovu and spustený slot alike. "Druhý slot" would need "z druhého", so the one sentence that
 * may name it (deviceInfo.orphanIsTarget) puts it in the accusative with no preposition. A list ({banks},
 * {order}) takes the case on each name. A plain `{bank}` is the nominative, which is also the accusative of
 * these masculine inanimate nouns. A param that is not always a name (a nested sentence, "žiadny slot", a
 * capitalised label) is not declined: the sentence is turned so the nominative fits, or it goes after a colon.
 * preserve:confirm.chosenBanks is the genitive "zvolených slotov", because confirm.titleWrite is its only use,
 * as "zapísať do {banks:gen}". core:write.ack.bootUnnamed starts with a capital: it opens a sentence in
 * write.ack.risk, as boot.bootsNow does.
 * Plurals: one / few / many / other (1 slot, 2–4 sloty, a fraction → slotu, 0 and 5+ slotov); a count whose
 * noun cannot be declined around it is written as a label ("prečítané okná: {read}/{expected}").
 * Kept in English: command and register names, family ids (legacy-auth …), CLI options (--resume, --family,
 * allowJump, acknowledgeRisk), the read option names chunk / gap-fill / recipient and its values interface /
 * device, "stage two", "[inferred]", UNTESTED (with "nevyskúšané" next to it), the quoted run-log words
 * "already holds the patched bytes", Zadig's menus, "subcmd", "wire id".
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

const sk: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };

export default sk;
