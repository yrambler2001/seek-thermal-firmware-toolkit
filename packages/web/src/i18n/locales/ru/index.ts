/**
 * Русский (ru): every namespace, translated from ../en. Loaded on demand (its own chunk) when the reader
 * picks it. See ../../README.md, "How to add a language". The reader is addressed with the polite «вы»
 * imperative usual in Russian manuals ("Отключите камеру", "Нажмите"), consistently, «вы» in lower case.
 * Quotation marks are «…»; button and tab names inside a sentence are quoted with them and use the
 * button's or tab's own words. The letter ё is written wherever it belongs (всё, ещё, её, подключённой,
 * стёрт, вернёт), never replaced by е: on this page «всё»/«все» and «её»/«ее» must not be guessed.
 *
 * Glossary (English → русский). Use these words everywhere; the notes say why where the choice was not
 * obvious. It stays close to the words the owner used for this toolkit on 4pda.
 * - firmware → прошивка; firmware family → семейство прошивок; build → сборка ("the 8 Hz build" →
 *   сборка 8 Hz); version → версия; firmware line → линейка (прошивок); running firmware → работающая
 *   прошивка; stock/factory image → заводской образ; vendor app → фирменное приложение
 * - slot, bank → слот, always (also where the English says "bank": it is the same slot; never «банк»).
 *   Slot A → Слот A, Recovery R → Слот восстановления R (common:bank.*); inside a sentence слот A,
 *   слот восстановления R. booted bank → слот, с которого запущена камера (the badge "booted now" →
 *   запущен сейчас); next start → следующий запуск («слот следующего запуска»); empty bank → пустой слот;
 *   the last-resort copy → последняя резервная копия
 * - flash (the memory) → флеш-память; dump (noun, the file, the "Dump" button) → дамп; dump (verb) →
 *   снять дамп; read → считать / считывание (a single USB read → чтение); whole-flash read (Preserve's
 *   drain) → полное считывание; read-back → контрольное считывание
 * - image → образ; decrypt → расшифровать / расшифровка; decrypted image → расшифрованный образ;
 *   plaintext → незашифрованный (as a table value «нет (не зашифрован)»); stored plain → хранится открыто
 * - write, flash (verb) → записать / запись ("Flash decrypted image…" → «Записать расшифрованный
 *   образ…»); erase → стереть / стирание; commit → подтверждение записи (the camera's
 *   CompleteMemoryUpgrade, the step that makes a staged upload land in flash; the Preserve chip "Write"
 *   is «Запись»); the write is "not on record" → запись не зафиксирована; program (the flash) →
 *   программировать; arm → активировать
 * - stage / staging → передавать / передача (the upload as it goes over USB); staged length → длина для
 *   передачи; staging form → форма передачи; payload → данные; transfer checksum → контрольная сумма
 *   передачи; chunk (a USB command's share) → порция (the read option "chunk" stays English)
 * - boot / start → запуск, запускаться; bootable → «Запускается» (column), незапускаемый; bootloader →
 *   загрузчик; boot-config word → слово конфигурации запуска; active-slot word → слово активного слота
 * - key → ключ; Key A / Key B → ключ A / ключ B (lower case inside Russian text, also as a cell value said
 *   inside a sentence; the row labels deviceInfo.keyA/keyB and a value standing alone keep «Ключ»);
 *   per-device key → ключ устройства; key block → блок ключей; store key → ключ хранения; check key →
 *   ключ проверки; stage key → ключ передачи; keystream → ключевой поток; ciphertext → шифртекст
 * - backup → резервная копия; full flash backup → полная резервная копия флеш-памяти; backup step →
 *   резервное копирование
 * - run (one pass of the 0.x/1.x wizard) → прогон; run file → файл прогона ("запуск" is taken by boot);
 *   step → шаг; phase → этап; resume → продолжить; the project name "Preserve" stays
 * - power cycle → выключить и снова включить питание; unplug and replug → отключить и снова подключить
 *   (переподключить where short); a fresh power-up → заново включить
 * - frame-rate patch → патч частоты кадров; "Make N FPS" → «Сделать N FPS»; patch (verb) → пропатчить,
 *   патчить; patched → пропатченный
 * - acceptance sum → контрольная сумма (the sum the bootloader checks); word sum → сумма слов; header /
 *   footer → заголовок / концевой блок; magic → сигнатура
 * - restore → восстановить / восстановление; verify, check (the step and the result) → сверка (the
 *   chip "Check" is «Сверка»); a check in general → проверка; selector → селектор; read window → окно
 *   чтения; unlock token → токен разблокировки; mode N → режим N; corpus → собранные образы
 * - tab → вкладка; tabs are named by their labels in «…» (app:tab.*): «Сведения», «Дамп и расшифровка
 *   4.x/Nano», «Расшифровать файл/слот», «Слоты прошивки» (the slots tab, also "Work with firmware slots"),
 *   or short: вкладка 4.x/Nano, вкладка 0.x/1.x, вкладка слотов. Buttons named in a sentence use the
 *   button's own words («Подключить устройство», «Считать слоты», «Начать дамп», «Дамп всех селекторов»,
 *   «Записать расшифрованный образ»).
 * - Sizes: КБ and МБ (never КиБ/МиБ) with a space after the number; bytes are Б («64 Б»), to match
 *   КБ/МБ; Hz, FPS and Mbit/s as they are.
 *
 * Cases around params. A bank or key name is declined with a case selector (../../README.md, "Cases"):
 * `{bank:gen}` из/до/для/без/со слота A, `{bank:dat}` по слоту A, `{bank:acc}` в слот A, `{bank:ins}`
 * слотом A, `{bank:loc}` в слоте A; `{key:ins}` под ключом A, `{masks:gen}` ключевые потоки ключа A. The
 * forms are in common.ts (bank.*:case, lower case also for the label forms, since a case form is always
 * said inside a sentence), core.ts (keyName.*:case) and shared.ts (deviceInfo.otherBank:case). "с" before
 * "слот" is written «со» (со слота A). The accusative of these inanimate nouns equals the nominative; it
 * is still written where the grammar asks for it. A param that is not a name (a nested sentence, a build
 * name, «выбранные слоты», keys.noKnownKey) cannot be declined: there the sentence is turned so the
 * nominative fits, or the value follows a colon or a dash ("следующий запуск: {next}", "ключ расшифровки —
 * {held}").
 * Plurals: one / few / many / other (1 слот, 2–4 слота, 5+ слотов, a fraction → слота). Where a noun after
 * a count like {read}/{count}, or after a number passed as text, cannot agree, the count is written as a
 * label ("слотов считано: {read}/{count}", "патч меняет байтов: {count}").
 * Kept in English: command, register and option names, family ids (legacy-auth …), CLI options
 * (--resume, --family, allowJump, acknowledgeRisk), the read option names chunk / gap-fill / recipient and
 * their values interface / device, "stage two", "[inferred]", UNTESTED (with «не проверено» next to it),
 * the quoted run-log words "already holds the patched bytes", Zadig's menus, "subcmd", wire ids, "(auth)",
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

const ru: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };

export default ru;
