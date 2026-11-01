/**
 * Namespace `core`, español (es), translated from the English source: sentences that `@seek-fw/core` makes and
 * the page shows. A key is a core message code (packages/core/src/message.ts):
 * core gives the page `{ code, params, text }`, and `coreText()`
 * (lib/core-text.ts) renders `core:<code>` with the params. English must
 * render to core's `text` word for word: i18n/core-messages.test.ts renders
 * every key here for representative inputs and compares, so the CLI and the
 * page keep saying the same thing in English. Don't reword a template here
 * without rewording core, and the other way round.
 *
 * For translators (the `core` namespace):
 * - Every value here is a sentence core also prints in English (the CLI, the
 *   logs, the copyable report). Translate the sentence; keep its `{params}`.
 * - Params that arrive ALREADY TRANSLATED (another core message, or a page word):
 *   - a bank: `{bank}`, `{name}`, `{first}`, `{second}`, `{last}`, `{target}`.
 *     Inside a sentence it is "slot A" / "recovery R" (common:bank.*InSentence);
 *     where the English starts a sentence or names a row it is the label form
 *     "Slot A" / "Recovery R". `{first}`/`{second}`/`{last}` in boot.rule may be
 *     a bare letter ("A").
 *   - a key name: `{key}`, `{held}`, `{holds}`, `{masks}` (keyName.*: "Key A",
 *     "per-device key", …; `{masks}` is several, joined with commas).
 *   - a nested sentence: `{why}`, `{reason}`, `{verdict}`, `{risk}`,
 *     `{untested}`, `{outcome}`, `{failure}`, `{answers}`, `{predicted}`,
 *     `{plain}`, `{ff}`, `{reference}`, `{recovered}`, `{check}`, `{phrase}`,
 *     `{staged}`, `{source}`, `{operation}`, `{error}`, `{label}`, `{writable}`,
 *     `{next}`, `{form}`, `{notes}`, `{remedy}`, `{capability}`, `{pair}`
 *     (report.checkKey.pair, or nothing), `{said}` (detect.source.*), `{context}`, and `{note}` in
 *     preserve.refused.recoveryOnly and identity.versionUnknown. Each is another key of
 *     this namespace (the comment above a key says which), already in your
 *     language. A `{why}` that starts a sentence arrives with a capital letter.
 *   - a list: `{banks}`, `{reasons}`, `{masks}`, `{files}`, `{sites}`, `{places}`,
 *     `{context}`, `{notes}` (joined with your common:list.* words; where the
 *     English uses a semicolon, common:list.semicolon; `{reasons}` in
 *     writeRefusal.otherFamily is detect.* sentences).
 * - Params that stay AS THEY ARE: hex values and offsets (`{word}`, `{offset}`,
 *   `{sum}`, `{hex}`, `{address}`, `{at}`, `{status}`, `{magic}`, `{length}`,
 *   `{k}`, `{zero}`, `{block}`), byte counts (`{size}`, `{count}`, `{kib}`), mode numbers (`{mode}`),
 *   a score (`{score}`), firmware versions (`{version}`, `{image}`, `{camera}`,
 *   `{firmware}`, `{builds}`, `{only}`, and `{first}` in support.* and detect.*), file
 *   names (`{file}`), a SHA-256 (`{sha256}`), a selector table's name
 *   (`{table}`) and family names (`{family}`, `{detected}`).
 * - Still English inside a translated sentence (core gives them no code yet):
 *   `{error}` when the error has no code (a USB error, a ZIP reader's error,
 *   a bug, or a refusal only a broken run file reaches, such as the patch
 *   builder's own gates), a read reason (read.reason.*'s place) that came
 *   from such an error, `{signature}` in preserve.fail.* (it describes the
 *   bytes or the wire stall; people paste it to the owner), `{reasons}` in
 *   preserve.fail.spentReaderDerive, `{note}` in preserve.gate.drainRefused,
 *   `{gap}` in restore.refused.gap*, and `{mismatch}` in
 *   slots.image.keyMismatch.
 * - Capitals: keep the English's. A template that starts lower case is said
 *   inside another sentence or after a label ("Note: …", a list item, "Not
 *   read: …"); one that starts upper case stands alone.
 * - Names stay English: command names (GetFirmwareInfo, CompleteMemoryUpgrade,
 *   BeginFirmwareUpgrade), wire ids, mode numbers, header fields
 *   (`header.length`, "CODE"), PRESERVATION.md, UNTESTED.
 *
 * Owner: phase 3 (core messages). Phase 1 put the unlock note here as the
 * first entry.
 */

import type { Translation } from '../../types';

