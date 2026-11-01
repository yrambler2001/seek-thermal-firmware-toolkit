/**
 * Namespace `info`, français (fr), translated from the English source.
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
  'status.notRead': 'Pas encore lue.',
  'status.reading': 'Lecture…',
  'status.noVersion': 'Aucune version annoncée.',
  'status.tooOld': 'Lue. Le firmware {version} est antérieur à 0.8.0.0 — rien d’autre n’a été lu.',
  'status.read': 'Lue. Firmware {version}.',

  /* views/InfoView: step 2, read the camera. "seek-fw info" is the CLI command. */
  'read.title': 'Lire la caméra',
  'read.description':
    'Lecture seule. Demande à la caméra ce qu’elle exécute, comment elle démarre, quelles clés elle détient et ce que contient chaque emplacement : la même lecture que seek-fw info. Rien n’est écrit.',
  'read.actions': 'Actions Infos',
  'read.button': 'Lire la version du firmware',
  'read.connectFirst':
    'Connectez d’abord la caméra ci-dessus, puis appuyez sur Lire la version du firmware.',
  'read.showDetails': 'Afficher les détails dans le journal',
  'read.panel': 'Version du firmware',
  'result.title': 'Ce que la caméra annonce',
  'result.version': 'Version du firmware',
  'result.build': 'Build',
  'result.range': 'Plage de versions',
  'result.tab': 'Onglet pour cette caméra',
  'result.rangeLegacy': '0.x / 1.x : les caméras de 2014 et 2016',
  'result.rangeModern': '2.x et plus récent : les caméras 4.x, Nano et Mosaic',
  'result.rangeUnknown': 'inconnue',
  'result.noVersion':
    '**La caméra n’a pas annoncé sa version de firmware.** Rien d’autre n’a été envoyé. Débranchez-la, rebranchez-la, laissez-la finir de démarrer et relancez la lecture.',
  'result.noTab': 'Aucun onglet ne lit ce build.',
  /* <tab> wraps the tab's name, a link to it. */
  'result.openTab':
    'Ouvrez <tab>{tab}</tab> pour cette caméra. Cet onglet redemande à la caméra quelle est sa famille avant toute lecture, et refuse une caméra qui n’est pas de la famille qu’il couvre.',

  /* views/InfoView: what each tab is for. */
  'tabs.title': 'À quoi sert chaque onglet',
  'tabs.intro':
    'Cinq onglets, dans cet ordre. Chacun est une page à part entière, et l’en-tête indique celui où vous vous trouvez.',
  'tabs.caption': 'Les onglets, ce qu’ils font, les caméras qu’ils couvrent et s’ils écrivent',
  'tabs.tab': 'Onglet',
  'tabs.does': 'Ce qu’il fait',
  'tabs.cameras': 'Caméras',
  'tabs.writes': 'Écrit dans la caméra ?',
  'tabs.info.does':
    'Lit ce que la caméra annonce : son firmware, la famille sous laquelle elle répond, sa façon de démarrer, ses clés et chaque emplacement. La même lecture que seek-fw info. Il n’écrit rien.',
  'tabs.info.cameras': 'Toute caméra Seek que WebUSB peut ouvrir.',
  /** A table cell answering "Writes to the camera?" for this tab: the word "no", not "number". */
  'tabs.info.writes': 'Non.',
  'tabs.preserve.does':
    'Fait une copie complète de la mémoire flash de 4 Mo de la caméra, avec un fichier d’exécution enregistré après chaque étape. Pour tout lire, il corrige le firmware pour un temps, puis remet en place le firmware d’origine et le vérifie. Il vous guide étape par étape.',
  'tabs.preserve.cameras':
    'Caméras en firmware 0.x et 1.x : les builds Compact de 2014, les builds Compact PRO de 2016 (1.0.3.x) et le build Compact 1.3.0.8 FF (16 Hz).',
  'tabs.preserve.writes':
    'Oui, en deux étapes, et chacune demande d’abord confirmation. Il remet la caméra dans l’état où elle était.',
  'tabs.v4.does':
    'Lit toute la mémoire flash d’une caméra 4.x ou Nano et déchiffre les emplacements de firmware qu’il y trouve. Lecture seule : il envoie six commandes de lecture et aucune écriture.',
  'tabs.v4.cameras':
    'Caméras en firmware 4.x (Compact, Compact PRO, Compact XR), Mosaic (10.x et 2.x) et Nano (42.x et 44.x), à partir de 2018.',
  /** The same answer, "no", for the 4.x tab. */
  'tabs.v4.writes': 'Non.',
  'tabs.decrypt.does':
    'Déchiffre un fichier que vous avez déjà : un dump complet, emplacement par emplacement, ou un seul emplacement de firmware de 64 Ko. Le résultat peut être téléchargé.',
  'tabs.decrypt.cameras':
    'Aucune. Il n’utilise pas de caméra : il fonctionne sans rien de branché et dans n’importe quel navigateur.',
  'tabs.decrypt.writes': 'Non. Il n’écrit que le fichier téléchargé.',
  'tabs.slots.does':
    'Lit les trois emplacements de firmware (emplacement A, emplacement B et emplacement de secours R), montre ce que contient chacun et celui depuis lequel la caméra démarre, et peut extraire ou écrire un emplacement à la fois.',
  'tabs.slots.cameras': 'Caméras en firmware 0.8.0.0 et plus récent.',
  'tabs.slots.writes':
    'Oui, un emplacement à la fois, et chaque écriture demande d’abord confirmation.',

  /*
   * components/CameraReport: the page's panels after a read (labels only).
   * Row values that are sentences come from core and stay as core wrote them.
   */
  'report.camera': 'Caméra',
  'report.product': 'Produit',
  'report.manufacturer': 'Fabricant',
  'report.serial': 'N° de série',
  'report.platform': 'Plateforme',
  'report.usbLink': 'Liaison USB',
  'report.noProduct': '(pas de nom de produit)',
  'report.none': '(aucun)',
  'report.unreadable': '(illisible)',
  'report.firmware': 'Firmware',
  'report.running': 'En cours',
  'report.bootloader': 'Bootloader',
  'report.family': 'Famille de firmware',
  /** Row label: the firmware family the read used (its name follows, in English). */
  'report.readUnder': 'Lu comme',
  'report.detected': 'Détectée',
  'report.boot': 'Démarrage',
  'report.booted': 'Démarrée depuis',
  'report.lastStart': 'Dernier démarrage',
  /** Row label: which of the two 1.3.0.8 builds (8 Hz or FF 16 Hz) the camera runs. */
  'report.running1308': 'En cours (1.3.0.8)',
  'report.nextStart': 'Prochain démarrage',
  'report.upgradeTarget': 'Cible de mise à jour',
  /** Value: the camera was not asked for its upgrade target, so there is none to show. */
  'report.notReplayed': '(non demandée)',
  'report.targetConfirmed': '{slot} (confirmé par la caméra)',
  /* {why} is core's reason. */
  'report.buildNotKnown':
    'inconnu : {why}. Une image FF 16 Hz exige que la caméra dise quel build elle exécute (l’onglet des emplacements le demande)',
  'report.buildWhy': '{build} : {why}',
  'report.buildFf': 'le build 1.3.0.8 FF 16 Hz',
  'report.build8Hz': 'le build 1.3.0.8 8 Hz',
  'report.keys': 'Clés',
  'report.slots': 'Emplacements',
  'report.slotsCaption':
    'Chaque emplacement tel que la lecture l’a trouvé. Lecture seule : c’est l’onglet des emplacements qui écrit.',
  'report.slot': 'Emplacement',
  'report.address': 'Adresse',
  'report.version': 'Version',
  'report.size': 'Taille',
  'report.key': 'Clé',
  /** Column of the bank table: which keys the bootloader accepts the bank under. */
  'report.accepts': 'Accepte',
  /** Column: whether the image's footer (the checksum block after the image) is right. */
  'report.footer': 'Pied',
  /** Column: whether the bootloader would start this bank. */
  'report.bootable': 'Démarrable',
  'report.bytes': '{count} o',
  'report.plaintext': 'aucune (en clair)',
  /** A table value, lower case: "yes". */
  'report.yes': 'oui',
  /** A table value, lower case: "no". */
  'report.no': 'non',
  /* Where the bootloader reads no footer. */
  'report.notApplicable': 's.o.',
  /* {reason} is core's. */
  'report.slotReason': '{slot} : {reason}',
  'report.writing': 'Écriture',
  'report.noBankWritten': 'Aucun emplacement de cette caméra n’est écrit :',
  /*
   * The Writing panel: how each bank is staged, one sentence per staging form (core's report.staged.*
   * says the same clause after "each bank" for the CLI).
   */
  'report.oneBank.plain':
    'Un emplacement à la fois : l’onglet des emplacements écrit ou corrige un emplacement de cette caméra, chacun étant transféré en clair (l’image telle quelle, sans clé), et chaque écriture demande d’abord confirmation.',
  'report.oneBank.slotKeystream':
    'Un emplacement à la fois : l’onglet des emplacements écrit ou corrige un emplacement de cette caméra, chacun étant transféré sous le bloc de clés 0 propre à son image, et chaque écriture demande d’abord confirmation.',
  'report.oneBank.keyA':
    'Un emplacement à la fois : l’onglet des emplacements écrit ou corrige un emplacement de cette caméra, chacun étant transféré sous des clés dérivées de l’emplacement démarré et de l’application en cours, et chaque écriture demande d’abord confirmation.',
  'report.oneBank.ffVendor':
    'Un emplacement à la fois : l’onglet des emplacements écrit ou corrige un emplacement de cette caméra, chacun étant transféré comme l’app du fabricant transfère l’image FF 16 Hz (l’image XOR son propre bloc de clés 0), et stocké par la caméra sous la clé B, et chaque écriture demande d’abord confirmation.',
  'report.refusesEvery': 'L’onglet des emplacements refuse chaque emplacement de cette caméra :',
} satisfies Translation<'info', 'fr'>;
