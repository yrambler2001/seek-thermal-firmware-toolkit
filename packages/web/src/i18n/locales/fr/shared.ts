/**
 * Namespace `shared`, français (fr), translated from the English source.
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
  'runPanel.percent': '{value} %',
  'runPanel.progressLabel': 'Progression : {label}',
  'runPanel.logLabel': 'Journal : {label}',
  /* {count} older lines dropped from the top of a long log. */
  'runPanel.trimmed': {
    one: '… {count} ligne plus ancienne supprimée',
    many: '… {count} lignes plus anciennes supprimées',
    other: '… {count} lignes plus anciennes supprimées',
  },
  'runPanel.lineCount': { one: '{count} ligne', many: '{count} lignes', other: '{count} lignes' },

  /* Status lines several panels set. */
  'status.idle': 'En attente.',
  'status.cancelled': 'Annulé.',
  'status.cancelling': 'Annulation…',
  'status.failedSeeLog': 'Échec — voir le journal ci-dessus.',

  /* lib/camera-lock: another tab holds the camera. */
  'cameraLock.inUseElsewhere':
    'La caméra est utilisée dans un autre onglet ou une autre fenêtre — terminez ou fermez d’abord là-bas.',

  /* lib/backup-save: shown after core's plan sentence on a write's confirmation. */
  'backup.downloadNote': 'Le zip est téléchargé automatiquement, avant tout envoi.',

  /* useDevice: the connection line when no camera is held. */
  'device.none': 'Aucun appareil sélectionné.',
  'device.disconnected': 'Appareil déconnecté.',
  'device.revoked': 'Autorisation retirée.',
  'device.unknownProduct': 'produit inconnu',
  'device.unknownVendor': 'fabricant inconnu',

  /*
   * lib/hints: what to do about an error. Shown on the page (a refusal) and
   * written to the run log in English (tEnglish). Zadig's menu and button names
   * (Options → List All Devices, Replace Driver), "WinUSB", "udev" and the
   * rule file stay English: they are what the program and the system show.
   */
  'hint.udev':
    'Sous Linux, la caméra a besoin d’une règle udev avant que le navigateur puisse l’ouvrir :\n\n{rule}\n\nDébranchez ensuite la caméra et rebranchez-la. Les versions Snap et Flatpak de Chromium sont souvent isolées des périphériques USB bruts ; la version .deb ou .rpm est la plus fiable.',
  'hint.windows':
    'Sous Windows, le pilote WinUSB doit être associé à la caméra avant qu’un navigateur puisse l’atteindre. Utilisez Zadig (https://zadig.akeo.ie/) : Options → List All Devices, choisissez l’entrée qui porte le nom de votre caméra — par exemple « CompactPRO FF » —, choisissez WinUSB et cliquez sur Replace Driver.',
  'hint.holding':
    'Un autre programme ou un pilote du système tient la caméra — un seul processus à la fois peut tenir l’interface USB. Quittez tout ce qui communique avec elle, puis débranchez la caméra et rebranchez-la.',
  'hint.recipientFallback':
    'Ou réglez recipient sur « device » dans les options de lecture : ce mode n’a pas besoin de réserver l’interface.',
  /* "Options" is the 4.x/Nano tab's fold-out (v4:options.title): use the same word as there. */
  'hint.optionsInvalid':
    'Ouvrez « Options » et lisez la note sous les champs pour connaître la plage de chacun.',
  'hint.usbTimeout':
    'La caméra a accepté la requête mais n’a jamais répondu. Débranchez-la et rebranchez-la, puis essayez un chunk plus petit (64 est la valeur qui fonctionne partout).',
  'hint.usbStalled':
    'La caméra a rejeté la requête. Cela signifie en général que son firmware ne la prend pas en charge. La page demande à la caméra quelle est sa famille avant toute lecture : des requêtes rejetées à répétition ont donc été faites pour la famille que la caméra a elle-même annoncée. Vérifiez la version du firmware dans l’onglet Infos.',
  'hint.usbNotOpen':
    'Un autre programme ou un pilote du système tient la caméra. Fermez-le, ou réglez recipient sur « device » dans les options de lecture : ce mode n’a pas besoin de réserver l’interface.',
  'hint.usbTransferFailed': 'Débranchez la caméra et rebranchez-la, puis réessayez.',
  'hint.deviceMode':
    'La caméra n’a pas voulu quitter le mode imagerie. Débranchez-la, attendez qu’elle soit complètement éteinte, puis rebranchez-la.',
  'hint.deviceWindow':
    'La table des sélecteurs de cette famille ne correspond pas à la caméra. Dans l’onglet 4.x/Nano, ouvrez Options et lancez « Extraire tous les sélecteurs » pour voir ce que la caméra expose réellement.',
  'hint.deviceVersionUnknown':
    'Rien qui puisse modifier la caméra n’a été envoyé. Débranchez-la, rebranchez-la, laissez-la finir de démarrer et réessayez ; une caméra qui annonce sa version de firmware est lue normalement.',
  'hint.imageMalformed': 'Le fichier n’est pas une image de firmware Seek déchiffrée.',
  'hint.imageUnsupported': 'Cette image ne peut pas être préparée pour la caméra telle quelle.',
  'hint.imageKeyTable':
    'L’image ne contient pas la paire de clés que son nom de fichier annonce. Utilisez le fichier déchiffré exactement tel que le dump l’a écrit, nom compris.',
  'hint.flashRefused': 'Rien n’a été écrit dans la caméra.',
  'hint.familyUnsupported':
    'Rien n’a été lu ni écrit. Chaque onglet couvre une plage de versions de firmware : les caméras 0.x et 1.x relèvent de « Extraire et déchiffrer 0.x/1.x », les caméras 4.x et Nano de « Extraire et déchiffrer 4.x/Nano ». L’onglet Infos indique l’onglet qui convient à la caméra.',
  'hint.firmwareTooOld':
    'Aucune famille de firmware ne peut lire ce build ici : son firmware n’a pas de gestionnaire de lecture pour la commande avec laquelle cet onglet lit la flash, donc rien qui puisse être mal interprété ne lui a été envoyé. Une Compact en 0.7.0.7 ou 0.7.0.8 peut être lue dans « Extraire et déchiffrer 0.x/1.x ». Un dump fait avec un programmateur SPI ou par SWD/J-Link peut quand même être déchiffré sur cette page, dans « Déchiffrer fichier/emplacement ».',
  'hint.powerCycle':
    'Dans cet assistant : débranchez la caméra et rebranchez-la, appuyez sur « Connecter l’appareil » et choisissez-la, puis relancez la même étape. L’exécution est toujours chargée ici — il n’y a rien à reprendre.',

  /* components/DeviceInfoPanel: what a read found. Bank names ("slot A") come from core. */
  'deviceInfo.running': 'Firmware en cours',
  'deviceInfo.version': 'Version',
  'deviceInfo.family': 'Famille de firmware',
  'deviceInfo.build': 'Build',
  'deviceInfo.bootloader': 'Bootloader',
  'deviceInfo.platform': 'Plateforme',
  'deviceInfo.serial': 'N° de série',
  'deviceInfo.usbLink': 'Liaison USB',
  /** Row label: the boot-config word (cfg[0]) and what it means. */
  'deviceInfo.bootConfig': 'Config. de démarrage',
  'deviceInfo.bootedFrom': 'Démarrée depuis',
  'deviceInfo.nextStart': 'Prochain démarrage',
  'deviceInfo.upgradeTarget': 'Cible de mise à jour (sa propre mise à jour)',
  'deviceInfo.bankAt': '{bank} à {address}',
  'deviceInfo.perDeviceKey': 'Clé propre à l’appareil',
  'deviceInfo.notProgrammed': 'non programmée — la caméra se rabat sur la clé B',
  'deviceInfo.keysTitle': 'Clés lues sur cette caméra',
  'deviceInfo.foundAt': 'Trouvée à',
  'deviceInfo.flashOffset': 'décalage {offset} dans la flash',
  /** Row label: the name of the camera's first AES key ("Key A"), as core names it (core:keyName.keyA). */
  'deviceInfo.keyA': 'Clé A',
  /** Row label: the second key ("Key B"), as core names it (core:keyName.keyB). */
  'deviceInfo.keyB': 'Clé B',
  /* {banks} is one bank name or several joined by common:list.and. */
  'deviceInfo.orphan': {
    one: '**{banks:ins} contient une image de firmware valide, chiffrée avec une clé que le bootloader de cette caméra ne connaît pas.** L’image est intacte et sa somme de contrôle est correcte, mais le bootloader n’essaie que {storeKey:acc} et la clé A quand il vérifie un emplacement : il l’ignore donc et démarre autre chose.',
    many: '**Ces emplacements contiennent une image de firmware valide, chiffrée avec une clé que le bootloader de cette caméra ne connaît pas : {banks:acc}.** L’image est intacte et sa somme de contrôle est correcte, mais le bootloader n’essaie que {storeKey:acc} et la clé A quand il vérifie un emplacement : il les ignore donc et démarre autre chose.',
    other:
      '**Ces emplacements contiennent une image de firmware valide, chiffrée avec une clé que le bootloader de cette caméra ne connaît pas : {banks:acc}.** L’image est intacte et sa somme de contrôle est correcte, mais le bootloader n’essaie que {storeKey:acc} et la clé A quand il vérifie un emplacement : il les ignore donc et démarre autre chose.',
  },
  'deviceInfo.orphanIsTarget':
    'C’est l’emplacement qu’écrit une mise à jour. L’application qui tourne sur cette caméra rechiffre avec cette clé inconnue : **écrire par cette page produira donc un autre emplacement que le bootloader ne peut pas démarrer** — la caméra continuera de fonctionner sur {bank:acc}. Le contournement consiste à écrire l’emplacement directement avec un programmateur SPI ou par SWD/J-Link.',
  /** deviceInfo.orphanIsTarget's {bank} when the booted bank has no name. A name: a translation may give
   * it case forms ('deviceInfo.otherBank:gen'), like common:bank.*. */
  'deviceInfo.otherBank': 'l’autre emplacement',
  'deviceInfo.otherBank:acc': 'l’autre emplacement',
  'deviceInfo.otherBank:gen': 'de l’autre emplacement',
  'deviceInfo.otherBank:dat': 'à l’autre emplacement',
  'deviceInfo.otherBank:loc': 'dans l’autre emplacement',
  'deviceInfo.otherBank:ins': 'L’autre emplacement',
} satisfies Translation<'shared'>;
