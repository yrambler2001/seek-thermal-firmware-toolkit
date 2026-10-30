/**
 * Namespace `decrypt`, français (fr), translated from the English source.
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
  'status.noFile': 'Aucun fichier choisi.',
  'status.reading': 'Lecture du fichier…',
  'status.notUsable': 'Ce n’est pas un dump utilisable.',
  'status.building': 'Création de l’archive…',
  'status.nothingDecrypted':
    'Aucune image déchiffrée — voir le journal pour la raison. Le manifeste est dans vos téléchargements.',
  /* {count} is the number of slots found. */
  'status.done': {
    one: 'Terminé — {done}/{count} emplacement déchiffré. Vérifiez vos téléchargements.',
    many: 'Terminé — {done}/{count} emplacements déchiffrés. Vérifiez vos téléchargements.',
    other: 'Terminé — {done}/{count} emplacements déchiffrés. Vérifiez vos téléchargements.',
  },

  /* views/DecryptView: a whole dump. */
  'offline.title': 'Déchiffrer un dump que vous avez déjà',
  'offline.description':
    'Un dump complet de la mémoire flash, déchiffré emplacement par emplacement.',
  'offline.intro':
    'L’étape 2 de l’onglet 4.x/Nano déchiffre déjà tout ce qu’elle lit : vous n’avez besoin de cette partie que si votre image de la flash vient d’ailleurs — une exécution précédente, J-Link ou un programmateur SPI. Le fichier est lu localement et n’est jamais envoyé. **Cette partie fonctionne dans tous les navigateurs**, y compris Safari et iOS, car elle n’a besoin d’aucun accès USB.',
  'offline.actions': 'Actions de déchiffrement hors ligne',
  'offline.choose': 'Choisir le fichier de dump…',
  'offline.panel': 'Déchiffrement hors ligne',
  'offline.detectedTitle': 'Famille de firmware détectée',
  'offline.detectedIntro':
    'Aucune caméra n’est branchée : la famille est donc évaluée à partir des images du fichier lui-même. Dans tous les cas, la clé est calculée à partir du texte chiffré de chaque emplacement ; ceci ne sert qu’à nommer la famille de firmware dans le rapport.',
  'offline.scoreBasis': 'd’après les images du fichier',

  /* views/DecryptView: one firmware slot. <link> wraps the Slots tab's name. */
  'slot.title': 'Déchiffrer un emplacement de firmware',
  'slot.description': 'Un emplacement, depuis un fichier : 64 Ko, tel que la caméra le stocke.',
  'slot.intro':
    'Choisissez un fichier qui contient un emplacement de firmware — 65 536 octets, tel que l’enregistre l’extraction d’un emplacement dans l’onglet <link>{tab}</link>, ou les 64 Ko situés à l’adresse d’un emplacement dans un dump complet de la flash. La page trouve la clé à partir des octets de l’emplacement lui-même, déchiffre l’image et la propose au téléchargement en affichant la clé, la taille et le SHA-256. Aucune caméra n’est utilisée : cela fonctionne sans rien de branché.',
  'slot.refusedIntro':
    'Un fichier qui n’est pas un emplacement, ne contient aucune image de firmware ou ne se déchiffre pas est refusé, avec la raison. Un emplacement effacé est signalé comme tel et n’a rien à déchiffrer.',
  'slot.actions': 'Actions sur le fichier d’emplacement',
  'slot.choose': 'Choisir le fichier d’emplacement…',
  'slot.decrypting': 'Déchiffrement de {file}…',
  'slot.unreadable': 'Le fichier n’a pas pu être lu.',
  'slot.notDecrypted':
    'Non déchiffré : {file} n’est pas un emplacement de firmware que cette page sait déchiffrer.',
  'slot.nothingWritten':
    'Rien n’a été écrit nulle part. Choisissez un fichier d’emplacement de 64 Ko, ou un dump complet dans la section ci-dessus.',
  'slot.erased': '{file} est un emplacement effacé.',
  'slot.resultTitle': 'Emplacement de firmware déchiffré',
  'slot.file': 'Fichier',
  'slot.fileSize': 'Taille du fichier',
  'slot.fileSha': 'SHA-256 du fichier',
  'slot.imageVersion': 'Version de l’image',
  'slot.imageSize': 'Taille de l’image',
  'slot.imageSha': 'SHA-256 de l’image',
  /** Row label: the 32-bit word sum the bootloader checks on the decrypted image (a hex value follows). */
  'slot.acceptanceSum': 'Somme de contrôle',
  'slot.notComputed': 'non calculée pour cette forme',
  'slot.family': 'Famille',
  /* {name} is the family's name; the two notes are added after it. */
  'slot.familyDetected': '{name} (détectée d’après l’image)',
  'slot.familyMismatch':
    '{name} — la somme n’est pas la valeur attendue par cette famille : le bootloader n’accepterait pas l’image en l’état',
  'slot.unknown': 'inconnue',
  /* A byte count, already formatted for the reader's locale. */
  'slot.bytes': '{size} o',
  'slot.key': 'Clé',
  'slot.keyPlain': 'aucune : l’emplacement contient l’image en clair (la chaîne en clair de 2014)',
  'slot.keyFfB': 'clé B de la paire 1.3.0.8 FF',
  /** Row label: how the bank holds the image (under which key, or plain). */
  'slot.storedAs': 'Stockée sous forme',
  'slot.storedAsFfB': 'l’image XOR le flux de clé de la clé B, fenêtre d’en-tête telle quelle',
  'slot.keyNone': 'aucune',
  'slot.keyNamed': '{key} — {name}',
  /** Row label: what kind of key decrypted the bank (named, solved from the bytes, ...). */
  'slot.keyForm': 'Forme de la clé',
  /* {k} is "K=0x…" (or "K=" when unknown). */
  'slot.keyFormOnce':
    '{k} — l’image elle-même contient cette forme une seule fois, ce qui l’identifie',
  'slot.keyFormDefault':
    '{k} — aucune forme n’apparaît une seule fois dans l’image : la valeur par défaut de la famille est affichée',
  'slot.resultActions': 'Actions sur l’image déchiffrée',
  'slot.download': 'Télécharger {file}',
  'slot.downloadFallback': 'l’image déchiffrée',

  /* components/DetectionBox: which family the evidence points at. */
  'detection.detected': 'Détectée',
  'detection.score': 'Score',
  /* {score} is like 0.87; {basis} says what was scored (offline.scoreBasis, v4's identity.scoreBasis). */
  'detection.scoreText': '{score} sur 1.00, {basis}',
  'detection.readAs': 'Lue comme',
  'detection.summary': 'Résumé',
  'detection.why': 'Pourquoi :',
  'detection.ambiguous':
    '**Les indices n’ont pas permis de trancher sur la famille.** Soit la gagnante n’a pas fait mieux que la famille générique de repli, soit une autre est arrivée trop près pour départager. Le déchiffrement n’est pas touché — la clé est calculée à partir du texte chiffré dans tous les cas — mais la famille indiquée dans le rapport, et tout ce qui en dépend, reste une supposition.',
} satisfies Translation<'decrypt'>;
