/**
 * Namespace `preserve`, español (es), translated from the English source: the "Dump & decrypt 0.x/1.x" tab, a guided run that
 * backs up the camera, writes a temporary patch so the whole flash can be read, then puts the original
 * firmware back and checks it.
 *
 * Owner: phase 2, preserve agent.
 * Covers: views/PreserveView.tsx, hooks/usePreservePanel.ts, lib/preserve/* (gating.ts, types.ts).
 *
 * Words used all over this tab:
 * - run = one pass of the wizard on one camera, from the backup to the check. Run file = the zip the
 *   browser downloads after every step; it is the run's only record and lets a run continue later.
 * - Step 01 is Connect (shared with the other tabs); the phases are steps 02, 03 and 04. "Step 02"…
 *   keep the two-digit numbers.
 * - bank = one of the camera's three firmware slots, A, B and R (R = recovery). {bank}, {a}, {b}, {r}
 *   and {banks} are names from common:bank.*: "Slot A" / "Recovery R" on their own, "slot A" /
 *   "recovery R" inside a sentence. {banks} is a list of those names ("slot A, slot B and recovery R").
 * - the write = the patch written into the chosen banks (step 03); the restore = the original firmware
 *   written back (step 04); the whole-flash read = reading the full 4 MiB flash once the patch runs.
 * - "Connect device" is the page's connect button (app:connect.connect): use the same words.
 * - The step names on the chips (Backup, Patch, Write, Whole-flash read, Restore, Check) are core's
 *   words, translated in core:preserve.step.*. The sentences core writes ({why}, {reason}, {what},
 *   {build}…) arrive already translated, from the `core` namespace.
 * - SPI, SWD/J-Link, MiB/KiB, sha256, hex values and file names stay as they are.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* ---- "What to expect", the first section ---- */
  'how.title': 'Qué esperar',
  'how.descriptionIdle': 'Conecta la cámara y empieza por el paso 02.',
  /* {runId} is the run's id (a time stamp), {version} the camera's firmware version. */
  'how.descriptionRun': 'Ejecución {runId}.',
  'how.descriptionRunVersion': 'Ejecución {runId}: firmware {version}.',
  'how.restarts':
    'La cámara **se reinicia** durante cada paso. Tras un reinicio, Chrome ya no la reconoce (no tiene número de serie USB), así que la página te pide que pulses **Conectar dispositivo** y vuelvas a elegir la cámara. Es el funcionamiento normal: el paso continúa solo en cuanto lo haces.',
  'how.noFile': 'No hay que elegir ningún archivo de firmware: todo se lee de la propia cámara.',
  /* {a}, {b}, {r}: the three banks inside a sentence ("slot A, slot B and recovery R"). */
  'how.banks':
    'La cámara guarda su firmware en tres **ranuras** ({a}, {b} y {r}). El paso 02 lee las tres y averigua desde cuál arrancará la cámara la próxima vez; el parche solo funciona si esa ranura lo contiene. Tú eliges las ranuras a las que el paso 03 aplica el parche (por defecto, la del próximo arranque), y el paso 04 las vuelve a poner todas como estaban.',
  /* {example} is the run file's name pattern; keep it as it is. */
  'how.runFile':
    'Después de cada paso, tu navegador descarga un **archivo de ejecución** con un nombre que lleva el inicio de la ejecución, la hora de guardado y el paso al que llegó (`{example}`), con una carpeta por paso dentro. Guarda el más reciente: te permite continuar más tarde.',
  /* The amber warning under the list. */
  'how.writeWarning':
    '**Los pasos 03 y 04 escriben en la flash de la cámara**, y cada uno te pide confirmación antes. Mientras se ejecuta uno de ellos, mantén la cámara conectada (salvo que la página te pida desconectarla y volver a conectarla) y el equipo despierto, mejor enchufado a la corriente. Una escritura interrumpida deja una cámara que solo un programador de hardware (SPI o SWD/J-Link) puede arreglar.',
  'how.phone':
    '**En un teléfono:** antes del paso 03, activa el modo avión y desactiva el wifi y los datos móviles, para que una llamada o una notificación no aparte al navegador a mitad de una escritura, y mantén la pantalla encendida. Una vez abierta, la página sigue funcionando sin conexión.',
  /*
   * The red box when a write attempt is on record as failed. "already holds the patched bytes" quotes
   * core's refusal in the run log, which stays English: keep the quoted words in English.
   */
  'how.pastCommit':
    '**La escritura no consta en el registro de esta ejecución, así que los pasos que la siguen están bloqueados.** Puede que la cámara ya esté ejecutando la imagen con el parche (una escritura interrumpida) o puede que no (la escritura nunca empezó): el archivo de ejecución no puede demostrar cuál de las dos. No ejecutes la lectura completa ni la restauración en una cámara con el parche sin que la escritura conste en el registro; el camino a seguir es el paso 03, cuya comprobación previa a la escritura lee la ranura y se niega a volver a escribirla a ciegas. Solo si esa comprobación ya se ha negado con *already holds the patched bytes* se aplica el salto, y pasa por su propio diálogo.',

  /* ---- the three phases (steps 02–04): name, name inside a sentence, description ---- */
  'phase.readBuild.label': 'Lectura y preparación',
  'phase.readBuild.inSentence': 'la lectura y preparación',
  'phase.readBuild.description':
    'Lee todo lo que deja leer una cámara de serie (31 bloques de 64 KB) y lo guarda como tu copia de seguridad, lee cada ranura de firmware una segunda vez, averigua desde qué ranura arrancará la cámara la próxima vez y prepara el pequeño parche que escribe el paso siguiente. No se escribe nada en la cámara. Normalmente tarda menos de un minuto. Si la cámara necesita reiniciarse por el camino, la página te pide que pulses «Conectar dispositivo» y vuelvas a elegirla: es lo esperado.',
  'phase.patchDump.label': 'Escritura y lectura completa',
  'phase.patchDump.inSentence': 'la escritura y lectura completa',
  'phase.patchDump.description':
    'Escribe un parche pequeño y temporal en las ranuras de firmware elegidas en el paso 02 (por defecto, la ranura desde la que arrancará la cámara la próxima vez), para que pueda leer toda su flash. Luego la cámara se reinicia (pulsa «Conectar dispositivo» y vuelve a elegirla cuando la página lo pida) y se lee toda la flash de 4 MB. El paso 04 vuelve a poner el firmware original.',
  'phase.restoreVerify.label': 'Restauración y verificación',
  'phase.restoreVerify.inSentence': 'la restauración y verificación',
  'phase.restoreVerify.description':
    'Vuelve a escribir tu firmware original, reinicia la cámara (pulsa «Conectar dispositivo» y vuelve a elegirla cuando se te pida) y luego lo vuelve a leer todo para comprobar que coincide byte a byte con la copia de seguridad.',

  /* What each step does, under "What this step does, in detail". The step's name before it is core's. */
  'step.backup.description':
    'Lee los 31 bloques de 64 KB que puede leer una cámara de serie, luego lee cada ranura una segunda vez (las dos lecturas deben coincidir byte a byte), extrae el firmware de cada ranura a partir de lo que almacena la cámara (descifrado donde está cifrado) y lo comprueba, y averigua desde qué ranura arrancará la cámara la próxima vez. Esta es la única copia de esta cámara que tiene la ejecución, hecha antes de escribir nada.',
  'step.patch.description':
    'Sin conexión, sin cámara. Prepara el parche para cada ranura que puede escribir la ejecución: permite que la lectura de la cámara llegue a toda la flash de 4 MB, y se escribe en la forma en que la cámara lo almacena, así que solo cambian los bytes del propio parche.',
  'step.commit.description':
    'La escritura. Primero vuelve a leer cada ranura elegida y no escribe nada salvo que cada una siga conteniendo lo que registró la copia de seguridad (una escritura que ya se completó nunca se repite); luego escribe cada una, dejando para el final la ranura que la cámara prueba primero. Aquí no se reinicia la cámara: la reinicia el paso siguiente.',
  'step.drain.description':
    'Reinicia la cámara para que arranque el firmware con el parche (queda en silencio unos diez segundos; la página espera y la vuelve a encontrar), comprueba desde qué ranura arrancó (una ranura sin el parche detiene el paso antes de leer nada), luego lee toda la flash de 4 MB en una sola lectura y pone en la imagen guardada el firmware original de cada ranura escrita, sacado de la copia de seguridad. No se escribe nada.',
  'step.restore.description':
    'La otra escritura. Vuelve a escribir el firmware original de cada ranura escrita mientras sigue funcionando el firmware con el parche, y luego reinicia la cámara.',
  'step.verify.description':
    'Después de un arranque nuevo, vuelve a leer los 31 bloques, con todas las ranuras entre ellos: 0 bytes distintos demuestra que la flash de la cámara es idéntica byte a byte a la copia de seguridad. Solo lectura.',

  /* ---- one phase's section ---- */
  /* The start button. {phase} is phase.*.inSentence. */
  'phase.start': 'Iniciar {phase}',
  'phase.retry': 'Reintentar {phase}',
  /* The start button once the whole-flash read stopped as planned: the restore comes next. */
  'phase.goRestore': 'Seguir con el paso 04: restaurar las ranuras',
  /* The start button when only the jump past a write that is not on record can run. */
  'phase.jumpOnly': 'Saltar la escritura no registrada',
  'phase.skipWrite': 'Saltar la escritura: empezar por la lectura completa',
  /* The button group's accessible name; {phase} is phase.*.label. */
  'phase.toolbar': '{phase}: acciones',
  /* The badges beside the step's title. */
  'badge.writes': 'escribe en la cámara',
  'badge.running': 'En curso',
  'badge.done': 'Hecho',
  'badge.plannedStop': 'Detenido según lo previsto: ahora toca la restauración',
  'badge.failed': 'Detenido: consulta el registro',
  /** A badge on the step that runs next. */
  'badge.upNext': 'Siguiente',
  /* Why the start button is off. */
  'notReady.noRun': 'Disponible después del paso 02, que inicia la ejecución.',
  /* {step} is the earlier step's number ("02"), {phase} its name (phase.*.label). */
  'notReady.previous': 'Disponible después del paso {step} ({phase}).',
  /* {reason} is gate.needs. */
  'notReady.gate': 'Aún no está listo: {reason}.',
  /* {section} is how.title. */
  'phase.pastCommit':
    'Afecta a la cámara con el parche mientras la escritura no conste en el registro: puede que la cámara ya tenga el parche. Consulta la nota de «{section}».',
  'phase.noDrain':
    'La lectura completa no se ha ejecutado: este paso deja la cámara como estaba sin ella. Ejecuta antes el paso 03, salvo que la lectura completa no te importe.',
  'phase.keepPlugged':
    'Mantén la cámara conectada y el equipo despierto hasta que termine este paso.',
  /* The list of the step's parts, with a tick on each one done (its accessible name). */
  'phase.stepsLabel': 'Progreso',
  'phase.showDetails': 'Mostrar detalles en el registro',
  'phase.inDetail': 'Qué hace este paso, en detalle',

  /* ---- "your turn": the hand-offs a run expects, in a calm blue box ---- */
  'yourTurn.toolbar': 'Te toca',
  'yourTurn.reconnect.title': 'Te toca: pulsa «Conectar dispositivo» y elige la cámara.',
  'yourTurn.reconnect.body':
    'La cámara se ha reiniciado, como estaba previsto. Chrome no puede volver a reconocerla por sí solo (no tiene número de serie USB), así que necesita que la elijas otra vez. El paso continúa en cuanto lo hagas.',
  'yourTurn.replug.title':
    'Te toca: desconecta la cámara, vuelve a conectarla y luego pulsa «Conectar dispositivo».',
  /* The reader fix = a later form of the patch that leaves the camera readable after the whole-flash read. */
  'yourTurn.replug.body':
    'El parche de esta ejecución se hizo antes de la corrección del lector, así que la cámara necesita un encendido nuevo antes de la restauración. El archivo de ejecución ya está guardado.',
  'yourTurn.replugBeforeRestore.title':
    'Antes del paso 04: desconecta la cámara, vuelve a conectarla y luego pulsa «Conectar dispositivo».',
  'yourTurn.powerCycle.title':
    'Te toca: desconecta la cámara, vuelve a conectarla, pulsa «Conectar dispositivo» y luego vuelve a intentarlo.',
  'yourTurn.powerCycle.body':
    'El lector de la cámara necesita un encendido nuevo antes de poder volver a leerla. La ejecución sigue cargada aquí; no se pierde nada.',
  'yourTurn.powerCycleAssert.title':
    'Te toca: desconecta la cámara, vuelve a conectarla, pulsa «Conectar dispositivo» y luego continúa.',
  'yourTurn.powerCycleAssert.body':
    'El último intento de copia de seguridad se detuvo, y la cámara necesita un encendido nuevo antes de volver a ejecutarlo. La cámara no puede indicarlo por sí misma, así que el botón de abajo le dice a la página que lo has hecho.',
  /* {phase} is phase.*.inSentence. */
  'yourTurn.replugged': 'Ya la he vuelto a conectar: continuar con {phase}',

  /* ---- step 02's panel: the banks and the choice of the ones step 03 patches ---- */
  'banks.title': 'A qué ranuras aplica el parche el paso 03',
  /* The rows above the table; their values are core's. */
  'banks.bootWord': 'Palabra de configuración de arranque',
  'banks.lastStart': 'Último arranque',
  'banks.nextStart': 'Próximo arranque',
  'banks.caption': 'Las tres ranuras de firmware, tal como las leyó el paso 02',
  'banks.col.bank': 'Ranura',
  'banks.col.address': 'Dirección',
  'banks.col.holds': 'Qué contiene',
  /* A badge on the bank the camera's next start enters. */
  'banks.nextStartBadge': 'próximo arranque',
  'banks.choiceLabel': 'Ranuras a las que aplicar el parche',
  /* The menu's choices, as names on their own (a bank choice is bankName: "Slot A"). */
  'choice.nextStart': 'La ranura del próximo arranque',
  'choice.all': 'Todas las ranuras',
  /* A menu entry: {choice} and the banks it writes, or that it is not offered. */
  'choice.withBanks': '{choice} — {banks}',
  'choice.notOffered': '{choice} — no disponible',
  /* Under the menu. {what} is core's sentence for the choice. */
  'banks.notChosen':
    'Aún no se ha elegido ninguna ranura: {what}. Elige una ranura por su nombre arriba.',
  'banks.writes': 'El paso 03 escribe {what}.',
  'banks.fixed':
    'La escritura ya se ha ejecutado, así que la elección es fija: el paso 04 vuelve a poner exactamente estas ranuras.',
  /* A choice that is not offered, and core's reason. */
  'banks.notOfferedLine': '{choice}: no disponible — {why}.',
  /* chooseBanks' refusals, shown under the menu. */
  'banks.refusedNoRun': 'no hay ninguna ejecución activa: el paso 02 inicia una',
  'banks.refusedBusy': 'hay un paso en curso: elige las ranuras cuando haya terminado',

  /* ---- the plan, a fold-out under step 02 ---- */
  /* {build} is the build's name (core's), or plan.yourCamera. */
  'plan.summary': 'El plan — {build}, aplica el parche {banks:dat}',
  'plan.summaryNone': 'El plan — {build}, aún no se ha elegido ninguna ranura',
  'plan.yourCamera': 'tu cámara',
  'plan.intro':
    'Sacado de los propios bytes de la cámara. No se escribe nada hasta que se ejecuta el paso 03, y el paso 04 vuelve a poner cada byte que escribe.',
  /* The rows; their values are core's. */
  'plan.build': 'Compilación',
  'plan.version': 'Versión de firmware',
  'plan.written': 'Escrito',
  'plan.route': 'Dónde va',
  'plan.restore': 'Restauración',
  'plan.wholeFlash': 'Lectura completa',
  'plan.outro':
    'En la forma en que almacena la cámara, cambian los mismos bytes y ningún otro, así que el firmware de la cámara cambia exactamente en esta diferencia y en nada más.',
  /* One bank's patch: its region's accessible name and heading. */
  'bankPlan.label': 'El parche {bank:gen}',
  'bankPlan.titleChosen': '{bank} — la escribe esta ejecución',
  'bankPlan.titleNotChosen': '{bank} — no elegida',
  'bankPlan.source': 'Origen de la imagen',
  'bankPlan.sourceValue': '{bank}, tal como está almacenada',
  'bankPlan.sourceTwoReads':
    '{bank}, tal como está almacenada, dos lecturas coincidentes (sha256 {sha})',
  'bankPlan.edit': 'Cambio en la imagen',
  /* {label} and {id} name a known edit of the factory image (core's); {balance} is a hex word. */
  'bankPlan.editValue':
    '{label} ({id}) sobre la imagen de fábrica. Su compensación, {balance}, está en la palabra de ajuste; el parche compensa por encima de ella, y el paso 04 vuelve a poner la imagen con el cambio.',
  'bankPlan.factorySha': 'sha256 sin cifrar de fábrica',
  'bankPlan.patchedSha': 'sha256 con el parche',
  /** Row label: how many bytes of the bank, as the flash chip stores it, the patch changes. */
  'bankPlan.diffCount': 'Bytes cambiados en el chip de flash',
  /** Row label: the length of the image as sent to the camera, in bytes. */
  'bankPlan.staged': 'Longitud transferida',
  /* {size} bytes sent in {count} USB commands. */
  'bankPlan.stagedValue': {
    one: '{size} B en {count} bloque',
    many: '{size} B en {count} de bloques',
    other: '{size} B en {count} bloques',
  },
  /** Row label: the reserved word the patch changes so the image's checksum stays the same (hex follows). */
  'bankPlan.rebalance': 'Palabra de compensación',
  /* {word} and {balance} are hex words. */
  'bankPlan.rebalanceValue': '{word} (antes {balance}, la compensación del cambio)',
  'bankPlan.caption': 'Los bytes exactos que mueve el parche {bank:loc}',
  'bankPlan.col.what': 'Qué cambia',
  'bankPlan.col.offset': 'Desplazamiento',
  'bankPlan.col.before': 'Antes',
  'bankPlan.col.after': 'Después',

  /* ---- step 04's verdict ---- */
  /* {read} of 31 blocks read, {count} bytes differ (0 when it matches). */
  'verify.ok': {
    one: '**Verificado: coincidencia perfecta.** Tras un arranque nuevo se volvió a leer la cámara: {read}/31 bloques, {count} byte distinto. Su flash está exactamente como antes de la primera escritura.',
    many: '**Verificado: coincidencia perfecta.** Tras un arranque nuevo se volvió a leer la cámara: {read}/31 bloques, {count} de bytes distintos. Su flash está exactamente como antes de la primera escritura.',
    other:
      '**Verificado: coincidencia perfecta.** Tras un arranque nuevo se volvió a leer la cámara: {read}/31 bloques, {count} bytes distintos. Su flash está exactamente como antes de la primera escritura.',
  },
  /* The same, with the blocks that came back short ({blocks}: their numbers, comma-separated). */
  'verify.okShort': {
    one: '**Verificado: coincidencia perfecta.** Tras un arranque nuevo se volvió a leer la cámara: {read}/31 bloques, {count} byte distinto (bloques cortos: {blocks}). Su flash está exactamente como antes de la primera escritura.',
    many: '**Verificado: coincidencia perfecta.** Tras un arranque nuevo se volvió a leer la cámara: {read}/31 bloques, {count} de bytes distintos (bloques cortos: {blocks}). Su flash está exactamente como antes de la primera escritura.',
    other:
      '**Verificado: coincidencia perfecta.** Tras un arranque nuevo se volvió a leer la cámara: {read}/31 bloques, {count} bytes distintos (bloques cortos: {blocks}). Su flash está exactamente como antes de la primera escritura.',
  },
  /* {error} is core's message, or unknownReason. */
  'verify.failed': '**La comprobación encontró diferencias con la copia de seguridad.** {error}',
  unknownReason: 'motivo desconocido',

  /* ---- the confirmation before a write ---- */
  /* {phase} is phase.*.label; {banks} the banks it writes, or confirm.chosenBanks. */
  'confirm.titleWrite': '{phase}: ¿escribir en {banks:acc}?',
  'confirm.titleJump': '{phase}: ¿saltar la escritura no registrada?',
  'confirm.chosenBanks': 'las ranuras elegidas',
  'confirm.jump':
    'LA ESCRITURA NO CONSTA EN EL REGISTRO de esta ejecución, y estás afirmando que las escrituras se completaron sin sus puntos de control: el paso empieza después de la escritura en lugar de volver a escribir. Las comprobaciones propias de los pasos se siguen haciendo (la lectura de la versión, las comprobaciones de las ranuras), y una suposición equivocada cuesta una lectura completa perdida, no una cámara inutilizada.',
  'confirm.jumpKeepPlugged':
    'Mantén la cámara conectada y el equipo despierto hasta que termine el paso.',
  /* Step 03. "In that order" when there are several banks; the camera tries one bank first at start-up. */
  'confirm.patch':
    'Esto escribe un pequeño parche en {banks:acc}. El paso 04 vuelve a poner los originales. La lectura completa que viene después solo lee.',
  'confirm.patchInOrder':
    'Esto escribe un pequeño parche en {banks:acc}, en ese orden: la ranura que la cámara prueba primero va la última. El paso 04 vuelve a poner los originales. La lectura completa que viene después solo lee.',
  /* Step 04. */
  'confirm.restore': 'Esto vuelve a escribir tu firmware original en {banks:acc}.',
  'confirm.restoreInOrder':
    'Esto vuelve a escribir tu firmware original en {banks:acc}, en ese orden: la ranura que la cámara prueba primero va la primera.',
  'confirm.keepPlugged':
    'Mantén la cámara conectada y el equipo despierto mientras escribe: una escritura interrumpida deja una cámara que solo un programador de hardware (SPI o SWD/J-Link) puede arreglar. En un teléfono, con el modo avión activado y la pantalla siempre encendida. Después la cámara se reinicia; cuando la página lo pida, pulsa «Conectar dispositivo» y vuelve a elegirla. Es lo esperado.',
  'confirm.yesJump': 'Sí, saltar la escritura',
  'confirm.yesWrite': 'Sí, escribir en la cámara',

  /* ---- the last screen: the proof ---- */
  'summary.proof': 'La prueba',
  'summary.complete': 'Imagen completa (4 MB)',
  /* In place of a sha256 the run did not produce. */
  'summary.notProduced': 'no generado',
  /* The complete image against the backup, block by block. {differing} of {count} blocks; {blocks} are hex addresses. */
  'summary.differs': {
    one: 'difiere de la copia de seguridad en {differing} de {count} bloque: {blocks}',
    many: 'difiere de la copia de seguridad en {differing} de {count} de bloques: {blocks}',
    other: 'difiere de la copia de seguridad en {differing} de {count} bloques: {blocks}',
  },
  'summary.matches': {
    one: 'coincide con la copia de seguridad ({count} bloque)',
    many: 'coincide con la copia de seguridad (los {count} de bloques)',
    other: 'coincide con la copia de seguridad (los {count} bloques)',
  },
  'summary.onlyInFull': 'Solo en la lectura completa',
  /* {count} blocks hold data a normal read cannot reach; {blocks} are their hex addresses. */
  'summary.onlyInFullValue': {
    one: '{count} bloque al que no llega una lectura de serie: {blocks}',
    many: '{count} de bloques a los que no llega una lectura de serie: {blocks}',
    other: '{count} bloques a los que no llega una lectura de serie: {blocks}',
  },
  'summary.rawDump': 'Lectura completa, tal como se leyó',
  'summary.rawDumpBadge': 'lo mismo, con el parche aún dentro',
  /* {bank} inside a sentence ("slot A"). */
  'summary.image': 'Imagen de firmware (descifrada, {bank})',
  'summary.verify': 'Verificación',
  'summary.toolbar': 'Acciones del archivo',
  'summary.download': 'Descargar el archivo completo (archivo de ejecución)',

  /* ---- what the run file holds (views/PreserveView) ---- */
  'output.title': 'Lo que obtienes',
  'output.intro':
    'El archivo de ejecución es una sola descarga `{ext}`. Cada guardado contiene todo lo que la ejecución ha generado hasta ese momento, con una carpeta por paso:',
  'output.caption': 'Archivos dentro del archivo de ejecución',
  'output.file': 'Archivo',
  'output.what': 'Qué es',
  'output.runState':
    'el registro de la ejecución: carga el zip en esta pestaña para continuar la ejecución o para volver a verla',
  'output.readme': 'qué hay en el zip y dónde',
  'output.backup':
    'tu copia de seguridad: los 31 bloques que deja leer una cámara de serie, leídos antes de escribir nada, cada uno en su dirección de la flash ({fill} donde un bloque no se puede leer así)',
  'output.capture':
    'cada ranura de firmware que la ejecución puede escribir, tal como la guarda la cámara (a, b o r en el nombre), leída dos veces con las dos lecturas iguales',
  'output.plain': 'el firmware de cada una de esas ranuras, descifrado',
  'output.patched':
    'para cada ranura que parchea la ejecución: su firmware con el parche temporal de lectura',
  'output.decrypted':
    'la copia de seguridad descifrada: el firmware de cada ranura y un informe sobre él',
  'output.manifest': 'los detalles de ese descifrado',
  'output.decryptReadme': 'qué contiene ese descifrado y cuáles son sus límites',
  'output.pageBuild': 'qué compilación de esta página hizo la ejecución',
  'output.dumpPatched':
    'los 4 MB completos tal como se leyeron, con el parche aún en las ranuras donde se escribió',
  'output.dumpOriginal':
    'la imagen completa: los 4 MB enteros con el firmware original de vuelta en su sitio; la flash original de tu cámara',
  'output.verify':
    'los 31 bloques leídos de nuevo tras la restauración, ordenados como la copia de seguridad; deberían coincidir con ella',
  'output.grows':
    'Cada archivo aparece cuando se ha ejecutado el paso que lo genera, así que un archivo de ejecución temprano solo contiene la primera carpeta.',
  'output.keep':
    'El archivo que debes conservar es `{original}`: toda la flash de tu cámara tal como estaba. El resto muestra cómo llegó ahí la ejecución.',

  /* ---- the run file section ---- */
  'runFile.eyebrow': 'Opcional: para continuar una ejecución más tarde',
  'runFile.title': 'Archivo de ejecución',
  'runFile.description':
    'El único registro de la ejecución. Se descarga solo después de cada paso (y después de un paso que se detuvo antes de tiempo); guarda el más reciente. Para continuar más tarde, o después de un problema, cárgalo aquí y la página sigue donde lo dejó.',
  'runFile.run': 'Ejecución',
  'runFile.file': 'Archivo',
  'runFile.lastSaved': 'Último guardado',
  /* {step} is the step's id in the run file (English), {at} a time stamp, {bytes} the size in bytes. */
  'runFile.lastSavedValue': 'después de {step} — {at} ({bytes} B)',
  'runFile.nextStep': 'Paso siguiente',
  'runFile.none':
    'No hay ninguna ejecución activa. El paso 02 inicia una, o carga aquí un archivo de ejecución.',
  'runFile.toolbar': 'Acciones del archivo de ejecución',
  'runFile.load': 'Cargar un archivo de ejecución…',
  'runFile.save': 'Volver a guardar el archivo de ejecución',
  /* The run panel's name (its progress bar and log). */
  'runFile.panel': 'Reanudar',

  /* ---- status lines of the run panels ---- */
  'status.noFile': 'No se ha elegido ningún archivo de ejecución.',
  'status.notRun': 'Aún no se ha ejecutado.',
  'status.running': 'En curso…',
  'status.runningRestarts': 'En curso: la cámara se reinicia durante este paso…',
  'status.restarting': 'La cámara se está reiniciando: tarda unos diez segundos…',
  'status.waitConnect': 'Esperándote: pulsa «Conectar dispositivo» y elige la cámara…',
  'status.waitPlugBack':
    'Esperándote: vuelve a conectar la cámara y luego pulsa «Conectar dispositivo»…',
  'status.waitReplug': 'Esperándote: desconecta la cámara y vuelve a conectarla…',
  'status.back': 'La cámara ha vuelto: continuando…',
  'status.swapped':
    'Detenido: la cámara ha cambiado. Compruébala y luego vuelve a ejecutar la fase.',
  'status.noRun': 'Sin ejecución.',
  'status.notCreated': 'No se creó: consulta el registro de arriba.',
  'status.refused': 'Rechazado: la lista de fases de arriba dice qué falta.',
  /* {phase} is phase.*.label. */
  'status.done': '{phase}: hecho. El archivo de ejecución de tus descargas está al día.',
  'status.doneReplug':
    '{phase}: hecho, y el archivo de ejecución está guardado. Antes de la restauración: desconecta la cámara, vuelve a conectarla y pulsa «Conectar dispositivo».',
  'status.backupRefused': 'Rechazado: no se escribió nada. Consulta el registro de arriba.',
  'status.failed': 'Error: consulta el registro de arriba.',
  'status.cancelled':
    'Cancelado: el archivo de ejecución sigue indicando dónde se detuvo la ejecución.',
  'status.readingFile': 'Leyendo el archivo de ejecución…',
  'status.doneEarlier': 'Hecho antes: cargado desde el archivo de ejecución.',
  /* {error} is core's message, or unknownReason. */
  'status.failedEarlier': 'Falló antes: {error}',
  /* {step} is the step's id in the run file (English). */
  'status.resumed': 'Reanudado en {step}. La lista de fases continúa desde ahí.',
  'status.notResumed': 'No se reanudó: consulta el registro de arriba.',

  /*
   * ---- why a step cannot start yet ----
   * gate.needs is shown after notReady.gate's dash; {missing} is one or more of the gate.* phrases
   * below, joined by common:list.semicolon. {build}, {why} and {reason} are core's.
   */
  'gate.needs': 'hace falta {missing}',
  'gate.noRun': 'no hay ninguna ejecución activa: la primera fase crea la ejecución',
  'gate.runDone': 'esta ejecución ha terminado: se completaron todas las fases',
  /* {step} is the step's id in the run file (English). */
  'gate.alreadyDone': 'ya está hecho: al reanudar, se continúa en {step}',
  'gate.banksRead': 'las ranuras que lee la copia de seguridad',
  'gate.choice': 'una elección de ranuras — {why}',
  'gate.bankRefused': 'no se puede escribir {bank:loc}: {reason}',
  /* {r} is the recovery bank inside a sentence ("recovery R"), {bank} a chosen bank. */
  'gate.recoveryRoute':
    'la vía de la ranura de recuperación (esta compilación solo arranca desde {r:acc}, no desde {bank:acc})',
  'gate.backupFirst': 'la copia de seguridad de la flash (se ejecuta primero en esta fase)',
  'gate.backup': 'la copia de seguridad de la flash',
  'gate.patchStep': 'el paso «Parche»',
  'gate.patchOf': 'el parche {bank:gen}',
  'gate.backupFile': 'el archivo de ventanas de la copia de seguridad',
  /* What a step lacks from the run's files: a bank's two agreeing reads, its decrypted image. */
  'gate.capture': 'la captura {bank:gen}',
  'gate.derived': 'la imagen derivada {bank:gen}',
  /* "Write" is the step's name on its chip (core:preserve.step.commit): use the same word as there. */
  'gate.writeStep': 'el paso «Escritura» (ejecútalo o reanuda en él primero)',
  'gate.drainRefused': 'la lectura completa se niega en {build}: {why}',
  'gate.patchSummary': 'el resumen del parche {bank:gen} (la longitud transferida)',
  'gate.restoreRefused':
    'la restauración se niega en {build}: ninguna forma del firmware original se vuelve a almacenar como los bytes originales; la ejecución termina con la imagen completa y con el parche puesto',
  /* {file} is a file name in the run file. */
  'gate.plaintext':
    'el firmware de fábrica sin cifrar {bank:gen} ({file}, del paso de copia de seguridad)',
  'gate.restoreFirst': 'la restauración (se ejecuta primero en esta fase)',
  'gate.powerCycle':
    'la confirmación del apagado y encendido: apaga la cámara y vuelve a encenderla (desconéctala y vuelve a conectarla, o usa su interruptor) y luego usa el control para volver a ejecutar',

  /**
   * The Preserve wizard's reconnect wait gave up: shown as a failed step's
   * reason (lib/preserve/step-error.ts). `{minutes}` is a number; `{error}` is
   * the last USB or browser error, which stays English. "Connect device" is
   * the button app:connect.connect: use the same words as there.
   */
  'error.cameraNotBack':
    'la cámara no volvió después de {minutes} min de reintentos: {error}. Si Chrome no preguntó nada, desconecta la cámara, vuelve a conectarla y vuelve a ejecutar la fase; si el registro decía que la volvieras a conectar, lo que esperaba era el clic en «Conectar dispositivo»',
} satisfies Translation<'preserve'>;
