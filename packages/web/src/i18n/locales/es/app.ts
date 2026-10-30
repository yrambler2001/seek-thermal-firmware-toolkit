/**
 * Namespace `app`, español (es), translated from the English source: the shell.
 *
 * Owner: phase 1. Covers App.tsx, main.tsx, components/AppHeader.tsx,
 * ThemeSwitch.tsx (+ lib/theme.ts), LanguageSwitch.tsx, lib/routing.ts (tab
 * labels and the document title), SupportBanner.tsx (+ lib/support.ts),
 * UnlockNote.tsx, ConnectSection.tsx and PlatformNotes.tsx.
 *
 * Several of these sentences are pinned word for word by safety-copy.test.tsx.
 */

import type { Translation } from '../../types';

export default {
  /* ---- header ---- */
  title: 'Herramientas de firmware para Seek Thermal',
  'header.cameraSelected': 'Cámara seleccionada',
  'header.noCamera': 'Ninguna cámara seleccionada',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB no disponible',
  'header.github': 'Las herramientas en GitHub',
  'header.tabs': 'Pestañas',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Información',
  'tab.preserve': 'Volcar y descifrar 0.x/1.x 2014/2016',
  'tab.v4': 'Volcar y descifrar 4.x/Nano',
  'tab.decrypt': 'Descifrar archivo/ranura',
  'tab.slots': 'Gestionar ranuras de firmware',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Firmware de Seek Thermal — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Tema oscuro',
  'theme.followsSystem': 'Sigue el ajuste claro u oscuro de tu sistema',
  'theme.chosenDiffers': 'Elegido aquí. Vuelve a cambiarlo para seguir el ajuste de tu sistema.',
  'theme.chosenSame': 'Elegido aquí; ahora coincide con el ajuste de tu sistema',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Idioma',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Lee la cámara conectada igual que `seek-fw info`: su firmware, la familia con la que responde, cómo arranca, sus claves y todas sus ranuras. Te dice cuál de las otras pestañas le corresponde y explica con palabras sencillas para qué sirve cada pestaña. **En esta pestaña no se escribe nada en la flash.**',
  'intro.preserve':
    'Para cámaras **0.x y 1.x** (las compilaciones de 2014 y 2016). Hace una copia **completa** de la flash de 4 MB de la cámara, incluidas las partes a las que no llega un volcado normal, y después deja la cámara exactamente como estaba. Hace una copia de seguridad de lo que puede leer, aplica brevemente un parche al firmware para poder leer el resto, lo vuelca todo, restaura el original y lo comprueba. Todo se ejecuta localmente en tu navegador. **Dos de los pasos escriben en la flash**, y cada uno te lo pregunta antes.',
  'intro.v4':
    'Hace una copia de solo lectura de la flash SPI de 4 MB de una cámara **4.x o Nano** por WebUSB y descifra las imágenes de firmware que encuentre. Todo se ejecuta localmente en tu navegador: no se sube nada a ningún sitio. **Solo lectura:** esta pestaña no envía ningún comando de escritura, borrado, subida, confirmación ni reinicio de la flash. Una cámara de otra línea de firmware se rechaza antes de leer nada.',
  'intro.decrypt':
    'Descifra firmware que ya tienes, en este equipo: un volcado completo de la flash o una ranura de firmware de 64 KB. **No se usa ninguna cámara**, así que funciona sin nada conectado y en navegadores sin acceso USB. El archivo se lee aquí y nunca se sube.',
  'intro.slots':
    'Lee las tres ranuras de firmware de la cámara (ranura A, ranura B y ranura de recuperación R) y muestra lo que contiene cada una, desde cuál arranca la cámara y qué puede hacer esta compilación con ella, junto al firmware en ejecución y las claves del dispositivo. Todo se ejecuta localmente en tu navegador. **Esta pestaña escribe en la flash:** puede escribir una ranura a partir de una imagen descifrada o de bytes sin procesar, y pregunta antes de cada escritura.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**WebUSB no está disponible en iOS ni en iPadOS,** así que este dispositivo no puede leer la flash de una cámara.',
  'support.ios.body':
    'Safari no lo implementa, y todos los navegadores de iOS están obligados a usar WebKit, así que aquí Chrome y Firefox tampoco pueden ofrecerlo. No hay ninguna opción ni extensión que lo cambie. Para volcar una cámara, usa un equipo de escritorio o un teléfono Android con un cable USB-OTG.',
  'support.noWebUsb.title': '**Este navegador no puede acceder a dispositivos USB.**',
  'support.noWebUsb.body':
    'WebUSB está disponible en Chrome, Edge, Opera y otros navegadores basados en Chromium, en Windows, macOS, Linux y Android. Firefox y Safari han decidido no implementarlo.',
  'support.noWebUsb.insecure':
    'Además, esta página no se sirve por una conexión segura, y eso ya basta para bloquear WebUSB.',
  'support.insecure.title': '**Conexión no segura.** Aquí WebUSB está desactivado.',
  'support.insecure.body':
    'Abre esta página por HTTPS o desde `http://localhost`. Una dirección de red local sin más, como `http://192.168.1.10:8000`, no sirve.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Puedes seguir usando la pestaña **{tab}**: funciona solo con un archivo que eliges y no necesita acceso USB.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Listo.** Conecta tu cámara Seek y pulsa *{connect}*.',
  'support.fileProtocol':
    'Se ha abierto como archivo local, así que el navegador no recordará el dispositivo entre recargas. No pasa nada.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Nota: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Conectar',
  'connect.actions': 'Acciones del dispositivo',
  'connect.connect': 'Conectar dispositivo',
  'connect.change': 'Cambiar dispositivo',
  'connect.test': 'Probar conexión',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Olvidar dispositivo',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Se ofrece cualquier dispositivo Seek Thermal (proveedor USB `{vendor}`): Compact, Compact PRO, Nano, etc. Elige el tuyo en el selector de dispositivos del navegador.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Notas por plataforma',
  'platform.macos':
    'Funciona directamente en Chrome, Edge o cualquier navegador basado en Chromium. Sin instalar controladores y sin permisos de administrador. Antes, cierra cualquier otro programa que ya se esté comunicando con la cámara: solo un proceso puede usar la interfaz USB a la vez.',
  'platform.linux.access':
    'Da a tu usuario acceso al dispositivo y luego desconéctalo y vuelve a conectarlo:',
  'platform.linux.sandbox':
    'Las versiones Snap y Flatpak de Chromium suelen estar aisladas de los dispositivos USB; la versión `.deb` o `.rpm` es la fiable.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Windows necesita que el controlador WinUSB esté asignado a la cámara antes de que cualquier navegador pueda llegar a ella. Usa <zadig>Zadig</zadig>: *Options → List All Devices*, luego elige en la lista desplegable la entrada con el nombre de tu cámara (por ejemplo, `CompactPRO FF`), elige **WinUSB** como controlador y haz clic en Replace Driver. Si tu cámara aparece más de una vez, elige la entrada marcada *(Interface 0)*. Esto quita el dispositivo al software del fabricante hasta que lo reviertas en el Administrador de dispositivos (*Desinstalar el dispositivo → Eliminar el controlador*, y luego vuelve a conectarlo).',
  'platform.android':
    'Funciona en Chrome para Android con un cable USB-OTG, siempre que el teléfono pueda alimentar la cámara por el bus USB. Android da acceso USB con su propio diálogo de permiso. La descarga llega a tu carpeta Descargas como cualquier otro archivo.',
  'platform.ios.name': 'iPhone y iPad',
  'platform.ios.cannot':
    '**No puede leer una cámara**, y esto no va a cambiar. Safari no implementa WebUSB, y en iOS y iPadOS todos los navegadores, incluidos Chrome y Firefox, están obligados a usar WebKit, así que ninguno ofrece la API. No hay ninguna opción, extensión ni app que lo evite. Para volcar, usa un equipo de escritorio o un teléfono Android.',
  'platform.ios.decrypt':
    'El descifrador opcional sí funciona aquí: descifrar un volcado que ya tienes no necesita acceso USB, así que puedes hacerlo desde un iPhone o un iPad, o desde Firefox y Safari en un equipo de escritorio.',
} satisfies Translation<'app'>;
