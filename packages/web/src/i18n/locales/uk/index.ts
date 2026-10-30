/**
 * Українська (uk): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language". The reader is addressed with the
 * polite plural imperative usual in Ukrainian software and manuals ("Від’єднайте камеру", "Натисніть"),
 * consistently. Quotation marks are «…» (button and tab names inside a sentence are quoted with them).
 * The apostrophe is the typographic ’ (U+2019) everywhere: під’єднати, флеш-пам’ять, з’єднання; never
 * the ASCII ' inside a word.
 *
 * Glossary (English → українська). Use these words everywhere; the notes say why where the choice was
 * not obvious.
 * - firmware → прошивка; firmware family → сімейство прошивок; build → збірка ("the 8 Hz build" →
 *   збірка 8 Hz); version → версія; firmware line → лінійка (прошивок); running firmware → робоча
 *   прошивка; stock/factory image → заводський образ
 * - slot, bank → слот, always (also where the English says "bank": it is the same slot; never «банк»).
 *   Slot A → Слот A, Recovery R → Слот відновлення R (common:bank.*); inside a sentence слот A,
 *   слот відновлення R. booted bank → слот, з якого запущено камеру (the badge "booted now" → запущений
 *   зараз); next start → наступний запуск; empty bank → порожній слот; the last-resort copy → остання
 *   резервна копія
 * - flash (the memory) → флеш-пам’ять; dump (noun, the file, the "Dump" button) → дамп; dump (verb),
 *   read → зчитати / зчитування (the CLI's "dump" is "зняти дамп" where it means taking the file);
 *   whole-flash read (Preserve's drain) → повне зчитування; read-back → контрольне зчитування
 * - image → образ; decrypt → розшифрувати; decrypted image → розшифрований образ; plaintext →
 *   незашифрований / відкритий текст (as a table value "немає (незашифровано)")
 * - write, flash (verb) → записати, запис ("Flash decrypted image…" → «Записати розшифрований образ…»);
 *   erase → стерти; commit → підтвердження запису (the camera's CompleteMemoryUpgrade, the step that
 *   makes a staged upload land in flash; the Preserve chip "Write" is «Запис»); the write is "not on
 *   record" → запис не зафіксовано; program (the flash) → програмувати
 * - stage / staging → передавати / передавання (the upload as it goes over USB); staged length →
 *   довжина для передавання; payload → дані; transfer checksum → контрольна сума передачі
 * - boot / start → запуск, запускатися; bootable → придатний до запуску / «Запускається» (column);
 *   bootloader → завантажувач; boot-config word → слово конфігурації запуску; active-slot word → слово
 *   активного слота
 * - key → ключ; Key A / Key B → ключ A / ключ B (lower case also in a table cell, as a name inside
 *   Ukrainian text; the row labels "Key A" in deviceInfo stay «Ключ A»); per-device key → ключ пристрою;
 *   key block → блок ключів; store key → ключ зберігання; check key → ключ перевірки; stage key → ключ
 *   передавання; keystream → потік ключа; ciphertext → шифротекст
 * - backup → резервна копія; full flash backup → повна резервна копія флеш-пам’яті
 * - run (one pass of the 0.x/1.x wizard) → прогін; run file → файл прогону ("запуск" is taken by boot,
 *   "сеанс" would suggest a browser session); step → крок; phase → етап; resume → продовжити
 * - power cycle → вимкнути й увімкнути живлення; unplug and replug → від’єднати й під’єднати знову;
 *   a fresh power-up → наново ввімкнути
 * - frame-rate patch → патч частоти кадрів; "Make N FPS" → «Зробити N FPS»; patch (verb) → пропатчити;
 *   patched → пропатчений
 * - acceptance sum → контрольна сума (the sum the bootloader checks); word sum → сума слів; header /
 *   footer → заголовок / кінцевий блок
 * - restore → відновити / відновлення; verify, check → перевірка; selector → селектор; read window →
 *   вікно зчитування; arm → активувати; unlock token → токен розблокування; mode N → режим N;
 *   corpus → зібрані образи
 * - tab → вкладка; tabs are named by their labels in «…» (app:tab.*), or short: вкладка 4.x/Nano,
 *   вкладка 0.x/1.x, вкладка слотів. Buttons named in a sentence use the button's own words
 *   («Під’єднати пристрій», «Зчитати слоти», «Зчитати всі селектори», «Почати дамп»).
 * - Sizes: КБ and МБ (never КіБ/МіБ) with a space after the number; bytes are Б («64 Б»), to match
 *   КБ/МБ; Hz, FPS and Mbit/s as they are.
 *
 * Cases around params. A bank or key name is declined with a case selector (../../README.md, "Cases"):
 * `{bank:gen}` з/до/для/без слота A, `{bank:dat}` слоту A, `{bank:acc}` у слот A, `{bank:ins}` слотом A,
 * `{bank:loc}` у слоті A; `{key:ins}` під ключем A, `{masks:gen}` потоки ключів ключа A. The forms are in
 * common.ts (bank.*:case, lower case also for the label forms, since a case form is always said inside
 * a sentence) and core.ts (keyName.*:case). "слот" takes the genitive -а (слота), as a concrete object.
 * The accusative of these inanimate nouns equals the nominative; it is still written where the grammar
 * asks for it. A param that is not a name (a nested sentence, a build name, "вибрані слоти") cannot be
 * declined: there the sentence is turned so the nominative fits, or the value follows a colon or a
 * label ("наступний запуск: {next}", "(збірка: {build})").
 * Plurals: one / few / many / other (1 слот, 2–4 слоти, 5+ слотів, a fraction → слота). Where a noun
 * after a count or a fraction like {read}/{count} cannot agree, the count is written as a label
 * ("зчитано слотів: {read}/{count}").
 * Kept in English: command, register and option names, family ids (legacy-auth …), CLI options
 * (--resume, --family, allowJump, acknowledgeRisk), the read option names chunk / gap-fill / recipient
 * and their values interface / device, "stage two", "[inferred]", UNTESTED (with «не перевірено» next to
 * it), the quoted run-log words "already holds the patched bytes", Zadig's menus, "subcmd", wire ids,
 * the project name "Preserve" (the 0.x/1.x wizard) and the page title.
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

const uk: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };

export default uk;
