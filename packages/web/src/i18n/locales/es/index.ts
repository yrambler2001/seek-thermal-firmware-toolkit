/**
 * Español (es): every namespace, translated from ../en. Loaded on demand (its own chunk) when the
 * reader picks it. See ../../README.md, "How to add a language". Neutral international Spanish, for
 * readers in Spain and Latin America alike: no vosotros, no strongly regional words. The reader is
 * addressed with the informal "tú" imperative throughout ("Conecta la cámara", "Pulsa …"), as current
 * Spanish software and its help pages do on both sides of the Atlantic; buttons are infinitives
 * ("Conectar dispositivo"). "This computer" is "este equipo" (neither "ordenador" nor "computadora").
 *
 * Glossary (English → español). Use these words everywhere; the notes say why where the choice was not obvious.
 * - camera → la cámara (feminine; a Compact → una Compact)
 * - firmware → el firmware; firmware family → familia de firmware; firmware line → línea (de firmware);
 *   build → la compilación (Windows' and Android's Spanish word; two builds can share one version, so
 *   "versión" cannot stand for it)
 * - slot, bank → la ranura (both: "bank" is the code's word for the same slot; "ranura" is the word
 *   Android's Spanish A/B documentation uses, and being feminine with a consonant first it gives every
 *   bank name the same article). Slot A → Ranura A / ranura A; recovery R → ranura de recuperación R.
 *   The booted bank → la ranura de arranque (never "arrancada", which reads as "torn out"); the bank the
 *   camera boots now → la ranura desde la que arranca ahora la cámara; badge "booted now" → arranque
 *   actual; next start → próximo arranque; the bank the next start enters → la ranura del próximo
 *   arranque; active-slot word → palabra de ranura activa
 * - flash → la memoria flash (la flash in short phrases); the part / the chip → el chip
 * - dump (noun) → el volcado; dump (verb, buttons) → volcar / «Volcar»; "Dump & decrypt …" tabs →
 *   «Volcar y descifrar …»; "Dump all selectors" → «Volcar todos los selectores»; "Start dump" →
 *   «Iniciar volcado»
 * - read → leer / lectura; read-back → relectura (releer); whole-flash read (the Preserve "drain") →
 *   lectura completa; image → la imagen (de firmware)
 * - write, flash (verb) → escribir / escritura, "write to slot A" → escribir en la ranura A ("Flash
 *   decrypted image…" → «Escribir imagen descifrada…», "Flash raw bytes…" → «Escribir bytes sin
 *   procesar…»); program → programar; erase → borrar; commit → confirmación (de la escritura); the
 *   Preserve step chip "Write" → Escritura; stage / staging (how a write's bytes are sent) → transferir /
 *   transferencia; payload, upload → los datos (enviados)
 * - decrypt → descifrar; encrypt → cifrar; plaintext → sin cifrar; ciphertext → texto cifrado;
 *   keystream → flujo de clave; raw bytes → bytes sin procesar
 * - bootloader → el bootloader (what Spanish firmware guides and forums say; "cargador de arranque" is
 *   unknown to most owners); boot → arrancar / arranque; bootable → arrancable; unbootable → que no
 *   arranca, "leaves the camera unbootable" → deja la cámara sin poder arrancar / puede impedir que la
 *   cámara arranque; boot config → configuración de arranque («Config. de arranque» as a row label)
 * - key → clave; Key A / Key B → clave A / clave B; per-device key → clave propia del dispositivo;
 *   key block 1 → bloque de claves 1; store key → clave de almacenamiento; check key → clave de
 *   comprobación; stage key → clave de transferencia; "under Key A" → con la clave A
 * - backup → copia de seguridad; full flash backup → copia de seguridad completa (de la flash);
 *   restore → restaurar / restauración; stock image → imagen de serie; factory → de fábrica
 * - run (one pass of the 0.x/1.x wizard) → ejecución; run file → archivo de ejecución
 * - power cycle → apagar y volver a encender; unplug and replug → desconectar y volver a conectar
 * - frame-rate patch → parche de velocidad de fotogramas (keep "N FPS"); "Make N FPS" → «Pasar a N FPS»;
 *   "Make N FPS in every bank" → «Pasar todas las ranuras a N FPS»; patch (verb) → aplicar el parche;
 *   patched → con el parche; "not offered" → no disponible
 * - acceptance sum → suma de comprobación (the sum the bootloader checks); transfer checksum → suma de
 *   comprobación de la transferencia; word sum → suma de palabras; header / footer → cabecera / pie;
 *   magic → número mágico
 * - selector → selector; read window → ventana de lectura; arm (open a window) → abrir ("nothing was
 *   armed" → «no se abrió nada»); unlock token → token de desbloqueo; evidence → indicios
 * - tab → pestaña; tabs are named by their labels (app:tab.*) in « », buttons by their own words in « »
 *   inside a sentence (bold or italic where the English has it).
 * Typography: opening ¿ and ¡; no space before ":", ";", "!", "?". Quotation marks « » (comillas
 * angulares, the RAE's first choice), no spaces inside. Sizes KB/MB and bytes B with a space before the
 * unit (README, Units); Hz, FPS, ms, Mbit/s as they are; a percentage "{value} %". "Reading ..." status
 * lines keep three dots, written "Leyendo...". Plurals: one, many ("1000000 de archivos") and other.
 * Names in a sentence (README, "Cases", Romance languages): "ranura" takes "la", so every bank name has
 * the same five forms: {bank:acc} la ranura A, {bank:gen} de la ranura A, {bank:dat} a la ranura A,
 * {bank:loc} en la ranura A, {bank:ins} La ranura A (a sentence that starts with the name); the plain
 * {bank} only where the name stands alone (a label, a row value, after a colon, in brackets). Keys the
 * same way (la clave A, de la clave A; el bloque de claves 1, del bloque de claves 1, al bloque de
 * claves 1). Spanish contracts only "de"/"a" + "el", so every other preposition goes outside the param:
 * "con {key:acc}", "desde {bank:acc}", "para {bank:acc}", "a partir {bank:gen}".
 * Kept in English: command and register names, family ids (legacy-auth …), CLI options (--resume,
 * --family, allowJump, acknowledgeRisk), the read option names chunk / gap-fill / recipient and their
 * values (interface, device), "stage two", "[inferred]", "wire id", "subcmd", UNTESTED in core's notes
 * (with «sin probar» next to it), the quoted run-log words "already holds the patched bytes", Zadig's
 * menus, "Preserve" as the wizard's name.
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

const es: Dictionary = { common, app, core, shared, info, decrypt, v4, slots, preserve };
export default es;
