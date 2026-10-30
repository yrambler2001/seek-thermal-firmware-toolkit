/**
 * Namespace `app`, English source: the shell.
 *
 * Owner: phase 1. Covers App.tsx, main.tsx, components/AppHeader.tsx,
 * ThemeSwitch.tsx (+ lib/theme.ts), LanguageSwitch.tsx, lib/routing.ts (tab
 * labels and the document title), SupportBanner.tsx (+ lib/support.ts),
 * UnlockNote.tsx, ConnectSection.tsx and PlatformNotes.tsx.
 *
 * Several of these sentences are pinned word for word by safety-copy.test.tsx.
 */

import type { NamespaceMessages } from '../../types';

export default {
  /* ---- header ---- */
  title: 'Seek Thermal Firmware Toolkit',
  'header.cameraSelected': 'Camera selected',
  'header.noCamera': 'No camera selected',
  'header.usbUnavailable': 'USB unavailable',
  'header.github': 'The toolkit on GitHub',
  'header.tabs': 'Tabs',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Info',
  'tab.preserve': 'Dump & decrypt 0.x/1.x 2014/2016',
  'tab.v4': 'Dump & decrypt 4.x/Nano',
  'tab.decrypt': 'Decrypt File/Slot',
  'tab.slots': 'Work with firmware slots',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Seek Thermal Firmware — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Dark theme',
  'theme.followsSystem': "Follows your system's light or dark setting",
  'theme.chosenDiffers': "Chosen here. Switch back to follow your system's setting.",
  'theme.chosenSame': "Chosen here, the same as your system's setting now",

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Language',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Reads the connected camera the way `seek-fw info` does: its firmware, the family it answers as, how it boots, its keys and every bank. It tells you which of the other tabs covers it, and says in plain words what each tab is for. **Nothing is written to flash on this tab.**',
  'intro.preserve':
    "For **0.x and 1.x** cameras (the 2014 and 2016 builds). Makes a **complete** copy of the camera's 4 MiB flash — including the parts a normal dump cannot reach — and then puts the camera back exactly as it was. It backs up what it can read, briefly patches the firmware so the rest can be read, dumps everything, restores the original and checks it. Everything runs locally in your browser. **Two of the steps write to flash**, and each asks you first.",
  'intro.v4':
    'Makes a read-only copy of the 4 MiB SPI flash of a **4.x or Nano** camera over WebUSB and decrypts any firmware images it finds. Everything runs locally in your browser — nothing is uploaded anywhere. **Read-only:** this tab issues no flash write, erase, upload, commit, or reset command. A camera on another firmware line is refused before anything is read.',
  'intro.decrypt':
    'Decrypts firmware you already have, on this computer: a whole flash dump, or one 64 KiB firmware slot. **No camera is used**, so this works with nothing plugged in, and in browsers that have no USB access. The file is read here and never uploaded.',
  'intro.slots':
    "Reads the camera's three firmware banks — slot A, slot B and recovery R — and shows what each holds, which one the camera boots, and what this build can do with it, with the device's running firmware and keys beside them. Everything runs locally in your browser. **This tab writes to flash:** it can flash one bank from a decrypted image or from raw bytes, and asks before every write.",

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    "**WebUSB is not available on iOS or iPadOS,** so this device cannot read a camera's flash.",
  'support.ios.body':
    'Safari does not implement it, and every iOS browser is required to use WebKit, so Chrome and Firefox here cannot expose it either. There is no flag or extension that changes this. To dump a camera, use a desktop computer or an Android phone with a USB-OTG cable.',
  'support.noWebUsb.title': '**This browser cannot access USB devices.**',
  'support.noWebUsb.body':
    'WebUSB is available in Chrome, Edge, Opera and other Chromium browsers on Windows, macOS, Linux and Android. Firefox and Safari have both declined to implement it.',
  'support.noWebUsb.insecure':
    'This page is also not being served over a secure connection, which blocks WebUSB on its own.',
  'support.insecure.title': '**Insecure connection.** WebUSB is disabled here.',
  'support.insecure.body':
    'Open this page over HTTPS or from `http://localhost`. A plain LAN address such as `http://192.168.1.10:8000` does not qualify.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'You can still use the **{tab}** tab — that runs entirely on a file you pick and needs no USB access.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Ready.** Plug in your Seek camera and press *{connect}*.',
  'support.fileProtocol':
    'Opened as a local file, so the browser will not remember the device between reloads. That is harmless.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Note: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Connect',
  'connect.actions': 'Device actions',
  'connect.connect': 'Connect device',
  'connect.change': 'Change device',
  'connect.test': 'Test connection',
  'connect.forget': 'Forget device',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    "Any Seek Thermal device is offered (USB vendor `{vendor}`) — Compact, Compact PRO, Nano and so on. Pick yours in the browser's device chooser.",

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Platform notes',
  'platform.macos':
    'Works out of the box in Chrome, Edge or any Chromium browser. No driver install, no admin rights. Quit any other program that is already talking to the camera first — only one process can hold the USB interface at a time.',
  'platform.linux.access': 'Give your user access to the device, then unplug and replug it:',
  'platform.linux.sandbox':
    'Snap and Flatpak Chromium builds are often sandboxed away from raw USB devices; the `.deb` or `.rpm` build is the reliable one.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Windows needs the WinUSB driver bound to the camera before any browser can reach it. Use <zadig>Zadig</zadig>: *Options → List All Devices*, then in the dropdown pick the entry named after your camera — for example `CompactPRO FF` — choose **WinUSB** as the driver, and click Replace Driver. If your camera appears more than once, take the entry labelled *(Interface 0)*. This takes the device away from the vendor software until you revert it in Device Manager (*Uninstall device → Delete driver*, then replug).',
  'platform.android':
    'Works in Chrome for Android with a USB-OTG cable, provided the phone can supply bus power to the camera. Android grants USB access through its own permission dialog. The download lands in your Downloads folder like any other file.',
  'platform.ios.name': 'iPhone and iPad',
  'platform.ios.cannot':
    '**Cannot read a camera**, and this will not change. Safari does not implement WebUSB, and on iOS and iPadOS every browser — including Chrome and Firefox — is required to render with WebKit, so none of them expose the API. There is no flag, extension, or app that works around it. Use a desktop or an Android phone to dump.',
  'platform.ios.decrypt':
    'The optional decryptor does work here: decrypting a dump you already have needs no USB access, so you can do that from an iPhone or iPad, or from Firefox and Safari on the desktop.',
} as const satisfies NamespaceMessages;
