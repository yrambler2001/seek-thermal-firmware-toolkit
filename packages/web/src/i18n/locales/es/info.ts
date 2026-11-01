/**
 * Namespace `info`, español (es), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/InfoView.tsx, hooks/useInfoPanel.ts, components/CameraReport.tsx (its labels only: the
 * copyable report text stays English).
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useInfoPanel: the status line. */
  'status.notRead': 'Aún no se ha leído.',
  'status.reading': 'Leyendo...',
  'status.noVersion': 'No se indicó ninguna versión.',
  'status.tooOld': 'Leído. El firmware {version} es anterior a 0.8.0.0: no se leyó nada más.',
  'status.read': 'Leído. Firmware {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Leer la cámara',
  'read.description':
    'Solo lectura. Pregunta a la cámara qué ejecuta, cómo arranca, qué claves tiene y qué contiene cada ranura: la misma lectura que seek-fw info. No se escribe nada.',
  'read.actions': 'Acciones de información',
  'read.button': 'Leer versión de firmware',
  'read.connectFirst': 'Primero conecta la cámara arriba y luego pulsa «Leer versión de firmware».',
  'read.showDetails': 'Mostrar detalles en el registro',
  'read.panel': 'Versión de firmware',
  'result.title': 'Lo que indica la cámara',
  'result.version': 'Versión de firmware',
  'result.build': 'Compilación',
  'result.range': 'Intervalo de versiones',
  'result.tab': 'Pestaña para esta cámara',
  'result.rangeLegacy': '0.x / 1.x: las cámaras de 2014 y 2016',
  'result.rangeModern': '2.x y posteriores: las cámaras 4.x, Nano y Mosaic',
  'result.rangeUnknown': 'desconocido',
  'result.noVersion':
    '**La cámara no indicó su versión de firmware.** No se envió nada más. Desconéctala, vuelve a conectarla, deja que termine de arrancar y vuelve a leerla.',
  'result.noTab': 'Ninguna pestaña lee esta compilación.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Abre <tab>{tab}</tab> para esta cámara. Esa pestaña vuelve a preguntar a la cámara de qué familia es antes de leer nada, y rechaza una cámara que no sea de la familia que cubre.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'Para qué sirve cada pestaña',
  'tabs.intro':
    'Cinco pestañas, en este orden. Cada una es una página propia, y la cabecera muestra en cuál estás.',
  'tabs.caption': 'Las pestañas, lo que hacen, las cámaras que cubren y si escriben',
  'tabs.tab': 'Pestaña',
  'tabs.does': 'Qué hace',
  'tabs.cameras': 'Cámaras',
  'tabs.writes': '¿Escribe en la cámara?',
  'tabs.info.does':
    'Lee lo que indica la cámara: su firmware, la familia con la que responde, cómo arranca, sus claves y todas sus ranuras. La misma lectura que seek-fw info. No escribe nada.',
  'tabs.info.cameras': 'Cualquier cámara Seek que WebUSB pueda abrir.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'No.',
  'tabs.preserve.does':
    'Hace una copia completa de la flash de 4 MB de la cámara y guarda un archivo de ejecución después de cada paso. Para leerla entera, aplica durante un rato un parche al firmware, y luego vuelve a poner el firmware original y lo comprueba. Te guía por los pasos de uno en uno.',
  'tabs.preserve.cameras':
    'Cámaras con firmware 0.x y 1.x: las compilaciones Compact de 2014, las compilaciones Compact PRO de 2016 (1.0.3.x) y la compilación Compact 1.3.0.8 FF (16 Hz).',
  'tabs.preserve.writes':
    'Sí, en dos pasos, y cada uno pregunta antes. Deja la cámara como estaba.',
  'tabs.v4.does':
    'Lee toda la flash de una cámara 4.x o Nano y descifra las ranuras de firmware que encuentra. Solo lectura: envía seis comandos de lectura y ninguno de escritura.',
  'tabs.v4.cameras':
    'Cámaras con firmware 4.x (Compact, Compact PRO, Compact XR), Mosaic (10.x y 2.x) y Nano (42.x y 44.x), de 2018 en adelante.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'No.',
  'tabs.decrypt.does':
    'Descifra un archivo que ya tienes: un volcado completo, ranura por ranura, o una sola ranura de firmware de 64 KB. El resultado se puede descargar.',
  'tabs.decrypt.cameras':
    'Ninguna. No usa ninguna cámara, así que funciona sin nada conectado y en cualquier navegador.',
  'tabs.decrypt.writes': 'No. Solo escribe la descarga.',
  'tabs.slots.does':
    'Lee las tres ranuras de firmware (ranura A, ranura B y ranura de recuperación R), muestra lo que contiene cada una y desde cuál arranca la cámara, y puede volcar o escribir una ranura cada vez.',
  'tabs.slots.cameras': 'Cámaras con firmware 0.8.0.0 y posteriores.',
  'tabs.slots.writes': 'Sí, una ranura cada vez, y cada escritura pregunta antes.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Cámara',
  'report.product': 'Producto',
  'report.manufacturer': 'Fabricante',
  'report.serial': 'Número de serie',
  'report.platform': 'Plataforma',
  'report.usbLink': 'Enlace USB',
  'report.noProduct': '(sin cadena de producto)',
  'report.none': '(ninguno)',
  'report.unreadable': '(ilegible)',
  'report.firmware': 'Firmware',
  'report.running': 'En ejecución',
  'report.bootloader': 'Bootloader',
  'report.family': 'Familia de firmware',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Leída como',
  'report.detected': 'Detectada',
  'report.boot': 'Arranque',
  'report.booted': 'Ranura de arranque',
  'report.lastStart': 'Último arranque',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'En ejecución (1.3.0.8)',
  'report.nextStart': 'Próximo arranque',
  'report.upgradeTarget': 'Destino de actualización',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(no consultado)',
  'report.targetConfirmed': '{slot} (confirmado en la comunicación USB)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'no se sabe: {why}. Una imagen FF de 16 Hz necesita que la cámara diga qué compilación ejecuta (la pestaña de ranuras lo pregunta)',
  'report.buildWhy': '{build}: {why}',
  'report.buildFf': 'la compilación 1.3.0.8 FF de 16 Hz',
  'report.build8Hz': 'la compilación 1.3.0.8 de 8 Hz',
  'report.keys': 'Claves',
  'report.slots': 'Ranuras',
  'report.slotsCaption':
    'Cada ranura tal como la encontró la lectura. Solo lectura: la que escribe es la pestaña de ranuras.',
  'report.slot': 'Ranura',
  'report.address': 'Dirección',
  'report.version': 'Versión',
  'report.size': 'Tamaño',
  'report.key': 'Clave',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Acepta',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Pie',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Arrancable',
  'report.bytes': '{count} B',
  'report.plaintext': 'ninguna (sin cifrar)',
  /** A table value, lower case: "yes". */
  'report.yes': 'sí',
  /** A table value, lower case: "no". */
  'report.no': 'no',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 'n/d',
  /* {reason} is core's. */
  'report.slotReason': '{slot}: {reason}',
  'report.writing': 'Escritura',
  'report.noBankWritten': 'No se escribe ninguna ranura de esta cámara:',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'De una ranura en una: la pestaña de ranuras escribe o parchea una sola ranura de esta cámara cada vez; cada ranura se transfiere sin cifrar (la imagen tal cual, sin clave), y cada escritura pregunta antes.',
  'report.oneBank.slotKeystream':
    'De una ranura en una: la pestaña de ranuras escribe o parchea una sola ranura de esta cámara cada vez; cada ranura se transfiere con el bloque de claves 0 propio de su imagen, y cada escritura pregunta antes.',
  'report.oneBank.keyA':
    'De una ranura en una: la pestaña de ranuras escribe o parchea una sola ranura de esta cámara cada vez; cada ranura se transfiere con claves derivadas de la ranura de arranque y de la aplicación en ejecución, y cada escritura pregunta antes.',
  'report.oneBank.ffVendor':
    'De una ranura en una: la pestaña de ranuras escribe o parchea una sola ranura de esta cámara cada vez; cada ranura se transfiere como la app del fabricante transfiere la imagen FF de 16 Hz (la imagen XOR su propio bloque de claves 0), y la cámara la almacena con la clave B. Cada escritura pregunta antes.',
  'report.refusesEvery': 'La pestaña de ranuras rechaza todas las ranuras de esta cámara:',
} satisfies Translation<'info', 'es'>;
