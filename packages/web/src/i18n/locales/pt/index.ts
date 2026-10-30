/**
 * Português europeu (pt): every namespace, translated from ../en. Loaded on demand (its own chunk) when
 * the reader picks it. See ../../README.md, "How to add a language". European Portuguese (pt-PT) spelling
 * and usage, after the 1990 agreement (ação, ótimo, deteção): ficheiro, ecrã, utilizador, transferir,
 * registo, câmara, controlo, telemóvel, browser. The reader is addressed with the formal imperative
 * ("Conecte a câmara", "Prima …", "Escolha …"), never "você"; buttons are infinitives ("Ler ranhuras").
 * Progressive forms are "a + infinitive" ("A ler...", "a câmara está a reiniciar"), never the gerund.
 * Plurals follow pt-PT (Intl.PluralRules('pt-PT'): one is 1 only, so 0 takes other); format.ts asks for
 * pt-PT rules because plain 'pt' resolves to Brazilian ones (0 and 1.5 would be one).
 *
 * Glossary (English → português europeu). Use these words everywhere; the notes say why where the choice
 * was not obvious.
 * - camera → a câmara; firmware → o firmware; firmware family → família de firmware; build → a compilação
 *   (two builds can share one version, so "versão" cannot stand for it); firmware line → linha (de firmware)
 * - slot, bank → a ranhura (both: "bank" is the code's word for the same slot). "Ranhura" is the pt-PT
 *   word for slot in Microsoft's and the phone makers' Portuguese; it is feminine and starts with a
 *   consonant, so every bank name takes the same article. Slot A → Ranhura A / ranhura A; recovery R →
 *   ranhura de recuperação R; the booted bank → a ranhura de arranque; badge "booted now" → arranque atual;
 *   next start → próximo arranque; the bank the next start enters → a ranhura do próximo arranque;
 *   active-slot word → palavra de ranhura ativa; boot-config word → palavra de configuração de arranque
 * - flash → a memória flash (a flash in short phrases); the part / the chip → o chip
 * - dump (noun) → o dump (what Portuguese owners and forums say; "cópia" is taken by backup and copy);
 *   dump (verb) → fazer o dump; "Dump & decrypt …" tabs → «Dump e desencriptação …»; "Start dump" →
 *   «Iniciar dump»; "Dump all selectors" → «Dump de todos os seletores»; the row button "Dump" → «Dump»
 * - read → ler / leitura; read-back → releitura (reler); whole-flash read (the Preserve "drain") →
 *   leitura completa (da flash); image → a imagem
 * - write, flash (verb) → escrever / escrita ("write to slot A" → escrever na ranhura A; "Flash decrypted
 *   image…" → «Escrever imagem desencriptada…», "Flash raw bytes…" → «Escrever bytes em bruto…»);
 *   program → programar; erase → apagar / apagamento; commit → confirmação (da escrita); the Preserve
 *   step chip "Write" → Escrita; stage / staging → preparar / preparação; payload, upload → os dados
 *   (enviados), o envio; stage key → chave de envio
 * - decrypt → desencriptar; encrypt → encriptar; plaintext → sem encriptação; ciphertext → texto cifrado;
 *   keystream → fluxo de chave; raw bytes → bytes em bruto
 * - bootloader → o bootloader (what Portuguese guides say; "carregador de arranque" is unknown to most
 *   owners); boot → arrancar / arranque; bootable → arrancável; unbootable → incapaz de arrancar; boot
 *   config → configuração de arranque («Config. de arranque» as a row label)
 * - key → a chave; Key A / Key B → chave A / chave B (Chave A as a label); per-device key → chave própria
 *   do dispositivo; key block 1 → bloco de chaves 1; store key → chave de armazenamento; check key → chave
 *   de verificação; "under Key A" → com a chave A
 * - backup → cópia de segurança; full flash backup → cópia de segurança completa (da flash); restore →
 *   restaurar (repor, for "put back") / restauro; stock image → imagem original; factory → de fábrica
 * - run (one pass of the 0.x/1.x wizard) → execução; run file → ficheiro de execução; step → passo
 * - power cycle → desligar e voltar a ligar; unplug and replug → desconectar e voltar a conectar. The two
 *   are kept apart: "conectar" is the USB connection (the button «Conectar dispositivo»), "ligar" is power,
 *   so "Ligar dispositivo" cannot be misread as "switch it on".
 * - patch → o patch (a loanword pt-PT software uses; "correção" would read as a bug fix); frame-rate patch
 *   → patch da taxa de fotogramas (keep "N FPS"); "Make N FPS" → «Passar a N FPS»; "Make N FPS in every
 *   bank" → «Passar todas as ranhuras a N FPS»; patch (verb) → aplicar o patch; patched → com o patch;
 *   "not offered" → indisponível; the reader fix / the USB fix → a correção da leitura / do USB
 * - acceptance sum → soma de verificação; transfer checksum → soma de verificação da transferência; word
 *   sum → soma de palavras; header / footer → cabeçalho / rodapé; magic → número mágico
 * - selector → seletor; read window → janela de leitura; arm (open a window) → abrir ("nothing was armed"
 *   → «não foi aberta nenhuma janela»); unlock token → token de desbloqueio; evidence → indícios
 * - tab → separador; download → transferir / transferência; downloads folder → pasta de transferências;
 *   browser → o browser; log → o registo; archive (the zip a dump downloads) → o arquivo (pt-PT
 *   says "arquivo" for an archive and "ficheiro" for a file)
 * Typography: quotation marks « » (no spaces inside); no space before ":", ";", "!", "?". Sizes KB/MB
 * and bytes B with a space before the unit (README, Units); Hz, FPS, ms, Mbit/s as they are; a
 * percentage "{value}%". Status lines keep the English dots ("A ler...", "A cancelar …"). Plurals: one,
 * many ("1000000 de ficheiros") and other.
 * Names in a sentence (README, "Cases", Romance languages): every bank name has the same five forms:
 * {bank:acc} a ranhura A, {bank:gen} da ranhura A, {bank:dat} à ranhura A, {bank:loc} na ranhura A,
 * {bank:ins} A ranhura A (a sentence that starts with the name); the plain {bank} only where the name
 * stands alone (a label, a row value, after a colon, in brackets). Keys the same way (a chave A, da chave
 * A, à chave A; o bloco de chaves 1, do bloco de chaves 1, ao bloco de chaves 1). Portuguese also
 * contracts "por" (pelo/pela), which no selector carries, so "from slot A" is said "a partir {bank:gen}"
 * and "via slot A" "através {bank:gen}"; "com", "para", "sobre" do not contract and stay outside:
 * "com {key:acc}", "para {bank:acc}". A param that is not always a name (core passes some names already
 * capitalised, or a sentence) goes before a colon: "{bank}: contém um patch…".
 * Kept in English: command and register names, family ids (legacy-auth …), CLI options (--resume,
 * --family, allowJump, acknowledgeRisk), the read option names chunk / gap-fill / recipient and their
 * values (interface, device), "stage two", "[inferred]", "wire id", "subcmd", "handler", "getter",
 * "setter", UNTESTED in core's notes (with «não testado» next to it), the quoted run-log words "already
 * holds the patched bytes", Zadig's menus, "Preserve" as the wizard's name.
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

const pt: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };
export default pt;
