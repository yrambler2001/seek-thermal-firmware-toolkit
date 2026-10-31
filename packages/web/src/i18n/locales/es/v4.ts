/**
 * Namespace `v4`, español (es), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/V4View.tsx, hooks/useDumpPanel.ts, components/CameraIdentity.tsx,
 * components/OptionsDetails.tsx, lib/options.ts.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useDumpPanel: the status line. */
  'status.starting': 'Iniciando...',
  'status.building': 'Creando el archivo comprimido...',
  'status.cancelling': 'Cancelando: se guardará lo que se haya leído hasta ahora...',
  'status.refused': 'Rechazado: no se leyó nada. Consulta el mensaje encima del registro.',
  'status.sweepDone':
    'Hecho: {armed}/{total} selectores abiertos, {withData} con datos. Revisa tus descargas.',
  'status.sweepDoneCancelled':
    'Hecho: {armed}/{total} selectores abiertos, {withData} con datos (cancelado). Revisa tus descargas.',
  'status.dumpDone': 'Hecho: {read}/{expected} ventanas leídas. Revisa tus descargas.',
  'status.dumpDoneCancelled':
    'Hecho: {read}/{expected} ventanas leídas (cancelado). Revisa tus descargas.',
  'status.dumpDoneIncomplete':
    'Hecho: {read}/{expected} ventanas leídas (incompleto: consulta el registro). Revisa tus descargas.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'La cámara no coincidió con la familia 4.x/Nano, y esta pestaña solo lee esa familia. No se leyó nada. Para una cámara 0.x o 1.x (compilaciones de 2014 o 2016), usa «{tab}».',
  'refusal.otherFamily':
    'La cámara parece ser {name} ({id}), no una cámara 4.x/Nano, y esta pestaña solo lee 4.x/Nano. No se leyó nada. Para una cámara 0.x o 1.x (compilaciones de 2014 o 2016), usa «{tab}».',
  'refusal.legacyLine':
    'La cámara ejecuta {version}, una compilación 0.x o 1.x (2014 o 2016), y esta pestaña solo lee 4.x/Nano. No se leyó nada salvo la versión. Para una cámara 0.x o 1.x, usa «{tab}».',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Volcado',
  'dump.actions': 'Acciones de volcado',
  'dump.start': 'Iniciar volcado',
  'dump.panel': 'Volcado',
  'dump.how':
    'Los dos preguntan primero a la cámara qué firmware ejecuta: su versión, con `{getInfo}` (la única lectura a la que todas las compilaciones de Seek responden igual) y, solo si esa compilación se puede leer por USB, un `{begin}` simple, otro con token y una sola lectura. Así sabe la página de qué familia es la cámara. Esta pestaña solo lee la familia 4.x y Nano. Una cámara que según esas respuestas pertenezca a otra se rechaza antes de leer nada, y la página nombra la pestaña que le corresponde. Una cámara que no indica su versión, o que ejecuta una compilación anterior a 0.8.0.0, no se lee en absoluto, y la página dice por qué.',
  'dump.modes':
    '**Iniciar volcado** lee todos los bloques a los que llega la tabla de selectores de la propia compilación. **Volcar todos los selectores**, en *Opciones* más abajo, prueba todos los selectores `{begin}` `{first}`–`{last}` y guarda lo que devuelva cada uno: es más lento, pero también captura bloques que el mapa seleccionado omite.',
  'dump.sweep': 'Volcar todos los selectores ({first}–{last})',
  'dump.sweepNote':
    'Prueba todos los selectores y guarda lo que devuelva cada uno. Más lento que «Iniciar volcado».',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'Lo que obtienes',
  'output.intro': 'Una sola descarga `{ext}` que contiene:',
  'output.caption': 'Archivos dentro del archivo descargado',
  'output.file': 'Archivo',
  'output.what': 'Qué es',
  'output.flash':
    'la imagen completa de la flash de 4 MB (el relleno del hueco y el token de desbloqueo, si se usó, están en manifest.json)',
  'output.windows': 'cada bloque de 64 KB exactamente como llegó por USB',
  'output.decrypted': 'cada ranura de imagen de firmware, descifrada (si se encontró una clave)',
  'output.reports':
    'informe por ranura: clave, posición de la clave, familia y cifrado, SP, entrada, SHA-256',
  'output.manifest': 'metadatos exactos de lectura, huecos y descifrado',
  'output.readme': 'qué es la captura y cuáles son sus límites',
  'output.keyFromDump':
    'La clave se recupera del propio volcado, así que no hace falta ningún archivo de claves ni ningún secreto del dispositivo.',
  'output.bestEffort':
    'El descifrado sigue siendo un intento sin garantías. Si no se encuentra ninguna clave (por ejemplo, en una unidad cuyo bootloader deriva la clave de la OTP del chip, que no está en un volcado de la flash), esa ranura simplemente se omite y el resto del archivo no se ve afectado.',
  'gap.summary': 'El hueco de {address}',
  'gap.where':
    'El conjunto de comandos USB ofrece un selector de ventana de lectura para cada bloque de 64 KB de la flash de 4 MB salvo `{range}`. Ese bloque se rellena con `{fill}` en la imagen combinada y se anota en `{manifest}`.',
  'gap.costs':
    '**En la práctica, esto no te cuesta nada.** En la mayoría de las cámaras ese bloque es simplemente flash borrada, que se lee como `{fill}` de todos modos, así que el relleno coincide con lo que realmente hay y la imagen está completa.',
  'gap.redundant':
    'Y cuando el bloque *sí* se usa, lo que contiene es una copia redundante. Estas cámaras guardan la misma imagen de firmware en varias ranuras de 64 KB: en todos los volcados con varias ranuras revisados al crear esta página, todas las ranuras se descifraron como un firmware idéntico byte a byte (en un caso, en cuatro ranuras escritas con dos claves distintas). En la única unidad vista con una imagen real en `{address}`, era idéntica byte a byte a las copias de `{before}` y `{after}`, así que el archivo sigue conteniendo ese firmware, solo que leído desde otra dirección.',
  'gap.fine':
    'Esa redundancia es también la razón por la que una cámara cuyo `{address}` se lee como `{fill}` está bien: el firmware arrancable sigue existiendo en las otras ranuras. En cualquier caso, nada de esta pestaña escribe en el dispositivo: el hueco solo afecta al archivo que descargas.',
  'gap.complete':
    'Si de verdad quieres una imagen estrictamente completa, byte a byte (por ejemplo, para compararla con una de referencia), léela por SWD/J-Link o con un programador SPI.',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': 'Sin leer: la cámara no dijo qué firmware ejecuta.',
  'identity.unsupported': 'Sin leer: esta cámara no se puede leer de esta forma.',
  'identity.title': 'Cámara detectada',
  'identity.firmware': 'Firmware',
  'identity.scoreBasis': 'a partir de las respuestas de la cámara, antes de leer ninguna ranura',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Opciones',
  'options.subtitle': '— los valores por defecto son correctos; no hace falta cambiar nada aquí.',
  'options.chunk': 'chunk (bytes control-IN)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'byte gap-fill',
  'options.retries': 'reintentos por ventana',
  'options.retryDelay': 'espera entre reintentos (ms)',
  'options.recipient': 'recipient de la transferencia de control',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'auto',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'descifrar firmware',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'sí',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'no',
  'options.help':
    '**chunk** es el tamaño de cada lectura control-IN, 64 como máximo: un paquete EP0. Una lectura más larga puede perder un paquete por culpa de la ROM de arranque de la cámara cuando la cámara está en reposo con el reloj bajo, así que un valor mayor se lee de 64 en 64 bytes; uno menor se usa tal cual, y si una cámara se atasca, la página baja el valor por su cuenta y continúa. **gap-fill** es el byte que se escribe en el único bloque de 64 KB al que USB no llega. **recipient** es interface por defecto y pasa a device si el navegador no puede reclamar la interfaz 0: el firmware acepta los dos.',
  'options.chunkRange': 'chunk debe estar entre 1 y {max}; se recibió {value}',
  'options.gapFillByte': 'gap-fill debe ser un solo byte; se recibió {value}',
  'options.retriesMin': 'los reintentos deben ser cero o más; se recibió {value}',
  'options.retryDelayMin': 'la espera entre reintentos debe ser cero o más; se recibió {value}',
} satisfies Translation<'v4'>;
