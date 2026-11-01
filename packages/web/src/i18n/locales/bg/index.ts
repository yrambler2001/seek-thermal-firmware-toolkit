/**
 * Български (bg): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language" and the Bulgarian note under "Notes
 * for the languages added after Romanian". The reader is addressed formally, with the plural «Вие»
 * imperative usual in Bulgarian manuals and software ("Свържете камерата", "Натиснете", "Изберете");
 * the pronoun is written in lower case inside a sentence (ви, вашата), as software does. Buttons are
 * verbal nouns, as Bulgarian Chrome and Android write them ("Свързване на устройство", "Отказ"), so a
 * button never addresses the reader in another register. Quotation marks are „…“; button and tab names
 * inside a sentence are quoted with them and use the button's or tab's own words. The clitic "her" is
 * written ѝ, to keep it apart from the conjunction и.
 *
 * Glossary (English → български). Use these words everywhere; the notes say why where the choice was
 * not obvious. Words are the ones Bulgarian technical users write (Android and electronics forums):
 * фърмуер, буутлоудър, флаш памет, дъмп, пач.
 * - slot, bank → слот, always (also where the English says "bank": it is the same slot; never «банка»).
 *   Slot A → Слот A; recovery R → слот за възстановяване R (label: Слот за възстановяване R). "за
 *   възстановяване" follows the noun, so the article lands on "слот" for all three names and one
 *   template serves A, B and R ("в слота A", "в слота за възстановяване R"). booted bank → слотът, от
 *   който е стартирала камерата; the badge "booted now" → стартиран сега; next start → следващото
 *   стартиране; empty bank → празен слот; last-resort copy → копието за краен случай (not "резервно",
 *   which belongs to backup); the other bank → другият слот
 * - firmware → фърмуер (the usual Bulgarian word; прошивка is Russian slang); build → компилация (the
 *   number stays версия: "компилацията 8 Hz 1.3.0.8"); firmware family → семейство фърмуер; line (0.x/1.x
 *   line) → линия; vendor app → фирменото приложение; stock/factory image → заводски образ
 * - flash (the memory) → флаш памет; whole-flash read (Preserve's drain) → пълно четене; dump (noun, the
 *   file and the "Dump" buttons) → дъмп; dump (verb) → правя дъмп; read → четене / прочитане;
 *   read-back → контролно прочитане (прочита се обратно)
 * - image → образ (образ на фърмуера); decrypt → дешифрирам / дешифриране; decrypted image →
 *   дешифриран образ; plaintext → нешифрован / в открит вид; ciphertext → шифриран текст; keystream →
 *   ключов поток
 * - write, flash (verb) → записвам / запис ("Flash decrypted image" → „Запис на дешифриран образ“);
 *   erase → изтривам; commit → потвърждаване на записа (CompleteMemoryUpgrade; "(commit)" added where
 *   the camera's own step is meant); stage / staging → изпращам / изпращане (staged length → дължина за
 *   изпращане, staging form → форма за изпращане); payload → данни; arm → активирам
 * - boot / start → стартира / стартиране; bootable → годен за стартиране (the table column "Bootable" →
 *   „Стартира“, its values стартира / не стартира); bootloader → буутлоудър; boot-config word → дума за
 *   конфигурация на стартирането; active-slot word → дума на активния слот
 * - key → ключ; Key A / Key B → ключ A / ключ B (lower case inside a sentence; the row labels and a value
 *   standing alone keep «Ключ»); per-device key → ключ на устройството; key block → блок с ключове; store
 *   key → ключ за съхранение; check key → ключ за проверка; stage key → ключ за изпращане; key pair →
 *   двойка ключове; acceptance sum → контролна сума за приемане; word sum → сума на думите; magic →
 *   сигнатура; header / footer → заглавие / краен блок
 * - backup → резервно копие; full flash backup → пълно резервно копие на флаш паметта; restore →
 *   възстановяване (of a backup or the original; the slot's name "за възстановяване" means the same act)
 * - run (one pass of the 0.x/1.x wizard) → сесия; run file → файл на сесията ("стартиране" is taken by
 *   boot); step, phase → стъпка (стъпка 02); resume → продължаване; the wizard's name "Preserve" stays
 * - power cycle → изключване и включване на захранването; unplug and replug → изключете камерата и я
 *   включете отново; a fresh power-up → да бъде включена наново
 * - patch → пач (прилагам пач към…, с пача, без пач); frame rate → кадрова честота; frame-rate patch → пач
 *   за кадрова честота; "Make N FPS" → „Ускоряване до N FPS“; "Make N FPS in every bank" → „Ускоряване до
 *   N FPS във всички слотове“
 * - tab → раздел (as Bulgarian browsers say for a tab); tabs are named by their labels in „…“ (app:tab.*):
 *   „Информация“, „Дъмп и дешифриране 0.x/1.x“, „Дъмп и дешифриране 4.x/Nano“, „Дешифриране на
 *   файл/слот“, „Работа със слотовете на фърмуера“, or short: разделът 4.x/Nano, разделът със слотовете.
 *   Buttons named in a sentence use the button's own words („Свързване на устройство“, „Четене на
 *   слотовете“, „Започване на дъмп“, „Дъмп на всички селектори“, „Запис на дешифриран образ“).
 * - camera → камера; Options (the 4.x tab's fold-out) → Настройки; log → журнал
 * - Sizes: КБ and МБ (never КиБ/МиБ) with a space after the number; bytes are Б («64 Б»), to match;
 *   milliseconds мс, minutes мин; Hz, FPS and Mbit/s as they are. A count written into the text is
 *   spaced with a no-break space (65 536); scores keep core's decimal point (0.87 от 1.00).
 *
 * Names and articles. Bulgarian has no noun cases, but the definite article sits on the noun (see
 * ../../README.md, "Cases"), so the selectors carry the article:
 * - plain `{bank}` → the name without an article: "Слот A" (a label, a cell, a heading, a name before a
 *   colon or in a list after one), "слот A" inside a sentence;
 * - `{bank:nom}` → the full article, for a subject: "слотът A", "ключът A", "другият слот";
 * - `{bank:acc}` → the short article, for an object and after any preposition: "в слота A", "от слота
 *   за възстановяване R", "с ключа A";
 * - `{bank:ins}` → the full article with a capital letter, for one name that starts a sentence
 *   ("Слотът A е празен"); never on a list (a plural sentence starts another way: "В {banks:acc} има…").
 * The label forms (common:bank.slot, bank.recovery) carry the same lower-case :nom/:acc forms, since a
 * declined name is always said inside a sentence. The key names in core.ts and shared:deviceInfo.otherBank
 * carry their own. A param that is not always a name (a text, a capitalised label, "нито един слот") is
 * left plain and put after a colon ("{bank}: съдържа пач…", "тази сесия записва: {banks}").
 * Plurals: one / other. A masculine noun after a number takes the count form in `other` ("2 слота",
 * "5 байта", "3 реда"); a count that cannot agree ({read}/{count}, a number passed as text) is written as a
 * label ("прочетени слотове: {read}/{count}", "пачът променя байтове: {count}").
 * Kept in English: command, register and option names (chunk, gap-fill, recipient and their values
 * interface / device, acknowledgeRisk, allowJump, --resume, --family), family ids (legacy-auth …),
 * "stage two", "[inferred]", UNTESTED (with «не е проверено» next to it), the quoted run-log words
 * "already holds the patched bytes", Zadig's menus, "subcmd", wire ids, "(auth)", the CLI's step ids
 * (backup, patch, commit, drain, restore, verify), and the wizard's name "Preserve".
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

const bg: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };

export default bg;
