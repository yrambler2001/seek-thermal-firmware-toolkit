/**
 * Namespace `app`, Deutsch (de), translated from the English source: the shell.
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
  title: 'Seek Thermal Firmware Toolkit',
  'header.cameraSelected': 'Kamera ausgewählt',
  'header.noCamera': 'Keine Kamera ausgewählt',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB nicht verfügbar',
  'header.github': 'Das Toolkit auf GitHub',
  'header.tabs': 'Tabs',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Info',
  'tab.preserve': 'Auslesen & entschlüsseln 0.x/1.x',
  'tab.v4': 'Auslesen & entschlüsseln 4.x/Nano',
  'tab.decrypt': 'Datei/Slot entschlüsseln',
  'tab.slots': 'Firmware-Slots bearbeiten',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Seek Thermal Firmware — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Dunkles Design',
  'theme.followsSystem': 'Folgt der hellen oder dunklen Einstellung Ihres Systems',
  'theme.chosenDiffers':
    'Hier gewählt. Schalten Sie zurück, um wieder der Einstellung Ihres Systems zu folgen.',
  'theme.chosenSame': 'Hier gewählt, derzeit gleich der Einstellung Ihres Systems',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Sprache',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Liest die angeschlossene Kamera so aus wie `seek-fw info`: ihre Firmware, die Familie, als die sie sich meldet, wie sie startet, ihre Schlüssel und jeden Slot. Die Seite sagt Ihnen, welcher der anderen Tabs für die Kamera zuständig ist, und erklärt in einfachen Worten, wofür jeder Tab da ist. **In diesem Tab wird nichts in den Flash-Speicher geschrieben.**',
  'intro.preserve':
    'Für Kameras mit **0.x und 1.x** (die Builds von 2014 und 2016). Erstellt eine **vollständige** Kopie des 4 MB großen Flash-Speichers der Kamera — auch der Teile, die ein normales Auslesen nicht erreicht — und stellt die Kamera danach genau so wieder her, wie sie war. Die Seite sichert, was sie lesen kann, patcht die Firmware kurzzeitig, damit sich der Rest lesen lässt, liest alles aus, stellt das Original wieder her und prüft es. Alles läuft lokal in Ihrem Browser. **Zwei der Schritte schreiben in den Flash-Speicher**, und jeder fragt vorher nach.',
  'intro.v4':
    'Erstellt über WebUSB eine reine Lesekopie des 4 MB großen SPI-Flash-Speichers einer **4.x- oder Nano**-Kamera und entschlüsselt alle Firmware-Images, die darin gefunden werden. Alles läuft lokal in Ihrem Browser — nichts wird irgendwohin hochgeladen. **Nur Lesen:** Dieser Tab sendet keinen Befehl zum Schreiben, Löschen, Hochladen, Committen oder Zurücksetzen des Flash-Speichers. Eine Kamera mit einer anderen Firmware-Linie wird abgelehnt, bevor irgendetwas gelesen wird.',
  'intro.decrypt':
    'Entschlüsselt Firmware, die Sie bereits haben, auf diesem Computer: ein vollständiges Flash-Abbild oder einen einzelnen 64-KB-Firmware-Slot. **Es wird keine Kamera verwendet**, das funktioniert also auch ohne angeschlossenes Gerät und in Browsern ohne USB-Zugriff. Die Datei wird hier gelesen und nie hochgeladen.',
  'intro.slots':
    'Liest die drei Firmware-Slots der Kamera — Slot A, Slot B und Recovery-Slot R — und zeigt, was jeder enthält, aus welchem die Kamera startet und was dieser Build damit tun kann, daneben die laufende Firmware und die Schlüssel des Geräts. Alles läuft lokal in Ihrem Browser. **Dieser Tab schreibt in den Flash-Speicher:** Er kann einen Slot aus einem entschlüsselten Image oder aus Rohdaten beschreiben und fragt vor jedem Schreibvorgang nach.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**WebUSB ist unter iOS und iPadOS nicht verfügbar,** daher kann dieses Gerät den Flash-Speicher einer Kamera nicht lesen.',
  'support.ios.body':
    'Safari unterstützt es nicht, und jeder Browser unter iOS muss WebKit verwenden, daher können auch Chrome und Firefox es hier nicht anbieten. Daran ändert keine Einstellung und keine Erweiterung etwas. Um eine Kamera auszulesen, verwenden Sie einen Desktop-Computer oder ein Android-Telefon mit USB-OTG-Kabel.',
  'support.noWebUsb.title': '**Dieser Browser kann nicht auf USB-Geräte zugreifen.**',
  'support.noWebUsb.body':
    'WebUSB ist in Chrome, Edge, Opera und anderen Chromium-Browsern unter Windows, macOS, Linux und Android verfügbar. Firefox und Safari haben beide abgelehnt, es zu unterstützen.',
  'support.noWebUsb.insecure':
    'Diese Seite wird außerdem nicht über eine sichere Verbindung ausgeliefert, was WebUSB schon für sich allein blockiert.',
  'support.insecure.title': '**Unsichere Verbindung.** WebUSB ist hier deaktiviert.',
  'support.insecure.body':
    'Öffnen Sie diese Seite über HTTPS oder von `http://localhost`. Eine einfache LAN-Adresse wie `http://192.168.1.10:8000` genügt nicht.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Den Tab **{tab}** können Sie trotzdem verwenden — er arbeitet nur mit einer Datei, die Sie auswählen, und braucht keinen USB-Zugriff.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Bereit.** Schließen Sie Ihre Seek-Kamera an und klicken Sie auf *{connect}*.',
  'support.fileProtocol':
    'Als lokale Datei geöffnet, daher merkt sich der Browser das Gerät nicht über ein Neuladen hinweg. Das ist unbedenklich.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Hinweis: {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Verbinden',
  'connect.actions': 'Geräteaktionen',
  'connect.connect': 'Gerät verbinden',
  'connect.change': 'Gerät wechseln',
  'connect.test': 'Verbindung testen',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Gerät vergessen',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Jedes Seek-Thermal-Gerät wird angeboten (USB-Hersteller `{vendor}`) — Compact, Compact PRO, Nano und so weiter. Wählen Sie Ihres in der Geräteauswahl des Browsers aus.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Hinweise zu den Plattformen',
  'platform.macos':
    'Funktioniert ohne Weiteres in Chrome, Edge oder jedem Chromium-Browser. Keine Treiberinstallation, keine Administratorrechte. Beenden Sie vorher jedes andere Programm, das bereits mit der Kamera kommuniziert — die USB-Schnittstelle kann jeweils nur ein Prozess belegen.',
  'platform.linux.access':
    'Geben Sie Ihrem Benutzer Zugriff auf das Gerät, ziehen Sie es dann ab und stecken Sie es wieder ein:',
  'platform.linux.sandbox':
    'Chromium aus Snap oder Flatpak ist oft per Sandbox von direktem USB-Zugriff abgeschnitten; das `.deb`- oder `.rpm`-Paket ist die zuverlässige Wahl.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Unter Windows muss der WinUSB-Treiber an die Kamera gebunden sein, bevor irgendein Browser sie erreichen kann. Verwenden Sie <zadig>Zadig</zadig>: *Options → List All Devices*, wählen Sie dann in der Auswahlliste den Eintrag, der nach Ihrer Kamera benannt ist — zum Beispiel `CompactPRO FF` —, wählen Sie **WinUSB** als Treiber und klicken Sie auf Replace Driver. Erscheint Ihre Kamera mehrfach, nehmen Sie den Eintrag mit *(Interface 0)*. Damit ist das Gerät für die Herstellersoftware nicht mehr nutzbar, bis Sie die Änderung im Geräte-Manager rückgängig machen (*Gerät deinstallieren → Treiber löschen*, dann neu anstecken).',
  'platform.android':
    'Funktioniert in Chrome für Android mit einem USB-OTG-Kabel, sofern das Telefon die Kamera über USB mit Strom versorgen kann. Android gewährt den USB-Zugriff über einen eigenen Berechtigungsdialog. Der Download landet wie jede andere Datei in Ihrem Download-Ordner.',
  'platform.ios.name': 'iPhone und iPad',
  'platform.ios.cannot':
    '**Kann keine Kamera lesen**, und daran wird sich nichts ändern. Safari unterstützt WebUSB nicht, und unter iOS und iPadOS muss jeder Browser — auch Chrome und Firefox — mit WebKit darstellen, daher bietet keiner von ihnen diese Schnittstelle an. Es gibt keine Einstellung, keine Erweiterung und keine App, die das umgeht. Verwenden Sie zum Auslesen einen Desktop-Computer oder ein Android-Telefon.',
  'platform.ios.decrypt':
    'Das optionale Entschlüsseln funktioniert hier: Ein vorhandenes Flash-Abbild zu entschlüsseln braucht keinen USB-Zugriff, das geht also auf einem iPhone oder iPad oder mit Firefox und Safari auf dem Desktop.',
} satisfies Translation<'app', 'de'>;
