/**
 * Namespace `decrypt`, español (es), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/DecryptView.tsx, hooks/useOfflineDecrypt.ts, hooks/useSlotFileDecrypt.ts,
 * components/DetectionBox.tsx, components/FilePickerButton.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useOfflineDecrypt: the status line. */
  'status.noFile': 'No se ha elegido ningún archivo.',
  'status.reading': 'Leyendo el archivo...',
  'status.notUsable': 'No es un volcado utilizable.',
  'status.building': 'Creando el archivo comprimido...',
  'status.nothingDecrypted':
    'No se descifró ninguna imagen: consulta el motivo en el registro. El manifiesto está en tus descargas.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Hecho: {done}/{count} ranura descifrada. Revisa tus descargas.',
    many: 'Hecho: {done}/{count} de ranuras descifradas. Revisa tus descargas.',
    other: 'Hecho: {done}/{count} ranuras descifradas. Revisa tus descargas.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Descifrar un volcado que ya tienes',
  'offline.description': 'Un volcado completo de la flash, descifrado ranura por ranura.',
  'offline.intro':
    'El paso 2 de la pestaña 4.x/Nano ya descifra todo lo que lee, así que solo necesitas esto si tu imagen de la flash viene de otro sitio: una ejecución anterior, J-Link o un programador SPI. El archivo se lee localmente y nunca se sube. **Esta parte funciona en todos los navegadores**, incluidos Safari e iOS, porque no necesita acceso USB.',
  'offline.actions': 'Acciones de descifrado sin conexión',
  'offline.choose': 'Elegir archivo de volcado…',
  'offline.panel': 'Descifrado sin conexión',
  'offline.detectedTitle': 'Familia de firmware detectada',
  'offline.detectedIntro':
    'No hay ninguna cámara conectada, así que la familia se puntúa a partir de las imágenes del propio archivo. La clave se resuelve igualmente a partir del texto cifrado de cada ranura; esto es lo que da nombre a la familia de firmware en el informe.',
  'offline.scoreBasis': 'a partir de las imágenes del archivo',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Descifrar una ranura de firmware',
  'slot.description': 'Una ranura, desde un archivo: 64 KB, tal como la almacena la cámara.',
  'slot.intro':
    'Elige un archivo que contenga una ranura de firmware: 65 536 bytes, como la guarda un volcado de ranura en la pestaña <link>{tab}</link>, o los 64 KB que hay en la dirección de una ranura en un volcado completo de la flash. La página encuentra la clave a partir de los propios bytes de la ranura, descifra la imagen y te la ofrece para descargar, mostrando la clave, el tamaño y el SHA-256. No se usa ninguna cámara, así que funciona sin nada conectado.',
  'slot.refusedIntro':
    'Un archivo que no sea una ranura, que no contenga ninguna imagen de firmware o que no se descifre se rechaza indicando el motivo. Una ranura borrada lo indica y no tiene nada que descifrar.',
  'slot.actions': 'Acciones del archivo de ranura',
  'slot.choose': 'Elegir archivo de ranura…',
  'slot.decrypting': 'Descifrando {file}…',
  'slot.unreadable': 'No se pudo leer el archivo.',
  'slot.notDecrypted':
    'Sin descifrar: {file} no es una ranura de firmware que esta página pueda descifrar.',
  'slot.nothingWritten':
    'No se escribió nada en ningún sitio. Elige un archivo de ranura de 64 KB, o un volcado completo en la sección de arriba.',
  'slot.erased': '{file} es una ranura borrada.',
  'slot.resultTitle': 'Ranura de firmware descifrada',
  'slot.file': 'Archivo',
  'slot.fileSize': 'Tamaño del archivo',
  'slot.fileSha': 'SHA-256 del archivo',
  'slot.imageVersion': 'Versión de la imagen',
  'slot.imageSize': 'Tamaño de la imagen',
  'slot.imageSha': 'SHA-256 de la imagen',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Suma de comprobación',
  'slot.notComputed': 'no se calcula para esta forma',
  'slot.family': 'Familia',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (detectada a partir de la imagen)',
  'slot.familyMismatch':
    '{name}: la suma no es la que exige esta familia, así que el bootloader no aceptaría la imagen tal como está',
  'slot.unknown': 'desconocida',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} B',
  'slot.key': 'Clave',
  'slot.keyPlain':
    'ninguna: la ranura contiene la imagen sin cifrar (la cadena sin cifrar de 2014)',
  'slot.keyFfB': 'clave B del par 1.3.0.8 FF',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Almacenada como',
  'slot.storedAsFfB':
    'la imagen XOR el flujo de clave de la clave B, con la ventana de cabecera literal',
  'slot.keyNone': 'ninguna',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Forma de la clave',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce': '{k}: la propia imagen contiene esta forma una sola vez, y eso la identifica',
  'slot.keyFormDefault':
    '{k}: ninguna forma aparece una sola vez en la imagen, así que se muestra la de la familia por defecto',
  'slot.resultActions': 'Acciones de la imagen descifrada',
  'slot.download': 'Descargar {file}',
  'slot.downloadFallback': 'la imagen descifrada',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Detectada',
  'detection.score': 'Puntuación',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} de 1.00, {basis}',
  'detection.readAs': 'Leída como',
  'detection.summary': 'Resumen',
  'detection.why': 'Por qué:',
  'detection.ambiguous':
    '**Los indicios no permitieron decidir qué familia es.** O la ganadora no puntuó mejor que la alternativa genérica, o la segunda quedó demasiado cerca para decidir. El descifrado no se ve afectado (la clave se resuelve igualmente a partir del texto cifrado), pero la familia que nombra el informe, y todo lo que depende de ella, es una suposición.',
} satisfies Translation<'decrypt'>;
