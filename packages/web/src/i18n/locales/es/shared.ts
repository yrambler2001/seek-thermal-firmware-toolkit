/**
 * Namespace `shared`, español (es), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: what several tabs share: components/RunPanel.tsx, Section.tsx, Panel.tsx,
 * KeyValue.tsx, HexBlock.tsx, components/ui/*, hooks/useRunner.ts, useReporter.ts, useDevice.ts,
 * useConnectionTest.ts, lib/camera-lock.ts, download.ts, backup-save.ts, hints.ts, family-line.ts,
 * identify.ts, unlock-seat.ts, webusb.ts, usb-adapter.ts, and components/DeviceInfoPanel.tsx.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* RunPanel: the bar, status line and log every long operation has. {label} is the panel's name. */
  'runPanel.percent': '{value} %',
  'runPanel.progressLabel': '{label}: progreso',
  'runPanel.logLabel': '{label}: registro',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… {count} línea anterior recortada',
    many: '… {count} de líneas anteriores recortadas',
    other: '… {count} líneas anteriores recortadas',
  },
  'runPanel.lineCount': {
    one: '{count} línea',
    many: '{count} de líneas',
    other: '{count} líneas',
  },

  /* Status lines several panels set. */
  'status.idle': 'En espera.',
  'status.cancelled': 'Cancelado.',
  'status.cancelling': 'Cancelando…',
  'status.failedSeeLog': 'Error: consulta el registro de arriba.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'La cámara se está usando en otra pestaña o ventana: termina allí o ciérrala primero.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote': 'El zip se descarga automáticamente, antes de enviar nada.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Ningún dispositivo seleccionado.',
  'device.disconnected': 'Dispositivo desconectado.',
  'device.revoked': 'Permiso revocado.',
  'device.unknownProduct': 'producto desconocido',
  'device.unknownVendor': 'fabricante desconocido',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'En Linux, la cámara necesita una regla udev antes de que el navegador pueda abrirla:\n\n{rule}\n\nLuego desconecta la cámara y vuelve a conectarla. Las versiones Snap y Flatpak de Chromium suelen estar aisladas de los dispositivos USB; la versión .deb o .rpm es la fiable.',
  'hint.windows':
    'Windows necesita que el controlador WinUSB esté asignado a la cámara antes de que cualquier navegador pueda llegar a ella. Usa Zadig (https://zadig.akeo.ie/): Options → List All Devices, elige la entrada con el nombre de tu cámara (por ejemplo, «CompactPRO FF»), elige WinUSB y haz clic en Replace Driver.',
  'hint.holding':
    'Otro programa o un controlador del sistema está usando la cámara: solo un proceso puede usar la interfaz USB a la vez. Cierra cualquier otra cosa que se comunique con ella y luego desconecta la cámara y vuelve a conectarla.',
  'hint.recipientFallback':
    'O pon recipient en «device» en las opciones de lectura, que no necesita reclamar la interfaz.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid':
    'Abre «Opciones» y revisa la nota bajo los campos para ver el intervalo de cada uno.',
  'hint.usbTimeout':
    'La cámara aceptó la petición y nunca respondió. Desconéctala y vuelve a conectarla, y luego prueba con un chunk más pequeño (64 es el valor que funciona en todas partes).',
  'hint.usbStalled':
    'La cámara rechazó la petición. Normalmente esto significa que su firmware no la admite. La página pregunta a la cámara de qué familia es antes de leer nada, así que las peticiones que se siguen rechazando se hicieron para la familia que indicó la propia cámara. Comprueba la versión de firmware en la pestaña «Información».',
  'hint.usbNotOpen':
    'Otro programa o un controlador del sistema está usando la cámara. Ciérralo, o pon recipient en «device» en las opciones de lectura, que no necesita reclamar la interfaz.',
  'hint.usbTransferFailed': 'Desconecta la cámara, vuelve a conectarla y vuelve a intentarlo.',
  'hint.deviceMode':
    'La cámara no quiso salir del modo de imagen. Desconéctala, espera a que se apague del todo y vuelve a conectarla.',
  'hint.deviceWindow':
    'El mapa de selectores que usa esta familia no coincidió con la cámara. En la pestaña 4.x/Nano, abre «Opciones» y ejecuta «Volcar todos los selectores» para ver lo que ofrece realmente la cámara.',
  'hint.deviceVersionUnknown':
    'No se envió nada que pudiera cambiar la cámara. Desconéctala, vuelve a conectarla, deja que termine de arrancar y vuelve a intentarlo; una cámara que indica su versión de firmware se lee con normalidad.',
  'hint.imageMalformed': 'El archivo no es una imagen de firmware de Seek descifrada.',
  'hint.imageUnsupported': 'Esta imagen no se puede preparar para la cámara tal como está.',
  'hint.imageKeyTable':
    'La imagen no lleva el par de claves que indica su nombre de archivo. Usa el archivo descifrado exactamente como lo escribió el volcado, con su nombre incluido.',
  'hint.flashRefused': 'No se escribió nada en la cámara.',
  'hint.familyUnsupported':
    'No se leyó ni se escribió nada. Cada pestaña cubre un intervalo de versiones de firmware: las cámaras 0.x y 1.x van a «Volcar y descifrar 0.x/1.x», y las 4.x y Nano a «Volcar y descifrar 4.x/Nano». La pestaña «Información» dice a qué pestaña va la cámara.',
  'hint.firmwareTooOld':
    'Ninguna familia de firmware puede leer aquí esta compilación: su firmware no tiene manejador de lectura para el comando con el que esta pestaña lee la flash, así que no se le envió nada que pudiera malinterpretarse. Una Compact con 0.7.0.7 o 0.7.0.8 se puede leer en «Volcar y descifrar 0.x/1.x». Un volcado hecho con un programador SPI o por SWD/J-Link se puede descifrar igualmente en esta página, en «Descifrar archivo/ranura».',
  'hint.powerCycle':
    'En este asistente: desconecta la cámara y vuelve a conectarla, pulsa «Conectar dispositivo» y elígela, y luego vuelve a empezar el mismo paso. La ejecución sigue cargada aquí: no hay nada que reanudar.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Firmware en ejecución',
  'deviceInfo.version': 'Versión',
  'deviceInfo.family': 'Familia de firmware',
  'deviceInfo.build': 'Compilación',
  'deviceInfo.bootloader': 'Bootloader',
  'deviceInfo.platform': 'Plataforma',
  'deviceInfo.serial': 'Número de serie',
  'deviceInfo.usbLink': 'Enlace USB',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Config. de arranque',
  'deviceInfo.bootedFrom': 'Arrancó desde',
  'deviceInfo.nextStart': 'Próximo arranque',
  'deviceInfo.upgradeTarget': 'Destino de actualización (su propia actualización)',
  'deviceInfo.bankAt': '{bank} en {address}',
  'deviceInfo.perDeviceKey': 'Clave propia del dispositivo',
  'deviceInfo.notProgrammed': 'no programada: la cámara recurre a la clave B',
  'deviceInfo.keysTitle': 'Claves leídas de esta cámara',
  'deviceInfo.foundAt': 'Encontrada en',
  'deviceInfo.flashOffset': 'desplazamiento {offset} en la flash',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Clave A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Clave B',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**{banks:ins} contiene una imagen de firmware válida cifrada con una clave que el bootloader de esta cámara no conoce.** La imagen está intacta y su suma de comprobación es correcta, pero el bootloader solo prueba {storeKey:acc} y la clave A cuando comprueba una ranura, así que la salta y arranca otra cosa.',
    many: '**Estas ranuras contienen una imagen de firmware válida cifrada con una clave que el bootloader de esta cámara no conoce: {banks:acc}.** Las imágenes están intactas y su suma de comprobación es correcta, pero el bootloader solo prueba {storeKey:acc} y la clave A cuando comprueba una ranura, así que las salta y arranca otra cosa.',
    other:
      '**Estas ranuras contienen una imagen de firmware válida cifrada con una clave que el bootloader de esta cámara no conoce: {banks:acc}.** Las imágenes están intactas y su suma de comprobación es correcta, pero el bootloader solo prueba {storeKey:acc} y la clave A cuando comprueba una ranura, así que las salta y arranca otra cosa.',
  },
  'deviceInfo.orphanIsTarget':
    'Esa es la ranura que escribe una actualización. La aplicación que se ejecuta en esta cámara vuelve a cifrar con esa clave desconocida, así que **escribir mediante esta página producirá otra ranura que el bootloader no puede arrancar**: la cámara seguirá ejecutando {bank:acc}. La forma de evitarlo es escribir la ranura directamente con un programador SPI o por SWD/J-Link.',
  /** deviceInfo.orphanIsTarget's {bank} when the booted bank has no name. A name: a translation may give
   * it case forms ('deviceInfo.otherBank:gen'), like common:bank.*. */
  'deviceInfo.otherBank': 'la otra ranura',
  'deviceInfo.otherBank:acc': 'la otra ranura',
  'deviceInfo.otherBank:gen': 'de la otra ranura',
  'deviceInfo.otherBank:dat': 'a la otra ranura',
  'deviceInfo.otherBank:loc': 'en la otra ranura',
  'deviceInfo.otherBank:ins': 'La otra ranura',
} satisfies Translation<'shared'>;