export default {
  /** `UNLOCK_POWER_CYCLE_NOTE`; the page shows it as "Note: …." (app:unlockNote). */
  'unlock.powerCycleNote':
    'la cámara sigue desbloqueada hasta que se apague y se vuelva a encender, y otras herramientas pueden leerla mal hasta entonces; apágala y vuelve a encenderla antes de usarlas',
  /* ---- boot: which bank the camera starts (profiles/locked-boot, slots/boot-choice, booted-words) ---- */
  /** The order the bootloader tries the banks in: `{second}`/`{last}` is a letter ("A") or a bank ("recovery R"). */
  'boot.rule': '{first} primero, luego {second}, luego {last}',
  /** A bank's verdict word inside boot.select.unknown. */
  'boot.verdict.notRead': 'no se leyó',
  'boot.verdict.checkKeyUnnamed':
    'no se pudo comprobar: no se identificó la clave con la que su bootloader comprueba una ranura',
  'boot.cfg0NotRead':
    'no se leyó la palabra de configuración de arranque (cfg[0]), así que no se sabe qué ranura usará el próximo arranque',
  'boot.select.unknown':
    'la palabra de configuración de arranque es {word}, así que el bootloader prueba primero {first:acc}, pero {bank:acc} {verdict}, así que no se sabe qué ranura arranca',
  'boot.select.first':
    'la palabra de configuración de arranque es {word}, así que el bootloader prueba primero {first:acc}, y esta contiene una imagen que el bootloader acepta',
  'boot.select.second':
    'la palabra de configuración de arranque es {word}, así que el bootloader prueba primero {first:acc}; {first:acc} no contiene ninguna imagen que el bootloader acepte, así que toma {second:acc}',
  /** The last bank is recovery R ("boots"); boot.select.lastTakes is the same with a slot ("takes"). */
  'boot.select.lastBoots':
    'la palabra de configuración de arranque es {word}, así que el bootloader prueba primero {first:acc}; ni {first:acc} ni {second:acc} contienen una imagen que el bootloader acepte, así que arranca {last:acc}, que no comprueba',
  'boot.select.lastTakes':
    'la palabra de configuración de arranque es {word}, así que el bootloader prueba primero {first:acc}; ni {first:acc} ni {second:acc} contienen una imagen que el bootloader acepte, así que toma {last:acc}, que no comprueba',
  'boot.bootsNow': '{bank:ins} es la ranura desde la que arranca ahora la cámara',
  /** A bank's badge (lower case in English). */
  'boot.bootedNow': 'arranque actual',
  'boot.notBooted': 'no es la de arranque',
  'boot.unknownWhy.checkKeyUnnamed':
    'en esta lectura no se identificó la clave con la que su bootloader comprueba una ranura',
  'boot.unknownWhy.noKeyTable':
    'no se leyó la tabla de claves del bootloader, así que no se pueden nombrar las claves que prueba',

  /* ---- fpsBoot: the frame-rate patch in a bank that does not run (slots/fps-boot-warning) ---- */
  'fpsBoot.boots': 'La cámara arranca desde {bank:acc}. {why}.',
  'fpsBoot.holdsOne':
    '{bank}: contiene un parche de velocidad de fotogramas, pero no arranca, así que el parche no tiene efecto.',
  'fpsBoot.holdsTwo':
    'Contienen parches de velocidad de fotogramas, pero ninguna arranca, así que los parches no tienen efecto: {banks}.',
  'fpsBoot.wouldNotRun':
    'Aplicar el parche {target:dat} no haría que arrancara, porque la cámara arranca desde {bank:acc}.',
  'fpsBoot.patchRunning':
    'Aplica el parche también {bank:dat} (la ranura que arranca): eso es lo que hace que el parche de velocidad de fotogramas tenga efecto.',
  /** `{reason}`: fps.table.*, or a fps.plan.* reason. */
  'fpsBoot.cannotPatch':
    '{bank}: no se le puede aplicar el parche aquí ({reason}), así que un parche de velocidad de fotogramas en otra ranura no tiene efecto en esta cámara.',

  /* ---- backup: the zip saved before a bank write (slots/backup); `{name}` is the bank inside a sentence ("slot B"): each is an item of backup.plan.* ---- */
  'backup.bank.notInPlan': '{name} (no está en el plan de esta compilación: el zip lo indica)',
  'backup.bank.unsupported':
    '{name} (esta compilación no puede leerla, {reason}: el zip lo indica)',
  'backup.bank.empty':
    '{name} (vacía, todos los bytes 0xFF: el zip lo indica, y la escritura no sobrescribe ningún firmware)',
  'backup.bank.unread':
    '{name} (la lectura de las ranuras no llegó a ella: el zip indica si la lectura previa a la escritura llega)',
  'backup.bank.noKey':
    '{name} (tal como está almacenada; ninguna clave recuperada en esta lectura la abre, así que no hay archivo descifrado)',
  'backup.bank.decrypted': '{name} (tal como está almacenada, y descifrada)',
  /** `{banks}`: backup.bank.* for each bank, joined "A, B and C". */
  'backup.plan.one':
    'Antes de escribir nada, se vuelve a leer esta ranura y se guarda en un zip con una nota de lo que es cada archivo ({file}): {banks}.',
  'backup.plan.many':
    'Antes de escribir nada, se vuelven a leer estas ranuras y se guardan en un zip con una nota de lo que es cada archivo ({file}): {banks}.',

  /* ---- staging: how a write's bytes are sent (slots/staging-words) ---- */
  'staging.detail.keyACiphertext':
    'cifrados para que el dispositivo los almacene con la clave que contiene la ranura de arranque',
  'staging.detail.slotKeystreamCiphertext':
    'cifrados con la clave de transferencia propia de la imagen (bloque de claves 0); la cámara los almacena con la clave propia de la ranura',
  'staging.detail.plain': 'sin cifrar, sin ningún cifrado',
  'staging.detail.keyAKeystream':
    'la imagen 1.3.0.8 FF tal como la transfiere la app del fabricante (XOR clave A); la compilación de 16 Hz la almacena con la clave B, no estos bytes',
  'staging.detail.verbatim': 'literales: los bytes exactamente como se dieron',

  /* ---- copy: why a bank cannot be the source of a copy (slots/copy) ---- */
  'copy.source.noRead': 'sin lectura',
  'copy.source.notInPlan': '{name:acc} no está en el plan de esta compilación',
  'copy.source.notRead': 'no se leyó {name:acc} ({reason}), así que no hay imagen que copiar',
  'copy.source.empty': '{name:acc} está vacía: no hay imagen que copiar',
  'copy.source.foreign':
    '{name:acc} no contiene ninguna imagen de firmware que esta lectura reconozca, así que no hay nada que copiar',
  'copy.source.noKey':
    'ninguna clave recuperada en esta lectura abre {name:acc}, así que no hay imagen descifrada que copiar',

  /* ---- copy: where a copy's image comes from, and its note in the preview (slots/copy) ---- */
  /** The preview's Source row. `{name}`: the bank ("Slot A"); `{address}` hex; `{version}` a firmware version. */
  'copy.from': '{name} en {address}, tal como la descifró la lectura de las ranuras',
  'copy.fromVersion':
    '{name} en {address}, firmware {version}, tal como la descifró la lectura de las ranuras',
  /** `{size}`: bytes; `{sha256}`: a SHA-256. */
  'copy.note':
    'La imagen es {name:gen}, tal como la descifró la lectura de las ranuras: {size} B, sha256 {sha256}.',
  'copy.noteVersion':
    'La imagen es {name:gen}, tal como la descifró la lectura de las ranuras: firmware {version}, {size} B, sha256 {sha256}.',

  /* ---- restore: a bank restored from a full flash backup (slots/restore) ---- */
  /** "the backup's slot A (at 0x14010000)", said inside restore.* sentences as `{where}`. */
  'restore.where': '{name:acc} de la copia de seguridad (en {address})',
  /** The preview's Source row. `{file}`: the backup's file name. */
  'restore.from': '{where}, en la copia de seguridad completa de la flash {file}',
  'restore.fromVersion':
    '{where}, en la copia de seguridad completa de la flash {file}, firmware {version}',
  /** What kind of file the backup is: `{kind}` below. "Dump & decrypt 4.x/Nano" and "Dump all selectors" are the page's own tab and button names. */
  'restore.kind.flash-file': 'una imagen de flash de 4 MB',
  'restore.kind.preserve-run': 'un archivo de ejecución de Preserve',
  'restore.kind.dump': 'un zip de «Volcar y descifrar 4.x/Nano»',
  'restore.kind.all-selectors': 'un zip de «Volcar todos los selectores»',
  /** `{decrypted}` below. */
  'restore.decryptedTo.image': 'una imagen',
  'restore.decryptedTo.firmware': 'el firmware {version}',
  /** `{entry}`: the file inside the zip; `{stored}`, `{sha256}`: SHA-256 values; `{size}`: bytes. */
  'restore.note.image':
    'La imagen es {where} en {file}, {kind}: sha256 almacenado {stored}, descifrada como {decrypted} de {size} B (sha256 {sha256}).',
  'restore.note.imageEntry':
    'La imagen es {where} en {file}, {kind} (su {entry}): sha256 almacenado {stored}, descifrada como {decrypted} de {size} B (sha256 {sha256}).',
  'restore.note.readBack':
    'Después de la escritura, la ranura releída se compara con los bytes de la ranura que almacena la copia de seguridad.',
  /** `{serial}`, `{theirs}`, `{camera}`: camera serial numbers. */
  'restore.note.sameCamera':
    'El bloque de identidad de la copia de seguridad nombra esta cámara (número de serie {serial}).',
  'restore.note.sameBytes':
    '{name:ins} ya contiene los bytes que almacena la copia de seguridad: la escritura vuelve a poner la misma imagen.',
  'restore.warn.otherCamera':
    'Esta copia de seguridad parece de otra cámara: su bloque de identidad nombra el número de serie {theirs}, y esta cámara es {camera}. Solo se escribe la imagen {name:gen}; nada de la identidad ni de la calibración de esa cámara.',
  'restore.warn.noIdentity':
    'Esta copia de seguridad no tiene bloque de identidad en {address}, así que no se puede saber de qué cámara se leyó.',
  'restore.warn.serialNotRead':
    'No se leyó el número de serie de la cámara, así que la copia de seguridad (número de serie {serial}) no se puede comparar con ella.',
  'restore.warn.otherFirmware':
    '{where} contiene el firmware {version}, y la cámara ejecuta {camera}: la restauración pone otro firmware en la ranura.',

  /* ---- restore: a restored bank read back (slots/restore) ---- */
  'restore.readBack.notCompared':
    '{bank:ins} no se releyó, así que no se compara con la copia de seguridad.',
  'restore.readBack.equal':
    '{bank:ins} se relee byte a byte tal como la almacena la copia de seguridad.',
  'restore.readBack.differs':
    '{bank}: al releerla, difiere de los bytes que almacena la copia de seguridad en {count} B (el primero en {offset}).',

  /* ---- keys: the keys of a bank write (slots/write-keys) ---- */
  'keys.derived.same': '{key:acc}, que se obtiene {bank:gen}, con la que arrancó la cámara',
  'keys.derived.holds':
    '{key:acc} (la clave de almacenamiento), que se obtiene {bank:gen}, con la que arrancó la cámara y que contiene {holds:acc}',
  /* The same two lines when the booted bank has no name. */
  'keys.derived.sameUnnamed': '{key:acc}, que se obtiene de la ranura de arranque',
  'keys.derived.holdsUnnamed':
    '{key:acc} (la clave de almacenamiento), que se obtiene de la ranura de arranque, que contiene {holds:acc}',
  'keys.ffVendor.staged':
    'la imagen 1.3.0.8 FF (16 Hz) tal como la transfiere la app del fabricante: la imagen XOR su propio bloque de claves 0 (clave A), con la ventana de cabecera literal, a cualquier ranura; no se usan las claves de esta cámara',
  'keys.ffVendor.stored':
    'clave B: la cámara vuelve a cifrar los datos recibidos con el bloque de claves 1 y almacena la imagen con esa clave',
  'keys.imageBlock0.staged':
    'la imagen con su propio bloque de claves 0 (que se encuentra en la imagen por su valor), a cualquier ranura; no se usan las claves de esta cámara',
  'keys.imageBlock0.storedUnnamed':
    'la clave con la que su bootloader comprueba una ranura (no identificada en esta lectura); la cámara vuelve a cifrar con ella los datos recibidos',
  'keys.imageBlock0.stored':
    '{key:acc}, la clave con la que su bootloader comprueba una ranura; la cámara vuelve a cifrar con ella los datos recibidos',

  /* ---- notes: a bank's or the camera's notes (slots/capability-notes) ---- */
  'notes.ffBootUntested':
    'UNTESTED (sin probar): no se ha leído de ninguna cámara un bootloader de la compilación FF de 16 Hz, así que no se sabe si la ranura escrita arranca. Con el bootloader 0.9.0.0, una forma anterior de esta imagen arrancó desde la ranura de recuperación R; esta forma no lo hará, porque ese bootloader arranca la ranura de recuperación R tal como está almacenada, sin decodificarla.',

  /* ---- write: a bank write's warnings and notes before the confirm (slots/write-words) ---- */
  'write.ff.otherVersion':
    'La imagen FF de 16 Hz se envía en la forma que solo lee la compilación {version} de 16 Hz. Esta cámara escribe una ranura sin comprobar la imagen (así lo dice el código fuente de su firmware, y así lo hizo una Compact 1.3.0.0 cuando se probó), así que se espera que escriba los bytes tal como se envían: la ranura contendrá entonces la imagen en una forma con la que esta cámara no puede arrancar.',
  /** `{untested}` is notes.ffBootUntested. */
  'write.ff.untested': '{untested} Nada de lo que hay aquí afirma que la cámara arranque con ella.',
  /** `{why}`: how the camera's answers name its build (English until running.ts has codes). */
  'write.ff.runsFast':
    'Las propias respuestas de la cámara dicen que ejecuta la compilación FF de 16 Hz: {why}.',
  /** What the 8 Hz build does, said after "That build" (write.ff.runsSlow, write.ff.buildUnknown). */
  'write.ff.outcome.takes':
    'comprueba los datos antes de borrar una ranura, y estos datos pasan esa comprobación, así que puede escribir estos bytes tal cual, en una forma con la que su bootloader no puede arrancar: puede que la ranura no arranque (no se ha probado; la copia de seguridad guardada antes de la escritura la restaura)',
  'write.ff.outcome.refuses':
    'comprueba los datos antes de borrar una ranura, y estos datos no pasan esa comprobación, así que se espera que rechace esta escritura antes de escribir nada (una cámara con esa compilación rechazó así una forma anterior de esta imagen)',
  'write.ff.runsSlow':
    'La cámara ejecuta la compilación {version} de 8 Hz: {why}. Esa compilación {outcome}.',
  'write.ff.buildUnknown':
    'Las propias respuestas de la cámara no dicen qué compilación {version} ejecuta: {why}. Si ejecuta la compilación FF de 16 Hz, acepta estos datos. Si ejecuta la compilación de 8 Hz, esa compilación {outcome}.',
  'write.raw.asGiven':
    'Datos sin procesar: se envían exactamente como se dieron. Nada de lo que hay aquí comprueba que arranquen.',
  'write.raw.ffStagedForm':
    'Estos datos son la forma de transferencia de 1.3.0.8 FF (la imagen XOR el bloque de claves 0, suma de palabras 0xFFFF). La cámara almacena la imagen con la clave B, así que la relectura se compara con esos bytes.',
  'write.raw.noStaging':
    'Esta compilación no indica ninguna forma de transferencia para la ranura, así que no se pueden indicar las comprobaciones del bootloader.',
  'write.raw.reencrypts':
    'El dispositivo decodifica estos datos y vuelve a cifrar lo que guarda, así que no se pueden predecir los bytes almacenados. La relectura se comprueba como la imagen que resulta al descifrarla, cuando eso se puede saber.',
  /** `{failure}`: the bootloader check the payload fails (English until write-image.ts has codes). */
  'write.raw.bootloaderRejects': 'El bootloader rechazaría estos datos: {failure}.',
  'write.raw.stageKeyUnchecked':
    'La clave de transferencia de 2016 (bloque de claves 0) no está en los bytes sin procesar, así que aquí no se comprueba la suma de palabras descifrada de estos datos.',
  'write.image.rekeyRisk':
    '{name:ins} ya contiene una imagen que el bootloader no puede aceptar. Esta escritura termina en el mismo estado.',
  'write.ack.recovery':
    'Ranura de recuperación R: para escribir en ella tienes que aceptar el riesgo. Nada de lo que hay aquí comprueba que la cámara arranque después.',
  /** `{risk}` is boot.bootsNow (with the bank's label form) or write.ack.bootUnnamed. */
  'write.ack.risk':
    '{risk}: para escribir en ella tienes que aceptar el riesgo, y la cámara ejecuta lo que contenga después del próximo apagado y encendido.',
  'write.ack.bootUnnamed':
    'no se pudo identificar la ranura de arranque, así que esta se trata como la de arranque',
  'write.ack.recoveryFallback':
    'La ranura de recuperación R es la copia de último recurso a la que recurre el bootloader',

  /* ---- the device panel and the Info tab (profiles/*, workflows/device-report, device-info) ---- */
  /** What a 4.x boot-config word means (the legacy families say boot.rule). */
  'boot.cfg0.modernBlank':
    'en blanco/0: preferir la ranura A, luego la B, luego la de recuperación',
  'boot.cfg0.modernB': 'preferir la ranura B, luego la A, luego la de recuperación',
  'boot.cfg0.modernRecovery': 'preferir la de recuperación, luego la A, luego la B',
  /** The "Next start" row: `{why}` is boot.select.* or boot.cfg0NotRead. */
  'report.nextStart.unknown': 'no se sabe: {why}',
  'report.nextStart.runs': '{bank} — {why}',
  /** `{verdict}` is one of upgrade.verdict.*. `{name}` here is the bank inside a sentence ("slot B"); in upgrade.verdict.* it starts a sentence ("Slot B"). */
  'upgrade.whileRecovery':
    'La cámara está ejecutando su ranura de recuperación, y su propia actualización escribe {name:loc}, que no está ejecutando. {verdict} Esto es solo una advertencia: nada de lo que hay aquí impide una actualización.',
  'upgrade.verdict.notRead':
    'No se pudo leer {name:acc} en esta comprobación, así que no se sabe qué contiene.',
  'upgrade.verdict.blank':
    '{name:ins} está en blanco, así que la actualización escribe en una ranura vacía.',
  'upgrade.verdict.bootableSame':
    '{name:ins} contiene la misma imagen arrancable que la ranura que se ejecuta, y la actualización la sustituye. {name:ins} deja de poder arrancar si la actualización se detiene a medias.',
  'upgrade.verdict.bootable':
    '{name}: contiene una imagen arrancable, que la actualización sustituye. Si la actualización se detiene a medias, deja de poder arrancar.',
  'upgrade.verdict.unknown':
    'En esta lectura no se sabe si {name:acc} es arrancable, así que la actualización puede sustituir una imagen con la que la cámara arrancaría.',
  'upgrade.verdict.notBootable':
    '{name:ins} no aparece como arrancable en esta lectura, así que la actualización no sustituye ninguna imagen con la que la cámara arrancaría.',
  /** The Info tab's "Booted" row: the bank's name alone, or with how the camera records it. */
  'report.booted.name': '{bank}',
  'report.booted.entered':
    '{bank} — la ranura en la que entró el bootloader en este arranque, según lo registra',
  /** The Info tab's "Last start" row; `{word}` is the active-slot word. */
  'report.lastStart.notRead': 'no se leyó',
  'report.lastStart.noBank': 'la cámara indica {word}, que no nombra ninguna ranura',
  'report.lastStart.entered':
    'la cámara indica que entró {bank:loc} (palabra de ranura activa {word})',

  /* ---- running: which 1.3.0.8 build the camera runs, from its own answers (slots/running) ---- */
  /** Instead of a version in running.why.otherVersion. */
  'running.noVersion': 'sin versión',
  'running.why.otherVersion': 'la cámara indica {version}, y solo {only} tiene dos compilaciones',
  /** "Bank verdicts": the camera's yes/no per bank; GetFirmwareInfo is a USB command name (keep it). */
  'running.why.noVerdicts':
    'la cámara no respondió a los veredictos de las ranuras (selectores 6, 7 y 8 de GetFirmwareInfo)',
  'running.why.notRead':
    'no se leyó una ranura de la que dependen los veredictos, así que no se pueden predecir las respuestas',
  /** `{answers}` is running.answers.each: the three answers, "A 1, B 0, R 1" (1 accepts, 0 refuses). */
  'running.answers': 'la cámara responde {answers}',
  'running.answers.each': 'A {a}, B {b}, R {r}',
  /** `{answers}` is running.answers; `{predicted}`, `{plain}`, `{ff}` are running.answers.each. */
  'running.why.plain':
    '{answers}, que es lo que responde la compilación 1.3.0.8 de 8 Hz para estas ranuras ({predicted})',
  'running.why.ff':
    '{answers}, que es lo que responde la compilación 1.3.0.8 FF de 16 Hz para estas ranuras ({predicted})',
  'running.why.both':
    '{answers}, y las dos compilaciones responden exactamente eso para estas ranuras, así que las ranuras no permiten distinguirlas',
  'running.why.neither':
    '{answers}, que no coincide con ninguna compilación (8 Hz: {plain}; 16 Hz FF: {ff})',

  /* ---- imageBuild: an image that may not be the camera's build (slots/image-build) ---- */
  /** `{image}`, `{camera}`, `{version}` are firmware versions. */
  'imageBuild.noVersion':
    'La cabecera de esta imagen no indica ninguna versión de firmware, así que no se puede saber si es la compilación que ejecuta la cámara ({camera}). Comprueba que es la imagen que quieres escribir.',
  'imageBuild.otherVersion': 'Esta imagen es el firmware {image}; la cámara ejecuta {camera}.',
  'imageBuild.otherVersionTaken':
    'Esta imagen es el firmware {image}; la cámara ejecuta {camera}. En esta línea la cámara solo comprueba que una imagen esté bien formada (su cabecera y su suma de palabras), no su versión, así que acepta esta imagen, y cuando arranca desde esta ranura ejecuta {image}.',
  'imageBuild.otherVersionUnchecked':
    'Esta imagen es el firmware {image}; la cámara ejecuta {camera}. No se ha comprobado si esta cámara acepta una compilación distinta, ni si la ejecuta.',
  'imageBuild.otherBuild':
    'Esta imagen es la compilación {version} de 8 Hz; la cámara ejecuta la compilación {version} FF de 16 Hz. La compilación de 16 Hz compara los datos con su propia forma FF cuando se confirma la escritura y rechaza los que no la cumplen, antes de borrar la ranura (según su código fuente). No se ha probado en una cámara escribir en ella la compilación de 8 Hz.',
  'imageBuild.runningUnknown':
    'Esta imagen es la compilación {version} de 8 Hz. La cámara ejecuta {version}, que existe como compilación de 8 Hz y como compilación FF de 16 Hz, y sus propias respuestas no dijeron cuál ejecuta, así que no se puede saber si esta es su compilación.',

  /* ---- bootFail: a bootloader check a raw payload fails (slots/write-image); write.raw.bootloaderRejects says it ---- */
  /** Values are hex; `header.length`, "CODE" and 0x200 are names and stay as they are. */
  'bootFail.tooShort':
    'los datos ocupan {size} B, demasiado poco para contener una cabecera en 0x200',
  'bootFail.noMagic':
    'no hay número mágico de imagen en 0x200 (se encontró {found}, el bootloader necesita {needs})',
  'bootFail.lengthOutside': 'header.length {length} está fuera de los datos de {size} B',
  'bootFail.lengthNotPayload': 'header.length {length} no es la longitud de los datos, {size}',
  'bootFail.overStage': '{size} B supera el máximo de transferencia de {max} B',
  'bootFail.plainSum': 'suma de palabras almacenada {sum}; el bootloader de 2014 necesita 0',
  'bootFail.noFooter': 'no hay pie en {offset}: los datos terminan en {end}',
  'bootFail.footerNotCode':
    'el pie en {offset} no es «CODE»: el bootloader usa su cargador segmentado',
  'bootFail.footerLength': 'la longitud del pie no es igual a header.length {length}',
  'bootFail.keyASum':
    'descifrada con la clave A de esta cámara, la suma de palabras es {sum}; el bootloader necesita {needs}',

  /* ---- keyCheck: how a recovered key was confirmed (crypto/confidence-words) ---- */
  'keyConfidence.family': 'verificada por la suma de comprobación',
  'keyConfidence.structural': 'verificada solo por la tabla de vectores',
  'keyConfidence.unverified': 'sin verificar',
  /** `{sum}` is hex. */
  'keyCheck.family': 'clave verificada por la suma de comprobación {sum}',
  /** `{phrase}` is keyConfidence.structural or keyConfidence.unverified. */
  'keyCheck.other': 'clave {phrase}; suma de comprobación {sum}',

  /* ---- staging.phrase: how a write's bytes were sent, inside written.committed (slots/staging-words) ---- */
  'staging.phrase.keyACiphertext': 'transferidos con las claves propias de la cámara',
  'staging.phrase.slotKeystreamCiphertext': 'transferidos con la clave propia de la imagen',
  'staging.phrase.plain': 'transferidos sin cifrar',
  'staging.phrase.keyAKeystream':
    'transferidos como la app del fabricante transfiere la imagen FF (XOR clave A)',
  'staging.phrase.verbatim': 'enviados tal como se dieron',

  /* ---- written: a finished bank write's notes (slots/write, slots/write-verify) ---- */
  /** `{name}` is a bank, inside the sentence ("slot A"); `{staged}` is staging.phrase.*; `{size}` is a byte count; the rest hex. */
  'written.committed':
    'se confirmaron {size} B {name:loc}, en {address}, {staged}; estado de la confirmación {status}',
  'written.noReadWindow':
    'esta compilación no indica ninguna ventana de lectura para la ranura, así que no se releyó nada',
  /** `{error}`: the error's own message (translated where core gives it a code). */
  'written.readBackFailed': 'la relectura falló: {error}',
  'written.readBack': 'releídos {size} B, SHA-256 {sha256}',
  'written.verifyOff': 'la verificación está desactivada: la ranura no se releyó',
  /** What the read-back was compared with, inside readBack.sizeDiffers and readBack.differs. */
  'readBack.reference.folded':
    'los bytes que el plan predijo para la ranura (la imagen tal como la almacena la compilación de 16 Hz, no los bytes enviados)',
  'readBack.reference.asSent':
    'los bytes que el plan predijo para la ranura (los bytes tal como se enviaron)',
  'readBack.sizeDiffers':
    'la relectura ocupa {size} B y el plan predijo {predictedSize} B: la ranura NO coincide con {reference}',
  'readBack.matchesFolded':
    'la ranura contiene la imagen tal como la almacena la compilación de 16 Hz (no los bytes enviados), y el resto de la ranura está borrado',
  'readBack.matches':
    'la ranura coincide con los bytes que predijo el plan (la cadena sin cifrar de 2014 programa exactamente lo que recibe)',
  'readBack.differs': 'la ranura NO coincide con {reference} (primera diferencia en {offset})',
  'readBack.noHeader':
    'la relectura no contiene ninguna cabecera de imagen en {offset} (número mágico {magic}), así que la ranura NO se descifra como la imagen esperada',
  'readBack.lengthDiffers':
    'la cabecera de la relectura indica {length} B y la imagen del plan ocupa {imageLength} B: la ranura NO se descifra como la imagen esperada',
  'readBack.tooShort':
    'la relectura ocupa {size} B, demasiado poco para una imagen de {length} B: la ranura NO se descifra como la imagen esperada',
  /** `{check}` is keyCheck.*; said after "under the" in readBack.decrypts and readBack.decryptDiffers. */
  'readBack.recovered': 'flujo de clave recuperado de la relectura ({check})',
  /** `{recovered}` is readBack.recovered. */
  'readBack.decrypts':
    'la ranura se descifra como la imagen esperada ({length} B) con el {recovered}',
  'readBack.decryptDiffers':
    'la ranura NO se descifra como la imagen esperada: primera diferencia en el desplazamiento {offset} de la imagen, con el {recovered}',
  'readBack.rawNotCompared':
    'bytes sin procesar: se informa de la relectura, pero no se compara (los bytes no se descifran como una imagen sin cifrar que se pueda predecir en esta forma, y el dispositivo vuelve a cifrar lo que guarda)',
  'readBack.notCompared':
    'no fue posible ninguna comparación: el plan no predice ni los bytes almacenados ni la imagen sin cifrar',

  /* ---- keyName: the names core gives keys; a param `{key}`, `{held}`, `{holds}`, `{masks}` arrives as one of these ---- */
  'keyName.keyA': 'clave A',
  'keyName.keyA:acc': 'la clave A',
  'keyName.keyA:gen': 'de la clave A',
  'keyName.keyA:dat': 'a la clave A',
  'keyName.keyA:loc': 'en la clave A',
  'keyName.keyA:ins': 'La clave A',
  'keyName.keyB': 'clave B',
  'keyName.keyB:acc': 'la clave B',
  'keyName.keyB:gen': 'de la clave B',
  'keyName.keyB:dat': 'a la clave B',
  'keyName.keyB:loc': 'en la clave B',
  'keyName.keyB:ins': 'La clave B',
  /** A key programmed into this one camera. */
  'keyName.perDevice': 'clave propia del dispositivo',
  'keyName.perDevice:acc': 'la clave propia del dispositivo',
  'keyName.perDevice:gen': 'de la clave propia del dispositivo',
  'keyName.perDevice:dat': 'a la clave propia del dispositivo',
  'keyName.perDevice:loc': 'en la clave propia del dispositivo',
  'keyName.perDevice:ins': 'La clave propia del dispositivo',
  'keyName.thePerDevice': 'la clave propia del dispositivo',
  'keyName.thePerDevice:acc': 'la clave propia del dispositivo',
  'keyName.thePerDevice:gen': 'de la clave propia del dispositivo',
  'keyName.thePerDevice:dat': 'a la clave propia del dispositivo',
  'keyName.thePerDevice:loc': 'en la clave propia del dispositivo',
  'keyName.thePerDevice:ins': 'La clave propia del dispositivo',
  'keyName.applicationKeyA': 'la clave A de la aplicación',
  'keyName.applicationKeyA:acc': 'la clave A de la aplicación',
  'keyName.applicationKeyA:gen': 'de la clave A de la aplicación',
  'keyName.applicationKeyA:dat': 'a la clave A de la aplicación',
  'keyName.applicationKeyA:loc': 'en la clave A de la aplicación',
  'keyName.applicationKeyA:ins': 'La clave A de la aplicación',
  'keyName.applicationKeyB': 'la clave B de la aplicación',
  'keyName.applicationKeyB:acc': 'la clave B de la aplicación',
  'keyName.applicationKeyB:gen': 'de la clave B de la aplicación',
  'keyName.applicationKeyB:dat': 'a la clave B de la aplicación',
  'keyName.applicationKeyB:loc': 'en la clave B de la aplicación',
  'keyName.applicationKeyB:ins': 'La clave B de la aplicación',
  /** The 2016 line's check key: the second block of the image's own key table. */
  'keyName.block1': 'bloque de claves 1',
  'keyName.block1:acc': 'el bloque de claves 1',
  'keyName.block1:gen': 'del bloque de claves 1',
  'keyName.block1:dat': 'al bloque de claves 1',
  'keyName.block1:loc': 'en el bloque de claves 1',
  'keyName.block1:ins': 'El bloque de claves 1',
  'keyName.theDeviceKey': 'la clave del dispositivo',
  'keyName.theDeviceKey:acc': 'la clave del dispositivo',
  'keyName.theDeviceKey:gen': 'de la clave del dispositivo',
  'keyName.theDeviceKey:dat': 'a la clave del dispositivo',
  'keyName.theDeviceKey:loc': 'en la clave del dispositivo',
  'keyName.theDeviceKey:ins': 'La clave del dispositivo',
  /** A slot's key when the read names none (a placeholder, not a key's name). */
  'keyName.unknown': 'clave desconocida',
  'keyName.unknown:acc': 'una clave desconocida',
  'keyName.unknown:gen': 'de una clave desconocida',
  'keyName.unknown:dat': 'a una clave desconocida',
  'keyName.unknown:loc': 'en una clave desconocida',
  'keyName.unknown:ins': 'Una clave desconocida',

  /* ---- keys.evidence: the facts a write's keys rest on, one list item each (slots/write-keys-words) ---- */
  /** `{hex}`, `{keyA}`, `{keyB}` are key bytes in hex; `{keyAAt}`, `{keyBAt}` offsets; `{firmware}` a version or "?". */
  'keys.evidence.plainChain':
    'la cadena sin cifrar de 2014: todas las ranuras se almacenan sin cifrar, así que no se deriva ninguna clave de envío; lo que se envía es la imagen tal cual',
  'keys.evidence.ffVendor':
    'la compilación 1.3.0.8 FF (16 Hz): ninguna ranura que haya abierto esta lectura está almacenada sin cifrar, así que no consta que la cámara esté en la cadena sin cifrar de 2014; la imagen FF se escribe en la forma del fabricante, los bytes sin procesar se envían tal como se dieron, y no se escribe una imagen sin cifrar de 8 Hz',
  'keys.evidence.ffUntested':
    'se ofrece escribir la imagen FF con su advertencia UNTESTED (sin probar): no hay en la colección ningún bootloader auténtico de esta compilación, así que no se ha medido si la ranura escrita arranca',
  'keys.evidence.line2016':
    'la línea Compact PRO de 2016: lo que se envía es la imagen XOR el flujo de clave de su propio bloque de claves 0, que se encuentra en la imagen por su valor, así que no interviene ninguna clave de esta cámara',
  'keys.evidence.checkKeyUnnamed':
    'la cámara descifra los datos enviados con esa clave y los vuelve a cifrar con la clave con la que su bootloader comprueba una ranura; esa clave no se identificó en esta lectura, y la escritura no la necesita: la ranura se relee como la imagen que resulta al descifrarla',
  /** `{why}`: why the read did not name the key (English: the read's own reason has no code yet). */
  'keys.evidence.checkKeyUnnamedWhy':
    'la cámara descifra los datos enviados con esa clave y los vuelve a cifrar con la clave con la que su bootloader comprueba una ranura; esa clave no se identificó en esta lectura ({why}), y la escritura no la necesita: la ranura se relee como la imagen que resulta al descifrarla',
  'keys.evidence.checkKeyNamed':
    'la cámara descifra los datos enviados con esa clave y los vuelve a cifrar con {key:acc} {hex}, la clave con la que su bootloader comprueba una ranura, así que cada ranura que escribe queda almacenada como el bootloader la acepta',
  'keys.evidence.checkKeyInferred':
    'la cámara descifra los datos enviados con esa clave y los vuelve a cifrar con {key:acc} {hex}, la clave con la que su bootloader comprueba una ranura (deducida {bank:gen}, la ranura en la que la cámara indica que entró y en la que el bootloader entró sin hacer su comprobación), así que cada ranura que escribe queda almacenada como el bootloader la acepta',
  'keys.evidence.checkKeyNamedFrom':
    'la cámara descifra los datos enviados con esa clave y los vuelve a cifrar con {key:acc} {hex}, la clave con la que su bootloader comprueba una ranura (identificada a partir {bank:gen}, la ranura en la que la cámara indica que entró), así que cada ranura que escribe queda almacenada como el bootloader la acepta',

  /* ---- keys.refused: why no upload key is derived (the "refused" row, or the banner) ---- */
  'keys.refused.bootUnnamed':
    'no se pudo identificar la ranura de arranque, así que no se puede leer de ella la clave con la que se almacena la ranura',
  'keys.refused.notDerived': 'no se pudieron derivar las claves',
  'keys.refused.notDecrypted':
    '{bank:acc}, con la que arrancó la cámara, no se descifra como una imagen, así que no se puede leer la clave con la que está almacenada',
  'keys.refused.noBootKey':
    '{bank:acc}, con la que arrancó la cámara, no se descifra con ninguna clave que pruebe el bootloader (su clave A o su clave de almacenamiento), así que no se puede leer de ella la clave con la que está almacenada',
  'keys.refused.keyNotInTable':
    '{bank:acc}, con la que arrancó la cámara, se descifra con {key:acc}, pero la tabla de claves de esta cámara no contiene esa clave, así que no se puede escribir con ella',
  'keys.refused.noApplicationPair':
    'la aplicación en ejecución ({bank}, firmware {firmware}) no lleva ninguno de los pares de claves conocidos (el del bootloader y los pares de aplicación decodificados), cada mitad exactamente una vez, así que no se puede localizar su clave A en su imagen',
  /** `{count}`, `{keyB}`: how many times Key A and Key B occur. */
  'keys.refused.noApplicationPairCounted': {
    one: 'la aplicación en ejecución ({bank}, firmware {firmware}) no lleva ninguno de los pares de claves conocidos (el del bootloader y los pares de aplicación decodificados), cada mitad exactamente una vez, así que no se puede localizar su clave A en su imagen (la clave A del bootloader aparece {count} vez; su clave B, {keyB})',
    many: 'la aplicación en ejecución ({bank}, firmware {firmware}) no lleva ninguno de los pares de claves conocidos (el del bootloader y los pares de aplicación decodificados), cada mitad exactamente una vez, así que no se puede localizar su clave A en su imagen (la clave A del bootloader aparece {count} de veces; su clave B, {keyB})',
    other:
      'la aplicación en ejecución ({bank}, firmware {firmware}) no lleva ninguno de los pares de claves conocidos (el del bootloader y los pares de aplicación decodificados), cada mitad exactamente una vez, así que no se puede localizar su clave A en su imagen (la clave A del bootloader aparece {count} veces; su clave B, {keyB})',
  },
  /** 0x50000 is the camera's status code. */
  'keys.refused.uploadChecked':
    'la aplicación en ejecución ({bank}, firmware {firmware}) comprueba los datos enviados con sus propias claves antes de programarlos (el código fuente decodificado de esta compilación prueba los datos con su clave A y con su clave de almacenamiento, igual que su bootloader prueba una ranura), y la clave con la que almacenan las escrituras, {key:acc} ({hex}), no es ni su clave A ni su clave de almacenamiento, así que la cámara rechazaría los datos con 0x50000 antes de borrar nada',

  /* ---- writeRefusal: why no bank of this camera is written (workflows/device-info) ---- */
  /** `{family}`, `{detected}`: camera family names; `{sum}`, `{k}`, `{expected}` hex. */
  'writeRefusal.acceptanceSum':
    'ninguna ranura se descifra con la suma de comprobación {sum} propia de {family}',
  'writeRefusal.keyTable': 'no se pudo confirmar la tabla de claves de esta cámara',
  'writeRefusal.whitening':
    'la tabla de claves de esta cámara se resuelve con K={k}, pero {family} cifra con K={expected}',
  /** `{reasons}`: the detection's evidence (detect.*), joined with common:list.semicolon. */
  'writeRefusal.otherFamily':
    'los indicios dicen que esta cámara es {detected}, no {family} ({reasons})',
  /** `{reasons}`: writeRefusal.* joined with common:list.semicolon. */
  'writeRefusal.camera': 'en esta cámara no se puede escribir desde aquí: {reasons}',

  /* ---- family: what each camera family is (profiles/*: `summary`), the decrypt tab's Summary row ---- */
  /** "Work with firmware slots", "Info", "4.x/Nano", "Dump", "Dump all selectors": the page's own tab and button names; `seek-fw dump` stays English. `{block}` is an address. */
  'family.summary.modern':
    'Las compilaciones de Seek de 2018 en adelante (2.x, 4.x, 10.x, 42.x, 44.x): Compact 4.8/4.16, Compact Pro 4.9/4.18, Compact Pro FF, Compact XR, Mosaic 2.27/10.9, Nano 200 y Nano 300. Un volcado lee 63 de los 64 bloques de la flash sin desbloquear nada; en estas compilaciones ninguna lectura llega al bloque de {block}. El firmware se almacena cifrado. Las ranuras se escriben de una en una en la pestaña «Gestionar ranuras de firmware».',
  'family.summary.early':
    'Las Compact de 2014 anteriores a 0.8.0.0: 0.3.0.1, 0.5.0.2, 0.5.1.0, 0.5.1.3, 0.6.0.4, 0.7.0.7 y 0.7.0.8. Su firmware no puede responder a la lectura que envía un volcado, así que «Volcar», «Volcar todos los selectores», la lectura completa de la pestaña «Información» y la pestaña «Gestionar ranuras de firmware» las rechazan después de leer la versión; en 0.3.0.1, el comando con el que empieza un volcado prepararía en cambio una actualización de firmware. La ejecución de preservación lee 0.7.0.7 y 0.7.0.8 mediante otro comando al que responden esas dos compilaciones. Un volcado obtenido de otra forma se descifra como siempre.',
  'family.summary.compact2016':
    'Las compilaciones 1.0.3.x de la Compact PRO (1.0.3.0 y 1.0.3.2). Responden a las lecturas exactamente como las Compact de 2014, token de desbloqueo incluido, así que se distinguen por su versión y por cómo se almacenan sus ranuras: cifradas, mientras que las ranuras de 2014 están sin cifrar. Una cámara 1.0.3.x se lee con esta familia desde el principio. La ejecución de preservación lee toda la flash, y las ranuras se escriben de una en una en la pestaña «Gestionar ranuras de firmware».',
  /** `{sum}` is hex. */
  'family.summary.legacy':
    'Las Compact de 2014 de 0.8.0.0 a 1.3.0.8, entre ellas la compilación 1.3.0.8 FF de 16 Hz. Una cámara de serie deja leer menos de la mitad de su flash, parte de ella solo con un token de desbloqueo que envía la herramienta; la ejecución de preservación lee el resto mediante un parche temporal. Las ranuras se almacenan sin cifrar, salvo en la compilación FF. Una cámara Compact PRO 1.0.3.x se lee como compact-2016, y pasa a esta familia solo cuando una ranura está almacenada sin cifrar o se descifra con {sum}, como las de la compilación FF. Las ranuras se escriben en la pestaña «Gestionar ranuras de firmware» en las compilaciones con las que se midió la ejecución de preservación; cualquier otra compilación 0.x o 1.x solo se lee.',
  'family.summary.generic':
    'Una cámara que no coincide con ninguna otra familia. `seek-fw dump` la lee con la lista de bloques de 4.x (la pestaña 4.x/Nano la rechaza), y un descifrado resuelve la clave a partir de la propia imagen, así que ninguno de los dos depende de la suposición. No se escribe ninguna ranura: la pestaña «Gestionar ranuras de firmware» la rechaza hasta que se identifique la cámara.',

  /* ---- detect: why a family scored as it did, one item of the evidence list (profiles/*: `detect`) ---- */
  /* Each starts lower case: it is a list item, and writeRefusal.otherFamily joins them with common:list.semicolon.
   * `{said}` is detect.source.*; `{version}` a firmware or bootloader version; `{sum}`, `{zero}` hex.
   * Family ids (early-compact, compact-2016, legacy-auth), command names (BeginFirmwareUpgrade,
   * GetFeaturedFirmwareData) and xorshift128 stay English. */
  'detect.source.header': 'la cabecera de la imagen dice',
  'detect.source.camera': 'la cámara indica',
  'detect.plainArmedNotInForce':
    'un BeginFirmwareUpgrade simple de 2 bytes abrió una ranura protegida, así que el canal de lectura autenticado no está en vigor',
  'detect.modern.plainRefused':
    'se RECHAZÓ un BeginFirmwareUpgrade simple de 2 bytes sobre una ranura protegida, algo que no hace ninguna compilación de esta línea: su manejador no comprueba ningún token y acepta el canal simple en todas las ranuras',
  'detect.modern.authArmed':
    'una ranura protegida se abrió con el selector autenticado de 18 bytes; ahí no se probó el simple, así que eso no saca a esta cámara de esta línea',
  'detect.modern.legacyVersion':
    '{said} firmware {version}, que pertenece a la línea antigua 0.x / 1.x (otra línea de numeración, no una 4.x más antigua; y una de esas compilaciones también da la suma {sum})',
  'detect.modern.noSum':
    'ninguna ranura se descifra con la suma de comprobación {sum} que exige el bootloader de esta familia',
  'detect.modern.sum': 'una ranura se descifra con la suma de comprobación {sum}',
  'detect.modern.version':
    'el firmware {version} pertenece a la línea posterior a 2018 que cubre este mapa de selectores (2.x / 4.x / 10.x / 42.x / 44.x: Compact, Compact Pro, Compact XR, Mosaic, Nano)',
  'detect.modern.plainWorks':
    'un BeginFirmwareUpgrade simple de 2 bytes abrió una ranura protegida, así que no es el firmware antiguo bloqueado',
  'detect.modern.none': 'ningún indicio sitúa esta cámara en la línea posterior a 2018',
  'detect.early.noVersion':
    'no se indicó ninguna versión de firmware ni se encontró ninguna en la cabecera de una imagen',
  /** `{first}`: the first version with a read handler. */
  'detect.early.readable':
    'el firmware {version} es {first} o posterior, así que su tabla RPC tiene un lector para GetFeaturedFirmwareData y se aplica la vía de lectura normal',
  'detect.early.older':
    '{said} firmware {version}, anterior a {first}, la primera compilación cuya tabla de métodos RPC tiene un manejador de lectura (lector) para GetFeaturedFirmwareData',
  'detect.early.noWindow': 'y no se pudo leer ninguna ventana, que es lo que eso predice',
  'detect.generic.fallback':
    'alternativa: ninguna familia de firmware coincidió con seguridad, así que las lecturas siguen disponibles y las escrituras no',
  'detect.compact2016.early':
    'el firmware {version} es anterior a 0.8.0.0 y no tiene manejador de lectura para GetFeaturedFirmwareData: eso es early-compact, no esta familia',
  'detect.compact2016.modernSum':
    'una ranura se descifra con la suma de comprobación {sum}, que no es el objetivo de esta generación',
  'detect.compact2016.plainArmed':
    'un BeginFirmwareUpgrade simple de 2 bytes abrió una ranura protegida, así que esta cámara no está en la línea bloqueada que esta familia comparte con legacy-auth',
  'detect.compact2016.notLine': 'el firmware {version} no pertenece a la línea 0.x / 1.x',
  'detect.compact2016.storedPlain':
    'una ranura está almacenada sin cifrar (la resolución del flujo de clave devuelve el estado identidad, así que sus palabras almacenadas SON la imagen), y eso es la cadena sin cifrar de 2014; las ranuras de esta generación van en xorshift128 con una clave real',
  'detect.compact2016.keyedZero':
    'una ranura almacenada con un flujo de clave xorshift128 real se descifra con la suma de comprobación {sum}, que es el cifrado de esta generación',
  'detect.compact2016.zeroSum':
    'una ranura se descifra con la suma de comprobación {sum}, que es el objetivo de esta generación',
  'detect.compact2016.refused':
    'y una ranura protegida rechazó la apertura simple de 2 bytes, que es el manejador bloqueado',
  'detect.compact2016.proLine':
    '{said} firmware {version}, la línea 1.0.3.x de la Compact PRO de 2016',
  'detect.compact2016.compactLine':
    '{said} firmware {version}, una compilación de la Compact, no la línea 1.0.3.x de la Compact PRO',
  'detect.compact2016.lockedLine':
    '{said} firmware {version}, de la línea 0.x / 1.x que esta generación comparte con el firmware antiguo bloqueado',
  'detect.compact2016.bootloader2016':
    'el bootloader indica {version}, un bootloader de la generación de 2016 (1.2.0.0 se midió con la Compact PRO 1.0.3.0; el de la Compact de 2014 es 0.9.0.0)',
  'detect.compact2016.bootloader2014':
    'el bootloader indica {version}, la numeración de la generación de 2014, no la de esta generación',
  'detect.compact2016.none':
    'no se observó ninguna ranura que se descifrara con una suma de comprobación cero con una clave real',
  'detect.legacy.proLine':
    'pero el firmware {version} es de la línea 1.0.3.x de la Compact PRO de 2016, cuyas ranuras usan el cifrado de compact-2016: la comprobación de esta familia fallaría en todas ellas',
  'detect.legacy.early':
    'el firmware {version} es anterior a 0.8.0.0: su tabla RPC no tiene manejador de lectura para GetFeaturedFirmwareData (ninguno antes de 0.7.0.7, y solo uno de escritura en 0.7.0.7 y 0.7.0.8): eso es early-compact, no esta familia',
  'detect.legacy.keyedZero':
    'una ranura almacenada con un flujo de clave xorshift128 real se descifra con {zero}: el cifrado de la Compact PRO de 2016 (compact-2016). Esta línea almacena sus ranuras sin cifrar con una suma de palabras 0 (la cadena de 2014) o con clave hasta {sum} (Compact 1.3.0.8), y su comprobación falla con una ranura así',
  'detect.legacy.plainChain':
    'una ranura está almacenada como firmware sin cifrar cuyas palabras suman 0, tal como la arranca el bootloader de 2014 de esta línea',
  'detect.legacy.refused':
    'la cámara se negó a abrir una ranura bloqueada para una actualización cuando se le pidió sin el desbloqueo, algo que solo hace esta generación de firmware',
  'detect.legacy.unlocked':
    'y abrió la misma ranura cuando se le pidió con el desbloqueo, así que el desbloqueo que envía esta familia es el que comprueba esta cámara',
  'detect.legacy.notLine':
    '{said} firmware {version}, que no pertenece a la línea antigua 0.x / 1.x',
  'detect.legacy.authOnly':
    'abrió una ranura bloqueada para una actualización cuando se le pidió con el desbloqueo, como hace esta generación de firmware; no se probó a pedirlo sin el desbloqueo, así que esto solo no demuestra la generación',
  'detect.legacy.version':
    'el firmware {version} pertenece a la línea antigua 0.x / 1.x, que es otra línea de numeración distinta de las versiones de aplicación posteriores a 2018, no una 4.x más antigua',
  'detect.legacy.none': 'nada de lo observado apunta al canal de lectura autenticado',

  /* ---- fps.table: why the frame-rate patch table makes no patch for an image (preservation/fps-patch) ---- */
  /* `{version}`, `{image}`, `{camera}`: firmware versions; `{hz}`: a rate.
   * "stage two", Key A / Key B, f96ac57eda75 and the build names stay as they are. */
  'fps.table.withheld':
    'retenido tras una prueba en una cámara: allí el parche no subió la frecuencia de publicación, y el obturador se disparó en cada fotograma después de la escritura',
  'fps.table.predates':
    'el firmware {version} es anterior a 0.8.0.0: su tabla RPC no tiene manejador de lectura para GetFeaturedFirmwareData, el comando que envía una lectura de ranura, así que la pestaña de ranuras no lee ni escribe ninguna ranura de esa compilación, y no se ofrece el parche',
  'fps.table.stageTwoFf':
    'stage two: la compilación FF de 16 Hz se transfiere como la transfiere la app del fabricante (la imagen XOR la clave A, almacenada con la clave B), no como bytes sin cifrar, así que su comprobación de transferencia no está hecha y el parche aún no se ofrece',
  'fps.table.stageTwo':
    'stage two: esta entrada no está en el conjunto de stage two, así que su comprobación de transferencia no está hecha y el parche aún no se ofrece',
  'fps.table.notOffered': 'no se ofrece',
  'fps.table.notImage':
    'esto no es una imagen de firmware, así que no se le aplica ningún parche de velocidad de fotogramas',
  'fps.table.otherBuild':
    'la imagen es la compilación {image}, pero la cámara indica {camera}; el parche se rechaza en lugar de aplicarse a una compilación con la que no coincide',
  'fps.table.otherBuildNoVersion':
    'la imagen es la compilación {image}, pero la cámara no indica ninguna versión; el parche se rechaza en lugar de aplicarse a una compilación con la que no coincide',
  'fps.table.patched':
    'el parche de velocidad de fotogramas ya está aplicado: esta imagen funciona a {hz} Hz',
  'fps.table.earlierPatch':
    'esta imagen contiene un parche anterior de velocidad de fotogramas de {hz} Hz sin la corrección de USB, y nunca se aplica un parche a una imagen ya parcheada: restaura la imagen de serie y luego aplícale el parche',
  'fps.table.atRate': 'esta compilación ya funciona a {hz} Hz sin parche',
  'fps.table.not4821':
    'esta imagen indica la compilación 4.8.2.1 de la Compact (o la de la Compact XR 4.8.2.1, la misma compilación), pero no es la imagen de serie para la que se escribió el parche de velocidad de fotogramas (f96ac57eda75: sus páginas de comandos de 68 bytes, página estable 13), así que no se crea ningún parche de velocidad de fotogramas para ella',
  'fps.table.notInTable':
    'esta imagen no está en la tabla de parches de velocidad de fotogramas, así que no se crea ningún parche de velocidad de fotogramas para esta compilación. La tabla incluye las compilaciones de la Compact de 0.7.0.8 a 1.3.0.8 (8 Hz; el código de ranuras rechaza 0.7.0.8), 1.3.0.8 (16 Hz FF), 4.8.1.7, 4.8.1.9, 4.8.2.1 y 4.16.1.7 FF, y las compilaciones 1.0.3.x y 4.9.x de la Compact PRO; ninguna otra compilación tiene entrada',

  /* ---- fps: why a bank's frame-rate patch is not offered, or why a patch of every bank stopped (slots/fps-patch) ---- */
  'fps.plan.noBank': 'el plan de esta compilación no tiene {bank:acc}',
  /** `{reason}`: the build's own reason (English: the support table has no codes yet). */
  'fps.plan.noPlain':
    '{bank:acc} no puede recibir una imagen descifrada en esta compilación: {reason}',
  'fps.plan.empty':
    '{bank:acc} no tiene ninguna imagen descifrada a la que aplicar el parche (está vacía)',
  'fps.plan.noImage':
    '{bank:acc} no tiene ninguna imagen descifrada a la que aplicar el parche (no se leyó o ninguna clave la abre)',
  /** `{name}`: the bank (label form). */
  'fpsEvery.stopped.readBack':
    '{name:ins} se escribió, pero su relectura no difiere de la ranura guardada solo según lo previsto, así que no se escribieron las ranuras siguientes',
  /** `{error}`: the error's message (translated where core gives it a code). */
  'fpsEvery.stopped.error': '{name}: {error}',

  /* ---- notes: what the read measured about a build (slots/capability-notes) ----
   * The page shows only this one; it leaves the others out (lib/page-hidden.ts), and the CLI prints them
   * in English. */
  'notes.unverified':
    'Solo lectura. La disposición de las ranuras es la tabla decodificada de la línea bloqueada, pero no se ha medido ninguna forma de transferencia para esta compilación, así que no se planifica ninguna escritura.',

  /* ---- identity: why nothing is armed before the camera names its build (workflows/capability, window-plan) ---- */
  /** `{note}`: identity.note.*, the version read's own account. Command names (GetErrorCode, …) and wire ids stay. */
  'identity.versionUnknown':
    'la cámara no indicó su versión de firmware ({note}); un número de comando no significa lo mismo en todos los firmware de Seek (en la Compact 0.3.0.1, el wire id 0x52, el que abre una ventana de lectura, es EnterBootloaderMode), así que hasta conocer la versión no se envía nada salvo GetErrorCode, GetOperationMode y GetFirmwareInfo, las lecturas a las que todas las compilaciones responden igual',
  /* Why the version read gave no version (`{note}` above). `{error}`: the USB error (English unless it has
   * a code); `{reads}`, `{answered}`, `{count}`: numbers; `{spacing}`, `{window}`: milliseconds;
   * `{context}`: identity.note.otherRecord / afterStartup, joined with common:list.semicolon. */
  'identity.note.startup':
    'GetFirmwareInfo no respondió ({error}) en ninguna de {reads} lecturas separadas {spacing} ms, un margen de arranque de {window} ms; una cámara que aún está arrancando responde dentro de ese margen',
  'identity.note.neverTwice':
    'GetFirmwareInfo nunca respondió dos veces seguidas en {reads} lecturas',
  'identity.note.noAnswer': 'GetFirmwareInfo no respondió ({error})',
  'identity.note.noAnswerSome':
    'GetFirmwareInfo no respondió ({error}); respondieron {answered} de {reads} lecturas, nunca dos seguidas, así que ninguna se puede distinguir de un registro que dejó seleccionado un comando anterior',
  'identity.note.tooShort': {
    one: 'GetFirmwareInfo respondió con {count} byte, demasiado pocos para una versión',
    many: 'GetFirmwareInfo respondió con {count} de bytes, demasiado pocos para una versión',
    other: 'GetFirmwareInfo respondió con {count} bytes, demasiado pocos para una versión',
  },
  'identity.note.tooShortContext': {
    one: 'GetFirmwareInfo respondió con {count} byte, demasiado pocos para una versión; {context}',
    many: 'GetFirmwareInfo respondió con {count} de bytes, demasiado pocos para una versión; {context}',
    other:
      'GetFirmwareInfo respondió con {count} bytes, demasiado pocos para una versión; {context}',
  },
  'identity.note.otherRecord':
    'la primera lectura respondió con otro registro ({version}), en el que un comando anterior había dejado el selector de información del firmware; esa lectura lo restableció',
  'identity.note.afterStartup': {
    one: 'respondió después de rechazar {count} lectura mientras arrancaba',
    many: 'respondió después de rechazar {count} de lecturas mientras arrancaba',
    other: 'respondió después de rechazar {count} lecturas mientras arrancaba',
  },
  'identity.predates':
    'el firmware {version} es anterior al protocolo de volcado: su tabla de métodos RPC no tiene manejador de lectura para GetFeaturedFirmwareData (en 0.7.0.7 y 0.7.0.8 solo está registrado como escritura, y antes de eso el wire id 0x4F es UploadFirmwareRowSize), así que no se puede leer ninguna ventana con él; en 0.3.0.1 el wire id 0x52 es EnterBootloaderMode en lugar de BeginFirmwareUpgrade. La ejecución de preservación lee 0.7.0.7 y 0.7.0.8 mediante el wire id 0x58 (GetFeaturedData)',
  /** `{operation}` is identity.operation.*, said after "refusing to"; `{reason}` is identity.versionUnknown or identity.predates. */
  'identity.refusing': 'se rechaza {operation}: {reason}',
  'identity.refusingNoVersion':
    'se rechaza {operation}: {reason}. No se abrió nada. Desconecta la cámara, vuelve a conectarla, deja que termine de arrancar y vuelve a intentarlo.',
  'identity.operation.dump': 'el volcado',
  'identity.operation.dumpAll': 'el volcado de todos los selectores',
  'identity.operation.readInfo': 'la lectura de la información del dispositivo',

  /* ---- preserve: a Preserve run's own refusals (preservation/steps) ---- */
  'preserve.banks.beforeBackup':
    'las ranuras se eligen después de la copia de seguridad, que las lee: haz primero la copia de seguridad',
  /** `{banks}`: the banks the run writes, joined with commas, or preserve.banks.none. */
  'preserve.banks.afterCommit':
    'las ranuras no pueden cambiar una vez hecha o intentada la escritura; esta ejecución escribe en: {banks}. La restauración vuelve a poner exactamente esas',
  'preserve.banks.none': 'ninguna ranura',

  /* ---- status: a status line a run leaves under its progress bar ---- */
  'status.written': 'Escrito.',
  /** `{count}` of `{of}` slots answered. */
  'status.read': 'Leído. {count}/{of} ranuras legibles.',
  'status.readRefused':
    'Leído, pero desde aquí no se puede escribir en ninguna ranura de esta cámara: consulta el registro.',

  /* ---- compare: the "now / after the write" table of a write's preview (slots/write-image compareRows) ---- */
  'compare.field.version': 'Versión de firmware',
  'compare.field.imageId': 'Id. de imagen',
  /** SP: the stack pointer word of the image's vector table (keep "SP"). */
  'compare.field.initialSp': 'SP inicial',
  'compare.field.resetVector': 'Vector de reinicio',
  'compare.field.size': 'Tamaño',
  'compare.field.shaExpected': 'SHA-256 de la imagen sin cifrar esperada',
  'compare.field.sha': 'SHA-256 de la imagen',
  'compare.field.shaNotStored':
    'SHA-256 de la imagen sin cifrar esperada (bytes almacenados no predichos)',
  'compare.field.key': 'Clave',
  /** The values in brackets stand where a value would be. */
  'compare.noImage': '(sin imagen)',
  'compare.notImage': '(no es una imagen)',
  'compare.notPredicted': '(no predicho: el dispositivo decide qué almacena)',
  'compare.plaintext': 'ninguna (sin cifrar)',
  /* ---- preserve: the Preserve tab's bank table, choices, plan, results and refusals (preservation/banks, words, steps) ---- */
  /** A bank's verdict word inside boot.select.unknown: its two reads differed. */
  'boot.verdict.unsettled': 'no se pudo leer igual dos veces',
  /** `{why}` is a boot.select.* sentence; "[inferred]" is a tag the project uses for an inference: keep it as it is. */
  'preserve.boot.inferred':
    '{why} (la clave con la que el bootloader comprueba una ranura se deduce {bank:gen}, en la que entró sin su comprobación) [inferred]',
  /** The "Last start" row. `{word}` is the active-slot word as a decimal number. */
  'preserve.lastStart.entered':
    '{bank}, según lo registra la cámara (palabra de ranura activa {word})',
  'preserve.lastStart.notRead': 'no se sabe: no se pudo leer la palabra de ranura activa',
  'preserve.lastStart.noBank':
    'no se sabe: la palabra de ranura activa es {word}, que no nombra ninguna ranura',
  /** The "Next start" row: `{why}` is a boot.select.* sentence. */
  'preserve.nextStart.known': '{bank} — {why}',
  'preserve.nextStart.unknown': 'no se sabe: {why}',
  /** The bank table's "Holds" cell. `{reason}` is a preserve.refused.* sentence (or core's English for an unread image). */
  'preserve.bank.notWritten': 'no se escribe: {reason}',
  /** `{build}` in preserve.bank.writable*, when the bank's build has no name. */
  'preserve.bank.anImage': 'una imagen',
  /** `{build}` is the build's name ("Compact Pro 1.0.3.0 (9 Hz)", kept as it is) or preserve.bank.anImage; `{edit}` is a frame-rate edit's name (kept as it is). */
  'preserve.bank.writable': '{build}: se puede escribir',
  'preserve.bank.writablePatch': '{build}: se puede escribir; el parche cambia {count} bytes',
  'preserve.bank.writableEdit': '{build}: se puede escribir; lleva {edit}',
  'preserve.bank.writablePatchEdit':
    '{build}: se puede escribir; el parche cambia {count} bytes; lleva {edit}',
  /** The bank choice: what it writes, or why it cannot. `{why}` is a boot.select.* sentence, `{reason}` a preserve.refused.* one. */
  'preserve.choice.notRead':
    'la copia de seguridad aún no ha leído las ranuras, así que no se puede elegir ninguna',
  'preserve.choice.every': 'todas las ranuras que contienen una imagen: {banks}',
  'preserve.choice.everyBlocked':
    'no se puede escribir en todas las ranuras que contienen una imagen: en {bank:acc} no se puede ({reason})',
  'preserve.choice.noImage': 'ninguna ranura contiene una imagen que la ejecución pueda escribir',
  'preserve.choice.nextStart': '{bank}, la ranura del próximo arranque: {why}',
  'preserve.choice.nextStartRefused':
    'el próximo arranque entra {bank:loc} ({why}), y la ejecución no puede escribir en ella: {reason}',
  'preserve.choice.everyUnknownStart':
    'todas las ranuras que contienen una imagen ({banks}): no se sabe en qué ranura entra el próximo arranque ({why})',
  /** `{reason}` is preserve.choice.everyBlocked or preserve.choice.noImage. */
  'preserve.choice.unknownStartRefused':
    'no se sabe en qué ranura entra el próximo arranque ({why}), y {reason}; elige una ranura por su nombre',
  /** A choice by name: just the bank. */
  'preserve.choice.bank': '{bank}',
  'preserve.choice.bankRefused': 'no se puede escribir en {bank:acc}: {reason}',
  'preserve.choice.byName': '{banks}, la ranura elegida por su nombre',
  'preserve.choice.warnNotPatched':
    'El próximo arranque entra {bank:loc} ({why}), y esta elección no le aplica el parche: tras el reinicio, la cámara ejecuta la imagen propia de esa ranura, así que la lectura completa se detiene antes de leer nada. La restauración vuelve a poner igualmente todas las ranuras escritas.',
  'preserve.choice.warnUnknownStart':
    'No se sabe en qué ranura entra el próximo arranque ({why}). Si entra en una ranura a la que esta elección no aplica el parche, la lectura completa se detiene antes de leer nada.',
  /** The plan's "Build" row when the build has no name yet. */
  'preserve.build.notKnown': 'aún no se sabe',
  'preserve.build.firmware': 'firmware {version}',
  /** How a written bank is sent and put back (the plan's "Written" row; `{form}` in preserve.result.restoreForm). */
  'preserve.stagedForm.plain':
    'tal como lo almacena la cámara (esta cámara guarda su firmware sin cifrar)',
  'preserve.stagedForm.oneKey':
    'en la forma en que lo almacena la cámara (cifrado con la clave de la cámara)',
  'preserve.stagedForm.twoKeys':
    'en la forma en que lo almacena la cámara (cifrado con las dos claves de la cámara)',
  /** The plan's "Restore" row. */
  'preserve.restoreForm.verbatim':
    'cada ranura escrita recupera exactamente los bytes que la copia de seguridad leyó de ella',
  'preserve.restoreForm.factoryStaged':
    'cada ranura escrita recupera su firmware original, escrito en la forma en que lo almacena la cámara, así que la ranura queda byte a byte como la leyó la copia de seguridad',
  'preserve.restoreForm.none':
    'no es posible en esta compilación: ninguna forma del firmware original pasa la propia comprobación de la cámara y a la vez se almacena como los bytes originales, así que la ejecución termina con la imagen completa y con el parche aún puesto',
  /** The plan's "Whole flash" row. `{notes}` is preserve.drain.rotated / .hazard, joined with common:list.semicolon. */
  'preserve.drain.notPossible':
    'no es posible en esta compilación: el firmware con el parche no puede leer toda la flash, así que la ejecución no tiene ninguna imagen completa que dar',
  'preserve.drain.rotated':
    'la cámara la entrega rotada, y la ejecución la vuelve a poner en orden',
  'preserve.drain.hazard': 'el parche evita una lectura que en esta compilación bloquea la cámara',
  'preserve.drain.whole': 'toda la flash de 4 MB en una lectura, de {size} en {size} bytes',
  'preserve.drain.wholeNotes':
    'toda la flash de 4 MB en una lectura, de {size} en {size} bytes; {notes}',
  /** What one changed instruction of the patch does (the patch table's first column). */
  'preserve.site.wholeFlash':
    'permite que el comando de lectura de la cámara llegue a toda la flash de 4 MB, no solo a los primeros 64 KB',
  'preserve.site.countPast':
    'permite que la posición de lectura pase de 64 KB, para que una lectura no vuelva al principio',
  'preserve.site.keepPosition':
    'conserva la posición de lectura completa cuando avanza después de cada lectura',
  'preserve.site.savePosition': 'guarda completa la posición de lectura ya avanzada',
  'preserve.site.clearPosition':
    'borra la posición de lectura completa cada vez que empieza una lectura, para que la cámara se pueda seguir leyendo después de la lectura completa',
  'preserve.site.modeTwoGuard':
    'deja que la lectura completa empiece como cualquier otra lectura (el firmware de serie la rechaza)',
  'preserve.site.modeTwoIndirection':
    'hace que la lectura completa apunte al principio de la flash (el firmware de serie la hace apuntar a un valor que bloquea la cámara)',
  'preserve.site.armTail':
    'quita una llamada que congela la cámara cuando empieza una lectura en esta compilación',
  'preserve.site.other': 'cambia una instrucción que necesita la lectura completa',
  /** A step's name (`{label}` in preserve.result.*). */
  'preserve.step.backup': 'Copia de seguridad',
  'preserve.step.patch': 'Parche',
  'preserve.step.commit': 'Escritura',
  'preserve.step.drain': 'Lectura completa',
  'preserve.step.restore': 'Restauración',
  'preserve.step.verify': 'Comprobación',
  /* A step named at the start of a gate sentence: the CLI's step id in English; a translation names
   * the step the way its chip does (preserve.step.*), lower case, with what its grammar needs around it. */
  'preserve.stepId.patch': 'el paso «Parche»',
  'preserve.stepId.commit': 'el paso «Escritura»',
  'preserve.stepId.drain': 'el paso «Lectura completa»',
  'preserve.stepId.restore': 'el paso «Restauración»',
  'preserve.stepId.verify': 'el paso «Comprobación»',
  /** A step's result. `{label}` is a preserve.step.* name; `{error}` is the step's error (another key of this namespace, or core's English). */
  'preserve.result.stoppedPlanned':
    '{label}: detenido según lo previsto. La cámara arrancó desde {bank:acc}, a la que esta ejecución no aplicó el parche, así que no se leyó nada.',
  'preserve.result.noReason': 'no se registró ningún motivo',
  'preserve.result.stopped': '{label}: detenido — {error}',
  /** `{writable}` in preserve.result.backup*. */
  'preserve.result.writable.none':
    'ninguna ranura contiene firmware al que la ejecución pueda aplicar el parche',
  'preserve.result.writable.one':
    '{banks:acc} contiene firmware al que la ejecución puede aplicar el parche',
  'preserve.result.writable.many':
    '{banks:acc} contienen firmware al que la ejecución puede aplicar el parche',
  'preserve.result.backup':
    '{label}: se guardaron todos los bloques que alcanza una lectura normal; {writable}.',
  /** `{next}` in preserve.result.backupNext when no bank is known. */
  'preserve.result.nextUnknown': 'una ranura desconocida',
  'preserve.result.backupNext':
    '{label}: se guardaron todos los bloques que alcanza una lectura normal; {writable}; ranura del próximo arranque: {next}.',
  'preserve.result.patch': '{label}: creado para {banks:acc}.',
  /** The patch step when every bank was refused: nothing to build for. */
  'preserve.result.patchNone':
    '{label}: no se creó ningún parche: ninguna ranura contiene firmware al que la ejecución pueda aplicarlo.',
  'preserve.result.patchCount':
    '{label}: creado para {banks:acc}; cambian {count} bytes en cada una.',
  'preserve.result.commitOne': '{label}: se escribió el parche {banks:loc}, y la cámara lo aceptó.',
  'preserve.result.commitMany':
    '{label}: se escribió el parche {banks:loc}, y la cámara aceptó cada escritura.',
  'preserve.result.drainNotRead': '{label}: no se leyó.',
  'preserve.result.drain':
    '{label}: se leyó toda la flash de 4 MB; la imagen completa tiene sha256 {sha256}.',
  'preserve.result.drainThrough':
    '{label}: se leyó toda la flash de 4 MB a través {bank:gen}; la imagen completa tiene sha256 {sha256}.',
  'preserve.result.restore': '{label}: se volvió a escribir el contenido original {banks:gen}.',
  /** `{form}` is a preserve.stagedForm.* phrase. */
  'preserve.result.restoreForm':
    '{label}: se volvió a escribir el contenido original {banks:gen}, {form}.',
  'preserve.result.verifyDone': '{label}: hecho.',
  'preserve.result.verifyIdentical':
    '{label}: se volvieron a leer {blocks} bloques y difieren 0 bytes; la flash de la cámara es idéntica byte a byte a la copia de seguridad.',
  'preserve.result.verifyDiffers':
    '{label}: se volvieron a leer {blocks} bloques y difieren {bytes} bytes.',
  'preserve.result.verifyDiffersUnread': {
    one: '{label}: se volvieron a leer {blocks} bloques, difieren {bytes} bytes y no se pudo leer {count} bloque.',
    many: '{label}: se volvieron a leer {blocks} bloques, difieren {bytes} bytes y no se pudieron leer {count} de bloques.',
    other:
      '{label}: se volvieron a leer {blocks} bloques, difieren {bytes} bytes y no se pudieron leer {count} bloques.',
  },
  /** The whole-flash read stopped as planned: the start entered a bank the run did not patch. */
  'preserve.unpatchedStart.stop':
    'Detenido antes de la lectura completa: la cámara arrancó desde una ranura a la que esta ejecución no aplicó el parche, así que no se leyó nada.',
  'preserve.unpatchedStart.next':
    'Siguiente paso: la restauración vuelve a poner todas las ranuras escritas. La lectura completa no se vuelve a intentar: la cámara arrancaría desde la misma ranura.',
  /** The last screen's title and text. */
  'preserve.done.title': 'Hecho: tu firmware está preservado',
  'preserve.done.detail':
    'La imagen completa es toda la flash original de la cámara, y la propia cámara ha vuelto a estar exactamente como estaba.',
  'preserve.done.titleNoImage':
    'Hecho: la cámara ha vuelto a estar como estaba; no hay imagen completa',
  'preserve.done.detailNoImage':
    'La lectura completa no se ejecutó, así que esta ejecución no tiene ninguna imagen completa de la flash. Se volvieron a poner todas las ranuras escritas, y una lectura nueva de los bloques que alcanza un volcado normal coincide con la copia de seguridad. Para tener la imagen completa, empieza una ejecución nueva con una elección que incluya la ranura del próximo arranque.',
  'preserve.done.detailNoImageCount':
    'La lectura completa no se ejecutó, así que esta ejecución no tiene ninguna imagen completa de la flash. Se volvieron a poner todas las ranuras escritas, y una lectura nueva de los {blocks} bloques que alcanza un volcado normal coincide con la copia de seguridad. Para tener la imagen completa, empieza una ejecución nueva con una elección que incluya la ranura del próximo arranque.',
  /** Why the run cannot write a bank (`{reason}` in preserve.bank.notWritten and preserve.choice.*). `{error}` is the read's error; `{sha256}`/`{other}` are hashes. */
  /* ---- preserve.fail: why a Preserve step stopped (preservation/steps), shown as "{error}" ---- */
  /** `{signature}`: what the spent reader served, in English (a description of the bytes). `preserve --resume <run-directory>` stays as it is. */
  'preserve.fail.spentReader':
    'el lector de ventanas de la cámara tiene un límite por arranque y estas lecturas vinieron de un lector agotado: apaga la cámara y vuelve a encenderla (desconéctala y vuelve a conectarla, o usa su interruptor) y vuelve a ejecutar `preserve --resume <run-directory>`. Firma: {signature}',
  /** preserve.fail.spentReader when no image derives from the bytes: `{reasons}` is why each way failed, in English (the log's words), one per line. */
  'preserve.fail.spentReaderDerive':
    'el lector de ventanas de la cámara tiene un límite por arranque y estas lecturas vinieron de un lector agotado: apaga la cámara y vuelve a encenderla (desconéctala y vuelve a conectarla, o usa su interruptor) y vuelve a ejecutar `preserve --resume <run-directory>`. Firma: {signature}. No se puede derivar ningún texto sin cifrar de fábrica de estos bytes. Se probaron todas las formas de leerlo:\n  - {reasons}',
  /** `{address}` hex; `{sha256}`, `{other}`: SHA-256 values; `{live}`, `{capture}`: hex bytes. */
  'preserve.fail.notInBackup':
    'la copia de seguridad no contiene {bank:acc} ({address}): las ventanas de serie no pueden entregarla',
  'preserve.fail.readsDisagree':
    'las dos lecturas {bank:gen} no coinciden (sha256 {sha256} frente a {other}): no se debe escribir en una cámara que no puede entregar dos veces seguidas igual la ranura que ejecuta; la captura es la fuente de la restauración y el punto de partida del parche',
  'preserve.fail.notFactory':
    '{bank:ins} no contiene la imagen de fábrica tal como la almacena el cifrado de esta compilación (el principio esperado de la imagen no coincide con la captura): se rechaza antes de registrar nada, y mucho menos de escribir',
  'preserve.fail.ffSum':
    'el firmware con el parche, en la forma en que lo almacena la cámara, no pasa la propia comprobación de esta compilación (su suma debe ser {sum}): se rechaza enviar una ranura que la cámara rechazaría después de borrarla',
  'preserve.fail.headChanged':
    'el principio {bank:gen} ha cambiado desde la copia de seguridad (no contiene ni la captura original ni los bytes con el parche): se rechaza escribir sobre una ranura en un estado desconocido; no se escribió nada. Principio en hexadecimal: actual {live} frente a captura {capture}',
  /** `--resume` stays as it is. */
  'preserve.fail.landedOne':
    '{banks:ins} ya contiene los bytes con el parche: la escritura se completó en un intento anterior y no debe repetirse. Reanuda en el paso de lectura completa (drain, --resume), que arranca la imagen con el parche y continúa desde ahí.',
  'preserve.fail.landed':
    'Estas ranuras ya contienen los bytes con el parche: {banks}. La escritura se completó en un intento anterior y no debe repetirse. Reanuda en el paso de lectura completa (drain, --resume), que arranca la imagen con el parche y continúa desde ahí.',
  'preserve.fail.drainRebootRefused':
    'el equipo RECHAZÓ el comando de reinicio de la lectura completa antes de que saliera (un SecurityError: una política del navegador o una protección de prueba), así que la cámara sigue ejecutando la imagen con la que arrancó, no el parche escrito. La lectura completa solo lee a través de la ventana ampliada de la imagen con el parche, así que se detiene antes de abrir nada; no se leyó nada. Vuelve a ejecutar la lectura completa donde el equipo deje pasar el comando de reinicio.',
  'preserve.fail.shiftedRebootRefused':
    'la lectura completa volvió desplazada una página, y el equipo RECHAZÓ el reinicio que daría otro arranque antes de que saliera (un SecurityError: una política del navegador o una protección de prueba); otro intento leería el mismo arranque desplazado. No se guardó nada; vuelve a ejecutar la lectura completa donde el reinicio pueda salir.',
  /** `{count}`: bytes; `{read}`/`{total}`: windows; `{places}`: preserve.fail.verifyPlace, joined with commas; `{short}`: window numbers. */
  'preserve.fail.verify': {
    one: 'la comprobación leyó {count} byte distinto en {read}/{total} ventanas: el chip no se relee idéntico byte a byte a la copia de seguridad',
    many: 'la comprobación leyó {count} de bytes distintos en {read}/{total} ventanas: el chip no se relee idéntico byte a byte a la copia de seguridad',
    other:
      'la comprobación leyó {count} bytes distintos en {read}/{total} ventanas: el chip no se relee idéntico byte a byte a la copia de seguridad',
  },
  'preserve.fail.verifyIn': {
    one: 'la comprobación leyó {count} byte distinto en {read}/{total} ventanas (en {places}): el chip no se relee idéntico byte a byte a la copia de seguridad',
    many: 'la comprobación leyó {count} de bytes distintos en {read}/{total} ventanas (en {places}): el chip no se relee idéntico byte a byte a la copia de seguridad',
    other:
      'la comprobación leyó {count} bytes distintos en {read}/{total} ventanas (en {places}): el chip no se relee idéntico byte a byte a la copia de seguridad',
  },
  'preserve.fail.verifyShort': {
    one: 'la comprobación leyó {count} byte distinto en {read}/{total} ventanas (ventanas cortas: {short}): el chip no se relee idéntico byte a byte a la copia de seguridad',
    many: 'la comprobación leyó {count} de bytes distintos en {read}/{total} ventanas (ventanas cortas: {short}): el chip no se relee idéntico byte a byte a la copia de seguridad',
    other:
      'la comprobación leyó {count} bytes distintos en {read}/{total} ventanas (ventanas cortas: {short}): el chip no se relee idéntico byte a byte a la copia de seguridad',
  },
  'preserve.fail.verifyInShort': {
    one: 'la comprobación leyó {count} byte distinto en {read}/{total} ventanas (en {places}) (ventanas cortas: {short}): el chip no se relee idéntico byte a byte a la copia de seguridad',
    many: 'la comprobación leyó {count} de bytes distintos en {read}/{total} ventanas (en {places}) (ventanas cortas: {short}): el chip no se relee idéntico byte a byte a la copia de seguridad',
    other:
      'la comprobación leyó {count} bytes distintos en {read}/{total} ventanas (en {places}) (ventanas cortas: {short}): el chip no se relee idéntico byte a byte a la copia de seguridad',
  },
  /** `{what}`: a bank, or one of the two below; `{address}` hex. */
  'preserve.fail.verifyPlace': '{what} {address}',
  'preserve.fail.bootConfigBlock': 'el bloque de configuración de arranque',
  'preserve.fail.dataBlock': 'un bloque de datos',

  'preserve.refused.secondRead': 'su segunda lectura falló ({error})',
  'preserve.refused.readsDisagree':
    'sus dos lecturas no coinciden (sha256 {sha256} frente a {other})',
  'preserve.refused.erased': 'está borrada',
  'preserve.refused.watchdogMark':
    'su palabra de cabecera en +0x200 contiene {word}, la marca que el bootloader escribe sobre una ranura tras un reinicio del watchdog al principio de un arranque; el bootloader ya no acepta esta ranura, y la ejecución no tiene ahí ninguna imagen a la que aplicar el parche',
  'preserve.refused.noHeader': 'no contiene ninguna cabecera de imagen en +0x200',
  /** `{image}` and `{camera}` are build names, `{id}` a build id: all kept as they are. */
  'preserve.refused.otherBuild':
    'contiene {image} ({id}), no la compilación que ejecuta la cámara ({camera})',
  'preserve.refused.otherKey':
    'la comprobación del bootloader la rechaza: está almacenada con una clave distinta de aquella con la que el bootloader de esta cámara comprueba las ranuras, y una escritura a través de la cámara la almacenaría con esa clave, así que la restauración no podría volver a poner sus bytes exactos',
  /** A step refused: the camera runs another firmware than the run's. */
  'preserve.error.otherVersion':
    'la cámara indica el firmware {camera} y se esperaba {version}: el parche se deriva de los bytes de una compilación y no debe enviarse a otra',
  /* ---- preserve: the line gates, before any window is read (preservation/patch) ---- */
  'preserve.refused.outsideLine':
    'el firmware {version} no es una compilación 0.x ni 1.x, y esta ejecución solo cubre las compilaciones de 2014 y 2016. No se leyó nada más que la versión. Lee esta cámara con «Volcar y descifrar 4.x/Nano»: lee la flash sin parche, todos los bloques salvo el de 0x14060000, al que ninguna ventana de lectura llega en esas compilaciones.',
  'preserve.refused.preWidening':
    'el firmware {version} es anterior a la vía de ampliación, y la ejecución se niega antes que escribir sobre una ranura que no puede releer. En esta generación la cámara rechaza todas las formas de iniciar la lectura que necesita esa vía (medido en 0.3.0.1), su comando de lectura no llega al principio de la flash, y el tamaño que cambiaría el parche se almacena de otra forma. Tampoco tiene ninguna lectura que pueda usar un volcado normal. No se leyó nada más que la versión.',
  /* ---- preserve: a bank whose image the run cannot patch (preservation/banks, steps) ---- */
  /** `{what}` in preserve.image.unknownWords and .unknownRefusal. */
  'preserve.image.unknown':
    'contiene una imagen desconocida (ni el firmware {version} de serie ni un cambio en él que Preserve conozca), así que Preserve no le aplica el parche ni la vuelve a poner',
  /** `{what}` in preserve.image.frameRateWords and .frameRateRefusal; `{hz}` is a number. */
  'preserve.image.frameRate':
    'contiene una compilación conocida con cambio de velocidad de fotogramas: el firmware {version} de serie con el parche de velocidad de fotogramas de {hz} Hz. Preserve solo aplica su parche al firmware de serie, nunca a una imagen ya parcheada, así que no se lo aplica a esta ranura ni la vuelve a poner',
  'preserve.image.frameRateEarlier':
    'contiene una compilación conocida con cambio de velocidad de fotogramas: el firmware {version} de serie con un parche anterior de velocidad de fotogramas de {hz} Hz (hecho antes de que se le añadiera la corrección de USB). Preserve solo aplica su parche al firmware de serie, nunca a una imagen ya parcheada, así que no se lo aplica a esta ranura ni la vuelve a poner',
  /** A bank's row in the bank table and the choices ("it" is the bank). */
  'preserve.image.unknownWords':
    'esta ranura {what}. Para incluirla, vuelve a escribir antes en ella la imagen de serie (por ejemplo, desde una copia de seguridad completa de la flash hecha antes del cambio) y luego empieza una ejecución nueva',
  'preserve.image.frameRateWords':
    'esta ranura {what}. Para incluirla, vuelve a escribir antes en ella la imagen de serie (por ejemplo, desde una copia de seguridad completa de la flash hecha antes del parche de velocidad de fotogramas) y luego empieza una ejecución nueva; después se puede volver a aplicar el parche de velocidad de fotogramas a la imagen de serie',
  /** The run stops: `{name}` is the bank as a label ("Slot A"), `{bank}` in a sentence ("slot A"). */
  'preserve.image.unknownRefusal':
    '{name}: {what}. La ejecución toma de esta ranura el firmware al que aplica el parche, así que se detiene aquí, antes de escribir nada. Para preservar esta cámara, vuelve a escribir antes la imagen de serie {bank:loc} (por ejemplo, desde una copia de seguridad completa de la flash hecha antes del cambio) y luego empieza una ejecución nueva.',
  'preserve.image.frameRateRefusal':
    '{name}: {what}. La ejecución toma de esta ranura el firmware al que aplica el parche, así que se detiene aquí, antes de escribir nada. Para preservar esta cámara, vuelve a escribir antes la imagen de serie {bank:loc} (por ejemplo, desde una copia de seguridad completa de la flash hecha antes del parche de velocidad de fotogramas) y luego empieza una ejecución nueva; después se puede volver a aplicar el parche de velocidad de fotogramas a la imagen de serie.',
  'preserve.image.otherFirmware':
    'contiene el firmware {image}, no el {camera} que ejecuta la cámara',
  'preserve.image.otherFirmwareRefusal':
    '{name}: contiene el firmware {image}, no el {camera} que ejecuta la cámara, así que esta ejecución no tiene ahí ninguna imagen a la que aplicar el parche y se niega antes que escribir sobre ella.',
  /** `{error}`: the patch builder's refusal, in English (it has no code). */
  'preserve.image.noImage':
    'no se deriva de ella ninguna imagen a la que la ejecución pueda aplicar el parche ({error})',
  /* ---- preserve: why a step cannot run now (preservation/steps describeStepGate) ---- */
  /** In preserve.gate.stepDone, stepDoneUnknownTime and backupRerun, `{step}`, `{next}` and `{steps}` are the run's step ids as the CLI names them (backup, patch, commit, drain, restore, verify): keep them. In the other gate sentences, `{step}` is a step's name (preserve.stepId.*), already translated. `--resume` and `allowJump` are option names: keep them. */
  'preserve.gate.runDone':
    'esta ejecución ha terminado: se completaron todos los pasos (ejecución {run})',
  /** `{finished}`: a date and time (ISO 8601). */
  'preserve.gate.stepDone':
    '{step} ya está hecho en esta ejecución (terminó el {finished}); la reanudación continúa en {next}',
  'preserve.gate.stepDoneUnknownTime':
    '{step} ya está hecho en esta ejecución (terminó en un momento desconocido); la reanudación continúa en {next}',
  'preserve.gate.backupRerun':
    'la copia de seguridad no se puede repetir: esta ejecución ya completó {steps} y su paso siguiente es {next}; usa --resume',
  /** `{error}`: the failed backup's recorded error, or preserve.gate.noErrorText. */
  'preserve.gate.powerCycle':
    'el intento anterior de copia de seguridad falló, y hay que APAGAR Y VOLVER A ENCENDER la cámara antes de repetir este paso: un nuevo intento en el mismo arranque puede leer bytes viejos o en blanco (medido: una copia de seguridad repetida leyó la palabra de arranque del bootloader en lugar del registro de configuración de arranque). Apaga la cámara y vuelve a encenderla (desconéctala y vuelve a conectarla, o usa su interruptor), luego vuelve a ejecutar la copia de seguridad y confirma el apagado cuando se te pida: la ejecución no puede verlo. El fallo registrado: {error}',
  'preserve.gate.noErrorText': '(sin texto de error)',
  'preserve.gate.patchAfterBackup':
    '{step} se ejecuta después de la copia de seguridad: la ejecución toma el volcado de todas las regiones que puede leer el plan de serie y lo guarda ANTES de que pase nada más; esa copia de seguridad es la única copia de esta cámara. Ejecuta antes el paso de copia de seguridad.',
  'preserve.gate.commitAfterBackup':
    '{step} se ejecuta después de la copia de seguridad (consulta el paso «Parche»)',
  'preserve.gate.commitAfterPatch':
    '{step} se ejecuta después del paso «Parche», que registra lo que transfiere',
  'preserve.gate.commitNeedsPatch':
    '{step} necesita el parche {banks:gen}, y el paso «Parche» no registró ninguno: vuelve a ejecutar el paso «Parche»',
  /** `{files}`: file names, joined with common:list.comma. */
  'preserve.gate.commitFiles':
    '{step} necesita los archivos de la copia de seguridad en la carpeta de la ejecución y faltan: {files}. Sin ellos, una escritura no tiene de dónde restaurar, así que se niega',
  'preserve.gate.drainNoCommit':
    '{step} lee el chip CON EL PARCHE a través de la ventana ampliada, y esta ejecución no tiene ninguna escritura completada: la lectura completa se atascaría en una cámara de serie. Ejecuta antes la escritura (o reanuda en ella), o salta de forma explícita (allowJump) si la escritura se hizo sin su punto de control.',
  /** `{build}`: a build's name, preserve.build.firmware or preserve.gate.detectedBuild. `{note}`: the capability table's note, in English. */
  'preserve.gate.drainRefused': 'el paso de lectura completa se niega en {build}: {note}',
  'preserve.gate.detectedBuild': 'la compilación detectada',
  /** `{sites}`: hex offsets, joined with common:list.comma. */
  'preserve.gate.drainHazard':
    'el paso de lectura completa se niega en {build}: iniciar la lectura completa en el firmware sin parche de esta compilación bloquea la cámara (lee desde un valor que no es una dirección de la flash; medido en el emulador: se entregaron 32 KB y luego la cámara falló). El cambio que hace segura la lectura está en {sites}, y no está entre los cambios que esta ejecución registró para {bank:acc}: ejecuta el paso «Parche» (y completa la escritura) antes de la lectura completa.',
  'preserve.gate.drainFiles':
    '{step} necesita {files} (el volcado entregado se procesa después con la captura de cada ranura escrita) y no está en la carpeta de la ejecución',
  'preserve.gate.restoreNoCommit':
    '{step} vuelve a poner las ranuras originales encima del parche, y esta ejecución no tiene ninguna escritura completada: no hay nada que deshacer. Ejecuta antes la escritura (o reanuda en ella), o salta de forma explícita (allowJump) para restaurar una cámara que ya tiene el parche.',
  'preserve.gate.restoreNeedsPatch':
    '{step} necesita el resumen del parche de cada ranura escrita (por la longitud transferida): ejecuta antes el paso «Parche»',
  'preserve.gate.restoreNoForm':
    'el paso de restauración se niega en {build}: ninguna forma del firmware original pasa la propia comprobación de la cámara y a la vez se almacena como los bytes originales; la suma de comprobación del firmware original es 0xB7AB9D17 (medido), no el 0xFFFF que exige la cámara. Esta ejecución termina con la imagen completa en la mano y con el parche puesto; el contenido original solo se puede volver a poner con un programador de toda la flash.',
  'preserve.gate.restoreFiles':
    '{step} necesita {files} (el original de cada ranura escrita, del paso de copia de seguridad) y no está en la carpeta de la ejecución',
  'preserve.gate.verifyNoRestore':
    '{step} compara un arranque nuevo con la copia de seguridad, y esta ejecución no tiene ninguna restauración completada: una ranura con el parche aparecería como diferencias. Ejecuta antes la restauración (o reanuda en ella), o salta de forma explícita (allowJump) si la restauración se hizo sin su punto de control.',
  'preserve.gate.verifyNeedsBackup':
    '{step} necesita {file} (la referencia de la comparación) y no está en la carpeta de la ejecución',
  'preserve.gate.needsBanks':
    '{step} necesita las ranuras que leyó el paso de copia de seguridad, y el estado no tiene ninguna',
  /** `{what}`: why the run's choice offers no bank (preserve.choice.*). */
  'preserve.gate.noBanks': 'no hay ranuras elegidas para esta ejecución: {what}',
  /** `{why}`: the bank's refusal (preserve.refused.*, preserve.image.*). */
  'preserve.gate.bankRefused': 'no se puede escribir {bank:loc}: {why}',
  /** `{note}`: the build's route note (preserve.routeNote.*). */
  'preserve.gate.recoveryOnly':
    'el parche de esta compilación solo arranca desde la ranura de recuperación R: {note}. La ejecución escribiría {bank:loc}, desde donde el bootloader nunca lo ejecuta',
  /* ---- slots: why an image file is not staged (slots/write-image) ---- */
  'slots.image.tooSmall': 'el archivo es demasiado pequeño para contener una cabecera de imagen',
  'slots.image.notWordSized': 'el tamaño de la imagen debe ser múltiplo de 4 (tiene {size} B)',
  /** `{limit}`: a hex length. `header.length` is a header field: keep it. */
  'slots.image.tooLong':
    'la imagen ocupa {size} B; el bootloader rechaza cualquier header.length >= {limit}, así que nunca arrancaría',
  /** `{at}`, `{magic}`, `{expected}`: hex. */
  'slots.image.noHeader':
    'no hay cabecera de imagen en {at} (número mágico {magic}, se esperaba {expected}): tiene que ser una imagen de firmware de Seek descifrada, no una ranura cifrada ni un volcado de la flash',
  /** `{address}`: hex. LPC43xx is the chip's name: keep it. */
  'slots.image.stackOutside':
    'el puntero de pila inicial {address} no está en la SRAM del LPC43xx: esto no parece descifrado',
  'slots.image.stackUnaligned': 'el puntero de pila inicial {address} no está alineado a palabra',
  'slots.image.notThumb': 'el vector de reinicio {address} no es una dirección Thumb',
  'slots.image.noKeyPair':
    'el nombre de este archivo no lleva su par de claves, y ni el par de esta cámara ni un par de aplicación decodificado aparece en la imagen exactamente una vez, así que no hay forma de saber para qué claves se creó la imagen. Los archivos descifrados salen con un nombre que incluye las claves que contienen.',
  /** `{keyA}`, `{keyB}`: hex keys. `{mismatch}`: what the image holds instead, in English (it has no code). */
  'slots.image.keyMismatch':
    'el nombre del archivo indica la clave A {keyA} y la clave B {keyB}, pero {mismatch}. Las dos claves deben estar presentes, exactamente una vez cada una.',
  'slots.image.keyInHeader':
    'esta imagen guarda una clave en {at}, dentro de la ventana de cabecera sin cifrar: se rechaza aplicarle el parche',
  /** `{at}`, `{other}`: hex offsets. */
  'slots.image.keysOverlap':
    'la clave A y la clave B del nombre del archivo corresponden a bytes que se solapan en {at} y {other}: tienen que ser dos valores distintos de 16 bytes',
  'slots.image.retargetLost':
    'después de readaptarla, la imagen no lleva el par de claves de esta cámara exactamente una vez: se rechaza crear unos datos con los que el bootloader no podría cifrar las actualizaciones posteriores',
  'slots.image.noStageKey':
    'la imagen no lleva ningún par de claves de la línea de 2016, así que no hay clave de transferencia con la que codificarla',
  'slots.image.ffSumNoKeys':
    'esta imagen tiene la suma de palabras 0xFFFF de la FF de 16 Hz, pero no lleva el par de claves de 1.3.0.8-FF (las dos mitades, una vez cada una), así que no se puede crear su forma de transferencia. No se escribió nada.',
  /** ff-form.ts is a file name: keep it. */
  'slots.image.ffNotPlain':
    'esta es la imagen 1.3.0.8 FF (16 Hz), que se transfiere en su propia forma con la clave A (ff-form.ts), no como imagen sin cifrar. No se escribió nada.',
  /* ---- slots: a plan that no longer fits the analysis (slots/write assertPlanIsCurrent) ---- */
  'slots.plan.otherFirmware':
    'el plan se creó para el firmware {firmware}, pero el análisis lee {version}. El plan está desfasado; vuelve a crearlo. No se escribió nada.',
  'slots.plan.otherFirmwareUnknown':
    'el plan se creó para un firmware de versión desconocida, pero el análisis lee {version}. El plan está desfasado; vuelve a crearlo. No se escribió nada.',
  /** `{planSerial}`: a serial, or slots.plan.cameraUnknownSerial; `{serial}`: a serial, or slots.plan.unknownSerial. */
  'slots.plan.otherCamera':
    'el plan se creó para la cámara {planSerial}, pero el análisis lee {serial}. Se rechaza escribirlo aquí. No se escribió nada.',
  'slots.plan.cameraUnknownSerial': 'de número de serie desconocido',
  'slots.plan.unknownSerial': 'un número de serie desconocido',
  /** `{address}`, `{at}`: hex; `{name}`: the bank, inside the sentence ("slot A"). */
  'slots.plan.otherAddress':
    'el plan apunta a {address}, pero {name:acc} de esta compilación está en {at}',
  'slots.plan.notRead': 'el análisis ya no lee {name:acc}. No se escribió nada.',
  'slots.plan.edited':
    'la suma de comprobación del plan no coincide con sus datos, así que el plan se editó. No se escribió nada.',
  /** `{size}`: a hex byte count. */
  'slots.plan.outsideBank': 'los datos ocupan {size} B, más que {name:acc}',
  /** Only a program that uses core directly sees this: `acknowledgeRisk: true` is an option name, keep it. `{risk}`: why the bank matters. */
  'slots.plan.riskAck':
    '{risk}. Para escribirla hace falta acknowledgeRisk: true. No se envió nada.',
  /** `{reason}`: the support table's reason (support.*). */
  'slots.plan.plainStaging':
    'esta cámara no puede recibir desde aquí una imagen transferida sin cifrar: {reason}. No se escribió nada.',
  'slots.plan.noKeyTable':
    'el análisis no identifica la tabla de claves del bootloader de esta cámara, así que la imagen no se puede readaptar a ella',
  /* ---- slots: the commit and the staging transfer (slots/write-commit, protocol/commit-status) ---- */
  /** `{name}`: the bank, inside the sentence ("slot A"). CompleteMemoryUpgrade is a command name: keep it. */
  'slots.commit.unread':
    'no se pudo leer el estado de la confirmación después de CompleteMemoryUpgrade, así que {name:acc} puede estar escrita en parte. Vuelve a leer las ranuras antes de hacer nada más, y conserva tu volcado.',
  /** `{status}`: hex; `{cause}`: commit.cause.*. */
  'slots.commit.refused':
    'la cámara rechazó la escritura {name:loc} al confirmarla, con {status}: {cause}. No se escribió nada; la ranura no ha cambiado. Vuelve a leer las ranuras antes de hacer nada más.',
  'slots.commit.eraseStage':
    'CompleteMemoryUpgrade devolvió {status} ({cause}) para {name:acc}: no se programó nada, pero el borrado puede haber empezado, así que la ranura puede estar borrada en parte. Vuelve a leer las ranuras antes de hacer nada más, y conserva tu volcado.',
  'slots.commit.partial':
    'CompleteMemoryUpgrade devolvió {status} ({cause}): {name:acc} puede estar escrita en parte. Vuelve a leer las ranuras antes de hacer nada más, y conserva tu volcado.',
  /** `{status}`, `{offset}`: hex. */
  'slots.commit.stagingStatus':
    'la cámara indicó {status} al transferir los datos {name:dat}, en el desplazamiento {offset}; se interrumpió antes de CompleteMemoryUpgrade, así que no se escribió nada en la flash',
  /** What a commit status means (`{cause}` in slots.commit.*). */
  'commit.cause.badChecksum':
    'la suma de comprobación de la transferencia no coincidía con los bytes transferidos',
  'commit.cause.unsupported':
    'la imagen no se descifró con las claves de la cámara, o el tipo de datos se rechaza',
  'commit.cause.acceptance':
    'su comprobación rechazó la imagen antes de borrar nada (la comprobación depende de la compilación)',
  'commit.cause.notArmed': 'no se había abierto ninguna actualización de ranura',
  'commit.cause.eraseFailed': 'falló la etapa de borrado',
  'commit.cause.programFailed': 'falló la etapa de programación',
  'commit.cause.verifyFailed': 'falló la etapa de verificación',
  'commit.cause.unknown': 'un estado que aquí no se conoce',
  /* ---- copy and restore: why nothing was planned (slots/copy, slots/restore) ---- */
  'copy.refused.ontoItself': '{name:ins} no se copia sobre sí misma. No se escribió nada.',
  /** `{why}`: the source's refusal (copy.source.*). */
  'copy.refused.source': '{why}. No se escribió nada.',
  'copy.refused.noPlain':
    '{name:ins} no tiene ninguna imagen descifrada que copiar. No se escribió nada.',
  /** `{error}`: the ZIP reader's words, in English. */
  'restore.refused.zipUnreadable':
    '{file} es un ZIP que aquí no se puede leer ({error}). No se escribió nada.',
  /** `{preserve}`, `{dump}`, `{selectors}`, `{patched}`: file names; `{names}`: the ZIP's file names, or restore.refused.zipEmpty. */
  'restore.refused.noWholeFlash':
    '{file} no contiene una flash completa. Se acepta un ZIP cuando es un archivo de ejecución de Preserve que contiene {preserve} (una vez ejecutado su paso de volcado completo), un zip de «Volcar y descifrar 4.x/Nano» ({dump}) o un zip de «Volcar todos los selectores» ({selectors}); este ZIP contiene {names}. No se escribió nada.',
  'restore.refused.noWholeFlashPatched':
    '{file} no contiene una flash completa. Se acepta un ZIP cuando es un archivo de ejecución de Preserve que contiene {preserve} (una vez ejecutado su paso de volcado completo), un zip de «Volcar y descifrar 4.x/Nano» ({dump}) o un zip de «Volcar todos los selectores» ({selectors}); este ZIP contiene {names}. Su {patched} es la flash con el parche temporal de la ejecución, así que no se acepta. No se escribió nada.',
  'restore.refused.zipEmpty': 'nada',
  /** `{full}`, `{size}`: byte counts. */
  'restore.refused.wrongSize':
    'una copia de seguridad completa de la flash ocupa {full} B (4 MB, el chip entero que lee un J-Link); {file} ocupa {size} B. No se escribió nada.',
  'restore.refused.noBank': 'el plan de esta compilación no tiene {bank:acc}. No se escribió nada.',
  'restore.refused.outsideFlash':
    '{name:ins} no está dentro de una flash de 4 MB. No se escribió nada.',
  /** `{where}`: restore.where; `{address}`, `{fill}`: hex; `{gap}`: why the dump has a gap there, in English (as the dump's manifest says it). manifest.json is a file name. */
  'restore.refused.gap':
    'el volcado del que procede {file} no leyó {where}: según su manifest.json, {address} es un hueco. No hay ninguna imagen que restaurar. No se escribió nada.',
  'restore.refused.gapReason':
    'el volcado del que procede {file} no leyó {where}: según su manifest.json, {address} es un hueco ({gap}). No hay ninguna imagen que restaurar. No se escribió nada.',
  'restore.refused.gapFill':
    'el volcado del que procede {file} no leyó {where}: según su manifest.json, {address} es un hueco, rellenado con {fill}. No hay ninguna imagen que restaurar. No se escribió nada.',
  'restore.refused.gapReasonFill':
    'el volcado del que procede {file} no leyó {where}: según su manifest.json, {address} es un hueco ({gap}), rellenado con {fill}. No hay ninguna imagen que restaurar. No se escribió nada.',
  'restore.refused.empty':
    '{where} está vacía: todos los bytes son 0xFF. Una escritura programa una imagen y no puede dejar una ranura borrada, así que una ranura vacía no se puede restaurar con una escritura. No se escribió nada.',
  'restore.refused.fill':
    '{where} contiene {fill} en todos los bytes, el relleno que escribe el volcado donde no leyó nada: el volcado no leyó esta ranura. No hay ninguna imagen que restaurar. No se escribió nada.',
  /** `{why}`: the bank file's decryption notes (decrypt.*), joined with common:list.semicolon, or its status word. */
  'restore.refused.notDecrypted':
    '{where} no se puede restaurar desde este archivo: {why}. No se escribió nada.',
  /* ---- support: why a build cannot read or write a bank (slots/capability, profiles) ---- */
  /** A reason the build's support table gives (`{reason}` in slots.refused.*, backup.bank.unsupported, fps.plan.noPlain). `--family` is a CLI option: keep it. */
  'support.noWriteArm': 'esta compilación no tiene apertura de escritura para la ranura',
  'support.noStagingEmpty':
    'esta compilación no tiene forma de transferencia, así que no se escribe en una ranura vacía',
  'support.buildUnknown': 'la compilación es desconocida',
  'support.unverifiedStaging':
    'esta compilación pertenece a la línea bloqueada 0.x/1.x, pero no es una de las compilaciones con las que se midieron las tablas de parches de preservación (0.8.0.0 .. 1.3.0.8 y 1.0.3.0 / 1.0.3.2), así que no se conoce la forma de transferencia de sus ranuras y no se escribe nada',
  'support.unknownFamily':
    'no se conoce la familia de la cámara, así que tampoco la clave con la que se escriben sus ranuras, y una cámara acepta una ranura escrita con la clave equivocada y luego no arranca desde ella. Vuelca y descifra esta cámara, identifícala a partir del volcado y luego indica su familia con --family.',
  'support.noReadCommand':
    'el firmware anterior a 0.8.0.0 no tiene manejador de lectura para GetFeaturedFirmwareData, el comando con el que un volcado lee la flash. En 0.7.0.7 y 0.7.0.8 está en la tabla de métodos RPC en 0x4F, pero registrado solo como escritura (manejador de escritura), así que la lectura control-IN que envía un volcado no se puede atender (la ejecución de preservación lee esas dos compilaciones mediante el wire id 0x58, GetFeaturedData); antes de 0.7.0.7 el wire id 0x4F es UploadFirmwareRowSize, y en 0.3.0.1 el wire id 0x52 (con el que abre un volcado) es EnterBootloaderMode en lugar de BeginFirmwareUpgrade: la cámara sigue en su aplicación, pero cada apertura fija un destino en la flash y prepara la etapa de actualización de firmware de esa compilación (GetErrorCode lee entonces 0x00400000), que no es una ventana de lectura. Obtenido de las propias tablas de métodos de las imágenes, las dos columnas de manejadores; consulta test/firmware/facts.json.',
  'support.noWritePath':
    'estas compilaciones reciben el firmware nuevo con una secuencia de actualización más antigua que esta herramienta no envía, y sus ranuras nunca se mapearon, así que no se escribe nada.',
  /* The build's own refusals (slots/capability-family `classifyBuild`): `{version}` is the firmware version,
   * `{first}` the first version a slot is read on, `{family}` a family id (modern-4x, legacy-auth, …), which
   * stays as it is like the other family ids in these sentences. */
  'support.versionUnread':
    'no se pudo leer la versión de firmware, así que no se conocen la compilación, sus ranuras ni su forma de transferencia; en ella no se lee ni se escribe nada',
  'support.versionNotDotted':
    'la versión de firmware «{version}» no es una versión con puntos, así que no se conocen la compilación, sus ranuras ni su forma de transferencia; en ella no se lee ni se escribe nada',
  'support.olderThanFirst':
    'el firmware {version} es anterior a {first}: su tabla RPC no tiene manejador de lectura para GetFeaturedFirmwareData, el comando que envía una lectura de ranura, así que no se le envía ni lectura ni escritura (early-compact tiene los indicios)',
  'support.modernOnLocked':
    'la familia modern-4x cubre 2.x, 4.x, 10.x, 42.x y 44.x; {version} pertenece a la línea bloqueada 0.x / 1.x, que necesita legacy-auth o compact-2016',
  'support.lockedOnModern':
    'la familia legacy-auth cubre la línea bloqueada 0.x / 1.x; {version} pertenece a la línea moderna, que necesita modern-4x',
  'support.notCompactPro':
    'la familia compact-2016 cubre la línea 1.0.3.x de la Compact PRO; {version} no pertenece a ella',
  'support.earlyCompact':
    'la familia early-compact solo cubre las compilaciones anteriores a {first}, y {version} se lee con legacy-auth',
  'support.generic':
    'la familia de la cámara no está identificada (familia generic), así que no se conocen la disposición de las ranuras ni la forma de transferencia; identifica la cámara antes de leer o escribir una ranura',
  'support.noPlan':
    'no existe ningún plan de ranuras para la familia {family}: no se conocen la disposición de sus ranuras ni su forma de transferencia',
  /* A bank's own refusals (slots/capability): `{mode}` is a mode number, `{address}` and `{at}` hex addresses. */
  'support.noArmPlain':
    'la tabla de esta compilación no abre el modo {mode} en {address} por el canal simple',
  'support.noArmToken':
    'la tabla de esta compilación no abre el modo {mode} en {address} por el canal con token',
  'support.windowElsewhere': 'la ventana de preservación {bank:gen} está en {at}, no en {address}',
  'support.noDumpWindow':
    'la tabla BeginFirmwareUpgrade de esta compilación no tiene ninguna ventana en {address} para {bank:acc}',
  /* A family that refuses an operation (profiles/registry `requireCapability`): `{family}` is the family's
   * name, `{capability}` one of support.capability.*, `{reason}` a support.* reason. */
  'support.capabilityRefused': '{family} no admite {capability}: {reason}',
  'support.capability.dump': 'el volcado',
  /** The 4.x/Nano tab's button of that name. */
  'support.capability.allSelectors': '«Volcar todos los selectores»',
  'support.capability.decrypt': 'el descifrado',
  'support.capability.deviceInfo': 'la lectura completa de la pestaña «Información»',
  'support.capability.flash': 'la escritura de ranuras',
  /* ---- slots: why a bank was not read, and a write's refusals (slots/inspect, slots/write) ---- */
  /** `{name}` is the bank's name ("Slot A", in your words) or the build's own name for it; `{address}` a hex address. */
  'slots.unread.noWindow':
    '{name:ins} en {address} no se puede leer en esta compilación: su tabla de selectores no tiene ahí ninguna ventana, así que no se abrió nada para ella',
  'slots.unread.missing': '{name:ins} falta en el análisis de la cámara',
  'slots.unread.notRead': '{name:ins} no se leyó',
  /** `{refusal}` is the camera-wide refusal (keys.refusal.* / writeRefusal.*), already a sentence. */
  'slots.refused.nothingWritten': '{refusal}. No se escribió nada.',
  'slots.refused.versionUnknown':
    'el análisis no dice qué firmware ejecuta la cámara, y los comandos de ranura significan cosas distintas en compilaciones distintas. Vuelve a leer la información del dispositivo.',
  'slots.refused.versionUnknownWrite':
    'el análisis no dice qué firmware ejecuta la cámara. No se escribió nada.',
  'slots.refused.emptyInput': 'la entrada está vacía',
  /** `{reason}` is a support.* reason (or core's English for one built from the build's facts). */
  'slots.refused.emptyNotWritable':
    '{name:ins} está vacía y no se puede escribir en esta compilación: {reason}',
  'slots.refused.noRaw':
    '{name:ins} no puede recibir bytes sin procesar en esta compilación: {reason}',
  'slots.refused.noPlain':
    '{name:ins} no puede recibir una imagen descifrada en esta compilación: {reason}',
  'slots.refused.noStaging':
    '{name:ins} no tiene forma de transferencia en esta compilación, así que no se puede codificar una imagen para ella',
  /** `{size}` is a byte count, `{bankSize}` the bank's size in hex. */
  'slots.refused.rawTooLong': '{size} B es más que {name:acc} ({bankSize} B)',
  'slots.refused.imageTooLong': 'la imagen ocupa {size} B, más que {name:acc} ({bankSize} B)',
  /* ---- the Preserve tab: a build that runs from recovery R only (preservation/patch, steps) ---- */
  'preserve.routeNote.recoveryOnly':
    'el bootloader de 2014 no acepta la suma de comprobación de esta compilación en la ranura A ni en la B, y arranca la ranura de recuperación R (0x14070000) sin comprobarla, así que el parche se escribe en la ranura de recuperación R y en ningún otro sitio',
  /** `{note}` is preserve.routeNote.*. */
  'preserve.refused.recoveryOnly':
    'esta compilación solo arranca desde la ranura de recuperación R: {note}',
  /* ---- the Decrypt tab: one bank file (slots/decrypt-file) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes); `{kib}` is the bank's size in KiB, a number (64): write the unit your language's way (KB). */
  'decryptFile.wrongSize':
    'una ranura de firmware ocupa {size} B ({kib} KB); este archivo ocupa {count} B',
  'decryptFile.erasedBank':
    'vacía, no hay nada que descifrar: los {size} B se leen como 0xFF (una ranura borrada)',
  'decryptFile.erasedHeader':
    'borrada: la ventana de cabecera es toda 0xFF, así que la ranura no contiene ninguna imagen; no se descifra nada',
  'decryptFile.noHeader':
    'no hay cabecera de imagen (número mágico {magic}), así que no hay imagen que descifrar',
  'decryptFile.lengthOutOfRange':
    'header.length {length} está fuera de rango; no hay imagen que descifrar',
  'decryptFile.ffKeyB':
    'descifrados {size} B con la clave B de FF 1.3.0.8: la imagen se almacena como la imagen XOR el flujo de clave de su bloque de claves 1, con la ventana de cabecera literal',
  /** `{check}` is how sure the key is (keys.confidence.*). */
  'decryptFile.notRecovered':
    'clave no recuperada: la imagen se descifra con un vector de reinicio que no es una entrada de Cortex-M (clave {check}); no se descifra nada',
  'decryptFile.storedPlain':
    'almacenada sin cifrar: la ranura contiene la imagen tal como se ejecuta (la cadena sin cifrar de 2014, un flujo de clave identidad), así que no hay clave y la imagen descifrada es la propia imagen',
  /** `{check}` is the key's check (keys.check.*); `{key}` a key name. */
  'decryptFile.decrypted': 'descifrados {size} B con la clave recuperada de esta ranura ({check})',
  'decryptFile.decryptedNamed':
    'descifrados {size} B con la clave recuperada de esta ranura ({check}; es {key:acc})',
  /* ---- the read: why a bank holds no image or was not read (workflows/device-info) ---- */
  /** `{size}` and `{count}` are byte counts ("B" is bytes). */
  'read.reason.shortRead': 'lectura corta ({size} B)',
  'read.reason.noParse': 'no se pudo interpretar una cabecera de imagen',
  /** `{magic}` is the word the header has where an image's magic would be. */
  'read.reason.noHeader': 'no hay cabecera de imagen (número mágico {magic})',
  /** `header.length` is the header's field name. */
  'read.reason.lengthOutOfRange': 'header.length {length} está fuera de rango',
  'read.reason.stopped': 'la lectura de la ranura se detuvo en {count}/{size} B',
  /** `{table}` is the name of the build's selector table; `{address}` a hex address. */
  'read.reason.notInPlan':
    'no se puede leer en el firmware {version}: su plan ({table}) no tiene ninguna ventana en {address}, así que no se abrió nada para ella',
  'read.reason.notInPlanUnknown':
    'no se puede leer en un firmware de versión desconocida: su plan ({table}) no tiene ninguna ventana en {address}, así que no se abrió nada para ella',
  /** `{remedy}` is read.spentRemedy. `{word}` and `{hex}` are hex words. */
  'read.reason.staleDescriptor':
    'la ventana entregó los bytes de un descriptor de lector caducado (la palabra 0 {word} con reinicio {hex} es la tabla de vectores de 0x14000000, no el contenido de esta ranura), así que no se analizó nada de ella: {remedy}',
  'read.reason.spentReader': 'no se pudieron leer las ranuras de la cámara: {remedy}',
  'read.spentRemedy':
    'puede que el lector de ventanas se haya agotado en este arranque; apaga la cámara, vuelve a encenderla y vuelve a intentarlo',
  /* ---- the read: why the check key was not named (workflows/device-info `checkKeyOf`) ---- */
  'checkKey.unnamed.wordNotRead':
    'no se pudo leer la palabra de ranura activa de la cámara (fw info roots, selector 10)',
  /** `{word}` is the active-slot word, a number. */
  'checkKey.unnamed.wordNamesNoBank':
    'la palabra de ranura activa de la cámara es {word}, que no nombra ninguna ranura',
  'checkKey.unnamed.cfg0NotRead':
    'no se leyó la palabra de configuración de arranque, así que no se sabe si el bootloader comprobó {bank:acc} antes de entrar en ella',
  'checkKey.unnamed.noZeroSum':
    'la cámara indica que entró {bank:loc}, pero {bank:acc} no se descifra con una suma de palabras cero en esta lectura',
  /** `{word}` is the boot-config word in hex. */
  'checkKey.unnamed.noZeroSumUnchecked':
    'la cámara indica que entró {bank:loc}, que la palabra de configuración de arranque {word} deja para el final, así que el bootloader entró en ella sin su comprobación, pero {bank:acc} no se descifra con una suma de palabras cero en esta lectura',
  /* ---- the Info tab's camera report (workflows/device-report) ---- */
  /** The detected row; `{score}` is a number like 0.98. */
  'report.detected': '{family} (puntuación {score} tras la lectura, según los indicios de abajo)',
  'report.detectedAmbiguous':
    '{family} (puntuación {score} tras la lectura, según los indicios de abajo; ambiguo)',
  /** The accepts and bootable cells of the banks table. */
  'report.cell.yes': 'sí',
  'report.cell.no': 'no',
  'report.cell.notApplicable': 'n/d',
  'report.cell.unknown': 'desconocido',
  'report.cell.recoveryOnly': 'solo recuperación',
  /** The key rows' labels; the page capitalises the first letter. "K" is the whitening constant's name. */
  'report.keyRow.whitening': 'K de blanqueo',
  'report.keyRow.store': 'clave de almacenamiento',
  'report.keyRow.check': 'clave de comprobación',
  'report.keyRow.table': 'tabla de claves',
  'report.keyRow.keys': 'claves',
  'report.keyRow.a': 'clave A',
  'report.keyRow.b': 'clave B',
  'report.keyRow.tableAt': 'tabla en',
  'report.key.notIdentified': '(sin identificar)',
  /** `{count}` is a number of candidate key tables. */
  'report.key.candidates': {
    one: '{count} candidata, ninguna confirmada',
    many: '{count} de candidatas, ninguna confirmada',
    other: '{count} candidatas, ninguna confirmada',
  },
  'report.key.tableAt': '{offset} en el bloque del bootloader, confirmada con una ranura',
  'report.key.plainChain':
    'no hace falta ninguna: las ranuras se almacenan como firmware sin cifrar, así que una ranura se lee y se escribe tal cual',
  'report.key.tableRefused2016':
    'no se leyó: el bloque del bootloader (0x14000000) se rechaza en todos los canales en esta línea de firmware',
  /** `{key}` is a key name; `{hex}` the key's bytes; `{pair}` is report.checkKey.pair or empty. */
  'report.checkKey.named': '{key} {hex}{pair}',
  'report.checkKey.namedFrom':
    '{key} {hex}{pair}, identificada a partir {bank:gen}, la ranura en la que la cámara indica que entró tras la comprobación del bootloader',
  'report.checkKey.inferredFrom':
    '{key} {hex}{pair}, deducida {bank:gen}, la ranura en la que la cámara indica que entró: el bootloader entra en esa ranura sin su comprobación, y la ejecuta con la clave con la que comprueba las demás ranuras',
  /** Starts with a space; `{pair}` is keyPair.* (already translated): "the Compact PRO 1.0.3.x 9 Hz pair's block 1". */
  'report.checkKey.pair': ' (bloque 1 de {pair})',
  /** A 2016 image pair: the two key blocks one build's images carry. Keep the product name and version. */
  'keyPair.cp103': 'el par de 9 Hz de la Compact PRO 1.0.3.x',
  'keyPair.cp1032ff': 'el par FF de la Compact PRO 1.0.3.x',
  /** `{why}` is a checkKey.unnamed.* reason or report.checkKey.couldNotName. */
  'report.checkKey.notNamed': 'sin identificar: {why}',
  'report.checkKey.couldNotName': 'la lectura no pudo identificarla',
  'report.storeKey.checkKeyUnnamed':
    'la clave con la que su bootloader comprueba una ranura (no identificada en esta lectura): la aplicación almacena con esa clave cada ranura que escribe',
  'report.storeKey.checkKey':
    '{key}: la aplicación almacena cada ranura que escribe con la clave que comprueba su bootloader',
  'report.storeKey.unknown':
    'desconocida: no se leyó el bloque del bootloader que contiene la posición de la clave propia del dispositivo',
  'report.storeKey.keyBUnidentified':
    'clave B (no hay clave propia del dispositivo programada; la propia clave B no está identificada)',
  'report.storeKey.keyB': 'clave B (no hay clave propia del dispositivo programada)',
  /** How each bank is staged: said after "each bank" (the CLI's report; the page says info:report.oneBank.*). */
  'report.staged.plain': 'transferida sin cifrar (la imagen tal cual, sin clave)',
  'report.staged.slotKeystream': 'transferida con el bloque de claves 0 propio de su imagen',
  'report.staged.keyA':
    'transferida con claves derivadas de la ranura de arranque y de la aplicación en ejecución',
  'report.staged.ffVendor':
    'transferida como la app del fabricante transfiere la imagen FF de 16 Hz (la imagen XOR su propio bloque de claves 0), y almacenada por la cámara con la clave B',

  /*
   * Status lines: the line under a run panel's progress bar while a run works
   * (core's PROGRESS_WORDS). `{address}` and `{selector}` are hex, `{subcmd}` a
   * hex selector number ("subcmd" is the wire field's name: keep it), the
   * numbers are counts or bytes. `{label}` in progress.staged is
   * progress.writingBank or progress.restoringBank, already translated. The
   * trailing " ..." means "still working".
   */
  'progress.backupBlock': 'Copia de seguridad: bloque {address}',
  'progress.backupDone': 'Copia de seguridad: todos los bloques leídos',
  'progress.checkBlock': 'Comprobación: bloque {address}',
  'progress.checkDone': 'Comprobación: todos los bloques leídos',
  'progress.writingBank': 'Escribiendo {bank:loc}',
  'progress.restoringBank': 'Restaurando {bank:acc}',
  'progress.staged': '{label}: transferidos {done}/{total} B',
  'progress.wholeFlash': 'Lectura completa: {got}/{total} B',
  /** The 4.x dump, one 64 KiB window at a time. "(auth)": the window needed the unlock token. */
  'progress.readWindow': 'lectura {address} subcmd={subcmd}...',
  'progress.readWindowAuth': 'lectura {address} subcmd={subcmd} (auth)...',
  'progress.windowsRead': 'Hecho: {ok}/{total} ventanas leídas.',
  'progress.readingBank': 'Leyendo {bank:acc}...',
  'progress.analysing': 'Analizando...',
  'progress.probeSelector': 'probando el selector {selector}...',
  'progress.selectorsArmed': 'Hecho: {armed}/{span} selectores abiertos, {withData} con datos.',
  'progress.recoveringKey': 'descifrado: recuperando la clave de {address}...',

  /*
   * Slot read and write failures (core's SLOT_ERROR_WORDS). `{bank}` is a bank
   * label ("Slot A"), `{address}` and `{subcmd}` are hex (keep "subcmd", the
   * wire field's name), `{error}` is the error met (a USB or browser error
   * stays English), `{reason}` a plan refusal (support.*), `{file}` a file name.
   */
  'slots.window.unread': '{bank:ins} {address} (subcmd {subcmd}) no se pudo leer: {error}',
  'slots.read.refusedBuild':
    'se rechaza leer las ranuras de firmware: {reason}. No se envió nada más que la lectura de la versión, así que no se tocó ninguna ranura.',
  'slots.backup.notSaved':
    'la copia de seguridad {file} no se guardó, así que no se escribió nada. Una escritura nunca se ejecuta sin guardar antes su copia de seguridad; vuelve a intentarlo cuando se pueda guardar.',
  'slots.backup.notSavedWhy':
    'la copia de seguridad {file} no se guardó ({error}), así que no se escribió nada. Una escritura nunca se ejecuta sin guardar antes su copia de seguridad; vuelve a intentarlo cuando se pueda guardar.',

  /** The USB link the camera reports (Info: "USB link"). Keep "Mbit/s"; `{code}` is a number the camera gave. */
  'usb.speed.high': 'alta (480 Mbit/s)',
  'usb.speed.full': 'completa (12 Mbit/s)',
  'usb.speed.code': 'código {code}',
} satisfies Translation<'core', 'es'>;
