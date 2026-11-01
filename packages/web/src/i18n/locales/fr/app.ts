/**
 * Namespace `app`, français (fr), translated from the English source: the shell.
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
  'header.cameraSelected': 'Caméra sélectionnée',
  'header.noCamera': 'Aucune caméra sélectionnée',
  /** A badge in the header: this browser cannot use USB (no WebUSB). */
  'header.usbUnavailable': 'USB indisponible',
  'header.github': 'La boîte à outils sur GitHub',
  'header.tabs': 'Onglets',

  /* ---- tabs (lib/routing.ts) ---- */
  'tab.info': 'Infos',
  'tab.preserve': 'Extraire et déchiffrer 0.x/1.x',
  'tab.v4': 'Extraire et déchiffrer 4.x/Nano',
  'tab.decrypt': 'Déchiffrer fichier/emplacement',
  'tab.slots': 'Emplacements du firmware',
  /** The browser tab's title; `{tab}` is one of the labels above. */
  documentTitle: 'Firmware Seek Thermal — {tab} (WebUSB)',

  /* ---- theme switch (ThemeSwitch.tsx, lib/theme.ts) ---- */
  'theme.label': 'Thème sombre',
  'theme.followsSystem': 'Suit le réglage clair ou sombre de votre système',
  'theme.chosenDiffers': 'Choisi ici. Revenez en arrière pour suivre le réglage de votre système.',
  'theme.chosenSame': 'Choisi ici, identique au réglage actuel de votre système',

  /* ---- language switch (LanguageSwitch.tsx) ---- */
  'language.label': 'Langue',

  /* ---- the paragraph under the header, one per tab ---- */
  'intro.info':
    'Lit la caméra connectée comme le fait `seek-fw info` : son firmware, la famille sous laquelle elle répond, sa façon de démarrer, ses clés et chaque emplacement. Indique lequel des autres onglets la prend en charge et explique simplement à quoi sert chaque onglet. **Cet onglet n’écrit rien dans la mémoire flash.**',
  'intro.preserve':
    'Pour les caméras **0.x et 1.x** (les builds de 2014 et 2016). Fait une copie **complète** de la mémoire flash de 4 Mo de la caméra — y compris les parties qu’un dump normal ne peut pas atteindre — puis remet la caméra exactement dans l’état où elle était. Il sauvegarde ce qu’il peut lire, modifie brièvement le firmware pour pouvoir lire le reste, extrait tout, restaure l’original et le vérifie. Tout s’exécute localement dans votre navigateur. **Deux des étapes écrivent dans la mémoire flash**, et chacune vous demande d’abord votre accord.',
  'intro.v4':
    'Fait une copie en lecture seule de la mémoire flash SPI de 4 Mo d’une caméra **4.x ou Nano** via WebUSB et déchiffre les images de firmware qu’elle y trouve. Tout s’exécute localement dans votre navigateur — rien n’est envoyé nulle part. **Lecture seule :** cet onglet n’envoie aucune commande d’écriture, d’effacement, de téléversement, de validation ou de réinitialisation de la flash. Une caméra d’une autre lignée de firmware est refusée avant toute lecture.',
  'intro.decrypt':
    'Déchiffre, sur cet ordinateur, un firmware que vous avez déjà : un dump complet de la mémoire flash, ou un seul emplacement de firmware de 64 Ko. **Aucune caméra n’est utilisée** : cela fonctionne sans rien de branché, et dans les navigateurs sans accès USB. Le fichier est lu ici et n’est jamais envoyé.',
  'intro.slots':
    'Lit les trois emplacements de firmware de la caméra — emplacement A, emplacement B et emplacement de secours R — et montre ce que contient chacun, celui depuis lequel la caméra démarre et ce que ce build permet d’en faire, avec à côté le firmware en cours et les clés de l’appareil. Tout s’exécute localement dans votre navigateur. **Cet onglet écrit dans la mémoire flash :** il peut écrire un emplacement à partir d’une image déchiffrée ou d’octets bruts, et demande confirmation avant chaque écriture.',

  /* ---- support banner (lib/support.ts) ---- */
  'support.ios.title':
    '**WebUSB n’est pas disponible sur iOS ni sur iPadOS,** cet appareil ne peut donc pas lire la mémoire flash d’une caméra.',
  'support.ios.body':
    'Safari ne l’implémente pas, et tout navigateur iOS est obligé d’utiliser WebKit : Chrome et Firefox ne peuvent donc pas non plus le proposer ici. Aucun réglage ni aucune extension n’y change rien. Pour faire le dump d’une caméra, utilisez un ordinateur de bureau ou un téléphone Android avec un câble USB-OTG.',
  'support.noWebUsb.title': '**Ce navigateur ne peut pas accéder aux périphériques USB.**',
  'support.noWebUsb.body':
    'WebUSB est disponible dans Chrome, Edge, Opera et les autres navigateurs Chromium sous Windows, macOS, Linux et Android. Firefox et Safari ont tous deux refusé de l’implémenter.',
  'support.noWebUsb.insecure':
    'De plus, cette page n’est pas servie par une connexion sécurisée, ce qui suffit à bloquer WebUSB.',
  'support.insecure.title': '**Connexion non sécurisée.** WebUSB est désactivé ici.',
  'support.insecure.body':
    'Ouvrez cette page en HTTPS ou depuis `http://localhost`. Une simple adresse de réseau local comme `http://192.168.1.10:8000` ne convient pas.',
  /** `{tab}` is app:tab.decrypt. */
  'support.offlineStillWorks':
    'Vous pouvez quand même utiliser l’onglet **{tab}** — il travaille uniquement sur un fichier que vous choisissez et n’a besoin d’aucun accès USB.',
  /** `{connect}` is app:connect.connect, the button's own label. */
  'support.ready': '**Prêt.** Branchez votre caméra Seek et appuyez sur *{connect}*.',
  'support.fileProtocol':
    'Ouverte comme fichier local : le navigateur ne retiendra pas l’appareil d’un rechargement à l’autre. C’est sans conséquence.',

  /* ---- unlock note (UnlockNote.tsx) ---- */
  /** `{note}` is core:unlock.powerCycleNote. */
  unlockNote: 'Remarque : {note}.',

  /* ---- Connect panel (ConnectSection.tsx) ---- */
  'connect.title': 'Connexion',
  'connect.actions': 'Actions sur l’appareil',
  'connect.connect': 'Connecter l’appareil',
  'connect.change': 'Changer d’appareil',
  'connect.test': 'Tester la connexion',
  /** Button: makes the browser forget its permission for the camera (USBDevice.forget()). */
  'connect.forget': 'Oublier l’appareil',
  /** `{vendor}` is the USB vendor id, 0x289d. */
  'connect.vendorNote':
    'Tous les appareils Seek Thermal sont proposés (fabricant USB `{vendor}`) — Compact, Compact PRO, Nano, etc. Choisissez le vôtre dans la fenêtre de sélection d’appareil du navigateur.',

  /* ---- platform notes (PlatformNotes.tsx) ----
   * Zadig has an English-only interface: keep its menu and button names
   * (Options → List All Devices, Replace Driver, WinUSB) in English. Device
   * Manager's own names follow Windows' language. */
  'platform.title': 'Notes par plateforme',
  'platform.macos':
    'Fonctionne directement dans Chrome, Edge ou tout navigateur Chromium. Aucun pilote à installer, aucun droit administrateur. Quittez d’abord tout autre programme qui communique déjà avec la caméra — un seul processus à la fois peut tenir l’interface USB.',
  'platform.linux.access':
    'Donnez à votre utilisateur l’accès à l’appareil, puis débranchez-le et rebranchez-le :',
  'platform.linux.sandbox':
    'Les versions Snap et Flatpak de Chromium sont souvent isolées des périphériques USB bruts ; la version `.deb` ou `.rpm` est la plus fiable.',
  /** `<zadig>…</zadig>` becomes the link to zadig.akeo.ie. */
  'platform.windows':
    'Sous Windows, le pilote WinUSB doit être associé à la caméra avant qu’un navigateur puisse l’atteindre. Utilisez <zadig>Zadig</zadig> : *Options → List All Devices*, puis dans la liste déroulante choisissez l’entrée qui porte le nom de votre caméra — par exemple `CompactPRO FF` —, choisissez **WinUSB** comme pilote et cliquez sur Replace Driver. Si votre caméra apparaît plusieurs fois, prenez l’entrée marquée *(Interface 0)*. L’appareil n’est alors plus accessible au logiciel du fabricant tant que vous n’annulez pas ce changement dans le Gestionnaire de périphériques (*Désinstaller l’appareil → Supprimer le pilote*, puis rebranchez).',
  'platform.android':
    'Fonctionne dans Chrome pour Android avec un câble USB-OTG, à condition que le téléphone puisse alimenter la caméra par le bus. Android accorde l’accès USB par sa propre fenêtre d’autorisation. Le téléchargement arrive dans votre dossier Téléchargements comme n’importe quel fichier.',
  'platform.ios.name': 'iPhone et iPad',
  'platform.ios.cannot':
    '**Impossible de lire une caméra**, et cela ne changera pas. Safari n’implémente pas WebUSB, et sur iOS et iPadOS tout navigateur — y compris Chrome et Firefox — doit utiliser WebKit pour l’affichage : aucun d’eux ne propose donc cette API. Aucun réglage, aucune extension ni aucune app ne contourne cela. Pour faire un dump, utilisez un ordinateur de bureau ou un téléphone Android.',
  'platform.ios.decrypt':
    'Le déchiffrement facultatif fonctionne ici : déchiffrer un dump que vous avez déjà ne demande aucun accès USB, vous pouvez donc le faire depuis un iPhone ou un iPad, ou depuis Firefox et Safari sur ordinateur.',
} satisfies Translation<'app', 'fr'>;
