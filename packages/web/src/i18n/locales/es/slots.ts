/**
 * Namespace `slots`, español (es), translated from the English source: the firmware-slots tab.
 *
 * Owner: phase 2, slots agent.
 * Covers: views/SlotsView.tsx, hooks/useSlotsPanel.ts, components/SlotTable.tsx, SlotFpsConfirm.tsx,
 * SlotFpsEveryConfirm.tsx, SlotWriteConfirm.tsx, SlotFlashPreview.tsx, SlotWriteKeys.tsx.
 * (components/DeviceInfoPanel.tsx is done: its text is in `shared`, deviceInfo.*.)
 *
 * Words used all over this tab:
 * - bank = one of the camera's three firmware slots, A, B and R. R = the recovery slot, the
 *   last-resort copy the bootloader falls back to.
 * - {bank} is a bank's name from common:bank.* ("Slot A", "Recovery R" on its own; "slot A",
 *   "recovery R" inside a sentence). {a}, {b}, {r} are those names inside a sentence; {letter},
 *   {letterA}, {letterB}, {letterR} are the bare letters A, B and R (keep them Latin).
 * - booted = the bank the camera started from (the firmware it runs now).
 * - write / flash = erase a bank and program a new image into it. Commit = the camera's last step of a
 *   write, after which the bank may be changed.
 * - read-back = the bank read again after a write, to compare with what was sent.
 * - "Flash decrypted image", "Read slots", "Dump"… in quotes or bold are this tab's own buttons
 *   (table.flashPlain, actions.read, table.dump): use the same words as those keys.
 * - Hz values, firmware versions (0.8.0.0, 1.3.0.8), 0xFF, .bin/.zip, SWD/J-Link and SPI stay as they
 *   are. Key A / Key B: translate "Key", keep the letter. KiB/MiB are written KB/MB (README, Units).
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* The section: its heading, badge and one-line summary. */
  'section.title': 'Gestionar ranuras de firmware',
  'section.badge': 'Escribe en la flash',
  'section.description':
    '«Leer ranuras» pregunta a la cámara qué ejecuta, lee sus tres ranuras de firmware ({a}, {b} y {r}) y muestra lo que contiene cada una. Leer y volcar no cambian nada. Los botones de escritura preguntan antes de enviar ningún byte.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Esta página puede escribir en la flash de la cámara.** Una escritura borra una ranura de 64 KB y la programa. Una imagen con una estructura válida pero que no funciona deja la cámara sin poder arrancar, y el bootloader no tiene USB: solo SWD/J-Link o un programador SPI pueden recuperarla. Vuelca antes la ranura y guarda el archivo.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Acciones de ranuras',
  'actions.read': 'Leer ranuras',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Ranuras',

  /* Before any read. */
  'empty.connected': 'Pulsa «Leer ranuras».',
  'empty.disconnected': 'Conecta la cámara y luego pulsa «Leer ranuras».',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Esta compilación no se admite aquí, así que no se leyó ninguna ranura y no se puede escribir en ninguna.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Sin identificar: esta página no puede saber qué compilación ejecuta la cámara.',
  'refusal.notIdentified.body':
    'La cámara no dio ninguna versión de firmware utilizable, así que no se leyó ninguna ranura y no se abrió nada. Esta página cubre las compilaciones {minVersion} y posteriores. Las compilaciones anteriores a {minVersion} quedan fuera de lo que admite la página de ranuras, así que una cámara con una de ellas nunca se lee aquí.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Si la cámara ejecuta una compilación admitida, puede que solo esté arrancando. {hint}',
  'refusal.title': 'Rechazado: no se abrió nada.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Leyendo...',
  'status.readingAgain': 'Volviendo a leer las ranuras...',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Leído. {read}/{count} ranura leída.',
    many: 'Leído. {read}/{count} de ranuras leídas.',
    other: 'Leído. {read}/{count} ranuras leídas.',
  },
  'status.unsupported': 'No se admite en esta compilación: no se leyó ninguna ranura.',
  'status.refused': 'Rechazado: no se abrió nada. Consulta el mensaje debajo del registro.',
  'status.disconnected': 'Dispositivo desconectado: vuelve a leer las ranuras.',
  'status.newDevice': 'Nuevo dispositivo seleccionado: vuelve a leer las ranuras.',
  'status.dumping': 'Volcando {bank:acc}...',
  'status.dumped': 'Se volcó {bank:acc}.',
  'status.readingImage': 'Leyendo la imagen...',
  'status.ready': 'Listo: revisa el plan y luego escríbelo.',
  'status.rejected': 'Rechazado: consulta el registro de arriba.',
  'status.writing': 'Escribiendo...',
  'status.patching': 'Aplicando el parche {bank:dat}...',
  'status.patchingEvery': 'Aplicando el parche a todas las ranuras...',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Escrito, pero la relectura no coincide: consulta el resultado.',
  'status.written.verified': 'Escrito. La ranura se relee tal como se escribió.',
  'status.written.notCompared': 'Escrito. La relectura no se comparó: consulta el resultado.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Parche aplicado, pero la relectura no difiere solo según lo previsto: consulta el resultado.',
  'status.patched.ok': 'Parche aplicado. La ranura se relee según lo previsto.',
  'status.patched.unchecked':
    'Parche aplicado. La relectura no se comprobó: consulta el resultado.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Detenido {bank:loc}: {count} ranura con el parche aplicado; consulta el resultado.',
    many: 'Detenido {bank:loc}: {count} de ranuras con el parche aplicado; consulta el resultado.',
    other: 'Detenido {bank:loc}: {count} ranuras con el parche aplicado; consulta el resultado.',
  },
  'status.every.unchecked': {
    one: 'Se aplicó el parche a {count} ranura, pero una relectura no se comprobó según lo previsto: consulta el resultado.',
    many: 'Se aplicó el parche a {count} de ranuras, pero una relectura no se comprobó según lo previsto: consulta el resultado.',
    other:
      'Se aplicó el parche a {count} ranuras, pero una relectura no se comprobó según lo previsto: consulta el resultado.',
  },
  'status.every.ok': {
    one: 'Se aplicó el parche a {count} ranura. Se relee según lo previsto.',
    many: 'Se aplicó el parche a {count} de ranuras. Todas se releen según lo previsto.',
    other: 'Se aplicó el parche a {count} ranuras. Todas se releen según lo previsto.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Cancelado: no se escribió nada.',
  'status.cancelled.one':
    'Cancelado después de enviar la confirmación de la escritura {bank:loc}: la ranura puede estar escrita en parte. Léela antes de contar con ella.',
  'status.cancelled.many':
    'Cancelado después de enviar las confirmaciones de escritura {banks:loc}: cada una puede estar escrita en parte. Léelas antes de contar con ellas.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Primero conecta la cámara.',
  'gate.busy': 'Hay otra operación en curso: espera a que termine.',
  'gate.readFirst': 'Primero lee las ranuras.',
  'gate.cameraRefused':
    'En esta cámara no se puede escribir desde aquí, por el motivo del aviso de arriba. No se envía nada.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Sin leer: {reason}. Vuelve a leer las ranuras antes de escribir en ella.',
  'gate.notReadNoReason':
    'Sin leer: esta ranura no se leyó. Vuelve a leer las ranuras antes de escribir en ella.',
  'gate.emptyNotWritable':
    'Esta ranura está vacía y no se puede escribir en esta compilación: {reason}',
  'gate.noSuchBank': 'Esta compilación no tiene esa ranura.',

  /* The bank table. */
  'table.caption':
    'Cada ranura de firmware de esta cámara ({a}, {b} y {r}), tal como se leyó y comprobó en el navegador',
  'table.col.bank': 'Ranura',
  'table.col.firmware': 'Firmware',
  'table.col.size': 'Tamaño',
  'table.col.key': 'Clave',
  'table.col.bootable': 'Arrancable',
  'table.col.sha': 'SHA-256 sin cifrar',
  'table.col.actions': 'Acciones',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'sin leer: {reason}',
  'table.notReadNoReason': 'sin leer: la ranura no se leyó',
  /* A badge: the bank holds no image. */
  'table.empty': 'vacía',
  'table.emptyNote':
    'Sin imagen: la ventana de cabecera de esta ranura se lee toda como 0xFF, así que no se descifra nada de ella, y escribir en ella no sobrescribe ningún firmware.',
  /* {reason} is core's. */
  'table.emptyWritable': 'Se puede escribir.',
  'table.emptyNotWritable': 'No se puede escribir en esta compilación: {reason}',
  'table.unknownVersion': 'versión desconocida',
  /* {id} is the image id in hex. */
  'table.imageId': 'imagen {id}',
  'table.noImage': 'sin imagen',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'ranura de {size} B',
  'table.imageSize': 'imagen de {size} B',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'ninguna (sin cifrar)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— nada que arrancar',
  'table.boot.bootable': 'arrancable: el bootloader la acepta',
  'table.boot.notBootable': 'no arrancable: se salta al arrancar',
  'table.boot.recoveryOnly':
    'solo recuperación: {letterR} arranca cuando {letterA} y {letterB} no contienen nada que acepte el bootloader (medido en una cámara con una forma anterior de esta imagen); no se ha probado si esta forma arranca',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'desconocido: {why}',
  /* The row's buttons. */
  'table.dump': 'Volcar',
  'table.flashPlain': 'Escribir imagen descifrada…',
  'table.flashRaw': 'Escribir bytes sin procesar…',
  'table.restore': 'Restaurar desde copia de seguridad completa (.bin o .zip)…',
  'table.makeFps': 'Pasar a {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Copiar {bank:dat}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button}: {reason}',
  'table.copyOffNoReason': '{button}: desactivado',
  'table.copyNote':
    'Copia el firmware que contiene esta ranura, tal como lo descifró esta lectura, en la ranura que elijas, contenga lo que contenga ahora. Revisas el plan antes de que se envíe nada.',
  'table.restoreNote':
    'Elige una copia de seguridad completa de la flash: un .bin (una imagen completa de la flash de 4 MB, como una lectura con J-Link) o un .zip que contenga una (un archivo de ejecución de Preserve, o el zip que guarda «Volcar y descifrar 4.x/Nano» o «Volcar todos los selectores»). Esta ranura se extrae de ella, se descifra y se muestra como un plan antes de enviar nada.',
  'table.fpsNote':
    'Sube esta ranura de {fromHz} Hz a {toHz} Hz editando sus bytes. Antes se guarda la ranura, en una descarga zip, y el archivo descifrado que contiene es la forma de volver atrás.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery':
    '{booted} y ranura de recuperación: escribir en ella pide una confirmación adicional.',
  'table.risk.booted': '{booted}: escribir en ella pide una confirmación adicional.',
  'table.risk.recovery': '{bank}: escribir en ella pide una confirmación adicional.',
  'table.risk.bootUnnamed':
    'La cámara no indica su ranura de arranque: escribir en ella pide una confirmación adicional.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Parche de velocidad de fotogramas aplicado: esta imagen funciona a {hz} Hz.',
  'fps.earlierPatch':
    'Parche de velocidad de fotogramas no disponible: esta ranura contiene un parche anterior de {hz} Hz sin la corrección de USB. Restaura la imagen de serie y luego usa «Pasar a {hz} FPS».',
  'fps.atRate':
    'No hace falta parche de velocidad de fotogramas: esta compilación ya funciona a {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Parche de velocidad de fotogramas no disponible: {reason}',
  'fps.readFirst':
    'primero lee las ranuras: el parche se planifica a partir de la propia imagen de la ranura',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Todas las ranuras',
  'everyBank.make': 'Pasar todas las ranuras a {hz} FPS',
  'everyBank.faster': 'Acelerar todas las ranuras',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Aplica el parche {order:dat} con una sola confirmación; antes se guarda cada una, en una sola descarga zip, y después se relee.',
  'everyBank.noteBootedLast':
    'Aplica el parche {order:dat} con una sola confirmación, y deja para el final la ranura desde la que arranca ahora la cámara; antes se guarda cada una, en una sola descarga zip, y después se relee.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': 'la imagen {bank:gen}',
  'what.restore': '{bank:acc} de {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Preparado para {bank:acc} en {address}',
  'preview.file': 'Archivo',
  'preview.source': 'Imagen tomada de',
  'preview.target': 'Destino',
  'preview.targetEmpty':
    '{bank:ins} está vacía: no contiene ninguna imagen, así que esta escritura no sobrescribe ningún firmware',
  'preview.readAs': 'Leído como',
  'preview.readAs.ff': 'una imagen FF {version} descifrada',
  'preview.readAs.plain': 'una imagen descifrada',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'bytes sin procesar',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Transferencia',
  'preview.key': 'Clave',
  'preview.payload': 'Datos',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} B en {count} bloque de hasta {chunk} B',
    many: '{size} B en {count} de bloques de hasta {chunk} B',
    other: '{size} B en {count} bloques de hasta {chunk} B',
  },
  'preview.checksum': 'Suma de comprobación de la transferencia',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Almacenado después',
  'preview.storedNotPredicted': 'no predicho: la relectura es la comprobación',
  'preview.storedPredicted': '{size} B predichos',
  'preview.storedKeyB': '{size} B predichos: la imagen XOR la clave B, no los datos en sí',
  'preview.savedFirst': 'Guardado antes',
  'preview.compareCaption': 'Qué cambia {bank:loc}',
  'preview.col.field': 'Campo',
  'preview.col.now': 'Ahora',
  'preview.col.after': 'Tras la escritura',
  'preview.readFirst': 'Lee esto antes de escribir:',
  /* {note} is core's note about this write. */
  'preview.note': 'Nota: {note}',
  'preview.nothingSent':
    'Aún no se ha enviado nada a la cámara. Al escribir, estos datos se envían {bank:dat} y se confirma la escritura.',
  'preview.toolbar': 'Acciones de escritura para {bank:acc}',
  'preview.write': 'Escribir {bank:loc}…',
  'preview.discard': 'Descartar',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': '¿Escribir {what} {bank:loc} ({address})?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. Escribir en ella sustituye el firmware que la cámara está ejecutando ahora. Si la imagen nueva no funciona, puede que la cámara no arranque en absoluto.',
  'writeConfirm.recovery':
    '{bank:ins} es la ranura de recuperación, la copia de último recurso a la que recurre el bootloader. Escribir en ella deja la cámara sin esa copia hasta que se restaure.',
  'writeConfirm.bootUnnamed':
    'La cámara no dice desde qué ranura arranca, así que {bank:acc} se trata como la ranura desde la que arranca ahora. Escribir en ella puede sustituir el firmware que está ejecutando la cámara.',
  'writeConfirm.empty':
    '{bank:ins} está vacía: no contiene ninguna imagen, así que no se sobrescribe ningún firmware.',
  'writeConfirm.eraseEmpty':
    'La escritura borra igualmente el bloque de 64 KB de la flash de la cámara que ocupa {bank:acc} (ya en blanco) y lo programa.',
  'writeConfirm.erase':
    'Esto borra un bloque de 64 KB de la flash de la cámara y lo programa {bank:loc}.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'La imagen se escribe con {key}. Todas las demás ranuras se escriben del mismo modo.',
  'writeConfirm.backup':
    'Antes de enviar nada, se vuelve a leer {bank:acc} y se guarda como una descarga zip: {file}. Comprueba que está en tu carpeta de descargas.',
  'writeConfirm.noReset':
    'No se envía ningún reinicio. Después, desconecta la cámara y vuelve a conectarla para que la ranura tenga efecto.',
  'writeConfirm.noUsbRecovery':
    'Si la imagen no funciona, la cámara no se puede recuperar por USB: solo con SWD/J-Link o con un programador SPI.',
  'writeConfirm.ackUnnamed':
    'Entiendo que la cámara no dice desde qué ranura arranca, así que esta se trata como la de arranque, y que una imagen defectuosa puede impedir que la cámara arranque.',
  'writeConfirm.confirm': 'Sí, escribir {bank:loc}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Entiendo que esta es la ranura desde la que arranca ahora la cámara, y que una imagen defectuosa puede impedir que la cámara arranque.',
  'ack.recovery':
    'Entiendo que esta es la ranura de recuperación, y que una imagen defectuosa deja la cámara sin una copia de último recurso.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': '¿Hacer que {bank:acc} funcione a {hz} FPS?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted':
    '{bootsNow}. La imagen con el parche sustituye el firmware que ejecuta ahora.',
  'fpsConfirm.recovery':
    '{bank:ins} es la ranura de recuperación, la copia de último recurso a la que recurre el bootloader.',
  'fpsConfirm.what':
    '{bank:ins} contiene el firmware {version}, y esto hace que su imagen funcione a {toHz} Hz en lugar de {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(desconocida)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'El parche cambia {count} byte de la imagen y la palabra de la suma de comprobación, para que se mantenga la suma que comprueba el bootloader. El par de claves no se toca.',
    many: 'El parche cambia {count} de bytes de la imagen y la palabra de la suma de comprobación, para que se mantenga la suma que comprueba el bootloader. El par de claves no se toca.',
    other:
      'El parche cambia {count} bytes de la imagen y la palabra de la suma de comprobación, para que se mantenga la suma que comprueba el bootloader. El par de claves no se toca.',
  },
  'fpsConfirm.wayBack':
    'El archivo descifrado de ese zip es la forma de volver atrás: para deshacer el parche, escríbelo con «Escribir imagen descifrada» {bank:loc}.',
  'fpsConfirm.noReset':
    'No se envía ningún reinicio. Después, desconecta la cámara y vuelve a conectarla para que la ranura con el parche tenga efecto.',
  'fpsConfirm.ackUnnamed':
    'Entiendo que la cámara no dice desde qué ranura arranca, así que esta se trata como la de arranque.',
  'fpsConfirm.confirm': 'Sí, aplicar el parche {bank:dat}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': '¿Hacer que todas las ranuras funcionen a {hz} FPS?',
  'fpsEvery.titleMixed': {
    one: '¿Aplicar el parche de velocidad de fotogramas a {count} ranura?',
    many: '¿Aplicar el parche de velocidad de fotogramas a {count} de ranuras?',
    other: '¿Aplicar el parche de velocidad de fotogramas a {count} ranuras?',
  },
  'fpsEvery.intro': {
    one: 'Esto aplica el parche a {count} ranura en la que está disponible (firmware {version}):',
    many: 'Esto aplica el parche a {count} de ranuras en las que está disponible (firmware {version}):',
    other:
      'Esto aplica el parche a {count} ranuras en las que está disponible (firmware {version}):',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (la ranura desde la que arranca ahora esta cámara, y la ranura de recuperación)',
  'fpsEvery.role.booted': '{bank} (la ranura desde la que arranca ahora esta cámara)',
  'fpsEvery.role.recovery': '{bank} (la ranura de recuperación, la copia de último recurso)',
  'fpsEvery.role.bootUnnamed': '{bank} (la cámara no dice desde qué ranura arranca)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank}: de {fromHz} Hz a {toHz} Hz, {count} byte y la palabra de la suma de comprobación.',
    many: '{bank}: de {fromHz} Hz a {toHz} Hz, {count} de bytes y la palabra de la suma de comprobación.',
    other:
      '{bank}: de {fromHz} Hz a {toHz} Hz, {count} bytes y la palabra de la suma de comprobación.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank}: {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Se quedan como están: {others}',
  'fpsEvery.orderOne': 'Escribe solo {bank:loc}, y luego la relee.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Se escriben en este orden: {order}. Cada una se relee antes de la siguiente, y el primer fallo detiene las demás.',
  'fpsEvery.orderBootedLast':
    'Se escriben en este orden: {order}. La ranura desde la que arranca ahora la cámara va la última, así que, si algo falla, todo se detiene antes de llegar a ella. Cada una se relee antes de la siguiente, y el primer fallo detiene las demás.',
  'fpsEvery.wayBack':
    'Los archivos descifrados de ese zip son la forma de volver atrás: para deshacer el parche de una ranura, escribe su archivo con «Escribir imagen descifrada» en esa ranura.',
  'fpsEvery.noReset':
    'No se envía ningún reinicio. Después, desconecta la cámara y vuelve a conectarla para que las ranuras con el parche tengan efecto.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Entiendo que esto escribe en estas ranuras, y que una imagen defectuosa puede impedir que la cámara arranque: {banks}.',
  'fpsEvery.confirm': {
    one: 'Sí, aplicar el parche a {count} ranura',
    many: 'Sí, aplicar el parche a {count} de ranuras',
    other: 'Sí, aplicar el parche a {count} ranuras',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what}: la ranura se relee tal como se escribió.',
  'outcome.mismatch': '{bank} — {what}: la relectura NO coincide con lo que se escribió.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what}: la relectura se hizo pero no se comparó, así que aquí esta escritura no está verificada.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'La confirmación de la cámara devolvió el estado {status}.',
  'outcome.wasEmpty':
    '{bank:ins} estaba vacía antes de esta escritura, así que no se sobrescribió ningún firmware.',
  'outcome.provenVerified':
    'Demostrado hasta ahora: los datos se enviaron y se confirmaron, y la ranura se relee tal como se escribió. NO demostrado: que el bootloader vaya a elegir esta ranura, ni que la imagen funcione.',
  'outcome.provenCommitted':
    'Demostrado hasta ahora: los datos se enviaron y se confirmaron. NO demostrado: que el bootloader vaya a elegir esta ranura, ni que la imagen funcione.',
  'outcome.replug':
    '**AHORA DESCONECTA LA CÁMARA Y VUELVE A CONECTARLA.** No se envió ningún reinicio, así que la ranura solo tiene efecto después de apagar y volver a encender la cámara de verdad. Luego vuelve a leer las ranuras: la versión y la ranura activa que indica la cámara son lo único que lo confirma.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**AHORA DESCONECTA LA CÁMARA Y VUELVE A CONECTARLA.** No se envió ningún reinicio. Luego vuelve a leer las ranuras.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Guardado antes, como descarga: {file}.',
  'outcome.wayBackOne':
    'El archivo descifrado que contiene es la forma de volver atrás («Escribir imagen descifrada» en la misma ranura).',
  'outcome.wayBackMany':
    'Los archivos descifrados que contiene son la forma de volver atrás («Escribir imagen descifrada» en cada ranura).',
  'outcome.checkDownloads': 'Comprueba que está en tu carpeta de descargas.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank} — parche aplicado de {fromHz} Hz a {toHz} Hz (firmware {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'La relectura solo difiere del volcado guardado en el {count} byte previsto, los puntos del parche y la palabra de la suma.',
    many: 'La relectura solo difiere del volcado guardado en los {count} de bytes previstos, los puntos del parche y la palabra de la suma.',
    other:
      'La relectura solo difiere del volcado guardado en los {count} bytes previstos, los puntos del parche y la palabra de la suma.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'La relectura NO difiere solo según lo previsto: {unexpected} bytes inesperados y {count} byte que falta.',
    many: 'La relectura NO difiere solo según lo previsto: {unexpected} bytes inesperados y {count} de bytes que faltan.',
    other:
      'La relectura NO difiere solo según lo previsto: {unexpected} bytes inesperados y {count} bytes que faltan.',
  },
  'fpsOutcome.notTaken': 'No se hizo la relectura, así que aquí el parche no está comprobado.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Todas las ranuras: {done} de {count} con el parche aplicado, en este orden: {order}.',
    many: 'Todas las ranuras: {done} de {count} con el parche aplicado, en este orden: {order}.',
    other: 'Todas las ranuras: {done} de {count} con el parche aplicado, en este orden: {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'La relectura solo difiere de la ranura guardada en el {count} byte previsto.',
    many: 'La relectura solo difiere de la ranura guardada en los {count} de bytes previstos.',
    other: 'La relectura solo difiere de la ranura guardada en los {count} bytes previstos.',
  },
  'fpsEveryOutcome.notTaken': 'No se hizo la relectura.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Detenido: {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Sin escribir: {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Desde aquí no se puede escribir en ninguna ranura de esta cámara.',
  'keys.title': 'Claves de las escrituras',
  'keys.chain': 'Cadena',
  'keys.chainPlain':
    'la cadena sin cifrar de 2014: todas las ranuras se almacenan sin cifrar, así que ninguna contiene una clave',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Se escribe como',
  'keys.writtenPlain': 'la imagen tal cual, sin clave, en cualquier ranura',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Se transfiere como',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Se almacena como',
  'keys.refused': 'Rechazado',
  'keys.bootedBank': 'Ranura de arranque',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank:ins} contiene {key:acc}',
  'keys.theBootedBank': 'la ranura de arranque',
  'keys.unnamedKey': 'una clave que la página no puede nombrar',
  'keys.bootedBanksKey': 'la clave de la ranura de arranque',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line}; todas las ranuras se escriben del mismo modo',

  /* "What these buttons do", below the tab. */
  'how.title': 'Qué hacen estos botones',
  'how.read': '**Leer ranuras** y **Volcar** no cambian nada en la cámara.',
  'how.flash':
    '**Escribir imagen descifrada** toma una imagen sin cifrar, la cifra como necesita el firmware de esa ranura antes de transferirla y muestra el plan. **Escribir bytes sin procesar** transfiere el archivo exactamente como se da. Ninguno de los dos envía nada hasta que confirmas.',
  'how.ff':
    'Escribir en {letterR} pide la confirmación adicional, como cualquier escritura en la ranura de recuperación. Una ranura **vacía** (su ventana de cabecera se lee toda como 0xFF, como {b:loc} de muchas cámaras de 2014) es un estado, no un fallo. Se escribe exactamente igual que cualquier otra ranura.',
  'how.copy':
    '**Restaurar desde copia de seguridad completa** toma un .bin (una imagen completa de la flash de 4 MB, como una lectura con J-Link) o un .zip que contenga una (un archivo de ejecución de Preserve, o el zip que guarda «Volcar y descifrar 4.x/Nano» o «Volcar todos los selectores»), extrae de él esta ranura, la descifra y muestra el plan; si la copia parece de otra cámara o de otro firmware, el plan lo dice.',
  'how.fps':
    '**Pasar a N FPS** en la fila de una ranura edita la imagen de esa ranura para una velocidad de fotogramas más alta, y **Pasar todas las ranuras a N FPS** lo hace en todas las ranuras en las que el parche está disponible, con una sola confirmación, y deja para el final la ranura desde la que arranca ahora la cámara. Para una ranura en la que no está disponible, la página dice por qué.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Cada escritura guarda antes su ranura**: la ranura se vuelve a leer y se guarda como una descarga zip, con un nombre que lleva la hora, el número de serie de la cámara, el firmware, la ranura y la escritura (por ejemplo, `{example}`), y que contiene la ranura tal como está almacenada, su imagen descifrada y una nota de lo que es cada archivo. Para volver atrás, escribe el archivo descifrado del zip con **Escribir imagen descifrada**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Una escritura borra una ranura de 64 KB y la programa. El bootloader en `{address}` y la configuración de arranque nunca se escriben aquí, y no hay ningún control para elegir la ranura activa. La ranura solo tiene efecto después de desconectar la cámara y volver a conectarla.',
} satisfies Translation<'slots'>;
