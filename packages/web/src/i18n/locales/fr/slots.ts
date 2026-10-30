/**
 * Namespace `slots`, français (fr), translated from the English source: the firmware-slots tab.
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
  'section.title': 'Emplacements du firmware',
  'section.badge': 'Écrit dans la flash',
  'section.description':
    'Lire les emplacements demande à la caméra ce qu’elle exécute, lit ses trois emplacements de firmware — {a}, {b} et {r} — et montre ce que contient chacun. Lire et extraire ne changent rien. Un bouton d’écriture demande confirmation avant l’envoi du moindre octet.',
  /* The red warning at the top of the tab. */
  'section.danger':
    '**Cette page peut écrire dans la mémoire flash de la caméra.** Une écriture efface un emplacement de 64 Ko et le reprogramme. Une image structurellement valide mais qui ne fonctionne pas rend la caméra impossible à démarrer, et le bootloader n’a pas d’USB — seul SWD/J-Link ou un programmateur SPI permet alors de la récupérer. Extrayez d’abord l’emplacement et gardez le fichier.',

  /* The buttons under the warning; toolbar is the group's accessible name. */
  'actions.toolbar': 'Actions sur les emplacements',
  'actions.read': 'Lire les emplacements',
  /* The run panel's name (its progress bar and log are "Slots progress", "Slots log"). */
  'run.label': 'Emplacements',

  /* Before any read. */
  'empty.connected':
    'Appuyez sur Lire les emplacements. La caméra est d’abord interrogée sur le build qu’elle exécute, et rien n’est ouvert sur un build que cette page ne prend pas en charge.',
  'empty.disconnected': 'Connectez la caméra, puis appuyez sur Lire les emplacements.',

  /* A build the page does not support; core's reason follows it. */
  'unsupported.title':
    'Ce build n’est pas pris en charge ici : aucun emplacement n’a été lu et aucun ne peut être écrit.',

  /* The refusal box. "Armed" = a camera window opened for a read or a write. */
  'refusal.notIdentified.title':
    'Non identifiée : cette page ne peut pas savoir quel build la caméra exécute.',
  'refusal.notIdentified.body':
    'La caméra n’a donné aucune version de firmware utilisable : aucun emplacement n’a été lu et rien n’a été ouvert. Cette page couvre les builds {minVersion} et plus récents. Les builds antérieurs à {minVersion} sont hors de ce que la page des emplacements prend en charge : une caméra qui en exécute un n’est jamais lue ici.',
  /* {hint} is the advice for a camera that is still starting up (shared:hint.deviceVersionUnknown). */
  'refusal.notIdentified.hint':
    'Si la caméra exécute un build pris en charge, elle est peut-être seulement en train de démarrer. {hint}',
  'refusal.title': 'Refusé — rien n’a été ouvert.',

  /* The status line of the run panel. "..." stays three dots, as English has it. */
  'status.reading': 'Lecture…',
  'status.readingAgain': 'Nouvelle lecture des emplacements…',
  /* {count} banks in all, {read} of them read. */
  'status.read': {
    one: 'Lu. {read}/{count} emplacement lu.',
    many: 'Lu. {read}/{count} emplacements lus.',
    other: 'Lu. {read}/{count} emplacements lus.',
  },
  'status.unsupported': 'Non pris en charge sur ce build — aucun emplacement n’a été lu.',
  'status.refused': 'Refusé — rien n’a été ouvert. Voir le message sous le journal.',
  'status.disconnected': 'Appareil déconnecté — relisez les emplacements.',
  'status.newDevice': 'Nouvel appareil sélectionné — relisez les emplacements.',
  'status.dumping': 'Extraction {bank:gen}…',
  'status.dumped': 'Extraction {bank:gen} terminée.',
  'status.readingImage': 'Lecture de l’image…',
  'status.ready': 'Prêt — vérifiez le plan, puis lancez l’écriture.',
  'status.rejected': 'Rejeté — voir le journal ci-dessus.',
  'status.writing': 'Écriture…',
  'status.patching': 'Correction {bank:gen}…',
  'status.patchingEvery': 'Correction de tous les emplacements…',
  /* After a write: how it ended. The result panel says what to do next. */
  'status.written.mismatch': 'Écrit, mais la relecture ne correspond pas — voir le résultat.',
  'status.written.verified': 'Écrit. L’emplacement se relit tel qu’il a été écrit.',
  'status.written.notCompared': 'Écrit. La relecture n’a pas été comparée — voir le résultat.',
  /* After a frame-rate patch. */
  'status.patched.unexpected':
    'Corrigé, mais la relecture ne diffère pas seulement comme prévu — voir le résultat.',
  'status.patched.ok': 'Corrigé. L’emplacement se relit comme prévu.',
  'status.patched.unchecked': 'Corrigé. La relecture n’a pas été vérifiée — voir le résultat.',
  /* After "Make N FPS in every bank"; {count} is the number of banks patched. */
  'status.every.stopped': {
    one: 'Arrêté {bank:dat} — {count} emplacement corrigé ; voir le résultat.',
    many: 'Arrêté {bank:dat} — {count} emplacements corrigés ; voir le résultat.',
    other: 'Arrêté {bank:dat} — {count} emplacements corrigés ; voir le résultat.',
  },
  'status.every.unchecked': {
    one: '{count} emplacement corrigé, mais une relecture n’a pas été vérifiée comme prévu — voir le résultat.',
    many: '{count} emplacements corrigés, mais une relecture n’a pas été vérifiée comme prévu — voir le résultat.',
    other:
      '{count} emplacements corrigés, mais une relecture n’a pas été vérifiée comme prévu — voir le résultat.',
  },
  'status.every.ok': {
    one: '{count} emplacement corrigé. Il se relit comme prévu.',
    many: '{count} emplacements corrigés. Chacun se relit comme prévu.',
    other: '{count} emplacements corrigés. Chacun se relit comme prévu.',
  },
  /*
   * After a cancel. Also written to the run log, in English. {bank} and each name in {banks} are the bank's
   * name on its own (common:bank.slot / bank.recovery: "Slot A", "Recovery R"), as English has always
   * written them here; {banks} is joined by common:list.and.
   */
  'status.cancelled.nothing': 'Annulé — rien n’a été écrit.',
  'status.cancelled.one':
    'Annulé après l’envoi de la validation {bank:gen} — l’emplacement est peut-être partiellement écrit. Relisez-le avant de vous y fier.',
  'status.cancelled.many':
    'Annulé après l’envoi des validations {banks:gen} — chacun est peut-être partiellement écrit. Relisez-les avant de vous y fier.',

  /* Why a bank's button is off, shown under it. */
  'gate.connectFirst': 'Connectez d’abord la caméra.',
  'gate.busy': 'Une autre opération est en cours — attendez qu’elle se termine.',
  'gate.readFirst': 'Lisez d’abord les emplacements.',
  'gate.cameraRefused':
    'Cette caméra ne peut pas être écrite d’ici, pour la raison indiquée dans le bandeau ci-dessus. Rien n’est envoyé.',
  /* {reason} is core's reason the bank was not read. */
  'gate.notRead': 'Non lu : {reason}. Relisez les emplacements avant de l’écrire.',
  'gate.notReadNoReason':
    'Non lu : cet emplacement n’a pas été lu. Relisez les emplacements avant de l’écrire.',
  'gate.emptyNotWritable':
    'Cet emplacement est vide et ne peut pas être écrit sur ce build : {reason}',
  'gate.noSuchBank': 'Ce build n’a pas cet emplacement.',

  /* The bank table. */
  'table.caption':
    'Chaque emplacement de firmware de cette caméra — {a}, {b} et {r} — tel que lu et vérifié dans le navigateur',
  'table.col.bank': 'Emplacement',
  'table.col.firmware': 'Firmware',
  'table.col.size': 'Taille',
  'table.col.key': 'Clé',
  'table.col.bootable': 'Démarrable',
  'table.col.sha': 'SHA-256 en clair',
  'table.col.actions': 'Actions',
  /* The Firmware cell. {reason} is core's. */
  'table.notRead': 'non lu — {reason}',
  'table.notReadNoReason': 'non lu — l’emplacement n’a pas été lu',
  /* A badge: the bank holds no image. */
  'table.empty': 'vide',
  'table.emptyNote':
    'Aucune image : la fenêtre d’en-tête de cet emplacement se lit entièrement comme 0xFF, rien n’en est donc déchiffré, et l’écrire n’écrase aucun firmware.',
  /* {why} and {reason} are core's. */
  'table.emptyWritable': 'Peut être écrit. {why}',
  'table.emptyNotWritable': 'Ne peut pas être écrit sur ce build : {reason}',
  'table.unknownVersion': 'version inconnue',
  /* {id} is the image id in hex. */
  'table.imageId': 'image {id}',
  'table.noImage': 'aucune image',
  /* {size} is a byte count, already formatted. */
  'table.bankSize': 'emplacement de {size} o',
  'table.imageSize': 'image de {size} o',
  /* The Key cell of a bank stored without a key. */
  'table.keyNone': 'aucune (en clair)',
  /* The Bootable cell. The text after "—" says why. */
  'table.boot.empty': '— rien à démarrer',
  'table.boot.bootable': 'démarrable — le bootloader l’accepte',
  'table.boot.notBootable': 'non démarrable — ignoré au démarrage',
  'table.boot.recoveryOnly':
    'secours uniquement — {letterR} démarre quand {letterA} et {letterB} ne contiennent rien que le bootloader accepte (mesuré sur une caméra pour une forme antérieure de cette image) ; le démarrage de cette forme n’est pas testé',
  /* {why} is core's reason the verdict is unknown on this camera. */
  'table.boot.unknown': 'inconnu — {why}',
  /* The row's buttons. */
  'table.dump': 'Extraire',
  'table.flashPlain': 'Écrire l’image déchiffrée…',
  'table.flashRaw': 'Écrire des octets bruts…',
  'table.restore': 'Restaurer depuis une sauvegarde complète (.bin ou .zip)…',
  'table.makeFps': 'Passer à {hz} FPS',
  /* {bank} is the target bank inside a sentence ("Copy to slot A"). */
  'table.copyTo': 'Copier vers {bank:acc}',
  /* Why one copy button is off: {button} is its label (table.copyTo), {reason} why. */
  'table.copyOff': '{button} : {reason}',
  'table.copyOffNoReason': '{button} : désactivé',
  'table.copyNote':
    'Copie le firmware que contient cet emplacement, tel que cette lecture l’a déchiffré, dans l’emplacement que vous choisissez, quel que soit son contenu actuel. Vous vérifiez le plan avant tout envoi.',
  'table.restoreNote':
    'Choisissez une sauvegarde complète de la flash : un .bin (une image complète de 4 Mo de la flash, comme une lecture J-Link) ou un .zip qui en contient une (un fichier d’exécution Preserve, ou le zip qu’enregistre « Extraire et déchiffrer 4.x/Nano » ou « Extraire tous les sélecteurs »). Cet emplacement en est extrait, déchiffré et présenté sous forme de plan avant tout envoi.',
  'table.fpsNote':
    'Fait passer cet emplacement de {fromHz} Hz à {toHz} Hz en modifiant ses octets. L’emplacement est d’abord enregistré, dans un zip téléchargé, et le fichier déchiffré qu’il contient permet de revenir en arrière.',
  /*
   * The extra confirmation a write to this bank asks for. {booted} is core's word for the booted bank
   * ("Booted now", the badge's word with a capital), translated by core's messages.
   */
  'table.risk.bootedRecovery':
    '{booted}, et de secours : son écriture demande une confirmation supplémentaire.',
  'table.risk.booted': '{booted} : son écriture demande une confirmation supplémentaire.',
  'table.risk.recovery': '{bank} : son écriture demande une confirmation supplémentaire.',
  'table.risk.bootUnnamed':
    'La caméra n’indique pas son emplacement démarré : son écriture demande une confirmation supplémentaire.',

  /* Why a bank offers no frame-rate patch (or that it needs none). {hz} is a frame rate. */
  'fps.applied': 'Correctif de fréquence d’images appliqué : cette image tourne à {hz} Hz.',
  'fps.earlierPatch':
    'Correctif de fréquence d’images non proposé : cet emplacement contient un ancien correctif {hz} Hz sans la correction USB. Restaurez l’image d’origine, puis utilisez Passer à {hz} FPS.',
  'fps.atRate':
    'Aucun correctif de fréquence d’images nécessaire : ce build tourne déjà à {hz} Hz.',
  /* {reason} is core's, or fps.readFirst. */
  'fps.notOffered': 'Correctif de fréquence d’images non proposé : {reason}',
  'fps.readFirst':
    'lisez d’abord les emplacements — le correctif est préparé à partir de l’image de l’emplacement lui-même',

  /* "Make N FPS in every bank", beside the table. */
  'everyBank.toolbar': 'Tous les emplacements',
  'everyBank.make': 'Passer tous les emplacements à {hz} FPS',
  'everyBank.faster': 'Accélérer tous les emplacements',
  /*
   * {order} is the banks' names on their own (common:bank.slot / bank.recovery: "Slot B, then Recovery R,
   * then Slot A"), joined by common:list.then.
   */
  'everyBank.note':
    'Corrige, en une seule confirmation et dans cet ordre : {order}. Chacun est d’abord enregistré, dans un seul zip téléchargé, puis relu.',
  'everyBank.noteBootedLast':
    'Corrige, en une seule confirmation et dans cet ordre : {order} ; l’emplacement depuis lequel la caméra démarre actuellement passe en dernier. Chacun est d’abord enregistré, dans un seul zip téléchargé, puis relu.',

  /* What is written, shown in the plan and the confirmation: a copy of another bank, a bank cut out of a backup file. */
  'what.copy': 'l’image {bank:gen}',
  'what.restore': '{bank:acc} de {file}',

  /* The plan of a prepared write ("Prepared for Slot A at 0x14050000"). */
  'preview.title': 'Préparé pour {bank:acc} à {address}',
  'preview.file': 'Fichier',
  'preview.source': 'Image prise dans',
  'preview.target': 'Cible',
  'preview.targetEmpty':
    '{bank:ins} est vide : il ne contient aucune image, cette écriture n’écrase donc aucun firmware',
  'preview.readAs': 'Lu comme',
  'preview.readAs.ff': 'une image FF {version} déchiffrée',
  'preview.readAs.plain': 'une image déchiffrée',
  /** Value of "Read as": the picked file is taken as the bank's raw bytes, not decrypted. */
  'preview.readAs.raw': 'octets bruts',
  /** Row label: how the image is encrypted for the upload (core's words follow). */
  'preview.staging': 'Transfert',
  'preview.key': 'Clé',
  'preview.payload': 'Données',
  /* {size} bytes sent in {count} USB commands of at most {chunk} bytes each. */
  'preview.payloadValue': {
    one: '{size} o en {count} bloc de {chunk} o au plus',
    many: '{size} o en {count} blocs de {chunk} o au plus',
    other: '{size} o en {count} blocs de {chunk} o au plus',
  },
  'preview.checksum': 'Somme de contrôle du transfert',
  /** Row label: what the bank should hold after the write. */
  'preview.stored': 'Stocké ensuite',
  'preview.storedNotPredicted': 'non prévu — la relecture sert de vérification',
  'preview.storedPredicted': '{size} o prévus',
  'preview.storedKeyB': '{size} o prévus — l’image XOR la clé B, pas les données elles-mêmes',
  'preview.savedFirst': 'Enregistré d’abord',
  'preview.compareCaption': 'Ce qui change {bank:loc}',
  'preview.col.field': 'Champ',
  'preview.col.now': 'Maintenant',
  'preview.col.after': 'Après l’écriture',
  'preview.readFirst': 'À lire avant d’écrire :',
  /* {note} is core's note about this write. */
  'preview.note': 'Remarque : {note}',
  'preview.nothingSent':
    'Rien n’a encore été envoyé à la caméra. L’écriture envoie ces données {bank:dat} et les valide.',
  'preview.toolbar': 'Actions d’écriture pour {bank:acc}',
  'preview.write': 'Écrire dans {bank:acc}…',
  'preview.discard': 'Abandonner',

  /* The write's confirmation dialog. {what} is a file name or what.copy / what.restore. */
  'writeConfirm.title': 'Écrire {what} dans {bank:acc} à {address} ?',
  /* {bootsNow} is core's sentence "Slot A is the bank the camera boots now", translated by core's messages. */
  'writeConfirm.booted':
    '{bootsNow}. L’écrire remplace le firmware que la caméra exécute en ce moment. Si la nouvelle image ne fonctionne pas, la caméra risque de ne plus démarrer du tout.',
  'writeConfirm.recovery':
    '{bank:ins} est l’emplacement de secours, la copie de dernier recours sur laquelle le bootloader se rabat. L’écrire laisse la caméra sans cette copie jusqu’à ce qu’elle soit restaurée.',
  'writeConfirm.bootUnnamed':
    'La caméra n’indique pas depuis quel emplacement elle démarre : {bank:acc} est donc traité comme l’emplacement démarré. L’écrire peut remplacer le firmware que la caméra exécute.',
  'writeConfirm.empty':
    '{bank:ins} est vide : il ne contient aucune image, aucun firmware n’est donc écrasé.',
  'writeConfirm.eraseEmpty':
    'L’écriture efface quand même le bloc de 64 Ko de la mémoire flash de la caméra situé {bank:dat} (déjà vierge) et le reprogramme.',
  'writeConfirm.erase':
    'Ceci efface un bloc de 64 Ko de la mémoire flash de la caméra et le reprogramme {bank:dat}.',
  /* {key} is core's line naming the key and the bank it was derived from. */
  'writeConfirm.keyLine':
    'L’image est écrite sous {key}. Tous les autres emplacements sont écrits de la même façon.',
  'writeConfirm.backup':
    'Avant tout envoi, {bank:acc} est relu et enregistré dans un seul zip téléchargé : {file}. Vérifiez qu’il se trouve dans votre dossier de téléchargements.',
  'writeConfirm.noReset':
    'Aucune réinitialisation n’est envoyée. Débranchez puis rebranchez la caméra ensuite pour que l’emplacement prenne effet.',
  'writeConfirm.noUsbRecovery':
    'Si l’image ne fonctionne pas, la caméra ne peut pas être récupérée par USB — seulement avec SWD/J-Link ou un programmateur SPI.',
  'writeConfirm.ackUnnamed':
    'Je comprends que la caméra n’indique pas depuis quel emplacement elle démarre, que celui-ci est donc traité comme l’emplacement démarré, et qu’une mauvaise image peut rendre la caméra impossible à démarrer.',
  'writeConfirm.confirm': 'Oui — écrire dans {bank:acc}',

  /* The tick box both write dialogs ask for before a risky bank. */
  'ack.booted':
    'Je comprends que c’est l’emplacement depuis lequel la caméra démarre actuellement, et qu’une mauvaise image peut rendre la caméra impossible à démarrer.',
  'ack.recovery':
    'Je comprends que c’est l’emplacement de secours, et qu’une mauvaise image laisse la caméra sans copie de dernier recours.',

  /* The frame-rate patch's confirmation dialog for one bank. */
  'fpsConfirm.title': 'Faire tourner {bank:acc} à {hz} FPS ?',
  /* {bootsNow}: see writeConfirm.booted. */
  'fpsConfirm.booted':
    '{bootsNow}. L’image corrigée remplace le firmware qu’elle exécute en ce moment.',
  'fpsConfirm.recovery':
    '{bank:ins} est l’emplacement de secours, la copie de dernier recours sur laquelle le bootloader se rabat.',
  'fpsConfirm.what':
    '{bank:ins} contient le firmware {version}, et ceci fait tourner son image à {toHz} Hz au lieu de {fromHz} Hz.',
  /* In place of a firmware version the camera did not give. */
  'fpsConfirm.unknownVersion': '(inconnu)',
  /* {count} bytes of the image change. */
  'fpsConfirm.bytes': {
    one: 'Le correctif modifie {count} octet de l’image ainsi que le mot de somme de contrôle, de sorte que la somme vérifiée par le bootloader reste la même. La paire de clés n’est pas touchée.',
    many: 'Le correctif modifie {count} octets de l’image ainsi que le mot de somme de contrôle, de sorte que la somme vérifiée par le bootloader reste la même. La paire de clés n’est pas touchée.',
    other:
      'Le correctif modifie {count} octets de l’image ainsi que le mot de somme de contrôle, de sorte que la somme vérifiée par le bootloader reste la même. La paire de clés n’est pas touchée.',
  },
  'fpsConfirm.wayBack':
    'Le fichier déchiffré de ce zip permet de revenir en arrière : pour annuler le correctif, écrivez-le avec « Écrire l’image déchiffrée » dans {bank:acc}.',
  'fpsConfirm.noReset':
    'Aucune réinitialisation n’est envoyée. Débranchez puis rebranchez la caméra ensuite pour que l’emplacement corrigé prenne effet.',
  'fpsConfirm.ackUnnamed':
    'Je comprends que la caméra n’indique pas depuis quel emplacement elle démarre, et que celui-ci est donc traité comme l’emplacement démarré.',
  'fpsConfirm.confirm': 'Oui — corriger {bank:acc}',

  /* The confirmation of "Make N FPS in every bank". {count} is the number of banks patched. */
  'fpsEvery.title': 'Faire tourner tous les emplacements à {hz} FPS ?',
  'fpsEvery.titleMixed': {
    one: 'Corriger la fréquence d’images de {count} emplacement ?',
    many: 'Corriger la fréquence d’images de {count} emplacements ?',
    other: 'Corriger la fréquence d’images de {count} emplacements ?',
  },
  'fpsEvery.intro': {
    one: 'Ceci corrige {count} emplacement où le correctif est disponible (firmware {version}) :',
    many: 'Ceci corrige {count} emplacements où le correctif est disponible (firmware {version}) :',
    other:
      'Ceci corrige {count} emplacements où le correctif est disponible (firmware {version}) :',
  },
  /* A bank's name and, when writing it asks for the tick, what it is. */
  'fpsEvery.role.bootedRecovery':
    '{bank} (l’emplacement depuis lequel cette caméra démarre actuellement, et l’emplacement de secours)',
  'fpsEvery.role.booted': '{bank} (l’emplacement depuis lequel cette caméra démarre actuellement)',
  'fpsEvery.role.recovery': '{bank} (l’emplacement de secours, la copie de dernier recours)',
  'fpsEvery.role.bootUnnamed':
    '{bank} (la caméra n’indique pas depuis quel emplacement elle démarre)',
  /* One bank's line. {count} bytes change. */
  'fpsEvery.offer': {
    one: '{bank} : de {fromHz} Hz à {toHz} Hz, {count} octet et le mot de somme de contrôle.',
    many: '{bank} : de {fromHz} Hz à {toHz} Hz, {count} octets et le mot de somme de contrôle.',
    other: '{bank} : de {fromHz} Hz à {toHz} Hz, {count} octets et le mot de somme de contrôle.',
  },
  /* A bank that is not patched, and why ({note} is fps.*). */
  'fpsEvery.other': '{bank} : {note}',
  /* {others} is one or more fpsEvery.other lines, joined by a space. */
  'fpsEvery.others': 'Laissés tels quels : {others}',
  'fpsEvery.orderOne': 'Il écrit {bank:acc} seul, puis le relit.',
  /* {order}: as in everyBank.note, the names on their own ("Slot B, then Recovery R"), joined by common:list.then. */
  'fpsEvery.order':
    'Ils sont écrits dans cet ordre : {order}. Chacun est relu avant le suivant, et le premier échec arrête les autres.',
  'fpsEvery.orderBootedLast':
    'Ils sont écrits dans cet ordre : {order}. L’emplacement depuis lequel la caméra démarre actuellement passe en dernier : un échec arrête donc tout avant lui. Chacun est relu avant le suivant, et le premier échec arrête les autres.',
  'fpsEvery.wayBack':
    'Les fichiers déchiffrés de ce zip permettent de revenir en arrière : pour annuler le correctif d’un emplacement, écrivez son fichier avec « Écrire l’image déchiffrée » dans cet emplacement.',
  'fpsEvery.noReset':
    'Aucune réinitialisation n’est envoyée. Débranchez puis rebranchez la caméra ensuite pour que les emplacements corrigés prennent effet.',
  /* {banks} are fpsEvery.role.* names joined by common:list.and. */
  'fpsEvery.ack':
    'Je comprends ce que cette opération écrit ({banks}), et qu’une mauvaise image peut rendre la caméra impossible à démarrer.',
  'fpsEvery.confirm': {
    one: 'Oui — corriger {count} emplacement',
    many: 'Oui — corriger {count} emplacements',
    other: 'Oui — corriger {count} emplacements',
  },

  /* The result panel after a write. {what} as in writeConfirm.title. */
  'outcome.verified': '{bank} — {what} : l’emplacement se relit tel qu’il a été écrit.',
  'outcome.mismatch': '{bank} — {what} : la relecture NE correspond PAS à ce qui a été écrit.',
  /* Null verdict: the read-back was taken, but core had no expected image to compare it with. */
  'outcome.notCompared':
    '{bank} — {what} : la relecture a été faite mais pas comparée, cette écriture n’est donc pas vérifiée ici.',
  /* {status} is a hex status code. */
  'outcome.commitStatus': 'La validation de la caméra a renvoyé l’état {status}.',
  'outcome.wasEmpty':
    '{bank:ins} était vide avant cette écriture : aucun firmware n’a donc été écrasé.',
  'outcome.provenVerified':
    'Prouvé à ce stade : les données ont été envoyées et validées, et l’emplacement se relit tel qu’il a été écrit. NON prouvé : que le bootloader choisira cet emplacement, ni que l’image fonctionne.',
  'outcome.provenCommitted':
    'Prouvé à ce stade : les données ont été envoyées et validées. NON prouvé : que le bootloader choisira cet emplacement, ni que l’image fonctionne.',
  'outcome.replug':
    '**DÉBRANCHEZ MAINTENANT LA CAMÉRA, PUIS REBRANCHEZ-LA.** Aucune réinitialisation n’a été envoyée : l’emplacement ne prend effet qu’après une vraie coupure d’alimentation. Relisez ensuite les emplacements : la version et l’emplacement actif annoncés par la caméra sont la seule preuve.',
  /* After a frame-rate patch. */
  'outcome.replugShort':
    '**DÉBRANCHEZ MAINTENANT LA CAMÉRA, PUIS REBRANCHEZ-LA.** Aucune réinitialisation n’a été envoyée. Relisez ensuite les emplacements.',
  /* The zip a write saved first. {file} is its name. */
  'outcome.savedFirst': 'Enregistré d’abord, en téléchargement : {file}.',
  'outcome.wayBackOne':
    'Le fichier déchiffré qu’il contient permet de revenir en arrière (« Écrire l’image déchiffrée » dans le même emplacement).',
  'outcome.wayBackMany':
    'Les fichiers déchiffrés qu’il contient permettent de revenir en arrière (« Écrire l’image déchiffrée » dans chaque emplacement).',
  'outcome.checkDownloads': 'Vérifiez qu’il se trouve dans votre dossier de téléchargements.',

  /* The result panel after a frame-rate patch. */
  'fpsOutcome.title': '{bank} — corrigé de {fromHz} Hz à {toHz} Hz (firmware {version}).',
  /* {count} bytes were planned to change. */
  'fpsOutcome.readBackOk': {
    one: 'La relecture ne diffère du dump enregistré qu’au {count} octet prévu, aux endroits modifiés et au mot de somme.',
    many: 'La relecture ne diffère du dump enregistré qu’aux {count} octets prévus, aux endroits modifiés et au mot de somme.',
    other:
      'La relecture ne diffère du dump enregistré qu’aux {count} octets prévus, aux endroits modifiés et au mot de somme.',
  },
  /* {unexpected} bytes changed that should not have, {count} that should have did not. */
  'fpsOutcome.readBackBad': {
    one: 'La relecture NE diffère PAS seulement comme prévu (octets inattendus : {unexpected} ; octet manquant : {count}).',
    many: 'La relecture NE diffère PAS seulement comme prévu (octets inattendus : {unexpected} ; octets manquants : {count}).',
    other:
      'La relecture NE diffère PAS seulement comme prévu (octets inattendus : {unexpected} ; octets manquants : {count}).',
  },
  'fpsOutcome.notTaken':
    'La relecture n’a pas été faite : le correctif n’est donc pas vérifié ici.',
  /*
   * After "Make N FPS in every bank": {done} of {count} banks, in {order}: the names inside a sentence
   * ("slot B, recovery R"), joined by common:list.comma.
   */
  'fpsEveryOutcome.title': {
    one: 'Tous les emplacements : {done} sur {count} corrigé, dans cet ordre : {order}.',
    many: 'Tous les emplacements : {done} sur {count} corrigés, dans cet ordre : {order}.',
    other: 'Tous les emplacements : {done} sur {count} corrigés, dans cet ordre : {order}.',
  },
  'fpsEveryOutcome.readBackOk': {
    one: 'La relecture ne diffère de l’emplacement enregistré qu’au {count} octet prévu.',
    many: 'La relecture ne diffère de l’emplacement enregistré qu’aux {count} octets prévus.',
    other: 'La relecture ne diffère de l’emplacement enregistré qu’aux {count} octets prévus.',
  },
  'fpsEveryOutcome.notTaken': 'La relecture n’a pas été faite.',
  /* {reason} is core's. */
  'fpsEveryOutcome.stopped': 'Arrêté : {reason}.',
  /* {banks}: the names inside a sentence ("slot B, recovery R"), joined by common:list.comma. */
  'fpsEveryOutcome.notWritten': 'Non écrits : {banks}.',

  /* The panel of the keys the writes use. */
  'keys.refusedTitle': 'Aucun emplacement de cette caméra ne peut être écrit d’ici.',
  'keys.title': 'Clés utilisées pour les écritures',
  'keys.chain': 'Chaîne',
  'keys.chainPlain':
    'la chaîne en clair de 2014 : chaque emplacement est stocké en clair, aucun ne contient donc de clé',
  /** Row label in "the keys the writes use": the form a write sends. */
  'keys.writtenAs': 'Écrit sous forme',
  'keys.writtenPlain': 'l’image telle quelle, sans clé, dans n’importe quel emplacement',
  /** Row label: the key the upload is encrypted under. */
  'keys.stagedAs': 'Transféré sous',
  /** Row label: the key the camera stores the image under. */
  'keys.storedAs': 'Stocké sous',
  'keys.refused': 'Refusé',
  'keys.bootedBank': 'Emplacement démarré',
  /* {bank} holds the key {key} ("Key A"). */
  'keys.bootedHolds': '{bank:ins} contient {key:acc}',
  'keys.theBootedBank': 'l’emplacement démarré',
  'keys.unnamedKey': 'une clé que la page ne sait pas nommer',
  'keys.bootedBanksKey': 'la clé de l’emplacement démarré',
  /* {line} is core's line naming the key every bank is written under. */
  'keys.writtenDerived': '{line} ; chaque emplacement est écrit de la même façon',

  /* "What these buttons do", below the tab. */
  'how.title': 'Ce que font ces boutons',
  'how.read':
    '**Lire les emplacements** et **Extraire** ne changent rien dans la caméra. La caméra est d’abord interrogée sur le build qu’elle exécute ; un build antérieur à {minVersion} est signalé, et ses emplacements ne sont pas lus.',
  'how.flash':
    '**Écrire l’image déchiffrée** prend une image en clair, la chiffre comme l’exige le firmware de cet emplacement avant de la transférer, et affiche le plan. **Écrire des octets bruts** transfère le fichier exactement tel quel. Ni l’un ni l’autre n’envoie quoi que ce soit avant votre confirmation.',
  /* FF = the 16 Hz "FF" build of the Compact; the vendor app = Seek's own phone app. */
  'how.ff':
    'Une Compact en 1.3.0.8 peut être le build 8 Hz ou le build FF 16 Hz, et les deux annoncent la même version. La caméra les distingue elle-même : sa propre réponse pour chaque emplacement dit si l’application qui répond l’accepte, et chaque build prévoit ses réponses. L’image 8 Hz va dans n’importe quel emplacement. L’image FF est transférée comme l’app du fabricant la transfère (l’image XOR la clé A), et le build 16 Hz la stocke sous la clé B, dans n’importe quel emplacement. La page ne la refuse pas : le plan indique, avant votre confirmation, ce que la caméra devrait en faire (le build 8 Hz la refuse à la validation, et une caméra d’une autre version la programme telle qu’elle est envoyée, et ne peut donc pas la démarrer). Le démarrage de l’image FF n’est PAS TESTÉ (UNTESTED) : aucun bootloader authentique de ce build ne figure dans le corpus. Écrire {letterR} demande la confirmation supplémentaire, comme toute écriture de l’emplacement de secours. Un emplacement **vide** (sa fenêtre d’en-tête se lit entièrement comme 0xFF, comme {b:acc} de nombreuses caméras de 2014) est un état, pas une panne. Il s’extrait sous forme des 64 Ko bruts de 0xFF, sans rien à déchiffrer, et s’écrit exactement comme n’importe quel autre emplacement ; le plan et la confirmation indiquent qu’aucun firmware n’est écrasé.',
  /* {copyA}, {copyB}, {copyR} are the three copy buttons' own labels (table.copyTo: "Copy to slot A"…). */
  'how.copy':
    '**{copyA}**, **{copyB}** et **{copyR}** sur la ligne d’un emplacement écrivent le firmware que contient cet emplacement, tel que cette lecture l’a déchiffré, dans l’autre emplacement, quel que soit son contenu actuel. L’image est transférée comme toute image déchiffrée : le plan et la confirmation sont donc les mêmes que pour un fichier. **Restaurer depuis une sauvegarde complète** prend un .bin (une image complète de 4 Mo de la flash, comme une lecture J-Link) ou un .zip qui en contient une (un fichier d’exécution Preserve, ou le zip qu’enregistre « Extraire et déchiffrer 4.x/Nano » ou « Extraire tous les sélecteurs »), en extrait cet emplacement, le déchiffre et affiche le plan ; une sauvegarde qui semble venir d’une autre caméra, ou d’un autre firmware, est signalée dans le plan. Un emplacement vide dans la sauvegarde, ou que le dump n’a pas lu, ne peut pas être restauré par une écriture, et la page le dit.',
  'how.fps':
    '**Passer à N FPS** sur la ligne d’un emplacement modifie l’image de cet emplacement pour une fréquence d’images plus élevée, et **Passer tous les emplacements à N FPS** le fait pour chaque emplacement où le correctif est disponible, en une seule confirmation, l’emplacement depuis lequel la caméra démarre actuellement en dernier. Pour un emplacement où il ne l’est pas, la page indique pourquoi.',
  /* {example} is a file name; keep it as it is. */
  'how.backup':
    '**Chaque écriture enregistre d’abord son emplacement** : l’emplacement est relu et enregistré dans un seul zip téléchargé, nommé d’après l’heure, le numéro de série de la caméra, le firmware, l’emplacement et l’écriture (par exemple `{example}`), qui contient l’emplacement tel que stocké, son image déchiffrée et une note sur chaque fichier. L’écriture attend que le téléchargement ait commencé. Un navigateur ne signale pas quand un téléchargement est arrivé sur le disque : vérifiez votre dossier de téléchargements. Pour revenir en arrière, écrivez le fichier déchiffré du zip avec **Écrire l’image déchiffrée**.',
  /* {address} is the bootloader's flash address. */
  'how.write':
    'Une écriture efface un emplacement de 64 Ko et le reprogramme. Le bootloader à `{address}` et la configuration de démarrage ne sont jamais écrits ici, et aucune commande ne permet de choisir l’emplacement actif. L’emplacement ne prend effet qu’une fois la caméra débranchée puis rebranchée.',
} satisfies Translation<'slots'>;
