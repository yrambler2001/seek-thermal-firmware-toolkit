/**
 * Namespace `v4`, français (fr), translated from the English source.
 *
 * Owner: phase 2, rest-of-page agent.
 * Covers: views/V4View.tsx, hooks/useDumpPanel.ts, components/CameraIdentity.tsx,
 * components/OptionsDetails.tsx, lib/options.ts.
 *
 * src/i18n/README.md has the conventions.
 */

import type { Translation } from '../../types';

export default {
  /* hooks/useDumpPanel: the status line. */
  'status.starting': 'Démarrage…',
  'status.building': 'Création de l’archive…',
  'status.cancelling': 'Annulation — ce qui a déjà été lu sera enregistré…',
  'status.refused': 'Refusé — rien n’a été lu. Voir le message au-dessus du journal.',
  'status.sweepDone':
    'Terminé — {armed}/{total} sélecteurs ouverts, {withData} avec des données. Vérifiez vos téléchargements.',
  'status.sweepDoneCancelled':
    'Terminé — {armed}/{total} sélecteurs ouverts, {withData} avec des données (annulé). Vérifiez vos téléchargements.',
  'status.dumpDone': 'Terminé — {read}/{expected} fenêtres lues. Vérifiez vos téléchargements.',
  'status.dumpDoneCancelled':
    'Terminé — {read}/{expected} fenêtres lues (annulé). Vérifiez vos téléchargements.',
  'status.dumpDoneIncomplete':
    'Terminé — {read}/{expected} fenêtres lues (incomplet — voir le journal). Vérifiez vos téléchargements.',

  /*
   * hooks/useDumpPanel: the refusals this tab makes itself. Shown on the page;
   * the run log keeps them in English. The quoted tab name is the 0.x/1.x tab's label.
   */
  'refusal.generic':
    'La caméra ne correspond pas à la famille 4.x/Nano, et cet onglet ne lit que cette famille. Rien n’a été lu. Pour une caméra 0.x ou 1.x (builds de 2014 ou 2016), utilisez « {tab} ».',
  'refusal.otherFamily':
    'La caméra ressemble à {name} ({id}), pas à une caméra 4.x/Nano, et cet onglet ne lit que les 4.x/Nano. Rien n’a été lu. Pour une caméra 0.x ou 1.x (builds de 2014 ou 2016), utilisez « {tab} ».',
  'refusal.legacyLine':
    'La caméra exécute {version}, un build 0.x ou 1.x (2014 ou 2016), et cet onglet ne lit que les 4.x/Nano. Seule la version a été lue. Pour une caméra 0.x ou 1.x, utilisez « {tab} ».',

  /* views/V4View: step 2, the dump. */
  'dump.title': 'Dump',
  'dump.actions': 'Actions de dump',
  'dump.start': 'Lancer le dump',
  'dump.panel': 'Dump',
  'dump.how':
    'Les deux demandent d’abord à la caméra quel firmware elle exécute : sa version, avec `{getInfo}` — la seule lecture à laquelle tous les builds Seek répondent de la même façon — puis, seulement si ce build peut être lu par USB, un `{begin}` simple et un autre porteur de jeton, et une seule lecture. C’est ainsi que la page reconnaît la famille de la caméra. Cet onglet ne lit que la famille 4.x et Nano. Une caméra que ces réponses placent ailleurs est refusée avant toute lecture, et la page indique l’onglet qui lui convient. Une caméra qui n’annonce pas sa version, ou qui exécute un build antérieur à 0.8.0.0, n’est pas lue du tout, et la page explique pourquoi.',
  'dump.modes':
    '**Lancer le dump** lit chaque bloc qu’atteint la table des sélecteurs propre au build. **Extraire tous les sélecteurs**, dans *Options* ci-dessous, essaie chaque sélecteur `{begin}` de `{first}` à `{last}` et enregistre ce que chacun renvoie — plus lent, mais cela récupère aussi les blocs que la table de référence ignore.',
  'dump.sweep': 'Extraire tous les sélecteurs ({first}–{last})',
  'dump.sweepNote':
    'Essaie chaque sélecteur et enregistre ce que chacun renvoie. Plus lent que Lancer le dump.',

  /* views/V4View: what the archive holds. File names stay as they are. */
  'output.title': 'Ce que vous obtenez',
  'output.intro': 'Un seul téléchargement `{ext}` qui contient :',
  'output.caption': 'Fichiers contenus dans l’archive téléchargée',
  'output.file': 'Fichier',
  'output.what': 'Contenu',
  'output.flash':
    'l’image assemblée de la mémoire flash de 4 Mo (le remplissage du trou et le jeton de déverrouillage, s’il a servi, sont dans manifest.json)',
  'output.windows': 'chaque bloc de 64 Ko exactement tel qu’il est arrivé par USB',
  'output.decrypted':
    'chaque emplacement d’image de firmware, déchiffré (si une clé a été trouvée)',
  'output.reports':
    'rapport par emplacement : clé, emplacement de la clé, famille et chiffrement, SP, point d’entrée, SHA-256',
  'output.manifest': 'métadonnées exactes de lecture, de trous et de déchiffrement',
  'output.readme': 'ce qu’est cette capture et quelles sont ses limites',
  'output.keyFromDump':
    'La clé est retrouvée à partir du dump lui-même : aucun fichier de clé ni secret de l’appareil n’est nécessaire.',
  'output.bestEffort':
    'Le déchiffrement reste au mieux. Si aucune clé n’est trouvée — par exemple sur un appareil dont le bootloader dérive la clé de l’OTP de la puce, absent d’un dump de la flash —, cet emplacement est simplement ignoré et le reste de l’archive n’est pas touché.',
  'gap.summary': 'Le trou à {address}',
  'gap.where':
    'Le jeu de commandes USB offre un sélecteur de fenêtre de lecture pour chaque bloc de 64 Ko de la mémoire flash de 4 Mo, sauf `{range}`. Ce bloc est rempli avec `{fill}` dans l’image assemblée et consigné dans `{manifest}`.',
  'gap.costs':
    '**En pratique, cela ne vous coûte rien.** Sur la plupart des caméras, ce bloc est simplement de la flash effacée, qui se lit de toute façon comme `{fill}` — le remplissage correspond donc à ce qui s’y trouve vraiment, et l’image est complète.',
  'gap.redundant':
    'Et quand le bloc *est* utilisé, son contenu est une copie redondante. Ces caméras gardent la même image de firmware dans plusieurs emplacements de 64 Ko : dans tous les dumps à plusieurs emplacements vérifiés pendant la création de cette page, tous les emplacements se sont déchiffrés en un firmware identique octet pour octet — dans un cas, sur quatre emplacements écrits avec deux clés différentes. Sur le seul appareil vu avec une vraie image à `{address}`, elle était identique octet pour octet aux copies situées à `{before}` et `{after}` : l’archive contient donc quand même ce firmware, simplement lu à une autre adresse.',
  'gap.fine':
    'C’est aussi grâce à cette redondance qu’une caméra dont le bloc `{address}` se relit comme `{fill}` n’a pas de problème : le firmware démarrable existe toujours dans les autres emplacements. De toute façon, rien dans cet onglet n’écrit dans l’appareil — le trou ne concerne que le fichier que vous téléchargez.',
  'gap.complete':
    'Si vous voulez vraiment une image complète octet pour octet — pour comparer la flash à une référence, par exemple —, lisez-la par SWD/J-Link ou avec un programmateur SPI.',

  /* components/CameraIdentity: what the camera said before the dump. */
  'identity.versionUnknown': 'Non lue : la caméra n’a pas dit quel firmware elle exécute.',
  'identity.unsupported': 'Non lue : cette caméra ne peut pas être lue de cette façon.',
  'identity.title': 'Caméra détectée',
  'identity.firmware': 'Firmware',
  'identity.scoreBasis': 'd’après les réponses de la caméra, avant la lecture de tout emplacement',

  /*
   * components/OptionsDetails and lib/options: the read options. The option
   * names (chunk, gap-fill, recipient) are the original page's and the CLI's.
   */
  'options.title': 'Options',
  'options.subtitle': '— les valeurs par défaut sont correctes ; vous n’avez rien à changer ici.',
  'options.chunk': 'chunk (octets control-IN)',
  /** Option label: the byte value written where a window could not be read (0xFF by default). */
  'options.gapFill': 'octet gap-fill',
  'options.retries': 'nouveaux essais par fenêtre',
  'options.retryDelay': 'délai entre essais (ms)',
  'options.recipient': 'destinataire du transfert de contrôle (recipient)',
  /** A choice in the USB recipient option: chosen automatically. */
  'options.recipientAuto': 'auto',
  'options.recipientInterface': 'interface ({requestTypes})',
  'options.recipientDevice': 'device ({requestTypes})',
  'options.decrypt': 'déchiffrer le firmware',
  /** A choice of the "decrypt firmware" option: "yes". */
  'options.yes': 'oui',
  /** A choice of the "decrypt firmware" option: "no". */
  'options.no': 'non',
  'options.help':
    '**chunk** est la taille de chaque lecture control-IN, 64 au plus : un paquet EP0. Une lecture plus longue peut perdre un paquet dans la ROM de démarrage de la caméra quand celle-ci tourne au ralenti à basse fréquence ; une valeur plus grande est donc lue 64 octets à la fois. Une valeur plus petite est utilisée telle quelle, et si une caméra bloque, la page descend d’elle-même plus bas et continue. **gap-fill** est l’octet écrit dans l’unique bloc de 64 Ko que l’USB ne peut pas atteindre. **recipient** vaut interface par défaut et passe à device si le navigateur ne peut pas réserver l’interface 0 — le firmware accepte les deux.',
  'options.chunkRange': 'chunk doit être compris entre 1 et {max}, reçu {value}',
  'options.gapFillByte': 'gap-fill doit être un seul octet, reçu {value}',
  'options.retriesMin': 'le nombre de nouveaux essais doit être zéro ou plus, reçu {value}',
  'options.retryDelayMin': 'le délai entre essais doit être zéro ou plus, reçu {value}',
} satisfies Translation<'v4', 'fr'>;
