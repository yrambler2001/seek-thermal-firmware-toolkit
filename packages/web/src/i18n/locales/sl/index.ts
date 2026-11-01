/**
 * Slovenščina (sl): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language". The reader is addressed formally
 * (vikanje), with the plural imperative usual in Slovenian software ("Povežite kamero", "Kliknite",
 * "Pritisnite", "Preverite"); buttons and menu entries are in the singular imperative, as Slovenian
 * Windows and Android write them ("Prekliči", "Preberi reže", "Zapiši v režo A…"), and a sentence names
 * a button by that label in „…“. Slovenian quotation marks „…“ throughout (never »…«).
 *
 * Glossary (English → slovenščina). Use these words everywhere; the notes say why where the choice was not obvious.
 * - firmware → vdelana programska oprema (the term Slovenian Windows, Android and Apple use; declined:
 *   vdelane programske opreme, z vdelano programsko opremo, v vdelani programski opremi), never the loan
 *   "firmware"/"firmver"; firmware family → družina vdelane programske opreme; firmware line (0.x/1.x)
 *   → serija; build → izdaja (izdaja 1.3.0.8 FF, izdaja 8 Hz); version → različica
 * - slot, bank → reža (both: "bank" is the code's word for the same slot; never "banka" or "slot").
 *   Reža is feminine, so every adjective and participle after a bank name is feminine ("reža A je
 *   prazna", "zagnana reža", "ni bila prebrana"). Reža A, Reža B (common:bank.*); inside a sentence
 *   reža A. recovery R → obnovitvena reža R (as Windows says obnovitveni pogon, obnovitvena particija):
 *   adjective + reža, so every preposition a template writes before a bank name (iz, v, z, k, pri, za)
 *   fits reža A and obnovitvena reža R alike, and both decline the same way (iz obnovitvene reže R,
 *   v obnovitveni reži R, z obnovitveno režo R). The other bank → druga reža (iz druge reže, v drugo
 *   režo), again feminine with the same prepositions. Plural reže, rež, režam, režah, režami; dual
 *   reži, režama. the booted bank → zagnana reža; booted now → zdaj zagnana; empty bank → prazna reža;
 *   last-resort copy → zadnja rezervna kopija
 * - flash (the memory) → bliskovni pomnilnik (bliskovnega pomnilnika, v bliskovnem pomnilniku); the
 *   whole-flash read (Preserve's drain) → branje celotnega pomnilnika; dump (noun) → izpis (as "izpis
 *   pomnilnika"); dump (the buttons) → „Izpiši“, „Izpiši vse selektorje“, "Start dump" → „Začni izpis“;
 *   read → branje / prebrati; read-back → kontrolno branje, kontrolno prebrati
 * - image → slika (slika vdelane programske opreme, as "slika diska"); decrypted image → dešifrirana
 *   slika; stock/factory image → tovarniška slika; plaintext → nešifrirano / nešifrirana slika; the 2014
 *   plaintext chain → nešifrirana veriga iz leta 2014; decrypt → dešifrirati; ciphertext → šifrirano
 *   besedilo; keystream → tok ključa
 * - write, flash (verb) → zapisati, zapis ("Flash decrypted image" → „Zapiši dešifrirano sliko“);
 *   erase → izbrisati; commit → potrditev (zapisa); stage / staging → pripraviti / priprava (staged as →
 *   pripravljeno kot); payload, upload → vsebina (prenosa), prenos; arm → aktivirati ("nothing was armed"
 *   → nič ni bilo aktivirano)
 * - boot / start → zagnati, zagon; boots from → se zažene iz; next start → naslednji zagon; bootable →
 *   zagonska (a cell about a reža), nezagonska; bootloader → zagonski nalagalnik; boot-config word →
 *   beseda zagonske konfiguracije; active-slot word → beseda aktivne reže
 * - key → ključ (masculine); Key A / Key B → ključ A / ključ B (a row label: Ključ A); per-device key →
 *   ključ naprave; key block → blok ključev; store key → ključ zapisa; check key → kontrolni ključ; stage
 *   key → ključ za pripravo; key pair → par ključev. "With/under a key" is "pod" + instrumental (pod
 *   ključem A, pod blokom ključev 1), so a template never has to choose between s and z before a key name.
 * - backup → varnostna kopija; full flash backup → polna varnostna kopija; restore → obnoviti / obnovitev
 *   (from a backup), povrniti (put the original firmware back)
 * - run (one pass of the 0.x/1.x wizard) → izvedba; run file → datoteka izvedbe; step → korak (also where
 *   the English says phase); the step chips (core:preserve.step.*) → Varnostna kopija, Popravek, Zapis,
 *   Branje celotnega pomnilnika, Obnovitev, Preverjanje; the gate sentences' step names
 *   (core:preserve.stepId.*) → korak popravka, korak zapisa, …
 * - patch → popravek, popraviti; frame-rate patch → popravek hitrosti sličic; frame rate → hitrost sličic;
 *   "Make N FPS" → „Nastavi N FPS“; "Make N FPS in every bank" → „Nastavi N FPS v vseh režah“; a rate is
 *   "teče pri 16 Hz", and a change of rate "8 Hz → 16 Hz" or "namesto pri 8 Hz teče pri 16 Hz", so no
 *   template needs s/z before a number
 * - acceptance sum → kontrolna vsota za sprejem; word sum → vsota besed; transfer checksum → kontrolna vsota
 *   prenosa; header / footer → glava / noga
 * - power cycle → izklopiti in vklopiti; unplug and replug → odklopiti in znova priklopiti
 * - selector → selektor; read window → bralno okno; unlock token → odklepni žeton; corpus → zbirka; log →
 *   dnevnik; downloads folder → mapa s prenosi (Android's Prenosi)
 * - camera → kamera; tab → zavihek; tabs are named by their labels in „…“ (app:tab.*), or short: zavihek
 *   4.x/Nano, zavihek 0.x/1.x, zavihek z režami, zavihek Informacije
 * - Sizes: KB and MB (never KiB/MiB) with a space after the number; B, Hz, FPS as they are; a size used as
 *   an adjective is said "velikosti 64 KB" ("reža velikosti 64 KB"), never glued. "50 %" with a space.
 *   The one decimal the code formats itself (the family score, toFixed) keeps its dot, so "od 1.00"
 *   stands next to it. The ellipsis keeps the English spacing ("Branje …"; "Izberi datoteko…" on a button).
 * - Typography: a non-breaking space after the one-letter prepositions and conjunctions (v, k, h, s, z,
 *   o, a, i), added by i18n-gen/sl/nbsp.mjs; „…“ quotation marks.
 *
 * Cases around params. A bank or key name is declined with a case selector (../../README.md, "Cases"):
 * `{bank:gen}` iz reže A / pri obnovi reže A, `{bank:dat}` reži A, `{bank:acc}` v režo A / Kopiraj v
 * režo A, `{bank:ins}` z režo A, `{bank:loc}` v reži A / pri reži A; `{key:ins}` pod ključem A. The
 * forms are in common.ts (bank.*:case, lower case also for the label forms Reža A / Obnovitvena reža R,
 * since a case form is always said inside a sentence; `:nom` gives the lower-case label where a label is
 * the subject mid-sentence), shared.ts (deviceInfo.otherBank:case, druga reža) and core.ts (keyName.*:case).
 * A negated verb takes the genitive, as Slovenian requires ("reže A ni mogoče zapisati", "ne odpre reže A",
 * "načrt nima reže A"). A list ({banks}, {order}) takes the case on each name. A param that is not always
 * a name (a nested sentence, "nobena reža", a capitalised label) is not declined: it goes before a colon.
 * preserve:confirm.chosenBanks is the accusative "izbrane reže", because confirm.titleWrite is its only
 * use, as "zapis v {banks:acc}". core:boot.bootsNow is a whole sentence starting with "Kamera" ("Kamera se
 * zdaj zažene iz reže A"), so it can open write.ack.risk, writeConfirm.booted and fpsConfirm.booted;
 * core:write.ack.bootUnnamed starts with a capital for the same reason.
 *
 * Plurals: one / two / few / other (1, 101 datoteka; 2, 102 datoteki — the dual; 3, 4, 103 datoteke;
 * 0, 5–100 datotek). The dual also binds verbs: two named subjects take a dual verb ("Branje in izpis
 * ne spremenita ničesar", "Koraka 03 in 04 pišeta"). Where a template does not know whether it names
 * two banks or three (status.cancelled.many, fpsEvery.order, backup.plan.many, preserve.fail.landed),
 * it is turned so no verb agrees with the list. A count whose noun cannot agree around it is written as
 * a label ("prebrana okna: {read}/{expected}").
 *
 * Kept in English: command and register names, family ids (legacy-auth …), CLI options (--resume,
 * --family, allowJump, acknowledgeRisk), the read option names chunk / gap-fill / recipient and its values
 * interface / device, "stage two", "[inferred]", UNTESTED (with "nepreizkušeno" next to it), "wire id",
 * "subcmd", the quoted run-log words "already holds the patched bytes", Zadig's menus.
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

const sl: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };

export default sl;
